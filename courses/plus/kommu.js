/* KOMMU · Plus: Animationen der Kommunikationsmodelle, Praxisbeispiele (gut/ungünstig), zusätzliche Fragen und Karteikarten.
   Alle Dialoge sind erfundene Übungssituationen aus dem IT-Berufsalltag. KI ist in KOMMU für bewertete Arbeiten verboten:
   Diese Texte sind reines Lernmaterial und niemals als Portfolio- oder Deep-Talk-Abgabe zu verwenden. */
(function () {
const FIG = window.STUDYOS_FIG = window.STUDYOS_FIG || {};
const FX = window.FX; if (!FX) return;
const { svg, g, t, tl, r, box, l, p, dot, user } = FX;

/* ---------- 1 · Sender–Empfänger-Modell + Lorenz-Kette ---------- */
const CHAIN = ["gesagt", "gehört", "verstanden", "einverstanden", "behalten", "angewandt"];
FIG["kommu-sender"] = { title: "Vom Gedanken zur Wirkung: das Sender-Empfänger-Modell",
  svg: () => svg(640, 300,
    user(48, 112) + t(48, 146, "Senderin", { fs: 11.5, fw: 600 }) +
    g({ st: 0 }, box(92, 40, 110, 30, "Gedanke", { cls: "fx-mute", fs: 11.5 }) + l(147, 70, 147, 90, { arrow: true })) +
    box(92, 92, 110, 40, "codieren", { cls: "fx-soft", fs: 12 }) + t(147, 146, "Worte, Ton, Gestik", { fs: 10, cls: "fx-sub" }) +
    g({ st: 1 }, l(204, 112, 434, 112, { cls: "acc", arrow: true, acc: true, flow: true }) + dot("M204 112 L434 112", { dur: 2.4 }) +
      t(319, 132, "Kanal / Medium", { fs: 11.5, fw: 600 }) + t(319, 148, "Gespräch · E-Mail · Chat · Telefon", { fs: 10.5, cls: "fx-sub" }) +
      user(592, 112) + t(592, 146, "Empfängerin", { fs: 11.5, fw: 600 })) +
    g({ st: 2 }, FX.cloud(318, 60, 1.25, { cls: "fx-warn" }) + t(318, 64, "Störung", { fs: 11.5, fw: 700 }) +
      l(318, 76, 318, 104, { cls: "warn", arrow: true }) + t(400, 40, "Lärm, Ausfall, Jargon", { fs: 10.5, cls: "fx-sub", a: "start" })) +
    g({ st: 3 }, box(436, 92, 110, 40, "decodieren", { cls: "fx-soft", fs: 12, hl: 3 }) + t(491, 146, "eigene Erfahrung", { fs: 10, cls: "fx-sub" })) +
    g({ st: 4 }, p("M592 160 C592 200 48 200 48 160", { cls: "ok dash", arrow: true }) + t(320, 214, "Rückkopplung (Feedback): „Habe ich dich richtig verstanden?“", { fs: 11.5, cls: "t-ok", fw: 600 })) +
    g({ st: 5 }, CHAIN.map((s, i) => box(14 + i * 104, 244, 92, 30, s, { cls: i === 5 ? "fx-acc" : "fx-card", fs: 11.5, fw: 600 }) + (i < 5 ? l(106 + i * 104, 259, 118 + i * 104, 259, { arrow: true }) : "")).join(""))),
  steps: [
    "Die Senderin hat einen <b>Gedanken</b> und <b>codiert</b> ihn in Zeichen: Wörter, Tonfall, Mimik, Gestik.",
    "Die Botschaft reist über einen <b>Kanal</b> (Medium) zur Empfängerin. Lasswell: <i>Wer</i> sagt <i>was</i> zu <i>wem</i> auf <i>welchem Kanal</i> mit <i>welcher Wirkung</i>?",
    "Auf dem Kanal wirken <b>Störungen</b>: Lärm, Verbindungsabbruch, Fachjargon. Dagegen hilft <b>Redundanz</b>, im einfachsten Fall Wiederholung oder ein zweiter Kanal.",
    "Die Empfängerin <b>decodiert</b> mit ihrem Wortschatz, ihren Erfahrungen und ihrer Stimmung. Gemeint und verstanden sind deshalb nie automatisch dasselbe.",
    "Erst die <b>Rückkopplung</b> macht aus einseitiger eine wechselseitige Kommunikation: Die Senderin erfährt, was tatsächlich angekommen ist.",
    "Konrad Lorenz: Kommunikation ist erst bei <b>angewandt</b> am Ziel. An jeder Station kann sie abbrechen, deshalb lohnt sich die Rückfrage."
  ] };

/* ---------- 2 · Kommunikationsquadrat an einem Satz ---------- */
const side = (x, y, w, h, cls, o) => r(x, y, w, h, Object.assign({ cls, rx: 3 }, o));
FIG["kommu-quadrat"] = { title: "Ein Satz, vier Botschaften: das Kommunikationsquadrat",
  svg: () => svg(640, 300,
    r(222, 74, 196, 148, { cls: "fx-card", rx: 6 }) +
    tl(320, 140, "„Das Ticket ist|ja immer noch offen.“", { fs: 13, fw: 700 }) + t(320, 190, "Teamleiterin Sandra → Tom", { fs: 10.5, cls: "fx-sub" }) +
    g({ st: 1 }, side(222, 70, 196, 9, "fx-info") + box(170, 12, 300, 46, "Sachinhalt (blau)|Ticket #412 ist nicht geschlossen.", { cls: "fx-info", fs: 11.5, lh: 15, hl: 1 })) +
    g({ st: 2 }, side(216, 74, 9, 148, "fx-ok") + box(10, 112, 196, 70, "Selbstkundgabe (grün)|Ich stehe unter Zeitdruck,|der Kunde wartet.", { cls: "fx-ok", fs: 11.5, lh: 15, hl: 2 })) +
    g({ st: 3 }, side(222, 217, 196, 9, "fx-warn") + box(170, 240, 300, 46, "Beziehung (gelb)|Ich muss bei dir nachkontrollieren.", { cls: "fx-warn", fs: 11.5, lh: 15, hl: "3,5" })) +
    g({ st: 4 }, side(415, 74, 9, 148, "fx-bad") + box(434, 112, 196, 70, "Appell (rot)|Schließ das Ticket|heute noch ab!", { cls: "fx-bad", fs: 11.5, lh: 15, hl: 4 }))),
  steps: [
    "Im Daily sagt Teamleiterin Sandra zu Entwickler Tom: „Das Ticket ist ja immer noch offen.“ Nach Schulz von Thun enthält dieser eine Satz <b>vier Botschaften gleichzeitig</b>.",
    "<b>Sachinhalt</b> (blau): die Information. Prüfkriterien: wahr, relevant, hinlänglich.",
    "<b>Selbstkundgabe</b> (grün): was Sandra über sich verrät, hier implizit, etwa Zeitdruck.",
    "<b>Beziehungshinweis</b> (gelb): was sie von Tom hält. Er steckt oft im Tonfall und in Wörtern wie „ja immer noch“.",
    "<b>Appell</b> (rot): was Sandra erreichen will, hier verdeckt formuliert.",
    "Tom hört mit dem empfindlichen <b>Beziehungsohr</b> („Sie traut mir nichts zu“) und antwortet gereizt. Sandra meinte vielleicht nur Sache und Appell. Ausweg: nachfragen, welche Seite gemeint war: „Soll ich es heute noch abschließen?“"
  ] };

/* ---------- 3 · Eisberg und Inneres Team ---------- */
FIG["kommu-eisberg"] = { title: "Eisberg und Inneres Team: was unter der Oberfläche mitspricht",
  svg: () => svg(640, 300,
    r(0, 96, 330, 204, { cls: "fx-soft", rx: 0 }) + l(0, 96, 330, 96, { cls: "acc" }) + t(8, 90, "Wasseroberfläche", { a: "start", fs: 10.5, cls: "fx-sub" }) +
    `<path d="M120 96 L150 40 L175 58 L200 30 L232 96 Z" class="fx-card"/>` +
    t(176, 80, "Worte, Fakten", { fs: 11, fw: 700 }) +
    g({ st: 1 }, `<path d="M120 96 L60 170 L84 250 L176 288 L280 250 L300 160 L232 96 Z" class="fx-card"/>` +
      ["Gefühle", "Bedürfnisse", "Werte & Normen", "Erfahrungen, Ängste"].map((s, i) => t(180, 130 + i * 34, s, { fs: 12, fw: 600 })).join("")) +
    g({ st: 2 }, box(348, 14, 282, 46, "Praktikantin Mia: „Klar, mach ich|bis morgen fertig.“", { cls: "fx-card", fs: 11.5, lh: 15 }) +
      box(348, 104, 282, 62, "darunter: müde, will dazugehören,|Angst vor schlechtem Eindruck,|Bedürfnis nach Erholung", { cls: "fx-soft", fs: 11, lh: 15 })) +
    g({ st: 3 }, t(489, 186, "nonverbal: Seufzer, Blick nach unten", { fs: 11, cls: "t-warn", fw: 600 })) +
    g({ st: 4 }, box(348, 198, 90, 44, "Ehrgeiz:|„Chance!“", { cls: "fx-info", fs: 10.5, lh: 13 }) + box(444, 198, 90, 44, "Erschöpfung:|„Zu viel!“", { cls: "fx-warn", fs: 10.5, lh: 13 }) +
      box(540, 198, 90, 44, "Teamgeist:|„Nicht hängen|lassen!“", { cls: "fx-ok", fs: 10, lh: 12 })) +
    g({ st: 5 }, box(348, 250, 282, 44, "„Teil A schaffe ich bis morgen 12 Uhr,|Teil B bis Donnerstag. Passt das?“", { cls: "fx-acc", fs: 11, lh: 14 }))),
  steps: [
    "Über der Wasseroberfläche liegt nur der kleinere Teil einer Botschaft: Worte, Fakten, Zahlen.",
    "Darunter liegen <b>Gefühle, Bedürfnisse, Werte und Erfahrungen</b>. Nach der Eisbergmetapher treffen wir mindestens <b>80 %</b> unserer Entscheidungen „im Bauch“.",
    "Beispiel: Praktikantin Mia sagt Ja zu einer Zusatzaufgabe. Unter der Oberfläche: Müdigkeit, Wunsch dazuzugehören, Angst vor einem schlechten Eindruck.",
    "Das Verborgene sickert durch: <b>Nonverbales transportiert eher Emotionen</b>, Sprache eher den Verstand. Das Team bemerkt den Seufzer.",
    "Schulz von Thuns <b>Inneres Team</b>: Mehrere Stimmen melden sich. Das ist keine Störung, sondern normale innere Pluralität.",
    "Werden die Stimmen angehört und geeinigt, wird die Antwort <b>klar und authentisch</b>: ein Ja mit realistischem Rahmen statt eines Ja, das morgen platzt."
  ] };

/* ---------- 4 · Axiom 3: Interpunktion als Kreislauf ---------- */
FIG["kommu-interpunktion"] = { title: "Axiom 3: Wer hat angefangen? Der Kreislauf ohne Anfang",
  svg: () => svg(640, 300,
    box(40, 40, 220, 64, "Projektleiterin Eva|fragt dreimal täglich|nach dem Status", { cls: "fx-info", fs: 11.5, lh: 15, hl: 1 }) +
    box(380, 196, 220, 64, "Entwickler Jonas|meldet sich seltener,|antwortet knapp", { cls: "fx-warn", fs: 11.5, lh: 15, hl: 2 }) +
    p("M262 64 C420 60 500 120 492 192", { cls: "acc", arrow: true, acc: true, flow: true }) +
    p("M378 236 C220 240 140 180 148 108", { cls: "acc", arrow: true, acc: true, flow: true }) +
    g({ on: "1" }, box(380, 30, 240, 56, "Evas Sicht: „Ich kontrolliere,|weil er nichts meldet.“", { cls: "fx-card", fs: 11.5, lh: 15 })) +
    g({ on: "2" }, box(20, 214, 240, 56, "Jonas' Sicht: „Ich melde nichts,|weil sie ständig kontrolliert.“", { cls: "fx-card", fs: 11.5, lh: 15 })) +
    g({ st: 3 }, box(250, 128, 140, 44, "kein objektiver|Anfang", { cls: "fx-bad", fs: 11.5, lh: 14 })) +
    g({ st: 4 }, box(380, 30, 240, 56, "Ausweg: Kreislauf gemeinsam|beschreiben, Status fix um 16 Uhr", { cls: "fx-ok", fs: 11, lh: 15 }))),
  steps: [
    "Zwei Verhaltensweisen schaukeln sich gegenseitig auf: Eva fragt häufig nach, Jonas meldet sich immer seltener.",
    "Eva setzt den Anfang bei Jonas: <i>Ich kontrolliere, weil er nichts meldet.</i>",
    "Jonas setzt den Anfang bei Eva: <i>Ich melde nichts, weil sie ständig kontrolliert.</i>",
    "Watzlawick, Axiom 3: Kommunikation ist immer Ursache und Wirkung. Wo die Kette „beginnt“, ist eine subjektive <b>Interpunktion</b>. Den Streit um den Anfang kann niemand gewinnen.",
    "Weiter kommt man, wenn beide über die Kommunikation selbst sprechen, den Kreislauf gemeinsam beschreiben und eine neue Vereinbarung treffen, z. B. ein fixes Status-Update um 16 Uhr."
  ] };

/* ---------- 5 · Die 4 Schritte der GFK ---------- */
const GFK = [["1 Beobachtung", "Bei den letzten drei|Releases habe ich die|Doku allein geschrieben."], ["2 Gefühl", "Ich bin frustriert|und erschöpft,"], ["3 Bedürfnis", "weil mir Fairness|und Unterstützung|wichtig sind."], ["4 Bitte", "Bist du bereit, beim|nächsten Release die|API-Doku zu übernehmen?"]];
FIG["kommu-gfk4"] = { title: "Vom Wolf zur Giraffe: ein Vorwurf in vier Schritten",
  svg: () => svg(640, 300,
    box(120, 14, 400, 44, "Wolf: „Du lässt mich immer mit der Doku allein!“", { cls: "fx-bad", fs: 12.5, hl: 0 }) +
    g({ on: "0" }, t(320, 78, "„immer“ verallgemeinert · „du lässt mich“ ist ein Urteil", { fs: 11, cls: "t-bad", fw: 600 })) +
    GFK.map(([h, s], i) => { const x = 10 + i * 157;
      return g({ st: i + 1 }, l(320, 60, x + 72, 96, { cls: "thin" }) + r(x, 98, 148, 116, { cls: "fx-soft", hl: i + 1 }) + t(x + 74, 120, h, { fw: 700, fs: 12.5 }) + tl(x + 74, 166, s, { fs: 11, lh: 15 })); }).join("") +
    g({ st: 5 }, box(10, 230, 620, 56, "Empathisch empfangen – dieselben vier Schritte beim Gegenüber vermuten:|„Bist du gestresst, weil du Klarheit über die Aufgabenverteilung brauchst?“", { cls: "fx-ok", fs: 11.5, lh: 16 }))),
  steps: [
    "Ausgangspunkt ist ein Vorwurf in Wolfssprache. Warnsignale: <b>immer</b> und eine Aussage darüber, wie der andere ist oder handelt.",
    "<b>Beobachtung</b>: Was würde eine Kamera aufzeichnen? Konkret, zählbar, ohne „immer“.",
    "<b>Gefühl</b>: ein echtes Gefühl, kein Pseudogefühl wie „im Stich gelassen“.",
    "<b>Bedürfnis</b>: abstrakt, universell, unabhängig von Person und Handlung. Es ist die eigentliche Ursache des Gefühls.",
    "<b>Bitte</b>: konkret, machbar, positiv formuliert. Die andere Person darf Nein sagen, sonst wäre es eine Forderung.",
    "Die vier Schritte funktionieren auch beim <b>Empfangen</b>: Statt auf den Vorwurf zu reagieren, vermutest du Gefühl und Bedürfnis des anderen und fragst nach."
  ] };

/* ---------- 6 · Harvard-Konzept an einem Konflikt ---------- */
FIG["kommu-harvard"] = { title: "Harvard-Konzept: ein Testserver, zwei Teams",
  svg: () => svg(640, 300,
    t(110, 20, "Team Support", { fw: 700 }) + t(530, 20, "Team Entwicklung", { fw: 700 }) +
    g({ on: "0" }, box(10, 32, 200, 46, "„Wir brauchen den|Testserver Mo bis Fr!“", { cls: "fx-bad", fs: 11.5, lh: 15 }) + box(430, 32, 200, 46, "„Nein, wir brauchen|ihn die ganze Woche!“", { cls: "fx-bad", fs: 11.5, lh: 15 }) +
      l(212, 55, 428, 55, { cls: "bad", both: true }) + t(320, 48, "Positionen prallen aufeinander", { fs: 11, cls: "t-bad", fw: 600 })) +
    g({ st: 1 }, box(210, 32, 220, 46, "Gemeinsames Problem:|1 Server, 2 Bedarfe", { cls: "fx-acc", fs: 11.5, lh: 15, hl: 1 })) +
    g({ st: 2 }, box(10, 92, 200, 54, "Interesse: Kunden-|Hotfix testen, ca. 2 h/Tag", { cls: "fx-info", fs: 11, lh: 15, hl: 2 }) + box(430, 92, 200, 54, "Interesse: Lasttests,|laufen mehrere Stunden", { cls: "fx-info", fs: 11, lh: 15, hl: 2 })) +
    g({ st: 3 }, box(160, 160, 320, 54, "Option: Support 8–12 Uhr, Lasttests 18–6 Uhr;|oder zusätzlich eine Cloud-VM mieten", { cls: "fx-ok", fs: 11, lh: 15, hl: 3 }) +
      l(110, 148, 200, 160, { cls: "ok", arrow: true }) + l(530, 148, 440, 160, { cls: "ok", arrow: true })) +
    g({ st: 4 }, box(160, 226, 320, 30, "Kriterien: Release-Plan, SLA, Kosten/VM-Stunde", { cls: "fx-soft", fs: 11, hl: 4 })) +
    g({ st: 5 }, box(10, 236, 140, 54, "BATNA Support:|Test auf Laptop", { cls: "fx-warn", fs: 10.5, lh: 14 }) + box(490, 236, 140, 54, "BATNA Dev:|Cloud-VM ca. 300 €", { cls: "fx-warn", fs: 10.5, lh: 14 }) +
      t(320, 278, "Einigung nur, wenn sie besser ist als die eigene BATNA", { fs: 11, fw: 700, cls: "t-acc" }))),
  steps: [
    "Zwei Teams wollen in der Release-Woche denselben Testserver. Beide nennen <b>Positionen</b>. Feilschen darum endet mit Gewinner und Verlierer oder einem faulen Kompromiss.",
    "Prinzip 1: <b>Menschen und Probleme trennen</b>. Nicht „Ihr blockiert immer alles“, sondern: Wir haben ein gemeinsames Problem.",
    "Prinzip 2: <b>Interessen statt Positionen</b>. W-Fragen zeigen das Warum: Support braucht nur kurze Testfenster, Entwicklung lange Lasttests.",
    "Prinzip 3: <b>Optionen entwickeln</b>, „sowohl als auch“ statt „entweder oder“: Zeitfenster teilen oder eine zweite VM mieten.",
    "Prinzip 4: <b>Objektive Kriterien</b> entscheiden fair: Release-Plan, Zusagen an Kunden (SLA), Kosten.",
    "Jede Seite kennt ihre <b>BATNA</b>, den besten Plan B ohne Einigung. Eine Einigung lohnt sich nur, wenn sie besser ist als die BATNA."
  ] };

/* ---------- Bausteine für Beispiele ---------- */
const say = (who, s) => `<i>${who}:</i> „${s}“`;
const bad = s => `<p><b>Ungünstig:</b> ${s}</p>`;
const good = s => `<p><b>Besser:</b> ${s}</p>`;
const PR = "Beispiel aus der Praxis";

window.STUDYOS_EXT = window.STUDYOS_EXT || {};
(window.STUDYOS_EXT["kommu"] = window.STUDYOS_EXT["kommu"] || []).push({ id: "kommu-plus",
  blocks: {
    "k1-1": [
      { t: "fig", id: "kommu-sender" },
      { t: "example", label: PR, title: "Übergabe im IT-Support: wo die Botschaft verloren geht", html:
        bad(`${say("Lukas (Freitag 17:55, im Gehen)", "Der Drucker im 2. Stock spinnt, schau dir das am Montag mal an.")} ${say("Nina (Kopfhörer auf)", "Mhm.")}`) +
        `<p>Analyse mit der Lorenz-Kette: <b>gesagt</b> ja · <b>gehört</b> nur halb (Kopfhörer = physische Störung) · <b>verstanden</b> nein („spinnt“ ist keine Fehlerbeschreibung) · <b>einverstanden</b> unklar („Mhm“) · <b>behalten</b> und <b>angewandt</b>: am Montag weiß Nina nichts mehr davon.</p>` +
        good(`Lukas legt ein Ticket an (zweiter Kanal = Redundanz): „Drucker 2. OG, Raum 214: Papierstau-Meldung, obwohl kein Papier klemmt, seit 15 Uhr.“ Dann persönlich: ${say("Lukas", "Ich hab dir Ticket 5531 zugewiesen. Kannst du am Montag als Erstes draufschauen?")} ${say("Nina", "Ja, Montag 8 Uhr, Raum 214.")}`) +
        `<p>Ninas Wiederholung ist die <b>Rückkopplung</b>: Lukas weiß jetzt, dass die Botschaft gehört, verstanden und akzeptiert wurde.</p>` },
      { t: "check", at: 99, q: "Nina wiederholt: „Montag 8 Uhr, Raum 214.“ Welche Funktion hat das im Sender-Empfänger-Modell?", opts: ["Es ist eine Störung des Kanals", "Es ist Rückkopplung: Die Senderin erfährt, was angekommen ist", "Es ist eine Codierung durch die Senderin", "Es ist eine Du-Botschaft"], a: 1, why: "Durch Feedback wird einseitige zu wechselseitiger Kommunikation, Missverständnisse fallen sofort auf." }
    ],
    "k2-1": [
      { t: "fig", id: "kommu-quadrat" },
      { t: "example", label: PR, title: "Code-Review: „Diese Funktion hat 300 Zeilen.“", html:
        `<p>Senior-Entwicklerin Petra schreibt in einem Review-Kommentar an Praktikant David: „Diese Funktion hat 300 Zeilen.“</p>` +
        `<table class="dt"><tr><th>Seite</th><th>Was Petra vielleicht meint</th><th>Was David vielleicht hört</th></tr>` +
        `<tr><td>Sachinhalt</td><td>Die Funktion ist 300 Zeilen lang.</td><td>Stimmt, ist sie.</td></tr>` +
        `<tr><td>Selbstkundgabe</td><td>Ich lese mich schwer durch so lange Blöcke.</td><td>Sie ist genervt von mir.</td></tr>` +
        `<tr><td>Beziehung</td><td>Ich traue dir zu, das sauber aufzuteilen.</td><td>Sie hält mich für einen Anfänger.</td></tr>` +
        `<tr><td>Appell</td><td>Teil sie in kleinere Funktionen auf.</td><td>Schreib alles neu.</td></tr></table>` +
        bad(`David hört nur mit dem Beziehungsohr und antwortet: „Sorry, ich bin halt noch nicht so gut.“`) +
        good(`David fragt nach, welche Seite gemeint ist: „Meinst du, ich soll sie in kleinere Funktionen aufteilen? Hast du einen Tipp, wo ich schneiden soll?“ Petra kann den Appell jetzt ausdrücklich formulieren: „Genau, z. B. Validierung und Speichern trennen.“`) },
      { t: "check", at: 99, q: "Petra schreibt „Diese Funktion hat 300 Zeilen.“ Welche Deutung gehört zum Appell?", opts: ["Die Funktion ist 300 Zeilen lang.", "Ich lese mich schwer durch so lange Blöcke.", "Teil die Funktion in kleinere Funktionen auf.", "Ich traue dir zu, das sauber zu machen."], a: 2, why: "Der Appell ist das, was die Senderin beim Gegenüber erreichen möchte: eine Handlung." }
    ],
    "k2-2": [
      { t: "fig", id: "kommu-eisberg" },
      { t: "example", label: PR, title: "Inneres Team vor einer Zusage im Praktikum", html:
        `<p>Teamleiter Martin fragt Praktikantin Mia am Donnerstag: „Kannst du am Samstag beim Server-Umzug helfen?“ Mia spürt mehrere Stimmen:</p>` +
        `<ul><li><b>Die Ehrgeizige:</b> „Super Chance, da lerne ich echt viel.“</li><li><b>Die Erschöpfte:</b> „Ich hatte seit drei Wochen kein freies Wochenende.“</li><li><b>Die Pflichtbewusste:</b> „Am Montag ist die FH-Abgabe, die ist noch nicht fertig.“</li><li><b>Die Harmoniebedürftige:</b> „Wenn ich Nein sage, bin ich raus.“</li></ul>` +
        bad(`Die lauteste Stimme gewinnt: „Ja klar, kein Problem!“ (seufzt, schaut weg). Unter der Oberfläche bleiben Erschöpfung und Sorge. Martin bemerkt den Widerspruch zwischen Worten und Körpersprache.`) +
        good(`Mia hört alle Stimmen an und einigt sie: „Der Umzug interessiert mich sehr. Den ganzen Samstag schaffe ich nicht, weil ich am Montag eine Abgabe habe. Von 8 bis 12 Uhr bin ich gern dabei. Passt das?“`) +
        `<p>Ergebnis: Die Antwort ist klar, authentisch und situationsgerecht. Jede innere Stimme findet sich darin wieder.</p>` },
      { t: "check", at: 99, q: "Mia sagt „Ja klar!“, seufzt aber und schaut weg. Was zeigt das laut Eisbergtheorie?", opts: ["Dass die Sprache immer wichtiger ist als Nonverbales", "Dass Gefühle unter der Oberfläche über nonverbale Signale sichtbar werden", "Dass Mia lügt und bestraft werden sollte", "Dass Sachinhalt und Appell identisch sind"], a: 1, why: "Nonverbale Kommunikation transportiert eher Emotionen. Der größere Teil der Botschaft liegt unter der Oberfläche." }
    ],
    "k3-1": [
      { t: "fig", id: "kommu-interpunktion", at: 2 },
      { t: "example", at: 2, label: PR, title: "Fünf Axiome in einer Projektwoche", html:
        `<table class="dt"><tr><th>Axiom</th><th>Situation im IT-Projekt</th></tr>` +
        `<tr><td>1 · Man kann nicht nicht kommunizieren</td><td>Der Product Owner beantwortet eine Frage im Team-Chat zwei Tage lang nicht. Das Team deutet: „Das ist ihm nicht wichtig.“</td></tr>` +
        `<tr><td>2 · Inhalt und Beziehung</td><td>„Interessanter Lösungsansatz“ mit hochgezogenen Augenbrauen. Der Beziehungsaspekt (Skepsis) bestimmt, wie der Inhalt verstanden wird.</td></tr>` +
        `<tr><td>3 · Interpunktion</td><td>Die Projektleiterin kontrolliert, weil der Entwickler wenig meldet; er meldet wenig, weil sie kontrolliert.</td></tr>` +
        `<tr><td>4 · digital und analog</td><td>In der Mail steht „Alles bestens“ (digital), im Call klingt die Stimme gepresst (analog).</td></tr>` +
        `<tr><td>5 · symmetrisch / komplementär</td><td>Zwei Architekten überbieten sich im Meeting mit Gegenvorschlägen (symmetrisch, droht zu eskalieren). Mentorin erklärt, Praktikant fragt nach (komplementär).</td></tr></table>` +
        `<p><b>Gut zu wissen:</b> Die Axiome bewerten nicht. Komplementär ist nicht schlecht und symmetrisch nicht gut. Gestört wird es erst bei Eskalation oder starrer Über- und Unterordnung.</p>` }
    ],
    "k4-1": [
      { t: "example", label: PR, title: "Kundenhotline: Wolf und Giraffe am Telefon", html:
        `<p>Ein Kunde ruft zum dritten Mal an: „Ihr Saftladen kriegt nicht einmal ein Passwort-Reset hin!“</p>` +
        bad(`${say("Wolf-Antwort", "Bei uns funktioniert alles. Sie haben wahrscheinlich die Mail nicht richtig gelesen.")} Das ist ein Urteil über den Kunden. Er fühlt sich angegriffen, das Gespräch eskaliert.`) +
        good(`${say("Giraffen-Antwort", "Sie haben jetzt schon dreimal angerufen und kommen immer noch nicht in Ihr Konto. Das ist ärgerlich, Sie wollen einfach arbeiten können. Darf ich mit Ihnen gemeinsam Schritt für Schritt durch den Reset gehen?")}`) +
        `<p>Dahinter steht die Grundannahme: <i>Jegliche Form von Gewalt ist ein tragischer Ausdruck unerfüllter Bedürfnisse.</i> Hinter der Beschimpfung stehen Bedürfnisse wie Verlässlichkeit und Effizienz. Die Giraffe hört sie heraus, ohne das Verhalten gutzuheißen. Die beiden Säulen: <b>Empathie</b> (ganz beim Kunden sein) und <b>Aufrichtigkeit</b> (ehrlich sagen, was ich anbieten kann).</p>` },
      { t: "check", at: 99, q: "Ein Kollege kritisiert dein Konzept scharf. Welche Reaktion entspricht der GFK-Grundhaltung?", opts: ["„Du hast doch keine Ahnung.“", "„Mir scheint, dir ist wichtig, dass das Konzept vor dem Kunden hält. Welcher Punkt macht dir am meisten Sorgen?“", "Schweigen und später beim Chef beschweren", "„So sind die Vorgaben, da kann ich nichts machen.“"], a: 1, why: "Empathie: das Bedürfnis hinter der Kritik hören und nachfragen. Die anderen Antworten urteilen, weichen aus oder leugnen Verantwortung." }
    ],
    "k4-2": [
      { t: "example", label: PR, title: "Die Kabinenpredigt nach dem Fehl-Deployment", html:
        `<p>Nach einem fehlerhaften Release sagt die Teamleiterin im Meeting:</p>` +
        `<p>„Das war <b>schlampig</b> <i>(moralisches Urteil)</i>. Das Team von Stefan hätte so etwas <b>nie</b> passieren lassen <i>(Vergleich)</i>. Ich <b>muss</b> das jetzt leider nach oben melden <i>(Verantwortung leugnen)</i>. <b>Wenn</b> das noch einmal vorkommt, <b>gibt es Konsequenzen</b> <i>(Drohung)</i>.“</p>` +
        `<p>Wirkung: Das Team verteidigt sich, niemand spricht offen über die eigentliche Ursache. Die Kooperationsbereitschaft sinkt.</p>` +
        good(`„Beim Release gestern ist ein ungetesteter Branch in Produktion gegangen, der Shop war 40 Minuten offline. Ich bin beunruhigt, weil mir Verlässlichkeit gegenüber den Kunden wichtig ist. Ich habe entschieden, den Vorfall der Geschäftsführung zu melden. Wer ist bereit, bis Freitag mit mir eine Checkliste für Releases zu erstellen?“`) +
        `<p>Statt „ich muss“ steht „ich habe entschieden“: Die Teamleiterin übernimmt Verantwortung für ihre Wahl.</p>` },
      { t: "check", at: 99, q: "Wie lautet „Ich muss heute Überstunden machen“ in der verantwortungsvollen Giraffensprache?", opts: ["„Ich werde gezwungen, Überstunden zu machen.“", "„Ich entscheide mich, heute länger zu bleiben, weil mir der Projekttermin wichtig ist.“", "„Man macht hier eben Überstunden.“", "„Wegen dir muss ich länger bleiben.“"], a: 1, why: "„Müssen“ verschleiert die eigene Entscheidung. Die Giraffe benennt Wahl und Bedürfnis dahinter." }
    ],
    "k5-1": [
      { t: "example", label: PR, title: "Vom Vorwurf zur Kamera: Sätze aus dem Projektalltag", html:
        `<table class="dt"><tr><th>Bewertung</th><th>Beobachtung (Kamera-Test)</th></tr>` +
        `<tr><td>Du bist im Meeting nie bei der Sache.</td><td>In den letzten zwei Sprint-Meetings hattest du den Laptop offen und hast getippt, während ich präsentiert habe.</td></tr>` +
        `<tr><td>Du antwortest viel zu spät.</td><td>Meine Mail vom Montag 9 Uhr hast du am Mittwoch um 15 Uhr beantwortet.</td></tr>` +
        `<tr><td>Dein Code ist chaotisch.</td><td>In der Datei <code>order.js</code> gibt es keine Kommentare und drei Funktionen mit über 200 Zeilen.</td></tr>` +
        `<tr><td>Der Kunde ist total schwierig.</td><td>Der Kunde hat die Anforderungen in den letzten vier Wochen dreimal geändert.</td></tr></table>` +
        `<p><b>So gehst du vor:</b> 1) Warnwörter streichen (<i>nie, immer, schon wieder, zu, total</i>). 2) Fragen: Was genau habe ich gesehen oder gehört? 3) Zeit, Ort, Anzahl ergänzen. 4) Test: Könnte die andere Person widersprechen? Wenn nein, ist es eine Beobachtung.</p>` },
      { t: "check", at: 99, q: "Welche Aussage ist eine reine Beobachtung?", opts: ["„Du ignorierst meine Tickets.“", "„Du hast meine drei Tickets von letzter Woche noch nicht kommentiert.“", "„Du bist überfordert.“", "„Du kümmerst dich zu wenig um den Support.“"], a: 1, why: "Nur Option 2 ist konkret, zählbar und kamera-tauglich. Die anderen deuten oder bewerten." }
    ],
    "k5-2": [
      { t: "example", label: PR, title: "Pseudogefühle im Praktikum übersetzen", html:
        `<table class="dt"><tr><th>Pseudogefühl (Gedanke)</th><th>Warnsignal</th><th>Mögliches echtes Gefühl</th></tr>` +
        `<tr><td>Ich fühle mich ausgenutzt.</td><td>beschreibt, was andere tun</td><td>erschöpft, verärgert</td></tr>` +
        `<tr><td>Ich habe das Gefühl, dass mein Projekt niemanden interessiert.</td><td>„Gefühl, dass“</td><td>enttäuscht, entmutigt</td></tr>` +
        `<tr><td>Ich fühle mich, als ob ich gegen eine Wand rede.</td><td>„als ob“</td><td>frustriert, hilflos</td></tr>` +
        `<tr><td>Ich fühle mich, als würde mein Chef mich kontrollieren.</td><td>Person + Handlung</td><td>angespannt, unruhig</td></tr>` +
        `<tr><td>Ich fühle mich inkompetent.</td><td>Selbstbewertung</td><td>verunsichert, frustriert</td></tr></table>` +
        `<p><b>Ersetz-Test:</b> Lässt sich „ich fühle“ durch „ich denke“ ersetzen, ohne dass der Satz falsch klingt? Dann ist es ein Gedanke. „Ich denke, dass mein Projekt niemanden interessiert“ funktioniert, also Gedanke. „Ich denke enttäuscht“ funktioniert nicht, also Gefühl.</p>` },
      { t: "check", at: 99, q: "„Ich fühle mich bevormundet.“ Welches echte Gefühl könnte dahinterstecken?", opts: ["kontrolliert", "verärgert", "übergangen", "nicht ernst genommen"], a: 1, why: "„Verärgert“ beschreibt den eigenen Zustand. Die anderen Wörter beschreiben, was angeblich jemand anderer tut." }
    ],
    "k5-3": [
      { t: "example", label: PR, title: "Bedürfnisse hinter Vorwürfen im Büro finden", html:
        `<p><b>Strategie 1</b> (unerwünschtes → erwünschtes Verhalten → Bedürfnis):</p>` +
        `<ul><li>„Ständig platzt jemand in mein Büro!“ → erwünscht: vorher im Chat fragen → Bedürfnis: <b>Konzentration, Ruhe</b></li><li>„Immer werden Meetings fünf Minuten vorher verschoben!“ → erwünscht: einen Tag vorher Bescheid geben → Bedürfnis: <b>Planbarkeit, Verlässlichkeit</b></li></ul>` +
        `<p><b>Strategie 2</b> (Bewertung → Gegenteil):</p>` +
        `<ul><li>„Das Meeting war völlig chaotisch.“ → Gegenteil: geordnet → Bedürfnis: <b>Struktur, Klarheit</b></li><li>„Die Doku ist ein schlechter Witz.“ → Gegenteil: verständlich → Bedürfnis: <b>Verständnis, Effizienz</b></li></ul>` +
        `<p><b>Falle:</b> „Ich brauche ein eigenes Büro“ ist eine <i>Strategie</i> (konkret, Ort). Das Bedürfnis dahinter ist z. B. Ruhe. Dafür gibt es viele Strategien: Kopfhörer, Fokuszeiten im Kalender, Homeoffice-Tag.</p>` },
      { t: "check", at: 99, q: "„Ich brauche einen Homeoffice-Tag pro Woche.“ Was ist das im Sinne der GFK?", opts: ["Ein Bedürfnis", "Eine Strategie, z. B. für das Bedürfnis nach Ruhe oder Autonomie", "Ein Gefühl", "Eine Beobachtung"], a: 1, why: "Es ist konkret und an Ort und Zeit gebunden. Bedürfnisse sind abstrakt und universell." }
    ],
    "k5-4": [
      { t: "example", label: PR, title: "Vom frommen Wunsch zur Bitte im Team", html:
        `<table class="dt"><tr><th>Frommer Wunsch / Forderung</th><th>Erfolgversprechende Bitte</th></tr>` +
        `<tr><td>Sei mal ein bisschen kommunikativer!</td><td>Bist du bereit, ab morgen im Daily kurz zu sagen, woran du gerade arbeitest?</td></tr>` +
        `<tr><td>Hör auf, mich ständig zu unterbrechen!</td><td>Kannst du mich meinen Punkt zu Ende erklären lassen und danach deine Frage stellen?</td></tr>` +
        `<tr><td>Gib dir mehr Mühe bei den Tests.</td><td>Würdest du für jede neue Funktion mindestens einen Unit-Test schreiben, bevor du den Merge-Request stellst?</td></tr></table>` +
        `<p><b>Nein-Test:</b> Jana bittet Kollegen Ali: „Kannst du heute bis 16 Uhr mein Review machen?“ Ali: „Heute schaffe ich es nicht.“</p>` +
        bad(say("Jana", "Typisch, auf dich kann man sich nie verlassen.") + " Der Vorwurf zeigt: Es war eine Forderung.") +
        good(say("Jana", "Okay. Mir ist wichtig, dass es vor dem Release fertig ist. Ginge morgen bis 10 Uhr?") + " Das Nein wird respektiert, beide suchen eine andere Strategie.") },
      { t: "check", at: 99, q: "Welche Bitte ist positiv, konkret und erfüllbar formuliert?", opts: ["„Sei nicht so unorganisiert.“", "„Kannst du die Meeting-Notizen bis heute 17 Uhr ins Wiki stellen?“", "„Ich hätte gerne mehr Engagement.“", "„Hör auf, alles zu vergessen.“"], a: 1, why: "Sie nennt Handlung, Ort und Zeit und sagt, was gewollt ist, nicht was nicht." }
    ],
    "k5-5": [
      { t: "fig", id: "kommu-gfk4" },
      { t: "example", label: PR, title: "Senden und Empfangen: ein Konflikt um die Projektplanung", html:
        `<p>Situation: Simon hat die Aufgabenverteilung im Projekt-Board geändert, ohne Lea zu fragen. Lea bemerkt es am Montag.</p>` +
        bad(say("Lea", "Du bestimmst hier einfach alles allein!")) +
        `<p><b>Lea sendet in vier Schritten:</b></p><ol><li><b>Beobachtung:</b> „Am Freitag wurden im Board meine zwei Tickets zum Login-Modul dir zugewiesen, und ich habe davon heute erst erfahren.“</li><li><b>Gefühl:</b> „Ich bin irritiert und auch ein bisschen enttäuscht,“</li><li><b>Bedürfnis:</b> „weil mir Mitsprache und Transparenz im Team wichtig sind.“</li><li><b>Bitte:</b> „Wärst du bereit, Änderungen an der Verteilung künftig vorher kurz im Chat anzukündigen?“</li></ol>` +
        `<p><b>Simon empfängt empathisch</b> (die vier Schritte beim Gegenüber vermuten): „Du hast es erst heute gesehen und bist irritiert, weil du gern mitentschieden hättest? Mir war wichtig, dass das Login-Modul vor der Demo fertig wird. Ja, ich kündige es künftig an. Willst du die Tickets zurück?“</p>` +
        `<p>Übe mit eigenen, erfundenen Situationen. Für Portfolio und Deep Talk gilt: selbst formulieren, ohne KI.</p>` },
      { t: "check", at: 99, q: "Welcher Satz ist in Leas Nachricht Schritt 3 (Bedürfnis)?", opts: ["„Am Freitag wurden meine zwei Tickets dir zugewiesen.“", "„Ich bin irritiert und enttäuscht.“", "„weil mir Mitsprache und Transparenz wichtig sind.“", "„Wärst du bereit, Änderungen vorher anzukündigen?“"], a: 2, why: "Reihenfolge: Beobachtung – Gefühl – Bedürfnis – Bitte. Mitsprache und Transparenz sind abstrakte Bedürfnisse." },
      { t: "check", at: 99, q: "Was ist der Fehler in: „Wenn du ständig die Tickets umverteilst, fühle ich mich übergangen, weil du mich nicht respektierst.“?", opts: ["Es fehlt nur die Bitte", "Bewertung („ständig“), Pseudogefühl („übergangen“) und ein Vorwurf statt eines Bedürfnisses", "Die Reihenfolge ist falsch", "Es ist alles korrekt"], a: 1, why: "Gleich drei Schritte sind verunglückt. Erst danach fehlt auch noch die Bitte." }
    ],
    "k6-1": [
      { t: "example", label: PR, title: "Frustrierte Kollegin: Blocker oder aktives Zuhören?", html:
        `<p>Kollegin Sara kommt aus einem Kundentermin: „Ich hab drei Wochen an dem Prototyp gesessen und der Kunde will jetzt doch alles anders.“</p>` +
        bad(`${say("Ratschlag", "Du hättest halt früher ein Mockup zeigen sollen.")} · ${say("Bagatellisieren", "Ach, das passiert jedem.")} · ${say("Themenwechsel", "Apropos Kunde, weißt du schon, wer die Weihnachtsfeier organisiert?")}`) +
        good(`${say("Paraphrasieren (Inhalt)", "Der Kunde hat nach drei Wochen Arbeit die Richtung geändert.")} ${say("Verbalisieren (Gefühl)", "Das klingt richtig frustrierend.")} ${say("Ermutigen", "Magst du erzählen, was er genau geändert haben will?")}`) +
        `<p>Dazu nonverbal: Laptop zuklappen, Blickkontakt, nicken. Und Pausen aushalten: Oft kommt das Wichtigste nach drei Sekunden Stille. Erst wenn Sara sich verstanden fühlt, ist Platz für Lösungen, am besten, wenn sie selbst danach fragt.</p>` },
      { t: "check", at: 99, q: "Sara: „Ich hab drei Wochen umsonst gearbeitet.“ Welche Antwort verbalisiert ihr Gefühl?", opts: ["„Das passiert jedem mal.“", "„Du klingst enttäuscht.“", "„Hättest du früher nachgefragt.“", "„Drei Wochen sind doch nicht so lang.“"], a: 1, why: "Verbalisieren spricht das Gefühl an. Die anderen Antworten bagatellisieren, belehren oder bewerten." }
    ],
    "k6-2": [
      { t: "example", label: PR, title: "Du-Botschaften im Homeoffice umbauen", html:
        `<table class="dt"><tr><th>Du-Botschaft</th><th>Ich-Botschaft (Gefühl · Verhalten · Bedürfnis/Wunsch)</th></tr>` +
        `<tr><td>Du kommst immer zu spät in den Call!</td><td>Ich bin angespannt, wenn der Call um 9:00 startet und wir bis 9:10 warten, weil mir unsere Zeit wichtig ist. Ich würde mich freuen, wenn wir pünktlich starten.</td></tr>` +
        `<tr><td>Du schaltest nie die Kamera ein.</td><td>Ich fühle mich unsicher, wenn ich beim Präsentieren keine Gesichter sehe, weil mir Rückmeldung wichtig ist. Magst du bei meinem Teil die Kamera einschalten?</td></tr>` +
        `<tr><td>Du lässt mich mit dem Kunden allein.</td><td>Ich bin besorgt, wenn ich die Kundenfragen zur API ohne Unterstützung beantworte, weil ich Sicherheit brauche. Ich würde mir wünschen, dass du beim nächsten Termin dabei bist.</td></tr></table>` +
        `<p><b>Achtung:</b> „Ich finde, du bist unzuverlässig“ beginnt zwar mit „ich“, ist aber eine verkleidete Du-Botschaft. Entscheidend ist ein echtes Gefühl und ein Verhalten ohne Schuld.</p>` },
      { t: "check", at: 99, q: "„Ich bin genervt, wenn im Großraumbüro laut telefoniert wird.“ Was fehlt zur vollständigen Ich-Formel?", opts: ["Das Gefühl", "Das beschriebene Verhalten", "Das Bedürfnis bzw. der Wunsch", "Nichts, sie ist vollständig"], a: 2, why: "Gefühl (genervt) und Verhalten (laut telefoniert) sind da. Es fehlt z. B. „weil ich mich konzentrieren muss. Könntest du für Telefonate in den Besprechungsraum gehen?“" }
    ],
    "k7-1": [
      { t: "fig", id: "kommu-harvard", at: 1 },
      { t: "example", label: PR, title: "Weihnachtsdienst im IT-Support verhandeln", html:
        `<p>Im Support muss zwischen 24.12. und 6.1. immer eine Person erreichbar sein. Anna und Ben wollen beide frei haben.</p>` +
        `<table class="dt"><tr><th>Schritt</th><th>Anna</th><th>Ben</th></tr>` +
        `<tr><td>Position</td><td>„Ich nehme die ganzen Feiertage frei.“</td><td>„Ich auch, ich hatte letztes Jahr Dienst.“</td></tr>` +
        `<tr><td>Interesse (Warum?)</td><td>Familienbesuch in Kärnten, 23.–27.12.</td><td>Skiurlaub mit Freunden, 30.12.–6.1.</td></tr>` +
        `<tr><td>BATNA</td><td>Urlaubsantrag stellen, Teamleitung entscheidet</td><td>dasselbe, Ausgang unsicher</td></tr>` +
        `<tr><td>WATNA</td><td colspan="2">Die Teamleitung teilt beide gegen ihren Wunsch ein, die Stimmung leidet.</td></tr></table>` +
        `<p><b>Menschen und Problem trennen:</b> „Wir wollen beide frei haben, und einer muss erreichbar sein. Lass uns das gemeinsam lösen.“ <b>Optionen:</b> Anna arbeitet 28.12.–6.1. remote, Ben 23.–29.12.; Ben übernimmt dafür Annas Rufbereitschaft im Februar. <b>Objektives Kriterium:</b> die Dienstliste der letzten zwei Jahre (Ben hatte 2025 Dienst).</p>` +
        `<p>Ergebnis: Beide bekommen, was ihnen eigentlich wichtig ist. Die Einigung ist für beide besser als ihre BATNA.</p>` },
      { t: "check", at: 99, q: "Firma A bietet dir 3.000 € brutto. Deine BATNA ist ein schriftliches Angebot von Firma B über 3.200 €, gleichwertiger Job. Was folgt aus dem Harvard-Konzept?", opts: ["Sofort bei A unterschreiben", "A's Angebot liegt unter deiner BATNA: weiterverhandeln oder B wählen", "Die BATNA spielt keine Rolle", "Du musst bei A mindestens 3.200 € fordern, sonst ist die Verhandlung gescheitert"], a: 1, why: "Eine Einigung lohnt sich nur, wenn sie besser ist als die beste Alternative ohne Einigung." }
    ]
  },

  questions: [
    /* k-grund */
    { id: "px-kommu-1", topic: "k-grund", q: "In einem Teams-Meeting stimmen alle 20 Teilnehmenden in einer Live-Umfrage ab, die Ergebnisse sieht die Moderatorin. Welche Form liegt vor?", opts: ["1:1 einseitig", "n:1 – viele Senderinnen, eine Empfängerin", "1:n einseitig", "1:1 wechselseitig"], a: 1, why: "Viele senden ihre Stimme an eine Stelle, wie beim TED-Voting.", ex: "" },
    { id: "px-kommu-2", topic: "k-grund", q: "Du sagst einem Kunden am Telefon: „Der Hotfix geht nach dem Merge durch die Pipeline.“ Er sagt „Aha.“ An welcher Station der Lorenz-Kette droht der Abbruch am ehesten?", opts: ["gesagt", "gehört", "verstanden", "behalten"], a: 2, why: "Fachjargon ist eine semantische Hürde. Um verstanden zu werden, muss man die Sprache der Empfängerin sprechen.", ex: "" },
    { id: "px-kommu-3", topic: "k-grund", q: "Welche Maßnahme ist Redundanz im Sinne des Skripts?", opts: ["Wichtiges im Gespräch sagen und danach schriftlich zusammenfassen", "Möglichst viele Fachbegriffe verwenden", "Die Nachricht einmal sehr knapp senden", "Den Kanal möglichst oft wechseln, ohne zu wiederholen"], a: 0, why: "Redundanz heißt mehrfache Übermittlung. Die einfachste Form ist Wiederholung, auch über einen zweiten Kanal.", ex: "" },
    { id: "px-kommu-4", topic: "k-grund", q: "Welche Frage gehört NICHT zur Lasswell-Formel?", opts: ["Wer sagt etwas?", "Zu wem?", "Auf welchem Kanal?", "Wer hat recht?"], a: 3, why: "Lasswell: Wer sagt was zu wem auf welchem Kanal mit welcher Wirkung?", ex: "" },
    { id: "px-kommu-5", topic: "k-grund", q: "Ein Newsletter der FH an alle Studierenden ohne Antwortmöglichkeit ist …", opts: ["1:n einseitig", "n:n wechselseitig", "1:1 wechselseitig", "n:1 einseitig"], a: 0, why: "Eine Senderin, viele Empfängerinnen, keine Rückkopplung.", ex: "" },
    /* k-svt */
    { id: "px-kommu-6", topic: "k-svt", q: "Im Code-Review steht „Diese Funktion hat 300 Zeilen.“ Der Praktikant hört „Du programmierst schlecht.“ Mit welchem Ohr hört er?", opts: ["Sachohr", "Selbstkundgabe-Ohr", "Beziehungsohr", "Appellohr"], a: 2, why: "Er bezieht die Aussage darauf, was die Senderin von ihm hält.", ex: "" },
    { id: "px-kommu-7", topic: "k-svt", q: "Kollege: „Kannst du mir zeigen, wie das Deployment geht?“ Welche Deutung ist die Selbstkundgabe?", opts: ["„Es gibt ein Deployment-Verfahren.“", "„Ich kenne mich damit noch nicht aus.“", "„Du kennst dich damit aus.“", "„Zeig es mir jetzt.“"], a: 1, why: "Die Selbstkundgabe verrät etwas über den Sender selbst. „Du kennst dich aus“ wäre die Beziehungsseite, „Zeig es mir“ der Appell.", ex: "" },
    { id: "px-kommu-8", topic: "k-svt", q: "Worüber wird der Beziehungshinweis besonders oft transportiert?", opts: ["Über Zahlen und Daten", "Über Tonfall, Mimik und die Art der Formulierung", "Ausschließlich über Ich-Botschaften", "Über den gewählten Kanal"], a: 1, why: "Die gelbe Seite steckt oft im Wie: Tonfall, Mimik, Wörter wie „ja immer noch“.", ex: "" },
    { id: "px-kommu-9", topic: "k-svt", q: "Wann entstehen laut Schulz von Thun typischerweise Missverständnisse?", opts: ["Wenn die Nachricht zu kurz ist", "Wenn Senderin und Empfängerin auf unterschiedlichen Seiten „funken“", "Wenn beide das Sachohr nutzen", "Nur bei schriftlicher Kommunikation"], a: 1, why: "Gemeint ist z. B. die Sachseite, gehört wird die Beziehungsseite.", ex: "" },
    { id: "px-kommu-10", topic: "k-svt", q: "„Ich bin seit sechs Uhr im Büro.“ Welche Seite steht explizit im Vordergrund?", opts: ["Selbstkundgabe", "Beziehung", "Appell", "Keine, der Satz ist neutral"], a: 0, why: "Die Senderin gibt etwas über sich preis. Ein verdeckter Appell (z. B. „Lass mich früher gehen“) kann mitschwingen.", ex: "" },
    /* k-team */
    { id: "px-kommu-11", topic: "k-team", q: "Was liegt im Eisbergmodell über der Wasseroberfläche?", opts: ["Wortbedeutung, Fakten", "Werte und Normen", "Unausgesprochene Wünsche", "Ängste und Erfahrungen"], a: 0, why: "Sichtbar ist nur der kleinere, sachliche Teil. Der Rest liegt darunter.", ex: "" },
    { id: "px-kommu-12", topic: "k-team", q: "Was wird laut Skript wichtiger, wenn Gefahr droht?", opts: ["Die Sprache", "Das Nonverbale", "Der Fachjargon", "Die Redundanz"], a: 1, why: "In Gefahr verliert Sprache an Gewicht gegenüber nonverbalen Signalen.", ex: "" },
    { id: "px-kommu-13", topic: "k-team", q: "Du sollst kurzfristig eine Präsentation übernehmen und spürst Ehrgeiz, Müdigkeit und Angst vor einem Nein. Was empfiehlt das Modell des Inneren Teams?", opts: ["Der lautesten Stimme folgen", "Die Stimmen benennen, anhören und vor der Antwort zu einer Haltung einigen", "Sofort zusagen", "Die Stimmen unterdrücken"], a: 1, why: "Ein geeinigtes Inneres Team führt zu einer klaren, authentischen Antwort.", ex: "" },
    { id: "px-kommu-14", topic: "k-team", tf: true, q: "Laut Schulz von Thun ist ein zerstrittenes Inneres Team eine psychische Störung.", a: 1, why: "Falsch: Es ist normale innere Pluralität. Sie kann lähmen, lässt sich aber zu einem Team ordnen.", ex: "" },
    { id: "px-kommu-15", topic: "k-team", q: "Nonverbale Kommunikation transportiert laut Eisbergtheorie eher …, Sprache eher …", opts: ["Emotionen / Verstand", "Verstand / Emotionen", "Fakten / Werte", "Appelle / Beziehungen"], a: 0, why: "Körpersprache zeigt Gefühle, Worte tragen den rationalen Inhalt.", ex: "" },
    /* k-watz */
    { id: "px-kommu-16", topic: "k-watz", q: "Die neue Kollegin sitzt in der Mittagspause allein und schaut aufs Handy. Das Team deutet: „Sie will keinen Kontakt.“ Welches Axiom?", opts: ["Axiom 1: Man kann nicht nicht kommunizieren", "Axiom 3: Interpunktion", "Axiom 4: digital und analog", "Axiom 5: komplementär"], a: 0, why: "Auch Schweigen und Nichthandeln haben Mitteilungscharakter.", ex: "" },
    { id: "px-kommu-17", topic: "k-watz", q: "Zwei Senior-Entwickler überbieten sich in Code-Reviews mit immer schärferen Kommentaren. Was liegt vor?", opts: ["Komplementäre Beziehung", "Symmetrische Eskalation", "Gelungene Metakommunikation", "Digitale Kommunikation"], a: 1, why: "Beide wollen sich gegenseitig „ausstechen“: Störung nach Axiom 5.", ex: "" },
    { id: "px-kommu-18", topic: "k-watz", q: "Was bedeutet „digital“ bei Watzlawick?", opts: ["Über elektronische Medien", "In Worten und Zeichen mit festgelegter Bedeutung, vor allem der Inhaltsaspekt", "Über Mimik und Gestik", "Ausschließlich in Zahlen"], a: 1, why: "Prüfungsfalle: digital ≠ elektronisch. Analog meint Mimik, Gestik, Tonfall.", ex: "" },
    { id: "px-kommu-19", topic: "k-watz", q: "„Super gemacht“ mit Augenrollen gesagt. Was bestimmt, wie der Satz verstanden wird?", opts: ["Der Inhaltsaspekt", "Der Beziehungsaspekt, hier analog übermittelt", "Die Interpunktion", "Die Redundanz"], a: 1, why: "Axiom 2: Der Beziehungsaspekt bestimmt den Inhaltsaspekt. Das Augenrollen kippt die Bedeutung.", ex: "" },
    { id: "px-kommu-20", topic: "k-watz", q: "Eva kontrolliert, weil Jonas nichts meldet; Jonas meldet nichts, weil Eva kontrolliert. Was hilft am ehesten?", opts: ["Klären, wer angefangen hat", "Den Kreislauf gemeinsam beschreiben und eine neue Vereinbarung treffen", "Den Kontakt reduzieren", "Die Chefin entscheiden lassen, wer schuld ist"], a: 1, why: "Nach Axiom 3 gibt es keinen objektiven Anfang. Der Streit um Schuld führt nicht weiter.", ex: "" },
    { id: "px-kommu-21", topic: "k-watz", q: "Mentorin und Praktikant: Sie erklärt, er fragt nach. Welche Beziehungsform liegt vor?", opts: ["symmetrisch", "komplementär", "eskalierend", "paradox"], a: 1, why: "Die Verhaltensweisen ergänzen sich auf Basis von Unterschiedlichkeit. Das ist nicht automatisch gestört.", ex: "" },
    /* k-gfkhalt */
    { id: "px-kommu-22", topic: "k-gfkhalt", q: "Ein Kunde schreit am Telefon. Welche GFK-Grundannahme hilft, gelassen zu bleiben?", opts: ["„Jegliche Form von Gewalt ist ein tragischer Ausdruck unerfüllter Bedürfnisse.“", "„Der Kunde hat immer recht.“", "„Wer schreit, hat verloren.“", "„Lob beruhigt jeden.“"], a: 0, why: "Hinter dem Schreien stehen Bedürfnisse wie Verlässlichkeit. Die Giraffe hört sie heraus.", ex: "" },
    { id: "px-kommu-23", topic: "k-gfkhalt", q: "Aufrichtigkeit heißt in der GFK …", opts: ["dem anderen ehrlich sagen, was an ihm falsch ist", "mitteilen, wie ich mich fühle und was ich brauche", "allem zustimmen", "nur Fakten nennen"], a: 1, why: "Aufrichtigkeit bezieht sich auf das eigene Erleben, nicht auf Urteile über andere.", ex: "" },
    { id: "px-kommu-24", topic: "k-gfkhalt", q: "„Wer so eine Mail schreibt, hat keinen Anstand.“ Wolf oder Giraffe?", opts: ["Giraffe, weil es ehrlich ist", "Wolf: moralisches Urteil über eine Person", "Giraffe, weil kein Schimpfwort vorkommt", "Weder noch"], a: 1, why: "Die Aussage urteilt darüber, wie jemand ist.", ex: "" },
    { id: "px-kommu-25", topic: "k-gfkhalt", q: "Welche Grundannahme passt zu „Lieber einen unfertigen Prototyp zeigen als gar keinen“?", opts: ["Alles, was es wert ist getan zu werden, ist es auch wert, unvollkommen getan zu werden.", "Wir können Bedürfnisse durch Kooperation statt Konkurrenz erfüllen.", "Jegliche Gewalt ist Ausdruck unerfüllter Bedürfnisse.", "Ziel des Lebens ist Perfektion."], a: 0, why: "Grundannahme 5 nach Rosenberg.", ex: "" },
    { id: "px-kommu-26", topic: "k-gfkhalt", q: "Empathie bedeutet in der GFK …", opts: ["Ratschläge geben", "ganz bei der anderen Person sein und ihre Gefühle und Bedürfnisse wahrnehmen", "Mitleid zeigen", "der anderen Person zustimmen"], a: 1, why: "Empathie ist Präsenz, kein Rat und keine Zustimmung.", ex: "" },
    /* k-block */
    { id: "px-kommu-27", topic: "k-block", q: "„Warum kannst du nicht so strukturiert arbeiten wie Lukas?“ Welche Blockade?", opts: ["Vergleich", "Verantwortung leugnen", "Drohung", "Lob"], a: 0, why: "Der Vergleich mit anderen blockiert Kooperation.", ex: "" },
    { id: "px-kommu-28", topic: "k-block", q: "„Super gemacht! Dann schaffst du ja auch noch die Wochenendschicht.“ Welche Blockade?", opts: ["Moralisches Urteil", "Lob, um ein Verhalten zu erwirken", "Vergleich", "Beobachtung"], a: 1, why: "Das Lob dient als Hebel, nicht als Ausdruck echter Wertschätzung.", ex: "" },
    { id: "px-kommu-29", topic: "k-block", q: "„Wenn der Bericht morgen nicht da ist, rede ich mit der Chefin.“ Welche Blockade?", opts: ["Forderung mit Drohung", "Vergleich", "Verantwortung leugnen", "Lob"], a: 0, why: "Eine Konsequenz wird angedroht, das Gegenüber hat keine Wahl.", ex: "" },
    { id: "px-kommu-30", topic: "k-block", q: "„Das Problem mit dir ist, dass du ein Chaot bist.“ Welche Blockade?", opts: ["Moralisches Urteil (Diagnose, Schublade)", "Vergleich", "Strafe", "Verantwortung leugnen"], a: 0, why: "Eine Eigenschaft wird der Person zugeschrieben.", ex: "" },
    { id: "px-kommu-31", topic: "k-block", q: "Was bewirken diese Blockaden laut Rosenberg?", opts: ["Sie erhöhen die Kooperationsbereitschaft", "Sie lenken die Aufmerksamkeit von Bedürfnissen auf Bewertungen und senken die Kooperationsbereitschaft", "Sie machen Gespräche kürzer und damit effizienter", "Sie wirken nur bei Fremden"], a: 1, why: "Rosenberg nennt das lebensentfremdende Kommunikation.", ex: "" },
    /* k-beob */
    { id: "px-kommu-32", topic: "k-beob", q: "Welche Aussage ist eine Beobachtung?", opts: ["„Du bist im Meeting nie bei der Sache.“", "„In den letzten zwei Meetings hattest du den Laptop offen und hast getippt, während ich präsentiert habe.“", "„Du interessierst dich nicht für mein Thema.“", "„Du bist unhöflich.“"], a: 1, why: "Konkret, zeitlich eingegrenzt, kamera-tauglich.", ex: "" },
    { id: "px-kommu-33", topic: "k-beob", q: "„Du antwortest viel zu spät auf Mails.“ Welche Umformulierung ist eine Beobachtung?", opts: ["„Du bist bei Mails langsam.“", "„Meine Mail vom Montag 9 Uhr hast du am Mittwoch 15 Uhr beantwortet.“", "„Du ignorierst meine Mails.“", "„Du antwortest oft spät.“"], a: 1, why: "Nur diese Version nennt überprüfbare Zeitpunkte ohne Wertung.", ex: "" },
    { id: "px-kommu-34", topic: "k-beob", q: "Welche Aussage vermischt Beobachtung und Bewertung?", opts: ["„Sie hat den Code ohne Tests eingecheckt, was total unprofessionell ist.“", "„Sie hat den Code ohne Tests eingecheckt.“", "„Der Build ist seit 10 Uhr rot.“", "„Er hat heute zweimal gefragt.“"], a: 0, why: "Der erste Teil ist beobachtbar, „total unprofessionell“ ist ein Urteil.", ex: "" },
    { id: "px-kommu-35", topic: "k-beob", q: "Warum trennt die GFK Beobachtung und Bewertung?", opts: ["Weil Bewertungen verboten sind", "Weil vermischte Aussagen als Kritik ankommen und Widerstand auslösen", "Weil Beobachtungen kürzer sind", "Um die andere Person zu widerlegen"], a: 1, why: "Eine Beobachtung schafft eine gemeinsame Realität, der niemand widersprechen muss.", ex: "" },
    { id: "px-kommu-36", topic: "k-beob", q: "Welches Wort macht „Er kommt schon wieder zu spät.“ zur Bewertung?", opts: ["„er“", "„kommt“", "„schon wieder“ und „zu spät“", "Keines"], a: 2, why: "„Schon wieder“ verallgemeinert, „zu spät“ wertet. Beobachtung: „Er kam um 9:20, vereinbart war 9:00.“", ex: "" },
    /* k-gef */
    { id: "px-kommu-37", topic: "k-gef", q: "Welche Formulierung drückt ein echtes Gefühl aus?", opts: ["„Ich fühle mich bevormundet.“", "„Ich bin besorgt.“", "„Ich habe das Gefühl, dass das Projekt scheitert.“", "„Ich fühle mich wie ein Versager.“"], a: 1, why: "Die anderen enthalten eine Handlung anderer, „Gefühl, dass“ oder „wie“.", ex: "" },
    { id: "px-kommu-38", topic: "k-gef", q: "„Ich fühle mich übergangen.“ Welches echte Gefühl könnte dahinterstecken?", opts: ["ignoriert", "enttäuscht", "ausgeschlossen", "benutzt"], a: 1, why: "Nur „enttäuscht“ beschreibt den eigenen inneren Zustand.", ex: "" },
    { id: "px-kommu-39", topic: "k-gef", q: "Welches Warnsignal steckt in „Ich fühle, dass das Meeting sinnlos ist“?", opts: ["„fühlen“ + „dass“", "ein Gefühlswort", "eine Bitte", "eine Beobachtung"], a: 0, why: "Nach „fühlen, dass“ folgt ein Gedanke, kein Gefühl.", ex: "" },
    { id: "px-kommu-40", topic: "k-gef", q: "Was ist laut GFK die Ursache eines Gefühls?", opts: ["Das Verhalten der anderen Person", "Ein erfülltes oder unerfülltes Bedürfnis; das Verhalten ist nur Auslöser", "Der Zufall", "Die Bewertung durch andere"], a: 1, why: "Deshalb übernimmt man in der GFK Verantwortung für die eigenen Gefühle.", ex: "" },
    { id: "px-kommu-41", topic: "k-gef", q: "„Ich fühle mich inkompetent als Entwicklerin“ ist …", opts: ["ein echtes Gefühl", "eine Selbstbewertung, also ein Pseudogefühl", "eine Bitte", "ein Bedürfnis"], a: 1, why: "Ein mögliches Gefühl dahinter: frustriert oder verunsichert.", ex: "" },
    /* k-bed */
    { id: "px-kommu-42", topic: "k-bed", q: "Welche Aussage nennt ein Bedürfnis?", opts: ["„Mir ist Wertschätzung wichtig.“", "„Ich brauche, dass du mich lobst.“", "„Ich will freitags Homeoffice.“", "„Ich brauche einen neuen Laptop.“"], a: 0, why: "Wertschätzung ist abstrakt und unabhängig von Person, Ort und Zeit.", ex: "" },
    { id: "px-kommu-43", topic: "k-bed", q: "„Ständig platzt jemand in mein Büro!“ Welches Bedürfnis steckt am ehesten dahinter?", opts: ["Konzentration bzw. Ruhe", "Kontrolle über die Kollegen", "Feiern", "Nahrung"], a: 0, why: "Strategie 1: erwünscht wäre vorher fragen → Bedürfnis Ruhe und Konzentration.", ex: "" },
    { id: "px-kommu-44", topic: "k-bed", q: "„Das Meeting war völlig chaotisch!“ Welches Bedürfnis findest du mit Strategie 2 (Gegenteil der Bewertung)?", opts: ["Struktur, Klarheit", "Spiel", "Autonomie", "Nähe"], a: 0, why: "chaotisch → geordnet → Bedürfnis nach Struktur und Klarheit.", ex: "" },
    { id: "px-kommu-45", topic: "k-bed", q: "Warum ist „Ich brauche, dass Max pünktlich ist“ kein Bedürfnis im Sinne der GFK?", opts: ["Weil es zu höflich ist", "Weil es an eine Person und ein Verhalten gebunden ist, also eine Strategie", "Weil Pünktlichkeit nicht wichtig ist", "Weil Bedürfnisse immer negativ sind"], a: 1, why: "Das Bedürfnis dahinter wäre z. B. Verlässlichkeit.", ex: "" },
    { id: "px-kommu-46", topic: "k-bed", q: "Welche Bedürfnisgruppe nach Rosenberg passt zu „selbst entscheiden, wie ich meine Aufgabe löse“?", opts: ["Autonomie", "Feiern", "Spiel", "Nähren der physischen Existenz"], a: 0, why: "Autonomie: eigene Ziele und Wege wählen.", ex: "" },
    /* k-bitte */
    { id: "px-kommu-47", topic: "k-bitte", q: "Welche ist eine erfolgversprechende Lösungsbitte?", opts: ["„Sei bitte etwas engagierter.“", "„Wärst du bereit, bis Donnerstag 12 Uhr deine Testfälle ins Wiki zu stellen?“", "„Ich hätte gern mehr Unterstützung.“", "„Mach nicht immer alles auf den letzten Drücker.“"], a: 1, why: "Konkret, machbar, mit Zeitpunkt und als Frage formuliert.", ex: "" },
    { id: "px-kommu-48", topic: "k-bitte", q: "Was ist an „Hör auf, mich ständig zu unterbrechen!“ ungünstig?", opts: ["Nichts", "Es sagt, was ich nicht will, statt was ich will, und klingt wie eine Forderung", "Es ist zu konkret", "Es enthält ein Gefühl"], a: 1, why: "Besser: „Kannst du mich meinen Punkt zu Ende erklären lassen?“", ex: "" },
    { id: "px-kommu-49", topic: "k-bitte", q: "Du bittest um Hilfe, die Kollegin sagt Nein. Du sagst: „Typisch, auf dich kann man nie zählen.“ Was zeigt das?", opts: ["Es war eine echte Bitte", "Es war eine Forderung", "Es war eine Beziehungsbitte", "Es war eine Beobachtung"], a: 1, why: "Folgen auf ein Nein Kritik oder Schuld, war es eine Forderung.", ex: "" },
    { id: "px-kommu-50", topic: "k-bitte", q: "Welche ist eine Beziehungsbitte?", opts: ["„Kannst du die Tür schließen?“", "„Magst du mir sagen, wie das, was ich gesagt habe, bei dir ankommt?“", "„Schick mir den Bericht.“", "„Sei pünktlich.“"], a: 1, why: "Beziehungsbitten fragen nach dem Verständnis oder dem Befinden des Gegenübers.", ex: "" },
    { id: "px-kommu-51", topic: "k-bitte", q: "Warum braucht eine GFK-Mitteilung nach Beobachtung, Gefühl und Bedürfnis noch eine Bitte?", opts: ["Aus Höflichkeit", "Weil die Mitteilung sonst leicht als Vorwurf ankommt und unklar bleibt, was das Gegenüber tun könnte", "Weil die Bitte das Wichtigste ist und der Rest weggelassen werden kann", "Damit das Gegenüber nicht Nein sagen kann"], a: 1, why: "Ohne Bitte bleibt nur die Klage. Ohne Gefühl und Bedürfnis wirkt die Bitte dagegen wie eine Forderung.", ex: "" },
    /* k-4s */
    { id: "px-kommu-52", topic: "k-4s", q: "Welche Version enthält alle vier Schritte korrekt?", opts: ["„Du kommst immer zu spät, das nervt, sei pünktlich!“", "„Du bist um 9:20 gekommen, vereinbart war 9:00. Ich bin ungeduldig, weil mir unsere Zeit wichtig ist. Kannst du mir Bescheid geben, wenn du später kommst?“", "„Ich fühle mich von dir ignoriert, weil du unpünktlich bist.“", "„Ich bin sauer. Komm pünktlich.“"], a: 1, why: "Beobachtung – Gefühl – Bedürfnis – Bitte, jeweils ohne Bewertung.", ex: "" },
    { id: "px-kommu-53", topic: "k-4s", q: "Kollege schimpft: „Diese Deadline ist ein Witz!“ Welche Reaktion nutzt die vier Schritte beim empathischen Empfangen?", opts: ["„Reg dich nicht so auf.“", "„Bist du gestresst, weil du dir eine realistischere Planung wünschst?“", "„Die Deadline hat die Chefin gesetzt, nicht ich.“", "„Andere schaffen das auch.“"], a: 1, why: "Gefühl und Bedürfnis des Gegenübers werden vermutet und als Frage angeboten.", ex: "" },
    { id: "px-kommu-54", topic: "k-4s", q: "Welche Formulierung ist im Bedürfnisschritt korrekt?", opts: ["„weil du nie zuverlässig bist“", "„weil mir Verlässlichkeit wichtig ist“", "„weil du mir den Bericht schicken sollst“", "„weil ich mich ausgenutzt fühle“"], a: 1, why: "Das Bedürfnis gehört zu mir und beschreibt kein Verhalten des anderen.", ex: "" },
    { id: "px-kommu-55", topic: "k-4s", q: "Was ist der häufigste Fehler im zweiten Schritt?", opts: ["Ein Pseudogefühl wie „ignoriert“ statt eines echten Gefühls", "Eine zu konkrete Beobachtung", "Eine Bitte als Frage", "Ein abstraktes Bedürfnis"], a: 0, why: "Pseudogefühle beschreiben, was andere angeblich tun, und wirken als Vorwurf.", ex: "" },
    /* k-zuh */
    { id: "px-kommu-56", topic: "k-zuh", q: "Kollegin: „Mein Merge-Request liegt seit Tagen ohne Review herum.“ Welche Antwort ist aktives Zuhören?", opts: ["„Dann schreib halt dem Teamleiter.“", "„Du wartest schon länger auf Rückmeldung und das ärgert dich?“", "„Bei mir dauert es auch immer.“", "„Das ist doch nicht so schlimm.“"], a: 1, why: "Inhalt paraphrasieren, Gefühl verbalisieren, als Frage zur Überprüfung.", ex: "" },
    { id: "px-kommu-57", topic: "k-zuh", q: "Welche Reaktion ist ein Gesprächsblocker?", opts: ["„Erzähl mal, was ist passiert?“", "„An deiner Stelle würde ich einfach kündigen.“", "„Du klingst enttäuscht.“", "Nicken und Blickkontakt halten"], a: 1, why: "Ratschläge senden eine eigene Botschaft statt zuzuhören.", ex: "" },
    { id: "px-kommu-58", topic: "k-zuh", q: "Ein Kunde versteht nicht, was „Cache leeren“ bedeutet. Welche Zuhörbarriere ist das?", opts: ["physisch", "emotional", "semantisch", "keine"], a: 2, why: "Es geht um unterschiedliches Vokabular.", ex: "" },
    { id: "px-kommu-59", topic: "k-zuh", q: "Was bedeutet „Zeit geben“ beim aktiven Zuhören?", opts: ["Das Gespräch auf später verschieben", "Pausen aushalten und nicht dazwischenreden", "Möglichst schnell eine Lösung finden", "Auf die Uhr schauen"], a: 1, why: "In Pausen ordnet das Gegenüber oft seine wichtigsten Gedanken.", ex: "" },
    { id: "px-kommu-60", topic: "k-zuh", q: "„Das klingt wirklich frustrierend.“ Was wird hier gemacht?", opts: ["Paraphrasieren des Inhalts", "Verbalisieren des Gefühls", "Ein Ratschlag", "Ein Themenwechsel"], a: 1, why: "Paraphrasieren gibt den Inhalt wieder, Verbalisieren spricht das Gefühl an.", ex: "" },
    /* k-ich */
    { id: "px-kommu-61", topic: "k-ich", q: "Welche ist eine verkleidete Du-Botschaft?", opts: ["„Ich bin enttäuscht, weil mir Verlässlichkeit wichtig ist.“", "„Ich finde, du bist unzuverlässig.“", "„Ich wünsche mir eine kurze Info, wenn sich etwas verschiebt.“", "„Mir ist Ruhe gerade wichtig.“"], a: 1, why: "Sie beginnt mit „ich“, enthält aber ein Urteil über die andere Person.", ex: "" },
    { id: "px-kommu-62", topic: "k-ich", q: "Wie lautet „Du unterbrichst mich ständig!“ als Ich-Botschaft?", opts: ["„Ich finde, du bist unhöflich.“", "„Ich bin frustriert, wenn ich meinen Satz nicht beenden kann, weil ich gehört werden möchte. Lässt du mich ausreden?“", "„Ich fühle mich von dir unterbrochen.“", "„Ich sag ja nur, dass du störst.“"], a: 1, why: "Echtes Gefühl, Verhalten ohne Schuld, Bedürfnis und Wunsch.", ex: "" },
    { id: "px-kommu-63", topic: "k-ich", q: "Warum lösen Du-Botschaften oft Verteidigung aus?", opts: ["Weil sie zu kurz sind", "Weil sie meist eine Bewertung oder Diagnose über die andere Person enthalten", "Weil sie das Wort „du“ enthalten, das grundsätzlich verboten ist", "Weil sie Gefühle ausdrücken"], a: 1, why: "Wer sich beurteilt fühlt, verteidigt sich, statt zuzuhören.", ex: "" },
    { id: "px-kommu-64", topic: "k-ich", q: "Welcher „wenn“-Teil beschreibt das Verhalten ohne Schuld?", opts: ["„wenn du wieder mal schlampig bist“", "„wenn die Tests vor dem Merge nicht laufen“", "„wenn du mich absichtlich ärgerst“", "„wenn du dich wie immer drückst“"], a: 1, why: "Nur diese Version beschreibt eine überprüfbare Situation ohne Unterstellung.", ex: "" },
    /* k-harv */
    { id: "px-kommu-65", topic: "k-harv", q: "Zwei Abteilungen teilen sich die Serverkosten. Welches ist ein objektives Kriterium?", opts: ["Wer lauter argumentiert", "Der Anteil an CPU-Stunden laut Monitoring", "Wer länger im Unternehmen ist", "Wer zuerst gefragt hat"], a: 1, why: "Objektive Kriterien sind unabhängig vom Willen der Parteien und für beide nachvollziehbar.", ex: "" },
    { id: "px-kommu-66", topic: "k-harv", q: "Team A sagt: „Wir wollen den Besprechungsraum am Montag!“ Welche Frage folgt dem Prinzip „Interessen statt Positionen“?", opts: ["„Warum seid ihr so stur?“", "„Wofür braucht ihr den Raum, was ist euch am Montag wichtig?“", "„Wer hat ihn zuerst reserviert?“", "„Können wir nicht einfach losen?“"], a: 1, why: "W-Fragen machen das Interesse hinter der Position sichtbar.", ex: "" },
    { id: "px-kommu-67", topic: "k-harv", q: "„Menschen und Probleme trennen“ bedeutet …", opts: ["Emotionen ignorieren", "Emotionen ansprechen, ohne Schuld zuzuweisen, und das Problem sachlich gemeinsam angehen", "Nur schriftlich verhandeln", "Die Gegenseite als Feind behandeln"], a: 1, why: "Weder Freund noch Feind: weich zu den Menschen, hart in der Sache.", ex: "" },
    { id: "px-kommu-68", topic: "k-harv", q: "Lieferant und Kunde einigen sich nicht, schlimmstenfalls droht ein teurer Rechtsstreit. Wie nennt man dieses Szenario?", opts: ["BATNA", "WATNA", "Option", "Position"], a: 1, why: "WATNA = Worst Alternative To (a) Negotiated Agreement.", ex: "" },
    { id: "px-kommu-69", topic: "k-harv", q: "„Sowohl als auch statt entweder oder“ gehört zu welchem Prinzip?", opts: ["Menschen und Probleme trennen", "Interessen statt Positionen", "Optionen entwickeln", "Objektive Kriterien"], a: 2, why: "Brainstorming von Optionen zum beiderseitigen Vorteil.", ex: "" },
    { id: "px-kommu-70", topic: "k-harv", q: "Warum solltest du deine BATNA vor einer Verhandlung kennen?", opts: ["Damit du sie der Gegenseite sofort verrätst", "Damit du keine Einigung akzeptierst, die schlechter ist als deine beste Alternative", "Weil sie deine Mindestforderung festlegt, die du nie unterschreiten darfst", "Sie ist nur für die Gegenseite relevant"], a: 1, why: "Die BATNA ist dein Maßstab. Sie ist keine starre Mindestforderung, sondern eine echte Alternative.", ex: "" }
  ],

  flashcards: [
    ["Sender-Empfänger-Modell", "Gedanke → codieren → Kanal (mit Störungen) → decodieren → Wirkung; Rückkopplung macht es wechselseitig.", "k-grund"],
    ["Rückkopplung (Feedback)", "Die Empfängerin meldet zurück, was angekommen ist; Missverständnisse fallen sofort auf.", "k-grund"],
    ["Missverständnis (Vier Ohren)", "Senderin und Empfängerin „funken“ auf unterschiedlichen Seiten, z. B. Sache gemeint, Beziehung gehört.", "k-svt"],
    ["Interpunktion (Axiom 3)", "Jede Seite setzt den Anfang eines Kreislaufs anders; objektiv gibt es keinen Anfang.", "k-watz"],
    ["digital ≠ elektronisch", "Digital bei Watzlawick = Worte/Zeichen mit festgelegter Bedeutung (Inhalt); analog = Mimik, Gestik, Tonfall (Beziehung).", "k-watz"],
    ["„Müssen“-Test (GFK)", "„Ich muss …“ ersetzen durch „Ich entscheide mich zu …, weil mir … wichtig ist.“", "k-block"],
    ["Kamera-Test", "Könnte eine Kamera es aufzeichnen und kann das Gegenüber nicht widersprechen? Dann ist es eine Beobachtung.", "k-beob"],
    ["Ersetz-Test (Gefühl)", "Passt „ich denke“ statt „ich fühle“? Dann ist es ein Gedanke, kein Gefühl.", "k-gef"],
    ["Auslöser vs. Ursache", "Das Verhalten anderer löst ein Gefühl aus; die Ursache ist ein erfülltes oder unerfülltes Bedürfnis.", "k-gef"],
    ["Strategie vs. Bedürfnis", "Strategie: konkret (Person, Ort, Zeit, Handlung). Bedürfnis: abstrakt und universell, z. B. Ruhe.", "k-bed"],
    ["Nein-Test", "Folgen auf ein Nein Vorwürfe oder Schuldgefühle, war die Bitte eine Forderung.", "k-bitte"],
    ["Empathisch empfangen", "Beim Gegenüber Gefühl und Bedürfnis vermuten und nachfragen: „Bist du …, weil dir … wichtig ist?“", "k-4s"],
    ["Paraphrasieren vs. Verbalisieren", "Paraphrasieren: Inhalt in eigenen Worten. Verbalisieren: das Gefühl ansprechen.", "k-zuh"],
    ["Verkleidete Du-Botschaft", "Beginnt mit „ich“, enthält aber ein Urteil: „Ich finde, du bist …“.", "k-ich"],
    ["Objektive Kriterien", "Faire, vom Willen beider unabhängige Maßstäbe: Marktdaten, Messwerte, Regeln, Präzedenzfälle.", "k-harv"]
  ].map((c, i) => ({ id: "px-kommu-f" + (i + 1), cat: "Kommunikation", topic: c[2], front: c[0], back: c[1] }))
});
})();
