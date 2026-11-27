import Slot from '../models/Slot.js';
import Booking from '../models/Booking.js';
import SensorData from '../models/SensorData.js';

/**
 * Per-slot prediction for one target time.
 * Two kinds of answer, always kept separate:
 *  - EXACT: a confirmed booking covers the target time -> the slot is NOT free,
 *    and we know exactly until when (bookedUntil).
 *  - PROBABILITY: no booking covers it -> the chance this slot is free, from
 *    this slot's own last-28-days sensor history at the same hour and the
 *    same day type (weekday / weekend). This is a likelihood, not a promise.
 */
export async function predictSlotsAt(target) {
  const slots = await Slot.find().sort({ slotId: 1 });

  const covering = await Booking.find({
    status: 'confirmed',
    startTime: { $lte: target },
    endTime: { $gt: target },
  }).select('slotId endTime');
  const bookedUntil = new Map(covering.map((booking) => [booking.slotId, booking.endTime]));

  const since = new Date(target.getTime() - 28 * 24 * 60 * 60 * 1000);
  const readings = await SensorData.find({ timestamp: { $gte: since } }).select('slotId occupied timestamp');
  const targetHour = target.getHours();
  const targetWeekend = [0, 6].includes(target.getDay());
  const matches = (reading) =>
    reading.timestamp.getHours() === targetHour &&
    [0, 6].includes(reading.timestamp.getDay()) === targetWeekend;

  const lotMatching = readings.filter(matches);
  const lotFreeRatio = lotMatching.length
    ? 1 - lotMatching.reduce((sum, reading) => sum + reading.occupied, 0) / lotMatching.length
    : 0.5;

  const predictions = slots.map((slot) => {
    if (slot.status === 'maintenance') {
      return { slotId: slot.slotId, zone: slot.zone, floor: slot.floor, state: 'maintenance', probabilityFree: 0, bookedUntil: null };
    }
    if (bookedUntil.has(slot.slotId)) {
      return { slotId: slot.slotId, zone: slot.zone, floor: slot.floor, state: 'booked', probabilityFree: 0, bookedUntil: bookedUntil.get(slot.slotId) };
    }
    const own = readings.filter((reading) => reading.slotId === slot.slotId && matches(reading));
    const probabilityFree = own.length
      ? Math.round((1 - own.reduce((sum, reading) => sum + reading.occupied, 0) / own.length) * 100) / 100
      : lotFreeRatio;
    return {
      slotId: slot.slotId,
      zone: slot.zone,
      floor: slot.floor,
      state: probabilityFree >= 0.5 ? 'likely-free' : 'likely-busy',
      probabilityFree,
      bookedUntil: null,
    };
  });

  predictions.sort((a, b) => b.probabilityFree - a.probabilityFree);

  return {
    at: target,
    totalSlots: slots.length,
    maxSlots: 60,
    likelyFreeCount: predictions.filter((slot) => slot.state === 'likely-free').length,
    slots: predictions,
  };
}
