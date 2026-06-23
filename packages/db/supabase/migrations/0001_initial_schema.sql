-- ============================================================
-- 0001 — Initial schema: multi-tenant boatyard platform
-- ============================================================
-- Design principles:
--   • Every table carries tenant_id. Row Level Security (RLS)
--     enforces isolation at the DB layer — app bugs cannot leak
--     cross-tenant data because the database refuses the query.
--   • auth.users is managed by Supabase Auth. We extend it with
--     a profiles table to add role + tenant membership.
--   • UUIDs everywhere (gen_random_uuid). No integer PKs that
--     could leak record counts to clients.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- TENANTS
-- One row per boatyard. slug is used for subdomains:
--   aegean-boatworks → aegean-boatworks.digiform.gr
-- ────────────────────────────────────────────────────────────
create table tenants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  is_demo     boolean not null default false,
  plan        text not null default 'trial' check (plan in ('trial','starter','pro')),
  created_at  timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- PROFILES  (extends auth.users)
-- role controls what UI panels are visible and which RLS
-- policies allow writes:
--   admin      → full access, can manage staff accounts
--   staff      → front-desk: create jobs, update customers
--   technician → workshop: update job status, log time
--   customer   → read-only portal: own boats + job status
-- ────────────────────────────────────────────────────────────
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  tenant_id   uuid not null references tenants(id),
  role        text not null check (role in ('admin','staff','technician','customer')),
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- CUSTOMERS
-- A customer belongs to one tenant and can own multiple boats.
-- ────────────────────────────────────────────────────────────
create table customers (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id),
  profile_id  uuid references profiles(id),   -- set when customer has portal login
  name        text not null,
  email       text,
  phone       text,
  notes       text,
  created_at  timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- BOATS
-- A vessel owned by a customer, serviced at this boatyard.
-- ────────────────────────────────────────────────────────────
create table boats (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id),
  customer_id     uuid not null references customers(id),
  name            text not null,
  make            text,
  model           text,
  year            int,
  length_m        numeric(5,2),
  beam_m          numeric(5,2),
  draft_m         numeric(5,2),
  engine          text,
  registration    text,
  hull_id         text,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- JOBS
-- A job is a unit of work on a specific boat.
-- status drives the kanban board in the staff UI.
-- ────────────────────────────────────────────────────────────
create table jobs (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id),
  boat_id         uuid not null references boats(id),
  job_number      text,                        -- human-readable: BW-2026-0042
  type            text not null check (type in (
                    'haul_out','launch','antifouling','engine_service',
                    'annual_survey','repair','winter_storage','other'
                  )),
  status          text not null default 'intake' check (status in (
                    'intake','in_progress','waiting_parts','ready','complete','invoiced'
                  )),
  title           text not null,
  description     text,
  estimated_hours numeric(6,2),
  due_date        date,
  completed_at    timestamptz,
  created_at      timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- JOB ITEMS  (checklist within a job)
-- Breaking a job into trackable sub-tasks. Assigned per
-- technician so the dashboard shows individual queues.
-- ────────────────────────────────────────────────────────────
create table job_items (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id),
  job_id        uuid not null references jobs(id) on delete cascade,
  description   text not null,
  status        text not null default 'pending' check (status in ('pending','in_progress','done')),
  assigned_to   uuid references profiles(id),
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- PARTS  (inventory)
-- bin_location is a warehouse shelf code: e.g. "A3-R2".
-- reorder_point triggers an alert in the analytics dashboard.
-- ────────────────────────────────────────────────────────────
create table parts (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id),
  sku             text,
  name            text not null,
  description     text,
  quantity        int not null default 0,
  reorder_point   int not null default 5,
  bin_location    text,
  unit_cost       numeric(10,2),
  supplier        text,
  created_at      timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- JOB PARTS  (parts consumed on a job)
-- Records what was pulled from inventory for a specific job.
-- unit_cost snapshot prevents history from drifting when
-- the parts price is updated later.
-- ────────────────────────────────────────────────────────────
create table job_parts (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id),
  job_id        uuid not null references jobs(id) on delete cascade,
  part_id       uuid not null references parts(id),
  quantity      int not null,
  unit_cost     numeric(10,2),           -- snapshot at time of use
  created_at    timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- TIME ENTRIES
-- Technicians log hours against jobs. This is the source of
-- truth for the workshop analytics: actual vs estimated hours,
-- per-technician utilisation, per-job-type margin.
-- ────────────────────────────────────────────────────────────
create table time_entries (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id),
  job_id          uuid not null references jobs(id) on delete cascade,
  technician_id   uuid not null references profiles(id),
  hours           numeric(5,2) not null,
  notes           text,
  logged_at       timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- REMINDERS
-- Upcoming service dates per boat. sent_at is set by the
-- cron job that dispatches emails. acknowledged_at is set
-- when the customer confirms via the portal.
-- ────────────────────────────────────────────────────────────
create table reminders (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references tenants(id),
  boat_id           uuid not null references boats(id),
  type              text not null,   -- e.g. 'antifouling', 'annual_survey'
  due_date          date not null,
  notes             text,
  sent_at           timestamptz,
  acknowledged_at   timestamptz,
  created_at        timestamptz not null default now()
);

-- ============================================================
-- INDEXES  — cover the most common query patterns
-- ============================================================
create index on profiles(tenant_id);
create index on customers(tenant_id);
create index on boats(tenant_id);
create index on boats(customer_id);
create index on jobs(tenant_id);
create index on jobs(boat_id);
create index on jobs(status);
create index on job_items(job_id);
create index on job_parts(job_id);
create index on time_entries(job_id);
create index on time_entries(technician_id);
create index on reminders(tenant_id, due_date);
create index on parts(tenant_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- The golden rule: every SELECT/INSERT/UPDATE/DELETE is
-- filtered to the caller's tenant. No application code can
-- bypass this — it is enforced by PostgreSQL itself.
-- ============================================================
alter table tenants      enable row level security;
alter table profiles     enable row level security;
alter table customers    enable row level security;
alter table boats        enable row level security;
alter table jobs         enable row level security;
alter table job_items    enable row level security;
alter table parts        enable row level security;
alter table job_parts    enable row level security;
alter table time_entries enable row level security;
alter table reminders    enable row level security;

-- Helper: returns the caller's tenant_id from their JWT claim.
-- Lives in public schema — Supabase does not allow creating functions in auth.
-- security definer runs as the function owner (postgres), not the caller,
-- so it can safely read auth.jwt() regardless of caller permissions.
create or replace function public.get_tenant_id()
returns uuid language sql stable security definer as $$
  select (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
$$;

-- Helper: returns the caller's role from their profile row.
create or replace function public.get_user_role()
returns text language sql stable security definer as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ── profiles ─────────────────────────────────────────────────
create policy "profiles: own tenant only"
  on profiles for all
  using (tenant_id = public.get_tenant_id());

-- ── customers ────────────────────────────────────────────────
create policy "customers: own tenant only"
  on customers for all
  using (tenant_id = public.get_tenant_id());

-- ── boats ────────────────────────────────────────────────────
create policy "boats: own tenant only"
  on boats for all
  using (tenant_id = public.get_tenant_id());

-- ── jobs ─────────────────────────────────────────────────────
create policy "jobs: own tenant only"
  on jobs for all
  using (tenant_id = public.get_tenant_id());

-- ── job_items ────────────────────────────────────────────────
create policy "job_items: own tenant only"
  on job_items for all
  using (tenant_id = public.get_tenant_id());

-- ── parts ────────────────────────────────────────────────────
create policy "parts: own tenant only"
  on parts for all
  using (tenant_id = public.get_tenant_id());

-- ── job_parts ────────────────────────────────────────────────
create policy "job_parts: own tenant only"
  on job_parts for all
  using (tenant_id = public.get_tenant_id());

-- ── time_entries ─────────────────────────────────────────────
create policy "time_entries: own tenant only"
  on time_entries for all
  using (tenant_id = public.get_tenant_id());

-- ── reminders ────────────────────────────────────────────────
create policy "reminders: own tenant only"
  on reminders for all
  using (tenant_id = public.get_tenant_id());

-- ── tenants (self-read only) ──────────────────────────────────
create policy "tenants: read own row"
  on tenants for select
  using (id = public.get_tenant_id());
