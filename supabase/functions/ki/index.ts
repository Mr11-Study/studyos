// StudyOS · Edge Function „ki“: KI-Hilfe für alle angemeldeten Nutzer über den OmniRoute-Server des Betreibers.
// Der Server läuft auf dem PC des Betreibers und ist über einen Tunnel erreichbar. Seine aktuelle Adresse meldet das
// Startskript (tools/ki-server.ps1) mit einem geheimen Token an public.ki_cfg (supabase-update-7.sql).
// Die App kennt die Adresse nie. Pro Konto gilt ein Tageslimit, anonyme Aufrufe werden abgelehnt.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const LIMIT = 60;          /* Fragen pro Konto und Tag */
const MAX_TOKENS = 700;
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (status, data) => new Response(JSON.stringify(data), { status, headers: { ...cors, "content-type": "application/json" } });
const db = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

async function server() {
  const c = (await db.from("ki_cfg").select("url, key, updated_at").eq("id", 1).maybeSingle()).data;
  return c && c.url ? c : null;
}
async function alive(c) {
  /* jede Antwort von OmniRoute zählt; 502–504/530 kommen vom Tunnel, wenn der PC nicht antwortet */
  try { const r = await fetch(c.url.replace(/\/+$/, "") + "/v1/models", { headers: c.key ? { authorization: "Bearer " + c.key } : {}, signal: AbortSignal.timeout(12000) }); return ![502, 503, 504, 530].includes(r.status); }
  catch { return false; }
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const c = await server();
    if (req.method === "GET") return json(200, { online: !!c && await alive(c), limit: LIMIT });
    if (req.method !== "POST") return json(405, { error: "Nur GET oder POST" });
    /* nur echte Konten (E-Mail), keine Gäste */
    const jwt = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    const u = (await db.auth.getUser(jwt)).data.user;
    if (!u || u.is_anonymous || !u.email) return json(401, { error: "login" });
    if (!c) return json(503, { error: "offline" });
    const day = new Date().toISOString().slice(0, 10);
    const used = (await db.from("ki_usage").select("n").eq("user_id", u.id).eq("day", day).maybeSingle()).data;
    if (used && used.n >= LIMIT) return json(429, { error: "limit", limit: LIMIT });
    const d = await req.json().catch(() => ({}));
    const messages = (Array.isArray(d.messages) ? d.messages : []).slice(-12)
      .filter(m => m && ["system", "user", "assistant"].includes(m.role) && typeof m.content === "string")
      .map(m => ({ role: m.role, content: m.content.slice(0, 8000) }));
    if (!messages.length) return json(400, { error: "Keine Frage" });
    /* stream: die Antwort wird Stück für Stück durchgereicht, so erscheinen die ersten Wörter sofort */
    const stream = d.stream === true;
    let r;
    try {
      r = await fetch(c.url.replace(/\/+$/, "") + "/v1/chat/completions", { method: "POST", signal: AbortSignal.timeout(stream ? 120000 : 60000),
        headers: { "content-type": "application/json", ...(c.key ? { authorization: "Bearer " + c.key } : {}) },
        body: JSON.stringify({ model: "auto", max_tokens: Math.min(+d.max_tokens || 450, MAX_TOKENS), messages, stream }) });
    } catch { return json(503, { error: "offline" }); }
    if (r.ok && stream && (r.headers.get("content-type") || "").includes("text/event-stream") && r.body) {
      await db.from("ki_usage").upsert({ user_id: u.id, day, n: ((used && used.n) || 0) + 1 });
      return new Response(r.body, { status: 200, headers: { ...cors, "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-cache", "x-ki-left": String(LIMIT - ((used && used.n) || 0) - 1) } });
    }
    if (!r.ok) { let m = "HTTP " + r.status; try { const j = await r.json(); m = (j.error && (j.error.message || j.error)) || m; } catch {} return json(502, { error: String(m).slice(0, 200) }); }
    const j = await r.json();
    await db.from("ki_usage").upsert({ user_id: u.id, day, n: ((used && used.n) || 0) + 1 });
    const text = ((j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "").trim();
    return json(200, { text: text || "(keine Antwort)", left: LIMIT - ((used && used.n) || 0) - 1 });
  } catch (e) { return json(500, { error: String((e && e.message) || e) }); }
});
