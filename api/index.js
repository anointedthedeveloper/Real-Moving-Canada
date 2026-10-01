/**
 * Vercel serverless function: every /api/* request is rewritten here (vercel.json)
 * and handled by the Express app in server/app.js.
 */
import app from '../server/app.js';

export default app;
