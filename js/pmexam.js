/* StudyOS · Projektmanagement (GL-PMGT): Prüfungssimulator und Netzplan-Lernwidget
   Die Prüfung ist der Netzplan (Prüfungsbeispiel 1, 2. Termin 10.03.2023): ein vorgegebener Netzplan mit Kästchen
   (Name, Nr., Dauer, Frühester Anfang, Freie Pufferzeit, Frühestes Ende, Spätester Anfang, Gesamte Pufferzeit, Spätestes Ende),
   die man selbst ausfüllt, dann Fragen, die man aus dem Netzplan ableitet. Dazu kritischer Pfad aus der Angabe und Bonusfragen.
   Jeder Versuch hat einen eigenen Seed (neue Dauern, neues Startdatum); "Original" nimmt die echten Dauern vom 10.03.2023.
   Kalendertage wie in der Prüfung: FEZ = FAZ + D − 1, der Nachfolger beginnt am Tag danach. ZE: Zeitpunktzählung ab 0.
   Widget "netzplan" (Block { t: "widget", w: "netzplan", net: "orig" | "small" }): Netzplan Schritt für Schritt animiert.
   Start der Prüfung: go("exam", "pmexam"). Laufender Versuch in S().pmexam.run. */
(function () {
const { $, $$, esc, PAGES, CBY } = App;
const W = App.W = App.W || {};
const S = () => App.S();
const LET = i => String.fromCharCode(97 + i);
const fmtP = v => (Math.round(v * 100) / 100).toString().replace(".", ",");
const de = (v, d = 2) => (Math.round(v * 10 ** d) / 10 ** d).toLocaleString("de-AT", { maximumFractionDigits: d });
const TW = h => `<div class="alt-tw">${h}</div>`;
const LIMIT = 100, MINUTES = 90;

/* ---------- Zufall ---------- */
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const mk = r => ({ r, int: (a, b) => a + Math.floor(r() * (b - a + 1)), pick: arr => arr[Math.floor(r() * arr.length)],
  shuffle: arr => { const x = arr.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; } });

/* ---------- Netzplan-Rechnung ---------- */
function cpm(nodes, cal) {
  const o = cal ? 1 : 0, n = nodes.length, succ = nodes.map(() => []);
  nodes.forEach((v, i) => v.pre.forEach(p => succ[p].push(i)));
  const R = nodes.map(() => ({}));
  nodes.forEach((v, i) => { const r = R[i]; r.FAZ = v.pre.length ? Math.max(...v.pre.map(p => R[p].FEZ)) + o : o; r.FEZ = r.FAZ + v.d - o; });
  const PE = Math.max(...R.map(r => r.FEZ));
  for (let i = n - 1; i >= 0; i--) { const r = R[i]; r.SEZ = succ[i].length ? Math.min(...succ[i].map(s => R[s].SAZ)) - o : PE; r.SAZ = r.SEZ - nodes[i].d + o; }
  R.forEach((r, i) => { r.GP = r.SAZ - r.FAZ; r.FP = succ[i].length ? Math.min(...succ[i].map(s => R[s].FAZ)) - r.FEZ - o : PE - r.FEZ; r.krit = r.GP === 0; });
  return { R, PE, succ };
}

/* ---------- Netzplan-Vorlagen ----------
   v: [Name, min, max, Vorgänger, Originaldauer]. pos: Lage der Kästchen wie auf dem Prüfungsblatt [Spalte, Zeile]. ms: Musterlösung Meilensteine. */
const NETS = [
  { id: "prod", name: "Produkteinführung", w: 3, start: [2023, 3, 3],
    intro: "Ein Unternehmen bringt ein neues Produkt auf den Markt. Netzplan aus dem Prüfungsbeispiel 1 vom 10.03.2023.",
    v: [["Konzeptkonferenz", 1, 2, [], 1], ["Vorstudie technische Details", 10, 22, [1], 20], ["Bauteilsuche", 2, 6, [2], 3], ["Marktuntersuchung", 5, 12, [1], 8], ["Wettbewerbsanalyse", 3, 9, [1], 5],
      ["Erstellung Pflichtenheft", 2, 5, [4, 5], 2], ["Konferenz der Design Spezifikation", 1, 2, [3, 6], 1], ["Entwurf Verkaufsstrategie", 4, 10, [7], 8], ["Entwurf Werbung", 4, 10, [8], 8], ["Verkäuferschulung", 2, 5, [8], 2],
      ["Start Werbung", 4, 10, [9], 8], ["Entwurf Graphikdesign", 2, 6, [7], 3], ["Erstellung Handbuch", 3, 8, [12], 6], ["Konstruktion Verpackung", 2, 6, [12], 2], ["Entwurf Prospekt", 2, 5, [13], 3],
      ["Fertigstellung und Druck Prospekt", 6, 12, [14, 15], 10], ["Entwicklung Produkt", 10, 20, [7], 15], ["Qualitätssicherung", 4, 10, [17], 8], ["Dokumentation der Entwicklung", 10, 22, [17], 20], ["Druck Dokumentation", 4, 10, [19], 8],
      ["Arbeitsvorbereitung", 1, 3, [18, 20], 1], ["Beginn der Produktion", 2, 4, [10, 11, 16, 21], 3]],
    pos: [[0, 0], [1, 0], [2, 0], [1, 2], [1, 3], [2, 2], [3, 0], [4, 0], [5, 0], [5, 1], [6, 0], [4, 4], [5, 4], [5, 5], [6, 4], [7, 5], [4, 2], [5, 2], [5, 3], [6, 3], [7, 2], [8, 1]],
    ms: "z. B. nach <b>Nr. 6 Pflichtenheft</b> bzw. <b>Nr. 7 Konferenz der Design-Spezifikation</b> (Konzept abgeschlossen, alle Zweige der Vorstudie laufen zusammen, Entscheidung über die Entwicklung), nach <b>Nr. 18/20</b> (Produkt geprüft, Dokumentation gedruckt) bzw. <b>Nr. 21 Arbeitsvorbereitung</b>, und <b>Nr. 22 Beginn der Produktion</b> als Projektziel. Dort laufen Prozesszweige zusammen, und es liegt ein prüfbares Ergebnis vor." },
  { id: "wws", name: "Einführung eines Warenwirtschaftssystems", w: 1, intro: "Ein Handelsunternehmen führt ein neues Warenwirtschaftssystem ein.", v: [
    ["Kick-off", 1, 2, []], ["Ist-Analyse", 4, 10, [1]], ["Anforderungen erheben", 5, 12, [2]], ["Marktanalyse Anbieter", 3, 8, [1]], ["Pflichtenheft", 3, 6, [3]],
    ["Ausschreibung & Auswahl", 5, 12, [4, 5]], ["Hardware beschaffen", 4, 14, [6]], ["Customizing", 8, 18, [6]], ["Schnittstellen entwickeln", 6, 16, [6]], ["Datenmigration", 3, 9, [8]],
    ["Schulungskonzept", 2, 6, [6]], ["Anwenderschulung", 3, 8, [11]], ["Integrationstest", 3, 8, [7, 8, 9, 10]], ["Go-live", 1, 2, [12, 13]]],
    ms: "z. B. <b>Nr. 5 Pflichtenheft abgenommen</b>, <b>Nr. 6 Anbieter ausgewählt</b> (danach teilt sich das Projekt in Zweige), <b>Nr. 13 Integrationstest bestanden</b> (Zweige laufen zusammen) und <b>Nr. 14 Go-live</b>." },
  { id: "messe", name: "Messeauftritt", w: 1, intro: "Ein Start-up stellt zum ersten Mal auf einer Fachmesse aus.", v: [
    ["Messeanmeldung", 1, 3, []], ["Standkonzept", 3, 8, [1]], ["Standbau beauftragen", 2, 5, [2]], ["Exponate auswählen", 2, 6, [1]], ["Prototyp fertigstellen", 6, 15, [4]],
    ["Werbemittel gestalten", 3, 8, [2]], ["Werbemittel drucken", 3, 7, [6]], ["Personal einplanen", 1, 4, [1]], ["Standpersonal schulen", 2, 4, [8]], ["Standaufbau", 2, 4, [3]],
    ["Transport Exponate", 1, 3, [5, 10]], ["Messeeröffnung", 1, 1, [7, 9, 11]]],
    ms: "z. B. <b>Nr. 2 Standkonzept freigegeben</b>, <b>Nr. 5 Prototyp fertig</b>, <b>Nr. 10 Standaufbau abgenommen</b> und <b>Nr. 12 Messeeröffnung</b>." },
  { id: "rz", name: "Umzug des Rechenzentrums", w: 1, intro: "Ein Unternehmen zieht sein Rechenzentrum an einen neuen Standort um.", v: [
    ["Projektstart", 1, 1, []], ["Bestandsaufnahme Server", 3, 8, [1]], ["Raumplanung neuer Standort", 4, 10, [1]], ["Umzugskonzept", 3, 7, [2]], ["Elektro & Klima installieren", 6, 15, [3]],
    ["Netzwerk verkabeln", 4, 10, [3]], ["Neue Hardware bestellen", 5, 14, [4]], ["Testumgebung aufbauen", 3, 8, [5, 6, 7]], ["Migrationstest", 2, 6, [8]], ["Mitarbeitende informieren", 1, 3, [4]],
    ["Umzugswochenende vorbereiten", 2, 5, [9, 10]], ["Umzug durchführen", 2, 4, [11]], ["Abnahme & Übergabe", 1, 2, [12]]],
    ms: "z. B. <b>Nr. 4 Umzugskonzept freigegeben</b>, <b>Nr. 8 Testumgebung steht</b> (die Zweige Technik und Beschaffung laufen zusammen), <b>Nr. 9 Migrationstest bestanden</b> und <b>Nr. 13 Abnahme & Übergabe</b>." }
];
/* ---------- Fallbeispiele für Theorie ---------- */
const PSP = [
  { p: "Entwicklung einer Fitness-App", O: ["App-Oberfläche", "Server & Datenbank", "Hilfe & Handbuch"], P: ["Konzept", "Realisierung", "Test & Einführung"], F: ["Programmierung", "Test & Qualitätssicherung", "Dokumentation"],
    ap: [["Mockups der App-Screens entwerfen", 0, 0], ["App-Screens programmieren", 0, 1], ["Usability-Test der App mit Testpersonen", 0, 2], ["Datenbankschema entwerfen", 1, 0], ["REST-Schnittstelle implementieren", 1, 1], ["Lasttest des Servers", 1, 2], ["Gliederung des Hilfebereichs festlegen", 2, 0], ["Hilfetexte schreiben", 2, 1], ["Hilfe mit Testnutzer:innen prüfen und veröffentlichen", 2, 2]] },
  { p: "Entwicklung eines E-Bikes", O: ["Rahmen", "Antrieb & Akku", "Steuerungs-Software"], P: ["Entwurf", "Bau des Prototyps", "Erprobung"], F: ["Konstruktion", "Prüftechnik", "Dokumentation"],
    ap: [["Rahmengeometrie konstruieren", 0, 0], ["Prototyp-Rahmen schweißen", 0, 1], ["Bruchtest des Rahmens", 0, 2], ["Motor und Akku auswählen", 1, 0], ["Antrieb einbauen", 1, 1], ["Reichweitentest mit vollem Akku", 1, 2], ["Steuerlogik spezifizieren", 2, 0], ["Firmware programmieren", 2, 1], ["Firmware im Fahrversuch testen", 2, 2]] },
  { p: "Neue Firmen-Website mit Webshop", O: ["Webseite (Frontend)", "Shop & Datenbank", "Inhalte (Texte, Bilder)"], P: ["Analyse & Konzept", "Umsetzung", "Test & Livegang"], F: ["Design", "Programmierung", "Redaktion"],
    ap: [["Seitenstruktur und Navigation planen", 0, 0], ["Seitenvorlagen umsetzen", 0, 1], ["Darstellung auf Handy und Browsern testen", 0, 2], ["Produktdatenmodell festlegen", 1, 0], ["Warenkorb und Bezahlung einbinden", 1, 1], ["Testbestellungen durchführen", 1, 2], ["Redaktionsplan erstellen", 2, 0], ["Texte schreiben und Fotos machen", 2, 1], ["Korrekturlesen und freischalten", 2, 2]] }
];
const MS = [
  { p: "Eine Firma lässt eine Fitness-App entwickeln (Dauer ca. 6 Monate).", good: ["Pflichtenheft vom Auftraggeber abgenommen", "Klickbarer Prototyp der App präsentiert und freigegeben", "Alle Abnahmetests bestanden, Freigabe für den App-Store erteilt", "App im Store veröffentlicht"], bad: ["Das Team programmiert an der App", "Woche mit den meisten Besprechungen", "Die Entwickler:innen sind motiviert", "Laufende Fehlerbehebung"] },
  { p: "Ein Unternehmen zieht mit 80 Arbeitsplätzen in ein neues Bürogebäude (Dauer ca. 4 Monate).", good: ["Mietvertrag unterschrieben", "Raum- und Möblierungsplan von der Geschäftsführung freigegeben", "Netzwerk und Telefonie im neuen Gebäude abgenommen", "Alle Arbeitsplätze am neuen Standort betriebsbereit"], bad: ["Umzugskartons werden gepackt", "Die Mitarbeitenden freuen sich auf das neue Büro", "Regelmäßige Abstimmung mit dem Vermieter", "Möbel werden aufgebaut"] },
  { p: "Ein Handelsunternehmen führt ein neues CRM-System ein (Dauer ca. 8 Monate).", good: ["Anforderungskatalog vom Lenkungsausschuss abgenommen", "Anbieter ausgewählt und Vertrag unterschrieben", "Datenmigration getestet und vom Fachbereich freigegeben", "Go-live: alle Vertriebsmitarbeitenden arbeiten im neuen System"], bad: ["Das Projektteam testet laufend", "Die Projektleitung schreibt Statusberichte", "Gute Stimmung im Team", "Workshops mit dem Vertrieb laufen"] },
  { p: "Ein Verein organisiert ein Musikfestival mit 5.000 Gästen (Dauer ca. 9 Monate).", good: ["Veranstaltungsgenehmigung der Behörde liegt vor", "Line-up fixiert, alle Verträge mit den Bands unterschrieben", "Sicherheitskonzept von Polizei und Feuerwehr abgenommen", "Gelände aufgebaut und technisch abgenommen"], bad: ["Plakate werden aufgehängt", "Die Helfer:innen sind im Einsatz", "Viele Ideen gesammelt", "Es wird an der Bühne gearbeitet"] }
];
const DOKU = [
  ["Zur Projektdokumentation gehören alle Dokumente, die das Projektgeschehen beschreiben, z. B. Projektstrukturplan, Terminplan, Kostenplan, Fortschrittsberichte.", 1],
  ["Ohne vollständige, durchgängige und aktuelle Projektdokumentation kann das Projektmanagement nicht wirksam arbeiten.", 1],
  ["Einträge im Projekttagebuch dürfen nicht gelöscht werden.", 1],
  ["Das Projekttagebuch ist gebunden und für jeden Interessenten einsehbar.", 1],
  ["Eine Person ist für das Projekttagebuch zuständig, eintragen darf aber jede:r Projektmitarbeiter:in.", 1],
  ["Im Projekttagebuch werden auch Absprachen vermerkt, die in keinem formalen Dokument festgehalten sind.", 1],
  ["Ein Dokumentenschlüssel ist ein eindeutiges Identifikationskriterium für ein Dokument.", 1],
  ["Das Projekttagebuch muss in einer fest vorgeschriebenen Form geführt werden.", 0],
  ["Nur die Projektleitung darf in das Projekttagebuch eintragen.", 0],
  ["Einträge im Projekttagebuch werden zum Projektende gelöscht.", 0],
  ["Bei einer Auswahlordnung wird für jedes Projekt eine völlig neue Kapitelstruktur erfunden.", 0],
  ["Die Projektdokumentation wird erst nach dem Projektabschluss angelegt.", 0]
];
const KALK = [["Plan-Mengengerüst vor Projektbeginn, Grundlage für das Angebot", 0], ["Wird mehrmals durchlaufen, bis das Angebot steht", 0], ["Laufende Gegenüberstellung von Ist- und Planwerten während des Projekts", 1], ["Grundlage der Kostenkontrolle während der Durchführung", 1], ["Entspricht der letzten Mitkalkulation", 2], ["Projektkostenanalyse nach Projektende, liefert Erfahrungsdaten für künftige Schätzungen", 2]];
const F117T = ["Prozess", "Prozessabschnitt", "Prozessphase", "Prozessschritt", "Prozesszweig", "Meilenstein", "Baseline"];
const F117 = [["Oberste Ebene der Hierarchie: der gesamte Entwicklungsprozess", 0], ["Zweite Ebene der Hierarchie, direkt unter dem Prozess", 1], ["Dritte Ebene der Hierarchie, mit Phasenziel, Phasenergebnis und Phasenabschluss", 2], ["Unterste, feinste Ebene der Hierarchie", 3], ["Parallel durchgeführte Prozessphasen", 4], ["Zeitpunkt der Fertigstellung besonders wichtiger Tätigkeiten", 5], ["Besonders wichtige Ergebnisse der Arbeitspakete, die beim Erreichen des Meilensteins vorliegen", 6]];
const FGRAD = ["relativ", "absolut", "prozessbezogen"];
const FG = [["Es wird der prozentuelle Anteil der Aufgabenerfüllung erhoben.", 0], ["Es werden nur vollständig abgeschlossene Arbeitspakete gezählt.", 1], ["Es wird die Anzahl der erreichten und offiziell abgenommenen Meilensteine ermittelt.", 2], ["Anfällig für das „Fast-schon-fertig“-Syndrom.", 0], ["Setzt voraus, dass die Arbeitspakete hinreichend klein sind.", 1], ["Setzt voraus, dass hinreichend viele Meilensteine definiert wurden.", 2]];

/* Freitext: Musterantwort + Kernpunkte (k = Suchbegriffe für das automatische Vorab-Abhaken) */
const kp = (t, ...k) => ({ t, k });
const THEO = [
  { topic: "pmg-netz", q: "Wie nennt man die Methode der Netzplantechnik noch, und welche Werte trägt man in einen Vorgangsknoten ein?", need: 4,
    model: "<b>Critical Path Method (CPM)</b>, Methode des kritischen Pfades. Im Vorgangsknoten stehen Nr. und Name des Vorgangs, die <b>Dauer</b>, <b>frühester Anfang und frühestes Ende</b>, <b>spätester Anfang und spätestes Ende</b> sowie <b>Gesamtpuffer und freier Puffer</b>.",
    kp: [kp("Critical Path Method / Methode des kritischen Pfades", "critical", "cpm", "kritisch"), kp("Dauer des Vorgangs", "dauer"), kp("Frühester Anfang und frühestes Ende", "früh", "fruh", "faz", "fez", "fat", "fet"), kp("Spätester Anfang und spätestes Ende", "spät", "spat", "saz", "sez", "sat", "set"), kp("Gesamtpuffer und freier Puffer", "puffer", "gp", "fp")] },
  { topic: "pmg-netz", q: "Wann ist ein Vorgang kritisch? Wie berechnet man Gesamtpufferzeit und freie Pufferzeit, und was bedeuten sie?", need: 4,
    model: "Ein Vorgang ist <b>kritisch</b>, wenn er <b>keine Pufferzeit</b> hat (GP = 0), er liegt auf dem kritischen Pfad. <b>GP = SAZ − FAZ</b> (= SEZ − FEZ): so weit kann der Vorgang verschoben werden, ohne das <b>Projektende</b> zu verschieben. <b>FP = FAZ des Nachfolgers − FEZ</b> (bei Kalendertagen − 1): so weit kann er verschoben werden, ohne dass sich der <b>Nachfolger</b> verschiebt.",
    kp: [kp("Kritisch = keine Pufferzeit (GP = 0)", "kein puffer", "keine puffer", "ohne puffer", "gp = 0", "gp=0", "null"), kp("GP = SAZ − FAZ (bzw. SEZ − FEZ)", "saz", "sat", "spätester anfang", "sez"), kp("GP: Verschiebung ohne Einfluss auf das Projektende", "projektende", "ende des projekt", "endtermin"), kp("FP = FAZ Nachfolger − FEZ", "nachfolger"), kp("FP: Verschiebung, ohne dass der Nachfolger später beginnt", "nachfolg")] },
  { topic: "pmg-proj", q: "Was ist ein Programm, was ist ein Projektportfolio?", need: 3,
    model: "<b>Programm</b>: eine Reihe <b>zusammenhängender Projekte</b>, die gemeinsam eine <b>übergeordnete Zielsetzung</b> verwirklichen. <b>Projektportfolio</b>: <b>alle Projekte</b> eines Unternehmens oder eines Geschäftsbereichs.",
    kp: [kp("Programm: mehrere zusammenhängende Projekte", "mehrere", "zusammenhäng", "reihe"), kp("Programm: gemeinsames übergeordnetes Ziel", "übergeordnet", "uebergeordnet", "gemeinsam"), kp("Portfolio: alle Projekte eines Unternehmens oder Bereichs", "alle projekte", "unternehmen", "bereich")] },
  { topic: "pmg-pm", q: "Was versteht man unter dem magischen Dreieck des Projektmanagements?", need: 3,
    model: "Die drei Kernziele <b>Leistung/Qualität</b>, <b>Termine/Zeit</b> und <b>Kosten</b> hängen voneinander ab: Ändert man eines (z. B. mehr Qualität), sind die anderen betroffen (mehr Zeit und/oder Kosten).",
    kp: [kp("Leistung bzw. Qualität", "leistung", "qualität", "qualitat", "umfang"), kp("Termine bzw. Zeit", "termin", "zeit", "dauer"), kp("Kosten", "kosten", "budget"), kp("Die Ziele beeinflussen sich gegenseitig", "abhäng", "abhang", "beeinfluss", "gegenseitig", "wirkt sich")] },
  { topic: "pmg-ziel", q: "Definieren Sie kostenfixierte, terminfixierte und leistungsfixierte Projektplanung.", need: 3,
    model: "<b>Kostenfixiert</b>: das Budget ist fest, daraus wird der Fertigstellungstermin ermittelt (z. B. Marktpreis vom Wettbewerb vorgegeben). <b>Terminfixiert</b>: Leistung und Fertigstellungstermin sind fest, daraus werden die Kosten ermittelt (z. B. Messe). <b>Leistungsfixiert</b>: Leistung und Qualität stehen fest, daraus werden Kosten und Termine ermittelt (z. B. Sicherheitstechnik, Kraftwerksbau, Raumfahrt).",
    kp: [kp("Kostenfixiert: Budget fest → Termin wird ermittelt", "budget", "kosten"), kp("Terminfixiert: Termin fest → Kosten werden ermittelt", "termin"), kp("Leistungsfixiert: Leistung/Qualität fest → Kosten und Termine", "leistung", "qualität", "qualitat"), kp("Passendes Beispiel genannt", "messe", "raumfahrt", "kraftwerk", "sicherheit", "wettbewerb", "beispiel", "z. b", "z.b")] },
  { topic: "pmg-org", q: "Welche fünf Projektorganisationsformen gibt es?", need: 5,
    model: "<b>Reine Projektorganisation</b>, <b>Einfluss-Projektorganisation</b>, <b>Matrix-Projektorganisation</b>, <b>Auftrags-Projektorganisation</b> und <b>Projektmanagement in der Linie</b>.",
    kp: [kp("Reine Projektorganisation", "rein"), kp("Einfluss-Projektorganisation", "einfluss", "stab"), kp("Matrix-Projektorganisation", "matrix"), kp("Auftrags-Projektorganisation", "auftrag"), kp("Projektmanagement in der Linie", "linie")] },
  { topic: "pmg-rollen", q: "Welche Projektgremien gibt es typischerweise?", need: 4,
    model: "<b>Planungsgremium</b> (Projektplanung, häufige Treffen), <b>Steuerungsgremium</b> (fachliche Steuerung, trifft sich zu Meilensteinen), <b>Entscheidungsgremium</b> (strategische Entscheidungen, selten, am Ende wesentlicher Phasen), <b>Kommunikationsgremium</b> (projektübergreifender Erfahrungsaustausch), <b>Beratungsgremium</b> (benennt und priorisiert fachliche Anforderungen).",
    kp: [kp("Planungsgremium", "planung"), kp("Steuerungsgremium", "steuer"), kp("Entscheidungsgremium (z. B. Lenkungsausschuss)", "entscheid", "lenkung"), kp("Kommunikationsgremium", "kommunikation"), kp("Beratungsgremium", "berat")] }
];

function solSmall(sm, sr, L) {
  return TW(`<table class="dt alt-tab alt-narrow"><tr><th></th><th>FAZ</th><th>FEZ</th><th>SAZ</th><th>SEZ</th><th>GP</th></tr>${sm.map((v, i) => { const r = sr.R[i]; return `<tr${r.krit ? ' class="px-crit"' : ""}><td><b>${L(i)}</b></td><td>${r.FAZ}</td><td>${r.FEZ}</td><td>${r.SAZ}</td><td>${r.SEZ}</td><td>${r.GP}</td></tr>`; }).join("")}</table>`);
}
function pspTree(ps, type) {
  const root = `<div class="px-psp-root">${ps.p}</div>`;
  const kids = type === 3 ? ps.P.map(p => `<div class="px-psp-n">${p}<div class="px-psp-sub">${ps.O.map(o => `<span>${o}</span>`).join("")}</div></div>`).join("")
    : (type === 0 ? ps.O : type === 1 ? ps.F : ps.P).map(x => `<div class="px-psp-n">${x}</div>`).join("");
  return `<div class="px-psp">${root}<div class="px-psp-l2">${kids}</div></div>`;
}


/* ---------- Netzplan bauen ---------- */
function makeNet(R, tpl, opt) {
  const orig = !!opt.orig && tpl.v[0][4] != null;
  const cal = opt.cal === "1" ? true : opt.cal === "0" ? false : orig ? true : R.r() < 0.6;
  let nodes, res;
  for (let tries = 0; tries < 200; tries++) {
    nodes = tpl.v.map(([name, a, b, pre, o]) => ({ name, d: orig ? o : R.int(a, b), pre: pre.map(p => p - 1) }));
    res = cpm(nodes, cal);
    if (orig) break;
    const crit = nodes.map((_, i) => i).filter(i => res.R[i].krit), dmax = Math.max(...crit.map(i => nodes[i].d));
    if (crit.filter(i => nodes[i].d === dmax).length === 1 && res.R.filter(r => r.GP >= 2).length >= 2) break;
  }
  const sd = orig && tpl.start ? tpl.start : [2027, R.int(2, 9), R.int(1, 28)];
  const start = new Date(Date.UTC(sd[0], sd[1], sd[2]));
  const day = k => new Date(start.getTime() + (k - 1) * 864e5);
  const fd = k => { const d = day(k); return `${d.getUTCDate()}.${d.getUTCMonth() + 1}.`; };
  return { nodes, res, cal, orig, tpl, fd, fmt: k => cal ? fd(k) : String(k), year: start.getUTCFullYear(), unit: cal ? "Tage" : "ZE" };
}
const FIELDS = [["FAZ", "Frühester Anfang"], ["FP", "Freie Pufferzeit"], ["FEZ", "Frühestes Ende"], ["SAZ", "Spätester Anfang"], ["GP", "Gesamte Pufferzeit"], ["SEZ", "Spätestes Ende"]];
const isDateF = f => f !== "GP" && f !== "FP";
const fval = (net, i, f) => { const v = net.res.R[i][f]; return isDateF(f) ? net.fmt(v) : String(v); };

/* ---------- Netzplan als Prüfungsblatt ---------- */
const BW = 236, BH = 142, GX = 72, GY = 40;
function layout(net) {
  const { nodes, res, tpl } = net, n = nodes.length;
  let P;
  if (tpl.pos && tpl.pos.length === n) P = tpl.pos.map(([c, r]) => ({ c, r }));
  else {
    const lvl = [];
    nodes.forEach((v, i) => lvl[i] = v.pre.length ? Math.max(...v.pre.map(p => lvl[p])) + 1 : 0);
    for (let i = n - 1; i >= 0; i--) if (res.succ[i].length) lvl[i] = Math.max(lvl[i], Math.min(...res.succ[i].map(j => lvl[j])) - 1);
    const cols = []; nodes.forEach((v, i) => (cols[lvl[i]] = cols[lvl[i]] || []).push(i));
    P = [];
    cols.forEach((c, x) => { if (x) c.sort((a, b) => avg(nodes[a].pre.map(p => P[p].r)) - avg(nodes[b].pre.map(p => P[p].r))); c.forEach((i, k) => P[i] = { c: x, r: k }); });
    const mr = Math.max(...cols.map(c => c.length)); cols.forEach(c => { const off = Math.floor((mr - c.length) / 2); c.forEach(i => P[i].r += off); });
  }
  const pos = P.map(p => ({ x: 16 + p.c * (BW + GX), y: 16 + p.r * (BH + GY) }));
  return { pos, w: 32 + Math.max(...P.map(p => p.c)) * (BW + GX) + BW, h: 32 + Math.max(...P.map(p => p.r)) * (BH + GY) + BH };
}
const avg = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
/* o: { mode: "input" | "review" | "show", id, ans, shown: Set("i:F") | null = alle, anim: Set, cur: Knoten, rel: Set, crit } */
function sheet(net, o = {}) {
  const { nodes, res } = net, L = layout(net), R = res.R, o1 = net.cal ? 1 : 0;
  const isC = (i, j) => o.crit && R[i].krit && R[j].krit && R[j].FAZ === R[i].FEZ + o1;
  let svg = `<svg class="np-svg" width="${L.w}" height="${L.h}" viewBox="0 0 ${L.w} ${L.h}" aria-hidden="true"><defs><marker id="npa" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L8,4 L0,8 z" class="np-ah"/></marker><marker id="npac" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L8,4 L0,8 z" class="np-ahc"/></marker></defs>`;
  const edges = [];
  nodes.forEach((nd, j) => nd.pre.forEach(i => edges.push([i, j])));
  edges.sort((a, b) => isC(...a) - isC(...b)).forEach(([i, j]) => {
    const a = L.pos[i], b = L.pos[j], x1 = a.x + BW, y1 = a.y + BH / 2, x2 = b.x, y2 = b.y + BH / 2, xm = x2 - GX / 2;
    const c = isC(i, j), h = o.cur != null && ((j === o.cur && o.rel && o.rel.has(i)) || (i === o.cur && o.rel && o.rel.has(j)));
    svg += `<path d="M${x1},${y1} H${xm} V${y2} H${x2 - 2}" class="np-e${c ? " c" : ""}${h ? " h" : ""}" marker-end="url(#${c ? "npac" : "npa"})"/>`;
  });
  svg += "</svg>";
  const A = o.ans || {};
  const boxes = nodes.map((nd, i) => {
    const p = L.pos[i], cls = ["np-box"]; if (o.crit && R[i].krit) cls.push("c"); if (o.cur === i) cls.push("cur"); if (o.rel && o.rel.has(i)) cls.push("rel");
    const cell = f => {
      const key = i + ":" + f[0], lab = `<span class="np-l">${f[1]}:</span>`;
      if (o.mode === "input" || o.mode === "review") {
        const raw = A[key], ok = o.mode === "review" && cellOK(net, i, f[0], raw);
        return `<label class="np-f">${lab}<input type="text" class="np-in${o.mode === "review" ? (ok ? " ok" : " no") : ""}" data-id="${o.id}" data-c="${key}" value="${esc(raw || "")}" inputmode="${isDateF(f[0]) && net.cal ? "text" : "numeric"}" autocomplete="off" aria-label="Nr. ${i + 1} ${f[1]}"${o.mode === "review" ? " disabled" : ""}>${o.mode === "review" && !ok ? `<small class="np-sol">${fval(net, i, f[0])}</small>` : ""}</label>`;
      }
      const show = !o.shown || o.shown.has(key);
      return `<div class="np-f">${lab}<span class="np-v${o.anim && o.anim.has(key) ? " np-new" : ""}">${show ? fval(net, i, f[0]) : ""}</span></div>`;
    };
    return `<div class="${cls.join(" ")}" style="left:${p.x}px;top:${p.y}px;width:${BW}px;height:${BH}px" data-n="${i}"><div class="np-name">Name: ${esc(nd.name)}</div><div class="np-nd"><span>Nr.: ${i + 1}</span><span>Dauer: ${nd.d} ${net.cal ? (nd.d === 1 ? "Tag" : "Tage") : "ZE"}</span></div><div class="np-g">${FIELDS.map(cell).join("")}</div></div>`;
  }).join("");
  return `<div class="np-wrap"><div class="np-tools"><button class="btn ghost sm" data-npz="-1" aria-label="Verkleinern">−</button><button class="btn ghost sm" data-npz="1" aria-label="Vergrößern">+</button><small class="muted">${net.cal ? `Kalendertage · Start ${net.fd(1)}${net.year}` : "Zeiteinheiten · Start 0"}</small></div><div class="np-scroll"><div class="np-canvas" style="width:${L.w}px;height:${L.h}px">${svg}${boxes}</div></div></div>`;
}
document.addEventListener("click", e => { const b = e.target.closest("[data-npz]"); if (!b) return; const c = b.closest(".np-wrap").querySelector(".np-canvas"); const z = Math.min(1.4, Math.max(0.4, (+c.dataset.z || 1) + 0.15 * +b.dataset.npz)); c.dataset.z = z; c.style.zoom = z; });
const scrollTo = (wrap, net, i) => { const sc = wrap && wrap.querySelector(".np-scroll"); if (!sc) return; const p = layout(net).pos[i], z = +(sc.querySelector(".np-canvas").dataset.z || 1); sc.scrollTo({ left: Math.max(0, (p.x + BW / 2) * z - sc.clientWidth / 2), top: Math.max(0, (p.y + BH / 2) * z - sc.clientHeight / 2), behavior: "smooth" }); };

/* ---------- Bewertung von Netzplan-Feldern ---------- */
const norm = s => { let t = String(s == null ? "" : s).trim().replace(/\s+/g, "").replace(/[a-zäöü%]+$/i, ""); if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, ""); return t.replace(",", "."); };
function okNum(it, raw, a = it.a) { const t = norm(raw); if (t === "" || isNaN(+t)) return false; const tol = it.tol != null ? it.tol : Math.max(0.011, Math.abs(a) * 0.002); return Math.abs(+t - a) <= tol + 1e-9; }
function okDate(net, raw, k) { const m = String(raw || "").trim().match(/^(\d{1,2})\s*\.\s*(\d{1,2})\s*\.?\s*(\d{2,4})?$/); if (!m) return false; const want = net.fmt(k).split("."); return +m[1] === +want[0] && +m[2] === +want[1]; }
function cellOK(net, i, f, raw) { const v = net.res.R[i][f]; return isDateF(f) && net.cal ? okDate(net, raw, v) : okNum({ tol: 0 }, raw, v); }

/* ---------- Generator ---------- */
const NAMES = ["Anna", "Ben", "Clara", "David", "Eva", "Felix", "Greta", "Hannes", "Ida", "Jakob", "Lena", "Moritz"];
const LEVEL = [["Praktikant:in, 1. Projekt", 1], ["Junior, 2 Jahre Erfahrung", 2], ["Senior, 8 Jahre Erfahrung", 4], ["Expert:in, 15 Jahre, hat 3 ähnliche Projekte geleitet", 5], ["Fachkraft, 5 Jahre Erfahrung", 3]];
const PHASES = ["Analyse", "Entwurf", "Realisierung", "Test", "Einführung"];
const SMALL = ["Anforderungen klären", "Design", "Backend", "Frontend", "Testdaten", "Integration", "Schulung", "Abnahme"];
const pickTpl = R => { const tot = NETS.reduce((s, t) => s + t.w, 0); let x = R.r() * tot; return NETS.find(t => (x -= t.w) < 0) || NETS[0]; };
function anc(net) { const n = net.nodes.length, up = net.nodes.map(() => new Set()); net.nodes.forEach((v, i) => v.pre.forEach(p => { up[i].add(p); up[p].forEach(x => up[i].add(x)); })); return up; }

function gen(seed, opt = {}) {
  const R = mk(rng(seed)), A = [];
  const tpl = opt.orig ? NETS[0] : pickTpl(R), net = makeNet(R, tpl, opt);
  const { nodes, res, cal, fmt, fd, unit } = net, N = res.R, PE = res.PE, idx = nodes.map((_, i) => i), last = nodes.length - 1;
  const crit = idx.filter(i => N[i].krit), non = idx.filter(i => !N[i].krit && N[i].GP >= 1);
  const dmax = Math.max(...crit.map(i => nodes[i].d)), longC = crit.find(i => nodes[i].d === dmax);
  const lab = i => `Nr. ${i + 1} „${esc(nodes[i].name)}“`;
  const T = k => cal ? (k === 1 ? "Tag" : "Tage") : "ZE";

  /* Teil 1: das Prüfungsblatt */
  A.push({ title: "Netzplan berechnen", topic: "pmg-netz", net,
    intro: `<p>${esc(tpl.intro)} ${net.orig ? "Die Dauern sind die <b>Originalwerte aus der Prüfung</b>." : "Die Dauern sind für diesen Versuch neu ausgelost."} ${cal ? `Projektstart ist am <b>${fd(1)}${net.year}</b>. Gerechnet wird in <b>Kalendertagen</b> wie in der Übung: jeder Tag zählt, Wochenenden und Feiertage müssen Sie nicht berücksichtigen. Ein Vorgang mit 1 Tag Dauer beginnt und endet am selben Tag, sein Nachfolger beginnt am Tag danach.` : `Gerechnet wird in <b>abstrakten Zeiteinheiten (ZE)</b>. Das Projekt beginnt zum Zeitpunkt <b>0</b>; ein Nachfolger beginnt zum Zeitpunkt des frühesten Endes seines Vorgängers.`}</p><p><b>Füllen Sie alle Felder im Netzplan aus.</b>${cal ? " Termine als Datum (z. B. 24.4), Pufferzeiten in Tagen." : ""}</p>`,
    items: [{ id: "1a", t: "sheet", pts: 50, topic: "pmg-netz" }] });

  /* Teil 2: Fragen zum Netzplan */
  const xS = R.pick(non), nonD = non.filter(i => i !== xS), xD = R.pick(nonD.length ? nonD : non), kD = R.int(1, N[xD].GP + 4);
  const gpMax = Math.max(...non.map(i => N[i].GP)), bigG = R.pick(non.filter(i => N[i].GP === gpMax));
  const gOpts = R.shuffle([bigG, ...R.shuffle(non.filter(i => N[i].GP < gpMax)).slice(0, 2), R.pick(crit)]);
  const longN = idx.filter(i => !N[i].krit).reduce((b, i) => b < 0 || nodes[i].d > nodes[b].d ? i : b, -1);
  const shortC = crit.filter(i => nodes[i].d < dmax);
  const vOpts = R.shuffle([...new Set([longC, longN, R.pick(shortC.length ? shortC : crit), R.pick(non)].filter(i => i >= 0))]);
  const up = anc(net), par = i => idx.filter(j => j !== i && !up[i].has(j) && !up[j].has(i));
  const cand = idx.filter(i => { const p = par(i).length; return p >= 2 && p <= 9; }), xP = cand.length ? R.pick(cand) : R.pick(idx), parX = par(xP);
  A.push({ title: "Fragen zum Netzplan", topic: "pmg-netz", intro: "<p>Beantworten Sie die Fragen mit Hilfe Ihres berechneten Netzplans (Aufgabe 1).</p>", items: [
    { id: "2a", t: "pick", pts: 6, topic: "pmg-netz", q: "Welche Vorgänge liegen auf dem kritischen Pfad? Markieren Sie alle kritischen Vorgänge.", opts: idx.map(i => String(i + 1)), a: crit,
      why: `Kritisch ist jeder Vorgang ohne Pufferzeit (GP = 0): <b>${crit.map(i => i + 1).join(" → ")}</b>. Diese Kette bestimmt die Projektdauer.` },
    { id: "2b", t: "num", pts: 3, topic: "pmg-netz", q: `Wie lange dauert das Projekt (in ${unit})?`, a: PE, unit,
      why: cal ? `Vom ${fd(1)} bis ${fd(PE)} sind es <b>${PE} Tage</b> (der Starttag zählt mit).` : `Das größte frühe Ende ist <b>${PE} ZE</b>.` },
    cal ? { id: "2c", t: "date", pts: 3, topic: "pmg-netz", q: "An welchem Tag endet das Projekt?", a: PE, why: `Frühestes Ende des letzten Vorgangs ${lab(last)}: <b>${fd(PE)}</b>.` }
        : { id: "2c", t: "num", pts: 3, topic: "pmg-netz", q: `Wann beginnt der letzte Vorgang ${lab(last)} frühestens?`, a: N[last].FAZ, unit: "ZE", why: `Größtes FEZ seiner Vorgänger: <b>${N[last].FAZ}</b>.` },
    { id: "2d", t: cal ? "date" : "num", pts: 3, topic: "pmg-netz", q: `Wann muss ${lab(xS)} spätestens beginnen, damit sich das Projektende nicht verschiebt?`, a: N[xS].SAZ, unit: "ZE",
      why: `Spätester Anfang: <b>${fmt(N[xS].SAZ)}</b> (frühester Anfang ${fmt(N[xS].FAZ)} plus Gesamtpuffer ${N[xS].GP}).` },
    { id: "2e", t: "num", pts: 4, topic: "pmg-netz", q: `${lab(xD)} verzögert sich um ${kD} ${T(kD)}. Um wie viele ${unit} verschiebt sich das Projektende? (0, wenn gar nicht)`, a: Math.max(0, kD - N[xD].GP), unit,
      why: `Der Vorgang hat ${N[xD].GP} ${T(N[xD].GP)} Gesamtpuffer. ${kD <= N[xD].GP ? `Die Verzögerung wird vom Puffer aufgefangen: <b>0</b>.` : `Der Puffer fängt ${N[xD].GP} auf, das Projektende verschiebt sich um ${kD} − ${N[xD].GP} = <b>${kD - N[xD].GP}</b>.`}${kD > N[xD].FP ? ` Der Nachfolger muss später beginnen, weil der freie Puffer nur ${N[xD].FP} ist.` : " Auch der Nachfolger ist nicht betroffen (freier Puffer reicht)."}` },
    { id: "2f", t: "one", pts: 3, topic: "pmg-netz", q: "Wo gibt es Pufferzeiten? Welcher dieser Vorgänge hat den größten Gesamtpuffer?", opts: gOpts.map(lab), a: gOpts.indexOf(bigG),
      why: `${lab(bigG)} hat ${gpMax} ${T(gpMax)} Gesamtpuffer. Puffer haben alle Vorgänge abseits des kritischen Pfades: ${idx.filter(i => !N[i].krit).map(i => `${i + 1} (${N[i].GP})`).join(", ")}.` },
    { id: "2g", t: "one", pts: 3, topic: "pmg-netz", q: "Die Projektdauer soll verkürzt werden. Welchen Vorgang schauen Sie sich zuerst an?", opts: vOpts.map(i => `${lab(i)}, ${nodes[i].d} ${T(nodes[i].d)}`), a: vOpts.indexOf(longC),
      why: `Nur <b>kritische</b> Vorgänge verkürzen das Projekt; ein Vorgang mit Puffer bringt nichts, auch wenn er lang ist. Unter den kritischen nimmt man den, der <b>am längsten dauert</b>: ${lab(longC)} mit ${dmax} ${T(dmax)}.${crit.filter(i => nodes[i].d === dmax).length > 1 ? ` (Gleich lang ist auch ${crit.filter(i => i !== longC && nodes[i].d === dmax).map(lab).join(", ")}.)` : ""} Wird er stark verkürzt, kann ein anderer Pfad kritisch werden.` },
    { id: "2h", t: "text", pts: 4, topic: "pmg-netz", need: 4, q: "Mit welchen Maßnahmen verkürzen Sie diesen Vorgang? Worauf müssen Sie danach achten?",
      model: "<b>Ressourcen erhöhen</b>: mehr Personal, Überstunden, leistungsfähigere Maschinen, externe Hilfe. <b>Parallelisieren</b>: Arbeiten, die nacheinander laufen, gleichzeitig durchführen. <b>Engpässe beseitigen</b>, z. B. frühere Materiallieferung. <b>Umfang reduzieren</b>, wenn das Ergebnis trotzdem reicht. Danach den Netzplan <b>neu rechnen</b>: der kritische Pfad kann sich ändern.",
      kp: [kp("Mehr Personal / Ressourcen / externe Hilfe", "personal", "ressourc", "mitarbeit", "extern", "leute"), kp("Überstunden", "überstund", "uberstund", "mehrarbeit"), kp("Parallelisieren", "parallel", "gleichzeitig"), kp("Leistungsfähigere Betriebsmittel, Engpässe beseitigen", "maschin", "betriebsmittel", "engpass", "bottleneck", "werkzeug", "lieferung"), kp("Umfang oder Qualität reduzieren", "umfang", "reduzier", "qualität", "qualitat", "weniger"), kp("Danach neu rechnen: kritischer Pfad kann sich ändern", "pfad", "neu rechnen", "ändern", "andern")] },
    { id: "2i", t: "pick", pts: 3, topic: "pmg-rollen", q: `Prozesszweige: Welche Vorgänge laufen parallel zu ${lab(xP)}, d. h. sie sind weder sein Vorgänger noch sein Nachfolger?`, opts: idx.filter(i => i !== xP).map(i => String(i + 1)), a: idx.filter(i => i !== xP).map((j, k) => parX.includes(j) ? k : -1).filter(k => k >= 0),
      why: `Parallel (in einem anderen Prozesszweig) laufen: <b>${parX.map(i => i + 1).join(", ")}</b>. Alle anderen Vorgänge sind über Pfeile vor oder nach Nr. ${xP + 1} angeordnet.` },
    { id: "2j", t: "text", pts: 3, topic: "pmg-pm", need: 3, q: "Wo im Netzplan würden Sie Meilensteine setzen, und warum genau dort?",
      model: `Meilensteine kombinieren <b>Zeit und Inhalt</b>: ein Termin, an dem ein <b>definiertes, überprüfbares Ergebnis</b> vorliegt. Sinnvoll sind sie dort, wo eine <b>Phase abgeschlossen</b> ist oder <b>Prozesszweige zusammenlaufen</b>, also eine Entscheidung fällt. Im Netzplan: ${tpl.ms}`,
      kp: [kp("Kombination aus Termin und Inhalt", "termin", "zeit", "datum"), kp("Definiertes, überprüfbares Ergebnis", "ergebnis", "überprüf", "uberpruf", "prüfbar", "ziel"), kp("Phasenende oder Zusammenlauf von Zweigen / Entscheidungspunkt", "phase", "zusammen", "zweig", "entscheid", "abnahme"), kp("Konkrete Vorgänge im Netzplan genannt", "nr", "vorgang", ...nodes.map(v => v.name.toLowerCase().split(" ")[0]))] }
  ] });

  /* Teil 3: kritischer Pfad aus der Angabe */
  let sm, sr;
  for (let tries = 0; tries < 200; tries++) {
    sm = []; const n = 7;
    for (let i = 0; i < n; i++) { const pre = i === 0 ? [] : [...new Set([i - 1 - Math.floor(R.r() * Math.min(i, 2)), ...(i > 1 && R.r() < 0.45 ? [R.int(0, i - 2)] : [])])].sort((a, b) => a - b); sm.push({ name: SMALL[i], d: R.int(2, 9), pre }); }
    const sc = sm.map(() => 0); sm.forEach(v => v.pre.forEach(p => sc[p]++));
    for (let i = 0; i < n - 1; i++) if (!sc[i]) { const j = R.int(i + 1, n - 1); if (!sm[j].pre.includes(i)) { sm[j].pre.push(i); sm[j].pre.sort((a, b) => a - b); } }
    sr = cpm(sm, false);
    if (sr.R.filter(r => !r.krit).length >= 2 && sr.R.filter(r => r.krit).length >= 3) break;
  }
  const L = i => String.fromCharCode(65 + i), smNon = sm.map((_, i) => i).filter(i => !sr.R[i].krit), xG = R.pick(smNon), smCrit = sm.map((_, i) => i).filter(i => sr.R[i].krit);
  A.push({ title: "Kritischer Pfad aus der Angabe", topic: "pmg-netz",
    intro: `<p>Ein anderes Projekt besteht aus diesen Vorgängen (Dauer in ZE). Lesen Sie die Lösungen <b>direkt aus der Angabe</b> ab, ohne einen Netzplan zu zeichnen: Wege vom Start zum Ende verfolgen und Dauern addieren.</p>${TW(`<table class="dt alt-tab alt-narrow"><tr><th>Vorgang</th><th>Beschreibung</th><th>Dauer</th><th>Vorgänger</th></tr>${sm.map((v, i) => `<tr><td><b>${L(i)}</b></td><td>${v.name}</td><td>${v.d}</td><td>${v.pre.length ? v.pre.map(L).join(", ") : "–"}</td></tr>`).join("")}</table>`)}`,
    items: [
      { id: "3a", t: "pick", pts: 7, topic: "pmg-netz", q: "Welche Vorgänge liegen auf dem kritischen Pfad?", opts: sm.map((_, i) => L(i)), a: smCrit,
        why: `Der längste Weg vom Start zum Ende ist kritisch: <b>${smCrit.map(L).join(" → ")}</b> mit ${sr.PE} ZE. ${solSmall(sm, sr, L)}` },
      { id: "3b", t: "num", pts: 4, topic: "pmg-netz", q: "Wie lange dauert das Projekt mindestens?", a: sr.PE, unit: "ZE", why: `Länge des kritischen Pfades: ${smCrit.map(i => sm[i].d).join(" + ")} = <b>${sr.PE} ZE</b>.` },
      { id: "3c", t: "num", pts: 4, topic: "pmg-netz", q: `Wie groß ist der Gesamtpuffer von Vorgang ${L(xG)}?`, a: sr.R[xG].GP, unit: "ZE", why: `GP = SAZ − FAZ = ${sr.R[xG].SAZ} − ${sr.R[xG].FAZ} = <b>${sr.R[xG].GP} ZE</b>.` }
    ] });

  /* Bonus: Zusatzfragen aus der VO */
  A.push({ title: "Zusatzfragen (Bonus)", bonus: true, topic: "pmg-info", intro: `<p>Bonusfragen aus der Vorlesung: Damit gleichen Sie verlorene Punkte aus. Mehr als ${LIMIT} Punkte gibt es nicht.</p>`, items: R.shuffle(bonusPool(R)).slice(0, 5) });

  A.forEach(a => a.pts = a.items.reduce((s, it) => s + it.pts, 0));
  return { seed, cal, A, net, orig: net.orig };
}

function bonusPool(R) {
  const P = [];
  let kRows; do { kRows = R.shuffle(KALK).slice(0, 4); } while (new Set(kRows.map(r => r[1])).size < 3);
  P.push({ id: "bk", t: "match", pts: 4, topic: "pmg-res", q: "Welche Arten der Kalkulation gibt es? Ordnen Sie zu.", choices: ["Vorkalkulation", "Mitkalkulation", "Nachkalkulation"], rows: kRows,
    why: "<b>Vorkalkulation</b>: Plan-Mengengerüst, wird mehrmals durchlaufen, Basis für Angebote. <b>Mitkalkulation</b>: laufender Plan-/Ist-Vergleich. <b>Nachkalkulation</b>: entspricht der letzten Mitkalkulation, Projektkostenanalyse und Erfahrungsdaten." });
  P.push({ id: "bf", t: "match", pts: 4, topic: "pmg-rollen", q: "Unterteilung des Entwicklungsprozesses (Folie 117): Ordnen Sie die Begriffe zu.", choices: F117T, rows: R.shuffle(F117).slice(0, 4),
    why: "Hierarchie: <b>Prozess → Prozessabschnitt → Prozessphase → Prozessschritt</b>. <b>Prozesszweige</b>: parallel durchgeführte Prozessphasen. <b>Meilenstein</b>: Zeitpunkt der Fertigstellung besonders wichtiger Tätigkeiten. Besonders wichtige Ergebnisse der <b>Arbeitspakete</b> beim Erreichen des Meilensteins: <b>Baseline</b>." });
  const [ps1, ps2] = R.shuffle(PSP), pType = R.r() < 0.5 ? "O" : "P", idType = R.int(0, 3), TYPES = ["objektorientiert", "funktionsorientiert", "ablauforientiert", "Mischform"];
  P.push({ id: "bp", t: "match", pts: 4, topic: "pmg-psp", q: `Strukturplan: Sie zeichnen für „${ps1.p}“ einen <b>${pType === "O" ? "objektorientierten" : "ablauforientierten"}</b> PSP mit der zweiten Ebene ${ps1[pType].map(x => `<b>${x}</b>`).join(" · ")}. Wohin gehören die Arbeitspakete?`,
    choices: ps1[pType], rows: R.shuffle(ps1.ap).slice(0, 4).map(a => [a[0], pType === "O" ? a[1] : a[2]]),
    why: pType === "O" ? "Objektorientiert: nach dem <b>Teil des Produkts</b>, egal in welcher Phase." : "Ablauforientiert: nach der <b>Phase</b>, in der das Paket erledigt wird." });
  P.push({ id: "bt", t: "one", pts: 3, topic: "pmg-psp", q: `Welche Art von Projektstrukturplan ist das?${pspTree(ps2, idType)}`, opts: TYPES, a: idType,
    why: `Objektorientiert: Bestandteile (${ps2.O.join(", ")}). Funktionsorientiert: Entwicklungsfunktionen (${ps2.F.join(", ")}). Ablauforientiert: Phasen (${ps2.P.join(", ")}). Mischform: zwei Arten auf verschiedenen Ebenen.` });
  let tt, ttm;
  for (let k = 0; k < 100; k++) { tt = ["Hardware", "Software", "Schulung"].map(name => { const plan = R.int(10, 60), ist = Math.max(4, Math.round(plan * (0.75 + R.r() * 0.65))); return { name, plan, ist, v: plan / ist }; }); ttm = tt.reduce((s, x) => s + x.v, 0) / 3; if (Math.abs(ttm - 1) >= 0.04) break; }
  P.push({ id: "bq", t: "num", pts: 4, topic: "pmg-kontr", tol: 0.011, q: `Termintreue: Berechnen Sie die Termintreue des Gesamtprojekts (2 Nachkommastellen). Liegt es im Plan?${TW(`<table class="dt alt-tab alt-narrow"><tr><th>Teilprojekt</th><th>T<sub>Plan</sub></th><th>T<sub>Ist</sub></th></tr>${tt.map(x => `<tr><td>${x.name}</td><td>${x.plan}</td><td>${x.ist}</td></tr>`).join("")}</table>`)}`, a: ttm,
    why: `TT<sub>TP</sub> = T<sub>Plan</sub> ÷ T<sub>Ist</sub>: ${tt.map(x => `${x.plan} ÷ ${x.ist} = ${de(x.v)}`).join(", ")}. Gesamtprojekt = arithmetisches Mittel = <b>${de(ttm)}</b>, ${ttm < 1 ? "kleiner 1: im Verzug" : "größer 1: schneller als geplant"}.` });
  let pcts; do { pcts = PHASES.slice(1).map(() => R.int(8, 32)); pcts.push(100 - pcts.reduce((a, b) => a + b, 0)); } while (pcts[4] < 8 || pcts[4] > 34); pcts = R.shuffle(pcts);
  const base = R.int(6, 30), known = R.int(0, 4), ask = R.pick([0, 1, 2, 3, 4].filter(i => i !== known));
  P.push({ id: "bs", t: "num", pts: 4, topic: "pmg-schaetz", q: `Prozentsatzmethode: Die Phase <b>${PHASES[known]}</b> ist abgeschlossen und hat ${pcts[known] * base} h gedauert. Wie viele Stunden planen Sie für die Phase <b>${PHASES[ask]}</b> ein?${TW(`<table class="dt alt-tab alt-narrow"><tr>${PHASES.map(p => `<th>${p}</th>`).join("")}</tr><tr>${pcts.map(p => `<td>${p} %</td>`).join("")}</tr></table>`)}`, a: base * pcts[ask], unit: "h",
    why: `1 % = ${pcts[known] * base} h ÷ ${pcts[known]} = ${base} h. ${PHASES[ask]}: ${pcts[ask]} × ${base} h = <b>${base * pcts[ask]} h</b> (Gesamt: ${base * 100} h).` });
  const team = R.shuffle(NAMES).slice(0, 4).map(nm => ({ nm, lv: R.pick(LEVEL) })), truth = R.int(30, 70);
  team.forEach(p => { const sp = [0.45, 0.35, 0.15, 0.1, 0.25][LEVEL.indexOf(p.lv)]; p.e = Math.max(5, Math.round(truth * (1 + (R.r() * 2 - 1) * sp))); });
  const ws = team.reduce((s, p) => s + p.lv[1], 0), wm = team.reduce((s, p) => s + p.lv[1] * p.e, 0) / ws;
  P.push({ id: "bw", t: "num", pts: 4, topic: "pmg-schaetz", tol: 0.06, q: `Schätzen in der Gruppe: Die Projektleitung gewichtet nach Erfahrung und Qualifikation. Wie lautet die gewichtete Schätzung (1 Nachkommastelle)?${TW(`<table class="dt alt-tab alt-narrow"><tr><th>Person</th><th>Hintergrund</th><th>Gewicht</th><th>Schätzung</th></tr>${team.map(p => `<tr><td>${p.nm}</td><td>${p.lv[0]}</td><td>${p.lv[1]}</td><td>${p.e} PT</td></tr>`).join("")}</table>`)}`, a: wm, unit: "PT",
    why: `Σ(Gewicht × Schätzung) ÷ Σ Gewichte = (${team.map(p => `${p.lv[1]}·${p.e}`).join(" + ")}) ÷ ${ws} = <b>${de(wm, 1)} PT</b>. Weniger Erfahrene bekommen nicht dasselbe Gewicht wie Erfahrene.` });
  P.push({ id: "bg", t: "text", pts: 4, topic: "pmg-schaetz", need: 3, q: "Wie schätzen Sie in einer Gruppe, in der jede Person eine andere Qualifikation und Erfahrung hat?",
    model: "Jede Person schätzt zuerst <b>unabhängig</b>. Die Schätzungen werden <b>nach Erfahrung und Qualifikation gewichtet</b>. Große Abweichungen werden <b>besprochen</b>. Besser <b>kleine Teile einzeln schätzen und summieren</b> (Pölzseil-Experiment), mit <b>Erfahrungsdaten</b> vergleichen und <b>zwei Methoden</b> anwenden.",
    kp: [kp("Nach Erfahrung und Qualifikation gewichten", "gewicht"), kp("Zuerst unabhängig schätzen", "unabhängig", "unabhangig", "einzeln", "jede person", "jeder"), kp("Abweichungen besprechen", "besprech", "diskut", "konsens", "abweich"), kp("In Teile zerlegen / Erfahrungsdaten / zwei Methoden", "teile", "arbeitspaket", "zerleg", "erfahrungsdaten", "methode")] });
  P.push({ id: "bfg", t: "match", pts: 4, topic: "pmg-sach", q: "Fertigstellungsgrad: Ordnen Sie zu.", choices: FGRAD.map(x => `${x[0].toUpperCase()}${x.slice(1)}er Fertigstellungsgrad`), rows: R.shuffle(FG).slice(0, 4),
    why: "Relativ: prozentueller Anteil (Problem: „Fast-schon-fertig“-Syndrom). Absolut: nur ganz abgeschlossene Arbeitspakete. Prozessbezogen: Anzahl abgenommener Meilensteine." });
  const dk = (() => { const t = R.shuffle(DOKU.filter(d => d[1])).slice(0, R.int(3, 4)), f = R.shuffle(DOKU.filter(d => !d[1])).slice(0, 6 - t.length); return R.shuffle([...t, ...f]); })();
  P.push({ id: "bd", t: "multi", pts: 4, topic: "pmg-info", q: "Projektdokumentation: Welche Aussagen sind richtig?", opts: dk.map(d => d[0]), a: dk.map((d, i) => d[1] ? i : -1).filter(i => i >= 0),
    why: "Zur Projektdokumentation gehören alle Dokumente zum Projektgeschehen; ohne vollständige, aktuelle Dokumentation kann das PM nicht wirksam arbeiten. Projekttagebuch: an keine Form gebunden, gebunden geführt, Einträge nicht löschbar, für jeden einsehbar, eine Person zuständig, alle dürfen eintragen." });
  const th = R.pick(THEO);
  P.push({ id: "bx", t: "text", pts: 4, topic: th.topic, need: th.need, q: th.q, model: th.model, kp: th.kp });
  return P;
}
function pspTree(ps, type) {
  const kids = type === 3 ? ps.P.map(p => `<div class="px-psp-n">${p}<div class="px-psp-sub">${ps.O.map(o => `<span>${o}</span>`).join("")}</div></div>`).join("")
    : (type === 0 ? ps.O : type === 1 ? ps.F : ps.P).map(x => `<div class="px-psp-n">${x}</div>`).join("");
  return `<div class="px-psp"><div class="px-psp-root">${ps.p}</div><div class="px-psp-l2">${kids}</div></div>`;
}

/* ---------- Bewertung ---------- */
const ansd = (it, a) => a != null && (it.t === "sheet" ? Object.values(a).some(x => String(x).trim() !== "") : Array.isArray(a) ? (it.t === "match" ? a.some(x => x >= 0) : a.length > 0) : String(a).trim() !== "");
function autoKP(it, a) { const t = String(a || "").toLowerCase(); return it.kp.map(k => !!t && k.k.some(w => t.includes(w))); }
const ticks = (it, a, self) => self && self[it.id] ? self[it.id] : autoKP(it, a);
function sheetCount(net, a) { let ok = 0, tot = 0; net.nodes.forEach((_, i) => FIELDS.forEach(f => { tot++; if (cellOK(net, i, f[0], (a || {})[i + ":" + f[0]])) ok++; })); return { ok, tot }; }
function score(ex, it, a, self) {
  if (!ansd(it, a)) return 0;
  switch (it.t) {
    case "num": return okNum(it, a) ? it.pts : 0;
    case "date": return okDate(ex.net, a, it.a) ? it.pts : 0;
    case "one": return a === it.a ? it.pts : 0;
    case "multi": case "pick": { const hit = a.filter(i => it.a.includes(i)).length, bad = a.length - hit; return Math.max(0, it.pts * (hit - bad) / it.a.length); }
    case "match": return it.pts * it.rows.filter((r, i) => a[i] === r[1]).length / it.rows.length;
    case "sheet": { const c = sheetCount(ex.net, a); return it.pts * c.ok / c.tot; }
    case "text": return it.pts * Math.min(1, ticks(it, a, self).filter(Boolean).length / it.need);
  }
  return 0;
}

/* ---------- Darstellung ---------- */
function itemHTML(ex, it, a, mode, self) {
  const rv = mode === "review", dis = rv ? " disabled" : "";
  let body = "";
  if (it.t === "sheet") return `<div class="px-it" data-it="${it.id}">${sheet(ex.net, { mode: rv ? "review" : "input", id: it.id, ans: a, crit: rv })}${rv ? `<div class="why ${score(ex, it, a) >= it.pts - 1e-9 ? "" : "bad"}"><b class="px-got">${(c => `${c.ok} von ${c.tot} Feldern richtig · ${fmtP(score(ex, it, a))} von ${it.pts} P.`)(sheetCount(ex.net, a))}</b><div><span class="eyebrow">Lösungsweg</span> Vorwärtsrechnung von links nach rechts: ${ex.cal ? "FEZ = FAZ + Dauer − 1; ein Nachfolger beginnt am Tag nach dem <b>größten</b> FEZ seiner Vorgänger." : "FEZ = FAZ + Dauer; ein Nachfolger beginnt beim <b>größten</b> FEZ seiner Vorgänger."} Rückwärtsrechnung von rechts nach links ab dem Projektende: ${ex.cal ? "SAZ = SEZ − Dauer + 1; ein Vorgänger endet spätestens am Tag vor dem <b>kleinsten</b> SAZ seiner Nachfolger." : "SAZ = SEZ − Dauer; SEZ eines Vorgängers = <b>kleinster</b> SAZ der Nachfolger."} Gesamtpuffer = SAZ − FAZ. Freier Puffer = kleinster FAZ der Nachfolger − FEZ${ex.cal ? " − 1" : ""}. Falsche Felder sind rot, darunter steht der richtige Wert; der kritische Pfad ist lila. Im Lernteil (Netzplantechnik) kannst du dir die Rechnung Schritt für Schritt ansehen.</div></div>` : ""}</div>`;
  const inp = (val, ok, w, ty) => `<input type="text" class="px-in${rv ? (ok ? " ok" : " no") : ""}" inputmode="${ty === "date" ? "text" : "decimal"}" value="${esc(val || "")}" placeholder="${ty === "date" ? "T.M." : ""}" autocomplete="off" style="width:${w}px"${dis}`;
  if (it.t === "num" || it.t === "date") {
    const ok = it.t === "num" ? okNum(it, a) : okDate(ex.net, a, it.a);
    body = `<label class="px-num">${inp(a, ok, 130, it.t)} data-id="${it.id}"><span class="muted">${it.t === "date" ? "Datum" : esc(it.unit || "")}</span></label>`;
  } else if (it.t === "pick") {
    body = `<div class="px-picks">${it.opts.map((o, i) => { const sel = a && a.includes(i), c = it.a.includes(i); return `<button class="px-pk${sel ? " sel" : ""}${rv ? (sel && c ? " ok" : sel ? " no" : c ? " reveal" : "") : ""}" data-id="${it.id}" data-i="${i}"${dis}>${o}</button>`; }).join("")}</div>`;
  } else if (it.t === "one" || it.t === "multi") {
    const isSel = i => it.t === "multi" ? a && a.includes(i) : a === i, isC = i => it.t === "multi" ? it.a.includes(i) : it.a === i;
    body = `<small class="muted">${it.t === "multi" ? "Eine oder mehrere Antworten:" : "Eine Antwort:"}</small><div class="opts">${it.opts.map((o, i) => `<button class="opt px-o${rv ? (isSel(i) && isC(i) ? " ok" : isSel(i) ? " no" : isC(i) ? " reveal" : " dim") : isSel(i) ? " sel" : ""}" data-id="${it.id}" data-i="${i}"${dis}><span class="k">${LET(i)}</span><span>${o}</span></button>`).join("")}</div>`;
  } else if (it.t === "match") {
    body = `<div class="alt-match">${it.rows.map((r, i) => `<label class="alt-mrow"><span>${r[0]}</span><select data-id="${it.id}" data-r="${i}"${dis}${rv ? ` class="${a && a[i] === r[1] ? "ok" : "no"}"` : ""}><option value="-1">Auswählen …</option>${it.choices.map((c, j) => `<option value="${j}"${a && a[i] === j ? " selected" : ""}>${c}</option>`).join("")}</select></label>`).join("")}</div>`;
  } else if (it.t === "text") {
    body = `<textarea class="px-ta" rows="4" data-id="${it.id}" placeholder="Ihre Antwort …"${dis}>${esc(a || "")}</textarea>`;
  }
  let fb = "";
  if (rv) {
    const got = score(ex, it, a, self);
    let right = "";
    if (it.t === "num") right = `${de(it.a, 2)} ${it.unit || ""}`;
    else if (it.t === "date") right = ex.net.fmt(it.a);
    else if (it.t === "pick") right = it.a.map(i => it.opts[i]).join(", ");
    else if (it.t === "one") right = `<b>${LET(it.a)}</b> ${it.opts[it.a]}`;
    else if (it.t === "multi") right = it.a.map(i => `<b>${LET(i)}</b>`).join(", ");
    else if (it.t === "match") right = `<ul class="alt-right">${it.rows.map((r, i) => `<li class="${a && a[i] === r[1] ? "y" : "n"}">${r[0]} <b>→ ${it.choices[r[1]]}</b></li>`).join("")}</ul>`;
    const tk = it.t === "text" ? ticks(it, a, self) : null;
    fb = `<div class="why ${got >= it.pts - 1e-9 ? "" : "bad"}"><b class="px-got">${ansd(it, a) ? `${fmtP(got)} von ${fmtP(it.pts)} P.` : `Nicht beantwortet · 0 von ${fmtP(it.pts)} P.`}</b>
      ${it.t === "text" ? `<div><span class="eyebrow">Musterantwort</span> ${it.model}</div><div class="px-kp"><span class="eyebrow">Selbst bewerten: was steht in deiner Antwort? (${it.need} von ${it.kp.length} für volle Punkte)</span>${it.kp.map((k, i) => `<label><input type="checkbox" data-kp="${it.id}" data-k="${i}"${tk[i] ? " checked" : ""}> ${k.t}</label>`).join("")}<small class="muted">Vorab angehakt nach Stichworten in deinem Text. Korrigiere die Haken ehrlich.</small></div>`
        : `${right ? `<div class="muted">Richtig: ${right}</div>` : ""}<div><span class="eyebrow">Lösungsweg</span> ${it.why}</div>`}</div>`;
  }
  return `<div class="px-it" data-it="${it.id}"><div class="spread"><div class="check-q alt-text">${it.q}</div><small class="muted px-ip">${fmtP(it.pts)} P.</small></div>${body}${fb}</div>`;
}
function partHTML(ex, k, run, mode) {
  const p = ex.A[k], rv = mode === "review";
  return `<article class="card col alt-q px-part" id="aq-${k}" data-k="${k}"><div class="spread"><span class="eyebrow">Aufgabe ${k + 1} · ${fmtP(p.pts)} P.${p.bonus ? " · Bonus" : ""}</span>${rv ? `<b class="px-psum"></b>` : ""}</div><h3>${p.title}</h3>
    ${p.intro ? `<div class="alt-text">${p.intro}</div>` : ""}
    <div class="col px-items">${p.items.map(it => itemHTML(ex, it, run.ans[it.id], mode, run.self)).join(`<div class="divider"></div>`)}</div>
    ${!rv && run.mode === "learn" ? `<div class="row"><button class="btn sm" data-check>Aufgabe prüfen</button></div>` : ""}</article>`;
}
const partPts = (ex, k, run) => ex.A[k].items.reduce((s, it) => s + score(ex, it, run.ans[it.id], run.self), 0);
const totals = (ex, run) => { const raw = ex.A.reduce((s, _, k) => s + partPts(ex, k, run), 0); return { raw, total: Math.min(LIMIT, Math.round(raw * 100) / 100) }; };
const KEY = [[90, "Sehr gut (1)"], [80, "Gut (2)"], [70, "Befriedigend (3)"], [60, "Genügend (4)"]];
const grade = pct => (KEY.find(([t]) => pct > t + 1e-9) || [0, "Nicht genügend (5)"])[1];

/* ---------- Eingaben ---------- */
function bind(root, ex, run, onChange) {
  const items = {}; ex.A.forEach(p => p.items.forEach(it => items[it.id] = it));
  const set = (id, v) => { if (v == null) delete run.ans[id]; else run.ans[id] = v; App.save(); onChange && onChange(id); };
  root.addEventListener("input", e => {
    const t = e.target, id = t.dataset && t.dataset.id; if (!id || !items[id]) return;
    if (t.dataset.c) { const o = run.ans[id] || {}; o[t.dataset.c] = t.value; set(id, o); }
    else if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") set(id, t.value);
  });
  root.addEventListener("keydown", e => { const t = e.target; if (e.key !== "Enter" || !t.classList.contains("np-in")) return; e.preventDefault(); const all = $$(".np-in:not(:disabled)", t.closest(".np-canvas")); const n = all[all.indexOf(t) + 1]; if (n) n.focus(); });
  root.addEventListener("change", e => { const t = e.target; if (!t.matches("select[data-r]")) return; const it = items[t.dataset.id]; const v = it.rows.map((_, i) => +$(`select[data-id="${it.id}"][data-r="${i}"]`, root).value); set(it.id, v.some(x => x >= 0) ? v : null); });
  root.addEventListener("click", e => {
    const b = e.target.closest("button[data-id]"); if (!b || b.disabled) return; const it = items[b.dataset.id], i = +b.dataset.i;
    if (it.t === "one") { $$(`button[data-id="${it.id}"]`, root).forEach(x => x.classList.toggle("sel", x === b)); return set(it.id, i); }
    b.classList.toggle("sel"); const v = $$(`button[data-id="${it.id}"]`, root).map((x, j) => x.classList.contains("sel") ? j : -1).filter(j => j >= 0); set(it.id, v.length ? v : null);
  });
}
function bindKP(root, ex, run, after) {
  root.addEventListener("change", e => {
    const t = e.target; if (!t.matches("input[data-kp]")) return;
    const id = t.dataset.kp, it = ex.A.flatMap(p => p.items).find(x => x.id === id);
    const arr = ticks(it, run.ans[id], run.self).slice(); arr[+t.dataset.k] = t.checked; (run.self || (run.self = {}))[id] = arr; App.save();
    $(".px-got", t.closest(".px-it")).textContent = `${fmtP(score(ex, it, run.ans[id], run.self))} von ${fmtP(it.pts)} P.`;
    after && after();
  });
}

/* ---------- Seiten ---------- */
const st = () => S().pmexam || (S().pmexam = {});
const newSeed = () => (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
const runGen = run => gen(run.seed, run.opt || {});
function intro(el) {
  const s = st(), hist = (S().exams || []).filter(x => x.course === "pmgt" && x.kind === "sim").slice(-5).reverse(), run = s.run;
  el.innerHTML = `<div class="page"><header><span class="eyebrow">Projektmanagement · Prüfungstrainer</span><h1>Prüfung: Netzplan</h1><p class="muted" style="margin-top:6px;max-width:72ch">Wie bei Prof. Fritz: Du bekommst einen <b>fertig gezeichneten Netzplan</b> mit leeren Kästchen (wie Prüfungsbeispiel 1 vom 10.03.2023) und trägst <b>Frühester Anfang, Freie Pufferzeit, Frühestes Ende, Spätester Anfang, Gesamte Pufferzeit und Spätestes Ende</b> selbst ein. Danach beantwortest du Fragen, die du aus dem Netzplan ableitest: kritischer Pfad, Dauer, wann beginnt und endet was, Puffer, Verzögerung, verkürzen, Prozesszweige, Meilensteine. Dazu ein kritischer Pfad direkt aus der Angabe und Bonusfragen aus der VO. Jeder Versuch hat neue Zahlen.</p></header>
    ${run ? `<div class="callout"><b>Ein Versuch läuft noch</b> (${run.mode === "exam" ? "Prüfungsmodus" : "Lernmodus"}${run.tEnd ? `, noch ${Math.max(0, Math.round((run.tEnd - Date.now()) / 60000))} Minuten` : ""}).<div class="row" style="margin-top:8px"><button class="btn pri" id="px-cont">Fortsetzen</button><button class="btn ghost" id="px-drop">Verwerfen</button></div></div>` : ""}
    <section class="card col"><h3>Einstellungen</h3><div class="grid g2">
      <label class="fld">Netzplan<select id="px-orig"><option value="">Zufall: Prüfungsnetzplan oder anderes Projekt, neue Dauern</option><option value="1"${s.orig === "1" ? " selected" : ""}>Original vom 10.03.2023 (echte Dauern, Start 3.4.2023)</option></select></label>
      <label class="fld">Rechnen in<select id="px-cal"><option value="">Zufall</option><option value="1"${s.cal === "1" ? " selected" : ""}>Kalendertagen (Datum)</option><option value="0"${s.cal === "0" ? " selected" : ""}>abstrakten Zeiteinheiten</option></select></label></div></section>
    <div class="grid g2">
      <section class="card col"><h3>Prüfungsmodus</h3><p><b>${MINUTES} Minuten</b>, 100 Punkte plus Bonus, Auswertung erst nach der Abgabe. Taschenrechner ist erlaubt, Unterlagen nicht. Notenschlüssel der VO: ab 91 Sehr gut, ab 81 Gut, ab 71 Befriedigend, ab 61 Genügend.</p>
        <div class="row"><button class="btn pri" id="px-exam">Prüfung starten</button></div></section>
      <section class="card col"><h3>Lernmodus</h3><p>Ohne Zeitlimit. Jede Aufgabe einzeln prüfen: falsche Felder im Netzplan werden rot, darunter steht der richtige Wert, der kritische Pfad wird lila.</p>
        <div class="row"><button class="btn" id="px-learn">Lernmodus starten</button><button class="btn ghost" data-go="lesson" data-p="pmg3-3">Netzplan Schritt für Schritt</button></div></section>
    </div>
    <small class="muted">Punkteverteilung und ${MINUTES} Minuten sind geschätzt.</small>
    <section class="card col"><h3>Deine Versuche</h3>${hist.length ? hist.map(x => `<div class="spread"><span class="tab">${fmtP(x.total)} / ${x.max} P. · ${grade(100 * x.total / x.max)}</span><small>${new Date(x.ts).toLocaleDateString("de-AT")}</small></div>`).join(`<div class="divider"></div>`) : `<p class="muted">Noch keiner.</p>`}</section>
    <div class="row"><button class="btn ghost" data-go="exam">← Zurück zum Prüfungstrainer</button></div></div>`;
  $("#px-cal", el).onchange = e => { s.cal = e.target.value; App.save(); };
  $("#px-orig", el).onchange = e => { s.orig = e.target.value; App.save(); };
  const start = mode => { s.run = { seed: newSeed(), opt: { orig: s.orig === "1", cal: s.cal || "" }, mode, ans: {}, self: {}, checked: {}, tEnd: mode === "exam" ? Date.now() + MINUTES * 60000 : 0 }; App.save(); attempt(el); };
  $("#px-exam", el).onclick = () => start("exam"); $("#px-learn", el).onclick = () => start("learn");
  if (run) { $("#px-cont", el).onclick = () => attempt(el); $("#px-drop", el).onclick = () => { if (confirm("Diesen Versuch verwerfen?")) { delete s.run; App.save(); intro(el); } }; }
}

function attempt(el) {
  const s = st(), run = s.run, learn = run.mode === "learn"; let tmr, done = false;
  if (run.tEnd && Date.now() >= run.tEnd) return finish(el);
  const ex = runGen(run);
  el.innerHTML = `<div class="page alt-page px-page"><div class="spread alt-head"><div><span class="eyebrow">Projektmanagement · Prüfung · ${learn ? "Lernmodus" : "Prüfungsmodus"} · ${ex.cal ? "Kalendertage" : "Zeiteinheiten"}${ex.orig ? " · Original 10.03.2023" : ""}</span><h1>Netzplan · 100 Punkte + Bonus</h1></div><div class="row">${run.tEnd ? `<span class="chip warn tab" id="px-clk"></span>` : ""}<button class="btn pri" id="px-sub">${learn ? "Auswerten" : "Abgeben"}</button></div></div>
    <nav class="alt-nav">${ex.A.map((p, k) => `<a href="#aq-${k}" data-n="${k}">A${k + 1}</a>`).join("")}</nav>
    <div class="col" style="gap:14px" id="px-qs">${ex.A.map((p, k) => partHTML(ex, k, run, run.checked[k] ? "review" : run.mode)).join("")}</div>
    <div class="row"><button class="btn pri" id="px-sub2">${learn ? "Auswerten" : "Abgeben"}</button><button class="btn ghost" id="px-pause">Pausieren</button></div></div>`;
  const qs = $("#px-qs", el);
  const sync = () => $$(".alt-nav a", el).forEach(a => { const k = +a.dataset.n; a.classList.toggle("on", ex.A[k].items.some(it => ansd(it, run.ans[it.id]))); a.classList.toggle("chk", !!run.checked[k]); });
  const psum = k => { const b = $(`#aq-${k} .px-psum`, el); if (b) b.textContent = `${fmtP(partPts(ex, k, run))} / ${fmtP(ex.A[k].pts)} P.`; };
  bind(qs, ex, run, sync); bindKP(qs, ex, run, () => Object.keys(run.checked).forEach(k => psum(+k)));
  qs.addEventListener("click", e => { const b = e.target.closest("[data-check]"); if (!b) return; const card = b.closest(".px-part"), k = +card.dataset.k;
    run.checked[k] = true; App.save(); card.outerHTML = partHTML(ex, k, run, "review"); psum(k); sync(); });
  Object.keys(run.checked).forEach(k => psum(+k)); sync();
  const submit = () => { if (done) return; done = true; clearInterval(tmr); finish(el); };
  const ask = () => { const open = ex.A.flatMap(p => p.items).filter(it => !ansd(it, run.ans[it.id])).length; if (confirm(open ? `Noch ${open} Teilfragen offen. Trotzdem ${learn ? "auswerten" : "abgeben"}?` : `Jetzt ${learn ? "auswerten" : "abgeben"}?`)) submit(); };
  $("#px-sub", el).onclick = ask; $("#px-sub2", el).onclick = ask; $("#px-pause", el).onclick = () => { clearInterval(tmr); intro(el); };
  if (run.tEnd) { const clk = $("#px-clk", el), tick = () => { const sec = Math.max(0, Math.round((run.tEnd - Date.now()) / 1000)); if (!clk.isConnected) return clearInterval(tmr); clk.textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`; clk.classList.toggle("bad", sec < 300); if (!sec) submit(); }; tick(); tmr = setInterval(tick, 1000); App.cleanup = (old => () => { clearInterval(tmr); old && old(); })(App.cleanup); }
}

function finish(el) {
  const s = st(), run = s.run; if (!run) return intro(el);
  const ex = runGen(run);
  const rec = { ts: Date.now(), course: "pmgt", kind: "sim", total: 0, max: LIMIT, seed: run.seed, weak: [] };
  const upd = () => { const { raw, total } = totals(ex, run); rec.total = total; rec.weak = [...new Set(ex.A.flatMap(p => p.items).filter(it => score(ex, it, run.ans[it.id], run.self) < it.pts - 1e-9).map(it => it.topic))]; App.save(); return { raw, total }; };
  ex.A.flatMap(p => p.items).forEach(it => App.rec(it.topic, score(ex, it, run.ans[it.id], run.self) / it.pts));
  (S().exams || (S().exams = [])).push(rec); const t0 = upd();
  App.addXP(20 + Math.round(t0.total / LIMIT * 40), "exam");
  const done = { ...run }; delete s.run; App.save();
  render(el, ex, done, upd);
}
function render(el, ex, run, upd) {
  const bonusMax = ex.A.filter(p => p.bonus).reduce((s, p) => s + p.pts, 0);
  el.innerHTML = `<div class="page alt-page px-page"><div><span class="eyebrow">Ergebnis · Projektmanagement · ${run.mode === "exam" ? "Prüfungsmodus" : "Lernmodus"} · ${ex.cal ? "Kalendertage" : "Zeiteinheiten"}</span><h1 id="px-tot"></h1></div>
    <div class="grid g3"><div class="card stat"><b class="result-big" id="px-pct" style="font-size:38px"></b><span id="px-pass"></span></div><div class="card stat"><b id="px-grade"></b><span>Notenschlüssel der VO</span></div><div class="card stat"><b id="px-raw"></b><span>Punkte inkl. Bonus (max. ${fmtP(100 + bonusMax)}, gezählt bis ${LIMIT})</span></div></div>
    <small class="muted">Freitextfragen sind nach Stichworten vorbewertet. Hake bei den Musterantworten ehrlich ab, was in deiner Antwort steht; das Ergebnis passt sich sofort an.</small>
    <div class="card col"><h3>Punkte je Aufgabe</h3><div class="alt-grid" id="px-grid"></div></div>
    <h2>Auswertung mit Lösungsweg</h2><div class="col" style="gap:14px" id="px-qs">${ex.A.map((p, k) => partHTML(ex, k, run, "review")).join("")}</div>
    <div class="row"><button class="btn pri" id="px-again">Neue Prüfung mit neuen Zahlen</button><button class="btn ghost" data-go="exam">Prüfungstrainer</button></div></div>`;
  const paint = () => { const { raw, total } = upd(), pct = total / LIMIT * 100, pass = pct > 60 + 1e-9;
    $("#px-tot", el).textContent = `${fmtP(total)} / ${LIMIT} Punkte`; const pc = $("#px-pct", el); pc.textContent = `${Math.round(pct * 10) / 10} %`; pc.style.color = pass ? "var(--acc)" : "var(--bad)";
    $("#px-pass", el).textContent = pass ? "bestanden" : "nicht bestanden"; $("#px-grade", el).textContent = grade(pct); $("#px-raw", el).textContent = fmtP(raw);
    $("#px-grid", el).innerHTML = ex.A.map((p, k) => { const g = partPts(ex, k, run); return `<a href="#aq-${k}" class="${g >= p.pts - 1e-9 ? "ok" : g > 0 ? "part" : "no"}"><b>A${k + 1}</b><small>${fmtP(g)}/${fmtP(p.pts)}</small></a>`; }).join("");
    ex.A.forEach((p, k) => { const b = $(`#aq-${k} .px-psum`, el); if (b) b.textContent = `${fmtP(partPts(ex, k, run))} / ${fmtP(p.pts)} P.`; }); };
  bindKP($("#px-qs", el), ex, run, paint); paint();
  $("#px-again", el).onclick = () => intro(el);
  window.scrollTo(0, 0);
}

/* ---------- Lernwidget: Netzplan Schritt für Schritt ---------- */
const diff = (net, a, b) => net.cal ? `${net.fd(a)} − ${net.fd(b)}` : `${a} − ${b}`;
function steps(net) {
  const { nodes, res, cal, fmt } = net, R = res.R, S = [], lab = i => `<b>Nr. ${i + 1}</b> ${esc(nodes[i].name)}`;
  const T = d => cal ? (d === 1 ? "1 Tag" : `${d} Tage`) : `${d} ZE`;
  S.push({ ph: 0, t: `<b>Vorwärtsrechnung</b> (von links nach rechts): für jeden Kasten frühesten Anfang und frühestes Ende. ${cal ? `Wir rechnen in Kalendertagen ab <b>${net.fd(1)}${net.year}</b>: jeder Tag zählt, ein Vorgang mit 1 Tag beginnt und endet am selben Tag.` : "Wir rechnen in Zeiteinheiten ab dem Zeitpunkt 0."}`, f: [] });
  nodes.forEach((v, i) => {
    const r = R[i];
    const a = v.pre.length ? `Vorgänger: ${v.pre.map(p => `Nr. ${p + 1} endet frühestens ${fmt(R[p].FEZ)}`).join(", ")}.${v.pre.length > 1 ? ` Es müssen <b>alle</b> fertig sein, also das <b>größte</b> FEZ: ${fmt(Math.max(...v.pre.map(p => R[p].FEZ)))}.` : ""} ${cal ? "Er beginnt am Tag danach" : "Er beginnt zu diesem Zeitpunkt"}: FAZ = <b>${fmt(r.FAZ)}</b>.`
      : `Kein Vorgänger: er beginnt beim Projektstart, FAZ = <b>${fmt(r.FAZ)}</b>.`;
    S.push({ ph: 0, n: i, rel: v.pre, t: `${lab(i)}, Dauer ${T(v.d)}. ${a} Frühestes Ende: ${cal ? `FAZ + Dauer − 1 = ${fmt(r.FAZ)} + ${v.d} − 1` : `FAZ + Dauer = ${r.FAZ} + ${v.d}`} = <b>${fmt(r.FEZ)}</b>.`, f: ["FAZ", "FEZ"] });
  });
  S.push({ ph: 1, t: `<b>Rückwärtsrechnung</b> (von rechts nach links): Das Projekt endet ${cal ? "am" : "bei"} <b>${fmt(res.PE)}</b> (größtes frühes Ende). Jetzt für jeden Kasten spätestes Ende und spätesten Anfang, ohne dass sich dieses Ende verschiebt.`, f: [] });
  for (let i = nodes.length - 1; i >= 0; i--) {
    const r = R[i], su = res.succ[i];
    const a = su.length ? `Nachfolger: ${su.map(s => `Nr. ${s + 1} beginnt spätestens ${fmt(R[s].SAZ)}`).join(", ")}.${su.length > 1 ? ` Maßgeblich ist der <b>kleinste</b> SAZ: ${fmt(Math.min(...su.map(s => R[s].SAZ)))}.` : ""} ${cal ? "Er muss am Tag davor fertig sein" : "Er muss bis dahin fertig sein"}: SEZ = <b>${fmt(r.SEZ)}</b>.`
      : `Kein Nachfolger: spätestes Ende = Projektende = <b>${fmt(r.SEZ)}</b>.`;
    S.push({ ph: 1, n: i, rel: su, t: `${lab(i)}. ${a} Spätester Anfang: ${cal ? `SEZ − Dauer + 1 = ${fmt(r.SEZ)} − ${nodes[i].d} + 1` : `SEZ − Dauer = ${r.SEZ} − ${nodes[i].d}`} = <b>${fmt(r.SAZ)}</b>.`, f: ["SEZ", "SAZ"] });
  }
  S.push({ ph: 2, t: "<b>Pufferzeiten</b>: Gesamte Pufferzeit = spätester Anfang − frühester Anfang (so weit kann der Vorgang wandern, ohne das Projektende zu verschieben). Freie Pufferzeit = frühester Anfang des Nachfolgers − frühestes Ende" + (cal ? " − 1" : "") + " (so weit, ohne dass ein Nachfolger später beginnt).", f: [] });
  nodes.forEach((v, i) => {
    const r = R[i], su = res.succ[i], mf = su.length ? Math.min(...su.map(s => R[s].FAZ)) : null;
    S.push({ ph: 2, n: i, rel: su, t: `${lab(i)}: GP = ${diff(net, r.SAZ, r.FAZ)} = <b>${r.GP}</b>. FP = ${su.length ? `${cal ? `${net.fd(mf)} − ${net.fd(r.FEZ)} − 1` : `${mf} − ${r.FEZ}`}${su.length > 1 ? " (kleinster FAZ der Nachfolger)" : ""}` : `Projektende − FEZ = ${diff(net, res.PE, r.FEZ)}`} = <b>${r.FP}</b>.${r.GP === 0 ? " Kein Puffer: <b>kritisch</b>." : ""}`, f: ["GP", "FP"] });
  });
  const crit = nodes.map((_, i) => i).filter(i => R[i].krit), dmax = Math.max(...crit.map(i => nodes[i].d));
  S.push({ ph: 3, crit: true, t: `<b>Kritischer Pfad</b> (lila): alle Vorgänge mit Gesamtpuffer 0: <b>${crit.map(i => i + 1).join(" → ")}</b>. Projektdauer ${cal ? `${res.PE} Tage, Ende am ${fmt(res.PE)}` : `${res.PE} ZE`}. Verkürzen geht nur über kritische Vorgänge, zuerst den längsten: ${crit.filter(i => nodes[i].d === dmax).map(lab).join(" bzw. ")} (${T(dmax)}).`, f: [] });
  S.forEach(x => x.t = x.t.replace(/(\d)\.(<\/b>)?\./g, "$1.$2"));
  return S;
}
W.netzplan = (el, b) => {
  let kind = b.net === "orig" ? "orig" : "small", cal = b.cal != null ? b.cal : kind === "orig", net, S, k = 0, play = null, seed = (Math.random() * 1e9) >>> 0;
  const build = () => {
    const R = mk(rng(seed));
    net = kind === "orig" ? makeNet(R, NETS[0], { orig: true, cal: cal ? "1" : "0" }) : makeNet(R, R.pick(NETS.slice(1)), { cal: cal ? "1" : "0" });
    S = steps(net); k = 0;
  };
  const PH = ["Vorwärts", "Rückwärts", "Puffer", "Kritischer Pfad"];
  const stop = () => { if (play) { clearInterval(play); play = null; } };
  const draw = () => {
    const shown = new Set(), anim = new Set();
    S.slice(0, k + 1).forEach((s, j) => s.n != null && s.f.forEach(f => { shown.add(s.n + ":" + f); if (j === k) anim.add(s.n + ":" + f); }));
    const s = S[k], ph = s.ph;
    el.innerHTML = `<div class="w np-w">${App.whead(esc(b.title || (kind === "orig" ? "Prüfungs-Netzplan vom 10.03.2023 Schritt für Schritt" : "Netzplan Schritt für Schritt")), "Animation")}
      <div class="row np-ctl"><button class="chip ${kind === "orig" ? "on" : ""}" data-k="orig">Prüfung 10.03.2023</button><button class="chip ${kind === "small" ? "on" : ""}" data-k="small">Anderes Projekt</button><span class="np-sep"></span><button class="chip ${cal ? "on" : ""}" data-c="1">Kalendertage</button><button class="chip ${!cal ? "on" : ""}" data-c="0">Zeiteinheiten</button>${kind === "small" ? `<button class="chip" data-new>Neue Zahlen ↻</button>` : ""}</div>
      <div class="row np-ph">${PH.map((p, i) => `<button class="chip ${i === ph ? "on" : ""}" data-ph="${i}">${i + 1}. ${p}</button>`).join("")}</div>
      <div class="np-step" aria-live="polite"><small class="muted">Schritt ${k + 1} von ${S.length}</small><div>${s.t}</div></div>
      <div class="np-bar"><i style="width:${Math.round(100 * (k + 1) / S.length)}%"></i></div>
      ${sheet(net, { mode: "show", shown, anim, cur: s.n, rel: new Set(s.rel || []), crit: !!s.crit })}
      <div class="row"><button class="btn ghost sm" data-go-step="-1"${k ? "" : " disabled"}>◀ Zurück</button><button class="btn sm" data-play>${play ? "❚❚ Pause" : "▶ Abspielen"}</button><button class="btn pri sm" data-go-step="1"${k < S.length - 1 ? "" : " disabled"}>Weiter ▶</button><button class="btn ghost sm" data-go="exam" data-p="pmexam">Selbst rechnen →</button></div></div>`;
    if (s.n != null) scrollTo($(".np-wrap", el), net, s.n);
  };
  const go = d => { k = Math.max(0, Math.min(S.length - 1, k + d)); if (k === S.length - 1) { stop(); if (App.wdone("netzplan-" + kind)) App.addXP(15, "netzplan", el); } draw(); };
  el.addEventListener("click", e => {
    const t = e.target.closest("button"); if (!t || !el.contains(t)) return;
    if (t.dataset.goStep) { stop(); go(+t.dataset.goStep); }
    else if (t.hasAttribute("data-play")) { if (play) stop(); else { if (k === S.length - 1) k = 0; play = setInterval(() => { if (!el.isConnected) return stop(); go(1); }, 2600); } draw(); }
    else if (t.dataset.ph) { stop(); k = S.findIndex(s => s.ph === +t.dataset.ph); draw(); }
    else if (t.dataset.k) { stop(); kind = t.dataset.k; cal = kind === "orig" ? true : cal; build(); draw(); }
    else if (t.dataset.c) { stop(); cal = t.dataset.c === "1"; build(); draw(); }
    else if (t.hasAttribute("data-new")) { stop(); seed = (Math.random() * 1e9) >>> 0; build(); draw(); }
  });
  build(); draw();
};

/* ---------- Einhängen: Prüfungstrainer, Prüfung üben, Kursseite ---------- */
const cta = () => `<button class="card prep-cta alt-cta" data-go="exam" data-p="pmexam"><div><span class="eyebrow">Prüfung</span><div class="lrow-t">Netzplan-Prüfung wie am 10.03.2023, jedes Mal mit neuen Zahlen</div><small>Netzplan selbst ausfüllen · kritischer Pfad · Dauer · Puffer · verkürzen · Prozesszweige · Meilensteine · Bonusfragen${st().run ? " · ein Versuch läuft" : ""}</small></div><span class="alt-go">→</span></button>`;
const prevExam = PAGES.exam;
PAGES.exam = (el, p) => {
  if (p === "pmexam") { if (S().course !== "pmgt" && CBY.pmgt) { S().course = "pmgt"; App.save(); App.renderSide && App.renderSide(); } return intro(el); }
  const r = prevExam(el, p), c = CBY[S().course], head = el.querySelector(".page > div");
  if (c && c.id === "pmgt" && head) head.insertAdjacentHTML("afterend", cta());
  return r;
};
const prevPrep = PAGES.prep;
PAGES.prep = (el, p) => { const r = prevPrep(el, p), top = el.querySelector(".prep-top"); if (top && el.querySelector('[data-pc="pmgt"].on')) top.insertAdjacentHTML("beforebegin", cta()); return r; };
const prevCourse = PAGES.course;
PAGES.course = (el, cid) => { const r = prevCourse(el, cid), pc = el.querySelector('.prep-cta[data-p="pmgt"]'); if (pc) pc.insertAdjacentHTML("afterend", cta()); return r; };
App.PMEXAM = { gen, cpm, makeNet, score, totals, grade, sheet, steps, NETS };
})();
