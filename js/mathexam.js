/* StudyOS · Maple-Prüfung (Kurse mit exam: "maple", z. B. MATH-2)
   Aufgaben wie in den Altprüfungen SS 2012 / SS 2016, aber mit neuen Zahlen bei jedem Durchlauf:
   Computergrafik · Integral · Interpolation/Ausgleich · Extremwert · Markovkette (3 + 3 + 3 + 3 + 4 = 16 Punkte).
   Jede Aufgabe hat ein eigenes Maple-Arbeitsblatt, Zahlenantworten werden automatisch mit Toleranz bewertet,
   danach gibt es Lösungsweg und ausführbaren Maple-Code. MX.gen(fam, seed) ist auch für Tests gedacht. */
(function () {
/* ================= Zufall & Zahlen ================= */
const rng = seed => { let a = seed >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const pick = (r, a) => a[Math.floor(r() * a.length)];
const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const frac = (v, maxq = 400) => { for (let q = 1; q <= maxq; q++) { const p = Math.round(v * q); if (Math.abs(p / q - v) < 1e-9) { const g = gcd(p, q) || 1; return q / g === 1 ? String(p / g) : `${p / g}/${q / g}`; } } return null; };
const fmt = (v, d = 4) => { if (Math.abs(v) < 1e-12) return "0"; const s = Math.abs(v) >= 1000 ? v.toFixed(Math.max(0, d - 4 + 1)) : +v.toPrecision(d) + ""; return s.replace(/\.?0+$/, m => m.includes(".") ? "" : m); };
const nice = v => { const f = frac(v, 200); return f && f.includes("/") ? `${f} ≈ ${fmt(v)}` : f || fmt(v); };
const mstr = v => { const f = frac(v, 400); return f != null ? f : String(+v.toPrecision(10)); }; // Zahl als Maple-Eingabe
const simpson = (f, a, b, n = 4000) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };
const arc = (df, a, b) => simpson(x => Math.sqrt(1 + df(x) ** 2), a, b);
const bisect = (f, a, b) => { let fa = f(a); for (let i = 0; i < 200; i++) { const m = (a + b) / 2, fm = f(m); if ((fm < 0) === (fa < 0)) { a = m; fa = fm; } else b = m; } return (a + b) / 2; };
function solve(A, b) { const n = b.length, M = A.map((r, i) => r.concat([b[i]])); for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; [M[c], M[p]] = [M[p], M[c]]; for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; } } return M.map((r, i) => r[n] / r[i]); }
const stat = P => { const n = P.length, A = []; for (let i = 0; i < n; i++) A.push(P.map((row, j) => (i === n - 1 ? 1 : row[i] - (i === j ? 1 : 0)))); const b = Array(n).fill(0); b[n - 1] = 1; return solve(A, b); };
const step = (p, P) => P[0].map((_, j) => p.reduce((s, pi, i) => s + pi * P[i][j], 0));
const lsq = (pts, basis) => { const k = basis.length, A = basis.map(f => basis.map(g => pts.reduce((s, [x]) => s + f(x) * g(x), 0))), b = basis.map(f => pts.reduce((s, [x, y]) => s + f(x) * y, 0)); return solve(A, b); };
const matH = rows => `<table class="mmat">${rows.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join("")}</tr>`).join("")}</table>`;
const A = (label, v, o = {}) => Object.assign({ label, v, tol: Math.max(0.006, 0.004 * Math.abs(v)) }, o);

/* ================= Aufgaben-Familien ================= */
const FAM = [
  { id: "cg", name: "Computergrafik", pts: 3, topic: "mt-komb" },
  { id: "int", name: "Integralrechnung", pts: 3, topic: "mt-flae" },
  { id: "fit", name: "Interpolation & Ausgleich", pts: 3, topic: "mt-ipol" },
  { id: "opt", name: "Extremwertaufgabe", pts: 3, topic: "mt-opt" },
  { id: "mk", name: "Markovkette", pts: 4, topic: "mt-mvert" }
];
const ROT = [{ d: 90, s: "um 90° gegen den Uhrzeigersinn", m: "Pi/2", c: [[0, -1], [1, 0]] }, { d: -90, s: "um 90° im Uhrzeigersinn", m: "-Pi/2", c: [[0, 1], [-1, 0]] }, { d: 180, s: "um 180°", m: "Pi", c: [[-1, 0], [0, -1]] }];
const apply = (R, p) => [R[0][0] * p[0] + R[0][1] * p[1], R[1][0] * p[0] + R[1][1] * p[1]];
const pt = p => `(${fmt(p[0])} | ${fmt(p[1])})`;

const GEN = {
  /* ---------- Computergrafik ---------- */
  cg(r) {
    const v = ri(r, 0, 2), b = ri(r, 2, 6), c = ri(r, 2, 6), B = [b, 0], C = [0, c];
    const head = `Gegeben ist ein Dreieck mit A(0|0), B(${b}|0) und C(0|${c}).`;
    const plotLine = (Bp, Cp, Ap) => `display(polygonplot([[0, 0], [${b}, 0], [0, ${c}]], color = blue), polygonplot([[${fmt(Ap[0])}, ${fmt(Ap[1])}], [${fmt(Bp[0])}, ${fmt(Bp[1])}], [${fmt(Cp[0])}, ${fmt(Cp[1])}]], color = red), scaling = constrained);`;
    const pre = ["with(LinearAlgebra):  with(plots):", "T := (a, b) -> Matrix([[1, 0, a], [0, 1, b], [0, 0, 1]]):"];
    if (v === 0) { // wie SS 2016
      const M = [ri(r, 1, 4), ri(r, 1, 4)], R = pick(r, ROT), f = p => { const q = apply(R.c, p); return [M[0] + q[0], M[1] + q[1]]; }, Bp = f(B), Cp = f(C);
      return { title: "Dreieck verschieben und um einen Punkt drehen",
        html: `${head} Verschieben Sie das Dreieck zuerst so, dass A zum Punkt M(${M[0]}|${M[1]}) wird, und drehen Sie es im Anschluss ${R.s} um M. Stellen Sie die Transformationsmatrix auf und zeichnen Sie Ausgangs- und Enddreieck. Geben Sie die Bildpunkte B′ und C′ an.`,
        answers: [A("B′ x", Bp[0]), A("B′ y", Bp[1]), A("C′ x", Cp[0]), A("C′ y", Cp[1])],
        steps: `<ol><li>Verschiebung A → M: T(${M[0]}, ${M[1]}).</li><li>Drehung um M: T(M)·R·T(−M) mit R ${R.s}${R.d === -90 ? " (Uhrzeigersinn = negativer Winkel)" : ""}.</li><li>Gesamt von rechts nach links: G = T(M)·R·T(−M)·T(M) = T(M)·R.</li><li>Eckpunkte als homogene Spalten (x, y, 1) multiplizieren.</li></ol>`,
        code: pre.concat([`R := Matrix([[cos(${R.m}), -sin(${R.m}), 0], [sin(${R.m}), cos(${R.m}), 0], [0, 0, 1]]):`, `G := T(${M[0]}, ${M[1]}) . R . T(${-M[0]}, ${-M[1]}) . T(${M[0]}, ${M[1]});`, `Q := G . Matrix([[0, ${b}, 0], [0, 0, ${c}], [1, 1, 1]]);`, plotLine(Bp, Cp, M)]),
        chk: ["Q[1, 2]", "Q[2, 2]", "Q[1, 3]", "Q[2, 3]"],
        result: `G = ${matH([[R.c[0][0], R.c[0][1], M[0]], [R.c[1][0], R.c[1][1], M[1]], [0, 0, 1]])} A′ = M${pt(M)}, B′${pt(Bp)}, C′${pt(Cp)}.` };
    }
    if (v === 1) { // um C drehen, dann verschieben
      const R = pick(r, ROT), t = [ri(r, -4, 5), ri(r, -4, 5)], f = p => { const q = apply(R.c, [p[0] - C[0], p[1] - C[1]]); return [C[0] + q[0] + t[0], C[1] + q[1] + t[1]]; }, Ap = f([0, 0]), Bp = f(B), Cp = f(C);
      return { title: "Um eine Ecke drehen, dann verschieben",
        html: `${head} Drehen Sie das Dreieck zuerst ${R.s} um den Punkt C und verschieben Sie es danach um den Vektor (${t[0]}, ${t[1]}). Wie lautet die Gesamtmatrix? Geben Sie B′ und C′ an und zeichnen Sie beide Dreiecke.`,
        answers: [A("B′ x", Bp[0]), A("B′ y", Bp[1]), A("C′ x", Cp[0]), A("C′ y", Cp[1])],
        steps: `<ol><li>Drehung um C(0|${c}): T(0, ${c})·R·T(0, ${-c}).</li><li>Danach Verschiebung: links davor T(${t[0]}, ${t[1]}).</li><li>G = T(${t[0]}, ${t[1]})·T(0, ${c})·R·T(0, ${-c}).</li><li>C bleibt bei der Drehung fest, C′ = C + (${t[0]}, ${t[1]}).</li></ol>`,
        code: pre.concat([`R := Matrix([[cos(${R.m}), -sin(${R.m}), 0], [sin(${R.m}), cos(${R.m}), 0], [0, 0, 1]]):`, `G := T(${t[0]}, ${t[1]}) . T(0, ${c}) . R . T(0, ${-c});`, `Q := G . Matrix([[0, ${b}, 0], [0, 0, ${c}], [1, 1, 1]]);`, plotLine(Bp, Cp, Ap)]),
        chk: ["Q[1, 2]", "Q[2, 2]", "Q[1, 3]", "Q[2, 3]"],
        result: `A′${pt(Ap)}, B′${pt(Bp)}, C′${pt(Cp)}.` };
    }
    // Projektion / Spiegelung an y = kx (wie SS 2012)
    const k = pick(r, [1, 2, 3, -1, -2, 0.5]), kind = r() < 0.5 ? "proj" : "refl", P = [ri(r, 1, 6), ri(r, -3, 6)], n = 1 + k * k;
    const Pr = [[1 / n, k / n], [k / n, k * k / n]], S = [[2 / n - 1, 2 * k / n], [2 * k / n, 2 * k * k / n - 1]], Mx = kind === "proj" ? Pr : S, Q = apply(Mx, P), ks = k === 0.5 ? "x/2" : k === 1 ? "x" : k === -1 ? "-x" : `${k}x`, km = k === 0.5 ? "1/2" : String(k);
    return { title: kind === "proj" ? `Projektion auf die Gerade y = ${ks}` : `Spiegelung an der Geraden y = ${ks}`,
      html: `Gesucht ist eine 2×2-Transformationsmatrix, welche Punkte ${kind === "proj" ? "auf die Gerade" : "an der Geraden"} y = ${ks} ${kind === "proj" ? "projiziert" : "spiegelt"}. Testen Sie Ihre Matrix mit dem Punkt P(${P[0]}|${P[1]}). Geben Sie die Matrixeinträge m₁₁ und m₁₂ sowie den Bildpunkt an.`,
      answers: [A("m₁₁", Mx[0][0]), A("m₁₂", Mx[0][1]), A("P′ x", Q[0]), A("P′ y", Q[1])],
      steps: `<ol><li>Richtungsvektor der Geraden u = (1, ${km}).</li><li>Projektion: Pr = u·uᵀ / (uᵀ·u) = 1/${mstr(n)}·[[1, ${km}], [${km}, ${mstr(k * k)}]].</li>${kind === "refl" ? "<li>Spiegelung: S = 2·Pr − E (Punkt → Fußpunkt → gleich weit darüber hinaus).</li>" : "<li>Kontrolle: Pr·Pr = Pr.</li>"}<li>Mit P multiplizieren; das Bild muss ${kind === "proj" ? "auf der Geraden liegen" : "gleich weit von der Geraden entfernt sein"}.</li></ol>`,
      code: ["with(LinearAlgebra):", `u := Vector([1, ${km}]):`, "Pr := u . Transpose(u) / (Transpose(u) . u);"].concat(kind === "refl" ? ["S := 2*Pr - IdentityMatrix(2);", `S . Vector([${P[0]}, ${P[1]}]);`] : [`Pr . Vector([${P[0]}, ${P[1]}]);`]),
      chk: kind === "refl" ? ["S[1, 1]", "S[1, 2]", `(S . Vector([${P[0]}, ${P[1]}]))[1]`, `(S . Vector([${P[0]}, ${P[1]}]))[2]`] : ["Pr[1, 1]", "Pr[1, 2]", `(Pr . Vector([${P[0]}, ${P[1]}]))[1]`, `(Pr . Vector([${P[0]}, ${P[1]}]))[2]`],
      result: `Matrix ${matH(Mx.map(row => row.map(nice)))} P′${pt(Q)} = (${nice(Q[0])} | ${nice(Q[1])}).` };
  },

  /* ---------- Integralrechnung ---------- */
  int(r) {
    const v = ri(r, 0, 2);
    if (v === 0) { // Parabel und Gerade: Fläche, Umfang, Drehkörper um die x-Achse
      const c = pick(r, [1, 2, 4]), m = pick(r, [1, 2, 3]), X = m * c, cs = c === 1 ? "x^2" : `x^2/${c}`;
      const Ar = m * X * X / 2 - X ** 3 / (3 * c), V = Math.PI * (m * m * X ** 3 / 3 - X ** 5 / (5 * c * c)), L = X * Math.sqrt(1 + m * m) + arc(x => 2 * x / c, 0, X);
      return { title: "Fläche zwischen Parabel und Gerade", topic: "mt-flae",
        html: `Die Parabel y = ${cs.replace("^2", "²")} und die Gerade y = ${m === 1 ? "" : m}x schließen eine Fläche ein. Berechnen Sie (i) den Flächeninhalt, (ii) den Umfang der Fläche und (iii) das Volumen des Körpers, der entsteht, wenn die Fläche um die x-Achse rotiert.`,
        answers: [A("Fläche", Ar), A("Umfang", L), A("Volumen", V)],
        steps: `<ol><li>Schnittpunkte: ${m === 1 ? "" : m}x = ${cs.replace("^2", "²")} → x = 0 und x = ${X}. Dazwischen liegt die Gerade oben.</li><li>Fläche: ∫₀<sup>${X}</sup> (${m}x − ${cs.replace("^2", "²")}) dx.</li><li>Umfang = Geradenstück (Länge ${X}·√${1 + m * m}) + Parabelbogen ∫√(1 + f′²) dx.</li><li>Rotation um die x-Achse (Ring): V = π∫₀<sup>${X}</sup> (g² − f²) dx.</li></ol>`,
        code: [`f := ${cs}:  g := ${m}*x:`, `plot([f, g], x = -0.5..${X + 0.5});`, "xs := solve(f = g, x);", `F := int(g - f, x = 0..${X});`, `U := int(sqrt(1 + diff(g, x)^2), x = 0..${X}) + int(sqrt(1 + diff(f, x)^2), x = 0..${X}):  evalf(U);`, `V := Pi*int(g^2 - f^2, x = 0..${X});  evalf(V);`],
        chk: ["F", "U", "V"], result: `Fläche ${nice(Ar)}, Umfang ≈ ${fmt(L)}, Volumen ≈ ${fmt(V)}.` };
    }
    if (v === 1) { // Kreis + Parabel (wie SS 2012), Drehung um die y-Achse
      const R = pick(r, [4, 5, 6]), c = pick(r, [2, 3, 4]), x2 = Math.sqrt((-1 + Math.sqrt(1 + 4 * R * R / (c * c))) * c * c / 2);
      const top = x => Math.sqrt(R * R - x * x), Ar = simpson(x => top(x) - x * x / c, 0, x2), L = R + arc(x => 2 * x / c, 0, x2) + R * Math.asin(x2 / R), V = 2 * Math.PI * simpson(x => x * (top(x) - x * x / c), 0, x2);
      return { title: "Kreisbogen, Parabel und y-Achse", topic: "mt-rot",
        html: `Eine Fläche im ersten Quadranten wird von der y-Achse, dem Kreis x² + y² = ${R * R} (oben) und der Parabel y = x²/${c} (unten) begrenzt. Bestimmen Sie (i) den Flächeninhalt, (ii) den Umfang und (iii) das Volumen des Drehkörpers bei Rotation um die y-Achse.`,
        answers: [A("Fläche", Ar), A("Umfang", L), A("Volumen", V)],
        steps: `<ol><li>Skizze! Oberer Kreisbogen y = √(${R * R} − x²).</li><li>Schnittpunkt mit fsolve: x₂ ≈ ${fmt(x2)}.</li><li>Fläche ∫₀<sup>x₂</sup> (√(${R * R} − x²) − x²/${c}) dx.</li><li>Umfang = Strecke auf der y-Achse (Länge ${R}) + Parabelbogen + Kreisbogen, je mit ∫√(1 + f′²) dx.</li><li>Rotation um die y-Achse mit Zylinderschalen: V = 2π∫ x·(oben − unten) dx.</li></ol>`,
        code: [`k := sqrt(${R * R} - x^2):  p := x^2/${c}:`, `plot([k, p], x = 0..${R}, view = [0..${R}, 0..${R}], scaling = constrained);`, `x2 := fsolve(p = k, x = 0..${R});`, "F := int(k - p, x = 0..x2);", `U := ${R} + int(sqrt(1 + diff(p, x)^2), x = 0..x2) + int(sqrt(1 + diff(k, x)^2), x = 0..x2);`, "V := 2*Pi*int(x*(k - p), x = 0..x2);"],
        chk: ["F", "U", "V"], result: `x₂ ≈ ${fmt(x2)}, Fläche ≈ ${fmt(Ar)}, Umfang ≈ ${fmt(L)}, Volumen ≈ ${fmt(V)}.` };
    }
    const F = pick(r, [
      { s: "sin(x)", h: "sin(x)", a: 0, b: "Pi", bv: Math.PI, f: Math.sin, d: Math.cos },
      { s: "x^2/2", h: "x²/2", a: 0, b: "2", bv: 2, f: x => x * x / 2, d: x => x },
      { s: "sqrt(x)", h: "√x", a: 1, b: "4", bv: 4, f: Math.sqrt, d: x => 0.5 / Math.sqrt(x) },
      { s: "exp(x/2)", h: "e<sup>x/2</sup>", a: 0, b: "2", bv: 2, f: x => Math.exp(x / 2), d: x => Math.exp(x / 2) / 2 },
      { s: "1/x", h: "1/x", a: 1, b: "3", bv: 3, f: x => 1 / x, d: x => -1 / (x * x) }]);
    const Ar = simpson(F.f, F.a, F.bv), L = arc(F.d, F.a, F.bv), V = Math.PI * simpson(x => F.f(x) ** 2, F.a, F.bv);
    return { title: "Fläche, Bogenlänge und Drehkörper", topic: "mt-bogen",
      html: `Gegeben ist f(x) = ${F.h} auf dem Intervall [${F.a}, ${F.b === "Pi" ? "π" : F.b}]. Berechnen Sie (i) die Fläche unter der Kurve, (ii) die Länge des Kurvenstücks und (iii) das Volumen des Drehkörpers bei Rotation um die x-Achse.`,
      answers: [A("Fläche", Ar), A("Bogenlänge", L), A("Volumen", V)],
      steps: `<ol><li>Fläche A = ∫ f(x) dx.</li><li>Bogenlänge L = ∫ √(1 + f′(x)²) dx; das Integral ist meist nicht elementar, also evalf.</li><li>Volumen um die x-Achse: V = π∫ f(x)² dx (Scheiben mit Radius f(x)).</li></ol>`,
      code: [`f := ${F.s}:`, `plot(f, x = ${F.a}..${F.b}, filled = true);`, `F := int(f, x = ${F.a}..${F.b});`, `L := evalf(int(sqrt(1 + diff(f, x)^2), x = ${F.a}..${F.b}));`, `V := Pi*int(f^2, x = ${F.a}..${F.b});  evalf(V);`],
      chk: ["F", "L", "V"], result: `Fläche ≈ ${fmt(Ar)}, Bogenlänge ≈ ${fmt(L)}, Volumen ≈ ${fmt(V)}.` };
  },

  /* ---------- Interpolation & Ausgleich ---------- */
  fit(r) {
    if (r() < 0.5) { // Parabel durch 3 Punkte (wie SS 2016)
      const F = pick(r, [
        { h: "sin(x)", s: "sin(x)", xs: [0, Math.PI / 2, Math.PI], xm: ["0", "Pi/2", "Pi"], f: Math.sin, I: "[0, π]" },
        { h: "cos(x)", s: "cos(x)", xs: [-Math.PI / 2, 0, Math.PI / 2], xm: ["-Pi/2", "0", "Pi/2"], f: Math.cos, I: "[−π/2, π/2]" },
        { h: "√x", s: "sqrt(x)", xs: [0, 2, 4], xm: ["0", "2", "4"], f: Math.sqrt, I: "[0, 4]" },
        { h: "eˣ", s: "exp(x)", xs: [0, 1, 2], xm: ["0", "1", "2"], f: Math.exp, I: "[0, 2]" },
        { h: "ln(x)", s: "ln(x)", xs: [1, 2, 3], xm: ["1", "2", "3"], f: Math.log, I: "[1, 3]" },
        { h: "1/(1 + x²)", s: "1/(1 + x^2)", xs: [-2, 0, 2], xm: ["-2", "0", "2"], f: x => 1 / (1 + x * x), I: "[−2, 2]" }]);
      const [x0, x1, x2] = F.xs, [y0, y1, y2] = F.xs.map(F.f), a2 = ((y2 - y1) / (x2 - x1) - (y1 - y0) / (x1 - x0)) / (x2 - x0);
      const p = x => y0 * (x - x1) * (x - x2) / ((x0 - x1) * (x0 - x2)) + y1 * (x - x0) * (x - x2) / ((x1 - x0) * (x1 - x2)) + y2 * (x - x0) * (x - x1) / ((x2 - x0) * (x2 - x1));
      let best = 0, bx = x0; for (let i = 0; i <= 20000; i++) { const x = x0 + (x2 - x0) * i / 20000, d = Math.abs(F.f(x) - p(x)); if (d > best) { best = d; bx = x; } }
      const lo = Math.max(x0 + 1e-3, bx - 0.25 * (x2 - x0) / 2), hi = Math.min(x2 - 1e-3, bx + 0.25 * (x2 - x0) / 2);
      return { title: `${F.h} durch eine Parabel annähern`, topic: "mt-ipol",
        html: `Die Funktion f(x) = ${F.h} soll im Bereich ${F.I} durch eine Parabel p(x) angenähert werden, die durch die Punkte bei x = ${F.xm.join(", ").replace(/Pi/g, "π")} geht. Berechnen Sie die Parabel und die größte Abweichung max |f(x) − p(x)| im Bereich. Geben Sie den Koeffizienten von x² und die größte Abweichung an.`,
        answers: [A("Koeffizient von x²", a2), A("größte Abweichung", best, { tol: Math.max(0.0015, 0.01 * best) })],
        steps: `<ol><li>Stützpunkte (x | f(x)) aufstellen und PolynomialInterpolation verwenden.</li><li>Abweichung d(x) = f(x) − p(x); an den Stützstellen ist d = 0.</li><li>Extremum von d mit fsolve(diff(d, x) = 0, …) in einem Bereich zwischen zwei Stützstellen suchen (Plot von |d| zeigt wo).</li><li>|d| an dieser Stelle ist die größte Abweichung.</li></ol>`,
        code: ["with(CurveFitting):", `f := ${F.s}:`, `p := PolynomialInterpolation([${F.xm.map(x => `[${x}, eval(f, x = ${x})]`).join(", ")}], x);`, "d := f - p:", `plot(abs(d), x = ${F.xm[0]}..${F.xm[2]});`, `x0 := fsolve(diff(d, x) = 0, x = ${fmt(lo, 3)}..${fmt(hi, 3)});`, "evalf(abs(eval(d, x = x0)));"],
        chk: [`coeff(expand(p), x, 2)`, "abs(eval(d, x = x0))"], result: `Koeffizient von x² ≈ ${fmt(a2)}, größte Abweichung ≈ ${fmt(best)} bei x ≈ ${fmt(bx)}.` };
    }
    // Ausgleichskurve & Prognose (wie SS 2012)
    const ctx = pick(r, [{ w: "Einwohner einer Stadt in Tausend", x: "Jahr", t0: 1980, dt: 10 }, { w: "Nutzer einer App in Tausend", x: "Jahr", t0: 2018, dt: 1 }, { w: "Umsatz eines Start-ups in Tsd. €", x: "Quartal", t0: 1, dt: 1 }]);
    const exp = r() < 0.6, a0 = ri(r, 20, 60) * 100, b0 = ri(r, 8, 30) * 10, c0 = ri(r, 20, 80) * 10;
    const ys = [0, 1, 2, 3, 4].map(x => Math.round((exp ? a0 + b0 * Math.exp(x) : a0 + c0 * x + b0 * x * x) * (1 + (r() - 0.5) * 0.06)));
    const P = ys.map((y, x) => [x, y]), m = lsq(P, exp ? [() => 1, Math.exp] : [() => 1, x => x, x => x * x]), lin = lsq(P, [() => 1, x => x]);
    const pm = exp ? m[0] + m[1] * Math.exp(5) : m[0] + m[1] * 5 + m[2] * 25, pl = lin[0] + lin[1] * 5, tl = ctx.x === "Quartal" ? `${ctx.t0 + 5}. Quartal` : String(ctx.t0 + 5 * ctx.dt);
    const curve = exp ? "a + b*exp(x)" : "a + b*x + c*x^2";
    return { title: "Ausgleichskurve und Prognose", topic: "mt-fit",
      html: `Die Tabelle zeigt ${ctx.w}:<table class="tbl"><tr><th>${ctx.x}</th>${ys.map((_, i) => `<td>${ctx.x === "Quartal" ? i + 1 + "." : ctx.t0 + i * ctx.dt}</td>`).join("")}</tr><tr><th>Wert</th>${ys.map(y => `<td>${y}</td>`).join("")}</tr></table>Schätzen Sie den Wert für ${tl} mit dem Modell y(x) = ${exp ? "a + b·eˣ" : "a + b·x + c·x²"} (x = 0, 1, 2, … für die Tabellenspalten). Was ergibt sich, wenn man lineares Wachstum voraussetzt?`,
      answers: [A(`Prognose ${tl} (Modell)`, pm, { tol: Math.max(1, 0.005 * Math.abs(pm)) }), A(`Prognose ${tl} (linear)`, pl, { tol: Math.max(1, 0.005 * Math.abs(pl)) })],
      steps: `<ol><li>x = 0 … 4 statt der echten ${ctx.x === "Quartal" ? "Quartale" : "Jahreszahlen"}, sonst werden die Zahlen riesig${exp ? " (e<sup>2018</sup>!)" : ""}.</li><li>LeastSquares(P, x, curve = ${curve}) minimiert die Summe der Fehlerquadrate.</li><li>${tl} entspricht x = 5: einsetzen.</li><li>Dasselbe mit curve = a + b·x und vergleichen.</li></ol>`,
      code: ["with(CurveFitting):", `P := [${P.map(([x, y]) => `[${x}, ${y}]`).join(", ")}]:`, `y1 := LeastSquares(P, x, curve = ${curve});`, "evalf(eval(y1, x = 5));", "y2 := LeastSquares(P, x, curve = a + b*x);", "evalf(eval(y2, x = 5));", "plot([y1, y2, P], x = 0..5, style = [line, line, point], legend = [\"Modell\", \"linear\", \"Daten\"]);"],
      chk: ["eval(y1, x = 5)", "eval(y2, x = 5)"], result: `Modell: ${fmt(pm, 7)}, linear: ${fmt(pl, 7)}.` };
  },

  /* ---------- Extremwertaufgaben ---------- */
  opt(r) {
    const v = ri(r, 0, 4);
    if (v === 0) { const O = pick(r, [100, 150, 200, 250, 300]), rr = Math.pow(O * O / (3 * Math.PI ** 2), 0.25), h = Math.SQRT2 * rr, V = rr * rr * Math.PI * h / 3;
      return { title: "Kegel ohne Deckel", topic: "mt-opt", html: `Ein kegelförmiger Behälter ohne Deckel hat die Mantelfläche O = ${O} m². Welcher Radius und welche Höhe ergeben das größte Volumen? Wie groß ist es? (V = r²πh/3, O = rπ√(h² + r²))`,
        answers: [A("Radius r", rr), A("Höhe h", h), A("Volumen V", V)],
        steps: `<ol><li>Nebenbedingung nach h auflösen: h = √(O²/(π²r²) − r²).</li><li>In V einsetzen → V(r) mit einer Variablen.</li><li>V′(r) = 0 mit fsolve im Bereich 0 < r < √(O/π).</li><li>Am Rand ist V = 0, also ist es ein Maximum (h = √2·r).</li></ol>`,
        code: [`O := ${O}:  hh := sqrt(O^2/(Pi^2*r^2) - r^2):`, "V := r^2*Pi*hh/3:", `r0 := fsolve(diff(V, r) = 0, r = 0.1..${fmt(Math.sqrt(O / Math.PI) - 0.01, 3)});`, "h0 := eval(hh, r = r0);  evalf(eval(V, r = r0));", "plot(V, r = 0..sqrt(O/Pi));"],
        chk: ["r0", "h0", "eval(V, r = r0)"], result: `r ≈ ${fmt(rr)} m, h ≈ ${fmt(h)} m, V ≈ ${fmt(V)} m³.` }; }
    if (v === 1) { const a = pick(r, [20, 24, 30, 40]), b = pick(r, [16, 20, 30, 50].filter(x => x !== a)), x = (a + b - Math.sqrt(a * a - a * b + b * b)) / 6, V = x * (a - 2 * x) * (b - 2 * x);
      return { title: "Offene Schachtel aus einem Blech", topic: "mt-opt", html: `Aus einem rechteckigen Blech (${a} cm × ${b} cm) wird eine oben offene Schachtel gebaut: An den Ecken werden gleich große Quadrate mit Seite x ausgeschnitten und die Ränder hochgebogen. Für welches x ist das Volumen maximal? Wie groß ist es?`,
        answers: [A("x in cm", x), A("Volumen in cm³", V)],
        steps: `<ol><li>V(x) = x·(${a} − 2x)·(${b} − 2x), sinnvoll für 0 < x < ${Math.min(a, b) / 2}.</li><li>V′(x) = 0 ist eine quadratische Gleichung; nur die Lösung im sinnvollen Bereich zählt.</li><li>V″ < 0 bestätigt das Maximum.</li></ol>`,
        code: [`V := x*(${a} - 2*x)*(${b} - 2*x):`, "solve(diff(V, x) = 0, x);", `x0 := fsolve(diff(V, x) = 0, x = 0..${Math.min(a, b) / 2});`, "eval(V, x = x0);  eval(diff(V, x, x), x = x0);", `plot(V, x = 0..${Math.min(a, b) / 2});`],
        chk: ["x0", "eval(V, x = x0)"], result: `x ≈ ${fmt(x)} cm, V ≈ ${fmt(V)} cm³.` }; }
    if (v === 2) { const h = pick(r, [4, 6, 8, 9, 12]), k = pick(r, [1, 2, 0.5]), x = Math.sqrt(h / (3 * k)), ks = k === 1 ? "" : k === 0.5 ? "0.5·" : k + "·", km = k === 0.5 ? "1/2*" : k === 1 ? "" : k + "*";
      return { title: "Rechteck unter einer Parabel", topic: "mt-opt", html: `Unter der Parabel y = ${h} − ${ks}x² und über der x-Achse soll ein Rechteck liegen, dessen obere Ecken auf der Parabel liegen (symmetrisch zur y-Achse). Bestimmen Sie Breite, Höhe und den größten Flächeninhalt.`,
        answers: [A("Breite", 2 * x), A("Höhe", 2 * h / 3), A("Fläche", 4 * h * x / 3)],
        steps: `<ol><li>Rechte obere Ecke (x | ${h} − ${ks}x²), Breite 2x.</li><li>F(x) = 2x·(${h} − ${ks}x²).</li><li>F′(x) = 0 → x = √(${h}/(3·${k})).</li><li>Höhe = ${h} − ${ks}x² = 2/3 · ${h}.</li></ol>`,
        code: [`y := ${h} - ${km}x^2:  F := 2*x*y:`, "xs := solve(diff(F, x) = 0, x);", "x0 := max(evalf([xs]));", "2*x0;  eval(y, x = x0);  eval(F, x = x0);"],
        chk: ["2*x0", "eval(y, x = x0)", "eval(F, x = x0)"], result: `Breite ≈ ${fmt(2 * x)}, Höhe ≈ ${fmt(2 * h / 3)}, Fläche ≈ ${fmt(4 * h * x / 3)}.` }; }
    if (v === 3) { const V = pick(r, [330, 500, 750, 1000]), open = r() < 0.4, rr = open ? Math.cbrt(V / Math.PI) : Math.cbrt(V / (2 * Math.PI)), h = V / (Math.PI * rr * rr), O = (open ? 1 : 2) * Math.PI * rr * rr + 2 * Math.PI * rr * h;
      return { title: open ? "Becher ohne Deckel mit wenig Material" : "Getränkedose mit wenig Material", topic: "mt-opt", html: `Ein zylinderförmiger ${open ? "Becher ohne Deckel" : "Behälter mit Deckel und Boden"} soll ${V} cm³ fassen. Bei welchem Radius und welcher Höhe braucht man am wenigsten Material? Wie groß ist die Oberfläche dann?`,
        answers: [A("Radius in cm", rr), A("Höhe in cm", h), A("Oberfläche in cm²", O)],
        steps: `<ol><li>Nebenbedingung V = r²πh → h = ${V}/(πr²).</li><li>Oberfläche ${open ? "O = r²π + 2rπh (ein Boden, kein Deckel)" : "O = 2r²π + 2rπh"}, h einsetzen.</li><li>O′(r) = 0 lösen → ${open ? "h = r" : "h = 2r"}.</li></ol>`,
        code: [`V0 := ${V}:  hh := V0/(Pi*r^2):`, `O := ${open ? 1 : 2}*Pi*r^2 + 2*Pi*r*hh:`, "r0 := fsolve(diff(O, r) = 0, r = 0.5..30);", "h0 := evalf(eval(hh, r = r0));  evalf(eval(O, r = r0));", "plot(O, r = 1..15);"],
        chk: ["r0", "h0", "eval(O, r = r0)"], result: `r ≈ ${fmt(rr)} cm, h ≈ ${fmt(h)} cm, O ≈ ${fmt(O)} cm².` }; }
    // Brunnen / Fermat-Punkt: Summe der Abstände minimal
    let Pts; for (;;) { Pts = [[ri(r, 0, 3), ri(r, 0, 3)], [ri(r, 8, 13), ri(r, 0, 5)], [ri(r, 2, 9), ri(r, 7, 11)]]; const ang = i => { const [a, b, c] = [Pts[i], Pts[(i + 1) % 3], Pts[(i + 2) % 3]], u = [b[0] - a[0], b[1] - a[1]], w = [c[0] - a[0], c[1] - a[1]]; return Math.acos((u[0] * w[0] + u[1] * w[1]) / Math.hypot(...u) / Math.hypot(...w)) * 180 / Math.PI; }; if ([0, 1, 2].every(i => ang(i) < 115)) break; }
    let x = (Pts[0][0] + Pts[1][0] + Pts[2][0]) / 3, y = (Pts[0][1] + Pts[1][1] + Pts[2][1]) / 3;
    for (let i = 0; i < 2000; i++) { let sx = 0, sy = 0, sw = 0; Pts.forEach(([a, b]) => { const d = Math.hypot(x - a, y - b) || 1e-12; sx += a / d; sy += b / d; sw += 1 / d; }); x = sx / sw; y = sy / sw; }
    const Lm = Pts.reduce((s, [a, b]) => s + Math.hypot(x - a, y - b), 0), Pn = ["A", "B", "C"];
    return { title: "Brunnen mit kürzester Leitung", topic: "mt-extr", html: `Drei Häuser liegen bei ${Pts.map((p, i) => `${Pn[i]}(${p[0]}|${p[1]})`).join(", ")} (Angaben in 100 m). Ein Brunnen B(x|y) soll so gebaut werden, dass die Summe der Leitungslängen zu allen drei Häusern möglichst klein ist. Wo liegt B und wie lang sind die Leitungen zusammen?`,
      answers: [A("x", x, { tol: 0.02 }), A("y", y, { tol: 0.02 }), A("Gesamtlänge", Lm, { tol: 0.02 })],
      steps: `<ol><li>Zielfunktion l(x, y) = Summe der drei Abstände √((x − xᵢ)² + (y − yᵢ)²).</li><li>Notwendige Bedingung: l<sub>x</sub> = 0 und l<sub>y</sub> = 0. Das System ist nicht händisch lösbar → fsolve oder Minimize.</li><li>Der Punkt ist der Fermat-Punkt: Von B aus sieht man je zwei Häuser unter 120°.</li></ol>`,
      code: [`l := ${Pts.map(([a, b]) => `sqrt((x - ${a})^2 + (y - ${b})^2)`).join(" + ")}:`, "with(Optimization): Minimize(l);", `fsolve({diff(l, x) = 0, diff(l, y) = 0}, {x = 0..14, y = 0..12});`, "plot3d(l, x = 0..14, y = 0..12);"],
      chk: [], result: `B ≈ (${fmt(x)} | ${fmt(y)}), Gesamtlänge ≈ ${fmt(Lm)} (= ${fmt(Lm * 100, 5)} m).` };
  },

  /* ---------- Markovketten ---------- */
  mk(r) {
    const v = ri(r, 0, 3);
    if (v === 0) { // Roboter / Zufallsweg durch Räume (wie SS 2016)
      const G = pick(r, [
        { n: 6, e: "AB AC AD BC BD CE CF DE DF EF" }, { n: 5, e: "AB BC CD DE EA AC" }, { n: 5, e: "AB AC BC BD CD DE" },
        { n: 6, e: "AB BC CD DA AC DE EF CF" }, { n: 5, e: "AB AC AD AE BC DE" }]);
      const L = "ABCDEF".slice(0, G.n).split(""), E = G.e.split(" "), adj = L.map(a => L.map(b => E.some(e => e === a + b || e === b + a) ? 1 : 0)), deg = adj.map(row => row.reduce((s, x) => s + x, 0));
      const P = adj.map((row, i) => row.map(x => x / deg[i])), s = ri(r, 0, G.n - 1); let t = ri(r, 0, G.n - 1); if (t === s) t = (t + 1) % G.n; const n = ri(r, 2, 4);
      let p = L.map((_, i) => (i === s ? 1 : 0)); for (let i = 0; i < n; i++) p = step(p, P); const st = stat(P);
      const pos = L.map((_, i) => { const a = -Math.PI / 2 + 2 * Math.PI * i / G.n; return [110 + 80 * Math.cos(a), 100 + 80 * Math.sin(a)]; });
      const svg = `<svg viewBox="0 0 220 200" style="max-width:240px;display:block;margin:8px 0">${E.map(e => { const [a, b] = [L.indexOf(e[0]), L.indexOf(e[1])]; return `<line x1="${pos[a][0]}" y1="${pos[a][1]}" x2="${pos[b][0]}" y2="${pos[b][1]}" stroke="currentColor" stroke-opacity=".45" stroke-width="2"/>`; }).join("")}${L.map((l, i) => `<circle cx="${pos[i][0]}" cy="${pos[i][1]}" r="15" fill="var(--card, #fff)" stroke="currentColor" stroke-width="2"/><text x="${pos[i][0]}" y="${pos[i][1] + 5}" text-anchor="middle" font-size="14" font-weight="600" fill="currentColor">${l}</text>`).join("")}</svg>`;
      return { title: "Roboter fährt zufällig durch Räume", topic: "mt-mvert",
        html: `Ein Überwachungsroboter fährt durch die Räume ${L.join(", ")}. Türen gibt es zwischen ${E.map(e => e[0] + "–" + e[1]).join(", ")}.${svg}In jedem Raum wählt er zufällig und gleich wahrscheinlich eine der Türen (auch die, durch die er gekommen ist). (i) Stellen Sie Übergangsgraph und Übergangsmatrix auf. (ii) Er startet in Raum ${L[s]}: Mit welcher Wahrscheinlichkeit ist er nach ${n} Raumwechseln in Raum ${L[t]}? (iii) Wie groß ist diese Wahrscheinlichkeit auf lange Sicht?`,
        answers: [A(`P(${L[t]}) nach ${n} Schritten`, p[t], { tol: 0.002 }), A(`P(${L[t]}) langfristig`, st[t], { tol: 0.002 })],
        steps: `<ol><li>Zustände = Räume ${L.join(", ")} in dieser Reihenfolge, Zeile = von, Spalte = nach.</li><li>Ein Raum mit k Türen bekommt in seiner Zeile k-mal 1/k.</li><li>p(${n}) = (Pᵀ)<sup>${n}</sup>·p(0) mit p(0) = Einheitsvektor für ${L[s]}.</li><li>Langfristig: (E − Pᵀ)·p = 0 mit Σp = 1. Bei Zufallswegen gilt p = Türanzahl / Summe aller Türanzahlen.</li></ol>`,
        code: ["with(LinearAlgebra):", `P := Matrix([${P.map(row => "[" + row.map(mstr).join(", ") + "]").join(", ")}]);`, `p0 := Vector([${L.map((_, i) => (i === s ? 1 : 0)).join(", ")}]):`, `pn := MatrixPower(Transpose(P), ${n}) . p0;`, `v := NullSpace(IdentityMatrix(${G.n}) - Transpose(P))[1]:`, `ps := v / add(v[i], i = 1..${G.n});`],
        chk: [`pn[${t + 1}]`, `ps[${t + 1}]`], result: `Nach ${n} Schritten ${nice(p[t])}, langfristig ${nice(st[t])} (${deg[t]} von ${deg.reduce((a, b) => a + b, 0)} Türenden).` };
    }
    if (v === 1) { // Marktanteile
      const N = ["A", "B", "C"], P = N.map((_, i) => { const d = pick(r, [12, 14, 16, 17, 18]), rest = 20 - d, o = ri(r, 0, rest), row = [0, 0, 0]; row[i] = d; row[(i + 1) % 3] = o; row[(i + 2) % 3] = rest - o; return row.map(x => x / 20); });
      const p0 = pick(r, [[0.5, 0.3, 0.2], [0.4, 0.4, 0.2], [0.6, 0.25, 0.15], [1 / 3, 1 / 3, 1 / 3]]), p2 = step(step(p0, P), P), st = stat(P), w = ri(r, 0, 2);
      return { title: "Marktanteile dreier Anbieter", topic: "mt-ergod",
        html: `Drei Mobilfunkanbieter A, B, C. Pro Jahr wechseln Kundinnen und Kunden so (Zeile = von, Spalte = nach):${matH([["", ...N], ...P.map((row, i) => [N[i], ...row.map(x => fmt(x))])])}Aktuelle Marktanteile: A ${fmt(p0[0], 3)}, B ${fmt(p0[1], 3)}, C ${fmt(p0[2], 3)}. (i) Wie groß ist der Marktanteil von ${N[w]} in 2 Jahren? (ii) Welche Marktanteile stellen sich langfristig ein? Geben Sie die von ${N[w]} und ${N[(w + 1) % 3]} an.`,
        answers: [A(`${N[w]} in 2 Jahren`, p2[w], { tol: 0.002 }), A(`${N[w]} langfristig`, st[w], { tol: 0.002 }), A(`${N[(w + 1) % 3]} langfristig`, st[(w + 1) % 3], { tol: 0.002 })],
        steps: `<ol><li>Spaltenvektor p(0) = (${p0.map(x => fmt(x, 3)).join(", ")}).</li><li>p(2) = (Pᵀ)²·p(0).</li><li>Stabile Verteilung: (E − Pᵀ)·p = 0, normiert auf Σp = 1 (NullSpace oder LinearSolve).</li><li>Die Kette ist ergodisch (alle Einträge > 0 ab P¹ oder P²), der Startwert spielt langfristig keine Rolle.</li></ol>`,
        code: ["with(LinearAlgebra):", `P := Matrix([${P.map(row => "[" + row.map(mstr).join(", ") + "]").join(", ")}]):`, `p0 := Vector([${p0.map(mstr).join(", ")}]):`, "p2 := evalf(MatrixPower(Transpose(P), 2) . p0);", "v := NullSpace(IdentityMatrix(3) - Transpose(P))[1]:", "ps := v / add(v[i], i = 1..3);  evalf(ps);"],
        chk: [`p2[${w + 1}]`, `ps[${w + 1}]`, `ps[${(w + 1) % 3 + 1}]`], result: `In 2 Jahren ${N[w]} ≈ ${fmt(p2[w])}. Langfristig (${st.map(nice).join(" · ")}).` };
    }
    if (v === 2) { // Prüfungsantritte (absorbierende Kette)
      const ps = [pick(r, [0.5, 0.6, 0.7, 0.8]), pick(r, [0.4, 0.5, 0.6, 0.7]), pick(r, [0.3, 0.4, 0.5, 0.6])], q = ps.map(x => 1 - x);
      const pass = 1 - q[0] * q[1] * q[2], Ez = 1 + q[0] + q[0] * q[1];
      return { title: "Drei Prüfungsantritte", topic: "mt-absorb",
        html: `Für eine Prüfung gibt es höchstens drei Antritte. Beim 1. Antritt besteht man mit ${fmt(ps[0])}, beim 2. mit ${fmt(ps[1])} und beim 3. mit ${fmt(ps[2])}. Modellieren Sie das als absorbierende Markovkette (Zustände: 1., 2., 3. Antritt, bestanden, endgültig nicht bestanden). (i) Mit welcher Wahrscheinlichkeit besteht man insgesamt? (ii) Wie viele Antritte braucht man im Mittel?`,
        answers: [A("P(bestanden)", pass, { tol: 0.002 }), A("mittlere Anzahl Antritte", Ez, { tol: 0.005 })],
        steps: `<ol><li>Transiente Zustände 1., 2., 3. Antritt (Matrix Q), absorbierende bestanden / endgültig negativ (Matrix R).</li><li>Fundamentalmatrix N = (E − Q)⁻¹.</li><li>W = N·R: erste Zeile, erste Spalte = Wahrscheinlichkeit, ab dem 1. Antritt zu bestehen.</li><li>Z = N·(1, 1, 1)ᵀ: erwartete Anzahl Antritte bis zur Absorption.</li></ol>`,
        code: ["with(LinearAlgebra):", `Q := Matrix([[0, ${mstr(q[0])}, 0], [0, 0, ${mstr(q[1])}], [0, 0, 0]]):`, `R := Matrix([[${mstr(ps[0])}, 0], [${mstr(ps[1])}, 0], [${mstr(ps[2])}, ${mstr(q[2])}]]):`, "N := MatrixInverse(IdentityMatrix(3) - Q);", "W := N . R;", "Z := N . Vector([1, 1, 1]);", "evalf(W[1, 1]);  evalf(Z[1]);"],
        chk: ["W[1, 1]", "Z[1]"], result: `P(bestanden) = 1 − ${q.map(x => fmt(x)).join("·")} = ${fmt(pass)}, im Mittel ${fmt(Ez)} Antritte.` };
    }
    // PageRank für 4 Seiten (wie SS 2012)
    let L, P, st;
    for (;;) { L = [0, 1, 2, 3].map(i => { const o = [0, 1, 2, 3].filter(j => j !== i).filter(() => r() < 0.55); return o.length ? o : [(i + 1) % 4]; });
      P = L.map(o => [0, 1, 2, 3].map(j => (o.includes(j) ? 1 / o.length : 0)));
      let M = P; for (let k = 0; k < 7; k++) M = M.map(row => step(row, P)); // P^8: alle Einträge > 0 → ergodisch
      if (M.every(row => row.every(x => x > 1e-9))) { st = stat(P); break; } }
    const w = ri(r, 0, 3), w2 = (w + 1 + ri(r, 0, 2)) % 4;
    return { title: "PageRank für vier Seiten", topic: "mt-ergod",
      html: `Ein Surfer klickt auf jeder Seite zufällig einen der Links an. Links: ${L.map((o, i) => `S${i + 1} → ${o.map(j => "S" + (j + 1)).join(", ")}`).join(" · ")}. Stellen Sie die Übergangsmatrix auf und bestimmen Sie die Wahrscheinlichkeit für den durchschnittlichen Besuch jeder Seite (PageRank). Geben Sie den Wert für S${w + 1} und S${w2 + 1} an.`,
      answers: [A(`PageRank S${w + 1}`, st[w], { tol: 0.002 }), A(`PageRank S${w2 + 1}`, st[w2], { tol: 0.002 })],
      steps: `<ol><li>Zeile i: 1/(Anzahl Links von S<sub>i</sub>) bei jeder verlinkten Seite.</li><li>Stabile Verteilung p = Pᵀ·p ⇔ (E − Pᵀ)·p = 0.</li><li>NullSpace liefert eine Lösung bis auf einen Faktor → durch die Summe teilen.</li><li>Kontrolle: (Pᵀ)⁵⁰·p(0) ergibt für jeden Start dasselbe.</li></ol>`,
      code: ["with(LinearAlgebra):", `P := Matrix([${P.map(row => "[" + row.map(mstr).join(", ") + "]").join(", ")}]);`, "v := NullSpace(IdentityMatrix(4) - Transpose(P))[1]:", "pr := v / add(v[i], i = 1..4);", "evalf(pr);"],
      chk: [`pr[${w + 1}]`, `pr[${w2 + 1}]`], result: `PageRank (${st.map(nice).join(" · ")}).` };
  }
};
const gen = (fam, seed) => { const f = FAM.find(x => x.id === fam), t = GEN[fam](rng(seed)); return Object.assign({ fam, seed, pts: f.pts, topic: f.topic, famName: f.name }, t, { topic: t.topic || f.topic }); };
window.MX = { gen, FAM, rng };

/* ================= Seite ================= */
if (!window.App || !App.PAGES) return;
const { $, esc, PAGES, CBY, TOPICS } = App, S = () => App.S();
const examPage = PAGES.exam;
PAGES.exam = (el, p) => { const c = CBY[S().course]; if (c && c.exam === "maple") return mapleExam(el, c); return examPage(el, p); };

const GRADES = [[14, "1 · Sehr gut"], [12, "2 · Gut"], [10, "3 · Befriedigend"], [8, "4 · Genügend"], [0, "5 · Nicht genügend"]];
const grade = (pts, max) => { const g = pts * 16 / max; return GRADES.find(([t]) => g >= t)[1]; };
const parse = s => { s = String(s || "").trim().replace(/(\d),(\d)/g, "$1.$2").replace(/−/g, "-"); if (!s) return null; const n = Number(s); if (isFinite(n)) return n;
  if (window.MPL && /^[0-9+\-*/^().\sA-Za-z]+$/.test(s)) { try { const r = new MPL.Session().run(`evalf(${s});`), v = r[r.length - 1]; if (v && !v.err) { const x = MPL.numOf(MPL.unwrap(v.v)); if (isFinite(x)) return x; } } catch (e) {} } return NaN; };
const scoreTask = (t, vals) => { const per = t.pts / t.answers.length; return t.answers.map((a, i) => { const u = parse(vals[i]); const ok = u != null && !isNaN(u) && Math.abs(u - a.v) <= a.tol; return { u, ok, pts: ok ? per : 0 }; }); };
const fmtP = n => (Math.round(n * 100) / 100).toString().replace(".", ",");
const newSeed = () => (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;

function taskHTML(t, i, mode) {
  return `<article class="card mxe-task" data-ti="${i}">
    <div class="spread"><span class="eyebrow">Aufgabe ${i + 1} · ${t.pts} Punkte · ${esc(t.famName)}</span><small class="muted">Variante ${t.seed % 100000}</small></div>
    <h3>${esc(t.title)}</h3><div class="body">${t.html}</div>
    <div class="mxe-ans">${t.answers.map((a, j) => `<label class="fld"><span>${a.label}</span><input data-a="${i}|${j}" inputmode="decimal" autocomplete="off" placeholder="z. B. 3.14"></label>`).join("")}</div>
    <details class="mxe-lab" ${mode === "single" ? "open" : ""}><summary>Maple-Arbeitsblatt für diese Aufgabe</summary><div class="mw-sheet mxe-sheet" data-page="1">${MPL.groupHTML("")}</div><small class="muted">Enter führt aus, Shift+Enter macht eine neue Zeile. Variablen gelten nur in diesem Arbeitsblatt.</small></details>
    <div class="mxe-res"></div></article>`;
}
function resultHTML(t, sc) {
  const got = sc.reduce((s, x) => s + x.pts, 0);
  return `<div class="mxe-score ${got >= t.pts - 1e-9 ? "ok" : got > 0 ? "part" : "bad"}"><b>${fmtP(got)} / ${t.pts} Punkte</b></div>
    <table class="tbl mxe-tbl"><tr><th></th><th>deine Antwort</th><th>richtig</th><th></th></tr>${t.answers.map((a, j) => `<tr><td>${a.label}</td><td>${sc[j].u == null ? "—" : isNaN(sc[j].u) ? "nicht lesbar" : fmt(sc[j].u, 6)}</td><td>${nice(a.v)}</td><td>${sc[j].ok ? "✓" : "✗"}</td></tr>`).join("")}</table>
    <details ${got < t.pts ? "open" : ""}><summary>Lösungsweg und Maple-Code</summary><div class="body">${t.steps}</div>${MPL.blockHTML({ t: "maple", title: "Musterlösung in Maple", code: t.code })}<div class="callout" style="margin-top:10px"><b>Ergebnis:</b> ${t.result}</div></details>`;
}
function mountSheets(root) { root.querySelectorAll(".mxe-sheet").forEach(sh => { if (sh._onNew) return; sh._sess = new MPL.Session(); sh._onNew = () => { const d = document.createElement("div"); d.innerHTML = MPL.groupHTML(""); const g = d.firstElementChild; sh.appendChild(g); g.querySelector(".mw-code").focus(); }; }); }
const vals = (root, i, n) => Array.from({ length: n }, (_, j) => { const inp = root.querySelector(`[data-a="${i}|${j}"]`); return inp ? inp.value : ""; });

function mapleExam(el, c) {
  const st = S().mexam || (S().mexam = { min: 90 }), hist = S().exams.filter(x => x.course === c.id && x.kind === "maple").slice(-6).reverse();
  el.innerHTML = `<div class="page"><header><span class="eyebrow">${esc(c.title)}</span><h1>Prüfung üben</h1><p class="muted" style="margin-top:6px;max-width:70ch">Aufgaben im Stil der Altprüfungen SS 2012 und SS 2016, aber jedes Mal mit neuen Zahlen. Rechne wie in der echten Prüfung mit Maple (das Arbeitsblatt steckt direkt in jeder Aufgabe) und trag die Ergebnisse ein. Bewertet wird automatisch, danach siehst du den Lösungsweg und den Maple-Code.</p></header>
    <div class="grid g2">
      <section class="card col"><h3>Prüfungssimulation</h3><p>5 Aufgaben wie in der Prüfung: Computergrafik, Integral, Interpolation/Ausgleich, Extremwert (je 3 P.) und eine Markovkette (4 P.). Zusammen 16 Punkte, Notenschlüssel der Altprüfungen.</p>
        <label class="fld">Zeit<select id="mx-min">${[[60, "60 Minuten"], [90, "90 Minuten"], [120, "120 Minuten"], [0, "ohne Zeitlimit"]].map(([v, s]) => `<option value="${v}" ${st.min === v ? "selected" : ""}>${s}</option>`).join("")}</select></label>
        <div class="row"><button class="btn pri" id="mx-go">Simulation starten</button></div></section>
      <section class="card col"><h3>Einzeltraining</h3><p>Eine Aufgabe aus einem Gebiet, sofort auswerten, beliebig oft mit neuen Zahlen.</p>
        <div class="row" style="flex-wrap:wrap;gap:6px">${FAM.map(f => `<button class="btn sm" data-fam="${f.id}">${esc(f.name)}</button>`).join("")}</div>
        <div class="row" style="gap:6px;margin-top:6px"><button class="btn sm ghost" data-go="prep" data-p="${c.id}">Altprüfungen mit Lösungen</button><button class="btn sm ghost" data-go="maple">Maple-Labor</button></div></section>
    </div>
    <section class="card col"><h3>Letzte Simulationen</h3>${hist.length ? hist.map(x => `<div class="spread"><span class="tab">${fmtP(x.total)} / ${x.max} P. · ${grade(x.total, x.max)}</span><small>${new Date(x.ts).toLocaleDateString("de-AT")}</small></div>`).join(`<div class="divider"></div>`) : `<p class="muted">Noch keine.</p>`}</section></div>`;
  $("#mx-min", el).onchange = e => { st.min = +e.target.value; App.save(); };
  el.onclick = e => { const f = e.target.closest("[data-fam]"); if (f) { el.onclick = null; single(el, c, f.dataset.fam); return; } if (e.target.closest("#mx-go")) { el.onclick = null; sim(el, c, st.min); } };
}

function single(el, c, fam, seed) {
  const t = gen(fam, seed || newSeed());
  el.innerHTML = `<div class="page"><div class="spread"><div><span class="eyebrow">Einzeltraining · ${esc(c.title)}</span><h1>${esc(t.famName)}</h1></div><div class="row"><button class="btn ghost" id="mx-back">Zurück</button></div></div>
    <div id="mx-t">${taskHTML(t, 0, "single")}</div><div class="row"><button class="btn pri" id="mx-chk">Auswerten</button><button class="btn" id="mx-new">Neue Aufgabe</button></div></div>`;
  mountSheets(el);
  $("#mx-back", el).onclick = () => mapleExam(el, c);
  $("#mx-new", el).onclick = () => single(el, c, fam);
  $("#mx-chk", el).onclick = () => { const sc = scoreTask(t, vals(el, 0, t.answers.length)), got = sc.reduce((s, x) => s + x.pts, 0);
    el.querySelector(".mxe-res").innerHTML = resultHTML(t, sc); App.rec(t.topic, got / t.pts); if (got === t.pts) App.addXP(10, "exam"); App.save(); };
}

function sim(el, c, minutes) {
  const base = newSeed(), tasks = FAM.map((f, i) => gen(f.id, (base + i * 7919) >>> 0)), max = 16, tEnd = minutes ? Date.now() + minutes * 60000 : 0; let tmr, done = false;
  el.innerHTML = `<div class="page"><div class="spread"><div><span class="eyebrow">Prüfungssimulation · ${esc(c.title)}</span><h1>5 Aufgaben · 16 Punkte</h1></div><div class="row">${minutes ? `<span class="chip warn tab" id="mx-clk"></span>` : ""}<button class="btn pri" id="mx-sub">Abgeben</button></div></div>
    <div class="col" style="gap:16px">${tasks.map((t, i) => taskHTML(t, i, "sim")).join("")}</div>
    <div class="row"><button class="btn pri" id="mx-sub2">Abgeben</button></div></div>`;
  mountSheets(el);
  const submit = () => {
    if (done) return; done = true; clearInterval(tmr);
    let total = 0; const weak = [];
    tasks.forEach((t, i) => { const sc = scoreTask(t, vals(el, i, t.answers.length)), got = sc.reduce((s, x) => s + x.pts, 0); total += got; App.rec(t.topic, got / t.pts); if (got < t.pts) weak.push(t.topic);
      const card = el.querySelector(`[data-ti="${i}"]`); card.querySelectorAll("input[data-a]").forEach(x => x.disabled = true); card.querySelector(".mxe-res").innerHTML = resultHTML(t, sc); });
    total = Math.round(total * 100) / 100;
    S().exams.push({ ts: Date.now(), course: c.id, kind: "maple", total, max, weak }); App.addXP(20 + Math.round(total / max * 30), "exam"); App.save();
    const head = el.querySelector(".page > .spread"); head.innerHTML = `<div><span class="eyebrow">Ergebnis · ${esc(c.title)}</span><h1>${fmtP(total)} / ${max} Punkte · ${grade(total, max)}</h1><small class="muted">Notenschlüssel: unter 8 Nicht genügend · 8–10 Genügend · 10–12 Befriedigend · 12–14 Gut · 14–16 Sehr gut</small></div><div class="row"><button class="btn" id="mx-again">Neue Simulation</button><button class="btn ghost" id="mx-home">Übersicht</button></div>`;
    el.querySelector("#mx-sub2").parentElement.remove();
    $("#mx-again", el).onclick = () => sim(el, c, minutes); $("#mx-home", el).onclick = () => mapleExam(el, c);
    window.scrollTo(0, 0);
  };
  $("#mx-sub", el).onclick = () => { if (confirm("Prüfung jetzt abgeben?")) submit(); }; $("#mx-sub2", el).onclick = () => { if (confirm("Prüfung jetzt abgeben?")) submit(); };
  if (minutes) { const clk = $("#mx-clk", el), tick = () => { const s = Math.max(0, Math.round((tEnd - Date.now()) / 1000)); if (clk.isConnected) clk.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; if (!s) submit(); }; tick(); tmr = setInterval(tick, 1000); App.cleanup = (old => () => { clearInterval(tmr); old && old(); })(App.cleanup); }
}
})();
