-- Phase 3: paid online consultations — consultations, messages, payments,
-- chat services, storage bucket for attachments.
-- Run in the Supabase SQL Editor like the previous migrations.

-- ── chat services ───────────────────────────────────────────────────────
insert into services (slug, name, mode, price_inr, duration_min, sort) values
  ('online-consultation', 'Online Chat Consultation', 'chat', 499, 0, 5),
  ('follow-up-consultation', 'Follow-up Consultation', 'chat', 299, 0, 6)
on conflict (slug) do nothing;

-- ── consultations ───────────────────────────────────────────────────────
create table consultations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles (id) on delete cascade,
  service_id uuid not null references services (id),
  status text not null default 'awaiting_payment'
    check (status in ('awaiting_payment', 'active', 'answered', 'closed', 'refunded')),
  -- intake: { problem, pain_area, duration, history }
  intake jsonb not null default '{}'::jsonb,
  consent_at timestamptz not null default now(),
  opened_at timestamptz,          -- set when payment confirms
  expires_at timestamptz,         -- opened_at + 7 days
  closed_at timestamptz,
  rating int check (rating between 1 and 5),
  rating_comment text,
  created_at timestamptz not null default now()
);

create index consultations_patient_id_idx on consultations (patient_id);
create index consultations_status_idx on consultations (status);

-- ── messages ────────────────────────────────────────────────────────────
create table messages (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references consultations (id) on delete cascade,
  sender_id uuid not null references profiles (id),
  body text not null default '',
  -- [{ path, name, type, size }]
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index messages_consultation_id_idx on messages (consultation_id, created_at);

-- ── payments ────────────────────────────────────────────────────────────
create table payments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles (id),
  consultation_id uuid references consultations (id) on delete set null,
  booking_id uuid references bookings (id) on delete set null,
  provider text not null check (provider in ('razorpay', 'manual')),
  provider_order_id text unique,
  provider_payment_id text,
  amount_inr int not null,
  status text not null default 'created'
    check (status in ('created', 'paid', 'failed', 'refunded')),
  raw jsonb,
  created_at timestamptz not null default now()
);

create index payments_consultation_id_idx on payments (consultation_id);

-- ── RLS ─────────────────────────────────────────────────────────────────
alter table consultations enable row level security;
alter table messages enable row level security;
alter table payments enable row level security;

create policy "consultations_select_own" on consultations
  for select using (auth.uid() = patient_id or is_admin());
-- Patients can only ever create an UNPAID consultation — a crafted API call
-- must not be able to skip payment by inserting status='active'.
create policy "consultations_insert_own" on consultations
  for insert with check (
    auth.uid() = patient_id
    and status = 'awaiting_payment'
    and opened_at is null and expires_at is null and closed_at is null
  );
-- Status/lifecycle changes go through server actions (admin) or the
-- service-role client (payment confirmation); patients get no update policy.
create policy "consultations_admin_update" on consultations
  for update using (is_admin());

create policy "messages_select_participant" on messages
  for select using (
    is_admin() or exists (
      select 1 from consultations c
      where c.id = consultation_id and c.patient_id = auth.uid()
    )
  );
-- Patients can only post into their own OPEN (paid) consultation; the same
-- rule is checked in the server action, but the database is the real gate.
create policy "messages_insert_participant" on messages
  for insert with check (
    sender_id = auth.uid() and (
      is_admin() or exists (
        select 1 from consultations c
        where c.id = consultation_id
          and c.patient_id = auth.uid()
          and c.status in ('active', 'answered')
      )
    )
  );

create policy "payments_select_own" on payments
  for select using (auth.uid() = patient_id or is_admin());
create policy "payments_insert_own" on payments
  for insert with check (auth.uid() = patient_id);
create policy "payments_admin_update" on payments
  for update using (is_admin());

-- ── storage: private bucket for consultation attachments ───────────────
insert into storage.buckets (id, name, public)
values ('consultation-files', 'consultation-files', false)
on conflict (id) do nothing;

-- Object paths are "<consultation_id>/<filename>"; access follows the
-- consultation: its patient or the admin.
create policy "consultation_files_read" on storage.objects
  for select using (
    bucket_id = 'consultation-files' and (
      is_admin() or exists (
        select 1 from consultations c
        where c.id::text = (storage.foldername(name))[1]
          and c.patient_id = auth.uid()
      )
    )
  );

create policy "consultation_files_insert" on storage.objects
  for insert with check (
    bucket_id = 'consultation-files' and (
      is_admin() or exists (
        select 1 from consultations c
        where c.id::text = (storage.foldername(name))[1]
          and c.patient_id = auth.uid()
          and c.status in ('active', 'answered')
      )
    )
  );
