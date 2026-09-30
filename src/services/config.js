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
 * Customer accounts need a backend that doesn't exist yet. While this is false the
 * customer portal can be browsed without signing in (empty states and a sign-in prompt); set
 * VITE_REQUIRE_AUTH=true once /api/auth is live to require sign-in.
 */
export const REQUIRE_AUTH = import.meta.env.VITE_REQUIRE_AUTH === 'true';
