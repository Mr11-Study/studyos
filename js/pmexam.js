/* StudyOS · Projektmanagement (GL-PMGT): Prüfungssimulator mit Zufallszahlen
   Aufbau wie die schriftliche Prüfung bei FH-Prof. Werner Fritz (Prüfungsbeispiel 10.03.2023 und Kevins Infos zur Prüfung):
   A1 Netzplan zeichnen lassen ist vorgegeben, durchrechnen (Kalendertage oder abstrakte Zeiteinheiten), kritischer Pfad, Dauer, Verkürzen
   A2 Kritischer Pfad nur aus der Angabe · A3 Aufwandsschätzung (Prozentsatzmethode, gewichtete Gruppenschätzung)
   A4 Kennzahlen (Termintreue, Fertigstellungsgrad) · A5 Kalkulation, Folie 117, Strukturplan, Meilensteine · A6 Bonus.
   Jeder Versuch hat einen eigenen Seed: neue Dauern, neues Startdatum, neue Fallbeispiele. Laufender Versuch in S().pmexam.
   Start: go("exam", "pmexam") oder die Karten auf Prüfungstrainer, Prüfung üben und Kursseite. */
(function () {
const { $, $$, esc, PAGES, CBY } = App;
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

/* ---------- Netzplan-Rechnung ----------
   cal = true: Kalendertage wie in der Übung und der Altprüfung (FEZ = FAZ + D − 1, Nachfolger beginnt am Tag danach).
   cal = false: abstrakte Zeiteinheiten, Zeitpunktzählung ab 0 (FEZ = FAZ + D, Nachfolger beginnt zum Zeitpunkt FEZ). */
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

/* ---------- Netzplan-Vorlagen ---------- */
const NETS = [
  { id: "prod", name: "Produkteinführung", intro: "Ein Unternehmen bringt ein neues Gerät auf den Markt. Der Ablauf ist an das Netzplan-Beispiel aus der Prüfung vom 10.03.2023 angelehnt.", w: 3, v: [
    ["Konzeptkonferenz", 1, 2, []], ["Vorstudie technische Details", 10, 22, [1]], ["Bauteilsuche", 2, 6, [2]], ["Marktuntersuchung", 5, 12, [1]], ["Wettbewerbsanalyse", 3, 9, [1]],
    ["Erstellung Pflichtenheft", 2, 5, [4, 5]], ["Konferenz der Design-Spezifikation", 1, 2, [3, 6]], ["Entwurf Verkaufsstrategie", 4, 10, [7]], ["Entwurf Werbung", 4, 10, [8]], ["Verkäuferschulung", 2, 5, [8]],
    ["Start Werbung", 4, 10, [9]], ["Entwurf Grafikdesign", 2, 6, [7]], ["Entwurf Verpackung", 3, 8, [12]], ["Fotoshooting Produkt", 2, 8, [12]], ["Entwurf Prospekt", 2, 5, [13]],
    ["Fertigstellung & Druck Prospekt", 6, 12, [15]], ["Entwicklung Produkt", 10, 20, [7]], ["Qualitätssicherung", 4, 10, [17]], ["Dokumentation der Entwicklung", 10, 22, [17]], ["Druck Dokumentation", 4, 10, [19]],
    ["Arbeitsvorbereitung", 1, 3, [18, 20]], ["Beginn der Produktion", 2, 4, [10, 11, 14, 16, 21]]] },
  { id: "wws", name: "Einführung eines Warenwirtschaftssystems", intro: "Ein Handelsunternehmen führt ein neues Warenwirtschaftssystem ein.", w: 1, v: [
    ["Kick-off", 1, 2, []], ["Ist-Analyse", 4, 10, [1]], ["Anforderungen erheben", 5, 12, [2]], ["Marktanalyse Anbieter", 3, 8, [1]], ["Pflichtenheft", 3, 6, [3]],
    ["Ausschreibung & Auswahl", 5, 12, [4, 5]], ["Hardware beschaffen", 4, 14, [6]], ["Customizing", 8, 18, [6]], ["Schnittstellen entwickeln", 6, 16, [6]], ["Datenmigration", 3, 9, [8]],
    ["Schulungskonzept", 2, 6, [6]], ["Anwenderschulung", 3, 8, [11]], ["Integrationstest", 3, 8, [7, 8, 9, 10]], ["Go-live", 1, 2, [12, 13]]] },
  { id: "messe", name: "Messeauftritt", intro: "Ein Start-up stellt zum ersten Mal auf einer Fachmesse aus.", w: 1, v: [
    ["Messeanmeldung", 1, 3, []], ["Standkonzept", 3, 8, [1]], ["Standbau beauftragen", 2, 5, [2]], ["Exponate auswählen", 2, 6, [1]], ["Prototyp fertigstellen", 6, 15, [4]],
    ["Werbemittel gestalten", 3, 8, [2]], ["Werbemittel drucken", 3, 7, [6]], ["Personal einplanen", 1, 4, [1]], ["Standpersonal schulen", 2, 4, [8]], ["Standaufbau", 2, 4, [3]],
    ["Transport Exponate", 1, 3, [5, 10]], ["Messeeröffnung", 1, 1, [7, 9, 11]]] },
  { id: "rz", name: "Umzug des Rechenzentrums", intro: "Ein Unternehmen zieht sein Rechenzentrum in einen neuen Standort um.", w: 1, v: [
    ["Projektstart", 1, 1, []], ["Bestandsaufnahme Server", 3, 8, [1]], ["Raumplanung neuer Standort", 4, 10, [1]], ["Umzugskonzept", 3, 7, [2]], ["Elektro & Klima installieren", 6, 15, [3]],
    ["Netzwerk verkabeln", 4, 10, [3]], ["Neue Hardware bestellen", 5, 14, [4]], ["Testumgebung aufbauen", 3, 8, [5, 6, 7]], ["Migrationstest", 2, 6, [8]], ["Mitarbeitende informieren", 1, 3, [4]],
    ["Umzugswochenende vorbereiten", 2, 5, [9, 10]], ["Umzug durchführen", 2, 4, [11]], ["Abnahme & Übergabe", 1, 2, [12]]] }
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

/* ---------- Generator ---------- */
const NAMES = ["Anna", "Ben", "Clara", "David", "Eva", "Felix", "Greta", "Hannes", "Ida", "Jakob", "Lena", "Moritz"];
const LEVEL = [["Praktikant:in, 1. Projekt", 1], ["Junior, 2 Jahre Erfahrung", 2], ["Senior, 8 Jahre Erfahrung", 4], ["Expert:in, 15 Jahre, hat 3 ähnliche Projekte geleitet", 5], ["Fachkraft, 5 Jahre Erfahrung", 3]];
const PHASES = ["Analyse", "Entwurf", "Realisierung", "Test", "Einführung"];
const SMALL = ["Anforderungen klären", "Design", "Backend", "Frontend", "Testdaten", "Integration", "Schulung", "Abnahme"];

function gen(seed) {
  const R = mk(rng(seed)), cal = R.r() < 0.6;
  const A = [];
  /* A1 Netzplan */
  const tpl = (() => { const tot = NETS.reduce((s, t) => s + t.w, 0); let x = R.r() * tot; return NETS.find(t => (x -= t.w) < 0) || NETS[0]; })();
  let nodes, res;
  for (let tries = 0; tries < 200; tries++) {
    nodes = tpl.v.map(([name, a, b, pre]) => ({ name, d: R.int(a, b), pre: pre.map(p => p - 1) }));
    res = cpm(nodes, cal);
    const crit = res.R.map((r, i) => i).filter(i => res.R[i].krit), dmax = Math.max(...crit.map(i => nodes[i].d));
    const okLong = crit.filter(i => nodes[i].d === dmax).length === 1, slack = res.R.filter(r => r.GP >= 2).length >= 2;
    if (okLong && slack) break;
  }
  const start = new Date(Date.UTC(2027, R.int(2, 9), R.int(1, 28)));
  const day = k => new Date(start.getTime() + (k - 1) * 864e5);
  const fd = k => { const d = day(k); return `${d.getUTCDate()}.${d.getUTCMonth() + 1}.`; };
  const fmt = k => cal ? fd(k) : String(k);
  const kind = cal ? "date" : "num", unit = cal ? "Tage" : "ZE";
  const { R: N, PE } = res, idx = nodes.map((_, i) => i);
  const crit = idx.filter(i => N[i].krit), non = idx.filter(i => !N[i].krit && N[i].GP >= 1);
  const longC = crit.reduce((b, i) => nodes[i].d > nodes[b].d ? i : b, crit[0]);
  const lab = i => `${i + 1} ${nodes[i].name}`;
  const xS = R.pick(non), xD = R.pick(non.filter(i => i !== xS).length ? non.filter(i => i !== xS) : non), kD = R.int(1, N[xD].GP + 4);
  const longN = idx.filter(i => !N[i].krit).reduce((b, i) => b < 0 || nodes[i].d > nodes[b].d ? i : b, -1);
  const shortC = crit.filter(i => i !== longC && nodes[i].d < nodes[longC].d);
  const vOpts = R.shuffle([...new Set([longC, longN, R.pick(shortC.length ? shortC : crit), R.pick(non), 0].filter(i => i >= 0))]).slice(0, 4);
  if (!vOpts.includes(longC)) vOpts[0] = longC;
  const last = nodes.length - 1;
  const net = { nodes, res, cal, fmt, tpl };
  A.push({ title: "Netzplan", topic: "pmg-netz", net,
    intro: `<p>${esc(tpl.intro)} Für das Projekt „${esc(tpl.name)}“ wurde folgender Netzplan erstellt. ${cal ? `Projektstart ist am <b>${fd(1)}${start.getUTCFullYear()}</b>. Gerechnet wird in <b>Kalendertagen</b> wie in der Übung: jeder Tag zählt, Wochenenden und Feiertage müssen Sie nicht berücksichtigen. Ein Vorgang mit 1 Tag Dauer beginnt und endet am selben Tag; der Nachfolger beginnt am Tag danach.` : `Gerechnet wird in <b>abstrakten Zeiteinheiten (ZE)</b>. Das Projekt beginnt zum Zeitpunkt <b>0</b>; ein Nachfolger kann zum Zeitpunkt des frühesten Endes seines Vorgängers beginnen.`}</p>`,
    items: [
      { id: "1a", t: "table", pts: 16, topic: "pmg-netz", q: `Berechnen Sie den Netzplan: Tragen Sie für jeden Vorgang frühesten und spätesten Anfang und Ende sowie Gesamtpuffer (GP) und freien Puffer (FP) ein.${cal ? " Termine als Datum (z. B. 4.5.), Puffer in Tagen." : ""}`,
        cols: ["FAZ", "FEZ", "SAZ", "SEZ", "GP", "FP"], rows: idx.map(i => ({ label: `<b>${i + 1}</b> ${esc(nodes[i].name)} <small class="muted">(${nodes[i].d})</small>`, cells: [[N[i].FAZ, kind], [N[i].FEZ, kind], [N[i].SAZ, kind], [N[i].SEZ, kind], [N[i].GP, "num"], [N[i].FP, "num"]] })),
        why: `Vorwärtsrechnung: ${cal ? "FEZ = FAZ + Dauer − 1, der Nachfolger beginnt am Tag nach dem spätesten FEZ seiner Vorgänger." : "FEZ = FAZ + Dauer, der Nachfolger beginnt beim größten FEZ seiner Vorgänger."} Rückwärtsrechnung vom Projektende: ${cal ? "SAZ = SEZ − Dauer + 1, der Vorgänger endet spätestens am Tag vor dem kleinsten SAZ seiner Nachfolger." : "SAZ = SEZ − Dauer, SEZ des Vorgängers = kleinster SAZ der Nachfolger."} GP = SAZ − FAZ. FP = kleinster FAZ der Nachfolger − FEZ${cal ? " − 1" : ""}. Die vollständige Lösung steht im Netzplan oben.` },
      { id: "1b", t: "pick", pts: 4, topic: "pmg-netz", q: "Welche Vorgänge sind kritisch? Markieren Sie den kritischen Pfad.", opts: idx.map(i => String(i + 1)), a: crit,
        why: `Kritisch sind alle Vorgänge ohne Gesamtpuffer (GP = 0): <b>${crit.map(i => i + 1).join(" → ")}</b>. Sie bestimmen die Projektdauer.` },
      { id: "1c", t: "num", pts: 2, topic: "pmg-netz", q: `Wie lange dauert das Projekt (in ${unit})?`, a: PE, unit,
        why: cal ? `Vom ${fd(1)} bis ${fd(PE)} sind es <b>${PE} Tage</b> (der Starttag zählt mit).` : `Das späteste FEZ ist <b>${PE} ZE</b>.` },
      cal ? { id: "1d", t: "date", pts: 2, topic: "pmg-netz", q: "An welchem Datum endet das Projekt frühestens?", a: PE, fmt, why: `Das FEZ des letzten Vorgangs „${esc(nodes[last].name)}“ ist der <b>${fd(PE)}</b>.` }
          : { id: "1d", t: "num", pts: 2, topic: "pmg-netz", q: `Zu welchem Zeitpunkt kann der letzte Vorgang „${esc(nodes[last].name)}“ frühestens beginnen?`, a: N[last].FAZ, unit: "ZE", why: `FAZ = größtes FEZ seiner Vorgänger = <b>${N[last].FAZ}</b>.` },
      { id: "1e", t: kind, pts: 2, topic: "pmg-netz", q: `Wann muss Vorgang ${lab(xS)} spätestens beginnen, damit sich das Projektende nicht verschiebt?`, a: N[xS].SAZ, fmt, unit,
        why: `Das ist der späteste Anfang: SAZ = <b>${fmt(N[xS].SAZ)}</b> (FAZ ${fmt(N[xS].FAZ)} + Gesamtpuffer ${N[xS].GP}).` },
      { id: "1f", t: "num", pts: 3, topic: "pmg-netz", q: `Vorgang ${lab(xD)} verzögert sich um ${kD} ${cal ? (kD === 1 ? "Tag" : "Tage") : "ZE"}. Um wie viele ${unit} verschiebt sich dadurch das Projektende? (0, wenn gar nicht)`, a: Math.max(0, kD - N[xD].GP), unit,
        why: `Der Vorgang hat einen Gesamtpuffer von ${N[xD].GP}. ${kD <= N[xD].GP ? `Die Verzögerung von ${kD} wird vom Puffer aufgefangen, das Projektende bleibt: <b>0</b>.` : `Nur ${N[xD].GP} davon fängt der Puffer auf, das Projektende verschiebt sich um ${kD} − ${N[xD].GP} = <b>${kD - N[xD].GP}</b>.`}${kD > N[xD].FP ? ` Sein Nachfolger muss später beginnen, weil der freie Puffer nur ${N[xD].FP} ist.` : ""}` },
      { id: "1g", t: "one", pts: 3, topic: "pmg-netz", q: "Das Projekt soll kürzer werden. Welchen Vorgang schauen Sie sich zuerst an?", opts: vOpts.map(i => `${lab(i)} (${nodes[i].d} ${unit})`), a: vOpts.indexOf(longC),
        why: `Nur <b>kritische</b> Vorgänge verkürzen das Projekt; ein Vorgang mit Puffer bringt nichts, auch wenn er lang ist. Unter den kritischen nimmt man den, der <b>am längsten dauert</b>, weil dort am meisten herauszuholen ist: <b>${lab(longC)}</b> mit ${nodes[longC].d} ${unit}. Achtung: wird er stark verkürzt, kann ein anderer Pfad kritisch werden.` },
      { id: "1h", t: "text", pts: 4, topic: "pmg-netz", need: 4, q: "Mit welchen Maßnahmen können Sie einen kritischen Vorgang verkürzen? Worauf müssen Sie danach achten?",
        model: "<b>Ressourcen erhöhen</b>: mehr Personal, Überstunden, leistungsfähigere Maschinen, externe Hilfe. <b>Parallelisieren</b>: Arbeiten, die nacheinander laufen, gleichzeitig durchführen (Abhängigkeiten prüfen). <b>Engpässe beseitigen</b>, z. B. frühere Materiallieferung. <b>Umfang reduzieren</b>, wenn das Ergebnis trotzdem reicht. Danach den Netzplan <b>neu rechnen</b>: der kritische Pfad kann sich ändern.",
        kp: [kp("Mehr Personal / Ressourcen / externe Hilfe", "personal", "ressourc", "mitarbeit", "extern", "leute"), kp("Überstunden", "überstund", "uberstund", "mehrarbeit"), kp("Parallelisieren", "parallel", "gleichzeitig"), kp("Leistungsfähigere Betriebsmittel, Engpässe beseitigen", "maschin", "betriebsmittel", "engpass", "bottleneck", "werkzeug", "lieferung"), kp("Umfang oder Qualität reduzieren", "umfang", "reduzier", "qualität", "qualitat", "weniger"), kp("Danach neu rechnen: kritischer Pfad kann sich ändern", "pfad", "neu rechnen", "ändern", "andern")] }
    ] });

  /* A2 Kritischer Pfad ohne Netzplan */
  let sm, sr;
  for (let tries = 0; tries < 200; tries++) {
    sm = []; const n = 7;
    for (let i = 0; i < n; i++) { const pre = i === 0 ? [] : [...new Set([i - 1 - Math.floor(R.r() * Math.min(i, 2)), ...(i > 1 && R.r() < 0.45 ? [R.int(0, i - 2)] : [])])].sort((a, b) => a - b); sm.push({ name: SMALL[i], d: R.int(2, 9), pre }); }
    const succ = sm.map(() => 0); sm.forEach(v => v.pre.forEach(p => succ[p]++));
    for (let i = 0; i < n - 1; i++) if (!succ[i]) { const j = R.int(i + 1, n - 1); if (!sm[j].pre.includes(i)) { sm[j].pre.push(i); sm[j].pre.sort((a, b) => a - b); } }
    sm[0].pre = []; sr = cpm(sm, false);
    if (sr.R.filter(r => !r.krit).length >= 2 && sr.R.filter(r => r.krit).length >= 3) break;
  }
  const L = i => String.fromCharCode(65 + i), smNon = sm.map((_, i) => i).filter(i => !sr.R[i].krit), xG = R.pick(smNon);
  const smCrit = sm.map((_, i) => i).filter(i => sr.R[i].krit);
  A.push({ title: "Kritischer Pfad ohne Netzplan", topic: "pmg-netz",
    intro: `<p>Ein kleines Softwareprojekt besteht aus diesen Vorgängen (Dauer in Zeiteinheiten). Bestimmen Sie die Lösungen <b>direkt aus der Angabe</b>, ohne einen Netzplan zu zeichnen.</p>${TW(`<table class="dt alt-tab alt-narrow"><tr><th>Vorgang</th><th>Beschreibung</th><th>Dauer</th><th>Vorgänger</th></tr>${sm.map((v, i) => `<tr><td><b>${L(i)}</b></td><td>${v.name}</td><td>${v.d}</td><td>${v.pre.length ? v.pre.map(L).join(", ") : "–"}</td></tr>`).join("")}</table>`)}`,
    items: [
      { id: "2a", t: "pick", pts: 5, topic: "pmg-netz", q: "Welche Vorgänge liegen auf dem kritischen Pfad?", opts: sm.map((_, i) => L(i)), a: smCrit,
        why: `Alle Wege vom Start zum Ende durchgehen und die Dauern addieren; der längste Weg ist kritisch: <b>${smCrit.map(L).join(" → ")}</b> mit ${sr.PE} ZE. ${solSmall(sm, sr, L)}` },
      { id: "2b", t: "num", pts: 3, topic: "pmg-netz", q: "Wie lange dauert das Projekt mindestens?", a: sr.PE, unit: "ZE", why: `Länge des kritischen Pfades: ${smCrit.map(i => sm[i].d).join(" + ")} = <b>${sr.PE} ZE</b>.` },
      { id: "2c", t: "num", pts: 2, topic: "pmg-netz", q: `Wie groß ist der Gesamtpuffer von Vorgang ${L(xG)}?`, a: sr.R[xG].GP, unit: "ZE", why: `GP = SAZ − FAZ = ${sr.R[xG].SAZ} − ${sr.R[xG].FAZ} = <b>${sr.R[xG].GP} ZE</b>.` }
    ] });

  /* A3 Aufwandsschätzung */
  let pcts; do { pcts = PHASES.slice(1).map(() => R.int(8, 32)); pcts.push(100 - pcts.reduce((a, b) => a + b, 0)); } while (pcts[4] < 8 || pcts[4] > 34); pcts = R.shuffle(pcts);
  const base = R.int(6, 30), known = R.int(0, 4), ask = R.shuffle([0, 1, 2, 3, 4].filter(i => i !== known)).slice(0, 2);
  const team = R.shuffle(NAMES).slice(0, 4).map((nm, i) => { const lv = R.shuffle(LEVEL)[0]; return { nm, lv }; });
  const truth = R.int(30, 70);
  team.forEach(p => { const spread = [0.45, 0.35, 0.15, 0.1, 0.25][LEVEL.indexOf(p.lv)]; p.e = Math.max(5, Math.round(truth * (1 + (R.r() * 2 - 1) * spread))); });
  const wsum = team.reduce((s, p) => s + p.lv[1], 0), wmean = team.reduce((s, p) => s + p.lv[1] * p.e, 0) / wsum, mean = team.reduce((s, p) => s + p.e, 0) / team.length;
  A.push({ title: "Aufwandsschätzung", topic: "pmg-schaetz",
    intro: `<p><b>a) Prozentsatzmethode.</b> Aus früheren Projekten kennt Ihr Unternehmen die Aufteilung des Aufwands auf die Phasen. Im aktuellen Projekt ist die Phase <b>${PHASES[known]}</b> abgeschlossen und hat <b>${pcts[known] * base} Stunden</b> gedauert.</p>${TW(`<table class="dt alt-tab alt-narrow"><tr>${PHASES.map(p => `<th>${p}</th>`).join("")}</tr><tr>${pcts.map(p => `<td>${p} %</td>`).join("")}</tr></table>`)}
      <p><b>b) Schätzung in der Gruppe.</b> Vier Personen mit unterschiedlicher Erfahrung schätzen den Aufwand eines Arbeitspakets. Die Projektleitung gewichtet die Schätzungen nach Erfahrung und Qualifikation.</p>${TW(`<table class="dt alt-tab alt-narrow"><tr><th>Person</th><th>Hintergrund</th><th>Gewicht</th><th>Schätzung</th></tr>${team.map(p => `<tr><td>${p.nm}</td><td>${p.lv[0]}</td><td>${p.lv[1]}</td><td>${p.e} PT</td></tr>`).join("")}</table>`)}<small class="muted">PT = Personentage</small>`,
    items: [
      { id: "3a", t: "num", pts: 1.5, topic: "pmg-schaetz", q: "a) Wie viele Stunden entsprechen 1 % des Gesamtaufwands?", a: base, unit: "h", why: `${pcts[known] * base} h ÷ ${pcts[known]} % = <b>${base} h</b> pro Prozent.` },
      { id: "3b", t: "num", pts: 1.5, topic: "pmg-schaetz", q: "a) Wie hoch ist der Gesamtaufwand des Projekts?", a: base * 100, unit: "h", why: `${base} h × 100 = <b>${base * 100} h</b>.` },
      ...ask.map((k, j) => ({ id: "3c" + j, t: "num", pts: 1.5, topic: "pmg-schaetz", q: `a) Wie viel Aufwand ist für die Phase ${PHASES[k]} einzuplanen?`, a: base * pcts[k], unit: "h", why: `${pcts[k]} × ${base} h = <b>${base * pcts[k]} h</b>.` })),
      { id: "3d", t: "num", pts: 4, topic: "pmg-schaetz", tol: 0.06, q: "b) Berechnen Sie die gewichtete Schätzung (gewichteter Mittelwert, auf eine Nachkommastelle).", a: wmean, unit: "PT",
        why: `Σ(Gewicht × Schätzung) ÷ Σ Gewichte = (${team.map(p => `${p.lv[1]}·${p.e}`).join(" + ")}) ÷ ${wsum} = ${team.reduce((s, p) => s + p.lv[1] * p.e, 0)} ÷ ${wsum} = <b>${de(wmean, 1)} PT</b>.` },
      { id: "3e", t: "num", pts: 2, topic: "pmg-schaetz", tol: 0.06, q: "b) Zum Vergleich: Wie hoch wäre der einfache, ungewichtete Mittelwert?", a: mean, unit: "PT",
        why: `(${team.map(p => p.e).join(" + ")}) ÷ 4 = <b>${de(mean, 2)} PT</b>. Er gibt der unerfahrensten Person dasselbe Gewicht wie der erfahrensten.` },
      { id: "3f", t: "text", pts: 4, topic: "pmg-schaetz", need: 3, q: "c) Wie gehen Sie beim Schätzen in einer Gruppe vor, in der jede Person eine andere Qualifikation und Erfahrung hat? Begründen Sie.",
        model: "Jede Person schätzt zuerst <b>unabhängig</b>. Die Schätzungen werden <b>nach Erfahrung und Qualifikation gewichtet</b>; weniger Erfahrene bekommen nicht automatisch dasselbe Gewicht wie Erfahrene. Große Abweichungen werden <b>besprochen</b> und es wird ein Konsens gesucht. Besser sind <b>kleine Teile einzeln schätzen und summieren</b> als das Ganze auf einmal (Pölzseil-Experiment), mit <b>Erfahrungsdaten früherer Projekte</b> vergleichen und <b>mindestens zwei Schätzmethoden</b> anwenden.",
        kp: [kp("Schätzungen nach Erfahrung und Qualifikation gewichten", "gewicht"), kp("Jede Person schätzt zuerst unabhängig", "unabhängig", "unabhangig", "einzeln", "jede person", "jeder"), kp("Abweichungen besprechen, Konsens finden", "besprech", "diskut", "konsens", "abweich", "einig"), kp("In kleine Teile zerlegen und summieren", "teile", "arbeitspaket", "zerleg", "summ"), kp("Erfahrungsdaten nutzen / zwei Methoden anwenden", "erfahrungsdaten", "frühere", "fruhere", "vergangene", "zwei method", "2 method")] }
    ] });

  /* A4 Kennzahlen */
  const tp = ["Teilprojekt Hardware", "Teilprojekt Software", "Teilprojekt Schulung", "Teilprojekt Dokumentation"].slice(0, R.int(3, 4));
  let tt, ttm;
  for (let tries = 0; tries < 100; tries++) {
    tt = tp.map(name => { const plan = R.int(10, 60); const ist = Math.max(4, Math.round(plan * (0.75 + R.r() * 0.65))); return { name, plan, ist, v: plan / ist }; });
    ttm = tt.reduce((s, x) => s + x.v, 0) / tt.length; if (Math.abs(ttm - 1) >= 0.04 && tt.some(x => x.v > 1) && tt.some(x => x.v < 1)) break;
  }
  const fgRows = R.shuffle(FG).slice(0, 4);
  A.push({ title: "Kennzahlen und Projektkontrolle", topic: "pmg-kontr",
    intro: `<p>Für die Teilprojekte liegen geplante und tatsächliche Dauern vor (in Arbeitstagen). Runden Sie auf zwei Nachkommastellen.</p>${TW(`<table class="dt alt-tab alt-narrow"><tr><th>Teilprojekt</th><th>T<sub>Plan</sub></th><th>T<sub>Ist</sub></th></tr>${tt.map(x => `<tr><td>${x.name}</td><td>${x.plan}</td><td>${x.ist}</td></tr>`).join("")}</table>`)}`,
    items: [
      ...tt.map((x, j) => ({ id: "4a" + j, t: "num", pts: 6 / tt.length, topic: "pmg-kontr", tol: 0.011, q: `Termintreue TT<sub>TP</sub> für das ${x.name}`, a: x.v,
        why: `TT = T<sub>Plan</sub> ÷ T<sub>Ist</sub> = ${x.plan} ÷ ${x.ist} = <b>${de(x.v)}</b> (${x.v < 1 ? "kleiner 1: verspätet" : x.v > 1 ? "größer 1: schneller als geplant" : "genau im Plan"}).` })),
      { id: "4b", t: "num", pts: 2, topic: "pmg-kontr", tol: 0.011, q: "Termintreue des Gesamtprojekts", a: ttm, why: `Arithmetisches Mittel der Teilprojekte: (${tt.map(x => de(x.v)).join(" + ")}) ÷ ${tt.length} = <b>${de(ttm)}</b>.` },
      { id: "4c", t: "one", pts: 2, topic: "pmg-kontr", q: "Was bedeutet dieser Wert für das Gesamtprojekt?", opts: ["Das Projekt ist im Verzug (langsamer als geplant).", "Das Projekt liegt genau im Plan.", "Das Projekt ist schneller als geplant."], a: ttm < 1 ? 0 : 2,
        why: "Termintreue kleiner 1: die Ist-Dauer ist länger als geplant, also Verzug. Größer 1: schneller als geplant. Genau 1: Soll = Ist." },
      { id: "4d", t: "match", pts: 4, topic: "pmg-sach", q: "Ordnen Sie die Aussagen dem Verfahren zur Bestimmung des Fertigstellungsgrades zu.", choices: FGRAD.map(x => `${x[0].toUpperCase()}${x.slice(1)}er Fertigstellungsgrad`), rows: fgRows,
        why: "Relativ: prozentueller Anteil der Aufgabenerfüllung (Problem: „Fast-schon-fertig“-Syndrom). Absolut: nur ganz abgeschlossene Arbeitspakete zählen (Pakete müssen klein genug sein). Prozessbezogen: Anzahl der erreichten und abgenommenen Meilensteine (es braucht genug Meilensteine)." }
    ] });

  /* A5 Theorie: Kalkulation, Folie 117, Strukturplan, Meilensteine */
  let kRows; do { kRows = R.shuffle(KALK).slice(0, 4); } while (new Set(kRows.map(r => r[1])).size < 3);
  const fRows = R.shuffle(F117).slice(0, 5);
  const [ps1, ps2] = R.shuffle(PSP), pType = R.r() < 0.5 ? "O" : "P", apRows = R.shuffle(ps1.ap).slice(0, 6);
  const idType = R.int(0, 3), ms = R.pick(MS), msGood = R.shuffle(ms.good).slice(0, R.int(2, 3)), msBad = R.shuffle(ms.bad).slice(0, 6 - msGood.length), msOpts = R.shuffle([...msGood, ...msBad]);
  const TYPES = ["objektorientiert", "funktionsorientiert", "ablauforientiert", "Mischform"];
  A.push({ title: "Projektplanung: Kalkulation, Prozess, Struktur, Meilensteine", topic: "pmg-psp", items: [
      { id: "5a", t: "match", pts: 4, topic: "pmg-res", q: "Welche Arten der Kalkulation gibt es? Ordnen Sie die Beschreibungen zu.", choices: ["Vorkalkulation", "Mitkalkulation", "Nachkalkulation"], rows: kRows,
        why: "<b>Vorkalkulation</b>: Plan-Mengengerüst, wird mehrmals durchlaufen, Basis für Angebote. <b>Mitkalkulation</b>: laufender Plan-/Ist-Vergleich während des Projekts. <b>Nachkalkulation</b>: entspricht der letzten Mitkalkulation, Projektkostenanalyse und Erfahrungsdaten." },
      { id: "5b", t: "match", pts: 5, topic: "pmg-rollen", q: "Unterteilung des Entwicklungsprozesses (Folie 117): Ordnen Sie die Begriffe zu.", choices: F117T, rows: fRows,
        why: "Hierarchie: <b>Prozess → Prozessabschnitt → Prozessphase → Prozessschritt</b>. <b>Prozesszweige</b> sind parallel durchgeführte Prozessphasen. <b>Meilenstein</b>: Zeitpunkt der Fertigstellung besonders wichtiger Tätigkeiten. Besonders wichtige Ergebnisse der <b>Arbeitspakete</b>, die beim Erreichen des Meilensteins vorliegen, heißen <b>Baseline</b>." },
      { id: "5c", t: "one", pts: 2, topic: "pmg-psp", q: `Welche Art von Projektstrukturplan ist das?${pspTree(ps2, idType)}`, opts: TYPES, a: idType,
        why: `Objektorientiert gliedert nach den <b>Bestandteilen</b> des Produkts (${ps2.O.join(", ")}), funktionsorientiert nach <b>Entwicklungsfunktionen</b> (${ps2.F.join(", ")}), ablauforientiert nach der <b>Reihenfolge</b> der Phasen (${ps2.P.join(", ")}). Eine Mischform kombiniert zwei Arten auf verschiedenen Ebenen.` },
      { id: "5d", t: "match", pts: 6, topic: "pmg-psp", q: `Sie erstellen für das Projekt „${ps1.p}“ einen <b>${pType === "O" ? "objektorientierten" : "ablauforientierten"}</b> Projektstrukturplan. Die zweite Ebene lautet: ${ps1[pType].map(x => `<b>${x}</b>`).join(" · ")}. Ordnen Sie die Arbeitspakete dem richtigen Element zu.`,
        choices: ps1[pType], rows: apRows.map(a => [a[0], pType === "O" ? a[1] : a[2]]),
        why: pType === "O" ? "Objektorientiert: Jedes Arbeitspaket kommt zu dem <b>Teil des Produkts</b>, an dem gearbeitet wird, egal in welcher Phase." : "Ablauforientiert: Jedes Arbeitspaket kommt in die <b>Phase</b>, in der es erledigt wird, egal welchen Teil des Produkts es betrifft." },
      { id: "5e", t: "multi", pts: 4, topic: "pmg-pm", q: `${ms.p} Welche der folgenden Punkte eignen sich als <b>Meilensteine</b>?`, opts: msOpts, a: msOpts.map((o, i) => msGood.includes(o) ? i : -1).filter(i => i >= 0),
        why: `Ein Meilenstein ist ein <b>Zeitpunkt</b>, an dem ein <b>definiertes, überprüfbares Ergebnis</b> vorliegt (oft mit Abnahme oder Entscheidung). Geeignet: ${msGood.map(x => `„${x}“`).join(", ")}. Laufende Tätigkeiten, Stimmungen oder vage Zustände sind nicht überprüfbar.` },
      { id: "5f", t: "text", pts: 3, topic: "pmg-pm", need: 3, q: "Warum setzen Sie genau diese Meilensteine? Was muss ein Meilenstein erfüllen?",
        model: "Ein Meilenstein ist die <b>Kombination aus Zeit und Inhalt</b>: ein <b>Termin</b> (in der Planung festgelegt) und ein <b>definiertes (Teil-)Ergebnis</b>, das man erreichen will. Das Ergebnis muss <b>wesentlich für den Projekterfolg</b>, im Voraus definierbar, <b>überprüfbar</b> und eindeutig sein. Meilensteine liegen oft am <b>Ende einer Phase</b> und sind Entscheidungspunkte (Abnahme, weitermachen oder nicht).",
        kp: [kp("Kombination aus Zeit/Termin und Inhalt/Ergebnis", "termin", "zeit", "datum"), kp("Definiertes Ergebnis, das erreicht werden soll", "ergebnis", "ziel", "erreich", "inhalt"), kp("Überprüfbar und eindeutig", "überprüf", "uberpruf", "prüfbar", "messbar", "eindeutig"), kp("Wichtig für den Projekterfolg / Phasenende / Entscheidungspunkt", "wichtig", "wesentlich", "phase", "entscheid", "abnahme")] }
    ] });

  /* A6 Bonus */
  const dk = (() => { const t = R.shuffle(DOKU.filter(d => d[1])).slice(0, R.int(3, 4)), f = R.shuffle(DOKU.filter(d => !d[1])).slice(0, 6 - t.length); return R.shuffle([...t, ...f]); })();
  const th = R.shuffle(THEO).slice(0, 2);
  A.push({ title: "Zusatzfragen", bonus: true, topic: "pmg-info", intro: `<p>Bonusfragen: Sie können damit Punkte aus anderen Aufgaben ausgleichen. Mehr als ${LIMIT} Punkte gibt es nicht.</p>`, items: [
      { id: "6a", t: "multi", pts: 5, topic: "pmg-info", q: "Projektdokumentation: Welche Aussagen sind richtig?", opts: dk.map(d => d[0]), a: dk.map((d, i) => d[1] ? i : -1).filter(i => i >= 0),
        why: "Zur Projektdokumentation gehören alle Dokumente zum Projektgeschehen; ohne vollständige, aktuelle Dokumentation kann das PM nicht wirksam arbeiten. Voraussetzungen: Dokumentationsordnung, Projekttagebuch, Ordnungsschemata (fest vorgegeben, frei, Auswahlordnung aus einer Maximalmenge). Projekttagebuch: an keine Form gebunden, gebunden geführt, Einträge nicht löschbar, für jeden einsehbar, eine Person zuständig, alle dürfen eintragen." },
      ...th.map((x, j) => ({ id: "6b" + j, t: "text", pts: 5, topic: x.topic, need: x.need, q: x.q, model: x.model, kp: x.kp }))
    ] });

  A.forEach(a => a.pts = a.items.reduce((s, it) => s + it.pts, 0));
  return { seed, cal, A, net, start: fd(1) + start.getUTCFullYear() };
}
function solSmall(sm, sr, L) {
  return TW(`<table class="dt alt-tab alt-narrow"><tr><th></th><th>FAZ</th><th>FEZ</th><th>SAZ</th><th>SEZ</th><th>GP</th></tr>${sm.map((v, i) => { const r = sr.R[i]; return `<tr${r.krit ? ' class="px-crit"' : ""}><td><b>${L(i)}</b></td><td>${r.FAZ}</td><td>${r.FEZ}</td><td>${r.SAZ}</td><td>${r.SEZ}</td><td>${r.GP}</td></tr>`; }).join("")}</table>`);
}
function pspTree(ps, type) {
  const root = `<div class="px-psp-root">${ps.p}</div>`;
  const kids = type === 3 ? ps.P.map(p => `<div class="px-psp-n">${p}<div class="px-psp-sub">${ps.O.map(o => `<span>${o}</span>`).join("")}</div></div>`).join("")
    : (type === 0 ? ps.O : type === 1 ? ps.F : ps.P).map(x => `<div class="px-psp-n">${x}</div>`).join("");
  return `<div class="px-psp">${root}<div class="px-psp-l2">${kids}</div></div>`;
}

/* ---------- Netzplan zeichnen ---------- */
function drawNet(net, solved) {
  const { nodes, res, fmt, cal } = net, n = nodes.length, lvl = [];
  nodes.forEach((v, i) => lvl[i] = v.pre.length ? Math.max(...v.pre.map(p => lvl[p])) + 1 : 0);
  for (let i = n - 1; i >= 0; i--) if (res.succ[i].length) lvl[i] = Math.max(lvl[i], Math.min(...res.succ[i].map(j => lvl[j])) - 1); // Knoten mit Puffer nach rechts rücken: kürzere Pfeile
  const cols = []; nodes.forEach((v, i) => (cols[lvl[i]] = cols[lvl[i]] || []).push(i));
  const W = 168, H = 66, GX = 46, GY = 22, pos = [];
  cols.forEach((c, x) => {
    if (x) c.sort((a, b) => avg(nodes[a].pre.map(p => pos[p].row)) - avg(nodes[b].pre.map(p => pos[p].row)));
    c.forEach((i, k) => pos[i] = { col: x, row: k });
  });
  const maxRows = Math.max(...cols.map(c => c.length));
  cols.forEach(c => { const off = (maxRows - c.length) / 2; c.forEach(i => pos[i].row += off); });
  const X = i => 10 + pos[i].col * (W + GX), Y = i => 10 + pos[i].row * (H + GY);
  const w = 20 + cols.length * (W + GX) - GX, h = 20 + maxRows * (H + GY) - GY;
  const R = res.R, v = (i, k) => solved ? (k === "GP" || k === "FP" ? R[i][k] : fmt(R[i][k])) : "";
  let s = `<svg class="px-net" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Netzplan"><defs><marker id="pxa" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" class="px-ah"/></marker><marker id="pxac" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" class="px-ahc"/></marker></defs>`;
  nodes.forEach((nd, j) => nd.pre.forEach(i => {
    const x1 = X(i) + W, y1 = Y(i) + H / 2, x2 = X(j), y2 = Y(j) + H / 2, mx = (x1 + x2) / 2;
    const c = solved && R[i].krit && R[j].krit && R[j].FAZ === R[i].FEZ + (cal ? 1 : 0);
    s += `<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2 - 2},${y2}" class="px-e${c ? " c" : ""}" marker-end="url(#${c ? "pxac" : "pxa"})"/>`;
  }));
  nodes.forEach((nd, i) => {
    const x = X(i), y = Y(i), c = solved && R[i].krit, cw = W / 3, qw = W / 4, nm = nd.name.length > 24 ? nd.name.slice(0, 23) + "…" : nd.name;
    s += `<g class="px-n${c ? " c" : ""}"><rect x="${x}" y="${y}" width="${W}" height="${H}" rx="4"/>
      <line x1="${x}" y1="${y + 18}" x2="${x + W}" y2="${y + 18}"/><line x1="${x}" y1="${y + 46}" x2="${x + W}" y2="${y + 46}"/>
      <line x1="${x + cw}" y1="${y}" x2="${x + cw}" y2="${y + 18}"/><line x1="${x + 2 * cw}" y1="${y}" x2="${x + 2 * cw}" y2="${y + 18}"/>
      ${[1, 2, 3].map(k => `<line x1="${x + k * qw}" y1="${y + 46}" x2="${x + k * qw}" y2="${y + H}"/>`).join("")}
      <text x="${x + cw / 2}" y="${y + 13}" class="px-v">${v(i, "FAZ") || "FAZ"}</text><text x="${x + 1.5 * cw}" y="${y + 13}" class="px-v px-d">D ${nd.d}</text><text x="${x + 2.5 * cw}" y="${y + 13}" class="px-v">${v(i, "FEZ") || "FEZ"}</text>
      <text x="${x + 6}" y="${y + 36}" class="px-nm"><tspan class="px-nr">${i + 1}</tspan> ${esc(nm)}</text>
      <text x="${x + qw / 2}" y="${y + 60}" class="px-v">${v(i, "SAZ") || "SAZ"}</text><text x="${x + 1.5 * qw}" y="${y + 60}" class="px-v">${solved ? "GP " + R[i].GP : "GP"}</text><text x="${x + 2.5 * qw}" y="${y + 60}" class="px-v">${solved ? "FP " + R[i].FP : "FP"}</text><text x="${x + 3.5 * qw}" y="${y + 60}" class="px-v">${v(i, "SEZ") || "SEZ"}</text></g>`;
  });
  return `<div class="alt-tw px-netw">${s}</svg></div><small class="muted">${solved ? "Lösung: kritische Vorgänge und Pfeile sind hervorgehoben. " : ""}Knoten: oben FAZ · Dauer · FEZ, unten SAZ · GP · FP · SEZ.${cal ? " Termine als Datum (Tag.Monat.)." : " Werte in ZE."}</small>`;
}
const avg = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;

/* ---------- Bewertung ---------- */
const norm = s => { let t = String(s == null ? "" : s).trim().replace(/\s+/g, "").replace(/[a-zäöü%]+$/i, ""); if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, ""); return t.replace(",", "."); };
function okNum(it, raw, a = it.a) { const t = norm(raw); if (t === "" || isNaN(+t)) return false; const tol = it.tol != null ? it.tol : Math.max(0.011, Math.abs(a) * 0.002); return Math.abs(+t - a) <= tol + 1e-9; }
function okDate(net, raw, k) { const m = String(raw || "").trim().match(/^(\d{1,2})\s*\.\s*(\d{1,2})\s*\.?\s*(\d{2,4})?$/); if (!m) return false; const want = net.fmt(k).split("."); return +m[1] === +want[0] && +m[2] === +want[1]; }
const ansd = (it, a) => a != null && (it.t === "table" ? Object.values(a).some(x => String(x).trim() !== "") : Array.isArray(a) ? (it.t === "match" ? a.some(x => x >= 0) : a.length > 0) : String(a).trim() !== "");
function autoKP(it, a) { const t = String(a || "").toLowerCase(); return it.kp.map(k => !!t && k.k.some(w => t.includes(w))); }
function ticks(it, a, self) { return self && self[it.id] ? self[it.id] : autoKP(it, a); }
function cellOK(ex, it, r, c, raw) { const [a, kd] = it.rows[r].cells[c]; return kd === "date" ? okDate(ex.net, raw, a) : okNum({ tol: 0 }, raw, a); }
function score(ex, it, a, self) {
  if (!ansd(it, a)) return 0;
  switch (it.t) {
    case "num": return okNum(it, a) ? it.pts : 0;
    case "date": return okDate(ex.net, a, it.a) ? it.pts : 0;
    case "one": return a === it.a ? it.pts : 0;
    case "multi": case "pick": { const hit = a.filter(i => it.a.includes(i)).length, bad = a.length - hit; return Math.max(0, it.pts * (hit - bad) / it.a.length); }
    case "match": return it.pts * it.rows.filter((r, i) => a[i] === r[1]).length / it.rows.length;
    case "table": { let ok = 0, tot = 0; it.rows.forEach((row, r) => row.cells.forEach((_, c) => { tot++; if (cellOK(ex, it, r, c, a[r + ":" + c])) ok++; })); return it.pts * ok / tot; }
    case "text": { const t = ticks(it, a, self).filter(Boolean).length; return it.pts * Math.min(1, t / it.need); }
  }
  return 0;
}

/* ---------- Darstellung ---------- */
function itemHTML(ex, it, a, mode, self) {
  const rv = mode === "review", dis = rv ? " disabled" : "";
  let body = "";
  const inp = (val, ok, w, ph) => `<input type="text" class="px-in${rv ? (ok ? " ok" : " no") : ""}" inputmode="${ph === "date" ? "text" : "decimal"}" value="${esc(val || "")}" placeholder="${ph === "date" ? "T.M." : ""}" autocomplete="off"${w ? ` style="width:${w}px"` : ""}${dis}`;
  if (it.t === "num" || it.t === "date") {
    const ok = it.t === "num" ? okNum(it, a) : okDate(ex.net, a, it.a);
    body = `<label class="px-num">${inp(a, ok, 130, it.t)} data-id="${it.id}"><span class="muted">${it.t === "date" ? "Datum" : esc(it.unit || "")}</span></label>`;
  } else if (it.t === "table") {
    const A = a || {};
    body = TW(`<table class="dt alt-tab px-tab"><tr><th>Vorgang</th>${it.cols.map(c => `<th>${c}</th>`).join("")}</tr>${it.rows.map((row, r) => `<tr><td>${row.label}</td>${row.cells.map((cell, c) => { const raw = A[r + ":" + c], ok = cellOK(ex, it, r, c, raw);
      return `<td>${inp(raw, ok, cell[1] === "date" ? 62 : 44, cell[1])} data-id="${it.id}" data-c="${r}:${c}">${rv && !ok ? `<small class="px-sol">${cell[1] === "date" ? ex.net.fmt(cell[0]) : cell[0]}</small>` : ""}</td>`; }).join("")}</tr>`).join("")}</table>`);
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
    ${p.intro ? `<div class="alt-text">${p.intro}</div>` : ""}${p.net ? drawNet(p.net, rv) : ""}
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
  root.addEventListener("change", e => {
    const t = e.target;
    if (t.matches("select[data-r]")) { const it = items[t.dataset.id]; const v = it.rows.map((_, i) => +$(`select[data-id="${it.id}"][data-r="${i}"]`, root).value); set(it.id, v.some(x => x >= 0) ? v : null); }
  });
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
    const box = t.closest(".px-it"); $(".px-got", box).textContent = `${fmtP(score(ex, it, run.ans[id], run.self))} von ${fmtP(it.pts)} P.`;
    after && after();
  });
}

/* ---------- Seiten ---------- */
const st = () => S().pmexam || (S().pmexam = {});
const newSeed = () => (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
function intro(el) {
  const s = st(), hist = (S().exams || []).filter(x => x.course === "pmgt" && x.kind === "sim").slice(-5).reverse(), run = s.run;
  el.innerHTML = `<div class="page"><header><span class="eyebrow">Projektmanagement · Prüfungstrainer</span><h1>Prüfungssimulator GL-PMGT</h1><p class="muted" style="margin-top:6px;max-width:72ch">Aufgebaut wie die schriftliche Prüfung bei Prof. Fritz: ein vorgegebener <b>Netzplan</b> zum Durchrechnen, der <b>kritische Pfad direkt aus der Angabe</b>, <b>Schätzen</b> (Prozentsatzmethode, gewichtete Gruppenschätzung), <b>Termintreue</b> und Fertigstellungsgrad, <b>Kalkulationsarten</b>, <b>Folie 117</b>, <b>Strukturplan</b> und <b>Meilensteine</b>. Dazu Bonusfragen, mit denen du Punkte ausgleichen kannst. Jeder Versuch hat <b>neue Zahlen</b>: andere Dauern, anderes Startdatum, andere Fallbeispiele, mal Kalendertage, mal abstrakte Zeiteinheiten.</p></header>
    ${run ? `<div class="callout"><b>Ein Versuch läuft noch</b> (${run.mode === "exam" ? "Prüfungsmodus" : "Lernmodus"}${run.tEnd ? `, noch ${Math.max(0, Math.round((run.tEnd - Date.now()) / 60000))} Minuten` : ""}).<div class="row" style="margin-top:8px"><button class="btn pri" id="px-cont">Fortsetzen</button><button class="btn ghost" id="px-drop">Verwerfen</button></div></div>` : ""}
    <div class="grid g2">
      <section class="card col"><h3>Prüfungsmodus</h3><p><b>${MINUTES} Minuten</b>, 100 Punkte plus Bonus, Auswertung erst nach der Abgabe. Taschenrechner ist erlaubt, Unterlagen nicht. Notenschlüssel der VO: ab 91 Sehr gut, ab 81 Gut, ab 71 Befriedigend, ab 61 Genügend.</p>
        <label class="fld">Netzplan rechnen in<select id="px-cal"><option value="">Zufall (wie in der Prüfung möglich)</option><option value="1"${s.cal === "1" ? " selected" : ""}>Kalendertagen (Datum)</option><option value="0"${s.cal === "0" ? " selected" : ""}>abstrakten Zeiteinheiten</option></select></label>
        <div class="row"><button class="btn pri" id="px-exam">Prüfung starten</button></div></section>
      <section class="card col"><h3>Lernmodus</h3><p>Ohne Zeitlimit. Jede Aufgabe kannst du einzeln prüfen und bekommst den Lösungsweg, beim Netzplan die fertig gerechnete Zeichnung mit kritischem Pfad.</p>
        <div class="row"><button class="btn" id="px-learn">Lernmodus starten</button><button class="btn ghost" data-go="lesson" data-p="pmg3-3">Netzplantechnik wiederholen</button></div></section>
    </div>
    <small class="muted">Die Punkteverteilung und die ${MINUTES} Minuten sind geschätzt. Bekannt ist: rund 5 Aufgaben mit Unterfragen, 100 Punkte, Bonusfragen.</small>
    <section class="card col"><h3>Deine Versuche</h3>${hist.length ? hist.map(x => `<div class="spread"><span class="tab">${fmtP(x.total)} / ${x.max} P. · ${grade(100 * x.total / x.max)}</span><small>${new Date(x.ts).toLocaleDateString("de-AT")}</small></div>`).join(`<div class="divider"></div>`) : `<p class="muted">Noch keiner.</p>`}</section>
    <div class="row"><button class="btn ghost" data-go="exam">← Zurück zum Prüfungstrainer</button></div></div>`;
  $("#px-cal", el).onchange = e => { s.cal = e.target.value; App.save(); };
  const start = mode => { let seed = newSeed(); if (s.cal) for (let i = 0; i < 60 && String(+gen(seed).cal) !== s.cal; i++) seed = newSeed();
    s.run = { seed, mode, ans: {}, self: {}, checked: {}, tEnd: mode === "exam" ? Date.now() + MINUTES * 60000 : 0 }; App.save(); attempt(el); };
  $("#px-exam", el).onclick = () => start("exam"); $("#px-learn", el).onclick = () => start("learn");
  if (run) { $("#px-cont", el).onclick = () => attempt(el); $("#px-drop", el).onclick = () => { if (confirm("Diesen Versuch verwerfen?")) { delete s.run; App.save(); intro(el); } }; }
}

function attempt(el) {
  const s = st(), run = s.run, learn = run.mode === "learn"; let tmr, done = false;
  if (run.tEnd && Date.now() >= run.tEnd) return finish(el);
  const ex = gen(run.seed);
  const head = `${learn ? "Lernmodus" : "Prüfungsmodus"} · ${ex.cal ? "Kalendertage" : "Zeiteinheiten"}`;
  el.innerHTML = `<div class="page alt-page px-page"><div class="spread alt-head"><div><span class="eyebrow">Projektmanagement · Prüfungssimulator · ${head}</span><h1>${ex.A.length} Aufgaben · 100 Punkte + Bonus</h1></div><div class="row">${run.tEnd ? `<span class="chip warn tab" id="px-clk"></span>` : ""}<button class="btn pri" id="px-sub">${learn ? "Auswerten" : "Abgeben"}</button></div></div>
    <nav class="alt-nav">${ex.A.map((p, k) => `<a href="#aq-${k}" data-n="${k}">A${k + 1}</a>`).join("")}</nav>
    <div class="col" style="gap:14px" id="px-qs">${ex.A.map((p, k) => partHTML(ex, k, run, run.checked[k] ? "review" : run.mode)).join("")}</div>
    <div class="row"><button class="btn pri" id="px-sub2">${learn ? "Auswerten" : "Abgeben"}</button><button class="btn ghost" id="px-pause">Pausieren</button></div></div>`;
  const qs = $("#px-qs", el);
  const sync = () => $$(".alt-nav a", el).forEach(a => { const k = +a.dataset.n; a.classList.toggle("on", ex.A[k].items.some(it => ansd(it, run.ans[it.id]))); a.classList.toggle("chk", !!run.checked[k]); });
  const psum = k => { const c = $("#aq-" + k, el), b = c && $(".px-psum", c); if (b) b.textContent = `${fmtP(partPts(ex, k, run))} / ${fmtP(ex.A[k].pts)} P.`; };
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
  const ex = gen(run.seed);
  const rec = { ts: Date.now(), course: "pmgt", kind: "sim", total: 0, max: LIMIT, seed: run.seed, weak: [] };
  const upd = () => { const { raw, total } = totals(ex, run); rec.total = total; rec.weak = [...new Set(ex.A.flatMap(p => p.items).filter(it => score(ex, it, run.ans[it.id], run.self) < it.pts - 1e-9).map(it => it.topic))]; App.save(); return { raw, total }; };
  ex.A.flatMap(p => p.items).forEach(it => App.rec(it.topic, score(ex, it, run.ans[it.id], run.self) / it.pts));
  (S().exams || (S().exams = [])).push(rec); const t0 = upd();
  App.addXP(20 + Math.round(t0.total / LIMIT * 40), "exam");
  const done = { ...run }; delete s.run; s.last = done; App.save();
  render(el, ex, done, rec, upd);
}
function render(el, ex, run, rec, upd) {
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

/* ---------- Einhängen: Prüfungstrainer, Prüfung üben, Kursseite ---------- */
const cta = () => `<button class="card prep-cta alt-cta" data-go="exam" data-p="pmexam"><div><span class="eyebrow">Prüfungssimulator</span><div class="lrow-t">Prüfung wie bei Prof. Fritz, jedes Mal mit neuen Zahlen</div><small>Netzplan durchrechnen · kritischer Pfad · Schätzen · Termintreue · Folie 117 · Strukturplan · Meilensteine · Bonus${st().run ? " · ein Versuch läuft" : ""}</small></div><span class="alt-go">→</span></button>`;
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
App.PMEXAM = { gen, cpm, score, totals, grade, drawNet };
})();
