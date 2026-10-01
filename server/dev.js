/**
 * Local API server for development: `npm run dev:api` (port 4000).
 * Run `npm run dev` alongside it — Vite proxies /api to this server.
 */
import app from './app.js';

const PORT = Number(process.env.API_PORT) || 4000;
app.listen(PORT, () => console.log(`[api] listening on http://localhost:${PORT}/api`));
