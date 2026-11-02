-- StudyOS · Update 10: längere Wortliste, Likes für Nachrichten, Freund per Profil hinzufügen
-- Einmal im Supabase SQL Editor ausführen (alles einfügen -> Run), NACH supabase-update-9.sql.
-- Kann gefahrlos mehrmals ausgeführt werden.

-- 1) Viel längere Liste gesperrter Wörter in vielen Sprachen: Deutsch, Österreichisch, Englisch, Französisch,
--    Spanisch, Italienisch, Portugiesisch, Türkisch, Bosnisch/Kroatisch/Serbisch, Polnisch, Russisch (auch Kyrillisch),
--    Rumänisch, Ungarisch, Niederländisch, Albanisch, Arabisch, Tschechisch, Griechisch, Skandinavisch, Hindi, Chinesisch.
--    Einträge dürfen jetzt Buchstaben jeder Schrift enthalten (é, ç, ł, ı, Kyrillisch …), aber keine Sonderzeichen.
alter table public.bad_words drop constraint if exists bad_words_word_check;
alter table public.bad_words add constraint bad_words_word_check check (word ~ '^[[:alpha:][:digit:] ]{3,40}$' and word = lower(word));
--    Ein Eintrag trifft auch längere Formen am Wortanfang („fick“ trifft „ficken“), nie mitten im Wort.
--    Bewusst NICHT enthalten, weil sie normale Wörter treffen würden: mongo (MongoDB), assi (Assistent),
--    sex (Sexismus), nude (Nudeln), cock (Cocktail), prick (prickeln), schas (Schaschlik), opfer (Opferkosten),
--    puta (bosnisch putovanje = Reise), peder (türkisch Vater), geci (türkisch gecikme), fasz (Faszination), fut (Futter),
--    verga (Vergangenheit), culo (Culotte), porra (spanisch porrazo), salope (Salopette), pinche (pinched).
--    Das Muster in bad_pattern() lässt nur Wortanfänge zu, und alle Einträge bestehen nur aus Buchstaben und Leerzeichen.
delete from public.bad_words where word in ('mongo', 'fuk', 'pinche', 'kike', 'slut', 'chink', 'salope', 'porra', 'puta', 'peder', 'geci', 'debil', 'transe', 'viado', 'fitta', 'crap');
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

-- 2) Likes: jede Person kann eine Nachricht einmal liken; sehen und liken darf, wer die Nachricht sieht
create table if not exists public.message_likes (
  message_id bigint not null references public.messages on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id)
);
create index if not exists message_likes_user on public.message_likes (user_id);
alter table public.message_likes enable row level security;
drop policy if exists "likes sehen" on public.message_likes;
drop policy if exists "liken" on public.message_likes;
drop policy if exists "like zurücknehmen" on public.message_likes;
-- die Unterabfrage läuft mit den Rechten der Person, sieht also nur Nachrichten, die sie lesen darf
create policy "likes sehen" on public.message_likes for select to authenticated
  using (exists (select 1 from public.messages m where m.id = message_id));
create policy "liken" on public.message_likes for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.messages m where m.id = message_id));
create policy "like zurücknehmen" on public.message_likes for delete to authenticated using (user_id = auth.uid());
revoke all on public.message_likes from anon, authenticated;
grant select, insert, delete on public.message_likes to authenticated;
do $$ begin alter publication supabase_realtime add table public.message_likes; exception when duplicate_object then null; end $$;

-- 3) Freundschaftsanfrage direkt aus dem Profil (Antippen des Profilbilds im Chat).
--    Anders als beim Freundescode ist das nur eine Anfrage: die andere Person muss annehmen.
--    Hat sie selbst schon angefragt, seid ihr sofort befreundet. Höchstens 30 offene Anfragen.
create or replace function public.request_friend(uid uuid) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'nicht angemeldet'; end if;
  if uid is null or uid = auth.uid() or not exists (select 1 from public.profiles where id = uid) then raise exception 'Unbekannte Person'; end if;
  update public.friendships set accepted = true where a = uid and b = auth.uid();
  if found then return true; end if;
  if exists (select 1 from public.friendships where a = auth.uid() and b = uid) then
    return (select accepted from public.friendships where a = auth.uid() and b = uid);
  end if;
  if (select count(*) from public.friendships where a = auth.uid() and not accepted) >= 30 then
    raise exception 'Zu viele offene Anfragen. Warte, bis welche angenommen werden.';
  end if;
  insert into public.friendships (a, b, accepted) values (auth.uid(), uid, false);
  return false;
end $$;
revoke all on function public.request_friend(uuid) from anon, public;
grant execute on function public.request_friend(uuid) to authenticated;
