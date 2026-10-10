import { post } from './apiClient.js';

export const ESTIMATE_DISCLAIMER =
  'Your estimate is based on the information provided. Final pricing will be confirmed by a Real Moving Canada representative.';

/**
 * Instant estimate. Pricing is calculated on the server (POST /api/public/estimate)
 * so rates never ship to the browser. Resolves to { unavailable: true } when the
 * pricing service isn't reachable, so the UI can offer a quote request instead.
 */
export async function requestEstimate(details) {
  try {
    const res = await post('/public/estimate', details);
    return { estimate: res.estimate, disclaimer: res.disclaimer || ESTIMATE_DISCLAIMER };
  } catch {
    return { unavailable: true };
  }
}
