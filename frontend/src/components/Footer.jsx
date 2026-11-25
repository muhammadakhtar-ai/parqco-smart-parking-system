import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { Linkedin, Github, Mail } from 'lucide-react';

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
            <p style={{ fontSize: '13px', color: '#A9B8CC', margin: '10px 0 0' }}><a href="mailto:akhtardhandla@gmail.com" style={{ color: '#E8EDF5', textDecoration: 'none' }}>akhtardhandla@gmail.com</a></p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              <a href="https://www.linkedin.com/in/ai-engineer-muhammad-akhtar" target="_blank" rel="noreferrer" style={socialStyle} aria-label="PARQCO on LinkedIn"><Linkedin size={16} /></a>
              <a href="https://github.com/muhammadakhtar-ai" target="_blank" rel="noreferrer" style={socialStyle} aria-label="PARQCO on GitHub"><Github size={16} /></a>
              <a href="https://wa.me/923166379724" target="_blank" rel="noreferrer" style={socialStyle} aria-label="PARQCO on WhatsApp"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>
              <a href="mailto:akhtardhandla@gmail.com" style={socialStyle} aria-label="Email PARQCO"><Mail size={16} /></a>
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
