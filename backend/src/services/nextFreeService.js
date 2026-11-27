import Booking from '../models/Booking.js';
import Slot from '../models/Slot.js';
import SensorData from '../models/SensorData.js';

/**
 * Exact next-free information, worked out from real booking end times,
 * plus one clearly separate forecast estimate for the next hour.
 * Exact numbers and estimates are never mixed together.
 */
export async function getNextFreeInfo() {
  const now = new Date();

  // Bookings running right now free their slot exactly at their endTime.
  const running = await Booking.find({
    status: 'confirmed',
    startTime: { $lte: now },
    endTime: { $gt: now },
  }).sort({ endTime: 1 });

  const upcomingFreeing = running.slice(0, 5).map((booking) => ({
    slotId: booking.slotId,
    freeAt: booking.endTime,
    inMinutes: Math.max(1, Math.ceil((booking.endTime - now) / 60000)),
  }));

  const within = (minutes) =>
    running.filter((booking) => booking.endTime - now <= minutes * 60000).length;

  // Forecast estimate ONLY: average occupancy at the next hour over the last 28 days.
  const totalSlots = await Slot.countDocuments();
  const since = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
  const isWeekend = [0, 6].includes(nextHour.getDay());
  const readings = await SensorData.find({ timestamp: { $gte: since } }).select('occupied timestamp');
  const matching = readings.filter((reading) => {
    const readingWeekend = [0, 6].includes(reading.timestamp.getDay());
    return reading.timestamp.getHours() === nextHour.getHours() && readingWeekend === isWeekend;
  });
  const occupancyRatio = matching.length
    ? matching.reduce((sum, reading) => sum + reading.occupied, 0) / matching.length
    : 0;
  const expectedFreeNextHour = Math.max(0, Math.round((1 - occupancyRatio) * totalSlots));

  return {
    nextFree: upcomingFreeing[0] || null,
    upcomingFreeing,
    freeingIn30Min: within(30),
    freeingIn60Min: within(60),
    expectedFreeNextHour,
  };
}
