/**
 * Zero-dependency static server for the built React app (dist/).
 *
 * Real files ("/assets/index-abc.js", "/favicon.png") are served as-is with long
 * caching for hashed assets. Every other GET is answered with dist/index.html so
 * React Router can render the route — a hard refresh on /services/storage or
 * /dashboard/quotes works, and unknown paths get the app's own 404 page.
 * The API is a separate service (backend/, e.g. https://api.realmovingcanada.ca);
 * the website calls it at VITE_API_BASE.
 *
 * Usage: npm run build && npm start   (port: argv[2], then $PORT, then 3000)
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const PORT = Number(process.argv[2]) || Number(process.env.PORT) || 3000;
const INDEX = path.join(ROOT, 'index.html');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function resolveFile(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]); } catch { return null; }
  const candidate = path.join(ROOT, path.normalize(decoded));
  if (!candidate.startsWith(ROOT)) return null; // path traversal guard
  try {
    return fs.statSync(candidate).isFile() ? candidate : null;
  } catch {
    return null;
  }
}

function send(res, file, status = 200) {
  const ext = path.extname(file);
  const hashed = file.includes(`${path.sep}assets${path.sep}`);
  res.writeHead(status, {
    'Content-Type': TYPES[ext] || 'application/octet-stream',
    'Cache-Control': hashed ? 'public, max-age=31536000, immutable' : 'no-cache',
  });
  fs.createReadStream(file).pipe(res);
}

if (!fs.existsSync(INDEX)) {
  console.error('[server] dist/index.html not found — run "npm run build" first.');
  process.exit(1);
}

http.createServer((req, res) => {
  const file = resolveFile(req.url);
  if (file) return send(res, file);
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end();
    return;
  }
  send(res, INDEX); // SPA fallback: React Router renders the route (or its 404 page)
}).listen(PORT, () => {
  console.log(`[server] Real Moving Canada is running at http://localhost:${PORT}`);
});
