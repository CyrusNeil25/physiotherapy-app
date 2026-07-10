-- Phase 2 follow-up: capture full_name from signup metadata into profiles.
-- Run this in the SQL Editor the same way you ran 0001_init.sql.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;
