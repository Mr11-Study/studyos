-- StudyOS · Update 9: Moderation und Admin
-- Einmal im Supabase SQL Editor ausführen (alles einfügen -> Run). Kann gefahrlos mehrmals ausgeführt werden.
-- WICHTIG: Vorher einmal in StudyOS mit kevin.popovic@edu.fh-joanneum.at anmelden (Gemeinsam -> Anmelden),
-- damit das Konto existiert. Dieses Konto wird unten Admin. Wer Admin ist, entscheidet nur die Datenbank,
-- nicht die App: die Tabelle admins kann niemand über die App ändern.
--
-- Was dazukommt:
--   * Schimpfwort-Filter: Wörter aus bad_words werden in Nachrichten, Namen und Gruppennamen zu ★★★.
--     Treffer im Global-Chat und in Gruppen landen als Meldung beim Admin. Direktnachrichten werden nur
--     verdeckt, aber nicht gemeldet (privat).
--   * Melden: jede und jeder kann eine sichtbare Nachricht melden.
--   * Admin: Meldungen sehen, jede Nachricht löschen, verwarnen, stummschalten, Wortliste pflegen, Zahlen.
--   * Eigene Nachrichten löschen gab es schon (Regel „eigene nachricht löschen“).

-- 1) Admins ------------------------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
drop policy if exists "admin sich selbst sehen" on public.admins;
create policy "admin sich selbst sehen" on public.admins for select to authenticated using (user_id = auth.uid());
revoke all on public.admins from anon, authenticated;
grant select on public.admins to authenticated;

insert into public.admins (user_id)
  select id from auth.users where lower(email) = 'kevin.popovic@edu.fh-joanneum.at'
  on conflict do nothing;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

-- für das kleine „Admin“-Abzeichen im Chat
create or replace function public.admin_ids() returns setof uuid
language sql stable security definer set search_path = public as
$$ select user_id from public.admins $$;

-- 2) Wortliste ---------------------------------------------------------------------------------------
-- Nur Buchstaben (jede Schrift, klein), Ziffern und Leerzeichen, damit ein Eintrag nie die Suche selbst verändern kann.
-- Ein Wort trifft auch längere Formen am Wortanfang („fick“ trifft „ficken“), aber nicht mitten im Wort.
create table if not exists public.bad_words (
  word text primary key check (word ~ '^[[:alpha:][:digit:] ]{3,40}$' and word = lower(word)),
  created_at timestamptz not null default now()
);
-- ältere Fassung dieses Updates erlaubte nur a-z und äöüß: Regel auf jede Schrift erweitern
alter table public.bad_words drop constraint if exists bad_words_word_check;
alter table public.bad_words add constraint bad_words_word_check check (word ~ '^[[:alpha:][:digit:] ]{3,40}$' and word = lower(word));
alter table public.bad_words enable row level security;
drop policy if exists "wörter lesen" on public.bad_words;
drop policy if exists "wörter admin anlegen" on public.bad_words;
drop policy if exists "wörter admin löschen" on public.bad_words;
create policy "wörter lesen" on public.bad_words for select to authenticated using (true);
create policy "wörter admin anlegen" on public.bad_words for insert to authenticated with check (public.is_admin());
create policy "wörter admin löschen" on public.bad_words for delete to authenticated using (public.is_admin());
revoke all on public.bad_words from anon, authenticated;
grant select, insert, delete on public.bad_words to authenticated;

insert into public.bad_words (word) values
  ('a55hole'), ('aloch'), ('amk'), ('ananı sikeyim'), ('arrombado'), ('arsch'), ('arschgeige'), ('arschgesicht'), ('arschkriecher'), ('arschl0ch'),
  ('arschloch'), ('arsehole'), ('asozial'), ('asshole'), ('b1tch'), ('bakayaro'), ('bastard'), ('baszd'), ('batard'), ('bazdmeg'),
  ('behenchod'), ('beidl'), ('bhenchod'), ('bhosdi'), ('bhosdike'), ('biatch'), ('bitch'), ('blowjob'), ('blya'), ('blyad'),
  ('blyat'), ('blöde kuh'), ('blöde sau'), ('blödian'), ('blödmann'), ('bollocks'), ('bring dich um'), ('buceta'), ('bullshit'), ('bumsen'),
  ('bâtard'), ('cabron'), ('cabrón'), ('caralho'), ('cazzo'), ('chinga'), ('chingada'), ('chinks'), ('chuj'), ('chutiya'),
  ('cipa'), ('cocksucker'), ('coglione'), ('connard'), ('connasse'), ('coño'), ('culero'), ('cunt'), ('curak'), ('căcat'),
  ('damn'), ('depp'), ('dickhead'), ('dildo'), ('dipshit'), ('douchebag'), ('drecksack'), ('drecksau'), ('dreckskerl'), ('dreckssau'),
  ('drecksschwein'), ('dreckstück'), ('drkadžija'), ('dumbass'), ('dummbeutel'), ('dumme kuh'), ('dumme sau'), ('dummkopf'), ('dupek'), ('ebat'),
  ('eierlutscher'), ('encule'), ('enculé'), ('f1ck'), ('faggot'), ('faszfej'), ('faszom'), ('fetzenschädl'), ('fick'), ('fikk'),
  ('filho da puta'), ('fils de pute'), ('flittchen'), ('foda'), ('fodase'), ('fotze'), ('frocio'), ('fuck'), ('funsn'), ('gamoto'),
  ('gandon'), ('gfrast'), ('gilipollas'), ('godverdomme'), ('govno'), ('gschissener'), ('gschissn'), ('gtfo'), ('hackfresse'), ('halt dein maul'),
  ('halt die fresse'), ('halt die schnauze'), ('halts maul'), ('heil hitler'), ('hentai'), ('hijo de perra'), ('hijo de puta'), ('hirni'), ('hohlkopf'), ('hovno'),
  ('huevón'), ('huj'), ('hure'), ('huren'), ('hurens0hn'), ('hurensohn'), ('häng dich auf'), ('ibn el sharmouta'), ('ibne'), ('idiot'),
  ('jackass'), ('javla'), ('jebac'), ('jebać'), ('jebem'), ('jebem ti mater'), ('jebi'), ('jebo'), ('jebote'), ('joder'),
  ('jävla'), ('kack'), ('kacke'), ('kahpe'), ('kameltreiber'), ('kanacke'), ('kanake'), ('khuy'), ('kikes'), ('kill yourself'),
  ('kinderficker'), ('klootzak'), ('kokot'), ('kos omak'), ('kotzbrocken'), ('kreten'), ('kurcina'), ('kurva'), ('kurva anyád'), ('kurčina'),
  ('kusipää'), ('kutwijf'), ('kys'), ('leck mich'), ('madarchod'), ('malaka'), ('malakas'), ('malparido'), ('maricon'), ('maricón'),
  ('merda'), ('merde'), ('mierda'), ('milf'), ('minchia'), ('missgeburt'), ('mistgeburt'), ('mistkerl'), ('miststück'), ('mistvieh'),
  ('mongoloid'), ('mongool'), ('moron'), ('motherfucker'), ('mudak'), ('muie'), ('möse'), ('nahui'), ('nahuy'), ('neger'),
  ('nigga'), ('nigger'), ('nique ta mere'), ('nique ta mère'), ('niquer'), ('nutte'), ('oasch'), ('oaschloch'), ('omfg'), ('orospu'),
  ('pendejo'), ('penner'), ('perkele'), ('pezevenk'), ('phuck'), ('picsa'), ('pidar'), ('pidaras'), ('pidh'), ('pidor'),
  ('pierdol'), ('pimmel'), ('piss'), ('pisser'), ('pissnelke'), ('pizda'), ('pizdec'), ('pizdets'), ('piç'), ('pička'),
  ('pička ti materina'), ('pičku'), ('polacke'), ('porca puttana'), ('porn'), ('porno'), ('poutana'), ('prdel'), ('pussy'), ('puta madre'),
  ('putain'), ('puttana'), ('pédé'), ('píča'), ('retard'), ('saatana'), ('salopes'), ('sauhund'), ('saukerl'), ('sautrottel'),
  ('sch31ss'), ('scheiss'), ('scheiß'), ('schlampe'), ('schlitzauge'), ('schwachkopf'), ('schwachmat'), ('schwanzlutscher'), ('schwuchtel'), ('sh1t'),
  ('sharmoota'), ('sharmouta'), ('sharmuta'), ('shit'), ('sieg heil'), ('sikerim'), ('sikeyim'), ('sikiyim'), ('siktir'), ('skurwiel'),
  ('skurwysyn'), ('sluts'), ('slutty'), ('spacken'), ('spacko'), ('spast'), ('spierdalaj'), ('stfu'), ('stronza'), ('stronzo'),
  ('stupid'), ('suka'), ('supak'), ('ta gueule'), ('titte'), ('tranny'), ('troia'), ('trottel'), ('trottl'), ('tschusch'),
  ('tunte'), ('twat'), ('va te faire foutre'), ('vaffanculo'), ('verpiss'), ('verreck'), ('vittu'), ('vollasi'), ('vollhorst'), ('vollidiot'),
  ('vollkoffer'), ('vollpfosten'), ('vollspast'), ('volltrottel'), ('wanker'), ('wappler'), ('white power'), ('whore'), ('wichs'), ('wichser'),
  ('wichsvorlage'), ('wixer'), ('wixx'), ('wixxer'), ('wtf'), ('yarak'), ('yarrak'), ('yebat'), ('zalupa'), ('zigeuner'),
  ('zipfelklatscher'), ('zmrd'), ('čurák'), ('šupak'), ('γαμώτο'), ('μαλάκα'), ('πουτάνα'), ('бля'), ('блядь'), ('блять'),
  ('гандон'), ('долбоёб'), ('ебал'), ('ебать'), ('залупа'), ('мудак'), ('нахуй'), ('пидор'), ('пидорас'), ('пизда'),
  ('пиздец'), ('сука'), ('уёбок'), ('хуй'), ('хуйня'), ('ёбаный'), ('شرموطة'), ('قحبة'), ('منيوك'), ('他妈的'),
  ('操你妈'), ('王八蛋')
on conflict do nothing;

create or replace function public.bad_pattern() returns text
language sql stable security definer set search_path = public as
$$ select case when count(*) = 0 then null
   else '(^|[^[:alnum:]äöüßÄÖÜ])(' || string_agg(word, '|' order by length(word) desc) || ')[[:alnum:]äöüßÄÖÜ]*' end
   from public.bad_words $$;

create or replace function public.bad_hits(t text) returns text[]
language sql stable security definer set search_path = public as
$$ select coalesce(array(select distinct lower(m[2]) from regexp_matches(coalesce(t, ''), public.bad_pattern(), 'gi') m), '{}')
   where public.bad_pattern() is not null $$;

create or replace function public.bad_mask(t text) returns text
language sql stable security definer set search_path = public as
$$ select case when t is null or public.bad_pattern() is null then t
   else regexp_replace(t, public.bad_pattern(), '\1★★★', 'gi') end $$;

-- 3) Meldungen ---------------------------------------------------------------------------------------
create table if not exists public.reports (
  id bigint generated always as identity primary key,
  message_id bigint,
  kind text not null check (kind in ('filter', 'user', 'name')),
  reporter uuid,
  sender uuid,
  body text,
  place text,
  words text[],
  reason text check (char_length(reason) <= 300),
  status text not null default 'open' check (status in ('open', 'done')),
  action text check (char_length(action) <= 200),
  created_at timestamptz not null default now()
);
create index if not exists reports_open on public.reports (status, created_at desc);
alter table public.reports enable row level security;
drop policy if exists "meldungen admin sehen" on public.reports;
drop policy if exists "meldungen admin ändern" on public.reports;
drop policy if exists "meldungen admin löschen" on public.reports;
create policy "meldungen admin sehen" on public.reports for select to authenticated using (public.is_admin());
create policy "meldungen admin ändern" on public.reports for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "meldungen admin löschen" on public.reports for delete to authenticated using (public.is_admin());
revoke all on public.reports from anon, authenticated;
grant select, update, delete on public.reports to authenticated;

-- Ort einer Nachricht lesbar machen: „Global-Chat“, „Gruppe: Name“ oder „Direktnachricht“
create or replace function public.msg_place(c text, g uuid, u uuid) returns text
language sql stable security definer set search_path = public as
$$ select case when c is not null then (case when c = 'global' then 'Global-Chat' else 'Fach-Chat ' || c end)
   when g is not null then 'Gruppe: ' || coalesce((select name from public.groups where id = g), '?')
   else 'Direktnachricht' end $$;

-- 4) Filter für Nachrichten: verdecken, im Global-Chat und in Gruppen melden
create or replace function public.msg_filter() returns trigger
language plpgsql security definer set search_path = public as $$
declare w text[];
begin
  if new.body is null or new.body = '' then return new; end if;
  w := public.bad_hits(new.body);
  if w is null or cardinality(w) = 0 then return new; end if;
  if new.to_user is null then
    insert into public.reports (message_id, kind, sender, body, place, words)
      values (new.id, 'filter', new.sender, new.body, public.msg_place(new.course, new.group_id, new.to_user), w);
  end if;
  new.body := public.bad_mask(new.body);
  return new;
end $$;
drop trigger if exists msg_filter on public.messages;
create trigger msg_filter before insert or update of body on public.messages
  for each row execute function public.msg_filter();

-- 5) Filter für Namen: ein Name mit gesperrtem Wort wird zu „Studi“ und landet (höchstens einmal im Monat) beim Admin
create or replace function public.name_filter() returns trigger
language plpgsql security definer set search_path = public as $$
declare w text[];
begin
  w := public.bad_hits(new.name);
  if w is null or cardinality(w) = 0 then return new; end if;
  if not exists (select 1 from public.reports where kind = 'name' and sender = new.id and body = new.name and created_at > now() - interval '30 days') then
    insert into public.reports (kind, sender, body, place, words) values ('name', new.id, new.name, 'Profilname', w);
  end if;
  new.name := 'Studi';
  return new;
end $$;
drop trigger if exists name_filter on public.profiles;
create trigger name_filter before insert or update of name on public.profiles
  for each row execute function public.name_filter();

-- Gruppennamen und Beschreibungen werden nur verdeckt
create or replace function public.group_filter() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.name := public.bad_mask(new.name);
  begin new.about := public.bad_mask(new.about); exception when undefined_column then null; end;
  return new;
end $$;
drop trigger if exists group_filter on public.groups;
create trigger group_filter before insert or update on public.groups
  for each row execute function public.group_filter();

-- 6) Melden durch Nutzer: nur Nachrichten, die man selbst sehen darf; höchstens 20 Meldungen pro Stunde
create or replace function public.report_message(mid bigint, why text default null) returns void
language plpgsql security definer set search_path = public as $$
declare m public.messages;
begin
  if auth.uid() is null then raise exception 'nicht angemeldet'; end if;
  select * into m from public.messages where id = mid;
  if not found then raise exception 'Nachricht nicht gefunden'; end if;
  if not (m.course is not null or (m.group_id is not null and public.is_member(m.group_id)) or auth.uid() in (m.sender, m.to_user)) then
    raise exception 'Nachricht nicht gefunden';
  end if;
  if m.sender = auth.uid() then raise exception 'Eigene Nachrichten kann man nicht melden'; end if;
  if (select count(*) from public.reports where reporter = auth.uid() and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'Zu viele Meldungen, bitte später nochmal';
  end if;
  if exists (select 1 from public.reports where reporter = auth.uid() and message_id = mid) then return; end if;
  insert into public.reports (message_id, kind, reporter, sender, body, place, reason)
    values (mid, 'user', auth.uid(), m.sender, coalesce(nullif(m.body, ''), coalesce('📎 ' || (m.file->>'name'), '')),
            public.msg_place(m.course, m.group_id, m.to_user), left(nullif(trim(why), ''), 300));
end $$;

-- 7) Verwarnungen: der Admin schreibt, die Person sieht den Hinweis beim nächsten Öffnen
create table if not exists public.user_notes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  text text not null check (char_length(text) between 1 and 500),
  by uuid default auth.uid(),
  seen boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.user_notes enable row level security;
drop policy if exists "hinweise lesen" on public.user_notes;
drop policy if exists "hinweise admin schreiben" on public.user_notes;
drop policy if exists "hinweise gelesen" on public.user_notes;
drop policy if exists "hinweise admin löschen" on public.user_notes;
create policy "hinweise lesen" on public.user_notes for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "hinweise admin schreiben" on public.user_notes for insert to authenticated with check (public.is_admin() and by = auth.uid());
create policy "hinweise gelesen" on public.user_notes for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "hinweise admin löschen" on public.user_notes for delete to authenticated using (public.is_admin());
revoke all on public.user_notes from anon, authenticated;
grant select, insert, delete on public.user_notes to authenticated;
grant update (seen) on public.user_notes to authenticated;

-- 8) Stummschalten: wer stumm ist, kann bis „until“ keine Nachrichten senden
create table if not exists public.mutes (
  user_id uuid primary key references auth.users on delete cascade,
  until timestamptz not null,
  reason text check (char_length(reason) <= 300),
  by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
alter table public.mutes enable row level security;
drop policy if exists "stumm sehen" on public.mutes;
drop policy if exists "stumm admin" on public.mutes;
create policy "stumm sehen" on public.mutes for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "stumm admin" on public.mutes for all to authenticated using (public.is_admin()) with check (public.is_admin());
revoke all on public.mutes from anon, authenticated;
grant select, insert, update, delete on public.mutes to authenticated;

create or replace function public.is_muted() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.mutes where user_id = auth.uid() and until > now()) $$;

-- Senden: wie in Update 2, dazu „nicht stummgeschaltet“
drop policy if exists "nachricht senden" on public.messages;
create policy "nachricht senden" on public.messages for insert to authenticated with check (
  sender = auth.uid()
  and not public.is_muted()
  and (file is null or split_part(file->>'path', '/', 1) = auth.uid()::text)
  and (
    course is not null
    or (group_id is not null and public.is_member(group_id))
    or (to_user is not null and public.are_friends(auth.uid(), to_user))));

-- 9) Admin-Werkzeuge ----------------------------------------------------------------------------------
-- jede Nachricht löschen (auch in Gruppen und Direktchats, die der Admin selbst nicht sieht)
create or replace function public.admin_delete_message(mid bigint) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'nur für Admins'; end if;
  delete from public.messages where id = mid;
  update public.reports set status = 'done', action = coalesce(action || ' · ', '') || 'Nachricht gelöscht'
    where message_id = mid and status = 'open';
end $$;
-- Anhänge fremder Nachrichten darf der Admin ebenfalls entfernen
drop policy if exists "chat admin löschen" on storage.objects;
create policy "chat admin löschen" on storage.objects for delete to authenticated
  using (bucket_id = 'chat' and public.is_admin());

-- alle Nachrichten einer Person im Global-Chat der letzten 24 Stunden löschen
create or replace function public.admin_purge_user(uid uuid) returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not public.is_admin() then raise exception 'nur für Admins'; end if;
  delete from public.messages where sender = uid and course is not null;
  get diagnostics n = row_count;
  return n;
end $$;

-- Global-Chat komplett leeren
create or replace function public.admin_clear_global() returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not public.is_admin() then raise exception 'nur für Admins'; end if;
  delete from public.messages where course is not null;
  get diagnostics n = row_count;
  return n;
end $$;

-- Namen eines Profils zurücksetzen
create or replace function public.admin_reset_name(uid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'nur für Admins'; end if;
  update public.profiles set name = 'Studi' where id = uid;
end $$;

-- Zahlen für die Admin-Seite
create or replace function public.admin_stats() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'nur für Admins'; end if;
  return jsonb_build_object(
    'users', (select count(*) from public.profiles),
    'groups', (select count(*) from public.groups),
    'messages24', (select count(*) from public.messages where created_at > now() - interval '1 day'),
    'global24', (select count(*) from public.messages where course is not null and created_at > now() - interval '1 day'),
    'active24', (select count(distinct sender) from public.messages where created_at > now() - interval '1 day'),
    'open', (select count(*) from public.reports where status = 'open'),
    'muted', (select count(*) from public.mutes where until > now()));
end $$;

-- Personen suchen (Name), mit Aktivität, Verwarnungen und Stummschaltung
create or replace function public.admin_users(term text default '') returns table (
  id uuid, name text, avatar text, msgs bigint, last_at timestamptz, notes bigint, reports bigint, muted_until timestamptz)
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
begin
  if not public.is_admin() then raise exception 'nur für Admins'; end if;
  return query
    select p.id, p.name, p.avatar,
      (select count(*) from public.messages m where m.sender = p.id),
      (select max(m.created_at) from public.messages m where m.sender = p.id),
      (select count(*) from public.user_notes n where n.user_id = p.id),
      (select count(*) from public.reports r where r.sender = p.id),
      (select u.until from public.mutes u where u.user_id = p.id and u.until > now())
    from public.profiles p
    where coalesce(term, '') = '' or p.name ilike '%' || term || '%'
    order by 5 desc nulls last
    limit 50;
end $$;

revoke all on function public.admin_delete_message(bigint), public.admin_purge_user(uuid), public.admin_clear_global(),
  public.admin_reset_name(uuid), public.admin_stats(), public.admin_users(text), public.report_message(bigint, text) from anon, public;
grant execute on function public.admin_delete_message(bigint), public.admin_purge_user(uuid), public.admin_clear_global(),
  public.admin_reset_name(uuid), public.admin_stats(), public.admin_users(text), public.report_message(bigint, text),
  public.is_admin(), public.admin_ids(), public.is_muted() to authenticated;

-- 10) Live: neue Meldungen erscheinen sofort beim Admin, Verwarnungen sofort bei der Person
do $$ begin alter publication supabase_realtime add table public.reports; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.user_notes; exception when duplicate_object then null; end $$;

-- Kontrolle: hier muss genau eine Zeile mit deiner E-Mail stehen
select u.email as admin from public.admins a join auth.users u on u.id = a.user_id;
