/* StudyOS service worker: offline shell, runtime cache, background reminders */
const VERSION = "studyos-v3.4.0";
const SHELL = ["./", "index.html", "manifest.webmanifest", "css/app.css", "css/craft.css", "css/tcg.css",
  "courses/dasc.js", "courses/kommu.js", "courses/eng3.js", "courses/bwl2.js", "courses/knit.js", "courses/crochet.js", "courses/tcg-guide.js",
  "js/core.js", "js/w-generic.js", "js/w-dasc1.js", "js/w-dasc2.js", "js/w-dasc3.js", "js/pages.js", "js/planner.js", "js/gitlab.js", "js/account.js", "js/reset.js", "js/profiles.js", "js/yarn3d.js", "js/craft-tech.js", "js/craft.js", "js/craft-pages.js", "js/craft-illu.js", "js/tcg.js", "js/nogame.js", "js/infolib.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("studyos-v") && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname === "api.github.com" || url.hostname === "api.anthropic.com") return;
  if (req.mode === "navigate") { e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put("index.html", cp)); return r; }).catch(() => caches.match("index.html"))); return; }
  if (url.origin === location.origin) { e.respondWith(caches.match(req).then(hit => { const net = fetch(req, { cache: "no-cache" }).then(r => { if (r.ok) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); } return r; }).catch(() => hit); return hit || net; })); return; }
  if (url.hostname === "raw.githubusercontent.com") { const isMeta = /meta\.json$/.test(url.pathname), key = isMeta ? url.origin + url.pathname : req; e.respondWith(fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open("studyos-tcgdata").then(c => c.put(key, cp)); } return r; }).catch(() => caches.open("studyos-tcgdata").then(c => c.match(key)))); return; }
  if (url.hostname === "assets.tcgdex.net" || url.hostname === "tcgplayer-cdn.tcgplayer.com") { e.respondWith(caches.open("studyos-tcgimg").then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; })))); return; }
  if (/cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(url.hostname)) { e.respondWith(caches.open("studyos-runtime").then(c => c.match(req).then(hit => { const net = fetch(req).then(r => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }).catch(() => hit); return hit || net; }))); }
});
async function checkReminders() {
  const c = await caches.open("studyos-data"); const r = await c.match("./__reminders.json"); if (!r) return; const d = await r.json(); if (!d.enabled) return;
  const sr = await c.match("./__swsent.json"); const sent = sr ? await sr.json() : {}; const now = Date.now(); let n = 0;
  for (const x of d.list) { if (x.at <= now && x.at > now - 36 * 3600e3 && !d.sent[x.key] && !sent[x.key]) { if (x.daily && d.today === new Date().toISOString().slice(0, 10) && d.xpToday > 0) continue; await self.registration.showNotification(x.title, { body: x.body, tag: x.tag, icon: "icons/icon-192.png", badge: "icons/icon-192.png", data: { url: "./#dash" } }); sent[x.key] = now; n++; } }
  if (n) await c.put("./__swsent.json", new Response(JSON.stringify(sent), { headers: { "Content-Type": "application/json" } }));
}
self.addEventListener("periodicsync", e => { if (e.tag === "studyos-reminders") e.waitUntil(checkReminders()); });
self.addEventListener("message", e => { if (e.data === "check-reminders") e.waitUntil(checkReminders()); });
self.addEventListener("notificationclick", e => { e.notification.close(); const url = (e.notification.data && e.notification.data.url) || "./"; e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => { for (const w of list) { if ("focus" in w) { w.navigate && w.navigate(url); return w.focus(); } } return self.clients.openWindow(url); })); });
