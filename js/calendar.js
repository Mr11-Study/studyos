/* StudyOS · Kalender
   Eine ruhige Wochenansicht: Stundenplan (importiert als .ics aus dem Stundenplan-System der FH), Abgaben und eigene Termine.
   Ersetzt den Monats-Kalender aus planner.js. Muss nach planner.js und vor apps.js geladen werden. */
(function () {
const { $, $$, esc, PAGES, CBY, COURSES, dkey, today, fmtDate, daysUntil } = App;
const S = () => App.S();
const addDays = (k, n) => { const d = new Date(k + "T12:00:00"); d.setDate(d.getDate() + n); return dkey(d); };
const monday = k => { const d = new Date(k + "T12:00:00"); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return dkey(d); };
const WD = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

/* ---------- .ics lesen ---------- */
function unfold(txt) { return txt.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, ""); }
function icsDate(v, params) {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(v.trim()); if (!m) return null;
  if (!m[4]) return { date: `${m[1]}-${m[2]}-${m[3]}`, time: "" };
  let d = m[7] ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5])) : new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  return { date: dkey(d), time: String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"), ts: d.getTime() };
}
const unesc = s => s.replace(/\\n/gi, " ").replace(/\\([,;\\])/g, "$1").trim();
function guessCourse(text) {
  const t = text.toLowerCase();
  for (const c of COURSES) { const keys = [c.short, c.title, c.name].filter(Boolean).map(x => x.toLowerCase()); if (keys.some(k => k.length > 2 && t.includes(k))) return c.id; }
  for (const c of COURSES) { const w = (c.title || "").toLowerCase().split(/[\s&,-]+/).filter(x => x.length > 5); if (w.some(x => t.includes(x))) return c.id; }
  return null;
}
App.parseICS = function (txt) {
  const out = [];
  unfold(txt).split("BEGIN:VEVENT").slice(1).forEach((blk, i) => {
    const props = {};
    blk.split("END:VEVENT")[0].split("\n").forEach(line => { const k = line.indexOf(":"); if (k < 0) return; const head = line.slice(0, k), val = line.slice(k + 1); const name = head.split(";")[0].toUpperCase(); if (name === "EXDATE") (props.EXDATE = props.EXDATE || []).push(...val.split(",")); else if (!(name in props)) props[name] = val; });
    const st = props.DTSTART && icsDate(props.DTSTART); if (!st) return;
    const en = props.DTEND && icsDate(props.DTEND);
    const title = unesc(props.SUMMARY || "Termin"), loc = unesc(props.LOCATION || "");
    const ev = { id: "tt" + i + "-" + st.date + (st.time || ""), title, loc, date: st.date, time: st.time, min: en && en.ts && st.ts ? Math.round((en.ts - st.ts) / 60000) : 0, course: guessCourse(title + " " + unesc(props.DESCRIPTION || "")) };
    const rr = props.RRULE || "";
    if (/FREQ=WEEKLY/i.test(rr)) {
      ev.repeat = "weekly"; const iv = /INTERVAL=(\d+)/i.exec(rr); if (iv && +iv[1] > 1) ev.every = +iv[1];
      const un = /UNTIL=([0-9TZ]+)/i.exec(rr); if (un) { const u = icsDate(un[1]); if (u) ev.until = u.date; }
      const cn = /COUNT=(\d+)/i.exec(rr); if (cn) ev.until = addDays(st.date, 7 * (ev.every || 1) * (+cn[1] - 1));
      if (props.EXDATE) ev.skip = props.EXDATE.map(x => (icsDate(x) || {}).date).filter(Boolean);
    }
    out.push(ev);
  });
  return out;
};
function expandTT(e, from, to) {
  if (e.repeat !== "weekly") return e.date >= from && e.date <= to ? [e] : [];
  const out = [], step = 7 * (e.every || 1), end = e.until && e.until < to ? e.until : to; let k = e.date;
  while (k <= end) { if (k >= from && !(e.skip || []).includes(k)) out.push(Object.assign({}, e, { date: k })); k = addDays(k, step); }
  return out;
}
const timetable = (from, to) => (S().timetable || []).flatMap(e => expandTT(e, from, to)).map(e => Object.assign({ src: "tt", type: "class" }, e));
App.timetableBetween = timetable;

/* alles, was in der Wochenansicht steht: Stundenplan + Abgaben/Prüfungen mit Datum + eigene Termine */
function dayItems(from, to) {
  const ev = App.eventsBetween(from, to, false).filter(e => e.type !== "info" && !(e.src === "course" && e.type === "class"));
  return timetable(from, to).concat(ev).sort((a, b) => (a.date + (a.time || "99")).localeCompare(b.date + (b.time || "99")));
}
App.calendarItems = dayItems;

async function importText(txt, source) {
  const list = App.parseICS(txt);
  if (!list.length) { App.toast("Keine Termine gefunden", "Die Datei enthält keine Kalendereinträge (.ics).", "!"); return false; }
  S().timetable = list; S().ttSource = Object.assign({ at: Date.now() }, source); App.save();
  App.toast("Stundenplan importiert", list.length + " Einträge übernommen.", "▦"); return true;
}
/* Erst direkt laden. Erlaubt der Server das nicht (CORS), über die Supabase Edge Function „kalender“ holen. */
async function fetchURL(url) {
  const u = url.trim().replace(/^webcal:/i, "https:");
  try { const r = await fetch(u, { cache: "no-store" }); if (r.ok) return r.text(); } catch (e) {}
  const sb = App.SB; if (!sb) throw new Error("direct");
  let r;
  try { r = await fetch(sb.url + "/functions/v1/kalender?url=" + encodeURIComponent(u), { cache: "no-store", headers: { Authorization: "Bearer " + sb.key, apikey: sb.key } }); }
  catch (e) { throw new Error(navigator.onLine ? "proxy-missing" : "offline"); }
  if (r.ok) return r.text();
  let m = ""; try { m = (await r.json()).error || ""; } catch (e) {}
  throw new Error(r.status === 404 ? "proxy-missing" : m || "HTTP " + r.status);
}
const fetchErr = e => { const m = String((e && e.message) || e);
  return m === "offline" ? "Du bist offline. Versuch es mit Internet nochmal."
    : m === "proxy-missing" || m === "direct" ? "Der Server erlaubt keinen direkten Abruf aus dem Browser, und der Kalender-Dienst von StudyOS ist noch nicht eingerichtet. Bis dahin: Link einmal öffnen, die .ics-Datei speichern und hier mit „Datei wählen“ auswählen."
    : "Der Kalender ließ sich nicht laden: " + m + ". Alternativ den Link öffnen, die .ics-Datei speichern und mit „Datei wählen“ auswählen."; };
/* abonnierten Link alle 30 Minuten still aktualisieren: beim Start, beim Zurückkehren in die App und solange sie offen ist */
const TT_EVERY = 30 * 60e3;
let ttBusy = null;
/* force: sofort laden (Knopf „Aktualisieren“); liefert { changed, count } oder wirft den Ladefehler */
function refreshTT(force) {
  const src = S().ttSource; if (!src || !src.url) return Promise.resolve(null);
  if (ttBusy) return ttBusy;
  if (force !== true && (!navigator.onLine || document.hidden || Date.now() - Math.max(src.at || 0, src.tried || 0) < TT_EVERY)) return Promise.resolve(null);
  src.tried = Date.now();
  ttBusy = fetchURL(src.url).then(t => {
    const l = App.parseICS(t); if (!l.length) throw new Error("Unter dem Link stehen gerade keine Termine");
    const changed = JSON.stringify(l) !== JSON.stringify(S().timetable || []);
    S().timetable = l; src.at = Date.now(); App.save();
    if (changed && force !== true && ["calendar", "dash"].includes(App.route().v) && !document.querySelector(".modal-back")) App.render();
    return { changed, count: l.length };
  });
  ttBusy.catch(() => {}).finally(() => { ttBusy = null; });
  return force === true ? ttBusy : ttBusy.catch(() => null);
}
App.refreshTimetable = refreshTT;
App.afterBoot.push(() => { const tick = () => refreshTT(); tick(); setInterval(tick, 60e3); document.addEventListener("visibilitychange", tick); window.addEventListener("online", tick); });

/* FH JOANNEUM: Abo-Link der Stundenplan-Suche (almaty) aus Studiengang, Semester und Gruppe bauen */
const FH_BASE = "almaty.fh-joanneum.at/stundenplan/search.php?q=";
const fhTerm = (op, v, neg) => { v = String(v || "").trim(); if (!v) return ""; const t = (neg ? "-" : "") + op + ":" + v; return /\s/.test(v) ? '"' + t + '"' : t; };
function fhQuery(f) {
  const g = String(f.gruppe || "").split(",").map(x => fhTerm("gruppe", x, f.gmode === "ohne")).filter(Boolean);
  return [fhTerm("studiengang", f.sg), fhTerm("fachsemester", f.sem), ...g, String(f.extra || "").trim()].filter(Boolean).join(" ");
}
/* Anführungszeichen so wie in den Abo-Links der FH-Seite selbst (&quot;) */
const fhURL = f => "webcal://" + FH_BASE + encodeURIComponent(fhQuery(f).replace(/"/g, "&quot;")).replace(/%20/g, "+");
/* aus einem bestehenden FH-Link die Felder zurückgewinnen, damit man ihn später anpassen kann */
function fhParse(url) {
  try {
    const u = new URL(String(url).replace(/^webcal:/i, "https:")); if (!/fh-joanneum\.at$/i.test(u.hostname)) return null;
    const q = (u.searchParams.get("q") || "").replace(/&quot;/g, '"'), f = { sg: "", sem: "", gruppe: "", gmode: "nur", extra: "" }, rest = [], gs = [];
    (q.match(/"[^"]*"|\S+/g) || []).forEach(t => { const x = t.replace(/^"|"$/g, ""), m = x.match(/^(-?)(studiengang|fachsemester|gruppe):(.+)$/i);
      if (!m) return rest.push(t); const k = m[2].toLowerCase();
      if (k === "studiengang" && !m[1]) f.sg = m[3]; else if (k === "fachsemester" && !m[1]) f.sem = m[3]; else if (k === "gruppe") { gs.push(m[3]); f.gmode = m[1] ? "ohne" : "nur"; } else rest.push(t); });
    f.gruppe = gs.join(", "); f.extra = rest.join(" "); return f;
  } catch (e) { return null; }
}
App.fhTimetable = { query: fhQuery, url: fhURL, parse: fhParse };

function importDialog(onDone) {
  const src = S().ttSource || {}, saved = S().ttFH || fhParse(src.url) || {};
  const f = { sg: saved.sg || "IMA", sem: saved.sem || String(App.SEM || 1), gruppe: saved.gruppe || "", gmode: saved.gmode || "ohne", extra: saved.extra || "" };
  const fhOn = !src.url || /fh-joanneum\.at/i.test(src.url) || !!S().ttFH;
  App.modal(`<div class="spread"><h2>Stundenplan holen</h2><button class="btn ghost sm" data-close>✕</button></div>
    <div class="tt-tabs" role="tablist"><button role="tab" data-tab="fh" class="${fhOn ? "on" : ""}">FH JOANNEUM</button><button role="tab" data-tab="link" class="${fhOn ? "" : "on"}">Link oder Datei</button></div>
    <section class="tt-pane col" data-pane="fh" ${fhOn ? "" : "hidden"}>
      <p class="muted" style="font-size:14px">StudyOS holt deinen Stundenplan direkt aus der <a href="https://almaty.fh-joanneum.at/stundenplan/" target="_blank" rel="noopener">Stundenplan-Suche der FH</a> und lädt ihn alle 30 Minuten neu. Wähle aus, was du sehen willst.</p>
      <div class="tt-fh">
        <label class="fld">Studiengang<input type="text" id="fh-sg" value="${esc(f.sg)}" placeholder="z. B. IMA" autocapitalize="characters" spellcheck="false"><small class="muted">Kürzel, Wirtschaftsinformatik = IMA</small></label>
        <label class="fld">Fachsemester<select id="fh-sem">${[1, 2, 3, 4, 5, 6].map(n => `<option value="${n}" ${String(n) === String(f.sem) ? "selected" : ""}>${n}. Semester</option>`).join("")}<option value="" ${f.sem ? "" : "selected"}>alle</option></select></label>
        <label class="fld tt-fh-wide">Gruppe (optional)<span class="tt-grp"><span class="lvl" role="radiogroup" aria-label="Gruppe"><button type="button" data-gm="nur" class="${f.gmode === "nur" ? "on" : ""}">nur</button><button type="button" data-gm="ohne" class="${f.gmode === "ohne" ? "on" : ""}">ohne</button></span><input type="text" id="fh-gr" value="${esc(f.gruppe)}" placeholder="z. B. Gruppe 1" spellcheck="false"></span><small class="muted">Tipp: Die <b>anderen</b> Gruppen mit „ohne“ ausblenden, dann bleiben gemeinsame Vorlesungen drin. Mehrere mit Komma trennen.</small></label>
        <details class="tt-fh-wide" ${f.extra ? "open" : ""}><summary>Weitere Suchbegriffe</summary><input type="text" id="fh-ex" value="${esc(f.extra)}" placeholder="z. B. -titel:Sport referent:Radeke" spellcheck="false"><small class="muted">Wie in der FH-Suche: titel:, referent:, ort:, notiz:, ein Minus schließt aus.</small></details>
      </div>
      <div class="tt-q"><span class="eyebrow">Suche bei der FH</span><code id="fh-q"></code></div>
      <div class="row" style="justify-content:flex-end"><button class="btn pri" id="fh-load">Stundenplan abonnieren</button></div>
    </section>
    <section class="tt-pane col" data-pane="link" ${fhOn ? "hidden" : ""}>
      <p class="muted" style="font-size:14px"><b>.ics</b> (auch iCal) ist das Standardformat für Kalender. Ein Kalender-Link bleibt aktuell, StudyOS lädt ihn alle 30 Minuten neu. Eine Datei ist eine Momentaufnahme. Suche in deinem Kalender nach „Kalender abonnieren“, „iCal“ oder „Export (.ics)“.</p>
      <p class="muted" style="font-size:13px">Hinweis: Studo kann Kalender nur importieren, nicht exportieren. Den Link bekommst du daher direkt vom Stundenplan der FH, nicht aus Studo.</p>
      <label class="fld">Kalender-Link (https:// oder webcal://)<input type="url" id="tt-url" placeholder="https://…/calendar.ics" value="${esc(src.url || "")}"></label>
      <div class="row" style="justify-content:space-between"><label class="btn">Datei wählen (.ics)<input type="file" id="tt-file" accept=".ics,text/calendar" hidden></label><button class="btn pri" id="tt-load">Link laden</button></div>
    </section>
    <small class="muted" id="tt-msg" aria-live="polite"></small>
    <div class="divider"></div><div class="spread"><small class="muted">Abgaben und eigene Termine in den Handy-Kalender übernehmen</small><button class="btn ghost sm" id="tt-exp">Export (.ics)</button></div>
    ${(S().timetable || []).length ? `<div class="divider"></div><div class="spread"><small class="muted">${S().timetable.length} Einträge geladen${src.name ? " aus " + esc(src.name) : ""}.</small><button class="btn ghost sm" id="tt-clear">Stundenplan entfernen</button></div>` : ""}`, (m, close) => {
    const msg = $("#tt-msg", m);
    $$("[data-tab]", m).forEach(t => t.onclick = () => { $$("[data-tab]", m).forEach(x => { x.classList.toggle("on", x === t); x.setAttribute("aria-selected", x === t); }); $$("[data-pane]", m).forEach(p => p.hidden = p.dataset.pane !== t.dataset.tab); msg.textContent = ""; });
    const read = () => ({ sg: $("#fh-sg", m).value.trim().toUpperCase(), sem: $("#fh-sem", m).value, gruppe: $("#fh-gr", m).value.trim(), gmode: f.gmode, extra: $("#fh-ex", m).value.trim() });
    const show = () => { $("#fh-q", m).textContent = fhQuery(read()) || "–"; };
    ["#fh-sg", "#fh-sem", "#fh-gr", "#fh-ex"].forEach(id => $(id, m).addEventListener("input", show));
    $$("[data-gm]", m).forEach(b => b.onclick = () => { f.gmode = b.dataset.gm; $$("[data-gm]", m).forEach(x => x.classList.toggle("on", x === b)); show(); });
    show();
    const load = async (url, name, after) => { msg.textContent = "Lade …";
      try { const t = await fetchURL(url); if (await importText(t, { url, name })) { after && after(); close(); onDone(); } else msg.textContent = ""; }
      catch (e) { msg.textContent = fetchErr(e); } };
    $("#fh-load", m).onclick = () => { const v = read(); if (!v.sg) { msg.textContent = "Bitte den Studiengang eintragen, z. B. IMA."; return $("#fh-sg", m).focus(); }
      load(fhURL(v), "FH JOANNEUM · " + v.sg + (v.sem ? " " + v.sem + ". Sem." : ""), () => { S().ttFH = v; App.save(); }); };
    $("#tt-file", m).onchange = e => { const fl = e.target.files[0]; if (!fl) return; fl.text().then(t => importText(t, { name: fl.name })).then(ok => { if (ok) { S().ttFH = null; App.save(); close(); onDone(); } }); };
    $("#tt-load", m).onclick = () => { const url = $("#tt-url", m).value.trim(); if (!url) return $("#tt-url", m).focus();
      load(url, new URL(url.replace(/^webcal:/i, "https:")).hostname, () => { S().ttFH = fhParse(url); App.save(); }); };
    $("#tt-exp", m).onclick = () => { close(); App.exportICS(); };
    const cl = $("#tt-clear", m); if (cl) cl.onclick = () => { S().timetable = []; S().ttSource = null; S().ttFH = null; App.save(); close(); onDone(); };
  });
}
App.timetableImport = importDialog;

/* ---------- Seite: Wochenraster wie ein Stundenplan ---------- */
const colorOf = e => e.course && CBY[e.course] ? CBY[e.course].color : e.type === "deadline" ? "var(--warn)" : e.type === "exam" ? "var(--bad)" : "var(--acc)";
const KIND = { class: "Vorlesung", deadline: "Abgabe", exam: "Prüfung", register: "Anmeldung", study: "Lernen", other: "Termin" };
const toMin = t => { const [h, m] = String(t).split(":").map(Number); return h * 60 + (m || 0); };
const fmtMin = t => String(Math.floor(t / 60) % 24).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0");
const durOf = e => e.min > 0 ? e.min : e.type === "class" ? 90 : 60;
const endTime = e => e.time ? fmtMin(toMin(e.time) + durOf(e)) : "";
const ago = ts => { const m = Math.round((Date.now() - ts) / 60000); return m < 1 ? "gerade eben" : m < 60 ? "vor " + m + " Min." : m < 1440 ? "vor " + Math.round(m / 60) + " Std." : "am " + new Date(ts).toLocaleDateString("de-AT"); };
const VKEY = "studyos.calView";
const getView = () => { try { return localStorage.getItem(VKEY) || (innerWidth <= 700 ? "day" : "week"); } catch (e) { return innerWidth <= 700 ? "day" : "week"; } };
const setView = v => { try { localStorage.setItem(VKEY, v); } catch (e) {} };

/* Überschneidungen nebeneinander legen */
function layout(list) {
  const ev = list.map(e => ({ e, s: toMin(e.time), t: toMin(e.time) + durOf(e) })).sort((a, b) => a.s - b.s || b.t - a.t);
  let group = [], end = -1; const groups = [];
  ev.forEach(x => { if (x.s >= end && group.length) { groups.push(group); group = []; } group.push(x); end = Math.max(end, x.t); });
  if (group.length) groups.push(group);
  groups.forEach(g => { const cols = []; g.forEach(x => { let i = cols.findIndex(t => t <= x.s); if (i < 0) { i = cols.length; cols.push(0); } cols[i] = x.t; x.col = i; }); g.forEach(x => x.n = cols.length); });
  return ev;
}
function blockHTML(x, H, h0) {
  const e = x.e, top = (x.s - h0 * 60) / 60 * H, ht = Math.max(22, (x.t - x.s) / 60 * H - 3), c = e.course && CBY[e.course];
  const sub = [e.time + "–" + endTime(e), e.loc].filter(Boolean).map(esc).join(" · ");
  return `<button class="cg-ev ${ht < 44 ? "tiny" : ht < 80 ? "short" : ""} ${e.done ? "done" : ""}" style="--c:${colorOf(e)};top:${top}px;height:${ht}px;left:calc(${x.col} * 100% / ${x.n} + 2px);width:calc(100% / ${x.n} - 4px)" data-item="${esc(e.src)}|${esc(e.id)}|${e.date}" title="${esc(e.title + (e.loc ? " · " + e.loc : "") + " · " + e.time + "–" + endTime(e))}">
    ${c ? `<span class="cg-tag">${esc(c.short)}</span>` : e.type !== "class" ? `<span class="cg-tag">${esc(KIND[e.type] || "Termin")}</span>` : ""}<b class="t-long">${esc(e.title)}</b><b class="t-short">${esc(c ? c.title : e.title)}</b><small>${sub}</small></button>`;
}

PAGES.calendar = el => {
  let sel = today(), wk = monday(sel), view = getView(), busy = false;
  const draw = () => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(wk, i)), items = dayItems(days[0], days[6]), by = {};
    items.forEach(e => (by[e.date] = by[e.date] || []).push(e));
    const weekend = days.slice(5).some(k => (by[k] || []).length);
    const cols = view === "day" ? [sel] : weekend ? days : days.slice(0, 5);
    const timed = cols.flatMap(k => (by[k] || []).filter(e => e.time)), allday = cols.some(k => (by[k] || []).some(e => !e.time));
    let h0 = 8, h1 = 18; timed.forEach(e => { h0 = Math.min(h0, Math.floor(toMin(e.time) / 60)); h1 = Math.max(h1, Math.ceil((toMin(e.time) + durOf(e)) / 60)); });
    h0 = Math.max(0, h0); h1 = Math.min(24, Math.max(h1, h0 + 6));
    const H = innerWidth <= 700 ? 52 : 58, hours = Array.from({ length: h1 - h0 }, (_, i) => h0 + i);
    const nowK = today(), nowM = new Date().getHours() * 60 + new Date().getMinutes();
    const src = S().ttSource, hasTT = (S().timetable || []).length;
    const d0 = new Date(days[0] + "T12:00:00"), d6 = new Date(days[6] + "T12:00:00");
    const up = dayItems(addDays(today(), 1), addDays(today(), 45)).filter(e => e.type !== "class" && !e.done).slice(0, 6);
    const head = k => { const d = new Date(k + "T12:00:00"), i = (d.getDay() + 6) % 7; return `<button class="cg-dh ${k === nowK ? "today" : ""} ${view === "day" ? "" : k === sel ? "sel" : ""}" data-sel="${k}"><small>${WD[i]}</small><b>${d.getDate()}</b></button>`; };
    el.innerHTML = `<div class="page cal3">
      <header class="cal3-top"><div><span class="eyebrow">${d0.toLocaleDateString("de-AT", { day: "numeric", month: "long" })} – ${d6.toLocaleDateString("de-AT", { day: "numeric", month: "long", year: "numeric" })}</span><h1>Kalender</h1></div>
        <div class="cal3-tools"><div class="cal3-nav"><button class="btn sm" id="c-prev" aria-label="${view === "day" ? "Voriger Tag" : "Vorige Woche"}">‹</button><button class="btn sm" id="c-now">Heute</button><button class="btn sm" id="c-next" aria-label="${view === "day" ? "Nächster Tag" : "Nächste Woche"}">›</button></div>
          <div class="lvl cal3-view" role="radiogroup" aria-label="Ansicht"><button data-view="week" class="${view === "week" ? "on" : ""}">Woche</button><button data-view="day" class="${view === "day" ? "on" : ""}">Tag</button></div>
          <button class="btn pri sm" id="c-add">+ Termin</button></div></header>
      ${hasTT ? `<section class="tt-bar"><span class="tt-bar-ic" aria-hidden="true">▦</span><div class="tt-bar-t"><b>${esc((src && src.name) || "Stundenplan")}</b><small id="tt-st">${src && src.url ? "Abo · aktualisiert " + ago(src.at || Date.now()) : "aus Datei · wird nicht automatisch aktualisiert"} · ${S().timetable.length} Einträge</small></div>
          <div class="tt-bar-a">${src && src.url ? `<button class="btn sm" id="c-ref"><span class="rf" aria-hidden="true">↻</span> Aktualisieren</button>` : ""}<button class="btn sm ghost" id="c-tt">Ändern</button><button class="btn sm ghost" id="c-rm">Entfernen</button></div></section>`
        : `<section class="card tt-empty"><div class="tt-ill" aria-hidden="true"><i></i><i></i><i></i></div><div><h3>Hol dir deinen Stundenplan</h3><p class="muted">Wähle Studiengang und Semester der FH JOANNEUM oder füge einen Kalender-Link ein. Dann siehst du hier jede Lehrveranstaltung mit Raum und Uhrzeit.</p><button class="btn pri" id="c-tt">Stundenplan holen</button></div></section>`}
      ${view === "day" ? `<div class="cg-strip">${days.map(k => { const d = new Date(k + "T12:00:00"), n = (by[k] || []).length; return `<button class="wk-day ${k === sel ? "on" : ""} ${k === nowK ? "today" : ""}" data-sel="${k}"><small>${WD[(d.getDay() + 6) % 7]}</small><b>${d.getDate()}</b><span class="wk-dots">${(by[k] || []).slice(0, 4).map(e => `<i style="--c:${colorOf(e)}"></i>`).join("")}${n > 4 ? "<em>+</em>" : ""}</span></button>`; }).join("")}</div>` : ""}
      <section class="cg cg-${view}" style="--cols:${cols.length};--h:${H}px">
        <div class="cg-head"><div class="cg-gut"></div>${view === "day" ? `<div class="cg-dh today-ish"><b>${fmtDate(sel, { weekday: "long", day: "numeric", month: "long" })}</b></div>` : cols.map(head).join("")}</div>
        ${allday ? `<div class="cg-all"><div class="cg-gut"><small>ganzt.</small></div>${cols.map(k => `<div class="cg-ac">${(by[k] || []).filter(e => !e.time).map(e => `<button class="cg-chip" style="--c:${colorOf(e)}" data-item="${esc(e.src)}|${esc(e.id)}|${e.date}">${esc(e.title)}</button>`).join("")}</div>`).join("")}</div>` : ""}
        <div class="cg-body"><div class="cg-gut">${hours.map(h => `<span style="top:${(h - h0) * H}px">${String(h).padStart(2, "0")}:00</span>`).join("")}</div>
          ${cols.map(k => `<div class="cg-col ${k === nowK ? "today" : ""}" data-day="${k}" style="height:${(h1 - h0) * H}px">${layout((by[k] || []).filter(e => e.time)).map(x => blockHTML(x, H, h0)).join("")}${k === nowK && nowM >= h0 * 60 && nowM <= h1 * 60 ? `<i class="cg-now" style="top:${(nowM - h0 * 60) / 60 * H}px"></i>` : ""}</div>`).join("")}</div>
        ${!timed.length ? `<div class="cg-emptymsg">${view === "day" ? (new Date(sel + "T12:00:00").getDay() % 6 === 0 ? "Wochenende. Nichts geplant." : "An diesem Tag ist nichts geplant.") : "Diese Woche ist nichts geplant."}</div>` : ""}
      </section>
      <p class="faint cg-hint">Tipp: In eine freie Stelle tippen legt dort einen Termin an.</p>
      ${up.length ? `<section class="col"><h2>Demnächst</h2><div class="card list">${up.map(e => `<button class="lrow" data-item="${esc(e.src)}|${esc(e.id)}|${e.date}"><span class="up-d" style="--c:${colorOf(e)}"><b>${new Date(e.date + "T12:00:00").getDate()}</b><small>${new Date(e.date + "T12:00:00").toLocaleDateString("de-AT", { month: "short" })}</small></span><div class="lrow-main"><div class="lrow-title">${esc(e.title)}</div><small class="muted">${[KIND[e.type] || "Termin", e.time, e.course && CBY[e.course] ? CBY[e.course].title : ""].filter(Boolean).map(esc).join(" · ")}</small></div><span class="chip">${daysUntil(e.date) === 1 ? "morgen" : "in " + daysUntil(e.date) + " Tagen"}</span></button>`).join("")}</div></section>` : ""}
    </div>`;
    /* zur aktuellen Uhrzeit bzw. zum ersten Termin scrollen ist hier nicht nötig: das Raster zeigt den ganzen Tag */
    const step = view === "day" ? 1 : 7;
    $("#c-prev", el).onclick = () => { sel = addDays(sel, -step); wk = monday(sel); draw(); };
    $("#c-next", el).onclick = () => { sel = addDays(sel, step); wk = monday(sel); draw(); };
    $("#c-now", el).onclick = () => { sel = today(); wk = monday(sel); draw(); };
    $$("[data-view]", el).forEach(b => b.onclick = () => { view = b.dataset.view; setView(view); draw(); });
    $("#c-add", el).onclick = () => App.eventForm(null, draw, { type: "other", date: sel });
    $("#c-tt", el).onclick = () => importDialog(draw);
    const rm = $("#c-rm", el); if (rm) rm.onclick = () => App.modal(`<h2>Stundenplan entfernen?</h2><p class="muted">Die Lehrveranstaltungen verschwinden aus dem Kalender. Deine eigenen Termine bleiben. Du kannst danach jederzeit einen anderen Stundenplan holen.</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Abbrechen</button><button class="btn danger" id="rm-yes">Entfernen</button></div>`, (m, close) => {
      $("#rm-yes", m).onclick = () => { S().timetable = []; S().ttSource = null; S().ttFH = null; App.save(); close(); App.toast("Stundenplan entfernt", "Hol dir jederzeit einen neuen.", "▦"); draw(); };
    });
    const rf = $("#c-ref", el); if (rf) rf.onclick = async () => {
      if (busy) return; busy = true; rf.classList.add("spin"); rf.disabled = true; $("#tt-st", el).textContent = "Wird aktualisiert …";
      try { const r = await refreshTT(true); App.toast("Stundenplan aktualisiert", r && r.changed ? "Es gibt Änderungen, der Kalender ist jetzt auf dem neuesten Stand." : "Alles aktuell, keine Änderungen.", "↻"); }
      catch (e) { App.toast("Aktualisieren fehlgeschlagen", fetchErr(e), "!"); }
      busy = false; draw();
    };
  };
  el.onclick = e => {
    const s = e.target.closest("[data-sel]"); if (s) { const k = s.dataset.sel; if (k !== sel) { sel = k; wk = monday(sel); draw(); } return; }
    const it = e.target.closest("[data-item]");
    if (!it) { const col = e.target.closest(".cg-col"); if (!col || e.target !== col) return;
      const r = col.getBoundingClientRect(), H = parseFloat(getComputedStyle(col.closest(".cg")).getPropertyValue("--h")) || 56, h0 = parseInt((col.parentNode.querySelector(".cg-gut span") || {}).textContent, 10) || 0;
      const m = Math.round(((e.clientY - r.top) / H * 60) / 15) * 15 + h0 * 60;
      App.eventForm(null, draw, { type: "other", date: col.dataset.day, time: fmtMin(Math.max(0, Math.min(23 * 60 + 45, m))) }); return; }
    const [src, id, date] = it.dataset.item.split("|");
    const ev = dayItems(date, date).find(x => x.src === src && x.id === id); if (!ev) return;
    if (src === "tt") { const c = ev.course && CBY[ev.course];
      App.modal(`<div class="ev-pop" style="--c:${colorOf(ev)}"><div class="spread"><span class="eyebrow">${c ? esc(c.title) : "Lehrveranstaltung"}</span><button class="btn ghost sm" data-close>✕</button></div><h2>${esc(ev.title)}</h2>
        <dl><dt>Wann</dt><dd>${fmtDate(ev.date, { weekday: "long", day: "numeric", month: "long" })}${ev.time ? ", " + ev.time + "–" + endTime(ev) : ""}</dd>${ev.loc ? `<dt>Raum</dt><dd>${esc(ev.loc)}</dd>` : ""}${ev.repeat === "weekly" ? `<dt>Wiederholung</dt><dd>wöchentlich${ev.until ? " bis " + fmtDate(ev.until, { day: "numeric", month: "long" }) : ""}</dd>` : ""}</dl>
        ${c ? `<button class="btn pri" data-go="course" data-p="${c.id}" data-close>Zur Fach-App</button>` : ""}</div>`); }
    else App.eventForm(ev, draw);
  };
  draw();
};
})();
