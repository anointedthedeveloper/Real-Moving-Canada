# RealMovingCanada — Frontend Files

This is the complete frontend for RealMovingCanada: 14 pages, a shared design system,
and all the vanilla-JS logic for the public site, the customer dashboard, and the
admin dashboard. The backend (Node/Express/PostgreSQL API) is still in progress —
see "How pages fetch data" below.

## What's in here

```
public/                  ← the BUILT, servable website (open index.html or serve this folder)
  index.html, about.html, services.html, service-areas.html, pricing.html,
  reviews.html, contact.html, quote.html, booking.html, account.html,
  dashboard.html, 404.html
  admin/index.html        ← admin dashboard
  admin/login.html         ← admin sign-in
  assets/css/              core.css (design tokens/components), site.css (public
                            site), app.css (customer + admin dashboards)
  assets/js/                core/ (api client, UI helpers, reference data),
                            components/ (location fields, estimate calculator,
                            cards), pages/ (one script per public page),
                            admin/ (dashboard shell + sections), site.js
  assets/img/                placeholder logo (SVG) + service images
  assets/fonts/               self-hosted Archivo variable font

web-sources/              ← EDITABLE page templates + the page builder
  pages/*.html              one source file per page (each starts with
                             <!--meta {...}--> for title/description/scripts)
  scripts/build-pages.js    wraps each page in the shared header/footer/icon
                             sprite and writes the built HTML into public/
```

To change a page's content structure, edit the matching file in `web-sources/pages/`
and run `node web-sources/scripts/build-pages.js` from a project root that has both
`web-sources/pages` and `public` as siblings (this mirrors the original project
layout — the full project, with this wired up as `npm run build:pages`, will ship
with the backend).

## How pages fetch data

Every page's JS module calls a small REST client (`assets/js/core/api.js`) against
`/api/...` routes — e.g. the instant estimate calculator posts to
`/api/public/estimate`, the dashboard reads `/api/customer/...`, and the admin
dashboard reads/writes `/api/admin/...`. None of that data is hard-coded into the
HTML.

**Right now there's no backend running**, so those calls will fail. The pages are
built to degrade gracefully when that happens:

- The **public marketing pages** (services, service areas, reviews, trust
  indicators) fall back to built-in placeholder content (`assets/js/core/data.js`)
  so the site still looks complete.
- The **instant estimate calculator**, **Get a Quote**, **Request a Booking**,
  **account sign-in/register**, the **customer dashboard**, and the **admin
  dashboard** all need the API to actually function — you'll see loading spinners
  or connection errors until the backend is running.

## Paths are relative — two ways to preview

Every internal link and asset reference (`./assets/img/logo.svg`,
`./services.html`, `../assets/css/core.css` from the nested `admin/` pages, etc.)
is written relative to that page's own location, so:

- **Opening a file directly** (double-click `public/index.html`, or drag it into
  a browser tab) works for layout, styling and images/links between pages —
  no server needed for that.
- **The dynamic parts won't run under a plain double-click.** Browsers block
  `<script type="module">` (which every page here uses) and custom `@font-face`
  loading under the `file://` origin as a CORS restriction — this is a browser
  rule, not something path fixes can work around. So under a raw double-click,
  the site falls back to system fonts (fine, just not the custom typeface), but
  things like the services list, the estimate calculator, forms and both
  dashboards will sit on their loading state and never populate, since they're
  rendered by that blocked JavaScript.
- **The fix is to serve the folder over `http://` instead of `file://`** — any
  static server works, e.g. from inside `public/`:
  ```
  npx serve .
  # or
  python3 -m http.server 8080
  ```
  Once it's `http://localhost:...` instead of `file://...`, everything above
  works, including the JS-rendered content (though it'll still show loading
  states for anything that calls the `/api/...` endpoints, since there's no
  backend yet).

## Design system

- Colours, type, spacing and component styles live in `assets/css/core.css` as
  CSS custom properties — change `--ink` / `--red` / `--paper` etc. there to
  re-theme the whole site.
- The logo is a placeholder wordmark (`assets/img/logo.svg` and `logo-light.svg`,
  plus `favicon.svg`) — swap these for the real RealMovingCanada logo whenever
  it's ready; every page references the same three files.
- Admin/customer dashboards share `assets/css/app.css`; the public site uses
  `assets/css/site.css`.

## Next steps

I'll keep building the backend (Express routes, PostgreSQL, auth, the
admin-configurable pricing engine, email notifications) and let you know when the
full stack is ready to run end-to-end.
