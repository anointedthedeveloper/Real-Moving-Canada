import express from 'express';
import cookieParser from 'cookie-parser';
import { corsPolicy, securityHeaders, requireAjax } from './middleware/security.js';
import { loadUser } from './middleware/auth.js';
import { apiNotFound, errorHandler } from './middleware/errors.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import portalRoutes from './routes/portal.js';

/**
 * The Real Moving Canada API. Every route lives under /api and answers JSON in the
 * shape the frontend's service layer expects (`{ error: { message, fields } }` on failure).
 */
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // hosting platforms sit behind a proxy that sets X-Forwarded-For

  app.use(corsPolicy);
  app.get('/', (_req, res) => res.json({ name: 'Real Moving Canada API', health: '/api/health' }));
  app.get('/health', (_req, res) => res.json({ ok: true }));

  const api = express.Router();
  api.use(securityHeaders);
  api.use(express.json({ limit: '100kb' }));
  api.use(cookieParser());
  api.use(requireAjax);
  api.get('/health', (_req, res) => res.json({ ok: true }));
  api.use(loadUser);
  api.use('/auth', authRoutes);
  api.use('/public', publicRoutes);
  api.use('/portal', portalRoutes);
  api.use(apiNotFound);

  app.use('/api', api);
  app.use(errorHandler);
  return app;
}

const app = createApp();
export default app;
