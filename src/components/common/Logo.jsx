import { Link } from 'react-router-dom';
import logo from '../../assets/brand/logo.webp';
import { COMPANY } from '../../constants/company.js';

/** Round Real Moving Canada badge with the "REAL MOVING / Moving Your Life Forward" wordmark. */
export default function Logo({ tone = 'dark', showText = true, size = 52, to = '/', className = '' }) {
  return (
    <Link to={to} className={`logo logo-${tone} ${className}`.trim()} aria-label={`${COMPANY.name} — home`}>
      <img src={logo} alt="" width={size} height={size} />
      {showText && (
        <span className="logo-text">
          <strong>REAL MOVING</strong>
          <small>{COMPANY.tagline}</small>
        </span>
      )}
    </Link>
  );
}
