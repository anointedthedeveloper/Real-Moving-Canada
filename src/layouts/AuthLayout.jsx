import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';
import Icon from '../components/common/Icon.jsx';
import Kicker from '../components/common/Kicker.jsx';
import { COMPANY } from '../constants/company.js';
import { photo } from '../constants/photos.js';

const carryingBoxes = photo('carrying-boxes');
const crewAtTruck = photo('crew-at-truck');
const hallwayBoxes = photo('hallway-boxes');
const clipboardCheck = photo('clipboard-check');
const couchIntoHome = photo('couch-into-home');

/** Photo-side content for each account screen. Sign-up mirrors login: form right, photo left. */
const PANELS = {
  '/login': {
    image: carryingBoxes,
    kicker: 'Customer account',
    title: 'Welcome back to your move',
    text: 'Sign in to see everything about your move in one place.',
    points: ['Track your move from request to move day', 'Review and accept your quotes', 'Pay balances and download receipts'],
  },
  '/signup': {
    image: crewAtTruck,
    formOnRight: true,
    kicker: 'Create your account',
    title: 'Keep your whole move organized',
    text: 'One account for your quotes, bookings, documents and messages with our team.',
    points: ['Save your move details once', 'Message our team about your booking', 'Keep documents and receipts together'],
  },
  '/forgot-password': {
    image: hallwayBoxes,
    kicker: 'Account help',
    title: 'Let’s get you back in',
    text: 'Enter the email you used for your account and we’ll send a secure link to reset your password.',
  },
  '/reset-password': {
    image: clipboardCheck,
    kicker: 'Account security',
    title: 'Choose a new password',
    text: 'Use at least 8 characters. Avoid passwords you use on other websites.',
  },
  '/signed-out': {
    image: couchIntoHome,
    kicker: COMPANY.motto,
    title: 'Thanks for moving with us',
    text: `Questions about your move? Call ${COMPANY.phone} and our team will help.`,
  },
};

/** Load every account screen up front so switching between them never shows a loader. */
const preloadAuthPages = () => Promise.all([
  import('../pages/auth/LoginPage.jsx'),
  import('../pages/auth/SignupPage.jsx'),
  import('../pages/auth/ForgotPasswordPage.jsx'),
  import('../pages/auth/ResetPasswordPage.jsx'),
]).catch(() => {});

/** Every panel photo, preloaded so the crossfade never waits on the network. */
const preloadPhotos = () => Object.values(PANELS).forEach((p) => { const i = new Image(); i.srcset = p.image.srcSet || ''; i.sizes = '50vw'; i.src = p.image.src; });

/**
 * Split screen for Login / Sign up / Forgot / Reset password / Signed out. On wide
 * screens the photo and form slide past each other when switching between login
 * (form left) and sign-up (form right); the photo crossfades and the new form fades up.
 */
export default function AuthLayout() {
  const { pathname } = useLocation();
  const panel = PANELS[pathname] || PANELS['/login'];
  useEffect(() => { preloadAuthPages(); preloadPhotos(); }, []);
  return (
    <div className={`auth-layout${panel.formOnRight ? ' is-flipped' : ''}`}>
      <div className="auth-panel">
        <header className="auth-top">
          <Logo />
          <Link to="/" className="auth-back"><Icon name="arrow-left" /> <span className="auth-back-long">Back to </span>home</Link>
        </header>
        <main id="main" className="auth-main">
          <div className="auth-swap" key={pathname}><Outlet /></div>
        </main>
        <footer className="auth-foot">© {new Date().getFullYear()} {COMPANY.legalName} · <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link></footer>
      </div>
      <aside className="auth-media" aria-label={panel.title}>
        {Object.entries(PANELS).map(([path, p]) => (
          <img key={path} src={p.image.src} srcSet={p.image.srcSet} sizes="(max-width: 960px) 100vw, 55vw" alt="" width="1100" height="1100" className={p === panel ? 'is-active' : ''} loading={p === panel ? 'eager' : 'lazy'} />
        ))}
        <div className="auth-media-top"><Logo tone="light" /></div>
        <div className="auth-media-copy" key={pathname}>
          <Kicker tone="gold">{panel.kicker}</Kicker>
          <h2>{panel.title}</h2>
          <p>{panel.text}</p>
          {panel.points && (
            <ul>{panel.points.map((p) => <li key={p}><span><Icon name="check" /></span>{p}</li>)}</ul>
          )}
        </div>
      </aside>
    </div>
  );
}
