import { Link, Outlet } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';
import Icon from '../components/common/Icon.jsx';
import { COMPANY } from '../constants/company.js';
import sideImage from '../assets/images/carrying-boxes.webp';

/** Split screen for Login / Sign up / Forgot / Reset password: form on the left, photo on the right. */
export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-panel">
        <header className="auth-top">
          <Logo showText={false} size={48} />
          <Link to="/" className="auth-back"><Icon name="arrow-left" /> Back to home</Link>
        </header>
        <main id="main" className="auth-main">
          <Outlet />
        </main>
        <footer className="auth-foot"><Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link></footer>
      </div>
      <div className="auth-media" aria-hidden="true">
        <img src={sideImage} alt="" width="1100" height="1100" />
        <p className="auth-media-title">{COMPANY.tagline}</p>
        <p className="auth-media-foot">{COMPANY.name}</p>
      </div>
    </div>
  );
}
