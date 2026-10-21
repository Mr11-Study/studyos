-- StudyOS · Update 6: Mitteilungen aufs Gerät, auch wenn StudyOS geschlossen ist (Web Push)
-- Einmal im Supabase SQL Editor ausführen (Run). Danach die Edge Function „push“ anlegen (siehe ANLEITUNG.md).
-- Der eingetragene Schlüssel ist der öffentliche anon key, den auch die App benutzt.

create extension if not exists pg_net with schema extensions;

-- Push-Abos: welches Gerät Mitteilungen für welches Konto bekommt. Jeder sieht und ändert nur seine eigenen.
create table if not exists public.push_subs (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  endpoint text not null check (char_length(endpoint) <= 1000),
  p256dh text not null check (char_length(p256dh) <= 200),
  auth text not null check (char_length(auth) <= 100),
  created_at timestamptz not null default now(),
  primary key (user_id, endpoint)
);
alter table public.push_subs enable row level security;
drop policy if exists "push_subs eigene" on public.push_subs;
create policy "push_subs eigene" on public.push_subs for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Schlüsselpaar und Protokoll: nur für die Edge Function (Service-Schlüssel), für die App unsichtbar.
create table if not exists public.push_keys (id int primary key, public_key text not null, private_key text not null);
create table if not exists public.push_log (id text primary key, at timestamptz not null default now());
alter table public.push_keys enable row level security;
alter table public.push_log enable row level security;
revoke all on public.push_keys, public.push_log from anon, authenticated;

-- Neue Direkt- und Gruppennachrichten sowie Freundschaften an die Edge Function melden (nur die ID, den Rest liest sie selbst).
create or replace function public.push_notify() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform net.http_post(
    url := 'https://nanknvsfotrcyxjzwsyd.supabase.co/functions/v1/push',
    body := case when tg_table_name = 'messages' then jsonb_build_object('type', 'message', 'id', new.id)
                 else jsonb_build_object('type', 'friend', 'a', new.a, 'b', new.b, 'op', tg_op) end,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmtudnNmb3RyY3l4anp3c3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MzY4NDUsImV4cCI6MjEwODAxMjg0NX0.jm2jc4Fix2W1JuawR8a3kYT1pkAfabnDMnZjK38pGGk'),
    timeout_milliseconds := 5000);
  return new;
exception when others then
  return new; -- eine Mitteilung darf nie das Senden einer Nachricht verhindern
end $$;

drop trigger if exists push_on_message on public.messages;
create trigger push_on_message after insert on public.messages
  for each row when (new.course is null) execute function public.push_notify();
drop trigger if exists push_on_friend on public.friendships;
create trigger push_on_friend after insert or update of accepted on public.friendships
  for each row execute function public.push_notify();
