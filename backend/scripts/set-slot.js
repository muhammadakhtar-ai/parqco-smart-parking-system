/**
 * Manual virtual sensor control - set ONE slot FREE or FULL on your command.
 *   npm run set-slot -- A-104 full
 *   npm run set-slot -- A-104 free
 * Sends the same POST /api/sensor-data reading a real ESP32 would send.
 */
import dotenv from 'dotenv';
dotenv.config();

const API = `http://localhost:${process.env.PORT || 5000}/api`;
const DEVICE_KEY = process.env.DEVICE_API_KEY || 'parqco-esp32-secret';

const code = (process.argv[2] || '').toUpperCase();
const word = (process.argv[3] || '').toLowerCase();

if (!code || !['full', 'occupied', 'free', 'available'].includes(word)) {
  console.log('How to use:  npm run set-slot -- A-104 full');
  console.log('             npm run set-slot -- A-104 free');
  process.exit(1);
}
const occupied = word === 'full' || word === 'occupied';

async function main() {
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@parqco.com', password: 'Admin@123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData?.data?.token || loginData?.token;
  if (!token) {
    console.log('Admin login failed. Is the backend running (npm run dev) and the database seeded?');
    console.log(JSON.stringify(loginData));
    process.exit(1);
  }

  const slotsRes = await fetch(`${API}/slots`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const slotsData = await slotsRes.json();
  const slots = slotsData?.data?.slots || slotsData?.data || slotsData?.slots || [];
  if (!Array.isArray(slots) || slots.length === 0) {
    console.log('The server returned no slots. Raw answer:');
    console.log(JSON.stringify(slotsData).slice(0, 800));
    process.exit(1);
  }
  const slot = slots.find((s) =>
    [s.code, s.name, s.label, s.slotCode, s.sensorId].some(
      (v) => typeof v === 'string' && v.toUpperCase() === code
    )
  );
  if (!slot) {
    console.log(`Slot ${code} not found. First slot the server returned:`);
    console.log(JSON.stringify(slots[0]));
    process.exit(1);
  }
  const sensorId = slot.sensorId || code;

  const res = await fetch(`${API}/sensor-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-device-key': DEVICE_KEY },
    body: JSON.stringify({ sensorId, occupied, battery: 90 }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok) {
    console.log(`✔ ${code} -> ${occupied ? 'occupied (FULL)' : 'available (FREE)'}`);
  } else {
    console.log(`✖ The server rejected the reading for ${code}:`);
    console.log(JSON.stringify(data));
  }
}

main().catch((err) => {
  console.log('Could not reach the backend. First start it in Window 1: npm run dev');
  console.log(String(err));
});