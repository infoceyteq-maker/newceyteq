# Ceyteq Digital Race

A production-ready, full-stack onboarding platform for the **Ceyteq Digital Race** — built with
Next.js (App Router, TypeScript, Tailwind CSS), a dynamic form engine, PostgreSQL storage and a
3D **neumorphic (soft UI)** interface that mirrors the supplied design reference.

![Ceyteq](public/brand/ceyteq-logo.png)

---

## What is inside

| Area | Highlights |
| --- | --- |
| **Public site** | Neumorphic hero with the floating widget stack from the reference, platform overview, live form showcase, palette section, CTA. |
| **Dynamic forms** | Every form is stored as a schema in PostgreSQL (sections → fields) and rendered at its own public slug, e.g. `/form/restaurant-onboarding`. |
| **Admin dashboard** | Overview with 7-day submission chart, form list with publish/duplicate/delete, submission inbox with filters + CSV export, settings with live database info. |
| **Form builder** | Create / reorder / rename sections and fields, pick field types, edit options, required rules, layouts, success copy and slug — saved atomically. |
| **Restaurant onboarding** | The full five-section form from the brief: Restaurant Details, Owner Details, dynamic Social & Maps links, 10-colour theme picker (max 5), Special Notes. |
| **Security** | scrypt password hashing, HMAC-signed HttpOnly session cookie, server-side Zod validation generated from the form schema, honeypot + timing + per-IP throttling. |
| **Database** | One PostgreSQL dialect: embedded **PGlite** in development, **Supabase / managed PostgreSQL** in production. Zero code changes between the two. |

---

## Quick start

```bash
cp .env.example .env     # optional — sensible development defaults are built in
npm install
npm run db:seed          # creates the admin user, both templates and demo submissions
npm run dev              # http://localhost:3000
```

Open the dashboard at **/admin** and sign in with the credentials from `.env`:

```
email:    admin@ceyteq.com
password: Ceyteq@2026
```

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
| `npm run db:seed` | Idempotent seed: admin + templates + demo submissions |
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
src/lib/forms.ts          Prisma-free DTO mappers + Zod validation generated per field
src/lib/templates.ts      Restaurant onboarding & partner application templates
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

---

## Design system

* **Palette** — soft ash surface `#E9EDF3`, Ceyteq Blue `#0072CE`, Deep Navy `#082B49`.
* **Neumorphism** — raised/sunken surfaces are defined once in `src/app/globals.css`
  (`.neu`, `.neu-raised`, `.neu-sunken`, `.neu-input`, `.neu-btn`, `.neu-btn-primary`,
  `.neu-btn-dark`, `.neu-orb`, `.neu-check`, `.nav-link`) and reused everywhere, so shadows,
  specular highlights and pressed states stay consistent.
* **Logo** — `scripts/prepare-logo.mjs` removes the photographed white paper from the supplied
  artwork: it flood-fills the background from the edges, rebuilds a feathered alpha channel,
  un-premultiplies the white pigment (no white fringing) and un-premultiplies highlight pixels, then
  exports `public/brand/ceyteq-logo.png`, `@2x`, a square mark for the favicon and a small header
  variant. Run `npm run logo` to regenerate.
* **Type** — Sora (display) + Manrope (UI), self-hosted via `@fontsource-variable` (no external
  font CDN).
* **Motion** — floating cards, blinking assistant eyes, pulse rings and fade-ups, all disabled
  under `prefers-reduced-motion`.

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
  admin/(dashboard)/           overview, forms, builder, submissions, settings
  api/                         REST endpoints above
src/components/
  admin/                       shell, builder, filters, review panel, actions
  form/                        dynamic field renderer + form runtime
  site/                        header, footer, hero widgets
  ui/                          logo, copy button, neumorphic select
src/lib/                       types, validation, auth, db, repos, services
```

---

## Production checklist

- [ ] Set `AUTH_SECRET` to a long random string.
- [ ] Change `ADMIN_PASSWORD` before the first `db:seed`, or rotate it afterwards.
- [ ] Point `DATABASE_URL` at Supabase and apply `db/schema.sql`.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the canonical origin (used for shareable links, OG tags).
- [ ] `npm run build && npm start` (deploys cleanly to Vercel; the PGlite folder is not used in
      production because `DATABASE_URL` is remote).
- [ ] Swap the in-memory rate limiter in `src/lib/services/submissions-service.ts` for Upstash
      Redis if you run multiple instances.
