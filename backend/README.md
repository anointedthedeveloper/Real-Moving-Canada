# Real Moving Canada — API

Express + MongoDB Atlas API for the Real Moving Canada website.

```
Browser ──HTTPS──▶ realmovingcanada.ca (website, Vercel)
   │
   └──HTTPS /api/…──▶ api.realmovingcanada.ca (this API)
                          │  MONGODB_URI (only here — never in the website)
                          ▼
                     MongoDB Atlas
```

- The website calls `https://api.realmovingcanada.ca/api/...` with `credentials: 'include'`.
- The API only accepts calls from the website's addresses (CORS + an Origin check). It is the only service that talks to Atlas.
- Atlas only accepts connections from the API host's IP addresses.

## Folder structure

```
backend/
  src/
    server.js           starts the API (npm start / npm run dev)
    app.js              Express app: CORS, security headers, CSRF check, routes, errors
    config.js           environment settings
    db.js               cached MongoDB Atlas connection
    models/             User, QuoteRequest, Move, Quote, Booking, Payment, Document,
                        Conversation, Review, PasswordReset, Activity
    routes/auth.js      /api/auth/*    sign up, login, logout, session, forgot/reset password
    routes/public.js    /api/public/*  quote requests, reviews, service areas, estimate
    routes/portal.js    /api/portal/*  the signed-in customer's moves, quotes, bookings,
                                       payments, documents, messages, profile, settings
    middleware/         auth, CORS/CSRF/rate limits, error handling
    lib/                passwords + session cookie, email (Resend), validation (zod), ids
  api/index.js          entry point when hosted on Vercel (with vercel.json)
  scripts/              check-db.js, seed-demo.js, make-admin.js
  tests/                API tests (in-memory MongoDB)
  .env.example          every setting, with no values
```

## Environment variables

Copy `.env.example` to `.env` locally. On the host, add the same names in its environment settings.

| Variable | Example | Notes |
| --- | --- | --- |
| `MONGODB_URI` | from Atlas → Connect → Drivers | required |
| `MONGODB_DB` | `realmovingcanada` | database name |
| `JWT_SECRET` | 48+ random characters | required; signs login sessions |
| `FRONTEND_URL` | `https://realmovingcanada.ca` | used in password-reset links; always allowed by CORS |
| `CORS_ORIGINS` | `https://realmovingcanada.ca,https://www.realmovingcanada.ca` | comma-separated; add `http://localhost:5173` for local dev |
| `COOKIE_SAMESITE` | `lax` | `lax` when the site and API share `realmovingcanada.ca`; `none` if they're on unrelated domains (e.g. a `*.vercel.app` preview calling the API) |
| `PORT` | `4000` | most hosts set this automatically |
| `NODE_ENV` | `production` | on the live server |
| `RESEND_API_KEY`, `EMAIL_FROM`, `STAFF_NOTIFY_EMAIL` | | email; without a key, emails are only logged |

The **website** needs one more setting in its own Vercel project:
`VITE_API_BASE=https://api.realmovingcanada.ca/api`.

## Deploying

The API runs anywhere Node 20.12+ runs.

| Host | How | MongoDB Atlas → Network Access |
| --- | --- | --- |
| **Render / Railway / VPS** | Root directory `backend`, build `npm install`, start `npm start` | Add the host's **static outbound IPs**. Render and Railway provide these on paid plans; a VPS has its own IP. |
| **Vercel (separate project)** | New Vercel project from this repo with **Root Directory `backend`** (uses `backend/vercel.json`) | Vercel has no fixed IPs. Use the **MongoDB Atlas Vercel integration**, or allow `0.0.0.0/0` (the strong database password is then the only protection). |

Then:
1. Add the environment variables above on the host.
2. Point **`api.realmovingcanada.ca`** at the API: add the custom domain on the host, then the DNS record it gives you (usually a `CNAME`) at the domain registrar.
3. Set `VITE_API_BASE` on the website's Vercel project and redeploy the website.
4. Check `https://api.realmovingcanada.ca/health` → `{"ok":true}`.
5. Run `npm run check:db` on the server, or from any machine whose IP Atlas allows, to confirm the database connection and create the indexes.
6. Sign up on the website, then `npm run make:admin -- you@example.com`.

## Running locally

```
cd backend
cp .env.example .env      # fill in MONGODB_URI, JWT_SECRET, FRONTEND_URL, CORS_ORIGINS
npm install
npm run check:db          # confirms Atlas accepts this computer's IP
npm run dev               # API on http://localhost:4000 (restarts on changes)
npm test                  # API tests — use a temporary in-memory MongoDB, not Atlas
npm run seed:demo         # optional demo customer (refuses NODE_ENV=production)
```

In another terminal at the repo root, run `npm run dev`. The website on `http://localhost:5173` proxies `/api` to this server.

Demo login after `seed:demo`: `demo@realmovingcanada.test` / `DemoMove2026!`.

## What works

| Area | Endpoints | Status |
| --- | --- | --- |
| Accounts | `POST /api/auth/signup`, `login`, `logout`, `forgot-password`, `reset-password`; `GET /api/auth/session` | ✅ bcrypt passwords, httpOnly session cookie (1 day, or 30 days with "Remember me"), lockout after 5 failed logins, one-time reset links (60 min), a reset signs out other devices |
| Quote requests | `POST /api/public/quotes` | ✅ saved with a reference (`QR-XXXXXX`), linked to the customer's account (now or when they sign up with the same email), team email via `STAFF_NOTIFY_EMAIL` |
| Reviews | `POST/GET /api/public/reviews` | ✅ pending until published; public view shows first name + last initial |
| Service areas | `GET /api/public/service-areas` | ✅ |
| Customer portal | `GET /api/portal/overview, moves, quotes, bookings, payments, documents, messages, profile`; `POST quotes/:ref/accept`, `messages/:ref`; `PUT profile, settings` | ✅ every query is limited to the signed-in customer |
| Instant estimate | `POST /api/public/estimate` | ⏳ needs the company's pricing rules (503 until then; the site offers a quote request) |
| Payments | `POST /api/portal/payments` | ⏳ needs a Stripe account |
| Document uploads | `POST /api/portal/documents` | ⏳ needs file storage (Vercel Blob / S3) |
| Staff dashboard | — | ⏳ next phase (until then, records can be edited in Atlas) |

**Security:**
- CORS allowlist plus an Origin check on every change request.
- Required `X-Requested-With` header (CSRF).
- zod validation with per-field errors.
- 100 KB request limit.
- Rate limits on sign-up, login, password reset, quotes and reviews.
- `no-store` and security headers.
- Password hashes and other customers' data are never returned.

## Still needed before launch

- **Email:** a domain the company owns, verified in Resend, plus `RESEND_API_KEY`, `EMAIL_FROM` and `STAFF_NOTIFY_EMAIL`.
- **Payments:** a Stripe account with keys, plus decisions on deposits, refunds and taxes.
- **Uploads:** file storage (Vercel Blob / S3) and its token.
- **Instant estimates:** pricing rules (rates per home size, distance, season and service; minimum charge).
- **Staff:** who needs staff access, and the staff dashboard.
- **Legal:** a review of the Privacy Policy and Terms.
