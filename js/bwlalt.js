/* StudyOS · BWL 2: die Altprüfung 1:1 (31 Fragen in Originalreihenfolge, Originaltexte und -antworten)
   Prüfungsmodus: 90 Minuten, 90 Punkte, Minuspunkte, Auswertung nach Abgabe, Notenschlüssel der VO.
   Lernmodus: ohne Zeit, jede Frage sofort prüfbar. Ein laufender Versuch wird in S().bwlalt gespeichert.
   Start: Prüfungstrainer von BWL 2 oder go("exam", "bwlalt"). */
(function () {
const { $, $$, esc, PAGES, CBY } = App;
const S = () => App.S();
const LET = i => String.fromCharCode(97 + i);
const n2 = v => v.toLocaleString("de-AT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtP = v => (Math.round(v * 100) / 100).toString().replace(".", ",");
const TW = h => `<div class="alt-tw">${h}</div>`;

/* ---------- Tabellen aus der Angabe ---------- */
const BIL = `<p class="alt-cap">Friseu███ Gesellschaft m.b.H., 9500 Villach · Landesgericht Klagenfurt<br><b>Zu veröffentlichende Bilanz einer kleinen Gesellschaft mit beschränkter Haftung</b></p>` + TW(`<table class="dt alt-tab">
<tr><th>Aktiva</th><th>2004</th><th>Vorjahr</th></tr>
<tr><td><b>A. Anlagevermögen</b></td><td></td><td></td></tr>
<tr><td>I Immaterielle Vermögensgegenstände</td><td></td><td></td></tr>
<tr><td>II Sachanlagen</td><td>256.627,78</td><td>70.478,14</td></tr>
<tr><td>III Finanzanlagen</td><td>25.033,13</td><td>22.277,01</td></tr>
<tr><td><b>B. Umlaufvermögen</b></td><td></td><td></td></tr>
<tr><td>I Vorräte</td><td>111.990,72</td><td>64.861,25</td></tr>
<tr><td>II Forderungen und sonstige Vermögensgegenstände</td><td>65.432,19</td><td>15.714,73</td></tr>
<tr><td>III Wertpapiere und Anteile</td><td></td><td></td></tr>
<tr><td>IV Kassenbestand, Schecks, Guthaben bei Kreditinstituten</td><td>22.281,35</td><td>13.475,52</td></tr>
<tr><td><b>C. Rechnungsabgrenzungsposten</b></td><td>2.265,23</td><td>0,00</td></tr>
<tr class="alt-sum"><td>Summe Aktiva</td><td>483.630,40</td><td>186.806,65</td></tr>
<tr><th>Passiva</th><th>2004</th><th>Vorjahr</th></tr>
<tr><td><b>A. Eigenkapital</b></td><td></td><td></td></tr>
<tr><td>I Nennkapital (Stammkapital)</td><td>36.336,42</td><td>36.336,42</td></tr>
<tr><td>II Kapitalrücklagen (ausstehende Einlage)</td><td>−18.168,21</td><td>−18.168,21</td></tr>
<tr><td>III Gewinnrücklagen</td><td></td><td></td></tr>
<tr><td>IV Bilanzgewinn (Bilanzverlust)</td><td>8.197,88</td><td>26.617,38</td></tr>
<tr><td>&nbsp;&nbsp;&nbsp;Gewinnvortrag/Verlustvortrag</td><td>−1.233,90</td><td>−27.851,28</td></tr>
<tr><td><b>B. Unversteuerte Rücklagen</b></td><td>23.574,71</td><td>23.574,71</td></tr>
<tr><td><b>C. Rückstellungen</b></td><td>33.468,51</td><td>11.285,26</td></tr>
<tr><td><b>D. Verbindlichkeiten</b></td><td>401.454,99</td><td>135.012,37</td></tr>
<tr><td><b>E. Rechnungsabgrenzungsposten</b></td><td></td><td></td></tr>
<tr class="alt-sum"><td>Summe Passiva</td><td>483.630,40</td><td>186.806,65</td></tr></table>`);
const AS_ROWS = [
  ["<b>I. Immaterielles Vermögen</b>"],
  ["Konzessionen, …", "4.000", "-", "-", "-", "4.000", "2.000", "500", "-", "-", "-", "2.500", "1.500", "2.000"],
  ["Firmenwert", "-", "8.000", "-", "-", "8.000", "-", "1.000", "-", "-", "-", "1.000", "7.000", "-"],
  ["<b>Summe:</b>", "4.000", "8.000", "-", "-", "12.000", "2.000", "1.500", "-", "-", "-", "3.500", "8.500", "2.000", 1],
  ["<b>II. Sachanlagen</b>"], ["Grundstücke"],
  ["davon Gebäude", "8.000", "-", "-", "-", "8.000", "5.000", "320", "-", "-", "-", "5.320", "2.680", "3.000"],
  ["davon Grund", "4.000", "-", "3.000", "-", "1.000", "-", "-", "-", "-", "-", "-", "1.000", "4.000"],
  ["Techn. Anlagen", "15.000", "4.000", "1.500", "-", "17.500", "4.800", "2.000", "-", "300", "-", "6.500", "11.000", "10.000"],
  ["Andere Anlagen", "4.500", "1.000", "600", "-", "4.900", "2.550", "750", "-", "300", "-", "3.000", "1.900", "1.950"],
  ["<b>Summe:</b>", "31.500", "5.000", "5.100", "-", "31.400", "12.350", "3.070", "-", "600", "-", "14.820", "16.580", "18.950", 1],
  ["<b>III. Finanzanlagen</b>"],
  ["Anteile an verb. U.", "12.000", "3.000", "-", "-", "15.000", "1.000", "-", "-", "-", "-", "1.000", "14.000", "11.000"],
  ["Wertpapier des A.", "8.000", "-", "2.000", "-", "6.000", "1.100", "200", "-", "200", "-", "1.100", "4.900", "7.100"],
  ["<b>Summe:</b>", "20.000", "3.000", "2.000", "-", "21.000", "2.100", "200", "-", "200", "-", "2.100", "18.900", "18.100", 1],
  ["<b>Summe:</b>", "55.500", "16.000", "7.100", "-", "64.400", "16.450", "4.770", "-", "800", "-", "20.420", "43.980", "39.050", 1]
];
const AS = `<p class="alt-cap"><b>(vereinfachter) Anlagenspiegel</b> · Ventec-GmbH, Stadlweg 5, 9020 Klagenfurt am Wörthersee · alle Werte in TEUR</p>` + TW(`<table class="dt alt-tab alt-small">
<tr><th></th><th colspan="5">Anschaffungs- bzw. Herstellungskosten</th><th colspan="6">kumulierte Abschreibungen</th><th colspan="2">Buchwerte</th></tr>
<tr><th></th><th>AK/HSK 1.1.</th><th>Zugänge</th><th>Abgänge</th><th>Umbu.</th><th>AK/HSK 31.12.</th><th>kum. 1.1.</th><th>Abschrei&shy;bungen</th><th>Zuschrei&shy;bungen</th><th>Abgänge</th><th>Umbu&shy;chungen</th><th>kum. 31.12.</th><th>31.12.</th><th>1.1.</th></tr>
${AS_ROWS.map(r => `<tr${r[14] ? ' class="alt-sum"' : ""}>${r.length === 1 ? `<td colspan="14">${r[0]}</td>` : r.slice(0, 14).map(x => `<td>${x}</td>`).join("")}</tr>`).join("")}</table>`);
const GLAS = (y, rows, ek, lv, sv, sum) => `<p class="alt-cap"><b>Schlussbilanz Glaspeter ${y}</b></p><table class="dt alt-tab"><tr><th>Vermögen (Aktiva)</th><th></th><th>Kapital (Passiva)</th><th></th></tr>
<tr><td><b>Anlagevermögen</b></td><td></td><td><b>Eigenkapital</b></td><td>${ek}</td></tr>
<tr><td>EDV-Anlagen</td><td>${rows[0]}</td><td><b>Fremdkapital</b></td><td></td></tr>
<tr><td>Geschäftseinrichtung</td><td>${rows[1]}</td><td>Lieferverbindlichkeiten</td><td>${lv}</td></tr>
<tr><td>Wertpapiere</td><td>${rows[2]}</td><td>sonst. Verbindlichkeiten</td><td>${sv}</td></tr>
<tr><td><b>Umlaufvermögen</b></td><td></td><td></td><td></td></tr>
<tr><td>Vorräte</td><td>${rows[3]}</td><td></td><td></td></tr>
<tr><td>Lieferforderungen</td><td>${rows[4]}</td><td></td><td></td></tr>
<tr><td>Kassa, Bankbestand</td><td>${rows[5]}</td><td></td><td></td></tr>
<tr class="alt-sum"><td>Gesamt</td><td>${sum}</td><td>Gesamt</td><td>${sum}</td></tr></table>`;
const KR = `<p>Aus der Kostenrechnung erhalten Sie folgende Daten:</p><table class="dt alt-tab alt-narrow"><tr><td>Fixkosten pro Jahr</td><td>€ 300.000</td></tr><tr><td>Variable Kosten pro Beratungsstunde</td><td>€ 4</td></tr><tr><td>Kapazität pro Jahr</td><td>20.000 Beratungsstunden</td></tr></table><p>Sie planen 18.000 Beratungsstunden anzubieten.</p>`;
const KOA = ["kalkulatorische Zinsen.", "Fertigungsmaterial (Holz).", "Abschreibung des Verwaltungsgebäudes.", "Gehalt des Personalchefs.", "Akkordlöhne der Fertigung."];
const FIN = ["Das Unternehmen begibt eine 6-%-ige Unternehmensanleihe mit einer Laufzeit von 15 Jahren.", "Eine Aktiengesellschaft erhöht ihr gezeichnetes Kapital.", "Erzielte Gewinne werden im Unternehmen einbehalten und für Investitionszwecke verwendet.", "Eine Personengesellschaft nimmt einen neuen voll haftenden Gesellschafter auf."];

/* ---------- Die 31 Fragen ----------
   t: tf (a = true/false) · one (a = Index) · multi (a = [Indizes]) · match (rows = [[Text, richtige Wahl]], choices)
   trap: Frage gehört zu den 10 Fallen aus der echten Altprüfung */
const Q = [
  { t: "one", pts: 3, topic: "b-entsch", q: "Die Fixkosten belaufen sich auf € 100.000,- pro Jahr. Der Deckungsbeitrag pro Stück beträgt anfänglich € 2,50. Er soll auf € 2 reduziert werden. Wieviele Stück müssten mehr produziert/abgesetzt werden, damit sich nach wie vor weder ein Gewinn noch ein Verlust ergibt.",
    opts: ["4.000 Stück", "48.000 Stück", "10.000 Stück", "40.000 Stück", "42.000 Stück"], a: 2,
    why: "Break-even-Menge = Fixkosten / DB pro Stück. Vorher 100.000 / 2,50 = 40.000 Stück, nachher 100.000 / 2 = 50.000 Stück. Es braucht also <b>10.000 Stück mehr</b>. 40.000 ist nur die alte Break-even-Menge." },
  { t: "tf", pts: 2, topic: "b-kore", q: "Anschaffungspreisminderungen, wie Rabatte und Skonti, erhöhen die Bemessungsgrundlage zur Berechnung der kalkulatorischen Abschreibung.", a: false,
    why: "Rabatte und Skonti <b>mindern</b> die Anschaffungskosten und damit die Bemessungsgrundlage. Nebenkosten (Lieferung, Montage) erhöhen sie." },
  { t: "tf", pts: 2, topic: "b-dyn", q: "Der interne Zinssatz einer Investition ist der Zinssatz, bei dem der Kapitalwert null ist.", a: true,
    why: "Genau so ist der interne Zinsfuß definiert: KW(i) = 0." },
  { t: "multi", pts: 3, topic: "bx-pflicht", trap: true, q: `Welche(s) der folgenden Unternehmen muss/müssen im Jahr 20x7 verpflichtend eine doppelte Buchhaltung führen?${TW(`<table class="dt alt-tab"><tr><th>Fall Nr.</th><th>Unternehmen</th><th>Rechtsform</th><th>Umsatz 20x5</th><th>Umsatz 20x6</th><th>Umsatz 20x7</th></tr>
<tr><td>1</td><td>Five in One</td><td>KG</td><td>580.000,00 €</td><td>720.000,00 €</td><td>680.000,00 €</td></tr>
<tr><td>2</td><td>Weilharter</td><td>GmbH</td><td>180.000,00 €</td><td>320.000,00 €</td><td>340.000,00 €</td></tr>
<tr><td>3</td><td>Dieter Fasching</td><td>e.U.</td><td>68.000,00 €</td><td>72.000,00 €</td><td>190.000,00 €</td></tr>
<tr><td>4</td><td>Weingärten</td><td>AG</td><td>380.000,00 €</td><td>280.000,00 €</td><td>290.000,00 €</td></tr>
<tr><td>5</td><td>Uschis Uhren</td><td>e.U.</td><td>24.000,00 €</td><td>28.000,00 €</td><td>32.000,00 €</td></tr></table>`)}`,
    opts: ["Dieter Fasching e.U.", "Weingärten AG", "Five in One KG", "Uschis Uhren e.U.", "Weilharter GmbH"], a: [1, 4],
    why: "Kapitalgesellschaften (GmbH, AG) sind <b>immer</b> rechnungslegungspflichtig, egal wie hoch der Umsatz ist. Einzelunternehmen und Personengesellschaften erst, wenn sie <b>in zwei aufeinanderfolgenden Jahren</b> mehr als 700.000 € Umsatz haben (oder einmal mehr als 1 Mio. €). Five in One lag nur 20x6 darüber, das reicht nicht." },
  { t: "match", pts: 5, topic: "b-kore", q: "Klassifizieren Sie die folgenden Kostenarten:", choices: ["Einzelkosten", "Gemeinkosten"],
    rows: [[KOA[0], 1], [KOA[1], 0], [KOA[2], 1], [KOA[3], 1], [KOA[4], 0]],
    why: "Einzelkosten lassen sich dem Produkt direkt zurechnen: Fertigungsmaterial und Akkordlöhne der Fertigung. Kalkulatorische Zinsen, die Abschreibung des Verwaltungsgebäudes und das Gehalt des Personalchefs betreffen den ganzen Betrieb und sind Gemeinkosten." },
  { t: "tf", pts: 2, topic: "b-dyn", q: "Ist die Annuität einer Investition größer null, dann ist auch die Verzinsung des gebundenen Kapitals höher als der Kalkulationszins.", a: true,
    why: "Annuität > 0 ⇔ Kapitalwert > 0 ⇔ interner Zinsfuß > Kalkulationszins." },
  { t: "one", pts: 3, topic: "b-fin", trap: true, q: `Die Bilanz eines Friseurstudios sieht wie folgt aus:${BIL}<p>Sofern Sie die unversteuerten Rücklagen zum Eigenkapital zählen, sämtliche Rückstellungen in den nächsten 4 Monaten aufzulösen/zu verwenden sind und nur € 200.000 der Verbindlichkeiten eine Fälligkeit nach 12 Monaten aufweisen, beläuft sich der Deckungsgrad B zum 31.12.2004 demnach auf:</p>`,
    opts: ["17,29 %", "19,50 %", "7,50 %", "15,11 %", "88,30 %"], a: 4,
    why: "Deckungsgrad B = (EK + langfristiges FK) / Anlagevermögen.<br>EK = 36.336,42 − 18.168,21 + 8.197,88 − 1.233,90 = 25.132,19, plus unversteuerte Rücklagen 23.574,71 = <b>48.706,90</b>.<br>Langfristiges FK = 200.000 (die Rückstellungen sind in 4 Monaten weg, also kurzfristig).<br>AV = 256.627,78 + 25.033,13 = <b>281.660,91</b>.<br>(48.706,90 + 200.000) / 281.660,91 = <b>88,30 %</b>." },
  { t: "multi", pts: 3, topic: "b-dyn", q: "Ein positiver Kapitalwert bedeutet:", opts: [
      "Die Investition erbringt die Amortisation des eingesetzten Kapitals und eine Verzinsung des gebundenen Kapitals in Höhe des Kalkulationszinssatzes, jedoch keinen Überschuss.",
      "Die Investition erbringt neben der Amortisation des eingesetzten Kapitals und einer Verzinsung des gebundenen Kapitals in Höhe des Kalkulationszinssatzes einen zusätzlichen Überschuss in Höhe des Kapitalwerts.",
      "Die Investition erbringt neben der Amortisation des eingesetzten Kapitals und einer Verzinsung des gebundenen Kapitals in Höhe des Kalkulationszinssatzes keinen zusätzlichen Überschuss in Höhe des Kapitalwerts.",
      "Die absolute Vorteilhaftigkeit der Investition ist gegeben.", "Die absolute Vorteilhaftigkeit der Investition ist nicht gegeben."], a: [1, 3],
    why: "KW > 0: Kapital kommt zurück, wird zum Kalkulationszins verzinst, und darüber hinaus bleibt ein Überschuss in Höhe des KW. Damit ist die Investition absolut vorteilhaft. Option (a) beschreibt KW = 0." },
  { t: "match", pts: 4, topic: "b-finz", q: "Klassifizieren Sie die folgenden Finanzierungsformen:", choices: ["Eigenfinanzierung", "Fremdfinanzierung"],
    rows: [[FIN[0], 1], [FIN[1], 0], [FIN[2], 0], [FIN[3], 0]],
    why: "Nach der <b>Rechtsstellung</b> des Kapitalgebers: Die Anleihe ist Fremdkapital. Kapitalerhöhung, einbehaltene Gewinne (Selbstfinanzierung) und ein neuer Gesellschafter bringen Eigenkapital." },
  { t: "tf", pts: 2, topic: "b-kore", trap: true, q: "Ausgangspunkt der Kostenerfassung ist für den überwiegenden Teil der Kosten das Zahlenmaterial aus der Bilanz.", a: false,
    why: "Die Kosten werden überwiegend aus der <b>Finanzbuchhaltung bzw. der GuV</b> übernommen (Aufwand → Kosten, neutrale Aufwände raus, Zusatz- und Anderskosten dazu). Die Bilanz ist eine Bestandsrechnung zum Stichtag." },
  { t: "multi", pts: 3, topic: "b-verm", q: `Ermitteln Sie mit dem in der Folge abgebildeten Anlagenspiegel die Investitionsdeckung des <b>GESAMTEN SACHANLAGEVERMÖGENS</b> - einfachheitshalber rein durch die Gegenüberstellung von <b>Investitionen und Abschreibungen</b> - der Ventec GmbH:${AS}<p>Die Investitionsdeckung beträgt:</p>`,
    opts: ["rund 26,20 %", "rund 146,23 %", "rund 165,55 %", "rund 7,41 %", "rund 8,59 %", "rund 204,23 %", "rund 162,87 %", "rund 140,20 %"], a: [6],
    why: "Investitionen (Zugänge Sachanlagen) / Abschreibungen des Jahres = 5.000 / 3.070 = <b>162,87 %</b>. Über 100 %: Es wird mehr investiert als abgeschrieben, das Sachanlagevermögen wächst." },
  { t: "multi", pts: 3, topic: "b-entsch", q: `${KR}<p>Zu welchem „Schnäppchenpreis“ (=Minimalpreis) könnten Sie die noch zur Verfügung stehende Kapazität von 2.000 weiteren Beratungsstunden anbieten, wenn Sie davon ausgehen, dass Sie für die ersten 18.000 Beratungsstunden den Preis zu Vollkosten erhalten und mit dem Zusatzauftrag keinen Gewinn mehr anstreben?</p>`,
    opts: ["€ 19,-", "€ 16,66", "€ 4,-", "€ 21,91", "€ 2,-", "€ 15,-"], a: [2],
    why: "Die Fixkosten sind über die ersten 18.000 Stunden schon gedeckt. Für den Zusatzauftrag ist die kurzfristige Preisuntergrenze die <b>variable Kosten</b>: € 4 pro Stunde." },
  { t: "match", pts: 4, topic: "b-kore", q: "Welchen <i>Teilgebieten der Kostenrechnung</i> sind folgende Aufgaben zuzuordnen?", choices: ["Kostenartenrechnung", "Kostenstellenrechnung", "Kostenträgerrechnung"],
    rows: [["Überwachung der Wirtschaftlichkeit einzelner Betriebsbereiche.", 1], ["Verteilung der Gemeinkosten auf die Leistungsbereiche in denen sie entstanden sind.", 1], ["Ausscheiden von neutralen Aufwänden und Ansetzen von Zusatz- und/oder Anderskosten.", 0], ["Bereitstellung von Informationen für preispolitische Entscheidungen, wie Festlegung von Preisuntergrenzen.", 2]],
    why: "Kostenarten: <i>Welche</i> Kosten? (Abgrenzung zur Fibu). Kostenstellen: <i>Wo</i>? (BAB, Gemeinkosten verteilen, Wirtschaftlichkeit je Bereich). Kostenträger: <i>Wofür</i>? (Kalkulation, Preise, Preisuntergrenzen)." },
  { t: "multi", pts: 3, topic: "b-ja", trap: true, q: `<p>Ihr Unternehmen: Glaspeter, Einzelunternehmen</p><p>Sie sehen hier die beiden Schlussbilanzen des Einzelunternehmens Glaspeter aus den Jahren 20x5 und 20x6.</p>${TW(GLAS("20x5", ["12.000,00", "15.000,00", "3.000,00", "26.000,00", "41.000,00", "48.000,00"], "98.000,00", "32.000,00", "15.000,00", "145.000,00"))}${TW(GLAS("20x6", ["10.500,00", "12.000,00", "3.000,00", "24.600,00", "38.000,00", "27.000,00"], "82.600,00", "18.500,00", "14.000,00", "115.100,00"))}<p>Zusätzlicher Hinweis: Peter Stadler, der Inhaber, hat im Jahr 20x6 jeden Monat € 1.000,00 vom Geschäftsbankkonto auf sein privates Bankkonto überwiesen.</p><p>Berechnen Sie für das Unternehmen mit den gegebenen Daten das Jahresergebnis 20x6 und wählen Sie die richtige/n Antwort/en.</p>`,
    opts: ["Das Jahresergebnis ist ein Gewinn von € 15.400,00.", "Das Jahresergebnis ist ein Verlust von € 27.400,00.", "Das Jahresergebnis ist ein Verlust von € 15.400,00", "Das Jahresergebnis ist ein Verlust von € 3.400,00.", "Das Jahresergebnis ist ein Gewinn von € 27.400,00."], a: [3],
    why: "Eigenkapitalvergleich: EK Ende − EK Anfang + Entnahmen − Einlagen = 82.600 − 98.000 + 12.000 = <b>−3.400 €</b>, also ein Verlust von 3.400 €. Die Privatentnahmen (12 × 1.000) haben das EK gesenkt, sind aber kein Verlust. −27.400 entsteht, wenn man sie abzieht statt dazuzählt." },
  { t: "tf", pts: 2, topic: "b-dyn", trap: true, q: "Im vollkommenen Kapitalmarkt sind Haben- und Sollzinssätze unterschiedlich hoch.", a: false,
    why: "Eine Annahme des vollkommenen Kapitalmarkts ist: Soll- und Habenzins sind <b>gleich</b>, man kann zum Kalkulationszins unbegrenzt Geld anlegen und aufnehmen." },
  { t: "tf", pts: 2, topic: "b-dyn", trap: true, q: "Der Kapitalwert einer Investition ist die Vermögensänderung des Investors am Ende der Laufzeit der Investition.", a: false,
    why: "Der Kapitalwert ist die Vermögensänderung bezogen auf den Zeitpunkt <b>t = 0</b> (heute). Am Ende der Laufzeit wäre es der Endwert." },
  { t: "match", pts: 4, topic: "b-finz", trap: true, q: "Klassifizieren Sie die folgenden Finanzierungsformen:", choices: ["Außenfinanzierung", "Innenfinanzierung"],
    rows: [[FIN[0], 0], [FIN[1], 0], [FIN[2], 1], [FIN[3], 0]],
    why: "Nach der <b>Herkunft</b> des Kapitals: Anleihe, Kapitalerhöhung und neuer Gesellschafter bringen Geld von außen (Außenfinanzierung). Nur einbehaltene Gewinne stammen aus dem Umsatzprozess (Innenfinanzierung)." },
  { t: "one", pts: 3, topic: "b-fin", q: `Die Bilanz eines Friseurstudios sieht wie folgt aus:${BIL}<p>Im Jahr 2004 hat der Umsatz exkl. 20 % USt € 416.666,67 betragen. Die Position B.II enthält ausschließlich Forderungen aus Lieferungen und Leistungen. Unternehmensweit kommt nur der 20%ige USt-Satz zur Anwendung.</p><p>Die Debitorenumschlagsdauer in Tagen (bei 365 Tagen im Jahr) beträgt demnach:</p>`,
    opts: ["11,50 Tage", "2,00 Tage", "29,62 Tage", "4,80 Tage", "28,70 Tage"], a: 2,
    why: "Forderungen enthalten USt, also Umsatz brutto: 416.666,67 × 1,2 = 500.000.<br>Ø Forderungen = (65.432,19 + 15.714,73) / 2 = 40.573,46.<br>Debitorendauer = 40.573,46 / 500.000 × 365 = <b>29,62 Tage</b>." },
  { t: "multi", pts: 3, topic: "bx-afa", q: `<p>Die Firma "Tischlerei Heinrich GmbH" kauft am 23. Juni dJ bei der Firma "CRAFT AG" eine neue Formatkreissäge um € 5.832,00 zuzüglich 20 % USt auf Ziel.</p><p>Die Kreissäge soll in der Produktion eingesetzt werden.</p><ul><li>Die "CRAFT AG" verrechnet am 02. Juli dJ € 72,00 zuzüglich 20 % USt für die Lieferung und € 106,00 zuzüglich 20 % USt für die Montage.</li><li>Da die Maschine nicht die vereinbarte Schnitttiefe erreicht, gewährt der Händler am 04. Juli dJ einen nachträglichen Rabatt von 10 % auf den Kaufpreis der Maschine.</li><li>Der gesamte ausstehende Betrag wird am 10. Juli dJ mittels Banküberweisung an die Firma "CRAFT AG" beglichen.</li><li>Die Maschine wird am 07. Juli dJ in Betrieb genommen, wobei die Nutzungsdauer mit 10 Jahren festgelegt wurde.</li></ul><p>Wählen Sie jenen Betrag aus, der dieses Jahr auf Seiten der Tischlerei Heinrich GmbH als laufende Abschreibung zu verbuchen ist.</p>`,
    opts: ["€ 271,34", "€ 265,65", "€ 300,50", "Keiner dieser Beträge ist richtig.", "€ 542,68"], a: [0],
    why: "Anschaffungskosten (ohne USt, die ist Vorsteuer): 5.832 − 10 % Rabatt = 5.248,80, plus Lieferung 72 und Montage 106 = <b>5.426,80</b>. Jahres-AfA = 542,68. Inbetriebnahme im 2. Halbjahr (7. Juli) → <b>Halbjahres-AfA 271,34 €</b>." },
  { t: "match", pts: 5, topic: "b-kore", q: "Klassifizieren Sie die folgenden Kostenarten:", choices: ["variable Kosten", "Fixkosten"],
    rows: [[KOA[4], 0], [KOA[1], 0], [KOA[2], 1], [KOA[0], 1], [KOA[3], 1]],
    why: "Variabel heißt: ändert sich mit der Beschäftigung. Akkordlöhne und Fertigungsmaterial steigen mit jeder Einheit. Abschreibung Verwaltungsgebäude, kalkulatorische Zinsen und das Gehalt des Personalchefs bleiben gleich, sie sind fix." },
  { t: "one", pts: 3, topic: "b-fin", q: `Die Bilanz eines Friseurstudios sieht wie folgt aus:${BIL}<p>Sofern Sie die unversteuerten Rücklagen dem Eigenkapital zuordnen belauft sich die Fremdkapitalquote in 2004 auf:</p>`,
    opts: ["8,00 %", "89,93 %", "7,50 %", "9,21 %", "10,07 %"], a: 1,
    why: "FK = Rückstellungen + Verbindlichkeiten = 33.468,51 + 401.454,99 = 434.923,50. FK-Quote = 434.923,50 / 483.630,40 = <b>89,93 %</b>. 10,07 % wäre die EK-Quote." },
  { t: "tf", pts: 2, topic: "b-dyn", trap: true, q: "Bei der dynamischen Investitionsrechnung sind Erträge und Aufwendungen relevant.", a: false,
    why: "Dynamische Verfahren rechnen mit <b>Ein- und Auszahlungen</b> und deren Zeitpunkt. Erträge/Aufwand bzw. Kosten/Gewinne verwenden die statischen Verfahren." },
  { t: "multi", pts: 3, topic: "b-verm", q: `Ermitteln Sie mit dem in der Folge abgebildeten Anlagenspiegel den Anlagenabnutzungsgrad des abnutzbaren Sachanlagevermögens der Ventec GmbH zum 31.12.:${AS}<p>Der Anlagenabnutzungsgrad beträgt:</p>`,
    opts: ["rund 26,20 %", "rund 8,59 %", "rund 12,14 %", "rund 35,25 %", "rund 48,75 %", "rund 49,52 %", "rund 75,23 %", "rund 7,41 %"], a: [4],
    why: "Abnutzbar heißt: <b>ohne Grund</b> (Grund wird nicht abgeschrieben).<br>kum. Abschreibungen 31.12.: 5.320 + 6.500 + 3.000 = 14.820.<br>AK/HSK 31.12.: 8.000 + 17.500 + 4.900 = 30.400.<br>14.820 / 30.400 = <b>48,75 %</b>." },
  { t: "tf", pts: 2, topic: "b-kore", q: "Nach ihrem Verhalten bei Beschäftigungsänderungen unterscheidet man zwischen fixen Kosten und variablen Kosten.", a: true,
    why: "Richtig: Fix und variabel ist die Einteilung nach dem Verhalten bei Beschäftigungsänderung. Einzel/Gemein ist die Einteilung nach der Zurechenbarkeit." },
  { t: "multi", pts: 3, topic: "bx-urg", q: "Nach dem Unternehmensreorganisationsgesetz (URG) kann sich eine erweiterte Haftung für die Mitglieder des vertretungsbefugten Organs gegenüber der juristischen Person zur ungeteilten Hand ergeben, wenn ein Reorganisationsverfahren trotz vorliegen der Voraussetzungen nicht eingeleitet wurde. Zur Überwachung eines allfälligen Reorganisationsbedarfes werden die Kennzahlen der Eigenmittelquote und der fiktiven Schuldentilgungsdauer verwendet. Welche Kennzahlenwerte führen zur Vermutung, dass ein Reorganisationsbedarf vorliegt?",
    opts: ["Die fiktive Schuldentilgungsdauer beträgt weniger als 15 Jahre.", "Die fiktive Schuldentilgungsdauer beträgt weniger als 10 Jahre.", "Die Eigenmittelquote beträgt weniger als 8 %.", "Die Eigenmittelquote beträgt mehr als 8 %.", "Die Eigenmittelquote beträgt mehr als 10 %.", "Die fiktive Schuldentilgungsdauer beträgt mehr als 15 Jahre."], a: [2, 5],
    why: "URG § 22: Reorganisationsbedarf wird vermutet bei <b>Eigenmittelquote unter 8 %</b> und <b>fiktiver Schuldentilgungsdauer über 15 Jahre</b> (beides zusammen)." },
  { t: "multi", pts: 3, topic: "b-entsch", q: `${KR}<p>Welchen Preis müssen Sie für eine Beratungsstunde verlangen um kostendeckend zu sein, wenn Sie von 18.000 angebotenen Beratungsstunden ausgehen.</p>`,
    opts: ["€ 24,22", "€ 15,-", "€ 16,67", "€ 4,-", "€ 27,44", "€ 20,67"], a: [5],
    why: "Vollkosten pro Stunde = Fixkosten / Menge + variable Kosten = 300.000 / 18.000 + 4 = 16,67 + 4 = <b>€ 20,67</b>. 16,67 sind nur die fixen Stückkosten." },
  { t: "one", pts: 3, topic: "b-stat", q: `Ihnen liegen folgende Daten von zwei Investitionsobjekten, wovon eines im nächsten Monat geplant ist, vor:${TW(`<table class="dt alt-tab alt-narrow"><tr><th></th><th>Projekt A</th><th>Projekt B</th></tr>${[["Anschaffungskosten", "112.000", "165.000"], ["Nutzungsdauer", "5", "5"], ["Restwert", "12.000", "15.000"], ["Gewinn des 1. Jahres", "12.000", "59.000"], ["Gewinn des 2. Jahres", "24.000", "46.000"], ["Gewinn des 3. Jahres", "20.000", "28.000"], ["Gewinn des 4. Jahres", "26.000", "24.000"], ["Gewinn des 5. Jahres", "32.000", "23.000"]].map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</table>`)}<p>Nach der Durchschnittsrechnung beläuft sich die Amortisationsdauer bei Projekt <b>A</b> in Jahren auf:</p>`,
    opts: ["4,91 Jahre", "2,34 Jahre", "4 Jahre", "4,39 Jahre"], a: 1,
    why: "Ø Gewinn A = (12.000 + 24.000 + 20.000 + 26.000 + 32.000) / 5 = 22.800. Abschreibung = (112.000 − 12.000) / 5 = 20.000. Ø Rückfluss = 42.800.<br>Amortisationsdauer = (AK − Restwert) / Ø Rückfluss = 100.000 / 42.800 = <b>2,34 Jahre</b>. Ohne die Abschreibung käme 4,39 heraus." },
  { t: "multi", pts: 3, topic: "b-dyn", q: `<p>Sie sind Geschäftsführer eines metallverarbeitenden Unternehmens. Ihre Plandaten prognostizieren eine steigende Nachfrage nach einer bestimmten Produktpalette. Um dieser Nachfrage gerecht zu werden, müssen Sie Ihren Maschinenpark aufrüsten. Hierzu liegen 2 Angebote vor.</p><p><b>Angebot 1</b> weist folgende Daten auf: Die Anschaffungskosten der Maschine 1 belaufen sich auf € 12.500. Ihre Nutzungsdauer beträgt 5 Jahre. Die jährlich erzielbaren Rückflüsse (Einzahlungen) schätzen Sie wie folgt ein:</p>${TW(`<table class="dt alt-tab alt-narrow"><tr><th>Periode</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr><tr><td>Rückfluss</td><td>980</td><td>2.500</td><td>4.500</td><td>4.910</td><td>7.000</td></tr></table>`)}<p>Am Ende der Nutzungsdauer kann die Maschine nur noch verschrottet werden. Es ist von keinem Restwert auszugehen.</p><p><b>Angebot 2</b> weist einen Kapitalwert von € 750 auf.</p><p>Wie hoch ist der Kapitalwert bei Angebot 1, wenn Sie Ihren Berechnungen einen Kalkulationszinsfuß i. H. v. 3 % p. a. zu Grunde legen?</p>`,
    opts: ["rund € 2.298,99", "rund € 5.326,82", "rund € 4.112,33", "rund € 17.826,82", "rund € 2.952,45"], a: [1],
    why: "KW = −12.500 + 980/1,03 + 2.500/1,03² + 4.500/1,03³ + 4.910/1,03⁴ + 7.000/1,03⁵ = −12.500 + 17.826,82 = <b>5.326,82 €</b>. 17.826,82 ist nur der Barwert der Rückflüsse. Excel: <code>=NBW(3%;980;2500;4500;4910;7000)-12500</code>." },
  { t: "tf", pts: 2, topic: "b-bab", q: "Unechte Gemeinkosten sind Einzelkosten, die einem Kostenträger unmittelbar zugerechnet werden könnten, aus Wirtschaftlichkeitsgründen aber wie Gemeinkosten behandelt werden.", a: true,
    why: "Beispiel: Schrauben, Leim. Man könnte sie je Stück erfassen, der Aufwand lohnt sich aber nicht." },
  { t: "multi", pts: 3, topic: "bx-pflicht", trap: true, q: "<p>Am 04.05.2x14 trifft die Rechnung des Steuerberaters für die Erstellung des Jahresabschlusses 2x13 ein. Der Steuerberater verrechnet in Summe EUR 3.600,00 (exkl. 20% USt). Diese werden am 10.05.2x14 mittels Banküberweisung beglichen (Verbuchung als Aufwand).</p><p>Die Schoko-Laden GmbH hat dafür bereits im Vorjahr (2x13) eine Rückstellung iHv EUR 3.600,00 gebildet.</p><p>Wählen Sie die richtige/n Antwort(en) aus.</p>",
    opts: ["Durch die Bildung der Rückstellung im Jahr 2x13 hat sich das Ergebnis im Jahr 2x13 um EUR 3.600,00 verringert.", "Der Sachverhalt wirkt sich im Jahr 2x14 insgesamt NICHT auf das Ergebnis des Unternehmens/den Gewinn aus.", "Der Sachverhalt wirkt sich im Jahr 2x14 insgesamt auf das Ergebnis des Unternehmens/den Gewinn aus.", "Durch die Bildung der Rückstellung im Jahr 2x13 hat sich das Ergebnis im Jahr 2x13 um EUR 3.600,00 erhöht.", "Durch die Bildung der Rückstellung im Jahr 2x13 hat sich die Liquidität verringert."], a: [0, 1],
    why: "Die Bildung der Rückstellung ist 2x13 Aufwand (Ergebnis −3.600), es fließt aber noch kein Geld. 2x14 wird die Rückstellung verbraucht: Aufwand 3.600 und Auflösung der Rückstellung 3.600 heben sich auf, das Ergebnis 2x14 ändert sich nicht. Die Liquidität sinkt erst bei der Zahlung im Mai 2x14." },
  { t: "multi", pts: 2, topic: "bx-pflicht", trap: true, q: "Bitte wählen Sie die richtigen Aussagen bezüglich der Bilanzposition \"Rücklagen\" aus:",
    opts: ["Kennzeichen einer Gewinnrücklage ist, dass sie von außen dem Unternehmen zugeführt wird. Kapitalrücklagen werden aus dem Jahresüberschuss des Geschäftsjahres gebildet.", "Kennzeichen einer Kapitalrücklage ist, dass sie von außen dem Unternehmen zugeführt wird. Gewinnrücklagen werden aus dem Jahresüberschuss des Geschäftsjahres gebildet."], a: [1],
    why: "Kapitalrücklage = Geld von außen (z. B. Agio bei einer Kapitalerhöhung). Gewinnrücklage = aus dem Jahresüberschuss einbehalten." }
];
const MAX = Q.reduce((s, q) => s + q.pts, 0); // 90
const KEY = [[90, "Sehr gut (1)"], [80, "Gut (2)"], [70, "Befriedigend (3)"], [60, "Genügend (4)"]];
const grade = pct => (KEY.find(([t]) => pct > t + 1e-9) || [0, "Nicht genügend (5)"])[1];

/* ---------- Bewertung ---------- */
const answered = (q, a) => a != null && (q.t === "multi" ? a.length > 0 : q.t === "match" ? a.some(x => x >= 0) : true);
function score(q, a, minus) {
  if (!answered(q, a)) return 0;
  if (q.t === "tf") return a === q.a ? q.pts : -q.pts * minus;
  if (q.t === "one") return a === q.a ? q.pts : -q.pts * minus;
  if (q.t === "multi") { const hit = a.filter(i => q.a.includes(i)).length, bad = a.length - hit; return Math.max(0, q.pts * (hit - bad) / q.a.length); }
  return q.pts * q.rows.filter((r, i) => a[i] === r[1]).length / q.rows.length;
}

/* ---------- Darstellung einer Frage ---------- */
function qHTML(q, k, a, mode) {
  const head = `<div class="spread"><span class="eyebrow">Frage ${k + 1} · ${q.pts} P.</span><span class="row" style="gap:6px">${mode === "learn" && q.trap ? `<span class="chip warn">Falle aus deiner Altprüfung</span>` : ""}<small class="muted alt-flag">${answered(q, a) ? "beantwortet" : "offen"}</small></span></div>`;
  let body;
  if (q.t === "tf") body = `<small class="muted">Wählen Sie eine Antwort:</small><div class="opts">${[["Wahr", true], ["Falsch", false]].map(([t, v]) => `<button class="opt alt-o${a === v ? " sel" : ""}" data-v="${v}"><span class="k">${v ? "W" : "F"}</span><span>${t}</span></button>`).join("")}</div>`;
  else if (q.t === "match") body = `<div class="alt-match">${q.rows.map((r, i) => `<label class="alt-mrow"><span>${r[0]}</span><select data-r="${i}"><option value="-1">Auswählen …</option>${q.choices.map((c, j) => `<option value="${j}"${a && a[i] === j ? " selected" : ""}>${c}</option>`).join("")}</select></label>`).join("")}</div>`;
  else body = `<small class="muted">${q.t === "multi" ? "Wählen Sie eine oder mehrere Antworten:" : "Wählen Sie eine Antwort:"}</small><div class="opts">${q.opts.map((o, i) => `<button class="opt alt-o${(q.t === "multi" ? a && a.includes(i) : a === i) ? " sel" : ""}" data-i="${i}"><span class="k">${LET(i)}</span><span>${o}</span></button>`).join("")}</div>`;
  return `<article class="card col alt-q" id="aq-${k}" data-k="${k}">${head}<div class="check-q alt-text">${q.q}</div>${body}
    <div class="row alt-tools">${q.t !== "match" ? `<button class="btn ghost sm" data-clear>Auswahl löschen</button>` : ""}${mode === "learn" ? `<button class="btn sm" data-check>Prüfen</button>` : ""}</div><div class="alt-fb"></div></article>`;
}
function fbHTML(q, a, minus) {
  const got = score(q, a, minus), full = got >= q.pts - 1e-9;
  let right;
  if (q.t === "tf") right = q.a ? "Wahr" : "Falsch";
  else if (q.t === "match") right = `<ul class="alt-right">${q.rows.map((r, i) => `<li class="${a && a[i] === r[1] ? "y" : "n"}">${r[0]} <b>→ ${q.choices[r[1]]}</b>${a && a[i] >= 0 && a[i] !== r[1] ? ` <small>(deins: ${q.choices[a[i]]})</small>` : ""}</li>`).join("")}</ul>`;
  else right = (Array.isArray(q.a) ? q.a : [q.a]).map(i => `<b>${LET(i)}</b> ${q.opts[i]}`).join("<br>");
  return `<div class="why ${full ? "" : "bad"}"><b>${!answered(q, a) ? "Nicht beantwortet · 0 P." : `${fmtP(got)} von ${q.pts} P.${got < 0 ? " (Minuspunkte)" : ""}`}</b>
    <div class="muted">Richtig: ${right}</div><div><span class="eyebrow">Lösungsweg</span> ${q.why}</div>${q.trap ? `<div class="muted"><b>Falle aus deiner Altprüfung:</b> genau hier ist es beim echten Termin schiefgegangen.</div>` : ""}</div>`;
}
function markCard(card, q, a) {
  card.classList.add("alt-done");
  $$(".alt-o", card).forEach(b => { b.disabled = true; const v = b.dataset.v != null ? b.dataset.v === "true" : +b.dataset.i;
    const isC = q.t === "tf" ? v === q.a : Array.isArray(q.a) ? q.a.includes(v) : v === q.a, picked = b.classList.contains("sel");
    b.classList.remove("sel"); b.classList.add(picked && isC ? "ok" : picked ? "no" : isC ? "reveal" : "dim"); });
  $$("select", card).forEach(s => { s.disabled = true; const r = q.rows[+s.dataset.r]; s.classList.add(+s.value === r[1] ? "ok" : "no"); });
  $$(".alt-tools", card).forEach(x => x.remove());
}

/* ---------- Seiten ---------- */
const st = () => S().bwlalt || (S().bwlalt = { minus: 0.5 });
function intro(el) {
  const s = st(), hist = S().exams.filter(x => x.course === "bwl2" && x.kind === "alt").slice(-5).reverse(), run = s.run;
  el.innerHTML = `<div class="page"><header><span class="eyebrow">BWL 2 · Prüfungstrainer</span><h1>Altprüfung 1:1</h1><p class="muted" style="margin-top:6px;max-width:70ch">Deine echte Altprüfung mit allen 31 Fragen, in der Originalreihenfolge, mit den Originaltexten, Tabellen und Antwortmöglichkeiten. Bilanz und Anlagenspiegel sind als Tabellen nachgebaut, damit du sie auch am Handy lesen kannst.</p></header>
    ${run ? `<div class="callout"><b>Ein Versuch läuft noch</b> (${run.mode === "exam" ? "Prüfungsmodus" : "Lernmodus"}, ${Object.keys(run.ans).length} von ${Q.length} beantwortet${run.tEnd ? `, noch ${Math.max(0, Math.round((run.tEnd - Date.now()) / 60000))} Minuten` : ""}).<div class="row" style="margin-top:8px"><button class="btn pri" id="al-cont">Fortsetzen</button><button class="btn ghost" id="al-drop">Verwerfen</button></div></div>` : ""}
    <div class="grid g2">
      <section class="card col"><h3>Prüfungsmodus</h3><p>Wie am Termin: <b>90 Minuten</b>, <b>90 Punkte</b>, Auswertung erst nach der Abgabe. Bestanden ab <b>mehr als 60 %</b> (genau 60 % ist noch Nicht genügend).</p>
        <label class="fld">Minuspunkte bei falscher Antwort (Wahr/Falsch und Einfachauswahl)<select id="al-m">${[[0, "keine"], [0.5, "−50 % der Fragenpunkte"], [1, "−100 % der Fragenpunkte"]].map(([v, t]) => `<option value="${v}"${s.minus === v ? " selected" : ""}>${t}</option>`).join("")}</select></label>
        <small class="muted">Mehrfachauswahl: richtige minus falsche Kreuze, eine Frage geht nicht unter 0. Zuordnungen: Teilpunkte je Zeile. Unbeantwortet gibt 0 Punkte.</small>
        <div class="row"><button class="btn pri" id="al-exam">Prüfung starten</button></div></section>
      <section class="card col"><h3>Lernmodus</h3><p>Ohne Zeitlimit. Jede Frage kannst du sofort prüfen und bekommst den Lösungsweg. Die 10 Fragen, die beim echten Termin danebengingen, sind markiert.</p>
        <div class="row"><button class="btn" id="al-learn">Lernmodus starten</button><button class="btn ghost" data-go="lesson" data-p="bv-1">Die 10 Fallen</button></div></section>
    </div>
    <section class="card col"><h3>Deine Versuche</h3>${hist.length ? hist.map(x => `<div class="spread"><span class="tab">${fmtP(x.total)} / ${x.max} P. · ${Math.round(1000 * x.total / x.max) / 10} % · ${grade(100 * x.total / x.max)}</span><small>${new Date(x.ts).toLocaleDateString("de-AT")}</small></div>`).join(`<div class="divider"></div>`) : `<p class="muted">Noch keiner.</p>`}</section>
    <div class="row"><button class="btn ghost" data-go="exam">← Zurück zum Prüfungstrainer</button></div></div>`;
  $("#al-m", el).onchange = e => { s.minus = +e.target.value; App.save(); };
  const start = mode => { s.run = { mode, minus: mode === "exam" ? s.minus : 0, ans: {}, tEnd: mode === "exam" ? Date.now() + 90 * 60000 : 0, checked: {} }; App.save(); attempt(el); };
  $("#al-exam", el).onclick = () => start("exam"); $("#al-learn", el).onclick = () => start("learn");
  if (run) { $("#al-cont", el).onclick = () => attempt(el); $("#al-drop", el).onclick = () => { if (confirm("Diesen Versuch verwerfen?")) { delete s.run; App.save(); intro(el); } }; }
}

function attempt(el) {
  const s = st(), run = s.run, learn = run.mode === "learn"; let tmr, done = false;
  if (run.tEnd && Date.now() >= run.tEnd) return finish(el);
  el.innerHTML = `<div class="page alt-page"><div class="spread alt-head"><div><span class="eyebrow">BWL 2 · Altprüfung · ${learn ? "Lernmodus" : "Prüfungsmodus"}</span><h1>31 Fragen · ${MAX} Punkte</h1></div><div class="row">${run.tEnd ? `<span class="chip warn tab" id="al-clk"></span>` : ""}<button class="btn pri" id="al-sub">${learn ? "Auswerten" : "Abgeben"}</button></div></div>
    <nav class="alt-nav">${Q.map((q, k) => `<a href="#aq-${k}" data-n="${k}">${k + 1}</a>`).join("")}</nav>
    <div class="col" style="gap:14px" id="al-qs">${Q.map((q, k) => qHTML(q, k, run.ans[k], run.mode)).join("")}</div>
    <div class="row"><button class="btn pri" id="al-sub2">${learn ? "Auswerten" : "Abgeben"}</button><span class="muted" id="al-left"></span><button class="btn ghost" id="al-pause">Pausieren</button></div></div>`;
  const qs = $("#al-qs", el);
  const sync = () => { const n = Object.keys(run.ans).filter(k => answered(Q[k], run.ans[k])).length; $("#al-left", el).textContent = `${Q.length - n} offen`;
    $$(".alt-nav a", el).forEach(a => { const k = +a.dataset.n; a.classList.toggle("on", answered(Q[k], run.ans[k])); a.classList.toggle("chk", !!run.checked[k]); }); };
  const setA = (k, v) => { if (v == null) delete run.ans[k]; else run.ans[k] = v; const card = $("#aq-" + k, el), f = $(".alt-flag", card); if (f) f.textContent = answered(Q[k], run.ans[k]) ? "beantwortet" : "offen"; App.save(); sync(); };
  const check = k => { const card = $("#aq-" + k, el), q = Q[k]; run.checked[k] = true; markCard(card, q, run.ans[k]); $(".alt-fb", card).innerHTML = fbHTML(q, run.ans[k], 0); App.save(); sync(); };
  qs.onclick = e => {
    const card = e.target.closest(".alt-q"); if (!card || card.classList.contains("alt-done")) return; const k = +card.dataset.k, q = Q[k];
    if (e.target.closest("[data-check]")) return check(k);
    if (e.target.closest("[data-clear]")) { $$(".alt-o", card).forEach(b => b.classList.remove("sel")); return setA(k, null); }
    const b = e.target.closest(".alt-o"); if (!b) return;
    if (q.t === "multi") { b.classList.toggle("sel"); const v = $$(".alt-o", card).map((x, i) => x.classList.contains("sel") ? i : -1).filter(i => i >= 0); return setA(k, v.length ? v : null); }
    $$(".alt-o", card).forEach(x => x.classList.toggle("sel", x === b)); setA(k, q.t === "tf" ? b.dataset.v === "true" : +b.dataset.i);
  };
  qs.onchange = e => { const sel = e.target.closest("select[data-r]"); if (!sel) return; const card = sel.closest(".alt-q"), k = +card.dataset.k, q = Q[k];
    const v = q.rows.map((_, i) => +$(`select[data-r="${i}"]`, card).value); setA(k, v.some(x => x >= 0) ? v : null); };
  Object.keys(run.checked).forEach(k => check(+k));
  sync();
  const submit = () => { if (done) return; done = true; clearInterval(tmr); finish(el); };
  const ask = () => { const open = Q.length - Object.keys(run.ans).filter(k => answered(Q[k], run.ans[k])).length; if (confirm(open ? `Noch ${open} Fragen offen. Trotzdem ${learn ? "auswerten" : "abgeben"}?` : `Prüfung jetzt ${learn ? "auswerten" : "abgeben"}?`)) submit(); };
  $("#al-sub", el).onclick = ask; $("#al-sub2", el).onclick = ask; $("#al-pause", el).onclick = () => { clearInterval(tmr); intro(el); };
  if (run.tEnd) { const clk = $("#al-clk", el), tick = () => { const sec = Math.max(0, Math.round((run.tEnd - Date.now()) / 1000)); if (!clk.isConnected) return clearInterval(tmr); clk.textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`; clk.classList.toggle("bad", sec < 300); if (!sec) submit(); }; tick(); tmr = setInterval(tick, 1000); App.cleanup = (old => () => { clearInterval(tmr); old && old(); })(App.cleanup); }
}

function finish(el) {
  const s = st(), run = s.run; if (!run) return intro(el);
  const pts = Q.map((q, k) => score(q, run.ans[k], run.minus)), raw = pts.reduce((a, b) => a + b, 0), total = Math.max(0, Math.round(raw * 100) / 100), pct = 100 * total / MAX;
  Q.forEach((q, k) => App.rec(q.topic, Math.max(0, pts[k]) / q.pts));
  const traps = Q.map((q, k) => k).filter(k => Q[k].trap), trapOk = traps.filter(k => pts[k] >= Q[k].pts - 1e-9).length;
  S().exams.push({ ts: Date.now(), course: "bwl2", kind: "alt", total, max: MAX, weak: [...new Set(Q.filter((q, k) => pts[k] < q.pts).map(q => q.topic))] });
  App.addXP(20 + Math.round(pct / 100 * 40), "exam"); delete s.run; App.save();
  const pass = pct > 60 + 1e-9;
  el.innerHTML = `<div class="page alt-page"><div><span class="eyebrow">Ergebnis · BWL 2 · Altprüfung ${run.mode === "exam" ? "(Prüfungsmodus)" : "(Lernmodus)"}</span><h1>${fmtP(total)} / ${MAX} Punkte</h1></div>
    <div class="grid g3"><div class="card stat"><b class="result-big" style="font-size:38px;color:${pass ? "var(--acc)" : "var(--bad)"}">${Math.round(pct * 10) / 10} %</b><span>${pass ? "bestanden" : "nicht bestanden"}</span></div><div class="card stat"><b>${grade(pct)}</b><span>Notenschlüssel der VO</span></div><div class="card stat"><b>${trapOk} / ${traps.length}</b><span>Fallen diesmal richtig</span></div></div>
    <small class="muted">Notenschlüssel: über 90 % Sehr gut · über 80 % Gut · über 70 % Befriedigend · über 60 % Genügend.${run.minus ? ` Minuspunkte: −${run.minus * 100} % bei falscher Einfachauswahl.` : ""} Die Punkte je Frage sind geschätzt, die echte Prüfung hatte 90 Punkte gesamt.</small>
    <div class="card col"><h3>Punkte je Frage</h3><div class="alt-grid">${Q.map((q, k) => `<a href="#aq-${k}" class="${pts[k] >= q.pts - 1e-9 ? "ok" : pts[k] > 0 ? "part" : "no"}"><b>${k + 1}</b><small>${fmtP(pts[k])}/${q.pts}</small></a>`).join("")}</div></div>
    <h2>Auswertung mit Lösungsweg</h2><div class="col" style="gap:14px">${Q.map((q, k) => qHTML(q, k, run.ans[k], "review")).join("")}</div>
    <div class="row"><button class="btn pri" id="al-again">Neuer Versuch</button><button class="btn ghost" data-go="exam">Prüfungstrainer</button></div></div>`;
  Q.forEach((q, k) => { const card = $("#aq-" + k, el); markCard(card, q, run.ans[k]); $(".alt-fb", card).innerHTML = fbHTML(q, run.ans[k], run.minus); const f = $(".alt-flag", card); if (f) f.remove(); });
  $("#al-again", el).onclick = () => intro(el);
  window.scrollTo(0, 0);
}

document.addEventListener("click", e => { const a = e.target.closest('a[href^="#aq-"]'); if (!a) return; e.preventDefault(); const t = document.getElementById(a.getAttribute("href").slice(1)); if (t) t.scrollIntoView({ block: "start", behavior: "smooth" }); });

/* ---------- Einhängen: Prüfungstrainer, Prüfung üben, Kursseite ---------- */
const cta = () => `<button class="card prep-cta alt-cta" data-go="exam" data-p="bwlalt"><div><span class="eyebrow">Originalprüfung</span><div class="lrow-t">Altprüfung 1:1: alle 31 Fragen wie am echten Termin</div><small>90 Minuten · 90 Punkte · Minuspunkte · Lernmodus mit Lösungswegen${st().run ? " · ein Versuch läuft" : ""}</small></div><span class="alt-go">→</span></button>`;
const prevExam = PAGES.exam;
PAGES.exam = (el, p) => {
  if (p === "bwlalt") { if (S().course !== "bwl2" && CBY.bwl2) { S().course = "bwl2"; App.save(); App.renderSide && App.renderSide(); } return intro(el); }
  const r = prevExam(el, p), c = CBY[S().course], head = el.querySelector(".page > div");
  if (c && c.id === "bwl2" && head) head.insertAdjacentHTML("afterend", cta());
  return r;
};
const prevPrep = PAGES.prep;
PAGES.prep = (el, p) => { const r = prevPrep(el, p), top = el.querySelector(".prep-top"); if (top && el.querySelector('[data-pc="bwl2"].on')) top.insertAdjacentHTML("beforebegin", cta()); return r; };
const prevCourse = PAGES.course;
PAGES.course = (el, cid) => { const r = prevCourse(el, cid), pc = el.querySelector('.prep-cta[data-p="bwl2"]'); if (pc) pc.insertAdjacentHTML("afterend", cta()); return r; };
App.BWLALT = { Q, score, MAX, grade };
})();
