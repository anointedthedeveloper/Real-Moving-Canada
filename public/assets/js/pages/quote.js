import '../site.js';
import { $, esc, icon, money, handleForm, fillForm, todayIso, place } from '../core/ui.js';
import { currentCustomer, post } from '../core/api.js';
import { loadOptions, optionTags } from '../core/options.js';
import { locationFields, wireLocations } from '../components/location.js';
import { getEstimateDraft, DISCLAIMER } from '../components/estimate.js';

const root = $('[data-quote-root]');

const gate = () => `<div class="card gate">${icon('lock')}
  <h2>Sign in to request a quote</h2>
  <p class="lead">A free account lets you save your quote, see your estimate and get updates from our team. It takes less than a minute.</p>
  <div class="actions"><a class="btn btn-primary btn-lg" href="/account?next=/quote">Sign in</a><a class="btn btn-outline btn-lg" href="/account?next=/quote&tab=register">Create an account</a></div>
  <p class="small muted" style="margin-top:1.5rem">Just want a price range? <a class="link" href="/pricing#estimate">Use the instant estimate</a> — no account needed.</p></div>`;

(async () => {
  const [user, opts] = await Promise.all([currentCustomer(), loadOptions()]);
  if (!user) { root.innerHTML = gate(); return; }

  root.innerHTML = `<div class="form-page">
    <form class="card card-pad" novalidate>
      <div class="form-alert" role="alert"></div>
      <fieldset><legend>Your contact details</legend>
        <div class="form-grid" style="--cols:3">
          <div class="field"><label for="q-name">Full name</label><input id="q-name" name="customerName" autocomplete="name" required maxlength="100"></div>
          <div class="field"><label for="q-email">Email</label><input id="q-email" name="customerEmail" type="email" autocomplete="email" required></div>
          <div class="field"><label for="q-phone">Phone</label><input id="q-phone" name="customerPhone" type="tel" autocomplete="tel" required maxlength="30"></div>
        </div></fieldset>
      <fieldset><legend>Moving from</legend>${locationFields('origin', opts)}</fieldset>
      <fieldset><legend>Moving to</legend>${locationFields('destination', opts)}</fieldset>
      <fieldset><legend>About your move</legend>
        <div class="form-grid" style="--cols:3">
          <div class="field"><label for="q-date">Moving date</label><input id="q-date" name="moveDate" type="date" min="${todayIso()}" required></div>
          <div class="field"><label for="q-type">Move type</label><select id="q-type" name="moveType" required>${optionTags(opts.moveTypes, 'residential')}</select></div>
          <div class="field"><label for="q-size">Property size</label><select id="q-size" name="propertySize" required>${optionTags(opts.propertySizes, '', { placeholder: 'Select…' })}</select></div>
        </div>
        <p class="label" style="margin:1.3rem 0 .6rem">Services you need <span class="opt">(optional)</span></p>
        <div class="chips" data-field="services">${opts.services.map((s) => `<label class="chip"><input type="checkbox" name="services" value="${s.value}"><span>${esc(s.label)}</span></label>`).join('')}</div>
      </fieldset>
      <fieldset><legend>Inventory &amp; notes</legend>
        <div class="form-grid" style="--cols:1">
          <div class="field"><label for="q-inv">Estimated inventory <span class="opt">(optional)</span></label>
            <textarea id="q-inv" name="inventory" rows="4" maxlength="3000" placeholder="e.g. 1 sofa, queen bed, dining table with 6 chairs, about 30 boxes, piano"></textarea>
            <p class="hint">A rough list of large items and the number of boxes helps us confirm an accurate price.</p></div>
          <div class="field"><label for="q-notes">Additional notes <span class="opt">(optional)</span></label>
            <textarea id="q-notes" name="notes" rows="3" maxlength="2000" placeholder="Stairs, elevators, parking, fragile items, timing constraints"></textarea></div>
        </div></fieldset>
      <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin-top:1.8rem">
        <button class="btn btn-primary btn-lg" type="submit">Submit quote request</button>
        <span class="small muted">You’ll see your estimate as soon as you submit.</span>
      </div>
    </form>
    <aside class="form-side">
      <div class="notice">${icon('info')}<div><strong>What happens next</strong>Your estimate appears instantly. A representative then reviews your request and confirms the final price in your account and by email.</div></div>
      <div class="card card-pad"><h3 style="font-size:1.05rem">Signed in as</h3><p style="margin:0">${esc(user.fullName)}<br><span class="muted small">${esc(user.email)}</span></p></div>
    </aside>
  </div>`;

  const form = $('form', root);
  const moveType = form.elements.moveType;
  wireLocations(form, opts, () => {
    const intl = [form.elements['origin.province'].value, form.elements['destination.province'].value].includes('INTL');
    if (intl) moveType.value = 'international';
    else if (moveType.value === 'international') moveType.value = 'residential';
  });
  fillForm(form, { customerName: user.fullName, customerEmail: user.email, customerPhone: user.phone || '' });

  // Carry over details from the instant estimate, if the visitor used it first.
  const draft = getEstimateDraft();
  if (draft) {
    fillForm(form, { origin: draft.origin, destination: draft.destination, moveType: draft.moveType, propertySize: draft.propertySize, moveDate: draft.moveDate, services: draft.services || [], notes: draft.details || '' });
  }

  handleForm(form, (data) => post('/customer/quotes', data), {
    onSuccess: ({ quote, disclaimer }) => {
      sessionStorage.removeItem('rmc:estimate-draft');
      root.innerHTML = `<div class="form-page">
        <div class="card success-panel">
          <div class="check-mark">${icon('check')}</div>
          <h2>Quote request ${esc(quote.reference)} received</h2>
          <p class="muted">${esc(place(quote.origin))} → ${esc(place(quote.destination))} · ${esc(quote.propertySizeLabel)}</p>
          <div class="estimate-label" style="margin-top:1.5rem">Estimated Moving Cost</div>
          <div class="estimate-price">${money(quote.estimate.min)} – ${money(quote.estimate.max)}<span class="cur">CAD</span></div>
          <p class="disclaimer" style="text-align:left;max-width:520px;margin:1.2rem auto">${esc(disclaimer || DISCLAIMER)}</p>
          <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
            <a class="btn btn-primary" href="/booking?quote=${quote.id}">Request a booking for this move</a>
            <a class="btn btn-outline" href="/dashboard#quotes/${quote.id}">View in my account</a>
          </div>
        </div>
        <aside class="form-side"><div class="notice">${icon('mail')}<div><strong>Confirmation sent</strong>We’ve emailed a copy to ${esc(quote.customer.email)} and notified our team.</div></div></aside>
      </div>`;
      scrollTo({ top: 0, behavior: 'smooth' });
    },
  });
})();
