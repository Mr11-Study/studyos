/* Grundlagen der BWL 2 (GL-BWL-2) — Mag. Dr. Alexander Herbst, WS 2026/27 */
(function () {
const TOPICS = {
  "b-rw":    { name: "Grundbegriffe Rechnungswesen", lesson: "b1-1" },
  "b-ja":    { name: "Bilanz, GuV, Geschäftsfälle",  lesson: "b1-2" },
  "b-verm":  { name: "Vermögenslage",                lesson: "b2-1" },
  "b-fin":   { name: "Finanzlage & Liquidität",      lesson: "b2-2" },
  "b-cf":    { name: "Cash-Flow & KFR",              lesson: "b2-3" },
  "b-ertr":  { name: "Ertragslage",                  lesson: "b2-4" },
  "b-kore":  { name: "Kostenrechnung Grundlagen",    lesson: "b3-1" },
  "b-bab":   { name: "BÜB, BAB, Kalkulation",        lesson: "b3-2" },
  "b-db":    { name: "Deckungsbeitragsrechnung",     lesson: "b3-3" },
  "b-entsch":{ name: "PUG, Break-Even, Programm",    lesson: "b3-4" },
  "b-stat":  { name: "Statische Investitionsrechnung", lesson: "b4-1" },
  "b-dyn":   { name: "Dynamische Investitionsrechnung", lesson: "b4-2" },
  "b-finz":  { name: "Finanzierung",                 lesson: "b5-1" }
};
const K = (name, formula, meaning) => `<div class="fcard"><b>${name}</b><div class="formula">${formula}</div><small>${meaning}</small></div>`;

const WORLDS = [
 { id: "bw1", n: 1, title: "Rechnungswesen & Jahresabschluss", sub: "Wiederholung BWL 1", boss: null, lessons: [
  { id: "b1-1", title: "Externes vs. internes Rechnungswesen", topic: "b-rw", min: 10, xp: 25, blocks: [
    { t: "lead", html: "„Financial statements are like bikinis: what they show is very interesting, but what they hide is vital.“ (Abraham Briloff) – und: „Never ever learn things by heart in accounting.“" },
    { t: "widget", w: "sorter", topic: "b-rw", title: "Extern oder intern?", cats: [{ k: "e", label: "Externes RW" }, { k: "i", label: "Internes RW" }],
      items: [{ t: "Finanzbuchhaltung, Bilanzierung", a: "e", why: "" }, { t: "Jahresabschlusserstellung und -analyse", a: "e", why: "" }, { t: "Einnahmen-Ausgaben-Rechnung / Besteuerung", a: "e", why: "" }, { t: "Kostenrechnung / Controlling", a: "i", why: "" }, { t: "Investitionsrechnung", a: "i", why: "" }, { t: "Finanzierungsrechnung", a: "i", why: "" }, { t: "gesetzlich verpflichtend (UGB, EStG)", a: "e", why: "" }, { t: "freiwillig, zukunftsorientiert, unterjährig", a: "i", why: "" }] },
    { t: "text", h: "Die Begriffspaare", levels: {
      simple: "Geld, das fließt (Ein-/Auszahlung), ist nicht dasselbe wie Gewinn (Ertrag/Aufwand). Gewinn ≠ Cashflow!",
      normal: "<b>Ein-/Auszahlung</b>: Veränderung der liquiden Mittel (Kassa, Bank). <b>Einnahme/Ausgabe</b>: Veränderung des Geldvermögens (inkl. Forderungen/Verbindlichkeiten). <b>Ertrag/Aufwand</b>: Veränderung des Reinvermögens (GuV). <b>Leistung/Kosten</b>: betriebsbedingter, bewerteter Güterverbrauch bzw. -entstehung (KORE).",
      technical: "Kauf auf Ziel: Ausgabe, aber keine Auszahlung. Abschreibung: Aufwand/Kosten, aber keine Auszahlung. Kreditrückzahlung: Auszahlung, aber kein Aufwand. Kalkulatorischer Unternehmerlohn: Kosten, aber kein Aufwand (Zusatzkosten)." } },
    { t: "widget", w: "sorter", topic: "b-rw", title: "Was liegt vor?", intro: "Wähle die jeweils zutreffende Kategorie.", cats: [{ k: "aus", label: "Auszahlung, kein Aufwand" }, { k: "auf", label: "Aufwand, keine Auszahlung" }, { k: "beide", label: "Auszahlung und Aufwand" }, { k: "kost", label: "Kosten, kein Aufwand" }],
      items: [{ t: "Rückzahlung eines Kredits per Überweisung", a: "aus", why: "Vermögen sinkt nicht, nur Bank und Verbindlichkeit." }, { t: "Abschreibung des Firmen-PKW", a: "auf", why: "Wertminderung ohne Geldfluss." }, { t: "Gehaltszahlung per Überweisung", a: "beide", why: "" }, { t: "Kalkulatorischer Unternehmerlohn", a: "kost", why: "Zusatzkosten ohne Aufwand in der FIBU." }, { t: "Barzahlung einer kleinen Reparatur", a: "beide", why: "" }, { t: "Kauf einer Maschine gegen Bank", a: "aus", why: "Aktivtausch: Bank ↓, Anlagen ↑; Aufwand erst über die Afa." }, { t: "Kalkulatorische Eigenkapitalzinsen", a: "kost", why: "In der FIBU nur FK-Zinsen als Aufwand." }] },
    { t: "check", q: "Welche Aussage ist richtig?", opts: ["Gewinn = Zunahme der liquiden Mittel", "Gewinn ≠ Cash-Flow ≠ Zunahme liquider Mittel", "Eigenkapital = liquide Mittel", "vermögend = reich"], a: 1, why: "Genau das betont die Folie. Auch: Eigenkapital ≠ liquide Mittel, Geld hat kein „Mascherl“." }
  ]},
  { id: "b1-2", title: "Bilanz, GuV und Geschäftsfälle", topic: "b-ja", min: 14, xp: 30, blocks: [
    { t: "keys", items: ["Jahresabschluss (UGB): <b>Bilanz</b> (Vermögens- und Finanzlage) · <b>GuV</b> (Ertragslage) · <b>Anhang</b> · Lage-/Corporate-Governance-Bericht", "Aktiva = Mittelverwendung (AV „geldfern“, UV „geldnah“) · Passiva = Mittelherkunft (EK, Rückstellungen, Verbindlichkeiten)", "Investition = Finanzierung: beide Seiten sind immer gleich groß", "GuV: periodenbezogen – warum bin ich reicher oder ärmer geworden?"] },
    { t: "widget", w: "bookings", topic: "b-ja" },
    { t: "check", q: "Verkauf von Fertigerzeugnissen auf Ziel um € 25.000. Auswirkung auf liquide Mittel?", opts: ["+25.000", "keine", "−25.000", "+25.000 minus USt"], a: 1, why: "Forderung entsteht, Geld fließt erst später. GuV: Umsatzerlös." },
    { t: "check", q: "Eine Bilanz ist …", opts: ["zeitraumbezogen", "stichtagsbezogen", "freiwillig", "nur für Kapitalgesellschaften"], a: 1, why: "Bilanz zum Stichtag (31.12.), GuV für den Zeitraum." }
  ]}
 ]},
 { id: "bw2", n: 2, title: "Jahresabschlussanalyse", sub: "~40 Klausurpunkte", boss: { id: "boss-bw2", title: "JA-Analyse-Boss", topics: ["b-verm", "b-fin", "b-cf", "b-ertr", "b-ja"] }, lessons: [
  { id: "b2-1", title: "Vermögenslage", topic: "b-verm", min: 14, xp: 30, blocks: [
    { t: "lead", html: "Ziel der Analyse: Beurteilung der wirtschaftlichen Lage (Vermögens-, Finanz-, Ertragslage) anhand von Bilanz, GuV, Anhang, Lagebericht und Branchenwerten. Vergleiche: Zeitvergleich, Soll-Ist, Betriebsvergleich." },
    { t: "html", html: `<div class="fgrid">${K("Anlageintensität", "AV / Gesamtvermögen × 100", "Kapitalbindung, Fixkostenbelastung")}${K("Lagerintensität", "Vorräte / Gesamtvermögen × 100", "")}${K("Anlagenabnutzungsgrad", "kum. Afa SAV / hist. AK SAV × 100", "Altersstruktur, Reinvestitionsbedarf")}${K("Abschreibungsquote", "Afa d. GJ auf SAV / ø SAV zu hist. AK × 100", "Abschreibungspolitik")}${K("Investitionsdeckung", "Afa SAV d. GJ / Nettoinvestitionen SAV × 100", "Deckung ⇔ 100 %")}${K("Lagerumschlagshäufigkeit", "Materialeinsatz / ø Vorratsbestand", "Lagerdauer = 365 / LUH")}${K("Debitorenumschlagshäufigkeit", "(Umsatzerlöse + USt) / ø Forderungen LL", "Debitorenumschlagsdauer = 365 / DUH")}</div>` },
    { t: "widget", w: "ratio", topic: "b-verm", set: "verm" },
    { t: "check", q: "Eine Debitorenumschlagsdauer von 73 Tagen bedeutet …", opts: ["Kunden zahlen im Schnitt nach 73 Tagen", "das Lager dreht sich alle 73 Tage", "wir zahlen Lieferanten nach 73 Tagen", "die Anlagen sind 73 % abgeschrieben"], a: 0, why: "Durchschnittliches Kundenziel. Warum die USt im Zähler? Forderungen enthalten USt, Umsatzerlöse nicht." }
  ]},
  { id: "b2-2", title: "Finanzlage: Struktur und Liquidität", topic: "b-fin", min: 16, xp: 35, blocks: [
    { t: "html", html: `<div class="fgrid">${K("Eigenkapitalquote", "EK / GK × 100", "„verstaubte“ Regeln: EK:FK = 1:1 bzw. 2:1")}${K("Fremdkapitalquote", "FK / GK × 100", "= Anspannungskoeffizient")}${K("Kreditorenumschlagshäufigkeit", "(Materialeinkauf + USt) / ø Verb. LL", "Dauer = 365 / KUH")}${K("Deckungsgrad A", "EK / AV × 100", "Ziel 100 %")}${K("Deckungsgrad B", "(EK + lfr. FK) / AV × 100", "goldene Bilanzregel")}${K("Deckungsgrad C", "(EK + lfr. FK) / (AV + lfr. UV) × 100", "")}${K("Liquidität 1. Grades", "Zahlungsmittel / kfr. FK × 100", "Cash Ratio, One-to-Five-Rule")}${K("Liquidität 2. Grades", "monetäres UV / kfr. FK × 100", "Quick Ratio, Acid Test (≥ 100 %)")}${K("Liquidität 3. Grades", "kfr. UV / kfr. FK × 100", "Current Ratio, Banker's Rule (≥ 200 %)")}</div>` },
    { t: "text", h: "Finanzierungslücke", levels: {
      simple: "Wenn Ware lange im Lager liegt und Kunden spät zahlen, Lieferanten aber früh bezahlt werden wollen, fehlt Geld dazwischen.",
      normal: "Finanzierungslücke = Lagerdauer + Debitorenlaufzeit − Kreditorenlaufzeit. Diese Zeitspanne muss anderweitig finanziert werden (z. B. Kontokorrent).",
      technical: "Statische Liquidität ist bestandsorientiert (Stichtag), dynamische Liquidität stromgrößenorientiert (Cash-Flow, KFR). Statische Kennzahlen sagen nichts über Fälligkeiten innerhalb der Periode aus." } },
    { t: "widget", w: "ratio", topic: "b-fin", set: "fin" },
    { t: "check", q: "Deckungsgrad B unter 100 % bedeutet …", opts: ["das AV ist teilweise kurzfristig finanziert", "das Unternehmen ist überschuldet", "die Liquidität 1. Grades ist gut", "das EK ist zu hoch"], a: 0, why: "Langfristige Vermögensteile sollten langfristig finanziert sein (Fristenkongruenz)." }
  ]},
  { id: "b2-3", title: "Cash-Flow und Kapitalflussrechnung", topic: "b-cf", min: 16, xp: 35, blocks: [
    { t: "lead", html: "Der Cash-Flow ist der im Innenfinanzierungsbereich erwirtschaftete Überschuss der Einnahmen über die Ausgaben, vor Investitions- und Finanzierungsaktivitäten. Maßstab für die Selbstfinanzierungskraft." },
    { t: "widget", w: "cfbuilder", topic: "b-cf" },
    { t: "html", html: `<div class="fgrid">${K("Dynamische Schuldentilgungsdauer", "Effektivverschuldung / Cash-Flow", "Effektivverschuldung = FK − liquide Mittel − WP des UV")}</div>` },
    { t: "check", q: "Warum werden Abschreibungen zum Jahresüberschuss addiert?", opts: ["Weil sie Einzahlungen sind", "Weil sie Aufwand ohne Auszahlung sind", "Weil sie Steuern senken", "Weil sie Investitionen sind"], a: 1, why: "Indirekte Methode: zahlungsunwirksame Aufwendungen werden zurückgerechnet." },
    { t: "check", q: "Eine Erhöhung der Forderungen LL wirkt im operativen Cash-Flow …", opts: ["erhöhend", "vermindernd", "neutral", "nur in der Finanzierungstätigkeit"], a: 1, why: "Umsatz ist gebucht, aber das Geld noch nicht eingegangen." }
  ]},
  { id: "b2-4", title: "Ertragslage und Grenzen", topic: "b-ertr", min: 10, xp: 25, blocks: [
    { t: "html", html: `<div class="fgrid">${K("Eigenkapitalrentabilität (ROE)", "Ergebnis vor Steuern / ø EK × 100", "Verzinsung des Eigenkapitals")}${K("Gesamtkapitalrentabilität (ROI, ROA)", "(Ergebnis vor Steuern + FK-Zinsen) / ø GK × 100", "Verzinsung des gesamten Kapitals")}</div>` },
    { t: "widget", w: "ratio", topic: "b-ertr", set: "ertr" },
    { t: "keys", items: ["Kennzahlen sind maximal so aussagekräftig wie die Basisinformationen", "Informationsmängel des Jahresabschlusses (Stichtag, Bewertungswahlrechte)", "Interpretation oft schwierig → Branchen-, Zeit- und Plan-Vergleiche nötig"] },
    { t: "check", q: "Warum werden bei der GK-Rentabilität die FK-Zinsen addiert?", opts: ["Um das Ergebnis zu schönen", "Weil sie das Entgelt der Fremdkapitalgeber sind und das GK beide Kapitalgeber umfasst", "Weil sie steuerfrei sind", "Aus Tradition"], a: 1, why: "GK = EK + FK. Die Verzinsung beider Gruppen wird erfasst." }
  ]}
 ]},
 { id: "bw3", n: 3, title: "Kostenrechnung", sub: "~20 Klausurpunkte", boss: { id: "boss-bw3", title: "KORE-Boss", topics: ["b-kore", "b-bab", "b-db", "b-entsch"] }, lessons: [
  { id: "b3-1", title: "Kosten, Kostenarten, fix & variabel", topic: "b-kore", min: 14, xp: 30, blocks: [
    { t: "lead", html: "Kosten sind der betriebsbedingte, bewertete sowie sachlich und zeitlich normalisierte Verbrauch von Gütern und Dienstleistungen für die betriebliche Leistungserstellung." },
    { t: "keys", items: ["4 Stufen der KORE: Überleitung aus der Buchhaltung (BÜB) → Kostenartenrechnung (<i>Welche?</i>) → Kostenstellenrechnung (<i>Wo?</i>) → Kostenträgerrechnung (<i>Wofür?</i>)", "Grundkosten = aus FIBU übernommen · <b>Anderskosten</b> (anders bewertet: kalk. Afa, kalk. Zinsen, kalk. Miete) · <b>Zusatzkosten</b> (kein Aufwand: kalk. Unternehmerlohn, EK-Zinsen, kalk. Miete für eigene Räume)", "Gesamtkosten = Fixkosten + variable Kosten × Stück · Fixkostendegression: Stückkosten sinken mit der Menge", "Einzelkosten direkt dem Kostenträger zurechenbar · Gemeinkosten über Kostenstellen und Zuschlagssätze"] },
    { t: "widget", w: "sorter", topic: "b-kore", title: "Fix oder variabel? Einzel- oder Gemeinkosten?", cats: [{ k: "fe", label: "fix" }, { k: "ve", label: "variabel" }],
      items: [{ t: "Fertigungsmaterial", a: "ve", why: "Steigt mit der Menge." }, { t: "Miete der Halle", a: "fe", why: "Unabhängig von der Menge." }, { t: "Kalkulatorische Abschreibung (zeitabhängig)", a: "fe", why: "" }, { t: "Stromverbrauch der Maschinen", a: "ve", why: "" }, { t: "Gehalt der Geschäftsführung", a: "fe", why: "" }, { t: "Verpackung je Stück", a: "ve", why: "" }, { t: "Versicherungsprämie", a: "fe", why: "" }, { t: "Akkordlöhne", a: "ve", why: "" }] },
    { t: "widget", w: "costcurve", topic: "b-kore" },
    { t: "check", q: "Kalkulatorischer Unternehmerlohn ist …", opts: ["Grundkosten", "Anderskosten", "Zusatzkosten", "neutraler Aufwand"], a: 2, why: "Kosten, denen in der FIBU kein Aufwand gegenübersteht." },
    { t: "check", q: "Kostenremanenz bedeutet …", opts: ["Kosten sinken bei Beschäftigungsrückgang nicht im selben Maß, wie sie gestiegen sind", "Kosten verschwinden", "Fixkosten werden variabel", "Kosten steigen linear"], a: 0, why: "Kosten „bleiben hängen“, z. B. weil Personal nicht sofort abgebaut wird." }
  ]},
  { id: "b3-2", title: "BÜB, BAB und Zuschlagskalkulation", topic: "b-bab", min: 18, xp: 40, blocks: [
    { t: "keys", items: ["BAB: primäre Kosten auf Kostenstellen verteilen → Hilfskostenstellen umlegen (z. B. <b>Stufenleiterverfahren</b>) → Summe Gemeinkosten je Hauptkostenstelle → <b>Zuschlagssätze</b>", "Materialgemeinkosten-Zuschlag = MGK / Fertigungsmaterial", "Fertigungsgemeinkosten: Zuschlag auf Fertigungslöhne oder Stundensatz", "Verwaltung/Vertrieb: Zuschlag auf Herstellkosten"] },
    { t: "widget", w: "zuschlag", topic: "b-bab" },
    { t: "check", q: "Herstellkosten = …", opts: ["Materialkosten + Fertigungskosten", "Selbstkosten + Gewinn", "Materialkosten + Verwaltungskosten", "Fertigungslöhne + Vertrieb"], a: 0, why: "Materialkosten (FM + MGK) + Fertigungskosten (FL + FGK + SEK Fertigung). Selbstkosten = HK + Verwaltung + Vertrieb." },
    { t: "check", q: "Im Demobeispiel: MGK 12.071 € auf Fertigungsmaterial 120.000 €. Zuschlagssatz?", opts: ["≈ 1 %", "≈ 10 %", "≈ 12 %", "≈ 30 %"], a: 1, why: "12.071 / 120.000 ≈ 10 %." }
  ]},
  { id: "b3-3", title: "Deckungsbeitragsrechnung", topic: "b-db", min: 16, xp: 35, blocks: [
    { t: "text", h: "Voll- vs. Teilkostenrechnung", levels: {
      simple: "Vollkosten: alle Kosten aufs Stück. Teilkosten: nur variable Kosten aufs Stück, der Rest (Fixkosten) wird als Block gedeckt.",
      normal: "<b>Deckungsbeitrag (DB)</b> = Erlös − variable Kosten. Er zeigt, wie viel ein Stück zur Deckung der Fixkosten beiträgt. <b>Einstufig</b>: Summe DB − gesamte Fixkosten. <b>Mehrstufig</b> (stufenweise Fixkostendeckung): Fixkosten schrittweise Erzeugnissen, Gruppen, Bereichen und dem Unternehmen zuordnen (DB I, II, III …).",
      technical: "Stückkosten der VKR stimmen nur bei geplanter Auslastung. Die TKR verhindert die Fixkostenproportionalisierung, deckt aber nicht automatisch den Fixkostenblock. Vollkosten → langfristige PUG, Teilkosten → kurzfristige PUG." } },
    { t: "widget", w: "dbcalc", topic: "b-db" },
    { t: "check", q: "Ein Produkt hat einen positiven DB, aber nach Vollkosten einen Verlust. Kurzfristig solltest du es …", opts: ["sofort streichen", "weiter produzieren, solange keine besseren Alternativen bestehen – es deckt Fixkosten mit", "teurer machen, egal was der Markt sagt", "nach Vollkosten neu kalkulieren und dann streichen"], a: 1, why: "Streichen würde den DB verlieren, die Fixkosten bleiben." }
  ]},
  { id: "b3-4", title: "Preisuntergrenze, Break-Even, Programm", topic: "b-entsch", min: 20, xp: 45, blocks: [
    { t: "keys", items: ["<b>Kurzfristige PUG</b> = variable Stückkosten (bei freier Kapazität) · <b>langfristige PUG</b> = volle Stückkosten", "Bei Engpass: PUG = kv + entgangener DB der verdrängten Aufträge", "<b>Break-Even-Menge</b> = Fixkosten / DB je Stück", "<b>Engpass</b>: Rangfolge nach relativem DB (DB je Engpasseinheit), nicht nach absolutem DB"] },
    { t: "widget", w: "cases", topic: "b-entsch", set: "kore" },
    { t: "widget", w: "breakeven", topic: "b-entsch" }
  ]}
 ]},
 { id: "bw4", n: 4, title: "Investitionsrechnung", sub: "~25 Klausurpunkte", boss: { id: "boss-bw4", title: "Investitions-Boss", topics: ["b-stat", "b-dyn"] }, lessons: [
  { id: "b4-1", title: "Statische Verfahren", topic: "b-stat", min: 20, xp: 45, blocks: [
    { t: "keys", items: ["Merkmale: einfach, verbreitet, <b>eine Durchschnittsperiode</b>, Kosten/Leistungen, zeitliche Verteilung wird vernachlässigt", "<b>Kostenvergleich</b>: nur relative Vorteilhaftigkeit (Perioden- bzw. Stückkosten)", "<b>Gewinnvergleich</b>: absolut (Gewinn > 0) und relativ", "<b>Rentabilität</b> = (ø Gewinn + ø Zinsen) / ø Kapitalbindung · ø Kapitalbindung = (AW + RW) / 2", "<b>Amortisation</b>: Durchschnittsmethode (AK − RW) / (ø Gewinn + Afa) oder Kumulationsmethode"] },
    { t: "html", html: `<div class="fgrid">${K("Kalk. Abschreibung", "(AK − RW) / ND", "Kosten der Nutzung je Periode")}${K("Kalk. Zinsen", "(AK + RW) / 2 × i", "Kosten der Kapitalbindung")}${K("Kritische Auslastung", "Menge, bei der Kosten beider Alternativen gleich sind", "Break-even zwischen Alternativen")}</div>` },
    { t: "widget", w: "cases", topic: "b-stat", set: "stat" },
    { t: "check", q: "Warum wird bei nicht abnutzbarem Anlagevermögen (z. B. Grundstück) der volle Anschaffungswert als Kapitalbindung angesetzt?", opts: ["Weil es teurer ist", "Weil es sich nicht abnutzt und das Kapital über die gesamte Dauer gebunden bleibt", "Aus steuerlichen Gründen", "Weil der Restwert null ist"], a: 1, why: "Ohne Abschreibung wird kein Kapital über Rückflüsse frei." }
  ]},
  { id: "b4-2", title: "Dynamische Verfahren", topic: "b-dyn", min: 25, xp: 50, blocks: [
    { t: "keys", items: ["Mehrperiodenmodelle mit Zahlungsströmen, Auf- und Abzinsung; Zahlungen am Periodenende", "Endwert: EW = A·(1+i)ⁿ · Barwert: BW = A·(1+i)⁻ⁿ · Rentenbarwert: A·(1 − (1+i)⁻ⁿ)/i", "<b>Kapitalwert</b> KW = Σ (Eₜ − Aₜ)·(1+i)⁻ᵗ − A₀ → Totalerfolg; absolut vorteilhaft, wenn KW > 0", "<b>Annuität</b> = KW · i / (1 − (1+i)⁻ⁿ) → Periodenerfolg", "<b>Interner Zinsfuß</b>: i, bei dem KW = 0 → relative Rendite; Interpolation r = i₁ − KW₁·(i₂ − i₁)/(KW₂ − KW₁) oder Excel-Zielwertsuche"] },
    { t: "text", h: "KW > 0, = 0, < 0", levels: {
      simple: "KW > 0: Das Projekt verdient mehr als deine Mindestverzinsung. KW < 0: weniger.",
      normal: "<b>KW > 0</b>: Amortisation des Kapitals + Verzinsung zum Kalkulationszins + zusätzlicher Überschuss in Höhe des KW. <b>KW = 0</b>: genau Amortisation + Verzinsung. <b>KW < 0</b>: Kapital oder Verzinsung werden nicht voll erwirtschaftet.",
      technical: "Prämissen: sichere Erwartungen, vollkommener Kapitalmarkt (Soll- = Habenzins, unbegrenztes Kapital), Wiederanlage zum Kalkulationszins (beim IZF: zum internen Zins – zusätzliches Manko). Ein höherer Kalkulationszins senkt den KW, weil spätere Rückflüsse stärker abgezinst werden (Sensitivitätsanalyse)." } },
    { t: "widget", w: "npv", topic: "b-dyn" },
    { t: "widget", w: "cases", topic: "b-dyn", set: "dyn" },
    { t: "check", q: "Was gibt der interne Zinsfuß an?", opts: ["Den Kalkulationszinssatz", "Die Effektivverzinsung des gebundenen Kapitals", "Den Kreditzins der Bank", "Die Inflationsrate"], a: 1, why: "Der Zinssatz, bei dem KW = 0 wird." }
  ]}
 ]},
 { id: "bw5", n: 5, title: "Finanzierung & Klausur", sub: "~5 Punkte Theorie + Prüfungsmodus", boss: null, lessons: [
  { id: "b5-1", title: "Finanzierungsformen", topic: "b-finz", min: 10, xp: 25, blocks: [
    { t: "widget", w: "sorter", topic: "b-finz", title: "Innen oder außen? Eigen oder fremd?", cats: [{ k: "ae", label: "Außen · Eigen" }, { k: "af", label: "Außen · Fremd" }, { k: "ie", label: "Innen" }, { k: "hy", label: "Hybrid / Mezzanin" }],
      items: [{ t: "Kapitalerhöhung durch neue Gesellschafter", a: "ae", why: "" }, { t: "Bankkredit", a: "af", why: "" }, { t: "Lieferantenkredit", a: "af", why: "" }, { t: "Gewinnthesaurierung (Selbstfinanzierung)", a: "ie", why: "" }, { t: "Finanzierung aus Abschreibungsrückflüssen", a: "ie", why: "" }, { t: "Bildung von Rückstellungen", a: "ie", why: "" }, { t: "Nachrangdarlehen", a: "hy", why: "" }, { t: "Genussrecht", a: "hy", why: "" }, { t: "Partiarisches Darlehen", a: "hy", why: "" }, { t: "Anleihe", a: "af", why: "" }] },
    { t: "check", q: "Crowdfunding in Form von Nachrangdarlehen ist …", opts: ["reines Eigenkapital", "Hybrid-/Mezzaninkapital", "Innenfinanzierung", "Leasing"], a: 1, why: "Nachrangig im Insolvenzfall, rechtlich aber Fremdkapital." }
  ]},
  { id: "b5-2", title: "So läuft die Schlussklausur", topic: "b-finz", min: 5, xp: 10, blocks: [
    { t: "keys", items: ["Moodle-Prüfung am <b>Eigengerät</b> im Hörsaal mit <b>SEB</b> (Safe Exam Browser), Multiple Choice", "90 Punkte in 90 Minuten, ~20–30 Fragen à 1–10 Punkte, ~45 Theorie + ~45 Beispiele", "<b>Minuspunkte</b> für falsche Antworten, Reihenfolge frei, 50 % zum Bestehen", "<b>Excel erlaubt</b> (Zielwertsuche für den IZF üben!)", "10-%-Punkte-Abzug bei verweigerter Mitarbeit in den Übungen", "Fragenpool: JA-Analyse ~40 · Kostenrechnung ~20 · Investition ~25 · Finanzierung ~5", "Noten: ≥ 88 Sehr gut · ≥ 76 Gut · ≥ 63 Befriedigend · ≥ 50 Genügend", "Keine KI-Brillen oder Privacy-Filter; 80 % Anwesenheit"] },
    { t: "callout", html: "Übe im <b>Exam Trainer</b> mit dem BWL-Modus: MC mit Minuspunkten und Timer. Tipp aus dem Workload: ~29 Stunden Klausurvorbereitung sind eingeplant." }
  ]}
 ]}
];

const QUESTIONS = [
 { id: "bq1", topic: "b-rw", q: "Welches Begriffspaar beschreibt die Veränderung des Zahlungsmittelbestands?", opts: ["Einnahmen/Ausgaben", "Einzahlungen/Auszahlungen", "Ertrag/Aufwand", "Leistung/Kosten"], a: 1, why: "Kassa und Bank.", ex: "" },
 { id: "bq2", topic: "b-rw", q: "Kalkulatorische Abschreibung auf Basis des Wiederbeschaffungswerts ist …", opts: ["Grundkosten", "Anderskosten", "Zusatzkosten", "neutraler Aufwand"], a: 1, why: "Aufwand existiert, wird aber anders bewertet.", ex: "" },
 { id: "bq3", topic: "b-ja", q: "Einkauf von Handelswaren auf Ziel um € 35.000. Liquide Mittel …", opts: ["sinken", "steigen", "bleiben unverändert", "sinken um die USt"], a: 2, why: "Verbindlichkeit entsteht, Zahlung folgt später. Bilanz: Vorräte ↑, Verbindlichkeiten ↑.", ex: "" },
 { id: "bq4", topic: "b-ja", q: "Planmäßige Abschreibung der Software € 8.000: GuV?", opts: ["Aufwand +8.000", "Ertrag +8.000", "keine Auswirkung", "nur Bilanz"], a: 0, why: "Aufwand in der GuV, Bilanz: immaterielles AV sinkt, keine Auszahlung.", ex: "" },
 { id: "bq5", topic: "b-ja", q: "Eingang einer Kundenforderung in bar € 2.000: Wirkung auf die GuV?", opts: ["Ertrag +2.000", "keine", "Aufwand −2.000", "Umsatz +2.000"], a: 1, why: "Aktivtausch: Kassa ↑, Forderungen ↓.", ex: "" },
 { id: "bq6", topic: "b-verm", q: "Anlagenabnutzungsgrad = …", opts: ["kum. Afa SAV / hist. AK SAV × 100", "Afa GJ / Umsatz", "AV / GK", "Nettoinvestition / Afa"], a: 0, why: "Hinweis auf Altersstruktur und Reinvestitionsbedarf.", ex: "" },
 { id: "bq7", topic: "b-verm", q: "Materialeinsatz 600.000 €, ø Vorräte 100.000 €. Lagerdauer?", opts: ["6 Tage", "≈ 61 Tage", "≈ 16 Tage", "600 Tage"], a: 1, why: "LUH = 6 → 365/6 ≈ 60,8 Tage.", ex: "" },
 { id: "bq8", topic: "b-verm", q: "Warum wird bei der Debitorenumschlagshäufigkeit die USt zum Umsatz addiert?", opts: ["Weil Forderungen die USt enthalten", "Weil der Gesetzgeber es verlangt", "Um den Wert zu erhöhen", "Das wird nicht gemacht"], a: 0, why: "Zähler und Nenner müssen vergleichbar sein.", ex: "" },
 { id: "bq9", topic: "b-fin", q: "EK 400, FK 600. Eigenkapitalquote?", opts: ["40 %", "60 %", "66,7 %", "150 %"], a: 0, why: "400 / 1.000.", ex: "" },
 { id: "bq10", topic: "b-fin", q: "Liquidität 2. Grades heißt auch …", opts: ["Cash Ratio", "Quick Ratio / Acid Test", "Current Ratio", "Banker's Rule"], a: 1, why: "1. Grad Cash Ratio, 2. Grad Quick Ratio, 3. Grad Current Ratio.", ex: "" },
 { id: "bq11", topic: "b-fin", q: "Deckungsgrad A = …", opts: ["EK / AV × 100", "(EK + lfr. FK) / AV × 100", "AV / EK", "kfr. UV / kfr. FK"], a: 0, why: "", ex: "" },
 { id: "bq12", topic: "b-fin", q: "Die Finanzierungslücke entsteht durch …", opts: ["Lagerdauer + Debitorenlaufzeit > Kreditorenlaufzeit", "zu hohes Eigenkapital", "negative Abschreibungen", "hohe Liquidität 1. Grades"], a: 0, why: "", ex: "" },
 { id: "bq13", topic: "b-cf", q: "Cash-Flow aus dem Ergebnis im Fallbeispiel: JÜ 69, Afa 203, Gewinne Anlagenabgang/akt. EL 112, Dotierung Abfertigungsrückstellung 26. CF?", opts: ["186", "272", "410", "−43"], a: 0, why: "69 + 203 − 112 + 26 = 186.", ex: "" },
 { id: "bq14", topic: "b-cf", q: "CF operativ +508, Investition −288, Finanzierung −221. Veränderung der liquiden Mittel?", opts: ["−1", "+1", "+509", "−509"], a: 0, why: "Anfangsbestand 2 → Endbestand 1.", ex: "" },
 { id: "bq15", topic: "b-cf", q: "Die Rückzahlung eines langfristigen Kredits erscheint im …", opts: ["operativen Cash-Flow", "Cash-Flow aus Investitionstätigkeit", "Cash-Flow aus Finanzierungstätigkeit", "gar nicht"], a: 2, why: "", ex: "" },
 { id: "bq16", topic: "b-cf", q: "Dynamische Schuldentilgungsdauer = …", opts: ["Effektivverschuldung / Cash-Flow", "FK / EK", "Cash-Flow / Umsatz", "Zinsen / Gewinn"], a: 0, why: "Jahre bis zur Tilgung aus dem CF.", ex: "" },
 { id: "bq17", topic: "b-ertr", q: "Ergebnis vor Steuern 120, FK-Zinsen 30, ø GK 1.500. Gesamtkapitalrentabilität?", opts: ["8 %", "10 %", "2 %", "12 %"], a: 1, why: "(120 + 30) / 1.500 = 10 %.", ex: "" },
 { id: "bq18", topic: "b-ertr", q: "ROE = …", opts: ["Ergebnis vor Steuern / ø EK × 100", "Umsatz / EK", "(EBT + Zinsen) / GK", "EK / GK"], a: 0, why: "", ex: "" },
 { id: "bq19", topic: "b-kore", q: "Die Kostenstellenrechnung beantwortet die Frage …", opts: ["Welche Kosten sind angefallen?", "Wo sind die Kosten angefallen?", "Wofür sind die Kosten angefallen?", "Wann wird bezahlt?"], a: 1, why: "Arten: welche · Stellen: wo · Träger: wofür.", ex: "" },
 { id: "bq20", topic: "b-kore", q: "Fixkosten 10.000 €, kv 5 €. Gesamtkosten bei 2.000 Stück?", opts: ["10.000", "15.000", "20.000", "25.000"], a: 2, why: "10.000 + 5 × 2.000.", ex: "" },
 { id: "bq21", topic: "b-kore", q: "Fixkostendegression bedeutet …", opts: ["fixe Stückkosten sinken mit steigender Menge", "Fixkosten sinken insgesamt", "variable Kosten sinken", "Preise sinken"], a: 0, why: "Der Fixkostenblock verteilt sich auf mehr Stück.", ex: "" },
 { id: "bq22", topic: "b-bab", q: "Hilfskostenstellen werden im BAB …", opts: ["gestrichen", "auf Hauptkostenstellen umgelegt (z. B. Stufenleiterverfahren)", "direkt den Produkten zugerechnet", "als Einzelkosten behandelt"], a: 1, why: "", ex: "" },
 { id: "bq23", topic: "b-bab", q: "Selbstkosten + Gewinnzuschlag = …", opts: ["Nettobarpreis", "Herstellkosten", "Bruttozielpreis", "Deckungsbeitrag"], a: 0, why: "Dann + Skonto = Nettozielpreis, + Rabatt = Bruttozielpreis ohne USt, + USt.", ex: "" },
 { id: "bq24", topic: "b-db", q: "Erlös 40 €, kv 20 €. DB je Stück?", opts: ["20 €", "60 €", "2 €", "0,5 €"], a: 0, why: "", ex: "" },
 { id: "bq25", topic: "b-db", q: "Die stufenweise Fixkostendeckungsrechnung …", opts: ["verteilt Fixkosten proportional auf alle Stück", "ordnet Fixkosten schrittweise Produkten, Gruppen, Bereichen zu", "ignoriert Fixkosten", "ist eine Vollkostenrechnung"], a: 1, why: "", ex: "" },
 { id: "bq26", topic: "b-entsch", q: "Kurzfristige Preisuntergrenze bei freier Kapazität = …", opts: ["volle Stückkosten", "variable Stückkosten", "Fixkosten", "Marktpreis"], a: 1, why: "", ex: "" },
 { id: "bq27", topic: "b-entsch", q: "Fixkosten 300.000 €/Jahr, p 5 €, kv 2,50 €. Break-Even-Menge?", opts: ["60.000", "120.000", "150.000", "240.000"], a: 1, why: "300.000 / 2,50.", ex: "Tausendschön GmbH" },
 { id: "bq28", topic: "b-entsch", q: "Bei einem Engpass entscheidet man nach …", opts: ["dem absoluten DB je Stück", "dem relativen DB je Engpasseinheit", "dem Verkaufspreis", "den Fixkosten"], a: 1, why: "", ex: "A2: 10 € DB / 5 min = 2 €/min" },
 { id: "bq29", topic: "b-stat", q: "Die Kostenvergleichsrechnung ermöglicht …", opts: ["nur die relative Vorteilhaftigkeit", "nur die absolute Vorteilhaftigkeit", "beides", "keine Aussage"], a: 0, why: "Erlöse bleiben unberücksichtigt.", ex: "" },
 { id: "bq30", topic: "b-stat", q: "AK 120.000, RW 10.000, i 10 %. Kalkulatorische Zinsen?", opts: ["6.500", "12.000", "5.500", "13.000"], a: 0, why: "(120.000 + 10.000) / 2 × 0,1.", ex: "" },
 { id: "bq31", topic: "b-stat", q: "Rentabilität (statisch) = …", opts: ["(ø Gewinn + ø Zinsen) / ø Kapitalbindung", "Gewinn / Umsatz", "Zinsen / AK", "Gewinn / AK"], a: 0, why: "", ex: "" },
 { id: "bq32", topic: "b-stat", q: "Ein Nachteil der Amortisationsrechnung ist …", opts: ["Rückflüsse nach dem Amortisationszeitpunkt werden vernachlässigt", "sie ist zu komplex", "sie berücksichtigt Zinseszins", "sie braucht einen Kalkulationszins"], a: 0, why: "Nur als Zusatzkriterium (Risiko/Liquidität).", ex: "" },
 { id: "bq33", topic: "b-dyn", q: "€ 10.000 für 5 Jahre zu 5 % p. a. Endwert?", opts: ["12.500,00", "12.762,82", "11.576,25", "15.000,00"], a: 1, why: "10.000 × 1,05⁵.", ex: "" },
 { id: "bq34", topic: "b-dyn", q: "Barwert von € 10.000 in 5 Jahren bei 5 %?", opts: ["7.835,26", "9.500,00", "8.000,00", "12.762,82"], a: 0, why: "10.000 × 1,05⁻⁵.", ex: "" },
 { id: "bq35", topic: "b-dyn", q: "Steigt der Kalkulationszins, dann …", opts: ["steigt der Kapitalwert", "sinkt der Kapitalwert (bei Normalinvestitionen)", "bleibt er gleich", "wird er immer negativ"], a: 1, why: "Zukünftige Rückflüsse werden stärker abgezinst.", ex: "Beispiel 4: 97.237 → 78.349 → 53.385" },
 { id: "bq36", topic: "b-dyn", q: "Annuitätenmethode und Kapitalwertmethode führen bei der absoluten Vorteilhaftigkeit …", opts: ["immer zum selben Ergebnis", "nie zum selben Ergebnis", "nur bei gleicher ND zum selben Ergebnis", "zu zufälligen Ergebnissen"], a: 0, why: "A > 0 genau dann, wenn KW > 0. Relativ bei unterschiedlicher ND nicht zwingend.", ex: "" },
 { id: "bq37", topic: "b-dyn", q: "Zusätzliches Manko der IZF-Methode:", opts: ["Wiederanlage zum internen Zinssatz", "keine Abzinsung", "ignoriert die Anschaffung", "funktioniert nur in Excel"], a: 0, why: "", ex: "" },
 { id: "bq38", topic: "b-dyn", q: "KW(7 %) = 2.091, KW(20 %) = −5.903. Interpolierter IZF?", opts: ["≈ 8,2 %", "≈ 10,4 %", "≈ 13,5 %", "≈ 20 %"], a: 1, why: "0,07 − 2.091 × 0,13 / (−5.903 − 2.091) ≈ 10,4 %.", ex: "" },
 { id: "bq39", topic: "b-finz", q: "Gewinnthesaurierung ist …", opts: ["Außenfinanzierung", "Innenfinanzierung (Selbstfinanzierung)", "Fremdfinanzierung", "Mezzanin"], a: 1, why: "", ex: "" },
 { id: "bq40", topic: "b-finz", q: "Welches ist ein Hybrid-Instrument laut Folie?", opts: ["Lieferantenkredit", "Genussrecht", "Kapitalerhöhung", "Kontokorrent"], a: 1, why: "Nachrangdarlehen, Genussrecht, partiarisches Darlehen.", ex: "" }
];
const BOSS_EXTRA = [
 { id: "bb1", topic: "b-entsch", q: "Teppichreinigung: Kapazität 20.000 m², 16.000 m² fix gebucht (Erlös 3,00 €, kv 1,25 €). Anfrage: 10.000 m² zu 1,50 €. Was tun?", opts: ["Ganz annehmen: 1,50 > 1,25", "Nur die freien 4.000 m² annehmen (+1.000 €); voll annehmen würde Standardaufträge mit DB 1,75 € verdrängen", "Ablehnen: 1,50 < volle Kosten 2,00", "Annehmen, weil Großkunde"], a: 1, why: "Kurzfristige PUG ohne Engpass = kv. Mit Verdrängung: 1,25 + 1,75 = 3,00 € je verdrängtem m²." },
 { id: "bb2", topic: "b-stat", q: "Verfahren A: Gewinn 8.000 €, B: 16.350 € (Gewinnvergleich). Entscheidung?", opts: ["A, weil billiger in der Anschaffung", "B – beide absolut vorteilhaft, B relativ vorteilhaft", "Keines", "Nicht entscheidbar"], a: 1, why: "Beide Gewinne > 0, B höher." },
 { id: "bb3", topic: "b-dyn", q: "Maschine 1: Annuität 355,58 € (5 J.), Maschine 2: 303,32 € (4 J.) bei 8 %. Welches Problem hat der Vergleich?", opts: ["Keines", "Unterschiedliche Nutzungsdauern – Annahmen zur Anschlussinvestition nötig", "Die Zinsen sind zu hoch", "Annuitäten dürfen nie verglichen werden"], a: 1, why: "Bei unterschiedlicher ND muss man klären, was nach Ende der kürzeren ND passiert." },
 { id: "bb4", topic: "b-fin", q: "Deckungsgrad B 85 %, Liquidität 3. Grades 110 %. Interpretation?", opts: ["Alles bestens", "Teile des AV sind kurzfristig finanziert; die kurzfristige Deckung ist knapp (Banker's Rule 200 % verfehlt)", "Überschuldung", "Zu viel EK"], a: 1, why: "Fristenkongruenz verletzt, Liquiditätspuffer gering." }
];
const FLASHCARDS = [
 ["Eigenkapitalquote", "EK / GK × 100"], ["Fremdkapitalquote (Verschuldungsgrad)", "FK / GK × 100"], ["Anlageintensität", "AV / Gesamtvermögen × 100"], ["Anlagenabnutzungsgrad", "kum. Afa SAV / hist. AK SAV × 100"],
 ["Lagerumschlagshäufigkeit / Lagerdauer", "Materialeinsatz / ø Vorräte · 365 / LUH"], ["Debitorenumschlagshäufigkeit", "(Umsatzerlöse + USt) / ø Forderungen LL · Dauer = 365 / DUH"], ["Kreditorenumschlagshäufigkeit", "(Materialeinkauf + USt) / ø Verbindlichkeiten LL"],
 ["Deckungsgrad A / B / C", "EK/AV · (EK+lfr.FK)/AV · (EK+lfr.FK)/(AV+lfr.UV) – jeweils × 100, Ziel 100 %"], ["Liquidität 1./2./3. Grades", "Zahlungsmittel · monetäres UV · kfr. UV – jeweils / kfr. FK × 100"],
 ["Cash-Flow (operativ, indirekt)", "JÜ + Afa − Zuschreibungen ± lfr. Rückstellungen ∓ Gewinne/Verluste Anlagenabgang ± Δ Working Capital"], ["Effektivverschuldung", "FK − liquide Mittel − Wertpapiere des UV"],
 ["ROE", "Ergebnis vor Steuern / ø EK × 100"], ["ROI / ROA", "(Ergebnis vor Steuern + FK-Zinsen) / ø GK × 100"], ["Kosten (Definition)", "betriebsbedingter, bewerteter, sachlich und zeitlich normalisierter Güterverbrauch"],
 ["Anderskosten vs. Zusatzkosten", "Anders: anders bewerteter Aufwand (kalk. Afa). Zusatz: kein Aufwand (kalk. Unternehmerlohn, EK-Zinsen)"], ["4 Stufen der KORE", "BÜB → Kostenarten (welche?) → Kostenstellen (wo?) → Kostenträger (wofür?)"],
 ["Deckungsbeitrag", "Erlös − variable Kosten"], ["Break-Even-Menge", "Fixkosten / DB je Stück"], ["Kurzfristige vs. langfristige PUG", "kv (freie Kapazität) vs. volle Stückkosten"],
 ["Kalk. Abschreibung / Zinsen", "(AK − RW) / ND · (AK + RW) / 2 × i"], ["Statische Rentabilität", "(ø Gewinn + ø Zinsen) / ø Kapitalbindung; ø KB = (AW + RW)/2"], ["Amortisationsdauer (Durchschnitt)", "(AK − RW) / (ø Gewinn + Afa)"],
 ["Kapitalwert", "Σ (Eₜ − Aₜ)·(1+i)⁻ᵗ − A₀ – Totalerfolg"], ["Annuität", "KW × i / (1 − (1+i)⁻ⁿ) – Periodenerfolg"], ["Interner Zinsfuß (Interpolation)", "r = i₁ − KW₁ · (i₂ − i₁) / (KW₂ − KW₁)"],
 ["Rentenbarwertfaktor", "(1 − (1+i)⁻ⁿ) / i"], ["Schlussklausur BWL 2", "Moodle/SEB, 90 P./90 min, MC mit Minuspunkten, Excel erlaubt, 50 % zum Bestehen"]
].map((c, i) => ({ id: "bf" + (i + 1), cat: "BWL", topic: ["b-fin", "b-fin", "b-verm", "b-verm", "b-verm", "b-verm", "b-fin", "b-fin", "b-fin", "b-cf", "b-cf", "b-ertr", "b-ertr", "b-kore", "b-kore", "b-kore", "b-db", "b-entsch", "b-entsch", "b-stat", "b-stat", "b-stat", "b-dyn", "b-dyn", "b-dyn", "b-dyn", "b-finz"][i], front: c[0], back: c[1] }));

/* Worked cases from the Übungseinheiten. Each step has an input with tolerance and a shown solution path. */
const CASES = {
  kore: [
    { title: "Beispiel 1 · Kurzfristige Preisuntergrenze (Teppichreinigung)", text: "Kapazität 20.000 m²; im Juli bereits 16.000 m² gebucht. Anfrage: 10.000 m² zu € 1,50/m². Volle Kosten € 2,00/m², variable € 1,25/m², Standarderlös € 3,00/m².",
      steps: [{ q: "DB je m² des Zusatzauftrags (€)", a: 0.25, tol: 0.001, how: "1,50 − 1,25" }, { q: "Freie Kapazität (m²)", a: 4000, tol: 0.5, how: "20.000 − 16.000" }, { q: "Ergebnisveränderung, wenn nur die freie Kapazität angenommen wird (€)", a: 1000, tol: 0.5, how: "4.000 × 0,25" }, { q: "Ergebnisveränderung bei voller Annahme (verdrängt 6.000 m² mit DB 1,75) (€)", a: -8000, tol: 0.5, how: "10.000 × 0,25 − 6.000 × 1,75 = 2.500 − 10.500" }],
      concl: "Nur die freien 4.000 m² annehmen (sofern teilbar). Volle Annahme verschlechtert das Ergebnis um € 8.000. Die langfristige PUG wären die vollen Kosten von € 2,00." },
    { title: "Beispiel 2 · Break-Even (Tausendschön GmbH, Hautcreme Viola)", text: "p = € 5,–, kv = € 2,50, Fixkosten € 75.000 pro Quartal, Kapazität 50.000 Stk/Quartal, ø investiertes Kapital € 1,5 Mio., Plan-Absatz 160.000 Stk/Jahr.",
      steps: [{ q: "Break-Even-Menge pro Jahr (Stk)", a: 120000, tol: 0.5, how: "(4 × 75.000) / (5 − 2,5)" }, { q: "Max. Abweichung Ist vom Plan-Absatz ohne Verlust (%)", a: 25, tol: 0.05, how: "(160.000 − 120.000) / 160.000" }, { q: "Jahresgewinn bei voller Kapazität mit 40.000 Stk zusätzlich zu € 3,50 (€)", a: 140000, tol: 0.5, how: "160.000 × 2,5 + 40.000 × 1,0 − 300.000" }, { q: "Nötiger Absatz bei 10 % Preissenkung ohne Gewinnrückgang (Stk)", a: 200000, tol: 0.5, how: "Plan-Gewinn 100.000; (300.000 + 100.000) / 2,0" }, { q: "Mindestmenge zur Deckung der zahlungswirksamen Kosten (Stk)", a: 96000, tol: 0.5, how: "4 × (75.000 − 15.000) / 2,5" }, { q: "Absatz für 10 % Gesamtkapitalverzinsung vor Steuern (Stk)", a: 180000, tol: 0.5, how: "(300.000 + 150.000) / 2,5" }],
      concl: "Sicherheitsabstand 25 %. Beachte bei der 25-%-Steigerung: 200.000 Stk liegt genau an der Kapazitätsgrenze von 4 × 50.000." },
    { title: "Beispiel 3 · Optimales Produktionsprogramm", text: "Spezialmaschine: Fixkosten € 20.000 p. m., 12.000 min Kapazität. A1: € 40 / kv 20 / 20 min, Mindestmenge 120, max. 1.500. A2: € 35 / kv 25 / 5 min, max. 1.800. A3: € 45 / kv 28,50 / 15 min, max. 500.",
      steps: [{ q: "DB je Stück A1 (€)", a: 20, tol: 0.001, how: "40 − 20" }, { q: "DB je Stück A3 (€)", a: 16.5, tol: 0.001, how: "45 − 28,50" }, { q: "Relativer DB A2 (€/min)", a: 2, tol: 0.001, how: "10 / 5" }, { q: "Minuten für A3 nach Pflichtmenge A1 und max. A2", a: 600, tol: 0.5, how: "12.000 − 120×20 − 1.800×5" }, { q: "Menge A3 (Stk)", a: 40, tol: 0.5, how: "600 / 15" }, { q: "Maximaler Gesamt-DB (€)", a: 21060, tol: 0.5, how: "120×20 + 1.800×10 + 40×16,5" }],
      concl: "Nach absolutem DB wäre A1 (20 €) vorn. Bei Engpass zählt der relative DB: A2 2,00 €/min > A3 1,10 €/min > A1 1,00 €/min. Programm: A1 120, A2 1.800, A3 40. Betriebsergebnis 21.060 − 20.000 = € 1.060." }
  ],
  stat: [
    { title: "Beispiel 1 · Gewinnvergleich", text: "A: AK 80.000, ND 5, Kapazität 2.200, fix 5.000, kv 20, RW 0, p 35. B: AK 120.000, ND 5, Kapazität 3.000, fix 9.000, kv 12, RW 5.000, p 33. Max. Absatz 2.600, i = 10 %.",
      steps: [{ q: "Kalk. Afa A (€)", a: 16000, tol: 0.5, how: "80.000 / 5" }, { q: "Kalk. Zinsen B (€)", a: 6250, tol: 0.5, how: "(120.000 + 5.000) / 2 × 0,1" }, { q: "Gewinn A (€) – Absatz = Kapazität 2.200", a: 8000, tol: 0.5, how: "2.200 × 35 − (16.000 + 4.000 + 5.000 + 2.200 × 20)" }, { q: "Gewinn B (€) – Absatz 2.600", a: 16350, tol: 0.5, how: "2.600 × 33 − (23.000 + 6.250 + 9.000 + 2.600 × 12)" }],
      concl: "Beide absolut vorteilhaft (Gewinn > 0), B relativ vorteilhaft. Bei gleicher Menge reicht der Gesamtkostenvergleich; bei unterschiedlicher Menge müssen Stückkosten bzw. Gewinne verglichen werden." },
    { title: "Beispiel 2 · Rentabilitätsvergleich (Berger & Co GmbH)", text: "A: AK 120.000, ND 10, kv 3,20 × 25.000, so. fix 6.000, Instandhaltung fix 1.000, so. variabel 10.000, RW 0, Erlöse 120.000. B: AK 80.000, kv 3,75 × 28.000, so. fix 4.000, Instandh. 2.000, so. var. 10.500, RW 10.000, Erlöse 140.000. i = 10 %.",
      steps: [{ q: "Gewinn A (€)", a: 5000, tol: 0.5, how: "120.000 − (12.000 Afa + 6.000 Zinsen + 7.000 fix + 80.000 + 10.000)" }, { q: "Rentabilität A (%)", a: 18.33, tol: 0.05, how: "(5.000 + 6.000) / 60.000" }, { q: "Gewinn B (€)", a: 7000, tol: 0.5, how: "140.000 − (7.000 + 4.500 + 6.000 + 105.000 + 10.500)" }, { q: "Rentabilität B (%)", a: 25.56, tol: 0.05, how: "(7.000 + 4.500) / 45.000" }],
      concl: "B ist vorteilhafter. Nicht abnutzbares AV (Grund und Boden, Beteiligungen) bindet das Kapital voll, weil keine Abschreibungsrückflüsse entstehen." },
    { title: "Beispiel 3 · Amortisationsrechnung", text: "A: AK 100.000, ND 5, RW 0, Gewinne 20/24/30/30/40 Tsd. B: AK 125.000, ND 5, RW 12.000, Gewinne 53/45/32/33/20 Tsd. Lineare Afa.",
      steps: [{ q: "Durchschnittsmethode A (Jahre, 2 Nachkommastellen)", a: 2.05, tol: 0.01, how: "100.000 / (28.800 + 20.000)" }, { q: "Durchschnittsmethode B (Jahre)", a: 1.91, tol: 0.01, how: "(125.000 − 12.000) / (36.600 + 22.600)" }, { q: "Kumulationsmethode A (Jahre, linear interpoliert)", a: 2.32, tol: 0.01, how: "Rückflüsse 40/44/50 Tsd.: nach 2 J. 84.000 → 2 + 16.000/50.000" }],
      concl: "Beide Methoden können abweichen, weil die Durchschnittsmethode ungleich verteilte Rückflüsse glättet. B hat hohe Rückflüsse früh. Kritik: Rückflüsse nach dem Amortisationszeitpunkt und Zeitwert werden ignoriert." }
  ],
  dyn: [
    { title: "Beispiel 4 · Kapitalwert & Sensitivität", text: "A₀ = 200.000. Jahre 1–6: Einzahlungen 90.000, Auszahlungen 30.000. Jahr 7: 80.000 / 10.000.",
      steps: [{ q: "KW bei 10 % (€, gerundet)", a: 97236.71, tol: 2, how: "−200.000 + 60.000 × RBF(10 %, 6) + 70.000 × 1,1⁻⁷" }, { q: "KW bei 12 % (€)", a: 78348.88, tol: 2, how: "analog mit 12 %" }, { q: "KW bei 15 % (€)", a: 53384.55, tol: 2, how: "analog mit 15 %" }],
      concl: "Höherer Zins → niedrigerer KW, weil spätere Rückflüsse stärker abgezinst werden. KW > 0: Kapital + Mindestverzinsung werden erwirtschaftet plus Überschuss in Höhe des KW." },
    { title: "Beispiel 5 · Annuitätenmethode", text: "i = 8 %. Maschine 1: AK 10.000, ND 5, Rückflüsse 2.000/3.000/3.000/3.500/3.000. Maschine 2: AK 10.000, ND 4, Rückflüsse 2.500/3.500/3.000/3.800 + Liquidationserlös 700.",
      steps: [{ q: "KW Maschine 1 (€)", a: 1419.72, tol: 1, how: "Σ Rückflüsse × 1,08⁻ᵗ − 10.000" }, { q: "Annuität Maschine 1 (€)", a: 355.58, tol: 0.5, how: "KW × 0,08 / (1 − 1,08⁻⁵)" }, { q: "KW Maschine 2 (€)", a: 1004.63, tol: 1, how: "inkl. 700 im Jahr 4" }, { q: "Annuität Maschine 2 (€)", a: 303.32, tol: 0.5, how: "KW × 0,08 / (1 − 1,08⁻⁴)" }],
      concl: "Maschine 1 ist nach beiden Kriterien vorteilhafter. Problem: unterschiedliche ND. Lösung: Annahme über Anschlussinvestition bzw. Wiederanlage für das fehlende Jahr." },
    { title: "Beispiel 6 · Interner Zinsfuß (Alpha GmbH)", text: "Beide A₀ = 90.000, ND 6. Maschine I: Überschüsse 15/21/17/25/25/15 Tsd. + LE 15.000. Maschine II: 20/25/30/20/9/8 Tsd. + LE 5.000. Versuchszinssätze 6 % und 20 %.",
      steps: [{ q: "KW I bei 6 % (€)", a: 16747.01, tol: 2, how: "" }, { q: "KW I bei 20 % (€)", a: -20928.5, tol: 2, how: "" }, { q: "IZF I interpoliert (%)", a: 12.22, tol: 0.05, how: "0,06 − 16.747 × 0,14 / (−20.929 − 16.747)" }, { q: "IZF II interpoliert (%)", a: 9.88, tol: 0.05, how: "KW(6 %) 8.038,10 · KW(20 %) −20.995,48" }],
      concl: "Exakte Werte (Zielwertsuche, wie in Zielwertsuche.xlsx): I ≈ 11,11 %, II ≈ 9,14 %. Die Interpolation überschätzt, weil die KW-Kurve konvex ist. Maschine I wählen. Der IZF ist die Effektivverzinsung des gebundenen Kapitals." }
  ]
};

const RATIO_SETS = {
  verm: { title: "Kennzahlen üben: Vermögenslage", fields: [["av", "Anlagevermögen", 1479], ["gv", "Gesamtvermögen", 4007], ["vor", "Vorräte", 1410], ["me", "Materialeinsatz", 5200], ["vorAvg", "ø Vorratsbestand", 1458], ["ums", "Umsatzerlöse", 8400], ["ust", "USt-Satz %", 20], ["ford", "ø Forderungen LL", 525]],
    out: [["Anlageintensität", "%", v => v.av / v.gv * 100], ["Lagerintensität", "%", v => v.vor / v.gv * 100], ["Lagerumschlagshäufigkeit", "×", v => v.me / v.vorAvg], ["Lagerdauer", "Tage", v => 365 / (v.me / v.vorAvg)], ["Debitorenumschlagshäufigkeit", "×", v => v.ums * (1 + v.ust / 100) / v.ford], ["Debitorenumschlagsdauer", "Tage", v => 365 / (v.ums * (1 + v.ust / 100) / v.ford)]] },
  fin: { title: "Kennzahlen üben: Finanzlage", fields: [["ek", "Eigenkapital", 767], ["fk", "Fremdkapital", 3240], ["av", "Anlagevermögen", 1479], ["lfk", "langfristiges FK", 1070], ["luv", "langfristiges UV", 0], ["zm", "Zahlungsmittel", 1], ["muv", "monetäres UV", 1055], ["kuv", "kurzfristiges UV", 2528], ["kfk", "kurzfristiges FK", 2170]],
    out: [["Eigenkapitalquote", "%", v => v.ek / (v.ek + v.fk) * 100], ["Fremdkapitalquote", "%", v => v.fk / (v.ek + v.fk) * 100], ["Deckungsgrad A", "%", v => v.ek / v.av * 100], ["Deckungsgrad B", "%", v => (v.ek + v.lfk) / v.av * 100], ["Deckungsgrad C", "%", v => (v.ek + v.lfk) / (v.av + v.luv) * 100], ["Liquidität 1. Grades", "%", v => v.zm / v.kfk * 100], ["Liquidität 2. Grades", "%", v => v.muv / v.kfk * 100], ["Liquidität 3. Grades", "%", v => v.kuv / v.kfk * 100]] },
  ertr: { title: "Kennzahlen üben: Ertragslage", fields: [["ebt", "Ergebnis vor Steuern", 120], ["zins", "FK-Zinsen", 30], ["ekAvg", "ø Eigenkapital", 600], ["gkAvg", "ø Gesamtkapital", 1500]],
    out: [["Eigenkapitalrentabilität (ROE)", "%", v => v.ebt / v.ekAvg * 100], ["Gesamtkapitalrentabilität (ROI)", "%", v => (v.ebt + v.zins) / v.gkAvg * 100]] }
};

window.COURSE_DEFS = window.COURSE_DEFS || [];
window.COURSE_DEFS.push({
  id: "bwl2", name: "Grundlagen der BWL 2", short: "GL-BWL-2", title: "BWL 2", semester: 3, ects: 2.5, color: "#A78BFA", icon: "€", lang: "de",
  lecturers: "Mag. Dr. Alexander Herbst · „Wirtschaftswunder trifft Codeartist“",
  description: "Jahresabschlussanalyse, Kosten- und Leistungsrechnung, statische und dynamische Investitionsrechnung, Finanzierung.",
  aiRule: "In der Klausur nur vom Lehrenden zugelassene Hilfsmittel (Excel erlaubt, SEB). KI laut Syllabus zum Lernen erlaubt: analytische Unterstützung, Szenarien, Präsentationshilfe.",
  topics: TOPICS, worlds: WORLDS, questions: QUESTIONS, bossExtra: BOSS_EXTRA, flashcards: FLASHCARDS, cases: CASES, ratioSets: RATIO_SETS, exam: "mc",
  assessment: { parts: [{ id: "klausur", label: "Schlussklausur (Moodle/SEB, 90 Punkte)", max: 90 }], scale: [[88, "1 · Sehr gut"], [76, "2 · Gut"], [63, "3 · Befriedigend"], [50, "4 · Genügend"], [0, "5 · Nicht genügend"]], note: "10-%-Punkte-Abzug bei verweigerter Mitarbeit. 80 % Anwesenheit. Wahl zwischen Antritt 1a und 1b." },
  resources: { sections: [{ title: "Moodle", items: [{ title: "Foliensatz Grundlagen der BWL 2 (230 Folien)" }, { title: "Übungseinheiten 1–5 (Fallstudien)" }, { title: "Zielwertsuche.xlsx – interner Zinsfuß in Excel", note: "Daten → Was-wäre-wenn-Analyse → Zielwertsuche: Kapitalwert-Zelle auf 0 setzen durch Ändern des Zinssatzes" }, { title: "Forum Mitschriften" }] }],
    books: [{ title: "Grundlagen der finanziellen Unternehmensführung, Bd. I–IV", author: "Eisl/Losbichler (Hrsg.), Linde", tag: "Pflicht" }, { title: "Einführung in die Allgemeine Betriebswirtschaftslehre", author: "Egger/Egger/Schauer, Linde", tag: "Pflicht" }, { title: "Betriebswirtschaftslehre", author: "Schauer, Linde", tag: "Nachhilfe" }, { title: "Rechnungswesen graphisch dargestellt", author: "Kreidl/Messner, LexisNexis 2010", tag: "Folienquelle" }] },
  events: [
    { id: "bwl-exam", title: "BWL 2 · Schlussklausur (Antritt 1a/1b)", type: "exam", date: null, note: "Termin laut Moodle eintragen. Eigengerät mit SEB, Excel bereit." }
  ],
  tasks: [
    { id: "bt-ue1", title: "Übung 1 vorbereiten: Geschäftsfälle, Bilanzierungskreislauf, Vermögenslage", note: "Aufgabenstellungen studieren, Lösungswege skizzieren. Ad-hoc-Präsentation möglich." },
    { id: "bt-ue2", title: "Übung 2 vorbereiten: Kennzahlen Pix Mania GmbH, Kapitalflussrechnung", note: "" },
    { id: "bt-ue3", title: "Übung 3 vorbereiten: Vollkostenrechnung (BÜB, BAB), DB-Rechnung", note: "" },
    { id: "bt-ue4", title: "Übung 4 vorbereiten: PUG, Break-Even, Produktionsprogramm", note: "" },
    { id: "bt-ue5", title: "Übung 5 vorbereiten: Investitionsrechnung statisch und dynamisch", note: "" },
    { id: "bt-excel", title: "Excel-Zielwertsuche für den IZF üben", note: "In der Klausur ist Excel erlaubt." }
  ]
});
})();
