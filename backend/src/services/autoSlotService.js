import Slot from '../models/Slot.js';
import Booking from '../models/Booking.js';

// Hard cap from the layout: 6 zones x 10 slots. The system never creates slot 61.
export const MAX_TOTAL_SLOTS = 60;
const SLOTS_PER_FLOOR = 10;

// Floor 1 is closest to the exit, so it costs more (same rule as the seed).
const FLOORS = [
  { letter: 'A', floor: 1, zone: 'Zone A', base: 101, hourlyRate: 150 },
  { letter: 'B', floor: 2, zone: 'Zone B', base: 201, hourlyRate: 100 },
  { letter: 'C', floor: 3, zone: 'Zone C', base: 301, hourlyRate: 100 },
  { letter: 'D', floor: 4, zone: 'Zone D', base: 401, hourlyRate: 100 },
  { letter: 'E', floor: 5, zone: 'Zone E', base: 501, hourlyRate: 100 },
  { letter: 'F', floor: 6, zone: 'Zone F', base: 601, hourlyRate: 100 },
];

/**
 * Generates one new virtual overflow slot — but only after proving that no
 * existing slot is bookable for the requested window (same rules as
 * checkAvailability) and that the 60-slot maximum has not been reached.
 * Zone, floor and hourly fee are chosen automatically.
 */
export async function generateAutoSlot({ start, end }) {
  const slots = await Slot.find();

  // Step 1: is any existing slot bookable for this window?
  const overlapping = await Booking.find({
    status: 'confirmed',
    startTime: { $lt: end },
    endTime: { $gt: start },
  }).select('slotId');
  const bookedIds = new Set(overlapping.map((booking) => booking.slotId));
  const now = new Date();
  const windowIncludesNow = start <= now && end > now;

  const bookable = slots.find(
    (slot) =>
      slot.status !== 'maintenance' &&
      !bookedIds.has(slot.slotId) &&
      !(windowIncludesNow && slot.status === 'occupied')
  );
  if (bookable) return { created: false, reason: 'SLOT_AVAILABLE', slot: bookable };

  // Step 2: every slot is busy — but the lot has a hard maximum.
  if (slots.length >= MAX_TOTAL_SLOTS) return { created: false, reason: 'LOT_AT_MAX' };

  // Step 3: pick the floor with the fewest slots (lowest floor wins a tie),
  // then the first free number in that floor's pattern (e.g. A-101 ... A-110).
  const usedIds = new Set(slots.map((slot) => slot.slotId));
  const candidates = FLOORS.map((config) => ({
    ...config,
    count: slots.filter((slot) => slot.slotId.startsWith(`${config.letter}-`)).length,
  }))
    .filter((config) => config.count < SLOTS_PER_FLOOR)
    .sort((a, b) => a.count - b.count || a.floor - b.floor);

  const chosen = candidates[0];
  const number = Array.from({ length: SLOTS_PER_FLOOR }, (_, i) => chosen.base + i).find(
    (n) => !usedIds.has(`${chosen.letter}-${n}`)
  );

  const slot = await Slot.create({
    slotId: `${chosen.letter}-${number}`,
    zone: chosen.zone,
    floor: chosen.floor,
    sensorId: `SENSOR_${chosen.letter}${number}`,
    hourlyRate: chosen.hourlyRate,
    status: 'available',
    controlMode: 'auto',
    sensorType: 'virtual',
    slotSource: 'auto-system',
  });
  return { created: true, slot };
}
