import { esc, icon, stars, initials, fmtDate } from '../core/ui.js';
import { TILE_POS } from '../core/data.js';

const img = (s, cls = '') => `<div class="media ${cls}"><img src="${esc(s.imageUrl || '')}" alt="${esc(s.imageAlt || '')}" loading="lazy" decoding="async" width="1200" height="800"></div>`;

/**
 * Card grid that never leaves a lonely last row. Grids are 3 columns on
 * desktop, 2 on tablets and 1 on phones; when the item count doesn't divide
 * evenly, a call-to-action card is added that spans exactly the empty slots
 * at each breakpoint (and is hidden where the row is already full).
 */
export function fillGrid(items, fill, cls = '') {
  const n = items.length;
  const lg = (3 - (n % 3)) % 3;
  const md = (2 - (n % 2)) % 2;
  const filler = lg || md ? gridFill(fill, lg, md) : '';
  return `<div class="card-grid ${cls}">${items.join('')}${filler}</div>`;
}

function gridFill({ title, text, actions = [], variant = '' } = {}, lg, md) {
  const btns = actions.map((a, i) => `<a class="btn ${a.cls || (i ? 'btn-outline' : 'btn-primary')}" href="${esc(a.href)}">${a.icon ? icon(a.icon) : ''}${esc(a.label)}</a>`).join('');
  return `<aside class="grid-fill ${variant} reveal" data-lg="${lg}" data-md="${md}" style="--fill-lg:${lg || 1};--fill-md:${md || 1}">
    <div class="grid-fill-copy"><h3>${esc(title)}</h3>${text ? `<p>${esc(text)}</p>` : ''}</div>
    ${btns ? `<div class="grid-fill-actions">${btns}</div>` : ''}
  </aside>`;
}

/** Filler used after lists of services: nudges visitors who haven't found their exact need. */
export const SERVICE_FILL = {
  title: 'Need something that isn’t listed?',
  text: 'Every move is different. Tell us what you need and we’ll put together a plan and a price.',
  actions: [{ label: 'Get a Quote', href: '/quote' }, { label: 'Ask a question', href: '/contact' }],
};

/** A single service, linking to its own detail page. */
export function serviceCard(s) {
  return `<a class="svc-card reveal" href="/services/${esc(s.slug)}">
    ${img(s)}
    <div class="body">
      <span class="thumb-icon">${icon(s.icon || 'box')}</span>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.summary)}</p>
      <span class="more">View details ${icon('arrow-right')}</span>
    </div>
  </a>`;
}

/** Homepage teaser: one card per top-level service category, linking into its section on /services. */
export function categoryGrid(categories) {
  return fillGrid(categories.map((c) => `
    <a class="svc-card reveal" href="/services#${esc(c.slug)}">
      ${img(c)}
      <div class="body">
        <span class="thumb-icon">${icon(c.icon || 'box')}</span>
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.summary)}</p>
        <span class="more">Explore ${icon('arrow-right')}</span>
      </div>
    </a>`), {
    title: 'Not sure where to start?',
    text: 'See every service in one place, or get a price range for your move in seconds.',
    actions: [{ label: 'View all services', href: '/services', cls: 'btn-primary' }, { label: 'Instant estimate', href: '/pricing#estimate' }],
  });
}

/** Shorter labels so every name fits on a map tile (full names stay in the tooltip). */
const TILE_LABEL = { SK: 'Sask.', NL: 'Nfld. & Labrador', NT: 'N.W.T.', PE: 'P.E.I.', NB: 'New Brunswick', BC: 'British Columbia' };

export function tileMap(provinces, { light = false, hrefBase = '/service-areas' } = {}) {
  return `<nav class="tile-map${light ? ' light' : ''}" aria-label="Provinces and territories">${provinces.map((p) => {
    const [c, r] = TILE_POS[p.code] || [1, 1];
    const active = p.isActive !== false;
    return `<a class="tile${active ? ' active' : ''}" href="${hrefBase}#${p.code.toLowerCase()}" style="--c:${c};--r:${r}" title="${esc(p.name)}${active ? '' : ' (not currently listed)'}">
      <strong>${p.code}</strong><span>${esc(TILE_LABEL[p.code] || p.name)}</span></a>`;
  }).join('')}</nav>`;
}

export function reviewCard(r) {
  return `<article class="review-card reveal">
    ${stars(r.rating)}
    ${r.title ? `<h3>${esc(r.title)}</h3>` : ''}
    <blockquote>${esc(r.body).replace(/\n/g, '<br>')}</blockquote>
    <footer><span class="avatar" aria-hidden="true">${esc(initials(r.displayName))}</span>
      <div><strong>${esc(r.displayName)}</strong><div class="tiny muted">${fmtDate(r.date)}</div></div></footer>
  </article>`;
}

/** Review cards in a filled grid — the spare slot invites the visitor to leave their own review. */
export const reviewGrid = (reviews) => fillGrid(reviews.map(reviewCard), {
  title: 'Moved with us?',
  text: 'Tell other families and businesses how your move went.',
  actions: [{ label: 'Share your experience', href: '/reviews#write', cls: 'btn-dark' }],
});

export function reviewInvite() {
  return `<div class="review-invite">
    ${icon('message')}
    <div><h3>Moved with RealMovingCanada?</h3><p>Customer reviews appear here once they’ve been read and approved by our team. We’d love to hear about your move.</p></div>
    <a class="btn btn-dark" href="/reviews#write">Share your experience</a>
  </div>`;
}
