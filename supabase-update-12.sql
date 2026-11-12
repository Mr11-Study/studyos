-- StudyOS · Update 12: Testmodus für Admins (FH-Freischaltung selbst ausprobieren)
-- Einmal im Supabase SQL Editor ausführen (alles einfügen -> Run), NACH supabase-update-11.sql.
-- Kann gefahrlos mehrmals ausgeführt werden.
--
-- Admins dürfen sonst immer in Fach-Lerngruppen. Im Testmodus zählt das Admin-Recht dafür nicht:
-- Der Admin ist wie ein normaler User und muss FH-Adresse, E-Mail-Code und Studiengangs-Code
-- selbst durchgehen. Alle anderen Admin-Werkzeuge bleiben. Betrifft nur den Admin, der ihn einschaltet.

create table if not exists public.fh_admin_test (
  user_id uuid primary key references auth.users(id) on delete cascade,
  at timestamptz not null default now()
);
alter table public.fh_admin_test enable row level security;
drop policy if exists "fh test eigener" on public.fh_admin_test;
create policy "fh test eigener" on public.fh_admin_test for select to authenticated using (user_id = auth.uid());
revoke all on public.fh_admin_test from anon, authenticated;
grant select on public.fh_admin_test to authenticated;

create or replace function public.fh_ok() returns boolean
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if exists (select 1 from public.admins where user_id = auth.uid())
     and not exists (select 1 from public.fh_admin_test where user_id = auth.uid()) then return true; end if;
  return exists (select 1 from public.fh_verified v join auth.users u on u.id = v.user_id
                  where v.user_id = auth.uid() and lower(u.email) = v.email
                    and (v.kind = 'staff' or v.wi));
end $$;

-- Einschalten: eigene Bestätigung löschen, damit der Ablauf von vorne beginnt. Ausschalten: wieder Admin-Zugang.
create or replace function public.admin_fh_test(on_ boolean) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'nur für Admins'; end if;
  if on_ then
    insert into public.fh_admin_test (user_id) values (auth.uid()) on conflict (user_id) do update set at = now();
    delete from public.fh_verified where user_id = auth.uid();
  else
    delete from public.fh_admin_test where user_id = auth.uid();
  end if;
  return on_;
end $$;
revoke execute on function public.admin_fh_test(boolean) from anon;
grant execute on function public.admin_fh_test(boolean) to authenticated;
