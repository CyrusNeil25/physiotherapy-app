-- Phase 4: live chat (Supabase Realtime), read receipts.
-- Run in the SQL Editor like the previous migrations.

-- Read tracking: set when the OTHER party views the message (1:1 thread)
alter table messages add column read_at timestamptz;

-- Realtime change feeds. RLS still applies: subscribers only receive rows
-- their JWT can SELECT. Full replica identity is required so row-level
-- checks can evaluate UPDATE events.
alter table messages replica identity full;
alter table consultations replica identity full;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table consultations;
