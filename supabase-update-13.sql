-- StudyOS · Update 13: kein Studiengangs-Code mehr
-- Einmal im Supabase SQL Editor ausführen (alles einfügen -> Run), NACH supabase-update-12.sql.
-- Kann gefahrlos mehrmals ausgeführt werden.
--
-- Was gilt danach:
--   * Wer seine Adresse @edu.fh-joanneum.at oder @fh-joanneum.at mit dem Code aus der E-Mail bestätigt,
--     hat sofort Zugang zu Fächern und Lerngruppen. Ein Studiengangs-Code ist nicht mehr nötig.
--   * Das gilt damit für alle Studierenden und Lehrenden der FH JOANNEUM, nicht nur Wirtschaftsinformatik.
--   * Der Admin kann einzelnen Personen den Zugang entziehen und zurückgeben (Admin -> Werkzeuge).
--     Eine erneute Bestätigung per E-Mail hebt eine Sperre nicht auf.
--   * Die Spalte wi bedeutet jetzt „hat Zugang“, damit die Push-Funktion ohne neues Deploy richtig filtert.

alter table public.fh_verified add column if not exists revoked boolean not null default false;
update public.fh_verified set wi = not revoked, wi_at = coalesce(wi_at, now()) where wi is distinct from (not revoked);

create or replace function public.fh_ok() returns boolean
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if exists (select 1 from public.admins where user_id = auth.uid())
     and not exists (select 1 from public.fh_admin_test where user_id = auth.uid()) then return true; end if;
  return exists (select 1 from public.fh_verified v join auth.users u on u.id = v.user_id
                  where v.user_id = auth.uid() and lower(u.email) = v.email and not v.revoked);
end $$;

create or replace function public.fh_verify() returns jsonb
language plpgsql security definer set search_path = public as $$
declare mail text; k text; ts double precision; chg timestamptz;
begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  select lower(email) into mail from auth.users where id = auth.uid();
  k := public.fh_kind(mail);
  if k is null then raise exception 'Keine FH-Adresse'; end if;
  select max((a->>'timestamp')::double precision) into ts
    from jsonb_array_elements(coalesce(auth.jwt()->'amr', '[]'::jsonb)) a
   where a->>'method' in ('otp', 'magiclink', 'recovery');
  select at into chg from public.fh_email_changed where user_id = auth.uid();
  if ts is null or to_timestamp(ts) < now() - interval '1 hour' or (chg is not null and to_timestamp(ts) < chg) then
    raise exception 'Code fehlt: zuerst den Code aus der E-Mail eingeben';
  end if;
  insert into public.fh_verified (user_id, email, kind, wi, wi_at) values (auth.uid(), mail, k, true, now())
    on conflict (user_id) do update set email = excluded.email, kind = excluded.kind, verified_at = now(),
      wi = not public.fh_verified.revoked, wi_at = now();
  return jsonb_build_object('email', mail, 'kind', k, 'ok', public.fh_ok());
end $$;

create or replace function public.admin_fh_revoke(uid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'nur für Admins'; end if;
  update public.fh_verified set revoked = true, wi = false, wi_at = null where user_id = uid;
end $$;
create or replace function public.admin_fh_restore(uid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'nur für Admins'; end if;
  update public.fh_verified set revoked = false, wi = true, wi_at = now() where user_id = uid;
end $$;

drop function if exists public.admin_fh_list();
create function public.admin_fh_list() returns table (user_id uuid, name text, email text, kind text, revoked boolean, verified_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'nur für Admins'; end if;
  return query select v.user_id, p.name, v.email, v.kind, v.revoked, v.verified_at
    from public.fh_verified v left join public.profiles p on p.id = v.user_id order by v.verified_at desc limit 500;
end $$;

revoke execute on function public.admin_fh_restore(uuid) from anon;
revoke execute on function public.admin_fh_list() from anon;
grant execute on function public.admin_fh_restore(uuid) to authenticated;
grant execute on function public.admin_fh_list() to authenticated;

-- Alte App-Versionen rufen das evtl. noch auf: tut nichts mehr (hebt auch keine Sperre auf)
create or replace function public.fh_join_wi(code text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  return public.fh_ok();
end $$;
