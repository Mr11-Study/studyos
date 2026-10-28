/* StudyOS service worker: offline shell, runtime cache, background reminders */
const VERSION = "studyos-v4.42.0";
const SHELL = ["./", "index.html", "manifest.webmanifest", "css/app.css", "css/study.css", "css/welcome.css", "css/kotlin.css", "css/apps.css", "css/figs.css", "css/maple.css", "css/polish.css", "js/calendar.js", "js/maple.js", "js/maple-ui.js", "js/mathexam.js", "js/bwlalt.js", "courses/math2.js", "courses/math2/k1-diff.js", "courses/math2/k2-num.js", "courses/math2/k3-int.js", "courses/math2/k4-cg.js", "courses/math2/k5-markov.js", "courses/math2/figs.js", "courses/math2/eigene.js", "courses/math2/sheets.js", "courses/math2/prep.js", "js/figs.js", "js/calc.js", "js/avatar.js", "js/extras.js", "js/social.js", "js/calsync.js", "js/vendor/supabase.js", "js/vendor/jsqr.js", "icons/logo.svg", "icons/v2/favicon-32.png", "courses/plus/bwl2.js", "courses/plus/bwl2-figs2.js", "courses/plus/bwl2-v2.js", "courses/plus/dasc.js", "courses/plus/kommu.js", "courses/plus/eng3.js", "courses/plus/mappdev.js", "courses/plus/dbaent.js", "courses/plus/itinf.js", "courses/plus/pmgt.js", "courses/plus/ufo.js", "courses/plus/mmprov.js", "courses/plus/sunw2.js", "courses/itinf/figs-v1.js", "courses/itinf/figs-v2v3.js",
  "courses/dasc.js", "courses/kommu.js", "courses/eng3.js", "courses/bwl2.js", "courses/mappdev.js", "courses/dbaent.js", "courses/itinf.js", "courses/pmgt.js", "courses/ufo.js", "courses/mmprov.js", "courses/sunw2.js", "courses/prep-bwl2.js", "courses/prep-mappdev.js", "courses/prep-dbaent.js", "courses/prep-itinf.js", "courses/prep-pmgt.js", "courses/prep-ufo.js", "courses/prep-mmprov.js", "courses/prep-sunw2.js", "courses/prep-dasc.js", "courses/prep-kommu.js", "courses/prep-eng3.js", "courses/clean-uni.js", "courses/deep-dasc.js", "courses/deep-kommu.js", "courses/deep-eng3.js", "courses/deep-bwl2.js", "courses/deep-mappdev.js", "courses/deep-dbaent.js", "courses/deep-itinf.js", "courses/deep-pmgt.js", "courses/deep-ufo.js", "courses/deep-mmprov.js", "courses/deep-sunw2.js", "courses/mappdev/k02-grundlagen.js", "courses/mappdev/k05-oop.js", "courses/itinf/v1-cloud-concepts.js", "courses/itinf/v2-azure-architektur.js", "courses/itinf/v3-governance-identitaet.js", "courses/itinf/mc-v1.js", "courses/itinf/mc-v2.js", "courses/itinf/mc-v3.js", "courses/itinf/mc-mix.js", "courses/ext-apply.js", "courses/deep-apply.js",
  "js/guard.js", "js/boot.js", "js/core.js", "js/w-generic.js", "js/w-bwlgen.js", "js/w-dasc1.js", "js/w-dasc2.js", "js/w-dasc3.js", "js/pages.js", "js/planner.js", "js/gitlab.js", "js/vendor/qrcode.js", "js/account.js", "js/reset.js", "js/study.js", "js/kotlin.js", "js/profiles.js", "js/quicktest.js", "js/changelog.js", "js/i18n.js", "js/apps.js", "js/settings-ui.js",
  "icons/v2/icon-192.png", "icons/v2/icon-512.png", "icons/v2/maskable-512.png"];
/* Update: "no-cache" fragt beim Server nur nach, ob sich eine Datei geändert hat (ETag). Unveränderte Dateien kommen als
   kurze 304-Antwort aus dem Browser-Cache, nur geänderte werden neu geladen. Früher wurden bei jedem Update alle ~6 MB geladen. */
/* Neue Versionen warten, bis die App sie übernimmt (beim Start oder nach dem Tippen auf „Neu laden“), statt sie mitten in der Nutzung neu zu laden.
   Nur der Umstieg von Versionen vor 4.41 übernimmt sofort, weil deren Seite das Warten noch nicht kennt. */
const vnum = k => (/studyos-v(\d+)\.(\d+)\.(\d+)/.exec(k) || []).slice(1).reduce((a, x) => a * 1000 + +x, 0);
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "no-cache" }))))
  .then(() => caches.keys()).then(keys => { const old = keys.filter(k => k.startsWith("studyos-v") && k !== VERSION); if (old.length && old.every(k => vnum(k) < vnum("studyos-v4.41.0"))) return self.skipWaiting(); })); });
self.addEventListener("message", e => { if (e.data === "skip-waiting") self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => (k.startsWith("studyos-v") && k !== VERSION) || k.startsWith("studyos-tcg")).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname === "api.github.com" || url.hostname === "api.anthropic.com") return;
  if (req.mode === "navigate") { e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put("index.html", cp)); return r; }).catch(() => caches.match("index.html"))); return; }
  /* Eigene Dateien: sofort aus dem Offline-Speicher. Jede Änderung bekommt eine neue VERSION und kommt über "install" an,
     darum fragt StudyOS beim Start nicht mehr ~100-mal beim Server nach (spart Daten und Akku am Handy). */
  if (url.origin === location.origin) { e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok && r.type === "basic") { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); } return r; }))); return; }
  if (/cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(url.hostname)) { e.respondWith(caches.open("studyos-runtime").then(c => c.match(req).then(hit => { const net = fetch(req).then(r => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }).catch(() => hit); return hit || net; }))); }
});
async function checkReminders() {
  const c = await caches.open("studyos-data"); const r = await c.match("./__reminders.json"); if (!r) return; const d = await r.json(); if (!d.enabled) return;
  const sr = await c.match("./__swsent.json"); const sent = sr ? await sr.json() : {}; const now = Date.now(); let n = 0;
  for (const x of d.list) { if (x.at <= now && x.at > now - 36 * 3600e3 && !d.sent[x.key] && !sent[x.key]) { if (x.daily && d.today === new Date().toISOString().slice(0, 10) && d.xpToday > 0) continue; await self.registration.showNotification(x.title, { body: x.body, tag: x.tag, icon: "icons/v2/icon-192.png", badge: "icons/v2/icon-192.png", data: { url: "./#dash" } }); sent[x.key] = now; n++; } }
  if (n) await c.put("./__swsent.json", new Response(JSON.stringify(sent), { headers: { "Content-Type": "application/json" } }));
}
self.addEventListener("periodicsync", e => { if (e.tag === "studyos-reminders") e.waitUntil(checkReminders()); });
self.addEventListener("message", e => { if (e.data === "check-reminders") e.waitUntil(checkReminders()); });
/* Web Push vom Server (Edge Function „push“): neue Chat-Nachricht, auch wenn StudyOS geschlossen ist.
   Ist StudyOS gerade sichtbar im Vordergrund, zeigt die App selbst den Hinweis. */
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (er) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    if (list.some(c => c.visibilityState === "visible" && c.focused)) return;
    return self.registration.showNotification(d.title || "StudyOS", { body: d.body || "Neue Nachricht", tag: d.tag || "so", renotify: true, icon: "icons/v2/icon-192.png", badge: "icons/v2/icon-192.png", data: d.chat ? { chat: d.chat, url: "./#chat=" + d.chat } : { url: "./#together" } });
  }));
});
self.addEventListener("notificationclick", e => { e.notification.close(); const chat = e.notification.data && e.notification.data.chat;
  if (chat) { e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => { const w = list.find(x => "focus" in x); if (w) { w.postMessage({ type: "open-chat", chat }); return w.focus(); } return self.clients.openWindow("./#chat=" + chat); })); return; }
  const url = (e.notification.data && e.notification.data.url) || "./"; e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => { for (const w of list) { if ("focus" in w) { w.navigate && w.navigate(url); return w.focus(); } } return self.clients.openWindow(url); })); });
