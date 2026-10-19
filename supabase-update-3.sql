-- StudyOS Online · Update 3: abgelaufene Chat-Dateien stündlich wirklich aus dem Speicher löschen.
-- Vorher in Supabase die Edge Function „aufraeumen“ anlegen (Code: aufraeumen.ts). Dann hier: SQL Editor -> einfügen -> Run.
create extension if not exists pg_net with schema extensions;
select cron.schedule('studyos-dateien-loeschen', '27 * * * *', $$
  select net.http_post(
    url := 'https://nanknvsfotrcyxjzwsyd.supabase.co/functions/v1/aufraeumen',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmtudnNmb3RyY3l4anp3c3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MzY4NDUsImV4cCI6MjEwODAxMjg0NX0.jm2jc4Fix2W1JuawR8a3kYT1pkAfabnDMnZjK38pGGk"}'::jsonb,
    body := '{}'::jsonb);
$$);
