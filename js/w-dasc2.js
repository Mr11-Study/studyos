/* StudyOS widgets, part 2: data, models, code */
(function () {
const { $, $$, esc, shuffle, clamp, D } = App;
const W = App.W; const head = App.whead; const done = App.wdone; const S = () => App.S();

/* ---------------- dataset ---------------- */
const STUDENTS = { cols: ["student", "hours", "attendance", "previous_grade", "exam_score"], rows: [
  ["Anna", 2, 60, 3, 52], ["Ben", 3, 75, 3, 58], ["Clara", 4, null, 2, 63], ["David", 5, 80, 4, 60], ["Emma", 6, 90, 2, 76], ["Felix", 7, 70, 3, 79],
  ["Greta", 8, 95, 1, 86], ["Hannes", 1, 50, 4, 45], ["Ida", 6, null, 2, null], ["Jonas", 9, 85, 3, 84], ["Klara", 4, 65, 2, 66], ["Lukas", 7, 88, 1, 82]] };
App.STUDENTS = STUDENTS;
const col = name => STUDENTS.rows.map(r => r[STUDENTS.cols.indexOf(name)]);
const nn = a => a.filter(v => v !== null && v !== undefined);
const mean = a => { a = nn(a); return a.reduce((s, v) => s + v, 0) / a.length; };
const median = a => { a = nn(a).slice().sort((x, y) => x - y); const m = Math.floor(a.length / 2); return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
const pearson = (x, y) => { const p = x.map((v, i) => [v, y[i]]).filter(([a, b]) => a != null && b != null); const mx = mean(p.map(q => q[0])), my = mean(p.map(q => q[1])); let sxy = 0, sxx = 0, syy = 0; p.forEach(([a, b]) => { sxy += (a - mx) * (b - my); sxx += (a - mx) ** 2; syy += (b - my) ** 2; }); return sxy / Math.sqrt(sxx * syy); };
Object.assign(App, { mean, median, pearson });
/* derive the simulated outputs of pandas tasks from the dataset so they stay truthful */
(function () {
  const busy = STUDENTS.rows.filter(r => r[1] > 5).map(r => r[4]);
  if (!D.PY_TASKS.filter || !D.PY_TASKS.missing) return;
  D.PY_TASKS.filter.out = String(Math.round(mean(busy) * 10000) / 10000);
  const miss = STUDENTS.cols.map((c, i) => c.padEnd(16) + STUDENTS.rows.filter(r => r[i] === null).length);
  D.PY_TASKS.missing.out = miss.join("\n") + "\ndtype: int64";
})();

/* ---------------- Python runner ---------------- */
App.py = {
  ready: () => !!(window.Sk && window.Sk.importMainWithBody),
  async run(code) {
    if (!App.py.ready()) throw new Error("no-runtime");
    let out = "";
    window.Sk.configure({ output: t => { out += t; }, read: x => { if (!window.Sk.builtinFiles || !window.Sk.builtinFiles.files[x]) throw "File not found: '" + x + "'"; return window.Sk.builtinFiles.files[x]; }, __future__: window.Sk.python3, execLimit: 4000 });
    try { await window.Sk.misceval.asyncToPromise(() => window.Sk.importMainWithBody("<stdin>", false, code, true)); return { out, err: null }; }
    catch (e) { return { out, err: String(e.toString ? e.toString() : e).replace(/on line (\d+)/, (m, n) => "on line " + n) }; }
  }
};
/* Grade a task: real execution when possible, static checks for simulated libraries. */
App.gradeTask = async function (t, code) {
  const usesLibs = /\bimport\s+(numpy|pandas|matplotlib|sklearn)|\bfrom\s+(numpy|pandas|sklearn)/.test(code);
  if (!t.simulated && !usesLibs && App.py.ready() && t.test) {
    const r = await App.py.run(code + "\n" + t.test);
    const ok = !r.err && r.out.includes("__OK__");
    return { ok, out: r.out.replace(/__OK__\n?/g, ""), err: r.err && !/AssertionError/.test(r.err) ? r.err : null, real: true, assertFail: r.err && /AssertionError/.test(r.err) };
  }
  const ok = t.rx.every(rx => rx.test(code.replace(/\r/g, "")));
  return { ok, out: ok ? t.out : "", err: null, real: false };
};

/* ---------------- Lab (editor) ---------------- */
W.lab = (el, b) => {
  const ids = b.tasks || Object.keys(D.PY_TASKS); let cur = b.start && ids.includes(b.start) ? b.start : ids.find(id => !(S().py[id] && S().py[id].solved)) || ids[0];
  const hints = {}; const sol = {};
  const draw = () => {
    const t = D.PY_TASKS[cur]; const ps = S().py[cur] || {}; const code = ps.code ?? t.starter; const h = hints[cur] || 0;
    el.innerHTML = `<div class="w">${head("Python lab", "Code", `<small class="muted">${App.py.ready() ? "Python runs in your browser" : "Loading Python…"}</small>`)}
      <div class="editor">
        <div class="ed-left"><div class="spread"><h3>${esc(t.title)}</h3>${ps.solved ? `<span class="chip acc">Solved</span>` : `<span class="chip tab">+${t.xp} XP</span>`}</div>
          <div>${t.prompt}</div>
          ${t.simulated ? `<small class="muted">Uses NumPy/pandas, which don’t run in the browser. Your code is checked for the right calls and the output is simulated from the course dataset. Run it for real with <code>uv run</code>.</small>` : ""}
          ${h ? `<div class="col" style="gap:8px">${t.hints.slice(0, h).map((x, i) => `<div class="hint"><b>Hint ${i + 1}</b>${i === 2 ? `<pre>${esc(x)}</pre>` : `<div>${esc(x)}</div>`}</div>`).join("")}</div>` : ""}
          ${sol[cur] === 1 ? `<div class="confirm" style="background:var(--warn-soft);border-color:rgba(242,184,75,.3)">Show the full solution? You’ll get fewer XP for this task.<button class="btn sm" id="sol-yes">Show solution</button><button class="btn ghost sm" id="sol-no">Keep trying</button></div>` : ""}
          ${sol[cur] === 2 ? `<div class="hint"><b>Solution</b><pre>${esc(t.solution)}</pre></div>` : ""}
          <div class="row" style="margin-top:auto">${App.bmBtn("exercise", cur, "Python: " + t.title, cur)}</div>
        </div>
        <div class="ed-right">
          ${ids.length > 1 ? `<div class="ed-tabs">${ids.map(id => `<button data-t="${id}" class="${id === cur ? "on" : ""} ${S().py[id] && S().py[id].solved ? "solved" : ""}">${D.PY_TASKS[id].title}</button>`).join("")}</div>` : ""}
          <textarea class="code" id="code-${cur}" spellcheck="false" autocapitalize="off" aria-label="Python code">${esc(code)}</textarea>
          <div class="ed-actions"><button class="btn pri sm" id="run">▶ Run &amp; check</button><button class="btn sm" id="hint" ${h >= 3 ? "disabled" : ""}>Hint ${h < 3 ? "(" + (h + 1) + "/3)" : ""}</button><button class="btn sm" id="showsol" ${h < 3 || sol[cur] ? "hidden" : ""}>Solution…</button><button class="btn ghost sm" id="reset">Reset</button></div>
          <div class="ed-out" id="out"><span class="faint">Output appears here.</span></div>
        </div></div></div>`;
    const ta = $("textarea", el);
    ta.onkeydown = e => { if (e.key === "Tab") { e.preventDefault(); const s = ta.selectionStart; ta.value = ta.value.slice(0, s) + "    " + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = s + 4; } if ((e.metaKey || e.ctrlKey) && e.key === "Enter") $("#run", el).click(); };
    let tm; ta.oninput = () => { const p = S().py[cur] || (S().py[cur] = {}); p.code = ta.value; clearTimeout(tm); tm = setTimeout(App.save, 800); };
    $("#hint", el).onclick = () => { hints[cur] = Math.min(3, h + 1); const p = S().py[cur] || (S().py[cur] = {}); p.hints = Math.max(p.hints || 0, hints[cur]); App.save(); draw(); };
    const ss = $("#showsol", el); if (ss) ss.onclick = () => { sol[cur] = 1; draw(); };
    const sy = $("#sol-yes", el); if (sy) sy.onclick = () => { sol[cur] = 2; const p = S().py[cur] || (S().py[cur] = {}); p.sawSolution = true; App.save(); draw(); };
    const sn = $("#sol-no", el); if (sn) sn.onclick = () => { sol[cur] = 0; draw(); };
    $("#reset", el).onclick = () => { const p = S().py[cur] || (S().py[cur] = {}); p.code = t.starter; App.save(); draw(); };
    $("#run", el).onclick = async () => {
      const out = $("#out", el); out.innerHTML = `<span class="faint">Running…</span>`;
      const r = await App.gradeTask(t, ta.value);
      const p = S().py[cur] || (S().py[cur] = {}); p.code = ta.value; p.attempts = (p.attempts || 0) + 1;
      let html = "";
      if (r.out) html += esc(r.out.replace(/\n$/, "")) + "\n";
      if (r.err) html += `<span class="err">${esc(r.err)}</span>\n`;
      if (!r.real && r.ok) html = `<span class="sim">[simulated output]</span>\n` + html;
      if (r.ok) {
        html += `<span class="ok">✓ Correct${r.real ? " — tests passed" : ""}.</span>`;
        const first = !p.solved; p.solved = true; S().widgets.pySolves = (S().widgets.pySolves || 0) + (first ? 1 : 0);
        const penalty = p.sawSolution ? 0.3 : 1 - 0.15 * (p.hints || 0);
        App.rec(t.topic, clamp(penalty, 0.3, 1));
        if (first) { App.addXP(p.sawSolution ? 10 : t.xp, "code", $("#run", el)); App.unlock("pyrookie"); App.checkAch(); }
      } else {
        html += r.assertFail ? `<span class="err">✗ Runs, but the result isn’t right yet. Check the value you compute.</span>` : r.err ? "" : `<span class="err">✗ Not there yet.${r.real ? "" : " The check looks for the key expressions of the task."} Try a hint.</span>`;
        App.rec(t.topic, 0);
      }
      App.save(); out.innerHTML = html;
      $$(".ed-tabs button", el).forEach(x => x.classList.toggle("solved", !!(S().py[x.dataset.t] && S().py[x.dataset.t].solved)));
    };
  };
  el.onclick = e => { const tb = e.target.closest("[data-t]"); if (tb && tb.closest(".ed-tabs")) { cur = tb.dataset.t; draw(); } };
  draw();
  if (!App.py.ready()) { let n = 0; const iv = setInterval(() => { n++; if (App.py.ready() || n > 40) { clearInterval(iv); const s = $(".w-head small", el); if (s) s.textContent = App.py.ready() ? "Python runs in your browser" : "Checks run without executing"; } }, 500); }
};

/* ---------------- Dataset explorer ---------------- */
W.explorer = (el, b) => {
  const num = ["hours", "attendance", "previous_grade", "exam_score"];
  let view = "table", hcol = "exam_score", sx = "hours", actions = new Set(), qa = null;
  const fmt = v => v === null ? "NaN" : typeof v !== "number" || Number.isInteger(v) ? esc(v) : v.toFixed(2);
  const table = hl => `<div class="table-wrap"><table class="dt"><thead><tr>${STUDENTS.cols.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${STUDENTS.rows.map(r => `<tr class="${hl && hl(r) ? "hl" : ""}">${r.map(v => `<td class="${v === null ? "na" : ""}">${fmt(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  const stats = f => `<div class="table-wrap"><table class="dt"><thead><tr><th>column</th><th>${f === mean ? "mean" : "median"}</th></tr></thead><tbody>${num.map(c => `<tr><td>${c}</td><td>${f(col(c)).toFixed(2)}</td></tr>`).join("")}</tbody></table></div>`;
  const hist = c => { const v = nn(col(c)); const lo = Math.min(...v), hi = Math.max(...v); const bins = 5, w = (hi - lo) / bins || 1; const cnt = Array(bins).fill(0); v.forEach(x => cnt[Math.min(bins - 1, Math.floor((x - lo) / w))]++); const mx = Math.max(...cnt);
    return `<svg viewBox="0 0 360 180" class="chart" style="width:100%;max-width:460px" role="img" aria-label="Histogram of ${c}">${[0, 1, 2, 3].map(g => `<line class="gridl" x1="36" x2="350" y1="${150 - g * 40}" y2="${150 - g * 40}"/>`).join("")}${cnt.map((n, i) => `<rect x="${40 + i * 62}" y="${150 - n / mx * 120}" width="56" height="${n / mx * 120}" rx="3" fill="var(--acc)" fill-opacity=".8"/><text x="${68 + i * 62}" y="${145 - n / mx * 120}" text-anchor="middle">${n}</text><text x="${68 + i * 62}" y="166" text-anchor="middle">${(lo + i * w).toFixed(0)}–${(lo + (i + 1) * w).toFixed(0)}</text>`).join("")}<text x="195" y="179" text-anchor="middle">${c}</text></svg>`; };
  const scatter = (x) => { const p = STUDENTS.rows.map(r => [r[STUDENTS.cols.indexOf(x)], r[4]]).filter(([a, c]) => a != null && c != null); const xs = p.map(q => q[0]), ys = p.map(q => q[1]); const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = 40, y1 = 90;
    const X = v => 44 + (v - x0) / (x1 - x0 || 1) * 300, Y = v => 150 - (v - y0) / (y1 - y0) * 130;
    return `<svg viewBox="0 0 360 185" class="chart" style="width:100%;max-width:460px" role="img" aria-label="Scatter plot">${[40, 50, 60, 70, 80, 90].map(v => `<line class="gridl" x1="40" x2="350" y1="${Y(v)}" y2="${Y(v)}"/><text x="34" y="${Y(v) + 4}" text-anchor="end">${v}</text>`).join("")}${p.map(([a, c]) => `<circle cx="${X(a)}" cy="${Y(c)}" r="4.5" fill="var(--info)" fill-opacity=".85"/>`).join("")}<text x="195" y="180" text-anchor="middle">${x} →</text><text x="12" y="16">exam_score</text></svg>`; };
  const corr = () => `<div class="table-wrap"><table class="dt"><thead><tr><th>variable</th><th>r with exam_score</th><th></th></tr></thead><tbody>${num.slice(0, 3).map(c => { const r = pearson(col(c), col("exam_score")); return `<tr><td>${c}</td><td>${r.toFixed(2)}</td><td style="width:40%"><div class="bar thin"><i style="width:${Math.abs(r) * 100}%;background:${r < 0 ? "var(--warn)" : "var(--acc)"}"></i></div></td></tr>`; }).join("")}</tbody></table></div><small class="muted">previous_grade uses the Austrian scale (1 = best), so a negative r means better previous grades go with higher scores.</small>`;
  const code = { table: "df.head(12)", info: "df.info()", mean: "df.mean(numeric_only=True)", median: "df.median(numeric_only=True)", missing: "df.isna().sum()", hist: `df["${hcol}"].hist(bins=5)`, scatter: `df.plot.scatter(x="${sx}", y="exam_score")`, corr: `df.corr(numeric_only=True)["exam_score"]` };
  const body = () => {
    if (view === "table") return table();
    if (view === "info") return `<div class="codeq">&lt;class 'pandas.core.frame.DataFrame'&gt;\nRangeIndex: 12 entries, 0 to 11\n #  Column          Non-Null Count  Dtype\n 0  student         12 non-null     object\n 1  hours           12 non-null     int64\n 2  attendance      10 non-null     float64\n 3  previous_grade  12 non-null     int64\n 4  exam_score      11 non-null     float64</div>`;
    if (view === "mean") return stats(mean);
    if (view === "median") return stats(median);
    if (view === "missing") return `<div class="codeq">${esc(D.PY_TASKS.missing.out)}</div>` + table(r => r.includes(null));
    if (view === "hist") return `<div class="row">${num.map(c => `<button class="chip ${c === hcol ? "on" : ""}" data-h="${c}">${c}</button>`).join("")}</div>` + hist(hcol);
    if (view === "scatter") return `<div class="row">${num.slice(0, 3).map(c => `<button class="chip ${c === sx ? "on" : ""}" data-x="${c}">${c}</button>`).join("")}</div>` + scatter(sx);
    if (view === "corr") return corr();
  };
  const Q = { q: "Which variable appears to have the strongest relationship with exam_score?", opts: ["hours", "attendance", "previous_grade", "student"], a: 0, why: `hours has the largest absolute correlation (r = ${pearson(col("hours"), col("exam_score")).toFixed(2)}), and the scatter plot shows an almost linear trend.`, ex: "A strong correlation is a hint, not proof of causation." };
  const draw = () => {
    const canAnswer = actions.has("corr") || actions.has("scatter");
    el.innerHTML = `<div class="w">${head("Explore students.csv", "Dataset", `<small class="muted tab">12 rows × 5 columns</small>`)}
      <div class="row" style="gap:6px">${[["table", "Inspect"], ["info", "Info"], ["mean", "Mean"], ["median", "Median"], ["missing", "Missing values"], ["hist", "Histogram"], ["scatter", "Scatter plot"], ["corr", "Correlations"]].map(([k, t]) => `<button class="btn sm ${view === k ? "pri" : ""}" data-v="${k}">${t}</button>`).join("")}</div>
      <div class="codeq" style="padding:8px 12px">&gt;&gt;&gt; ${esc(code[view])}</div>
      <div>${body()}</div>
      <div class="divider"></div>
      <div id="xq">${canAnswer ? App.questionHTML(Q, "xq") : `<div class="check-q">${Q.q}</div><small class="muted">Explore first: open the scatter plot or the correlations to unlock the answer.</small>`}</div></div>`;
    if (qa !== null && canAnswer) App.reveal($("#xq", el), Q, qa);
  };
  el.onclick = e => {
    const v = e.target.closest("[data-v]"); if (v) { view = v.dataset.v; actions.add(view); draw(); if (actions.size >= 5 && done("explorer")) App.addXP(10, "explore", el); return; }
    const h = e.target.closest("[data-h]"); if (h) { hcol = h.dataset.h; draw(); return; }
    const x = e.target.closest("[data-x]"); if (x) { sx = x.dataset.x; draw(); return; }
    const a = e.target.closest("[data-xq]"); if (a && qa === null) { qa = +a.dataset.xq; const ok = qa === 0; App.rec(b.topic || "explore", ok ? 1 : 0); if (ok) App.addXP(5, "x", a); draw(); }
  };
  draw();
};

/* ---------------- Linear regression ---------------- */
W.linreg = (el, b) => {
  const P = [[1, 48], [2, 55], [2.5, 52], [3, 61], [4, 63], [4.5, 70], [5, 66], [6, 74], [7, 79], [7.5, 76], [8, 86], [9, 88]];
  const n = P.length, mx = P.reduce((s, p) => s + p[0], 0) / n, my = P.reduce((s, p) => s + p[1], 0) / n;
  const bm = P.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / P.reduce((s, p) => s + (p[0] - mx) ** 2, 0), bb = my - bm * mx;
  const mse = (m, c) => P.reduce((s, p) => s + (p[1] - (m * p[0] + c)) ** 2, 0) / n; const best = mse(bm, bb);
  let m = 2, c = 60, showBest = false, px = 5;
  const X = v => 46 + v / 10 * 300, Y = v => 186 - (v - 30) / 70 * 170;
  el.innerHTML = `<div class="w">${head("Fit the line", "Interactive", `<span class="chip tab" id="lr-mse"></span>`)}
    <div class="row" style="align-items:flex-start;gap:20px">
     <svg viewBox="0 0 360 215" class="chart" id="lr-svg" style="flex:1 1 320px;max-width:520px;width:100%" role="img" aria-label="Scatter of study hours vs exam score with regression line"></svg>
     <div class="col" style="flex:1 1 220px;gap:14px">
      <div class="codeq" style="font-size:15px" id="lr-eq"></div>
      <label class="fld">Slope m <input type="range" id="lr-m" min="0" max="12" step="0.1" value="${m}"></label>
      <label class="fld">Intercept b <input type="range" id="lr-b" min="20" max="80" step="0.5" value="${c}"></label>
      <label class="fld"><span id="lr-pred"></span><input type="range" id="lr-x" min="0" max="10" step="0.5" value="${px}"></label>
      <label class="row" style="gap:6px"><input type="checkbox" id="lr-best">Show least-squares line</label>
      <small class="muted">Red lines are residuals (y − ŷ). MSE is the mean of their squares. Best possible here: ${best.toFixed(1)}.</small>
      <div id="lr-fb"></div>
     </div></div></div>`;
  const upd = () => {
    const L = mse(m, c); const close = L <= best * 1.1;
    $("#lr-svg", el).innerHTML = `${[30, 50, 70, 90].map(v => `<line class="gridl" x1="46" x2="350" y1="${Y(v)}" y2="${Y(v)}"/><text x="40" y="${Y(v) + 4}" text-anchor="end">${v}</text>`).join("")}
      ${[0, 2, 4, 6, 8, 10].map(v => `<text x="${X(v)}" y="202" text-anchor="middle">${v}</text>`).join("")}<text x="198" y="214" text-anchor="middle">study hours</text><text x="50" y="12">exam score</text>
      ${P.map(([x, y]) => `<line x1="${X(x)}" x2="${X(x)}" y1="${Y(y)}" y2="${Y(clamp(m * x + c, 20, 110))}" stroke="var(--bad)" stroke-width="1.5" stroke-opacity=".75"/>`).join("")}
      ${showBest ? `<line x1="${X(0)}" y1="${Y(bb)}" x2="${X(10)}" y2="${Y(bm * 10 + bb)}" stroke="var(--muted)" stroke-dasharray="5 4"/>` : ""}
      <line x1="${X(0)}" y1="${Y(c)}" x2="${X(10)}" y2="${Y(m * 10 + c)}" stroke="var(--acc)" stroke-width="2.5"/>
      ${P.map(([x, y]) => `<circle cx="${X(x)}" cy="${Y(y)}" r="4.5" fill="var(--info)"/>`).join("")}
      <circle cx="${X(px)}" cy="${Y(clamp(m * px + c, 20, 110))}" r="5" fill="none" stroke="var(--warn)" stroke-width="2"/>`;
    $("#lr-mse", el).textContent = "MSE " + L.toFixed(1); $("#lr-mse", el).className = "chip tab " + (close ? "acc" : "");
    $("#lr-eq", el).innerHTML = `ŷ = <b style="color:var(--acc)">${m.toFixed(1)}</b>·x + <b style="color:var(--acc)">${c.toFixed(1)}</b>`;
    $("#lr-pred", el).innerHTML = `Predict for <b class="tab">${px} h</b> → ŷ = <b class="tab" style="color:var(--warn)">${(m * px + c).toFixed(1)}</b>`;
    $("#lr-fb", el).innerHTML = close ? `<div class="why"><b>Within 10% of the optimum.</b><div>You did by hand what gradient descent does automatically: adjust m and b until the loss stops decreasing.</div></div>` : "";
    if (close && !showBest && done("linreg-fit")) { App.rec(b.topic || "linreg", 1); App.addXP(15, "fit", el); App.toast("Nice fit", "MSE within 10% of the least-squares optimum.", "✓"); }
  };
  $("#lr-m", el).oninput = e => { m = +e.target.value; upd(); };
  $("#lr-b", el).oninput = e => { c = +e.target.value; upd(); };
  $("#lr-x", el).oninput = e => { px = +e.target.value; upd(); };
  $("#lr-best", el).onchange = e => { showBest = e.target.checked; upd(); };
  upd();
};

/* ---------------- Gradient descent ---------------- */
W.gd = (el, b) => {
  const K = 3, W0 = -1.5, LR = [0.001, 0.01, 0.1, 0.5, 1.0];
  const L = w => 0.5 * K * (w - 3) ** 2 + 0.5, dL = w => K * (w - 3);
  let lr = 0.1, w = W0, hist = [W0], tried = new Set(), qa = null;
  const X = v => 30 + (v + 3) / 12 * 320, Y = v => 200 - Math.min(v, 60) / 60 * 180;
  const curve = () => { let d = ""; for (let v = -3; v <= 9.001; v += 0.1) d += (d ? "L" : "M") + X(v).toFixed(1) + " " + Y(L(v)).toFixed(1); return d; };
  const status = () => { const last = hist.slice(-3).map(L); const div = Math.abs(w - 3) > 40 || !isFinite(w); if (div) return ["bad", "Diverged: the steps overshoot further every time."]; if (Math.abs(dL(w)) < 0.01) return ["ok", "Converged: the gradient is almost zero, you are at the minimum."]; if (hist.length > 2 && last[2] > last[1]) return ["warn", "Loss went up: the step jumped over the minimum (overshooting)."]; if (hist.length > 1 && hist.length > 15 && Math.abs(w - 3) > 2) return ["warn", "Very slow: tiny steps barely move."]; return ["", ""]; };
  const stepOnce = () => { w = w - lr * dL(w); if (!isFinite(w) || Math.abs(w) > 1e6) w = w > 0 ? 1e6 : -1e6; hist.push(w); };
  const draw = () => {
    const [cls, msg] = status(); const shown = clamp(w, -3, 9); const off = w !== shown;
    el.innerHTML = `<div class="w">${head("Roll down the loss valley", "Simulation", `<span class="chip tab">step ${hist.length - 1} · w = ${Math.abs(w) > 999 ? w.toExponential(1) : w.toFixed(3)} · L = ${L(w) > 9999 ? L(w).toExponential(1) : L(w).toFixed(3)}</span>`)}
      <svg viewBox="0 0 360 225" class="chart" style="width:100%;max-width:560px;margin:0 auto" role="img" aria-label="Loss curve with the current parameter">
        ${[0, 20, 40, 60].map(v => `<line class="gridl" x1="30" x2="350" y1="${Y(v)}" y2="${Y(v)}"/><text x="24" y="${Y(v) + 4}" text-anchor="end">${v}</text>`).join("")}
        ${[-3, 0, 3, 6, 9].map(v => `<text x="${X(v)}" y="216" text-anchor="middle">${v}</text>`).join("")}<text x="350" y="216" text-anchor="end">w</text><text x="34" y="14">loss L(w)</text>
        <path d="${curve()}" fill="none" stroke="var(--muted)" stroke-width="2"/>
        <line x1="${X(3)}" x2="${X(3)}" y1="${Y(0.5)}" y2="${Y(0)}" stroke="var(--acc)" stroke-dasharray="3 3"/>
        ${hist.slice(-25).map((h, i, a) => i ? `<line x1="${X(clamp(a[i - 1], -3, 9))}" y1="${Y(L(clamp(a[i - 1], -3, 9)))}" x2="${X(clamp(h, -3, 9))}" y2="${Y(L(clamp(h, -3, 9)))}" stroke="var(--warn)" stroke-width="1" stroke-opacity=".6"/>` : "").join("")}
        ${hist.slice(-25, -1).map(h => `<circle cx="${X(clamp(h, -3, 9))}" cy="${Y(L(clamp(h, -3, 9)))}" r="2.5" fill="var(--warn)" fill-opacity=".6"/>`).join("")}
        <circle cx="${X(shown)}" cy="${Y(L(shown))}" r="8" fill="${off ? "var(--bad)" : "var(--info)"}" stroke="var(--bg)" stroke-width="2"/>
        ${!off ? `<line x1="${X(shown)}" y1="${Y(L(shown))}" x2="${X(clamp(shown - Math.sign(dL(shown)) * 0.9, -3, 9))}" y2="${Y(L(shown))}" stroke="var(--acc)" stroke-width="2" marker-end="url(#gda)"/>` : ""}
        <defs><marker id="gda" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--acc)"/></marker></defs>
      </svg>
      <div class="row" style="justify-content:space-between"><div class="row" style="gap:6px"><span class="eyebrow">Learning rate η</span>${LR.map(v => `<button class="chip ${v === lr ? "on" : ""}" data-lr="${v}">${v}</button>`).join("")}</div>
        <div class="row"><button class="btn pri sm" id="gd-1">Take gradient step</button><button class="btn sm" id="gd-20">20 steps</button><button class="btn ghost sm" id="gd-r">Reset</button></div></div>
      <div class="codeq" style="font-size:12.5px">gradient = dL/dw = ${K}·(w − 3) = ${Math.abs(dL(w)) > 999 ? dL(w).toExponential(1) : dL(w).toFixed(3)}\nw_new = w − η·gradient = ${Math.abs(w) > 999 ? w.toExponential(1) : w.toFixed(3)} − ${lr}·(${Math.abs(dL(w)) > 999 ? dL(w).toExponential(1) : dL(w).toFixed(3)})</div>
      ${msg ? `<div class="why ${cls === "bad" || cls === "warn" ? "bad" : ""}"><b>${msg}</b></div>` : ""}
      <small class="muted">Try all five learning rates. Too small → slow learning. Good → convergence. Too large → overshooting or divergence. Tried: ${[...tried].sort((a, b) => a - b).join(", ") || "none yet"}.</small>
      ${tried.size >= 3 ? `<div id="gdq">${App.questionHTML({ q: "Which learning rate reached the minimum fastest <b>without</b> overshooting?", opts: ["0.001", "0.01", "0.1", "0.5", "1.0"], a: 2, why: "With η = 0.1 each step shrinks the distance to the minimum by 30% and never crosses it. η = 0.5 converges but jumps across the valley; η = 1.0 diverges." }, "gq")}</div>` : ""}</div>`;
    if (qa !== null) App.reveal($("#gdq", el), { q: "", opts: ["0.001", "0.01", "0.1", "0.5", "1.0"], a: 2, why: "With η = 0.1 each step shrinks the distance to the minimum by 30% and never crosses it. η = 0.5 converges but jumps across the valley; η = 1.0 diverges." }, qa);
    $("#gd-1", el).onclick = () => { tried.add(lr); stepOnce(); draw(); };
    $("#gd-20", el).onclick = () => { tried.add(lr); for (let i = 0; i < 20; i++) stepOnce(); draw(); };
    $("#gd-r", el).onclick = () => { w = W0; hist = [W0]; draw(); };
  };
  el.onclick = e => { const x = e.target.closest("[data-lr]"); if (x) { lr = +x.dataset.lr; w = W0; hist = [W0]; draw(); return; } const q = e.target.closest("[data-gq]"); if (q && qa === null) { qa = +q.dataset.gq; App.rec(b.topic || "gd", qa === 2 ? 1 : 0); if (qa === 2) App.addXP(10, "gd", q); draw(); } };
  draw();
};

/* ---------------- Logistic regression ---------------- */
W.logreg = (el, b) => {
  const w1 = 0.6, b0 = -2.45; const sig = z => 1 / (1 + Math.exp(-z)); const p = h => sig(w1 * h + b0);
  const D0 = [[1, 0], [1.5, 0], [2, 0], [2.5, 1], [3, 0], [3.5, 0], [4, 1], [4.5, 0], [5, 1], [5.5, 0], [6, 1], [6.5, 1], [7, 1], [8, 1], [8.5, 0], [9, 1]];
  let thr = 0.5, hh = 5;
  const X = v => 40 + v / 10 * 310, Y = v => 175 - v * 150;
  const evalT = t => { let tp = 0, tn = 0, fp = 0, fn = 0; D0.forEach(([h, y]) => { const pr = p(h) >= t ? 1 : 0; if (pr && y) tp++; else if (!pr && !y) tn++; else if (pr && !y) fp++; else fn++; }); return { tp, tn, fp, fn, acc: (tp + tn) / D0.length }; };
  const bestAcc = Math.max(...Array.from({ length: 91 }, (_, i) => evalT(0.05 + i * 0.01).acc));
  let d = ""; for (let v = 0; v <= 10.001; v += 0.1) d += (d ? "L" : "M") + X(v).toFixed(1) + " " + Y(p(v)).toFixed(1);
  el.innerHTML = `<div class="w">${head("Pass or fail?", "Interactive", `<span class="chip tab" id="lg-acc"></span>`)}
    <svg viewBox="0 0 360 205" class="chart" id="lg-svg" style="width:100%;max-width:560px;margin:0 auto" role="img" aria-label="Sigmoid curve with students and threshold"></svg>
    <div class="grid g2">
      <div class="col"><label class="fld"><span>Threshold <b class="tab" id="lg-tv"></b></span><input type="range" id="lg-t" min="0.05" max="0.95" step="0.01" value="${thr}"></label>
        <label class="fld"><span id="lg-hv"></span><input type="range" id="lg-h" min="0" max="10" step="0.5" value="${hh}"></label></div>
      <div class="col"><div class="table-wrap"><table class="dt" id="lg-cm"></table></div>
        <small class="muted">Green dots passed, red dots failed; outlined dots are misclassified. P(pass) at 2 h ≈ ${Math.round(p(2) * 100)}%, 5 h ≈ ${Math.round(p(5) * 100)}%, 8 h ≈ ${Math.round(p(8) * 100)}%.</small></div></div>
    <div id="lg-ch"></div></div>`;
  const upd = () => {
    const r = evalT(thr); const hcut = (Math.log(thr / (1 - thr)) - b0) / w1; const top = r.acc >= bestAcc - 1e-9;
    $("#lg-svg", el).innerHTML = `${[0, 0.25, 0.5, 0.75, 1].map(v => `<line class="gridl" x1="40" x2="350" y1="${Y(v)}" y2="${Y(v)}"/><text x="34" y="${Y(v) + 4}" text-anchor="end">${v}</text>`).join("")}
      ${[0, 2, 4, 6, 8, 10].map(v => `<text x="${X(v)}" y="192" text-anchor="middle">${v}</text>`).join("")}<text x="196" y="204" text-anchor="middle">study hours</text>
      ${hcut > 0 && hcut < 10 ? `<rect x="${X(hcut)}" y="${Y(1)}" width="${X(10) - X(hcut)}" height="${Y(0) - Y(1)}" fill="var(--acc)" fill-opacity=".06"/>` : ""}
      <line x1="40" x2="350" y1="${Y(thr)}" y2="${Y(thr)}" stroke="var(--warn)" stroke-dasharray="5 4" stroke-width="1.5"/><text x="348" y="${Y(thr) - 5}" text-anchor="end" style="fill:var(--warn)">threshold ${thr.toFixed(2)}</text>
      <path d="${d}" fill="none" stroke="var(--acc)" stroke-width="2.5"/>
      ${D0.map(([h, y]) => { const pr = p(h) >= thr ? 1 : 0; return `<circle cx="${X(h)}" cy="${Y(y)}" r="5.5" fill="${y ? "var(--acc)" : "var(--bad)"}" stroke="${pr === y ? "var(--bg)" : "var(--text)"}" stroke-width="${pr === y ? 1 : 2}"/>`; }).join("")}
      <line x1="${X(hh)}" x2="${X(hh)}" y1="${Y(0)}" y2="${Y(p(hh))}" stroke="var(--info)" stroke-dasharray="3 3"/><circle cx="${X(hh)}" cy="${Y(p(hh))}" r="5" fill="var(--info)"/>`;
    $("#lg-acc", el).textContent = "accuracy " + Math.round(r.acc * 100) + "%"; $("#lg-acc", el).className = "chip tab " + (top ? "acc" : "");
    $("#lg-tv", el).textContent = thr.toFixed(2);
    $("#lg-hv", el).innerHTML = `Study hours <b class="tab">${hh} h</b> → P(pass) = <b class="tab" style="color:var(--info)">${Math.round(p(hh) * 100)}%</b> → predicted <b>${p(hh) >= thr ? "pass" : "fail"}</b>`;
    $("#lg-cm", el).innerHTML = `<thead><tr><th></th><th>predicted pass</th><th>predicted fail</th></tr></thead><tbody><tr><td>passed</td><td>${r.tp}</td><td style="color:var(--bad)">${r.fn}</td></tr><tr><td>failed</td><td style="color:var(--bad)">${r.fp}</td><td>${r.tn}</td></tr></tbody>`;
    $("#lg-ch", el).innerHTML = `<div class="${top ? "why" : "hint"}"><b>Challenge:</b> find a threshold with the best possible accuracy on these ${D0.length} students (${Math.round(bestAcc * 100)}%). ${top ? "Found it." : ""}</div>`;
    if (top && done("logreg")) { App.rec(b.topic || "logreg", 1); App.addXP(15, "logreg", el); }
  };
  $("#lg-t", el).oninput = e => { thr = +e.target.value; upd(); };
  $("#lg-h", el).oninput = e => { hh = +e.target.value; upd(); };
  upd();
};
})();
