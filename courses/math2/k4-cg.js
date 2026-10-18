/* MATH-2 · Kapitel 4: Anwendungen der Matrizenrechnung – Computergrafik (Skriptum Kap. 4, Folien „Computergrafik“) */
(function () {
const EXT = window.STUDYOS_EXT = window.STUDYOS_EXT || {};
const { fr, mx, mat, Q, C, F } = window.M2;

(EXT.math2 = EXT.math2 || []).push({
  id: "m2-k4",
  topics: {
    "mt-lina": { name: "Maple, Matrizen und lineare Transformationen", lesson: "m24-1" },
    "mt-elem": { name: "Streckung, Spiegelung, Projektion", lesson: "m24-2" },
    "mt-dreh": { name: "Drehung, Umkehrung, Orthonormalmatrix", lesson: "m24-3" },
    "mt-homo": { name: "Verschiebung und homogene Koordinaten", lesson: "m24-4" },
    "mt-komb": { name: "Kombination von Transformationen", lesson: "m24-5" }
  },
  world: { id: "m2w4", n: 4, title: "Computergrafik mit Matrizen", sub: "Spiegeln, Drehen, Verschieben und Kombinieren als Matrizenmultiplikation",
    boss: { id: "boss-m2w4", title: "Kapiteltest: Computergrafik", topics: ["mt-lina", "mt-elem", "mt-dreh", "mt-homo", "mt-komb"] },
    lessons: [
  { id: "m24-1", title: "Maple, Matrizen und lineare Transformationen", topic: "mt-lina", min: 12, xp: 0, blocks: [
    { t: "lead", html: "Jedes Computerspiel dreht, verschiebt und spiegelt ständig Millionen von Punkten. Der Trick dahinter: Jede dieser Operationen ist eine <b>Matrix</b>, und ein neuer Punkt entsteht durch eine einzige Matrizenmultiplikation." },
    { t: "text", h: "Lineare Transformation = Matrix mal Vektor", levels: {
      simple: "Ein Punkt P(x|y) wird als Spalte geschrieben. Multipliziert man ihn mit einer passenden 2×2-Matrix A, bekommt man den transformierten Punkt P′.",
      normal: `<b>Satz 4.1:</b> Jede lineare Transformation f : ℝⁿ → ℝᵐ lässt sich als${mx("f(x⃗) = A·x⃗")}schreiben, A heißt Koeffizienten- oder Transformationsmatrix. Linear heißt: f(a⃗ + b⃗) = f(a⃗) + f(b⃗) und f(λa⃗) = λf(a⃗). In der Ebene:${mx(`${mat([["x′"], ["y′"]])} = ${mat([["a", "b"], ["c", "d"]])}·${mat([["x"], ["y"]])}`)}<b>Praktisch:</b> Schreibt man alle Eckpunkte einer Figur als Spalten in eine Matrix P, liefert A·P mit <i>einer</i> Multiplikation alle neuen Eckpunkte.` } },
    { t: "maple", title: "Die wichtigsten Befehle (Paket LinearAlgebra)", code: ["with(LinearAlgebra):", "A := Matrix([[2, 0, -1], [0, 4, 0], [-1, 0, 2]]);", "b := Vector([1, 2, 3]);", "Determinant(A);  Transpose(A);  MatrixInverse(A);", "A . b;", "LinearSolve(A, b);"], note: "Der Punkt . ist in Maple die Matrizenmultiplikation (nicht *). LinearSolve(A, b) löst A·x = b; ist das System nicht eindeutig lösbar, kommt eine parametrische Lösung." },
    { t: "example", label: "Folien: Streckung eines Quadrats", title: "Quadrat (0|0), (0|1), (1|1), (1|0) mit A = [[3, 0], [0, 2]]", html: `Alle Punkte als Spalten:${mx(`${mat([["3", "0"], ["0", "2"]])}·${mat([["0", "0", "1", "1"], ["0", "1", "1", "0"]])} = ${mat([["0", "0", "3", "3"], ["0", "2", "2", "0"]])}`)}Aus dem Einheitsquadrat wird ein Rechteck 3 × 2.` },
    { t: "maple", code: ["with(LinearAlgebra):  with(plots):", "A := Matrix([[3, 0], [0, 2]]):", "P := Matrix([[0, 0, 1, 1], [0, 1, 1, 0]]):", "Q := A . P;", "display(polygonplot([seq([P[1, i], P[2, i]], i = 1..4)], color = blue), polygonplot([seq([Q[1, i], Q[2, i]], i = 1..4)], color = red), scaling = constrained);"] },
    C("Wie multipliziert man in Maple die Matrix A mit dem Vektor v?", "A . v", ["A * v", "A x v", "Multiply[A, v]"], "Der Punkt-Operator ist die Matrizenmultiplikation. (Multiply(A, v) geht auch, mit runden Klammern.)"),
    C("Warum schreibt man alle Eckpunkte einer Figur als Spalten in eine Matrix?", "Damit eine einzige Multiplikation alle Punkte transformiert", ["Weil Maple keine Vektoren kennt", "Damit die Determinante 1 wird", "Damit man die Figur spiegeln kann"], "A·[p₁ p₂ … pₙ] = [A·p₁ A·p₂ … A·pₙ]."),
    { t: "keys", items: ["with(LinearAlgebra): Matrix, Vector, Determinant, Transpose, MatrixInverse, LinearSolve", "Matrizenmultiplikation in Maple: A . B", "Transformation: p′ = A·p, Eckpunkte als Spalten → eine Multiplikation"] }
  ] },
  { id: "m24-2", title: "Streckung, Spiegelung, Projektion", topic: "mt-elem", min: 14, xp: 0, blocks: [
    { t: "lead", html: "Die drei einfachsten Bausteine der Computergrafik. Merke dir für jede Matrix, was sie mit den Einheitsvektoren (1|0) und (0|1) macht: die Spalten der Matrix sind genau deren Bilder." },
    { t: "text", h: "Streckung und Stauchung", levels: {
      simple: "Die Matrix [[a, 0], [0, b]] multipliziert jede x-Koordinate mit a und jede y-Koordinate mit b. Größer als 1 streckt, kleiner als 1 staucht.",
      normal: `${mx(`${mat([["a", "0"], ["0", "b"]])}·${mat([["x"], ["y"]])} = ${mat([["a·x"], ["b·y"]])}`)}a, b &gt; 1: Streckung, 0 &lt; a, b &lt; 1: Stauchung. Beispiel aus dem Skriptum: Mit [[3, 0], [0, 4]] wird der Einheitskreis zur Ellipse mit Halbachsen 3 und 4.` } },
    { t: "text", h: "Spiegelungen", levels: {
      simple: "An der x-Achse: y wechselt das Vorzeichen. An der y-Achse: x wechselt das Vorzeichen. Am Ursprung: beide.",
      normal: `${mx(`S<sub>x</sub> = ${mat([["1", "0"], ["0", "−1"]])} &nbsp;&nbsp; S<sub>y</sub> = ${mat([["−1", "0"], ["0", "1"]])} &nbsp;&nbsp; S<sub>xy</sub> = ${mat([["−1", "0"], ["0", "−1"]])}`)}S<sub>x</sub>: Spiegelung an der x-Achse, P(x|y) → P′(x|−y). S<sub>y</sub>: an der y-Achse. S<sub>xy</sub>: Punktspiegelung am Ursprung.` } },
    { t: "text", h: "Projektionen", levels: {
      simple: "Projektion auf die x-Achse: den Punkt senkrecht auf die Achse „fallen lassen“, y wird 0.",
      normal: `${mx(`P<sub>x</sub> = ${mat([["1", "0"], ["0", "0"]])} &nbsp;&nbsp;&nbsp; P<sub>y</sub> = ${mat([["0", "0"], ["0", "1"]])}`)}Projektion auf die x- bzw. y-Achse: die jeweils andere Koordinate wird 0. Projektionen haben Determinante 0 und sind <b>nicht umkehrbar</b> (aus dem Schatten kann man den Punkt nicht zurückgewinnen).` } },
    { t: "fig", id: "m2f-trans" },
    { t: "example", label: "Altprüfung SS 2012, Aufgabe 1 (3 Punkte)", title: "Projektion auf die Gerade y = 2x, getestet mit A(5|3)", html: `Idee: Die Gerade hat den Richtungsvektor u⃗ = (1, 2). Projektion eines Punkts p⃗ auf die Gerade: (p⃗·u⃗)/(u⃗·u⃗)·u⃗. Als Matrix:${mx(`P = ${fr("1", "1 + k²")}·${mat([["1", "k"], ["k", "k²"]])} = ${fr("1", "5")}·${mat([["1", "2"], ["2", "4"]])} &nbsp;(k = 2)`)}Test: P·(5, 3) = (1/5)·(11, 22) = <b>(2.2 | 4.4)</b>, und tatsächlich liegt der Punkt auf y = 2x.<br>Alternativ (Skriptum-Methode): um α = arctan 2 im UZS drehen, auf die x-Achse projizieren, zurückdrehen.` },
    { t: "maple", title: "Lösung SS 2012, Aufgabe 1", code: ["with(LinearAlgebra):", "k := 2:", "Pr := 1/(1 + k^2)*Matrix([[1, k], [k, k^2]]);", "Pr . Vector([5, 3]);", "alpha := arctan(2):", "Dr := Matrix([[cos(alpha), -sin(alpha)], [sin(alpha), cos(alpha)]]):", "evalf(Dr . Matrix([[1, 0], [0, 0]]) . MatrixInverse(Dr));"], note: "Beide Wege liefern dieselbe Matrix (die zweite Zeile prüft das numerisch). Achtung: D ist in Maple geschützt (Ableitungsoperator), darum heißt die Drehmatrix hier Dr." },
    C("Welche Matrix spiegelt an der y-Achse?", "[[−1, 0], [0, 1]]", ["[[1, 0], [0, −1]]", "[[0, 1], [1, 0]]", "[[−1, 0], [0, −1]]"], "x wechselt das Vorzeichen, y bleibt."),
    C("Was macht [[0, 0], [0, 1]] mit dem Punkt (3|2)?", "(0|2), Projektion auf die y-Achse", ["(3|0)", "(2|3)", "(0|0)"], "Die x-Koordinate wird 0."),
    C("Warum hat eine Projektion keine Umkehrung?", "Ihre Determinante ist 0, viele Punkte landen auf demselben Bildpunkt", ["Weil sie nicht linear ist", "Weil Maple sie nicht invertieren kann", "Sie hat eine"], "(3|2) und (5|2) haben beide das Bild (0|2) bei P<sub>y</sub>."),
    { t: "keys", items: ["Streckung [[a, 0], [0, b]]", "S<sub>x</sub> = [[1, 0], [0, −1]], S<sub>y</sub> = [[−1, 0], [0, 1]], S<sub>xy</sub> = −E", "P<sub>x</sub> = [[1, 0], [0, 0]], P<sub>y</sub> = [[0, 0], [0, 1]], det = 0", "Projektion auf y = kx: 1/(1 + k²)·[[1, k], [k, k²]]"] }
  ] },
  { id: "m24-3", title: "Drehung, Umkehrung, Orthonormalmatrix", topic: "mt-dreh", min: 14, xp: 0, blocks: [
    { t: "lead", html: "Drehungen sind die wichtigste Operation, und die Drehmatrix ist die Formel, die man in der Prüfung auswendig können sollte." },
    { t: "text", h: "Die Drehmatrix", levels: {
      simple: "Drehung um α gegen den Uhrzeigersinn um den Ursprung: [[cos α, −sin α], [sin α, cos α]]. Im Uhrzeigersinn wandert das Minus zum unteren sin.",
      normal: `Polarkoordinaten: x = r cos φ, y = r sin φ. Nach der Drehung um α: x′ = r cos(φ + α), y′ = r sin(φ + α). Mit den Additionstheoremen:${mx("x′ = cos α·x − sin α·y &nbsp;&nbsp;&nbsp; y′ = sin α·x + cos α·y")}${mx(`D<sub>α</sub> = ${mat([["cos α", "−sin α"], ["sin α", "cos α"]])} &nbsp;(gegen den UZS) &nbsp;&nbsp;&nbsp; D<sub>α</sub>⁻¹ = ${mat([["cos α", "sin α"], ["−sin α", "cos α"]])} &nbsp;(im UZS)`)}Eine Drehung um α im Uhrzeigersinn ist eine Drehung um −α gegen den Uhrzeigersinn.` } },
    { t: "example", label: "Folien: Drehung eines Rechtecks", title: "(0|0), (0|2), (3|2), (3|0) um 45° gegen den UZS", html: `${mx(`${mat([["0.707", "−0.707"], ["0.707", "0.707"]])}·${mat([["0", "0", "3", "3"], ["0", "2", "2", "0"]])} = ${mat([["0", "−1.4", "0.7", "2.1"], ["0", "1.4", "3.5", "2.1"]])}`)}` },
    { t: "maple", code: ["with(LinearAlgebra):  with(plots):", "alpha := Pi/4:", "Dr := Matrix([[cos(alpha), -sin(alpha)], [sin(alpha), cos(alpha)]]);", "P := Matrix([[0, 0, 3, 3], [0, 2, 2, 0]]):", "Q := evalf(Dr . P);", "display(polygonplot([seq([P[1, i], P[2, i]], i = 1..4)], color = blue), polygonplot([seq([Q[1, i], Q[2, i]], i = 1..4)], color = red), scaling = constrained);"], note: "Winkel immer im Bogenmaß: 45° = Pi/4, 90° = Pi/2, 30° = Pi/6." },
    { t: "text", h: "Umkehrung einer Transformation", levels: {
      simple: "Wenn A einen Punkt verschiebt/dreht, macht die inverse Matrix A⁻¹ das wieder rückgängig.",
      normal: `Ist Q = A·P, dann ist P = A⁻¹·Q, denn A⁻¹·A = E. Die <b>inverse Matrix</b> ist also die Umkehrtransformation. Sie existiert nur, wenn det A ≠ 0. Spiegelungen, Drehungen und Verschiebungen sind umkehrbar, Projektionen nicht. Merke: Die Inverse einer Spiegelung ist die Spiegelung selbst (zweimal spiegeln = nichts tun).` } },
    { t: "text", h: "Orthonormalmatrizen", levels: {
      simple: "Die Spalten einer Drehmatrix sind senkrecht zueinander und haben Länge 1. Solche Matrizen ändern keine Längen und Winkel.",
      normal: `det D<sub>α</sub> = cos²α + sin²α = 1. Die Spalten s⃗₁ = (cos α, sin α) und s⃗₂ = (−sin α, cos α) haben Länge 1 und s⃗₁·s⃗₂ = 0.<br><b>Definition 4.1:</b> Stehen die Spalten einer n×n-Matrix paarweise orthogonal, heißt sie <b>Orthogonalmatrix</b>; ist zusätzlich det A = ±1, heißt sie <b>Orthonormalmatrix</b>. Orthonormale Transformationen (Drehungen, Spiegelungen) lassen <b>Längen und Winkel unverändert</b>.` } },
    { t: "maple", code: ["with(LinearAlgebra):", "alpha := Pi/6:", "Dr := Matrix([[cos(alpha), -sin(alpha)], [sin(alpha), cos(alpha)]]);", "MatrixInverse(Dr);", "Determinant(Dr);", "Transpose(Dr) . Dr;"], note: "Bei Orthonormalmatrizen ist die Inverse gleich der Transponierten: Transpose(Dr) . Dr ergibt die Einheitsmatrix." },
    C("Welche Matrix dreht um 90° gegen den Uhrzeigersinn?", "[[0, −1], [1, 0]]", ["[[0, 1], [−1, 0]]", "[[1, 0], [0, −1]]", "[[−1, 0], [0, −1]]"], "cos 90° = 0, sin 90° = 1. (Die zweite Option dreht im Uhrzeigersinn.)"),
    C("Was ist det D<sub>α</sub> für jede Drehmatrix?", "1", ["0", "−1", "cos 2α"], "cos²α + sin²α = 1."),
    C("Welche Transformation macht die Spiegelung an der x-Achse rückgängig?", "Die Spiegelung an der x-Achse selbst", ["Die Spiegelung an der y-Achse", "Die Projektion auf die x-Achse", "Eine Drehung um 90°"], "S<sub>x</sub>·S<sub>x</sub> = E, also S<sub>x</sub>⁻¹ = S<sub>x</sub>."),
    { t: "keys", items: ["D<sub>α</sub> = [[cos α, −sin α], [sin α, cos α]] gegen den UZS", "Im UZS: [[cos α, sin α], [−sin α, cos α]] = D<sub>α</sub>⁻¹", "Umkehrung = inverse Matrix, nur bei det ≠ 0", "Orthonormal: Spalten orthogonal, Länge 1, det = ±1, A⁻¹ = Aᵀ"] }
  ] },
  { id: "m24-4", title: "Verschiebung und homogene Koordinaten", topic: "mt-homo", min: 12, xp: 0, blocks: [
    { t: "lead", html: "Verschieben ist das Einfachste überhaupt, x + 3, y + 1. Und trotzdem gibt es dafür <b>keine</b> 2×2-Matrix, weil (0|0) bei jeder Matrix auf (0|0) bleibt. Der Ausweg ist eine geniale Idee: eine dritte Koordinate." },
    { t: "text", h: "Homogene Koordinaten", levels: {
      simple: "Hänge an jeden Punkt eine 1 an: (x|y) wird (x|y|1). Dann geht Verschieben mit einer 3×3-Matrix.",
      normal: `Jeder Punkt bekommt eine dritte Koordinate mit dem Wert 1: (x|y) → (x|y|1), das sind <b>homogene Koordinaten</b>. Die Verschiebung um (v<sub>x</sub>, v<sub>y</sub>) ist dann${mx(`${mat([["1", "0", "v<sub>x</sub>"], ["0", "1", "v<sub>y</sub>"], ["0", "0", "1"]])}·${mat([["x"], ["y"], ["1"]])} = ${mat([["x + v<sub>x</sub>"], ["y + v<sub>y</sub>"], ["1"]])}`)}Die dritte Koordinate bleibt immer 1. Damit Drehungen und Spiegelungen mit Verschiebungen kombiniert werden können, erweitert man auch sie auf 3×3: die 2×2-Matrix links oben, rechts und unten Nullen, rechts unten eine 1.` } },
    { t: "example", label: "Folien: Verschiebung", title: "Rechteck (0|0), (0|2), (3|2), (3|0) um (1, 0.5)", html: `${mx(`${mat([["1", "0", "1"], ["0", "1", "0.5"], ["0", "0", "1"]])}·${mat([["0", "0", "3", "3"], ["0", "2", "2", "0"], ["1", "1", "1", "1"]])} = ${mat([["1", "1", "4", "4"], ["0.5", "2.5", "2.5", "0.5"], ["1", "1", "1", "1"]])}`)}` },
    { t: "maple", code: ["with(LinearAlgebra):", "V := Matrix([[1, 0, 1], [0, 1, 0.5], [0, 0, 1]]);", "P := Matrix([[0, 0, 3, 3], [0, 2, 2, 0], [1, 1, 1, 1]]):", "V . P;", "MatrixInverse(V);"], note: "Die Inverse einer Verschiebung um (1, 0.5) ist die Verschiebung um (−1, −0.5)." },
    C("Warum kann man eine Verschiebung nicht mit einer 2×2-Matrix darstellen?", "Weil jede Matrix den Ursprung (0|0) auf (0|0) abbildet", ["Weil Verschiebungen nicht umkehrbar sind", "Weil 2×2-Matrizen keine Inverse haben", "Man kann es doch"], "A·(0, 0) = (0, 0) für jede Matrix A, eine Verschiebung bewegt den Ursprung aber."),
    C("Wie sieht die 3×3-Version der Drehmatrix aus?", "[[cos α, −sin α, 0], [sin α, cos α, 0], [0, 0, 1]]", ["[[cos α, −sin α, 1], [sin α, cos α, 1], [0, 0, 1]]", "[[cos α, −sin α, 0], [sin α, cos α, 0], [0, 0, 0]]", "[[1, 0, cos α], [0, 1, sin α], [0, 0, 1]]"], "2×2-Block links oben, sonst Nullen, rechts unten 1."),
    { t: "keys", items: ["Homogene Koordinaten: (x|y) → (x|y|1)", "Verschiebung V = [[1, 0, v<sub>x</sub>], [0, 1, v<sub>y</sub>], [0, 0, 1]]", "Andere Transformationen auf 3×3 erweitern (1 rechts unten)", "V⁻¹ = Verschiebung um (−v<sub>x</sub>, −v<sub>y</sub>)"] }
  ] },
  { id: "m24-5", title: "Kombination von Transformationen", topic: "mt-komb", min: 18, xp: 0, blocks: [
    { t: "lead", html: "Zuerst verschieben, dann drehen ist <b>nicht</b> dasselbe wie zuerst drehen, dann verschieben. Weil Matrizenmultiplikation nicht kommutativ ist, entscheidet die Reihenfolge über das Ergebnis. Das ist die häufigste Fehlerquelle in der Prüfung." },
    { t: "text", h: "Die Reihenfolge: von rechts nach links lesen", levels: {
      simple: "Die zuerst ausgeführte Transformation steht ganz rechts, direkt beim Punkt. „Zuerst M, dann L“ heißt L·M·P.",
      normal: `Zuerst die Transformation M, danach L: Q = M·P, R = L·Q = <b>L·M·P</b>. Die Produktmatrix L·M ist die zusammengesetzte Transformation. Man liest also <b>von rechts nach links</b>: die Matrix direkt neben P wirkt zuerst. Da im Allgemeinen L·M ≠ M·L, ist die Reihenfolge extrem wichtig.` } },
    { t: "fig", id: "m2f-order" },
    { t: "example", label: "Skriptum, Beispiel 4.1", title: "Dreieck A(−1|−1), B(0|1), C(1|−1): verschieben um (3, 1) und drehen um 45°", html: `<b>1. Zuerst verschieben, dann drehen:</b> D<sub>45</sub>·V·P → A′(1.41 | 1.41), B′(0.71 | 3.54), C′(2.83 | 2.83).<br><b>2. Zuerst drehen, dann verschieben:</b> V·D<sub>45</sub>·P → A′(3 | −0.41), B′(2.29 | 1.71), C′(4.41 | 1).<br>Zwei völlig verschiedene Dreiecke.` },
    { t: "maple", title: "Beispiel 4.1 in Maple", code: ["with(LinearAlgebra):  with(plots):", "V := Matrix([[1, 0, 3], [0, 1, 1], [0, 0, 1]]):", "D45 := Matrix([[cos(Pi/4), -sin(Pi/4), 0], [sin(Pi/4), cos(Pi/4), 0], [0, 0, 1]]):", "P := Matrix([[-1, 0, 1], [-1, 1, -1], [1, 1, 1]]):", "Q1 := evalf(D45 . V . P);", "Q2 := evalf(V . D45 . P);", "pts := M -> [seq([M[1, i], M[2, i]], i = 1..3)]:", "display(polygonplot(pts(P), color = gray), polygonplot(pts(Q1), color = red), polygonplot(pts(Q2), color = blue), scaling = constrained);"] },
    { t: "text", h: "Spiegelung an einer beliebigen Geraden durch den Ursprung", levels: {
      simple: "Trick: Gerade auf die x-Achse drehen, an der x-Achse spiegeln, zurückdrehen. Ergebnis: [[cos 2α, sin 2α], [sin 2α, −cos 2α]].",
      normal: `Beispiel 4.2: Gerade g durch den Ursprung mit Steigungswinkel α. Zerlegung in drei Grundoperationen:<br>1. um α <b>im</b> Uhrzeigersinn drehen (g wird zur x-Achse): D<br>2. an der x-Achse spiegeln: S<sub>x</sub><br>3. um α gegen den Uhrzeigersinn zurückdrehen: D⁻¹${mx(`L = D⁻¹·S<sub>x</sub>·D = ${mat([["cos 2α", "sin 2α"], ["sin 2α", "−cos 2α"]])}`)}Dieses Muster (hindrehen/hinschieben, einfache Operation, zurück) löst auch die Drehung um einen beliebigen Punkt M: <b>T<sub>M</sub>·D·T<sub>−M</sub></b> (zum Ursprung schieben, drehen, zurückschieben).` } },
    { t: "maple", code: ["with(LinearAlgebra):", "alpha := Pi/6:", "Dr := Matrix([[cos(alpha), sin(alpha)], [-sin(alpha), cos(alpha)]]):", "Sx := Matrix([[1, 0], [0, -1]]):", "L := MatrixInverse(Dr) . Sx . Dr;", "Matrix([[cos(2*alpha), sin(2*alpha)], [sin(2*alpha), -cos(2*alpha)]]);"], note: "Beide Ausgaben stimmen überein: Spiegelung an der Geraden mit 30° Steigungswinkel." },
    { t: "example", label: "Altprüfung SS 2016, Aufgabe 1 (3 Punkte)", title: "Dreieck A(0|0), B(4|0), C(0|6): A nach M(3|3) schieben, dann um 90° im UZS um M drehen", html: `Verschiebung T = T<sub>(3,3)</sub>. Drehung um M im UZS: T<sub>(3,3)</sub>·D<sub>−90°</sub>·T<sub>(−3,−3)</sub>. Gesamt (rechts zuerst!):${mx(`G = T<sub>(3,3)</sub>·D<sub>−90°</sub>·T<sub>(−3,−3)</sub>·T<sub>(3,3)</sub> = T<sub>(3,3)</sub>·D<sub>−90°</sub> = ${mat([["0", "1", "3"], ["−1", "0", "3"], ["0", "0", "1"]])}`)}Neue Ecken: <b>A′(3|3), B′(3|−1), C′(9|3)</b>.` },
    { t: "maple", title: "Lösung SS 2016, Aufgabe 1", code: ["with(LinearAlgebra):  with(plots):", "T := (a, b) -> Matrix([[1, 0, a], [0, 1, b], [0, 0, 1]]):", "R := Matrix([[cos(-Pi/2), -sin(-Pi/2), 0], [sin(-Pi/2), cos(-Pi/2), 0], [0, 0, 1]]):", "G := T(3, 3) . R . T(-3, -3) . T(3, 3);", "P := Matrix([[0, 4, 0], [0, 0, 6], [1, 1, 1]]):", "Q := G . P;", "display(polygonplot([[0, 0], [4, 0], [0, 6]], color = blue), polygonplot([[Q[1, 1], Q[2, 1]], [Q[1, 2], Q[2, 2]], [Q[1, 3], Q[2, 3]]], color = red), scaling = constrained);"] },
    C("„Zuerst um 30° drehen (D), dann an der x-Achse spiegeln (S)“. Welches Produkt?", "S·D", ["D·S", "D + S", "D⁻¹·S·D"], "Die zuerst ausgeführte Matrix steht rechts beim Punkt: S·D·P."),
    C("Wie dreht man um einen Punkt M statt um den Ursprung?", "T<sub>M</sub>·D·T<sub>−M</sub>: zum Ursprung schieben, drehen, zurückschieben", ["D·T<sub>M</sub>", "T<sub>M</sub>·D", "Das geht nicht mit Matrizen"], "Wieder von rechts lesen: zuerst T<sub>−M</sub> (M wandert in den Ursprung)."),
    C("Was ist die Matrix der Spiegelung an der Geraden y = x (α = 45°)?", "[[0, 1], [1, 0]]", ["[[1, 0], [0, −1]]", "[[0, −1], [1, 0]]", "[[−1, 0], [0, 1]]"], "cos 90° = 0, sin 90° = 1 → x und y werden vertauscht."),
    { t: "keys", items: ["Zuerst M, dann L → L·M·P (von rechts nach links)", "Reihenfolge ändert das Ergebnis (Beispiel 4.1)", "Spiegelung an Gerade mit Winkel α: [[cos 2α, sin 2α], [sin 2α, −cos 2α]]", "Drehung um Punkt M: T<sub>M</sub>·D·T<sub>−M</sub>", "SS 2016: G = [[0, 1, 3], [−1, 0, 3], [0, 0, 1]], A′(3|3), B′(3|−1), C′(9|3)"] }
  ] }
  ] },
  questions: [
    Q("m2q401", "mt-lina", "Welches Paket braucht man in Maple für Matrizen?", "LinearAlgebra", ["CurveFitting", "plots", "Statistics"], "with(LinearAlgebra)."),
    Q("m2q402", "mt-lina", "Was liefert LinearSolve(A, b)?", "Den Vektor x mit A·x = b", ["Die Inverse von A", "Die Determinante", "Die Eigenwerte"], "Skriptum 4.1."),
    Q("m2q403", "mt-lina", "Woran erkennt man eine lineare Transformation?", "f(a + b) = f(a) + f(b) und f(λa) = λf(a)", ["f(0) = 1", "f ist eine Drehung", "f hat eine Inverse"], "Die beiden Linearitätsbedingungen."),
    Q("m2q404", "mt-elem", "Was macht [[2, 0], [0, 0.5]]?", "x wird verdoppelt, y halbiert", ["Drehung um 2°", "Spiegelung", "Projektion"], "Streckung in x, Stauchung in y."),
    Q("m2q405", "mt-elem", "Bild von (3|−2) bei Punktspiegelung am Ursprung?", "(−3|2)", ["(3|2)", "(−3|−2)", "(2|−3)"], "S<sub>xy</sub> = −E."),
    Q("m2q406", "mt-elem", "Determinante von P<sub>x</sub> = [[1, 0], [0, 0]]?", "0", ["1", "−1", "2"], "Projektionen sind nicht umkehrbar."),
    Q("m2q407", "mt-elem", "Projektionsmatrix auf y = 2x?", "(1/5)·[[1, 2], [2, 4]]", ["[[1, 2], [2, 4]]", "(1/3)·[[1, 2], [2, 1]]", "[[1, 0], [0, 2]]"], "1/(1 + k²)·[[1, k], [k, k²]] mit k = 2."),
    Q("m2q408", "mt-elem", "SS 2012: Bild von A(5|3) bei Projektion auf y = 2x?", "(2.2 | 4.4)", ["(5 | 10)", "(1.5 | 3)", "(3 | 6)"], "(1/5)·(5 + 6, 10 + 12) = (11/5, 22/5)."),
    Q("m2q409", "mt-dreh", "Drehmatrix für 30° gegen den UZS?", "[[√3/2, −1/2], [1/2, √3/2]]", ["[[1/2, −√3/2], [√3/2, 1/2]]", "[[√3/2, 1/2], [−1/2, √3/2]]", "[[√3/2, 0], [0, √3/2]]"], "cos 30° = √3/2, sin 30° = 1/2."),
    Q("m2q410", "mt-dreh", "Was ist (D<sub>α</sub>)⁻¹?", "Die Drehung um α im Uhrzeigersinn", ["D<sub>2α</sub>", "Die Spiegelung an der x-Achse", "Existiert nicht"], "Rückgängig machen = zurückdrehen."),
    Q("m2q411", "mt-dreh", "Wann heißt eine Matrix orthonormal?", "Spalten paarweise orthogonal und det = ±1", ["Alle Einträge sind 0 oder 1", "Sie ist symmetrisch", "Ihre Determinante ist 0"], "Definition 4.1."),
    Q("m2q412", "mt-dreh", "Welche Transformation ist NICHT orthonormal?", "Streckung um den Faktor 2", ["Drehung um 60°", "Spiegelung an der y-Achse", "Punktspiegelung am Ursprung"], "Streckung ändert Längen, det = 4."),
    Q("m2q413", "mt-homo", "Wie lautet (2|5) in homogenen Koordinaten?", "(2|5|1)", ["(2|5|0)", "(1|2|5)", "(2|5|7)"], "Dritte Koordinate 1."),
    Q("m2q414", "mt-homo", "Verschiebungsmatrix für (−2, 4)?", "[[1, 0, −2], [0, 1, 4], [0, 0, 1]]", ["[[−2, 0, 0], [0, 4, 0], [0, 0, 1]]", "[[1, 0, 0], [0, 1, 0], [−2, 4, 1]]", "[[1, −2], [4, 1]]"], "Verschiebung in der dritten Spalte."),
    Q("m2q415", "mt-homo", "Verschiebe (1|1) um (3, 1). Ergebnis?", "(4|2)", ["(3|1)", "(2|4)", "(4|1)"], "Einfach addieren, die Matrix macht genau das."),
    Q("m2q416", "mt-komb", "Zuerst A, dann B auf den Punkt p. Welche Formel?", "B·A·p", ["A·B·p", "(A + B)·p", "A·p·B"], "Die zuerst ausgeführte Matrix steht rechts."),
    Q("m2q417", "mt-komb", "Beispiel 4.1, „zuerst verschieben, dann drehen“: Bild von A(−1|−1)?", "(1.41 | 1.41)", ["(3 | −0.41)", "(2 | 0)", "(0.71 | 3.54)"], "V: (2|0), dann 45° drehen: (√2 | √2)."),
    Q("m2q418", "mt-komb", "Spiegelung an der Geraden mit Steigungswinkel α = 0 (x-Achse) nach der Formel [[cos 2α, sin 2α], [sin 2α, −cos 2α]]?", "[[1, 0], [0, −1]]", ["[[0, 1], [1, 0]]", "[[−1, 0], [0, 1]]", "[[1, 0], [0, 1]]"], "cos 0 = 1, sin 0 = 0, genau S<sub>x</sub>."),
    Q("m2q419", "mt-komb", "SS 2016: Gesamtmatrix (A→M verschieben, dann 90° im UZS um M(3|3))?", "[[0, 1, 3], [−1, 0, 3], [0, 0, 1]]", ["[[0, −1, 3], [1, 0, 3], [0, 0, 1]]", "[[0, 1, 0], [−1, 0, 6], [0, 0, 1]]", "[[1, 0, 3], [0, 1, 3], [0, 0, 1]]"], "T<sub>(3,3)</sub>·D<sub>−90°</sub>·T<sub>(−3,−3)</sub>·T<sub>(3,3)</sub> = T<sub>(3,3)</sub>·D<sub>−90°</sub>."),
    Q("m2q420", "mt-komb", "SS 2016: Wohin kommt C(0|6)?", "(9|3)", ["(3|9)", "(−3|3)", "(6|0)"], "G·(0, 6, 1) = (6 + 3, 0 + 3, 1).")
  ],
  flashcards: [
    F("m2f401", "mt-lina", "Maple: Matrizenmultiplikation", "A . B (Punkt), Paket with(LinearAlgebra)"),
    F("m2f402", "mt-elem", "Spiegelungsmatrizen", "S<sub>x</sub> = [[1,0],[0,−1]] · S<sub>y</sub> = [[−1,0],[0,1]] · S<sub>xy</sub> = [[−1,0],[0,−1]]"),
    F("m2f403", "mt-elem", "Projektion auf y = kx", "1/(1 + k²)·[[1, k], [k, k²]]"),
    F("m2f404", "mt-dreh", "Drehmatrix gegen den UZS", "D<sub>α</sub> = [[cos α, −sin α], [sin α, cos α]]"),
    F("m2f405", "mt-dreh", "Orthonormalmatrix", "Spalten orthogonal, Länge 1, det = ±1, Längen und Winkel bleiben, A⁻¹ = Aᵀ"),
    F("m2f406", "mt-homo", "Homogene Koordinaten / Verschiebung", "(x|y|1) · V = [[1,0,v<sub>x</sub>],[0,1,v<sub>y</sub>],[0,0,1]]"),
    F("m2f407", "mt-komb", "Reihenfolge bei Kombination", "zuerst M, dann L → L·M·P (rechts wirkt zuerst)"),
    F("m2f408", "mt-komb", "Spiegelung an Gerade (Winkel α)", "[[cos 2α, sin 2α], [sin 2α, −cos 2α]] = D⁻¹·S<sub>x</sub>·D"),
    F("m2f409", "mt-komb", "Drehung um Punkt M", "T<sub>M</sub>·D<sub>α</sub>·T<sub>−M</sub>")
  ]
});
})();
