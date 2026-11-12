-- StudyOS · Update 11: Fach-Lerngruppen nur für bestätigte FH-JOANNEUM-Konten aus Wirtschaftsinformatik
-- Einmal im Supabase SQL Editor ausführen (alles einfügen -> Run), NACH supabase-update-9.sql.
-- Kann gefahrlos mehrmals ausgeführt werden.
--
-- Was gilt danach:
--   * Gruppen OHNE Fach, Freunde, Direktchats, Global-Chat und alles andere bleiben für alle offen.
--   * Gruppen MIT Fach (Lerngruppen) sehen, gründen, betreten und lesen nur Konten, die
--       1) eine Adresse @edu.fh-joanneum.at (Studierende) oder @fh-joanneum.at (Lehrende) haben,
--       2) diese Adresse mit dem Code aus einer E-Mail bestätigt haben (wer sie nur eintippt, kommt nicht rein), und
--       3) als Studierende einmal den Studiengangs-Code eingegeben haben. Lehrende brauchen keinen Code.
--   * Den Studiengangs-Code sieht und ändert nur der Admin (Admin -> Werkzeuge).
--
-- Damit E-Mails mit Code ankommen, braucht Supabase einen eigenen E-Mail-Versand (SMTP), siehe ANLEITUNG.md.

-- 1) Wer ist bestätigt? ------------------------------------------------------------------------------
create table if not exists public.fh_verified (
  user_id uuid primary key references auth.users on delete cascade,
  email text not null,
  kind text not null check (kind in ('student', 'staff')),
  wi boolean not null default false,
  verified_at timestamptz not null default now(),
  wi_at timestamptz
);
alter table public.fh_verified enable row level security;
drop policy if exists "fh eigener status" on public.fh_verified;
create policy "fh eigener status" on public.fh_verified for select to authenticated using (user_id = auth.uid() or public.is_admin());
revoke all on public.fh_verified from anon, authenticated;
grant select on public.fh_verified to authenticated; -- schreiben nur über die Funktionen unten

-- Wann hat ein Konto zuletzt seine E-Mail geändert? (nur intern, kein Zugriff aus der App)
create table if not exists public.fh_email_changed (
  user_id uuid primary key references auth.users on delete cascade,
  at timestamptz not null default now()
);
alter table public.fh_email_changed enable row level security;
revoke all on public.fh_email_changed from anon, authenticated;

-- Einstellungen (Studiengangs-Code), nur intern
create table if not exists public.fh_settings (
  key text primary key,
  value text not null
);
alter table public.fh_settings enable row level security;
revoke all on public.fh_settings from anon, authenticated;
insert into public.fh_settings (key, value) values ('wi_code', upper(substr(md5(random()::text), 1, 8))) on conflict (key) do nothing;

-- Art der Adresse: student, staff oder null
create or replace function public.fh_kind(mail text) returns text
language sql immutable as
$$ select case when lower(mail) like '%@edu.fh-joanneum.at' then 'student'
               when lower(mail) like '%@fh-joanneum.at' then 'staff' end $$;

-- E-Mail geändert: Bestätigung fällt weg, neue Adresse muss neu bestätigt werden
create or replace function public.fh_on_email_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email is distinct from old.email then
    delete from public.fh_verified where user_id = new.id;
    insert into public.fh_email_changed (user_id, at) values (new.id, now())
      on conflict (user_id) do update set at = now();
  end if;
  return new;
end $$;
drop trigger if exists fh_email_change on auth.users;
create trigger fh_email_change after update of email on auth.users
  for each row execute function public.fh_on_email_change();

-- 2) Darf dieses Konto in Fach-Lerngruppen? ------------------------------------------------------------
create or replace function public.fh_ok() returns boolean
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if exists (select 1 from public.admins where user_id = auth.uid()) then return true; end if;
  return exists (select 1 from public.fh_verified v join auth.users u on u.id = v.user_id
                  where v.user_id = auth.uid() and lower(u.email) = v.email
                    and (v.kind = 'staff' or v.wi));
end $$;

-- Gruppe ohne Fach: immer ok. Gruppe mit Fach: nur mit fh_ok()
create or replace function public.group_ok(g uuid) returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce((select course is null or course = '' from public.groups where id = g), true) or public.fh_ok() $$;

-- 3) Bestätigen: nur direkt nach einer Anmeldung per E-Mail-Code (beweist, dass das Postfach einem gehört) --
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
  insert into public.fh_verified (user_id, email, kind) values (auth.uid(), mail, k)
    on conflict (user_id) do update set email = excluded.email, kind = excluded.kind, verified_at = now(),
      wi = case when public.fh_verified.email = excluded.email then public.fh_verified.wi else false end;
  return jsonb_build_object('email', mail, 'kind', k, 'ok', public.fh_ok());
end $$;

-- Studiengangs-Code eingeben (nur nach der Bestätigung)
create or replace function public.fh_join_wi(code text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.fh_verified where user_id = auth.uid()) then raise exception 'Zuerst die FH-Adresse bestätigen'; end if;
  if upper(trim(code)) is distinct from (select value from public.fh_settings where key = 'wi_code') then raise exception 'Falscher Studiengangs-Code'; end if;
  update public.fh_verified set wi = true, wi_at = now() where user_id = auth.uid();
  return true;
end $$;

-- Admin: Code ansehen und ändern, Personen und Zugang verwalten
create or replace function public.admin_wi_code(new_code text default null) returns text
language plpgsql security definer set search_path = public as $$
declare c text := upper(regexp_replace(coalesce(new_code, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  if not public.is_admin() then raise exception 'nur für Admins'; end if;
  if new_code is not null then
    if char_length(c) not between 4 and 16 then raise exception 'Der Code braucht 4 bis 16 Buchstaben oder Ziffern'; end if;
    update public.fh_settings set value = c where key = 'wi_code';
  end if;
  return (select value from public.fh_settings where key = 'wi_code');
end $$;
create or replace function public.admin_fh_list() returns table (user_id uuid, name text, email text, kind text, wi boolean, verified_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'nur für Admins'; end if;
  return query select v.user_id, p.name, v.email, v.kind, v.wi, v.verified_at
    from public.fh_verified v left join public.profiles p on p.id = v.user_id order by v.verified_at desc limit 500;
end $$;
create or replace function public.admin_fh_revoke(uid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'nur für Admins'; end if;
  update public.fh_verified set wi = false, wi_at = null where user_id = uid;
end $$;

revoke execute on function public.fh_verify() from anon;
revoke execute on function public.fh_join_wi(text) from anon;
revoke execute on function public.admin_wi_code(text) from anon;
revoke execute on function public.admin_fh_list() from anon;
revoke execute on function public.admin_fh_revoke(uuid) from anon;
grant execute on function public.fh_ok() to authenticated;
grant execute on function public.group_ok(uuid) to authenticated;
grant execute on function public.fh_verify() to authenticated;
grant execute on function public.fh_join_wi(text) to authenticated;
grant execute on function public.admin_wi_code(text) to authenticated;
grant execute on function public.admin_fh_list() to authenticated;
grant execute on function public.admin_fh_revoke(uuid) to authenticated;

-- 4) Regeln für Gruppen, Mitglieder und Nachrichten ------------------------------------------------------
drop policy if exists "gruppen sehen" on public.groups;
create policy "gruppen sehen" on public.groups for select to authenticated
  using ((owner = auth.uid() or public.is_member(id)) and (course is null or course = '' or public.fh_ok()));
drop policy if exists "gruppe gründen" on public.groups;
create policy "gruppe gründen" on public.groups for insert to authenticated
  with check (owner = auth.uid() and (course is null or course = '' or public.fh_ok()));
drop policy if exists "gruppe ändern" on public.groups;
create policy "gruppe ändern" on public.groups for update to authenticated
  using (owner = auth.uid() and (course is null or course = '' or public.fh_ok()))
  with check (owner = auth.uid() and (course is null or course = '' or public.fh_ok()));
drop policy if exists "gruppe löschen" on public.groups;
create policy "gruppe löschen" on public.groups for delete to authenticated using (owner = auth.uid());

drop policy if exists "mitglieder sehen" on public.group_members;
create policy "mitglieder sehen" on public.group_members for select to authenticated
  using (public.is_member(group_id) and public.group_ok(group_id));
drop policy if exists "selbst beitreten" on public.group_members;
create policy "selbst beitreten" on public.group_members for insert to authenticated
  with check (user_id = auth.uid() and public.group_ok(group_id)
    and exists (select 1 from public.groups g where g.id = group_id and g.owner = auth.uid()));

drop policy if exists "nachrichten lesen" on public.messages;
create policy "nachrichten lesen" on public.messages for select to authenticated using (
  course is not null
  or (group_id is not null and public.is_member(group_id) and public.group_ok(group_id))
  or (to_user is not null and auth.uid() in (sender, to_user)));
drop policy if exists "nachricht senden" on public.messages;
create policy "nachricht senden" on public.messages for insert to authenticated with check (
  sender = auth.uid()
  and not public.is_muted()
  and (file is null or split_part(file->>'path', '/', 1) = auth.uid()::text)
  and (
    course is not null
    or (group_id is not null and public.is_member(group_id) and public.group_ok(group_id))
    or (to_user is not null and public.are_friends(auth.uid(), to_user))));
-- Anhänge und Likes richten sich nach der Regel „nachrichten lesen“ und sind damit ebenfalls geschützt.

-- Beitreten per Code und offene Gruppen: Fach-Gruppen nur mit fh_ok()
create or replace function public.join_group(code text) returns uuid
language plpgsql security definer set search_path = public as
$$ declare g uuid;
begin
  select id into g from groups where invite = upper(code);
  if g is null then raise exception 'Unbekannter Code'; end if;
  if not public.group_ok(g) then raise exception 'Nur für FH-Konten: Fach-Lerngruppen brauchen eine bestätigte FH-Adresse'; end if;
  insert into group_members (group_id, user_id) values (g, auth.uid()) on conflict do nothing;
  return g;
end $$;

create or replace function public.join_open_group(gid uuid) returns uuid
language plpgsql security definer set search_path = public as
$$ begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  if not exists (select 1 from groups where id = gid and open) then raise exception 'Gruppe ist privat'; end if;
  if not public.group_ok(gid) then raise exception 'Nur für FH-Konten: Fach-Lerngruppen brauchen eine bestätigte FH-Adresse'; end if;
  insert into group_members (group_id, user_id) values (gid, auth.uid()) on conflict do nothing;
  return gid;
end $$;

create or replace function public.discover_groups(search text default '', tag text default null, fach text default null)
returns table (id uuid, name text, course text, tags text[], about text, members bigint, joined boolean)
language sql stable security definer set search_path = public as
$$ select g.id, g.name, g.course, g.tags, g.about,
          (select count(*) from group_members m where m.group_id = g.id),
          exists (select 1 from group_members m where m.group_id = g.id and m.user_id = auth.uid())
     from groups g
    where g.open
      and (g.course is null or g.course = '' or public.fh_ok())
      and (coalesce(search, '') = '' or g.name ilike '%' || search || '%' or g.about ilike '%' || search || '%'
           or exists (select 1 from unnest(g.tags) t where t ilike '%' || search || '%'))
      and (tag is null or tag = any (g.tags))
      and (fach is null or g.course = fach)
    order by 6 desc, g.created_at desc
    limit 60 $$;
