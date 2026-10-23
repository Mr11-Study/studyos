/* BWL 2 · Prüfungstrainer (Widget „bwlgen“): Moodle-artige Rechenaufgaben mit Zufallszahlen.
   Die falschen Antwortmöglichkeiten sind typische Fehler aus der Altprüfung (USt vergessen, Halbjahresregel, Durchschnitt …).
   Block: { t: "widget", w: "bwlgen", types: ["afa", "debi"] | null (= alle), title, topic }. Muss nach w-generic.js geladen werden. */
(function () {
const W = App.W;
const { $, $$, esc } = App;
const fmt = (v, d = 2) => App.fmtNum(v, d);
const R = (a, b, s = 1) => a + s * Math.floor(Math.random() * (Math.floor((b - a) / s) + 1));
const one = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const npv = (cf, i) => cf.reduce((s, v, t) => s + v / Math.pow(1 + i, t), 0);
const MON = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const e = (v, d = 2) => "€ " + fmt(v, d);

/* ======================= Prüfungstrainer: Aufgabentypen =======================
   make() liefert { q, a, u, d, wrong: [typische Fehler], how } (Zahl) oder { q, opts, a, how } (Auswahl). */
const G = {
  bep: { label: "Break-even-Menge", topic: "b-entsch", make: () => { const db = one([1.5, 2, 2.5, 3, 4, 5, 6, 8]), kv = R(2, 30), p = kv + db, x = R(20, 150) * 1000, F = x * db;
    return { q: `Fixkosten ${e(F, 0)} pro Jahr, Verkaufspreis ${e(p)}, variable Stückkosten ${e(kv)}. Bei welcher Menge erreicht das Unternehmen die Gewinnschwelle?`, a: x, u: "Stk", d: 0,
      wrong: [F / p, F / kv, F / (p + kv)], how: `Deckungsbeitrag je Stück = ${fmt(p)} − ${fmt(kv)} = ${fmt(db)} €<br>Break-even-Menge = Fixkosten / db = ${fmt(F, 0)} / ${fmt(db)} = <b>${fmt(x, 0)} Stück</b>` }; } },
  bepmehr: { label: "Break-even bei sinkendem DB", topic: "b-entsch", make: () => { const db1 = one([2.5, 3, 4, 5, 6, 8, 10]), d = one([0.5, 1, 2].filter(x => x < db1 - 0.5)), db2 = db1 - d, F = R(5, 40) * 10000, x1 = F / db1, x2 = F / db2;
    return { q: `Die Fixkosten betragen ${e(F, 0)} pro Jahr. Der Deckungsbeitrag pro Stück beträgt anfänglich ${e(db1)} und soll auf ${e(db2)} reduziert werden. Wie viele Stück müssen <b>mehr</b> abgesetzt werden, damit sich weiterhin weder Gewinn noch Verlust ergibt?`, a: x2 - x1, u: "Stk", d: 0,
      wrong: [x2, x1, F / d], how: `Vorher: ${fmt(F, 0)} / ${fmt(db1)} = ${fmt(x1, 0)} Stk<br>Nachher: ${fmt(F, 0)} / ${fmt(db2)} = ${fmt(x2, 0)} Stk<br>Mehrmenge = <b>${fmt(x2 - x1, 0)} Stück</b> (Altprüfung Frage 1: 10.000 Stück). Falle: die neue Gesamtmenge ist nicht die Mehrmenge.` }; } },
  afa: { label: "AfA im Anschaffungsjahr", topic: "bx-afa", make: () => { const KP = R(30, 120) * 100 + one([0, 32, 50, 75]), L = R(4, 15) * 10, M = R(5, 25) * 10, rab = one([5, 10, 15]), sk = Math.random() < .4, ND = one([4, 5, 8, 10]), m = R(1, 12), mk = Math.max(0, m - R(0, 1));
    const red = KP * (1 - rab / 100), skv = sk ? red * 0.02 : 0, AK = red - skv + L + M, J = AK / ND, half = m >= 7, a = half ? J / 2 : J;
    return { q: `Eine GmbH kauft am ${R(2, 12)}. ${MON[mk]} eine Maschine um ${e(KP)} zzgl. 20 % USt. Lieferung ${e(L)} und Montage ${e(M)} (jeweils zzgl. USt) werden extra verrechnet. Wegen eines Mangels gewährt der Händler nachträglich ${rab} % Rabatt auf den Kaufpreis.${sk ? " Bezahlt wird der verminderte Kaufpreis mit 2 % Skonto." : ""} Inbetriebnahme am ${R(14, 28)}. ${MON[m - 1]}, Nutzungsdauer ${ND} Jahre, lineare AfA, Halbjahresregel. Wie hoch ist die AfA in diesem Jahr?`, a, u: "€", d: 2,
      wrong: [half ? J : J / 2, a * 1.2, (red - skv) / ND * (half ? .5 : 1), (KP + L + M) / ND * (half ? .5 : 1)],
      how: `Anschaffungskosten (ohne USt, die ist Vorsteuer): ${fmt(KP)} − ${rab} % Rabatt ${fmt(KP - red)}${sk ? ` − 2 % Skonto ${fmt(skv)}` : ""} + Lieferung ${fmt(L)} + Montage ${fmt(M)} = ${fmt(AK)} €<br>Jahres-AfA = ${fmt(AK)} / ${ND} = ${fmt(J)} €<br>Inbetriebnahme im ${half ? "2. Halbjahr → halbe" : "1. Halbjahr → volle"} Jahres-AfA = <b>${fmt(a)} €</b>. Maßgeblich ist die Inbetriebnahme, nicht der Kauf.` }; } },
  dg: { label: "Deckungsgrad A / B", topic: "b-fin", make: () => { const AV = R(150, 600) * 1000 + R(0, 999), EK = R(10, 150) * 1000 + R(0, 999), uR = R(5, 60) * 1000 + R(0, 999), lf = R(50, 300) * 1000, RS = R(10, 60) * 1000, V = lf + R(40, 200) * 1000, B = Math.random() < .6;
    const A = (EK + uR) / AV * 100, BB = (EK + uR + lf) / AV * 100;
    return { q: `Bilanz zum 31.12.: Anlagevermögen ${e(AV, 0)}, Eigenkapital ${e(EK, 0)}, unversteuerte Rücklagen ${e(uR, 0)}, Rückstellungen ${e(RS, 0)} (alle innerhalb von 4 Monaten aufzulösen), Verbindlichkeiten ${e(V, 0)}, davon ${e(lf, 0)} mit Fälligkeit nach 12 Monaten. Die unversteuerten Rücklagen zählen zum Eigenkapital. Wie hoch ist der <b>Deckungsgrad ${B ? "B" : "A"}</b>?`, a: B ? BB : A, u: "%", d: 2,
      wrong: B ? [A, (EK + lf) / AV * 100, (EK + uR + lf + RS) / AV * 100, (EK + uR + V) / AV * 100] : [BB, EK / AV * 100, AV / (EK + uR) * 100],
      how: B ? `Deckungsgrad B = (EK + lfr. FK) / AV = (${fmt(EK, 0)} + ${fmt(uR, 0)} + ${fmt(lf, 0)}) / ${fmt(AV, 0)} = <b>${fmt(BB)} %</b><br>Die Rückstellungen sind kurzfristig und gehören NICHT dazu. Nur die ${fmt(lf, 0)} der Verbindlichkeiten sind langfristig.` : `Deckungsgrad A = EK / AV = (${fmt(EK, 0)} + ${fmt(uR, 0)}) / ${fmt(AV, 0)} = <b>${fmt(A)} %</b>` }; } },
  fkq: { label: "Fremdkapitalquote", topic: "b-fin", make: () => { const GK = R(200, 900) * 1000 + R(0, 999), EK = R(5, 25) * GK / 100 | 0, uR = R(2, 8) * GK / 100 | 0, FK = GK - EK - uR;
    return { q: `Bilanzsumme ${e(GK, 0)}, Eigenkapital ${e(EK, 0)}, unversteuerte Rücklagen ${e(uR, 0)}, der Rest ist Fremdkapital. Die unversteuerten Rücklagen werden dem Eigenkapital zugeordnet. Fremdkapitalquote?`, a: FK / GK * 100, u: "%", d: 2,
      wrong: [(FK + uR) / GK * 100, EK / GK * 100, FK / (EK + uR) * 100], how: `FK = ${fmt(GK, 0)} − ${fmt(EK, 0)} − ${fmt(uR, 0)} = ${fmt(FK, 0)}<br>FK-Quote = FK / Gesamtkapital = <b>${fmt(FK / GK * 100)} %</b>. EK-Quote + FK-Quote = 100 %.` }; } },
  debi: { label: "Debitorenumschlagsdauer", topic: "b-verm", make: () => { const U = R(200, 900) * 1000 + R(0, 99) / 100 * 1000, F1 = R(20, 120) * 1000 + R(0, 999), F2 = R(15, 120) * 1000 + R(0, 999), avg = (F1 + F2) / 2, a = avg / (U * 1.2) * 365;
    return { q: `Umsatzerlöse exkl. 20 % USt ${e(U)}. Forderungen aus L+L: 1.1. ${e(F1, 0)}, 31.12. ${e(F2, 0)}. Es gilt nur der 20-%-Satz. Debitorenumschlagsdauer (365 Tage)?`, a, u: "Tage", d: 2,
      wrong: [avg / U * 365, F2 / (U * 1.2) * 365, avg / (U * 1.2) * 360], how: `Umsatz brutto = ${fmt(U)} × 1,2 = ${fmt(U * 1.2)} (Forderungen enthalten die USt!)<br>Ø Forderungen = (${fmt(F1, 0)} + ${fmt(F2, 0)}) / 2 = ${fmt(avg)}<br>Umschlagshäufigkeit = ${fmt(U * 1.2 / avg, 3)} → Dauer = 365 / ${fmt(U * 1.2 / avg, 3)} = <b>${fmt(a)} Tage</b>` }; } },
  invdeck: { label: "Investitionsdeckung", topic: "b-verm", make: () => { const Z = R(4, 160) * 250, A = R(4, 120) * 250;
    return { q: `Sachanlagevermögen: Zugänge des Jahres ${e(Z, 0)}, Abschreibungen des Jahres ${e(A, 0)}. Investitionsdeckung (vereinfacht: Zugänge gegen Abschreibungen)?`, a: Z / A * 100, u: "%", d: 2,
      wrong: [A / Z * 100, (Z - A) / A * 100, (Z - A) / Z * 100], how: `Investitionsdeckung = Investitionen / AfA = ${fmt(Z, 0)} / ${fmt(A, 0)} = <b>${fmt(Z / A * 100)} %</b><br>${Z >= A ? "Über 100 %: Es wird mehr investiert als abgeschrieben (Substanz wächst)." : "Unter 100 %: Substanzverzehr, Investitionen werden zurückgestaut."}` }; } },
  anlab: { label: "Anlagenabnutzungsgrad", topic: "b-verm", make: () => { const A1 = R(40, 300) * 1000, A2 = R(20, 150) * 1000, Gr = R(30, 200) * 1000, k1 = A1 * R(20, 80) / 100 | 0, k2 = A2 * R(20, 90) / 100 | 0, a = (k1 + k2) / (A1 + A2) * 100;
    return { q: `Anlagenspiegel 31.12.: Grundstücke (unbebaut) AK ${e(Gr, 0)}, kum. AfA 0 · Technische Anlagen AK ${e(A1, 0)}, kum. AfA ${e(k1, 0)} · BGA AK ${e(A2, 0)}, kum. AfA ${e(k2, 0)}. Anlagenabnutzungsgrad des <b>abnutzbaren</b> Sachanlagevermögens?`, a, u: "%", d: 2,
      wrong: [(k1 + k2) / (A1 + A2 + Gr) * 100, (A1 + A2 - k1 - k2) / (A1 + A2) * 100, k1 / A1 * 100], how: `Abnutzbar sind nur Technische Anlagen und BGA, der Grund nutzt sich nicht ab.<br>(${fmt(k1, 0)} + ${fmt(k2, 0)}) / (${fmt(A1, 0)} + ${fmt(A2, 0)}) = <b>${fmt(a)} %</b> (Nenner: historische AK, nicht Buchwert)` }; } },
  preis: { label: "Vollkosten- und Minimalpreis", topic: "b-entsch", make: () => { const F = R(10, 60) * 10000, kv = R(2, 25), cap = R(10, 40) * 1000, pl = cap - R(1, 5) * 1000, min = Math.random() < .5, vk = kv + F / pl;
    const base = `Fixkosten ${e(F, 0)}/Jahr, variable Kosten ${e(kv, 0)} je Stunde, Kapazität ${fmt(cap, 0)} Stunden. Geplant sind ${fmt(pl, 0)} Stunden zu Vollkosten.`;
    return min ? { q: `${base} Zu welchem Minimalpreis könnten die restlichen ${fmt(cap - pl, 0)} Stunden angeboten werden, wenn mit dem Zusatzauftrag kein Gewinn mehr angestrebt wird?`, a: kv, u: "€", d: 2, wrong: [vk, kv + F / cap, kv + F / (cap - pl)], how: `Die Fixkosten sind durch die ${fmt(pl, 0)} Stunden bereits gedeckt. Kurzfristige Preisuntergrenze = variable Kosten = <b>${e(kv)}</b> (Altprüfung: € 4).` }
      : { q: `${base} Welchen Preis je Stunde müssen Sie verlangen, um kostendeckend zu sein?`, a: vk, u: "€", d: 2, wrong: [kv + F / cap, F / pl, kv], how: `Vollkosten je Stunde = kv + Fixkosten / geplante Menge = ${fmt(kv)} + ${fmt(F, 0)} / ${fmt(pl, 0)} = <b>${e(vk)}</b> (Altprüfung: € 20,67). Falle: durch die Kapazität statt durch die geplante Menge teilen.` }; } },
  fkd: { label: "Fixkostendegression", topic: "b-kore", make: () => { const F = R(5, 30) * 100000, kv = R(5, 40) * 5, cap = R(5, 20) * 1000, u = R(5, 10) * 10, x = cap * u / 100, k = F / x + kv;
    return { q: `Fixkosten ${e(F, 0)}, variable Kosten ${e(kv, 0)} je Stück, Kapazität ${fmt(cap, 0)} Stück, Auslastung ${u} %. Wie hoch sind die Kosten je Stück?`, a: k, u: "€", d: 2,
      wrong: [F / cap + kv, F / x, F / x * kv / 100 + kv], how: `Menge = ${fmt(cap, 0)} × ${u} % = ${fmt(x, 0)} Stück<br>Stückkosten = ${fmt(F, 0)} / ${fmt(x, 0)} + ${fmt(kv, 0)} = <b>${e(k)}</b><br>Mehr Auslastung → Fixkosten verteilen sich auf mehr Stück (VO-Excel: 70 % → 242,86, 90 % → 211,11).` }; } },
  ekv: { label: "Gewinn durch EK-Vergleich", topic: "b-ja", make: () => { const A = R(30, 200) * 1000 + R(0, 9) * 100, E = A + R(-25, 25) * 1000 + R(0, 9) * 100, m = R(5, 30) * 100, ein = Math.random() < .3 ? R(2, 20) * 1000 : 0, g = E - A + 12 * m - ein;
    return { q: `Einzelunternehmen, Eigenkapital laut Schlussbilanz: Vorjahr ${e(A, 0)}, aktuelles Jahr ${e(E, 0)}. Der Inhaber hat jeden Monat ${e(m, 0)} vom Geschäftskonto privat entnommen${ein ? ` und einmal ${e(ein, 0)} aus privaten Mitteln eingelegt` : ""}. Jahresergebnis?`, a: g, u: "€", d: 0,
      wrong: [E - A, E - A - 12 * m, A - E + 12 * m], how: `Ergebnis = EK Ende − EK Anfang + Entnahmen − Einlagen = ${fmt(E, 0)} − ${fmt(A, 0)} + ${fmt(12 * m, 0)}${ein ? ` − ${fmt(ein, 0)}` : ""} = <b>${g < 0 ? "−" : ""}${e(Math.abs(g), 0)}</b> ${g < 0 ? "Verlust" : "Gewinn"}` }; } },
  amort: { label: "Amortisationsdauer", topic: "b-stat", make: () => { const AK = R(50, 200) * 1000, RW = R(0, 4) * 5000, Gw = [0, 0, 0, 0, 0].map(() => R(5, 40) * 1000), afa = (AK - RW) / 5, avg = Gw.reduce((s, x) => s + x, 0) / 5, a = (AK - RW) / (avg + afa);
    return { q: `Anschaffungskosten ${e(AK, 0)}, Nutzungsdauer 5 Jahre, Restwert ${e(RW, 0)}, lineare AfA. Erwartete Gewinne: ${Gw.map(x => fmt(x, 0)).join(" · ")}. Amortisationsdauer nach der Durchschnittsrechnung?`, a, u: "Jahre", d: 2,
      wrong: [AK / (avg + afa), (AK - RW) / avg, AK / avg], how: `AfA = (${fmt(AK, 0)} − ${fmt(RW, 0)}) / 5 = ${fmt(afa, 0)}<br>Ø Gewinn = ${fmt(avg, 0)} → Ø Rückfluss = Gewinn + AfA = ${fmt(avg + afa, 0)}<br>Amortisationsdauer = (AK − RW) / Ø Rückfluss = ${fmt(AK - RW, 0)} / ${fmt(avg + afa, 0)} = <b>${fmt(a)} Jahre</b> (Altprüfung: 2,34)` }; } },
  kw: { label: "Kapitalwert", topic: "b-dyn", make: () => { const n = R(3, 5), A0 = R(10, 80) * 500, cf = [-A0].concat(Array.from({ length: n }, () => Math.round(A0 * R(85, 140) / 100 / n * R(70, 130) / 100 / 50) * 50)), i = one([3, 4, 5, 6, 8, 10]) / 100, a = npv(cf, i);
    const simple = cf.reduce((s, v, t) => s + v / (1 + i * t), 0), late = cf.reduce((s, v, t) => s + (t ? v / Math.pow(1 + i, t + 1) : v), 0);
    return { q: `Anschaffungsauszahlung ${e(A0, 0)} in t = 0, Rückflüsse am Jahresende: ${cf.slice(1).map((v, t) => `t${t + 1}: ${fmt(v, 0)}`).join(" · ")}. Kalkulationszins ${fmt(i * 100, 0)} %. Kapitalwert?`, a, u: "€", d: 2,
      wrong: [cf.reduce((s, v) => s + v, 0), simple, late], how: `KW = −${fmt(A0, 0)} ${cf.slice(1).map((v, t) => `+ ${fmt(v, 0)} / ${fmt(1 + i, 2)}${"¹²³⁴⁵"[t]}`).join(" ")} = <b>${e(a)}</b><br>${a > 0 ? "KW &gt; 0: Kapital zurück + Verzinsung + Überschuss in Höhe des KW (bezogen auf t = 0!)." : "KW &lt; 0: Die Mindestverzinsung wird nicht erreicht."}<br><small>Excel: =NBW(${fmt(i * 100, 0)}%; Rückflüsse) − ${fmt(A0, 0)}</small>` }; } },
  cfe: { label: "Cashflow aus dem Ergebnis", topic: "b-cf", make: () => { const J = R(20, 300), A = R(50, 400), Gv = R(0, 120), D = R(0, 60);
    return { q: `TEUR: Jahresüberschuss ${J}, Abschreibungen auf das AV ${A}, Gewinne aus dem Anlagenabgang ${Gv}, Dotierung langfristiger Rückstellungen (Abfertigung) ${D}. Cashflow aus dem Ergebnis?`, a: J + A - Gv + D, u: "TEUR", d: 0,
      wrong: [J + A + Gv + D, J + A, J - A - Gv + D], how: `${J} + AfA ${A} − Gewinn Anlagenabgang ${Gv} + Dotierung ${D} = <b>${J + A - Gv + D} TEUR</b><br>AfA und Dotierung sind Aufwand ohne Auszahlung (+). Der Buchgewinn aus dem Abgang gehört in den Investitionsbereich (−).` }; } },
  gkr: { label: "Gesamtkapitalrentabilität", topic: "b-ertr", make: () => { const GK = R(40, 250) * 10, EBT = R(10, 150), Z = R(3, 40);
    return { q: `TEUR: Ergebnis vor Steuern ${EBT}, Fremdkapitalzinsen ${Z}, durchschnittliches Gesamtkapital ${fmt(GK, 0)}. Gesamtkapitalrentabilität (ROI)?`, a: (EBT + Z) / GK * 100, u: "%", d: 2,
      wrong: [EBT / GK * 100, (EBT - Z) / GK * 100, Z / GK * 100], how: `ROI = (EBT + FK-Zinsen) / Ø GK = (${EBT} + ${Z}) / ${fmt(GK, 0)} = <b>${fmt((EBT + Z) / GK * 100)} %</b><br>Warum + Zinsen? Das Gesamtkapital (EK + FK) wird mit Gewinn UND Zinsen entlohnt (VO: EK ← G, FK ← FKZ).` }; } },
  kalk: { label: "Zuschlagskalkulation", topic: "b-bab", make: () => { const FM = R(20, 200) * 100, mgk = R(5, 20), FL = R(10, 80) * 100, fgk = R(80, 220, 5), vv = R(3, 15), MK = FM * (1 + mgk / 100), FK_ = FL * (1 + fgk / 100), HK = MK + FK_, SK = HK * (1 + vv / 100);
    return { q: `Auftrag: Fertigungsmaterial ${e(FM, 0)}, MGK ${mgk} %, Fertigungslöhne ${e(FL, 0)}, FGK ${fmt(fgk, 0)} %, Verwaltungs- und Vertriebsgemeinkosten ${vv} % auf die Herstellkosten. Selbstkosten?`, a: SK, u: "€", d: 2,
      wrong: [HK, MK + FK_ + (FM + FL) * vv / 100, (FM * (1 + mgk / 100 + fgk / 100) + FL) * (1 + vv / 100)], how: `Materialkosten = ${fmt(FM, 0)} + ${mgk} % = ${fmt(MK)}<br>Fertigungskosten = ${fmt(FL, 0)} + ${fmt(fgk, 0)} % = ${fmt(FK_)}<br>Herstellkosten = ${fmt(HK)}<br>+ ${vv} % VwVt = <b>${e(SK)}</b> Selbstkosten` }; } },
  pflicht: { label: "Buchführungspflicht", topic: "bx-pflicht", make: () => {
    const sc = one(["kap", "mio", "zwei", "einmal", "klein"]), rf = sc === "kap" ? one(["GmbH", "AG"]) : one(["e.U.", "OG", "KG"]);
    const lo = () => R(150, 690) * 1000, hi = () => R(705, 980) * 1000, big = () => R(101, 160) * 10000;
    let u; if (sc === "mio") { const y = R(0, 2); u = [lo(), lo(), lo()]; u[y] = big(); } else if (sc === "zwei") { u = Math.random() < .5 ? [hi(), hi(), lo()] : [lo(), hi(), hi()]; } else if (sc === "einmal") { u = [lo(), lo(), lo()]; u[R(0, 2)] = hi(); } else u = [lo(), lo(), lo()];
    let start = 99; u.forEach((v, y) => { if (v > 1e6) start = Math.min(start, y + 2); if (y && u[y - 1] > 7e5 && v > 7e5) start = Math.min(start, y + 3); });
    const L = ["immer, kraft Rechtsform", "ab 20x2", "ab 20x3", "ab 20x4", "ab 20x5", "bisher keine Pflicht"], ok = sc === "kap" ? 0 : start < 99 ? start : 5;
    const others = shuffle([0, 1, 2, 3, 4, 5].filter(i => i !== ok)).slice(0, 3), opts = shuffle([ok].concat(others));
    return { q: `Ein Unternehmen in der Rechtsform <b>${rf}</b> (Gewerbebetrieb) hat folgende Umsätze: 20x1 ${e(u[0], 0)} · 20x2 ${e(u[1], 0)} · 20x3 ${e(u[2], 0)}. Ab wann muss es doppelt buchführen?`, opts: opts.map(i => L[i]), a: opts.indexOf(ok),
      how: sc === "kap" ? "Kapitalgesellschaften sind <b>kraft Rechtsform</b> immer rechnungslegungspflichtig, unabhängig vom Umsatz." : `Regeln für Einzelunternehmen und Personengesellschaften: einmal &gt; 1 Mio. € → ab dem <b>folgenden</b> Jahr; zwei aufeinanderfolgende Jahre &gt; 700.000 € → ab dem <b>zweitfolgenden</b> Jahr.<br>Hier: <b>${L[ok]}</b>.${sc === "einmal" ? " Nur ein Jahr über 700.000 € reicht nicht (Altprüfung: Five in One KG)." : ""}` }; } },
  urg: { label: "URG-Reorganisationsbedarf", topic: "bx-urg", make: () => { const GK = R(500, 3000) * 1000, emq = one([R(2, 7), R(9, 25)]), sdt = one([R(4, 14), R(16, 30)]), EM = GK * emq / 100, MU = R(20, 200) * 1000, SCH = MU * sdt;
    const a = emq < 8, b = sdt > 15, L = ["Ja, beide Grenzen sind überschritten", "Nein, nur die Eigenmittelquote ist kritisch", "Nein, nur die Schuldentilgungsdauer ist kritisch", "Nein, beide Kennzahlen sind unkritisch"], k = a && b ? 0 : a ? 1 : b ? 2 : 3;
    return { q: `Eigenmittel ${e(EM, 0)}, Gesamtkapital ${e(GK, 0)}. Schulden (abzüglich liquider Mittel) ${e(SCH, 0)}, Mittelüberschuss aus der gewöhnlichen Geschäftstätigkeit ${e(MU, 0)}. Wird nach URG ein Reorganisationsbedarf vermutet?`, opts: L, a: k,
      how: `Eigenmittelquote = ${fmt(EM, 0)} / ${fmt(GK, 0)} = ${fmt(emq, 1)} % (${a ? "kritisch, unter 8 %" : "ok"})<br>fiktive Schuldentilgungsdauer = ${fmt(SCH, 0)} / ${fmt(MU, 0)} = ${fmt(sdt, 1)} Jahre (${b ? "kritisch, über 15" : "ok"})<br>Vermutet wird der Bedarf nur, wenn <b>beide</b> Grenzen überschritten sind.` }; } }
};
const unitFmt = (v, u, d) => u === "€" ? "€ " + fmt(v, d) : u === "%" ? fmt(v, d) + " %" : fmt(v, d) + " " + u;
function build(k) {
  const q = G[k].make(); if (q.opts) return q;
  const seen = new Set(), opts = [], add = v => { if (!isFinite(v)) return; const s = unitFmt(v, q.u, q.d); if (seen.has(s) || (q.u !== "€" && v < 0 && q.a >= 0)) return; seen.add(s); opts.push(s); };
  add(q.a); q.wrong.forEach(add);
  let guard = 0; while (opts.length < 5 && guard++ < 40) add(q.a * (1 + one([-1, 1]) * R(8, 35) / 100));
  const right = opts[0], list = shuffle(opts.slice(0, 5));
  return { q: q.q, opts: list, a: list.indexOf(right), how: q.how };
}

/* ======================= Widget ======================= */
const S = () => App.S();
W.bwlgen = (el, b, l) => {
  const keys = (b.types && b.types.length ? b.types : Object.keys(G)).filter(k => G[k]);
  let ty = keys.length === 1 ? keys[0] : "mix", cur = null, pick = null, checked = false, n = 0, ok = 0;
  const next = () => { const k = ty === "mix" ? one(keys) : ty; cur = Object.assign({ k }, build(k)); pick = null; checked = false; draw(); };
  const draw = () => {
    const k = cur.k, right = pick === cur.a;
    el.innerHTML = `<div class="w bwlgen">${App.whead(esc(b.title || "Prüfungstrainer: neue Zahlen bei jedem Versuch"), "Prüfungstrainer", n ? `<small class="muted">${ok}/${n} richtig</small>` : "")}
      ${keys.length > 1 ? `<div class="row" style="gap:6px;flex-wrap:wrap">${["mix"].concat(keys).map(x => `<button class="chip ${x === ty ? "on" : ""}" data-ty="${x}">${x === "mix" ? "Mix" : esc(G[x].label)}</button>`).join("")}</div>` : ""}
      <div class="card" style="background:var(--bg)"><small class="eyebrow">${esc(G[k].label)}</small><p style="font-size:14.5px;margin:.35em 0 0">${cur.q}</p></div>
      <div class="opts" role="radiogroup">${cur.opts.map((o, i) => `<button class="opt ${pick === i ? "sel" : ""} ${checked && i === cur.a ? "ok" : ""} ${checked && pick === i && !right ? "no" : ""}" data-i="${i}" role="radio" aria-checked="${pick === i}" ${checked ? "disabled" : ""}>${o}</button>`).join("")}</div>
      <div class="row">${checked ? `<button class="btn pri sm" id="bg-next">Neue Zahlen ↻</button>` : `<button class="btn pri sm" id="bg-chk" ${pick == null ? "disabled" : ""}>Prüfen</button><button class="btn ghost sm" id="bg-skip">Andere Aufgabe</button>`}</div>
      ${checked ? `<div class="why"><b>${right ? "✓ Richtig." : "✗ Leider falsch."} Lösungsweg</b><div>${cur.how}</div></div>` : ""}
      <small class="faint">Wie in Moodle: Die falschen Antworten sind typische Rechenfehler. In der Klausur gibt es Minuspunkte, also lieber sicher rechnen als raten.</small></div>`;
    $$("[data-i]", el).forEach(x => x.onclick = () => { if (checked) return; pick = +x.dataset.i; draw(); });
    $$("[data-ty]", el).forEach(x => x.onclick = () => { ty = x.dataset.ty; next(); });
    const c = $("#bg-chk", el); if (c) c.onclick = () => { if (pick == null) return; checked = true; n++; const r = pick === cur.a; if (r) ok++; App.rec(G[cur.k].topic, r ? 1 : 0); if (r) App.addXP(3, "bwlgen", el); if (ok >= 10 && App.wdone("bwlgen-10")) App.addXP(30, "bwlgen", el); draw(); };
    const s = $("#bg-skip", el); if (s) s.onclick = next;
    const nx = $("#bg-next", el); if (nx) nx.onclick = next;
  };
  next();
};
App.BWLGEN = G;

})();
