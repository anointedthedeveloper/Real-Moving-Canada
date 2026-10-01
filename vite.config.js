import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Public site address used in index.html (%VITE_SITE_URL%), canonical links and the sitemap.
process.env.VITE_SITE_URL ||= 'https://real-moving-canada-ddne.vercel.app';

// `public/` still holds the legacy static site, so Vite's static files live in `static/`.
export default defineConfig({
  plugins: [react()],
  publicDir: 'static',
  server: {
    port: 5173,
    // `npm run dev:api` serves the API locally; the frontend calls it as /api like in production.
    proxy: { '/api': 'http://localhost:4000' },
  },
});
