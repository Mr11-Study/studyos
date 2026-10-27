-- StudyOS · Update 8: Kalender mit dem Konto synchronisieren
-- Einmal im Supabase SQL Editor ausführen (Run). Danach haben angemeldete Konten
-- ihre eigenen Termine und den Stundenplan auf jedem Gerät.
-- Jede Zeile gehört genau einem Konto. Row Level Security: nur das eigene Konto kann sie lesen und schreiben.

create table if not exists public.calendars (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint calendars_size check (pg_column_size(data) < 2000000)
);
alter table public.calendars enable row level security;

drop policy if exists "cal_select_own" on public.calendars;
drop policy if exists "cal_insert_own" on public.calendars;
drop policy if exists "cal_update_own" on public.calendars;
drop policy if exists "cal_delete_own" on public.calendars;
create policy "cal_select_own" on public.calendars for select to authenticated using (user_id = auth.uid());
create policy "cal_insert_own" on public.calendars for insert to authenticated with check (user_id = auth.uid());
create policy "cal_update_own" on public.calendars for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "cal_delete_own" on public.calendars for delete to authenticated using (user_id = auth.uid());
revoke all on public.calendars from anon;
grant select, insert, update, delete on public.calendars to authenticated;

-- Zeitstempel setzt immer der Server
create or replace function public.calendars_touch() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists calendars_touch on public.calendars;
create trigger calendars_touch before insert or update on public.calendars for each row execute function public.calendars_touch();

-- Änderungen live an die anderen Geräte melden
do $$ begin
  alter publication supabase_realtime add table public.calendars;
exception when duplicate_object then null; end $$;
