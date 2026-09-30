import { Link, Outlet } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';

/** Focused header for the quote flow (design: "Your progress can be saved · Exit quote"). */
export default function QuoteLayout() {
  return (
    <div className="quote-layout">
      <header className="quote-header">
        <div className="wrap quote-header-bar">
          <Logo />
          <div className="quote-header-actions">
            <span className="small muted quote-saved">Your progress is saved on this device</span>
            <Link to="/" className="btn btn-outline btn-sm">Exit quote</Link>
          </div>
        </div>
      </header>
      <main id="main"><Outlet /></main>
    </div>
  );
}
