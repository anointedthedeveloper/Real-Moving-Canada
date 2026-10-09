import { useEffect } from 'react';

/** Stops the page behind an open menu or drawer from scrolling. */
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; };
  }, [locked]);
}
