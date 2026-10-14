/* StudyOS · Quick-Test (Kurse mit exam: "quicktest", z. B. ITINF)
   Kurzer Test wie in der LV: nur Mehrfachauswahl, 5 Antworten, 1 bis 5 richtig, Teilpunkte, Auswertung erst nach Abgabe.
   Einheiten kommen aus course.quicktest.units = [{ id, title, topics: [...] }]. */
(function () {
if ((window.STUDYOS_TRACK || "uni") !== "uni") return;
const { $, $$, esc, PAGES, CBY, TOPICS, QUESTIONS, shuffle } = App;
const S = () => App.S();
const fmt = n => App.fmtNum(n, n % 1 ? 1 : 0);

const examPage = PAGES.exam;
PAGES.exam = (el, p) => { const c = CBY[S().course]; if (c && c.exam === "quicktest") return quickTest(el, c); return examPage(el, p); };

function pool(c, units) { const tp = new Set(units.flatMap(u => u.topics)); return QUESTIONS.filter(q => q.course === c.id && q.multi && tp.has(q.topic)); }
function pick(qs, n) { // gleichmäßig über die Themen verteilen
  const by = {}; shuffle(qs).forEach(q => (by[q.topic] = by[q.topic] || []).push(q)); const ks = shuffle(Object.keys(by)), out = [];
  while (out.length < n && ks.some(k => by[k].length)) ks.forEach(k => { if (out.length < n && by[k].length) out.push(by[k].pop()); });
  return shuffle(out);
}

function quickTest(el, c) {
  const U = (c.quicktest && c.quicktest.units) || [], cfg = S().settings.qt || (S().settings.qt = {});
  const sel = new Set((cfg[c.id] && cfg[c.id].units) || U.map(u => u.id)); let n = (cfg[c.id] && cfg[c.id].n) || 10, timer = !!(cfg[c.id] && cfg[c.id].timer);
  const save = () => { cfg[c.id] = { units: [...sel], n, timer }; App.save(); };
  const setup = () => {
    const units = U.filter(u => sel.has(u.id)), avail = pool(c, units).length, hist = S().exams.filter(x => x.course === c.id && x.kind === "qt").slice(-6).reverse();
    el.innerHTML = `<div class="page"><header><span class="eyebrow">${esc(c.title)}</span><h1>Quick-Test</h1><p class="muted" style="margin-top:6px;max-width:68ch">So wie die Quick-Tests in der Lehrveranstaltung: Jede Frage hat fünf Antworten, davon sind eine bis alle fünf richtig. Ausgewertet wird erst nach der Abgabe.</p></header>
      <div class="qt-rule"><b>Wertung (streng):</b> Pro Frage zählt (richtige Kreuze − falsche Kreuze) ÷ Anzahl richtiger Antworten, mindestens 0. Beispiel: 3 Antworten sind richtig, du kreuzt 2 richtige und 1 falsche an → (2 − 1) ÷ 3 = 0,33 Punkte. Nichts ankreuzen = 0.</div>
      <div class="grid g2"><div class="card col"><h3>Stoff</h3><div class="qt-chips">${U.map(u => `<button data-u="${u.id}" class="${sel.has(u.id) ? "on" : ""}">${esc(u.title)}</button>`).join("")}</div><small class="muted">${avail} Fragen im Pool</small>
        <h3 style="margin-top:8px">Umfang</h3><div class="qt-chips">${[5, 10, 20].map(k => `<button data-n="${k}" class="${n === k ? "on" : ""}">${k} Fragen</button>`).join("")}</div>
        <label class="row" style="gap:10px;cursor:pointer"><input type="checkbox" id="qt-t" ${timer ? "checked" : ""}> Mit Zeitlimit (90 Sekunden pro Frage)</label>
        <div class="row"><button class="btn pri" id="qt-go" ${avail ? "" : "disabled"}>Quick-Test starten</button></div></div>
       <div class="card col"><h3>Letzte Quick-Tests</h3>${hist.length ? hist.map(x => `<div class="spread"><div><span class="tab">${fmt(x.total)} / ${x.max} P. · ${Math.round(100 * x.total / x.max)} %</span><div><small class="muted">${esc((x.units || []).join(", "))}</small></div></div><small>${new Date(x.ts).toLocaleDateString("de-AT")}</small></div>`).join(`<div class="divider"></div>`) : `<p class="muted">Noch keiner. Fang mit 5 Fragen an, um die Wertung kennenzulernen.</p>`}</div></div></div>`;
    el.onclick = e => { const u = e.target.closest("[data-u]"); if (u) { if (sel.has(u.dataset.u)) { if (sel.size > 1) sel.delete(u.dataset.u); } else sel.add(u.dataset.u); save(); setup(); return; }
      const k = e.target.closest("[data-n]"); if (k) { n = +k.dataset.n; save(); setup(); return; }
      if (e.target.closest("#qt-go")) { el.onclick = null; run(U.filter(u => sel.has(u.id))); } };
    $("#qt-t", el).onchange = e => { timer = e.target.checked; save(); };
  };
  const run = units => {
    const qs = pick(pool(c, units), n), secs = qs.length * 90, tEnd = Date.now() + secs * 1000; let answers = {}, tmr, armed = false;
    el.innerHTML = `<div class="page"><div class="spread"><div><span class="eyebrow">Quick-Test · ${esc(units.map(u => u.title).join(", "))}</span><h1>${qs.length} Fragen · ${qs.length} Punkte</h1></div><div class="row">${timer ? `<span class="chip warn tab" id="qt-clk"></span>` : ""}<button class="btn pri" id="qt-sub">Abgeben</button></div></div>
      <div id="qt-qs"></div><div class="row"><button class="btn pri" id="qt-sub2">Abgeben</button><span class="muted" id="qt-left">${qs.length} Fragen offen</span></div></div>`;
    App.runQuiz($("#qt-qs", el), { questions: qs.map(q => Object.assign({}, q, { pts: 1 })), mode: "exam", onFinish: () => {}, onAnswer: a => { answers = a; armed = false; $("#qt-left", el).textContent = (qs.length - Object.keys(a).length) + " Fragen offen"; } });
    const tick = () => { const s = Math.max(0, Math.round((tEnd - Date.now()) / 1000)), k = $("#qt-clk", el); if (k) k.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); if (s <= 0) submit(true); };
    if (timer) { tick(); tmr = setInterval(tick, 1000); }
    App.cleanup = (old => () => { clearInterval(tmr); old && old(); })(App.cleanup);
    const submit = forced => {
      const open = qs.length - Object.keys(answers).length;
      if (!forced && open && !armed) { armed = true; $("#qt-left", el).innerHTML = `<span style="color:var(--warn)">${open} ${open === 1 ? "Frage ist" : "Fragen sind"} offen. Nochmal „Abgeben“ drücken, um trotzdem abzugeben.</span>`; return; }
      clearInterval(tmr); let total = 0; const per = qs.map((q, k) => { const sc = answers[k] === undefined ? 0 : App.scoreOf(q, answers[k]); total += sc; if (answers[k] !== undefined) App.rec(q.topic, sc); return sc; });
      total = Math.round(total * 100) / 100; const pct = Math.round(100 * total / qs.length), byU = units.map(u => { const ix = qs.map((q, k) => u.topics.includes(q.topic) ? k : -1).filter(k => k >= 0); return { u, n: ix.length, p: ix.reduce((s, k) => s + per[k], 0) }; }).filter(x => x.n);
      const weak = {}; qs.forEach((q, k) => { if (per[k] < 1) weak[q.topic] = (weak[q.topic] || 0) + 1 - per[k]; });
      S().exams.push({ ts: Date.now(), course: c.id, kind: "qt", total, max: qs.length, units: units.map(u => u.title.split(" ·")[0]), weak: Object.keys(weak) }); App.save();
      el.innerHTML = `<div class="page"><div><span class="eyebrow">Quick-Test · Ergebnis</span><h1>${esc(c.title)}</h1></div>
        <div class="grid g3"><div class="card stat"><b class="qt-score" style="color:${pct >= 50 ? "var(--acc)" : "var(--bad)"}">${fmt(total)} / ${qs.length}</b><span>${pct} % der Punkte</span></div>
          <div class="card stat"><b>${per.filter(x => x === 1).length} / ${qs.length}</b><span>Fragen ganz richtig</span></div><div class="card stat"><b>${per.filter(x => x > 0 && x < 1).length}</b><span>mit Teilpunkten</span></div></div>
        ${byU.length > 1 ? `<div class="card col"><h3>Nach Einheit</h3>${byU.map(x => `<div class="spread"><div>${esc(x.u.title)}</div><span class="tab">${fmt(Math.round(x.p * 100) / 100)} / ${x.n}</span></div>`).join("")}</div>` : ""}
        ${Object.keys(weak).length ? `<div class="card col"><h3>Hier hast du Punkte verloren</h3>${Object.entries(weak).sort((a, b) => b[1] - a[1]).map(([t, l]) => `<div class="spread"><div>${esc(TOPICS[t].name)} <small class="muted">· −${fmt(Math.round(l * 100) / 100)} P.</small></div><div class="row"><button class="btn sm ghost" data-go="lesson" data-p="${TOPICS[t].lesson}">Lesen</button><button class="btn sm" data-go="review" data-p="topic:${t}">Üben</button></div></div>`).join("")}</div>` : ""}
        <h2>Auswertung</h2><div class="col" style="gap:12px">${qs.map((q, k) => `<div class="card col" id="qtr-${k}"><div class="spread"><span class="eyebrow">Frage ${k + 1} · ${esc(TOPICS[q.topic].name)}</span><span class="chip ${per[k] === 1 ? "acc" : per[k] > 0 ? "warn" : "bad"} tab">${fmt(Math.round(per[k] * 100) / 100)} / 1 P.</span></div>${App.questionHTML(q, "qtr")}</div>`).join("")}</div>
        <div class="row"><button class="btn pri" data-go="exam">Neuer Quick-Test</button><button class="btn" data-go="review" data-p="c:${c.id}">Üben</button></div></div>`;
      qs.forEach((q, k) => { const box = $("#qtr-" + k, el); if (answers[k] !== undefined) App.reveal(box, q, answers[k]); else App.revealOpen(box, q, "Nicht beantwortet · 0 Punkte"); });
      window.scrollTo({ top: 0 });
    };
    $("#qt-sub", el).onclick = () => submit(false); $("#qt-sub2", el).onclick = () => submit(false);
  };
  setup();
}
})();
