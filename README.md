# Ceyteq Digital Race

A production-ready, full-stack onboarding platform for the **Ceyteq Digital Race** — built with
Next.js (App Router, TypeScript, Tailwind CSS), a dynamic form engine, PostgreSQL storage and a
3D **neumorphic (soft UI)** interface that mirrors the supplied design reference (surfaces, depth and
colour tokens — no reference screenshots or placeholder images ship in the UI).

![Ceyteq](public/brand/ceyteq-logo.png)

---

## What is inside

| Area | Highlights |
| --- | --- |
| **Public site** | Single-column, top-to-bottom neumorphic layout: hero with live stats, platform overview, live form showcase, palette section, CTA. No preview/placeholder imagery is embedded in the layout — only the transparent Ceyteq logo. |
| **Dynamic forms** | Every form is stored as a schema in PostgreSQL (sections → fields) and rendered at its own public slug, e.g. `/form/restaurant-onboarding`. |
| **Admin dashboard** | Partitioned workspace: **Restaurant Clients**, **Social Media Leads & Inquiries**, **Form Generator** and **Responses**, plus an overview with a 7-day activity chart, pipeline stats and settings. |
| **Restaurant Clients** | `/admin/clients` derives a client record from every onboarding submission (venue, owner contacts, social links, palette, completeness score) with search and status filters. |
| **Leads & Inquiries** | `/admin/leads` is a full pipeline for enquiries arriving from Facebook, Instagram, TikTok, LinkedIn, YouTube, Pinterest, X, Google Maps, WhatsApp, email, phone or the website form — statuses from new → contacted → qualified → won, with CSV export. |
| **Form builder** | Create / reorder / rename sections and fields, pick field types, edit options, required rules, layouts, success copy and slug — saved atomically. |
| **Restaurant onboarding** | The full five-section form from the brief: Restaurant Details, Owner Details, dynamic Social & Maps links, 10-colour theme picker (max 5), Special Notes. |
| **Security** | CORS + origin verification on every mutating API call, scrypt password hashing, HMAC-signed HttpOnly session cookie, server-side Zod validation generated from the form schema, sanitisation of every input, origin/CSRF checks, CSP + HSTS headers, honeypot + timing + distributed rate limiting. |
| **Contact & social** | All seven official Ceyteq profiles plus hotline, WhatsApp, mobile and email are rendered as real links in the header, contact section and footer — defined once in `src/lib/site-config.ts`. |
| **Database** | One PostgreSQL dialect: embedded **PGlite** in development, **Supabase / managed PostgreSQL** in production. Zero code changes between the two. |

---

## Official links

All contact points are declared in **`src/lib/site-config.ts`** and rendered as real `href`s in the
header, contact section, form confirmation screen and footer.

| Channel | Destination |
| --- | --- |
| Facebook | <https://www.facebook.com/share/1KM2kZvaCC/> |
| Instagram | <https://www.instagram.com/ceyteq/> |
| LinkedIn | <https://www.linkedin.com/in/ceylon-technology> |
| Pinterest | <https://www.pinterest.com/infoceyteq/> |
| TikTok | <https://www.tiktok.com/@ceyteq?lang=en-GB> |
| YouTube | <https://youtube.com/@ceylontechnology-ceyteq> |
| X | <https://x.com/CeylonTech22598> |
| Hotline | [+94 78 860 7143](tel:+94788607143) |
| WhatsApp | <https://wa.me/94788607143> |
| Mobile | [+94 76 860 7143](tel:+94768607143) |
| Email | <mailto:info.ceyteq@gmail.com> |

---

## Quick start

```bash
cp .env.example .env     # then fill AUTH_SECRET and ADMIN_PASSWORD
npm install
npm run db:seed          # creates the admin user + the onboarding form, nothing else
npm run dev              # http://localhost:3000
```

Open the dashboard at **/admin** and sign in with the credentials you put in `.env`
(`ADMIN_EMAIL` / `ADMIN_PASSWORD`). There is no built-in demo account: if you leave
`ADMIN_PASSWORD` blank, `db:seed` generates a strong password and prints it once.

The public onboarding form is live at **/form/restaurant-onboarding**.

> Development uses an embedded PostgreSQL (PGlite) stored in `.data/pglite`, so there is no
> database server to install. Run `npm run db:seed` while the dev server is stopped — PGlite is a
> single-process database, exactly like a local `psql` instance.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | TypeScript, no emit |
| `npm run db:seed` | Idempotent provision: admin account + onboarding form (no sample data) |
| `npm run db:reset` | Delete the local PGlite data folder and reseed |
| `npm run db:stats` | Print forms, statuses and submission counts |
| `npm run db:schema` | Regenerate `db/schema.sql` from `src/lib/db/schema.ts` |
| `npm run logo` | Rebuild the transparent logo assets from the source artwork |

---

## Database

The schema lives in **`src/lib/db/schema.ts`** and is mirrored to **`db/schema.sql`**:

```
admin_users   ──< forms ──< form_sections ──< form_fields
                    └────< submissions >── admin_users (reviewer)

leads            standalone pipeline: social / email / phone / website enquiries
```

* Applied automatically on first connection (`create table if not exists`, so it is idempotent).
* `npm run db:stats` shows which driver is active.

### Switch to Supabase / PostgreSQL

1. Create a project on Supabase and copy the **pooled** connection string
   (Project settings → Database → Connection pooling).
2. Set it in `.env`:

   ```bash
   DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require"
   ```

3. Apply the schema (either is fine):

   ```bash
   psql "$DATABASE_URL" -f db/schema.sql
   # or paste db/schema.sql into the Supabase SQL editor
   ```

4. `npm run db:seed` to create the first admin, then `npm run dev`.

`src/lib/db/index.ts` picks the driver from `DATABASE_URL`: `postgres://…` uses the pooled
`pg` client, anything else uses PGlite. Both expose the same `query/one/transaction` API with
`$1` placeholders, and every statement in the codebase is valid PostgreSQL.

> Prisma note: the data access layer is intentionally ORM-free (a thin typed repository over
> `pg`). That keeps the app portable — the same SQL runs on Supabase, Neon, RDS or the embedded
> PGlite, and there are no native engine binaries to fetch at build time.

---

## Dynamic form engine

```
src/lib/types.ts          FieldType, options/config contracts, default palette & platforms
src/lib/site-config.ts    official social profiles + contact channels (single source of truth)
src/lib/sanitize.ts       input sanitisers (text, email, tel, URL, identifiers, CSV cells)
src/lib/rate-limit.ts     Upstash Redis / in-memory sliding-window limiter
src/lib/env.ts            validated environment + secure-configuration guard
src/lib/http.ts           shared JSON parsing, error shapes and admin write guard
src/lib/forms.ts          Prisma-free DTO mappers + Zod validation generated per field
src/lib/templates.ts      The production restaurant onboarding definition
src/lib/repos/*.ts        Typed SQL repositories (forms, submissions, users)
src/lib/services/*.ts     Business logic used by pages and route handlers
```

* **Field types** — `text`, `email`, `tel`, `url`, `number`, `textarea`, `select`,
  `color-multi` (max-N colour picker) and `links` (repeatable platform + URL rows).
* **Validation** — `validateSubmission()` builds a Zod schema from the stored definition, strips
  unknown keys, normalises URLs (`maps.google.com/x → https://maps.google.com/x`) and returns
  per-field errors the UI renders inline.
* **Public rendering** — `/form/[slug]` loads the published definition and renders it through
  `DynamicForm`; drafts are only visible to signed-in admins (preview mode disables submission).

### REST endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/forms/:slug/submissions` | public | Create a validated submission |
| `POST` | `/api/auth/login` · `/api/auth/logout` | public | Session cookie |
| `GET/POST` | `/api/admin/forms` | admin | List / create (template or blank) |
| `GET/PATCH/DELETE` | `/api/admin/forms/:id` | admin | Read / save definition / delete |
| `PATCH` | `/api/admin/forms/:id/status` | admin | Publish, unpublish, archive |
| `POST` | `/api/admin/forms/:id/duplicate` | admin | Duplicate a form |
| `PATCH/DELETE` | `/api/admin/submissions/:id` | admin | Status, notes, delete |
| `GET` | `/api/admin/submissions/export` | admin | CSV download |
| `POST` | `/api/leads` | public | Website enquiry → leads pipeline |
| `PATCH/DELETE` | `/api/admin/leads/:id` | admin | Update lead status / delete |
| `GET` | `/api/admin/leads/export` | admin | Leads CSV download |
| `GET` | `/api/health` | public | Liveness/readiness probe (driver, row counts, no secrets) |

---

## Design system

* **Palette** — matte ash canvas `#E2E8F0`, Ceyteq Blue `#0072CE`, Radium/neon blue `#00D2FF`
  for active states and glowing indicators, Deep Navy `#082B49` for text and dark surfaces.
* **True 3D neumorphism** — nothing is flat. One light source (top-left) drives every surface:
  a white specular highlight on the top-left edge plus a deep two-layer ash shadow on the
  bottom-right, and a neutral fill gradient between `#F9FBFE` and `#D7DFE9`. Primitives live in
  `src/app/globals.css` — `.neu`, `.neu-raised`, `.neu-3d`, `.neu-sunken`, `.neu-input`,
  `.neu-btn`, `.neu-btn-primary`, `.neu-btn-dark`, `.neu-btn-neon`, `.neu-orb`, `.neu-check`,
  `.neu-chip`, `.nav-link` — so pressed (inset) and raised (extruded) states stay consistent.
* **Neon accents** — `.neu-btn-neon` (navy → cobalt → radium gradient with an outer glow) is the
  primary form submit; `.neon-dot` marks live indicators; focused inputs glow radium blue; active
  sidebar partitions get a neon edge bar.
* **Logo** — `scripts/prepare-logo.mjs` removes the photographed white paper from the supplied
  artwork: it flood-fills the background from the edges, rebuilds a feathered alpha channel,
  un-premultiplies the white pigment (no white fringing) and un-premultiplies highlight pixels, then
  exports `public/brand/ceyteq-logo.png`, `@2x`, a square mark for the favicon and a small header
  variant. Run `npm run logo` to regenerate.
* **Type** — Sora (display) + Manrope (UI), self-hosted via `@fontsource-variable` (no external
  font CDN).
* **Motion** — restrained: pressed/raised hover transitions, pulse rings on confirmation and
  fade-ups on load, all disabled under `prefers-reduced-motion`.

---

## Project structure

```
db/schema.sql                  canonical PostgreSQL schema (generated)
public/brand/                  transparent logo + square mark
scripts/                       seed, db stats, schema export, logo pipeline
src/app/
  page.tsx                     neumorphic landing page
  form/[slug]/page.tsx         dynamic public form (published links)
  admin/login/                 sign-in
  admin/(dashboard)/           overview, clients, leads, forms, builder, responses, settings
  api/                         REST endpoints above
src/components/
  admin/                       shell, builder, filters, review panel, actions
  form/                        dynamic field renderer + form runtime
  site/                        header, footer
  ui/                          logo, copy button, neumorphic select
src/lib/                       types, validation, auth, db, repos, services
src/lib/leads.ts               lead channels, sources and statuses
src/lib/services/clients-service.ts   restaurant client records derived from submissions
src/lib/services/leads-service.ts     lead capture, pipeline reads and CSV export
src/middleware.ts              security headers, CSP, CORS + CSRF origin checks
src/instrumentation.ts         boot-time configuration validation
vercel.json                    Vercel project config (region, function limits, headers)
```

---

## Security model

| Layer | Control |
| --- | --- |
| Input | Every submitted value is sanitised (`src/lib/sanitize.ts`) **before** Zod validation: control characters stripped, lengths bounded, emails/phones normalised, URLs restricted to `http(s)` with no credentials, dotless hosts or `javascript:`/`data:` schemes. |
| Uploads / body size | JSON bodies capped at 64 KB for public submissions and 512 KB for admin writes; non-object payloads rejected. |
| Abuse | Honeypot field, minimum completion time, burst (5/min) + sustained (30/h) limits per IP and per form; enquiries 4 per 5 min and 20 per hour per IP. Admin write actions are limited to 60/min per user. |
| Auth | scrypt hashes, HMAC-SHA256 session tokens, HttpOnly + SameSite=Lax cookie, `Secure` in production, 7-day TTL, identical error for unknown email and wrong password. |
| Transport / browser | CSP, HSTS (production), `X-Frame-Options` equivalent via `frame-ancestors`, `nosniff`, strict referrer policy, restrictive `Permissions-Policy`; `poweredByHeader` disabled. |
| API surface | Mutating API calls require JSON content type and a same-origin (or explicitly allowed) `Origin`; unknown methods return 405; all API responses are `no-store`. |
| Data | Admin notes and CSV cells are sanitised, CSV values are formula-injection escaped, IP addresses are stored only as salted SHA-256 hashes. |
| Secrets | Database and auth secrets are server-only environment variables — never `NEXT_PUBLIC_*`. `assertSecureConfiguration()` refuses to run in production with a missing/placeholder `AUTH_SECRET` or a non-Postgres `DATABASE_URL`. |

---

## Deploy to Vercel

1. **Create the database** — Supabase project → *Database → Connection pooling* → copy the pooled
   URI. Run `db/schema.sql` in the Supabase SQL editor (or `psql "$DATABASE_URL" -f db/schema.sql`).
2. **Environment variables** (Project → Settings → Environment Variables, *Production* scope):

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `DATABASE_URL` | yes | Pooled Postgres URI with `?sslmode=require` |
   | `AUTH_SECRET` | yes | `openssl rand -base64 48` — 32+ characters |
   | `NEXT_PUBLIC_SITE_URL` | yes | e.g. `https://race.ceyteq.com` |
   | `ADMIN_EMAIL` | yes | Bootstrap administrator |
   | `ADMIN_PASSWORD` | first deploy | Strong password; remove after the first sign-in |
   | `UPSTASH_REDIS_REST_URL` / `_TOKEN` | recommended | Shared rate limiting across invocations |
   | `ALLOWED_ORIGINS` | optional | Extra origins allowed to POST to `/api/*` |

   Keep PGlite off in production — the app throws on boot if `DATABASE_URL` is not PostgreSQL.
3. **Provision** — run `npm run db:seed` once against production env vars (locally with the
   production `DATABASE_URL`, or from a one-off job) to create the admin and the onboarding form.
4. **Promote the domain** and add it to `NEXT_PUBLIC_SITE_URL`; the sitemap and OG tags follow it.
5. **Smoke test** — `/api/health` returns `status: "ok"`, `/form/restaurant-onboarding` renders,
   a test submission returns `201`, then delete it from `/admin/submissions`.

### Production checklist

- [ ] `AUTH_SECRET` set to 32+ random characters (not a placeholder).
- [ ] `DATABASE_URL` points at PostgreSQL with `sslmode=require`; `db/schema.sql` applied.
- [ ] `NEXT_PUBLIC_SITE_URL` set to the canonical HTTPS origin.
- [ ] `ADMIN_PASSWORD` rotated after the first sign-in (or removed from the env).
- [ ] Upstash Redis credentials set so rate limits are shared across instances.
- [ ] `npm run typecheck` and `npm run build` both clean.
- [ ] Database starts empty of demo data (`npm run db:stats` → `0 submissions`).
- [ ] `/api/health` green and `/robots.txt` disallows `/admin`.
