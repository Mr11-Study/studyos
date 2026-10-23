/* BWL 2 · Prüfungs-Update (4.37): neue Animationen und Schieberegler-Grafiken zu VO-Folien, Mitschriften und Altprüfung.
   Format siehe js/figs.js. Zahlen stammen aus den Folien (Pix-Mania, Demobeispiel BAB, Excel Fixkostendegression) und der Altprüfung. */
(function () {
const FIG = window.STUDYOS_FIG = window.STUDYOS_FIG || {};
const FX = window.FX; if (!FX) return;
const { svg, g, t, tl, r, box, l, p } = FX;
const f = (n, d = 2) => (typeof n === "number" && isFinite(n)) ? n.toLocaleString("de-AT", { minimumFractionDigits: d, maximumFractionDigits: d }) : "–";
const f0 = n => f(n, 0);

/* kleine Helfer für die Schieberegler-Grafiken */
const range = (k, label, min, max, step, v) => `<label>${label} <b data-o="${k}"></b><input type="range" data-v="${k}" min="${min}" max="${max}" step="${step}" value="${v}"></label>`;
const val = (root, k) => +root.querySelector(`[data-v="${k}"]`).value;
const out = (root, k, html) => { const e = root.querySelector(`[data-o="${k}"]`); if (e) e.innerHTML = html; };
const stage = (root, s) => { root.querySelector(".fig-stage").innerHTML = s; };

/* ---------- 1. Auszahlung – Aufwand – Kosten ---------- */
const pair = (y0, a, b, ex, st) =>
  g({ st }, box(30, y0, 380, 34, a[0], { cls: a[1] })) +
  g({ st: st + 1 }, box(230, y0 + 42, 380, 34, b[0], { cls: b[1] }) + r(226, y0 - 4, 188, 84, { cls: "fx-dashacc", rx: 10 })) +
  g({ st: st + 2 }, tl(128, y0 + 104, ex[0], { fs: 11, lh: 14 }) + tl(320, y0 + 104, ex[1], { fs: 11, lh: 14, fw: 600 }) + tl(516, y0 + 104, ex[2], { fs: 11, lh: 14 }));
FIG["bwl2v-begriffe"] = { title: "Auszahlung, Aufwand, Kosten: wo sie sich decken und wo nicht",
  svg: () => svg(640, 380,
    t(20, 18, "Zahlung ↔ externes Ergebnis (GuV)", { a: "start", cls: "fx-sub", fs: 11 }) +
    pair(28, ["Auszahlung · Kassa/Bank sinkt", "fx-info"], ["Aufwand · GuV-Ergebnis sinkt", "fx-warn"], ["nur Auszahlung|Kredit tilgen, Auto kaufen", "beides|Miete, Löhne zahlen", "nur Aufwand|Abschreibung, Rückstellung"], 0) +
    t(20, 188, "externes Ergebnis (GuV) ↔ internes Ergebnis (KORE)", { a: "start", cls: "fx-sub", fs: 11 }) +
    pair(198, ["Aufwand · FIBU / GuV", "fx-warn"], ["Kosten · Kostenrechnung", "fx-ok"], ["neutraler Aufwand|Maschinenbrand, Wertpapierverlust", "Zweckaufwand = Grundkosten|Löhne, Material", "kalkulatorische Kosten|kalk. Zinsen, kalk. Unternehmerlohn"], 3) +
    g({ st: 6 }, r(30, 340, 580, 32, { cls: "fx-acc" }) + t(320, 361, "Gewinn ≠ Cashflow · Aufwand ≠ Kosten · Eigenkapital ≠ liquide Mittel", { cls: "fx-onacc", fw: 600, fs: 12.5 }))),
  steps: [
    "Die <b>Auszahlung</b> ist die engste Größe: Geld verlässt Kassa oder Bank.",
    "Der <b>Aufwand</b> mindert das Ergebnis der GuV. Beide überlappen nur teilweise.",
    "Kredit tilgen oder ein Auto kaufen: Geld ist weg, aber kein Aufwand (das Auto wird erst über die AfA zum Aufwand). Abschreibung und Rückstellung: Aufwand ohne Auszahlung.",
    "Eine Ebene tiefer: <b>Aufwand</b> (FIBU) gegen <b>Kosten</b> (Kostenrechnung).",
    "Die Überleitung (Betriebsüberleitungsbogen) sortiert: Was ist betriebsbedingt, was ist Zufall?",
    "Maschinenbrand und Wertpapierverluste sind <b>neutraler Aufwand</b> und fliegen raus. Kalkulatorische Zinsen und Unternehmerlohn sind <b>Kosten ohne Aufwand</b> (Zusatzkosten).",
    "Der Satz aus der VO, den du in jeder Theoriefrage brauchst."
  ] };

/* ---------- 2. Vier Arten von Bilanzveränderungen ---------- */
const tk = (x, y, title, L, R, o) => g(o, r(x, y, 290, 112, { cls: "fx-card" }) + t(x + 145, y + 18, title, { fw: 700, fs: 12.5 }) +
  l(x + 145, y + 26, x + 145, y + 104, { cls: "thin" }) + l(x + 12, y + 28, x + 278, y + 28, { cls: "thin" }) +
  t(x + 72, y + 42, "Aktiva", { cls: "fx-sub", fs: 10 }) + t(x + 218, y + 42, "Passiva", { cls: "fx-sub", fs: 10 }) +
  L.map((s, i) => t(x + 72, y + 62 + i * 18, s, { fs: 11.5, cls: /↑/.test(s) ? "t-ok" : /↓/.test(s) ? "t-bad" : "" })).join("") +
  R.map((s, i) => t(x + 218, y + 62 + i * 18, s, { fs: 11.5, cls: /↑/.test(s) ? "t-ok" : /↓/.test(s) ? "t-bad" : "" })).join(""));
FIG["bwl2v-bilanz4"] = { title: "Geschäftsfälle: die vier Arten, wie sich eine Bilanz verändert",
  svg: () => svg(640, 300,
    tk(20, 10, "Aktivtausch", ["Bank ↑ 2.000", "Forderungen ↓ 2.000"], ["–"], { st: 0 }) +
    tk(330, 10, "Passivtausch", ["–"], ["Kredit ↑ 5.000", "Verb. LL ↓ 5.000"], { st: 1 }) +
    tk(20, 132, "Bilanzverlängerung", ["Vorräte ↑ 35.000"], ["Verb. LL ↑ 35.000"], { st: 2 }) +
    tk(330, 132, "Bilanzverkürzung", ["Bank ↓ 10.000"], ["Kredit ↓ 10.000"], { st: 3 }) +
    g({ st: 4 }, r(20, 254, 600, 40, { cls: "fx-acc" }) + tl(320, 276, "Gehalt 3.000 per Bank: Bank ↓, EK ↓ (Aufwand)  →  Bilanzverkürzung UND erfolgswirksam|Nur wenn das Eigenkapital betroffen ist, ändert sich der Gewinn.", { cls: "fx-onacc", fs: 11.5, lh: 15, fw: 600 }))),
  steps: [
    "<b>Aktivtausch:</b> Ein Kunde zahlt seine Rechnung per Bank. Zwei Aktiva tauschen, die Bilanzsumme bleibt gleich. GuV: nichts, es ist nur Geld, das schon dir gehörte.",
    "<b>Passivtausch:</b> Eine Lieferantenschuld wird in einen Bankkredit umgewandelt. Zwei Passiva tauschen.",
    "<b>Bilanzverlängerung</b> (Aktiv-Passiv-Mehrung): Handelsware auf Ziel um 35.000 €. Vorräte und Verbindlichkeiten steigen. Liquide Mittel bleiben gleich, das ist die Altprüfungsfalle.",
    "<b>Bilanzverkürzung</b> (Aktiv-Passiv-Minderung): Kredittilgung per Bank. Auszahlung ja, Aufwand nein.",
    "Sobald das <b>Eigenkapital</b> berührt wird, ist der Fall erfolgswirksam: Gehalt, Miete, Abschreibung senken EK und Gewinn."
  ] };

/* ---------- 3. Eigenkapitalvergleich (Altprüfung Glaspeter) ---------- */
FIG["bwl2v-ekv"] = { title: "Gewinn durch Eigenkapitalvergleich: Entnahmen nicht vergessen",
  svg: () => { const Y = v => 250 - v / 100000 * 200, B = (x, a, b, cls, o) => g(o, `<rect x="${x}" y="${Y(Math.max(a, b))}" width="84" height="${Math.abs(Y(a) - Y(b))}" rx="5" class="${cls}"/>`);
    return svg(640, 300, l(30, 250, 620, 250, { cls: "thin" }) +
      B(40, 0, 98000, "fx-info", { st: 0 }) + g({ st: 0 }, t(82, Y(98000) - 8, "98.000", { fw: 700 }) + t(82, 268, "EK 31.12.20x5", { fs: 10.5 })) +
      B(160, 0, 82600, "fx-info", { st: 1 }) + g({ st: 1 }, t(202, Y(82600) - 8, "82.600", { fw: 700 }) + t(202, 268, "EK 31.12.20x6", { fs: 10.5 })) +
      B(280, 98000, 82600, "fx-bad", { st: 2 }) + g({ st: 2 }, t(322, Y(98000) - 8, "−15.400", { fw: 700, cls: "t-bad" }) + t(322, 268, "Differenz", { fs: 10.5 }) + l(124, Y(98000), 280, Y(98000), { cls: "dash thin" })) +
      B(400, 82600, 94600, "fx-ok", { st: 3 }) + g({ st: 3 }, t(442, Y(94600) - 8, "+12.000", { fw: 700, cls: "t-ok" }) + t(442, 268, "+ Entnahmen", { fs: 10.5 }) + l(244, Y(82600), 400, Y(82600), { cls: "dash thin" })) +
      B(520, 94600, 98000, "fx-bad", { st: 4 }) + g({ st: 4 }, t(562, Y(98000) - 8, "−3.400", { fw: 700, cls: "t-bad" }) + t(562, 268, "= Verlust", { fs: 10.5, fw: 700 }) + l(484, Y(94600), 520, Y(94600), { cls: "dash thin" }) +
      t(320, 292, "Ergebnis = EK Ende − EK Anfang + Entnahmen − Einlagen", { fs: 12, fw: 600 }))); },
  steps: [
    "Altprüfung, Einzelunternehmen Glaspeter: Eigenkapital am Ende von 20x5 = <b>98.000 €</b>.",
    "Ende 20x6 sind es nur noch <b>82.600 €</b>.",
    "Das EK ist um 15.400 € gesunken. Das ist aber <b>nicht</b> das Ergebnis, denn ein Teil des Geldes hat der Inhaber selbst herausgenommen.",
    "Er hat jeden Monat 1.000 € privat überwiesen: <b>Entnahmen 12.000 €</b>. Die wären ohne Verlust auch weg gewesen, also zählen wir sie wieder dazu.",
    "Ergebnis 20x6 = 82.600 − 98.000 + 12.000 = <b>−3.400 € Verlust</b>. Einlagen würden abgezogen, weil sie das EK ohne Gewinn erhöhen."
  ] };

/* ---------- 4. Buchführungspflicht (§ 189 UGB) ---------- */
FIG["bwl2v-pflicht"] = { title: "Wer muss doppelt buchführen? Der Entscheidungsbaum",
  svg: () => svg(640, 330,
    g({ st: 0 }, box(220, 8, 200, 40, "Rechtsform?", { cls: "fx-acc", fs: 13 })) +
    g({ st: 1 }, l(260, 48, 120, 84, { arrow: true }) + box(20, 86, 220, 52, "GmbH, AG, GmbH & Co KG|→ immer, kraft Rechtsform", { cls: "fx-ok", fs: 11.5 })) +
    g({ st: 2 }, l(380, 48, 500, 84, { arrow: true }) + box(390, 86, 230, 52, "e.U., OG, KG|→ es kommt auf den Umsatz an", { cls: "fx-soft", fs: 11.5 })) +
    g({ st: 3 }, l(450, 138, 330, 174, { arrow: true }) + box(240, 176, 190, 62, "einmal &gt; 1 Mio. €|→ ab dem folgenden|Geschäftsjahr", { cls: "fx-warn", fs: 11 })) +
    g({ st: 4 }, l(560, 138, 560, 174, { arrow: true }) + box(445, 176, 185, 62, "2 Jahre hintereinander|&gt; 700.000 € → ab dem|zweitfolgenden Jahr", { cls: "fx-warn", fs: 11 })) +
    g({ st: 5 }, r(20, 252, 600, 70, { cls: "fx-card" }) + tl(320, 287, "Altprüfung 20x7: Weilharter GmbH ✓ und Weingärten AG ✓ (Rechtsform).|Five in One KG: 580k · 720k · 680k → nur EIN Jahr über 700k → nicht verpflichtet.|Ausnahmen: freie Berufe sowie Land- und Forstwirte.", { fs: 11.5, lh: 17 }))),
  steps: [
    "Die erste Frage ist immer die <b>Rechtsform</b>.",
    "Kapitalgesellschaften (und die GmbH & Co KG) müssen <b>immer</b> doppelt buchführen, egal wie klein der Umsatz ist.",
    "Einzelunternehmen und Personengesellschaften: Entscheidend ist der Umsatz.",
    "Mehr als <b>1 Mio. €</b> in einem einzigen Jahr: Pflicht schon <b>ab dem folgenden</b> Geschäftsjahr (20x1 &gt; 1 Mio. → ab 20x2).",
    "Mehr als <b>700.000 €</b> in <b>zwei aufeinanderfolgenden</b> Jahren: Pflicht ab dem <b>zweitfolgenden</b> Jahr (20x1 und 20x2 → ab 20x4, 20x3 ist das Pufferjahr).",
    "So löst du die Altprüfungsfrage. Falle: Ein einzelnes Jahr über 700.000 € reicht nicht."
  ] };

/* ---------- 5. Rückstellung vs. Rücklage ---------- */
FIG["bwl2v-rueckst"] = { title: "Rückstellung: Aufwand heute, Zahlung später (Altprüfung Steuerberater)",
  svg: () => svg(640, 300,
    l(40, 60, 600, 60, { arrow: true }) + t(170, 40, "Jahr 2x13", { fw: 700 }) + t(470, 40, "Jahr 2x14", { fw: 700 }) + l(320, 50, 320, 70, { cls: "thin" }) +
    g({ st: 0 }, box(40, 80, 260, 58, "31.12.: Rückstellung bilden 3.600|Rechnung kommt erst nächstes Jahr", { cls: "fx-warn", fs: 11.5 })) +
    g({ st: 1 }, tl(170, 172, "GuV: Aufwand 3.600 → Ergebnis −3.600|Bilanz: Rückstellung (FK) +3.600|Bank: unverändert", { fs: 11.5, lh: 17 })) +
    g({ st: 2 }, box(340, 80, 260, 58, "10.05.: Rechnung 3.600 bezahlt|Rückstellung wird verwendet", { cls: "fx-info", fs: 11.5 })) +
    g({ st: 3 }, tl(470, 172, "Bank −3.600, Rückstellung −3.600|GuV 2x14: kein Effekt|(Bilanzverkürzung)", { fs: 11.5, lh: 17 })) +
    g({ st: 4 }, r(40, 222, 560, 70, { cls: "fx-acc" }) + tl(320, 257, "Rückstellung = Fremdkapital (Höhe oder Zeitpunkt ungewiss), entsteht durch Aufwand.|Rücklage = Eigenkapital, entsteht aus Gewinn, ist KEIN Geld auf dem Konto.|Altprüfung: richtig sind (a) Ergebnis 2x13 −3.600 und (b) 2x14 kein Effekt.", { cls: "fx-onacc", fs: 11.5, lh: 17, fw: 600 }))),
  steps: [
    "Der Jahresabschluss 2x13 kostet 3.600 €. Die Rechnung kommt aber erst im Mai 2x14. Am 31.12. wird eine <b>Rückstellung</b> gebildet.",
    "Bildung = <b>Aufwand</b> im Jahr 2x13 (Verursachung). Es fließt noch kein Geld: Die Liquidität sinkt nicht.",
    "Im Mai 2x14 kommt die Rechnung über genau 3.600 € und wird bezahlt.",
    "Die Rückstellung wird verbraucht. Geld geht weg, das Ergebnis 2x14 bleibt aber unberührt, denn der Aufwand wurde schon 2x13 gebucht.",
    "Merksatz für die MC-Fragen. Wäre die Rechnung höher, wäre nur die Differenz 2x14 Aufwand."
  ] };

/* ---------- 6. Deckungsgrade (Schieberegler, Altprüfung Friseur) ---------- */
FIG["bwl2v-deckung"] = { title: "Deckungsgrad A und B: Ist das Anlagevermögen langfristig finanziert?",
  svg: () => "", cap: "Startwerte aus der Altprüfung (Friseur, 31.12.2004). Unversteuerte Rücklagen sind hier schon im Eigenkapital enthalten, wie die Angabe es verlangt.",
  ui: () => range("av", "Anlagevermögen", 50000, 400000, 1, 281661) + range("ek", "Eigenkapital inkl. unvers. Rücklagen", 0, 300000, 1, 48707) + range("lf", "langfristiges Fremdkapital", 0, 300000, 1000, 200000) + `<div class="fig-out" data-o="r"></div>`,
  update: root => { const av = val(root, "av"), ek = val(root, "ek"), lf = val(root, "lf"), A = ek / av * 100, B = (ek + lf) / av * 100;
    out(root, "av", "€ " + f0(av)); out(root, "ek", "€ " + f0(ek)); out(root, "lf", "€ " + f0(lf));
    const mx = Math.max(av, ek + lf) * 1.1, H = v => v / mx * 220, base = 250;
    stage(root, svg(640, 280, l(30, base, 610, base, { cls: "thin" }) +
      `<rect x="90" y="${base - H(av)}" width="150" height="${H(av)}" rx="6" class="fx-soft"/>` + t(165, base - H(av) / 2 + 4, "AV " + f0(av), { fw: 700 }) + t(165, 270, "Aktiva: Anlagevermögen", { fs: 11 }) +
      `<rect x="380" y="${base - H(ek)}" width="150" height="${H(ek)}" rx="6" class="fx-ok"/>` + (H(ek) > 16 ? t(455, base - H(ek) / 2 + 4, "EK " + f0(ek), { fw: 700 }) : "") +
      `<rect x="380" y="${base - H(ek) - H(lf)}" width="150" height="${H(lf)}" rx="6" class="fx-info"/>` + (H(lf) > 16 ? t(455, base - H(ek) - H(lf) / 2 + 4, "lfr. FK " + f0(lf), { fw: 700 }) : "") + t(455, 270, "Passiva: langfristiges Kapital", { fs: 11 }) +
      l(240, base - H(av), 380, base - H(av), { cls: "dash acc" }) + t(310, base - H(av) - 6, "Höhe des AV", { fs: 10.5, cls: "t-acc" })));
    out(root, "r", `Deckungsgrad A = EK / AV = ${f0(ek)} / ${f0(av)} = <b>${f(A)} %</b><br>Deckungsgrad B = (EK + lfr. FK) / AV = ${f0(ek + lf)} / ${f0(av)} = <b>${f(B)} %</b><br>${B >= 100 ? "✓ Das AV ist vollständig langfristig finanziert (Fristenkongruenz)." : "✗ Ein Teil des AV ist kurzfristig finanziert. Das ist riskant, wenn kurzfristige Kredite gekündigt werden."}<br><small>Falle aus der Altprüfung: Rückstellungen, die in 4 Monaten aufgelöst werden, sind kurzfristig und gehören NICHT dazu. Fristigkeiten stehen im Anhang.</small>`); } };

/* ---------- 7. Anlagenspiegel Pix-Mania ---------- */
const cell = (x, y, w, s, o = {}) => g(o, r(x, y, w, 30, { cls: o.cls || "fx-card", rx: 6 }) + t(x + w / 2, y + 19.5, s, { fs: o.fs || 12, fw: o.fw || 600 }));
FIG["bwl2v-anlsp"] = { title: "Anlagenspiegel lesen: Pix-Mania, Summe Sachanlagen (TEUR)",
  svg: () => svg(640, 310,
    cell(10, 20, 110, "AK 1.1. 542,00", { st: 0 }) + g({ st: 0 }, t(130, 40, "+", { fw: 700 })) + cell(140, 20, 110, "Zugänge 58,10", { st: 0, cls: "fx-ok" }) + g({ st: 0 }, t(260, 40, "−", { fw: 700 })) + cell(270, 20, 110, "Abgänge 4,80", { st: 0, cls: "fx-bad" }) + g({ st: 0 }, t(390, 40, "=", { fw: 700 })) + cell(400, 20, 230, "AK 31.12. 595,30 (historische AK)", { st: 0, cls: "fx-soft" }) +
    cell(400, 64, 230, "kum. AfA 31.12. 281,20", { st: 1, cls: "fx-warn" }) + cell(400, 108, 230, "Buchwert 31.12. = 314,10 (Bilanz)", { st: 1, cls: "fx-info" }) + g({ st: 1 }, t(390, 128, "=", { fw: 700 })) +
    g({ st: 2 }, box(10, 160, 300, 62, "Anlagenabnutzungsgrad|281,20 / 595,30 = 47,24 %", { cls: "fx-acc", fs: 12 })) +
    g({ st: 3 }, box(330, 160, 300, 62, "Abschreibungsquote|65,00 / Ø (542,00 + 595,30)/2 = 11,43 %", { cls: "fx-acc", fs: 12 })) +
    g({ st: 4 }, box(10, 234, 620, 66, "Investitionsdeckung = Nettoinvestitionen / AfA|(58,10 − Restbuchwert Abgänge 0,10) / 65,00 = 89,23 %  ·  vereinfacht Zugänge / AfA = 89,38 %|unter 100 % → leichter Substanzverzehr", { cls: "fx-soft", fs: 11.5, lh: 16 }))),
  steps: [
    "Eine Zeile im Anlagenspiegel ist eine Rechnung: AK Anfang + Zugänge − Abgänge (± Umbuchungen) = <b>AK Ende</b>. Das sind die <b>historischen</b> AK, nicht der Buchwert. Nur Sachanlagen zählen, Firmenwert und Finanzanlagen sind gestrichen.",
    "Davon die kumulierte AfA abziehen ergibt den <b>Buchwert</b>, der in der Bilanz steht.",
    "<b>Anlagenabnutzungsgrad</b> = kumulierte AfA / historische AK. Knapp die Hälfte ist abgenutzt, bald stehen Reinvestitionen an. (VO: 50.000 / 100.000 = 50 %.)",
    "<b>Abschreibungsquote</b> = AfA des Jahres / Ø historische AK. Der Kehrwert schätzt die Nutzungsdauer: 20 % → 5 Jahre.",
    "<b>Investitionsdeckung</b>: Wird so viel investiert, wie abgeschrieben wird? Die Altprüfung rechnet vereinfacht Zugänge / AfA (5.000 / 3.070 = 162,87 %)."
  ] };

/* ---------- 8. Debitorenumschlagsdauer ---------- */
FIG["bwl2v-debi"] = { title: "Debitorenumschlagsdauer: Wie lange warten wir auf das Geld der Kunden?",
  svg: () => svg(640, 300,
    g({ st: 0 }, box(20, 14, 180, 54, "Umsatz netto (GuV)|416.666,67", { cls: "fx-soft", fs: 12 }) + l(200, 41, 236, 41, { arrow: true }) + box(240, 14, 180, 54, "× 1,2 = brutto|500.000,00", { cls: "fx-warn", fs: 12 }) +
      t(530, 36, "Forderungen enthalten", { fs: 11 }) + t(530, 52, "die USt (20 %)!", { fs: 11, fw: 700, cls: "t-bad" })) +
    g({ st: 1 }, box(20, 90, 180, 54, "Forderungen 1.1.|65.432,19", { cls: "fx-info", fs: 12 }) + box(220, 90, 180, 54, "Forderungen 31.12.|15.714,73", { cls: "fx-info", fs: 12 }) + l(400, 117, 436, 117, { arrow: true }) + box(440, 90, 180, 54, "Ø Forderungen|40.573,46", { cls: "fx-acc", fs: 12 })) +
    g({ st: 2 }, box(20, 166, 290, 54, "Umschlagshäufigkeit|500.000 / 40.573,46 = 12,32 ×", { cls: "fx-soft", fs: 12 })) +
    g({ st: 3 }, box(330, 166, 290, 54, "Umschlagsdauer|365 / 12,32 = 29,62 Tage", { cls: "fx-ok", fs: 12.5 })) +
    g({ st: 4 }, r(20, 236, 600, 56, { cls: "fx-card" }) + tl(320, 264, "Falsche Wahl in der MC: 35,54 Tage (netto statt brutto) oder 11,47 Tage (nur Endbestand).|Gleiches Prinzip beim Kreditorenumschlag: Materialeinkauf + USt / Ø Verbindlichkeiten LL.", { fs: 11.5, lh: 17 }))),
  steps: [
    "Der Umsatz in der GuV ist <b>netto</b>. Die Forderungen in der Bilanz sind <b>brutto</b>, denn der Kunde schuldet auch die USt. In der VO dreifach unterstrichen: <b>+ USt!!!</b>",
    "Bilanz = Stichtag, GuV = Zeitraum. Darum den <b>Durchschnitt</b> aus Anfangs- und Endbestand bilden.",
    "Wie oft im Jahr wird der Forderungsbestand „umgeschlagen“?",
    "In Tagen: Die Kunden zahlen im Schnitt nach rund <b>30 Tagen</b> (Altprüfung: 29,62 Tage).",
    "Die typischen Fehlantworten entstehen genau an den zwei Fallen."
  ] };

/* ---------- 9. Fixkostendegression (Excel aus der VO) ---------- */
FIG["bwl2v-fixdeg"] = { title: "Fixkostendegression: Excel-Modell aus der Vorlesung",
  svg: () => "", cap: "Fixkosten 1 Mio. €, variable Kosten 100 € je Stück, Kapazität 10.000 Stück, Preis 220 €. Schiebe die Auslastung und beobachte die Stückkosten.",
  ui: () => range("u", "Auslastung", 10, 100, 1, 70) + `<div class="fig-out" data-o="r"></div>`,
  update: root => { const u = val(root, "u"), x = 10000 * u / 100, F = 1e6, kv = 100, P = 220, k = F / x + kv, G = (P - k) * x;
    out(root, "u", u + " % = " + f0(x) + " Stück");
    const X = q => 60 + q / 10000 * 550, Y = v => 240 - Math.min(v, 1200) / 1200 * 220;
    let d = ""; for (let q = 900; q <= 10000; q += 100) d += (d ? "L" : "M") + X(q).toFixed(1) + " " + Y(F / q + kv).toFixed(1);
    stage(root, svg(640, 270, FX.axes(60, 20, 560, 220, "Menge", "€ je Stück") +
      [0, 300, 600, 900, 1200].map(v => t(54, Y(v) + 4, f0(v), { a: "end", fs: 10, cls: "fx-sub" })).join("") + [2500, 5000, 7500, 10000].map(q => t(X(q), 256, f0(q), { fs: 10, cls: "fx-sub" })).join("") +
      p(d, { cls: "bad" }) + l(X(0), Y(kv), X(10000), Y(kv), { cls: "dash warn" }) + l(X(0), Y(P), X(10000), Y(P), { cls: "acc" }) +
      t(X(10000), Y(P) - 6, "Preis 220", { a: "end", fs: 11, cls: "t-acc" }) + t(X(10000), Y(kv) + 15, "variable Stückkosten 100 = Schnäppchenpreis", { a: "end", fs: 11, cls: "t-warn" }) + t(X(1500), Y(F / 1500 + kv) - 6, "Stückkosten k = F/x + kv", { a: "start", fs: 11, cls: "t-bad" }) +
      l(X(8333), 20, X(8333), 240, { cls: "dash thin" }) + t(X(8333), 32, "Break-even 8.333 Stk (83 %)", { fs: 10.5 }) +
      `<circle cx="${X(x)}" cy="${Y(k)}" r="7" class="${k <= P ? "fx-ok" : "fx-bad"}"/>`));
    out(root, "r", `Stückkosten = ${f0(F)} / ${f0(x)} + 100 = <b>${f(k)} €</b> (davon Fixkosten je Stück ${f(F / x)} €)<br>Ergebnis = (220 − ${f(k)}) × ${f0(x)} = <b class="${G >= 0 ? "t-ok" : "t-bad"}">${G >= 0 ? "+" : "−"}${f0(Math.abs(G))} €</b><br><small>VO-Excel: 70 % → 242,86 € (Verlust), 90 % → 211,11 € (Gewinn). Restkapazität kurzfristig sogar zum Schnäppchenpreis 100 € (z. B. Eigenmarken) verkaufen: Die Fixkosten sind ohnehin da.</small>`); } };

/* ---------- 10. Kostenverläufe ---------- */
const KV = [["absolut fix · Miete", [400, 400, 400, 400]], ["sprungfix · Personal", [200, 200, 600, 600]], ["proportional variabel · Akkordlohn", [100, 200, 300, 400]], ["progressiv variabel · Material bei Lieferengpass", [100, 220, 360, 560]], ["degressiv variabel · Material mit Mengenrabatt", [100, 180, 240, 280]]];
FIG["bwl2v-verlauf"] = { title: "Fünf Kostenverläufe: Gesamtkosten und Stückkosten (VO-Tabelle)",
  svg: () => { const xs = [10, 20, 30, 40], XA = m => 60 + m / 40 * 230, YA = v => 230 - v / 600 * 190, XB = m => 370 + m / 40 * 230, YB = v => 230 - v / 45 * 190;
    return svg(640, 270, FX.axes(60, 30, 245, 200, "Menge", "Gesamtkosten K") + FX.axes(370, 30, 245, 200, "Menge", "Stückkosten k") +
      xs.map(m => t(XA(m), 246, m, { fs: 10, cls: "fx-sub" }) + t(XB(m), 246, m, { fs: 10, cls: "fx-sub" })).join("") +
      KV.map(([name, K], i) => g({ on: String(i) }, p(K.map((v, j) => (j ? "L" : "M") + XA(xs[j]) + " " + YA(v)).join(""), { cls: "acc" }) + K.map((v, j) => `<circle cx="${XA(xs[j])}" cy="${YA(v)}" r="4" class="fx-acc"/>` + t(XA(xs[j]), YA(v) - 8, v, { fs: 10 })).join("") +
        p(K.map((v, j) => (j ? "L" : "M") + XB(xs[j]) + " " + YB(v / xs[j])).join(""), { cls: "warn" }) + K.map((v, j) => `<circle cx="${XB(xs[j])}" cy="${YB(v / xs[j])}" r="4" class="fx-warn"/>` + t(XB(xs[j]), YB(v / xs[j]) - 8, f(v / xs[j], 0), { fs: 10 })).join("") +
        t(320, 18, name, { fw: 700, fs: 13 }))).join("")); },
  steps: [
    "<b>Absolut fix</b> (Miete 400): Die Gesamtkosten bleiben gleich, die Stückkosten fallen wie eine Hyperbel (40 → 10). Das ist die Fixkostendegression.",
    "<b>Sprungfix</b> (Personal): Bis 20 Stück reicht eine Person (200), ab 30 braucht es mehr (600). Die Stückkosten springen hoch und fallen dann wieder.",
    "<b>Proportional variabel</b> (Akkordlohn): Jedes Stück kostet gleich viel. Gesamt: Gerade durch 0. Stück: waagrecht bei 10.",
    "<b>Progressiv variabel</b> (Material bei Lieferengpass): Jedes weitere Stück wird teurer. Stückkosten steigen (10 → 14).",
    "<b>Degressiv variabel</b> (Mengenrabatt): Jedes weitere Stück wird billiger. Stückkosten fallen (10 → 7). Prüfungsfrage: Nach dem Verhalten bei Beschäftigungsänderungen unterscheidet man fix und variabel."
  ] };

/* ---------- 11. Betriebsüberleitung ---------- */
FIG["bwl2v-bub"] = { title: "Betriebsüberleitung: vom Aufwand der Buchhaltung zu den Kosten",
  svg: () => svg(640, 330,
    t(150, 20, "Aufwand (FIBU)", { fw: 700 }) + t(490, 20, "Kosten (KORE)", { fw: 700 }) +
    g({ st: 0 }, box(60, 34, 180, 90, "Zweckaufwand|z. B. Miete, Löhne", { cls: "fx-warn", fs: 12 }) + box(400, 34, 180, 90, "Grundkosten|gleicher Betrag", { cls: "fx-ok", fs: 12 }) + l(240, 79, 400, 79, { arrow: true, flow: true })) +
    g({ st: 1 }, box(60, 132, 180, 56, "neutraler Aufwand|Wertpapierverlust, Brand", { cls: "fx-bad", fs: 11.5 }) + l(240, 160, 300, 160, { cls: "bad" }) + t(318, 165, "✗ raus", { cls: "t-bad", fw: 700 })) +
    g({ st: 2 }, box(60, 196, 180, 56, "bh. AfA 40.000 / 8|= 5.000", { cls: "fx-warn", fs: 11.5 }) + box(400, 196, 180, 56, "kalk. AfA 40.000 / 4|= 10.000 (Anderskosten)", { cls: "fx-info", fs: 11.5 }) + l(240, 224, 400, 224, { arrow: true }) + t(320, 216, "neu bewertet", { fs: 10.5 })) +
    g({ st: 3 }, box(400, 260, 180, 62, "Zusatzkosten|kalk. EK-Zinsen, kalk.|Unternehmerlohn", { cls: "fx-vio", fs: 11 }) + t(230, 294, "kein Aufwand vorhanden", { fs: 11, cls: "fx-sub" }) + l(310, 290, 396, 290, { arrow: true, cls: "dash" }))),
  steps: [
    "<b>Zweckaufwand = Grundkosten:</b> Betriebsbedingter Aufwand wird 1 : 1 aus der FIBU übernommen.",
    "<b>Neutraler Aufwand</b> hat mit dem Betriebszweck nichts zu tun (betriebsfremd, außerordentlich, periodenfremd). Er wird <b>nicht</b> übernommen.",
    "<b>Anderskosten:</b> Aufwand existiert, wird aber anders bewertet. VO-Beispiel: Die FIBU schreibt 40.000 € über 8 Jahre ab (5.000), die KORE über die realistische Nutzungsdauer oder vom Wiederbeschaffungswert.",
    "<b>Zusatzkosten:</b> In der FIBU gibt es gar keinen Aufwand. Unternehmen A hat 100 % EK, B 20 % EK und 80 % FK: Nur B hat Zinsaufwand. Erst kalkulatorische EK-Zinsen machen beide vergleichbar. Zinsen und Miete können Anders- ODER Zusatzkosten sein."
  ] };

/* ---------- 12. BAB Demobeispiel ---------- */
const BABC = ["Material", "F1", "F2", "VW/Vt", "Geb.-Verw.", "Heizung"];
const babRow = (y, label, vals, o = {}) => g({ st: o.st }, t(14, y + 19, label, { a: "start", fs: 11, fw: 600 }) + vals.map((v, i) => v === "" ? "" : cell(112 + i * 87, y, 82, v, { cls: o.cls || "fx-card", fs: 11 })).join(""));
FIG["bwl2v-bab"] = { title: "BAB im Stufenleiterverfahren: das Demobeispiel aus der VO",
  svg: () => svg(640, 300,
    BABC.map((c, i) => t(153 + i * 87, 18, c, { fs: 11, fw: 700, cls: i > 3 ? "t-warn" : "" })).join("") +
    babRow(28, "Primärkosten", ["10.960", "70.240", "6.000", "8.408", "3.000", "2.000"], { st: 0 }) +
    babRow(66, "m²", ["20", "40", "20", "10", "10", ""], { st: 1, cls: "fx-ghost" }) +
    babRow(104, "Umlage Heiz.", ["400", "800", "400", "200", "200", "−2.000"], { st: 1, cls: "fx-soft" }) +
    babRow(142, "Umlage GV", ["711", "1.422", "711", "356", "−3.200", ""], { st: 2, cls: "fx-soft" }) +
    babRow(180, "Gemeinkosten", ["12.071", "72.462", "7.111", "8.964", "0", "0"], { st: 3, cls: "fx-info" }) +
    babRow(218, "Basis", ["FM 120.000", "900 h", "FL 24.000", "HK 235.644", "", ""], { st: 4, cls: "fx-ghost" }) +
    babRow(256, "Zuschlag", ["10 %", "€ 81 / h", "30 %", "3,8 %", "", ""], { st: 4, cls: "fx-acc" })),
  steps: [
    "Die Gemeinkosten sind schon auf die Kostenstellen verteilt (Primärkosten). Material, F1, F2 und VW/Vt sind <b>Hauptkostenstellen</b>, Gebäudeverwaltung und Heizung <b>Hilfskostenstellen</b> (VO: z. B. auch IT, HR).",
    "Die Heizung leistet an alle, bekommt selbst nichts, also kommt sie <b>zuerst</b>: 2.000 € / 100 m² = 20 €/m². Auch die Gebäudeverwaltung bekommt 200 €.",
    "Dann die Gebäudeverwaltung: 3.000 + 200 = 3.200 € auf die 90 m² der Hauptstellen (35,56 €/m²). An die bereits abgerechnete Heizung geht nichts mehr zurück.",
    "Summe der Gemeinkosten je Hauptstelle. Die Hilfsstellen stehen jetzt auf 0.",
    "Zuschlagssätze = Gemeinkosten / Basis: MGK 12.071 / 120.000 ≈ <b>10 %</b>, F1 72.462 / 900 h ≈ <b>81 €/h</b>, F2 7.111 / 24.000 ≈ <b>30 %</b>, VwVt 8.964 / Herstellkosten 235.644 ≈ <b>3,8 %</b>."
  ] };

/* ---------- 13. Cashflow: Vorzeichenregel und A/B/C ---------- */
FIG["bwl2v-cfsign"] = { title: "Kapitalflussrechnung: Vorzeichenregel und was Δ liquide Mittel verschweigt",
  svg: () => { const Y = v => 210 - v * 1.4, bar = (x, v, cls) => `<rect x="${x}" y="${Math.min(Y(0), Y(v))}" width="26" height="${Math.abs(Y(v) - Y(0))}" rx="3" class="${cls}"/>` + t(x + 13, v >= 0 ? Y(v) - 4 : Y(v) + 12, (v > 0 ? "+" : "") + v, { fs: 10 });
    const D = [["A", [50, -20, -30]], ["B", [10, -10, 10]], ["C", [-50, 0, 50]]];
    return svg(640, 300,
      g({ st: 0 }, box(20, 10, 290, 50, "Aktiva ↑ (Vorräte, Forderungen, AV)|→ bindet Geld → CF −", { cls: "fx-bad", fs: 11.5 })) +
      g({ st: 1 }, box(330, 10, 290, 50, "Passiva ↑ (Verbindlichkeiten, Rückst.)|→ bringt Geld → CF +", { cls: "fx-ok", fs: 11.5 })) +
      g({ st: 2 }, r(20, 70, 600, 36, { cls: "fx-card" }) + t(320, 93, "AV 50.000 auf Kredit: Investition −50 · Finanzierung +50 · Δ liquide Mittel = 0", { fs: 12, fw: 600 })) +
      g({ st: 3 }, l(30, Y(0), 610, Y(0), { cls: "thin" }) + D.map(([n, v], i) => { const x0 = 60 + i * 190; return bar(x0, v[0], "fx-info") + bar(x0 + 32, v[1], "fx-warn") + bar(x0 + 64, v[2], "fx-vio") + t(x0 + 45, 290, `${n}: Δ LM ${v[0] + v[1] + v[2] >= 0 ? "+" : ""}${v[0] + v[1] + v[2]}`, { fw: 700, fs: 12 }); }).join("") +
        t(130, 128, "op · inv · fin", { fs: 10, cls: "fx-sub" })) +
      g({ st: 4 }, t(105, 274, "✓ gesund", { cls: "t-ok", fs: 11, fw: 700 }) + t(485, 274, "✗ operativ −50, mit Krediten gestopft", { cls: "t-bad", fs: 11, fw: 700 }))); },
  steps: [
    "Steigt ein Aktivposten, steckt dort Geld fest: Lager auffüllen oder mehr offene Kundenrechnungen senken den Cashflow.",
    "Steigt ein Passivposten, hast du Geld noch nicht ausgegeben (Lieferant wartet, Rückstellung ohne Zahlung): CF +. Im Fallbeispiel der VO: Verbindlichkeiten +484 → operativer CF +508.",
    "Mitschrift der VO: Ein Kauf auf Kredit taucht in zwei Bereichen auf und hebt sich auf. Kassa und Bank ändern sich nicht.",
    "Drei Unternehmen, Beträge in TEUR: operativ, Investition, Finanzierung.",
    "A und C haben beide Δ LM = 0. A verdient das Geld selbst und tilgt damit, C verliert operativ 50 und braucht neue Kredite. Darum immer die drei Bereiche getrennt ansehen."
  ] };

/* ---------- 14. Preisuntergrenze (Altprüfung Beratung) ---------- */
FIG["bwl2v-pug"] = { title: "Vollkostenpreis oder Schnäppchenpreis? (Altprüfung Beratungsstunden)",
  svg: () => "", cap: "Fixkosten 300.000 €/Jahr, variable Kosten 4 € je Stunde, Kapazität 20.000 Stunden.",
  ui: () => range("pl", "Geplante Stunden zu Vollkosten", 10000, 20000, 500, 18000) + range("pz", "Preis für die restlichen Stunden", 0, 25, 0.25, 6) + `<div class="fig-out" data-o="r"></div>`,
  update: root => { const pl = val(root, "pl"), pz = val(root, "pz"), F = 300000, kv = 4, rest = 20000 - pl, vk = kv + F / pl, db = (pz - kv) * rest;
    out(root, "pl", f0(pl) + " h"); out(root, "pz", "€ " + f(pz));
    const X = v => 60 + v / 25 * 540;
    stage(root, svg(640, 150, l(60, 70, 600, 70, { cls: "thin" }) + [0, 5, 10, 15, 20, 25].map(v => l(X(v), 64, X(v), 76, { cls: "thin" }) + t(X(v), 92, "€ " + v, { fs: 10, cls: "fx-sub" })).join("") +
      `<rect x="${X(0)}" y="40" width="${X(kv) - X(0)}" height="20" rx="4" class="fx-bad"/>` + t(X(kv / 2), 34, "kv 4 = kurzfristige PUG", { fs: 10.5, cls: "t-bad", a: "start" }) +
      `<rect x="${X(kv)}" y="40" width="${X(Math.min(25, vk)) - X(kv)}" height="20" rx="4" class="fx-warn"/>` + t(X(Math.min(25, vk)), 118, "Vollkosten " + f(vk), { fs: 11, cls: "t-warn" }) + l(X(Math.min(25, vk)), 60, X(Math.min(25, vk)), 104, { cls: "dash warn" }) +
      `<circle cx="${X(pz)}" cy="50" r="9" class="${pz >= kv ? "fx-ok" : "fx-bad"}"/>` + t(X(pz), 140, "Angebot " + f(pz), { fs: 11, fw: 700 })));
    out(root, "r", `Vollkostenpreis (langfristige PUG) = 4 + 300.000 / ${f0(pl)} = <b>${f(vk)} €</b> je Stunde<br>Restkapazität ${f0(rest)} h zum Preis ${f(pz)} €: Deckungsbeitrag = (${f(pz)} − 4) × ${f0(rest)} = <b class="${db >= 0 ? "t-ok" : "t-bad"}">${db >= 0 ? "+" : "−"}${f0(Math.abs(db))} €</b><br>${pz >= kv ? "✓ Annehmen: Jeder Preis über 4 € verbessert das Ergebnis, die Fixkosten sind bereits gedeckt." : "✗ Unter den variablen Kosten verliert jede Stunde Geld."}<br><small>Altprüfung: Minimalpreis = <b>4 €</b>, kostendeckender Preis bei 18.000 h = <b>20,67 €</b>.</small>`); } };

/* ---------- 15. Finanzierungsmatrix ---------- */
FIG["bwl2v-finmatrix"] = { title: "Finanzierung: Herkunft (innen/außen) × Rechtsstellung (Eigen/Fremd)",
  svg: () => svg(640, 320,
    t(250, 22, "Eigenkapital", { fw: 700 }) + t(500, 22, "Fremdkapital", { fw: 700 }) + t(70, 105, "Außen", { fw: 700 }) + t(70, 230, "Innen", { fw: 700 }) +
    g({ st: 0 }, box(130, 36, 240, 130, "Beteiligungsfinanzierung|AG erhöht Grundkapital|neuer voll haftender Gesellschafter", { cls: "fx-ok", fs: 11.5, lh: 16 })) +
    g({ st: 1 }, box(385, 36, 240, 130, "Kreditfinanzierung|Bankkredit, Lieferantenkredit|Anleihe 6 %, 15 Jahre", { cls: "fx-info", fs: 11.5, lh: 16 })) +
    g({ st: 2 }, box(130, 176, 240, 130, "Selbstfinanzierung|Gewinne einbehalten|(Gewinnthesaurierung)", { cls: "fx-warn", fs: 11.5, lh: 16 })) +
    g({ st: 3 }, box(385, 176, 240, 130, "Rückstellungsfinanzierung|z. B. Abfertigungsrückstellung|+ Abschreibungsrückflüsse (Umschichtung)", { cls: "fx-vio", fs: 11.5, lh: 16 }))),
  steps: [
    "<b>Außen + Eigen:</b> Geld kommt von (neuen) Eigentümern. Altprüfung: Kapitalerhöhung der AG und der neue voll haftende Gesellschafter einer OG sind Eigenkapital von außen.",
    "<b>Außen + Fremd:</b> Gläubiger geben Geld, das zurückgezahlt wird. Die Anleihe ist Fremdkapital, auch wenn sie 15 Jahre läuft.",
    "<b>Innen + Eigen:</b> Einbehaltene Gewinne. Kein neues Geld von außen, aber das EK wächst.",
    "<b>Innen + Fremd:</b> Rückstellungen binden Geld im Unternehmen, bis es abfließt. Altprüfungsfalle: „Eigen, Eigen, Eigen, Fremd“ der vier Fälle sauber zuordnen."
  ] };

/* ---------- 16. URG-Ampel ---------- */
FIG["bwl2v-urg"] = { title: "URG: Wann wird ein Reorganisationsbedarf vermutet?",
  svg: () => "", cap: "Unternehmensreorganisationsgesetz: Beide Kennzahlen müssen gleichzeitig kritisch sein.",
  ui: () => range("em", "Eigenmittelquote", 0, 30, 0.5, 6) + range("sd", "fiktive Schuldentilgungsdauer (Jahre)", 0, 30, 0.5, 18) + `<div class="fig-out" data-o="r"></div>`,
  update: root => { const em = val(root, "em"), sd = val(root, "sd"), a = em < 8, b = sd > 15, both = a && b;
    out(root, "em", f(em, 1) + " %"); out(root, "sd", f(sd, 1) + " J.");
    const lamp = (x, on, label, sub) => `<circle cx="${x}" cy="70" r="34" class="${on ? "fx-bad" : "fx-ok"}"/>` + t(x, 76, on ? "kritisch" : "ok", { fw: 700, cls: "fx-onacc" }) + t(x, 124, label, { fw: 600, fs: 12 }) + t(x, 142, sub, { fs: 11, cls: "fx-sub" });
    stage(root, svg(640, 170, lamp(110, a, "Eigenmittelquote", "kritisch unter 8 %") + lamp(320, b, "Schuldentilgungsdauer", "kritisch über 15 Jahre") +
      `<rect x="440" y="36" width="180" height="70" rx="12" class="${both ? "fx-bad" : "fx-ok"}"/>` + tl(530, 72, both ? "Reorganisations-|bedarf vermutet" : "keine Vermutung", { fw: 700, cls: "fx-onacc", fs: 13, lh: 17 }) + t(530, 124, "UND-Verknüpfung", { fs: 11, cls: "fx-sub" })));
    out(root, "r", `${both ? "Beide Grenzen sind überschritten: Der Gesetzgeber vermutet Reorganisationsbedarf." : a || b ? "Nur eine Kennzahl ist kritisch. Das reicht für die Vermutung NICHT." : "Beide Kennzahlen sind unkritisch."}<br><small>Altprüfung, richtige Antworten: (c) EMQ &lt; 8 % und (f) SDT &gt; 15 J. Im Nenner der Schuldentilgungsdauer steht der Mittelüberschuss aus der gewöhnlichen Geschäftstätigkeit.</small>`); } };
})();
