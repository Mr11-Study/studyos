-- StudyOS Online: Freunde, Chat, Lerngruppen und Live-Chat pro Fach
-- In Supabase: SQL Editor -> New query -> alles einfügen -> Run.
-- Vorher: Authentication -> Sign In / Providers -> "Allow anonymous sign-ins" einschalten.

-- Profile: Anzeigename, Avatar und ein kurzer Freundescode zum Teilen per QR
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  avatar text check (char_length(avatar) <= 8),
  code text unique not null default upper(substr(md5(random()::text), 1, 8)),
  created_at timestamptz not null default now()
);

-- Freundschaften: a hat angefragt, b bestätigt
create table if not exists public.friendships (
  a uuid not null references public.profiles on delete cascade,
  b uuid not null references public.profiles on delete cascade,
  accepted boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (a, b),
  check (a <> b)
);

-- Lerngruppen, jeweils zu einem Fach
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  course text not null check (char_length(course) <= 20),
  name text not null check (char_length(name) between 1 and 60),
  owner uuid not null references public.profiles on delete cascade,
  invite text unique not null default upper(substr(md5(random()::text), 1, 8)),
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- Nachrichten: direkt (to_user), in einer Lerngruppe (group_id) oder im offenen Fach-Chat (course)
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  sender uuid not null default auth.uid() references public.profiles on delete cascade,
  to_user uuid references public.profiles on delete cascade,
  group_id uuid references public.groups on delete cascade,
  course text check (char_length(course) <= 20),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  check (num_nonnulls(to_user, group_id, course) = 1)
);
create index if not exists messages_course on public.messages (course, created_at desc);
create index if not exists messages_group on public.messages (group_id, created_at desc);
create index if not exists messages_dm on public.messages (sender, to_user, created_at desc);

-- Hilfsfunktionen (security definer, damit die Regeln sich nicht gegenseitig aufrufen)
create or replace function public.is_member(g uuid) returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from group_members where group_id = g and user_id = auth.uid()) $$;

create or replace function public.are_friends(x uuid, y uuid) returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from friendships where accepted and ((a = x and b = y) or (a = y and b = x))) $$;

-- Gruppe per Einladungscode beitreten
create or replace function public.join_group(code text) returns uuid
language plpgsql security definer set search_path = public as
$$ declare g uuid;
begin
  select id into g from groups where invite = upper(code);
  if g is null then raise exception 'Unbekannter Code'; end if;
  insert into group_members (group_id, user_id) values (g, auth.uid()) on conflict do nothing;
  return g;
end $$;

-- Freund per Freundescode anfragen
create or replace function public.add_friend(code text) returns uuid
language plpgsql security definer set search_path = public as
$$ declare f uuid;
begin
  select id into f from profiles where profiles.code = upper(add_friend.code);
  if f is null or f = auth.uid() then raise exception 'Unbekannter Code'; end if;
  -- Hat der andere schon angefragt, gilt das als Bestätigung
  update friendships set accepted = true where a = f and b = auth.uid();
  if not found then insert into friendships (a, b) values (auth.uid(), f) on conflict do nothing; end if;
  return f;
end $$;

-- Row Level Security: ohne passende Regel sieht und ändert niemand etwas
alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.messages enable row level security;

create policy "profile lesen" on public.profiles for select to authenticated using (true);
create policy "eigenes profil anlegen" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "eigenes profil ändern" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "eigene freundschaften" on public.friendships for select to authenticated using (auth.uid() in (a, b));
create policy "anfrage bestätigen" on public.friendships for update to authenticated using (b = auth.uid()) with check (b = auth.uid());
create policy "freundschaft beenden" on public.friendships for delete to authenticated using (auth.uid() in (a, b));

create policy "gruppen sehen" on public.groups for select to authenticated using (owner = auth.uid() or public.is_member(id));
create policy "gruppe gründen" on public.groups for insert to authenticated with check (owner = auth.uid());
create policy "gruppe ändern" on public.groups for update to authenticated using (owner = auth.uid());
create policy "gruppe löschen" on public.groups for delete to authenticated using (owner = auth.uid());

create policy "mitglieder sehen" on public.group_members for select to authenticated using (public.is_member(group_id));
create policy "selbst beitreten" on public.group_members for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.groups g where g.id = group_id and g.owner = auth.uid()));
create policy "gruppe verlassen" on public.group_members for delete to authenticated using (user_id = auth.uid());

create policy "nachrichten lesen" on public.messages for select to authenticated using (
  course is not null
  or (group_id is not null and public.is_member(group_id))
  or (to_user is not null and auth.uid() in (sender, to_user)));
create policy "nachricht senden" on public.messages for insert to authenticated with check (
  sender = auth.uid() and (
    course is not null
    or (group_id is not null and public.is_member(group_id))
    or (to_user is not null and public.are_friends(auth.uid(), to_user))));
create policy "eigene nachricht löschen" on public.messages for delete to authenticated using (sender = auth.uid());

-- Live-Updates für Chat und Freundschaftsanfragen
alter publication supabase_realtime add table public.messages, public.friendships;
