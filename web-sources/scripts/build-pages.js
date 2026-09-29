'use strict';
/**
 * Builds the static HTML pages in /public from /web-sources/pages.
 * Each page starts with <!--meta {json}--> and is wrapped in a shared layout
 * (header, footer, icon sprite). Run: npm run build:pages
 *
 * Routing: every page is written as a real directory with its own
 * index.html (e.g. about.html -> about/index.html), so it's servable at a
 * clean URL ("/about") with no ".html" extension and no client-side router —
 * any static file server that resolves a directory request to its
 * index.html (this repo's own server.js, Netlify, Vercel, GitHub Pages,
 * nginx, `npx serve`) handles it natively, including on a hard refresh.
 * Every service in core/data.js also gets its own page at /services/<slug>.
 * The homepage is written twice — to / and to /home — since both are valid
 * entry points. 404.html stays at the server root, which is the convention
 * static hosts look for.
 *
 * All internal links/assets in the page sources are already absolute
 * ("/quote", "/assets/img/logo.svg"), so nothing needs rewriting per page.
 */
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'pages');
const OUT = path.join(ROOT, '..', 'public');
const VERSION = Date.now().toString(36);

// ─── Icon sprite (24×24, stroke-based) ────────────────────────────────────
const ICONS = {
  truck: '<path d="M2.5 6.5h11v10h-11z"/><path d="M13.5 9.5h4l3.5 3.5v3.5h-7.5"/><circle cx="7" cy="17.5" r="1.9"/><circle cx="17" cy="17.5" r="1.9"/>',
  home: '<path d="M3 11 12 4l9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/>',
  building: '<rect x="4" y="3" width="10.5" height="18" rx="1"/><path d="M14.5 9H20v12h-5.5M7.5 7h3.5M7.5 11h3.5M7.5 15h3.5"/>',
  pin: '<path d="M12 21s-6.5-5.8-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.2-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  route: '<circle cx="6" cy="18" r="2.3"/><circle cx="18" cy="6" r="2.3"/><path d="M8.3 18H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.7"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.6 3.7 5.6 3.7 9s-1.3 6.4-3.7 9c-2.4-2.6-3.7-5.6-3.7-9S9.6 5.6 12 3z"/>',
  box: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9M7.8 5.2l8.4 4.6"/>',
  warehouse: '<path d="M3 20.5V9l9-5 9 5v11.5"/><path d="M7 20.5V13h10v7.5M7 16.8h10"/>',
  sofa: '<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3z"/><path d="M5.5 18v2M18.5 18v2"/>',
  shield: '<path d="M12 3 5 6v5c0 4.4 3 8.2 7 10 4-1.8 7-5.6 7-10V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  star: '<path d="m12 3.2 2.7 5.5 6 .9-4.35 4.25 1.03 6-5.38-2.83-5.38 2.83 1.03-6L3.3 9.6l6-.9z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  phone: '<path d="M5 3.8h3.6l1.8 4.6-2.3 1.4a11 11 0 0 0 5.1 5.1l1.4-2.3 4.6 1.8v3.6a2 2 0 0 1-2.1 2A16.5 16.5 0 0 1 3 5.9a2 2 0 0 1 2-2.1z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  file: '<path d="M6 3h8.5L19 7.5V21H6z"/><path d="M14 3v5h5M9 12.5h7M9 16.5h7"/>',
  message: '<path d="M4 5h16v11H9.5L4 20z"/><path d="M8 9.5h8M8 12.5h5"/>',
  dollar: '<path d="M12 3v18M16.5 7.5C16 6 14.3 5 12 5 9.5 5 7.5 6.3 7.5 8.3c0 4.7 9 2.6 9 7.4 0 2-2 3.3-4.5 3.3-2.5 0-4.3-1-4.8-2.7"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/><path d="M19 19a3 3 0 0 1-3 3h-3"/>',
  hands: '<path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V10M10 10V5a1.5 1.5 0 0 1 3 0v5M13 10V6a1.5 1.5 0 0 1 3 0v6M16 10a1.5 1.5 0 0 1 3 0v4a7 7 0 0 1-7 7h-1a6 6 0 0 1-4.5-2l-3-3.6a1.6 1.6 0 0 1 2.4-2.1L7 14.5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.01"/>',
  archive: '<rect x="3" y="4" width="18" height="4.5" rx="1"/><path d="M5 8.5V20h14V8.5M10 12.5h4"/>',
  scale: '<path d="M12 4v16M5 20h14M4 8h16M7 8l-3 6a3 3 0 0 0 6 0zM17 8l-3 6a3 3 0 0 0 6 0z"/>',
  ruler: '<path d="M3 16.5 16.5 3 21 7.5 7.5 21z"/><path d="m7 12.5 2 2M10 9.5l2 2M13 6.5l2 2"/>',
  trash: '<path d="M4 7h16M9.5 7V4h5v3M6 7l1 13h10l1-13"/>',
};
const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">${Object.entries(ICONS)
  .map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('')}</svg>`;
const I = (name, cls = 'i') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;

// ─── Shared partials ──────────────────────────────────────────────────────
// All hrefs/srcs below are root-absolute clean routes ("/quote", "/assets/…"),
// which resolve correctly no matter how deep the current page's own URL is.
const telHref = () => `tel:${DATA.PHONE_TEL}`;

/** "Services" mega menu: one column per category, plus a CTA tile so the 3×2 grid is always full. */
const megaMenu = () => `<div class="mega" id="mega-services">
        <div class="wrap mega-grid">
          ${DATA.SERVICE_CATEGORIES.map((c) => {
            const list = DATA.FALLBACK_SERVICES.filter((s) => s.category === c.slug);
            const links = list.length > 1 || list[0]?.slug !== c.slug ? list : [];
            return `<div class="mega-col">
            <a class="mega-cat" href="/services#${c.slug}">${I(c.icon)}<span>${c.name}</span></a>
            ${links.length ? `<ul>${links.map((s) => `<li><a href="/services/${s.slug}">${s.name}</a></li>`).join('')}</ul>` : `<p>${c.summary}</p><a class="mega-more" href="/services/${list[0]?.slug || ''}">Learn more ${I('arrow-right')}</a>`}
          </div>`;
          }).join('\n          ')}
          <div class="mega-cta">
            <strong>Not sure what you need?</strong>
            <p>Get a price range in seconds, or talk to our team.</p>
            <a class="btn btn-primary btn-sm" href="/quote">Get a Quote</a>
            <a class="mega-phone" href="${telHref()}">${I('phone')}${DATA.PHONE}</a>
          </div>
        </div>
      </div>`;

const header = () => `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/" aria-label="RealMovingCanada — home"><img src="/assets/img/logo.svg" alt="RealMovingCanada" width="329" height="44" data-logo></a>
    <nav class="nav" id="site-nav" aria-label="Main">
      <a class="nav-link" href="/" style="--i:1">Home</a>
      <div class="nav-item has-mega" style="--i:2">
        <a class="nav-link" href="/services">Services</a>
        <button class="mega-toggle" type="button" aria-expanded="false" aria-controls="mega-services" aria-label="Show all services">${I('chevron-down')}</button>
      ${megaMenu()}
      </div>
      <a class="nav-link" href="/service-areas" style="--i:3">Service Areas</a>
      <a class="nav-link" href="/pricing" style="--i:4">Pricing</a>
      <a class="nav-link" href="/reviews" style="--i:5">Reviews</a>
      <a class="nav-link" href="/about" style="--i:6">About</a>
      <a class="nav-link" href="/contact" style="--i:7">Contact</a>
      <div class="nav-mobile-cta">
        <a class="btn btn-primary btn-lg" href="/quote">Get a Quote</a>
        <a class="btn btn-outline btn-lg" href="${telHref()}">${I('phone')}Call ${DATA.PHONE}</a>
        <p class="nav-mobile-meta">${I('mail')}<a href="mailto:${DATA.EMAIL}">${DATA.EMAIL}</a></p>
        <p class="nav-mobile-meta">${I('pin')}<span>${DATA.ADDRESS.city}, ${DATA.ADDRESS.province}</span></p>
      </div>
    </nav>
    <div class="header-actions">
      <a class="header-phone" href="${telHref()}">${I('phone')}<span><small>Call us</small>${DATA.PHONE}</span></a>
      <a class="btn btn-primary btn-sm btn-quote" href="/quote">Get a Quote</a>
      <button class="icon-btn menu-toggle" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="Open menu">${I('menu')}</button>
    </div>
  </div>
</header>`;

const footer = () => `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <img src="/assets/img/logo-light.svg" alt="RealMovingCanada" width="329" height="44" data-logo-light>
      <p class="footer-motto">Movers You Can Trust</p>
      <p>Residential, commercial, local, long-distance and specialty moving services — planned carefully and communicated clearly, across Canada.</p>
    </div>
    <div>
      <h2>Services</h2>
      <ul>
        <li><a href="/services/local-moving">Local moving</a></li>
        <li><a href="/services/long-distance-moving">Long-distance moving</a></li>
        <li><a href="/services/full-service-packing">Packing &amp; unpacking</a></li>
        <li><a href="/services/storage-solutions">Storage</a></li>
        <li><a href="/services/junk-removal">Junk removal</a></li>
        <li><a href="/services">All services</a></li>
      </ul>
    </div>
    <div>
      <h2>Company</h2>
      <ul>
        <li><a href="/about">About us</a></li>
        <li><a href="/service-areas">Service areas</a></li>
        <li><a href="/pricing">Pricing</a></li>
        <li><a href="/reviews">Reviews</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </div>
    <div>
      <h2>Get started</h2>
      <ul>
        <li><a href="/quote">Get a Quote</a></li>
        <li><a href="/pricing#estimate">Instant estimate</a></li>
        <li><a href="/reviews#write">Share your experience</a></li>
        <li><a href="/contact">Ask a question</a></li>
      </ul>
    </div>
    <div class="footer-contact-col">
      <h2>Contact</h2>
      <ul class="footer-contact">
        <li>${I('phone')}<span data-contact="phone"><a href="${telHref()}">${DATA.PHONE}</a></span></li>
        <li>${I('mail')}<span data-contact="email"><a href="mailto:${DATA.EMAIL}">${DATA.EMAIL}</a></span></li>
        <li>${I('pin')}<span>${DATA.ADDRESS.street}<br>${DATA.ADDRESS.city}, ${DATA.ADDRESS.province} ${DATA.ADDRESS.postal}</span></li>
      </ul>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <span>© <span data-year>2026</span> RealMovingCanada. All rights reserved.</span>
    <div class="socials" data-socials></div>
  </div>
</footer>`;

function layout(meta, body) {
  const css = ['core', 'site'];
  const scripts = meta.scripts?.length ? meta.scripts : ['site'];
  const robots = meta.noindex ? '\n  <meta name="robots" content="noindex, nofollow">' : '';
  const shell = `${sprite}\n${header()}\n<main id="main">\n${body}\n</main>\n${footer()}`;
  return `<!doctype html>
<html lang="en-CA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description || ''}">${robots}
  <meta name="theme-color" content="#0E2433">
  <meta property="og:title" content="${meta.title}">
  <meta property="og:description" content="${meta.description || ''}">
  <meta property="og:type" content="website">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/assets/fonts/archivo-variable.woff2" as="font" type="font/woff2" crossorigin>
${css.map((c) => `  <link rel="stylesheet" href="/assets/css/${c}.css?v=${VERSION}">`).join('\n')}
</head>
<body${meta.bodyClass ? ` class="${meta.bodyClass}"` : ''}>
${shell}
${scripts.map((s) => `<script type="module" src="/assets/js/${s}.js?v=${VERSION}"></script>`).join('\n')}
</body>
</html>
`;
}

/** Maps a source filename to its built, servable path (a real directory + index.html for clean URLs). */
function outputPathFor(file, meta) {
  if (meta.output) return meta.output;
  if (file === 'index.html') return 'index.html';
  return `${file.replace(/\.html$/, '')}/index.html`;
}

// ─── Loading placeholders ─────────────────────────────────────────────────
// Page sources drop these in where JS fills content later, e.g. {{skeleton:cards:3}}.
// They're shaped like the real content so the page doesn't jump when it arrives.
const busy = (label, inner) => `<div class="sk-wrap" role="status" aria-label="${label}">${inner}<span class="sr-only">${label}</span></div>`;
const skCard = () => `<div class="sk-card" aria-hidden="true"><div class="skeleton sk-media"></div><div class="sk-body"><div class="skeleton sk-icon"></div><div class="skeleton sk-line w60 tall"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line w80"></div></div></div>`;
const skField = (w = '') => `<div class="sk-field"><div class="skeleton sk-line w40"></div><div class="skeleton sk-input ${w}"></div></div>`;
const SKELETONS = {
  cards: (n = 3) => busy('Loading…', `<div class="card-grid">${Array.from({ length: Number(n) }, skCard).join('')}</div>`),
  form: () => busy('Loading form…', `<div class="card card-pad sk-form" aria-hidden="true"><div class="sk-grid">${skField()}${skField()}</div>${skField('tall')}<div class="skeleton sk-btn"></div></div>`),
  estimate: () => busy('Loading the estimate calculator…', `<div class="estimate-layout" aria-hidden="true"><div class="card card-pad sk-form">${[1, 2, 3].map(() => `<div class="sk-grid three">${skField()}${skField()}${skField()}</div>`).join('')}<div class="skeleton sk-btn"></div></div><div class="sk-ticket"><div class="sk-ticket-head"></div><div class="sk-body"><div class="skeleton sk-line w60 tall"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line w80"></div><div class="skeleton sk-line w40"></div></div></div></div>`),
  tiles: () => busy('Loading map…', `<div class="tile-map sk-tiles" aria-hidden="true">${Object.values(DATA.TILE_POS).map(([c, r]) => `<span class="tile" style="--c:${c};--r:${r}"></span>`).join('')}</div>`),
};
const loader = (text) => `<div class="loader" role="status"><div class="loader-road" aria-hidden="true">${I('truck', 'i loader-truck')}</div><p>${text}</p></div>`;

function renderTokens(src) {
  return src
    .replace(/\{\{skeleton:(\w+)(?::(\d+))?\}\}/g, (_, kind, n) => SKELETONS[kind](n))
    .replace(/\{\{loader:([^}]+)\}\}/g, (_, text) => loader(text))
    .replace(/\{\{phone\}\}/g, `<a href="${telHref()}">${DATA.PHONE}</a>`)
    .replace(/\{\{email\}\}/g, `<a href="mailto:${DATA.EMAIL}">${DATA.EMAIL}</a>`)
    .replace(/\{\{icon:([\w-]+)(?::([\w\s-]+))?\}\}/g, (_, n, c) => I(n, c || 'i'));
}

// ─── Service detail pages (/services/<slug>) ──────────────────────────────
const escHtml = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function servicePage(svc, all, { serviceCard, fillGrid }) {
  const cat = DATA.SERVICE_CATEGORIES.find((c) => c.slug === svc.category);
  const siblings = all.filter((s) => s.category === svc.category && s.slug !== svc.slug);
  // Always exactly three related services — same category first, then the rest in order.
  const related = [...siblings, ...all.filter((s) => s.category !== svc.category)].slice(0, 3);
  const i = all.indexOf(svc);
  const prev = all[(i - 1 + all.length) % all.length];
  const next = all[(i + 1) % all.length];
  const paras = String(svc.description || svc.summary).split(/\n{2,}/).map((p) => `<p>${escHtml(p)}</p>`).join('');
  const check = (list) => `<ul class="checklist">${list.map((h) => `<li>${I('check')}${escHtml(h)}</li>`).join('')}</ul>`;

  const body = `<section class="page-hero svc-hero">
  <div class="wrap svc-hero-grid">
    <div>
      <ol class="crumbs"><li><a href="/">Home</a></li><li><a href="/services">Services</a></li><li><a href="/services#${cat.slug}">${escHtml(cat.name)}</a></li><li aria-current="page">${escHtml(svc.name)}</li></ol>
      <span class="hero-badge">${I(svc.icon || 'box')}${escHtml(cat.name)}</span>
      <h1>${escHtml(svc.name)}</h1>
      <p class="lead">${escHtml(svc.summary)}</p>
      <div class="actions">
        <a class="btn btn-primary btn-lg" href="/quote">Get a Free Quote</a>
        <a class="btn btn-light btn-lg" href="${telHref()}">${I('phone')}${DATA.PHONE}</a>
      </div>
    </div>
    <div class="media svc-hero-media"><img src="${escHtml(svc.imageUrl)}" alt="${escHtml(svc.imageAlt)}" width="1200" height="800" fetchpriority="high"></div>
  </div>
</section>

<section class="section">
  <div class="wrap svc-detail">
    <div class="svc-detail-main">
      <p class="kicker">About this service</p>
      <h2>How we handle your ${escHtml(svc.name.toLowerCase())}</h2>
      <div class="prose">${paras}</div>
      <div class="svc-detail-lists">
        <div class="detail-box"><h3>${I('check')}What’s included</h3>${check(svc.highlights || [])}</div>
        ${svc.idealFor?.length ? `<div class="detail-box"><h3>${I('users')}Ideal for</h3>${check(svc.idealFor)}</div>` : ''}
      </div>
      <div class="notice">${I('info')}<div><strong>Every move is quoted individually</strong>Your price depends on distance, the size of your move, your date and any extra services. Get an instant range on our <a class="link" href="/pricing#estimate">pricing page</a>, then a confirmed quote from our team.</div></div>
    </div>
    <aside class="svc-detail-side">
      <div class="side-card">
        <h3>Get a quote for ${escHtml(svc.name.toLowerCase())}</h3>
        <p>Free and no-obligation. We reply within one business day.</p>
        <a class="btn btn-primary btn-block" href="/quote">Request a Quote</a>
        <a class="btn btn-outline btn-block" href="/pricing#estimate">Instant estimate</a>
        <ul class="side-contact">
          <li>${I('phone')}<a href="${telHref()}">${DATA.PHONE}</a></li>
          <li>${I('mail')}<a href="mailto:${DATA.EMAIL}">${DATA.EMAIL}</a></li>
          <li>${I('pin')}<span>${DATA.ADDRESS.city}, ${DATA.ADDRESS.province}</span></li>
        </ul>
      </div>
      ${siblings.length ? `<nav class="side-card side-links" aria-label="More ${escHtml(cat.name)}">
        <h3>More in ${escHtml(cat.name)}</h3>
        <ul>${siblings.map((s) => `<li><a href="/services/${s.slug}">${I(s.icon || 'box')}<span>${escHtml(s.name)}</span>${I('arrow-right', 'i go')}</a></li>`).join('')}</ul>
      </nav>` : ''}
    </aside>
  </div>
</section>

<section class="section tint">
  <div class="wrap">
    <div class="section-head"><p class="kicker">How it works</p><h2>From quote to moving day</h2></div>
    <ol class="mini-steps">
      <li class="reveal"><span class="step-no">1</span><h3>Tell us about your move</h3><p>Share your route, dates and what needs moving in a quick quote request.</p></li>
      <li class="reveal"><span class="step-no">2</span><h3>Get a confirmed price</h3><p>We review the details and follow up by phone or email with your quote.</p></li>
      <li class="reveal"><span class="step-no">3</span><h3>Book your date</h3><p>Pick a date and arrival window that works for you, and we confirm it in writing.</p></li>
      <li class="reveal"><span class="step-no">4</span><h3>We handle the rest</h3><p>Our crew arrives prepared and keeps you updated until the job is done.</p></li>
    </ol>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head split">
      <div><p class="kicker">Related services</p><h2>You might also need</h2></div>
      <a class="btn btn-outline" href="/services">View all services</a>
    </div>
    ${fillGrid(related.map(serviceCard), {})}
    <nav class="pager-nav" aria-label="Browse services">
      <a href="/services/${prev.slug}" rel="prev">${I('arrow-right', 'i flip')}<span><small>Previous</small>${escHtml(prev.name)}</span></a>
      <a href="/services/${next.slug}" rel="next"><span><small>Next</small>${escHtml(next.name)}</span>${I('arrow-right')}</a>
    </nav>
  </div>
</section>

<section class="cta-band">
  <div class="media"><img src="https://images.unsplash.com/photo-1730154838368-c37b1fdebcf6?auto=format&fit=crop&w=2000&q=70" alt="" loading="lazy" width="2000" height="1200"></div>
  <div class="wrap cta-inner">
    <div><h2>Ready to book ${escHtml(svc.name.toLowerCase())}?</h2><p>Get a free, no-obligation quote and we’ll follow up with a confirmed price.</p></div>
    <div class="actions"><a class="btn btn-primary btn-lg" href="/quote">Get a Quote</a><a class="btn btn-light btn-lg" href="/contact">Contact Us</a></div>
  </div>
</section>`;
  return layout({
    title: `${svc.name} — RealMovingCanada`,
    description: svc.summary,
    scripts: ['site'],
  }, body);
}

function write(rel, html) {
  const out = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}

let DATA;
async function main() {
  const jsRoot = path.join(OUT, 'assets', 'js');
  DATA = await import(pathToFileURL(path.join(jsRoot, 'core', 'data.js')).href);
  const cards = await import(pathToFileURL(path.join(jsRoot, 'components', 'cards.js')).href);

  let count = 0;
  for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith('.html')).sort()) {
    const raw = fs.readFileSync(path.join(SRC, file), 'utf8');
    const m = raw.match(/^<!--meta\s+([\s\S]*?)-->\s*/);
    if (!m) throw new Error(`${file}: missing <!--meta {...}--> header`);
    const meta = JSON.parse(m[1]);
    const html = layout(meta, renderTokens(raw.slice(m[0].length)));
    write(outputPathFor(file, meta), html);
    count++;
    // The homepage is also reachable at the clean "/home" route.
    if (file === 'index.html') { write(path.join('home', 'index.html'), html); count++; }
  }

  // One page per service, e.g. /services/local-moving
  const all = DATA.FALLBACK_SERVICES;
  for (const svc of all) { write(path.join('services', svc.slug, 'index.html'), servicePage(svc, all, cards)); count++; }

  console.log(`[build] wrote ${count} pages`);
}
main().catch((err) => { console.error(err); process.exit(1); });
