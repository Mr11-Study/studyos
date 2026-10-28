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
/* Gruppen-Bezeichnungen wie „Standardgruppe“, „Gruppe 1“, „Gruppe A“ aus dem Text eines Termins */
function groupsIn(t) { const out = []; (t.match(/\b(?:[Ss]tandardgruppe|[Gg]ruppe[ \t]+[A-Z0-9][A-Za-z0-9.-]{0,5})\b/g) || []).forEach(g => { g = g.replace(/\s+/g, " ").replace(/^gruppe/i, "Gruppe").replace(/^standardgruppe$/i, "Standardgruppe"); if (!out.includes(g)) out.push(g); }); return out; }
App.parseICS = function (txt) {
  const out = [];
  unfold(txt).split("BEGIN:VEVENT").slice(1).forEach((blk, i) => {
    const props = {};
    blk.split("END:VEVENT")[0].split("\n").forEach(line => { const k = line.indexOf(":"); if (k < 0) return; const head = line.slice(0, k), val = line.slice(k + 1); const name = head.split(";")[0].toUpperCase(); if (name === "EXDATE") (props.EXDATE = props.EXDATE || []).push(...val.split(",")); else if (!(name in props)) props[name] = val; });
    const st = props.DTSTART && icsDate(props.DTSTART); if (!st) return;
    const en = props.DTEND && icsDate(props.DTEND);
    const title = unesc(props.SUMMARY || "Termin"), loc = unesc(props.LOCATION || "").replace(/^[\s.,;·-]+/, "");
    const ev = { id: "tt" + i + "-" + st.date + (st.time || ""), title, loc, date: st.date, time: st.time, min: en && en.ts && st.ts ? Math.round((en.ts - st.ts) / 60000) : 0, course: guessCourse(title + " " + unesc(props.DESCRIPTION || "")) };
    const grp = groupsIn([props.SUMMARY, props.DESCRIPTION, props.CATEGORIES, props.COMMENT, props.LOCATION].filter(Boolean).map(unesc).join(" ")); if (grp.length) ev.grp = grp;
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
  if (LV) return lvItems(from, to);
  const ev = App.eventsBetween(from, to, false).filter(e => e.type !== "info" && !(e.src === "course" && e.type === "class"));
  return timetable(from, to).concat(ev).sort((a, b) => (a.date + (a.time || "99")).localeCompare(b.date + (b.time || "99")));
}
App.calendarItems = dayItems;

async function importText(txt, source) {
  const list = App.parseICS(txt);
  if (!list.length) { App.toast("Keine Termine gefunden", "Die Datei enthält keine Kalendereinträge (.ics).", "!"); return false; }
  S().timetable = list; S().ttSource = Object.assign({ at: Date.now() }, source); App.save();
  const own = (S().events || []).length; App.toast("Stundenplan importiert", list.length + " Einträge übernommen." + (own ? ` Deine ${own} eigenen Termine bleiben unverändert.` : ""), "▦"); return true;
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
    if (changed && force !== true && ["calendar", "dash"].includes(App.route().v)) App.softRender();
    return { changed, count: l.length };
  });
  ttBusy.catch(() => {}).finally(() => { ttBusy = null; });
  return force === true ? ttBusy : ttBusy.catch(() => null);
}
App.refreshTimetable = refreshTT;
App.afterBoot.push(() => { const tick = () => refreshTT();
  const st = S(); if (st.ttSource && st.ttSource.url && !st.ttGrp) refreshTT(true).then(() => { st.ttGrp = 1; App.save(); if (App.route().v === "calendar" && !document.querySelector(".modal-back")) App.render(); }, () => {}); tick(); setInterval(tick, 60e3); document.addEventListener("visibilitychange", tick); window.addEventListener("online", tick); });

/* FH JOANNEUM: Abo-Link der Stundenplan-Suche (almaty) aus Studiengang, Semester und Gruppe bauen */
const FH_BASE = "almaty.fh-joanneum.at/stundenplan/search.php?q=";
const fhTerm = (op, v, neg) => { v = String(v || "").trim(); if (!v) return ""; const t = (neg ? "-" : "") + op + ":" + v; return /\s/.test(v) ? '"' + t + '"' : t; };
/* Gruppen der FH: „Standardgruppe“ (für alle) plus Gruppen wie „Gruppe 1“ oder „Gruppe A“. Jeder Studiengang benennt sie anders,
   deshalb liest StudyOS die vorhandenen Gruppen aus dem Stundenplan selbst aus (f.groups). Die FH verknüpft Suchbegriffe mit UND,
   daher werden nicht die eigenen Gruppen gesucht, sondern alle anderen ausgeblendet. */
const STD = "Standardgruppe", GDEF = ["Gruppe 1", "Gruppe 2", "Gruppe A", "Gruppe B"];
const isStd = g => /^standardgruppe$/i.test(g);
const gLabel = g => /^\w{1,3}$/.test(g) ? "Gruppe " + g.toUpperCase() : g;
const gShort = g => isStd(g) ? "Standard" : g.replace(/^gruppe\s+/i, "");
const gSort = (x, y) => isStd(x) ? -1 : isStd(y) ? 1 : x.localeCompare(y, "de", { numeric: true });
function fhExcl(f) { const mine = f.mine || []; return mine.length ? (f.groups || []).filter(g => !isStd(g) && !mine.includes(g)) : []; }
function fhQuery(f) {
  const g = fhExcl(f).map(x => fhTerm("gruppe", x, true));
  return [fhTerm("studiengang", f.sg), fhTerm("fachsemester", f.sem), ...g, String(f.extra || "").trim()].filter(Boolean).join(" ");
}
/* gespeicherte Auswahl vereinheitlichen: { groups, mine } mit vollen Bezeichnungen; ältere Freitext-Auswahl (nur/ohne) wird umgerechnet */
function fhGroups(saved) {
  if (Array.isArray(saved.groups)) return { groups: saved.groups.slice(), mine: (saved.mine || []).map(gLabel) };
  const list = String(saved.gruppe || "").split(",").map(x => gLabel(x.trim())).filter(Boolean);
  const groups = [...new Set(GDEF.concat(list))].sort(gSort);
  if (!list.length) return { groups, mine: [] };
  return saved.gmode === "nur" ? { groups, mine: list.filter(g => !isStd(g)) } : { groups, mine: groups.filter(g => !isStd(g) && !list.includes(g)) };
}
const fhURL = f => "webcal://" + FH_BASE + encodeURIComponent(fhQuery(f).replace(/"/g, "&quot;")).replace(/%20/g, "+");
/* aus einem bestehenden FH-Link die Felder zurückgewinnen, damit man ihn später anpassen kann */
function fhParse(url) {
  try {
    const u = new URL(String(url).replace(/^webcal:/i, "https:")); if (!/fh-joanneum\.at$/i.test(u.hostname)) return null;
    const q = (u.searchParams.get("q") || "").replace(/&quot;/g, '"'), f = { sg: "", sem: "", gruppe: "", gmode: "nur", extra: "" }, rest = [], gs = [];
    (q.match(/"[^"]*"|\S+/g) || []).forEach(t => { const x = t.replace(/^"|"$/g, ""), m = x.match(/^(-?)(studiengang|fachsemester|gruppe):(.+)$/i);
      if (!m) return rest.push(t); const k = m[2].toLowerCase();
      if (k === "studiengang" && !m[1]) f.sg = m[3]; else if (k === "fachsemester" && !m[1]) f.sem = m[3]; else if (k === "gruppe") { gs.push(m[3]); f.gmode = m[1] ? "ohne" : "nur"; } else rest.push(t); });
    f.gruppe = gs.join(", "); Object.assign(f, fhGroups(f)); delete f.gruppe; delete f.gmode; f.extra = rest.join(" "); return f;
  } catch (e) { return null; }
}
App.fhTimetable = { query: fhQuery, url: fhURL, parse: fhParse };

function importDialog(onDone) {
  const src = S().ttSource || {}, saved = S().ttFH || fhParse(src.url) || {};
  const f = Object.assign({ sg: saved.sg || "IMA", sem: saved.sem || String(App.SEM || 1), extra: saved.extra || "" }, fhGroups(saved)), ex = {};
  const fhOn = !src.url || /fh-joanneum\.at/i.test(src.url) || !!S().ttFH;
  App.modal(`<div class="spread"><h2>Stundenplan holen</h2><button class="btn ghost sm" data-close>✕</button></div>
    <div class="tt-tabs" role="tablist"><button role="tab" data-tab="fh" class="${fhOn ? "on" : ""}">FH JOANNEUM</button><button role="tab" data-tab="link" class="${fhOn ? "" : "on"}">Link oder Datei</button></div>
    <section class="tt-pane col" data-pane="fh" ${fhOn ? "" : "hidden"}>
      <p class="muted" style="font-size:14px">StudyOS holt deinen Stundenplan direkt aus der <a href="https://almaty.fh-joanneum.at/stundenplan/" target="_blank" rel="noopener">Stundenplan-Suche der FH</a> und lädt ihn alle 30 Minuten neu. Wähle aus, was du sehen willst.</p>
      <div class="tt-fh">
        <label class="fld">Studiengang<input type="text" id="fh-sg" value="${esc(f.sg)}" placeholder="z. B. IMA" autocapitalize="characters" spellcheck="false"><small class="muted">Kürzel, Wirtschaftsinformatik = IMA</small></label>
        <label class="fld">Fachsemester<select id="fh-sem">${[1, 2, 3, 4, 5, 6].map(n => `<option value="${n}" ${String(n) === String(f.sem) ? "selected" : ""}>${n}. Semester</option>`).join("")}<option value="" ${f.sem ? "" : "selected"}>alle</option></select></label>
        <div class="fld tt-fh-wide"><span>Deine Gruppen <small class="muted">(optional)</small></span>
          <div class="tt-gsel" id="fh-gs"></div>
          <small class="muted" id="fh-gst">Tippe die Gruppen an, in denen du bist. Die anderen werden ausgeblendet, Vorlesungen für alle (Standardgruppe) bleiben immer drin.</small>
          <div class="tt-gprev" id="fh-prev" aria-live="polite"></div></div>
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
    const read = () => ({ sg: $("#fh-sg", m).value.trim().toUpperCase(), sem: $("#fh-sem", m).value, groups: f.groups.slice(), mine: f.mine.slice(), extra: $("#fh-ex", m).value.trim() });
    const gst = $("#fh-gst", m), hint = gst.textContent;
    /* Gruppen-Knöpfe: genau die Gruppen, die es in diesem Studiengang gibt, plus Feld für eine eigene */
    const chips = () => { $("#fh-gs", m).innerHTML = f.groups.filter(g => !isStd(g)).map(g => `<button type="button" class="tt-g ${f.mine.includes(g) ? "on" : ""}" data-g="${esc(g)}" aria-pressed="${f.mine.includes(g)}" title="${esc(g)}">${esc(gShort(g))}</button>`).join("")
        + `<input type="text" class="tt-gadd" id="fh-gadd" placeholder="+ andere" aria-label="Andere Gruppe hinzufügen, z. B. Gruppe C" spellcheck="false">`;
      $$("[data-g]", m).forEach(b => b.onclick = () => { const g = b.dataset.g; f.mine = f.mine.includes(g) ? f.mine.filter(x => x !== g) : f.mine.concat(g); chips(); show(); });
      $("#fh-gadd", m).onkeydown = e => { if (e.key !== "Enter") return; e.preventDefault(); const g = gLabel(e.target.value.trim()); if (!g || isStd(g)) return;
        if (!f.groups.includes(g)) f.groups = f.groups.concat(g).sort(gSort); if (!f.mine.includes(g)) f.mine.push(g); chips(); show(); $("#fh-gadd", m).focus(); }; };
    /* Live-Beispiel: welche Gruppen bleiben, welche fallen weg, mit echten Lehrveranstaltungen als Beispiel */
    const preview = () => { const out = fhExcl(f), sample = g => ex[g] ? [...ex[g]].slice(0, 2).join(", ") : "";
      const rows = [[STD, sample(STD) || "Vorlesungen für alle", true]].concat(f.groups.filter(g => !isStd(g)).map(g => [g, sample(g), !out.includes(g)]));
      $("#fh-prev", m).innerHTML = `<span class="eyebrow">So filtert StudyOS</span>${rows.map(([n, d, on]) => `<div class="tt-gr ${on ? "in" : "out"}"><i aria-hidden="true">${on ? "✓" : "✕"}</i><b>${esc(n)}</b><small>${on ? esc(d || "wird angezeigt") : "ausgeblendet"}</small></div>`).join("")}${f.mine.length ? "" : `<small class="muted">Noch keine Gruppe gewählt: Du siehst alle Gruppen.</small>`}`; };
    const show = () => { $("#fh-q", m).textContent = fhQuery(read()) || "–"; preview(); };
    /* die echten Gruppen des Studiengangs aus dem ungefilterten Stundenplan lesen */
    let seen = "", timer = 0;
    const discover = async () => { const sg = $("#fh-sg", m).value.trim().toUpperCase(), sem = $("#fh-sem", m).value, key = sg + "|" + sem;
      if (!sg || key === seen) return; seen = key; gst.textContent = `Suche die Gruppen von ${sg}${sem ? " im " + sem + ". Semester" : ""} …`;
      try { const list = App.parseICS(await fetchURL(fhURL({ sg, sem }))); if (seen !== key) return;
        Object.keys(ex).forEach(k => delete ex[k]);
        list.forEach(e => (e.grp || []).forEach(g => (ex[g] = ex[g] || new Set()).add(e.title.replace(/\s*[-,(]?\s*(Standardgruppe|Gruppe\s+\S+)\)?/gi, "").trim() || e.title)));
        const found = Object.keys(ex).filter(g => !isStd(g)).sort(gSort);
        if (found.length) { f.groups = [STD].concat(found); f.mine = f.mine.filter(g => found.includes(g)); gst.textContent = `${found.length} Gruppen im Stundenplan von ${sg} gefunden. Tippe die an, in denen du bist. Vorlesungen für alle bleiben immer drin.`; }
        else if (list.length) { f.groups = [STD]; f.mine = []; gst.textContent = `Im Stundenplan von ${sg} stehen keine Gruppen, du siehst einfach alles. Falls doch, trag deine Gruppe bei „+ andere“ ein.`; }
        else gst.textContent = `Für ${sg}${sem ? " im " + sem + ". Semester" : ""} hat die FH gerade keine Termine. Stimmt das Kürzel?`;
      } catch (e) { if (seen === key) { seen = ""; gst.textContent = "Die Gruppen ließen sich gerade nicht abrufen. " + hint; } }
      chips(); show(); };
    ["#fh-sg", "#fh-sem", "#fh-ex"].forEach(id => $(id, m).addEventListener("input", () => { show(); clearTimeout(timer); timer = setTimeout(discover, 700); }));
    chips(); show(); discover();
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

/* ---------- Lehrende: was eine Lehrperson unterrichtet, direkt aus der FH-Suche (referent:) ----------
   Mit Studiengang nur die Lehrveranstaltungen in diesem Studiengang, ohne alle Fächer. Nur eine Ansicht: dein Stundenplan bleibt unverändert. */
let LV = null;
const LVKEY = "studyos.lvRecent";
const lvRecent = () => { try { return JSON.parse(localStorage.getItem(LVKEY) || "[]"); } catch (e) { return []; } };
const lvRemember = f => { try { localStorage.setItem(LVKEY, JSON.stringify([{ name: f.name, sg: f.sg }].concat(lvRecent().filter(x => x.name.toLowerCase() !== f.name.toLowerCase() || x.sg !== f.sg)).slice(0, 6))); } catch (e) {} };
const lvQuery = f => [fhTerm("referent", f.name), fhTerm("studiengang", f.sg)].filter(Boolean).join(" ");
const lvURL = f => "webcal://" + FH_BASE + encodeURIComponent(lvQuery(f).replace(/"/g, "&quot;")).replace(/%20/g, "+");
const lvItems = (from, to) => LV.list.flatMap(e => expandTT(e, from, to)).map(e => Object.assign({}, e, { src: "lv", type: "class" }));
const lvTitle = t => t.replace(/\s*[-,(]?\s*(Standardgruppe|Gruppe\s+\S+)\)?/gi, "").trim() || t;
/* läuft gerade etwas, sonst das Nächste in den kommenden 8 Wochen */
function lvNow() {
  const k = today(), m = new Date().getHours() * 60 + new Date().getMinutes();
  const l = lvItems(k, addDays(k, 56)).filter(e => e.time).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const now = l.find(e => e.date === k && toMin(e.time) <= m && m < toMin(e.time) + durOf(e));
  return now ? { now } : { next: l.find(e => e.date > k || toMin(e.time) > m) };
}
function lvDialog(onDone) {
  const last = LV || lvRecent()[0] || { name: "", sg: "" }, rec = lvRecent();
  App.modal(`<div class="spread"><h2>Lehrende ansehen</h2><button class="btn ghost sm" data-close>✕</button></div>
    <p class="muted" style="font-size:14px">Sieh nach, was jemand gerade unterrichtet. StudyOS fragt die <a href="https://almaty.fh-joanneum.at/stundenplan/" target="_blank" rel="noopener">Stundenplan-Suche der FH</a>, dein eigener Stundenplan bleibt dabei unverändert.</p>
    <div class="tt-fh">
      <label class="fld">Name<input type="text" id="lv-n" value="${esc(last.name)}" placeholder="z. B. Radeke" list="lv-rec" spellcheck="false" autocomplete="off"><small class="muted">Der Nachname reicht meistens.</small></label>
      <label class="fld">Studiengang <small class="muted">(optional)</small><input type="text" id="lv-sg" value="${esc(last.sg || "")}" placeholder="leer = alle Fächer" autocapitalize="characters" spellcheck="false"><small class="muted">z. B. IMA oder DAT. Leer lassen zeigt alles, was die Person unterrichtet.</small></label>
    </div>
    <datalist id="lv-rec">${rec.map(r => `<option value="${esc(r.name)}">`).join("")}</datalist>
    ${rec.length ? `<div class="lv-rec"><span class="eyebrow">Zuletzt</span>${rec.map((r, i) => `<button type="button" class="tt-g" data-rec="${i}">${esc(r.name)}${r.sg ? " · " + esc(r.sg) : ""}</button>`).join("")}</div>` : ""}
    <div class="tt-q"><span class="eyebrow">Suche bei der FH</span><code id="lv-q"></code></div>
    <small class="muted" id="lv-msg" aria-live="polite"></small>
    <div class="row" style="justify-content:flex-end"><button class="btn pri" id="lv-go">Plan ansehen</button></div>`, (m, close) => {
    const read = () => ({ name: $("#lv-n", m).value.trim().replace(/\s+/g, " "), sg: $("#lv-sg", m).value.trim().toUpperCase() });
    const show = () => { $("#lv-q", m).textContent = lvQuery(read()) || "–"; };
    ["#lv-n", "#lv-sg"].forEach(id => $(id, m).addEventListener("input", show));
    $$("[data-rec]", m).forEach(b => b.onclick = () => { const r = rec[+b.dataset.rec]; $("#lv-n", m).value = r.name; $("#lv-sg", m).value = r.sg || ""; show(); go(); });
    const msg = $("#lv-msg", m), btn = $("#lv-go", m);
    const go = async () => { const f = read(); if (!f.name) { msg.textContent = "Bitte einen Namen eintragen."; return $("#lv-n", m).focus(); }
      msg.textContent = "Suche …"; btn.disabled = true;
      try { const list = App.parseICS(await fetchURL(lvURL(f)));
        if (!list.length) { msg.textContent = `Für „${f.name}“${f.sg ? " in " + f.sg : ""} hat die FH keine Termine. Stimmt die Schreibweise?${f.sg ? " Versuch es ohne Studiengang." : ""}`; return; }
        LV = { name: f.name, sg: f.sg, list, at: Date.now() }; lvRemember(f); close();
        const n = lvNow(); onDone(n.now ? n.now.date : n.next ? n.next.date : null);
      } catch (e) { msg.textContent = fetchErr(e); } finally { btn.disabled = false; } };
    btn.onclick = go; $("#lv-n", m).onkeydown = $("#lv-sg", m).onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); go(); } };
    show(); $("#lv-n", m).focus();
  });
}
function lvBarHTML() {
  const n = lvNow(), e = n.now || n.next, when = e ? (n.now ? `<b class="lv-live">Gerade</b> ${esc(lvTitle(e.title))}${e.loc ? " · " + esc(e.loc) : ""} bis ${endTime(e)}` : `Als Nächstes: ${esc(lvTitle(e.title))}, ${e.date === today() ? "heute" : fmtDate(e.date, { weekday: "short", day: "numeric", month: "numeric" })} ${e.time}${e.loc ? " · " + esc(e.loc) : ""}`) : "In den nächsten Wochen keine Termine.";
  const subj = [...new Set(LV.list.map(x => lvTitle(x.title)))].sort((a, b) => a.localeCompare(b, "de"));
  return `<section class="tt-bar lv-bar"><span class="tt-bar-ic" aria-hidden="true">◉</span><div class="tt-bar-t"><b>Plan von ${esc(LV.name)}</b><small>${LV.sg ? esc(LV.sg) : "alle Studiengänge"} · ${subj.length} ${subj.length === 1 ? "Fach" : "Fächer"}</small><small class="lv-when">${when}</small></div>
    <div class="tt-bar-a"><button class="btn sm" id="lv-edit">Andere Person</button><button class="btn sm pri" id="lv-off">Zurück zu meinem Plan</button></div>
    <div class="lv-subj">${subj.slice(0, 16).map(t => `<span class="chip">${esc(t)}</span>`).join("")}${subj.length > 16 ? `<span class="chip">+${subj.length - 16}</span>` : ""}</div></section>`;
}

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
  const grp = (e.grp || []).filter(g => !/^standardgruppe$/i.test(g)).map(g => g.replace(/^gruppe\s+/i, ""));
  const own = e.src === "user";
  return `<button class="cg-ev ${own ? "own" : ""} ${grp.length ? "has-grp" : ""} ${ht < 44 ? "tiny" : ht < 80 ? "short" : ""} ${e.done ? "done" : ""}" style="--c:${colorOf(e)};top:${top}px;height:${ht}px;left:calc(${x.col} * 100% / ${x.n} + 2px);width:calc(100% / ${x.n} - 4px)" data-item="${esc(e.src)}|${esc(e.id)}|${e.date}" title="${esc(e.title + (grp.length ? " · Gruppe " + grp.join(", ") : "") + (e.loc ? " · " + e.loc : "") + " · " + e.time + "–" + endTime(e))}">
    ${own ? `<span class="cg-own" aria-label="Eigener Termin">★</span>` : ""}${c ? `<span class="cg-tag">${esc(c.short)}</span>` : e.type !== "class" ? `<span class="cg-tag">${esc(own ? "Eigener Termin" : KIND[e.type] || "Termin")}</span>` : ""}<b class="t-long">${esc(e.title)}</b><b class="t-short">${esc(c ? c.title : e.title)}</b><small>${sub}</small>${grp.length ? `<span class="cg-grp" aria-label="Gruppe ${esc(grp.join(", "))}">${esc(grp.join("·"))}</span>` : ""}</button>`;
}

/* ---------- Stundenplan und eigene Termine in den eigenen Kalender (Google, Apple, Outlook) ---------- */
const icsEsc = v => String(v || "").replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const icsDT = (k, t) => k.replace(/-/g, "") + "T" + t.replace(":", "") + "00";
function buildICS(withTT, withOwn) {
  const from = addDays(today(), -14), to = addDays(today(), 220), stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const items = (withTT ? timetable(from, to) : []).concat(withOwn ? App.eventsBetween(from, to, false).filter(e => e.src === "user") : []);
  const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//StudyOS//DE", "CALSCALE:GREGORIAN", "X-WR-CALNAME:StudyOS", "X-WR-TIMEZONE:Europe/Vienna"];
  items.forEach(e => {
    L.push("BEGIN:VEVENT", "UID:" + (e.src + "-" + e.id + "-" + e.date).replace(/[^\w-]/g, "") + "@studyos", "DTSTAMP:" + stamp, "SUMMARY:" + icsEsc(e.title));
    if (e.time) { const en = toMin(e.time) + durOf(e); L.push("DTSTART;TZID=Europe/Vienna:" + icsDT(e.date, e.time), "DTEND;TZID=Europe/Vienna:" + icsDT(en >= 1440 ? addDays(e.date, 1) : e.date, fmtMin(en))); }
    else L.push("DTSTART;VALUE=DATE:" + e.date.replace(/-/g, ""), "DTEND;VALUE=DATE:" + addDays(e.date, 1).replace(/-/g, ""));
    if (e.loc) L.push("LOCATION:" + icsEsc(e.loc));
    const d = [e.note, e.course && CBY[e.course] ? "Kurs: " + CBY[e.course].title : "", e.src === "user" ? "Eigener Termin aus StudyOS" : ""].filter(Boolean).join("\n"); if (d) L.push("DESCRIPTION:" + icsEsc(d));
    L.push("END:VEVENT");
  });
  L.push("END:VCALENDAR"); return { text: L.join("\r\n"), n: items.length };
}
App.buildICS = buildICS;
function outDialog() {
  const src = S().ttSource || {}, url = /^(https?|webcal):\/\//i.test(src.url || "") ? src.url.trim() : "", https = url.replace(/^webcal:/i, "https:"), webcal = url.replace(/^https?:/i, "webcal:");
  const nOwn = (S().events || []).length, nTT = (S().timetable || []).length;
  App.modal(`<div class="spread"><h2>In meinen Kalender</h2><button class="btn ghost sm" data-close>✕</button></div>
    ${url ? `<section class="col" style="gap:8px"><h3>Stundenplan abonnieren <small class="muted">empfohlen</small></h3><p class="muted" style="font-size:14px">Dein Kalender holt den Stundenplan direkt von der FH und bleibt so von selbst aktuell, auch wenn sich ein Raum oder eine Uhrzeit ändert.</p>
      <div class="row" style="flex-wrap:wrap;gap:6px"><a class="btn pri sm" target="_blank" rel="noopener noreferrer" href="https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}">Google Kalender</a><a class="btn sm" href="${esc(webcal)}">iPhone, iPad, Mac</a><a class="btn sm" target="_blank" rel="noopener noreferrer" href="https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(https)}&name=${encodeURIComponent(src.name || "Stundenplan")}">Outlook</a><button class="btn ghost sm" id="o-copy">Link kopieren</button></div>
      <small class="muted">Android: In Google Kalender am Handy erscheint der Stundenplan, sobald er im Browser hinzugefügt wurde (dasselbe Google-Konto). Samsung- oder Xiaomi-Kalender zeigen Google-Kalender automatisch mit an.</small></section><div class="divider"></div>` : `<p class="muted" style="font-size:14px">Dein Stundenplan kommt aus einer Datei, darum gibt es kein Abo. Mit der Datei unten übernimmst du ihn trotzdem.</p>`}
    <section class="col" style="gap:8px"><h3>Als Datei (.ics)</h3><p class="muted" style="font-size:14px">Einmalig übernehmen, auch für deine eigenen Termine. Nach Änderungen einfach neu exportieren, doppelte Einträge gibt es dabei nicht.</p>
      <label class="row" style="gap:8px"><input type="checkbox" id="o-tt" ${nTT ? "checked" : "disabled"}> Stundenplan (${nTT} Einträge)</label>
      <label class="row" style="gap:8px"><input type="checkbox" id="o-own" ${nOwn ? "checked" : "disabled"}> Eigene Termine (${nOwn})</label>
      <div class="row"><button class="btn sm" id="o-dl">.ics herunterladen</button></div>
      <small class="muted">Öffnen: am iPhone die Datei antippen, am Laptop doppelklicken (Outlook, Apple Kalender) oder in Google Kalender unter Einstellungen › Importieren hochladen.</small></section>`, (m, close) => {
    const cp = $("#o-copy", m); if (cp) cp.onclick = () => (navigator.clipboard ? navigator.clipboard.writeText(https) : Promise.reject()).then(() => App.toast("Kopiert", "Kalender-Link in der Zwischenablage.", "⎘"), () => prompt("Kopieren:", https));
    $("#o-dl", m).onclick = () => { const r = buildICS($("#o-tt", m).checked, $("#o-own", m).checked); if (!r.n) { App.toast("Nichts zu exportieren", "Wähle Stundenplan oder eigene Termine.", "!"); return; } App.download("studyos-kalender.ics", r.text, "text/calendar"); App.toast("Exportiert", r.n + " Termine in studyos-kalender.ics.", "▦"); close(); };
  });
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
          <button class="btn sm" id="c-lv" aria-pressed="${!!LV}">Lehrende</button><button class="btn pri sm" id="c-add">+ Termin</button></div></header>
      ${App.calSyncHTML ? App.calSyncHTML() : ""}
      ${LV ? lvBarHTML() : hasTT ? `<section class="tt-bar"><span class="tt-bar-ic" aria-hidden="true">▦</span><div class="tt-bar-t"><b>${esc((src && src.name) || "Stundenplan")}</b><small id="tt-st">${src && src.url ? "Abo · aktualisiert " + ago(src.at || Date.now()) : "aus Datei · wird nicht automatisch aktualisiert"} · ${S().timetable.length} Einträge</small></div>
          <div class="tt-bar-a">${src && src.url ? `<button class="btn sm" id="c-ref"><span class="rf" aria-hidden="true">↻</span> Aktualisieren</button>` : ""}<button class="btn sm" id="c-out">In meinen Kalender</button><button class="btn sm ghost" id="c-tt">Ändern</button><button class="btn sm ghost" id="c-rm">Entfernen</button></div></section>`
        : `<section class="card tt-empty"><div class="tt-ill" aria-hidden="true"><i></i><i></i><i></i></div><div><h3>Hol dir deinen Stundenplan</h3><p class="muted">Wähle Studiengang und Semester der FH JOANNEUM oder füge einen Kalender-Link ein. Dann siehst du hier jede Lehrveranstaltung mit Raum und Uhrzeit.</p><button class="btn pri" id="c-tt">Stundenplan holen</button></div></section>`}
      ${view === "day" ? `<div class="cg-strip">${days.map(k => { const d = new Date(k + "T12:00:00"), n = (by[k] || []).length; return `<button class="wk-day ${k === sel ? "on" : ""} ${k === nowK ? "today" : ""}" data-sel="${k}"><small>${WD[(d.getDay() + 6) % 7]}</small><b>${d.getDate()}</b><span class="wk-dots">${(by[k] || []).slice(0, 4).map(e => `<i style="--c:${colorOf(e)}"></i>`).join("")}${n > 4 ? "<em>+</em>" : ""}</span></button>`; }).join("")}</div>` : ""}
      <section class="cg cg-${view}" style="--cols:${cols.length};--h:${H}px">
        <div class="cg-head"><div class="cg-gut"></div>${view === "day" ? `<div class="cg-dh today-ish"><b>${fmtDate(sel, { weekday: "long", day: "numeric", month: "long" })}</b></div>` : cols.map(head).join("")}</div>
        ${allday ? `<div class="cg-all"><div class="cg-gut"><small>ganzt.</small></div>${cols.map(k => `<div class="cg-ac">${(by[k] || []).filter(e => !e.time).map(e => `<button class="cg-chip ${e.src === "user" ? "own" : ""}" style="--c:${colorOf(e)}" data-item="${esc(e.src)}|${esc(e.id)}|${e.date}">${esc(e.title)}</button>`).join("")}</div>`).join("")}</div>` : ""}
        <div class="cg-body"><div class="cg-gut">${hours.map(h => `<span style="top:${(h - h0) * H}px">${String(h).padStart(2, "0")}:00</span>`).join("")}</div>
          ${cols.map(k => `<div class="cg-col ${k === nowK ? "today" : ""}" data-day="${k}" style="height:${(h1 - h0) * H}px">${layout((by[k] || []).filter(e => e.time)).map(x => blockHTML(x, H, h0)).join("")}${k === nowK && nowM >= h0 * 60 && nowM <= h1 * 60 ? `<i class="cg-now" style="top:${(nowM - h0 * 60) / 60 * H}px"></i>` : ""}</div>`).join("")}</div>
        ${!timed.length ? `<div class="cg-emptymsg">${LV ? `${esc(LV.name)} unterrichtet ${view === "day" ? "an diesem Tag" : "diese Woche"} nichts${LV.sg ? " in " + esc(LV.sg) : ""}.` : view === "day" ? (new Date(sel + "T12:00:00").getDay() % 6 === 0 ? "Wochenende. Nichts geplant." : "An diesem Tag ist nichts geplant.") : "Diese Woche ist nichts geplant."}</div>` : ""}
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
    const tt = $("#c-tt", el); if (tt) tt.onclick = () => importDialog(draw);
    const lvOpen = () => lvDialog(d => { if (d && !dayItems(view === "day" ? sel : wk, view === "day" ? sel : addDays(wk, 6)).some(x => x.time)) { sel = d; wk = monday(d); } draw(); });
    $("#c-lv", el).onclick = lvOpen;
    const le = $("#lv-edit", el); if (le) le.onclick = lvOpen;
    const lo = $("#lv-off", el); if (lo) lo.onclick = () => { LV = null; draw(); };
    const out = $("#c-out", el); if (out) out.onclick = () => outDialog();
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
    if (src === "tt" || src === "lv") { const c = ev.course && CBY[ev.course];
      App.modal(`<div class="ev-pop" style="--c:${colorOf(ev)}"><div class="spread"><span class="eyebrow">${c ? esc(c.title) : "Lehrveranstaltung"}</span><button class="btn ghost sm" data-close>✕</button></div><h2>${esc(ev.title)}</h2>
        <dl><dt>Wann</dt><dd>${fmtDate(ev.date, { weekday: "long", day: "numeric", month: "long" })}${ev.time ? ", " + ev.time + "–" + endTime(ev) : ""}</dd>${(ev.grp || []).length ? `<dt>Gruppe</dt><dd>${esc(ev.grp.join(", "))}</dd>` : ""}${ev.loc ? `<dt>Raum</dt><dd>${esc(ev.loc)}</dd>` : ""}${ev.repeat === "weekly" ? `<dt>Wiederholung</dt><dd>wöchentlich${ev.until ? " bis " + fmtDate(ev.until, { day: "numeric", month: "long" }) : ""}</dd>` : ""}</dl>
        ${c ? `<button class="btn pri" data-go="course" data-p="${c.id}" data-close>Zur Fach-App</button>` : ""}</div>`); }
    else App.eventForm(ev, draw);
  };
  draw();
};
})();
