/* MATH-2 · Kapitel 1: Mehrdimensionale Differenzialrechnung (Skriptum Kap. 1, Folien „Mehrdimensionale Differenzialrechnung“) */
(function () {
const EXT = window.STUDYOS_EXT = window.STUDYOS_EXT || {};
const { fr, mx, Q, C, F } = window.M2;

(EXT.math2 = EXT.math2 || []).push({
  id: "m2-k1",
  topics: {
    "mt-fn2":  { name: "Funktionen mit zwei Variablen", lesson: "m21-1" },
    "mt-part": { name: "Partielle Ableitungen & Tangentialebene", lesson: "m21-2" },
    "mt-extr": { name: "Lokale Extremwerte & Hesse-Kriterium", lesson: "m21-3" },
    "mt-opt":  { name: "Extremwertaufgaben (Brunnen, Rechteck, Kegel)", lesson: "m21-4" },
    "mt-lagr": { name: "Lagrange-Multiplikatoren", lesson: "m21-5" }
  },
  world: { id: "m2w1", n: 1, title: "Mehrdimensionale Differenzialrechnung", sub: "Flächen im Raum, partielle Ableitungen, Extremwerte, Lagrange",
    boss: { id: "boss-m2w1", title: "Kapiteltest: Mehrdimensionale Differenzialrechnung", topics: ["mt-fn2", "mt-part", "mt-extr", "mt-opt", "mt-lagr"] },
    lessons: [
  { id: "m21-1", title: "Funktionen mit zwei Variablen", topic: "mt-fn2", min: 12, xp: 0, blocks: [
    { t: "lead", html: "Bisher hatte eine Funktion <i>eine</i> Eingabe: f(x). In der Praxis hängt fast alles von mehreren Größen ab: das Volumen eines Quaders von a, b und c, der Gewinn von Preis und Menge, die Länge einer Wasserleitung von der x- <i>und</i> der y-Koordinate des Brunnens. Funktionen mit zwei Variablen kann man sich als <b>Landschaft</b> vorstellen." },
    { t: "text", h: "Eine Fläche über der xy-Ebene", levels: {
      simple: "Jeder Punkt (x, y) am Boden bekommt eine Höhe z = f(x, y). So entsteht eine Fläche wie ein Gebirge: Berggipfel, Täler und Sättel.",
      normal: `Eine Funktion f : ℝ² → ℝ ordnet jedem Punkt (x, y) der Ebene eine Zahl z = f(x, y) zu. Zeichnet man über jedem Punkt die Höhe z ein, entsteht eine <b>Fläche im Raum ℝ³</b>. Beispiele aus den Folien:${mx(`V(a, b, c) = a·b·c &nbsp;&nbsp;·&nbsp;&nbsp; V(r, h) = ${fr("r² π h", "3")} &nbsp;&nbsp;·&nbsp;&nbsp; A(a, c, h) = ${fr("(a + c)·h", "2")}`)}Das Beispiel, das durch das ganze Kapitel führt, ist${mx("f(x, y) = x² − y² − (x² + y²)²")}Seine Fläche hat <b>zwei Berggipfel</b> (lokale Maxima) und dazwischen einen <b>Sattel</b>. Wie man diese Punkte rechnerisch findet, ist das Ziel dieses Kapitels.` } },
    { t: "fig", id: "m2f-surf" },
    { t: "maple", title: "Fläche zeichnen mit plot3d", code: ["f := x^2 - y^2 - (x^2 + y^2)^2;", "plot3d(f, x = -1..1, y = -1..1);"], note: "Mit der Maus (oder dem Finger) kannst du den 3D-Plot drehen, genau wie in Maple. Ändere die Funktion und drücke Enter." },
    { t: "text", h: "Schnitte: aus der Fläche wird wieder eine normale Kurve", levels: {
      simple: "Hält man y fest (z. B. y = 0), bleibt nur noch x übrig. Man schneidet die Fläche wie ein Brot und sieht eine ganz normale Kurve.",
      normal: `Legt man einen Schnitt <b>parallel zur x-Achse</b> (y = y₀ fest), bleibt eine Funktion einer Variablen übrig:${mx("g₁(x) = f(x, y₀) = x² − y₀² − (x² + y₀²)²")}Für jeden Wert y₀ entsteht eine eigene Kurve (Skriptum, Abb. 1.2: Schnitte bei y = 0, 0.25, 0.5, 0.75, 1). Diese Kurven kann man mit dem bekannten Wissen aus Mathematik 1 untersuchen, und genau so entstehen die partiellen Ableitungen in der nächsten Lektion.` } },
    { t: "fig", id: "m2f-slices" },
    C("Was ist der Graph einer Funktion f(x, y)?", "Eine Fläche im dreidimensionalen Raum", ["Eine Kurve in der Ebene", "Ein einzelner Punkt", "Eine Gerade durch den Ursprung"], "Jedem Punkt (x, y) wird die Höhe z = f(x, y) zugeordnet, das ergibt eine Fläche im ℝ³."),
    C("Man hält bei f(x, y) = x² − y² − (x² + y²)² den Wert y = 0 fest. Welche Kurve bleibt übrig?", "x² − x⁴", ["−y² − y⁴", "x² − y²", "2x − 4x³"], "f(x, 0) = x² − 0 − (x²)² = x² − x⁴. (2x − 4x³ wäre schon die Ableitung davon.)"),
    { t: "keys", items: ["f : ℝ² → ℝ, z = f(x, y) ist eine Fläche im Raum", "Schnitt mit y = y₀ fest liefert eine Kurve g₁(x) = f(x, y₀)", "Maple: plot3d(f, x = a..b, y = c..d)"] }
  ] },
  { id: "m21-2", title: "Partielle Ableitungen und Tangentialebene", topic: "mt-part", min: 14, xp: 0, blocks: [
    { t: "lead", html: "Auf einer Fläche gibt es in jedem Punkt unendlich viele Steigungen, je nachdem, in welche Richtung man geht. Zwei Richtungen sind besonders wichtig: parallel zur x-Achse und parallel zur y-Achse." },
    { t: "text", h: "Ableiten nach einer Variablen, die andere festhalten", levels: {
      simple: "Partiell nach x ableiten heißt: y behandelst du wie eine Zahl (wie 3 oder 7) und leitest ganz normal nach x ab. Bei f_y genau umgekehrt.",
      normal: `Die <b>partielle Ableitung nach x</b> (Schreibweise f<sub>x</sub> oder ∂f/∂x) erhält man, indem man y als Konstante behandelt und nach x ableitet. Sie ist die Steigung der Fläche <b>in Richtung der x-Achse</b>. Analog ist f<sub>y</sub> die Steigung in Richtung der y-Achse.<br><br>Für f(x, y) = x² − y² − (x² + y²)² gilt (Kettenregel bei der Klammer):${mx("f<sub>x</sub> = 2x − 2(x² + y²)·2x = −2x(2x² + 2y² − 1)")}${mx("f<sub>y</sub> = −2y − 2(x² + y²)·2y = −2y(2x² + 2y² + 1)")}In Maple: <code>diff(f, x)</code> und <code>diff(f, y)</code>.` },
      alt: [{ label: "Bild im Kopf", html: "Du stehst auf einem Hang. f<sub>x</sub> sagt dir, wie steil es ist, wenn du genau nach Osten gehst, f<sub>y</sub>, wie steil es nach Norden ist. Beide zusammen beschreiben den Hang in deinem Punkt vollständig." }] },
    { t: "fig", id: "m2f-partial" },
    { t: "text", h: "Zweite partielle Ableitungen", levels: {
      simple: "Man kann f<sub>x</sub> nochmal nach x oder nach y ableiten. So entstehen f<sub>xx</sub>, f<sub>xy</sub>, f<sub>yx</sub> und f<sub>yy</sub>.",
      normal: `Leitet man f<sub>x</sub> und f<sub>y</sub> nochmals ab, erhält man vier <b>zweite partielle Ableitungen</b> f<sub>xx</sub>, f<sub>xy</sub>, f<sub>yx</sub>, f<sub>yy</sub>. Für „normale“ (zweimal stetig differenzierbare) Funktionen gilt <b>f<sub>xy</sub> = f<sub>yx</sub></b> (Satz von Schwarz). Im Beispiel:${mx("f<sub>xx</sub> = −12x² − 4y² + 2 &nbsp;·&nbsp; f<sub>xy</sub> = f<sub>yx</sub> = −8xy &nbsp;·&nbsp; f<sub>yy</sub> = −12y² − 4x² − 2")}Maple: <code>diff(f, x, x)</code> bzw. <code>diff(f, x$2)</code>, gemischt <code>diff(f, x, y)</code>.` } },
    { t: "maple", code: ["f := x^2 - y^2 - (x^2 + y^2)^2;", "fx := diff(f, x);  fy := diff(f, y);", "diff(f, x, x);  diff(f, x, y);  diff(f, y, y);"] },
    { t: "text", h: "Die Tangentialebene", levels: {
      simple: "So wie eine Kurve im Punkt eine Tangente hat, hat eine Fläche im Punkt eine Tangentialebene. Ihre Neigung bestimmen f<sub>x</sub> und f<sub>y</sub>.",
      normal: `Aus der Tangente wird im Zweidimensionalen eine <b>Tangentialebene</b>. Im Punkt (x₀, y₀) lautet sie (Skriptum, Formel 1.1):${mx("z = t(x, y) = f(x₀, y₀) + f<sub>x</sub>(x₀, y₀)·(x − x₀) + f<sub>y</sub>(x₀, y₀)·(y − y₀)")}Ist die Tangentialebene <b>waagrecht</b> (parallel zur xy-Ebene), sind beide Steigungen 0. Genau dort können Extremwerte liegen.` } },
    { t: "fig", id: "m2f-tplane" },
    { t: "example", label: "Beispiel", title: "Tangentialebene an f(x, y) = x²·y + y³ im Punkt (1 | 2)", html: `f(1, 2) = 2 + 8 = 10 · f<sub>x</sub> = 2xy → f<sub>x</sub>(1, 2) = 4 · f<sub>y</sub> = x² + 3y² → f<sub>y</sub>(1, 2) = 13${mx("t(x, y) = 10 + 4(x − 1) + 13(y − 2) = 4x + 13y − 20")}` },
    C("Wie bildet man f<sub>y</sub>?", "y ist die Variable, x wird wie eine Konstante behandelt", ["x und y werden beide abgeleitet und addiert", "Man setzt y = 0 und leitet nach x ab", "Man leitet zweimal nach x ab"], "Partiell nach y: nur y ist Variable, alle anderen Größen sind Konstanten."),
    C("f(x, y) = 3x²y − 5y. Was ist f<sub>x</sub>?", "6xy", ["3x² − 5", "6xy − 5", "6x"], "y ist konstant: (3y)·x² abgeleitet = 6xy, der Term −5y fällt weg."),
    C("f(x, y) = 3x²y − 5y. Was ist f<sub>y</sub>?", "3x² − 5", ["6xy", "3x²y − 5", "6x − 5"], "x ist konstant: 3x²·y → 3x², −5y → −5."),
    { t: "keys", items: ["f<sub>x</sub>: y fest, nach x ableiten = Steigung in x-Richtung", "f<sub>xy</sub> = f<sub>yx</sub> für glatte Funktionen", "Tangentialebene: z = f(x₀,y₀) + f<sub>x</sub>·(x − x₀) + f<sub>y</sub>·(y − y₀)", "Maple: diff(f, x), diff(f, x, y), diff(f, x$2)"] }
  ] },
  { id: "m21-3", title: "Lokale Extremwerte und Sattelpunkte", topic: "mt-extr", min: 16, xp: 0, blocks: [
    { t: "lead", html: "Gipfel, Täler und Sattel: Wo die Tangentialebene waagrecht ist, kann ein Extremwert liegen. Ob es wirklich einer ist, entscheiden die zweiten Ableitungen." },
    { t: "text", h: "Notwendige Bedingung (Satz 1.1)", levels: {
      simple: "An einem Gipfel oder im Tal ist es in jede Richtung flach. Darum müssen beide partiellen Ableitungen 0 sein.",
      normal: `Ist (x₀, y₀) ein lokales Extremum, dann gilt${mx("f<sub>x</sub>(x₀, y₀) = 0 &nbsp;und&nbsp; f<sub>y</sub>(x₀, y₀) = 0")}Man löst also das <b>Gleichungssystem</b> aus beiden partiellen Ableitungen. Die Lösungen heißen <b>stationäre Punkte</b> (Kandidaten). In Maple: <code>solve({diff(f,x)=0, diff(f,y)=0}, {x,y})</code>.` } },
    { t: "text", h: "Hinreichende Bedingung (Satz 1.2): das Hesse-Kriterium", levels: {
      simple: "Für jeden Kandidaten rechnest du H = f<sub>xx</sub>·f<sub>yy</sub> − f<sub>xy</sub>². Ist H negativ: Sattel. Ist H positiv: Extremum, und f<sub>xx</sub> sagt, ob Tal (positiv) oder Gipfel (negativ).",
      normal: `Mit den zweiten Ableitungen bildet man${mx("H<sub>f</sub>(x₀, y₀) = f<sub>xx</sub>·f<sub>yy</sub> − f<sub>xy</sub>·f<sub>yx</sub>")}(das ist die Determinante der Hesse-Matrix). Dann ist (x₀, y₀)<ul><li>ein <b>lokales Minimum</b>, wenn f<sub>xx</sub> &gt; 0 und H<sub>f</sub> &gt; 0,</li><li>ein <b>lokales Maximum</b>, wenn f<sub>xx</sub> &lt; 0 und H<sub>f</sub> &gt; 0,</li><li>ein <b>Sattelpunkt</b>, wenn H<sub>f</sub> &lt; 0.</li></ul>Bei H<sub>f</sub> = 0 kann man nichts entscheiden (wie im Eindimensionalen bei f″ = 0).` } },
    { t: "fig", id: "m2f-hesse" },
    { t: "example", label: "Beispiel 1.1 aus dem Skriptum", title: "Alle Extremwerte von f(x, y) = x² − y² − (x² + y²)²", html: `<ol><li>f<sub>y</sub> = −2y(2x² + 2y² + 1) = 0 geht nur mit <b>y = 0</b>, weil die Klammer immer positiv ist.</li><li>Mit y = 0: f<sub>x</sub> = −2x(2x² − 1) = 0 → x = 0 oder x = ±√0.5.</li><li>Kandidaten: P₁(0 | 0), P₂(√0.5 | 0), P₃(−√0.5 | 0).</li><li>H<sub>f</sub>(0, 0) = 2·(−2) − 0 = <b>−4 &lt; 0 → Sattelpunkt</b>.</li><li>H<sub>f</sub>(±√0.5, 0) = (−4)·(−4) − 0 = <b>16 &gt; 0</b> und f<sub>xx</sub> = −4 &lt; 0 → <b>lokale Maxima</b> mit f = 0.25.</li></ol><small>Achtung: Im Skriptum steht f<sub>xx</sub>(±√0.5, 0) = −6. Richtig ist −12·0.5 + 2 = −4; an der Entscheidung (Maximum) ändert das nichts.</small>` },
    { t: "maple", title: "Beispiel 1.1 in Maple", code: ["f := x^2 - y^2 - (x^2 + y^2)^2:", "solve({diff(f, x) = 0, diff(f, y) = 0}, {x, y});", "H := diff(f, x, x)*diff(f, y, y) - diff(f, x, y)^2;", "subs({x = 0, y = 0}, H);  subs({x = sqrt(0.5), y = 0}, H);  subs({x = sqrt(0.5), y = 0}, diff(f, x, x));"] },
    C("Bei einem stationären Punkt gilt f<sub>xx</sub> = 4, f<sub>yy</sub> = 1, f<sub>xy</sub> = 3. Was liegt vor?", "Ein Sattelpunkt", ["Ein lokales Minimum", "Ein lokales Maximum", "Keine Aussage möglich"], "H = 4·1 − 3² = −5 &lt; 0 → Sattelpunkt, egal welches Vorzeichen f<sub>xx</sub> hat."),
    C("Bei einem stationären Punkt gilt f<sub>xx</sub> = −2, f<sub>yy</sub> = −8, f<sub>xy</sub> = 1. Was liegt vor?", "Ein lokales Maximum", ["Ein lokales Minimum", "Ein Sattelpunkt", "Keine Aussage möglich"], "H = (−2)(−8) − 1 = 15 &gt; 0 und f<sub>xx</sub> &lt; 0 → Maximum."),
    C("Welche Bedingung ist für ein lokales Extremum <b>notwendig</b>?", "f<sub>x</sub> = 0 und f<sub>y</sub> = 0", ["H<sub>f</sub> &gt; 0", "f<sub>xx</sub> &lt; 0", "f(x, y) = 0"], "Notwendig ist die waagrechte Tangentialebene. H<sub>f</sub> und f<sub>xx</sub> gehören zur hinreichenden Bedingung."),
    { t: "keys", items: ["Kandidaten: f<sub>x</sub> = 0 und f<sub>y</sub> = 0 gleichzeitig lösen", "H = f<sub>xx</sub>·f<sub>yy</sub> − f<sub>xy</sub>²: H &lt; 0 Sattel, H &gt; 0 Extremum", "H &gt; 0 und f<sub>xx</sub> &gt; 0: Minimum; f<sub>xx</sub> &lt; 0: Maximum; H = 0: keine Aussage"] }
  ] },
  { id: "m21-4", title: "Extremwertaufgaben: Brunnen, Rechteck, Kegel", topic: "mt-opt", min: 18, xp: 0, blocks: [
    { t: "lead", html: "In der Prüfung steckt die Mathematik meist in einer Textaufgabe. Das Vorgehen ist immer gleich: Zielfunktion aufstellen, ableiten, null setzen, prüfen. Die drei typischen Aufgaben aus Folien und Altprüfungen schauen wir uns hier an." },
    { t: "text", h: "Rezept für jede Extremwertaufgabe", levels: {
      simple: "1. Skizze. 2. Was soll groß oder klein werden? Das ist die Zielfunktion. 3. Ableiten, null setzen, lösen. 4. Prüfen, ob es wirklich Max/Min ist, und die Frage beantworten.",
      normal: `<ol><li><b>Skizze</b> und Variablen benennen.</li><li><b>Zielfunktion</b> aufstellen (was soll maximal/minimal werden?).</li><li>Gibt es eine <b>Nebenbedingung</b>, eine Variable eliminieren (oder Lagrange, nächste Lektion).</li><li>Ableitungen null setzen, Gleichung(en) lösen (Maple: <code>solve</code>, <code>fsolve</code>, <code>Minimize</code>).</li><li><b>Prüfen</b> (zweite Ableitung, Hesse, Randwerte oder Sachlogik) und die gefragte Größe angeben.</li></ol>` } },
    { t: "text", h: "Der Brunnen für drei Gebäude (Folien)", levels: {
      simple: "Drei Häuser A(1|1), B(12|4), C(4|8) bekommen einen gemeinsamen Brunnen X(x|y). Die Summe der drei Leitungslängen soll möglichst klein sein.",
      normal: `Die Gesamtlänge der Leitungen von X(x | y) zu A(1 | 1), B(12 | 4) und C(4 | 8) ist${mx("l(x, y) = √((x−1)² + (y−1)²) + √((x−12)² + (y−4)²) + √((x−4)² + (y−8)²)")}Alle partiellen Ableitungen null setzen ist von Hand mühsam, in Maple ist es ein Befehl. Ergebnis: <b>X(4.88 | 5.42)</b>, Gesamtlänge ≈ <b>15.87</b>. Dieser Punkt heißt <b>Fermat-Punkt</b> des Dreiecks: Von dort sieht man je zwei Gebäude unter 120°.` } },
    { t: "fig", id: "m2f-fermat" },
    { t: "maple", title: "Brunnen-Aufgabe in Maple", code: ["l := sqrt((x-1)^2+(y-1)^2) + sqrt((x-12)^2+(y-4)^2) + sqrt((x-4)^2+(y-8)^2):", "fsolve({diff(l, x) = 0, diff(l, y) = 0}, {x = 0..12, y = 0..8});", "with(Optimization): Minimize(l);", "plot3d(l, x = 0..12, y = 0..9);"] },
    { t: "text", h: "Größtes Rechteck im Dreieck (Altprüfung 2016, Aufgabe 4)", levels: {
      simple: "Ein Rechteck steht mit einer Ecke in A(0|0), die gegenüberliegende Ecke D liegt auf der Seite BC. Wie groß darf es höchstens werden?",
      normal: `Dreieck A(0 | 0), B(4 | 0), C(0 | 6). Die Ecke D(x | y) des Rechtecks liegt auf der Strecke BC: <b>y = 6 − 1.5x</b>. Zielfunktion:${mx("A(x) = x·y = x·(6 − 1.5x) = 6x − 1.5x²")}A′(x) = 6 − 3x = 0 → <b>x = 2</b>, y = 3, also <b>D(2 | 3)</b> mit A = 6 (genau die Hälfte der Dreiecksfläche 12). A″ = −3 &lt; 0 → Maximum. Allgemein gilt bei Katheten a und b: D(a/2 | b/2).` } },
    { t: "fig", id: "m2f-rect" },
    { t: "text", h: "Kegel ohne Deckel (Altprüfung 2012, Aufgabe 5)", levels: {
      simple: "Ein kegelförmiger Behälter ohne Deckel hat 200 m² Mantelfläche. Wie müssen Radius und Höhe sein? Die Fläche fixiert eine Variable, das Volumen hängt dann nur mehr von r ab.",
      normal: `Gegeben: O = rπ√(h² + r²) = 200, V = r²πh/3. Aus O folgt h = √(O²/(π²r²) − r²), also${mx(`V(r) = ${fr("r", "3")}·√(O² − π²r⁴)`)}V′(r) = 0 ergibt r⁴ = O²/(3π²) → <b>r ≈ 6.063 m</b>, <b>h = √2·r ≈ 8.574 m</b>, <b>V ≈ 330.0 m³</b>.<br><br><b>Achtung beim Angabetext:</b> Die Altprüfung fragt nach dem <i>kleinsten</i> Volumen. Das gibt es nicht: Lässt man r gegen 0 oder gegen √(O/π) gehen, geht V gegen 0. Der einzige stationäre Punkt ist ein <b>Maximum</b>. Schreib das in der Prüfung kurz dazu und gib das Maximum an.` } },
    { t: "maple", title: "Kegel in Maple", code: ["O := 200:  V := r -> r/3*sqrt(O^2 - Pi^2*r^4):", "r0 := fsolve(diff(V(r), r) = 0, r = 0.1..7);", "h0 := sqrt(O^2/(Pi^2*r0^2) - r0^2);  V(r0);", "plot(V(r), r = 0..8, labels = [\"r\", \"V\"]);"] },
    C("Was ist bei einer Extremwertaufgabe die Zielfunktion?", "Die Größe, die maximal oder minimal werden soll, als Funktion der Variablen", ["Die Nebenbedingung", "Die Ableitung der Nebenbedingung", "Die Gleichung der Skizze"], "Zuerst klären, was optimiert wird (Fläche, Länge, Volumen …), dann diese Größe als Funktion aufschreiben."),
    C("Dreieck A(0|0), B(6|0), C(0|10). Wo liegt die Ecke D des größten Rechtecks (Ecke in A, D auf BC)?", "D(3 | 5)", ["D(2 | 6.67)", "D(4 | 3.33)", "D(3 | 6)"], "Allgemein D(a/2 | b/2): 6/2 = 3 und 10/2 = 5."),
    { t: "keys", items: ["Zielfunktion → Ableitungen null setzen → prüfen → Antwortsatz", "Brunnen/Fermat-Punkt: Minimize(l) bzw. fsolve der beiden Ableitungen", "Rechteck im rechtwinkligen Dreieck: D(a/2 | b/2), Fläche = halbe Dreiecksfläche", "Kegel mit fester Mantelfläche: Volumen hat nur ein Maximum (h = √2·r)"] }
  ] },
  { id: "m21-5", title: "Extremwerte mit Nebenbedingungen: Lagrange", topic: "mt-lagr", min: 14, xp: 0, blocks: [
    { t: "lead", html: "Oft sind die Variablen nicht frei: Der Zaun hat eine feste Länge, die Dose ein festes Volumen. Lagrange packt die Nebenbedingung mit in die Funktion, und dann reicht wieder „alle partiellen Ableitungen null setzen“." },
    { t: "text", h: "Bisher: Einsetzen", levels: {
      simple: "Rechteck mit Umfang 200 m: 2x + 2y = 200 → y = 100 − x. Einsetzen in A = x·y = x(100 − x), ableiten, x = 50.",
      normal: `Beispiel 1.2: Rechteckiges Grundstück, Umfang 200 m, Fläche maximal. Zielfunktion A(x, y) = xy, Nebenbedingung 2x + 2y = 200. Klassisch löst man die Nebenbedingung nach y auf (y = 100 − x), setzt ein, A(x) = x(100 − x), A′ = 100 − 2x = 0 → x = 50. Das klappt nur, wenn sich eine Variable leicht ausdrücken lässt.` } },
    { t: "text", h: "Neu: die Lagrange-Funktion", levels: {
      simple: "Bring die Nebenbedingung auf die Form „… = 0“, multipliziere mit λ und addiere sie zur Zielfunktion. Dann alle Ableitungen (auch nach λ) null setzen.",
      normal: `Nebenbedingung auf die Form φ(x, y) = 0 bringen, mit einem <b>Lagrange-Multiplikator λ</b> zur Zielfunktion addieren:${mx("F(x, y, λ) = f(x, y) + λ·φ(x, y)")}Dann <b>alle</b> partiellen Ableitungen null setzen: F<sub>x</sub> = 0, F<sub>y</sub> = 0, F<sub>λ</sub> = 0. Die Ableitung nach λ liefert genau die Nebenbedingung zurück. Bei m Nebenbedingungen nimmt man m Multiplikatoren λ₁ … λ<sub>m</sub>.<br><br><b>Vorteil</b>: sehr leicht in Maple. <b>Nachteil</b>: pro Nebenbedingung eine Variable mehr. Ob Max oder Min vorliegt, ergibt sich meist aus der Aufgabe.` } },
    { t: "example", label: "Beispiel 1.2 mit Lagrange", title: "Rechteck mit Umfang 200 m", html: `F(x, y, λ) = xy + λ(2x + 2y − 200)<br>F<sub>x</sub> = y + 2λ = 0 · F<sub>y</sub> = x + 2λ = 0 · F<sub>λ</sub> = 2x + 2y − 200 = 0<br>Aus den ersten beiden: x = y = −2λ. Eingesetzt: 8·(−λ) = 200 → <b>λ = −25, x = y = 50</b>. Größte Fläche 2500 m² (ein Quadrat).` },
    { t: "fig", id: "m2f-lagrange" },
    { t: "maple", title: "Lagrange in Maple", code: ["F := x*y + lambda*(2*x + 2*y - 200);", "solve({diff(F, x) = 0, diff(F, y) = 0, diff(F, lambda) = 0}, {x, y, lambda});"] },
    { t: "example", label: "Noch ein Beispiel", title: "Quader-Schachtel ohne Deckel mit 32 dm³ Volumen, möglichst wenig Material", html: `f = xy + 2xz + 2yz (Boden + 4 Seiten), Nebenbedingung xyz − 32 = 0.<br>F = xy + 2xz + 2yz + λ(xyz − 32). Lösung: <b>x = y = 4, z = 2</b>, Materialbedarf 48 dm², λ = −1.` },
    { t: "maple", code: ["F := x*y + 2*x*z + 2*y*z + lambda*(x*y*z - 32):", "solve({diff(F,x), diff(F,y), diff(F,z), diff(F,lambda)}, {x, y, z, lambda});"] },
    C("Wie lautet die Lagrange-Funktion für „maximiere f = x·y unter x + 4y = 40“?", "F = xy + λ(x + 4y − 40)", ["F = xy + x + 4y − 40", "F = λ·xy + x + 4y", "F = xy·(x + 4y − 40)"], "Nebenbedingung auf „… = 0“ bringen und mit λ multipliziert addieren."),
    C("Was ergibt die partielle Ableitung F<sub>λ</sub> = 0?", "Die Nebenbedingung selbst", ["Immer λ = 0", "Die Zielfunktion", "Die Hesse-Matrix"], "F<sub>λ</sub> = φ(x, y), also φ = 0, genau die Nebenbedingung."),
    { t: "keys", items: ["F = f + λ·φ mit φ = 0 als Nebenbedingung", "F<sub>x</sub> = F<sub>y</sub> = F<sub>λ</sub> = 0 lösen (Maple: solve)", "m Nebenbedingungen → m Multiplikatoren", "Rechteck mit Umfang U: Quadrat mit Seite U/4"] }
  ] }
  ] },
  questions: [
    Q("m2q101", "mt-fn2", "Wie viele unabhängige Variablen hat V(r, h) = r²πh/3?", "2", ["1", "3", "π"], "r und h; π ist eine Konstante."),
    Q("m2q102", "mt-fn2", "Mit welchem Maple-Befehl zeichnet man f(x, y) als Fläche?", "plot3d(f, x = -1..1, y = -1..1)", ["plot(f, x = -1..1)", "implicitplot(f, x, y)", "surface(f)"], "plot3d braucht zwei Bereiche, für x und für y."),
    Q("m2q103", "mt-part", "f(x, y) = x³ + 2xy². Was ist f<sub>x</sub>?", "3x² + 2y²", ["3x² + 4xy", "4xy", "3x²"], "y ist konstant: 2y²·x → 2y²."),
    Q("m2q104", "mt-part", "f(x, y) = x³ + 2xy². Was ist f<sub>y</sub>?", "4xy", ["2y²", "3x² + 4xy", "2xy"], "x ist konstant: 2x·y² → 4xy."),
    Q("m2q105", "mt-part", "f(x, y) = e<sup>x·y</sup>. Was ist f<sub>x</sub>?", "y·e<sup>xy</sup>", ["x·e<sup>xy</sup>", "e<sup>xy</sup>", "xy·e<sup>xy−1</sup>"], "Kettenregel: innere Ableitung von xy nach x ist y."),
    Q("m2q106", "mt-part", "f(x, y) = x²y³. Was ist f<sub>xy</sub>?", "6xy²", ["2xy³", "3x²y²", "6x²y"], "f<sub>x</sub> = 2xy³, dann nach y: 6xy²."),
    Q("m2q107", "mt-part", "Wie lautet die Tangentialebene an f(x, y) = x² + y² im Punkt (1 | 1)?", "z = 2 + 2(x − 1) + 2(y − 1)", ["z = 2 + 2x + 2y", "z = 1 + 2(x − 1) + 2(y − 1)", "z = 2x + 2y"], "f(1,1) = 2, f<sub>x</sub> = 2x = 2, f<sub>y</sub> = 2y = 2."),
    Q("m2q108", "mt-part", "Welcher Maple-Befehl liefert die zweite Ableitung nach x?", "diff(f, x$2)", ["diff(f, 2x)", "diff2(f, x)", "D(f, x, 2)"], "x$2 steht für x, x. Gleichwertig: diff(f, x, x)."),
    Q("m2q109", "mt-extr", "f(x, y) = x² + y² − 4x + 6y. Wo liegt der stationäre Punkt?", "(2 | −3)", ["(−2 | 3)", "(4 | −6)", "(0 | 0)"], "f<sub>x</sub> = 2x − 4 = 0 → x = 2; f<sub>y</sub> = 2y + 6 = 0 → y = −3."),
    Q("m2q110", "mt-extr", "f(x, y) = x² + y² − 4x + 6y hat in (2 | −3) …", "ein lokales Minimum", ["ein lokales Maximum", "einen Sattelpunkt", "keinen stationären Punkt"], "f<sub>xx</sub> = 2, f<sub>yy</sub> = 2, f<sub>xy</sub> = 0 → H = 4 &gt; 0, f<sub>xx</sub> &gt; 0."),
    Q("m2q111", "mt-extr", "Welcher Punkt ist bei f(x, y) = x² − y² ein Sattelpunkt?", "(0 | 0)", ["(1 | 1)", "(1 | 0)", "Es gibt keinen"], "f<sub>x</sub> = 2x, f<sub>y</sub> = −2y → (0|0); H = 2·(−2) = −4 &lt; 0."),
    Q("m2q112", "mt-extr", "Was gilt, wenn H<sub>f</sub>(x₀, y₀) = 0?", "Das Kriterium liefert keine Entscheidung", ["Es ist immer ein Sattelpunkt", "Es ist immer ein Minimum", "Der Punkt ist nicht stationär"], "Wie bei f″ = 0 im Eindimensionalen muss man anders weiterprüfen."),
    Q("m2q113", "mt-extr", "f(x, y) = x³ − 3x + y² − 2y. Welche Art hat der stationäre Punkt (1 | 1)?", "lokales Minimum", ["lokales Maximum", "Sattelpunkt", "keine Aussage"], "f<sub>xx</sub> = 6x = 6, f<sub>yy</sub> = 2, f<sub>xy</sub> = 0 → H = 12 &gt; 0, f<sub>xx</sub> &gt; 0."),
    Q("m2q114", "mt-extr", "f(x, y) = x³ − 3x + y² − 2y. Welche Art hat der stationäre Punkt (−1 | 1)?", "Sattelpunkt", ["lokales Minimum", "lokales Maximum", "keine Aussage"], "f<sub>xx</sub> = 6x = −6, f<sub>yy</sub> = 2 → H = −12 &lt; 0."),
    Q("m2q115", "mt-opt", "Wo liegt der Brunnen X für A(1|1), B(12|4), C(4|8) laut Folien?", "X(4.88 | 5.42)", ["X(5.67 | 4.33), der Schwerpunkt", "X(4 | 4)", "X(6.5 | 4.5)"], "Der Fermat-Punkt, nicht der Schwerpunkt ((1+12+4)/3 | (1+4+8)/3) = (5.67 | 4.33)."),
    Q("m2q116", "mt-opt", "Wie groß ist die Gesamtlänge der Leitungen im optimalen Brunnenpunkt?", "≈ 15.87", ["≈ 12.00", "≈ 17.55", "≈ 21.40"], "l(4.88, 5.42) ≈ 15.87 (Maple: Minimize(l))."),
    Q("m2q117", "mt-opt", "Altprüfung 2016: Dreieck A(0|0), B(4|0), C(0|6). Welche Fläche hat das größte Rechteck?", "6", ["12", "4", "8"], "D(2|3) → 2·3 = 6, die halbe Dreiecksfläche."),
    Q("m2q118", "mt-opt", "Kegel ohne Deckel, Mantelfläche 200 m². Welches Verhältnis h : r hat der Kegel mit dem größten Volumen?", "h = √2·r", ["h = r", "h = 2r", "h = r/√2"], "Aus V′ = 0 folgt r⁴ = O²/(3π²) und h² = 2r²."),
    Q("m2q119", "mt-lagr", "Wie viele Unbekannte hat das Lagrange-System bei 3 Variablen und 2 Nebenbedingungen?", "5", ["3", "2", "6"], "3 Variablen + 2 Multiplikatoren λ₁, λ₂."),
    Q("m2q120", "mt-lagr", "Was ist bei „Rechteck mit Umfang 200 m, Fläche maximal“ der Wert von λ?", "−25", ["25", "50", "−50"], "y + 2λ = 0 mit y = 50 → λ = −25."),
    Q("m2q121", "mt-lagr", "Welche Form muss eine Nebenbedingung für die Lagrange-Funktion haben?", "φ(x, y) = 0", ["φ(x, y) = 1", "φ(x, y) &gt; 0", "φ(x, y) = f(x, y)"], "Man bringt alles auf eine Seite, z. B. 2x + 2y − 200 = 0."),
    Q("m2q122", "mt-lagr", "Maximiere f = x·y unter x + y = 10. Ergebnis?", "x = y = 5, f = 25", ["x = 10, y = 0", "x = y = 10", "x = 2, y = 8"], "F = xy + λ(x + y − 10): y + λ = 0, x + λ = 0 → x = y = 5.")
  ],
  flashcards: [
    F("m2f101", "mt-fn2", "Graph von f(x, y)", "Fläche im ℝ³: über jedem Punkt (x, y) die Höhe z = f(x, y)"),
    F("m2f102", "mt-part", "Partielle Ableitung f<sub>x</sub>", "y wie Konstante behandeln, nach x ableiten = Steigung in x-Richtung"),
    F("m2f103", "mt-part", "Tangentialebene in (x₀, y₀)", "z = f(x₀,y₀) + f<sub>x</sub>(x₀,y₀)(x − x₀) + f<sub>y</sub>(x₀,y₀)(y − y₀)"),
    F("m2f104", "mt-part", "Satz von Schwarz", "f<sub>xy</sub> = f<sub>yx</sub> (bei zweimal stetig differenzierbaren Funktionen)"),
    F("m2f105", "mt-extr", "Notwendige Bedingung für Extremum", "f<sub>x</sub> = 0 und f<sub>y</sub> = 0 (waagrechte Tangentialebene)"),
    F("m2f106", "mt-extr", "Hesse-Kriterium", "H = f<sub>xx</sub>f<sub>yy</sub> − f<sub>xy</sub>² · H &lt; 0 Sattel · H &gt; 0 und f<sub>xx</sub> &gt; 0 Min · H &gt; 0 und f<sub>xx</sub> &lt; 0 Max · H = 0 keine Aussage"),
    F("m2f107", "mt-extr", "Beispiel f = x² − y² − (x² + y²)²", "Sattel in (0|0), Maxima in (±√0.5 | 0) mit f = 0.25"),
    F("m2f108", "mt-opt", "Fermat-Punkt (Brunnen)", "minimiert die Summe der Abstände zu 3 Punkten · Folien: X(4.88|5.42), Länge 15.87"),
    F("m2f109", "mt-opt", "Größtes Rechteck im rechtwinkligen Dreieck (Katheten a, b)", "Ecke D(a/2 | b/2), Fläche ab/4"),
    F("m2f110", "mt-lagr", "Lagrange-Funktion", "F = f + λ₁φ₁ + … + λ<sub>m</sub>φ<sub>m</sub>, alle partiellen Ableitungen null setzen"),
    F("m2f111", "mt-lagr", "Maple: Extremum mit Nebenbedingung", "solve({diff(F,x)=0, diff(F,y)=0, diff(F,lambda)=0}, {x,y,lambda})")
  ]
});
})();
