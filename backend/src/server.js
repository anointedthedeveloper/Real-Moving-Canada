/**
 * Starts the API as a long-running Node server (Render, Railway, a VPS…):
 *   npm start           (production)   ·   npm run dev   (local, reloads on change)
 * On Vercel the same app runs as a serverless function instead (api/index.js).
 */
import app from './app.js';
import { config } from './config.js';
import { connectDb } from './db.js';

app.listen(config.port, () => {
  console.log(`[api] Real Moving Canada API on http://localhost:${config.port}/api`);
  console.log(`[api] allowed website origins: ${config.corsOrigins.join(', ')}`);
  // Connect early so the first request is fast; failures are reported per request.
  if (config.mongoUri) connectDb().then(() => console.log('[api] connected to MongoDB')).catch((e) => console.error('[api] MongoDB connection failed:', e.message));
});
