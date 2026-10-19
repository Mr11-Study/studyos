/* ufo · Plus: Rechner mit Live-Graph, Animationen, durchgerechnete Beispiele und zusätzliche Fragen (über STUDYOS_EXT, siehe courses/ext-apply.js) */
(function () {
const C = window.STUDYOS_CALC = window.STUDYOS_CALC || {};
const FIG = window.STUDYOS_FIG = window.STUDYOS_FIG || {};
const FX = window.FX;
const n2 = (n, d = 2) => (typeof n === "number" && isFinite(n)) ? n.toLocaleString("de-AT", { maximumFractionDigits: d }) : "–";
const eur = n => "€ " + n2(n, 0);
const kf = n => Math.abs(n) >= 1e6 ? n2(n / 1e6, 2) + " Mio." : Math.abs(n) >= 1000 ? n2(n / 1000, 0) + "k" : n2(n, 0);

/* ---------- Rückkopplung im Zeitverlauf (Systemtheorie) ---------- */
C["ufo-rueck"] = {
  title: "Positive und negative Rückkopplung im Zeitverlauf",
  intro: "Auftragsbestand eines Unternehmens: Die <b>negative</b> (ausgleichende) Schleife zieht den Bestand zum Zielwert, weil steigende Lieferzeiten den Auftragseingang bremsen. Die <b>positive</b> (verstärkende) Schleife lässt ihn exponentiell wachsen (Bekanntheit → mehr Aufträge).",
  inputs: [
    { k: "b0", label: "Startbestand", v: 100, min: 0, max: 500, step: 10, unit: "Aufträge" },
    { k: "z", label: "Zielwert (Gleichgewicht)", v: 200, min: 0, max: 500, step: 10, unit: "Aufträge" },
    { k: "k", label: "Anpassungsrate (negativ)", v: 30, min: 1, max: 100, step: 1, unit: "% je Periode" },
    { k: "g", label: "Wachstumsrate (positiv)", v: 15, min: -30, max: 50, step: 1, unit: "% je Periode" },
    { k: "T", label: "Perioden", v: 12, min: 2, max: 30, step: 1, unit: "" }
  ],
  out: v => { const neg = v.z + (v.b0 - v.z) * Math.pow(1 - v.k / 100, v.T), pos = v.b0 * Math.pow(1 + v.g / 100, v.T), dz = v.g > 0 ? Math.log(2) / Math.log(1 + v.g / 100) : NaN;
    return [["negativ: Bestand nach T", neg, "", true], ["positiv: Bestand nach T", pos, ""], ["Verdopplungszeit (positiv)", isFinite(dz) ? n2(dz, 1) : "–", "Perioden"], ["Restabstand zum Ziel", Math.abs(neg - v.z), ""]]; },
  steps: v => `<b>Negative Rückkopplung</b>: B(t+1) = B(t) + k · (Z − B(t)) → B(t) = Z + (B₀ − Z) · (1 − k)<sup>t</sup><br>
    = ${v.z} + (${v.b0} − ${v.z}) · ${n2(1 - v.k / 100)}<sup>${v.T}</sup> = <b>${n2(v.z + (v.b0 - v.z) * Math.pow(1 - v.k / 100, v.T), 1)}</b><br>
    <b>Positive Rückkopplung</b>: B(t+1) = B(t) · (1 + g) → B(t) = ${v.b0} · ${n2(1 + v.g / 100)}<sup>${v.T}</sup> = <b>${n2(v.b0 * Math.pow(1 + v.g / 100, v.T), 1)}</b><br>
    <span class='muted'>Merkregel: Kreis mit ungerader Anzahl von (−)-Beziehungen = ausgleichend, gerader Anzahl = verstärkend. Bei negativer Wachstumsrate zeigt die positive Schleife eine Abwärtsspirale.</span>`,
  plot: { x: v => [0, v.T], xl: "Periode", yl: "Auftragsbestand",
    fns: [{ label: "negative Rückkopplung", f: (x, v) => v.z + (v.b0 - v.z) * Math.pow(1 - v.k / 100, x) }, { label: "positive Rückkopplung", f: (x, v) => v.b0 * Math.pow(1 + v.g / 100, x) }, { label: "Zielwert", f: (x, v) => v.z }],
    xfmt: n => n2(n, 0), yfmt: n => kf(n) }
};

/* ---------- Nutzwertanalyse mit Sensitivität ---------- */
const nwa = v => { const s = v.g1 + v.g2 + v.g3 || 1, w1 = v.g1 / s, r = v.g2 + v.g3 || 1,
  restA = (v.g2 * v.a2 + v.g3 * v.a3) / r, restB = (v.g2 * v.b2 + v.g3 * v.b3) / r,
  A = w1 * v.a1 + (1 - w1) * restA, B = w1 * v.b1 + (1 - w1) * restB, den = (v.a1 - restA) - (v.b1 - restB), xc = den !== 0 ? (restB - restA) / den : NaN;
  return { w1, A, B, restA, restB, xc: xc >= 0 && xc <= 1 ? xc : NaN }; };
C["ufo-nwa"] = {
  title: "Nutzwertanalyse mit Sensitivität: Standort A oder B?",
  intro: "Alternativenbewertung im Führungsprozess (Planung i. w. S.). Gewichte werden auf 100 % normiert, Punkte 0–10. Der Graph zeigt, wie sich die Nutzwerte ändern, wenn das Gewicht von „Kosten“ variiert (die übrigen Gewichte behalten ihr Verhältnis). Am Schnittpunkt kippt die Entscheidung.",
  inputs: [
    { k: "g1", label: "Gewicht Kosten", v: 50, min: 0, max: 100, step: 5, unit: "%" },
    { k: "g2", label: "Gewicht Erreichbarkeit", v: 30, min: 0, max: 100, step: 5, unit: "%" },
    { k: "g3", label: "Gewicht Fachkräfte", v: 20, min: 0, max: 100, step: 5, unit: "%" },
    { k: "a1", label: "A: Kosten", v: 8, min: 0, max: 10, step: 1, unit: "Pkt" },
    { k: "a2", label: "A: Erreichbarkeit", v: 5, min: 0, max: 10, step: 1, unit: "Pkt" },
    { k: "a3", label: "A: Fachkräfte", v: 4, min: 0, max: 10, step: 1, unit: "Pkt" },
    { k: "b1", label: "B: Kosten", v: 5, min: 0, max: 10, step: 1, unit: "Pkt" },
    { k: "b2", label: "B: Erreichbarkeit", v: 8, min: 0, max: 10, step: 1, unit: "Pkt" },
    { k: "b3", label: "B: Fachkräfte", v: 8, min: 0, max: 10, step: 1, unit: "Pkt" }
  ],
  out: v => { const r = nwa(v); return [["Nutzwert A", r.A, ""], ["Nutzwert B", r.B, ""], ["Empfehlung", Math.abs(r.A - r.B) < 1e-9 ? "Gleichstand" : r.A > r.B ? "Standort A" : "Standort B", "", true], ["kritisches Gewicht Kosten", isFinite(r.xc) ? n2(r.xc * 100, 1) : "kein Wechsel", isFinite(r.xc) ? "%" : ""]]; },
  steps: v => { const s = v.g1 + v.g2 + v.g3 || 1, g = [v.g1 / s, v.g2 / s, v.g3 / s], r = nwa(v);
    return `N(A) = ${g.map(x => n2(x, 3)).join(" / ")} · (${v.a1} / ${v.a2} / ${v.a3}) = ${n2(g[0], 3)}·${v.a1} + ${n2(g[1], 3)}·${v.a2} + ${n2(g[2], 3)}·${v.a3} = <b>${n2(r.A)}</b><br>
    N(B) = ${n2(g[0], 3)}·${v.b1} + ${n2(g[1], 3)}·${v.b2} + ${n2(g[2], 3)}·${v.b3} = <b>${n2(r.B)}</b><br>
    Sensitivität: Mit Kostengewicht x gilt N<sub>A</sub>(x) = x·${v.a1} + (1 − x)·${n2(r.restA)} und N<sub>B</sub>(x) = x·${v.b1} + (1 − x)·${n2(r.restB)}. ${isFinite(r.xc) ? `Gleichstand bei x = <b>${n2(r.xc * 100, 1)} %</b>.` : "Die Geraden schneiden sich im Bereich 0–100 % nicht: Die Entscheidung ist robust."}<br>
    <span class='muted'>Liegt das kritische Gewicht nahe am gewählten Gewicht, ist die Empfehlung wackelig und sollte mit weiteren Informationen abgesichert werden.</span>`; },
  plot: { x: [0, 100], y: [0, 10], xl: "Gewicht Kosten (%)", yl: "Nutzwert",
    fns: [{ label: "Standort A", f: (x, v) => { const r = nwa(v); return x / 100 * v.a1 + (1 - x / 100) * r.restA; } }, { label: "Standort B", f: (x, v) => { const r = nwa(v); return x / 100 * v.b1 + (1 - x / 100) * r.restB; } }],
    points: v => { const r = nwa(v), pts = [{ x: r.w1 * 100, y: Math.max(r.A, r.B), label: "gewählt" }]; if (isFinite(r.xc)) pts.push({ x: r.xc * 100, y: r.xc * v.a1 + (1 - r.xc) * r.restA, label: "kippt" }); return pts; }, xfmt: n => n2(n, 0) }
};

/* ---------- Erfahrungskurve (Kostenführerschaft, BCG) ---------- */
const ek = (x, c1, L) => c1 * Math.pow(Math.max(x, 1), Math.log2(L / 100));
C["ufo-erfk"] = {
  title: "Erfahrungskurve: Warum Marktanteil Kostenvorteile bringt",
  intro: "Mit jeder Verdopplung der kumulierten Menge sinken die Stückkosten um einen festen Prozentsatz (bei Lernrate 80 % um 20 %). Das ist die Logik hinter der Kostenführerschaft und hinter dem relativen Marktanteil im BCG-Portfolio.",
  inputs: [
    { k: "c1", label: "Kosten der 1. Einheit", v: 1000, min: 10, max: 5000, step: 10, unit: "€" },
    { k: "L", label: "Lernrate", v: 80, min: 60, max: 99, step: 1, unit: "%" },
    { k: "x", label: "eigene kumulierte Menge", v: 1000, min: 1, max: 10000, step: 10, unit: "Stk" },
    { k: "y", label: "Menge des Konkurrenten", v: 250, min: 1, max: 10000, step: 10, unit: "Stk" }
  ],
  out: v => { const a = ek(v.x, v.c1, v.L), b = ek(v.y, v.c1, v.L); return [["eigene Stückkosten", a, "€", true], ["Stückkosten Konkurrent", b, "€"], ["Kostenvorteil", (1 - a / b) * 100, "%"], ["Mengenverhältnis", v.x / v.y, "×"], ["b = −log₂(Lernrate)", -Math.log2(v.L / 100), ""]]; },
  steps: v => { const b = -Math.log2(v.L / 100), a = ek(v.x, v.c1, v.L), c = ek(v.y, v.c1, v.L);
    return `c(x) = c₁ · x<sup>−b</sup> mit b = −log₂(${n2(v.L / 100)}) = ${n2(b, 3)}<br>eigene Kosten: ${v.c1} · ${v.x}<sup>−${n2(b, 3)}</sup> = <b>${eur(a)}</b> · Konkurrent: ${v.c1} · ${v.y}<sup>−${n2(b, 3)}</sup> = <b>${eur(c)}</b><br>
    Verhältnis: (${v.x} / ${v.y})<sup>−${n2(b, 3)}</sup> = ${n2(a / c, 3)} → Kostenvorteil ${n2((1 - a / c) * 100, 1)} %<br>
    <span class='muted'>Die Kostensenkung tritt nicht automatisch ein, sie muss aktiv realisiert werden (Lerneffekte, Skaleneffekte, Rationalisierung).</span>`; },
  plot: { x: v => [1, Math.max(v.x, v.y) * 1.3], xl: "kumulierte Menge", yl: "€ / Stück", y: v => [0, v.c1 * 0.6],
    fns: [{ label: "Stückkosten c(x)", f: (x, v) => ek(x, v.c1, v.L) }],
    points: v => [{ x: v.x, y: ek(v.x, v.c1, v.L), label: "wir" }, { x: v.y, y: ek(v.y, v.c1, v.L), label: "Konkurrent" }], xfmt: n => kf(n) }
};

/* ---------- Soll-Ist-Wird-Vergleich ---------- */
C["ufo-soll"] = {
  title: "Soll-Ist- und Soll-Wird-Vergleich",
  intro: "Ergebniskontrolle vergleicht Soll und Ist, die Planfortschrittskontrolle Soll und Wird (Hochrechnung auf das Periodenende). Hier: Umsatzplan eines Jahres, linear verteilt.",
  inputs: [
    { k: "plan", label: "Jahresplan Umsatz (Soll)", v: 1200000, min: 100000, max: 5000000, step: 10000, unit: "€" },
    { k: "m", label: "vergangene Monate", v: 5, min: 1, max: 12, step: 1, unit: "Monate" },
    { k: "ist", label: "Ist-Umsatz kumuliert", v: 450000, min: 0, max: 5000000, step: 5000, unit: "€" }
  ],
  out: v => { const soll = v.plan * v.m / 12, wird = v.ist / v.m * 12;
    return [["Soll bis heute", soll, "€"], ["Abweichung Soll-Ist", v.ist - soll, "€"], ["in %", (v.ist - soll) / soll * 100, "%"], ["Wird (Hochrechnung)", wird, "€", true], ["Abweichung Soll-Wird", wird - v.plan, "€"]]; },
  steps: v => { const soll = v.plan * v.m / 12, wird = v.ist / v.m * 12;
    return `Soll anteilig = ${eur(v.plan)} · ${v.m}/12 = ${eur(soll)}<br>Soll-Ist: ${eur(v.ist)} − ${eur(soll)} = <b>${eur(v.ist - soll)}</b> (${n2((v.ist - soll) / soll * 100, 1)} %)<br>
    Wird = Ist / Monate · 12 = ${eur(v.ist)} / ${v.m} · 12 = <b>${eur(wird)}</b> → Soll-Wird-Abweichung ${eur(wird - v.plan)}<br>
    Danach folgt die <b>Abweichungsanalyse</b> (Menge? Preis? Saison?) und eine Gegenmaßnahme oder Planrevision. Eine lineare Hochrechnung ignoriert Saisoneffekte: <b>Prämissenkontrolle</b> nicht vergessen.`; },
  plot: { x: [0, 12], xl: "Monat", yl: "€ kumuliert",
    fns: [{ label: "Soll (linear)", f: (x, v) => v.plan * x / 12 }, { label: "Ist", f: (x, v) => x <= v.m ? v.ist * x / v.m : NaN }, { label: "Wird (Hochrechnung)", f: (x, v) => x >= v.m ? v.ist / v.m * x : NaN }],
    points: v => [{ x: 12, y: v.ist / v.m * 12, label: "Wird" }], xfmt: n => n2(n, 0), yfmt: n => kf(n) }
};

/* ---------- Leitungsspanne und Leitungstiefe ---------- */
const span = (N, s) => { const lv = [Math.max(1, Math.round(N))]; s = Math.max(2, Math.round(s)); while (lv[lv.length - 1] > 1) lv.push(Math.ceil(lv[lv.length - 1] / s)); return lv; };
C["ufo-span"] = {
  title: "Leitungsspanne und Hierarchie",
  intro: "Wie viele Instanzen und Ebenen braucht man, wenn jede Instanz höchstens s Stellen direkt führt? Große Spanne → flach, kleine Spanne → steil.",
  inputs: [
    { k: "N", label: "Ausführungsstellen", v: 120, min: 2, max: 2000, step: 1, unit: "Stellen" },
    { k: "s", label: "Leitungsspanne s", v: 8, min: 2, max: 30, step: 1, unit: "" }
  ],
  out: v => { const lv = span(v.N, v.s), inst = lv.slice(1).reduce((a, b) => a + b, 0);
    return [["Hierarchieebenen (inkl. Ausführung)", lv.length, "", true], ["Leitungsebenen", lv.length - 1, ""], ["Instanzen gesamt", inst, ""], ["Stellen gesamt", lv.reduce((a, b) => a + b, 0), ""], ["Instanzen je 100 Ausführende", inst / Math.round(v.N) * 100, ""]]; },
  steps: v => { const lv = span(v.N, v.s), s = Math.max(2, Math.round(v.s));
    return lv.slice(1).map((n, i) => `Ebene ${i + 1} über der Ausführung: ⌈${lv[i]} / ${s}⌉ = <b>${n}</b> Instanz${n > 1 ? "en" : ""}`).join("<br>") + `<br>Leitungstiefe = ${lv.length} Ebenen (inkl. Ausführungsebene), ${lv.slice(1).reduce((a, b) => a + b, 0)} Instanzen.<br><span class='muted'>Vereinfachung: alle Instanzen schöpfen die Spanne voll aus, Stäbe sind nicht mitgezählt.</span>`; },
  plot: { bars: v => span(v.N, v.s).map((n, i, a) => ({ label: i === 0 ? "Ausführung" : i === a.length - 1 ? "Spitze" : "Ebene " + i, y: n })), yfmt: n => n2(n, 0) }
};

/* ---------- Vroom: Valenz × Instrumentalität × Erwartung ---------- */
C["ufo-vroom"] = {
  title: "VIE-Theorie nach Vroom: Was motiviert mehr?",
  intro: "Motivation = Valenz × Instrumentalität × Erwartung. Vergleich zweier Handlungsalternativen einer Mitarbeiterin. Ist ein Faktor null, ist die ganze Motivation null.",
  inputs: [
    { k: "ea", label: "A Projektleitung: Erwartung (Leistung schaffbar)", v: 0.7, min: 0, max: 1, step: 0.05, unit: "" },
    { k: "ia", label: "A: Instrumentalität (Leistung → Ergebnis)", v: 0.8, min: 0, max: 1, step: 0.05, unit: "" },
    { k: "va", label: "A: Valenz des Ergebnisses", v: 8, min: -10, max: 10, step: 1, unit: "" },
    { k: "eb", label: "B Zertifikatskurs: Erwartung", v: 0.9, min: 0, max: 1, step: 0.05, unit: "" },
    { k: "ib", label: "B: Instrumentalität", v: 0.3, min: 0, max: 1, step: 0.05, unit: "" },
    { k: "vb", label: "B: Valenz", v: 6, min: -10, max: 10, step: 1, unit: "" }
  ],
  out: v => { const A = v.ea * v.ia * v.va, B = v.eb * v.ib * v.vb; return [["Motivation A", A, ""], ["Motivation B", B, ""], ["stärker motiviert", Math.abs(A - B) < 1e-9 ? "gleich" : A > B ? "Alternative A" : "Alternative B", "", true]]; },
  steps: v => `M<sub>A</sub> = E · I · V = ${n2(v.ea)} · ${n2(v.ia)} · ${v.va} = <b>${n2(v.ea * v.ia * v.va)}</b><br>M<sub>B</sub> = ${n2(v.eb)} · ${n2(v.ib)} · ${v.vb} = <b>${n2(v.eb * v.ib * v.vb)}</b><br>
    Führungshebel: <b>E</b> erhöhen (Schulung, Ressourcen, realistische Ziele), <b>I</b> erhöhen (zugesagte Belohnung verlässlich einhalten), <b>V</b> beachten (nicht jede:r will dasselbe, vgl. Maslow/Herzberg).`,
  plot: { bars: v => [{ label: "A: E·I·V", y: v.ea * v.ia * v.va }, { label: "B: E·I·V", y: v.eb * v.ib * v.vb }], yfmt: n => n2(n, 2) }
};

/* ================= Animationen ================= */
const { svg, g, t, tl, r, box, l, p, c, dot } = FX;

/* 1 · Steuerung, Regelung, Lenkung */
FIG["ufo-fig-regel"] = { title: "Steuerung, Regelung und Lenkung",
  svg: () => svg(640, 300,
    box(20, 118, 100, 44, "Input") + l(120, 140, 248, 140, { arrow: true }) + box(250, 106, 150, 68, "Unternehmen|(System)", { cls: "fx-soft" }) + l(400, 140, 518, 140, { arrow: true }) + box(520, 118, 100, 44, "Output") +
    g({ on: "1,3" }, box(250, 14, 150, 44, "Störgröße|(z. B. Hitzewelle)", { cls: "fx-warn", fs: 11.5 }) + p("M325 58 V104", { cls: "dash", arrow: true }) +
      box(40, 14, 150, 44, "Steuerung", { cls: "fx-acc" }) + l(250, 36, 192, 36, { arrow: true, cls: "acc", acc: true }) + p("M115 58 C130 90 200 100 248 120", { cls: "acc", arrow: true, acc: true }) + t(150, 104, "Stellgröße vorab", { cls: "fx-sub", fs: 11 })) +
    g({ on: "2,3" }, p("M570 162 V250 H402", { cls: "acc", arrow: true, acc: true }) + box(250, 228, 150, 44, "Regler|Soll-Ist-Vergleich", { cls: "fx-acc", fs: 11.5 }) + p("M250 250 H70 V164", { cls: "acc", arrow: true, acc: true }) +
      t(486, 242, "Ist (Feedback)", { cls: "fx-sub", fs: 11 }) + t(160, 242, "Maßnahme", { cls: "fx-sub", fs: 11 }) + t(325, 292, "Sollgröße", { cls: "fx-sub", fs: 11 }) + dot("M570 162 V250 H402", { dur: 2 }))),
  steps: [
    "Grundmodell: Ein Input durchläuft das System Unternehmen und erzeugt einen Output (z. B. Umsatz, Produkte).",
    "<b>Steuerung</b> (Feedforward): Eine Störgröße wird <b>im Vorfeld</b> erkannt. Die Steuerung wirkt über eine Stellgröße ein, bevor die Störung wirkt. Beispiel: Wetterbericht meldet Hitzewelle → Eisdiele bestellt vorab mehr Milch. Keine Rückkopplung.",
    "<b>Regelung</b> (Feedback): Der Output wird gemessen, der Regler vergleicht Ist mit Soll und greift bei Abweichungen ein. Beispiel: Thermostat, monatlicher Soll-Ist-Vergleich. Wirkt erst nach der Störung.",
    "<b>Lenkung</b> = Kombination: Störungen werden vorab berücksichtigt <b>und</b> das Ergebnis kontrolliert. So arbeitet ein integriertes Planungs- und Kontrollsystem."
  ] };

/* 2 · Five Forces */
FIG["ufo-fig-forces"] = { title: "Porters Five Forces am Beispiel Musikstreaming",
  svg: () => svg(640, 300,
    box(240, 116, 160, 64, "Rivalität unter|bestehenden Anbietern", { cls: "fx-acc", fs: 12, hl: 1 }) +
    g({ st: 2 }, box(240, 12, 160, 54, "Bedrohung durch|neue Anbieter", { cls: "fx-warn", fs: 12, hl: 2 }) + l(320, 66, 320, 112, { arrow: true })) +
    g({ st: 3 }, box(240, 232, 160, 54, "Bedrohung durch|Ersatzprodukte", { cls: "fx-warn", fs: 12, hl: 3 }) + l(320, 232, 320, 184, { arrow: true })) +
    g({ st: 4 }, box(466, 116, 160, 64, "Verhandlungsmacht|der Abnehmer", { cls: "fx-info", fs: 12, hl: 4 }) + l(466, 148, 404, 148, { arrow: true })) +
    g({ st: 5 }, box(14, 116, 160, 64, "Verhandlungsmacht|der Lieferanten", { cls: "fx-info", fs: 12, hl: 5 }) + l(174, 148, 236, 148, { arrow: true })) +
    g({ st: 6 }, box(456, 236, 170, 46, "→ geringe Branchen-|attraktivität", { cls: "fx-bad", fs: 12 }))),
  steps: [
    "Die Five Forces erklären, wie attraktiv (profitabel) eine Branche ist. Je stärker die fünf Kräfte, desto geringer die Gewinnaussichten. Beispiel: Musikstreaming.",
    "<b>Rivalität</b>: wenige große Anbieter mit fast identischem Katalog, Preiskampf um Abos, Gratis-Probemonate. Hoch.",
    "<b>Neue Anbieter</b>: Eintrittsbarrieren sind Lizenzverträge mit Labels, Kapitalbedarf und Netzwerkeffekte (Playlists, Freunde). Mittel bis niedrig, außer große Tech-Konzerne.",
    "<b>Ersatzprodukte</b>: Videoplattformen mit Musik, Radio, Kauf-Downloads. Mittel.",
    "<b>Abnehmer</b>: Wechselkosten für Kund:innen sind gering (monatlich kündbar), Preise sind transparent. Hoch.",
    "<b>Lieferanten</b>: wenige große Musiklabels besitzen die Rechte an den meisten Titeln. Sehr hoch.",
    "Fazit: vier von fünf Kräften stark → niedrige Margen, obwohl der Markt wächst. Genau das sagt das Structure-Conduct-Performance-Paradigma: Die Branchenstruktur prägt Verhalten und Erfolg."
  ] };

/* 3 · BCG-Portfolio interaktiv */
const BX = rel => 80 + (Math.log10(Math.min(10, Math.max(0.1, rel))) + 1) / 2 * 480, BY = gr => 250 - (Math.min(25, Math.max(-5, gr)) + 5) / 30 * 220;
const bcgSvg = (ms, mc, gr, th) => { const rel = ms / mc, x = BX(rel), y = BY(gr), yt = BY(th);
  return svg(640, 290,
    r(80, 30, 240, yt - 30, { cls: "fx-warn", rx: 0 }) + r(320, 30, 240, yt - 30, { cls: "fx-ok", rx: 0 }) + r(80, yt, 240, 250 - yt, { cls: "fx-mute", rx: 0 }) + r(320, yt, 240, 250 - yt, { cls: "fx-info", rx: 0 }) +
    t(200, 50, "Question Marks", { fw: 700 }) + t(440, 50, "Stars", { fw: 700 }) + t(200, 244, "Poor Dogs", { fw: 700 }) + t(440, 244, "Cash Cows", { fw: 700 }) +
    [0.1, 0.3, 1, 3, 10].map(v => t(BX(v), 268, n2(v, 1), { cls: "fx-sub", fs: 10.5 })).join("") + t(560, 284, "relativer Marktanteil (log)", { a: "end", cls: "fx-sub", fs: 10.5 }) +
    [-5, 0, 10, 20].map(v => t(72, BY(v) + 4, v + " %", { a: "end", cls: "fx-sub", fs: 10.5 })).join("") + t(84, 22, "Marktwachstum", { a: "start", cls: "fx-sub", fs: 10.5 }) +
    c(x, y, 13, { cls: "fx-acc" }) + t(x, y + 4, "SGE", { cls: "fx-onacc", fs: 10, fw: 700 })); };
const bcgVal = (root, k) => { const e = root.querySelector(`input[data-b="${k}"]`); return e ? +e.value : 0; };
const bcgRange = (k, label, min, max, step, v) => `<label>${label}: <b data-bo="${k}">${v}</b><input type="range" data-b="${k}" min="${min}" max="${max}" step="${step}" value="${v}"></label>`;
FIG["ufo-fig-bcg"] = { title: "BCG-Portfolio: Wo steht die Geschäftseinheit?",
  svg: () => bcgSvg(12, 30, 14, 10),
  ui: () => bcgRange("ms", "eigener Marktanteil (%)", 1, 60, 1, 12) + bcgRange("mc", "Marktanteil größter Konkurrent (%)", 1, 60, 1, 30) + bcgRange("gr", "Marktwachstum (%)", -5, 25, 1, 14) + `<div class="fig-out" data-bo="r"></div>`,
  cap: "Relativer Marktanteil = eigener Marktanteil / Marktanteil des größten Konkurrenten (ist man selbst Marktführer: / Anteil des Zweitgrößten). Trennlinien hier: relativer Marktanteil 1, Marktwachstum 10 %.",
  update: root => { const ms = bcgVal(root, "ms"), mc = bcgVal(root, "mc"), gr = bcgVal(root, "gr"), rel = ms / mc, hi = gr >= 10, big = rel >= 1;
    const q = hi ? (big ? ["Star", "investieren, Position halten bzw. ausbauen"] : ["Question Mark", "selektiv investieren oder aufgeben"]) : (big ? ["Cash Cow", "abschöpfen („melken“), Mittel in Stars und Question Marks lenken"] : ["Poor Dog", "desinvestieren"]);
    root.querySelector(".fig-stage").innerHTML = bcgSvg(ms, mc, gr, 10);
    root.querySelectorAll("b[data-bo]").forEach(b => { b.textContent = root.querySelector(`input[data-b="${b.dataset.bo}"]`).value; });
    const o = root.querySelector('[data-bo="r"]'); if (o) o.innerHTML = `Relativer Marktanteil = ${ms} / ${mc} = <b>${n2(rel)}</b> · Wachstum ${gr} % → <b>${q[0]}</b>: ${q[1]}.`; } };

/* 4 · Leitungsspanne */
const spanTree = (N, s, on) => { const lv = span(N, s), Y = lv.map((_, i) => 262 - i * (222 / Math.max(1, lv.length - 1)));
  let xs = Array.from({ length: N }, (_, i) => 30 + i * (580 / (N - 1))), out = "";
  xs.forEach(x => { out += c(x, Y[0], 7, { cls: "fx-soft" }); });
  for (let i = 1; i < lv.length; i++) { const nx = [];
    for (let j = 0; j < lv[i]; j++) { const kids = xs.slice(j * s, j * s + s), px = kids.reduce((a, b) => a + b, 0) / kids.length; nx.push(px);
      kids.forEach(kx => { out += `<line x1="${px}" y1="${Y[i] + 8}" x2="${kx}" y2="${Y[i - 1] - 8}" class="fx-ln thin"/>`; }); }
    nx.forEach(x => { out += c(x, Y[i], 9, { cls: "fx-acc" }); }); xs = nx; }
  return g({ on }, out + t(620, 290, `Spanne ${s}: ${lv.length - 1} Leitungsebene${lv.length > 2 ? "n" : ""}, ${lv.slice(1).reduce((a, b) => a + b, 0)} Instanz${lv.length > 2 ? "en" : ""}`, { a: "end", fw: 700, fs: 12 })); };
FIG["ufo-fig-span"] = { title: "16 Ausführungsstellen, drei Leitungsspannen",
  svg: () => svg(640, 300, spanTree(16, 2, "0") + spanTree(16, 4, "1") + spanTree(16, 16, "2")),
  steps: [
    "<b>Leitungsspanne 2</b>: Jede Instanz führt nur zwei Stellen. Für 16 Ausführende braucht man 8 + 4 + 2 + 1 = 15 Instanzen auf 4 Ebenen. Steile Hierarchie: enge Führung, aber lange Dienstwege und hohe Führungskosten.",
    "<b>Leitungsspanne 4</b>: 4 + 1 = 5 Instanzen auf 2 Ebenen. Ein typischer Mittelweg.",
    "<b>Leitungsspanne 16</b>: eine Instanz führt alle direkt. Flache Hierarchie, kurze Wege, aber Gefahr der Überlastung. Funktioniert bei gleichartigen Aufgaben und selbstständigen Mitarbeitenden."
  ] };

/* 5 · Verhaltensgitter Blake/Mouton */
const GX = v => 90 + (v - 1) * 57.5, GY = v => 252 - (v - 1) * 27.5;
const gp = (x, y, lab, st, a = "start", dx = 12) => g({ st, hl: st }, c(GX(x), GY(y), 9, { cls: "fx-acc" }) + t(GX(x) + (a === "end" ? -dx : dx), GY(y) + 4, lab, { a, fw: 700, fs: 12 }));
FIG["ufo-fig-grid"] = { title: "Verhaltensgitter nach Blake/Mouton",
  svg: () => svg(640, 300,
    [1, 3, 5, 7, 9].map(v => `<line x1="${GX(v)}" y1="${GY(1)}" x2="${GX(v)}" y2="${GY(9)}" class="fx-ln thin"/><line x1="${GX(1)}" y1="${GY(v)}" x2="${GX(9)}" y2="${GY(v)}" class="fx-ln thin"/>` + t(GX(v), 272, v, { cls: "fx-sub", fs: 10.5 }) + t(78, GY(v) + 4, v, { a: "end", cls: "fx-sub", fs: 10.5 })).join("") +
    t(GX(9), 292, "Sachorientierung (Aufgabe) →", { a: "end", cls: "fx-sub", fs: 11 }) + t(GX(1), 14, "Menschenorientierung ↑", { a: "start", cls: "fx-sub", fs: 11 }) +
    gp(1, 1, "1.1 Überleben", 1) + gp(9, 1, "9.1 Befehl-Gehorsam", 2, "end") + gp(1, 9, "1.9 Glacéhandschuh", 3) + gp(5, 5, "5.5 Organisation", 4) + gp(9, 9, "9.9 Team", 5, "end")),
  steps: [
    "Zwei Dimensionen, je von 1 bis 9: <b>Sachorientierung</b> (x, erste Zahl) und <b>Menschenorientierung</b> (y, zweite Zahl).",
    "<b>1.1 Überlebensmanagement</b>: weder Aufgabe noch Menschen sind wichtig, minimaler Einsatz.",
    "<b>9.1 Befehl-Gehorsam</b>: maximale Sach-, minimale Menschenorientierung. Effizienz durch Kontrolle.",
    "<b>1.9 Glacéhandschuh</b> (Country Club): Harmonie und gutes Klima, die Leistung tritt zurück.",
    "<b>5.5 Organisationsmanagement</b>: Mittelweg, Kompromiss zwischen Leistung und Arbeitsmoral.",
    "<b>9.9 Team-Management</b>: hohe Leistung durch engagierte Menschen. Laut Blake/Mouton der Idealstil. Situative Modelle (Hersey/Blanchard) widersprechen der Idee eines einzigen Ideals."
  ] };

/* ================= Einbau ================= */
const ex = (title, html, label = "Beispiel aus der Praxis") => ({ t: "example", label, title, html });
const BL = {
  "ufo1-1": [ex("Ist die Bäckerei ums Eck ein Unternehmen?", `<p>Bäckerei Gruber in Graz, 25 Mitarbeitende, 3 Filialen. Prüfung entlang der Definition:</p>
    <ul><li><b>planvoll organisiert</b>: Backstube, Filialen, Schichtplan, Einkauf → ja</li>
    <li><b>Produktionsfaktoren kombiniert</b>: Arbeit (Bäcker:innen), Betriebsmittel (Öfen, Lieferwagen), Werkstoffe (Mehl, Butter) → ja</li>
    <li><b>über den eigenen Bedarf hinaus</b>: täglich ca. 4.000 Gebäckstücke für Kund:innen → ja</li></ul>
    <p>Nach Dillerup/Stoi: <b>Ziele</b> teilautonom (Familie Gruber entscheidet selbst über Wachstum), <b>Mitglieder</b> hierarchisch und sozial (Meister, Lehrlinge, Verkauf), <b>Aktivitäten</b> produktiv und offen (Rohstofflieferanten, Kund:innen, Lebensmittelaufsicht). Die Inhaberin führt <b>institutionell</b> (sie <i>ist</i> Führung) und <b>funktional</b> (sie gestaltet, lenkt und entwickelt, z. B. mit der Entscheidung für eine vierte Filiale).</p>`),
    { t: "check", q: "Eine Familie baut Gemüse ausschließlich für den eigenen Tisch an, planvoll und mit eigenem Werkzeug. Ist das ein Betrieb im Sinne der Definition?", opts: ["Ja, weil Produktionsfaktoren kombiniert werden", "Ja, weil es planvoll organisiert ist", "Nein, weil nicht über den eigenen Bedarf hinaus produziert und abgesetzt wird", "Nein, weil es nicht gewinnorientiert ist"], a: 2, why: "Fremdbedarfsdeckung ist Teil der Definition; Gewinnorientierung dagegen nicht (auch öffentliche Betriebe zählen)." }],
  "ufo1-2": [ex("Marktformen und SCP am Beispiel", `<table class='dt'><tr><th>Markt</th><th>Anbieter</th><th>Nachfrager</th><th>Marktform</th></tr>
    <tr><td>Mobilfunk in Österreich</td><td>wenige große Netzbetreiber</td><td>viele</td><td>Angebotsoligopol</td></tr>
    <tr><td>Kaffeehäuser in einer Großstadt</td><td>viele</td><td>viele</td><td>Polypol</td></tr>
    <tr><td>Kampfflugzeuge für ein Bundesheer</td><td>wenige Hersteller</td><td>ein Staat</td><td>beschränktes Nachfragemonopol</td></tr>
    <tr><td>Einziger Netzbetreiber einer Region</td><td>einer</td><td>viele</td><td>Angebotsmonopol</td></tr></table>
    <p><b>Structure → Conduct → Performance</b> im Mobilfunk: <i>Struktur</i>: hohe Eintrittsbarrieren (Frequenzlizenzen, Netzaufbau), wenige Anbieter. <i>Verhalten</i>: ähnliche Tarife, Kundenbindung über Verträge und Bündel. <i>Erfolg</i>: stabile Margen. Ein neuer Anbieter ohne eigenes Netz (Diskont-Marke) verändert die Struktur und drückt die Preise.</p>`),
    { t: "check", q: "Wenige Anbieter treffen auf wenige Nachfrager. Welche Marktform?", opts: ["Polypol", "Bilaterales Oligopol", "Angebotsoligopol", "Nachfrageoligopol"], a: 1, why: "Wenige × wenige = bilaterales Oligopol." }],
  "ufo1-3": [ex("VRIO-Check für eine Hörakustik-Kette", `<table class='dt'><tr><th>Ressource / Fähigkeit</th><th>V</th><th>R</th><th>I</th><th>O</th><th>Ergebnis</th></tr>
    <tr><td>Filialen in Einkaufszentren</td><td>ja</td><td>nein</td><td>–</td><td>–</td><td>Wettbewerbsparität</td></tr>
    <tr><td>Markenname</td><td>ja</td><td>ja</td><td>teilweise</td><td>ja</td><td>temporärer Vorteil</td></tr>
    <tr><td>Anpassungs-Know-how der Akustiker:innen + 20 Jahre Kundendaten</td><td>ja</td><td>ja</td><td>ja (pfadabhängig)</td><td>ja</td><td><b>nachhaltiger Vorteil</b></td></tr></table>
    <p>Die nachhaltigste Quelle ist eine <b>Fähigkeit</b> (organisationale Routinen, über Jahre gelernt), nicht ein materielles Gut. Genau das meint der fähigkeitsorientierte Ansatz: Erfolg aus der innovativen <b>Kombination</b> von Ressourcen.</p>`),
    { t: "check", q: "Welche Ressource ist nach dem RbV am ehesten Quelle eines nachhaltigen Wettbewerbsvorteils?", opts: ["Standard-Büroausstattung", "Eine über Jahre gewachsene, unternehmensspezifische Entwicklungsroutine", "Frei am Markt käufliche Software-Lizenzen", "Ein gemieteter Lagerplatz"], a: 1, why: "Selten, schwer imitierbar, pfadabhängig. Frei handelbare Ressourcen bringen keinen dauerhaften Vorsprung." }],
  "ufo1-4": [{ t: "fig", id: "ufo-fig-regel" }, { t: "calc", id: "ufo-rueck" },
    ex("Kausaldiagramm: Vorzeichen zählen", `<p>Schleife 1: Auftragsbestand →(+) Lieferzeit →(−) Auftragseingang →(+) Auftragsbestand. Eine (−)-Beziehung, also <b>ungerade</b> → <b>negative, ausgleichende</b> Rückkopplung.</p>
    <p>Schleife 2: Auftragsbestand →(+) Auslieferungen →(+) Bekanntheit →(+) Auftragseingang →(+) Auftragsbestand. Null (−)-Beziehungen, also <b>gerade</b> → <b>positive, verstärkende</b> Rückkopplung.</p>
    <p>Zahlen (Rechner oben): Start 100 Aufträge, Ziel 200, Anpassung 30 % → nach 12 Perioden 200 + (100 − 200) · 0,7<sup>12</sup> ≈ 198,6. Verstärkend mit 15 % → 100 · 1,15<sup>12</sup> ≈ 535, Verdopplung alle ≈ 5 Perioden. Real wirken beide Schleifen gleichzeitig, oft mit Verzögerung, daher Schwingungen.</p>`, "Beispiel durchgerechnet")],
  "ufo2-1": [ex("Ein E-Bike-Hersteller auf drei Ebenen", `<table class='dt'><tr><th>Entscheidung</th><th>Ebene</th><th>Begründung</th></tr>
    <tr><td>„Wir produzieren klimaneutral und zahlen in der Lieferkette faire Löhne.“</td><td>normativ</td><td>Werte, Legitimität, sehr hohe Bindung, dauerhaft</td></tr>
    <tr><td>Einstieg in Lastenräder für Lieferdienste bis 2028, Aufbau eigener Motorentwicklung</td><td>strategisch</td><td>neue Erfolgspotenziale, Richtungsentscheidung, langfristig</td></tr>
    <tr><td>Produktionsplan KW 12: 1.400 Räder, Zusatzschicht am Samstag</td><td>operativ</td><td>Effizienz, Einzelentscheidung, kurzfristig, klar strukturiert</td></tr>
    <tr><td>Einheitliches ERP für alle Werke (CIO-Vorgabe)</td><td>Funktionalführung</td><td>Querschnittsfunktion über alle Bereiche</td></tr></table>`),
    { t: "check", q: "„Ab 2027 verkaufen wir auch in Skandinavien.“ Welche Ebene und Aufgabe?", opts: ["normativ – Legitimität", "strategisch – Effektivität", "operativ – Effizienz", "normativ – Effizienz"], a: 1, why: "Erschließung neuer Erfolgspotenziale, langfristige Richtungsentscheidung." }],
  "ufo2-2": [{ t: "calc", id: "ufo-nwa" },
    ex("Der Führungsprozess an einer Standortentscheidung", `<ol><li><b>Planung</b>: <i>Ziel</i>: zweites Lager bis Q3, Lieferzeit Westösterreich &lt; 24 h. <i>Problemanalyse</i>: heute 48 h, 30 % Kund:innen im Westen. <i>Alternativen</i>: Standort A (Wels, günstig) und B (Innsbruck, nahe an Kund:innen). <i>Bewertung</i>: Nutzwertanalyse (Rechner oben): A 6,3 · B 6,5.</li>
    <li><b>Entscheidung</b>: Geschäftsführung wählt B. Hinweis aus der Sensitivität: Ab einem Kostengewicht von etwa 53 % würde A gewinnen, die Entscheidung ist also knapp.</li>
    <li><b>Steuerung</b>: Maßnahmen vorbereiten (Mietvertrag, Personalsuche), Team instruieren und motivieren.</li>
    <li><b>Umsetzung</b> (Ausführungssystem): Lager einrichten, Betrieb ab 1. Juli.</li>
    <li><b>Kontrolle</b>: Im Oktober Lieferzeit gemessen: 22 h (Soll erreicht), Kosten 8 % über Plan → Rückmeldung in die nächste Planung.</li></ol>`, "Beispiel durchgerechnet")],
  "ufo3-1": [ex("Vom Leitbild zur gelebten Kultur", `<p>IT-Dienstleister, 80 Mitarbeitende:</p>
    <ul><li><b>Vision</b>: „Bis 2030 der verlässlichste IT-Partner für Gesundheitseinrichtungen im Alpenraum.“</li>
    <li><b>Mission</b>: „Wir betreiben IT für Ordinationen und Pflegeheime so sicher, dass sich das Personal ganz um Patient:innen kümmern kann.“</li>
    <li><b>Werte</b>: Verlässlichkeit, Datenschutz, Respekt.</li></ul>
    <p>Kultur nach Schein: <i>Artefakt</i>: 24/7-Hotline mit Namensschild, Fehlerboard im Büro. <i>Bekundeter Wert</i>: „Fehler werden offen gemeldet.“ <i>Grundannahme</i> in der Praxis: Wer einen Fehler meldet, bekommt Ärger. Solange die Grundannahme dem bekundeten Wert widerspricht, bleibt das Leitbild Papier. Hebel: Führungskräfte melden eigene Fehler zuerst (Vorbild).</p>`),
    { t: "check", q: "„Wir wollen 2030 Marktführer in Europa sein.“ Das ist eine …", opts: ["Mission", "Vision", "Grundannahme", "Unternehmensverfassung"], a: 1, why: "Vision = langfristiges Zukunftsbild (Wo wollen wir hin?); Mission = Zweck (Warum gibt es uns?)." }],
  "ufo3-2": [{ t: "fig", id: "ufo-fig-forces" },
    ex("SWOT mit abgeleiteten Strategien: Fahrradgeschäft in Graz", `<table class='dt'><tr><th></th><th>Chancen: E-Bike-Boom, Förderungen, Radwegeausbau</th><th>Risiken: Online-Händler mit Kampfpreisen, Lieferengpässe</th></tr>
    <tr><td><b>Stärken</b>: Werkstatt mit 3 Meistern, Stammkundschaft</td><td><b>SO</b>: E-Bike-Service-Abos verkaufen, Förderberatung anbieten</td><td><b>ST</b>: Reparatur auch für online gekaufte Räder als Gegenangebot</td></tr>
    <tr><td><b>Schwächen</b>: kein Webshop, kleine Lagerfläche</td><td><b>WO</b>: Click-and-Collect aufbauen, um die Nachfrage zu nutzen</td><td><b>WT</b>: Sortiment straffen, Abhängigkeit von einem Lieferanten senken</td></tr></table>
    <p>Test für die Zuordnung: Kann das Geschäft den Faktor selbst beeinflussen? Ja → Stärke/Schwäche. Nein → Chance/Risiko.</p>`),
    { t: "check", q: "Für ein Fahrradgeschäft: „Die Stadt baut bis 2027 30 km neue Radwege.“ Wo gehört das in die SWOT?", opts: ["Stärke", "Schwäche", "Chance", "Risiko"], a: 2, why: "Extern (nicht selbst beeinflussbar) und positiv." }],
  "ufo3-3": [{ t: "fig", id: "ufo-fig-bcg" }, { t: "calc", id: "ufo-erfk" },
    ex("BCG-Portfolio eines Haushaltsgeräte-Herstellers", `<table class='dt'><tr><th>Geschäftseinheit</th><th>eigener MA</th><th>größter Konkurrent</th><th>rel. MA</th><th>Wachstum</th><th>Feld</th></tr>
    <tr><td>Waschmaschinen</td><td>28 %</td><td>14 % (Zweiter)</td><td>2,0</td><td>2 %</td><td>Cash Cow</td></tr>
    <tr><td>Saugroboter</td><td>9 %</td><td>30 %</td><td>0,3</td><td>18 %</td><td>Question Mark</td></tr>
    <tr><td>Wärmepumpen-Trockner</td><td>25 %</td><td>20 %</td><td>1,25</td><td>14 %</td><td>Star</td></tr>
    <tr><td>Bügeleisen</td><td>6 %</td><td>24 %</td><td>0,25</td><td>−1 %</td><td>Poor Dog</td></tr></table>
    <p>Bei den Waschmaschinen ist das Unternehmen Marktführer, darum wird durch den Zweitgrößten geteilt. Logik: Der Cashflow der Waschmaschinen finanziert Trockner (halten) und eine Entscheidung bei Saugrobotern (investieren oder aufgeben). Erfahrungskurve: Mit dem doppelten Volumen der Konkurrenz liegen die Stückkosten bei 80 % Lernrate um 20 % niedriger.</p>`, "Beispiel durchgerechnet")],
  "ufo4-1": [ex("Gegenstromverfahren in Zahlen", `<ol><li><b>Top-down</b>: Die Geschäftsführung gibt +10 % Umsatz vor: 5,0 Mio. € → 5,5 Mio. €.</li>
    <li><b>Bottom-up</b>: Die drei Vertriebsregionen planen 2,1 + 1,9 + 1,3 = 5,3 Mio. € (Region West rechnet mit einem neuen Konkurrenten).</li>
    <li><b>Abstimmung</b>: Lücke 0,2 Mio. €. Einigung auf 5,4 Mio. €, dafür bekommt West zusätzlich eine Vertriebsstelle (Budget 70.000 €).</li></ol>
    <p>Ergebnis: Ziele bleiben strategiekonform (top-down), sind aber realistisch und motivierend (bottom-up). Das Jahresbudget ist der in Geld bewertete, verbindliche Plan für jede Region. Bei <b>rollierender</b> Planung wird jedes Quartal ein weiteres Quartal angehängt.</p>`, "Beispiel durchgerechnet"),
    { t: "check", q: "Im Beispiel planen die Regionen 5,3 Mio. €, die Spitze wollte 5,5 Mio. €. Welches Planungsverfahren beschreibt die anschließende Einigung auf 5,4 Mio. €?", opts: ["Top-down", "Bottom-up", "Gegenstromverfahren", "Zero-Base-Budgeting"], a: 2, why: "Rahmen top-down, Details bottom-up, danach Abstimmung." }],
  "ufo4-2": [{ t: "calc", id: "ufo-soll" },
    ex("Eine kleine Balanced Scorecard mit Ursache-Wirkungs-Kette", `<table class='dt'><tr><th>Perspektive</th><th>Ziel</th><th>Kennzahl</th><th>Vorgabe</th><th>Maßnahme</th></tr>
    <tr><td>Lernen &amp; Entwicklung</td><td>Servicekompetenz stärken</td><td>Schulungstage je MA</td><td>4 / Jahr</td><td>Trainingsprogramm</td></tr>
    <tr><td>Interne Prozesse</td><td>Reklamationen schneller lösen</td><td>Durchlaufzeit Reklamation</td><td>&lt; 3 Tage</td><td>Ticketsystem</td></tr>
    <tr><td>Kunden</td><td>Kundenbindung</td><td>Wiederkaufrate</td><td>&gt; 60 %</td><td>Treueprogramm</td></tr>
    <tr><td>Finanzen</td><td>profitables Wachstum</td><td>Umsatzrendite</td><td>8 %</td><td>–</td></tr></table>
    <p>Kette: Schulung ↑ → Reklamationen schneller gelöst → Kund:innen kaufen wieder → Umsatz und Rendite ↑. Die drei unteren Zeilen sind <b>Frühindikatoren</b>, die Finanzkennzahl ist ein <b>Spätindikator</b>.</p>`)],
  "ufo5-1": [{ t: "fig", id: "ufo-fig-span" }, { t: "calc", id: "ufo-span" },
    ex("Wie viele Führungskräfte braucht ein Callcenter?", `<p>120 Agents (Ausführungsstellen). Vergleich dreier Leitungsspannen:</p>
    <table class='dt'><tr><th>Spanne</th><th>Ebene 1</th><th>Ebene 2</th><th>Ebene 3</th><th>Instanzen</th><th>Hierarchieebenen</th></tr>
    <tr><td>5</td><td>⌈120/5⌉ = 24</td><td>⌈24/5⌉ = 5</td><td>1</td><td>30</td><td>4</td></tr>
    <tr><td>8</td><td>15</td><td>2</td><td>1</td><td>18</td><td>4</td></tr>
    <tr><td>12</td><td>10</td><td>1</td><td>–</td><td>11</td><td>3</td></tr></table>
    <p>Bei 70.000 € pro Teamleitung kostet Spanne 5 gegenüber 12 rund 19 · 70.000 = 1,33 Mio. € mehr pro Jahr. Dafür betreut eine Teamleitung bei Spanne 12 doppelt so viele Agents. Gleichartige Aufgaben und gute Tools erlauben große Spannen.</p>`, "Beispiel durchgerechnet"),
    { t: "check", q: "64 Ausführungsstellen, Leitungsspanne 4. Wie viele Instanzen gibt es insgesamt?", opts: ["16", "20", "21", "64"], a: 2, why: "16 + 4 + 1 = 21 Instanzen auf 3 Leitungsebenen." }],
  "ufo5-2": [ex("Vom Funktional- zum Spartenmodell", `<p>Ein Hersteller von Hörsystemen wächst von 1 auf 3 Produktlinien (Hörgeräte, Gehörschutz, Diagnostikgeräte) und von 1 auf 5 Länder.</p>
    <ul><li><b>Vorher funktional</b>: Einkauf, Produktion, Vertrieb, F&amp;E. Jede Entscheidung über Gehörschutz muss über alle Funktionsleiter und die Geschäftsführung laufen → Überlastung der Spitze.</li>
    <li><b>Nachher divisional</b>: drei Sparten als Profit-Center mit eigener Ergebnisverantwortung. Preis: Jede Sparte baut eigene Vertriebs- und Entwicklungsteams auf (Doppelarbeit).</li>
    <li><b>Kompromiss</b>: zentrale Funktionen für Einkauf und IT (Skaleneffekte), Sparten für Produkt und Vertrieb. Zusätzliche Dimension Länder → Matrix (Sparte × Region) mit Mehrlinienprinzip.</li></ul>`),
    { t: "check", q: "Eine Stelle berichtet an den Produktmanager Hörgeräte und an die Länderleiterin Deutschland. Welches Leitungsprinzip liegt vor?", opts: ["Einliniensystem", "Stabliniensystem", "Mehrliniensystem (Matrix)", "Funktionale Organisation mit Einlinienprinzip"], a: 2, why: "Zwei gleichberechtigte Vorgesetzte = Mehrlinienprinzip." }],
  "ufo5-3": [ex("Durchlaufzeit zerlegt: eine Bestellung im Order-to-Cash", `<table class='dt'><tr><th>Schritt</th><th>Bearbeitung</th><th>Liege-/Transportzeit</th></tr>
    <tr><td>Auftrag erfassen (Vertrieb)</td><td>10 min</td><td>1 Tag im Postfach</td></tr><tr><td>Bonität prüfen (Buchhaltung)</td><td>5 min</td><td>2 Tage</td></tr>
    <tr><td>Kommissionieren (Lager)</td><td>20 min</td><td>1 Tag</td></tr><tr><td>Rechnung schreiben</td><td>5 min</td><td>1 Tag</td></tr></table>
    <p>Durchlaufzeit ≈ 5 Arbeitstage, reine Bearbeitung 40 Minuten, also rund <b>98 % Liegezeit an Schnittstellen</b>. Eine Prozessverantwortliche (Process Owner) über alle Abteilungen und eine automatische Bonitätsprüfung senken die Durchlaufzeit auf 1–2 Tage. Das zeigt den Kern der Prozessorganisation: Schnittstellen reduzieren. Zum Dilemma: Wollte das Lager voll ausgelastet sein, müssten Aufträge warten, bis sich eine Tour lohnt.</p>`, "Beispiel durchgerechnet"),
    { t: "check", q: "Welche Maßnahme passt zum Grundgedanken der Prozessorganisation?", opts: ["Jede Abteilung optimiert ihre eigene Auslastung", "Ein Process Owner verantwortet den Ablauf über Abteilungsgrenzen hinweg", "Mehr Stabsstellen einführen", "Die Leitungsspanne halbieren"], a: 1, why: "Structure follows process: Prozessverantwortung quer zu den Abteilungen, Schnittstellen reduzieren." }],
  "ufo6-1": [{ t: "calc", id: "ufo-vroom" },
    ex("Warum die Gehaltserhöhung verpufft", `<p>Softwareentwicklerin Lena bekommt +8 % Gehalt. Drei Monate später ist sie wieder unzufrieden und denkt an Kündigung.</p>
    <ul><li><b>Herzberg</b>: Gehalt ist ein Hygienefaktor. Die Erhöhung beseitigt Unzufriedenheit kurzfristig, schafft aber keine Zufriedenheit. Ihr fehlen Motivatoren: Verantwortung, interessante Aufgaben, Anerkennung.</li>
    <li><b>Maslow</b>: Physiologische Bedürfnisse und Sicherheit sind erfüllt. Wirksam ist jetzt Wertschätzung bzw. Selbstverwirklichung.</li>
    <li><b>Vroom</b>: Die angebotene Projektleitung hat für sie hohe Valenz (8), Erwartung 0,7, Instrumentalität 0,8 → M = 4,48. Ein Zertifikatskurs ohne Bezug zur Karriere: 0,9 · 0,3 · 6 = 1,62.</li>
    <li><b>Adams</b>: Erfährt sie, dass ein neuer Kollege mit weniger Erfahrung gleich viel verdient, kippt die Bilanz wieder.</li></ul>`)],
  "ufo6-2": [{ t: "fig", id: "ufo-fig-grid" },
    ex("Situativ führen: vier Mitarbeitende, vier Stile", `<table class='dt'><tr><th>Person</th><th>Reifegrad</th><th>Stil nach Hersey/Blanchard</th></tr>
    <tr><td>Neuer Lehrling, motiviert, aber ohne Fachwissen</td><td>R1</td><td><b>Telling</b>: genau unterweisen</td></tr>
    <tr><td>Junior nach 6 Monaten, kann einiges, ist frustriert</td><td>R2</td><td><b>Selling</b>: erklären, überzeugen</td></tr>
    <tr><td>Erfahrener Entwickler, kann alles, ist unsicher bei neuer Rolle</td><td>R3</td><td><b>Participating</b>: gemeinsam entscheiden</td></tr>
    <tr><td>Senior-Architektin, kompetent und motiviert</td><td>R4</td><td><b>Delegating</b>: Aufgabe samt Verantwortung übergeben</td></tr></table>
    <p>Dieselbe Führungskraft nutzt also vier Stile. Wer alle gleich führt (z. B. immer 9.9), über- oder unterfordert einen Teil des Teams.</p>`)],
  "ufo6-3": [ex("Business Model Canvas: Lern-App für Studierende", `<table class='dt'><tr><th>Baustein</th><th>Inhalt</th></tr>
    <tr><td>Kundensegmente</td><td>Studierende an FHs, Hochschulen als zahlende Partner</td></tr><tr><td>Wertangebot</td><td>Kursstoff als Lektionen, Quiz und Rechner, offline nutzbar</td></tr>
    <tr><td>Kanäle</td><td>App-Store, Hochschul-Moodle, Studierendenvertretung</td></tr><tr><td>Kundenbeziehungen</td><td>Self-Service, Community, Lernstreaks</td></tr>
    <tr><td>Einnahmequellen</td><td>Campus-Lizenz 4 € pro Studierender/Semester, Premium 3 €/Monat</td></tr><tr><td>Schlüsselressourcen</td><td>Lerninhalte, App-Plattform, Didaktik-Know-how</td></tr>
    <tr><td>Schlüsselaktivitäten</td><td>Inhalte erstellen, App weiterentwickeln</td></tr><tr><td>Schlüsselpartner</td><td>Lehrende, Hochschulen, Hosting-Anbieter</td></tr>
    <tr><td>Kostenstruktur</td><td>Personal Inhalte und Entwicklung, Hosting, Marketing</td></tr></table>
    <p><b>Punkte-Check der LV</b>: Exam 50/75 (66,7 %), Business Case 7/10 (70 %), Übungen 11/15 (73,3 %) → jedes Kriterium &gt; 60 %, positiv. Gegenbeispiel: Exam 44/75 = 58,7 % → negativ, auch wenn Business Case und Übungen voll sind.</p>`, "Beispiel aus der Praxis"),
    { t: "check", q: "Im Canvas der Lern-App: „Campus-Lizenz 4 € pro Studierender und Semester“ gehört zu …", opts: ["Kostenstruktur", "Einnahmequellen", "Kundenbeziehungen", "Schlüsselressourcen"], a: 1, why: "Revenue Streams: wie das Geschäftsmodell Wert erfasst." }]
};

const Q = (n, topic, q, opts, a, why) => ({ id: "px-ufo-" + n, topic, q, opts, a, why, ex: "" });
const QUESTIONS = [
 Q(1, "ufo-begriffe", "Ein städtisches Wasserwerk versorgt 200.000 Haushalte. Ist es ein Betrieb im Sinne der Vorlesung?", ["Nein, weil es öffentlich ist", "Ja: planvoll organisiert, Faktorkombination, Leistung über den Eigenbedarf hinaus (privat oder öffentlich)", "Nein, weil es nicht gewinnorientiert ist", "Nur wenn es an der Börse notiert"], 1, "Die Definition umfasst private und öffentliche Wirtschaftseinheiten."),
 Q(2, "ufo-begriffe", "Welche Zuordnung zu den Elementen eines Unternehmens (Dillerup/Stoi) stimmt?", ["Ziele – hierarchisch, sozial", "Mitglieder – produktiv, offen", "Aktivitäten – produktiv, offen", "Ziele – offen, produktiv"], 2, "Ziele: zielgerichtet, teilautonom · Mitglieder: hierarchisch, sozial · Aktivitäten: produktiv, offen."),
 Q(3, "ufo-begriffe", "„Die Geschäftsführung hat entschieden …“ bezieht sich auf Führung im …", ["funktionalen Sinn", "institutionellen Sinn", "instrumentellen Sinn", "systemtheoretischen Sinn"], 1, "Institutionell = Personen/Organe, die führen; funktional = Aufgaben und Handlungen."),
 Q(4, "ufo-begriffe", "„Teilautonom“ bei den Zielen eines Unternehmens bedeutet …", ["Es legt seine Ziele weitgehend selbst fest, innerhalb äußerer Grenzen (Recht, Markt)", "Der Staat gibt alle Ziele vor", "Es hat keine Ziele", "Nur Teilbereiche haben Ziele"], 0, "Weitgehend selbstbestimmt, aber nicht völlig unabhängig von der Umwelt."),
 Q(5, "ufo-begriffe", "Was ist KEIN Merkmal der Betriebsdefinition?", ["planvoll organisiert", "Kombination von Produktionsfaktoren", "Herstellung über den Eigenbedarf hinaus", "Gewinnmaximierung als Pflichtziel"], 3, "Auch öffentliche Betriebe ohne Gewinnmaximierung sind Betriebe."),
 Q(6, "ufo-io", "Drei große Mobilfunkanbieter, Millionen Kund:innen. Marktform?", ["Polypol", "Angebotsoligopol", "Nachfrageoligopol", "Bilaterales Monopol"], 1, "Wenige Anbieter, viele Nachfrager."),
 Q(7, "ufo-io", "Ein Staat ist einziger Käufer von U-Booten, drei Werften bieten an. Marktform?", ["Beschränktes Nachfragemonopol", "Angebotsmonopol", "Polypol", "Bilaterales Oligopol"], 0, "Ein Nachfrager, wenige Anbieter."),
 Q(8, "ufo-io", "Woraus entstehen laut Industrieökonomie nachhaltige Wettbewerbsvorteile?", ["Aus einzigartigen Ressourcen", "Aus Eintrittsbarrieren und der Branchenstruktur", "Aus Unternehmenskultur", "Aus Motivation der Mitarbeitenden"], 1, "Potenzielle Konkurrenten müssen Eintrittsbedingungen erfüllen; Eintrittsbarrieren schützen."),
 Q(9, "ufo-io", "Welche Perspektive beschreibt die Industrieökonomie?", ["Inside-out", "Outside-in", "Bottom-up", "Situativ"], 1, "Market-based View: Erfolg von außen (Branche) erklärt; RbV = inside-out."),
 Q(10, "ufo-io", "Was erklärt die Transaktionskostentheorie?", ["Ob eine Leistung über den Markt oder im Unternehmen (Hierarchie) koordiniert wird", "Wie Bedürfnisse aufeinander aufbauen", "Wie Portfolios zu bewerten sind", "Welche Führungsstile es gibt"], 0, "Make or Buy je nach Kosten der Anbahnung, Vereinbarung, Abwicklung, Kontrolle, Anpassung."),
 Q(11, "ufo-rbv", "Wer begründete den Resource-based View (1959)?", ["Porter", "Penrose", "Fayol", "Taylor"], 1, "Penrose: Unternehmen als Bündel von Ressourcen."),
 Q(12, "ufo-rbv", "Was ergänzt der fähigkeitsorientierte Ansatz gegenüber dem reinen RbV?", ["Erfolg aus der innovativen Kombination von Ressourcen", "Erfolg allein aus der Branchenstruktur", "Gleich verteilte Ressourcen", "Rationale Manager"], 0, "Capability-based View: nicht nur Besitz, sondern Kombination und Anwendung."),
 Q(13, "ufo-rbv", "Welche Ressource ist nach VRIO am schwersten zu imitieren?", ["Leasing-Fuhrpark", "Standardsoftware", "Über Jahre gewachsene Unternehmenskultur und Routinen", "Büroflächen in Bestlage"], 2, "Immaterielle, pfadabhängige Ressourcen sind schwer imitierbar."),
 Q(14, "ufo-rbv", "Welches Merkmal gehört NICHT zu den Charakteristika von Fähigkeiten laut Folie?", ["organisationale Routinen", "normative Verankerung", "pfadabhängige Entwicklung", "freie Handelbarkeit am Markt"], 3, "Routinen, normative Verankerung, Pfadabhängigkeit, dynamische Anpassung."),
 Q(15, "ufo-rbv", "Wie heißt das Paradigma des ressourcenorientierten Ansatzes?", ["Structure-Conduct-Performance", "Resources-Conduct-Performance", "Strategy-follows-Structure", "Plan-Do-Check-Act"], 1, "Besondere Ressourcen → Effizienzvorteile → Erfolg."),
 Q(16, "ufo-system", "Ein Kreis enthält die Beziehungen (+), (−), (−). Welche Rückkopplung?", ["Negativ (ausgleichend)", "Positiv (verstärkend)", "Keine Rückkopplung", "Steuerung"], 1, "Gerade Anzahl (−) → positive, verstärkende Schleife."),
 Q(17, "ufo-system", "Negative Rückkopplung: Startwert 100, Zielwert 200, Anpassung 50 % je Periode. Wert nach 2 Perioden?", ["150", "175", "200", "125"], 1, "100 → 150 → 175 (jeweils die Hälfte der Lücke wird geschlossen)."),
 Q(18, "ufo-system", "Ein Unternehmen sichert vor einem Exportgeschäft den Wechselkurs ab. Prinzip?", ["Regelung", "Steuerung", "Positive Rückkopplung", "Atomistische Sicht"], 1, "Die Störgröße wird im Vorfeld berücksichtigt."),
 Q(19, "ufo-system", "Welche Sichtweise analysiert die Zusammenhänge des Gesamtsystems?", ["Atomistisch", "Holistisch", "Mechanistisch", "Linear"], 1, "Holistisch: Gesamtsystem, Zusammenhänge, Integration."),
 Q(20, "ufo-system", "Warum sind Kausalketten in Unternehmen nicht linear?", ["Weil Menschen handeln und intensiver Austausch mit der Umwelt besteht; Rückkopplungen vernetzen das System", "Weil es keine Ursachen gibt", "Weil Unternehmen mechanistische Systeme sind", "Weil Kausalität nur in der Physik gilt"], 0, "Soziale, komplexe Systeme mit Rückkopplungen."),
 Q(21, "ufo-ebenen", "Welche Zielgröße gehört zur operativen Ebene?", ["Überlebensfähigkeit", "Erfolgspotenziale", "Wirtschaftlichkeit, Gewinn, Rentabilität", "Legitimität"], 2, "Operativ = Ausschöpfung bestehender Potenziale (Effizienz)."),
 Q(22, "ufo-ebenen", "Welche Ebene hat die höchste Bindungswirkung?", ["Operativ", "Strategisch", "Normativ", "Alle gleich"], 2, "Normativ: sehr hoch, dauerhaft angelegt."),
 Q(23, "ufo-ebenen", "Ein Spartenleiter plant Strategie und Tagesgeschäft seiner Sparte. Horizontal betrachtet ist das …", ["Unternehmensführung (General Management)", "Bereichsführung", "Funktionalführung", "Normative Führung"], 1, "Bereichsführung führt einen Teil (Sparte) strategisch und operativ."),
 Q(24, "ufo-ebenen", "„Die Dinge richtig tun“ beschreibt …", ["Legitimität (normativ)", "Effektivität (strategisch)", "Effizienz (operativ)", "Kontrolle"], 2, "Strategisch = die richtigen Dinge tun, operativ = die Dinge richtig tun."),
 Q(25, "ufo-ebenen", "Welche Entscheidungsart passt zur strategischen Ebene?", ["Grundsatzentscheidungen", "Richtungsentscheidungen", "Einzelentscheidungen", "Routineentscheidungen"], 1, "Normativ: Grundsatz · strategisch: Richtung · operativ: Einzel."),
 Q(26, "ufo-prozess", "Nutzwertanalyse: Gewichte 50/30/20 %, Punkte 8, 5, 4. Nutzwert?", ["5,7", "6,3", "6,5", "17"], 1, "0,5·8 + 0,3·5 + 0,2·4 = 4 + 1,5 + 0,8 = 6,3."),
 Q(27, "ufo-prozess", "In welche Phase des Führungsprozesses gehört die Alternativenbewertung?", ["Planung", "Entscheidung", "Steuerung", "Kontrolle"], 0, "Planung i. w. S.: Zielbildung, Problemanalyse, Alternativensuche, Alternativenbewertung."),
 Q(28, "ufo-prozess", "Welche Phase gehört zum Ausführungssystem, nicht zur Führung?", ["Planung", "Steuerung", "Umsetzung", "Kontrolle"], 2, "Umsetzung = Maßnahmendurchführung und Ergebniserreichung."),
 Q(29, "ufo-prozess", "„Gestalten“ ist laut Folie Voraussetzung für …", ["Lenkung", "Kontrolle", "Personal", "Information"], 0, "Gestalten: Aufbau von Führungskreisläufen; ermöglicht Lenkung."),
 Q(30, "ufo-prozess", "Im St. Galler Modell gehört die Unternehmenskultur zur Ebene/Dimension …", ["strategisch – Strukturen", "normativ – Verhalten", "operativ – Aktivitäten", "normativ – Aktivitäten"], 1, "Normativ: Verfassung (Strukturen), Politik (Aktivitäten), Kultur (Verhalten)."),
 Q(31, "ufo-normativ", "Welche Ebene der Unternehmenskultur nach Schein ist am schwersten zu verändern?", ["Artefakte", "Bekundete Werte", "Grundannahmen", "Logos"], 2, "Unbewusst und selbstverständlich."),
 Q(32, "ufo-normativ", "„Wir machen Hören für alle Menschen leistbar.“ Das ist am ehesten eine …", ["Vision", "Mission", "Strategie", "Budgetvorgabe"], 1, "Zweck und Auftrag: warum es uns gibt, für wen wir Nutzen stiften."),
 Q(33, "ufo-normativ", "Was regelt die Unternehmensverfassung?", ["Den Werbeauftritt", "Rechtsform, Organe, Kompetenzen und Kontrollrechte", "Die Produktionsplanung", "Die Gehaltsbänder"], 1, "Rechtlicher und organisatorischer Rahmen; heute Corporate Governance."),
 Q(34, "ufo-normativ", "Der Stakeholder-Ansatz bedeutet …", ["Führung nur im Interesse der Eigentümer", "Berücksichtigung aller Anspruchsgruppen", "Maximierung des Aktienkurses", "Verzicht auf Gewinn"], 1, "Mitarbeitende, Kund:innen, Lieferanten, Fremdkapitalgeber, Staat, Öffentlichkeit."),
 Q(35, "ufo-normativ", "Ein Code of Conduct ist nach Schein …", ["ein Artefakt", "ein bekundeter Wert", "eine Grundannahme", "eine Strategie"], 1, "Schriftlich formulierte Normen und Standards."),
 Q(36, "ufo-stratana", "Welche Kraft steigt, wenn Kund:innen fast ohne Kosten zum Konkurrenten wechseln können?", ["Verhandlungsmacht der Lieferanten", "Verhandlungsmacht der Abnehmer", "Bedrohung durch Ersatzprodukte", "Eintrittsbarrieren"], 1, "Geringe Wechselkosten stärken die Abnehmer."),
 Q(37, "ufo-stratana", "Welche Strategie folgt aus „Stärke + Chance“ in der SWOT-Matrix?", ["WT: vermeiden", "ST: absichern", "SO: Ausbau, Stärken nutzen, um Chancen zu ergreifen", "WO: aufholen"], 2, "SO = Ausbaustrategie."),
 Q(38, "ufo-stratana", "Eine neue EU-Verordnung verteuert die Produktion. In PESTEL gehört das zu …", ["Social", "Legal", "Technological", "Economic"], 1, "Rechtliche Rahmenbedingungen (teils auch Political)."),
 Q(39, "ufo-stratana", "Welche Aktivität ist in Porters Wertkette eine unterstützende Aktivität?", ["Eingangslogistik", "Marketing & Vertrieb", "Technologieentwicklung", "Kundendienst"], 2, "Unterstützend: Infrastruktur, Personal, Technologieentwicklung, Beschaffung."),
 Q(40, "ufo-stratana", "Welcher Faktor ist eine Eintrittsbarriere?", ["Geringer Kapitalbedarf", "Starke Netzwerkeffekte etablierter Anbieter", "Niedrige Wechselkosten", "Viele Vertriebskanäle für alle"], 1, "Netzwerkeffekte, Skaleneffekte, Kapitalbedarf, Markentreue, Regulierung."),
 Q(41, "ufo-strategie", "Eigener Marktanteil 10 %, größter Konkurrent 25 %, Marktwachstum 15 %. BCG-Feld?", ["Star", "Question Mark", "Cash Cow", "Poor Dog"], 1, "Relativer MA = 0,4 (< 1), hohes Wachstum → Question Mark."),
 Q(42, "ufo-strategie", "Ein Unternehmen ist Marktführer mit 30 %, der Zweite hat 20 %. Relativer Marktanteil?", ["0,67", "1,5", "30 %", "0,3"], 1, "Als Marktführer wird durch den Zweitgrößten geteilt: 30 / 20 = 1,5."),
 Q(43, "ufo-strategie", "Lernrate 80 %: Die Stückkosten liegen bei 100 €. Wie hoch sind sie nach zweimaliger Verdopplung der kumulierten Menge?", ["80 €", "64 €", "60 €", "51,20 €"], 1, "100 · 0,8 · 0,8 = 64 €."),
 Q(44, "ufo-strategie", "Ein Getränkehersteller bringt eine Kaffeemaschine für Büros auf den Markt (neues Produkt, neuer Markt). Ansoff?", ["Marktdurchdringung", "Marktentwicklung", "Produktentwicklung", "Diversifikation"], 3, "Neues Produkt in neuem Markt = Diversifikation, höchstes Risiko."),
 Q(45, "ufo-strategie", "Was bedeutet „Stuck in the Middle“ nach Porter?", ["Weder Kostenvorteil noch Differenzierung wird klar erreicht", "Fokus auf eine Nische", "Gleichzeitige Marktführerschaft in allen Segmenten", "Mittlere Unternehmensgröße"], 0, "Schwache Wettbewerbsposition zwischen den Grundstrategien."),
 Q(46, "ufo-planung", "Welcher Plan ist am detailliertesten und quantitativ?", ["Strategischer Plan", "Taktischer Plan", "Operativer Plan (Budgets)", "Leitbild"], 2, "Operativ: kurzfristig, detailliert, Maßnahmen, Mengen, Termine."),
 Q(47, "ufo-planung", "Bei Zero-Base-Budgeting wird …", ["das Vorjahresbudget fortgeschrieben", "jedes Budget von null an begründet", "auf Budgets verzichtet", "nur top-down geplant"], 1, "Jede Position muss neu gerechtfertigt werden."),
 Q(48, "ufo-planung", "Was ist ein Budget?", ["Ein in Geld bewerteter Plan für einen Verantwortungsbereich und eine Periode mit Verbindlichkeit", "Eine Strategie", "Eine Kennzahl der BSC", "Ein Organigramm"], 0, "Zentrales Instrument der operativen Führung."),
 Q(49, "ufo-planung", "Welcher Vorteil wird der Top-down-Planung zugeschrieben?", ["Hohe Motivation der Basis", "Konsistenz mit der Strategie", "Realistische Detailwerte", "Keine Abstimmung nötig"], 1, "Konsistent, aber wenig Wissen und Motivation der Basis."),
 Q(50, "ufo-planung", "Planung wird jedes Quartal um ein Quartal fortgeschrieben. Wie heißt das?", ["Blockplanung", "Rollierende Planung", "Gegenstromverfahren", "Retrograde Planung"], 1, "Rollierend: regelmäßige Fortschreibung."),
 Q(51, "ufo-kontrolle", "Jahresplan 1,2 Mio. €, nach 5 Monaten Ist 450.000 €. Lineare Hochrechnung (Wird)?", ["1,08 Mio. €", "1,2 Mio. €", "900.000 €", "1,35 Mio. €"], 0, "450.000 / 5 · 12 = 1.080.000 €."),
 Q(52, "ufo-kontrolle", "Gleiche Zahlen: Soll-Ist-Abweichung nach 5 Monaten?", ["−50.000 € (−10 %)", "−120.000 €", "+50.000 €", "−750.000 €"], 0, "Soll anteilig 500.000 €, Ist 450.000 € → −50.000 € = −10 %."),
 Q(53, "ufo-kontrolle", "Ein Unternehmen prüft, ob der angenommene Wechselkurs der Planung noch gilt. Kontrollart?", ["Ergebniskontrolle", "Planfortschrittskontrolle", "Prämissenkontrolle", "Revision"], 2, "Gelten die Planannahmen noch?"),
 Q(54, "ufo-kontrolle", "Welche Kennzahl ist ein Frühindikator in der BSC?", ["Eigenkapitalrentabilität", "Jahresgewinn", "Weiterbildungstage je Mitarbeiter:in", "Cashflow"], 2, "Nicht-finanzielle Kennzahlen der Lern- und Prozessperspektive wirken vorlaufend."),
 Q(55, "ufo-kontrolle", "Wer trägt im Controlling-Verständnis die Ergebnisverantwortung?", ["Controller:innen", "Manager:innen", "Wirtschaftsprüfer", "Interne Revision"], 1, "Manager: Ergebnisverantwortung · Controller: Transparenzverantwortung."),
 Q(56, "ufo-aufbau", "120 Ausführungsstellen, Leitungsspanne 8. Wie viele Instanzen auf der ersten Leitungsebene?", ["8", "15", "12", "960"], 1, "⌈120 / 8⌉ = 15."),
 Q(57, "ufo-aufbau", "Gleiche Zahlen: Wie viele Instanzen insgesamt (Spanne 8 auf allen Ebenen)?", ["15", "17", "18", "16"], 2, "15 + ⌈15/8⌉ = 2 + 1 = 18."),
 Q(58, "ufo-aufbau", "Eine Rechtsabteilung berät den Vorstand, darf aber keine Weisungen erteilen. Das ist eine …", ["Instanz", "Stabsstelle", "Ausführungsstelle", "Sparte"], 1, "Stab: Beratung ohne Weisungsrecht."),
 Q(59, "ufo-aufbau", "Ein Teamleiter soll für ein Budget verantwortlich sein, darf aber keine Ausgaben freigeben. Welches Prinzip ist verletzt?", ["Substitutionsprinzip", "Kongruenzprinzip", "Einlinienprinzip", "Objektprinzip"], 1, "Aufgabe, Kompetenz und Verantwortung müssen übereinstimmen."),
 Q(60, "ufo-aufbau", "Gliederung der 2. Ebene nach Regionen (Österreich, Deutschland, Schweiz) folgt dem …", ["Verrichtungsprinzip", "Objektprinzip", "Mehrlinienprinzip", "Stabsprinzip"], 1, "Objekt = Produkt, Region oder Kundengruppe → divisional."),
 Q(61, "ufo-aufbau", "Welche Organisationsform passt am besten zu einem kleinen Unternehmen mit homogenem Produktprogramm?", ["Funktionale Organisation", "Spartenorganisation", "Tensororganisation", "Holding"], 0, "Spezialisierung und Skaleneffekte, Koordinationsbedarf bleibt überschaubar."),
 Q(62, "ufo-ablauf", "Ein Auftrag braucht 5 Tage Durchlaufzeit, die Bearbeitung dauert insgesamt 40 Minuten. Was ist der größte Hebel?", ["Schneller tippen", "Liege- und Wartezeiten an Schnittstellen reduzieren", "Mehr Kontrollen einbauen", "Die Leitungsspanne erhöhen"], 1, "Fast die gesamte Durchlaufzeit ist Liegezeit an Schnittstellen."),
 Q(63, "ufo-ablauf", "Welcher Prozess ist ein Managementprozess?", ["Auftragsabwicklung", "Gehaltsabrechnung", "Strategieplanung und Controlling-Reporting", "Kundenservice"], 2, "Managementprozesse steuern das Unternehmen."),
 Q(64, "ufo-ablauf", "„Structure follows process“ bedeutet …", ["Erst die Abteilungen, dann die Abläufe", "Die Struktur richtet sich nach den Geschäftsprozessen", "Prozesse folgen dem Organigramm", "Strategie folgt der Struktur"], 1, "Prozessorganisation: Abläufe im Mittelpunkt."),
 Q(65, "ufo-ablauf", "Was unterscheidet BPR von KVP?", ["BPR: radikale Neugestaltung · KVP: kontinuierliche kleine Verbesserungen", "BPR ist japanisch, KVP amerikanisch", "Beide sind identisch", "KVP ist radikaler"], 0, "Hammer/Champy vs. Kaizen."),
 Q(66, "ufo-ablauf", "In einer EPK folgt auf ein Ereignis …", ["immer ein Ereignis", "eine Funktion", "ein Pool", "eine Lane"], 1, "Ereignis – Funktion – Ereignis, verbunden über Konnektoren."),
 Q(67, "ufo-motivation", "Vroom: Erwartung 0,5, Instrumentalität 0,8, Valenz 10. Motivation?", ["4", "8", "5", "10,3"], 0, "0,5 · 0,8 · 10 = 4."),
 Q(68, "ufo-motivation", "Vroom: Eine Mitarbeiterin glaubt nicht, dass die Leistung überhaupt schaffbar ist (E = 0). Folge?", ["Motivation ist trotzdem hoch, wenn die Valenz hoch ist", "Motivation ist null", "Motivation halbiert sich", "Nur die Instrumentalität zählt"], 1, "Multiplikative Verknüpfung: ein Faktor null → Motivation null."),
 Q(69, "ufo-motivation", "Was beschreibt die Gleichheitstheorie nach Adams?", ["Bedürfnisse bauen stufenweise aufeinander auf", "Menschen vergleichen ihr Input-Output-Verhältnis mit dem anderer", "Hygienefaktoren und Motivatoren", "Theorie X und Y"], 1, "Wahrgenommene Ungerechtigkeit senkt die Motivation."),
 Q(70, "ufo-motivation", "Welcher Faktor ist nach Herzberg ein Motivator?", ["Arbeitsplatzsicherheit", "Gehalt", "Verantwortung", "Unternehmenspolitik"], 2, "Motivatoren: Leistung, Anerkennung, Arbeitsinhalt, Verantwortung, Aufstieg."),
 Q(71, "ufo-motivation", "Eine Führungskraft geht davon aus, dass Mitarbeitende Verantwortung suchen. Das entspricht …", ["Theorie X", "Theorie Y", "Hygienefaktoren", "Defizitbedürfnissen"], 1, "McGregor: Y = leistungsbereit, X = arbeitsscheu."),
 Q(72, "ufo-fuehrung", "Im Verhaltensgitter steht 1.9 für …", ["Befehl-Gehorsam", "Glacéhandschuh (Country Club)", "Team-Management", "Überlebensmanagement"], 1, "Erste Zahl Sach-, zweite Menschenorientierung: 1 Sache, 9 Mensch."),
 Q(73, "ufo-fuehrung", "Ein motivierter Berufseinsteiger ohne Fachwissen braucht nach Hersey/Blanchard …", ["Delegating", "Participating", "Telling", "Laissez-faire"], 2, "Niedriger Reifegrad (R1) → genaue Unterweisung."),
 Q(74, "ufo-fuehrung", "Führung über Ausnahmen: Die Vorgesetzte greift nur bei Abweichungen über einer Toleranzgrenze ein.", ["Management by Objectives", "Management by Exception", "Management by Delegation", "Transformationale Führung"], 1, "MbE: Eingriff nur bei Ausnahmen."),
 Q(75, "ufo-fuehrung", "Welche Aussage passt zur transformationalen Führung?", ["Leistung gegen Belohnung tauschen", "Begeistern durch Vision, Vorbild und individuelle Förderung", "Gruppe sich selbst überlassen", "Strikte Kontrolle"], 1, "Die „4 I“: idealized influence, inspirational motivation, intellectual stimulation, individualized consideration."),
 Q(76, "ufo-fuehrung", "Im Kontinuum nach Tannenbaum/Schmidt nimmt von links nach rechts zu …", ["die Kontrolle durch die Vorgesetzten", "der Entscheidungsspielraum der Mitarbeitenden", "die Zahl der Hierarchieebenen", "das Gehalt"], 1, "Von autoritär bis autonom."),
 Q(77, "ufo-bm", "Welche Seite des Canvas beschreibt die Effizienz/Infrastruktur?", ["Rechte Seite (Kunden)", "Linke Seite (Partner, Aktivitäten, Ressourcen, Kosten)", "Nur das Wertangebot", "Nur die Kanäle"], 1, "Rechts: Kunden/Wert, links: Infrastruktur/Effizienz."),
 Q(78, "ufo-bm", "Exam 46/75, Business Case 9/10, Übungen 14/15. Ist die LV positiv?", ["Nein, das Exam braucht mindestens 65 %", "Nein, die Gesamtsumme muss über 75 Punkten liegen", "Ja, alle Kriterien liegen über 60 %", "Nein, der Business Case zählt doppelt"], 2, "46/75 = 61,3 %, 90 %, 93 %: jedes Kriterium > 60 %."),
 Q(79, "ufo-bm", "Was unterscheidet einen Business Case vom Geschäftsmodell?", ["Nichts", "Der Business Case bewertet eine konkrete Entscheidung (Alternativen, Nutzen/Kosten, Risiken, Empfehlung)", "Der Business Case hat 9 Bausteine", "Das Geschäftsmodell enthält immer eine Kapitalwertrechnung"], 1, "Geschäftsmodell = wie Wert geschaffen, vermittelt, erfasst wird; Business Case = Begründung einer Entscheidung."),
 Q(80, "ufo-bm", "„Wartungsverträge mit monatlicher Pauschale“ gehören im Canvas zu …", ["Schlüsselaktivitäten", "Einnahmequellen", "Kundensegmenten", "Kostenstruktur"], 1, "Revenue Streams."),
 Q(81, "ufo-bm", "Was ist bei KI-Nutzung im Business Case laut LV zu dokumentieren?", ["Nichts", "Systeme, wesentliche Prompts und eine Erklärung zur Eigenleistung", "Nur der Name der KI", "Die KI-Antworten müssen gelöscht werden"], 1, "Kennzeichnungspflicht; im Exam ist KI verboten.")
];

const FLASH = [
 ["Negative vs. positive Rückkopplung", "Negativ (ausgleichend): ungerade Anzahl (−) im Kreis, pendelt sich um Zielwert ein · Positiv (verstärkend): gerade Anzahl, exponentielles Wachstum oder Abwärtsspirale", "ufo-system"],
 ["Nutzwertanalyse", "N = Σ Gewicht × Teilnutzen (Gewichte = 100 %) · K.-o.-Kriterien vorher · Sensitivität: bei welchem Gewicht kippt die Rangfolge?", "ufo-prozess"],
 ["Relativer Marktanteil (BCG)", "Eigener Marktanteil / Anteil des größten Konkurrenten (als Marktführer: / Zweitgrößter) · ≥ 1 = hoch · y-Achse: Marktwachstum", "ufo-strategie"],
 ["Erfahrungskurve", "Je Verdopplung der kumulierten Menge sinken die Stückkosten um (1 − Lernrate), z. B. 20 % bei 80 % · c(x) = c₁ · x^(−b), b = −log₂(L)", "ufo-strategie"],
 ["Soll-Ist vs. Soll-Wird", "Soll-Ist: Ergebniskontrolle (nachher) · Soll-Wird: Planfortschrittskontrolle mit Hochrechnung (während) · Prämissenkontrolle: gelten die Annahmen noch?", "ufo-kontrolle"],
 ["Leitungsspanne rechnen", "Instanzen je Ebene = ⌈Stellen der Ebene darunter / Spanne⌉ bis 1 · Bsp. 120 / 8 → 15 → 2 → 1 = 18 Instanzen", "ufo-aufbau"],
 ["Kongruenzprinzip", "Aufgabe, Kompetenz und Verantwortung einer Stelle müssen übereinstimmen", "ufo-aufbau"],
 ["VIE-Theorie (Vroom)", "Motivation = Valenz × Instrumentalität × Erwartung · ein Faktor null → keine Motivation", "ufo-motivation"],
 ["Verhaltensgitter Blake/Mouton", "x: Sach-, y: Menschenorientierung (1–9) · 1.1 Überleben · 9.1 Befehl-Gehorsam · 1.9 Glacéhandschuh · 5.5 Organisation · 9.9 Team (Ideal)", "ufo-fuehrung"],
 ["Steuerung, Regelung, Lenkung", "Steuerung: Störgröße vorab, Feedforward · Regelung: Output messen, Soll-Ist, Feedback · Lenkung: beides kombiniert", "ufo-system"],
 ["SWOT-Strategien", "SO Ausbau · ST Absicherung · WO Aufholen · WT Vermeiden/Rückzug · intern = beeinflussbar (S/W), extern = nicht (O/T)", "ufo-stratana"],
 ["Durchlaufzeit", "Bearbeitungs- + Transport- + Liegezeit · Liegezeit an Schnittstellen dominiert oft · Dilemma: kurze Durchlaufzeit vs. hohe Auslastung", "ufo-ablauf"]
];

window.STUDYOS_EXT = window.STUDYOS_EXT || {};
(window.STUDYOS_EXT.ufo = window.STUDYOS_EXT.ufo || []).push({ id: "ufo-plus", blocks: BL, questions: QUESTIONS, flashcards: FLASH });
})();
