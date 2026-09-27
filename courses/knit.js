/* Stricken – Kurs für das Craft-Profil (Track "craft"). Eigenes Lernmaterial. */
(function () {
const TOPICS = {
  "kn-garn":    { name: "Garn & Fasern",             lesson: "kn1-1" },
  "kn-nadel":   { name: "Nadeln",                     lesson: "kn1-2" },
  "kn-probe":   { name: "Maschenprobe",               lesson: "kn1-3" },
  "kn-anschl":  { name: "Anschlagen",                 lesson: "kn2-1" },
  "kn-rechts":  { name: "Rechte Masche",              lesson: "kn2-2" },
  "kn-links":   { name: "Linke Masche",               lesson: "kn2-3" },
  "kn-abk":     { name: "Abketten",                   lesson: "kn2-4" },
  "kn-glatt":   { name: "Glatt & kraus rechts",       lesson: "kn3-1" },
  "kn-rippe":   { name: "Rippen & Perlmuster",        lesson: "kn3-2" },
  "kn-lesen":   { name: "Maschenbild lesen",          lesson: "kn3-3" },
  "kn-zu":      { name: "Zunehmen",                   lesson: "kn4-1" },
  "kn-ab":      { name: "Abnehmen",                   lesson: "kn4-2" },
  "kn-vert":    { name: "Gleichmäßig verteilen",      lesson: "kn4-3" },
  "kn-abkz":    { name: "Abkürzungen",                lesson: "kn5-1" },
  "kn-chart":   { name: "Strickschrift",              lesson: "kn5-2" },
  "kn-fehler":  { name: "Fehler retten",              lesson: "kn6-1" },
  "kn-runde":   { name: "In Runden stricken",         lesson: "kn7-1" },
  "kn-zopf":    { name: "Zöpfe",                      lesson: "kn7-2" },
  "kn-farbe":   { name: "Mit Farben stricken",        lesson: "kn7-3" },
  "kn-finish":  { name: "Fertigstellen",              lesson: "kn8-1" }
};

const WORLDS = [
 { id: "knw1", n: 1, title: "Material & Werkzeug", sub: "Wolle, Nadeln, Maschenprobe", boss: null, lessons: [
  { id: "kn1-1", title: "Wolle verstehen", topic: "kn-garn", min: 8, xp: 20, blocks: [
    { t: "lead", html: "Das richtige Garn entscheidet, wie dein Strickstück aussieht, fällt und sich anfühlt. Die Banderole (das Etikett) verrät dir fast alles." },
    { t: "text", h: "Fasern und ihre Eigenschaften", levels: {
      simple: "Wolle wärmt und ist elastisch. Baumwolle ist kühl und fest. Kunstfaser ist pflegeleicht. Für den Anfang: glatte, helle Wolle mittlerer Stärke – da siehst du jede Masche.",
      normal: "<b>Schurwolle/Merino</b>: warm, elastisch, verzeiht ungleichmäßige Maschen – ideal für Anfänger. <b>Baumwolle</b>: kühl, wenig elastisch, zeigt jede Unregelmäßigkeit, gut für Sommer und Häkelprojekte. <b>Alpaka/Mohair</b>: sehr warm, flauschig, schwerer zu „lesen“. <b>Acryl/Polyamid</b>: günstig, maschinenwaschbar, oft in Sockengarn (Wolle + 25 % Polyamid für Haltbarkeit).",
      technical: "Die Elastizität von Wolle kommt von der Kräuselung (Crimp) der Faser. Superwash-Wolle ist behandelt, damit sie in der Maschine nicht verfilzt – sie dehnt sich beim Waschen aber eher aus. Mehrfädig verzwirnte Garne (z. B. 4-fach) zeigen Maschen klarer als Single-Garne; Bouclé- und Fransengarne verstecken die Struktur." } },
    { t: "html", html: `<div class="table-wrap"><table class="dt"><thead><tr><th>Stärke (EN)</th><th>typisch</th><th>Nadel</th><th>Maschen / 10 cm</th></tr></thead><tbody>
      <tr><td>Lace</td><td>Tücher, Spitze</td><td>2–3 mm</td><td>33–40</td></tr><tr><td>Fingering / Sock</td><td>Socken, feine Pullis</td><td>2,25–3,25 mm</td><td>27–32</td></tr>
      <tr><td>Sport</td><td>Babysachen</td><td>3,25–3,75 mm</td><td>23–26</td></tr><tr><td>DK</td><td>Pullis, Mützen</td><td>3,75–4,5 mm</td><td>21–24</td></tr>
      <tr><td>Worsted / Aran</td><td>Anfängerprojekte, Decken</td><td>4,5–5,5 mm</td><td>16–20</td></tr><tr><td>Bulky / Chunky</td><td>schnelle Schals</td><td>5,5–8 mm</td><td>12–15</td></tr><tr><td>Super Bulky</td><td>Wohnaccessoires</td><td>8–12 mm+</td><td>7–11</td></tr></tbody></table></div><small class="muted">Richtwerte nach dem Standard des Craft Yarn Council – die Banderole deines Garns hat Vorrang.</small>` },
    { t: "callout", html: "<b>Banderole lesen:</b> Lauflänge (z. B. 125 m / 50 g) · empfohlene Nadelstärke · Maschenprobe · Pflegesymbole · <b>Farbpartie (Dye Lot)</b>. Für ein Projekt immer Knäuel mit <i>derselben</i> Farbpartie kaufen – sonst siehst du später einen Farbunterschied." },
    { t: "widget", w: "sorter", topic: "kn-garn", title: "Welche Faser passt?", cats: [{ k: "w", label: "Wolle/Merino" }, { k: "b", label: "Baumwolle" }, { k: "s", label: "Sockengarn (Wolle + Polyamid)" }],
      items: [{ t: "Warme Wintermütze, die gut sitzen soll", a: "w" }, { t: "Luftiges Sommertop", a: "b" }, { t: "Socken, die lange halten sollen", a: "s" }, { t: "Topflappen / Spüllappen", a: "b" }, { t: "Erster Übungsschal – verzeiht Fehler", a: "w" }] },
    { t: "check", q: "Warum sollten alle Knäuel für einen Pulli dieselbe Farbpartie haben?", opts: ["Weil sie sonst anders riechen", "Weil Farbpartien leicht unterschiedlich gefärbt sind und man den Übergang sieht", "Weil die Lauflänge sonst anders ist", "Das ist egal"], a: 1, why: "Jede Färbung (Partie) fällt minimal anders aus. Im fertigen Stück sieht man das als Streifen." },
    { t: "keys", items: ["Anfänger: glatte, helle Wolle in Worsted/DK-Stärke", "Banderole: Lauflänge, Nadel, Maschenprobe, Pflege, Farbpartie", "Mehr Maschen/10 cm = dünneres Garn"] }
  ]},
  { id: "kn1-2", title: "Nadeln & Zubehör", topic: "kn-nadel", min: 7, xp: 20, blocks: [
    { t: "lead", html: "Gerade Nadeln, Rundstricknadel oder Nadelspiel? Und warum eigentlich Holz oder Metall?" },
    { t: "text", h: "Nadelarten", levels: {
      simple: "Gerade Nadeln für flache Stücke. Eine Rundstricknadel (zwei Spitzen mit Seil) für runde Sachen wie Mützen – und auch für flache Stücke. Ein Nadelspiel (4–5 kurze Nadeln) für kleine Runden wie Socken.",
      normal: "<b>Rundstricknadel</b> ist das Allroundwerkzeug: Das Gewicht liegt auf dem Seil statt in deinen Handgelenken, und du kannst hin und her oder in Runden stricken. Seillänge: 40 cm für Mützen, 60–80 cm für Pullis. <b>Nadelspiel</b>: für kleine Umfänge (Socken, Daumen). <b>Magic Loop</b>: kleine Umfänge mit einer langen Rundnadel.",
      technical: "Material ändert die Gleitfähigkeit: <b>Metall</b> ist glatt und schnell (gut für haarige oder stumpfe Garne), <b>Holz/Bambus</b> ist griffig (Maschen rutschen nicht, gut für Anfänger und glatte Garne wie Baumwolle). Spitzen: spitz für Lochmuster, rund für Bulky-Garne." } },
    { t: "widget", w: "needles" },
    { t: "html", html: `<div class="grid g2"><div class="tip"><span>🧷</span><span><b>Maschenmarkierer</b> zeigen Rapporte, Rundenbeginn und Zunahmestellen.</span></div><div class="tip"><span>🪡</span><span><b>Wollnadel</b> (stumpf, großes Öhr) zum Vernähen. <b>Häkelnadel</b> zum Retten gefallener Maschen.</span></div><div class="tip"><span>📏</span><span><b>Maßband</b> und ein Nadelmaß (Lochlehre) für unbeschriftete Nadeln.</span></div><div class="tip"><span>✂️</span><span>Kleine, scharfe <b>Schere</b> – und ein Reihenzähler (gibt's hier in der App).</span></div></div>` },
    { t: "check", q: "Deine Maschen rutschen dir ständig von den Metallnadeln. Was hilft?", opts: ["Dünnere Nadeln", "Holz- oder Bambusnadeln", "Fester stricken", "Nur noch links stricken"], a: 1, why: "Holz ist griffiger, die Maschen bleiben besser auf der Nadel." },
    { t: "check", q: "Welche Nadel eignet sich für eine Mütze in Runden?", opts: ["Gerade Nadeln 35 cm", "Rundstricknadel 40 cm", "Rundstricknadel 150 cm ohne Magic Loop", "Häkelnadel"], a: 1, why: "40 cm Seil passt zum Kopfumfang, du strickst einfach im Kreis." }
  ]},
  { id: "kn1-3", title: "Die Maschenprobe", topic: "kn-probe", min: 10, xp: 30, blocks: [
    { t: "lead", html: "Die Maschenprobe ist der langweiligste und wichtigste Schritt: Sie entscheidet, ob dein Pulli passt." },
    { t: "text", h: "So geht's", levels: {
      simple: "Strick ein Quadrat von etwa 15 × 15 cm im Muster der Anleitung. Zähl in der Mitte, wie viele Maschen und Reihen auf 10 cm kommen.",
      normal: "1) Mit der empfohlenen Nadel ca. 15 × 15 cm im Muster stricken. 2) <b>Waschen/spannen</b> wie das fertige Stück. 3) In der Mitte (nicht am Rand) 10 cm abmessen und Maschen (Vs nebeneinander) sowie Reihen (Vs übereinander) zählen. <b>Zu viele Maschen</b> → du strickst fester → dickere Nadel. <b>Zu wenige</b> → dünnere Nadel.",
      technical: "Maschen pro cm = Maschen / 10. Benötigte Maschen = gewünschte Breite × Maschen/cm (plus Randmaschen). Die Reihenzahl ist oft weniger wichtig, weil Anleitungen meist in cm messen („stricke bis 30 cm“); bei Raglan oder Mustern mit fester Reihenzahl zählt sie aber." } },
    { t: "widget", w: "gauge" },
    { t: "check", q: "Anleitung: 22 M / 10 cm. Deine Probe: 25 M / 10 cm. Was tun?", opts: ["Dünnere Nadel", "Dickere Nadel", "Nichts", "Mehr Reihen stricken"], a: 1, why: "Mehr Maschen auf 10 cm = du strickst fester. Eine dickere Nadel macht die Maschen größer." },
    { t: "check", q: "Deine Probe: 20 M / 10 cm. Wie viele Maschen brauchst du für 50 cm Breite?", opts: ["50", "80", "100", "200"], a: 2, why: "2 M/cm × 50 cm = 100 Maschen." },
    { t: "keys", items: ["Probe im Muster stricken und waschen", "in der Mitte über 10 cm zählen", "zu viele Maschen → dickere Nadel", "Maschen = Breite × Maschen pro cm"] }
  ]}
 ]},

 { id: "knw2", n: 2, title: "Erste Maschen", sub: "Anschlagen, rechts, links, abketten", boss: { id: "boss-knw2", title: "Grundmaschen-Boss", topics: ["kn-anschl", "kn-rechts", "kn-links", "kn-abk"] }, lessons: [
  { id: "kn2-1", title: "Maschen anschlagen", topic: "kn-anschl", min: 10, xp: 25, blocks: [
    { t: "lead", html: "Der <b>Kreuzanschlag</b> (Long-Tail Cast-On) ist der Standard: elastisch, schön und gleich die erste Reihe." },
    { t: "html", html: `<ol class="col" style="gap:10px;padding-left:20px;margin:0">
      <li><b>Fadenlänge abmessen:</b> ca. 3× die Breite des Stücks (Faustregel: 1 cm Faden pro Masche bei mittlerem Garn, plus 20 cm).</li>
      <li><b>Anfangsschlinge</b> auf die Nadel legen – sie zählt als erste Masche.</li>
      <li><b>Steinschleuder-Griff:</b> Fadenende um den Daumen, Arbeitsfaden über den Zeigefinger, beide Fäden mit den übrigen Fingern halten.</li>
      <li>Nadel <b>von unten in die Daumenschlinge</b>, dann <b>über den Zeigefinger-Faden</b> greifen und ihn durch die Daumenschlinge holen.</li>
      <li>Daumen aus der Schlinge nehmen, Faden sanft anziehen. Wiederholen bis zur Maschenzahl.</li></ol>` },
    { t: "tip", html: "Maschen zu fest? Schlag über <b>zwei Nadeln</b> zusammen oder mit einer Nadel 1–2 Stärken dicker an. Danach eine Nadel herausziehen." },
    { t: "widget", w: "tech", id: "knit", intro: "Alternative für den Anfang – <b>Aufstricken</b>: Du strickst eine rechte Masche wie hier gezeigt, setzt die neue Schlinge aber <i>zurück auf die linke Nadel</i>. So übst du gleich die rechte Masche." },
    { t: "widget", w: "video", q: "Kreuzanschlag stricken lernen" },
    { t: "check", q: "Wie lang sollte das Fadenende beim Kreuzanschlag etwa sein?", opts: ["So lang wie die Breite", "Etwa 3× die Breite des Stücks", "10 cm reichen immer", "1 m pro Masche"], a: 1, why: "Das Fadenende wird für jede Masche verbraucht – 3× Breite ist eine sichere Faustregel." }
  ]},
  { id: "kn2-2", title: "Die rechte Masche", topic: "kn-rechts", min: 12, xp: 35, blocks: [
    { t: "lead", html: "Einstechen – umschlingen – durchholen – abgleiten lassen. Diese vier Bewegungen sind das Herz des Strickens." },
    { t: "widget", w: "tech", id: "knit" },
    { t: "widget", w: "v3d", model: "stockinette", title: "So sieht die rechte Masche aus", note: "Jede rechte Masche zeigt vorne ein <b>V</b>. Dreh das Modell und schau von hinten: dort liegen die Köpfchen der Maschen." },
    { t: "html", html: `<div class="grid g2"><div class="tip"><span>🧶</span><span><b>Englische Methode</b> (Faden rechts): Faden mit der rechten Hand um die Nadel „werfen“. <b>Kontinentale Methode</b> (Faden links): Nadel „pickt“ den Faden – meist schneller, in Mitteleuropa verbreitet.</span></div><div class="warnbox"><span>⚠️</span><span><b>Typischer Fehler:</b> Der Faden liegt vorne statt hinten → es entsteht ein ungewollter Umschlag und die Maschenzahl wächst.</span></div></div>` },
    { t: "check", q: "Wo liegt der Arbeitsfaden bei der rechten Masche?", opts: ["Vor der Arbeit", "Hinter der Arbeit", "Egal", "Um den Daumen"], a: 1, why: "Hinten. Liegt er vorne, entsteht beim Stricken ein Umschlag." },
    { t: "check", q: "In welcher Reihenfolge?", opts: ["Umschlingen – einstechen – abgleiten – durchholen", "Einstechen – umschlingen – durchholen – abgleiten lassen", "Durchholen – einstechen – umschlingen – abgleiten", "Abgleiten – einstechen – durchholen – umschlingen"], a: 1, why: "Rein, rum, durch, runter – so merken sich viele die rechte Masche." }
  ]},
  { id: "kn2-3", title: "Die linke Masche", topic: "kn-links", min: 12, xp: 35, blocks: [
    { t: "lead", html: "Die linke Masche ist die Rückseite der rechten. Faden vorne, Nadel von rechts nach links vor der Masche einstechen." },
    { t: "widget", w: "tech", id: "purl" },
    { t: "widget", w: "v3d", model: "reverse", title: "Linke Maschen von vorne", note: "Von der „linken“ Seite siehst du waagrechte <b>Knötchen</b> statt Vs. Dreh das Modell: Die Rückseite ist glatt rechts." },
    { t: "tip", html: "Merksatz: <b>Rechts</b> = Faden hinten, von vorne einstechen. <b>Links</b> = Faden vorne, von hinten … äh, von rechts vor der Masche einstechen. Übe 2 Reihen rechts, 2 Reihen links im Wechsel." },
    { t: "check", q: "Was siehst du auf der Vorderseite einer linken Masche?", opts: ["Ein V", "Ein waagrechtes Knötchen", "Ein Loch", "Zwei Vs"], a: 1, why: "Das Knötchen ist der Maschenkopf, der zur Vorderseite gedrückt wird." }
  ]},
  { id: "kn2-4", title: "Abketten", topic: "kn-abk", min: 8, xp: 25, blocks: [
    { t: "lead", html: "Abketten sichert die Maschen, damit nichts aufribbelt. Das Prinzip: eine Masche über die nächste heben." },
    { t: "widget", w: "tech", id: "bindoff" },
    { t: "tip", html: "Abkettkante zu fest? Mit einer <b>1–2 Stärken dickeren Nadel</b> abketten. Bei Rippen immer „im Muster“ abketten (rechte Maschen rechts, linke Maschen links)." },
    { t: "check", q: "Was machst du mit dem Faden nach der letzten Masche?", opts: ["Einfach loslassen", "Abschneiden und durch die letzte Schlinge ziehen", "Weiterstricken", "Verknoten mit dem Anfangsfaden"], a: 1, why: "Der Faden wird durch die letzte Schlinge gezogen und später vernäht." }
  ]}
 ]},

 { id: "knw3", n: 3, title: "Grundmuster", sub: "Glatt, kraus, Rippen, Perlmuster", boss: { id: "boss-knw3", title: "Muster-Boss", topics: ["kn-glatt", "kn-rippe", "kn-lesen"] }, lessons: [
  { id: "kn3-1", title: "Glatt rechts & kraus rechts", topic: "kn-glatt", min: 10, xp: 30, blocks: [
    { t: "lead", html: "Mit nur zwei Maschen entstehen die zwei wichtigsten Maschenbilder." },
    { t: "html", html: `<div class="grid g2"><div class="card col" style="gap:6px"><b>Glatt rechts (Stockinette)</b><small>Hinreihe rechts, Rückreihe links. Vorne Vs, hinten Knötchen. <b>Rollt sich</b> an den Rändern ein.</small></div><div class="card col" style="gap:6px"><b>Kraus rechts (Garter)</b><small>Jede Reihe rechts. Beide Seiten gleich, Rippen aus Knötchen. <b>Rollt nicht</b>, sehr elastisch in der Höhe.</small></div></div>` },
    { t: "widget", w: "v3d", model: "compare-glatt", title: "Vergleich im 3D-Modell", note: "Wechsle zwischen den Mustern und drehe die Probe. Beachte: Kraus rechts hat pro sichtbarer Rippe <b>2 Reihen</b>." },
    { t: "check", q: "Warum rollt sich glatt rechts am Rand ein?", opts: ["Weil die Wolle zu dick ist", "Weil Vorder- und Rückseite unterschiedlich viel Spannung haben", "Weil man falsch gestrickt hat", "Weil man zu locker strickt"], a: 1, why: "Rechte und linke Maschen ziehen unterschiedlich. Deshalb bekommen glatte Stücke Bündchen, Rippen- oder Krausränder." },
    { t: "check", q: "Wie viele Reihen ergeben bei kraus rechts eine sichtbare Rippe?", opts: ["1", "2", "3", "4"], a: 1, why: "Eine Rippe (Knötchenreihe) entsteht aus zwei gestrickten Reihen." },
    { t: "widget", w: "pairs", topic: "kn-glatt", title: "Muster und Anleitung", pairs: [["Glatt rechts", "Hinreihe rechts, Rückreihe links"], ["Kraus rechts", "Alle Reihen rechts"], ["Glatt rechts in Runden", "Alle Runden rechts"], ["Kraus rechts in Runden", "Runden abwechselnd rechts und links"]] }
  ]},
  { id: "kn3-2", title: "Rippen & Perlmuster", topic: "kn-rippe", min: 12, xp: 30, blocks: [
    { t: "lead", html: "Rippen machen Bündchen elastisch, das Perlmuster gibt eine körnige, flache Oberfläche." },
    { t: "widget", w: "v3d", model: "compare-rippe", title: "Rippen im 3D-Modell", note: "Bei <b>1×1-Rippen</b> wechselt jede Masche. Schau von der Seite: Die linken Maschen liegen tiefer – deshalb zieht sich das Gestrick zusammen." },
    { t: "text", h: "Die Regel dahinter", levels: {
      simple: "Rippen: Strick die Maschen so, wie sie dir erscheinen. Perlmuster: Strick sie genau umgekehrt.",
      normal: "<b>Rippen</b> (1 re, 1 li): In der Rückreihe strickst du die Maschen, „wie sie erscheinen“ (V → rechts, Knötchen → links). <b>Perlmuster</b>: versetzt – du strickst jede Masche <i>gegengleich</i> zu dem, wie sie erscheint. Bei ungerader Maschenzahl ist jede Reihe gleich: „1 re, 1 li“ bis zum Ende.",
      technical: "Bei Rippen stehen gleiche Maschen übereinander (vertikale Linien), beim Perlmuster diagonal versetzt (Schachbrett). Das Moos-/Gerstenkornmuster (Double Seed) versetzt erst nach 2 Reihen. Beim Wechsel zwischen re und li wandert der Faden zwischen den Nadeln nach vorne oder hinten." } },
    { t: "widget", w: "fabric", preset: "rib1", title: "Maschenbild 1×1-Rippe" },
    { t: "widget", w: "fabric", preset: "seed", title: "Maschenbild Perlmuster" },
    { t: "check", q: "Beim Wechsel von einer rechten zu einer linken Masche muss der Faden …", opts: ["hinten bleiben", "zwischen den Nadeln nach vorne", "um die Nadel gewickelt werden", "abgeschnitten werden"], a: 1, why: "Linke Maschen brauchen den Faden vorne – sonst entsteht ein Umschlag." },
    { t: "check", q: "Perlmuster, Rückreihe: Vor dir liegt ein V. Was strickst du?", opts: ["Rechts", "Links", "Umschlag", "Abheben"], a: 1, why: "Perlmuster = gegengleich stricken. V (rechte Masche) → links stricken." }
  ]},
  { id: "kn3-3", title: "Maschen lesen & zählen", topic: "kn-lesen", min: 10, xp: 30, blocks: [
    { t: "lead", html: "Wer sein Gestrick „lesen“ kann, findet Fehler sofort und braucht die Anleitung seltener." },
    { t: "widget", w: "v3d", model: "count", title: "Reihen zählen", note: "Jedes <b>V</b> ist eine Reihe. Zähl die Vs einer senkrechten Säule – die Masche auf der Nadel zählt nicht mit." },
    { t: "html", html: `<ul class="col" style="gap:6px;padding-left:20px;margin:0"><li><b>V</b> = rechte Masche (von dieser Seite gesehen)</li><li><b>Knötchen/Querbalken</b> = linke Masche</li><li><b>Loch</b> = Umschlag (gewollt?) oder fallen gelassene Masche</li><li><b>Schräg liegendes V</b> = Abnahme; k2tog neigt nach rechts, ssk nach links</li><li><b>Verdrehtes V</b> (Beine gekreuzt) = Masche verschränkt oder falsch herum auf der Nadel</li></ul>` },
    { t: "tip", html: "<b>Trick:</b> Maschenmarkierer alle 10 oder 20 Maschen einsetzen – dann musst du nie wieder ganz von vorne zählen." },
    { t: "check", q: "Eine Säule zeigt 12 Vs übereinander, auf der Nadel liegt noch eine Masche. Wie viele Reihen?", opts: ["11", "12", "13", "24"], a: 1, why: "Die Vs im Gestrick sind die Reihen; die Schlinge auf der Nadel ist die aktuelle, noch nicht vollendete Reihe." },
    { t: "check", q: "Eine Masche sitzt verdreht (Beine gekreuzt). Häufigste Ursache?", opts: ["Zu dicke Nadel", "Die Masche saß falsch herum auf der Nadel (hinteres Bein vorne)", "Zu viel Garn", "Falsche Farbe"], a: 1, why: "Nach dem Aufheben/Zurückstricken sitzt eine Masche oft verkehrt. Vorderes Bein gehört vor die Nadel." }
  ]}
 ]},

 { id: "knw4", n: 4, title: "Formgebung", sub: "Zunehmen, abnehmen, verteilen", boss: null, lessons: [
  { id: "kn4-1", title: "Zunehmen", topic: "kn-zu", min: 10, xp: 30, blocks: [
    { t: "lead", html: "Zunahmen machen dein Stück breiter – sichtbar als Loch (Umschlag) oder fast unsichtbar (M1)." },
    { t: "widget", w: "tech", id: "yo" },
    { t: "html", html: `<div class="table-wrap"><table class="dt"><thead><tr><th>Zunahme</th><th>EN</th><th>Wirkung</th></tr></thead><tbody>
      <tr><td>Umschlag</td><td>yo</td><td>Loch – dekorativ (Lochmuster, Raglan)</td></tr>
      <tr><td>Aus dem Querfaden, links geneigt</td><td>M1L</td><td>fast unsichtbar, neigt nach links</td></tr>
      <tr><td>Aus dem Querfaden, rechts geneigt</td><td>M1R</td><td>fast unsichtbar, neigt nach rechts</td></tr>
      <tr><td>Rechts vorne und hinten</td><td>kfb</td><td>kleines Knötchen, sehr einfach</td></tr></tbody></table></div>` },
    { t: "tip", html: "Querfaden = der waagrechte Faden zwischen zwei Maschen. Hebe ihn auf und stricke ihn <b>verschränkt</b> – sonst entsteht doch ein Loch." },
    { t: "check", q: "Welche Zunahme macht absichtlich ein Loch?", opts: ["M1L", "Umschlag (yo)", "kfb", "M1R"], a: 1, why: "Der Umschlag wird in der nächsten Reihe normal abgestrickt und bleibt als Loch sichtbar." }
  ]},
  { id: "kn4-2", title: "Abnehmen", topic: "kn-ab", min: 10, xp: 30, blocks: [
    { t: "lead", html: "Abnahmen haben eine Richtung. Symmetrisch gesetzt sehen sie professionell aus (z. B. Raglan, Mützenspitze)." },
    { t: "widget", w: "tech", id: "k2tog" },
    { t: "html", html: `<div class="table-wrap"><table class="dt"><thead><tr><th>Abnahme</th><th>EN</th><th>Neigung</th></tr></thead><tbody>
      <tr><td>2 Maschen rechts zusammen</td><td>k2tog</td><td>nach rechts</td></tr>
      <tr><td>Überzogene Abnahme / abheben-abheben-stricken</td><td>ssk / skp</td><td>nach links</td></tr>
      <tr><td>2 Maschen links zusammen</td><td>p2tog</td><td>(Rückreihe)</td></tr>
      <tr><td>Doppelte Abnahme mittig</td><td>s2kp / cdd</td><td>senkrecht</td></tr></tbody></table></div>` },
    { t: "tip", html: "Für symmetrische Kanten: <b>am Reihenanfang ssk</b> (neigt nach links, zur Mitte), <b>am Reihenende k2tog</b> (neigt nach rechts, zur Mitte)." },
    { t: "check", q: "Du willst am Reihenende eine nach rechts geneigte Abnahme. Welche?", opts: ["ssk", "k2tog", "yo", "kfb"], a: 1, why: "k2tog neigt sich nach rechts." }
  ]},
  { id: "kn4-3", title: "Gleichmäßig verteilen", topic: "kn-vert", min: 8, xp: 25, blocks: [
    { t: "lead", html: "„Nimm in der nächsten Reihe 8 Maschen gleichmäßig verteilt zu“ – der Klassiker, der alle ins Schwitzen bringt. Der Rechner hilft." },
    { t: "widget", w: "evenly" },
    { t: "check", q: "96 Maschen, 8 Zunahmen gleichmäßig verteilt. Nach wie vielen Maschen jeweils zunehmen?", opts: ["8", "10", "12", "16"], a: 2, why: "96 / 8 = 12 – nach jeder 12. Masche eine Zunahme." }
  ]}
 ]},

 { id: "knw5", n: 5, title: "Anleitungen lesen", sub: "Abkürzungen & Strickschrift", boss: { id: "boss-knw5", title: "Anleitungs-Boss", topics: ["kn-abkz", "kn-chart"] }, lessons: [
  { id: "kn5-1", title: "Abkürzungen DE/EN", topic: "kn-abkz", min: 10, xp: 30, blocks: [
    { t: "lead", html: "Die meisten Anleitungen (z. B. auf Ravelry) sind englisch. Mit 15 Abkürzungen verstehst du 90 %." },
    { t: "widget", w: "abbr", craft: "knit" },
    { t: "widget", w: "pairs", topic: "kn-abkz", title: "Abkürzungen zuordnen", pairs: [["k", "rechte Masche"], ["p", "linke Masche"], ["yo", "Umschlag"], ["k2tog", "2 re zusammen"], ["RS / WS", "Hinreihe / Rückreihe"], ["rep", "wiederholen"], ["pm / sm", "Markierer setzen / abheben"]] },
    { t: "widget", w: "gapfill", topic: "kn-abkz", title: "Übersetze die Zeile", items: [{ s: "„k2, p2“ heißt: 2 rechts, 2 ___", a: ["links", "li"] }, { s: "„CO 40 sts“ heißt: 40 Maschen ___", a: ["anschlagen"] }, { s: "„BO“ heißt: ___", a: ["abketten"] }] }
  ]},
  { id: "kn5-2", title: "Strickschrift lesen", topic: "kn-chart", min: 12, xp: 35, blocks: [
    { t: "lead", html: "Eine Strickschrift (Chart) zeigt das Muster als Raster: jedes Kästchen eine Masche, jede Zeile eine Reihe – so wie das Gestrick von vorne aussieht." },
    { t: "text", h: "Leserichtung", levels: {
      simple: "Unten anfangen. Hinreihen von rechts nach links lesen, Rückreihen von links nach rechts.",
      normal: "Die Strickschrift zeigt die <b>Vorderseite</b>. In <b>Hinreihen</b> (RS, ungerade Nummer rechts am Rand) liest du von rechts nach links und strickst, was du siehst. In <b>Rückreihen</b> (WS, Nummer links) liest du von links nach rechts und strickst <b>gegengleich</b>: leeres Kästchen (rechts) → links stricken. Beim Rundstricken liest du jede Runde von rechts nach links.",
      technical: "Symbole folgen meist dem Standard: leeres Feld = re (RS)/li (WS), Punkt = li (RS)/re (WS), Kreis = Umschlag, / = k2tog, \\ = ssk, graue Felder = „keine Masche“. Rapporte sind mit dickem Rahmen markiert." } },
    { t: "widget", w: "designer", preset: "rib2", compact: true },
    { t: "check", q: "Rückreihe, im Chart ein leeres Kästchen (= rechts auf der Vorderseite). Was strickst du?", opts: ["Rechts", "Links", "Umschlag", "Nichts"], a: 1, why: "In Rückreihen strickst du gegengleich, damit es auf der Vorderseite rechts aussieht." },
    { t: "check", q: "Wo beginnt man eine Strickschrift?", opts: ["Oben links", "Oben rechts", "Unten rechts", "Unten links"], a: 2, why: "Reihe 1 ist unten, Hinreihen werden von rechts nach links gelesen." }
  ]}
 ]},

 { id: "knw6", n: 6, title: "Fehler retten", sub: "Keine Panik – fast alles ist reparierbar", boss: null, lessons: [
  { id: "kn6-1", title: "Gefallene Masche, Löcher & Co.", topic: "kn-fehler", min: 12, xp: 35, blocks: [
    { t: "lead", html: "Eine gefallene Masche läuft wie eine Laufmasche nach unten – mit einer Häkelnadel holst du sie Querfaden für Querfaden wieder hoch." },
    { t: "html", html: `<ol class="col" style="gap:8px;padding-left:20px;margin:0"><li>Masche sofort mit einer Sicherheitsnadel oder einem Markierer sichern.</li><li>Arbeit so drehen, dass du auf die <b>rechte Seite (Vs)</b> schaust.</li><li>Häkelnadel <b>von vorne</b> in die Masche stecken, den <b>untersten Querfaden (Leitersprosse)</b> dahinter greifen und durch die Masche ziehen.</li><li>Wiederholen, bis alle Sprossen verbraucht sind. Masche zurück auf die linke Nadel – <b>vorderes Bein vorne</b>.</li></ol>` },
    { t: "widget", w: "v3d", model: "ladder", title: "Die Leiter sehen", note: "Im Modell fehlt in einer Säule die Masche: Die waagrechten Fäden (Sprossen) sind die Querfäden, die du einzeln wieder einhäkelst." },
    { t: "text", h: "Weitere Rettungen", levels: {
      simple: "Fehler in der aktuellen Reihe: Masche für Masche zurückstricken. Fehler weiter unten: bis dorthin aufribbeln – mit Rettungsleine.",
      normal: "<b>Tinking</b> (knit rückwärts): Nadel in die Masche darunter stecken und die obere Masche lösen – Masche für Masche. <b>Frogging</b> (ribbeln, „rip it“): Nadel raus und Reihen aufziehen. <b>Rettungsleine (Lifeline)</b>: Vor schwierigen Mustern einen glatten Kontrastfaden mit einer Wollnadel durch alle Maschen einer Reihe ziehen – beim Ribbeln stoppt alles dort.",
      technical: "Beim Ribbeln bis zur Rettungsleine die Maschen mit einer dünneren Nadel aufnehmen (geht leichter) und in der nächsten Reihe auf die richtige Nadel stricken. Auf Maschenorientierung achten: Bei rechten Maschen liegt das vordere Bein rechts vor der Nadel." } },
    { t: "check", q: "Was ist eine Rettungsleine (Lifeline)?", opts: ["Ein extra starkes Garn", "Ein Kontrastfaden durch eine Maschenreihe, bis zu dem man sicher aufribbeln kann", "Eine Sicherheitsnadel", "Ein Maschenmarkierer am Rand"], a: 1, why: "Der Faden hält die Maschen der Reihe fest – beim Aufribbeln kann nichts weiter aufgehen." },
    { t: "check", q: "Mit welchem Werkzeug holst du eine gefallene Masche hoch?", opts: ["Schere", "Häkelnadel", "Wollnadel", "Maßband"], a: 1, why: "Die Häkelnadel greift jede Sprosse und zieht sie durch die Masche." }
  ]}
 ]},

 { id: "knw7", n: 7, title: "Rund, Zopf & Farbe", sub: "Für Fortgeschrittene", boss: null, lessons: [
  { id: "kn7-1", title: "In Runden stricken", topic: "kn-runde", min: 10, xp: 30, blocks: [
    { t: "lead", html: "Mützen, Socken und Pullis ohne Nähte: Du strickst im Kreis – und brauchst nur noch rechte Maschen für glatt rechts." },
    { t: "html", html: `<ol class="col" style="gap:6px;padding-left:20px;margin:0"><li>Maschen auf die Rundnadel anschlagen.</li><li><b>Nicht verdrehen!</b> Die Anschlagkante muss rundherum innen liegen – sonst entsteht ein Möbiusband.</li><li>Markierer für den Rundenbeginn setzen.</li><li>Erste Masche der Runde stricken und Faden fest anziehen (schließt die Runde).</li></ol>` },
    { t: "warnbox", html: "Der häufigste Fehler beim Rundstricken ist die verdrehte Anschlagkante. Prüfe sie vor der ersten Runde zweimal." },
    { t: "check", q: "Glatt rechts in Runden gestrickt bedeutet …", opts: ["Runden abwechselnd rechts und links", "Alle Runden rechts", "Alle Runden links", "Nur jede zweite Runde"], a: 1, why: "Du schaust immer auf die Außenseite – also immer rechts." }
  ]},
  { id: "kn7-2", title: "Zöpfe", topic: "kn-zopf", min: 10, xp: 30, blocks: [
    { t: "lead", html: "Zöpfe sind einfach vertauschte Maschen: Ein paar Maschen warten auf einer Zopfnadel vor oder hinter der Arbeit." },
    { t: "text", h: "C4F und C4B", levels: {
      simple: "Zopfnadel vorne → der Zopf kreuzt nach links. Zopfnadel hinten → nach rechts.",
      normal: "<b>C4F</b> (Cable 4 Front): 2 M auf die Zopfnadel <b>vor</b> die Arbeit, 2 M rechts stricken, dann die 2 M der Zopfnadel rechts stricken → Kreuzung neigt <b>nach links</b>. <b>C4B</b>: Zopfnadel <b>hinter</b> die Arbeit → neigt <b>nach rechts</b>. Zwischen den Kreuzungen meist 3–7 Reihen glatt.",
      technical: "Zöpfe ziehen das Gestrick zusammen: Rechne 10–20 % mehr Maschen ein als bei glatt rechts. Links neben/rechts neben Zöpfen stehen meist linke Maschen, damit der Zopf plastisch hervortritt. Zopfnadel-frei: die Maschen kurz von der Nadel gleiten lassen und neu aufnehmen." } },
    { t: "check", q: "Zopfnadel vor der Arbeit – wohin neigt der Zopf?", opts: ["Nach links", "Nach rechts", "Nach oben", "Er kreuzt nicht"], a: 0, why: "Zopfnadel vorne (Front) → die Kreuzung neigt nach links (Left Cross). Zopfnadel hinten (Back) → nach rechts." }
  ]},
  { id: "kn7-3", title: "Streifen, Fair Isle & Intarsia", topic: "kn-farbe", min: 12, xp: 35, blocks: [
    { t: "lead", html: "Mit Farben arbeiten: Streifen sind am einfachsten, Fair Isle strickt zwei Farben pro Reihe, Intarsia große Farbflächen." },
    { t: "widget", w: "v3d", model: "stripes", title: "Streifen in 3D", note: "Farbwechsel immer am Reihenanfang. In Runden entsteht an der Wechselstelle eine kleine Stufe (Jogless-Trick hilft)." },
    { t: "widget", w: "v3d", model: "fairisle", title: "Fair Isle", note: "Zwei Farben in einer Reihe – die nicht benutzte Farbe läuft hinten als <b>Spannfaden</b> mit. Spannfäden locker lassen, sonst zieht sich das Muster zusammen." },
    { t: "check", q: "Was ist ein Spannfaden?", opts: ["Ein Faden zum Spannen des fertigen Stücks", "Die gerade nicht verwendete Farbe, die hinten mitgeführt wird", "Der Anschlagfaden", "Ein Rettungsfaden"], a: 1, why: "Beim Fair Isle läuft die zweite Farbe auf der Rückseite mit. Lange Spannfäden (> 5 Maschen) werden eingefangen." }
  ]}
 ]},

 { id: "knw8", n: 8, title: "Fertigstellen", sub: "Vernähen, Spannen, Zusammennähen", boss: null, lessons: [
  { id: "kn8-1", title: "Der letzte Schliff", topic: "kn-finish", min: 10, xp: 30, blocks: [
    { t: "lead", html: "Fertigstellen macht aus „selbstgemacht“ ein „handgemacht“. Spannen (Blocken) ist der größte Unterschied." },
    { t: "text", h: "Die drei Schritte", levels: {
      simple: "Fäden auf der Rückseite vernähen. Das Stück nass machen und in Form trocknen lassen. Teile mit dem Matratzenstich zusammennähen.",
      normal: "<b>Vernähen</b>: Mit der Wollnadel ca. 5 cm diagonal durch die Maschenköpfe auf der Rückseite, einmal zurück, abschneiden. <b>Spannen</b>: Nass (einweichen, ausdrücken, auf Maße legen, feststecken, trocknen lassen) oder mit Dampf. Lochmuster öffnen sich dabei wunderschön. <b>Zusammennähen</b>: Matratzenstich – unsichtbar, von der rechten Seite aus.",
      technical: "Acryl verträgt keinen heißen Dampf (wird „tot“ und glänzt). Superwash dehnt sich nass stark – nicht hängend trocknen. Für Lace: Spanndrähte + Pins verwenden. Beim Matratzenstich die Querfäden zwischen Randmasche und nächster Masche aufnehmen." } },
    { t: "tip", html: "Faden nie am Rand vernähen, wo er gesehen wird – bei Streifen die Fäden in der gleichen Farbe verstecken." },
    { t: "check", q: "Was bewirkt das Spannen (Blocken)?", opts: ["Es färbt das Garn", "Es gleicht Maschen aus und bringt das Stück in Form", "Es macht das Garn dicker", "Es ist nur für Häkeln"], a: 1, why: "Durch Feuchtigkeit entspannen sich die Fasern; die Maschen werden gleichmäßiger, Lochmuster öffnen sich." }
  ]}
 ]}
];

const QUESTIONS = [
 { id: "knq1", topic: "kn-garn", q: "Was steht NICHT auf einer typischen Banderole?", opts: ["Lauflänge", "Empfohlene Nadelstärke", "Farbpartie", "Anzahl benötigter Knäuel für einen Pulli"], a: 3, why: "Den Bedarf findest du in der Anleitung, nicht auf dem Etikett." },
 { id: "knq2", topic: "kn-garn", q: "Welche Garnstärke ist ideal für den ersten Schal?", opts: ["Lace", "Fingering", "Worsted/Aran", "Nähgarn"], a: 2, why: "Mittelstarkes Garn zeigt die Maschen deutlich und geht zügig." },
 { id: "knq3", topic: "kn-nadel", q: "Wofür ist ein Nadelspiel gedacht?", opts: ["Kleine Rundungen wie Socken", "Decken", "Nur für Zöpfe", "Zum Messen"], a: 0, why: "4–5 kurze Nadeln bilden einen kleinen Kreis." },
 { id: "knq4", topic: "kn-probe", q: "Wo misst man die Maschenprobe?", opts: ["Am Rand", "In der Mitte der Probe", "An der Anschlagkante", "Egal"], a: 1, why: "Die Ränder sind verzogen, die Mitte ist repräsentativ." },
 { id: "knq5", topic: "kn-probe", q: "Probe: 18 M/10 cm, Anleitung: 20 M/10 cm. Was tun?", opts: ["Dickere Nadel", "Dünnere Nadel", "Nichts", "Anderes Muster"], a: 1, why: "Zu wenige Maschen → Maschen zu groß → dünnere Nadel." },
 { id: "knq6", topic: "kn-anschl", q: "Welcher Anschlag ist am elastischsten und gleichzeitig die erste Reihe?", opts: ["Kreuzanschlag", "Aufstricken", "Luftmaschenanschlag", "Kettmaschen"], a: 0, why: "Der Kreuzanschlag ist Standard für fast alles." },
 { id: "knq7", topic: "kn-rechts", q: "Bei der rechten Masche wird eingestochen …", opts: ["von hinten nach vorne", "von vorne nach hinten", "von oben", "gar nicht"], a: 1, why: "Rechte Nadel von vorne nach hinten durch die Masche." },
 { id: "knq8", topic: "kn-links", q: "Bei der linken Masche liegt der Faden …", opts: ["hinten", "vorne", "um den Daumen", "unter der Nadel"], a: 1, why: "Faden vorne, Nadel von rechts nach links vor der Masche einstechen." },
 { id: "knq9", topic: "kn-abk", q: "Beim Abketten hebt man …", opts: ["die erste Masche über die zweite", "die zweite Masche auf der rechten Nadel über die erste und von der Nadel", "alle Maschen gleichzeitig ab", "Maschen auf die Zopfnadel"], a: 1, why: "Die hintere (ältere) Masche wird über die neue gehoben." },
 { id: "knq10", topic: "kn-glatt", q: "Kraus rechts in Reihen heißt:", opts: ["Alle Reihen rechts", "Hin rechts, rück links", "Alle Reihen links", "1 re, 1 li"], a: 0, why: "Jede Reihe rechts – auf beiden Seiten entstehen Rippen." },
 { id: "knq11", topic: "kn-glatt", q: "Welches Maschenbild rollt sich ein?", opts: ["Kraus rechts", "Rippen", "Glatt rechts", "Perlmuster"], a: 2, why: "Glatt rechts rollt, die anderen liegen flach." },
 { id: "knq12", topic: "kn-rippe", q: "Wofür verwendet man 2×2-Rippen typischerweise?", opts: ["Bündchen an Ärmeln und Mützen", "Topflappen", "Lochmuster", "Zöpfe"], a: 0, why: "Rippen sind in der Breite sehr elastisch." },
 { id: "knq13", topic: "kn-rippe", q: "Perlmuster über ungerade Maschenzahl: jede Reihe …", opts: ["1 re, 1 li bis Ende", "alles rechts", "alles links", "2 re, 2 li"], a: 0, why: "Durch die ungerade Zahl verschiebt sich der Wechsel automatisch." },
 { id: "knq14", topic: "kn-lesen", q: "Ein waagrechtes Knötchen auf der Vorderseite ist …", opts: ["eine rechte Masche", "eine linke Masche", "ein Umschlag", "eine Zunahme"], a: 1, why: "Knötchen = linke Masche." },
 { id: "knq15", topic: "kn-zu", q: "Welche Zunahme ist fast unsichtbar?", opts: ["Umschlag", "M1 aus dem Querfaden (verschränkt)", "Zwei Maschen zusammen", "Abketten"], a: 1, why: "Der verschränkt gestrickte Querfaden schließt das Loch." },
 { id: "knq16", topic: "kn-ab", q: "ssk neigt sich …", opts: ["nach rechts", "nach links", "senkrecht", "gar nicht"], a: 1, why: "ssk ist das Spiegelbild von k2tog." },
 { id: "knq17", topic: "kn-vert", q: "80 Maschen, 10 Abnahmen gleichmäßig: Wie oft strickst du 2 zusammen?", opts: ["Nach 8 Maschen je 1×: 6 re, 2 zus", "Alle 10 Maschen", "Alle 5 Maschen", "Nur am Rand"], a: 0, why: "80/10 = 8: je 8 Maschen → 6 re, dann 2 zus." },
 { id: "knq18", topic: "kn-abkz", q: "„p2tog“ bedeutet:", opts: ["2 links zusammenstricken", "2 Umschläge", "2 rechts", "2 abheben"], a: 0, why: "p = purl (links), 2tog = zwei zusammen." },
 { id: "knq19", topic: "kn-abkz", q: "„RS“ steht für …", opts: ["Right Side – Hinreihe/Vorderseite", "Rundenstart", "Rechte Seite der Nadel", "Rippenmuster"], a: 0, why: "RS = right side (Vorderseite), WS = wrong side (Rückseite)." },
 { id: "knq20", topic: "kn-chart", q: "In einer Strickschrift bedeutet ein Kreis meist …", opts: ["linke Masche", "Umschlag", "Abnahme", "keine Masche"], a: 1, why: "○ = yarn over / Umschlag." },
 { id: "knq21", topic: "kn-fehler", q: "Du hast 3 Reihen tiefer einen Fehler. Erste Wahl bei glatter Fläche?", opts: ["Alles wegwerfen", "Nur die betroffene Säule mit der Häkelnadel fallen lassen und neu hochholen", "Fehler verstecken", "Doppelt so dick weiterstricken"], a: 1, why: "Bei einzelnen Maschen musst du nicht alles aufribbeln." },
 { id: "knq22", topic: "kn-runde", q: "Was ist der häufigste Fehler beim Schließen zur Runde?", opts: ["Zu dicke Nadel", "Die Anschlagkante ist verdreht", "Zu viele Markierer", "Falsche Farbe"], a: 1, why: "Verdreht = Möbiusband, lässt sich nicht mehr korrigieren." },
 { id: "knq23", topic: "kn-zopf", q: "Warum braucht ein Zopfmuster mehr Maschen als glatt rechts?", opts: ["Weil Zöpfe das Gestrick zusammenziehen", "Wegen der Zopfnadel", "Das stimmt nicht", "Weil man links strickt"], a: 0, why: "Die Kreuzungen ziehen die Breite zusammen." },
 { id: "knq24", topic: "kn-farbe", q: "Intarsia eignet sich für …", opts: ["große einzelne Farbflächen (z. B. ein Herz)", "kleine Muster über die ganze Reihe", "Streifen", "Rippen"], a: 0, why: "Jede Farbfläche hat ihr eigenes Knäuel, keine langen Spannfäden." },
 { id: "knq25", topic: "kn-finish", q: "Welches Garn verträgt keinen heißen Dampf?", opts: ["Wolle", "Baumwolle", "Acryl", "Leinen"], a: 2, why: "Acryl schmilzt leicht an und wird schlaff." }
];
const BOSS_EXTRA = [
 { id: "knb1", topic: "kn-rechts", q: "Nach einer Reihe hast du plötzlich 21 statt 20 Maschen. Wahrscheinlichste Ursache?", opts: ["Faden lag vorne → ungewollter Umschlag", "Zu dicke Nadel", "Maschenprobe falsch", "Abgekettet"], a: 0, why: "Ein Faden vorne bei einer rechten Masche erzeugt einen Umschlag = +1 Masche." },
 { id: "knb2", topic: "kn-rippe", q: "Dein Bündchen sieht aus wie Perlmuster statt Rippen. Was lief schief?", opts: ["In der Rückreihe gegengleich statt „wie sie erscheinen“ gestrickt", "Zu dicke Nadel", "Faden gerissen", "Nichts"], a: 0, why: "Rippen: wie sie erscheinen. Perlmuster: gegengleich." },
 { id: "knb3", topic: "kn-chart", q: "Chart Reihe 2 (WS) zeigt: ■ □ □ ■ (■ = Punkt). Von links nach rechts strickst du …", opts: ["re, li, li, re", "li, re, re, li", "re, re, re, re", "li, li, li, li"], a: 0, why: "WS gegengleich: Punkt (= li auf RS) wird rechts gestrickt, leer (= re auf RS) wird links gestrickt." }
];
const FLASHCARDS = [
 { id: "knf1", cat: "Material", topic: "kn-garn", front: "Farbpartie (Dye Lot)", back: "Nummer der Färbung – für ein Projekt immer dieselbe kaufen." },
 { id: "knf2", cat: "Material", topic: "kn-probe", front: "Maschenprobe", back: "10 × 10 cm im Muster stricken, waschen, in der Mitte zählen. Zu viele Maschen → dickere Nadel." },
 { id: "knf3", cat: "Maschen", topic: "kn-rechts", front: "Rechte Masche – Ablauf", back: "Faden hinten · von vorne nach hinten einstechen · umschlingen · durchholen · abgleiten lassen." },
 { id: "knf4", cat: "Maschen", topic: "kn-links", front: "Linke Masche – Ablauf", back: "Faden vorne · von rechts nach links vor der Masche einstechen · umlegen · nach hinten durchschieben · abgleiten." },
 { id: "knf5", cat: "Muster", topic: "kn-glatt", front: "Glatt rechts (Reihen)", back: "Hinreihe rechts, Rückreihe links. Vorne Vs, rollt sich ein." },
 { id: "knf6", cat: "Muster", topic: "kn-glatt", front: "Kraus rechts (Reihen)", back: "Alle Reihen rechts. Rippen, beidseitig gleich, rollt nicht." },
 { id: "knf7", cat: "Muster", topic: "kn-rippe", front: "Rippen vs. Perlmuster", back: "Rippen: Maschen stricken, wie sie erscheinen. Perlmuster: gegengleich." },
 { id: "knf8", cat: "Formgebung", topic: "kn-zu", front: "yo · M1L · M1R · kfb", back: "Umschlag (Loch) · Querfaden links geneigt · rechts geneigt · vorne+hinten rechts." },
 { id: "knf9", cat: "Formgebung", topic: "kn-ab", front: "k2tog vs. ssk", back: "k2tog neigt nach rechts, ssk nach links. Symmetrisch: Anfang ssk, Ende k2tog." },
 { id: "knf10", cat: "Anleitung", topic: "kn-abkz", front: "CO · BO · RS · WS", back: "Anschlagen · Abketten · Hinreihe/Vorderseite · Rückreihe/Rückseite." },
 { id: "knf11", cat: "Anleitung", topic: "kn-chart", front: "Strickschrift lesen", back: "Unten beginnen. RS von rechts nach links, WS von links nach rechts gegengleich. Runden immer rechts→links." },
 { id: "knf12", cat: "Tricks", topic: "kn-fehler", front: "Rettungsleine", back: "Kontrastfaden durch alle Maschen einer Reihe – beim Aufribbeln stoppt es dort." },
 { id: "knf13", cat: "Tricks", topic: "kn-fehler", front: "Gefallene Masche", back: "Von der rechten Seite mit Häkelnadel jede Querfaden-Sprosse durch die Masche ziehen." },
 { id: "knf14", cat: "Weiterführend", topic: "kn-zopf", front: "C4F vs. C4B", back: "Zopfnadel vorne → neigt links. Zopfnadel hinten → neigt rechts." },
 { id: "knf15", cat: "Weiterführend", topic: "kn-farbe", front: "Spannfaden", back: "Nicht verwendete Farbe hinten mitführen, locker; nach ~5 Maschen einfangen." },
 { id: "knf16", cat: "Fertigstellen", topic: "kn-finish", front: "Spannen (Blocken)", back: "Nass machen, auf Maß legen, feststecken, trocknen lassen – Maschen werden gleichmäßig." }
];
window.COURSE_DEFS = window.COURSE_DEFS || [];
window.COURSE_DEFS.push({
  id: "knit", track: "craft", lang: "de", name: "Stricken lernen", short: "STRICKEN", title: "Stricken", semester: null, ects: null, color: "#C8664B", icon: "✿", status: "active",
  lecturers: "Eigenes Lernmaterial · mit 3D-Modellen & Animationen",
  description: "Von der ersten Masche bis zu Zöpfen und Farbmustern – Schritt für Schritt, mit Animationen und 3D-Modellen.",
  topics: TOPICS, worlds: WORLDS, questions: QUESTIONS, bossExtra: BOSS_EXTRA, flashcards: FLASHCARDS,
  resources: { sections: [
    { title: "Videos (YouTube-Suche)", items: [
      { title: "Kreuzanschlag", url: "https://www.youtube.com/results?search_query=Kreuzanschlag+stricken+lernen", note: "Suche auf YouTube" },
      { title: "Rechte & linke Masche", url: "https://www.youtube.com/results?search_query=rechte+und+linke+Masche+stricken+Anf%C3%A4nger", note: "Suche auf YouTube" },
      { title: "Gefallene Masche aufnehmen", url: "https://www.youtube.com/results?search_query=gefallene+Masche+aufnehmen+H%C3%A4kelnadel", note: "Suche auf YouTube" },
      { title: "Matratzenstich", url: "https://www.youtube.com/results?search_query=Matratzenstich+stricken", note: "Suche auf YouTube" }] },
    { title: "Anleitungen & Wissen", items: [
      { title: "Ravelry – riesige Anleitungsdatenbank", url: "https://www.ravelry.com", note: "Kostenloses Konto, Filter nach Garnstärke, Schwierigkeit und Sprache" },
      { title: "Craft Yarn Council – Standards", url: "https://www.craftyarncouncil.com/standards", note: "Garnstärken, Abkürzungen, Symbole" }] }
  ] },
  events: [], tasks: []
});
})();
