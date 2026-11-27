import { z } from 'zod';
import Slot from '../models/Slot.js';
import Booking from '../models/Booking.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { withLiveStatus, completeFinishedBookings } from '../services/slotStatus.js';
import { getNextFreeInfo } from '../services/nextFreeService.js';
import { generateAutoSlot } from '../services/autoSlotService.js';
import { broadcast } from '../sockets/io.js';

export const slotSchema = z.object({
  slotId: z.string().trim().min(2, 'Slot ID is required'),
  zone: z.string().trim().min(1, 'Zone is required'),
  floor: z.coerce.number().int().min(0),
  sensorId: z.string().trim().min(2, 'Sensor ID is required'),
  hourlyRate: z.coerce.number().min(0).default(100),
  status: z.enum(['available', 'occupied', 'maintenance']).optional(),
  controlMode: z.enum(['auto', 'manual']).optional(),
  sensorType: z.enum(['virtual', 'real']).optional(),
  slotSource: z.enum(['seed', 'admin', 'auto-system']).optional(),
});

export const autoGenerateSchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
});

/** Public: headline numbers for the landing page. */
export const getSummary = asyncHandler(async (_req, res) => {
  await completeFinishedBookings();
  const slots = await withLiveStatus(await Slot.find());
  const count = (status) => slots.filter((slot) => slot.liveStatus === status).length;
  const occupied = count('occupied');
  const reserved = count('reserved');
  const nextFree = await getNextFreeInfo();
  res.json({
    success: true,
    summary: {
      total: slots.length,
      available: count('available'),
      occupied,
      reserved,
      maintenance: count('maintenance'),
      busy: occupied + reserved,
      // Exact, from real booking end times:
      nextFree: nextFree.nextFree,
      upcomingFreeing: nextFree.upcomingFreeing,
      freeingIn30Min: nextFree.freeingIn30Min,
      freeingIn60Min: nextFree.freeingIn60Min,
      // Estimate only, from the last-28-days pattern — never mix this with the exact numbers above:
      forecastEstimate: { expectedFreeNextHour: nextFree.expectedFreeNextHour },
    },
  });
});

/** All slots with their live status (GET /api/slots). */
export const listSlots = asyncHandler(async (_req, res) => {
  await completeFinishedBookings();
  const slots = await Slot.find().sort({ slotId: 1 });
  res.json({ success: true, slots: await withLiveStatus(slots) });
});

/**
 * Slots that can be booked for a time window (GET /api/slots/availability?start=&end=).
 * A slot is bookable when it is not in maintenance, has no overlapping booking,
 * and (if the window includes "now") is not physically occupied right now.
 */
export const checkAvailability = asyncHandler(async (req, res) => {
  const start = new Date(req.query.start);
  const end = new Date(req.query.end);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    throw new ApiError(400, 'Please provide a valid start and end time.');
  }

  const overlapping = await Booking.find({
    status: 'confirmed',
    startTime: { $lt: end },
    endTime: { $gt: start },
  }).select('slotId');
  const bookedIds = new Set(overlapping.map((booking) => booking.slotId));

  const now = new Date();
  const windowIncludesNow = start <= now && end > now;

  const slots = await Slot.find().sort({ slotId: 1 });
  const result = slots.map((slot) => {
    let unavailableReason = null;
    if (slot.status === 'maintenance') unavailableReason = 'Under maintenance';
    else if (bookedIds.has(slot.slotId)) unavailableReason = 'Already booked';
    else if (windowIncludesNow && slot.status === 'occupied') unavailableReason = 'Occupied now';
    return { ...slot.toObject(), bookable: !unavailableReason, unavailableReason };
  });

  res.json({ success: true, slots: result });
});

/**
 * POST /api/slots/auto-generate (logged-in user).
 * First checks whether any existing slot is bookable for the requested time.
 * Only when every slot is busy AND the lot is below the 60-slot maximum does
 * the system create a new virtual overflow slot for this user.
 */
export const autoGenerateSlot = asyncHandler(async (req, res) => {
  const now = new Date();
  const start = req.body.start ? new Date(req.body.start) : now;
  const end = req.body.end ? new Date(req.body.end) : new Date(now.getTime() + 60 * 60 * 1000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    throw new ApiError(400, 'Please provide a valid start and end time.');
  }

  const result = await generateAutoSlot({ start, end });
  if (result.reason === 'SLOT_AVAILABLE') {
    return res.json({
      success: true,
      created: false,
      message: `Slot ${result.slot.slotId} is already free for this time — no new slot was needed.`,
      slot: result.slot,
    });
  }
  if (result.reason === 'LOT_AT_MAX') {
    throw new ApiError(409, 'Parking is full and the 60-slot maximum is reached. Please use the Next Free time or join the waitlist.');
  }
  broadcast('slot:update', { slotId: result.slot.slotId });
  res.status(201).json({
    success: true,
    created: true,
    message: `All slots were busy, so a new virtual slot ${result.slot.slotId} was generated for you (${result.slot.zone}, Rs ${result.slot.hourlyRate}/hr).`,
    slot: result.slot,
  });
});

// ---------------- Admin only ----------------
export const createSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.create({ slotSource: 'admin', ...req.body });
  broadcast('slot:update', { slotId: slot.slotId });
  res.status(201).json({ success: true, slot });
});

export const updateSlot = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  // An admin changing the status by hand takes manual control of the slot:
  // the virtual sensor / simulator must not overwrite it afterwards.
  if (updates.status && !updates.controlMode) updates.controlMode = 'manual';
  const slot = await Slot.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!slot) throw new ApiError(404, 'Slot not found.');
  broadcast('slot:update', { slotId: slot.slotId, status: slot.status });
  res.json({ success: true, slot });
});

export const deleteSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.findByIdAndDelete(req.params.id);
  if (!slot) throw new ApiError(404, 'Slot not found.');
  broadcast('slot:update', { slotId: slot.slotId });
  res.json({ success: true, message: 'Slot deleted.' });
});
