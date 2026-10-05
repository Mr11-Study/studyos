/* StudyOS v2 account: settings, PIN lock, sync, backup, optional AI, install, SW, Python loader */
(function () {
const { $, $$, esc, PAGES, CBY, COURSES } = App;
const S = () => App.S(), SEC = () => App.secrets();

/* ---------------- PIN lock ---------------- */
async function hash(pin) { const data = new TextEncoder().encode("studyos:" + pin); try { const h = await crypto.subtle.digest("SHA-256", data); return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join(""); } catch (e) { let x = 5381; for (const c of data) x = ((x << 5) + x + c) >>> 0; return "djb" + x; } }
function lockScreen() {
  if (!S().profile.pinHash || $(".lockscreen")) return; App.locked = true; let pin = "", err = "";
  const box = document.createElement("div"); box.className = "lockscreen";
  const draw = () => { box.innerHTML = `<div class="lock-box"><div class="logo" style="width:56px;height:56px;font-size:24px;border-radius:14px">S</div><div><h2>StudyOS</h2><p class="muted">Hallo ${esc(S().name)}, PIN eingeben</p></div>
    <div class="pin-dots">${[0, 1, 2, 3].map(i => `<i class="${i < pin.length ? "on" : ""}"></i>`).join("")}${S().profile.pinLen > 4 ? [4, 5].slice(0, S().profile.pinLen - 4).map(i => `<i class="${i < pin.length ? "on" : ""}"></i>`).join("") : ""}</div><div class="pin-err">${esc(err)}</div>
    <div class="pin-pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map(k => k === "" ? "<span></span>" : `<button data-k="${k}" aria-label="${k === "⌫" ? "Löschen" : k}">${k}</button>`).join("")}</div>
    <button class="btn ghost sm" id="pin-forgot">PIN vergessen?</button></div>`; };
  const tryPin = async () => { if ((await hash(pin)) === S().profile.pinHash) { box.remove(); App.locked = false; App.lastActive = Date.now(); } else { err = "Falscher PIN"; pin = ""; draw(); } };
  box.addEventListener("click", async e => { const k = e.target.closest("[data-k]"); if (k) { if (k.dataset.k === "⌫") pin = pin.slice(0, -1); else if (pin.length < 6) pin += k.dataset.k; err = ""; draw(); if (pin.length === (S().profile.pinLen || 4)) tryPin(); }
    if (e.target.id === "pin-forgot") App.modal(`<h2>PIN vergessen</h2><p>Der PIN schützt StudyOS auf diesem Gerät. Ohne PIN kannst du nur alle lokalen Daten löschen. Wenn du Sync (GitHub Gist) eingerichtet hast, holst du deinen Stand danach von dort zurück.</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Abbrechen</button><button class="btn danger" id="wipe">Alles auf diesem Gerät löschen</button></div>`, m => { $("#wipe", m).onclick = () => { try { localStorage.clear(); } catch (e2) {} location.reload(); }; }); });
  const key = e => { if (!document.body.contains(box)) { window.removeEventListener("keydown", key); return; } if (/^\d$/.test(e.key) && pin.length < 6) { pin += e.key; draw(); if (pin.length === (S().profile.pinLen || 4)) tryPin(); } if (e.key === "Backspace") { pin = pin.slice(0, -1); draw(); } };
  window.addEventListener("keydown", key); draw(); document.body.appendChild(box);
}
App.lockScreen = lockScreen;
let hiddenAt = 0;
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") hiddenAt = Date.now(); else if (hiddenAt && S().profile.pinHash && Date.now() - hiddenAt > (S().profile.lockAfterMin || 5) * 60000) lockScreen(); });

/* ---------------- first-run onboarding ---------------- */
function onboarding() {
  if (S().profile.onboarded) return;
  App.modal(`<div class="spread"><h2>Willkommen bei StudyOS 👋</h2></div><p>${App.WELCOME || "Deine Lern-App fürs 3. Semester Wirtschaftsinformatik. Alles läuft auf deinem Gerät, ohne Konto und ohne KI-Kosten."}</p>
    <label class="fld">Wie heißt du?<input type="text" id="ob-name" value="${esc(S().name)}"></label>
    <label class="fld">Optional: 4-stelliger PIN zum Sperren<input type="password" inputmode="numeric" maxlength="6" id="ob-pin" placeholder="leer lassen = kein PIN"></label>
    <div class="callout" style="font-size:13px">Tipp: Installiere StudyOS als App (Einstellungen → App installieren) und schalte Erinnerungen ein, damit dich die App an Abgaben und Prüfungen erinnert.</div>
    <div class="row" style="justify-content:flex-end"><button class="btn pri" id="ob-go">Los geht's</button></div>`, (m, close) => {
    $("#ob-go", m).onclick = async () => { S().name = $("#ob-name", m).value.trim() || "Student"; const p = $("#ob-pin", m).value.trim(); if (/^\d{4,6}$/.test(p)) { S().profile.pinHash = await hash(p); S().profile.pinLen = p.length; } S().profile.onboarded = true; App.save(); close(); App.renderSide(); App.render(); };
  });
}

/* ---------------- backup ---------------- */
function exportBackup() { App.download("studyos-backup-" + App.today() + ".json", JSON.stringify(S(), null, 1), "application/json"); S().profile.lastBackup = Date.now(); App.save(); }
function importBackup(file) { const rd = new FileReader(); rd.onload = () => { try { const obj = JSON.parse(rd.result); if (!obj || !obj.v) throw new Error("Keine StudyOS-Sicherung"); App.modal(`<h2>Sicherung einspielen?</h2><p>Stand vom ${new Date(obj.updatedAt || 0).toLocaleString("de-AT")}. Dein aktueller Stand auf diesem Gerät wird ersetzt.</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Abbrechen</button><button class="btn pri" id="imp-y">Ersetzen</button></div>`, (m, close) => { $("#imp-y", m).onclick = () => { App.replaceState(obj); close(); App.toast("Wiederhergestellt", "Sicherung eingespielt.", "↺"); }; }); } catch (e) { App.toast("Import fehlgeschlagen", e.message, "!"); } }; rd.readAsText(file); }

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
async function syncNow(interactive) {
  if (!SEC().ghToken || syncBusy || !navigator.onLine) return; syncBusy = true; setSync("Synchronisiere …");
  try {
    if (S().sync.gistId) { const remote = await pullGist(); if ((remote.updatedAt || 0) > (S().updatedAt || 0) + 1000) {
        if (interactive || !S().updatedAt || (S().sync.last && S().updatedAt <= S().sync.last)) { const gid = S().sync.gistId; App.replaceState(Object.assign(remote, { sync: Object.assign(remote.sync || {}, { gistId: gid, last: Date.now() }) })); setSync("Neuerer Stand vom anderen Gerät geladen · " + new Date().toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" })); syncBusy = false; return; }
        else { conflictDialog(remote); syncBusy = false; return; } } }
    await pushGist(); setSync("Synchronisiert · " + new Date().toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }));
  } catch (e) { setSync("Sync-Fehler: " + e.message); if (interactive) App.toast("Sync-Fehler", e.message, "!"); }
  syncBusy = false;
}
function conflictDialog(remote) { App.modal(`<h2>Zwei Stände gefunden</h2><p>Auf einem anderen Gerät und auf diesem wurde seit dem letzten Sync gelernt.</p><div class="grid g2"><div class="card stat"><b>Anderes Gerät</b><span> · ${new Date(remote.updatedAt).toLocaleString("de-AT")}</span></div><div class="card stat"><b>Dieses Gerät</b><span> · ${new Date(S().updatedAt).toLocaleString("de-AT")}</span></div></div><div class="row" style="justify-content:flex-end"><button class="btn" id="cf-r">Anderes Gerät übernehmen</button><button class="btn pri" id="cf-l">Dieses Gerät behalten</button></div>`, (m, close) => { $("#cf-r", m).onclick = () => { const gid = S().sync.gistId; App.replaceState(Object.assign(remote, { sync: { gistId: gid, last: Date.now() } })); close(); }; $("#cf-l", m).onclick = async () => { close(); await pushGist(); setSync("Synchronisiert"); }; }); }
const setSync = t => { const el = $("#sync"); if (el) el.textContent = t; };
let syncTimer; App.onSaved = () => { if (SEC().ghToken && S().sync.auto !== false) { clearTimeout(syncTimer); syncTimer = setTimeout(() => syncNow(false), 20000); } };

/* ---------------- optional AI ---------------- */
App.aiReady = cid => { const c = CBY[cid]; return !!(S().ai.enabled && SEC().aiKey && !(c && c.id === "kommu")); };
async function aiCall(system, messages, maxTokens = 450) {
  const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": SEC().aiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" }, body: JSON.stringify({ model: S().ai.model || "claude-haiku-4-5-20251001", max_tokens: maxTokens, system, messages }) });
  if (!r.ok) { let m = r.status + ""; try { m = (await r.json()).error.message; } catch (e) {} throw new Error(m); }
  const j = await r.json(); S().ai.used = (S().ai.used || 0) + (j.usage ? j.usage.input_tokens + j.usage.output_tokens : 0); App.save(); return j.content.map(x => x.text || "").join("");
}
function confirmAI(what) { return new Promise(res => { if (!S().ai.confirm) return res(true); App.modal(`<h2>KI-Anfrage senden?</h2><p>${esc(what)}</p><p class="muted" style="font-size:13px">Die Anfrage geht mit deinem eigenen API-Schlüssel an Anthropic und verbraucht Tokens (bisher ca. ${(S().ai.used || 0).toLocaleString("de-AT")}). Ohne Bestätigung passiert nichts.</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" id="ai-n">Abbrechen</button><button class="btn pri" id="ai-y">Senden</button></div>`, (m, close) => { $("#ai-y", m).onclick = () => { close(); res(true); }; $("#ai-n", m).onclick = () => { close(); res(false); }; }); }); }
App.aiExplain = async (out, l, b) => { if (!(await confirmAI("Andere Erklärung für „" + b.h + "“ anfordern."))) return; out.textContent = "Denkt nach …"; try { out.textContent = await aiCall("Du bist Tutor für Wirtschaftsinformatik-Studierende an der FH JOANNEUM. Erkläre knapp (max. 110 Wörter), in der Sprache des Lernstoffs, mit einer Alltagsanalogie oder einem Zahlenbeispiel. Keine Überschriften.", [{ role: "user", content: "Lektion: " + l.title + "\nKonzept: " + b.h + "\nStoff: " + App.strip(b.levels.normal) }]); } catch (e) { out.textContent = "Fehler: " + e.message; } };
App.renderAssistant = (box, l) => {
  const c = CBY[l.course];
  if (c.id === "kommu") { box.innerHTML = `<h3>Fragen zur Lektion</h3><p class="muted" style="font-size:14px">In Kommunikationstraining ist KI ausdrücklich verboten. Nutze Notizen und frag im Unterricht nach.</p>`; return; }
  if (!App.aiReady(l.course)) { box.innerHTML = `<h3>KI-Assistent (optional)</h3><p class="muted" style="font-size:14px">Aus. StudyOS funktioniert komplett ohne KI. Wenn du willst, kannst du in den Einstellungen einen eigenen API-Schlüssel hinterlegen; jede Anfrage musst du dann bestätigen.</p><button class="btn ghost sm" data-go="settings">Einstellungen</button>`; return; }
  const log = [];
  box.innerHTML = `<div class="spread"><h3>Frag zur Lektion</h3><span class="chip">KI · bestätigt</span></div><div class="assist-log" id="alog"><div class="a muted">Frage zu „${esc(l.title)}“. Antworten bleiben kurz.</div></div><form class="row" id="aform" style="flex-wrap:nowrap"><input type="text" id="aq" placeholder="Deine Frage …" autocomplete="off"><button class="btn pri sm" type="submit">Fragen</button></form>${c.aiRule ? `<small class="faint">${esc(c.aiRule)}</small>` : ""}`;
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
PAGES.settings = el => {
  const s = S(); let confirmReset = false;
  const draw = () => {
    el.innerHTML = `<div class="page" style="max-width:820px"><h1>Einstellungen</h1>
     <div class="card col"><h3>Profil</h3><div class="grid g2"><label class="fld">Name<input type="text" id="st-name" value="${esc(s.name)}"></label>${App.CALM ? "" : `<label class="fld">Tagesziel (XP)<input type="number" id="st-goal" min="10" step="10" value="${s.dailyGoal}"></label>`}</div></div>
     <div class="card"><h3>Lernen</h3>
      ${App.CALM ? "" : `<label class="switch"><div><div>Alle Lektionen freischalten</div><small>Für die Wiederholung vor Prüfungen.</small></div><input type="checkbox" class="tgl" id="st-unlock" ${s.settings.unlockAll ? "checked" : ""}></label>`}
      <div class="switch"><div><div>Standard-Erklärstufe</div></div><div class="lvl">${[["simple", "Einfach"], ["normal", "Normal"], ["technical", "Fachlich"]].map(([k, t]) => `<button data-lv="${k}" class="${s.settings.level === k ? "on" : ""}">${t}</button>`).join("")}</div></div>
      <div class="switch"><div><div>Erinnerungen & Benachrichtigungen</div><small>${s.notify.enabled ? "An · täglich " + s.notify.daily + " · " + s.notify.before.join("/") + " Tage vor Terminen" : "Aus"}</small></div><button class="btn sm" id="st-notif">Einstellen</button></div></div>
     <div class="card col"><h3>Sperre (Anmeldung)</h3><p class="muted" style="font-size:14px">${s.profile.pinHash ? "PIN ist aktiv. StudyOS sperrt sich nach " + (s.profile.lockAfterMin || 5) + " min im Hintergrund." : "Kein PIN gesetzt."} Der PIN ist eine Bildschirmsperre für dieses Gerät, keine Verschlüsselung.</p>
      <div class="row"><input type="password" inputmode="numeric" maxlength="6" id="st-pin" placeholder="Neuer PIN (4–6 Ziffern)" style="max-width:200px"><button class="btn sm" id="st-pinset">${s.profile.pinHash ? "PIN ändern" : "PIN setzen"}</button>${s.profile.pinHash ? `<button class="btn ghost sm" id="st-pinrm">PIN entfernen</button><button class="btn ghost sm" id="st-lock">Jetzt sperren</button>` : ""}<label class="row" style="gap:6px">Sperren nach <input type="number" id="st-lockmin" min="1" max="120" value="${s.profile.lockAfterMin || 5}" style="width:70px"> min</label></div></div>
     <div class="card col"><h3>Sync zwischen Handy und Laptop</h3>
      <p class="muted" style="font-size:14px">Dein Fortschritt liegt lokal auf jedem Gerät. Zum Abgleichen nutzt StudyOS ein <b>privates GitHub Gist</b> in deinem eigenen GitHub-Konto. Einmal auf beiden Geräten dasselbe Token eintragen, dann synchronisiert die App automatisch.</p>
      <ol class="install-steps muted" style="font-size:13px"><li>github.com → Settings → Developer settings → Personal access tokens → <b>Tokens (classic)</b> → Generate new token</li><li>Nur den Scope <b>gist</b> anhaken, Ablaufdatum z. B. 1 Jahr</li><li>Token hier einfügen → „Verbinden“. Auf dem zweiten Gerät dasselbe Token + die angezeigte Gist-ID eintragen.</li></ol>
      <div class="grid g2"><label class="fld">GitHub-Token (bleibt nur auf diesem Gerät)<input type="password" id="st-tok" value="${SEC().ghToken ? "••••••••" : ""}" placeholder="ghp_…"></label><label class="fld">Gist-ID (leer = neu anlegen)<input type="text" id="st-gist" value="${esc(s.sync.gistId || "")}"></label></div>
      <div class="row"><button class="btn pri sm" id="st-sync">${SEC().ghToken ? "Jetzt synchronisieren" : "Verbinden"}</button>${SEC().ghToken ? `<button class="btn ghost sm" id="st-unsync">Trennen</button>` : ""}<small class="muted">${s.sync.last ? "Zuletzt: " + new Date(s.sync.last).toLocaleString("de-AT") : ""}</small></div>
      <div class="divider"></div><div class="spread"><div><b>Backup-Datei</b><div><small class="muted">Alternative ohne GitHub: exportieren und auf dem anderen Gerät importieren.${s.profile.lastBackup ? " Letztes Backup: " + new Date(s.profile.lastBackup).toLocaleDateString("de-AT") : ""}</small></div></div><div class="row"><button class="btn sm" id="st-exp">Exportieren</button><label class="btn sm">Importieren<input type="file" id="st-imp" accept=".json" hidden></label></div></div></div>
     <div class="card col"><h3>KI-Assistent (optional)</h3>
      <p class="muted" style="font-size:14px">Standardmäßig aus – StudyOS braucht keine KI. Wenn du willst: eigenen Anthropic-API-Schlüssel eintragen (console.anthropic.com). Jede Anfrage wird vorher abgefragt. In Kommunikationstraining ist der Assistent wegen des KI-Verbots immer aus.</p>
      <label class="switch"><div><div>KI-Assistent aktivieren</div><small>Verbraucht: ca. ${(s.ai.used || 0).toLocaleString("de-AT")} Tokens</small></div><input type="checkbox" class="tgl" id="st-ai" ${s.ai.enabled ? "checked" : ""}></label>
      <div class="grid g2"><label class="fld">API-Schlüssel (bleibt nur auf diesem Gerät)<input type="password" id="st-key" value="${SEC().aiKey ? "••••••••" : ""}" placeholder="sk-ant-…"></label><label class="fld">Modell<input type="text" id="st-model" value="${esc(s.ai.model)}"></label></div>
      <label class="switch"><div><div>Vor jeder Anfrage nachfragen</div></div><input type="checkbox" class="tgl" id="st-aiconf" ${s.ai.confirm ? "checked" : ""}></label></div>
     <div class="card col" id="install"><h3>App installieren</h3>${installHTML()}</div>
     <div class="card col"><h3>Über</h3><p class="muted" style="font-size:14px">StudyOS · Version ${App.VERSION} · Kurse: ${COURSES.map(c => esc(c.short)).join(", ")}. Daten: nur lokal${SEC().ghToken ? " + dein privates Gist" : ""}. Neue Kurse kommen als Dateien in <code>courses/</code>.</p></div>
     <div class="card col"><h3>Zurücksetzen</h3>${confirmReset ? `<div class="confirm">Alles löschen (Fortschritt, Notizen, Termine, Pläne)? <button class="btn danger sm" id="st-yes">Endgültig löschen</button><button class="btn ghost sm" id="st-no">Abbrechen</button></div>` : `<div><button class="btn danger sm" id="st-reset">Fortschritt zurücksetzen …</button></div>`}</div></div>`;
    $("#st-name", el).oninput = e => { s.name = e.target.value.slice(0, 40) || "Student"; App.save(); App.renderSide(); };
    if ($("#st-goal", el)) $("#st-goal", el).onchange = e => { s.dailyGoal = App.clamp(+e.target.value || 50, 10, 1000); App.save(); };
    if ($("#st-unlock", el)) $("#st-unlock", el).onchange = e => { s.settings.unlockAll = e.target.checked; App.save(); };
    $$("[data-lv]", el).forEach(b => b.onclick = () => { s.settings.level = b.dataset.lv; App.save(); draw(); });
    $("#st-notif", el).onclick = () => App.notifySettings();
    $("#st-pinset", el).onclick = async () => { const p = $("#st-pin", el).value.trim(); if (!/^\d{4,6}$/.test(p)) { App.toast("PIN", "4 bis 6 Ziffern.", "!"); return; } s.profile.pinHash = await hash(p); s.profile.pinLen = p.length; App.save(); App.toast("PIN gesetzt", "StudyOS ist jetzt gesperrt, wenn du es länger verlässt.", "🔒"); draw(); };
    const rm = $("#st-pinrm", el); if (rm) rm.onclick = () => { s.profile.pinHash = null; App.save(); draw(); };
    const lk = $("#st-lock", el); if (lk) lk.onclick = () => lockScreen();
    $("#st-lockmin", el).onchange = e => { s.profile.lockAfterMin = +e.target.value || 5; App.save(); };
    $("#st-sync", el).onclick = async () => { const t = $("#st-tok", el).value.trim(); if (t && !t.startsWith("•")) SEC().ghToken = t; const gid = $("#st-gist", el).value.trim(); if (gid !== (s.sync.gistId || "")) { s.sync.gistId = gid || null; s.sync.last = 0; } App.saveSecrets(); if (!SEC().ghToken) { App.toast("Token fehlt", "Bitte GitHub-Token eintragen.", "!"); return; } await syncNow(true); draw(); };
    const us = $("#st-unsync", el); if (us) us.onclick = () => { delete SEC().ghToken; App.saveSecrets(); draw(); };
    $("#st-exp", el).onclick = exportBackup; $("#st-imp", el).onchange = e => e.target.files[0] && importBackup(e.target.files[0]);
    $("#st-ai", el).onchange = e => { s.ai.enabled = e.target.checked; App.save(); };
    $("#st-key", el).onchange = e => { const v = e.target.value.trim(); if (v && !v.startsWith("•")) { SEC().aiKey = v; App.saveSecrets(); } if (!v) { delete SEC().aiKey; App.saveSecrets(); } };
    $("#st-model", el).onchange = e => { s.ai.model = e.target.value.trim() || "claude-haiku-4-5-20251001"; App.save(); };
    $("#st-aiconf", el).onchange = e => { s.ai.confirm = e.target.checked; App.save(); };
    const ib = $("#st-install", el); if (ib) ib.onclick = async () => { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; draw(); };
    const r = $("#st-reset", el); if (r) r.onclick = () => { confirmReset = true; draw(); };
    const n = $("#st-no", el); if (n) n.onclick = () => { confirmReset = false; draw(); };
    const y = $("#st-yes", el); if (y) y.onclick = () => { const keep = { name: s.name, sync: s.sync, profile: s.profile }; App.replaceState(Object.assign({ v: 2 }, keep)); App.go("dash"); };
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
App.VERSION = "4.4.0";
App.afterBoot.push(() => {
  registerSW();
  if (S().profile.pinHash) lockScreen(); else onboarding();
  setTimeout(loadPython, 2500);
  if (SEC().ghToken) setTimeout(() => syncNow(false), 1500);
  window.addEventListener("online", () => SEC().ghToken && syncNow(false));
  setSync(SEC().ghToken ? "Sync aktiv" : "Gespeichert auf diesem Gerät");
});
})();
