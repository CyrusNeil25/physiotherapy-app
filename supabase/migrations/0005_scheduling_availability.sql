-- Phase 4 follow-up: chat scheduling + doctor availability toggle + UPI payment.
-- Run in the SQL Editor like the previous migrations.

-- ── Doctor's live-chat availability (singleton row) ────────────────────
-- A dedicated table rather than a profiles column: patients need to read
-- this without RLS exposing the doctor's phone/name via a broadened
-- profiles policy.
create table clinic_settings (
  id boolean primary key default true,
  chat_available boolean not null default true,
  check (id) -- boolean PK that must be TRUE enforces exactly one row
);
insert into clinic_settings (id, chat_available) values (true, true);

alter table clinic_settings enable row level security;
create policy "clinic_settings_select_all" on clinic_settings for select using (true);
create policy "clinic_settings_admin_write" on clinic_settings for update using (is_admin());

-- ── Optional scheduled time for a chat consultation ─────────────────────
-- NULL means async (doctor replies within the usual promise window);
-- set means the patient picked a specific time to chat live.
alter table consultations add column scheduled_at timestamptz;
