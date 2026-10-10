import { useEffect } from 'react';

/** Content that fades up into view as it scrolls onto the screen. */
const SELECTOR = [
  '.section-header', '.service-grid > li', '.feature-grid > li', '.process > li', '.why-list > li', '.why-media',
  '.areas-list > li', '.accordion > details', '.region-grid > li', '.split > *', '.detail-grid > *',
  '.contact-list > li', '.contact-grid > form', '.contact-grid > .card', '.estimate > *', '.cta-band-inner > *',
  '.legal-body > section', '.map-frame', '.center-block', '.not-found > *',
].join(',');

const MAX_STAGGER = 6;
const STEP_MS = 70;

/**
 * Scroll-reveal for public pages. Elements are hidden only once JavaScript is
 * running (so nothing is ever invisible without it) and revealed as soon as their
 * top reaches the lower part of the screen — including anything the page jumped
 * past (End key, anchor links, back-button scroll restore). Revealed elements are
 * then cleaned up so their own hover transitions work normally. Newly rendered
 * content (lazy pages, loaded data) is picked up automatically. Skipped entirely
 * for visitors who prefer reduced motion.
 */
export function useScrollReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const pending = new Set();
    let frame = 0;

    const reveal = (el) => {
      pending.delete(el);
      el.classList.add('is-visible');
      const delay = Number.parseInt(el.style.getPropertyValue('--reveal-delay'), 10) || 0;
      setTimeout(() => {
        el.classList.remove('reveal', 'is-visible');
        el.style.removeProperty('--reveal-delay');
      }, 800 + delay);
    };

    const check = () => {
      frame = 0;
      const line = window.innerHeight * 0.92;
      pending.forEach((el) => {
        if (!el.isConnected) { pending.delete(el); return; }
        if (el.getBoundingClientRect().top < line) reveal(el);
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(check); };

    const prepare = (scope) => {
      const found = scope.matches?.(SELECTOR) ? [scope] : [];
      scope.querySelectorAll?.(SELECTOR).forEach((el) => found.push(el));
      found.forEach((el) => {
        if (el.dataset.revealed) return;
        el.dataset.revealed = 'true';
        const siblings = [...el.parentElement.children].filter((c) => c.matches(SELECTOR));
        const index = Math.min(siblings.indexOf(el), MAX_STAGGER);
        el.style.setProperty('--reveal-delay', `${Math.max(index, 0) * STEP_MS}ms`);
        el.classList.add('reveal');
        pending.add(el);
      });
      schedule();
    };

    prepare(root);
    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) prepare(n); }));
    });
    mo.observe(root, { childList: true, subtree: true });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      mo.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [rootRef]);
}
