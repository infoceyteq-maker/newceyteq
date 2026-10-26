/**
 * Ceyteq Digital Race — PostgreSQL schema.
 *
 * The exact same DDL runs against the embedded PGlite database in development
 * and against Supabase / any managed PostgreSQL in production, so there is one
 * source of truth for the data model.
 *
 * It is applied automatically on first connection (`ensureSchema`) and is also
 * valid to paste straight into the Supabase SQL editor or run with psql.
 */
export const SCHEMA_SQL = /* sql */ `
create table if not exists admin_users (
  id            text primary key,
  email         text not null unique,
  name          text not null,
  password_hash text not null,
  role          text not null default 'admin',
  last_login_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists forms (
  id              text primary key,
  slug            text not null unique,
  title           text not null,
  description     text not null default '',
  success_title   text not null default 'Submission received',
  success_message text not null default 'Thank you. Our team will review your details and get back to you shortly.',
  submit_label    text not null default 'Submit',
  status          text not null default 'draft',
  accent          text not null default '#2F6BFF',
  created_by_id   text references admin_users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists forms_status_idx on forms (status);
create index if not exists forms_updated_idx on forms (updated_at desc);

create table if not exists form_sections (
  id          text primary key,
  form_id     text not null references forms(id) on delete cascade,
  title       text not null,
  description text not null default '',
  icon        text not null default 'spark',
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists form_sections_form_idx on form_sections (form_id, position);

create table if not exists form_fields (
  id          text primary key,
  section_id  text not null references form_sections(id) on delete cascade,
  key         text not null,
  label       text not null,
  type        text not null,
  placeholder text not null default '',
  help_text   text not null default '',
  required    boolean not null default false,
  position    integer not null default 0,
  options     text not null default '[]',
  config      text not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (section_id, key)
);
create index if not exists form_fields_section_idx on form_fields (section_id, position);

create table if not exists submissions (
  id             text primary key,
  form_id        text not null references forms(id) on delete cascade,
  reference      text not null unique,
  data           text not null default '{}',
  status         text not null default 'new',
  notes          text not null default '',
  ip_hash        text,
  user_agent     text,
  reviewed_by_id text references admin_users(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists submissions_form_idx on submissions (form_id, created_at desc);
create index if not exists submissions_status_idx on submissions (status);

/* Social media / email enquiries captured outside the onboarding forms. */
create table if not exists leads (
  id         text primary key,
  name       text not null default '',
  email      text not null default '',
  phone      text not null default '',
  company    text not null default '',
  channel    text not null default 'website',
  source     text not null default 'website',
  message    text not null default '',
  status     text not null default 'new',
  notes      text not null default '',
  ip_hash    text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists leads_status_idx on leads (status);
create index if not exists leads_channel_idx on leads (channel);
create index if not exists leads_created_idx on leads (created_at desc);

/* ------------------------------------------------------------------------- */
/*  Realtime change signals                                                  */
/*                                                                            */
/*  A PII-free feed the browser may subscribe to. The dashboard only uses it  */
/*  as a "something changed, refresh now" ping — never as a data source, so   */
/*  no lead, client or submission content ever leaves the server.             */
/* ------------------------------------------------------------------------- */
create table if not exists ceyteq_signals (
  id         bigserial primary key,
  entity     text not null,
  action     text not null default 'change',
  created_at timestamptz not null default now()
);
create index if not exists ceyteq_signals_created_idx on ceyteq_signals (created_at desc);

create or replace function ceyteq_emit_signal() returns trigger language plpgsql as $$
begin
  insert into ceyteq_signals (entity, action) values (tg_table_name, lower(tg_op));
  return null;
end;
$$;

drop trigger if exists ceyteq_signal_forms on forms;
create trigger ceyteq_signal_forms
  after insert or update or delete on forms
  for each row execute function ceyteq_emit_signal();

drop trigger if exists ceyteq_signal_submissions on submissions;
create trigger ceyteq_signal_submissions
  after insert or update or delete on submissions
  for each row execute function ceyteq_emit_signal();

drop trigger if exists ceyteq_signal_leads on leads;
create trigger ceyteq_signal_leads
  after insert or update or delete on leads
  for each row execute function ceyteq_emit_signal();
`;
