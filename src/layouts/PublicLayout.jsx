import { useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader from '../components/layout/SiteHeader.jsx';
import SiteFooter from '../components/layout/SiteFooter.jsx';
import MobileActionBar from '../components/layout/MobileActionBar.jsx';
import { useScrollReveal } from '../hooks/useScrollReveal.js';

export default function PublicLayout() {
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  useScrollReveal(mainRef);
  return (
    <>
      <SiteHeader />
      <main id="main" ref={mainRef}>
        {/* Keyed by path so each page fades in when you navigate to it. */}
        <div className="page-enter" key={pathname}><Outlet /></div>
      </main>
      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
