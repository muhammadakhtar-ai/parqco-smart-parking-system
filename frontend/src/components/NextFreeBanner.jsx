import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { formatDateTime } from '../utils/format.js';

/**
 * Next Free banner for the Dashboard.
 * Exact freeing times come from real booking end times.
 * The forecast number is an estimate and is always labelled as one.
 */
export default function NextFreeBanner() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const load = () => api.get('/slots/summary').then((r) => setSummary(r.data.summary)).catch(() => {});
    load();
    const timer = setInterval(load, 60000); // refresh every minute
    return () => clearInterval(timer);
  }, []);

  if (!summary) return null;

  if (summary.available > 0) {
    return (
      <section className="card">
        <h2>Parking right now</h2>
        <p className="forecast-peak"><strong>{summary.available}</strong> of {summary.total} slots are free right now.</p>
        <p className="muted">Estimate for the next hour: about {summary.forecastEstimate.expectedFreeNextHour} slots expected to be free (based on the last 28 days pattern).</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Parking is full</h2>
      {summary.nextFree ? (
        <p className="forecast-peak">
          Next slot free: <strong>{summary.nextFree.slotId}</strong> at {formatDateTime(summary.nextFree.freeAt)} (in {summary.nextFree.inMinutes} min) — exact, from a confirmed booking.
        </p>
      ) : (
        <p className="muted">No bookings are running right now, so no exact freeing time is known yet.</p>
      )}
      <p className="muted">{summary.freeingIn30Min} slot(s) freeing within 30 min · {summary.freeingIn60Min} within 60 min</p>
      {summary.upcomingFreeing.length > 0 && (
        <ul className="mini-list">
          {summary.upcomingFreeing.map((freeing) => (
            <li key={`${freeing.slotId}-${freeing.freeAt}`}>
              <strong>{freeing.slotId}</strong>
              <span>{formatDateTime(freeing.freeAt)}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="muted">Estimate: about {summary.forecastEstimate.expectedFreeNextHour} slots expected free within the next hour (last-28-days pattern — an estimate, not a promise).</p>
    </section>
  );
}
