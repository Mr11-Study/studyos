/* MATH-2 · Prüfungsvorbereitung (c.examPrep): Format, Schwerpunkte, Checkliste und alle 10 Aufgaben der Altprüfungen SS 2012 und SS 2016
   mit vollständigem Lösungsweg und ausführbarem Maple-Code. Die Lösung wird erst beim Anzeigen gebaut (Maple-Labor lädt nach den Kursdateien). */
(function () {
const EXT = (window.STUDYOS_EXT = window.STUDYOS_EXT || {}), list = EXT.math2 || (EXT.math2 = []);
const M2 = window.M2 || {}, mx = M2.mx || (s => `<div class="mx">${s}</div>`), mat = M2.mat || (r => r.join(";"));
const mp = (code, title) => window.MPL && MPL.blockHTML ? MPL.blockHTML({ t: "maple", title: title || "Lösung in Maple", code }) : `<pre>${code.join("\n")}</pre>`;
/* t: { id, topic, title, pts, html, steps (Lösungsweg-HTML), code (Maple), result (Ergebnis-HTML) } → solution als Getter */
const task = t => { const o = { id: t.id, topic: t.topic, title: t.title, pts: t.pts, html: t.html, code: t.code };
  Object.defineProperty(o, "solution", { enumerable: true, get: () => `${t.steps}${mp(t.code)}<div class="callout" style="margin-top:10px"><b>Ergebnis:</b> ${t.result}</div>` }); return o; };

const tasks = [
  task({ id: "m2p-16-1", topic: "mt-komb", pts: 3, title: "SS 2016 · 1: Dreieck verschieben und um M drehen",
    html: "Gegeben ist ein Dreieck mit den Punkten A(0|0), B(4|0) und C(0|6) sowie ein Mittelpunkt M(3|3). Verschieben Sie zuerst das Dreieck so, dass der Punkt A zum Punkt M wird, und drehen Sie im Anschluss das Dreieck um 90 Grad im Uhrzeigersinn um den Punkt M. Wie sieht die dazugehörige Transformationsmatrix aus? Stellen Sie das Ausgangsdreieck und das Enddreieck gemeinsam grafisch dar.",
    steps: `<ol><li>Homogene Koordinaten (3×3), weil eine Verschiebung dabei ist. Verschiebung A → M: T(3, 3).</li><li>Drehung um M = zum Ursprung schieben, drehen, zurückschieben: T(3, 3)·R(−90°)·T(−3, −3). Im Uhrzeigersinn heißt <b>negativer</b> Winkel: R(−90°) = [[0, 1, 0], [−1, 0, 0], [0, 0, 1]].</li><li>Gesamtmatrix (von rechts nach links lesen!):${mx("G = T(3, 3) · R(−90°) · T(−3, −3) · T(3, 3)")}</li><li>Eckpunkte als Spalten [[x…], [y…], [1, 1, 1]] multiplizieren und beide Dreiecke mit polygonplot zeichnen.</li></ol>`,
    code: ["with(LinearAlgebra):  with(plots):", "T := (a, b) -> Matrix([[1, 0, a], [0, 1, b], [0, 0, 1]]):", "R := Matrix([[cos(-Pi/2), -sin(-Pi/2), 0], [sin(-Pi/2), cos(-Pi/2), 0], [0, 0, 1]]):", "G := T(3, 3) . R . T(-3, -3) . T(3, 3);", "Q := G . Matrix([[0, 4, 0], [0, 0, 6], [1, 1, 1]]);", "display(polygonplot([[0, 0], [4, 0], [0, 6]], color = blue), polygonplot([[3, 3], [3, -1], [9, 3]], color = red), scaling = constrained);"],
    result: `G = ${mat([[0, 1, 3], [-1, 0, 3], [0, 0, 1]])} Enddreieck A′(3|3), B′(3|−1), C′(9|3). Punkte: Matrix 2, Reihenfolge 0.5, Grafik 0.5.` }),
  task({ id: "m2p-16-2", topic: "mt-flae", pts: 3, title: "SS 2016 · 2: Fläche A4 zwischen vier Kreisen und ihr Umfang",
    html: "In einem Quadrat mit Seitenlänge 10 liegen 4 Viertelkreise mit Radius 10 um die Ecken; sie bilden 5 verschiedene Flächen A1 bis A5. Bestimmen Sie mit Hilfe der Integralrechnung den Wert der Fläche A4 (die Spitze zwischen dem unteren Rand und der Mitte). Wie groß ist der Umfang von A4?",
    steps: `<ol><li>Quadrat [0, 10]². Relevante Bögen als Funktionen: Kreis um (0|10) unten: g(x) = 10 − √(100 − x²); Kreis um (10|0) oben: h(x) = √(100 − (x − 10)²); Kreis um (10|10) unten: k(x) = 10 − √(100 − (x − 10)²).</li><li>Skizze mit plot, Schnittpunkt der Randkurven mit fsolve: x₁ = 10 − 5√3 ≈ 1.3397.</li><li>A4 = ∫₀<sup>x₁</sup>(h − g) dx + ∫<sub>x₁</sub><sup>5</sup>(k − g) dx (A4 liegt links von x = 5, die rechte Spitze gehört zu einer anderen Fläche).</li><li>Umfang: Bogenlänge ∫√(1 + f′²) dx für jedes Randstück, dann addieren.</li></ol>`,
    code: ["g := 10 - sqrt(100 - x^2):  h := sqrt(100 - (x - 10)^2):  k := 10 - sqrt(100 - (x - 10)^2):", "plot([g, h, k], x = 0..10, view = [0..10, 0..10], scaling = constrained, color = [red, blue, green]);", "x1 := fsolve(h = k, x = 0..5);", "A4 := int(h - g, x = 0..x1) + int(k - g, x = x1..5);", "U := int(sqrt(1 + diff(h, x)^2), x = 0..x1) + int(sqrt(1 + diff(k, x)^2), x = x1..5) + int(sqrt(1 + diff(g, x)^2), x = 0..5);"],
    result: "A4 = 25π/3 − 100 + 50√3 ≈ <b>12.78</b> FE, Umfang ≈ <b>15.71</b> = 5π (drei Bögen mit je 30°)." }),
  task({ id: "m2p-16-3", topic: "mt-ipol", pts: 3, title: "SS 2016 · 3: Cosinusbogen durch eine Parabel annähern",
    html: "Der Bogen der Funktion f(x) = cos(x) im Bereich [−π/2, π/2] kann durch eine Parabel p(x) approximiert werden, wenn man 3 Punkte wählt. Wählen Sie 3 Punkte am Cosinusbogen, berechnen Sie die Parabel und bestimmen Sie die größte Abweichung max |f(x) − p(x)| für x ∈ [−π/2, π/2].",
    steps: `<ol><li>Naheliegende Punkte: (−π/2 | 0), (0 | 1), (π/2 | 0).</li><li>Interpolationspolynom: PolynomialInterpolation, Ergebnis p(x) = 1 − 4x²/π².</li><li>Abweichung d(x) = cos(x) − p(x). Extremum: d′(x) = 0 mit fsolve (nicht bei 0 starten, dort ist d = 0).</li><li>Wert einsetzen und Betrag nehmen; Plot von |d| zur Kontrolle.</li></ol>`,
    code: ["with(CurveFitting):", "p := PolynomialInterpolation([[-Pi/2, 0], [0, 1], [Pi/2, 0]], x);", "d := cos(x) - p:", "x0 := fsolve(diff(d, x) = 0, x = 0.5..1.5);", "evalf(eval(d, x = x0));", "plot(abs(d), x = -Pi/2..Pi/2);"],
    result: "p(x) = 1 − 4x²/π² ≈ 1 − 0.4053x², größte Abweichung ≈ <b>0.056</b> bei x ≈ ±1.099. Andere sinnvolle Punktwahl ist auch richtig, dann andere Zahlen." }),
  task({ id: "m2p-16-4", topic: "mt-opt", pts: 3, title: "SS 2016 · 4: Größtes Rechteck im Dreieck",
    html: "Gegeben ist ein Dreieck mit den Punkten A(0|0), B(4|0) und C(0|6). Bestimmen Sie (mit Hilfe der Differentialrechnung) die Koordinaten des Punktes D so, dass das eingezeichnete Rechteck (eine Ecke in A, die gegenüberliegende Ecke D auf der Seite BC) die größte Fläche aufweist.",
    steps: `<ol><li>Gerade BC: y = 6 − 1.5x (durch (4|0) und (0|6)).</li><li>Zielfunktion F(x) = x·y = x(6 − 1.5x).</li><li>F′(x) = 6 − 3x = 0 → x = 2; F″ = −3 < 0 → Maximum.</li><li>y = 6 − 3 = 3, Fläche 6 (genau die Hälfte des Dreiecks).</li></ol>`,
    code: ["y := 6 - 3/2*x:  F := x*y;", "xs := solve(diff(F, x) = 0, x);", "[xs, eval(y, x = xs)];  eval(F, x = xs);", "eval(diff(F, x, x), x = xs);"],
    result: "<b>D(2 | 3)</b>, größte Fläche 6 FE." }),
  task({ id: "m2p-16-5", topic: "mt-mvert", pts: 4, title: "SS 2016 · 5: Roboter überwacht die Räume A bis F",
    html: "Ein selbstfahrender Roboter überwacht die Räume A bis F. In einem Raum entscheidet er zufällig mit gleicher Wahrscheinlichkeit, durch welche Tür er als Nächstes fährt (auch zurück in den Raum, aus dem er kam). Türen laut Skizze: A–B, A–C, A–D, B–C, B–D, C–E, C–F, D–E, D–F, E–F.<br>(i) Beschreiben Sie die zeitliche Entwicklung durch eine Markovkette, zeichnen Sie den Übergangsgraphen und geben Sie die Übergangsmatrix an (welche Spalte gehört zu welchem Zustand?).<br>(ii) Bestimmen Sie die Wahrscheinlichkeit, dass sich der Roboter im Raum F befindet, wenn er in Raum A gestartet ist.",
    steps: `<ol><li>Zustände = Räume A … F (Zeile = von, Spalte = nach). Jede Tür ist eine Kante in beide Richtungen.</li><li>Zeile eines Raums mit 3 Türen: dreimal 1/3, mit 4 Türen viermal 1/4. Jede Zeilensumme ist 1.</li><li>(ii) p(n) = (Pᵀ)ⁿ·p(0) mit p(0) = (1, 0, 0, 0, 0, 0): die Wahrscheinlichkeit hängt von n ab, darum eine Tabelle für n = 1, 2, … und den Grenzwert angeben.</li><li>Langfristig: stabile Verteilung aus (E − Pᵀ)·p = 0 und Σp = 1.</li></ol>`,
    code: ["with(LinearAlgebra):", "P := Matrix([[0, 1/3, 1/3, 1/3, 0, 0], [1/3, 0, 1/3, 1/3, 0, 0], [1/4, 1/4, 0, 0, 1/4, 1/4], [1/4, 1/4, 0, 0, 1/4, 1/4], [0, 0, 1/3, 1/3, 0, 1/3], [0, 0, 1/3, 1/3, 1/3, 0]]);", "p0 := Vector([1, 0, 0, 0, 0, 0]):", "seq(evalf((MatrixPower(Transpose(P), n) . p0)[6]), n = 1..8);", "v := NullSpace(IdentityMatrix(6) - Transpose(P))[1]:  v / add(v[i], i = 1..6);"],
    result: "Nach 1 Schritt 0, nach 2 Schritten 1/6, nach 5 Schritten 11/81 ≈ 0.136; langfristig <b>3/20 = 0.15</b> (F hat 3 von 20 Türenden)." }),
  task({ id: "m2p-12-1", topic: "mt-elem", pts: 3, title: "SS 2012 · 1: Projektion auf die Gerade y = 2x",
    html: "Gesucht ist eine 2×2-Transformationsmatrix, welche Punkte auf die Gerade y = 2x projiziert. Testen Sie Ihre Matrix mit dem Punkt A(5|3).",
    steps: `<ol><li>Richtungsvektor der Geraden u = (1, 2).</li><li>Orthogonale Projektion: Pr = u·uᵀ / (uᵀ·u) = 1/5·[[1, 2], [2, 4]].</li><li>Alternativ: auf die x-Achse drehen (D⁻¹), dort mit [[1, 0], [0, 0]] projizieren, zurückdrehen: D·Pₓ·D⁻¹ mit α = arctan 2.</li><li>Test: Pr·(5, 3) und prüfen, dass das Bild auf y = 2x liegt; Pr·Pr = Pr.</li></ol>`,
    code: ["with(LinearAlgebra):", "u := Vector([1, 2]):", "Pr := u . Transpose(u) / (Transpose(u) . u);", "Pr . Vector([5, 3]);", "Pr . Pr - Pr;"],
    result: `Pr = 1/5·${mat([[1, 2], [2, 4]])} A′ = (11/5 | 22/5) = <b>(2.2 | 4.4)</b>, liegt auf y = 2x.` }),
  task({ id: "m2p-12-2", topic: "mt-ergod", pts: 4, title: "SS 2012 · 2: PageRank für vier Seiten",
    html: `Ein Surfer klickt zufällig einen der Links der aktuellen Seite an. Übergangsmatrix (Zeile = von, Spalte = nach) für die Seiten S1 … S4:${mat([["", "S1", "S2", "S3", "S4"], ["S1", 0, "1/2", "1/2", 0], ["S2", 0, 0, "1/2", "1/2"], ["S3", "1/3", "1/3", 0, "1/3"], ["S4", 0, 0, 1, 0]])}Bestimmen Sie daraus die Wahrscheinlichkeit für den durchschnittlichen Besuch der einzelnen Seiten (= PageRank).`,
    steps: `<ol><li>Gesucht ist die stabile Verteilung p mit p = Pᵀ·p, also (E − Pᵀ)·p = 0.</li><li>Das homogene System hat unendlich viele Lösungen (NullSpace); mit Σp = 1 normieren.</li><li>Ergodisch, weil alle Seiten voneinander erreichbar sind: Kontrolle mit (Pᵀ)⁵⁰·p(0) für irgendeinen Start.</li></ol>`,
    code: ["with(LinearAlgebra):", "P := Matrix([[0, 1/2, 1/2, 0], [0, 0, 1/2, 1/2], [1/3, 1/3, 0, 1/3], [0, 0, 1, 0]]):", "v := NullSpace(IdentityMatrix(4) - Transpose(P))[1];", "pr := v / add(v[i], i = 1..4);", "evalf(pr);"],
    result: "p = (4, 6, 12, 7)/29 ≈ (0.138, 0.207, <b>0.414</b>, 0.241). S3 hat den höchsten PageRank." }),
  task({ id: "m2p-12-3", topic: "mt-rot", pts: 3, title: "SS 2012 · 3: Umfang und Drehkörper um die y-Achse",
    html: "Gegeben ist eine Fläche, die von x² + y² = 25, y = 4x und y = x²/4 begrenzt wird und den Punkt (2|2) enthält. Bestimmen Sie den Umfang dieser Fläche und das Volumen des Drehkörpers, der entsteht, wenn die Fläche um die y-Achse rotiert.",
    steps: `<ol><li>Skizze: Die Fläche liegt zwischen der Geraden (oben links), dem Kreisbogen (oben rechts) und der Parabel (unten).</li><li>Schnittpunkte: 4x = √(25 − x²) → x₁ = 5/√17 ≈ 1.213; x²/4 = √(25 − x²) → x₂ ≈ 3.680.</li><li>Umfang = Geradenstück (0 … x₁, Länge genau 5 = Radius) + Parabelbogen (0 … x₂) + Kreisbogen (x₁ … x₂).</li><li>Drehung um die y-Achse mit Zylinderschalen: V = 2π·∫ x·(oben − unten) dx, geteilt bei x₁.</li></ol>`,
    code: ["c := sqrt(25 - x^2):  l := 4*x:  p := x^2/4:", "plot([c, l, p], x = 0..5, view = [0..5, 0..6], scaling = constrained);", "x1 := solve(l = c, x);  x2 := fsolve(p = c, x = 0..5);", "L := int(sqrt(1 + diff(l, x)^2), x = 0..x1) + int(sqrt(1 + diff(p, x)^2), x = 0..x2) + int(sqrt(1 + diff(c, x)^2), x = x1..x2);", "V := 2*Pi*(int(x*(l - p), x = 0..x1) + int(x*(c - p), x = x1..x2));"],
    result: "Umfang ≈ <b>13.13</b> LE, Volumen ≈ <b>100.74</b> VE." }),
  task({ id: "m2p-12-4", topic: "mt-fit", pts: 3, title: "SS 2012 · 4: Bevölkerung Nigeria hochrechnen",
    html: `Bevölkerung Nigeria in Tausend:<table class="tbl"><tr><th>Jahr</th><td>1950</td><td>1960</td><td>1970</td><td>1980</td><td>1990</td></tr><tr><th>Tsd.</th><td>32935</td><td>42305</td><td>55070</td><td>72024</td><td>96154</td></tr></table>Schätzen Sie die Bevölkerung für 2000 und 2010 mit dem Modell y(x) = a + b·eˣ. Was ändert sich, wenn wir lineares Wachstum voraussetzen?`,
    steps: `<ol><li>x in Jahrzehnten ab 1950 (x = 0 … 4), sonst wird eˣ riesig und die Rechnung instabil.</li><li>LeastSquares mit curve = a + b·exp(x): minimiert die Summe der Fehlerquadrate.</li><li>2000 → x = 5, 2010 → x = 6 einsetzen.</li><li>Linear: curve = a + b·x, gleich einsetzen und vergleichen.</li></ol>`,
    code: ["with(CurveFitting):", "P := [[0, 32935], [1, 42305], [2, 55070], [3, 72024], [4, 96154]]:", "y1 := LeastSquares(P, x, curve = a + b*exp(x));", "evalf(eval(y1, x = 5));  evalf(eval(y1, x = 6));", "y2 := LeastSquares(P, x, curve = a + b*x);", "eval(y2, x = 5);  eval(y2, x = 6);", "plot([y1, y2, P], x = 0..6, style = [line, line, point], legend = [\"exponentiell\", \"linear\", \"Daten\"]);"],
    result: "Exponentiell: 2000 ≈ <b>201 215</b>, 2010 ≈ <b>476 169</b> Tsd. Linear: 2000 ≈ 106 545, 2010 ≈ 122 160 Tsd. Linear wächst um konstant ≈ 15 616 Tsd. pro Jahrzehnt und unterschätzt deutlich." }),
  task({ id: "m2p-12-5", topic: "mt-opt", pts: 3, title: "SS 2012 · 5: Kegelförmiger Behälter ohne Deckel",
    html: "Welche Ausmaße (Radius und Höhe) muss ein kegelförmiger Behälter ohne Deckel aufweisen, sodass bei einer vorgegebenen Oberfläche von 200 m² das Volumen extremal wird? Geben Sie dieses Volumen an. (Hinweis: V = r²πh/3 und O = rπ√(h² + r²).)",
    steps: `<ol><li>Nebenbedingung nach h auflösen: h = √(O²/(π²r²) − r²).</li><li>In V einsetzen: V(r) = r²π·h(r)/3, nur noch eine Variable.</li><li>V′(r) = 0 mit fsolve im sinnvollen Bereich 0 < r < √(O/π).</li><li>Achtung: Am Rand ist V = 0, es gibt also nur ein <b>Maximum</b>. In der Angabe stand „möglichst klein“; gemeint ist das Extremum, das ist das größte Volumen. Schreib das als Satz in die Abgabe.</li></ol>`,
    code: ["O := 200:  hh := sqrt(O^2/(Pi^2*r^2) - r^2):", "V := r^2*Pi*hh/3:", "r0 := fsolve(diff(V, r) = 0, r = 0.1..7);", "h0 := eval(hh, r = r0);  evalf(eval(V, r = r0));", "plot(V, r = 0..sqrt(O/Pi), labels = [\"r\", \"V\"]);"],
    result: "r ≈ <b>6.06 m</b>, h ≈ <b>8.57 m</b> (h = √2·r), V ≈ <b>330 m³</b>." })
];

list.push({ id: "m2-prep", course: { examPrep: {
  format: "Schriftliche Prüfung mit Maple, 5 Aufgaben mit zusammen 16 Punkten (meist 3 + 3 + 3 + 3 + 4). Jede Prüfung mischt die fünf Kapitel: eine Computergrafik-Aufgabe (Transformationsmatrix), eine Integral-Aufgabe (Fläche, Umfang oder Drehkörper), eine Interpolations- oder Ausgleichsaufgabe, eine Extremwertaufgabe mit Differenzialrechnung und eine Markovkette (meist 4 Punkte). Abgegeben wird das Maple-Worksheet mit Rechenweg und Antwortsätzen. Notenschlüssel: unter 8 Nicht genügend, 8–10 Genügend, 10–12 Befriedigend, 12–14 Gut, 14–16 Sehr gut.",
  sources: ["Altprüfung SS 2016 (Gruppe C)", "Altprüfung SS 2012", "Deine Maple-Tests und Übungen (Ordner MathematikUe)", "Skriptum Mathematik 2", "Foliensätze Integral, Mehrdim. Differenzialrechnung, Numerik, Computergrafik, Markovketten"],
  strategy: [
    "Jede Aufgabe mit einer Skizze beginnen (plot, polygonplot). Die Skizze zeigt, welche Kurve oben liegt und wo die Integrationsgrenzen sind.",
    "Schnittpunkte immer mit fsolve(…, x = a..b) im richtigen Bereich suchen, sonst findet Maple den falschen.",
    "Bei Transformationen: Matrizen von rechts nach links lesen, Uhrzeigersinn = negativer Winkel, homogene 3×3-Matrizen sobald verschoben wird.",
    "Markov: zuerst Zustände und ihre Reihenfolge festschreiben, dann Matrix (Zeile = von). Zeilensummen = 1 kontrollieren.",
    "Am Ende jeder Aufgabe ein Antwortsatz mit Einheit, gerundet auf 2–3 Nachkommastellen.",
    "Zeit: rund 15 Minuten pro Aufgabe. Erst die sicheren Aufgaben, die Markovkette (4 P.) nicht ans Ende schieben."
  ],
  focus: [
    { topic: "mt-komb", weight: 3, note: "In beiden Altprüfungen: Transformationsmatrix bauen, Punkte abbilden, zeichnen" },
    { topic: "mt-elem", weight: 2, note: "Projektion, Spiegelung, Streckung als 2×2-Matrix" },
    { topic: "mt-flae", weight: 3, note: "Fläche zwischen Kurven inkl. Kreisbögen, Schnittpunkte mit fsolve" },
    { topic: "mt-bogen", weight: 2, note: "„Wie groß ist der Umfang?“ kam in beiden Prüfungen" },
    { topic: "mt-rot", weight: 2, note: "Drehkörper um x- oder y-Achse" },
    { topic: "mt-ipol", weight: 2, note: "Polynom durch Punkte, Abweichung zur Funktion" },
    { topic: "mt-fit", weight: 2, note: "LeastSquares mit vorgegebener Modellfunktion, Prognose" },
    { topic: "mt-opt", weight: 3, note: "Extremwertaufgabe mit Nebenbedingung (Rechteck, Kegel)" },
    { topic: "mt-mvert", weight: 2, note: "p(n) = (Pᵀ)ⁿ·p(0), Wahrscheinlichkeit nach n Schritten" },
    { topic: "mt-ergod", weight: 3, note: "Stabile Verteilung, PageRank (4 Punkte)" },
    { topic: "mt-absorb", weight: 1, note: "Absorbierende Ketten: Folien-Beispiele Duell, Tennis" }
  ],
  checklist: [
    { id: "m2c1", topic: "mt-lina", text: "Ich kann in Maple Matrizen und Vektoren eingeben und mit . multiplizieren" },
    { id: "m2c2", topic: "mt-dreh", text: "Ich kenne die Drehmatrix und weiß, dass im Uhrzeigersinn der Winkel negativ ist" },
    { id: "m2c3", topic: "mt-homo", text: "Ich kann eine Verschiebung als 3×3-Matrix in homogenen Koordinaten schreiben" },
    { id: "m2c4", topic: "mt-komb", text: "Ich kann eine Drehung um einen beliebigen Punkt als T·R·T⁻¹ zusammensetzen" },
    { id: "m2c5", topic: "mt-elem", text: "Ich kann die Projektion und Spiegelung an einer Geraden y = kx aufstellen" },
    { id: "m2c6", topic: "mt-flae", text: "Ich kann eine Fläche zwischen mehreren Kurven in Teilintegrale zerlegen" },
    { id: "m2c7", topic: "mt-bogen", text: "Ich kenne die Bogenlängenformel ∫√(1 + f′²) dx und kann einen Umfang berechnen" },
    { id: "m2c8", topic: "mt-rot", text: "Ich kenne beide Drehkörperformeln (x-Achse: π∫f², y-Achse: 2π∫x·f)" },
    { id: "m2c9", topic: "mt-dopp", text: "Ich kann ein Doppelintegral und einen Schwerpunkt berechnen" },
    { id: "m2c10", topic: "mt-ipol", text: "Ich kann PolynomialInterpolation verwenden und die maximale Abweichung bestimmen" },
    { id: "m2c11", topic: "mt-spline", text: "Ich weiß, warum Polynome hohen Grades schwingen und wann man Splines nimmt" },
    { id: "m2c12", topic: "mt-fit", text: "Ich kann LeastSquares mit beliebiger Modellfunktion rechnen und damit prognostizieren" },
    { id: "m2c13", topic: "mt-part", text: "Ich kann partielle Ableitungen und die Tangentialebene berechnen" },
    { id: "m2c14", topic: "mt-extr", text: "Ich kann Extremwerte mit Gradient = 0 und Hesse-Matrix bestimmen und einordnen" },
    { id: "m2c15", topic: "mt-opt", text: "Ich kann eine Textaufgabe in Zielfunktion + Nebenbedingung übersetzen" },
    { id: "m2c16", topic: "mt-lagr", text: "Ich kann eine Extremwertaufgabe mit Lagrange-Multiplikator lösen" },
    { id: "m2c17", topic: "mt-mgraph", text: "Ich kann aus einem Text den Übergangsgraphen und die Matrix (Zeile = von) aufstellen" },
    { id: "m2c18", topic: "mt-mvert", text: "Ich kann die Verteilung nach n Schritten mit MatrixPower berechnen" },
    { id: "m2c19", topic: "mt-ergod", text: "Ich kann die stabile Verteilung mit NullSpace bzw. LinearSolve berechnen" },
    { id: "m2c20", topic: "mt-absorb", text: "Ich kann Z = N·1 und W = N·R für absorbierende Ketten berechnen" }
  ],
  tasks: tasks.concat(((window.M2_EIGENE && M2_EIGENE.tasks) || []).map(task)) } } });
})();
