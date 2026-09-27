/* Häkeln – Kurs für das Craft-Profil (Track "craft"). Eigenes Lernmaterial. */
(function () {
const TOPICS = {
  "cr-mat":    { name: "Nadeln, Garn & Haltung",     lesson: "cr1-1" },
  "cr-lm":     { name: "Luftmasche",                  lesson: "cr2-1" },
  "cr-km":     { name: "Kettmasche",                  lesson: "cr2-2" },
  "cr-fm":     { name: "Feste Masche",                lesson: "cr2-3" },
  "cr-stb":    { name: "Stäbchen-Familie",            lesson: "cr2-4" },
  "cr-reihe":  { name: "Reihen & Wendeluftmaschen",   lesson: "cr3-1" },
  "cr-runde":  { name: "Runden & Magic Ring",         lesson: "cr3-2" },
  "cr-form":   { name: "Zu- & Abnehmen",              lesson: "cr4-1" },
  "cr-ami":    { name: "Amigurumi",                   lesson: "cr4-2" },
  "cr-usuk":   { name: "US/UK-Begriffe",              lesson: "cr5-1" },
  "cr-schrift":{ name: "Häkelschrift & Granny",       lesson: "cr5-2" },
  "cr-tricks": { name: "Tricks & Fehler",             lesson: "cr6-1" }
};
const WORLDS = [
 { id: "crw1", n: 1, title: "Start", sub: "Nadel, Garn, Haltung", boss: null, lessons: [
  { id: "cr1-1", title: "Häkelnadel, Garn & Haltung", topic: "cr-mat", min: 8, xp: 20, blocks: [
    { t: "lead", html: "Häkeln braucht nur eine Nadel – und fast jede Masche entsteht aus Umschlag und Durchziehen." },
    { t: "text", h: "Die richtige Nadel", levels: {
      simple: "Für den Anfang: eine Häkelnadel 4–5 mm mit weichem Griff und helles, glattes Baumwoll- oder Baumwollmischgarn.",
      normal: "Nadelstärke laut Banderole, für Amigurumi meist 0,5–1 mm <b>dünner</b>, damit keine Füllwatte durchschaut. <b>Inline</b>-Haken (gerader Hals, z. B. Boye-Form) vs. <b>tapered</b> (verjüngt, z. B. Clover/Tulip-Form) – Geschmackssache, beide ausprobieren. Ergonomischer Griff schont das Handgelenk bei langen Projekten.",
      technical: "US-Größen haben Buchstaben (G/6 = 4 mm, H/8 = 5 mm), UK nutzt alte Nummern. Stahlhäkelnadeln (< 2 mm) für Spitze und Garn der Stärke Lace. Baumwolle hat kaum Dehnung – Maschen wirken klar, aber die Hand ermüdet schneller." } },
    { t: "html", html: `<div class="grid g2"><div class="tip"><span>✏️</span><span><b>Stifthaltung</b>: Nadel wie einen Stift halten – präzise, gut für feine Arbeiten.</span></div><div class="tip"><span>🔪</span><span><b>Messerhaltung</b>: Nadel von oben wie ein Messer – kraftvoll, gut für dicke Garne.</span></div><div class="tip"><span>☝️</span><span>Der <b>Arbeitsfaden</b> läuft über den linken Zeigefinger, Mittelfinger und Daumen halten die Arbeit.</span></div><div class="tip"><span>🎯</span><span>Gleichmäßige Spannung kommt von der <b>linken Hand</b> – nicht vom Ziehen mit der Nadel.</span></div></div>` },
    { t: "check", q: "Warum häkelt man Amigurumi mit einer dünneren Nadel als empfohlen?", opts: ["Weil es schneller geht", "Damit das Gehäkelte dicht ist und keine Füllwatte durchschaut", "Weil dickere Nadeln brechen", "Aus Tradition"], a: 1, why: "Feste, dichte Maschen halten die Form und verstecken die Füllung." }
  ]}
 ]},
 { id: "crw2", n: 2, title: "Grundmaschen", sub: "Luftmasche bis Stäbchen", boss: { id: "boss-crw2", title: "Grundmaschen-Boss", topics: ["cr-lm", "cr-km", "cr-fm", "cr-stb"] }, lessons: [
  { id: "cr2-1", title: "Luftmaschen", topic: "cr-lm", min: 10, xp: 30, blocks: [
    { t: "lead", html: "Die Luftmaschenkette ist der Anschlag beim Häkeln. Umschlag – durchziehen – fertig." },
    { t: "widget", w: "tech", id: "chain" },
    { t: "widget", w: "v3d", model: "chain", title: "Die Luftmaschenkette in 3D", note: "Von vorne sieht die Kette wie eine Reihe <b>liegender Vs</b> aus. Dreh sie um: Hinten läuft ein „Rückenbuckel“ – dort stechen manche für einen besonders schönen Rand ein." },
    { t: "tip", html: "Zählen: Die Schlinge auf der Nadel zählt <b>nicht</b> mit, auch nicht die Anfangsschlinge. Zähl nur die Vs." },
    { t: "check", q: "Zählt die Schlinge auf der Häkelnadel als Luftmasche?", opts: ["Ja", "Nein", "Nur am Anfang", "Nur bei Stäbchen"], a: 1, why: "Sie ist die aktive Schlinge, keine fertige Masche." }
  ]},
  { id: "cr2-2", title: "Kettmaschen", topic: "cr-km", min: 6, xp: 20, blocks: [
    { t: "lead", html: "Die flachste Masche: zum Schließen von Runden, Weiterwandern und für saubere Kanten." },
    { t: "widget", w: "tech", id: "slst" },
    { t: "check", q: "Wofür nutzt man Kettmaschen häufig?", opts: ["Um viel Höhe zu gewinnen", "Um Runden zu schließen", "Als Zunahme", "Für Lochmuster"], a: 1, why: "Kettmaschen haben fast keine Höhe." }
  ]},
  { id: "cr2-3", title: "Feste Maschen", topic: "cr-fm", min: 12, xp: 35, blocks: [
    { t: "lead", html: "Die feste Masche (US: single crochet) ist die wichtigste Masche – dicht, stabil, die Basis für Amigurumi." },
    { t: "widget", w: "tech", id: "sc" },
    { t: "widget", w: "v3d", model: "sc", title: "Feste Maschen in 3D", note: "Oben auf jeder Masche liegt ein <b>V</b> aus zwei Maschengliedern – genau dort stichst du in der nächsten Reihe ein. Dreh das Modell, um vorderes und hinteres Glied zu sehen." },
    { t: "warnbox", html: "<b>Achtung Sprachverwirrung:</b> Die deutsche „feste Masche“ heißt im US-Englischen <b>single crochet (sc)</b>, im UK-Englischen aber <b>double crochet (dc)</b>!" },
    { t: "check", q: "Wie viele Schlingen liegen bei der festen Masche vor dem letzten Durchziehen auf der Nadel?", opts: ["1", "2", "3", "4"], a: 1, why: "Nach dem Hochholen liegen 2 Schlingen auf der Nadel; der Umschlag wird durch beide gezogen." }
  ]},
  { id: "cr2-4", title: "Halbe Stäbchen & Stäbchen", topic: "cr-stb", min: 14, xp: 40, blocks: [
    { t: "lead", html: "Mit jedem zusätzlichen Umschlag wird die Masche höher: feste Masche → halbes Stäbchen → Stäbchen → Doppelstäbchen." },
    { t: "widget", w: "tech", id: "hdc" },
    { t: "widget", w: "tech", id: "dc" },
    { t: "widget", w: "v3d", model: "heights", title: "Höhenvergleich", note: "Unten feste Maschen, dann halbe Stäbchen, oben Stäbchen. Stäbchen haben in der Mitte eine schräge „Taille“ – das ist der Umschlag vom Anfang." },
    { t: "html", html: `<div class="table-wrap"><table class="dt"><thead><tr><th>Masche (DE)</th><th>US</th><th>UK</th><th>Umschläge vorher</th><th>Höhe</th></tr></thead><tbody>
      <tr><td>Feste Masche</td><td>sc</td><td>dc</td><td>0</td><td>1</td></tr><tr><td>Halbes Stäbchen</td><td>hdc</td><td>htr</td><td>1</td><td>≈ 1,5</td></tr>
      <tr><td>Stäbchen</td><td>dc</td><td>tr</td><td>1</td><td>2</td></tr><tr><td>Doppelstäbchen</td><td>tr</td><td>dtr</td><td>2</td><td>3</td></tr></tbody></table></div>` },
    { t: "check", q: "Beim Stäbchen zieht man den Umschlag …", opts: ["durch alle 3 Schlingen", "zweimal durch je 2 Schlingen", "nur durch 1 Schlinge", "durch die Masche und die Schlinge zugleich"], a: 1, why: "„Zwei und zwei“ – so erkennst du das Stäbchen." },
    { t: "check", q: "Welche Masche zieht den Umschlag am Ende durch 3 Schlingen?", opts: ["Feste Masche", "Halbes Stäbchen", "Stäbchen", "Kettmasche"], a: 1, why: "Halbes Stäbchen: 3 Schlingen, ein Durchziehen." }
  ]}
 ]},
 { id: "crw3", n: 3, title: "Reihen & Runden", sub: "Wenden, zählen, Kreise", boss: null, lessons: [
  { id: "cr3-1", title: "Reihen & Wendeluftmaschen", topic: "cr-reihe", min: 10, xp: 30, blocks: [
    { t: "lead", html: "Am Reihenende brauchst du Höhe für die nächste Reihe: die Wendeluftmaschen." },
    { t: "html", html: `<div class="table-wrap"><table class="dt"><thead><tr><th>Reihe aus …</th><th>Wendeluftmaschen</th><th>zählt als Masche?</th></tr></thead><tbody><tr><td>festen Maschen</td><td>1</td><td>nein</td></tr><tr><td>halben Stäbchen</td><td>2</td><td>meist nein</td></tr><tr><td>Stäbchen</td><td>3</td><td>meist ja</td></tr></tbody></table></div>` },
    { t: "warnbox", html: "<b>Schiefe Ränder</b> kommen fast immer von verlorenen oder zusätzlichen Maschen am Anfang/Ende der Reihe. Setz einen Maschenmarkierer in die erste und letzte Masche jeder Reihe." },
    { t: "check", q: "Wie viele Wendeluftmaschen brauchst du vor einer Reihe Stäbchen?", opts: ["1", "2", "3", "5"], a: 2, why: "3 Luftmaschen entsprechen etwa der Höhe eines Stäbchens." }
  ]},
  { id: "cr3-2", title: "Runden & Magic Ring", topic: "cr-runde", min: 12, xp: 35, blocks: [
    { t: "lead", html: "Kreise, Mützen, Amigurumi: Du häkelst in Runden, meist ab einem Fadenring (Magic Ring), der sich ganz zuziehen lässt." },
    { t: "html", html: `<ol class="col" style="gap:8px;padding-left:20px;margin:0"><li>Faden zweimal locker um zwei Finger wickeln (Ring), Kreuzung mit dem Daumen festhalten.</li><li>Mit der Nadel unter dem Ring durch, Arbeitsfaden holen und durchziehen.</li><li>1 Luftmasche zum Fixieren (zählt nicht).</li><li>6 feste Maschen <b>in den Ring</b> häkeln – also um beide Ringfäden herum.</li><li>Am Fadenende ziehen: der Ring schließt sich zu einem Kreis ohne Loch.</li></ol>` },
    { t: "widget", w: "video", q: "Magic Ring häkeln Fadenring" },
    { t: "text", h: "Flacher Kreis: die 6er-Regel", levels: {
      simple: "Runde 1: 6 Maschen. Danach in jeder Runde 6 Maschen mehr: 12, 18, 24 …",
      normal: "Runde 2: jede Masche verdoppeln (12). Runde 3: *1 fM, 1 Zunahme* (18). Runde 4: *2 fM, 1 Zunahme* (24). In Runde n: *(n−2) fM, 1 Zunahme* ×6. So bleibt der Kreis flach. Zunahmen versetzt anordnen, sonst wird ein Sechseck daraus.",
      technical: "Der Umfang wächst pro Runde um 2π·(Maschenhöhe). Bei fM (Höhe ≈ Breite) sind das ≈ 6 Maschen, bei Stäbchen (Höhe ≈ 2× Breite) 12 pro Runde. Mehr → Wellen (Rüschen), weniger → Schüssel (Amigurumi)." } },
    { t: "widget", w: "amiplan" },
    { t: "check", q: "Flacher Kreis aus festen Maschen: Wie viele Maschen hat Runde 5?", opts: ["24", "30", "36", "18"], a: 1, why: "6 · 5 = 30." }
  ]}
 ]},
 { id: "crw4", n: 4, title: "Formen & Amigurumi", sub: "Zu- und Abnahmen, Kugeln", boss: { id: "boss-crw4", title: "Amigurumi-Boss", topics: ["cr-form", "cr-ami", "cr-runde"] }, lessons: [
  { id: "cr4-1", title: "Zunehmen & Abnehmen", topic: "cr-form", min: 10, xp: 30, blocks: [
    { t: "lead", html: "Zunahme: 2 Maschen in eine Masche. Abnahme: 2 Maschen zusammen abmaschen." },
    { t: "text", h: "So geht's", levels: {
      simple: "Zunahme (inc): in dieselbe Masche zweimal häkeln. Abnahme (dec): zweimal einstechen und hochholen, dann durch alle Schlingen ziehen.",
      normal: "<b>Abnahme fM</b> (sc2tog): in die 1. Masche einstechen, Schlinge holen (2 Schlingen), in die 2. Masche einstechen, Schlinge holen (3 Schlingen), Umschlag, durch alle 3. <b>Unsichtbare Abnahme</b> (Amigurumi): nur in die <b>vorderen Glieder</b> zweier Maschen einstechen, dann wie eine feste Masche beenden – kaum sichtbar.",
      technical: "Bei Stäbchen-Abnahmen (dc2tog) jedes Stäbchen nur bis zum letzten Schritt häkeln und dann alle Schlingen gemeinsam abmaschen. Symmetrisch arbeiten: Zunahmen pro Runde versetzen, damit keine Kanten entstehen." } },
    { t: "check", q: "Was ist die „unsichtbare Abnahme“?", opts: ["Man lässt eine Masche aus", "Man sticht nur in die vorderen Glieder zweier Maschen und maschet gemeinsam ab", "Man häkelt Kettmaschen", "Man zieht fester"], a: 1, why: "Sie hinterlässt kaum eine Lücke – perfekt für Amigurumi." }
  ]},
  { id: "cr4-2", title: "Die Amigurumi-Kugel", topic: "cr-ami", min: 12, xp: 35, blocks: [
    { t: "lead", html: "Fast jede Amigurumi-Figur beginnt mit einer Kugel: Zunahmen bis zur Mitte, gerade Runden, dann Abnahmen." },
    { t: "widget", w: "v3d", model: "ami", title: "Kugel aus Runden", note: "Jede Farbe ist eine Runde. Unten 6 Maschen, dann +6 pro Runde, gerade Runden in der Mitte, oben wieder −6. Tippe auf „Aufbauen“, um die Runden nacheinander zu sehen." },
    { t: "html", html: `<div class="codeq">R1: 6 fM in den Magic Ring (6)\nR2: 6× inc (12)\nR3: *1 fM, inc* ×6 (18)\nR4: *2 fM, inc* ×6 (24)\nR5–R8: 24 fM (24)\nR9: *2 fM, dec* ×6 (18)   → jetzt füllen\nR10: *1 fM, dec* ×6 (12)\nR11: 6× dec (6), Faden durch die vorderen Glieder ziehen und zuziehen</div>` },
    { t: "tip", html: "<b>Spiralrunden</b> (ohne Kettmasche schließen) sehen glatter aus – markiere die erste Masche jeder Runde mit einem Maschenmarkierer, sonst verzählst du dich garantiert." },
    { t: "check", q: "Warum füllt man die Kugel schon bei Runde 9/10 und nicht erst am Ende?", opts: ["Weil es Glück bringt", "Weil die Öffnung danach zu klein zum Füllen wird", "Weil Füllwatte sonst verrutscht", "Das ist egal"], a: 1, why: "Nach den letzten Abnahmen passt keine Watte mehr durch." }
  ]}
 ]},
 { id: "crw5", n: 5, title: "Anleitungen lesen", sub: "US vs. UK, Häkelschrift", boss: null, lessons: [
  { id: "cr5-1", title: "US- und UK-Begriffe", topic: "cr-usuk", min: 8, xp: 25, blocks: [
    { t: "lead", html: "Die größte Falle beim Häkeln: Gleiche Wörter, andere Maschen. Prüfe immer, ob eine Anleitung US oder UK ist." },
    { t: "widget", w: "abbr", craft: "crochet" },
    { t: "tip", html: "<b>Schnelltest:</b> Kommt in der Anleitung „sc“ vor, ist sie US – im UK-System gibt es keine „single crochet“." },
    { t: "widget", w: "pairs", topic: "cr-usuk", title: "US → Deutsch", pairs: [["ch", "Luftmasche"], ["sl st", "Kettmasche"], ["sc", "feste Masche"], ["hdc", "halbes Stäbchen"], ["dc", "Stäbchen"], ["tr", "Doppelstäbchen"]] },
    { t: "check", q: "Eine britische Anleitung sagt „dc“. Was häkelst du?", opts: ["Stäbchen", "Feste Masche", "Doppelstäbchen", "Luftmasche"], a: 1, why: "UK double crochet = US single crochet = feste Masche." }
  ]},
  { id: "cr5-2", title: "Häkelschrift & Granny Square", topic: "cr-schrift", min: 10, xp: 30, blocks: [
    { t: "lead", html: "Häkelschrift zeigt jede Masche als Symbol – international lesbar, egal ob US, UK oder Deutsch." },
    { t: "html", html: `<div class="table-wrap"><table class="dt"><tbody><tr><td style="font-size:22px;text-align:center">○</td><td>Luftmasche</td><td style="font-size:22px;text-align:center">•</td><td>Kettmasche</td></tr><tr><td style="font-size:22px;text-align:center">✕ / +</td><td>feste Masche</td><td style="font-size:22px;text-align:center">T</td><td>halbes Stäbchen</td></tr><tr><td style="font-size:22px;text-align:center">ŧ</td><td>Stäbchen (ein Querstrich)</td><td style="font-size:22px;text-align:center">‡</td><td>Doppelstäbchen (zwei Querstriche)</td></tr></tbody></table></div><small class="muted">Die Anzahl der Querstriche = Anzahl der Umschläge vor dem Einstechen.</small>` },
    { t: "text", h: "Granny Square – der Klassiker", levels: {
      simple: "In der Mitte ein Ring. Rundherum Gruppen aus 3 Stäbchen, an den Ecken durch Luftmaschen getrennt.",
      normal: "R1: 4 Lm, zum Ring schließen. 3 Lm (= 1. Stb), 2 Stb in den Ring, *2 Lm, 3 Stb* 3× wiederholen, 2 Lm, mit Km schließen → 4 Gruppen, 4 Ecken. R2: In jede Ecke *3 Stb, 2 Lm, 3 Stb*. Ab R3 zusätzlich 3 Stb in jede Lücke an den Seiten.",
      technical: "Farbwechsel am besten in einer Ecke. Wenn das Quadrat sich wellt: Ecken-Luftmaschen reduzieren (2 → 1). Wölbt es sich: zu fest gehäkelt oder zu wenige Lm in den Ecken." } },
    { t: "check", q: "Wie viele Querstriche hat das Symbol für ein Doppelstäbchen?", opts: ["0", "1", "2", "3"], a: 2, why: "Zwei Umschläge → zwei Querstriche." }
  ]}
 ]},
 { id: "crw6", n: 6, title: "Tricks & Fehler", sub: "Wie die Profis", boss: null, lessons: [
  { id: "cr6-1", title: "Die besten Tricks", topic: "cr-tricks", min: 10, xp: 30, blocks: [
    { t: "lead", html: "Kleine Tricks mit großer Wirkung – für Kanten, Farbwechsel und weniger Vernähen." },
    { t: "html", html: `<div class="col" style="gap:10px">
      <div class="tip"><span>🎨</span><span><b>Sauberer Farbwechsel:</b> Die letzte Masche der alten Farbe bis zum letzten Durchziehen häkeln – dann mit der <i>neuen</i> Farbe durchziehen.</span></div>
      <div class="tip"><span>🧵</span><span><b>Fäden einhäkeln:</b> Das Fadenende auf die Maschenköpfe legen und die nächsten Maschen darum herum häkeln – spart das Vernähen.</span></div>
      <div class="tip"><span>📐</span><span><b>Gerade Kanten:</b> Markierer in die letzte Masche jeder Reihe – dann triffst du sie in der nächsten Reihe sicher.</span></div>
      <div class="tip"><span>🪢</span><span><b>Nur hinteres Glied</b> (BLO) häkeln → Rippenstruktur. <b>Nur vorderes Glied</b> (FLO) → Kante zum späteren Anhäkeln.</span></div>
      <div class="tip"><span>🧊</span><span><b>Gleichmäßige Maschen:</b> Die Schlinge auf dem dicken Teil der Nadel (nicht im Hals) bilden – dann ist jede Masche gleich groß.</span></div>
      <div class="warnbox"><span>⚠️</span><span><b>Gehäkeltes wird zu fest/verzogen?</b> Nadel eine Stärke dicker oder Arbeitsfaden lockerer über den Finger laufen lassen.</span></div></div>` },
    { t: "check", q: "Womit wechselst du die Farbe am saubersten?", opts: ["Faden abschneiden und neu verknoten", "Letzten Umschlag der Masche bereits mit der neuen Farbe durchziehen", "Mitten in der Reihe", "Mit einer Kettmasche"], a: 1, why: "So beginnt die neue Masche schon ganz in der neuen Farbe." }
  ]}
 ]}
];
const QUESTIONS = [
 { id: "crq1", topic: "cr-lm", q: "Wie beginnt fast jedes Häkelstück in Reihen?", opts: ["Mit einer Luftmaschenkette", "Mit Stäbchen", "Mit Kettmaschen", "Mit Abketten"], a: 0, why: "Die Luftmaschenkette ist der Anschlag." },
 { id: "crq2", topic: "cr-km", q: "Die Kettmasche ist …", opts: ["die höchste Masche", "die flachste Masche", "eine Zunahme", "nur für Amigurumi"], a: 1, why: "Sie hat fast keine Höhe." },
 { id: "crq3", topic: "cr-fm", q: "Feste Masche heißt in US-Anleitungen …", opts: ["dc", "sc", "hdc", "tr"], a: 1, why: "single crochet." },
 { id: "crq4", topic: "cr-fm", q: "Nach dem Einstechen und Durchholen liegen bei der fM wie viele Schlingen auf der Nadel?", opts: ["1", "2", "3", "4"], a: 1, why: "2 – dann Umschlag durch beide." },
 { id: "crq5", topic: "cr-stb", q: "Welche Masche beginnt mit einem Umschlag?", opts: ["Feste Masche", "Kettmasche", "Stäbchen", "Luftmasche"], a: 2, why: "Stäbchen und halbe Stäbchen beginnen mit Umschlag." },
 { id: "crq6", topic: "cr-stb", q: "Wie hoch ist ein Stäbchen im Vergleich zur festen Masche?", opts: ["gleich", "ca. doppelt", "halb", "dreimal"], a: 1, why: "Etwa zwei feste Maschen hoch." },
 { id: "crq7", topic: "cr-reihe", q: "Wendeluftmaschen vor einer Reihe fester Maschen:", opts: ["1", "2", "3", "4"], a: 0, why: "Eine Luftmasche reicht für die Höhe einer fM." },
 { id: "crq8", topic: "cr-reihe", q: "Deine Reihen werden immer breiter. Warum?", opts: ["Zu dünne Nadel", "In die Wendeluftmasche oder doppelt in die erste Masche gehäkelt", "Falsche Farbe", "Zu wenig Garn"], a: 1, why: "Zusätzliche Maschen an den Rändern lassen das Stück wachsen." },
 { id: "crq9", topic: "cr-runde", q: "Was ist der Vorteil eines Magic Rings?", opts: ["Er ist bunter", "Er lässt sich ganz zuziehen – kein Loch in der Mitte", "Er braucht keine Nadel", "Er ist schneller"], a: 1, why: "Ideal für Amigurumi und Mützenspitzen." },
 { id: "crq10", topic: "cr-runde", q: "Flacher Kreis aus fM: Runde 3 hat …", opts: ["12", "18", "24", "6"], a: 1, why: "6 · 3 = 18." },
 { id: "crq11", topic: "cr-form", q: "„inc“ bedeutet …", opts: ["2 Maschen in eine Masche", "2 Maschen zusammen", "Faden abschneiden", "Luftmasche"], a: 0, why: "increase = Zunahme." },
 { id: "crq12", topic: "cr-form", q: "„sc2tog“ bedeutet …", opts: ["2 fM in 1", "2 fM zusammen abmaschen", "2 Luftmaschen", "2 Reihen"], a: 1, why: "Abnahme mit festen Maschen." },
 { id: "crq13", topic: "cr-ami", q: "Warum häkelt man Amigurumi meist in Spiralrunden?", opts: ["Weil es glatter aussieht (keine Naht)", "Weil es bunter wird", "Weil es größer wird", "Das macht man nicht"], a: 0, why: "Kein sichtbarer Rundenübergang – dafür Markierer setzen." },
 { id: "crq14", topic: "cr-usuk", q: "UK „treble (tr)“ entspricht …", opts: ["fester Masche", "Stäbchen", "Luftmasche", "halbem Stäbchen"], a: 1, why: "UK tr = US dc = Stäbchen." },
 { id: "crq15", topic: "cr-schrift", q: "Das Symbol ○ steht für …", opts: ["Luftmasche", "Kettmasche", "feste Masche", "Stäbchen"], a: 0, why: "Kreis/Oval = Luftmasche." },
 { id: "crq16", topic: "cr-schrift", q: "Ein Granny Square hat in Runde 1 …", opts: ["4 Gruppen aus je 3 Stäbchen", "6 feste Maschen", "8 Luftmaschen", "12 Stäbchen ohne Ecken"], a: 0, why: "4 Gruppen = 4 Seiten, getrennt durch Eck-Luftmaschen." },
 { id: "crq17", topic: "cr-tricks", q: "Nur ins hintere Glied häkeln ergibt …", opts: ["eine Rippenstruktur", "ein Loch", "eine Abnahme", "nichts Sichtbares"], a: 0, why: "Das vordere Glied bleibt als Linie stehen." },
 { id: "crq18", topic: "cr-mat", q: "Welche Nadelhaltung ist richtig?", opts: ["Nur Stifthaltung", "Nur Messerhaltung", "Beide", "Keine"], a: 2, why: "Beide sind korrekt – wähle, was bequemer ist." }
];
const BOSS_EXTRA = [
 { id: "crb1", topic: "cr-stb", q: "Du hast 3 Schlingen auf der Nadel und ziehst den Umschlag durch alle 3. Welche Masche war das?", opts: ["Feste Masche", "Halbes Stäbchen", "Stäbchen", "Kettmasche"], a: 1, why: "Das halbe Stäbchen endet mit „durch alle drei“." },
 { id: "crb2", topic: "cr-ami", q: "Deine Kugel wird oben spitz statt rund. Mögliche Ursache?", opts: ["Abnahmen immer an derselben Stelle gestapelt", "Zu weiche Füllung", "Zu dicke Nadel", "Falsche Farbe"], a: 0, why: "Versetze Zu- und Abnahmen, sonst entstehen Kanten und Spitzen." },
 { id: "crb3", topic: "cr-usuk", q: "In einer Anleitung stehen „sc“ und „dc“. Ist sie US oder UK?", opts: ["US", "UK", "Beides möglich", "Deutsch"], a: 0, why: "„sc“ gibt es nur im US-System." }
];
const FLASHCARDS = [
 { id: "crf1", cat: "Maschen", topic: "cr-lm", front: "Luftmasche (ch)", back: "Umschlag, durch die Schlinge auf der Nadel ziehen." },
 { id: "crf2", cat: "Maschen", topic: "cr-km", front: "Kettmasche (sl st)", back: "Einstechen, Umschlag, durch Masche UND Schlinge in einem Zug." },
 { id: "crf3", cat: "Maschen", topic: "cr-fm", front: "Feste Masche (US sc / UK dc)", back: "Einstechen, Umschlag, durchholen (2 Schl.), Umschlag, durch beide." },
 { id: "crf4", cat: "Maschen", topic: "cr-stb", front: "Halbes Stäbchen (US hdc / UK htr)", back: "Umschlag, einstechen, durchholen (3 Schl.), Umschlag, durch alle 3." },
 { id: "crf5", cat: "Maschen", topic: "cr-stb", front: "Stäbchen (US dc / UK tr)", back: "Umschlag, einstechen, durchholen (3), 2× „Umschlag, durch 2“." },
 { id: "crf6", cat: "Reihen", topic: "cr-reihe", front: "Wendeluftmaschen", back: "fM: 1 · hStb: 2 · Stb: 3 (zählt meist als Masche)." },
 { id: "crf7", cat: "Runden", topic: "cr-runde", front: "Flacher Kreis (fM)", back: "6 · 12 · 18 · 24 … Runde n: *(n−2) fM, 1 Zunahme* ×6." },
 { id: "crf8", cat: "Runden", topic: "cr-runde", front: "Magic Ring", back: "Fadenring, darin Maschen häkeln, am Ende zuziehen – kein Loch." },
 { id: "crf9", cat: "Form", topic: "cr-form", front: "inc · dec · sc2tog", back: "Zunahme (2 in 1) · Abnahme · 2 fM zusammen abmaschen." },
 { id: "crf10", cat: "Form", topic: "cr-form", front: "Unsichtbare Abnahme", back: "Nur in die vorderen Glieder von 2 Maschen einstechen, dann wie fM beenden." },
 { id: "crf11", cat: "Anleitung", topic: "cr-usuk", front: "US sc = UK ?", back: "UK dc (feste Masche). Alles verschiebt sich um eine Stufe!" },
 { id: "crf12", cat: "Anleitung", topic: "cr-schrift", front: "Symbole ○ • ✕ T ŧ", back: "Luftmasche · Kettmasche · feste Masche · halbes Stäbchen · Stäbchen." },
 { id: "crf13", cat: "Tricks", topic: "cr-tricks", front: "BLO / FLO", back: "Back loop only / front loop only – nur ins hintere / vordere Glied häkeln." },
 { id: "crf14", cat: "Tricks", topic: "cr-tricks", front: "Farbwechsel", back: "Letzten Umschlag der Masche schon mit der neuen Farbe durchziehen." }
];
window.COURSE_DEFS = window.COURSE_DEFS || [];
window.COURSE_DEFS.push({
  id: "crochet", track: "craft", lang: "de", name: "Häkeln lernen", short: "HÄKELN", title: "Häkeln", semester: null, ects: null, color: "#8A5A7E", icon: "❀", status: "active",
  lecturers: "Eigenes Lernmaterial · mit 3D-Modellen & Animationen",
  description: "Luftmasche, feste Masche, Stäbchen, Runden, Amigurumi und Granny Squares – mit US/UK-Übersetzer.",
  topics: TOPICS, worlds: WORLDS, questions: QUESTIONS, bossExtra: BOSS_EXTRA, flashcards: FLASHCARDS,
  resources: { sections: [
    { title: "Videos (YouTube-Suche)", items: [
      { title: "Magic Ring", url: "https://www.youtube.com/results?search_query=Magic+Ring+h%C3%A4keln", note: "Suche auf YouTube" },
      { title: "Feste Masche & Stäbchen", url: "https://www.youtube.com/results?search_query=feste+Masche+St%C3%A4bchen+h%C3%A4keln+lernen", note: "Suche auf YouTube" },
      { title: "Granny Square", url: "https://www.youtube.com/results?search_query=Granny+Square+h%C3%A4keln+Anf%C3%A4nger", note: "Suche auf YouTube" },
      { title: "Unsichtbare Abnahme Amigurumi", url: "https://www.youtube.com/results?search_query=unsichtbare+Abnahme+Amigurumi", note: "Suche auf YouTube" }] },
    { title: "Anleitungen & Wissen", items: [
      { title: "Ravelry – Häkelanleitungen", url: "https://www.ravelry.com", note: "Filter „Crochet“, viele kostenlose Muster" },
      { title: "Craft Yarn Council – Häkelsymbole & Abkürzungen", url: "https://www.craftyarncouncil.com/standards", note: "Offizielle US-Standards" }] }
  ] },
  events: [], tasks: []
});
})();
