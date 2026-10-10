import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { COMPANY } from '../constants/company.js';
import { SITE_URL, OG_IMAGE, BASE_KEYWORDS } from '../constants/seo.js';

const DEFAULT_TITLE = `${COMPANY.name} — Movers in Saskatoon & Across Canada | ${COMPANY.tagline}`;

/** Creates or updates a <meta>/<link> tag in <head>. */
function setTag(tag, attr, key, value, valueAttr = 'content') {
  let el = document.head.querySelector(`${tag}[${attr}="${key}"]`);
  if (value == null) { el?.remove(); return; }
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(attr, key);
    document.head.append(el);
  }
  el.setAttribute(valueAttr, value);
}

/**
 * Per-page SEO: title, description, keywords, canonical URL, Open Graph / Twitter
 * tags, robots and optional JSON-LD structured data. Account pages pass
 * `{ noindex: true }` so they stay out of search results.
 */
export function useDocumentTitle(title, description, { keywords, noindex = false, jsonLd, image } = {}) {
  const { pathname } = useLocation();
  const jsonKey = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const fullTitle = title ? `${title} | ${COMPANY.name}` : DEFAULT_TITLE;
    const url = `${SITE_URL}${pathname === '/' ? '/' : pathname.replace(/\/+$/, '')}`;
    document.title = fullTitle;

    if (description) {
      setTag('meta', 'name', 'description', description);
      setTag('meta', 'property', 'og:description', description);
      setTag('meta', 'name', 'twitter:description', description);
    }
    setTag('meta', 'name', 'keywords', keywords || BASE_KEYWORDS.join(', '));
    setTag('meta', 'name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    setTag('link', 'rel', 'canonical', url, 'href');
    setTag('meta', 'property', 'og:title', fullTitle);
    setTag('meta', 'property', 'og:url', url);
    setTag('meta', 'property', 'og:image', image || OG_IMAGE);
    setTag('meta', 'name', 'twitter:title', fullTitle);
    setTag('meta', 'name', 'twitter:image', image || OG_IMAGE);

    let scripts = [];
    if (jsonKey) {
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      scripts = items.map((item) => {
        const s = Object.assign(document.createElement('script'), { type: 'application/ld+json', text: JSON.stringify(item) });
        s.dataset.page = 'true';
        document.head.append(s);
        return s;
      });
    }
    return () => scripts.forEach((s) => s.remove());
  }, [title, description, keywords, noindex, image, pathname, jsonKey]);
}
