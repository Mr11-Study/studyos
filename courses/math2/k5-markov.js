/* MATH-2 · Kapitel 5: Anwendungen der Matrizenrechnung – Markovketten (Skriptum Kap. 5, Folien „Markovketten“) */
(function () {
const EXT = window.STUDYOS_EXT = window.STUDYOS_EXT || {};
const { fr, mx, mat, Q, C, F } = window.M2;

(EXT.math2 = EXT.math2 || []).push({
  id: "m2-k5",
  topics: {
    "mt-mgraph": { name: "Zufall, Übergangsgraph und -matrix", lesson: "m25-1" },
    "mt-mvert":  { name: "Zustandsverteilung p(n) = (Pᵀ)ⁿ·p(0)", lesson: "m25-2" },
    "mt-ergod":  { name: "Ergodische Ketten, stabile Verteilung", lesson: "m25-3" },
    "mt-absorb": { name: "Absorbierende Ketten: Z und W", lesson: "m25-4" }
  },
  world: { id: "m2w5", n: 5, title: "Markovketten", sub: "Zufallsprozesse mit Matrizen: Marktanteile, PageRank, Duelle und Tennis",
    boss: { id: "boss-m2w5", title: "Kapiteltest: Markovketten", topics: ["mt-mgraph", "mt-mvert", "mt-ergod", "mt-absorb"] },
    lessons: [
  { id: "m25-1", title: "Zufall, Übergangsgraph und Übergangsmatrix", topic: "mt-mgraph", min: 14, xp: 0, blocks: [
    { t: "lead", html: "Wie groß ist die Wahrscheinlichkeit, Mathematik 2 zu bestehen, wenn man jede Prüfung mit 60 % schafft und drei Versuche hat? Solche Fragen nach „was passiert auf lange Sicht“ beantworten <b>Markovketten</b>: Zustände, Übergänge mit Wahrscheinlichkeiten, und eine Matrix, die alles zusammenfasst." },
    { t: "example", label: "Folien: Beispiel Prüfung", title: "3 Versuche, je 60 % Erfolgswahrscheinlichkeit", html: `Bestehen im 1. Versuch: 0.6 = 0.600<br>im 2. Versuch: 0.4 · 0.6 = 0.240<br>im 3. Versuch: 0.4 · 0.4 · 0.6 = 0.096<br>Gesamt: <b>0.936</b>.<br>Bei <b>beliebig vielen</b> Versuchen: 0.6·(1 + 0.4 + 0.4² + …) = 0.6 · 1/(1 − 0.4) = <b>1</b> (geometrische Reihe): Irgendwann schafft man es sicher.` },
    { t: "text", h: "Der Übergangsgraph", levels: {
      simple: "Kreise sind Zustände (z. B. „1. Versuch“, „bestanden“). Pfeile sind mögliche Übergänge, beschriftet mit ihrer Wahrscheinlichkeit. Was aus einem Kreis rausgeht, ergibt zusammen 1.",
      normal: `<b>Knoten</b> = Zustände des Systems, <b>Kanten</b> = mögliche Übergänge, <b>Kantengewichte</b> = Wahrscheinlichkeiten. Regeln:<br>· Die Gewichte der von einem Knoten ausgehenden Kanten ergeben zusammen 1.<br>· Entlang eines Weges werden Wahrscheinlichkeiten <b>multipliziert</b>.<br>· Die Wahrscheinlichkeit von i nach j zu kommen ist die <b>Summe</b> über alle verschiedenen Wege.<br>Ein Zustand, den man nie wieder verlässt (Schleife mit 1), heißt <b>absorbierend</b> (z. B. „bestanden“, „nicht bestanden“). Alle anderen heißen <b>transient</b>.` } },
    { t: "text", h: "Die Übergangsmatrix P", levels: {
      simple: "Schreib die Wahrscheinlichkeiten in eine Tabelle: Zeile = von wo, Spalte = wohin. Jede Zeile hat die Summe 1.",
      normal: `Die Wahrscheinlichkeit der Kante von i nach j steht in <b>Zeile i, Spalte j</b>: p<sub>ij</sub>. Wichtig (Folien):<br>1. Jede Zeile und Spalte entspricht einem Zustand.<br>2. Die Kante (i, j) kommt in Zeile i, Spalte j.<br>3. Jede <b>Zeilensumme ist 1</b>.<br>4. Zeilen und Spalten in <b>derselben Reihenfolge</b> anordnen.<br>Marktbeispiel aus dem Skriptum (Produkte A, B, C):${mx(`P = ${mat([["0.2", "0.2", "0.6"], ["0.4", "0.5", "0.1"], ["0.4", "0.4", "0.2"]])}`)}0.2 in Zeile 1, Spalte 2: 20 % der Kunden von A wechseln im nächsten Jahr zu B. Diagonale = Markentreue.` } },
    { t: "fig", id: "m2f-mgraph" },
    C("Was muss in jeder Zeile einer Übergangsmatrix gelten?", "Die Summe ist 1", ["Die Diagonale ist 1", "Die Summe ist 0", "Alle Einträge sind gleich"], "Von jedem Zustand geht es mit Wahrscheinlichkeit 1 irgendwohin weiter (auch „bleiben“ zählt)."),
    C("Wahrscheinlichkeit, mit 2 Versuchen à 60 % zu bestehen?", "0.84", ["0.36", "1.2", "0.96"], "0.6 + 0.4·0.6 = 0.84."),
    C("Wie heißt ein Zustand, den man nie wieder verlässt?", "absorbierend", ["transient", "ergodisch", "stationär"], "Zeile mit einer 1 auf der Diagonale."),
    { t: "keys", items: ["Knoten = Zustände, Kanten = Übergänge mit Wahrscheinlichkeit", "Weg: multiplizieren · verschiedene Wege: addieren", "p<sub>ij</sub> in Zeile i (von), Spalte j (nach), Zeilensumme 1", "Absorbierend: nie mehr verlassen · transient: sonst"] }
  ] },
  { id: "m25-2", title: "Zustandsverteilung: p(n) = (Pᵀ)ⁿ · p(0)", topic: "mt-mvert", min: 14, xp: 0, blocks: [
    { t: "lead", html: "Heute haben die Produkte A, B, C Marktanteile 50 %, 40 %, 10 %. Wie sieht es in einem Jahr aus, in zwei, in zwanzig? Eine Matrizenmultiplikation pro Jahr." },
    { t: "text", h: "Ein Schritt", levels: {
      simple: "Neuer Anteil von A = (wer bei A bleibt) + (wer von B kommt) + (wer von C kommt). Das ist genau die erste Spalte von P mal die alten Anteile.",
      normal: `Anteil von A nach einem Jahr: 50 % bleiben zu 20 % bei A, 40 % kommen zu 40 % von B, 10 % kommen zu 40 % von C:${mx("0.5·0.2 + 0.4·0.4 + 0.1·0.4 = 0.30")}Ebenso B: 0.34 und C: 0.36. Das ist jeweils eine <b>Spalte</b> von P mal p(0). Darum muss man P <b>transponieren</b>:${mx(`p<sup>(1)</sup> = Pᵀ·p<sup>(0)</sup> = ${mat([["0.2", "0.4", "0.4"], ["0.2", "0.5", "0.4"], ["0.6", "0.1", "0.2"]])}·${mat([["0.5"], ["0.4"], ["0.1"]])} = ${mat([["0.30"], ["0.34"], ["0.36"]])}`)}` } },
    { t: "text", h: "n Schritte", levels: {
      simple: "Jeder weitere Schritt ist eine weitere Multiplikation mit Pᵀ. Nach n Schritten: (Pᵀ)ⁿ mal Startverteilung.",
      normal: `${mx("p<sup>(n)</sup> = (Pᵀ)ⁿ · p<sup>(0)</sup>")}<b>Definition 5.1:</b> Die Folge der Zustandsverteilungen {p<sup>(0)</sup>, p<sup>(1)</sup>, p<sup>(2)</sup>, …} heißt <b>Markovkette</b> zur Übergangsmatrix P. Interessante Fragen: Gibt es eine stabile Verteilung? Hängt sie vom Start ab? Verschwindet ein Produkt vom Markt?` } },
    { t: "fig", id: "m2f-markov" },
    { t: "maple", title: "Marktanteile simulieren", code: ["with(LinearAlgebra):", "P := Matrix([[0.2, 0.2, 0.6], [0.4, 0.5, 0.1], [0.4, 0.4, 0.2]]):", "p0 := Vector([0.5, 0.4, 0.1]):", "p1 := Transpose(P) . p0;", "p2 := MatrixPower(Transpose(P), 2) . p0;", "p20 := MatrixPower(Transpose(P), 20) . p0;"], note: "Nach 20 Jahren ändert sich praktisch nichts mehr: die Kette hat sich bei etwa (0.333, 0.370, 0.296) eingependelt." },
    C("Wie berechnet man die Verteilung nach 3 Schritten?", "(Pᵀ)³ · p(0)", ["P³ · p(0)", "3 · Pᵀ · p(0)", "Pᵀ · p(0) + 3"], "Pro Schritt eine Multiplikation mit Pᵀ."),
    C("Warum muss P transponiert werden?", "Weil die Wahrscheinlichkeiten, nach A zu kommen, in der Spalte von A stehen", ["Weil Maple nur transponierte Matrizen kann", "Damit die Zeilensumme 1 wird", "Muss sie nicht"], "Pᵀ macht aus den Spalten Zeilen, damit Zeile·Vektor = neuer Anteil."),
    { t: "keys", items: ["p<sup>(1)</sup> = Pᵀ·p<sup>(0)</sup> (transponieren nicht vergessen!)", "p<sup>(n)</sup> = (Pᵀ)ⁿ·p<sup>(0)</sup>", "Maple: Transpose(P) . p0, MatrixPower(Transpose(P), n) . p0", "Marktbeispiel: (0.5, 0.4, 0.1) → (0.30, 0.34, 0.36)"] }
  ] },
  { id: "m25-3", title: "Ergodische Markovketten und stabile Verteilung", topic: "mt-ergod", min: 16, xp: 0, blocks: [
    { t: "lead", html: "Viele Ketten pendeln sich ein: egal, wo man startet, am Ende stehen immer dieselben Anteile. Diese <b>stabile (stationäre) Verteilung</b> ist bei Google sogar der Kern der Suchmaschine: der PageRank." },
    { t: "text", h: "Stabile Verteilung: p = Pᵀ·p", levels: {
      simple: "Stabil heißt: ein weiterer Schritt ändert nichts mehr. Also p = Pᵀ·p. Dazu kommt: alle Anteile zusammen ergeben 1.",
      normal: `Eine Verteilung, die sich im nächsten Schritt nicht ändert, erfüllt${mx("p = Pᵀ·p &nbsp;⇔&nbsp; (E − Pᵀ)·p = 0")}Das homogene Gleichungssystem hat unendlich viele Lösungen (z. B. p = 0). Sinnvoll sind nur Verteilungen, also kommt die Bedingung${mx("p₁ + p₂ + … + p<sub>n</sub> = 1")}als zusätzliche Zeile dazu. Damit ist die Lösung eindeutig. Marktbeispiel: <b>p = (1/3, 10/27, 8/27) ≈ (0.33, 0.37, 0.30)</b>.` } },
    { t: "text", h: "Wann ist eine Kette ergodisch?", levels: {
      simple: "Ergodisch = es gibt genau eine stabile Verteilung, und man landet von jedem Start aus dort. Test: keine absorbierenden Zustände und irgendeine Potenz P, P², P⁴, … hat eine Spalte ganz ohne Nullen.",
      normal: `Eine Markovkette heißt <b>ergodisch</b>, wenn es zu jeder Anfangsverteilung eine stabile Verteilung gibt und diese eindeutig ist. Zwei Bedingungen (Skriptum):<br>1. Es gibt <b>keine absorbierende Menge</b> und keinen absorbierenden Zustand.<br>2. In der Folge P, P², P⁴, P⁸, … gibt es mindestens eine Matrix mit einer <b>Spalte ohne Nullelemente</b>.<br>Beim Marktbeispiel hat schon P selbst eine Spalte ohne Nullen → ergodisch. Auf lange Sicht: A 33 %, B 37 %, C 30 %, unabhängig vom Start.` } },
    { t: "maple", title: "Stabile Verteilung, zwei Wege", code: ["with(LinearAlgebra):", "P := Matrix([[1/5, 1/5, 3/5], [2/5, 1/2, 1/10], [2/5, 2/5, 1/5]]):", "A := IdentityMatrix(3) - Transpose(P);", "B := Matrix([[A[1, 1], A[1, 2], A[1, 3]], [A[2, 1], A[2, 2], A[2, 3]], [A[3, 1], A[3, 2], A[3, 3]], [1, 1, 1]]):", "LinearSolve(B, Vector([0, 0, 0, 1]));", "v := NullSpace(A)[1];", "v / add(v[i], i = 1..3);"], note: "Weg 1: Zeile (1, 1, 1 | 1) anhängen und LinearSolve. Weg 2: NullSpace liefert einen Lösungsvektor, den man durch seine Summe teilt (normiert)." },
    { t: "example", label: "Altprüfung SS 2012, Aufgabe 2 (4 Punkte)", title: "PageRank für 4 Seiten S1 … S4", html: `Ein Surfer klickt zufällig auf einen der Links der aktuellen Seite:${mx(`P = ${mat([["0", "1/2", "1/2", "0"], ["0", "0", "1/2", "1/2"], ["1/3", "1/3", "0", "1/3"], ["0", "0", "1", "0"]])}`)}Der PageRank ist die stabile Verteilung: (E − Pᵀ)·p = 0, Σp = 1 →${mx(`p = (${fr("4", "29")}, ${fr("6", "29")}, ${fr("12", "29")}, ${fr("7", "29")}) ≈ (0.138, 0.207, 0.414, 0.241)`)}S3 ist die wichtigste Seite (41 % der Zeit), S1 die unwichtigste.` },
    { t: "maple", title: "Lösung SS 2012, Aufgabe 2", code: ["with(LinearAlgebra):", "P := Matrix([[0, 1/2, 1/2, 0], [0, 0, 1/2, 1/2], [1/3, 1/3, 0, 1/3], [0, 0, 1, 0]]):", "v := NullSpace(IdentityMatrix(4) - Transpose(P))[1];", "pr := v / add(v[i], i = 1..4);", "evalf(pr);", "evalf(MatrixPower(Transpose(P), 50) . Vector([1/4, 1/4, 1/4, 1/4]));"], note: "Die letzte Zeile ist die Kontrolle: Nach 50 Klicks ist man bei derselben Verteilung, egal wo man begonnen hat." },
    C("Welche Gleichung beschreibt eine stabile Verteilung p?", "p = Pᵀ·p", ["p = P·p", "Pᵀ·p = 0", "p = (Pᵀ)⁻¹"], "Ein weiterer Schritt ändert nichts."),
    C("Warum braucht man zusätzlich p₁ + … + pₙ = 1?", "Weil (E − Pᵀ)p = 0 unendlich viele Lösungen hat (z. B. p = 0)", ["Weil P nicht invertierbar ist", "Weil sonst die Zeilensumme nicht 1 ist", "Braucht man nicht"], "Erst die Normierung macht die Lösung eindeutig."),
    C("Welche Seite hat beim SS-2012-PageRank den höchsten Rang?", "S3", ["S1", "S2", "S4"], "12/29 ≈ 41 %."),
    { t: "keys", items: ["Stabil: p = Pᵀ·p ⇔ (E − Pᵀ)·p = 0, dazu Σp = 1", "Ergodisch: keine absorbierenden Zustände + eine Potenz mit nullfreier Spalte", "Maple: NullSpace(IdentityMatrix(n) − Transpose(P)), dann normieren", "Marktbeispiel (0.33, 0.37, 0.30) · PageRank SS 2012 (4, 6, 12, 7)/29"] }
  ] },
  { id: "m25-4", title: "Absorbierende Markovketten: Z und W", topic: "mt-absorb", min: 18, xp: 0, blocks: [
    { t: "lead", html: "Ein Duell endet, wenn einer stirbt. Ein Tennisgame endet mit einem Sieger. Bei solchen Ketten fragt man nicht nach einer stabilen Verteilung, sondern: <b>Wo lande ich am Ende, und wie lange dauert es?</b> Zwei Matrixformeln beantworten beides." },
    { t: "text", h: "Die Matrix in vier Blöcke teilen", levels: {
      simple: "Absorbierende Zustände zuerst, dann die transienten. Dann steht links oben eine Einheitsmatrix E, rechts oben Nullen, unten links R (transient → absorbierend), unten rechts Q (transient → transient).",
      normal: `Man ordnet die <b>absorbierenden Zustände zuerst</b>, dann die transienten. Die Matrix zerfällt in vier Blöcke:${mx(`P = ${mat([["E", "0"], ["R", "Q"]])}`)}E: Einheitsmatrix (absorbierend bleibt absorbierend), 0: Nullmatrix, <b>R</b> (n₂ × n₁): von transient nach absorbierend, <b>Q</b> (n₂ × n₂): von transient nach transient. (n₁ absorbierende, n₂ transiente Zustände.)` } },
    { t: "text", h: "Fundamentalmatrix Z und Absorptionsmatrix W", levels: {
      simple: "Z = (E − Q)⁻¹ sagt, wie oft man durchschnittlich in jedem transienten Zustand ist. Die Zeilensumme von Z = durchschnittliche Anzahl Schritte bis zum Ende. W = Z·R sagt, mit welcher Wahrscheinlichkeit man in welchem Endzustand landet.",
      normal: `${mx("Z = (E − Q)⁻¹ &nbsp;&nbsp;&nbsp;&nbsp; W = Z·R")}<b>z<sub>ik</sub></b>: durchschnittliche Anzahl der Besuche im transienten Zustand k bei Start im transienten Zustand i.<br><b>Zeilensumme s<sub>i</sub> = Σ<sub>k</sub> z<sub>ik</sub></b>: durchschnittliche Anzahl der Schritte von i bis zur Absorption.<br><b>w<sub>ij</sub></b>: Wahrscheinlichkeit, bei Start im transienten Zustand i im absorbierenden Zustand j zu landen. Jede Zeile von W hat Summe 1.` } },
    { t: "example", label: "Folien: Duell um Ehre", title: "A trifft mit 10 %, B mit 15 %, A beginnt, abwechselnd bis zum Tod", html: `Reihenfolge: A stirbt, B stirbt | A schießt, B schießt.${mx(`R = ${mat([["0", "0.1"], ["0.15", "0"]])} &nbsp;&nbsp; Q = ${mat([["0", "0.9"], ["0.85", "0"]])}`)}${mx(`Z = ${mat([["4.25", "3.83"], ["3.62", "4.25"]])} &nbsp;&nbsp; W = ${mat([["0.574", "0.426"], ["0.638", "0.362"]])}`)}Wenn A beginnt, stirbt A mit <b>57 %</b> (B nur mit 43 %), obwohl A anfängt. Begänne B, wären es für A sogar 64 %. Bei Start A wird durchschnittlich 4.25 + 3.83 ≈ <b>8.09-mal</b> geschossen (Folien gerundet: 8.07).` },
    { t: "fig", id: "m2f-duel" },
    { t: "maple", title: "Duell in Maple", code: ["with(LinearAlgebra):", "Q := Matrix([[0, 0.9], [0.85, 0]]):  R := Matrix([[0, 0.1], [0.15, 0]]):", "Z := MatrixInverse(IdentityMatrix(2) - Q);", "W := Z . R;", "Z . Vector([1, 1]);"], note: "Z . Vector([1, 1]) bildet die Zeilensummen: die durchschnittliche Anzahl Schüsse je nach Starter." },
    { t: "example", label: "Skriptum: ballspielende Kinder", title: "Absorbierende Mengen zu einem Zustand zusammenfassen", html: `Kind 3 behält den Ball (absorbierend), die Kinder {4, 6, 8} spielen untereinander ewig weiter (absorbierende Menge, zu einem Zustand geschrumpft). Transient: 1, 2, 5, 7.<br>Ergebnis: W-Zeile von Kind 1: <b>67 %</b> landet der Ball bei Kind 3, 33 % bei {4, 6, 8}. Kind 5: 11 % / 89 %.<br>Zeilensummen von Z: 3.33 (Kind 1), 2.33 (Kind 2), 1.89 (Kind 5), 2.67 (Kind 7). (Im Skriptum steht bei Kind 7 versehentlich 3.33.)` },
    { t: "maple", code: ["with(LinearAlgebra):", "Q := Matrix([[0, 1, 0, 0], [0, 0, 0, 1/2], [0, 0, 0, 1/3], [1/2, 0, 0, 0]]):", "R := Matrix([[0, 0], [1/2, 0], [0, 2/3], [0, 1/2]]):", "Z := MatrixInverse(IdentityMatrix(4) - Q);", "W := Z . R;", "evalf(Z . Vector([1, 1, 1, 1]));"] },
    C("Was gibt die Zeilensumme der Fundamentalmatrix Z an?", "Die durchschnittliche Anzahl der Schritte bis zur Absorption", ["Die Wahrscheinlichkeit zu gewinnen", "Immer 1", "Die Anzahl der Zustände"], "Summe der erwarteten Besuche in allen transienten Zuständen."),
    C("Wie berechnet man W?", "W = Z·R = (E − Q)⁻¹·R", ["W = Q·R", "W = (E − R)⁻¹", "W = Z + R"], "Fundamentalmatrix mal R."),
    C("Duell: Mit welcher Wahrscheinlichkeit überlebt A, wenn A beginnt?", "≈ 43 %", ["≈ 57 %", "≈ 10 %", "50 %"], "W(A schießt, B stirbt) = 20/47 ≈ 0.426."),
    { t: "keys", items: ["Absorbierende Zustände zuerst ordnen: P = [[E, 0], [R, Q]]", "Z = (E − Q)⁻¹: erwartete Besuche, Zeilensumme = erwartete Schritte", "W = Z·R: Absorptionswahrscheinlichkeiten, Zeilensumme 1", "Duell: A stirbt mit 27/47 ≈ 57 %"] }
  ] },
  { id: "m25-5", title: "Prüfungsaufgaben Markovketten: Roboter und Tennis", topic: "mt-mvert", min: 18, xp: 0, blocks: [
    { t: "lead", html: "Die Markov-Aufgabe ist in den Altprüfungen die mit den meisten Punkten (4). Vorgehen laut Folien: (1) Zustände feststellen, (2) Übergangsgraph mit allen Knoten und Kanten, (3) mit den Formeln lösen." },
    { t: "example", label: "Altprüfung SS 2016, Aufgabe 5 (4 Punkte)", title: "Roboter überwacht die Räume A bis F", html: `Laut Grundriss sind diese Räume durch Türen verbunden: A–B, A–C, A–D, B–C, B–D, C–E, C–F, D–E, D–F, E–F. Der Roboter wählt jede Tür seines Raums mit gleicher Wahrscheinlichkeit (auch zurück). Anzahl Türen: A 3, B 3, C 4, D 4, E 3, F 3.<br>(i) Übergangsmatrix, Spalten/Zeilen in der Reihenfolge A, B, C, D, E, F:${mx(mat([["0", "1/3", "1/3", "1/3", "0", "0"], ["1/3", "0", "1/3", "1/3", "0", "0"], ["1/4", "1/4", "0", "0", "1/4", "1/4"], ["1/4", "1/4", "0", "0", "1/4", "1/4"], ["0", "0", "1/3", "1/3", "0", "1/3"], ["0", "0", "1/3", "1/3", "1/3", "0"]]))}(ii) Start in A, p(0) = (1, 0, 0, 0, 0, 0). Nach 5 Schritten: P(F) = 11/81 ≈ 0.136. <b>Auf lange Sicht</b> (stabile Verteilung, die Kette ist ergodisch): P(F) = <b>3/20 = 0.15</b>. Allgemein: Türen des Raums / Summe aller Türen (3/20).` },
    { t: "maple", title: "Lösung SS 2016, Aufgabe 5", code: ["with(LinearAlgebra):", "P := Matrix([[0, 1/3, 1/3, 1/3, 0, 0], [1/3, 0, 1/3, 1/3, 0, 0], [1/4, 1/4, 0, 0, 1/4, 1/4], [1/4, 1/4, 0, 0, 1/4, 1/4], [0, 0, 1/3, 1/3, 0, 1/3], [0, 0, 1/3, 1/3, 1/3, 0]]):", "p0 := Vector([1, 0, 0, 0, 0, 0]):", "MatrixPower(Transpose(P), 5) . p0;", "v := NullSpace(IdentityMatrix(6) - Transpose(P))[1]:", "v / add(v[i], i = 1..6);"] },
    { t: "example", label: "Folien: Tennis", title: "Aufschläger gewinnt jeden Ballwechsel mit p = 0.55", html: `Zustände: Sieg T, Sieg N (absorbierend) und die 15 Spielstände 0:0, 15:0, …, 30:40 (30:30 = Einstand, 40:30 = Vorteil T, 30:40 = Vorteil N). Ergebnis aus Z und W:<br>· Bei 0:0 gewinnt der Aufschläger das Game mit <b>62 %</b>.<br>· Ein Game dauert im Schnitt <b>6.68 Ballwechsel</b> (Zeilensumme von Z bei 0:0).<br>· Bei 40:0 gewinnt der Rückschläger trotzdem noch mit 4 %.` },
    { t: "maple", title: "Tennis kompakt: nur Einstand, Vorteile und Sieg", code: ["with(LinearAlgebra):", "p := 0.55:  q := 1 - p:", "Q := Matrix([[0, p, q], [q, 0, 0], [p, 0, 0]]):", "R := Matrix([[0, 0], [p, 0], [0, q]]):", "W := MatrixInverse(IdentityMatrix(3) - Q) . R;"], note: "Transiente Zustände: Einstand, Vorteil T, Vorteil N. Ab Einstand gewinnt der Aufschläger mit p²/(p² + q²) ≈ 0.599, wie in den Folien (0.60). Die volle 17×17-Matrix steht im Maple-Labor als Arbeitsblatt." },
    C("Roboter SS 2016: Warum ist P(F) auf lange Sicht 3/20?", "Raum F hat 3 von insgesamt 20 Türenden; bei Zufallswegen ist der Anteil proportional zur Türanzahl", ["Weil es 6 Räume gibt", "Weil der Roboter in A startet", "Weil 11/81 ≈ 3/20"], "Bei einem zufälligen Weg auf einem Graphen ist die stabile Verteilung Grad/Summe der Grade."),
    C("Wie viele absorbierende Zustände hat das Tennis-Modell?", "2 (Sieg T, Sieg N)", ["15", "17", "0"], "Die 15 Spielstände sind transient."),
    { t: "keys", items: ["Vorgehen: Zustände → Graph → Matrix → Formel", "Roboter: P(F) nach 5 Schritten 11/81, langfristig 3/20", "Zufallsweg auf Graph: stabile Verteilung = Grad/Σ Grade", "Tennis p = 0.55: Game-Sieg 62 %, 6.68 Ballwechsel"] }
  ] }
  ] },
  questions: [
    Q("m2q501", "mt-mgraph", "Wahrscheinlichkeit, bei drei Versuchen à 60 % zu bestehen?", "0.936", ["0.6", "1.8", "0.216"], "0.6 + 0.24 + 0.096."),
    Q("m2q502", "mt-mgraph", "Was macht man mit Wahrscheinlichkeiten entlang eines Weges im Graphen?", "Multiplizieren", ["Addieren", "Mitteln", "Das Maximum nehmen"], "Verschiedene Wege werden addiert."),
    Q("m2q503", "mt-mgraph", "Wo steht die Wahrscheinlichkeit für den Übergang von Zustand 2 zu Zustand 3?", "Zeile 2, Spalte 3", ["Zeile 3, Spalte 2", "Diagonale", "Letzte Zeile"], "Zeile = von, Spalte = nach."),
    Q("m2q504", "mt-mgraph", "Ist [[0.5, 0.5], [0.3, 0.6]] eine Übergangsmatrix?", "Nein, die zweite Zeile ergibt 0.9", ["Ja", "Nein, weil die Diagonale nicht 1 ist", "Nein, weil sie nicht symmetrisch ist"], "Jede Zeilensumme muss 1 sein."),
    Q("m2q505", "mt-mvert", "Formel für die Verteilung nach n Schritten?", "p(n) = (Pᵀ)ⁿ·p(0)", ["p(n) = Pⁿ·p(0)", "p(n) = n·Pᵀ·p(0)", "p(n) = p(0)ⁿ"], "Skriptum Kap. 5.1."),
    Q("m2q506", "mt-mvert", "Marktbeispiel: Marktanteil von A nach einem Jahr?", "30 %", ["50 %", "34 %", "36 %"], "0.5·0.2 + 0.4·0.4 + 0.1·0.4."),
    Q("m2q507", "mt-mvert", "P = [[0.9, 0.1], [0.5, 0.5]], Start (1, 0). Verteilung nach einem Schritt?", "(0.9, 0.1)", ["(0.9, 0.5)", "(0.5, 0.5)", "(1, 0)"], "Erste Zeile von P, weil man sicher in Zustand 1 startet."),
    Q("m2q508", "mt-mvert", "Maple-Befehl für (Pᵀ)⁵?", "MatrixPower(Transpose(P), 5)", ["Transpose(P)*5", "Power(P, 5)", "P^T^5"], "Alternativ Transpose(P)^5."),
    Q("m2q509", "mt-ergod", "Stabile Verteilung des Marktbeispiels?", "≈ (0.33, 0.37, 0.30)", ["(0.5, 0.4, 0.1)", "(1/3, 1/3, 1/3)", "(0.3, 0.34, 0.36)"], "Genau (1/3, 10/27, 8/27)."),
    Q("m2q510", "mt-ergod", "Welche Bedingung gehört NICHT zur Ergodizität (Skriptum)?", "Die Matrix P ist symmetrisch", ["Keine absorbierenden Zustände", "Eine Potenz P, P², P⁴, … hat eine Spalte ohne Nullen", "Keine absorbierenden Mengen"], "Symmetrie wird nicht verlangt."),
    Q("m2q511", "mt-ergod", "Stabile Verteilung zu P = [[0.5, 0.5], [0.5, 0.5]]?", "(0.5, 0.5)", ["(1, 0)", "(0.25, 0.75)", "Es gibt keine"], "Symmetrisch, beide gleich."),
    Q("m2q512", "mt-ergod", "Stabile Verteilung zu P = [[0.8, 0.2], [0.4, 0.6]]?", "(2/3, 1/3)", ["(1/2, 1/2)", "(0.8, 0.6)", "(1/3, 2/3)"], "0.2·p₁ = 0.4·p₂ → p₁ = 2p₂, p₁ + p₂ = 1."),
    Q("m2q513", "mt-ergod", "SS 2012 PageRank: Wert für S3?", "12/29", ["4/29", "7/29", "1/4"], "p = (4, 6, 12, 7)/29."),
    Q("m2q514", "mt-absorb", "Formel der Fundamentalmatrix?", "Z = (E − Q)⁻¹", ["Z = Q⁻¹", "Z = E − Q", "Z = (E − R)⁻¹·Q"], "Q: transient → transient."),
    Q("m2q515", "mt-absorb", "Was ist w<sub>ij</sub> in W = Z·R?", "Die Wahrscheinlichkeit, von transient i aus in absorbierend j zu landen", ["Die Anzahl der Besuche in j", "Die Dauer bis zur Absorption", "Die Übergangswahrscheinlichkeit i → j in einem Schritt"], "Absorptionswahrscheinlichkeit."),
    Q("m2q516", "mt-absorb", "In welcher Reihenfolge ordnet man die Zustände für Z und W?", "Absorbierende zuerst, dann transiente", ["Transiente zuerst", "Alphabetisch", "Egal"], "Dann ist P = [[E, 0], [R, Q]]."),
    Q("m2q517", "mt-absorb", "Duell: Wie oft wird durchschnittlich geschossen, wenn A beginnt?", "≈ 8.1", ["≈ 4.25", "≈ 10", "≈ 2"], "Zeilensumme von Z: 200/47 + 180/47 = 380/47 ≈ 8.09."),
    Q("m2q518", "mt-absorb", "Prüfung mit 60 % pro Versuch und 3 Versuchen als absorbierende Kette: W(1. Versuch, bestanden)?", "0.936", ["0.6", "0.064", "1"], "Gleiches Ergebnis wie mit dem Baum."),
    Q("m2q519", "mt-mvert", "Roboter SS 2016: Wahrscheinlichkeit für Raum F auf lange Sicht?", "0.15", ["1/6", "0.2", "11/81"], "3 Türen von 20: 3/20."),
    Q("m2q520", "mt-absorb", "Tennis (p = 0.55): Wie oft gewinnt der Aufschläger ein Game ab 0:0?", "≈ 62 %", ["55 %", "≈ 75 %", "50 %"], "W-Matrix der Folien.")
  ],
  flashcards: [
    F("m2f501", "mt-mgraph", "Übergangsmatrix", "p<sub>ij</sub> = W! von i nach j, Zeile = von, Spalte = nach, Zeilensumme 1"),
    F("m2f502", "mt-mgraph", "Absorbierend vs. transient", "absorbierend: wird nie verlassen (p<sub>ii</sub> = 1) · transient: alle anderen"),
    F("m2f503", "mt-mvert", "Zustandsverteilung nach n Schritten", "p<sup>(n)</sup> = (Pᵀ)ⁿ·p<sup>(0)</sup>"),
    F("m2f504", "mt-ergod", "Stabile Verteilung", "(E − Pᵀ)·p = 0 und Σp<sub>i</sub> = 1"),
    F("m2f505", "mt-ergod", "Ergodische Kette (Bedingungen)", "keine absorbierenden Mengen/Zustände · P, P², P⁴, … hat eine Spalte ohne Nullen"),
    F("m2f506", "mt-absorb", "Blockform absorbierende Kette", "P = [[E, 0], [R, Q]], absorbierende Zustände zuerst"),
    F("m2f507", "mt-absorb", "Fundamentalmatrix Z", "Z = (E − Q)⁻¹ · z<sub>ik</sub> = erwartete Besuche in k · Zeilensumme = erwartete Schritte"),
    F("m2f508", "mt-absorb", "Absorptionsmatrix W", "W = Z·R · w<sub>ij</sub> = W! in absorbierendem j zu enden"),
    F("m2f509", "mt-ergod", "Maple: stabile Verteilung", "v := NullSpace(IdentityMatrix(n) − Transpose(P))[1]; v/add(v[i], i = 1..n)")
  ]
});
})();
