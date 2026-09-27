/* Sammler-Guide – kleines Nachschlagewerk für das Sammlungs-Profil (Track "tcg"). */
(function () {
const TOPICS = {
  "tg-zust": { name: "Kartenzustand", lesson: "tg1-1" },
  "tg-selt": { name: "Seltenheiten & Varianten", lesson: "tg1-2" },
  "tg-sealed": { name: "Sealed-Produkte", lesson: "tg1-3" },
  "tg-preis": { name: "Preise verstehen", lesson: "tg2-1" },
  "tg-echt": { name: "Fälschungen erkennen", lesson: "tg2-2" },
  "tg-lager": { name: "Aufbewahrung", lesson: "tg2-3" }
};
const WORLDS = [
 { id: "tgw1", n: 1, title: "Grundlagen", sub: "Zustand, Seltenheit, Produkte", boss: null, lessons: [
  { id: "tg1-1", title: "Kartenzustand wie auf Cardmarket", topic: "tg-zust", min: 5, xp: 0, blocks: [
    { t: "lead", html: "Der Zustand entscheidet oft mehr über den Preis als die Karte selbst. Cardmarket nutzt sieben Stufen." },
    { t: "html", html: `<div class="table-wrap"><table class="dt"><thead><tr><th>Kürzel</th><th>Zustand</th><th>Bedeutet</th></tr></thead><tbody>
      <tr><td><b>MT</b></td><td>Mint</td><td>Perfekt, direkt aus der Packung, kein Makel.</td></tr>
      <tr><td><b>NM</b></td><td>Near Mint</td><td>Wie neu, höchstens winzige Spuren bei genauem Hinsehen.</td></tr>
      <tr><td><b>EX</b></td><td>Excellent</td><td>Leichte Kantenweiße oder kleine Kratzer.</td></tr>
      <tr><td><b>GD</b></td><td>Good</td><td>Deutliche Gebrauchsspuren, aber keine Knicke.</td></tr>
      <tr><td><b>LP</b></td><td>Light Played</td><td>Sichtbar bespielt, kleine Knicke möglich.</td></tr>
      <tr><td><b>PL</b></td><td>Played</td><td>Stark bespielt, Knicke, Abrieb.</td></tr>
      <tr><td><b>PO</b></td><td>Poor</td><td>Beschädigt (Risse, Wasser, Stifte).</td></tr></tbody></table></div>` },
    { t: "callout", html: "Die Preise in dieser App sind die <b>Cardmarket-Trendpreise</b>. Sie beziehen sich überwiegend auf Karten in sehr gutem Zustand (NM). Für schlechtere Zustände liegt der echte Verkaufspreis meist deutlich darunter." },
    { t: "check", q: "Eine Karte hat leicht weiße Kanten, sonst keine Makel. Welcher Zustand passt am ehesten?", opts: ["Mint", "Excellent", "Played", "Poor"], a: 1, why: "Leichte Kantenweiße ist typisch für Excellent." }
  ]},
  { id: "tg1-2", title: "Seltenheiten & Varianten", topic: "tg-selt", min: 6, xp: 0, blocks: [
    { t: "lead", html: "Unten links oder rechts auf der Karte steht die Nummer und ein Seltenheitssymbol. Dazu kommen Varianten wie Holo oder Reverse Holo." },
    { t: "html", html: `<div class="table-wrap"><table class="dt"><thead><tr><th>Symbol / Name</th><th>Bedeutung</th></tr></thead><tbody>
      <tr><td>● Common · ◆ Uncommon · ★ Rare</td><td>Häufig · Nicht so häufig · Selten</td></tr>
      <tr><td>Holo Rare</td><td>Bild glänzt (holografisch)</td></tr>
      <tr><td>Double Rare (ex, V)</td><td>Starke Karten, oft mit Regelbox</td></tr>
      <tr><td>Illustration Rare</td><td>Vollbild-Illustration, Nummer über der Setgröße</td></tr>
      <tr><td>Special Illustration Rare</td><td>Die gesuchtesten Vollbildkarten – meist die teuersten eines Sets</td></tr>
      <tr><td>Hyper / Gold Rare</td><td>Goldene Karten</td></tr></tbody></table></div>` },
    { t: "text", h: "Normal, Holo, Reverse Holo", levels: { simple: "Reverse Holo: Nicht das Bild, sondern der Rest der Karte glänzt. Es ist dieselbe Karte, aber eine eigene Variante mit eigenem Preis.", normal: "Bei vielen Karten gibt es eine normale und eine <b>Reverse-Holo</b>-Version. Cardmarket führt beide unter demselben Produkt, aber mit getrennten Preisen – die App zeigt dir beide. Dazu kommen Sondervarianten wie <b>1. Edition</b>, <b>Shadowless</b> (Base Set), Stempel-Promos oder Cosmos-Holo.", technical: "Die Nummer „199/165“ bedeutet: Karte 199, das Set hat offiziell 165 Karten. Alles über der offiziellen Zahl ist eine „Secret Rare“. Sondervarianten werden auf Cardmarket teils als eigene Produkte geführt." } },
    { t: "check", q: "Was ist bei einer Reverse-Holo-Karte glänzend?", opts: ["Nur das Bild", "Alles außer dem Bild", "Nur der Name", "Die Rückseite"], a: 1, why: "Reverse = umgekehrt: der Rahmen/Hintergrund glänzt, das Bild nicht." }
  ]},
  { id: "tg1-3", title: "Sealed-Produkte erklärt", topic: "tg-sealed", min: 5, xp: 0, blocks: [
    { t: "lead", html: "„Sealed“ heißt originalverschweißt. Viele Sammler behalten Produkte bewusst ungeöffnet." },
    { t: "html", html: `<div class="table-wrap"><table class="dt"><thead><tr><th>Produkt</th><th>Inhalt (typisch)</th></tr></thead><tbody>
      <tr><td><b>Booster</b></td><td>1 Päckchen mit ca. 10 Karten</td></tr><tr><td><b>Display</b> (Booster Box)</td><td>36 Booster (neuere Sets), bei Spezialsets auch weniger</td></tr>
      <tr><td><b>Elite Trainer Box (ETB)</b></td><td>9–11 Booster, Hüllen, Würfel, Marker, Box zum Aufbewahren</td></tr><tr><td><b>Booster Bundle</b></td><td>6 Booster</td></tr>
      <tr><td><b>Blister</b></td><td>1–3 Booster mit Promo-Karte oder Münze</td></tr><tr><td><b>Tin</b></td><td>Metalldose mit Boostern und Promo</td></tr>
      <tr><td><b>Box Set / Kollektion</b></td><td>Z. B. Premium- oder Ultra-Premium-Kollektion mit Promos</td></tr></tbody></table></div>` },
    { t: "callout", html: "Auf Cardmarket unterscheidet sich der Preis eines Displays je nach <b>Sprache</b> stark (Japanisch, Englisch, Deutsch). Der Preisführer, den diese App nutzt, fasst alle Angebote zusammen – für den exakten Preis deiner Sprache lohnt der Blick auf die Cardmarket-Seite (Knopf „Auf Cardmarket ansehen“)." },
    { t: "check", q: "Wie viele Booster hat ein aktuelles Standard-Display?", opts: ["6", "10", "36", "100"], a: 2, why: "Standard-Displays neuerer Sets enthalten 36 Booster." }
  ]}
 ]},
 { id: "tgw2", n: 2, title: "Werte & Pflege", sub: "Preise, Echtheit, Lagerung", boss: null, lessons: [
  { id: "tg2-1", title: "Cardmarket-Preise verstehen", topic: "tg-preis", min: 5, xp: 0, blocks: [
    { t: "lead", html: "Die App zeigt die Werte aus dem offiziellen Cardmarket-Preisführer. So liest du sie:" },
    { t: "html", html: `<div class="table-wrap"><table class="dt"><tbody>
      <tr><td><b>Trendpreis</b></td><td>Gleitender Wert aus den letzten Verkäufen – der beste Richtwert für „Was ist sie wert?“. Die App rechnet damit.</td></tr>
      <tr><td><b>Ab-Preis</b></td><td>Das günstigste aktuelle Angebot.</td></tr>
      <tr><td><b>Durchschnitt</b></td><td>Durchschnittlicher Verkaufspreis.</td></tr>
      <tr><td><b>1-/7-/30-Tage-Ø</b></td><td>Durchschnitte über die letzten Tage – zeigt, ob der Preis steigt oder fällt.</td></tr></tbody></table></div>` },
    { t: "tip", html: "Cardmarket veröffentlicht den Preisführer einmal täglich. Die App holt ihn sich automatisch zweimal am Tag – du musst nichts tun." },
    { t: "check", q: "Mit welchem Wert rechnet der Portfolio-Gesamtwert?", opts: ["Ab-Preis", "Trendpreis", "Höchstpreis", "Einkaufspreis"], a: 1, why: "Der Trendpreis ist der stabilste Richtwert." }
  ]},
  { id: "tg2-2", title: "Fälschungen erkennen", topic: "tg-echt", min: 6, xp: 0, blocks: [
    { t: "lead", html: "Gefälschte Karten tauchen vor allem bei teuren Karten und günstigen „Mystery-Packs“ auf." },
    { t: "html", html: `<ol><li><b>Schrift & Farben:</b> Fälschungen haben oft falsche Schriftarten, blasse oder zu kräftige Farben.</li><li><b>Rückseite:</b> Das Blau ist bei Fälschungen oft zu hell oder zu violett.</li><li><b>Lichttest:</b> Eine Taschenlampe hinter die Karte halten – echte Karten lassen kaum Licht durch (schwarze Mittelschicht).</li><li><b>Oberfläche:</b> Neuere Vollbildkarten haben eine fühlbare Struktur. Glatte „Full Art“ ist verdächtig.</li><li><b>Preis:</b> Deutlich unter Marktwert? Finger weg – oder nur bei vertrauenswürdigen Händlern.</li></ol>` },
    { t: "check", q: "Was zeigt der Lichttest?", opts: ["Ob die Karte glänzt", "Ob die Karte eine dunkle Mittelschicht hat – echte lassen kaum Licht durch", "Das Druckjahr", "Den Preis"], a: 1, why: "Originalkarten haben eine lichtundurchlässige Schicht." }
  ]},
  { id: "tg2-3", title: "Richtig aufbewahren", topic: "tg-lager", min: 4, xp: 0, blocks: [
    { t: "lead", html: "Gute Lagerung erhält den Zustand – und damit den Wert." },
    { t: "html", html: `<ol><li><b>Penny Sleeve</b> (weiche Hülle) für jede wertvolle Karte.</li><li>Zusätzlich <b>Toploader</b> oder Magnethülle für Karten über ca. 20 €.</li><li><b>Ordner mit Seitenlade-Taschen</b> (Side-Loading) statt Ringordner – Ringe drücken Dellen.</li><li>Trocken, dunkel, nicht zu warm lagern. Keine Gummibänder!</li><li>Sealed-Produkte aufrecht, vor Sonne geschützt; ETBs nicht stapeln (Druckstellen).</li></ol>` },
    { t: "check", q: "Warum sind Ringordner schlecht für Karten?", opts: ["Sie sind zu teuer", "Die Ringe können Dellen in die Karten drücken", "Sie sind zu klein", "Sie sind nicht bunt"], a: 1, why: "Karten nahe den Ringen bekommen leicht Druckstellen." }
  ]}
 ]}
];
window.COURSE_DEFS = window.COURSE_DEFS || [];
window.COURSE_DEFS.push({ id: "tcgguide", track: "tcg", lang: "de", name: "Sammler-Guide", short: "GUIDE", title: "Sammler-Guide", color: "#F5C542", icon: "◆", status: "active",
  lecturers: "Nachschlagewerk", description: "Zustände, Seltenheiten, Sealed-Produkte, Preise, Echtheit und Lagerung.",
  topics: TOPICS, worlds: WORLDS, questions: [], bossExtra: [], flashcards: [], resources: { sections: [{ title: "Offizielle Seiten", items: [{ title: "Cardmarket – Pokémon", url: "https://www.cardmarket.com/de/Pokemon", note: "Marktplatz und Preise" }, { title: "TCGdex – Kartendatenbank", url: "https://www.tcgdex.dev", note: "Quelle der Kartendaten und Bilder in dieser App" }] }] }, events: [], tasks: [] });
})();
