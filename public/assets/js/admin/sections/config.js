import { $, $$, esc, icon, money, toast, handleForm } from '../../core/ui.js';
import { get, put, patch } from '../../core/api.js';
import { PROVINCES, REGION_ORDER } from '../../core/data.js';
import { view, box } from '../shared.js';

const changed = () => window.dispatchEvent(new Event('admin:changed'));
function saveBar(onSave) {
  const bar = document.createElement('div');
  bar.className = 'save-bar';
  bar.innerHTML = `<span class="msg" role="status"></span><button class="btn btn-outline btn-sm" type="button" data-reset>Discard changes</button><button class="btn btn-dark" type="button" data-save>Save changes</button>`;
  $('[data-save]', bar).addEventListener('click', async () => {
    const btn = $('[data-save]', bar);
    btn.setAttribute('aria-busy', 'true'); bar.querySelector('.msg').textContent = '';
    try { await onSave(); bar.querySelector('.msg').textContent = 'Saved just now.'; toast('Changes saved.'); }
    catch (err) { toast(err.message, 'error'); }
    finally { btn.removeAttribute('aria-busy'); }
  });
  $('[data-reset]', bar).addEventListener('click', () => location.hash === '#/pricing' ? pricing() : settings());
  return bar;
}

// ═══ Pricing ══════════════════════════════════════════════════════════════
export async function pricing() {
  const { pricing: p } = await get('/admin/pricing');
  view().innerHTML = `<div class="page-title"><div><h2>Pricing</h2><p>Powers the instant estimate calculator and the automatic quote estimate. Changes apply to new estimates immediately.</p></div></div>
    ${box('Base rates', `<div class="form-grid" data-base>
        <div class="field"><label for="pr-callout">Base call-out fee (CAD)</label><input id="pr-callout" data-k="baseFee" type="number" min="0" step="10" value="${p.baseFee}"></div>
        <div class="field"><label for="pr-perkm">Per-kilometre rate (CAD/km)</label><input id="pr-perkm" data-k="perKm" type="number" min="0" step="0.05" value="${p.perKm}"></div>
        <div class="field"><label for="pr-perhr">Local hourly rate (CAD/hour, crew)</label><input id="pr-perhr" data-k="perHour" type="number" min="0" step="5" value="${p.perHour}"></div>
        <div class="field"><label for="pr-lowpct">Estimate range — below (%)</label><input id="pr-lowpct" data-k="rangeLowPct" type="number" min="0" max="90" value="${p.rangeLowPct}"></div>
        <div class="field"><label for="pr-highpct">Estimate range — above (%)</label><input id="pr-highpct" data-k="rangeHighPct" type="number" min="0" max="200" value="${p.rangeHighPct}"></div>
      </div>`)}
    ${box('Property size multipliers', `<table class="table pricing-table"><thead><tr><th>Property size</th><th>Base hours</th><th>Multiplier</th></tr></thead><tbody data-sizes>${Object.entries(p.sizeFactors).map(([k, v]) => `
      <tr><td>${esc(v.label)}</td><td><input data-size="${k}" data-k="hours" type="number" min="0" step="0.5" value="${v.hours}"></td><td><input data-size="${k}" data-k="multiplier" type="number" min="0.1" step="0.05" value="${v.multiplier}"></td></tr>`).join('')}</tbody></table>`)}
    ${box('Move type multipliers', `<table class="table pricing-table"><thead><tr><th>Move type</th><th>Multiplier</th><th>Flat fee (CAD)</th></tr></thead><tbody data-types>${Object.entries(p.moveTypeFactors).map(([k, v]) => `
      <tr><td>${esc(v.label)}</td><td><input data-type="${k}" data-k="multiplier" type="number" min="0.1" step="0.05" value="${v.multiplier}"></td><td><input data-type="${k}" data-k="flatFee" type="number" min="0" step="10" value="${v.flatFee || 0}"></td></tr>`).join('')}</tbody></table>`)}
    ${box('Service add-ons', `<table class="table pricing-table"><thead><tr><th>Service</th><th>Flat fee (CAD)</th><th>% of subtotal</th></tr></thead><tbody data-services>${Object.entries(p.serviceFees).map(([k, v]) => `
      <tr><td>${esc(v.label)}</td><td><input data-svc="${k}" data-k="flatFee" type="number" min="0" step="5" value="${v.flatFee || 0}"></td><td><input data-svc="${k}" data-k="percent" type="number" min="0" step="1" value="${v.percent || 0}"></td></tr>`).join('')}</tbody></table>`)}
    ${box('Seasonal adjustment', `<table class="table pricing-table"><thead><tr><th>Period</th><th>Multiplier</th></tr></thead><tbody data-season>${Object.entries(p.seasonalFactors).map(([k, v]) => `
      <tr><td>${esc(v.label)}</td><td><input data-season="${k}" type="number" min="0.5" step="0.05" value="${v.multiplier}"></td></tr>`).join('')}</tbody></table><p class="hint" style="margin-top:.8rem">Applied by the moving date’s month. Summer months and weekends typically carry a premium.</p>`)}
    ${box('Minimum price', `<div class="field" style="max-width:220px"><label for="pr-min">Minimum estimate total (CAD)</label><input id="pr-min" data-k="minimumTotal" type="number" min="0" step="10" value="${p.minimumTotal}"></div>`)}`;

  const gather = () => {
    const num = (el) => Number(el.value);
    const out = JSON.parse(JSON.stringify(p));
    $$('[data-base] [data-k]', view()).forEach((el) => { out[el.dataset.k] = num(el); });
    $('#pr-min', view()) && (out.minimumTotal = num($('#pr-min', view())));
    $$('[data-sizes] input', view()).forEach((el) => { out.sizeFactors[el.dataset.size][el.dataset.k] = num(el); });
    $$('[data-types] input', view()).forEach((el) => { out.moveTypeFactors[el.dataset.type][el.dataset.k] = num(el); });
    $$('[data-services] input', view()).forEach((el) => { out.serviceFees[el.dataset.svc][el.dataset.k] = num(el); });
    $$('[data-season] input', view()).forEach((el) => { out.seasonalFactors[el.dataset.season].multiplier = num(el); });
    return out;
  };
  const bar = saveBar(async () => { await put('/admin/pricing', gather()); });
  bar.querySelector('.msg').textContent = `Last updated ${new Date(p.updatedAt || Date.now()).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' })}.`;
  view().append(bar);
  void money; void icon;
}

// ═══ Settings ═════════════════════════════════════════════════════════════
const SECTIONS = [
  { id: 'company', label: 'Company & logo' }, { id: 'contact', label: 'Contact & hours' },
  { id: 'social', label: 'Social media' }, { id: 'homepage', label: 'Homepage' },
  { id: 'about', label: 'About page' }, { id: 'reviews', label: 'Reviews' }, { id: 'notifications', label: 'Notifications' },
];

export async function settings() {
  const { settings: s } = await get('/admin/settings');
  const jump = new URLSearchParams(location.hash.split('?')[1] || '').get('section');
  view().innerHTML = `<div class="page-title"><div><h2>Settings</h2><p>Content and configuration shown across the public website.</p></div></div>
    <div class="seg" role="tablist" aria-label="Settings section" style="margin-bottom:1.25rem;flex-wrap:wrap">${SECTIONS.map((sec, i) => `<button type="button" data-sec="${sec.id}" class="${i === 0 ? 'on' : ''}">${esc(sec.label)}</button>`).join('')}</div>
    <div data-panel></div>`;
  const panel = $('[data-panel]', view());
  const renderers = { company: companyPanel, contact: contactPanel, social: socialPanel, homepage: homepagePanel, about: aboutPanel, reviews: reviewsPanel, notifications: notificationsPanel };
  let current = jump && renderers[jump] ? jump : 'company';
  const show = (id) => {
    current = id;
    $$('[data-sec]', view()).forEach((b) => b.classList.toggle('on', b.dataset.sec === id));
    panel.innerHTML = '';
    panel.append(renderers[id](s));
  };
  $$('[data-sec]', view()).forEach((b) => b.addEventListener('click', () => show(b.dataset.sec)));
  show(current);
}

function panelBox(title, bodyHtml, gather) {
  const wrap = document.createElement('div');
  wrap.innerHTML = box(title, bodyHtml);
  const bar = saveBar(async () => { await patch('/admin/settings', gather(wrap)); changed(); });
  wrap.append(bar);
  return wrap;
}

function companyPanel(s) {
  const c = s.company || {};
  return panelBox('Company & logo', `<div class="form-grid" style="--cols:1">
    <div class="field"><label for="co-name">Company name</label><input id="co-name" data-k="name" value="${esc(c.name || 'RealMovingCanada')}" maxlength="120"></div>
    <div class="field"><label for="co-logo">Logo URL <span class="opt">(SVG or PNG; leave blank to use the default placeholder mark)</span></label><input id="co-logo" data-k="logoUrl" type="url" value="${esc(c.logoUrl || '')}" maxlength="500"></div>
    <div class="img-picker"><img class="preview logo" src="${esc(c.logoUrl || '/assets/img/logo.svg')}" alt="Current logo preview"><p class="small muted" style="margin:0">Preview. Replacing the placeholder logo updates it across the whole website.</p></div>
  </div>`, (wrap) => ({ company: { ...c, name: val(wrap, 'name'), logoUrl: val(wrap, 'logoUrl') } }));
}

function contactPanel(s) {
  const c = s.contact || {}; const h = s.hours || { rows: [] };
  const rows = h.rows.length ? h.rows : [{ label: 'Monday – Friday', hours: '' }, { label: 'Saturday', hours: '' }, { label: 'Sunday', hours: '' }];
  const el = panelBox('Contact & hours', `<div class="form-grid">
    <div class="field"><label for="ct-phone">Phone number</label><input id="ct-phone" data-k="phone" value="${esc(c.phone || '')}" maxlength="30" placeholder="e.g. (555) 555-0123"></div>
    <div class="field"><label for="ct-email">Email address</label><input id="ct-email" data-k="email" type="email" value="${esc(c.email || '')}" maxlength="254" placeholder="e.g. hello@realmovingcanada.ca"></div>
    <div class="field span-all"><label for="ct-area">Service area summary <span class="opt">(shown on the contact page)</span></label><input id="ct-area" data-k="serviceAreaSummary" value="${esc(c.serviceAreaSummary || '')}" maxlength="300"></div>
    </div>
    <h4 style="margin:1.4rem 0 .6rem">Business hours</h4>
    <div class="form-grid" data-hours>${rows.map((r, i) => `<div class="field"><label for="hr-l-${i}">Label</label><input id="hr-l-${i}" data-hour-label value="${esc(r.label)}" maxlength="40"></div><div class="field"><label for="hr-h-${i}">Hours</label><input id="hr-h-${i}" data-hour-value value="${esc(r.hours)}" maxlength="60" placeholder="e.g. 8:00 am – 6:00 pm, or Closed"></div>`).join('')}</div>`,
  (wrap) => ({ contact: { ...c, phone: val(wrap, 'phone'), email: val(wrap, 'email'), serviceAreaSummary: val(wrap, 'serviceAreaSummary') },
    hours: { rows: [...wrap.querySelectorAll('[data-hour-label]')].map((el2, i) => ({ label: el2.value.trim(), hours: wrap.querySelectorAll('[data-hour-value]')[i].value.trim() })) } }));
  return el;
}

function socialPanel(s) {
  const soc = s.social || {};
  const platforms = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['linkedin', 'LinkedIn'], ['x', 'X (Twitter)'], ['youtube', 'YouTube'], ['tiktok', 'TikTok']];
  return panelBox('Social media', `<div class="form-grid">${platforms.map(([k, l]) => `<div class="field"><label for="sc-${k}">${l}</label><input id="sc-${k}" data-social="${k}" type="url" value="${esc(soc[k] || '')}" placeholder="Leave blank to hide"></div>`).join('')}</div><p class="hint" style="margin-top:.8rem">Only filled-in links appear in the website footer and contact page.</p>`,
    (wrap) => ({ social: Object.fromEntries(platforms.map(([k]) => [k, wrap.querySelector(`[data-social="${k}"]`).value.trim()])) }));
}

function homepagePanel(s) {
  const h = s.homepage || {};
  const trust = (h.trust && h.trust.length === 4) ? h.trust : ['Professional Moving Services', 'Canada-Wide Coverage', 'Free Estimates', 'Reliable & Insured Service'];
  return panelBox('Homepage', `<div class="form-grid" style="--cols:1">
    <div class="field"><label for="hp-h">Hero headline</label><input id="hp-h" data-k="heroHeadline" value="${esc(h.heroHeadline || 'Moving Across Canada, Made Simple.')}" maxlength="120"></div>
    <div class="field"><label for="hp-t">Hero description</label><textarea id="hp-t" data-k="heroText" rows="3" maxlength="500">${esc(h.heroText || '')}</textarea></div>
    <div class="field"><label for="hp-img">Hero image URL <span class="opt">(optional)</span></label><input id="hp-img" data-k="heroImageUrl" type="url" value="${esc(h.heroImageUrl || '')}"></div>
    </div>
    <h4 style="margin:1.4rem 0 .6rem">Trust indicators (4)</h4>
    <div class="form-grid" data-trust>${trust.map((t, i) => `<div class="field"><label for="tr-${i}" class="sr-only">Trust indicator ${i + 1}</label><input id="tr-${i}" data-trust-item value="${esc(t)}" maxlength="60"></div>`).join('')}</div>`,
    (wrap) => ({ homepage: { ...h, heroHeadline: val(wrap, 'heroHeadline'), heroText: val(wrap, 'heroText'), heroImageUrl: val(wrap, 'heroImageUrl'), trust: [...wrap.querySelectorAll('[data-trust-item]')].map((el) => el.value.trim()).filter(Boolean) } }));
}

function aboutPanel(s) {
  const a = s.about || {};
  return panelBox('About page', `<div class="form-grid" style="--cols:1">
    <div class="field"><label for="ab-story">Company story</label><textarea id="ab-story" data-k="story" rows="6" maxlength="4000" placeholder="Use [Brackets] for anything you haven't decided yet — they show as a visible placeholder on the page.">${esc(a.story || '')}</textarea></div>
    <div class="field"><label for="ab-mission">Mission statement</label><textarea id="ab-mission" data-k="mission" rows="3" maxlength="600">${esc(a.mission || '')}</textarea></div>
  </div><p class="hint" style="margin-top:.6rem">Bracketed text like [add years in business] renders as a highlighted placeholder note on the live page until you replace it.</p>`,
    (wrap) => ({ about: { story: val(wrap, 'story'), mission: val(wrap, 'mission') } }));
}

function reviewsPanel(s) {
  const r = s.reviews || {};
  const fmt = r.displayNameFormat || 'first_last_initial';
  return panelBox('Reviews', `<div class="form-grid" style="--cols:1">
    <fieldset><legend>Default display name format for new reviews</legend>
      <div class="chips">
        <label class="chip"><input type="radio" name="dnf" value="first_last_initial" ${fmt === 'first_last_initial' ? 'checked' : ''}><span>First name + last initial (e.g. “Sarah T.”)</span></label>
        <label class="chip"><input type="radio" name="dnf" value="first_only" ${fmt === 'first_only' ? 'checked' : ''}><span>First name only</span></label>
        <label class="chip"><input type="radio" name="dnf" value="full_name" ${fmt === 'full_name' ? 'checked' : ''}><span>Full name</span></label>
      </div></fieldset>
    <label class="check"><input type="checkbox" data-k="requireApproval" data-bool ${r.requireApproval !== false ? 'checked' : ''}> Require admin approval before a review is published</label>
  </div>`, (wrap) => ({ reviews: { displayNameFormat: wrap.querySelector('[name=dnf]:checked')?.value || fmt, requireApproval: wrap.querySelector('[data-k=requireApproval]').checked } }));
}

function notificationsPanel(s) {
  const n = s.notifications || {};
  return panelBox('Notifications', `<div class="form-grid" style="--cols:1">
    <div class="field"><label for="nt-email">Team notification email</label><input id="nt-email" data-k="teamEmail" type="email" value="${esc(n.teamEmail || '')}" placeholder="e.g. dispatch@realmovingcanada.ca"><p class="hint">New quotes, bookings and contact messages are sent here.</p></div>
    <label class="check"><input type="checkbox" data-k="emailOnQuote" data-bool ${n.emailOnQuote !== false ? 'checked' : ''}> Email the team on new quote requests</label>
    <label class="check"><input type="checkbox" data-k="emailOnBooking" data-bool ${n.emailOnBooking !== false ? 'checked' : ''}> Email the team on new booking requests</label>
    <label class="check"><input type="checkbox" data-k="emailOnMessage" data-bool ${n.emailOnMessage !== false ? 'checked' : ''}> Email the team on new contact messages</label>
  </div>`, (wrap) => ({ notifications: { teamEmail: val(wrap, 'teamEmail'), emailOnQuote: wrap.querySelector('[data-k=emailOnQuote]').checked, emailOnBooking: wrap.querySelector('[data-k=emailOnBooking]').checked, emailOnMessage: wrap.querySelector('[data-k=emailOnMessage]').checked } }));
}

const val = (wrap, key) => wrap.querySelector(`[data-k="${key}"]`)?.value.trim() ?? '';
void PROVINCES; void REGION_ORDER;
