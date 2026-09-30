import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from '../common/Logo.jsx';
import Icon from '../common/Icon.jsx';
import Button from '../common/Button.jsx';
import { PRIMARY_NAV } from '../../constants/navigation.js';
import { SERVICES, serviceLabel } from '../../constants/services.js';
import { COMPANY } from '../../constants/company.js';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll.js';

const navClass = ({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`;

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const servicesRef = useRef(null);
  const toggleRef = useRef(null);

  useLockBodyScroll(menuOpen);

  // Close menus whenever the route changes.
  useEffect(() => { setMenuOpen(false); setServicesOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (servicesOpen) setServicesOpen(false);
      else if (menuOpen) { setMenuOpen(false); toggleRef.current?.focus(); }
    };
    const onClick = (e) => {
      if (servicesOpen && !menuOpen && !servicesRef.current?.contains(e.target)) setServicesOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('click', onClick); };
  }, [menuOpen, servicesOpen]);

  const servicesActive = pathname.startsWith('/services');

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' menu-open' : ''}`}>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="wrap header-bar">
        <Logo />
        <nav id="site-nav" className="site-nav" aria-label="Main">
          <ul className="nav-list">
            {PRIMARY_NAV.map((item, i) => item.to === '/services' ? (
              <li
                key={item.to} ref={servicesRef} style={{ '--i': i }}
                className={`nav-item has-dropdown${servicesOpen ? ' is-open' : ''}`}
                onMouseEnter={() => !menuOpen && setServicesOpen(true)}
                onMouseLeave={() => !menuOpen && setServicesOpen(false)}
              >
                <div className="nav-split">
                  <NavLink to="/services" className={() => `nav-link${servicesActive ? ' is-active' : ''}`}>Services</NavLink>
                  <button
                    type="button" className="dropdown-toggle" aria-expanded={servicesOpen} aria-controls="services-menu"
                    aria-label={servicesOpen ? 'Hide services' : 'Show services'} onClick={() => setServicesOpen((o) => !o)}
                  >
                    <Icon name="chevron-down" />
                  </button>
                </div>
                <div id="services-menu" className="dropdown" inert={!servicesOpen}>
                  <div className="dropdown-inner">
                    <ul>
                      {SERVICES.map((s, n) => (
                        <li key={s.slug} style={{ '--d': n * 18 }}>
                          <Link to={`/services/${s.slug}`}><span className="dropdown-icon"><Icon name={s.icon} /></span>{serviceLabel(s)}</Link>
                        </li>
                      ))}
                    </ul>
                    <Link to="/services" className="dropdown-all">View all services <Icon name="arrow-right" /></Link>
                  </div>
                </div>
              </li>
            ) : (
              <li key={item.to} className="nav-item" style={{ '--i': i }}><NavLink to={item.to} end={item.end} className={navClass}>{item.label}</NavLink></li>
            ))}
            <li className="nav-item" style={{ '--i': PRIMARY_NAV.length }}><NavLink to="/login" className={navClass}>Login</NavLink></li>
          </ul>
          <div className="nav-mobile-extra">
            <Button to="/quote" block iconRight="arrow-right">Get a quote</Button>
            <Button href={`tel:${COMPANY.phoneTel}`} variant="outline" block icon="phone">{COMPANY.phone}</Button>
          </div>
        </nav>
        <div className="header-actions">
          <Button to="/quote" className="header-cta" iconRight="arrow-right">Get a quote</Button>
          <Link to="/quote" className="header-cta-text">Get a quote</Link>
          <button
            ref={toggleRef} type="button" className="icon-btn menu-toggle" aria-controls="site-nav" aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="burger" aria-hidden="true"><span /><span /><span /></span>
          </button>
        </div>
      </div>
    </header>
  );
}
