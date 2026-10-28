/* StudyOS · Einstellungen neu geordnet (4.26)
   Umhüllt PAGES.settings als äußerste Schicht: Die Karten der anderen Module (account, reset, i18n, extras, apps)
   werden samt ihrer Handler in Bereiche einsortiert. Dazu: Kopfbereich, Suche, Bereichs-Navigation und neue Karten
   für Darstellung, Start und Speicher. Darstellungs-Einstellungen gelten pro Gerät (localStorage), nicht pro Profil.
   Muss nach apps.js geladen werden. */
(function () {
const { $, $$, esc, PAGES } = App;
const S = () => App.S();
const UIKEY = "studyos.ui";
let UI = {}; try { UI = JSON.parse(localStorage.getItem(UIKEY) || "{}") || {}; } catch (e) {}
const saveUI = () => { try { localStorage.setItem(UIKEY, JSON.stringify(UI)); } catch (e) {} };
const html = document.documentElement;

/* ---------- Farbschema: System / Hell / Dunkel ----------
   Das Design kennt Dunkel nur über @media (prefers-color-scheme:dark). Für eine feste Wahl wird die Bedingung
   dieser Regeln umgeschrieben (Original bleibt gemerkt), damit kein Stylesheet doppelt gepflegt werden muss. */
const ORIG = new WeakMap();
function eachMedia(list, f) { for (const r of list) { if (r.media && r.cssRules) { f(r); eachMedia(r.cssRules, f); } else if (r.cssRules) eachMedia(r.cssRules, f); } }
function applyScheme() {
  const m = UI.scheme || "system";
  for (const sh of document.styleSheets) {
    let rules; try { rules = sh.cssRules; } catch (e) { continue; }
    eachMedia(rules, r => {
      if (!ORIG.has(r)) { if (!/prefers-color-scheme/.test(r.conditionText || r.media.mediaText)) return; ORIG.set(r, r.media.mediaText); }
      const o = ORIG.get(r);
      const t = m === "system" ? o : o.replace(/\(\s*prefers-color-scheme\s*:\s*(dark|light)\s*\)/g, (_, k) => k === m ? "(min-width:0px)" : "(max-width:-1px)");
      if (r.media.mediaText !== t) { while (r.media.length) r.media.deleteMedium(r.media.item(0)); t.split(",").forEach(x => r.media.appendMedium(x.trim())); }
    });
  }
  html.style.colorScheme = m === "system" ? "" : m;
  html.dataset.scheme = m;
}
App.isDark = () => (UI.scheme || "system") === "system" ? matchMedia("(prefers-color-scheme: dark)").matches : UI.scheme === "dark";
const ZOOMS = [[90, "Klein"], [100, "Normal"], [110, "Groß"], [125, "Sehr groß"]];
function applyLook() {
  applyScheme();
  html.style.zoom = UI.zoom && UI.zoom !== 100 ? UI.zoom / 100 : "";
  html.classList.toggle("less-motion", !!UI.calm);
}
applyLook();
/* Stylesheets, die später nachladen (Schriften), bekommen die Wahl ebenfalls */
addEventListener("load", applyScheme);

/* ---------- Startseite beim Öffnen ---------- */
const START = [["dash", "Heute"], ["calendar", "Kalender"], ["courses", "Fächer"], ["review", "Wiederholen", "all"], ["last", "Wo ich aufgehört habe"]];
const firstHash = (location.hash || "").slice(1);
addEventListener("hashchange", () => { try { if (location.hash.length > 1) { UI.lastHash = location.hash.slice(1); saveUI(); } } catch (e) {} });
App.afterBoot.push(() => {
  if (firstHash && firstHash !== "dash") return;
  const s = UI.start; if (!s || s === "dash") return;
  if (s === "last") { const h = UI.lastHash || ""; const v = h.split(/[/?]/)[0]; if (v && PAGES[v] && v !== "dash") location.hash = h; return; }
  const it = START.find(x => x[0] === s); if (it && PAGES[s]) App.go(s, it[2] || null);
});

/* ---------- Bereiche ---------- */
const SECTIONS = [
  ["konto", "Profil & Konto", "◉", ["Profil", "Profile auf diesem Gerät", "Benachrichtigungen (Chat)", "Sprache"], "Name, Profilbild, Tagesziel und Sprache"],
  ["look", "Darstellung", "◈", ["Darstellung", "Start"], "Farben, Schriftgröße und Startseite"],
  ["lernen", "Lernen", "↻", ["Lernen", "· Fragen"], "Wiederholen, Schwierigkeit und Fragen"],
  ["sicher", "Sicherheit", "⛨", ["Sperre (PIN)", "Schutz & Tempo"], "PIN-Sperre und Schutz der App"],
  ["daten", "Sync & Daten", "⇅", ["Sync zwischen Handy und Laptop", "Speicher & Daten"], "Geräte verbinden, Speicher und Updates"],
  ["app", "App", "▣", ["App installieren", "KI-Assistent (optional)", "Über"], "Installieren, KI-Assistent und Infos"],
  ["reset", "Zurücksetzen", "⚠", ["Lernfortschritt zurücksetzen", "Zurücksetzen"], "Fortschritt oder alles löschen"],
];
const sectionOf = t => { for (const s of SECTIONS) if (s[3].some(k => k.startsWith("·") ? t.endsWith(k) : t === k)) return s[0]; return "app"; };

const seg = (name, cur, opts) => `<div class="lvl st-seg" role="radiogroup" data-ui="${name}">${opts.map(([k, t]) => `<button role="radio" aria-checked="${String(cur) === String(k)}" class="${String(cur) === String(k) ? "on" : ""}" data-v="${k}">${t}</button>`).join("")}</div>`;
function lookCard() {
  return `<div class="card col st-new"><h3>Darstellung</h3>
    <div class="switch"><div><div>Farbschema</div><small>„System“ folgt der Einstellung von Handy oder Laptop.</small></div>${seg("scheme", UI.scheme || "system", [["system", "System"], ["light", "Hell"], ["dark", "Dunkel"]])}</div>
    <div class="switch"><div><div>Schriftgröße</div><small>Vergrößert die ganze App auf diesem Gerät.</small></div>${seg("zoom", UI.zoom || 100, ZOOMS)}</div>
    <label class="switch"><div><div>Weniger Bewegung</div><small>Schaltet Animationen und Einblend-Effekte ab.</small></div><input type="checkbox" class="tgl" data-ui="calm" ${UI.calm ? "checked" : ""}></label>
    <div class="st-acc-slot"></div></div>
   <div class="card col st-new"><h3>Start</h3>
    <div class="switch"><div><div>Beim Öffnen anzeigen</div><small>Gilt, wenn du StudyOS ohne Link öffnest.</small></div>
     <select data-ui="start" class="st-sel" aria-label="Startseite">${START.map(([k, t]) => `<option value="${k}" ${(UI.start || "dash") === k ? "selected" : ""}>${t}</option>`).join("")}</select></div></div>`;
}
const fmtB = b => b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(0) + " KB" : (b / 1048576).toFixed(1).replace(".", ",") + " MB";
function lsBytes() { let n = 0; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); n += (k.length + (localStorage.getItem(k) || "").length) * 2; } } catch (e) {} return n; }
function dataCard() {
  return `<div class="card col st-new" id="st-data"><h3>Speicher & Daten</h3>
    <div class="st-meter"><div class="spread"><span>Lernstand & Notizen</span><b id="st-ls">${fmtB(lsBytes())}</b></div><div class="st-bar"><i id="st-lsbar" style="width:${Math.min(100, lsBytes() / 5e6 * 100).toFixed(1)}%"></i></div><small class="muted">Der Browser erlaubt dafür etwa 5 MB.</small></div>
    <div class="spread st-line"><div><div>Offline-Speicher</div><small class="muted" id="st-cache">wird berechnet …</small></div><button class="btn sm" id="st-persist">Dauerhaft speichern</button></div>
    <div class="spread st-line"><div><div>Version ${esc(App.VERSION || "")}</div><small class="muted">Updates kommen automatisch. Hier kannst du sofort nachsehen.</small></div><button class="btn sm" id="st-upd">Nach Updates suchen</button></div>
    <div class="spread st-line"><div><div>App neu laden</div><small class="muted">Leert den Offline-Speicher und lädt alles frisch. Dein Lernstand bleibt.</small></div><button class="btn sm ghost" id="st-fresh">Neu laden</button></div></div>`;
}
function bindData(card) {
  const est = navigator.storage && navigator.storage.estimate ? navigator.storage.estimate() : Promise.resolve(null);
  const per = navigator.storage && navigator.storage.persisted ? navigator.storage.persisted() : Promise.resolve(false);
  Promise.all([est, per]).then(([e, p]) => {
    const c = $("#st-cache", card); if (c) c.textContent = (e ? fmtB(e.usage || 0) + " belegt" : "Größe unbekannt") + (p ? " · dauerhaft gesichert" : " · Browser darf ihn bei Platzmangel löschen");
    const b = $("#st-persist", card); if (b && (p || !(navigator.storage && navigator.storage.persist))) { b.disabled = true; b.textContent = p ? "✓ Dauerhaft" : "Nicht verfügbar"; }
  }).catch(() => {});
  $("#st-persist", card).onclick = async () => { let ok = false; try { ok = await navigator.storage.persist(); } catch (e) {} App.toast(ok ? "Gesichert" : "Nicht erlaubt", ok ? "Der Browser löscht deine Daten nicht mehr bei Platzmangel." : "Der Browser hat abgelehnt. Installierte Apps bekommen das meist automatisch.", ok ? "✓" : "!"); bindData(card); };
  $("#st-upd", card).onclick = async e => {
    const b = e.currentTarget; b.disabled = true; b.textContent = "Suche …";
    try { const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration(); if (!reg) throw 0; await reg.update(); App.toast(reg.installing || reg.waiting ? "Update gefunden" : "Aktuell", reg.installing || reg.waiting ? "Die neue Version wird geladen." : "Du hast die neueste Version " + App.VERSION + ".", reg.installing || reg.waiting ? "↻" : "✓"); }
    catch (err) { App.toast("Aktuell", "Version " + App.VERSION + ". Offline lässt sich nicht nachsehen.", "✓"); }
    b.disabled = false; b.textContent = "Nach Updates suchen";
  };
  $("#st-fresh", card).onclick = async () => { try { if (window.caches) for (const k of await caches.keys()) await caches.delete(k); } catch (e) {} location.reload(); };
}

function guardCard() {
  const G = window.STUDYOS_GUARD || {}, ms = G.ready ? Math.round(G.ready) : 0;
  const csp = !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'), off = !!(navigator.serviceWorker && navigator.serviceWorker.controller);
  const pin = (S().profile || {}).pinHash || "", nb = (G.blocked || []).length;
  const line = (ok, t, d) => `<div class="spread st-line"><div><div>${ok ? "✓" : "○"} ${t}</div><small class="muted">${d}</small></div></div>`;
  return `<div class="card col st-new" id="st-guard"><h3>Schutz & Tempo</h3>
    ${line(true, `Start in ${ms ? ms + " ms" : "–"}`, off ? "StudyOS kam aus dem Offline-Speicher und musste nichts aus dem Internet laden." : "Dieser Start kam aus dem Internet. Ab dem nächsten Start lädt StudyOS aus dem Offline-Speicher.")}
    ${line(true, "Schnelle Updates", "Bei einem Update lädt StudyOS nur die Dateien, die sich wirklich geändert haben, und fragt beim Start nicht mehr jede Datei einzeln beim Server nach.")}
    ${line(csp, "Schutzschild gegen fremden Code", csp ? `Nur Skripte von StudyOS selbst und wenigen geprüften Quellen dürfen laufen. Eingeschleuster Code in Chats, Notizen oder Kalender-Importen wird blockiert.${nb ? ` Blockiert in dieser Sitzung: ${nb}.` : ""}` : "Nicht aktiv.")}
    ${line(true, "Kein Einbetten in fremde Seiten", "StudyOS lässt sich nicht unsichtbar in eine andere Webseite legen (Schutz vor Klick-Fallen).")}
    ${line(pin.startsWith("p2$"), "PIN sicher gespeichert", pin ? (pin.startsWith("p2$") ? "Der PIN ist mit Salz und 150.000 Runden verschlüsselt. Nach 5 Fehlversuchen wächst die Wartezeit bis 15 Minuten." : "Wird beim nächsten Entsperren automatisch auf die sichere Speicherung umgestellt.") : "Kein PIN gesetzt. Mit PIN schützt du StudyOS auf geteilten Geräten.")}
    ${line(true, "Schlüssel bleiben auf dem Gerät", "KI- und Sync-Schlüssel liegen nur in diesem Browser und werden nicht mit dem Lernstand synchronisiert.")}
    ${nb ? `<button class="btn sm ghost" id="st-blocked" style="align-self:flex-start">Blockierte Inhalte ansehen</button>` : ""}</div>`;
}
function bindGuard(card) {
  const b = $("#st-blocked", card); if (b) b.onclick = () => App.modal(`<h2>Blockierte Inhalte</h2><p class="muted">Diese Inhalte wollte eine Seite laden, StudyOS hat sie aber nicht erlaubt.</p><ul>${(STUDYOS_GUARD.blocked || []).map(x => `<li><code>${esc(x.dir)}</code> ${esc(x.url || "(eingebettet)")}</li>`).join("")}</ul><div class="row" style="justify-content:flex-end"><button class="btn" data-close>Schließen</button></div>`);
}

/* ---------- Seite ---------- */
const inner = PAGES.settings;
let query = "";
PAGES.settings = (el, p) => {
  inner(el, p);
  const pg = $(".page", el); if (!pg) return;
  pg.classList.add("st-page"); pg.style.maxWidth = "";
  const h1 = $("h1", pg);
  const cards = [...pg.children].filter(n => n.classList.contains("card"));
  /* neue Karten dazu */
  const tmp = document.createElement("div"); tmp.innerHTML = lookCard() + dataCard() + guardCard();
  cards.push(...tmp.children);
  /* Farbe der App aus dem Profil in „Darstellung“ holen */
  const accRow = $(".pf-acc", pg), slot = $(".st-acc-slot", tmp);
  if (accRow && slot) {
    const row = accRow.closest(".pf-row"); slot.replaceWith(row); row.classList.add("switch", "st-accrow"); const l = $(".pf-l", row); if (l) l.innerHTML = `<div>Farbe der App</div><small>Für Übersicht, Kalender und Menüs. Jedes Fach behält seine eigene Farbe.</small>`;
    row.onclick = e => { const b = e.target.closest("[data-acc]"); if (!b) return; e.stopPropagation(); S().settings.accent = b.dataset.acc; App.save(); App.applyAccent && App.applyAccent(); $$("[data-acc]", row).forEach(o => o.classList.toggle("on", o === b)); };
  }
  else if (slot) slot.remove();
  const by = {}; cards.forEach(c => { const t = (($("h3", c) || {}).textContent || "").trim(); (by[sectionOf(t)] = by[sectionOf(t)] || []).push(c); });

  const s = S(), pr = s.profile || {};
  const installed = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  const synced = App.secrets && App.secrets().ghToken;
  const chip = (on, t) => `<span class="st-chip ${on ? "on" : ""}"><i></i>${t}</span>`;
  const head = document.createElement("header"); head.className = "st-hero";
  head.innerHTML = `<button type="button" class="st-avb" data-avopen aria-label="Profilbild ändern">${App.avatar.html("st-av")}<i aria-hidden="true">✎</i></button><div class="st-who"><span class="eyebrow">Einstellungen</span><b>${esc(s.name || "Student")}</b>
     <div class="st-chips">${chip(true, "Version " + esc(App.VERSION || ""))}${chip(!!synced, synced ? "Sync an" : "Sync aus")}${chip(!!pr.pinHash, pr.pinHash ? "PIN aktiv" : "Kein PIN")}${chip(!!installed, installed ? "Installiert" : "Im Browser")}</div></div>
   <label class="st-search"><span aria-hidden="true">⌕</span><input type="search" id="st-q" placeholder="Einstellung suchen …" autocomplete="off" aria-label="Einstellungen durchsuchen"><kbd class="kbd">/</kbd></label>`;
  const nav = document.createElement("nav"); nav.className = "st-nav"; nav.setAttribute("aria-label", "Bereiche");
  const body = document.createElement("div"); body.className = "st-body";
  SECTIONS.forEach(([id, title, ic, , desc]) => {
    const list = by[id]; if (!list || !list.length) return;
    const sec = document.createElement("section"); sec.className = "st-sec" + (id === "reset" ? " st-danger" : ""); sec.id = "sec-" + id; sec.dataset.sec = id;
    sec.innerHTML = `<header class="st-h"><span class="st-hi" aria-hidden="true">${ic}</span><div><h2>${title}</h2><small>${desc}</small></div></header>`;
    const keys = SECTIONS.find(x => x[0] === id)[3], rank = c => { const t = (($("h3", c) || {}).textContent || "").trim(); const i = keys.findIndex(k => k.startsWith("·") ? t.endsWith(k) : t === k); return i < 0 ? 99 : i; };
    list.sort((a, b) => rank(a) - rank(b)).forEach(c => { c.classList.add("st-card"); sec.appendChild(c); });
    body.appendChild(sec);
    nav.insertAdjacentHTML("beforeend", `<a href="#settings" data-sec="${id}" class="${id === "reset" ? "st-nav-danger" : ""}"><span class="st-ni" aria-hidden="true">${ic}</span><span class="st-nt"><b>${title}</b><small>${desc}</small></span></a>`);
  });
  body.insertAdjacentHTML("beforeend", `<div class="empty st-none" hidden>Keine Einstellung gefunden.</div>`);
  if (h1) h1.remove();
  [...pg.children].forEach(n => n.remove());
  const grid = document.createElement("div"); grid.className = "st-grid"; grid.append(nav, body);
  pg.append(head, grid);

  /* Handler der neuen Karten */
  $$("[data-ui]", pg).forEach(x => {
    const k = x.dataset.ui;
    if (x.classList.contains("st-seg")) x.onclick = e => { const b = e.target.closest("[data-v]"); if (!b) return; UI[k] = k === "zoom" ? +b.dataset.v : b.dataset.v; saveUI(); applyLook(); $$("[data-v]", x).forEach(o => { o.classList.toggle("on", o === b); o.setAttribute("aria-checked", o === b); }); App.renderSide && App.renderSide(); };
    else if (x.type === "checkbox") x.onchange = () => { UI[k] = x.checked; saveUI(); applyLook(); };
    else x.onchange = () => { UI[k] = x.value; saveUI(); App.toast("Startseite", "Beim nächsten Öffnen: " + x.options[x.selectedIndex].text + ".", "✓"); };
  });
  const dc = $("#st-data", pg); if (dc) bindData(dc);
  const gc = $("#st-guard", pg); if (gc) bindGuard(gc);
  /* Kopfbereich live mitziehen: Name und Anfangsbuchstabe ändern sich sofort mit */
  const hName = $(".st-who b", head);
  const nm = $("#st-name", pg); if (nm) nm.addEventListener("input", () => { hName.textContent = S().name || "Student"; App.avatar.paint(); });

  /* immer nur ein Bereich sichtbar; bei der Suche alle Treffer aus allen Bereichen */
  const ids = SECTIONS.map(x => x[0]).filter(id => $("#sec-" + id, pg));
  let cur = ids.includes(p) ? p : ids.includes(UI.sec) ? UI.sec : ids[0];
  const showSec = (id, anim) => {
    cur = id; UI.sec = id; saveUI();
    $$(".st-sec", pg).forEach(sec => { const on = sec.dataset.sec === id; sec.hidden = !on; if (on && anim) { sec.classList.remove("st-in"); void sec.offsetWidth; sec.classList.add("st-in"); } });
    $$(".st-card", pg).forEach(c => c.hidden = false);
    $$(".st-nav a", pg).forEach(a => { const on = a.dataset.sec === id; a.classList.toggle("on", on); a.classList.remove("off"); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    const on = $(".st-nav a.on", pg); if (on && innerWidth <= 860) nav.scrollTo({ left: on.offsetLeft - 16, behavior: html.classList.contains("less-motion") ? "auto" : "smooth" });
  };
  /* Suche */
  const q = $("#st-q", pg);
  const filter = () => {
    query = q.value.trim().toLowerCase(); let any = false;
    pg.classList.toggle("st-searching", !!query);
    if (!query) { showSec(cur); $(".st-none", pg).hidden = true; return; }
    $$(".st-sec", pg).forEach(sec => {
      let vis = 0; const hit = query && sec.querySelector(".st-h").textContent.toLowerCase().includes(query);
      $$(".st-card", sec).forEach(c => { const on = !query || hit || c.textContent.toLowerCase().includes(query); c.hidden = !on; vis += on; });
      sec.hidden = !vis; any = any || !!vis;
    });
    $(".st-none", pg).hidden = any;
    $$(".st-nav a", pg).forEach(a => { a.classList.remove("on"); a.classList.toggle("off", !!($("#sec-" + a.dataset.sec, pg) || {}).hidden); });
  };
  q.value = query; q.oninput = filter; filter();
  q.onkeydown = e => { if (e.key === "Escape") { q.value = ""; filter(); q.blur(); } };

  /* Navigation */
  nav.onclick = e => { const a = e.target.closest("a[data-sec]"); if (!a) return; e.preventDefault();
    if (query) { q.value = ""; filter(); }
    showSec(a.dataset.sec, true);
    const top = grid.getBoundingClientRect().top + scrollY - (innerWidth <= 860 ? 60 : 20); if (scrollY > top) scrollTo({ top, behavior: html.classList.contains("less-motion") ? "auto" : "smooth" }); };
};
/* „/“ springt in die Suche */
document.addEventListener("keydown", e => { if (e.key !== "/" || App.route().v !== "settings") return; const t = e.target; if (t.closest && t.closest("input,textarea,select,[contenteditable]")) return; const q = $("#st-q"); if (q) { e.preventDefault(); q.focus(); } });
})();
