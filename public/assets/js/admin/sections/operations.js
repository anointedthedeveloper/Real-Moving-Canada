import { $, $$, esc, icon, money, priceRange, fmtDate, fmtDateTime, timeAgo, badge, place, toast, confirmDialog, handleForm, debounce, pager, todayIso } from '../../core/ui.js';
import { get, post, patch, del } from '../../core/api.js';
import { loadOptions, labelFor } from '../../core/options.js';
import { QUOTE_LABELS, BOOKING_LABELS } from '../../core/data.js';
import { view, openDrawer, setDrawer, box, loading, emptyRow, hashQuery, setHashQuery, toQuery, bindRows, selectOpts, notesBlock, adminTimeline } from '../shared.js';

const changed = () => window.dispatchEvent(new Event('admin:changed'));
const routeText = (r) => `${esc(place(r.origin))} → ${esc(place(r.destination))}`;

// ═══ Overview ═════════════════════════════════════════════════════════════
export async function overview() {
  const d = await get('/admin/overview');
  const s = d.stats;
  const tile = (href, ic, label, value, attention) => `<a class="stat${attention ? ' attention' : ''}" href="${href}"><span class="label">${icon(ic)}${label}</span><span class="value">${value}</span></a>`;
  const todo = d.checklist.filter((c) => !c.done);
  view().innerHTML = `
    <div class="stats">
      ${tile('#/customers', 'users', 'Total customers', s.totalCustomers)}
      ${tile('#/quotes?status=submitted', 'file', 'Pending quotes', s.pendingQuotes, s.pendingQuotes > 0)}
      ${tile('#/bookings?status=active', 'calendar', 'Active bookings', s.activeBookings, s.newBookings > 0)}
      ${tile('#/bookings?status=completed', 'check', 'Completed bookings', s.completedBookings)}
      ${tile('#/reviews?status=pending', 'star', 'Pending reviews', s.pendingReviews, s.pendingReviews > 0)}
      ${tile('#/messages?status=unread', 'message', 'Unread messages', s.unreadMessages, s.unreadMessages > 0)}
    </div>
    <div class="grid-3">
      <div>
        ${todo.length ? box('Finish setting up your website', `<ul class="checklist-admin">${d.checklist.map((c) => `<li class="${c.done ? 'done' : ''}"><span class="tick">${c.done ? icon('check') : ''}</span><span>${esc(c.label)}</span>${c.done ? '' : `<a class="link small" style="margin-left:auto" href="#/settings?section=${c.section}">Fix</a>`}</li>`).join('')}</ul>`) : ''}
        <section class="box"><div class="box-head"><h3>Upcoming confirmed moves</h3><a class="link small" href="#/bookings?status=confirmed&sort=move_date">All</a></div>
          <div class="table-wrap"><table class="table"><tbody>${d.upcomingMoves.length ? d.upcomingMoves.map((b) => `
            <tr data-href="#/bookings/${b.id}"><td><strong>${fmtDate(b.scheduledDate || b.preferredDate)}</strong><span class="sub">${esc(b.scheduledWindowLabel || b.preferredTimeLabel)}</span></td>
            <td>${esc(b.customer?.name || '')}<span class="sub">${routeText(b)}</span></td><td class="num"><span class="ref">${esc(b.reference)}</span></td></tr>`).join('')
            : emptyRow(3, 'No confirmed moves coming up.')}</tbody></table></div></section>
        <section class="box"><div class="box-head"><h3>Latest quote requests</h3><a class="link small" href="#/quotes">All</a></div>
          <div class="table-wrap"><table class="table"><tbody>${d.recentQuotes.length ? d.recentQuotes.map((q) => `
            <tr data-href="#/quotes/${q.id}"><td><span class="ref">${esc(q.reference)}</span><span class="sub">${timeAgo(q.createdAt)}</span></td>
            <td>${esc(q.customer.name)}<span class="sub">${routeText(q)}</span></td><td class="num">${priceRange(q.estimate.min, q.estimate.max)}</td><td>${badge(q.status, q.statusLabel)}</td></tr>`).join('')
            : emptyRow(4, 'No quote requests yet.')}</tbody></table></div></section>
      </div>
      <section class="box"><div class="box-head"><h3>Activity</h3><a class="link small" href="#/notifications">All</a></div>${notifItems(d.notifications)}</section>
    </div>`;
  $$('tr[data-href]', view()).forEach((tr) => { tr.classList.add('clickable'); tr.tabIndex = 0; tr.onclick = () => { location.hash = tr.dataset.href; }; });
}

const notifItems = (list) => (list.length ? `<ul class="notif-list">${list.map((n) => `<li class="${n.isRead ? '' : 'unread'}"><span class="dot"></span><div style="flex:1;min-width:0">
  <a href="${esc(n.link || '#/notifications')}" data-nid="${n.id}"><div class="n-title">${esc(n.title)}</div></a>${n.body ? `<div class="n-body">${esc(n.body)}</div>` : ''}<div class="n-meta">${timeAgo(n.createdAt)}</div></div></li>`).join('')}</ul>`
  : '<div class="box-body"><p class="muted" style="margin:0">No activity yet.</p></div>');

document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-nid]');
  if (a) patch(`/admin/notifications/${a.dataset.nid}`, { isRead: true }).then(changed).catch(() => {});
});

// ═══ Generic list scaffolding ═════════════════════════════════════════════
function listShell({ base, filters, head, cols }) {
  view().innerHTML = `<section class="box"><form class="filters" data-filters role="search">${filters}</form>
    <div class="table-wrap"><table class="table responsive"><thead><tr>${head}</tr></thead><tbody data-rows><tr><td colspan="${cols}">${loading}</td></tr></tbody></table></div><div data-pager></div></section>`;
  const form = $('[data-filters]', view());
  const q = hashQuery();
  for (const el of form.elements) if (el.name && q[el.name] != null) el.value = q[el.name];
  return form;
}
const searchInput = (ph) => `<div class="field search">${icon('search')}<label class="sr-only" for="f-q">Search</label><input id="f-q" name="q" type="search" placeholder="${ph}"></div>`;

function wireList(form, base, load) {
  let page = Number(hashQuery().page) || 1;
  const run = () => {
    const params = Object.fromEntries(new FormData(form));
    setHashQuery(base, { ...params, page: page > 1 ? page : '' });
    return load(params, page, (p) => { page = p; run(); });
  };
  form.addEventListener('input', debounce(() => { page = 1; run(); }, 300));
  form.addEventListener('change', () => { page = 1; run(); });
  form.addEventListener('submit', (e) => e.preventDefault());
  return run;
}

// ═══ Quotes ═══════════════════════════════════════════════════════════════
export async function quotes(id) {
  const opts = await loadOptions();
  const form = listShell({
    base: 'quotes', cols: 6,
    filters: `${searchInput('Search reference, name, email or city')}
      <select name="status" aria-label="Status">${selectOpts(Object.entries(QUOTE_LABELS), '', 'All statuses')}</select>
      <select name="moveType" aria-label="Move type">${selectOpts(opts.moveTypes.map((o) => [o.value, o.label]), '', 'All move types')}</select>
      <input type="date" name="from" aria-label="Requested from"><input type="date" name="to" aria-label="Requested to">`,
    head: '<th>Quote</th><th>Customer</th><th>Route</th><th>Moving date</th><th class="num">Estimate</th><th>Status</th>',
  });
  const run = wireList(form, 'quotes', async (params, page, go) => {
    const d = await get(`/admin/quotes${toQuery({ ...params, page })}`);
    $('[data-rows]', view()).innerHTML = d.quotes.length ? d.quotes.map((q) => `<tr data-id="${q.id}">
      <td><span class="ref">${esc(q.reference)}</span><span class="sub">${fmtDate(q.createdAt)}</span></td>
      <td>${esc(q.customer.name)}<span class="sub">${esc(q.customer.email)}</span></td>
      <td data-hide-sm>${routeText(q)}<span class="sub">${esc(q.propertySizeLabel)} · ${esc(q.moveTypeLabel)}</span></td>
      <td data-hide-sm>${fmtDate(q.moveDate)}</td>
      <td class="num">${q.final ? `<strong>${priceRange(q.final.min, q.final.max)}</strong><span class="sub">Final</span>` : priceRange(q.estimate.min, q.estimate.max)}</td>
      <td>${badge(q.status, q.statusLabel)}</td></tr>`).join('') : emptyRow(6, 'No quotes match these filters.');
    $('[data-pager]', view()).innerHTML = pager(d.pagination, go);
    bindRows(view(), (qid) => { location.hash = `#/quotes/${qid}`; });
  });
  quotes.refresh = run;
  await run();
  if (id) openQuote(id);
}
quotes.open = (id) => openQuote(id);

async function openQuote(id) {
  openDrawer('Quote', loading, { onClose: () => history.replaceState(null, '', '#/quotes') });
  const [d, opts] = await Promise.all([get(`/admin/quotes/${id}`), loadOptions()]);
  renderQuote(d, opts);
}

function renderQuote(d, opts) {
  const q = d.quote;
  const est = q.estimate;
  const statusChoices = d.allowedStatuses.concat(q.status === 'finalized' ? ['finalized'] : []);
  const body = setDrawer(`
    <div class="page-title" style="margin-bottom:1rem"><div><h2>${esc(q.reference)}</h2><p>Requested ${fmtDateTime(q.createdAt)}</p></div>${badge(q.status, q.statusLabel)}</div>
    ${box('Customer', `<dl class="dl"><dt>Name</dt><dd><a class="link" href="#/customers/${d.customer.id}">${esc(q.customer.name)}</a></dd>
      <dt>Email</dt><dd><a href="mailto:${esc(q.customer.email)}">${esc(q.customer.email)}</a></dd>
      <dt>Phone</dt><dd><a href="tel:${esc(q.customer.phone.replace(/[^\d+]/g, ''))}">${esc(q.customer.phone)}</a></dd>
      <dt>History</dt><dd>${d.customer.quoteCount} quote(s), ${d.customer.bookingCount} booking(s)${d.customer.isActive === false ? ' · <span class="badge s-disabled">Account disabled</span>' : ''}</dd></dl>`)}
    ${box('Move', `<dl class="dl"><dt>From</dt><dd>${esc([q.origin.city, q.origin.provinceName, q.origin.postalCode].filter(Boolean).join(', '))}</dd>
      <dt>To</dt><dd>${esc([q.destination.city, q.destination.country || q.destination.provinceName, q.destination.postalCode].filter(Boolean).join(', '))}</dd>
      <dt>Moving date</dt><dd>${fmtDate(q.moveDate)}</dd><dt>Type / size</dt><dd>${esc(q.moveTypeLabel)} · ${esc(q.propertySizeLabel)}</dd>
      <dt>Services</dt><dd>${esc(q.serviceLabels.join(', ') || 'None')}</dd><dt>Inventory</dt><dd>${esc(q.inventory || '—').replace(/\n/g, '<br>')}</dd><dt>Notes</dt><dd>${esc(q.notes || '—')}</dd></dl>
      ${d.bookings.length ? `<p class="small" style="margin:1rem 0 0">Linked bookings: ${d.bookings.map((b) => `<a class="link" href="#/bookings/${b.id}">${esc(b.reference)}</a> ${badge(b.status, BOOKING_LABELS[b.status])}`).join(' ')}</p>` : ''}`)}
    ${box('Estimate calculation', `<table class="lines"><tbody>${(est.lines || []).map((l) => `<tr><td>${esc(l.label)}${l.detail ? `<span class="detail">${esc(l.detail)}</span>` : ''}</td><td>${money(l.amount)}</td></tr>`).join('')}</tbody>
      <tfoot><tr><td>Calculated total</td><td>${money(est.total)}</td></tr><tr><td>Range shown to customer${est.range ? ` (−${est.range.lowPct}% / +${est.range.highPct}%)` : ''}</td><td>${priceRange(est.min, est.max)}</td></tr></tfoot></table>
      ${est.distance ? `<p class="small muted" style="margin:.8rem 0 0">${esc(est.distance.note || '')} Method: ${esc(est.distance.method)}.</p>` : ''}
      ${est.notes?.length ? `<div class="estimate-notes" style="margin-top:.8rem">${est.notes.map(esc).join('<br>')}</div>` : ''}
      <p class="tiny muted" style="margin:.6rem 0 0">Pricing configuration version ${q.pricingVersion ?? '—'}.</p>`)}
    ${q.final ? box('Final quote', `<div class="estimate-price" style="font-size:1.7rem">${priceRange(q.final.min, q.final.max)}<span class="cur">CAD</span></div>${q.final.message ? `<p style="margin:.6rem 0 0">${esc(q.final.message)}</p>` : ''}<p class="tiny muted" style="margin:.4rem 0 0">Finalized ${fmtDateTime(q.final.finalizedAt)}</p>`) : ''}
    ${statusChoices.length ? box('Update status', `<form data-status-form novalidate><div class="form-alert" role="alert"></div>
      <div class="form-grid"><div class="field"><label for="qs-status">New status</label><select id="qs-status" name="status">${selectOpts(statusChoices.map((s) => [s, s === q.status ? `${QUOTE_LABELS[s]} (update price)` : QUOTE_LABELS[s]]), statusChoices[0])}</select></div>
        <div data-final class="field" hidden><label for="qs-min">Final price (CAD)</label><div style="display:flex;gap:.5rem;align-items:center"><input id="qs-min" name="finalPriceMin" type="number" min="0" step="1" placeholder="Min" value="${q.final?.min ?? est.min}"><span>–</span><input name="finalPriceMax" type="number" min="0" step="1" placeholder="Max (optional)" aria-label="Final price maximum" value="${q.final?.max ?? ''}"></div><p class="hint">Leave max empty for a fixed price.</p></div>
        <div class="field span-all"><label for="qs-msg">Message to customer <span class="opt">(optional)</span></label><textarea id="qs-msg" name="message" rows="2" maxlength="1000"></textarea></div>
        <label class="check span-all"><input type="checkbox" name="notify" data-bool checked> Notify the customer (in-app and email)</label></div>
      <button class="btn btn-dark" type="submit" style="margin-top:1rem">Save status</button></form>`) : ''}
    ${box('Adjust details', `<form data-details-form novalidate><div class="form-alert" role="alert"></div><div class="form-grid">
      <div class="field"><label for="qd-date">Moving date</label><input id="qd-date" type="date" name="moveDate" value="${esc(q.moveDate)}" required></div>
      <div class="field"><label for="qd-type">Move type</label><select id="qd-type" name="moveType">${selectOpts(opts.moveTypes.map((o) => [o.value, o.label]), q.moveType)}</select></div>
      <div class="field"><label for="qd-size">Property size</label><select id="qd-size" name="propertySize">${selectOpts(opts.propertySizes.map((o) => [o.value, o.label]), q.propertySize)}</select></div>
      <div class="field span-all"><span class="label">Services</span><div class="chips">${opts.services.map((s) => `<label class="chip"><input type="checkbox" name="services" value="${s.value}"${q.services.includes(s.value) ? ' checked' : ''}><span>${esc(s.label)}</span></label>`).join('')}</div></div>
      <div class="field span-all"><label for="qd-inv">Inventory</label><textarea id="qd-inv" name="inventory" rows="3" maxlength="3000">${esc(q.inventory || '')}</textarea></div>
      <label class="check span-all"><input type="checkbox" name="recalculate" data-bool> Recalculate the automatic estimate with current pricing</label></div>
      <button class="btn btn-outline" type="submit" style="margin-top:1rem">Save details</button></form>`)}
    ${box('Internal notes', notesBlock(d.notes))}
    ${box('History', adminTimeline(d.events))}`);

  const sf = $('[data-status-form]', body);
  if (sf) {
    const toggle = () => { $('[data-final]', sf).hidden = sf.status.value !== 'finalized'; };
    sf.status.addEventListener('change', toggle); toggle();
    handleForm(sf, (data) => {
      if (data.status !== 'finalized') { delete data.finalPriceMin; delete data.finalPriceMax; }
      return post(`/admin/quotes/${q.id}/status`, data);
    }, { onSuccess: (nd) => { toast('Quote updated.'); renderQuote(nd, opts); quotes.refresh?.(); changed(); } });
  }
  handleForm($('[data-details-form]', body), (data) => patch(`/admin/quotes/${q.id}`, data), { onSuccess: (nd) => { toast('Quote details saved.'); renderQuote(nd, opts); quotes.refresh?.(); } });
  handleForm($('[data-note-form]', body), (data) => post(`/admin/quotes/${q.id}/notes`, data), { onSuccess: (nd) => { toast('Note added.'); renderQuote(nd, opts); } });
}

// ═══ Bookings ═════════════════════════════════════════════════════════════
const ACTION_LABELS = { under_review: 'Mark under review', confirmed: 'Confirm booking', completed: 'Mark completed', cancelled: 'Cancel booking', pending: 'Return to pending' };

export async function bookings(id) {
  const opts = await loadOptions();
  const form = listShell({
    base: 'bookings', cols: 6,
    filters: `${searchInput('Search reference, name, email or city')}
      <select name="status" aria-label="Status">${selectOpts([['active', 'Active (pending → confirmed)'], ...Object.entries(BOOKING_LABELS)], '', 'All statuses')}</select>
      <select name="moveType" aria-label="Move type">${selectOpts(opts.moveTypes.map((o) => [o.value, o.label]), '', 'All move types')}</select>
      <input type="date" name="from" aria-label="Move date from"><input type="date" name="to" aria-label="Move date to">
      <select name="sort" aria-label="Sort">${selectOpts([['newest', 'Newest first'], ['move_date', 'By moving date']], 'newest')}</select>`,
    head: '<th>Booking</th><th>Customer</th><th>Moving date</th><th>Route</th><th>Property</th><th>Status</th>',
  });
  const run = wireList(form, 'bookings', async (params, page, go) => {
    const d = await get(`/admin/bookings${toQuery({ ...params, page })}`);
    $('[data-rows]', view()).innerHTML = d.bookings.length ? d.bookings.map((b) => `<tr data-id="${b.id}">
      <td><span class="ref">${esc(b.reference)}</span><span class="sub">${fmtDate(b.createdAt)}</span></td>
      <td>${esc(b.customer?.name || '')}<span class="sub">${esc(b.contactPhone)}</span></td>
      <td>${fmtDate(b.scheduledDate || b.preferredDate)}<span class="sub">${esc(b.scheduledWindowLabel || b.preferredTimeLabel)}${b.scheduledDate ? '' : ' · requested'}</span></td>
      <td data-hide-sm>${routeText(b)}</td>
      <td data-hide-sm>${esc(b.propertyTypeLabel)}<span class="sub">${esc(b.propertySizeLabel)}</span></td>
      <td>${badge(b.status, b.statusLabel)}</td></tr>`).join('') : emptyRow(6, 'No booking requests match these filters.');
    $('[data-pager]', view()).innerHTML = pager(d.pagination, go);
    bindRows(view(), (bid) => { location.hash = `#/bookings/${bid}`; });
  });
  bookings.refresh = run;
  await run();
  if (id) openBooking(id);
}
bookings.open = (id) => openBooking(id);

async function openBooking(id) {
  openDrawer('Booking request', loading, { onClose: () => history.replaceState(null, '', '#/bookings') });
  const [d, opts] = await Promise.all([get(`/admin/bookings/${id}`), loadOptions()]);
  renderBooking(d, opts);
}

function renderBooking(d, opts) {
  const b = d.booking;
  const body = setDrawer(`
    <div class="page-title" style="margin-bottom:1rem"><div><h2>${esc(b.reference)}</h2><p>Requested ${fmtDateTime(b.createdAt)}</p></div>${badge(b.status, b.statusLabel)}</div>
    ${d.allowedStatuses.length ? `<section class="box"><div class="box-body" style="display:flex;gap:.5rem;flex-wrap:wrap">${d.allowedStatuses.map((s) => `<button class="btn ${s === 'cancelled' ? 'btn-danger' : s === 'confirmed' ? 'btn-primary' : 'btn-outline'} btn-sm" data-to="${s}">${ACTION_LABELS[s]}</button>`).join('')}</div></section>` : ''}
    ${box('Customer', `<dl class="dl"><dt>Name</dt><dd><a class="link" href="#/customers/${d.customer.id}">${esc(d.customer.fullName)}</a></dd>
      <dt>Email</dt><dd><a href="mailto:${esc(d.customer.email)}">${esc(d.customer.email)}</a></dd>
      <dt>Phone</dt><dd><a href="tel:${esc(b.contactPhone.replace(/[^\d+]/g, ''))}">${esc(b.contactPhone)}</a></dd>
      <dt>History</dt><dd>${d.customer.quoteCount} quote(s), ${d.customer.bookingCount} booking(s)</dd></dl>`)}
    ${box('Move', `<dl class="dl"><dt>Preferred</dt><dd>${fmtDate(b.preferredDate)} · ${esc(b.preferredTimeLabel)}</dd>
      ${b.scheduledDate ? `<dt>Scheduled</dt><dd><strong>${fmtDate(b.scheduledDate)} · ${esc(b.scheduledWindowLabel || '')}</strong></dd>` : ''}
      <dt>Pickup</dt><dd>${esc([b.origin.address, b.origin.city, b.origin.provinceName, b.origin.postalCode].filter(Boolean).join(', '))}</dd>
      <dt>Delivery</dt><dd>${esc([b.destination.address, b.destination.city, b.destination.country || b.destination.provinceName, b.destination.postalCode].filter(Boolean).join(', '))}</dd>
      <dt>Property</dt><dd>${esc(b.propertyTypeLabel)} · ${esc(b.propertySizeLabel)} · ${esc(b.moveTypeLabel)}</dd>
      <dt>Access</dt><dd>${esc(b.accessDetails || '—')}</dd><dt>Services</dt><dd>${esc(b.serviceLabels.join(', ') || 'None')}</dd><dt>Notes</dt><dd>${esc(b.notes || '—')}</dd>
      ${d.quote ? `<dt>Linked quote</dt><dd><a class="link" href="#/quotes/${d.quote.id}">${esc(d.quote.reference)}</a> · ${d.quote.finalMin != null ? `final ${priceRange(d.quote.finalMin, d.quote.finalMax)}` : `est. ${priceRange(d.quote.estimateMin, d.quote.estimateMax)}`}</dd>` : ''}
      ${b.cancelledBy ? `<dt>Cancelled by</dt><dd>${esc(b.cancelledBy)}</dd>` : ''}</dl>`)}
    ${box('Internal notes', notesBlock(d.notes))}
    ${box('History', adminTimeline(d.events))}`);

  $$('[data-to]', body).forEach((btn) => btn.addEventListener('click', () => statusDialog(b, btn.dataset.to, opts, (nd) => { renderBooking(nd, opts); bookings.refresh?.(); changed(); })));
  handleForm($('[data-note-form]', body), (data) => post(`/admin/bookings/${b.id}/notes`, data), { onSuccess: (nd) => { toast('Note added.'); renderBooking(nd, opts); } });
}

function statusDialog(b, to, opts, done) {
  const dlg = document.createElement('dialog');
  dlg.className = 'modal';
  const confirmFields = to === 'confirmed' ? `<div class="form-grid"><div class="field"><label for="sd-date">Scheduled date</label><input id="sd-date" type="date" name="scheduledDate" value="${esc(b.scheduledDate || b.preferredDate)}" min="${todayIso()}"></div>
    <div class="field"><label for="sd-win">Time window</label><select id="sd-win" name="scheduledWindow">${selectOpts(opts.timeWindows.map((o) => [o.value, o.label]), b.scheduledWindow || b.preferredTime)}</select></div></div>` : '';
  dlg.innerHTML = `<form method="dialog" novalidate><div class="modal-head"><h2>${ACTION_LABELS[to]}</h2><button type="button" class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div>
    <div class="modal-body"><div class="form-alert" role="alert"></div>
      <p style="margin-top:0">${esc(b.reference)}: ${esc(BOOKING_LABELS[b.status])} → <strong>${esc(BOOKING_LABELS[to])}</strong></p>${confirmFields}
      <div class="field" style="margin-top:1rem"><label for="sd-msg">Message to customer <span class="opt">(optional — a standard message is sent otherwise)</span></label><textarea id="sd-msg" name="message" rows="3" maxlength="1000"></textarea></div>
      <label class="check" style="margin-top:1rem"><input type="checkbox" name="notify" data-bool checked> Notify the customer (in-app and email)</label></div>
    <div class="modal-foot"><button type="button" class="btn btn-outline" data-close>Cancel</button><button class="btn ${to === 'cancelled' ? 'btn-primary' : 'btn-dark'}" type="submit">${ACTION_LABELS[to]}</button></div></form>`;
  document.body.append(dlg);
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
  dlg.addEventListener('close', () => dlg.remove());
  dlg.showModal();
  handleForm($('form', dlg), (data) => post(`/admin/bookings/${b.id}/status`, { ...data, status: to }), { onSuccess: (nd) => { dlg.close(); toast(`Booking ${BOOKING_LABELS[to].toLowerCase()}.`); done(nd); } });
}

// ═══ Customers ════════════════════════════════════════════════════════════
export async function customers(id) {
  const form = listShell({
    base: 'customers', cols: 5,
    filters: `${searchInput('Search name, email or phone')}<select name="status" aria-label="Account status">${selectOpts([['active', 'Active'], ['disabled', 'Disabled']], '', 'All accounts')}</select>`,
    head: '<th>Customer</th><th>Phone</th><th class="num">Quotes</th><th class="num">Bookings</th><th>Account</th>',
  });
  const run = wireList(form, 'customers', async (params, page, go) => {
    const d = await get(`/admin/customers${toQuery({ ...params, page })}`);
    $('[data-rows]', view()).innerHTML = d.customers.length ? d.customers.map((c) => `<tr data-id="${c.id}">
      <td><strong>${esc(c.fullName)}</strong><span class="sub">${esc(c.email)}</span></td><td data-hide-sm>${esc(c.phone || '—')}</td>
      <td class="num" data-hide-sm>${c.quoteCount}</td><td class="num" data-hide-sm>${c.bookingCount}</td>
      <td>${c.isActive ? badge('active', 'Active') : badge('disabled', 'Disabled')}<span class="sub">Joined ${fmtDate(c.createdAt)}</span></td></tr>`).join('') : emptyRow(5, 'No customers found.');
    $('[data-pager]', view()).innerHTML = pager(d.pagination, go);
    bindRows(view(), (cid) => { location.hash = `#/customers/${cid}`; });
  });
  customers.refresh = run;
  await run();
  if (id) openCustomer(id);
}
customers.open = (id) => openCustomer(id);

async function openCustomer(id) {
  openDrawer('Customer', loading, { onClose: () => history.replaceState(null, '', '#/customers') });
  renderCustomer(await get(`/admin/customers/${id}`));
}

function renderCustomer(d) {
  const c = d.customer;
  const body = setDrawer(`
    <div class="page-title" style="margin-bottom:1rem"><div><h2>${esc(c.fullName)}</h2><p>Customer since ${fmtDate(c.createdAt)} · last sign-in ${c.lastLoginAt ? timeAgo(c.lastLoginAt) : 'never'}</p></div>${c.isActive ? badge('active', 'Active') : badge('disabled', 'Disabled')}</div>
    ${box('Contact', `<dl class="dl"><dt>Email</dt><dd><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></dd><dt>Phone</dt><dd>${esc(c.phone || '—')}</dd></dl>
      <div style="margin-top:1rem">${c.isActive ? '<button class="btn btn-danger btn-sm" data-toggle="false">Disable account</button><p class="hint" style="margin-top:.5rem">Disabling signs the customer out everywhere and blocks sign-in. Their history is kept.</p>' : '<button class="btn btn-dark btn-sm" data-toggle="true">Re-enable account</button>'}</div>`)}
    ${box(`Quotes (${d.quotes.length})`, d.quotes.length ? `<table class="table"><tbody>${d.quotes.map((q) => `<tr><td><a class="link ref" href="#/quotes/${q.id}">${esc(q.reference)}</a><span class="sub">${fmtDate(q.createdAt)}</span></td><td>${routeText(q)}</td><td>${badge(q.status, q.statusLabel)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted" style="margin:0">No quotes.</p>')}
    ${box(`Bookings (${d.bookings.length})`, d.bookings.length ? `<table class="table"><tbody>${d.bookings.map((b) => `<tr><td><a class="link ref" href="#/bookings/${b.id}">${esc(b.reference)}</a><span class="sub">${fmtDate(b.scheduledDate || b.preferredDate)}</span></td><td>${routeText(b)}</td><td>${badge(b.status, b.statusLabel)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted" style="margin:0">No bookings.</p>')}
    ${d.reviews?.length ? box(`Reviews (${d.reviews.length})`, d.reviews.map((r) => `<p style="margin:0 0 .6rem"><strong>${r.rating}/5</strong> ${badge(r.status, r.statusLabel)} — ${esc(r.body.slice(0, 140))}${r.body.length > 140 ? '…' : ''}</p>`).join('')) : ''}
    ${box('Internal notes', notesBlock(d.notes || []))}`);
  $('[data-toggle]', body)?.addEventListener('click', async (e) => {
    const enable = e.target.dataset.toggle === 'true';
    if (!enable && !(await confirmDialog(`Disable ${c.fullName}'s account? They will be signed out and unable to sign in.`, { confirmLabel: 'Disable account', danger: true }))) return;
    try { await patch(`/admin/customers/${c.id}`, { isActive: enable }); toast(enable ? 'Account re-enabled.' : 'Account disabled.'); renderCustomer(await get(`/admin/customers/${c.id}`)); customers.refresh?.(); }
    catch (err) { toast(err.message, 'error'); }
  });
  handleForm($('[data-note-form]', body), (data) => post(`/admin/customers/${c.id}/notes`, data), { onSuccess: async () => { toast('Note added.'); renderCustomer(await get(`/admin/customers/${c.id}`)); } });
}

// ═══ Contact messages ═════════════════════════════════════════════════════
export async function messages(id) {
  const form = listShell({
    base: 'messages', cols: 4,
    filters: `${searchInput('Search name, email or subject')}<select name="status" aria-label="Status">${selectOpts([['unread', 'Unread'], ['read', 'Read'], ['archived', 'Archived']], '', 'Inbox (unread & read)')}</select>`,
    head: '<th>From</th><th>Subject</th><th>Received</th><th>Status</th>',
  });
  const run = wireList(form, 'messages', async (params, page, go) => {
    const d = await get(`/admin/messages${toQuery({ ...params, page })}`);
    $('[data-rows]', view()).innerHTML = d.messages.length ? d.messages.map((m) => `<tr data-id="${m.id}" class="${m.status === 'unread' ? 'unread' : ''}">
      <td><strong>${esc(m.name)}</strong><span class="sub">${esc(m.email)}</span></td><td>${esc(m.subject)}<span class="sub">${esc(m.message.slice(0, 80))}${m.message.length > 80 ? '…' : ''}</span></td>
      <td data-hide-sm>${fmtDateTime(m.createdAt)}</td><td>${badge(m.status, m.status[0].toUpperCase() + m.status.slice(1))}</td></tr>`).join('') : emptyRow(4, 'No messages.');
    $('[data-pager]', view()).innerHTML = pager(d.pagination, go);
    bindRows(view(), (mid) => { location.hash = `#/messages/${mid}`; });
  });
  messages.refresh = run;
  await run();
  if (id) openMessage(id);
}
messages.open = (id) => openMessage(id);

async function openMessage(id) {
  openDrawer('Message', loading, { onClose: () => history.replaceState(null, '', '#/messages') });
  const { message: m } = await get(`/admin/messages/${id}`);
  messages.refresh?.(); changed();
  const body = setDrawer(`
    <div class="page-title" style="margin-bottom:1rem"><div><h2>${esc(m.subject)}</h2><p>${fmtDateTime(m.createdAt)}</p></div>${badge(m.status, m.status)}</div>
    ${box('From', `<dl class="dl"><dt>Name</dt><dd>${esc(m.name)}</dd><dt>Email</dt><dd><a href="mailto:${esc(m.email)}">${esc(m.email)}</a></dd><dt>Phone</dt><dd>${esc(m.phone || '—')}</dd>${m.userId ? `<dt>Account</dt><dd><a class="link" href="#/customers/${m.userId}">View customer</a></dd>` : ''}</dl>`)}
    ${box('Message', `<p style="margin:0;white-space:pre-wrap">${esc(m.message)}</p>`)}
    <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1rem">
      <a class="btn btn-dark" href="mailto:${esc(m.email)}?subject=${encodeURIComponent(`Re: ${m.subject}`)}">${icon('mail')} Reply by email</a>
      ${m.status !== 'archived' ? `<button class="btn btn-outline" data-set="archived">${icon('archive')} Archive</button>` : '<button class="btn btn-outline" data-set="read">Move to inbox</button>'}
      <button class="btn btn-outline" data-set="unread">Mark unread</button>
      <button class="btn btn-danger" data-delete>${icon('trash')} Delete</button></div>`);
  $$('[data-set]', body).forEach((b) => b.addEventListener('click', async () => { await patch(`/admin/messages/${m.id}`, { status: b.dataset.set }); toast('Message updated.'); openMessage(m.id); }));
  $('[data-delete]', body).addEventListener('click', async () => {
    if (!(await confirmDialog('Delete this message permanently?', { confirmLabel: 'Delete', danger: true }))) return;
    await del(`/admin/messages/${m.id}`); toast('Message deleted.'); location.hash = '#/messages'; messages.refresh?.(); changed();
  });
}

// ═══ Notifications ════════════════════════════════════════════════════════
export async function notifications(_, page = 1) {
  const d = await get(`/admin/notifications?page=${page}`);
  view().innerHTML = `<div class="page-title"><div><h2>Notifications</h2><p>New requests and activity across the team. ${d.unread} unread.</p></div>${d.unread ? '<button class="btn btn-outline" data-read-all>Mark all as read</button>' : ''}</div>
    <section class="box">${notifItems(d.notifications)}${pager(d.pagination, (p) => notifications(null, p))}</section>`;
  $('[data-read-all]', view())?.addEventListener('click', async () => { await post('/admin/notifications/read-all'); changed(); notifications(); });
}

void labelFor;
