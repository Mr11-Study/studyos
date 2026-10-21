// StudyOS · Edge Function „push“: Mitteilungen aufs Gerät, auch wenn StudyOS geschlossen ist (Web Push).
// GET  → öffentlicher VAPID-Schlüssel für die App. Das Schlüsselpaar erzeugt die Funktion beim ersten Aufruf selbst
//        und legt es in public.push_keys ab (nur mit dem internen Service-Schlüssel lesbar, nie in der App).
// POST → kommt vom Datenbank-Trigger aus supabase-update-6.sql: { type: "message", id } oder { type: "friend", a, b, op }.
//        Die Funktion liest die Nachricht selbst aus der Datenbank, schickt sie nur an Empfänger, die sie sehen dürfen,
//        und nur einmal (push_log). Der offene Fach-Chat löst keine Mitteilungen aus.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (status, data) => new Response(JSON.stringify(data), { status, headers: { ...cors, "content-type": "application/json" } });
const db = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
const FRESH = 3 * 60 * 1000; /* nur ganz neue Nachrichten melden */

let vapid = null;
async function keys() {
  if (vapid) return vapid;
  let r = await db.from("push_keys").select("public_key, private_key").eq("id", 1).maybeSingle();
  if (!r.data) {
    const k = webpush.generateVAPIDKeys();
    await db.from("push_keys").insert({ id: 1, public_key: k.publicKey, private_key: k.privateKey });
    r = await db.from("push_keys").select("public_key, private_key").eq("id", 1).maybeSingle(); /* gewinnt bei gleichzeitigem Start der erste */
  }
  if (!r.data) throw new Error("push_keys fehlt (supabase-update-6.sql ausführen)");
  vapid = r.data; return vapid;
}
/* einmalig: schon gemeldete Ereignisse überspringen */
async function first(id) { const r = await db.from("push_log").insert({ id }); return !r.error; }
const nameOf = async id => ((await db.from("profiles").select("name").eq("id", id).maybeSingle()).data || {}).name || "Jemand";

async function send(users, note) {
  users = [...new Set(users)].filter(Boolean); if (!users.length) return 0;
  const k = await keys(), subs = (await db.from("push_subs").select("user_id, endpoint, p256dh, auth").in("user_id", users)).data || [];
  let n = 0;
  await Promise.all(subs.map(async s => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(note),
        { vapidDetails: { subject: "mailto:studyos@users.noreply.github.com", publicKey: k.public_key, privateKey: k.private_key }, TTL: 6 * 3600, urgency: "high", topic: String(note.tag || "so").replace(/[^\w-]/g, "").slice(0, 32) });
      n++;
    } catch (e) { if (e && (e.statusCode === 404 || e.statusCode === 410)) await db.from("push_subs").delete().eq("endpoint", s.endpoint); }
  }));
  return n;
}
async function onMessage(id) {
  const m = (await db.from("messages").select("id, sender, to_user, group_id, body, file, created_at").eq("id", id).maybeSingle()).data;
  if (!m || (!m.to_user && !m.group_id) || Date.now() - Date.parse(m.created_at) > FRESH) return 0;
  if (!(await first("m:" + m.id))) return 0;
  const who = await nameOf(m.sender), text = m.body ? String(m.body).slice(0, 160) : m.file ? "📎 " + (m.file.name || "Anhang") : "Neue Nachricht";
  if (m.to_user) return send([m.to_user], { title: who, body: text, chat: "dm:" + m.sender, tag: "so-dm:" + m.sender });
  const g = (await db.from("groups").select("name").eq("id", m.group_id).maybeSingle()).data;
  const mem = ((await db.from("group_members").select("user_id").eq("group_id", m.group_id)).data || []).map(r => r.user_id).filter(u => u !== m.sender);
  return send(mem, { title: (g && g.name) || "Gruppe", body: who + ": " + text, chat: "g:" + m.group_id, tag: "so-g:" + m.group_id });
}
async function onFriend(a, b, op) {
  const f = (await db.from("friendships").select("a, b, accepted").eq("a", a).eq("b", b).maybeSingle()).data; if (!f) return 0;
  if (!(await first("f:" + a + ":" + b + ":" + f.accepted + ":" + new Date().toISOString().slice(0, 10)))) return 0;
  if (op === "UPDATE") return f.accepted ? send([a], { title: "Neuer Freund", body: (await nameOf(b)) + " hat deine Anfrage angenommen.", chat: "dm:" + b, tag: "so-dm:" + b }) : 0;
  return send([b], f.accepted ? { title: "Neuer Freund", body: (await nameOf(a)) + " hat dich als Freund hinzugefügt.", chat: "dm:" + a, tag: "so-dm:" + a }
    : { title: "Freundschaftsanfrage", body: (await nameOf(a)) + " möchte mit dir befreundet sein.", chat: "dm:" + a, tag: "so-dm:" + a });
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    if (req.method === "GET") return json(200, { key: (await keys()).public_key });
    if (req.method !== "POST") return json(405, { error: "Nur GET oder POST" });
    const d = await req.json().catch(() => ({}));
    if (Math.random() < 0.05) await db.from("push_log").delete().lt("at", new Date(Date.now() - 3 * 864e5).toISOString()); /* Protokoll klein halten */
    if (d.type === "message" && d.id) return json(200, { sent: await onMessage(d.id) });
    if (d.type === "friend" && d.a && d.b) return json(200, { sent: await onFriend(d.a, d.b, d.op) });
    return json(400, { error: "Unbekanntes Ereignis" });
  } catch (e) { return json(500, { error: String((e && e.message) || e) }); }
});
