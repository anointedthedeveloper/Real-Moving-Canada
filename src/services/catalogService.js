import { get } from './apiClient.js';
import { PROVINCES } from '../constants/options.js';

/**
 * Public catalogue reads. Each call falls back to built-in data when the API isn't
 * available, exactly like the original site did.
 */
export const loadServiceAreas = () =>
  get('/public/service-areas')
    .then((d) => d.areas)
    .catch(() => PROVINCES.map((p) => ({ ...p, isActive: true, cities: [] })));

const EMPTY_REVIEWS = { summary: { count: 0, average: null }, reviews: [], pagination: null };

export const loadReviews = (page = 1, limit = 9) =>
  get(`/public/reviews?page=${page}&limit=${limit}`).then((d) => ({ ...EMPTY_REVIEWS, ...d })).catch(() => EMPTY_REVIEWS);
