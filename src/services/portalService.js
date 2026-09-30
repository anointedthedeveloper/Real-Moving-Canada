import { get, post, put, ApiError, isNotConnected } from './apiClient.js';

/**
 * Customer portal data. Every read resolves to { items, connected } so pages can
 * render empty states when the portal API isn't connected yet, instead of showing
 * made-up records. Writes reject with a clear message in that case.
 */
const UNAVAILABLE = 'This isn’t available yet — the customer portal isn’t connected to our systems. Please call or email us and we’ll help right away.';

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
