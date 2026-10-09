/**
 * Post-build step: writes dist/sitemap.xml and dist/robots.txt for search engines.
 * Public pages are listed here; service pages are read from src/constants/services.js.
 * Set VITE_SITE_URL to the live domain (defaults to the Vercel deployment).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = (process.env.VITE_SITE_URL || 'https://real-moving-canada-ddne.vercel.app').replace(/\/+$/, '');
const today = new Date().toISOString().slice(0, 10);

const servicesSource = fs.readFileSync(path.join(root, 'src/constants/services.js'), 'utf8');
const serviceSlugs = [...servicesSource.matchAll(/^\s{4}slug: '([^']+)'/gm)].map((m) => m[1]);

const pages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/services', priority: '0.9', changefreq: 'monthly' },
  ...serviceSlugs.map((slug) => ({ path: `/services/${slug}`, priority: '0.8', changefreq: 'monthly' })),
  { path: '/quote', priority: '0.9', changefreq: 'monthly' },
  { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
  { path: '/service-areas', priority: '0.8', changefreq: 'monthly' },
  { path: '/about', priority: '0.7', changefreq: 'yearly' },
  { path: '/contact', priority: '0.7', changefreq: 'yearly' },
  { path: '/reviews', priority: '0.6', changefreq: 'weekly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE_URL}${p.path}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`).join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /login
Disallow: /signup
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /signed-out
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;

const dist = path.join(root, 'dist');
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(dist, 'robots.txt'), robots);
console.log(`[seo] sitemap.xml (${pages.length} URLs) and robots.txt written for ${SITE_URL}`);
