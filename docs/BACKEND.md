# Backend — Real Moving Canada API

The API runs as a **Vercel serverless function** in this same repository
(`api/index.js` → Express app in `server/`), stores data in **MongoDB Atlas**, and
is served from the same domain as the website (`/api/...`), so there is no CORS
setup and session cookies just work.

```
api/index.js            Vercel function entry (all /api/* requests are rewritten here)
server/
  app.js                Express app: security headers, CSRF check, routes, errors
  config.js / db.js     environment settings and the cached Atlas connection
  models/               User, QuoteRequest, Move, Quote, Booking, Payment,
                        Document, Conversation, Review, PasswordReset, Activity
  routes/auth.js        /api/auth/*    sign up, login, logout, session, forgot/reset password
  routes/public.js      /api/public/*  quote requests, reviews, service areas, estimate
  routes/portal.js      /api/portal/*  the signed-in customer's moves, quotes, bookings,
                                       payments, documents, messages, profile, settings
  lib/                  auth (bcrypt + JWT cookie), email (Resend), validation (zod)
  scripts/              seed-demo.js, make-admin.js
  tests/                API tests (in-memory MongoDB)
```

## Checklist — what we need before going live

### Needed now (MongoDB Atlas + secrets)

- [ ] **MongoDB Atlas cluster.** Create a project and cluster in Atlas.
  - M0 (free) is fine for testing.
  - Use **M10 or higher for production**, because it adds backups and more capacity.
  - Pick a Canadian/US region close to Vercel's (e.g. AWS `us-east-1` or `ca-central-1`).
- [ ] **Database user.** Atlas → Database Access → add a user with *Read and write to any database* and a long random password.
- [ ] **Network access.** Vercel functions don't have fixed IP addresses, so either:
  - install the **MongoDB Atlas integration** from the Vercel marketplace (recommended — it sets the connection string for you), or
  - allow `0.0.0.0/0` in Atlas → Network Access (the strong password then matters even more).
- [ ] **`MONGODB_URI`**. This is the connection string from Atlas → Connect → Drivers. Add it in Vercel → Settings → Environment Variables. **Don't paste it into chats, tickets or code.**
- [ ] **`JWT_SECRET`**. A long random value that signs login sessions. Generate one with:
  `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.
- [ ] **`APP_URL`**. The public site address (used in password-reset emails).

### Needed for email (password resets, quote notifications)

- [ ] **Email provider account.** [Resend](https://resend.com) is already wired in. Any provider works with a small change.
- [ ] **A domain the company owns** (e.g. `realmovingcanada.ca`), verified in Resend with its DNS records. Emails sent from a free address such as yahoo.com end up in spam or are rejected.
- [ ] **`RESEND_API_KEY`**, **`EMAIL_FROM`** (e.g. `Real Moving Canada <no-reply@realmovingcanada.ca>`), and **`STAFF_NOTIFY_EMAIL`** (where new quote requests are sent).

Until a key is set, emails are written to the server log instead of being sent.

### Needed for online payments

- [ ] **Stripe account** for the company, which is the recommended option. Stripe needs:
  - business details
  - a Canadian bank account for payouts
  - tax and identity verification
- [ ] **Stripe keys**: `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`, plus a webhook signing secret.
- [ ] **Decisions**: deposit vs full payment, when payment is due, refund and cancellation rules, and whether taxes (GST/PST) are shown separately.

### Needed for document uploads

- [ ] **File storage**: **Vercel Blob** (simplest on Vercel) or AWS S3 / Cloudinary, and its token or keys.
- [ ] **Limits**: allowed file types and maximum size (the UI currently says PDF, images and Word, up to 10 MB).

### Needed for instant estimates

- [ ] **The company's pricing rules**:
  - base price per home size
  - price per km or per route between cities/provinces
  - busy-season, weekend and month-end adjustments
  - price per service (packing, storage per week, heavy items…)
  - minimum charge
  - how wide the shown price range should be

### Needed to run the business day to day

- [ ] **How staff will manage requests.** Customers can now send requests, but staff need a way to:
  - turn a quote request into a priced quote
  - confirm a booking
  - post an invoice
  - reply to messages
  - publish reviews

  Options: **(a)** a staff/admin dashboard in this website (recommended — next phase), or **(b)** to start with, editing records directly in Atlas / MongoDB Compass.
- [ ] **Staff accounts**: who needs access. After they sign up on the website, run `npm run make:admin -- their@email.com` (or `… staff`).
- [ ] **Legal review** of the Privacy Policy and Terms (customer data is now stored).

## What already works

| Area | Endpoints | Status |
| --- | --- | --- |
| Accounts | `POST /api/auth/signup`, `login`, `logout`, `forgot-password`, `reset-password`; `GET /api/auth/session` | ✅ bcrypt passwords, httpOnly session cookie (1 day, or 30 days with "Remember me"), lockout after 5 failed logins, one-time reset links (60 min), resetting signs out other devices |
| Quote requests | `POST /api/public/quotes` | ✅ saved with a reference (e.g. `QR-7K4M9P`), linked to the account (now, or when the customer later signs up with the same email), team email via `STAFF_NOTIFY_EMAIL`. The website still also sends to Formspree. |
| Reviews | `POST/GET /api/public/reviews` | ✅ saved as pending; only published reviews are shown (first name + last initial) |
| Service areas | `GET /api/public/service-areas` | ✅ |
| Customer portal | `GET /api/portal/overview, moves, quotes, bookings, payments, documents, messages, profile`; `POST quotes/:ref/accept`, `messages/:ref`; `PUT profile, settings` | ✅ each customer only ever sees their own records |
| Instant estimate | `POST /api/public/estimate` | ⏳ needs pricing rules (returns 503; the site offers a quote request) |
| Payments | `POST /api/portal/payments` | ⏳ needs Stripe |
| Uploads | `POST /api/portal/documents` | ⏳ needs file storage |
| Staff tools | — | ⏳ next phase |

Security:
- Every state-changing request must carry the `X-Requested-With` header, which blocks cross-site requests (CSRF). Cookies are also `SameSite=Lax`.
- Inputs are validated with zod and capped in length.
- Request bodies are limited to 100 KB.
- Responses never include password hashes or other customers' data.
- Rate limits apply to sign-up, login, password reset, quotes and reviews.

## Running it locally

```
cp .env.example .env        # then fill in MONGODB_URI and JWT_SECRET
npm install
npm run dev:api             # API on http://localhost:4000/api
npm run dev                 # website on http://localhost:5173 (proxies /api to the API)
npm run seed:demo           # optional: demo customer with a move, quotes, booking, invoice, messages
npm test                    # API tests (uses a temporary in-memory MongoDB)
```

Demo login after `npm run seed:demo`: `demo@realmovingcanada.test` / `DemoMove2026!`.
The script refuses to run against production.
