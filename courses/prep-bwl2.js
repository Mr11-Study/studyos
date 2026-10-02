/* Prüfungsvorbereitung GL-BWL-2 – aus Altprüfungen (Moodle-Altprüfung „BWL“, 31 Fragen: MC, Richtig/Falsch, Dropdown-Zuordnungen, Rechenfragen zu Bilanz, Anlagenspiegel, Kapitalwert, Amortisation, Break-even) */
(function () {
const c = (window.COURSE_DEFS || []).find(x => x.id === "bwl2"); if (!c) return;

// ---------- wiederverwendete Tabellen aus der Altprüfung ----------
const FRISEUR = `<p><b>Bilanz einer kleinen GmbH (Friseurstudio, Villach), Werte in EUR</b></p>
<table class="dt"><tr><th>Aktiva</th><th>2004</th><th>Vorjahr</th></tr>
<tr><td>A.I Immaterielle Vermögensgegenstände</td><td>–</td><td>–</td></tr>
<tr><td>A.II Sachanlagen</td><td>256.627,78</td><td>70.478,14</td></tr>
<tr><td>A.III Finanzanlagen</td><td>25.033,13</td><td>22.277,01</td></tr>
<tr><td>B.I Vorräte</td><td>111.990,72</td><td>64.861,25</td></tr>
<tr><td>B.II Forderungen und sonstige Vermögensgegenstände</td><td>65.432,19</td><td>15.714,73</td></tr>
<tr><td>B.III Wertpapiere und Anteile</td><td>–</td><td>–</td></tr>
<tr><td>B.IV Kassenbestand, Guthaben bei Kreditinstituten</td><td>22.281,35</td><td>13.475,52</td></tr>
<tr><td>C. Rechnungsabgrenzungsposten</td><td>2.265,23</td><td>0,00</td></tr>
<tr><td><b>Summe Aktiva</b></td><td><b>483.630,40</b></td><td><b>186.806,65</b></td></tr></table>
<table class="dt"><tr><th>Passiva</th><th>2004</th><th>Vorjahr</th></tr>
<tr><td>A.I Nennkapital (Stammkapital)</td><td>36.336,42</td><td>36.336,42</td></tr>
<tr><td>A.II Kapitalrücklagen (ausstehende Einlage)</td><td>−18.168,21</td><td>−18.168,21</td></tr>
<tr><td>A.IV Bilanzgewinn (Bilanzverlust)</td><td>8.197,88</td><td>26.617,38</td></tr>
<tr><td>&nbsp;&nbsp;Gewinnvortrag/Verlustvortrag</td><td>−1.233,90</td><td>−27.851,28</td></tr>
<tr><td>B. Unversteuerte Rücklagen</td><td>23.574,71</td><td>23.574,71</td></tr>
<tr><td>C. Rückstellungen</td><td>33.468,51</td><td>11.285,26</td></tr>
<tr><td>D. Verbindlichkeiten</td><td>401.454,99</td><td>135.012,37</td></tr>
<tr><td>E. Rechnungsabgrenzungsposten</td><td>–</td><td>–</td></tr>
<tr><td><b>Summe Passiva</b></td><td><b>483.630,40</b></td><td><b>186.806,65</b></td></tr></table>`;

const VENTEC = `<p><b>(Vereinfachter) Anlagenspiegel der Ventec GmbH, Klagenfurt – Werte in TEUR</b></p>
<table class="dt"><tr><th>Position</th><th>AK/HK 1.1.</th><th>Zugänge</th><th>Abgänge</th><th>AK/HK 31.12.</th><th>kum. AfA 1.1.</th><th>AfA d. J.</th><th>Abgänge kum. AfA</th><th>kum. AfA 31.12.</th><th>BW 31.12.</th><th>BW 1.1.</th></tr>
<tr><td colspan="11"><b>I. Immaterielles Vermögen</b></td></tr>
<tr><td>Konzessionen …</td><td>4.000</td><td>–</td><td>–</td><td>4.000</td><td>2.000</td><td>500</td><td>–</td><td>2.500</td><td>1.500</td><td>2.000</td></tr>
<tr><td>Firmenwert</td><td>–</td><td>8.000</td><td>–</td><td>8.000</td><td>–</td><td>1.000</td><td>–</td><td>1.000</td><td>7.000</td><td>–</td></tr>
<tr><td><i>Summe</i></td><td>4.000</td><td>8.000</td><td>–</td><td>12.000</td><td>2.000</td><td>1.500</td><td>–</td><td>3.500</td><td>8.500</td><td>2.000</td></tr>
<tr><td colspan="11"><b>II. Sachanlagen</b> (Grundstücke)</td></tr>
<tr><td>davon Gebäude</td><td>8.000</td><td>–</td><td>–</td><td>8.000</td><td>5.000</td><td>320</td><td>–</td><td>5.320</td><td>2.680</td><td>3.000</td></tr>
<tr><td>davon Grund</td><td>4.000</td><td>–</td><td>3.000</td><td>1.000</td><td>–</td><td>–</td><td>–</td><td>–</td><td>1.000</td><td>4.000</td></tr>
<tr><td>Techn. Anlagen</td><td>15.000</td><td>4.000</td><td>1.500</td><td>17.500</td><td>4.800</td><td>2.000</td><td>300</td><td>6.500</td><td>11.000</td><td>10.000</td></tr>
<tr><td>Andere Anlagen</td><td>4.500</td><td>1.000</td><td>600</td><td>4.900</td><td>2.550</td><td>750</td><td>300</td><td>3.000</td><td>1.900</td><td>1.950</td></tr>
<tr><td><i>Summe</i></td><td>31.500</td><td>5.000</td><td>5.100</td><td>31.400</td><td>12.350</td><td>3.070</td><td>600</td><td>14.820</td><td>16.580</td><td>18.950</td></tr>
<tr><td colspan="11"><b>III. Finanzanlagen</b></td></tr>
<tr><td>Anteile an verb. U.</td><td>12.000</td><td>3.000</td><td>–</td><td>15.000</td><td>1.000</td><td>–</td><td>–</td><td>1.000</td><td>14.000</td><td>11.000</td></tr>
<tr><td>Wertpapiere des AV</td><td>8.000</td><td>–</td><td>2.000</td><td>6.000</td><td>1.100</td><td>200</td><td>200</td><td>1.100</td><td>4.900</td><td>7.100</td></tr>
<tr><td><i>Summe</i></td><td>20.000</td><td>3.000</td><td>2.000</td><td>21.000</td><td>2.100</td><td>200</td><td>200</td><td>2.100</td><td>18.900</td><td>18.100</td></tr>
<tr><td><b>Gesamt</b></td><td>55.500</td><td>16.000</td><td>7.100</td><td>64.400</td><td>16.450</td><td>4.770</td><td>800</td><td>20.420</td><td>43.980</td><td>39.050</td></tr></table>
<p><small>Umbuchungen und Zuschreibungen: jeweils keine.</small></p>`;

const GLASPETER = `<table class="dt"><tr><th>Schlussbilanz Glaspeter</th><th>20x5</th><th>20x6</th></tr>
<tr><td>EDV-Anlagen</td><td>12.000</td><td>10.500</td></tr>
<tr><td>Geschäftseinrichtung</td><td>15.000</td><td>12.000</td></tr>
<tr><td>Wertpapiere (AV)</td><td>3.000</td><td>3.000</td></tr>
<tr><td>Vorräte</td><td>26.000</td><td>24.600</td></tr>
<tr><td>Lieferforderungen</td><td>41.000</td><td>38.000</td></tr>
<tr><td>Kassa, Bankbestand</td><td>48.000</td><td>27.000</td></tr>
<tr><td><b>Summe Aktiva</b></td><td><b>145.000</b></td><td><b>115.100</b></td></tr>
<tr><td>Eigenkapital</td><td>98.000</td><td>82.600</td></tr>
<tr><td>Lieferverbindlichkeiten</td><td>32.000</td><td>18.500</td></tr>
<tr><td>sonst. Verbindlichkeiten</td><td>15.000</td><td>14.000</td></tr>
<tr><td><b>Summe Passiva</b></td><td><b>145.000</b></td><td><b>115.100</b></td></tr></table>`;

// ---------- neue Themen (in der Altprüfung gefragt, im Kurs bisher nicht abgedeckt) ----------
Object.assign(c.topics, {
  "bx-pflicht": { name: "Rechnungslegungspflicht (UGB), Rückstellungen & Rücklagen", lesson: "bx-1" },
  "bx-urg":     { name: "URG-Kennzahlen (Reorganisationsbedarf)", lesson: "bx-2" },
  "bx-afa":     { name: "Anschaffungskosten, AfA & Anlagenspiegel", lesson: "bx-3" }
});

c.worlds.push({ id: "bxw", n: (c.worlds.length + 1), title: "Prüfungstraining: Lücken aus der Altprüfung", sub: "Buchführungspflicht, URG, AfA & Anlagenspiegel", boss: null, lessons: [
  { id: "bx-1", title: "Doppelte Buchhaltung: wer muss? Rückstellung vs. Rücklage", topic: "bx-pflicht", min: 10, xp: 0, blocks: [
    { t: "lead", html: "Die Altprüfung fragt mit einer Umsatztabelle, wer im Jahr 20x7 doppelt buchführen muss – das entscheidet die <b>Rechtsform</b> und die <b>Umsatzgrenze nach § 189 UGB</b>." },
    { t: "text", h: "Rechnungslegungspflicht nach § 189 UGB", levels: {
      simple: "GmbH und AG müssen immer doppelt buchen. Alle anderen Unternehmer erst, wenn der Umsatz zweimal hintereinander über 700.000 € liegt (oder einmal über 1 Mio. €).",
      normal: "<ul><li><b>Kapitalgesellschaften</b> (GmbH, AG) und „verdeckte“ Kapitalgesellschaften (z. B. GmbH &amp; Co KG, kein unbeschränkt haftender natürlicher Gesellschafter): <b>immer</b> rechnungslegungspflichtig – unabhängig vom Umsatz.</li><li><b>Andere Unternehmer</b> (e.U., OG, KG mit natürlicher Person als Komplementär): Pflicht, wenn die Umsatzerlöse <b>in zwei aufeinanderfolgenden Geschäftsjahren &gt; 700.000 €</b> sind → ab dem <b>zweitfolgenden</b> Geschäftsjahr (ein „Pufferjahr“).</li><li>Bei Umsatz <b>&gt; 1 Mio. €</b> in einem Jahr → schon ab dem <b>folgenden</b> Geschäftsjahr.</li><li>Die Pflicht entfällt, wenn der Schwellenwert in zwei aufeinanderfolgenden Jahren nicht mehr überschritten wird (ab dem folgenden Jahr).</li><li>Freie Berufe und Land- und Forstwirte sind ausgenommen.</li></ul>",
      technical: "Beispiel Altprüfung (Jahr 20x7): Five in One KG: 580.000 / 720.000 / 680.000 → nur 20x6 &gt; 700.000 und nicht &gt; 1 Mio. → <b>keine</b> Pflicht für 20x7. Eine Pflicht ab 20x7 würde 20x4 und 20x5 &gt; 700.000 (zweitfolgendes Jahr) oder 20x6 &gt; 1 Mio. (folgendes Jahr) verlangen. GmbH und AG: Pflicht kraft Rechtsform." } },
    { t: "html", html: `<table class="dt"><tr><th></th><th>Rückstellung</th><th>Rücklage</th></tr><tr><td>Bilanzseite</td><td>Passiva, <b>Fremdkapital</b></td><td>Passiva, <b>Eigenkapital</b></td></tr><tr><td>Wozu?</td><td>ungewisse Verbindlichkeiten / drohende Verluste (z. B. Steuerberatung, Prozess, Abfertigung)</td><td>Kapitalrücklage: Mittel <b>von außen</b> (Agio, Zuzahlungen); Gewinnrücklage: aus dem <b>Jahresüberschuss</b> einbehalten</td></tr><tr><td>Ergebniswirkung</td><td>Bildung = Aufwand (Ergebnis ↓, Liquidität unverändert); Verbrauch in Höhe der Rückstellung = ergebnisneutral</td><td>Bildung ist Gewinnverwendung, kein Aufwand</td></tr></table>` },
    { t: "keys", items: ["GmbH/AG: immer doppelte Buchhaltung", "Sonst: 2 × &gt; 700.000 € → ab dem zweitfolgenden GJ; 1 × &gt; 1 Mio. € → ab dem folgenden GJ", "Rückstellung = Fremdkapital; Bildung ist Aufwand, aber keine Auszahlung", "Kapitalrücklage = von außen; Gewinnrücklage = aus dem Jahresüberschuss", "Gewinn (Betriebsvermögensvergleich) = EK Ende − EK Anfang + Entnahmen − Einlagen"] },
    { t: "check", q: "Rückstellung 2x13 über 3.600 € für die Steuerberatung, Rechnung 2x14 genau 3.600 €. Ergebniswirkung 2x14?", opts: ["−3.600 €", "keine", "+3.600 €", "−7.200 €"], a: 1, why: "Die Rückstellung wird verbraucht; der Aufwand wurde schon 2x13 erfasst." },
    { t: "widget", w: "sorter", topic: "bx-pflicht", title: "Muss doppelt buchführen (Jahr 20x7)?", cats: [{ k: "j", label: "Ja" }, { k: "n", label: "Nein" }],
      items: [{ t: "AG, Umsatz 20x5/20x6: 380.000 / 280.000", a: "j", why: "Rechtsform" }, { t: "GmbH, Umsatz 180.000 / 320.000", a: "j", why: "Rechtsform" }, { t: "KG, Umsatz 580.000 / 720.000", a: "n", why: "nur ein Jahr über 700.000" }, { t: "e.U., Umsatz 20x6: 1,1 Mio. (Vorjahr 300.000)", a: "j", why: "> 1 Mio. → ab dem folgenden Jahr" }, { t: "e.U., Umsatz 68.000 / 72.000", a: "n", why: "" }, { t: "OG, Umsatz 20x4: 750.000, 20x5: 760.000", a: "j", why: "zweitfolgendes Jahr nach 20x5 = 20x7" }] }
  ]},
  { id: "bx-2", title: "URG: Eigenmittelquote & fiktive Schuldentilgungsdauer", topic: "bx-urg", min: 8, xp: 0, blocks: [
    { t: "lead", html: "Das Unternehmensreorganisationsgesetz (URG) liefert zwei Kennzahlen, mit denen ein <b>Reorganisationsbedarf vermutet</b> wird – und eine mögliche Haftung der Geschäftsführung." },
    { t: "text", h: "Die beiden Kennzahlen", levels: {
      simple: "Eigenkapital unter 8 % UND Schulden-Rückzahlung würde länger als 15 Jahre dauern → Alarm (Reorganisationsbedarf vermutet).",
      normal: "<b>Eigenmittelquote</b> = Eigenmittel / Gesamtkapital × 100 (Eigenmittel inkl. unversteuerter Rücklagen).<br><b>Fiktive Schuldentilgungsdauer</b> = (Rückstellungen + Verbindlichkeiten − flüssige Mittel − wie flüssige Mittel verwertbare Wertpapiere) / Mittelüberschuss aus der gewöhnlichen Geschäftstätigkeit.<br><b>Vermutung des Reorganisationsbedarfs</b>: Eigenmittelquote <b>&lt; 8 %</b> <b>und</b> fiktive Schuldentilgungsdauer <b>&gt; 15 Jahre</b> – beide Bedingungen gleichzeitig.",
      technical: "Erhält die Geschäftsführung einen Prüfbericht mit diesen Werten und leitet kein Reorganisationsverfahren ein (bzw. holt kein Reorganisationsgutachten ein), kann sie gegenüber der juristischen Person bei späterer Insolvenz <b>solidarisch</b> (zur ungeteilten Hand) haften. Die fiktive Schuldentilgungsdauer entspricht inhaltlich der dynamischen Verschuldungsdauer (Effektivverschuldung / Cash-Flow)." } },
    { t: "warnbox", html: "Falle: Es braucht <b>beide</b> Werte (EMQ &lt; 8 % <b>und</b> SDT &gt; 15 J.). Ist nur einer verletzt, gibt es keine gesetzliche Vermutung." },
    { t: "keys", items: ["EMQ &lt; 8 %", "fiktive Schuldentilgungsdauer &gt; 15 Jahre", "beide zusammen → Vermutung Reorganisationsbedarf", "Haftung der Organmitglieder, wenn trotzdem kein Reorganisationsverfahren eingeleitet wird"] },
    { t: "check", q: "EMQ 6 %, fiktive Schuldentilgungsdauer 12 Jahre. Vermutung des Reorganisationsbedarfs?", opts: ["Ja", "Nein"], a: 1, why: "Die Schuldentilgungsdauer liegt unter 15 Jahren – es fehlt die zweite Bedingung." },
    { t: "widget", w: "gapfill", topic: "bx-urg", title: "URG-Grenzwerte", items: [{ s: "Reorganisationsbedarf wird vermutet bei einer Eigenmittelquote unter ___ Prozent.", a: ["8", "8 %", "acht"] }, { s: "… und einer fiktiven Schuldentilgungsdauer über ___ Jahren.", a: ["15", "fünfzehn"] }, { s: "Beide Bedingungen müssen ___ erfüllt sein.", a: ["gleichzeitig", "kumulativ", "zugleich"] }] }
  ]},
  { id: "bx-3", title: "Anschaffungskosten, AfA im Jahr der Anschaffung, Anlagenspiegel", topic: "bx-afa", min: 12, xp: 0, blocks: [
    { t: "lead", html: "Typische Altprüfungsfrage: Kaufpreis, Rabatt, Lieferung, Montage, Inbetriebnahme im Juli – wie hoch ist die AfA im ersten Jahr?" },
    { t: "text", h: "Anschaffungskosten (AK)", levels: {
      simple: "AK = was du zahlen musst, damit die Maschine läuft – ohne Vorsteuer, minus Rabatte und Skonti.",
      normal: "<b>AK = Kaufpreis (netto) − Anschaffungspreisminderungen (Rabatt, Skonto, nachträgliche Preisnachlässe) + Anschaffungsnebenkosten (Transport, Lieferung, Montage, Fundament, Zölle)</b>. Die abziehbare <b>Vorsteuer</b> gehört nicht dazu. Preisminderungen <b>senken</b> die Bemessungsgrundlage der Abschreibung.",
      technical: "Beispiel Altprüfung: 5.832 − 10 % Rabatt (583,20) = 5.248,80; + Lieferung 72 + Montage 106 = <b>5.426,80</b>. Lineare Jahres-AfA bei 10 J. ND: 542,68. Inbetriebnahme 7. Juli (2. Jahreshälfte) → <b>Halbjahres-AfA 271,34</b> (gleicher Wert wie 6/12 monatsgenau)." } },
    { t: "text", h: "Halbjahresregel und Anlagenspiegel", levels: {
      normal: "Inbetriebnahme in der <b>ersten</b> Jahreshälfte → volle Jahres-AfA; in der <b>zweiten</b> Jahreshälfte → halbe Jahres-AfA. Maßgeblich ist die <b>Inbetriebnahme</b>, nicht Kauf- oder Zahlungsdatum.<br><br><b>Anlagenspiegel</b>: AK/HK 1.1. + Zugänge − Abgänge ± Umbuchungen = AK/HK 31.12.; kum. AfA 31.12. = kum. AfA 1.1. + AfA d. J. − Zuschreibungen − AfA auf Abgänge; <b>Buchwert 31.12. = AK/HK 31.12. − kum. AfA 31.12.</b><br><b>Anlagenabnutzungsgrad</b> = kum. AfA / AK des <i>abnutzbaren</i> SAV (Grund und Boden weglassen) × 100.<br><b>Investitionsdeckung</b>: Gegenüberstellung von Investitionen (Zugänge) und Abschreibungen des SAV."
    } },
    { t: "warnbox", html: "Fallen: Vorsteuer nicht in die AK; Rabatt/Skonto abziehen; bei „abnutzbarem“ SAV den <b>Grund</b> herausnehmen; AfA ab <b>Inbetriebnahme</b>." },
    { t: "keys", items: ["AK = Preis − Minderungen + Nebenkosten (ohne USt)", "Halbjahresregel: Inbetriebnahme ab 1.7. → ½ Jahres-AfA", "BW = AK 31.12. − kum. AfA 31.12.", "Abnutzungsgrad: kum. AfA / AK abnutzbares SAV"] },
    { t: "check", q: "Kaufpreis 10.000 netto, 5 % Rabatt, Transport 300, USt 20 %. AK?", opts: ["9.800", "9.500", "11.760", "10.300"], a: 0, why: "10.000 − 500 + 300 = 9.800; die USt ist Vorsteuer und keine AK." },
    { t: "widget", w: "pairs", topic: "bx-afa", title: "Anlagenspiegel-Formeln", pairs: [["AK/HK 31.12.", "AK 1.1. + Zugänge − Abgänge ± Umbuchungen"], ["Buchwert 31.12.", "AK/HK 31.12. − kum. AfA 31.12."], ["Anlagenabnutzungsgrad", "kum. AfA / AK abnutzbares SAV × 100"], ["Halbjahres-AfA", "Inbetriebnahme in der 2. Jahreshälfte"], ["Anschaffungsnebenkosten", "Transport, Montage, Fundament"]] }
  ]}
]});

const Q = (id, topic, q, opts, a, why) => ({ id, topic, q, opts, a, why, alt: true, src: "Altprüfung" });
const RF = ["Richtig", "Falsch"];
const FF = ["Außenfinanzierung · Eigenfinanzierung", "Außenfinanzierung · Fremdfinanzierung", "Innenfinanzierung · Eigenfinanzierung", "Innenfinanzierung · Fremdfinanzierung"];
const TK = ["Kostenartenrechnung", "Kostenstellenrechnung", "Kostenträgerrechnung"];

c.questions.push(
  // ----- Originalfragen der Altprüfung -----
  Q("bxq1", "b-entsch", "Die Fixkosten betragen € 100.000 pro Jahr. Der Deckungsbeitrag pro Stück beträgt anfänglich € 2,50 und soll auf € 2,00 reduziert werden. Wie viele Stück müssten mehr produziert/abgesetzt werden, damit sich nach wie vor weder Gewinn noch Verlust ergibt?",
    ["4.000 Stück", "48.000 Stück", "10.000 Stück", "40.000 Stück", "42.000 Stück"], 2,
    "Break-even = Fixkosten / DB je Stück. Vorher: 100.000 / 2,50 = 40.000 Stück. Nachher: 100.000 / 2,00 = 50.000 Stück. Mehrmenge = 50.000 − 40.000 = <b>10.000 Stück</b>. (40.000 ist nur der alte Break-even.)"),
  Q("bxq2", "b-kore", "Richtig oder falsch? Anschaffungspreisminderungen wie Rabatte und Skonti erhöhen die Bemessungsgrundlage zur Berechnung der kalkulatorischen Abschreibung.", RF, 1,
    "Falsch. Rabatte und Skonti <b>mindern</b> die Anschaffungskosten und damit die Abschreibungsbasis (AK = Preis − Minderungen + Nebenkosten)."),
  Q("bxq3", "b-dyn", "Richtig oder falsch? Der interne Zinssatz einer Investition ist der Zinssatz, bei dem der Kapitalwert null ist.", RF, 0,
    "Richtig – Definition des internen Zinsfußes (IZF): KW(IZF) = 0. Bei einer Normalinvestition ist die Investition absolut vorteilhaft, wenn IZF &gt; Kalkulationszins."),
  Q("bxq4", "bx-pflicht", `Welche der folgenden Unternehmen müssen im Jahr 20x7 verpflichtend eine doppelte Buchhaltung führen?<table class="dt"><tr><th>Nr.</th><th>Unternehmen</th><th>Rechtsform</th><th>Umsatz 20x5</th><th>Umsatz 20x6</th><th>Umsatz 20x7</th></tr><tr><td>1</td><td>Five in One</td><td>KG</td><td>580.000</td><td>720.000</td><td>680.000</td></tr><tr><td>2</td><td>Weilharter</td><td>GmbH</td><td>180.000</td><td>320.000</td><td>340.000</td></tr><tr><td>3</td><td>Dieter Fasching</td><td>e.U.</td><td>68.000</td><td>72.000</td><td>190.000</td></tr><tr><td>4</td><td>Weingärten</td><td>AG</td><td>380.000</td><td>280.000</td><td>290.000</td></tr><tr><td>5</td><td>Uschis Uhren</td><td>e.U.</td><td>24.000</td><td>28.000</td><td>32.000</td></tr></table>`,
    ["Nur Weingärten AG und Weilharter GmbH", "Weingärten AG, Weilharter GmbH und Five in One KG", "Five in One KG und Dieter Fasching e.U.", "Alle fünf Unternehmen", "Nur Weingärten AG"], 0,
    "GmbH und AG sind kraft <b>Rechtsform</b> immer rechnungslegungspflichtig (§ 189 UGB). Five in One KG: nur 20x6 über 700.000 (und nicht über 1 Mio.) → für 20x7 <b>keine</b> Pflicht (nötig wären zwei aufeinanderfolgende Jahre &gt; 700.000, Pflicht dann ab dem zweitfolgenden Jahr). Die e.U. liegen weit darunter. In der Altprüfung war zusätzlich die KG angekreuzt – das ist falsch."),
  Q("bxq5", "b-kore", "Klassifizieren Sie als Einzel- (E) oder Gemeinkosten (G), Reihenfolge: kalkulatorische Zinsen | Fertigungsmaterial (Holz) | Abschreibung des Verwaltungsgebäudes | Gehalt des Personalchefs | Akkordlöhne der Fertigung.",
    ["G | E | G | G | E", "E | E | G | G | E", "G | E | G | E | G", "G | G | G | G | E"], 0,
    "Einzelkosten lassen sich dem Kostenträger direkt zurechnen: Fertigungsmaterial und Akkordlöhne (Fertigungslöhne). Kalkulatorische Zinsen, AfA Verwaltungsgebäude und Gehalt des Personalchefs betreffen den ganzen Betrieb → Gemeinkosten."),
  Q("bxq6", "b-dyn", "Richtig oder falsch? Ist die Annuität einer Investition größer null, dann ist auch die Verzinsung des gebundenen Kapitals höher als der Kalkulationszins.", RF, 0,
    "Richtig. Annuität = KW × Kapitalwiedergewinnungsfaktor; Annuität &gt; 0 ⇔ KW &gt; 0 ⇔ (bei Normalinvestition) IZF &gt; Kalkulationszins."),
  Q("bxq7", "b-fin", FRISEUR + "Sofern Sie die unversteuerten Rücklagen zum Eigenkapital zählen, sämtliche Rückstellungen in den nächsten 4 Monaten aufzulösen/zu verwenden sind und nur € 200.000 der Verbindlichkeiten eine Fälligkeit nach 12 Monaten aufweisen, beläuft sich der Deckungsgrad B zum 31.12.2004 auf:",
    ["17,29 %", "19,50 %", "7,50 %", "15,11 %", "88,30 %"], 4,
    "EK = 36.336,42 − 18.168,21 + 8.197,88 − 1.233,90 = 25.132,19; + unversteuerte Rücklagen 23.574,71 = <b>48.706,90</b>. Langfristiges FK = 200.000 (Rückstellungen sind kurzfristig). AV = 256.627,78 + 25.033,13 = <b>281.660,91</b>. Deckungsgrad B = (48.706,90 + 200.000) / 281.660,91 × 100 = <b>88,30 %</b>. (17,29 % wäre Deckungsgrad A.) Kontrolle: EK + unv. Rücklagen + Rückstellungen + Verbindlichkeiten = 483.630,40 = Bilanzsumme."),
  Q("bxq8", "b-dyn", "Ein positiver Kapitalwert bedeutet: (a) Amortisation + Verzinsung zum Kalkulationszins, jedoch kein Überschuss; (b) Amortisation + Verzinsung zum Kalkulationszins + zusätzlicher Überschuss in Höhe des Kapitalwerts; (c) Amortisation + Verzinsung, kein zusätzlicher Überschuss in Höhe des KW; (d) absolute Vorteilhaftigkeit ist gegeben; (e) absolute Vorteilhaftigkeit ist nicht gegeben. Welche Aussagen sind richtig?",
    ["b und d", "a und d", "c und d", "b und e", "nur d"], 0,
    "KW &gt; 0: Das eingesetzte Kapital wird zurückverdient, mit dem Kalkulationszins verzinst und darüber hinaus bleibt ein Überschuss (Barwert) in Höhe des KW → absolut vorteilhaft. (a) beschreibt KW = 0."),
  Q("bxq9", "b-finz", "Klassifizieren Sie: Das Unternehmen begibt eine 6-%-ige Unternehmensanleihe mit einer Laufzeit von 15 Jahren.", FF, 1,
    "Anleihe = Kapital von Gläubigern, das von außen zufließt → Außen- und Fremdfinanzierung (Kreditfinanzierung)."),
  Q("bxq10", "b-finz", "Klassifizieren Sie: Eine Aktiengesellschaft erhöht ihr gezeichnetes Kapital.", FF, 0,
    "Kapitalerhöhung = neue Eigentümermittel von außen → Außen- und Eigenfinanzierung (Beteiligungsfinanzierung). In der Altprüfung wurde hier fälschlich „Innenfinanzierung“ gewählt."),
  Q("bxq11", "b-finz", "Klassifizieren Sie: Erzielte Gewinne werden im Unternehmen einbehalten und für Investitionszwecke verwendet.", FF, 2,
    "Gewinnthesaurierung (Selbstfinanzierung) = Mittel aus dem Umsatzprozess, die den Eigentümern zustehen → Innen- und Eigenfinanzierung."),
  Q("bxq12", "b-finz", "Klassifizieren Sie: Eine Personengesellschaft nimmt einen neuen voll haftenden Gesellschafter auf.", FF, 0,
    "Einlage eines neuen Gesellschafters = Eigenkapital von außen → Außen- und Eigenfinanzierung (Beteiligungsfinanzierung). In der Altprüfung fälschlich „Innenfinanzierung“."),
  Q("bxq13", "b-kore", "Richtig oder falsch? Ausgangspunkt der Kostenerfassung ist für den überwiegenden Teil der Kosten das Zahlenmaterial aus der Bilanz.", RF, 1,
    "Falsch. Ausgangspunkt ist die <b>Finanzbuchhaltung bzw. die Aufwendungen der GuV</b> (Aufwandskonten), die in der Kostenartenrechnung um neutrale Aufwände bereinigt und um Anders-/Zusatzkosten ergänzt werden – nicht die Bilanz (Bestände)."),
  Q("bxq14", "b-verm", VENTEC + "Ermitteln Sie die Investitionsdeckung des <b>gesamten Sachanlagevermögens</b> – einfachheitshalber rein durch die Gegenüberstellung von Investitionen und Abschreibungen. Die Investitionsdeckung beträgt:",
    ["rund 26,20 %", "rund 146,23 %", "rund 165,55 %", "rund 7,41 %", "rund 8,59 %", "rund 204,23 %", "rund 162,87 %", "rund 140,20 %"], 6,
    "Sachanlagen: Investitionen (Zugänge) = 4.000 + 1.000 = <b>5.000</b>; Abschreibungen d. J. = 320 + 2.000 + 750 = <b>3.070</b>. Gegenüberstellung: 5.000 / 3.070 × 100 = <b>162,87 %</b> – die einzige passende Option. Achtung: In der Formelsammlung des Kurses steht die Investitionsdeckung als AfA / Investitionen (3.070 / 5.000 = 61,4 %, wird hier nicht angeboten) – beides vergleicht dieselben Größen; Aussage: Die Investitionen übersteigen die Abschreibungen deutlich → Substanz wird aufgebaut."),
  Q("bxq15", "b-entsch", "Fixkosten € 300.000/Jahr, variable Kosten € 4 je Beratungsstunde, Kapazität 20.000 Stunden. Geplant sind 18.000 Stunden zu Vollkosten. Zu welchem „Schnäppchenpreis“ (Minimalpreis) könnten Sie die restlichen 2.000 Stunden anbieten, wenn Sie mit dem Zusatzauftrag keinen Gewinn mehr anstreben?",
    ["€ 19,–", "€ 16,66", "€ 4,–", "€ 21,91", "€ 2,–", "€ 15,–"], 2,
    "Die Fixkosten sind über die 18.000 Stunden zu Vollkosten bereits gedeckt. Bei freier Kapazität ist die kurzfristige Preisuntergrenze = variable Kosten = <b>€ 4</b>."),
  Q("bxq16", "b-kore", "Welchem Teilgebiet der Kostenrechnung ist zuzuordnen: Überwachung der Wirtschaftlichkeit einzelner Betriebsbereiche?", TK, 1,
    "Die Kostenstellenrechnung („Wo sind die Kosten angefallen?“) dient der Kontrolle der Wirtschaftlichkeit von Bereichen."),
  Q("bxq17", "b-kore", "Welchem Teilgebiet der Kostenrechnung ist zuzuordnen: Verteilung der Gemeinkosten auf die Leistungsbereiche, in denen sie entstanden sind?", TK, 1,
    "Verteilung der Gemeinkosten auf Kostenstellen (BAB) = Kostenstellenrechnung."),
  Q("bxq18", "b-kore", "Welchem Teilgebiet der Kostenrechnung ist zuzuordnen: Ausscheiden von neutralen Aufwänden und Ansetzen von Zusatz- und/oder Anderskosten?", TK, 0,
    "Die Kostenartenrechnung („Welche Kosten sind angefallen?“) leitet die Kosten aus den Aufwendungen ab: neutrale Aufwände raus, kalkulatorische Kosten rein."),
  Q("bxq19", "b-kore", "Welchem Teilgebiet der Kostenrechnung ist zuzuordnen: Bereitstellung von Informationen für preispolitische Entscheidungen wie die Festlegung von Preisuntergrenzen?", TK, 2,
    "Kostenträgerrechnung („Wofür sind die Kosten angefallen?“): Kalkulation je Produkt → Basis für Preise und Preisuntergrenzen."),
  Q("bxq20", "b-ja", "Einzelunternehmen Glaspeter – Schlussbilanzen 20x5 und 20x6:" + GLASPETER + "Der Inhaber hat 20x6 jeden Monat € 1.000 vom Geschäftskonto auf sein privates Konto überwiesen. Wie hoch ist das Jahresergebnis 20x6?",
    ["Gewinn € 15.400", "Verlust € 27.400", "Verlust € 15.400", "Verlust € 3.400", "Gewinn € 27.400"], 3,
    "Betriebsvermögensvergleich: Ergebnis = EK Ende − EK Anfang + Privatentnahmen − Privateinlagen = 82.600 − 98.000 + 12 × 1.000 = −15.400 + 12.000 = <b>−3.400 → Verlust € 3.400</b>. Die Entnahmen haben das EK gemindert, sind aber kein Aufwand und müssen daher zurückgerechnet werden. (In der Altprüfung war fälschlich −27.400 angekreuzt – das wäre ΔEK minus Entnahmen.)"),
  Q("bxq21", "b-dyn", "Richtig oder falsch? Im vollkommenen Kapitalmarkt sind Haben- und Sollzinssätze unterschiedlich hoch.", RF, 1,
    "Falsch. Annahme des vollkommenen Kapitalmarkts: ein einheitlicher Zinssatz, zu dem unbegrenzt Geld angelegt <b>und</b> aufgenommen werden kann (Sollzins = Habenzins). Darauf beruht die Kapitalwertmethode."),
  Q("bxq22", "b-dyn", "Richtig oder falsch? Der Kapitalwert einer Investition ist die Vermögensänderung des Investors am Ende der Laufzeit der Investition.", RF, 1,
    "Falsch. Der Kapitalwert ist die Vermögensänderung bezogen auf den <b>Zeitpunkt t = 0</b> (Barwert aller Ein- und Auszahlungen). Die Vermögensänderung am Ende der Laufzeit ist der <b>Vermögensendwert</b> (KW × (1 + i)ⁿ)."),
  Q("bxq23", "b-verm", FRISEUR + "Im Jahr 2004 betrug der Umsatz exkl. 20 % USt € 416.666,67. Die Position B.II enthält ausschließlich Forderungen aus Lieferungen und Leistungen; unternehmensweit gilt nur der 20-%-USt-Satz. Die Debitorenumschlagsdauer (365 Tage) beträgt:",
    ["11,50 Tage", "2,00 Tage", "29,62 Tage", "4,80 Tage", "28,70 Tage"], 2,
    "Umsatz brutto = 416.666,67 × 1,2 = 500.000. ø Forderungen = (65.432,19 + 15.714,73) / 2 = 40.573,46. DUH = 500.000 / 40.573,46 = 12,32. DUD = 365 / 12,32 = <b>29,62 Tage</b>."),
  Q("bxq24", "bx-afa", "Die Tischlerei Heinrich GmbH kauft am 23. Juni eine Formatkreissäge um € 5.832,00 zzgl. 20 % USt auf Ziel. Am 2. Juli werden € 72,00 zzgl. USt für die Lieferung und € 106,00 zzgl. USt für die Montage verrechnet. Am 4. Juli gewährt der Händler wegen eines Mangels nachträglich 10 % Rabatt auf den Kaufpreis. Bezahlung am 10. Juli; Inbetriebnahme am 7. Juli, Nutzungsdauer 10 Jahre. Welcher Betrag ist in diesem Jahr als laufende Abschreibung zu verbuchen?",
    ["€ 271,34", "€ 265,65", "€ 300,50", "Keiner dieser Beträge ist richtig.", "€ 542,68"], 0,
    "AK = 5.832,00 − 10 % (583,20) + 72,00 + 106,00 = <b>5.426,80</b> (Vorsteuer gehört nicht dazu). Jahres-AfA = 5.426,80 / 10 = 542,68. Inbetriebnahme am 7. Juli = zweite Jahreshälfte → Halbjahres-AfA = <b>271,34</b> (monatsgenau Juli–Dezember 6/12 ergibt denselben Betrag)."),
  Q("bxq25", "b-kore", "Klassifizieren Sie als variable (v) oder fixe (f) Kosten, Reihenfolge: Akkordlöhne der Fertigung | Fertigungsmaterial (Holz) | Abschreibung des Verwaltungsgebäudes | kalkulatorische Zinsen | Gehalt des Personalchefs.",
    ["v | v | f | f | f", "v | v | f | v | f", "f | v | f | f | f", "v | v | v | f | f"], 0,
    "Akkordlohn und Material steigen mit der Produktionsmenge → variabel. Gebäude-AfA, kalkulatorische Zinsen auf das betriebsnotwendige Kapital und ein Gehalt sind beschäftigungsunabhängig → fix."),
  Q("bxq26", "b-fin", FRISEUR + "Sofern Sie die unversteuerten Rücklagen dem Eigenkapital zuordnen, beläuft sich die Fremdkapitalquote 2004 auf:",
    ["8,00 %", "89,93 %", "7,50 %", "9,21 %", "10,07 %"], 1,
    "FK = Rückstellungen + Verbindlichkeiten = 33.468,51 + 401.454,99 = 434.923,50. FKQ = 434.923,50 / 483.630,40 × 100 = <b>89,93 %</b>. (10,07 % wäre die Eigenkapitalquote.)"),
  Q("bxq27", "b-dyn", "Richtig oder falsch? Bei der dynamischen Investitionsrechnung sind Erträge und Aufwendungen relevant.", RF, 1,
    "Falsch. Dynamische Verfahren rechnen mit <b>Ein- und Auszahlungen</b> und deren zeitlichem Anfall. Erträge/Aufwendungen bzw. Kosten/Leistungen sind Rechengrößen der statischen Verfahren."),
  Q("bxq28", "b-verm", VENTEC + "Ermitteln Sie den Anlagenabnutzungsgrad des <b>abnutzbaren</b> Sachanlagevermögens der Ventec GmbH zum 31.12.:",
    ["rund 26,20 %", "rund 8,59 %", "rund 12,14 %", "rund 35,25 %", "rund 48,75 %", "rund 49,52 %", "rund 75,23 %", "rund 7,41 %"], 4,
    "Abnutzbar = Gebäude, technische Anlagen, andere Anlagen (Grund ist nicht abnutzbar). Kum. AfA 31.12. = 5.320 + 6.500 + 3.000 = 14.820. AK 31.12. = 8.000 + 17.500 + 4.900 = 30.400. Abnutzungsgrad = 14.820 / 30.400 × 100 = <b>48,75 %</b>. (Mit Grund: 14.820 / 31.400 = 47,20 % – falsch.)"),
  Q("bxq29", "b-kore", "Richtig oder falsch? Nach ihrem Verhalten bei Beschäftigungsänderungen unterscheidet man zwischen fixen und variablen Kosten.", RF, 0,
    "Richtig. Kriterium Beschäftigungsabhängigkeit → fix/variabel. (Kriterium Zurechenbarkeit auf den Kostenträger → Einzel-/Gemeinkosten.)"),
  Q("bxq30", "bx-urg", "Zur Überwachung eines Reorganisationsbedarfs nach URG werden Eigenmittelquote und fiktive Schuldentilgungsdauer verwendet. Welche Kennzahlenwerte führen zur Vermutung des Reorganisationsbedarfs? (a) SDT &lt; 15 J.; (b) SDT &lt; 10 J.; (c) EMQ &lt; 8 %; (d) EMQ &gt; 8 %; (e) EMQ &gt; 10 %; (f) SDT &gt; 15 J.",
    ["c und f", "a und c", "d und f", "b und d", "nur f"], 0,
    "Vermutung des Reorganisationsbedarfs (§ 22 URG): Eigenmittelquote <b>unter 8 %</b> und fiktive Schuldentilgungsdauer <b>über 15 Jahre</b>."),
  Q("bxq31", "b-entsch", "Fixkosten € 300.000/Jahr, variable Kosten € 4 je Beratungsstunde, Kapazität 20.000 Stunden. Welchen Preis müssen Sie je Beratungsstunde verlangen, um kostendeckend zu sein, wenn Sie von 18.000 angebotenen Stunden ausgehen?",
    ["€ 24,22", "€ 15,–", "€ 16,67", "€ 4,–", "€ 27,44", "€ 20,67"], 5,
    "Vollkostenpreis = Fixkosten / Menge + kv = 300.000 / 18.000 + 4 = 16,67 + 4 = <b>€ 20,67</b>. (16,67 wären nur die fixen Stückkosten, € 19 = 300.000/20.000 + 4 auf Basis der Kapazität.)"),
  Q("bxq32", "b-stat", `Zwei Investitionsobjekte (lineare AfA):<table class="dt"><tr><th></th><th>Projekt A</th><th>Projekt B</th></tr><tr><td>Anschaffungskosten</td><td>112.000</td><td>165.000</td></tr><tr><td>Nutzungsdauer</td><td>5</td><td>5</td></tr><tr><td>Restwert</td><td>12.000</td><td>15.000</td></tr><tr><td>Gewinn Jahr 1</td><td>12.000</td><td>59.000</td></tr><tr><td>Gewinn Jahr 2</td><td>24.000</td><td>46.000</td></tr><tr><td>Gewinn Jahr 3</td><td>20.000</td><td>28.000</td></tr><tr><td>Gewinn Jahr 4</td><td>26.000</td><td>24.000</td></tr><tr><td>Gewinn Jahr 5</td><td>32.000</td><td>23.000</td></tr></table>Nach der Durchschnittsrechnung beläuft sich die Amortisationsdauer bei Projekt A auf:`,
    ["4,91 Jahre", "2,34 Jahre", "4 Jahre", "4,39 Jahre"], 1,
    "AfA = (112.000 − 12.000) / 5 = 20.000. ø Gewinn = (12 + 24 + 20 + 26 + 32) / 5 = 22.800. Rückfluss p. a. = 22.800 + 20.000 = 42.800. Amortisationsdauer = (AK − RW) / (ø Gewinn + AfA) = 100.000 / 42.800 = <b>2,34 Jahre</b>."),
  Q("bxq33", "b-dyn", `Angebot 1: Anschaffungskosten € 12.500, Nutzungsdauer 5 Jahre, kein Restwert. Rückflüsse (Einzahlungsüberschüsse):<table class="dt"><tr><th>Periode</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr><tr><td>Rückfluss</td><td>980</td><td>2.500</td><td>4.500</td><td>4.910</td><td>7.000</td></tr></table>Angebot 2 hat einen Kapitalwert von € 750. Wie hoch ist der Kapitalwert von Angebot 1 bei einem Kalkulationszins von 3 % p. a.?`,
    ["rund € 2.298,99", "rund € 5.326,82", "rund € 4.112,33", "rund € 17.826,82", "rund € 2.952,45"], 1,
    "Barwerte: 980/1,03 = 951,46; 2.500/1,03² = 2.356,49; 4.500/1,03³ = 4.118,14; 4.910/1,03⁴ = 4.362,47; 7.000/1,03⁵ = 6.038,26. Summe = 17.826,82. KW = 17.826,82 − 12.500 = <b>5.326,82</b> → Angebot 1 ist besser als Angebot 2 (750). (17.826,82 ist nur die Barwertsumme ohne Anschaffungsauszahlung.)"),
  Q("bxq34", "b-kore", "Richtig oder falsch? Unechte Gemeinkosten sind Einzelkosten, die einem Kostenträger unmittelbar zugerechnet werden könnten, aus Wirtschaftlichkeitsgründen aber wie Gemeinkosten behandelt werden.", RF, 0,
    "Richtig – z. B. Schrauben, Leim, Kleinmaterial: direkte Erfassung wäre möglich, lohnt sich aber nicht."),
  Q("bxq35", "b-ja", "Am 04.05.2x14 trifft die Rechnung des Steuerberaters für den Jahresabschluss 2x13 ein: € 3.600 (exkl. USt), bezahlt am 10.05.2x14. Die Schoko-Laden GmbH hat dafür bereits 2x13 eine Rückstellung von € 3.600 gebildet. Aussagen: (a) Die Bildung der Rückstellung hat das Ergebnis 2x13 um € 3.600 verringert. (b) Der Sachverhalt wirkt sich 2x14 insgesamt NICHT auf das Ergebnis aus. (c) Der Sachverhalt wirkt sich 2x14 auf das Ergebnis aus. (d) Die Bildung hat das Ergebnis 2x13 um € 3.600 erhöht. (e) Die Bildung der Rückstellung hat 2x13 die Liquidität verringert. Richtig sind:",
    ["a und b", "nur c", "a, b und e", "c und d", "a und e"], 0,
    "2x13: Aufwand an Rückstellung → Ergebnis −3.600, aber keine Zahlung (Liquidität unverändert). 2x14: Die Rechnung entspricht genau der Rückstellung → Verbrauch der Rückstellung, Zahlung über Bank → <b>ergebnisneutral</b> (ein evtl. gebuchter Aufwand wird durch die Auflösung der Rückstellung ausgeglichen). In der Altprüfung war fälschlich (c) angekreuzt."),
  Q("bxq36", "b-ja", "Welche Aussage zur Bilanzposition „Rücklagen“ ist richtig?",
    ["Kennzeichen einer Gewinnrücklage ist, dass sie von außen zugeführt wird; Kapitalrücklagen werden aus dem Jahresüberschuss gebildet.", "Kennzeichen einer Kapitalrücklage ist, dass sie von außen zugeführt wird; Gewinnrücklagen werden aus dem Jahresüberschuss gebildet."], 1,
    "Kapitalrücklagen stammen von außen (z. B. Agio bei Kapitalerhöhung, Zuzahlungen der Gesellschafter); Gewinnrücklagen entstehen durch Einbehaltung (Thesaurierung) von Jahresüberschüssen. In der Altprüfung war die vertauschte Aussage angekreuzt."),

  // ----- zusätzliche Übungsfragen im Stil der Altprüfung -----
  Q("bxq37", "bx-pflicht", "Ein Gewerbetreibender (e.U.) hatte bisher ca. 400.000 € Umsatz, im Jahr 20x1 aber 1,2 Mio. €. Ab wann muss er doppelt buchführen?",
    ["ab 20x2", "ab 20x3", "rückwirkend für 20x1", "gar nicht, da nur einmal überschritten"], 0,
    "Wird 1 Mio. € in einem Jahr überschritten, besteht die Rechnungslegungspflicht bereits ab dem <b>folgenden</b> Geschäftsjahr."),
  Q("bxq38", "bx-pflicht", "Eine OG hat in 20x1 und 20x2 jeweils 750.000 € Umsatz. Ab welchem Jahr ist sie rechnungslegungspflichtig?",
    ["20x2", "20x3", "20x4", "nie"], 2,
    "Zwei aufeinanderfolgende Jahre &gt; 700.000 € → Pflicht ab dem <b>zweitfolgenden</b> Geschäftsjahr nach dem zweiten Jahr: 20x2 + 2 = 20x4 (20x3 ist das „Pufferjahr“)."),
  Q("bxq39", "bx-pflicht", "Rückstellungen sind in der Bilanz …",
    ["Fremdkapital für ungewisse Verbindlichkeiten oder drohende Verluste", "Teil des Eigenkapitals", "Teil des Umlaufvermögens", "ein Instrument der Gewinnverwendung"], 0,
    "Rückstellungen = Fremdkapital (Höhe und/oder Zeitpunkt ungewiss). Rücklagen = Eigenkapital."),
  Q("bxq40", "bx-urg", "Wann wird nach URG ein Reorganisationsbedarf vermutet?",
    ["EMQ &lt; 8 % und fiktive Schuldentilgungsdauer &gt; 15 Jahre (beides)", "EMQ &lt; 8 % oder fiktive Schuldentilgungsdauer &gt; 15 Jahre", "EMQ &lt; 10 % und fiktive Schuldentilgungsdauer &gt; 10 Jahre", "sobald das Eigenkapital negativ ist"], 0,
    "Beide Grenzwerte müssen gleichzeitig verletzt sein."),
  Q("bxq41", "bx-urg", "Eigenmittel 90.000, Gesamtkapital 1.500.000; Rückstellungen + Verbindlichkeiten 1.300.000, flüssige Mittel 100.000; Mittelüberschuss aus der gewöhnlichen Geschäftstätigkeit 100.000. Ergebnis nach URG?",
    ["Keine Vermutung: EMQ 6 %, aber SDT nur 12 Jahre", "Vermutung: EMQ 6 % und SDT 13 Jahre", "Vermutung: EMQ unter 8 % reicht", "Keine Vermutung: beide Werte unauffällig"], 0,
    "EMQ = 90.000 / 1.500.000 = 6 % (&lt; 8 %). SDT = (1.300.000 − 100.000) / 100.000 = 12 Jahre (≤ 15). Nur eine Bedingung erfüllt → keine Vermutung."),
  Q("bxq42", "bx-afa", "Welche Position gehört NICHT zu den Anschaffungskosten einer Maschine (vorsteuerabzugsberechtigtes Unternehmen)?",
    ["Montagekosten", "Transportkosten", "die in Rechnung gestellte Umsatzsteuer", "Kosten des Fundaments"], 2,
    "Die USt ist als Vorsteuer abziehbar und daher kein Teil der AK. Nebenkosten bis zur Betriebsbereitschaft gehören dazu."),
  Q("bxq43", "bx-afa", "Maschine, AK 12.000 €, Nutzungsdauer 6 Jahre, Inbetriebnahme am 15. März. AfA im ersten Jahr nach der Halbjahresregel?",
    ["€ 2.000", "€ 1.000", "€ 1.583,33", "€ 0"], 0,
    "Inbetriebnahme in der ersten Jahreshälfte → volle Jahres-AfA: 12.000 / 6 = 2.000."),
  Q("bxq44", "bx-afa", "Wie wird im Anlagenspiegel der Buchwert zum 31.12. ermittelt?",
    ["AK/HK 31.12. (= AK 1.1. + Zugänge − Abgänge ± Umbuchungen) − kumulierte AfA 31.12.", "AK 1.1. − AfA des Jahres", "Buchwert 1.1. + Zugänge − kumulierte AfA 31.12.", "AK 31.12. − AfA des Jahres"], 0,
    "Der Anlagenspiegel arbeitet mit historischen AK und kumulierten Abschreibungen (direkte Bruttomethode)."),
  Q("bxq45", "b-verm", "Ein Anlagenabnutzungsgrad von rund 80 % deutet hin auf …",
    ["ein überaltertes Anlagevermögen mit baldigem Reinvestitionsbedarf", "besonders neue Anlagen", "hohe stille Reserven im Umlaufvermögen", "eine hohe Eigenkapitalquote"], 0,
    "Hoher Abnutzungsgrad = Anlagen sind großteils abgeschrieben → Ersatzinvestitionen stehen an."),
  Q("bxq46", "b-fin", "Bilanzsumme 750.000; EK 205.000; unversteuerte Rücklagen 15.000 (zum EK). Eigenkapitalquote?",
    ["27,33 %", "29,33 %", "2,00 %", "70,67 %"], 1,
    "(205.000 + 15.000) / 750.000 × 100 = 29,33 %. 70,67 % wäre die Fremdkapitalquote."),
  Q("bxq47", "b-ja", "Gewinnermittlung durch Betriebsvermögensvergleich: Gewinn = …",
    ["EK Ende − EK Anfang + Privatentnahmen − Privateinlagen", "EK Ende − EK Anfang − Privatentnahmen + Privateinlagen", "EK Anfang − EK Ende + Privatentnahmen", "Umsatz − Privatentnahmen"], 0,
    "Entnahmen haben das EK gesenkt, ohne Aufwand zu sein → hinzurechnen; Einlagen haben es erhöht, ohne Ertrag zu sein → abziehen."),
  Q("bxq48", "b-entsch", "Fixkosten 100.000 €. Der DB je Stück steigt von 2,00 € auf 2,50 €. Um wie viel sinkt die Break-even-Menge?",
    ["um 10.000 Stück", "um 5.000 Stück", "um 40.000 Stück", "gar nicht"], 0,
    "50.000 (100.000/2) → 40.000 (100.000/2,5): −10.000 Stück."),
  Q("bxq49", "b-stat", "AK 80.000, RW 0, ND 4 J., Gewinne 8.000 / 12.000 / 15.000 / 13.000. Amortisationsdauer nach der Kumulationsmethode?",
    ["rund 2,57 Jahre", "2,50 Jahre", "rund 3,10 Jahre", "2 Jahre"], 0,
    "Rückflüsse = Gewinn + AfA (20.000): 28.000, 32.000, 35.000 … kumuliert 28.000 → 60.000 → 95.000. Fehlende 20.000 im 3. Jahr: 20.000/35.000 = 0,57 → 2,57 Jahre. (2,50 J. = Durchschnittsmethode: 80.000 / 32.000.)"),
  Q("bxq50", "b-dyn", "Investition AK 50.000, Rückflüsse 15.000 / 18.000 / 16.000 / 12.000. KW(6 %) = 3.109,91; KW(10 %) = −1.270,41. Interpolierter interner Zinsfuß?",
    ["rund 8,84 %", "rund 7,10 %", "rund 9,90 %", "rund 6,00 %"], 0,
    "IZF ≈ 6 % + 3.109,91 × (10 % − 6 %) / (3.109,91 + 1.270,41) = 6 % + 2,84 % = 8,84 % (exakt per Zielwertsuche: 8,78 %)."),
  Q("bxq51", "b-kore", "Kalkulatorische Zinsen sind (Zurechenbarkeit · Beschäftigungsverhalten) …",
    ["Gemeinkosten · fix", "Einzelkosten · variabel", "Gemeinkosten · variabel", "Einzelkosten · fix"], 0,
    "Sie betreffen das gesamte betriebsnotwendige Kapital (nicht einem Produkt zurechenbar) und hängen nicht von der Ausbringung ab."),
  Q("bxq52", "b-finz", "Bildung von Pensionsrückstellungen ist (Mittelherkunft · Rechtsstellung) …",
    ["Innenfinanzierung · Fremdfinanzierung", "Außenfinanzierung · Fremdfinanzierung", "Innenfinanzierung · Eigenfinanzierung", "Außenfinanzierung · Eigenfinanzierung"], 0,
    "Die Mittel bleiben über den Umsatzprozess im Unternehmen (innen), stehen aber Dritten (Arbeitnehmern) zu → Fremdkapital.")
);

const F = (id, topic, front, back) => ({ id, cat: "GL-BWL-2", topic, front, back, alt: true });
c.flashcards.push(
  F("bxf1", "bx-pflicht", "Wer muss nach § 189 UGB doppelt buchführen (Rechnungslegungspflicht)?", "<ul><li>Kapitalgesellschaften (GmbH, AG) und verdeckte Kapitalgesellschaften (z. B. GmbH &amp; Co KG): <b>immer</b></li><li>andere Unternehmer: Umsatz <b>&gt; 700.000 €</b> in zwei aufeinanderfolgenden GJ → ab dem <b>zweitfolgenden</b> GJ</li><li>Umsatz <b>&gt; 1 Mio. €</b> → ab dem <b>folgenden</b> GJ</li><li>ausgenommen: freie Berufe, Land- und Forstwirte</li></ul>"),
  F("bxf2", "bx-urg", "URG: Kennzahlen und Grenzwerte für die Vermutung eines Reorganisationsbedarfs?", "<b>Eigenmittelquote</b> = Eigenmittel / Gesamtkapital &lt; <b>8 %</b> <b>und</b> <b>fiktive Schuldentilgungsdauer</b> = (Rückstellungen + Verbindlichkeiten − flüssige Mittel − verwertbare Wertpapiere) / Mittelüberschuss aus gewöhnlicher Geschäftstätigkeit &gt; <b>15 Jahre</b>. Folge: mögliche Haftung der Organmitglieder (zur ungeteilten Hand), wenn kein Reorganisationsverfahren eingeleitet wird."),
  F("bxf3", "bx-afa", "Anschaffungskosten und AfA im Anschaffungsjahr – Schema?", "AK = Kaufpreis netto − Rabatte/Skonti/nachträgliche Preisminderungen + Nebenkosten (Lieferung, Montage, Fundament); <b>ohne Vorsteuer</b>. Lineare AfA = AK / ND. Inbetriebnahme in der 2. Jahreshälfte → <b>halbe</b> Jahres-AfA. Beispiel: (5.832 − 583,20 + 72 + 106) / 10 / 2 = 271,34."),
  F("bxf4", "b-verm", "Anlagenspiegel: Investitionsdeckung und Anlagenabnutzungsgrad berechnen", "Investitionsdeckung: Investitionen (Zugänge SAV) und AfA d. J. (SAV) gegenüberstellen – Kursformel AfA / Investitionen × 100; die Altprüfung bot 5.000 / 3.070 = 162,87 % an. Abnutzungsgrad = kum. AfA / AK des <b>abnutzbaren</b> SAV × 100 (Grund weglassen): 14.820 / 30.400 = 48,75 %."),
  F("bxf5", "b-ja", "Rückstellung vs. Rücklage; Kapital- vs. Gewinnrücklage", "<b>Rückstellung</b>: Fremdkapital für ungewisse Verbindlichkeiten; Bildung = Aufwand ohne Auszahlung; Verbrauch in gleicher Höhe ergebnisneutral. <b>Rücklage</b>: Eigenkapital. <b>Kapitalrücklage</b>: von außen zugeführt (Agio, Zuzahlungen). <b>Gewinnrücklage</b>: aus dem Jahresüberschuss einbehalten."),
  F("bxf6", "b-kore", "Die drei Teilgebiete der Kostenrechnung und ihre Aufgaben", "<b>Kostenartenrechnung</b> (welche Kosten?): Erfassung aus der FiBu/GuV, neutrale Aufwände ausscheiden, Zusatz-/Anderskosten ansetzen. <b>Kostenstellenrechnung</b> (wo?): Gemeinkosten auf Bereiche verteilen (BAB), Wirtschaftlichkeitskontrolle. <b>Kostenträgerrechnung</b> (wofür?): Kalkulation, Preispolitik, Preisuntergrenzen."),
  F("bxf7", "b-dyn", "Was bedeutet KW &gt; 0, und welche Annahmen gelten (Kapitalmarkt, Rechengrößen)?", "KW &gt; 0: Amortisation + Verzinsung zum Kalkulationszins + Überschuss in Höhe des KW (Barwert in t = 0) → absolut vorteilhaft; dann auch Annuität &gt; 0 und IZF &gt; i. Annahmen: vollkommener Kapitalmarkt (Soll- = Habenzins); Rechengrößen sind <b>Ein- und Auszahlungen</b>, nicht Aufwand/Ertrag. Vermögensänderung am Laufzeitende = Endwert, nicht KW."),
  F("bxf8", "b-finz", "Finanzierungsformen nach Mittelherkunft und Rechtsstellung einordnen", "<table class=\"dt\"><tr><th></th><th>Eigen</th><th>Fremd</th></tr><tr><td>Außen</td><td>Beteiligung: Kapitalerhöhung AG, neuer Gesellschafter, Einlagen</td><td>Kredit: Anleihe, Bankkredit, Lieferantenkredit</td></tr><tr><td>Innen</td><td>Selbstfinanzierung: Gewinnthesaurierung</td><td>Rückstellungsfinanzierung (z. B. Pensionsrückstellungen)</td></tr></table>Abschreibungsgegenwerte / Vermögensumschichtung: Innenfinanzierung ohne neues Kapital.")
);

c.examPrep = {
  format: "Laut Altprüfung ein Moodle-Test „BWL“ mit 31 Fragen und sichtbarem Countdown („Time left“): Single-Choice, Mehrfachauswahl („Select one or more“), Richtig/Falsch und Dropdown-Zuordnungen (Einzel-/Gemeinkosten, fix/variabel, Teilgebiete der KORE, Eigen-/Fremd- bzw. Innen-/Außenfinanzierung). Etwa die Hälfte sind Rechenfragen mit abgebildeten Bilanzen (Friseurstudio-GmbH, Einzelunternehmen) und einem Anlagenspiegel, dazu Kapitalwert, Amortisation, AfA, Break-even und Preisuntergrenze. Dieselben Abbildungen werden für mehrere Fragen wiederverwendet. Punkte je Frage und Gesamtdauer sind in der Quelle nicht zu sehen; laut Kurs: 90 Punkte in 90 Minuten, Minuspunkte für falsche Antworten, Excel erlaubt.",
  sources: ["Altprüfung BWL (Moodle, 31 Fragen, 14 Seiten Screenshots)"],
  strategy: [
    "Kennzahlenformeln wörtlich können (Deckungsgrad A/B, EK-/FK-Quote, Debitorenumschlagsdauer mit Brutto-Umsatz und ø Forderungen, Anlagenabnutzungsgrad des abnutzbaren SAV) – die Distraktoren sind genau die Werte, die bei einem vergessenen Schritt herauskommen.",
    "Bei Bilanzaufgaben zuerst das Eigenkapital korrekt summieren (negative Posten wie ausstehende Einlage oder Verlustvortrag mitnehmen) und mit der Bilanzsumme gegenprüfen.",
    "Rechenfragen in Excel lösen: Barwerte mit =BW bzw. =NBW, IZF mit =IKV oder per Zielwertsuche, und jedes Ergebnis mit den angebotenen Optionen abgleichen.",
    "Richtig/Falsch-Fragen sind meist an einem Wort verfälscht („Bilanz“ statt GuV/FiBu, „am Ende der Laufzeit“ statt t = 0, „unterschiedlich“ bei Soll-/Habenzins, „Erträge/Aufwendungen“ bei dynamischen Verfahren, „erhöhen“ bei Rabatten).",
    "Wegen der Minuspunkte bei Mehrfachauswahl nur sichere Optionen ankreuzen; in der Altprüfung waren mehrere Kreuze falsch (Five-in-One-KG, Innenfinanzierung bei Kapitalerhöhung, Rückstellungsfrage, Rücklagenfrage).",
    "Neue Lücken aus der Altprüfung lernen: Buchführungsgrenzen nach § 189 UGB, URG-Grenzwerte (8 % / 15 Jahre), AK-Ermittlung mit Halbjahres-AfA."
  ],
  focus: [
    { topic: "b-fin", weight: 3, note: "Friseur-Bilanz: Deckungsgrad B und FK-Quote (2 Rechenfragen)" },
    { topic: "b-verm", weight: 3, note: "Anlagenspiegel: Investitionsdeckung und Abnutzungsgrad; Debitorenumschlagsdauer (3 Fragen)" },
    { topic: "b-dyn", weight: 3, note: "8 Fragen: KW-Berechnung, IZF, Annuität, Bedeutung von KW > 0, vollkommener Kapitalmarkt, Zahlungs- statt Erfolgsgrößen" },
    { topic: "b-kore", weight: 3, note: "8 Fragen: Einzel-/Gemeinkosten, fix/variabel, Teilgebiete, unechte Gemeinkosten, Kostenerfassung, AK-Minderungen" },
    { topic: "b-entsch", weight: 3, note: "Break-even bei geändertem DB, Vollkostenpreis und Preisuntergrenze für einen Zusatzauftrag (3 Fragen)" },
    { topic: "b-finz", weight: 2, note: "Dieselben 4 Fälle zweimal: Eigen/Fremd und Innen/Außen" },
    { topic: "b-ja", weight: 2, note: "Jahresergebnis aus EK-Vergleich mit Privatentnahmen; Rückstellung; Kapital- vs. Gewinnrücklage" },
    { topic: "bx-afa", weight: 2, note: "AK mit Rabatt und Nebenkosten, Halbjahres-AfA (Formatkreissäge)" },
    { topic: "b-stat", weight: 2, note: "Amortisationsdauer nach der Durchschnittsmethode mit Restwert" },
    { topic: "bx-pflicht", weight: 1, note: "Buchführungspflicht nach Rechtsform und Umsatz (1 Frage mit Tabelle)" },
    { topic: "bx-urg", weight: 1, note: "URG-Grenzwerte (1 Mehrfachauswahl-Frage)" },
    { topic: "b-cf", weight: 1, note: "nicht direkt gefragt; Grundlage für die fiktive Schuldentilgungsdauer" },
    { topic: "b-bab", weight: 1, note: "nicht direkt gefragt; Teilgebiete der KORE hängen damit zusammen" },
    { topic: "b-db", weight: 1, note: "DB je Stück als Basis für Break-even und Preisuntergrenze" },
    { topic: "b-ertr", weight: 1, note: "nicht direkt gefragt; laut Kurs Teil des Fragenpools zur JA-Analyse" },
    { topic: "b-rw", weight: 1, note: "Grundbegriffe als Basis für die Richtig/Falsch-Fragen" }
  ],
  checklist: [
    { id: "bxc1", topic: "b-fin", text: "Aus einer UGB-Bilanz EK (inkl. negativer Posten, unversteuerte Rücklagen), kfr./lfr. FK und AV bestimmen und Deckungsgrad A und B berechnen" },
    { id: "bxc2", topic: "b-fin", text: "EK- und FK-Quote sowie Liquidität 1./2./3. Grades berechnen" },
    { id: "bxc3", topic: "b-verm", text: "Debitorenumschlagsdauer mit Brutto-Umsatz (+ USt) und ø Forderungen berechnen" },
    { id: "bxc4", topic: "b-verm", text: "Investitionsdeckung (Zugänge vs. AfA SAV) und Anlagenabnutzungsgrad des abnutzbaren SAV aus dem Anlagenspiegel ablesen" },
    { id: "bxc5", topic: "bx-afa", text: "Anlagenspiegel-Zeile vervollständigen (AK 31.12., kum. AfA 31.12., Buchwert)" },
    { id: "bxc6", topic: "bx-afa", text: "AK mit Rabatt, Skonto und Nebenkosten ermitteln und Halbjahres-AfA anwenden" },
    { id: "bxc7", topic: "b-dyn", text: "Kapitalwert mit Abzinsungsfaktoren bzw. Excel =NBW berechnen" },
    { id: "bxc8", topic: "b-dyn", text: "Internen Zinsfuß interpolieren und mit Excel prüfen; Annuität = KW × KWF" },
    { id: "bxc9", topic: "b-dyn", text: "Aussagen zu KW, Annuität, IZF und vollkommenem Kapitalmarkt sicher als richtig oder falsch erkennen" },
    { id: "bxc10", topic: "b-stat", text: "Amortisationsdauer nach Durchschnitts- und Kumulationsmethode berechnen (mit Restwert)" },
    { id: "bxc11", topic: "b-entsch", text: "Break-even-Menge berechnen, auch die Änderung bei neuem DB" },
    { id: "bxc12", topic: "b-entsch", text: "Vollkostenpreis und kurzfristige Preisuntergrenze für einen Zusatzauftrag berechnen" },
    { id: "bxc13", topic: "b-kore", text: "Beliebige Kostenart als Einzel/Gemein und fix/variabel einordnen; unechte Gemeinkosten erklären" },
    { id: "bxc14", topic: "b-kore", text: "Aufgaben der Kostenarten-, Kostenstellen- und Kostenträgerrechnung zuordnen" },
    { id: "bxc15", topic: "b-finz", text: "Finanzierungsformen als Innen/Außen und Eigen/Fremd einordnen" },
    { id: "bxc16", topic: "b-ja", text: "Jahresergebnis per Betriebsvermögensvergleich berechnen (Entnahmen hinzu, Einlagen abziehen)" },
    { id: "bxc17", topic: "b-ja", text: "Ergebnis- und Liquiditätswirkung von Bildung und Verbrauch einer Rückstellung angeben; Kapital- vs. Gewinnrücklage" },
    { id: "bxc18", topic: "bx-pflicht", text: "Buchführungspflicht nach § 189 UGB für eine Umsatztabelle bestimmen" },
    { id: "bxc19", topic: "bx-urg", text: "URG: EMQ und fiktive Schuldentilgungsdauer berechnen; Grenzwerte 8 % / 15 J. (beide)" }
  ],
  tasks: [
    { id: "bxr1", topic: "b-fin", title: "Friseur-Bilanz komplett auswerten (Originaldaten)", pts: 8,
      html: FRISEUR + "<p>Umsatz 2004 exkl. 20 % USt: 416.666,67 €. Unversteuerte Rücklagen zählen zum Eigenkapital; alle Rückstellungen sind kurzfristig; nur 200.000 € der Verbindlichkeiten sind länger als 12 Monate fällig; B.II = nur Forderungen LL.</p><p>Berechne: (a) Eigenkapital, (b) EK- und FK-Quote, (c) Deckungsgrad A und B, (d) Liquidität 1. und 3. Grades, (e) Debitorenumschlagsdauer.</p>",
      solution: "<ol><li><b>EK</b> = 36.336,42 − 18.168,21 + 8.197,88 − 1.233,90 = 25.132,19; + unversteuerte Rücklagen 23.574,71 = <b>48.706,90</b>. Kontrolle: 48.706,90 + 33.468,51 + 401.454,99 = 483.630,40 ✓</li><li><b>EK-Quote</b> = 48.706,90 / 483.630,40 = <b>10,07 %</b>; <b>FK-Quote</b> = 434.923,50 / 483.630,40 = <b>89,93 %</b></li><li>AV = 256.627,78 + 25.033,13 = 281.660,91. <b>DG A</b> = 48.706,90 / 281.660,91 = <b>17,29 %</b>; <b>DG B</b> = (48.706,90 + 200.000) / 281.660,91 = <b>88,30 %</b> → goldene Bilanzregel verletzt</li><li>kfr. FK = 33.468,51 + 201.454,99 = 234.923,50. <b>Liquidität 1. Grades</b> = 22.281,35 / 234.923,50 = <b>9,48 %</b>; kfr. UV = 111.990,72 + 65.432,19 + 22.281,35 = 199.704,26 → <b>Liquidität 3. Grades</b> = <b>85,01 %</b> (&lt; 100 %, kritisch)</li><li>Umsatz brutto = 500.000; ø Forderungen = (65.432,19 + 15.714,73)/2 = 40.573,46; DUH = 12,32; <b>DUD = 29,62 Tage</b></li></ol>" },
    { id: "bxr2", topic: "b-fin", title: "Bilanzkennzahlen mit neuen Zahlen", pts: 8,
      html: `<table class="dt"><tr><th>Aktiva</th><th>€</th><th>Passiva</th><th>€</th></tr><tr><td>Immaterielle VG</td><td>20.000</td><td>Stammkapital</td><td>100.000</td></tr><tr><td>Sachanlagen</td><td>380.000</td><td>Kapitalrücklagen</td><td>20.000</td></tr><tr><td>Finanzanlagen</td><td>40.000</td><td>Gewinnrücklagen</td><td>60.000</td></tr><tr><td>Vorräte</td><td>150.000</td><td>Bilanzgewinn</td><td>25.000</td></tr><tr><td>Forderungen LL (Vorjahr 100.000)</td><td>120.000</td><td>Unversteuerte Rücklagen</td><td>15.000</td></tr><tr><td>Wertpapiere UV</td><td>10.000</td><td>Rückstellungen (davon Abfertigung 40.000 lfr.)</td><td>60.000</td></tr><tr><td>Kassa/Bank</td><td>30.000</td><td>Verbindlichkeiten (davon &gt; 1 Jahr 280.000)</td><td>470.000</td></tr><tr><td><b>Summe</b></td><td><b>750.000</b></td><td><b>Summe</b></td><td><b>750.000</b></td></tr></table><p>Umsatz netto 900.000 €, 20 % USt. Unversteuerte Rücklagen zum EK. Berechne EK-Quote, FK-Quote, Deckungsgrad A und B, Liquidität 1., 2. und 3. Grades sowie die Debitorenumschlagsdauer.</p>`,
      solution: "<ul><li>EK = 100 + 20 + 60 + 25 + 15 = <b>220.000</b>; FK = 530.000; AV = 440.000; UV = 310.000</li><li>EK-Quote = 220/750 = <b>29,33 %</b>; FK-Quote = 530/750 = <b>70,67 %</b></li><li>lfr. FK = 40.000 + 280.000 = 320.000 → DG A = 220/440 = <b>50,00 %</b>; DG B = (220 + 320)/440 = <b>122,73 %</b> ✓</li><li>kfr. FK = 20.000 + 190.000 = 210.000</li><li>Liq. 1. Grades = 30/210 = <b>14,29 %</b>; Liq. 2. Grades = (30 + 10 + 120)/210 = <b>76,19 %</b>; Liq. 3. Grades = 310/210 = <b>147,62 %</b></li><li>ø Forderungen = (120 + 100)/2 = 110.000; Umsatz brutto 1.080.000; DUH = 9,82; <b>DUD = 37,18 Tage</b></li></ul>" },
    { id: "bxr3", topic: "b-verm", title: "Anlagenspiegel: vervollständigen und auswerten", pts: 6,
      html: `<table class="dt"><tr><th>Position</th><th>AK 1.1.</th><th>Zugänge</th><th>Abgänge (AK)</th><th>kum. AfA 1.1.</th><th>AfA d. J.</th><th>kum. AfA auf Abgänge</th></tr><tr><td>Grund</td><td>50.000</td><td>–</td><td>–</td><td>–</td><td>–</td><td>–</td></tr><tr><td>Gebäude</td><td>200.000</td><td>–</td><td>–</td><td>80.000</td><td>4.000</td><td>–</td></tr><tr><td>Maschinen</td><td>120.000</td><td>30.000</td><td>20.000</td><td>60.000</td><td>15.000</td><td>18.000</td></tr><tr><td>BGA</td><td>40.000</td><td>10.000</td><td>–</td><td>25.000</td><td>6.000</td><td>–</td></tr></table><p>(a) AK 31.12., kum. AfA 31.12. und Buchwerte 1.1./31.12. je Position. (b) Investitionsdeckung des SAV (Gegenüberstellung Zugänge und AfA). (c) Anlagenabnutzungsgrad des abnutzbaren SAV.</p>`,
      solution: "<table class=\"dt\"><tr><th></th><th>AK 31.12.</th><th>kum. AfA 31.12.</th><th>BW 31.12.</th><th>BW 1.1.</th></tr><tr><td>Grund</td><td>50.000</td><td>0</td><td>50.000</td><td>50.000</td></tr><tr><td>Gebäude</td><td>200.000</td><td>84.000</td><td>116.000</td><td>120.000</td></tr><tr><td>Maschinen</td><td>130.000</td><td>57.000 (60 + 15 − 18)</td><td>73.000</td><td>60.000</td></tr><tr><td>BGA</td><td>50.000</td><td>31.000</td><td>19.000</td><td>15.000</td></tr><tr><td><b>Summe</b></td><td>430.000</td><td>172.000</td><td>258.000</td><td>245.000</td></tr></table><p>(b) Zugänge 40.000, AfA 25.000: AfA/Investitionen = 62,5 % (Kursformel) bzw. Investitionen/AfA = <b>160 %</b> (Darstellung wie in der Altprüfung) → Es wird mehr investiert als abgeschrieben.</p><p>(c) Abnutzbar (ohne Grund): kum. AfA 172.000 / AK 380.000 = <b>45,26 %</b>.</p>" },
    { id: "bxr4", topic: "bx-afa", title: "Anschaffungskosten und AfA im Anschaffungsjahr", pts: 4,
      html: "<p>Kauf einer Maschine am 18. September: Listenpreis 24.000 € netto, 5 % Rabatt, bezahlt unter Abzug von 2 % Skonto. Transport 600 € netto, Montage 400 € netto, jeweils zzgl. 20 % USt. Inbetriebnahme am 1. Oktober, Nutzungsdauer 8 Jahre, lineare AfA.</p><p>(a) Anschaffungskosten? (b) AfA im Anschaffungsjahr (Halbjahresregel)? (c) Buchwert am 31.12.?</p>",
      solution: "<ol><li>24.000 − 5 % (1.200) = 22.800; − 2 % Skonto (456) = 22.344; + 600 + 400 = <b>23.344 €</b> (USt = Vorsteuer, keine AK)</li><li>Jahres-AfA = 23.344 / 8 = 2.918; Inbetriebnahme in der 2. Jahreshälfte → <b>1.459 €</b></li><li>Buchwert 31.12. = 23.344 − 1.459 = <b>21.885 €</b></li></ol>" },
    { id: "bxr5", topic: "b-dyn", title: "Kapitalwert, Annuität und interner Zinsfuß", pts: 8,
      html: "<p>Investition: Anschaffungsauszahlung 50.000 €, Nutzungsdauer 4 Jahre, kein Restwert. Einzahlungsüberschüsse: J1 15.000, J2 18.000, J3 16.000, J4 12.000. Kalkulationszins 6 %.</p><p>(a) Kapitalwert bei 6 %, (b) Annuität, (c) Kapitalwert bei 10 % und interpolierter interner Zinsfuß, (d) Entscheidung.</p>",
      solution: "<ol><li>Barwerte bei 6 %: 15.000/1,06 = 14.150,94; 18.000/1,06² = 16.019,94; 16.000/1,06³ = 13.433,91; 12.000/1,06⁴ = 9.505,12; Summe 53.109,91 → <b>KW = 3.109,91 €</b></li><li>KWF(6 %, 4 J.) = 0,06 · 1,06⁴ / (1,06⁴ − 1) = 0,288591 → <b>Annuität = 897,49 €</b></li><li>Barwerte bei 10 %: 13.636,36 + 14.876,03 + 12.021,04 + 8.196,16 = 48.729,59 → KW = −1.270,41. IZF ≈ 6 % + 3.109,91 · 4 % / (3.109,91 + 1.270,41) = <b>8,84 %</b> (exakt per Zielwertsuche bzw. =IKV: 8,78 %)</li><li>KW &gt; 0, Annuität &gt; 0, IZF &gt; 6 % → <b>absolut vorteilhaft</b>.</li></ol>" },
    { id: "bxr6", topic: "b-dyn", title: "Kapitalwertvergleich zweier Angebote (Originaldaten)", pts: 4,
      html: "<p>Angebot 1: AK 12.500 €, ND 5 Jahre, kein Restwert, Rückflüsse 980 / 2.500 / 4.500 / 4.910 / 7.000. Angebot 2: KW = 750 €. Kalkulationszins 3 %. Welches Angebot ist besser?</p>",
      solution: "<table class=\"dt\"><tr><th>t</th><th>Rückfluss</th><th>Abzinsungsfaktor 1,03⁻ᵗ</th><th>Barwert</th></tr><tr><td>1</td><td>980</td><td>0,970874</td><td>951,46</td></tr><tr><td>2</td><td>2.500</td><td>0,942596</td><td>2.356,49</td></tr><tr><td>3</td><td>4.500</td><td>0,915142</td><td>4.118,14</td></tr><tr><td>4</td><td>4.910</td><td>0,888487</td><td>4.362,47</td></tr><tr><td>5</td><td>7.000</td><td>0,862609</td><td>6.038,26</td></tr><tr><td colspan=\"3\">Summe</td><td>17.826,82</td></tr></table><p>KW = 17.826,82 − 12.500 = <b>5.326,82 €</b> &gt; 750 € → <b>Angebot 1</b>.</p>" },
    { id: "bxr7", topic: "b-stat", title: "Statische Amortisation: Durchschnitts- vs. Kumulationsmethode", pts: 5,
      html: "<p>(a) Projekt A der Altprüfung: AK 112.000, RW 12.000, ND 5, Gewinne 12.000 / 24.000 / 20.000 / 26.000 / 32.000 – Amortisationsdauer nach der Durchschnittsmethode?<br>(b) Projekt B: AK 165.000, RW 15.000, ND 5, Gewinne 59.000 / 46.000 / 28.000 / 24.000 / 23.000 – Durchschnittsmethode?<br>(c) Neues Projekt C: AK 80.000, RW 0, ND 4, Gewinne 8.000 / 12.000 / 15.000 / 13.000 – Durchschnitts- und Kumulationsmethode.</p>",
      solution: "<ol><li>A: AfA = 100.000/5 = 20.000; ø Gewinn = 22.800; Rückfluss 42.800 → 100.000 / 42.800 = <b>2,34 Jahre</b></li><li>B: AfA = 150.000/5 = 30.000; ø Gewinn = 180.000/5 = 36.000; Rückfluss 66.000 → 150.000 / 66.000 = <b>2,27 Jahre</b></li><li>C: AfA = 20.000; ø Gewinn = 12.000 → 80.000 / 32.000 = <b>2,50 Jahre</b>. Kumulation: Rückflüsse 28.000 / 32.000 / 35.000 → kumuliert 28.000, 60.000, 95.000; Rest 20.000 / 35.000 = 0,57 → <b>2,57 Jahre</b></li></ol>" },
    { id: "bxr8", topic: "b-entsch", title: "Break-even, Vollkostenpreis, Preisuntergrenze", pts: 6,
      html: "<p>Fixkosten 240.000 €/Jahr, Preis 30 €, variable Kosten 18 €/Stück, Kapazität 30.000 Stück, geplanter Absatz 25.000 Stück.</p><p>(a) Break-even-Menge. (b) Wie viel Stück mehr sind nötig, wenn der Preis auf 28 € sinkt? (c) Gewinn bei 25.000 Stück zum Preis von 30 €. (d) Vollkostenpreis bei 25.000 Stück. (e) Preisuntergrenze für einen Zusatzauftrag über 5.000 Stück, wenn die Fixkosten schon gedeckt sind.</p>",
      solution: "<ol><li>DB = 30 − 18 = 12 → BEP = 240.000 / 12 = <b>20.000 Stück</b></li><li>DB neu = 10 → BEP = 24.000 → <b>+4.000 Stück</b></li><li>25.000 · 12 − 240.000 = <b>60.000 €</b></li><li>240.000 / 25.000 + 18 = 9,60 + 18 = <b>27,60 €</b></li><li>freie Kapazität, Fixkosten gedeckt → kurzfristige PUG = kv = <b>18 €</b></li></ol>" },
    { id: "bxr9", topic: "b-kore", title: "Kostenarten zuordnen", pts: 4,
      html: "<p>Ordne jede Kostenart zu: (1) Einzel- oder Gemeinkosten, (2) fix oder variabel: Fertigungsmaterial · Akkordlohn · Zeitlohn des Lagerarbeiters · Hilfsstoffe (Schrauben, Leim) · Stromkosten der Fertigung (ohne eigenen Zähler) · Gehalt des Geschäftsführers · Miete der Halle · kalkulatorische Zinsen · kalkulatorische Abschreibung (zeitabhängig) · Vertriebsprovision je verkauftem Stück.</p>",
      solution: "<table class=\"dt\"><tr><th>Kostenart</th><th>Zurechnung</th><th>Verhalten</th></tr><tr><td>Fertigungsmaterial</td><td>Einzel</td><td>variabel</td></tr><tr><td>Akkordlohn</td><td>Einzel</td><td>variabel</td></tr><tr><td>Zeitlohn Lagerarbeiter</td><td>Gemein</td><td>fix</td></tr><tr><td>Hilfsstoffe</td><td>unechte Gemeinkosten</td><td>variabel</td></tr><tr><td>Strom Fertigung</td><td>Gemein</td><td>überwiegend variabel</td></tr><tr><td>Gehalt Geschäftsführer</td><td>Gemein</td><td>fix</td></tr><tr><td>Hallenmiete</td><td>Gemein</td><td>fix</td></tr><tr><td>kalk. Zinsen</td><td>Gemein</td><td>fix</td></tr><tr><td>kalk. AfA (zeitabhängig)</td><td>Gemein</td><td>fix</td></tr><tr><td>Vertriebsprovision je Stück</td><td>Sondereinzelkosten des Vertriebs</td><td>variabel</td></tr></table><p>Merke: Einzel/Gemein = Zurechenbarkeit auf den Kostenträger; fix/variabel = Verhalten bei Beschäftigungsänderung.</p>" },
    { id: "bxr10", topic: "b-finz", title: "Finanzierungsformen einordnen", pts: 4,
      html: "<p>Ordne nach Mittelherkunft (innen/außen) und Rechtsstellung (Eigen/Fremd): (1) 6-%-Anleihe mit 15 Jahren Laufzeit, (2) Kapitalerhöhung einer AG, (3) Thesaurierung von Gewinnen, (4) neuer voll haftender Gesellschafter einer OG, (5) Bankkredit, (6) Lieferantenkredit, (7) Bildung von Pensionsrückstellungen, (8) Privateinlage des Einzelunternehmers.</p>",
      solution: "<table class=\"dt\"><tr><th>Fall</th><th>Herkunft</th><th>Rechtsstellung</th></tr><tr><td>1 Anleihe</td><td>Außen</td><td>Fremd</td></tr><tr><td>2 Kapitalerhöhung AG</td><td>Außen</td><td>Eigen</td></tr><tr><td>3 Gewinnthesaurierung</td><td>Innen</td><td>Eigen</td></tr><tr><td>4 neuer Gesellschafter</td><td>Außen</td><td>Eigen</td></tr><tr><td>5 Bankkredit</td><td>Außen</td><td>Fremd</td></tr><tr><td>6 Lieferantenkredit</td><td>Außen</td><td>Fremd</td></tr><tr><td>7 Pensionsrückstellungen</td><td>Innen</td><td>Fremd</td></tr><tr><td>8 Privateinlage</td><td>Außen</td><td>Eigen</td></tr></table>" },
    { id: "bxr11", topic: "b-ja", title: "Jahresergebnis per EK-Vergleich und Rückstellungen", pts: 5,
      html: "<p>(a) Einzelunternehmen: EK 1.1. 120.000 €, EK 31.12. 135.000 €. Der Inhaber hat monatlich 2.000 € privat entnommen und im Juni 10.000 € aus einer Erbschaft eingelegt. Jahresergebnis?<br>(b) Original Glaspeter: EK 98.000 → 82.600, Entnahmen 12 × 1.000. Jahresergebnis?<br>(c) 2x24 wird eine Rückstellung für Prozesskosten von 10.000 € gebildet; 2x25 kommt die Rechnung über 8.500 € und wird bezahlt. Ergebnis- und Liquiditätswirkung je Jahr?</p>",
      solution: "<ol><li>135.000 − 120.000 + 24.000 − 10.000 = <b>Gewinn 29.000 €</b></li><li>82.600 − 98.000 + 12.000 = <b>Verlust 3.400 €</b></li><li>2x24: Aufwand 10.000 → Ergebnis −10.000; Liquidität unverändert. 2x25: Zahlung 8.500 (Liquidität −8.500), Verbrauch der Rückstellung; die nicht benötigten 1.500 werden aufgelöst → <b>Ertrag +1.500</b>.</li></ol>" },
    { id: "bxr12", topic: "bx-urg", title: "URG-Kennzahlen berechnen", pts: 4,
      html: "<p>GmbH: Eigenmittel 60.000 €, Gesamtkapital 1.000.000 €, Rückstellungen 90.000 €, Verbindlichkeiten 850.000 €, flüssige Mittel 40.000 €, keine Wertpapiere im UV. Mittelüberschuss aus der gewöhnlichen Geschäftstätigkeit: Fall A 50.000 €, Fall B 70.000 €. Liegt die Vermutung eines Reorganisationsbedarfs vor?</p>",
      solution: "<ul><li>EMQ = 60.000 / 1.000.000 = <b>6 %</b> (&lt; 8 %)</li><li>Schulden netto = 90.000 + 850.000 − 40.000 = 900.000</li><li>Fall A: SDT = 900.000 / 50.000 = <b>18 Jahre</b> (&gt; 15) → beide Bedingungen erfüllt → <b>Vermutung des Reorganisationsbedarfs</b></li><li>Fall B: SDT = 900.000 / 70.000 = <b>12,86 Jahre</b> (≤ 15) → <b>keine</b> Vermutung</li></ul>" }
  ]
};
})();
