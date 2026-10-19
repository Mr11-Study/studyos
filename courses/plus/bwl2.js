/* BWL 2 · Plus: Rechner mit Live-Graph, Animationen, durchgerechnete Beispiele und zusätzliche Fragen (über STUDYOS_EXT, siehe courses/ext-apply.js) */
(function () {
const C = window.STUDYOS_CALC = window.STUDYOS_CALC || {};
const FIG = window.STUDYOS_FIG = window.STUDYOS_FIG || {};
const FX = window.FX;
const eur = n => "€ " + n.toLocaleString("de-AT", { maximumFractionDigits: 2 });
const f = (n, d = 2) => (typeof n === "number" && isFinite(n)) ? n.toLocaleString("de-AT", { minimumFractionDigits: d, maximumFractionDigits: d }) : "–";
const e2 = n => "€ " + f(n, 2), e0 = n => "€ " + f(n, 0), pc = (n, d = 1) => f(n, d) + " %";
const npv = (cf, i) => cf.reduce((s, v, t) => s + v / Math.pow(1 + i, t), 0);
const irr = cf => { let lo = -0.99, hi = 1; if (npv(cf, lo) * npv(cf, hi) > 0) { hi = 10; if (npv(cf, lo) * npv(cf, hi) > 0) return NaN; } for (let k = 0; k < 200; k++) { const m = (lo + hi) / 2; if (npv(cf, lo) * npv(cf, m) <= 0) hi = m; else lo = m; } return (lo + hi) / 2; };
const rbf = (i, n) => i === 0 ? n : (1 - Math.pow(1 + i, -n)) / i;
const kwf = (i, n) => 1 / rbf(i, n);

/* ======================= Rechner ======================= */

C["bwl-bep"] = {
  title: "Break-even-Rechner",
  intro: "Ändere Preis, variable Kosten und Fixkosten. Der Graph zeigt Erlös- und Kostengerade, der Schnittpunkt ist die Gewinnschwelle. Fahr mit dem Finger oder der Maus über den Graph.",
  inputs: [
    { k: "p", label: "Preis pro Stück", v: 50, min: 1, max: 200, step: 1, unit: "€" },
    { k: "kv", label: "variable Kosten pro Stück", v: 30, min: 0, max: 190, step: 1, unit: "€" },
    { k: "kf", label: "Fixkosten pro Periode", v: 40000, min: 0, max: 200000, step: 1000, unit: "€" },
    { k: "x", label: "geplante Menge", v: 3000, min: 0, max: 10000, step: 50, unit: "Stk" }
  ],
  out: v => { const db = v.p - v.kv, bep = db > 0 ? v.kf / db : NaN, g = db * v.x - v.kf;
    return [["Deckungsbeitrag pro Stück", db, "€"], ["Break-even-Menge", isFinite(bep) ? Math.ceil(bep) : "kein BEP", isFinite(bep) ? "Stk" : "", true], ["Break-even-Umsatz", isFinite(bep) ? bep * v.p : "–", "€"], [g >= 0 ? "Gewinn bei geplanter Menge" : "Verlust bei geplanter Menge", g, "€"], ["Sicherheitsabstand", isFinite(bep) && v.x ? Math.round(100 * (v.x - bep) / v.x) : "–", "%"]]; },
  steps: v => { const db = v.p - v.kv; return `db = p − k<sub>v</sub> = ${eur(v.p)} − ${eur(v.kv)} = <b>${eur(db)}</b><br>
    x<sub>BEP</sub> = K<sub>f</sub> / db = ${eur(v.kf)} / ${eur(db)} = <b>${db > 0 ? (v.kf / db).toLocaleString("de-AT", { maximumFractionDigits: 2 }) : "–"} Stück</b> (aufrunden, halbe Stücke gibt es nicht)<br>
    Gewinn bei ${v.x} Stück = db · x − K<sub>f</sub> = ${eur(db)} · ${v.x} − ${eur(v.kf)} = <b>${eur(db * v.x - v.kf)}</b>`; },
  plot: { x: v => [0, Math.max(100, Math.ceil(Math.max(v.x, (v.p - v.kv) > 0 ? v.kf / (v.p - v.kv) : 0) * 1.4 / 100) * 100)], xl: "Menge (Stk)", yl: "€",
    fns: [{ label: "Erlös E(x) = p · x", f: (x, v) => v.p * x }, { label: "Kosten K(x) = Kf + kv · x", f: (x, v) => v.kf + v.kv * x }, { label: "Gewinn G(x)", f: (x, v) => (v.p - v.kv) * x - v.kf }],
    points: v => { const db = v.p - v.kv; return db > 0 ? [{ x: v.kf / db, y: v.kf / db * v.p, label: "Break-even" }] : []; } }
};

/* --- Vermögenslage: Umschlagsdauern und Finanzierungslücke --- */
C["bwl2-umschlag"] = {
  title: "Umschlagsdauern und Finanzierungslücke",
  intro: "Lager-, Debitoren- und Kreditorenumschlag aus Bilanz und GuV (Werte in TEUR). Die Balken zeigen, wie lange Geld im Lager und bei den Kund:innen steckt und wie lange dich die Lieferanten finanzieren.",
  inputs: [
    { k: "me", label: "Materialeinsatz (GuV)", v: 4200, min: 0, max: 20000, step: 10, unit: "T€" },
    { k: "vor", label: "ø Vorratsbestand", v: 840, min: 1, max: 5000, step: 10, unit: "T€" },
    { k: "ums", label: "Umsatzerlöse (netto)", v: 6000, min: 0, max: 30000, step: 10, unit: "T€" },
    { k: "ford", label: "ø Forderungen LL", v: 600, min: 1, max: 5000, step: 10, unit: "T€" },
    { k: "mek", label: "Materialeinkauf (netto)", v: 4380, min: 0, max: 20000, step: 10, unit: "T€" },
    { k: "verb", label: "ø Verbindlichkeiten LL", v: 648, min: 1, max: 5000, step: 1, unit: "T€" },
    { k: "ust", label: "USt-Satz", v: 20, min: 0, max: 25, step: 1, unit: "%" }
  ],
  out: v => { const q = 1 + v.ust / 100, luh = v.me / v.vor, duh = v.ums * q / v.ford, kuh = v.mek * q / v.verb, ld = 365 / luh, dd = 365 / duh, kd = 365 / kuh;
    return [["Lagerumschlagshäufigkeit", f(luh, 2) + " ×"], ["Lagerdauer", ld, "Tage"], ["Debitorenumschlagsdauer", dd, "Tage"], ["Kreditorenumschlagsdauer", kd, "Tage"], ["Finanzierungslücke", ld + dd - kd, "Tage", true]]; },
  steps: v => { const q = 1 + v.ust / 100, luh = v.me / v.vor, duh = v.ums * q / v.ford, kuh = v.mek * q / v.verb;
    return `LUH = Materialeinsatz / ø Vorräte = ${f(v.me, 0)} / ${f(v.vor, 0)} = <b>${f(luh, 2)}</b> → Lagerdauer = 365 / ${f(luh, 2)} = <b>${f(365 / luh, 1)} Tage</b><br>
    DUH = (Umsatzerlöse + USt) / ø Forderungen LL = ${f(v.ums * q, 0)} / ${f(v.ford, 0)} = <b>${f(duh, 2)}</b> → Debitorenumschlagsdauer = 365 / ${f(duh, 2)} = <b>${f(365 / duh, 1)} Tage</b><br>
    KUH = (Materialeinkauf + USt) / ø Verbindlichkeiten LL = ${f(v.mek * q, 0)} / ${f(v.verb, 0)} = <b>${f(kuh, 2)}</b> → Kreditorenumschlagsdauer = <b>${f(365 / kuh, 1)} Tage</b><br>
    Finanzierungslücke = Lagerdauer + Debitorenlaufzeit − Kreditorenlaufzeit = ${f(365 / luh, 1)} + ${f(365 / duh, 1)} − ${f(365 / kuh, 1)} = <b>${f(365 / luh + 365 / duh - 365 / kuh, 1)} Tage</b><br>
    <small>Die USt kommt in den Zähler, weil Forderungen und Verbindlichkeiten brutto (inkl. USt) in der Bilanz stehen, Umsatz und Einkauf aber netto.</small>`; },
  plot: { bars: v => { const q = 1 + v.ust / 100, ld = 365 * v.vor / v.me, dd = 365 * v.ford / (v.ums * q), kd = 365 * v.verb / (v.mek * q);
    return [{ label: "Lagerdauer", y: ld }, { label: "Debitoren", y: dd }, { label: "Kreditoren", y: kd }, { label: "Lücke", y: Math.max(0, ld + dd - kd) }]; }, yfmt: n => f(n, 0) }
};

/* --- Finanzlage: Struktur- und Liquiditätskennzahlen --- */
C["bwl2-kennz"] = {
  title: "Kennzahlen-Rechner: Kapitalstruktur, Deckungsgrade, Liquidität",
  intro: "Gib eine vereinfachte Bilanz ein (TEUR). Alle Kennzahlen werden sofort neu berechnet. Liquidität 1. Grades nutzt nur Zahlungsmittel, 2. Grades zusätzlich Forderungen und Wertpapiere (monetäres UV), 3. Grades das gesamte kurzfristige UV.",
  inputs: [
    { k: "av", label: "Anlagevermögen", v: 1200, min: 0, max: 5000, step: 10, unit: "T€" },
    { k: "vor", label: "Vorräte", v: 900, min: 0, max: 5000, step: 10, unit: "T€" },
    { k: "ford", label: "kfr. Forderungen + WP des UV", v: 700, min: 0, max: 5000, step: 10, unit: "T€" },
    { k: "zm", label: "Zahlungsmittel (Kassa, Bank)", v: 200, min: 0, max: 3000, step: 10, unit: "T€" },
    { k: "ek", label: "Eigenkapital", v: 900, min: 0, max: 5000, step: 10, unit: "T€" },
    { k: "lfk", label: "langfristiges Fremdkapital", v: 800, min: 0, max: 5000, step: 10, unit: "T€" },
    { k: "kfk", label: "kurzfristiges Fremdkapital", v: 1300, min: 1, max: 5000, step: 10, unit: "T€" }
  ],
  out: v => { const gv = v.av + v.vor + v.ford + v.zm, gk = v.ek + v.lfk + v.kfk, r = [];
    if (Math.abs(gv - gk) > 0.5) r.push(["Achtung: Aktiva ≠ Passiva", f(gv - gk, 0), "T€"]);
    return r.concat([["Eigenkapitalquote", v.ek / gk * 100, "%", true], ["Fremdkapitalquote", (v.lfk + v.kfk) / gk * 100, "%"], ["Deckungsgrad A", v.ek / v.av * 100, "%"], ["Deckungsgrad B", (v.ek + v.lfk) / v.av * 100, "%"],
      ["Liquidität 1. Grades", v.zm / v.kfk * 100, "%"], ["Liquidität 2. Grades", (v.zm + v.ford) / v.kfk * 100, "%"], ["Liquidität 3. Grades", (v.zm + v.ford + v.vor) / v.kfk * 100, "%"]]); },
  steps: v => { const gk = v.ek + v.lfk + v.kfk;
    return `GK = EK + lfr. FK + kfr. FK = ${f(v.ek, 0)} + ${f(v.lfk, 0)} + ${f(v.kfk, 0)} = ${f(gk, 0)}<br>
    EK-Quote = EK / GK × 100 = ${f(v.ek, 0)} / ${f(gk, 0)} × 100 = <b>${pc(v.ek / gk * 100)}</b><br>
    Deckungsgrad A = EK / AV × 100 = ${f(v.ek, 0)} / ${f(v.av, 0)} × 100 = <b>${pc(v.ek / v.av * 100)}</b><br>
    Deckungsgrad B = (EK + lfr. FK) / AV × 100 = ${f(v.ek + v.lfk, 0)} / ${f(v.av, 0)} × 100 = <b>${pc((v.ek + v.lfk) / v.av * 100)}</b> ${(v.ek + v.lfk) / v.av >= 1 ? "(≥ 100 %: AV fristenkongruent finanziert)" : "(&lt; 100 %: Teile des AV sind kurzfristig finanziert)"}<br>
    Liquidität 1. Grades = Zahlungsmittel / kfr. FK = ${f(v.zm, 0)} / ${f(v.kfk, 0)} = <b>${pc(v.zm / v.kfk * 100)}</b><br>
    Liquidität 2. Grades (Quick Ratio) = monetäres UV / kfr. FK = ${f(v.zm + v.ford, 0)} / ${f(v.kfk, 0)} = <b>${pc((v.zm + v.ford) / v.kfk * 100)}</b> (Faustregel ≥ 100 %)<br>
    Liquidität 3. Grades (Current Ratio) = kfr. UV / kfr. FK = ${f(v.zm + v.ford + v.vor, 0)} / ${f(v.kfk, 0)} = <b>${pc((v.zm + v.ford + v.vor) / v.kfk * 100)}</b> (Banker's Rule 200 %)`; },
  plot: { bars: v => { const gk = v.ek + v.lfk + v.kfk; return [{ label: "EK-Quote", y: v.ek / gk * 100 }, { label: "DG A", y: v.ek / v.av * 100 }, { label: "DG B", y: (v.ek + v.lfk) / v.av * 100 }, { label: "Liq. 1", y: v.zm / v.kfk * 100 }, { label: "Liq. 2", y: (v.zm + v.ford) / v.kfk * 100 }, { label: "Liq. 3", y: (v.zm + v.ford + v.vor) / v.kfk * 100 }]; }, yfmt: n => f(n, 0) + " %" }
};

/* --- Cash-Flow indirekt --- */
C["bwl2-cf"] = {
  title: "Cash-Flow (indirekte Methode) und Kapitalflussrechnung",
  intro: "Vom Jahresüberschuss zum operativen Cash-Flow, dann Investitions- und Finanzierungsbereich bis zur Veränderung der liquiden Mittel (TEUR). Für Veränderungen gilt: + = Bestand ist gestiegen, − = gesunken. Im Diagramm sind die Beträge gezeigt; ein „−“ im Namen heißt Mittelabfluss.",
  inputs: [
    { k: "jue", label: "Jahresüberschuss", v: 120, min: -500, max: 1000, step: 5, unit: "T€" },
    { k: "afa", label: "Abschreibungen auf das AV", v: 80, min: 0, max: 1000, step: 5, unit: "T€" },
    { k: "zu", label: "Zuschreibungen", v: 0, min: 0, max: 300, step: 5, unit: "T€" },
    { k: "rst", label: "Δ langfristige Rückstellungen", v: 15, min: -300, max: 300, step: 5, unit: "T€" },
    { k: "agw", label: "Gewinn (+) / Verlust (−) Anlagenabgang", v: 10, min: -300, max: 300, step: 5, unit: "T€" },
    { k: "dvor", label: "Δ Vorräte", v: 30, min: -500, max: 500, step: 5, unit: "T€" },
    { k: "dford", label: "Δ Forderungen LL", v: -20, min: -500, max: 500, step: 5, unit: "T€" },
    { k: "dverb", label: "Δ Verbindlichkeiten LL", v: 25, min: -500, max: 500, step: 5, unit: "T€" },
    { k: "inv", label: "Auszahlungen für Investitionen", v: 150, min: 0, max: 1500, step: 5, unit: "T€" },
    { k: "desinv", label: "Einzahlungen aus Anlagenverkauf", v: 40, min: 0, max: 1000, step: 5, unit: "T€" },
    { k: "fin", label: "Saldo Finanzierungstätigkeit", v: -100, min: -1000, max: 1000, step: 5, unit: "T€" },
    { k: "fk", label: "Fremdkapital (für Schuldentilgungsdauer)", v: 900, min: 0, max: 10000, step: 10, unit: "T€" },
    { k: "lm", label: "liquide Mittel + WP des UV", v: 60, min: 0, max: 3000, step: 5, unit: "T€" }
  ],
  calc: v => { const cfe = v.jue + v.afa - v.zu + v.rst - v.agw, op = cfe - v.dvor - v.dford + v.dverb, iv = v.desinv - v.inv, d = op + iv + v.fin, ev = v.fk - v.lm; return { cfe, op, iv, d, ev, sdt: cfe > 0 ? ev / cfe : NaN }; },
  out: v => { const r = C["bwl2-cf"].calc(v);
    return [["Cash-Flow aus dem Ergebnis", r.cfe, "T€"], ["Cash-Flow operativ", r.op, "T€", true], ["Cash-Flow Investition", r.iv, "T€"], ["Cash-Flow Finanzierung", v.fin, "T€"], ["Δ liquide Mittel", r.d, "T€"], ["Effektivverschuldung", r.ev, "T€"], ["dyn. Schuldentilgungsdauer", isFinite(r.sdt) ? f(r.sdt, 1) : "–", "Jahre"]]; },
  steps: v => { const r = C["bwl2-cf"].calc(v), s = n => (n >= 0 ? "+ " : "− ") + f(Math.abs(n), 0);
    return `<b>Cash-Flow aus dem Ergebnis</b> = JÜ + Afa − Zuschreibungen ± Δ lfr. Rückstellungen ∓ Ergebnis Anlagenabgang<br>
    = ${f(v.jue, 0)} ${s(v.afa)} ${s(-v.zu)} ${s(v.rst)} ${s(-v.agw)} = <b>${f(r.cfe, 0)}</b><br>
    <b>Operativ</b>: ${f(r.cfe, 0)} ${s(-v.dvor)} (Vorräte) ${s(-v.dford)} (Forderungen) ${s(v.dverb)} (Verbindlichkeiten LL) = <b>${f(r.op, 0)}</b><br>
    <small>Aktiva steigen → Geld gebunden → minus. Passiva steigen → Geld bleibt länger im Haus → plus.</small><br>
    <b>Investition</b>: −${f(v.inv, 0)} + ${f(v.desinv, 0)} = <b>${f(r.iv, 0)}</b> (der Verkaufserlös steht hier, der Buchgewinn wurde oben herausgerechnet)<br>
    <b>Finanzierung</b>: <b>${f(v.fin, 0)}</b><br>
    Δ liquide Mittel = ${f(r.op, 0)} ${s(r.iv)} ${s(v.fin)} = <b>${f(r.d, 0)}</b><br>
    Effektivverschuldung = FK − liquide Mittel − WP des UV = ${f(v.fk, 0)} − ${f(v.lm, 0)} = ${f(r.ev, 0)}; Schuldentilgungsdauer = ${f(r.ev, 0)} / ${f(r.cfe, 0)} = <b>${isFinite(r.sdt) ? f(r.sdt, 1) + " Jahre" : "–"}</b>`; },
  plot: { bars: v => { const r = C["bwl2-cf"].calc(v), lab = (t, n) => t + (n < 0 ? " (−)" : "");
    return [{ label: lab("Ergebnis", r.cfe), y: Math.abs(r.cfe) }, { label: lab("operativ", r.op), y: Math.abs(r.op) }, { label: lab("Invest.", r.iv), y: Math.abs(r.iv) }, { label: lab("Finanz.", v.fin), y: Math.abs(v.fin) }, { label: lab("Δ liquide", r.d), y: Math.abs(r.d) }]; }, yfmt: n => f(n, 0) }
};

/* --- Ertragslage: Leverage-Effekt --- */
C["bwl2-leverage"] = {
  title: "Leverage-Effekt: EK-Rentabilität über dem Verschuldungsgrad",
  intro: "ROE = ROA + (ROA − i) · FK/EK. Solange die Gesamtkapitalrentabilität (ROA) über dem FK-Zins i liegt, hebt mehr Fremdkapital die EK-Rentabilität. Die zweite Kurve zeigt dasselbe Unternehmen in einem schwachen Jahr: der Hebel wirkt dann nach unten.",
  inputs: [
    { k: "ek", label: "Eigenkapital", v: 400, min: 1, max: 2000, step: 10, unit: "T€" },
    { k: "fk", label: "Fremdkapital", v: 600, min: 0, max: 4000, step: 10, unit: "T€" },
    { k: "roa", label: "ROA (Ergebnis vor Zinsen / GK)", v: 10, min: -10, max: 30, step: 0.5, unit: "%" },
    { k: "i", label: "FK-Zinssatz i", v: 6, min: 0, max: 15, step: 0.25, unit: "%" },
    { k: "roa2", label: "ROA im schwachen Jahr", v: 4, min: -10, max: 30, step: 0.5, unit: "%" }
  ],
  out: v => { const V = v.fk / v.ek, roe = v.roa + (v.roa - v.i) * V, roe2 = v.roa2 + (v.roa2 - v.i) * V, gk = v.ek + v.fk;
    return [["Verschuldungsgrad FK/EK", f(V, 2)], ["Ergebnis vor Zinsen", gk * v.roa / 100, "T€"], ["FK-Zinsen", v.fk * v.i / 100, "T€"], ["Ergebnis vor Steuern", gk * v.roa / 100 - v.fk * v.i / 100, "T€"], ["EK-Rentabilität (ROE)", roe, "%", true], ["ROE im schwachen Jahr", roe2, "%"]]; },
  steps: v => { const V = v.fk / v.ek, gk = v.ek + v.fk, ebit = gk * v.roa / 100, z = v.fk * v.i / 100;
    return `Ergebnis vor Zinsen = ROA × GK = ${pc(v.roa)} × ${f(gk, 0)} = ${f(ebit, 1)}; FK-Zinsen = ${pc(v.i, 2)} × ${f(v.fk, 0)} = ${f(z, 1)}<br>
    EBT = ${f(ebit, 1)} − ${f(z, 1)} = ${f(ebit - z, 1)} → ROE = EBT / EK = ${f(ebit - z, 1)} / ${f(v.ek, 0)} = <b>${pc((ebit - z) / v.ek * 100)}</b><br>
    Kontrolle mit der Leverage-Formel: ROE = ROA + (ROA − i) · FK/EK = ${f(v.roa, 1)} + (${f(v.roa, 1)} − ${f(v.i, 2)}) · ${f(V, 2)} = <b>${pc(v.roa + (v.roa - v.i) * V)}</b><br>
    ${v.roa > v.i ? "ROA &gt; i: positiver Hebel – jeder geliehene Euro verdient mehr, als er kostet." : v.roa < v.i ? "ROA &lt; i: negativer Hebel – mehr Fremdkapital drückt die EK-Rentabilität." : "ROA = i: der Verschuldungsgrad hat keinen Einfluss."}<br>
    <small>Annahme: ROA und i hängen nicht vom Verschuldungsgrad ab. In der Realität verlangen Banken bei hoher Verschuldung höhere Zinsen (Leverage-Risiko).</small>`; },
  plot: { x: v => [0, Math.max(4, Math.ceil(v.fk / v.ek * 1.5))], xl: "Verschuldungsgrad FK/EK", yl: "%", xfmt: n => f(n, 1), yfmt: n => f(n, 0) + " %",
    fns: [{ label: "ROE (normales Jahr)", f: (x, v) => v.roa + (v.roa - v.i) * x }, { label: "ROE (schwaches Jahr)", f: (x, v) => v.roa2 + (v.roa2 - v.i) * x }, { label: "FK-Zins i", f: (x, v) => v.i }],
    points: v => [{ x: v.fk / v.ek, y: v.roa + (v.roa - v.i) * v.fk / v.ek, label: "heute" }] }
};

/* --- BAB mit Stufenleiterverfahren und Zuschlagskalkulation --- */
C["bwl2-bab"] = {
  title: "Mini-BAB mit Hilfskostenstelle und Zuschlagskalkulation",
  intro: "Die Hilfskostenstelle Fuhrpark wird nach Leistungsanteilen auf die Hauptkostenstellen umgelegt (Stufenleiterprinzip). Danach ergeben sich die Zuschlagssätze, mit denen ein Auftrag kalkuliert wird.",
  inputs: [
    { k: "h", label: "Primäre GK Fuhrpark (Hilfsstelle)", v: 10000, min: 0, max: 100000, step: 500, unit: "€" },
    { k: "hm", label: "Fuhrpark-Anteil Material", v: 20, min: 0, max: 100, step: 5, unit: "%" },
    { k: "hf", label: "Fuhrpark-Anteil Fertigung", v: 30, min: 0, max: 100, step: 5, unit: "%" },
    { k: "hv", label: "Fuhrpark-Anteil Verwaltung", v: 10, min: 0, max: 100, step: 5, unit: "%" },
    { k: "m", label: "Primäre GK Material", v: 13000, min: 0, max: 200000, step: 500, unit: "€" },
    { k: "fg", label: "Primäre GK Fertigung", v: 57000, min: 0, max: 300000, step: 500, unit: "€" },
    { k: "vw", label: "Primäre GK Verwaltung", v: 26500, min: 0, max: 200000, step: 500, unit: "€" },
    { k: "vt", label: "Primäre GK Vertrieb", v: 9750, min: 0, max: 200000, step: 250, unit: "€" },
    { k: "fmP", label: "Fertigungsmaterial der Periode", v: 150000, min: 1, max: 1000000, step: 5000, unit: "€" },
    { k: "flP", label: "Fertigungslöhne der Periode", v: 50000, min: 1, max: 500000, step: 1000, unit: "€" },
    { k: "fm", label: "Auftrag: Fertigungsmaterial", v: 2000, min: 0, max: 50000, step: 100, unit: "€" },
    { k: "fl", label: "Auftrag: Fertigungslöhne", v: 800, min: 0, max: 50000, step: 50, unit: "€" },
    { k: "gew", label: "Gewinnzuschlag", v: 10, min: 0, max: 50, step: 1, unit: "%" }
  ],
  calc: v => { const ht = Math.max(0, 100 - v.hm - v.hf - v.hv), M = v.m + v.h * v.hm / 100, F = v.fg + v.h * v.hf / 100, VW = v.vw + v.h * v.hv / 100, VT = v.vt + v.h * ht / 100,
    hkP = v.fmP + M + v.flP + F, z = { m: M / v.fmP, f: F / v.flP, vw: VW / hkP, vt: VT / hkP },
    mk = v.fm * (1 + z.m), fk = v.fl * (1 + z.f), hk = mk + fk, sk = hk * (1 + z.vw + z.vt), nbp = sk * (1 + v.gew / 100);
    return { ht, M, F, VW, VT, hkP, z, mk, fk, hk, sk, nbp, bad: v.hm + v.hf + v.hv > 100 }; },
  out: v => { const r = C["bwl2-bab"].calc(v), o = [];
    if (r.bad) o.push(["Achtung: Anteile über 100 %", f(v.hm + v.hf + v.hv, 0), "%"]);
    return o.concat([["MGK-Zuschlag", r.z.m * 100, "%"], ["FGK-Zuschlag", r.z.f * 100, "%"], ["VwGK-Zuschlag (auf HK)", r.z.vw * 100, "%"], ["VtGK-Zuschlag (auf HK)", r.z.vt * 100, "%"], ["Herstellkosten Auftrag", r.hk, "€"], ["Selbstkosten Auftrag", r.sk, "€", true], ["Nettobarpreis", r.nbp, "€"]]); },
  steps: v => { const r = C["bwl2-bab"].calc(v), z = r.z;
    return `<table class="dt"><tr><th></th><th>Fuhrpark</th><th>Material</th><th>Fertigung</th><th>Verwaltung</th><th>Vertrieb</th></tr>
    <tr><td>primäre GK</td><td>${f(v.h, 0)}</td><td>${f(v.m, 0)}</td><td>${f(v.fg, 0)}</td><td>${f(v.vw, 0)}</td><td>${f(v.vt, 0)}</td></tr>
    <tr><td>Umlage Fuhrpark</td><td>−${f(v.h, 0)}</td><td>${f(v.h * v.hm / 100, 0)}</td><td>${f(v.h * v.hf / 100, 0)}</td><td>${f(v.h * v.hv / 100, 0)}</td><td>${f(v.h * r.ht / 100, 0)}</td></tr>
    <tr><td><b>Summe GK</b></td><td>0</td><td><b>${f(r.M, 0)}</b></td><td><b>${f(r.F, 0)}</b></td><td><b>${f(r.VW, 0)}</b></td><td><b>${f(r.VT, 0)}</b></td></tr>
    <tr><td>Bezugsgröße</td><td></td><td>FM ${f(v.fmP, 0)}</td><td>FL ${f(v.flP, 0)}</td><td>HK ${f(r.hkP, 0)}</td><td>HK ${f(r.hkP, 0)}</td></tr>
    <tr><td><b>Zuschlag</b></td><td></td><td><b>${pc(z.m * 100, 2)}</b></td><td><b>${pc(z.f * 100, 2)}</b></td><td><b>${pc(z.vw * 100, 2)}</b></td><td><b>${pc(z.vt * 100, 2)}</b></td></tr></table>
    HK der Periode = FM + MGK + FL + FGK = ${f(v.fmP, 0)} + ${f(r.M, 0)} + ${f(v.flP, 0)} + ${f(r.F, 0)} = ${f(r.hkP, 0)}<br>
    <b>Auftrag</b>: Materialkosten = ${f(v.fm, 2)} + ${pc(z.m * 100, 2)} = ${f(r.mk, 2)} · Fertigungskosten = ${f(v.fl, 2)} + ${pc(z.f * 100, 2)} = ${f(r.fk, 2)}<br>
    Herstellkosten = ${f(r.hk, 2)} · + VwGK ${f(r.hk * z.vw, 2)} + VtGK ${f(r.hk * z.vt, 2)} = <b>Selbstkosten ${f(r.sk, 2)}</b> · + Gewinn ${f(v.gew, 0)} % = <b>Nettobarpreis ${f(r.nbp, 2)}</b>`; },
  plot: { bars: v => { const z = C["bwl2-bab"].calc(v).z; return [{ label: "MGK", y: z.m * 100 }, { label: "FGK", y: z.f * 100 }, { label: "VwGK", y: z.vw * 100 }, { label: "VtGK", y: z.vt * 100 }]; }, yfmt: n => f(n, 1) + " %" }
};

/* --- Vollkosten vs. Teilkosten --- */
C["bwl2-vtk"] = {
  title: "Vollkosten-Falle: Produkt streichen oder behalten?",
  intro: "Zwei Produkte, gemeinsame Fixkosten werden nach Stückzahl verteilt. Nach Vollkosten macht B scheinbar Verlust. Der Rechner zeigt, was mit dem Betriebsergebnis passiert, wenn B gestrichen wird und die Fixkosten bleiben.",
  inputs: [
    { k: "pA", label: "A: Preis", v: 300, min: 0, max: 1000, step: 5, unit: "€" },
    { k: "kvA", label: "A: variable Stückkosten", v: 180, min: 0, max: 1000, step: 5, unit: "€" },
    { k: "xA", label: "A: Menge", v: 1000, min: 0, max: 5000, step: 50, unit: "Stk" },
    { k: "pB", label: "B: Preis", v: 250, min: 0, max: 1000, step: 5, unit: "€" },
    { k: "kvB", label: "B: variable Stückkosten", v: 200, min: 0, max: 1000, step: 5, unit: "€" },
    { k: "xB", label: "B: Menge", v: 500, min: 0, max: 5000, step: 50, unit: "Stk" },
    { k: "kf", label: "Fixkosten gesamt", v: 120000, min: 0, max: 500000, step: 5000, unit: "€" }
  ],
  calc: v => { const dbA = (v.pA - v.kvA) * v.xA, dbB = (v.pB - v.kvB) * v.xB, x = v.xA + v.xB, fA = x ? v.kf * v.xA / x : 0, fB = x ? v.kf * v.xB / x : 0; return { dbA, dbB, fA, fB, be: dbA + dbB - v.kf, beOhne: dbA - v.kf }; },
  out: v => { const r = C["bwl2-vtk"].calc(v);
    return [["DB A", r.dbA, "€"], ["DB B", r.dbB, "€"], ["Vollkostenergebnis A", r.dbA - r.fA, "€"], ["Vollkostenergebnis B", r.dbB - r.fB, "€"], ["Betriebsergebnis mit B", r.be, "€", true], ["Betriebsergebnis ohne B", r.beOhne, "€"]]; },
  steps: v => { const r = C["bwl2-vtk"].calc(v);
    return `DB A = (${f(v.pA, 0)} − ${f(v.kvA, 0)}) × ${f(v.xA, 0)} = ${e0(r.dbA)} · DB B = (${f(v.pB, 0)} − ${f(v.kvB, 0)}) × ${f(v.xB, 0)} = ${e0(r.dbB)}<br>
    Fixkosten je Stück = ${e0(v.kf)} / ${f(v.xA + v.xB, 0)} Stk → A trägt ${e0(r.fA)}, B trägt ${e0(r.fB)}<br>
    Vollkosten: A ${e0(r.dbA - r.fA)}, B ${e0(r.dbB - r.fB)} · Betriebsergebnis = ${e0(r.dbA)} + ${e0(r.dbB)} − ${e0(v.kf)} = <b>${e0(r.be)}</b><br>
    Ohne B (Fixkosten nicht abbaubar): ${e0(r.dbA)} − ${e0(v.kf)} = <b>${e0(r.beOhne)}</b> → ${r.dbB > 0 ? `Streichen kostet <b>${e0(r.dbB)}</b> Ergebnis, weil B einen positiven DB liefert.` : "B hat einen negativen DB: Streichen verbessert das Ergebnis."}<br>
    <small>Regel: kurzfristig zählt der Deckungsbeitrag. Nur abbaubare Fixkosten (z. B. eine Spezialmaschine nur für B) dürfen der Entscheidung zugerechnet werden.</small>`; },
  plot: { bars: v => { const r = C["bwl2-vtk"].calc(v); return [{ label: "DB A", y: Math.max(0, r.dbA) }, { label: "DB B", y: Math.max(0, r.dbB) }, { label: "Fixkosten", y: v.kf }, { label: "Summe DB", y: Math.max(0, r.dbA + r.dbB) }]; }, yfmt: n => f(n / 1000, 0) + "k" }
};

/* --- Zusatzauftrag / Preisuntergrenze --- */
C["bwl2-pug"] = {
  title: "Zusatzauftrag: Preisuntergrenze mit und ohne Engpass",
  intro: "Ist die Kapazität frei, reicht ein Preis über den variablen Stückkosten. Verdrängt der Auftrag Standardware, kommt der entgangene Deckungsbeitrag dazu. Der Graph zeigt die Ergebnisänderung je nach angenommener Menge.",
  inputs: [
    { k: "cap", label: "Kapazität", v: 10000, min: 0, max: 50000, step: 100, unit: "Stk" },
    { k: "bel", label: "bereits belegt (Standardware)", v: 8500, min: 0, max: 50000, step: 100, unit: "Stk" },
    { k: "pS", label: "Preis Standardware", v: 40, min: 0, max: 200, step: 0.5, unit: "€" },
    { k: "kv", label: "variable Stückkosten", v: 22, min: 0, max: 200, step: 0.5, unit: "€" },
    { k: "kvoll", label: "volle Stückkosten", v: 34, min: 0, max: 300, step: 0.5, unit: "€" },
    { k: "xa", label: "Anfrage: Menge", v: 3000, min: 1, max: 30000, step: 100, unit: "Stk" },
    { k: "pa", label: "Anfrage: Preis", v: 30, min: 0, max: 200, step: 0.5, unit: "€" }
  ],
  calc: v => { const frei = Math.max(0, v.cap - v.bel), dS = v.pS - v.kv, d = v.pa - v.kv, dG = x => x * d - Math.max(0, x - frei) * dS, verdr = Math.max(0, v.xa - frei);
    return { frei, dS, d, dG, verdr, pug: v.kv + verdr * dS / v.xa, teil: dG(Math.min(v.xa, frei)), voll: dG(v.xa) }; },
  out: v => { const r = C["bwl2-pug"].calc(v), best = r.d <= 0 ? "ablehnen" : r.voll >= r.teil ? "voll annehmen" : "nur freie Kapazität";
    return [["freie Kapazität", r.frei, "Stk"], ["DB je Stück Zusatzauftrag", r.d, "€"], ["Δ Ergebnis nur freie Kapazität", r.teil, "€"], ["Δ Ergebnis volle Annahme", r.voll, "€"], ["PUG ohne Engpass (= kv)", v.kv, "€"], ["PUG bei voller Annahme", r.pug, "€", true], ["langfristige PUG", v.kvoll, "€"], ["Empfehlung (kurzfristig)", best]]; },
  steps: v => { const r = C["bwl2-pug"].calc(v);
    return `freie Kapazität = ${f(v.cap, 0)} − ${f(v.bel, 0)} = ${f(r.frei, 0)} Stk · DB Zusatzauftrag = ${f(v.pa, 2)} − ${f(v.kv, 2)} = <b>${f(r.d, 2)} €</b> · DB Standard = ${f(v.pS, 2)} − ${f(v.kv, 2)} = ${f(r.dS, 2)} €<br>
    Nur freie Kapazität: ${f(Math.min(v.xa, r.frei), 0)} × ${f(r.d, 2)} = <b>${e2(r.teil)}</b><br>
    Volle Annahme: ${f(v.xa, 0)} × ${f(r.d, 2)} − ${f(r.verdr, 0)} verdrängte Stück × ${f(r.dS, 2)} = <b>${e2(r.voll)}</b><br>
    PUG bei voller Annahme = kv + entgangener DB je Auftragsstück = ${f(v.kv, 2)} + ${f(r.verdr, 0)} × ${f(r.dS, 2)} / ${f(v.xa, 0)} = <b>${e2(r.pug)}</b><br>
    <small>Annahme: Zusatzauftrag und Standardware brauchen je Stück gleich viel Kapazität, der Auftrag ist teilbar und gefährdet keine Stammkund:innen (Preisgefüge!).</small>`; },
  plot: { x: v => [0, v.xa], xl: "angenommene Menge (Stk)", yl: "€",
    fns: [{ label: "Δ Ergebnis inkl. Verdrängung", f: (x, v) => C["bwl2-pug"].calc(v).dG(x) }, { label: "DB Zusatzauftrag ohne Verdrängung", f: (x, v) => x * (v.pa - v.kv) }],
    points: v => { const r = C["bwl2-pug"].calc(v); return r.frei > 0 && r.frei < v.xa ? [{ x: r.frei, y: r.dG(r.frei), label: "Kapazität voll" }] : []; } }
};

/* --- Programmplanung mit Engpass --- */
C["bwl2-prog"] = {
  title: "Optimales Produktionsprogramm bei Engpass",
  intro: "Erst die Mindestmengen einplanen, dann die Produkte nach dem relativen DB (DB je Engpassminute) reihen und die restliche Kapazität vergeben. Vorbelegt mit Übung 4, Beispiel 3.",
  inputs: [
    { k: "kf", label: "Fixkosten", v: 20000, min: 0, max: 100000, step: 500, unit: "€" },
    { k: "cap", label: "Engpass-Kapazität", v: 12000, min: 0, max: 50000, step: 100, unit: "min" },
    { k: "p1", label: "A1 Preis", v: 40, min: 0, max: 200, step: 0.5, unit: "€" }, { k: "k1", label: "A1 kv", v: 20, min: 0, max: 200, step: 0.5, unit: "€" }, { k: "t1", label: "A1 Engpasszeit", v: 20, min: 1, max: 60, step: 1, unit: "min" }, { k: "n1", label: "A1 Mindestmenge", v: 120, min: 0, max: 3000, step: 10, unit: "Stk" }, { k: "m1", label: "A1 Höchstmenge", v: 1500, min: 0, max: 5000, step: 10, unit: "Stk" },
    { k: "p2", label: "A2 Preis", v: 35, min: 0, max: 200, step: 0.5, unit: "€" }, { k: "k2", label: "A2 kv", v: 25, min: 0, max: 200, step: 0.5, unit: "€" }, { k: "t2", label: "A2 Engpasszeit", v: 5, min: 1, max: 60, step: 1, unit: "min" }, { k: "n2", label: "A2 Mindestmenge", v: 0, min: 0, max: 3000, step: 10, unit: "Stk" }, { k: "m2", label: "A2 Höchstmenge", v: 1800, min: 0, max: 5000, step: 10, unit: "Stk" },
    { k: "p3", label: "A3 Preis", v: 45, min: 0, max: 200, step: 0.5, unit: "€" }, { k: "k3", label: "A3 kv", v: 28.5, min: 0, max: 200, step: 0.5, unit: "€" }, { k: "t3", label: "A3 Engpasszeit", v: 15, min: 1, max: 60, step: 1, unit: "min" }, { k: "n3", label: "A3 Mindestmenge", v: 0, min: 0, max: 3000, step: 10, unit: "Stk" }, { k: "m3", label: "A3 Höchstmenge", v: 500, min: 0, max: 5000, step: 10, unit: "Stk" }
  ],
  calc: v => { const P = [1, 2, 3].map(i => ({ n: "A" + i, db: v["p" + i] - v["k" + i], t: Math.max(1e-9, v["t" + i]), lo: v["n" + i], hi: Math.max(v["n" + i], v["m" + i]) }));
    P.forEach(p => { p.rel = p.db / p.t; p.q = p.lo; });
    let rest = v.cap - P.reduce((s, p) => s + p.lo * p.t, 0); const ok = rest >= 0; const log = [];
    P.slice().sort((a, b) => b.rel - a.rel).forEach(p => { if (p.db <= 0 || rest <= 0) { log.push(`${p.n}: ${p.db <= 0 ? "DB ≤ 0, nur Mindestmenge" : "keine Kapazität mehr"} → ${f(p.q, 0)} Stk`); return; }
      const add = Math.min(p.hi - p.lo, Math.floor(rest / p.t + 1e-9)); p.q += add; rest -= add * p.t; log.push(`${p.n} (${f(p.rel, 2)} €/min): ${p.lo ? f(p.lo, 0) + " + " : ""}${f(add, 0)} = <b>${f(p.q, 0)} Stk</b>, Rest ${f(rest, 0)} min`); });
    const dbS = P.reduce((s, p) => s + p.q * p.db, 0); return { P, rest, ok, log, dbS, be: dbS - v.kf }; },
  out: v => { const r = C["bwl2-prog"].calc(v), o = r.ok ? [] : [["Achtung", "Mindestmengen sprengen die Kapazität"]];
    return o.concat(r.P.map(p => [p.n + ": Menge (rel. DB " + f(p.rel, 2) + " €/min)", p.q, "Stk"]), [["Gesamt-DB", r.dbS, "€"], ["Betriebsergebnis", r.be, "€", true], ["ungenutzte Minuten", Math.max(0, r.rest), "min"]]); },
  steps: v => { const r = C["bwl2-prog"].calc(v);
    return `1. DB je Stück und relativer DB: ${r.P.map(p => `${p.n}: ${f(p.db, 2)} € / ${f(p.t, 0)} min = <b>${f(p.rel, 2)} €/min</b>`).join(" · ")}<br>
    2. Mindestmengen zuerst: ${r.P.map(p => `${p.n} ${f(p.lo, 0)} × ${f(p.t, 0)}`).join(" + ")} = ${f(r.P.reduce((s, p) => s + p.lo * p.t, 0), 0)} min<br>
    3. Rest nach Rangfolge (höchster relativer DB zuerst):<br>${r.log.join("<br>")}<br>
    4. Gesamt-DB = ${r.P.map(p => `${f(p.q, 0)} × ${f(p.db, 2)}`).join(" + ")} = <b>${e2(r.dbS)}</b>; Betriebsergebnis = ${e2(r.dbS)} − ${e0(v.kf)} = <b>${e2(r.be)}</b><br>
    <small>Nach dem absoluten DB wäre die Reihenfolge eine andere. Bei einem Engpass zählt nur, was eine Engpassminute einbringt.</small>`; },
  plot: { bars: v => C["bwl2-prog"].calc(v).P.map(p => ({ label: p.n + " · €/min", y: Math.max(0, p.rel) })), yfmt: n => f(n, 2) }
};

/* --- Statische Investitionsrechnung mit kritischer Menge --- */
C["bwl2-stat"] = {
  title: "Kosten-, Gewinn-, Rentabilitätsvergleich und Amortisation",
  intro: "Zwei Anlagen im Vergleich. Kalk. Afa = (AK − RW) / ND, kalk. Zinsen = (AK + RW) / 2 × i. Der Graph zeigt beide Kostengeraden; ihr Schnittpunkt ist die kritische Menge.",
  inputs: [
    { k: "akA", label: "A: Anschaffungskosten", v: 40000, min: 0, max: 300000, step: 1000, unit: "€" }, { k: "rwA", label: "A: Restwert", v: 0, min: 0, max: 100000, step: 1000, unit: "€" }, { k: "ndA", label: "A: Nutzungsdauer", v: 4, min: 1, max: 20, step: 1, unit: "J." }, { k: "fixA", label: "A: sonstige Fixkosten", v: 2000, min: 0, max: 50000, step: 500, unit: "€" }, { k: "kvA", label: "A: variable Stückkosten", v: 1.5, min: 0, max: 20, step: 0.05, unit: "€" }, { k: "pA", label: "A: Preis", v: 3, min: 0, max: 30, step: 0.05, unit: "€" },
    { k: "akB", label: "B: Anschaffungskosten", v: 90000, min: 0, max: 300000, step: 1000, unit: "€" }, { k: "rwB", label: "B: Restwert", v: 10000, min: 0, max: 100000, step: 1000, unit: "€" }, { k: "ndB", label: "B: Nutzungsdauer", v: 5, min: 1, max: 20, step: 1, unit: "J." }, { k: "fixB", label: "B: sonstige Fixkosten", v: 3000, min: 0, max: 50000, step: 500, unit: "€" }, { k: "kvB", label: "B: variable Stückkosten", v: 0.8, min: 0, max: 20, step: 0.05, unit: "€" }, { k: "pB", label: "B: Preis", v: 3, min: 0, max: 30, step: 0.05, unit: "€" },
    { k: "i", label: "Kalkulationszinssatz", v: 8, min: 0, max: 20, step: 0.5, unit: "%" },
    { k: "x", label: "Menge pro Jahr", v: 20000, min: 0, max: 100000, step: 500, unit: "Stk" }
  ],
  calc: v => { const m = s => { const afa = (v["ak" + s] - v["rw" + s]) / v["nd" + s], zins = (v["ak" + s] + v["rw" + s]) / 2 * v.i / 100, kf = afa + zins + v["fix" + s], K = kf + v["kv" + s] * v.x, G = v["p" + s] * v.x - K, kb = (v["ak" + s] + v["rw" + s]) / 2;
      return { afa, zins, kf, K, G, kb, rent: (G + zins) / kb * 100, amo: G + afa > 0 ? (v["ak" + s] - v["rw" + s]) / (G + afa) : NaN }; };
    const A = m("A"), B = m("B"), dkv = v.kvA - v.kvB; return { A, B, krit: dkv !== 0 ? (B.kf - A.kf) / dkv : NaN }; },
  out: v => { const r = C["bwl2-stat"].calc(v);
    return [["Fixkosten A | B", e0(r.A.kf) + " | " + e0(r.B.kf)], ["Gesamtkosten bei x: A | B", e0(r.A.K) + " | " + e0(r.B.K)], ["kritische Menge", isFinite(r.krit) && r.krit > 0 ? Math.ceil(r.krit) : "keine", isFinite(r.krit) && r.krit > 0 ? "Stk" : "", true], ["Gewinn A | B", e0(r.A.G) + " | " + e0(r.B.G)], ["Rentabilität A | B", pc(r.A.rent) + " | " + pc(r.B.rent)], ["Amortisation A | B", (isFinite(r.A.amo) ? f(r.A.amo, 2) : "–") + " | " + (isFinite(r.B.amo) ? f(r.B.amo, 2) : "–") + " J."]]; },
  steps: v => { const r = C["bwl2-stat"].calc(v), row = (s, o) => `<b>${s}</b>: Afa = (${f(v["ak" + s], 0)} − ${f(v["rw" + s], 0)}) / ${v["nd" + s]} = ${f(o.afa, 0)} · Zinsen = (${f(v["ak" + s], 0)} + ${f(v["rw" + s], 0)}) / 2 × ${f(v.i, 1)} % = ${f(o.zins, 0)} · K<sub>f</sub> = ${f(o.afa, 0)} + ${f(o.zins, 0)} + ${f(v["fix" + s], 0)} = <b>${f(o.kf, 0)}</b><br>
    &nbsp;&nbsp;K(${f(v.x, 0)}) = ${f(o.kf, 0)} + ${f(v["kv" + s], 2)} × ${f(v.x, 0)} = ${f(o.K, 0)} · G = ${f(v["p" + s], 2)} × ${f(v.x, 0)} − ${f(o.K, 0)} = <b>${f(o.G, 0)}</b><br>
    &nbsp;&nbsp;Rentabilität = (G + Zinsen) / ø KB = (${f(o.G, 0)} + ${f(o.zins, 0)}) / ${f(o.kb, 0)} = <b>${pc(o.rent)}</b> · Amortisation = (AK − RW) / (G + Afa) = ${f(v["ak" + s] - v["rw" + s], 0)} / ${f(o.G + o.afa, 0)} = <b>${isFinite(o.amo) ? f(o.amo, 2) + " J." : "–"}</b>`;
    return `${row("A", r.A)}<br>${row("B", r.B)}<br>Kritische Menge: K<sub>f,A</sub> + k<sub>v,A</sub>·x = K<sub>f,B</sub> + k<sub>v,B</sub>·x → x = (${f(r.B.kf, 0)} − ${f(r.A.kf, 0)}) / (${f(v.kvA, 2)} − ${f(v.kvB, 2)}) = <b>${isFinite(r.krit) ? f(r.krit, 1) : "–"} Stk</b>. ${isFinite(r.krit) && r.krit > 0 ? `Darunter ist die Anlage mit den niedrigeren Fixkosten günstiger, darüber die mit den niedrigeren variablen Kosten.` : ""}`; },
  plot: { x: v => { const r = C["bwl2-stat"].calc(v); return [0, Math.max(1000, Math.ceil(Math.max(v.x, isFinite(r.krit) && r.krit > 0 ? r.krit : 0) * 1.4 / 1000) * 1000)]; }, xl: "Menge (Stk)", yl: "€",
    fns: [{ label: "Kosten A", f: (x, v) => { const r = C["bwl2-stat"].calc(v); return r.A.kf + v.kvA * x; } }, { label: "Kosten B", f: (x, v) => { const r = C["bwl2-stat"].calc(v); return r.B.kf + v.kvB * x; } }],
    points: v => { const r = C["bwl2-stat"].calc(v); return isFinite(r.krit) && r.krit > 0 ? [{ x: r.krit, y: r.A.kf + v.kvA * r.krit, label: "kritische Menge" }] : []; } }
};

/* --- Amortisation (Kumulationsmethode) --- */
C["bwl2-amort"] = {
  title: "Amortisationsdauer: Kumulations- vs. Durchschnittsmethode",
  intro: "Rückfluss = Gewinn + Abschreibung. Der Graph kumuliert die Rückflüsse Jahr für Jahr; wo die Kurve die Anschaffungskosten erreicht, hat sich die Investition amortisiert (innerhalb eines Jahres linear interpoliert). Ohne Restwert.",
  inputs: [
    { k: "ak", label: "Anschaffungskosten", v: 100000, min: 0, max: 500000, step: 1000, unit: "€" },
    { k: "r1", label: "Rückfluss Jahr 1", v: 40000, min: 0, max: 200000, step: 1000, unit: "€" }, { k: "r2", label: "Rückfluss Jahr 2", v: 44000, min: 0, max: 200000, step: 1000, unit: "€" }, { k: "r3", label: "Rückfluss Jahr 3", v: 50000, min: 0, max: 200000, step: 1000, unit: "€" },
    { k: "r4", label: "Rückfluss Jahr 4", v: 50000, min: 0, max: 200000, step: 1000, unit: "€" }, { k: "r5", label: "Rückfluss Jahr 5", v: 60000, min: 0, max: 200000, step: 1000, unit: "€" }, { k: "r6", label: "Rückfluss Jahr 6", v: 0, min: 0, max: 200000, step: 1000, unit: "€" }
  ],
  calc: v => { const R = [1, 2, 3, 4, 5, 6].map(t => v["r" + t]); let n = 0; R.forEach((r, i) => { if (r) n = i + 1; }); n = Math.max(1, n);
    const cum = t => { let s = 0; for (let k = 0; k < R.length; k++) { if (t >= k + 1) s += R[k]; else { s += R[k] * Math.max(0, t - k); break; } } return s; };
    let kum = NaN, s = 0; for (let k = 0; k < n; k++) { if (s + R[k] >= v.ak && R[k] > 0) { kum = k + (v.ak - s) / R[k]; break; } s += R[k]; }
    const avg = R.slice(0, n).reduce((a, b) => a + b, 0) / n; return { R, n, cum, kum, avg, dm: avg > 0 ? v.ak / avg : NaN }; },
  out: v => { const r = C["bwl2-amort"].calc(v);
    return [["Amortisation (Kumulation)", isFinite(r.kum) ? f(r.kum, 2) : "nicht in der ND", isFinite(r.kum) ? "Jahre" : "", true], ["ø Rückfluss", r.avg, "€"], ["Amortisation (Durchschnitt)", isFinite(r.dm) ? f(r.dm, 2) : "–", "Jahre"], ["Rückflüsse nach Amortisation", isFinite(r.kum) ? r.cum(r.n) - v.ak : 0, "€"]]; },
  steps: v => { const r = C["bwl2-amort"].calc(v); let s = 0;
    const rows = r.R.slice(0, r.n).map((x, k) => { s += x; return `Jahr ${k + 1}: + ${f(x, 0)} → kumuliert ${f(s, 0)}${s >= v.ak && s - x < v.ak ? " ← AK erreicht" : ""}`; }).join("<br>");
    return `${rows}<br>${isFinite(r.kum) ? `Kumulation: ${Math.floor(r.kum)} volle Jahre + fehlender Betrag / Rückfluss des Jahres = ${Math.floor(r.kum)} + ${f(v.ak - r.cum(Math.floor(r.kum)), 0)} / ${f(r.R[Math.floor(r.kum)], 0)} = <b>${f(r.kum, 2)} Jahre</b>` : "Die AK werden innerhalb der Nutzungsdauer nicht zurückverdient."}<br>
    Durchschnitt: AK / ø Rückfluss = ${f(v.ak, 0)} / ${f(r.avg, 0)} = <b>${isFinite(r.dm) ? f(r.dm, 2) : "–"} Jahre</b><br>
    <small>Die Methoden weichen ab, wenn die Rückflüsse ungleich verteilt sind. Beide ignorieren den Zeitwert des Geldes und alles nach dem Amortisationszeitpunkt – daher nur Zusatzkriterium (Risiko, Liquidität).</small>`; },
  plot: { x: v => [0, C["bwl2-amort"].calc(v).n], xl: "Jahre", yl: "€", xfmt: n => f(n, 1),
    fns: [{ label: "kumulierte Rückflüsse", f: (x, v) => C["bwl2-amort"].calc(v).cum(x) }, { label: "Anschaffungskosten", f: (x, v) => v.ak }],
    points: v => { const r = C["bwl2-amort"].calc(v); return isFinite(r.kum) ? [{ x: r.kum, y: v.ak, label: "amortisiert" }] : []; } }
};

/* --- Kapitalwert, Kapitalwertkurve, IZF --- */
C["bwl2-kw"] = {
  title: "Kapitalwertkurve: KW, Annuität und interner Zinsfuß",
  intro: "Zahlungen am Periodenende. Die Kurve zeigt den Kapitalwert für jeden Zinssatz – wo sie die Nulllinie schneidet, liegt der interne Zinsfuß. Die gerade Linie ist die Interpolation zwischen zwei Versuchszinssätzen, wie in der Klausur ohne Excel.",
  inputs: [
    { k: "a0", label: "Anschaffungsauszahlung A₀", v: 60000, min: 0, max: 500000, step: 1000, unit: "€" },
    { k: "r1", label: "Überschuss Jahr 1", v: 14000, min: -100000, max: 200000, step: 500, unit: "€" }, { k: "r2", label: "Überschuss Jahr 2", v: 14000, min: -100000, max: 200000, step: 500, unit: "€" }, { k: "r3", label: "Überschuss Jahr 3", v: 14000, min: -100000, max: 200000, step: 500, unit: "€" },
    { k: "r4", label: "Überschuss Jahr 4", v: 14000, min: -100000, max: 200000, step: 500, unit: "€" }, { k: "r5", label: "Überschuss Jahr 5 (inkl. Restwert)", v: 22000, min: -100000, max: 200000, step: 500, unit: "€" }, { k: "r6", label: "Überschuss Jahr 6", v: 0, min: -100000, max: 200000, step: 500, unit: "€" },
    { k: "i", label: "Kalkulationszinssatz", v: 5, min: 0, max: 30, step: 0.25, unit: "%" },
    { k: "i1", label: "Versuchszinssatz i₁", v: 5, min: 0, max: 50, step: 0.5, unit: "%" }, { k: "i2", label: "Versuchszinssatz i₂", v: 10, min: 0, max: 60, step: 0.5, unit: "%" }
  ],
  calc: v => { const cf = [-v.a0, v.r1, v.r2, v.r3, v.r4, v.r5, v.r6]; while (cf.length > 2 && !cf[cf.length - 1]) cf.pop();
    const n = cf.length - 1, kw = npv(cf, v.i / 100), k1 = npv(cf, v.i1 / 100), k2 = npv(cf, v.i2 / 100), r = irr(cf);
    return { cf, n, kw, ann: kw * kwf(v.i / 100, n), k1, k2, r: r * 100, ip: k2 !== k1 ? v.i1 - k1 * (v.i2 - v.i1) / (k2 - k1) : NaN }; },
  out: v => { const r = C["bwl2-kw"].calc(v);
    return [["Kapitalwert", r.kw, "€", true], ["Annuität", r.ann, "€ / Jahr"], ["KW bei i₁", r.k1, "€"], ["KW bei i₂", r.k2, "€"], ["IZF interpoliert", isFinite(r.ip) ? pc(r.ip, 2) : "–"], ["IZF exakt", isFinite(r.r) ? pc(r.r, 2) : "–"], ["Entscheidung", r.kw > 0 ? "absolut vorteilhaft" : r.kw < 0 ? "nicht vorteilhaft" : "indifferent"]]; },
  steps: v => { const r = C["bwl2-kw"].calc(v), q = 1 + v.i / 100;
    return `KW = Σ (E<sub>t</sub> − A<sub>t</sub>) · (1+i)<sup>−t</sup> − A₀ bei i = ${pc(v.i, 2)}:<br>${r.cf.map((c, t) => t ? `t=${t}: ${f(c, 0)} × ${f(q, 4)}<sup>−${t}</sup> = ${f(c / Math.pow(q, t), 2)}` : "").filter(Boolean).join("<br>")}<br>
    Summe Barwerte ${f(r.kw + v.a0, 2)} − A₀ ${f(v.a0, 0)} = <b>KW ${e2(r.kw)}</b><br>
    Annuität = KW × i / (1 − (1+i)<sup>−n</sup>) = ${f(r.kw, 2)} × ${f(kwf(v.i / 100, r.n), 6)} = <b>${e2(r.ann)}</b> (n = ${r.n})<br>
    Interpolation: r = i₁ − KW₁ · (i₂ − i₁) / (KW₂ − KW₁) = ${f(v.i1, 2)} − ${f(r.k1, 2)} × (${f(v.i2, 2)} − ${f(v.i1, 2)}) / (${f(r.k2, 2)} − ${f(r.k1, 2)}) = <b>${isFinite(r.ip) ? pc(r.ip, 2) : "–"}</b><br>
    Exakt (wie Excel-Zielwertsuche bzw. =IKV()): <b>${isFinite(r.r) ? pc(r.r, 2) : "–"}</b>. ${r.k1 * r.k2 < 0 ? "Die Interpolation überschätzt den IZF leicht, weil die Kapitalwertkurve konvex ist." : "Tipp: Wähle i₁ und i₂ so, dass ein KW positiv und einer negativ ist."}`; },
  plot: { x: v => { const r = C["bwl2-kw"].calc(v); return [0, Math.min(100, Math.max(20, v.i2 * 1.2, isFinite(r.r) ? Math.ceil(r.r * 1.6) : 20))]; }, xl: "Zinssatz (%)", yl: "KW (€)", xfmt: n => f(n, 0) + " %",
    fns: [{ label: "Kapitalwertkurve KW(i)", f: (x, v) => npv(C["bwl2-kw"].calc(v).cf, x / 100) }, { label: "Interpolationsgerade (i₁, i₂)", f: (x, v) => { const r = C["bwl2-kw"].calc(v); return v.i2 !== v.i1 ? r.k1 + (r.k2 - r.k1) * (x - v.i1) / (v.i2 - v.i1) : NaN; } }],
    points: v => { const r = C["bwl2-kw"].calc(v), pts = [{ x: v.i, y: r.kw, label: "KW bei i" }]; if (isFinite(r.r) && r.r >= 0) pts.push({ x: r.r, y: 0, label: "IZF" }); return pts; } }
};

/* --- Zeitwert des Geldes --- */
C["bwl2-tvm"] = {
  title: "Zeitwert des Geldes: Auf- und Abzinsen, Rentenbarwert, Annuität",
  intro: "Endwert EW = K · (1+i)ⁿ, Barwert BW = K · (1+i)⁻ⁿ, Rentenbarwertfaktor RBF = (1 − (1+i)⁻ⁿ) / i und sein Kehrwert, der Kapitalwiedergewinnungsfaktor KWF.",
  inputs: [
    { k: "K", label: "Betrag K", v: 10000, min: 0, max: 200000, step: 500, unit: "€" },
    { k: "R", label: "jährliche Zahlung R (Rente)", v: 2000, min: 0, max: 50000, step: 100, unit: "€" },
    { k: "i", label: "Zinssatz i", v: 5, min: 0, max: 20, step: 0.25, unit: "%" },
    { k: "n", label: "Laufzeit n", v: 5, min: 1, max: 40, step: 1, unit: "J." }
  ],
  out: v => { const i = v.i / 100, q = Math.pow(1 + i, v.n);
    return [["Endwert von K", v.K * q, "€", true], ["Barwert von K (fällig in n)", v.K / q, "€"], ["Rentenbarwertfaktor", f(rbf(i, v.n), 6)], ["Barwert der Rente R", v.R * rbf(i, v.n), "€"], ["KWF", f(kwf(i, v.n), 6)], ["Annuität aus K", v.K * kwf(i, v.n), "€ / Jahr"]]; },
  steps: v => { const i = v.i / 100, q = 1 + i;
    return `EW = ${f(v.K, 0)} × ${f(q, 4)}<sup>${v.n}</sup> = ${f(v.K, 0)} × ${f(Math.pow(q, v.n), 6)} = <b>${e2(v.K * Math.pow(q, v.n))}</b><br>
    BW = ${f(v.K, 0)} × ${f(q, 4)}<sup>−${v.n}</sup> = ${f(v.K, 0)} × ${f(Math.pow(q, -v.n), 6)} = <b>${e2(v.K / Math.pow(q, v.n))}</b><br>
    RBF = (1 − ${f(q, 4)}<sup>−${v.n}</sup>) / ${f(i, 4)} = <b>${f(rbf(i, v.n), 6)}</b> → Barwert der Rente = ${f(v.R, 0)} × ${f(rbf(i, v.n), 6)} = <b>${e2(v.R * rbf(i, v.n))}</b><br>
    KWF = 1 / RBF = ${f(kwf(i, v.n), 6)} → Annuität = ${f(v.K, 0)} × ${f(kwf(i, v.n), 6)} = <b>${e2(v.K * kwf(i, v.n))}</b> (verteilt K samt Zinsen gleichmäßig auf ${v.n} Jahre)`; },
  plot: { x: v => [0, v.n], xl: "Jahre", yl: "€", xfmt: n => f(n, 0),
    fns: [{ label: "Endwert K·(1+i)ᵗ", f: (x, v) => v.K * Math.pow(1 + v.i / 100, x) }, { label: "Barwert K·(1+i)⁻ᵗ", f: (x, v) => v.K * Math.pow(1 + v.i / 100, -x) }] }
};

/* --- Kredit: Annuitäten- vs. Ratentilgung --- */
C["bwl2-kredit"] = {
  title: "Kredit: Annuitätendarlehen vs. Ratentilgung",
  intro: "Beim Annuitätendarlehen bleibt die Rate gleich (Zinsanteil sinkt, Tilgung steigt), bei Ratentilgung bleibt die Tilgung gleich und die Rate sinkt. Der Graph zeigt die Restschuld.",
  inputs: [
    { k: "K", label: "Kreditbetrag", v: 20000, min: 1000, max: 500000, step: 1000, unit: "€" },
    { k: "i", label: "Zinssatz p. a.", v: 6, min: 0, max: 15, step: 0.25, unit: "%" },
    { k: "n", label: "Laufzeit", v: 5, min: 1, max: 30, step: 1, unit: "J." }
  ],
  out: v => { const i = v.i / 100, A = v.K * kwf(i, v.n);
    return [["Annuität (Rate) pro Jahr", A, "€", true], ["Jahr 1: Zinsen | Tilgung", e2(v.K * i) + " | " + e2(A - v.K * i)], ["Gesamtzinsen Annuität", A * v.n - v.K, "€"], ["Ratentilgung: 1. Rate", v.K / v.n + v.K * i, "€"], ["Gesamtzinsen Ratentilgung", v.K * i * (v.n + 1) / 2, "€"]]; },
  steps: v => { const i = v.i / 100, A = v.K * kwf(i, v.n); let R = v.K; const rows = [];
    for (let t = 1; t <= Math.min(v.n, 8); t++) { const z = R * i, tg = A - z; R -= tg; rows.push(`<tr><td>${t}</td><td>${f(z, 2)}</td><td>${f(tg, 2)}</td><td>${f(A, 2)}</td><td>${f(Math.max(0, R), 2)}</td></tr>`); }
    return `Annuität = K × KWF = ${f(v.K, 0)} × ${f(i, 4)} / (1 − ${f(1 + i, 4)}<sup>−${v.n}</sup>) = <b>${e2(A)}</b><br>
    <table class="dt"><tr><th>Jahr</th><th>Zinsen</th><th>Tilgung</th><th>Rate</th><th>Restschuld</th></tr>${rows.join("")}</table>${v.n > 8 ? "<small>(erste 8 Jahre)</small><br>" : ""}
    Ratentilgung: Tilgung = ${f(v.K, 0)} / ${v.n} = ${f(v.K / v.n, 2)}; 1. Rate = ${f(v.K / v.n, 2)} + ${f(v.K * i, 2)} Zinsen = ${e2(v.K / v.n + v.K * i)}`; },
  plot: { x: v => [0, v.n], xl: "Jahre", yl: "Restschuld €", xfmt: n => f(n, 0),
    fns: [{ label: "Restschuld Annuitätendarlehen", f: (t, v) => { const i = v.i / 100, q = Math.pow(1 + i, t), A = v.K * kwf(i, v.n); return i ? Math.max(0, v.K * q - A * (q - 1) / i) : v.K * (1 - t / v.n); } }, { label: "Restschuld Ratentilgung", f: (t, v) => v.K * (1 - t / v.n) }] }
};

/* --- Lieferantenkredit / Skonto --- */
C["bwl2-skonto"] = {
  title: "Lieferantenkredit: Was kostet es, Skonto nicht zu ziehen?",
  intro: "Effektiver Jahreszins ≈ Skontosatz / (100 − Skontosatz) × 360 / (Zahlungsziel − Skontofrist). Liegt er über dem Kontokorrentzins, lohnt es sich, den Kontokorrent zu überziehen und Skonto zu ziehen.",
  inputs: [
    { k: "R", label: "Rechnungsbetrag", v: 15000, min: 0, max: 200000, step: 500, unit: "€" },
    { k: "s", label: "Skontosatz", v: 3, min: 0.5, max: 10, step: 0.5, unit: "%" },
    { k: "sf", label: "Skontofrist", v: 14, min: 0, max: 60, step: 1, unit: "Tage" },
    { k: "z", label: "Zahlungsziel", v: 45, min: 1, max: 120, step: 1, unit: "Tage" },
    { k: "kk", label: "Kontokorrentzins p. a.", v: 9, min: 0, max: 20, step: 0.25, unit: "%" }
  ],
  eff: (v, d) => d > 0 ? v.s / (100 - v.s) * 360 / d * 100 : NaN,
  out: v => { const d = v.z - v.sf, sk = v.R * v.s / 100, ue = v.R - sk, zk = ue * v.kk / 100 * Math.max(0, d) / 360, eff = C["bwl2-skonto"].eff(v, d);
    return [["Skontobetrag", sk, "€"], ["Überweisung mit Skonto", ue, "€"], ["Effektiver Jahreszins Lieferantenkredit", isFinite(eff) ? eff : "–", "%", true], ["Kontokorrentzinsen für " + Math.max(0, d) + " Tage", zk, "€"], ["Ersparnis durch Skontoziehung", sk - zk, "€"]]; },
  steps: v => { const d = v.z - v.sf, sk = v.R * v.s / 100, ue = v.R - sk, zk = ue * v.kk / 100 * Math.max(0, d) / 360;
    return `Kreditdauer = Zahlungsziel − Skontofrist = ${v.z} − ${v.sf} = ${d} Tage<br>
    Effektivzins ≈ ${f(v.s, 1)} / (100 − ${f(v.s, 1)}) × 360 / ${d} = <b>${d > 0 ? pc(C["bwl2-skonto"].eff(v, d), 2) : "–"}</b><br>
    Skonto = ${f(v.R, 0)} × ${f(v.s, 1)} % = ${e2(sk)} → Überweisung ${e2(ue)}<br>
    Kontokorrent für ${d} Tage: ${f(ue, 2)} × ${f(v.kk, 2)} % × ${d} / 360 = ${e2(zk)} → Ersparnis = ${e2(sk)} − ${e2(zk)} = <b>${e2(sk - zk)}</b><br>
    <small>Warum 100 − Skontosatz im Nenner? Der „Kredit“ beträgt nur den Überweisungsbetrag (Rechnung minus Skonto), nicht den Rechnungsbetrag.</small>`; },
  plot: { x: [5, 90], xl: "Kreditdauer (Tage)", yl: "% p. a.", xfmt: n => f(n, 0), yfmt: n => f(n, 0) + " %",
    fns: [{ label: "Effektivzins Lieferantenkredit", f: (d, v) => C["bwl2-skonto"].eff(v, d) }, { label: "Kontokorrentzins", f: (d, v) => v.kk }],
    points: v => { const d = v.z - v.sf; return d >= 5 && d <= 90 ? [{ x: d, y: C["bwl2-skonto"].eff(v, d), label: "dein Fall" }] : []; } }
};

/* --- URG --- */
C["bwl2-urg"] = {
  title: "URG-Check: Eigenmittelquote und fiktive Schuldentilgungsdauer",
  intro: "Reorganisationsbedarf wird vermutet, wenn die Eigenmittelquote unter 8 % <b>und</b> die fiktive Schuldentilgungsdauer über 15 Jahren liegt.",
  inputs: [
    { k: "em", label: "Eigenmittel", v: 70000, min: -500000, max: 2000000, step: 5000, unit: "€" },
    { k: "gk", label: "Gesamtkapital", v: 1000000, min: 1, max: 5000000, step: 10000, unit: "€" },
    { k: "rst", label: "Rückstellungen", v: 100000, min: 0, max: 2000000, step: 5000, unit: "€" },
    { k: "verb", label: "Verbindlichkeiten", v: 900000, min: 0, max: 5000000, step: 10000, unit: "€" },
    { k: "fl", label: "flüssige Mittel", v: 50000, min: 0, max: 2000000, step: 5000, unit: "€" },
    { k: "wp", label: "wie flüssige Mittel verwertbare WP", v: 50000, min: 0, max: 2000000, step: 5000, unit: "€" },
    { k: "mue", label: "Mittelüberschuss gew. Geschäftstätigkeit", v: 50000, min: -500000, max: 2000000, step: 5000, unit: "€" }
  ],
  out: v => { const emq = v.em / v.gk * 100, sch = v.rst + v.verb - v.fl - v.wp, sdt = v.mue > 0 ? sch / v.mue : Infinity, verm = emq < 8 && sdt > 15;
    return [["Eigenmittelquote", emq, "%"], ["Schulden netto", sch, "€"], ["fiktive Schuldentilgungsdauer", isFinite(sdt) ? f(sdt, 1) : "unendlich (MÜ ≤ 0)", isFinite(sdt) ? "Jahre" : ""], ["Reorganisationsbedarf vermutet?", verm ? "Ja" : "Nein", "", true]]; },
  steps: v => { const emq = v.em / v.gk * 100, sch = v.rst + v.verb - v.fl - v.wp, sdt = v.mue > 0 ? sch / v.mue : Infinity;
    return `EMQ = Eigenmittel / Gesamtkapital × 100 = ${f(v.em, 0)} / ${f(v.gk, 0)} × 100 = <b>${pc(emq)}</b> ${emq < 8 ? "(&lt; 8 % ✓)" : "(≥ 8 %)"}<br>
    fiktive SDT = (Rückstellungen + Verbindlichkeiten − flüssige Mittel − WP) / Mittelüberschuss = (${f(v.rst, 0)} + ${f(v.verb, 0)} − ${f(v.fl, 0)} − ${f(v.wp, 0)}) / ${f(v.mue, 0)} = <b>${isFinite(sdt) ? f(sdt, 1) + " Jahre" : "unendlich"}</b> ${sdt > 15 ? "(&gt; 15 J. ✓)" : "(≤ 15 J.)"}<br>
    Vermutung nur, wenn <b>beide</b> Bedingungen erfüllt sind → <b>${emq < 8 && sdt > 15 ? "Reorganisationsbedarf wird vermutet" : "keine Vermutung"}</b>`; }
};

/* --- Anschaffungskosten und AfA --- */
C["bwl2-afa"] = {
  title: "Anschaffungskosten, Halbjahres-AfA und Buchwertverlauf",
  intro: "AK = Listenpreis − Rabatt − Skonto + Nebenkosten (ohne Vorsteuer). Inbetriebnahme im 1. Halbjahr: volle Jahres-AfA, im 2. Halbjahr: halbe Jahres-AfA.",
  inputs: [
    { k: "lp", label: "Listenpreis netto", v: 24000, min: 0, max: 500000, step: 500, unit: "€" },
    { k: "rab", label: "Rabatt", v: 5, min: 0, max: 50, step: 0.5, unit: "%" },
    { k: "sko", label: "Skonto (gezogen)", v: 2, min: 0, max: 10, step: 0.5, unit: "%" },
    { k: "nk", label: "Nebenkosten (Transport, Montage)", v: 1000, min: 0, max: 50000, step: 100, unit: "€" },
    { k: "nd", label: "Nutzungsdauer", v: 8, min: 1, max: 30, step: 1, unit: "J." },
    { k: "mon", label: "Monat der Inbetriebnahme", v: 10, min: 1, max: 12, step: 1, unit: "" }
  ],
  calc: v => { const nr = v.lp * (1 - v.rab / 100), ak = nr * (1 - v.sko / 100) + v.nk, ja = ak / v.nd, a1 = v.mon <= 6 ? ja : ja / 2; return { nr, ak, ja, a1, bw: t => t <= 1 ? ak - a1 * t : Math.max(0, ak - a1 - ja * (t - 1)) }; },
  out: v => { const r = C["bwl2-afa"].calc(v);
    return [["Anschaffungskosten", r.ak, "€", true], ["Jahres-AfA", r.ja, "€"], ["AfA im 1. Jahr", r.a1, "€"], ["Buchwert Ende Jahr 1", r.ak - r.a1, "€"], ["letzte AfA im Jahr", v.mon <= 6 ? v.nd : v.nd + 1, ""]]; },
  steps: v => { const r = C["bwl2-afa"].calc(v);
    return `${f(v.lp, 2)} − ${f(v.rab, 1)} % Rabatt = ${f(r.nr, 2)}; − ${f(v.sko, 1)} % Skonto = ${f(r.nr * (1 - v.sko / 100), 2)}; + Nebenkosten ${f(v.nk, 2)} = <b>AK ${e2(r.ak)}</b><br>
    Jahres-AfA = ${f(r.ak, 2)} / ${v.nd} = ${f(r.ja, 2)} · Inbetriebnahme im Monat ${v.mon} → ${v.mon <= 6 ? "1. Halbjahr: volle Jahres-AfA" : "2. Halbjahr: halbe Jahres-AfA"} = <b>${e2(r.a1)}</b><br>
    Buchwert 31.12. des 1. Jahres = ${f(r.ak, 2)} − ${f(r.a1, 2)} = <b>${e2(r.ak - r.a1)}</b><br><small>Die USt ist abziehbare Vorsteuer und gehört nicht zu den AK.</small>`; },
  plot: { x: v => [0, v.mon <= 6 ? v.nd : v.nd + 1], xl: "Jahre ab Inbetriebnahme", yl: "€", xfmt: n => f(n, 0),
    fns: [{ label: "Buchwert", f: (t, v) => C["bwl2-afa"].calc(v).bw(t) }] }
};

/* ======================= Animationen ======================= */
if (FX) {
const { svg, g, t, tl, r, box, l } = FX;

FIG["bwl2-fig-luecke"] = { title: "Finanzierungslücke: wer finanziert die Zeit zwischen Einkauf und Kundenzahlung?",
  svg: () => { const X = d => 50 + d * 4.9;
    return svg(640, 280,
      l(40, 200, 620, 200, { arrow: true }) + [0, 30, 45, 60, 73, 90, 103, 115].map(d => l(X(d), 196, X(d), 204) + t(X(d), 220, d, { fs: 10.5, cls: "fx-sub" })).join("") + t(620, 240, "Tage", { a: "end", fs: 10.5, cls: "fx-sub" }) +
      g({ st: 0 }, r(X(0) - 4, 34, 8, 166, { rx: 3, cls: "fx-mute" }) + t(X(0) + 8, 28, "Wareneinkauf", { a: "start", fs: 11.5, fw: 600 })) +
      g({ st: 1 }, r(X(0), 60, X(73) - X(0), 30, { cls: "fx-info" }) + t((X(0) + X(73)) / 2, 80, "Lagerdauer 73 Tage", { fs: 12, fw: 600 }) + t(X(73) + 6, 66, "Verkauf", { a: "start", fs: 11, cls: "fx-sub" })) +
      g({ st: 2 }, r(X(73), 100, X(103) - X(73), 30, { cls: "fx-vio" }) + tl((X(73) + X(103)) / 2, 119, "Kundenziel 30 T.", { fs: 11.5, fw: 600 }) + t(X(103) + 6, 104, "Kunde zahlt", { a: "start", fs: 11, cls: "fx-sub" })) +
      g({ st: 3 }, r(X(0), 140, X(45) - X(0), 30, { cls: "fx-ok" }) + t((X(0) + X(45)) / 2, 160, "Lieferantenziel 45 T.", { fs: 11.5, fw: 600 }) + t(X(45) + 6, 186, "wir zahlen den Lieferanten", { a: "start", fs: 10.5, cls: "fx-sub" })) +
      g({ st: 4 }, r(X(45), 140, X(103) - X(45), 30, { cls: "fx-bad" }) + t((X(45) + X(103)) / 2, 160, "Lücke 58 Tage", { fs: 12, fw: 700 }) + l(X(45), 200, X(103), 200, { cls: "bad" })));
  },
  steps: [
    "Am Tag 0 kauft das Unternehmen Ware ein. Ab jetzt läuft die Uhr.",
    "Die Ware liegt im Schnitt <b>73 Tage</b> im Lager (Lagerdauer = 365 / Lagerumschlagshäufigkeit).",
    "Nach dem Verkauf zahlen die Kund:innen im Schnitt nach <b>30 Tagen</b> (Debitorenumschlagsdauer). Erst am Tag 103 ist das Geld da.",
    "Die Lieferanten geben uns <b>45 Tage</b> Zahlungsziel (Kreditorenumschlagsdauer). Bis dahin finanzieren sie uns.",
    "Zwischen Tag 45 und Tag 103 ist die Ware bezahlt, das Geld aber noch nicht zurück: <b>Finanzierungslücke = 73 + 30 − 45 = 58 Tage</b>. Diese Zeit muss z. B. ein Kontokorrentkredit überbrücken. Hebel: Lager abbauen, Kundenziel kürzen, Lieferantenziel verlängern."
  ] };

FIG["bwl2-fig-kfr"] = { title: "Kapitalflussrechnung: drei Bereiche, eine Veränderung der liquiden Mittel",
  svg: () => svg(640, 290,
    g({ st: 0 }, box(20, 30, 180, 70, "Operativ|+ 220", { cls: "fx-ok", sub: "aus dem Umsatzprozess" })) +
    g({ st: 1 }, box(230, 30, 180, 70, "Investition|− 110", { cls: "fx-bad", sub: "Kauf/Verkauf von AV" })) +
    g({ st: 2 }, box(440, 30, 180, 70, "Finanzierung|− 100", { cls: "fx-bad", sub: "Tilgung, Ausschüttung" })) +
    g({ st: 3 }, l(110, 102, 290, 160, { arrow: true, acc: true, cls: "acc" }) + l(320, 102, 320, 158, { arrow: true, acc: true, cls: "acc" }) + l(530, 102, 350, 160, { arrow: true, acc: true, cls: "acc" }) + box(230, 162, 180, 48, "Δ liquide Mittel = + 10", { cls: "fx-acc" })) +
    g({ st: 4 }, box(20, 228, 180, 44, "Anfangsbestand 50", { cls: "fx-soft" }) + t(215, 255, "+ 10", { fs: 14, fw: 700 }) + l(232, 250, 432, 250, { arrow: true }) + box(440, 228, 180, 44, "Endbestand 60", { cls: "fx-soft" }))),
  steps: [
    "<b>Operativer Cash-Flow</b> (indirekt): Jahresüberschuss 120 + Afa 80 + Rückstellungsdotierung 15 − Buchgewinn 10 = 205, dann Working Capital: Vorräte +30 (−), Forderungen −20 (+), Verbindlichkeiten LL +25 (+) → <b>+220</b>.",
    "<b>Investitionsbereich</b>: neue Maschine −150, Erlös aus Anlagenverkauf +40 → <b>−110</b>. Das Unternehmen investiert aus eigener Kraft.",
    "<b>Finanzierungsbereich</b>: Kredittilgung −60, Gewinnausschüttung −40 → <b>−100</b>.",
    "Die Summe aller drei Bereiche ist die <b>Veränderung der liquiden Mittel</b>: 220 − 110 − 100 = <b>+10</b>.",
    "Probe mit der Bilanz: liquide Mittel steigen von 50 auf 60. Gewinn (120) ≠ Cash-Flow (220) ≠ Zunahme der liquiden Mittel (10)."
  ] };

FIG["bwl2-fig-kore"] = { title: "Die vier Stufen der Kostenrechnung",
  svg: () => { const xs = [14, 170, 326, 482], W = 144;
    const top = [["BÜB", "Aufwand → Kosten"], ["Kostenarten", "Welche Kosten?"], ["Kostenstellen", "Wo angefallen?"], ["Kostenträger", "Wofür angefallen?"]];
    const ex = ["− Spende|+ kalk. Unternehmerlohn|kalk. statt bilanzielle Afa", "Material, Löhne|Afa, Miete|Einzel- vs. Gemeinkosten", "BAB: GK auf Material,|Fertigung, Verwaltung,|Vertrieb verteilen", "Zuschlagskalkulation:|Selbstkosten je Stück|bzw. je Auftrag"];
    return svg(640, 270, top.map(([a, b], i) => g({ st: i }, box(xs[i], 40, W, 62, a, { cls: i === 3 ? "fx-acc" : "fx-soft", fs: 14, sub: b }) + r(xs[i], 122, W, 92, { cls: "fx-card" }) + tl(xs[i] + W / 2, 170, ex[i], { fs: 10.5, lh: 16 }) +
      (i < 3 ? l(xs[i] + W + 2, 71, xs[i + 1] - 2, 71, { arrow: true, acc: true, cls: "acc" }) : ""))).join("") +
      g({ st: 4 }, r(14, 228, 612, 32, { cls: "fx-ok" }) + t(320, 249, "Ergebnis: Stückkosten als Basis für Preise, Preisuntergrenzen und Programmentscheidungen", { fs: 11.5, fw: 600 })));
  },
  steps: [
    "<b>BÜB</b> (Betriebsüberleitungsbogen): Aus dem Aufwand der FIBU werden Kosten. Neutraler Aufwand (Spende) fliegt raus, Zusatzkosten (kalk. Unternehmerlohn) kommen dazu, Anderskosten (kalk. Afa) ersetzen den bilanziellen Wert.",
    "<b>Kostenartenrechnung</b>: Welche Kosten sind angefallen? Trennung in Einzelkosten (direkt dem Produkt zurechenbar) und Gemeinkosten.",
    "<b>Kostenstellenrechnung</b>: Wo sind die Gemeinkosten angefallen? Im BAB werden sie verteilt, Hilfsstellen umgelegt und Zuschlagssätze gebildet.",
    "<b>Kostenträgerrechnung</b>: Wofür? Einzelkosten + Gemeinkostenzuschläge ergeben die Selbstkosten je Stück oder Auftrag.",
    "Damit lassen sich Angebotspreise, Preisuntergrenzen und das Produktionsprogramm begründen."
  ] };

FIG["bwl2-fig-kalk"] = { title: "Zuschlagskalkulation Schritt für Schritt (Auftrag: FM 2.000, FL 800)",
  svg: () => { const s = 0.074, X0 = 150, bar = (y, segs, total, lab, o) => g(o, t(16, y + 19, lab, { a: "start", fs: 12, fw: 600 }) +
      segs.reduce((acc, [w, cls, txt]) => { const x = X0 + acc.x * s; acc.h += r(x, y, w * s, 28, { rx: 4, cls }) + (w * s > 50 ? t(x + w * s / 2, y + 18.5, txt, { fs: 11 }) : ""); acc.x += w; return acc; }, { x: 0, h: "" }).h +
      t(X0 + total * s + 8, y + 19, f(total, 2), { a: "start", fs: 12, fw: 700 }));
    return svg(640, 280,
      bar(14, [[2000, "fx-info", "FM 2.000"], [200, "fx-warn", ""]], 2200, "Materialkosten", { st: 0 }) +
      bar(56, [[800, "fx-info", "FL 800"], [960, "fx-warn", "FGK 960"]], 1760, "Fertigungskosten", { st: 1 }) +
      bar(98, [[2200, "fx-soft", "MK 2.200"], [1760, "fx-soft", "FK 1.760"]], 3960, "Herstellkosten", { st: 2 }) +
      bar(140, [[3960, "fx-soft", "HK 3.960"], [396, "fx-warn", ""], [198, "fx-warn", ""]], 4554, "Selbstkosten", { st: 3 }) +
      bar(182, [[4554, "fx-soft", "SK 4.554"], [455.4, "fx-ok", ""]], 5009.4, "Nettobarpreis", { st: 4 }) +
      g({ st: 5 }, r(16, 226, 608, 44, { cls: "fx-card" }) + tl(320, 252, "+ 2 % Skonto i. H. → Nettozielpreis 5.111,63 · + 10 % Rabatt i. H. → 5.679,59|+ 20 % USt → Bruttoverkaufspreis 6.815,51", { fs: 11.5, lh: 16 })));
  },
  steps: [
    "<b>Materialkosten</b> = Fertigungsmaterial 2.000 + 10 % MGK (200) = <b>2.200</b>.",
    "<b>Fertigungskosten</b> = Fertigungslöhne 800 + 120 % FGK (960) = <b>1.760</b>. Der hohe Zuschlag ist typisch für maschinenintensive Fertigung.",
    "<b>Herstellkosten</b> = Materialkosten + Fertigungskosten = <b>3.960</b>.",
    "<b>Selbstkosten</b> = HK + 10 % Verwaltung (396) + 5 % Vertrieb (198) = <b>4.554</b>. Beide Zuschläge beziehen sich auf die Herstellkosten.",
    "+ 10 % Gewinnzuschlag (455,40) = <b>Nettobarpreis 5.009,40</b>.",
    "Skonto und Rabatt werden <b>im Hundert</b> aufgeschlagen (÷ 0,98 bzw. ÷ 0,90), damit nach dem Abzug genau der Nettobarpreis bleibt. Zum Schluss kommt die USt dazu."
  ] };

FIG["bwl2-fig-kw"] = { title: "Kapitalwert: alle Zahlungen auf den Zeitpunkt 0 abzinsen (i = 5 %)",
  svg: () => { const X = k => 70 + k * 108, pay = [-60000, 14000, 14000, 14000, 14000, 22000], bw = pay.map((p, k) => p / Math.pow(1.05, k));
    return svg(640, 290,
      l(30, 112, 630, 112, { arrow: true }) + pay.map((_, k) => l(X(k), 106, X(k), 118) + t(X(k), 132, "t = " + k, { fs: 11, cls: "fx-sub" })).join("") +
      g({ st: 0 }, pay.map((p, k) => box(X(k) - 48, 50, 96, 40, f(p, 0), { cls: k ? "fx-ok" : "fx-bad", fs: 12.5 })).join("") + t(30, 40, "Zahlungsreihe", { a: "start", fs: 11.5, cls: "fx-sub" })) +
      g({ st: 1 }, l(X(1), 140, X(1), 176, { arrow: true, acc: true, cls: "acc" }) + t(X(1) + 6, 162, "÷ 1,05¹", { a: "start", fs: 10.5 }) + box(X(1) - 48, 180, 96, 34, f(bw[1], 2), { cls: "fx-soft", fs: 12 })) +
      g({ st: 2 }, [2, 3, 4, 5].map(k => l(X(k), 140, X(k), 176, { arrow: true, acc: true, cls: "acc" }) + t(X(k) + 6, 162, "÷ 1,05" + "⁰¹²³⁴⁵"[k], { a: "start", fs: 10.5 }) + box(X(k) - 48, 180, 96, 34, f(bw[k], 2), { cls: "fx-soft", fs: 12 })).join("") +
        box(X(0) - 48, 180, 96, 34, "−60.000,00", { cls: "fx-bad", fs: 12 })) +
      g({ st: 3 }, r(20, 232, 600, 46, { cls: "fx-acc" }) + tl(320, 258, "Σ Barwerte 66.880,88 − 60.000 = KW 6.880,88 € &gt; 0|→ Kapital zurück + 5 % Zinsen + 6.880,88 € Überschuss", { fs: 12, lh: 16, cls: "fx-onacc", fw: 600 })));
  },
  steps: [
    "Die Zahlungsreihe einer PV-Anlage: −60.000 in t = 0, dann 14.000 pro Jahr, im Jahr 5 zusätzlich 8.000 Restwert. Zahlungen fallen am Periodenende an.",
    "Ein Euro in einem Jahr ist heute weniger wert: 14.000 / 1,05 = <b>13.333,33</b>.",
    "Jede Zahlung wird mit (1 + i)<sup>−t</sup> abgezinst. Je später die Zahlung, desto stärker schrumpft sie.",
    "Die Summe der Barwerte minus der Anschaffungsauszahlung ergibt den <b>Kapitalwert 6.880,88 €</b>. KW &gt; 0: absolut vorteilhaft. Annuität = 6.880,88 × KWF(5 %, 5) = <b>1.589,31 € pro Jahr</b>."
  ] };
}

/* ======================= Inhalte: Beispiele, Checks, Fragen ======================= */
const EX = (title, html, label = "Beispiel durchgerechnet") => ({ t: "example", label, title, html });
const CK = (q, opts, a, why) => ({ t: "check", q, opts, a, why });

const blocks = {
  "b1-1": [
    EX("Ein Monat in der Tischlerei Kainz: welches Begriffspaar ist betroffen?", `<table class="dt"><tr><th>Geschäftsfall</th><th>Ein-/Auszahlung</th><th>Einnahme/Ausgabe</th><th>Ertrag/Aufwand</th><th>Leistung/Kosten</th></tr>
<tr><td>Holz um 12.000 € auf Ziel gekauft (auf Lager)</td><td>–</td><td>Ausgabe 12.000</td><td>– (erst bei Verbrauch)</td><td>–</td></tr>
<tr><td>Diese Rechnung 30 Tage später überwiesen</td><td>Auszahlung 12.000</td><td>– (Bank ↓, Verbindlichkeit ↓)</td><td>–</td><td>–</td></tr>
<tr><td>Abschreibung der CNC-Fräse 3.000 €</td><td>–</td><td>–</td><td>Aufwand 3.000</td><td>Kosten (ggf. kalk. anders bewertet)</td></tr>
<tr><td>Kalkulatorischer Unternehmerlohn 4.000 €</td><td>–</td><td>–</td><td>–</td><td>Zusatzkosten 4.000</td></tr>
<tr><td>Spende an den Sportverein 500 € (Überweisung)</td><td>Auszahlung 500</td><td>Ausgabe 500</td><td>Aufwand 500</td><td>– (neutraler Aufwand)</td></tr>
<tr><td>Kundenanzahlung 2.000 € aufs Konto</td><td>Einzahlung 2.000</td><td>– (Verbindlichkeit „erhaltene Anzahlung“ ↑)</td><td>–</td><td>–</td></tr></table>
<p>Merke: Die Zahlung einer Rechnung ist eine Auszahlung, aber keine Ausgabe – die Ausgabe ist schon beim Kauf auf Ziel entstanden. Und weder der Kauf noch die Zahlung ist Aufwand, solange das Holz im Lager liegt.</p>`),
    CK("Eine Kundin leistet eine Anzahlung von € 5.000 aufs Bankkonto. Was liegt vor?", ["Einzahlung und Ertrag", "Einzahlung, aber keine Einnahme", "Einnahme, aber keine Einzahlung", "Ertrag, aber keine Einzahlung"], 1, "Bank +5.000, aber auch eine Verbindlichkeit (erhaltene Anzahlung) +5.000 – das Geldvermögen bleibt gleich. Ertrag entsteht erst mit der Lieferung.")
  ],
  "b1-2": [
    EX("Vier Geschäftsfälle: Gewinn ≠ Geld", `<p>Eröffnungsbilanz (ohne USt): AV 50.000, Vorräte 10.000, Bank 15.000 | EK 40.000, Bankkredit 25.000, Verbindlichkeiten LL 10.000 (Summe 75.000).</p>
<table class="dt"><tr><th>Fall</th><th>Bilanz</th><th>GuV</th><th>Bank</th></tr>
<tr><td>a) Ware (Buchwert 6.000) um 9.000 auf Ziel verkauft</td><td>Vorräte −6.000, Forderungen +9.000</td><td>Umsatz +9.000, Wareneinsatz −6.000</td><td>0</td></tr>
<tr><td>b) Kredit 5.000 getilgt</td><td>Bank −5.000, Kredit −5.000</td><td>–</td><td>−5.000</td></tr>
<tr><td>c) Abschreibung AV 4.000</td><td>AV −4.000</td><td>Aufwand −4.000</td><td>0</td></tr>
<tr><td>d) Kreditzinsen 1.000 überwiesen</td><td>Bank −1.000</td><td>Aufwand −1.000</td><td>−1.000</td></tr></table>
<ol><li>Jahresergebnis = 9.000 − 6.000 − 4.000 − 1.000 = <b>−2.000 €</b> → EK 38.000.</li>
<li>Schlussbilanz: AV 46.000 + Vorräte 4.000 + Forderungen 9.000 + Bank 9.000 = <b>68.000</b> = EK 38.000 + Kredit 20.000 + Verbindlichkeiten 10.000 ✓</li>
<li>Die Bank sinkt um 6.000, das Ergebnis nur um 2.000: Der Verkauf brachte Gewinn, aber noch kein Geld; die Tilgung kostete Geld, aber keinen Gewinn.</li></ol>`),
    CK("Tilgung eines Bankkredits über € 10.000 per Überweisung. Was passiert mit der Bilanzsumme?", ["steigt um 10.000", "bleibt gleich (Aktivtausch)", "sinkt um 10.000 (Aktiv-Passiv-Minderung)", "bleibt gleich (Passivtausch)"], 2, "Bank (Aktiva) und Kredit (Passiva) sinken gleichzeitig. Die GuV ist nicht berührt.")
  ],
  "b2-1": [
    { t: "calc", id: "bwl2-umschlag" },
    EX("Elektrohandel Huber GmbH: Vermögenslage in Zahlen (TEUR)", `<p>AV 1.200, Gesamtvermögen 3.000, Vorräte 900, ø Vorräte 840, Materialeinsatz 4.200, Umsatz netto 6.000 (20 % USt), ø Forderungen LL 600, kumulierte Afa SAV 1.800 auf historische AK 3.000.</p>
<ol><li>Anlageintensität = 1.200 / 3.000 = <b>40 %</b>; Lagerintensität = 900 / 3.000 = <b>30 %</b></li>
<li>Anlagenabnutzungsgrad = 1.800 / 3.000 = <b>60 %</b> → die Anlagen sind schon deutlich gealtert, Reinvestitionen stehen an.</li>
<li>LUH = 4.200 / 840 = 5 → Lagerdauer = 365 / 5 = <b>73 Tage</b></li>
<li>DUH = (6.000 × 1,2) / 600 = 12 → Debitorenumschlagsdauer = 365 / 12 = <b>30,4 Tage</b></li></ol>
<p>Falle: Ohne USt im Zähler käme 6.000 / 600 = 10 → 36,5 Tage heraus – das Kundenziel würde um 6 Tage zu lang ausgewiesen.</p>`),
    CK("Materialeinsatz 1.825.000 €, ø Vorräte 182.500 €. Lagerdauer?", ["10 Tage", "36,5 Tage", "182,5 Tage", "3,65 Tage"], 1, "LUH = 1.825.000 / 182.500 = 10 → 365 / 10 = 36,5 Tage.")
  ],
  "b2-2": [
    { t: "calc", id: "bwl2-kennz" },
    { t: "fig", id: "bwl2-fig-luecke" },
    EX("Huber GmbH: Finanzlage beurteilen (TEUR)", `<p>Bilanz: AV 1.200, Vorräte 900, Forderungen + WP 700, Zahlungsmittel 200 | EK 900, langfristiges FK 800, kurzfristiges FK 1.300 (Summe 3.000).</p>
<table class="dt"><tr><th>Kennzahl</th><th>Rechnung</th><th>Ergebnis</th></tr>
<tr><td>EK-Quote</td><td>900 / 3.000</td><td>30,0 %</td></tr>
<tr><td>Deckungsgrad A</td><td>900 / 1.200</td><td>75,0 %</td></tr>
<tr><td>Deckungsgrad B</td><td>(900 + 800) / 1.200</td><td>141,7 %</td></tr>
<tr><td>Liquidität 1. Grades</td><td>200 / 1.300</td><td>15,4 %</td></tr>
<tr><td>Liquidität 2. Grades</td><td>(200 + 700) / 1.300</td><td>69,2 %</td></tr>
<tr><td>Liquidität 3. Grades</td><td>1.800 / 1.300</td><td>138,5 %</td></tr></table>
<p><b>Interpretation:</b> Das AV ist fristenkongruent finanziert (DG B &gt; 100 %). Kurzfristig wird es aber eng: Die Quick Ratio liegt unter 100 %, die Current Ratio weit unter der Banker's Rule (200 %). Mit Lagerdauer 73 + Kundenziel 30 − Lieferantenziel 45 entsteht eine Finanzierungslücke von <b>≈ 58 Tagen</b>.</p>`),
    CK("Kurzfristiges UV 300, kurzfristiges FK 200 (Liq. 3 = 150 %). Ein kurzfristiger Kredit über 100 wird aufgenommen und bleibt auf dem Konto. Liquidität 3. Grades danach?", ["steigt", "bleibt bei 150 %", "sinkt auf rund 133 %", "steigt auf 200 %"], 2, "400 / 300 = 133 %. Steigen Zähler und Nenner um denselben Betrag, nähert sich ein Wert über 100 % der 100-%-Marke.")
  ],
  "b2-3": [
    { t: "calc", id: "bwl2-cf" },
    { t: "fig", id: "bwl2-fig-kfr" },
    EX("Möbelhaus Lindner: Kapitalflussrechnung (TEUR)", `<table class="dt"><tr><td>Jahresüberschuss</td><td>120</td></tr><tr><td>+ Abschreibungen</td><td>80</td></tr><tr><td>+ Dotierung Abfertigungsrückstellung</td><td>15</td></tr><tr><td>− Gewinn aus Anlagenabgang</td><td>−10</td></tr>
<tr><td><b>= Cash-Flow aus dem Ergebnis</b></td><td><b>205</b></td></tr><tr><td>− Erhöhung Vorräte</td><td>−30</td></tr><tr><td>+ Senkung Forderungen LL</td><td>+20</td></tr><tr><td>+ Erhöhung Verbindlichkeiten LL</td><td>+25</td></tr>
<tr><td><b>= Cash-Flow operativ</b></td><td><b>220</b></td></tr><tr><td>Investition: Maschine −150, Verkaufserlös Altanlage +40</td><td>−110</td></tr><tr><td>Finanzierung: Tilgung −60, Ausschüttung −40</td><td>−100</td></tr>
<tr><td><b>= Veränderung liquide Mittel</b></td><td><b>+10</b></td></tr></table>
<p>Der Buchgewinn von 10 wird oben abgezogen, weil der gesamte Verkaufserlös (40) im Investitionsbereich steht – sonst wäre er doppelt gezählt.</p>
<p>Schuldentilgungsdauer: Effektivverschuldung = FK 900 − liquide Mittel 60 = 840 → 840 / 205 = <b>4,1 Jahre</b>.</p>`),
    CK("Vorräte steigen um 40, Verbindlichkeiten LL steigen um 25. Wirkung auf den operativen Cash-Flow?", ["+65", "−15", "+15", "−65"], 1, "Mehr Vorräte binden Geld (−40), mehr Lieferantenschulden halten Geld im Unternehmen (+25): −15.")
  ],
  "b2-4": [
    { t: "calc", id: "bwl2-leverage" },
    EX("Leverage: derselbe Betrieb, zwei Finanzierungen", `<p>Gesamtkapital 1.000 TEUR, Ergebnis vor Zinsen 100 (ROA 10 %), FK-Zins 6 %.</p>
<table class="dt"><tr><th></th><th>EK 400 / FK 600</th><th>EK 200 / FK 800</th></tr>
<tr><td>FK-Zinsen</td><td>36</td><td>48</td></tr><tr><td>Ergebnis vor Steuern</td><td>64</td><td>52</td></tr>
<tr><td>ROE</td><td><b>16 %</b> = 10 + (10 − 6) × 1,5</td><td><b>26 %</b> = 10 + (10 − 6) × 4</td></tr>
<tr><td>schwaches Jahr: ROA 4 % (EBIT 40)</td><td>40 − 36 = 4 → <b>1 %</b></td><td>40 − 48 = −8 → <b>−4 %</b></td></tr></table>
<p>Mehr Fremdkapital hebt die EK-Rentabilität nur, solange ROA &gt; FK-Zins. Fällt die ROA unter den Zins, verstärkt der Hebel den Verlust – das ist das Leverage-Risiko.</p>`),
    CK("ROA 12 %, FK-Zins 5 %, FK/EK = 2. EK-Rentabilität?", ["19 %", "24 %", "26 %", "14 %"], 2, "12 + (12 − 5) × 2 = 26 %.")
  ],
  "b3-1": [
    { t: "fig", id: "bwl2-fig-kore" },
    EX("Bäckerei Gruber: vom Aufwand zu den Kosten", `<table class="dt"><tr><th>Position</th><th>Aufwand (FIBU)</th><th>Kosten (KORE)</th><th>Art</th></tr>
<tr><td>Mehl, Butter, Zucker</td><td>90.000</td><td>90.000</td><td>Grundkosten</td></tr>
<tr><td>Abschreibung Backofen (AK-Basis / Wiederbeschaffungswert)</td><td>20.000</td><td>26.000</td><td>Anderskosten</td></tr>
<tr><td>Kalkulatorischer Unternehmerlohn</td><td>–</td><td>48.000</td><td>Zusatzkosten</td></tr>
<tr><td>Spende an die Feuerwehr</td><td>1.000</td><td>–</td><td>neutraler Aufwand</td></tr>
<tr><td><b>Summe</b></td><td><b>111.000</b></td><td><b>164.000</b></td><td></td></tr></table>
<p>Fix/variabel: Fixkosten 60.000 €/Jahr, variable Kosten 0,40 € je Brot. Bei 200.000 Broten: K = 60.000 + 0,40 × 200.000 = 140.000 → <b>0,70 €/Stk</b>. Bei 300.000 Broten: K = 180.000 → <b>0,60 €/Stk</b>. Die Gesamtkosten steigen, die Stückkosten sinken (Fixkostendegression).</p>`),
    CK("Fixkosten 24.000 €, kv 6 €. Stückkosten bei 6.000 Stück?", ["6 €", "12 €", "10 €", "4 €"], 2, "24.000 / 6.000 + 6 = 10 €. Bei 4.000 Stück wären es 12 € – Fixkostendegression.")
  ],
  "b3-2": [
    { t: "calc", id: "bwl2-bab" },
    { t: "fig", id: "bwl2-fig-kalk" },
    EX("Metallbau Strobl: vom BAB zum Angebotspreis", `<p>Primäre Gemeinkosten: Fuhrpark (Hilfsstelle) 10.000, Material 13.000, Fertigung 57.000, Verwaltung 26.500, Vertrieb 9.750. Der Fuhrpark leistet 20 % für Material, 30 % für Fertigung, 10 % für Verwaltung, 40 % für Vertrieb. Periode: FM 150.000, FL 50.000.</p>
<ol><li>Umlage Fuhrpark: 2.000 / 3.000 / 1.000 / 4.000 → GK: Material 15.000, Fertigung 60.000, Verwaltung 27.500, Vertrieb 13.750</li>
<li>MGK = 15.000 / 150.000 = <b>10 %</b>; FGK = 60.000 / 50.000 = <b>120 %</b></li>
<li>HK der Periode = 150.000 + 15.000 + 50.000 + 60.000 = 275.000 → VwGK = 27.500 / 275.000 = <b>10 %</b>, VtGK = 13.750 / 275.000 = <b>5 %</b></li>
<li>Auftrag (FM 2.000, FL 800): MK 2.200 + FK 1.760 = HK 3.960; + 15 % VwVt = SK <b>4.554</b>; + 10 % Gewinn = NBP <b>5.009,40</b></li>
<li>2 % Skonto i. H.: 5.009,40 / 0,98 = 5.111,63; 10 % Rabatt i. H.: / 0,90 = 5.679,59; + 20 % USt = <b>6.815,51 €</b></li></ol>`),
    CK("NBP 4.900 €, 2 % Skonto werden im Hundert aufgeschlagen. Nettozielpreis?", ["4.998 €", "5.000 €", "4.802 €", "5.100 €"], 1, "4.900 / 0,98 = 5.000. Nach Abzug von 2 % (100) bleiben genau 4.900. 4.900 × 1,02 = 4.998 wäre „vom Hundert“ und zu wenig.")
  ],
  "b3-3": [
    { t: "calc", id: "bwl2-vtk" },
    EX("Sporthandel Alpin: Snowboards streichen?", `<p>Ski: 1.000 Stk, p 300, kv 180. Snowboards: 500 Stk, p 250, kv 200. Fixkosten 120.000, nach Stück verteilt (80 €/Stk).</p>
<table class="dt"><tr><th></th><th>Ski</th><th>Snowboard</th><th>Summe</th></tr>
<tr><td>Deckungsbeitrag</td><td>120.000</td><td>25.000</td><td>145.000</td></tr>
<tr><td>anteilige Fixkosten</td><td>80.000</td><td>40.000</td><td>120.000</td></tr>
<tr><td>Vollkostenergebnis</td><td>40.000</td><td><b>−15.000</b></td><td>25.000</td></tr></table>
<p>Streicht man die Snowboards, bleiben die 120.000 Fixkosten (Miete, Personal) bestehen: Ergebnis = 120.000 − 120.000 = <b>0</b>. Das Ergebnis sinkt um genau den DB der Snowboards (25.000). Kurzfristig zählt der Deckungsbeitrag, nicht das Vollkostenergebnis.</p>`),
    CK("Produkt A: p 50, kv 35, 2.000 Stk; Produkt B: p 20, kv 12, 5.000 Stk; Fixkosten 60.000 €. Betriebsergebnis?", ["70.000 €", "−10.000 €", "10.000 €", "130.000 €"], 2, "DB A 30.000 + DB B 40.000 = 70.000 − 60.000 = 10.000 €.")
  ],
  "b3-4": [
    { t: "calc", id: "bwl-bep" },
    { t: "calc", id: "bwl2-pug" },
    { t: "calc", id: "bwl2-prog" },
    EX("Kunststoffwerk Leitner: Zusatzauftrag bei fast voller Kapazität", `<p>Kapazität 10.000 Stk/Monat, belegt 8.500 Stk Standardware (p 40, kv 22, volle Kosten 34). Anfrage: 3.000 Stk zu 30 €.</p>
<ol><li>Freie Kapazität = 1.500 Stk; DB Zusatzauftrag = 30 − 22 = 8 €/Stk; DB Standard = 18 €/Stk</li>
<li>Nur freie Kapazität: 1.500 × 8 = <b>+12.000 €</b></li>
<li>Volle Annahme: 3.000 × 8 − 1.500 × 18 = 24.000 − 27.000 = <b>−3.000 €</b></li>
<li>PUG bei voller Annahme = 22 + 1.500 × 18 / 3.000 = <b>31 €</b> &gt; 30 € → so nicht annehmen. Angebot: 1.500 Stk zu 30 € oder alle 3.000 Stk zu mindestens 31 €.</li></ol>
<p>Die vollen Kosten (34 €) sind nur die langfristige PUG – kurzfristig sind die Fixkosten ohnehin da.</p>`),
    EX("Lackiererei: Programm nach relativem DB", `<p>Engpass Lackierstraße: 6.000 min/Monat, Fixkosten 10.000 €.</p>
<table class="dt"><tr><th>Produkt</th><th>DB/Stk</th><th>min/Stk</th><th>rel. DB</th><th>max. Absatz</th><th>Rang</th></tr>
<tr><td>P1</td><td>24</td><td>8</td><td>3,00</td><td>400</td><td>2</td></tr><tr><td>P2</td><td>15</td><td>3</td><td>5,00</td><td>600</td><td>1</td></tr><tr><td>P3</td><td>30</td><td>12</td><td>2,50</td><td>300</td><td>3</td></tr></table>
<ol><li>P2: 600 × 3 = 1.800 min → Rest 4.200</li><li>P1: 400 × 8 = 3.200 min → Rest 1.000</li><li>P3: 1.000 / 12 = 83 Stk (996 min)</li>
<li>DB = 600 × 15 + 400 × 24 + 83 × 30 = <b>21.090 €</b> → Betriebsergebnis <b>11.090 €</b></li></ol>
<p>Nach absolutem DB (P3 zuerst) käme man nur auf 16.200 € DB – 4.890 € weniger.</p>`),
    CK("Voll ausgelastete Maschine. Ein Zusatzauftrag (kv 22 €/Stk) würde Standardware mit DB 18 €/Stk eins zu eins verdrängen. Kurzfristige Preisuntergrenze je Stück?", ["22 €", "18 €", "40 €", "34 €"], 2, "PUG = kv + entgangener DB = 22 + 18 = 40 €."),
    CK("Fixkosten 50.000 €, DB je Stück 25 €, Zielgewinn 20.000 €. Benötigte Menge?", ["2.000 Stk", "2.800 Stk", "800 Stk", "3.000 Stk"], 1, "(50.000 + 20.000) / 25 = 2.800 Stück.")
  ],
  "b4-1": [
    { t: "calc", id: "bwl2-stat" },
    { t: "calc", id: "bwl2-amort" },
    EX("Druckerei: Digitaldruckmaschine A oder B?", `<p>A: AK 40.000, RW 0, ND 4, sonstige Fixkosten 2.000, kv 1,50. B: AK 90.000, RW 10.000, ND 5, sonstige Fixkosten 3.000, kv 0,80. i = 8 %, Preis 3 €, Absatz 20.000 Stk.</p>
<table class="dt"><tr><th></th><th>A</th><th>B</th></tr>
<tr><td>kalk. Afa</td><td>40.000 / 4 = 10.000</td><td>80.000 / 5 = 16.000</td></tr>
<tr><td>kalk. Zinsen</td><td>40.000 / 2 × 8 % = 1.600</td><td>100.000 / 2 × 8 % = 4.000</td></tr>
<tr><td>Fixkosten gesamt</td><td>13.600</td><td>23.000</td></tr>
<tr><td>Kosten bei 20.000 Stk</td><td>43.600</td><td>39.000</td></tr>
<tr><td>Gewinn</td><td>16.400</td><td>21.000</td></tr>
<tr><td>Rentabilität (G + Z) / ø KB</td><td>18.000 / 20.000 = 90 %</td><td>25.000 / 50.000 = 50 %</td></tr>
<tr><td>Amortisation (AK − RW) / (G + Afa)</td><td>40.000 / 26.400 = 1,52 J.</td><td>80.000 / 37.000 = 2,16 J.</td></tr></table>
<p>Kritische Menge = (23.000 − 13.600) / (1,50 − 0,80) = <b>13.428,6 → ab 13.429 Stk</b> ist B kostengünstiger. Die Verfahren widersprechen sich: B bringt mehr absoluten Gewinn, A verzinst das eingesetzte Kapital besser und amortisiert sich schneller. Welche Zielgröße zählt, muss vorher festgelegt werden.</p>`),
    CK("AK 90.000 €, RW 10.000 €, ø Gewinn 6.000 €, kalk. Zinsen 4.000 €. Statische Rentabilität?", ["12 %", "11,1 %", "20 %", "8 %"], 2, "ø Kapitalbindung = (90.000 + 10.000) / 2 = 50.000 → (6.000 + 4.000) / 50.000 = 20 %.")
  ],
  "b4-2": [
    { t: "fig", id: "bwl2-fig-kw" },
    { t: "calc", id: "bwl2-kw" },
    { t: "calc", id: "bwl2-tvm" },
    EX("PV-Anlage am Hallendach: KW, Annuität, IZF", `<p>A₀ = 60.000, jährlich 14.000 Einsparung, nach 5 Jahren Restwert 8.000, i = 5 %.</p>
<ol><li>KW = 14.000 × RBF(5 %, 5) + 8.000 × 1,05⁻⁵ − 60.000 = 14.000 × 4,329477 + 8.000 × 0,783526 − 60.000 = 60.612,68 + 6.268,21 − 60.000 = <b>6.880,88 €</b></li>
<li>Annuität = 6.880,88 × KWF(5 %, 5) = 6.880,88 × 0,230975 = <b>1.589,31 €/Jahr</b></li>
<li>KW bei 10 % = 14.000 × 3,790787 + 8.000 × 0,620921 − 60.000 = <b>−1.961,61 €</b></li>
<li>IZF interpoliert = 5 % − 6.880,88 × (10 % − 5 %) / (−1.961,61 − 6.880,88) = <b>8,89 %</b>; exakt (Excel =IKV) 8,79 %</li></ol>
<p>KW &gt; 0, Annuität &gt; 0 und IZF &gt; Kalkulationszins: Alle drei Methoden sagen dasselbe – absolut vorteilhaft.</p>`),
    CK("KW(5 %) = 3.000 €, KW(10 %) = −1.000 €. Interpolierter interner Zinsfuß?", ["7,5 %", "8,75 %", "6,25 %", "9,25 %"], 1, "5 % − 3.000 × 5 % / (−1.000 − 3.000) = 5 % + 3,75 % = 8,75 %.")
  ],
  "b5-1": [
    { t: "calc", id: "bwl2-skonto" },
    { t: "calc", id: "bwl2-kredit" },
    EX("Skonto ziehen mit dem Kontokorrent?", `<p>Rechnung 15.000 €, „3 % Skonto bei Zahlung binnen 14 Tagen, netto 45 Tage“. Kontokorrentzins 9 % p. a.</p>
<ol><li>Skonto = 450 € → Überweisung 14.550 €; Kreditdauer = 45 − 14 = 31 Tage</li>
<li>Effektivzins ≈ 3 / 97 × 360 / 31 = <b>35,9 % p. a.</b></li>
<li>Kontokorrent für 31 Tage: 14.550 × 9 % × 31 / 360 = 112,76 €</li>
<li>Ersparnis durch Skontoziehung = 450 − 112,76 = <b>337,24 €</b></li></ol>`),
    EX("Annuitätendarlehen über 20.000 € (6 %, 5 Jahre)", `<p>Rate = 20.000 × 0,06 / (1 − 1,06⁻⁵) = <b>4.747,93 €</b> pro Jahr.</p>
<table class="dt"><tr><th>Jahr</th><th>Zinsen</th><th>Tilgung</th><th>Restschuld</th></tr>
<tr><td>1</td><td>1.200,00</td><td>3.547,93</td><td>16.452,07</td></tr><tr><td>2</td><td>987,12</td><td>3.760,81</td><td>12.691,26</td></tr><tr><td>3</td><td>761,48</td><td>3.986,45</td><td>8.704,81</td></tr>
<tr><td>4</td><td>522,29</td><td>4.225,64</td><td>4.479,17</td></tr><tr><td>5</td><td>268,75</td><td>4.479,18</td><td>0</td></tr></table>
<p>Gesamtzinsen 3.739,64 €. Bei Ratentilgung (4.000 € Tilgung + Zinsen) sinkt die Rate von 5.200 auf 4.240 €, die Gesamtzinsen betragen nur 3.600 €, weil schneller getilgt wird – dafür ist die Belastung am Anfang höher.</p>`),
    CK("„2 % Skonto innerhalb 10 Tagen, netto 40 Tage“. Effektiver Jahreszins (Näherung, 360 Tage)?", ["≈ 36,7 %", "≈ 24,5 %", "2 %", "≈ 18 %"], 1, "2 / 98 × 360 / 30 = 24,5 %. 36,7 % gilt für ein Zahlungsziel von 30 Tagen.")
  ],
  "b5-2": [
    { t: "tip", title: "Excel in der Klausur: die drei wichtigsten Funktionen", html: "<ul><li><b>Kapitalwert</b>: <code>=NBW(i; B2:B6) + B1</code> – NBW zinst ab t = 1 ab, die Anschaffungsauszahlung (negativ in B1) wird separat addiert.</li><li><b>Interner Zinsfuß</b>: <code>=IKV(B1:B6)</code> oder Zielwertsuche (Daten → Was-wäre-wenn-Analyse → Zielwertsuche: KW-Zelle auf 0, veränderbare Zelle = Zinssatz).</li><li><b>Annuität / Kreditrate</b>: <code>=RMZ(i; n; −KW)</code> liefert KW × KWF.</li></ul>Probe vor der Klausur mit einem Beispiel, dessen Lösung du kennst (z. B. Beispiel 4: KW bei 10 % = 97.236,71)." }
  ],
  "bx-1": [
    EX("Betriebsvermögensvergleich beim e.U.", `<p>Eigenkapital 1.1.: 60.000 €, 31.12.: 72.000 €. Der Inhaber entnimmt monatlich 2.000 € (24.000 €) und legt im Juni 5.000 € aus seiner Erbschaft ein.</p>
<p>Gewinn = EK Ende − EK Anfang + Entnahmen − Einlagen = 72.000 − 60.000 + 24.000 − 5.000 = <b>31.000 €</b>.</p>
<p>Logik: Entnahmen haben das EK verringert, ohne Verlust zu sein → wieder dazurechnen. Einlagen haben es erhöht, ohne Gewinn zu sein → abziehen.</p>`),
    CK("Rückstellung 5.000 € für einen Prozess gebildet. Im Folgejahr endet der Prozess mit einem Vergleich über 3.000 €. Ergebniswirkung im Folgejahr?", ["−3.000 €", "+2.000 € (Ertrag aus der Auflösung des Rests)", "0", "−5.000 €"], 1, "3.000 werden aus der Rückstellung bezahlt, die restlichen 2.000 werden ertragswirksam aufgelöst.")
  ],
  "bx-2": [
    { t: "calc", id: "bwl2-urg" },
    EX("URG-Check einer Baufirma", `<p>Eigenmittel 70.000, Gesamtkapital 1.000.000, Rückstellungen 100.000, Verbindlichkeiten 900.000, flüssige Mittel 50.000, Wertpapiere 50.000, Mittelüberschuss aus der gewöhnlichen Geschäftstätigkeit 50.000 €.</p>
<ol><li>EMQ = 70.000 / 1.000.000 = <b>7 %</b> → unter 8 %</li><li>fiktive SDT = (100.000 + 900.000 − 50.000 − 50.000) / 50.000 = <b>18 Jahre</b> → über 15</li>
<li>Beide Bedingungen erfüllt → <b>Reorganisationsbedarf wird vermutet</b>. Die Geschäftsführung muss ein Reorganisationsverfahren einleiten oder ein Gutachten einholen, sonst droht Haftung.</li></ol>
<p>Variante: Steigt der Mittelüberschuss auf 70.000, sinkt die SDT auf 12,9 Jahre – trotz EMQ 7 % keine Vermutung.</p>`)
  ],
  "bx-3": [
    { t: "calc", id: "bwl2-afa" },
    EX("Lieferwagen: AK und AfA im ersten Jahr", `<p>Listenpreis 30.000 € netto, 8 % Rabatt, 2 % Skonto gezogen, Überstellung 600 €, Folierung mit Firmenlogo 900 € (alle netto). Inbetriebnahme 4. August, ND 6 Jahre.</p>
<ol><li>30.000 − 2.400 = 27.600; − 2 % Skonto (552) = 27.048; + 600 + 900 = <b>AK 28.548 €</b></li>
<li>Jahres-AfA = 28.548 / 6 = 4.758 €; Inbetriebnahme im 2. Halbjahr → <b>2.379 €</b></li>
<li>Buchwert 31.12. = 28.548 − 2.379 = <b>26.169 €</b>; im 7. Jahr fällt die zweite Halbjahres-AfA an.</li></ol>`),
    CK("Kaufpreis 20.000 € netto, 10 % Rabatt, 2 % Skonto gezogen, Montage 500 €. Anschaffungskosten?", ["18.500 €", "18.140 €", "17.640 €", "21.768 €"], 1, "20.000 − 2.000 = 18.000; − 360 Skonto = 17.640; + 500 = 18.140 €. USt ist Vorsteuer.")
  ]
};

/* Fragen: richtige Antwort zuerst notiert, die Position wird gleichmäßig verteilt */
let qn = 0;
const Q = (topic, q, opts, why) => { const k = (qn * 7 + 3) % opts.length, a = (opts.length - k) % opts.length; qn++;
  return { id: "px-bwl2-" + qn, topic, q, opts: opts.slice(k).concat(opts.slice(0, k)), a, why, ex: "" }; };

const questions = [
  // b-rw
  Q("b-rw", "Kauf eines Lkw um € 60.000 auf Ziel. Was ändert sich sofort?", ["Ausgabe (Geldvermögen sinkt)", "Auszahlung", "Aufwand", "Kosten"], "Verbindlichkeit entsteht → Ausgabe. Gezahlt wird später, Aufwand entsteht erst über die Abschreibung."),
  Q("b-rw", "Ein Unternehmen spendet € 2.000 per Überweisung an einen Sportverein. Einordnung?", ["Auszahlung und Aufwand, aber keine Kosten (neutraler Aufwand)", "Auszahlung, Aufwand und Kosten", "Kosten, aber kein Aufwand", "nur Auszahlung"], "Betriebsfremder Aufwand ist neutral und kommt nicht in die KORE."),
  Q("b-rw", "Kalkulatorische Zinsen auf das Eigenkapital sind …", ["Zusatzkosten", "Grundkosten", "Anderskosten", "neutraler Aufwand"], "In der FIBU gibt es keinen Aufwand für EK-Zinsen – reine Zusatzkosten (Opportunitätskosten)."),
  Q("b-rw", "Bilanzielle Afa € 8.000, kalkulatorische Afa (Wiederbeschaffungswert) € 10.000. Was gilt?", ["Die Kosten liegen um € 2.000 über dem Aufwand (Anderskosten)", "Der Aufwand ist höher als die Kosten", "Beide sind gleich", "Die Kosten betragen € 18.000"], "Gleicher Sachverhalt, anders bewertet → Anderskosten."),
  Q("b-rw", "Welches Rechenwerk gehört zum internen Rechnungswesen?", ["Kostenrechnung", "Bilanz nach UGB", "Steuerbilanz", "Einnahmen-Ausgaben-Rechnung"], "Kosten-, Investitions- und Finanzierungsrechnung sind intern und nicht gesetzlich vorgeschrieben."),
  // b-ja
  Q("b-ja", "Barverkauf von Waren um € 3.000, Einstandswert € 2.000. Wirkung auf das Jahresergebnis?", ["+1.000", "+3.000", "0", "−2.000"], "Umsatzerlös 3.000 − Wareneinsatz 2.000."),
  Q("b-ja", "Kauf einer Maschine gegen Banküberweisung ist ein …", ["Aktivtausch", "Passivtausch", "Aktiv-Passiv-Mehrung", "Aktiv-Passiv-Minderung"], "AV ↑, Bank ↓ – beide auf der Aktivseite."),
  Q("b-ja", "Eine Lieferverbindlichkeit wird in ein langfristiges Darlehen umgewandelt. Das ist ein …", ["Passivtausch", "Aktivtausch", "Aktiv-Passiv-Minderung", "Ertrag"], "Nur die Passivseite ändert sich, die Bilanzsumme bleibt gleich."),
  Q("b-ja", "Die GuV ist …", ["zeitraumbezogen und zeigt Erträge und Aufwendungen", "stichtagsbezogen", "Teil des internen Rechnungswesens", "nur für Einzelunternehmen vorgeschrieben"], "Bilanz = Stichtag, GuV = Periode (Ertragslage)."),
  Q("b-ja", "Abschreibung € 4.000 und Kredittilgung € 5.000 im selben Jahr. Gesamtwirkung auf das Ergebnis?", ["−4.000", "−9.000", "−5.000", "0"], "Nur die Abschreibung ist Aufwand; die Tilgung ist eine reine Auszahlung."),
  // b-verm
  Q("b-verm", "AV 2.400, Gesamtvermögen 6.000. Anlageintensität?", ["40 %", "60 %", "25 %", "250 %"], "2.400 / 6.000."),
  Q("b-verm", "Kumulierte Afa SAV 3.600, historische AK SAV 4.800. Anlagenabnutzungsgrad?", ["75 %", "33 %", "133 %", "25 %"], "3.600 / 4.800 = 75 % – alte Anlagen, Reinvestitionsbedarf."),
  Q("b-verm", "Umsatz netto € 3.000.000, 20 % USt, ø Forderungen LL € 450.000. Debitorenumschlagsdauer?", ["≈ 46 Tage", "≈ 55 Tage", "8 Tage", "≈ 37 Tage"], "DUH = 3.600.000 / 450.000 = 8 → 365 / 8 = 45,6 Tage. Ohne USt käme fälschlich ≈ 55 heraus."),
  Q("b-verm", "Die Lagerdauer steigt von 40 auf 70 Tage. Plausible Folge?", ["Mehr Kapital ist im Lager gebunden, Finanzierungsbedarf und Lagerrisiko steigen", "Die Liquidität steigt", "Die Debitorenlaufzeit sinkt", "Die EK-Quote steigt automatisch"], "Längere Lagerdauer vergrößert die Finanzierungslücke."),
  Q("b-verm", "Lagerumschlagshäufigkeit 8. Lagerdauer?", ["≈ 45,6 Tage", "8 Tage", "≈ 2.920 Tage", "≈ 12,5 Tage"], "365 / 8 = 45,6 Tage."),
  // b-fin
  Q("b-fin", "Zahlungsmittel 50, Forderungen 250, Vorräte 300, kurzfristiges FK 400. Liquidität 2. Grades?", ["75 %", "12,5 %", "150 %", "62,5 %"], "(50 + 250) / 400 = 75 %."),
  Q("b-fin", "EK 500, langfristiges FK 300, AV 1.000. Deckungsgrad B?", ["80 %", "50 %", "125 %", "30 %"], "(500 + 300) / 1.000 = 80 % → AV teilweise kurzfristig finanziert."),
  Q("b-fin", "Lagerdauer 45 Tage, Debitorenlaufzeit 30 Tage, Kreditorenlaufzeit 20 Tage. Finanzierungslücke?", ["55 Tage", "95 Tage", "35 Tage", "15 Tage"], "45 + 30 − 20 = 55 Tage."),
  Q("b-fin", "Die goldene Bilanzregel (Fristenkongruenz) verlangt, dass …", ["langfristig gebundenes Vermögen langfristig finanziert ist", "EK und FK gleich hoch sind", "die Liquidität 1. Grades mindestens 100 % beträgt", "nur mit Eigenkapital finanziert wird"], "Deckungsgrad B bzw. C ≥ 100 %."),
  Q("b-fin", "Ein Unternehmen bezahlt Lieferantenschulden aus dem Bankguthaben. Liq. 3 lag vorher bei 150 %. Danach …", ["steigt Liq. 3", "sinkt Liq. 3", "bleibt Liq. 3 gleich", "wird Liq. 3 null"], "Zähler und Nenner sinken um denselben Betrag; ein Wert über 100 % entfernt sich dabei von 100 %, z. B. 300/200 → 250/150 = 167 %."),
  // b-cf
  Q("b-cf", "JÜ 50, Afa 30, Zuschreibungen 5, Erhöhung langfristiger Rückstellungen 10. Cash-Flow aus dem Ergebnis?", ["85", "95", "75", "50"], "50 + 30 − 5 + 10 = 85."),
  Q("b-cf", "Eine Maschine (Buchwert 20) wird um 30 bar verkauft. Behandlung in der indirekten KFR?", ["Gewinn 10 im operativen Bereich abziehen, Erlös 30 im Investitionsbereich", "30 im operativen Cash-Flow", "Gewinn 10 addieren", "Gar nicht"], "Sonst wäre der Gewinn doppelt erfasst."),
  Q("b-cf", "FK 1.200, liquide Mittel 100, Wertpapiere des UV 50, Cash-Flow 210. Dynamische Schuldentilgungsdauer?", ["5 Jahre", "≈ 5,7 Jahre", "≈ 4,3 Jahre", "0,2 Jahre"], "Effektivverschuldung 1.050 / 210 = 5 Jahre. 5,7 wäre ohne Abzug der liquiden Mittel."),
  Q("b-cf", "Hoher positiver operativer Cash-Flow bei negativem Investitions-Cash-Flow deutet typischerweise auf …", ["ein Unternehmen, das seine Investitionen aus eigener Kraft finanziert", "Überschuldung", "Desinvestition", "eine Kapitalerhöhung"], "Der Umsatzprozess erwirtschaftet das Geld für die Investitionen."),
  Q("b-cf", "Der Jahresüberschuss ist positiv, die liquiden Mittel sinken trotzdem. Mögliche Ursache?", ["Stark gestiegene Forderungen und Vorräte oder hohe Tilgungen", "Hohe Abschreibungen", "Gestiegene Lieferverbindlichkeiten", "Dotierung von Rückstellungen"], "Abschreibungen, Rückstellungsdotierungen und mehr Lieferantenkredit erhöhen den Cash-Flow; gebundenes Working Capital und Tilgungen senken ihn."),
  // b-ertr
  Q("b-ertr", "ROA 12 %, FK-Zins 5 %, FK/EK = 2. EK-Rentabilität laut Leverage-Formel?", ["26 %", "19 %", "14 %", "24 %"], "12 + (12 − 5) × 2 = 26 %."),
  Q("b-ertr", "ROA 4 %, FK-Zins 6 %. Was passiert mit dem ROE, wenn der Verschuldungsgrad steigt?", ["Er sinkt (negativer Leverage-Effekt)", "Er steigt", "Er bleibt gleich", "Er bleibt immer bei 4 %"], "(ROA − i) ist negativ, der Hebel wirkt nach unten."),
  Q("b-ertr", "Ergebnis vor Steuern 90, ø EK 600. ROE?", ["15 %", "9 %", "6,7 %", "20 %"], "90 / 600 = 15 %."),
  Q("b-ertr", "Ergebnis vor Steuern 90, FK-Zinsen 40, ø GK 1.300. ROI?", ["10 %", "6,9 %", "3,1 %", "13 %"], "(90 + 40) / 1.300 = 10 %."),
  Q("b-ertr", "Warum rechnet man bei Rentabilitäten mit dem durchschnittlichen Kapital?", ["Das Ergebnis entsteht über das ganze Jahr, die Bilanz zeigt nur Stichtagswerte", "Weil es kleiner ist", "Weil das UGB es vorschreibt", "Um Steuern zu sparen"], "Stromgröße (Ergebnis) zu Bestandsgröße (Kapital) – der Durchschnitt glättet Veränderungen."),
  // b-kore
  Q("b-kore", "Fixkosten € 24.000, kv € 6, Menge 4.000 Stk. Stückkosten?", ["12 €", "6 €", "10 €", "30.000 €"], "24.000 / 4.000 + 6 = 12 €."),
  Q("b-kore", "Die Kostenträgerrechnung beantwortet die Frage …", ["Wofür sind die Kosten angefallen?", "Welche Kosten sind angefallen?", "Wo sind die Kosten angefallen?", "Wann wird bezahlt?"], "Kostenträger = Produkte bzw. Aufträge."),
  Q("b-kore", "Mischkosten (z. B. Strom mit Grundgebühr) muss man für die Teilkostenrechnung …", ["in fixe und variable Bestandteile aufspalten", "komplett als fix behandeln", "ignorieren", "als Einzelkosten verbuchen"], "Nur so lassen sich Deckungsbeiträge korrekt ermitteln."),
  Q("b-kore", "Welche Kosten sind typischerweise Einzelkosten?", ["Fertigungsmaterial eines Auftrags", "Miete der Produktionshalle", "Gehalt der Buchhaltung", "Grundgebühr Strom"], "Direkt einem Kostenträger zurechenbar."),
  Q("b-kore", "Neutraler Aufwand ist …", ["Aufwand ohne Kostencharakter (betriebsfremd, periodenfremd, außerordentlich)", "Aufwand, der als Kosten anders bewertet wird", "Kosten ohne Aufwand", "jeder fixe Aufwand"], "Beispiele: Spenden, Verluste aus Wertpapierverkäufen, Steuernachzahlungen für Vorjahre."),
  // b-bab
  Q("b-bab", "MGK € 18.000, Fertigungsmaterial € 120.000. MGK-Zuschlagssatz?", ["15 %", "6,7 %", "18 %", "150 %"], "18.000 / 120.000 = 15 %."),
  Q("b-bab", "FM 400, MGK 10 %, FL 200, FGK 150 %, Verwaltung + Vertrieb 20 % auf HK. Selbstkosten?", ["1.128 €", "940 €", "1.080 €", "1.200 €"], "MK 440 + FK 500 = HK 940 × 1,2 = 1.128 €."),
  Q("b-bab", "Beim Stufenleiterverfahren …", ["werden Hilfskostenstellen nacheinander umgelegt; Leistungen an bereits abgerechnete Stellen bleiben unberücksichtigt", "werden alle gegenseitigen Leistungen exakt erfasst", "werden nur Hauptkostenstellen betrachtet", "werden Einzelkosten verteilt"], "Exakt wäre das Gleichungsverfahren; die Stufenleiter ist eine Näherung mit sinnvoller Reihenfolge."),
  Q("b-bab", "VwGK € 33.000, Herstellkosten € 275.000. VwGK-Zuschlag?", ["12 %", "8,3 %", "13,6 %", "120 %"], "33.000 / 275.000 = 12 %."),
  Q("b-bab", "Nettobarpreis € 4.410, 10 % Rabatt werden im Hundert aufgeschlagen. Ergebnis?", ["4.900 €", "4.851 €", "4.010 €", "4.441 €"], "4.410 / 0,9 = 4.900. Nach 10 % Rabatt bleiben genau 4.410."),
  // b-db
  Q("b-db", "Produkt B hat DB € 25.000, nach Vollkosten aber € −15.000 Ergebnis. Fixkosten sind nicht abbaubar. Was bewirkt das Streichen von B?", ["Das Betriebsergebnis sinkt um € 25.000", "Das Betriebsergebnis steigt um € 15.000", "Keine Wirkung", "Das Betriebsergebnis steigt um € 25.000"], "Der DB fällt weg, die Fixkosten bleiben."),
  Q("b-db", "Produkt A: p 50, kv 35, 2.000 Stk; B: p 20, kv 12, 5.000 Stk; Fixkosten € 60.000. Betriebsergebnis?", ["10.000 €", "70.000 €", "−10.000 €", "130.000 €"], "30.000 + 40.000 − 60.000."),
  Q("b-db", "DB II eines Erzeugnisses = …", ["DB I − erzeugnisfixe Kosten", "Erlös − variable Kosten", "DB I − Unternehmensfixkosten", "DB III + Bereichsfixkosten"], "Stufenweise Fixkostendeckung: Erzeugnis → Gruppe → Bereich → Unternehmen."),
  Q("b-db", "Warum ist die Fixkostenproportionalisierung der Vollkostenrechnung gefährlich?", ["Fixe Stückkosten wirken variabel, obwohl die Fixkosten bei Mengenänderungen bleiben", "Sie ist gesetzlich verboten", "Sie macht die Kosten kleiner", "Sie ignoriert variable Kosten"], "Führt zu falschen Entscheidungen über Annahme, Preis oder Streichung."),
  Q("b-db", "Ein Produkt hat einen negativen DB I. Kurzfristig gilt:", ["Jedes verkaufte Stück verschlechtert das Ergebnis – Preis, kv oder Streichung prüfen", "Es deckt trotzdem Fixkosten", "Das ist für die Entscheidung egal", "Es ist automatisch der Engpass"], "Bei negativem DB fehlt schon die Deckung der variablen Kosten. Verbundeffekte trotzdem beachten."),
  // b-entsch
  Q("b-entsch", "Voll ausgelastete Maschine. Zusatzauftrag mit kv € 22 verdrängt Standardware (DB € 18) eins zu eins. Kurzfristige PUG?", ["40 €", "22 €", "18 €", "4 €"], "kv + entgangener DB = 22 + 18."),
  Q("b-entsch", "p 20, kv 12, Fixkosten 40.000. Der Preis sinkt um 10 %. Um wie viel muss die Break-even-Menge steigen?", ["≈ +33 %", "+10 %", "+25 %", "+20 %"], "BEP vorher 40.000 / 8 = 5.000; nachher 40.000 / 6 = 6.667 → +33 %."),
  Q("b-entsch", "P1: DB 24 / 8 min, P2: DB 15 / 3 min, P3: DB 30 / 12 min. Reihenfolge bei Engpass?", ["P2 – P1 – P3", "P3 – P1 – P2", "P1 – P2 – P3", "P2 – P3 – P1"], "Relative DB: 5,00 / 3,00 / 2,50 €/min."),
  Q("b-entsch", "Geplanter Absatz 12.000 Stk, Break-even 9.000 Stk. Sicherheitsabstand?", ["25 %", "33 %", "75 %", "3.000 %"], "(12.000 − 9.000) / 12.000 = 25 %."),
  Q("b-entsch", "Freie Kapazität. Zusatzauftrag 500 Stk zu € 14, kv € 11, volle Stückkosten € 16. Ergebniswirkung?", ["+1.500 € – annehmen", "−1.000 € – ablehnen", "0", "+7.000 €"], "500 × (14 − 11) = 1.500. Die vollen Kosten sind kurzfristig irrelevant."),
  Q("b-entsch", "Fixkosten € 50.000, DB € 25 je Stück, Zielgewinn € 20.000. Nötige Menge?", ["2.800 Stk", "2.000 Stk", "800 Stk", "3.000 Stk"], "(50.000 + 20.000) / 25."),
  // b-stat
  Q("b-stat", "A: Fixkosten 13.600, kv 1,50; B: Fixkosten 23.000, kv 0,80. Kritische Menge?", ["≈ 13.429 Stk", "≈ 6.267 Stk", "9.400 Stk", "≈ 15.333 Stk"], "9.400 / 0,70 = 13.428,6."),
  Q("b-stat", "AK 90.000, RW 10.000, ND 5. Kalkulatorische Abschreibung?", ["16.000", "18.000", "20.000", "10.000"], "(90.000 − 10.000) / 5."),
  Q("b-stat", "AK 90.000, RW 10.000, ø Gewinn 6.000, kalk. Zinsen 4.000. Rentabilität?", ["20 %", "12 %", "11,1 %", "8 %"], "(6.000 + 4.000) / 50.000."),
  Q("b-stat", "AK 60.000, kein Restwert, ø Gewinn 9.000, Afa 12.000. Amortisationsdauer (Durchschnittsmethode)?", ["≈ 2,86 Jahre", "≈ 6,67 Jahre", "5 Jahre", "2,5 Jahre"], "60.000 / (9.000 + 12.000)."),
  Q("b-stat", "AK 50.000, Rückflüsse 20.000 / 15.000 / 25.000. Amortisation (Kumulation, linear interpoliert)?", ["2,6 Jahre", "2,5 Jahre", "3 Jahre", "2 Jahre"], "Nach 2 Jahren 35.000; fehlen 15.000 von 25.000 → 2,6."),
  Q("b-stat", "Wann reicht ein Kostenvergleich nicht aus?", ["Wenn die Alternativen unterschiedliche Erlöse oder Mengen haben", "Wenn die Fixkosten gleich sind", "Bei gleicher Nutzungsdauer", "Wenn der Zinssatz 0 % ist"], "Dann Gewinnvergleich (bzw. Stückkostenvergleich bei unterschiedlicher Menge)."),
  // b-dyn
  Q("b-dyn", "A₀ 10.000, Rückflüsse je 6.000 in Jahr 1 und 2, i = 10 %. Kapitalwert?", ["413,22 €", "2.000,00 €", "−413,22 €", "10.413,22 €"], "6.000/1,1 + 6.000/1,21 − 10.000 = 413,22 €."),
  Q("b-dyn", "A₀ 10.000, vier Rückflüsse zu je 3.000, i = 8 % (RBF 3,3121). Kapitalwert?", ["−63,62 €", "2.000,00 €", "936,38 €", "+63,62 €"], "3.000 × 3,3121 − 10.000 = −63,62 €. Ohne Abzinsung käme fälschlich +2.000 heraus."),
  Q("b-dyn", "KW 5.000 €, i = 6 %, n = 4 (KWF 0,288591). Annuität?", ["1.442,96 €", "1.250,00 €", "1.200,00 €", "1.329,46 €"], "5.000 × 0,288591."),
  Q("b-dyn", "Der Schnittpunkt der Kapitalwertkurve mit der Zins-Achse ist …", ["der interne Zinsfuß", "der Kalkulationszinssatz", "die Annuität", "die Amortisationsdauer"], "Dort gilt KW = 0."),
  Q("b-dyn", "Normalinvestition: IZF 9 %, Kalkulationszins 7 %. Dann ist …", ["KW > 0 – absolut vorteilhaft", "KW < 0", "KW = 0", "keine Aussage möglich"], "Bei einer Normalinvestition fällt die KW-Kurve; links vom IZF ist der KW positiv."),
  Q("b-dyn", "Warum überschätzt die lineare Interpolation den IZF meistens leicht?", ["Weil die Kapitalwertkurve konvex ist und die Sehne darüber liegt", "Weil Excel anders rundet", "Weil der Restwert fehlt", "Weil der Zins nicht abgezinst wird"], "Die Sehne zwischen einem positiven und einem negativen KW schneidet die Achse rechts vom echten IZF."),
  // b-finz
  Q("b-finz", "„2 % Skonto innerhalb 10 Tagen, netto 40 Tage“. Effektiver Jahreszins (Näherung)?", ["≈ 24,5 %", "2 %", "≈ 36,7 %", "≈ 18 %"], "2 / 98 × 360 / 30."),
  Q("b-finz", "Die Skontoziehung über den Kontokorrent lohnt sich, wenn …", ["der Kontokorrentzins unter dem effektiven Skontozins liegt", "der Kontokorrentzins über dem Skontozins liegt", "der Lieferant zustimmt", "das Zahlungsziel kürzer als 10 Tage ist"], "Dann ist der Bankkredit billiger als der Lieferantenkredit."),
  Q("b-finz", "Annuitätendarlehen € 20.000, 6 %, 5 Jahre. Jährliche Rate?", ["4.747,93 €", "4.000,00 €", "5.200,00 €", "4.240,00 €"], "20.000 × 0,06 / (1 − 1,06⁻⁵). 5.200 wäre die erste Rate bei Ratentilgung."),
  Q("b-finz", "Tilgungsanteil der ersten Rate dieses Annuitätendarlehens (20.000 €, 6 %, Rate 4.747,93)?", ["3.547,93 €", "4.747,93 €", "1.200,00 €", "4.000,00 €"], "Rate − Zinsen = 4.747,93 − 1.200."),
  Q("b-finz", "Finanzierung aus Abschreibungsrückflüssen setzt voraus, dass …", ["die Abschreibungen über die Umsatzerlöse verdient werden", "die Bank zustimmt", "das Eigenkapital erhöht wird", "Rückstellungen gebildet werden"], "Nur dann fließen die einkalkulierten Abschreibungen als Geld zurück."),
  Q("b-finz", "Leasing ist …", ["ein Kreditsubstitut: Nutzung gegen Rate, Eigentum bleibt beim Leasinggeber", "Eigenfinanzierung", "Innenfinanzierung", "Mezzaninkapital"], "Ersetzt den Kauf auf Kredit."),
  // bx-pflicht
  Q("bx-pflicht", "EK Anfang 60.000, EK Ende 72.000, Entnahmen 24.000, Einlagen 5.000. Gewinn?", ["31.000 €", "12.000 €", "41.000 €", "−7.000 €"], "72.000 − 60.000 + 24.000 − 5.000."),
  Q("bx-pflicht", "e.U. mit Umsätzen 20x1: 750.000 €, 20x2: 720.000 €. Ab wann rechnungslegungspflichtig?", ["ab 20x4 (zweitfolgendes Geschäftsjahr)", "ab 20x3", "rückwirkend ab 20x2", "nie"], "Zwei Jahre &gt; 700.000 → Pflicht ab dem zweitfolgenden Geschäftsjahr."),
  Q("bx-pflicht", "Eine Rückstellung für Prozesskosten ist …", ["Fremdkapital", "Eigenkapital", "ein Aktivposten", "ein Ertrag"], "Ungewisse Verbindlichkeit → Passiva, FK."),
  Q("bx-pflicht", "Eine Kapitalrücklage entsteht durch …", ["Mittel von außen, z. B. ein Agio bei der Kapitalerhöhung", "Gewinnthesaurierung", "Abschreibungen", "Auflösung von Rückstellungen"], "Gewinnrücklagen kommen aus dem Jahresüberschuss."),
  Q("bx-pflicht", "Eine GmbH hat seit Jahren nur € 150.000 Umsatz. Muss sie doppelt buchführen?", ["Ja, kraft Rechtsform", "Nein, Umsatz unter 700.000", "Nur bei mehr als 10 Mitarbeitenden", "Nur, wenn sie es beantragt"], "Kapitalgesellschaften sind immer rechnungslegungspflichtig."),
  // bx-urg
  Q("bx-urg", "Eigenmittel 70.000, Gesamtkapital 1.000.000. Eigenmittelquote?", ["7 %", "70 %", "0,7 %", "14 %"], "70.000 / 1.000.000."),
  Q("bx-urg", "Rückstellungen 100, Verbindlichkeiten 900, flüssige Mittel 50, Wertpapiere 50, Mittelüberschuss 50 (TEUR). Fiktive Schuldentilgungsdauer?", ["18 Jahre", "20 Jahre", "16 Jahre", "9 Jahre"], "(100 + 900 − 50 − 50) / 50."),
  Q("bx-urg", "EMQ 7 %, fiktive SDT 18 Jahre. Folge?", ["Reorganisationsbedarf wird vermutet", "Keine Vermutung", "Zwingende Insolvenz", "Nur die EMQ zählt"], "Beide Grenzen (&lt; 8 % und &gt; 15 Jahre) sind verletzt."),
  Q("bx-urg", "EMQ 12 %, fiktive SDT 25 Jahre. Folge?", ["Keine gesetzliche Vermutung", "Reorganisationsbedarf wird vermutet", "Insolvenzantrag nötig", "Haftung der Gesellschafter"], "Die EMQ liegt über 8 % – es braucht beide Bedingungen."),
  Q("bx-urg", "Im Nenner der fiktiven Schuldentilgungsdauer steht …", ["der Mittelüberschuss aus der gewöhnlichen Geschäftstätigkeit", "der Umsatz", "der Jahresüberschuss", "das Eigenkapital"], "Ein Cash-Flow-Maß: Wie viele Jahre bräuchte man, um die Nettoschulden zu tilgen?"),
  // bx-afa
  Q("bx-afa", "Kaufpreis 20.000 € netto, 10 % Rabatt, 2 % Skonto gezogen, Montage 500 €. AK?", ["18.140 €", "18.500 €", "17.640 €", "21.768 €"], "18.000 − 360 + 500."),
  Q("bx-afa", "AK 18.140 €, ND 5 Jahre, Inbetriebnahme 3. August. AfA im ersten Jahr (Halbjahresregel)?", ["1.814 €", "3.628 €", "1.511,67 €", "0 €"], "Jahres-AfA 3.628, Inbetriebnahme im 2. Halbjahr → die Hälfte."),
  Q("bx-afa", "Inbetriebnahme am 30. Juni. AfA im ersten Jahr nach der Halbjahresregel?", ["volle Jahres-AfA", "halbe Jahres-AfA", "keine AfA", "6/12 der Jahres-AfA, monatsgenau"], "30. Juni liegt im ersten Halbjahr."),
  Q("bx-afa", "AK 18.140 €, Jahres-AfA 3.628 €, erstes Jahr Halbjahres-AfA. Buchwert Ende Jahr 2?", ["12.698 €", "14.512 €", "10.884 €", "16.326 €"], "18.140 − 1.814 − 3.628."),
  Q("bx-afa", "Anlagenspiegel: AK 1.1. 10.000, Zugang 2.000, Abgang 1.000, kum. AfA 31.12. 4.000. Buchwert 31.12.?", ["7.000", "8.000", "6.000", "11.000"], "AK 31.12. = 11.000 − kum. AfA 4.000.")
];

const flashcards = [
  ["Leverage-Formel", "ROE = ROA + (ROA − i) · FK/EK; positiv nur solange ROA > FK-Zins", "b-ertr"],
  ["Finanzierungslücke", "Lagerdauer + Debitorenlaufzeit − Kreditorenlaufzeit (Tage)", "b-fin"],
  ["Effektivzins Lieferantenkredit (Näherung)", "Skontosatz / (100 − Skontosatz) × 360 / (Zahlungsziel − Skontofrist)", "b-finz"],
  ["Kritische Menge (Kostenvergleich)", "x = (Kf,B − Kf,A) / (kv,A − kv,B)", "b-stat"],
  ["PUG bei Engpass", "kv + entgangener DB der verdrängten Leistung je Stück", "b-entsch"],
  ["Sicherheitsabstand", "(Plan- oder Ist-Menge − Break-even-Menge) / Plan- oder Ist-Menge", "b-entsch"],
  ["Gewinnschwelle mit Zielgewinn", "x = (Kf + Zielgewinn) / db", "b-entsch"],
  ["Stufenleiterverfahren", "Hilfsstellen nacheinander auf nachgelagerte Stellen umlegen; Rückflüsse an bereits abgerechnete Stellen werden ignoriert", "b-bab"],
  ["Skonto/Rabatt im Hundert", "Nettozielpreis = Nettobarpreis / (1 − Skontosatz); Listenpreis = Nettozielpreis / (1 − Rabattsatz)", "b-bab"],
  ["Kapitalwiedergewinnungsfaktor", "KWF = i / (1 − (1+i)⁻ⁿ) = 1 / RBF – macht aus einem Barwert eine gleich hohe Jahreszahlung", "b-dyn"],
  ["Betriebsvermögensvergleich", "Gewinn = EK Ende − EK Anfang + Entnahmen − Einlagen", "bx-pflicht"],
  ["Halbjahresregel AfA", "Inbetriebnahme 1. Halbjahr: volle Jahres-AfA, 2. Halbjahr: halbe Jahres-AfA", "bx-afa"]
].map(([front, back, topic], i) => ({ id: "pxf-bwl2-" + (i + 1), cat: "BWL", topic, front, back }));

window.STUDYOS_EXT = window.STUDYOS_EXT || {};
/* Lektionen ohne Erklärblock: hinter den ersten Block (Kernpunkte) statt ganz an den Anfang */
const AT = { "b1-2": 0, "b3-1": 1, "b3-2": 0, "b3-4": 0, "b5-1": 0 };
Object.entries(AT).forEach(([lid, at]) => (blocks[lid] || []).forEach(b => { if (b.at == null) b.at = at; }));
(window.STUDYOS_EXT.bwl2 = window.STUDYOS_EXT.bwl2 || []).push({ id: "bwl2-plus", blocks, questions, flashcards });
})();
