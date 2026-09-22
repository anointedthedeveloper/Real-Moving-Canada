import { $, $$, esc, icon, money, priceRange, fmtDate, fmtDateTime, timeAgo, badge, place, initials, stars, handleForm, fillForm, enhancePasswords, toast, confirmDialog, pager } from '../core/ui.js';
import { get, post, patch, put, ApiError } from '../core/api.js';
import { BOOKING_FLOW, BOOKING_LABELS } from '../core/data.js';
import { DISCLAIMER } from '../components/estimate.js';

const view = $('[data-view]');
const title = $('[data-page-title]');
let me = null;

// ─── Shell ────────────────────────────────────────────────────────────────
const sidebar = $('#sidebar');
let scrim;
function setSidebar(open) {
  sidebar.classList.toggle('open', open);
  if (open) { scrim = document.createElement('div'); scrim.className = 'scrim'; scrim.onclick = () => setSidebar(false); document.body.append(scrim); }
  else scrim?.remove();
}
$('.menu-btn').addEventListener('click', () => setSidebar(!sidebar.classList.contains('open')));

$('[data-logout]').addEventListener('click', async (e) => {
  e.preventDefault();
  await post('/auth/logout').catch(() => {});
  location.assign('/');
});

function setUser(u) {
  me = u;
  $('[data-user-name]').textContent = u.fullName;
  $('[data-user-email]').textContent = u.email;
  $('[data-user-initials]').textContent = initials(u.fullName);
}
function setUnread(n) {
  const c = $('[data-unread]');
  c.hidden = !n; c.textContent = n;
  const d = $('[data-unread-dot]');
  d.hidden = !n; d.textContent = n > 9 ? '9+' : n;
}
const refreshUnread = () => get('/customer/notifications?unread=1&limit=1').then((d) => setUnread(d.unread)).catch(() => {});

// ─── Router ───────────────────────────────────────────────────────────────
const ROUTES = { overview: overviewView, quotes: quotesView, bookings: bookingsView, notifications: notificationsView, reviews: reviewsView, profile: profileView };
const TITLES = { overview: 'Overview', quotes: 'My quotes', bookings: 'My bookings', notifications: 'Notifications', reviews: 'My reviews', profile: 'Profile' };

async function route() {
  const [name = 'overview', id] = location.hash.replace(/^#\/?/, '').split('/');
  const key = ROUTES[name] ? name : 'overview';
  $$('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === key));
  title.textContent = TITLES[key];
  document.title = `${TITLES[key]} — RealMovingCanada`;
  setSidebar(false);
  view.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  try {
    await ROUTES[key](id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) { location.assign('/account?next=/dashboard'); return; }
    view.innerHTML = `<div class="box empty">${icon('alert')}<h3>Something went wrong</h3><p>${esc(err.message)}</p><a class="btn btn-outline" href="">Try again</a></div>`;
  }
  view.focus({ preventScroll: true });
}
addEventListener('hashchange', route);

(async () => {
  try {
    const { user } = await get('/auth/me');
    if (!user) { location.replace('/account?next=/dashboard'); return; }
    setUser(user);
    refreshUnread();
    route();
  } catch {
    location.replace('/account?next=/dashboard');
  }
})();

// ─── Shared bits ──────────────────────────────────────────────────────────
const routeLine = (o, d) => `<div class="route-line"><div class="end"><strong>${esc(o.city)}</strong><span>${esc(o.province === 'INTL' ? o.country : o.provinceName || o.province)}</span></div>
  <div class="mid">${icon('truck')}</div><div class="end"><strong>${esc(d.city)}</strong><span>${esc(d.province === 'INTL' ? d.country : d.provinceName || d.province)}</span></div></div>`;

function bookingProgress(status) {
  if (status === 'cancelled') return `<ol class="progress-steps cancelled">${BOOKING_FLOW.map((s) => `<li>${BOOKING_LABELS[s]}</li>`).join('')}</ol><p class="small" style="color:#9E1025;margin:.6rem 0 0">This booking request was cancelled.</p>`;
  const idx = BOOKING_FLOW.indexOf(status);
  return `<ol class="progress-steps" aria-label="Booking progress">${BOOKING_FLOW.map((s, i) => `<li class="${i < idx ? 'done' : i === idx ? 'current' : ''}"${i === idx ? ' aria-current="step"' : ''}>${BOOKING_LABELS[s]}</li>`).join('')}</ol>`;
}

const timeline = (events) => (events?.length
  ? `<ul class="timeline">${events.map((e) => `<li><div class="t-title">${esc(e.message || BOOKING_LABELS[e.toStatus] || e.toStatus)}</div><div class="t-meta">${fmtDateTime(e.createdAt)}</div></li>`).join('')}</ul>`
  : '<p class="muted">No updates yet.</p>');

const emptyState = (ic, h, p, cta) => `<div class="box empty">${icon(ic)}<h3>${h}</h3><p>${p}</p>${cta || ''}</div>`;

// ─── Overview ─────────────────────────────────────────────────────────────
async function overviewView() {
  const d = await get('/customer/overview');
  setUnread(d.counts.unreadNotifications);
  const up = d.upcomingMove;
  const upDate = up ? up.scheduledDate || up.preferredDate : null;
  view.innerHTML = `
    <div class="page-title"><div><h2>Hi, ${esc(me.fullName.split(' ')[0])}</h2><p>Here’s where your move stands.</p></div>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap"><a class="btn btn-outline" href="/booking">Request a booking</a><a class="btn btn-primary" href="/quote">New quote</a></div></div>
    <div class="stats">
      <a class="stat" href="#quotes"><span class="label">${icon('file')}Active quotes</span><span class="value">${d.counts.activeQuotes}</span><span class="small muted">${d.counts.totalQuotes} total</span></a>
      <a class="stat" href="#bookings"><span class="label">${icon('calendar')}Booking requests</span><span class="value">${d.counts.activeBookings}</span><span class="small muted">${d.counts.totalBookings} total</span></a>
      <a class="stat" href="#notifications"><span class="label">${icon('bell')}Unread updates</span><span class="value">${d.counts.unreadNotifications}</span><span class="small muted">Notifications</span></a>
    </div>
    <div class="grid-3">
      <div>
        <section class="box"><div class="box-head"><h3>Upcoming move</h3>${up ? badge(up.status, up.statusLabel) : ''}</div>
          <div class="box-body">${up ? `
            <div class="upcoming">
              <div class="date-block"><div class="m">${fmtDate(upDate, { month: 'short', day: undefined, year: undefined }).toUpperCase()}</div><div class="d">${Number(upDate.slice(8, 10))}</div></div>
              <div style="flex:1;min-width:0">${routeLine(up.origin, up.destination)}
                <p class="small muted" style="margin:.6rem 0 0">${up.status === 'confirmed' ? `Confirmed · ${esc(up.scheduledWindowLabel || up.preferredTimeLabel)}` : `Requested · ${esc(up.preferredTimeLabel)} — not yet confirmed`}</p></div>
            </div>
            <div style="margin-top:1.2rem">${bookingProgress(up.status)}</div>
            <a class="link" href="#bookings/${up.id}" style="display:inline-block;margin-top:1rem">View booking ${esc(up.reference)}</a>`
            : `<p class="muted" style="margin:0 0 1rem">No upcoming moves yet. When you request a booking, it will appear here with its status.</p><a class="btn btn-dark btn-sm" href="/booking">Request a booking</a>`}
          </div></section>
        <section class="box"><div class="box-head"><h3>Recent quotes</h3><a class="small link" href="#quotes">View all</a></div>
          ${d.recentQuotes.length ? `<div class="table-wrap"><table class="table responsive"><tbody>${d.recentQuotes.map((q) => `
            <tr class="clickable" data-href="#quotes/${q.id}"><td><span class="ref">${esc(q.reference)}</span><span class="sub">${fmtDate(q.createdAt)}</span></td>
            <td data-hide-sm>${esc(place(q.origin))} → ${esc(place(q.destination))}</td>
            <td class="num">${q.final ? priceRange(q.final.min, q.final.max) : priceRange(q.estimate.min, q.estimate.max)}</td><td>${badge(q.status, q.statusLabel)}</td></tr>`).join('')}</tbody></table></div>`
            : '<div class="box-body"><p class="muted" style="margin:0">No quotes yet. <a class="link" href="/quote">Request your first quote</a>.</p></div>'}
        </section>
      </div>
      <div>
        <section class="box"><div class="box-head"><h3>Account</h3><a class="small link" href="#profile">Edit</a></div>
          <div class="box-body"><dl class="dl"><dt>Name</dt><dd>${esc(d.account.fullName)}</dd><dt>Email</dt><dd>${esc(d.account.email)}</dd><dt>Phone</dt><dd>${esc(d.account.phone || '—')}</dd><dt>Member since</dt><dd>${fmtDate(d.account.createdAt)}</dd></dl></div></section>
        <section class="box"><div class="box-head"><h3>Latest updates</h3><a class="small link" href="#notifications">All</a></div>
          ${notifList(d.notifications)}</section>
      </div>
    </div>`;
  bindRowLinks();
}

function bindRowLinks() {
  $$('tr[data-href]', view).forEach((tr) => {
    tr.tabIndex = 0;
    tr.addEventListener('click', () => { location.hash = tr.dataset.href; });
    tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') location.hash = tr.dataset.href; });
  });
}

const notifList = (list) => (list.length
  ? `<ul class="notif-list">${list.map((n) => `<li class="${n.isRead ? '' : 'unread'}" data-id="${n.id}"><span class="dot"></span><div style="min-width:0;flex:1">
      <a href="${esc(n.link || '#notifications')}" data-notif="${n.id}"><div class="n-title">${esc(n.title)}</div></a>
      ${n.body ? `<div class="n-body">${esc(n.body)}</div>` : ''}<div class="n-meta">${timeAgo(n.createdAt)}</div></div></li>`).join('')}</ul>`
  : '<div class="box-body"><p class="muted" style="margin:0">No notifications yet.</p></div>');

view.addEventListener('click', (e) => {
  const a = e.target.closest('[data-notif]');
  if (a) patch(`/customer/notifications/${a.dataset.notif}`, { isRead: true }).then(refreshUnread).catch(() => {});
});

// ─── Quotes ───────────────────────────────────────────────────────────────
async function quotesView(id, page = 1) {
  if (id) return quoteDetail(id);
  const d = await get(`/customer/quotes?page=${page}`);
  if (!d.quotes.length) {
    view.innerHTML = emptyState('file', 'No quotes yet', 'Request a quote to see your estimated moving cost and have a representative confirm your price.', '<a class="btn btn-primary" href="/quote">Get a free quote</a>');
    return;
  }
  view.innerHTML = `<div class="page-title"><div><h2>My quotes</h2><p>Estimates are confirmed by a representative before your move.</p></div><a class="btn btn-primary" href="/quote">New quote</a></div>
    <section class="box"><div class="table-wrap"><table class="table responsive">
      <thead><tr><th>Quote</th><th>Route</th><th>Moving date</th><th class="num">Price</th><th>Status</th><th></th></tr></thead>
      <tbody>${d.quotes.map((q) => `<tr class="clickable" data-href="#quotes/${q.id}">
        <td><span class="ref">${esc(q.reference)}</span><span class="sub">Requested ${fmtDate(q.createdAt)}</span></td>
        <td data-hide-sm>${esc(place(q.origin))} → ${esc(place(q.destination))}</td>
        <td data-hide-sm>${fmtDate(q.moveDate)}</td>
        <td class="num">${q.final ? `<strong>${priceRange(q.final.min, q.final.max)}</strong><span class="sub">Confirmed</span>` : `${priceRange(q.estimate.min, q.estimate.max)}<span class="sub">Estimated</span>`}</td>
        <td>${badge(q.status, q.statusLabel)}</td>
        <td class="num" data-hide-sm><a class="link small" href="#quotes/${q.id}">View details</a></td></tr>`).join('')}</tbody></table></div>
      ${pager(d.pagination, (p) => quotesView(null, p))}</section>`;
  bindRowLinks();
}

async function quoteDetail(id) {
  const { quote: q, events } = await get(`/customer/quotes/${id}`);
  title.textContent = `Quote ${q.reference}`;
  view.innerHTML = `<p><a class="link small" href="#quotes">← All quotes</a></p>
    <div class="page-title"><div><h2>Quote ${esc(q.reference)}</h2><p>Requested ${fmtDateTime(q.createdAt)}</p></div>${badge(q.status, q.statusLabel)}</div>
    <div class="grid-3">
      <div>
        <section class="box"><div class="box-body">${routeLine(q.origin, q.destination)}</div></section>
        <section class="box"><div class="box-head"><h3>Move details</h3></div><div class="box-body"><dl class="dl">
          <dt>Moving date</dt><dd>${fmtDate(q.moveDate)}</dd>
          <dt>Move type</dt><dd>${esc(q.moveTypeLabel)}</dd>
          <dt>Property size</dt><dd>${esc(q.propertySizeLabel)}</dd>
          <dt>Services</dt><dd>${q.serviceLabels.length ? esc(q.serviceLabels.join(', ')) : 'None selected'}</dd>
          <dt>From</dt><dd>${esc([q.origin.city, q.origin.provinceName, q.origin.postalCode].filter(Boolean).join(', '))}</dd>
          <dt>To</dt><dd>${esc([q.destination.city, q.destination.country || q.destination.provinceName, q.destination.postalCode].filter(Boolean).join(', '))}</dd>
          <dt>Inventory</dt><dd>${esc(q.inventory || '—')}</dd>
          <dt>Notes</dt><dd>${esc(q.notes || '—')}</dd>
          <dt>Contact</dt><dd>${esc(q.customer.name)} · ${esc(q.customer.phone)}</dd>
        </dl></div></section>
      </div>
      <div>
        ${q.final ? `<section class="box" style="border-color:var(--ok)"><div class="box-head"><h3>Confirmed price</h3>${badge('finalized', 'Confirmed')}</div><div class="box-body">
          <div class="estimate-price">${priceRange(q.final.min, q.final.max)}<span class="cur">CAD</span></div>
          ${q.final.message ? `<p style="margin:.8rem 0 0">${esc(q.final.message)}</p>` : ''}
          <a class="btn btn-primary btn-block" style="margin-top:1rem" href="/booking?quote=${q.id}">Request a booking</a></div></section>` : ''}
        <section class="box"><div class="box-head"><h3>Estimated cost</h3></div><div class="box-body">
          <div class="estimate-price" style="font-size:1.8rem">${money(q.estimate.min)} – ${money(q.estimate.max)}<span class="cur">CAD</span></div>
          <ul class="factor-list">${q.estimate.factors.map((f) => `<li>${icon('check')}<span>${esc(f)}</span></li>`).join('')}</ul>
          ${q.estimate.notes.length ? `<div class="estimate-notes">${q.estimate.notes.map(esc).join('<br>')}</div>` : ''}
          <p class="disclaimer">${DISCLAIMER}</p>
          ${!q.final && q.status !== 'closed' ? `<a class="btn btn-outline btn-block" href="/booking?quote=${q.id}">Request a booking</a>` : ''}
        </div></section>
        <section class="box"><div class="box-head"><h3>History</h3></div><div class="box-body">${timeline(events)}</div></section>
      </div>
    </div>`;
}

// ─── Bookings ─────────────────────────────────────────────────────────────
async function bookingsView(id, page = 1) {
  if (id) return bookingDetail(id);
  const d = await get(`/customer/bookings?page=${page}`);
  if (!d.bookings.length) {
    view.innerHTML = emptyState('calendar', 'No booking requests yet', 'Choose your preferred moving date and our team will confirm availability with you.', '<a class="btn btn-primary" href="/booking">Request a booking</a>');
    return;
  }
  view.innerHTML = `<div class="page-title"><div><h2>My bookings</h2><p>A booking request is confirmed only once its status shows <strong>Confirmed</strong>.</p></div><a class="btn btn-primary" href="/booking">Request a booking</a></div>
    <section class="box"><div class="table-wrap"><table class="table responsive">
      <thead><tr><th>Booking</th><th>Moving date</th><th>Route</th><th>Status</th><th></th></tr></thead>
      <tbody>${d.bookings.map((b) => `<tr class="clickable" data-href="#bookings/${b.id}">
        <td><span class="ref">${esc(b.reference)}</span><span class="sub">Requested ${fmtDate(b.createdAt)}</span></td>
        <td>${fmtDate(b.scheduledDate || b.preferredDate)}<span class="sub">${esc(b.scheduledWindowLabel || b.preferredTimeLabel)}${b.scheduledDate ? '' : ' (requested)'}</span></td>
        <td data-hide-sm>${esc(place(b.origin))} → ${esc(place(b.destination))}</td>
        <td>${badge(b.status, b.statusLabel)}</td>
        <td class="num" data-hide-sm><a class="link small" href="#bookings/${b.id}">View details</a></td></tr>`).join('')}</tbody></table></div>
      ${pager(d.pagination, (p) => bookingsView(null, p))}</section>`;
  bindRowLinks();
}

async function bookingDetail(id) {
  const { booking: b, events } = await get(`/customer/bookings/${id}`);
  title.textContent = `Booking ${b.reference}`;
  const statusNote = {
    pending: 'Your request has been received and is waiting for review. It is not confirmed yet.',
    under_review: 'A representative is checking availability for your preferred date. It is not confirmed yet.',
    confirmed: `Your move is confirmed for ${fmtDate(b.scheduledDate || b.preferredDate)} · ${b.scheduledWindowLabel || b.preferredTimeLabel}.`,
    completed: 'This move is complete. Thank you for moving with RealMovingCanada!',
    cancelled: `This booking request was cancelled${b.cancelledBy === 'customer' ? ' by you' : ''}.`,
  }[b.status];
  view.innerHTML = `<p><a class="link small" href="#bookings">← All bookings</a></p>
    <div class="page-title"><div><h2>Booking ${esc(b.reference)}</h2><p>Requested ${fmtDateTime(b.createdAt)}</p></div>${badge(b.status, b.statusLabel)}</div>
    <section class="box"><div class="box-body">${bookingProgress(b.status)}
      <p style="margin:1rem 0 0" class="${b.status === 'confirmed' ? 'strong' : ''}">${esc(statusNote)}</p></div></section>
    <div class="grid-3" style="margin-top:1.25rem">
      <div>
        <section class="box"><div class="box-body">${routeLine(b.origin, b.destination)}</div></section>
        <section class="box"><div class="box-head"><h3>Request details</h3></div><div class="box-body"><dl class="dl">
          <dt>Preferred date</dt><dd>${fmtDate(b.preferredDate)} · ${esc(b.preferredTimeLabel)}</dd>
          ${b.scheduledDate ? `<dt>Scheduled</dt><dd>${fmtDate(b.scheduledDate)} · ${esc(b.scheduledWindowLabel || '')}</dd>` : ''}
          <dt>Pickup</dt><dd>${esc([b.origin.address, b.origin.city, b.origin.provinceName, b.origin.postalCode].filter(Boolean).join(', '))}</dd>
          <dt>Delivery</dt><dd>${esc([b.destination.address, b.destination.city, b.destination.country || b.destination.provinceName, b.destination.postalCode].filter(Boolean).join(', '))}</dd>
          <dt>Property</dt><dd>${esc(b.propertyTypeLabel)} · ${esc(b.propertySizeLabel)}</dd>
          <dt>Move type</dt><dd>${esc(b.moveTypeLabel)}</dd>
          <dt>Access</dt><dd>${esc(b.accessDetails || '—')}</dd>
          <dt>Services</dt><dd>${b.serviceLabels.length ? esc(b.serviceLabels.join(', ')) : 'None selected'}</dd>
          <dt>Phone</dt><dd>${esc(b.contactPhone)}</dd>
          ${b.quoteReference ? `<dt>Linked quote</dt><dd><a class="link" href="#quotes/${b.quoteId}">${esc(b.quoteReference)}</a></dd>` : ''}
          <dt>Notes</dt><dd>${esc(b.notes || '—')}</dd>
        </dl></div></section>
      </div>
      <div>
        <section class="box"><div class="box-head"><h3>Updates</h3></div><div class="box-body">${timeline(events)}</div></section>
        ${b.canCancel ? `<section class="box"><div class="box-body"><p class="small muted" style="margin-top:0">Plans changed? You can cancel this request while it’s still being reviewed.</p><button class="btn btn-danger btn-block" data-cancel>Cancel booking request</button></div></section>` : ''}
        ${b.status === 'completed' ? `<section class="box"><div class="box-body"><p style="margin-top:0">How did your move go?</p><a class="btn btn-dark btn-block" href="/reviews#write">Write a review</a></div></section>` : ''}
      </div>
    </div>`;
  $('[data-cancel]', view)?.addEventListener('click', async () => {
    if (!(await confirmDialog('Cancel this booking request? This can’t be undone online.', { confirmLabel: 'Cancel request', danger: true }))) return;
    try { await post(`/customer/bookings/${b.id}/cancel`); toast('Booking request cancelled.'); bookingDetail(b.id); }
    catch (err) { toast(err.message, 'error'); }
  });
}

// ─── Notifications ────────────────────────────────────────────────────────
async function notificationsView(_, page = 1) {
  const d = await get(`/customer/notifications?page=${page}`);
  setUnread(d.unread);
  view.innerHTML = `<div class="page-title"><div><h2>Notifications</h2><p>Updates about your quotes, bookings and account.</p></div>
      ${d.unread ? '<button class="btn btn-outline" data-read-all>Mark all as read</button>' : ''}</div>
    <section class="box">${notifList(d.notifications)}${pager(d.pagination, (p) => notificationsView(null, p))}</section>`;
  $('[data-read-all]', view)?.addEventListener('click', async () => { await post('/customer/notifications/read-all'); notificationsView(); });
}

// ─── Reviews ──────────────────────────────────────────────────────────────
async function reviewsView() {
  const d = await get('/customer/reviews');
  view.innerHTML = `<div class="page-title"><div><h2>My reviews</h2><p>Reviews are published on our website after approval.</p></div><a class="btn btn-primary" href="/reviews#write">Write a review</a></div>
    ${d.reviews.length ? `<div class="review-grid">${d.reviews.map((r) => `<article class="review-card">
        <div style="display:flex;justify-content:space-between;gap:1rem;align-items:center">${stars(r.rating)}${badge(r.status, r.statusLabel)}</div>
        ${r.title ? `<h3>${esc(r.title)}</h3>` : ''}<blockquote>${esc(r.body)}</blockquote>
        <footer><span class="small muted">Shown as “${esc(r.displayName)}” · submitted ${fmtDate(r.createdAt)}</span></footer></article>`).join('')}</div>`
      : emptyState('star', 'No reviews yet', 'After your move, tell others how it went.', '<a class="btn btn-dark" href="/reviews#write">Write a review</a>')}`;
}

// ─── Profile ──────────────────────────────────────────────────────────────
async function profileView() {
  view.innerHTML = `<div class="page-title"><div><h2>Profile</h2><p>Keep your contact details up to date so we can reach you about your move.</p></div></div>
    <div class="grid-2">
      <form class="box" id="profile-form" novalidate><div class="box-head"><h3>Personal details</h3></div><div class="box-body">
        <div class="form-alert" role="alert"></div>
        <div class="form-grid" style="--cols:1">
          <div class="field"><label for="p-name">Full name</label><input id="p-name" name="fullName" autocomplete="name" required></div>
          <div class="field"><label for="p-email">Email</label><input id="p-email" name="email" type="email" autocomplete="email" required></div>
          <div class="field" data-current-pw hidden><label for="p-cpw">Current password</label><div class="pw-wrap"><input id="p-cpw" name="currentPassword" type="password" autocomplete="current-password"></div><p class="hint">Required to change your email address.</p></div>
          <div class="field"><label for="p-phone">Phone</label><input id="p-phone" name="phone" type="tel" autocomplete="tel" required></div>
        </div>
        <button class="btn btn-dark" type="submit" style="margin-top:1.2rem">Save changes</button></div></form>
      <form class="box" id="password-form" novalidate><div class="box-head"><h3>Change password</h3></div><div class="box-body">
        <div class="form-alert" role="alert"></div>
        <div class="form-grid" style="--cols:1">
          <div class="field"><label for="pw-c">Current password</label><div class="pw-wrap"><input id="pw-c" name="currentPassword" type="password" autocomplete="current-password" required></div></div>
          <div class="field"><label for="pw-n">New password</label><div class="pw-wrap"><input id="pw-n" name="newPassword" type="password" autocomplete="new-password" required></div><p class="hint">At least 10 characters, including a letter and a number.</p></div>
          <div class="field"><label for="pw-r">Confirm new password</label><div class="pw-wrap"><input id="pw-r" name="confirmPassword" type="password" autocomplete="new-password" required></div></div>
        </div>
        <button class="btn btn-dark" type="submit" style="margin-top:1.2rem">Update password</button>
        <p class="small muted" style="margin:.8rem 0 0">Changing your password signs you out on other devices.</p></div></form>
    </div>`;
  const pf = $('#profile-form');
  fillForm(pf, { fullName: me.fullName, email: me.email, phone: me.phone || '' });
  pf.email.addEventListener('input', () => { $('[data-current-pw]', pf).hidden = pf.email.value.trim().toLowerCase() === me.email.toLowerCase(); });
  enhancePasswords(view);
  handleForm(pf, (d) => patch('/customer/profile', d), { onSuccess: (r) => { setUser(r.user); pf.currentPassword.value = ''; $('[data-current-pw]', pf).hidden = true; toast(r.message || 'Profile updated.'); } });
  const pw = $('#password-form');
  handleForm(pw, (d) => put('/customer/password', d), { onSuccess: (r) => { pw.reset(); toast(r.message || 'Password updated.'); } });
}
