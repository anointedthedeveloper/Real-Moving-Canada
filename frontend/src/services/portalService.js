import { get, post, put, ApiError, isNotConnected } from './apiClient.js';
import { COMPANY } from '../constants/company.js';

/**
 * Customer portal data from the /api/portal endpoints. Every read resolves to
 * { items, connected } so pages render empty states (never made-up records) when
 * the API can't be reached; writes reject with a friendly message in that case.
 */
const UNAVAILABLE = `We couldn’t save this right now. Please try again in a few minutes, or call us at ${COMPANY.phone}.`;

async function list(path, key) {
  try {
    const data = await get(path);
    return { items: data?.[key] || [], connected: true };
  } catch (err) {
    if (isNotConnected(err)) return { items: [], connected: false };
    throw err;
  }
}

const write = (promise) => promise.catch((err) => {
  if (isNotConnected(err)) throw new ApiError(UNAVAILABLE, 503);
  throw err;
});

export const fetchOverview = async () => {
  try {
    return { ...(await get('/portal/overview')), connected: true };
  } catch (err) {
    if (isNotConnected(err)) return { upcomingMove: null, summary: null, activity: [], connected: false };
    throw err;
  }
};
export const fetchMoves = () => list('/portal/moves', 'moves');
export const fetchQuotes = () => list('/portal/quotes', 'quotes');
export const fetchBookings = () => list('/portal/bookings', 'bookings');
export const fetchPayments = () => list('/portal/payments', 'payments');
export const fetchDocuments = () => list('/portal/documents', 'documents');
export const fetchConversations = () => list('/portal/messages', 'conversations');
export const fetchProfile = async () => {
  try {
    return { profile: (await get('/portal/profile')).profile, connected: true };
  } catch (err) {
    if (isNotConnected(err)) return { profile: null, connected: false };
    throw err;
  }
};

export const acceptQuote = (id) => write(post(`/portal/quotes/${encodeURIComponent(id)}/accept`));
export const sendMessage = (conversationId, body) => write(post(`/portal/messages/${encodeURIComponent(conversationId)}`, { body }));
export const updateProfile = (profile) => write(put('/portal/profile', profile));
export const updateSettings = (settings) => write(put('/portal/settings', settings));
export const uploadDocument = (file) => {
  const form = new FormData();
  form.append('file', file);
  return write(post('/portal/documents', form));
};
