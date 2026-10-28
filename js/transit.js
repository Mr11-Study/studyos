/* StudyOS · Unterwegs (4.45): nächster Bus, nächste Bim, nächster Zug zwischen Wohnort und Studienort
   Vorbild BusBahnBim: große Abfahrtszeit mit Countdown, Linien-Symbole, Verspätung live, Abfahrtsmonitor der Haltestelle.
   Daten: ÖBB-Fahrplan (deckt alle Öffis in Österreich ab, auch Graz Linien) über die freie transport.rest-Schnittstelle.
   Die Richtung passt sich der Uhrzeit und dem Stundenplan an: vor der ersten Einheit zur FH, danach nach Hause.
   Muss vor apps.js geladen werden (Hub-Seite) und vor settings-ui.js (Karte in den Einstellungen). */
(function () {
const { $, $$, esc, PAGES } = App;
const S = () => App.S();
const API = "https://v6.oebb.transport.rest";
const cfg = () => { const s = S().settings || (S().settings = {}); return s.transit || (s.transit = { home: null, uni: null, more: [], dash: true }); };
const PLACES = () => { const c = cfg(); return [["home", "Wohnort", "⌂", c.home], ["uni", "Studienort", "🎓", c.uni], ...(c.more || []).map((m, i) => ["m" + i, m.label || "Ort " + (i + 1), "★", m])]; };
const placeOf = k => { const x = (PLACES().find(p => p[0] === k) || [])[3]; return x && x.id ? x : null; };
const labelOf = k => (PLACES().find(p => p[0] === k) || [])[1] || "";
const ready = () => !!(placeOf("home") && placeOf("uni"));

/* ---------- Schnittstelle ---------- */
async function get(path, q) {
  const u = new URL(API + path); Object.entries(q || {}).forEach(([k, v]) => v != null && u.searchParams.set(k, v));
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 15000);
  try { const r = await fetch(u, { signal: ctl.signal }); if (!r.ok) throw new Error(r.status === 429 ? "busy" : "http " + r.status); return await r.json(); }
  finally { clearTimeout(t); }
}
const findStops = q => get("/locations", { query: q, results: 7, stops: "true", addresses: "false", poi: "false", linesOfStops: "false" }).then(a => (a || []).filter(x => x && x.id && (x.type === "stop" || x.type === "station")));
const nearStops = (lat, lon) => get("/locations/nearby", { latitude: lat, longitude: lon, results: 6, distance: 1200, linesOfStops: "false" }).then(a => (a || []).filter(x => x && x.id));
const departures = id => get("/stops/" + encodeURIComponent(id) + "/departures", { duration: 90, results: 12, remarks: "false", linesOfStops: "false" }).then(r => Array.isArray(r) ? r : (r && r.departures) || []);
const journeys = (from, to) => get("/journeys", { from, to, results: 5, stopovers: "false", remarks: "false", tickets: "false", polylines: "false", scheduledDays: "false" }).then(r => (r && r.journeys) || []);

/* ---------- Zeit ---------- */
const T = x => x ? new Date(x) : null;
const hm = d => d ? d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }) : "–";
const mins = d => d ? Math.round((d - Date.now()) / 60000) : null;
const inTxt = m => m == null ? "" : m <= 0 ? "jetzt" : m < 60 ? "in " + m + " min" : "in " + Math.floor(m / 60) + " h " + (m % 60) + " min";
const dur = (a, b) => { const m = Math.round((b - a) / 60000); return m < 60 ? m + " min" : Math.floor(m / 60) + " h " + String(m % 60).padStart(2, "0"); };
const delayTxt = s => s == null ? "" : s >= 60 ? `<span class="tr-late">+${Math.round(s / 60)}</span>` : `<span class="tr-ok">pünktlich</span>`;

/* ---------- Linien wie im BusBahnBim: farbige Kästchen ---------- */
const PROD = { tram: ["Bim", "#D2232A"], bus: ["Bus", "#0065B3"], suburban: ["S", "#00A0E1"], subway: ["U", "#7B3F98"], regional: ["R", "#E2001A"], regionalExp: ["REX", "#E2001A"], interregional: ["IR", "#5A5A5A"], national: ["Zug", "#2B2B2B"], nationalExpress: ["Zug", "#2B2B2B"], ferry: ["Schiff", "#00838F"], onCall: ["Ruf", "#8E6E00"] };
const lineCol = l => (PROD[(l && l.product) || ""] || [, "#6B7280"])[1];
const lineName = l => { if (!l) return "?"; let n = String(l.name || l.fahrtNr || "?").replace(/^(Tram|Str|Bus|STR)\s+/i, "").trim(); return n.length > 9 ? n.slice(0, 9) : n; };
const badge = l => `<span class="tr-line notranslate" translate="no" style="--lc:${lineCol(l)}" title="${esc((PROD[(l && l.product) || ""] || ["Linie"])[0] + " " + ((l && l.name) || ""))}">${esc(lineName(l))}</span>`;
const walkB = m => `<span class="tr-walk" title="${m} min zu Fuß">🚶${m ? `<small>${m}′</small>` : ""}</span>`;

/* ---------- Richtung nach Uhrzeit und Stundenplan ---------- */
function plan() {
  const t = App.today ? App.today() : new Date().toISOString().slice(0, 10);
  const cls = (App.calendarItems ? App.calendarItems(t, t) : []).filter(e => e.type === "class" && e.time).sort((a, b) => a.time.localeCompare(b.time));
  const now = new Date(), nowM = now.getHours() * 60 + now.getMinutes(), toM = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
  if (cls.length) {
    const first = cls[0], last = cls[cls.length - 1], endM = toM(last.time) + (last.min || 90);
    if (nowM < toM(first.time)) return { from: "home", to: "uni", why: `${first.title} beginnt um ${first.time}`, by: first.time };
    /* ab der ersten Einheit bist du an der FH: dann zeigt StudyOS den Weg nach Hause */
    if (nowM < endM) return { from: "uni", to: "home", why: `Letzte Einheit bis ${String(Math.floor(endM / 60)).padStart(2, "0")}:${String(endM % 60).padStart(2, "0")}` };
    return { from: "uni", to: "home", why: "Vorlesungen für heute vorbei" };
  }
  return now.getHours() < 13 ? { from: "home", to: "uni", why: "Heute keine Vorlesung im Kalender" } : { from: "uni", to: "home", why: "Heute keine Vorlesung im Kalender" };
}
let pick = null; /* gewählte Richtung auf der Seite, sonst automatisch */
const route = () => { const p = plan(); if (pick && placeOf(pick.from) && placeOf(pick.to)) return Object.assign({}, pick, { auto: false, why: "Selbst gewählt", by: null }); return Object.assign(p, { auto: true }); };

/* ---------- Daten holen, merken, regelmäßig neu ---------- */
const data = {}; /* key -> { at, j, d, err } */
const LS = "studyos.transit";
try { Object.assign(data, JSON.parse(localStorage.getItem(LS) || "{}")); } catch (e) {}
const persist = () => { try { localStorage.setItem(LS, JSON.stringify(data)); } catch (e) {} };
const keyOf = (a, b) => a.id + ">" + b.id;
const busy = new Set();
async function load(r, force) {
  const a = placeOf(r.from), b = placeOf(r.to); if (!a || !b) return null;
  const k = keyOf(a, b), cur = data[k];
  if (!force && cur && Date.now() - cur.at < 45000 && !cur.err) return cur;
  if (busy.has(k)) return cur; busy.add(k);
  try {
    const [j, d] = await Promise.all([journeys(a.id, b.id), departures(a.id).catch(() => [])]);
    data[k] = { at: Date.now(), j: j.map(slimJ), d: d.map(slimD) }; persist();
  } catch (e) { data[k] = Object.assign({}, cur || { j: [], d: [] }, { err: e.message === "busy" ? "busy" : navigator.onLine ? "down" : "offline", errAt: Date.now(), at: (cur && cur.at) || 0 }); }
  finally { busy.delete(k); }
  return data[k];
}
const slimL = l => l ? { name: l.name, product: l.product } : null;
const slimJ = j => ({ legs: (j.legs || []).map(g => ({ o: g.origin && g.origin.name, dst: g.destination && g.destination.name, dep: g.departure || g.plannedDeparture, pdep: g.plannedDeparture, dd: g.departureDelay, arr: g.arrival || g.plannedArrival, ad: g.arrivalDelay, pl: g.departurePlatform || g.plannedDeparturePlatform, line: slimL(g.line), dir: g.direction, walk: !!g.walking, x: !!g.cancelled })) });
const slimD = d => ({ when: d.when || d.plannedWhen, delay: d.delay, pl: d.platform || d.plannedPlatform, dir: d.direction, line: slimL(d.line), x: !!d.cancelled });
const realLegs = j => j.legs.filter(g => !g.walk);
const jDep = j => T((realLegs(j)[0] || j.legs[0] || {}).dep), jArr = j => T((j.legs[j.legs.length - 1] || {}).arr);
const upcoming = x => (x && x.j || []).filter(j => { const d = jDep(j); return d && d - Date.now() > -60000 && !j.legs.some(g => g.x); });
const walkMin = r => +((placeOf(r.from) || {}).walk || 0);
const firstWalk = j => j.legs[0] && j.legs[0].walk ? Math.max(1, Math.round((T(j.legs[0].arr) - T(j.legs[0].dep)) / 60000)) : 0;
const leaveAt = (j, r) => { const d = jDep(j); return d ? new Date(d - (walkMin(r) + firstWalk(j)) * 60000) : null; };

/* ---------- Bausteine ---------- */
function legsHTML(j) { return `<span class="tr-legs">${j.legs.map(g => g.walk ? walkB(Math.round((T(g.arr) - T(g.dep)) / 60000)) : badge(g.line)).join('<i class="tr-sep" aria-hidden="true">›</i>')}</span>`; }
function heroHTML(j, r) {
  const L = realLegs(j), f = L[0] || j.legs[0], dep = jDep(j), arr = jArr(j), lv = leaveAt(j, r), lm = mins(lv), ch = Math.max(0, L.length - 1);
  const by = r.by && arr ? (hm(arr) <= r.by ? `<span class="chip good">✓ rechtzeitig für ${r.by}</span>` : `<span class="chip warn">zu spät für ${r.by}</span>`) : "";
  return `<div class="tr-hero" data-dep="${dep ? dep.getTime() : ""}" data-leave="${lv ? lv.getTime() : ""}">
    <div class="tr-hl"><div class="tr-big tab" data-cd>${esc(inTxt(mins(dep)))}</div><div class="tr-go" data-lv>${lm == null ? "" : lm <= 0 ? "Jetzt losgehen!" : "Losgehen " + inTxt(lm)}</div></div>
    <div class="tr-hr">${legsHTML(j)}<div class="tr-tm tab"><b>${hm(dep)}</b> ${delayTxt(f.dd)} <span class="tr-arrow">→</span> <b>${hm(arr)}</b> ${f.pl ? `<span class="chip">Steig ${esc(f.pl)}</span>` : ""}</div>
      <small class="muted">${esc(f.o || "")}${f.dir ? " · Richtung " + esc(f.dir) : ""} · ${dur(dep, arr)} · ${ch ? ch + (ch === 1 ? " Umstieg" : " Umstiege") : "direkt"}</small>${by}</div></div>`;
}
function rowJ(j) {
  const L = realLegs(j), f = L[0] || j.legs[0], dep = jDep(j), arr = jArr(j);
  return `<div class="tr-row" data-dep="${dep ? dep.getTime() : ""}"><b class="tr-min tab" data-cd>${esc(inTxt(mins(dep)))}</b>${legsHTML(j)}<span class="tr-tm tab">${hm(dep)} ${delayTxt(f.dd)} → ${hm(arr)}</span><small class="muted">${Math.max(0, L.length - 1) ? (L.length - 1) + "× um" : "direkt"}</small></div>`;
}
function rowD(d) {
  const w = T(d.when), m = mins(w);
  return `<div class="tr-row tr-mon ${d.x ? "tr-x" : ""}" data-dep="${w ? w.getTime() : ""}">${badge(d.line)}<span class="tr-dir">${esc(d.dir || "")}</span>${d.pl ? `<small class="muted">Steig ${esc(d.pl)}</small>` : "<small></small>"}<b class="tr-min tab" data-cd data-short>${d.x ? "fällt aus" : m != null && m < 60 ? (m <= 0 ? "jetzt" : m + "′") : hm(w)}</b>${d.x ? "" : delayTxt(d.delay)}</div>`;
}
const stamp = x => x && x.at ? `Stand ${hm(new Date(x.at))}` : "";
const errTxt = x => !x || !x.err ? "" : x.err === "offline" ? "Kein Internet. Du siehst den letzten Stand." : x.err === "busy" ? "Der Fahrplan ist gerade überlastet, gleich nochmal." : "Der Fahrplan antwortet gerade nicht. Ich versuche es automatisch weiter.";

/* Countdown läuft ohne neues Laden weiter */
function tick(root) {
  $$("[data-dep]", root).forEach(n => {
    const d = +n.dataset.dep; if (!d) return; const m = Math.round((d - Date.now()) / 60000);
    if (m < -1 && n.classList.contains("tr-row")) { n.remove(); return; }
    const cd = $("[data-cd]", n); if (cd && !n.classList.contains("tr-x")) cd.textContent = cd.hasAttribute("data-short") ? (m < 60 ? (m <= 0 ? "jetzt" : m + "′") : hm(new Date(d))) : inTxt(m);
    const lv = $("[data-lv]", n), l = +n.dataset.leave; if (lv && l) { const k = Math.round((l - Date.now()) / 60000); lv.textContent = k <= 0 ? "Jetzt losgehen!" : "Losgehen " + inTxt(k); lv.classList.toggle("now", k <= 1); }
  });
}

/* ---------- Haltestelle suchen ---------- */
function stopPicker(host, cur, onPick) {
  host.innerHTML = `<div class="tr-pick"><input type="search" class="tr-q" placeholder="Haltestelle suchen, z. B. Jakominiplatz" autocomplete="off" value="${esc(cur ? cur.name : "")}" aria-label="Haltestelle suchen"><button type="button" class="btn ghost sm tr-here" title="Haltestellen in meiner Nähe">📍 Hier</button><div class="tr-sug" role="listbox" hidden></div></div>`;
  const q = $(".tr-q", host), sug = $(".tr-sug", host); let t = null, n = 0;
  const show = (list, msg) => { sug.hidden = false; sug.innerHTML = msg ? `<div class="tr-sm muted">${esc(msg)}</div>` : list.map((x, i) => `<button type="button" role="option" data-i="${i}"><b>${esc(x.name)}</b>${x.distance != null ? `<small>${x.distance} m</small>` : ""}</button>`).join("") || `<div class="tr-sm muted">Nichts gefunden.</div>`; sug._l = list; };
  q.addEventListener("input", () => { clearTimeout(t); const v = q.value.trim(); if (v.length < 2) { sug.hidden = true; return; } t = setTimeout(async () => { const my = ++n; show([], "Suche …"); try { const l = await findStops(v); if (my === n) show(l); } catch (e) { if (my === n) show([], "Fahrplan nicht erreichbar. Prüf dein Internet."); } }, 280); });
  $(".tr-here", host).addEventListener("click", () => {
    if (!navigator.geolocation) return show([], "Dein Browser kann den Standort nicht bestimmen.");
    show([], "Bestimme Standort …");
    navigator.geolocation.getCurrentPosition(async p => { try { show(await nearStops(p.coords.latitude, p.coords.longitude)); } catch (e) { show([], "Fahrplan nicht erreichbar."); } }, () => show([], "Standort nicht freigegeben."), { timeout: 10000, maximumAge: 120000 });
  });
  sug.addEventListener("click", e => { const b = e.target.closest("[data-i]"); if (!b) return; const x = sug._l[+b.dataset.i]; q.value = x.name; sug.hidden = true; onPick({ id: String(x.id), name: x.name }); });
  q.addEventListener("keydown", e => { if (e.key === "Enter") { const b = $("[data-i]", sug); if (b && !sug.hidden) { e.preventDefault(); b.click(); } } });
}

/* ---------- Seite „Unterwegs“ ---------- */
let timer = null;
function stopTimer() { clearInterval(timer); timer = null; }
PAGES.transit = el => {
  stopTimer();
  if (!ready()) {
    el.innerHTML = `<div class="page tr-page"><header><span class="eyebrow">Öffis</span><h1>Unterwegs</h1><p class="muted">Sag StudyOS, wo du wohnst und wo du studierst. Dann siehst du hier immer den nächsten Bus, die nächste Bim oder den nächsten Zug, passend zur Uhrzeit und zu deinem Stundenplan.</p></header>
      <div class="card col tr-setup">${placesHTML()}</div></div>`;
    bindPlaces($(".tr-setup", el), () => App.render());
    return;
  }
  const r = route(), a = placeOf(r.from), b = placeOf(r.to), others = PLACES().filter(p => p[3] && p[3].id);
  el.innerHTML = `<div class="page tr-page">
    <header class="tr-head"><span class="eyebrow">Öffis · live</span><h1>${r.to === "home" ? "Nach Hause" : r.to === "uni" ? "Zur FH" : "Nach " + esc(labelOf(r.to))}</h1><p class="muted">${esc(r.why)}${r.auto ? " · Richtung wählt sich automatisch" : ""}</p></header>
    <div class="tr-ways">
      <div class="tr-way"><span class="tr-pl"><small>${esc(labelOf(r.from))}</small><b>${esc(a.name)}</b></span><button type="button" class="tr-swap" id="tr-swap" title="Richtung tauschen" aria-label="Richtung tauschen">⇅</button><span class="tr-pl"><small>${esc(labelOf(r.to))}</small><b>${esc(b.name)}</b></span></div>
      <div class="tr-chips">${others.length > 2 || !r.auto ? `<button type="button" class="chip ${r.auto ? "acc" : ""}" data-auto>Automatisch</button>` : ""}${others.length > 2 ? others.filter(p => p[0] !== r.to).map(p => `<button type="button" class="chip" data-to="${p[0]}">${p[2]} Nach ${esc(p[1])}</button>`).join("") : ""}<button type="button" class="chip" id="tr-reload">↻ Aktualisieren</button></div>
    </div>
    <section class="card tr-main" aria-live="polite"><div class="tr-load">Lade Verbindungen …</div></section>
    <section class="card tr-board"><div class="spread"><h3>Abfahrten ab ${esc(a.name)}</h3><small class="muted tr-stamp"></small></div><div class="tr-deps"></div></section>
    <p class="tr-foot muted">Fahrplandaten der ÖBB (alle Öffis in Österreich) über transport.rest, inoffiziell. Aktualisiert sich jede Minute von selbst. <button type="button" class="linkish" data-go="settings" data-p="wege">Orte ändern</button></p>
  </div>`;
  const paint = x => {
    const main = $(".tr-main", el), deps = $(".tr-deps", el); if (!main) return;
    const up = upcoming(x), err = errTxt(x);
    main.innerHTML = up.length ? heroHTML(up[0], r) + (up.length > 1 ? `<div class="tr-list"><span class="eyebrow">Danach</span>${up.slice(1, 5).map(rowJ).join("")}</div>` : "") + (err ? `<p class="tr-err">${esc(err)}</p>` : "")
      : x && x.at ? `<div class="empty">Gerade keine Verbindung gefunden.${err ? " " + esc(err) : ""}</div>` : `<div class="empty">${esc(err || "Lade Verbindungen …")}</div>`;
    const dl = (x && x.d || []).filter(d => { const w = T(d.when); return w && w - Date.now() > -60000; }).slice(0, 10);
    deps.innerHTML = dl.length ? dl.map(rowD).join("") : `<div class="tr-sm muted">${x && x.at ? "Keine Abfahrten in der nächsten Zeit." : "…"}</div>`;
    const st = $(".tr-stamp", el); if (st) st.textContent = stamp(x);
  };
  const k = keyOf(a, b); if (data[k]) paint(data[k]);
  const refresh = force => load(r, force).then(x => { if (el.isConnected && App.route().v === "transit") paint(x); });
  refresh(false);
  let n = 0;
  timer = setInterval(() => { if (!el.isConnected || App.route().v !== "transit") return stopTimer(); if (document.hidden) return; tick(el); if (++n % 4 === 0) refresh(true); /* alle 60 s neu */
    const now = route(); if (now.auto && (now.from !== r.from || now.to !== r.to)) App.softRender(); }, 15000);
  $("#tr-swap", el).addEventListener("click", () => { pick = { from: r.to, to: r.from }; App.render(); });
  $("#tr-reload", el).addEventListener("click", () => { $(".tr-main", el).classList.add("tr-busy"); refresh(true).then(() => { const m = $(".tr-main", el); m && m.classList.remove("tr-busy"); }); });
  const au = $("[data-auto]", el); if (au) au.addEventListener("click", () => { pick = null; App.render(); });
  $$("[data-to]", el).forEach(c => c.addEventListener("click", () => { pick = { from: r.from === c.dataset.to ? r.to : r.from, to: c.dataset.to }; App.render(); }));
};
document.addEventListener("visibilitychange", () => { if (!document.hidden && App.route && App.route().v === "transit") App.softRender(); });

/* ---------- Orte bearbeiten (Einstellungen und erste Einrichtung) ---------- */
function placesHTML() {
  const c = cfg();
  const one = (k, label, ic, p, extra) => `<div class="tr-place" data-k="${k}"><div class="tr-ph"><span class="tr-pic" aria-hidden="true">${ic}</span>${extra ? `<input class="tr-lbl" value="${esc(label)}" aria-label="Name des Orts" maxlength="24">` : `<b>${label}</b>`}
      <label class="tr-wk" title="Fußweg bis zur Haltestelle"><span aria-hidden="true">🚶</span><input type="number" min="0" max="30" class="tr-walkin" value="${p && p.walk ? +p.walk : 0}" aria-label="Minuten zu Fuß bis zur Haltestelle"><small>min</small></label>${extra ? `<button type="button" class="btn ghost sm tr-del" aria-label="Ort entfernen">✕</button>` : ""}</div>
      <div class="tr-ps"></div></div>`;
  return `<h3>Wege & Öffis</h3><p class="muted" style="font-size:14px">Deine Haltestellen. StudyOS zeigt dir damit unter „Unterwegs“ den nächsten Bus oder Zug und wählt die Richtung selbst: vor der Vorlesung zur FH, danach nach Hause.</p>
    ${one("home", "Wohnort", "⌂", c.home)}${one("uni", "Studienort", "🎓", c.uni)}${(c.more || []).map((m, i) => one("m" + i, m.label || "Ort", "★", m, true)).join("")}
    <div class="row"><button type="button" class="btn ghost sm" id="tr-add">＋ Weiterer Ort (Arbeit, Eltern …)</button>${ready() ? `<button type="button" class="btn sm" data-go="transit">Unterwegs öffnen →</button>` : ""}</div>
    <label class="switch"><div><div>Auf „Heute“ anzeigen</div><small>Kleine Karte mit der nächsten Verbindung auf der Startseite.</small></div><input type="checkbox" id="tr-dash" ${c.dash !== false ? "checked" : ""}></label>`;
}
function bindPlaces(card, onDone) {
  const c = cfg();
  const objFor = k => k === "home" || k === "uni" ? c[k] : (c.more || [])[+k.slice(1)];
  const setFor = (k, v) => { if (k === "home" || k === "uni") c[k] = v; else c.more[+k.slice(1)] = v; };
  $$(".tr-place", card).forEach(pl => {
    const k = pl.dataset.k;
    stopPicker($(".tr-ps", pl), objFor(k), st => { const o = objFor(k) || {}; setFor(k, Object.assign({}, o, st, { label: o.label })); App.save(); App.toast("Gespeichert", labelOf(k) + ": " + st.name, "✓"); if (ready() && onDone) onDone(); });
    $(".tr-walkin", pl).addEventListener("change", e => { const o = objFor(k); const v = Math.max(0, Math.min(30, Math.round(+e.target.value || 0))); if (o) { o.walk = v; App.save(); } else e.target.value = 0; });
    const lb = $(".tr-lbl", pl); if (lb) lb.addEventListener("change", () => { const o = objFor(k) || {}; o.label = lb.value.trim().slice(0, 24) || "Ort"; setFor(k, o); App.save(); });
    const del = $(".tr-del", pl); if (del) del.addEventListener("click", () => { c.more.splice(+k.slice(1), 1); App.save(); App.render(); });
  });
  $("#tr-add", card).addEventListener("click", () => { c.more = c.more || []; if (c.more.length >= 4) return App.toast("Wege & Öffis", "Bis zu vier weitere Orte.", "ℹ"); c.more.push({ label: ["Arbeit", "Eltern", "Training", "Freunde"][c.more.length] }); App.save(); App.render(); });
  /* Ein Ort ohne Haltestelle zählt nicht: „Weiterer Ort“ ohne Auswahl wird beim nächsten Speichern ignoriert */
  $("#tr-dash", card).addEventListener("change", e => { c.dash = e.target.checked; App.save(); });
}
const settingsPage = PAGES.settings;
PAGES.settings = (el, p) => {
  settingsPage(el, p);
  const pg = $(".page", el) || el, card = document.createElement("div"); card.className = "card col tr-set";
  card.innerHTML = placesHTML(); pg.appendChild(card); bindPlaces(card);
};

/* ---------- Karte auf „Heute“ ---------- */
const dashPage = PAGES.dash;
let dashT = null;
PAGES.dash = (el, p) => {
  dashPage(el, p);
  clearInterval(dashT); dashT = null;
  if (!ready() || cfg().dash === false) return;
  const grid = $(".dh-grid", el); if (!grid) return;
  const card = document.createElement("section"); card.className = "card dh-transit";
  const r = Object.assign(plan(), { auto: true }), a = placeOf(r.from), b = placeOf(r.to); /* auf „Heute“ immer automatisch */
  const head = `<div class="spread"><h3>${r.to === "home" ? "Nach Hause" : r.to === "uni" ? "Zur FH" : "Nach " + esc(labelOf(r.to))}</h3><button class="btn ghost sm" data-go="transit">Unterwegs →</button></div>`;
  const fill = x => {
    const up = upcoming(x), j = up[0];
    card.innerHTML = head + (j ? `<div class="dt-next" data-dep="${jDep(j).getTime()}" data-leave="${(leaveAt(j, r) || jDep(j)).getTime()}"><div><b class="tr-big tab" data-cd>${esc(inTxt(mins(jDep(j))))}</b><div class="tr-go" data-lv></div></div><div class="dt-r">${legsHTML(j)}<small class="muted tab">${hm(jDep(j))} ${delayTxt((realLegs(j)[0] || {}).dd)} → ${hm(jArr(j))} · ab ${esc(a.name)}</small></div></div>
      ${up[1] ? `<small class="muted dt-then">Danach ${up.slice(1, 3).map(n => hm(jDep(n))).join(", ")}</small>` : ""}`
      : `<p class="muted">${x && x.at ? "Gerade keine Verbindung von " + esc(a.name) + " nach " + esc(b.name) + "." : esc(errTxt(x) || "Lade nächste Verbindung …")}</p>`);
    tick(card);
  };
  const k = keyOf(a, b); fill(data[k]);
  grid.appendChild(card);
  load(r, false).then(x => { if (card.isConnected) fill(x); });
  let n = 0;
  dashT = setInterval(() => { if (!card.isConnected) { clearInterval(dashT); dashT = null; return; } if (document.hidden) return; tick(card); if (++n % 8 === 0) load(r, true).then(x => card.isConnected && fill(x)); }, 15000);
};

App.transit = { cfg, plan, route, load, ready };
})();
