// StudyOS · Edge Function „kalender“: lädt einen abonnierten Stundenplan (.ics) für die App.
// Viele Kalender-Server (z. B. der FH-Stundenplan) erlauben keinen Abruf direkt aus dem Browser (CORS).
// Diese Funktion holt die Datei serverseitig und gibt sie mit CORS-Kopfzeilen zurück.
// Nur freigegebene Kalender-Server, nur https, höchstens 3 MB, nur echte Kalenderdateien: kein offener Proxy.
const ALLOW = [
  /(^|\.)fh-joanneum\.at$/i,
  /^calendar\.google\.com$/i,
  /^outlook\.(office365|live)\.com$/i,
  /^p\d+-caldav\.icloud\.com$/i,
];
const MAX = 3_000_000;
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};
const fail = (status: number, msg: string) => new Response(JSON.stringify({ error: msg }), { status, headers: { ...cors, "content-type": "application/json" } });
const allowed = (u: URL) => u.protocol === "https:" && ALLOW.some(r => r.test(u.hostname));

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "GET") return fail(405, "Nur GET");
  let u: URL;
  try { u = new URL((new URL(req.url).searchParams.get("url") || "").trim().replace(/^webcal:/i, "https:")); } catch { return fail(400, "Ungültiger Link"); }
  if (!allowed(u)) return fail(403, "Dieser Kalender-Server ist nicht freigegeben");
  let r: Response;
  try { r = await fetch(u, { headers: { "user-agent": "StudyOS-Kalender/1.0", accept: "text/calendar, */*" }, redirect: "follow", signal: AbortSignal.timeout(15000) }); }
  catch { return fail(504, "Kalender-Server nicht erreichbar"); }
  if (r.url && !allowed(new URL(r.url))) return fail(403, "Weiterleitung zu einem nicht freigegebenen Server");
  if (!r.ok) return fail(502, "Kalender-Server antwortet mit " + r.status);
  const buf = await r.arrayBuffer();
  if (buf.byteLength > MAX) return fail(413, "Kalender ist zu groß");
  const text = new TextDecoder().decode(buf);
  if (!/BEGIN:VCALENDAR/.test(text)) return fail(422, "Unter dem Link liegt keine Kalenderdatei");
  return new Response(text, { headers: { ...cors, "content-type": "text/calendar; charset=utf-8", "cache-control": "no-store" } });
});
