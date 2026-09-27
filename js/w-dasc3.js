/* StudyOS widgets, part 3: ML methods, model evaluation, modeling & simulation */
(function () {
const { $, $$, esc, clamp } = App;
const W = App.W; const head = App.whead; const done = App.wdone;
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const gaussF = r => () => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const f2 = v => (Math.round(v * 100) / 100).toFixed(2), f3 = v => (Math.round(v * 1000) / 1000).toFixed(3), pct = v => isFinite(v) ? Math.round(v * 100) + "%" : "–";
const rec = (b, l, ok, fallback) => App.rec(b.topic || (l && l.topic) || fallback, ok ? 1 : 0);
const alive = el => document.body.contains(el);
/* minimal DOM morphing: re-render without replacing the slider the user is dragging */
const morph = (a, b) => {
  if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) { a.replaceWith(b); return; }
  if (a.nodeType !== 1) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
  for (const at of [...a.attributes]) if (!b.hasAttribute(at.name)) a.removeAttribute(at.name);
  for (const at of [...b.attributes]) if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value);
  if (a.nodeName === "INPUT") { if (document.activeElement !== a && a.value !== b.value) a.value = b.value; return; }
  const ac = [...a.childNodes], bc = [...b.childNodes];
  bc.forEach((n, i) => { if (i < ac.length) morph(ac[i], n); else a.appendChild(n); });
  for (let i = bc.length; i < ac.length; i++) ac[i].remove();
};
const render = (el, html) => { const t = document.createElement("template"); t.innerHTML = html; const nb = [...t.content.childNodes], oa = [...el.childNodes]; nb.forEach((n, i) => { if (i < oa.length) morph(oa[i], n); else el.appendChild(n); }); for (let i = nb.length; i < oa.length; i++) oa[i].remove(); };
/* keep animations from running after navigation */
const loop = (el, fn, ms) => { const id = setInterval(() => { if (!alive(el)) { clearInterval(id); return; } fn(); }, ms); return id; };
const svgPoint = (svg, e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const m = svg.getScreenCTM(); return m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 }; };
const path = (pts, X, Y) => pts.map((p, i) => (i ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1)).join("");
const axes = (X, Y, xs, ys, xl, yl, w = 360, h = 220) => `${ys.map(v => `<line class="gridl" x1="${X(xs[0])}" x2="${X(xs[xs.length - 1])}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${X(xs[0]) - 5}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`).join("")}${xs.map(v => `<text x="${X(v)}" y="${h - 8}" text-anchor="middle">${v}</text>`).join("")}${xl ? `<text x="${w - 8}" y="${h - 24}" text-anchor="end">${xl}</text>` : ""}${yl ? `<text x="${X(xs[0]) + 4}" y="12">${yl}</text>` : ""}`;

/* ---------------- k-Nearest Neighbours ---------------- */
W.knn = (el, b, l) => {
  const r = rng(7), g = gaussF(r); const P = [];
  [[30, 35, 0], [68, 65, 1], [45, 70, 0], [72, 30, 1]].forEach(([cx, cy, c]) => { for (let i = 0; i < 9; i++) P.push([clamp(cx + g() * 10, 3, 97), clamp(cy + g() * 10, 3, 97), c]); });
  let q = [52, 50], k = 3; const tried = new Set([3]);
  const X = v => 10 + v * 3.4, Y = v => 350 - v * 3.4;
  const draw = () => {
    const d = P.map((p, i) => [Math.hypot(p[0] - q[0], p[1] - q[1]), i]).sort((a, b2) => a[0] - b2[0]).slice(0, k);
    const votes = [0, 0]; d.forEach(([, i]) => votes[P[i][2]]++); const pred = votes[1] > votes[0] ? 1 : 0; const rad = d[d.length - 1][0];
    const N = ["Group A", "Group B"], C = ["var(--acc)", "var(--info)"];
    el.innerHTML = `<div class="w">${head("Who are my neighbours?", "Interactive", `<span class="chip tab">k = ${k}</span>`)}
      <p class="muted" style="font-size:14px">Tap anywhere in the plot to move the <b>new point</b> (★). It is classified by the majority of its k nearest neighbours.</p>
      <svg viewBox="0 0 360 360" class="chart" id="kn-svg" style="width:100%;max-width:420px;margin:0 auto;cursor:crosshair;touch-action:none" role="img" aria-label="Scatter plot with two groups and a query point">
        <rect x="10" y="10" width="340" height="340" fill="none" stroke="var(--line)"/>
        <circle cx="${X(q[0])}" cy="${Y(q[1])}" r="${rad * 3.4}" fill="none" stroke="var(--warn)" stroke-dasharray="4 4"/>
        ${d.map(([, i]) => `<line x1="${X(q[0])}" y1="${Y(q[1])}" x2="${X(P[i][0])}" y2="${Y(P[i][1])}" stroke="var(--warn)" stroke-opacity=".7"/>`).join("")}
        ${P.map((p, i) => `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="${d.some(x => x[1] === i) ? 7 : 5}" fill="${C[p[2]]}" ${p[2] ? "" : `fill-opacity=".9"`} stroke="var(--bg)"/>`).join("")}
        <text x="${X(q[0])}" y="${Y(q[1]) + 7}" text-anchor="middle" style="font-size:22px;fill:${C[pred]}">★</text>
      </svg>
      <div class="row" style="gap:6px;justify-content:center"><span class="eyebrow">k</span>${[1, 3, 5, 7, 9, 15].map(v => `<button class="chip ${v === k ? "on" : ""}" data-k="${v}">${v}</button>`).join("")}</div>
      <div class="codeq" style="font-size:13px">votes: ${N[0]} ${votes[0]} · ${N[1]} ${votes[1]} → prediction: <b style="color:${C[pred]}">${N[pred]}</b>\nradius to k-th neighbour: ${f2(rad)}</div>
      <small class="muted">Tip: put the star on the border between two groups and compare k = 1 with k = 15. Tried k: ${[...tried].sort((a, c) => a - c).join(", ")}</small></div>`;
    const svg = $("#kn-svg", el); svg.onpointerdown = e => { const p = svgPoint(svg, e); q = [clamp((p.x - 10) / 3.4, 0, 100), clamp((350 - p.y) / 3.4, 0, 100)]; draw(); };
  };
  el.onclick = e => { const x = e.target.closest("[data-k]"); if (x) { k = +x.dataset.k; tried.add(k); if (tried.size >= 4 && done("knn")) { rec(b, l, true, "knn"); App.addXP(10, "knn", x); } draw(); } };
  draw();
};

/* ---------------- Decision tree split (Gini) ---------------- */
W.gini = (el, b, l) => {
  const D = [[1, 0], [1.5, 0], [2, 0], [2.5, 1], [3, 0], [3.5, 0], [4, 1], [4.5, 0], [5, 1], [5.5, 0], [6, 1], [6.5, 1], [7, 1], [8, 1], [8.5, 0], [9, 1]];
  const gi = s => { if (!s.length) return 0; const p = s.filter(x => x[1]).length / s.length; return 1 - p * p - (1 - p) * (1 - p); };
  const split = t => { const L = D.filter(x => x[0] <= t), R = D.filter(x => x[0] > t); return { L, R, w: (L.length * gi(L) + R.length * gi(R)) / D.length }; };
  const cands = D.slice(0, -1).map((x, i) => (x[0] + D[i + 1][0]) / 2); const best = Math.min(...cands.map(t => split(t).w));
  let t = 2.25; const X = v => 20 + v / 10 * 330;
  const draw = () => {
    const s = split(t), isBest = Math.abs(s.w - best) < 1e-9; const cnt = a => `${a.filter(x => x[1]).length} pass · ${a.filter(x => !x[1]).length} fail`;
    render(el, `<div class="w">${head("Find the best first question", "Decision tree", `<span class="chip tab ${isBest ? "acc" : ""}">weighted Gini ${f3(s.w)}</span>`)}
      <p class="muted" style="font-size:14px">A tree asks yes/no questions. The first split should make both sides as <b>pure</b> as possible (Gini impurity 0 = only one class, 0.5 = 50/50).</p>
      <svg viewBox="0 0 360 110" class="chart" style="width:100%;max-width:560px;margin:0 auto" role="img" aria-label="Students on a study-hours axis with a split line">
        <rect x="20" y="20" width="${X(t) - 20}" height="60" fill="var(--bad)" fill-opacity=".06"/><rect x="${X(t)}" y="20" width="${350 - X(t)}" height="60" fill="var(--acc)" fill-opacity=".06"/>
        ${D.map(([h, y]) => `<circle cx="${X(h)}" cy="${y ? 38 : 62}" r="6" fill="${y ? "var(--acc)" : "var(--bad)"}" stroke="var(--bg)"/>`).join("")}
        <line x1="${X(t)}" x2="${X(t)}" y1="12" y2="88" stroke="var(--warn)" stroke-width="2"/><text x="${X(t)}" y="10" text-anchor="middle" style="fill:var(--warn)">hours ≤ ${t}?</text>
        ${[0, 2, 4, 6, 8, 10].map(v => `<text x="${X(v)}" y="104" text-anchor="middle">${v}</text>`).join("")}<text x="350" y="104" text-anchor="end">study hours</text></svg>
      <label class="fld"><span>Split threshold <b class="tab">${t} h</b></span><input type="range" id="gi-t" min="1.25" max="8.75" step="0.25" value="${t}"></label>
      <div class="grid g2"><div class="card col" style="padding:12px"><b>yes (≤ ${t} h)</b><small class="muted">${cnt(s.L)} · Gini ${f3(gi(s.L))}</small></div><div class="card col" style="padding:12px"><b>no (> ${t} h)</b><small class="muted">${cnt(s.R)} · Gini ${f3(gi(s.R))}</small></div></div>
      <div class="codeq" style="font-size:12.5px">Gini = 1 − p(pass)² − p(fail)²\nweighted = ${s.L.length}/16·${f3(gi(s.L))} + ${s.R.length}/16·${f3(gi(s.R))} = ${f3(s.w)}</div>
      <div class="${isBest ? "why" : "hint"}"><b>Challenge:</b> find the threshold with the lowest weighted Gini (${f3(best)}). ${isBest ? "Found it: this is the split a tree algorithm (CART) would choose first." : ""}</div></div>`);
    $("#gi-t", el).oninput = e => { t = +e.target.value; draw(); };
    if (isBest && done("gini")) { rec(b, l, true, "trees"); App.addXP(15, "gini", el); }
  };
  draw();
};

/* ---------------- Naive Bayes spam filter ---------------- */
W.nbayes = (el, b, l) => {
  const WDS = [["free", .30, .02], ["win", .20, .01], ["click", .25, .05], ["meeting", .02, .20], ["report", .03, .15], ["thanks", .08, .25]];
  let prior = 0.4, on = new Set(["free"]), touched = 0;
  const draw = () => {
    let ls = Math.log(prior), lh = Math.log(1 - prior); const rows = [];
    WDS.forEach(([w, ps, ph]) => { if (on.has(w)) { ls += Math.log(ps); lh += Math.log(ph); rows.push([w, ps / ph]); } });
    const post = 1 / (1 + Math.exp(lh - ls)); const spam = post >= 0.5;
    render(el, `<div class="w">${head("Build an email, watch the odds", "Naive Bayes", `<span class="chip tab ${spam ? "bad" : "acc"}">P(spam | words) = ${pct(post)}</span>`)}
      <p class="muted" style="font-size:14px">Toggle which words appear in the email. Each word multiplies the odds by P(word | spam) / P(word | ham). “Naive” = the words are treated as independent.</p>
      <div class="row" style="gap:6px">${WDS.map(([w, ps, ph]) => `<button class="chip ${on.has(w) ? "on" : ""}" data-w="${w}">${w} <small class="muted">×${f2(ps / ph)}</small></button>`).join("")}</div>
      <label class="fld"><span>Prior P(spam) before reading <b class="tab">${pct(prior)}</b></span><input type="range" id="nb-p" min="0.05" max="0.95" step="0.05" value="${prior}"></label>
      <div class="codeq" style="font-size:12.5px">prior odds = ${f2(prior)} / ${f2(1 - prior)} = ${f3(prior / (1 - prior))}\n${rows.map(([w, r]) => `× ${f2(r)}  (${w})`).join("\n") || "(no words selected)"}\n= posterior odds ${f3(post / (1 - post))} → P(spam) = ${pct(post)} → <b>${spam ? "SPAM" : "HAM"}</b></div>
      <div class="hint"><b>Challenge:</b> keep “free” in the email but get it classified as <b>ham</b> with the prior at 40 %. ${on.has("free") && !spam && Math.abs(prior - 0.4) < 1e-9 ? "<b style='color:var(--acc)'>Done: strong ham words outweigh one spam word.</b>" : ""}</div></div>`);
    $("#nb-p", el).oninput = e => { prior = +e.target.value; draw(); };
    if (on.has("free") && !spam && Math.abs(prior - 0.4) < 1e-9 && done("nbayes")) { rec(b, l, true, "nbayes"); App.addXP(15, "nbayes", el); }
  };
  el.onclick = e => { const x = e.target.closest("[data-w]"); if (x) { const w = x.dataset.w; on.has(w) ? on.delete(w) : on.add(w); touched++; draw(); } };
  draw();
};

/* ---------------- Over- and underfitting (polynomial degree) ---------------- */
W.overfit = (el, b, l) => {
  const r = rng(11), g = gaussF(r); const f = x => Math.sin(2 * Math.PI * x);
  const mk = n => Array.from({ length: n }, (_, i) => { const x = (i + 0.2 + r() * 0.6) / n; return [x, f(x) + g() * 0.22]; });
  const TR = mk(10), TE = mk(14);
  const fit = (deg) => { const n = deg + 1, A = Array.from({ length: n }, () => Array(n + 1).fill(0));
    TR.forEach(([x, y]) => { const u = 2 * x - 1, p = Array.from({ length: n }, (_, i) => u ** i); for (let i = 0; i < n; i++) { for (let j = 0; j < n; j++) A[i][j] += p[i] * p[j]; A[i][n] += p[i] * y; } });
    for (let i = 0; i < n; i++) A[i][i] += 1e-10;
    for (let c = 0; c < n; c++) { let m = c; for (let i = c + 1; i < n; i++) if (Math.abs(A[i][c]) > Math.abs(A[m][c])) m = i; [A[c], A[m]] = [A[m], A[c]]; for (let i = 0; i < n; i++) if (i !== c) { const k = A[i][c] / A[c][c]; for (let j = c; j <= n; j++) A[i][j] -= k * A[c][j]; } }
    const w = A.map((row, i) => row[n] / row[i]); return x => { const u = 2 * x - 1; return w.reduce((s, c, i) => s + c * u ** i, 0); }; };
  const mse = (m, D) => D.reduce((s, [x, y]) => s + (m(x) - y) ** 2, 0) / D.length;
  const RES = Array.from({ length: 10 }, (_, d) => { const m = fit(d); return { m, tr: mse(m, TR), te: mse(m, TE) }; });
  const bestD = RES.reduce((bi, x, i) => x.te < RES[bi].te ? i : bi, 0);
  let deg = 1; const seen = new Set([1]);
  const X = v => 30 + v * 320, Y = v => 110 - v * 55;
  const draw = () => {
    const R = RES[deg]; const curve = []; for (let x = 0; x <= 1.0001; x += 0.005) curve.push([x, clamp(R.m(x), -1.9, 1.9)]);
    const bx = i => 40 + i * 31, maxE = 0.6, bh = v => Math.min(v, maxE) / maxE * 70;
    const verdict = deg <= 1 ? ["warn", "Underfitting: the model is too simple – high error on training and test data."] : deg === bestD ? ["ok", "Sweet spot: lowest error on unseen test data."] : RES[deg].tr < 0.02 || deg >= 7 ? ["bad", "Overfitting: nearly perfect on the training points, but worse on new data."] : ["", "Getting closer. Watch the test error."];
    render(el, `<div class="w">${head("How complex should the model be?", "Train vs. test", `<span class="chip tab">degree ${deg}</span>`)}
      <svg viewBox="0 0 360 230" class="chart" style="width:100%;max-width:560px;margin:0 auto" role="img" aria-label="Polynomial fit with training and test points">
        ${[-1, 0, 1].map(v => `<line class="gridl" x1="30" x2="350" y1="${Y(v)}" y2="${Y(v)}"/><text x="24" y="${Y(v) + 4}" text-anchor="end">${v}</text>`).join("")}
        <path d="${path(curve, X, Y)}" fill="none" stroke="var(--warn)" stroke-width="2.5"/>
        ${TR.map(([x, y]) => `<circle cx="${X(x)}" cy="${Y(y)}" r="5" fill="var(--acc)" stroke="var(--bg)"/>`).join("")}
        ${TE.map(([x, y]) => `<rect x="${X(x) - 4}" y="${Y(y) - 4}" width="8" height="8" fill="none" stroke="var(--info)" stroke-width="2"/>`).join("")}
        <text x="34" y="222" style="fill:var(--acc)">● training (fit on these)</text><text x="200" y="222" style="fill:var(--info)">□ test (never seen)</text></svg>
      <label class="fld"><span>Polynomial degree <b class="tab">${deg}</b> (${deg + 1} parameters, ${TR.length} training points)</span><input type="range" id="of-d" min="0" max="9" step="1" value="${deg}"></label>
      <svg viewBox="0 0 360 110" class="chart" style="width:100%;max-width:560px;margin:0 auto" role="img" aria-label="Training and test error per degree">
        ${RES.map((x, i) => `<rect x="${bx(i)}" y="${88 - bh(x.tr)}" width="12" height="${bh(x.tr)}" fill="var(--acc)" fill-opacity="${i === deg ? 1 : .45}"/><rect x="${bx(i) + 13}" y="${88 - bh(x.te)}" width="12" height="${bh(x.te)}" fill="var(--info)" fill-opacity="${i === deg ? 1 : .45}"/><text x="${bx(i) + 12}" y="102" text-anchor="middle">${i}</text>`).join("")}
        <text x="40" y="12">MSE per degree (green = train, blue = test; capped at ${maxE})</text></svg>
      <div class="codeq" style="font-size:12.5px">train MSE = ${f3(R.tr)}   test MSE = ${f3(R.te)}</div>
      <div class="${verdict[0] === "ok" ? "why" : verdict[0] === "bad" ? "why bad" : "hint"}"><b>${verdict[1]}</b></div>
      <small class="muted">Training error always drops with more parameters. Only the <b>test</b> error tells you how well the model generalises.</small></div>`);
    $("#of-d", el).oninput = e => { deg = +e.target.value; seen.add(deg); draw(); };
    if (deg === bestD && seen.size >= 4 && done("overfit")) { rec(b, l, true, "overfit"); App.addXP(15, "overfit", el); }
  };
  draw();
};

/* ---------------- Confusion matrix & metrics ---------------- */
W.confusion = (el, b, l) => {
  const D = [[.97, 1], [.93, 1], [.91, 0], [.88, 1], [.84, 1], [.8, 0], [.77, 1], [.72, 1], [.69, 0], [.64, 1], [.58, 0], [.55, 1], [.51, 0], [.46, 0], [.42, 1], [.37, 0], [.33, 0], [.28, 0], [.22, 1], [.18, 0], [.14, 0], [.1, 0], [.07, 0], [.04, 0]];
  const SC = [{ id: "screen", t: "Cancer screening", goal: "Recall ≥ 90 %", why: "Missing a sick patient (FN) is far worse than a follow-up test for a healthy one (FP).", ok: m => m.rec >= 0.9 },
    { id: "spam", t: "Spam filter", goal: "Precision = 100 %", why: "A real email in the spam folder (FP) is worse than one spam email in the inbox (FN).", ok: m => m.prec >= 0.999 }];
  let thr = 0.5; const hit = new Set();
  const M = t => { let tp = 0, fp = 0, fn = 0, tn = 0; D.forEach(([s, y]) => { const p = s >= t; if (p && y) tp++; else if (p) fp++; else if (y) fn++; else tn++; }); const prec = tp / (tp + fp), rc = tp / (tp + fn); return { tp, fp, fn, tn, acc: (tp + tn) / D.length, prec, rec: rc, f1: 2 * prec * rc / (prec + rc), spec: tn / (tn + fp) }; };
  const draw = () => {
    const m = M(thr); SC.forEach(s => { if (s.ok(m)) hit.add(s.id); });
    const X = v => 20 + v * 330;
    render(el, `<div class="w">${head("Move the threshold, watch the metrics", "Confusion matrix", `<span class="chip tab">threshold ${thr.toFixed(2)}</span>`)}
      <svg viewBox="0 0 360 80" class="chart" style="width:100%;max-width:560px;margin:0 auto" role="img" aria-label="Model scores of 24 cases">
        <rect x="${X(thr)}" y="8" width="${350 - X(thr)}" height="52" fill="var(--warn)" fill-opacity=".07"/>
        ${D.map(([s, y]) => `<circle cx="${X(s)}" cy="${y ? 24 : 46}" r="5.5" fill="${y ? "var(--bad)" : "var(--acc)"}" stroke="${(s >= thr) === !!y ? "var(--bg)" : "var(--text)"}" stroke-width="${(s >= thr) === !!y ? 1 : 2}"/>`).join("")}
        <line x1="${X(thr)}" x2="${X(thr)}" y1="4" y2="64" stroke="var(--warn)" stroke-width="2"/>
        <text x="20" y="76">score 0</text><text x="350" y="76" text-anchor="end">score 1 → predicted positive right of the line</text></svg>
      <small class="muted">Red = actually positive (sick / spam), green = actually negative. Outlined dots are misclassified.</small>
      <input type="range" id="cf-t" min="0.02" max="0.99" step="0.01" value="${thr}" aria-label="Threshold">
      <div class="grid g2"><div class="table-wrap"><table class="dt"><thead><tr><th></th><th>pred. +</th><th>pred. −</th></tr></thead><tbody>
        <tr><td>actual +</td><td><b>TP ${m.tp}</b></td><td style="color:var(--bad)">FN ${m.fn}</td></tr><tr><td>actual −</td><td style="color:var(--bad)">FP ${m.fp}</td><td><b>TN ${m.tn}</b></td></tr></tbody></table></div>
        <div class="table-wrap"><table class="dt"><tbody>${[["accuracy", "(TP+TN) / all", pct(m.acc)], ["precision", "TP / (TP+FP)", pct(m.prec)], ["recall", "TP / (TP+FN)", pct(m.rec)], ["F1", "2·P·R / (P+R)", isFinite(m.f1) ? f2(m.f1) : "–"], ["specificity", "TN / (TN+FP)", pct(m.spec)]].map(r => `<tr><td>${r[0]}</td><td class="muted" style="font-size:12px">${r[1]}</td><td class="tab"><b>${r[2]}</b></td></tr>`).join("")}</tbody></table></div></div>
      <div class="col" style="gap:8px">${SC.map(s => `<div class="${s.ok(m) ? "why" : "hint"}"><b>${s.t}: ${s.goal}</b> ${s.ok(m) ? "✓ met now" : hit.has(s.id) ? "(met earlier)" : ""}<br><small>${s.why}</small></div>`).join("")}</div></div>`);
    $("#cf-t", el).oninput = e => { thr = +e.target.value; draw(); };
    if (hit.size === 2 && done("confusion")) { rec(b, l, true, "metrics"); App.addXP(15, "confusion", el); }
  };
  draw();
};

/* ---------------- k-fold cross validation ---------------- */
W.kfold = (el, b, l) => {
  const n = 20; let k = 5; const acc = (k2, i) => 0.78 + 0.08 * Math.sin(i * 2.1 + k2 * 0.7) + 0.03 * Math.cos(i * 5.3);
  const draw = () => {
    const folds = Array.from({ length: k }, (_, i) => i); const size = n / k; const a = folds.map(i => acc(k, i)); const mu = a.reduce((s, v) => s + v, 0) / k; const sd = Math.sqrt(a.reduce((s, v) => s + (v - mu) ** 2, 0) / Math.max(1, k - 1));
    el.innerHTML = `<div class="w">${head("Every point is tested exactly once", "Cross validation", `<span class="chip tab">${k}-fold</span>`)}
      <div class="row" style="gap:6px"><span class="eyebrow">k</span>${[2, 4, 5, 10, 20].map(v => `<button class="chip ${v === k ? "on" : ""}" data-k="${v}">${v === 20 ? "20 (LOOCV)" : v}</button>`).join("")}</div>
      <div class="col" style="gap:4px">${folds.map(i => `<div class="row" style="gap:2px;flex-wrap:nowrap"><small class="muted tab" style="width:62px">round ${i + 1}</small>${Array.from({ length: n }, (_, j) => `<span style="flex:1;height:14px;border-radius:3px;background:${Math.floor(j / size) === i ? "var(--warn)" : "var(--acc)"};opacity:${Math.floor(j / size) === i ? 1 : .35}"></span>`).join("")}<small class="tab" style="width:52px;text-align:right">${pct(a[i])}</small></div>`).join("")}</div>
      <small class="muted"><span style="color:var(--warn)">■</span> test fold · <span style="color:var(--acc)">■</span> training data. The model is retrained from scratch in every round.</small>
      <div class="codeq" style="font-size:12.5px">mean accuracy = ${pct(mu)}   std = ${(sd * 100).toFixed(1)} percentage points\n${k} models trained · each on ${n - size} points · tested on ${size}</div>
      <small class="muted">Larger k → more training data per round, but more models to train (k = n is <i>leave-one-out</i>). k = 5 or 10 is the usual choice.</small></div>`;
  };
  el.onclick = e => { const x = e.target.closest("[data-k]"); if (x) { k = +x.dataset.k; draw(); if (done("kfold")) { rec(b, l, true, "cv"); App.addXP(10, "kfold", x); } } };
  draw();
};

/* ---------------- Stock & flow (bathtub) ---------------- */
W.stockflow = (el, b, l) => {
  let S0 = 10, inflow = 8, rate = 0.1; const seen = new Set();
  const draw = () => {
    const T = 60, pts = []; let s = S0; for (let t = 0; t <= T; t++) { pts.push([t, s]); s = s + inflow - rate * s; }
    const eq = inflow / rate, maxY = Math.max(120, ...pts.map(p => p[1]), eq) * 1.05; const X = v => 40 + v / T * 310, Y = v => 190 - v / maxY * 170;
    const yt = [0, Math.round(maxY / 2 / 10) * 10, Math.round(maxY / 10) * 10 - 10];
    render(el, `<div class="w">${head("A bathtub is a model", "Stock & flow", `<span class="chip tab">equilibrium ${f2(eq)}</span>`)}
      <div class="codeq" style="font-size:12.5px">stock(t+1) = stock(t) + inflow − outflow\noutflow = ${rate} · stock   ← balancing feedback: the fuller, the faster it drains</div>
      <svg viewBox="0 0 360 220" class="chart" style="width:100%;max-width:560px;margin:0 auto" role="img" aria-label="Stock over time">
        ${axes(X, Y, [0, 20, 40, 60], yt, "time", "stock")}
        <line x1="40" x2="350" y1="${Y(eq)}" y2="${Y(eq)}" stroke="var(--warn)" stroke-dasharray="4 4"/><text x="348" y="${Y(eq) - 5}" text-anchor="end" style="fill:var(--warn)">inflow / rate</text>
        <path d="${path(pts, X, Y)}" fill="none" stroke="var(--info)" stroke-width="2.5"/></svg>
      <div class="grid g3"><label class="fld"><span>start stock <b class="tab">${S0}</b></span><input type="range" data-p="S0" min="0" max="150" step="5" value="${S0}"></label>
        <label class="fld"><span>inflow / step <b class="tab">${inflow}</b></span><input type="range" data-p="inflow" min="0" max="15" step="1" value="${inflow}"></label>
        <label class="fld"><span>outflow rate <b class="tab">${rate}</b></span><input type="range" data-p="rate" min="0.02" max="0.5" step="0.02" value="${rate}"></label></div>
      <small class="muted">Whatever the start value: the stock moves towards inflow / rate. That is the signature of a <b>balancing loop</b>. Change all three sliders.</small></div>`);
    $$("[data-p]", el).forEach(i => i.oninput = e => { const p = e.target.dataset.p, v = +e.target.value; if (p === "S0") S0 = v; if (p === "inflow") inflow = v; if (p === "rate") rate = Math.round(v * 100) / 100; seen.add(p); draw(); if (seen.size === 3 && done("stockflow")) { rec(b, l, true, "modsim"); App.addXP(10, "stockflow", el); } });
  };
  draw();
};

/* ---------------- Euler method: logistic growth ---------------- */
W.euler = (el, b, l) => {
  const K = 100, N0 = 5, T = 12; let r = 0.8, dt = 1; const tried = new Set([1]);
  const exact = t => K / (1 + (K / N0 - 1) * Math.exp(-r * t));
  const draw = () => {
    const eu = [[0, N0]]; let n = N0; for (let t = dt; t <= T + 1e-9; t += dt) { n = n + dt * r * n * (1 - n / K); eu.push([t, n]); }
    const ex = []; for (let t = 0; t <= T + 1e-9; t += 0.1) ex.push([t, exact(t)]);
    const err = Math.abs(eu[eu.length - 1][1] - exact(eu[eu.length - 1][0])); const maxY = Math.max(130, ...eu.map(p => p[1]));
    const X = v => 40 + v / T * 310, Y = v => 190 - clamp(v, -10, maxY) / maxY * 170;
    render(el, `<div class="w">${head("Solving dN/dt step by step", "Euler method", `<span class="chip tab">Δt = ${dt}</span>`)}
      <div class="codeq" style="font-size:12.5px">model:  dN/dt = r · N · (1 − N/K)      (logistic growth, K = ${K})\nEuler:  N(t+Δt) = N(t) + Δt · r · N(t) · (1 − N(t)/K)</div>
      <svg viewBox="0 0 360 220" class="chart" style="width:100%;max-width:560px;margin:0 auto" role="img" aria-label="Exact solution and Euler approximation">
        ${axes(X, Y, [0, 3, 6, 9, 12], [0, 50, 100], "t", "N")}
        <line x1="40" x2="350" y1="${Y(K)}" y2="${Y(K)}" stroke="var(--muted)" stroke-dasharray="3 5"/>
        <path d="${path(ex, X, Y)}" fill="none" stroke="var(--acc)" stroke-width="2.5"/>
        <path d="${path(eu, X, Y)}" fill="none" stroke="var(--warn)" stroke-width="1.5"/>${eu.map(p => `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="3.5" fill="var(--warn)"/>`).join("")}
        <text x="44" y="30" style="fill:var(--acc)">exact solution</text><text x="44" y="44" style="fill:var(--warn)">Euler steps</text></svg>
      <div class="grid g2"><div class="col"><span class="eyebrow">Step size Δt</span><div class="row" style="gap:6px">${[0.1, 0.5, 1, 2, 3].map(v => `<button class="chip ${v === dt ? "on" : ""}" data-dt="${v}">${v}</button>`).join("")}</div></div>
        <label class="fld"><span>growth rate r <b class="tab">${r}</b></span><input type="range" id="eu-r" min="0.2" max="1.4" step="0.1" value="${r}"></label></div>
      <div class="${err < 1 ? "why" : "hint"}">Error at t = ${f2(eu[eu.length - 1][0])}: <b class="tab">${f2(err)}</b>. ${dt >= 2 && r >= 0.8 ? "Large steps overshoot K and oscillate – a numerical artefact, not real behaviour." : dt <= 0.1 ? "Small steps follow the exact curve closely, but need many more computations." : ""}</div></div>`);
    $("#eu-r", el).oninput = e => { r = Math.round(+e.target.value * 10) / 10; draw(); };
  };
  el.onclick = e => { const x = e.target.closest("[data-dt]"); if (x) { dt = +x.dataset.dt; tried.add(dt); draw(); if (tried.size >= 3 && done("euler")) { rec(b, l, true, "ode"); App.addXP(15, "euler", el); } } };
  draw();
};

/* ---------------- Predator–prey (Lotka–Volterra) ---------------- */
W.lotka = (el, b, l) => {
  let a = 1.0, bb = 0.1, c = 1.5, d = 0.075, x0 = 10, y0 = 5; let moved = 0;
  const sim = () => { const h = 0.01, T = 30, out = []; let x = x0, y = y0; const F = (x, y) => [a * x - bb * x * y, d * x * y - c * y];
    for (let i = 0; i <= T / h; i++) { if (i % 10 === 0) out.push([i * h, x, y]); const k1 = F(x, y), k2 = F(x + h / 2 * k1[0], y + h / 2 * k1[1]), k3 = F(x + h / 2 * k2[0], y + h / 2 * k2[1]), k4 = F(x + h * k3[0], y + h * k3[1]); x += h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); y += h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]); } return out; };
  const draw = () => {
    const s = sim(); const maxY = Math.max(...s.map(p => Math.max(p[1], p[2]))) * 1.08; const X = v => 40 + v / 30 * 310, Y = v => 190 - v / maxY * 170; const yt = [0, Math.round(maxY / 2), Math.round(maxY * 0.95)];
    render(el, `<div class="w">${head("Hares and foxes", "Lotka–Volterra", "")}
      <div class="codeq" style="font-size:12px">dx/dt = a·x − b·x·y      prey: grows, gets eaten\ndy/dt = d·x·y − c·y      predators: grow by eating, die otherwise</div>
      <svg viewBox="0 0 360 220" class="chart" style="width:100%;max-width:560px;margin:0 auto" role="img" aria-label="Prey and predator populations over time">
        ${axes(X, Y, [0, 10, 20, 30], yt, "time", "population")}
        <path d="${path(s.map(p => [p[0], p[1]]), X, Y)}" fill="none" stroke="var(--acc)" stroke-width="2"/><path d="${path(s.map(p => [p[0], p[2]]), X, Y)}" fill="none" stroke="var(--bad)" stroke-width="2"/>
        <text x="300" y="24" style="fill:var(--acc)">prey x</text><text x="300" y="38" style="fill:var(--bad)">predators y</text></svg>
      <div class="grid g3"><label class="fld"><span>prey growth a <b class="tab">${a}</b></span><input type="range" data-p="a" min="0.4" max="1.6" step="0.1" value="${a}"></label>
        <label class="fld"><span>predator death c <b class="tab">${c}</b></span><input type="range" data-p="c" min="0.6" max="2.4" step="0.1" value="${c}"></label>
        <label class="fld"><span>start predators <b class="tab">${y0}</b></span><input type="range" data-p="y0" min="1" max="20" step="1" value="${y0}"></label></div>
      <small class="muted">Two coupled feedback loops create cycles: many hares → foxes grow → hares drop → foxes starve → hares recover. The predator peak always comes <b>after</b> the prey peak. Equilibrium: x* = c/d = ${f2(c / d)}, y* = a/b = ${f2(a / bb)}.</small></div>`);
    $$("[data-p]", el).forEach(i => i.oninput = e => { const p = e.target.dataset.p, v = Math.round(+e.target.value * 10) / 10; if (p === "a") a = v; if (p === "c") c = v; if (p === "y0") y0 = v; moved++; draw(); if (moved >= 3 && done("lotka")) { rec(b, l, true, "ode"); App.addXP(10, "lotka", el); } });
  };
  draw();
};

/* ---------------- Agent-based SIR epidemic ---------------- */
W.abm = (el, b, l) => {
  const N = 150, R = 3.5, SP = 2.6, FAC = 0.4; let p = 0.3, still = 0, rec_ = 60, A, hist, t, run = false, tmr = null, runs = 0;
  const reset = () => { const r = rng(Date.now() % 100000); A = Array.from({ length: N }, (_, i) => ({ x: r() * 100, y: r() * 100, vx: (r() - .5) * SP, vy: (r() - .5) * SP, s: i < 3 ? 1 : 0, c: 0, fix: i >= 3 && r() < still })); hist = []; t = 0; };
  const step = () => {
    A.forEach(a => { if (a.fix) return; a.x += a.vx; a.y += a.vy; if (a.x < 0 || a.x > 100) a.vx *= -1; if (a.y < 0 || a.y > 100) a.vy *= -1; a.x = clamp(a.x, 0, 100); a.y = clamp(a.y, 0, 100); });
    const inf = A.filter(a => a.s === 1);
    A.forEach(a => { if (a.s !== 0) return; for (const q of inf) { if (Math.abs(q.x - a.x) < R && Math.abs(q.y - a.y) < R && Math.random() < p * FAC) { a.s = 1; a.c = 0; break; } } });
    A.forEach(a => { if (a.s === 1 && ++a.c > rec_) a.s = 2; });
    t++; hist.push([0, 1, 2].map(k => A.filter(a => a.s === k).length));
    if (!A.some(a => a.s === 1)) { stop(); runs++; const bt = $("#ab-go", el); if (bt) bt.textContent = "Run again"; if (runs >= 2 && done("abm")) { rec(b, l, true, "abm"); App.addXP(15, "abm", el); } }
  };
  const stop = () => { run = false; if (tmr) clearInterval(tmr); tmr = null; };
  const COL = ["var(--info)", "var(--bad)", "var(--muted)"];
  const paint = () => {
    const sv = $("#ab-w", el); if (!sv) return;
    sv.innerHTML = `<rect x="0" y="0" width="200" height="200" fill="none" stroke="var(--line)"/>${A.map(a => `<circle cx="${a.x * 2}" cy="${a.y * 2}" r="${a.fix ? 2.6 : 3.2}" fill="${COL[a.s]}"${a.fix ? ` fill-opacity=".6"` : ""}/>`).join("")}`;
    const X = i => 10 + i / Math.max(200, hist.length) * 180, Y = v => 190 - v / N * 175; const peak = hist.length ? Math.max(...hist.map(h => h[1])) : 0;
    $("#ab-c", el).innerHTML = `<rect x="10" y="15" width="180" height="175" fill="none" stroke="var(--line)"/>${[0, 1, 2].map(k => `<path d="${hist.map((h, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(h[k]).toFixed(1)).join("")}" fill="none" stroke="${COL[k]}" stroke-width="2"/>`).join("")}<text x="10" y="10">S·I·R over time · peak ${peak}</text>`;
    const last = hist[hist.length - 1] || [N - 3, 3, 0]; $("#ab-s", el).textContent = `t = ${t} · susceptible ${last[0]} · infected ${last[1]} · recovered ${last[2]}`;
  };
  const draw = () => {
    el.innerHTML = `<div class="w">${head("An epidemic from simple rules", "Agent-based model", `<span class="chip tab" id="ab-s"></span>`)}
      <p class="muted" style="font-size:14px">Each dot follows three rules: move; if close to an infected dot, maybe get infected; recover after some time. Nobody programs the curve – it <b>emerges</b>.</p>
      <div class="grid g2" style="align-items:start"><svg viewBox="0 0 200 200" id="ab-w" class="chart" style="width:100%;max-width:320px;margin:0 auto" role="img" aria-label="Moving agents"></svg><svg viewBox="0 0 200 200" id="ab-c" class="chart" style="width:100%;max-width:320px;margin:0 auto" role="img" aria-label="SIR curves"></svg></div>
      <div class="grid g3"><label class="fld"><span>infection chance <b class="tab">${Math.round(p * 100)}%</b></span><input type="range" data-p="p" min="0.05" max="1" step="0.05" value="${p}"></label>
        <label class="fld"><span>staying home <b class="tab">${Math.round(still * 100)}%</b></span><input type="range" data-p="still" min="0" max="0.9" step="0.1" value="${still}"></label>
        <label class="fld"><span>days until recovery <b class="tab">${rec_}</b></span><input type="range" data-p="rec" min="20" max="120" step="10" value="${rec_}"></label></div>
      <div class="row"><button class="btn pri sm" id="ab-go">${run ? "Pause" : "Run"}</button><button class="btn sm" id="ab-r">New run</button></div>
      <small class="muted"><span style="color:var(--info)">●</span> susceptible <span style="color:var(--bad)">●</span> infected <span style="color:var(--muted)">●</span> recovered. Compare one run with 0 % and one with 60 % staying home: the peak gets lower and later (“flatten the curve”).</small></div>`;
    $("#ab-go", el).onclick = () => { if (run) stop(); else { if (!A.some(a => a.s === 1)) reset(); run = true; tmr = loop(el, () => { step(); if (run) step(); paint(); }, 50); } draw(); };
    $("#ab-r", el).onclick = () => { stop(); reset(); draw(); };
    $$("[data-p]", el).forEach(i => i.onchange = e => { const k = e.target.dataset.p, v = +e.target.value; if (k === "p") p = v; if (k === "still") still = v; if (k === "rec") rec_ = v; stop(); reset(); draw(); });
    paint();
  };
  reset(); draw();
};

/* ---------------- Monte Carlo: estimate π ---------------- */
W.montecarlo = (el, b, l) => {
  let pts = [], inside = 0, hist = [];
  const add = n => { for (let i = 0; i < n; i++) { const x = Math.random(), y = Math.random(), inn = x * x + y * y <= 1; if (inn) inside++; if (pts.length < 3000) pts.push([x, y, inn]); } hist.push([hist.length ? hist[hist.length - 1][0] + n : n, 4 * inside / (hist.length ? hist[hist.length - 1][0] + n : n)]); };
  const total = () => hist.length ? hist[hist.length - 1][0] : 0;
  const draw = () => {
    const n = total(), est = n ? 4 * inside / n : 0;
    const X = i => 20 + i / Math.max(1, hist.length - 1) * 160, Y = v => 100 - (clamp(v, 2.6, 3.7) - 2.6) / 1.1 * 90;
    el.innerHTML = `<div class="w">${head("Throw random darts, get π", "Monte Carlo", `<span class="chip tab">${n.toLocaleString("de-AT")} darts</span>`)}
      <div class="grid g2" style="align-items:start"><svg viewBox="0 0 200 200" class="chart" style="width:100%;max-width:300px;margin:0 auto" role="img" aria-label="Random points in a square with a quarter circle">
        <rect x="0" y="0" width="200" height="200" fill="none" stroke="var(--line)"/><path d="M0 0 A200 200 0 0 1 200 200" fill="none" stroke="var(--warn)" stroke-width="2"/>
        ${pts.map(([x, y, i]) => `<circle cx="${(x * 200).toFixed(1)}" cy="${(200 - y * 200).toFixed(1)}" r="1.4" fill="${i ? "var(--acc)" : "var(--bad)"}"/>`).join("")}</svg>
        <div class="col"><div class="codeq" style="font-size:13px">inside: ${inside.toLocaleString("de-AT")}\nπ ≈ 4·inside/all\n  = <b>${n ? est.toFixed(4) : "–"}</b>\nerror: ${n ? Math.abs(est - Math.PI).toFixed(4) : "–"}</div>
          <svg viewBox="0 0 200 110" class="chart" style="width:100%;max-width:320px" role="img" aria-label="Estimate converging to pi"><line x1="20" x2="180" y1="${Y(Math.PI)}" y2="${Y(Math.PI)}" stroke="var(--warn)" stroke-dasharray="3 3"/><text x="16" y="${Y(Math.PI) + 4}" text-anchor="end">π</text>${hist.length > 1 ? `<path d="${hist.map((h, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(h[1]).toFixed(1)).join("")}" fill="none" stroke="var(--info)" stroke-width="2"/>` : ""}</svg>
          <div class="row"><button class="btn sm" data-n="10">+10</button><button class="btn sm" data-n="100">+100</button><button class="btn pri sm" data-n="1000">+1 000</button><button class="btn sm" data-n="10000">+10 000</button><button class="btn ghost sm" id="mc-r">Reset</button></div></div></div>
      <small class="muted">Area ratio quarter circle / square = π/4. The error shrinks roughly like 1/√n: 100× more darts ≈ 10× more precision. Monte Carlo = answer a question by random sampling when it is hard to compute exactly.</small></div>`;
    $("#mc-r", el).onclick = () => { pts = []; inside = 0; hist = []; draw(); };
  };
  el.onclick = e => { const x = e.target.closest("[data-n]"); if (x) { add(+x.dataset.n); draw(); if (total() >= 5000 && done("montecarlo")) { rec(b, l, true, "mcevo"); App.addXP(10, "montecarlo", el); } } };
  draw();
};

/* ---------------- Genetic algorithm (OneMax) ---------------- */
W.evo = (el, b, l) => {
  const L = 30, P = 16; let mut = 0.03, pop, gen, best;
  const fit = s => s.reduce((a, v) => a + v, 0);
  const reset = () => { pop = Array.from({ length: P }, () => Array.from({ length: L }, () => Math.random() < 0.3 ? 1 : 0)); gen = 0; best = [Math.max(...pop.map(fit))]; };
  const tour = () => { const a = pop[Math.floor(Math.random() * P)], c = pop[Math.floor(Math.random() * P)]; return fit(a) >= fit(c) ? a : c; };
  const next = () => { const sorted = pop.slice().sort((a, c) => fit(c) - fit(a)); const np = [sorted[0].slice()];
    while (np.length < P) { const a = tour(), c = tour(), cut = 1 + Math.floor(Math.random() * (L - 1)); np.push(a.slice(0, cut).concat(c.slice(cut)).map(v => Math.random() < mut ? 1 - v : v)); }
    pop = np; gen++; best.push(Math.max(...pop.map(fit))); };
  const draw = () => {
    const sorted = pop.slice().sort((a, c) => fit(c) - fit(a)); const top = fit(sorted[0]);
    const X = i => 20 + i / Math.max(20, best.length - 1) * 170, Y = v => 95 - v / L * 85;
    el.innerHTML = `<div class="w">${head("Evolve a solution", "Genetic algorithm", `<span class="chip tab ${top === L ? "acc" : ""}">generation ${gen} · best ${top}/${L}</span>`)}
      <p class="muted" style="font-size:14px">Goal: a string of 30 ones. Each generation: <b>select</b> the fitter parents, <b>cross</b> them over, <b>mutate</b> a few bits. The best individual is always kept (elitism).</p>
      <div class="grid g2" style="align-items:start"><div class="col" style="gap:2px;font:11px var(--f-mono)">${sorted.map(s => `<div style="display:flex;gap:1px;align-items:center">${s.map(v => `<span style="width:7px;height:9px;border-radius:1px;background:${v ? "var(--acc)" : "var(--line)"}"></span>`).join("")}<span class="muted" style="margin-left:6px">${fit(s)}</span></div>`).join("")}</div>
        <div class="col"><svg viewBox="0 0 200 110" class="chart" style="width:100%" role="img" aria-label="Best fitness per generation"><line class="gridl" x1="20" x2="190" y1="${Y(L)}" y2="${Y(L)}"/><text x="16" y="${Y(L) + 4}" text-anchor="end">${L}</text><text x="16" y="${Y(0) + 4}" text-anchor="end">0</text>${best.length > 1 ? `<path d="${best.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1)).join("")}" fill="none" stroke="var(--acc)" stroke-width="2"/>` : ""}<text x="190" y="108" text-anchor="end">generations</text></svg>
          <label class="fld"><span>mutation rate <b class="tab">${Math.round(mut * 100)}%</b></span><input type="range" id="ev-m" min="0" max="0.3" step="0.01" value="${mut}"></label>
          <div class="row"><button class="btn pri sm" id="ev-1">Next generation</button><button class="btn sm" id="ev-10">+10</button><button class="btn ghost sm" id="ev-r">Reset</button></div></div></div>
      <small class="muted">Try mutation 0 % (gets stuck: no new bits), 3 % (steady progress) and 25 % (too random: good solutions get destroyed).</small></div>`;
    $("#ev-m", el).oninput = e => { mut = +e.target.value; $("b", e.target.parentNode).textContent = Math.round(mut * 100) + "%"; };
    $("#ev-1", el).onclick = () => { next(); draw(); check(); };
    $("#ev-10", el).onclick = () => { for (let i = 0; i < 10; i++) next(); draw(); check(); };
    $("#ev-r", el).onclick = () => { reset(); draw(); };
  };
  const check = () => { if (Math.max(...pop.map(fit)) === L && done("evo")) { rec(b, l, true, "mcevo"); App.addXP(15, "evo", el); } };
  reset(); draw();
};
})();
