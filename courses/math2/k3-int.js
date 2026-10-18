/* MATH-2 · Kapitel 3: Integralrechnung (Skriptum Kap. 3, Folien „Integralrechnung“) */
(function () {
const EXT = window.STUDYOS_EXT = window.STUDYOS_EXT || {};
const { fr, mx, int, Q, C, F } = window.M2;

(EXT.math2 = EXT.math2 || []).push({
  id: "m2-k3",
  topics: {
    "mt-riem":  { name: "Vom Rechteck zum Integral", lesson: "m23-1" },
    "mt-stamm": { name: "Stammfunktion und Hauptsatz", lesson: "m23-2" },
    "mt-flae":  { name: "Flächen zwischen Kurven, Mittelwert", lesson: "m23-3" },
    "mt-dopp":  { name: "Doppelintegral und Schwerpunkt", lesson: "m23-4" },
    "mt-bogen": { name: "Bogenlänge", lesson: "m23-5" },
    "mt-rot":   { name: "Rotationskörper", lesson: "m23-6" }
  },
  world: { id: "m2w3", n: 3, title: "Integralrechnung", sub: "Flächen, Schwerpunkte, Bogenlängen und Rotationskörper",
    boss: { id: "boss-m2w3", title: "Kapiteltest: Integralrechnung", topics: ["mt-riem", "mt-stamm", "mt-flae", "mt-dopp", "mt-bogen", "mt-rot"] },
    lessons: [
  { id: "m23-1", title: "Vom Rechteck zum Integral", topic: "mt-riem", min: 12, xp: 0, blocks: [
    { t: "lead", html: "Ein Auto fährt mit konstant 50 km/h zwei Stunden lang: 100 km, also Geschwindigkeit mal Zeit, die Rechteckfläche im v-t-Diagramm. Aber was, wenn sich die Geschwindigkeit ständig ändert? Dann ist der Weg die <b>Fläche unter der Kurve</b>, und genau die berechnet das Integral." },
    { t: "text", h: "Fläche durch Rechtecke annähern", levels: {
      simple: "Zerlege die Fläche unter der Kurve in schmale Rechtecke und zähle ihre Flächen zusammen. Je schmaler die Rechtecke, desto genauer das Ergebnis.",
      normal: `Teilt man [a, b] in n gleich breite Streifen der Breite Δx = (b − a)/n, mit x<sub>k</sub> = a + k·Δx, so ist jede Rechteckfläche f(x<sub>k</sub>)·Δx und${mx("A ≈ Σ<sub>k=1</sub><sup>n</sup> f(x<sub>k</sub>)·Δx")}Je mehr Rechtecke, desto genauer. Lässt man n → ∞ gehen (unendlich viele, unendlich schmale Rechtecke), erhält man die exakte Fläche, das <b>bestimmte Integral</b>:${mx(`${int("a", "b")} f(x) dx = lim<sub>n→∞</sub> Σ<sub>k=1</sub><sup>n</sup> f(x<sub>k</sub>)·Δx`)}` } },
    { t: "fig", id: "m2f-riemann" },
    { t: "example", label: "Skriptum, Beispiel 3.1", title: "∫₀¹ x dx „zu Fuß“", html: `Δx = 1/n, x<sub>k</sub> = k/n. Dann ist${mx(`Σ<sub>k=1</sub><sup>n</sup> ${fr("k", "n")}·${fr("1", "n")} = ${fr("1", "n²")}·Σk = ${fr("1", "n²")}·${fr("n(n + 1)", "2")} = ${fr("n + 1", "2n")}`)}Für n → ∞ geht das gegen <b>1/2</b>, die Fläche des Dreiecks mit Grundlinie 1 und Höhe 1.` },
    { t: "maple", title: "Riemann-Summe in Maple", code: ["R := sum(k/n * 1/n, k = 1..n);", "limit(R, n = infinity);", "evalf(eval(R, n = 10));  evalf(eval(R, n = 1000));", "int(x, x = 0..1);"], note: "sum mit symbolischer Obergrenze n verwendet die Summenformeln; limit lässt n gegen unendlich gehen." },
    C("Was passiert mit der Rechtecksumme, wenn man die Anzahl n der Rechtecke erhöht?", "Sie nähert sich der exakten Fläche", ["Sie wird immer größer", "Sie bleibt gleich", "Sie geht gegen 0"], "Mehr, schmalere Rechtecke decken die Fläche genauer ab, im Grenzwert erhält man das Integral."),
    C("Ein Auto fährt nach dem Diagramm v(t). Was gibt ∫ v(t) dt von t₁ bis t₂ an?", "Den zurückgelegten Weg", ["Die Durchschnittsgeschwindigkeit", "Die Beschleunigung", "Die Höchstgeschwindigkeit"], "Fläche unter v(t) = Weg. Teilt man durch (t₂ − t₁), erhält man die Durchschnittsgeschwindigkeit."),
    { t: "keys", items: ["Fläche ≈ Summe von Rechtecken f(x<sub>k</sub>)·Δx", "Integral = Grenzwert dieser Summe für n → ∞", "∫₀¹ x dx = 1/2 (Beispiel 3.1)", "Weg = Fläche unter dem v-t-Diagramm"] }
  ] },
  { id: "m23-2", title: "Stammfunktion und Hauptsatz", topic: "mt-stamm", min: 14, xp: 0, blocks: [
    { t: "lead", html: "Rechtecke summieren ist mühsam. Der <b>Hauptsatz der Differenzial- und Integralrechnung</b> zeigt: Integrieren ist die Umkehrung des Differenzierens. Damit wird aus einer unendlichen Summe eine einfache Differenz." },
    { t: "text", h: "Der Hauptsatz", levels: {
      simple: "Finde eine Funktion F, deren Ableitung f ist (die Stammfunktion). Dann ist die Fläche einfach F(b) − F(a).",
      normal: `Ist F eine <b>Stammfunktion</b> von f, also F′(x) = f(x), dann gilt${mx(`${int("a", "b")} f(x) dx = F(b) − F(a) = [F(x)]<sub>a</sub><sup>b</sup>`)}Stammfunktionen sind nur <b>bis auf eine Konstante</b> eindeutig: (x²/2)′ = x und (x²/2 + 5)′ = x. Darum schreibt man das <b>unbestimmte Integral</b> als${mx("∫ f(x) dx = F(x) + c")}` } },
    { t: "html", html: `<div class="card"><h3>Grundintegrale (Tabelle)</h3><table class="tbl"><tr><th>f(x)</th><th>∫ f(x) dx</th></tr><tr><td>xⁿ (n ≠ −1)</td><td>xⁿ⁺¹/(n + 1) + c</td></tr><tr><td>1/x</td><td>ln|x| + c</td></tr><tr><td>eˣ</td><td>eˣ + c</td></tr><tr><td>e<sup>a·x</sup></td><td>e<sup>a·x</sup>/a + c</td></tr><tr><td>sin x</td><td>−cos x + c</td></tr><tr><td>cos x</td><td>sin x + c</td></tr><tr><td>aˣ</td><td>aˣ/ln a + c</td></tr></table><p class="muted" style="margin-top:8px">Rechenregeln: ∫(f + g) = ∫f + ∫g, ∫k·f = k·∫f, ∫<sub>a</sub><sup>b</sup> = −∫<sub>b</sub><sup>a</sup>, ∫<sub>a</sub><sup>b</sup> + ∫<sub>b</sub><sup>c</sup> = ∫<sub>a</sub><sup>c</sup>.</p></div>` },
    { t: "example", label: "Rechenbeispiel", title: "∫₁³ (3x² − 2x) dx", html: `Stammfunktion: F(x) = x³ − x².<br>F(3) − F(1) = (27 − 9) − (1 − 1) = <b>18</b>.` },
    { t: "maple", title: "int, Int und value", code: ["int(x^2, x);", "int(exp(2*x), x);  int(x*exp(x), x);", "int(3*x^2 - 2*x, x = 1..3);", "Int(sin(x), x = 0..Pi);  value(%);"], note: "int rechnet sofort. Int (großes I) zeigt das Integral nur an; mit value(%) wird es ausgewertet. Maple schreibt keine Konstante + c dazu." },
    { t: "example", label: "Folien: Integrale mit Maple", title: "Fläche eines Viertelkreises mit Radius r", html: `Kreis um M(0|0): x² + y² = r², obere Hälfte f(x) = √(r² − x²).<br>${int("0", "r")} √(r² − x²) dx = <b>r²π/4</b>, also ein Viertel von r²π.` },
    { t: "maple", code: ["f := sqrt(r^2 - x^2):", "r := 1:  int(f, x = 0..r);", "r := 'r':"] },
    C("Welche Funktion ist eine Stammfunktion von f(x) = 6x²?", "F(x) = 2x³ + 7", ["F(x) = 12x", "F(x) = 6x³", "F(x) = 3x²"], "(2x³ + 7)′ = 6x². Die Konstante 7 ist egal."),
    C("∫₀² x³ dx = ?", "4", ["8", "2", "16"], "[x⁴/4]₀² = 16/4 = 4."),
    C("Was ist der Unterschied zwischen int und Int in Maple?", "Int zeigt das Integral nur an, value(%) wertet es aus", ["Int rechnet numerisch, int exakt", "Int ist für Doppelintegrale", "Es gibt keinen"], "Int ist die „träge“ Form, praktisch für schöne Ausgaben."),
    { t: "keys", items: ["F′ = f → ∫<sub>a</sub><sup>b</sup> f dx = F(b) − F(a)", "Stammfunktion bis auf + c eindeutig", "Integrieren = Umkehrung des Differenzierens", "Maple: int(f, x) · int(f, x = a..b) · Int(…) + value(%)"] }
  ] },
  { id: "m23-3", title: "Flächen zwischen Kurven und Mittelwert", topic: "mt-flae", min: 16, xp: 0, blocks: [
    { t: "lead", html: "Das Integral ist <i>nicht</i> immer die Fläche. Liegt die Kurve unter der x-Achse, zählt das Integral negativ, und Teile können sich gegenseitig auslöschen. Bei Flächen zwischen Kurven ist die wichtigste Regel: <b>an den Schnittpunkten aufteilen</b>." },
    { t: "warnbox", html: "∫₀<sup>2π</sup> sin x dx = 0, obwohl zwischen Kurve und x-Achse sichtbar Fläche liegt. Die Teile oberhalb und unterhalb der Achse heben sich auf. Für die Fläche: an den Nullstellen teilen und Beträge addieren (= 4)." },
    { t: "text", h: "Obere minus untere Kurve", levels: {
      simple: "Fläche zwischen zwei Kurven: obere Kurve minus untere Kurve integrieren. Wechseln sie oben und unten, an den Schnittpunkten aufteilen.",
      normal: `Für die Fläche zwischen f und g auf [a, b] integriert man <b>obere minus untere Kurve</b>:${mx(`A = ${int("a", "b")} (f(x) − g(x)) dx`)}Das funktioniert auch, wenn die Kurven die x-Achse schneiden. <b>Schneiden sich f und g</b> innerhalb von [a, b], muss man an den Schnittpunkten aufteilen, weil dort „oben“ und „unten“ wechseln:${mx(`A = ${int("a", "x₁")} (f − g) dx + ${int("x₁", "b")} (g − f) dx`)}Begrenzen <b>mehrere</b> Kurven die Fläche, wird an jedem Knick des Randes aufgeteilt. Vorgehen: Skizze, Schnittpunkte mit solve/fsolve, dann die Teilintegrale.` } },
    { t: "fig", id: "m2f-area" },
    { t: "example", label: "Skriptum, Beispiel 3.3", title: "Fläche zwischen sin x und cos x in [0, 2π]", html: `Schnittpunkte: sin x = cos x bei x = π/4 und x = 5π/4. Dazwischen liegt sin oben:${mx(`A = ${int("π/4", "5π/4")} (sin x − cos x) dx = 2√2 ≈ 2.828`)}` },
    { t: "maple", code: ["plot([sin(x), cos(x)], x = 0..2*Pi, color = [red, blue]);", "solve(sin(x) = cos(x), x);", "int(sin(x) - cos(x), x = Pi/4..5*Pi/4);"], note: "solve liefert bei periodischen Gleichungen nur die Hauptlösung π/4. Die zweite (5π/4) liest man aus der Grafik ab oder sucht sie mit fsolve(sin(x) = cos(x), x = 3..5)." },
    { t: "example", label: "Skriptum, Beispiel 3.4", title: "Fläche zwischen f(x) = x²/2, g(x) = 2x und der Geraden y = 1", html: `Schnittpunkte des Randes: g = 1 bei x = 0.5, f = 1 bei x = √2, f = g bei x = 0. Oben ist zuerst g, ab x = 0.5 die Gerade y = 1:${mx(`A = ${int("0", "1/2")} (2x − ${fr("x²", "2")}) dx + ${int("1/2", "√2")} (1 − ${fr("x²", "2")}) dx ≈ 0.693`)}` },
    { t: "maple", title: "Beispiel 3.4 in Maple", code: ["f := x^2/2:  g := 2*x:", "solve(g = 1, x);  solve(f = 1, x);", "A := int(g - f, x = 0..1/2) + int(1 - f, x = 1/2..sqrt(2));", "evalf(A);", "plot([f, g, 1], x = 0..1.6, view = [0..1.6, 0..1.4], color = [red, blue, black]);"] },
    { t: "text", h: "Mittelwert einer Funktion", levels: {
      simple: "Durchschnittshöhe einer Kurve: Fläche durch Breite. So wie Durchschnittsgeschwindigkeit = Weg durch Zeit.",
      normal: `Der <b>Mittelwert</b> von f auf [a, b] ist die Höhe m des Rechtecks mit gleicher Fläche:${mx(`m = ${fr("1", "b − a")}·${int("a", "b")} f(x) dx`)}Beispiel aus den Folien: Durchschnittsgeschwindigkeit v<sub>∅</sub> = 1/(t₂ − t₁)·∫ v(t) dt.` } },
    { t: "maple", code: ["m := 1/(Pi - 0)*int(sin(x), x = 0..Pi);", "evalf(m);"] },
    C("∫₀^{2π} sin x dx ergibt 0. Warum?", "Flächen oberhalb und unterhalb der x-Achse heben sich auf", ["sin x ist überall 0", "Maple rechnet falsch", "Die Grenzen sind gleich"], "Von 0 bis π: +2, von π bis 2π: −2."),
    C("Fläche zwischen f(x) = x und g(x) = x² auf [0, 1]?", "1/6", ["1/2", "1/3", "5/6"], "∫(x − x²) dx = 1/2 − 1/3 = 1/6."),
    C("Mittelwert von f(x) = x² auf [0, 3]?", "3", ["9", "4.5", "1"], "1/3·∫₀³ x² dx = 1/3·9 = 3."),
    { t: "keys", items: ["Integral ≠ Fläche, wenn f unter der x-Achse liegt", "A = ∫(obere − untere) dx, an Schnittpunkten aufteilen", "Beispiel 3.3: 2√2 · Beispiel 3.4: ≈ 0.693", "Mittelwert m = 1/(b − a)·∫<sub>a</sub><sup>b</sup> f dx"] }
  ] },
  { id: "m23-4", title: "Doppelintegrale und Schwerpunkt", topic: "mt-dopp", min: 14, xp: 0, blocks: [
    { t: "lead", html: "Wie misst man eine beliebige Fläche auf Millimeterpapier? Kästchen zählen! Lässt man die Kästchen unendlich klein werden, entsteht das <b>Doppelintegral</b>. Mit derselben Idee bekommt man auch den <b>Schwerpunkt</b> einer Fläche." },
    { t: "text", h: "Fläche als Doppelintegral", levels: {
      simple: "Viele kleine Kästchen Δx·Δy zusammenzählen. Rechnen: zuerst das innere Integral (nach y), dann das äußere (nach x).",
      normal: `Jedes Kästchen hat die Fläche ΔA = Δx·Δy. Für Δx, Δy → 0:${mx("A = ∬<sub>B</sub> dA = ∬<sub>B</sub> dx dy")}Dazu muss man das Gebiet B mit Grenzen beschreiben, z. B. B = {(x, y) | a ≤ x ≤ b, g(x) ≤ y ≤ f(x)}. Gerechnet wird <b>von innen nach außen</b>.<br><br>Allgemeiner gibt ∬<sub>B</sub> f(x, y) dx dy das <b>Volumen</b> unter der Fläche f(x, y) über B an (Beispiel 3.8: Quader mit f = c über [0, a]×[0, b] → V = a·b·c).` } },
    { t: "example", label: "Skriptum, Beispiel 3.5", title: "B = {(x, y) | 0 ≤ x ≤ 1, x² ≤ y ≤ x}", html: `${mx(`∫<sub>0</sub><sup>1</sup> ∫<sub>x²</sub><sup>x</sup> dy dx = ∫<sub>0</sub><sup>1</sup> (x − x²) dx = ${fr("1", "2")} − ${fr("1", "3")} = ${fr("1", "6")}`)}` },
    { t: "maple", code: ["int(int(1, y = x^2..x), x = 0..1);", "int(int(c, y = 0..b), x = 0..a);"], note: "Das innere int steht innen, wie in der Formel. Beim Quader (Beispiel 3.8) kommt a·b·c heraus." },
    { t: "text", h: "Schwerpunkt einer Fläche", levels: {
      simple: "Der Schwerpunkt ist der Punkt, an dem man die Fläche auf einer Nadelspitze balancieren könnte. Formel: x<sub>s</sub> = (1/A)·∫ x·(f − g) dx, y<sub>s</sub> = (1/2A)·∫ (f² − g²) dx.",
      normal: `Für eine Fläche zwischen f (oben) und g (unten) auf [a, b] mit Flächeninhalt A gilt (konstante Dichte):${mx(`x<sub>s</sub> = ${fr("1", "A")}·${int("a", "b")} x·(f(x) − g(x)) dx &nbsp;&nbsp;&nbsp; y<sub>s</sub> = ${fr("1", "2A")}·${int("a", "b")} (f(x)² − g(x)²) dx`)}Muss die Fläche aufgeteilt werden, teilt man <b>auch beim Schwerpunkt</b> an denselben Stellen auf.` } },
    { t: "fig", id: "m2f-centroid" },
    { t: "example", label: "Skriptum, Beispiel 3.6", title: "Schwerpunkt der Fläche aus Beispiel 3.4", html: `A ≈ 0.6928 (siehe vorige Lektion). Aufteilen bei x = 1/2:<br>x<sub>s</sub> = 1/A·[∫₀<sup>1/2</sup> x(2x − x²/2) dx + ∫<sub>1/2</sub><sup>√2</sup> x(1 − x²/2) dx] ≈ <b>0.662</b><br>y<sub>s</sub> = 1/(2A)·[∫₀<sup>1/2</sup> ((2x)² − (x²/2)²) dx + ∫<sub>1/2</sub><sup>√2</sup> (1 − (x²/2)²) dx] ≈ <b>0.576</b>` },
    { t: "maple", code: ["f := x^2/2:  g := 2*x:", "A := int(g - f, x = 0..1/2) + int(1 - f, x = 1/2..sqrt(2)):", "xs := (int(x*(g - f), x = 0..1/2) + int(x*(1 - f), x = 1/2..sqrt(2)))/A;", "ys := (int(g^2 - f^2, x = 0..1/2) + int(1 - f^2, x = 1/2..sqrt(2)))/(2*A);", "evalf([xs, ys]);"] },
    C("∫₀² ∫₀³ 1 dy dx = ?", "6", ["5", "3", "9"], "Rechteck 2 × 3, Fläche 6."),
    C("Wie rechnet man ein Doppelintegral aus?", "Von innen nach außen: erst das innere Integral, dann das äußere", ["Beide gleichzeitig numerisch", "Von außen nach innen", "Man multipliziert die Grenzen"], "Das Ergebnis des inneren Integrals ist eine Funktion von x, die dann außen integriert wird."),
    C("Fläche zwischen f(x) = 1 und g(x) = 0 auf [0, 2] (ein Rechteck). Wo liegt der Schwerpunkt?", "(1 | 0.5)", ["(2 | 1)", "(0.5 | 1)", "(1 | 1)"], "x<sub>s</sub> = 1/2·∫₀² x dx = 1, y<sub>s</sub> = 1/4·∫₀² 1 dx = 0.5."),
    { t: "keys", items: ["A = ∬<sub>B</sub> dx dy, innen nach außen rechnen", "Beispiel 3.5: ∫₀¹∫<sub>x²</sub><sup>x</sup> dy dx = 1/6", "x<sub>s</sub> = (1/A)·∫ x(f − g) dx · y<sub>s</sub> = (1/2A)·∫ (f² − g²) dx", "Beim Aufteilen der Fläche auch den Schwerpunkt aufteilen"] }
  ] },
  { id: "m23-5", title: "Bogenlänge", topic: "mt-bogen", min: 12, xp: 0, blocks: [
    { t: "lead", html: "Integrale können auch Längen messen: die Länge einer gekrümmten Kurve, etwa den Umfang einer krummlinig begrenzten Fläche. Das kommt in fast jeder Prüfung vor („Wie groß ist der Umfang?“)." },
    { t: "text", h: "Vom Polygonzug zur Formel", levels: {
      simple: "Ersetze die Kurve durch viele kleine gerade Stücke. Jedes ist nach Pythagoras √(Δx² + Δy²) lang. Bei unendlich vielen Stücken wird daraus ∫√(1 + f′²) dx.",
      normal: `Man nähert die Kurve durch einen <b>Polygonzug</b> an. Ein Stück zwischen x<sub>k</sub> und x<sub>k</sub> + Δx hat nach Pythagoras die Länge${mx(`√((Δx)² + (f(x<sub>k</sub> + Δx) − f(x<sub>k</sub>))²) = √(1 + (${fr("f(x<sub>k</sub> + Δx) − f(x<sub>k</sub>)", "Δx")})²)·Δx`)}Für Δx → 0 wird der Differenzenquotient zur Ableitung, und die Summe zum Integral:${mx(`L = ${int("a", "b")} √(1 + f′(x)²) dx`)}` } },
    { t: "fig", id: "m2f-arc" },
    { t: "example", label: "Skriptum, Beispiel 3.7", title: "Umfang eines Kreises mit Radius r", html: `Viertelkreis: f(x) = √(r² − x²), x von 0 bis r. Dann ist L = ∫₀<sup>r</sup> √(1 + f′(x)²) dx = <b>rπ/2</b>, also Umfang U = 4·rπ/2 = 2rπ.` },
    { t: "maple", code: ["f := sqrt(r^2 - x^2):", "r := 1:  L := int(sqrt(1 + diff(f, x)^2), x = 0..r);", "4*L;", "r := 'r':"], note: "An der Stelle x = r ist f′ unendlich steil. Maple (und dieses Labor) rechnet das Integral trotzdem, es konvergiert." },
    { t: "example", label: "Altprüfung SS 2016, Aufgabe 2 (Teil)", title: "Umfang einer Fläche aus drei Kreisbögen", html: `Bei A4 (siehe Prüfungsaufgaben) besteht der Rand aus drei Bögen von Kreisen mit Radius 10, jeder mit Mittelpunktswinkel 30°. Mit der Bogenlängenformel: L ≈ 15.708 = <b>5π</b>. Kontrolle: 3 · (30°/360°) · 2·10·π = 5π.` },
    C("Wie lautet die Formel für die Bogenlänge von f auf [a, b]?", "∫<sub>a</sub><sup>b</sup> √(1 + f′(x)²) dx", ["∫<sub>a</sub><sup>b</sup> √(1 + f(x)²) dx", "∫<sub>a</sub><sup>b</sup> (1 + f′(x)) dx", "π·∫<sub>a</sub><sup>b</sup> f(x)² dx"], "Pythagoras im Grenzwert: √(1 + f′²)."),
    C("Wie lang ist die Strecke f(x) = 2x von x = 0 bis x = 3?", "3√5 ≈ 6.71", ["6", "9", "√13"], "∫₀³ √(1 + 4) dx = 3√5, Kontrolle mit Pythagoras: √(3² + 6²) = √45."),
    { t: "keys", items: ["L = ∫<sub>a</sub><sup>b</sup> √(1 + f′(x)²) dx", "Herleitung: Polygonzug + Pythagoras + Grenzwert", "Viertelkreis: rπ/2 → Umfang 2rπ", "Umfang einer Fläche = Summe der Bogenlängen aller Randstücke"] }
  ] },
  { id: "m23-6", title: "Rotationskörper: Volumen und Oberfläche", topic: "mt-rot", min: 16, xp: 0, blocks: [
    { t: "lead", html: "Dreht man eine Kurve um eine Achse, entsteht ein Körper: aus einer Geraden wird ein Kegel, aus einem Halbkreis eine Kugel, aus einer Parabel eine Schüssel. Volumen und Oberfläche solcher <b>Rotationskörper</b> liefert wieder ein Integral." },
    { t: "text", h: "Rotation um die x-Achse: Scheiben", levels: {
      simple: "Schneide den Körper in dünne Scheiben. Jede Scheibe ist ein flacher Zylinder mit Radius f(x) und Dicke Δx, Volumen π·f(x)²·Δx. Summe → Integral.",
      normal: `Man schneidet den Körper parallel zur yz-Ebene in Scheiben der Dicke Δx. Jede Scheibe ist ungefähr ein Zylinder mit Radius f(x<sub>k</sub>): Volumen π·f(x<sub>k</sub>)²·Δx. Im Grenzwert:${mx(`V<sub>x</sub> = π·${int("a", "b")} f(x)² dx`)}Für die <b>Rotation um die y-Achse</b> gilt (Zylinderschalen-Methode):${mx(`V<sub>y</sub> = 2π·${int("a", "b")} x·f(x) dx`)}` } },
    { t: "fig", id: "m2f-rot" },
    { t: "example", label: "Skriptum, Beispiel 3.9", title: "Volumen eines Kegels mit Radius r und Höhe h", html: `Die Gerade durch (0|r) und (h|0) ist f(x) = r − (r/h)·x. Dreht man sie um die x-Achse:${mx(`V = π·${int("0", "h")} (r − ${fr("r", "h")}x)² dx = ${fr("π", "3")}·r²·h`)}` },
    { t: "maple", code: ["f := r - r/h*x:", "V := Pi*int(f^2, x = 0..h);", "r := 2:  h := 5:  V;", "plot3d([x, f*cos(t), f*sin(t)], x = 0..h, t = 0..2*Pi);", "r := 'r':  h := 'h':"], note: "plot3d mit der Parameterdarstellung [x, f·cos t, f·sin t] zeichnet den Rotationskörper. Dafür braucht Maple Zahlen, darum werden r und h kurz belegt und danach mit r := 'r' wieder freigegeben." },
    { t: "example", label: "Skriptum, Beispiel 3.10", title: "Fläche zwischen f(x) = x und g(x) = x² rotiert", html: `Schnittpunkte (0|0) und (1|1). Um die x-Achse: äußerer Körper minus innerer:${mx(`V<sub>x</sub> = π${int("0", "1")} x² dx − π${int("0", "1")} x⁴ dx = ${fr("2π", "15")} ≈ 0.419`)}Um die y-Achse:${mx(`V<sub>y</sub> = 2π${int("0", "1")} x·x dx − 2π${int("0", "1")} x·x² dx = ${fr("π", "6")} ≈ 0.524`)}` },
    { t: "maple", code: ["f := x:  g := x^2:", "Vx := Pi*int(f^2, x = 0..1) - Pi*int(g^2, x = 0..1);", "Vy := 2*Pi*int(x*f, x = 0..1) - 2*Pi*int(x*g, x = 0..1);", "plot3d([x, x*cos(t), x*sin(t)], x = 0..1, t = 0..2*Pi);"] },
    { t: "text", h: "Oberfläche (Mantelfläche) bei Rotation um die x-Achse", levels: {
      simple: "Wie bei der Bogenlänge kommt √(1 + f′²) vor, mal den Umfang 2π·f(x) der Scheibe.",
      normal: `Jede Scheibe wird durch einen Kegelstumpf angenähert (Mantel π·ℓ·(r₁ + r₂)). Im Grenzwert wird ℓ zu √(1 + f′²)·dx und r₁ + r₂ zu 2f(x):${mx(`O = 2π·${int("a", "b")} f(x)·√(1 + f′(x)²) dx`)}` } },
    { t: "maple", code: ["f := sqrt(x):", "O := 2*Pi*int(f*sqrt(1 + diff(f, x)^2), x = 0..1);", "evalf(O);"] },
    C("Welche Formel gilt für das Volumen bei Rotation von f um die x-Achse?", "π·∫ f(x)² dx", ["2π·∫ x·f(x) dx", "π·∫ f(x) dx", "2π·∫ f(x)·√(1 + f′²) dx"], "Scheiben mit Radius f(x): πf²·dx."),
    C("Welche Formel gilt bei Rotation um die y-Achse?", "2π·∫ x·f(x) dx", ["π·∫ f(x)² dx", "π·∫ x² dx", "2π·∫ f(x)² dx"], "Zylinderschalen mit Radius x, Höhe f(x), Umfang 2πx."),
    C("f(x) = 2 auf [0, 3] rotiert um die x-Achse. Welcher Körper und welches Volumen?", "Zylinder, V = 12π", ["Kegel, V = 4π", "Kugel, V = 32π/3", "Zylinder, V = 6π"], "π·∫₀³ 4 dx = 12π = π·r²·h mit r = 2, h = 3."),
    { t: "keys", items: ["V<sub>x</sub> = π·∫ f² dx (Scheiben)", "V<sub>y</sub> = 2π·∫ x·f dx (Schalen)", "Fläche zwischen f und g: äußeres minus inneres Volumen", "O = 2π·∫ f·√(1 + f′²) dx", "Kegel: πr²h/3 · Beispiel 3.10: 2π/15 und π/6"] }
  ] },
  { id: "m23-7", title: "Prüfungsaufgaben Integralrechnung", topic: "mt-flae", min: 18, xp: 0, blocks: [
    { t: "lead", html: "Die Integral-Aufgaben der Altprüfungen kombinieren mehrere Schritte: Skizze, Schnittpunkte, Fläche aufteilen, dann Fläche, Umfang oder Volumen. Hier sind beide Aufgaben komplett vorgerechnet." },
    { t: "example", label: "Altprüfung SS 2016, Aufgabe 2 (3 Punkte)", title: "Vier Kreise mit Radius 10 im Quadrat: Fläche A4 und ihr Umfang", html: `Quadrat [0, 10]², Viertelkreise mit Radius 10 um alle vier Ecken. A4 ist das Gebiet links unten. Randkurven:<br>· Kreis um (0|10), unterer Bogen: g(x) = 10 − √(100 − x²)<br>· Kreis um (10|0), oberer Bogen: h(x) = √(100 − (x − 10)²)<br>· Kreis um (10|10), unterer Bogen: k(x) = 10 − √(100 − (x − 10)²)<br>Schnittpunkt h = k bei x₁ = 10 − √75 ≈ 1.3397. Aufteilen:${mx(`A4 = ${int("0", "x₁")} (h − g) dx + ${int("x₁", "5")} (k − g) dx ≈ 12.7825`)}Exakt: 25π/3 − 100 + 50√3. <b>Umfang</b>: drei Bögen à 30°, zusammen 5π ≈ 15.708.` },
    { t: "maple", title: "Lösung SS 2016, Aufgabe 2", code: ["g := 10 - sqrt(100 - x^2):  h := sqrt(100 - (x - 10)^2):  k := 10 - sqrt(100 - (x - 10)^2):", "plot([g, h, k], x = 0..10, view = [0..10, 0..10], scaling = constrained, color = [red, blue, green]);", "x1 := fsolve(h = k, x = 0..5);", "A4 := int(h - g, x = 0..x1) + int(k - g, x = x1..5);", "U := int(sqrt(1 + diff(h, x)^2), x = 0..x1) + int(sqrt(1 + diff(k, x)^2), x = x1..5) + int(sqrt(1 + diff(g, x)^2), x = 0..5);"] },
    { t: "example", label: "Altprüfung SS 2012, Aufgabe 3 (3 Punkte)", title: "Fläche zwischen x² + y² = 25, y = 4x und y = x²/4 durch (2|2): Umfang und Volumen um die y-Achse", html: `Obere Ränder: Gerade l(x) = 4x, dann Kreis c(x) = √(25 − x²). Unterer Rand: Parabel p(x) = x²/4.<br>Schnittpunkte: l = c bei x₁ = 5/√17 ≈ 1.2127, p = c bei x₂ ≈ 3.6798.<br><b>Umfang</b> = Strecke (Länge 5, sie ist ein Radius) + Parabelbogen 0..x₂ (≈ 5.2225) + Kreisbogen x₁..x₂ (≈ 2.9105) ≈ <b>13.133</b>.<br><b>Volumen um die y-Achse</b>: V = 2π[∫₀<sup>x₁</sup> x(l − p) dx + ∫<sub>x₁</sub><sup>x₂</sup> x(c − p) dx] ≈ <b>100.736</b>.` },
    { t: "maple", title: "Lösung SS 2012, Aufgabe 3", code: ["c := sqrt(25 - x^2):  l := 4*x:  p := x^2/4:", "plot([c, l, p], x = 0..5, view = [0..5, 0..6], scaling = constrained);", "x1 := solve(l = c, x);  x2 := fsolve(p = c, x = 0..5);", "L := int(sqrt(1 + diff(l, x)^2), x = 0..x1) + int(sqrt(1 + diff(p, x)^2), x = 0..x2) + int(sqrt(1 + diff(c, x)^2), x = x1..x2);", "V := 2*Pi*(int(x*(l - p), x = 0..x1) + int(x*(c - p), x = x1..x2));"] },
    { t: "tip", html: "Prüfungsrezept für Flächen-Aufgaben: (1) alle Randkurven als Funktionen y = … schreiben, (2) plot mit scaling = constrained, (3) Schnittpunkte mit solve/fsolve (Bereich angeben!), (4) an jedem Knick aufteilen, (5) Ergebnis mit Einheit/Satz angeben." },
    C("Bei SS 2012 Aufgabe 3: Warum ist das Geradenstück genau 5 lang?", "Es läuft vom Ursprung (Kreismittelpunkt) bis zum Kreis, ist also ein Radius", ["Weil 4·1.25 = 5", "Weil die Parabel bei y = 5 endet", "Zufall"], "Der Punkt (x₁ | 4x₁) liegt auf dem Kreis mit Radius 5 um den Ursprung."),
    { t: "keys", items: ["Randkurven als y = f(x), Kreise in oberen/unteren Bogen zerlegen", "Schnittpunkte mit fsolve(…, x = a..b)", "A4 (SS 2016) ≈ 12.7825, Umfang 5π", "SS 2012: Umfang ≈ 13.133, V<sub>y</sub> ≈ 100.736"] }
  ] }
  ] },
  questions: [
    Q("m2q301", "mt-riem", "Was ist das bestimmte Integral anschaulich (für f ≥ 0)?", "Die Fläche zwischen Kurve und x-Achse über [a, b]", ["Die Steigung der Kurve", "Die Länge der Kurve", "Der höchste Funktionswert"], "Grenzwert der Rechtecksummen."),
    Q("m2q302", "mt-riem", "Bei n Rechtecken auf [0, 2] ist Δx = ?", "2/n", ["n/2", "2n", "1/n"], "Δx = (b − a)/n."),
    Q("m2q303", "mt-riem", "Σ<sub>k=1</sub><sup>n</sup> k = ?", "n(n + 1)/2", ["n²", "n(n − 1)", "(n + 1)/2"], "Gaußsche Summenformel, gebraucht in Beispiel 3.1."),
    Q("m2q304", "mt-stamm", "∫ (4x³ + 2) dx = ?", "x⁴ + 2x + c", ["12x² + c", "x⁴ + c", "4x⁴ + 2x + c"], "Summandenweise: x⁴ und 2x."),
    Q("m2q305", "mt-stamm", "∫ e<sup>3x</sup> dx = ?", "e<sup>3x</sup>/3 + c", ["3e<sup>3x</sup> + c", "e<sup>3x</sup> + c", "e<sup>3x+1</sup>/(3x + 1) + c"], "Lineare innere Funktion: durch die innere Ableitung 3 teilen."),
    Q("m2q306", "mt-stamm", "∫₀^π sin x dx = ?", "2", ["0", "−2", "1"], "[−cos x]₀^π = 1 − (−1) = 2."),
    Q("m2q307", "mt-stamm", "∫ 1/x dx = ?", "ln|x| + c", ["−1/x² + c", "x⁰ + c", "1/(2x²) + c"], "Sonderfall n = −1."),
    Q("m2q308", "mt-stamm", "Warum sind Stammfunktionen nicht eindeutig?", "Weil die Ableitung einer Konstanten 0 ist", ["Weil es zwei Integrationsgrenzen gibt", "Weil Maple rundet", "Sie sind eindeutig"], "F und F + c haben dieselbe Ableitung."),
    Q("m2q309", "mt-flae", "Wo muss man das Integral für die Fläche zwischen zwei Kurven aufteilen?", "An den Schnittpunkten der Kurven", ["An den Nullstellen der Ableitung", "In der Mitte des Intervalls", "Nie"], "Dort wechselt, welche Kurve oben liegt."),
    Q("m2q310", "mt-flae", "Fläche zwischen f(x) = 4 − x² und der x-Achse?", "32/3", ["16/3", "8", "4"], "Nullstellen ±2: ∫₋₂² (4 − x²) dx = 16 − 16/3 = 32/3."),
    Q("m2q311", "mt-flae", "Fläche zwischen sin x und cos x in [π/4, 5π/4] (Beispiel 3.3)?", "2√2", ["2", "√2", "4"], "∫(sin − cos) = [−cos − sin] = √2 + √2."),
    Q("m2q312", "mt-flae", "Mittelwert von f(x) = 2x auf [0, 4]?", "4", ["8", "16", "2"], "1/4·∫₀⁴ 2x dx = 1/4·16 = 4."),
    Q("m2q313", "mt-dopp", "∫₀¹ ∫<sub>x²</sub><sup>x</sup> dy dx (Beispiel 3.5) = ?", "1/6", ["1/2", "1/3", "1"], "∫₀¹ (x − x²) dx = 1/2 − 1/3."),
    Q("m2q314", "mt-dopp", "Was berechnet ∬<sub>B</sub> f(x, y) dx dy für f ≥ 0?", "Das Volumen unter der Fläche f über dem Gebiet B", ["Die Fläche von B", "Den Schwerpunkt", "Die Oberfläche"], "Beispiel 3.8: Quader mit f = c → abc."),
    Q("m2q315", "mt-dopp", "Formel für die x-Koordinate des Schwerpunkts zwischen f und g?", "x<sub>s</sub> = (1/A)·∫ x·(f − g) dx", ["x<sub>s</sub> = (1/2A)·∫ (f² − g²) dx", "x<sub>s</sub> = ∫ x dx", "x<sub>s</sub> = A/2"], "Die zweite Formel ist die für y<sub>s</sub>."),
    Q("m2q316", "mt-dopp", "Schwerpunkt aus Beispiel 3.6 (Fläche aus 3.4)?", "S(0.662 | 0.576)", ["S(0.5 | 0.5)", "S(0.693 | 0.693)", "S(1 | 0.5)"], "Aufteilen bei x = 1/2, dann beide Formeln."),
    Q("m2q317", "mt-bogen", "Bogenlänge von f(x) = x²/2 auf [0, 1] als Integral?", "∫₀¹ √(1 + x²) dx", ["∫₀¹ √(1 + x⁴/4) dx", "∫₀¹ (1 + x) dx", "∫₀¹ x²/2 dx"], "f′(x) = x."),
    Q("m2q318", "mt-bogen", "Wie lang ist der Viertelkreisbogen mit Radius 4?", "2π", ["4π", "π", "16π"], "rπ/2 = 4π/2."),
    Q("m2q319", "mt-rot", "Volumen bei Rotation von f(x) = √x auf [0, 4] um die x-Achse?", "8π", ["16π", "4π", "2π"], "π∫₀⁴ x dx = π·8."),
    Q("m2q320", "mt-rot", "Volumen eines Kegels (Beispiel 3.9)?", "πr²h/3", ["πr²h", "2πrh", "4πr³/3"], "π∫₀^h (r − rx/h)² dx."),
    Q("m2q321", "mt-rot", "Fläche zwischen y = x und y = x² rotiert um die x-Achse (Beispiel 3.10)?", "2π/15", ["π/6", "π/3", "π/15"], "π(1/3 − 1/5) = 2π/15."),
    Q("m2q322", "mt-rot", "Dieselbe Fläche um die y-Achse?", "π/6", ["2π/15", "π/2", "π/12"], "2π(1/3 − 1/4) = π/6."),
    Q("m2q323", "mt-rot", "Welche Größe kommt in der Oberflächenformel vor, nicht aber in der Volumenformel?", "√(1 + f′(x)²)", ["π", "f(x)", "dx"], "O = 2π∫ f·√(1 + f′²) dx: der Bogenlängen-Faktor."),
    Q("m2q324", "mt-flae", "SS 2016: Wert der Fläche A4?", "≈ 12.78", ["≈ 31.5", "≈ 21.46", "≈ 78.54"], "25π/3 − 100 + 50√3 ≈ 12.7825.")
  ],
  flashcards: [
    F("m2f301", "mt-riem", "Bestimmtes Integral (Definition)", "lim<sub>n→∞</sub> Σ f(x<sub>k</sub>)·Δx mit Δx = (b − a)/n"),
    F("m2f302", "mt-stamm", "Hauptsatz", "∫<sub>a</sub><sup>b</sup> f dx = F(b) − F(a), wenn F′ = f"),
    F("m2f303", "mt-stamm", "∫ xⁿ dx", "xⁿ⁺¹/(n + 1) + c (n ≠ −1); ∫ 1/x dx = ln|x| + c"),
    F("m2f304", "mt-stamm", "Maple: int vs. Int", "int rechnet; Int zeigt nur an, value(%) wertet aus"),
    F("m2f305", "mt-flae", "Fläche zwischen Kurven", "∫(obere − untere) dx, an Schnittpunkten aufteilen"),
    F("m2f306", "mt-flae", "Mittelwert", "m = 1/(b − a)·∫<sub>a</sub><sup>b</sup> f(x) dx"),
    F("m2f307", "mt-dopp", "Schwerpunkt", "x<sub>s</sub> = (1/A)∫x(f − g)dx · y<sub>s</sub> = (1/2A)∫(f² − g²)dx"),
    F("m2f308", "mt-bogen", "Bogenlänge", "L = ∫<sub>a</sub><sup>b</sup> √(1 + f′(x)²) dx"),
    F("m2f309", "mt-rot", "Rotationsvolumen", "V<sub>x</sub> = π∫f²dx · V<sub>y</sub> = 2π∫x·f dx"),
    F("m2f310", "mt-rot", "Rotationsoberfläche (x-Achse)", "O = 2π∫ f(x)·√(1 + f′(x)²) dx")
  ]
});
})();
