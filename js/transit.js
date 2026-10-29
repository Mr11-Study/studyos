/* StudyOS · Unterwegs (4.45): nächster Bus, nächste Bim, nächster Zug zwischen Wohnort und Studienort
   Vorbild BusBahnBim: große Abfahrtszeit mit Countdown, Linien-Symbole, Verspätung live, Abfahrtsmonitor der Haltestelle.
   Daten: Transitous (Fahrpläne der österreichischen Verkehrsverbünde und der ÖBB), ersatzweise ÖBB über transport.rest (4.46).
   Die Richtung passt sich der Uhrzeit und dem Stundenplan an: vor der ersten Einheit zur FH, danach nach Hause.
   Muss vor apps.js geladen werden (Hub-Seite) und vor settings-ui.js (Karte in den Einstellungen). */
(function () {
const { $, $$, esc, PAGES } = App;
const S = () => App.S();
const cfg = () => { const s = S().settings || (S().settings = {}); return s.transit || (s.transit = { home: null, uni: null, more: [], dash: true }); };
const PLACES = () => { const c = cfg(); return [["home", "Wohnort", "⌂", c.home], ["uni", "Studienort", "🎓", c.uni], ...(c.more || []).map((m, i) => ["m" + i, m.label || "Ort " + (i + 1), "★", m])]; };
const placeOf = k => { const x = (PLACES().find(p => p[0] === k) || [])[3]; return x && x.name ? x : null; };
const labelOf = k => (PLACES().find(p => p[0] === k) || [])[1] || "";
const ready = () => !!(placeOf("home") && placeOf("uni"));

/* ---------- Schnittstellen ----------
   1. Transitous (freier Fahrplan mit den Daten der österreichischen Verkehrsverbünde, auch Steirischer Verkehrsverbund
      und ÖBB) – Hauptquelle, im Browser direkt nutzbar.
   2. ÖBB-Fahrplan über transport.rest – Ersatz, falls Transitous gerade nicht antwortet.
   Beide liefern hier dasselbe schlanke Format: Haltestelle {id, name, lat, lon, src, area}, Verbindung {legs[]}, Abfahrt {when, …}. */
async function getJSON(url) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 12000);
  try { const r = await fetch(url, { signal: ctl.signal, referrerPolicy: "strict-origin-when-cross-origin" }); if (!r.ok) { const e = new Error(r.status === 429 ? "busy" : "http"); e.status = r.status; throw e; } return await r.json(); }
  finally { clearTimeout(t); }
}
const qs = q => Object.entries(q).filter(([, v]) => v != null && v !== "").map(([k, v]) => k + "=" + encodeURIComponent(v)).join("&");
const iso = d => new Date(d).toISOString();
const MODE = { TRAM: "tram", BUS: "bus", COACH: "bus", ODM: "onCall", FLEX: "onCall", SUBURBAN: "suburban", SUBWAY: "subway", METRO: "suburban", RAIL: "regional", REGIONAL_RAIL: "regional", REGIONAL_FAST_RAIL: "regionalExp", HIGHSPEED_RAIL: "nationalExpress", LONG_DISTANCE: "national", NIGHT_RAIL: "national", FERRY: "ferry", FUNICULAR: "tram", AERIAL_LIFT: "tram", CABLE_CAR: "tram" };
const hex = c => c && /^#?[0-9a-f]{6}$/i.test(c) ? (c[0] === "#" ? c : "#" + c) : null;
const dist = (a, b, c, d) => { const R = 6371e3, r = Math.PI / 180, x = (c - a) * r, y = (d - b) * r * Math.cos((a + c) / 2 * r); return Math.round(R * Math.hypot(x, y)); };

/* Transitous (MOTIS). Die Versionsnummer im Pfad ändert sich mit der Zeit: die erste, die antwortet, wird gemerkt. */
const MO = "https://api.transitous.org";
const VER = (() => { try { return JSON.parse(localStorage.getItem("studyos.transit.ver") || "{}"); } catch (e) { return {}; } })();
async function mo(name, q, vers) {
  const list = VER[name] ? [VER[name], ...vers.filter(v => v !== VER[name])] : vers;
  let last;
  for (const v of list) {
    try { const r = await getJSON(`${MO}/api/${v}/${name}?${qs(q)}`); if (VER[name] !== v) { VER[name] = v; try { localStorage.setItem("studyos.transit.ver", JSON.stringify(VER)); } catch (e) {} } return r; }
    catch (e) { last = e; if (e.status !== 404 && e.status !== 400) throw e; }
  }
  throw last || new Error("http");
}
const moStop = m => ({ id: String(m.id), name: m.name, lat: m.lat, lon: m.lon, src: "mo", area: ((m.areas || []).find(x => x.default) || (m.areas || [])[0] || {}).name || "" });
const moLine = g => ({ name: g.routeShortName || g.displayName || g.tripShortName || "", product: MODE[g.mode] || "bus", color: hex(g.routeColor) });
/* Koordinaten für die Karte: [lat, lon], Linienverlauf als „encoded polyline“ (Genauigkeit steht dabei) */
const cc = (a, b) => a != null && b != null && isFinite(a) && isFinite(b) ? [+(+a).toFixed(5), +(+b).toFixed(5)] : null;
function unpoly(str, prec) { const f = Math.pow(10, prec), out = []; let i = 0, lat = 0, lon = 0; try { while (i < str.length) { for (const k of [0, 1]) { let r = 0, sh = 0, c; do { c = str.charCodeAt(i++) - 63; r |= (c & 31) << sh; sh += 5; } while (c >= 32); const d = r & 1 ? ~(r >> 1) : r >> 1; if (k) lon += d; else lat += d; } out.push([+(lat / f).toFixed(5), +(lon / f).toFixed(5)]); } } catch (e) {} return out; }
const thin = a => { if (!a || a.length <= 120) return a; const st = a.length / 120, o = []; for (let i = 0; i < a.length; i += st) o.push(a[Math.floor(i)]); o.push(a[a.length - 1]); return o; };
const moAlerts = a => (a || []).map(x => x && (x.headerText || x.descriptionText)).filter(Boolean).slice(0, 3);
const moWhere = p => p.src === "mo" && p.id ? p.id : p.lat != null ? p.lat + "," + p.lon : null;
const MOTIS = {
  find: q => mo("geocode", { text: q, type: "STOP", numResults: 8, language: "de" }, ["v1"]).then(a => (a || []).filter(m => m && m.id && m.type === "STOP").map(moStop)),
  near: (lat, lon) => mo("reverse-geocode", { place: lat + "," + lon, type: "STOP", numResults: 8 }, ["v1"]).then(a => (a || []).filter(m => m && m.id).map(m => Object.assign(moStop(m), { distance: dist(lat, lon, m.lat, m.lon) })).sort((x, y) => x.distance - y.distance)),
  async deps(p, w) {
    const q = p.src === "mo" && p.id ? { stopId: p.id } : { center: p.lat + "," + p.lon, radius: 150 };
    const r = await mo("stoptimes", Object.assign(q, { n: 14, time: iso(w ? w.t : Date.now() - 60000), language: "de" }), ["v6", "v5", "v4", "v1"]);
    return (r.stopTimes || []).map(st => { const pl = st.place || {}, w = pl.departure || pl.scheduledDeparture; return { when: w, plan: pl.scheduledDeparture || w, rt: !!st.realTime, delay: st.realTime && pl.departure && pl.scheduledDeparture ? (T(pl.departure) - T(pl.scheduledDeparture)) / 1000 : null, pl: pl.track || pl.scheduledTrack || "", spl: pl.scheduledTrack && pl.track && pl.scheduledTrack !== pl.track ? pl.scheduledTrack : "", dir: st.headsign || "", line: moLine(st), op: st.agencyName || "", warn: moAlerts(st.place && st.place.alerts || st.alerts), x: !!(st.cancelled || st.tripCancelled) }; }).filter(d => d.when);
  },
  async trips(a, b, w) {
    const from = moWhere(a), to = moWhere(b); if (!from || !to) throw new Error("http");
    const r = await mo("plan", { fromPlace: from, toPlace: to, time: iso(w ? w.t : Date.now()), arriveBy: w && w.arr ? "true" : null, numItineraries: 5, detailedTransfers: "false", timetableView: "true", language: "de" }, ["v5", "v6", "v4", "v3", "v2", "v1"]);
    return (r.itineraries || []).map(it => ({ legs: (it.legs || []).map(g => { const walk = g.mode === "WALK" || g.mode === "BIKE" || g.mode === "CAR"; const dep = g.startTime || (g.from || {}).departure, sdep = g.scheduledStartTime || (g.from || {}).scheduledDeparture;
      const arr = g.endTime || (g.to || {}).arrival, sarr = g.scheduledEndTime || (g.to || {}).scheduledArrival;
      return { o: (g.from || {}).name, dst: (g.to || {}).name, dep, dd: g.realTime && dep && sdep ? (T(dep) - T(sdep)) / 1000 : null, arr, ad: g.realTime && arr && sarr ? (T(arr) - T(sarr)) / 1000 : null, rt: !!g.realTime,
        pl: (g.from || {}).track || (g.from || {}).scheduledTrack || "", apl: (g.to || {}).track || (g.to || {}).scheduledTrack || "", line: walk ? null : moLine(g), dir: g.headsign || "", walk, m: g.distance ? Math.round(g.distance) : null,
        op: g.agencyName || "", stops: walk ? [] : (g.intermediateStops || []).map(x => ({ n: x.name, t: x.departure || x.arrival || x.scheduledDeparture || x.scheduledArrival, c: cc(x.lat, x.lon) })), warn: moAlerts(g.alerts), x: !!g.cancelled,
        oc: cc((g.from || {}).lat, (g.from || {}).lon), dc: cc((g.to || {}).lat, (g.to || {}).lon), pts: g.legGeometry && g.legGeometry.points ? thin(unpoly(g.legGeometry.points, g.legGeometry.precision || 6)) : null }; }) })).filter(j => j.legs.length);
  }
};

/* ÖBB über transport.rest (Ersatz) */
const HA = "https://v6.oebb.transport.rest";
const ha = (path, q) => getJSON(HA + path + "?" + qs(q));
const haStop = x => ({ id: String(x.id), name: x.name, lat: x.location && x.location.latitude, lon: x.location && x.location.longitude, src: "ha", area: "" });
const haLine = l => l ? { name: String(l.name || l.fahrtNr || "").replace(/^(Tram|Str|Bus|STR)\s+/i, ""), product: l.product, color: null } : null;
const haWarn = a => (a || []).filter(x => x && (x.type === "warning" || x.type === "status")).map(x => x.summary || x.text).filter(Boolean).slice(0, 3);
const haWhere = (p, k) => p.src === "ha" && p.id ? { [k]: p.id } : { [k + ".latitude"]: p.lat, [k + ".longitude"]: p.lon, [k + ".address"]: p.name };
const HAFAS = {
  find: q => ha("/locations", { query: q, results: 8, stops: "true", addresses: "false", poi: "false", linesOfStops: "false" }).then(a => (a || []).filter(x => x && x.id && (x.type === "stop" || x.type === "station")).map(haStop)),
  near: (lat, lon) => ha("/locations/nearby", { latitude: lat, longitude: lon, results: 8, distance: 1200, linesOfStops: "false" }).then(a => (a || []).filter(x => x && x.id).map(x => Object.assign(haStop(x), { distance: x.distance }))),
  async deps(p, w) { if (p.src !== "ha") throw new Error("http"); const r = await ha("/stops/" + encodeURIComponent(p.id) + "/departures", { when: w ? iso(w.t) : null, duration: 90, results: 14, remarks: "true", linesOfStops: "false" });
    return (Array.isArray(r) ? r : (r && r.departures) || []).map(d => ({ when: d.when || d.plannedWhen, plan: d.plannedWhen || d.when, rt: d.delay != null, delay: d.delay, pl: d.platform || d.plannedPlatform || "", spl: d.plannedPlatform && d.platform && d.plannedPlatform !== d.platform ? d.plannedPlatform : "", dir: d.direction || "", line: haLine(d.line), op: (d.line && d.line.operator && d.line.operator.name) || "", warn: haWarn(d.remarks), x: !!d.cancelled })); },
  async trips(a, b, w) { const r = await ha("/journeys", Object.assign(haWhere(a, "from"), haWhere(b, "to"), w ? { [w.arr ? "arrival" : "departure"]: iso(w.t) } : {}, { results: 5, stopovers: "true", remarks: "true", tickets: "false", polylines: "false", scheduledDays: "false" }));
    return ((r && r.journeys) || []).map(j => ({ legs: (j.legs || []).map(g => ({ o: g.origin && g.origin.name, dst: g.destination && g.destination.name, dep: g.departure || g.plannedDeparture, dd: g.departureDelay, arr: g.arrival || g.plannedArrival, ad: g.arrivalDelay, rt: g.departureDelay != null, pl: g.departurePlatform || g.plannedDeparturePlatform || "", apl: g.arrivalPlatform || g.plannedArrivalPlatform || "", line: haLine(g.line), dir: g.direction || "", walk: !!g.walking, m: g.distance || null,
      op: (g.line && g.line.operator && g.line.operator.name) || "", stops: (g.stopovers || []).slice(1, -1).map(x => ({ n: x.stop && x.stop.name, t: x.departure || x.arrival || x.plannedDeparture || x.plannedArrival, c: x.stop && x.stop.location ? cc(x.stop.location.latitude, x.stop.location.longitude) : null })).filter(x => x.n), warn: haWarn(g.remarks), x: !!g.cancelled,
      oc: g.origin && g.origin.location ? cc(g.origin.location.latitude, g.origin.location.longitude) : null, dc: g.destination && g.destination.location ? cc(g.destination.location.latitude, g.destination.location.longitude) : null, pts: null })) })); }
};
/* erst Transitous, dann ÖBB; wer zuletzt geklappt hat, kommt zuerst dran */
let good = "mo";
const SRCS = () => good === "ha" ? [["ha", HAFAS], ["mo", MOTIS]] : [["mo", MOTIS], ["ha", HAFAS]];
async function any(fn) { let last; for (const [k, src] of SRCS()) { try { const r = await fn(src, k); good = k; return r; } catch (e) { last = e; } } throw last || new Error("http"); }
const findStops = q => any(s => s.find(q));
const nearStops = (lat, lon) => any(s => s.near(lat, lon));

/* ---------- Zeit ---------- */
const T = x => x ? new Date(x) : null;
const hm = d => d ? d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }) : "–";
const mins = d => d ? Math.round((d - Date.now()) / 60000) : null;
const inTxt = m => m == null ? "" : m <= 0 ? "jetzt" : m < 60 ? "in " + m + " min" : "in " + Math.floor(m / 60) + " h " + (m % 60) + " min";
const dur = (a, b) => { const m = Math.round((b - a) / 60000); return m < 60 ? m + " min" : Math.floor(m / 60) + " h " + String(m % 60).padStart(2, "0"); };
const delayTxt = s => s == null ? "" : s >= 60 ? `<span class="tr-late">+${Math.round(s / 60)}</span>` : `<span class="tr-ok">pünktlich</span>`;

/* ---------- Linien wie im BusBahnBim: farbige Kästchen ---------- */
const PROD = { tram: ["Bim", "#D2232A"], bus: ["Bus", "#0065B3"], suburban: ["S", "#00A0E1"], subway: ["U", "#7B3F98"], regional: ["R", "#E2001A"], regionalExp: ["REX", "#E2001A"], interregional: ["IR", "#5A5A5A"], national: ["Zug", "#2B2B2B"], nationalExpress: ["Zug", "#2B2B2B"], ferry: ["Schiff", "#00838F"], onCall: ["Ruf", "#8E6E00"] };
const lineCol = l => (l && l.color) || (PROD[(l && l.product) || ""] || [, "#6B7280"])[1];
const lineName = l => { if (!l) return "?"; let n = String(l.name || (PROD[l.product] || ["?"])[0]).replace(/^(Tram|Str|Bus|STR)\s+/i, "").trim(); return n.length > 9 ? n.slice(0, 9) : n; };
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
const DATA = {}, data = DATA; /* key -> { at, j, d, err } */
const LS = "studyos.transit";
try { Object.assign(data, JSON.parse(localStorage.getItem(LS) || "{}")); } catch (e) {}
const persist = () => { try { localStorage.setItem(LS, JSON.stringify(data)); } catch (e) {} };
const keyOf = (a, b) => (a.id || a.name) + ">" + (b.id || b.name);
const busy = new Set();
/* Ort ohne Haltestellen-ID (Name von Hand übernommen): einmal im Fahrplan nachschlagen und merken */
async function resolve(p) { if (p.id && !p.src) p.src = "ha"; /* aus 4.45 */ if (p.id || p.lat != null) return p; const hit = (await findStops(p.name))[0]; if (!hit) throw new Error("nostop"); Object.assign(p, hit, { label: p.label, walk: p.walk }); App.save(); return p; }
/* Abfahrten jede Minute, Verbindungen seltener (die freien Fahrpläne bitten um sparsame Abfragen) */
/* w = { t, arr }: Verbindungen zu einer gewählten Zeit (Abfahrt oder Ankunft); die landen nur im Speicher, nicht im Gerät */
const tmp = {};
const load = (r, force, jEvery) => loadAB(placeOf(r.from), placeOf(r.to), force, jEvery, null);
async function loadAB(a, b, force, jEvery, w) {
  if (!a || !b) return null;
  const data = w ? tmp : DATA;
  const k = keyOf(a, b) + (w ? "@" + w.t + (w.arr ? "a" : "d") : ""), cur = data[k] || { j: [], d: [], at: 0, jAt: 0 };
  const needD = force || Date.now() - (cur.at || 0) > 45000 || cur.err, needJ = force === "all" || !cur.j.length || Date.now() - (cur.jAt || 0) > (jEvery || 170000) || cur.err;
  if (!needD && !needJ) return cur;
  if (busy.has(k)) return cur; busy.add(k);
  try {
    await resolve(a); await resolve(b);
    const [j, d] = await Promise.all([needJ ? any(s => s.trips(a, b, w)) : null, any(s => s.deps(a, w)).catch(() => null)]);
    if (needJ && j == null) throw new Error("http");
    data[k] = { at: Date.now(), jAt: needJ ? Date.now() : cur.jAt, j: needJ ? j : cur.j, d: d || cur.d, src: good }; if (!w) persist();
  } catch (e) { data[k] = Object.assign({}, cur, { err: e.message === "busy" ? "busy" : e.message === "nostop" ? "nostop" : navigator.onLine ? "down" : "offline", errAt: Date.now() }); }
  finally { busy.delete(k); }
  return data[k];
}
const realLegs = j => j.legs.filter(g => !g.walk);
const jDep = j => T((realLegs(j)[0] || j.legs[0] || {}).dep), jArr = j => T((j.legs[j.legs.length - 1] || {}).arr);
const upcoming = (x, all) => (x && x.j || []).filter(j => { const d = jDep(j); return d && (all || d - Date.now() > -60000) && !j.legs.some(g => g.x); }).sort((a, b) => jDep(a) - jDep(b) || jArr(a) - jArr(b));
const walkMin = r => +((r.a || placeOf(r.from) || {}).walk || 0);
const firstWalk = j => j.legs[0] && j.legs[0].walk ? Math.max(1, Math.round((T(j.legs[0].arr) - T(j.legs[0].dep)) / 60000)) : 0;
const leaveAt = (j, r) => { const d = jDep(j); return d ? new Date(d - (walkMin(r) + firstWalk(j)) * 60000) : null; };

/* ---------- Bausteine ---------- */
function legsHTML(j) { return `<span class="tr-legs">${j.legs.map(g => g.walk ? walkB(Math.round((T(g.arr) - T(g.dep)) / 60000)) : badge(g.line)).join('<i class="tr-sep" aria-hidden="true">›</i>')}</span>`; }
/* ---------- Details einer Verbindung: jede Teilstrecke mit Haltestellen, Steig, Umstiegszeit, Hinweisen ---------- */
const mm = (a, b) => Math.max(0, Math.round((T(b) - T(a)) / 60000));
const dl = (s, plan) => s == null ? "" : s >= 60 ? `<span class="tr-late">+${Math.round(s / 60)}</span>${plan ? ` <s class="tr-plan">${hm(T(plan))}</s>` : ""}` : `<span class="tr-ok">pünktlich</span>`;
const walkTot = j => j.legs.filter(g => g.walk).reduce((s, g) => s + mm(g.dep, g.arr), 0);
const jKey = j => { const f = realLegs(j)[0] || j.legs[0]; return (f.dep || "") + "|" + ((f.line && f.line.name) || ""); };
function factsHTML(j) {
  const L = realLegs(j), ch = Math.max(0, L.length - 1), w = walkTot(j), rt = L.some(g => g.rt), stops = L.reduce((s, g) => s + (g.stops || []).length + 1, 0);
  return `<span class="tr-facts">${[dur(jDep(j), jArr(j)), ch ? ch + (ch === 1 ? " Umstieg" : " Umstiege") : "direkt", stops ? stops + " Halte" : "", w ? w + " min zu Fuß" : "", rt ? `<span class="tr-rt" title="Mit Live-Daten">● live</span>` : `<span class="muted" title="Nur Fahrplan, keine Live-Daten">Fahrplan</span>`].filter(Boolean).join(" · ")}</span>`;
}
function detailHTML(j) {
  const out = [];
  j.legs.forEach((g, i) => {
    const prev = j.legs[i - 1];
    if (prev && !prev.walk && !g.walk) { const t = mm(prev.arr, g.dep); out.push(`<li class="tr-chg ${t <= 3 ? "tight" : ""}"><span>⇄ Umsteigen${prev.dst ? " in " + esc(prev.dst) : ""}: ${t} min Zeit${t <= 3 ? " · knapp" : ""}${prev.apl && g.pl && prev.apl !== g.pl ? ` · von Steig ${esc(prev.apl)} zu Steig ${esc(g.pl)}` : ""}</span></li>`); }
    if (g.walk) { const t = mm(g.dep, g.arr); if (t || g.m) out.push(`<li class="tr-lw"><span>🚶 ${t} min zu Fuß${g.m ? ` (${g.m >= 1000 ? (g.m / 1000).toFixed(1).replace(".", ",") + " km" : g.m + " m"})` : ""}${g.dst ? " bis " + esc(g.dst) : ""}</span></li>`); return; }
    const st = g.stops || [];
    out.push(`<li class="tr-lg ${g.x ? "tr-x" : ""}" style="--lc:${lineCol(g.line)}">
      <div class="tr-stp"><b class="tab">${hm(T(g.dep))}</b> ${g.dd != null ? dl(g.dd) : ""}<span class="tr-sn">${esc(g.o || "")}</span>${g.pl ? `<span class="chip">Steig ${esc(g.pl)}</span>` : ""}</div>
      <div class="tr-ride">${badge(g.line)}<span>${g.dir ? "Richtung " + esc(g.dir) : ""}</span><small class="muted">${[mm(g.dep, g.arr) + " min", st.length ? st.length + 1 + " Halte" : "", g.op].filter(Boolean).map(esc).join(" · ")}</small>${g.x ? `<span class="chip warn">fällt aus</span>` : ""}</div>
      ${st.length ? `<details class="tr-mid"><summary>${st.length} Zwischenhalte</summary><ol>${st.map(x => `<li><span class="tab">${x.t ? hm(T(x.t)) : ""}</span>${esc(x.n)}</li>`).join("")}</ol></details>` : ""}
      ${(g.warn || []).map(w => `<p class="tr-warn">⚠ ${esc(w)}</p>`).join("")}
      <div class="tr-stp"><b class="tab">${hm(T(g.arr))}</b> ${g.ad != null && g.ad >= 60 ? dl(g.ad) : ""}<span class="tr-sn">${esc(g.dst || "")}</span>${g.apl ? `<span class="chip">Steig ${esc(g.apl)}</span>` : ""}</div></li>`);
  });
  return `<ol class="tr-tl">${out.join("")}</ol>`;
}
/* Uhrzeit mit Tag, wenn es nicht heute ist (für gesuchte Zeiten) */
const dayTxt = d => { if (!d) return ""; const t = new Date(), x = new Date(d); const n = Math.round((new Date(x.getFullYear(), x.getMonth(), x.getDate()) - new Date(t.getFullYear(), t.getMonth(), t.getDate())) / 864e5);
  return n === 0 ? "Heute" : n === 1 ? "Morgen" : n === -1 ? "Gestern" : x.toLocaleDateString("de-AT", { weekday: "short", day: "numeric", month: "numeric" }); };
const whenTxt = d => d ? (dayTxt(d) === "Heute" ? "" : dayTxt(d) + " ") + hm(d) : "–";
const soon = j => { const d = jDep(j); return d && d - Date.now() < 90 * 60000 && jArr(j) - Date.now() > 0; };
const RIDEHINT = `<small class="muted tr-hint">„Ich fahre mit“: StudyOS begleitet dich bis zur Ankunft und zeigt live, wo du gerade bist und wann du aussteigst.</small>`;
/* oben die nächste Verbindung: die ganze Karte ist antippbar und öffnet die Detailansicht */
function heroHTML(j, r, live) {
  const L = realLegs(j), f = L[0] || j.legs[0], dep = jDep(j), arr = jArr(j), lv = leaveAt(j, r), lm = mins(lv), k = jKey(j);
  const by = live && r.by && arr ? (hm(arr) <= r.by ? `<span class="chip good">✓ rechtzeitig für ${r.by}${(() => { const [h, m] = r.by.split(":").map(Number), d = new Date(arr); const x = h * 60 + m - (d.getHours() * 60 + d.getMinutes()); return x > 0 ? `, ${x} min Puffer` : ""; })()}</span>` : `<span class="chip warn">zu spät für ${r.by}</span>`) : "";
  return `<div class="tr-hero tr-tap" role="button" tabindex="0" data-open-j="${esc(k)}" aria-label="Details zur Verbindung um ${hm(dep)}" data-dep="${dep ? dep.getTime() : ""}" data-leave="${lv && live ? lv.getTime() : ""}">
    <div class="tr-hl">${live ? `<div class="tr-big tab" data-cd>${esc(inTxt(mins(dep)))}</div><div class="tr-go" data-lv>${lm == null ? "" : lm <= 0 ? "Jetzt losgehen!" : "Losgehen " + inTxt(lm)}</div>${lv ? `<small class="muted tab">spätestens ${hm(lv)} los</small>` : ""}`
      : `<div class="tr-big tab">${hm(dep)}</div><div class="tr-go">${esc(dayTxt(dep))}</div>${lv ? `<small class="muted tab">losgehen ${hm(lv)}</small>` : ""}`}</div>
    <div class="tr-hr">${legsHTML(j)}<div class="tr-tm tab"><b>${hm(dep)}</b> ${delayTxt(f.dd)} <span class="tr-arrow">→</span> <b>${hm(arr)}</b> ${f.pl ? `<span class="chip">Steig ${esc(f.pl)}</span>` : ""}</div>
      <small class="muted">${esc(f.o || "")}${f.dir ? " · Richtung " + esc(f.dir) : ""}</small>${factsHTML(j)}${by}</div>
    <span class="tr-chev" aria-hidden="true">›</span></div>
    <div class="row tr-acts">${soon(j) ? `<button type="button" class="btn pri sm" data-ride="${esc(k)}">▶ Ich fahre mit</button>` : ""}<button type="button" class="btn sm" data-open-j="${esc(k)}">Details & Karte ›</button></div>${soon(j) ? RIDEHINT : ""}`;
}
/* weitere Verbindungen: jede Zeile ist ein Knopf mit Pfeil und öffnet ihre eigene Ansicht */
function rowJ(j, live) {
  const L = realLegs(j), f = L[0] || j.legs[0], dep = jDep(j), arr = jArr(j), k = jKey(j);
  return `<button type="button" class="tr-item tr-row" data-open-j="${esc(k)}" data-dep="${dep ? dep.getTime() : ""}" ${live ? "data-rm" : ""}>${live ? `<b class="tr-min tab" data-cd>${esc(inTxt(mins(dep)))}</b>` : `<b class="tr-min tab">${esc(whenTxt(dep))}</b>`}${legsHTML(j)}<span class="tr-tm tab">${hm(dep)} ${delayTxt(f.dd)} → ${hm(arr)}</span><small class="muted">${Math.max(0, L.length - 1) ? (L.length - 1) + "× um" : "direkt"}</small><span class="tr-chev" aria-hidden="true">›</span></button>`;
}
const dKey = d => "d|" + (d.plan || d.when) + "|" + ((d.line && d.line.name) || "") + "|" + (d.dir || "");
function rowD(d, live) {
  const w = T(d.when), m = mins(w);
  return `<button type="button" class="tr-item tr-row tr-mon ${d.x ? "tr-x" : ""}" data-open-d="${esc(dKey(d))}" data-dep="${w ? w.getTime() : ""}" ${live ? "data-rm" : ""}>${badge(d.line)}<span class="tr-dir">${esc(d.dir || "")}</span>${d.pl ? `<small class="muted">Steig ${esc(d.pl)}</small>` : "<small></small>"}<b class="tr-min tab" ${live ? "data-cd data-short" : ""}>${d.x ? "fällt aus" : live && m != null && m < 60 ? (m <= 0 ? "jetzt" : m + "′") : hm(w)}</b>${d.x ? "<span></span>" : delayTxt(d.delay)}<span class="tr-chev" aria-hidden="true">›</span></button>`;
}
function depHTML(d) {
  const w = T(d.when), m = mins(w);
  return `<div class="tr-dhero">${badge(d.line)}<div><b class="tr-dto">${d.dir ? "Richtung " + esc(d.dir) : "Abfahrt"}</b><small class="muted">${esc(d.op || "")}</small></div></div>
    <div class="tr-dgrid"><div><small>Abfahrt</small><b class="tab">${whenTxt(w)}</b>${d.delay >= 60 && d.plan ? `<small>statt ${hm(T(d.plan))}</small>` : ""}</div>
      <div><small>Noch</small><b class="tab" data-cd>${d.x ? "fällt aus" : esc(inTxt(m))}</b></div>
      <div><small>Steig</small><b>${d.pl ? esc(d.pl) : "–"}</b>${d.spl ? `<small>statt ${esc(d.spl)}</small>` : ""}</div>
      <div><small>Daten</small><b>${d.rt ? `<span class="tr-rt">● live</span>` : "Fahrplan"}</b></div></div>
    ${(d.warn || []).map(x => `<p class="tr-warn">⚠ ${esc(x)}</p>`).join("")}
    <p class="muted tr-hint">Das ist eine Abfahrt an deiner Haltestelle. Wann du damit ankommst, siehst du bei den Verbindungen oben.</p>`;
}
const stamp = x => x && x.at ? `Stand ${hm(new Date(x.at))}` : "";
const errTxt = x => !x || !x.err ? "" : x.err === "offline" ? "Kein Internet. Du siehst den letzten Stand." : x.err === "busy" ? "Der Fahrplan ist gerade überlastet, gleich nochmal." : x.err === "nostop" ? "Eine deiner Haltestellen wurde im Fahrplan nicht gefunden. Wähl sie unter „Orte ändern“ aus der Liste." : "Der Live-Fahrplan antwortet gerade nicht. Ich versuche es automatisch weiter. Bis dahin hilft der Knopf „In ÖBB Scotty öffnen“.";
/* klappt immer: dieselbe Strecke in der Fahrplanauskunft der ÖBB (zeigt auch Bus und Bim der Verbünde) */
const scotty = (a, b) => `https://fahrplan.oebb.at/bin/query.exe/dn?S=${encodeURIComponent(a.name)}&Z=${encodeURIComponent(b.name)}&start=1`;

/* Countdown läuft ohne neues Laden weiter */
function tick(root) {
  $$("[data-dep]", root).forEach(n => {
    const d = +n.dataset.dep; if (!d) return; const m = Math.round((d - Date.now()) / 60000);
    if (m < -1 && n.hasAttribute("data-rm")) { n.remove(); return; }
    const cd = $("[data-cd]", n); if (cd && !n.classList.contains("tr-x")) cd.textContent = cd.hasAttribute("data-short") ? (m < 60 ? (m <= 0 ? "jetzt" : m + "′") : hm(new Date(d))) : inTxt(m);
    const lv = $("[data-lv]", n), l = +n.dataset.leave; if (lv && l) { const k = Math.round((l - Date.now()) / 60000); lv.textContent = k <= 0 ? "Jetzt losgehen!" : "Losgehen " + inTxt(k); lv.classList.toggle("now", k <= 1); }
  });
}

/* ---------- Haltestelle suchen ---------- */
/* Suche: am Laptop eine Liste unter dem Feld, am Handy ein eigenes Fenster über die ganze Höhe mit „Fertig“ (4.48).
   Beide schließen mit ✕, Escape, Tippen daneben oder nach der Auswahl. */
const phone = () => matchMedia("(max-width: 640px)").matches;
function searchBox(q, here, sug, onPick, onClose) {
  let t = null, n = 0;
  const show = (list, msg) => { sug.hidden = false; sug.innerHTML = (msg ? `<div class="tr-sm muted">${esc(msg)}</div>` : list.map((x, i) => `<button type="button" role="option" data-i="${i}"><span><b>${esc(x.name)}</b>${x.area && !x.name.includes(x.area) ? ` <small>${esc(x.area)}</small>` : ""}</span>${x.distance != null ? `<small>${x.distance} m</small>` : ""}</button>`).join("") || `<div class="tr-sm muted">Nichts gefunden.</div>`); sug._l = list; };
  q.addEventListener("input", () => { clearTimeout(t); const v = q.value.trim(); if (v.length < 2) { sug.hidden = true; sug.innerHTML = ""; return; } t = setTimeout(async () => { const my = ++n; show([], "Suche …"); try { const l = await findStops(v); if (my === n) show(l); } catch (e) { if (my === n) { show([], "Der Fahrplan antwortet gerade nicht."); sug.insertAdjacentHTML("beforeend", `<button type="button" data-raw>„${esc(v)}“ trotzdem übernehmen</button>`); } } }, 280); });
  here.addEventListener("click", () => {
    if (!navigator.geolocation) return show([], "Dein Browser kann den Standort nicht bestimmen.");
    show([], "Bestimme Standort …");
    navigator.geolocation.getCurrentPosition(async p => { try { show(await nearStops(p.coords.latitude, p.coords.longitude)); } catch (e) { show([], "Der Fahrplan antwortet gerade nicht. Such die Haltestelle über den Namen."); } }, () => show([], "Standort nicht freigegeben."), { timeout: 10000, maximumAge: 120000 });
  });
  sug.addEventListener("click", e => {
    if (e.target.closest("[data-raw]")) { const v = q.value.trim(); if (v) onPick({ id: null, name: v, lat: null, lon: null, src: null }); onClose(); return; }
    const b = e.target.closest("[data-i]"); if (!b) return; const x = sug._l[+b.dataset.i]; onPick({ id: x.id, name: x.name, lat: x.lat, lon: x.lon, src: x.src }); onClose(); });
  q.addEventListener("keydown", e => { if (e.key === "Enter") { const b = $("[data-i]", sug); if (b && !sug.hidden) { e.preventDefault(); b.click(); } } if (e.key === "Escape") onClose(); });
}
function stopPicker(host, cur, onPick, title) {
  host.innerHTML = `<div class="tr-pick"><input type="search" class="tr-q" placeholder="Haltestelle suchen, z. B. Jakominiplatz" autocomplete="off" enterkeyhint="search" value="${esc(cur ? cur.name : "")}" aria-label="Haltestelle suchen"><button type="button" class="btn ghost sm tr-here" title="Haltestellen in meiner Nähe">📍 Hier</button><div class="tr-sug" role="listbox" hidden></div></div>`;
  const q = $(".tr-q", host), sug = $(".tr-sug", host);
  const pick = st => { q.value = st.name; onPick(st); };
  /* Laptop: Liste unter dem Feld */
  const close = () => { sug.hidden = true; };
  searchBox(q, $(".tr-here", host), sug, pick, close);
  const outside = e => { if (!host.contains(e.target)) close(); };
  document.addEventListener("pointerdown", outside, true);
  new MutationObserver((m, o) => { if (!host.isConnected) { document.removeEventListener("pointerdown", outside, true); o.disconnect(); } }).observe(document.body, { childList: true, subtree: true });
  /* Handy: eigenes Fenster */
  const sheet = () => {
    const sh = document.createElement("div"); sh.className = "tr-sheet"; sh.setAttribute("role", "dialog"); sh.setAttribute("aria-modal", "true");
    sh.innerHTML = `<div class="tr-shead"><b>${esc(title || "Haltestelle")}</b><button type="button" class="btn sm tr-done">Fertig</button></div>
      <div class="tr-sbar"><input type="search" class="tr-q2" placeholder="Haltestelle suchen" autocomplete="off" enterkeyhint="search" value="${esc(q.value)}" aria-label="Haltestelle suchen"></div>
      <button type="button" class="tr-shere">📍 Haltestellen in meiner Nähe</button><div class="tr-slist" role="listbox"></div>`;
    document.body.appendChild(sh); document.documentElement.classList.add("tr-noscroll");
    const q2 = $(".tr-q2", sh), done = () => { sh.remove(); document.documentElement.classList.remove("tr-noscroll"); };
    searchBox(q2, $(".tr-shere", sh), $(".tr-slist", sh), pick, done);
    $(".tr-done", sh).addEventListener("click", done);
    setTimeout(() => { q2.focus(); q2.select(); if (q2.value.trim().length >= 2) q2.dispatchEvent(new Event("input")); }, 30);
  };
  q.addEventListener("focus", () => { if (phone()) { q.blur(); sheet(); } });
  $(".tr-here", host).addEventListener("click", e => { if (phone()) { e.stopImmediatePropagation(); close(); sheet(); setTimeout(() => { const b = $(".tr-sheet .tr-shere"); b && b.click(); }, 60); } }, true);
}

/* ---------- Karte und „Ich fahre mit“ (4.48) ----------
   Karte mit Leaflet (lädt erst, wenn sie gebraucht wird) und Kartenbildern von OpenStreetMap.
   Wo Bus oder Zug gerade ist, wird aus Fahrplan und Live-Verspätung geschätzt: zwischen zwei Halten nach der Uhrzeit. */
const LEAF = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/";
let leafP = null;
function leaflet() {
  if (window.L && window.L.map) return Promise.resolve(window.L);
  if (leafP) return leafP;
  leafP = new Promise((ok, no) => {
    const c = document.createElement("link"); c.rel = "stylesheet"; c.href = LEAF + "leaflet.css"; c.crossOrigin = ""; document.head.appendChild(c);
    const sc = document.createElement("script"); sc.src = LEAF + "leaflet.js"; sc.crossOrigin = ""; sc.onload = () => ok(window.L); sc.onerror = () => { leafP = null; no(new Error("map")); }; document.head.appendChild(sc);
  });
  return leafP;
}
const legPath = g => (g.pts && g.pts.length > 1 ? g.pts : [g.oc, ...(g.stops || []).map(x => x.c), g.dc]).filter(Boolean);
const lerp = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
function along(path, f) { if (path.length < 2) return path[0] || null; const d = []; let tot = 0; for (let i = 1; i < path.length; i++) { const x = Math.hypot(path[i][0] - path[i - 1][0], (path[i][1] - path[i - 1][1]) * 0.68); d.push(x); tot += x; } let goal = tot * Math.max(0, Math.min(1, f)); for (let i = 0; i < d.length; i++) { if (goal <= d[i]) return lerp(path[i], path[i + 1], d[i] ? goal / d[i] : 0); goal -= d[i]; } return path[path.length - 1]; }
/* Wo ist die Fahrt gerade? state: wait (vor Abfahrt), ride (im Fahrzeug), walk, change (beim Umsteigen), done */
function whereNow(j, now = Date.now()) {
  const legs = j.legs, first = legs.find(g => !g.walk) || legs[0];
  if (now < T(legs[0].dep)) return { state: "wait", leg: first, c: first.oc || legPath(first)[0], next: first.o, nextT: first.dep };
  for (let i = 0; i < legs.length; i++) {
    const g = legs[i], a = T(g.dep), b = T(g.arr);
    if (now < a) return { state: "change", leg: g, c: g.oc || legPath(g)[0], next: g.o, nextT: g.dep, i };
    if (now <= b) {
      if (g.walk) return { state: "walk", leg: g, c: along(legPath(g), (now - a) / Math.max(1, b - a)), next: g.dst, nextT: g.arr, i };
      const tp = [{ t: a, c: g.oc, n: g.o }, ...(g.stops || []).map(x => ({ t: T(x.t), c: x.c, n: x.n })), { t: b, c: g.dc, n: g.dst }].filter(x => x.t && x.c);
      for (let k = 1; k < tp.length; k++) if (now <= tp[k].t) { const f = (now - tp[k - 1].t) / Math.max(1, tp[k].t - tp[k - 1].t); return { state: "ride", leg: g, c: lerp(tp[k - 1].c, tp[k].c, f), next: tp[k].n, nextT: tp[k].t.toISOString(), i, left: tp.length - k - 1 }; }
      return { state: "ride", leg: g, c: along(legPath(g), (now - a) / Math.max(1, b - a)), next: g.dst, nextT: g.arr, i, left: 0 };
    }
  }
  const last = legs[legs.length - 1]; return { state: "done", leg: last, c: last.dc || legPath(last).slice(-1)[0], next: last.dst, nextT: last.arr };
}
/* „Ich fahre mit“: diese Verbindung wird bis zur Ankunft oben gezeigt und auf der Karte verfolgt */
const RK = "studyos.transit.ride";
let ride = null; try { ride = JSON.parse(localStorage.getItem(RK) || "null"); } catch (e) {}
const rideOn = () => ride && ride.j && jArr(ride.j) && jArr(ride.j) - Date.now() > -5 * 60000 ? ride : null;
const setRide = j => { ride = j ? { j, at: Date.now() } : null; try { if (ride) localStorage.setItem(RK, JSON.stringify(ride)); else localStorage.removeItem(RK); } catch (e) {} };
/* die gemerkte Fahrt mit frischen Daten (Verspätung) auffrischen, wenn dieselbe Verbindung wieder geliefert wird */
function freshRide(x) { const R = rideOn(); if (!R) return null; const k = jKey(R.j), hit = (x && x.j || []).find(j => jKey(j) === k || (realLegs(j)[0] && realLegs(R.j)[0] && realLegs(j)[0].line && realLegs(R.j)[0].line && realLegs(j)[0].line.name === realLegs(R.j)[0].line.name && Math.abs(T(j.legs[j.legs.length - 1].arr) - T(R.j.legs[R.j.legs.length - 1].arr)) < 20 * 60000)); if (hit) setRide(hit); return rideOn(); }
function rideHTML(j) {
  const w = whereNow(j), arr = jArr(j), dep = jDep(j), pc = Math.round(100 * Math.max(0, Math.min(1, (Date.now() - T(j.legs[0].dep)) / Math.max(1, arr - T(j.legs[0].dep))))), g = w.leg || {};
  const now = w.state === "wait" ? `Warte auf ${badge(g.line)} · Abfahrt <b class="tab">${hm(T(g.dep))}</b> (${inTxt(mins(T(g.dep)))})${g.pl ? ` · Steig ${esc(g.pl)}` : ""}`
    : w.state === "ride" ? `Im ${badge(g.line)} ${g.dir ? "Richtung " + esc(g.dir) : ""}<br><small>Nächster Halt <b>${esc(w.next || "")}</b> um <span class="tab">${hm(T(w.nextT))}</span>${w.left ? ` · danach noch ${w.left} ${w.left === 1 ? "Halt" : "Halte"}` : ""}${g.dd >= 60 ? ` · <span class="tr-late">+${Math.round(g.dd / 60)} min</span>` : ""}</small>`
    : w.state === "walk" ? `🚶 Zu Fuß bis <b>${esc(w.next || "")}</b>, ${inTxt(mins(T(w.nextT)))}`
    : w.state === "change" ? `⇄ Umsteigen: ${badge(g.line)} fährt um <b class="tab">${hm(T(g.dep))}</b> (${inTxt(mins(T(g.dep)))})${g.pl ? ` · Steig ${esc(g.pl)}` : ""}`
    : `✓ Angekommen in <b>${esc(w.next || "")}</b>`;
  return `<div class="spread"><span class="eyebrow">Du fährst mit</span><button type="button" class="btn ghost sm" data-ride-end>Beenden</button></div>
    <div class="tr-rnow">${now}</div>
    <div class="tr-rbar" aria-hidden="true"><i style="width:${pc}%"></i></div>
    <div class="spread tr-rft"><small class="tab">${hm(dep)} ${esc((realLegs(j)[0] || {}).o || "")}</small><small class="tab">Ankunft <b>${hm(arr)}</b>${arr - Date.now() > 0 ? " · " + inTxt(mins(arr)) : ""}</small></div>`;
}
let MAP = null; /* { m, grp, veh, me, watch, key } */
/* freie OpenStreetMap-Kacheln ohne Key (CARTO verlangt inzwischen einen); im Dunkelmodus per CSS-Filter abgedunkelt, bei Fehlern Ausweich-Server */
const TILES = ["https://tile.openstreetmap.org/{z}/{x}/{y}.png", "https://tile.openstreetmap.de/{z}/{x}/{y}.png"];
const OSM_ATTR = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>-Mitwirkende';
const pin = (L, cls, html) => L.divIcon({ className: "tr-pin " + cls, html, iconSize: null });
function drawMap(box, j, title) {
  const note = $(".tr-mapnote", box.closest(".tr-mapc")), head = $(".tr-mt", box.closest(".tr-mapc"));
  if (head) head.textContent = title || "Karte";
  return leaflet().then(L => {
    if (!box.isConnected) return;
    if (!MAP || MAP.box !== box) {
      if (MAP && MAP.watch != null) navigator.geolocation.clearWatch(MAP.watch);
      const m = L.map(box, { zoomControl: false, attributionControl: true, scrollWheelZoom: false, tap: true });
      L.control.zoom({ position: "bottomright" }).addTo(m);
      let ti = 0, bad = 0; const tl = L.tileLayer(TILES[0], { maxZoom: 19, attribution: OSM_ATTR, className: "tr-tiles" }).addTo(m);
      tl.on("tileerror", () => { if (++bad > 6 && ti < TILES.length - 1) { bad = 0; tl.setUrl(TILES[++ti]); } });
      MAP = { box, m, grp: L.layerGroup().addTo(m), veh: null, me: null, watch: null, key: null };
      if (navigator.permissions && navigator.geolocation) navigator.permissions.query({ name: "geolocation" }).then(st => { if (st.state === "granted") showMe(false); }).catch(() => {});
    }
    const key = jKey(j) + "|" + j.legs.map(g => g.dep).join();
    if (MAP.key !== key) {
      MAP.key = key; MAP.grp.clearLayers(); MAP.veh = null;
      const all = [];
      j.legs.forEach(g => {
        const path = legPath(g); if (path.length < 2) return; all.push(...path);
        if (g.walk) L.polyline(path, { color: "#8a8f98", weight: 4, dashArray: "2 8", lineCap: "round" }).addTo(MAP.grp);
        else { L.polyline(path, { color: "#fff", weight: 9, opacity: .9 }).addTo(MAP.grp); L.polyline(path, { color: lineCol(g.line), weight: 5 }).addTo(MAP.grp);
          (g.stops || []).forEach(x => x.c && L.circleMarker(x.c, { radius: 3.5, color: lineCol(g.line), weight: 2, fillColor: "#fff", fillOpacity: 1 }).bindTooltip(`${esc(x.n)}${x.t ? " · " + hm(T(x.t)) : ""}`).addTo(MAP.grp));
          if (g.oc) L.circleMarker(g.oc, { radius: 6, color: lineCol(g.line), weight: 3, fillColor: "#fff", fillOpacity: 1 }).bindTooltip(`${esc(g.o || "")} · ${hm(T(g.dep))}${g.pl ? " · Steig " + esc(g.pl) : ""}`).addTo(MAP.grp); }
      });
      const s0 = j.legs[0], s1 = j.legs[j.legs.length - 1], a0 = legPath(s0)[0], a1 = legPath(s1).slice(-1)[0];
      if (a0) L.marker(a0, { icon: pin(L, "tr-pa", "A"), keyboard: false }).bindTooltip("Start: " + esc(s0.o || "")).addTo(MAP.grp);
      if (a1) L.marker(a1, { icon: pin(L, "tr-pb", "B"), keyboard: false }).bindTooltip("Ziel: " + esc(s1.dst || "")).addTo(MAP.grp);
      if (all.length) MAP.m.fitBounds(L.latLngBounds(all), { padding: [26, 26], maxZoom: 15 }); else MAP.m.setView([47.07, 15.44], 12);
      if (note) note.textContent = all.length ? "" : "Für diese Verbindung liefert der Fahrplan keine Koordinaten.";
    }
    moveVeh(j);
    setTimeout(() => MAP && MAP.m.invalidateSize(), 60);
  }).catch(() => { if (note) note.textContent = "Die Karte konnte nicht geladen werden. Prüf dein Internet."; });
}
function moveVeh(j) {
  if (!MAP || !window.L) return; const L = window.L, w = whereNow(j), note = $(".tr-mapnote", MAP.box.closest(".tr-mapc"));
  if (!w.c) return;
  const g = w.leg || {}, html = w.state === "walk" ? "🚶" : `<span class="tr-line" style="--lc:${lineCol(g.line)}">${esc(lineName(g.line))}</span>`;
  if (!MAP.veh) MAP.veh = L.marker(w.c, { icon: pin(L, "tr-veh " + w.state, html), zIndexOffset: 1000, keyboard: false }).addTo(MAP.grp); else { MAP.veh.setLatLng(w.c); MAP.veh.setIcon(pin(L, "tr-veh " + w.state, html)); }
  if (note) note.textContent = w.state === "ride" ? `${lineName(g.line)} ist ungefähr hier (geschätzt aus Fahrplan und Live-Verspätung). Nächster Halt: ${w.next || ""}.` : w.state === "wait" ? `Abfahrt ${hm(T(g.dep))} in ${g.o || ""}. Die Linie zeigt den Weg, die Punkte die Halte.` : w.state === "walk" ? "Fußweg, gestrichelt eingezeichnet." : w.state === "done" ? "Angekommen." : `Umsteigen in ${g.o || ""}.`;
}
function showMe(pan) {
  if (!MAP || !navigator.geolocation) return;
  if (MAP.watch != null) { if (pan && MAP.me) MAP.m.panTo(MAP.me.getLatLng()); return; }
  MAP.watch = navigator.geolocation.watchPosition(p => { if (!MAP || !window.L) return; const c = [p.coords.latitude, p.coords.longitude];
    if (!MAP.me) { MAP.me = window.L.marker(c, { icon: pin(window.L, "tr-me", "<i></i>"), zIndexOffset: 2000, keyboard: false }).bindTooltip("Du bist hier").addTo(MAP.m); if (pan) MAP.m.panTo(c); } else MAP.me.setLatLng(c); },
    () => { const n = $(".tr-mapnote", MAP.box.closest(".tr-mapc")); if (n) n.textContent = "Standort nicht freigegeben. Erlaube ihn in den Browser-Einstellungen."; }, { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 });
}
function dropMap() { if (MAP) { if (MAP.watch != null) navigator.geolocation.clearWatch(MAP.watch); try { MAP.m.remove(); } catch (e) {} MAP = null; } }

/* ---------- Seite „Unterwegs“ (4.50) ----------
   Übersicht mit antippbaren Karten und Zeilen (immer mit Pfeil ›). Antippen öffnet eine eigene Ansicht mit „‹ Zurück“ oben;
   raus kommt man über Zurück, die Zurück-Taste vom Handy/Browser oder Escape. Eigene Suche nach Strecke, Tag und Uhrzeit. */
let timer = null;
let SEARCH = null; /* { a, b, t (ms oder null = jetzt), arr } eigene Suche, sonst automatisch */
let VIEW = null;   /* { t: "j"|"d"|"ride", k, j, d, y, pushed, R } */
let closeView = null;
function stopTimer() { clearInterval(timer); timer = null; dropMap(); }
addEventListener("popstate", () => { if (VIEW && closeView) closeView(true); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && VIEW && closeView && !document.querySelector(".modal-back,.tr-sheet")) closeView(); });
const sameP = (x, y) => x && y && (x.id || x.name) === (y.id || y.name);
function findDialog(r, cur) {
  const s = cur || {}, a0 = s.a || placeOf(r.from), b0 = s.b || placeOf(r.to), mine = PLACES().filter(p => p[3] && p[3].name);
  let A = a0, B = b0, arr = !!s.arr;
  const d0 = new Date(s.t || Date.now()), pad = n => String(n).padStart(2, "0"), ymd = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const quick = which => `<div class="tr-fq">${mine.map(p => `<button type="button" class="chip" data-q="${which}|${p[0]}">${p[2]} ${esc(p[1])}</button>`).join("")}</div>`;
  const days = [0, 1, 2, 3, 4, 5, 6].map(n => { const d = new Date(); d.setDate(d.getDate() + n); return [ymd(d), n === 0 ? "Heute" : n === 1 ? "Morgen" : d.toLocaleDateString("de-AT", { weekday: "short", day: "numeric", month: "numeric" })]; });
  App.modal(`<div class="tr-fd"><div class="spread"><h3>Verbindung suchen</h3><button type="button" class="btn ghost sm" data-close aria-label="Schließen">✕</button></div>
    <p class="muted">Wähl Strecke, Tag und Uhrzeit. Danach siehst du, welche Busse, Bims und Züge fahren.</p>
    <div class="tr-fs"><small class="tr-fl">Von</small><div class="tr-fa"></div>${quick("a")}</div>
    <button type="button" class="chip tr-fswap">⇅ Tauschen</button>
    <div class="tr-fs"><small class="tr-fl">Nach</small><div class="tr-fb"></div>${quick("b")}</div>
    <div class="tr-fs"><small class="tr-fl">Wann</small>
      <div class="so-seg" role="radiogroup"><button type="button" class="chip ${arr ? "" : "acc"}" data-arr="0">Abfahrt um</button><button type="button" class="chip ${arr ? "acc" : ""}" data-arr="1">Ankunft bis</button></div>
      <div class="tr-fdays">${days.map(([v, t]) => `<button type="button" class="chip ${v === ymd(d0) ? "acc" : ""}" data-day="${v}">${esc(t)}</button>`).join("")}</div>
      <div class="row tr-fwhen"><label class="fld">Tag<input type="date" id="tr-fdate" value="${ymd(d0)}"></label><label class="fld">Uhrzeit<input type="time" id="tr-ftime" value="${pad(d0.getHours())}:${pad(d0.getMinutes())}"></label></div>
      <div class="tr-fq">${["07:00", "08:00", "12:00", "16:00", "18:00"].map(t => `<button type="button" class="chip" data-tm="${t}">${t}</button>`).join("")}</div></div>
    <div class="row tr-fgo"><button type="button" class="btn ghost" id="tr-fnow">Jetzt fahren</button><span class="so-sp"></span><button type="button" class="btn pri" id="tr-fok">Verbindungen zeigen</button></div></div>`, (m, close) => {
    const pa = () => stopPicker($(".tr-fa", m), A, st => { A = st; }, "Von"), pb = () => stopPicker($(".tr-fb", m), B, st => { B = st; }, "Nach");
    pa(); pb();
    $$("[data-q]", m).forEach(c => c.onclick = () => { const [w, k] = c.dataset.q.split("|"); if (w === "a") { A = placeOf(k); pa(); } else { B = placeOf(k); pb(); } });
    $(".tr-fswap", m).onclick = () => { [A, B] = [B, A]; pa(); pb(); };
    $$("[data-arr]", m).forEach(c => c.onclick = () => { arr = c.dataset.arr === "1"; $$("[data-arr]", m).forEach(x => x.classList.toggle("acc", x === c)); });
    const dEl = $("#tr-fdate", m), tEl = $("#tr-ftime", m);
    const marks = () => $$("[data-day]", m).forEach(x => x.classList.toggle("acc", x.dataset.day === dEl.value));
    $$("[data-day]", m).forEach(c => c.onclick = () => { dEl.value = c.dataset.day; marks(); });
    dEl.onchange = marks;
    $$("[data-tm]", m).forEach(c => c.onclick = () => { tEl.value = c.dataset.tm; });
    const go = t => { if (!A || !B) return App.toast("Strecke fehlt", "Wähl bei Von und Nach eine Haltestelle aus der Liste.", "⇆"); if (sameP(A, B)) return App.toast("Gleiche Haltestelle", "Von und Nach müssen verschieden sein.", "⇆");
      const auto = !t && sameP(A, placeOf(r.from)) && sameP(B, placeOf(r.to));
      SEARCH = auto ? null : { a: A, b: B, t, arr: !!t && arr }; close(); App.render(); };
    $("#tr-fnow", m).onclick = () => go(null);
    $("#tr-fok", m).onclick = () => { const [y, mo, da] = dEl.value.split("-").map(Number), [h, mi] = (tEl.value || "00:00").split(":").map(Number); const t = new Date(y, mo - 1, da, h, mi).getTime(); go(isFinite(t) && Math.abs(t - Date.now()) > 3 * 60000 ? t : null); };
  });
}
let trAC = null; /* #page bleibt dasselbe Element: Klick-Handler der letzten Darstellung abmelden, sonst feuern sie mehrfach */
PAGES.transit = el => {
  stopTimer(); if (trAC) trAC.abort(); trAC = new AbortController(); const once = { signal: trAC.signal };
  if (!ready()) {
    el.innerHTML = `<div class="page tr-page"><header><span class="eyebrow">Öffis</span><h1>Unterwegs</h1><p class="muted">Sag StudyOS, wo du wohnst und wo du studierst. Dann siehst du hier immer den nächsten Bus, die nächste Bim oder den nächsten Zug, passend zur Uhrzeit und zu deinem Stundenplan.</p></header>
      <div class="card col tr-setup">${placesHTML()}</div></div>`;
    bindPlaces($(".tr-setup", el), () => App.render());
    return;
  }
  if (VIEW && VIEW.R !== App.route()) VIEW = null; /* frisch über das Menü geöffnet: Übersicht */
  const r0 = route(), S0 = SEARCH, live = !S0 || !S0.t, W = S0 && S0.t ? { t: S0.t, arr: S0.arr } : null;
  const a = S0 ? S0.a : placeOf(r0.from), b = S0 ? S0.b : placeOf(r0.to);
  const r = S0 ? { from: "", to: "", a, b, auto: false, why: "", by: null } : r0, others = PLACES().filter(p => p[3] && p[3].id);
  const title = S0 ? "Nach " + esc(b.name) : r.to === "home" ? "Nach Hause" : r.to === "uni" ? "Zur FH" : "Nach " + esc(labelOf(r.to));
  const whenLbl = W ? `${W.arr ? "Ankunft bis" : "Abfahrt ab"} ${dayTxt(W.t)}, ${hm(new Date(W.t))}` : "Jetzt";
  el.innerHTML = `<div class="page tr-page">
   <div class="tr-ov">
    <header class="tr-head"><span class="eyebrow">${S0 ? "Deine Suche" : "Öffis · live"}</span><h1>${title}</h1><p class="muted">${S0 ? esc(whenLbl) : esc(r.why) + (r.auto ? " · Richtung wählt sich automatisch" : "")}</p></header>
    <div class="tr-ways">
      <div class="tr-way"><span class="tr-pl"><small>${S0 ? "Von" : esc(labelOf(r.from))}</small><b>${esc(a.name)}</b></span><button type="button" class="tr-swap" id="tr-swap" title="Richtung tauschen" aria-label="Richtung tauschen">⇅</button><span class="tr-pl"><small>${S0 ? "Nach" : esc(labelOf(r.to))}</small><b>${esc(b.name)}</b></span></div>
      <div class="tr-chips"><button type="button" class="chip acc tr-findc" id="tr-find">🕒 ${esc(whenLbl)} · Zeit oder Strecke ändern</button>${!S0 && (others.length > 2 || !r.auto) ? `<button type="button" class="chip ${r.auto ? "acc" : ""}" data-auto>Automatisch</button>` : ""}${!S0 && others.length > 2 ? others.filter(p => p[0] !== r.to).map(p => `<button type="button" class="chip" data-to="${p[0]}">${p[2]} Nach ${esc(p[1])}</button>`).join("") : ""}<button type="button" class="chip" id="tr-reload">↻ Aktualisieren</button><a class="chip" href="${esc(scotty(a, b))}" target="_blank" rel="noopener">In ÖBB Scotty öffnen ↗</a></div>
    </div>
    ${S0 ? `<div class="tr-sban"><span>🔎 Du siehst eine eigene Suche${W ? "" : " für jetzt"}.</span><button type="button" class="btn sm" data-clear>✕ Zurück zu jetzt & automatisch</button></div>` : ""}
    <button type="button" class="tr-ridebar" data-open-ride hidden></button>
    <section class="card tr-main" aria-live="polite"><div class="tr-load">Lade Verbindungen …</div></section>
    <section class="card tr-board"><div class="spread"><h3>Abfahrten ab ${esc(a.name)}${W && !W.arr ? " · " + esc(whenTxt(new Date(W.t))) : ""}</h3><small class="muted tr-stamp"></small></div><small class="muted">Antippen für Steig und Details.</small><div class="tr-deps"></div></section>
    <p class="tr-foot muted"><button type="button" class="linkish" data-go="settings" data-p="wege">Orte ändern</button><br>Live-Fahrplan von <a href="https://transitous.org/sources/" target="_blank" rel="noopener">Transitous</a> (Daten der Verkehrsverbünde, © OpenStreetMap-Mitwirkende), ersatzweise ÖBB. Abfahrten aktualisieren sich jede Minute von selbst, Verbindungen alle 90 Sekunden.</p>
   </div>
   <div class="tr-view" hidden></div>
   <div class="tr-hold" hidden><section class="card tr-mapc"><div class="spread"><h3 class="tr-mt">Karte</h3><div class="row tr-mapb"><button type="button" class="chip" data-me>📍 Wo bin ich</button><button type="button" class="chip" data-big aria-label="Karte größer">⤢ Größer</button></div></div><div class="tr-map notranslate" translate="no" aria-label="Karte der Verbindung"></div><small class="muted tr-mapnote"></small></section></div>
  </div>`;
  let lastX = null;
  const ups = () => upcoming(lastX, !live);
  const paint = x => {
    lastX = x || lastX; x = lastX;
    const main = $(".tr-main", el), deps = $(".tr-deps", el); if (!main) return;
    const up = ups(), err = errTxt(x);
    const pager = up.length ? `<div class="row tr-pager"><button type="button" class="btn ghost sm" data-page="-1">‹ Früher</button><button type="button" class="btn ghost sm" data-page="1">Später ›</button></div>` : "";
    main.innerHTML = up.length ? `<span class="eyebrow">${live ? "Nächste Verbindung" : "Erste Verbindung"}</span>` + heroHTML(up[0], r, live) + (up.length > 1 ? `<div class="tr-list"><div class="spread"><span class="eyebrow">${live ? "Danach" : "Weitere"}</span><small class="muted">Antippen für Halte, Steige und Karte</small></div>${up.slice(1, 6).map(j => rowJ(j, live)).join("")}</div>` : "") + pager + (err ? `<p class="tr-err">${esc(err)}</p>` : "")
      : x && x.at ? `<div class="empty">Keine Verbindung gefunden.${err ? " " + esc(err) : ""}</div>${pager}` : `<div class="empty">${esc(err || "Lade Verbindungen …")}</div>`;
    const dl = (x && x.d || []).filter(d => { const w = T(d.when); return w && (!live || w - Date.now() > -60000); }).slice(0, 10);
    deps.innerHTML = dl.length ? dl.map(d => rowD(d, live)).join("") : `<div class="tr-sm muted">${x && x.at ? "Keine Abfahrten in dieser Zeit." : x && x.err ? "Gerade keine Live-Abfahrten." : "…"}</div>`;
    const st = $(".tr-stamp", el); if (st) st.textContent = stamp(x);
    paintRide();
    if (VIEW) paintView();
  };
  /* Leiste „Du fährst mit“ in der Übersicht */
  const paintRide = () => {
    const R = freshRide(live ? lastX : null), rb = $(".tr-ridebar", el); if (!rb) return;
    rb.hidden = !R; if (!R) return;
    const w = whereNow(R.j), g = w.leg || {};
    rb.innerHTML = `<span class="tr-rbi">${w.state === "walk" ? "🚶" : badge(g.line)}</span><span class="tr-rbt"><small class="eyebrow">Du fährst mit</small><b>${w.state === "ride" ? "Nächster Halt " + esc(w.next || "") : w.state === "wait" ? "Abfahrt " + hm(T(g.dep)) + (g.pl ? " · Steig " + esc(g.pl) : "") : w.state === "done" ? "Angekommen" : w.state === "walk" ? "Zu Fuß bis " + esc(w.next || "") : "Umsteigen in " + esc(g.o || "")}</b><small class="muted">Ankunft ${hm(jArr(R.j))} in ${esc((R.j.legs[R.j.legs.length - 1] || {}).dst || "")}</small></span><span class="tr-rbgo">Fahrt öffnen ›</span>`;
  };
  /* ---------- eigene Ansicht für eine Verbindung, eine Abfahrt oder die laufende Fahrt ---------- */
  const view = $(".tr-view", el), ov = $(".tr-ov", el), mc = $(".tr-mapc", el), hold = $(".tr-hold", el);
  const findJ = k => ups().find(z => jKey(z) === k);
  const findD = k => ((lastX && lastX.d) || []).find(d => dKey(d) === k);
  const paintView = () => {
    if (!VIEW) return;
    const R = rideOn();
    if (VIEW.t === "ride" && !R) return closeView();
    const j = VIEW.t === "ride" ? (freshRide(live ? lastX : null) || R).j : VIEW.t === "j" ? (findJ(VIEW.k) || VIEW.j) : null;
    const d = VIEW.t === "d" ? (findD(VIEW.k) || VIEW.d) : null;
    if (j) VIEW.j = j; if (d) VIEW.d = d;
    const top = $(".tr-vtop", view), body = $(".tr-vbody", view), tt = $(".tr-vt", view); if (!top) return;
    if (VIEW.t === "d" && d) {
      tt.innerHTML = `<b>${esc(lineName(d.line))}${d.dir ? " · Richtung " + esc(d.dir) : ""}</b><small class="muted">Abfahrt ab ${esc(a.name)}</small>`;
      top.dataset.dep = T(d.when) ? T(d.when).getTime() : ""; top.innerHTML = depHTML(d); body.innerHTML = ""; mc.hidden = true; return;
    }
    if (!j) { top.innerHTML = `<div class="empty">Diese Verbindung ist nicht mehr in der Liste.</div>`; mc.hidden = true; return; }
    const k = jKey(j), riding = R && jKey(R.j) === k, f = realLegs(j)[0] || j.legs[0];
    tt.innerHTML = VIEW.t === "ride" ? `<b>Deine Fahrt</b><small class="muted">${esc(f.o || "")} → ${esc((j.legs[j.legs.length - 1] || {}).dst || "")}</small>` : `<b>Verbindung ${whenTxt(jDep(j))} → ${hm(jArr(j))}</b><small class="muted">${esc(f.o || "")} → ${esc((j.legs[j.legs.length - 1] || {}).dst || "")}</small>`;
    top.dataset.dep = jDep(j) ? jDep(j).getTime() : "";
    top.innerHTML = VIEW.t === "ride" ? rideHTML(j)
      : `<div class="tr-vsum">${legsHTML(j)}<div class="tr-tm tab"><b>${hm(jDep(j))}</b> ${delayTxt(f.dd)} <span class="tr-arrow">→</span> <b>${hm(jArr(j))}</b>${f.pl ? ` <span class="chip">Steig ${esc(f.pl)}</span>` : ""}</div>${factsHTML(j)}${live ? `<small class="muted">Abfahrt <b data-cd>${esc(inTxt(mins(jDep(j))))}</b>${leaveAt(j, r) ? ` · losgehen spätestens ${hm(leaveAt(j, r))}` : ""}</small>` : `<small class="muted">${esc(dayTxt(jDep(j)))}${leaveAt(j, r) ? ` · losgehen ${hm(leaveAt(j, r))}` : ""}</small>`}</div>
        <div class="row tr-acts">${riding ? `<button type="button" class="btn pri sm" data-open-ride>Du fährst mit · Fahrt öffnen ›</button>` : soon(j) ? `<button type="button" class="btn pri sm" data-ride="${esc(k)}">▶ Ich fahre mit</button>` : ""}</div>${!riding && soon(j) ? RIDEHINT : ""}`;
    const open = [...body.querySelectorAll("details.tr-mid")].map(x => x.open);
    body.innerHTML = `<section class="card"><h3>Halte & Steige</h3>${detailHTML(j)}</section>`;
    body.querySelectorAll("details.tr-mid").forEach((x, i) => { if (open[i]) x.open = true; });
    mc.hidden = false;
    drawMap($(".tr-map", mc), j, VIEW.t === "ride" ? "Deine Fahrt auf der Karte" : "Karte dieser Verbindung");
  };
  const showView = () => {
    const tb = $(".topbar"); el.style.setProperty("--tr-top", (tb && getComputedStyle(tb).display !== "none" ? tb.offsetHeight : 0) + "px");
    ov.hidden = true; view.hidden = false;
    view.innerHTML = `<div class="tr-vbar"><button type="button" class="tr-back" data-back aria-label="Zurück zur Übersicht">‹ Zurück</button><div class="tr-vt"></div></div><section class="card tr-vtop"></section><div class="tr-vbody"></div>`;
    view.insertBefore(mc, $(".tr-vbody", view)); mc.classList.remove("big"); const bg = $("[data-big]", mc); if (bg) bg.textContent = "⤢ Größer";
    paintView();
  };
  const openView = v => {
    const was = VIEW; v.R = App.route(); v.y = was ? was.y : scrollY; v.pushed = was ? was.pushed : false; VIEW = v;
    if (!v.pushed) { try { history.pushState({ tr: 1 }, "", location.href); v.pushed = true; } catch (e) {} }
    showView(); scrollTo({ top: 0 });
  };
  closeView = fromPop => {
    if (!VIEW) return; const v = VIEW; VIEW = null;
    if (!el.isConnected) return;
    dropMap(); mc.hidden = true; hold.appendChild(mc); view.hidden = true; view.innerHTML = ""; ov.hidden = false;
    paint(); scrollTo({ top: v.y || 0 });
    if (!fromPop && v.pushed) try { history.back(); } catch (e) {}
  };
  el.addEventListener("click", e => {
    if (e.target.closest("[data-back]")) { closeView(); return; }
    const rb = e.target.closest("[data-ride]"); if (rb) { const j = findJ(rb.dataset.ride) || (VIEW && VIEW.j); if (j) { setRide(j); App.toast("Gute Fahrt", "StudyOS begleitet dich bis zur Ankunft. Zurück kommst du oben links.", "🚌"); openView({ t: "ride" }); } return; }
    if (e.target.closest("[data-ride-end]")) { setRide(null); if (VIEW && VIEW.t === "ride") closeView(); else paintRide(); return; }
    if (e.target.closest("[data-open-ride]")) { openView({ t: "ride" }); return; }
    const oj = e.target.closest("[data-open-j]"); if (oj) { const j = findJ(oj.dataset.openJ); if (j) openView({ t: "j", k: oj.dataset.openJ, j }); return; }
    const od = e.target.closest("[data-open-d]"); if (od) { const d = findD(od.dataset.openD); if (d) openView({ t: "d", k: od.dataset.openD, d }); return; }
    const pg = e.target.closest("[data-page]"); if (pg) { const up = ups(); if (!up.length) return; const t = pg.dataset.page === "1" ? jDep(up[up.length - 1]).getTime() + 60000 : jDep(up[0]).getTime() - 60 * 60000; SEARCH = { a, b, t, arr: false }; App.render(); return; }
    if (e.target.closest("[data-clear]")) { SEARCH = null; App.render(); return; }
    if (e.target.closest("[data-me]")) { showMe(true); return; }
    if (e.target.closest("[data-big]")) { mc.classList.toggle("big"); e.target.closest("[data-big]").textContent = mc.classList.contains("big") ? "⤡ Kleiner" : "⤢ Größer"; setTimeout(() => MAP && MAP.m.invalidateSize(), 250); }
  }, once);
  el.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".tr-tap")) { e.preventDefault(); e.target.click(); } }, once);
  const store = W ? tmp : data, k = keyOf(a, b) + (W ? "@" + W.t + (W.arr ? "a" : "d") : ""); if (store[k]) paint(store[k]);
  if (VIEW) showView();
  const refresh = force => loadAB(a, b, force, 85000, W).then(x => { if (el.isConnected && App.route().v === "transit") paint(x); });
  refresh(false);
  let n = 0;
  timer = setInterval(() => { if (!el.isConnected || App.route().v !== "transit") return stopTimer(); if (document.hidden) return;
    tick(el); paintRide();
    if (VIEW && VIEW.t === "ride") { const R = rideOn(), top = $(".tr-vtop", view); if (!R) closeView(); else { if (top) top.innerHTML = rideHTML(R.j); moveVeh(R.j); } } else if (VIEW && VIEW.j) moveVeh(VIEW.j);
    if (live && ++n % 4 === 0) refresh(false); /* Abfahrten jede Minute, Verbindungen alle 90 s (siehe load), damit Verspätungen stimmen */
    const now = route(); if (!S0 && !VIEW && now.auto && (now.from !== r.from || now.to !== r.to)) App.softRender(); }, 15000);
  $("#tr-swap", el).addEventListener("click", () => { if (S0) SEARCH = Object.assign({}, S0, { a: S0.b, b: S0.a }); else pick = { from: r.to, to: r.from }; App.render(); });
  $("#tr-find", el).addEventListener("click", () => findDialog(r0, S0 || { a, b }));
  $("#tr-reload", el).addEventListener("click", () => { $(".tr-main", el).classList.add("tr-busy"); refresh("all").then(() => { const m = $(".tr-main", el); m && m.classList.remove("tr-busy"); }); });
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
    stopPicker($(".tr-ps", pl), objFor(k), st => { const o = objFor(k) || {}; setFor(k, Object.assign({}, o, st, { label: o.label })); App.save(); App.toast("Gespeichert", labelOf(k) + ": " + st.name, "✓"); if (ready() && onDone) onDone(); }, labelOf(k) + " wählen");
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
  load(r, false, 300000).then(x => { if (card.isConnected) fill(x); });
  let n = 0;
  dashT = setInterval(() => { if (!card.isConnected) { clearInterval(dashT); dashT = null; return; } if (document.hidden) return; tick(card); if (++n % 8 === 0) load(r, false, 300000).then(x => card.isConnected && fill(x)); }, 15000);
};

App.transit = { cfg, plan, route, load, ready };
})();
