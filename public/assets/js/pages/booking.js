import '../site.js';
import { $, esc, icon, handleForm, fillForm, todayIso, fmtDate, place, priceRange } from '../core/ui.js';
import { currentCustomer, get, post } from '../core/api.js';
import { loadOptions, optionTags } from '../core/options.js';
import { locationFields, wireLocations } from '../components/location.js';

const root = $('[data-booking-root]');
const notConfirmed = `<div class="notice warn">${icon('alert')}<div><strong>This is a booking request, not a confirmed booking.</strong>Your move is confirmed only after a RealMovingCanada representative reviews availability and contacts you. You’ll see the status change in your account: Pending → Under review → Confirmed.</div></div>`;

(async () => {
  const [user, opts] = await Promise.all([currentCustomer(), loadOptions()]);
  if (!user) {
    root.innerHTML = `<div class="card gate">${icon('lock')}<h2>Sign in to request a booking</h2>
      <p class="lead">Your account lets you track the status of your request and receive confirmation from our team.</p>
      <div class="actions"><a class="btn btn-primary btn-lg" href="/account?next=/booking">Sign in</a><a class="btn btn-outline btn-lg" href="/account?next=/booking&tab=register">Create an account</a></div></div>`;
    return;
  }
  let quotes = [];
  try { quotes = (await get('/customer/quotes?limit=50')).quotes.filter((q) => q.status !== 'closed'); } catch { /* none */ }

  root.innerHTML = `<div class="form-page">
    <form class="card card-pad" novalidate>
      <div class="form-alert" role="alert"></div>
      ${quotes.length ? `<fieldset><legend>Start from a quote <span class="opt small">(optional)</span></legend>
        <div class="field"><label for="b-quote">Your quotes</label><select id="b-quote" name="quoteId"><option value="">Don’t link a quote</option>${quotes.map((q) => `<option value="${q.id}">${esc(q.reference)} — ${esc(place(q.origin))} → ${esc(place(q.destination))}, ${fmtDate(q.moveDate)}</option>`).join('')}</select>
        <p class="hint">Choosing a quote fills in the details below.</p></div></fieldset>` : ''}
      <fieldset><legend>Preferred date &amp; time</legend>
        <div class="form-grid" style="--cols:3">
          <div class="field"><label for="b-date">Preferred moving date</label><input id="b-date" name="preferredDate" type="date" min="${todayIso()}" required></div>
          <div class="field"><label for="b-time">Preferred time</label><select id="b-time" name="preferredTime" required>${optionTags(opts.timeWindows, 'morning')}</select></div>
          <div class="field"><label for="b-phone">Best phone number</label><input id="b-phone" name="contactPhone" type="tel" autocomplete="tel" required maxlength="30"></div>
        </div></fieldset>
      <fieldset><legend>Moving from</legend>${locationFields('origin', opts, { withAddress: true })}</fieldset>
      <fieldset><legend>Moving to</legend>${locationFields('destination', opts, { withAddress: true })}</fieldset>
      <fieldset><legend>Property information</legend>
        <div class="form-grid" style="--cols:3">
          <div class="field"><label for="b-type">Move type</label><select id="b-type" name="moveType" required>${optionTags(opts.moveTypes, 'residential')}</select></div>
          <div class="field"><label for="b-ptype">Property type</label><select id="b-ptype" name="propertyType" required>${optionTags(opts.propertyTypes, '', { placeholder: 'Select…' })}</select></div>
          <div class="field"><label for="b-size">Property size</label><select id="b-size" name="propertySize" required>${optionTags(opts.propertySizes, '', { placeholder: 'Select…' })}</select></div>
          <div class="field span-all"><label for="b-access">Access details <span class="opt">(optional)</span></label><input id="b-access" name="accessDetails" maxlength="500" placeholder="e.g. 3rd floor with elevator; street parking only at destination"></div>
        </div>
        <p class="label" style="margin:1.3rem 0 .6rem">Services <span class="opt">(optional)</span></p>
        <div class="chips" data-field="services">${opts.services.map((s) => `<label class="chip"><input type="checkbox" name="services" value="${s.value}"><span>${esc(s.label)}</span></label>`).join('')}</div>
      </fieldset>
      <fieldset><legend>Notes</legend>
        <div class="field"><label for="b-notes">Anything else we should know? <span class="opt">(optional)</span></label><textarea id="b-notes" name="notes" rows="4" maxlength="2000"></textarea></div>
      </fieldset>
      <label class="check" style="margin-top:1.6rem" data-field="ack"><input type="checkbox" name="ack" data-bool required> I understand this is a request and my booking is not confirmed until RealMovingCanada contacts me.</label>
      <div style="margin-top:1.4rem"><button class="btn btn-primary btn-lg" type="submit">Submit booking request</button></div>
    </form>
    <aside class="form-side">${notConfirmed}</aside>
  </div>`;

  const form = $('form', root);
  const moveType = form.elements.moveType;
  wireLocations(form, opts, () => {
    const intl = [form.elements['origin.province'].value, form.elements['destination.province'].value].includes('INTL');
    if (intl) moveType.value = 'international';
    else if (moveType.value === 'international') moveType.value = 'residential';
  });
  fillForm(form, { contactPhone: user.phone || '' });

  const applyQuote = (id) => {
    const q = quotes.find((x) => String(x.id) === String(id));
    if (!q) return;
    fillForm(form, {
      preferredDate: q.moveDate >= todayIso() ? q.moveDate : '',
      origin: { province: q.origin.province, city: q.origin.city, postalCode: q.origin.postalCode || '', country: q.origin.country || '' },
      destination: { province: q.destination.province, city: q.destination.city, postalCode: q.destination.postalCode || '', country: q.destination.country || '' },
      moveType: q.moveType, propertySize: q.propertySize, services: q.services,
    });
  };
  form.elements.quoteId?.addEventListener('change', (e) => applyQuote(e.target.value));
  const pre = new URLSearchParams(location.search).get('quote');
  if (pre && form.elements.quoteId) { form.elements.quoteId.value = pre; applyQuote(pre); }

  handleForm(form, async (data) => {
    if (!data.ack) { const err = new Error('Please confirm you understand this is a booking request.'); err.fields = { ack: 'Please tick this box to continue.' }; throw err; }
    delete data.ack;
    return post('/customer/bookings', data);
  }, {
    onSuccess: ({ booking }) => {
      root.innerHTML = `<div class="form-page"><div class="card success-panel">
        <div class="check-mark">${icon('check')}</div>
        <h2>Booking request ${esc(booking.reference)} submitted</h2>
        <p class="lead">Preferred date: ${fmtDate(booking.preferredDate)} · ${esc(booking.preferredTimeLabel)}</p>
        <p style="margin:0 auto 1.5rem;max-width:520px">Status: <span class="badge s-pending">Pending</span> — our team will review availability and contact you to confirm. You’ll be notified of every change.</p>
        <a class="btn btn-primary" href="/dashboard#bookings/${booking.id}">Track this request</a>
      </div><aside class="form-side">${notConfirmed}</aside></div>`;
      scrollTo({ top: 0, behavior: 'smooth' });
    },
  });
})();
void priceRange;
