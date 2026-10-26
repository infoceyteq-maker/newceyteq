# Ceyteq Digital Race

A production-ready, full-stack onboarding platform for the **Ceyteq Digital Race** — built with
Next.js (App Router, TypeScript, Tailwind CSS), a dynamic form engine, PostgreSQL storage and a
3D **neumorphic (soft UI)** interface — a light ash canvas with paired `#FFFFFF`/`#C5C5CA` shadows and
radium-blue accents. No reference screenshots or placeholder images ship in the UI.

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
| `POST` | `/api/admin/leads` | admin | Add a lead from the control centre |
| `PATCH/DELETE` | `/api/admin/leads/:id` | admin | Update lead status / delete |
| `GET` | `/api/admin/leads/export` | admin | Leads CSV download |
| `GET` | `/api/health` | public | Liveness/readiness probe (driver, row counts, no secrets) |

---

## Design system

* **Palette** — a **matte ash** neumorphic canvas (`#CBD5E1`, the "deep ash" reference) across the
  whole app: public site, login, public forms, admin shell and every modal/drawer. Blue is reserved for
  buttons, highlights and the dark panels — never for a page background. Every value is defined once
  as a CSS variable in `src/app/globals.css` and mirrored as a Tailwind token in
  `tailwind.config.ts`, so the whole system can be re-tuned from those two blocks:

  | Token | Value | Role |
  | --- | --- | --- |
  | `--bg` | `#CBD5E1` | page base (subtle gradient to `#D1D5DB`) |
  | `--surface` | `#D5DCE5` | cards, navbar, badges, inputs, secondary buttons |
  | `--shadow-light` | `#FFFFFF` | top-left highlight |
  | `--shadow-dark` | `#C5C5CA` | bottom-right drop (paired with a faint navy contact shadow) |
  | `--navy` | `#0F1B3D` | dark panels, headings (`#1E2A52` for sub-headings) |
  | `--blue-dark` | `#1E3FA8` | primary button gradient start |
  | `--blue` | `#2F6BFF` | royal blue, primary gradient end, highlight text |
  | `--radium` | `#3DA5FF` | glow blue / gradient highlight end |
  | `--radium-light` | `#6CC4FF` | light accent |
  | `--text-body` | `#39465F` | body copy (6.3:1 on the surface) |

* **True soft-3D neumorphism** — no hard borders anywhere; depth comes only from paired shadows with a
  single top-left light source. Radii are 24–32px, pills fully rounded.

  | Layer | Value |
  | --- | --- |
  | Raised (cards, navbar, pills) | `12px 12px 28px #C5C5CA, -12px -12px 28px #FFFFFF` |
  | Pressed / inset (badges, inputs, active tabs) | `inset 6px 6px 12px #C5C5CA, inset -6px -6px 12px #FFFFFF` |
  | Sunken well (stats, tables) | `inset 8px 8px 18px #C5C5CA, inset -8px -8px 18px #FFFFFF` |
  | Card light sweep | `linear-gradient(145deg, #EFEFF1, #E8E8EA, #E2E2E5)` |
  | Primary CTA glow | `0 8px 24px rgba(47,107,255,0.35)` |
  | Radium halo (dark panels, dots) | `0 0 18px rgba(61,165,255,0.35)` |

  Hover lifts surfaces by `translateY(-3px)` with a stronger shadow, active states collapse into the
  inset recipe, and all transitions run 250ms. Cards nest inside cards (`.neu-inset-card`) and metrics
  sit in sunken wells (`.neu-well`). Primitives live in `src/app/globals.css`
  (`.neu`, `.neu-raised`, `.neu-3d`, `.neu-sunken`, `.neu-well`, `.neu-inset-card`, `.neu-input`,
  `.neu-btn*`, `.neu-orb`, `.neu-check`, `.neu-chip`, `.nav-link`) and are reused by every page.
* **Ash everywhere** — `html`, `body` and every layout wrapper are `min-h-screen` with
  `background-color: #E4E4E6`, so dialogs, drawers and short pages never show a white or blue gap.

* **Blue accents** — primary buttons use the `#1E3FA8 → #2F6BFF` gradient with white text and the soft
  glow above; the hero headline highlight ("every restaurant") uses the `#2F6BFF → #3DA5FF` gradient.
  Secondary CTAs are raised ash pills with navy text.
* **Dark 3D elements** — feature cards, stats and badges on the navy panels use `.neu-dark`
  (`#14121F → #0F1B3D` with a glowing `#3DA5FF` rim and inner glow) and `.neu-dark-inset` for sunken
  widgets inside those panels, giving the sci-fi dashboard feel.
* **Neon accents** — `.neu-btn-neon` is the primary form submit; `.neon-dot` marks live indicators;
  focused inputs glow radium blue; the active admin partition gets a radium edge bar.
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

## Control centre (Super Master Admin)

After login the operator lands in an organised control centre built for adding the company's other
systems one at a time.

* **Single source of truth** — every destination lives in `src/lib/admin-modules.ts`:
  `{ key, label, icon, href, status: "live" | "soon", children[] }`. The grouped sidebar, the mobile
  drawer/bottom bar, the dashboard module tiles and the "More systems" slot list all render from it.
  Adding a system = one registry entry + one folder under `src/app/admin/(dashboard)/`.
* **Navigation** — Overview · Leads & Forms (live: Restaurant Clients, Leads & Inquiries, Form
  Generator, Responses) · Web Studio (coming soon) · Websites (coming soon) · More Systems · Settings.
  Active items show the pressed/inset shadow with a glowing radium edge bar. The signed-in account is
  always presented as **Super Master Admin** with a sign-out button in the sidebar footer. The sidebar
  collapses to an icon rail on desktop (state persisted in `localStorage`); mobile gets a drawer plus a
  floating bottom bar.
* **Leads & Forms hub** (`/admin/leads-forms`) — raised cards for total forms, new leads, today's
  submissions and conversion (won ÷ leads), plus quick actions: create form, copy the public form link
  and add a lead. The leads page adds a status pipeline board, per-channel source glyphs, search,
  filters and CSV export.
* **API** — `POST /api/admin/leads` creates a lead from the console (admin-only, sanitised with the same
  schema as the public endpoint, rate limited by the shared admin-write budget).

## Realtime (Supabase)

* **Storage & fetching** — all reads and writes go through the server using `DATABASE_URL` (the
  Supabase pooled connection). No service key ever reaches the browser.
* **Live refresh** — `ceyteq_signals` is a PII-free change feed (`entity`, `action`, `created_at`)
  written by Postgres triggers on `forms`, `submissions` and `leads`. The dashboard subscribes to its
  INSERTs with `@supabase/supabase-js` (`src/components/admin/LiveSignal.tsx`) and simply re-renders
  the server components — the signal carries no client, lead or submission content.
* **Setup** — run `supabase/realtime.sql` once in the Supabase SQL editor. It enables RLS on every
  table (no policies = no anon access), grants `anon` read-only access to the signal table only and
  adds it to the `supabase_realtime` publication. Set `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` to activate it.
* **Graceful fallback** — without those variables the sidebar shows *Manual refresh* and the same
  button refreshes the page on demand; nothing else changes.

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
| Auth | **Single administrator**: the password in the server-only `ADMIN_PASSWORD` variable is compared in constant time (SHA-256 + `timingSafeEqual`) and never leaves the server. A hashed database account works as a fallback (scrypt). HMAC-SHA256 session tokens, HttpOnly + SameSite=Lax cookie, `Secure` in production, 7-day TTL, identical error for every failed attempt, 5-per-5-minutes + 20-per-hour login rate limits. Removing `ADMIN_PASSWORD` instantly invalidates master sessions. |
| Transport / browser | CSP, HSTS (production), `X-Frame-Options` equivalent via `frame-ancestors`, `nosniff`, strict referrer policy, restrictive `Permissions-Policy`; `poweredByHeader` disabled. |
| API surface | Mutating API calls require JSON content type and a same-origin (or explicitly allowed) `Origin`; unknown methods return 405; all API responses are `no-store`. |
| Data | Admin notes and CSV cells are sanitised, CSV values are formula-injection escaped, IP addresses are stored only as salted SHA-256 hashes. |
| Secrets | Database and auth secrets are server-only environment variables — never `NEXT_PUBLIC_*`. `assertSecureConfiguration()` refuses to run in production with a missing/placeholder `AUTH_SECRET` or a non-Postgres `DATABASE_URL`. |

---

## Deploy to Vercel

1. **Create the database** — Supabase project → *Database → Connection pooling* → copy the pooled
   URI. Run `db/schema.sql` in the Supabase SQL editor (or `psql "$DATABASE_URL" -f db/schema.sql`),
   then `supabase/realtime.sql` to lock down RLS and enable the live signal feed.
2. **Environment variables** (Project → Settings → Environment Variables, *Production* scope):

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `DATABASE_URL` | yes | Pooled Postgres URI with `?sslmode=require` |
   | `AUTH_SECRET` | yes | `openssl rand -base64 48` — 32+ characters |
   | `NEXT_PUBLIC_SITE_URL` | yes | e.g. `https://race.ceyteq.com` |
   | `ADMIN_PASSWORD` | yes | **The single admin password** used on `/admin/login` — server-only secret |
   | `ADMIN_EMAIL` / `ADMIN_NAME` | optional | Display identity for the master login and the seeded account |
   | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | optional | Enables live dashboard refresh (see *Realtime* below) |
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
- [ ] `ADMIN_PASSWORD` set to a long random value (`openssl rand -base64 32`) and rotated periodically.
- [ ] Upstash Redis credentials set so rate limits are shared across instances.
- [ ] `npm run typecheck` and `npm run build` both clean.
- [ ] Database starts empty of demo data (`npm run db:stats` → `0 submissions`).
- [ ] `/api/health` green and `/robots.txt` disallows `/admin`.
