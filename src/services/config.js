/**
 * Runtime configuration. Values can be overridden with Vite env vars
 * (e.g. VITE_API_BASE=https://api.example.com/api in a .env file).
 */
export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

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
