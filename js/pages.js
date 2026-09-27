/* StudyOS v2 pages: quiz, flashcards, practice, challenges, exam, stats, resources, bookmarks, profile */
(function () {
const { $, $$, esc, shuffle, clamp, PAGES, CBY, COURSES, TOPICS, QUESTIONS, BOSSQ } = App;
const S = () => App.S();
const cur = () => CBY[S().course];
const courseQ = cid => QUESTIONS.filter(q => q.course === cid);
const courseChips = (active, attr = "data-sw") => `<div class="row" style="gap:6px">${COURSES.map(c => `<button class="chip ${c.id === active ? "on" : ""}" ${attr}="${c.id}"><span class="dot" style="--c:${c.color}"></span>${esc(c.title)}</button>`).join("")}</div>`;
App.courseChips = courseChips;
const switchCourse = (el, cb) => el.addEventListener("click", e => { const s = e.target.closest("[data-sw]"); if (s) { S().course = s.dataset.sw; App.save(); App.renderSide(); cb ? cb() : App.render(); } });

/* ================= Quiz engine ================= */
App.runQuiz = function (box, cfg) {
  const qs = cfg.questions.map(App.norm); let i = 0, c = 0, pts = 0; const res = [], wrong = [], answers = {};
  const exam = cfg.mode === "exam", speed = cfg.mode === "speed"; let tEnd = speed ? Date.now() + 60000 : 0, tmr;
  const finish = () => { clearInterval(tmr); cfg.onFinish({ n: speed ? res.length : qs.length, c, wrong, answers, res, pts }, box); };
  const draw = () => {
    if (exam) {
      box.innerHTML = `<div class="col" style="gap:14px">${qs.map((q, k) => `<div class="card col" id="eq-${k}"><div class="spread"><span class="eyebrow">Frage ${k + 1} · ${q.pts || 1} P.</span>${cfg.minus ? `<small class="muted">falsch: −${Math.round((q.pts || 1) * cfg.minus * 100) / 100}</small>` : ""}</div>${App.questionHTML(q, "ex" + k)}${cfg.minus ? `<div><button class="btn ghost sm" data-clear="${k}">Antwort zurücknehmen</button></div>` : ""}</div>`).join("")}</div>`;
      qs.forEach((q, k) => { const card = $("#eq-" + k, box); card.onclick = e => { const cl = e.target.closest("[data-clear]"); if (cl) { delete answers[k]; $$(".opt", card).forEach(x => x.classList.remove("sel")); cfg.onAnswer && cfg.onAnswer(answers); return; } const b = e.target.closest(".opt"); if (!b) return; answers[k] = $$(".opt", card).indexOf(b); $$(".opt", card).forEach(x => x.classList.toggle("sel", x === b)); cfg.onAnswer && cfg.onAnswer(answers); }; });
      return;
    }
    if (i >= qs.length) return finish();
    const q = qs[i];
    box.innerHTML = `<div class="card col" style="gap:14px">${speed ? `<div class="timer"><i id="sp-t" style="width:100%"></i></div>` : ""}
      <div class="spread"><span class="eyebrow">${esc(cfg.title || "Quiz")} · ${speed ? "Frage " + (i + 1) : (i + 1) + " / " + qs.length}</span><div class="row" style="gap:8px"><small class="tab">${c} richtig</small>${App.bmBtn("question", q.id, App.strip(q.q).slice(0, 80), q.id)}</div></div>
      ${!speed ? `<div class="qprog">${qs.map((_, k) => `<i class="${res[k] === true ? "ok" : res[k] === false ? "no" : k === i ? "cur" : ""}"></i>`).join("")}</div>` : ""}
      <div id="qq">${App.questionHTML(q, "qa")}</div><div class="row" id="qnext" hidden><button class="btn pri">${i + 1 < qs.length ? "Nächste Frage →" : "Ergebnis"}</button></div></div>`;
    const qq = $("#qq", box);
    qq.onclick = e => { const b = e.target.closest("[data-qa]"); if (!b || b.disabled) return; const pick = +b.dataset.qa, ok = App.reveal(qq, q, pick); res[i] = ok; if (ok) c++; else wrong.push(q); App.rec(q.topic, ok ? 1 : 0); if (ok) App.addXP(3, "q", b);
      if (speed) { setTimeout(() => { i++; if (Date.now() < tEnd && i < qs.length) draw(); else finish(); }, ok ? 450 : 1100); return; }
      const nx = $("#qnext", box); nx.hidden = false; $("button", nx).onclick = () => { i++; draw(); }; $("button", nx).focus(); };
    if (speed) { clearInterval(tmr); tmr = setInterval(() => { const p = (tEnd - Date.now()) / 60000, t = $("#sp-t", box); if (t) t.style.width = Math.max(0, p * 100) + "%"; if (p <= 0) finish(); }, 100); }
  };
  const key = e => { if (!document.body.contains(box) || e.target.closest("input,textarea,select")) return; if (/^[1-4]$/.test(e.key)) { const b = $$("#qq .opt", box)[+e.key - 1]; if (b && !b.disabled) b.click(); } if (e.key === "Enter") { const n = $("#qnext:not([hidden]) button", box); if (n) n.click(); } };
  window.addEventListener("keydown", key); App.cleanup = (old => () => { clearInterval(tmr); window.removeEventListener("keydown", key); old && old(); })(App.cleanup);
  draw(); return { answers, qs };
};

/* ================= Quiz Arena ================= */
PAGES.quiz = (el, p) => {
  const c = cur(); const pool = courseQ(c.id), topics = [...new Set(pool.map(q => q.topic))];
  const start = mode => {
    let qs, title;
    if (mode === "quick") { qs = shuffle(pool).slice(0, 10); title = "Schnellquiz · " + c.title; }
    else if (mode === "mixed") { qs = shuffle(QUESTIONS).slice(0, 12); title = "Mix aus allen Kursen"; }
    else if (mode === "speed") { qs = shuffle(pool); title = "Speed-Quiz"; }
    else if (mode === "weak") { const w = topics.map(t => [t, App.mastery(t), (S().topics[t] || []).length]).sort((a, b) => (a[1] - b[1]) || (b[2] - a[2])).slice(0, 3).map(x => x[0]); qs = shuffle(pool.filter(q => w.includes(q.topic))).slice(0, 8); title = "Schwächen · " + w.map(t => TOPICS[t].name).join(", "); }
    else if (mode.startsWith("topic:")) { const t = mode.slice(6); qs = shuffle(QUESTIONS.filter(q => q.topic === t)).slice(0, 8); title = TOPICS[t] ? TOPICS[t].name : "Thema"; }
    if (!qs || !qs.length) { App.toast("Keine Fragen", "Für diese Auswahl gibt es noch keine Fragen.", "!"); return; }
    const wrap = $("#qarena", el); $("#qmodes", el).hidden = true; wrap.hidden = false;
    App.runQuiz(wrap, { questions: qs, mode: mode === "speed" ? "speed" : "practice", title, onFinish: (r, box) => {
      const perfect = r.n >= 5 && r.c === r.n, xp = r.n ? 20 + (perfect ? 50 : 0) : 0;
      S().quizHist.push({ ts: Date.now(), mode: mode.split(":")[0], course: c.id, n: r.n, c: r.c }); if (S().quizHist.length > 300) S().quizHist.shift();
      if (xp) App.addXP(xp, "quiz", box); if (perfect) App.unlock("perfect"); App.save();
      const tops = [...new Set(r.wrong.map(q => q.topic))];
      box.innerHTML = `<div class="card col" style="gap:14px"><span class="eyebrow">${esc(title)}</span><div class="row" style="gap:18px"><div class="result-big" style="color:${perfect ? "var(--acc)" : r.c / Math.max(1, r.n) >= .7 ? "var(--text)" : "var(--warn)"}">${r.c}/${r.n}</div><div><p>${perfect ? "Perfekt. +50 XP Bonus." : r.n ? Math.round(100 * r.c / r.n) + " % richtig." : "Keine Antworten."}</p><small class="muted">+${xp + r.c * 3} XP</small></div></div>
        ${tops.length ? `<div class="col" style="gap:8px"><span class="eyebrow">Wiederholen</span>${tops.map(t => `<div class="spread"><div>${esc(TOPICS[t].name)} ${App.mBadge(App.mastery(t))}</div><div class="row"><button class="btn sm" data-go="lesson" data-p="${TOPICS[t].lesson}">Lektion</button><button class="btn sm" data-go="quiz" data-p="topic:${t}">Themenquiz</button></div></div>`).join("")}</div>` : ""}
        <div class="row"><button class="btn pri" id="again">Nochmal</button><button class="btn" data-go="quiz">Alle Modi</button></div></div>`;
      $("#again", box).onclick = () => start(mode);
    } });
  };
  el.innerHTML = `<div class="page"><div><h1>Quiz Arena</h1><p class="muted" style="margin-top:6px">Jede Antwort mit Begründung. Tasten <span class="kbd">1</span>–<span class="kbd">4</span> wählen, <span class="kbd">Enter</span> weiter.</p></div>
   <div id="qmodes" class="col" style="gap:18px">${courseChips(c.id)}
    <div class="modes">${[["quick", "Schnellquiz", "10 Fragen aus " + c.title, "▸"], ["weak", "Schwächen-Quiz", "8 Fragen aus deinen 3 schwächsten Themen", "↯"], ["speed", "Speed-Quiz", "So viele wie möglich in 60 Sekunden", "⏱"], ["mixed", "Kurs-Mix", "12 Fragen aus allen Kursen", "◇"]].map(([k, t, d, i]) => `<button class="card mode" data-m="${k}"><span class="cicon" style="--c:${c.color}">${i}</span><h3>${t}</h3><small>${esc(d)}</small></button>`).join("")}</div>
    <div class="card col"><h3>Themenquiz</h3><div class="row" style="gap:6px">${topics.map(t => `<button class="chip" data-m="topic:${t}">${esc(TOPICS[t].name)} <span class="tab faint">${App.mastery(t)} %</span></button>`).join("")}</div></div>
    ${S().quizHist.length ? `<div class="card col"><h3>Letzte Runden</h3>${S().quizHist.slice(-5).reverse().map(h => `<div class="spread"><span>${esc(CBY[h.course] ? CBY[h.course].title : "")} · ${esc(h.mode)} · ${new Date(h.ts).toLocaleDateString("de-AT")}</span><span class="tab">${h.c}/${h.n}</span></div>`).join("")}</div>` : ""}</div>
   <div id="qarena" hidden></div></div>`;
  $("#qmodes", el).addEventListener("click", e => { const m = e.target.closest("[data-m]"); if (m) start(m.dataset.m); });
  switchCourse(el);
  if (p) start(p);
};

/* ================= Flashcards (SM-2 light) ================= */
const allCards = () => App.FLASH.concat((S().customCards || []).map(c => Object.assign({ course: c.course || App.courseOfTopic(c.topic) || "dasc" }, c)));
const cst = id => S().cards[id];
App.dueCount = () => allCards().filter(c => { const s = cst(c.id); return s && s.due <= Date.now(); }).length;
PAGES.flash = el => {
  let scope = S().course, cat = "Alle", queue = [], card = null, flipped = false, n = 0;
  const pool = () => allCards().filter(c => (scope === "all" || c.course === scope) && (cat === "Alle" || c.cat === cat));
  const build = () => { const p = pool(); const due = p.filter(c => cst(c.id) && cst(c.id).due <= Date.now()).sort((a, b) => cst(a.id).due - cst(b.id).due); queue = due.concat(shuffle(p.filter(c => !cst(c.id))).slice(0, 12)); card = queue.shift() || null; flipped = false; };
  const rate = r => { const s = cst(card.id) || { ivl: 0, ease: 2.5, reps: 0, lapses: 0 }, D = 864e5, now = Date.now();
    if (r === 0) { s.lapses++; s.reps = 0; s.ivl = 0; s.ease = Math.max(1.3, s.ease - 0.2); s.due = now + 60e3; queue.splice(Math.min(3, queue.length), 0, card); }
    else if (r === 1) { s.ivl = Math.max(1, (s.ivl || 1) * 1.2); s.ease = Math.max(1.3, s.ease - 0.15); s.reps++; s.due = now + s.ivl * D; }
    else if (r === 2) { s.ivl = s.reps === 0 ? 1 : s.reps === 1 ? 3 : Math.round(s.ivl * s.ease); s.reps++; s.due = now + s.ivl * D; }
    else { s.ivl = s.reps === 0 ? 3 : Math.round(Math.max(4, s.ivl * s.ease * 1.3)); s.ease += 0.15; s.reps++; s.due = now + s.ivl * D; }
    S().cards[card.id] = s; App.day().cards++; n++; App.rec(card.topic, [0, 0.6, 1, 1][r]); if (r >= 2) App.addXP(2, "card", $(".fc", el)); App.checkAch(); App.save(); card = queue.shift() || null; flipped = false; draw(); App.renderSide(); };
  const draw = () => {
    const p = pool(), started = p.filter(c => cst(c.id)).length, dueN = p.filter(c => cst(c.id) && cst(c.id).due <= Date.now()).length;
    const cats = [...new Set(allCards().filter(c => scope === "all" || c.course === scope).map(c => c.cat))];
    el.innerHTML = `<div class="page"><div class="spread"><div><h1>Karteikarten</h1><p class="muted" style="margin-top:6px">Spaced Repetition: Was du nicht weißt, kommt früher wieder.</p></div><div class="row"><span class="chip tab">${started}/${p.length} begonnen</span><span class="chip warn tab">${dueN} fällig</span><span class="chip acc tab">${n} heute</span></div></div>
      <div class="row" style="gap:6px"><button class="chip ${scope === "all" ? "on" : ""}" data-sc="all">Alle Kurse</button>${COURSES.map(c => `<button class="chip ${scope === c.id ? "on" : ""}" data-sc="${c.id}"><span class="dot" style="--c:${c.color}"></span>${esc(c.title)}</button>`).join("")}</div>
      ${cats.length > 1 ? `<div class="row" style="gap:6px">${["Alle"].concat(cats).map(x => `<button class="chip ${x === cat ? "on" : ""}" data-cat="${esc(x)}">${esc(x)}</button>`).join("")}</div>` : ""}
      ${card ? `<div class="fc-stage"><div class="fc ${flipped ? "flip" : ""}" id="fc" tabindex="0" role="button" aria-label="Karte umdrehen">
        <div class="fc-face"><span class="eyebrow">${esc(CBY[card.course] ? CBY[card.course].title : "")} · ${esc(TOPICS[card.topic] ? TOPICS[card.topic].name : card.cat)}</span><div class="big">${esc(card.front)}</div><small class="muted">Tippen oder <span class="kbd">Leertaste</span></small></div>
        <div class="fc-face back"><span class="eyebrow">${esc(card.front)}</span><div class="ans" style="white-space:pre-wrap">${esc(card.back)}</div></div></div></div>
       <div class="rate" ${flipped ? "" : 'style="visibility:hidden"'}>${[["Nochmal", "< 1 min", "danger"], ["Schwer", "", ""], ["Gut", "", ""], ["Leicht", "", "pri"]].map(([t, s, c], k) => `<button class="btn ${c}" data-r="${k}">${t}<small>${k + 1}${s ? " · " + s : ""}</small></button>`).join("")}</div>
       <div class="spread"><small class="muted">${queue.length} weitere in dieser Runde</small>${App.bmBtn("card", card.id, card.front, card.id)}</div>`
      : `<div class="empty"><h3 style="color:var(--text)">Gerade nichts fällig.</h3><div class="row" style="justify-content:center;margin-top:14px"><button class="btn pri" id="more">${started < p.length ? "Neue Karten lernen" : "Alles wiederholen"}</button></div></div>`}
      <div class="card col"><h3>Eigene Karte</h3><form id="addc" class="grid g3" style="align-items:end"><label class="fld">Vorderseite<input type="text" id="nf" required></label><label class="fld">Rückseite<input type="text" id="nb" required></label><label class="fld">Kurs<select id="nc">${COURSES.map(c => `<option value="${c.id}" ${c.id === S().course ? "selected" : ""}>${esc(c.title)}</option>`).join("")}</select></label><div><button class="btn sm" type="submit">Hinzufügen</button></div></form></div></div>`;
    const fc = $("#fc", el); if (fc) fc.onclick = () => { flipped = !flipped; fc.classList.toggle("flip", flipped); $(".rate", el).style.visibility = flipped ? "visible" : "hidden"; };
    $$("[data-r]", el).forEach(b => b.onclick = () => rate(+b.dataset.r));
    const m = $("#more", el); if (m) m.onclick = () => { const q = pool(); queue = shuffle(q.filter(c => !cst(c.id))).slice(0, 12); if (!queue.length) queue = shuffle(q).slice(0, 15); card = queue.shift() || null; flipped = false; draw(); };
    $("#addc", el).onsubmit = e => { e.preventDefault(); const f = $("#nf", el).value.trim(), b = $("#nb", el).value.trim(), cid = $("#nc", el).value; if (!f || !b) return; const t = Object.keys(TOPICS).find(k => TOPICS[k].course === cid); S().customCards.push({ id: "c" + Date.now(), cat: "Eigene", course: cid, topic: t, front: f, back: b }); App.save(); App.toast("Karte hinzugefügt", f, "▭"); draw(); };
  };
  el.onclick = e => { const c = e.target.closest("[data-cat]"), s = e.target.closest("[data-sc]"); if (c) { cat = c.dataset.cat; build(); draw(); } if (s) { scope = s.dataset.sc; cat = "Alle"; build(); draw(); } };
  const key = e => { if (App.route().v !== "flash" || e.target.closest("input,textarea,select")) return; if (e.key === " " && card) { e.preventDefault(); $("#fc", el) && $("#fc", el).click(); } if (/^[1-4]$/.test(e.key) && flipped && card) rate(+e.key - 1); };
  window.addEventListener("keydown", key); App.cleanup = (old => () => { window.removeEventListener("keydown", key); old && old(); })(App.cleanup);
  build(); draw();
};

/* ================= Practice ================= */
PAGES.practice = (el, start) => {
  const c = cur();
  const blocks = { dasc: [["lab", { tasks: Object.keys(c.pyTasks || {}), start }], ["terminal", { mission: "git", topic: "git" }], ["explorer", { topic: "explore" }]],
    bwl2: [["npv", { topic: "b-dyn" }], ["cases", { set: "dyn", topic: "b-dyn" }], ["cases", { set: "stat", topic: "b-stat" }], ["cases", { set: "kore", topic: "b-entsch" }], ["breakeven", {}], ["zuschlag", {}], ["ratio", { set: "fin", topic: "b-fin" }]],
    eng3: [["chartlab", { topic: "e-chart" }], ["imsg", { lang: "en", topic: "e-imsg" }], ["presplanner", {}], ["glossary", {}]],
    kommu: [["gfk4", { topic: "k-4s" }], ["imsg", { lang: "de", topic: "k-ich" }], ["fourears", { topic: "k-svt" }]] }[c.id] || [];
  el.innerHTML = `<div class="page"><div><h1>Übungen · ${esc(c.title)}</h1><p class="muted" style="margin-top:6px">Werkzeuge und Trainer für den aktuellen Kurs. Das Git-Labor hat eine eigene Seite.</p></div>${courseChips(c.id)}<div class="col" id="pr" style="gap:16px"></div></div>`;
  const pr = $("#pr", el); blocks.forEach(([w, b]) => { const d = document.createElement("div"); d.className = "card"; pr.appendChild(d); App.mountWidget(d, w, b); });
  if (!blocks.length) pr.innerHTML = `<div class="empty">Für diesen Kurs gibt es noch keine Übungswerkzeuge.</div>`;
  switchCourse(el);
};

/* ================= Challenges ================= */
PAGES.challenges = el => {
  const dq = App.dailyQuestion(), dqDone = S().daily[App.today()];
  el.innerHTML = `<div class="page"><div><h1>Challenges</h1><p class="muted" style="margin-top:6px">Tägliche Frage, Boss-Kämpfe und Spiele aus allen Kursen.</p></div>
   <div class="grid g2"><div class="card col" id="chd"><div class="spread"><h3>Tägliche Challenge</h3><span class="chip ${dqDone !== undefined ? "acc" : "warn"}">${dqDone !== undefined ? "Erledigt" : "+20 XP"}</span></div></div>
    <div class="card col"><h3>Boss-Kämpfe</h3>${COURSES.flatMap(c => c.worlds.filter(w => w.boss).map(w => { const b = S().bosses[w.boss.id] || {}, un = App.bossUnlocked(w); return `<div class="spread"><div><div><span class="dot" style="--c:${c.color}"></span> ${esc(w.boss.title)}</div><small>${esc(c.title)} · Welt ${w.n}${b.best != null ? " · Bestwert " + b.best + " %" : ""}</small></div>${un ? `<button class="btn sm ${b.passed ? "" : "pri"}" data-go="boss" data-p="${w.id}">${b.passed ? "Nochmal" : "Kämpfen"}</button>` : `<span class="chip">🔒</span>`}</div>`; })).join(`<div class="divider"></div>`)}</div></div>
   <div class="card" id="ch-cr"></div><div class="grid g2"><div class="card" id="ch-air"></div><div class="card" id="ch-orange"></div></div><div class="card" id="ch-grid"></div></div>`;
  const box = $("#chd", el); box.insertAdjacentHTML("beforeend", `<small class="muted">${esc(CBY[dq.course].title)}</small>` + App.questionHTML(dq, "dq2")); if (dqDone !== undefined) App.reveal(box, dq, dqDone);
  box.onclick = e => { const b = e.target.closest("[data-dq2]"); if (!b || S().daily[App.today()] !== undefined) return; const pick = +b.dataset.dq2, ok = App.reveal(box, dq, pick); S().daily[App.today()] = pick; App.rec(dq.topic, ok ? 1 : 0); App.addXP(ok ? 20 : 5, "daily", b); App.save(); };
  App.mountWidget($("#ch-cr", el), "classreg", { topic: "supervised" }); App.mountWidget($("#ch-air", el), "airplane", { topic: "bias" }); App.mountWidget($("#ch-orange", el), "orange", { topic: "k-harv" }); App.mountWidget($("#ch-grid", el), "gridworld", { topic: "rl" });
};

/* ================= Exam trainer ================= */
PAGES.exam = el => {
  const c = cur();
  if (c.exam === "dasc") return examDasc(el);
  if (c.exam === "mc") return examMC(el, c);
  return examGeneric(el, c);
};
function examHeader(c) { return `<div><h1>Prüfungstrainer · ${esc(c.title)}</h1></div>${courseChips(c.id)}`; }
function examGeneric(el, c) {
  const qs = shuffle(courseQ(c.id).concat(BOSSQ.filter(q => q.course === c.id))).slice(0, 20);
  el.innerHTML = `<div class="page">${examHeader(c)}<div class="card col"><p>Prüfungssimulation: ${qs.length} Fragen, 25 Minuten, Auswertung erst nach Abgabe.</p>${c.id === "kommu" ? `<p class="muted">KOMMU wird über Anwesenheit, Portfolio und Deep Talk beurteilt. Diese Simulation hilft beim Wiederholen der Theorie.</p>` : ""}${c.id === "eng3" ? `<p class="muted">Final assessment: 60 points. Also practise your 5–7 minute presentation with the timer below.</p>` : ""}<div class="row"><button class="btn pri" id="go">Starten</button></div></div>${c.id === "eng3" ? `<div class="card col" id="pt"></div>` : ""}</div>`;
  switchCourse(el);
  if (c.id === "eng3") presTimer($("#pt", el));
  $("#go", el).onclick = () => runExamMC(el, c, qs.map(q => Object.assign({}, q, { pts: 1 })), { minutes: 25, minus: 0, pass: 0.61 });
}
function presTimer(box) {
  let t0 = 0, tmr, run = false;
  const draw = () => { const s = run ? Math.round((Date.now() - t0) / 1000) : 0; const col = s < 300 ? "var(--muted)" : s <= 420 ? "var(--acc)" : "var(--bad)";
    box.innerHTML = `<h3>Presentation timer (5–7 min)</h3><div class="countdown" style="color:${col}">${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}</div><div class="row"><button class="btn ${run ? "danger" : "pri"} sm" id="pt-b">${run ? "Stop" : "Start"}</button></div><small class="muted">Green between 5:00 and 7:00.</small>`;
    $("#pt-b", box).onclick = () => { run = !run; if (run) { t0 = Date.now(); tmr = setInterval(draw, 500); } else clearInterval(tmr); draw(); }; };
  App.cleanup = (old => () => { clearInterval(tmr); old && old(); })(App.cleanup); draw();
}
function examMC(el, c) {
  const last = S().exams.filter(x => x.course === c.id).slice(-3).reverse();
  el.innerHTML = `<div class="page">${examHeader(c)}
    <div class="callout">Wie die Schlussklausur: Multiple Choice, Punkte je Frage, <b>Minuspunkte</b> für falsche Antworten (unbeantwortet = 0), 50 % zum Bestehen, Notenschlüssel 88/76/63/50. Excel darfst du daneben verwenden.</div>
    <div class="grid g2"><div class="card col"><h3>Setup</h3>
      <label class="fld">Umfang<select id="ex-n"><option value="15">Kurz · 15 Fragen / 30 min</option><option value="25" selected>Klausur · 25 Fragen / 90 min</option></select></label>
      <label class="fld">Minuspunkte bei falscher Antwort<select id="ex-m"><option value="0">keine</option><option value="0.25">−25 % der Fragenpunkte</option><option value="0.5" selected>−50 % der Fragenpunkte</option><option value="1">−100 %</option></select></label>
      <button class="btn pri" id="ex-go">Simulation starten</button></div>
     <div class="card col"><h3>Letzte Durchläufe</h3>${last.length ? last.map(x => `<div class="spread"><div class="tab">${x.total} / ${x.max} P. · ${Math.round(100 * x.total / x.max)} %</div><small>${new Date(x.ts).toLocaleDateString("de-AT")}</small></div>`).join(`<div class="divider"></div>`) : `<p class="muted">Noch keine.</p>`}</div></div></div>`;
  switchCourse(el);
  $("#ex-go", el).onclick = () => { const n = +$("#ex-n", el).value, minus = +$("#ex-m", el).value;
    const theory = shuffle(courseQ(c.id)).slice(0, Math.round(n * 0.6)), calc = shuffle(courseQ(c.id).filter(q => /\d/.test(q.q) && !theory.includes(q)).concat(BOSSQ.filter(q => q.course === c.id))).slice(0, n - theory.length);
    const qs = shuffle(theory.concat(calc)).map(q => Object.assign({}, q, { pts: /\d/.test(q.q) ? 4 : 3 }));
    runExamMC(el, c, qs, { minutes: n === 25 ? 90 : 30, minus, pass: 0.5 }); };
}
function runExamMC(el, c, qs, cfg) {
  const max = qs.reduce((s, q) => s + q.pts, 0), tEnd = Date.now() + cfg.minutes * 60000; let tmr, answers = {};
  el.innerHTML = `<div class="page"><div class="spread"><div><span class="eyebrow">Simulation · ${esc(c.title)}</span><h1>${qs.length} Fragen · ${max} Punkte</h1></div><div class="row"><span class="chip warn tab" id="clk">${cfg.minutes}:00</span><button class="btn pri" id="sub">Abgeben</button></div></div><div id="qz"></div><div class="row"><button class="btn pri" id="sub2">Abgeben</button><span class="muted" id="left"></span></div></div>`;
  App.runQuiz($("#qz", el), { questions: qs, mode: "exam", minus: cfg.minus, onFinish: () => {}, onAnswer: a => { answers = a; $("#left", el).textContent = (qs.length - Object.keys(a).length) + " unbeantwortet"; } });
  tmr = setInterval(() => { const s = Math.max(0, Math.round((tEnd - Date.now()) / 1000)); const k = $("#clk", el); if (k) k.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); if (s <= 0) submit(); }, 1000);
  App.cleanup = (old => () => { clearInterval(tmr); old && old(); })(App.cleanup);
  const submit = () => { clearInterval(tmr); let pts = 0; const weak = new Set();
    qs.forEach((q, k) => { const nq = App.norm(q); if (answers[k] === undefined) { weak.add(q.topic); return; } const ok = answers[k] === nq.a; pts += ok ? q.pts : -q.pts * cfg.minus; App.rec(q.topic, ok ? 1 : 0); if (!ok) weak.add(q.topic); });
    pts = Math.max(0, Math.round(pts * 100) / 100); const pct = 100 * pts / max, sc = c.assessment && c.assessment.scale, grade = sc ? sc.find(s => pct >= s[0]) : null;
    S().exams.push({ ts: Date.now(), course: c.id, total: pts, max, weak: [...weak] }); App.addXP(20 + Math.round(pct / 100 * 30), "exam"); App.save();
    el.innerHTML = `<div class="page"><div><span class="eyebrow">Ergebnis</span><h1>${esc(c.title)} · Simulation</h1></div>
      <div class="grid g3"><div class="card stat"><b class="result-big" style="font-size:38px;color:${pct >= cfg.pass * 100 ? "var(--acc)" : "var(--bad)"}">${App.fmtNum(pts, pts % 1 ? 2 : 0)} / ${max}</b><span>${Math.round(pct)} % · ${pct >= cfg.pass * 100 ? "bestanden" : "nicht bestanden"}</span></div><div class="card stat"><b>${grade ? grade[1] : "–"}</b><span>Note nach Schlüssel</span></div><div class="card stat"><b>${Object.keys(answers).length}/${qs.length}</b><span>beantwortet</span></div></div>
      ${weak.size ? `<div class="card col"><h3>Schwachstellen</h3>${[...weak].map(t => `<div class="spread"><div>${esc(TOPICS[t].name)} ${App.mBadge(App.mastery(t))}</div><div class="row"><button class="btn sm" data-go="lesson" data-p="${TOPICS[t].lesson}">Lektion</button><button class="btn sm" data-go="quiz" data-p="topic:${t}">Themenquiz</button></div></div>`).join("")}</div>` : ""}
      <h2>Auswertung</h2><div class="col" style="gap:12px">${qs.map((q, k) => `<div class="card col" id="rv-${k}"><span class="eyebrow">Frage ${k + 1} · ${q.pts} P.</span>${App.questionHTML(q, "rv")}</div>`).join("")}</div>
      <div class="row"><button class="btn pri" data-go="exam">Neue Simulation</button></div></div>`;
    qs.forEach((q, k) => { const box = $("#rv-" + k, el); if (answers[k] !== undefined) App.reveal(box, q, answers[k]); else { $$(".opt", box).forEach((o, i) => { o.disabled = true; if (i === App.norm(q).a) o.classList.add("reveal"); }); $(".fb", box).innerHTML = `<div class="why bad"><b>Nicht beantwortet (0 P.).</b><div>${q.why}</div></div>`; } });
    window.scrollTo({ top: 0 }); };
  $("#sub", el).onclick = submit; $("#sub2", el).onclick = submit;
}
function examDasc(el) {
  const c = CBY.dasc, EX = [{ id: "missing", pts: 7 }, { id: "filter", pts: 7 }, { id: "mse", pts: 7 }, { id: "gdstep", pts: 7 }], GIT = ["git status", "git add .", 'git commit -m "Hand-in assignment"', "git push"];
  let cfg = { diff: "normal", timer: true };
  const setup = () => { const last = S().exams.filter(x => !x.course || x.course === "dasc").slice(-3).reverse();
    el.innerHTML = `<div class="page">${examHeader(c)}<p class="muted">Probelauf für das Knowledge Assessment Teil 1: <b>Teil A</b> Quiz (10 P.), <b>Teil B</b> Python + Git (35 P.).</p>
     <div class="callout">Nur zur Vorbereitung. Im echten Assessment: Debian-Image, eingeschränktes Web, Bildschirmaufzeichnung, keine Smart Devices, keine KI.</div>
     <div class="grid g2"><div class="card col"><h3>Setup</h3><div><span class="eyebrow">Schwierigkeit</span><div class="row" style="gap:6px;margin-top:8px">${[["easy", "Leicht"], ["normal", "Normal"], ["exam", "Prüfung"]].map(([k, t]) => `<button class="chip ${cfg.diff === k ? "on" : ""}" data-d="${k}">${t}</button>`).join("")}</div><small class="muted">${{ easy: "Hinweise gratis.", normal: "Jeder Hinweis kostet 2 Punkte.", exam: "Keine Hinweise." }[cfg.diff]}</small></div>
      <label class="switch"><span>90-Minuten-Timer</span><input type="checkbox" class="tgl" id="ex-t" ${cfg.timer ? "checked" : ""}></label><button class="btn pri" id="ex-go">Starten</button></div>
      <div class="card col"><h3>Letzte Durchläufe</h3>${last.length ? last.map(x => `<div class="spread"><div class="tab">${x.total} / ${x.max} P.</div><small>${new Date(x.ts).toLocaleDateString("de-AT")}</small></div>`).join(`<div class="divider"></div>`) : `<p class="muted">Noch keine.</p>`}</div></div></div>`;
    switchCourse(el);
    el.onclick = e => { const d = e.target.closest("[data-d]"); if (d) { cfg.diff = d.dataset.d; setup(); } };
    $("#ex-t", el).onchange = e => cfg.timer = e.target.checked; $("#ex-go", el).onclick = () => { el.onclick = null; run(); }; };
  const run = () => {
    const qs = shuffle(courseQ("dasc")).slice(0, 10), hints = {}; let gitSeq = []; const gitPool = shuffle(GIT.concat(["git init", "git pull"])), tEnd = Date.now() + 90 * 60000; let tmr, answers = {};
    el.innerHTML = `<div class="page"><div class="spread"><div><span class="eyebrow">Probe-Assessment · ${cfg.diff}</span><h1>Data Science · Teil 1</h1></div><div class="row">${cfg.timer ? `<span class="chip warn tab" id="ex-clock">90:00</span>` : ""}<button class="btn pri" id="ex-submit">Abgeben</button></div></div>
      <h2>Teil A · Quiz <small class="muted">10 P.</small></h2><div id="partA"></div><h2>Teil B · Praxis <small class="muted">35 P.</small></h2>
      ${EX.map((x, k) => { const t = c.pyTasks[x.id]; return `<div class="card col" id="pb-${x.id}"><div class="spread"><h3>B${k + 1} · ${esc(t.title)}</h3><span class="chip tab">${x.pts} P.</span></div><div>${t.prompt}</div><textarea class="code" id="exc-${x.id}" spellcheck="false" style="border:1px solid var(--line2);border-radius:8px">${esc(t.starter)}</textarea><div class="row"><button class="btn sm" data-run="${x.id}">▶ Ausführen</button>${cfg.diff !== "exam" ? `<button class="btn ghost sm" data-hint="${x.id}">Hinweis${cfg.diff === "normal" ? " (−2)" : ""}</button>` : ""}</div><div class="hints"></div><div class="ed-out" style="border:1px solid var(--line);border-radius:8px" id="exo-${x.id}"><span class="faint">${t.simulated ? "NumPy/pandas laufen hier nicht; bewertet bei Abgabe." : "Ausgabe erscheint hier."}</span></div></div>`; }).join("")}
      <div class="card col"><div class="spread"><h3>B5 · Abgabe mit Git</h3><span class="chip tab">7 P.</span></div><p>Reihenfolge antippen. Zwei Befehle sind überflüssig.</p><div class="pool" id="gp">${gitPool.map((g, i) => `<button class="tok mono" data-g="${i}">${esc(g)}</button>`).join("")}</div><div class="codeq" id="gseq">—</div><div><button class="btn ghost sm" id="greset">Zurücksetzen</button></div></div>
      <div class="row"><button class="btn pri" id="ex-submit2">Abgeben</button><span class="muted" id="ex-left"></span></div></div>`;
    App.runQuiz($("#partA", el), { questions: qs, mode: "exam", onFinish: () => {}, onAnswer: a => { answers = a; $("#ex-left", el).textContent = (10 - Object.keys(a).length) + " Quizfragen offen"; } });
    const drawGit = () => { $("#gseq", el).textContent = gitSeq.map(i => gitPool[i]).join("\n") || "—"; $$("#gp .tok", el).forEach(t => t.classList.toggle("used", gitSeq.includes(+t.dataset.g))); };
    $("#gp", el).onclick = e => { const t = e.target.closest("[data-g]"); if (t && gitSeq.length < 4) { gitSeq.push(+t.dataset.g); drawGit(); } }; $("#greset", el).onclick = () => { gitSeq = []; drawGit(); };
    $$("[data-run]", el).forEach(b => b.onclick = async () => { const id = b.dataset.run, t = c.pyTasks[id], o = $("#exo-" + id, el), src = $("#exc-" + id, el).value; if (t.simulated || !App.py.ready()) { o.innerHTML = `<span class="sim">Kann ${t.simulated ? "NumPy/pandas" : "Python gerade"} nicht ausführen. Bewertung bei Abgabe.</span>`; return; } o.textContent = "Läuft …"; const r = await App.py.run(src); o.innerHTML = esc(r.out) + (r.err ? `<span class="err">${esc(r.err)}</span>` : ""); });
    $$("[data-hint]", el).forEach(b => b.onclick = () => { const id = b.dataset.hint; hints[id] = Math.min(3, (hints[id] || 0) + 1); const t = c.pyTasks[id]; $(".hints", $("#pb-" + id, el)).innerHTML = t.hints.slice(0, hints[id]).map((h, i) => `<div class="hint"><b>Hinweis ${i + 1}</b>${i === 2 ? `<pre>${esc(h)}</pre>` : `<div>${esc(h)}</div>`}</div>`).join(""); if (hints[id] >= 3) b.disabled = true; });
    if (cfg.timer) tmr = setInterval(() => { const s = Math.max(0, Math.round((tEnd - Date.now()) / 1000)), k = $("#ex-clock", el); if (k) k.textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); if (s <= 0) { clearInterval(tmr); submit(true); } }, 1000);
    App.cleanup = (old => () => { clearInterval(tmr); old && old(); })(App.cleanup);
    let confirmOpen = false;
    const submit = async forced => { const un = 10 - Object.keys(answers).length; if (!forced && un && !confirmOpen) { confirmOpen = true; $("#ex-left", el).innerHTML = `<span style="color:var(--warn)">${un} Fragen offen. Nochmal „Abgeben“ drücken, um trotzdem abzugeben.</span>`; return; } clearInterval(tmr);
      let a = 0; const weak = new Set(); qs.forEach((q, k) => { const ok = answers[k] === App.norm(q).a; if (ok) a++; else weak.add(q.topic); App.rec(q.topic, ok ? 1 : 0); });
      const bRes = []; for (const x of EX) { const t = c.pyTasks[x.id], src = $("#exc-" + x.id, el).value, r = await App.gradeTask(t, src), pen = cfg.diff === "normal" ? 2 * (hints[x.id] || 0) : 0, pts = r.ok ? Math.max(0, x.pts - pen) : 0; bRes.push({ x, t, ok: r.ok, pts, src }); App.rec(t.topic, r.ok ? 1 : 0); if (!r.ok) weak.add(t.topic); }
      const gitOk = gitSeq.length === 4 && gitSeq.every((g, k) => gitPool[g] === GIT[k]); if (!gitOk) weak.add("git"); App.rec("git", gitOk ? 1 : 0);
      const bSum = bRes.reduce((s, r) => s + r.pts, 0) + (gitOk ? 7 : 0), total = a + bSum; S().exams.push({ ts: Date.now(), course: "dasc", total, max: 45, weak: [...weak] }); App.addXP(20 + Math.round(total / 45 * 30), "exam"); App.save();
      el.innerHTML = `<div class="page"><h1>Ergebnis · ${total} / 45</h1><div class="grid g3"><div class="card stat"><b>${Math.round(100 * total / 45)} %</b><span>gesamt</span></div><div class="card stat"><b>${a} / 10</b><span>Teil A</span></div><div class="card stat"><b>${bSum} / 35</b><span>Teil B</span></div></div>
        ${weak.size ? `<div class="card col"><h3>Schwachstellen</h3>${[...weak].map(t => `<div class="spread"><div>${esc(TOPICS[t].name)}</div><div class="row"><button class="btn sm" data-go="lesson" data-p="${TOPICS[t].lesson}">Lektion</button><button class="btn sm" data-go="quiz" data-p="topic:${t}">Quiz</button></div></div>`).join("")}</div>` : ""}
        <h2>Teil A</h2><div class="col" style="gap:12px">${qs.map((q, k) => `<div class="card col" id="rv-${k}">${App.questionHTML(q, "rv")}</div>`).join("")}</div>
        <h2>Teil B</h2>${bRes.map((r, k) => `<div class="card col"><div class="spread"><h3>B${k + 1} · ${esc(r.t.title)}</h3><span class="chip ${r.ok ? "acc" : "bad"} tab">${r.pts} / ${r.x.pts}</span></div><details><summary class="muted" style="cursor:pointer">Dein Code & Referenzlösung</summary><div class="grid g2" style="margin-top:10px"><div class="codeq">${esc(r.src)}</div><div class="codeq">${esc(r.t.solution)}</div></div></details></div>`).join("")}
        <div class="card col"><div class="spread"><h3>B5 · Git</h3><span class="chip ${gitOk ? "acc" : "bad"} tab">${gitOk ? 7 : 0} / 7</span></div><div class="codeq">${esc(GIT.join("\n"))}</div></div><div class="row"><button class="btn pri" data-go="exam">Neuer Durchlauf</button></div></div>`;
      qs.forEach((q, k) => { const box = $("#rv-" + k, el); if (answers[k] !== undefined) App.reveal(box, q, answers[k]); else { $$(".opt", box).forEach((o, i) => { o.disabled = true; if (i === App.norm(q).a) o.classList.add("reveal"); }); $(".fb", box).innerHTML = `<div class="why bad"><b>Nicht beantwortet.</b><div>${q.why}</div></div>`; } }); window.scrollTo({ top: 0 }); };
    $("#ex-submit", el).onclick = () => submit(false); $("#ex-submit2", el).onclick = () => submit(false);
  };
  setup();
}

/* ================= Statistics ================= */
const lineChart = (vals, labels, opt = {}) => {
  const W = 360, H = 170, pad = 30, max = opt.max ?? Math.max(1, ...vals), n = vals.length, X = i => pad + (n <= 1 ? (W - pad - 10) / 2 : i * (W - pad - 10) / (n - 1)), Y = v => H - 24 - v / max * (H - 44), pts = vals.map((v, i) => [X(i), Y(v)]);
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" style="width:100%" role="img" aria-label="${esc(opt.label || "Diagramm")}">${[0, .5, 1].map(f => `<line class="gridl" x1="${pad}" x2="${W - 8}" y1="${Y(max * f)}" y2="${Y(max * f)}"/><text x="${pad - 5}" y="${Y(max * f) + 4}" text-anchor="end">${Math.round(max * f)}${opt.unit || ""}</text>`).join("")}
    ${opt.bars ? vals.map((v, i) => `<rect x="${X(i) - 7}" y="${Y(v)}" width="14" height="${H - 24 - Y(v)}" rx="3" fill="var(--acc)" fill-opacity="${i === n - 1 ? 1 : .55}"><title>${labels[i]}: ${v}</title></rect>`).join("") : n ? `<path d="M${pts.map(p => p.join(" ")).join("L")}" fill="none" stroke="var(--acc)" stroke-width="2"/>${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="${i === n - 1 ? 4 : 2.5}" fill="var(--acc)"><title>${labels[i]}: ${vals[i]}</title></circle>`).join("")}` : ""}
    ${labels.map((l, i) => (n <= 8 || i % Math.ceil(n / 7) === 0 || i === n - 1) ? `<text x="${X(i)}" y="${H - 6}" text-anchor="middle">${esc(l)}</text>` : "").join("")}</svg>`;
};
const radar = groups => { const R = 90, cx = 150, cy = 120, n = groups.length, P = (i, r) => [cx + r * Math.sin(2 * Math.PI * i / n), cy - r * Math.cos(2 * Math.PI * i / n)];
  return `<svg viewBox="0 0 300 245" class="chart" style="width:100%;max-width:380px;margin:0 auto;display:block">${[.25, .5, .75, 1].map(f => `<polygon points="${groups.map((_, i) => P(i, R * f).join(",")).join(" ")}" fill="none" stroke="var(--line)"/>`).join("")}${groups.map((_, i) => `<line x1="${cx}" y1="${cy}" x2="${P(i, R)[0]}" y2="${P(i, R)[1]}" stroke="var(--line)"/>`).join("")}<polygon points="${groups.map((g, i) => P(i, Math.max(3, R * g[1] / 100)).join(",")).join(" ")}" fill="var(--acc)" fill-opacity=".22" stroke="var(--acc)" stroke-width="2"/>${groups.map((g, i) => { const [x, y] = P(i, R + 16); return `<text x="${x}" y="${y + 4}" text-anchor="${x < cx - 5 ? "end" : x > cx + 5 ? "start" : "middle"}">${esc(g[0])} ${g[1]}%</text>`; }).join("")}</svg>`; };
PAGES.stats = el => {
  const s = S(), days = Object.values(s.days), sum = k => days.reduce((a, d) => a + (d[k] || 0), 0), c = cur();
  const last14 = []; for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = App.dkey(d); const mh = s.masteryHist[k]; last14.push([d.toLocaleDateString("de-AT", { day: "numeric", month: "numeric" }), Math.round(((s.days[k] || {}).sec || 0) / 60), mh && typeof mh === "object" ? mh[c.id] : null]); }
  let prev = null; const ms = last14.map(x => { if (x[2] != null) prev = x[2]; return prev ?? 0; }), qh = s.quizHist.slice(-15);
  const groups = COURSES.length >= 3 ? COURSES.map(x => [x.title, App.courseMastery(x.id)]) : [];
  const cg = c.worlds.filter(w => w.lessons.length).map(w => { const ts = [...new Set(w.lessons.map(l => l.topic))]; return [w.title.split(" ")[0], Math.round(ts.reduce((a, t) => a + App.mastery(t), 0) / ts.length)]; });
  el.innerHTML = `<div class="page"><div><h1>Statistik</h1><p class="muted" style="margin-top:6px">Alles aus deinen eigenen Antworten und Lernzeiten.</p></div>
   <div class="grid g4">${[[App.fmtMin(sum("sec")), "Lernzeit gesamt"], [App.LESSONS.filter(l => App.isDone(l.id)).length + " / " + App.LESSONS.length, "Lektionen"], [sum("q"), "Antworten"], [sum("q") ? Math.round(100 * sum("qc") / sum("q")) + " %" : "–", "Trefferquote"], [sum("cards"), "Karten wiederholt"], [Object.values(s.py).filter(p => p.solved).length, "Code-Aufgaben"], [App.streak() + " / " + App.longestStreak(), "Serie / Rekord"], [s.xp.toLocaleString("de-AT"), "XP"]].map(([v, l]) => `<div class="card stat"><b>${v}</b><span>${l}</span></div>`).join("")}</div>
   <div class="grid g2"><div class="card col"><h3>Lernzeit pro Tag</h3><small class="muted">letzte 14 Tage, Minuten</small>${lineChart(last14.map(x => x[1]), last14.map(x => x[0]), { bars: true })}</div>
    <div class="card col"><h3>Kurs-Mastery</h3>${groups.length ? radar(groups) : ""}</div>
    <div class="card col"><h3>Quiz-Trefferquote</h3>${qh.length ? lineChart(qh.map(h => Math.round(100 * h.c / Math.max(1, h.n))), qh.map(h => new Date(h.ts).toLocaleDateString("de-AT", { day: "numeric", month: "numeric" })), { max: 100, unit: "%" }) : `<div class="empty">Spiel ein Quiz, um die Kurve zu sehen.</div>`}</div>
    <div class="card col"><h3>${esc(c.title)}: Mastery-Verlauf</h3>${lineChart(ms, last14.map(x => x[0]), { max: 100, unit: "%" })}</div></div>
   <div class="card col"><div class="spread"><h3>${esc(c.title)} · Themen</h3>${courseChips(c.id)}</div>${cg.length >= 3 ? radar(cg) : ""}<div class="grid g2" style="gap:10px 24px">${Object.keys(TOPICS).filter(t => TOPICS[t].course === c.id).map(t => { const m = App.mastery(t); return `<div class="col" style="gap:4px"><div class="spread"><button class="btn ghost sm" style="padding:0" data-go="lesson" data-p="${TOPICS[t].lesson}">${esc(TOPICS[t].name)}</button><span class="row" style="gap:8px">${App.mBadge(m)}<span class="tab">${m} %</span></span></div>${App.bar(m, "thin", c.color)}</div>`; }).join("")}</div></div></div>`;
  switchCourse(el);
};

/* ================= Resources ================= */
PAGES.resources = el => {
  const c = cur(), s = S();
  const link = r => `<div class="spread" style="padding:8px 0;border-bottom:1px solid var(--line)"><div style="min-width:0">${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a>` : esc(r.title)}${r.note ? `<div><small>${esc(r.note)}</small></div>` : ""}</div>${r.personal ? `<span class="chip">&lt;fhj-username&gt; ersetzen</span>` : ""}</div>`;
  let sections = [], books = [];
  if (c.id === "dasc") { const R = c.resources; sections = [["Kurslinks", R.course], ["Git & SSH", R.git], ["Python", R.python], ["Unterlagen", R.lectures]]; books = R.books; }
  else if (c.resources) { sections = (c.resources.sections || []).map(x => [x.title, x.items]); books = c.resources.books || []; }
  const notes = Object.entries(s.notes).filter(([id, n]) => n.text && n.text.trim() && App.LBYID[id] && App.LBYID[id].course === c.id);
  el.innerHTML = `<div class="page"><div><h1>Ressourcen · ${esc(c.title)}</h1></div>${courseChips(c.id)}
   <div class="grid g2">${sections.map(([t, items]) => `<div class="card col" style="gap:4px"><h3>${esc(t)}</h3>${(items || []).map(link).join("")}</div>`).join("")}</div>
   ${books.length ? `<div class="card col"><h3>Literatur</h3><div class="grid g2" style="gap:10px 24px">${books.map(b => `<div class="spread" style="align-items:flex-start"><div><div>${b.url ? `<a href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.title)}</a>` : esc(b.title)}</div><small>${esc(b.author)}</small></div><span class="chip">${esc(b.tag)}</span></div>`).join("")}</div></div>` : ""}
   <div class="card col"><h3>Meine Notizen</h3>${notes.length ? notes.map(([id, n]) => `<div class="col" style="gap:6px;padding:10px 0;border-bottom:1px solid var(--line)"><div class="spread"><button class="btn ghost sm" style="padding:0" data-go="lesson" data-p="${id}">${esc(App.LBYID[id].title)}</button><div class="row" style="gap:4px">${(n.tags || []).map(t => `<span class="chip">${t === "exam" ? "⭐ Prüfung" : esc(t)}</span>`).join("")}</div></div><div class="codeq" style="white-space:pre-wrap">${esc(n.text)}</div></div>`).join("") : `<p class="muted">Notizen aus den Lektionen erscheinen hier.</p>`}</div>
   <div class="card col" id="imp"></div></div>`;
  switchCourse(el); importer($("#imp", el), c);
};
function importer(box, c) {
  let file = null, text = "", sugg = [];
  const draw = () => {
    box.innerHTML = `<div class="spread"><h3>Material importieren</h3><small class="muted">PDF, Markdown, TXT, Bilder</small></div>
     <div class="grid g2" style="align-items:end"><label class="fld">Datei<input type="file" id="imf" accept=".pdf,.md,.txt,.png,.jpg,.jpeg,.webp"></label><label class="fld">Welt<select id="imw">${c.worlds.map(w => `<option value="${w.id}">Welt ${w.n} · ${esc(w.title)}</option>`).join("")}</select></label></div>
     <label class="fld">Text für Karteikarten-Vorschläge (Zeilen wie „Begriff: Definition“)<textarea rows="4" id="imt">${esc(text)}</textarea></label>
     <div class="row"><button class="btn sm" id="imsave" ${file ? "" : "disabled"}>In Bibliothek speichern</button><button class="btn pri sm" id="imx">Karten vorschlagen</button></div>
     ${sugg.length ? `<div class="col" style="gap:8px"><span class="eyebrow">Vorschläge · erst nach Bestätigung gespeichert</span>${sugg.map((x, i) => `<div class="sug"><div><b>${esc(x.front)}</b><div><small>${esc(x.back)}</small></div></div><div class="row" style="gap:6px"><button class="btn sm pri" data-ok="${i}">Übernehmen</button><button class="btn sm ghost" data-no="${i}">Verwerfen</button></div></div>`).join("")}</div>` : ""}
     ${S().imports.filter(x => x.course === c.id).map(im => `<div class="spread"><span>${esc(im.name)}</span><small class="muted">${new Date(im.ts).toLocaleDateString("de-AT")}</small></div>`).join("")}`;
    $("#imf", box).onchange = async e => { file = e.target.files[0]; if (file && /\.(md|txt)$/i.test(file.name)) text = (await file.text()).slice(0, 20000); draw(); };
    $("#imt", box).oninput = e => text = e.target.value;
    $("#imsave", box).onclick = () => { S().imports.push({ id: "i" + Date.now(), course: c.id, name: file.name, size: file.size, world: $("#imw", box).value, ts: Date.now(), text: text.slice(0, 6000) }); App.save(); App.toast("Gespeichert", file.name, "⎘"); draw(); };
    $("#imx", box).onclick = () => { sugg = text.split(/\n/).map(l => l.replace(/^[\s•*\-–>]+/, "").trim()).map(l => l.match(/^\**([A-Za-zÄÖÜäöüß0-9 ()\-\/]{3,48}?)\**\s*[:–—=]\s+(.{8,240})$/)).filter(Boolean).slice(0, 12).map(m => ({ front: m[1].trim(), back: m[2].trim() })); if (!sugg.length) App.toast("Keine Definitionen gefunden", "Nutze Zeilen wie „Begriff: Erklärung“.", "!"); draw(); };
    box.onclick = e => { const ok = e.target.closest("[data-ok]"), no = e.target.closest("[data-no]"); if (ok) { const x = sugg[+ok.dataset.ok], t = Object.keys(TOPICS).find(k => TOPICS[k].course === c.id); S().customCards.push({ id: "c" + Date.now() + ok.dataset.ok, cat: "Import", course: c.id, topic: t, front: x.front, back: x.back }); App.save(); sugg.splice(+ok.dataset.ok, 1); draw(); } if (no) { sugg.splice(+no.dataset.no, 1); draw(); } };
  };
  draw();
}

/* ================= Bookmarks ================= */
PAGES.bookmarks = el => {
  const bm = S().bookmarks, LBL = { lesson: "Lektionen", card: "Karteikarten", question: "Fragen", exercise: "Übungen" };
  const go = b => b.kind === "lesson" ? `data-go="lesson" data-p="${esc(b.ref)}"` : b.kind === "exercise" ? `data-go="practice" data-p="${esc(b.ref)}"` : b.kind === "card" ? `data-go="flash"` : "";
  el.innerHTML = `<div class="page"><div><h1>Lesezeichen</h1></div>${bm.length ? Object.keys(LBL).filter(k => bm.some(b => b.kind === k)).map(k => `<div class="card col"><h3>${LBL[k]}</h3>${bm.filter(b => b.kind === k).map(b => { const q = k === "question" ? QUESTIONS.concat(BOSSQ).find(x => x.id === b.id) : null; const cd = k === "card" ? App.FLASH.concat(S().customCards).find(x => x.id === b.id) : null;
    return `<div class="spread" style="padding:8px 0;border-bottom:1px solid var(--line)"><div style="min-width:0;flex:1">${go(b) ? `<button class="btn ghost sm" style="padding:0;white-space:normal;text-align:left" ${go(b)}>${esc(b.title)}</button>` : `<div>${esc(b.title)}</div>`}${q ? `<small>Antwort: ${App.norm(q).opts[q.a]} · ${q.why}</small>` : cd ? `<small>${esc(cd.back)}</small>` : ""}</div><button class="btn ghost sm" data-rm="${esc(k)}|${esc(b.id)}">Entfernen</button></div>`; }).join("")}</div>`).join("") : `<div class="empty">Noch keine Lesezeichen. Nutze ☆ Merken bei Lektionen, Karten, Fragen und Übungen.</div>`}</div>`;
  $$("[data-rm]", el).forEach(b => b.onclick = () => { const [k, id] = b.dataset.rm.split("|"); App.toggleBm(k, id); App.render(); });
};

/* ================= Profile ================= */
PAGES.profile = el => {
  const s = S(), L = App.levelOf(s.xp), lo = App.xpFor(L), hi = App.xpFor(L + 1);
  el.innerHTML = `<div class="page"><div class="card row" style="gap:20px"><div class="avatar" style="width:64px;height:64px;font-size:26px">${esc((s.name || "?")[0].toUpperCase())}</div>
    <div class="col" style="gap:6px;flex:1;min-width:220px"><h1>${esc(s.name)}</h1><small>Wirtschaftsinformatik · FH JOANNEUM · WINF 2025</small>${App.bar(100 * (s.xp - lo) / (hi - lo))}<small class="tab">Level ${L} · ${s.xp} XP · noch ${hi - s.xp} XP bis Level ${L + 1}</small></div>
    <div class="row" style="gap:24px"><div class="stat"><b>${App.streak()}</b><span>Serie</span></div><div class="stat"><b>${App.longestStreak()}</b><span>Rekord</span></div></div></div>
   <div class="grid g4">${COURSES.map(c => `<div class="card stat" style="border-top:3px solid ${c.color}"><b>${App.courseMastery(c.id)} %</b><span>${esc(c.title)} · Mastery</span></div>`).join("")}</div>
   <div class="col"><h2>Erfolge <small class="muted tab">${Object.keys(s.ach).length} / ${App.ACH.length}</small></h2><div class="ach-grid">${App.ACH.map(a => `<div class="card ach ${s.ach[a.id] ? "got" : ""}"><div class="ai">${a.icon}</div><div><b>${esc(a.name)}</b><div><small>${esc(a.desc)}</small></div>${s.ach[a.id] ? `<small class="faint">${new Date(s.ach[a.id]).toLocaleDateString("de-AT")}</small>` : ""}</div></div>`).join("")}</div></div></div>`;
};
})();
