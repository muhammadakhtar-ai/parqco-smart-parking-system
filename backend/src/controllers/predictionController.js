import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { getTodayForecast, getWeeklyPeaks } from '../services/predictionService.js';
import { predictSlotsAt } from '../services/slotPredictionService.js';

export const todayForecast = asyncHandler(async (_req, res) => {
  res.json({ success: true, forecast: await getTodayForecast() });
});

export const weeklyPeaks = asyncHandler(async (_req, res) => {
  res.json({ success: true, weekly: await getWeeklyPeaks() });
});

/** GET /api/predictions/slots?at=<ISO time> — which slot will be free at that time. */
export const slotPredictions = asyncHandler(async (req, res) => {
  const at = req.query.at ? new Date(req.query.at) : new Date(Date.now() + 60 * 60 * 1000);
  if (Number.isNaN(at.getTime())) throw new ApiError(400, 'Please provide a valid "at" time.');
  res.json({ success: true, prediction: await predictSlotsAt(at) });
});