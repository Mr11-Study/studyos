/* MATH-2 · Kapitel 2: Interpolation und Ausgleichsrechnung (Skriptum Kap. 2, Folien „Numerische Mathematik“) */
(function () {
const EXT = window.STUDYOS_EXT = window.STUDYOS_EXT || {};
const { fr, mx, mat, Q, C, F } = window.M2;

(EXT.math2 = EXT.math2 || []).push({
  id: "m2-k2",
  topics: {
    "mt-ipol":   { name: "Interpolation mit Polynomen", lesson: "m22-1" },
    "mt-spline": { name: "Oszillation und Splines", lesson: "m22-2" },
    "mt-ls":     { name: "Ausgleichsgerade (kleinste Quadrate)", lesson: "m22-3" },
    "mt-fit":    { name: "Allgemeine und nichtlineare Ausgleichsrechnung", lesson: "m22-4" }
  },
  world: { id: "m2w2", n: 2, title: "Interpolation und Ausgleichsrechnung", sub: "Kurven durch Messpunkte legen: Polynome, Splines, kleinste Quadrate",
    boss: { id: "boss-m2w2", title: "Kapiteltest: Interpolation und Ausgleich", topics: ["mt-ipol", "mt-spline", "mt-ls", "mt-fit"] },
    lessons: [
  { id: "m22-1", title: "Interpolation mit Polynomen", topic: "mt-ipol", min: 12, xp: 0, blocks: [
    { t: "lead", html: "Messungen liefern einzelne Punkte, aber keine Formel. Wer den Wert <i>zwischen</i> zwei Messungen wissen will, braucht eine Kurve, die genau durch alle Punkte geht. Das nennt man <b>Interpolation</b>. Das Skriptum startet mit dem Bogen beim Schlossberglift in Graz: einzelne Punkte sind vermessen, gesucht ist eine Funktion für den ganzen Bogen." },
    { t: "text", h: "Stützstellen, Interpolation, Extrapolation", levels: {
      simple: "Die gegebenen Punkte heißen Stützstellen. Liegt die gesuchte Stelle zwischen ihnen, interpolierst du. Liegt sie außerhalb, extrapolierst du (das ist viel unsicherer).",
      normal: `Gegeben sind n Punkte (x<sub>i</sub> | y<sub>i</sub>), die <b>Stützstellen</b>. Gesucht ist eine Funktion p(x) mit${mx("p(x<sub>i</sub>) = y<sub>i</sub> &nbsp;&nbsp;für alle i")}Sie soll möglichst einfach sein und zwischen den Punkten „realistisch“ verlaufen. Liegt die gesuchte Stelle <b>zwischen</b> den Stützstellen, spricht man von <b>Interpolation</b>, liegt sie <b>außerhalb</b>, von <b>Extrapolation</b>.` } },
    { t: "text", h: "Zwei Punkte: eine Gerade", levels: {
      simple: "Durch 2 Punkte geht genau eine Gerade p(x) = kx + d. Steigung k = Höhenunterschied durch Breitenunterschied.",
      normal: `Durch zwei Punkte geht genau eine Gerade p(x) = k·x + d. Beide Punkte einsetzen gibt ein 2×2-Gleichungssystem. Subtrahiert man die Gleichungen, folgt${mx(`k = ${fr("y₁ − y₀", "x₁ − x₀")} &nbsp;&nbsp;und&nbsp;&nbsp; p(x) = ${fr("y₁ − y₀", "x₁ − x₀")}·(x − x₀) + y₀`)}Das ist die <b>lineare Interpolation</b>.` } },
    { t: "text", h: "Drei Punkte: eine Parabel, n Punkte: Grad n − 1", levels: {
      simple: "Durch 3 Punkte geht genau eine Parabel ax² + bx + c. Jeder Punkt gibt eine Gleichung, also 3 Gleichungen für 3 Unbekannte. Allgemein: n Punkte → Polynom vom Grad n − 1.",
      normal: `Für drei Punkte setzt man p(x) = a·x² + b·x + c an. Jeder Punkt liefert eine Gleichung:${mx("y₀ = a·x₀² + b·x₀ + c &nbsp;·&nbsp; y₁ = a·x₁² + b·x₁ + c &nbsp;·&nbsp; y₂ = a·x₂² + b·x₂ + c")}Allgemein: Zu <b>n</b> Punkten (mit verschiedenen x-Werten) gibt es genau ein Polynom vom <b>Grad n − 1</b> durch alle Punkte. Seine n Koeffizienten bestimmt man aus einem n×n-Gleichungssystem, in Maple mit einem einzigen Befehl.` },
      alt: [{ label: "Warum genau eines?", html: "Ein Polynom vom Grad n − 1 hat n Koeffizienten a<sub>0</sub> … a<sub>n−1</sub>. n Punkte geben n Gleichungen. Bei verschiedenen x-Werten ist dieses System immer eindeutig lösbar." }] },
    { t: "example", label: "Skriptum, Kapitel 2.2", title: "Parabel durch (0|0), (2|3), (5|7)", html: `Ansatz p(x) = ax² + bx + c. Aus (0|0): c = 0. Aus (2|3): 4a + 2b = 3. Aus (5|7): 25a + 5b = 7.<br>Lösung: a = −1/30, b = 47/30, also <b>p(x) = −x²/30 + 47x/30</b>.` },
    { t: "maple", title: "PolynomialInterpolation", code: ["with(CurveFitting):", "Punkte := [[0, 0], [2, 3], [5, 7]];", "p := PolynomialInterpolation(Punkte, x);", "eval(p, x = 3);", "plot([p, Punkte], x = -1..6, style = [line, point], color = [red, blue]);"], note: "Das Paket CurveFitting muss zuerst mit with(CurveFitting) geladen werden, sonst kennt Maple den Befehl nicht." },
    { t: "example", label: "Folien, Beispiel 5 Punkte", title: "(1|5), (2|6), (3|7), (4|6), (5|5)", html: `Polynom vom Grad 4: <b>p(x) = x⁴/6 − 2x³ + 47x²/6 − 11x + 10</b>. Bei so wenigen Punkten ist das Ergebnis „realistisch“: ein glatter Hügel durch alle Punkte.` },
    { t: "maple", code: ["with(CurveFitting):", "P5 := [[1, 5], [2, 6], [3, 7], [4, 6], [5, 5]]:", "p := PolynomialInterpolation(P5, x);", "plot([p, P5], x = 0.5..5.5, style = [line, point]);"] },
    C("Wie viele Punkte braucht man, damit genau ein Polynom vom Grad 3 durch sie geht?", "4", ["3", "5", "6"], "Grad n − 1 bei n Punkten: Grad 3 → 4 Punkte (4 Koeffizienten a, b, c, d)."),
    C("Gerade durch (1|2) und (3|8). Welchen Wert hat sie bei x = 2?", "5", ["4", "6", "10"], "k = (8 − 2)/(3 − 1) = 3, p(x) = 3(x − 1) + 2 → p(2) = 5."),
    { t: "keys", items: ["n Punkte → genau ein Polynom vom Grad n − 1 (x-Werte verschieden)", "Jeder Punkt liefert eine Gleichung p(x<sub>i</sub>) = y<sub>i</sub>", "Interpolation: innerhalb · Extrapolation: außerhalb der Stützstellen", "Maple: with(CurveFitting): PolynomialInterpolation(Punkte, x)"] }
  ] },
  { id: "m22-2", title: "Oszillation und Splines", topic: "mt-spline", min: 14, xp: 0, blocks: [
    { t: "lead", html: "Mehr Punkte sollten eine bessere Kurve geben, oder? Bei Polynomen leider nicht: mit 15 Punkten bekommt man ein Polynom vom Grad 14, und das schlägt an den Rändern wild aus. Die Lösung aus dem Schiffbau heißt <b>Spline</b>." },
    { t: "text", h: "Das Problem: Oszillation am Rand", levels: {
      simple: "Ein Polynom mit hohem Grad muss durch alle Punkte und schwingt dazwischen stark hin und her, vor allem am Rand. Das sieht unrealistisch aus.",
      normal: `Für n Stützstellen braucht man ein Polynom vom Grad n − 1. Bei vielen Punkten führt das zu <b>starken Abweichungen in den Randbereichen</b> (Skriptum Abb. 2.4, Folien „Interpolation mit 15 Punkten: Ergebnis ist unrealistisch!“). Dieser Effekt heißt <b>Oszillieren</b>. Die Idee „mehr Punkte = bessere Kurve“ funktioniert mit einem einzigen Polynom also nicht.` } },
    { t: "fig", id: "m2f-runge" },
    { t: "text", h: "Die Idee: stückweise kubisch", levels: {
      simple: "Statt einem großen Polynom nimmt man zwischen je zwei Nachbarpunkten ein eigenes kleines Polynom 3. Grades und klebt die Stücke glatt zusammen.",
      normal: `Ein <b>Spline</b> ist aus Polynomen niedrigen Grades <b>stückweise zusammengesetzt</b>. Am häufigsten ist der <b>kubische Spline</b>: zwischen zwei benachbarten Punkten liegt jeweils ein Polynom dritten Grades${mx("p<sub>i</sub>(x) = a<sub>i</sub> + b<sub>i</sub>x + c<sub>i</sub>x² + d<sub>i</sub>x³, &nbsp;&nbsp; x ∈ [x<sub>i</sub>, x<sub>i+1</sub>]")}Beim „Zusammenkleben“ in den inneren Punkten müssen <b>Funktionswerte</b>, <b>Steigungen</b> (1. Ableitung) und <b>Krümmungen</b> (2. Ableitung) übereinstimmen. Ein Spline ist also eine <b>glatte</b> Kurve ohne Knick.` },
      alt: [{ label: "Woher der Name kommt", html: "Spline heißt auf Deutsch Straklatte: eine dünne Holzlatte im Schiffbau, die an einzelnen Punkten fixiert wird und sich dazwischen von selbst glatt biegt. So entsteht die Kurve mit der kleinsten Biegeenergie, genau das rechnet der kubische Spline nach." }] },
    { t: "text", h: "Wie viele Gleichungen? 4(n − 1)", levels: {
      simple: "n Punkte → n − 1 Stücke, jedes hat 4 Unbekannte. Also 4(n − 1) Unbekannte, und man findet genau so viele Bedingungen.",
      normal: `Bei n Punkten gibt es n − 1 kubische Stücke mit je 4 Koeffizienten, also <b>4(n − 1) Unbekannte</b>. Die Gleichungen (Folien, Tabelle):<table class="tbl"><tr><th>Bedingung</th><th>Anzahl</th></tr><tr><td>Jedes Stück geht durch seine 2 Randpunkte</td><td>2(n − 1)</td></tr><tr><td>Gleiche Steigung in den inneren Punkten</td><td>n − 2</td></tr><tr><td>Gleiche Krümmung in den inneren Punkten</td><td>n − 2</td></tr><tr><td>Zwei Randbedingungen (z. B. Krümmung = 0)</td><td>2</td></tr><tr><td><b>Summe</b></td><td><b>4n − 4</b></td></tr></table>Die zwei Randbedingungen sind wählbar: <b>natürlicher Spline</b> (Krümmung 0 in beiden Randpunkten, Standard in Maple) oder <b>periodischer Spline</b> (Steigung und Krümmung am Anfang wie am Ende, für periodische Vorgänge).` } },
    { t: "fig", id: "m2f-spline" },
    { t: "maple", title: "Spline in Maple (Skriptum)", code: ["with(CurveFitting):", "Punkte := [[1, 2], [2, 6], [4, 5], [6, 13], [7, 18], [10, 20]]:", "s := Spline(Punkte, x);", "eval(s, x = 3);", "plot([s, PolynomialInterpolation(Punkte, x), Punkte], x = 1..10, style = [line, line, point], color = [red, blue, black], legend = [\"Spline\", \"Polynom\", \"Punkte\"]);"], note: "Spline liefert eine stückweise definierte Funktion (piecewise). Weitere Varianten: Spline(Punkte, x, degree = 1) ist ein Polygonzug, endpoints = 'periodic' ein periodischer Spline." },
    { t: "warnbox", html: "<b>Achtung:</b> Splines eignen sich nicht zum Extrapolieren. Außerhalb der Stützstellen setzt Maple einfach das erste bzw. letzte kubische Stück fort, und das hat mit den Daten nichts mehr zu tun." },
    C("Wie viele Unbekannte hat ein kubischer Spline durch 6 Punkte?", "20", ["24", "18", "15"], "6 Punkte → 5 Stücke à 4 Koeffizienten = 4(n − 1) = 20."),
    C("Was bedeutet „natürlicher“ Spline?", "Die Krümmung ist in den beiden Randpunkten 0", ["Er geht durch den Ursprung", "Alle Stücke sind Geraden", "Er ist periodisch"], "Die zwei fehlenden Gleichungen sind p″₁(x₁) = 0 und p″ₙ₋₁(xₙ) = 0."),
    C("Was stimmt an einem inneren Klebepunkt eines kubischen Splines NICHT unbedingt überein?", "Die dritte Ableitung", ["Der Funktionswert", "Die Steigung", "Die Krümmung"], "Gefordert sind nur Wert, 1. und 2. Ableitung. Die 3. Ableitung springt im Allgemeinen."),
    { t: "keys", items: ["Polynome hohen Grades oszillieren am Rand", "Kubischer Spline: zwischen je 2 Punkten ein Polynom 3. Grades", "Glatt: Wert, Steigung und Krümmung stimmen an inneren Punkten überein", "4(n − 1) Unbekannte · natürlich: p″ = 0 am Rand · periodisch", "Maple: Spline(Punkte, x) · nicht extrapolieren!"] }
  ] },
  { id: "m22-3", title: "Ausgleichsgerade: Methode der kleinsten Quadrate", topic: "mt-ls", min: 15, xp: 0, blocks: [
    { t: "lead", html: "Echte Messwerte streuen. Eine Kurve, die stur durch jeden Punkt geht, würde jedes Rauschen mitmachen. Bei der <b>Ausgleichsrechnung</b> gibt man den Typ der Funktion vor (z. B. eine Gerade) und sucht die, die <b>am besten</b> zu allen Punkten passt." },
    { t: "text", h: "Was heißt „am besten“?", levels: {
      simple: "Für jeden Punkt misst man den senkrechten Abstand zur Geraden, quadriert ihn und zählt alles zusammen. Die beste Gerade macht diese Summe so klein wie möglich.",
      normal: `Gesucht ist f(x) = a·x + b. Der Fehler beim Punkt i ist der <b>senkrechte (vertikale) Abstand</b> f(x<sub>i</sub>) − y<sub>i</sub>. Normalabstände nimmt man nicht, weil sie den Fehler im y-Wert nicht korrekt erfassen. Damit sich positive und negative Fehler nicht aufheben, werden sie quadriert:${mx(`F(a, b) = Σ<sub>i=1</sub><sup>n</sup> (a·x<sub>i</sub> + b − y<sub>i</sub>)² &nbsp;→&nbsp; min`)}Das ist die <b>Methode der kleinsten Fehlerquadrate</b> (Least Squares).` } },
    { t: "fig", id: "m2f-ls" },
    { t: "text", h: "Die Normalgleichungen", levels: {
      simple: "F(a, b) ist eine Funktion von zwei Variablen. Minimum: beide partiellen Ableitungen null setzen (Kapitel 1!). Das gibt zwei lineare Gleichungen für a und b.",
      normal: `F(a, b) ist eine Funktion mit zwei Variablen, das Minimum findet man wie in Kapitel 1 über F<sub>a</sub> = 0 und F<sub>b</sub> = 0:${mx("F<sub>a</sub> = 2·Σ(a·x<sub>i</sub> + b − y<sub>i</sub>)·x<sub>i</sub> = 0 &nbsp;&nbsp;·&nbsp;&nbsp; F<sub>b</sub> = 2·Σ(a·x<sub>i</sub> + b − y<sub>i</sub>) = 0")}Umgeformt ergibt das die <b>Normalgleichungen</b>:${mx(`${mat([["Σx<sub>i</sub>²", "Σx<sub>i</sub>"], ["Σx<sub>i</sub>", "n"]])} · ${mat([["a"], ["b"]])} = ${mat([["Σx<sub>i</sub>y<sub>i</sub>"], ["Σy<sub>i</sub>"]])}`)}` } },
    { t: "example", label: "Skriptum, Beispiel 2.1", title: "Ausgleichsgerade durch 6 Punkte", html: `<table class="tbl"><tr><th>x<sub>i</sub></th><td>1</td><td>2</td><td>4</td><td>6</td><td>7</td><td>9</td></tr><tr><th>y<sub>i</sub></th><td>2</td><td>3</td><td>3</td><td>6</td><td>8</td><td>10</td></tr></table>Σx<sub>i</sub>² = 187, Σx<sub>i</sub> = 29, Σx<sub>i</sub>y<sub>i</sub> = 202, Σy<sub>i</sub> = 32, n = 6.<br>187a + 29b = 202 &nbsp;und&nbsp; 29a + 6b = 32 &nbsp;→&nbsp; <b>a = 284/281 ≈ 1.0107, b = 126/281 ≈ 0.4484</b>.<br>Ausgleichsgerade: f(x) ≈ 1.01·x + 0.448.` },
    { t: "maple", title: "Mit LeastSquares (ein Befehl)", code: ["with(CurveFitting):", "Punkte := [[1, 2], [2, 3], [4, 3], [6, 6], [7, 8], [9, 10]]:", "g := LeastSquares(Punkte, x, curve = a*x + b);", "evalf(g);", "plot([g, Punkte], x = 0..10, style = [line, point], color = [red, blue]);"] },
    { t: "maple", title: "Zum Verständnis: selbst minimieren", code: ["Punkte := [[1, 2], [2, 3], [4, 3], [6, 6], [7, 8], [9, 10]]:", "F := add((a*Punkte[i][1] + b - Punkte[i][2])^2, i = 1..6);", "solve({diff(F, a) = 0, diff(F, b) = 0}, {a, b});"], note: "Genau die Herleitung aus dem Skriptum: Fehlerquadratsumme aufstellen, partiell ableiten, null setzen." },
    C("Welche Abstände werden bei der Methode der kleinsten Quadrate quadriert?", "Die senkrechten (vertikalen) Abstände f(x<sub>i</sub>) − y<sub>i</sub>", ["Die Normalabstände zur Geraden", "Die waagrechten Abstände", "Die Abstände zum Ursprung"], "Gemessen wird der Fehler im y-Wert, also vertikal."),
    C("Warum werden die Fehler quadriert?", "Damit sich positive und negative Abweichungen nicht aufheben", ["Damit die Gerade durch den Ursprung geht", "Weil Maple keine Beträge kann", "Damit das Ergebnis ganzzahlig wird"], "Außerdem ist die Quadratsumme differenzierbar, man kann also mit F<sub>a</sub> = F<sub>b</sub> = 0 arbeiten."),
    { t: "keys", items: ["Ausgleich: Funktionstyp vorgegeben, nicht durch alle Punkte", "Minimiere F(a, b) = Σ(a·x<sub>i</sub> + b − y<sub>i</sub>)²", "F<sub>a</sub> = F<sub>b</sub> = 0 → Normalgleichungen (2×2-System)", "Beispiel 2.1: f(x) ≈ 1.0107x + 0.4484", "Maple: LeastSquares(Punkte, x, curve = a*x + b)"] }
  ] },
  { id: "m22-4", title: "Allgemeine und nichtlineare Ausgleichsrechnung", topic: "mt-fit", min: 16, xp: 0, blocks: [
    { t: "lead", html: "Nicht alles wächst linear: Bevölkerungen, Infektionszahlen oder Zinsen wachsen exponentiell. Die Ausgleichsrechnung funktioniert mit fast jeder Modellfunktion, man muss nur wissen, welcher Maple-Befehl wann passt." },
    { t: "text", h: "Linear in den Parametern: LeastSquares", levels: {
      simple: "Wenn die Unbekannten a, b, c nur als Faktoren vor festen Funktionen stehen (a·x² + b·x + c oder a + b·eˣ), reicht LeastSquares.",
      normal: `LeastSquares funktioniert für jede <b>Linearkombination</b> fester Funktionen:${mx("f(x) = a₁·f₁(x) + a₂·f₂(x) + … + a<sub>n</sub>·f<sub>n</sub>(x)")}Die f<sub>i</sub>(x) dürfen beliebig sein (x², eˣ, sin x, …), aber sie dürfen <b>nicht von den Parametern abhängen</b>. Beispiele: a·x² + b·x + c (Ausgleichsparabel) oder a + b·eˣ. Man nennt das <b>lineare Ausgleichsrechnung</b>, weil das Modell linear in a₁ … a<sub>n</sub> ist.` } },
    { t: "maple", title: "Ausgleichsparabel", code: ["with(CurveFitting):", "Punkte := [[1, 2], [2, 3], [4, 3], [6, 6], [7, 8], [9, 10]]:", "q := LeastSquares(Punkte, x, curve = a*x^2 + b*x + c);", "plot([q, Punkte], x = 0..10, style = [line, point]);"] },
    { t: "text", h: "Nichtlinear in den Parametern: NonlinearFit", levels: {
      simple: "Bei a·e<sup>b·x</sup> steckt b im Exponenten. Das ist nicht mehr linear in b, LeastSquares geht nicht. Dafür gibt es NonlinearFit aus dem Paket Statistics.",
      normal: `Beim Modell p(x) = a·e<sup>b·x</sup> steht der Parameter b <b>im Exponenten</b>. Das Modell ist nicht linear in a und b, LeastSquares ist also nicht verwendbar. Dafür gibt es <code>NonlinearFit</code> aus dem Paket <b>Statistics</b>: Es minimiert dieselbe Fehlerquadratsumme, aber iterativ (schrittweise Verbesserung ausgehend von Startwerten).` } },
    { t: "example", label: "Folien: Corona-Daten (ORF, bis 17.3.2020)", title: "Exponentielles Wachstum in den ersten 21 Tagen", html: `Infizierte pro Tag: 2, 2, 3, 9, 14, 18, 21, 29, 41, 55, 79, 104, 131, 182, 246, 302, 504, 655, 860, 1016, 1332.<br>Annahme: p(x) = a·e<sup>b·x</sup> mit x = Tag 1 … 21. NonlinearFit liefert etwa <b>a ≈ 4.64, b ≈ 0.271</b>. Verdopplungszeit: ln 2 / b ≈ 2.6 Tage.` },
    { t: "maple", title: "NonlinearFit", code: ["with(Statistics):", "X := Vector([seq(i, i = 1..21)]):", "Y := Vector([2, 2, 3, 9, 14, 18, 21, 29, 41, 55, 79, 104, 131, 182, 246, 302, 504, 655, 860, 1016, 1332]):", "f := NonlinearFit(a*exp(b*x), X, Y, x);", "plot([f, [seq([X[i], Y[i]], i = 1..21)]], x = 0..22, style = [line, point], color = [red, blue]);"] },
    { t: "fig", id: "m2f-fit" },
    { t: "example", label: "Altprüfung SS 2012, Aufgabe 4", title: "Bevölkerung Nigeria, y(x) = a + b·eˣ", html: `<table class="tbl"><tr><th>Jahr</th><td>1950</td><td>1960</td><td>1970</td><td>1980</td><td>1990</td></tr><tr><th>Tsd.</th><td>32935</td><td>42305</td><td>55070</td><td>72024</td><td>96154</td></tr></table><b>Trick:</b> x in Jahrzehnten ab 1950 zählen (x = 0, 1, 2, 3, 4). Sonst wird eˣ bei x = 1990 astronomisch groß.<br>a + b·eˣ ist linear in a und b → LeastSquares: y(x) ≈ 41179.1 + 1078.19·eˣ.<br>Schätzung 2000 (x = 5): <b>≈ 201 215 Tsd.</b> · 2010 (x = 6): <b>≈ 476 169 Tsd.</b><br>Linear (a + b·x): y ≈ 28466.2 + 15615.7·x → 2000: <b>106 544.7</b>, 2010: <b>122 160.4</b>. Das exponentielle Modell wächst viel schneller.` },
    { t: "maple", code: ["with(CurveFitting):", "P := [[0, 32935], [1, 42305], [2, 55070], [3, 72024], [4, 96154]]:", "y1 := LeastSquares(P, x, curve = a + b*exp(x));", "evalf(eval(y1, x = 5));  evalf(eval(y1, x = 6));", "y2 := LeastSquares(P, x, curve = a + b*x);", "eval(y2, x = 5);  eval(y2, x = 6);", "plot([y1, y2, P], x = 0..6, style = [line, line, point], legend = [\"exponentiell\", \"linear\", \"Daten\"]);"] },
    C("Welches Modell kann man NICHT mit LeastSquares anpassen?", "a·e<sup>b·x</sup>", ["a + b·eˣ", "a·x² + b·x + c", "a·sin(x) + b·cos(x)"], "Bei a·e<sup>bx</sup> steht b im Exponenten, das Modell ist nicht linear in den Parametern → NonlinearFit."),
    C("Warum zählt man bei der Nigeria-Aufgabe x in Jahrzehnten ab 1950?", "Damit eˣ nicht riesig wird und die Rechnung stabil bleibt", ["Weil Maple keine Jahreszahlen kennt", "Weil sonst die Daten nicht linear sind", "Weil die Angabe es verlangt"], "e<sup>1990</sup> wäre eine Zahl mit über 800 Stellen; mit x = 0 … 4 bleibt alles gut rechenbar."),
    { t: "keys", items: ["Linear in den Parametern (Σ a<sub>i</sub>·f<sub>i</sub>(x)) → LeastSquares (CurveFitting)", "Parameter im Exponenten o. ä. → NonlinearFit (Statistics)", "Exponentielles Modell a·e<sup>bx</sup>: Verdopplungszeit ln 2 / b", "Für Prognosen x skalieren (z. B. Jahrzehnte ab Startjahr)"] }
  ] },
  { id: "m22-5", title: "Prüfungsaufgabe: Cosinusbogen durch Parabel annähern", topic: "mt-ipol", min: 12, xp: 0, blocks: [
    { t: "lead", html: "Altprüfung SS 2016, Aufgabe 3 (3 Punkte): Der Bogen von f(x) = cos(x) auf [−π/2, π/2] soll durch eine Parabel durch 3 Punkte angenähert werden. Gesucht: die Parabel und die <b>größte Abweichung</b> max |f(x) − p(x)|." },
    { t: "text", h: "Schritt 1: drei sinnvolle Punkte wählen", levels: {
      simple: "Nimm die beiden Nullstellen und den Gipfel: (−π/2 | 0), (0 | 1), (π/2 | 0).",
      normal: `Am einfachsten sind die beiden Randpunkte und der Scheitel: (−π/2 | 0), (0 | 1) und (π/2 | 0). Wegen der Symmetrie ist p(x) = a·x² + 1 mit p(π/2) = 0, also${mx(`p(x) = 1 − ${fr("4x²", "π²")} ≈ 1 − 0.4052847346·x²`)}` } },
    { t: "text", h: "Schritt 2: größte Abweichung finden", levels: {
      simple: "Abweichung d(x) = cos(x) − p(x). Ableitung null setzen, das gibt die Stelle mit der größten Abweichung (x ≈ ±1.0988), Wert ≈ 0.056.",
      normal: `Die Abweichungsfunktion d(x) = cos(x) − p(x) ist an den drei Stützstellen null. Dazwischen hat sie Extremwerte, die man über d′(x) = 0 findet. Mit fsolve: x ≈ ±1.0988. Dort ist |d| ≈ <b>0.05601</b>. Bei x = 0 ist die Abweichung 0 (Stützstelle).` } },
    { t: "maple", title: "Komplette Lösung", code: ["with(CurveFitting):", "p := PolynomialInterpolation([[-Pi/2, 0], [0, 1], [Pi/2, 0]], x);", "d := cos(x) - p:", "x0 := fsolve(diff(d, x) = 0, x = 0.5..1.5);", "evalf(eval(d, x = x0));", "plot([cos(x), p], x = -Pi/2..Pi/2, color = [blue, red], legend = [\"cos(x)\", \"p(x)\"]);", "plot(abs(d), x = -Pi/2..Pi/2, title = \"Abweichung |cos(x) - p(x)|\");"] },
    { t: "tip", html: "In der Prüfung zählen bei solchen Aufgaben drei Dinge: der Ansatz (welche Punkte, welche Funktion), das Maple-Ergebnis und ein Satz zur Interpretation („Die größte Abweichung beträgt etwa 0.056 bei x ≈ ±1.10“). Eine Grafik mit beiden Kurven sichert zusätzlich ab." },
    C("Welche Parabel geht durch (−π/2|0), (0|1), (π/2|0)?", "p(x) = 1 − 4x²/π²", ["p(x) = 1 − x²", "p(x) = 1 − 2x²/π", "p(x) = cos(x)²"], "p(x) = ax² + 1 mit a·π²/4 + 1 = 0 → a = −4/π²."),
    C("Wie bestimmt man die Stelle der größten Abweichung zwischen cos(x) und p(x)?", "d(x) = cos(x) − p(x) ableiten und d′(x) = 0 lösen", ["cos(x) = p(x) lösen", "p′(x) = 0 lösen", "Den Mittelwert der Stützstellen nehmen"], "cos(x) = p(x) liefert die Stellen ohne Abweichung; die maximale Abweichung liegt bei d′(x) = 0 (oder am Rand)."),
    { t: "keys", items: ["Stützstellen klug wählen (Symmetrie, Nullstellen, Scheitel)", "Abweichung d(x) = f(x) − p(x), Extremum über d′(x) = 0 (fsolve mit Bereich)", "Ergebnis hier: max |cos x − p(x)| ≈ 0.056 bei x ≈ ±1.099"] }
  ] }
  ] },
  questions: [
    Q("m2q201", "mt-ipol", "Wie heißt das Schätzen eines Werts außerhalb der gegebenen Stützstellen?", "Extrapolation", ["Interpolation", "Approximation", "Integration"], "Innerhalb: Interpolation, außerhalb: Extrapolation."),
    Q("m2q202", "mt-ipol", "Welchen Grad hat das Interpolationspolynom durch 7 Punkte (verschiedene x)?", "6", ["7", "5", "3"], "n Punkte → Grad n − 1."),
    Q("m2q203", "mt-ipol", "Gerade durch (2|1) und (6|9). Wie lautet p(x)?", "p(x) = 2x − 3", ["p(x) = 2x + 1", "p(x) = 4x − 7", "p(x) = x/2"], "k = (9 − 1)/(6 − 2) = 2, d = 1 − 2·2 = −3."),
    Q("m2q204", "mt-ipol", "Parabel durch (0|0), (1|1), (2|4)?", "p(x) = x²", ["p(x) = 2x", "p(x) = x² + x", "p(x) = 2x² − x"], "c = 0, a + b = 1, 4a + 2b = 4 → a = 1, b = 0."),
    Q("m2q205", "mt-ipol", "Welches Paket muss man für PolynomialInterpolation laden?", "CurveFitting", ["LinearAlgebra", "Statistics", "plots"], "with(CurveFitting) enthält PolynomialInterpolation, Spline und LeastSquares."),
    Q("m2q206", "mt-ipol", "Wie viele Gleichungen braucht man für eine Parabel durch 3 Punkte?", "3", ["2", "4", "6"], "3 Unbekannte a, b, c → 3 Gleichungen (eine pro Punkt)."),
    Q("m2q207", "mt-spline", "Was passiert bei Interpolation mit einem Polynom durch sehr viele Punkte typischerweise?", "Starke Schwingungen (Oszillation) an den Rändern", ["Die Kurve wird immer genauer", "Die Kurve wird zur Geraden", "Maple bricht ab"], "Folien: „Interpolation mit 15 Punkten: Ergebnis ist unrealistisch!“"),
    Q("m2q208", "mt-spline", "Aus welchen Stücken besteht ein kubischer Spline?", "Polynomen 3. Grades zwischen je zwei Nachbarpunkten", ["Einem einzigen Polynom 3. Grades", "Geradenstücken", "Kreisbögen"], "Zwischen x<sub>i</sub> und x<sub>i+1</sub> jeweils ein eigenes kubisches Polynom."),
    Q("m2q209", "mt-spline", "Wie viele Bedingungen „gleiche Steigung“ gibt es bei einem kubischen Spline durch n Punkte?", "n − 2", ["n − 1", "n", "2(n − 1)"], "Nur an den inneren Punkten, und davon gibt es n − 2."),
    Q("m2q210", "mt-spline", "Ein kubischer Spline durch 4 Punkte hat wie viele Unbekannte?", "12", ["16", "9", "8"], "4(n − 1) = 4·3 = 12."),
    Q("m2q211", "mt-spline", "Wofür sind Splines NICHT geeignet?", "Zum Extrapolieren", ["Zum Interpolieren", "Für glatte Kurven durch viele Punkte", "Für Kurven im Schiffbau"], "Skriptum: „Splines können nicht zum Extrapolieren verwendet werden!“"),
    Q("m2q212", "mt-spline", "Welche Randbedingung hat ein periodischer Spline?", "Steigung und Krümmung am ersten und letzten Punkt stimmen überein", ["Krümmung 0 an beiden Rändern", "Steigung 0 an beiden Rändern", "Der Spline geht durch den Ursprung"], "p′₁(x₁) = p′<sub>n−1</sub>(x<sub>n</sub>) und p″₁(x₁) = p″<sub>n−1</sub>(x<sub>n</sub>)."),
    Q("m2q213", "mt-spline", "Was liefert Spline(Punkte, x, degree = 1)?", "Einen Polygonzug (stückweise linear)", ["Eine Ausgleichsgerade", "Ein Polynom vom Grad 1 durch alle Punkte", "Eine Fehlermeldung"], "degree = 1: zwischen den Punkten gerade Linien."),
    Q("m2q214", "mt-ls", "Was wird bei der Methode der kleinsten Quadrate minimiert?", "Σ (f(x<sub>i</sub>) − y<sub>i</sub>)²", ["Σ |x<sub>i</sub> − y<sub>i</sub>|", "max |f(x<sub>i</sub>) − y<sub>i</sub>|", "Σ (f(x<sub>i</sub>) − y<sub>i</sub>)"], "Summe der quadrierten vertikalen Fehler."),
    Q("m2q215", "mt-ls", "Wie viele Unbekannte hat das Gleichungssystem für eine Ausgleichsgerade?", "2", ["n", "3", "1"], "a und b, egal wie viele Punkte."),
    Q("m2q216", "mt-ls", "Normalgleichungen der Ausgleichsgeraden: Was steht in der Matrix rechts unten?", "n (Anzahl der Punkte)", ["Σx<sub>i</sub>²", "Σy<sub>i</sub>", "0"], "Σ 1 über alle Punkte = n."),
    Q("m2q217", "mt-ls", "Ausgleichsgerade aus Beispiel 2.1 (Skriptum)?", "f(x) ≈ 1.0107x + 0.4484", ["f(x) ≈ 0.4484x + 1.0107", "f(x) ≈ x + 1", "f(x) ≈ 1.2x − 0.3"], "a = 284/281, b = 126/281."),
    Q("m2q218", "mt-ls", "Ausgleichsgerade durch (0|1), (1|3), (2|5)?", "y = 2x + 1", ["y = 2x", "y = x + 2", "y = 3x + 1"], "Die Punkte liegen exakt auf y = 2x + 1, dann ist der Fehler 0."),
    Q("m2q219", "mt-ls", "Wie lautet der Maple-Befehl für eine Ausgleichsgerade?", "LeastSquares(Punkte, x, curve = a*x + b)", ["PolynomialInterpolation(Punkte, x)", "Spline(Punkte, x)", "fit(Punkte, line)"], "Paket CurveFitting."),
    Q("m2q220", "mt-fit", "Welches Modell ist linear in den Parametern?", "a + b·eˣ", ["a·e<sup>bx</sup>", "a·sin(b·x)", "a/(1 + e<sup>−bx</sup>)"], "eˣ hängt nicht von a oder b ab, a und b stehen nur als Faktoren."),
    Q("m2q221", "mt-fit", "In welchem Paket steckt NonlinearFit?", "Statistics", ["CurveFitting", "LinearAlgebra", "Optimization"], "with(Statistics): NonlinearFit(a*exp(b*x), X, Y, x)."),
    Q("m2q222", "mt-fit", "Exponentielles Wachstum a·e<sup>0.25·x</sup> (x in Tagen). Verdopplungszeit?", "≈ 2.77 Tage", ["4 Tage", "0.25 Tage", "≈ 1.39 Tage"], "ln 2 / 0.25 ≈ 2.77."),
    Q("m2q223", "mt-fit", "Nigeria-Aufgabe: Welches Wachstumsmodell liefert für 2010 die größere Schätzung?", "exponentiell (a + b·eˣ)", ["linear (a + b·x)", "beide gleich", "keins, Extrapolation ist verboten"], "≈ 476 169 Tsd. gegenüber ≈ 122 160 Tsd. linear."),
    Q("m2q224", "mt-ipol", "SS 2016: Größte Abweichung zwischen cos(x) und der Parabel durch (−π/2|0), (0|1), (π/2|0)?", "≈ 0.056", ["≈ 0.5", "0", "≈ 0.21"], "Bei x ≈ ±1.0988, d′(x) = 0.")
  ],
  flashcards: [
    F("m2f201", "mt-ipol", "Interpolation vs. Extrapolation", "Schätzung zwischen den Stützstellen vs. außerhalb davon"),
    F("m2f202", "mt-ipol", "Interpolationspolynom", "n Punkte (x verschieden) → genau ein Polynom vom Grad n − 1"),
    F("m2f203", "mt-ipol", "Lineare Interpolation", "p(x) = (y₁ − y₀)/(x₁ − x₀)·(x − x₀) + y₀"),
    F("m2f204", "mt-ipol", "Maple: Interpolationspolynom", "with(CurveFitting): PolynomialInterpolation([[x1,y1], …], x)"),
    F("m2f205", "mt-spline", "Oszillation", "Polynome hohen Grades schwingen am Rand stark → Splines verwenden"),
    F("m2f206", "mt-spline", "Kubischer Spline", "stückweise Polynome 3. Grades; Wert, Steigung, Krümmung an inneren Punkten gleich; 4(n − 1) Unbekannte"),
    F("m2f207", "mt-spline", "Natürlicher vs. periodischer Spline", "natürlich: p″ = 0 an beiden Rändern · periodisch: p′ und p″ am Anfang = am Ende"),
    F("m2f208", "mt-ls", "Methode der kleinsten Quadrate", "min Σ (f(x<sub>i</sub>) − y<sub>i</sub>)², vertikale Fehler"),
    F("m2f209", "mt-ls", "Normalgleichungen Ausgleichsgerade", "Σx²·a + Σx·b = Σxy · Σx·a + n·b = Σy"),
    F("m2f210", "mt-fit", "LeastSquares vs. NonlinearFit", "linear in den Parametern → LeastSquares (CurveFitting) · sonst NonlinearFit (Statistics)")
  ]
});
})();
