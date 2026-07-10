-- Phase 2: profiles, services, availability, bookings.
-- Run in the Supabase SQL editor, or via `supabase db push` once the CLI is linked.

create extension if not exists btree_gist;

-- ── profiles ────────────────────────────────────────────────────────────
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'patient' check (role in ('patient', 'admin')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── services ────────────────────────────────────────────────────────────
-- Full CMS editing arrives in Phase 3; for now this table exists so bookings
-- can reference a real row, seeded from lib/site.ts's static list below.
create table services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  mode text not null check (mode in ('clinic', 'home_visit', 'chat')),
  price_inr int not null,
  duration_min int not null,
  active boolean not null default true,
  sort int not null default 0
);

insert into services (slug, name, mode, price_inr, duration_min, sort) values
  ('back-neck-pain', 'Back & Neck Pain Treatment', 'clinic', 700, 45, 1),
  ('sports-injury', 'Sports Injury Rehabilitation', 'clinic', 800, 45, 2),
  ('post-surgical', 'Post-Surgical Rehabilitation', 'clinic', 800, 45, 3),
  ('home-visit', 'Home Visit Physiotherapy', 'home_visit', 1200, 60, 4);
  -- 'online-consultation' is intentionally excluded here — it becomes a
  -- 'chat' mode service in Phase 3 once payment gating exists; bookable
  -- services in Phase 2 are the clinic/home_visit ones only.

-- ── availability ────────────────────────────────────────────────────────
create table availability_rules (
  id uuid primary key default gen_random_uuid(),
  weekday int not null check (weekday between 0 and 6), -- 0 = Sunday
  start_time time not null,
  end_time time not null,
  check (end_time > start_time)
);

create table availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  closed boolean not null default true,
  note text
);

-- Seed: Mon–Sat 9–1 and 4–8, matching lib/site.ts's placeholder hours
insert into availability_rules (weekday, start_time, end_time)
select w, t.start_time, t.end_time
from generate_series(1, 6) as w
cross join (values ('09:00'::time, '13:00'::time), ('16:00'::time, '20:00'::time)) as t(start_time, end_time);

-- ── bookings ────────────────────────────────────────────────────────────
create table bookings (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles (id) on delete cascade,
  service_id uuid not null references services (id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  mode text not null check (mode in ('clinic', 'home_visit')),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  patient_note text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  -- The actual double-booking guarantee: two active bookings can never overlap.
  exclude using gist (
    tstzrange(starts_at, ends_at) with &&
  ) where (status in ('pending', 'confirmed'))
);

create index bookings_patient_id_idx on bookings (patient_id);
create index bookings_starts_at_idx on bookings (starts_at);

-- ── RLS ─────────────────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table services enable row level security;
alter table availability_rules enable row level security;
alter table availability_exceptions enable row level security;
alter table bookings enable row level security;

create function is_admin()
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- profiles: read/update own row; admin reads all
create policy "profiles_select_own" on profiles for select using (auth.uid() = id or is_admin());
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- services / availability: public read (needed to render the booking calendar
-- for signed-out visitors); writes admin-only (UI for this arrives Phase 3)
create policy "services_select_all" on services for select using (true);
create policy "services_admin_write" on services for all using (is_admin());
create policy "availability_rules_select_all" on availability_rules for select using (true);
create policy "availability_rules_admin_write" on availability_rules for all using (is_admin());
create policy "availability_exceptions_select_all" on availability_exceptions for select using (true);
create policy "availability_exceptions_admin_write" on availability_exceptions for all using (is_admin());

-- bookings: patients see/manage only their own; admin sees/manages all
create policy "bookings_select_own" on bookings for select using (auth.uid() = patient_id or is_admin());
create policy "bookings_insert_own" on bookings for insert with check (auth.uid() = patient_id);
create policy "bookings_update_own_or_admin" on bookings for update using (auth.uid() = patient_id or is_admin());
