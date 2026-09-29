import { $, imageFallbacks } from '../core/ui.js';
import { loadOptions, optionTags } from '../core/options.js';
import { loadAreas, loadReviews } from '../core/catalog.js';
import { PROVINCES, SERVICE_CATEGORIES } from '../core/data.js';
import { mountEstimate, applyRoute } from '../components/estimate.js';
import { categoryGrid, tileMap, reviewGrid, reviewInvite } from '../components/cards.js';
import { initCarousels } from '../components/carousel.js';
import { observeReveals } from '../site.js';

initCarousels();

// Hero route ticket → prefill the calculator and jump to it
const ticket = $('#route-ticket');
const provinceOpts = PROVINCES.map((p) => ({ value: p.code, label: p.name }));
ticket.from.insertAdjacentHTML('beforeend', optionTags(provinceOpts));
ticket.to.insertAdjacentHTML('beforeend', optionTags([...provinceOpts, { value: 'INTL', label: 'Outside Canada' }]));
loadOptions().then((o) => ticket.size.insertAdjacentHTML('beforeend', optionTags(o.propertySizes)));

const estimateEl = $('[data-estimate]');
const estimateReady = mountEstimate(estimateEl);

ticket.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!ticket.from.value || !ticket.to.value) { (ticket.from.value ? ticket.to : ticket.from).focus(); return; }
  const form = await estimateReady;
  applyRoute(form, { from: ticket.from.value, to: ticket.to.value, size: ticket.size.value });
  $('#estimate').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => form.elements['origin.city'].focus({ preventScroll: true }), 600);
});

$('[data-services]').innerHTML = categoryGrid(SERVICE_CATEGORIES);
$('[data-services]').removeAttribute('aria-busy');
imageFallbacks($('[data-services]'));
observeReveals();

loadAreas().then((areas) => { $('[data-tile-map]').removeAttribute('aria-busy'); $('[data-tile-map]').innerHTML = tileMap(areas.length === 13 ? areas : PROVINCES.map((p) => ({ ...p, isActive: areas.some((a) => a.code === p.code) }))); });

loadReviews(1, 3).then((data) => {
  const el = $('[data-reviews]');
  el.innerHTML = data.reviews.length ? reviewGrid(data.reviews) : reviewInvite();
  el.removeAttribute('aria-busy');
  observeReveals(el);
});
