import { CalendarCheck, CarFront, Clock, Cpu, Gauge, LineChart, MapPinned, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import StatCard from './StatCard.jsx';

/**
 * About section for the home (landing) page — written like a real product:
 * problem first, proof numbers second (only numbers that are true),
 * features third, and the deployment model stated honestly.
 */
const FEATURES = [
  {
    icon: CarFront,
    title: 'Live Lot',
    text: 'Every bay — free, occupied, reserved or under maintenance — on one live map that updates the instant a slot changes. No refresh, no guessing, no circling.',
  },
  {
    icon: CalendarCheck,
    title: 'Booking & Challan',
    text: 'Reserve a bay for the exact hours you need, with a confirmed challan number and a downloadable PDF slip. Double-booking is impossible — the server rejects any overlapping reservation.',
  },
  {
    icon: TrendingUp,
    title: 'Forecasting',
    text: 'Demand predictions learned from sensor history: peak windows, expected occupancy, and which specific slot is most likely to be free when you arrive. Bookings are shown exactly; predictions are always labelled as chances.',
  },
  {
    icon: Clock,
    title: 'Next Free & Smart Overflow',
    text: 'When the lot is full, PARQCO gives the exact time the next slot frees, from real booking end times. If every slot is busy, it can generate a virtual overflow bay — zone, floor and fee chosen automatically — up to the 60-bay maximum.',
  },
  {
    icon: Cpu,
    title: 'Virtual IoT Sensors',
    text: 'Each bay reports through an ESP32-compatible sensor interface. Today the sensors are virtual, so the system can be deployed and evaluated with zero hardware cost — and real devices can be connected later without changing the software.',
  },
  {
    icon: ShieldCheck,
    title: 'Admin Control',
    text: 'One panel for slots, bookings, users and sensor health. A slot an admin sets by hand stays set — the simulation never overwrites a manual decision, and manual changes never pollute the forecast data.',
  },
];

export default function AboutSection() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section__title">About PARQCO</h2>
        <p className="section__lead">
          Finding parking should not be the hardest part of the trip. Drivers circle car parks because nobody
          can see which bays are free — so they guess, queue, and waste fuel and time. PARQCO removes the
          guessing: it connects every bay to a live map, lets drivers reserve before they arrive, and forecasts
          demand so operators can plan peak hours instead of reacting to them.
        </p>

        <div className="stats">
          <StatCard label="Bays under management" value="60" icon={Gauge} note="Across 6 zones, A–F" />
          <StatCard label="Live updates" value="Real-time" icon={Zap} note="Pushed to every screen instantly" />
          <StatCard label="Zones & floors" value="6" icon={MapPinned} note="10 bays per zone" />
          <StatCard label="Forecast history" value="28 days" icon={LineChart} note="Of sensor readings, learned daily" />
        </div>

        <ul className="features__list">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Icon size={22} />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="section__lead">
          Built for places where parking is always contested — universities, shopping malls, hospitals and
          offices — and designed to start virtual-first: deploy today with simulated sensors, add physical
          ESP32 devices bay by bay when the budget allows, with no software change.
        </p>
      </div>
    </section>
  );
}
