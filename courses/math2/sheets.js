/* MATH-2 · Arbeitsblätter fürs Maple-Labor (c.mapleSheets).
   1) Je Lektion mit Maple-Blöcken ein Arbeitsblatt (automatisch aus den Kapiteldateien k1…k5 gebaut, damit Labor und Lektion gleich bleiben).
   2) Die beiden Altprüfungen komplett, Aufgabe für Aufgabe, und das volle Tennis-Modell mit 17 Zuständen.
   Gruppe: { text: "html" } = Erklärtext, { code: "maple" } = eine Eingabe (läuft beim Öffnen automatisch). */
(function () {
const EXT = (window.STUDYOS_EXT = window.STUDYOS_EXT || {}), list = EXT.math2 || (EXT.math2 = []);

/* ---------- 1) aus den Lektionen ---------- */
const fromLessons = [];
list.slice().sort((a, b) => ((a.world && a.world.n) || 0) - ((b.world && b.world.n) || 0)).forEach(ch => {
  const w = ch.world; if (!w) return;
  w.lessons.forEach(l => {
    const groups = [];
    l.blocks.forEach(b => { if (b.t !== "maple") return;
      groups.push({ text: `<b>${b.title || "Maple"}</b>${b.note ? `<br><small>${b.note}</small>` : ""}` });
      b.code.forEach(code => groups.push({ code })); });
    if (groups.length) fromLessons.push({ id: "ls-" + l.id, title: l.title, ch: `Kapitel ${w.n} · ${w.title}`, intro: `Alle Maple-Eingaben aus der Lektion „${l.title}“. Ändere Zahlen und drücke Enter, um zu sehen, was passiert.`, groups });
  });
});

/* ---------- 2) Altprüfungen ---------- */
const T = s => ({ text: s }), K = s => ({ code: s });
const ss16 = { id: "ex-ss16", title: "Altprüfung SS 2016 (komplett)", ch: "Altprüfungen", intro: "Mathematik 2, 07.10.2016, Gruppe C · 5 Aufgaben, 16 Punkte. Jede Aufgabe so, wie du sie in Maple abgeben würdest.", groups: [
  T("<b>Aufgabe 1 (3 P.)</b> Dreieck A(0|0), B(4|0), C(0|6). Erst so verschieben, dass A auf M(3|3) liegt, dann um 90° im Uhrzeigersinn um M drehen. Gesamtmatrix und Grafik."),
  K("with(LinearAlgebra):  with(plots):"),
  K("T := (a, b) -> Matrix([[1, 0, a], [0, 1, b], [0, 0, 1]]):"),
  K("R := Matrix([[cos(-Pi/2), -sin(-Pi/2), 0], [sin(-Pi/2), cos(-Pi/2), 0], [0, 0, 1]]);"),
  K("G := T(3, 3) . R . T(-3, -3) . T(3, 3);"),
  K("P := Matrix([[0, 4, 0], [0, 0, 6], [1, 1, 1]]):  Q := G . P;"),
  K("display(polygonplot([[0, 0], [4, 0], [0, 6]], color = blue), polygonplot([[Q[1, 1], Q[2, 1]], [Q[1, 2], Q[2, 2]], [Q[1, 3], Q[2, 3]]], color = red), scaling = constrained);"),
  T("Leserichtung von rechts: zuerst T(3, 3) (A → M), dann T(−3, −3), Drehung R um den Ursprung, T(3, 3) zurück. Ergebnis G = [[0, 1, 3], [−1, 0, 3], [0, 0, 1]]; das Enddreieck hat die Ecken (3|3), (3|−1), (9|3)."),
  T("<b>Aufgabe 2 (3 P.)</b> Quadrat [0, 10]², vier Viertelkreise mit Radius 10 um die Ecken. Fläche A4 (die Spitze unten in der Mitte) und ihr Umfang."),
  K("g := 10 - sqrt(100 - x^2):  h := sqrt(100 - (x - 10)^2):  k := 10 - sqrt(100 - (x - 10)^2):"),
  K("plot([g, h, k], x = 0..10, view = [0..10, 0..10], scaling = constrained, color = [red, blue, green]);"),
  K("x1 := fsolve(h = k, x = 0..5);"),
  K("A4 := int(h - g, x = 0..x1) + int(k - g, x = x1..5);"),
  K("U := int(sqrt(1 + diff(h, x)^2), x = 0..x1) + int(sqrt(1 + diff(k, x)^2), x = x1..5) + int(sqrt(1 + diff(g, x)^2), x = 0..5);"),
  T("Die Randkurven wechseln bei x1 (Schnitt der beiden rechten Kreise), darum wird das Integral dort geteilt. Ergebnis A4 = 25π/3 − 100 + 50√3 ≈ 12.78, Umfang ≈ 15.71 = 5π."),
  T("<b>Aufgabe 3 (3 P.)</b> Parabel durch 3 Punkte des Cosinusbogens auf [−π/2, π/2] und die größte Abweichung."),
  K("with(CurveFitting):"),
  K("p := PolynomialInterpolation([[-Pi/2, 0], [0, 1], [Pi/2, 0]], x);"),
  K("d := cos(x) - p:"),
  K("x0 := fsolve(diff(d, x) = 0, x = 0.5..1.5);"),
  K("evalf(eval(d, x = x0));"),
  K("plot([cos(x), p], x = -Pi/2..Pi/2, color = [blue, red], legend = [\"cos(x)\", \"p(x)\"]);"),
  T("Größte Abweichung ≈ 0.056 bei x ≈ ±1.099 (an den Rändern und in der Mitte ist sie 0, weil dort die Stützstellen liegen)."),
  T("<b>Aufgabe 4 (3 P.)</b> Dreieck A(0|0), B(4|0), C(0|6). Punkt D auf BC so, dass das Rechteck mit Ecke A und D die größte Fläche hat."),
  K("y := 6 - 3/2*x:  F := x*y;"),
  K("xs := solve(diff(F, x) = 0, x);"),
  K("D0 := [xs, eval(y, x = xs)];  eval(F, x = xs);"),
  K("eval(diff(F, x, x), x = xs);"),
  K("display(polygonplot([[0, 0], [4, 0], [0, 6]], color = blue), polygonplot([[0, 0], [2, 0], [2, 3], [0, 3]], color = red), scaling = constrained);"),
  T("D(2|3), Fläche 6. Die zweite Ableitung −3 < 0 bestätigt das Maximum."),
  T("<b>Aufgabe 5 (4 P.)</b> Roboter in den Räumen A–F, Türen A–B, A–C, A–D, B–C, B–D, C–E, C–F, D–E, D–F, E–F (laut Grundriss). Spalten/Zeilen = A, B, C, D, E, F."),
  K("with(LinearAlgebra):"),
  K("P := Matrix([[0, 1/3, 1/3, 1/3, 0, 0], [1/3, 0, 1/3, 1/3, 0, 0], [1/4, 1/4, 0, 0, 1/4, 1/4], [1/4, 1/4, 0, 0, 1/4, 1/4], [0, 0, 1/3, 1/3, 0, 1/3], [0, 0, 1/3, 1/3, 1/3, 0]]);"),
  K("p0 := Vector([1, 0, 0, 0, 0, 0]):"),
  K("seq(evalf((MatrixPower(Transpose(P), n) . p0)[6]), n = 1..8);"),
  K("v := NullSpace(IdentityMatrix(6) - Transpose(P))[1]:  v / add(v[i], i = 1..6);"),
  T("Nach 1 Schritt ist F unmöglich, nach 5 Schritten 11/81 ≈ 0.136, langfristig 3/20 = 0.15 (F hat 3 der 20 Türenden)."),
  T("<b>Notenschlüssel</b> 0–8 Nicht genügend · 8–10 Genügend · 10–12 Befriedigend · 12–14 Gut · 14–16 Sehr gut.")
] };

const ss12 = { id: "ex-ss12", title: "Altprüfung SS 2012 (komplett)", ch: "Altprüfungen", intro: "Mathematik 2, 05.11.2012 · 5 Aufgaben, 16 Punkte.", groups: [
  T("<b>Aufgabe 1 (3 P.)</b> 2×2-Matrix, die Punkte auf die Gerade y = 2x projiziert; Test mit A(5|3)."),
  K("with(LinearAlgebra):"),
  K("u := Vector([1, 2]):"),
  K("Pr := u . Transpose(u) / (Transpose(u) . u);"),
  K("Pr . Vector([5, 3]);"),
  K("Pr . Pr - Pr;"),
  T("Pr = 1/5·[[1, 2], [2, 4]], A wird zu (11/5 | 22/5) = (2.2 | 4.4). Pr·Pr = Pr: zweimal projizieren ändert nichts mehr."),
  T("<b>Aufgabe 2 (4 P.)</b> PageRank für vier Seiten S1 … S4 (Zeile = von, Spalte = nach)."),
  K("P := Matrix([[0, 1/2, 1/2, 0], [0, 0, 1/2, 1/2], [1/3, 1/3, 0, 1/3], [0, 0, 1, 0]]):"),
  K("v := NullSpace(IdentityMatrix(4) - Transpose(P))[1];"),
  K("pr := v / add(v[i], i = 1..4);"),
  K("evalf(pr);"),
  K("evalf(MatrixPower(Transpose(P), 50) . Vector([1/4, 1/4, 1/4, 1/4]));"),
  T("PageRank (4, 6, 12, 7)/29 ≈ (0.138, 0.207, 0.414, 0.241): S3 ist die wichtigste Seite."),
  T("<b>Aufgabe 3 (3 P.)</b> Fläche zwischen x² + y² = 25, y = 4x und y = x²/4, die (2|2) enthält: Umfang und Volumen bei Drehung um die y-Achse."),
  K("c := sqrt(25 - x^2):  l := 4*x:  p := x^2/4:"),
  K("plot([c, l, p], x = 0..5, view = [0..5, 0..6], scaling = constrained);"),
  K("x1 := solve(l = c, x);  x2 := fsolve(p = c, x = 0..5);"),
  K("L := int(sqrt(1 + diff(l, x)^2), x = 0..x1) + int(sqrt(1 + diff(p, x)^2), x = 0..x2) + int(sqrt(1 + diff(c, x)^2), x = x1..x2);"),
  K("V := 2*Pi*(int(x*(l - p), x = 0..x1) + int(x*(c - p), x = x1..x2));"),
  K("evalf(V);"),
  T("Umfang ≈ 13.13, Volumen ≈ 100.74 (Zylindermantel-Methode: V = 2π·∫ x·(oben − unten) dx)."),
  T("<b>Aufgabe 4 (3 P.)</b> Bevölkerung Nigeria (Tsd.) 1950–1990, Modell y = a + b·eˣ (x = Jahrzehnte ab 1950). Prognose 2000 und 2010, dann linear."),
  K("with(CurveFitting):"),
  K("P := [[0, 32935], [1, 42305], [2, 55070], [3, 72024], [4, 96154]]:"),
  K("y1 := LeastSquares(P, x, curve = a + b*exp(x));"),
  K("evalf(eval(y1, x = 5));  evalf(eval(y1, x = 6));"),
  K("y2 := LeastSquares(P, x, curve = a + b*x);"),
  K("eval(y2, x = 5);  eval(y2, x = 6);"),
  K("plot([y1, y2, P], x = 0..6, style = [line, line, point], legend = [\"exponentiell\", \"linear\", \"Daten\"]);"),
  T("Exponentiell: 2000 ≈ 201 215 Tsd., 2010 ≈ 476 169 Tsd. Linear: 2000 ≈ 106 545 Tsd. Das lineare Modell unterschätzt das Wachstum stark."),
  T("<b>Aufgabe 5 (3 P.)</b> Kegel ohne Deckel mit Mantelfläche O = 200 m². V = r²πh/3, O = rπ√(h² + r²). Hinweis: Mit fester Mantelfläche ist V am Rand 0, es gibt nur ein Maximum; gemeint ist das extreme (größte) Volumen."),
  K("O := 200:  hh := sqrt(O^2/(Pi^2*r^2) - r^2):"),
  K("V := r^2*Pi*hh/3:"),
  K("r0 := fsolve(diff(V, r) = 0, r = 0.1..7);"),
  K("h0 := eval(hh, r = r0);  evalf(eval(V, r = r0));"),
  K("plot(V, r = 0..sqrt(O/Pi), labels = [\"r\", \"V\"]);"),
  T("r ≈ 6.06 m, h ≈ 8.57 m (h = √2·r), V ≈ 330 m³.")
] };

/* ---------- Tennis: 15 Spielstände + 2 absorbierende Zustände ---------- */
const st = ["0:0", "15:0", "0:15", "30:0", "15:15", "0:30", "40:0", "30:15", "15:30", "0:40", "40:15", "15:40", "Einstand", "Vorteil T", "Vorteil N"];
const tennis = { id: "ex-tennis", title: "Tennis: das ganze Game (17 Zustände)", ch: "Markovketten", intro: `Aufschläger T gewinnt jeden Ballwechsel mit p. Transiente Zustände in dieser Reihenfolge: ${st.join(", ")}; absorbierend: Sieg T, Sieg N. 30:30 ist gleichwertig mit Einstand, 40:30 mit Vorteil T, 30:40 mit Vorteil N.`, groups: [
  K("with(LinearAlgebra):"),
  K("p := 0.55:  q := 1 - p:"),
  K("Q := Matrix([[0, p, q, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, p, q, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, p, q, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, p, q, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, p, q, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, p, q, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, q, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, p, 0, q, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, q, p, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, p, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, q, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, p], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, p, q], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, q, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, p, 0, 0]]):"),
  K("R := Matrix([[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [p, 0], [0, 0], [0, 0], [0, q], [p, 0], [0, q], [0, 0], [p, 0], [0, q]]):"),
  T("Fundamentalmatrix N = (E − Q)⁻¹. W = N·R: Absorptionswahrscheinlichkeiten. Z = N·1: erwartete Anzahl Ballwechsel bis zum Ende."),
  K("N := MatrixInverse(IdentityMatrix(15) - Q):"),
  K("W := N . R:"),
  K("W[1, 1];  W[13, 1];"),
  K("Z := N . Vector([seq(1, i = 1..15)]):"),
  K("Z[1];  Z[13];"),
  T("Ab 0:0 gewinnt der Aufschläger mit ≈ 62.3 %, ein Game dauert im Schnitt ≈ 6.68 Ballwechsel. Ab Einstand: p²/(p² + q²) ≈ 0.599. Setz p := 0.5 oder p := 0.6 und führe alles neu aus.")
] };

list.push({ id: "m2-sheets", course: { mapleSheets: fromLessons.concat([ss16, ss12, tennis], (window.M2_EIGENE && M2_EIGENE.sheets) || []) } });
})();
