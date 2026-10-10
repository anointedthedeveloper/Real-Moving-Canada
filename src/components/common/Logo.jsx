import { Link } from 'react-router-dom';
import LogoMark from './LogoMark.jsx';
import { COMPANY } from '../../constants/company.js';

/**
 * Real Moving Canada Inc. logo: the RMC house mark plus the wordmark and the
 * "Movers You Can Trust" motto line. `tone="light"` is the white version for
 * dark backgrounds; `compact` hides the motto line (small spaces).
 */
export default function Logo({ tone = 'dark', to = '/', compact = false, className = '' }) {
  return (
    <Link to={to} className={`logo logo-${tone}${compact ? ' is-compact' : ''} ${className}`.trim()} aria-label={`${COMPANY.legalName} — home`}>
      <LogoMark />
      <span className="logo-text" aria-hidden="true">
        <strong>REAL MOVING<br />CANADA INC.</strong>
        <span className="logo-rule" />
        <small>{COMPANY.motto.toUpperCase()}</small>
      </span>
    </Link>
  );
}
