import { useLayoutEffect, useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const STORE_KEY = 'rmc:scroll-positions';
const positions = new Map(readStored());

function readStored() {
  try { return JSON.parse(sessionStorage.getItem(STORE_KEY)) || []; } catch { return []; }
}
function persist() {
  try { sessionStorage.setItem(STORE_KEY, JSON.stringify([...positions].slice(-50))); } catch { /* storage unavailable */ }
}

// `behavior: 'instant'` overrides the CSS `scroll-behavior: smooth` used for in-page anchors,
// so a new route never visibly scrolls up from where the previous page was left.
const jump = (top) => window.scrollTo({ top, left: 0, behavior: 'instant' });

/** Scrolls to an element for a URL hash, retrying briefly while a lazy page renders. */
function scrollToHash(hash) {
  const id = decodeURIComponent(hash.slice(1));
  let tries = 0;
  const attempt = () => {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'instant', block: 'start' }); return; }
    if (tries++ < 20) requestAnimationFrame(attempt);
    else jump(0);
  };
  attempt();
}

/** Restores a saved position on back/forward once the page is tall enough to reach it. */
function restore(top) {
  let tries = 0;
  const attempt = () => {
    const reachable = document.documentElement.scrollHeight - window.innerHeight >= top;
    if (reachable || tries++ >= 30) { jump(top); return; }
    requestAnimationFrame(attempt);
  };
  attempt();
}

/**
 * Scroll management for client-side navigation, replacing the browser's default
 * scroll restoration:
 *  - a new route (link click, navigate(), redirect) always opens at the top,
 *  - a URL hash (/contact#map) scrolls to that element instead,
 *  - browser back/forward returns to where the visitor was on that page,
 *  - query-string-only changes (tabs, filters) leave the scroll position alone.
 */
export function useScrollToTop() {
  const { pathname, hash, key: historyKey } = useLocation();
  const navigationType = useNavigationType();
  // Every fresh page load has the history key "default", so pair it with the path:
  // otherwise opening a new URL would restore another page's scroll position.
  const key = `${historyKey}:${pathname}`;
  const currentKey = useRef(key);

  // Record the scroll position of the current history entry. Scroll events fire
  // asynchronously, so by the time the jump below produces one, `currentKey` already
  // points at the new entry and the previous page's position is kept intact.
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const save = () => { positions.set(currentKey.current, window.scrollY); };
    window.addEventListener('scroll', save, { passive: true });
    window.addEventListener('pagehide', persist);
    return () => {
      window.removeEventListener('scroll', save);
      window.removeEventListener('pagehide', persist);
    };
  }, []);

  useLayoutEffect(() => {
    currentKey.current = key;
    persist();
  }, [key]);

  useLayoutEffect(() => {
    if (navigationType === 'POP' && positions.has(key)) {
      restore(positions.get(key));
      return;
    }
    if (hash) { scrollToHash(hash); return; }
    jump(0);
    // Only pathname/hash changes move the page; `key` alone changes on search-param updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hash]);
}
