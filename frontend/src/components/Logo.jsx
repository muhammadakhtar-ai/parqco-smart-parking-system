import { Link } from 'react-router-dom';

// Real PARQCO brand logo (images live in frontend/public).
// light = dark panel (login/register): the full logo image.
// default = light surfaces (navbar): the P icon + PARQCO wordmark text.
export default function Logo({ to = '/', light = false }) {
  if (light) {
    return (
      <Link to={to} className="logo logo--light" aria-label="PARQCO home">
        <img src="/logo.png" alt="PARQCO" style={{ width: '250px', maxWidth: '100%', height: 'auto', display: 'block' }} />
      </Link>
    );
  }

  return (
    <Link to={to} className="logo" aria-label="PARQCO home">
      <img src="/icon.png" alt="" width="32" height="32" style={{ borderRadius: '8px', display: 'block' }} />
      <span>PARQCO</span>
    </Link>
  );
}
