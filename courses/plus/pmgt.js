/* pmgt · Plus: Rechner mit Live-Graph, Animationen, durchgerechnete Beispiele und zusätzliche Fragen (über STUDYOS_EXT, siehe courses/ext-apply.js) */
(function () {
const C = window.STUDYOS_CALC = window.STUDYOS_CALC || {};
const FIG = window.STUDYOS_FIG = window.STUDYOS_FIG || {};
const FX = window.FX;
const n2 = (n, d = 2) => (typeof n === "number" && isFinite(n)) ? n.toLocaleString("de-AT", { maximumFractionDigits: d }) : "–";
const eur = n => "€ " + n2(n, 0);
const pct = n => n2(n, 1) + " %";

/* ---------- kleine Netzplan-Engine (Zeitpunktzählung wie Lektion 3.3: Start bei 0, FEZ = FAZ + D) ---------- */
const cpm = list => {
  const m = {}; list.forEach(n => { m[n.id] = n; });
  list.forEach(n => { n.faz = n.pre.length ? Math.max(...n.pre.map(p => m[p].fez)) : 0; n.fez = n.faz + n.d; });
  const end = Math.max(...list.map(n => n.fez)), succ = id => list.filter(x => x.pre.includes(id));
  list.slice().reverse().forEach(n => { const s = succ(n.id); n.sez = s.length ? Math.min(...s.map(x => x.saz)) : end; n.saz = n.sez - n.d; n.gp = n.saz - n.faz; n.fp = (s.length ? Math.min(...s.map(x => x.faz)) : end) - n.fez; });
  const paths = []; const walk = (n, acc) => { const s = succ(n.id); if (!s.length) paths.push(acc.concat(n)); else s.forEach(x => walk(x, acc.concat(n))); };
  list.filter(n => !n.pre.length).forEach(n => walk(n, []));
  return { end, list, crit: paths.filter(p => p.every(n => n.gp === 0)).map(p => p.map(n => n.id).join(" → ")) };
};
const NET = v => [{ id: "A", d: v.a, pre: [] }, { id: "B", d: v.b, pre: ["A"] }, { id: "C", d: v.c, pre: ["A"] }, { id: "D", d: v.d, pre: ["B"] }, { id: "E", d: v.e, pre: ["C"] }, { id: "F", d: v.f, pre: ["D", "E"] }];

C["pmg-netz"] = {
  title: "Netzplan-Rechner: Lektionsbeispiel A–F",
  intro: "Das Übungsnetz aus der Lektion (A → B, C · B → D · C → E · D, E → F). Ändere die Dauern und beobachte, wann der kritische Pfad wechselt und wie die Puffer schrumpfen. Gerechnet wird in Zeitpunktzählung (Start bei 0) wie in Lektion 3.3.",
  inputs: [
    { k: "a", label: "Dauer A", v: 3, min: 1, max: 15, step: 1, unit: "Tage" },
    { k: "b", label: "Dauer B (nach A)", v: 4, min: 1, max: 15, step: 1, unit: "Tage" },
    { k: "c", label: "Dauer C (nach A)", v: 2, min: 1, max: 15, step: 1, unit: "Tage" },
    { k: "d", label: "Dauer D (nach B)", v: 5, min: 1, max: 15, step: 1, unit: "Tage" },
    { k: "e", label: "Dauer E (nach C)", v: 3, min: 1, max: 15, step: 1, unit: "Tage" },
    { k: "f", label: "Dauer F (nach D und E)", v: 2, min: 1, max: 15, step: 1, unit: "Tage" }
  ],
  out: v => { const r = cpm(NET(v)), g = id => r.list.find(n => n.id === id);
    return [["Projektdauer", r.end, "Tage", true], ["Kritischer Pfad", r.crit.join(" und "), ""], ["Gesamtpuffer C / E", g("C").gp + " / " + g("E").gp, "Tage"], ["Gesamtpuffer B / D", g("B").gp + " / " + g("D").gp, "Tage"]]; },
  steps: v => { const r = cpm(NET(v)), g = id => r.list.find(n => n.id === id);
    return `<b>Vorwärts</b> (FEZ = FAZ + D, bei mehreren Vorgängern das <b>Maximum</b>):<br>FAZ(F) = max(FEZ D = ${g("D").fez}; FEZ E = ${g("E").fez}) = <b>${g("F").faz}</b> → Projektende ${r.end}<br>
    <b>Rückwärts</b> (SAZ = SEZ − D, bei mehreren Nachfolgern das <b>Minimum</b>):<br>SEZ(A) = min(SAZ B = ${g("B").saz}; SAZ C = ${g("C").saz}) = <b>${g("A").sez}</b><br>
    <table class='dt'><tr><th>Vorgang</th><th>D</th><th>FAZ</th><th>FEZ</th><th>SAZ</th><th>SEZ</th><th>GP</th><th>FP</th></tr>${r.list.map(n => `<tr${n.gp === 0 ? " style='font-weight:700'" : ""}><td>${n.id}</td><td>${n.d}</td><td>${n.faz}</td><td>${n.fez}</td><td>${n.saz}</td><td>${n.sez}</td><td>${n.gp}</td><td>${n.fp}</td></tr>`).join("")}</table>
    GP = SAZ − FAZ · FP = min FAZ(Nachfolger) − FEZ. Fett = kritisch (GP = 0). In der Tageszählung der Prüfung (Start Tag 1, FEZ = FAZ + D − 1) sind alle Anfangswerte (FAZ, SAZ) um 1 größer, die Endwerte bleiben gleich; Puffer und kritischer Pfad ändern sich nicht.`; },
  plot: { bars: v => cpm(NET(v)).list.map(n => ({ label: n.id + " (GP)", y: n.gp })), yfmt: n => n2(n, 0) }
};

/* ---------- PERT mit Beta-Verteilung ---------- */
const LG = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
const lgam = z => { if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgam(1 - z); z -= 1; let x = LG[0]; for (let i = 1; i < 9; i++) x += LG[i] / (z + i); const t = z + 7.5; return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x); };
const pertPdf = (x, a, m, b) => { if (!(b > a) || x <= a || x >= b) return 0; const al = 1 + 4 * (m - a) / (b - a), be = 1 + 4 * (b - m) / (b - a), lb = lgam(al) + lgam(be) - lgam(al + be);
  return Math.exp((al - 1) * Math.log(x - a) + (be - 1) * Math.log(b - x) - lb - (al + be - 1) * Math.log(b - a)); };
C["pmg-pert"] = {
  title: "PERT-Rechner: Drei-Zeiten-Schätzung",
  intro: "Optimistische, wahrscheinlichste und pessimistische Dauer eingeben. Die Kurve zeigt die Beta-Verteilung, die PERT unterstellt. Schiebe T<sub>p</sub> nach rechts: Der Erwartungswert wandert über den wahrscheinlichsten Wert.",
  inputs: [
    { k: "o", label: "optimistisch T<sub>o</sub>", v: 2, min: 0, max: 30, step: 0.5, unit: "Tage" },
    { k: "w", label: "wahrscheinlich T<sub>w</sub>", v: 5, min: 0, max: 40, step: 0.5, unit: "Tage" },
    { k: "p", label: "pessimistisch T<sub>p</sub>", v: 14, min: 0, max: 60, step: 0.5, unit: "Tage" }
  ],
  out: v => { const ok = v.o <= v.w && v.w <= v.p && v.p > v.o, tm = (v.o + 4 * v.w + v.p) / 6;
    return ok ? [["Erwartete Dauer T<sub>m</sub>", tm, "Tage", true], ["Abstand zu T<sub>w</sub>", (tm - v.w >= 0 ? "+" : "") + n2(tm - v.w), "Tage"], ["Standardabweichung σ (Zusatz)", (v.p - v.o) / 6, "Tage"], ["Spannweite T<sub>p</sub> − T<sub>o</sub>", v.p - v.o, "Tage"]]
      : [["Eingabe prüfen", "T<sub>o</sub> ≤ T<sub>w</sub> ≤ T<sub>p</sub> nötig", "", true]]; },
  steps: v => { const tm = (v.o + 4 * v.w + v.p) / 6;
    return `T<sub>m</sub> = (T<sub>o</sub> + 4 · T<sub>w</sub> + T<sub>p</sub>) / 6 = (${n2(v.o)} + 4 · ${n2(v.w)} + ${n2(v.p)}) / 6 = ${n2(v.o + 4 * v.w + v.p)} / 6 = <b>${n2(tm)} Tage</b><br>
    Der wahrscheinlichste Wert zählt vierfach, die Extremwerte je einfach. Liegt T<sub>p</sub> weiter weg als T<sub>o</sub>, ist die Verteilung rechtsschief und T<sub>m</sub> &gt; T<sub>w</sub>.<br>
    <span class='muted'>Zusatz (über die Folie hinaus, in der Literatur üblich): σ = (T<sub>p</sub> − T<sub>o</sub>) / 6 = ${n2((v.p - v.o) / 6)} Tage als Maß für die Unsicherheit. Prüfungsrelevant ist die T<sub>m</sub>-Formel.</span>`; },
  plot: { x: v => [Math.max(0, v.o - (v.p - v.o) * 0.08), v.p + (v.p - v.o) * 0.08 + 0.01], xl: "Dauer (Tage)", yl: "Dichte",
    fns: [{ label: "Beta-Verteilung (PERT)", f: (x, v) => pertPdf(x, v.o, v.w, v.p) }],
    points: v => { const tm = (v.o + 4 * v.w + v.p) / 6; return v.o <= v.w && v.w <= v.p && v.p > v.o ? [{ x: v.w, y: pertPdf(v.w, v.o, v.w, v.p), label: "T_w" }, { x: tm, y: pertPdf(tm, v.o, v.w, v.p), label: "T_m" }] : []; },
    yfmt: n => n2(n, 3) }
};

/* ---------- Prozentsatzmethode ---------- */
C["pmg-proz"] = {
  title: "Prozentsatzmethode: von einer Phase auf das Projekt schließen",
  intro: "Die Definitionsphase ist abgeschlossen und gemessen. Mit der durchschnittlichen Aufwandsverteilung aus alten Projekten (Folie: 18 / 19 / 34 / 29 %) wird auf den Gesamtaufwand hochgerechnet. Der Zuschlag deckt PM, Dokumentation, Schulung usw. ab (Folie: 10–30 %).",
  inputs: [
    { k: "ist", label: "Ist-Aufwand Definition", v: 90, min: 1, max: 1000, step: 1, unit: "PT" },
    { k: "pd", label: "Anteil Definition", v: 18, min: 1, max: 60, step: 1, unit: "%" },
    { k: "pe", label: "Anteil Entwurf", v: 19, min: 0, max: 60, step: 1, unit: "%" },
    { k: "pc", label: "Anteil Codierung", v: 34, min: 0, max: 70, step: 1, unit: "%" },
    { k: "pt", label: "Anteil Test", v: 29, min: 0, max: 60, step: 1, unit: "%" },
    { k: "z", label: "Zuschlag PM, Doku, Schulung", v: 20, min: 0, max: 40, step: 1, unit: "%" }
  ],
  out: v => { const g = v.ist / (v.pd / 100), s = v.pd + v.pe + v.pc + v.pt;
    return [["Gesamtaufwand Entwicklung", g, "PT", true], ["Entwurf", g * v.pe / 100, "PT"], ["Codierung", g * v.pc / 100, "PT"], ["Test", g * v.pt / 100, "PT"], ["inkl. Zuschlag", g * (1 + v.z / 100), "PT"], ["Summe der Anteile", s, s === 100 ? "% ✓" : "% (≠ 100!)"]]; },
  steps: v => { const g = v.ist / (v.pd / 100);
    return `Gesamt = Ist-Aufwand / Anteil = ${n2(v.ist)} PT / ${n2(v.pd / 100, 3)} = <b>${n2(g, 1)} PT</b><br>
    Entwurf = ${n2(v.pe)} % · ${n2(g, 1)} = ${n2(g * v.pe / 100, 1)} PT · Codierung = ${n2(v.pc)} % · ${n2(g, 1)} = ${n2(g * v.pc / 100, 1)} PT · Test = ${n2(v.pt)} % · ${n2(g, 1)} = ${n2(g * v.pt / 100, 1)} PT<br>
    Mit Zuschlag: ${n2(g, 1)} · (1 + ${n2(v.z / 100)}) = <b>${n2(g * (1 + v.z / 100), 1)} PT</b><br>
    <span class='muted'>Plausibilisieren: Laut Folie immer mit mindestens zwei Methoden parallel schätzen (z. B. zusätzlich Stichprobe oder Analogie).</span>`; },
  plot: { bars: v => { const g = v.ist / (v.pd / 100); return [{ label: "Definition", y: v.ist }, { label: "Entwurf", y: g * v.pe / 100 }, { label: "Codierung", y: g * v.pc / 100 }, { label: "Test", y: g * v.pt / 100 }, { label: "Zuschlag", y: g * v.z / 100 }]; }, yfmt: n => n2(n, 0) }
};

/* ---------- Kommunikationspfade (Speed-up < 1) ---------- */
C["pmg-team"] = {
  title: "Teamgröße und Kommunikationspfade",
  intro: "Jede zusätzliche Person erzeugt Koordinationsaufwand (Folie: Speed-up-Faktor &lt; 1). Die Zahl der möglichen Zweierbeziehungen wächst quadratisch, die Arbeitskraft nur linear.",
  inputs: [{ k: "n", label: "Teamgröße n", v: 8, min: 2, max: 25, step: 1, unit: "Pers." }],
  out: v => { const n = Math.round(v.n), k = n * (n - 1) / 2; return [["Kommunikationspfade", k, "", true], ["Pfade pro Person", n - 1, ""], ["bei doppelter Teamgröße", 2 * n * (2 * n - 1) / 2, "Pfade"]]; },
  steps: v => { const n = Math.round(v.n); return `Pfade = n · (n − 1) / 2 = ${n} · ${n - 1} / 2 = <b>${n * (n - 1) / 2}</b><br>Verdoppelt man das Team auf ${2 * n} Personen, steigen die Pfade auf ${2 * n} · ${2 * n - 1} / 2 = <b>${n * (2 * n - 1)}</b>, also etwa auf das Vierfache. Darum bringt doppelt so viel Personal nicht die halbe Dauer.`; },
  plot: { x: [1, 25], xl: "Teamgröße n", yl: "Anzahl",
    fns: [{ label: "Kommunikationspfade n(n−1)/2", f: x => x * (x - 1) / 2 }, { label: "Arbeitskraft (n Personen)", f: x => x }],
    points: v => [{ x: Math.round(v.n), y: Math.round(v.n) * (Math.round(v.n) - 1) / 2, label: Math.round(v.n) + " Pers." }], xfmt: n => n2(n, 0) }
};

/* ---------- Stundenverrechnungssatz und Plan-/Ist-Kosten eines Arbeitspakets ---------- */
C["pmg-svs"] = {
  title: "Stundenverrechnungssatz und Kosten eines Arbeitspakets",
  intro: "Aufwand (Stunden) wird über den Stundenverrechnungssatz zu Kosten. Satz = Jahresbudget der Kostenstelle / geleistete Stunden im Jahr (ohne Ausfallzeiten).",
  inputs: [
    { k: "bud", label: "Jahresbudget Kostenstelle", v: 600000, min: 50000, max: 2000000, step: 10000, unit: "€" },
    { k: "h", label: "geleistete Stunden pro Jahr", v: 8000, min: 1000, max: 30000, step: 100, unit: "h" },
    { k: "hp", label: "Plan-Stunden Arbeitspaket", v: 120, min: 1, max: 1000, step: 1, unit: "h" },
    { k: "hi", label: "Ist-Stunden Arbeitspaket", v: 150, min: 0, max: 1000, step: 1, unit: "h" }
  ],
  out: v => { const s = v.bud / v.h; return [["Stundenverrechnungssatz", s, "€/h", true], ["Plankosten AP (Umlage)", s * v.hp, "€"], ["Istkosten AP", s * v.hi, "€"], ["Abweichung", (v.hi >= v.hp ? "+" : "") + n2(s * (v.hi - v.hp), 0), "€"], ["Abweichung in %", v.hp ? (v.hi - v.hp) / v.hp * 100 : 0, "%"]]; },
  steps: v => { const s = v.bud / v.h; return `Satz = ${eur(v.bud)} / ${n2(v.h, 0)} h = <b>${n2(s)} €/h</b><br>Plankosten = ${n2(s)} €/h · ${v.hp} h = ${eur(s * v.hp)}<br>Istkosten = ${n2(s)} €/h · ${v.hi} h = ${eur(s * v.hi)}<br>Abweichung = ${eur(s * (v.hi - v.hp))} (${n2(v.hp ? (v.hi - v.hp) / v.hp * 100 : 0, 1)} %)<br><span class='muted'>Aufwand = nicht monetär (Stunden), Kosten = monetär bewerteter Aufwand.</span>`; },
  plot: { bars: v => { const s = v.bud / v.h; return [{ label: "Plankosten", y: s * v.hp }, { label: "Istkosten", y: s * v.hi }]; }, yfmt: n => n2(n, 0) }
};

/* ---------- Arbeitswert / Earned Value ---------- */
const ev = v => { const ts = Math.min(v.t, v.T), pv = v.bac * ts / v.T, evv = v.bac * v.fg / 100, ac = v.ac, cpi = ac > 0 ? evv / ac : NaN, spi = pv > 0 ? evv / pv : NaN;
  return { ts, pv, ev: evv, ac, kli: evv > 0 ? ac / evv : NaN, cpi, spi, eac: evv > 0 ? v.bac * ac / evv : NaN, tend: spi > 0 ? v.T / spi : NaN }; };
C["pmg-ev"] = {
  title: "Arbeitswert-Rechner (Earned Value)",
  intro: "Liegt eine den aufgewendeten Kosten entsprechende Leistung vor? Der <b>Arbeitswert</b> (geplante Kosten der tatsächlich erbrachten Leistung) beantwortet genau diese Kernfrage der Sachfortschrittskontrolle. Plankosten verlaufen hier vereinfachend linear.",
  inputs: [
    { k: "bac", label: "Plankosten gesamt", v: 200000, min: 10000, max: 1000000, step: 5000, unit: "€" },
    { k: "T", label: "Plandauer", v: 10, min: 1, max: 36, step: 1, unit: "Monate" },
    { k: "t", label: "Stichtag", v: 4, min: 0.5, max: 36, step: 0.5, unit: "Monat" },
    { k: "ac", label: "Istkosten bis Stichtag", v: 95000, min: 0, max: 1000000, step: 1000, unit: "€" },
    { k: "fg", label: "Fertigstellungsgrad", v: 40, min: 0, max: 100, step: 1, unit: "%" }
  ],
  out: v => { const r = ev(v);
    return [["Arbeitswert (EV)", r.ev, "€"], ["Plankosten bis Stichtag (PV)", r.pv, "€"], ["Kosten-Leistungs-Index (Folie) = Ist / Arbeitswert", isFinite(r.kli) ? n2(r.kli) + (r.kli > 1 ? " schlecht" : " gut") : "–", "", true],
      ["CPI = EV / AC (international)", r.cpi, ""], ["SPI = EV / PV", r.spi, ""], ["Kostenabweichung CV = EV − AC", r.ev - r.ac, "€"], ["Prognose Gesamtkosten EAC", r.eac, "€"]]; },
  steps: v => { const r = ev(v);
    return `Arbeitswert EV = Plankosten · Fertigstellungsgrad = ${eur(v.bac)} · ${n2(v.fg)} % = <b>${eur(r.ev)}</b><br>
    Plankosten bis Stichtag (linear) PV = ${eur(v.bac)} · ${n2(r.ts)} / ${v.T} = ${eur(r.pv)}<br>
    <b>Kosten-Leistungs-Index</b> (Folie) = aufgelaufene Istkosten / Arbeitswert = ${eur(r.ac)} / ${eur(r.ev)} = <b>${n2(r.kli)}</b> (Werte &gt; 1 = schlechter Fortschritt)<br>
    International (Earned Value Management): CPI = EV / AC = ${n2(r.cpi)} (Werte &lt; 1 = schlecht), SPI = EV / PV = ${n2(r.spi)}<br>
    CV = EV − AC = ${eur(r.ev - r.ac)} · SV = EV − PV = ${eur(r.ev - r.pv)}<br>
    Prognose bei gleichbleibender Kosteneffizienz: EAC = Plankosten / CPI = ${eur(v.bac)} / ${n2(r.cpi)} = <b>${eur(r.eac)}</b><br>
    <span class='muted'>Vergleich: Der absolute Plan-/Ist-Vergleich (${eur(r.ac)} von ${eur(v.bac)} = ${n2(r.ac / v.bac * 100, 1)} % verbraucht) sagt über die Leistung nichts aus.</span>`; },
  plot: { x: v => { const r = ev(v); return [0, Math.max(v.T, isFinite(r.tend) ? Math.min(r.tend, v.T * 3) : v.T) * 1.05]; }, xl: "Monat", yl: "€",
    fns: [{ label: "Plankosten (linear)", f: (x, v) => v.bac * Math.min(x, v.T) / v.T },
      { label: "Istkosten", f: (x, v) => x <= Math.min(v.t, v.T) ? v.ac * x / Math.min(v.t, v.T) : NaN },
      { label: "Arbeitswert", f: (x, v) => x <= Math.min(v.t, v.T) ? v.bac * v.fg / 100 * x / Math.min(v.t, v.T) : NaN },
      { label: "Prognose Istkosten", f: (x, v) => { const r = ev(v), te = isFinite(r.tend) ? Math.min(r.tend, v.T * 3) : v.T; return x >= r.ts && x <= te && te > r.ts ? r.ac + (r.eac - r.ac) * (x - r.ts) / (te - r.ts) : NaN; } }],
    points: v => { const r = ev(v), te = isFinite(r.tend) ? Math.min(r.tend, v.T * 3) : NaN; return isFinite(r.eac) && isFinite(te) ? [{ x: te, y: r.eac, label: "EAC" }] : []; },
    xfmt: n => n2(n, 1), yfmt: n => n >= 1000 ? n2(n / 1000, 0) + "k" : n2(n, 0) }
};

/* ---------- Burndown ---------- */
C["pmg-burn"] = {
  title: "Sprint-Burndown: ideal vs. tatsächlich",
  intro: "Burndown-Charts sind laut Scrum Guide nützlich, ersetzen aber nicht die Empirie. Gib den Sprintumfang und den heutigen Stand ein. Der Trend wird vereinfachend linear aus dem bisherigen Tempo fortgeschrieben.",
  inputs: [
    { k: "L", label: "Sprintlänge", v: 10, min: 3, max: 20, step: 1, unit: "Arbeitstage" },
    { k: "S", label: "Umfang zu Sprintbeginn", v: 40, min: 5, max: 200, step: 1, unit: "Punkte" },
    { k: "t", label: "heute: Ende von Tag", v: 6, min: 1, max: 20, step: 1, unit: "" },
    { k: "done", label: "bisher erledigt (DoD erfüllt)", v: 20, min: 0, max: 200, step: 1, unit: "Punkte" }
  ],
  out: v => { const t = Math.min(v.t, v.L), ideal = v.S * (1 - t / v.L), rest = Math.max(0, v.S - v.done), vel = v.done / t, need = v.L - t > 0 ? rest / (v.L - t) : NaN, fc = Math.max(0, v.S - vel * v.L);
    return [["Rest laut Ideallinie", ideal, "Punkte"], ["Rest tatsächlich", rest, "Punkte"], ["Abstand zur Ideallinie", (rest - ideal > 0 ? "+" : "") + n2(rest - ideal, 1), "Punkte", true], ["bisheriges Tempo", vel, "Punkte/Tag"], ["nötiges Tempo bis Sprintende", isFinite(need) ? n2(need, 1) : "–", "Punkte/Tag"], ["Prognose offen am Sprintende", fc, "Punkte"]]; },
  steps: v => { const t = Math.min(v.t, v.L), ideal = v.S * (1 - t / v.L), rest = Math.max(0, v.S - v.done), vel = v.done / t;
    return `Ideallinie: Rest(t) = ${v.S} · (1 − ${t}/${v.L}) = <b>${n2(ideal, 1)}</b> Punkte<br>Tatsächlich offen: ${v.S} − ${v.done} = <b>${rest}</b> Punkte → ${rest > ideal ? "hinter" : "vor bzw. auf"} der Ideallinie<br>
    Tempo bisher: ${v.done} / ${t} = ${n2(vel, 2)} Punkte/Tag · nötig: ${rest} / ${v.L - t || "–"} = ${v.L - t > 0 ? n2(rest / (v.L - t), 2) : "–"} Punkte/Tag<br>
    <span class='muted'>Story Points und Burndown-Charts stehen nicht im Scrum Guide 2020, sind aber verbreitete Praxis. Ist das Sprint-Ziel gefährdet, wird der Umfang mit dem:der Product Owner:in neu verhandelt, die Qualität (DoD) bleibt.</span>`; },
  plot: { x: v => [0, v.L], xl: "Sprinttag", yl: "offene Punkte", y: v => [0, v.S * 1.08],
    fns: [{ label: "Ideallinie", f: (x, v) => Math.max(0, v.S * (1 - x / v.L)) },
      { label: "tatsächlich (bis heute)", f: (x, v) => x <= Math.min(v.t, v.L) ? v.S - v.done * x / Math.min(v.t, v.L) : NaN },
      { label: "Trend", f: (x, v) => { const t = Math.min(v.t, v.L); return x >= t ? Math.max(0, v.S - v.done - v.done / t * (x - t)) : NaN; } }],
    points: v => [{ x: Math.min(v.t, v.L), y: Math.max(0, v.S - v.done), label: "heute" }], xfmt: n => n2(n, 0) }
};

/* ---------- Nutzwertanalyse (Entscheidungstechnik / Wirtschaftlichkeitsanalyse) ---------- */
C["pmg-nwa"] = {
  title: "Nutzwertanalyse: PM-Software A oder B?",
  intro: "Entscheidungstechnik laut Folie (Punktebewertung/Nutzwertanalyse). Gewichte (werden auf 100 % normiert) und Punkte 0–10 je Kriterium eingeben. Die Balken zeigen die gewichteten Teilnutzen.",
  inputs: [
    { k: "g1", label: "Gewicht Kosten", v: 30, min: 0, max: 100, step: 5, unit: "%" },
    { k: "g2", label: "Gewicht Funktionsumfang", v: 50, min: 0, max: 100, step: 5, unit: "%" },
    { k: "g3", label: "Gewicht Bedienbarkeit", v: 20, min: 0, max: 100, step: 5, unit: "%" },
    { k: "a1", label: "A: Kosten", v: 8, min: 0, max: 10, step: 1, unit: "Pkt" },
    { k: "a2", label: "A: Funktionsumfang", v: 6, min: 0, max: 10, step: 1, unit: "Pkt" },
    { k: "a3", label: "A: Bedienbarkeit", v: 7, min: 0, max: 10, step: 1, unit: "Pkt" },
    { k: "b1", label: "B: Kosten", v: 5, min: 0, max: 10, step: 1, unit: "Pkt" },
    { k: "b2", label: "B: Funktionsumfang", v: 9, min: 0, max: 10, step: 1, unit: "Pkt" },
    { k: "b3", label: "B: Bedienbarkeit", v: 6, min: 0, max: 10, step: 1, unit: "Pkt" }
  ],
  out: v => { const s = v.g1 + v.g2 + v.g3 || 1, g = [v.g1 / s, v.g2 / s, v.g3 / s], A = g[0] * v.a1 + g[1] * v.a2 + g[2] * v.a3, B = g[0] * v.b1 + g[1] * v.b2 + g[2] * v.b3;
    return [["Nutzwert A", A, ""], ["Nutzwert B", B, ""], ["Empfehlung", Math.abs(A - B) < 1e-9 ? "Gleichstand" : A > B ? "Software A" : "Software B", "", true], ["Vorsprung", Math.abs(A - B), "Punkte"]]; },
  steps: v => { const s = v.g1 + v.g2 + v.g3 || 1, g = [v.g1 / s, v.g2 / s, v.g3 / s], A = g[0] * v.a1 + g[1] * v.a2 + g[2] * v.a3, B = g[0] * v.b1 + g[1] * v.b2 + g[2] * v.b3;
    return `Gewichte normiert: ${g.map(x => n2(x, 3)).join(" · ")} (Summe 1)<br>
    N(A) = ${n2(g[0], 3)} · ${v.a1} + ${n2(g[1], 3)} · ${v.a2} + ${n2(g[2], 3)} · ${v.a3} = <b>${n2(A)}</b><br>
    N(B) = ${n2(g[0], 3)} · ${v.b1} + ${n2(g[1], 3)} · ${v.b2} + ${n2(g[2], 3)} · ${v.b3} = <b>${n2(B)}</b><br>
    <span class='muted'>K.-o.-Kriterien (z. B. Datenschutz in der EU) vorher prüfen, nicht in Punkte übersetzen. Kippt die Empfehlung schon bei kleinen Gewichtsänderungen, ist das Ergebnis nicht robust.</span>`; },
  plot: { bars: v => { const s = v.g1 + v.g2 + v.g3 || 1, g = [v.g1 / s, v.g2 / s, v.g3 / s];
    return [{ label: "A Kosten", y: g[0] * v.a1 }, { label: "B Kosten", y: g[0] * v.b1 }, { label: "A Funkt.", y: g[1] * v.a2 }, { label: "B Funkt.", y: g[1] * v.b2 }, { label: "A Bedien.", y: g[2] * v.a3 }, { label: "B Bedien.", y: g[2] * v.b3 }, { label: "A gesamt", y: g[0] * v.a1 + g[1] * v.a2 + g[2] * v.a3 }, { label: "B gesamt", y: g[0] * v.b1 + g[1] * v.b2 + g[2] * v.b3 }]; }, yfmt: n => n2(n, 2) }
};

/* ================= Animationen ================= */
const { svg, g, t, tl, r, box, l, p, c, dot } = FX;

/* 1 · Netzplan vorwärts/rückwärts (Lektionsbeispiel) */
const NP = { A: [16, 117, 3, [0, 3, 0, 3, 0]], B: [170, 36, 4, [3, 7, 3, 7, 0]], C: [170, 190, 2, [3, 5, 7, 9, 4]], D: [326, 36, 5, [7, 12, 7, 12, 0]], E: [326, 190, 3, [5, 8, 9, 12, 4]], F: [482, 117, 2, [12, 14, 12, 14, 0]] };
const FW = { A: 1, B: 1, C: 1, D: 2, E: 2, F: 3 }, BW = { F: 4, D: 4, E: 4, B: 5, C: 5, A: 5 };
const NW = 108, NH = 66;
const node = (id) => { const [x, y, d, [faz, fez, saz, sez, gp]] = NP[id];
  return g({ hl: id === "F" ? 3 : id === "A" ? 5 : undefined }, r(x, y, NW, NH, { cls: "fx-card" })) +
    `<line x1="${x}" y1="${y + 22}" x2="${x + NW}" y2="${y + 22}" class="fx-ln thin"/><line x1="${x}" y1="${y + 44}" x2="${x + NW}" y2="${y + 44}" class="fx-ln thin"/>` +
    t(x + NW / 2, y + 38, id + " · " + d + " T", { fw: 700 }) +
    g({ st: FW[id] }, t(x + 8, y + 16, faz, { a: "start", fw: 700, cls: "fx-sub" }) + t(x + NW - 8, y + 16, fez, { a: "end", fw: 700, cls: "fx-sub" })) +
    g({ st: BW[id] }, t(x + 8, y + 60, saz, { a: "start", fw: 700, cls: "fx-sub" }) + t(x + NW - 8, y + 60, sez, { a: "end", fw: 700, cls: "fx-sub" })) +
    g({ st: 6 }, t(x + NW / 2, y + (y > 150 ? NH + 16 : -6), "GP " + gp, { fw: 700, cls: gp ? "" : "fx-sub", fs: 12 })); };
const edge = (a, b, crit) => { const [x1, y1] = NP[a], [x2, y2] = NP[b], d = `M${x1 + NW} ${y1 + NH / 2} L${x2 - 2} ${y2 + NH / 2}`;
  return p(d, { arrow: true }) + (crit ? p(d, { cls: "acc", arrow: true, acc: true, st: 6 }) : ""); };
FIG["pmg-fig-netz"] = { title: "Netzplan vorwärts und rückwärts rechnen",
  svg: () => svg(640, 300,
    edge("A", "B", 1) + edge("A", "C") + edge("B", "D", 1) + edge("C", "E") + edge("D", "F", 1) + edge("E", "F") +
    Object.keys(NP).map(node).join("") +
    t(20, 292, "oben: FAZ | FEZ · unten: SAZ | SEZ · Zeitpunktzählung (Start 0)", { a: "start", cls: "fx-sub", fs: 11 })),
  steps: [
    "Das Übungsnetz aus der Lektion: sechs Vorgänge mit Dauer in Tagen. Oben im Knoten stehen gleich FAZ und FEZ, unten SAZ und SEZ.",
    "<b>Vorwärts</b>: A startet bei 0, FEZ = 0 + 3 = 3. B und C haben nur A als Vorgänger: FAZ = 3, FEZ(B) = 7, FEZ(C) = 5.",
    "D folgt auf B: FAZ 7, FEZ 12. E folgt auf C: FAZ 5, FEZ 8.",
    "F hat <b>zwei</b> Vorgänger: FAZ = <b>Maximum</b>(12; 8) = 12, FEZ = 14. Das Projekt dauert 14 Tage.",
    "<b>Rückwärts</b> ab dem Ende: SEZ(F) = 14, SAZ = 12. D und E müssen spätestens bei 12 fertig sein: SAZ(D) = 7, SAZ(E) = 9.",
    "B: SEZ 7, SAZ 3. C: SEZ 9, SAZ 7. A hat zwei Nachfolger: SEZ = <b>Minimum</b>(3; 7) = 3, SAZ = 0.",
    "Gesamtpuffer GP = SAZ − FAZ: C und E je 4 Tage, alle anderen 0. Der <b>kritische Pfad</b> A → B → D → F hat keinen Puffer. C hat 4 Tage GP, aber 0 freien Puffer (E wartet direkt auf C)."
  ] };

/* 2 · Meilensteintrendanalyse */
const MX = m => 70 + m * 60, MY = tt => 260 - tt * 26;
const mline = (pts, cls, label, on) => g({ on }, p("M" + pts.map((y, i) => MX(i) + " " + MY(y)).join(" L"), { cls }) + pts.map((y, i) => c(MX(i), MY(y), 4.2, { cls: "fx-acc" })).join("") + t(MX(pts.length - 1) + 9, MY(pts[pts.length - 1]) + 4, label, { a: "start", fw: 700, fs: 12 }));
FIG["pmg-fig-mta"] = { title: "Meilensteintrendanalyse: fünf typische Verläufe",
  svg: () => svg(640, 300,
    FX.axes(70, 40, 500, 220, "Berichtszeitpunkt (Monat)", "prognostizierter Termin (Monat)") +
    [0, 2, 4, 6, 8].map(m => t(MX(m), 276, m, { cls: "fx-sub", fs: 10.5 }) + t(60, MY(m) + 4, m, { a: "end", cls: "fx-sub", fs: 10.5 })).join("") +
    `<line x1="${MX(0)}" y1="${MY(0)}" x2="${MX(7.6)}" y2="${MY(7.6)}" class="fx-ln dash"/>` + t(MX(7.1) - 6, MY(7.6) + 2, "Meilenstein erreicht", { a: "end", cls: "fx-sub", fs: 11 }) +
    `<line x1="${MX(0)}" y1="${MY(5)}" x2="${MX(6.5)}" y2="${MY(5)}" class="fx-ln thin" data-on="1,2,3,4,5"/>` +
    mline([5, 5, 5, 5, 5], "acc", "stabil", "1") +
    mline([4.2, 4.9, 5.7, 6.5, 7.3], "bad", "zu optimistisch", "2") +
    mline([6.6, 6.3, 5.9, 5.6, 5.3], "ok", "zu viel Puffer", "3") +
    mline([5, 6, 5.2, 6.3, 5.4, 6.6], "warn", "unsicher", "4") +
    mline([5, 5, 5, 5.8, 6.9], "bad", "Trendwende", "5")),
  steps: [
    "x-Achse: <b>wann</b> berichtet wird. y-Achse: der zu diesem Zeitpunkt <b>geschätzte Fertigstellungstermin</b> des Meilensteins. Die Diagonale markiert: Berichtstag = Termin, der Meilenstein ist erreicht.",
    "<b>Waagrechte Linie</b>: Bei jedem Bericht wird Monat 5 bestätigt. Der Termin wird stabil gehalten, die Linie trifft die Diagonale in Monat 5.",
    "<b>Extrem ansteigend</b>: Der Termin rutscht bei jedem Bericht weiter nach hinten. Deutung: zu <b>optimistische</b> Schätzungen.",
    "<b>Gleichmäßig fallend</b>: Der Termin wird immer früher. Deutung: Planung mit zu großen <b>Sicherheitspuffern</b>, Ressourcen waren gebunden, die anderswo fehlten.",
    "<b>Zick-Zack</b>: mal später, mal früher. Deutung: große <b>Unsicherheit</b> in den Terminaussagen, die Schätzer:innen kennen den Stand selbst nicht.",
    "<b>Trendwende</b>: lange stabil, dann plötzlich steil nach hinten. Deutung: <b>frühzeitig realistische Terminaussagen fehlen</b>, Probleme wurden zu spät gemeldet."
  ] };

/* 3 · Scrum-Zyklus */
FIG["pmg-fig-scrum"] = { title: "Ein Sprint im Scrum-Rahmenwerk",
  svg: () => svg(640, 300,
    box(14, 100, 112, 56, "Product|Backlog", { cls: "fx-soft", hl: 0 }) +
    g({ st: 7 }, t(70, 174, "Produkt-Ziel", { fw: 700, fs: 11.5 })) +
    g({ st: 1 }, l(126, 128, 146, 128, { arrow: true }) + box(148, 100, 116, 56, "Sprint|Planning", { hl: 1 }) + t(206, 174, "max. 8 h", { cls: "fx-sub", fs: 11 })) +
    g({ st: 2 }, l(264, 128, 284, 128, { arrow: true }) + box(286, 100, 104, 56, "Sprint|Backlog", { cls: "fx-soft", hl: 2 }) + g({ st: 7 }, t(338, 174, "Sprint-Ziel", { fw: 700, fs: 11.5 }))) +
    g({ st: 3 }, l(390, 128, 406, 128, { arrow: true }) + c(460, 128, 52, { cls: "fx-soft" }) + tl(460, 120, "Sprint|≤ 1 Monat", { fw: 700 }) + t(460, 152, "Daily 15 min", { fs: 10.5, cls: "fx-sub" }) + dot("M460 76 a52 52 0 1 1 -0.1 0", { dur: 3.2 })) +
    g({ st: 4 }, l(512, 128, 528, 128, { arrow: true }) + box(530, 100, 98, 56, "Increment", { cls: "fx-acc", hl: 4 }) + g({ st: 7 }, t(579, 174, "Definition of Done", { fw: 700, fs: 11 }))) +
    g({ st: 5 }, p("M579 156 L579 214 L556 228", { arrow: true }) + box(424, 222, 132, 50, "Sprint Review|max. 4 h", { hl: 5, fs: 12 })) +
    g({ st: 6 }, l(424, 247, 396, 247, { arrow: true }) + box(244, 222, 150, 50, "Retrospektive|max. 3 h", { hl: 6, fs: 12 }) + p("M244 247 L70 247 L70 184", { arrow: true, cls: "acc", acc: true }) + t(158, 241, "nächster Sprint", { cls: "fx-sub", fs: 11 }))),
  steps: [
    "Ausgangspunkt ist das <b>Product Backlog</b>: die emergente, geordnete Liste aller Arbeit am Produkt. Der:die Product Owner:in legt die Reihenfolge fest.",
    "<b>Sprint Planning</b> (max. 8 h bei einem Monat): Warum ist der Sprint wertvoll (Sprint-Ziel)? Was kann Done werden? Wie wird die Arbeit erledigt?",
    "Ergebnis ist das <b>Sprint Backlog</b>: Sprint-Ziel (Wofür) + ausgewählte Einträge (Was) + Plan (Wie). Es gehört den Developer:innen.",
    "Der <b>Sprint</b> läuft mit fester Länge (≤ 1 Monat). Täglich prüfen die Developer:innen im <b>Daily Scrum</b> (15 min) den Fortschritt zum Sprint-Ziel und passen den Plan an.",
    "Erfüllt ein Eintrag die Definition of Done, entsteht ein <b>Increment</b>: verwendbar, additiv, gründlich geprüft. Es darf auch schon vor Sprintende geliefert werden.",
    "Im <b>Sprint Review</b> (max. 4 h) prüfen Team und Stakeholder:innen das Ergebnis und legen Anpassungen fest. Es ist ein Arbeitstermin, keine reine Präsentation.",
    "Die <b>Retrospektive</b> (max. 3 h) schließt den Sprint ab: Wie werden wir besser? Danach beginnt sofort der nächste Sprint.",
    "Jedes Artefakt hat ein <b>Commitment</b>: Product Backlog → Produkt-Ziel · Sprint Backlog → Sprint-Ziel · Increment → Definition of Done."
  ] };

/* 4 · Projektorganisationsformen */
const DEP = [["Entwicklung", 24], ["Produktion", 184], ["Vertrieb", 344]];
const MA = DEP.flatMap(([n, x], i) => [[x + 2, i * 2], [x + 66, i * 2 + 1]]);
const PM = [1, 2, 5];
FIG["pmg-fig-org"] = { title: "Projektorganisationsformen im Vergleich",
  svg: () => svg(640, 300,
    box(255, 14, 130, 34, "Geschäftsführung", { fs: 12 }) +
    p("M320 48 V66 M86 66 H406 M86 66 V84 M246 66 V84 M406 66 V84") +
    DEP.map(([n, x]) => box(x, 84, 124, 34, n, { fs: 12 }) + p(`M${x + 62} 118 V134 H${x + 30} V150 M${x + 62} 134 H${x + 94} V150`)).join("") +
    MA.map(([x, i]) => PM.includes(i) ? g({ on: "0,1,2" }, box(x, 150, 56, 28, "MA", { cls: "fx-soft", fs: 11 })) + g({ on: "3" }, r(x, 150, 56, 28, { cls: "fx-ghost" })) : box(x, 150, 56, 28, "MA", { fs: 11 })).join("") +
    g({ on: "1" }, `<line x1="385" y1="31" x2="436" y2="31" class="fx-ln dash"/>` + box(436, 14, 150, 34, "Projektkoordinator:in", { cls: "fx-warn", fs: 11.5 }) +
      PM.map(i => p(`M511 48 L${MA[i][0] + 28} 150`, { cls: "dash" })).join("") + t(520, 70, "nur Koordination", { a: "start", cls: "fx-sub", fs: 11 })) +
    g({ on: "2" }, box(24, 236, 140, 34, "Projektleitung", { cls: "fx-acc", fs: 12 }) + p(`M164 253 H${MA[5][0] + 28}`, { cls: "acc" }) +
      PM.map(i => l(MA[i][0] + 28, 253, MA[i][0] + 28, 180, { cls: "acc", arrow: true, acc: true })).join("") + t(330, 270, "fachliche Weisung (Projekt)", { cls: "fx-sub", fs: 11 }) + t(470, 140, "disziplinarisch: Linie", { a: "start", cls: "fx-sub", fs: 11 })) +
    g({ on: "3" }, p("M406 66 H566 V84") + box(504, 84, 124, 34, "Projekt (PL)", { cls: "fx-acc", fs: 12 }) + p("M566 118 V134 H534 V150 M566 134 H598 V150 M566 134 V196") +
      box(506, 150, 56, 28, "MA", { cls: "fx-soft", fs: 11 }) + box(570, 150, 56, 28, "MA", { cls: "fx-soft", fs: 11 }) + box(538, 196, 56, 28, "MA", { cls: "fx-soft", fs: 11 }) + t(566, 246, "versetzt", { cls: "fx-sub", fs: 11 }))),
  steps: [
    "Ausgangslage: eine Linienorganisation. Drei Mitarbeitende (hervorgehoben) sollen an einem abteilungsübergreifenden Projekt arbeiten.",
    "<b>Einfluss-PO</b>: Ein:e Projektkoordinator:in sitzt als Stab bei der Geschäftsführung, hat aber <b>keine Weisungsbefugnis</b>. Entscheidungen bleiben in der Linie, der Koordinationsaufwand ist hoch.",
    "<b>Matrix-PO</b>: Die Projektleitung hat <b>fachliche</b> Weisungsbefugnis, die Linie bleibt <b>disziplinarisch</b> zuständig. Die Mitarbeitenden dienen „zwei Herren“: Konfliktpotenzial, aber keine Versetzung.",
    "<b>Reine PO</b>: Das Projekt wird eine eigene Einheit, die Mitarbeitenden werden versetzt, die Projektleitung hat volle Weisungsbefugnis. Kürzeste Wege, aber das Problem der Rückführung nach Projektende."
  ] };

/* ================= Einbau ================= */
const ex = (title, html, label = "Beispiel durchgerechnet") => ({ t: "example", label, title, html });
const BL = {
  "pmg1-1": [ex("Projekt oder Linie? Drei Vorhaben eines Grazer Softwarehauses", `<p>Die Firma (45 Mitarbeitende) hat drei Vorhaben auf dem Tisch. Prüfung entlang der DIN-Merkmale:</p>
    <table class='dt'><tr><th>Vorhaben</th><th>einmalig?</th><th>Ziel + Termin?</th><th>eigene Organisation?</th><th>Ergebnis</th></tr>
    <tr><td>Ticketsystem einführen (Go-live 1. März, 60 PT, Support + IT + Vertrieb)</td><td>ja</td><td>ja</td><td>ja, Team aus 3 Abteilungen</td><td><b>Projekt</b> (Rollout-/Organisationsprojekt)</td></tr>
    <tr><td>Monatliche Sicherheitsupdates einspielen</td><td>nein, wiederkehrend</td><td>Routinetermin</td><td>nein, IT-Betrieb</td><td><b>Linie</b></td></tr>
    <tr><td>Rechenzentrum in die Cloud migrieren (9 Monate, 280.000 €)</td><td>ja</td><td>ja</td><td>ja</td><td><b>Projekt</b>, mit hohem Risiko</td></tr></table>
    <p>Merke: Die Größe allein entscheidet nicht. Auch die kleine Ticketsystem-Einführung ist ein Projekt, weil die <b>Gesamtheit</b> der Bedingungen einmalig ist.</p>`, "Beispiel aus der Praxis"),
    { t: "check", q: "Ein Elektronikhändler eröffnet seine 40. Filiale nach Standardhandbuch, mit festem Eröffnungstermin und eigenem Aufbauteam. Projekt?", opts: ["Nein, weil es schon 39 Filialen gibt", "Nein, Filialen sind Linienarbeit", "Nur, wenn mehr als 10 Mio. € investiert werden", "Ja: Standort, Termin, Team und Budget sind in ihrer Gesamtheit einmalig, auch wenn es eine Vorlage gibt"], a: 3, why: "Standardnetzpläne/Vorlagen senken den Aufwand, ändern aber nichts am Projektcharakter." }],
  "pmg1-2": [ex("Magisches Dreieck: Zusatzwunsch im Webshop-Relaunch", `<p>Ausgangslage: 3 Entwickler:innen, Verrechnungssatz 600 € pro Personentag (PT), Go-live in 8 Wochen fix. Der Kunde will zusätzlich eine Ratenzahlungsfunktion: <b>+15 PT</b>.</p>
    <ol><li><b>Zeit verschieben</b>: 15 PT / 3 Personen = 5 Arbeitstage → Go-live eine Woche später, Kosten +15 · 600 = <b>9.000 €</b>.</li>
    <li><b>Termin halten</b>: eine vierte Person für 15 PT. Kosten +9.000 € plus Einarbeitung und Koordination (Kommunikationspfade steigen von 3 auf 6) → realistisch eher 11.000 €.</li>
    <li><b>Kosten und Termin halten</b>: dann muss Qualität/Funktionalität woanders sinken, z. B. die Wunschliste „Produktvergleich“ (12 PT) entfällt.</li></ol>
    <p>Es gibt keine vierte Option „alles bleibt gleich“: Qualität, Kosten und Zeit hängen zusammen. Die Steuerung in der Mitte entscheidet, welche Ecke nachgibt.</p>`)],
  "pmg1-3": [ex("PM-Kosten nach der Faustregel", `<table class='dt'><tr><th>Projekt</th><th>Größe</th><th>Satz</th><th>PM-Kosten</th></tr>
    <tr><td>Intranet-Umbau, 2 Personen, 40.000 €</td><td>sehr klein</td><td>10 %</td><td>4.000 €</td></tr>
    <tr><td>App-Entwicklung, 6 Personen, 300.000 €</td><td>klein</td><td>8 %</td><td>24.000 €</td></tr>
    <tr><td>ERP-Einführung, 30 Personen, 2,5 Mio. €</td><td>mittel</td><td>4 %</td><td>100.000 €</td></tr>
    <tr><td>Bahn-Leitsystem, 120 Personen, 20 Mio. €</td><td>groß</td><td>2 %</td><td>400.000 €</td></tr></table>
    <p>Absolut steigen die PM-Kosten, <b>relativ</b> sinken sie (degressiv). Zusatz Meilensteine: „Prototyp fertig“ ist kein guter Meilenstein. Besser: „Klickbarer Prototyp der 5 Kernmasken, vom Anwenderkreis am 14.11. abgenommen“, also definiert, überprüfbar, mit Termin.</p>`)],
  "pmg1-4": [ex("Notenberechnung GL-PMGT", `<p>Prüfung (85 %): 74 von 100 Punkten. Übungen und Mitarbeit (15 %): 92 von 100 Punkten. Beide Komponenten sind positiv (&gt; 60).</p>
    <p>Gesamt = 0,85 · 74 + 0,15 · 92 = 62,9 + 13,8 = <b>76,7 Punkte</b> → Notenschlüssel 71–80 = <b>Befriedigend</b>.</p>
    <p>Gegenprobe Falle: Prüfung 58, Übung 100 → 0,85 · 58 + 0,15 · 100 = 64,3. Rechnerisch über 60, aber beim 1. Antritt muss <b>jede Komponente separat positiv</b> sein, die Prüfung mit 58 ist es nicht.</p>`),
    ex("Scheitern verhindern: die Top-Ursachen in einem CRM-Projekt", `<p>Ein CRM-Projekt (12 Personen, 4 Abteilungen) zeigt nach 3 Monaten Warnsignale. Zuordnung zur Studie und Gegenmaßnahme aus der Vorlesung:</p>
    <table class='dt'><tr><th>Beobachtung</th><th>Ursache laut Studie</th><th>Gegenmittel</th></tr>
    <tr><td>Vertrieb erfährt Änderungen aus der Kaffeeküche</td><td>schlechte Kommunikation (Rang 1)</td><td>Berichtswesen, regelmäßige Statusbesprechung</td></tr>
    <tr><td>„Das System soll alles können“</td><td>unklare Anforderungen und Ziele</td><td>Pflichtenheft mit Muss-, Wunsch- und Abgrenzungskriterien</td></tr>
    <tr><td>Zwei Bereichsleiter blockieren sich</td><td>Politik, Kompetenzstreit</td><td>Lenkungsausschuss entscheidet</td></tr>
    <tr><td>Key-User nur „nebenbei“ verfügbar</td><td>fehlende Ressourcen</td><td>Einsatzmittelplanung, Freistellung im Projektauftrag</td></tr></table>`, "Beispiel aus der Praxis")],
  "pmg2-1": [ex("Projektantrag ausgefüllt: digitale Zeiterfassung", `<table class='dt'><tr><th>Feld</th><th>Inhalt</th></tr>
    <tr><td>Name / Kürzel</td><td>Digitale Zeiterfassung · ZEIT-26</td></tr><tr><td>Kurzbeschreibung</td><td>Ablöse der Stempelkarten durch App + Terminal für 140 Mitarbeitende</td></tr>
    <tr><td>Projektleiterin</td><td>M. Huber (IT), Teilprojektleiter HR: J. Wagner</td></tr><tr><td>Unterauftragnehmer</td><td>Hardwarelieferant für 6 Terminals</td></tr>
    <tr><td>Personalaufwand</td><td>110 PT intern</td></tr><tr><td>Einsatzmittelkosten</td><td>Lizenzen 18.000 €, Terminals 9.000 €, extern 12.000 € → 39.000 €</td></tr>
    <tr><td>Meilensteine</td><td>M1 Anforderungen 15.11. · M2 Pilot Abteilung Logistik 15.12. · M3 Rollout 1.1.</td></tr>
    <tr><td>Risiken</td><td>Betriebsrat-Zustimmung, Datenschutz-Folgenabschätzung, Lieferzeit Terminals</td></tr>
    <tr><td>Unterschriften</td><td>Geschäftsführung (Auftraggeberin), IT-Leitung (Auftragnehmerin)</td></tr></table>
    <p><b>Parameterausrichtung</b>: Die neue Betriebsvereinbarung gilt ab 1.1. → <b>terminfixiert</b>. Wird es eng, kann nur die Leistung reduziert werden (z. B. Terminal-Anbindung erst im Februar), nicht der Termin.</p>`, "Beispiel aus der Praxis")],
  "pmg2-2": [{ t: "calc", id: "pmg-nwa" },
    ex("Pflichtenheft-Zielbestimmung für eine Lern-App", `<table class='dt'><tr><th>Kriterium</th><th>Beispiel</th></tr>
    <tr><td>Musskriterium</td><td>Login mit Hochschulkonto, Karteikarten offline lernen, Fortschritt synchronisieren</td></tr>
    <tr><td>Wunschkriterium</td><td>Dark Mode, Statistik pro Fach, Export als PDF</td></tr>
    <tr><td>Abgrenzungskriterium</td><td>keine Bezahlfunktion, kein Chat zwischen Studierenden, keine iPad-Optimierung in Version 1</td></tr></table>
    <p><b>Was kostet eine späte Änderung?</b> Die Funktion „Chat“ nachträglich: im Pflichtenheft 1 PT Änderung, nach dem Entwurf etwa 8 PT (Datenmodell, Schnittstellen), nach der Realisierung über 20 PT (Umbau, Tests, Datenschutz). Darum: Änderungsverfahren zu Projektbeginn festlegen, Änderungen über das Change Control Board.</p>`)],
  "pmg2-3": [{ t: "fig", id: "pmg-fig-org" },
    ex("Welche Organisationsform passt? Drei Fälle", `<table class='dt'><tr><th>Fall</th><th>Größe / Interdisziplinarität</th><th>Empfehlung</th></tr>
    <tr><td>Abteilung Buchhaltung stellt ihre Belegablage um (3 Personen, 6 Wochen)</td><td>klein, eine Abteilung</td><td><b>PM in der Linie</b>, die Abteilungsleiterin leitet</td></tr>
    <tr><td>Neues Produktportal mit IT, Marketing, Recht (8 Personen, je 30–50 % Zeitanteil)</td><td>mittel, interdisziplinär</td><td><b>Matrix-PO</b>: keine Versetzung, PL hat fachliche Weisung</td></tr>
    <tr><td>Werk-Neubau in Polen (60 Personen, 3 Jahre)</td><td>groß, stark interdisziplinär</td><td><b>Reine PO</b>, ab der Realisierung mit eigener Einheit</td></tr></table>`, "Beispiel aus der Praxis")],
  "pmg2-4": [ex("Gremien in einer ERP-Einführung", `<ul><li><b>Lenkungsausschuss</b> (Geschäftsführung, CFO, IT-Leitung) tagt am Meilenstein „Fachkonzept abgenommen“: Go für die Realisierung, Budgetfreigabe 1,2 Mio. €.</li>
    <li><b>Change Control Board</b> (PL, Key-User-Sprecher, Architekt) behandelt Änderungsantrag Nr. 14 „Zusatzreport Lagerumschlag“: +6 PT, Termin unverändert → genehmigt, wird Teil der Baseline.</li>
    <li><b>Anwenderkreis</b> (je ein Key-User pro Abteilung) priorisiert die 120 Anforderungen nach Muss/Wunsch.</li>
    <li><b>Planungsteam</b> trifft sich wöchentlich, das <b>Projektbüro</b> aktualisiert danach Netzplan und Rückmeldelisten.</li>
    <li><b>Software Board</b> (projektübergreifend) stellt sicher, dass das parallel laufende CRM-Projekt dieselben Stammdaten nutzt.</li></ul>`, "Beispiel aus der Praxis"),
    { t: "check", q: "Im Beispiel wird ein Änderungsantrag mit +6 PT genehmigt. Welches Gremium war das?", opts: ["Change Control Board (Steuerungsgremium)", "Lenkungsausschuss", "Software Board", "Anwenderkreis"], a: 0, why: "Das Change Control Board ist das Steuerungsgremium für Änderungen." }],
  "pmg3-1": [ex("Ein PSP, drei Sichten: Firmen-App", `<table class='dt'><tr><th>objektorientiert</th><th>funktionsorientiert</th><th>ablauforientiert</th></tr>
    <tr><td>1 App-Frontend<br>2 Backend/API<br>3 Datenbank<br>4 Schulung &amp; Support</td><td>1 Konzeption<br>2 Programmierung<br>3 Testen<br>4 Dokumentation</td><td>1 Systemdefinition<br>2 Entwurf<br>3 Realisierung<br>4 Erprobung<br>5 Einsatz</td></tr></table>
    <p>Arbeitspaket aus dem ablauforientierten PSP: <b>3.2 „Login-Funktion implementieren“</b> · verantwortlich: Team Mobile · Aufwand 8 PT · Konto 4711-03 · Produktteil 1.1. So verbindet ein AP die drei Strukturen: Projektstruktur (3.2), Kontenstruktur (4711-03) und Produktstruktur (1.1).</p>`)],
  "pmg3-2": [{ t: "calc", id: "pmg-proz" }, { t: "calc", id: "pmg-team" },
    ex("Zwei Methoden, ein Projekt: Prozentsatz und Stichprobe", `<p>Ein Kundenportal hat 200 Masken. Die Definitionsphase hat <b>90 PT</b> gekostet.</p>
    <ol><li><b>Prozentsatzmethode</b>: 90 / 0,18 = <b>500 PT</b> gesamt → Entwurf 95, Codierung 170, Test 145 PT.</li>
    <li><b>Stichprobenmethode</b>: 10 repräsentative Masken werden genau geschätzt: 27 PT. Faktor 200 / 10 = 20 → 27 · 20 = <b>540 PT</b>.</li>
    <li>Plausibilität: Die Werte liegen 8 % auseinander, gute Übereinstimmung. Man plant z. B. mit 520 PT.</li>
    <li>Zuschlag für PM, Dokumentation, Schulung (Folie 10–30 %): mit 20 % → 520 · 1,2 = <b>624 PT</b>.</li></ol>`)],
  "pmg3-3": [{ t: "fig", id: "pmg-fig-netz" }, { t: "calc", id: "pmg-netz" }, { t: "calc", id: "pmg-pert" },
    ex("PERT über einen ganzen Pfad: Servermigration", `<table class='dt'><tr><th>Vorgang</th><th>T<sub>o</sub></th><th>T<sub>w</sub></th><th>T<sub>p</sub></th><th>T<sub>m</sub> = (T<sub>o</sub> + 4T<sub>w</sub> + T<sub>p</sub>)/6</th></tr>
    <tr><td>A Daten sichern</td><td>3</td><td>4</td><td>8</td><td>(3 + 16 + 8)/6 = 4,5</td></tr>
    <tr><td>B Migration</td><td>2</td><td>6</td><td>16</td><td>(2 + 24 + 16)/6 = 7</td></tr>
    <tr><td>C Abnahmetest</td><td>1</td><td>2</td><td>3</td><td>(1 + 8 + 3)/6 = 2</td></tr></table>
    <p>Summe der wahrscheinlichsten Werte: 4 + 6 + 2 = 12 Tage. PERT-Erwartung: 4,5 + 7 + 2 = <b>13,5 Tage</b>. Die pessimistischen Ausreißer (v. a. bei B) ziehen den Erwartungswert nach oben. Wer nur mit T<sub>w</sub> plant, plant systematisch zu knapp.</p>`),
    { t: "check", q: "Im Netzplan-Rechner: E dauert statt 3 nun 8 Tage. Was passiert?", opts: ["Nichts, E hat 4 Tage Puffer", "Projektdauer 15 Tage, A → C → E → F wird kritisch", "Projektdauer 19 Tage", "Nur der freie Puffer von C sinkt"], a: 1, why: "Pfad A–C–E–F = 3 + 2 + 8 + 2 = 15 > 14. Die Verlängerung um 5 übersteigt den Puffer von 4 um 1 Tag." }],
  "pmg3-4": [ex("Kapazitätsausgleich mit Puffer (Lektionsnetz)", `<p>Im Übungsnetz brauchen <b>B</b> (Tag 3–7) und <b>C</b> (Tag 3–5) je 2 Tester:innen. Verfügbar sind nur <b>3</b>. In den Tagen 3–5 entsteht ein Bedarf von 4 → Überlast.</p>
    <ol><li>B liegt auf dem kritischen Pfad (GP 0) und darf nicht wandern.</li>
    <li>C hat <b>GP = 4</b>. Verschiebt man C auf Start Tag 7, endet C an Tag 9, E läuft 9–12 und ist genau bei SEZ(E) = 12 fertig.</li>
    <li>Ergebnis: Bedarf max. 2 Tester:innen gleichzeitig, Projektende bleibt Tag 14 → <b>termintreuer</b> Ausgleich gelungen, aber C und E sind jetzt kritisch.</li></ol>
    <p>Hätte C nur 1 Tag Puffer, ginge das nicht ohne Verschiebung des Endes: Dann bliebe nur der <b>kapazitätstreue</b> Ausgleich (Grenze 3 einhalten, Ende verschiebt sich) oder mehr Personal.</p>`),
    ex("Vorkalkulation mit Risikozuschlag", `<table class='dt'><tr><th>Position</th><th>Rechnung</th><th>€</th></tr>
    <tr><td>Personalkosten Definition</td><td>40 PT · 640 €</td><td>25.600</td></tr><tr><td>Personalkosten Entwurf + Realisierung</td><td>160 PT · 640 €</td><td>102.400</td></tr>
    <tr><td>Personalkosten Test</td><td>60 PT · 640 €</td><td>38.400</td></tr><tr><td>phasenbezogene Sachkosten</td><td>Testgeräte, Lizenzen</td><td>14.000</td></tr>
    <tr><td>nicht phasenbezogene Kosten</td><td>Reisen, Projektbüro</td><td>9.600</td></tr><tr><td><b>Zwischensumme</b></td><td></td><td><b>190.000</b></td></tr>
    <tr><td>Risikozuschlag</td><td>8 %</td><td>15.200</td></tr><tr><td><b>Entwicklungsselbstkosten</b></td><td></td><td><b>205.200</b></td></tr></table>
    <p>Dasselbe Schema dient später für Mit- und Nachkalkulation, nur so sind die Zahlen vergleichbar.</p>`)],
  "pmg4-1": [{ t: "fig", id: "pmg-fig-mta" }, { t: "calc", id: "pmg-svs" },
    ex("Absolut, linear oder mit Sachfortschritt? Ein Vergleich", `<p>Budget 200.000 €, Laufzeit 10 Monate. Nach Monat 5 sind <b>90.000 €</b> ausgegeben.</p>
    <ul><li><b>Absolut</b>: 90.000 von 200.000 € → „erst 45 % verbraucht, alles gut“. Irreführend, weil Zeit und Fortschritt fehlen.</li>
    <li><b>Linear</b>: Plan bis Monat 5 = 100.000 € → 10.000 € unter Plan. Sieht noch besser aus.</li>
    <li><b>Mit Sachfortschritt</b>: Fertig sind aber erst 35 %. Wert der erbrachten Arbeit = 0,35 · 200.000 = 70.000 €. Für 70.000 € Leistung wurden 90.000 € ausgegeben → Kosten-Leistungs-Index 90 / 70 = <b>1,29</b>, also deutlich schlecht. Hochgerechnet: 200.000 · 1,29 ≈ 257.000 €.</li></ul>
    <p>Erst der Bezug zum Sachfortschritt deckt das Problem auf (→ Lektion 4.2).</p>`)],
  "pmg4-2": [{ t: "calc", id: "pmg-ev" },
    ex("Relativer vs. absoluter Fertigstellungsgrad", `<p>Ein Teilprojekt hat 40 gleich große Arbeitspakete. Stand: 14 komplett fertig, 10 „zur Hälfte“, 16 nicht begonnen.</p>
    <ul><li><b>Relativ</b> (Selbsteinschätzung): (14 + 10 · 0,5) / 40 = 19 / 40 = <b>47,5 %</b></li>
    <li><b>Absolut</b> (nur fertige AP zählen): 14 / 40 = <b>35 %</b></li>
    <li><b>Prozessbezogen</b>: 2 von 6 Meilensteinen offiziell abgenommen = <b>33 %</b></li></ul>
    <p>Die Differenz von 12,5 Prozentpunkten ist genau das Risiko des <b>Fast-schon-fertig-Syndroms</b>: „Halb fertige“ Pakete brauchen oft deutlich mehr als die halbe Zeit. Bei Plankosten von 160.000 € ist der Arbeitswert absolut 56.000 €, relativ 76.000 €. Mit Istkosten von 70.000 € ergibt das einen Kosten-Leistungs-Index von 1,25 (absolut, schlecht) bzw. 0,92 (relativ, gut). Die Wahl des Verfahrens entscheidet über die Ampelfarbe.</p>`)],
  "pmg4-3": [ex("Berichtsplan für ein mittleres Projekt", `<table class='dt'><tr><th>Wer meldet</th><th>an wen</th><th>Rhythmus</th><th>Inhalt / Form</th></tr>
    <tr><td>AP-Verantwortliche</td><td>Projektbüro</td><td>wöchentlich, Freitag</td><td>Rückmeldeliste: Termin hält / hält nicht, Restaufwand</td></tr>
    <tr><td>Projektleitung</td><td>Lenkungsausschuss</td><td>monatlich + an Meilensteinen</td><td>Statusbericht: Plan/Ist Termine, Kosten, MTA, Top-5-Risiken (2 Seiten)</td></tr>
    <tr><td>Projektleitung</td><td>alle Mitarbeitenden</td><td>14-tägig</td><td>kurzer Newsletter, Entscheidungen, nächste Schritte</td></tr>
    <tr><td>Projektbüro</td><td>Controlling</td><td>monatlich</td><td>Stunden je Konto, Kosten-Leistungs-Index</td></tr></table>
    <p><b>Projekttagebuch-Eintrag</b>: „12.11., 14:30 – Telefonat PL mit Lieferant: Terminals kommen erst am 20.12. statt 5.12.; Pilot wird auf Abteilung Verwaltung (ohne Terminal, nur App) umgestellt. Eingetragen: M. Huber.“ Gebunden, nicht löschbar, für alle einsehbar.</p>`, "Beispiel aus der Praxis"),
    { t: "check", q: "Der Steuerungsausschuss tritt zusammen, weil ein wichtiger Meilenstein mit Beschlussvorlage zur Abnahme ansteht. Welche Besprechungsart?", opts: ["regelmäßige Besprechung", "ergebnisgesteuerte Besprechung", "ereignisgesteuerte Besprechung", "Kickoff"], a: 1, why: "Ergebnisgesteuert: bei Meilensteinen, Ergebnisabnahme mit Beschlussvorlage." }],
  "pmg5-1": [ex("Nachkalkulation und Abweichungsanalyse", `<p>Plan (Vorkalkulation): <b>180.000 €</b> · Ist (letzte Mitkalkulation): <b>213.000 €</b> → Abweichung +33.000 € = <b>+18,3 %</b>.</p>
    <table class='dt'><tr><th>Ursache</th><th>€</th><th>Art</th><th>vermeidbar?</th></tr>
    <tr><td>Anforderungen missverstanden, Maske neu gebaut</td><td>14.000</td><td>organisatorisch</td><td>vermeidbar (Review im Entwurf)</td></tr>
    <tr><td>Schlüsselentwickler 6 Wochen krank, externer Ersatz teurer</td><td>9.000</td><td>personell</td><td>nicht vermeidbar</td></tr>
    <tr><td>Schnittstelle des Altsystems undokumentiert</td><td>7.000</td><td>technisch</td><td>kaum vermeidbar</td></tr>
    <tr><td>Lizenzpreis gestiegen</td><td>3.000</td><td>extern</td><td>kaum vermeidbar</td></tr></table>
    <p>Erfahrungssicherung: Für das nächste Projekt +10 % Puffer bei Altsystem-Schnittstellen in die Schätzdatenbank aufnehmen, Entwurfs-Review verpflichtend.</p>`)],
  "pmg6-1": [ex("Wer entscheidet was? Ein Tag im Scrum Team", `<p>Team für eine Banking-App: 1 Product Owner, 1 Scrum Master, 7 Developer:innen (9 Personen, unter der Grenze von etwa 10).</p>
    <ul><li>Die Vertriebsleiterin will „ihr“ Feature sofort. Sie muss den <b>Product Owner überzeugen</b>, der allein die Reihenfolge im Product Backlog festlegt.</li>
    <li>Die Testumgebung fällt seit zwei Tagen aus: ein <b>Impediment</b>. Der Scrum Master bewirkt, dass es beseitigt wird (z. B. Eskalation an den IT-Betrieb).</li>
    <li>Wer welche Aufgabe übernimmt und wie das Login umgebaut wird, entscheiden die <b>Developer:innen</b> selbst (selbstmanagend).</li>
    <li>Wie groß der Eintrag „Push-Benachrichtigungen“ ist, schätzen die Developer:innen, die die Arbeit erledigen.</li></ul>`, "Beispiel aus der Praxis")],
  "pmg6-2": [{ t: "fig", id: "pmg-fig-scrum" }, { t: "calc", id: "pmg-burn" },
    ex("Burndown lesen: Sprint mit 10 Tagen", `<p>Sprintumfang 40 Punkte, Länge 10 Arbeitstage. Ideallinie: 4 Punkte pro Tag.</p>
    <table class='dt'><tr><th>Ende Tag</th><th>2</th><th>4</th><th>6</th><th>8</th></tr><tr><td>ideal offen</td><td>32</td><td>24</td><td>16</td><td>8</td></tr><tr><td>tatsächlich offen</td><td>38</td><td>30</td><td>20</td><td>13</td></tr></table>
    <p>An Tag 6 sind 20 Punkte offen, 4 über der Ideallinie. Tempo bisher 20 / 6 ≈ 3,3 Punkte/Tag, nötig wären 20 / 4 = 5 Punkte/Tag. Im Daily Scrum passen die Developer:innen den Plan an. Ist das Sprint-Ziel gefährdet, wird der <b>Umfang</b> mit dem PO neu verhandelt. Die Qualität (DoD) wird nicht gesenkt, und der Sprint wird nicht verlängert.</p>`),
    { t: "check", q: "Am Ende eines 10-Tage-Sprints mit 30 Punkten sind an Tag 5 noch 18 Punkte offen. Wie viele Punkte liegt das Team über der Ideallinie?", opts: ["3", "12", "15", "0"], a: 0, why: "Ideal offen nach Tag 5: 30 · (1 − 5/10) = 15. Tatsächlich 18 → 3 Punkte über der Linie." }]
};

const Q = (n, topic, q, opts, a, why) => ({ id: "px-pmgt-" + n, topic, q, opts, a, why, ex: "" });
const QUESTIONS = [
 Q(1, "pmg-proj", "Welches Vorhaben erfüllt die Projektmerkmale am ehesten?", ["Wöchentliche Datensicherung der Server", "Umstellung der gesamten Buchhaltung auf ein neues ERP-System bis 31.12.", "Tägliche Bearbeitung von Kundenanfragen", "Monatlicher Lohnlauf"], 1, "Einmalig, befristet, komplex, interdisziplinär. Die anderen sind Routine in der Linie."),
 Q(2, "pmg-proj", "Eine Baufirma baut jährlich 50 ähnliche Häuser. Warum ist jeder Hausbau trotzdem ein Projekt?", ["Weil Häuser teuer sind", "Weil Bauvorhaben laut DIN immer Projekte sind", "Weil die Bedingungen in ihrer Gesamtheit (Grundstück, Kunde, Termin, Budget, Team) einmalig sind", "Weil jede Baustelle eine Linienorganisation hat"], 2, "DIN 69901: Einmaligkeit der Bedingungen in ihrer Gesamtheit, nicht jeder einzelnen Tätigkeit."),
 Q(3, "pmg-proj", "Eine Machbarkeits- und Wirtschaftlichkeitsprüfung als Vorstudie für ein Großvorhaben ist ein …", ["Rollout-Projekt", "Forschungsprojekt", "Planungsprojekt", "Rationalisierungsprojekt"], 2, "Planungsprojekt: Vorstudie und Konzept für ein anschließendes Großprojekt."),
 Q(4, "pmg-proj", "Was nennen die Folien als Kehrseite der Projektarbeit?", ["Unklare Ziele", "Permanent hoher Erfolgsdruck auf Projektleitung und Team", "Keine abteilungsübergreifende Sicht", "Ressourcen müssen laufend erkämpft werden"], 1, "Vorteile: klare Ziele, feste Ressourcen, abteilungsübergreifende Sicht. ABER: hoher Erfolgsdruck."),
 Q(5, "pmg-proj", "Ein Unternehmen gestaltet seine Einkaufsprozesse neu, damit sie rationeller laufen. Projektart?", ["Organisations-/Rationalisierungsprojekt", "Entwicklungsprojekt", "Forschungsprojekt", "Rollout-Projekt"], 0, "Neugestaltung der Aufbau- und/oder Ablauforganisation mit dem Ziel rationellerer Geschäftsprozesse."),
 Q(6, "pmg-pm", "Ein terminfixes Projekt bekommt 20 PT Zusatzleistung, die Qualität soll gleich bleiben. Was muss sich laut magischem Dreieck ändern?", ["Kosten/Ressourcen steigen, z. B. durch eine zusätzliche Person", "Nichts", "Die Phasenreihenfolge", "Der Projektauftrag wird ungültig"], 0, "Wenn Zeit und Qualität fix sind, gibt die dritte Ecke nach: Kosten/Ressourcen."),
 Q(7, "pmg-pm", "Ein mittleres Projekt hat 2 Mio. € Volumen. Welche PM-Kosten sind nach der groben Regel zu erwarten?", ["ca. 20.000 €", "ca. 80.000 €", "ca. 200.000 €", "ca. 40.000 €"], 1, "Mittel: ca. 4 % → 0,04 · 2.000.000 = 80.000 €."),
 Q(8, "pmg-pm", "Welche Phase folgt im Phasenkonzept unmittelbar auf die Planung?", ["Abschluss", "Initialisierung", "Durchführung", "Kontrolle"], 2, "Initialisierung → Planung → Durchführung → Abschluss."),
 Q(9, "pmg-pm", "Im Dreiklang Produkt – Projekt – Prozess ist der Prozess …", ["das Ergebnis, z. B. eine Software", "das zielorientierte Vorhaben", "das eigentliche Vorgehen im Projekt (Idee → Definition → Entwurf → … → Einsatz)", "das Portfolio aller Projekte"], 2, "Produkt = Ergebnis, Projekt = Vorhaben, Prozess = Vorgehen."),
 Q(10, "pmg-pm", "Prüfung 70 Punkte, Übungen 100 Punkte, beide positiv. Gesamtnote (85/15-Gewichtung)?", ["Genügend", "Befriedigend", "Gut", "Nicht genügend"], 1, "0,85 · 70 + 0,15 · 100 = 59,5 + 15 = 74,5 → 71–80 = Befriedigend."),
 Q(11, "pmg-pm", "Was liegt laut Studie auf Rang 2 der Ursachen für das Scheitern?", ["Unklare Anforderungen und Ziele", "Zu hohe technische Anforderungen", "Fehlende PM-Methodik", "Mangelhaftes Stakeholder-Management"], 0, "Rang 1 schlechte Kommunikation, Rang 2 unklare Anforderungen und Ziele."),
 Q(12, "pmg-gruend", "Kostenfixiertes Projekt: Der Auftraggeber will früher fertig werden. Was ist laut Folie der Weg?", ["Budget erhöhen", "Leistung oder Qualitätsanforderungen ändern", "Mehr Personal ohne Mehrkosten", "Projektantrag zurückziehen"], 1, "Budget fix → früherer Termin nur durch Änderung von Leistung oder Qualität."),
 Q(13, "pmg-gruend", "Wo liegt bei einem leistungsfixierten Projekt der Spielraum?", ["Nur in der Qualität", "In der Verschiebung zwischen Kosten und Terminen", "Im Leistungsumfang", "Es gibt keinen"], 1, "Leistung und Qualität stehen fest; Spielraum nur zwischen Kosten und Terminen."),
 Q(14, "pmg-gruend", "Welche Leitfrage gehört NICHT zur Problemfeldanalyse?", ["Richtiges Produkt?", "Richtige Personalstärke?", "Richtige Rechtsform des Unternehmens?", "Richtige Methoden und Werkzeuge?"], 2, "Leitfragen: Produkt, Aufgabenstellung, Funktionsumfang, Dauer, F&E-Kosten, Qualifikation, Methoden/Werkzeuge, Personalstärke."),
 Q(15, "pmg-gruend", "Welches Dokument markiert den juristischen Anfang eines Projekts?", ["Projektauftrag", "Pflichtenheft", "Produktabnahmebericht", "Projekttagebuch"], 0, "Projektauftrag = juristischer Anfang, Produktabnahmebericht = juristisches Ende."),
 Q(16, "pmg-gruend", "Wie heißt die Darstellung der voneinander abhängigen Grundparameter Leistung, Einsatzmittel und Zeit?", ["Projektmanagement-Dreieck", "Qualitätskreis", "Meilensteintrendanalyse", "Netzplan"], 0, "Die Grundparameter sind interdependent → PM-Dreieck."),
 Q(17, "pmg-ziel", "„Die App bietet keine Offline-Bezahlung an.“ In welches Pflichtenheft-Kriterium gehört dieser Satz?", ["Musskriterien", "Wunschkriterien", "Abgrenzungskriterien", "Testszenarien"], 2, "Abgrenzungskriterien sagen, was das Produkt ausdrücklich nicht leisten soll."),
 Q(18, "pmg-ziel", "„Laufzeit: Android ab Version 14, Server unter Linux“ gehört im Pflichtenheft zu …", ["Produktumgebung", "Zielbestimmung", "Produkteinsatz", "Entwicklungsumgebung"], 0, "Produktumgebung: Software, Hardware, Orgware, Schnittstellen, in denen das Produkt läuft. Entwicklungsumgebung = Werkzeuge der Entwicklung."),
 Q(19, "pmg-ziel", "Nutzwertanalyse: Gewichte 60 % und 40 %, Alternative A erhält 5 und 10 Punkte. Nutzwert von A?", ["7", "7,5", "6", "15"], 0, "0,6 · 5 + 0,4 · 10 = 3 + 4 = 7."),
 Q(20, "pmg-ziel", "Welche Reihenfolge der Zieldokumente zeigt zunehmende Detaillierung?", ["Pflichtenheft → Anforderungskatalog → Leistungsbeschreibung", "Anforderungskatalog → Pflichtenheft → Leistungsbeschreibung", "Leistungsbeschreibung → Pflichtenheft → Anforderungskatalog", "Anforderungskatalog → Leistungsbeschreibung → Pflichtenheft"], 1, "Anforderungskatalog (Anwender) → Pflichtenheft (Grobkonzept) → Leistungsbeschreibung (Feinkonzept, verbindlich)."),
 Q(21, "pmg-ziel", "Warum sind Änderungen an Ergebnissen früher Phasen besonders kritisch?", ["Weil sie nur das Pflichtenheft betreffen", "Weil sie weitreichende Auswirkungen auf alle späteren Entwicklungsergebnisse haben", "Weil frühe Phasen keine Kosten verursachen", "Weil sie automatisch genehmigt werden"], 1, "Darum braucht es ein streng geregeltes Änderungsverfahren ab Projektbeginn."),
 Q(22, "pmg-org", "Ein 6-Monats-Projekt mit Mitarbeitenden aus vier Abteilungen: Niemand soll versetzt werden, die Projektleitung braucht aber fachliche Weisungsbefugnis. Welche Form passt?", ["Reine PO", "Matrix-PO", "Einfluss-PO", "PM in der Linie"], 1, "Matrix: fachlich Projekt, disziplinarisch Linie, keine Versetzungen."),
 Q(23, "pmg-org", "Bei welcher Organisationsform ist die Rückführung des Personals nach Projektende das größte Problem?", ["Einfluss-PO", "PM in der Linie", "Reine PO", "Matrix-PO"], 2, "Reine PO: Versetzung ins Projekt, nach Auflösung Rückführung und Know-how-Verlust."),
 Q(24, "pmg-org", "Welche Form empfehlen die Folien für die Einsatzphase (Wartung, Einsatzunterstützung)?", ["PM in der Linie", "Reine PO", "Matrix-PO", "Auftrags-PO"], 0, "Wartung und Einsatzunterstützung übernehmen die zuständigen Stellen in der Linie."),
 Q(25, "pmg-org", "Ordne die Befugnis der Projektleitung aufsteigend.", ["Matrix < Einfluss < rein", "Einfluss < Matrix < rein", "rein < Matrix < Einfluss", "Einfluss < rein < Matrix"], 1, "Einfluss (nur Koordination) < Matrix (fachlich) < rein (fachlich + disziplinarisch)."),
 Q(26, "pmg-org", "Mehrere Unternehmen tragen gemeinsam die Verantwortung für ein Großprojekt. Organisationsform?", ["Generalunternehmerorganisation", "Konsortialorganisation", "Auftrags-PO", "Matrix-PO"], 1, "Konsortium trägt die Verantwortung; beim Generalunternehmer liegt sie bei einem Unternehmen."),
 Q(27, "pmg-rollen", "Ein Kunde wünscht eine zusätzliche Exportfunktion. Welches Gremium entscheidet über den Änderungsantrag?", ["Change Control Board", "User Club", "Planungsteam", "Kommunikationsgremium"], 0, "Steuerungsgremium für Änderungen."),
 Q(28, "pmg-rollen", "Wer trifft am Ende wesentlicher Phasen strategisch wichtige Entscheidungen?", ["Lenkungsausschuss", "Projektbüro", "Anwenderkreis", "Fachbeirat"], 0, "Entscheidungsgremium: selten, am Ende wesentlicher Phasen."),
 Q(29, "pmg-rollen", "Welche Aufgabe übernimmt typischerweise das Projektbüro?", ["Strategische Projektentscheidungen treffen", "Pläne erstellen und aktualisieren, Rückmeldewesen, Stundenbelege erfassen", "Disziplinarische Führung aller Mitarbeitenden", "Anforderungen fachlich priorisieren"], 1, "Entwicklungsflankierende Aufgaben: Pläne, Rückmeldungen, Erfassung, Information, Reviews, Vertragswesen."),
 Q(30, "pmg-rollen", "Was enthält ein Prozessorganisationsplan NICHT?", ["Phasenziele", "Phasenergebnisse", "Phasenabschlüsse", "Stundenverrechnungssätze"], 3, "Phasenziele, -ergebnisse, -abschlüsse. Verrechnungssätze gehören zur Kostenkontrolle."),
 Q(31, "pmg-rollen", "Welche Gliederung des Entwicklungsprozesses ist richtig?", ["Prozess → Prozessphase → Prozessabschnitt → Prozessschritt", "Prozess → Prozessabschnitt → Prozessphase → Prozessschritt", "Prozessschritt → Prozess → Phase → Abschnitt", "Prozessabschnitt → Prozess → Phase → Schritt"], 1, "Prozess → Abschnitt → Phase → Schritt; parallele Phasen = Prozesszweige."),
 Q(32, "pmg-psp", "Ein PSP mit Ebene 1 „Hardware · Software · Schulung“ ist …", ["objektorientiert", "funktionsorientiert", "ablauforientiert", "kontenorientiert"], 0, "Gliederung nach Bestandteilen des Produkts."),
 Q(33, "pmg-psp", "Was ist die kleinste Einheit des Projektstrukturplans?", ["Teilprojekt", "Arbeitspaket", "Meilenstein", "Konto"], 1, "Arbeitspaket: einer verantwortlichen Stelle zugeordnet, Bezugsgröße der Terminüberwachung."),
 Q(34, "pmg-psp", "Was ist die Bezugsgröße der Kostenüberwachung?", ["Produktteile", "Konten", "Arbeitspakete", "Meilensteine"], 1, "Kontenstruktur → Kostenüberwachung über Konten; Projektstruktur → Arbeitspakete; Produktstruktur → Produktteile."),
 Q(35, "pmg-psp", "Ebene 1 nach Phasen, Ebene 2 nach Objekten: welcher PSP-Typ?", ["Mischform", "objektorientiert", "ablauforientiert", "funktionsorientiert"], 0, "Kombination zweier Gliederungsprinzipien."),
 Q(36, "pmg-psp", "Warum lohnt sich laut Folie mehr Planungsaufwand am Anfang?", ["Frühe Entscheidungen legen den Großteil der Kosten fest, lange bevor das Geld ausgegeben wird", "Planung verursacht keine Kosten", "Die Planung lässt sich später nicht mehr ändern", "Der Kunde bezahlt die Planung"], 0, "Mehr Planung senkt Aufwand für Realisierung, Erprobung, Wartung."),
 Q(37, "pmg-schaetz", "Prozentsatzmethode: Der Test (29 %) wurde mit 87 PT gemessen. Gesamtaufwand?", ["252 PT", "300 PT", "116 PT", "387 PT"], 1, "87 / 0,29 = 300 PT."),
 Q(38, "pmg-schaetz", "Stichprobe: 8 von 120 Reports werden genau geschätzt, zusammen 20 PT. Gesamtschätzung?", ["160 PT", "240 PT", "300 PT", "2.400 PT"], 2, "Faktor 120 / 8 = 15 → 15 · 20 = 300 PT."),
 Q(39, "pmg-schaetz", "Entwicklungsaufwand 400 PT. PM, Test, Doku und Schulung kommen laut Folie mit 10–30 % hinzu. Bandbreite gesamt?", ["440–520 PT", "400–430 PT", "410–430 PT", "520–600 PT"], 0, "400 · 1,1 = 440; 400 · 1,3 = 520."),
 Q(40, "pmg-schaetz", "Warum wird die Multiplikatormethode kritisiert?", ["Sie unterstellt Proportionalität, obwohl die Kosten je Einheit mit der Systemgröße steigen", "Sie braucht keine Kennzahlen", "Sie gilt nur für Hardware", "Sie ist zu genau"], 0, "Empirisch steigen die Kosten je Leistungseinheit mit der Größe."),
 Q(41, "pmg-schaetz", "Wie viele Kommunikationspfade gibt es in einem Team mit 6 Personen?", ["12", "15", "30", "36"], 1, "n(n−1)/2 = 6 · 5 / 2 = 15."),
 Q(42, "pmg-netz", "Vorgang D hat die Vorgänger B (FEZ 9) und C (FEZ 12). FAZ von D in Zeitpunktzählung?", ["9", "12", "21", "10,5"], 1, "Vorwärts: Maximum der FEZ der Vorgänger."),
 Q(43, "pmg-netz", "Ein Vorgang hat SEZ 20 und Dauer 6 (Zeitpunktzählung). SAZ?", ["26", "14", "15", "20"], 1, "SAZ = SEZ − D = 14 (in Tageszählung wäre es 15)."),
 Q(44, "pmg-netz", "FAZ 4, SAZ 9. Gesamtpuffer?", ["4", "5", "9", "13"], 1, "GP = SAZ − FAZ = 5."),
 Q(45, "pmg-netz", "PERT: T<sub>o</sub> = 3, T<sub>w</sub> = 5, T<sub>p</sub> = 13. Erwartete Dauer?", ["5", "6", "7", "7,5"], 1, "(3 + 20 + 13) / 6 = 36 / 6 = 6."),
 Q(46, "pmg-netz", "Lektionsnetz (Projektdauer 14): C dauert statt 2 nun 7 Tage. Neue Projektdauer?", ["14", "15", "19", "16"], 1, "A–C–E–F = 3 + 7 + 3 + 2 = 15. C hatte 4 Tage GP, die Verlängerung um 5 überschreitet ihn um 1."),
 Q(47, "pmg-netz", "Welche Aussage über Puffer stimmt?", ["Der freie Puffer ist nie größer als der Gesamtpuffer", "Der freie Puffer ist immer gleich dem Gesamtpuffer", "Kritische Vorgänge haben einen freien Puffer > 0", "Der freie Puffer bezieht sich auf das Projektende"], 0, "FP ≤ GP. Der freie Puffer bezieht sich auf die Nachfolger, der Gesamtpuffer auf das Projektende."),
 Q(48, "pmg-res", "Was darf sich beim termintreuen Kapazitätsausgleich nicht verschieben?", ["Das Projektende", "Die Kapazitätsgrenze", "Der Stundensatz", "Das Budget"], 0, "Termintreu: Ende fix, gleichmäßige Auslastung; kapazitätstreu: Grenze fix, Ende kann wandern."),
 Q(49, "pmg-res", "Ein Vorgang mit 4 Tagen Gesamtpuffer kollidiert um Personal mit einem kritischen Vorgang. Beste Option beim termintreuen Ausgleich?", ["Den kritischen Vorgang verschieben", "Den Vorgang mit Puffer innerhalb seines Puffers verschieben", "Das Projektende verschieben", "Den Vorgang streichen"], 1, "Puffer nutzen: Das Projektende bleibt, die Spitze wird geglättet."),
 Q(50, "pmg-res", "Personalkosten 120.000 €, phasenbezogene Sachkosten 20.000 €, Risikozuschlag 10 % auf die Summe. Entwicklungsselbstkosten?", ["140.000 €", "152.000 €", "154.000 €", "132.000 €"], 2, "(120.000 + 20.000) · 1,1 = 154.000 €."),
 Q(51, "pmg-res", "Welche Kalkulation entspricht der letzten Mitkalkulation?", ["Vorkalkulation", "Nachkalkulation", "Budgetierung", "Angebotskalkulation"], 1, "Nachkalkulation = letzte Mitkalkulation; Grundlage für Projektkostenanalyse und Erfahrungsdaten."),
 Q(52, "pmg-res", "Lebenszykluskosten umfassen …", ["nur die Entwicklungskosten", "den Anschaffungspreis inkl. Herstellergewinn", "alle Kosten über den gesamten Lebenszyklus inkl. Einführung, Betrieb und Stilllegung", "nur die Betriebskosten"], 2, "Für Kund:innen zählt die Gesamtwirtschaftlichkeit, nicht nur der Kaufpreis."),
 Q(53, "pmg-kontr", "Budget 300.000 €, Laufzeit 12 Monate. Nach 4 Monaten betragen die Istkosten 110.000 €. Ergebnis des linearen Plan-/Ist-Vergleichs?", ["10.000 € über Plan", "190.000 € unter Plan", "10.000 € unter Plan", "Exakt im Plan"], 0, "Plan linear: 300.000 · 4/12 = 100.000 € → Ist liegt 10.000 € darüber."),
 Q(54, "pmg-kontr", "Kostenstelle: Budget 450.000 €, 6.000 geleistete Stunden. Stundenverrechnungssatz?", ["60 €/h", "75 €/h", "80 €/h", "7,5 €/h"], 1, "450.000 / 6.000 = 75 €/h."),
 Q(55, "pmg-kontr", "MTA: Die Prognosen eines Meilensteins lauten nacheinander 15.3., 15.3., 15.3., 30.4., 31.5. Welches Muster?", ["Trendwende: frühzeitig realistische Terminaussagen fehlten", "Zu große Sicherheitspuffer", "Termin stabil", "Zick-Zack"], 0, "Lange stabil, dann abrupt nach hinten."),
 Q(56, "pmg-kontr", "MTA: Die Kurve fällt gleichmäßig. Deutung?", ["Zu optimistische Schätzungen", "Planung mit zu großen Sicherheitspuffern", "Große Unsicherheit", "Meilenstein bereits erreicht"], 1, "Der Termin wird immer früher → zu viel Puffer eingeplant."),
 Q(57, "pmg-kontr", "Was ist laut Folie die letzte Möglichkeit der Steuerung bei Abweichungen?", ["Motivation erhöhen", "Konflikte beseitigen", "Planwerte ändern", "Qualifikation verbessern"], 2, "Erst Ursachen beseitigen; Planwerte ändern (Terminverschiebung) ist das letzte Mittel."),
 Q(58, "pmg-kontr", "Was ist „Aufwand“ im Sinne der Vorlesung?", ["Monetär bewerteter Input", "Nicht monetär bewertete Inputgröße, z. B. Stunden", "Gesamter Werteverzehr einer Periode", "Umsatz minus Kosten"], 1, "Kosten = monetär bewerteter Aufwand; Aufwendungen im Rechnungswesen = Werteverzehr einer Periode."),
 Q(59, "pmg-sach", "40 Arbeitspakete: 14 vollständig fertig, 8 zur Hälfte. Absoluter Fertigstellungsgrad?", ["35 %", "45 %", "55 %", "20 %"], 0, "Absolut zählen nur abgeschlossene Pakete: 14 / 40 = 35 %."),
 Q(60, "pmg-sach", "Plankosten gesamt 200.000 €, Fertigstellungsgrad 40 %, Istkosten 100.000 €. Kosten-Leistungs-Index laut Folie?", ["0,8", "1,25", "0,5", "2,0"], 1, "Arbeitswert = 0,4 · 200.000 = 80.000 €; Index = Ist / Arbeitswert = 100.000 / 80.000 = 1,25 (> 1 = schlecht)."),
 Q(61, "pmg-sach", "Was ist der Arbeitswert?", ["Die Istkosten der erbrachten Leistung", "Die geplanten Kosten der tatsächlich erbrachten Arbeitsleistung", "Die geplanten Gesamtkosten", "Der geschätzte Restaufwand"], 1, "Arbeitswert (Earned Value) = Plankosten × Fertigstellungsgrad."),
 Q(62, "pmg-sach", "Ein Entwickler meldet nach 9 von 10 geplanten Wochen „90 % fertig“. Was ist nach dem Fast-schon-fertig-Syndrom realistisch?", ["Fertig in genau 1 Woche", "Die letzten 10 % können über 40 % der Zeit beanspruchen, mehrere Wochen Verzug sind möglich", "Das Paket ist schon fertig", "Der Fertigstellungsgrad ist eher zu niedrig geschätzt"], 1, "Restaufwand wird unterschätzt, erbrachte Leistung überschätzt."),
 Q(63, "pmg-sach", "Was besagt der Qualitätskreis?", ["Qualität kann in späteren Phasen beliebig nachgebessert werden", "Es kann maximal die Qualität erreicht werden, die in der vorausgegangenen Phase erzielt wurde", "Qualität wird nur im Systemtest geprüft", "Qualität ist allein Aufgabe des Kunden"], 1, "Darum Qualitätssicherung in jeder Phase."),
 Q(64, "pmg-sach", "Wodurch unterscheidet sich ein Structured Walk Through von einer Inspektion?", ["Walk Through: gleichgestellte Kolleg:innen, vor einer Inspektion", "Walk Through: offizielle Bestätigung durch Entscheider", "Inspektion: nur schriftliche Kommentare ohne Gespräch", "Es gibt keinen Unterschied"], 0, "Inspektion/Review: entscheidungskompetente Teilnehmende, offizielle Bestätigung. Nur schriftliche Kommentare = Development Design Control."),
 Q(65, "pmg-info", "Welches Ordnungsschema wählt aus einer Maximalmenge die projektadäquaten Dokumente aus?", ["Auswahlordnung", "Fest vorgegebene hierarchische Struktur", "Freie hierarchische Struktur", "Projekttagebuch"], 0, "Auswahlordnung: aus einer Maximalmenge projektadäquat wählen."),
 Q(66, "pmg-info", "Der Hauptlieferant meldet Insolvenz. Welche Besprechungsart ist angebracht?", ["Regelmäßige", "Ergebnisgesteuerte", "Ereignisgesteuerte", "Kickoff"], 2, "Ereignisgesteuert: Krisen, erhebliche Abweichungen, Personal-, Liefer-, Marktprobleme."),
 Q(67, "pmg-info", "Welche Normen nennen die Folien für die Dokumentationsordnung?", ["DIN 66230, 66231, 66232 und DIN 6789", "ISO 27001", "Nur DIN 69900", "Nur ISO 8402"], 0, "Programm-, Programmentwicklungs-, Datendokumentation und Dokumentationssystematik."),
 Q(68, "pmg-info", "Was verwaltet das Konfigurationsmanagement?", ["Personalkonfigurationen", "Die Projektergebnisse in ihren Reifezuständen (Versionen)", "Gremienbesetzungen", "Kostenstellen"], 1, "Produktbezogene Information: Ergebnisse und Versionen."),
 Q(69, "pmg-info", "Was gehört NICHT zu den Aufgaben des Berichtswesens?", ["Informationswege aufzeigen", "Informationsbedürfnisse feststellen", "Berichtszeiträume bestimmen", "Arbeitspakete schätzen"], 3, "Schätzen gehört zur Planung."),
 Q(70, "pmg-abschl", "Wer soll den Abnahmetest durchführen?", ["Das Entwicklungsteam selbst", "Eine neutrale Stelle", "Nur die Projektleitung", "Der Lieferant"], 1, "Niemand soll die eigene Arbeit abnehmen."),
 Q(71, "pmg-abschl", "Ein individuell entwickeltes System wird unter Kundenbedingungen vom Kunden selbst getestet. Welcher Test?", ["Produkttest", "Abschlusstest", "Akzeptanztest", "Pilottest"], 2, "Akzeptanztest: kundenspezifisch, obliegt dem Kunden."),
 Q(72, "pmg-abschl", "Vorkalkulation 180.000 €, Nachkalkulation 207.000 €. Abweichung in Prozent?", ["13 %", "15 %", "27 %", "87 %"], 1, "27.000 / 180.000 = 0,15 = 15 %."),
 Q(73, "pmg-abschl", "Die Krankheit einer Schlüsselperson ist als Abweichungsursache …", ["vermeidbar", "kaum vermeidbar", "nicht vermeidbar", "keine Abweichungsursache"], 2, "Krankheit, Kündigung = nicht vermeidbar; Planungsfehler = vermeidbar; Lieferantenkonkurs = kaum vermeidbar."),
 Q(74, "pmg-abschl", "Was gehört ins Übernahmeprotokoll des Auftraggebers?", ["Übergabeobjekte und Übergabemodalitäten", "Durchgeführte Prüfungen, festgestellte Mängel, Abnahmeentscheidung", "Der Netzplan", "Der Projektantrag"], 1, "Übergabeprotokoll = Auftragnehmer, Übernahmeprotokoll = Auftraggeber."),
 Q(75, "pmg-scrum", "Ein Team hat 14 Personen. Was empfiehlt der Scrum Guide?", ["Ein PO je 7 Personen", "Aufteilung in mehrere Scrum Teams mit gemeinsamem Produkt-Ziel, Product Backlog und Product Owner", "Zwei Scrum Master für ein Team", "Nichts, Teamgröße ist egal"], 1, "Üblicherweise 10 oder weniger; größere Teams teilen sich, behalten aber Ziel, Backlog und PO gemeinsam."),
 Q(76, "pmg-scrum", "Eine Stakeholderin will die Reihenfolge im Product Backlog ändern. Was muss sie tun?", ["Den Scrum Master anweisen", "Den Product Owner überzeugen", "Die Developer:innen abstimmen lassen", "Direkt ins Sprint Backlog schreiben"], 1, "Der PO verantwortet die Reihenfolge; die Organisation respektiert seine Entscheidungen."),
 Q(77, "pmg-scrum", "Welcher Scrum-Wert beschreibt, offen über Arbeit und Herausforderungen zu sprechen?", ["Mut", "Offenheit", "Fokus", "Respekt"], 1, "Offenheit: über Arbeit und Herausforderungen."),
 Q(78, "pmg-scrum", "Wie bewertet der Scrum Guide eine Überprüfung ohne Transparenz?", ["Als irreführend und verschwenderisch", "Als effizient", "Als vorgeschrieben", "Als Ersatz für Anpassung"], 0, "Transparenz ermöglicht Überprüfung; Überprüfung ermöglicht Anpassung."),
 Q(79, "pmg-scrum", "Wer ist für die Effektivität des Scrum Teams ergebnisverantwortlich?", ["Product Owner", "Scrum Master", "Developer:innen", "Management"], 1, "Scrum Master: Einführung von Scrum und Effektivität des Teams."),
 Q(80, "pmg-sevent", "Wie lange dauert das Sprint Planning bei einem 1-Monats-Sprint höchstens?", ["4 h", "8 h", "15 min", "1 Tag pro Woche"], 1, "Max. 8 h; bei kürzeren Sprints meist kürzer."),
 Q(81, "pmg-sevent", "Burndown: Sprint 10 Tage, 50 Punkte. Nach Tag 4 sind 15 Punkte erledigt. Wie weit liegt das Team hinter der Ideallinie?", ["5 Punkte", "15 Punkte", "10 Punkte", "0 Punkte"], 0, "Ideal offen: 50 · 0,6 = 30; tatsächlich 35 → 5 Punkte dahinter."),
 Q(82, "pmg-sevent", "Was ist die einzige Quelle von Arbeit für das Scrum Team?", ["Sprint Backlog", "Product Backlog", "Increment", "Definition of Done"], 1, "Product Backlog: emergente, geordnete Liste, einzige Arbeitsquelle."),
 Q(83, "pmg-sevent", "Für wen ist das Daily Scrum ein Event?", ["Für die Stakeholder:innen", "Für die Developer:innen", "Für den Product Owner", "Für das Management"], 1, "PO oder SM nehmen nur teil, wenn sie aktiv an Einträgen arbeiten."),
 Q(84, "pmg-sevent", "Mehrere Teams arbeiten an einem Produkt. Was gilt für die Definition of Done?", ["Jedes Team hat eine eigene", "Sie brauchen eine gemeinsame DoD", "Der Scrum Master definiert sie pro Sprint", "Es gibt keine"], 1, "Mehrere Teams an einem Produkt → gemeinsame DoD."),
 Q(85, "pmg-sevent", "Noch 24 Punkte offen, 3 Sprinttage übrig. Welches Tempo ist nötig, um das Sprintende zu erreichen?", ["6 Punkte/Tag", "8 Punkte/Tag", "24 Punkte/Tag", "3 Punkte/Tag"], 1, "24 / 3 = 8 Punkte pro Tag.")
];

const FLASH = [
 ["pmg-netz", "PERT-Erwartungswert", "T<sub>m</sub> = (T<sub>o</sub> + 4·T<sub>w</sub> + T<sub>p</sub>) / 6 · Beispiel 2/5/14 → 6 Tage · T<sub>w</sub> zählt vierfach"],
 ["pmg-netz", "Vorwärts- und Rückwärtsrechnung (Zeitpunktzählung)", "Vorwärts: FEZ = FAZ + D, FAZ = <b>max</b> FEZ der Vorgänger · Rückwärts: SAZ = SEZ − D, SEZ = <b>min</b> SAZ der Nachfolger · GP = SAZ − FAZ · FP = min FAZ Nachfolger − FEZ"],
 ["pmg-sach", "Arbeitswert", "Geplante Kosten der tatsächlich erbrachten Arbeitsleistung = Plankosten × Fertigstellungsgrad (international: Earned Value, EV)"],
 ["pmg-sach", "Kosten-Leistungs-Index", "Aufgelaufene Istkosten / Arbeitswert · &gt; 1 = schlechter Fortschritt · international umgekehrt: CPI = EV / AC (&lt; 1 schlecht)"],
 ["pmg-kontr", "Plan-/Ist-Vergleich: absolut vs. linear", "Absolut: Ist vs. Endplanwert (wenig aussagekräftig) · linear: Ist vs. linearem Planverlauf bis zum Stichtag · besser: aufwandskorreliert/plankorrigiert oder über den Sachfortschritt"],
 ["pmg-kontr", "Stundenverrechnungssatz", "Jahresbudget der Kostenstelle / geleistete Stunden pro Jahr (ohne Ausfallzeiten) · Umlage = Satz × Stunden · Bsp. 600.000 / 8.000 = 75 €/h"],
 ["pmg-schaetz", "Prozentsatzmethode rechnen", "Gesamt = gemessener Phasenaufwand / Phasenanteil · Bsp. 90 PT / 0,18 = 500 PT · danach Anteile der anderen Phasen · Zuschlag 10–30 % für PM, Doku, Schulung"],
 ["pmg-schaetz", "Stichprobenmethode rechnen", "Kleine repräsentative Menge genau schätzen, mit Faktor hochrechnen · Bsp. 10 von 200 Masken = 27 PT → 27 · 20 = 540 PT"],
 ["pmg-schaetz", "Kommunikationspfade", "n · (n − 1) / 2 · 6 Personen → 15, 12 Personen → 66 · Grund für Speed-up-Faktor &lt; 1"],
 ["pmg-sevent", "Burndown-Chart", "Offene Arbeit über die Sprinttage · Ideallinie = gleichmäßiger Abbau · über der Linie = hinter Plan · laut Guide nützlich, ersetzt aber nicht die Empirie"],
 ["pmg-ziel", "Nutzwertanalyse rechnen", "Nutzwert = Σ Gewicht × Punkte (Gewichte summieren auf 100 %) · K.-o.-Kriterien vorab prüfen · Ergebnis auf Robustheit gegenüber Gewichten prüfen"],
 ["pmg-res", "Kapazitätsausgleich mit Puffer", "Überlast zuerst durch Verschieben von Vorgängen mit Gesamtpuffer innerhalb des Puffers abbauen → Ende bleibt (termintreu); reicht der Puffer nicht: kapazitätstreu (Ende wandert) oder mehr Kapazität"]
];

window.STUDYOS_EXT = window.STUDYOS_EXT || {};
(window.STUDYOS_EXT.pmgt = window.STUDYOS_EXT.pmgt || []).push({ id: "pmgt-plus", blocks: BL, questions: QUESTIONS, flashcards: FLASH });
})();
