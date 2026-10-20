-- StudyOS Online · Update 5: Freundescode = sofort befreundet, Codes sind nicht mehr für alle lesbar.
-- In Supabase: SQL Editor -> New query -> alles einfügen -> Run. Mehrfaches Ausführen schadet nicht.
-- Danach empfohlen: Authentication -> Sign In / Providers -> "Allow anonymous sign-ins" AUSschalten (die App nutzt nur noch Konten).

-- Freundescodes in eigener Tabelle: jede Person sieht nur ihren eigenen
create table if not exists public.friend_codes (
  id uuid primary key references public.profiles on delete cascade,
  code text unique not null default upper(substr(md5(random()::text), 1, 8))
);
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'code') then
    insert into public.friend_codes (id, code) select id, code from public.profiles on conflict do nothing;
  end if;
end $$;
insert into public.friend_codes (id) select id from public.profiles on conflict do nothing;
alter table public.friend_codes enable row level security;
drop policy if exists "eigener code" on public.friend_codes;
create policy "eigener code" on public.friend_codes for select to authenticated using (id = auth.uid());

create or replace function public.profile_code() returns trigger
language plpgsql security definer set search_path = public as
$$ begin insert into friend_codes (id) values (new.id) on conflict do nothing; return new; end $$;
drop trigger if exists profiles_code on public.profiles;
create trigger profiles_code after insert on public.profiles for each row execute function public.profile_code();

create or replace function public.my_code() returns text
language sql stable security definer set search_path = public as
$$ select code from friend_codes where id = auth.uid() $$;

-- Wer einen Freundescode benutzt, ist sofort befreundet: den Code gibt man ja bewusst weiter
create or replace function public.add_friend(code text) returns uuid
language plpgsql security definer set search_path = public as
$$ declare f uuid;
begin
  select id into f from friend_codes where friend_codes.code = upper(add_friend.code);
  if f is null or f = auth.uid() then raise exception 'Unbekannter Code'; end if;
  update friendships set accepted = true where a = f and b = auth.uid();
  if not found then
    insert into friendships (a, b, accepted) values (auth.uid(), f, true) on conflict (a, b) do update set accepted = true;
  end if;
  return f;
end $$;

revoke execute on function public.my_code() from anon;
revoke execute on function public.add_friend(text) from anon;
grant execute on function public.my_code() to authenticated;
grant execute on function public.add_friend(text) to authenticated;

-- Offene Anfragen aus der Zeit davor gelten als angenommen
update public.friendships set accepted = true where not accepted;

-- Code nicht mehr in den öffentlich lesbaren Profilen
alter table public.profiles drop column if exists code;
