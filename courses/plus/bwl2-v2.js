/* BWL 2 · Prüfungs-Update (4.37): Prüfungstrainer mit Zufallszahlen (Widget „bwlgen“), Fallstudien 1 + 2 und Übung 3,
   neue Welt „Prüfungstraining kompakt“, Grafiken aus courses/plus/bwl2-figs2.js in den bestehenden Lektionen, Theoriefragen aus den VO-Folien.
   Quellen: VO-Foliensätze Termin 1–3 mit Mitschrift, Fallstudie 1 (mit Lösungen) und 2, Übungen 3–5, Altprüfung. */
(function () {
const FIGB = id => ({ t: "fig", id });
/* ======================= Fallstudien und Übung 3 als Rechenfälle ======================= */
const cases = {
  fs1: [
    { title: "FS 1 · Bsp. 3 · Pix-Mania: Kennzahlen zur Vermögenslage (TEUR)", text: "AV 360,10, Gesamtvermögen 724,60, Vorräte 158,30 (davon RHB 68,90, Vorjahr 53,50). Sachanlagen: AK 1.1. 542,00, AK 31.12. 595,30, kum. AfA 281,20, AfA des Jahres 65,00, Zugänge 58,10, Restbuchwert der Abgänge 0,10. Materialaufwand 554,70.",
      steps: [{ q: "Anlagenintensität (%)", a: 49.70, tol: 0.05, how: "360,10 / 724,60" }, { q: "Lagerintensität (%)", a: 21.85, tol: 0.05, how: "158,30 / 724,60" }, { q: "Anlagenabnutzungsgrad (%)", a: 47.24, tol: 0.05, how: "281,20 / 595,30 (historische AK)" }, { q: "Abschreibungsquote (%)", a: 11.43, tol: 0.05, how: "65,00 / ((542,00 + 595,30) / 2)" }, { q: "Investitionsdeckung (%)", a: 89.23, tol: 0.35, how: "(58,10 − 0,10) / 65,00 · die offizielle Lösung rechnet 58,20 → 89,54 %" }, { q: "Lagerdauer RHB (Tage)", a: 40.27, tol: 0.1, how: "LUH = 554,70 / ((68,90 + 53,50) / 2) = 9,06 → 365 / 9,06" }],
      concl: "Knapp die Hälfte der Anlagen ist abgeschrieben. Die Abschreibungsquote von 11 % heißt: Nutzungsdauer rund 10 Jahre, die Maschinen halten im Schnitt noch etwa 5 Jahre. Es wird etwas weniger investiert als abgeschrieben (Abschreibungsfinanzierung), aber nicht bedenklich. Lagerdauer 40 Tage gegenüber Branchendurchschnitt 101,77 Tage (KSW): deutlich schneller als die Branche." },
    { title: "FS 1 · Bsp. 2 · Tischlerei Müller KG: Abschlussbuchungen nach UGB", text: "Vorläufiger Gewinn 27.000. (1) Büroeinrichtung im Juli um 12.000 + 20 % USt, ND 10 J., noch keine AfA. (2) Waren BW 50.000, Wiederbeschaffungswert 53.000. (3) Treibstoff Firmen-PKW 49 inkl. USt bar, noch nicht gebucht. (4) Generalüberholung 10.000 unterlassen, wird nächstes Jahr nachgeholt. (5) Neuer PKW 20.000 inkl. USt auf Ziel + Anmeldung 150 bar, noch nicht in Betrieb. (6) Unbebautes Grundstück BW 15.000, Verkehrswert dauerhaft nur noch 5.000.",
      steps: [{ q: "AfA Büroeinrichtung (€)", a: 600, tol: 0.5, how: "12.000 netto / 10 × ½ (Halbjahresregel, Juli)" }, { q: "Aufwertung der Waren (€)", a: 0, tol: 0.5, how: "Verboten: Anschaffungskosten sind die Obergrenze" }, { q: "Rückstellung für unterlassene Instandhaltung (€)", a: 10000, tol: 0.5, how: "Aufwandsrückstellung, Gewinn −10.000" }, { q: "Zugang Kfz im Anlagevermögen (€)", a: 20150, tol: 0.5, how: "20.000 brutto (beim PKW kein Vorsteuerabzug) + 150 Nebenkosten, noch keine AfA" }, { q: "Außerplanmäßige Abschreibung Grundstück (€)", a: 10000, tol: 0.5, how: "15.000 − 5.000, Niederstwertprinzip im AV bei dauernder Wertminderung" }, { q: "Endgültiger Gewinn (€)", a: 6351, tol: 0.5, how: "27.000 − 600 − 49 − 10.000 − 10.000" }],
      concl: "Bilanzsumme steigt auf 559.351. Die wichtigsten UGB-Regeln aus diesem Fall: Vorsteuer ist keine AK (außer beim PKW), AfA erst ab Inbetriebnahme mit Halbjahresregel, Aufwertung über AK verboten, Abwertung bei dauernder Wertminderung Pflicht." }
  ],
  fs2: [
    { title: "FS 2 · Bsp. 1 · Pix-Mania: Vermögens- und Finanzlage (TEUR)", text: "Umsatz 1.174,30 (enthält 20 % USt-pflichtige Erlöse), Forderungen L+L 87,70 (Vorjahr 108,50). Materialaufwand 554,70, Lieferverbindlichkeiten 61,50 (Vorjahr 64,70). EK 191,70, Bilanzsumme 724,60, AV 360,10. Langfristiges FK: Abfertigungsrückstellung 60,00 + Pensionsrückstellung 4,20 + Bank über 1 Jahr 200,40 + sonstige Verbindlichkeiten über 1 Jahr 0,70. Kein langfristiges UV.",
      steps: [{ q: "Debitorenumschlagsdauer (Tage)", a: 25.41, tol: 0.15, how: "1.174,30 × 1,2 = 1.409,16; Ø Ford. 98,10 → 14,36-mal → 365 / 14,36" }, { q: "Eigenkapitalquote (%)", a: 26.46, tol: 0.05, how: "191,70 / 724,60" }, { q: "Fremdkapitalquote (%)", a: 73.54, tol: 0.05, how: "532,90 / 724,60" }, { q: "Kreditorenumschlagshäufigkeit (×)", a: 10.55, tol: 0.03, how: "554,70 × 1,2 = 665,64; Ø Verb. LL 63,10" }, { q: "Deckungsgrad C (%)", a: 126.91, tol: 0.2, how: "(191,70 + 265,30) / (360,10 + 0)" }],
      concl: "Kunden zahlen nach rund 25 Tagen, Pix-Mania zahlt Lieferanten nach rund 35 Tagen: günstig für die Liquidität. EK-Quote 26,5 % liegt über dem Branchendurchschnitt von 12,57 % (KSW) und ist gegenüber 18,8 % im Vorjahr deutlich gestiegen, weil Gewinne einbehalten wurden. Deckungsgrad C über 100 %: Das AV ist fristenkongruent finanziert." },
    { title: "FS 2 · Bsp. 2 · Pix-Mania: Liquidität und Rentabilität (TEUR)", text: "Liquide Mittel 101,20, Forderungen L+L 87,70, sonstige Forderungen 17,20, Vorräte 158,30. Kurzfristiges FK: Steuerrückstellungen 15,20 + sonstige Rückstellungen 66,40 + Verbindlichkeiten bis 1 Jahr 186,00. Jahresüberschuss 66,20, FK-Zinsen 14,80, EK 191,70, GK 724,60.",
      steps: [{ q: "Kurzfristiges Fremdkapital (TEUR)", a: 267.6, tol: 0.05, how: "15,20 + 66,40 + 186,00" }, { q: "Liquidität 1. Grades (%)", a: 37.82, tol: 0.1, how: "101,20 / 267,60" }, { q: "Liquidität 2. Grades (%)", a: 77.02, tol: 0.1, how: "(101,20 + 87,70 + 17,20) / 267,60" }, { q: "Liquidität 3. Grades (%)", a: 136.17, tol: 0.15, how: "(206,10 + 158,30) / 267,60" }, { q: "Eigenkapitalrentabilität (%)", a: 34.53, tol: 0.1, how: "66,20 / 191,70 · keine Zinsen dazu!" }, { q: "Gesamtkapitalrentabilität (%)", a: 11.18, tol: 0.05, how: "(66,20 + 14,80) / 724,60" }],
      concl: "Liquidität 2. Grades unter 100 %: Geld und Forderungen decken die kurzfristigen Schulden nicht ganz, mit Vorräten (3. Grad) schon. Die Gesamtkapitalrentabilität von 11,2 % liegt über dem FK-Zins von rund 5,2 % (14,80 / 286,80): positiver Leverage-Effekt. Mitschrift: EKR = Gewinn / EK, GKR = (Gewinn + Zinsen) / (EK + FK)." },
    { title: "FS 2 · Bsp. 3 · Fine Print GmbH: Kapitalflussrechnung (€)", text: "Jahresüberschuss 3.582.000, AfA 7.081.000, Dotierung Abfertigungsrückstellung 409.000, Gewinne aus Anlagenabgang 300.000. Veränderung Working Capital gesamt −2.509.000 (Forderungen L+L −2.462.000). Neue Bankkredite 1.850.000. Investitions-Cashflow −8.913.000. Anfangsbestand liquide Mittel 2.500.000.",
      steps: [{ q: "Cashflow aus dem Ergebnis (€)", a: 10772000, tol: 0.5, how: "3.582.000 + 7.081.000 + 409.000 − 300.000" }, { q: "Operativer Cashflow (€)", a: 8263000, tol: 0.5, how: "10.772.000 − 2.509.000" }, { q: "Veränderung der liquiden Mittel (€)", a: 1200000, tol: 0.5, how: "8.263.000 + 1.850.000 − 8.913.000" }, { q: "Endbestand liquide Mittel (€)", a: 3700000, tol: 0.5, how: "2.500.000 + 1.200.000" }],
      concl: "Die Abschreibungen sind fast doppelt so hoch wie der Gewinn: starke Innenfinanzierung. Gestiegene Kundenforderungen binden 2,5 Mio. Der operative Cashflow deckt rund 93 % der Investitionen, den Rest finanzieren neue Bankkredite. Investitionen über den Abschreibungen bedeuten Wachstum, nicht nur Ersatz." }
  ],
  u3: [
    { title: "Übung 3 · Bsp. 1 · Betriebsüberleitung und Zuschläge", text: "Aufwand FIBU 5.065.000. Material 400.000 und Hilfsstoffe 60.000 (+10 % Preissteigerung), Löhne 1.000.000 + Hilfslöhne 500.000 (+5 %), Lohnnebenkosten steigen auf 100 % der Löhne. Zinsen 300.000 → kalk. 10 % auf betriebsnotwendiges Kapital 5 Mio. AfA 600.000 → +20 % Wiederbeschaffung. Schadensfälle 120.000 → kalk. Wagnisse 100.000. Sonstige 600.000. Ao. Aufwand 60.000 (Restbuchwert). Unternehmerlohn 500.000.",
      steps: [{ q: "Kalkulatorische Zinsen (€)", a: 500000, tol: 0.5, how: "5.000.000 × 10 % (Anderskosten)" }, { q: "Kalkulatorische AfA (€)", a: 720000, tol: 0.5, how: "600.000 × 1,2" }, { q: "Lohnnebenkosten in der KORE (€)", a: 1575000, tol: 0.5, how: "100 % von (1.050.000 + 525.000)" }, { q: "Kosten gesamt laut BÜB (€)", a: 6076000, tol: 0.5, how: "ao. Aufwand fällt weg (neutral), Unternehmerlohn kommt dazu (Zusatzkosten)" }, { q: "Variable Selbstkosten des Auftrags (€): FM 10.000, MGK 12,27 %, FL 10,50 × 500 h, FGK 21,16 €/h, VwGK 3,44 %", a: 27988.75, tol: 2, how: "11.227,27 + 5.250 + 10.580 = 27.057,27 HK; + 3,44 % = 27.988,75" }],
      concl: "Der ao. Aufwand ist neutraler Aufwand und fällt weg. Der Unternehmerlohn ist Zusatzkosten. Alle anderen Positionen werden neu bewertet (Anderskosten). Beim BAB zu Teilkosten werden nur die variablen Anteile (Variator ÷ 10) verteilt." },
    { title: "Übung 3 · Bsp. 2 · Stufenweise Fixkostendeckung", text: "S1: p 10, kv 6, 200 Stk · S2: 20 / 14,40 / 400 · S3: 15 / 12 / 350 (Eigenerzeugnisse) · S4: 25 / 22 / 450 · S5: 10 / 8 / 150 (Handelswaren). Fix: Spezialmaschine S1 400, Maschine S2+S3 2.290, Bereich Eigenerzeugnisse 1.000, Handelswaren 1.700, gesamt 5.500.",
      steps: [{ q: "DB I gesamt (€)", a: 5740, tol: 0.5, how: "800 + 2.240 + 1.050 + 1.350 + 300" }, { q: "Betriebsergebnis (€)", a: 240, tol: 0.5, how: "5.740 − 5.500" }, { q: "DB III Bereich Handelswaren (€)", a: -50, tol: 0.5, how: "1.350 + 300 − 1.700" }, { q: "Unternehmensfixkosten (€)", a: 110, tol: 0.5, how: "5.500 − 400 − 2.290 − 1.000 − 1.700" }],
      concl: "Einstufig haben alle Artikel einen positiven DB, also kurzfristig nichts streichen. Stufenweise zeigt sich: Der Bereich Handelswaren deckt seine eigenen Fixkosten nicht (−50). Sind die 1.700 abbaubar, steigt das Ergebnis ohne Handelswaren auf 290." }
  ]
};

/* ======================= Inhalte ======================= */
const GEN = (types, title, topic) => ({ t: "widget", w: "bwlgen", types, title, topic });
const EX = (title, html, label = "Beispiel aus der Vorlesung") => ({ t: "example", label, title, html });
const CK = (q, opts, a, why) => ({ t: "check", q, opts, a, why });
const TIP = (title, html) => ({ t: "tip", title, html });

const blocks = {
  "b1-1": [FIGB("bwl2v-begriffe"),
    EX("Kredit über 100.000 € aufnehmen (Mitschrift Termin 1)", `<p>Bank +100.000 auf der Aktivseite, Fremdkapital +100.000 auf der Passivseite.</p><p>Das ist eine <b>Einzahlung</b>, aber <b>kein Ertrag</b>: Du bist nicht reicher, du schuldest das Geld. Bilanzverlängerung, die GuV bleibt unberührt.</p><p>Gegenstück: Eine Maschine um 100.000 € über 5 Jahre abschreiben ergibt jedes Jahr 20.000 € <b>Aufwand ohne Auszahlung</b>.</p>`)],
  "b1-2": [FIGB("bwl2v-bilanz4"), FIGB("bwl2v-ekv"), FIGB("bwl2v-rueckst"), GEN(["ekv"], "Jahresergebnis per Eigenkapitalvergleich", "b-ja")],
  "b2-1": [FIGB("bwl2v-anlsp"), FIGB("bwl2v-debi"), GEN(["debi", "invdeck", "anlab"], "Vermögenslage mit neuen Zahlen", "b-verm"),
    TIP("Datenquelle merken", "Bilanz = Stichtag (31.12.), GuV = Zeitraum (1.1. bis 31.12.). Steht eine GuV-Größe einer Bilanzgröße gegenüber, nimmst du von der Bilanzgröße den <b>Durchschnitt</b> aus Anfangs- und Endbestand.")],
  "b2-2": [FIGB("bwl2v-deckung"), GEN(["dg", "fkq"], "Finanzlage mit neuen Zahlen", "b-fin"),
    EX("IT-GmbH A gegen IT-GmbH B (Mitschrift)", `<p>A: 90 % EK, 10 % FK. B: 10 % EK, 90 % FK. Beide können gesund sein: Eine IT-GmbH mit 10.000 € Stammkapital, die ihre Gewinne einbehält, hat schnell viel EK. Eigenkapital ist Stammkapital <b>plus</b> Rücklagen und Bilanzgewinn.</p><p>Die „verstaubten“ Regeln EK : FK = 1 : 1 oder 2 : 1 (Banker’s Rule) sind nur grobe Richtwerte. Vergleiche immer mit der Branche.</p>`)],
  "b2-3": [FIGB("bwl2v-cfsign"), GEN(["cfe"], "Cashflow aus dem Ergebnis rechnen", "b-cf"),
    EX("Dynamische Schuldentilgungsdauer (Mitschrift Termin 2)", `<p>Effektivverschuldung zum 31.12. = Fremdkapital − liquide Mittel − Wertpapiere des UV = 200.</p><p>Operativer Cashflow im Jahr = 100.</p><p>Schuldentilgungsdauer = 200 / 100 = <b>2 Jahre</b>. Bestandsgröße (Stichtag) durch Stromgröße (Zeitraum).</p>`)],
  "b2-4": [GEN(["gkr"], "Gesamtkapitalrentabilität rechnen", "b-ertr")],
  "b3-1": [FIGB("bwl2v-verlauf"), FIGB("bwl2v-fixdeg"), GEN(["fkd"], "Stückkosten bei verschiedener Auslastung", "b-kore"),
    EX("20 Mio. Fixkosten, 100 Betten (VO-Folie)", `<p>Kosten je Bett = 20.000.000 / Auslastung:</p><table class="dt"><tr><th>Belegt</th><th>1</th><th>10</th><th>50</th><th>100</th><th>120</th></tr><tr><td>€ je Stück</td><td>20 Mio.</td><td>2 Mio.</td><td>400.000</td><td>200.000</td><td>166.667</td></tr></table><p>Wer große Mengen absetzt, kann den Preis senken und trotzdem verdienen. Neue Anbieter mit kleiner Menge schaffen den Break-even nicht: eine <b>Markteintrittsbarriere</b>.</p>`)],
  "b3-2": [FIGB("bwl2v-bub"), FIGB("bwl2v-bab"), GEN(["kalk"], "Zuschlagskalkulation mit neuen Zahlen", "b-bab")],
  "b3-4": [FIGB("bwl2v-pug"), GEN(["bep", "bepmehr", "preis"], "Break-even und Preisuntergrenzen mit neuen Zahlen", "b-entsch")],
  "b4-1": [GEN(["amort"], "Amortisationsdauer mit neuen Zahlen", "b-stat")],
  "b4-2": [GEN(["kw"], "Kapitalwert mit neuen Zahlen", "b-dyn"),
    TIP("Excel in der Klausur", "Excel ist erlaubt. Kapitalwert: <code>=NBW(Zins; Rückflüsse) − A₀</code> (NBW zinst ab t = 1). Interner Zinsfuß: <code>=IKV(alle Zahlungen ab t = 0)</code> oder über <b>Daten › Was-wäre-wenn-Analyse › Zielwertsuche</b>: Zielzelle KW auf 0 setzen, veränderbare Zelle = Zinssatz. Die Näherungsformel aus der Übung liegt oft 1 Prozentpunkt neben dem exakten Wert.")],
  "b5-1": [FIGB("bwl2v-finmatrix")],
  "bx-1": [FIGB("bwl2v-pflicht"), GEN(["pflicht"], "Buchführungspflicht mit neuen Umsätzen", "bx-pflicht")],
  "bx-2": [FIGB("bwl2v-urg"), GEN(["urg"], "URG-Kennzahlen mit neuen Zahlen", "bx-urg")],
  "bx-3": [GEN(["afa"], "AfA im Anschaffungsjahr mit neuen Zahlen", "bx-afa")]
};
const AT = { "b1-2": 0, "b3-1": 1, "b3-2": 0, "b3-4": 0, "b5-1": 0 };
Object.entries(AT).forEach(([lid, at]) => (blocks[lid] || []).forEach(b => { if (b.at == null) b.at = at; }));

/* Neue Welt: Prüfungstraining kompakt */
const FALLEN = [
  ["Buchführungspflicht", "Five in One KG angekreuzt", "Nur EIN Jahr über 700.000 € reicht nicht. GmbH und AG immer."],
  ["Deckungsgrad B", "Rückstellungen mitgezählt", "Rückstellungen, die in 4 Monaten aufgelöst werden, sind kurzfristig. Nur EK + unvers. Rücklagen + 200.000 lfr. Verbindlichkeiten: 88,30 %."],
  ["Kostenerfassung aus der Bilanz?", "Richtig gewählt", "Falsch. Die Kosten kommen überwiegend aus der GuV bzw. Buchhaltung (Aufwand → Kosten)."],
  ["Gewinn per EK-Vergleich", "Entnahmen vergessen", "82.600 − 98.000 + 12.000 = −3.400 € Verlust."],
  ["Vollkommener Kapitalmarkt", "Soll ≠ Haben gewählt", "Falsch. Im vollkommenen Kapitalmarkt sind Soll- und Habenzins gleich."],
  ["Kapitalwert = Vermögensänderung am Ende?", "Richtig gewählt", "Falsch. Der KW misst die Vermögensänderung bezogen auf t = 0 (heute)."],
  ["Kapitalerhöhung, neuer Gesellschafter", "Innenfinanzierung gewählt", "Beides ist Außen- und Eigenfinanzierung (Beteiligungsfinanzierung)."],
  ["Dynamische Verfahren", "Erträge/Aufwand gewählt", "Falsch. Dynamische Verfahren rechnen mit Ein- und Auszahlungen."],
  ["Rückstellung Steuerberater", "Liquidität sinkt angekreuzt", "Bildung = Aufwand 2x13, aber keine Zahlung. Richtig: (a) und (b)."],
  ["Kapital- vs. Gewinnrücklage", "vertauscht", "Kapitalrücklage kommt von außen (Agio), Gewinnrücklage aus dem Jahresüberschuss."]
];
const world = { id: "bvw", n: 7, title: "Prüfungstraining kompakt", sub: "Altprüfungs-Fallen, Zufallsaufgaben, Fallstudien 1 + 2, Übung 3", boss: null, lessons: [
  { id: "bv-1", title: "Die 10 Fallen aus deiner Altprüfung", topic: "bv-fallen", min: 14, xp: 30, blocks: [
    { t: "lead", html: "In der Altprüfung sind 10 Fragen daneben gegangen. Fast immer war es dieselbe Art Fehler: ein Detail der Angabe überlesen. Hier sind alle 10 auf einen Blick, danach die passenden Animationen." },
    { t: "html", html: `<table class="dt"><tr><th>Thema</th><th>Was passiert ist</th><th>So ist es richtig</th></tr>${FALLEN.map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</table>` },
    { t: "keys", items: ["<b>Angabe zweimal lesen:</b> „abnutzbar“, „unversteuerte Rücklagen zum EK“, „innerhalb von 4 Monaten“, „exkl. USt“ sind immer Hinweise.", "<b>Richtig/Falsch-Fragen</b> sind oft wörtlich von den Folien, aber mit einem vertauschten Wort (Ende statt t = 0, Erträge statt Einzahlungen).", "<b>Minuspunkte:</b> Bei Mehrfachauswahl nur ankreuzen, was du sicher begründen kannst.", "<b>Bestehen erst über 60 %:</b> 60,00 % ist noch „Nicht genügend“."] },
    FIGB("bwl2v-pflicht"), FIGB("bwl2v-ekv"), FIGB("bwl2v-rueckst"), FIGB("bwl2v-deckung"), FIGB("bwl2v-finmatrix"),
    CK("Der Kapitalwert einer Investition ist …", ["die Vermögensänderung am Ende der Laufzeit", "die Vermögensänderung bezogen auf den Zeitpunkt t = 0", "die Summe aller Rückflüsse", "der Zinssatz, bei dem der KW null ist"], 1, "Alle Zahlungen werden auf t = 0 abgezinst. Der aufgezinste Wert am Ende wäre der Endwert."),
    CK("Eine OG hat Umsätze 20x1: 650.000, 20x2: 720.000, 20x3: 690.000. Ab wann muss sie doppelt buchführen?", ["ab 20x3", "ab 20x4", "ab 20x5", "bisher keine Pflicht"], 3, "700.000 € wurden nur in einem Jahr überschritten. Es braucht zwei aufeinanderfolgende Jahre.")
  ] },
  { id: "bv-2", title: "Prüfungstrainer: Rechnen mit Zufallszahlen", topic: "bv-fallen", min: 20, xp: 30, blocks: [
    { t: "lead", html: "Jede Aufgabe hat neue Zahlen, jede falsche Antwort ist ein typischer Fehler aus der Altprüfung. Schaffst du 10 richtige, gibt es Bonus-XP." },
    GEN(null, "Prüfungstrainer: alle Rechenarten gemischt", "bv-fallen"),
    TIP("So teilst du die 90 Minuten ein", "90 Punkte in 90 Minuten: etwa eine Minute pro Punkt. Zuerst alle Theoriefragen (schnell, rund 45 Punkte), dann die Rechnungen nach Punkten sortiert. Excel offen lassen und Zwischenergebnisse in Zellen rechnen, nicht im Kopf runden.")
  ] },
  { id: "bv-3", title: "Fallstudie 1: Geschäftsfälle, Abschluss, Vermögenslage", topic: "bv-fs", min: 25, xp: 40, blocks: [
    { t: "lead", html: "Fallstudie 1 aus der Übung, komplett durchgerechnet: acht Geschäftsfälle, der Jahresabschluss der Tischlerei Müller KG und die Vermögenslage der Pix-Mania GmbH." },
    { t: "html", html: `<h3>Bsp. 1 · Wie wirken die Geschäftsfälle?</h3><table class="dt"><tr><th>Geschäftsfall</th><th>Bilanz</th><th>GuV</th><th>Liquide Mittel</th></tr>
<tr><td>Handelswaren auf Ziel 35.000</td><td>Vorräte ↑, Verb. LL ↑ (Verlängerung)</td><td>–</td><td>–</td></tr>
<tr><td>Kunde zahlt Forderung bar 2.000</td><td>Kassa ↑, Forderungen ↓ (Aktivtausch)</td><td>–</td><td>↑ 2.000</td></tr>
<tr><td>Postspesen bar 13</td><td>Kassa ↓, EK ↓</td><td>Aufwand 13</td><td>↓ 13</td></tr>
<tr><td>FK-Zinsen per Bank 200</td><td>Bank ↓, EK ↓</td><td>Zinsaufwand 200</td><td>↓ 200</td></tr>
<tr><td>Fertigerzeugnisse auf Ziel 25.000</td><td>Forderungen ↑ (brutto), Fertigerzeugnisse ↓, USt-Verb. ↑</td><td>Umsatz ↑</td><td>–</td></tr>
<tr><td>Software-AfA 8.000</td><td>AV ↓, EK ↓</td><td>Aufwand 8.000</td><td>–</td></tr>
<tr><td>Gewährleistungsrückstellung 50.000</td><td>Rückstellung (FK) ↑, EK ↓</td><td>Aufwand 50.000</td><td>–</td></tr>
<tr><td>PR-Agentur 5.000 per Bank</td><td>Bank ↓, EK ↓ (nicht aktivierbar)</td><td>Aufwand 5.000</td><td>↓ 5.000</td></tr></table>` },
    FIGB("bwl2v-bilanz4"),
    { t: "widget", w: "cases", topic: "bv-fs", set: "fs1" },
    FIGB("bwl2v-anlsp"),
    CK("Der Wiederbeschaffungswert der Waren (53.000) liegt über dem Buchwert (50.000). Was passiert im UGB-Abschluss?", ["Aufwertung auf 53.000", "Keine Buchung, Aufwertung über die AK ist verboten", "Aufwertung um die Hälfte", "Bildung einer Rückstellung"], 1, "Anschaffungskosten sind die Obergrenze (Vorsichts- und Realisationsprinzip). Abwertungen bei dauernder Wertminderung sind dagegen Pflicht.")
  ] },
  { id: "bv-4", title: "Fallstudie 2: Finanz- und Ertragslage, Kapitalflussrechnung", topic: "bv-fs", min: 25, xp: 40, blocks: [
    { t: "lead", html: "Fallstudie 2: dieselbe Pix-Mania GmbH, jetzt Finanzierung, Liquidität und Rentabilität. Dazu die Kapitalflussrechnung der Fine Print GmbH zum Interpretieren." },
    { t: "keys", items: ["Fristigkeiten stehen im <b>Anhang</b>: Restlaufzeit über 1 Jahr = langfristig. Ohne Angabe gilt: höchstens 1 Jahr.", "Erlöse und Material enthalten 20 % USt → für Debitoren und Kreditoren <b>× 1,2</b>.", "EKR = Gewinn / EK (keine Zinsen!), GKR = (Gewinn + FK-Zinsen) / GK.", "Liquidität: 1. Grad nur Geld, 2. Grad + Forderungen, 3. Grad + Vorräte, immer durch kurzfristiges FK."] },
    { t: "widget", w: "cases", topic: "bv-fs", set: "fs2" },
    FIGB("bwl2v-cfsign"),
    CK("Pix-Mania: Liquidität 2. Grades 77 %, Liquidität 3. Grades 136 %. Was heißt das?", ["Das Unternehmen ist zahlungsunfähig", "Ohne den Verkauf von Vorräten reichen Geld und Forderungen nicht ganz für die kurzfristigen Schulden", "Die Vorräte sind zu niedrig", "Das Eigenkapital ist zu gering"], 1, "Die Vorräte müssen rasch verwertbar sein, damit die kurzfristigen Schulden gedeckt sind. Kritisch prüfen, aber kein Alarm.")
  ] },
  { id: "bv-5", title: "Übung 3: BÜB, BAB zu Teilkosten, DB-Rechnung", topic: "bv-fs", min: 20, xp: 35, blocks: [
    { t: "lead", html: "Übung 3 hatte keine Musterlösung. Hier ist sie, Schritt für Schritt." },
    FIGB("bwl2v-bub"),
    { t: "html", html: `<h3>Betriebsüberleitung</h3><table class="dt"><tr><th>Position</th><th>Aufwand</th><th>Kosten</th><th>Art</th></tr>
<tr><td>Material (+10 %)</td><td>400.000</td><td>440.000</td><td>Anderskosten</td></tr><tr><td>Hilfsstoffe (+10 %)</td><td>60.000</td><td>66.000</td><td>Anderskosten</td></tr>
<tr><td>Fertigungslöhne (+5 %)</td><td>1.000.000</td><td>1.050.000</td><td>Anderskosten</td></tr><tr><td>Hilfslöhne (+5 %)</td><td>500.000</td><td>525.000</td><td>Anderskosten</td></tr>
<tr><td>Lohnnebenkosten (100 % der Löhne)</td><td>1.425.000</td><td>1.575.000</td><td>Anderskosten</td></tr><tr><td>Zinsen → kalk. 10 % von 5 Mio.</td><td>300.000</td><td>500.000</td><td>Anderskosten</td></tr>
<tr><td>AfA → +20 % Wiederbeschaffung</td><td>600.000</td><td>720.000</td><td>Anderskosten</td></tr><tr><td>Schadensfälle → kalk. Wagnisse</td><td>120.000</td><td>100.000</td><td>Anderskosten</td></tr>
<tr><td>Sonstige</td><td>600.000</td><td>600.000</td><td>Grundkosten</td></tr><tr><td>ao. Aufwand (Restbuchwert)</td><td>60.000</td><td>0</td><td>neutraler Aufwand</td></tr>
<tr><td>Unternehmerlohn</td><td>0</td><td>500.000</td><td>Zusatzkosten</td></tr><tr><td><b>Summe</b></td><td><b>5.065.000</b></td><td><b>6.076.000</b></td><td></td></tr></table>
<p><b>Variatoren:</b> Variator 8 heißt 80 % variabel, 20 % fix. Beim BAB zu Teilkosten werden nur die variablen Teile verteilt. Ergebnis: MGK 12,27 %, FGK 201,52 % (oder 21,16 € je Stunde), VwGK 3,44 % auf die variablen Herstellkosten.</p>` },
    { t: "widget", w: "cases", topic: "bv-fs", set: "u3" },
    CK("Der außerordentliche Aufwand ist der Restbuchwert einer verkauften Maschine. Wie wird er in der Betriebsüberleitung behandelt?", ["als Grundkosten übernommen", "als neutraler Aufwand ausgeschieden", "als Anderskosten neu bewertet", "als Zusatzkosten ergänzt"], 1, "Der Verkauf einer Maschine ist nicht der Betriebszweck. Neutraler Aufwand kommt nicht in die Kostenrechnung.")
  ] },
  { id: "bv-6", title: "Formelsammlung für die Klausur", topic: "bv-fallen", min: 8, xp: 15, blocks: [
    { t: "lead", html: "Alle Formeln aus Folien und Mitschrift auf einer Seite. Wichtig ist nicht das Auswendiglernen („never ever learn things by heart in accounting“), sondern zu wissen, woher jede Zahl kommt." },
    { t: "html", html: `<table class="dt"><tr><th>Kennzahl</th><th>Formel</th><th>Achtung</th></tr>
<tr><td>Anlageintensität</td><td>AV / Gesamtvermögen</td><td></td></tr>
<tr><td>Anlagenabnutzungsgrad</td><td>kum. AfA SAV / historische AK SAV Ende</td><td>nur Sachanlagen, „abnutzbar“ = ohne Grund</td></tr>
<tr><td>Abschreibungsquote</td><td>AfA SAV / Ø historische AK SAV</td><td>Kehrwert ≈ Nutzungsdauer</td></tr>
<tr><td>Investitionsdeckung</td><td>Nettoinvestitionen / AfA SAV</td><td>über 100 % = Substanz wächst</td></tr>
<tr><td>Lagerdauer</td><td>365 / (Materialeinsatz / Ø Vorräte)</td><td>Durchschnitt bilden</td></tr>
<tr><td>Debitorendauer</td><td>365 / (Umsatz + USt / Ø Forderungen LL)</td><td>+ 20 % USt!</td></tr>
<tr><td>Kreditorendauer</td><td>365 / (Materialeinkauf + USt / Ø Verb. LL)</td><td>+ 20 % USt!</td></tr>
<tr><td>Finanzierungslücke</td><td>Lagerdauer + Debitorendauer − Kreditorendauer</td><td>in Tagen</td></tr>
<tr><td>EK-Quote / FK-Quote</td><td>EK / GK, FK / GK</td><td>Summe 100 %</td></tr>
<tr><td>Deckungsgrad A / B / C</td><td>EK / AV · (EK + lfr. FK) / AV · (EK + lfr. FK) / (AV + lfr. UV)</td><td>Fristen aus dem Anhang</td></tr>
<tr><td>Liquidität 1. / 2. / 3. Grad</td><td>Geld · + Forderungen · + Vorräte, jeweils / kfr. FK</td><td>Cash Ratio, Quick Ratio, Current Ratio</td></tr>
<tr><td>CF aus dem Ergebnis</td><td>JÜ + AfA − Zuschreibungen ± Dotierung lfr. RSt ∓ Gewinne/Verluste Anlagenabgang</td><td>indirekte Methode</td></tr>
<tr><td>Schuldentilgungsdauer</td><td>(FK − liquide Mittel − WP UV) / Cashflow</td><td>Jahre</td></tr>
<tr><td>ROE / ROI</td><td>EBT / Ø EK · (EBT + FK-Zinsen) / Ø GK</td><td>Zinsen nur beim ROI</td></tr>
<tr><td>Break-even-Menge</td><td>Fixkosten / (p − kv)</td><td></td></tr>
<tr><td>Preisuntergrenze</td><td>kurzfristig kv · langfristig Vollkosten</td><td>bei Engpass + entgangener DB</td></tr>
<tr><td>Amortisation (Ø)</td><td>(AK − RW) / (Ø Gewinn + AfA)</td><td>Rückfluss = Gewinn + AfA</td></tr>
<tr><td>Kapitalwert</td><td>Σ Rückfluss / (1 + i)ᵗ − A₀</td><td>bezogen auf t = 0</td></tr>
<tr><td>URG</td><td>EMQ &lt; 8 % UND fiktive SDT &gt; 15 Jahre</td><td>beide gleichzeitig</td></tr>
<tr><td>Buchführungspflicht</td><td>GmbH/AG immer · &gt; 1 Mio. → Folgejahr · 2 × &gt; 700.000 → zweitfolgendes Jahr</td><td></td></tr></table>` }
  ] }
] };

/* Theoriefragen aus den VO-Folien und Mitschriften (Moodle: ~45 Punkte Theorie) */
const QS = [
  ["b-kore", "Welche Aussage zur Kostenrechnung (KORE) im Vergleich zur Finanzbuchhaltung ist richtig?", ["Die KORE ist freiwillig, unterjährig und zukunftsorientiert", "Die KORE ist gesetzlich vorgeschrieben (UGB)", "Die KORE rechnet mit Aufwand und Ertrag", "Die KORE betrachtet immer genau 12 Monate"], 0, "FIBU: per Gesetz, 12 Monate, vergangenheitsorientiert, Aufwand/Ertrag. KORE: freiwillig, unterjährig, zukunftsorientiert, Kosten/Leistungen."],
  ["b-kore", "Welche Leitfrage gehört zur Kostenstellenrechnung?", ["Welche Kosten sind angefallen?", "Wo sind die Kosten angefallen?", "Wofür sind die Kosten angefallen?", "Wann sind die Kosten bezahlt worden?"], 1, "Kostenarten: Welche? Kostenstellen: Wo? Kostenträger: Wofür?"],
  ["b-kore", "Kalkulatorischer Unternehmerlohn ist …", ["Grundkosten", "Anderskosten", "Zusatzkosten", "neutraler Aufwand"], 2, "In der FIBU gibt es keinen Aufwand dafür (der Unternehmer bezieht kein Gehalt), daher Zusatzkosten."],
  ["b-kore", "Kalkulatorische Miete für Räume, für die bereits Miete bezahlt wird, die aber auf die ortsübliche Miete angepasst wird, ist …", ["Zusatzkosten", "Anderskosten", "Grundkosten", "neutraler Aufwand"], 1, "Aufwand existiert, wird aber anders bewertet. Stellt der Unternehmer private Räume ohne Miete zur Verfügung, sind es Zusatzkosten."],
  ["b-kore", "Warum setzt die KORE kalkulatorische Eigenkapitalzinsen an?", ["Weil das UGB es verlangt", "Damit Unternehmen mit viel und wenig Eigenkapital vergleichbar kalkulieren", "Um den Gewinn in der GuV zu erhöhen", "Weil Fremdkapitalzinsen nicht absetzbar sind"], 1, "VO-Beispiel: A mit 100 % EK hat keinen Zinsaufwand, B mit 80 % FK schon. Ohne kalkulatorische EK-Zinsen würde A zu billig kalkulieren."],
  ["b-kore", "Welches Wagnis gehört NICHT zu den kalkulatorischen Wagnissen?", ["Beständewagnis (Schwund, Diebstahl)", "Gewährleistungswagnis", "das allgemeine Unternehmerwagnis", "Vertriebswagnis (Forderungsausfälle)"], 2, "Kalkulatorische Wagnisse sind nicht versicherte, quantifizierbare Einzelwagnisse. Das allgemeine Unternehmerrisiko wird mit dem Gewinn abgegolten."],
  ["b-kore", "Unechte Gemeinkosten sind …", ["Kosten, die keinem Produkt zugerechnet werden können", "Einzelkosten, die aus Wirtschaftlichkeitsgründen wie Gemeinkosten behandelt werden", "fixe Kosten", "kalkulatorische Kosten"], 1, "Zum Beispiel Schrauben und Leim: Man könnte sie pro Stück erfassen, der Aufwand lohnt sich aber nicht."],
  ["b-kore", "Welche Kostenstellen sind typische Hilfskostenstellen (VO-Mitschrift)?", ["IT und HR", "Fertigung 1 und Fertigung 2", "Material und Vertrieb", "Kostenträger A und B"], 0, "Hilfskostenstellen leisten an andere Stellen und werden auf die Hauptkostenstellen umgelegt."],
  ["b-kore", "Sprungfixe Kosten sind zum Beispiel …", ["Personalkosten, die ab einer bestimmten Menge durch eine weitere Person steigen", "Akkordlöhne", "Materialkosten mit Mengenrabatt", "Miete"], 0, "VO-Tabelle: Personal 200 bis 20 Stück, ab 30 Stück 600."],
  ["b-kore", "Bei absolut fixen Kosten verlaufen die Stückkosten mit steigender Menge …", ["konstant", "steigend", "fallend (Fixkostendegression)", "sprunghaft steigend"], 2, "Miete 400 auf 10 Stück = 40, auf 40 Stück = 10."],
  ["b-cf", "Welche Aussage zum Cashflow ist richtig?", ["Cashflow = Gewinn", "Der Cashflow ist der Überschuss der Einnahmen über die Ausgaben vor Investitionen und Finanzierung", "Der Cashflow enthält Kreditaufnahmen", "Der Cashflow ist ein Bestand zum 31.12."], 1, "Definition der VO. Cashflow ≠ Gewinn, er ist eine Stromgröße über die Periode."],
  ["b-cf", "Die Forderungen aus L+L steigen um 93. Wie wirkt das im operativen Cashflow?", ["+93", "−93", "keine Wirkung", "nur im Investitions-Cashflow"], 1, "Aktiva steigen → Geld ist gebunden → CF minus."],
  ["b-cf", "Eine Maschine wird um 50.000 auf Kredit gekauft. Wie ändern sich die liquiden Mittel insgesamt?", ["−50.000", "+50.000", "gar nicht", "−100.000"], 2, "Investitions-CF −50.000, Finanzierungs-CF +50.000 (Mitschrift). Ein Kauf auf Ziel ist gar nicht zahlungswirksam."],
  ["b-cf", "Warum werden Gewinne aus dem Anlagenabgang beim Cashflow aus dem Ergebnis abgezogen?", ["Weil sie Aufwand sind", "Weil der Verkaufserlös im Investitionsbereich erfasst wird", "Weil sie nicht versteuert werden", "Weil sie nie zahlungswirksam sind"], 1, "Sonst würde der Erlös doppelt gezählt. Im Fallbeispiel: −112 operativ, +112 bei Investitionen."],
  ["b-ertr", "Warum stehen beim ROI die Fremdkapitalzinsen im Zähler?", ["Weil sie steuerlich absetzbar sind", "Weil das Gesamtkapital (EK + FK) mit Gewinn und Zinsen entlohnt wird", "Um den ROI zu senken", "Weil das UGB es verlangt"], 1, "VO-Skizze: EK ← Gewinn, FK ← FK-Zinsen."],
  ["b-ertr", "Welche Aussage zu den Grenzen der Jahresabschlussanalyse ist richtig?", ["Kennzahlen sind nur so aussagekräftig wie die Daten dahinter", "UGB und IFRS bewerten immer gleich", "Ein einzelner Wert ist ohne Vergleich aussagekräftig", "Die Bilanz zeigt den Marktwert des Unternehmens"], 0, "Informationsmängel, Interpretationsprobleme, Vergleichsmaßstäbe nötig (Branche, Zeit, Plan). UGB: Vorsichtsprinzip, Anschaffungskosten als Obergrenze."],
  ["b-verm", "Warum wird beim Debitorenumschlag die USt zum Umsatz addiert?", ["Weil die Forderungen in der Bilanz brutto (inkl. USt) stehen", "Weil der Umsatz in der GuV brutto steht", "Damit die Kennzahl kleiner wird", "Das ist nur bei Exporten nötig"], 0, "Zähler und Nenner müssen zusammenpassen. In der VO dreifach unterstrichen: „+ USt!!!“"],
  ["b-verm", "Eine Abschreibungsquote von 20 % lässt auf welche durchschnittliche Nutzungsdauer schließen?", ["2 Jahre", "5 Jahre", "20 Jahre", "10 Jahre"], 1, "Mitschrift: 20.000 / 100.000 = 20 % → 5 Jahre. Kehrwert der Quote."],
  ["b-fin", "Woher kommen die Fristigkeiten für Deckungsgrad B und C?", ["aus der GuV", "aus dem Anhang (Restlaufzeitenvermerke)", "aus dem Lagebericht", "aus dem Firmenbuch"], 1, "In der VO als Wolke notiert: „ANHANG“."],
  ["b-fin", "Liquidität 2. Grades wird auch genannt …", ["Cash Ratio, One-to-Five-Rule", "Quick Ratio, Acid-Test-Rule", "Current Ratio, Banker’s Rule", "Deckungsgrad B"], 1, "1. Grad: Cash Ratio · 2. Grad: Quick Ratio / Acid Test · 3. Grad: Current Ratio / Banker’s Rule."],
  ["b-ja", "Eine Kreditaufnahme von 100.000 € auf das Bankkonto ist …", ["Einzahlung und Ertrag", "Einzahlung, aber kein Ertrag", "Ertrag, aber keine Einzahlung", "weder Einzahlung noch Ertrag"], 1, "Mitschrift Termin 1: Bilanzverlängerung (Bank ↑, FK ↑), die GuV bleibt unberührt."],
  ["b-ja", "Welche Aussage ist laut VO richtig?", ["Eigenkapital = liquide Mittel", "Eigenkapital ≠ liquide Mittel, Geld hat kein „Mascherl“", "Das EK steht immer auf dem Bankkonto", "Rücklagen sind Bargeld"], 1, "Die Passivseite zeigt die Herkunft der Mittel, nicht wo sie liegen."],
  ["b-ja", "Eine im Wartungsplan vorgesehene Generalüberholung um 10.000 € wurde unterlassen und wird nächstes Jahr nachgeholt. Was passiert im Abschluss?", ["nichts", "Rückstellung 10.000 bilden, Gewinn sinkt", "Rücklage 10.000 bilden", "Abschreibung der Maschine"], 1, "Rückstellung für unterlassene Instandhaltung (Fallstudie 1, Müller KG)."],
  ["b-ja", "Ein unbebautes Grundstück (Buchwert 15.000) ist durch eine Müllhalde nebenan dauerhaft nur noch 5.000 wert. Was ist nach UGB zu tun?", ["nichts, Grund wird nicht abgeschrieben", "außerplanmäßige Abschreibung um 10.000 (Pflicht)", "Rückstellung 10.000", "Abwertung ist verboten"], 1, "Strenges Niederstwertprinzip bei dauernder Wertminderung im Anlagevermögen."],
  ["b-entsch", "Der Schnäppchenpreis für freie Restkapazität (VO-Excel, z. B. Eigenmarken) liegt mindestens bei …", ["den vollen Stückkosten", "den variablen Stückkosten", "den Fixkosten je Stück", "dem Marktpreis"], 1, "Die Fixkosten sind durch das Hauptgeschäft gedeckt. Jeder Preis über den variablen Kosten bringt Deckungsbeitrag."]
].map(([topic, q, opts, a, why], i) => ({ id: "bvq" + (i + 1), topic, q, opts, a, why, ex: "", src: "VO" }));

const flashcards = [
  ["Vorzeichenregel Kapitalflussrechnung", "Aktiva ↑ → CF −, Aktiva ↓ → CF + · Passiva ↑ → CF +, Passiva ↓ → CF −", "b-cf"],
  ["Schuldentilgungsdauer", "(FK − liquide Mittel − WP UV) / operativer Cashflow · VO: 200 / 100 = 2 Jahre", "b-cf"],
  ["Die 4 Stufen der KORE", "Betriebsüberleitung → Kostenarten (welche?) → Kostenstellen (wo?) → Kostenträger (wofür?)", "b-kore"],
  ["Anderskosten vs. Zusatzkosten", "Anders: Aufwand existiert, anders bewertet (kalk. AfA, Wagnisse). Zusatz: kein Aufwand (kalk. Unternehmerlohn, EK-Zinsen). Zinsen und Miete: beides möglich", "b-kore"],
  ["Stufenleiterverfahren", "Hilfsstelle, die nichts empfängt, zuerst umlegen (Heizung), dann die nächste (Gebäudeverwaltung). Keine Rückflüsse an abgerechnete Stellen", "b-bab"],
  ["Halbjahresregel", "Inbetriebnahme bis 30.6. → volle Jahres-AfA, ab 1.7. → halbe. Maßgeblich ist die Inbetriebnahme, nicht der Kauf", "bx-afa"],
  ["AK beim PKW", "Kein Vorsteuerabzug → Bruttobetrag + Nebenkosten (Anmeldung) sind AK", "bx-afa"],
  ["Rückstellung vs. Rücklage", "Rückstellung = FK, entsteht durch Aufwand. Rücklage = EK, entsteht aus Gewinn (Gewinnrücklage) oder von außen (Kapitalrücklage)", "b-ja"],
  ["Gewinn per EK-Vergleich", "EK Ende − EK Anfang + Entnahmen − Einlagen", "b-ja"],
  ["Klausurformat BWL 2", "Moodle mit SEB am eigenen Gerät, Excel erlaubt, 90 Punkte in 90 Minuten, ~45 Theorie + ~45 Rechnen, Minuspunkte, bestanden erst über 60 %", "bv-fallen"]
].map(([front, back, topic], i) => ({ id: "bvf-" + (i + 1), cat: "BWL", topic, front, back }));

window.STUDYOS_EXT = window.STUDYOS_EXT || {};
(window.STUDYOS_EXT.bwl2 = window.STUDYOS_EXT.bwl2 || []).push({ id: "bwl2-v2",
  topics: { "bv-fallen": { name: "Altprüfungs-Fallen & Prüfungstrainer", lesson: "bv-1" }, "bv-fs": { name: "Fallstudien 1 + 2, Übung 3", lesson: "bv-3" } },
  world, blocks, questions: QS, flashcards, course: { cases } });
})();
