import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';
import Icon from '../components/common/Icon.jsx';
import Button from '../components/common/Button.jsx';
import Notice from '../components/common/Notice.jsx';
import { DASHBOARD_NAV, DASHBOARD_TABS } from '../constants/navigation.js';
import { COMPANY } from '../constants/company.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll.js';
import { initials } from '../utils/format.js';

const PAGE_META = {
  '/dashboard': ['Overview', 'A clear view of your moving activity'],
  '/dashboard/moves': ['My Moves', 'Track move requests from planning to completion'],
  '/dashboard/quotes': ['Quotes', 'Review and act on moving quotes'],
  '/dashboard/bookings': ['Bookings', 'Manage confirmed and pending bookings'],
  '/dashboard/payments': ['Payments', 'Pay balances and access transaction records'],
  '/dashboard/payments/pay': ['Make a payment', 'Enter payment details and review the amount'],
  '/dashboard/documents': ['Documents', 'Keep move paperwork organized in one place'],
  '/dashboard/messages': ['Messages', 'Keep move conversations and updates together'],
  '/dashboard/profile': ['Profile', 'Manage personal and contact information'],
  '/dashboard/settings': ['Settings', 'Control preferences, security, and account access'],
};

const navClass = ({ isActive }) => `side-link${isActive ? ' is-active' : ''}`;

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [title, subtitle] = PAGE_META[pathname.replace(/\/+$/, '')] || ['Page not found', ''];

  useLockBodyScroll(drawerOpen);
  useEffect(() => { setDrawerOpen(false); }, [pathname]);
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const signOut = async () => { await logout(); navigate('/signed-out', { replace: true }); };
  const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Guest';

  const sidebar = (
    <>
      <div className="side-brand"><Logo tone="light" to="/dashboard" /></div>
      <nav aria-label="Customer account" className="side-nav">
        <ul>
          {DASHBOARD_NAV.map((item) => (
            <li key={item.to}><NavLink to={item.to} end={item.end} className={navClass}><Icon name={item.icon} />{item.label}</NavLink></li>
          ))}
        </ul>
      </nav>
      <div className="side-user">
        <div className="side-user-card">
          <span className="avatar" aria-hidden="true">{user ? initials(name) : <Icon name="user" />}</span>
          <div><strong>{name}</strong><small>{user ? user.email : 'Not signed in'}</small></div>
        </div>
        {user
          ? <button type="button" className="side-link" onClick={signOut}><Icon name="logout" />Log out</button>
          : <Link to="/login" className="side-link"><Icon name="lock" />Sign in</Link>}
        <Link to="/" className="side-link"><Icon name="home" />Back to website</Link>
      </div>
    </>
  );

  return (
    <div className="portal">
      <a className="skip-link" href="#main">Skip to content</a>
      <aside className="portal-side">{sidebar}</aside>

      <header className="portal-topbar">
        <Logo to="/dashboard" />
        <span className="portal-topbar-title">{title}</span>
        <button type="button" className="icon-btn" aria-label="Open account menu" aria-expanded={drawerOpen} aria-controls="portal-drawer" onClick={() => setDrawerOpen(true)}>
          <Icon name="menu" />
        </button>
      </header>
      <div className={`portal-drawer-backdrop${drawerOpen ? ' is-open' : ''}`} onClick={() => setDrawerOpen(false)} aria-hidden="true" />
      <aside id="portal-drawer" className={`portal-drawer${drawerOpen ? ' is-open' : ''}`} aria-hidden={!drawerOpen} inert={!drawerOpen}>
        <button type="button" className="icon-btn drawer-close" aria-label="Close account menu" onClick={() => setDrawerOpen(false)}><Icon name="x" /></button>
        {sidebar}
      </aside>

      <div className="portal-main">
        <header className="portal-header">
          <div>
            <h1 className="portal-title">{title}</h1>
            {subtitle && <p className="portal-subtitle">{subtitle}</p>}
          </div>
          <div className="portal-header-actions">
            <Link to="/contact" className="icon-btn" aria-label="Help and support"><Icon name="help" /></Link>
            <Link to="/dashboard/messages" className="icon-btn" aria-label="Notifications and messages"><Icon name="bell" /></Link>
          </div>
        </header>
        <main id="main" className="portal-content">
          {!user && (
            <Notice
              tone="info" className="portal-preview" title="You’re not signed in"
              action={<Button to="/login" size="sm" iconRight="arrow-right">Sign in</Button>}
            >
              Sign in to see your moves, quotes, bookings, payments and documents. Need help? Call <a className="link" href={`tel:${COMPANY.phoneTel}`}>{COMPANY.phone}</a>.
            </Notice>
          )}
          <div className="page-enter" key={pathname}><Outlet /></div>
        </main>
      </div>

      <nav className="portal-tabs" aria-label="Account sections">
        {DASHBOARD_TABS.map((t) => {
          const active = t.end ? pathname === t.to : (t.match || [t.to]).some((m) => pathname.startsWith(m));
          return (
            <Link key={t.to} to={t.to} className={`portal-tab${active ? ' is-active' : ''}`} aria-current={active ? 'page' : undefined}>
              <Icon name={t.icon} /><span>{t.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
