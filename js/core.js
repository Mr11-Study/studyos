/* StudyOS v2 core: courses registry, state, gamification, shell, main pages */
(function () {
const App = window.App = {};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const dkey = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const today = () => dkey(new Date());
const fmtMin = sec => { const m = Math.round(sec / 60); return m < 60 ? m + " min" : Math.floor(m / 60) + " h " + (m % 60) + " min"; };
const fmtDate = (k, o = { weekday: "short", day: "numeric", month: "short" }) => k ? new Date(k + "T12:00:00").toLocaleDateString("de-AT", o) : "–";
const daysUntil = k => Math.round((new Date(k + "T00:00:00") - new Date(today() + "T00:00:00")) / 864e5);
Object.assign(App, { $, $$, esc, clamp, shuffle, dkey, today, fmtMin, fmtDate, daysUntil });

/* ---------------- course registry ---------------- */
const COURSES = (window.COURSE_DEFS || []).slice();
const CBY = Object.fromEntries(COURSES.map(c => [c.id, c]));
const TOPICS = {}, LESSONS = [], QUESTIONS = [], BOSSQ = [], FLASH = [];
COURSES.forEach(c => {
  Object.entries(c.topics).forEach(([k, t]) => TOPICS[k] = Object.assign({ course: c.id }, t));
  c.worlds.forEach(w => { w.course = c.id; w.lessons.forEach(l => { l.world = w; l.course = c.id; LESSONS.push(l); }); });
  (c.questions || []).forEach(q => QUESTIONS.push(Object.assign(q, { course: c.id })));
  (c.bossExtra || []).forEach(q => BOSSQ.push(Object.assign(q, { course: c.id })));
  (c.flashcards || []).forEach(f => FLASH.push(Object.assign(f, { course: c.id })));
});
const LBYID = Object.fromEntries(LESSONS.map(l => [l.id, l]));
const courseOfTopic = t => TOPICS[t] ? TOPICS[t].course : null;
Object.assign(App, { COURSES, CBY, TOPICS, LESSONS, LBYID, QUESTIONS, BOSSQ, FLASH, courseOfTopic });
/* compatibility for the Data Science widgets */
const dasc = CBY.dasc || {};
App.D = { PY_TASKS: dasc.pyTasks || {}, TOPICS, RESOURCES: dasc.resources || {} };

/* ---------------- state ---------------- */
const KEY = "studyos.v2", SECRET_KEY = "studyos.secrets";
const DEFAULT = () => ({
  v: 2, updatedAt: 0, name: "Kevin", xp: 0, dailyGoal: 50, course: COURSES[0] ? COURSES[0].id : null,
  settings: { unlockAll: false, level: "normal" },
  lessons: {}, topics: {}, days: {}, cards: {}, customCards: [], notes: {}, bookmarks: [],
  ach: {}, bosses: {}, py: {}, quizHist: [], widgets: {}, daily: {}, exams: [],
  assess: {}, imports: [], masteryHist: {},
  events: [], eventOv: {}, tasks: {}, userTasks: [], plans: {},
  notify: { enabled: false, daily: "18:00", before: [7, 3, 1, 0], sent: {} },
  profile: { pinHash: null, lockAfterMin: 5, created: Date.now() },
  sync: { gistId: null, last: 0 }, ai: { enabled: false, model: "claude-haiku-4-5-20251001", confirm: true },
  git: null, forms: {}
});
function merge(base, src) {
  if (!src || typeof src !== "object") return base;
  for (const k of Object.keys(src)) {
    if (base[k] && typeof base[k] === "object" && !Array.isArray(base[k]) && src[k] && typeof src[k] === "object" && !Array.isArray(src[k])) base[k] = Object.assign(base[k], src[k]);
    else if (src[k] !== undefined) base[k] = src[k];
  }
  return base;
}
let S = DEFAULT();
try { const raw = localStorage.getItem(KEY); if (raw) S = merge(DEFAULT(), JSON.parse(raw)); else { const old = localStorage.getItem("studyos.v1"); if (old) { S = merge(DEFAULT(), JSON.parse(old)); S.course = "dasc"; } } } catch (e) {}
if (!CBY[S.course]) S.course = COURSES[0].id;
App.S = () => S;
App.replaceState = obj => { S = merge(DEFAULT(), obj); saveLocal(); App.renderSide(); App.render(); };
let SEC = {}; try { SEC = JSON.parse(localStorage.getItem(SECRET_KEY) || "{}"); } catch (e) {}
App.secrets = () => SEC;
App.saveSecrets = () => { try { localStorage.setItem(SECRET_KEY, JSON.stringify(SEC)); } catch (e) {} };

let saveTimer = null;
function saveLocal() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("Speicher voll", "Lokaler Speicher ist voll. Exportiere ein Backup und lösche alte Importe.", "!"); } }
function save() { S.updatedAt = Date.now(); saveLocal(); clearTimeout(saveTimer); saveTimer = setTimeout(() => { App.onSaved && App.onSaved(); }, 1500); }
App.save = save;

/* ---------------- day log, XP ---------------- */
function day(k = today()) { return S.days[k] || (S.days[k] = { xp: 0, sec: 0, q: 0, qc: 0, cards: 0, lessons: 0 }); }
const xpFor = L => 25 * (L - 1) * (L + 2);
function levelOf(xp) { let L = 1; while (xp >= xpFor(L + 1)) L++; return L; }
Object.assign(App, { day, xpFor, levelOf });
function addXP(n, reason, el) {
  if (!n) return; const before = levelOf(S.xp);
  S.xp += n; day().xp += n; touchNight(); floatXP(n, el);
  const after = levelOf(S.xp); if (after > before) toast("Level " + after, "Du hast Level " + after + " erreicht.", "↑", true);
  checkAch(); save(); renderSide();
}
App.addXP = addXP;
function floatXP(n, el) {
  const f = document.createElement("div"); f.className = "xpfloat"; f.textContent = "+" + n + " XP";
  let x = window.innerWidth - 140, y = window.innerHeight - 140;
  if (el && el.getBoundingClientRect) { const r = el.getBoundingClientRect(); if (r.width) { x = r.left + r.width / 2 - 30; y = r.top - 8; } }
  f.style.left = x + "px"; f.style.top = y + "px"; document.body.appendChild(f); setTimeout(() => f.remove(), 1200);
}
function touchNight() { const h = new Date().getHours(); if (h < 4) unlock("night"); }

/* ---------------- mastery ---------------- */
function rec(topic, c) {
  if (!topic) return; const a = S.topics[topic] || (S.topics[topic] = []);
  a.push([Math.round(c * 100) / 100, Date.now()]); if (a.length > 15) a.splice(0, a.length - 15);
  const d = day(); d.q++; d.qc += c;
  const mh = S.masteryHist[today()] || (S.masteryHist[today()] = {}); if (typeof mh === "number") S.masteryHist[today()] = {};
  COURSES.forEach(cc => S.masteryHist[today()][cc.id] = courseMastery(cc.id));
  touchNight(); checkAch(); save();
}
function mastery(topic) {
  const a = S.topics[topic]; if (!a || !a.length) return 0; let w = 0, s = 0; const n = a.length;
  a.forEach((r, i) => { const wi = Math.pow(0.85, n - 1 - i); w += wi; s += wi * r[0]; });
  return Math.round(100 * (s / w) * Math.min(1, n / 6));
}
const mLevel = m => m === 0 ? 0 : m < 40 ? 1 : m < 70 ? 2 : m < 90 ? 3 : 4;
const M_LABEL = ["Nicht begonnen", "Lernend", "Vertraut", "Stark", "Gemeistert"];
const mBadge = m => `<span class="mbadge m${mLevel(m)}">${M_LABEL[mLevel(m)]}</span>`;
function courseMastery(cid) { const ts = Object.keys(TOPICS).filter(t => TOPICS[t].course === cid); return ts.length ? Math.round(ts.reduce((s, t) => s + mastery(t), 0) / ts.length) : 0; }
Object.assign(App, { rec, mastery, mLevel, mBadge, courseMastery, M_LABEL });

/* ---------------- lessons & unlocking ---------------- */
const lstate = id => S.lessons[id] || (S.lessons[id] = { done: false, read: false, checks: {} });
const isDone = id => !!(S.lessons[id] && S.lessons[id].done);
const courseLessons = cid => LESSONS.filter(l => l.course === cid);
function unlocked(id) { if (S.settings.unlockAll) return true; const l = LBYID[id]; const ls = courseLessons(l.course); const i = ls.indexOf(l); return i <= 0 || isDone(ls[i - 1].id); }
const bossUnlocked = w => S.settings.unlockAll || w.lessons.every(l => isDone(l.id));
const bossPassed = w => !!(w.boss && S.bosses[w.boss.id] && S.bosses[w.boss.id].passed);
function worldProgress(w) { if (!w.lessons.length) return 0; const n = w.lessons.filter(l => isDone(l.id)).length + (bossPassed(w) ? 1 : 0); return Math.round(100 * n / (w.lessons.length + (w.boss ? 1 : 0))); }
function courseProgress(cid) { const c = CBY[cid]; const tot = courseLessons(cid).length + c.worlds.filter(w => w.boss).length; if (!tot) return 0; const n = courseLessons(cid).filter(l => isDone(l.id)).length + c.worlds.filter(bossPassed).length; return Math.round(100 * n / tot); }
function nextLesson(cid = S.course) { const ls = courseLessons(cid); return ls.find(l => !isDone(l.id) && unlocked(l.id)) || ls.find(l => !isDone(l.id)); }
Object.assign(App, { lstate, isDone, unlocked, bossUnlocked, bossPassed, worldProgress, courseProgress, nextLesson, courseLessons });
function completeLesson(l, el) {
  const st = lstate(l.id); if (st.done) return; st.done = true; st.doneAt = Date.now(); day().lessons++;
  addXP(l.xp, "lesson", el); toast("Lektion abgeschlossen", l.title + " · +" + l.xp + " XP", "✓"); unlock("first"); checkWorld(l.world); save();
}
function checkWorld(w) {
  if (S.widgets["world-" + w.id]) return;
  if (w.lessons.length && w.lessons.every(l => isDone(l.id)) && (!w.boss || bossPassed(w))) { S.widgets["world-" + w.id] = true; addXP(100, "world"); toast("Welt abgeschlossen", w.title + " · +100 XP", "◆", true); }
}
Object.assign(App, { completeLesson, checkWorld });

/* ---------------- streak ---------------- */
function streak() { let n = 0; const d = new Date(); if (!(S.days[today()] && S.days[today()].xp > 0)) d.setDate(d.getDate() - 1); while (S.days[dkey(d)] && S.days[dkey(d)].xp > 0) { n++; d.setDate(d.getDate() - 1); } return n; }
function longestStreak() { const keys = Object.keys(S.days).filter(k => S.days[k].xp > 0).sort(); let best = 0, cur = 0, prev = null; keys.forEach(k => { const d = new Date(k + "T12:00:00"); cur = prev && (d - prev) / 864e5 < 1.5 ? cur + 1 : 1; best = Math.max(best, cur); prev = d; }); return best; }
Object.assign(App, { streak, longestStreak });

/* ---------------- achievements ---------------- */
const ACH = (window.GLOBAL_ACH || []).concat([
  { id: "multi", name: "Allrounder", desc: "In jedem Kurs eine Lektion abschließen", icon: "✦" },
  { id: "planner", name: "Planer", desc: "Einen Lernplan für eine Prüfung erstellen", icon: "▦" },
  { id: "gitpro", name: "Merge-Meister", desc: "Einen Merge-Konflikt im Git-Labor lösen", icon: "⑂" },
  { id: "early", name: "Früher Vogel", desc: "Eine Abgabe mehr als 3 Tage vor der Deadline erledigen", icon: "◷" },
  { id: "gfk", name: "Giraffe", desc: "Die GFK-Welt abschließen", icon: "♡" },
  { id: "invest", name: "Kapitalwert-Profi", desc: "Alle Investitionsfälle korrekt lösen", icon: "€" }
]);
App.ACH = ACH;
function unlock(id) { if (S.ach[id]) return; S.ach[id] = Date.now(); const a = ACH.find(x => x.id === id); if (a) toast("Erfolg freigeschaltet", a.name, a.icon, true); save(); }
function checkAch() {
  if (mastery("unsup") >= 90) unlock("nolabels");
  if (mastery("gd") >= 90) unlock("gradient");
  const solved = Object.values(S.py).filter(p => p.solved).length; if (solved >= 1) unlock("pyrookie"); if (solved >= 25 || (S.widgets.pySolves || 0) >= 25) unlock("codewarrior");
  if (Object.values(S.days).reduce((s, d) => s + (d.cards || 0), 0) >= 50) unlock("cards50");
  if (streak() >= 7) unlock("streak7");
  if (S.widgets.airplane && isDone("w5-2") && S.bosses["boss-w5"] && S.bosses["boss-w5"].passed) unlock("biashunter");
  if (Object.values(S.bosses).some(b => b.passed)) unlock("boss");
  if (courseLessons("dasc").length && courseLessons("dasc").every(l => isDone(l.id))) unlock("datasci");
  if (COURSES.every(c => courseLessons(c.id).some(l => isDone(l.id)))) unlock("multi");
  if (CBY.kommu && ["k4-1", "k4-2", "k5-1", "k5-2", "k5-3", "k5-4", "k5-5"].every(isDone)) unlock("gfk");
}
Object.assign(App, { unlock, checkAch });
function toast(title, body, icon, ach) {
  const box = $("#toasts"); if (!box) return; const t = document.createElement("div"); t.className = "toast" + (ach ? " ach" : "");
  t.innerHTML = `<div class="ti">${esc(icon || "•")}</div><div><div class="eyebrow">${esc(title)}</div><div>${esc(body)}</div></div>`;
  box.appendChild(t); setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 320); }, 3800);
}
App.toast = toast;
App.modal = function (html, onMount) {
  const b = document.createElement("div"); b.className = "modal-back"; b.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  const close = () => b.remove(); b.addEventListener("click", e => { if (e.target === b || e.target.closest("[data-close]")) close(); });
  document.body.appendChild(b); onMount && onMount($(".modal", b), close); return close;
};

/* ---------------- bookmarks ---------------- */
const isBm = (kind, id) => S.bookmarks.some(b => b.kind === kind && b.id === id);
function toggleBm(kind, id, title, ref) { const i = S.bookmarks.findIndex(b => b.kind === kind && b.id === id); if (i >= 0) S.bookmarks.splice(i, 1); else S.bookmarks.unshift({ kind, id, title, ref: ref || null, ts: Date.now() }); save(); return i < 0; }
const bmBtn = (kind, id, title, ref) => `<button class="bm ${isBm(kind, id) ? "on" : ""}" data-bm="${esc(kind)}|${esc(id)}|${esc(title)}|${esc(ref || "")}">${isBm(kind, id) ? "★ Gemerkt" : "☆ Merken"}</button>`;
Object.assign(App, { isBm, toggleBm, bmBtn });
document.addEventListener("click", e => { const b = e.target.closest("[data-bm]"); if (!b) return; const [kind, id, title, ref] = b.dataset.bm.split("|"); const on = toggleBm(kind, id, title, ref); b.classList.toggle("on", on); b.textContent = on ? "★ Gemerkt" : "☆ Merken"; });

/* ---------------- study time ---------------- */
let lastAct = Date.now(), pendingSec = 0;
["pointerdown", "keydown", "scroll", "wheel", "touchstart"].forEach(ev => window.addEventListener(ev, () => { lastAct = Date.now(); }, { passive: true, capture: true }));
setInterval(() => { if (document.visibilityState === "visible" && Date.now() - lastAct < 120000 && !App.locked) { day().sec += 15; pendingSec += 15; if (pendingSec >= 60) { pendingSec = 0; save(); renderSide(); } } }, 15000);

/* ---------------- routing ---------------- */
let R = { v: "dash", p: null };
App.route = () => R;
function go(v, p) { R = { v, p: p ?? null }; if (v === "course" && p && CBY[p]) { S.course = p; save(); } try { history.replaceState(null, "", "#" + v); } catch (e) {} render(); renderSide(); window.scrollTo({ top: 0 }); $("#side") && $("#side").classList.remove("open"); }
App.go = go;
document.addEventListener("click", e => { const a = e.target.closest("[data-go]"); if (!a || a.disabled) return; e.preventDefault(); go(a.dataset.go, a.dataset.p || null); });

const NAV = [
  ["dash", "Heute", "⌂"], ["calendar", "Kalender", "▦"], ["plan", "Aufgaben & Lernplan", "☑"], ["courses", "Meine Kurse", "◫"], ["path", "Lernpfad", "⤳"],
  ["quiz", "Quiz Arena", "?"], ["flash", "Karteikarten", "▭"], ["practice", "Übungen", "λ"], ["gitlab", "Git-Labor", "⑂"],
  ["challenges", "Challenges", "♛"], ["exam", "Prüfungstrainer", "⏱"], ["stats", "Statistik", "▟"], ["resources", "Ressourcen", "⎘"], ["bookmarks", "Lesezeichen", "★"]
];
const navActive = v => ({ lesson: "path", boss: "path", course: "courses" }[R.v] || R.v) === v;
function renderSide() {
  const side = $("#side"); if (!side) return;
  const L = levelOf(S.xp), lo = xpFor(L), hi = xpFor(L + 1), pct = Math.round(100 * (S.xp - lo) / (hi - lo));
  const due = App.dueCount ? App.dueCount() : 0, st = streak(), c = CBY[S.course];
  const alerts = App.urgentCount ? App.urgentCount() : 0;
  side.innerHTML = `
    <div class="brand"><div class="logo">S</div><div><b>StudyOS</b><small class="muted">Wirtschaftsinformatik · FH JOANNEUM</small></div></div>
    <div class="course-switch"><span class="eyebrow">Aktueller Kurs</span><div class="row" style="gap:8px;flex-wrap:nowrap"><span class="dot" style="--c:${c.color}"></span><select id="cswitch" aria-label="Kurs wählen">${COURSES.map(x => `<option value="${x.id}" ${x.id === S.course ? "selected" : ""}>${esc(x.title)}</option>`).join("")}</select></div></div>
    <nav class="nav" aria-label="Hauptmenü">
      ${NAV.map(([v, t, i]) => `<button data-go="${v}" class="${navActive(v) ? "on" : ""}"><span class="ni">${i}</span>${t}${v === "flash" && due ? `<span class="badge">${due}</span>` : ""}${v === "plan" && alerts ? `<span class="badge" style="background:var(--bad-soft);color:var(--bad)">${alerts}</span>` : ""}</button>`).join("")}
      <div class="eyebrow lbl">Konto</div>
      <button data-go="settings" class="${R.v === "settings" ? "on" : ""}"><span class="ni">⚙</span>Einstellungen</button>
      <button data-go="profile" class="${R.v === "profile" ? "on" : ""}"><span class="ni">◉</span>Profil & Erfolge</button>
    </nav>
    <div class="me">
      <div class="me-top"><div class="avatar">${esc((S.name || "?")[0].toUpperCase())}</div><div><div class="me-name">${esc(S.name)}</div><div class="me-lvl tab">Level ${L} · ${S.xp.toLocaleString("de-AT")} XP</div></div></div>
      <div class="bar thin"><i style="width:${pct}%"></i></div>
      <div class="spread"><span class="streak"><i class="flame ${st ? "" : "off"}"></i>${st} ${st === 1 ? "Tag" : "Tage"}</span><small class="tab">${hi - S.xp} XP bis L${L + 1}</small></div>
    </div>`;
  $("#cswitch").onchange = e => { S.course = e.target.value; save(); if (["path", "quiz", "flash", "practice", "exam", "resources", "stats"].includes(R.v)) { R.p = null; render(); } else if (R.v === "course") go("course", S.course); renderSide(); };
  const tb = $("#tb-stats"); if (tb) tb.innerHTML = `<span class="streak"><i class="flame ${st ? "" : "off"}"></i>${st}</span><span class="chip acc tab">L${L} · ${S.xp} XP</span>`;
  const bn = $("#bnav"); if (bn) bn.innerHTML = [["dash", "Heute", "⌂"], ["calendar", "Kalender", "▦"], ["path", "Lernen", "⤳"], ["quiz", "Quiz", "?"], ["__more", "Mehr", "☰"]].map(([v, t, i]) => `<button ${v === "__more" ? 'id="bmore"' : `data-go="${v}"`} class="${navActive(v) ? "on" : ""}"><span class="ni">${i}</span>${t}</button>`).join("");
  const bm = $("#bmore"); if (bm) bm.onclick = () => $("#side").classList.add("open");
}
App.renderSide = renderSide;

const PAGES = {}; App.PAGES = PAGES;
function render() {
  const el = $("#page"); if (!el) return;
  if (App.cleanup) { try { App.cleanup(); } catch (e) {} App.cleanup = null; }
  const fn = PAGES[R.v] || PAGES.dash; el.onclick = null; el.innerHTML = "";
  try { fn(el, R.p); } catch (e) { console.error(e); el.innerHTML = `<div class="page"><div class="empty">Diese Seite konnte nicht geladen werden: ${esc(e.message)}<div style="margin-top:12px"><button class="btn" data-go="dash">Zur Startseite</button></div></div></div>`; }
  requestAnimationFrame(() => $$(".bar>i[data-w]", el).forEach(i => i.style.width = i.dataset.w + "%"));
}
App.render = render;
const bar = (pct, cls = "", color) => `<div class="bar ${cls}"><i data-w="${clamp(pct, 0, 100)}" ${color ? `style="background:${color}"` : ""}></i></div>`;
function ring(pct, size = 74, stroke = 7, color = "var(--acc)") { const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - clamp(pct, 0, 100) / 100); return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--card3)" stroke-width="${stroke}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 ${size / 2} ${size / 2})" style="transition:stroke-dashoffset .9s"/></svg>`; }
Object.assign(App, { bar, ring });

/* ---------------- recommendations ---------------- */
function weakTopics(n = 3, cid) { return Object.keys(TOPICS).filter(t => (!cid || TOPICS[t].course === cid) && (S.topics[t] || []).length >= 2).map(t => [t, mastery(t)]).filter(x => x[1] < 70).sort((a, b) => a[1] - b[1]).slice(0, n); }
function strongTopics(n = 3, cid) { return Object.keys(TOPICS).filter(t => !cid || TOPICS[t].course === cid).map(t => [t, mastery(t)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, n); }
Object.assign(App, { weakTopics, strongTopics });
function recommendations() {
  const out = []; const soon = App.nextExam ? App.nextExam() : null;
  const focus = soon && soon.course && daysUntil(soon.date) <= 21 ? soon.course : S.course;
  const nl = nextLesson(focus); const weak = weakTopics(3); const due = App.dueCount ? App.dueCount() : 0;
  const plan = App.todayPlanBlocks ? App.todayPlanBlocks().filter(b => !b.done) : [];
  plan.slice(0, 1).forEach(b => out.push({ kind: "plan", title: "Lernblock: " + (TOPICS[b.topic] ? TOPICS[b.topic].name : "Wiederholung"), why: "Aus deinem Lernplan für " + b.examTitle, min: b.min, xp: 30, go: "lesson", p: TOPICS[b.topic] ? TOPICS[b.topic].lesson : null }));
  if (weak.length && weak[0][1] < 50) out.push({ kind: "review", title: TOPICS[weak[0][0]].name + " wiederholen", why: "Mastery " + weak[0][1] + " %. Ein kurzes Themenquiz hilft.", min: 5, xp: 30, go: "quiz", p: "topic:" + weak[0][0] });
  if (nl) out.push({ kind: "lesson", title: nl.title, why: CBY[nl.course].title + " · " + nl.world.title, min: nl.min, xp: nl.xp + 5, go: "lesson", p: nl.id, lesson: nl });
  if (due) out.push({ kind: "cards", title: due + " Karteikarten fällig", why: "Spaced Repetition wirkt am besten pünktlich.", min: Math.max(3, Math.round(due / 3)), xp: due * 2, go: "flash" });
  weak.slice(1).forEach(w => out.push({ kind: "review", title: "Quiz: " + TOPICS[w[0]].name, why: "Mastery " + w[1] + " %", min: 5, xp: 30, go: "quiz", p: "topic:" + w[0] }));
  return out;
}
App.recommendations = recommendations;

/* ---------------- daily challenge ---------------- */
function dailyQuestion() { const pool = QUESTIONS.concat(BOSSQ).filter(q => !q.code); const n = Math.floor(new Date(today() + "T12:00:00").getTime() / 864e5); return pool[(n * 7919) % pool.length]; }
App.dailyQuestion = dailyQuestion;

/* ---------------- shared question rendering ---------------- */
const norm = q => q.tf ? Object.assign({}, q, { opts: CBY[q.course] && CBY[q.course].lang === "de" ? ["Richtig", "Falsch"] : ["True", "False"] }) : q;
App.norm = norm;
function questionHTML(q, name) {
  q = norm(q);
  return `<div class="col"><div class="check-q">${q.q}</div>${q.code ? `<div class="codeq">${esc(q.code)}</div>` : ""}
    <div class="opts" role="group">${q.opts.map((o, i) => `<button class="opt" data-${name}="${i}"><span class="k">${String.fromCharCode(65 + i)}</span><span>${o}</span></button>`).join("")}</div><div class="fb"></div></div>`;
}
function reveal(box, q, pick, opts = {}) {
  q = norm(q); const ok = pick === q.a;
  $$(".opt", box).forEach((b, i) => { b.disabled = true; if (i === pick) b.classList.add(ok ? "ok" : "no"); if (!ok && i === q.a && opts.showCorrect !== false) b.classList.add("reveal"); });
  const fb = $(".fb", box);
  if (fb) fb.innerHTML = `<div class="why ${ok ? "" : "bad"}"><b>${ok ? "Richtig." : "Nicht ganz."}</b><div><span class="eyebrow">Warum</span> ${q.why || ""}</div>${q.ex ? `<div><span class="eyebrow">Beispiel</span> ${q.ex}</div>` : ""}${!ok && opts.showCorrect !== false ? `<div class="muted">Richtig wäre <b>${String.fromCharCode(65 + q.a)}</b> · ${q.opts[q.a]}</div>` : ""}</div>`;
  return ok;
}
App.questionHTML = questionHTML; App.reveal = reveal;
const strip = h => String(h).replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ");
App.strip = strip;

/* ================= PAGES ================= */
function courseCard(c) {
  const p = courseProgress(c.id), m = courseMastery(c.id);
  return `<button class="card course-card" data-go="course" data-p="${c.id}" style="--c:${c.color}">
    <div class="spread"><div class="cicon" style="--c:${c.color}">${esc(c.icon)}</div><span class="chip ${c.id === S.course ? "acc" : ""}">${c.id === S.course ? "Aktiv" : esc(c.short)}</span></div>
    <div><h3>${esc(c.title)}</h3><small>${esc(c.short)}${c.ects ? " · " + String(c.ects).replace(".", ",") + " ECTS" : ""}</small></div>
    ${bar(p, "thin", c.color)}<div class="spread"><small class="tab">${p} % erledigt</small><small class="tab">Mastery ${m} %</small></div></button>`;
}
App.courseCard = courseCard;

PAGES.dash = el => {
  const d = day(), goalPct = Math.round(100 * Math.min(1, d.xp / S.dailyGoal)), acc = d.q ? Math.round(100 * d.qc / d.q) : null;
  const recs = recommendations(), top = recs[0], dq = dailyQuestion(), dqDone = S.daily[today()];
  const wk = [], base = new Date(), dow = (base.getDay() + 6) % 7, mon = new Date(base); mon.setDate(base.getDate() - dow);
  for (let i = 0; i < 7; i++) { const x = new Date(mon); x.setDate(mon.getDate() + i); const k = dkey(x); wk.push({ lbl: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"][i], done: S.days[k] && S.days[k].xp > 0, today: k === today() }); }
  const h = new Date().getHours(), greet = h < 5 ? "Noch wach" : h < 11 ? "Guten Morgen" : h < 18 ? "Hallo" : "Guten Abend";
  const ex = App.nextExam ? App.nextExam() : null;
  el.innerHTML = `<div class="page">
   <div class="hello"><div><h1>${greet}, ${esc(S.name)}</h1><p>Was willst du heute meistern?</p></div><span class="chip tab">${new Date().toLocaleDateString("de-AT", { weekday: "long", day: "numeric", month: "long" })}</span></div>
   <div id="todo-today"></div>
   ${top ? `<div class="card next"><div class="ring-wrap">${ring(top.kind === "lesson" ? worldProgress(top.lesson.world) : goalPct)}<span>${top.kind === "lesson" ? esc(CBY[top.lesson.course].icon) : "↻"}</span></div>
     <div class="col" style="gap:4px"><span class="eyebrow">Empfohlen als Nächstes</span><h2>${esc(top.title)}</h2><p class="muted">${esc(top.why)} · <span class="tab">${top.min} min · +${top.xp} XP</span></p></div>
     <button class="btn pri" data-go="${top.go}" data-p="${esc(top.p || "")}">Los geht's →</button></div>` : ""}
   <div class="grid g-dash"><div class="col" style="gap:16px">
     <div class="card col"><div class="spread"><h3>Heutiger Fortschritt</h3><small class="tab">${d.xp} / ${S.dailyGoal} XP</small></div>${bar(goalPct)}
       <div class="grid g4"><div class="stat"><b>${fmtMin(d.sec)}</b><span>Lernzeit</span></div><div class="stat"><b>${d.lessons}</b><span>Lektionen</span></div><div class="stat"><b>${d.q}</b><span>Antworten</span></div><div class="stat"><b>${acc === null ? "–" : acc + " %"}</b><span>Trefferquote</span></div></div></div>
     <div class="card col"><div class="spread"><h3>Empfohlene Session</h3><small>${recs.slice(0, 3).reduce((s, r) => s + r.min, 0)} min</small></div>
       ${recs.slice(0, 3).map((r, i) => `<div class="spread" style="padding:8px 0;${i ? "border-top:1px solid var(--line)" : ""}"><div class="row" style="gap:12px;flex-wrap:nowrap"><span class="chip tab">${i + 1}</span><div><div>${esc(r.title)}</div><small>${esc(r.why)}</small></div></div><button class="btn sm" data-go="${r.go}" data-p="${esc(r.p || "")}">${r.min} min</button></div>`).join("") || `<p class="muted">Alles erledigt.</p>`}</div>
   </div><div class="col" style="gap:16px">
     ${ex ? `<div class="card col" style="border-color:${CBY[ex.course] ? CBY[ex.course].color : "var(--line)"}"><span class="eyebrow">Nächste Prüfung</span><div class="spread"><div><h3>${esc(ex.title)}</h3><small>${fmtDate(ex.date, { weekday: "long", day: "numeric", month: "long" })}${ex.time ? " · " + ex.time : ""}</small></div><div class="countdown">${daysUntil(ex.date)}<small class="muted" style="font-size:13px"> Tage</small></div></div>${App.S().plans[ex.id] ? `<button class="btn sm" data-go="plan">Lernplan ansehen</button>` : `<button class="btn sm pri" data-go="plan" data-p="mk:${esc(ex.id)}">Lernplan erstellen</button>`}</div>` : `<div class="card col"><span class="eyebrow">Prüfungstermine</span><p class="muted">Trag deine Prüfungstermine ein, dann plant StudyOS rückwärts.</p><button class="btn sm" data-go="calendar">Termine eintragen</button></div>`}
     <div class="card col"><div class="spread"><h3>Tägliche Challenge</h3><span class="chip ${dqDone !== undefined ? "acc" : "warn"}">${dqDone !== undefined ? "Erledigt" : "+20 XP"}</span></div><small class="muted">${esc(CBY[dq.course].title)}</small><div id="dq"></div></div>
     <div class="card"><div class="spread"><h3>Lernserie</h3><span class="streak"><i class="flame ${streak() ? "" : "off"}"></i>${streak()} Tage</span></div><div class="week">${wk.map(w => `<div class="day ${w.done ? "done" : ""} ${w.today ? "today" : ""}"><i>${w.done ? "✓" : ""}</i>${w.lbl}</div>`).join("")}</div></div>
   </div></div>
   <div class="col"><div class="spread"><h2>Kurse</h2><button class="btn ghost sm" data-go="courses">Alle</button></div><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">${COURSES.map(courseCard).join("")}</div></div></div>`;
  if (App.renderTodayTodo) App.renderTodayTodo($("#todo-today", el));
  const box = $("#dq", el); box.innerHTML = questionHTML(dq, "dq"); if (dqDone !== undefined) reveal(box, dq, dqDone);
  box.onclick = e => { const b = e.target.closest("[data-dq]"); if (!b || S.daily[today()] !== undefined) return; const pick = +b.dataset.dq, ok = reveal(box, dq, pick); S.daily[today()] = pick; rec(dq.topic, ok ? 1 : 0); addXP(ok ? 20 : 5, "daily", b); save(); };
};

PAGES.courses = el => {
  el.innerHTML = `<div class="page"><div><h1>Meine Kurse</h1><p class="muted" style="margin-top:6px">Semester 3 · WS 2026/27. Neue Kurse kommen als eigene Datei in <code>courses/</code> dazu; Dashboard, Lernpfad, Quiz, Kalender und Statistik passen sich automatisch an.</p></div>
  <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(230px,1fr))">${COURSES.map(courseCard).join("")}</div>
  <div class="card col"><h3>Weiteren Kurs hinzufügen</h3><p class="muted">Schick die Unterlagen (Folien, Skript, Moodle-Texte) im Chat mit Claude. Du bekommst eine neue Kursdatei und ersetzt damit den Ordner auf GitHub. Dein Fortschritt bleibt erhalten, weil er im Browser bzw. im Sync gespeichert ist.</p></div></div>`;
};

PAGES.course = (el, cid) => {
  const c = CBY[cid] || CBY[S.course]; if (c.id !== S.course) { S.course = c.id; save(); renderSide(); }
  const ts = Object.keys(TOPICS).filter(t => TOPICS[t].course === c.id), mastered = ts.filter(t => mastery(t) >= 90).length;
  const qs = QUESTIONS.filter(q => q.course === c.id).length, cm = courseMastery(c.id);
  el.innerHTML = `<div class="page">
   <div class="crumbs"><button data-go="courses">Meine Kurse</button><span>/</span><span>${esc(c.title)}</span></div>
   <div class="course-head"><div class="col" style="gap:8px"><div class="row"><div class="cicon" style="--c:${c.color}">${esc(c.icon)}</div><span class="chip" style="color:${c.color}">${esc(c.short)}</span>${c.semester ? `<span class="chip">Semester ${c.semester}</span>` : ""}${c.ects ? `<span class="chip">${String(c.ects).replace(".", ",")} ECTS</span>` : ""}</div>
     <h1>${esc(c.name)}</h1><p class="muted">${esc(c.lecturers || "")}</p></div><button class="btn pri" data-go="path">Lernpfad öffnen →</button></div>
   ${c.aiRule ? `<div class="callout"><b>KI-Regel dieser LV:</b> ${esc(c.aiRule)}</div>` : ""}
   <div class="grid g4">
     <div class="card row" style="gap:14px"><div style="position:relative;width:60px;height:60px">${ring(cm, 60, 6, c.color)}</div><div class="stat"><b>${cm} %</b><span>Kurs-Mastery</span></div></div>
     <div class="card stat"><b>${mastered} / ${ts.length}</b><span>Themen gemeistert</span>${bar(100 * mastered / (ts.length || 1), "thin", c.color)}</div>
     <div class="card stat"><b>${courseLessons(c.id).filter(l => isDone(l.id)).length} / ${courseLessons(c.id).length}</b><span>Lektionen</span></div>
     <div class="card stat"><b>${qs}</b><span>Fragen · ${FLASH.filter(f => f.course === c.id).length} Karten</span></div>
   </div>
   <div class="col"><div class="spread"><h2>Welten</h2><small>${courseProgress(c.id)} % erledigt</small></div>
    <div class="worlds">${c.worlds.map(w => `<button class="card world ${w.lessons.length ? "" : "pending"}" data-go="path" data-p="${w.id}">
      <div class="spread"><span class="wn" style="color:${c.color}">WELT ${w.n}</span>${w.lessons.length ? `<small class="tab">${w.lessons.filter(l => isDone(l.id)).length}/${w.lessons.length}${w.boss ? " + Boss" : ""}</small>` : `<span class="chip">Material fehlt</span>`}</div>
      <h3>${esc(w.title)}</h3><small>${esc(w.sub)}</small>${bar(worldProgress(w), "thin", c.color)}</button>`).join("")}</div></div>
   <div class="grid g2"><div class="card col" id="assess"></div><div class="card col" id="cev"></div></div>
   <div class="card col"><h3>Wissenslandkarte</h3><p class="muted">Farbe = Mastery. Klick öffnet die Lektion.</p><div id="kmap"></div></div></div>`;
  renderAssessment($("#assess", el), c);
  if (App.renderCourseEvents) App.renderCourseEvents($("#cev", el), c.id);
  knowledgeMap($("#kmap", el), c.id);
};
function renderAssessment(box, c) {
  const def = c.assessment; if (!def) { box.innerHTML = `<h3>Beurteilung</h3><p class="muted">Keine Angaben.</p>`; return; }
  const A = S.assess[c.id] || (S.assess[c.id] = { parts: JSON.parse(JSON.stringify(def.parts)), scores: {} });
  const max = A.parts.reduce((s, p) => s + (+p.max || 0), 0), got = A.parts.reduce((s, p) => s + (+A.scores[p.id] || 0), 0), pct = max ? 100 * got / max : 0;
  const grade = def.scale.find(s => Math.round(pct * 100) / 100 >= s[0]);
  const ed = box.dataset.edit;
  box.innerHTML = `<div class="spread"><h3>Beurteilung & Notenrechner</h3><button class="btn ghost sm" id="as-edit">${ed ? "Fertig" : "Punkte bearbeiten"}</button></div>
   ${def.note ? `<p class="muted" style="font-size:13px">${esc(def.note)}</p>` : ""}
   <div class="col" style="gap:8px">${A.parts.map(p => `<div class="spread" style="gap:8px"><div style="flex:1;min-width:150px;font-size:14px">${ed ? `<input type="text" id="as-l-${p.id}" value="${esc(p.label)}">` : esc(p.label)}</div>
     <div class="row" style="gap:6px;flex-wrap:nowrap"><input type="number" min="0" step="0.5" id="as-s-${p.id}" value="${A.scores[p.id] ?? ""}" placeholder="–" style="width:74px" aria-label="Punkte ${esc(p.label)}"><span class="muted">/</span>${ed ? `<input type="number" min="0" id="as-m-${p.id}" value="${p.max}" style="width:64px">` : `<span class="tab" style="min-width:26px">${p.max}</span>`}</div></div>`).join("")}</div>
   <div class="divider"></div><div class="spread"><div class="stat"><b class="tab">${got} / ${max}</b><span>eingetragen (${Math.round(pct)} %)</span></div><div class="stat" style="text-align:right"><b>${got ? grade[1] : "–"}</b><span>Grenzen: ${def.scale.slice(0, -1).map(s => s[0]).join(" / ")} %</span></div></div>`;
  $("#as-edit", box).onclick = () => { if (box.dataset.edit) delete box.dataset.edit; else box.dataset.edit = "1"; renderAssessment(box, c); };
  box.oninput = e => { const id = e.target.id; if (!id || !id.startsWith("as-")) return; const [, k, pid] = id.split("-"); const p = A.parts.find(x => x.id === pid); if (!p) return; if (k === "s") A.scores[pid] = e.target.value === "" ? undefined : clamp(+e.target.value, 0, +p.max); if (k === "m") p.max = Math.max(0, +e.target.value || 0); if (k === "l") p.label = e.target.value; save(); };
  box.onchange = () => { if (!box.dataset.edit) renderAssessment(box, c); };
}
function knowledgeMap(box, cid) {
  const c = CBY[cid]; const col = m => ["var(--faint)", "#E0A43A", "#C9C23B", "#A6D23A", "var(--acc)"][mLevel(m)];
  const groups = c.worlds.filter(w => w.lessons.length).map(w => ({ n: w.title, ts: [...new Set(w.lessons.map(l => l.topic))] }));
  box.innerHTML = `<div class="col" style="gap:12px">${groups.map(g => `<div class="row" style="gap:8px;align-items:flex-start"><span class="eyebrow" style="min-width:170px;padding-top:7px">${esc(g.n)}</span><div class="row" style="gap:6px;flex:1">${g.ts.map(t => { const m = mastery(t); return `<button class="chip" data-go="lesson" data-p="${TOPICS[t].lesson}" style="border:1px solid ${col(m)};color:var(--text)"><span class="dot" style="--c:${col(m)}"></span>${esc(TOPICS[t].name)} <span class="tab faint">${m}%</span></button>`; }).join("")}</div></div>`).join("")}</div>
  <div class="row" style="gap:14px;font-size:12px;margin-top:10px">${M_LABEL.map((l, i) => `<span class="mbadge m${i}">${l}</span>`).join("")}</div>`;
}
App.knowledgeMap = knowledgeMap;

PAGES.path = (el, focus) => {
  const c = CBY[S.course];
  el.innerHTML = `<div class="page">
   <div class="spread"><div><span class="eyebrow" style="color:${c.color}">${esc(c.short)}</span><h1>Lernpfad · ${esc(c.title)}</h1><p class="muted" style="margin-top:6px">Lektionen schalten sich nacheinander frei. ${S.settings.unlockAll ? "Alles ist freigeschaltet." : "Für die Wiederholung kannst du alles freischalten."}</p></div>
   <label class="row" style="gap:10px"><span class="muted">Alles freischalten</span><input type="checkbox" class="tgl" id="unlockAll" ${S.settings.unlockAll ? "checked" : ""}></label></div>
   <div class="row" style="gap:6px">${COURSES.map(x => `<button class="chip ${x.id === c.id ? "on" : ""}" data-sw="${x.id}"><span class="dot" style="--c:${x.color}"></span>${esc(x.title)}</button>`).join("")}</div>
   <div class="journey">${c.worlds.map(w => {
     const steps = w.lessons.map((l, i) => { const done = isDone(l.id), un = unlocked(l.id), cur = !done && un && nextLesson(c.id) === l;
       return `<div class="jstep ${done ? "done" : ""} ${cur ? "cur" : ""} ${un ? "" : "lock"}"><div class="jdot">${done ? "✓" : un ? w.n + "." + (i + 1) : "🔒"}</div><button class="jcard" ${un ? `data-go="lesson" data-p="${l.id}"` : "disabled"}><div><div>${esc(l.title)}</div><small class="tab">${l.min} min · +${l.xp} XP · ${esc(TOPICS[l.topic].name)}</small></div><div class="row" style="gap:8px">${mBadge(mastery(l.topic))}${cur ? `<span class="chip acc">Weiter</span>` : ""}</div></button></div>`; }).join("");
     const b = w.boss, bs = b && (S.bosses[b.id] || {}), bun = b && bossUnlocked(w);
     const boss = b ? `<div class="jstep boss ${bs.passed ? "done" : ""} ${bun ? "" : "lock"}"><div class="jdot"><span>${bs.passed ? "✓" : "♛"}</span></div><button class="jcard" ${bun ? `data-go="boss" data-p="${w.id}"` : "disabled"}><div><div>Boss · ${esc(b.title)}</div><small>Kombinierte Fragen · 70 % zum Bestehen${bs.best != null ? " · Bestwert " + bs.best + " %" : ""}</small></div><span class="chip ${bs.passed ? "acc" : "warn"}">${bs.passed ? "Besiegt" : bun ? "+100 XP" : "Erst Welt abschließen"}</span></button></div>` : "";
     const pend = !w.lessons.length ? `<div class="jstep lock"><div class="jdot">…</div><div class="jcard" style="cursor:default"><div><div>Material fehlt noch</div><small>${esc((w.pending || []).join(" · "))}</small></div></div></div>` : "";
     return `<div class="jworld" id="j-${w.id}"><div class="jhead"><span class="wn" style="color:${c.color}">WELT ${w.n}</span><h3>${esc(w.title)}</h3><small>${esc(w.sub)}</small></div>${steps}${boss}${pend}</div>`; }).join("")}</div></div>`;
  $("#unlockAll", el).onchange = e => { S.settings.unlockAll = e.target.checked; save(); render(); };
  el.onclick = e => { const s = e.target.closest("[data-sw]"); if (s) { S.course = s.dataset.sw; save(); renderSide(); render(); } };
  if (focus) { const t = $("#j-" + focus, el); if (t) setTimeout(() => t.scrollIntoView({ block: "start", behavior: "smooth" }), 60); }
};

PAGES.lesson = (el, id) => {
  const l = LBYID[id] || nextLesson(); if (!l) return go("path");
  if (l.course !== S.course) { S.course = l.course; renderSide(); }
  const st = lstate(l.id), w = l.world, c = CBY[l.course];
  if (!unlocked(l.id) && !st.done) { el.innerHTML = `<div class="page"><div class="empty">Diese Lektion ist noch gesperrt. Schließe zuerst die vorherige ab oder schalte in den Einstellungen alles frei.<div class="row" style="justify-content:center;margin-top:14px"><button class="btn" data-go="path">Lernpfad</button><button class="btn" data-go="settings">Einstellungen</button></div></div></div>`; return; }
  if (!st.read) { st.read = true; addXP(5, "read"); }
  const lvl = S.settings.level || "normal", ls = courseLessons(l.course), idx = ls.indexOf(l), prev = ls[idx - 1], next = ls[idx + 1];
  const checks = l.blocks.map((b, i) => b.t === "check" ? i : -1).filter(i => i >= 0), answered = checks.filter(i => st.checks[i] !== undefined).length;
  const de = c.lang === "de";
  el.innerHTML = `<div class="page">
   <div class="crumbs"><button data-go="course" data-p="${c.id}">${esc(c.title)}</button><span>/</span><button data-go="path" data-p="${w.id}">Welt ${w.n} · ${esc(w.title)}</button></div>
   <div class="spread"><div><h1>${esc(l.title)}</h1><div class="row" style="margin-top:8px"><span class="chip tab">${l.min} min</span><span class="chip acc tab">+${l.xp} XP</span>${mBadge(mastery(l.topic))}<span class="chip tab">${mastery(l.topic)} % ${esc(TOPICS[l.topic].name)}</span></div></div>
    <div class="row"><span class="eyebrow">Erklärung</span><div class="lvl" role="group">${[["simple", de ? "Einfach" : "Simple"], ["normal", "Normal"], ["technical", de ? "Fachlich" : "Technical"]].map(([k, t]) => `<button data-lvl="${k}" class="${lvl === k ? "on" : ""}">${t}</button>`).join("")}</div></div></div>
   <div class="lesson"><div class="lesson-main" id="blocks"></div>
    <aside class="lesson-aside">
     <div class="card col"><div class="spread"><h3>Fortschritt</h3><small class="tab" id="chk-n">${answered}/${checks.length} Checks</small></div>${bar(checks.length ? 100 * answered / checks.length : 100)}
       <button class="btn pri" id="complete" ${st.done ? "disabled" : ""}>${st.done ? "✓ Abgeschlossen" : "Lektion abschließen"}</button>
       <small class="muted" id="complete-hint">${st.done ? "Mastery wächst weiter über Quiz und Karteikarten." : checks.length ? "Beantworte die Checks. Mastery wächst nur durch Antworten, nicht durch Lesen." : ""}</small>
       <div class="row">${bmBtn("lesson", l.id, l.title, l.id)}</div>
       <div class="spread">${prev ? `<button class="btn ghost sm" data-go="lesson" data-p="${prev.id}">← Zurück</button>` : "<span></span>"}${next ? `<button class="btn ghost sm" data-go="lesson" data-p="${next.id}" ${unlocked(next.id) ? "" : "disabled"}>Weiter →</button>` : ""}</div></div>
     <div class="card col notes" id="notes"></div><div class="card col" id="assist"></div>
    </aside></div></div>`;
  const blocks = $("#blocks", el); l.blocks.forEach((b, i) => blocks.appendChild(renderBlock(b, i, l, st, lvl)));
  $(".page", el).addEventListener("click", e => { const lb = e.target.closest("[data-lvl]"); if (lb) { S.settings.level = lb.dataset.lvl; save(); render(); } });
  $("#complete", el).onclick = e => { const missing = checks.filter(i => st.checks[i] === undefined); if (missing.length) { $("#complete-hint", el).innerHTML = `<span style="color:var(--warn)">Noch ${missing.length} Check${missing.length > 1 ? "s" : ""} offen.</span>`; const t = $("#blk-" + missing[0], el); if (t) t.scrollIntoView({ behavior: "smooth", block: "center" }); return; } completeLesson(l, e.currentTarget); render(); };
  renderNotes($("#notes", el), l); App.renderAssistant && App.renderAssistant($("#assist", el), l); App.mountWidgets(blocks, l);
};
function renderBlock(b, i, l, st, lvl) {
  const div = document.createElement("div"); div.id = "blk-" + i; const de = CBY[l.course].lang === "de";
  if (b.t === "lead") { div.className = "card"; div.innerHTML = `<p style="font-size:16px;max-width:70ch">${b.html}</p>`; }
  else if (b.t === "html") { div.innerHTML = b.html; }
  else if (b.t === "callout") { div.className = "callout"; div.innerHTML = b.html; }
  else if (b.t === "keys") { div.className = "card col"; div.innerHTML = `<span class="eyebrow">${de ? "Kernpunkte" : "Key points"}</span><ul class="keys">${b.items.map(x => `<li><span>${x}</span></li>`).join("")}</ul>`; }
  else if (b.t === "text") {
    div.className = "card col block-text"; let altI = -1;
    const draw = () => { const alts = b.alt || [];
      div.innerHTML = `<div class="spread"><h3>${esc(b.h)}</h3><button class="btn ghost sm" data-alt>${de ? "Anders erklären" : "Explain differently"}</button></div><div class="body">${b.levels[lvl] || b.levels.normal}</div>
        ${altI >= 0 && altI < alts.length ? `<div class="alt-box"><span class="eyebrow">${esc(alts[altI].label)}</span><div style="margin-top:6px">${alts[altI].html}</div></div>` : ""}
        ${altI >= alts.length ? `<div class="alt-box"><span class="eyebrow">${de ? "Andere Perspektive" : "Another angle"}</span><div style="margin-top:6px" class="ai-out">${App.aiReady && App.aiReady(l.course) ? (de ? "Klicke hier, um eine KI-Erklärung anzufordern." : "Click to request an AI explanation.") : (de ? "Wechsle oben die Erklärstufe (Einfach / Normal / Fachlich)." : "Switch the explanation level above (Simple / Normal / Technical).")}</div></div>` : ""}`;
      $("[data-alt]", div).onclick = () => { altI++; if (altI > alts.length) altI = 0; draw(); };
      const out = $(".ai-out", div); if (out && App.aiReady && App.aiReady(l.course)) { out.style.cursor = "pointer"; out.onclick = () => App.aiExplain(out, l, b); } };
    draw();
  }
  else if (b.t === "check") {
    div.className = "card col"; const q = { q: b.q, opts: b.opts, a: b.a, why: b.why, topic: l.topic, course: l.course };
    div.innerHTML = `<div class="spread"><span class="eyebrow" style="color:var(--acc)">Check</span><small>${st.checks[i] !== undefined ? (st.checks[i] ? "Richtig beantwortet" : "Beantwortet") : "+3 XP"}</small></div>` + questionHTML(q, "chk");
    if (st.checks[i] !== undefined && st.checks[i + "p"] !== undefined) reveal(div, q, st.checks[i + "p"]);
    div.addEventListener("click", e => { const btn = e.target.closest("[data-chk]"); if (!btn || st.checks[i] !== undefined) return; const pick = +btn.dataset.chk, ok = reveal(div, q, pick); st.checks[i] = ok ? 1 : 0; st.checks[i + "p"] = pick; rec(l.topic, ok ? 1 : 0); if (ok) addXP(3, "check", btn); save();
      const ch = l.blocks.map((x, j) => x.t === "check" ? j : -1).filter(j => j >= 0), a = ch.filter(j => st.checks[j] !== undefined).length; const pb = $(".lesson-aside .bar>i"); if (pb) pb.style.width = (100 * a / ch.length) + "%"; const sm = $("#chk-n"); if (sm) sm.textContent = a + "/" + ch.length + " Checks"; });
  }
  else if (b.t === "widget") { div.className = "card"; div.dataset.widget = b.w; div._block = b; }
  return div;
}
function renderNotes(box, l) {
  const n = S.notes[l.id] || { text: "", tags: [] }; const TAGS = [["important", "Wichtig"], ["exam", "⭐ Prüfungsrelevant"], ["question", "Frage"], ["remember", "Merken"]];
  box.innerHTML = `<div class="spread"><h3>Meine Notizen</h3><small class="muted" id="note-state">${n.text ? "Gespeichert" : "Markdown"}</small></div><textarea id="note-${l.id}" placeholder="In Markdown schreiben …">${esc(n.text)}</textarea><div class="note-tags">${TAGS.map(([k, t]) => `<button class="chip ${n.tags.includes(k) ? "on" : ""}" data-tag="${k}">${t}</button>`).join("")}</div>`;
  let tm; $("textarea", box).oninput = e => { const x = S.notes[l.id] || (S.notes[l.id] = { text: "", tags: [] }); x.text = e.target.value; x.ts = Date.now(); $("#note-state", box).textContent = "Speichert …"; clearTimeout(tm); tm = setTimeout(() => { save(); $("#note-state", box).textContent = "Gespeichert"; }, 700); };
  box.onclick = e => { const t = e.target.closest("[data-tag]"); if (!t) return; const x = S.notes[l.id] || (S.notes[l.id] = { text: "", tags: [] }); const k = t.dataset.tag; x.tags = x.tags.includes(k) ? x.tags.filter(y => y !== k) : x.tags.concat(k); save(); t.classList.toggle("on"); };
}

PAGES.boss = (el, wid) => {
  let w = null; COURSES.forEach(c => c.worlds.forEach(x => { if (x.id === wid) w = x; })); if (!w || !w.boss) return go("path");
  if (!bossUnlocked(w)) { el.innerHTML = `<div class="page"><div class="empty">Schließe erst alle Lektionen von Welt ${w.n} ab.<div style="margin-top:12px"><button class="btn" data-go="path" data-p="${w.id}">Zurück</button></div></div></div>`; return; }
  const pool = QUESTIONS.concat(BOSSQ).filter(q => w.boss.topics.includes(q.topic)), extra = shuffle(BOSSQ.filter(q => w.boss.topics.includes(q.topic))).slice(0, 4);
  const qs = extra.concat(shuffle(pool.filter(q => !extra.includes(q)))).slice(0, 10);
  el.innerHTML = `<div class="page"><div class="crumbs"><button data-go="path" data-p="${w.id}">Welt ${w.n}</button><span>/</span><span>Boss</span></div><div><span class="eyebrow" style="color:var(--warn)">Boss-Challenge</span><h1>${esc(w.boss.title)}</h1><p class="muted" style="margin-top:6px">${qs.length} Fragen, die Konzepte kombinieren. 70 % zum Bestehen.</p></div><div id="bq"></div></div>`;
  App.runQuiz($("#bq", el), { questions: shuffle(qs), mode: "boss", title: w.boss.title, onFinish: (res, box) => {
    const pct = Math.round(100 * res.c / res.n), b = S.bosses[w.boss.id] || (S.bosses[w.boss.id] = { best: 0, passed: false, tries: 0 });
    b.tries++; b.best = Math.max(b.best || 0, pct); const passed = pct >= 70, first = passed && !b.passed; if (passed) b.passed = true; save();
    if (first) { addXP(100, "boss"); unlock("boss"); checkWorld(w); checkAch(); }
    const missed = [...new Set(res.wrong.map(q => q.topic))];
    box.innerHTML = `<div class="card col" style="align-items:flex-start;gap:14px"><span class="eyebrow">${passed ? "Boss besiegt" : "Noch nicht"}</span><div class="result-big" style="color:${passed ? "var(--acc)" : "var(--warn)"}">${pct} %</div><p>${res.c} von ${res.n} richtig. ${passed ? (first ? "+100 XP." : "") : "Du brauchst 70 %. Wiederhole diese Themen:"}</p>
      ${missed.length ? `<div class="col" style="gap:8px;width:100%">${missed.map(t => `<div class="spread"><div>${esc(TOPICS[t].name)} ${mBadge(mastery(t))}</div><div class="row"><button class="btn sm" data-go="lesson" data-p="${TOPICS[t].lesson}">Lektion</button><button class="btn sm" data-go="quiz" data-p="topic:${t}">Themenquiz</button></div></div>`).join("")}</div>` : ""}
      <div class="row"><button class="btn pri" data-go="boss" data-p="${w.id}">Nochmal</button><button class="btn" data-go="path" data-p="${w.id}">Zum Lernpfad</button></div></div>`;
  } });
};

/* ---------------- boot ---------------- */
App.boot = function () {
  document.body.insertAdjacentHTML("afterbegin", `<div class="app"><aside class="side" id="side"></aside><div style="min-width:0">
    <header class="topbar"><button class="btn sm" id="burger" aria-label="Menü öffnen">☰</button><b style="font-family:var(--f-display)">StudyOS</b><div class="row" id="tb-stats" style="gap:8px"></div></header>
    <main class="main"><div id="page"></div><p class="faint" style="text-align:center;font-size:12px;margin-top:40px" id="sync"></p></main></div></div>
    <nav class="bottom-nav" id="bnav" aria-label="Schnellnavigation"></nav><div class="toasts" id="toasts" aria-live="polite"></div>`);
  $("#burger").onclick = () => $("#side").classList.toggle("open");
  document.addEventListener("click", e => { const s = $("#side"); if (s.classList.contains("open") && !e.target.closest("#side") && !e.target.closest("#burger") && !e.target.closest("#bmore")) s.classList.remove("open"); });
  const h = (location.hash || "").slice(1); if (h && PAGES[h]) R.v = h;
  renderSide(); render();
  App.afterBoot && App.afterBoot.forEach(f => { try { f(); } catch (e) { console.error(e); } });
};
App.afterBoot = [];
})();
