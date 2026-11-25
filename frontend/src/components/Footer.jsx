import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { Linkedin, Github } from 'lucide-react';

// Professional site footer (dark, PARQCO brand). Rendered by the main
// pages layout in App.jsx (landing, dashboard, book, bookings,
// predictions). Every link below is a real page in this app.
const headingStyle = { fontSize: '12px', letterSpacing: '2px', color: '#8FA3BF', fontWeight: 700, marginBottom: '14px' };
const linkStyle = { display: 'block', color: '#D5DEEB', textDecoration: 'none', fontSize: '14px', lineHeight: 2.1 };
const textStyle = { display: 'block', color: '#D5DEEB', fontSize: '14px', lineHeight: 2.1 };
const socialStyle = { width: '34px', height: '34px', border: '1px solid #3D4E6B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#E8EDF5', textDecoration: 'none' };

export default function Footer() {
  return (
    <footer style={{ background: '#0B1220', color: '#E8EDF5', padding: '48px 24px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
          <div style={{ flex: '2 1 240px', minWidth: '220px' }}>
            <Logo light />
            <p style={{ fontSize: '12px', letterSpacing: '1px', color: '#FFC400', margin: '16px 0 0' }}>PARK SMART. SAVE TIME. DRIVE EASY.</p>
            <p style={{ fontSize: '13px', lineHeight: 1.55, color: '#A9B8CC', margin: '12px 0 0', maxWidth: '300px' }}>Live parking availability, booking and forecasts for universities, malls, hospitals and city lots.</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              <a href="https://www.linkedin.com/in/ai-engineer-muhammad-akhtar" target="_blank" rel="noreferrer" style={socialStyle} aria-label="PARQCO on LinkedIn"><Linkedin size={16} /></a>
              <a href="https://github.com/muhammadakhtar-ai" target="_blank" rel="noreferrer" style={socialStyle} aria-label="PARQCO on GitHub"><Github size={16} /></a>
            </div>
          </div>
          <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
            <div style={headingStyle}>PRODUCT</div>
            <Link to="/dashboard" style={linkStyle}>Live Lot Map</Link>
            <Link to="/book" style={linkStyle}>Book a Slot</Link>
            <Link to="/bookings" style={linkStyle}>My Bookings</Link>
            <Link to="/predictions" style={linkStyle}>Demand Forecast</Link>
          </div>
          <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
            <div style={headingStyle}>FEATURES</div>
            <span style={textStyle}>Real-time Virtual Sensors</span>
            <span style={textStyle}>Online Payment</span>
            <span style={textStyle}>PDF Parking Slip</span>
            <span style={textStyle}>Admin Dashboard</span>
          </div>
          <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
            <div style={headingStyle}>GET STARTED</div>
            <Link to="/register" style={linkStyle}>Create Account</Link>
            <Link to="/login" style={linkStyle}>Sign In</Link>
            <Link to="/book" style={linkStyle}>Book a Slot</Link>
            <Link to="/" style={linkStyle}>Home</Link>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #22314A', marginTop: '32px', paddingTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12.5px', color: '#8FA3BF' }}>© {new Date().getFullYear()} PARQCO. All rights reserved.</span>
          <span style={{ fontSize: '12.5px', color: '#8FA3BF' }}>Smart Parking Management System with AI Predictions</span>
        </div>
      </div>
    </footer>
  );
}
