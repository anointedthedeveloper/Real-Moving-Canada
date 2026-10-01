/**
 * Runtime configuration from Vite env vars (set in Vercel → Environment Variables,
 * or a local .env file — see .env.example).
 *
 * VITE_API_BASE is the backend's address, e.g. https://api.realmovingcanada.ca/api.
 * Locally it defaults to /api, which Vite proxies to the backend on port 4000.
 */
export const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/+$/, '');

/**
 * Formspree endpoint that receives the public forms (quote, contact, reviews).
 * Carried over from the original site's assets/js/core/formspree.js.
 */
export const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT || 'https://formspree.io/f/xaenbadr';

/**
 * The customer portal requires signing in. Set VITE_REQUIRE_AUTH=false only to
 * preview the portal screens without the API (they then show empty states).
 */
export const REQUIRE_AUTH = import.meta.env.VITE_REQUIRE_AUTH !== 'false';
