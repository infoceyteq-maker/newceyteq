-- ---------------------------------------------------------------------------
-- Ceyteq Digital Race — Supabase security + realtime setup
--
-- Run this ONCE in the Supabase SQL editor (Database → SQL editor) after the
-- tables have been created by the app (first request or `npm run db:seed`
-- against the Supabase connection string).
--
-- Why it is needed:
--   1. Every table is locked down with RLS. No policies = no anon access. The
--      Next.js server talks to Postgres with DATABASE_URL (the service role),
--      which bypasses RLS, so nothing changes for the app.
--   2. `ceyteq_signals` is the ONLY table readable with the public anon key.
--      It holds no personal data — just {entity, action, created_at} — and is
--      used by the dashboard as a "something changed, refresh" ping.
--   3. That table is added to the `supabase_realtime` publication so the
--      browser can subscribe to INSERT events.
-- ---------------------------------------------------------------------------

/* --------------------------------- 1. RLS -------------------------------- */

alter table if exists public.admin_users   enable row level security;
alter table if exists public.forms          enable row level security;
alter table if exists public.form_sections  enable row level security;
alter table if exists public.form_fields    enable row level security;
alter table if exists public.submissions    enable row level security;
alter table if exists public.leads          enable row level security;
alter table if exists public.ceyteq_signals enable row level security;

-- No policies are created for the business tables on purpose: anon and
-- authenticated roles get no access through PostgREST. Server-side access
-- (DATABASE_URL) is unaffected because it connects as the table owner.

/* ---------------------------- 2. signal feed ----------------------------- */

drop policy if exists "ceyteq signals are public" on public.ceyteq_signals;
create policy "ceyteq signals are public"
  on public.ceyteq_signals
  for select
  to anon, authenticated
  using (true);

revoke all on table public.ceyteq_signals from anon, authenticated;
grant select (id, entity, action, created_at) on table public.ceyteq_signals to anon, authenticated;
grant usage, select on sequence public.ceyteq_signals_id_seq to anon, authenticated;

/* ------------------------- 3. realtime publication ----------------------- */

do $$
begin
  alter publication supabase_realtime add table public.ceyteq_signals;
exception
  when duplicate_object then null;
  when undefined_object then
    raise notice 'Publication supabase_realtime not found — enable Realtime for this project first.';
end $$;

/* Optional housekeeping: keep the signal table small. */
create or replace function public.ceyteq_trim_signals() returns void language sql as $$
  delete from public.ceyteq_signals where created_at < now() - interval '7 days';
$$;

-- Schedule the trim if pg_cron is available (safe to skip).
do $$
begin
  perform cron.schedule('ceyteq-trim-signals', '0 3 * * *', 'select public.ceyteq_trim_signals()');
exception
  when others then null;
end $$;
