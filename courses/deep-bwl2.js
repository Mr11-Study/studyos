/* Vertiefung & Alltagsbeispiele – BWL2 (Bilanzanalyse, Kennzahlen, Kostenrechnung, Investitionsrechnung, Finanzierung) */
(function () {
window.STUDYOS_DEEP = window.STUDYOS_DEEP || {};
window.STUDYOS_DEEP["bwl2"] = {

  /* ================= Kapitel 1: Rechnungswesen & Jahresabschluss ================= */
  "b1-1": [
    { t: "text", h: "Vertiefung: Vier Begriffspaare, vier „Konten“ im Kopf", levels: {
      simple: `Stell dir vor, du führst vier verschiedene Listen über dein Geld. Liste 1 zählt nur, was wirklich aus der Geldbörse oder vom Konto rausgeht (<b>Auszahlung</b>). Liste 2 zählt auch, was du schuldest oder dir geschuldet wird (<b>Ausgabe</b>). Liste 3 fragt: Bin ich insgesamt ärmer geworden? (<b>Aufwand</b>). Liste 4 fragt: Was hat mich meine eigentliche Arbeit gekostet, auch wenn dafür gar kein Geld geflossen ist? (<b>Kosten</b>). Dieselbe Sache kann in einer Liste stehen und in der anderen nicht.`,
      normal: `Die vier Paare beschreiben vier verschiedene <b>Bestandsgrößen</b> und deren Veränderung:<br>
<b>1. Auszahlung/Einzahlung</b> → Bestand <i>liquide Mittel</i> (Kassa + Bank).<br>
<b>2. Ausgabe/Einnahme</b> → Bestand <i>Geldvermögen</i> = liquide Mittel + Forderungen − Verbindlichkeiten. Ein Kauf auf Rechnung ist daher eine Ausgabe (Verbindlichkeit steigt), aber noch keine Auszahlung.<br>
<b>3. Aufwand/Ertrag</b> → Bestand <i>Reinvermögen</i> (= Eigenkapital). Hier zählt jeder Werteverzehr, auch ohne Geldfluss, z. B. die Abschreibung (Afa). Umgekehrt ist der Kauf einer Maschine kein Aufwand: Bank sinkt, Anlagen steigen – das Vermögen ist gleich groß, nur anders zusammengesetzt (Aktivtausch).<br>
<b>4. Kosten/Leistung</b> → betriebsbezogene, „normalisierte“ Sicht der Kostenrechnung. Neutraler Aufwand (betriebsfremd, außerordentlich, periodenfremd – z. B. Spende, Hochwasserschaden) ist kein Kostenbestandteil. Dafür gibt es <b>Zusatzkosten</b> ohne Aufwand (kalk. Unternehmerlohn, kalk. EK-Zinsen) und <b>Anderskosten</b>, die anders bewertet werden als der Aufwand (kalk. Afa vom Wiederbeschaffungswert).<br>
Externes Rechnungswesen (FIBU, Bilanz, GuV) arbeitet mit Ebene 3, ist gesetzlich geregelt (UGB, Steuerrecht) und richtet sich an Externe (Bank, Finanzamt, Gläubiger). Internes Rechnungswesen (KORE, Investitionsrechnung) arbeitet mit Ebene 4 bzw. 1 und dient der Steuerung im Unternehmen – frei gestaltbar, oft monatlich und zukunftsbezogen.`,
      technical: `Formal: Liquide Mittel (LM) ⊂ Geldvermögen (GV = LM + Ford − Verb) ⊂ Reinvermögen (RV = GV + Sachvermögen = EK). Eine Transaktion ist Auszahlung, wenn ΔLM &lt; 0; Ausgabe, wenn ΔGV &lt; 0; Aufwand, wenn ΔRV &lt; 0 (ohne Entnahmen). Die Abgrenzung Aufwand ↔ Kosten erfolgt über <i>Zweckaufwand</i> (= Grundkosten, deckungsgleich), <i>neutralen Aufwand</i> (kein Kostencharakter) und <i>kalkulatorische Kosten</i> (Anders- und Zusatzkosten). Zweck der kalkulatorischen Kosten ist die <b>Vergleichbarkeit</b>: Ein Einzelunternehmer ohne Gehalt und ein GmbH-Geschäftsführer mit Gehalt sollen in der Kalkulation gleich dastehen; ebenso Betriebe mit eigenen bzw. gemieteten Räumen. Bewertungsgrundlage der Kosten ist der Güterverbrauch zu Wiederbeschaffungs- bzw. Opportunitätswerten, nicht zu historischen AK.`
    } },
    { t: "example", title: "Café Mila: ein Monat, vier Sichtweisen", html: `<p>Mila betreibt ein kleines Café als Einzelunternehmerin (e.U.). Im März passiert:</p>
<ul>
<li><b>Espressomaschine um 6.000 € per Banküberweisung</b> → <i>Auszahlung</i>, aber <i>kein Aufwand</i> (Aktivtausch: Bank −6.000, Anlagen +6.000).</li>
<li><b>Abschreibung</b> der Maschine: 6.000 / 5 Jahre = 1.200 € pro Jahr → <i>Aufwand</i> ohne Auszahlung.</li>
<li><b>Kaffeebohnen um 800 € auf Rechnung</b> (zahlbar in 30 Tagen) → <i>Ausgabe</i> (Verbindlichkeit +800), aber noch <i>keine Auszahlung</i>.</li>
<li><b>Gehalt der Aushilfe 1.400 € per Überweisung</b> → Auszahlung <i>und</i> Aufwand <i>und</i> Kosten.</li>
<li><b>Milas eigene Arbeit</b>: Sie zahlt sich kein Gehalt. In der Kalkulation setzt sie trotzdem 2.500 €/Monat <b>kalkulatorischen Unternehmerlohn</b> an → <i>Zusatzkosten</i>, kein Aufwand, keine Auszahlung.</li>
<li><b>Spende von 100 € an den Fußballverein</b> → Aufwand, aber <i>neutraler Aufwand</i>, keine Kosten (hat nichts mit dem Kaffeeverkauf zu tun).</li>
</ul><p>Ergebnis: Ihr Konto kann im März tief im Minus sein (Maschinenkauf), obwohl das Café Gewinn macht – und umgekehrt.</p>` },
    { t: "example", title: "Dein eigenes Studentenbudget", html: `<p>Kevin kauft im Oktober einen Laptop um 1.200 € und zahlt in 4 Monatsraten à 300 €.</p>
<ul><li>Im Oktober: <b>Ausgabe</b> 1.200 € (er schuldet das Geld ab Kauf), aber nur 300 € <b>Auszahlung</b>.</li>
<li>Wenn er den Laptop 4 Jahre nutzt, „verbraucht“ er jedes Jahr 300 € an Wert → das ist sein <b>Aufwand</b> pro Jahr (wie eine Abschreibung).</li>
<li>Die Raten von November bis Jänner sind nur noch <b>Auszahlungen</b>: Er wird dadurch nicht ärmer, er tilgt nur seine Schuld (Bank ↓, Schuld ↓).</li></ul>
<p>Genau deshalb gilt: <b>Gewinn ≠ Cash-Flow ≠ Zunahme der liquiden Mittel</b>.</p>` },
    { t: "hint", title: "Eselsbrücke: Die Zwiebel", html: `Denk an eine Zwiebel mit drei Schalen: innen <b>Kassa/Bank</b> (Aus-/Einzahlung), darum <b>+ Forderungen − Verbindlichkeiten</b> (Aus-/Einnahme), außen <b>+ Sachvermögen</b> (Aufwand/Ertrag). Frag bei jedem Geschäftsfall: Welche Schale ändert sich? Bei einer Kreditrückzahlung ändert sich nur die innerste – die zweite bleibt gleich, weil Bank und Schuld gleich stark sinken.` },
    { t: "hint", title: "Typische Prüfungsfalle", html: `„Kauf einer Maschine gegen Bank“ ist <b>kein Aufwand</b> – viele kreuzen „Auszahlung und Aufwand“ an. Der Aufwand kommt erst Jahr für Jahr über die Abschreibung. Ebenso: <b>Kreditrückzahlung</b> = nur Auszahlung, die <b>Zinsen</b> dagegen sind Auszahlung und Aufwand.` },
    { t: "hint", title: "So erkennst du Zusatz- vs. Anderskosten", html: `<b>Zusatz</b>kosten: In der FIBU steht <i>gar nichts</i> (Aufwand = 0), z. B. Unternehmerlohn beim e.U., Zinsen aufs Eigenkapital, Miete für eigene Räume. <b>Anders</b>kosten: In der FIBU steht <i>ein anderer Betrag</i>, z. B. bilanzielle Afa 1.200 € vs. kalkulatorische Afa 1.400 € vom höheren Wiederbeschaffungswert.` }
  ],

  "b1-2": [
    { t: "text", h: "Vertiefung: Wie Bilanz und GuV zusammenhängen", levels: {
      simple: `Die <b>Bilanz</b> ist ein Foto am 31.12.: Links steht, was das Unternehmen hat (Aktiva), rechts, woher das Geld dafür kommt (Passiva: eigenes Geld oder Schulden). Beide Seiten sind immer gleich groß. Die <b>GuV</b> ist der Film über das ganze Jahr: Was kam herein (Erträge), was wurde verbraucht (Aufwände)? Der Gewinn aus dem Film erhöht das Eigenkapital auf dem nächsten Foto.`,
      normal: `<b>Aktiva</b> (Mittelverwendung): A. Anlagevermögen – dient dem Betrieb dauerhaft (Gebäude, Maschinen, Fahrzeuge, Software, Beteiligungen); B. Umlaufvermögen – wird im Geschäftsprozess verbraucht oder zu Geld (Vorräte, Forderungen, Wertpapiere, Kassa/Bank); C. aktive Rechnungsabgrenzung. Sortiert von „geldfern“ nach „geldnah“.<br>
<b>Passiva</b> (Mittelherkunft): A. Eigenkapital; B. (unversteuerte Rücklagen); C. Rückstellungen (ungewisse Schulden); D. Verbindlichkeiten (sichere Schulden); E. passive Rechnungsabgrenzung. Sortiert nach Haftung und Fristigkeit.<br>
Jeder Geschäftsfall ist einer von <b>vier Typen</b>: <b>Aktivtausch</b> (Bareinkauf von Ware: Kassa ↓, Vorräte ↑), <b>Passivtausch</b> (Lieferantenschuld wird in einen Bankkredit umgewandelt), <b>Aktiv-Passiv-Mehrung</b> (Kauf auf Ziel: Vorräte ↑, Verbindlichkeiten ↑), <b>Aktiv-Passiv-Minderung</b> (Schuld per Bank bezahlt: Bank ↓, Verbindlichkeiten ↓). Die Bilanzsumme ändert sich nur bei den letzten beiden.<br>
<b>Erfolgswirksame</b> Fälle (Erlöse, Löhne, Miete, Afa) laufen über die GuV und ändern am Ende das Eigenkapital: <b>Jahresüberschuss = Erträge − Aufwendungen = ΔEK</b> (ohne Einlagen, Entnahmen, Ausschüttungen). So „schließt“ die GuV die Bilanz.`,
      technical: `Die GuV ist ein Unterkonto des Eigenkapitals. Nach UGB wird sie in Staffelform nach dem Gesamtkostenverfahren (Umsatzerlöse ± Bestandsveränderungen + sonstige betriebliche Erträge − Materialaufwand − Personalaufwand − Abschreibungen − sonstige betriebliche Aufwendungen = Betriebserfolg; ± Finanzerfolg = Ergebnis vor Steuern; − Steuern vom Einkommen = Ergebnis nach Steuern) oder nach dem Umsatzkostenverfahren erstellt. Bilanz: Bestandsrechnung zum Stichtag (Zeitpunkt); GuV: Stromgrößenrechnung (Zeitraum). Der Anhang erläutert Bilanzierungs- und Bewertungsmethoden; der Lagebericht (größenabhängig) Geschäftsverlauf und Risiken. Bilanzidentität: Schlussbilanz des Vorjahres = Eröffnungsbilanz des Folgejahres.`
    } },
    { t: "example", title: "Die Bilanz von Tonis Foodtruck", html: `<p>Toni betreibt einen Burger-Foodtruck. Seine Bilanz am 31.12. (in €):</p>
<table class="dt"><tr><th>Aktiva</th><th>€</th><th>Passiva</th><th>€</th></tr>
<tr><td>A. Truck (Anlagevermögen)</td><td>40.000</td><td>A. Eigenkapital (Erspartes)</td><td>18.000</td></tr>
<tr><td>A. Küchenausstattung</td><td>8.000</td><td>D. Bankkredit</td><td>32.000</td></tr>
<tr><td>B. Vorräte (Fleisch, Brötchen)</td><td>1.500</td><td>D. Lieferantenverbindlichkeiten</td><td>3.000</td></tr>
<tr><td>B. Kassa/Bank</td><td>3.500</td><td></td><td></td></tr>
<tr><td><b>Summe</b></td><td><b>53.000</b></td><td><b>Summe</b></td><td><b>53.000</b></td></tr></table>
<p><b>Monats-GuV Juni:</b> Umsatzerlöse 12.000 − Wareneinsatz 4.200 − Personal 3.500 − Standgebühren 600 − Abschreibung 800 (Truck + Küche 48.000 / 5 Jahre / 12) − Zinsen 150 = <b>Gewinn 2.750 €</b>. Dieser Gewinn erhöht Tonis Eigenkapital.</p>
<p><b>Geschäftsfälle:</b> Er kauft Brötchen um 200 € bar → Aktivtausch (Bilanzsumme bleibt 53.000). Er bezahlt 1.000 € Lieferantenschuld per Bank → Aktiv-Passiv-Minderung (Bilanzsumme sinkt auf 52.000).</p>` },
    { t: "hint", title: "Merksatz: Foto vs. Film", html: `<b>Bilanz = Foto</b> (stichtagsbezogen, Bestände), <b>GuV = Film</b> (zeitraumbezogen, Ströme). Fragt die Prüfung „zeitraumbezogen oder stichtagsbezogen?“, denk an Foto und Film.` },
    { t: "hint", title: "So löst du Geschäftsfall-Aufgaben", html: `Drei Fragen in dieser Reihenfolge: 1) Welche <b>zwei</b> Posten ändern sich? 2) Steigen oder sinken sie? 3) Ist ein GuV-Konto beteiligt (Erlös/Aufwand)? Beispiel „Verkauf auf Ziel 25.000“: Forderungen +25.000, Umsatzerlöse +25.000 (GuV), liquide Mittel <b>unverändert</b>.` },
    { t: "hint", title: "Typische Verwechslung", html: `Eigenkapital ist <b>kein Geld in der Kassa</b>, sondern nur die Differenz Vermögen − Schulden. Toni hat 18.000 € EK, aber nur 3.500 € auf dem Konto – der Rest „steckt“ im Truck. Geld hat kein „Mascherl“: Man kann nicht sagen, welcher Euro aus dem Kredit und welcher aus dem Ersparten stammt.` }
  ],

  /* ================= Kapitel 2: Bilanzanalyse & Kennzahlen ================= */
  "b2-1": [
    { t: "text", h: "Vertiefung: Was die Vermögenskennzahlen wirklich messen", levels: {
      simple: `Vermögenskennzahlen beantworten drei Fragen: <b>Wie schwer ist das Unternehmen?</b> (viel Anlagevermögen = viele fixe Kosten, wenig flexibel). <b>Wie alt ist die Ausstattung?</b> (Abnutzungsgrad – bald muss neu gekauft werden). <b>Wie schnell wird aus Ware und Rechnungen wieder Geld?</b> (Lager- und Debitorendauer). Je länger Geld in Lager und offenen Rechnungen „steckt“, desto mehr muss man vorfinanzieren.`,
      normal: `<b>Anlageintensität</b> (AV / Gesamtvermögen): Hoch bei Hotels, Energieversorgern, Industrie; niedrig bei Handel und Dienstleistern. Eine hohe Quote bedeutet hohe Fixkosten (Afa, Zinsen, Wartung) und damit Risiko bei Umsatzrückgang – aber nicht automatisch etwas Schlechtes, sondern branchenabhängig.<br>
<b>Anlagenabnutzungsgrad</b> (kum. Afa / historische AK des abnutzbaren SAV): Wie viel Prozent der Anlagen sind „verbraucht“? 80 % heißt: Bald stehen Ersatzinvestitionen an. Grund und Boden wird weggelassen, weil er nicht abgenutzt wird.<br>
<b>Investitionsdeckung</b> (Afa / Nettoinvestitionen): Unter 100 % wird mehr investiert als abgeschrieben → Anlagevermögen wächst; über 100 % „lebt“ das Unternehmen von der Substanz.<br>
<b>Lagerumschlagshäufigkeit</b> (Materialeinsatz / ø Vorräte) und <b>Lagerdauer</b> (365 / LUH): Wie oft wird das Lager pro Jahr komplett „gedreht“? Schnelles Drehen bindet weniger Kapital, verringert Verderb.<br>
<b>Debitorenumschlag</b> ((Umsatz + USt) / ø Forderungen LL) und <b>Debitorendauer</b> (365 / DUH): durchschnittliches Zahlungsziel der Kunden. Die USt kommt in den Zähler, weil Forderungen brutto (inkl. USt) in der Bilanz stehen, Umsatzerlöse aber netto – sonst würde man Äpfel mit Birnen vergleichen.<br>
Der Ø-Bestand wird meist als (Anfangsbestand + Endbestand) / 2 gerechnet.`,
      technical: `Alle Bestandskennzahlen sind Stichtagsgrößen und anfällig für <i>Window Dressing</i> (z. B. Lagerabbau kurz vor dem 31.12.). Deshalb werden Durchschnittswerte (ggf. Monatsdurchschnitte) verwendet. Die Abschreibungsquote (Afa d. GJ / ø SAV zu hist. AK) zeigt die Abschreibungspolitik: Eine hohe Quote kann auf kurze Nutzungsdauern oder degressive Afa hindeuten (stille Reserven). Debitoren- und Kreditorendauer werden in der Finanzierungslücke verknüpft (b2-2). Interpretation immer über Zeitvergleich (Trend), Betriebsvergleich (Branche) und Soll-Ist-Vergleich; eine Einzelzahl ohne Vergleich ist wertlos.`
    } },
    { t: "example", title: "Friseursalon Lena: Lager und Abnutzung", html: `<p>Lena führt einen Friseursalon. Sie verbraucht pro Jahr Haarfarben, Shampoos usw. um <b>36.000 €</b> (Materialeinsatz). Ihr Lager hatte am 1.1. 4.000 € und am 31.12. 5.000 € → <b>ø Vorrat 4.500 €</b>.</p>
<ul><li><b>Lagerumschlagshäufigkeit</b> = 36.000 / 4.500 = <b>8</b> → das Lager wird 8-mal im Jahr komplett verbraucht.</li>
<li><b>Lagerdauer</b> = 365 / 8 ≈ <b>45,6 Tage</b> → eine Tube Farbe liegt im Schnitt 1½ Monate im Regal.</li></ul>
<p>Ihre Einrichtung (Stühle, Waschbecken, Föhne) hat historische AK von <b>50.000 €</b>, kumulierte Abschreibungen <b>35.000 €</b> → <b>Anlagenabnutzungsgrad = 70 %</b>. Übersetzt: Der Salon ist ziemlich „abgewohnt“, in den nächsten Jahren muss Lena neu investieren.</p>` },
    { t: "example", title: "Café mit Catering: Wann zahlen die Kunden?", html: `<p>Milas Café liefert Catering an Firmen auf Rechnung. Jahresumsatz netto <b>120.000 €</b>, mit 20 % USt also <b>144.000 €</b> brutto. Offene Kundenrechnungen (Forderungen LL) im Schnitt <b>12.000 €</b>.</p>
<ul><li><b>DUH</b> = 144.000 / 12.000 = <b>12</b></li><li><b>Debitorendauer</b> = 365 / 12 ≈ <b>30,4 Tage</b> → Kunden zahlen im Schnitt nach einem Monat.</li></ul>
<p>Hätte Mila die USt vergessen (120.000 / 12.000 = 10 → 36,5 Tage), wäre die Kundenzahlungsdauer um 6 Tage zu schlecht berechnet.</p>` },
    { t: "hint", title: "Eselsbrücke: Häufigkeit ↔ Dauer", html: `<b>Dauer = 365 / Häufigkeit</b> – immer. Je öfter sich etwas dreht, desto kürzer bleibt es. Hast du eine der beiden Zahlen, hast du die andere.` },
    { t: "hint", title: "Typische Prüfungsfalle: USt", html: `Bei Debitoren- (und Kreditoren-)kennzahlen <b>Umsatz bzw. Einkauf × 1,2</b> (bei 20 % USt) in den Zähler, weil Forderungen/Verbindlichkeiten brutto bilanziert sind. Bei der Lagerumschlagshäufigkeit dagegen <b>keine</b> USt – Vorräte und Materialeinsatz sind beide netto.` },
    { t: "hint", title: "Abnutzungsgrad richtig rechnen", html: `Nur das <b>abnutzbare</b> Sachanlagevermögen nehmen: Grundstücke raus, sowohl aus dem Zähler (haben ohnehin keine Afa) als auch aus dem Nenner (AK). Und: historische AK, nicht Buchwert, in den Nenner!` }
  ],

  "b2-2": [
    { t: "text", h: "Vertiefung: Fristenkongruenz und die drei Liquiditätsgrade", levels: {
      simple: `Die Grundregel lautet: <b>Was lange bleibt, soll mit Geld bezahlt werden, das lange bleibt.</b> Ein Auto, das du 8 Jahre fährst, finanzierst du nicht mit einem Kredit, den du in 3 Monaten zurückzahlen musst. Die Liquiditätsgrade prüfen dann: Kann ich meine kurzfristigen Schulden mit dem bezahlen, was ich bald an Geld habe – nur Bargeld (1. Grad), plus offene Kundenrechnungen (2. Grad), plus Lager (3. Grad)?`,
      normal: `<b>Kapitalstruktur</b> (vertikal, nur Passivseite): Eigenkapitalquote = EK / GK. Hohe EK-Quote = Puffer für Verluste, Unabhängigkeit, bessere Kreditkonditionen. Fremdkapitalquote (Anspannungskoeffizient) = FK / GK = 100 % − EK-Quote.<br>
<b>Deckungsgrade</b> (horizontal, Aktiv- gegen Passivseite) prüfen die <b>Fristenkongruenz</b>: Langfristig gebundenes Vermögen soll durch langfristiges Kapital gedeckt sein. Deckungsgrad A = EK/AV, B (goldene Bilanzregel) = (EK + lfr. FK)/AV, C = (EK + lfr. FK)/(AV + langfristiges UV, z. B. „eiserner Bestand“ im Lager). B &lt; 100 % heißt: Ein Teil des Anlagevermögens wird mit kurzfristigem Geld finanziert → Gefahr, dass man refinanzieren muss, wenn die Bank nicht mehr will.<br>
<b>Liquiditätsgrade</b> stellen kurzfristiges Vermögen dem kurzfristigen Fremdkapital (Laufzeit bis 1 Jahr) gegenüber:<br>
1. Grad = Zahlungsmittel / kfr. FK (Faustregel ≥ 20 %, One-to-Five)<br>
2. Grad = (Zahlungsmittel + kfr. Forderungen + WP) / kfr. FK (≥ 100 %, Acid Test)<br>
3. Grad = gesamtes kfr. UV inkl. Vorräte / kfr. FK (≥ 200 %, Banker's Rule)<br>
<b>Finanzierungslücke</b> = Lagerdauer + Debitorendauer − Kreditorendauer: so viele Tage muss der Betrieb selbst „vorstrecken“.`,
      technical: `Die horizontalen Regeln (goldene Bilanzregel, 1:1, 2:1) sind empirisch nicht begründet („verstaubt“), werden aber von Banken als Ratingindikatoren verwendet. Statische Liquiditätskennzahlen sind stichtagsbezogen und ignorieren (a) die genaue Fälligkeit innerhalb des Jahres, (b) künftige Ein- und Auszahlungen (Löhne, Miete), (c) nicht bilanzierte Kreditlinien. Daher ergänzt man sie durch dynamische Liquiditätsanalyse (Cash-Flow, Finanzplan). Die Kreditorenumschlagshäufigkeit = (Materialeinkauf + USt) / ø Verbindlichkeiten LL; ein langes Lieferantenziel verkürzt die Finanzierungslücke, ist aber oft teuer (entgangenes Skonto, siehe b5-1).`
    } },
    { t: "example", title: "Tonis Foodtruck: Kann er seine Rechnungen zahlen?", html: `<p>Am 30.6. hat Toni: Bank/Kassa <b>3.000 €</b>, Forderungen (Firmenfest auf Rechnung) <b>2.000 €</b>, Vorräte <b>1.500 €</b>. Kurzfristige Schulden (Lieferanten, Kreditrate fällig in 3 Monaten): <b>5.000 €</b>.</p>
<ul><li>Liquidität 1. Grades = 3.000 / 5.000 = <b>60 %</b> (Ziel ≥ 20 % ✔)</li>
<li>Liquidität 2. Grades = (3.000 + 2.000) / 5.000 = <b>100 %</b> (Acid Test gerade erfüllt)</li>
<li>Liquidität 3. Grades = 6.500 / 5.000 = <b>130 %</b> (Banker's Rule 200 % verfehlt)</li></ul>
<p>Interpretation: Für einen Foodtruck mit frischer Ware (wenig Lager) ist der 3. Grad wenig aussagekräftig – Brötchen kann man nicht „verkaufen“, um Schulden zu tilgen, sie verderben. Branchenvergleich ist wichtiger als die Faustregel.</p>` },
    { t: "example", title: "Finanzierungslücke im Studentenleben und im Café", html: `<p><b>Kevin:</b> Die Miete (450 €) ist am 1. fällig, sein Nebenjob-Gehalt kommt am 30. Er muss 29 Tage „überbrücken“ – das ist seine Finanzierungslücke, gedeckt durch Erspartes oder Kontoüberziehung.</p>
<p><b>Mila (Café-Catering):</b> Lagerdauer der Zutaten 20 Tage + Debitorendauer 30 Tage − Lieferantenziel 14 Tage = <b>36 Tage</b> Lücke. In dieser Zeit hat sie ihre Lieferanten schon bezahlt, aber noch kein Geld von den Firmenkunden. Diese 36 Tage finanziert sie über das Kontokorrent der Bank (teuer!). Hebel: Kunden schneller zahlen lassen, weniger Lager, längeres Lieferantenziel.</p>` },
    { t: "hint", title: "Eselsbrücke: 1–2–3 und 20–100–200", html: `Die Liquiditätsgrade „wachsen“ mit jedem Grad um eine Vermögensschicht (Geld → + Forderungen → + Vorräte) und die Faustregeln steigen mit: <b>1. Grad ≥ 20 %, 2. Grad ≥ 100 %, 3. Grad ≥ 200 %</b>.` },
    { t: "hint", title: "Typische Prüfungsfalle", html: `Deckungsgrad B &lt; 100 % bedeutet <b>nicht</b> Überschuldung (das wäre negatives Eigenkapital), sondern nur, dass ein Teil des AV kurzfristig finanziert ist. Und: Die Liquiditätsgrade nehmen nur das <b>kurzfristige</b> FK in den Nenner, nicht das gesamte FK.` },
    { t: "hint", title: "So gehst du bei Rechenaufgaben vor", html: `1) Bilanzposten nach Fristigkeit sortieren (kfr. / lfr.). 2) Rückstellungen zuordnen (Abfertigung = lfr., Steuern = kfr.). 3) Zähler für jeden Grad aufbauen. 4) Ergebnis mit Faustregel <i>und</i> Branche vergleichen – in Textfragen wird die Interpretation gefragt.` }
  ],

  "b2-3": [
    { t: "text", h: "Vertiefung: Cash-Flow indirekt herleiten – Schritt für Schritt", levels: {
      simple: `Der Gewinn sagt nicht, wie viel Geld wirklich hereinkam. Darum rechnet man ihn um: Man startet beim Gewinn und <b>addiert alles, was Aufwand war, aber kein Geld gekostet hat</b> (z. B. Abschreibung), und <b>zieht alles ab, was Ertrag war, aber noch kein Geld gebracht hat</b> (z. B. Kunden haben noch nicht bezahlt). Heraus kommt der Cash-Flow: Geld, das der laufende Betrieb wirklich verdient hat.`,
      normal: `Die <b>Kapitalflussrechnung</b> (Geldflussrechnung) erklärt die Veränderung der liquiden Mittel in drei Bereichen:<br>
<b>1. Operativer Cash-Flow</b> (laufende Geschäftstätigkeit), indirekt: Jahresüberschuss<br>
+ Abschreibungen (Aufwand ohne Auszahlung)<br>
+ Zunahme / − Abnahme langfristiger Rückstellungen (Aufwand ohne Auszahlung)<br>
− Zunahme / + Abnahme von Vorräten und Forderungen (Geld steckt fest)<br>
+ Zunahme / − Abnahme von Verbindlichkeiten LL (Rechnung noch nicht bezahlt)<br>
<b>2. Cash-Flow aus Investitionstätigkeit</b>: − Kauf von Anlagen, + Erlöse aus Anlagenverkäufen.<br>
<b>3. Cash-Flow aus Finanzierungstätigkeit</b>: + Kreditaufnahme, + Kapitaleinlagen, − Tilgung, − Gewinnausschüttung.<br>
Summe 1 + 2 + 3 = <b>Veränderung der liquiden Mittel</b>.<br>
Merke: Ein positiver operativer Cash-Flow zeigt <b>Innenfinanzierungskraft</b> – damit kann man investieren, tilgen oder ausschütten, ohne neues Geld von außen. <b>Free Cash-Flow</b> = operativer CF − Investitionen: was nach den nötigen Investitionen für Kapitalgeber übrig bleibt.<br>
<b>Dynamische Schuldentilgungsdauer</b> = Effektivverschuldung / Cash-Flow: Wie viele Jahre bräuchte man, um alle Schulden aus dem Cash-Flow zurückzuzahlen? Für das URG ist die Grenze 15 Jahre (bx-2).`,
      technical: `Direkte Methode: Einzahlungen von Kunden − Auszahlungen an Lieferanten, Personal usw. Indirekte Methode: retrograde Korrektur des Ergebnisses um zahlungsunwirksame Aufwendungen/Erträge und um Veränderungen des Working Capital. Beide liefern denselben operativen Cash-Flow. Die Zuordnung von gezahlten Zinsen und Dividenden ist nach Standards unterschiedlich (operativ oder Finanzierung) – bei Vergleichen beachten. Der Cash-Flow ist schwerer manipulierbar als der Gewinn, da Bewertungswahlrechte (Afa-Methode, Rückstellungen) neutralisiert werden. Effektivverschuldung = FK (Rückstellungen + Verbindlichkeiten) − liquide Mittel − Wertpapiere des UV.`
    } },
    { t: "example", title: "Café Mila: Vom Gewinn zum Geld", html: `<p>Milas Café hat im Jahr einen <b>Jahresüberschuss von 20.000 €</b>. Weitere Infos:</p>
<table class="dt"><tr><th>Posten</th><th>€</th><th>Warum?</th></tr>
<tr><td>Jahresüberschuss</td><td>20.000</td><td>Start</td></tr>
<tr><td>+ Abschreibungen</td><td>+8.000</td><td>Aufwand ohne Auszahlung</td></tr>
<tr><td>+ Zunahme Rückstellung (Steuerberatung)</td><td>+1.000</td><td>Aufwand, noch nicht bezahlt</td></tr>
<tr><td>− Zunahme Forderungen (Catering)</td><td>−3.000</td><td>Umsatz gebucht, Geld fehlt</td></tr>
<tr><td>+ Zunahme Verbindlichkeiten LL</td><td>+1.500</td><td>Bohnen erhalten, noch nicht bezahlt</td></tr>
<tr><td>− Zunahme Vorräte</td><td>−500</td><td>Geld liegt im Lager</td></tr>
<tr><td><b>= Operativer Cash-Flow</b></td><td><b>27.000</b></td><td></td></tr>
<tr><td>− Investition (neue Theke)</td><td>−15.000</td><td>Investitionstätigkeit</td></tr>
<tr><td>− Kredittilgung</td><td>−6.000</td><td>Finanzierungstätigkeit</td></tr>
<tr><td><b>= Veränderung liquide Mittel</b></td><td><b>+6.000</b></td><td></td></tr></table>
<p>Schuldentilgungsdauer: Schulden 120.000 − liquide Mittel 10.000 = Effektivverschuldung 110.000; 110.000 / 27.000 ≈ <b>4,1 Jahre</b> → sehr gesund.</p>` },
    { t: "hint", title: "Vorzeichen-Regel fürs Working Capital", html: `<b>Aktivposten steigt → Cash-Flow sinkt</b> (Geld ist in Forderungen/Lager gebunden). <b>Passivposten steigt → Cash-Flow steigt</b> (du hast etwas bekommen, aber noch nicht bezahlt). Einfach „gegen die Aktiva, mit den Passiva“.` },
    { t: "hint", title: "Typische Prüfungsfalle", html: `Ein Gewinn aus einem Anlagenverkauf (Buchwert 2.000, Verkauf 3.000 → Ertrag 1.000) gehört <b>nicht</b> in den operativen Cash-Flow: Man zieht die 1.000 beim operativen CF ab und zeigt die vollen 3.000 Einzahlung bei der Investitionstätigkeit. Sonst würde man doppelt zählen.` },
    { t: "hint", title: "Alltagsvergleich", html: `Dein „Gewinn“ als Student kann positiv sein (Gehalt &gt; Ausgaben), aber wenn dein Arbeitgeber erst nächsten Monat zahlt (Forderung), ist dein Konto trotzdem leer. Der Cash-Flow fragt nur: Wie viel ist <i>wirklich</i> am Konto angekommen?` }
  ],

  "b2-4": [
    { t: "text", h: "Vertiefung: Rentabilität und Leverage-Effekt", levels: {
      simple: `Rentabilität heißt: <b>Wie viel Gewinn bringt jeder eingesetzte Euro?</b> Die Eigenkapitalrentabilität fragt das aus Sicht der Eigentümer, die Gesamtkapitalrentabilität aus Sicht aller Geldgeber (Eigentümer + Bank). Spannend: Wenn das Geschäft mehr verdient, als der Kredit kostet, steigt die Eigenkapitalrendite, je mehr Kredit man nimmt (Hebel). Wenn es schlecht läuft, wirkt der Hebel genauso stark nach unten.`,
      normal: `<b>Eigenkapitalrentabilität (ROE)</b> = Ergebnis vor Steuern / ø EK × 100 – die „Verzinsung“ des Geldes der Eigentümer. Vergleichsmaßstab: Was hätten die Eigentümer anderswo bekommen (Sparbuch, Aktienfonds) plus Risikoaufschlag?<br>
<b>Gesamtkapitalrentabilität (ROA/ROI)</b> = (Ergebnis vor Steuern + FK-Zinsen) / ø GK × 100. Die Zinsen werden addiert, weil sie die Entlohnung der Fremdkapitalgeber sind – sonst wäre der Zähler (nur Eigentümer-Anteil) mit dem Nenner (alles Kapital) inkonsistent. Der ROA zeigt die Ertragskraft des Unternehmens <i>unabhängig von der Finanzierung</i>.<br>
<b>Leverage-Effekt</b>: ROE = ROA + (ROA − i) × FK/EK, wobei i = FK-Zinssatz. Ist ROA &gt; i, verdient jeder geliehene Euro mehr, als er kostet; der Überschuss fließt den Eigentümern zu → mehr FK hebt den ROE. Ist ROA &lt; i, kehrt sich der Hebel um (Leverage-Risiko).<br>
Weitere Ertragskennzahlen: <b>Umsatzrentabilität</b> (Ergebnis / Umsatz) – wie viel Cent Gewinn pro Euro Umsatz; <b>Kapitalumschlag</b> (Umsatz / GK). ROI = Umsatzrentabilität × Kapitalumschlag (DuPont-Schema).<br>
<b>Grenzen</b> der Kennzahlenanalyse: vergangenheitsbezogen, Stichtagsproblem, Bewertungswahlrechte (stille Reserven), fehlende Infos (Auftragsbestand, Mitarbeiterqualität, Kreditlinien). Kennzahlen zeigen Symptome, nicht Ursachen.`,
      technical: `Herleitung Leverage: Sei G = Ergebnis vor Zinsen = ROA·GK. Dann EBT = ROA·(EK+FK) − i·FK, ROE = EBT/EK = ROA + (ROA − i)·FK/EK. Annahmen: ROA und i unabhängig vom Verschuldungsgrad – real steigt i mit zunehmender Verschuldung (Risikozuschlag), und die Schwankung des ROE (Risiko) wächst mit FK/EK. Die Kennzahlen werden hier vor Steuern definiert, um Rechtsformunterschiede (KöSt vs. ESt) auszuschalten. Durchschnittswerte für EK und GK ((Anfang + Ende)/2) beziehen Stromgröße (Ergebnis) korrekt auf eine über das Jahr gebundene Bestandsgröße.`
    } },
    { t: "example", title: "Tonis Foodtruck und der Hebel", html: `<p>Toni hat im Schnitt <b>30.000 € Eigenkapital</b> und <b>50.000 € Kredit</b> (4 % Zinsen = 2.000 €/Jahr) → GK 80.000 €. Ergebnis vor Steuern: <b>12.000 €</b>.</p>
<ul><li><b>ROE</b> = 12.000 / 30.000 = <b>40 %</b></li>
<li><b>ROA</b> = (12.000 + 2.000) / 80.000 = <b>17,5 %</b></li>
<li>Leverage-Formel: 17,5 % + (17,5 % − 4 %) × 50.000/30.000 = 17,5 % + 22,5 % = <b>40 %</b> ✔</li></ul>
<p>Weil der Truck 17,5 % auf jeden Euro verdient, der Kredit aber nur 4 % kostet, profitiert Toni vom Hebel. Bei einem verregneten Sommer mit ROA 2 % wäre der ROE 2 % + (2 % − 4 %) × 5/3 ≈ <b>−1,3 %</b> – der Kredit „frisst“ dann sein Eigenkapital an.</p>` },
    { t: "hint", title: "Merksatz zum ROA-Zähler", html: `„<b>Wer im Nenner steht, muss auch im Zähler bezahlt werden.</b>“ Im ROE-Nenner steht nur EK → nur der Gewinn der Eigentümer. Im ROA-Nenner steht EK + FK → Gewinn + Zinsen (die „Gewinnbeteiligung“ der Bank).` },
    { t: "hint", title: "Typische Prüfungsfalle", html: `Verschuldung ist <b>nicht</b> per se gut für den ROE: Der Leverage-Effekt wirkt nur positiv, solange <b>ROA &gt; FK-Zins</b>. Prüfungsfragen wie „Mehr Fremdkapital erhöht immer die EK-Rentabilität“ → falsch.` },
    { t: "hint", title: "Interpretation in Textaufgaben", html: `Nenne immer einen <b>Vergleich</b> (Vorjahr, Branche, Alternativanlage) und mindestens eine <b>Grenze</b> (Stichtag, Bewertungsspielräume, Vergangenheitsbezug). Eine einzelne Zahl „ROE 12 %“ ist ohne Vergleich weder gut noch schlecht.` }
  ],

  /* ================= Kapitel 3: Kostenrechnung ================= */
  "b3-1": [
    { t: "text", h: "Vertiefung: Kosten nach zwei Achsen ordnen", levels: {
      simple: `Kosten kann man auf zwei Arten sortieren. <b>Erstens nach der Menge:</b> Fixkosten bleiben gleich, egal ob du 10 oder 1.000 Stück machst (Miete). Variable Kosten wachsen mit jedem Stück (Material). <b>Zweitens nach der Zurechenbarkeit:</b> Einzelkosten kann man einem Produkt direkt zuordnen (das Mehl für genau diesen Kuchen), Gemeinkosten nur über einen Schlüssel (der Strom für den ganzen Laden). Je mehr man produziert, desto stärker verteilen sich die Fixkosten – jedes Stück wird billiger.`,
      normal: `<b>Achse 1 – Verhalten bei Beschäftigungsänderung:</b> Gesamtkosten K = K<sub>f</sub> + k<sub>v</sub> · x. Die <b>Stückkosten</b> k = K<sub>f</sub>/x + k<sub>v</sub> sinken mit steigender Menge (<b>Fixkostendegression</b>), weil sich der Fixblock auf mehr Stück verteilt; die variablen Stückkosten bleiben konstant (linearer Verlauf angenommen). <b>Sprungfixe</b> Kosten bleiben über einen Bereich konstant und springen dann (zweite Friseurin ab 900 Haarschnitten). <b>Kostenremanenz</b>: Bei sinkender Menge gehen Kosten langsamer zurück, als sie gestiegen sind (Kündigungsfristen, Mietverträge).<br>
<b>Achse 2 – Zurechenbarkeit zum Kostenträger (Produkt):</b> <b>Einzelkosten</b> (Fertigungsmaterial, Fertigungslöhne, Sondereinzelkosten wie eine Spezialform) direkt; <b>Gemeinkosten</b> (Miete, Verwaltung, Energie) über Kostenstellen und Zuschläge. Achtung: Die Achsen sind unabhängig! Einzelkosten sind meist variabel, Gemeinkosten können fix (Miete) oder variabel (Strom der Maschinen = „unechte Gemeinkosten“) sein.<br>
<b>Kostenartenrechnung</b> (Welche Kosten?): Übernahme aus der FIBU als Grundkosten, Korrektur um neutrale Aufwände, Ergänzung um kalkulatorische Kosten: kalk. Afa (vom Wiederbeschaffungswert, über die tatsächliche Nutzungsdauer), kalk. Zinsen (auf das betriebsnotwendige Kapital, inkl. EK), kalk. Unternehmerlohn, kalk. Miete, kalk. Wagnisse.`,
      technical: `Kostenbegriff (wertmäßig): bewerteter, sachzielbezogener Güterverbrauch. „Normalisiert“ bedeutet: zufällige Schwankungen (ein Hagelschaden, eine Großreparatur) werden über Durchschnitte (kalk. Wagnisse, Instandhaltungsrückstellung) geglättet, damit die Kalkulation stabil bleibt. Kostenfunktion linear: K(x) = K<sub>f</sub> + k<sub>v</sub>x, Grenzkosten K'(x) = k<sub>v</sub>, Durchschnittskosten k(x) = K<sub>f</sub>/x + k<sub>v</sub> → asymptotisch gegen k<sub>v</sub>. Die Fixkostendegression begründet Skaleneffekte, aber auch die Gefahr der <b>Fixkostenproportionalisierung</b> in der Vollkostenrechnung: Wer Fixkosten pro Stück verrechnet, tut so, als wären sie variabel, und trifft dadurch falsche Kurzfristentscheidungen (→ b3-3).`
    } },
    { t: "example", title: "Friseursalon Lena: Warum mehr Kunden jeden Haarschnitt billiger machen", html: `<p>Lenas monatliche <b>Fixkosten</b>: Miete 1.800 + Personal (fix angestellt) 6.000 + Versicherung 200 + Abschreibung der Einrichtung 400 = <b>8.400 €</b>. <b>Variable Kosten</b> je Haarschnitt (Shampoo, Pflege, Einweghandtuch): <b>4 €</b>.</p>
<table class="dt"><tr><th>Haarschnitte/Monat</th><th>Gesamtkosten</th><th>Kosten je Haarschnitt</th></tr>
<tr><td>600</td><td>8.400 + 600 × 4 = 10.800 €</td><td>18,00 €</td></tr>
<tr><td>800</td><td>8.400 + 800 × 4 = 11.600 €</td><td>14,50 €</td></tr></table>
<p>Zuordnung: <b>Miete = fix + Gemeinkosten</b>; <b>Shampoo = variabel + (fast) Einzelkosten</b>. Lena ist Einzelunternehmerin und zahlt sich kein Gehalt – in der Kalkulation setzt sie <b>3.000 € kalkulatorischen Unternehmerlohn</b> an (Zusatzkosten), sonst würde sie ihre Preise zu niedrig ansetzen.</p>` },
    { t: "example", title: "Dein Handyvertrag als Kostenfunktion", html: `<p>Grundgebühr <b>15 €/Monat</b> (fix) + 0,10 € je SMS ins Ausland (variabel). Schickst du 50 SMS: 15 + 5 = 20 € → 0,40 € je SMS. Schickst du 200: 15 + 20 = 35 € → 0,175 € je SMS. Gleiches Prinzip wie im Betrieb: Der Fixblock verteilt sich auf mehr Einheiten.</p>` },
    { t: "hint", title: "Eselsbrücke: zwei Fragen, zwei Achsen", html: `„<b>Ändert es sich mit der Menge?</b>“ → fix/variabel. „<b>Kann ich es einem Stück direkt zuordnen?</b>“ → Einzel-/Gemeinkosten. Beide Fragen getrennt beantworten – „Gemeinkosten sind fix“ ist <i>kein</i> Gesetz.` },
    { t: "hint", title: "Typische Prüfungsfalle", html: `Zeitabhängige (lineare) Abschreibung ist <b>fix</b>, auch wenn sie „Afa“ heißt. Nur eine leistungsabhängige Afa (je Maschinenstunde) wäre variabel. Und: Akkordlöhne sind variabel, Zeitlöhne/Gehälter fix.` },
    { t: "hint", title: "Kalkulatorische Kosten – schnell zuordnen", html: `Kalk. Afa, kalk. Zinsen auf <i>gesamtes</i> Kapital = meist <b>Anderskosten</b> (gibt es in der FIBU in anderer Höhe). Kalk. Unternehmerlohn (e.U./OG), kalk. Miete für eigene Räume, kalk. EK-Zinsen = <b>Zusatzkosten</b>.` }
  ],

  "b3-2": [
    { t: "text", h: "Vertiefung: Vom BAB zum Angebotspreis", levels: {
      simple: `Gemeinkosten wie Miete oder Buchhaltung kann man keinem einzelnen Produkt direkt zuordnen. Darum sammelt man sie zuerst dort, wo sie entstehen (<b>Kostenstellen</b>: Einkauf/Lager, Produktion, Verwaltung, Vertrieb). Dann rechnet man aus, wie viel Prozent „Aufschlag“ jede Stelle auf ihre direkten Kosten braucht. Mit diesen Prozentsätzen kalkuliert man jeden Auftrag: direkte Kosten + Aufschläge = Selbstkosten, plus Gewinn = Preis.`,
      normal: `<b>Schritt 1 – BÜB</b> (Betriebsüberleitungsbogen): FIBU-Aufwände → Kosten (neutrale Aufwände raus, kalkulatorische Kosten rein).<br>
<b>Schritt 2 – BAB</b> (Betriebsabrechnungsbogen): Gemeinkosten auf Kostenstellen verteilen – direkt (Gehalt der Lagerleiterin → Lager) oder über Schlüssel (Miete nach m², Strom nach kWh). <b>Hilfskostenstellen</b> (Reinigung, Fuhrpark, IT) erbringen Leistungen für andere Stellen und werden anschließend auf die <b>Hauptkostenstellen</b> umgelegt. Beim <b>Stufenleiterverfahren</b> wird eine Hilfsstelle nach der anderen abgerechnet; Leistungen „zurück“ an bereits abgerechnete Stellen werden ignoriert.<br>
<b>Schritt 3 – Zuschlagssätze</b>: MGK-Zuschlag = MGK / Fertigungsmaterial; FGK-Zuschlag = FGK / Fertigungslöhne; VwGK- und VtGK-Zuschlag = jeweils / Herstellkosten.<br>
<b>Schritt 4 – Zuschlagskalkulation</b> (Kostenträgerstückrechnung):<br>
Fertigungsmaterial (FM) + MGK = <b>Materialkosten</b><br>
Fertigungslöhne (FL) + FGK + SEK der Fertigung = <b>Fertigungskosten</b><br>
Materialkosten + Fertigungskosten = <b>Herstellkosten (HK)</b><br>
HK + VwGK + VtGK + SEK des Vertriebs = <b>Selbstkosten (SK)</b><br>
SK + Gewinnzuschlag = Nettoverkaufspreis (ggf. + Rabatte/Skonti „im Hundert“ zurückrechnen).`,
      technical: `Die Zuschlagskalkulation unterstellt Proportionalität zwischen Bezugsgröße (FM, FL, HK) und Gemeinkosten. Bei hoher Automatisierung ist der Fertigungslohn eine schlechte Bezugsgröße (Zuschläge von 500 %+); dann <b>Maschinenstundensatzrechnung</b>: maschinenabhängige FGK / Maschinenlaufzeit; Rest-FGK weiterhin auf FL. Das Stufenleiterverfahren ist exakt nur, wenn die Hilfsstellen so gereiht werden, dass möglichst wenige Rückflüsse entstehen (zuerst die Stelle, die am meisten an andere liefert, am wenigsten empfängt). Exakt wäre das Gleichungsverfahren (simultane Lösung). Als Vollkostenrechnung verteilt die Zuschlagskalkulation auch Fixkosten auf das Stück → nur bei Normalauslastung aussagekräftig.`
    } },
    { t: "example", title: "Café Mila kalkuliert ein Catering-Buffet", html: `<p>Eine Firma bestellt ein Kuchenbuffet. Milas BAB liefert die Zuschlagssätze: MGK 10 %, FGK 120 % (auf Löhne), VwGK 15 %, VtGK 5 % (beide auf HK). Gewinnzuschlag 10 %.</p>
<table class="dt"><tr><th>Schritt</th><th>€</th></tr>
<tr><td>Fertigungsmaterial (Mehl, Butter, Obst)</td><td>200,00</td></tr>
<tr><td>+ MGK 10 % (Einkauf, Kühlraum)</td><td>20,00</td></tr>
<tr><td>+ Fertigungslöhne (Backzeit Konditorin)</td><td>150,00</td></tr>
<tr><td>+ FGK 120 % (Ofen, Küchenmiete, Strom)</td><td>180,00</td></tr>
<tr><td><b>= Herstellkosten</b></td><td><b>550,00</b></td></tr>
<tr><td>+ VwGK 15 % (Buchhaltung, Büro)</td><td>82,50</td></tr>
<tr><td>+ VtGK 5 % (Lieferung, Werbung)</td><td>27,50</td></tr>
<tr><td><b>= Selbstkosten</b></td><td><b>660,00</b></td></tr>
<tr><td>+ Gewinn 10 %</td><td>66,00</td></tr>
<tr><td><b>= Nettoangebotspreis</b></td><td><b>726,00</b></td></tr></table>
<p><b>Mini-BAB dahinter:</b> Die Hilfskostenstelle „Reinigung“ (1.200 €/Monat) wird zu 60 % auf die Küche (720 €) und zu 40 % auf den Service (480 €) umgelegt – so landet die Reinigung in den FGK.</p>` },
    { t: "hint", title: "Eselsbrücke für das Kalkulationsschema", html: `„<b>M</b>ama <b>F</b>ährt <b>H</b>eute <b>V</b>iele <b>S</b>trecken“: <b>M</b>aterialkosten + <b>F</b>ertigungskosten = <b>H</b>erstellkosten + <b>V</b>erwaltung/Vertrieb = <b>S</b>elbstkosten.` },
    { t: "hint", title: "Typische Prüfungsfalle: Bezugsbasis", html: `VwGK und VtGK werden auf die <b>Herstellkosten</b> aufgeschlagen, nicht auf das Material oder die Löhne. Und die FGK auf die <b>Fertigungslöhne</b>, nicht auf die Materialkosten. Immer zuerst prüfen: „Prozent wovon?“` },
    { t: "hint", title: "Zuschlagssatz aus dem BAB berechnen", html: `Zuschlagssatz = Gemeinkosten der Stelle / Bezugsgröße × 100. Beispiel: VwGK 16.500 €, HK des Umsatzes 110.000 € → 15 %. Erst die Summe der Stelle <i>nach</i> Umlage der Hilfsstellen nehmen!` }
  ],

  "b3-3": [
    { t: "text", h: "Vertiefung: Warum Vollkosten kurzfristig in die Irre führen", levels: {
      simple: `Fixkosten (Miete, Gehälter) musst du zahlen, egal ob du ein Produkt verkaufst oder nicht. Darum fragt die Deckungsbeitragsrechnung nur: <b>Bringt dieses Produkt mehr Geld, als es zusätzlich kostet?</b> Wenn ja, hilft es, die Miete mitzuzahlen – auch wenn es nach der „vollen“ Rechnung Verlust macht. Wer es streicht, spart nur die variablen Kosten, die Miete bleibt.`,
      normal: `<b>Deckungsbeitrag je Stück</b> db = p − k<sub>v</sub>. <b>Gesamt-DB</b> = Σ db · x. <b>Betriebsergebnis</b> = Gesamt-DB − Fixkosten.<br>
<b>Einstufige DB-Rechnung</b>: alle Fixkosten als ein Block. Problem: Man sieht nicht, welche Fixkosten bei Wegfall eines Produkts tatsächlich wegfallen würden.<br>
<b>Mehrstufige DB-Rechnung</b> (stufenweise Fixkostendeckung): Fixkosten werden so tief wie möglich zugeordnet:<br>
DB I = Erlöse − variable Kosten<br>
− erzeugnisfixe Kosten (nur für dieses Produkt, z. B. Spezialgerät) = DB II<br>
− erzeugnisgruppenfixe Kosten (z. B. Kühlvitrine für alle Kuchen) = DB III<br>
− bereichsfixe Kosten = DB IV<br>
− unternehmensfixe Kosten (Geschäftsführung, Buchhaltung) = Betriebsergebnis.<br>
Ein negativer DB II heißt: Das Produkt deckt nicht einmal die Kosten, die <i>nur</i> seinetwegen entstehen → Streichkandidat (sofern die Fixkosten abbaubar sind und keine Verbundeffekte bestehen). Ein negativer Vollkostengewinn bei positivem DB II heißt dagegen: Behalten!<br>
<b>Vollkostenrechnung</b>: liefert die langfristige Preisuntergrenze und ist für Bilanzierung (Herstellungskosten) nötig. <b>Teilkostenrechnung</b>: für kurzfristige Entscheidungen (Zusatzauftrag, Sortiment, Make-or-Buy).`,
      technical: `Die Vollkostenrechnung proportionalisiert Fixkosten: k = K<sub>f</sub>/x + k<sub>v</sub>. Sinkt die Menge, steigen die verrechneten Stückkosten; erhöht man deshalb den Preis, sinkt die Menge weiter → <b>Todesspirale</b> („sich aus dem Markt kalkulieren“). Entscheidungsrelevant sind nur Kosten, die sich durch die Entscheidung ändern (relevante Kosten); bereits gebundene Fixkosten sind <i>sunk</i>/irrelevant. Der Deckungsbeitrag ist damit die Erfolgsgröße eines Produkts im Kurzfristkalkül. Die DB-Rechnung (direct costing) setzt die Spaltung in fix/variabel voraus – bei Mischkosten über Kostenauflösung (z. B. Zwei-Punkte-Methode).`
    } },
    { t: "example", title: "Café Mila: Bagels streichen oder nicht?", html: `<p>Monatsdaten (netto):</p>
<table class="dt"><tr><th>Produkt</th><th>Preis</th><th>k<sub>v</sub></th><th>db</th><th>Menge</th><th>DB I</th></tr>
<tr><td>Cappuccino</td><td>3,80</td><td>0,90</td><td>2,90</td><td>3.000</td><td>8.700</td></tr>
<tr><td>Kuchen</td><td>4,20</td><td>1,70</td><td>2,50</td><td>1.200</td><td>3.000</td></tr>
<tr><td>Bagel</td><td>5,50</td><td>3,10</td><td>2,40</td><td>800</td><td>1.920</td></tr></table>
<p>Summe DB I = 13.620 €; Fixkosten gesamt 11.000 € → <b>Betriebsergebnis +2.620 €</b>.</p>
<p><b>Mehrstufig:</b> Von den 11.000 € entfallen 2.100 € nur auf die Bagels (geleaster Spezialtoaster + Aushilfsstunden). DB II Bagel = 1.920 − 2.100 = <b>−180 €</b>. Werden Bagels gestrichen und fallen diese 2.100 € wirklich weg: Ergebnis = 8.700 + 3.000 − 8.900 = <b>2.800 €</b> (+180). Wären die 2.100 € dagegen nicht abbaubar (Leasingvertrag läuft noch 2 Jahre), würde das Streichen das Ergebnis um 1.920 € verschlechtern.</p>` },
    { t: "hint", title: "Merksatz", html: `„<b>Fixkosten sind kurzfristig egal – sie sind sowieso da.</b>“ Entscheidend ist, welche Kosten durch die Entscheidung <i>wegfallen</i> oder <i>dazukommen</i>.` },
    { t: "hint", title: "Typische Prüfungsfalle", html: `„Produkt X macht nach Vollkosten Verlust → streichen“ ist fast immer die falsche Antwort. Richtig: Solange <b>DB &gt; 0</b> und keine bessere Verwendung der Kapazität existiert, behalten.` },
    { t: "hint", title: "So rechnest du mehrstufig", html: `Tabelle mit Produkten als Spalten anlegen. Zeilenweise: Erlöse − k<sub>v</sub> = DB I; − erzeugnisfixe = DB II; Produkte zu Gruppen zusammenfassen; − gruppenfixe = DB III; Summe − unternehmensfixe = Ergebnis. Fixkosten nie auf eine Stufe schreiben, auf der sie nicht verursacht werden.` }
  ],

  "b3-4": [
    { t: "text", h: "Vertiefung: Drei Entscheidungen mit dem Deckungsbeitrag", levels: {
      simple: `<b>Break-Even</b>: Wie viele Stück muss ich verkaufen, damit alle Fixkosten bezahlt sind? Fixkosten durch den Gewinn pro Stück vor Fixkosten (DB). <b>Preisuntergrenze</b>: Wie billig darf ich höchstens werden? Kurzfristig reicht es, die variablen Kosten zu decken, langfristig müssen alle Kosten gedeckt sein. <b>Engpass</b>: Wenn die Zeit knapp ist, verkaufe zuerst das, was pro Minute am meisten bringt – nicht pro Stück.`,
      normal: `<b>Break-Even-Menge</b> x<sub>BE</sub> = K<sub>f</sub> / db. Ab hier liefert jedes weitere Stück den vollen db als Gewinn. <b>Break-Even-Umsatz</b> = x<sub>BE</sub> · p. <b>Sicherheitsabstand</b> = (Ist-Menge − x<sub>BE</sub>) / Ist-Menge: Um wie viel Prozent darf der Absatz fallen, bevor Verlust entsteht? Mit Zielgewinn: x = (K<sub>f</sub> + G) / db.<br>
<b>Preisuntergrenze (PUG)</b>:<br>
– <i>kurzfristig, freie Kapazität</i>: PUG = k<sub>v</sub>. Jeder Preis darüber erhöht das Ergebnis (Zusatzauftrag).<br>
– <i>langfristig</i>: PUG = volle Stückkosten (k<sub>f</sub> + k<sub>v</sub>), sonst wird die Substanz aufgezehrt.<br>
– <i>bei Engpass</i>: PUG = k<sub>v</sub> + entgangener DB der verdrängten Produkte (Opportunitätskosten).<br>
<b>Programmplanung</b>: Ohne Engpass alle Produkte mit db &gt; 0 produzieren. Mit <b>einem</b> Engpass (Maschinenzeit, Ofen, Personal) Rangfolge nach <b>relativem DB</b> = db / Engpassbedarf je Stück. Dann die Kapazität in dieser Reihenfolge füllen, bis sie aufgebraucht ist (Absatzgrenzen beachten). Bei mehreren Engpässen braucht man lineare Optimierung.<br>
Qualitative Aspekte nicht vergessen: Ein Billig-Zusatzauftrag kann Stammkunden verärgern, die davon erfahren; ein „Lockvogel“-Produkt mit niedrigem DB bringt vielleicht Kunden für andere Produkte (Verbundeffekte).`,
      technical: `Break-Even im Umsatz: U<sub>BE</sub> = K<sub>f</sub> / DB-Quote, DB-Quote = db/p. Bei mehreren Produkten: durchschnittlicher, mengengewichteter db bei konstantem Absatzmix. Relativer DB maximiert den Gesamt-DB unter einer linearen Restriktion Σ a<sub>i</sub>x<sub>i</sub> ≤ C (Greedy ist hier optimal, da kontinuierliches Rucksackproblem). Die Engpass-PUG ergibt sich aus der Bedingung, dass der Zusatzauftrag mindestens den DB der verdrängten Menge ersetzen muss: p ≥ k<sub>v</sub> + (rel. DB des verdrängten Produkts × Engpassbedarf des Zusatzauftrags je Stück).`
    } },
    { t: "example", title: "Tonis Foodtruck: Break-Even und Firmenfest", html: `<p>Fixkosten pro Monat (Kreditzinsen, Afa, Standplatz, Versicherung, Aushilfe): <b>4.800 €</b>. Burger: Preis netto <b>9 €</b>, variable Kosten (Fleisch, Brötchen, Sauce, Verpackung) <b>3 €</b> → db = <b>6 €</b>.</p>
<ul><li><b>Break-Even</b> = 4.800 / 6 = <b>800 Burger/Monat</b> (≈ 27 pro Tag bei 30 Tagen). Verkauft er 1.000, ist der Gewinn 200 × 6 = 1.200 €; Sicherheitsabstand 20 %.</li>
<li><b>Zusatzauftrag</b>: Eine Firma will an einem ohnehin freien Montag 200 Burger zu je <b>5 €</b>. 5 &gt; 3 = k<sub>v</sub> → annehmen: +200 × 2 = <b>+400 €</b>. Langfristig dürfte Toni aber nicht alle Burger um 5 € verkaufen: Bei 1.000 Burgern liegen die vollen Stückkosten bei 3 + 4,80 = 7,80 €.</li></ul>` },
    { t: "example", title: "Engpass Grillplatte: Burger oder Wrap?", html: `<p>Die Mittagszeit hat <b>240 Grillminuten</b>. Burger: db 6 €, 3 min → <b>2,00 €/min</b>. Wrap: db 4 €, 1,5 min → <b>2,67 €/min</b>. Nachfrage: 60 Burger, 80 Wraps.</p>
<ul><li>Nach relativem DB: zuerst 80 Wraps (120 min), dann 40 Burger (120 min) → DB = 320 + 240 = <b>560 €</b>.</li>
<li>Nach absolutem DB (Burger zuerst): 60 Burger (180 min) + 40 Wraps (60 min) → 360 + 160 = <b>520 €</b>.</li></ul>
<p><b>PUG bei Engpass:</b> Jemand will mittags zusätzlich 20 Burger. Das kostet 60 min = 40 verdrängte Wraps = 160 € entgangener DB → 8 € je Burger. PUG = 3 + 8 = <b>11 €</b>.</p>` },
    { t: "hint", title: "Eselsbrücke Break-Even", html: `„<b>Fixkosten geteilt durch das, was jedes Stück für die Fixkosten übrig lässt.</b>“ Nie durch den Preis teilen – das ist der häufigste Fehler.` },
    { t: "hint", title: "Typische Prüfungsfalle: Engpass", html: `Ist ein Engpass gegeben, ist die Reihenfolge nach <b>absolutem</b> db falsch. Immer db <b>pro Engpasseinheit</b> (Minute, Maschinenstunde, kg Rohstoff) rechnen. Ohne Engpass dagegen ist der relative DB irrelevant.` },
    { t: "hint", title: "Welche PUG ist gefragt?", html: `Lies genau: „freie Kapazität / kurzfristig“ → k<sub>v</sub>. „langfristig“ → volle Stückkosten. „Kapazität ausgelastet“ → k<sub>v</sub> + entgangener DB. Drei Situationen, drei Antworten.` }
  ],

  /* ================= Kapitel 4: Investitionsrechnung ================= */
  "b4-1": [
    { t: "text", h: "Vertiefung: Vier statische Verfahren, eine Logik", levels: {
      simple: `Statische Verfahren tun so, als wäre jedes Jahr gleich – ein „Durchschnittsjahr“. Man rechnet aus, was eine Anschaffung pro Jahr kostet (Abnutzung + entgangene Zinsen + laufende Kosten) und was sie bringt. Dann fragt man: Welche Variante ist billiger? Welche bringt mehr Gewinn? Wie viel Prozent verdient das eingesetzte Geld? Nach wie vielen Jahren ist das Geld wieder da? Schnell und einfach – aber wann genau das Geld fließt, ist egal.`,
      normal: `Alle statischen Verfahren bauen auf denselben zwei <b>Kapitalkosten</b> auf:<br>
<b>Kalkulatorische Abschreibung</b> = (AK − RW) / ND: der Wertverlust pro Jahr.<br>
<b>Kalkulatorische Zinsen</b> = (AK + RW) / 2 × i: Das Kapital ist im Schnitt zur Hälfte gebunden (linear vom AK auf den RW abgebaut) – darauf entgehen Zinsen (Opportunitätskosten). Bei nicht abnutzbarem Vermögen (Grundstück) bleibt der volle Betrag gebunden.<br>
<b>1. Kostenvergleich</b>: Summe aus kalk. Afa + kalk. Zinsen + Betriebskosten (fix + variabel) je Periode oder je Stück. Nur relative Aussage (A billiger als B), weil Erlöse fehlen. <b>Kritische Menge</b>: K<sub>fA</sub> + k<sub>vA</sub>x = K<sub>fB</sub> + k<sub>vB</sub>x → x* = (K<sub>fB</sub> − K<sub>fA</sub>) / (k<sub>vA</sub> − k<sub>vB</sub>). Unter x* ist die Variante mit niedrigeren Fixkosten günstiger, darüber die mit niedrigeren variablen Kosten.<br>
<b>2. Gewinnvergleich</b>: ø Erlöse − ø Kosten. Absolut vorteilhaft, wenn Gewinn &gt; 0 (die Zinsen sind ja schon als Kosten abgezogen).<br>
<b>3. Rentabilität</b> = (ø Gewinn + ø kalk. Zinsen) / ø Kapitalbindung. Die Zinsen werden addiert, damit die Rendite des Projekts <i>vor</i> Kapitalkosten herauskommt – sonst würde man sie doppelt berücksichtigen. Vorteilhaft, wenn Rentabilität &gt; Kalkulationszins.<br>
<b>4. Amortisation</b> (Pay-back): Wie viele Jahre, bis das Kapital über Rückflüsse (Gewinn + Afa) zurück ist? Durchschnittsmethode: (AK − RW) / (ø Gewinn + Afa); Kumulationsmethode: Rückflüsse Jahr für Jahr aufaddieren, bis AK erreicht ist. Risikomaß, kein Rentabilitätsmaß.`,
      technical: `Kritik: (1) Durchschnittsperiode ignoriert den zeitlichen Anfall (1.000 € heute = 1.000 € in 5 Jahren). (2) Kostenvergleich und Gewinnvergleich unterstellen gleiche ND und gleiche Kapitalbindung der Alternativen; bei Unterschieden ist eine Differenzinvestition zu unterstellen. (3) Amortisationsrechnung vernachlässigt Rückflüsse nach dem Amortisationszeitpunkt und kann rentablere, langlebigere Projekte benachteiligen. (4) Die kalk. Zinsen (AK + RW)/2·i entsprechen der durchschnittlichen Kapitalbindung bei linearer Amortisation und Zahlungen am Periodenende nur näherungsweise. Dennoch in der Praxis (KMU) verbreitet, besonders als Vorauswahl vor einer dynamischen Rechnung.`
    } },
    { t: "example", title: "Café Mila: Welche Espressomaschine?", html: `<p>Kalkulationszins 6 %, Nutzungsdauer 5 Jahre, geplant 20.000 Tassen/Jahr.</p>
<table class="dt"><tr><th></th><th>Maschine A</th><th>Maschine B</th></tr>
<tr><td>AK / Restwert</td><td>8.000 / 0</td><td>14.000 / 2.000</td></tr>
<tr><td>kalk. Afa (AK − RW)/5</td><td>1.600</td><td>2.400</td></tr>
<tr><td>kalk. Zinsen (AK + RW)/2 × 6 %</td><td>240</td><td>480</td></tr>
<tr><td>sonstige Fixkosten (Wartung)</td><td>300</td><td>200</td></tr>
<tr><td><b>Fixkosten/Jahr</b></td><td><b>2.140</b></td><td><b>3.080</b></td></tr>
<tr><td>variable Kosten je Tasse (Strom, Wasser)</td><td>0,05</td><td>0,03</td></tr>
<tr><td><b>Gesamtkosten bei 20.000 Tassen</b></td><td><b>3.140</b></td><td><b>3.680</b></td></tr></table>
<p><b>Kritische Menge</b> = (3.080 − 2.140) / (0,05 − 0,03) = <b>47.000 Tassen/Jahr</b>. Erst ab diesem Absatz lohnt sich die teurere, sparsamere Maschine B. Mila bleibt bei A.</p>` },
    { t: "example", title: "Solarpaneel am Foodtruck: Rentabilität und Amortisation", html: `<p>Toni überlegt ein Solarpaneel um <b>6.000 €</b> (ND 8 Jahre, RW 0, Kalkulationszins 5 %). Es spart Generator-Diesel um <b>1.350 €/Jahr</b>.</p>
<ul><li>kalk. Afa = 6.000 / 8 = 750; kalk. Zinsen = 6.000/2 × 5 % = 150</li>
<li>ø Gewinn = 1.350 − 750 − 150 = <b>450 €</b> &gt; 0 → absolut vorteilhaft</li>
<li><b>Rentabilität</b> = (450 + 150) / 3.000 = <b>20 %</b> &gt; 5 % ✔</li>
<li><b>Amortisation</b> (Durchschnittsmethode) = 6.000 / (450 + 750) = <b>5 Jahre</b> – vor dem Ende der Nutzungsdauer (8 J.) ✔</li></ul>` },
    { t: "hint", title: "Eselsbrücke Kapitalbindung", html: `<b>Abschreibung: Minus</b> (AK − RW) – was verloren geht. <b>Zinsen: Plus</b> (AK + RW)/2 – was im Schnitt gebunden ist. „Abschreibung zieht ab, Zinsen zählen zusammen.“` },
    { t: "hint", title: "Typische Prüfungsfalle", html: `Bei der Rentabilität die <b>Zinsen wieder addieren</b> und durch die <b>durchschnittliche</b> Kapitalbindung (AK + RW)/2 teilen, nicht durch die AK. Und: Der Kostenvergleich kann nie sagen, ob sich eine Investition <i>überhaupt</i> lohnt – nur welche billiger ist.` },
    { t: "hint", title: "Kritische Menge schnell finden", html: `Fixkosten-Differenz durch variable-Kosten-Differenz, jeweils „größer minus kleiner“. Plausibilitätscheck: Die Alternative mit den höheren Fixkosten muss die niedrigeren variablen Kosten haben, sonst gibt es keinen Schnittpunkt (eine Variante dominiert).` }
  ],

  "b4-2": [
    { t: "text", h: "Vertiefung: Zeitwert des Geldes – Kapitalwert, Annuität, interner Zins", levels: {
      simple: `Ein Euro heute ist mehr wert als ein Euro in fünf Jahren, weil du ihn heute anlegen und Zinsen kassieren könntest. Darum „schrumpft“ man künftige Zahlungen auf ihren heutigen Wert (<b>Abzinsen</b>). Zählt man alle abgezinsten Rückflüsse zusammen und zieht die Anschaffung ab, erhält man den <b>Kapitalwert</b>. Ist er positiv, verdient die Investition mehr als deine Mindestverzinsung.`,
      normal: `<b>Auf- und Abzinsen</b>: Endwert EW = BW · (1+i)<sup>n</sup>; Barwert BW = EW · (1+i)<sup>−n</sup>. Beispiel: 1.000 € in 10 Jahren bei 5 % sind heute 613,91 € wert; 1.000 € heute wachsen auf 1.628,89 €.<br>
<b>Kapitalwert (KW)</b> = −A<sub>0</sub> + Σ (E<sub>t</sub> − A<sub>t</sub>)·(1+i)<sup>−t</sup> + RW·(1+i)<sup>−n</sup>. Der Kalkulationszins i ist die Mindestrendite (z. B. Kreditzins oder Rendite der besten Alternative). <b>KW &gt; 0</b>: Kapital wird zurückgewonnen, mit i verzinst, und es bleibt ein Überschuss (heutiger Wert) – vorteilhaft. <b>KW = 0</b>: genau i verdient. <b>KW &lt; 0</b>: weniger als i.<br>
Sind die Rückflüsse jedes Jahr gleich, hilft der <b>Rentenbarwertfaktor</b> RBF = (1 − (1+i)<sup>−n</sup>)/i.<br>
<b>Annuität</b> = KW · Wiedergewinnungsfaktor = KW · i / (1 − (1+i)<sup>−n</sup>): verteilt den KW gleichmäßig auf die Jahre – „zusätzlicher Gewinn pro Jahr“. Gut für den Vergleich von Projekten mit unterschiedlicher Laufzeit.<br>
<b>Interner Zinsfuß (IZF)</b>: jener Zins, bei dem KW = 0 – die effektive Rendite des Projekts. Vorteilhaft, wenn IZF &gt; Kalkulationszins. Berechnung: Probieren mit zwei Zinssätzen (einer mit KW &gt; 0, einer mit KW &lt; 0) und linear interpolieren, oder Excel (IRR/IKV, Zielwertsuche).<br>
Je höher der Kalkulationszins, desto kleiner der KW, weil spätere Zahlungen stärker abgezinst werden.`,
      technical: `Prämissen: sichere Zahlungsströme, Zahlungen am Periodenende, vollkommener Kapitalmarkt (Soll = Haben, unbeschränkt), Wiederanlage der Rückflüsse zu i (KW) bzw. zum IZF selbst (IZF-Methode – unrealistisch bei hohen IZF). Bei nicht-normalen Zahlungsreihen (mehrere Vorzeichenwechsel) kann es mehrere oder keinen IZF geben. Bei sich ausschließenden Alternativen können KW- und IZF-Ranking divergieren (unterschiedliche Kapitaleinsätze/Laufzeiten); maßgeblich ist dann der KW, da er den absoluten Vermögenszuwachs misst. Die lineare Interpolation r ≈ i<sub>1</sub> − KW<sub>1</sub>·(i<sub>2</sub> − i<sub>1</sub>)/(KW<sub>2</sub> − KW<sub>1</sub>) überschätzt den IZF leicht, weil die KW-Funktion konvex ist; je enger i<sub>1</sub> und i<sub>2</sub>, desto genauer. Finanzierung zu genau i verändert den KW nicht (Barwert der Kreditraten = Kreditbetrag).`
    } },
    { t: "example", title: "Lohnt sich ein zweiter Foodtruck?", html: `<p>Toni überlegt einen zweiten Truck: Anschaffung <b>50.000 €</b>, 5 Jahre lang Rückflüsse von <b>15.000 €/Jahr</b>, am Ende Verkauf um <b>5.000 €</b>. Kalkulationszins <b>8 %</b>.</p>
<ul><li>RBF(8 %, 5 J.) = 3,99271 → Barwert der Rückflüsse = 15.000 × 3,99271 = 59.890,65 €</li>
<li>Barwert Restwert = 5.000 × 1,08<sup>−5</sup> = 3.402,92 €</li>
<li><b>KW</b> = −50.000 + 59.890,65 + 3.402,92 = <b>+13.293,57 €</b> → vorteilhaft</li>
<li><b>Annuität</b> = 13.293,57 × 0,08 / (1 − 1,08<sup>−5</sup>) = <b>3.329,46 €/Jahr</b> Überschuss</li>
<li><b>IZF</b>: KW(16 %) = +1.494,97; KW(18 %) = −906,89 → r ≈ 16 % − 1.494,97 × 2 % / (−906,89 − 1.494,97) ≈ <b>17,24 %</b> (exakt ≈ 17,23 %) &gt; 8 % ✔</li></ul>` },
    { t: "example", title: "Auto: Kaufen oder Leasen?", html: `<p>Kevin braucht für 3 Jahre ein Auto (Listenpreis 24.000 €). Sein Vergleichszins (Kredit bzw. entgangene Sparzinsen) ist <b>5 %</b>. Betriebskosten sind gleich und werden weggelassen.</p>
<ul><li><b>Kaufen</b>: heute −24.000, nach 3 Jahren Verkauf um 13.000. Barwert der Kosten = 24.000 − 13.000 × 1,05<sup>−3</sup> = <b>12.770,11 €</b>.</li>
<li><b>Leasing</b>: heute 3.000 Anzahlung + am Ende jedes Jahres 3.500, Auto wird zurückgegeben. Barwert = 3.000 + 3.500 × 2,72325 = <b>12.531,37 €</b> (nominell 13.500 €).</li></ul>
<p>Leasing ist hier um ca. 239 € (Barwert) günstiger. <b>Kaufen auf Kredit</b> zu genau 5 % (jährliche Rate 8.813,01 €, Summe 26.439,02 €) ändert am Kauf-Barwert nichts: Der Barwert der Raten ist genau 24.000 €. Erst ein Kreditzins über dem Vergleichszins würde den Kauf verteuern. Achtung bei Leasing: Kilometerlimits und Schadensabrechnung bei Rückgabe können den Vorteil auffressen.</p>` },
    { t: "hint", title: "Eselsbrücke: Hoch-n und Minus-n", html: `<b>In die Zukunft</b> (aufzinsen) = mal (1+i)<sup>n</sup> – Geld wächst. <b>In die Gegenwart</b> (abzinsen) = mal (1+i)<sup>−n</sup> – Geld schrumpft. Der KW holt alles in die Gegenwart („Was ist es mir <i>heute</i> wert?“).` },
    { t: "hint", title: "Typische Prüfungsfalle", html: `Die Anschaffung A<sub>0</sub> zum Zeitpunkt 0 wird <b>nicht</b> abgezinst. Der Restwert im letzten Jahr dagegen schon (mit n). Und: KW = 0 heißt <b>nicht</b> „kein Gewinn“ – das Projekt verdient genau den Kalkulationszins.` },
    { t: "hint", title: "Interpolation – so gehst du vor", html: `1) Zwei Zinssätze wählen, die den KW einmal positiv, einmal negativ machen. 2) In r = i<sub>1</sub> − KW<sub>1</sub> × (i<sub>2</sub> − i<sub>1</sub>)/(KW<sub>2</sub> − KW<sub>1</sub>) einsetzen. 3) Plausibilität: r muss zwischen i<sub>1</sub> und i<sub>2</sub> liegen, näher bei dem Zins, dessen KW näher an 0 ist.` }
  ],

  /* ================= Kapitel 5: Finanzierung ================= */
  "b5-1": [
    { t: "text", h: "Vertiefung: Woher kommt das Geld – und wer hat welche Rechte?", levels: {
      simple: `Finanzierungsformen sortiert man nach zwei Fragen. <b>Woher kommt das Geld?</b> Von außen (Bank, neue Teilhaber, Lieferanten) oder von innen (aus dem eigenen Geschäft: Gewinne behalten, Abschreibungen verdienen). <b>Wem gehört es?</b> Eigenkapital gehört den Eigentümern (Mitsprache, Gewinnanteil, haftet zuerst), Fremdkapital ist geliehen (Zinsen, Rückzahlung, kein Mitspracherecht). Dazwischen gibt es Mischformen (Mezzanin).`,
      normal: `<b>Außenfinanzierung</b>:<br>
– <i>Eigenfinanzierung</i> (Beteiligungsfinanzierung): Einlagen der Gesellschafter, Kapitalerhöhung, Business Angels, Venture Capital. Kein fixer Zins, keine Rückzahlungspflicht, dafür Mitsprache und Gewinnbeteiligung.<br>
– <i>Fremdfinanzierung</i> (Kreditfinanzierung): Bankkredit, Kontokorrent, Anleihe, Lieferantenkredit, Kundenanzahlung. Fixer Zins, befristet, Gläubiger haben Vorrang in der Insolvenz, oft Sicherheiten nötig.<br>
<b>Innenfinanzierung</b> (aus dem Umsatzprozess): <i>Selbstfinanzierung</i> (Gewinnthesaurierung – Gewinne werden nicht ausgeschüttet), <i>Finanzierung aus Abschreibungsrückflüssen</i> (die Afa ist in den Preisen einkalkuliert, fließt über Umsätze als Geld zurück, ohne dass Geld abfließt), <i>Finanzierung aus Rückstellungen</i> (Aufwand heute, Auszahlung erst später – z. B. Abfertigung; das Geld bleibt bis dahin im Unternehmen), <i>Vermögensumschichtung</i> (Verkauf nicht benötigter Anlagen, Factoring).<br>
<b>Mezzanin/Hybrid</b>: Nachrangdarlehen, Genussrechte, stille Beteiligung, partiarisches Darlehen (Zins abhängig vom Gewinn). Rechtlich meist FK, wirtschaftlich eigenkapitalähnlich, weil im Insolvenzfall nachrangig. Banken werten Nachrangkapital oft als „wirtschaftliches EK“ → verbessert das Rating.<br>
<b>Kreditsubstitute</b>: <i>Leasing</i> (Nutzung gegen Rate, Eigentum bleibt beim Leasinggeber) und <i>Factoring</i> (Verkauf von Forderungen).`,
      technical: `Der <b>Lieferantenkredit</b> ist einer der teuersten Kredite: Bei „2 % Skonto innerhalb 10 Tagen, netto 30 Tage“ zahlt man für 20 Tage zusätzliches Ziel 2 % des Betrags. Effektiver Jahreszins ≈ Skontosatz / (100 − Skontosatz) × 360 / (Zahlungsziel − Skontofrist) = 2/98 × 360/20 ≈ 36,7 % p. a. Ein Kontokorrentkredit zu 8–12 % zur Skontoziehung ist daher fast immer günstiger. Der <b>Kapazitätserweiterungseffekt</b> (Lohmann-Ruchti-Effekt) beschreibt, dass reinvestierte Abschreibungsrückflüsse bei gleichbleibendem Kapitaleinsatz die Periodenkapazität erhöhen können (Annahmen: Afa im Preis verdient, sofortige Reinvestition, teilbare Anlagen). Rangfolge in der Insolvenz: besicherte Gläubiger → unbesicherte Gläubiger → Nachrangkapital → Eigenkapital.`
    } },
    { t: "example", title: "Café Mila finanziert ihre Eröffnung", html: `<p>Mila braucht <b>80.000 €</b> für Umbau, Maschinen und erste Ware:</p>
<ul><li><b>20.000 € Erspartes</b> → Außenfinanzierung, Eigenkapital (Einlage).</li>
<li><b>45.000 € Bankkredit</b>, 6 Jahre → Außenfinanzierung, Fremdkapital.</li>
<li><b>10.000 € über Crowdfunding</b> als Nachrangdarlehen von Stammgästen (Zins + Gutscheine) → Mezzanin.</li>
<li><b>Espressomaschine geleast</b> (5.000 € Wert) statt gekauft → Kreditsubstitut.</li></ul>
<p>Nach zwei Jahren lässt Mila 15.000 € Gewinn im Café, statt ihn zu entnehmen → <b>Selbstfinanzierung</b> (Innenfinanzierung). Die in den Kaffeepreisen kalkulierte Abschreibung (8.000 €/Jahr) fließt als Geld zurück → <b>Finanzierung aus Abschreibungsrückflüssen</b>, damit kann sie später neue Maschinen kaufen.</p>` },
    { t: "example", title: "Skonto: der teuerste „Kredit“ im Alltag", html: `<p>Mila erhält eine Rechnung über 2.000 € für Kaffeebohnen: „2 % Skonto bei Zahlung in 10 Tagen, netto 30 Tage“.</p>
<ul><li>Zahlt sie am 10. Tag: 1.960 €. Am 30. Tag: 2.000 €. Für 20 Tage „Kredit“ über 1.960 € zahlt sie 40 € Aufpreis.</li>
<li>Hochgerechnet: 40 / 1.960 × 360 / 20 ≈ <b>36,7 % Jahreszins</b>.</li></ul>
<p>Selbst wenn sie das Konto zu 10 % überzieht, spart sie Geld, wenn sie Skonto zieht. Dasselbe Prinzip bei dir: „Jetzt kaufen, in 30 Tagen zahlen“-Angebote beim Online-Shopping haben oft versteckte Kosten in ähnlicher Höhe.</p>` },
    { t: "hint", title: "Eselsbrücke: das Vier-Felder-Raster", html: `Zeichne ein Kreuz: oben <b>außen</b>, unten <b>innen</b>; links <b>Eigen</b>, rechts <b>Fremd</b>. Außen-Eigen = Einlagen; Außen-Fremd = Kredite; Innen-Eigen = Gewinnthesaurierung; Innen-Fremd = Rückstellungen. Afa-Rückflüsse und Vermögensumschichtung sind Innenfinanzierung ohne neue Kapitalzufuhr (Umfinanzierung).` },
    { t: "hint", title: "Typische Prüfungsfalle", html: `Rückstellungsfinanzierung ist <b>Innen</b>finanzierung, obwohl Rückstellungen <b>Fremd</b>kapital sind. Und: Nachrangdarlehen ist rechtlich Fremdkapital, wird aber als <b>Mezzanin/Hybrid</b> eingeordnet – nicht als reines Eigenkapital.` },
    { t: "hint", title: "Leasing vs. Kredit – worauf achten?", html: `Beim Kreditkauf gehört dir das Auto (Bilanz: Anlage + Verbindlichkeit). Beim (Operating-)Leasing gehört es dem Leasinggeber, du zahlst nur die Nutzung. Vergleiche immer über den <b>Barwert aller Zahlungen</b> (siehe b4-2), nicht über die Monatsrate.` }
  ],

  /* ================= Prüfungsvorbereitung (Altprüfung) ================= */
  "bx-1": [
    { t: "text", h: "Vertiefung: Wer bucht doppelt, und was unterscheidet Rückstellung von Rücklage?", levels: {
      simple: `GmbH und AG müssen immer eine richtige doppelte Buchhaltung mit Bilanz machen. Kleine Einzelunternehmer (z. B. ein Friseur als e.U.) dürfen einfacher rechnen (Einnahmen-Ausgaben-Rechnung), bis ihr Umsatz zu groß wird. Eine <b>Rückstellung</b> ist Geld, das man vermutlich jemandem schulden wird (Schuld mit unbekannter Höhe). Eine <b>Rücklage</b> ist eigenes Geld, das man im Unternehmen behält. Das klingt ähnlich, steht aber in verschiedenen Teilen der Bilanz.`,
      normal: `<b>Rechnungslegungspflicht (§ 189 UGB)</b>: Kapitalgesellschaften und GmbH &amp; Co KG immer. Andere Unternehmer ab Überschreiten der Umsatzgrenzen: 2 × hintereinander &gt; 700.000 € → Pflicht ab dem zweitfolgenden Jahr; 1 × &gt; 1 Mio. € → Pflicht ab dem folgenden Jahr. Wer nicht rechnungslegungspflichtig ist, ermittelt den Gewinn mit der <b>Einnahmen-Ausgaben-Rechnung</b> (Zufluss-Abfluss-Prinzip, einfacher).<br>
Bei doppelter Buchhaltung gilt der <b>Betriebsvermögensvergleich</b>: Gewinn = EK Ende − EK Anfang + Entnahmen − Einlagen. Entnahmen werden addiert, weil sie das EK senken, ohne Verlust zu sein; Einlagen abgezogen, weil sie das EK erhöhen, ohne Gewinn zu sein.<br>
<b>Rückstellung</b> (Fremdkapital): für Verpflichtungen, die dem Grunde oder der Höhe nach ungewiss sind (Prozesskosten, Garantien, Steuerberatung, Abfertigungen, Jubiläumsgelder). <i>Bildung</i> = Aufwand im Jahr der Verursachung (Periodengerechtigkeit). <i>Verbrauch</i>: Ist die tatsächliche Zahlung gleich hoch → ergebnisneutral; niedriger → Ertrag aus der Auflösung des Rests; höher → zusätzlicher Aufwand.<br>
<b>Rücklage</b> (Eigenkapital): <i>Kapitalrücklage</i> aus Zuführungen von außen (Agio bei Kapitalerhöhung, Gesellschafterzuschüsse), <i>Gewinnrücklage</i> aus einbehaltenen Jahresüberschüssen. Die Bildung ist Gewinnverwendung, kein Aufwand.`,
      technical: `Das Imparitätsprinzip (Vorsichtsprinzip) verlangt, drohende Verluste und ungewisse Verbindlichkeiten bereits bei Verursachung zu passivieren, Gewinne aber erst bei Realisierung zu zeigen. Rückstellungen sind mit dem bestmöglich geschätzten Erfüllungsbetrag zu bewerten; langfristige (&gt; 1 Jahr) werden abgezinst. Rückstellungen sind nicht zweckgebundenes Geld auf einem Konto – sie sind nur ein Passivposten; die Mittel stecken irgendwo im Vermögen (Innenfinanzierungseffekt bis zur Zahlung). Rücklagen sind ebenso kein Geldbestand. Gesetzliche Rücklage der AG (und großer GmbH) ist zwingend zu dotieren.`
    } },
    { t: "example", title: "Friseur-GmbH und der Rechtsstreit", html: `<p>Eine Kundin klagt die Friseursalon Lena GmbH nach einer missglückten Färbung. Der Anwalt schätzt die Kosten Ende 2025 auf <b>5.000 €</b>.</p>
<ul><li><b>2025</b>: Bildung einer Rückstellung 5.000 € → Aufwand 2025 (Gewinn −5.000), keine Auszahlung, Fremdkapital +5.000.</li>
<li><b>2026, Fall A</b>: Vergleich über genau 5.000 € → Rückstellung wird verbraucht, <b>ergebnisneutral</b>, Bank −5.000.</li>
<li><b>Fall B</b>: Es kostet nur 4.200 € → Rest 800 € wird aufgelöst = <b>Ertrag 800 €</b> im Jahr 2026.</li>
<li><b>Fall C</b>: Es kostet 6.000 € → zusätzlicher <b>Aufwand 1.000 €</b> im Jahr 2026.</li></ul>
<p><b>Rücklage dagegen:</b> Die GmbH macht 2025 30.000 € Gewinn und beschließt, 10.000 € nicht auszuschütten, sondern als Gewinnrücklage zu behalten → Eigenkapital, kein Aufwand.</p>` },
    { t: "example", title: "Café Mila e.U.: Wann muss sie bilanzieren?", html: `<p>Umsätze: 20x4 650.000 €, 20x5 720.000 €, 20x6 740.000 €. Zwei aufeinanderfolgende Jahre &gt; 700.000 € sind erstmals 20x5 und 20x6 → Pflicht ab dem zweitfolgenden Jahr nach 20x6 = <b>20x8</b> (20x7 ist das „Pufferjahr“).</p>
<p>Tonis Foodtruck e.U. dagegen macht 20x6 einmalig <b>1,05 Mio. €</b> → Pflicht schon ab <b>20x7</b>.</p>
<p><b>Gewinn per Betriebsvermögensvergleich</b> bei Mila (ab Bilanzierung): EK Anfang 30.000, EK Ende 38.000, Privatentnahmen 24.000, Einlage 5.000 → Gewinn = 38.000 − 30.000 + 24.000 − 5.000 = <b>27.000 €</b>.</p>` },
    { t: "hint", title: "Eselsbrücke: „stell“ vs. „lag“", html: `Rück<b>stell</b>ung: Geld, das man „be<b>stell</b>t“ bekommt – also zahlen muss (Schuld, Fremdkapital). Rück<b>lag</b>e: Geld, das man „auf die Seite <b>leg</b>t“ – gehört einem selbst (Eigenkapital).` },
    { t: "hint", title: "Zählen der Jahre – so geht's", html: `Schreib die Jahre als Zeitstrahl. Markiere alle Jahre &gt; 700.000 €. Zweites Jahr in Folge gefunden? → <b>+2 Jahre</b> = Pflichtbeginn. Ein Jahr &gt; 1 Mio.? → <b>+1 Jahr</b>. GmbH/AG? Sofort „Ja“, Umsätze ignorieren.` },
    { t: "hint", title: "Typische Prüfungsfalle", html: `„Die Bildung einer Rückstellung vermindert die liquiden Mittel“ → <b>falsch</b>. Aufwand ja, Auszahlung erst bei Verbrauch. Und: Beim Verbrauch in exakter Höhe gibt es <b>keinen</b> Aufwand mehr – der wurde schon im Vorjahr gebucht.` }
  ],

  "bx-2": [
    { t: "text", h: "Vertiefung: Warum das URG genau diese zwei Kennzahlen nutzt", levels: {
      simple: `Das Gesetz will Firmen warnen, bevor sie pleitegehen. Es schaut auf zwei Dinge: <b>Hat die Firma noch genug eigenes Polster?</b> (Eigenmittelquote mindestens 8 %) und <b>Könnte sie ihre Schulden in absehbarer Zeit aus dem laufenden Geschäft zurückzahlen?</b> (nicht länger als 15 Jahre). Nur wenn <b>beides</b> schlecht ist, schrillt der Alarm – dann muss die Geschäftsführung handeln, sonst haftet sie womöglich persönlich.`,
      normal: `<b>Eigenmittelquote (EMQ)</b> = Eigenmittel / Gesamtkapital × 100. Eigenmittel = Eigenkapital + unversteuerte Rücklagen (die haben Eigenkapitalcharakter). Sie misst den Verlustpuffer – die <i>Substanz</i>.<br>
<b>Fiktive Schuldentilgungsdauer (SDT)</b> = (Rückstellungen + Verbindlichkeiten − flüssige Mittel − wie flüssige Mittel verwertbare Wertpapiere) / Mittelüberschuss aus der gewöhnlichen Geschäftstätigkeit. Der Zähler ist die Nettoverschuldung, der Nenner im Grunde der Cash-Flow. Sie misst die <i>Ertragskraft</i> im Verhältnis zu den Schulden.<br>
<b>Vermutung des Reorganisationsbedarfs</b>: EMQ &lt; 8 % <b>und</b> SDT &gt; 15 Jahre. Warum beides? Ein Start-up hat oft wenig EK, aber hohe Cash-Flows (schnelle Tilgung möglich) – kein Problem. Ein etablierter Betrieb mit viel EK kann ein schwaches Jahr verkraften. Gefährlich ist die Kombination: kein Polster und keine Ertragskraft.<br>
Folge: Wird die Vermutung im Prüfbericht festgestellt und leitet die Geschäftsführung kein Reorganisationsverfahren ein, haftet sie bei späterer Insolvenz gegenüber der Gesellschaft bis zu 100.000 € pro Person (solidarisch).`,
      technical: `Ist der Mittelüberschuss ≤ 0, ist die SDT nicht definiert bzw. „unendlich“ → die Bedingung SDT &gt; 15 gilt als erfüllt. Beide Kennzahlen sind stichtagsbezogen und basieren auf dem geprüften Jahresabschluss (§§ 22–24 URG); relevant vor allem für prüfungspflichtige Kapitalgesellschaften. Die SDT ist inhaltlich identisch mit der dynamischen Verschuldungsdauer aus der Bilanzanalyse (Effektivverschuldung / Cash-Flow, b2-3). Beide Werte fließen auch in den Quicktest nach Kralicek ein (Banken-Schnelltest).`
    } },
    { t: "example", title: "Tonis Foodtruck GmbH im Krisenjahr", html: `<p>Bilanz Ende 20x6: Gesamtkapital <b>100.000 €</b>, Eigenkapital (inkl. unversteuerter Rücklagen) <b>6.000 €</b>, Rückstellungen <b>4.000 €</b>, Verbindlichkeiten <b>90.000 €</b>, Bank <b>4.000 €</b>. Mittelüberschuss (Cash-Flow) <b>5.000 €</b>.</p>
<ul><li>EMQ = 6.000 / 100.000 = <b>6 %</b> (&lt; 8 % ✗)</li>
<li>SDT = (4.000 + 90.000 − 4.000) / 5.000 = 90.000 / 5.000 = <b>18 Jahre</b> (&gt; 15 ✗)</li></ul>
<p>→ <b>Beide verletzt: Reorganisationsbedarf wird vermutet.</b> Hätte Toni dank eines guten Sommers 7.000 € Cash-Flow, wäre die SDT 90.000 / 7.000 ≈ 12,9 Jahre → keine gesetzliche Vermutung, obwohl die EMQ weiter schwach ist.</p>` },
    { t: "hint", title: "Eselsbrücke: „8 und 15 – beide müssen's sein“", html: `<b>Unter 8, über 15, und zwar beide.</b> Wie bei einer Ampel mit zwei Lichtern: Erst wenn beide rot sind, steht die Firma.` },
    { t: "hint", title: "Typische Prüfungsfalle", html: `Flüssige Mittel und verwertbare Wertpapiere werden im Zähler der SDT <b>abgezogen</b> (Nettoverschuldung). Und die unversteuerten Rücklagen gehören in der EMQ zu den <b>Eigenmitteln</b>, nicht zum Fremdkapital.` },
    { t: "hint", title: "Rechenweg in der Prüfung", html: `1) Eigenmittel zusammenzählen (EK + unversteuerte Rücklagen). 2) EMQ. 3) Rückstellungen + Verbindlichkeiten − Kassa/Bank − Wertpapiere. 4) durch Mittelüberschuss. 5) Beide Grenzwerte prüfen und <b>ausdrücklich</b> schreiben „beide erfüllt/nicht erfüllt“.` }
  ],

  "bx-3": [
    { t: "text", h: "Vertiefung: Vom Kaufpreis zur Abschreibung und in den Anlagenspiegel", levels: {
      simple: `Die <b>Anschaffungskosten</b> sind alles, was du zahlen musst, bis eine Maschine startklar ist: Preis minus Rabatte und Skonto, plus Lieferung und Aufbau. Die Umsatzsteuer zählt nicht dazu, weil das Unternehmen sie vom Finanzamt zurückbekommt. Diese Summe wird dann über die Nutzungsjahre verteilt (Abschreibung). Im ersten Jahr gilt: Läuft die Maschine ab Juli, gibt es nur die halbe Jahresabschreibung.`,
      normal: `<b>AK = Anschaffungspreis (netto) − Anschaffungspreisminderungen + Anschaffungsnebenkosten (+ nachträgliche AK)</b>.<br>
Preisminderungen: Rabatt, Skonto (nur wenn tatsächlich gezogen), Boni, nachträgliche Gutschriften. Nebenkosten: Transport, Zoll, Montage, Fundament, Probelauf, Vermittlungsprovision. <b>Nicht</b> dazu: abziehbare Vorsteuer, Finanzierungskosten (Kreditzinsen), Schulungen, laufende Wartung.<br>
<b>Lineare Afa</b> = AK / ND. <b>Halbjahresregel</b> (Steuerrecht, in der Altprüfung verwendet): Inbetriebnahme bis 30.6. → volle Jahres-Afa; ab 1.7. → halbe. Entscheidend ist die <b>Inbetriebnahme</b>, nicht Bestellung, Lieferung oder Zahlung.<br>
<b>Anlagenspiegel</b> (Anlagengitter) zeigt die Entwicklung je Position: historische AK 1.1. + Zugänge − Abgänge ± Umbuchungen = AK 31.12.; kumulierte Afa 1.1. + Afa des Jahres − Afa auf Abgänge = kum. Afa 31.12.; Buchwert = AK 31.12. − kum. Afa 31.12. Kontrollrechnung: BW 1.1. + Zugänge − Abgänge (zu BW) − Afa d. J. = BW 31.12.<br>
Aus dem Anlagenspiegel stammen die Kennzahlen aus b2-1: Anlagenabnutzungsgrad, Abschreibungsquote, Investitionsdeckung.`,
      technical: `Die AK sind nach UGB Obergrenze der Bewertung (Anschaffungskostenprinzip); Zuschreibungen dürfen sie nicht überschreiten. Skonto mindert die AK erst bei Inanspruchnahme (Nettomethode vs. Bruttomethode; bei Bruttomethode Korrektur bei Zahlung). Geringwertige Wirtschaftsgüter (AK bis 1.000 € netto, Stand 2023+) können im Anschaffungsjahr sofort voll abgeschrieben werden. Unternehmensrechtlich ist auch eine monatsgenaue (pro-rata-temporis) Afa zulässig; im Beispiel aus der Altprüfung (Inbetriebnahme 7. Juli) ergeben beide Methoden zufällig denselben Wert (6/12). Der Anlagenspiegel ist für mittelgroße und große Kapitalgesellschaften im Anhang verpflichtend.`
    } },
    { t: "example", title: "Café Mila kauft eine Siebträgermaschine", html: `<p>Listenpreis <b>9.000 € netto</b> (+ 20 % USt), 5 % Rabatt, 2 % Skonto (wird gezogen), Transport 150 €, Wasseranschluss durch den Installateur 250 €. Inbetriebnahme <b>15. September</b>, ND 5 Jahre.</p>
<table class="dt"><tr><th>Schritt</th><th>€</th></tr>
<tr><td>Listenpreis netto</td><td>9.000,00</td></tr>
<tr><td>− 5 % Rabatt</td><td>−450,00</td></tr>
<tr><td>= Zielpreis</td><td>8.550,00</td></tr>
<tr><td>− 2 % Skonto (von 8.550)</td><td>−171,00</td></tr>
<tr><td>+ Transport</td><td>150,00</td></tr>
<tr><td>+ Installation</td><td>250,00</td></tr>
<tr><td><b>= Anschaffungskosten</b></td><td><b>8.779,00</b></td></tr></table>
<p>Jahres-Afa = 8.779 / 5 = 1.755,80 €; Inbetriebnahme in der 2. Jahreshälfte → <b>Afa im 1. Jahr 877,90 €</b>. Die USt (1.710 € auf 8.550 €, bei Skontoabzug anteilig weniger) ist Vorsteuer, keine AK.</p>
<p><b>Anlagenspiegel „Betriebsausstattung“:</b> AK 1.1. 30.000 + Zugang 8.779 − Abgang (alte, voll abgeschriebene Maschine) 4.000 = <b>AK 31.12. 34.779</b>. Kum. Afa 1.1. 12.000 + Afa d. J. 3.477,90 (2.600 Altanlagen + 877,90 neu) − 4.000 Abgang = <b>11.477,90</b>. <b>Buchwert 31.12. = 23.301,10</b>. Kontrolle: BW 1.1. 18.000 + 8.779 − 0 − 3.477,90 = 23.301,10 ✔</p>` },
    { t: "hint", title: "Eselsbrücke: „Ready to run“", html: `AK = alles bis die Maschine <b>läuft</b> (Transport, Montage, Fundament), aber nichts, was danach kommt (Wartung, Schulung) und nichts, was du zurückbekommst (Vorsteuer).` },
    { t: "hint", title: "Typische Prüfungsfalle: Reihenfolge der Abzüge", html: `Skonto wird vom Betrag <b>nach</b> Rabatt berechnet, nicht vom Listenpreis. 9.000 × 0,95 = 8.550; 8.550 × 0,98 = 8.379. Wer beide Prozente vom Listenpreis abzieht (9.000 − 450 − 180), bekommt 8.370 – falsch.` },
    { t: "hint", title: "Anlagenspiegel schnell prüfen", html: `Zwei Kontrollen: (1) Zeile für Zeile BW 31.12. = AK 31.12. − kum. Afa 31.12. (2) BW 1.1. + Zugänge − Abgänge zu Buchwert − Afa d. J. = BW 31.12. Stimmen beide, sind deine Spalten richtig.` }
  ]

};
})();
