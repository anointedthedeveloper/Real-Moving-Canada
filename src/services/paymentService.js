import { post, ApiError } from './apiClient.js';

/**
 * Provider-neutral payments. No payment provider is connected yet, so
 * `payBooking` rejects before anything leaves the browser — card details are
 * never sent to our own API. To connect one (Stripe, Moneris, Square…):
 *   1. implement `tokenizeCard` with the provider's browser SDK, and
 *   2. have POST /api/portal/payments charge the returned token.
 */
export const PAYMENTS_CONNECTED = false;

const NOT_CONNECTED_MESSAGE = 'Online payments aren’t connected yet, so no payment was taken. Please contact us to arrange payment.';

async function tokenizeCard(/* card */) {
  throw new ApiError(NOT_CONNECTED_MESSAGE, 503);
}

export async function payBooking({ bookingId, amount, card, saveMethod }) {
  if (!PAYMENTS_CONNECTED) throw new ApiError(NOT_CONNECTED_MESSAGE, 503);
  const token = await tokenizeCard(card);
  return post('/portal/payments', { bookingId, amount, token, saveMethod });
}
