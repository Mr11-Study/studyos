-- StudyOS Online · Update 4: Gruppen für alles (auch ohne Fach), offen oder privat, mit Tags und Beschreibung.
-- In Supabase: SQL Editor -> New query -> alles einfügen -> Run. Mehrfaches Ausführen schadet nicht.

alter table public.groups alter column course drop not null;
alter table public.groups add column if not exists open boolean not null default false;
alter table public.groups add column if not exists tags text[] not null default '{}';
alter table public.groups add column if not exists about text;
alter table public.groups drop constraint if exists groups_extra_ok;
alter table public.groups add constraint groups_extra_ok check (
  cardinality(tags) <= 6 and char_length(array_to_string(tags, ',')) <= 140 and char_length(coalesce(about, '')) <= 200);
create index if not exists groups_open on public.groups (open) where open;

-- Offene Gruppen finden: nur offene, ohne Einladungscode, mit Mitgliederzahl
create or replace function public.discover_groups(search text default '', tag text default null, fach text default null)
returns table (id uuid, name text, course text, tags text[], about text, members bigint, joined boolean)
language sql stable security definer set search_path = public as
$$ select g.id, g.name, g.course, g.tags, g.about,
          (select count(*) from group_members m where m.group_id = g.id),
          exists (select 1 from group_members m where m.group_id = g.id and m.user_id = auth.uid())
     from groups g
    where g.open
      and (coalesce(search, '') = '' or g.name ilike '%' || search || '%' or g.about ilike '%' || search || '%'
           or exists (select 1 from unnest(g.tags) t where t ilike '%' || search || '%'))
      and (tag is null or tag = any (g.tags))
      and (fach is null or g.course = fach)
    order by 6 desc, g.created_at desc
    limit 60 $$;

-- Einer offenen Gruppe ohne Code beitreten
create or replace function public.join_open_group(gid uuid) returns uuid
language plpgsql security definer set search_path = public as
$$ begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  if not exists (select 1 from groups where id = gid and open) then raise exception 'Gruppe ist privat'; end if;
  insert into group_members (group_id, user_id) values (gid, auth.uid()) on conflict do nothing;
  return gid;
end $$;

revoke execute on function public.discover_groups(text, text, text) from anon;
revoke execute on function public.join_open_group(uuid) from anon;
grant execute on function public.discover_groups(text, text, text) to authenticated;
grant execute on function public.join_open_group(uuid) to authenticated;

-- Nur die Gründerin bzw. der Gründer darf Name, Sichtbarkeit und Tags ändern (Besitz bleibt gleich)
drop policy if exists "gruppe ändern" on public.groups;
create policy "gruppe ändern" on public.groups for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
