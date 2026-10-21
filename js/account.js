/* StudyOS v2 account: settings, PIN lock, sync, backup, optional AI, install, SW, Python loader */
(function () {
const { $, $$, esc, PAGES, CBY, COURSES } = App;
const S = () => App.S(), SEC = () => App.secrets();

/* ---------------- PIN lock ---------------- */
async function hash(pin) { const data = new TextEncoder().encode("studyos:" + pin); try { const h = await crypto.subtle.digest("SHA-256", data); return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join(""); } catch (e) { let x = 5381; for (const c of data) x = ((x << 5) + x + c) >>> 0; return "djb" + x; } }
/* Zuletzt entsperrt benutzt (nur dieses Gerät): Innerhalb der gewählten Zeit fragt StudyOS nach einem Neustart nicht erneut */
const SEEN = () => "studyos.seen." + (window.STUDYOS_PID || "x");
const graceMs = () => { const m = S().profile.lockAfterMin; return (m == null ? 5 : +m) * 60000; };
const markSeen = () => { if (App.locked || !S().profile.pinHash) return; try { localStorage.setItem(SEEN(), String(Date.now())); } catch (e) {} };
const recentlySeen = () => { let t = 0; try { t = +localStorage.getItem(SEEN()) || 0; } catch (e) {} return graceMs() > 0 && t && Date.now() - t < graceMs(); };
function lockScreen() {
  if (!S().profile.pinHash || $(".lockscreen")) return; App.locked = true; let pin = "", err = "";
  try { localStorage.removeItem(SEEN()); } catch (e) {}
  const box = document.createElement("div"); box.className = "lockscreen";
  const draw = () => { box.innerHTML = `<div class="lock-box"><div class="logo" style="width:56px;height:56px;font-size:24px;border-radius:14px">${window.STUDYOS_LOGO || "S"}</div><div><h2>StudyOS</h2><p class="muted">Hallo ${esc(S().name)}, PIN eingeben</p></div>
    <div class="pin-dots">${[0, 1, 2, 3].map(i => `<i class="${i < pin.length ? "on" : ""}"></i>`).join("")}${S().profile.pinLen > 4 ? [4, 5].slice(0, S().profile.pinLen - 4).map(i => `<i class="${i < pin.length ? "on" : ""}"></i>`).join("") : ""}</div><div class="pin-err">${esc(err)}</div>
    <div class="pin-pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map(k => k === "" ? "<span></span>" : `<button data-k="${k}" aria-label="${k === "⌫" ? "Löschen" : k}">${k}</button>`).join("")}</div>
    <button class="btn ghost sm" id="pin-forgot">PIN vergessen?</button></div>`; };
  const tryPin = async () => { if ((await hash(pin)) === S().profile.pinHash) { box.remove(); App.locked = false; App.lastActive = Date.now(); markSeen(); } else { err = "Falscher PIN"; pin = ""; draw(); } };
  box.addEventListener("click", async e => { const k = e.target.closest("[data-k]"); if (k) { if (k.dataset.k === "⌫") pin = pin.slice(0, -1); else if (pin.length < 6) pin += k.dataset.k; err = ""; draw(); if (pin.length === (S().profile.pinLen || 4)) tryPin(); }
    if (e.target.id === "pin-forgot") App.modal(`<h2>PIN vergessen</h2><p>Der PIN schützt StudyOS auf diesem Gerät. Ohne PIN kannst du nur alle lokalen Daten löschen. Wenn du Sync (GitHub Gist) eingerichtet hast, holst du deinen Stand danach von dort zurück.</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Abbrechen</button><button class="btn danger" id="wipe">Alles auf diesem Gerät löschen</button></div>`, m => { $("#wipe", m).onclick = () => { try { localStorage.clear(); } catch (e2) {} location.reload(); }; }); });
  const key = e => { if (!document.body.contains(box)) { window.removeEventListener("keydown", key); return; } if (/^\d$/.test(e.key) && pin.length < 6) { pin += e.key; draw(); if (pin.length === (S().profile.pinLen || 4)) tryPin(); } if (e.key === "Backspace") { pin = pin.slice(0, -1); draw(); } };
  window.addEventListener("keydown", key); draw(); document.body.appendChild(box);
}
App.lockScreen = lockScreen;
let hiddenAt = 0;
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") { hiddenAt = Date.now(); markSeen(); } else if (hiddenAt && S().profile.pinHash && Date.now() - hiddenAt >= graceMs()) lockScreen(); });
window.addEventListener("pagehide", markSeen); setInterval(() => { if (document.visibilityState === "visible") markSeen(); }, 30e3);

const LOCKS = [[0, "Sofort"], [5, "5 Min"], [15, "15 Min"], [60, "1 Std"], [240, "4 Std"], [1440, "1 Tag"]];
const lockMin = m => { m = m == null ? 5 : +m; return LOCKS.reduce((a, [x]) => Math.abs(x - m) < Math.abs(a - m) ? x : a, 5); };
const lockLabel = m => (LOCKS.find(([x]) => x === lockMin(m)) || [0, "5 Min"])[1].replace("Min", "Minuten").replace("Std", "Stunde" + (lockMin(m) > 60 ? "n" : "")).replace("1 Tag", "einem Tag");

/* ---------------- first-run onboarding ---------------- */
/* Name und Semester kommen schon vom Willkommensbildschirm; PIN und Installation stehen in den Einstellungen. */
function onboarding() {
  if (S().profile.onboarded) return;
  S().profile.onboarded = true; App.save();
}

/* ---------------- backup ---------------- */
function exportBackup() { App.download("studyos-backup-" + App.today() + ".json", JSON.stringify(S(), null, 1), "application/json"); S().profile.lastBackup = Date.now(); App.save(); }
function importBackup(file) { const rd = new FileReader(); rd.onload = () => { try { const obj = JSON.parse(rd.result); if (!obj || !obj.v) throw new Error("Keine StudyOS-Sicherung"); App.modal(`<h2>Sicherung einspielen?</h2><p>Stand vom ${new Date(obj.updatedAt || 0).toLocaleString("de-AT")}. Dein aktueller Stand auf diesem Gerät wird ersetzt.</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Abbrechen</button><button class="btn pri" id="imp-y">Ersetzen</button></div>`, (m, close) => { $("#imp-y", m).onclick = () => { App.replaceState(Object.assign(obj, { epoch: Date.now(), sync: S().sync })); close(); App.toast("Wiederhergestellt", "Sicherung eingespielt.", "↺"); }; }); } catch (e) { App.toast("Import fehlgeschlagen", e.message, "!"); } }; rd.readAsText(file); }

/* ---------------- GitHub Gist sync ---------------- */
const GIST_FILE = "studyos-state.json";
async function gh(path, opts = {}) { const r = await fetch("https://api.github.com" + path, Object.assign({}, opts, { headers: Object.assign({ Accept: "application/vnd.github+json", Authorization: "Bearer " + SEC().ghToken, "X-GitHub-Api-Version": "2022-11-28" }, opts.body ? { "Content-Type": "application/json" } : {}) })); if (!r.ok) throw new Error("GitHub " + r.status + (r.status === 401 ? ": Token ungültig" : r.status === 404 ? ": Gist nicht gefunden" : "")); return r.json(); }
async function pushGist() {
  const body = JSON.stringify(S()); const payload = { description: "StudyOS sync (private)", files: { [GIST_FILE]: { content: body } } };
  if (S().sync.gistId) await gh("/gists/" + S().sync.gistId, { method: "PATCH", body: JSON.stringify(payload) });
  else { const g = await gh("/gists", { method: "POST", body: JSON.stringify(Object.assign({ public: false }, payload)) }); S().sync.gistId = g.id; }
  S().sync.last = Date.now(); try { localStorage.setItem(App.STORE_KEY, JSON.stringify(S())); } catch (e) {}
}
async function pullGist() { const g = await gh("/gists/" + S().sync.gistId); const f = g.files[GIST_FILE]; if (!f) throw new Error("Datei fehlt im Gist"); let txt = f.content; if (f.truncated) txt = await (await fetch(f.raw_url)).text(); return JSON.parse(txt); }
let syncBusy = false;
/* Zwei Stände zusammenführen statt einen zu überschreiben: Fortschritt von beiden Geräten bleibt erhalten.
   Wurde auf einem Gerät zurückgesetzt oder eine Sicherung eingespielt (epoch), gewinnt dieser Stand ganz. */
const isObj = x => x && typeof x === "object" && !Array.isArray(x);
function deepUnion(older, newer) { const o = Object.assign({}, older); Object.keys(newer || {}).forEach(k => { o[k] = isObj(o[k]) && isObj(newer[k]) ? deepUnion(o[k], newer[k]) : newer[k]; }); return o; }
const perKey = (a, b, pick) => { const o = Object.assign({}, a || {}); Object.keys(b || {}).forEach(k => { o[k] = k in o ? pick(o[k], b[k]) : b[k]; }); return o; };
const unionList = (a, b) => { const seen = new Set(), out = []; (a || []).concat(b || []).forEach(x => { const k = isObj(x) && (x.id || x.ts) ? String(x.id || "") + "|" + String(x.ts || "") : JSON.stringify(x); if (!seen.has(k)) { seen.add(k); out.push(x); } }); return out.sort((x, y) => ((x && x.ts) || 0) - ((y && y.ts) || 0)); };
const MERGE = {
  xp: (a, b) => Math.max(a || 0, b || 0),
  lessons: (a, b) => perKey(a, b, (x, y) => Object.assign({}, x, y, { done: !!(x.done || y.done), read: !!(x.read || y.read), checks: Object.assign({}, x.checks, y.checks) })),
  days: (a, b) => perKey(a, b, (x, y) => { const o = Object.assign({}, x); Object.keys(y).forEach(k => { o[k] = typeof y[k] === "number" ? Math.max(o[k] || 0, y[k]) : y[k]; }); return o; }),
  topics: (a, b) => perKey(a, b, (x, y) => (y || []).length > (x || []).length ? y : x),
  cards: (a, b) => perKey(a, b, (x, y) => { const n = c => (c.reps || 0) + (c.lapses || 0); return n(y) > n(x) || (n(y) === n(x) && (y.due || 0) > (x.due || 0)) ? y : x; }),
  srs: (a, b) => perKey(a, b, (x, y) => (y.n || 0) > (x.n || 0) || ((y.n || 0) === (x.n || 0) && String(y.last || "") > String(x.last || "")) ? y : x),
  ach: (a, b) => perKey(a, b, (x, y) => Math.min(x, y)),
  quizHist: unionList, exams: unionList, imports: unionList
};
App.mergeStates = function (local, remote) {
  if ((remote.epoch || 0) !== (local.epoch || 0)) return (remote.epoch || 0) > (local.epoch || 0) ? remote : local;
  const newer = (remote.updatedAt || 0) > (local.updatedAt || 0) ? remote : local, older = newer === remote ? local : remote, out = {};
  new Set(Object.keys(local).concat(Object.keys(remote))).forEach(k => {
    const a = older[k], b = newer[k];
    if (a === undefined) out[k] = b; else if (b === undefined) out[k] = a;
    else if (MERGE[k]) out[k] = MERGE[k](a, b);
    else if (isObj(a) && isObj(b) && !["settings", "profile", "ui", "sync", "git", "notify", "ai"].includes(k)) out[k] = deepUnion(a, b);
    else out[k] = b;
  });
  out.updatedAt = Math.max(local.updatedAt || 0, remote.updatedAt || 0);
  return out;
};
async function syncNow(interactive) {
  if (!SEC().ghToken || syncBusy || !navigator.onLine) return; syncBusy = true; setSync("Synchronisiere …");
  try {
    if (S().sync.gistId) {
      const remote = await pullGist(), gid = S().sync.gistId, cur = JSON.stringify(S());
      const merged = App.mergeStates(JSON.parse(cur), remote);
      merged.sync = Object.assign({}, S().sync, { gistId: gid });
      merged.profile = Object.assign({}, merged.profile, { pinHash: S().profile.pinHash });
      if (JSON.stringify(merged) !== cur) App.replaceState(merged);
    }
    await pushGist(); setSync("Synchronisiert · " + new Date().toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }));
    if (interactive) App.toast("Synchronisiert", "Beide Geräte haben jetzt denselben Stand.", "⇅");
  } catch (e) { setSync("Sync-Fehler: " + e.message); if (interactive) App.toast("Sync-Fehler", e.message, "!"); }
  syncBusy = false;
}
/* Zweites Gerät verbinden: der QR-Code enthält einen Link mit Token und Gist-ID im #-Teil (wird nie an einen Server geschickt) */
const b64u = str => btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = str => decodeURIComponent(escape(atob(str.replace(/-/g, "+").replace(/_/g, "/"))));
function pairDialog() {
  const url = location.origin + location.pathname + "#pair=" + b64u(JSON.stringify({ t: SEC().ghToken, g: S().sync.gistId }));
  let svg = ""; try { const q = qrcode(0, "M"); q.addData(url); q.make(); svg = q.createSvgTag({ cellSize: 4, margin: 3, scalable: true }); } catch (e) {}
  App.modal(`<h2>Weiteres Gerät verbinden</h2><p>Scanne den Code mit der Kamera des Handys und öffne den Link. StudyOS übernimmt die Verbindung und lädt deinen Stand.</p>
    <div class="pair-qr">${svg}</div>
    <p class="muted" style="font-size:13px">Kein Scanner zur Hand? Link kopieren und auf dem anderen Gerät öffnen. Der Code enthält deinen Sync-Schlüssel, also nur selbst verwenden.</p>
    <div class="row" style="justify-content:flex-end"><button class="btn sm" id="pair-copy">Link kopieren</button><button class="btn pri sm" data-close>Fertig</button></div>`, m => {
    $("#pair-copy", m).onclick = () => { (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => App.toast("Kopiert", "Link in der Zwischenablage.", "⎘"), () => prompt("Link kopieren:", url)); };
  });
}
function takePairing() {
  let raw = null; try { raw = sessionStorage.getItem("studyos.pair"); sessionStorage.removeItem("studyos.pair"); } catch (e) {}
  if (!raw) return;
  try { const d = JSON.parse(unb64u(raw)); if (!d.t || !d.g) throw new Error("unvollständig"); SEC().ghToken = d.t; App.saveSecrets(); S().sync.gistId = d.g; App.save(); setSync("Verbunden"); setTimeout(() => syncNow(true), 300); }
  catch (e) { App.toast("Verbinden fehlgeschlagen", "Der Link ist ungültig. Bitte den QR-Code neu erzeugen.", "!"); }
}
const setSync = t => { const el = $("#sync"); if (el) el.textContent = t; };
let syncTimer; App.onSaved = () => { if (SEC().ghToken && S().sync.auto !== false) { clearTimeout(syncTimer); syncTimer = setTimeout(() => syncNow(false), 20000); } };

/* ---------------- optional AI ---------------- */
/* Zwei Wege: „omni“ = OmniRoute oder ein anderer OpenAI-kompatibler Dienst (lokal am PC und/oder online, ohne eigenen Anthropic-Schlüssel),
   „anthropic“ = eigener Anthropic-API-Schlüssel. Bei OmniRoute wird zuerst die lokale Adresse versucht, dann die Online-Adresse. */
const OMNI_LOCAL = "http://localhost:20128/v1";
const aiProv = () => S().ai.provider || (SEC().aiKey ? "anthropic" : "omni");
const omniBases = () => [S().ai.local === "" ? "" : (S().ai.local || OMNI_LOCAL), S().ai.online || ""].map(x => x.trim().replace(/\/+$/, "")).filter(Boolean);
App.aiReady = cid => { const c = CBY[cid]; if (!S().ai.enabled) return false; return aiProv() === "omni" ? omniBases().length > 0 : !!SEC().aiKey; };
async function omniCall(system, messages, maxTokens, only) {
  const bases = only ? [only] : omniBases(); let last = null;
  for (const base of bases) {
    try {
      const r = await fetch(base + "/chat/completions", { method: "POST", headers: Object.assign({ "content-type": "application/json" }, SEC().omniKey ? { authorization: "Bearer " + SEC().omniKey } : {}),
        body: JSON.stringify({ model: S().ai.omniModel || "auto", max_tokens: maxTokens, messages: [{ role: "system", content: system }].concat(messages) }) });
      if (!r.ok) { let m = "HTTP " + r.status; try { const j = await r.json(); m = (j.error && (j.error.message || j.error)) || m; } catch (e) {} throw new Error(m); }
      const j = await r.json(); S().ai.used = (S().ai.used || 0) + ((j.usage && j.usage.total_tokens) || 0); App.save();
      return ((j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "").trim() || "(keine Antwort)";
    } catch (e) { last = e; }
  }
  const m = String((last && last.message) || last || "");
  throw new Error(/fetch|network|load failed/i.test(m) ? (bases.length > 1 ? "OmniRoute ist weder am PC noch online erreichbar." : "OmniRoute ist nicht erreichbar. Läuft es auf diesem Gerät (omniroute im Terminal starten)?") : m);
}
async function aiCall(system, messages, maxTokens = 450) {
  if (aiProv() === "omni") return omniCall(system, messages, maxTokens);
  const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": SEC().aiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" }, body: JSON.stringify({ model: S().ai.model || "claude-haiku-4-5-20251001", max_tokens: maxTokens, system, messages }) });
  if (!r.ok) { let m = r.status + ""; try { m = (await r.json()).error.message; } catch (e) {} throw new Error(m); }
  const j = await r.json(); S().ai.used = (S().ai.used || 0) + (j.usage ? j.usage.input_tokens + j.usage.output_tokens : 0); App.save(); return j.content.map(x => x.text || "").join("");
}
function confirmAI(what) { return new Promise(res => { if (!S().ai.confirm) return res(true); App.modal(`<h2>KI-Anfrage senden?</h2><p>${esc(what)}</p><p class="muted" style="font-size:13px">${aiProv() === "omni" ? "Die Anfrage geht an dein OmniRoute" : "Die Anfrage geht mit deinem eigenen API-Schlüssel an Anthropic"} und verbraucht Tokens (bisher ca. ${(S().ai.used || 0).toLocaleString("de-AT")}). Ohne Bestätigung passiert nichts.</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" id="ai-n">Abbrechen</button><button class="btn pri" id="ai-y">Senden</button></div>`, (m, close) => { $("#ai-y", m).onclick = () => { close(); res(true); }; $("#ai-n", m).onclick = () => { close(); res(false); }; }); }); }
App.aiExplain = async (out, l, b) => { if (!(await confirmAI("Andere Erklärung für „" + b.h + "“ anfordern."))) return; out.textContent = "Denkt nach …"; try { out.textContent = await aiCall("Du bist Tutor für Wirtschaftsinformatik-Studierende an der FH JOANNEUM. Erkläre knapp (max. 110 Wörter), in der Sprache des Lernstoffs, mit einer Alltagsanalogie oder einem Zahlenbeispiel. Keine Überschriften.", [{ role: "user", content: "Lektion: " + l.title + "\nKonzept: " + b.h + "\nStoff: " + App.strip(b.levels.normal) }]); } catch (e) { out.textContent = "Fehler: " + e.message; } };
App.renderAssistant = (box, l) => {
  const c = CBY[l.course];
  if (!App.aiReady(l.course)) { box.innerHTML = `<h3>KI-Assistent (optional)</h3><p class="muted" style="font-size:14px">Aus. StudyOS funktioniert komplett ohne KI. Wenn du willst, verbindest du in den Einstellungen OmniRoute oder einen eigenen API-Schlüssel; jede Anfrage musst du dann bestätigen.</p><button class="btn ghost sm" data-go="settings">Einstellungen</button>`; return; }
  const log = [];
  box.innerHTML = `<div class="spread"><h3>Frag zur Lektion</h3><span class="chip">KI · bestätigt</span></div><div class="assist-log" id="alog"><div class="a muted">Frage zu „${esc(l.title)}“. Antworten bleiben kurz.</div></div><form class="row" id="aform" style="flex-wrap:nowrap"><input type="text" id="aq" placeholder="Deine Frage …" autocomplete="off"><button class="btn pri sm" type="submit">Fragen</button></form>`;
  const ctx = l.blocks.map(b => b.t === "text" ? b.h + ": " + App.strip(b.levels.normal) : b.html ? App.strip(b.html) : b.items ? b.items.map(App.strip).join("; ") : b.q ? "Q: " + App.strip(b.q) : "").filter(Boolean).join("\n").slice(0, 3500);
  $("#aform", box).onsubmit = async e => { e.preventDefault(); const q = $("#aq", box).value.trim(); if (!q) return; if (!(await confirmAI("Frage: „" + q.slice(0, 120) + "“"))) return; $("#aq", box).value = "";
    const L = $("#alog", box), u = document.createElement("div"); u.className = "u"; u.textContent = q; L.appendChild(u); const a = document.createElement("div"); a.className = "a"; a.textContent = "Denkt nach …"; L.appendChild(a); L.scrollTop = L.scrollHeight; log.push({ role: "user", content: q });
    try { const t = await aiCall(`Du bist ein knapper Lern-Assistent für den Kurs "${c.name}" (FH JOANNEUM). Lektion: "${l.title}". Inhalt:\n${ctx}\n\nAntworte in max. 120 Wörtern in der Sprache der Frage, ohne Überschriften. Bleib beim Thema. Bei bewerteten Aufgaben keine fertigen Lösungen, nur Hinweise.`, log.slice(-6)); a.textContent = t; log.push({ role: "assistant", content: t }); } catch (err) { a.textContent = "Fehler: " + err.message; log.pop(); } L.scrollTop = L.scrollHeight; };
};

/* ---------------- install / service worker ---------------- */
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; });
const standalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
function registerSW() {
  if (!("serviceWorker" in navigator) || !/^https?:/.test(location.protocol)) return;
  const hadCtrl = !!navigator.serviceWorker.controller; let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (hadCtrl && !reloaded) { reloaded = true; location.reload(); } });
  navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(reg => {
    reg.update().catch(() => {});
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") reg.update().catch(() => {}); });
    reg.addEventListener("updatefound", () => { const nw = reg.installing; nw && nw.addEventListener("statechange", () => { if (nw.state === "installed" && navigator.serviceWorker.controller) { const t = document.createElement("div"); t.className = "toast ach"; t.innerHTML = `<div class="ti">↻</div><div><div class="eyebrow">Update verfügbar</div><div>Neue Version von StudyOS.</div></div><button class="btn sm pri">Neu laden</button>`; $("button", t).onclick = () => location.reload(); $("#toasts").appendChild(t); } }); });
  }).catch(() => {});
}

/* ---------------- Python (Skulpt) lazy loader ---------------- */
let pyLoading = false;
function loadPython() { if (window.Sk || pyLoading || !navigator.onLine && !("caches" in window)) return; pyLoading = true; const s1 = document.createElement("script"); s1.src = "https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js"; s1.onload = () => { const s2 = document.createElement("script"); s2.src = "https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js"; document.head.appendChild(s2); }; s1.onerror = () => { pyLoading = false; }; document.head.appendChild(s1); }

/* ---------------- settings page ---------------- */
let resetAsk = false;
PAGES.settings = el => {
  const s = S(); const confirmReset = resetAsk; resetAsk = false;
  /* nach Änderungen die ganze Seite neu aufbauen, damit auch die Karten der anderen Module erhalten bleiben */
  const redraw = () => { const y = scrollY; App.render(); requestAnimationFrame(() => scrollTo(0, y)); };
  const draw = () => {
    el.innerHTML = `<div class="page" style="max-width:820px"><h1>Einstellungen</h1>
     <div class="card col"><h3>Profil</h3><div class="grid g2"><label class="fld">Name<input type="text" id="st-name" value="${esc(s.name)}"></label>${App.CALM ? "" : `<label class="fld">Tagesziel (XP)<input type="number" id="st-goal" min="10" step="10" value="${s.dailyGoal}"></label>`}</div></div>
     <div class="card"><h3>Lernen</h3>
      ${App.CALM ? "" : `<label class="switch"><div><div>Alle Lektionen freischalten</div><small>Für die Wiederholung vor Prüfungen.</small></div><input type="checkbox" class="tgl" id="st-unlock" ${s.settings.unlockAll ? "checked" : ""}></label>`}
      <div class="switch"><div><div>Standard-Erklärstufe</div></div><div class="lvl">${[["simple", "Einfach"], ["normal", "Normal"], ["technical", "Fachlich"]].map(([k, t]) => `<button data-lv="${k}" class="${s.settings.level === k ? "on" : ""}">${t}</button>`).join("")}</div></div>
      <div class="switch"><div><div>Erinnerungen & Benachrichtigungen</div><small>${s.notify.enabled ? "An · täglich " + s.notify.daily + " · " + s.notify.before.join("/") + " Tage vor Terminen" : "Aus"}</small></div><button class="btn sm" id="st-notif">Einstellen</button></div></div>
     <div class="card col lock-card"><h3>Sperre (PIN)</h3>
      <div class="lock-st ${s.profile.pinHash ? "on" : ""}"><span class="lock-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg></span>
        <div><b>${s.profile.pinHash ? "PIN ist aktiv" : "Kein PIN gesetzt"}</b><small>${s.profile.pinHash ? (lockMin(s.profile.lockAfterMin) === 0 ? "StudyOS fragt bei jedem Öffnen nach dem PIN." : "Nach " + lockLabel(s.profile.lockAfterMin) + " ohne Nutzung fragt StudyOS wieder nach dem PIN.") : "Mit PIN ist StudyOS auf diesem Gerät gesperrt, wenn du es länger nicht benutzt."} Eine Bildschirmsperre, keine Verschlüsselung.</small></div></div>
      ${s.profile.pinHash ? `<div class="switch lock-grace"><div><div>PIN erneut abfragen nach</div><small>Gilt fürs Schließen und Neustarten der App und wenn sie im Hintergrund war.</small></div><div class="lvl" role="radiogroup" aria-label="PIN erneut abfragen nach">${LOCKS.map(([m, t]) => `<button data-lock="${m}" role="radio" aria-checked="${lockMin(s.profile.lockAfterMin) === m}" class="${lockMin(s.profile.lockAfterMin) === m ? "on" : ""}">${t}</button>`).join("")}</div></div>` : ""}
      <div class="row lock-act"><input type="password" inputmode="numeric" maxlength="6" id="st-pin" placeholder="${s.profile.pinHash ? "Neuer PIN" : "PIN"} (4–6 Ziffern)" autocomplete="new-password"><button class="btn ${s.profile.pinHash ? "" : "pri"} sm" id="st-pinset">${s.profile.pinHash ? "PIN ändern" : "PIN setzen"}</button>${s.profile.pinHash ? `<span class="so-sp"></span><button class="btn ghost sm" id="st-lock">Jetzt sperren</button><button class="btn ghost sm" id="st-pinrm">PIN entfernen</button>` : ""}</div></div>
     <div class="card col"><h3>Sync zwischen Handy und Laptop</h3>
      <p class="muted" style="font-size:14px">Dein Fortschritt liegt lokal auf jedem Gerät. Zum Abgleichen nutzt StudyOS ein <b>privates GitHub Gist</b> in deinem eigenen GitHub-Konto. Einmal am Laptop verbinden, dann das Handy per QR-Code dazuholen. Danach gleicht die App automatisch ab und führt den Fortschritt beider Geräte zusammen, es geht nichts verloren.</p>
      <ol class="install-steps muted" style="font-size:13px"><li>github.com → Settings → Developer settings → Personal access tokens → <b>Tokens (classic)</b> → Generate new token</li><li>Nur den Scope <b>gist</b> anhaken, Ablaufdatum z. B. 1 Jahr</li><li>Token hier einfügen → „Verbinden“.</li><li>Auf diesem Gerät „Weiteres Gerät verbinden“ antippen und den QR-Code mit der Kamera des Handys scannen. Fertig.</li></ol>
      <div class="grid g2"><label class="fld">GitHub-Token (bleibt nur auf diesem Gerät)<input type="password" id="st-tok" value="${SEC().ghToken ? "••••••••" : ""}" placeholder="ghp_…"></label><label class="fld">Gist-ID (leer = neu anlegen)<input type="text" id="st-gist" value="${esc(s.sync.gistId || "")}"></label></div>
      <div class="row"><button class="btn pri sm" id="st-sync">${SEC().ghToken ? "Jetzt synchronisieren" : "Verbinden"}</button>${SEC().ghToken && s.sync.gistId ? `<button class="btn sm" id="st-pair">Weiteres Gerät verbinden (QR-Code)</button>` : ""}${SEC().ghToken ? `<button class="btn ghost sm" id="st-unsync">Trennen</button>` : ""}<small class="muted">${s.sync.last ? "Zuletzt: " + new Date(s.sync.last).toLocaleString("de-AT") : ""}</small></div>
      <div class="divider"></div><div class="spread"><div><b>Backup-Datei</b><div><small class="muted">Alternative ohne GitHub: exportieren und auf dem anderen Gerät importieren.${s.profile.lastBackup ? " Letztes Backup: " + new Date(s.profile.lastBackup).toLocaleDateString("de-AT") : ""}</small></div></div><div class="row"><button class="btn sm" id="st-exp">Exportieren</button><label class="btn sm">Importieren<input type="file" id="st-imp" accept=".json" hidden></label></div></div></div>
     <div class="card col"><h3>KI-Assistent (optional)</h3>
      <p class="muted" style="font-size:14px">Standardmäßig aus, StudyOS braucht keine KI. Jede Anfrage wird vorher abgefragt.</p>
      <label class="switch"><div><div>KI-Assistent aktivieren</div><small>Verbraucht: ca. ${(s.ai.used || 0).toLocaleString("de-AT")} Tokens</small></div><input type="checkbox" class="tgl" id="st-ai" ${s.ai.enabled ? "checked" : ""}></label>
      <div class="switch"><div><div>Verbindung</div><small>OmniRoute verteilt die Fragen auf freie KI-Anbieter, ohne eigenen Anthropic-Schlüssel.</small></div><div class="lvl st-seg" role="radiogroup" id="st-prov">${[["omni", "OmniRoute"], ["anthropic", "Anthropic-Schlüssel"]].map(([k, t]) => `<button role="radio" data-prov="${k}" class="${aiProv() === k ? "on" : ""}" aria-checked="${aiProv() === k}">${t}</button>`).join("")}</div></div>
      ${aiProv() === "omni" ? `<div class="grid g2"><label class="fld">Am PC (lokal)<input type="url" id="st-olocal" value="${esc(s.ai.local === "" ? "" : (s.ai.local || OMNI_LOCAL))}" placeholder="${OMNI_LOCAL}" spellcheck="false"></label>
        <label class="fld">Online (optional, z. B. für das Handy)<input type="url" id="st-oonline" value="${esc(s.ai.online || "")}" placeholder="https://dein-server/v1" spellcheck="false"></label>
        <label class="fld">Modell<input type="text" id="st-omodel" value="${esc(s.ai.omniModel || "auto")}" spellcheck="false"></label>
        <label class="fld">Schlüssel (nur falls dein OmniRoute einen verlangt)<input type="password" id="st-okey" value="${SEC().omniKey ? "••••••••" : ""}" autocomplete="off"></label></div>
        <small class="muted">StudyOS fragt zuerst OmniRoute am PC, ist das nicht erreichbar, die Online-Adresse. Starten am PC: <code>npm install -g omniroute</code>, dann <code>omniroute</code>. „auto“ wählt selbst einen freien Anbieter.</small>
        <div class="row"><button class="btn sm" id="st-otest">Verbindung testen</button><small class="muted" id="st-omsg" aria-live="polite"></small></div>`
      : `<div class="grid g2"><label class="fld">API-Schlüssel (bleibt nur auf diesem Gerät)<input type="password" id="st-key" value="${SEC().aiKey ? "••••••••" : ""}" placeholder="sk-ant-…"></label><label class="fld">Modell<input type="text" id="st-model" value="${esc(s.ai.model)}"></label></div>`}
      <label class="switch"><div><div>Vor jeder Anfrage nachfragen</div></div><input type="checkbox" class="tgl" id="st-aiconf" ${s.ai.confirm ? "checked" : ""}></label></div>
     <div class="card col" id="install"><h3>App installieren</h3>${installHTML()}</div>
     <div class="card col"><h3>Über</h3><p class="muted" style="font-size:14px">StudyOS · Version ${App.VERSION} (<a href="#news" data-go="news">Neuigkeiten</a>) · Kurse: ${COURSES.map(c => esc(c.short)).join(", ")}. Daten: nur lokal${SEC().ghToken ? " + dein privates Gist" : ""}. Neue Kurse kommen als Dateien in <code>courses/</code>.</p></div>
     <div class="card col"><h3>Zurücksetzen</h3>${confirmReset ? `<div class="confirm">Alles löschen (Fortschritt, Notizen, Termine, Pläne)? <button class="btn danger sm" id="st-yes">Endgültig löschen</button><button class="btn ghost sm" id="st-no">Abbrechen</button></div>` : `<div><button class="btn danger sm" id="st-reset">Fortschritt zurücksetzen …</button></div>`}</div></div>`;
    $("#st-name", el).oninput = e => { s.name = e.target.value.slice(0, 40) || "Student"; App.save(); App.renderSide(); };
    if ($("#st-goal", el)) $("#st-goal", el).onchange = e => { s.dailyGoal = App.clamp(+e.target.value || 50, 10, 1000); App.save(); };
    if ($("#st-unlock", el)) $("#st-unlock", el).onchange = e => { s.settings.unlockAll = e.target.checked; App.save(); };
    $$("[data-lv]", el).forEach(b => b.onclick = () => { s.settings.level = b.dataset.lv; App.save(); redraw(); });
    $("#st-notif", el).onclick = () => App.notifySettings();
    $("#st-pinset", el).onclick = async () => { const p = $("#st-pin", el).value.trim(); if (!/^\d{4,6}$/.test(p)) { App.toast("PIN", "4 bis 6 Ziffern.", "!"); return; } s.profile.pinHash = await hash(p); s.profile.pinLen = p.length; App.save(); App.toast("PIN gesetzt", "StudyOS ist jetzt gesperrt, wenn du es länger verlässt.", "🔒"); redraw(); };
    const rm = $("#st-pinrm", el); if (rm) rm.onclick = () => { s.profile.pinHash = null; App.save(); redraw(); };
    const lk = $("#st-lock", el); if (lk) lk.onclick = () => lockScreen();
    $$("[data-lock]", el).forEach(b => b.onclick = () => { s.profile.lockAfterMin = +b.dataset.lock; App.save(); markSeen(); redraw(); });
    $("#st-sync", el).onclick = async () => { const t = $("#st-tok", el).value.trim(); if (t && !t.startsWith("•")) SEC().ghToken = t; const gid = $("#st-gist", el).value.trim(); if (gid !== (s.sync.gistId || "")) { s.sync.gistId = gid || null; s.sync.last = 0; } App.saveSecrets(); if (!SEC().ghToken) { App.toast("Token fehlt", "Bitte GitHub-Token eintragen.", "!"); return; } await syncNow(true); redraw(); };
    const pr = $("#st-pair", el); if (pr) pr.onclick = pairDialog;
    const us = $("#st-unsync", el); if (us) us.onclick = () => { delete SEC().ghToken; App.saveSecrets(); redraw(); };
    $("#st-exp", el).onclick = exportBackup; $("#st-imp", el).onchange = e => e.target.files[0] && importBackup(e.target.files[0]);
    $("#st-ai", el).onchange = e => { s.ai.enabled = e.target.checked; App.save(); };
    $$("[data-prov]", el).forEach(b => b.onclick = () => { s.ai.provider = b.dataset.prov; App.save(); redraw(); });
    const ol = $("#st-olocal", el); if (ol) {
      ol.onchange = e => { s.ai.local = e.target.value.trim(); App.save(); };
      $("#st-oonline", el).onchange = e => { s.ai.online = e.target.value.trim(); App.save(); };
      $("#st-omodel", el).onchange = e => { s.ai.omniModel = e.target.value.trim() || "auto"; App.save(); };
      $("#st-okey", el).onchange = e => { const v = e.target.value.trim(); if (v && !v.startsWith("•")) SEC().omniKey = v; else if (!v) delete SEC().omniKey; App.saveSecrets(); };
      $("#st-otest", el).onclick = async () => { const msg = $("#st-omsg", el), res = [];
        for (const [name, base] of [["Am PC", (s.ai.local === "" ? "" : (s.ai.local || OMNI_LOCAL))], ["Online", s.ai.online || ""]]) {
          if (!base.trim()) continue; msg.textContent = name + ": teste …";
          try { const t = await omniCall("Antworte nur mit: OK", [{ role: "user", content: "Test" }], 10, base.trim().replace(/\/+$/, "")); res.push(name + " ✓ (" + t.slice(0, 20) + ")"); }
          catch (er) { res.push(name + " ✕ " + er.message); } }
        msg.textContent = res.join(" · ") || "Trag zuerst eine Adresse ein."; };
    }
    const ky = $("#st-key", el); if (ky) ky.onchange = e => { const v = e.target.value.trim(); if (v && !v.startsWith("•")) { SEC().aiKey = v; App.saveSecrets(); } if (!v) { delete SEC().aiKey; App.saveSecrets(); } };
    const md = $("#st-model", el); if (md) md.onchange = e => { s.ai.model = e.target.value.trim() || "claude-haiku-4-5-20251001"; App.save(); };
    $("#st-aiconf", el).onchange = e => { s.ai.confirm = e.target.checked; App.save(); };
    const ib = $("#st-install", el); if (ib) ib.onclick = async () => { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; redraw(); };
    const r = $("#st-reset", el); if (r) r.onclick = () => { resetAsk = true; redraw(); };
    const n = $("#st-no", el); if (n) n.onclick = () => redraw();
    const y = $("#st-yes", el); if (y) y.onclick = () => { const keep = { name: s.name, sync: s.sync, profile: s.profile, epoch: Date.now() }; App.replaceState(Object.assign({ v: 2 }, keep)); App.go("dash"); };
  };
  draw();
};
function installHTML() {
  if (standalone()) return `<p class="okline">StudyOS läuft als installierte App. 👍</p>`;
  if (location.protocol === "file:") return `<p class="muted" style="font-size:14px">Du nutzt gerade die Offline-Datei. Für die installierbare App (Handy + Laptop, Benachrichtigungen, offline) den Ordner einmal auf GitHub Pages hochladen – Anleitung liegt im Download (ANLEITUNG.md) und im Git-Labor übst du genau das.</p>`;
  return `${deferredPrompt ? `<div><button class="btn pri" id="st-install">StudyOS installieren</button></div>` : ""}
    <ul class="install-steps muted" style="font-size:14px"><li><b>Xiaomi / Android (Chrome):</b> Menü ⋮ → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“. Danach in den Android-Einstellungen Benachrichtigungen erlauben und beim Akku „Keine Einschränkungen“ wählen.</li><li><b>Laptop (Chrome/Edge):</b> Install-Symbol rechts in der Adressleiste oder Menü → „StudyOS installieren“.</li><li>Nach der Installation funktioniert alles offline. Updates lädt die App automatisch, wenn du online bist.</li></ul>`;
}

/* ---------------- boot hooks ---------------- */
App.VERSION = "4.5.0";
App.afterBoot.push(() => {
  registerSW();
  if (S().profile.pinHash) { if (recentlySeen()) markSeen(); else lockScreen(); } else onboarding();
  setTimeout(loadPython, 2500);
  takePairing();
  if (SEC().ghToken) setTimeout(() => syncNow(false), 1500);
  window.addEventListener("online", () => SEC().ghToken && syncNow(false));
  setSync(SEC().ghToken ? "Sync aktiv" : "Gespeichert auf diesem Gerät");
});
})();
