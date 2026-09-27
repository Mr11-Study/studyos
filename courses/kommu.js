/* Kommunikationstraining (KOMMU) — WINF 2025, WS 2026/27, Lisa Zimmermann */
(function () {
const TOPICS = {
  "k-grund":   { name: "Grundlagen der Kommunikation", lesson: "k1-1" },
  "k-svt":     { name: "Vier-Ohren-Modell",            lesson: "k2-1" },
  "k-team":    { name: "Eisberg & Inneres Team",       lesson: "k2-2" },
  "k-watz":    { name: "Watzlawicks Axiome",           lesson: "k3-1" },
  "k-gfkhalt": { name: "GFK: Grundhaltung",            lesson: "k4-1" },
  "k-block":   { name: "Blockaden",                    lesson: "k4-2" },
  "k-beob":    { name: "Beobachtung vs. Bewertung",    lesson: "k5-1" },
  "k-gef":     { name: "Gefühle vs. Pseudogefühle",    lesson: "k5-2" },
  "k-bed":     { name: "Bedürfnisse",                  lesson: "k5-3" },
  "k-bitte":   { name: "Bitten",                       lesson: "k5-4" },
  "k-4s":      { name: "4 Schritte anwenden",          lesson: "k5-5" },
  "k-zuh":     { name: "Aktives Zuhören",              lesson: "k6-1" },
  "k-ich":     { name: "Ich-Botschaften",              lesson: "k6-2" },
  "k-harv":    { name: "Harvard-Konzept",              lesson: "k7-1" }
};

const WORLDS = [
 { id: "kw1", n: 1, title: "Grundlagen der Kommunikation", sub: "Gesagt ist nicht gehört", boss: null, lessons: [
  { id: "k1-1", title: "Vom Senden zum Anwenden", topic: "k-grund", min: 8, xp: 20, blocks: [
    { t: "lead", html: "„Gesagt bedeutet noch lange nicht gehört. Gehört bedeutet noch lange nicht verstanden. Verstanden bedeutet noch lange nicht einverstanden. Einverstanden bedeutet noch lange nicht behalten. Behalten bedeutet noch lange nicht angewandt.“ (Konrad Lorenz)" },
    { t: "widget", w: "chain", steps: ["gesagt", "gehört", "verstanden", "einverstanden", "behalten", "angewandt"], note: "Kommunikation ist erst erfolgreich, wenn alle Stationen durchlaufen werden. An jeder Station kann sie abbrechen." },
    { t: "text", h: "Das Grundmodell", levels: {
      simple: "Wer sagt was zu wem, auf welchem Weg und was bewirkt es?",
      normal: "Die Lasswell-Frage zerlegt Kommunikation in Bestandteile: <b>Wer</b> sagt (Senderin) <b>was</b> (Botschaft) <b>zu wem</b> (Empfängerin) <b>auf welchem Kanal</b> (Medium) <b>mit welcher Wirkung</b> (Effekt)? Um verstanden zu werden, muss man die Sprache der Empfängerin sprechen, auch ihren Jargon.",
      technical: "Kommunikation kann unidirektional oder bidirektional sein und 1:1, 1:n, n:1 oder n:n verlaufen. Störungen der Übertragung (Lärm, Ausfall) unterbinden oder verfälschen Information; dagegen hilft Redundanz, im einfachsten Fall Wiederholung. Natürliche Sprachen sind immer teilweise redundant." } },
    { t: "widget", w: "sorter", topic: "k-grund", title: "Kommunikationsformen zuordnen", cats: [{ k: "u11", label: "1:1 einseitig" }, { k: "b11", label: "1:1 wechselseitig" }, { k: "u1n", label: "1:n einseitig" }, { k: "nn", label: "n:n wechselseitig" }],
      items: [{ t: "E-Mail", a: "u11", why: "Eine Senderin, eine Empfängerin, keine direkte Rückkopplung." }, { t: "Telefonat", a: "b11", why: "Beide senden und empfangen." }, { t: "Rede", a: "u1n", why: "Eine spricht, viele hören zu." }, { t: "Webforum", a: "nn", why: "Viele senden, viele lesen und antworten." }, { t: "Befehl", a: "u11", why: "Unidirektional zwischen zwei Personen." }, { t: "Fernsehen", a: "u1n", why: "Ein Sender, viele Empfänger." }, { t: "Diskussionsrunde", a: "nn", why: "Viele sprechen miteinander." }, { t: "Gespräch", a: "b11", why: "Wechselseitig zwischen zwei Personen." }] },
    { t: "check", q: "Was ist laut Skript die einfachste Form von Redundanz gegen verfälschte Übertragung?", opts: ["Lauter sprechen", "Die Meldung wiederholen", "Einen anderen Kanal wählen", "Fachjargon verwenden"], a: 1, why: "Wiederholung ist die einfachste Form von Redundanz. Natürliche Sprachen enthalten immer einen Anteil davon." },
    { t: "check", q: "Im Unterricht tratschen: Was kommuniziert man dabei nonverbal?", opts: ["Nichts, weil man ja nicht mit der Lehrenden spricht", "Dass das Thema uninteressant ist oder man nicht lernen will", "Nur Informationen über das Tratschthema", "Zustimmung"], a: 1, why: "Alles, was wir tun, ist Kommunikation. Das Verhalten sendet eine Botschaft an die Umgebung." }
  ]}
 ]},
 { id: "kw2", n: 2, title: "Schulz von Thun", sub: "Vier Seiten einer Nachricht", boss: null, lessons: [
  { id: "k2-1", title: "Das Kommunikationsquadrat", topic: "k-svt", min: 12, xp: 30, blocks: [
    { t: "lead", html: "Jede Äußerung enthält, ob ich will oder nicht, <b>vier Botschaften gleichzeitig</b>. Die Senderin spricht mit vier Schnäbeln, die Empfängerin hört mit vier Ohren." },
    { t: "widget", w: "fourears", topic: "k-svt" },
    { t: "text", h: "Die vier Seiten", levels: {
      simple: "Sache: worüber ich rede. Selbstkundgabe: was ich über mich verrate. Beziehung: was ich von dir halte. Appell: was du tun sollst.",
      normal: "<b style=\"color:#4C9EFF\">Sachinhalt</b> (blau): Daten, Fakten, Sachverhalte; Kriterien wahr/unwahr, relevant, hinlänglich. <b style=\"color:#8BD126\">Selbstkundgabe</b> (grün): was in mir vorgeht, explizit (Ich-Botschaft) oder implizit. <b style=\"color:#EAB308\">Beziehungshinweis</b> (gelb): wie ich zu dir stehe, oft über Tonfall und Mimik; das Beziehungsohr ist besonders empfindlich. <b style=\"color:#F0616D\">Appell</b> (rot): was ich bei dir erreichen möchte, offen oder verdeckt.",
      technical: "Missverständnisse entstehen, wenn Senderin und Empfängerin auf unterschiedlichen Seiten „funken“: Die Senderin meint die Sachseite, die Empfängerin hört mit dem Beziehungsohr. Im Beruf sind das Professionelle und das Menschliche ständig verzahnt, deshalb ist das Modell dort besonders relevant." } },
    { t: "widget", w: "sorter", topic: "k-svt", title: "Welche Seite ist gemeint?", intro: "Aussage: Mariella fragt Lukas „Ist noch Kaffee da?“. Ordne jede Deutung einer Seite zu.", cats: [{ k: "s", label: "Sachinhalt" }, { k: "o", label: "Selbstkundgabe" }, { k: "b", label: "Beziehung" }, { k: "a", label: "Appell" }],
      items: [{ t: "Ich will wissen, ob es noch Kaffee gibt.", a: "s", why: "Reine Information." }, { t: "Ich habe gerade Lust auf Kaffee.", a: "o", why: "Gibt etwas über Mariella preis." }, { t: "Du musst mich bedienen.", a: "b", why: "So hört Lukas die Beziehungsseite." }, { t: "Mach bitte neuen Kaffee!", a: "a", why: "Handlungsaufforderung." }, { t: "Du wirst es wissen.", a: "b", why: "Aussage darüber, was sie Lukas zutraut." }, { t: "Ich bin müde.", a: "o", why: "Selbstkundgabe." }] },
    { t: "check", q: "Mann (im Auto): „Du, da vorne ist grün.“ Frau: „Fährst du oder fahre ich?“ Mit welchem Ohr hat die Frau gehört?", opts: ["Sachohr", "Selbstkundgabe-Ohr", "Beziehungsohr", "Appellohr"], a: 2, why: "Sie hört eine Bevormundung („du brauchst meine Hilfe beim Fahren“) und reagiert auf die Beziehungsseite." },
    { t: "check", q: "Welche Farbe hat die Selbstkundgabe im Kommunikationsquadrat?", opts: ["Blau", "Grün", "Gelb", "Rot"], a: 1, why: "Sache blau, Selbstkundgabe grün, Beziehung gelb, Appell rot." }
  ]},
  { id: "k2-2", title: "Eisberg und Inneres Team", topic: "k-team", min: 8, xp: 20, blocks: [
    { t: "text", h: "Die Eisbergtheorie", levels: {
      simple: "Nur ein kleiner Teil einer Botschaft ist sichtbar. Der größere Teil liegt unter der Oberfläche: Gefühle, Werte, Bedürfnisse.",
      normal: "Nach Freuds Eisbergmetapher trifft der Mensch mindestens 80 % seiner Entscheidungen „im Bauch“. Nonverbale Kommunikation transportiert eher Emotionen, Sprache eher den Verstand. Wenn Gefahr droht, wird die Sprache unwichtiger als das Nonverbale.",
      technical: "Die Grafik der vier Ohren auf Basis der Eisbergtheorie ordnet zu: Wortbedeutung (sichtbar), Appell (unausgesprochene Wünsche), Kontaktvergewisserung (Ich-Standpunkt zum Gegenüber, vgl. Transaktionsanalyse) und Selbstoffenbarung (verborgene Werte, Normen, Emotionen; Freuds „Es“ und „Über-Ich“)." } },
    { t: "text", h: "Das Innere Team", levels: {
      simple: "In uns gibt es mehrere Stimmen, die sich oft nicht einig sind. Wer sie kennt und einigt, spricht klarer.",
      normal: "Schulz von Thun: Meist wohnen mehrere Seelen in unserer Brust. Ein zerstrittener innerer Haufen kann lähmen, ist aber keine Störung, sondern normale innere Pluralität. Gelingt es, daraus ein „Inneres Team“ zu machen, reagiert man klarer, authentischer und situationsgerechter.",
      technical: "Vorgehen: innere Mitarbeiterinnen zu einem Thema identifizieren, benennen und zu einem „Reflecting Team“ zusammenführen, bevor man nach außen kommuniziert." } },
    { t: "check", q: "Laut Eisbergtheorie werden wie viele Entscheidungen „im Bauch“ getroffen?", opts: ["etwa 20 %", "etwa 50 %", "mindestens 80 %", "alle"], a: 2, why: "Das Skript nennt mindestens 80 % aller Entscheidungen." },
    { t: "check", q: "Was ist das Ziel der Arbeit mit dem Inneren Team?", opts: ["Alle inneren Stimmen bis auf eine zum Schweigen bringen", "Die Stimmen identifizieren und zu einer Einigung führen", "Nur die lauteste Stimme sprechen lassen", "Die Stimmen ignorieren"], a: 1, why: "Innere Synergie entsteht, wenn alle Stimmen gehört und geeinigt werden." }
  ]}
 ]},
 { id: "kw3", n: 3, title: "Paul Watzlawick", sub: "Fünf Axiome", boss: { id: "boss-kw3", title: "Theorien-Boss", topics: ["k-grund", "k-svt", "k-team", "k-watz"] }, lessons: [
  { id: "k3-1", title: "Die fünf Axiome", topic: "k-watz", min: 14, xp: 30, blocks: [
    { t: "lead", html: "„Wahr ist nicht, was ich sage, sondern was mein Gegenüber hört!“" },
    { t: "widget", w: "axioms" },
    { t: "widget", w: "pairs", topic: "k-watz", title: "Beispiel → Axiom", pairs: [
      ["Eine Frau im Wartezimmer starrt nur auf den Boden.", "1 · Man kann nicht nicht kommunizieren"],
      ["„Du hast im Lotto gewonnen!“ – mit einem breiten Grinsen gesagt.", "2 · Inhalts- und Beziehungsaspekt"],
      ["Sie nörgelt, weil er sich zurückzieht; er zieht sich zurück, weil sie nörgelt.", "3 · Ursache und Wirkung (Interpunktion)"],
      ["Ein Küsschen kann „Wir mögen dich“ oder „Lass uns in Ruhe“ bedeuten.", "4 · Analoge und digitale Modalitäten"],
      ["Zwei Kolleginnen versuchen sich im Meeting ständig gegenseitig zu übertrumpfen.", "5 · Symmetrisch oder komplementär"]] },
    { t: "check", q: "Wann liegt nach Axiom 5 eine Störung vor?", opts: ["Bei jeder komplementären Beziehung", "Bei einer symmetrischen Eskalation", "Wenn beide gleich stark sind", "Wenn jemand schweigt"], a: 1, why: "Wenn Partner sich gegenseitig „ausstechen“ wollen, eskaliert die symmetrische Beziehung." },
    { t: "check", q: "Welcher Aspekt bestimmt laut Axiom 2 den anderen?", opts: ["Der Inhaltsaspekt den Beziehungsaspekt", "Der Beziehungsaspekt den Inhaltsaspekt", "Keiner, sie sind unabhängig", "Das Medium beide"], a: 1, why: "Die Beziehungsebene legt fest, wie der Inhalt aufzufassen ist." },
    { t: "check", q: "Das Pullover-Beispiel (rot oder grün, beides ist falsch) zeigt …", opts: ["eine paradoxe Handlungsaufforderung (Doppelbindung)", "digitale Kommunikation", "gelungene Metakommunikation", "Redundanz"], a: 0, why: "Egal was A tut, es ist falsch: eine paradoxe Situation bzw. Doppelbotschaft." }
  ]}
 ]},
 { id: "kw4", n: 4, title: "Gewaltfreie Kommunikation", sub: "Wolf und Giraffe", boss: null, lessons: [
  { id: "k4-1", title: "Grundhaltung der GFK", topic: "k-gfkhalt", min: 10, xp: 25, blocks: [
    { t: "lead", html: "Für Marshall Rosenberg ist die GFK eine „Sprache des Herzens“. Sie ruht auf zwei Säulen: <b>Aufrichtigkeit</b> (ich teile mit, wie ich mich fühle und was ich brauche) und <b>Empathie</b> (ich bin ganz bei der anderen Person)." },
    { t: "keys", items: ["1. Alles, was ein Mensch tut, ist ein Versuch, eigene Bedürfnisse zu erfüllen.", "2. Jegliche Form von Gewalt ist ein tragischer Ausdruck unerfüllter Bedürfnisse.", "3. Wir können Bedürfnisse durch Kooperation statt Konkurrenz erfüllen.", "4. Es bereitet Freude, zum Wohle anderer beizutragen, wenn es freiwillig geschieht.", "5. Alles, was es wert ist getan zu werden, ist es auch wert, unvollkommen getan zu werden.", "6. Jeder Mensch macht in jedem Augenblick das Beste, was er für sein Leben tun kann.", "7. Ziel des Lebens ist nicht Perfektion, sondern all unser Lachen zu lachen und all unsere Tränen zu weinen."] },
    { t: "widget", w: "sorter", topic: "k-gfkhalt", title: "Wolf oder Giraffe?", intro: "Der Wolf steht für urteilende Sprache, die Giraffe (größtes Herz, langer Hals) für GFK.", cats: [{ k: "w", label: "🐺 Wolf" }, { k: "g", label: "🦒 Giraffe" }],
      items: [{ t: "„Du bist echt unzuverlässig.“", a: "w", why: "Bewertung statt Beobachtung." }, { t: "„Ich sehe, dass der Bericht noch nicht da ist.“", a: "g", why: "Beschreibt, was die Kamera sehen würde." }, { t: "„Ich fühle, dass du unfair bist.“", a: "w", why: "Gedanke als Gefühl getarnt." }, { t: "„Ich bin enttäuscht, weil mir Verlässlichkeit wichtig ist.“", a: "g", why: "Übernimmt Verantwortung für das eigene Gefühl." }, { t: "„Wenn du das nicht machst, dann …“", a: "w", why: "Forderung mit Drohung." }, { t: "„Wärst du bereit, heute zehn Minuten mit mir zu planen?“", a: "g", why: "Klare, erfüllbare Bitte." }, { t: "„Das muss man eben so machen, so sind die Regeln.“", a: "w", why: "Verantwortung wird geleugnet." }, { t: "„Mir ist wichtig, dass alle gehört werden.“", a: "g", why: "Fokus auf Bedürfnisse aller." }] },
    { t: "check", q: "Warum ist die Giraffe das Symboltier der GFK?", opts: ["Weil sie schnell rennt", "Weil sie das größte Herz aller Landtiere hat und den Überblick behält", "Weil sie in Rudeln lebt", "Weil sie nie Laute von sich gibt"], a: 1, why: "Größtes Herz (Sprache des Herzens) und langer Hals (Blick auf das große Ganze)." }
  ]},
  { id: "k4-2", title: "Blockaden in der Kommunikation", topic: "k-block", min: 8, xp: 20, blocks: [
    { t: "text", h: "Was Kooperation blockiert", levels: {
      simple: "Urteilen, vergleichen, „ich muss ja“, fordern, strafen und berechnendes Loben machen Gespräche zäh.",
      normal: "<b>Moralische Urteile</b> (Schuld, Beleidigung, Schubladen, Diagnosen) · <b>Vergleiche</b> · <b>Verantwortung leugnen</b> („müssen“ verschleiert Entscheidungen) · <b>Forderungen</b> (Befehle, Predigten, Drohungen) · <b>Strafe</b> · <b>Lob</b>, um Verhalten zu steuern.",
      technical: "Rosenberg nennt diese Formen „lebensentfremdende Kommunikation“. Sie verlagern die Aufmerksamkeit von Bedürfnissen auf Bewertungen und senken das „Barometer der Kooperationsbereitschaft“." } },
    { t: "widget", w: "sorter", topic: "k-block", title: "Welche Blockade?", cats: [{ k: "u", label: "Moralisches Urteil" }, { k: "v", label: "Vergleich" }, { k: "l", label: "Verantwortung leugnen" }, { k: "f", label: "Forderung / Drohung" }],
      items: [{ t: "„Sie ist faul.“", a: "u", why: "Sagt, wie jemand ist." }, { t: "„Wieso bist du nicht so erfolgreich wie Emma?“", a: "v", why: "Vergleich mit anderen." }, { t: "„Ich muss dich leider verweisen, so sind die Vorschriften.“", a: "l", why: "„Müssen“ verschleiert die eigene Entscheidung." }, { t: "„Wenn du das nicht erledigst, dann gibt's Ärger.“", a: "f", why: "Drohung." }, { t: "„Das Problem mit dir ist, dass du unfähig bist.“", a: "u", why: "Diagnose über die Person." }, { t: "„Es gibt Dinge, die man tun muss, ob es gefällt oder nicht.“", a: "l", why: "Verantwortung wird abgegeben." }] },
    { t: "check", q: "Warum kann auch Lob eine Blockade sein?", opts: ["Lob ist immer gut", "Wenn es aus urteilendem Denken kommt, um ein Verhalten zu erwirken", "Weil es zu kurz ist", "Weil Lob nur Vorgesetzte dürfen"], a: 1, why: "Die Giraffe drückt Wertschätzung in Verbindung mit eigenen Gefühlen und Bedürfnissen aus, nicht um zu steuern." }
  ]}
 ]},
 { id: "kw5", n: 5, title: "Die 4 Schritte der GFK", sub: "Beobachtung · Gefühl · Bedürfnis · Bitte", boss: { id: "boss-kw5", title: "GFK-Boss", topics: ["k-gfkhalt", "k-block", "k-beob", "k-gef", "k-bed", "k-bitte", "k-4s"] }, lessons: [
  { id: "k5-1", title: "Beobachtung statt Bewertung", topic: "k-beob", min: 12, xp: 30, blocks: [
    { t: "lead", html: "Stell dir eine <b>Kamera</b> vor: Was kann sie aufzeichnen? Eine Beobachtung schafft eine gemeinsame Wirklichkeit; die andere Person kann ihr nicht widersprechen." },
    { t: "text", h: "Beispiel „Jemand kommt zu spät“", levels: {
      simple: "Statt „Du bist unpünktlich“: „Wir haben 17 Uhr ausgemacht, jetzt ist es 17:30.“",
      normal: "„Zu spät“ ist bereits eine Bewertung. Die Kamera sieht: Treffpunkt 17:00 vereinbart, die Uhr zeigt 17:30, die Person kommt zur Tür herein. Wörter wie <i>immer, nie, schon wieder, oft, total, zu viel</i> sind Warnsignale für Bewertungen.",
      technical: "Rosenberg unterscheidet Beobachtung und Bewertung, nicht weil Bewertungen verboten sind, sondern weil vermischte Aussagen beim Gegenüber als Kritik ankommen und Widerstand auslösen." } },
    { t: "widget", w: "sorter", topic: "k-beob", title: "Beobachtung oder Bewertung? (Skript S. 36)", cats: [{ k: "o", label: "Beobachtung" }, { k: "e", label: "Bewertung" }],
      items: [{ t: "Dominic war gestern völlig grundlos wütend auf mich.", a: "e", why: "„grundlos“ und „wütend“ sind Interpretationen." }, { t: "Sarah hat mich während unserer Besprechung nicht um meine Meinung gebeten.", a: "o", why: "Konkretes, überprüfbares Verhalten." }, { t: "Natalie arbeitet zu viel.", a: "e", why: "„zu viel“ ist ein Urteil." }, { t: "Gestern hat Lea beim Fernsehen an ihren Nägeln gekaut.", a: "o", why: "Kamera-tauglich." }, { t: "Jakob ist aggressiv.", a: "e", why: "Eigenschaftszuschreibung." }, { t: "Meine Oma klagt immer, wenn ich mit ihr spreche.", a: "e", why: "„immer“ und „klagt“ verallgemeinern." }, { t: "Diese Woche habe ich dich nicht beim Sport gesehen.", a: "o", why: "Konkrete Wahrnehmung mit Zeitraum." }, { t: "Sie kommen eine halbe Stunde nach dem vereinbarten Zeitpunkt.", a: "o", why: "Messbar." }, { t: "Unsere Vortragende ist total unzuverlässig.", a: "e", why: "Urteil über die Person." }, { t: "Zwei Socken und ein Pullover liegen im Wohnzimmer auf dem Boden.", a: "o", why: "Genau das würde die Kamera zeigen." }, { t: "Du bist schon wieder unpünktlich.", a: "e", why: "„schon wieder“ plus Bewertung." }, { t: "Du hast diese Woche 3 × länger als bis 20.00 Uhr gearbeitet.", a: "o", why: "Konkret und zählbar." }, { t: "Du hörst mir nie zu.", a: "e", why: "„nie“ verallgemeinert." }, { t: "Du blätterst in der Zeitung, während ich mit dir spreche.", a: "o", why: "Beschreibt beobachtbares Verhalten." }, { t: "Dich erreicht man aber auch schlecht.", a: "e", why: "Bewertung ohne konkrete Situation." }] },
    { t: "check", q: "Woran erkennst du, dass eine Beobachtung gelungen ist?", opts: ["Die andere Person stimmt zu, dass sie falsch lag", "Die andere Person kann nicht widersprechen", "Sie ist kürzer als eine Bewertung", "Sie enthält das Wort „immer“"], a: 1, why: "Eine echte Beobachtung schafft eine gemeinsame Realität." }
  ]},
  { id: "k5-2", title: "Gefühle und Pseudogefühle", topic: "k-gef", min: 12, xp: 30, blocks: [
    { t: "lead", html: "Gefühle sind wie die Lämpchen am Armaturenbrett: Sie zeigen, ob ein wichtiges Bedürfnis gerade erfüllt ist oder nicht." },
    { t: "text", h: "Achtung, Pseudogefühl!", levels: {
      simple: "„Ich fühle mich ignoriert“ sagt, was der andere tut. Ein echtes Gefühl ist z. B. „ich bin traurig“.",
      normal: "Vorsicht, wenn nach „fühlen“ folgt: 1) <i>dass, wie, als ob</i> · 2) ein Pronomen (<i>ich habe das Gefühl, es ist sinnlos</i>) · 3) Namen oder Personen (<i>… mein Chef manipuliert</i>) · 4) ein Verb, das beschreibt, was andere tun (<i>ausgenutzt, ignoriert, übergangen, im Stich gelassen</i>).",
      technical: "„Ich fühle mich unfähig als Programmiererin“ ist eine Selbstbewertung. Das Gefühl dahinter kann Frustration, Enttäuschung oder Ungeduld sein: „Ich bin frustriert über mich selbst.“" } },
    { t: "widget", w: "sorter", topic: "k-gef", title: "Echtes Gefühl oder Pseudogefühl? (S. 37)", cats: [{ k: "g", label: "Echtes Gefühl" }, { k: "p", label: "Pseudogefühl / Gedanke" }],
      items: [{ t: "Ich habe das Gefühl, du benutzt mich.", a: "p", why: "Interpretation, was der andere tut." }, { t: "Jetzt spüre ich eine große Enttäuschung.", a: "g", why: "Enttäuschung ist ein Gefühl." }, { t: "Ich fühle mich im Stich gelassen.", a: "p", why: "Beschreibt, was andere (nicht) tun." }, { t: "Ich bin so erleichtert, dass du mir hilfst!", a: "g", why: "Erleichterung ist ein echtes Gefühl." }, { t: "Mit deiner Einschätzung liegst du nach meinem Gefühl völlig falsch.", a: "p", why: "Eine Meinung." }, { t: "Ich habe Angst vor der Prüfung morgen.", a: "g", why: "Angst ist ein Gefühl." }, { t: "Ich fühle mich wie platt gewalzt.", a: "p", why: "Bild/Vergleich („wie“)." }, { t: "Ich freue mich über dein Geschenk.", a: "g", why: "Freude." }, { t: "Ich habe das Gefühl, du verschweigst mir was.", a: "p", why: "Vermutung über den anderen." }, { t: "An der FH fühle ich mich völlig unwichtig.", a: "p", why: "Selbstbewertung." }, { t: "Ich bin echt sauer.", a: "g", why: "Ärger ist ein Gefühl." }, { t: "Ich mache mir große Sorgen um die Zukunft.", a: "g", why: "Sorge." }, { t: "Ich bin neugierig auf die neue Freundin.", a: "g", why: "Neugier." }, { t: "Ich habe das Gefühl, du bestimmst hier alles alleine.", a: "p", why: "Gedanke über das Verhalten anderer." }, { t: "Die neuen Bestimmungen irritieren mich.", a: "g", why: "Irritation." }, { t: "Ich fühle mich total übergangen.", a: "p", why: "„übergangen“ beschreibt eine Handlung anderer." }, { t: "Ich bin wirklich begeistert von der neuen Urlaubsregelung.", a: "g", why: "Begeisterung." }] },
    { t: "check", q: "Welche Formulierung drückt ein echtes Gefühl aus?", opts: ["Ich fühle mich ausgenutzt.", "Ich fühle mich, als ob ich einen Knödel im Bauch hätte.", "Ich bin enttäuscht.", "Ich habe das Gefühl, mein Chef manipuliert."], a: 2, why: "Die anderen enthalten eine Handlung anderer, „als ob“ oder eine Person." }
  ]},
  { id: "k5-3", title: "Bedürfnisse erkennen", topic: "k-bed", min: 12, xp: 30, blocks: [
    { t: "lead", html: "Alle Menschen haben dieselben Bedürfnisse. Sie sind abstrakt, unabhängig von Zeit, Ort und Person und beschreiben kein Verhalten. Für jedes Bedürfnis gibt es viele Strategien." },
    { t: "text", h: "Zwei Wege zum Bedürfnis", levels: {
      simple: "Hinter jedem Vorwurf steckt ein Wunsch. „Das ist respektlos!“ → Bedürfnis: Respekt.",
      normal: "<b>Strategie 1</b>: Unerwünschtes Verhalten → erwünschtes Verhalten → Bedürfnis („Nicht einfach reinkommen!“ → anklopfen → Privatsphäre). <b>Strategie 2</b>: Bewertung → Gegenteil suchen („total respektlos“ → Respekt).",
      technical: "Bedürfnisgruppen nach Rosenberg: Autonomie, Feiern, Integrität, Interdependenz, Nähren der physischen Existenz, Spiel, spirituelle Verbundenheit. „Wenn wir unsere Bedürfnisse nicht ernst nehmen, tun es andere auch nicht.“" } },
    { t: "widget", w: "riddle", topic: "k-bed" },
    { t: "check", q: "Welche Aussage nennt ein Bedürfnis (keine Strategie)?", opts: ["Ich möchte im Winter mit dir Skifahren gehen.", "Mir ist Zugehörigkeit wichtig.", "Ich will einen Monat Einarbeitung.", "Ich brauche einen zuverlässigen Freund."], a: 1, why: "Zugehörigkeit ist frei von Zeit, Ort, Person und Handlung." }
  ]},
  { id: "k5-4", title: "Bitte oder frommer Wunsch?", topic: "k-bitte", min: 10, xp: 25, blocks: [
    { t: "text", h: "Was eine Bitte ausmacht", levels: {
      simple: "Eine Bitte ist konkret, machbar, positiv formuliert – und die andere Person darf Nein sagen.",
      normal: "Klare, positive, konkrete Handlungssprache: sagen, was ich will, nicht was ich nicht will. Folgt auf ein Nein Kritik oder Schuld, war es eine Forderung. <b>Lösungsbitte</b>: konkrete Handlung. <b>Beziehungsbitte</b>: „Was ist bei dir angekommen?“ oder „Wie geht es dir, wenn du das hörst?“",
      technical: "Ohne Bitte kann die Mitteilung von Beobachtung, Gefühl und Bedürfnis als Vorwurf ankommen. Eine Bitte ohne Gefühl und Bedürfnis klingt dagegen leicht wie eine Forderung." } },
    { t: "widget", w: "sorter", topic: "k-bitte", title: "Erfolgversprechende Bitte oder frommer Wunsch? (S. 41)", cats: [{ k: "b", label: "Bitte" }, { k: "w", label: "Frommer Wunsch" }],
      items: [{ t: "Bitte sei doch ein bisschen herzlicher!", a: "w", why: "Vage, keine konkrete Handlung." }, { t: "Bitte hebe deinen Pullover vom Wohnzimmerboden auf und nimm ihn mit in dein Zimmer.", a: "b", why: "Konkret und erfüllbar." }, { t: "Fühl dich einfach wie zu Hause.", a: "w", why: "Nicht als Handlung erfüllbar." }, { t: "Kannst du mir bitte die Kundenliste rüberreichen?", a: "b", why: "Konkret." }, { t: "Hör mir jetzt endlich einmal zu!", a: "w", why: "Forderung, unklar was genau." }, { t: "Sei doch etwas aufmerksamer!", a: "w", why: "Vage." }, { t: "Ich möchte, dass du dir in Zukunft mehr Mühe gibst.", a: "w", why: "„mehr Mühe“ ist nicht messbar." }, { t: "Bist du bereit, nächste Woche am Montag und Freitag abends auf die Kinder zu schauen?", a: "b", why: "Konkret, frei zu beantworten." }, { t: "Kannst du heute Abend das Brot aus dem Bioladen mitbringen?", a: "b", why: "Konkret." }, { t: "Sei doch nicht so unkooperativ!", a: "w", why: "Negativ formuliert und vage." }, { t: "Machst du bitte die Tür zu?", a: "b", why: "Konkret." }, { t: "Kannst du nicht ein bisschen weniger schlampig sein?", a: "w", why: "Negativ und vage." }, { t: "Lass uns jetzt darüber reden, wie wir die Hausarbeit in Zukunft aufteilen.", a: "b", why: "Konkreter nächster Schritt." }, { t: "Handeln Sie verantwortlich.", a: "w", why: "Abstrakt." }] },
    { t: "check", q: "Woran erkennst du, dass eine „Bitte“ eigentlich eine Forderung war?", opts: ["Sie war zu höflich", "Auf ein Nein folgen Kritik, Vorwürfe oder Schuldgefühle", "Sie enthielt das Wort „bitte“", "Sie war konkret"], a: 1, why: "Eine Bitte lässt die Freiheit, Nein zu sagen." }
  ]},
  { id: "k5-5", title: "Die 4 Schritte anwenden", topic: "k-4s", min: 15, xp: 35, blocks: [
    { t: "lead", html: "Beispiel: „Du hörst mir ja nie zu.“ → <b>1</b> Ich rede mit dir und du liest gleichzeitig die Zeitung. <b>2</b> Da bin ich verärgert und frustriert, <b>3</b> weil mir Kontakt und Aufmerksamkeit wichtig sind. <b>4</b> Bist du bereit, die Zeitung für 10 Minuten wegzulegen, damit wir gemeinsam den Tag planen?" },
    { t: "widget", w: "gfk4", topic: "k-4s" },
    { t: "callout", html: "Übe hier mit eigenen Situationen. Für das Portfolio gilt: selbst erstellen, KI ist in dieser LV ausdrücklich verboten. Die App prüft nur typische Stolpersteine und formuliert nichts für dich." }
  ]}
 ]},
 { id: "kw6", n: 6, title: "Aktives Zuhören", sub: "Zuhören ist mehr als Hören", boss: null, lessons: [
  { id: "k6-1", title: "Fördernde Reaktionen und Barrieren", topic: "k-zuh", min: 10, xp: 25, blocks: [
    { t: "lead", html: "„The most basic and powerful way to connect to another person is to listen.“ (Rachel Naomi Remen)" },
    { t: "keys", items: ["<b>Nonverbal verstärken</b>: Blickkontakt, Kopfnicken, „mh, ja“, zugewandte Haltung", "<b>Auf Inhalte und Gefühle eingehen</b>: kurz zusammenfassen, spiegeln, nachfragen, eigene Meinung zurückstellen, keine Lösungen anbieten", "<b>Zum Sprechen ermutigen</b>: „Möchtest du mehr darüber erzählen?“", "<b>Zeit geben</b>: Pausen aushalten, nicht dazwischenreden"] },
    { t: "widget", w: "sorter", topic: "k-zuh", title: "Welche Barriere?", cats: [{ k: "p", label: "Physisch" }, { k: "e", label: "Emotional" }, { k: "s", label: "Semantisch" }],
      items: [{ t: "Baustellenlärm vor dem Fenster", a: "p", why: "Äußere Störung." }, { t: "Vorurteile gegenüber der sprechenden Person", a: "e", why: "Innere Haltung." }, { t: "Unterschiedliches Vokabular", a: "s", why: "Sprachebene." }, { t: "Müdigkeit", a: "p", why: "Körperlicher Zustand." }, { t: "Ein Reizwort löst starke Gefühle aus", a: "e", why: "Emotional." }, { t: "Fachbegriffe, die das Gegenüber nicht kennt", a: "s", why: "Verständnis der Wörter." }, { t: "Monotone Stimme", a: "p", why: "Physische Barriere laut Skript." }, { t: "Schlechte Erfahrungen mit dem Thema", a: "e", why: "Vergangene Erlebnisse." }] },
    { t: "check", q: "Was gehört beim aktiven Zuhören NICHT dazu?", opts: ["Kurze Zusammenfassungen", "Gefühle spiegeln", "Sofort Lösungsvorschläge machen", "Nachfragen, ob man richtig verstanden hat"], a: 2, why: "Aktives Zuhören sendet keine eigene Botschaft wie Rat, Urteil oder Lösung." }
  ]},
  { id: "k6-2", title: "Du- und Ich-Botschaften", topic: "k-ich", min: 10, xp: 25, blocks: [
    { t: "text", h: "Die Ich-Formel", levels: {
      simple: "Statt „Du rufst nie an“: „Ich fühle mich einsam, wenn wir länger nicht sprechen, und würde mich über einen Anruf freuen.“",
      normal: "1) Gefühl („Ich fühle mich …“, echtes Gefühl) · 2) Verhalten ohne Schuld beschreiben („wenn …“) · 3) Bedürfnis oder Wunsch („weil ich … brauche“ / „ich würde mich freuen, wenn …“).",
      technical: "Ich-Botschaften übernehmen Verantwortung für das eigene Erleben. Du-Botschaften enthalten meist eine Bewertung oder Diagnose und lösen Verteidigung aus." } },
    { t: "widget", w: "imsg", topic: "k-ich", lang: "de" },
    { t: "check", q: "Welche Aussage ist eine Ich-Botschaft im Sinne der Formel?", opts: ["Du nervst mich, geh weg.", "Ich finde, du bist rücksichtslos.", "Ich bin gestresst, wenn es laut ist, und brauche gerade Ruhe. Kannst du leiser sein?", "Ich sag's ja nur."], a: 2, why: "Gefühl, beschriebenes Verhalten, Bedürfnis und Bitte. „Ich finde, du bist …“ ist eine verkleidete Du-Botschaft." }
  ]}
 ]},
 { id: "kw7", n: 7, title: "Harvard-Konzept", sub: "Sachbezogen verhandeln", boss: null, lessons: [
  { id: "k7-1", title: "Hart in der Sache, weich zu den Menschen", topic: "k-harv", min: 14, xp: 35, blocks: [
    { t: "keys", items: ["<b>1. Menschen und Probleme trennen</b>: nicht Freund, nicht Feind; Emotionen ansprechen ohne Schuld", "<b>2. Interessen statt Positionen</b>: W-Fragen stellen, warum jemand etwas will", "<b>3. Optionen entwickeln</b>: „sowohl als auch“ statt „entweder oder“, Brainstorming", "<b>4. Objektive Kriterien</b>: faire, gemeinsame Entscheidungsgrundlage"] },
    { t: "widget", w: "orange", topic: "k-harv" },
    { t: "text", h: "BATNA und WATNA", levels: {
      simple: "BATNA: dein bester Plan B, wenn es keine Einigung gibt. WATNA: das Schlimmste, was ohne Einigung passieren kann.",
      normal: "<b>BATNA</b> = Best Alternative To (a) Negotiated Agreement: die beste Alternative, die du ohne Einigung hast. Je attraktiver sie ist, desto größer deine Verhandlungsmacht. <b>WATNA</b> = Worst Alternative To (a) Negotiated Agreement: das schlechteste realistische Szenario ohne Einigung.",
      technical: "Ein Abschluss ist nur sinnvoll, wenn er besser ist als deine BATNA. Wer seine BATNA kennt, akzeptiert keine Einigung, die weniger wert ist. Die WATNA zeigt, was auf dem Spiel steht, und motiviert zur Einigung." } },
    { t: "widget", w: "sorter", topic: "k-harv", title: "Position oder Interesse?", cats: [{ k: "p", label: "Position" }, { k: "i", label: "Interesse" }],
      items: [{ t: "„Ich will die ganze Orange.“", a: "p", why: "Konkrete Forderung." }, { t: "„Ich brauche die Schale für einen Kuchen.“", a: "i", why: "Das Warum hinter der Forderung." }, { t: "„Wir fahren an den Strand, Punkt.“", a: "p", why: "Festgelegte Lösung." }, { t: "„Ich möchte mich im Urlaub richtig entspannen.“", a: "i", why: "Bedürfnis dahinter." }, { t: "„Ich will 10 % mehr Gehalt.“", a: "p", why: "Konkrete Forderung." }, { t: "„Mir ist finanzielle Sicherheit wichtig.“", a: "i", why: "Interesse." }] },
    { t: "check", q: "Was bedeutet BATNA?", opts: ["Best Agreement To Negotiate Always", "Best Alternative To (a) Negotiated Agreement", "Basic Approach To Neutral Arguments", "Better Answers Than No Agreement"], a: 1, why: "Die beste Alternative, falls keine Einigung zustande kommt." },
    { t: "callout", html: "Übung Urlaub (Forum, S. 52): Bergwandern mit Hütte und Zelt vs. Strand mit Cocktailbar. Arbeitet in der Homegroup Interessen, optimale Lösung, BATNA und WATNA für beide Personen aus. Diese Abgabe ist eure eigene Gruppenarbeit." }
  ]}
 ]}
];

const QUESTIONS = [
 { id: "kq1", topic: "k-watz", q: "„Man kann nicht nicht kommunizieren“ ist Axiom …", opts: ["1", "2", "3", "5"], a: 0, why: "Auch Schweigen und Nichthandeln haben Mitteilungscharakter.", ex: "Wegschauen im Wartezimmer." },
 { id: "kq2", topic: "k-watz", q: "Digitale Kommunikation bezieht sich vor allem auf …", opts: ["Körpersprache", "Worte und Sätze, den Inhaltsaspekt", "Beziehungen zwischen Menschen", "Tonfall"], a: 1, why: "Digital = logisch, abstrakt, Inhalt. Analog = Beziehung, Mimik, Gestik.", ex: "Ein sprechender Computer ist der Extremfall digitaler Kommunikation." },
 { id: "kq3", topic: "k-watz", q: "Eine Beziehung auf Basis von Unterschiedlichkeit (z. B. Chefin–Mitarbeiter) ist …", opts: ["symmetrisch", "komplementär", "digital", "redundant"], a: 1, why: "Komplementär: Verhaltensweisen ergänzen sich, oft mit Über- und Unterordnung.", ex: "Lehrende und Studierende." },
 { id: "kq4", topic: "k-watz", q: "Axiom 3 besagt, dass Kommunikation …", opts: ["immer eindeutig ist", "immer Ursache und Wirkung ist (Interpunktion)", "nur verbal funktioniert", "symmetrisch sein muss"], a: 1, why: "Niemand kann objektiv sagen, wer „angefangen“ hat; Anfänge werden subjektiv gesetzt.", ex: "Nörgeln ↔ Zurückziehen." },
 { id: "kq5", topic: "k-watz", tf: true, q: "Laut Axiom 2 bestimmt der Inhaltsaspekt den Beziehungsaspekt.", a: 1, why: "Umgekehrt: Der Beziehungsaspekt bestimmt, wie der Inhalt verstanden wird.", ex: "Lotto-Nachricht mit Grinsen." },
 { id: "kq6", topic: "k-svt", q: "Welches „Ohr“ ist bei vielen Menschen besonders empfindlich?", opts: ["Sachohr", "Beziehungsohr", "Appellohr", "Selbstkundgabe-Ohr"], a: 1, why: "Das Beziehungsohr entscheidet, wie ich mich behandelt fühle.", ex: "„Fährst du oder fahre ich?“" },
 { id: "kq7", topic: "k-svt", q: "„Kinder, die ihre Mama lieb haben, machen sich nicht schmutzig.“ Welche Seite steht im Vordergrund?", opts: ["Sachinhalt", "Selbstkundgabe", "Appell", "keine"], a: 2, why: "Verdeckter Appell: Mach dich nicht schmutzig.", ex: "Moralischer Druck über die Beziehung." },
 { id: "kq8", topic: "k-svt", q: "Wer entwickelte das Vier-Ohren-Modell?", opts: ["Paul Watzlawick", "Friedemann Schulz von Thun", "Marshall Rosenberg", "Vera Birkenbihl"], a: 1, why: "Schulz von Thun, „Miteinander reden“ (1981).", ex: "Kommunikationsquadrat." },
 { id: "kq9", topic: "k-svt", q: "Die Sachebene wird geprüft nach den Kriterien …", opts: ["laut/leise", "wahr, relevant, hinlänglich", "freundlich/unfreundlich", "digital/analog"], a: 1, why: "Wahrheit, Relevanz und Hinlänglichkeit.", ex: "Sind die Fakten ausreichend für das Thema?" },
 { id: "kq10", topic: "k-grund", q: "Welcher Bestandteil entspricht „auf welchem Kanal“?", opts: ["Botschaft", "Medium", "Effekt", "Senderin"], a: 1, why: "Wer sagt (Senderin) was (Botschaft) zu wem (Empfängerin) auf welchem Kanal (Medium) mit welcher Wirkung (Effekt).", ex: "E-Mail vs. Telefonat." },
 { id: "kq11", topic: "k-grund", q: "Ein Voting (TED) ist …", opts: ["eine Senderin, viele Empfängerinnen", "viele Senderinnen, eine Empfängerin", "1:1 bidirektional", "n:n bidirektional"], a: 1, why: "Viele senden ihre Stimme an eine Stelle.", ex: "Live-Umfrage im Hörsaal." },
 { id: "kq12", topic: "k-beob", q: "„Du hast diese Woche dreimal länger als bis 20 Uhr gearbeitet.“ ist …", opts: ["eine Bewertung", "eine Beobachtung", "ein Pseudogefühl", "eine Forderung"], a: 1, why: "Konkret und überprüfbar.", ex: "Kamera-Test bestanden." },
 { id: "kq13", topic: "k-beob", q: "Welches Wort ist ein Warnsignal für eine Bewertung?", opts: ["gestern", "immer", "um 17 Uhr", "dreimal"], a: 1, why: "Verallgemeinerungen wie immer/nie sind Bewertungen.", ex: "„Du kommst immer zu spät.“" },
 { id: "kq14", topic: "k-gef", q: "„Ich fühle mich übergangen“ ist …", opts: ["ein echtes Gefühl", "ein Pseudogefühl", "eine Bitte", "ein Bedürfnis"], a: 1, why: "Beschreibt, was andere angeblich tun.", ex: "Echtes Gefühl dahinter: traurig, enttäuscht." },
 { id: "kq15", topic: "k-gef", q: "Gefühle zeigen laut Skript an, …", opts: ["wer schuld ist", "ob ein Bedürfnis erfüllt ist oder nicht", "was der andere denkt", "was ich tun muss"], a: 1, why: "Wie die Lämpchen am Armaturenbrett.", ex: "„Tank fast leer“ → tanken." },
 { id: "kq16", topic: "k-bed", q: "Welche Eigenschaft haben Bedürfnisse nach Rosenberg?", opts: ["Sie hängen an einer bestimmten Person", "Sie sind abstrakt und unabhängig von Zeit, Ort und Person", "Sie beschreiben ein Verhalten", "Sie widersprechen einander"], a: 1, why: "Strategien sind konkret, Bedürfnisse abstrakt.", ex: "Entspannung: Bad, Buch, Spaziergang …" },
 { id: "kq17", topic: "k-bed", q: "„Das ist doch total respektlos!“ Welches Bedürfnis steckt dahinter?", opts: ["Freiheit", "Respekt", "Nahrung", "Spiel"], a: 1, why: "Strategie 2: Gegenteil der Bewertung suchen.", ex: "respektlos → Respekt" },
 { id: "kq18", topic: "k-bitte", q: "Eine Beziehungsbitte ist z. B. …", opts: ["„Räum bitte ab.“", "„Was ist bei dir angekommen, von dem was ich gesagt habe?“", "„Sei netter.“", "„Hör zu!“"], a: 1, why: "Sie stellt sicher, dass ich verstanden wurde, oder fragt nach dem Befinden.", ex: "„Wie geht es dir, wenn du das hörst?“" },
 { id: "kq19", topic: "k-bitte", q: "Eine Bitte sollte formuliert sein …", opts: ["negativ und allgemein", "positiv, konkret, in Handlungssprache", "als Befehl", "ohne Gefühle und Bedürfnisse"], a: 1, why: "Sag, was du willst, nicht was du nicht willst.", ex: "„Machst du bitte die Tür zu?“" },
 { id: "kq20", topic: "k-4s", q: "Die richtige Reihenfolge der GFK-Schritte ist …", opts: ["Gefühl – Bitte – Beobachtung – Bedürfnis", "Beobachtung – Gefühl – Bedürfnis – Bitte", "Bitte – Bedürfnis – Gefühl – Beobachtung", "Bedürfnis – Beobachtung – Bitte – Gefühl"], a: 1, why: "Beobachtung, Gefühl, Bedürfnis, Bitte.", ex: "Zeitung – verärgert – Kontakt – 10 Minuten." },
 { id: "kq21", topic: "k-gfkhalt", q: "Die zwei Säulen der GFK sind …", opts: ["Macht und Kontrolle", "Aufrichtigkeit und Empathie", "Lob und Strafe", "Logik und Fakten"], a: 1, why: "Ich teile mich aufrichtig mit und höre empathisch zu.", ex: "" },
 { id: "kq22", topic: "k-block", q: "„Für diesen Verstoß muss ich dich verweisen – so sind die Vorschriften.“ Welche Blockade?", opts: ["Vergleich", "Verantwortung leugnen", "Lob", "Beobachtung"], a: 1, why: "„müssen“ verschleiert die persönliche Entscheidung.", ex: "" },
 { id: "kq23", topic: "k-zuh", q: "„So wie ich dich verstehe, fühlst du dich übersehen?“ ist ein Beispiel für …", opts: ["Spiegeln / Paraphrasieren", "Ratschlag", "Bewertung", "Ablenkung"], a: 0, why: "Man meldet zurück, was angekommen ist, und prüft es.", ex: "„Du meinst also, dass …?“" },
 { id: "kq24", topic: "k-zuh", q: "Vorurteile und Reizwörter sind welche Art von Zuhörbarriere?", opts: ["physisch", "emotional", "semantisch", "technisch"], a: 1, why: "Innere Einstellungen und Gefühle.", ex: "" },
 { id: "kq25", topic: "k-ich", q: "Welche Aussage ist eine Du-Botschaft?", opts: ["Ich bin traurig, weil mir Kontakt wichtig ist.", "Du bist einfach rücksichtslos!", "Ich wünsche mir, dass wir öfter reden.", "Mir ist Ruhe gerade wichtig."], a: 1, why: "Urteil über die andere Person.", ex: "" },
 { id: "kq26", topic: "k-harv", q: "Im Orangen-Beispiel führte zur optimalen Lösung, dass die Mutter …", opts: ["die Orange halbierte", "fragte, warum jedes Kind die Orange will", "eine zweite Orange kaufte", "dem älteren Kind die Orange gab"], a: 1, why: "Interessen statt Positionen: Saft vs. Schale.", ex: "" },
 { id: "kq27", topic: "k-harv", q: "Je attraktiver deine BATNA, …", opts: ["desto schwächer deine Verhandlungsposition", "desto größer deine Verhandlungsmacht", "desto schneller musst du zustimmen", "desto unwichtiger die Verhandlung"], a: 1, why: "Du bist weniger auf die Einigung angewiesen.", ex: "" },
 { id: "kq28", topic: "k-harv", q: "Welches ist KEIN Grundprinzip des Harvard-Konzepts?", opts: ["Menschen und Probleme trennen", "Auf Positionen beharren", "Optionen entwickeln", "Objektive Kriterien"], a: 1, why: "Interessen statt Positionen.", ex: "" },
 { id: "kq29", topic: "k-team", q: "Das Modell des Inneren Teams stammt von …", opts: ["Watzlawick", "Schulz von Thun", "Rosenberg", "Lorenz"], a: 1, why: "Schulz von Thun, Miteinander reden 3 (1998/2000).", ex: "" },
 { id: "kq30", topic: "k-grund", q: "Konrad Lorenz' Kette endet mit …", opts: ["verstanden", "einverstanden", "angewandt", "gesagt"], a: 2, why: "gesagt → gehört → verstanden → einverstanden → behalten → angewandt.", ex: "" }
];
const BOSS_EXTRA = [
 { id: "kb1", topic: "k-svt", q: "Deine Kollegin sagt im Standup: „Der Build ist schon wieder rot.“ Du hörst: „Du hast wieder Mist gebaut.“ Was ist passiert?", opts: ["Du hast mit dem Sachohr gehört", "Du hast mit dem Beziehungsohr gehört, sie hat vielleicht nur informiert", "Sie hat eine Ich-Botschaft gesendet", "Axiom 1 wurde verletzt"], a: 1, why: "Senderin und Empfängerin funken auf unterschiedlichen Seiten." },
 { id: "kb2", topic: "k-4s", q: "Ein Teammitglied pusht wiederholt ungetesteten Code. Welcher erste GFK-Schritt ist gelungen?", opts: ["„Du bist schlampig.“", "„In den letzten zwei Wochen sind drei Commits ohne Tests in main gelandet.“", "„Du testest nie.“", "„Ich fühle mich von dir ausgenutzt.“"], a: 1, why: "Konkrete Beobachtung ohne Bewertung." },
 { id: "kb3", topic: "k-gef", q: "Welches Gefühl passt zu „Ich fühle mich ignoriert“, wenn dir Gesehenwerden wichtig ist?", opts: ["„ausgeschlossen“", "„traurig“", "„übergangen“", "„benutzt“"], a: 1, why: "Traurig ist ein echtes Gefühl; die anderen beschreiben Handlungen anderer." },
 { id: "kb4", topic: "k-watz", q: "Im Meeting sagst du „Passt schon“, verschränkst aber die Arme und schaust weg. Was beschreibt das?", opts: ["Symmetrische Eskalation", "Widerspruch zwischen digitaler und analoger Kommunikation", "Gelungene Ich-Botschaft", "Redundanz"], a: 1, why: "Worte (digital) und Körpersprache (analog) senden unterschiedliche Botschaften." }
];

const FLASHCARDS = [
 ["Axiom 1 (Watzlawick)", "Man kann nicht nicht kommunizieren. Auch Schweigen hat Mitteilungscharakter.", "k-watz"],
 ["Axiom 2", "Jede Kommunikation hat einen Inhalts- und einen Beziehungsaspekt; letzterer bestimmt den ersten.", "k-watz"],
 ["Axiom 3", "Kommunikation ist immer Ursache und Wirkung (Interpunktion der Ereignisfolge).", "k-watz"],
 ["Axiom 4", "Menschliche Kommunikation bedient sich digitaler (Worte, Inhalt) und analoger (Mimik, Beziehung) Modalitäten.", "k-watz"],
 ["Axiom 5", "Kommunikationsabläufe sind symmetrisch (Gleichheit) oder komplementär (Unterschiedlichkeit).", "k-watz"],
 ["Symmetrische Eskalation", "Beide Partner versuchen, sich gegenseitig auszustechen – Störung nach Axiom 5.", "k-watz"],
 ["Doppelbindung (double bind)", "Widersprüchliche Botschaft auf digitaler und analoger Ebene, jede Reaktion ist „falsch“.", "k-watz"],
 ["Kommunikationsquadrat", "Sachinhalt (blau), Selbstkundgabe (grün), Beziehungshinweis (gelb), Appell (rot).", "k-svt"],
 ["Selbstkundgabe", "Was ich über mich preisgebe, explizit (Ich-Botschaft) oder implizit.", "k-svt"],
 ["Appell", "Was ich bei dir erreichen möchte: Wünsche, Ratschläge, Handlungsanweisungen.", "k-svt"],
 ["Inneres Team", "Die inneren Stimmen zu einem Thema identifizieren, benennen und zu einer Einigung führen.", "k-team"],
 ["Eisbergtheorie", "Der größte Teil einer Botschaft (Gefühle, Werte, Triebe) liegt unter der Oberfläche; ≥ 80 % der Entscheidungen „im Bauch“.", "k-team"],
 ["Lasswell-Formel", "Wer sagt was zu wem auf welchem Kanal mit welcher Wirkung?", "k-grund"],
 ["Redundanz", "Mehrfache Übermittlung (z. B. Wiederholung) gegen verfälschte Information.", "k-grund"],
 ["GFK – 4 Schritte", "Beobachtung – Gefühl – Bedürfnis – Bitte.", "k-4s"],
 ["Beobachtung (GFK)", "Was eine Kamera aufzeichnen könnte; ohne Bewertung; schafft gemeinsame Realität.", "k-beob"],
 ["Pseudogefühl", "Gedanke oder Interpretation als Gefühl getarnt, z. B. „ich fühle mich ausgenutzt“.", "k-gef"],
 ["Bedürfnis (GFK)", "Abstrakt, universell, unabhängig von Zeit, Ort und Person; beschreibt kein Verhalten.", "k-bed"],
 ["Bitte vs. Forderung", "Bitte lässt Freiheit zum Nein. Folgen auf Nein Kritik oder Schuld, war es eine Forderung.", "k-bitte"],
 ["Lösungsbitte", "Bitte um eine konkrete Handlung.", "k-bitte"],
 ["Beziehungsbitte", "„Was ist bei dir angekommen?“ oder „Wie geht es dir, wenn du das hörst?“", "k-bitte"],
 ["Wolf (GFK)", "Symbol für urteilende, fordernde Sprache.", "k-gfkhalt"],
 ["Giraffe (GFK)", "Symbol der GFK: größtes Herz, Blick aufs Ganze.", "k-gfkhalt"],
 ["Zwei Säulen der GFK", "Aufrichtigkeit und Empathie.", "k-gfkhalt"],
 ["Aktives Zuhören", "Das Verstandene in eigenen Worten zurückmelden, ohne Urteil, Rat oder Lösung.", "k-zuh"],
 ["Zuhörbarrieren", "Physisch (Lärm, Müdigkeit), emotional (Vorurteile, Reizwörter), semantisch (Vokabular).", "k-zuh"],
 ["Ich-Botschaft", "Gefühl + Verhalten ohne Schuld + Bedürfnis/Wunsch.", "k-ich"],
 ["Harvard-Konzept", "Menschen/Probleme trennen · Interessen statt Positionen · Optionen · objektive Kriterien.", "k-harv"],
 ["BATNA", "Best Alternative To (a) Negotiated Agreement – bester Plan B ohne Einigung.", "k-harv"],
 ["WATNA", "Worst Alternative To (a) Negotiated Agreement – schlechteste realistische Folge ohne Einigung.", "k-harv"]
].map((c, i) => ({ id: "kf" + (i + 1), cat: "Kommunikation", topic: c[2], front: c[0], back: c[1] }));

window.COURSE_DEFS = window.COURSE_DEFS || [];
window.COURSE_DEFS.push({
  id: "kommu", name: "Kommunikationstraining", short: "KOMMU", title: "Kommunikation", semester: 3, ects: 1, color: "#F2B84B", icon: "◎", lang: "de",
  lecturers: "Lisa Zimmermann · Modul Skills · 1 SWS",
  description: "Watzlawick, Schulz von Thun, Gewaltfreie Kommunikation, aktives Zuhören, Harvard-Konzept.",
  aiRule: "KI ist in dieser Lehrveranstaltung ausdrücklich verboten (§ 17 Abs. 8 StuPO). Portfolio und Deep-Talk-Blatt selbst erstellen. Die App dient nur zum Lernen und Planen.",
  topics: TOPICS, worlds: WORLDS, questions: QUESTIONS, bossExtra: BOSS_EXTRA, flashcards: FLASHCARDS,
  assessment: { parts: [{ id: "anw", label: "Anwesenheit & Mitarbeit (−4 Pkt. je versäumter 45′)", max: 60 }, { id: "aa1", label: "Portfolio · Arbeitsauftrag 1", max: 5 }, { id: "aa2", label: "Portfolio · Arbeitsauftrag 2", max: 5 }, { id: "aa3", label: "Portfolio · Arbeitsauftrag 3", max: 5 }, { id: "ref", label: "Portfolio · Selbstreflexion & Feedback", max: 10 }, { id: "dt", label: "Deep Talk Interviews", max: 15 }],
    scale: [[91, "1 · Sehr gut"], [81, "2 · Gut"], [71, "3 · Befriedigend"], [61, "4 · Genügend"], [0, "5 · Nicht genügend"]], note: "80 % Anwesenheit erforderlich." },
  resources: { sections: [{ title: "Skript", items: [{ title: "Kommunikationstraining – Skript WS 2026/27 (53 S.)", note: "Theorie, Arbeitsaufträge, Übungen" }, { title: "Deep Talk – Übungsblatt", note: "Pro Einheit 2 Fragen, Gefühl/Bedürfnis wahrnehmen, bestätigen lassen" }] }],
    books: [{ title: "Miteinander reden 1 – Störungen und Klärungen", author: "Schulz von Thun, 1981, Rowohlt", tag: "Basis" }, { title: "Wie wirklich ist die Wirklichkeit?", author: "Watzlawick, 1976, Piper", tag: "Basis" }, { title: "Gewaltfreie Kommunikation – Eine Sprache des Lebens", author: "Rosenberg, 2007, Junfermann", tag: "Basis" }, { title: "Das Harvard-Konzept", author: "Fisher/Ury/Patton, 2004, Campus", tag: "Ergänzend" }, { title: "Kommunikationstraining", author: "Birkenbihl, 1998, mvg", tag: "Ergänzend" }] },
  events: [
    { id: "kommu-portfolio", title: "KOMMU · Portfolio abgeben (PDF/Word)", type: "deadline", date: "2027-01-28", time: "23:59", note: "Mit Inhaltsverzeichnis, Kopf-/Fußzeile mit Name und Seitenzahlen. Rechtschreibung prüfen. KI verboten. Öffnet 07.11.2026." },
    { id: "kommu-deeptalk", title: "KOMMU · Deep Talk Übungsblatt abgeben", type: "deadline", date: "2027-01-30", time: "23:59", note: "Ausgefülltes Übungsblatt hochladen." },
    { id: "kommu-portfolio-open", title: "KOMMU · Portfolio-Abgabe öffnet", type: "info", date: "2026-11-07", time: "07:43", note: "" }
  ],
  tasks: [
    { id: "kt-face", title: "Forum: Heiteres Gesichtsausdrückeraten", note: "10 Gesichtsausdrücke fotografieren (Ernst, Erstaunen, Freude, Nachdenklichkeit, Ruhe, Schmerz, Traurigkeit, Trotz, Verachtung, Weinen), 3 posten und raten lassen." },
    { id: "kt-mind", title: "Forum: Mindmaps Theorie (Homegroup)", note: "Watzlawick-Axiome, 4 Seiten (Schulz von Thun) oder 7 GFK-Grundhaltungen als Mindmap posten, andere Homegroups bewerten. Titel z. B. „Mindmap Schulz-von-Thun – G2 – HG1“." },
    { id: "kt-urlaub", title: "Forum: Übung Urlaub (S. 52)", note: "Für beide Personen optimale Lösung, BATNA, WATNA. Mit Gruppen- und Homegroupnummer posten." },
    { id: "kt-neg", title: "Forum: Negative Aussagen umformulieren (S. 49)", note: "2 der Aussagen in Inhalt, Gefühl, Bedürfnis umformulieren + ein gemeinsames eigenes Beispiel." },
    { id: "kt-gfkbsp", title: "Forum: Beispiele für GFK-Grundhaltungen", note: "Beispiel (Bild, Cartoon, Kurzvideo) für mind. eine Grundhaltung, Titel „Axiom 1 – G1 – HG2“." },
    { id: "kt-watzbsp", title: "Forum: Beispiele für Watzlawicks Axiome", note: "Beispiel für ein Axiom posten und kurz erklären." },
    { id: "kt-aa1", title: "Arbeitsauftrag 1 vorbereiten (GFK-Grundhaltung)", note: "Eine von drei Übungen: 3 Tage – 3 Sichtweisen, Zuhör-Tagebuch oder Unterbrochene-Unterhaltung-Analyse. Zur 2. UE mitbringen." },
    { id: "kt-aa2", title: "Arbeitsauftrag 2 vorbereiten (Schritte der GFK)", note: "Zwei von vier Übungen (Beobachtung v. Bewertung, Gefühle, Gefühle & Bedürfnisse, Meine Bedürfnisse). Zur 3. UE mitbringen." },
    { id: "kt-aa3", title: "Arbeitsauftrag 3 vorbereiten (GFK in der Anwendung)", note: "Eine von drei Übungen: Bedürfnischeck, 4 Schritte auf Studienbeispiel, Annahme-Check. Zur 5. UE mitbringen." }
  ]
});
})();
