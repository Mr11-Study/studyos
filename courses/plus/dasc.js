/* dasc · Plus: calculators with live graphs, step-by-step animations, worked examples and extra practice questions.
   Course language is English, so all content here is English. Integrated via STUDYOS_EXT (see courses/ext-apply.js). */
(function () {
const C = window.STUDYOS_CALC = window.STUDYOS_CALC || {};
const FIG = window.STUDYOS_FIG = window.STUDYOS_FIG || {};
const FX = window.FX;

/* ---------- helpers ---------- */
const N = (n, d = 2) => typeof n !== "number" ? String(n) : isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: d }) : "–";
const PC = (n, d = 1) => isFinite(n) ? N(100 * n, d) + " %" : "–";
const erf = x => { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x);
  return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)); };
const Phi = z => 0.5 * (1 + erf(z / Math.SQRT2));
const sig = z => 1 / (1 + Math.exp(-z));
const sum = a => a.reduce((s, x) => s + x, 0);
const T = (head, rows) => `<table class="dt"><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr>${rows.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join("")}</tr>`).join("")}</table>`;
const code = s => `<pre><code>${s}</code></pre>`;
const fmtX = n => N(n, 2), fmtY = n => N(n, 2);

/* =====================================================================
   CALCULATORS
   ===================================================================== */

/* 1 · Descriptive statistics (w8-1) */
const desc = v => {
  const xs = [v.s1, v.s2, v.s3, v.s4, v.s5, v.s6], n = xs.length, s = xs.slice().sort((a, b) => a - b), mean = sum(xs) / n;
  const q = p => { const h = (n - 1) * p, lo = Math.floor(h); return s[lo] + (h - lo) * (s[Math.min(lo + 1, n - 1)] - s[lo]); };
  const ss = sum(xs.map(x => (x - mean) ** 2)), q1 = q(.25), q3 = q(.75), iqr = q3 - q1;
  return { xs, s, n, mean, med: q(.5), ss, sd1: Math.sqrt(ss / (n - 1)), sd0: Math.sqrt(ss / n), q1, q3, iqr, lo: q1 - 1.5 * iqr, hi: q3 + 1.5 * iqr };
};
C["dasc-desc"] = {
  title: "Descriptive statistics: mean, median, spread and outliers",
  intro: "Six exam scores (0–100 points). Drag one score far up or down and watch how the <b>mean</b> reacts while the <b>median</b> barely moves. The numbers match what <code>df[\"score\"].describe()</code> would show.",
  inputs: [1, 2, 3, 4, 5, 6].map((i, j) => ({ k: "s" + i, label: "Score of student " + i, v: [62, 70, 74, 78, 81, 95][j], min: 0, max: 100, step: 1, unit: "pts" })),
  out: v => { const d = desc(v), out = d.xs.filter(x => x < d.lo || x > d.hi);
    return [["Mean", N(d.mean)], ["Median", N(d.med), "", true], ["Std (pandas, n − 1)", N(d.sd1)], ["Std (NumPy np.std, n)", N(d.sd0)],
      ["Q1 · Q3 · IQR", `${N(d.q1)} · ${N(d.q3)} · ${N(d.iqr)}`], ["Outliers (1.5 · IQR rule)", out.length ? out.join(", ") : "none"]]; },
  steps: v => { const d = desc(v);
    return `Sorted: ${d.s.join(", ")} (n = ${d.n})<br>
      Mean x̄ = Σx / n = ${N(sum(d.xs))} / ${d.n} = <b>${N(d.mean)}</b><br>
      Median = average of the 3rd and 4th sorted value = (${d.s[2]} + ${d.s[3]}) / 2 = <b>${N(d.med)}</b><br>
      Squared deviations Σ(x − x̄)² = ${d.xs.map(x => N((x - d.mean) ** 2, 1)).join(" + ")} = ${N(d.ss, 1)}<br>
      Sample std s = √(${N(d.ss, 1)} / (n − 1)) = √(${N(d.ss, 1)} / ${d.n - 1}) = <b>${N(d.sd1)}</b> (pandas <code>.std()</code> default, ddof = 1)<br>
      Population std σ = √(${N(d.ss, 1)} / ${d.n}) = ${N(d.sd0)} (NumPy <code>np.std()</code> default, ddof = 0)<br>
      Quartiles (pandas, linear interpolation at position p·(n − 1)): Q1 = ${N(d.q1)}, Q3 = ${N(d.q3)}, IQR = ${N(d.iqr)}<br>
      Fences: Q1 − 1.5·IQR = ${N(d.lo)} and Q3 + 1.5·IQR = <b>${N(d.hi)}</b>. Values outside are flagged as outliers.<br>
      ${d.mean > d.med + 0.5 ? "Mean &gt; median: the distribution has a long right tail (high values pull the mean up)." : d.mean < d.med - 0.5 ? "Mean &lt; median: a long left tail (low values pull the mean down)." : "Mean ≈ median: roughly symmetric."}`; },
  plot: { yl: "points", yfmt: n => N(n, 0), bars: v => { const d = desc(v); return d.xs.map((x, i) => ({ label: "S" + (i + 1), y: x })).concat([{ label: "mean", y: d.mean }, { label: "median", y: d.med }]); } }
};

/* 2 · Accuracy vs precision as a distribution (w3-2) */
C["dasc-meas"] = {
  title: "Accuracy vs. precision: how often is a reading close enough?",
  intro: "A kitchen scale weighs a 500 g reference weight many times. The readings scatter like a normal distribution. The <b>offset of the mean</b> is the systematic error (accuracy), the <b>standard deviation</b> is the random error (precision).",
  inputs: [
    { k: "t", label: "True value", v: 500, min: 0, max: 1000, step: 1, unit: "g" },
    { k: "mu", label: "Mean of the readings", v: 502, min: 0, max: 1000, step: 0.5, unit: "g" },
    { k: "sd", label: "Standard deviation of the readings", v: 3, min: 0.2, max: 30, step: 0.1, unit: "g" },
    { k: "tol", label: "Tolerance ± around the true value", v: 5, min: 0.5, max: 50, step: 0.5, unit: "g" }
  ],
  out: v => { const bias = v.mu - v.t, p = Phi((v.t + v.tol - v.mu) / v.sd) - Phi((v.t - v.tol - v.mu) / v.sd), mse = bias * bias + v.sd * v.sd;
    return [["Bias (systematic error)", N(bias), "g"], ["Spread σ (random error)", N(v.sd), "g"], ["MSE = bias² + σ²", N(mse), "g²"], ["RMSE", N(Math.sqrt(mse)), "g"],
      ["Readings within ± tolerance", PC(p), "", true], ["Dominant error", Math.abs(bias) > v.sd ? "systematic → calibrate" : "random → average more readings"]]; },
  steps: v => { const bias = v.mu - v.t, zl = (v.t - v.tol - v.mu) / v.sd, zh = (v.t + v.tol - v.mu) / v.sd;
    return `Bias = μ − true value = ${N(v.mu)} − ${N(v.t)} = <b>${N(bias)} g</b><br>
      MSE = bias² + σ² = ${N(bias)}² + ${N(v.sd)}² = ${N(bias * bias)} + ${N(v.sd * v.sd)} = <b>${N(bias * bias + v.sd * v.sd)} g²</b><br>
      Standardise the tolerance band [${N(v.t - v.tol)}; ${N(v.t + v.tol)}]: z = (x − μ) / σ → z<sub>low</sub> = ${N(zl)}, z<sub>high</sub> = ${N(zh)}<br>
      P(within) = Φ(${N(zh)}) − Φ(${N(zl)}) = ${N(Phi(zh), 4)} − ${N(Phi(zl), 4)} = <b>${PC(Phi(zh) - Phi(zl))}</b><br>
      Calibration removes the bias: with μ = true value the share rises to ${PC(Phi(v.tol / v.sd) - Phi(-v.tol / v.sd))}.`; },
  plot: { x: v => { const w = Math.max(4 * v.sd + Math.abs(v.mu - v.t), 1.6 * v.tol); return [v.t - w, v.t + w]; },
    y: v => [0, 1.18 / (v.sd * Math.sqrt(2 * Math.PI))], xl: "reading (g)", yl: "density", xfmt: n => N(n, 1), yfmt: n => N(n, 3),
    fns: [{ label: "distribution of readings", f: (x, v) => Math.exp(-0.5 * ((x - v.mu) / v.sd) ** 2) / (v.sd * Math.sqrt(2 * Math.PI)) },
      { label: "inside the tolerance band", f: (x, v) => Math.abs(x - v.t) <= v.tol ? Math.exp(-0.5 * ((x - v.mu) / v.sd) ** 2) / (v.sd * Math.sqrt(2 * Math.PI)) : NaN }],
    points: v => [{ x: v.t, y: 0, label: "true value" }, { x: v.mu, y: 1 / (v.sd * Math.sqrt(2 * Math.PI)), label: "mean reading" }] }
};

/* 3 · Linear regression by hand (w9-1) */
const HX = [1, 2, 3, 4, 5, 6, 7, 8], HY = [52, 55, 61, 60, 68, 71, 74, 80];
const ols = (X, Y) => { const n = X.length, mx = sum(X) / n, my = sum(Y) / n, sxy = sum(X.map((x, i) => (x - mx) * (Y[i] - my))), sxx = sum(X.map(x => (x - mx) ** 2)), m = sxy / sxx; return { m, b: my - m * mx, mx, my, sxy, sxx }; };
const lossLin = (m, b) => sum(HX.map((x, i) => (HY[i] - (m * x + b)) ** 2)) / HX.length;
C["dasc-lin"] = {
  title: "Fit a line: slope, intercept, MSE and R²",
  intro: "Eight students: study hours x and exam score y. Choose slope m and intercept b of ŷ = m·x + b and try to beat the least-squares line. The graph shows your line, the optimal line and the data points.",
  inputs: [
    { k: "m", label: "Slope m (points per hour)", v: 3, min: -2, max: 10, step: 0.1 },
    { k: "b", label: "Intercept b (points at 0 hours)", v: 50, min: 30, max: 70, step: 0.5 }
  ],
  out: v => { const o = ols(HX, HY), mse = lossLin(v.m, v.b), my = o.my, sst = sum(HY.map(y => (y - my) ** 2)), r2 = 1 - mse * HX.length / sst;
    return [["Your MSE", N(mse), "pts²", true], ["Your RMSE", N(Math.sqrt(mse)), "pts"], ["Your R²", N(r2, 3)],
      ["Least squares m*, b*", `${N(o.m, 3)} · ${N(o.b, 2)}`], ["Best possible MSE", N(lossLin(o.m, o.b))], ["Your prediction for 6 h", N(v.m * 6 + v.b, 1), "pts"]]; },
  steps: v => { const o = ols(HX, HY), rows = HX.map((x, i) => { const yh = v.m * x + v.b, e = HY[i] - yh; return [x, HY[i], N(yh, 2), N(e, 2), N(e * e, 2)]; });
    const sse = sum(HX.map((x, i) => (HY[i] - v.m * x - v.b) ** 2)), sst = sum(HY.map(y => (y - o.my) ** 2));
    return T(["x", "y", "ŷ = m·x + b", "e = y − ŷ", "e²"], rows) + `<br>
      MSE = Σe² / n = ${N(sse)} / 8 = <b>${N(sse / 8)}</b> · R² = 1 − SS<sub>res</sub> / SS<sub>tot</sub> = 1 − ${N(sse)} / ${N(sst)} = <b>${N(1 - sse / sst, 3)}</b><br>
      Closed form: x̄ = ${N(o.mx)}, ȳ = ${N(o.my, 3)}, Σ(x−x̄)(y−ȳ) = ${N(o.sxy)}, Σ(x−x̄)² = ${N(o.sxx)}<br>
      m* = ${N(o.sxy)} / ${N(o.sxx)} = <b>${N(o.m, 4)}</b>, b* = ȳ − m*·x̄ = ${N(o.my, 3)} − ${N(o.m, 4)} · ${N(o.mx)} = <b>${N(o.b, 3)}</b>`; },
  plot: { x: [0, 9], y: [40, 90], xl: "study hours", yl: "exam score", xfmt: n => N(n, 0), yfmt: n => N(n, 0),
    fns: [{ label: "your line ŷ = m·x + b", f: (x, v) => v.m * x + v.b }, { label: "least-squares line", f: x => { const o = ols(HX, HY); return o.m * x + o.b; } }],
    points: () => HX.map((x, i) => ({ x, y: HY[i] })) }
};

/* 4 · Gradient descent on a 1-parameter MSE (w10-1) */
const GX = [1, 2, 3], GY = [2.1, 3.9, 6.2];
const gL = w => sum(GX.map((x, i) => (GY[i] - w * x) ** 2)) / GX.length;
const gG = w => -2 / GX.length * sum(GX.map((x, i) => x * (GY[i] - w * x)));
const gW = sum(GX.map((x, i) => x * GY[i])) / sum(GX.map(x => x * x)), gC = 2 / GX.length * sum(GX.map(x => x * x));
const gRun = v => { const ws = [v.w0]; for (let k = 0; k < Math.round(v.k); k++) { const w = ws[ws.length - 1]; ws.push(w - v.eta * gG(w)); if (!isFinite(ws[ws.length - 1]) || Math.abs(ws[ws.length - 1]) > 1e9) break; } return ws; };
C["dasc-gd"] = {
  title: "Gradient descent step by step",
  intro: "Model ŷ = w·x through the origin, data (1; 2.1), (2; 3.9), (3; 6.2). The loss is the MSE. Choose start value, learning rate η and number of steps. Try η = 0.05, 0.15 and 0.25.",
  inputs: [
    { k: "w0", label: "Start value w₀", v: -1, min: -3, max: 7, step: 0.1 },
    { k: "eta", label: "Learning rate η", v: 0.05, min: 0.01, max: 0.3, step: 0.01 },
    { k: "k", label: "Number of steps", v: 8, min: 1, max: 30, step: 1 }
  ],
  out: v => { const ws = gRun(v), w = ws[ws.length - 1], f = 1 - v.eta * gC;
    return [["w after the steps", N(w, 4), "", true], ["Loss L(w)", N(gL(w), 4)], ["Optimum w*", N(gW, 4)], ["Distance factor per step |1 − η·c|", N(Math.abs(f), 3)],
      ["Behaviour", Math.abs(f) >= 1 ? "diverges (η too large)" : f < 0 ? "converges, but zig-zags" : "converges smoothly"]]; },
  steps: v => { const ws = gRun(v), show = ws.slice(0, 6);
    return `L(w) = (1/n)·Σ(yᵢ − w·xᵢ)², gradient dL/dw = −(2/n)·Σ xᵢ(yᵢ − w·xᵢ). Update: w ← w − η·dL/dw<br>` +
      show.slice(0, -1).map((w, i) => `Step ${i + 1}: w = ${N(w, 4)} − ${N(v.eta)} · (${N(gG(w), 4)}) = <b>${N(show[i + 1], 4)}</b>, L = ${N(gL(show[i + 1]), 4)}`).join("<br>") +
      (ws.length > 6 ? `<br>… after ${ws.length - 1} steps: w = ${N(ws[ws.length - 1], 4)}` : "") +
      `<br>Why: here the gradient is linear, dL/dw = c·(w − w*) with c = (2/n)·Σx² = ${N(gC, 3)}. Each step multiplies the distance to w* by (1 − η·c) = ${N(1 - v.eta * gC, 3)}. It converges only if |1 − η·c| &lt; 1, i.e. η &lt; 2/c = ${N(2 / gC, 4)}.`; },
  plot: { x: [-4, 8], xl: "parameter w", yl: "loss L(w)", xfmt: n => N(n, 0), yfmt: n => N(n, 0),
    fns: [{ label: "loss L(w) = MSE", f: w => gL(w) }],
    points: v => { const ws = gRun(v); return ws.filter(w => w >= -4 && w <= 8).length === ws.length ? ws.map((w, i) => ({ x: w, y: gL(w), label: i === 0 ? "start" : i === ws.length - 1 ? "step " + i : "" })) : ws.map((w, i) => ({ x: w, y: gL(w), label: i === 0 ? "start" : "" })).filter(q => q.x >= -4 && q.x <= 8); } }
};

/* 5 · Logistic regression: sigmoid, threshold, log-loss (w11-1) */
C["dasc-sig"] = {
  title: "Logistic regression: from score to probability to class",
  intro: "p(pass) = σ(w·x + b) with x = study hours. Move weight, bias and threshold. The decision boundary is where the probability equals the threshold.",
  inputs: [
    { k: "w", label: "Weight w", v: 1.2, min: 0.1, max: 4, step: 0.1 },
    { k: "b", label: "Bias b", v: -4.5, min: -12, max: 2, step: 0.1 },
    { k: "x", label: "Study hours x of one student", v: 3, min: 0, max: 10, step: 0.25, unit: "h" },
    { k: "t", label: "Threshold", v: 0.5, min: 0.05, max: 0.95, step: 0.05 },
    { k: "y", label: "True label y (1 = passed, 0 = failed)", v: 1, min: 0, max: 1, step: 1 }
  ],
  out: v => { const z = v.w * v.x + v.b, p = sig(z), xb = (Math.log(v.t / (1 - v.t)) - v.b) / v.w, ll = -(v.y >= 0.5 ? Math.log(p) : Math.log(1 - p));
    return [["Score z = w·x + b", N(z, 3)], ["Probability p(pass)", PC(p), "", true], ["Predicted class", p >= v.t ? "pass (1)" : "fail (0)"],
      ["Decision boundary", N(xb, 2), "h"], ["Log-loss for this student", N(ll, 3)]]; },
  steps: v => { const z = v.w * v.x + v.b, p = sig(z), lt = Math.log(v.t / (1 - v.t));
    return `z = w·x + b = ${N(v.w)} · ${N(v.x)} + (${N(v.b)}) = <b>${N(z, 3)}</b><br>
      p = σ(z) = 1 / (1 + e<sup>−z</sup>) = 1 / (1 + e<sup>${N(-z, 3)}</sup>) = 1 / (1 + ${N(Math.exp(-z), 4)}) = <b>${N(p, 4)}</b><br>
      Class: p ${p >= v.t ? "≥" : "&lt;"} ${N(v.t)} → <b>${p >= v.t ? "pass" : "fail"}</b><br>
      Boundary: σ(w·x + b) = t ⇔ w·x + b = ln(t / (1 − t)) = ${N(lt, 3)} ⇔ x = (${N(lt, 3)} − (${N(v.b)})) / ${N(v.w)} = <b>${N((lt - v.b) / v.w, 3)} h</b><br>
      Log-loss = −[y·ln p + (1 − y)·ln(1 − p)] = <b>${N(-(v.y >= 0.5 ? Math.log(p) : Math.log(1 - p)), 3)}</b> (confident and wrong is punished hard: p = 0.01 for y = 1 costs 4.6)`; },
  plot: { x: [0, 10], y: [0, 1], xl: "study hours", yl: "p(pass)", xfmt: n => N(n, 0), yfmt: n => N(n, 1),
    fns: [{ label: "σ(w·x + b)", f: (x, v) => sig(v.w * x + v.b) }, { label: "threshold", f: (x, v) => v.t }],
    points: v => { const xb = (Math.log(v.t / (1 - v.t)) - v.b) / v.w; return [{ x: v.x, y: sig(v.w * v.x + v.b), label: "student" }, { x: xb, y: v.t, label: "boundary" }]; } }
};

/* 6 · Overfitting curve: polynomial degree vs train/validation error (w13-1) */
const OVF = (() => {
  const f = x => Math.sin(2 * Math.PI * x);
  const XT = [0.02, 0.1, 0.19, 0.27, 0.35, 0.44, 0.52, 0.6, 0.69, 0.77, 0.86, 0.95], NT = [0.12, -0.18, 0.05, 0.21, -0.15, 0.1, -0.22, 0.17, -0.08, 0.2, -0.14, 0.09];
  const XV = [0.06, 0.15, 0.23, 0.31, 0.4, 0.48, 0.56, 0.65, 0.73, 0.82, 0.9, 0.98], NV = [-0.1, 0.16, -0.12, 0.07, 0.19, -0.17, 0.11, -0.06, 0.14, -0.2, 0.08, -0.13];
  const tr = XT.map((x, i) => [x, f(x) + NT[i]]), va = XV.map((x, i) => [x, f(x) + NV[i]]);
  const cheb = (x, d) => { const t = 2 * x - 1, B = [1, t]; for (let k = 2; k <= d; k++) B.push(2 * t * B[k - 1] - B[k - 2]); return B.slice(0, d + 1); };
  const fit = d => { const A = tr.map(([x]) => cheb(x, d)), n = d + 1;
    const M = Array.from({ length: n }, (_, i) => { const r = Array(n + 1).fill(0); for (let j = 0; j < n; j++) A.forEach(a => { r[j] += a[i] * a[j]; }); tr.forEach(([, y], k) => { r[n] += A[k][i] * y; }); r[i] += 1e-9; return r; });
    for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; [M[c], M[p]] = [M[p], M[c]];
      for (let r = 0; r < n; r++) if (r !== c) { const q = M[r][c] / M[c][c]; for (let j = c; j <= n; j++) M[r][j] -= q * M[c][j]; } }
    return M.map((r, i) => r[n] / r[i]); };
  const pred = (w, x) => cheb(x, w.length - 1).reduce((s, b, i) => s + b * w[i], 0);
  const mse = (w, D) => D.reduce((s, [x, y]) => s + (y - pred(w, x)) ** 2, 0) / D.length;
  const res = []; for (let d = 0; d <= 10; d++) { const w = fit(d); res.push({ d, tr: mse(w, tr), va: mse(w, va) }); }
  return res;
})();
const ovfAt = (key, x) => { const i = Math.max(0, Math.min(9, Math.floor(x))), t = x - i; return OVF[i][key] * (1 - t) + OVF[Math.min(10, i + 1)][key] * t; };
C["dasc-ovf"] = {
  title: "Overfitting: model complexity vs. training and validation error",
  intro: "12 training points and 12 validation points come from the same curve y = sin(2πx) plus noise. A polynomial of degree d is fitted to the training points only. Increase d and compare the two errors.",
  inputs: [{ k: "d", label: "Polynomial degree d (model complexity)", v: 3, min: 0, max: 10, step: 1 }],
  out: v => { const r = OVF[Math.round(v.d)], best = OVF.reduce((a, b) => b.va < a.va ? b : a);
    return [["Training MSE", N(r.tr, 4)], ["Validation MSE", N(r.va, 4), "", true], ["Gap (val − train)", N(r.va - r.tr, 4)], ["Parameters", Math.round(v.d) + 1],
      ["Diagnosis", r.d <= 2 ? "underfitting (too simple)" : r.d >= 6 ? "overfitting (learns the noise)" : "good fit"], ["Lowest validation MSE at", "d = " + best.d]]; },
  steps: v => { const d = Math.round(v.d);
    return `A polynomial of degree ${d} has ${d + 1} parameters. With 12 training points, degree 11 could pass through every point exactly (training MSE = 0) – that is memorising, not learning.<br>` +
      T(["degree", "train MSE", "validation MSE"], OVF.map(r => [r.d === d ? `<b>${r.d}</b>` : r.d, N(r.tr, 4), N(r.va, 4)])) +
      `<br>The noise added to the data has a variance of about 0.02. A validation MSE close to that is as good as it gets. Training error keeps falling with complexity, validation error is U-shaped. Choose the degree with the lowest <b>validation</b> error, then report the error on a separate <b>test</b> set.`; },
  plot: { x: [0, 10], y: [0, 0.6], xl: "polynomial degree", yl: "MSE", xfmt: n => N(n, 0), yfmt: n => N(n, 2),
    fns: [{ label: "training error", f: x => ovfAt("tr", x) }, { label: "validation error (above 0.6 cut off)", f: x => { const y = ovfAt("va", x); return y > 0.6 ? NaN : y; } }],
    points: v => [{ x: Math.round(v.d), y: OVF[Math.round(v.d)].va, label: "d = " + Math.round(v.d) }] }
};

/* 7 · Confusion matrix metrics (w13-2) */
C["dasc-conf"] = {
  title: "Confusion matrix: accuracy, precision, recall, F1",
  intro: "Enter the four cells of a binary confusion matrix. Positive = the class you are looking for (sick, fraud, spam). Try the fraud case: TP = 40, FP = 80, FN = 10, TN = 9 870.",
  inputs: [
    { k: "tp", label: "TP – true positives", v: 8, min: 0, max: 10000, step: 1 },
    { k: "fp", label: "FP – false positives (false alarms)", v: 4, min: 0, max: 10000, step: 1 },
    { k: "fn", label: "FN – false negatives (misses)", v: 2, min: 0, max: 10000, step: 1 },
    { k: "tn", label: "TN – true negatives", v: 86, min: 0, max: 20000, step: 1 }
  ],
  out: v => { const n = v.tp + v.fp + v.fn + v.tn, acc = (v.tp + v.tn) / n, pr = v.tp / (v.tp + v.fp), re = v.tp / (v.tp + v.fn), sp = v.tn / (v.tn + v.fp), f1 = 2 * pr * re / (pr + re);
    return [["Accuracy", PC(acc)], ["Precision", PC(pr)], ["Recall (sensitivity)", PC(re)], ["Specificity", PC(sp)], ["F1 score", PC(f1), "", true],
      ["Baseline “always negative”", PC((v.tn + v.fp) / n)]]; },
  steps: v => { const n = v.tp + v.fp + v.fn + v.tn, pr = v.tp / (v.tp + v.fp), re = v.tp / (v.tp + v.fn);
    return T(["", "predicted positive", "predicted negative"], [["actually positive", "TP = " + v.tp, "FN = " + v.fn], ["actually negative", "FP = " + v.fp, "TN = " + v.tn]]) + `<br>
      N = ${n}<br>
      Accuracy = (TP + TN) / N = (${v.tp} + ${v.tn}) / ${n} = <b>${PC((v.tp + v.tn) / n)}</b><br>
      Precision = TP / (TP + FP) = ${v.tp} / ${v.tp + v.fp} = <b>${PC(pr)}</b> – of all alarms, how many are real?<br>
      Recall = TP / (TP + FN) = ${v.tp} / ${v.tp + v.fn} = <b>${PC(re)}</b> – of all real positives, how many were found?<br>
      Specificity = TN / (TN + FP) = ${v.tn} / ${v.tn + v.fp} = <b>${PC(v.tn / (v.tn + v.fp))}</b><br>
      F1 = 2·P·R / (P + R) = 2 · ${N(pr, 3)} · ${N(re, 3)} / (${N(pr, 3)} + ${N(re, 3)}) = <b>${PC(2 * pr * re / (pr + re))}</b><br>
      A model that always says “negative” would reach ${PC((v.tn + v.fp) / n)} accuracy – compare before you celebrate.`; },
  plot: { yl: "%", yfmt: n => N(n, 0), bars: v => { const n = v.tp + v.fp + v.fn + v.tn, pr = v.tp / (v.tp + v.fp), re = v.tp / (v.tp + v.fn);
    return [{ label: "Accuracy", y: 100 * (v.tp + v.tn) / n }, { label: "Precision", y: 100 * pr || 0 }, { label: "Recall", y: 100 * re || 0 }, { label: "Specificity", y: 100 * v.tn / (v.tn + v.fp) || 0 }, { label: "F1", y: 100 * 2 * pr * re / (pr + re) || 0 }]; } }
};

/* 8 · Gini impurity of a split (w12-3) */
const gini = (a, b) => a + b ? 1 - (a / (a + b)) ** 2 - (b / (a + b)) ** 2 : 0;
C["dasc-gini"] = {
  title: "Decision tree split: Gini impurity and gain",
  intro: "A node is split by a yes/no question, e.g. “hours ≤ 3.75?”. Enter how many pass/fail students end up left and right. The tree prefers the split with the lowest weighted Gini (= highest gain).",
  inputs: [
    { k: "lp", label: "Left branch (yes): pass", v: 1, min: 0, max: 100, step: 1 },
    { k: "lf", label: "Left branch (yes): fail", v: 3, min: 0, max: 100, step: 1 },
    { k: "rp", label: "Right branch (no): pass", v: 5, min: 0, max: 100, step: 1 },
    { k: "rf", label: "Right branch (no): fail", v: 1, min: 0, max: 100, step: 1 }
  ],
  out: v => { const nl = v.lp + v.lf, nr = v.rp + v.rf, n = nl + nr, gp = gini(v.lp + v.rp, v.lf + v.rf), gl = gini(v.lp, v.lf), gr = gini(v.rp, v.rf), w = n ? nl / n * gl + nr / n * gr : 0;
    return [["Gini parent", N(gp, 4)], ["Gini left", N(gl, 4)], ["Gini right", N(gr, 4)], ["Weighted Gini after split", N(w, 4)], ["Gain (decrease in impurity)", N(gp - w, 4), "", true]]; },
  steps: v => { const nl = v.lp + v.lf, nr = v.rp + v.rf, n = nl + nr, P = v.lp + v.rp, F = v.lf + v.rf, gp = gini(P, F), gl = gini(v.lp, v.lf), gr = gini(v.rp, v.rf), w = nl / n * gl + nr / n * gr;
    return `Gini(S) = 1 − Σ pₖ²<br>
      Parent: ${P} pass, ${F} fail → 1 − (${P}/${n})² − (${F}/${n})² = <b>${N(gp, 4)}</b><br>
      Left: 1 − (${v.lp}/${nl})² − (${v.lf}/${nl})² = <b>${N(gl, 4)}</b> · Right: 1 − (${v.rp}/${nr})² − (${v.rf}/${nr})² = <b>${N(gr, 4)}</b><br>
      Weighted: ${nl}/${n} · ${N(gl, 4)} + ${nr}/${n} · ${N(gr, 4)} = <b>${N(w, 4)}</b><br>
      Gain = ${N(gp, 4)} − ${N(w, 4)} = <b>${N(gp - w, 4)}</b>. CART computes this for every feature and threshold and keeps the best one.`; },
  plot: { yfmt: n => N(n, 2), bars: v => { const nl = v.lp + v.lf, nr = v.rp + v.rf, n = nl + nr, gl = gini(v.lp, v.lf), gr = gini(v.rp, v.rf);
    return [{ label: "parent", y: gini(v.lp + v.rp, v.lf + v.rf) }, { label: "left", y: gl }, { label: "right", y: gr }, { label: "weighted", y: n ? nl / n * gl + nr / n * gr : 0 }]; } }
};

/* 9 · Naive Bayes spam posterior (w12-5) */
C["dasc-bayes"] = {
  title: "Naive Bayes: how each word shifts the spam probability",
  intro: "Prior = share of spam among all emails. For each word you need how often it appears in spam and in normal mail (ham). The email below contains both words.",
  inputs: [
    { k: "pr", label: "Prior P(spam)", v: 30, min: 1, max: 99, step: 1, unit: "%" },
    { k: "a", label: "P(“free” | spam)", v: 40, min: 0.1, max: 100, step: 0.1, unit: "%" },
    { k: "b", label: "P(“free” | ham)", v: 5, min: 0.1, max: 100, step: 0.1, unit: "%" },
    { k: "c", label: "P(“meeting” | spam)", v: 2, min: 0.1, max: 100, step: 0.1, unit: "%" },
    { k: "d", label: "P(“meeting” | ham)", v: 20, min: 0.1, max: 100, step: 0.1, unit: "%" }
  ],
  out: v => { const p = v.pr / 100, s1 = p * v.a / 100, h1 = (1 - p) * v.b / 100, s2 = s1 * v.c / 100, h2 = h1 * v.d / 100;
    return [["P(spam | “free”)", PC(s1 / (s1 + h1))], ["P(spam | “free”, “meeting”)", PC(s2 / (s2 + h2)), "", true], ["Decision (threshold 50 %)", s2 > h2 ? "spam" : "ham"],
      ["Likelihood ratio “free”", N((v.a / v.b), 2) + " ×"], ["Likelihood ratio “meeting”", N((v.c / v.d), 3) + " ×"]]; },
  steps: v => { const p = v.pr / 100, s1 = p * v.a / 100, h1 = (1 - p) * v.b / 100, s2 = s1 * v.c / 100, h2 = h1 * v.d / 100;
    return `P(C | words) ∝ P(C) · Π P(word | C) – then normalise so that spam + ham = 1.<br>
      Only “free”: spam ${N(p)} · ${N(v.a / 100, 3)} = ${N(s1, 4)}, ham ${N(1 - p)} · ${N(v.b / 100, 3)} = ${N(h1, 4)} → P(spam) = ${N(s1, 4)} / (${N(s1, 4)} + ${N(h1, 4)}) = <b>${PC(s1 / (s1 + h1))}</b><br>
      Plus “meeting”: spam ${N(s1, 4)} · ${N(v.c / 100,3)} = ${N(s2, 5)}, ham ${N(h1, 4)} · ${N(v.d / 100, 3)} = ${N(h2, 5)} → P(spam) = <b>${PC(s2 / (s2 + h2))}</b><br>
      “Naive”: the two word probabilities are simply multiplied, as if the words were independent given the class.`; },
  plot: { yl: "P(spam) in %", yfmt: n => N(n, 0), bars: v => { const p = v.pr / 100, s1 = p * v.a / 100, h1 = (1 - p) * v.b / 100, s2 = s1 * v.c / 100, h2 = h1 * v.d / 100;
    return [{ label: "prior", y: 100 * p }, { label: "+ “free”", y: 100 * s1 / (s1 + h1) }, { label: "+ “meeting”", y: 100 * s2 / (s2 + h2) }]; } }
};

/* 10 · Monte Carlo precision (w14-4) */
C["dasc-mc"] = {
  title: "Monte Carlo: how many runs do I need?",
  intro: "The standard error of a Monte Carlo average is σ/√n. Default σ = 1.642 is the spread of one sample in the π estimate (4 · “inside the circle?”). Change n and the target accuracy.",
  inputs: [
    { k: "s", label: "Standard deviation σ of one sample", v: 1.642, min: 0.01, max: 10, step: 0.001 },
    { k: "n", label: "Number of samples n", v: 10000, min: 100, max: 1000000, step: 100 },
    { k: "e", label: "Target: 95 % half-width ±", v: 0.01, min: 0.0001, max: 1, step: 0.0001 }
  ],
  out: v => { const se = v.s / Math.sqrt(v.n), need = Math.ceil((1.96 * v.s / v.e) ** 2);
    return [["Standard error σ/√n", N(se, 5)], ["95 % interval ± 1.96·SE", "± " + N(1.96 * se, 5), "", true], ["n needed for the target", N(need, 0)], ["Factor vs. current n", N(need / v.n, 2) + " ×"]]; },
  steps: v => { const se = v.s / Math.sqrt(v.n);
    return `SE = σ / √n = ${N(v.s, 3)} / √${N(v.n, 0)} = ${N(v.s, 3)} / ${N(Math.sqrt(v.n), 2)} = <b>${N(se, 5)}</b><br>
      95 % interval ≈ estimate ± 1.96 · SE = ± <b>${N(1.96 * se, 5)}</b><br>
      Required n for ± ${N(v.e, 4)}: n = (1.96 · σ / e)² = (1.96 · ${N(v.s, 3)} / ${N(v.e, 4)})² = <b>${N(Math.ceil((1.96 * v.s / v.e) ** 2), 0)}</b><br>
      Rule of thumb: 10× more precision costs 100× more runs.`; },
  plot: { x: v => [100, Math.max(4 * v.n, 20000)], xl: "number of samples n", yl: "error", xfmt: n => N(n, 0), yfmt: n => N(n, 3),
    fns: [{ label: "standard error σ/√n", f: (x, v) => v.s / Math.sqrt(x) }, { label: "95 % half-width", f: (x, v) => 1.96 * v.s / Math.sqrt(x) }],
    points: v => [{ x: v.n, y: 1.96 * v.s / Math.sqrt(v.n), label: "n = " + N(v.n, 0) }] }
};

/* =====================================================================
   FIGURES (step animations)
   ===================================================================== */
const { svg, g, t, tl, r, box, c, l, p } = FX;

/* A · pandas groupby: split – apply – combine (w7-2) */
const GBROWS = [["Anna", "WI", 72], ["Ben", "SWD", 65], ["Cara", "WI", 88], ["Dan", "IMS", 54], ["Eva", "SWD", 81], ["Finn", "WI", 80]];
const GBCLS = { WI: "fx-soft", SWD: "fx-info", IMS: "fx-vio" };
FIG["dasc-groupby"] = { title: "pandas groupby: split – apply – combine",
  svg: () => {
    const x0 = 14, y0 = 46, rh = 26, cw = [62, 54, 50];
    const cell = (x, y, w, s, o = {}) => r(x, y, w, rh, { rx: 0, cls: o.cls || "fx-card" }) + t(x + w / 2, y + 17, s, { fs: 12, fw: o.fw });
    let tab = t(x0, 30, 'df.groupby("course")["score"].mean()', { a: "start", fs: 13, fw: 700, cls: "t-acc" });
    tab += cell(x0, y0, cw[0], "name", { cls: "fx-mute", fw: 700 }) + cell(x0 + cw[0], y0, cw[1], "course", { cls: "fx-mute", fw: 700 }) + cell(x0 + cw[0] + cw[1], y0, cw[2], "score", { cls: "fx-mute", fw: 700 });
    GBROWS.forEach(([nm, co, sc], i) => { const y = y0 + rh * (i + 1);
      tab += cell(x0, y, cw[0], nm) + cell(x0 + cw[0], y, cw[1], co) + cell(x0 + cw[0] + cw[1], y, cw[2], sc);
      tab += g({ st: 1 }, r(x0 + cw[0], y, cw[1], rh, { rx: 0, cls: GBCLS[co] }) + t(x0 + cw[0] + cw[1] / 2, y + 17, co, { fs: 12, fw: 700 })); });
    const groups = [["WI", 40], ["SWD", 146], ["IMS", 226]], gx = 222, gw = 136;
    let mid = "";
    groups.forEach(([co, gy]) => { const rows = GBROWS.filter(x => x[1] === co), h = 24 + rows.length * 22, m = sum(rows.map(x => x[2])) / rows.length;
      mid += g({ st: 1 }, r(gx, gy, gw, h, { cls: GBCLS[co] }) + t(gx + 10, gy + 17, "group " + co, { a: "start", fs: 12, fw: 700 }) +
        rows.map((x, i) => t(gx + 16, gy + 38 + i * 22, x[0], { a: "start", fs: 12 }) + t(gx + gw - 16, gy + 38 + i * 22, x[2], { a: "end", fs: 12, fw: 600 })).join("") +
        l(182, 46 + 26 * (GBROWS.indexOf(rows[0]) + 1) + 13, gx - 4, gy + 14, { cls: "thin", arrow: true }));
      mid += g({ st: 2 }, l(gx + gw + 2, gy + h / 2, 384, gy + h / 2, { arrow: true, cls: "acc", acc: true }) + box(388, gy + h / 2 - 17, 96, 34, "mean = " + N(m, 0), { cls: "fx-acc", fs: 12 })); });
    const rx = 506, rw = [52, 40, 40], ry = 82;
    let res = g({ st: 3 }, t(rx, ry - 12, "result (Series)", { a: "start", fs: 12, fw: 700 }) + r(rx, ry, rw[0], 24, { rx: 0, cls: "fx-mute" }) + t(rx + 26, ry + 16, "course", { fs: 11.5, fw: 700 }) + r(rx + rw[0], ry, rw[1], 24, { rx: 0, cls: "fx-mute" }) + t(rx + rw[0] + 20, ry + 16, "mean", { fs: 11.5, fw: 700 }) +
      [["IMS", 54], ["SWD", 73], ["WI", 80]].map(([co, m], i) => r(rx, ry + 24 * (i + 1), rw[0], 24, { rx: 0, cls: GBCLS[co] }) + t(rx + 26, ry + 24 * (i + 1) + 16, co, { fs: 12, fw: 700 }) + r(rx + rw[0], ry + 24 * (i + 1), rw[1], 24, { rx: 0, cls: "fx-card" }) + t(rx + rw[0] + 20, ry + 24 * (i + 1) + 16, m, { fs: 12 })).join("") +
      [64, 166, 249].map(y => l(486, y, rx - 4, ry + 36, { cls: "thin dash" })).join(""));
    res += g({ st: 4 }, r(rx + rw[0] + rw[1], ry, rw[2], 24, { rx: 0, cls: "fx-mute" }) + t(rx + rw[0] + rw[1] + 20, ry + 16, "count", { fs: 11.5, fw: 700 }) +
      [1, 2, 3].map((n, i) => r(rx + rw[0] + rw[1], ry + 24 * (i + 1), rw[2], 24, { rx: 0, cls: "fx-card" }) + t(rx + rw[0] + rw[1] + 20, ry + 24 * (i + 1) + 16, n, { fs: 12 })).join("") +
      t(rx, ry + 130, '.agg(["mean", "count"])', { a: "start", fs: 11.5, cls: "t-acc" }));
    return svg(640, 300, tab + mid + res);
  },
  steps: [
    "Start: a DataFrame with one row per student. Question: what is the average score <b>per course</b>?",
    "<b>Split:</b> pandas looks at the key column <code>course</code> and sorts the rows into one group per distinct value. Nothing is computed yet – <code>df.groupby(\"course\")</code> alone only returns a GroupBy object.",
    "<b>Apply:</b> the aggregation runs inside each group separately. WI: (72 + 88 + 80) / 3 = 80, SWD: (65 + 81) / 2 = 73, IMS: 54 / 1 = 54.",
    "<b>Combine:</b> the results are glued together into a new Series. The group keys become the <b>index</b>, sorted alphabetically by default (IMS, SWD, WI). Use <code>.reset_index()</code> to turn it back into a normal table.",
    "Several statistics at once: <code>.agg([\"mean\", \"count\"])</code> returns a DataFrame with one column per function. Always check the count – a mean over 1 student (IMS) is not very reliable."
  ] };

/* B · k-means step by step (w12-4) – iterations are computed from the data */
const KP = [[1, 2], [1.6, 1.1], [2.3, 2.9], [3.1, 1.6], [6, 7], [7.1, 6.1], [6.4, 8.2], [8.1, 7.4], [4.3, 4.6]];
const KM = (() => { let cs = [[1.6, 1.1], [3.1, 1.6]]; const st = [{ cs: cs.map(x => x.slice()), as: null }];
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
  for (let it = 0; it < 6; it++) { const as = KP.map(q => d2(q, cs[0]) <= d2(q, cs[1]) ? 0 : 1);
    st.push({ cs: cs.map(x => x.slice()), as, kind: "assign" });
    const nc = [0, 1].map(k => { const m = KP.filter((_, i) => as[i] === k); return [sum(m.map(q => q[0])) / m.length, sum(m.map(q => q[1])) / m.length]; });
    const moved = nc.some((q, k) => d2(q, cs[k]) > 1e-9); cs = nc; const inertia = sum(KP.map((q, i) => d2(q, cs[as[i]])));
    st.push({ cs: cs.map(x => x.slice()), as, kind: "update", moved, inertia, old: st[st.length - 1].cs });
    if (!moved) break; }
  return st; })();
FIG["dasc-kmeans"] = { title: "k-Means with k = 2: assign, update, repeat",
  svg: () => { const X = x => 40 + x * 36, Y = y => 272 - y * 24;
    let s = FX.axes(30, 24, 350, 250, "feature 1", "feature 2");
    s += KP.map(q => c(X(q[0]), Y(q[1]), 6, { cls: "fx-mute" })).join("");
    KM.forEach((st, k) => { if (k === 0) return; const on = String(k + 1);
      if (st.as) s += g({ on }, KP.map((q, i) => c(X(q[0]), Y(q[1]), 6.5, { cls: st.as[i] ? "fill-info" : "fill-warn" })).join("") +
        (st.kind === "assign" ? KP.map((q, i) => l(X(q[0]), Y(q[1]), X(st.cs[st.as[i]][0]), Y(st.cs[st.as[i]][1]), { cls: "thin dash" })).join("") : "")); });
    const cross = (q, k, o = {}) => g(o, `<path d="M${X(q[0]) - 8} ${Y(q[1]) - 8} l16 16 M${X(q[0]) + 8} ${Y(q[1]) - 8} l-16 16" class="fx-ln ${k ? "acc" : "bad"}" style="stroke-width:3.2"/>`);
    KM.forEach((st, k) => { const on = k === 0 ? "1" : String(k + 1);
      s += g({ on }, st.cs.map((q, j) => cross(q, j)).join("") + (st.kind === "update" ? st.old.map((q, j) => l(X(q[0]), Y(q[1]), X(st.cs[j][0]), Y(st.cs[j][1]), { arrow: true, cls: "acc", acc: true })).join("") : "")); });
    const px = 410;
    s += r(px, 24, 222, 250, { cls: "fx-card" });
    KM.forEach((st, k) => { const on = k === 0 ? "1" : String(k + 1);
      const lines = [k === 0 ? "Initialisation" : (st.kind === "assign" ? "Assign step" : "Update step") + " · iteration " + Math.ceil(k / 2),
        "c₁ = (" + N(st.cs[0][0], 2) + "; " + N(st.cs[0][1], 2) + ")", "c₂ = (" + N(st.cs[1][0], 2) + "; " + N(st.cs[1][1], 2) + ")"];
      if (st.as) lines.push("cluster 1: " + st.as.filter(a => !a).length + " points", "cluster 2: " + st.as.filter(a => a).length + " points");
      if (st.kind === "update") lines.push("inertia = " + N(st.inertia, 2), st.moved ? "centres moved → repeat" : "no change → converged");
      s += g({ on }, lines.map((x, i) => t(px + 14, 54 + i * 26, x, { a: "start", fs: 12.5, fw: i ? 500 : 700, cls: i === 6 ? "t-acc" : "" })).join("")); });
    s += g({ on: "0" }, t(px + 14, 54, "9 unlabelled points", { a: "start", fs: 12.5, fw: 700 }) + t(px + 14, 80, "goal: k = 2 groups", { a: "start", fs: 12.5 }));
    return svg(640, 300, s); },
  steps: (() => { const s = ["Nine customers described by two (scaled) features. No labels. We want k = 2 groups.",
      "<b>Initialise:</b> pick two starting centres. Here both start in the lower-left corner – a deliberately poor start."];
    KM.slice(1).forEach((st, k) => s.push(st.kind === "assign"
      ? `<b>Assign:</b> every point joins its nearest centre (dashed lines). Cluster sizes: ${st.as.filter(a => !a).length} and ${st.as.filter(a => a).length}.`
      : st.moved ? `<b>Update:</b> each centre moves to the mean of its points (arrows). Inertia (sum of squared distances) is now ${N(st.inertia, 2)}. Centres moved, so repeat.`
        : `<b>Converged:</b> the assignment did not change, the centres stay where they are. Final inertia ${N(st.inertia, 2)}. A different start could end in a different (local) optimum – that is why <code>n_init</code> runs several starts.`));
    return s; })() };

/* C · kNN voting with k = 1, 3, 5 (w12-2) */
const KN = [["pass", 40, 200], ["pass", 62, 60], ["fail", 80, 320], ["fail", 96, 130], ["fail", 110, 250], ["pass", 150, 10], ["fail", 160, 170]];
FIG["dasc-knn"] = { title: "k-Nearest Neighbours: the prediction depends on k",
  svg: () => { const cx = 230, cy = 150, P = KN.map(([cl, d, a]) => [cl, d, cx + d * Math.cos(a * Math.PI / 180), cy - d * Math.sin(a * Math.PI / 180)]);
    let s = r(14, 14, 420, 272, { cls: "fx-card" }) + t(24, 34, "feature 1 vs. feature 2 (scaled)", { a: "start", fs: 11, cls: "fx-sub" });
    [[1, 44, "2"], [3, 84, "3"], [5, 114, "4"]].forEach(([k, rad, on]) => { s += g({ on: on + (k === 5 ? ",5" : "") }, `<circle cx="${cx}" cy="${cy}" r="${rad}" class="fx-dashacc"/>` + t(cx + rad * 0.72 + 4, cy + rad * 0.72 + 14, "k = " + k, { fs: 12, fw: 700, cls: "t-acc" })); });
    s += g({ on: "1" }, P.map(([, d, x, y]) => l(cx, cy, x, y, { cls: "thin dash" }) + t((cx + x) / 2 + 6, (cy + y) / 2 - 4, "d=" + (d / 20).toFixed(1), { fs: 10, cls: "fx-sub" })).join(""));
    s += P.map(([cl, , x, y]) => cl === "pass" ? c(x, y, 8, { cls: "fill-ok" }) : r(x - 7.5, y - 7.5, 15, 15, { rx: 2, cls: "fill-bad" })).join("");
    s += c(cx, cy, 10, { cls: "fx-acc" }) + t(cx, cy + 4.5, "?", { fw: 800, cls: "fx-onacc" });
    const px = 450;
    s += c(px + 10, 36, 7, { cls: "fill-ok" }) + t(px + 24, 40, "pass", { a: "start", fs: 12 }) + r(px + 62, 29, 14, 14, { rx: 2, cls: "fill-bad" }) + t(px + 84, 40, "fail", { a: "start", fs: 12 }) + c(px + 132, 36, 7, { cls: "fx-acc" }) + t(px + 146, 40, "new", { a: "start", fs: 12 });
    s += g({ on: "1" }, tl(px, 135, "sorted by distance:|1. pass (2.0)|2. pass (3.1)|3. fail (4.0)|4. fail (4.8)|5. fail (5.5)", { a: "start", fs: 12.5, lh: 22 }));
    const vote = (k, pa, fa, res) => box(px, 70, 176, 44, "k = " + k, { cls: "fx-soft", fs: 13 }) + t(px, 140, "pass votes: " + pa, { a: "start", fs: 13 }) + t(px, 164, "fail votes: " + fa, { a: "start", fs: 13 }) +
      box(px, 186, 176, 50, "prediction: " + res, { cls: res === "pass" ? "fx-ok" : "fx-bad", fs: 13.5 });
    s += g({ on: "2" }, vote(1, 1, 0, "pass")) + g({ on: "3" }, vote(3, 2, 1, "pass")) + g({ on: "4" }, vote(5, 2, 3, "fail"));
    s += g({ on: "5" }, tl(px, 140, "k is a hyperparameter:|small k → follows noise|large k → too smooth|odd k → no ties (2 classes)|choose k via cross validation", { a: "start", fs: 12.5, lh: 22 }));
    return svg(640, 300, s); },
  steps: [
    "Seven labelled students (green circle = pass, red square = fail) and one new student “?”. kNN has no training phase: it just stores the points.",
    "For the new point, compute the distance to <b>every</b> training point and sort them. That is why kNN gets slow on large datasets.",
    "<b>k = 1:</b> only the closest neighbour votes → <b>pass</b>.",
    "<b>k = 3:</b> pass, pass, fail → 2 : 1 → <b>pass</b>.",
    "<b>k = 5:</b> pass, pass, fail, fail, fail → 2 : 3 → <b>fail</b>. Same data, different k, different prediction!",
    "So k must be chosen with care: small k overfits, large k underfits. Pick an odd k for two classes and compare candidates with cross validation. And scale the features first, otherwise the distances are meaningless."
  ] };

/* D · Train/test split without leakage (w13-1) */
FIG["dasc-split"] = { title: "Train / test split and a leakage-free workflow",
  svg: () => svg(640, 300,
    box(14, 120, 112, 60, "Full dataset|1 000 rows", { cls: "fx-card", fs: 12.5 }) +
    g({ st: 1 }, l(126, 140, 170, 82, { arrow: true }) + l(126, 160, 170, 222, { arrow: true }) +
      box(172, 56, 128, 50, "Training set|800 rows (80 %)", { cls: "fx-soft", fs: 12 }) + box(172, 196, 128, 50, "Test set|200 rows (20 %)", { cls: "fx-warn", fs: 12 }) +
      FX.lock(150, 262, {}) + t(236, 268, "locked until the very end", { fs: 11, cls: "fx-sub" })) +
    g({ st: 2 }, l(300, 81, 334, 81, { arrow: true, acc: true, cls: "acc" }) + box(336, 52, 132, 58, "Scaler.fit(train)|mean, std from|train only", { cls: "fx-acc", fs: 11.5, lh: 14 })) +
    g({ st: 3 }, l(468, 81, 498, 81, { arrow: true, acc: true, cls: "acc" }) + box(500, 52, 126, 58, "model.fit(|scaled train)", { cls: "fx-acc", fs: 12, lh: 15 })) +
    g({ st: 4 }, l(300, 221, 334, 221, { arrow: true }) + box(336, 194, 132, 54, "transform(test)|with train stats", { cls: "fx-card", fs: 11.5, lh: 14 }) +
      l(402, 112, 402, 192, { arrow: true, cls: "dash" }) + l(468, 221, 498, 221, { arrow: true }) + l(563, 112, 563, 192, { arrow: true, cls: "dash" }) +
      box(500, 194, 126, 54, "predict & score|once → report", { cls: "fx-ok", fs: 11.5, lh: 14 })) +
    g({ on: "5" }, p("M236 196 C 250 150, 330 140, 380 112", { arrow: true, cls: "bad dash" }) + box(214, 128, 120, 26, "LEAK: fit on all data", { cls: "fx-bad", fs: 11 }))),
  steps: [
    "You have one dataset. Before you look at any model, decide how you will measure success on <b>unseen</b> data.",
    "<code>train_test_split(X, y, test_size=0.2, random_state=42)</code>: 80 % for learning, 20 % locked away. Use <code>stratify=y</code> for imbalanced classes, a chronological split for time series.",
    "Preprocessing is learned too: the scaler’s mean and standard deviation are computed from the <b>training set only</b>.",
    "The model is fitted on the scaled training data. Tuning (k, depth, degree) happens with a validation set or cross validation inside the training data.",
    "At the very end the test set is transformed with the <b>training</b> statistics, the model predicts and you report the score – once.",
    "The classic mistake: scaling or imputing the full dataset before the split. Test information leaks into training and the reported score is too optimistic. A scikit-learn <code>Pipeline</code> prevents this automatically."
  ] };

/* =====================================================================
   WORKED EXAMPLES (one or more per lesson)
   ===================================================================== */
const EXW = "Worked example", EXP = "Real-world example";
const ex = (label, title, html) => ({ t: "example", label, title, html });
const chk = (q, opts, a, why) => ({ t: "check", q, opts, a, why });

const BLOCKS = {
  "w0-1": [ex(EXP, "Setting up homework 1 from scratch", `Goal: a clean project for the first assignment that runs the same on your laptop and on the Debian exam image.
${code(`$ uv init dasc-hw1
$ cd dasc-hw1
$ uv add numpy pandas matplotlib     # creates .venv/ and uv.lock
$ uv run python -c "import pandas; print(pandas.__version__)"`)}
What ends up in the folder and what goes to Git:
${T(["file / folder", "what it is", "commit?"], [["pyproject.toml", "list of dependencies (e.g. pandas&gt;=2.2)", "yes"], ["uv.lock", "exact versions of every package", "yes"], ["main.py", "your code", "yes"], [".venv/", "the local environment (hundreds of MB)", "no – add to .gitignore"]])}
On another machine, <code>git clone …</code> followed by <code>uv sync</code> rebuilds exactly the same environment from <code>uv.lock</code>.`)],

  "w0-2": [ex(EXP, "A typical evening: from change to GitLab", `You fixed a bug in <code>analysis.py</code> and added a new CSV that should <b>not</b> be versioned.
${code(`$ git status
  modified:   analysis.py
  Untracked:  data/raw_export.csv
$ echo "data/raw_export.csv" >> .gitignore
$ git add analysis.py .gitignore
$ git commit -m "Fix median calculation for missing attendance"
$ git push
  ! [rejected] main -> main (fetch first)
$ git pull --rebase      # get your teammate's commit first
$ git push               # now it works`)}
Lessons: (1) stage only what belongs in the repo, (2) write messages that say <i>what</i> and <i>why</i>, (3) a rejected push just means the remote has commits you do not have yet – pull first, then push.`)],

  "w0-3": [ex(EXP, "One key, one config entry, done", `After <code>ssh-keygen -t ed25519 -C "kevin@fh"</code> you have two files. Paste the content of <code>~/.ssh/id_ed25519.pub</code> into GitLab. To avoid typing options, add a host entry:
${code(`# ~/.ssh/config
Host gitlab.itplus.fh-joanneum.at
    User git
    IdentityFile ~/.ssh/id_ed25519

$ chmod 600 ~/.ssh/id_ed25519      # private key readable only by you
$ ssh -T git@gitlab.itplus.fh-joanneum.at
Welcome to GitLab, @kevin!`)}
If you see “Permission denied (publickey)”, check: is the <b>.pub</b> file uploaded, does the config point to the right private key, and are the file permissions strict enough?`)],

  "w1-1": [ex(EXP, "“Our ski rental revenue is dropping” – turning a symptom into a question", `A Styrian ski rental chain reports 12 % less revenue than last season. A data scientist uses all three circles of Conway’s diagram:
${T(["circle", "what it contributes here"], [["Substantive expertise", "Which shops, which products (skis vs. snowboards), since when? Was there less snow? Did a competitor open?"], ["Math &amp; statistics", "Is −12 % unusual given the year-to-year variation? Compare per shop and per week, control for snow days."], ["Hacking skills", "Join booking data, weather data and shop data with pandas; automate the weekly report."]])}
The sharpened question: <i>“Which shops lost the most rentals per snow day since December, and is the loss concentrated in online bookings?”</i> Only now does modelling make sense.`)],

  "w1-2": [ex(EXP, "Pseudonymising a student dataset before analysis", `You get exam data with names and student IDs. You only need performance patterns, not identities (GDPR: <b>data minimisation</b> and <b>purpose limitation</b>).
${code(`import hashlib
import pandas as pd

df = pd.read_csv("students.csv")
salt = "keep-this-secret"
df["pid"] = df["student_id"].astype(str).apply(
    lambda s: hashlib.sha256((salt + s).encode()).hexdigest()[:10])
df = df.drop(columns=["name", "student_id", "email"])   # keep only what you need`)}
Important: this is <b>pseudonymisation</b>, not anonymisation. Whoever knows the salt can re-identify people, so the data is still personal data under GDPR and must be protected. Rare combinations (e.g. the only 45-year-old in a group) can also reveal a person.`)],

  "w2-1": [ex(EXP, "Spam filter: symbolic rules vs. machine learning", `<b>Symbolic AI</b> – a human writes the rules:
${code(`def is_spam(mail):
    return "free money" in mail.lower() or mail.count("!") > 5`)}
Transparent, but spammers write “fr3e m0ney” and the rule fails. Every new trick needs a new rule.<br>
<b>Machine learning</b> – the structure is chosen (e.g. naive Bayes over word counts), the parameters are learned from 10 000 labelled emails:
${code(`from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
X = CountVectorizer().fit_transform(mails)
model = MultinomialNB().fit(X, labels)`)}
Retraining on new examples adapts the filter without rewriting code. The inductive bias here is “words are independent given the class”.`)],

  "w2-2": [ex(EXW, "Next-token probabilities with softmax", `Prompt: “The exam takes place on …”. The model outputs a score (logit) for each candidate token. Softmax turns scores into probabilities: p<sub>i</sub> = e<sup>z<sub>i</sub></sup> / Σ e<sup>z<sub>j</sub></sup>.
${T(["token", "logit z", "e<sup>z</sup>", "p"], [["Monday", "2.0", "7.389", "65.9 %"], ["Friday", "1.0", "2.718", "24.2 %"], ["Mars", "0.1", "1.105", "9.9 %"], ["sum", "", "11.212", "100 %"]])}
With <b>temperature</b> T = 0.5 the logits are divided by T first (4.0, 2.0, 0.2): probabilities become 86.4 %, 11.7 %, 1.9 % – more deterministic. A higher temperature flattens the distribution and makes “creative” (and wrong) tokens like “Mars” more likely. Nothing in this calculation checks whether the sentence is true.`)],

  "w3-1": [ex(EXP, "From a handwritten rule to a learned rule", `<b>Classical software:</b> the lecturer guesses a rule: “pass if hours ≥ 5”. Rule + input → answer.<br>
<b>Machine learning:</b> we have input data X (hours, attendance) and response data y (passed yes/no) for 200 past students. Training produces the rule:
${code(`from sklearn.tree import DecisionTreeClassifier
model = DecisionTreeClassifier(max_depth=2)
model.fit(X_train, y_train)        # input + responses  ->  rule set (model)
model.predict([[4.0, 0.85]])       # inference on a new student  ->  array([1])`)}
The learned rule might be “pass if hours &gt; 3.75, or if attendance ≥ 70 %” – found from the data, not written by hand. Whether it is good is decided on <b>new</b> students (test data), not on the 200 it learned from.`)],

  "w3-2": [ex(EXW, "Two kitchen scales, one 500 g weight", `Five readings each:
${T(["scale", "readings (g)", "mean", "bias", "std (n−1)", "MSE"], [["A", "502, 503, 502, 503, 502", "502.4", "+2.4", "0.55", "6.0"], ["B", "495, 506, 498, 503, 498", "500.0", "0.0", "4.42", "15.6"]])}
MSE = mean of (reading − 500)². Scale A: (4 + 9 + 4 + 9 + 4) / 5 = 6.0 = bias² + variance = 5.76 + 0.24. Scale B: (25 + 36 + 4 + 9 + 4) / 5 = 15.6.<br>
Scale A is <b>precise but not accurate</b> – and still better overall. Even better: its systematic error can be calibrated away (subtract 2.4 g). Scale B is accurate on average, but each single reading can be 5 g off; only averaging many readings helps.`), { t: "calc", id: "dasc-meas" }],

  "w3-3": [ex(EXW, "Computing a correlation – and why it proves nothing about causes", `Five summer weeks: temperature x (°C), ice cream sales y, sunburn cases z.
${T(["week", "x", "y", "z"], [["1", "15", "120", "3"], ["2", "20", "150", "5"], ["3", "25", "210", "8"], ["4", "30", "260", "12"], ["5", "35", "290", "14"]])}
Pearson r(x, y) = Σ(x−x̄)(y−ȳ) / √(Σ(x−x̄)² · Σ(y−ȳ)²) = 2 250 / √(250 · 20 520) = <b>0.993</b>.<br>
r(y, z) between ice cream and sunburn = 1 318 / √(20 520 · 85.2) = <b>0.997</b> – even higher! Yet banning ice cream would not prevent a single sunburn. Temperature (sunshine) is the confounder that drives both.
${code(`df[["temp", "ice_cream", "sunburn"]].corr()`)}`)],

  "w4-1": [ex(EXP, "Five business problems, five families", T(["problem", "data available", "family"], [
    ["Predict tomorrow’s electricity demand in Graz", "past demand with true values", "supervised (regression)"],
    ["Detect unusual logins on a server", "logs, no “attack” labels", "unsupervised (anomaly detection)"],
    ["Group 50 000 shop customers into segments", "purchase history, no segments", "unsupervised (clustering)"],
    ["Recommend films", "few ratings, many clicks", "semi-supervised"],
    ["Robot arm learns to grasp objects", "reward when the grip holds", "reinforcement learning"]])),
    chk("A bank has millions of transactions but only 2 000 confirmed fraud cases. It trains on both the labelled and the unlabelled data. Which family?", ["Supervised", "Unsupervised", "Semi-supervised", "Reinforcement"], 2, "Few labels plus a lot of unlabelled data is the definition of semi-supervised learning.")],

  "w4-2": [ex(EXP, "One flat dataset, two supervised questions", `Data from a Graz rental platform: size (m²), rooms, district, rent (€), rented within 30 days (yes/no).
${code(`from sklearn.linear_model import LinearRegression, LogisticRegression
X = df[["size_m2", "rooms"]]

reg = LinearRegression().fit(X, df["rent"])            # regression: a number
reg.predict([[60, 2]])       # -> array([812.4])  € per month

clf = LogisticRegression().fit(X, df["rented_30d"])    # classification: a class
clf.predict_proba([[60, 2]]) # -> array([[0.27, 0.73]])  73 % "yes"`)}
Same features, different target type. A continuous target (rent) → regression, typical metrics MAE/RMSE. A categorical target (yes/no) → classification, typical metrics precision/recall.`)],

  "w4-3": [ex(EXP, "Customer segments without labels", `An online shop computes three features per customer: <b>R</b>ecency (days since last purchase), <b>F</b>requency (orders per year), <b>M</b>onetary value (€ per year). Nobody knows the “right” segments.
${code(`from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
X = StandardScaler().fit_transform(df[["recency", "frequency", "monetary"]])
df["segment"] = KMeans(n_clusters=4, n_init=10, random_state=0).fit_predict(X)
df.groupby("segment")[["recency", "frequency", "monetary"]].mean()`)}
The algorithm only returns cluster numbers 0–3. A human interprets them afterwards, e.g. “loyal big spenders”, “one-time buyers”, “sleeping customers”. That interpretation step is typical for unsupervised learning.`)],

  "w4-4": [ex(EXW, "One Q-learning update by hand", `A delivery robot is in state s (aisle 3) and takes action a (“go left”). It receives reward r = −1 (one time step), lands in s′ where the best known value is max Q(s′, a′) = 6. Current Q(s, a) = 2, learning rate α = 0.5, discount γ = 0.9.<br>
Target: r + γ · max Q(s′, a′) = −1 + 0.9 · 6 = <b>4.4</b><br>
Update: Q(s, a) ← 2 + 0.5 · (4.4 − 2) = 2 + 1.2 = <b>3.2</b><br>
“Go left in aisle 3” now looks better than before. With ε-greedy (ε = 0.1) the robot still takes a random action in 10 % of the steps so it can discover routes it has not tried yet.`),
    chk("Q(s,a) = 5, α = 0.1, r = 2, γ = 0.9, max Q(s′,a′) = 10. New Q(s,a)?", ["5.6", "11", "6.1", "5.0"], 0, "Target = 2 + 0.9 · 10 = 11. Q ← 5 + 0.1 · (11 − 5) = 5.6.")],

  "w5-1": [ex(EXP, "Wald’s numbers and a modern twin", `In Jordan Ellenberg’s retelling, the returning planes showed about 1.11 bullet holes per square foot on the engines, but 1.73 on the fuselage and 1.8 on the rest of the plane. Abraham Wald’s conclusion: the “missing” holes on the engines are on the planes that did <b>not</b> come back – armour the engines.<br>
<b>Modern twin:</b> an app team analyses only reviews of users who are still active and concludes “nobody complains about the login”. The users who failed at the login uninstalled the app and never wrote a review. Survivorship bias again: the data you are missing is the data that matters.`),
    chk("A gym studies only members who trained for at least 2 years and finds that 90 % follow a strict diet. Which conclusion is safe?", ["A strict diet makes people stay 2 years", "Among long-term members, strict diets are common – nothing can be said about those who quit", "Everyone should follow a strict diet", "Diets have no effect"], 1, "Members who quit are missing from the data. Without them, you cannot compare the dropout rate with and without diet.")],

  "w5-2": [ex(EXW, "Survivorship bias in fund performance", `100 investment funds start in 2016. By 2026, 40 have been closed because of poor results. A brochure reports the average return of the <b>surviving</b> funds: <b>8 % per year</b>.<br>
The closed funds averaged −1.5 % per year while they existed. Over all funds started: (60 · 8 % + 40 · (−1.5 %)) / 100 = (480 − 60) / 100 = <b>4.2 %</b>.<br>
The real expectation for a new investor is roughly half of what the brochure suggests. The same pattern hides in “success stories” of start-ups, careers and diets.`)],

  "w6-1": [ex(EXP, "A churn project walking through the lifecycle – with loops", T(["stage", "what happens", "loop back?"], [
    ["Business understanding", "Telecom wants to reduce cancellations. Success = 5 % fewer cancellations in 6 months.", ""],
    ["Data acquisition &amp; understanding", "Contracts, calls, complaints. 30 % of the complaint data is missing for 2023.", "back to business: is 2023 needed?"],
    ["Modeling", "Features (complaints last 90 days), logistic regression and a tree, evaluated with recall.", "back to data: a new feature “price increase” is needed"],
    ["Deployment", "Weekly scoring, list of risky customers to the call centre, monitoring of performance.", "drift after a price change → retrain"],
    ["Customer acceptance", "The call centre confirms the list is useful; KPI tracked.", "new question → next cycle"]])),
    chk("Which TDSP stage defines what “success” means for the project?", ["Modeling", "Business understanding", "Deployment", "Data acquisition"], 1, "Objectives and success criteria are set at the very beginning, in business understanding.")],

  "w7-1": [ex(EXW, "Plain Python on a small grade list", code(`scores = {"Anna": 72, "Ben": 45, "Cara": 88, "Dan": 54}

def grade(points):
    return "pass" if points >= 50 else "fail"

mean = sum(scores.values()) / len(scores)          # (72+45+88+54)/4 = 64.75
results = {name: grade(p) for name, p in scores.items()}
passed = [name for name, p in scores.items() if p >= 50]

counts = {}
for r in results.values():
    counts[r] = counts.get(r, 0) + 1

print(mean)      # 64.75
print(passed)    # ['Anna', 'Cara', 'Dan']
print(counts)    # {'pass': 3, 'fail': 1}`) + "Everything pandas does later (mean, filter, value counts) you can do with these building blocks – pandas just does it faster and with less code."),
    chk("What does <code>[x * 2 for x in [1, 5, 8] if x &gt; 3]</code> return?", ["[2, 10, 16]", "[10, 16]", "[5, 8]", "[1, 5, 8]"], 1, "Only 5 and 8 pass the filter x &gt; 3; each is doubled.")],

  "w7-2": [{ t: "fig", id: "dasc-groupby" }, ex(EXW, "Filter, new column, groupby on the students table", code(`import pandas as pd
df = pd.DataFrame({
    "name":   ["Anna", "Ben", "Cara", "Dan", "Eva", "Finn"],
    "course": ["WI", "SWD", "WI", "IMS", "SWD", "WI"],
    "hours":  [6, 2, 8, 1, 5, 7],
    "score":  [72, 65, 88, 54, 81, 80]})

df[df["hours"] > 5]                       # Anna, Cara, Finn
df["passed"] = df["score"] >= 60           # new boolean column
df["passed"].mean()                        # 0.8333  (5 of 6 passed)
df.groupby("course")["score"].mean()
# course
# IMS    54.0
# SWD    73.0
# WI     80.0
df.groupby("course").agg(avg=("score", "mean"), n=("score", "count"))`) + "Tip: the mean of a boolean column is the share of <code>True</code> values – a quick way to compute pass rates."),
    chk("What does <code>df.groupby(\"course\")[\"score\"].mean()</code> return?", ["One number: the overall mean", "A Series with one mean per course, the courses as index", "The original DataFrame, sorted by course", "A list of groups"], 1, "Split by course, compute the mean per group, combine the results into a Series indexed by the group keys.")],

  "w8-1": [{ t: "calc", id: "dasc-desc" }, ex(EXW, "Reading describe() and handling an outlier", `${code(`df["score"].describe()
count     6.000000
mean     76.666667
std      11.165423
min      62.000000
25%      71.000000
50%      76.000000
75%      80.250000
max      95.000000`)}
Interpretation: the mean (76.7) is above the median (76.0) – the 95 pulls it up. IQR = 80.25 − 71 = 9.25, upper fence = 80.25 + 1.5 · 9.25 = 94.125, so 95 is flagged as an outlier. Check whether it is an error (typo?) or a real top student before you remove anything.<br>
Missing values: <code>df.isna().sum()</code> counts them per column; <code>df["attendance"].fillna(df["attendance"].median())</code> fills them with the robust median.`),
    chk("A column has mean 3 200 € and median 2 400 €. What is most likely?", ["The data is symmetric", "A few very high values pull the mean up (right skew)", "There are many missing values", "The median was computed wrongly"], 1, "Mean far above median signals a long right tail, typical for incomes and prices.")],

  "w9-1": [ex(EXW, "Least squares by hand with five students", `Hours x = 1, 2, 3, 4, 5 · scores y = 50, 54, 61, 63, 72. Means: x̄ = 3, ȳ = 60.
${T(["x", "y", "x − x̄", "y − ȳ", "(x−x̄)(y−ȳ)", "(x−x̄)²"], [["1", "50", "−2", "−10", "20", "4"], ["2", "54", "−1", "−6", "6", "1"], ["3", "61", "0", "1", "0", "0"], ["4", "63", "1", "3", "3", "1"], ["5", "72", "2", "12", "24", "4"], ["Σ", "", "", "", "53", "10"]])}
m = 53 / 10 = <b>5.3</b> points per hour · b = ȳ − m · x̄ = 60 − 5.3 · 3 = <b>44.1</b><br>
Predictions 49.4, 54.7, 60.0, 65.3, 70.6 → residuals 0.6, −0.7, 1.0, −2.3, 1.4 → SS<sub>res</sub> = 9.1, MSE = 1.82.<br>
SS<sub>tot</sub> = 100 + 36 + 1 + 9 + 144 = 290 → R² = 1 − 9.1 / 290 = <b>0.969</b>. A student with 6 hours is predicted 5.3 · 6 + 44.1 = 75.9 points.`), { t: "calc", id: "dasc-lin" },
    chk("ŷ = 4·x + 50. A student with x = 5 scored 75. What is the residual e = y − ŷ?", ["+5", "−5", "70", "25"], 0, "ŷ = 4 · 5 + 50 = 70, e = 75 − 70 = +5. Positive residual: the student is above the line, the model underestimates.")],

  "w10-1": [ex(EXW, "Two gradient descent steps for ŷ = m·x + b", `Data: (1; 3) and (2; 5). Start m = 0, b = 0, η = 0.1, loss = MSE.<br>
<b>Step 1:</b> ŷ = 0, 0 → residuals 3, 5 → L = (9 + 25) / 2 = 17.<br>
∂L/∂m = −(2/n) Σ x(y − ŷ) = −(2/2)(1·3 + 2·5) = −13 · ∂L/∂b = −(2/2)(3 + 5) = −8<br>
m = 0 − 0.1 · (−13) = <b>1.3</b>, b = 0 − 0.1 · (−8) = <b>0.8</b><br>
<b>Step 2:</b> ŷ = 2.1, 3.4 → residuals 0.9, 1.6 → L = (0.81 + 2.56) / 2 = 1.685.<br>
∂L/∂m = −(0.9 + 3.2) = −4.1 · ∂L/∂b = −(0.9 + 1.6) = −2.5 → m = <b>1.71</b>, b = <b>1.05</b>, L = 0.169.<br>
The loss falls 17 → 1.69 → 0.17 and heads for the exact line m = 2, b = 1.
${code(`for epoch in range(1000):
    y_hat = m * x + b
    dm = -2 / n * np.sum(x * (y - y_hat))
    db = -2 / n * np.sum(y - y_hat)
    m, b = m - lr * dm, b - lr * db`)}`), { t: "calc", id: "dasc-gd" },
    chk("The gradient dL/dw at the current w is +4 and η = 0.05. How does w change?", ["It increases by 0.2", "It decreases by 0.2", "It decreases by 4", "It stays the same"], 1, "w ← w − η · gradient = w − 0.05 · 4 = w − 0.2. A positive slope means downhill is to the left.")],

  "w11-1": [ex(EXW, "Probabilities, boundary and log-loss for two students", `Fitted model: p(pass) = σ(1.2 · hours − 4.5).
${T(["student", "hours", "z", "p = σ(z)", "class (t = 0.5)", "true y", "log-loss"], [["Lea", "3", "−0.9", "0.289", "fail", "1", "−ln 0.289 = 1.241"], ["Max", "5", "1.5", "0.818", "pass", "1", "−ln 0.818 = 0.201"]])}
Decision boundary: p = 0.5 ⇔ z = 0 ⇔ hours = 4.5 / 1.2 = <b>3.75 h</b>.<br>
Lea was misclassified (she passed), so her loss is six times higher. Training minimises the average log-loss over all students. Interpretation of w = 1.2: every extra hour multiplies the odds of passing by e<sup>1.2</sup> ≈ 3.3.`), { t: "calc", id: "dasc-sig" },
    chk("With w = 2 and b = −6, at how many hours is p(pass) exactly 0.5?", ["2", "3", "6", "−3"], 1, "p = 0.5 when z = 0: 2·x − 6 = 0 → x = 3.")],

  "w12-1": [ex(EXP, "Comparing the four methods on the same data", code(`from sklearn.model_selection import cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

models = {
    "kNN (k=5)": make_pipeline(StandardScaler(), KNeighborsClassifier(5)),
    "tree (depth 3)": DecisionTreeClassifier(max_depth=3),
    "naive Bayes": GaussianNB()}
for name, m in models.items():
    s = cross_val_score(m, X, y, cv=5)
    print(f"{name:15s} {s.mean():.3f} ± {s.std():.3f}")
# example output:
# kNN (k=5)       0.842 ± 0.031
# tree (depth 3)  0.815 ± 0.044
# naive Bayes     0.797 ± 0.027`) + "Same interface (<code>fit</code>/<code>predict</code>), fair comparison with the same folds. k-means is missing on purpose: it is unsupervised and has no y to be scored against.")],

  "w12-2": [{ t: "fig", id: "dasc-knn" }, ex(EXW, "Why scaling changes the nearest neighbour", `New student: 4 hours, 80 % attendance. Three training students:
${T(["student", "hours", "attendance", "label", "raw distance", "scaled distance"], [["A", "6.0", "78", "pass", "√(2² + 2²) = 2.83", "√(1.0² + 0.2²) = 1.02"], ["B", "4.2", "74", "fail", "√(0.2² + 6²) = 6.00", "√(0.1² + 0.6²) = 0.61"], ["C", "1.0", "81", "fail", "√(3² + 1²) = 3.16", "√(1.5² + 0.1²) = 1.50"]])}
Scaled: hours divided by their standard deviation (2 h), attendance by its standard deviation (10 %-points).<br>
Raw: the nearest neighbour is A → <b>pass</b>. Scaled: the nearest is B → <b>fail</b>. Attendance has the larger numeric range and dominated the raw distance. With <code>StandardScaler</code> both features count equally.`)],

  "w12-3": [ex(EXW, "Choosing the first split of a tree", `10 students, 6 pass and 4 fail. Gini of the root: 1 − 0.6² − 0.4² = <b>0.48</b>.<br>
Candidate split “hours ≤ 3.75?”: left 4 students (1 pass, 3 fail), right 6 students (5 pass, 1 fail).<br>
Gini left = 1 − (1/4)² − (3/4)² = 0.375 · Gini right = 1 − (5/6)² − (1/6)² = 0.278<br>
Weighted = 0.4 · 0.375 + 0.6 · 0.278 = <b>0.317</b> → gain = 0.48 − 0.317 = <b>0.163</b>.<br>
Candidate “attendance ≥ 70 %?”: left 5 (3 pass, 2 fail), right 5 (3 pass, 2 fail) → both 0.48, gain 0. Useless. CART picks the hours split.`), { t: "calc", id: "dasc-gini" }],

  "w12-4": [{ t: "fig", id: "dasc-kmeans" }, ex(EXW, "k-means in one dimension by hand", `Monthly spending of six customers (in 100 €): 1, 2, 4, 9, 10, 14. k = 2, start centres c₁ = 1, c₂ = 4.<br>
<b>Assign:</b> 1, 2 → c₁; 4, 9, 10, 14 → c₂ · <b>Update:</b> c₁ = 1.5, c₂ = (4 + 9 + 10 + 14) / 4 = 9.25<br>
<b>Assign:</b> 4 is now closer to 1.5 (distance 2.5) than to 9.25 (5.25) → c₁ = {1, 2, 4}, c₂ = {9, 10, 14}<br>
<b>Update:</b> c₁ = 7 / 3 = 2.33, c₂ = 33 / 3 = 11 · <b>Assign:</b> nothing changes → converged.<br>
Inertia = (1 − 2.33)² + (2 − 2.33)² + (4 − 2.33)² + (9 − 11)² + (10 − 11)² + (14 − 11)² = 4.67 + 14 = <b>18.67</b>.`)],

  "w12-5": [ex(EXW, "Spam or not? Two words, one decision", `Training statistics: 30 % of emails are spam. “free” appears in 40 % of spam and 5 % of ham; “meeting” in 2 % of spam and 20 % of ham.<br>
Email with “free” only: spam score 0.3 · 0.4 = 0.12, ham score 0.7 · 0.05 = 0.035 → P(spam) = 0.12 / 0.155 = <b>77 %</b>.<br>
Email with “free” and “meeting”: spam 0.12 · 0.02 = 0.0024, ham 0.035 · 0.20 = 0.007 → P(spam) = 0.0024 / 0.0094 = <b>26 %</b> → ham.<br>
<b>Laplace smoothing:</b> if “webinar” never appeared in 1 000 spam words with a vocabulary of 500 words, use (0 + 1) / (1 000 + 500) = 0.00067 instead of 0 – otherwise one word would force P(spam) = 0.`), { t: "calc", id: "dasc-bayes" }],

  "w13-1": [{ t: "fig", id: "dasc-split" }, ex(EXP, "Leaky vs. clean preprocessing in scikit-learn", `${code(`# WRONG: the scaler sees the test rows -> leakage
X_scaled = StandardScaler().fit_transform(X)
X_tr, X_te, y_tr, y_te = train_test_split(X_scaled, y, test_size=0.2)

# RIGHT: split first, every preprocessing step is fitted on train only
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2,
                                          stratify=y, random_state=42)
pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(5))
pipe.fit(X_tr, y_tr)
print(pipe.score(X_tr, y_tr), pipe.score(X_te, y_te))   # 0.86  0.83`)}
A small gap between training (0.86) and test (0.83) score is normal. Training 0.99 and test 0.71 would signal overfitting; both at 0.62 would signal underfitting.`), { t: "calc", id: "dasc-ovf" }],

  "w13-2": [ex(EXW, "Fraud detection: why 99 % accuracy is not enough", `10 000 card transactions, 50 of them fraud. The model raises 120 alarms, 40 of which are real fraud.<br>
TP = 40, FP = 80, FN = 10, TN = 10 000 − 40 − 80 − 10 = 9 870.
${T(["metric", "calculation", "value"], [["Accuracy", "(40 + 9 870) / 10 000", "99.1 %"], ["Precision", "40 / 120", "33.3 %"], ["Recall", "40 / 50", "80.0 %"], ["Specificity", "9 870 / 9 950", "99.2 %"], ["F1", "2 · 0.333 · 0.8 / 1.133", "47.1 %"]])}
The trivial model “never fraud” already reaches 99.5 % accuracy. Business view: two out of three alarms are false (annoyed customers), but 80 % of the fraud is caught. Raising the threshold would increase precision and lower recall.`), { t: "calc", id: "dasc-conf" }],

  "w13-3": [ex(EXW, "Reporting cross-validation scores", `${code(`scores = cross_val_score(model, X, y, cv=5)
scores          # array([0.82, 0.79, 0.85, 0.80, 0.84])
scores.mean()   # 0.82
scores.std()    # 0.0228   (NumPy default: population std)`)}
Report: <b>0.82 ± 0.02</b>. Each of the 5 models was trained on 80 % and tested on a different 20 % of the data.<br>
A second model gets 0.83 ± 0.06 (scores between 0.75 and 0.90). It is <b>not</b> clearly better: the difference of 0.01 is far smaller than its fold-to-fold spread. Prefer the more stable model, or collect more data.<br>
Tuning with <code>GridSearchCV(model, {"n_neighbors": [3, 5, 7, 9]}, cv=5)</code> trains 4 · 5 = 20 models plus one final refit on all training data.`),
    chk("cross_val_score returns [0.70, 0.90, 0.72, 0.88, 0.80]. What should worry you most?", ["The mean of 0.80", "The large spread between folds", "That there are 5 scores", "Nothing"], 1, "A spread of ±0.08 means the result depends strongly on which rows land in the test fold – the estimate is unstable.")],

  "w14-1": [ex(EXW, "Three steps of the bathtub model", `Stock S (water in litres), inflow 8 L/min, outflow 0.1 · S per minute, start S₀ = 20, time step Δt = 1 min.
${T(["t", "S", "inflow", "outflow 0.1·S", "net flow", "S next"], [["0", "20.00", "8", "2.00", "+6.00", "26.00"], ["1", "26.00", "8", "2.60", "+5.40", "31.40"], ["2", "31.40", "8", "3.14", "+4.86", "36.26"]])}
The net flow shrinks every step: a <b>balancing loop</b> (more water → more outflow). Equilibrium where inflow = outflow: 8 = 0.1 · S → <b>S* = 80 L</b>. Doubling the inflow to 16 doubles the equilibrium to 160 L, but the time to get there stays the same (time constant 1 / 0.1 = 10 min).`)],

  "w14-2": [ex(EXW, "Euler vs. exact solution for logistic growth", `dN/dt = r · N · (1 − N/K) with r = 0.5, K = 100, N₀ = 10, Δt = 1.
${T(["t", "N (Euler)", "dN/dt", "N + Δt · dN/dt"], [["0", "10.00", "0.5 · 10 · 0.90 = 4.50", "14.50"], ["1", "14.50", "0.5 · 14.5 · 0.855 = 6.20", "20.70"], ["2", "20.70", "0.5 · 20.7 · 0.793 = 8.21", "28.91"]])}
Exact: N(3) = K / (1 + (K/N₀ − 1) · e<sup>−r·t</sup>) = 100 / (1 + 9 · e<sup>−1.5</sup>) = 100 / 3.008 = <b>33.24</b>. Euler gives 28.91 – it lags behind because it uses the (lower) growth rate at the start of each step. With Δt = 0.1 the Euler result is much closer to the exact value.`)],

  "w14-3": [ex(EXW, "One SIR time step – and what an agent model adds", `Town with N = 1 000 people: S = 990 susceptible, I = 10 infected, R = 0. Contact rate β = 0.3 per day, recovery rate γ = 0.1 per day (10 days ill), Δt = 1 day.<br>
New infections = β · S · I / N = 0.3 · 990 · 10 / 1 000 = <b>2.97</b> · recoveries = γ · I = <b>1.0</b><br>
→ S = 987.03, I = 11.97, R = 1.0. Basic reproduction number R₀ = β / γ = 3: one infected person infects three others at the start.<br>
An agent-based version gives every person a location, age and contact network. Result: the same average R₀ can produce very different outbreaks if a few “super-spreaders” have many contacts – something the equation cannot show.`)],

  "w14-4": [ex(EXW, "Estimating π and its uncertainty", `${code(`rng = np.random.default_rng(42)
n = 10_000
x, y = rng.random(n), rng.random(n)
inside = (x**2 + y**2 <= 1)
pi_hat = 4 * inside.mean()        # e.g. 3.1416
se = 4 * inside.std() / np.sqrt(n) # about 0.0164`)}
Each sample contributes 4 or 0, with standard deviation 4 · √(p(1 − p)) = 4 · √(0.785 · 0.215) ≈ 1.642. Standard error = 1.642 / √10 000 = 0.0164, so the 95 % interval is about π̂ ± 0.032.<br>
For ± 0.01 you need n = (1.96 · 1.642 / 0.01)² ≈ 103 600 samples – roughly ten times more for three times the precision.`), { t: "calc", id: "dasc-mc" }]
};

/* =====================================================================
   QUESTIONS
   ===================================================================== */
let qn = 0;
const Q = (topic, q, opts, a, why, exs = "") => ({ id: "px-dasc-" + (++qn), topic, q, opts, a, why, ex: exs });
const QUESTIONS = [
  /* tools */
  Q("tools", "Which file pins the exact version of every installed package in a uv project?", ["pyproject.toml", "uv.lock", ".venv/pyvenv.cfg", "requirements.md"], 1, "pyproject.toml lists what you need (often with ranges), uv.lock records the exact resolved versions.", "pandas>=2.2 in pyproject.toml, pandas==2.2.3 in uv.lock"),
  Q("tools", "Which part of a uv project should NOT be committed to Git?", ["pyproject.toml", "uv.lock", ".venv/", "main.py"], 2, ".venv is large, machine-specific and can always be rebuilt with uv sync.", "Put .venv/ into .gitignore."),
  Q("tools", "A classmate cloned your repository. Which command recreates your exact environment?", ["uv init", "uv sync", "uv add", "git pull"], 1, "uv sync installs exactly what uv.lock specifies into a fresh .venv.", ""),
  Q("tools", "What does <code>uv run main.py</code> do?", ["Compiles main.py to an executable", "Runs the script inside the project’s virtual environment", "Uploads the script to GitLab", "Installs Python system-wide"], 1, "No manual activation needed: uv makes sure the project environment is used.", ""),
  Q("tools", "Why does every project get its own virtual environment?", ["To make Python faster", "Because VS Code requires it", "Because Git cannot track packages", "So that projects needing different package versions do not conflict"], 3, "Project A may need pandas 2.1, project B pandas 3 – separate environments avoid the clash.", ""),
  /* git */
  Q("git", "Which order publishes a change to GitLab?", ["commit → add → push", "add → commit → push", "push → add → commit", "status → push → commit"], 1, "Stage, record a snapshot, upload.", ""),
  Q("git", "You edited a file and ran <code>git commit -m \"fix\"</code> without <code>git add</code>. What happens?", ["The change is committed anyway", "The file is deleted", "Nothing is committed because the change is not staged", "Git pushes automatically"], 2, "Only staged changes go into a commit (unless you use commit -a).", ""),
  Q("git", "Which file keeps <code>.venv/</code> and large raw data out of the repository?", [".gitignore", "pyproject.toml", "uv.lock", "README.md"], 0, "Paths listed in .gitignore are not tracked.", ""),
  Q("git", "<code>git push</code> is rejected: “the remote contains work that you do not have locally”. Best first step?", ["Delete the remote repository", "git push --force", "git init", "git pull (fetch and integrate), then push again"], 3, "Integrate your teammate’s commits first. Force-pushing would overwrite their work.", ""),
  Q("git", "Where do you push the code you write during the lecture?", ["Into the lecturer’s course repository", "Into your own repository in your personal GitLab group", "Into a public GitHub gist", "Nowhere, Moodle only"], 1, "The course repo is maintained by the lecturer; your own work goes into your personal group.", ""),
  /* ssh */
  Q("ssh", "Which command creates a modern SSH key pair?", ["ssh -T ed25519", "git keygen", "ssh-keygen -t ed25519", "uv add ssh"], 2, "ssh-keygen with type ed25519 creates id_ed25519 and id_ed25519.pub.", ""),
  Q("ssh", "Which statement about the private key is correct?", ["It never leaves your machine and should be readable only by you", "It is uploaded to GitLab", "It is the same as the .pub file", "It is sent to the server at every login"], 0, "Only the public key is shared. During login the private key just signs a challenge.", ""),
  Q("ssh", "How do you test whether GitLab accepts your key?", ["git status", "ping gitlab", "uv run ssh", "ssh -T git@gitlab.itplus.fh-joanneum.at"], 3, "-T tests the connection without opening a shell; GitLab replies with a welcome message.", ""),
  Q("ssh", "During public-key authentication, what does the client prove?", ["That it knows the password", "That it owns the private key, by signing a challenge from the server", "That it has the public key", "That it runs Linux"], 1, "The server verifies the signature with the stored public key. No secret is transmitted.", ""),
  /* ds */
  Q("ds", "Knowing what counts as a “churned customer” in the telecom business belongs to…", ["Hacking skills", "Math & statistics", "Substantive expertise", "Machine learning"], 2, "Domain knowledge defines the problem and the target correctly.", ""),
  Q("ds", "A team has statisticians and domain experts but nobody who can code. Which area of Conway’s diagram do they cover?", ["Machine learning", "Traditional research", "Danger zone", "Data Science"], 1, "Math/stats + substantive expertise = traditional research.", ""),
  Q("ds", "Which question turns “sales are decreasing” into a workable data science problem?", ["Can we use deep learning?", "How much data do we have?", "Which dashboard tool is best?", "Which product groups in which regions dropped since Q2 compared with last year?"], 3, "A good question names the measure, the segments, the period and the comparison.", ""),
  Q("ds", "Why is the “danger zone” dangerous?", ["It produces plausible-looking analyses without sound statistics", "It is too slow", "It needs too much hardware", "It violates GDPR automatically"], 0, "Coding + domain knowledge without math produces convincing but unreliable conclusions.", ""),
  /* ethics */
  Q("ethics", "You replace student IDs by salted hashes. Under GDPR this is…", ["Anonymisation – GDPR no longer applies", "Pseudonymisation – it is still personal data", "Encryption – the data may be published", "Not allowed"], 1, "Whoever has the salt can re-identify the students, so the data stays personal data.", ""),
  Q("ethics", "Which GDPR principle says: only collect and keep the columns you really need?", ["Accuracy", "Storage limitation", "Data minimisation", "Transparency"], 2, "Data minimisation: adequate, relevant and limited to what is necessary.", ""),
  Q("ethics", "Why are deepfakes an ethical concern?", ["Realistic fake media can deceive and manipulate people", "They use too much storage", "They are always illegal to create", "They make models slower"], 0, "Fake videos of politicians or private persons can spread misinformation or harm reputations.", ""),
  Q("ethics", "A credit model does not use ethnicity but uses the postcode, which is strongly correlated with ethnicity. Risk?", ["None, the sensitive attribute is excluded", "Overfitting", "Underfitting", "Indirect discrimination through a proxy variable"], 3, "Removing a column does not remove the information if other features encode it.", ""),
  /* ai */
  Q("ai", "Which approach is subsymbolic?", ["Expert system with if-then rules", "Neural network", "Logic programming", "Decision table written by hand"], 1, "Neural networks store knowledge in learned weights, not in readable symbols.", ""),
  Q("ai", "A medical expert system built from hand-written if-then rules is…", ["Symbolic AI", "Reinforcement learning", "Swarm intelligence", "Unsupervised learning"], 0, "Explicit, human-readable rules are the hallmark of symbolic AI (GOFAI).", ""),
  Q("ai", "A chess engine that beats every human but cannot do anything else is…", ["AGI", "Superintelligence", "Narrow AI", "Fuzzy logic"], 2, "Excellent at one task only = narrow (weak) AI.", ""),
  Q("ai", "Ant colony optimisation belongs to…", ["Symbolic AI", "Fuzzy logic", "Statistical learning", "Swarm intelligence"], 3, "Many simple agents (ants) leave pheromone trails; good routes emerge from the group.", ""),
  /* llm */
  Q("llm", "Logits for three tokens: 2.0, 1.0, 0.1. Softmax probability of the first token?", ["50 %", "100 %", "≈ 66 %", "≈ 33 %"], 2, "e² / (e² + e¹ + e⁰·¹) = 7.389 / 11.212 ≈ 0.659.", ""),
  Q("llm", "Why can an LLM state wrong facts with full confidence?", ["Its database is outdated", "It generates likely tokens; nothing checks whether the statement is true", "It deliberately lies", "Transformers cannot store numbers"], 1, "Plausibility and truth are different things – this is called hallucination.", ""),
  Q("llm", "“Pre-trained” in GPT means…", ["The model was trained on a huge text corpus before being adapted to tasks", "The model was trained by the user", "The model needs no training", "Training happens at every prompt"], 0, "Pre-training on general text is followed by fine-tuning (e.g. for chat behaviour).", ""),
  Q("llm", "What does self-attention do in a transformer?", ["It removes stop words", "It counts word frequencies", "It translates tokens to images", "It lets each token weigh every other token in the context"], 3, "That is how “it” in a sentence can be linked to the right noun.", ""),
  /* mlbasics */
  Q("mlbasics", "In a spam filter, what are X and y?", ["X = spam label, y = email text", "X = features of the email, y = spam / not spam", "X = model, y = rules", "X = test set, y = training set"], 1, "Input data X describes the instance, response y is the known answer.", ""),
  Q("mlbasics", "When is ML clearly preferable to hand-written rules?", ["When the rule is simple and fixed, e.g. VAT = 20 %", "When there is no data", "When rules are too complex to write down but many examples exist, e.g. handwriting", "When the result must be 100 % exact"], 2, "ML shines where examples are plentiful and explicit rules are hard to formulate.", ""),
  Q("mlbasics", "What is the difference between y and ŷ?", ["y is the true value, ŷ the model’s prediction", "y is the prediction, ŷ the true value", "Both are inputs", "ŷ is the average of y"], 0, "The hat marks an estimate.", ""),
  Q("mlbasics", "A model has a very low loss on its training data. Is the task solved?", ["Yes, low loss means a good model", "Yes, if the training took long", "Only if the dataset has more than 1 000 rows", "No, what matters is the performance on new data"], 3, "The goal is generalisation, not memorising the training set.", ""),
  /* accprec */
  Q("accprec", "Readings 502, 503, 502, 503, 502 g of a 500 g weight. What is the bias?", ["0.55 g", "+2.4 g", "−2.4 g", "2.4 %"], 1, "Mean 502.4 − 500 = +2.4 g systematic error.", ""),
  Q("accprec", "Bias = 3, standard deviation = 4. What is the MSE?", ["7", "12", "25", "5"], 2, "MSE = bias² + variance = 9 + 16 = 25 (RMSE = 5).", ""),
  Q("accprec", "Which error can be removed by calibration (subtracting a constant)?", ["Systematic error (bias)", "Random error (variance)", "Both equally", "Neither"], 0, "A constant offset is predictable and can be corrected.", ""),
  Q("accprec", "Averaging many repeated readings mainly reduces…", ["the bias", "the true value", "the systematic error", "the random error"], 3, "Random errors cancel out on average (σ/√n); a constant bias stays.", ""),
  /* corr */
  Q("corr", "Ice cream sales and sunburn cases have r = 0.99. Correct conclusion?", ["Ice cream causes sunburn", "Sunburn causes ice cream sales", "Strong linear association – no causal claim without further evidence", "The data must be wrong"], 2, "Temperature drives both. Correlation alone says nothing about cause.", ""),
  Q("corr", "Pearson r = 0 between x and y means…", ["x and y are independent for sure", "there is no linear relationship – a nonlinear one (e.g. U-shape) is still possible", "y is constant", "the data has errors"], 1, "y = x² on symmetric x values has r = 0 but a perfect relationship.", ""),
  Q("corr", "What is the strongest way to show that a new app feature causes higher retention?", ["A randomised A/B test", "A high correlation in historical data", "A survey of loyal users", "A bigger dataset"], 0, "Randomisation balances confounders between the groups.", ""),
  Q("corr", "In primary school children, shoe size correlates with reading ability. Most likely confounder?", ["Shoe brand", "Reading lamps", "Parental income only", "Age"], 3, "Older children have bigger feet and read better.", ""),
  /* classes */
  Q("classes", "A bank has millions of unlabelled transactions and 2 000 confirmed fraud cases and uses both. Family?", ["Supervised", "Semi-supervised", "Unsupervised", "Reinforcement"], 1, "Few labels plus many unlabelled data points.", ""),
  Q("classes", "Detecting unusual server logins without any “attack” labels is…", ["Supervised classification", "Regression", "Unsupervised anomaly detection", "Reinforcement learning"], 2, "No labels, the goal is to find points that differ from the norm.", ""),
  Q("classes", "Reducing 200 sensor features to 10 components before training a classifier is…", ["Unsupervised dimensionality reduction used inside a supervised pipeline", "Reinforcement learning", "Semi-supervised labelling", "Regression"], 0, "The lecture mentions this combination: dimensionality reduction in feature engineering.", ""),
  Q("classes", "What feedback does a reinforcement learning agent get, compared with supervised learning?", ["The correct answer for every example", "No feedback at all", "Cluster numbers", "A reward for its actions, not the correct action itself"], 3, "The agent must find out by trial which actions lead to high reward.", ""),
  /* supervised */
  Q("supervised", "Predicting how many bikes will be rented tomorrow is…", ["Clustering", "Regression", "Binary classification", "Dimensionality reduction"], 1, "A numeric quantity is predicted.", ""),
  Q("supervised", "Predicting whether a customer cancels within 3 months (yes/no) is…", ["Binary classification", "Regression", "Clustering", "Reinforcement learning"], 0, "Two classes.", ""),
  Q("supervised", "Recognising which digit 0–9 is handwritten on an image is…", ["Regression", "Binary classification", "Multi-class classification", "Anomaly detection"], 2, "Ten possible classes.", ""),
  Q("supervised", "“Ground truth” in supervised learning means…", ["The test accuracy", "The model’s predictions", "The raw data before cleaning", "The known correct labels of the training data"], 3, "Without ground truth there is nothing to learn from in the supervised sense.", ""),
  Q("supervised", "A model outputs p = 0.83 for “spam”. Is this classification or regression?", ["Regression, because 0.83 is a number", "Classification: it estimates a class probability, a threshold turns it into a class", "Clustering", "Neither"], 1, "The target is a category; the probability is an intermediate result.", ""),
  /* unsup */
  Q("unsup", "Which task needs no labels?", ["Predicting loan default", "Spam detection", "Grouping shop customers by purchase behaviour", "Predicting house prices"], 2, "Segments are discovered, not given.", ""),
  Q("unsup", "Why is anomaly detection in machine sensor data often unsupervised?", ["Sensors cannot be labelled", "Unsupervised is always more accurate", "Failures are rare and rarely labelled, so the model learns what “normal” looks like", "Because regression is not allowed"], 2, "Deviations from learned normal behaviour are flagged.", ""),
  Q("unsup", "After k-means returns clusters 0–3, what is still missing?", ["A human interpretation of what each cluster means", "Nothing", "The labels for training", "The test accuracy"], 0, "Clusters have no names; domain experts interpret them.", ""),
  Q("unsup", "PCA is an example of…", ["Classification", "Clustering", "Reinforcement learning", "Dimensionality reduction"], 3, "It compresses many correlated variables into a few components.", ""),
  /* rl */
  Q("rl", "Q(s,a) = 2, α = 0.5, r = −1, γ = 0.9, max Q(s′,a′) = 6. New Q(s,a)?", ["4.4", "2.6", "3.2", "5.0"], 2, "Target −1 + 0.9 · 6 = 4.4; Q ← 2 + 0.5 · (4.4 − 2) = 3.2.", ""),
  Q("rl", "Exploration in reinforcement learning means…", ["Trying actions whose value is still uncertain", "Always taking the best known action", "Collecting labels", "Reducing the learning rate"], 0, "Without exploration the agent may never discover better strategies.", ""),
  Q("rl", "What does a discount factor γ = 0 mean?", ["Future rewards count fully", "The agent only cares about the immediate reward", "The agent stops learning", "Rewards become negative"], 1, "γ weighs future rewards; 0 ignores them completely.", ""),
  Q("rl", "ε-greedy with ε = 0.1 means…", ["10 % of the episodes are skipped", "The learning rate is 0.1", "Rewards are reduced by 10 %", "In 10 % of the steps a random action is taken, otherwise the best known one"], 3, "A simple balance between exploration and exploitation.", ""),
  /* bias */
  Q("bias", "60 surviving funds average 8 %, 40 closed funds averaged −1.5 %. Average over all 100 funds?", ["8 %", "4.2 %", "6.5 %", "3.25 %"], 1, "(60 · 8 + 40 · (−1.5)) / 100 = 4.2 %.", ""),
  Q("bias", "An online survey about how much time people spend on the internet. Main bias?", ["Frequency illusion", "Survivorship bias of planes", "Availability / selection bias", "No bias"], 2, "Only people who are online can answer – heavy internet users are over-represented.", ""),
  Q("bias", "Returning planes showed few hits on the engines. Wald concluded…", ["Hits on the engines were fatal, so the engines need armour", "Engines are rarely hit, armour the wings", "The data is useless", "Planes should fly higher"], 0, "The missing hits are on the planes that did not return.", ""),
  Q("bias", "A face recognition model was trained mostly on light-skinned faces. Expected effect?", ["Better accuracy for everyone", "No effect", "Faster training", "Higher error rates for under-represented groups"], 3, "The training sample is not representative of the population it is used on.", ""),
  /* lifecycle */
  Q("lifecycle", "Order of the TDSP stages?", ["Modeling → business understanding → deployment", "Business understanding → data acquisition & understanding → modeling → deployment → customer acceptance", "Data → deployment → modeling", "Customer acceptance → modeling → data"], 1, "With loops back whenever new insights appear.", ""),
  Q("lifecycle", "During modelling you discover that 40 % of a key column is missing. What does the lifecycle suggest?", ["Ignore it and deploy", "Delete the column silently", "Go back to data acquisition & understanding", "Start customer acceptance"], 2, "Projects are not linear: loop back to get or understand the data.", ""),
  Q("lifecycle", "What do CRISP-DM and TDSP have in common?", ["Both are iterative and start with understanding the business problem", "Both forbid going back", "Both start with deployment", "Both are only for deep learning"], 0, "Both are process models with feedback loops.", ""),
  Q("lifecycle", "After deployment, prediction quality slowly declines because customer behaviour changed. This is…", ["Overfitting during training", "Selection bias", "A Git conflict", "Data / concept drift, caught by monitoring"], 3, "Monitoring detects drift and triggers retraining.", ""),
  /* python */
  Q("python", "<code>scores = [70, 85, 90]</code> – what is <code>sum(scores) / len(scores)</code>?", ["81", "81.67", "245", "3"], 1, "245 / 3 = 81.67.", ""),
  Q("python", "After <code>counts = {}</code> and <code>for c in [\"WI\", \"SWD\", \"WI\"]: counts[c] = counts.get(c, 0) + 1</code>, counts is…", ["{\"WI\": 1, \"SWD\": 1}", "[2, 1]", "{\"WI\": 2, \"SWD\": 1}", "KeyError"], 2, "get returns 0 for a missing key, so counting works without errors.", ""),
  Q("python", "What does <code>[x for x in [3, 7, 1, 9] if x &gt; 4]</code> return?", ["[7, 9]", "[3, 1]", "[True, False]", "2"], 0, "A list comprehension with a filter keeps 7 and 9.", ""),
  Q("python", "<code>def grade(s): return \"pass\" if s &gt;= 50 else \"fail\"</code> – what is <code>grade(50)</code>?", ["\"fail\"", "None", "50", "\"pass\""], 3, "50 &gt;= 50 is True.", ""),
  Q("python", "What does <code>scores[-1]</code> return?", ["The first element", "The last element", "An error", "The list reversed"], 1, "Negative indices count from the end.", ""),
  /* pandas */
  Q("pandas", "In what order does <code>df.groupby(\"course\")[\"score\"].mean()</code> return the courses WI, SWD, IMS?", ["In order of first appearance", "Random", "Sorted by key: IMS, SWD, WI", "Sorted by mean"], 2, "groupby sorts the group keys by default (sort=True).", ""),
  Q("pandas", "<code>df[\"score\"].std()</code> and <code>np.std(df[\"score\"])</code> give different numbers because…", ["pandas divides by n − 1, NumPy by n", "NumPy ignores NaN", "pandas rounds", "They should be identical"], 0, "Sample vs. population standard deviation (ddof = 1 vs. ddof = 0).", ""),
  Q("pandas", "What does <code>df.loc[df[\"hours\"] &gt; 5, \"score\"]</code> return?", ["All columns of the busy students", "The scores of students with more than 5 hours", "The number of busy students", "A boolean Series"], 1, "Row mask + column label.", ""),
  Q("pandas", "What does <code>df.dropna()</code> do by default?", ["Fills missing values with 0", "Deletes columns with missing values", "Counts missing values", "Removes every row that contains at least one missing value"], 3, "Use subset=[…] to restrict it; check first how many rows you lose.", ""),
  Q("pandas", "<code>df[\"passed\"] = df[\"score\"] &gt;= 60</code>, then <code>df[\"passed\"].mean()</code> returns…", ["The share of students who passed", "The mean score", "An error", "The number of students"], 0, "True counts as 1, False as 0 – the mean is the pass rate.", ""),
  /* explore */
  Q("explore", "<code>describe()</code> shows mean 68 and median (50 %) 74. What does that suggest?", ["Right skew", "A long left tail – some very low values", "Perfect symmetry", "Missing values"], 1, "Low outliers pull the mean below the median.", ""),
  Q("explore", "Q1 = 71, Q3 = 80.25. Which value is an outlier by the 1.5·IQR rule?", ["82", "57.5", "95", "71"], 2, "IQR = 9.25, fences 57.125 and 94.125. Only 95 is outside.", ""),
  Q("explore", "Why are missing values often filled with the median rather than the mean?", ["The median is robust against outliers", "The median is always larger", "pandas cannot compute the mean with NaN", "The mean changes the data type"], 0, "One extreme value can move the mean a lot, the median hardly.", ""),
  Q("explore", "What is a histogram mainly used for in exploration?", ["Testing causality", "Training a model", "Joining tables", "Seeing the shape of a distribution: skew, peaks, outliers"], 3, "Look before you model.", ""),
  Q("explore", "What does <code>df.isna().mean()</code> return?", ["The mean of each column", "The share of missing values per column", "The number of rows", "The rows without NaN"], 1, "isna gives True/False; the mean is the fraction of True.", ""),
  /* linreg */
  Q("linreg", "x = 1…5, y = 50, 54, 61, 63, 72. Σ(x−x̄)(y−ȳ) = 53, Σ(x−x̄)² = 10. Least-squares slope?", ["53", "0.19", "5.3", "10"], 2, "m = 53 / 10 = 5.3.", ""),
  Q("linreg", "Same data: x̄ = 3, ȳ = 60, m = 5.3. Intercept b?", ["60", "44.1", "15.9", "5.3"], 1, "b = ȳ − m · x̄ = 60 − 15.9 = 44.1.", ""),
  Q("linreg", "R² = 0.97 means…", ["97 % of the variance of y is explained by the model", "97 % of predictions are exact", "The slope is 0.97", "The model is 97 % accurate on new data"], 0, "R² = 1 − SS_res / SS_tot.", ""),
  Q("linreg", "With ŷ = 5.3·x + 44.1, what is the prediction for 6 hours?", ["50.4", "31.8", "44.1", "75.9"], 3, "5.3 · 6 + 44.1 = 75.9.", ""),
  Q("linreg", "A positive residual means…", ["The model overestimates", "The true value lies above the line (the model underestimates)", "The slope is positive", "The point is an outlier"], 1, "e = y − ŷ &gt; 0 ⇔ y &gt; ŷ.", ""),
  /* gd */
  Q("gd", "Data (1;3), (2;5), m = b = 0, η = 0.1, MSE. Gradients: ∂L/∂m = −13, ∂L/∂b = −8. New m and b?", ["m = −1.3, b = −0.8", "m = 13, b = 8", "m = 1.3, b = 0.8", "m = 0.13, b = 0.08"], 2, "θ ← θ − η·∇L: m = 0 + 1.3, b = 0 + 0.8.", ""),
  Q("gd", "The gradient is (almost) zero. What does that mean?", ["You are at a minimum (or another stationary point) – updates become tiny", "The learning rate is too high", "The model diverges", "The data is missing"], 0, "No slope, no step: gradient descent stops moving.", ""),
  Q("gd", "The loss per epoch is 17, 1.69, 0.17, 0.02 … What does this show?", ["Divergence", "Converging training", "Overfitting", "A bug"], 1, "The loss decreases steadily towards its minimum.", ""),
  Q("gd", "Why does scaling the features help gradient descent?", ["It removes outliers", "It makes the model linear", "It reduces the number of parameters", "The loss surface becomes rounder, so one learning rate fits all directions"], 3, "Very different feature scales create a narrow valley where GD zig-zags.", ""),
  /* logreg */
  Q("logreg", "σ(0) equals…", ["0", "0.5", "1", "e"], 1, "1 / (1 + e⁰) = 1/2.", ""),
  Q("logreg", "p = σ(1.2·x − 4.5). Probability for x = 5 hours?", ["0.29", "0.5", "≈ 0.82", "1.5"], 2, "z = 1.5, σ(1.5) = 1 / (1 + e⁻¹·⁵) ≈ 0.818.", ""),
  Q("logreg", "Same model, threshold 0.5. Where is the decision boundary?", ["3.75 hours", "4.5 hours", "1.2 hours", "0.5 hours"], 0, "p = 0.5 ⇔ z = 0 ⇔ x = 4.5 / 1.2 = 3.75.", ""),
  Q("logreg", "The true label is 1 and the model says p = 0.9. Log-loss?", ["0.9", "0.1", "2.303", "≈ 0.105"], 3, "−ln(0.9) ≈ 0.105. For p = 0.1 it would be 2.303.", ""),
  Q("logreg", "A positive weight w for “hours” means…", ["More hours lower the probability of passing", "More hours raise the probability of passing", "Hours have no effect", "The model is overfitted"], 1, "The odds are multiplied by e^w per extra hour.", ""),
  /* methods */
  Q("methods", "Which method is a “lazy learner” that does all its work at prediction time?", ["k-Nearest Neighbours", "Decision tree", "Naive Bayes", "Linear regression"], 0, "kNN only stores the training data.", ""),
  Q("methods", "Which model does not need feature scaling?", ["kNN", "k-Means", "Decision tree", "Gradient descent regression"], 2, "Splits compare one feature with a threshold – the scale does not matter.", ""),
  Q("methods", "Which method is a fast, strong baseline for text classification?", ["k-Means", "kNN without scaling", "Decision tree with depth 30", "Naive Bayes"], 3, "Word counts and conditional probabilities – very fast and surprisingly good.", ""),
  Q("methods", "What is the common scikit-learn interface for supervised models?", ["model.run(X)", "model.fit(X_train, y_train), then model.predict(X_test)", "model.train(y)", "fit_predict(y)"], 1, "This is why models can be swapped and compared easily.", ""),
  /* knn */
  Q("knn", "New point (4 h, 80 %), neighbour A (6 h, 78 %). Unscaled Euclidean distance?", ["4", "2.83", "8", "2"], 1, "√(2² + 2²) = √8 ≈ 2.83.", ""),
  Q("knn", "How does kNN predict a number (kNN regression)?", ["Majority vote", "It cannot", "Average of the neighbours’ target values", "Median of all training data"], 2, "Instead of voting, the k neighbours’ y values are averaged.", ""),
  Q("knn", "Why prefer an odd k for two classes?", ["To avoid ties in the vote", "It is faster", "Even k is not allowed in scikit-learn", "It removes noise"], 0, "With k = 4 a 2 : 2 tie is possible.", ""),
  Q("knn", "The prediction time of kNN grows mainly with…", ["the number of classes", "the value of the learning rate", "the depth of the tree", "the size of the training set"], 3, "Distances to all stored points must be computed.", ""),
  /* trees */
  Q("trees", "A leaf contains 1 pass and 3 fail students. Gini impurity?", ["0.25", "0.375", "0.5", "0.75"], 1, "1 − (1/4)² − (3/4)² = 1 − 0.0625 − 0.5625 = 0.375.", ""),
  Q("trees", "Parent Gini 0.48. After the split: 4 rows with Gini 0.375 and 6 rows with Gini 0.278. Gain?", ["0.105", "0.202", "≈ 0.163", "0.317"], 2, "Weighted = 0.4 · 0.375 + 0.6 · 0.278 ≈ 0.317 → gain 0.48 − 0.317 = 0.163.", ""),
  Q("trees", "Entropy of a node with 50 % pass and 50 % fail?", ["1 bit", "0.5", "0", "2 bits"], 0, "−0.5·log₂0.5 − 0.5·log₂0.5 = 1, the maximum for two classes.", ""),
  Q("trees", "A tree with <code>max_depth=1</code> is…", ["A random forest", "A fully grown tree", "Invalid", "A single split (decision stump)"], 3, "One question, two leaves.", ""),
  Q("trees", "A random forest mainly reduces the … of single trees.", ["bias", "variance (instability, overfitting)", "training data", "number of features"], 1, "Averaging many decorrelated trees smooths out their individual errors.", ""),
  /* kmeans */
  Q("kmeans", "Points 1, 2, 4, 9, 10, 14, centres 1 and 4. Centres after the first assign + update?", ["1 and 4", "2.33 and 11", "1.5 and 9.25", "3 and 12"], 2, "{1, 2} → 1.5; {4, 9, 10, 14} → 9.25.", ""),
  Q("kmeans", "Why can’t you choose k by simply minimising inertia?", ["Inertia always decreases as k grows – k = n gives 0", "Inertia cannot be computed", "Inertia increases with k", "scikit-learn forbids it"], 0, "Look for the elbow instead, or use domain knowledge.", ""),
  Q("kmeans", "What does k-means++ improve?", ["The number of clusters", "The speed of prediction", "The labels", "The choice of starting centres (spread out)"], 3, "Better starts → fewer bad local optima.", ""),
  Q("kmeans", "Which data shape does k-means handle poorly?", ["Round blobs of similar size", "Elongated or ring-shaped clusters", "Two well-separated groups", "Scaled numeric data"], 1, "k-means assumes roughly spherical clusters around a centre.", ""),
  Q("kmeans", "Customers described by age (20–80) and income (20 000–150 000 €). What must you do before k-means?", ["Nothing", "Remove age", "Scale the features", "Use k = 1"], 2, "Otherwise income alone decides all distances.", ""),
  /* nbayes */
  Q("nbayes", "P(spam) = 0.3, P(“free”|spam) = 0.4, P(“free”|ham) = 0.05. P(spam | “free”)?", ["40 %", "≈ 77 %", "30 %", "12 %"], 1, "0.12 / (0.12 + 0.035) ≈ 0.774.", ""),
  Q("nbayes", "A word occurred 0 times in 1 000 spam words; vocabulary size 500. Laplace-smoothed P(word | spam)?", ["0", "1/1 000", "1/500", "1/1 500 ≈ 0.00067"], 3, "(0 + 1) / (1 000 + 500).", ""),
  Q("nbayes", "Why do implementations add log-probabilities instead of multiplying probabilities?", ["To avoid numerical underflow from multiplying many tiny numbers", "Logs are more accurate in theory", "To ignore the prior", "Because probabilities can be negative"], 0, "log(a·b) = log a + log b; sums of logs stay in a safe range.", ""),
  Q("nbayes", "Which naive Bayes variant fits continuous features like height and weight?", ["MultinomialNB", "BernoulliNB", "GaussianNB", "CategoricalNB"], 2, "It assumes a normal distribution per feature and class.", ""),
  Q("nbayes", "A disease affects 1 %. A test finds 99 % of the sick and gives 5 % false positives. P(sick | positive)?", ["99 %", "≈ 17 %", "95 %", "5 %"], 1, "0.0099 / (0.0099 + 0.0495) ≈ 0.167 – the low prior dominates.", ""),
  /* overfit */
  Q("overfit", "With rising polynomial degree, training error keeps falling while validation error rises after degree 5. Which degree do you choose?", ["The highest degree", "Degree 0", "The degree with the lowest validation error", "The degree with the lowest training error"], 2, "Validation error estimates performance on new data.", ""),
  Q("overfit", "What does <code>stratify=y</code> in train_test_split do?", ["Keeps the class proportions equal in train and test", "Sorts the data by y", "Removes the labels", "Scales y"], 0, "Important for imbalanced classes, e.g. 2 % fraud.", ""),
  Q("overfit", "How should you split time-series data (e.g. daily sales)?", ["Randomly", "By weekday", "Test first, then train", "Chronologically: train on the past, test on the future"], 3, "Random splits let the model peek into the future (leakage).", ""),
  Q("overfit", "Adding more training data typically…", ["increases overfitting", "reduces overfitting", "has no effect", "always causes underfitting"], 1, "More data makes it harder to memorise noise.", ""),
  Q("overfit", "A polynomial of degree 11 through 12 training points has training MSE 0. Why is this bad?", ["It is not bad", "MSE cannot be 0", "It interpolates every point including the noise and will predict poorly between and beyond them", "Degree 11 is not allowed"], 2, "12 parameters for 12 points = memorising.", ""),
  /* metrics */
  Q("metrics", "TP = 40, FP = 80, FN = 10, TN = 9 870. Precision?", ["80 %", "≈ 33 %", "99.1 %", "40 %"], 1, "40 / (40 + 80) = 0.333.", ""),
  Q("metrics", "Precision 0.5, recall 1.0. F1?", ["0.75", "0.5", "≈ 0.667", "1.0"], 2, "2 · 0.5 · 1 / 1.5 = 0.667 – the harmonic mean is pulled towards the smaller value.", ""),
  Q("metrics", "Specificity is…", ["TN / (TN + FP)", "TP / (TP + FN)", "TP / (TP + FP)", "(TP + TN) / N"], 0, "Share of real negatives correctly recognised.", ""),
  Q("metrics", "50 fraud cases in 10 000 transactions. Accuracy of a model that never predicts fraud?", ["50 %", "0 %", "0.5 %", "99.5 %"], 3, "9 950 / 10 000 – high accuracy, zero recall.", ""),
  Q("metrics", "Errors 1, 1, 1, 9. MAE and RMSE?", ["3 and 3", "3 and ≈ 4.58", "12 and 84", "4.58 and 3"], 1, "MAE = 12/4 = 3, RMSE = √(84/4) = √21 ≈ 4.58. RMSE punishes the big error more.", ""),
  /* cv */
  Q("cv", "Fold scores 0.82, 0.79, 0.85, 0.80, 0.84. Mean?", ["0.82", "0.85", "0.80", "4.10"], 0, "4.10 / 5 = 0.82.", ""),
  Q("cv", "Model A: 0.82 ± 0.02, model B: 0.83 ± 0.06. Conclusion?", ["B is clearly better", "A is clearly better", "Not clearly different; A is more stable", "Both are overfitted"], 2, "The difference is much smaller than the spread.", ""),
  Q("cv", "Leave-one-out CV on 500 rows trains how many models?", ["1", "5", "10", "500"], 3, "k = n: each row is the test set once.", ""),
  Q("cv", "GridSearchCV with 4 values for k and cv = 5 trains how many models during the search?", ["4", "20", "9", "5"], 1, "4 candidates · 5 folds (plus one final refit with the best setting).", ""),
  Q("cv", "Each patient has 10 measurements. Why use group k-fold?", ["So that the same patient never appears in both training and test folds", "To make training faster", "To balance the classes", "Because k-fold cannot handle 10 rows"], 0, "Otherwise the model recognises the patient instead of learning the pattern.", ""),
  /* modsim */
  Q("modsim", "Bathtub: S = 20, inflow 8, outflow 0.1·S, Δt = 1. Stock after one step?", ["28", "26", "22", "20.8"], 1, "20 + 1 · (8 − 2) = 26.", ""),
  Q("modsim", "Same tub, inflow doubled to 16. New equilibrium?", ["80", "16", "8", "160"], 3, "16 = 0.1 · S → S = 160.", ""),
  Q("modsim", "A causal loop contains two negative (−) links. What type of loop is it?", ["Reinforcing", "Balancing", "Random", "Neither"], 0, "An even number of − links gives a reinforcing loop.", ""),
  Q("modsim", "What typically causes oscillations in a balancing loop (e.g. inventory)?", ["Too much data", "A reinforcing loop", "Delays between action and effect", "Constant flows"], 2, "The system reacts to outdated information and overshoots.", ""),
  /* ode */
  Q("ode", "Logistic growth, N = 10, r = 0.5, K = 100, Δt = 1. N after one Euler step?", ["15", "10.5", "14.5", "5"], 2, "dN/dt = 0.5 · 10 · 0.9 = 4.5 → 14.5.", ""),
  Q("ode", "At which N is logistic growth fastest?", ["N = K/2", "N = K", "N = 0", "N = 2K"], 0, "r·N·(1 − N/K) is maximal at K/2 (inflection point of the S-curve).", ""),
  Q("ode", "dN/dt = 0.1·N, N₀ = 100. N(10) exactly?", ["110", "≈ 272", "200", "1 000"], 1, "N(t) = 100 · e^(0.1·10) = 100 · e ≈ 271.8.", ""),
  Q("ode", "You halve Δt in an Euler simulation. What happens to the global error (roughly)?", ["It doubles", "It stays the same", "It drops by a factor of 16", "It roughly halves"], 3, "Euler is a first-order method: error ∝ Δt.", ""),
  /* abm */
  Q("abm", "SIR: N = 1 000, S = 990, I = 10, β = 0.3. New infections in one day?", ["3", "2.97", "30", "0.3"], 1, "β · S · I / N = 0.3 · 990 · 10 / 1 000 = 2.97.", ""),
  Q("abm", "β = 0.3 per day, γ = 0.1 per day. Basic reproduction number R₀?", ["0.03", "0.33", "3", "30"], 2, "R₀ = β / γ = 3.", ""),
  Q("abm", "What does the scheduler in an agent-based model do?", ["Decides in which order and when agents act", "Draws the grid", "Computes the R² value", "Labels the agents"], 0, "Order of updates can change results, e.g. random vs. fixed order.", ""),
  Q("abm", "Which question is a good fit for an agent-based model rather than a single ODE?", ["Average growth of a bacteria culture", "Interest on a savings account", "Exponential decay of a drug", "Evacuation of a stadium where people behave differently and block each other"], 3, "Heterogeneous individuals and local interactions are the strength of ABM.", ""),
  /* mcevo */
  Q("mcevo", "σ = 1.642 per sample, n = 10 000. Standard error of the Monte Carlo mean?", ["1.642", "0.1642", "≈ 0.0164", "0.00164"], 2, "σ/√n = 1.642 / 100.", ""),
  Q("mcevo", "Roughly how many samples for a 95 % half-width of ± 0.01 with σ = 1.642?", ["≈ 104 000", "≈ 10 000", "≈ 1 000", "≈ 1 000 000"], 0, "(1.96 · 1.642 / 0.01)² ≈ 103 600.", ""),
  Q("mcevo", "What is elitism in a genetic algorithm?", ["Only mutating the best individual", "Copying the best individual(s) unchanged into the next generation", "Removing the best individual", "Using only one parent"], 1, "Guarantees that the best solution found so far is never lost.", ""),
  Q("mcevo", "What does the fitness function do?", ["Creates random individuals", "Mixes two parents", "Changes single genes", "Measures how good a candidate solution is"], 3, "Selection is based on fitness.", ""),
  Q("mcevo", "A project has three tasks with uncertain durations. What does a Monte Carlo simulation deliver?", ["One exact end date", "A distribution of total durations, e.g. P(finished by the deadline)", "The critical path only", "A regression line"], 1, "Draw durations many times, sum them, look at the distribution.", "")
];

/* =====================================================================
   FLASHCARDS
   ===================================================================== */
const FLASHCARDS = [
  { id: "pxf-dasc-1", cat: "Formulas", topic: "accprec", front: "MSE decomposition", back: "MSE = bias² + variance. Bias = systematic error (accuracy), variance = random error (precision)." },
  { id: "pxf-dasc-2", cat: "Formulas", topic: "linreg", front: "Least-squares slope and intercept", back: "m = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)², b = ȳ − m·x̄" },
  { id: "pxf-dasc-3", cat: "Formulas", topic: "metrics", front: "R²", back: "R² = 1 − SS_res / SS_tot. 1 = perfect, 0 = as good as predicting the mean, negative = worse than the mean." },
  { id: "pxf-dasc-4", cat: "Formulas", topic: "gd", front: "Gradient of the MSE for ŷ = m·x + b", back: "∂L/∂m = −(2/n)·Σ x(y − ŷ), ∂L/∂b = −(2/n)·Σ (y − ŷ). Update θ ← θ − η·∇L." },
  { id: "pxf-dasc-5", cat: "Formulas", topic: "logreg", front: "Decision boundary of logistic regression (threshold 0.5)", back: "σ(z) = 0.5 ⇔ z = w·x + b = 0 ⇔ x = −b / w" },
  { id: "pxf-dasc-6", cat: "Formulas", topic: "metrics", front: "F1 score", back: "F1 = 2·P·R / (P + R), the harmonic mean of precision and recall." },
  { id: "pxf-dasc-7", cat: "Formulas", topic: "trees", front: "Gini impurity", back: "Gini = 1 − Σ pₖ². 0 = pure node, 0.5 = maximum for two classes. Split quality = weighted Gini of the children." },
  { id: "pxf-dasc-8", cat: "pandas", topic: "pandas", front: "split – apply – combine", back: "df.groupby(\"key\")[\"col\"].mean(): split rows by key, apply the aggregation per group, combine into a Series indexed by the (sorted) keys." },
  { id: "pxf-dasc-9", cat: "pandas", topic: "explore", front: "pandas .std() vs. np.std()", back: "pandas uses the sample std (divide by n − 1, ddof = 1), NumPy the population std (divide by n, ddof = 0)." },
  { id: "pxf-dasc-10", cat: "Formulas", topic: "explore", front: "1.5 · IQR outlier rule", back: "IQR = Q3 − Q1. Outlier if x is below Q1 − 1.5·IQR or above Q3 + 1.5·IQR." },
  { id: "pxf-dasc-11", cat: "Formulas", topic: "mcevo", front: "Monte Carlo standard error", back: "SE = σ / √n. 10× more precision needs 100× more samples." },
  { id: "pxf-dasc-12", cat: "Formulas", topic: "abm", front: "Basic reproduction number in SIR", back: "R₀ = β / γ (contact rate / recovery rate). Outbreak grows at the start if R₀ is greater than 1." }
];

window.STUDYOS_EXT = window.STUDYOS_EXT || {};
(window.STUDYOS_EXT.dasc = window.STUDYOS_EXT.dasc || []).push({ id: "dasc-plus", blocks: BLOCKS, questions: QUESTIONS, flashcards: FLASHCARDS });
})();
