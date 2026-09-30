import { Link, Outlet, useLocation } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';
import Icon from '../components/common/Icon.jsx';
import { COMPANY } from '../constants/company.js';
import carryingBoxes from '../assets/images/carrying-boxes.webp';
import crewAtTruck from '../assets/images/crew-at-truck.webp';

/** Sign-up mirrors the login screen: the form sits on the right and the photo on the left. */
const FORM_ON_RIGHT = ['/signup'];
const PHOTOS = { '/signup': crewAtTruck };

/** Split screen for Login / Sign up / Forgot / Reset password / Signed out. */
export default function AuthLayout() {
  const { pathname } = useLocation();
  const flipped = FORM_ON_RIGHT.includes(pathname);
  return (
    <div className={`auth-layout${flipped ? ' is-flipped' : ''}`}>
      <div className="auth-panel">
        <header className="auth-top">
          <Logo />
          <Link to="/" className="auth-back"><Icon name="arrow-left" /> <span className="auth-back-long">Back to </span>home</Link>
        </header>
        <main id="main" className="auth-main">
          <Outlet />
        </main>
        <footer className="auth-foot">© {new Date().getFullYear()} {COMPANY.legalName} · <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link></footer>
      </div>
      <div className="auth-media" aria-hidden="true">
        <img src={PHOTOS[pathname] || carryingBoxes} alt="" width="1100" height="1100" />
        <p className="auth-media-title">{COMPANY.tagline}</p>
        <p className="auth-media-foot">{COMPANY.name}</p>
      </div>
    </div>
  );
}
