/* StudyOS · Lernprofil (uni): ruhiges Lernsystem ohne XP.
   Fortschritt = was du gelesen/verstanden hast + was du in der Wiederholung (Spaced Repetition) wirklich weißt. */
(function () {
if ((window.STUDYOS_TRACK || "uni") !== "uni") return;
App.CALM = true; document.documentElement.dataset.calm = "1";
const { $, $$, esc, PAGES, CBY, COURSES, TOPICS, LESSONS, LBYID, QUESTIONS, BOSSQ, FLASH, shuffle, today, dkey, fmtMin, fmtDate, daysUntil } = App;
const S = () => App.S();
const addDays = (k, n) => { const d = new Date(k + "T12:00:00"); d.setDate(d.getDate() + n); return dkey(d); };
const ects = c => c.ects ? String(c.ects).replace(".", ",") + " ECTS" : "";
const badge = c => `<span class="ccode" style="--c:${c.color}">${esc(c.short)}</span>`;
const pbar = (pct, color) => `<div class="pbar"><i style="width:${Math.max(0, Math.min(100, pct))}%;${color ? "background:" + color : ""}"></i></div>`;
const plural = (n, one, many) => n + " " + (n === 1 ? one : many);

/* ================= Wiederholung (Spaced Repetition, Leitner) =================
   Box 0–6, Abstand in Tagen [0,1,2,4,8,16,32]. Neu + richtig → Box 2, richtig → +1 Box, falsch → Box 1 (morgen wieder).
   Wissen eines Themas = Durchschnitt über alle Fragen+Karten des Themas (nicht gesehen = 0). */
const IV = [0, 1, 2, 4, 8, 16, 32], WEIGHT = [0, .2, .45, .65, .8, .9, 1];
const ITEMS = [], IBY = {}, ITOPIC = {}, ICOURSE = {};
const addItem = it => { ITEMS.push(it); IBY[it.key] = it; (ITOPIC[it.topic] = ITOPIC[it.topic] || []).push(it); (ICOURSE[it.course] = ICOURSE[it.course] || []).push(it); };
QUESTIONS.concat(BOSSQ).forEach(q => TOPICS[q.topic] && addItem({ key: "q:" + q.id, kind: "q", topic: q.topic, course: q.course, ref: q }));
FLASH.forEach(f => f.topic && TOPICS[f.topic] && addItem({ key: "f:" + f.id, kind: "f", topic: f.topic, course: f.course, ref: f }));
const srs = () => S().srs || (S().srs = {});
const touched = id => { const s = S().lessons[id]; return !!(s && (s.read || s.done)); };
function openTopics() { const o = new Set(); LESSONS.forEach(l => { if (touched(l.id)) o.add(l.topic); }); return o; }
const isDue = (it, t = today()) => { const r = srs()[it.key]; return !!(r && r.due <= t); };
const isNew = it => !srs()[it.key];
function grade(key, ok) {
  const st = srs(), r = st[key] || { b: 0, n: 0, ok: 0 }, t = today();
  if (r.n && r.due > t) { r.n++; if (ok) r.ok++; else { r.b = 1; r.due = addDays(t, 1); } r.last = t; st[key] = r; return; } // freies Üben vor Fälligkeit: nur Fehler zählen
  r.b = ok ? Math.min(6, r.n ? r.b + 1 : 2) : 1; r.n++; if (ok) r.ok++; r.last = t; r.due = addDays(t, IV[r.b]); st[key] = r;
}
const itemW = it => { const r = srs()[it.key]; return r ? WEIGHT[r.b] || 0 : 0; };
const avgW = its => its && its.length ? Math.round(100 * its.reduce((s, i) => s + itemW(i), 0) / its.length) : 0;
const knowTopic = t => avgW(ITOPIC[t]);
const knowCourse = cid => avgW(ICOURSE[cid]);
function counts(cid) { const its = cid ? ICOURSE[cid] || [] : ITEMS, op = openTopics(), t = today(); let due = 0, fresh = 0; its.forEach(i => { if (isDue(i, t)) due++; else if (isNew(i) && op.has(i.topic)) fresh++; }); return { due, fresh }; }
App.knowTopic = knowTopic; App.knowCourse = knowCourse; App.reviewCounts = counts;
App.dueCount = () => counts().due;
const understood = cid => App.courseLessons(cid).filter(l => App.isDone(l.id)).length;

/* Lerntage: aktiv = ≥ 5 min Lernzeit, eine Wiederholung oder eine Lektion */
const activeDay = d => !!(d && ((d.sec || 0) >= 300 || (d.rev || 0) > 0 || (d.lessons || 0) > 0 || (d.q || 0) > 0));
App.streak = () => { let n = 0; const d = new Date(); if (!activeDay(S().days[today()])) d.setDate(d.getDate() - 1); while (activeDay(S().days[dkey(d)])) { n++; d.setDate(d.getDate() - 1); } return n; };

/* ================= Navigation ================= */
const NAVG = [
  ["Lernen", [["dash", "Heute", "◐"], ["courses", "Kurse", "▤"], ["review", "Wiederholen", "↻"], ["prep", "Prüfung üben", "✎"]]],
  ["Planen", [["calendar", "Kalender", "▦"], ["plan", "Aufgaben & Lernplan", "☑"]]],
  ["Werkzeuge", [["practice", "Übungen", "λ"], ["gitlab", "Git-Labor", "⑂"], ["resources", "Material", "⎘"], ["bookmarks", "Merkliste", "★"]]]
];
App.NAV = NAVG.flatMap(g => g[1]);
const BN = [["dash", "Heute", "◐"], ["courses", "Kurse", "▤"], ["review", "Wiederholen", "↻"], ["calendar", "Kalender", "▦"], ["__more", "Mehr", "☰"]];
const ACTIVE = { exam: "prep", lesson: "courses", course: "courses", boss: "courses", path: "courses", quiz: "review", flash: "review", challenges: "review" };
App.SIDE = () => {
  const side = $("#side"); if (!side) return;
  const R = App.route(), cur = ACTIVE[R.v] || R.v, due = counts().due, alerts = App.urgentCount ? App.urgentCount() : 0, st = App.streak();
  side.innerHTML = `
    <div class="brand"><div class="logo">S</div><div><b>StudyOS</b><small class="muted">Wirtschaftsinformatik · FH JOANNEUM</small></div></div>
    <nav class="nav" aria-label="Hauptmenü">${NAVG.map(([g, items]) => `<div class="eyebrow lbl">${g}</div>` + items.map(([v, t, i]) => `<button data-go="${v}" class="${cur === v ? "on" : ""}"><span class="ni">${i}</span>${t}${v === "review" && due ? `<span class="badge">${due}</span>` : ""}${v === "plan" && alerts ? `<span class="badge warn">${alerts}</span>` : ""}</button>`).join("")).join("")}
      <div class="eyebrow lbl">Konto</div><button data-go="settings" class="${cur === "settings" ? "on" : ""}"><span class="ni">⚙</span>Einstellungen</button></nav>
    <div class="me"><div class="me-top"><div class="avatar">${esc((S().name || "?")[0].toUpperCase())}</div><div><div class="me-name">${esc(S().name)}</div><small>${st ? plural(st, "Lerntag", "Lerntage") + " in Folge" : "Heute noch nicht gelernt"}</small></div></div>
      ${window.StudyProfiles ? `<button class="me-switch" id="pswitch" title="Profil wechseln">⇄ Profil wechseln</button>` : ""}</div>`;
  const psw = $("#pswitch"); if (psw) psw.onclick = () => StudyProfiles.switchTo();
  const tb = $("#tb-stats"); if (tb) tb.innerHTML = due ? `<button class="chip acc" data-go="review">↻ ${due} fällig</button>` : "";
  const bn = $("#bnav"); if (bn) { bn.innerHTML = BN.map(([v, t, i]) => `<button ${v === "__more" ? 'id="bmore"' : `data-go="${v}"`} class="${cur === v ? "on" : ""}"><span class="ni">${i}${v === "review" && due ? `<i class="bdot"></i>` : ""}</span>${t}</button>`).join(""); const bm = $("#bmore"); if (bm) bm.onclick = () => $("#side").classList.add("open"); }
};

/* ================= Heute ================= */
function nextDated(cid) { const t = today(); return App.eventsBetween ? App.eventsBetween(t, addDays(t, 150), false).find(e => e.course === cid && ["exam", "deadline"].includes(e.type) && !e.done) || null : null; }
const evLabel = e => { const n = daysUntil(e.date); return (e.type === "exam" ? "Prüfung" : "Abgabe") + " " + (n === 0 ? "heute" : n === 1 ? "morgen" : "in " + n + " Tagen"); };
PAGES.dash = el => {
  const t = today(), h = new Date().getHours(), greet = h < 5 ? "Noch wach" : h < 11 ? "Guten Morgen" : h < 18 ? "Hallo" : "Guten Abend";
  const cn = counts(), sess = cn.due + Math.min(10, cn.fresh), st = App.streak();
  const wk = [], base = new Date(), mon = new Date(base); mon.setDate(base.getDate() - (base.getDay() + 6) % 7);
  for (let i = 0; i < 7; i++) { const x = new Date(mon); x.setDate(mon.getDate() + i); const k = dkey(x), d = S().days[k] || {}; wk.push({ lbl: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"][i], min: Math.round((d.sec || 0) / 60), rev: d.rev || 0, on: activeDay(d), today: k === t, future: k > t }); }
  const wkMin = wk.reduce((s, d) => s + d.min, 0), maxMin = Math.max(30, ...wk.map(d => d.min));
  const conts = COURSES.map(c => { const ls = App.courseLessons(c.id); return { c, nl: ls.find(l => !App.isDone(l.id) && !touched(l.id)) || ls.find(l => !App.isDone(l.id)), ev: nextDated(c.id) }; })
    .filter(x => x.nl).sort((a, b) => (a.ev ? a.ev.date : "9999").localeCompare(b.ev ? b.ev.date : "9999")).slice(0, 4);
  el.innerHTML = `<div class="page today">
   <header class="today-head"><div><span class="eyebrow">${new Date().toLocaleDateString("de-AT", { weekday: "long", day: "numeric", month: "long" })}</span><h1>${greet}, ${esc(S().name)}</h1></div>
     <p class="muted">${st ? `${plural(st, "Lerntag", "Lerntage")} in Folge. ` : ""}${wkMin ? `Diese Woche ${fmtMin(wkMin * 60)} gelernt.` : "Diese Woche noch nichts gelernt – fang klein an."}</p></header>
   <div class="today-grid">
    <section class="card rv-card ${sess ? "" : "calm"}">
      <span class="eyebrow">Wiederholen</span>
      ${sess ? `<div class="rv-num"><b>${cn.due}</b><span>${cn.due === 1 ? "Frage fällig" : "Fragen & Karten fällig"}${cn.fresh ? ` <br>+ ${cn.fresh} neue aus gelesenen Lektionen` : ""}</span></div>
        <p class="muted">Etwa ${Math.max(2, Math.round(sess * 0.4))} Minuten. Was du sicher weißt, kommt erst in einigen Tagen wieder.</p>
        <div class="row"><button class="btn pri" data-go="review" data-p="start">Jetzt wiederholen</button></div>`
      : `<div class="rv-num"><b>✓</b><span>${ITEMS.some(i => !isNew(i)) ? "Für heute alles wiederholt." : "Noch nichts zu wiederholen."}</span></div>
        <p class="muted">${ITEMS.some(i => !isNew(i)) ? "Morgen kommen die nächsten Fragen. Du kannst jederzeit frei üben." : "Lies eine Lektion. Ihre Fragen und Karteikarten landen danach automatisch hier."}</p>
        <div class="row"><button class="btn" data-go="review">Frei üben</button></div>`}
    </section>
    <section class="card wk-card"><div class="spread"><span class="eyebrow">Diese Woche</span><small class="tab">${fmtMin(wkMin * 60)}</small></div>
      <div class="wk">${wk.map(d => `<div class="wk-d ${d.today ? "today" : ""} ${d.future ? "future" : ""}" title="${d.min} min · ${d.rev} Wiederholungen"><div class="wk-col"><i style="height:${d.min ? Math.max(8, Math.round(100 * d.min / maxMin)) : d.on ? 8 : 0}%"></i></div><small>${d.lbl}</small></div>`).join("")}</div></section>
   </div>
   ${(() => { const ups = COURSES.filter(c => c.examPrep).map(c => ({ c, ex: nextExamOf(c.id), r: readiness(c.id) })).filter(x => x.ex && daysUntil(x.ex.date) <= 60).sort((a, b) => a.ex.date.localeCompare(b.ex.date)).slice(0, 3);
     return ups.length ? `<section class="col"><div class="spread"><h2>Nächste Prüfungen</h2><button class="btn ghost sm" data-go="prep">Prüfung üben</button></div><div class="card list">${ups.map(x => `<button class="lrow" data-go="prep" data-p="${x.c.id}">${badge(x.c)}<div class="lrow-main"><div class="lrow-t">${esc(x.ex.title)}</div><small>${fmtDate(x.ex.date, { weekday: "short", day: "numeric", month: "short" })} · ${daysUntil(x.ex.date) === 0 ? "heute" : "in " + daysUntil(x.ex.date) + " Tagen"}</small></div><span class="kn">${x.r.pct} % bereit</span><span class="go">Üben →</span></button>`).join("")}</div></section>` : ""; })()}
   ${conts.length ? `<section class="col"><div class="spread"><h2>Weiter lernen</h2><button class="btn ghost sm" data-go="courses">Alle Kurse</button></div>
     <div class="card list">${conts.map(x => `<button class="lrow" data-go="lesson" data-p="${x.nl.id}">${badge(x.c)}<div class="lrow-main"><div class="lrow-t">${esc(x.nl.title)}</div><small>${esc(x.c.title)} · Kapitel ${x.nl.world.n} · ${x.nl.min} min</small></div>${x.ev ? `<span class="chip ${daysUntil(x.ev.date) <= 7 ? "warn" : ""}">${evLabel(x.ev)}</span>` : ""}<span class="go">${touched(x.nl.id) ? "Fortsetzen" : "Lesen"} →</span></button>`).join("")}</div></section>` : ""}
   <div id="todo-today"></div>
   <section class="col"><div class="spread"><h2>Semester</h2><small class="muted">${COURSES.reduce((s, c) => s + (+c.ects || 0), 0).toString().replace(".", ",")} ECTS</small></div>
     <div class="card list ctable">${COURSES.map(c => { const n = App.courseLessons(c.id).length, u = understood(c.id), k = knowCourse(c.id), ev = nextDated(c.id);
       return `<button class="crow" data-go="course" data-p="${c.id}">${badge(c)}<div class="crow-t"><div>${esc(c.title)}</div><small>${[ects(c), ev ? evLabel(ev) : ""].filter(Boolean).join(" · ")}</small></div>
         <div class="crow-m"><small>Verstanden ${u}/${n}</small>${pbar(n ? 100 * u / n : 0, c.color)}</div><div class="crow-m"><small>Wissen ${k} %</small>${pbar(k, "var(--know)")}</div></button>`; }).join("")}</div></section>
  </div>`;
  if (App.renderTodayTodo) App.renderTodayTodo($("#todo-today", el));
};

/* ================= Kurse ================= */
PAGES.courses = el => {
  el.innerHTML = `<div class="page"><header><span class="eyebrow">Semester 3 · WS 2026/27</span><h1>Kurse</h1><p class="muted" style="margin-top:6px">„Verstanden“ markierst du selbst nach dem Lesen. „Wissen“ zeigt, was du in der Wiederholung tatsächlich richtig beantwortest.</p></header>
   <div class="cgrid">${COURSES.map(c => { const n = App.courseLessons(c.id).length, u = understood(c.id), k = knowCourse(c.id), ev = nextDated(c.id), cn = counts(c.id);
     return `<button class="card ccard" data-go="course" data-p="${c.id}" style="--c:${c.color}"><div class="spread">${badge(c)}<small class="tab">${ects(c)}</small></div>
       <div><h3>${esc(c.title)}</h3><small>${esc(c.lecturers || "")}</small></div>
       <div class="col" style="gap:6px"><div class="spread"><small>Verstanden</small><small class="tab">${u}/${n}</small></div>${pbar(n ? 100 * u / n : 0, c.color)}
       <div class="spread"><small>Wissen</small><small class="tab">${k} %</small></div>${pbar(k, "var(--know)")}</div>
       <div class="row" style="gap:6px">${cn.due ? `<span class="chip acc">${cn.due} fällig</span>` : ""}${ev ? `<span class="chip ${daysUntil(ev.date) <= 7 ? "warn" : ""}">${evLabel(ev)}</span>` : ""}</div></button>`; }).join("")}</div>
   <div class="card col"><h3>Kurs hinzufügen</h3><p class="muted">Schick die Unterlagen (Folien, Skript, Moodle-Texte) im Chat mit Claude – daraus wird eine neue Kursdatei. Dein Fortschritt bleibt erhalten.</p></div></div>`;
};

/* ================= Kursseite ================= */
const lDot = id => App.isDone(id) ? `<i class="ldot done" title="Verstanden">✓</i>` : touched(id) ? `<i class="ldot read" title="Gelesen"></i>` : `<i class="ldot" title="Noch nicht gelesen"></i>`;
PAGES.course = (el, cid) => {
  const c = CBY[cid] || CBY[S().course]; if (S().course !== c.id) { S().course = c.id; App.save(); }
  const ls = App.courseLessons(c.id), n = ls.length, u = understood(c.id), k = knowCourse(c.id), cn = counts(c.id);
  const nl = ls.find(l => !App.isDone(l.id) && !touched(l.id)) || ls.find(l => !App.isDone(l.id));
  el.innerHTML = `<div class="page">
   <div class="crumbs"><button data-go="courses">Kurse</button><span>/</span><span>${esc(c.title)}</span></div>
   <header class="chead" style="--c:${c.color}"><div class="row">${badge(c)}${c.ects ? `<span class="chip">${ects(c)}</span>` : ""}${c.semester ? `<span class="chip">Semester ${c.semester}</span>` : ""}</div>
     <h1>${esc(c.name)}</h1>${c.lecturers ? `<p class="muted">${esc(c.lecturers)}</p>` : ""}${c.description ? `<p style="max-width:70ch">${esc(c.description)}</p>` : ""}</header>
   ${c.aiRule ? `<div class="airule"><span class="eyebrow">KI-Regel dieser LV</span><p>${esc(c.aiRule)}</p></div>` : ""}
   <div class="kpis">
     <div class="kpi"><b class="tab">${u}/${n}</b><span>Lektionen verstanden</span>${pbar(n ? 100 * u / n : 0, c.color)}</div>
     <div class="kpi"><b class="tab">${k} %</b><span>Wissen (aus Wiederholung)</span>${pbar(k, "var(--know)")}</div>
     <div class="kpi"><b class="tab">${cn.due}</b><span>heute fällig${cn.fresh ? ` · ${cn.fresh} neu` : ""}</span></div>
     <div class="kpi"><b class="tab">${(ICOURSE[c.id] || []).length}</b><span>Fragen & Karten</span></div>
   </div>
   <div class="row">${nl ? `<button class="btn pri" data-go="lesson" data-p="${nl.id}">${touched(nl.id) ? "Weiterlesen" : "Lesen"}: ${esc(nl.title)} →</button>` : `<span class="chip acc">Alle Lektionen verstanden</span>`}
     <button class="btn" data-go="review" data-p="c:${c.id}">Kurs wiederholen</button><button class="btn ghost" data-go="prep" data-p="${c.id}">Prüfung üben</button><button class="btn ghost" data-go="resources">Material</button></div>
   ${c.examPrep ? `<button class="card prep-cta" data-go="prep" data-p="${c.id}"><div><span class="eyebrow">Prüfungsfokus</span><div class="lrow-t">Was in der Prüfung drankommt, Altfragen, Rechenaufgaben & Checkliste</div><small>${(ICOURSE[c.id] || []).filter(i => i.ref.alt).length} Prüfungsfragen · ${(c.examPrep.tasks || []).length} Aufgaben · ${(c.examPrep.checklist || []).length} Punkte auf der Checkliste</small></div><div class="prep-pct"><b>${readiness(c.id).pct} %</b><small>Prüfungsreife</small></div></button>` : ""}
   <section class="col"><h2>Kapitel</h2>
    ${c.worlds.map(w => { const wu = w.lessons.filter(l => App.isDone(l.id)).length, b = w.boss && (S().bosses[w.boss.id] || {});
      return `<div class="card chap" id="ch-${w.id}"><div class="spread chap-h"><div><span class="eyebrow" style="color:${c.color}">Kapitel ${w.n}</span><h3>${esc(w.title)}</h3>${w.sub ? `<small>${esc(w.sub)}</small>` : ""}</div><small class="tab">${wu}/${w.lessons.length} verstanden</small></div>
        <div class="list">${w.lessons.map(l => `<button class="lrow" data-go="lesson" data-p="${l.id}">${lDot(l.id)}<div class="lrow-main"><div class="lrow-t">${esc(l.title)}</div><small>${esc(TOPICS[l.topic] ? TOPICS[l.topic].name : "")} · ${l.min} min</small></div><span class="kn" title="Wissen in diesem Thema">${knowTopic(l.topic)} %</span></button>`).join("")}
        ${!w.lessons.length ? `<p class="muted" style="padding:8px 0">Material folgt.</p>` : ""}</div>
        ${w.boss ? `<button class="lrow test" data-go="boss" data-p="${w.id}"><i class="ldot ${b.passed ? "done" : ""}">${b.passed ? "✓" : "?"}</i><div class="lrow-main"><div class="lrow-t">Kapiteltest</div><small>10 Fragen quer durchs Kapitel${b.best != null ? " · bestes Ergebnis " + b.best + " %" : ""}</small></div><span class="go">Starten →</span></button>` : ""}</div>`; }).join("")}
   </section>
   <div class="grid g2"><div class="card col" id="assess"></div><div class="card col" id="cev"></div></div>
   <div class="card spread"><div><b>Nochmal von vorne?</b><div><small class="muted">Lektionen, Wissensstand oder Karteikarten dieses Kurses zurücksetzen.</small></div></div><button class="btn sm" id="rs-open">↺ Zurücksetzen</button></div></div>`;
  if (App.renderAssessment) App.renderAssessment($("#assess", el), c);
  if (App.renderCourseEvents) App.renderCourseEvents($("#cev", el), c.id);
  $("#rs-open", el).onclick = () => App.resetDialog(c.id);
};
PAGES.path = (el, p) => { PAGES.course(el, S().course); if (p) { const x = $("#ch-" + p, el); if (x) setTimeout(() => x.scrollIntoView({ block: "start" }), 60); } };

/* ================= Lektion ================= */
PAGES.lesson = (el, id) => {
  const l = LBYID[id]; if (!l) return App.go("courses");
  if (S().course !== l.course) S().course = l.course;
  const st = App.lstate(l.id); if (!st.read) { st.read = true; st.readAt = Date.now(); App.save(); }
  const c = CBY[l.course], w = l.world, ls = App.courseLessons(l.course), idx = ls.indexOf(l), prev = ls[idx - 1], next = ls[idx + 1];
  const lvl = S().settings.level || "normal", de = c.lang === "de", T = TOPICS[l.topic] || { name: "" }, its = ITOPIC[l.topic] || [];
  const nq = its.filter(i => i.kind === "q").length, nf = its.length - nq;
  el.innerHTML = `<div class="page">
   <div class="crumbs"><button data-go="courses">Kurse</button><span>/</span><button data-go="course" data-p="${c.id}">${esc(c.title)}</button><span>/</span><button data-go="path" data-p="${w.id}">Kapitel ${w.n}</button></div>
   <header class="lhead"><div class="col" style="gap:8px"><div class="row">${badge(c)}<small class="muted">Kapitel ${w.n} · ${esc(w.title)} · ${l.min} min</small></div><h1>${esc(l.title)}</h1>
     <div class="row"><span class="chip">Thema: ${esc(T.name)}</span><span class="chip">Wissen ${knowTopic(l.topic)} %</span>${st.done ? `<span class="chip acc">✓ Verstanden</span>` : ""}</div></div>
     <div class="lvl" role="group" aria-label="Erklärstufe">${[["simple", de ? "Einfach" : "Simple"], ["normal", "Normal"], ["technical", de ? "Fachlich" : "Technical"]].map(([k, t]) => `<button data-lvl="${k}" class="${lvl === k ? "on" : ""}">${t}</button>`).join("")}</div></header>
   <div class="lesson"><div class="lesson-main"><div id="blocks" class="col" style="gap:16px"></div>
     <div class="card lend"><div><b>${st.done ? "Schon verstanden." : "Fertig gelesen?"}</b><div><small class="muted">${nq} Fragen und ${nf} Karteikarten zu „${esc(T.name)}“ sind ab jetzt in deiner Wiederholung.</small></div></div>
       <div class="row">${st.done ? "" : `<button class="btn pri" data-mark>Als verstanden markieren</button>`}${next ? `<button class="btn ${st.done ? "pri" : ""}" data-go="lesson" data-p="${next.id}">Nächste Lektion →</button>` : `<button class="btn" data-go="course" data-p="${c.id}">Zum Kurs</button>`}</div></div></div>
    <aside class="lesson-aside">
     <div class="card col"><span class="eyebrow">Status</span>
       <div class="lstate">${lDot(l.id)}<span>${st.done ? "Verstanden" : "Gelesen"}</span></div>
       ${st.done ? `<button class="btn ghost sm" data-unmark>Markierung aufheben</button>` : `<button class="btn pri" data-mark>Als verstanden markieren</button>`}
       <small class="muted">Die Selbsttests in der Lektion sind freiwillig. Ob du es kannst, zeigt dir die Wiederholung.</small>
       <div class="row">${App.bmBtn("lesson", l.id, l.title, l.id)}<button class="btn ghost sm" id="lreset" title="Selbsttests und Übungen dieser Lektion zurücksetzen">↺ Neu starten</button></div>
       <div class="spread">${prev ? `<button class="btn ghost sm" data-go="lesson" data-p="${prev.id}">← Zurück</button>` : "<span></span>"}${next ? `<button class="btn ghost sm" data-go="lesson" data-p="${next.id}">Weiter →</button>` : ""}</div></div>
     <div class="card col notes" id="notes"></div><div class="card col" id="assist"></div>
    </aside></div></div>`;
  const blocks = $("#blocks", el); l.blocks.forEach((b, i) => blocks.appendChild(App.renderBlock(b, i, l, st, lvl)));
  el.querySelector(".page").addEventListener("click", e => {
    const lb = e.target.closest("[data-lvl]"); if (lb) { S().settings.level = lb.dataset.lvl; App.save(); App.render(); return; }
    if (e.target.closest("[data-mark]")) { App.completeLesson(l, e.target); App.render(); App.renderSide(); return; }
    if (e.target.closest("[data-unmark]")) { st.done = false; App.save(); App.render(); App.renderSide(); return; }
    if (e.target.closest("#lreset")) { App.resetLesson(l.id); App.go("lesson", l.id); App.toast("Lektion neu gestartet", "Selbsttests und Übungen sind wieder offen.", "↺"); }
  });
  App.renderNotes($("#notes", el), l); if (App.renderAssistant) App.renderAssistant($("#assist", el), l); App.mountWidgets(blocks, l);
};

/* ================= Kapiteltest ================= */
PAGES.boss = (el, wid) => {
  let w = null; COURSES.forEach(c => c.worlds.forEach(x => { if (x.id === wid) w = x; })); if (!w || !w.boss) return App.go("courses");
  const c = CBY[w.course], pool = QUESTIONS.concat(BOSSQ).filter(q => w.boss.topics.includes(q.topic)), extra = shuffle(BOSSQ.filter(q => w.boss.topics.includes(q.topic))).slice(0, 4);
  const qs = shuffle(extra.concat(shuffle(pool.filter(q => !extra.includes(q)))).slice(0, 10));
  el.innerHTML = `<div class="page"><div class="crumbs"><button data-go="course" data-p="${c.id}">${esc(c.title)}</button><span>/</span><button data-go="path" data-p="${w.id}">Kapitel ${w.n}</button><span>/</span><span>Kapiteltest</span></div>
    <header><span class="eyebrow">Kapiteltest · Kapitel ${w.n}</span><h1>${esc(w.title)}</h1><p class="muted" style="margin-top:6px">${qs.length} Fragen quer durch das Kapitel. Ab 70 % gilt der Test als bestanden. Deine Antworten fließen auch in die Wiederholung ein.</p></header><div id="bq"></div></div>`;
  App.runQuiz($("#bq", el), { questions: qs, mode: "boss", title: "Kapiteltest", onFinish: (r, box) => {
    let n = 0; qs.forEach((q, k) => { if (r.res[k] !== undefined) { grade("q:" + q.id, !!r.res[k]); n++; } }); App.day().rev = (App.day().rev || 0) + n;
    const pct = Math.round(100 * r.c / Math.max(1, r.n)), b = S().bosses[w.boss.id] || (S().bosses[w.boss.id] = { best: 0, passed: false, tries: 0 });
    b.tries++; b.best = Math.max(b.best || 0, pct); const passed = pct >= 70; if (passed) b.passed = true; App.save(); App.checkWorld(w); App.renderSide();
    const missed = [...new Set(r.wrong.map(q => q.topic))];
    box.innerHTML = `<div class="card col result"><span class="eyebrow">${passed ? "Bestanden" : "Noch nicht ganz"}</span><div class="result-big" style="color:${passed ? "var(--good)" : "var(--warn)"}">${pct} %</div><p>${r.c} von ${r.n} richtig.${passed ? "" : " 70 % brauchst du zum Bestehen."}</p>
      ${missed.length ? `<div class="col" style="gap:8px;width:100%"><span class="eyebrow">Diese Themen nochmal ansehen</span>${missed.map(t => `<div class="spread"><div>${esc(TOPICS[t].name)} <small class="muted">· Wissen ${knowTopic(t)} %</small></div><div class="row"><button class="btn sm" data-go="lesson" data-p="${TOPICS[t].lesson}">Lektion</button><button class="btn sm" data-go="review" data-p="topic:${t}">Üben</button></div></div>`).join("")}</div>` : ""}
      <div class="row"><button class="btn pri" data-go="boss" data-p="${w.id}">Nochmal</button><button class="btn" data-go="path" data-p="${w.id}">Zum Kapitel</button></div></div>`;
  } });
};

/* ================= Wiederholen ================= */
function buildQueue(scope, size) {
  let its = ITEMS.filter(i => (!scope.cid || i.course === scope.cid) && (!scope.topic || i.topic === scope.topic) && (!scope.alt || i.ref.alt));
  const t = today(), byDue = (a, b) => srs()[a.key].due.localeCompare(srs()[b.key].due);
  const due = shuffle(its.filter(i => isDue(i, t))).sort(byDue);
  if (scope.topic || scope.free) { // freies Üben: fällig → neu → schwächste zuerst
    const fresh = shuffle(its.filter(isNew)), rest = shuffle(its.filter(i => !isNew(i) && !isDue(i, t))).sort((a, b) => srs()[a.key].b - srs()[b.key].b);
    return due.concat(fresh, rest).slice(0, size);
  }
  const op = openTopics(), fresh = shuffle(its.filter(i => isNew(i) && op.has(i.topic)));
  const cap = size === Infinity ? 20 : 10;
  return shuffle(due.slice(0, size).concat(fresh.slice(0, Math.max(0, Math.min(cap, size - due.length)))));
}
PAGES.quiz = (el, p) => App.go("review", p && String(p).startsWith("topic:") ? p : null);
PAGES.flash = () => App.go("review");
PAGES.challenges = () => App.go("review");
PAGES.stats = () => App.go("dash");
PAGES.profile = () => App.go("settings");

PAGES.review = (el, p) => {
  const ui = S().settings.review || (S().settings.review = { cid: null, size: 20 });
  if (ui.cid && !CBY[ui.cid]) ui.cid = null;
  p = p || "";
  if (p.startsWith("c:")) { ui.cid = p.slice(2); App.save(); }
  if (p.startsWith("topic:") && TOPICS[p.slice(6)]) return startSession(el, { topic: p.slice(6), cid: TOPICS[p.slice(6)].course, free: true }, 15);
  if (p.startsWith("alt:") && CBY[p.slice(4)]) return startSession(el, { cid: p.slice(4), alt: true, free: true }, 25);
  if (p === "start") return startSession(el, { cid: ui.cid }, ui.size === 0 ? Infinity : ui.size);
  const cn = counts(ui.cid), all = counts();
  const ts = ui.cid ? Object.keys(TOPICS).filter(t => TOPICS[t].course === ui.cid) : [];
  const op = openTopics();
  el.innerHTML = `<div class="page">
   <header><h1>Wiederholen</h1><p class="muted" style="margin-top:6px;max-width:68ch">Fragen und Karteikarten nach dem Abstands-Prinzip: Was du weißt, kommt nach 2, 4, 8 … Tagen wieder, was du nicht wusstest, schon morgen. Neue Fragen kommen dazu, sobald du die passende Lektion gelesen hast.</p></header>
   <div class="row fchips"><button class="chip ${!ui.cid ? "on" : ""}" data-cid="">Alle Kurse${all.due ? ` <b>${all.due}</b>` : ""}</button>${COURSES.map(c => { const x = counts(c.id); return `<button class="chip ${ui.cid === c.id ? "on" : ""}" data-cid="${c.id}"><span class="dot" style="--c:${c.color}"></span>${esc(c.short)}${x.due ? ` <b>${x.due}</b>` : ""}</button>`; }).join("")}</div>
   <div class="card rv-start">
     <div class="rv-num"><b>${cn.due}</b><span>fällig${cn.fresh ? ` · ${cn.fresh} neue verfügbar` : ""}</span></div>
     ${cn.due || cn.fresh ? `<div class="row"><span class="muted">Sitzung:</span><div class="lvl">${[[10, "10"], [20, "20"], [0, "Alle"]].map(([v, t]) => `<button data-size="${v}" class="${ui.size === v ? "on" : ""}">${t}</button>`).join("")}</div><button class="btn pri" data-go="review" data-p="start">Starten</button></div>`
       : `<p class="muted">${op.size ? "Gerade nichts fällig. Unten kannst du einzelne Themen frei üben." : "Noch keine Lektion gelesen – öffne eine Lektion, dann geht's hier los."}</p>`}
   </div>
   ${ui.cid ? `<section class="col"><div class="spread"><h2>Themen · ${esc(CBY[ui.cid].title)}</h2><button class="btn sm" id="free-all">Ganzen Kurs frei üben</button></div>
     <div class="card list">${ts.map(t => { const k = knowTopic(t), its = ITOPIC[t] || [], seen = its.filter(i => !isNew(i)).length;
       return `<div class="trow"><div class="lrow-main"><div class="lrow-t">${esc(TOPICS[t].name)}</div><small>${op.has(t) ? `${seen}/${its.length} gesehen` : "Lektion noch nicht gelesen"}</small></div><div class="trow-k">${pbar(k, "var(--know)")}<small class="tab">${k} %</small></div><button class="btn sm ghost" data-go="review" data-p="topic:${t}">Üben</button></div>`; }).join("")}</div></section>`
     : `<p class="muted">Wähle oben einen Kurs, um einzelne Themen gezielt zu üben.</p>`}
  </div>`;
  el.onclick = e => {
    const c = e.target.closest("[data-cid]"); if (c) { ui.cid = c.dataset.cid || null; App.save(); App.render(); return; }
    const s = e.target.closest("[data-size]"); if (s) { ui.size = +s.dataset.size; App.save(); App.render(); return; }
    if (e.target.closest("#free-all")) startSession(el, { cid: ui.cid, free: true }, 20);
  };
};

function startSession(el, scope, size) {
  const queue = buildQueue(scope, size);
  const title = scope.alt ? "Prüfungsfragen · " + CBY[scope.cid].title : scope.topic ? TOPICS[scope.topic].name : scope.free ? "Freies Üben · " + CBY[scope.cid].title : scope.cid ? CBY[scope.cid].title : "Alle Kurse";
  el.onclick = null;
  el.innerHTML = `<div class="page rv-page"><div class="spread"><div><span class="eyebrow">Wiederholen</span><h2>${esc(title)}</h2></div><button class="btn ghost sm" id="rv-end">Beenden</button></div><div id="rv"></div></div>`;
  const box = $("#rv", el);
  if (!queue.length) { box.innerHTML = `<div class="empty">Hier gibt es gerade nichts zu wiederholen.<div style="margin-top:12px"><button class="btn" data-go="review">Zurück</button></div></div>`; $("#rv-end", el).onclick = () => App.go("review"); return; }
  let i = 0, phase = "ask"; const seen = new Set(), first = {}, uniq = queue.length;
  const answer = ok => {
    const it = queue[i];
    if (!seen.has(it.key)) {
      seen.add(it.key); first[it.key] = ok; grade(it.key, ok); App.rec(it.topic, ok ? 1 : 0);
      const d = App.day(); d.rev = (d.rev || 0) + 1; if (it.kind === "f") d.cards = (d.cards || 0) + 1; App.addXP(1, "rev");
      if (!ok) queue.push(it); // am Ende der Sitzung nochmal
    }
    App.save();
  };
  const next = () => { i++; phase = "ask"; draw(); };
  const draw = () => {
    if (i >= queue.length) return finish();
    const it = queue[i], c = CBY[it.course], again = seen.has(it.key) && phase === "ask";
    const head = `<div class="rv-head"><div class="pbar"><i style="width:${Math.round(100 * i / queue.length)}%"></i></div><div class="spread"><div class="row" style="gap:8px">${badge(c)}<small>${esc(TOPICS[it.topic].name)}</small>${again ? `<span class="chip warn">Nochmal</span>` : ""}</div><small class="tab">${i + 1} / ${queue.length}</small></div></div>`;
    if (it.kind === "q") {
      box.innerHTML = `<div class="card col rv-card-q">${head}<div id="rq">${App.questionHTML(it.ref, "rv")}</div><div class="row" id="rv-next" hidden><button class="btn pri">Weiter →</button><small class="muted">Enter</small></div></div>`;
      const rq = $("#rq", box);
      rq.onclick = e => { const b = e.target.closest("[data-rv]"); if (!b || b.disabled || phase !== "ask") return; phase = "shown"; const ok = App.reveal(rq, it.ref, +b.dataset.rv); answer(ok); const nx = $("#rv-next", box); nx.hidden = false; $("button", nx).onclick = next; $("button", nx).focus(); };
    } else {
      const f = it.ref;
      box.innerHTML = `<div class="card col rv-card-f">${head}<div class="rvf-face"><span class="eyebrow">Frage</span><div class="rvf-front">${f.front}</div></div>
        ${phase === "ask" ? `<div class="row"><button class="btn pri" id="rvf-show">Antwort zeigen</button><small class="muted">Leertaste</small></div>`
        : `<div class="rvf-face back"><span class="eyebrow">Antwort</span><div>${f.back}</div></div><div class="row rvf-grade"><button class="btn no" data-g="0">✗ Nicht gewusst <small>1</small></button><button class="btn yes" data-g="1">✓ Wusste ich <small>2</small></button></div>`}</div>`;
      const sh = $("#rvf-show", box); if (sh) sh.onclick = () => { phase = "shown"; draw(); };
      $$("[data-g]", box).forEach(b => b.onclick = () => { answer(b.dataset.g === "1"); next(); });
    }
    App.renderSide();
  };
  const finish = () => {
    window.removeEventListener("keydown", key);
    const keys = Object.keys(first), ok = keys.filter(k => first[k]).length, tm = addDays(today(), 1);
    const tomorrow = ITEMS.filter(x => { const r = srs()[x.key]; return r && r.due === tm; }).length, more = counts(scope.cid).due;
    const missed = [...new Set(keys.filter(k => !first[k]).map(k => IBY[k].topic))];
    box.innerHTML = `<div class="card col result"><span class="eyebrow">Sitzung beendet</span><div class="result-big">${ok}<small> / ${keys.length}</small></div><p>${keys.length ? `${Math.round(100 * ok / keys.length)} % auf Anhieb gewusst.` : "Keine Antworten."} ${tomorrow ? `Morgen ${tomorrow === 1 ? "kommt 1 Frage" : "kommen " + tomorrow + " Fragen"} wieder.` : ""}</p>
      ${missed.length ? `<div class="col" style="gap:8px;width:100%"><span class="eyebrow">Unsicher bei</span>${missed.map(t => `<div class="spread"><div>${esc(TOPICS[t].name)} <small class="muted">· Wissen ${knowTopic(t)} %</small></div><button class="btn sm" data-go="lesson" data-p="${TOPICS[t].lesson}">Lektion ansehen</button></div>`).join("")}</div>` : ""}
      <div class="row">${more && !scope.free ? `<button class="btn pri" data-go="review" data-p="start">Weiter wiederholen (${more})</button>` : ""}<button class="btn ${more && !scope.free ? "" : "pri"}" data-go="review">Zur Übersicht</button><button class="btn ghost" data-go="dash">Heute</button></div></div>`;
    const e = $("#rv-end", el); if (e) e.remove(); App.renderSide();
  };
  const key = e => {
    if (!document.body.contains(box) || e.target.closest("input,textarea,select")) return;
    const it = queue[i]; if (!it) return;
    if (it.kind === "q") { if (phase === "ask" && /^[1-6]$/.test(e.key)) { const b = $$("#rq .opt", box)[+e.key - 1]; if (b) b.click(); } else if (phase === "shown" && e.key === "Enter") { e.preventDefault(); next(); } }
    else { if (phase === "ask" && (e.key === " " || e.key === "Enter")) { e.preventDefault(); phase = "shown"; draw(); } else if (phase === "shown" && (e.key === "1" || e.key === "2")) { answer(e.key === "2"); next(); } }
  };
  window.addEventListener("keydown", key);
  App.cleanup = (old => () => { window.removeEventListener("keydown", key); old && old(); })(App.cleanup);
  $("#rv-end", el).onclick = () => { queue.length = Math.min(queue.length, i); i = queue.length; finish(); };
  draw();
}


/* ================= Prüfung üben: Prüfungsfokus aus Altprüfungen ================= */
const prepState = () => S().prep || (S().prep = { check: {}, tasks: {} });
function readiness(cid) {
  const P = CBY[cid] && CBY[cid].examPrep; if (!P) return { pct: 0, know: 0, check: 0 };
  const st = prepState(), cl = P.checklist || [], done = cl.filter(x => st.check[x.id]).length;
  let w = 0, k = 0; (P.focus || []).forEach(f => { w += f.weight; k += f.weight * knowTopic(f.topic); });
  const know = w ? Math.round(k / w) : knowCourse(cid), check = cl.length ? Math.round(100 * done / cl.length) : 0;
  const tk = P.tasks || [], tdone = tk.filter(t => st.tasks[t.id] === 1).length, tasks = tk.length ? Math.round(100 * tdone / tk.length) : know;
  return { pct: Math.round(.5 * know + .3 * check + .2 * tasks), know, check, tasks, done, total: cl.length, tdone };
}
App.readiness = readiness;
const nextExamOf = cid => { const t = today(); return App.eventsBetween ? App.eventsBetween(t, addDays(t, 300), false).find(e => e.course === cid && e.type === "exam" && !e.done) || null : null; };
PAGES.prep = (el, p) => {
  const withPrep = COURSES.filter(c => c.examPrep);
  let c = CBY[p] || CBY[S().prepCourse] || CBY[S().course];
  if (!c || !c.examPrep) c = withPrep[0]; if (!c) { el.innerHTML = `<div class="page"><div class="empty">Noch keine Prüfungsvorbereitung vorhanden.</div></div>`; return; }
  S().prepCourse = c.id;
  const P = c.examPrep, st = prepState(), r = readiness(c.id), ex = nextExamOf(c.id), altN = (ICOURSE[c.id] || []).filter(i => i.ref.alt).length;
  const dots = n => `<span class="wdots" title="Gewicht ${n}">${"●".repeat(n)}${"○".repeat(3 - n)}</span>`;
  el.innerHTML = `<div class="page">
   <header><h1>Prüfung üben</h1><p class="muted" style="margin-top:6px;max-width:70ch">Aus deinen Altprüfungen und Fragensammlungen: was drankommt, wie es gefragt wird und was du für ein Sehr gut können musst.</p></header>
   <div class="row fchips">${withPrep.map(x => `<button class="chip ${x.id === c.id ? "on" : ""}" data-pc="${x.id}"><span class="dot" style="--c:${x.color}"></span>${esc(x.short)} <b>${readiness(x.id).pct}%</b></button>`).join("")}</div>
   <div class="prep-top">
     <section class="card prep-ready"><span class="eyebrow">Prüfungsreife · ${esc(c.title)}</span><div class="rv-num"><b>${r.pct} %</b><span>${ex ? `Prüfung ${fmtDate(ex.date, { weekday: "short", day: "numeric", month: "long" })} · ${daysUntil(ex.date) === 0 ? "heute" : "in " + daysUntil(ex.date) + " Tagen"}` : "Prüfungstermin noch nicht eingetragen"}</span></div>
       <div class="col" style="gap:8px"><div class="spread"><small>Wissen in den Prüfungsthemen</small><small class="tab">${r.know} %</small></div>${pbar(r.know, "var(--know)")}
       <div class="spread"><small>Checkliste</small><small class="tab">${r.done}/${r.total}</small></div>${pbar(r.check)}
       <div class="spread"><small>Aufgaben gelöst</small><small class="tab">${r.tdone}/${(P.tasks || []).length}</small></div>${pbar((P.tasks || []).length ? 100 * r.tdone / P.tasks.length : 0, "var(--good)")}</div>
       <div class="row"><button class="btn pri" data-go="review" data-p="alt:${c.id}">Prüfungsfragen üben (${altN})</button><button class="btn" id="pr-sim">Prüfungssimulation</button></div></section>
     <section class="card col"><span class="eyebrow">So sieht die Prüfung aus</span><p>${esc(P.format)}</p>${(P.sources || []).length ? `<small class="muted">Quellen: ${P.sources.map(esc).join(" · ")}</small>` : ""}
       ${(P.strategy || []).length ? `<span class="eyebrow" style="margin-top:6px">Für ein Sehr gut</span><ul class="plist">${P.strategy.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</section>
   </div>
   <section class="col"><h2>Was drankommt</h2><div class="card list">${(P.focus || []).map(f => { const T = TOPICS[f.topic], k = knowTopic(f.topic);
     return `<div class="trow">${dots(f.weight)}<div class="lrow-main"><div class="lrow-t">${esc(T.name)}</div><small>${esc(f.note || "")}</small></div><div class="trow-k">${pbar(k, "var(--know)")}<small class="tab">${k} %</small></div><div class="row" style="gap:4px;flex-wrap:nowrap"><button class="btn sm ghost" data-go="lesson" data-p="${T.lesson}">Lesen</button><button class="btn sm" data-go="review" data-p="topic:${f.topic}">Üben</button></div></div>`; }).join("")}</div></section>
   <section class="col"><div class="spread"><h2>Checkliste</h2><small class="muted">${r.done} von ${r.total} sicher</small></div><div class="card list">${(P.checklist || []).map(x => `<label class="trow chk ${st.check[x.id] ? "on" : ""}"><input type="checkbox" data-ck="${x.id}" ${st.check[x.id] ? "checked" : ""}><div class="lrow-main"><div>${esc(x.text)}</div><small>${esc(TOPICS[x.topic] ? TOPICS[x.topic].name : "")}</small></div></label>`).join("")}</div></section>
   ${(P.tasks || []).length ? `<section class="col"><div class="spread"><h2>Aufgaben wie in der Prüfung</h2><small class="muted">Erst selbst lösen, dann Lösung aufklappen</small></div>
     ${P.tasks.map((t, i) => { const s2 = st.tasks[t.id]; return `<article class="card ptask ${s2 === 1 ? "ok" : s2 === 0 ? "again" : ""}" id="pt-${t.id}"><div class="spread"><div class="row" style="gap:8px"><span class="eyebrow">Aufgabe ${i + 1}${t.pts ? ` · ${t.pts} P.` : ""}</span><small class="muted">${esc(TOPICS[t.topic] ? TOPICS[t.topic].name : "")}</small></div>${s2 === 1 ? `<span class="chip acc">✓ konnte ich</span>` : s2 === 0 ? `<span class="chip warn">nochmal üben</span>` : ""}</div>
       <h3>${esc(t.title)}</h3><div class="body ptask-q">${t.html}</div>
       <details><summary>Lösung anzeigen</summary><div class="body ptask-s">${t.solution}</div><div class="row" style="margin-top:12px"><button class="btn sm yes" data-tk="${t.id}|1">✓ Konnte ich</button><button class="btn sm" data-tk="${t.id}|0">Nochmal üben</button></div></details></article>`; }).join("")}</section>` : ""}
  </div>`;
  el.onclick = e => {
    const pc = e.target.closest("[data-pc]"); if (pc) { App.go("prep", pc.dataset.pc); return; }
    const tk = e.target.closest("[data-tk]"); if (tk) { const [id, v] = tk.dataset.tk.split("|"); st.tasks[id] = +v; App.save(); const y = window.scrollY; App.render(); window.scrollTo(0, y); return; }
    if (e.target.closest("#pr-sim")) { S().course = c.id; App.save(); App.go("exam"); }
  };
  el.onchange = e => { const ck = e.target.closest("[data-ck]"); if (!ck) return; if (ck.checked) st.check[ck.dataset.ck] = Date.now(); else delete st.check[ck.dataset.ck]; App.save(); const y = window.scrollY; App.render(); window.scrollTo(0, y); };
};

/* ================= Übungen: interaktive Aufgaben aus den Lektionen ================= */
const origPractice = PAGES.practice;
PAGES.practice = (el, start) => {
  origPractice(el, start); const c = CBY[S().course], pr = $("#pr", el); if (!pr) return;
  const emp = $(".empty", pr), generic = ["sorter", "pairs", "gapfill"];
  const ls = App.courseLessons(c.id).filter(l => l.blocks.some(b => b.t === "widget" && generic.includes(b.w)));
  if (!ls.length) return;
  if (emp) emp.remove();
  const sec = document.createElement("div"); sec.className = "col"; sec.style.gap = "18px";
  sec.innerHTML = `<div><h2>Übungen aus den Lektionen</h2><p class="muted">Alle Zuordnungs-, Sortier- und Lückentext-Aufgaben dieses Kurses an einem Ort.</p></div>`; pr.appendChild(sec);
  ls.forEach(l => { const wrap = document.createElement("div"); wrap.className = "col"; wrap.style.gap = "8px";
    wrap.innerHTML = `<small class="muted">Kapitel ${l.world.n} · <button class="linkbtn" data-go="lesson" data-p="${l.id}">${esc(l.title)}</button></small>`;
    l.blocks.forEach(b => { if (b.t !== "widget" || !generic.includes(b.w)) return; const d = document.createElement("div"); d.className = "card"; d.dataset.widget = b.w; d._block = b; wrap.appendChild(d); });
    sec.appendChild(wrap); App.mountWidgets(wrap, l); });
};

/* ================= Start ================= */
App.afterBoot.push(() => {
  const st = S(); st.settings = st.settings || {};
  if (!st.settings.calmInit) { st.settings.unlockAll = true; st.settings.calmInit = 1; App.save(); }
});
})();
