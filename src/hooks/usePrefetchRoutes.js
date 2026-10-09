import { useEffect } from 'react';

/**
 * Once the first page has loaded and the browser is idle, download the code for the
 * most visited pages so moving between them is instant (no skeleton flash).
 */
const COMMON_PAGES = [
  () => import('../pages/public/ServicesPage.jsx'),
  () => import('../pages/public/ServiceDetailPage.jsx'),
  () => import('../pages/public/AboutPage.jsx'),
  () => import('../pages/public/ContactPage.jsx'),
  () => import('../pages/public/QuotePage.jsx'),
];

export function usePrefetchRoutes() {
  useEffect(() => {
    if (navigator.connection?.saveData) return undefined;
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));
    const cancel = window.cancelIdleCallback || clearTimeout;
    const id = idle(() => COMMON_PAGES.forEach((load) => load().catch(() => {})));
    return () => cancel(id);
  }, []);
}
