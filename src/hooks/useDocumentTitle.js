import { useEffect } from 'react';
import { COMPANY } from '../constants/company.js';

const DEFAULT_TITLE = `${COMPANY.name} — ${COMPANY.tagline}`;

/** Sets the page title (and optionally the meta description) for the current route. */
export function useDocumentTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} — ${COMPANY.name}` : DEFAULT_TITLE;
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    }
  }, [title, description]);
}
