-- StudyOS Online · Update 2: Bilder, GIFs und Dateien im Chat (max. 5 MB, 24 Stunden abrufbar)
-- und der offene Fach-Live-Chat löscht sich nach 24 Stunden. Lerngruppen und Direktchats bleiben.
-- SQL Editor -> alles einfügen -> Run. Kann gefahrlos mehrmals ausgeführt werden.

-- 1) Nachrichten können einen Anhang haben; Text darf dann leer sein
alter table public.messages add column if not exists file jsonb;
alter table public.messages drop constraint if exists messages_body_check;
alter table public.messages drop constraint if exists messages_body_or_file;
alter table public.messages add constraint messages_body_or_file
  check (char_length(body) <= 2000 and (char_length(body) >= 1 or file is not null));
alter table public.messages alter column body set default '';
create index if not exists messages_file_path on public.messages ((file->>'path'));

-- Anhänge dürfen nur auf eigene Dateien zeigen (Ordner = eigene ID)
drop policy if exists "nachricht senden" on public.messages;
create policy "nachricht senden" on public.messages for insert to authenticated with check (
  sender = auth.uid()
  and (file is null or split_part(file->>'path', '/', 1) = auth.uid()::text)
  and (
    course is not null
    or (group_id is not null and public.is_member(group_id))
    or (to_user is not null and public.are_friends(auth.uid(), to_user))));

-- 2) Privater Dateispeicher „chat“, höchstens 5 MB pro Datei
insert into storage.buckets (id, name, public, file_size_limit)
values ('chat', 'chat', false, 5242880)
on conflict (id) do update set public = false, file_size_limit = 5242880;

-- Hochladen nur in den eigenen Ordner (<user-id>/...)
drop policy if exists "chat hochladen" on storage.objects;
create policy "chat hochladen" on storage.objects for insert to authenticated
  with check (bucket_id = 'chat' and (storage.foldername(name))[1] = auth.uid()::text);
-- Ansehen darf, wer die zugehörige Nachricht sehen darf (Regeln der Tabelle messages), und nur 24 Stunden lang
drop policy if exists "chat ansehen" on storage.objects;
create policy "chat ansehen" on storage.objects for select to authenticated
  using (bucket_id = 'chat' and ((storage.foldername(name))[1] = auth.uid()::text or exists (select 1 from public.messages m where m.file->>'path' = storage.objects.name
    and not (m.file ? 'expired') and m.created_at > now() - interval '1 day')));
-- Löschen nur eigene Dateien
drop policy if exists "chat löschen" on storage.objects;
create policy "chat löschen" on storage.objects for delete to authenticated
  using (bucket_id = 'chat' and (storage.foldername(name))[1] = auth.uid()::text);

-- 3) Stündliches Aufräumen:
--    offener Fach-Live-Chat: Nachrichten älter als 24 Stunden löschen;
--    Anhänge älter als 24 Stunden als abgelaufen markieren (die Datei selbst entfernt die App des Absenders beim nächsten Öffnen).
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('studyos-aufraeumen', '7 * * * *', $$
  delete from public.messages where course is not null and created_at < now() - interval '1 day';
  update public.messages set file = file || '{"expired": true}'::jsonb
    where file is not null and not (file ? 'expired') and created_at < now() - interval '1 day';
$$);
