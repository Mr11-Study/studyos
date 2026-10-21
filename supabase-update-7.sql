-- StudyOS · Update 7: KI-Hilfe für alle über deinen OmniRoute-Server (dein PC + Tunnel)
-- Einmal im Supabase SQL Editor ausführen (Run). Ganz unten erscheint dein geheimes Server-Token:
-- das kommt in tools/ki-server.ps1 (Zeile $Token = "..."). Niemandem weitergeben.

-- Adresse deines Servers. Nur die Edge Function „ki“ (Service-Schlüssel) kann sie lesen, die App nie.
create table if not exists public.ki_cfg (
  id int primary key check (id = 1),
  url text,
  key text,
  token text not null default encode(extensions.gen_random_bytes(24), 'hex'),
  updated_at timestamptz not null default now()
);
insert into public.ki_cfg (id) values (1) on conflict do nothing;
alter table public.ki_cfg enable row level security;
revoke all on public.ki_cfg from anon, authenticated;

-- Tageszähler pro Konto (für das Limit in der Edge Function)
create table if not exists public.ki_usage (
  user_id uuid not null references auth.users on delete cascade,
  day date not null,
  n int not null default 0,
  primary key (user_id, day)
);
alter table public.ki_usage enable row level security;
revoke all on public.ki_usage from anon, authenticated;

-- Das Startskript meldet hiermit die aktuelle Tunnel-Adresse. Ohne richtiges Token passiert nichts.
create or replace function public.set_ki_url(t text, u text, k text default null) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if u is not null and u !~ '^https://[A-Za-z0-9.-]+(:[0-9]+)?(/.*)?$' then raise exception 'Adresse muss mit https:// beginnen'; end if;
  update ki_cfg set url = u, key = coalesce(k, key), updated_at = now() where id = 1 and token = t;
  return found;
end $$;
revoke all on function public.set_ki_url(text, text, text) from public;
grant execute on function public.set_ki_url(text, text, text) to anon, authenticated;

-- Dein Token (in tools/ki-server.ps1 eintragen):
select token as dein_server_token from public.ki_cfg where id = 1;
