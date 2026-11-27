import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Lightbulb } from 'lucide-react';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import ForecastChart from '../components/ForecastChart.jsx';
import { Alert, Loading } from '../components/Feedback.jsx';
import { errorMessage, formatDateTime } from '../utils/format.js';

export default function Predictions() {
  const [forecast, setForecast] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [error, setError] = useState('');
  const [hoursAhead, setHoursAhead] = useState(2);
  const [slotPrediction, setSlotPrediction] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/predictions/today'), api.get('/predictions/weekly')])
      .then(([today, week]) => {
        setForecast(today.data.forecast);
        setWeekly(week.data.weekly);
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  // Per-slot prediction: which slot will be free at the chosen future time.
  useEffect(() => {
    const at = new Date(Date.now() + hoursAhead * 60 * 60 * 1000).toISOString();
    api.get('/predictions/slots', { params: { at } })
      .then((r) => setSlotPrediction(r.data.prediction))
      .catch(() => {});
  }, [hoursAhead]);

  if (error) return <div className="container page"><Alert>{error}</Alert></div>;
  if (!forecast) return <Loading label="Running the forecast…" />;

  const averageConfidence = Math.round(forecast.points.reduce((sum, point) => sum + point.confidence, 0) / forecast.points.length);

  return (
    <div className="container page">
      <PageHeader title="Parking forecast" subtitle={`Predicted occupancy for today, learned from ${forecast.sampleDays} days of sensor data.`} />

      <div className="stats">
        <StatCard label="Busiest window" value={forecast.peak.label} note="Highest expected demand" />
        <StatCard label="Peak occupancy" value={`${forecast.peak.occupancy}%`} tone="busy" note="Share of slots in use" />
        <StatCard label="Model confidence" value={`${averageConfidence}%`} tone="free" note={`Model ${forecast.modelVersion}`} />
      </div>

      <section className="card">
        <div className="card__head">
          <h2>Hourly occupancy today</h2>
          <ul className="legend">
            <li><i className="legend__dot legend__dot--peak" />Peak window</li>
            <li><i className="legend__dot legend__dot--now" />Now</li>
          </ul>
        </div>
        <ForecastChart forecast={forecast} />
      </section>

      <section className="card">
        <div className="card__head">
          <h2>Which slot will be free?</h2>
          <label className="field">
            <span>In how many hours?</span>
            <select className="input" value={hoursAhead} onChange={(e) => setHoursAhead(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => <option key={value} value={value}>{value} {value === 1 ? 'hour' : 'hours'}</option>)}
            </select>
          </label>
        </div>
        {slotPrediction ? (
          <>
            <p className="muted">
              At {formatDateTime(slotPrediction.at)} — <strong>{slotPrediction.likelyFreeCount} of {slotPrediction.totalSlots} slots</strong> likely free.
              Slots marked "Booked until" are exact (real bookings). The percentages are chances from each slot's own last-28-days history — a likelihood, not a promise.
            </p>
            <ul className="mini-list">
              {slotPrediction.slots.slice(0, 10).map((slot) => (
                <li key={slot.slotId}>
                  <strong>{slot.slotId}</strong>
                  <span>
                    {slot.state === 'booked'
                      ? `Booked until ${formatDateTime(slot.bookedUntil)} (exact)`
                      : slot.state === 'maintenance'
                        ? 'Under maintenance'
                        : `${Math.round(slot.probabilityFree * 100)}% chance free · ${slot.zone}`}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="muted">Loading slot prediction…</p>
        )}
      </section>

      <div className="two-col">
        <section className="card">
          <h2>What to expect</h2>
          <ul className="insights">
            {forecast.insights.map((insight) => (
              <li key={insight}><Lightbulb size={18} /><span>{insight}</span></li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>Busiest hour by weekday</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#E3E5E1" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip formatter={(value, _name, item) => [`${value}% at ${item.payload.peakLabel}`, 'Peak']} />
              <Bar dataKey="occupancy" fill="#16191F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
