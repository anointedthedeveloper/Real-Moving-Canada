import { useScrollToTop } from '../../hooks/useScrollToTop.js';

/** Mount once inside the router: every route change opens the new page at the top. */
export default function ScrollToTop() {
  useScrollToTop();
  return null;
}
