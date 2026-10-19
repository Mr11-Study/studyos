// StudyOS · Edge Function „aufraeumen“: löscht Chat-Anhänge, die älter als 24 Stunden sind, aus dem Speicher „chat“.
// Läuft in Supabase mit dem dort automatisch hinterlegten Service-Schlüssel; der Schlüssel steht nirgends im Code.
// Wird stündlich von pg_cron aufgerufen (supabase-update-3.sql). Ein Aufruf von außen löscht nur ohnehin abgelaufene Dateien.
import { createClient } from "jsr:@supabase/supabase-js@2";

const DAY = 24 * 60 * 60 * 1000;

Deno.serve(async () => {
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const cutoff = Date.now() - DAY;
  let removed = 0;
  const { data: folders, error } = await sb.storage.from("chat").list("", { limit: 1000 });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  for (const folder of folders ?? []) {
    const { data: files } = await sb.storage.from("chat").list(folder.name, { limit: 1000 });
    const old = (files ?? []).filter(f => f.created_at && new Date(f.created_at).getTime() < cutoff).map(f => `${folder.name}/${f.name}`);
    if (old.length) { await sb.storage.from("chat").remove(old); removed += old.length; }
  }
  return new Response(JSON.stringify({ removed }), { headers: { "Content-Type": "application/json" } });
});
