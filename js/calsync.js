/* StudyOS · Kalender mit dem Konto synchronisieren (Supabase-Tabelle calendars, eine Zeile pro Konto, RLS nur eigene Zeile).
   Wer unter „Gemeinsam“ mit E-Mail und Passwort angemeldet ist, hat eigene Termine und Stundenplan auf jedem Gerät.
   Abgleich als Dreiwege-Merge gegen den zuletzt synchronisierten Stand (localStorage, pro Profil und Konto):
   so kommen neue, geänderte und gelöschte Termine von beiden Seiten richtig an. Bei echtem Konflikt gewinnt die jüngere Änderung.
   Datenbank: supabase-update-8.sql. Muss nach social.js geladen werden. */
(function () {
const { $, esc } = App;
const S = () => App.S();
const on = () => !!((S().settings || {}).online || {}).on;
let user = null, busy = null, again = false, chan = null, pushT = null, lastSig = null, status = { state: "off" };
const KEY = () => `studyos.calsync.${window.STUDYOS_PID || "x"}.${user ? user.id : "-"}`;
const loadBase = () => { try { return JSON.parse(localStorage.getItem(KEY()) || "null"); } catch (e) { return null; } };
const saveBase = b => { try { localStorage.setItem(KEY(), JSON.stringify(b)); } catch (e) {} };

/* ---------- Was synchronisiert wird ---------- */
const local = () => ({ events: (S().events || []).filter(e => e && e.id), tt: { timetable: S().timetable || [], ttSource: S().ttSource ? Object.assign({}, S().ttSource, { tried: undefined, at: undefined }) : null, ttFH: S().ttFH || null } });
/* nach ID sortiert: dieselben Termine ergeben auf jedem Gerät denselben Stand, egal in welcher Reihenfolge sie liegen.
   Sonst hielten sich zwei Geräte gegenseitig für geändert und zeichneten sich ständig neu (4.46). */
const byId = list => { const m = {}; (list || []).filter(e => e && e.id).sort((a, b) => String(a.id).localeCompare(String(b.id))).forEach(e => { m[e.id] = JSON.stringify(e); }); return m; };
const sig = d => JSON.stringify([byId(d.events), d.tt]);
function merge(L, R, B, localNewer) {
  const l = byId(L.events), r = byId(R.events), b = (B && B.events) || {}, out = [];
  new Set(Object.keys(l).concat(Object.keys(r), Object.keys(b))).forEach(id => {
    const x = l[id], y = r[id], z = b[id]; let v;
    if (x === y) v = x; else if (x === z) v = y; else if (y === z) v = x; else v = localNewer ? (x || y) : (y || x);
    if (v) out.push(JSON.parse(v));
  });
  out.sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const lt = JSON.stringify(L.tt), rt = JSON.stringify(R.tt), bt = B ? B.tt : null;
  const none = t => !((t || {}).timetable || []).length && !(t || {}).ttSource;
  /* erster Abgleich auf einem Gerät (kein gemeinsamer Stand): ein leerer Stundenplan überschreibt nie einen vorhandenen */
  const tt = JSON.parse(lt === rt ? lt : !B ? (none(R.tt) ? lt : none(L.tt) ? rt : localNewer ? lt : rt) : lt === bt ? rt : rt === bt ? lt : localNewer ? lt : rt);
  return { events: out, tt };
}
const empty = d => !d || (!(d.events || []).length && !((d.tt || {}).timetable || []).length);

/* ---------- Verbindung ---------- */
async function session() {
  if (!App.social || !App.social.ensure) return null;
  const sb = await App.social.ensure(), { data } = await sb.auth.getSession(), u = data && data.session && data.session.user;
  return u && u.email && !u.is_anonymous ? { sb, u } : null;
}
function apply(d) {
  const before = sig(local());
  S().events = d.events; S().timetable = d.tt.timetable || []; const was = S().ttSource || {}; S().ttSource = d.tt.ttSource ? Object.assign({}, d.tt.ttSource, { at: was.at, tried: was.tried }) : null; /* wann zuletzt geladen bleibt pro Gerät */ S().ttFH = d.tt.ttFH || null;
  if (sig(local()) === before) return false;
  lastSig = sig(local()); App.save(); App.syncReminders && App.syncReminders();
  if (App.route && ["calendar", "dash"].includes(App.route().v)) App.softRender(); else App.renderSide && App.renderSide();
  return true;
}
async function sync(reason) {
  if (busy) { again = true; return busy; }
  busy = (async () => {
    const s = await session(); if (!s) { user = null; status = { state: "off" }; return; }
    if (!user || user.id !== s.u.id) { user = s.u; listen(s.sb); }
    status = { state: "busy", email: user.email };
    const row = await s.sb.from("calendars").select("data,updated_at").eq("user_id", user.id).maybeSingle();
    if (row.error) throw row.error;
    const base = loadBase(), L = local(), R = row.data && row.data.data ? Object.assign({ events: [], tt: { timetable: [], ttSource: null, ttFH: null } }, row.data.data) : null;
    const remoteAt = row.data ? Date.parse(row.data.updated_at) : 0, localNewer = (base && base.dirtyAt || 0) > remoteAt;
    const M = R ? merge(L, R, base, localNewer) : L;
    const changedHere = apply(M);
    const Ms = sig(M), needPush = !R || sig(R) !== Ms;
    if (needPush && !(empty(M) && !R)) { const w = await s.sb.from("calendars").upsert({ user_id: user.id, data: { v: 1, events: M.events, tt: M.tt } }); if (w.error) throw w.error; }
    saveBase({ events: byId(M.events), tt: JSON.stringify(M.tt), at: Date.now(), dirtyAt: 0 });
    lastSig = sig(local()); status = { state: "ok", email: user.email, at: Date.now(), got: changedHere };
  })().catch(e => { status = { state: "err", email: user && user.email, msg: /calendars|does not exist|schema cache|PGRST20/.test(String(e && e.message)) ? "db" : "net" }; })
    .finally(() => { busy = null; paint(); if (again) { again = false; setTimeout(() => sync("again"), 300); } });
  return busy;
}
function listen(sb) {
  if (chan) { try { sb.removeChannel(chan); } catch (e) {} chan = null; }
  if (!user || !sb.channel) return;
  chan = sb.channel("cal-" + user.id).on("postgres_changes", { event: "*", schema: "public", table: "calendars", filter: "user_id=eq." + user.id }, () => { clearTimeout(pushT); pushT = setTimeout(() => sync("remote"), 400); }).subscribe();
}
/* lokale Änderung erkannt: als „neuer“ markieren und bald hochladen */
function changed() {
  if (!user) return; const s = sig(local()); if (s === lastSig) return; lastSig = s;
  const b = loadBase(); if (b) { b.dirtyAt = Date.now(); saveBase(b); }
  clearTimeout(pushT); pushT = setTimeout(() => sync("local"), 1200);
}
const prevSaved = App.onSaved;
App.onSaved = () => { prevSaved && prevSaved(); try { changed(); } catch (e) {} };

/* ---------- Anzeige im Kalender ---------- */
const ago = t => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? "gerade eben" : m < 60 ? `vor ${m} Min.` : `vor ${Math.round(m / 60)} Std.`; };
App.calSyncHTML = () => {
  const st = status;
  if (st.state === "off" || !on()) return `<div class="cal-sync off"><span aria-hidden="true">☁</span><span>Melde dich unter <b>Gemeinsam</b> mit E-Mail und Passwort an, dann hast du Termine und Stundenplan auf jedem Gerät.</span><button class="btn sm ghost" data-go="together" data-p="">Anmelden</button></div>`;
  const txt = st.state === "busy" ? "Wird abgeglichen …" : st.state === "err" ? (st.msg === "db" ? "Abgleich noch nicht eingerichtet (Datenbank-Update 8 fehlt)." : "Gerade offline. Änderungen werden später abgeglichen.") : `Mit deinem Konto abgeglichen · ${ago(st.at)}`;
  return `<div class="cal-sync ${st.state}"><span aria-hidden="true">${st.state === "err" ? "!" : "☁"}</span><span>${txt}${st.email ? ` <small>${esc(st.email)}</small>` : ""}</span>${st.state !== "busy" ? `<button class="btn sm ghost" id="cal-sync-now">Jetzt abgleichen</button>` : ""}</div>`;
};
function paint() { const box = document.querySelector(".cal-sync"); if (!box) return; const d = document.createElement("div"); d.innerHTML = App.calSyncHTML(); box.replaceWith(d.firstElementChild); }
document.addEventListener("click", e => { if (e.target.closest("#cal-sync-now")) { status = Object.assign({}, status, { state: "busy" }); paint(); sync("button"); } });

/* ---------- Wann abgeglichen wird ---------- */
App.authHooks = App.authHooks || [];
App.authHooks.push(kind => { if (kind === "login") { user = null; sync("login"); } else { user = null; status = { state: "off" }; if (chan && App.social.client()) try { App.social.client().removeChannel(chan); } catch (e) {} chan = null; paint(); } });
App.afterBoot.push(() => {
  const go = () => { if (on() && navigator.onLine) sync("boot"); };
  setTimeout(go, 900);
  window.addEventListener("online", go);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && user) sync("focus"); });
});
App.calSync = { sync, merge, status: () => status };
})();
