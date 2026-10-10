/**
 * Vercel serverless entry, used when this backend folder is deployed as its own
 * Vercel project (Root Directory: backend). backend/vercel.json routes every
 * request here. Long-running hosts use src/server.js instead.
 */
import app from '../src/app.js';

export default app;
