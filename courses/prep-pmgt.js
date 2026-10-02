/* Prüfungsvorbereitung GL-PMGT – aus Altprüfungen/Fragensammlungen (PMGT_Prüfungsfragen: 15 offene Fragen; Mitschrift "AltFragen" Übung 2 vom 27.11.2024; Fotos einer Netzplan-Prüfungsaufgabe mit Formeln) */
(function () {
const c = (window.COURSE_DEFS || []).find(x => x.id === "pmgt"); if (!c) return;

/* kleine Hilfsfunktion für Tabellen (Kopfzeile + Zeilen) */
const T = (head, rows) => "<table class='dt'><tr>" + head.map(h => "<th>" + h + "</th>").join("") + "</tr>" +
  rows.map(r => "<tr>" + r.map(x => "<td>" + x + "</td>").join("") + "</tr>").join("") + "</table>";
const NH = ["Vorgang", "D", "Vorgänger", "FAZ", "FEZ", "SAZ", "SEZ", "GP", "FP"];

/* ---------- neue Topics ---------- */
Object.assign(c.topics, {
  "pmx-netzrech": { name: "Netzplan rechnen (Prüfungsformat)", lesson: "pmx-1" },
  "pmx-verk": { name: "Projektdauer verkürzen, Deadline & Steuerung", lesson: "pmx-2" }
});

/* ---------- Beispielnetz der Lektion ---------- */
const L_ROWS = [
  ["A", 3, "–", 1, 3, 1, 3, 0, 0],
  ["B", 5, "A", 4, 8, 4, 8, 0, 0],
  ["C", 2, "A", 4, 5, 5, 6, 1, 0],
  ["D", 4, "B", 9, 12, 9, 12, 0, 0],
  ["E", 6, "C", 6, 11, 7, 12, 1, 1],
  ["F", 3, "D, E", 13, 15, 13, 15, 0, 0],
  ["G", 2, "F", 16, 17, 16, 17, 0, 0]
];

/* ---------- Zusatzkapitel ---------- */
c.worlds.push({ id: "pmxw", n: 7, title: "Prüfungstraining: Netzplan, Schätzen, Strukturen", sub: "Rechenaufgaben & Altfragen", boss: null, lessons: [

{ id: "pmx-1", title: "Netzplan Schritt für Schritt rechnen (Prüfungsformat)", topic: "pmx-netzrech", min: 30, xp: 0, blocks: [
  { t: "lead", html: "In der Prüfung kommt fast sicher ein <b>Vorgangsknotennetz</b>, das du vorwärts und rückwärts durchrechnen musst: FAZ, FEZ, SAZ, SEZ, Gesamtpuffer (GP), freier Puffer (FP) und kritischer Pfad – danach Fragen wie „Was passiert, wenn …?“." },
  { t: "text", h: "Aufbau eines Vorgangsknotens", levels: {
    simple: "Jeder Kasten ist ein Vorgang. Darin stehen Nummer, Name, Dauer und vier Termine: frühester/spätester Anfang und frühestes/spätestes Ende, dazu die Puffer.",
    normal: "Im <b>Vorgangsknotennetz</b> (Methode CPM, Critical Path Method) ist jeder <b>Vorgang ein Knoten</b>, die Pfeile sind die Anordnungsbeziehungen (meist Normalfolge: Ende → Anfang). Ein Knoten enthält typischerweise:<ul><li>Vorgangsnummer und -bezeichnung, <b>Dauer D</b> (ggf. Verantwortliche:r, Ressourcen)</li><li><b>FAZ</b> frühester Anfang · <b>FEZ</b> frühestes Ende (aus der Vorwärtsrechnung)</li><li><b>SAZ</b> spätester Anfang · <b>SEZ</b> spätestes Ende (aus der Rückwärtsrechnung)</li><li><b>GP</b> Gesamtpuffer · <b>FP</b> freier Puffer</li></ul>Auf den Prüfungsbögen (Fotos der Altprüfung) sind die Knoten als vorgedruckte Kästchen auf mehreren Seiten verteilt; man trägt die Werte direkt ein und markiert den kritischen Pfad.",
    technical: "DIN 69900 unterscheidet Vorgangsknotennetz (VKN, z. B. MPM/CPM in Knotendarstellung), Vorgangspfeilnetz (VPN, klassisches CPM) und Ereignisknotennetz (EKN, PERT). In der Praxis (MS Project) und in der Prüfung wird das VKN verwendet. Neben der Normalfolge gibt es Anfangsfolge, Endfolge und Sprungfolge sowie Zeitabstände (Vorlauf/Nachlauf) – in der Prüfung wird in aller Regel nur die Normalfolge ohne Zeitabstand verwendet." } },
  { t: "text", h: "Zwei Zählweisen – die Prüfung rechnet in Tagen", levels: {
    simple: "Wenn ein Vorgang an Tag 1 beginnt und 3 Tage dauert, endet er an Tag 3 (nicht 4). Darum gibt es beim Rechnen ein −1 bzw. +1.",
    normal: "<b>Tageszählung (wie auf dem Prüfungsfoto, wie MS Project)</b>: Das Projekt beginnt an <b>Tag 1</b>, Anfang und Ende sind ganze Arbeitstage (inklusive).<ul><li>Vorwärts: <b>FEZ = FAZ + D − 1</b>; FAZ des Nachfolgers = <b>größtes</b> FEZ der Vorgänger <b>+ 1</b></li><li>Rückwärts: <b>SAZ = SEZ − D + 1</b>; SEZ des Vorgängers = <b>kleinstes</b> SAZ der Nachfolger <b>− 1</b></li><li><b>GP = SEZ − FEZ = SAZ − FAZ</b></li><li><b>FP = kleinstes FAZ der Nachfolger − FEZ − 1</b> (letzter Vorgang: Projektende − FEZ)</li></ul><b>Zeitpunktzählung (Folien-Beispiel in Lektion 3.3)</b>: Start bei 0, FEZ = FAZ + D, FAZ Nachfolger = max FEZ, SAZ = SEZ − D, FP = min FAZ Nachfolger − FEZ. Ergebnis: alle Anfangswerte sind um 1 kleiner, Dauer, Puffer und kritischer Pfad sind <b>identisch</b>.",
    technical: "Merkhilfe der Mitschrift: „vorwärts → −1 / spätesten (größten) Wert nehmen“, „rückwärts ← +1 / frühesten (kleinsten) Wert nehmen“, „Pufferzeit einfach minus“. Die Puffer sind in beiden Zählweisen gleich, weil sich bei GP = SAZ − FAZ der Versatz von 1 aufhebt. Schreib in der Prüfung kurz dazu, welche Zählweise du verwendest (Start Tag 1 oder Zeitpunkt 0) – so ist dein Ergebnis eindeutig bewertbar." } },
  { t: "html", html: "<p><b>Rechenschema (immer gleich):</b></p><ol><li><b>Vorwärtsrechnung</b> von links nach rechts: Startvorgang FAZ = 1. Für jeden Vorgang FEZ = FAZ + D − 1. Hat ein Vorgang mehrere Vorgänger → <b>Maximum</b> der FEZ + 1.</li><li><b>Projektende</b> = größtes FEZ aller Endvorgänge.</li><li><b>Rückwärtsrechnung</b> von rechts nach links: Endvorgang SEZ = Projektende (oder vorgegebene Deadline). SAZ = SEZ − D + 1. Hat ein Vorgang mehrere Nachfolger → <b>Minimum</b> der SAZ − 1.</li><li><b>GP</b> = SEZ − FEZ (Kontrolle: = SAZ − FAZ). <b>FP</b> = min FAZ(Nachfolger) − FEZ − 1.</li><li><b>Kritischer Pfad</b> = durchgehende Kette aller Vorgänge mit GP = 0 (es kann mehrere geben!).</li></ol>" },
  { t: "html", html: "<p><b>Durchgerechnetes Beispiel</b> (Dauer in Tagen): A (3, –) · B (5, nach A) · C (2, nach A) · D (4, nach B) · E (6, nach C) · F (3, nach D und E) · G (2, nach F)</p>" + T(NH, L_ROWS) +
    "<p><b>Vorwärts:</b> A 1–3 · B 4–8 · C 4–5 · D 9–12 · E 6–11 · F: max(FEZ D = 12, FEZ E = 11) + 1 = <b>13</b> → 13–15 · G 16–17 → <b>Projektende Tag 17</b>.<br><b>Rückwärts:</b> G SEZ 17, SAZ 16 · F SEZ 15, SAZ 13 · D SEZ 12, SAZ 9 · E SEZ 12, SAZ 7 · B SEZ 8, SAZ 4 · C SEZ = 7 − 1 = 6, SAZ 5 · A SEZ = min(SAZ B = 4, SAZ C = 5) − 1 = <b>3</b>, SAZ 1.<br><b>Puffer:</b> C und E je GP 1. C hat FP 0 (E beginnt frühestens an Tag 6 = FEZ C + 1), E hat FP 1 (F beginnt frühestens Tag 13, E endet frühestens Tag 11).<br><b>Kritischer Pfad: A → B → D → F → G</b> (17 Tage); Nebenpfad A → C → E → F → G = 16 Tage.</p><p>Gleiche Rechnung in Zeitpunktzählung (Start 0): A 0–3, B 3–8, C 3–5, D 8–12, E 5–11, F 12–15, G 15–17; Puffer identisch.</p>" },
  { t: "warnbox", html: "Häufigste Fehler: (1) bei mehreren Vorgängern das Minimum statt des <b>Maximums</b> nehmen, (2) rückwärts das Maximum statt des <b>Minimums</b>, (3) die ±1 der Tageszählung vergessen oder mit der Zeitpunktzählung mischen, (4) nur <i>einen</i> kritischen Pfad suchen, obwohl zwei Pfade gleich lang sind." },
  { t: "widget", w: "gapfill", topic: "pmx-netzrech", title: "Beispielnetz nachrechnen (Tageszählung)", items: [
    { s: "B beginnt an Tag 4 und dauert 5 Tage, also FEZ = ___.", a: ["8"] },
    { s: "F hat die Vorgänger D (FEZ 12) und E (FEZ 11), also FAZ von F = ___.", a: ["13"] },
    { s: "A hat die Nachfolger B (SAZ 4) und C (SAZ 5), also SEZ von A = ___.", a: ["3"] },
    { s: "E: SEZ 12 − FEZ 11 ergibt einen Gesamtpuffer von ___ Tag(en).", a: ["1"] },
    { s: "Verlängert sich E um 2 Tage, endet das Projekt an Tag ___.", a: ["18"] }
  ] },
  { t: "check", q: "Tageszählung: Ein Vorgang hat FAZ = 6 und Dauer 4. Wie lautet sein FEZ?", opts: ["10", "9", "11", "5"], a: 1, why: "FEZ = FAZ + D − 1 = 6 + 4 − 1 = 9 (Tag 6, 7, 8, 9)." },
  { t: "check", q: "Ein Vorgang hat die Nachfolger X (SAZ 14) und Y (SAZ 11). Wie lautet sein SEZ in Tageszählung?", opts: ["13", "14", "10", "11"], a: 2, why: "Rückwärts das Minimum der SAZ nehmen (11) und 1 abziehen → 10." },
  { t: "keys", items: ["Vorwärts: FEZ = FAZ + D − 1, Nachfolger-FAZ = <b>max</b> FEZ + 1", "Rückwärts: SAZ = SEZ − D + 1, Vorgänger-SEZ = <b>min</b> SAZ − 1", "GP = SEZ − FEZ = SAZ − FAZ; FP = min FAZ Nachfolger − FEZ − 1", "Kritisch = GP 0; mehrere kritische Pfade sind möglich", "Puffer und kritischer Pfad sind unabhängig von der Zählweise"] }
] },

{ id: "pmx-2", title: "Projektdauer verkürzen, Deadline und Steuerung", topic: "pmx-verk", min: 20, xp: 0, blocks: [
  { t: "lead", html: "Typische Prüfungsfragen nach dem Netzplan: <i>Welche Vorgänge schauen Sie sich an, wenn das Projekt kürzer werden soll? Welche Eigenschaften prüfen Sie? Mit welchen Maßnahmen verkürzen Sie?</i>" },
  { t: "text", h: "Wo verkürzen? Nur am kritischen Pfad", levels: {
    simple: "Nur wenn ein kritischer Vorgang kürzer wird, wird das ganze Projekt kürzer. Vorgänge mit Puffer zu verkürzen bringt nichts.",
    normal: "Die Projektdauer wird durch den <b>kritischen Pfad</b> bestimmt. Im Projektcontrolling betrachtet man daher zuerst die <b>kritischen Vorgänge</b> (GP = 0). Ein Vorgang mit Puffer zu verkürzen erhöht nur dessen Puffer.<br>Bei vielen kritischen Vorgängen prüft man als Nächstes ihre <b>Eigenschaften</b>:<ul><li><b>Dauer</b> – lange Vorgänge haben das größte Verkürzungspotenzial</li><li><b>Kosten der Verkürzung</b> (Kosten je eingespartem Tag, „Crash-Kosten“) – billigste zuerst</li><li><b>technische Verkürzbarkeit / Mindestdauer</b> (lässt sich die Arbeit aufteilen? Wartezeiten wie Aushärten, Lieferzeiten sind fix)</li><li><b>Ressourcen</b>: Sind zusätzliche Personen/Mittel verfügbar und qualifiziert?</li><li><b>Abhängigkeiten</b>: Kann ein Nachfolger früher (überlappend) starten? Liegt der Vorgang auf <b>mehreren</b> kritischen Pfaden (dann wirkt er doppelt)?</li><li><b>Risiko und Qualität</b>: Was verschlechtert sich durch die Verkürzung?</li></ul>",
    technical: "Beim Verkürzen kann ein bisher unkritischer Pfad kritisch werden: Man darf einen Pfad nur so weit verkürzen, bis er gleich lang ist wie der zweitlängste Pfad – danach müssen alle kritischen Pfade gleichzeitig verkürzt werden (Crashing schrittweise, jeweils günstigste Kombination). Gemeinsame Vorgänge mehrerer kritischer Pfade (z. B. der Startvorgang) können wirtschaftlicher sein als je ein Vorgang pro Pfad." } },
  { t: "html", html: T(["Maßnahme", "Beispiel", "Nebenwirkung"], [
    ["Mehr Ressourcen einsetzen", "zusätzliche Entwickler:innen, Überstunden, Schichtbetrieb, Wochenendarbeit", "Mehrkosten, Einarbeitung, Koordinationsaufwand (Speed-up &lt; 1)"],
    ["Parallelisieren / Überlappen (Fast Tracking)", "Test beginnt schon mit fertigen Modulen, Nachfolger startet vor Ende des Vorgängers", "höheres Risiko von Nacharbeit"],
    ["Leistungsumfang reduzieren", "Funktionen in ein späteres Release verschieben", "geringere Leistung (magisches Dreieck)"],
    ["Bessere Qualifikation / Werkzeuge", "erfahrenes Personal, Generatoren, Standardsoftware", "Kosten, Verfügbarkeit"],
    ["Fremdvergabe", "Teilaufgabe an externen Dienstleister", "Abstimmungs- und Vertragsaufwand"],
    ["Abhängigkeiten aufheben / Ablauf ändern", "Genehmigung früher einholen, Vorgang aufteilen", "Planungsaufwand"]
  ]) },
  { t: "text", h: "Rückwärtsrechnung bei Deadline, negative Puffer", levels: {
    simple: "Gibt es einen fixen Endtermin, rechnet man von diesem rückwärts und sieht, wann man spätestens anfangen muss.",
    normal: "Die <b>Rückwärtsrechnung von einem vorgegebenen Endtermin</b> (Deadline, Messe, Go-live) zeigt, wann jeder Vorgang <b>spätestens</b> beginnen muss. Dazu setzt man beim letzten Vorgang <b>SEZ = Deadline</b> statt = Projektende aus der Vorwärtsrechnung.<ul><li>Deadline später als errechnetes Ende → alle Vorgänge des kritischen Pfads haben einen <b>positiven Gesamtpuffer</b> (Reserve).</li><li>Deadline früher → <b>negativer Puffer</b>: Der Termin ist mit der aktuellen Planung nicht haltbar, es muss verkürzt (oder die Deadline verhandelt) werden.</li></ul>",
    technical: "Typische Zeitvorgaben laut Folien: nur Dauer · Dauer + fixer Anfang (Vorwärtsrechnung) · Dauer + fixes Ende (Rückwärtsrechnung) · fixer Anfang und fixes Ende (Puffer kann negativ werden)." } },
  { t: "text", h: "Ressourcengesteuerte (und andere) Projektplanung", levels: {
    simple: "Man entscheidet, welche Ecke des magischen Dreiecks man als Stellschraube benutzt: Ressourcen, Zeit oder Funktionalität.",
    normal: "Über das <b>magische Dreieck</b> (Leistung/Qualität – Zeit – Kosten/Ressourcen) kann man festlegen, mit welcher Größe gesteuert wird:<ul><li><b>Ressourcengesteuert</b>: Ziel und Termin stehen, gesteuert wird über den Einsatz der <b>Ressourcen</b> (Personal aufstocken, Überstunden, Budget). Funktioniert nur, solange Ressourcen verfügbar sind – sind sie <b>beengt</b> (Engpass, fixes Budget), kann man nicht mehr über Ressourcen steuern.</li><li><b>Zeitgesteuert</b>: Termin wird angepasst (Verschiebung), Leistung und Ressourcen bleiben.</li><li><b>Funktionalitätsgesteuert</b>: Leistungsumfang/Qualität wird angepasst, um Termin und Budget zu halten.</li></ul>Das entspricht den Parameterausrichtungen der Projektgründung: kostenfixiert (Budget fix), terminfixiert (Leistung + Termin fix, Kosten variabel), leistungsfixiert (Leistung + Qualität fix, Kosten und Termine variabel).",
    technical: "In der Einsatzmittelplanung unterscheidet man termintreue Planung (Termine fix, Kapazitätsspitzen werden durch zusätzliche Ressourcen abgedeckt) und kapazitätstreue Planung (Kapazitätsgrenze fix, Vorgänge werden innerhalb ihrer Puffer bzw. über das Projektende hinaus verschoben)." } },
  { t: "widget", w: "sorter", topic: "pmx-verk", title: "Verkürzt das die Projektdauer?", cats: [{ k: "j", label: "Ja, verkürzt" }, { k: "n", label: "Nein / nicht automatisch" }], items: [
    { t: "Ein kritischer Vorgang wird durch eine zusätzliche Person um 2 Tage kürzer (und bleibt kritisch).", a: "j", why: "Kritischer Pfad wird kürzer." },
    { t: "Ein Vorgang mit 5 Tagen Gesamtpuffer wird um 3 Tage verkürzt.", a: "n", why: "Erhöht nur seinen Puffer." },
    { t: "Es gibt zwei gleich lange kritische Pfade; nur einer wird verkürzt.", a: "n", why: "Der andere bestimmt weiter die Dauer." },
    { t: "Der gemeinsame Startvorgang aller Pfade wird um 1 Tag verkürzt.", a: "j", why: "Wirkt auf alle Pfade." },
    { t: "Der Test eines Moduls startet überlappend, bevor die Codierung ganz fertig ist (beide kritisch).", a: "j", why: "Fast Tracking auf dem kritischen Pfad." }
  ] },
  { t: "check", q: "Das Netz hat zwei kritische Pfade mit je 21 Tagen. Ein Vorgang, der nur auf einem davon liegt, wird um 3 Tage verkürzt. Neue Projektdauer?", opts: ["18 Tage", "21 Tage", "19,5 Tage", "24 Tage"], a: 1, why: "Der zweite kritische Pfad dauert weiterhin 21 Tage." },
  { t: "check", q: "Rückwärtsrechnung ab einer Deadline ergibt beim Startvorgang SAZ − FAZ = −2. Was bedeutet das?", opts: ["2 Tage Reserve", "Die Deadline ist mit dieser Planung nicht haltbar – es fehlen 2 Tage", "Der Startvorgang ist nicht kritisch", "Rechenfehler, Puffer kann nie negativ sein"], a: 1, why: "Negativer Puffer: Der kritische Pfad ist 2 Tage länger als die verfügbare Zeit." },
  { t: "keys", items: ["Verkürzen nur am kritischen Pfad wirksam", "Kriterien: Dauer, Kosten je Tag, Machbarkeit, Ressourcen, Abhängigkeiten, Risiko", "Maßnahmen: Ressourcen, Parallelisieren, Scope reduzieren, Qualifikation/Werkzeuge, Fremdvergabe", "Rückwärtsrechnung ab Deadline → spätester Start; negativer Puffer = Termin nicht haltbar", "Ressourcengesteuert geht nur, solange Ressourcen nicht beengt sind"] }
] },

{ id: "pmx-3", title: "Schätzmethoden rechnen (Prozentsatz, Stichprobe, PERT)", topic: "pmg-schaetz", min: 18, xp: 0, blocks: [
  { t: "lead", html: "Laut Mitschrift wird in der Prüfung auch <b>geschätzt und gerechnet</b> – vor allem mit der <b>Prozentsatzmethode</b>." },
  { t: "text", h: "Prozentsatzmethode Schritt für Schritt", levels: {
    simple: "Man weiß aus alten Projekten, wie viel Prozent jede Phase ausmacht. Kennt man eine Phase, rechnet man auf 1 % herunter und dann auf alle anderen hoch.",
    normal: "Voraussetzung: Aus abgeschlossenen Projekten ist bekannt, wie sich der Aufwand <b>prozentual auf die Phasen</b> verteilt. Ist eine Phase bekannt (abgeschlossen oder detailliert geschätzt), schließt man auf den Rest:<ol><li>Aufwand der bekannten Phase ÷ ihr Prozentsatz = <b>Aufwand für 1 %</b></li><li>× 100 = <b>Gesamtaufwand</b></li><li>jede Phase = 1 %-Wert × Prozentsatz</li><li>Summenkontrolle: alle Phasen = Gesamt</li></ol><b>Beispiel aus der Übung</b>: Phase 3 (30 %) ist mit 630 h geschätzt → 1 % = 21 h → Gesamt 2.100 h.",
    technical: "Die Methode ist grob und eignet sich für frühe Schätzzeitpunkte; sie setzt eine stabile Phasenverteilung aus vergleichbaren Projekten voraus. Laut Folie typische Verteilung: Definition 18 %, Entwurf 19 %, Codierung 34 %, Test 29 %. Zuschlag für PM, Dokumentation, Schulung: 10–30 %. In der Praxis mindestens zwei Methoden parallel einsetzen (Plausibilisierung)." } },
  { t: "html", html: T(["Phase", "Anteil", "Aufwand (h)"], [["1", "14 %", "294"], ["2", "15 %", "315"], ["3 (bekannt)", "30 %", "<b>630</b>"], ["4", "20 %", "420"], ["5", "21 %", "441"], ["<b>Gesamt</b>", "100 %", "<b>2.100</b>"]]) + "<p>1 % = 630 / 30 = 21 h. Hinweis: In der Mitschrift steht bei Phase 5 „442“ – richtig ist 21 × 21 = <b>441</b> (sonst stimmt die Summe 2.100 nicht).</p>" },
  { t: "html", html: T(["Methode", "Formel", "Mini-Beispiel"], [
    ["Prozentsatz", "Gesamt = bekannte Phase / Anteil", "Entwurf (19 %) = 152 PT → 1 % = 8 PT → 800 PT"],
    ["Stichprobe", "Gesamt = (Gesamtmenge / Stichprobe) × Stichprobenaufwand", "12 von 180 Masken = 54 PT → 15 × 54 = 810 PT"],
    ["Multiplikator", "Gesamt = Menge × Kennzahl je Einheit", "14 Module × 35 PT = 490 PT"],
    ["Analogie", "Analogieprojekt ± Unterschiede", "altes Projekt 600 PT, +20 % Komplexität → 720 PT"],
    ["PERT (Drei-Zeiten)", "T<sub>m</sub> = (T<sub>o</sub> + 4·T<sub>w</sub> + T<sub>p</sub>) / 6", "(6 + 4·9 + 18) / 6 = 10 Tage"]
  ]) },
  { t: "widget", w: "gapfill", topic: "pmg-schaetz", title: "Kurz rechnen", items: [
    { s: "Phase 2 macht 25 % aus und kostet 300 h. Gesamtaufwand = ___ h.", a: ["1200", "1.200"] },
    { s: "Bei 1 % = 21 h hat eine Phase mit 20 % einen Aufwand von ___ h.", a: ["420"] },
    { s: "PERT: T_o = 2, T_w = 5, T_p = 14 ergibt T_m = ___.", a: ["6"] },
    { s: "Stichprobe: 5 von 100 Funktionen = 20 PT → Gesamt = ___ PT.", a: ["400"] }
  ] },
  { t: "check", q: "Die Testphase (29 %) eines Vorgängerprojekts hat 290 PT gekostet. Wie hoch ist der Gesamtaufwand nach Prozentsatzmethode?", opts: ["841 PT", "1.000 PT", "319 PT", "2.900 PT"], a: 1, why: "1 % = 290 / 29 = 10 PT → 100 % = 1.000 PT." },
  { t: "keys", items: ["Prozentsatz: bekannte Phase → 1 % → Gesamt → alle Phasen; Summe kontrollieren", "Stichprobe: Hochrechnungsfaktor × Stichprobenaufwand", "Multiplikator: Menge × Kosten je Einheit (unterstellt Proportionalität)", "PERT: (T_o + 4 T_w + T_p) / 6", "Zuschlag 10–30 % für PM, Doku, Schulung nicht vergessen, wenn gefragt"] }
] },

{ id: "pmx-4", title: "Strukturen & Organisation kompakt (PSP, Organisationsformen, Gremien)", topic: "pmg-psp", min: 15, xp: 0, blocks: [
  { t: "lead", html: "Die Theoriefragen der Altprüfungen drehen sich immer wieder um <b>PSP-Typen</b>, die <b>5 Organisationsformen</b>, <b>Projektgremien</b>, <b>Meilenstein</b> und <b>Prozesszweig</b>." },
  { t: "text", h: "Projektstrukturplan (PSP)", levels: {
    simple: "Der PSP zerlegt das Projekt wie einen Baum in Teilprojekte und Arbeitspakete.",
    normal: "Der PSP ist die <b>hierarchische Gliederung</b> des Projekts in Teilprojekte/Teilaufgaben bis zu den <b>Arbeitspaketen</b>. Formal ist er ein <b>Baum</b> (Wurzel = Projekt), daher gilt <b>Knoten = Kanten + 1</b>.<br>Drei Grundtypen (Beispiel Hausbau):<ul><li><b>objektorientiert</b>: nach Bestandteilen des Ergebnisses (Keller, Erdgeschoß, Dach …)</li><li><b>funktionsorientiert</b>: nach Funktionen/Gewerken (Elektro-, Wasser-, Heizungsinstallation …)</li><li><b>ablauforientiert</b>: nach der zeitlichen Abfolge/Phasen (Planung, Rohbau, Innenausbau, Übergabe)</li></ul>Dazu kommen <b>Mischformen</b> (z. B. Ebene 1 Phasen, Ebene 2 Objekte).",
    technical: "Arbeitspakete sind die kleinste Einheit des PSP, einer verantwortlichen Stelle zugeordnet und Bezugsgröße für Terminüberwachung, Aufwandsschätzung und Kostenplanung; aus ihnen werden die Vorgänge des Netzplans abgeleitet." } },
  { t: "html", html: T(["Organisationsform", "Kurz", "Wann sinnvoll?"], [
    ["Reine Projektorganisation", "eigene Einheit, PL mit voller Weisungsbefugnis", "große, wichtige, stark interdisziplinäre Projekte (Realisierung)"],
    ["Einfluss-Projektorganisation", "nur Koordinator:in, Entscheidungen in der Linie", "kleine Projekte, frühe Definitionsphase"],
    ["Matrix-Projektorganisation", "PL fachlich, Linie disziplinarisch weisungsbefugt", "mittlere Projekte, Entwurfsphase, Ressourcen aus vielen Abteilungen"],
    ["Auftrags-Projektorganisation", "eigene PM-Einheit vergibt Aufträge an Linie/Externe", "viele Projekte, Einbindung externer Auftragnehmer"],
    ["PM in der Linie", "Abteilungsleiter:in ist PL", "kleine Projekte innerhalb einer Abteilung, Einsatzphase"]
  ]) + T(["Gremium", "Zweck", "Beispiele"], [
    ["Planungsgremium", "Planung unterstützen/durchführen", "Planungsteam, Produktarbeitskreis"],
    ["Beratungsgremium", "fachliche Anforderungen benennen, priorisieren", "Anwenderkreis, Fachausschuss"],
    ["Steuerungsgremium", "fachliche Steuerung zu Meilensteinen", "Change Control Board"],
    ["Entscheidungsgremium", "strategische Entscheidungen", "Lenkungsausschuss"],
    ["Kommunikationsgremium", "projektübergreifender Erfahrungsaustausch", "User Club, Fachbeirat"]
  ]) },
  { t: "text", h: "Meilenstein und Prozesszweig", levels: {
    simple: "Meilenstein = wichtiges, prüfbares Zwischenziel mit Datum. Prozesszweig = mehrere Phasen laufen gleichzeitig.",
    normal: "<b>Meilenstein</b>: Ereignis von besonderer Bedeutung (Dauer 0) mit <b>Inhalt</b> = definiertes (Teil-)<b>Ergebnis</b> (wesentlich, im Voraus definierbar, überprüfbar, eindeutig) und <b>Termin</b> = Fertigstellungsdatum; Zwischenziel zur Kontrolle (z. B. Abnahme des Pflichtenhefts).<br><b>Prozesszweig</b>: In der Prozessorganisation (Prozess → Abschnitt → Phase → Schritt) nennt man <b>parallel durchgeführte Phasen/Aktivitäten</b> Prozesszweige (z. B. Hardware- und Softwareentwicklung gleichzeitig).",
    technical: "Besonders wichtige Ergebnisse, die bei Erreichen eines Meilensteins vorliegen, heißen Baseline. Meilensteine sind Basis der Meilensteintrendanalyse." } },
  { t: "widget", w: "pairs", topic: "pmg-psp", title: "Begriffe zuordnen", pairs: [
    ["objektorientierter PSP", "Gliederung nach Bestandteilen des Ergebnisses"],
    ["funktionsorientierter PSP", "Gliederung nach Funktionen/Gewerken"],
    ["ablauforientierter PSP", "Gliederung nach Phasen/zeitlicher Abfolge"],
    ["Prozesszweig", "parallel laufende Phasen"],
    ["Meilenstein", "prüfbares Ergebnis mit Termin"],
    ["Lenkungsausschuss", "Entscheidungsgremium"]
  ] },
  { t: "check", q: "Ein PSP hat 1 Projektknoten, 4 Teilprojekte und 15 Arbeitspakete. Wie viele Kanten hat der Baum?", opts: ["20", "19", "15", "4"], a: 1, why: "20 Knoten; im Baum gilt Kanten = Knoten − 1 = 19." },
  { t: "keys", items: ["PSP = Baum, Knoten = Kanten + 1, unterste Ebene = Arbeitspakete", "3 Typen: objekt-, funktions-, ablauforientiert (+ Mischform)", "5 Organisationsformen: rein, Einfluss, Matrix, Auftrag, Linie", "5 Gremien: Planung, Beratung, Steuerung, Entscheidung, Kommunikation", "Prozesszweig = parallele Phasen; Meilenstein = Ergebnis + Datum"] }
] }
] });

/* ---------- MC / Richtig-Falsch aus den Altfragen + Zusatzfragen ---------- */
const Q = (id, topic, q, opts, a, why) => ({ id, topic, q, opts, a, why, alt: true, src: "Altprüfung", ex: "" });
c.questions.push(
  Q("pmx-q1", "pmg-netz", "Wie nennt man die Methode der Netzplantechnik (mit kritischem Pfad) noch?", ["Critical Path Method (CPM) – Methode des kritischen Pfades", "Earned Value Method", "Meilensteintrendanalyse", "Delphi-Methode"], 0, "Netzplantechnik nach CPM: Die Projektdauer ergibt sich aus dem längsten (kritischen) Pfad. PERT ist die Variante mit Drei-Zeiten-Schätzung."),
  Q("pmx-q2", "pmx-netzrech", "Tageszählung (Start Tag 1): FAZ = 4, Dauer = 5. FEZ = ?", ["9", "8", "10", "7"], 1, "FEZ = FAZ + D − 1 = 4 + 5 − 1 = 8 (Tage 4 bis 8)."),
  Q("pmx-q3", "pmx-netzrech", "Tageszählung: SEZ = 12, Dauer = 4. SAZ = ?", ["8", "16", "9", "7"], 2, "SAZ = SEZ − D + 1 = 12 − 4 + 1 = 9."),
  Q("pmx-q4", "pmx-netzrech", "Ein Vorgang hat die Vorgänger X (FEZ 8) und Y (FEZ 11). FAZ in Tageszählung?", ["9", "11", "12", "8"], 2, "Vorwärts: größtes FEZ der Vorgänger (11) + 1 = 12 – alle Vorgänger müssen fertig sein."),
  Q("pmx-q5", "pmx-netzrech", "Ein Vorgang hat die Nachfolger P (SAZ 13) und Q (SAZ 10). SEZ in Tageszählung?", ["12", "9", "10", "13"], 1, "Rückwärts: kleinstes SAZ der Nachfolger (10) − 1 = 9."),
  Q("pmx-q6", "pmx-netzrech", "FAZ = 6, FEZ = 11, SAZ = 9, SEZ = 14. Gesamtpuffer?", ["3", "5", "8", "0"], 0, "GP = SEZ − FEZ = 14 − 11 = 3 = SAZ − FAZ = 9 − 6."),
  Q("pmx-q7", "pmg-netz", "Wann bezeichnet man einen Vorgang als kritisch?", ["Wenn er den größten Aufwand hat", "Wenn sein Gesamtpuffer 0 ist – jede Verzögerung verschiebt das Projektende", "Wenn er mehrere Vorgänger hat", "Wenn sein freier Puffer größer als 0 ist"], 1, "Kritisch = kein Puffer (GP = 0); er liegt auf dem kritischen Pfad."),
  Q("pmx-q8", "pmg-netz", "Richtig oder falsch: Ein Vorgang mit freiem Puffer 0 ist immer kritisch.", ["Richtig", "Falsch"], 1, "Falsch: FP 0 heißt nur, dass ein Nachfolger sofort anschließt. Der Vorgang kann trotzdem Gesamtpuffer haben (z. B. C im Lektionsbeispiel: FP 0, GP 1)."),
  Q("pmx-q9", "pmx-netzrech", "Richtig oder falsch: Rechnet man denselben Netzplan in Tageszählung (Start 1) statt Zeitpunktzählung (Start 0), ändern sich die Puffer.", ["Richtig", "Falsch"], 1, "Falsch: Nur die Anfangswerte verschieben sich um 1; Puffer, Dauer und kritischer Pfad bleiben gleich."),
  Q("pmx-q10", "pmx-verk", "Sie sind im Projektcontrolling und sollen die Projektdauer verkürzen. Welche Vorgänge betrachten Sie zuerst?", ["Die Vorgänge mit dem größten Puffer", "Die kritischen Vorgänge auf dem kritischen Pfad", "Die billigsten Vorgänge", "Die ersten drei Vorgänge des Projekts"], 1, "Nur eine Verkürzung kritischer Vorgänge verkürzt das Projekt."),
  Q("pmx-q11", "pmx-verk", "Welche Eigenschaft eines kritischen Vorgangs ist für die Auswahl zur Verkürzung am wenigsten relevant?", ["Kosten je eingespartem Tag", "Dauer bzw. Verkürzungspotenzial", "Verfügbarkeit zusätzlicher Ressourcen", "Die alphabetische Vorgangsbezeichnung"], 3, "Relevant sind Dauer, Kosten, technische Machbarkeit, Ressourcen, Abhängigkeiten, Risiko."),
  Q("pmx-q12", "pmx-verk", "Ein Netz hat zwei kritische Pfade (je 21 Tage). Ein Vorgang nur des einen Pfades wird um 3 Tage verkürzt. Projektdauer danach?", ["18 Tage", "21 Tage", "24 Tage", "19 Tage"], 1, "Der andere Pfad bleibt bei 21 Tagen und bestimmt das Projektende."),
  Q("pmx-q13", "pmx-verk", "Crashing: Projekt um 1 Tag verkürzen; kritisch sind B (400 €/Tag), E (300 €/Tag), H (600 €/Tag). Welcher zuerst?", ["H", "B", "E", "alle drei gleichzeitig"], 2, "Den kritischen Vorgang mit den geringsten Verkürzungskosten je Tag zuerst (E, 300 €)."),
  Q("pmx-q14", "pmx-verk", "Wann wendet man eine Rückwärtsrechnung ab einem festen Termin an?", ["Wenn nur der Starttermin bekannt ist", "Wenn eine Deadline (fixer Endtermin) vorgegeben ist und der späteste Start gesucht wird", "Nur bei agilen Projekten", "Wenn keine Dauern bekannt sind"], 1, "Mit Deadline: SEZ des letzten Vorgangs = Deadline, dann rückwärts → spätester Projektstart."),
  Q("pmx-q15", "pmx-verk", "Die Rückwärtsrechnung ab Deadline ergibt einen Gesamtpuffer von −2 Tagen am kritischen Pfad. Bedeutung?", ["2 Tage Reserve", "Termin mit aktueller Planung nicht haltbar, 2 Tage müssen eingespart werden", "Vorgang ist nicht kritisch", "Projekt endet 2 Tage früher"], 1, "Negativer Puffer = kritischer Pfad länger als verfügbare Zeit."),
  Q("pmx-q16", "pmx-verk", "Was trifft auf ressourcengesteuerte Projektplanung zu?", ["Die Termine werden laufend verschoben", "Gesteuert wird über den Ressourceneinsatz – funktioniert nicht mehr, wenn Ressourcen beengt sind", "Der Leistungsumfang wird reduziert", "Es gibt keinen Netzplan"], 1, "Ressourcen aufstocken ist die Stellschraube; bei Ressourcenengpass muss über Zeit oder Funktionalität gesteuert werden."),
  Q("pmx-q17", "pmx-verk", "Welche Maßnahme verkürzt einen kritischen Vorgang NICHT direkt?", ["Zusätzliche qualifizierte Mitarbeiter:in", "Überlappender Start des Nachfolgers (Fast Tracking)", "Erhöhung des Puffers eines unkritischen Vorgangs", "Leistungsumfang des Vorgangs reduzieren"], 2, "Puffer unkritischer Vorgänge haben keinen Einfluss auf die Projektdauer."),
  Q("pmx-q18", "pmg-schaetz", "Prozentsatzmethode: Phase 3 macht 30 % aus und wird mit 630 h geschätzt. Gesamtaufwand?", ["1.890 h", "2.100 h", "2.000 h", "660 h"], 1, "1 % = 630 / 30 = 21 h → 100 % = 2.100 h."),
  Q("pmx-q19", "pmg-schaetz", "Bei 1 % = 21 h: Aufwand einer Phase mit 21 %?", ["442 h", "441 h", "420 h", "462 h"], 1, "21 × 21 = 441 h (in der Mitschrift stand fälschlich 442)."),
  Q("pmx-q20", "pmg-schaetz", "PERT: T_o = 6, T_w = 9, T_p = 18. Erwartete Dauer?", ["11", "9", "10", "12"], 2, "(6 + 4·9 + 18) / 6 = 60 / 6 = 10."),
  Q("pmx-q21", "pmg-schaetz", "Stichprobenmethode: 12 von 180 Masken detailliert geschätzt = 54 PT. Gesamtaufwand?", ["648 PT", "810 PT", "540 PT", "900 PT"], 1, "Faktor 180 / 12 = 15 → 15 × 54 = 810 PT."),
  Q("pmx-q22", "pmg-schaetz", "Wofür eignet sich die Prozentsatzmethode laut Vorlesung?", ["Für sehr genaue Schätzungen am Projektende", "Für eine frühe, grobe Hochrechnung aus einer bekannten Phase auf die übrigen", "Nur für Hardwareprojekte", "Für die Berechnung des kritischen Pfades"], 1, "Man kennt die Verteilung auf die Phasen und schließt aus einer (z. B. dem Entwurf) auf die anderen."),
  Q("pmx-q23", "pmg-psp", "Ein PSP (Baumgraph) hat 13 Knoten. Wie viele Kanten?", ["13", "14", "12", "26"], 2, "Im Baum gilt Kanten + 1 = Knoten."),
  Q("pmx-q24", "pmg-psp", "Hausbau gegliedert in Elektro-, Wasser- und Heizungsinstallation – welcher PSP-Typ?", ["objektorientiert", "funktionsorientiert", "ablauforientiert", "kostenorientiert"], 1, "Gliederung nach Funktionen/Gewerken."),
  Q("pmx-q25", "pmg-psp", "Hausbau gegliedert in Planung → Rohbau → Innenausbau → Übergabe – welcher PSP-Typ?", ["ablauforientiert", "objektorientiert", "funktionsorientiert", "matrixorientiert"], 0, "Gliederung nach zeitlicher Abfolge/Phasen."),
  Q("pmx-q26", "pmg-org", "Welche ist KEINE der 5 Projektorganisationsformen der Vorlesung?", ["Matrix-Projektorganisation", "Einfluss-Projektorganisation", "Sparten-Projektorganisation", "Auftrags-Projektorganisation"], 2, "Die 5 Formen: reine, Einfluss-, Matrix-, Auftrags-PO und PM in der Linie."),
  Q("pmx-q27", "pmg-rollen", "Was ist ein Prozesszweig?", ["Ein abgebrochener Prozess", "Parallel durchgeführte Phasen/Aktivitäten", "Ein Teilprojekt mit eigenem Budget", "Eine Kante im PSP"], 1, "Laut Prozessorganisation heißen parallel durchgeführte Phasen Prozesszweige."),
  Q("pmx-q28", "pmg-rollen", "Wofür setzt man Projektgremien ein?", ["Zur Programmierung", "Zur Unterstützung von Planung, Beratung, Steuerung, Entscheidung und Kommunikation", "Nur zur Abrechnung", "Als Ersatz für die Projektleitung"], 1, "Fünf Gremienarten: Planungs-, Beratungs-, Steuerungs-, Entscheidungs-, Kommunikationsgremium."),
  Q("pmx-q29", "pmg-pm", "Richtig oder falsch: Ein Meilenstein ist ein Vorgang mit eigener Dauer.", ["Richtig", "Falsch"], 1, "Falsch: Meilenstein = Ereignis (Dauer 0) mit definiertem, überprüfbarem Ergebnis und Termin."),
  Q("pmx-q30", "pmg-pm", "Was ist ein Projektportfolio?", ["Mehrere Projekte mit gemeinsamem übergeordneten Ziel", "Die Gesamtheit aller Projekte eines Unternehmens bzw. Geschäftsbereichs", "Die Dokumentenmappe eines Projekts", "Der Projektstrukturplan"], 1, "Programm = zusammenhängende Projekte mit übergeordnetem Ziel; Portfolio = alle Projekte eines Unternehmens/Bereichs."),
  Q("pmx-q31", "pmg-gruend", "Welche Planungsausrichtung: Budget ist fix, Termin wird daraus ermittelt?", ["leistungsfixiert", "terminfixiert", "kostenfixiert", "ressourcenfrei"], 2, "Kostenfixiert: Budget fix; ein früherer Termin nur durch Änderung von Leistung/Qualität.")
);

/* ---------- Offene Altfragen mit Musterantwort ---------- */
let fN = 0;
const F = (topic, front, back, pts) => { const o = { id: "pmxf" + (++fN), cat: "PMGT", topic, front, back, alt: true }; if (pts) o.pts = pts; return o; };
c.flashcards.push(
  F("pmg-netz", "Wie nennt man die Methode der Netzplantechnik noch?", "<b>Critical Path Method (CPM)</b> – Methode des kritischen Pfades (1957, USA). Verwandt: <b>PERT</b> (Program Evaluation and Review Technique, Drei-Zeiten-Schätzung). Netzplan = bewerteter, gerichteter, zyklenfreier Graph (DIN 69900)."),
  F("pmg-netz", "Welche Parameter kann man auf einem Netzplan (Vorgangsknoten) darstellen?", "<ul><li>Vorgangsnummer, -bezeichnung, <b>Dauer</b> (evtl. Verantwortliche:r, Ressourcen, Kosten)</li><li><b>FAZ</b> frühester Anfang, <b>FEZ</b> frühestes Ende</li><li><b>SAZ</b> spätester Anfang, <b>SEZ</b> spätestes Ende</li><li><b>GP</b> Gesamtpuffer, <b>FP</b> freier Puffer</li><li>Anordnungsbeziehungen (Pfeile, meist Ende→Anfang), kritischer Pfad, Meilensteine</li></ul>"),
  F("pmg-netz", "Wann bezeichnet man einen Vorgang als kritisch – wann als nicht kritisch?", "<b>Kritisch</b>: Gesamtpuffer GP = 0 (FAZ = SAZ, FEZ = SEZ) – jede Verzögerung verschiebt das Projektende; er liegt auf dem <b>kritischen Pfad</b> (längster Weg Start → Ende). <b>Nicht kritisch</b>: GP &gt; 0, der Vorgang hat Puffer und kann um diesen verschoben/verlängert werden, ohne das Projektende zu gefährden."),
  F("pmg-netz", "Wie berechnet man die Pufferzeit?", "<b>Gesamtpuffer GP = SEZ − FEZ = SAZ − FAZ</b> (Verschiebung ohne das Projektende zu gefährden).<br><b>Freier Puffer FP</b> = kleinstes FAZ der Nachfolger − FEZ (Zeitpunktzählung) bzw. − FEZ − 1 (Tageszählung): Verschiebung ohne einen Nachfolger zu verschieben.<br>Beispiel: FAZ 6, FEZ 11, SAZ 9, SEZ 14 → GP = 3."),
  F("pmx-verk", "Sie sind im Projektcontrolling tätig. Welche Vorgänge betrachten Sie zuerst, wenn Sie die Projektzeit verkürzen wollen?", "Die <b>kritischen Vorgänge</b> – alle Vorgänge auf dem <b>kritischen Pfad</b> (GP = 0). Nur deren Verkürzung verkürzt die Projektdauer; Vorgänge mit Puffer zu verkürzen erhöht nur deren Puffer. Achtung: Gibt es mehrere kritische Pfade, müssen alle verkürzt werden; nach einer Verkürzung kann ein anderer Pfad kritisch werden."),
  F("pmx-verk", "Sie haben viele kritische Vorgänge identifiziert. Welche Eigenschaften betrachten Sie als Nächstes, um die Projektzeit zu verkürzen?", "<ul><li><b>Dauer</b> (lange Vorgänge = großes Potenzial)</li><li><b>Kosten der Verkürzung</b> je Tag (billigste zuerst)</li><li><b>technische Verkürzbarkeit</b> / Mindestdauer, Teilbarkeit der Arbeit</li><li><b>verfügbare, qualifizierte Ressourcen</b></li><li><b>Abhängigkeiten</b>: Überlappung möglich? Liegt der Vorgang auf mehreren kritischen Pfaden?</li><li><b>Risiko und Qualitätsauswirkung</b></li></ul>"),
  F("pmx-verk", "Durch welche Maßnahmen könnten Sie einen Vorgang verkürzen?", "<ul><li>mehr Ressourcen: zusätzliches Personal, Überstunden, Schichten</li><li>Parallelisieren / Überlappen mit Nachfolger (Fast Tracking), Vorgang aufteilen</li><li>Leistungsumfang reduzieren (in späteres Release)</li><li>besser qualifiziertes Personal, bessere Werkzeuge, Standardlösungen</li><li>Fremdvergabe an Externe</li><li>Abhängigkeiten aufheben (z. B. Genehmigungen früher)</li></ul>Nebenwirkungen: höhere Kosten, Koordinationsaufwand, Risiko (magisches Dreieck)."),
  F("pmg-gruend", "Welche sind die wichtigsten Parameter zur Projektdefinition?", "Die Größen des <b>magischen Dreiecks</b>: <b>Leistung/Qualität</b> (Projektziel, Funktionalität), <b>Termin/Zeit</b> (Start, Ende, Meilensteine) und <b>Kosten/Ressourcen</b> (Budget, Personal). Dazu im Projektantrag: Auftraggeber:in, Projektleitung, Ausgangssituation/Problem, Rahmenbedingungen, Wirtschaftlichkeit, Risiken. Mit der Parameterausrichtung (kosten-, termin-, leistungsfixiert) wird festgelegt, welche Größe fix ist."),
  F("pmg-pm", "Was ist ein Programm?", "Eine <b>Reihe zusammenhängender Projekte</b>, die einer <b>übergeordneten Zielsetzung</b> dienen und gemeinsam gesteuert werden (z. B. Apollo-Programm, Digitalisierungsprogramm mit Teilprojekten CRM, ERP, Webshop). Zeitlich begrenzt."),
  F("pmg-pm", "Was ist ein Projektportfolio?", "Die <b>Gesamtheit aller Projekte</b> (und Programme) eines Unternehmens oder Geschäftsbereichs zu einem Zeitpunkt. Portfoliomanagement wählt Projekte aus, priorisiert und verteilt Ressourcen – die Projekte müssen nicht inhaltlich zusammenhängen (Unterschied zum Programm)."),
  F("pmg-pm", "Was versteht man unter dem magischen Dreieck?", "Die drei konkurrierenden Projektziele <b>Qualität/Leistung</b>, <b>Kosten/Ressourcen</b> und <b>Zeit/Termine</b>, in der Mitte die Steuerung. Sie hängen voneinander ab: Ändert sich eine Größe (z. B. höhere Qualität), wirkt sich das zwangsläufig auf mindestens eine andere aus (mehr Kosten oder spätere Fertigstellung)."),
  F("pmg-pm", "Was ist ein Meilenstein?", "Ein <b>Ereignis besonderer Bedeutung</b> (Dauer 0) im Projekt: <b>Inhalt</b> = definiertes (Teil-)<b>Ergebnis</b> – wesentlich für den Projekterfolg, im Voraus definierbar, überprüfbar, eindeutig; <b>Termin</b> = Fertigstellungsdatum. Zwischenziel zur Kontrolle, oft am Phasenende (z. B. Abnahme Pflichtenheft). Wird in der Projektplanung festgelegt."),
  F("pmg-gruend", "Definieren Sie die kostenfixierte, terminfixierte und leistungsfixierte Projektplanung.", "<ul><li><b>Kostenfixiert</b>: Budget ist vorgegeben; daraus wird der Termin ermittelt. Früherer Termin nur durch Änderung der Leistung/Qualität. (z. B. Marktpreis durch Wettbewerb)</li><li><b>Terminfixiert</b>: Leistung und Fertigstellungstermin fix; die Kosten werden ermittelt, senkbar nur durch weniger Leistung. (Messe, Konventionalstrafe, Time-to-Market)</li><li><b>Leistungsfixiert</b>: Leistung und Qualität fix; Kosten und Termine ergeben sich, Spielraum nur durch Verschiebung zwischen Kosten und Termin. (Sicherheitstechnik, Kraftwerk, Raumfahrt)</li></ul>"),
  F("pmg-org", "Welche 5 Organisationsformen gibt es im Projektmanagement – und wann wählt man welche?", "<ul><li><b>Reine PO</b>: PL mit voller Weisungsbefugnis, eigene Einheit → große, wichtige, interdisziplinäre Projekte; Nachteil Auflösung/Rückführung</li><li><b>Einfluss-PO</b>: nur Koordinator:in, Entscheidungen in der Linie → kleine Projekte, Definitionsphase; Nachteil kaum Durchgriff</li><li><b>Matrix-PO</b>: PL fachlich, Linie disziplinarisch → mittlere Projekte, Mitarbeitende aus vielen Abteilungen; Nachteil „zwei Herren“, Konflikte</li><li><b>Auftrags-PO</b>: PM-Einheit vergibt Aufträge an Linie/Externe → klare Kompetenzen, flexibel; Nachteil Bürokratie</li><li><b>PM in der Linie</b>: Abteilungsleitung = PL → kleine Projekte innerhalb einer Abteilung</li></ul>Kriterien: Projektgröße und Interdisziplinarität; Form kann im Projektverlauf wechseln."),
  F("pmg-rollen", "Welche Projektgremien gibt es typischerweise, wofür setzt man sie ein (mit Beispielen)?", "Gremien unterstützen strategische Planung und Steuerung und sichern den Informationsfluss:<ul><li><b>Planungsgremium</b> (Planungsteam) – führt Planung durch, trifft sich häufig</li><li><b>Beratungsgremium</b> (Anwenderkreis, Fachausschuss) – Anforderungen benennen/priorisieren</li><li><b>Steuerungsgremium</b> (Change Control Board) – fachliche Steuerung zu Meilensteinen</li><li><b>Entscheidungsgremium</b> (Lenkungsausschuss) – strategische Entscheidungen, selten, am Phasenende</li><li><b>Kommunikationsgremium</b> (User Club, Fachbeirat) – projektübergreifender Erfahrungsaustausch</li></ul>"),
  F("pmg-schaetz", "Erklären Sie die Prozentsatzmethode und rechnen Sie ein Beispiel.", "Aus abgeschlossenen Projekten ist die <b>prozentuale Verteilung des Aufwands auf die Phasen</b> bekannt. Kennt man eine Phase (z. B. Entwurf), schließt man auf die anderen: Aufwand ÷ Prozentsatz = 1 % → × 100 = Gesamt.<br>Beispiel: Phase 3 = 30 % = 630 h → 1 % = 21 h → Gesamt 2.100 h; Phase 1 (14 %) 294 h, Phase 2 (15 %) 315 h, Phase 4 (20 %) 420 h, Phase 5 (21 %) 441 h. Grob, eher für frühe Schätzungen; mit zweiter Methode plausibilisieren."),
  F("pmg-schaetz", "Welche Schätzmethoden kennen Sie? (Überblick)", "<ul><li><b>Vergleichsmethoden</b>: Analogiemethode (ähnliches Projekt, Anpassung durch Schätzer:in), Relationenmethode (Anpassung formalisiert)</li><li><b>Algorithmische</b>: Gewichtungsmethode (Schätzgleichung aus Korrelation), Stichprobenmethode (Teil detailliert schätzen, hochrechnen)</li><li><b>Kennzahlen</b>: Multiplikatormethode (Menge × Kosten je Einheit)</li><li><b>Verteilung</b>: Prozentsatzmethode</li><li>PERT-Drei-Zeiten-Schätzung (T<sub>o</sub> + 4T<sub>w</sub> + T<sub>p</sub>)/6</li></ul>Zuschlag 10–30 % für PM, Test/Doku, Schulung."),
  F("pmx-verk", "Was ist ressourcengesteuerte Projektplanung?", "Steuerung über die Ecke <b>Ressourcen/Kosten</b> des magischen Dreiecks: Ziel und Termin bleiben, bei Verzug werden <b>Ressourcen aufgestockt</b> (Personal, Überstunden, Budget). Funktioniert nur, solange Ressourcen verfügbar sind – sind sie <b>beengt</b>, kann man nicht mehr über Ressourcen steuern. Alternativen: <b>zeitgesteuert</b> (Termin verschieben) oder <b>funktionalitätsgesteuert</b> (Leistung reduzieren)."),
  F("pmx-verk", "Wann kann/muss man eine Rückwärtsrechnung durchführen?", "Wenn ein <b>fixer Endtermin (Deadline)</b> vorgegeben ist: Man setzt SEZ des letzten Vorgangs = Deadline und rechnet rückwärts (SAZ = SEZ − D (+1 bei Tageszählung), Vorgänger-SEZ = min SAZ der Nachfolger) → <b>spätester Start</b> jedes Vorgangs und des Projekts. Negativer Puffer zeigt, dass die Deadline nicht haltbar ist. (Im normalen Netzplan dient die Rückwärtsrechnung zur Bestimmung von SAZ/SEZ und Puffern.)"),
  F("pmg-psp", "Was ist ein Projektstrukturplan und welche 3 Typen gibt es?", "PSP = <b>hierarchische Gliederung</b> des Projekts in Teilprojekte/Teilaufgaben bis zu den <b>Arbeitspaketen</b>; ein <b>Baumgraph</b> (Knoten = Kanten + 1). Typen (Bsp. Hausbau):<ul><li><b>objektorientiert</b> – nach Bestandteilen (Keller, EG, Dach)</li><li><b>funktionsorientiert</b> – nach Funktionen/Gewerken (Elektro, Wasser, Heizung)</li><li><b>ablauforientiert</b> – nach zeitlicher Abfolge (Planung, Rohbau, Ausbau)</li></ul>+ Mischformen. Basis für Schätzung, Netzplan, Kosten."),
  F("pmg-rollen", "Was ist ein Prozesszweig?", "In der Prozessorganisation (Prozess → Prozessabschnitt → Prozessphase → Prozessschritt) heißen <b>parallel durchgeführte Phasen/Aktivitäten</b> Prozesszweige – z. B. Hardware- und Softwareentwicklung laufen gleichzeitig und werden später zusammengeführt."),
  F("pmx-netzrech", "Beschreiben Sie den Ablauf einer Netzplanberechnung (Vorwärts-/Rückwärtsrechnung).", "<ol><li><b>Vorwärts</b>: Start FAZ = 1 (bzw. 0). FEZ = FAZ + D − 1 (bzw. + D). Mehrere Vorgänger → <b>Maximum</b> der FEZ (+1).</li><li>Projektende = größtes FEZ.</li><li><b>Rückwärts</b>: letzter SEZ = Projektende (oder Deadline). SAZ = SEZ − D + 1 (bzw. − D). Mehrere Nachfolger → <b>Minimum</b> der SAZ (−1).</li><li>GP = SEZ − FEZ = SAZ − FAZ, FP = min FAZ Nachfolger − FEZ (−1).</li><li>Kritischer Pfad = alle Vorgänge mit GP = 0.</li></ol>"),
  F("pmx-netzrech", "Merkregel ±1 in der Tageszählung (Prüfungsformat)?", "Vorwärts: <b>x + D − 1</b>, bei mehreren Vorgängern den <b>größten</b> (spätesten) Wert nehmen und +1 für den Nachfolger. Rückwärts: <b>x − D + 1</b>, bei mehreren Nachfolgern den <b>kleinsten</b> (frühesten) Wert nehmen und −1 für den Vorgänger. Puffer: einfach SEZ − FEZ bzw. SAZ − FAZ."),
  F("pmg-netz", "Unterschied Gesamtpuffer und freier Puffer?", "<b>GP</b>: Zeit, um die ein Vorgang verschoben werden kann, <b>ohne das Projektende</b> zu verschieben (Nachfolger dürfen sich mitverschieben). <b>FP</b>: Zeit, um die er verschoben werden kann, <b>ohne irgendeinen Nachfolger</b> zu verschieben (alle Nachfolger bleiben in FAZ). Es gilt FP ≤ GP."),
  F("pmg-netz", "Was ist der kritische Pfad und warum ist er wichtig?", "Der <b>längste Weg</b> vom Projektstart zum -ende; er besteht nur aus Vorgängen ohne Puffer (GP = 0). Seine Länge = minimale Projektdauer. Jede Verzögerung darauf verschiebt das Projektende; Verkürzungen wirken nur hier. Es kann mehrere kritische Pfade geben."),
  F("pmg-psp", "Wie hängen PSP und Netzplan zusammen?", "Der PSP liefert die <b>Arbeitspakete</b> (WAS ist zu tun), die Ablaufplanung legt die <b>Abhängigkeiten</b> fest, der Netzplan ergänzt Dauern und berechnet die Termine (WANN). Reihenfolge: Strukturplanung → Aufgabenplanung (Aufwand, Bearbeiter:innen) → Ablaufplanung → Terminierung.")
);

/* ---------- Aufgaben-Daten ---------- */
const N1_ROWS = [
  ["A Anforderungsanalyse", 5, "–", 1, 5, 1, 5, 0, 0],
  ["B Systemauswahl", 3, "A", 6, 8, 6, 8, 0, 0],
  ["C Schnittstellenkonzept", 4, "A", 6, 9, 6, 9, 0, 0],
  ["D Customizing", 8, "B", 9, 16, 9, 16, 0, 0],
  ["E Datenmigration vorbereiten", 6, "B, C", 10, 15, 11, 16, 1, 1],
  ["F Schnittstellen entwickeln", 7, "C", 10, 16, 10, 16, 0, 0],
  ["G Integrationstest", 4, "D, E, F", 17, 20, 17, 20, 0, 0],
  ["H Schulung", 3, "D", 17, 19, 18, 20, 1, 1],
  ["I Go-live", 1, "G, H", 21, 21, 21, 21, 0, 0]
];
const N2_ROWS = [
  ["A", 4, "–", 1, 4, 1, 4, 0, 0], ["B", 6, "A", 5, 10, 5, 10, 0, 0], ["C", 5, "A", 5, 9, 9, 13, 4, 0],
  ["D", 3, "A", 5, 7, 11, 13, 6, 2], ["E", 7, "B", 11, 17, 11, 17, 0, 0], ["F", 4, "C, D", 10, 13, 14, 17, 4, 4],
  ["G", 6, "C", 10, 15, 14, 19, 4, 0], ["H", 5, "E, F", 18, 22, 18, 22, 0, 0], ["J", 3, "G", 16, 18, 20, 22, 4, 4],
  ["K", 2, "H, J", 23, 24, 23, 24, 0, 0]
];
const N3_ROWS = [
  ["A", 2, "–", 1, 2, 7, 8, 6, 0], ["B", 4, "A", 3, 6, 9, 12, 6, 0], ["C", 3, "A", 3, 5, 13, 15, 10, 0],
  ["D", 5, "B", 7, 11, 13, 17, 6, 0], ["E", 2, "B, C", 7, 8, 16, 17, 9, 3], ["F", 4, "C", 6, 9, 17, 20, 11, 5],
  ["G", 3, "D, E", 12, 14, 18, 20, 6, 0], ["H", 2, "F, G", 15, 16, 21, 22, 6, 6]
];
const N4_ROWS = [
  ["A", 2, "–", 0, 2, 0, 2, 0, 0], ["B", 3, "A", 2, 5, 2, 5, 0, 0], ["C", 6, "A", 2, 8, 6, 12, 4, 4],
  ["D", 4, "B", 5, 9, 5, 9, 0, 0], ["E", 2, "B", 5, 7, 7, 9, 2, 2], ["F", 3, "D, E", 9, 12, 9, 12, 0, 0],
  ["G", 1, "C, F", 12, 13, 12, 13, 0, 0]
];
const blank = rows => T(["Vorgang", "Dauer (Tage)", "Vorgänger"], rows.map(r => [r[0], r[1], r[2]]));

/* ---------- Exam-Prep ---------- */
c.examPrep = {
  format: "Laut Altfragen-Mitschrift (Übung 2, 27.11.2024) besteht die schriftliche Prüfung (85 % der Note, ohne Unterlagen) aus <b>5 Fragen mit Unterfragen</b>: Theoriefragen wie in der Fragensammlung (Definitionen, Aufzählungen mit Begründung) und <b>Rechenteile</b> – Netzplan (CPM, Vorwärts-/Rückwärtsrechnung, Puffer, kritischer Pfad, Verkürzung) und Aufwandsschätzung (v. a. Prozentsatzmethode). Ein Taschenrechner, auch grafikfähig, ist laut Mitschrift erlaubt. Die Netzplanaufgabe (Fotos) war ein großes Vorgangsknotennetz über mehrere Seiten mit vorgedruckten Knoten zum Ausfüllen, gerechnet in Tageszählung (Start Tag 1, ±1-Regel). Dauer und genaue Punkteverteilung gehen aus den Quellen nicht hervor.",
  sources: ["PMGT_Prüfungsfragen (15 offene Altfragen)", "Mitschrift „AltFragen“ Übung 2 (27.11.2024)", "Fotos Netzplan-Prüfungsaufgabe (3 Seiten, Formeln GP/vorwärts/rückwärts)"],
  strategy: [
    "Netzplan bis zur Routine üben: Vorwärts (Maximum, FEZ = FAZ + D − 1), rückwärts (Minimum, SAZ = SEZ − D + 1), GP und FP – alle Aufgaben unten ohne Lösung rechnen und vergleichen; Zählweise (Start Tag 1) dazuschreiben.",
    "Bei Verkürzungsfragen immer zuerst „nur kritische Vorgänge“ sagen, dann Kriterien (Dauer, Kosten/Tag, Ressourcen, Machbarkeit, Abhängigkeiten) und Maßnahmen nennen – und prüfen, ob ein zweiter Pfad kritisch wird.",
    "Aufzählungen auswendig mit Begründung: 5 Organisationsformen (+ wann welche), 5 Gremienarten (+ Beispiele), 3 PSP-Typen (+ Hausbau-Beispiel), 3 Parameterausrichtungen, magisches Dreieck.",
    "Prozentsatzmethode als Tabelle rechnen (1 %-Wert, Gesamt, alle Phasen, Summenprobe) – Rundungs-/Tippfehler wie 442 statt 441 vermeiden.",
    "Definitionen präzise: Meilenstein (Ergebnis + Termin, überprüfbar), Programm vs. Portfolio, Prozesszweig (parallele Phasen), kritischer Vorgang (GP = 0)."
  ],
  focus: [
    { topic: "pmx-netzrech", weight: 3, note: "Netzplan-Rechenaufgabe in der Altprüfung (Fotos) + Mitschrift „Netzplan Berechnung (CPM)“" },
    { topic: "pmg-netz", weight: 3, note: "Altfragen 1–4: andere Bezeichnung (CPM), Parameter, kritisch, Pufferberechnung" },
    { topic: "pmx-verk", weight: 3, note: "Altfragen 5–7 + Mitschrift: verkürzen, ressourcengesteuerte Planung, Rückwärtsrechnung bei Deadline" },
    { topic: "pmg-schaetz", weight: 3, note: "Mitschrift: Schätzmethoden-Berechnung, Prozentsatzmethode mit Beispiel" },
    { topic: "pmg-org", weight: 3, note: "Altfrage 14 + Mitschrift: 5 Organisationsformen, warum welche" },
    { topic: "pmg-rollen", weight: 2, note: "Altfrage 15 + Mitschrift: Projektgremien mit Zweck/Beispielen; Prozesszweig" },
    { topic: "pmg-psp", weight: 2, note: "Mitschrift: PSP als Baum, 3 Typen" },
    { topic: "pmg-pm", weight: 2, note: "Altfragen 9–12: Programm, Portfolio, magisches Dreieck, Meilenstein" },
    { topic: "pmg-gruend", weight: 2, note: "Altfragen 8 und 13: Parameter der Projektdefinition, kosten-/termin-/leistungsfixiert" },
    { topic: "pmg-res", weight: 1, note: "Hintergrund für ressourcengesteuerte Planung (termin- vs. kapazitätstreu)" }
  ],
  checklist: [
    { id: "pmxc1", topic: "pmx-netzrech", text: "Ein Netz mit 8–10 Vorgängen fehlerfrei vorwärts rechnen (FAZ/FEZ, Maximum bei mehreren Vorgängern, Tageszählung)" },
    { id: "pmxc2", topic: "pmx-netzrech", text: "Rückwärts rechnen (SEZ/SAZ, Minimum bei mehreren Nachfolgern) und GP = SEZ − FEZ = SAZ − FAZ prüfen" },
    { id: "pmxc3", topic: "pmx-netzrech", text: "Freien Puffer berechnen und erklären, warum FP ≤ GP" },
    { id: "pmxc4", topic: "pmx-netzrech", text: "Kritischen Pfad (auch mehrere gleich lange) markieren und Projektdauer angeben" },
    { id: "pmxc5", topic: "pmx-netzrech", text: "Zeitpunktzählung (Start 0) und Tageszählung (Start 1) ineinander umrechnen" },
    { id: "pmxc6", topic: "pmx-verk", text: "What-if: Auswirkung einer Verlängerung/Verkürzung eines kritischen bzw. unkritischen Vorgangs bestimmen" },
    { id: "pmxc7", topic: "pmx-verk", text: "Projekt mit Verkürzungskosten (Crashing) kostenminimal verkürzen, parallele kritische Pfade beachten" },
    { id: "pmxc8", topic: "pmx-verk", text: "Kriterien und 5+ Maßnahmen zur Verkürzung kritischer Vorgänge nennen" },
    { id: "pmxc9", topic: "pmx-verk", text: "Rückwärtsrechnung ab Deadline durchführen, negativen Puffer deuten" },
    { id: "pmxc10", topic: "pmx-verk", text: "Ressourcen-, zeit- und funktionalitätsgesteuerte Planung erklären (Grenze: beengte Ressourcen)" },
    { id: "pmxc11", topic: "pmg-netz", text: "Andere Bezeichnung (CPM), Knotenparameter und Definition „kritisch“ wiedergeben" },
    { id: "pmxc12", topic: "pmg-schaetz", text: "Prozentsatzmethode als Tabelle rechnen inkl. Summenprobe" },
    { id: "pmxc13", topic: "pmg-schaetz", text: "Schätzmethoden einteilen (Vergleich, algorithmisch, Multiplikator, Prozentsatz) und Stichprobe/PERT rechnen" },
    { id: "pmxc14", topic: "pmg-psp", text: "PSP für ein Beispielprojekt in allen 3 Typen skizzieren; Knoten = Kanten + 1" },
    { id: "pmxc15", topic: "pmg-org", text: "5 Organisationsformen mit Befugnis, Vor-/Nachteilen und Einsatzfall nennen" },
    { id: "pmxc16", topic: "pmg-rollen", text: "5 Gremienarten mit Zweck und Beispiel nennen; Prozesszweig definieren" },
    { id: "pmxc17", topic: "pmg-pm", text: "Meilenstein, Programm, Portfolio, magisches Dreieck exakt definieren" },
    { id: "pmxc18", topic: "pmg-gruend", text: "Kosten-, termin-, leistungsfixierte Planung mit Beispiel definieren; Parameter der Projektdefinition nennen" }
  ],
  tasks: [
    { id: "pmxr1", topic: "pmx-netzrech", title: "Netzplan CRM-Einführung (zwei kritische Pfade)", pts: 20,
      html: "<p>Ein CRM-System wird eingeführt. Das Projekt startet an <b>Tag 1</b> (Tageszählung).</p>" + blank(N1_ROWS) +
        "<p>a) Zeichne das Vorgangsknotennetz und berechne FAZ, FEZ, SAZ, SEZ, GP und FP für alle Vorgänge.<br>b) Wie lange dauert das Projekt? Bestimme den/die kritischen Pfad(e).<br>c) Die Projektleitung verkürzt D (Customizing) durch eine zusätzliche Beraterin um 3 Tage. Wie lange dauert das Projekt danach? Begründe.<br>d) F verzögert sich um 3 Tage (ohne Maßnahme aus c). Neues Projektende?<br>e) H (Schulung) startet 1 Tag später als geplant. Folgen?</p>",
      solution: "<p><b>a)</b></p>" + T(NH, N1_ROWS) +
        "<p>Rechenweg Knoten mit mehreren Vorgängern: E: FAZ = max(FEZ B = 8, FEZ C = 9) + 1 = 10. G: FAZ = max(16, 15, 16) + 1 = 17. I: max(20, 19) + 1 = 21.<br>Rückwärts: D hat Nachfolger G (SAZ 17) und H (SAZ 18) → SEZ = 17 − 1 = 16. C hat Nachfolger E (SAZ 11) und F (SAZ 10) → SEZ = 9. B hat D (SAZ 9) und E (SAZ 11) → SEZ 8. A: min(SAZ B 6, SAZ C 6) − 1 = 5.</p>" +
        "<p><b>b)</b> Projektende <b>Tag 21</b> (21 Tage). Es gibt <b>zwei kritische Pfade</b>: A → B → D → G → I und A → C → F → G → I (je 5+3+8+4+1 = 5+4+7+4+1 = 21).</p>" +
        "<p><b>c)</b> Weiterhin <b>21 Tage</b>: D liegt nur auf dem Pfad A-B-D-G-I (jetzt 18 Tage); A-C-F-G-I bleibt mit 21 Tagen kritisch. B und D erhalten Puffer (B GP 2, D GP 3). Sinnvoller wäre eine Verkürzung gemeinsamer Vorgänge (A, G, I) oder beider Pfade gleichzeitig.</p>" +
        "<p><b>d)</b> F liegt auf einem kritischen Pfad → Projektende verschiebt sich um 3 Tage auf <b>Tag 24</b>; nun ist nur noch A-C-F-G-I kritisch (24), A-B-D-G-I hat 3 Tage Puffer.</p>" +
        "<p><b>e)</b> H hat GP = FP = 1 → 1 Tag Verzögerung wird vom Puffer aufgefangen, weder I noch das Projektende verschieben sich; H wird dadurch kritisch.</p>" },
    { id: "pmxr2", topic: "pmx-verk", title: "Netzplan mit Verkürzungskosten (Crashing)", pts: 20,
      html: "<p>Start Tag 1 (Tageszählung). Verkürzungsmöglichkeiten: A max. 1 Tag (900 €/Tag), B max. 2 Tage (400 €/Tag), C max. 1 Tag (200 €/Tag), E max. 2 Tage (300 €/Tag), G max. 2 Tage (250 €/Tag), H max. 2 Tage (600 €/Tag); alle anderen nicht verkürzbar.</p>" + blank(N2_ROWS) +
        "<p>a) Berechne den Netzplan (FAZ … FP), Projektdauer und kritischen Pfad.<br>b) Der Auftraggeber verlangt eine Fertigstellung nach <b>20 Tagen</b>. Welche Vorgänge verkürzt du, damit die Mehrkosten minimal sind? Mehrkosten?<br>c) Geht es noch einen Tag schneller (19 Tage)? Mit welchen Maßnahmen und Mehrkosten?</p>",
      solution: "<p><b>a)</b></p>" + T(NH, N2_ROWS) +
        "<p>Projektdauer <b>24 Tage</b>, kritischer Pfad <b>A → B → E → H → K</b>. Weitere Pfade: A-C-F-H-K = 20, A-C-G-J-K = 20, A-D-F-H-K = 18.</p>" +
        "<p><b>b)</b> Es müssen 4 Tage am kritischen Pfad eingespart werden; die Nebenpfade (20) begrenzen nicht, weil das Ziel genau 20 ist. Günstigste kritische Vorgänge: <b>E −2 Tage (2 × 300 = 600 €)</b>, dann <b>B −2 Tage (2 × 400 = 800 €)</b>. H (600 €/Tag) und A (900 €/Tag) sind teurer. Mehrkosten <b>1.400 €</b>. Danach sind <b>drei Pfade kritisch</b> (A-B-E-H-K, A-C-F-H-K, A-C-G-J-K mit je 20 Tagen).</p>" +
        "<p><b>c)</b> Jetzt müssen alle drei kritischen Pfade gleichzeitig um 1 Tag kürzer werden. Möglichkeiten: A −1 (wirkt auf alle Pfade) = 900 €, oder H −1 (deckt A-B-E-H-K und A-C-F-H-K) + G −1 (deckt A-C-G-J-K) = 600 + 250 = <b>850 €</b>. Günstigste Lösung: <b>H und G je −1 Tag, 850 €</b> → 19 Tage, Gesamtmehrkosten 2.250 €. (C −1 allein reicht nicht, weil A-B-E-H-K nicht über C läuft.)</p>" },
    { id: "pmxr3", topic: "pmx-verk", title: "Rückwärtsrechnung ab Deadline", pts: 12,
      html: "<p>Ein Messeauftritt muss am Ende von <b>Tag 22</b> fertig sein (Deadline). Tageszählung, frühester Start Tag 1.</p>" + blank(N3_ROWS) +
        "<p>a) Berechne Vorwärts- und Rückwärtsrechnung, wobei die Rückwärtsrechnung vom Deadline-Tag 22 ausgeht.<br>b) Wann muss das Projekt spätestens starten? Wie viel Reserve gibt es?<br>c) Die Deadline wird auf Tag 14 vorgezogen. Was ergibt die Rückwärtsrechnung, was ist zu tun?</p>",
      solution: "<p><b>a)</b> (SEZ von H = Deadline 22)</p>" + T(NH, N3_ROWS) +
        "<p>Frühestes Ende ist Tag 16 (Pfad A → B → D → G → H, 2+4+5+3+2 = 16). FP bezieht sich auf die frühesten Termine; für H: 22 − 16 = 6.</p>" +
        "<p><b>b)</b> Spätester Start von A: <b>SAZ = Tag 7</b>. Der Pfad A-B-D-G-H hat 6 Tage Gesamtpuffer (= Reserve bis zur Deadline); er ist der Pfad mit dem geringsten Puffer, also der kritische.</p>" +
        "<p><b>c)</b> Mit SEZ(H) = 14: SAZ H = 13, G: SEZ 12, SAZ 10, D: SEZ 9, SAZ 5, B: SEZ 4, SAZ 1, A: SEZ 0, SAZ −1 → GP am kritischen Pfad = SAZ − FAZ = −1 − 1 = <b>−2 Tage</b>. Negativer Puffer: Die Deadline ist mit dieser Planung nicht haltbar. Maßnahmen: kritische Vorgänge (D, B, G …) um insgesamt 2 Tage verkürzen (Ressourcen, Überlappung, Leistung reduzieren) oder Deadline/Umfang verhandeln.</p>" },
    { id: "pmxr4", topic: "pmg-netz", title: "Netzplan in Zeitpunktzählung (Folienformat) + Umrechnung",
      html: "<p>Rechne den Netzplan in <b>Zeitpunktzählung</b> (Projektstart Zeitpunkt 0, FEZ = FAZ + D) wie im Folienbeispiel:</p>" + blank(N4_ROWS) +
        "<p>a) FAZ, FEZ, SAZ, SEZ, GP, FP, kritischer Pfad, Projektdauer.<br>b) Gib FAZ und FEZ von C in Tageszählung (Start Tag 1) an. Ändert sich der Puffer?<br>c) Um wie viele Tage darf sich E verspäten, ohne F zu verschieben?</p>",
      solution: "<p><b>a)</b></p>" + T(NH, N4_ROWS) +
        "<p>Projektdauer <b>13</b>, kritischer Pfad <b>A → B → D → F → G</b>. G: FAZ = max(FEZ C = 8, FEZ F = 12) = 12. B: SEZ = min(SAZ D = 5, SAZ E = 7) = 5. A: SEZ = min(SAZ B = 2, SAZ C = 6) = 2.</p>" +
        "<p><b>b)</b> Tageszählung: C von Tag 3 bis Tag 8 (FAZ + 1, FEZ gleich). GP bleibt 4 – Puffer hängen nicht von der Zählweise ab.</p>" +
        "<p><b>c)</b> Freier Puffer von E = FAZ F − FEZ E = 9 − 7 = <b>2 Tage</b> (hier zugleich GP = 2).</p>" },
    { id: "pmxr5", topic: "pmx-netzrech", title: "Rechenweg erklären + Zählfalle (Lektionsnetz)", pts: 8,
      html: "<p>A (3, –) · B (5, A) · C (2, A) · D (4, B) · E (6, C) · F (3, D und E) · G (2, F). Start Tag 1.</p><p>a) Berechne alle Termine und Puffer.<br>b) Eine Kollegin rechnet FAZ(F) = 12 mit der Begründung „FEZ(E) = 11 ist früher, also 11 + 1“. Was ist falsch?<br>c) Um wie viele Tage darf sich C verzögern, ohne dass sich E verschiebt bzw. ohne dass sich das Projektende verschiebt?</p>",
      solution: "<p><b>a)</b></p>" + T(NH, L_ROWS) + "<p>Projektende Tag 17, kritischer Pfad A-B-D-F-G.</p>" +
        "<p><b>b)</b> Vorwärts gilt das <b>Maximum</b>: F kann erst starten, wenn D <i>und</i> E fertig sind. FAZ(F) = max(12, 11) + 1 = <b>13</b>.</p>" +
        "<p><b>c)</b> Ohne E zu verschieben: FP(C) = 6 − 5 − 1 = <b>0 Tage</b>. Ohne Projektende zu verschieben: GP(C) = 6 − 5 = <b>1 Tag</b> (E verschiebt sich dann mit und verbraucht seinen eigenen Puffer).</p>" },
    { id: "pmxr6", topic: "pmg-schaetz", title: "Prozentsatzmethode (Übungsbeispiel)", pts: 8,
      html: "<p>Aus abgeschlossenen Projekten ist folgende Phasenverteilung bekannt: Phase 1 14 %, Phase 2 15 %, Phase 3 30 %, Phase 4 20 %, Phase 5 21 %. Phase 3 wurde detailliert mit <b>630 Stunden</b> geschätzt.</p><p>a) Erkläre die Prozentsatzmethode in 2–3 Sätzen.<br>b) Berechne den Aufwand aller Phasen und den Gesamtaufwand (Tabelle).<br>c) Nenne einen Nachteil der Methode und wie man ihm begegnet.</p>",
      solution: "<p><b>a)</b> Man kennt aus Erfahrungsdaten die prozentuale Verteilung des Aufwands auf die Projektphasen. Ist der Aufwand einer Phase bekannt (abgeschlossen oder genau geschätzt), rechnet man über den 1 %-Wert auf den Gesamtaufwand und die übrigen Phasen hoch.</p><p><b>b)</b> 1 % = 630 / 30 = <b>21 h</b></p>" +
        T(["Phase", "Anteil", "Aufwand"], [["1", "14 %", "294 h"], ["2", "15 %", "315 h"], ["3", "30 %", "630 h"], ["4", "20 %", "420 h"], ["5", "21 %", "441 h"], ["Gesamt", "100 %", "<b>2.100 h</b>"]]) +
        "<p>(Summenprobe 294 + 315 + 630 + 420 + 441 = 2.100.)</p><p><b>c)</b> Sehr grob: setzt voraus, dass das neue Projekt dieselbe Phasenverteilung hat wie die Vergleichsprojekte; Fehler in der bekannten Phase werden auf alle Phasen hochgerechnet. Gegenmaßnahme: mit einer zweiten Methode (z. B. Analogie- oder Stichprobenmethode) plausibilisieren, Verteilung aus eigener Datenbasis pflegen.</p>" },
    { id: "pmxr7", topic: "pmg-schaetz", title: "Schätzmethoden kombiniert (Folienverteilung, Stichprobe, PERT)", pts: 12,
      html: "<p>Ein Softwareprojekt: Die Entwurfsphase ist abgeschlossen und hat <b>152 PT</b> gekostet. Folienverteilung: Definition 18 %, Entwurf 19 %, Codierung 34 %, Test 29 %.</p><p>a) Schätze Gesamt- und Phasenaufwände mit der Prozentsatzmethode.<br>b) Für PM, Dokumentation und Schulung wird ein Zuschlag von 20 % angesetzt. Gesamtaufwand?<br>c) Zur Plausibilisierung: 12 der 180 Masken wurden detailliert geschätzt (Codierung) = 54 PT. Hochrechnung nach Stichprobenmethode? Vergleiche mit a).<br>d) Ein Arbeitspaket wird mit T<sub>o</sub> = 6, T<sub>w</sub> = 9, T<sub>p</sub> = 18 Tagen geschätzt. Erwartete Dauer nach PERT?</p>",
      solution: "<p><b>a)</b> 1 % = 152 / 19 = <b>8 PT</b> → Gesamt <b>800 PT</b>: Definition 144 PT, Entwurf 152 PT, Codierung 272 PT, Test 232 PT (Summe 800).</p><p><b>b)</b> 800 × 1,2 = <b>960 PT</b>.</p><p><b>c)</b> Faktor 180 / 12 = 15 → 15 × 54 = <b>810 PT</b> für die Codierung. Das ist deutlich mehr als die 272 PT aus a) – die Schätzungen widersprechen sich; Ursache klären (z. B. Masken komplexer als in Vergleichsprojekten, Stichprobe nicht repräsentativ). Genau dafür sollen mindestens zwei Methoden parallel eingesetzt werden.</p><p><b>d)</b> T<sub>m</sub> = (6 + 4·9 + 18) / 6 = 60 / 6 = <b>10 Tage</b>.</p>" },
    { id: "pmxr8", topic: "pmg-psp", title: "Projektstrukturplan erstellen (3 Typen)", pts: 10,
      html: "<p>Projekt „Einführung eines Online-Shops“ für einen Händler.</p><p>a) Was ist ein PSP? Welche formale Eigenschaft hat er?<br>b) Skizziere die erste Gliederungsebene jeweils objektorientiert, funktionsorientiert und ablauforientiert.<br>c) Dein PSP hat 1 Projektknoten, 4 Teilprojekte und 14 Arbeitspakete. Wie viele Kanten hat er?<br>d) Wozu werden die Arbeitspakete weiterverwendet?</p>",
      solution: "<p><b>a)</b> Hierarchische Gliederung des Projekts in Teilprojekte/Teilaufgaben bis zu Arbeitspaketen; formal ein <b>Baumgraph</b> (Wurzel = Projekt), Knoten = Kanten + 1.</p><p><b>b)</b> Beispiele:</p>" +
        T(["Typ", "1. Ebene"], [["objektorientiert", "Shop-Frontend · Produktkatalog/Datenbank · Payment-Anbindung · Warenwirtschafts-Schnittstelle"], ["funktionsorientiert", "Konzeption/Design · Entwicklung · Test/Qualitätssicherung · Marketing · Schulung/Support"], ["ablauforientiert", "Analyse · Entwurf · Realisierung · Test · Go-live/Einführung"]]) +
        "<p><b>c)</b> 1 + 4 + 14 = 19 Knoten → <b>18 Kanten</b>.</p><p><b>d)</b> Arbeitspakete sind Basis für Aufwandsschätzung, Zuordnung der Verantwortlichen, Netzplan (Vorgänge und Abhängigkeiten), Einsatzmittel- und Kostenplanung sowie Terminüberwachung.</p>" },
    { id: "pmxr9", topic: "pmg-org", title: "Organisationsform und Gremien wählen (Fall)", pts: 10,
      html: "<p>Ein mittelständisches Unternehmen startet ein ERP-Einführungsprojekt (Dauer 18 Monate). Beteiligt sind Mitarbeitende aus Vertrieb, Einkauf, Lager, Buchhaltung und IT, die parallel ihre Linienarbeit weiter erledigen. In der Realisierungsphase soll ein Kernteam Vollzeit arbeiten.</p><p>a) Nenne die 5 Projektorganisationsformen.<br>b) Welche Form empfiehlst du für die Entwurfsphase, welche für die Realisierung? Begründe mit Vor- und Nachteilen.<br>c) Welche Gremien richtest du ein (mind. 3, mit Zweck und konkretem Beispiel)?</p>",
      solution: "<p><b>a)</b> Reine PO, Einfluss-PO, Matrix-PO, Auftrags-PO, PM in der Linie.</p><p><b>b)</b> Entwurf: <b>Matrix-PO</b> – Fachleute aus vielen Abteilungen ohne Versetzung, interdisziplinär, Synergien; Nachteil: „zwei Herren“, Konflikte Linie vs. Projekt → klare Regeln und Lenkungsausschuss. Realisierung: <b>reine PO</b> für das Vollzeit-Kernteam – volle Weisungsbefugnis der PL, kurze Wege, Fokus aufs Ziel; Nachteil: Rückführung der Mitarbeitenden nach Projektende planen. (Entspricht dem Folienvorschlag „Wechsel der Projektorganisation“.)</p><p><b>c)</b> z. B. <b>Lenkungsausschuss</b> (Entscheidungsgremium: Geschäftsführung + Bereichsleiter:innen, Budget/Phasenfreigaben), <b>Anwenderkreis/Key-User-Gruppe</b> (Beratungsgremium: Anforderungen priorisieren), <b>Change Control Board</b> (Steuerungsgremium: Änderungsanträge zu Meilensteinen), <b>Planungsteam</b> (Planungsgremium), <b>User Club</b> (Kommunikationsgremium, Austausch mit anderen ERP-Anwendern).</p>" },
    { id: "pmxr10", topic: "pmx-verk", title: "Steuerung über das magische Dreieck (Fall)", pts: 8,
      html: "<p>Das Webshop-Projekt liegt laut Netzplan 3 Wochen hinter dem Plan; der Go-live-Termin ist wegen einer Werbekampagne fix. Das Budget kann um 10 % erhöht werden, erfahrene Entwickler:innen sind am Markt aber kaum verfügbar.</p><p>a) Welche Planungsausrichtung liegt vor?<br>b) Beurteile ressourcengesteuerte, zeitgesteuerte und funktionalitätsgesteuerte Maßnahmen für diesen Fall.<br>c) Welche Vorgänge nimmst du dir zuerst vor, und mit welchen konkreten Maßnahmen?</p>",
      solution: "<p><b>a)</b> <b>Terminfixiert</b> (Termin fix; Kosten variabel, Leistung als Stellschraube).</p><p><b>b)</b> <b>Ressourcengesteuert</b>: mehr Budget vorhanden, aber Ressourcen beengt (kaum Fachkräfte) → nur begrenzt wirksam (Überstunden, externe Dienstleister, bessere Werkzeuge; Einarbeitung kostet Zeit). <b>Zeitgesteuert</b>: scheidet aus, Termin ist fix. <b>Funktionalitätsgesteuert</b>: am wirksamsten – Funktionen mit geringer Priorität in ein späteres Release verschieben (MVP zum Kampagnenstart).</p><p><b>c)</b> Die <b>kritischen Vorgänge</b> (GP = 0) der Restlaufzeit; davon jene mit großer Dauer, geringen Verkürzungskosten und aufteilbarer Arbeit. Maßnahmen: Scope reduzieren, Test überlappend zur Entwicklung starten (Fast Tracking), Teilaufgaben fremdvergeben, Überstunden zeitlich begrenzt. Danach Netzplan neu rechnen – prüfen, ob ein anderer Pfad kritisch wird.</p>" }
  ]
};
})();
