/* MATH-2 · Interaktive Abbildungen (Schieberegler, drehbare 3D-Flächen). Gezeichnet wird mit dem Plot-Renderer des
   Maple-Labors (MPL.svg2d, MPL.mount3d), damit die Bilder genauso aussehen wie die Maple-Ausgaben in den Lektionen. */
(function () {
const FIG = window.STUDYOS_FIG = window.STUDYOS_FIG || {};
const RED = "#C62828", BLUE = "#1565C0", GREEN = "#2E7D32", ORANGE = "#EF6C00", PURPLE = "#6A1B9A", GRAY = "#9E9E9E";
const num = (v, d = 3) => (Math.round(v * 10 ** d) / 10 ** d).toLocaleString("de-AT", { maximumFractionDigits: d });
const q = (root, s) => root.querySelector(s);
const val = (root, k) => +q(root, `[data-i=${k}]`).value;
const radio = (root, name) => (q(root, `input[name=${name}]:checked`) || {}).value;
const out = (root, k, html) => { const e = q(root, `[data-o=${k}]`); if (e) e.innerHTML = html; };
const range = (k, label, min, max, step, v) => `<label><span>${label}: <b data-o="${k}"></b></span><input type="range" min="${min}" max="${max}" step="${step}" value="${v}" data-i="${k}"></label>`;
const seg = (name, opts, on) => `<div class="seg">${opts.map(([v, l]) => `<label><input type="radio" name="${name}" value="${v}"${v === on ? " checked" : ""}> ${l}</label>`).join("")}</div>`;
const sample = (f, a, b, n = 240) => Array.from({ length: n + 1 }, (_, i) => { const x = a + (b - a) * i / n, y = f(x); return isFinite(y) ? [x, y] : null; });
const L = (pts, color, o) => Object.assign({ type: "line", pts, color, thick: 2.2 }, o || {});
const PT = (pts, color, size) => ({ type: "pts", pts, color, size: size || 4.5 });
const POLY = (pts, color, alpha) => ({ type: "poly", pts, color, alpha: alpha == null ? .3 : alpha });
const TX = (x, y, s, color) => ({ type: "text", x, y, s, color: color || "currentColor" });
const plot2 = (items, o, w, h) => window.MPL ? MPL.svg2d({ T: "plot", dim: 2, items, o: o || {} }, { w: w || 560, h: h || 340 }) : "";
const stage = (root, html) => { q(root, ".fig-stage").innerHTML = html; };
const empty = () => `<div class="mw-plot"></div>`;
/* 3D: Fläche z = f(x, y), Parameterfläche (Gitter), Raumkurve */
const surf = (f, x0, x1, y0, y1, n, color, alpha) => { const xs = Array.from({ length: n + 1 }, (_, i) => x0 + (x1 - x0) * i / n), ys = Array.from({ length: n + 1 }, (_, j) => y0 + (y1 - y0) * j / n); return { type: "surf", xs, ys, z: xs.map(x => ys.map(y => f(x, y))), color, alpha }; };
const grid = (F, u0, u1, v0, v1, n, m, color, alpha) => ({ type: "grid", G: Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => F(u0 + (u1 - u0) * i / n, v0 + (v1 - v0) * j / m))), color, alpha });
const curve3 = (F, a, b, color, o) => Object.assign({ type: "line3", pts: Array.from({ length: 81 }, (_, i) => F(a + (b - a) * i / 80)), color, thick: 3 }, o || {});
const show3 = (root, items, o) => { const st = q(root, ".fig-stage"); if (!st.querySelector("canvas")) st.innerHTML = `<div class="mw-3d"><canvas></canvas><small>Ziehen zum Drehen · Doppelklick: Ansicht zurücksetzen</small></div>`; if (window.MPL) MPL.mount3d(st.querySelector(".mw-3d"), { T: "plot", dim: 3, items, o: o || {} }); };
const M2m = rows => window.M2 ? M2.mat(rows) : "";

/* ======================= Kapitel 1 ======================= */
const f0 = (x, y) => x * x - y * y - (x * x + y * y) ** 2;
const fx0 = (x, y) => 2 * x - 4 * x * (x * x + y * y), fy0 = (x, y) => -2 * y - 4 * y * (x * x + y * y);
const SURF = { m: [f0, "f(x, y) = x² − y² − (x² + y²)²: zwei Gipfel, ein Sattel"], p: [(x, y) => x * x + y * y, "f(x, y) = x² + y²: eine Schüssel mit Minimum in (0|0)"], s: [(x, y) => x * x - y * y, "f(x, y) = x² − y²: der klassische Sattel"] };
FIG["m2f-surf"] = { title: "Funktionen mit zwei Variablen als Landschaft",
  svg: empty, ui: () => seg("m2s", [["m", "Skriptum-Beispiel"], ["p", "Paraboloid"], ["s", "Sattelfläche"]], "m") + `<div class="fig-out" data-o="r"></div>`,
  cap: "Jeder Punkt (x, y) unten bekommt die Höhe z = f(x, y). Ziehe die Fläche mit Maus oder Finger, um sie von allen Seiten zu sehen.",
  update: root => { const k = radio(root, "m2s"), [f, d] = SURF[k]; show3(root, [surf(f, -1, 1, -1, 1, 36)], { labels: ["x", "y", "z"] }); out(root, "r", d); } };

FIG["m2f-slices"] = { title: "Schnitte: y festhalten, eine Kurve bleibt übrig",
  svg: empty, ui: () => range("y0", "Schnitt bei y₀", 0, 1, .05, .25) + `<div class="fig-out" data-o="r"></div>`,
  cap: "Grau: die Schnitte aus Skriptum Abb. 1.2 (y = 0, 0.25, 0.5, 0.75, 1). Rot: dein Schnitt. Jeder Schnitt ist eine ganz normale Funktion von x.",
  update: root => { const y0 = val(root, "y0"); out(root, "y0", num(y0, 2));
    const its = [0, .25, .5, .75, 1].map(c => L(sample(x => f0(x, c), -1, 1), GRAY, { thick: 1.3 })); its.push(L(sample(x => f0(x, y0), -1, 1), RED, { thick: 3, legend: `g(x) = f(x, ${num(y0, 2)})` }));
    stage(root, plot2(its, { view: [[-1, 1], [-3.2, .4]], labels: ["x", "z"] }));
    out(root, "r", `g(x) = x² − ${num(y0 * y0, 4)} − (x² + ${num(y0 * y0, 4)})²${y0 === 0 ? " = x² − x⁴ (Maxima bei x = ±√0.5)" : ""}`); } };

FIG["m2f-partial"] = { title: "Partielle Ableitungen: Steigung in x- und in y-Richtung",
  svg: empty, ui: () => range("x0", "x₀", -1, 1, .05, .4) + range("y0", "y₀", -1, 1, .05, .3) + `<div class="fig-out" data-o="r"></div>`,
  cap: "Rot: Schnitt in x-Richtung (y fest) mit Tangente, Steigung f<sub>x</sub>. Blau: Schnitt in y-Richtung (x fest), Steigung f<sub>y</sub>.",
  update: root => { const a = val(root, "x0"), b = val(root, "y0"), z = f0(a, b), fx = fx0(a, b), fy = fy0(a, b); out(root, "x0", num(a, 2)); out(root, "y0", num(b, 2));
    show3(root, [surf(f0, -1, 1, -1, 1, 30), curve3(t => [t, b, f0(t, b)], -1, 1, RED), curve3(t => [a, t, f0(a, t)], -1, 1, BLUE),
      curve3(t => [a + t, b, z + fx * t], -.35, .35, RED, { dash: 1, thick: 2.5 }), curve3(t => [a, b + t, z + fy * t], -.35, .35, BLUE, { dash: 1, thick: 2.5 })], { labels: ["x", "y", "z"], view: [null, null, [-3.2, .6]] });
    out(root, "r", `f(${num(a, 2)}, ${num(b, 2)}) = ${num(z)} · <span style="color:${RED}">f<sub>x</sub> = ${num(fx)}</span> · <span style="color:${BLUE}">f<sub>y</sub> = ${num(fy)}</span>`); } };

FIG["m2f-tplane"] = { title: "Die Tangentialebene schmiegt sich an die Fläche",
  svg: empty, ui: () => range("x0", "x₀", -1, 1, .05, .5) + range("y0", "y₀", -1, 1, .05, -.3) + `<div class="fig-out" data-o="r"></div>`,
  cap: "Die Ebene berührt die Fläche im Punkt (x₀ | y₀ | f(x₀, y₀)). Schiebe den Punkt auf einen Gipfel (x₀ ≈ ±0.7, y₀ = 0): Die Ebene wird waagrecht.",
  update: root => { const a = val(root, "x0"), b = val(root, "y0"), z = f0(a, b), fx = fx0(a, b), fy = fy0(a, b); out(root, "x0", num(a, 2)); out(root, "y0", num(b, 2));
    show3(root, [surf(f0, -1, 1, -1, 1, 30), surf((x, y) => z + fx * (x - a) + fy * (y - b), a - .35, a + .35, b - .35, b + .35, 6, ORANGE, .75)], { labels: ["x", "y", "z"], view: [null, null, [-3.2, .8]] });
    out(root, "r", `z = ${num(z)} ${fx < 0 ? "−" : "+"} ${num(Math.abs(fx))}·(x − ${num(a, 2)}) ${fy < 0 ? "−" : "+"} ${num(Math.abs(fy))}·(y ${b < 0 ? "+" : "−"} ${num(Math.abs(b), 2)})`); } };

const STAT = { s: [0, 0, "Sattelpunkt"], p: [Math.SQRT1_2, 0, "lokales Maximum"], m: [-Math.SQRT1_2, 0, "lokales Maximum"] };
FIG["m2f-hesse"] = { title: "Hesse-Kriterium an den drei stationären Punkten",
  svg: empty, ui: () => seg("m2h", [["m", "(−√0.5 | 0)"], ["s", "(0 | 0)"], ["p", "(√0.5 | 0)"]], "s") + `<div class="fig-out" data-o="r"></div>`,
  cap: "Höhenlinien von f(x, y) = x² − y² − (x² + y²)². Um ein Maximum laufen die Linien wie Ringe, am Sattel kreuzen sie sich.",
  update: root => { const k = radio(root, "m2h"), [a, b, typ] = STAT[k];
    const fxx = 2 - 12 * a * a - 4 * b * b, fyy = -2 - 4 * a * a - 12 * b * b, fxy = -8 * a * b, H = fxx * fyy - fxy * fxy;
    let pl; try { const S = new MPL.Session(); pl = S.run("contourplot(x^2 - y^2 - (x^2 + y^2)^2, x = -1.1..1.1, y = -1..1, contours = [-2, -1.2, -0.6, -0.25, 0, 0.1, 0.2, 0.24]);").pop().v; } catch (e) { pl = { items: [], o: {} }; }
    const items = pl.items.concat([PT([[0, 0], [Math.SQRT1_2, 0], [-Math.SQRT1_2, 0]], GRAY, 4), PT([[a, b]], RED, 7)]);
    stage(root, plot2(items, { xr: [-1.1, 1.1], yr0: [-1, 1], scaling: "constrained", labels: ["x", "y"] }));
    out(root, "r", `f<sub>xx</sub> = ${num(fxx)}, f<sub>yy</sub> = ${num(fyy)}, f<sub>xy</sub> = ${num(fxy)} → H = f<sub>xx</sub>·f<sub>yy</sub> − f<sub>xy</sub>² = <b>${num(H)}</b><br>${H < 0 ? "H &lt; 0 → <b>Sattelpunkt</b>" : fxx < 0 ? "H &gt; 0 und f<sub>xx</sub> &lt; 0 → <b>lokales Maximum</b>, f = 0.25" : "H &gt; 0 und f<sub>xx</sub> &gt; 0 → <b>lokales Minimum</b>"} (${typ})`); } };

const FA = [1, 1], FB = [12, 4], FC = [4, 8], FOPT = [4.875933, 5.418240];
const flen = (x, y) => [FA, FB, FC].reduce((s, p) => s + Math.hypot(x - p[0], y - p[1]), 0);
FIG["m2f-fermat"] = { title: "Wo muss der Brunnen hin? (kürzeste Leitungen)",
  svg: empty, ui: () => range("x", "x", 0, 12, .05, 6.5) + range("y", "y", 0, 9, .05, 3) + `<div class="fig-out" data-o="r"></div>`,
  cap: "Verschiebe den Brunnen X. Die Gesamtlänge l(x, y) = |XA| + |XB| + |XC| ist eine Funktion von zwei Variablen. Im Optimum schließen die drei Leitungen jeweils 120° ein.",
  update: root => { const x = val(root, "x"), y = val(root, "y"), l = flen(x, y), lo = flen(...FOPT); out(root, "x", num(x, 2)); out(root, "y", num(y, 2));
    const its = [POLY([FA, FB, FC], GRAY, .12), L([FA, [x, y]], BLUE), L([FB, [x, y]], BLUE), L([FC, [x, y]], BLUE), PT([FOPT], GREEN, 4), PT([FA, FB, FC], "currentColor", 5), PT([[x, y]], RED, 7),
      TX(1, .3, "A"), TX(12.3, 4, "B"), TX(4, 8.6, "C")];
    stage(root, plot2(its, { xr: [0, 13], yr0: [0, 9.2], scaling: "constrained" }, 560, 380));
    out(root, "r", `l = ${num(l)} &nbsp;·&nbsp; Minimum 15.868 bei X(4.876 | 5.418) (grüner Punkt) &nbsp;·&nbsp; ${l - lo < .005 ? "<b>Optimum erreicht!</b>" : `noch ${num(l - lo)} zu lang`}`); } };

FIG["m2f-rect"] = { title: "Größtes Rechteck im Dreieck (Altprüfung 2016)",
  svg: empty, ui: () => range("x", "x-Koordinate von D", .1, 3.9, .05, 1) + `<div class="fig-out" data-o="r"></div>`,
  cap: "D liegt auf der Hypotenuse y = 6 − 1.5x. Links: das Rechteck, rechts: seine Fläche A(x) = x·(6 − 1.5x). Das Maximum liegt bei x = 2.",
  update: root => { const x = val(root, "x"), y = 6 - 1.5 * x, A = x * y; out(root, "x", num(x, 2));
    const g = plot2([POLY([[0, 0], [4, 0], [0, 6]], GRAY, .1), POLY([[0, 0], [x, 0], [x, y], [0, y]], BLUE, .35), PT([[x, y]], RED, 6), TX(x + .35, y + .25, "D")], { xr: [-.2, 4.4], yr0: [-.2, 6.4], scaling: "constrained" }, 300, 340);
    const h = plot2([L(sample(t => t * (6 - 1.5 * t), 0, 4), BLUE), PT([[x, A]], RED, 6), PT([[2, 6]], GREEN, 4)], { xr: [0, 4], yr0: [0, 6.6], labels: ["x", "A(x)"] }, 300, 340);
    stage(root, `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${g}${h}</div>`);
    out(root, "r", `D(${num(x, 2)} | ${num(y, 2)}) → A = ${num(A)} ${Math.abs(x - 2) < .03 ? " · <b>Maximum: D(2 | 3), A = 6</b>" : ""}`); } };

FIG["m2f-lagrange"] = { title: "Lagrange anschaulich: Höhenlinie berührt die Nebenbedingung",
  svg: empty, ui: () => range("c", "Höhenlinie x·y = c", 500, 3500, 100, 1500) + `<div class="fig-out" data-o="r"></div>`,
  cap: "Rot: alle Rechtecke mit Umfang 200 (x + y = 100). Blau: alle Punkte mit gleicher Fläche x·y = c. Die größte Fläche erreicht man, wenn sich die beiden Kurven gerade noch berühren.",
  update: root => { const c = val(root, "c"); out(root, "c", c);
    const its = [500, 1000, 2000, 3000].map(k => L(sample(x => k / x, k / 100, 100, 160), GRAY, { thick: 1 }));
    its.push(L([[0, 100], [100, 0]], RED, { thick: 2.6, legend: "x + y = 100" }), L(sample(x => c / x, c / 100, 100, 200), BLUE, { thick: 2.6, legend: `x·y = ${c}` }));
    const d = 1e4 - 4 * c; if (d >= 0) { const r = Math.sqrt(d); its.push(PT([[(100 - r) / 2, (100 + r) / 2], [(100 + r) / 2, (100 - r) / 2]], ORANGE, 6)); }
    stage(root, plot2(its, { xr: [0, 100], yr0: [0, 100], scaling: "constrained", labels: ["x", "y"] }, 520, 380));
    out(root, "r", d > 0 ? `Zwei Schnittpunkte: Fläche ${c} ist möglich, aber es geht noch mehr.` : d === 0 ? `<b>Berührung bei x = y = 50: die maximale Fläche 2500.</b> Dort sind die Gradienten parallel, genau das fordert F<sub>x</sub> = F<sub>y</sub> = 0.` : `Kein Schnittpunkt: Fläche ${c} ist mit Umfang 200 unmöglich.`); } };

/* ======================= Kapitel 2 ======================= */
const horner = (co, x) => co.reduce((s, c) => s * x + c, 0);
const splineEval = (pcs, x) => { let p = pcs[0]; for (const s of pcs) if (x >= s.x0) p = s; const u = x - p.x0; return p.a + u * (p.b + u * (p.c + u * p.d)); };
FIG["m2f-runge"] = { title: "Mehr Punkte, schlechteres Polynom? Polynom gegen Spline",
  svg: empty, ui: () => range("n", "Anzahl der Punkte n", 3, 15, 1, 11) + seg("m2r", [["b", "beide"], ["p", "nur Polynom"], ["s", "nur Spline"]], "b") + `<div class="fig-out" data-o="r"></div>`,
  cap: "Grau gestrichelt: die echte Funktion 1/(1 + x²). Blau: Interpolationspolynom vom Grad n − 1. Rot: natürlicher kubischer Spline. Ab etwa 9 Punkten schlägt das Polynom am Rand immer wilder aus.",
  update: root => { const n = val(root, "n"), m = radio(root, "m2r"); out(root, "n", n);
    const f = x => 1 / (1 + x * x), xs = Array.from({ length: n }, (_, i) => -5 + 10 * i / (n - 1)), ys = xs.map(f);
    const co = MPL.polyInterp(xs, ys), pcs = MPL.spline(xs, ys), P = x => horner(co, x), Sp = x => splineEval(pcs, x);
    const its = [L(sample(f, -5, 5), GRAY, { dash: "dash", thick: 1.5 })];
    if (m !== "s") its.push(L(sample(P, -5, 5, 400), BLUE, { legend: `Polynom Grad ${n - 1}` }));
    if (m !== "p") its.push(L(sample(Sp, -5, 5, 400), RED, { legend: "Spline" }));
    its.push(PT(xs.map((x, i) => [x, ys[i]]), "currentColor", 4.5));
    const err = g => Math.max(...sample(x => Math.abs(g(x) - f(x)), -5, 5, 600).map(p => p[1]));
    stage(root, plot2(its, { view: [[-5, 5], [-1, 2]] }));
    out(root, "r", `Größte Abweichung von der echten Kurve: Polynom <b>${num(err(P))}</b> · Spline <b>${num(err(Sp))}</b>`); } };

const SPP = [[1, 2], [2, 6], [4, 5], [6, 13], [7, 18], [10, 20]], SPC = [RED, BLUE, GREEN, ORANGE, PURPLE];
FIG["m2f-spline"] = { title: "Ein Spline aus fünf kubischen Stücken",
  svg: empty, ui: () => range("y", "y-Wert des 4. Punkts", 2, 22, .5, 13) + seg("m2sp", [["3", "kubisch (degree = 3)"], ["1", "Polygonzug (degree = 1)"]], "3") + `<div class="fig-out" data-o="r"></div>`,
  cap: "Jede Farbe ist ein eigenes Polynom. An den Klebestellen stimmen Wert, Steigung und Krümmung überein, darum sieht man keine Knicke. Verschiebe einen Punkt: alle Stücke passen sich an.",
  update: root => { const y4 = val(root, "y"), dg = radio(root, "m2sp"); out(root, "y", num(y4, 1));
    const P = SPP.map((p, i) => i === 3 ? [p[0], y4] : p), xs = P.map(p => p[0]), ys = P.map(p => p[1]), pcs = MPL.spline(xs, ys);
    const its = pcs.map((s, i) => L(sample(x => dg === "1" ? ys[i] + (ys[i + 1] - ys[i]) * (x - xs[i]) / (xs[i + 1] - xs[i]) : splineEval([s], x), s.x0, s.x1, 60), SPC[i], { thick: 3 }));
    its.push(PT(P, "currentColor", 5));
    stage(root, plot2(its, { xr: [.5, 10.5], yr0: [-2, 26], labels: ["x", "y"] }));
    const s = pcs[1]; out(root, "r", dg === "1" ? "Polygonzug: an den Punkten entstehen Knicke (Steigungen springen)." : `6 Punkte → 5 Stücke → 4·5 = <b>20 Unbekannte</b>. Zweites Stück (blau): p₂(x) = ${num(s.a)} ${s.b < 0 ? "−" : "+"} ${num(Math.abs(s.b))}(x − 2) ${s.c < 0 ? "−" : "+"} ${num(Math.abs(s.c))}(x − 2)² ${s.d < 0 ? "−" : "+"} ${num(Math.abs(s.d))}(x − 2)³`); } };

const LSP = [[1, 2], [2, 3], [4, 3], [6, 6], [7, 8], [9, 10]], LSa = 284 / 281, LSb = 126 / 281;
const sse = (a, b) => LSP.reduce((s, [x, y]) => s + (a * x + b - y) ** 2, 0);
FIG["m2f-ls"] = { title: "Finde selbst die beste Gerade (Beispiel 2.1)",
  svg: empty, ui: () => range("a", "Steigung a", 0, 2, .01, .6) + range("b", "Abschnitt b", -2, 4, .05, 2) + `<label><span>Optimale Gerade zeigen</span><input type="checkbox" data-i="opt"></label><div class="fig-out" data-o="r"></div>`,
  cap: "Rote Strecken: die senkrechten Fehler f(x<sub>i</sub>) − y<sub>i</sub>. Die Methode der kleinsten Quadrate macht die Summe ihrer Quadrate so klein wie möglich.",
  update: root => { const a = val(root, "a"), b = val(root, "b"), opt = q(root, "[data-i=opt]").checked; out(root, "a", num(a, 2)); out(root, "b", num(b, 2));
    const its = LSP.map(([x, y]) => L([[x, y], [x, a * x + b]], RED, { thick: 1.8 })); its.push(L([[0, b], [10, 10 * a + b]], BLUE, { thick: 2.6 }));
    if (opt) its.push(L([[0, LSb], [10, 10 * LSa + LSb]], GREEN, { dash: "dash", thick: 2 }));
    its.push(PT(LSP, "currentColor", 5));
    stage(root, plot2(its, { xr: [0, 10], yr0: [-1, 12], labels: ["x", "y"] }));
    const e = sse(a, b), m = sse(LSa, LSb); out(root, "r", `Fehlerquadratsumme F(a, b) = <b>${num(e)}</b> · bestmöglich: ${num(m)} bei a ≈ 1.0107, b ≈ 0.4484${e - m < .02 ? " · <b>Fast perfekt!</b>" : ""}`); } };

const COR = [2, 2, 3, 9, 14, 18, 21, 29, 41, 55, 79, 104, 131, 182, 246, 302, 504, 655, 860, 1016, 1332];
const corX = COR.map((_, i) => i + 1);
const lin2 = (xs, ys, fs) => { const A = fs.map(f => fs.map(g => xs.reduce((s, x) => s + f(x) * g(x), 0))), r = fs.map(f => xs.reduce((s, x, i) => s + f(x) * ys[i], 0)); return MPL.solveSq(A, r); };
FIG["m2f-fit"] = { title: "Welches Modell passt zu den Corona-Daten?",
  svg: empty, ui: () => seg("m2fit", [["l", "Gerade a·x + b"], ["q", "Parabel a·x² + b·x + c"], ["e", "exponentiell a·e<sup>b·x</sup>"]], "l") + `<div class="fig-out" data-o="r"></div>`,
  cap: "Daten: Infizierte pro Tag in Österreich bis 17.3.2020 (Folien). Gerade und Parabel sind linear in den Parametern (LeastSquares), das exponentielle Modell braucht NonlinearFit.",
  update: root => { const m = radio(root, "m2fit"); let f, txt;
    if (m === "l") { const [k, d] = lin2(corX, COR, [x => x, () => 1]); f = x => k * x + d; txt = `f(x) = ${num(k, 2)}·x ${d < 0 ? "−" : "+"} ${num(Math.abs(d), 2)}`; }
    else if (m === "q") { const [a, b, c] = lin2(corX, COR, [x => x * x, x => x, () => 1]); f = x => a * x * x + b * x + c; txt = `f(x) = ${num(a, 3)}·x² ${b < 0 ? "−" : "+"} ${num(Math.abs(b), 2)}·x ${c < 0 ? "−" : "+"} ${num(Math.abs(c), 2)}`; }
    else { f = x => 4.635861922 * Math.exp(.2706193456 * x); txt = "f(x) = 4.636·e<sup>0.2706·x</sup>"; }
    const e = corX.reduce((s, x, i) => s + (f(x) - COR[i]) ** 2, 0);
    stage(root, plot2([L(sample(f, 0, 25), RED, { legend: "Modell" }), PT(corX.map((x, i) => [x, COR[i]]), BLUE, 4.5)], { xr: [0, 25], yr0: [-200, 4500], labels: ["Tag", "Infizierte"] }));
    out(root, "r", `${txt} · Fehlerquadratsumme ${Math.round(e).toLocaleString("de-AT")} · Prognose Tag 25: <b>${Math.round(f(25)).toLocaleString("de-AT")}</b>`); } };

/* ======================= Kapitel 3 ======================= */
const RF = { x: [x => x, 0, 1, .5, "f(x) = x auf [0, 1] (Beispiel 3.1)"], q: [x => x * x, 0, 2, 8 / 3, "f(x) = x² auf [0, 2]"], s: [Math.sin, 0, Math.PI, 2, "f(x) = sin x auf [0, π]"] };
FIG["m2f-riemann"] = { title: "Rechtecksummen: je mehr Rechtecke, desto genauer",
  svg: empty, ui: () => seg("m2rf", [["x", "x"], ["q", "x²"], ["s", "sin x"]], "x") + range("n", "Anzahl Rechtecke n", 1, 60, 1, 6) + seg("m2rm", [["r", "rechter Rand"], ["l", "linker Rand"], ["m", "Mitte"]], "r") + `<div class="fig-out" data-o="r"></div>`,
  cap: "Die Fläche jedes Rechtecks ist f(x<sub>k</sub>)·Δx. Für n → ∞ wird die Summe zum Integral.",
  update: root => { const [f, a, b, ex, lab] = RF[radio(root, "m2rf")], n = val(root, "n"), md = radio(root, "m2rm"), dx = (b - a) / n; out(root, "n", n);
    let S = 0; const its = [];
    for (let k = 0; k < n; k++) { const x0 = a + k * dx, xs = md === "l" ? x0 : md === "r" ? x0 + dx : x0 + dx / 2, h = f(xs); S += h * dx; its.push(POLY([[x0, 0], [x0 + dx, 0], [x0 + dx, h], [x0, h]], BLUE, .28)); }
    its.push(L(sample(f, a, b), RED, { thick: 2.6 }));
    stage(root, plot2(its, { xr: [a, b], labels: ["x", "y"] }));
    out(root, "r", `${lab}: Summe = <b>${num(S, 4)}</b> · exakt ${num(ex, 4)} · Fehler ${num(Math.abs(S - ex), 4)}`); } };

const R2 = Math.SQRT2;
FIG["m2f-area"] = { title: "Flächen zwischen Kurven: an den Schnittpunkten aufteilen",
  svg: empty, ui: () => seg("m2a", [["sc", "Beispiel 3.3: sin und cos"], ["b4", "Beispiel 3.4: drei Ränder"], ["sn", "Achtung: ∫ sin über [0, 2π]"]], "sc") + `<div class="fig-out" data-o="r"></div>`,
  cap: "Jede Farbe ist ein eigenes Teilintegral.",
  update: root => { const m = radio(root, "m2a"); let its, o, r;
    if (m === "sc") { const a = Math.PI / 4, b = 5 * Math.PI / 4, up = sample(Math.sin, a, b, 120), dn = sample(Math.cos, a, b, 120).reverse();
      its = [POLY(up.concat(dn), BLUE, .3), L(sample(Math.sin, 0, 2 * Math.PI), RED, { legend: "sin x" }), L(sample(Math.cos, 0, 2 * Math.PI), BLUE, { legend: "cos x" }), PT([[a, Math.sin(a)], [b, Math.sin(b)]], "currentColor", 5)];
      o = { xr: [0, 2 * Math.PI] }; r = "Schnittpunkte π/4 und 5π/4. A = ∫<sub>π/4</sub><sup>5π/4</sup> (sin x − cos x) dx = 2√2 ≈ <b>2.828</b>"; }
    else if (m === "b4") { const f = x => x * x / 2, g = x => 2 * x;
      its = [POLY(sample(g, 0, .5, 40).concat(sample(f, 0, .5, 40).reverse()), ORANGE, .4), POLY([[.5, 1], [R2, 1]].concat(sample(f, .5, R2, 60).reverse()), BLUE, .3),
        L(sample(f, 0, 1.6), RED, { legend: "f = x²/2" }), L(sample(g, 0, .7), GREEN, { legend: "g = 2x" }), L([[0, 1], [1.6, 1]], "currentColor", { thick: 1.6, legend: "y = 1" }), PT([[0, 0], [.5, 1], [R2, 1]], "currentColor", 5)];
      o = { xr: [0, 1.6], yr0: [0, 1.4], scaling: "constrained" }; r = `<span style="color:${ORANGE}">∫<sub>0</sub><sup>1/2</sup> (2x − x²/2) dx ≈ 0.229</span> + <span style="color:${BLUE}">∫<sub>1/2</sub><sup>√2</sup> (1 − x²/2) dx ≈ 0.464</span> = <b>0.693</b>`; }
    else { its = [POLY([[0, 0]].concat(sample(Math.sin, 0, Math.PI, 80), [[Math.PI, 0]]), GREEN, .35), POLY([[Math.PI, 0]].concat(sample(Math.sin, Math.PI, 2 * Math.PI, 80), [[2 * Math.PI, 0]]), RED, .35), L(sample(Math.sin, 0, 2 * Math.PI), "currentColor"), TX(Math.PI / 2, .45, "+2", GREEN), TX(3 * Math.PI / 2, -.45, "−2", RED)];
      o = { xr: [0, 2 * Math.PI] }; r = "∫<sub>0</sub><sup>2π</sup> sin x dx = 2 − 2 = <b>0</b>, obwohl die Fläche <b>4</b> ist. Für die Fläche bei der Nullstelle π teilen und Beträge addieren."; }
    stage(root, plot2(its, o)); out(root, "r", r); } };

const simpN = (f, a, b, n = 2000) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h); return s * h / 3; };
const CEN = { b4: [x => Math.min(2 * x, 1), x => x * x / 2, 0, R2, "Fläche aus Beispiel 3.4"], tr: [x => 6 - 1.5 * x, () => 0, 0, 4, "Dreieck (0|0), (4|0), (0|6)"], hk: [x => Math.sqrt(Math.max(0, 1 - x * x)), () => 0, -1, 1, "Halbkreis mit Radius 1"] };
FIG["m2f-centroid"] = { title: "Der Schwerpunkt: hier könnte man die Fläche balancieren",
  svg: empty, ui: () => seg("m2c", [["b4", "Beispiel 3.4"], ["tr", "Dreieck"], ["hk", "Halbkreis"]], "b4") + `<div class="fig-out" data-o="r"></div>`,
  cap: "x<sub>s</sub> = (1/A)·∫ x·(f − g) dx und y<sub>s</sub> = (1/2A)·∫ (f² − g²) dx, hier numerisch ausgerechnet.",
  update: root => { const [f, g, a, b, lab] = CEN[radio(root, "m2c")];
    const A = simpN(x => f(x) - g(x), a, b), xs = simpN(x => x * (f(x) - g(x)), a, b) / A, ys = simpN(x => f(x) ** 2 - g(x) ** 2, a, b) / (2 * A);
    const its = [POLY(sample(f, a, b, 120).concat(sample(g, a, b, 120).reverse()), BLUE, .3), L([[xs, 0], [xs, ys]], GRAY, { dash: "dash", thick: 1.3 }), L([[0, ys], [xs, ys]], GRAY, { dash: "dash", thick: 1.3 }), PT([[xs, ys]], RED, 7), TX(xs + .08 * (b - a), ys + .04 * (b - a), "S", RED)];
    stage(root, plot2(its, { xr: [Math.min(a, 0) - .05 * (b - a), b + .05 * (b - a)], scaling: "constrained" }, 520, 340));
    out(root, "r", `${lab}: A = ${num(A, 4)} · <b>S(${num(xs, 3)} | ${num(ys, 3)})</b>`); } };

const AF = { k: [x => Math.sqrt(Math.max(0, 1 - x * x)), 0, 1, Math.PI / 2, "Viertelkreis, r = 1 (exakt π/2)"], p: [x => x * x, 0, 1, 1.478942857544597, "f(x) = x² auf [0, 1]"], s: [Math.sin, 0, Math.PI, 3.820197789027712, "f(x) = sin x auf [0, π]"] };
FIG["m2f-arc"] = { title: "Bogenlänge: Polygonzug mit immer mehr Ecken",
  svg: empty, ui: () => seg("m2b", [["k", "Viertelkreis"], ["p", "Parabel"], ["s", "Sinusbogen"]], "k") + range("n", "Anzahl Strecken n", 1, 40, 1, 3) + `<div class="fig-out" data-o="r"></div>`,
  cap: "Jede Strecke ist nach Pythagoras √(Δx² + Δy²) lang. Für n → ∞ wird die Summe zu L = ∫ √(1 + f′(x)²) dx.",
  update: root => { const [f, a, b, ex, lab] = AF[radio(root, "m2b")], n = val(root, "n"); out(root, "n", n);
    const P = Array.from({ length: n + 1 }, (_, i) => { const x = a + (b - a) * i / n; return [x, f(x)]; }); let Lp = 0; for (let i = 0; i < n; i++) Lp += Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]);
    stage(root, plot2([L(sample(f, a, b, 300), RED, { thick: 3 }), L(P, BLUE, { thick: 2 }), PT(P, BLUE, 4)], { xr: [a, b], scaling: "constrained" }, 520, 320));
    out(root, "r", `${lab}: Polygonzug <b>${num(Lp, 5)}</b> · exakte Bogenlänge ${num(ex, 5)} · Fehler ${num(ex - Lp, 5)}`); } };

const ROT = {
  k: [[x => 2 - x / 2], 0, 4, "Kegel: f(x) = 2 − x/2 auf [0, 4]", "V = π∫₀⁴ (2 − x/2)² dx = 16π/3 ≈ 16.755 = πr²h/3"],
  w: [[Math.sqrt], 0, 4, "Schüssel: f(x) = √x auf [0, 4]", "V = π∫₀⁴ x dx = 8π ≈ 25.133"],
  b: [[x => x, x => x * x], 0, 1, "Beispiel 3.10: f(x) = x außen, g(x) = x² innen", "V = π∫₀¹ (x² − x⁴) dx = 2π/15 ≈ 0.419"],
  g: [[x => Math.sqrt(Math.max(0, 1 - x * x))], -1, 1, "Kugel: Halbkreis √(1 − x²) auf [−1, 1]", "V = π∫₋₁¹ (1 − x²) dx = 4π/3 ≈ 4.189"] };
FIG["m2f-rot"] = { title: "Rotationskörper entstehen lassen",
  svg: empty, ui: () => seg("m2rot", [["k", "Kegel"], ["w", "Schüssel"], ["b", "Beispiel 3.10"], ["g", "Kugel"]], "k") + range("phi", "Drehwinkel", 20, 360, 10, 240) + `<div class="fig-out" data-o="r"></div>`,
  cap: "Die rote Kurve dreht sich um die x-Achse. Jede Scheibe senkrecht zur x-Achse ist ein Kreis mit Radius f(x), daher V<sub>x</sub> = π·∫ f(x)² dx.",
  update: root => { const k = radio(root, "m2rot"), [fs, a, b, lab, vol] = ROT[k], phi = val(root, "phi") * Math.PI / 180; out(root, "phi", Math.round(phi * 180 / Math.PI) + "°");
    const items = fs.map((f, i) => grid((x, t) => [x, f(x) * Math.cos(t), f(x) * Math.sin(t)], a, b, 0, phi, 24, Math.max(6, Math.round(36 * phi / (2 * Math.PI))), i ? ORANGE : null, i ? .9 : null));
    fs.forEach((f, i) => items.push(curve3(x => [x, f(x), 0], a, b, i ? ORANGE : RED, { thick: 3.5 })));
    show3(root, items, { scaling: "constrained", labels: ["x", "y", "z"], orient: [-60, 65] });
    out(root, "r", `${lab}<br>${vol}`); } };

/* ======================= Kapitel 4 ======================= */
const SHAPE = [[0, 0], [0, 3], [2, 3], [2, 2.5], [.5, 2.5], [.5, 1.8], [1.5, 1.8], [1.5, 1.3], [.5, 1.3], [.5, 0], [0, 0]];
const TR = { st: "Streckung", sx: "Spiegelung an der x-Achse", sy: "Spiegelung an der y-Achse", so: "Punktspiegelung am Ursprung", px: "Projektion auf die x-Achse", py: "Projektion auf die y-Achse", dr: "Drehung um α", pk: "Projektion auf y = kx" };
FIG["m2f-trans"] = { title: "Eine Matrix, eine Bewegung: Transformationen am Buchstaben F",
  svg: empty, ui: () => seg("m2t", Object.entries(TR), "dr") + range("p", "Parameter (α in Grad, k oder Streckfaktor)", -180, 180, 5, 45) + `<div class="fig-out" data-o="r"></div>`,
  cap: "Grau: Original, rot: Bild A·P. Am Buchstaben F sieht man auch, ob die Figur gespiegelt wurde. Die Spalten der Matrix sind die Bilder von (1|0) und (0|1).",
  update: root => { const m = radio(root, "m2t"), p = val(root, "p"), al = p * Math.PI / 180, k = p / 30, s = 1 + p / 120;
    const M = { st: [[s, 0], [0, 1]], sx: [[1, 0], [0, -1]], sy: [[-1, 0], [0, 1]], so: [[-1, 0], [0, -1]], px: [[1, 0], [0, 0]], py: [[0, 0], [0, 1]], dr: [[Math.cos(al), -Math.sin(al)], [Math.sin(al), Math.cos(al)]], pk: [[1 / (1 + k * k), k / (1 + k * k)], [k / (1 + k * k), k * k / (1 + k * k)]] }[m];
    const T = SHAPE.map(([x, y]) => [M[0][0] * x + M[0][1] * y, M[1][0] * x + M[1][1] * y]);
    const pl = m === "dr" ? `α = ${p}°` : m === "pk" ? `k = ${num(k, 2)}` : m === "st" ? `Faktor a = ${num(s, 2)}` : "(ohne Parameter)"; out(root, "p", pl);
    const its = [POLY(SHAPE, GRAY, .25), POLY(T, RED, .3)]; if (m === "pk") its.push(L([[-4, -4 * k], [4, 4 * k]], BLUE, { dash: "dash", thick: 1.5 }));
    stage(root, plot2(its, { view: [[-4, 4], [-4, 4]], scaling: "constrained" }, 440, 380));
    const d = M[0][0] * M[1][1] - M[0][1] * M[1][0];
    out(root, "r", `${TR[m]}: A = ${M2m(M.map(r => r.map(v => num(v, 3))))} &nbsp; det A = ${num(d, 3)}${Math.abs(d) < 1e-9 ? " → nicht umkehrbar" : ""}`); } };

const TRI = [[-1, -1], [0, 1], [1, -1]], c45 = Math.SQRT1_2;
const rot45 = ([x, y]) => [c45 * x - c45 * y, c45 * x + c45 * y], mov = ([x, y]) => [x + 3, y + 1];
FIG["m2f-order"] = { title: "Die Reihenfolge entscheidet (Beispiel 4.1)",
  svg: empty, ui: () => seg("m2o", [["vd", "zuerst verschieben, dann drehen: D·V·P"], ["dv", "zuerst drehen, dann verschieben: V·D·P"]], "vd") + range("s", "Schritt", 0, 2, 1, 2) + `<div class="fig-out" data-o="r"></div>`,
  cap: "Grau: Ausgangsdreieck A(−1|−1), B(0|1), C(1|−1). Gestrichelt: nach dem ersten Schritt. Rot: Ergebnis. Verschiebung um (3, 1), Drehung um 45° um den Ursprung.",
  update: root => { const m = radio(root, "m2o"), st = val(root, "s"); out(root, "s", ["Start", "nach Schritt 1", "nach Schritt 2"][st]);
    const f1 = m === "vd" ? mov : rot45, f2 = m === "vd" ? rot45 : mov, T1 = TRI.map(f1), T2 = T1.map(f2), cl = P => P.concat([P[0]]);
    const its = [POLY(TRI, GRAY, .25)]; if (st >= 1) its.push(L(cl(T1), BLUE, { dash: "dash", thick: 2 })); if (st >= 2) its.push(POLY(T2, RED, .35));
    its.push(PT([[0, 0]], "currentColor", 3.5));
    stage(root, plot2(its, { view: [[-2, 5.5], [-2, 4]], scaling: "constrained" }, 520, 360));
    const P = st === 0 ? TRI : st === 1 ? T1 : T2; out(root, "r", `A′(${num(P[0][0], 2)} | ${num(P[0][1], 2)}), B′(${num(P[1][0], 2)} | ${num(P[1][1], 2)}), C′(${num(P[2][0], 2)} | ${num(P[2][1], 2)})`); } };

/* ======================= Kapitel 5 ======================= */
const { svg: fsvg, t: ft, c: fc, p: fp, g: fg } = window.FX || {};
const MP = [[.2, .2, .6], [.4, .5, .1], [.4, .4, .2]], MN = ["A", "B", "C"], MXY = [[90, 160], [240, 50], [390, 160]];
const edge = (i, j, w, cls) => { const [x1, y1] = MXY[i], [x2, y2] = MXY[j], dx = x2 - x1, dy = y2 - y1, L0 = Math.hypot(dx, dy), nx = -dy / L0, ny = dx / L0, o = 18;
  const sx = x1 + dx * 30 / L0 + nx * 8, sy = y1 + dy * 30 / L0 + ny * 8, ex = x2 - dx * 30 / L0 + nx * 8, ey = y2 - dy * 30 / L0 + ny * 8, cx = (x1 + x2) / 2 + nx * o, cy = (y1 + y2) / 2 + ny * o;
  return fp(`M${sx} ${sy} Q${cx} ${cy} ${ex} ${ey}`, { cls, arrow: true, acc: cls === "acc" }) + ft(cx + nx * 10, cy + ny * 10 + 4, String(w).replace(".", ","), { fs: 12, fw: 600 }); };
const loop = (i, w, cls) => { const [x, y] = MXY[i], up = i === 1 ? -1 : 1; return fp(`M${x - 12} ${y + up * 24} C${x - 30} ${y + up * 62} ${x + 30} ${y + up * 62} ${x + 12} ${y + up * 24}`, { cls, arrow: true, acc: cls === "acc" }) + ft(x, y + up * 62 + (up > 0 ? 12 : -4), String(w).replace(".", ","), { fs: 12, fw: 600 }); };
FIG["m2f-mgraph"] = { title: "Übergangsgraph und Übergangsmatrix des Marktbeispiels",
  svg: () => fsvg(480, 250, [0, 1, 2].map(i => fg({ hl: i === 0 ? 1 : null }, [0, 1, 2].map(j => i === j ? loop(i, MP[i][j], i === 0 ? "acc" : "") : edge(i, j, MP[i][j], i === 0 ? "acc" : "")).join(""))).join("") +
    MXY.map(([x, y], i) => fc(x, y, 24, { cls: i === 0 ? "fx-soft" : "fx-card" }) + ft(x, y + 5, MN[i], { fw: 700, fs: 15 })).join("")),
  steps: [
    "Drei Produkte A, B, C sind die <b>Zustände</b>. Jeder Pfeil ist ein möglicher Wechsel, beschriftet mit seiner Wahrscheinlichkeit; Schleifen sind Markentreue.",
    "Von A gehen drei Pfeile weg (hervorgehoben): bleiben 0,2, zu B 0,2, zu C 0,6. Zusammen 1. Das ist die <b>erste Zeile</b> der Übergangsmatrix: (0,2 0,2 0,6).",
    "Alle Zeilen zusammen ergeben P = [[0,2 0,2 0,6], [0,4 0,5 0,1], [0,4 0,4 0,2]]. Zeile = von, Spalte = nach. Jede Zeilensumme ist 1."
  ] };

const MSTAT = [1 / 3, 10 / 27, 8 / 27], MSTART = { h: [.5, .4, .1], a: [1, 0, 0], c: [0, 0, 1] };
FIG["m2f-markov"] = { title: "Die Marktanteile pendeln sich ein",
  svg: empty, ui: () => seg("m2m", [["h", "heute (50 %, 40 %, 10 %)"], ["a", "alle bei A"], ["c", "alle bei C"]], "h") + range("n", "Jahre n", 0, 15, 1, 3) + `<div class="fig-out" data-o="r"></div>`,
  cap: "Jede Linie ist ein Produkt. Gestrichelt: die stabile Verteilung (1/3, 10/27, 8/27). Egal wo man startet, man landet dort: die Kette ist ergodisch.",
  update: root => { const n = val(root, "n"), p0 = MSTART[radio(root, "m2m")]; out(root, "n", n);
    const seq = [p0]; for (let k = 0; k < 15; k++) { const p = seq[k]; seq.push([0, 1, 2].map(j => p.reduce((s, v, i) => s + v * MP[i][j], 0))); }
    const its = [0, 1, 2].map(j => L([[0, MSTAT[j]], [15, MSTAT[j]]], [RED, BLUE, GREEN][j], { dash: "dash", thick: 1.2 }));
    [0, 1, 2].forEach(j => { its.push(L(seq.slice(0, n + 1).map((p, k) => [k, p[j]]), [RED, BLUE, GREEN][j], { legend: MN[j], thick: 2.4 })); its.push(PT(seq.slice(0, n + 1).map((p, k) => [k, p[j]]), [RED, BLUE, GREEN][j], 3.5)); });
    stage(root, plot2(its, { xr: [0, 15], yr0: [0, 1], labels: ["Jahr", "Anteil"] }));
    out(root, "r", `p<sup>(${n})</sup> = (Pᵀ)<sup>${n}</sup>·p<sup>(0)</sup> = (${seq[n].map(v => num(v, 3)).join("; ")})`); } };

FIG["m2f-duel"] = { title: "Duell: wer überlebt? (absorbierende Markovkette)",
  svg: empty, ui: () => range("a", "Trefferwahrscheinlichkeit A", .05, .9, .05, .1) + range("b", "Trefferwahrscheinlichkeit B", .05, .9, .05, .15) + `<div class="fig-out" data-o="r"></div>`,
  cap: "Transient: „A schießt“, „B schießt“. Absorbierend: „A stirbt“, „B stirbt“. Aus Z = (E − Q)⁻¹ und W = Z·R folgen Überlebenschancen und die erwartete Anzahl der Schüsse.",
  update: root => { const a = val(root, "a"), b = val(root, "b"), de = 1 - (1 - a) * (1 - b); out(root, "a", num(a * 100, 0) + " %"); out(root, "b", num(b * 100, 0) + " %");
    const wAB = a / de, wAA = 1 - wAB, wBA = b / de, shots = (2 - a) / de;
    stage(root, fsvg(480, 200, fc(140, 60, 34, { cls: "fx-soft" }) + ft(140, 56, "A", { fw: 700 }) + ft(140, 72, "schießt", { fs: 11 }) + fc(340, 60, 34, { cls: "fx-soft" }) + ft(340, 56, "B", { fw: 700 }) + ft(340, 72, "schießt", { fs: 11 }) +
      fc(140, 160, 28, { cls: "fx-bad" }) + ft(140, 164, "B stirbt", { fs: 11, fw: 600 }) + fc(340, 160, 28, { cls: "fx-bad" }) + ft(340, 164, "A stirbt", { fs: 11, fw: 600 }) +
      fp("M176 48 Q240 20 304 48", { arrow: true }) + ft(240, 24, num(1 - a, 2)) + fp("M304 74 Q240 102 176 74", { arrow: true }) + ft(240 , 106, num(1 - b, 2)) +
      fp("M140 95 L140 130", { arrow: true, cls: "acc", acc: true }) + ft(154, 116, num(a, 2), { a: "start" }) + fp("M340 95 L340 130", { arrow: true, cls: "acc", acc: true }) + ft(354, 116, num(b, 2), { a: "start" })));
    out(root, "r", `Wenn A beginnt: A überlebt mit <b>${num(wAB * 100, 1)} %</b>, B mit ${num(wAA * 100, 1)} % · im Schnitt <b>${num(shots, 2)}</b> Schüsse.<br>Wenn B beginnt: B überlebt mit ${num(wBA * 100, 1)} %.${a < b ? "" : ""}`); } };
})();
