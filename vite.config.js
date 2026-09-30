import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `public/` still holds the legacy static site, so Vite's static files live in `static/`.
export default defineConfig({
  plugins: [react()],
  publicDir: 'static',
  server: { port: 5173 },
});
