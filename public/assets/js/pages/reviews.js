import '../site.js';
import { $, esc, icon, stars, handleForm, pager } from '../core/ui.js';
import { currentCustomer, get, post } from '../core/api.js';
import { loadReviews } from '../core/catalog.js';
import { reviewCard } from '../components/cards.js';

async function showPage(page = 1) {
  const data = await loadReviews(page, 9);
  const { summary } = data;
  $('[data-summary]').innerHTML = summary.count
    ? `<div class="review-summary"><span class="score">${summary.average.toFixed(1)}</span><div>${stars(Math.round(summary.average))}<div class="small" style="color:#C9D6DF">Based on ${summary.count} published review${summary.count === 1 ? '' : 's'}</div></div></div>`
    : '';
  $('[data-review-list]').innerHTML = data.reviews.length
    ? `<div class="review-grid">${data.reviews.map(reviewCard).join('')}</div>${pager(data.pagination, (p) => { showPage(p); scrollTo({ top: 0, behavior: 'smooth' }); })}`
    : `<div class="empty">${icon('message')}<h3>No published reviews yet</h3><p>Reviews from RealMovingCanada customers will appear here once they’ve been approved.</p></div>`;
}
showPage();

const formHost = $('[data-review-form]');
currentCustomer().then(async (user) => {
  if (!user) {
    formHost.innerHTML = `<div class="card card-pad gate" style="text-align:left;margin:0;max-width:none">
      <p style="margin:0 0 1rem">Please sign in to leave a review. Reviews are linked to customer accounts so that every published review comes from a real customer.</p>
      <div class="actions" style="justify-content:flex-start"><a class="btn btn-primary" href="/account?next=/reviews%23write">Sign in to write a review</a><a class="btn btn-outline" href="/account?next=/reviews%23write&tab=register">Create an account</a></div></div>`;
    return;
  }
  let bookings = [];
  try { bookings = (await get('/customer/reviews')).reviewableBookings || []; } catch { /* optional */ }
  formHost.innerHTML = `<form class="card card-pad" novalidate>
    <div class="form-alert" role="alert"></div>
    <div class="field" data-field="rating"><span class="label">Your rating</span>
      <div class="stars-input" role="radiogroup" aria-label="Rating">${[5, 4, 3, 2, 1].map((n) => `<input type="radio" name="rating" id="rate-${n}" value="${n}"><label for="rate-${n}" title="${n} star${n > 1 ? 's' : ''}">${icon('star', 'i i-fill')}<span class="sr-only">${n} star${n > 1 ? 's' : ''}</span></label>`).join('')}</div></div>
    ${bookings.length ? `<div class="field" style="margin-top:1rem"><label for="rv-b">Which move is this about? <span class="opt">(optional)</span></label><select id="rv-b" name="bookingId"><option value="">General review</option>${bookings.map((b) => `<option value="${b.id}">${esc(b.reference)}</option>`).join('')}</select></div>` : ''}
    <div class="field" style="margin-top:1rem"><label for="rv-title">Title <span class="opt">(optional)</span></label><input id="rv-title" name="title" maxlength="100"></div>
    <div class="field" style="margin-top:1rem"><label for="rv-body">Your review</label><textarea id="rv-body" name="body" rows="5" maxlength="2000" required placeholder="Tell others about your move — what went well, and what could be better."></textarea><p class="hint">Between 20 and 2,000 characters. Reviews are published after approval.</p></div>
    <button class="btn btn-primary" type="submit" style="margin-top:1.2rem">Submit review</button>
  </form>`;
  const form = $('form', formHost);
  handleForm(form, (d) => post('/customer/reviews', d), {
    onSuccess: (res) => {
      formHost.innerHTML = `<div class="card success-panel"><div class="check-mark">${icon('check')}</div><h2>Thank you!</h2><p class="lead">${esc(res.message)}</p><a class="btn btn-outline" href="/dashboard#reviews">View my reviews</a></div>`;
    },
  });
});
