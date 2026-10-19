/* ITINF-GL · Plus: Rechner mit Live-Graph, Animationen, durchgerechnete Beispiele, zusätzliche Mehrfachauswahl-Fragen (über STUDYOS_EXT, siehe courses/ext-apply.js) */
(function () {
const C = window.STUDYOS_CALC = window.STUDYOS_CALC || {};
const FIG = window.STUDYOS_FIG = window.STUDYOS_FIG || {};
const FX = window.FX;
const nd = (n, d = 2) => Number(n).toLocaleString("de-AT", { maximumFractionDigits: d });
const n0 = n => Number(n).toLocaleString("de-AT", { maximumFractionDigits: 0 });
const eur = n => "€ " + Number(n).toLocaleString("de-AT", { maximumFractionDigits: 0 });
const usd = n => "$ " + Number(n).toLocaleString("de-AT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (x, d = 4) => (x * 100).toLocaleString("de-AT", { maximumFractionDigits: d }) + " %";
const hm = h => h >= 48 ? nd(h / 24, 1) + " Tage" : h >= 1 ? nd(h, 1) + " h" : h * 60 >= 1 ? nd(h * 60, 1) + " min" : nd(h * 3600, 0) + " s";

/* ======================= RECHNER ======================= */

/* 1 · Composite SLA (itg3-4) */
C["itinf-sla"] = {
  title: "Composite SLA: Kette und Regionen",
  intro: "Bis zu drei Dienste hängen hintereinander (seriell, alle werden gebraucht). Optional läuft die ganze Kette in mehreren unabhängigen Regionen parallel. Setze einen Dienst auf 100 %, wenn du ihn nicht brauchst.",
  inputs: [
    { k: "a1", label: "Dienst 1 (z. B. App Service)", v: 99.95, min: 99, max: 100, step: 0.01, unit: "%" },
    { k: "a2", label: "Dienst 2 (z. B. SQL Database)", v: 99.99, min: 99, max: 100, step: 0.01, unit: "%" },
    { k: "a3", label: "Dienst 3 (z. B. Storage)", v: 99.9, min: 99, max: 100, step: 0.01, unit: "%" },
    { k: "n", label: "Regionen parallel", v: 1, min: 1, max: 3, step: 1 }
  ],
  out: v => { const s = v.a1 * v.a2 * v.a3 / 1e6, par = 1 - (1 - s) ** v.n;
    return [["Kette seriell", pct(s)], ["Ausfall pro Jahr (seriell)", hm((1 - s) * 8760)], ["Ausfall pro Monat (seriell)", hm((1 - s) * 730)], [`mit ${v.n} Region${v.n > 1 ? "en" : ""}`, pct(par, 6), "", true], ["Ausfall pro Jahr", hm((1 - par) * 8760)]]; },
  steps: v => { const s = v.a1 * v.a2 * v.a3 / 1e6, par = 1 - (1 - s) ** v.n;
    return `Seriell: A = A<sub>1</sub> · A<sub>2</sub> · A<sub>3</sub> = ${nd(v.a1 / 100, 4)} · ${nd(v.a2 / 100, 4)} · ${nd(v.a3 / 100, 4)} = <b>${pct(s)}</b><br>
    Ausfall = (1 − A) · 8.760 h = ${nd(1 - s, 6)} · 8.760 h = <b>${hm((1 - s) * 8760)}</b> pro Jahr (pro Monat: · 730 h = ${hm((1 - s) * 730)})<br>
    Parallel über ${v.n} unabhängige Region${v.n > 1 ? "en" : ""}: A = 1 − (1 − ${pct(s)})<sup>${v.n}</sup> = <b>${pct(par, 6)}</b><br>
    Die Kette ist immer schlechter als ihr schwächstes Glied (${nd(Math.min(v.a1, v.a2, v.a3), 2)} %). Redundanz hilft nur, wenn die Ausfälle wirklich unabhängig sind.`; },
  plot: { yl: "Ausfall in Stunden pro Jahr", yfmt: n => nd(n, 1), bars: v => { const s = v.a1 * v.a2 * v.a3 / 1e6, h = x => (1 - x) * 8760;
    return [{ label: "Dienst 1", y: h(v.a1 / 100) }, { label: "Dienst 2", y: h(v.a2 / 100) }, { label: "Dienst 3", y: h(v.a3 / 100) }, { label: "Kette", y: h(s) }, { label: v.n + " Region(en)", y: h(1 - (1 - s) ** v.n) }]; } }
};

/* 2 · Serverless-Kosten vs. VM (itg2-2) */
const faas = (ex, v) => { const mem = Math.ceil(v.mem / 128) * 128, gbs = ex * Math.max(100, v.ms) / 1000 * mem / 1024;
  return { gbs, cost: Math.max(0, ex - 1e6) * 0.2 / 1e6 + Math.max(0, gbs - 400000) * 0.000016 }; };
C["itinf-faas"] = {
  title: "Azure Functions (Consumption) oder eine Always-on-VM?",
  intro: "Serverless rechnet pro Ausführung und GB-Sekunde ab, eine VM kostet fix pro Monat. Preise laut Azure-Preisliste für den Consumption Plan (USD, können sich ändern): 0,20 $ pro Million Ausführungen, 0,000016 $ pro GB-s, monatlich frei: 1 Mio. Ausführungen und 400.000 GB-s.",
  inputs: [
    { k: "ex", label: "Ausführungen pro Monat", v: 3, min: 0, max: 200, step: 0.5, unit: "Mio." },
    { k: "ms", label: "mittlere Laufzeit", v: 300, min: 50, max: 5000, step: 50, unit: "ms" },
    { k: "mem", label: "Arbeitsspeicher", v: 512, min: 128, max: 1536, step: 128, unit: "MB" },
    { k: "vm", label: "Vergleich: VM bzw. App Service pro Monat", v: 70, min: 5, max: 500, step: 5, unit: "$" }
  ],
  out: v => { const f = faas(v.ex * 1e6, v); let be = NaN; for (let m = 0; m <= 5000; m += 0.1) { if (faas(m * 1e6, v).cost >= v.vm) { be = m; break; } }
    return [["GB-Sekunden", n0(f.gbs)], ["Functions pro Monat", usd(f.cost), "", true], ["VM pro Monat", usd(v.vm)], ["Functions teurer ab", isFinite(be) ? nd(be, 1) + " Mio. Ausführungen" : "> 5 Mrd."]]; },
  steps: v => { const mem = Math.ceil(v.mem / 128) * 128, ex = v.ex * 1e6, f = faas(ex, v);
    return `GB-s = Ausführungen · Laufzeit · Speicher = ${n0(ex)} · ${nd(Math.max(100, v.ms) / 1000, 3)} s · ${nd(mem / 1024, 3)} GB = <b>${n0(f.gbs)} GB-s</b><br>
    Ausführungskosten = (${n0(ex)} − 1.000.000 frei) · 0,20 $ / 1 Mio. = ${usd(Math.max(0, ex - 1e6) * 0.2 / 1e6)}<br>
    Rechenkosten = (${n0(f.gbs)} − 400.000 frei) · 0,000016 $ = ${usd(Math.max(0, f.gbs - 400000) * 0.000016)}<br>
    Summe = <b>${usd(f.cost)}</b> gegenüber ${usd(v.vm)} für die VM, die auch nachts läuft.<br>
    Vereinfachung: Speicher wird auf 128-MB-Schritte aufgerundet, mindestens 100 ms pro Ausführung. Nicht eingerechnet: Storage, Netzwerk, Cold Starts.`; },
  plot: { x: v => [0, Math.max(20, v.ex * 3)], xl: "Mio. Ausführungen pro Monat", yl: "$ pro Monat", fns: [
    { label: "Azure Functions", f: (x, v) => faas(x * 1e6, v).cost }, { label: "VM fix", f: (x, v) => v.vm }],
    points: v => [{ x: v.ex, y: faas(v.ex * 1e6, v).cost, label: "aktuell" }] }
};

/* 3 · Autoscaling über einen Tag (itg4-2) */
const dem = (h, v) => v.b + (v.p - v.b) * (0.5 - 0.5 * Math.cos(2 * Math.PI * (h - 8) / 24));
const inst = (h, v) => { const h0 = Math.floor(h); return Math.max(v.m, Math.ceil(Math.max(dem(h0, v), dem(h0 + 1, v)) / v.k - 1e-9)); };
C["itinf-autoscale"] = {
  title: "Periodische Last: feste Kapazität oder Autoscaling?",
  intro: "Ein Webshop hat morgens um 8 Uhr die geringste und abends um 20 Uhr die höchste Last. On-premises muss die Kapazität für die Spitze reichen. Mit Autoscaling (scale out / scale in) folgen die Instanzen der Last.",
  inputs: [
    { k: "b", label: "Grundlast (Minimum)", v: 200, min: 0, max: 5000, step: 50, unit: "Req/s" },
    { k: "p", label: "Spitzenlast (20 Uhr)", v: 2000, min: 100, max: 20000, step: 100, unit: "Req/s" },
    { k: "k", label: "Kapazität einer Instanz", v: 250, min: 50, max: 2000, step: 50, unit: "Req/s" },
    { k: "m", label: "Mindestanzahl Instanzen", v: 2, min: 1, max: 10, step: 1 },
    { k: "pr", label: "Preis pro Instanz-Stunde", v: 0.2, min: 0.01, max: 2, step: 0.01, unit: "€" }
  ],
  out: v => { const fix = Math.max(v.m, Math.ceil(v.p / v.k)); let ih = 0, avg = 0; for (let h = 0; h < 24; h++) { ih += inst(h + 0.5, v); avg += dem(h + 0.5, v) / 24; }
    return [["feste Instanzen (für die Spitze)", fix], ["Instanz-Stunden/Tag fest", fix * 24], ["Instanz-Stunden/Tag Autoscale", ih], ["Ersparnis", nd(100 * (1 - ih / (fix * 24)), 1), "%", true], ["Kosten/Monat fest vs. Autoscale", eur(fix * 24 * 30 * v.pr) + " / " + eur(ih * 30 * v.pr)], ["p/a dieses Workloads", nd(v.p / avg, 2)]]; },
  steps: v => { const fix = Math.max(v.m, Math.ceil(v.p / v.k)); let ih = 0; for (let h = 0; h < 24; h++) ih += inst(h + 0.5, v);
    return `Fest: ⌈Spitze / Kapazität⌉ = ⌈${n0(v.p)} / ${n0(v.k)}⌉ = <b>${fix}</b> Instanzen, 24 h lang → ${fix * 24} Instanz-Stunden<br>
    Autoscale: je Stunde ⌈höchste Last der Stunde / Kapazität⌉, mindestens ${v.m} (für Verfügbarkeit) → Summe <b>${ih}</b> Instanz-Stunden<br>
    Ersparnis = 1 − ${ih} / ${fix * 24} = <b>${nd(100 * (1 - ih / (fix * 24)), 1)} %</b><br>
    Je größer der Abstand zwischen Spitze und Durchschnitt (p/a), desto mehr bringt Elastizität. Bei statischer Last (Grundlast = Spitze) ist die Ersparnis 0.`; },
  plot: { x: [0, 24], xl: "Uhrzeit", yl: "Req/s", xfmt: n => n0(n) + " h", fns: [
    { label: "Last", f: (x, v) => dem(x, v) }, { label: "Autoscale-Kapazität", f: (x, v) => inst(Math.min(23.99, Math.floor(x)) + 0.5, v) * v.k }, { label: "feste Kapazität", f: (x, v) => Math.max(v.m, Math.ceil(v.p / v.k)) * v.k }] }
};

/* 4 · p/a-Regel mit echten Preisen (itg4-3) */
C["itinf-pa"] = {
  title: "Weinmans p/a-Regel mit Euro-Beträgen",
  intro: "In-house hältst du Kapazität für die Spitze p vor und zahlst d pro Server-Stunde. In der Cloud zahlst du nur die Durchschnittslast a, aber zum Preis c. Die Cloud ist billiger, solange c/d &lt; p/a.",
  inputs: [
    { k: "p", label: "Spitzenlast p", v: 10, min: 1, max: 200, step: 1, unit: "Server" },
    { k: "a", label: "Durchschnittslast a", v: 2, min: 0.1, max: 200, step: 0.1, unit: "Server" },
    { k: "d", label: "in-house d (inkl. Strom, Admin, Abschreibung)", v: 0.15, min: 0.01, max: 2, step: 0.01, unit: "€/h" },
    { k: "c", label: "Cloud c", v: 0.45, min: 0.01, max: 5, step: 0.01, unit: "€/h" }
  ],
  out: v => { const a = Math.min(v.a, v.p), ih = v.d * v.p * 730, cl = v.c * a * 730;
    return [["p/a", nd(v.p / a, 2)], ["c/d", nd(v.c / v.d, 2)], ["in-house pro Monat (d · p · 730 h)", eur(ih)], ["Cloud pro Monat (c · a · 730 h)", eur(cl)], [cl < ih ? "Cloud günstiger um" : "in-house günstiger um", eur(Math.abs(ih - cl)), "/Monat", true], ["höchster sinnvoller Cloud-Preis", nd(v.d * v.p / a, 2), "€/h"]]; },
  steps: v => { const a = Math.min(v.a, v.p);
    return `p/a = ${nd(v.p)} / ${nd(a)} = <b>${nd(v.p / a, 2)}</b> · c/d = ${nd(v.c)} / ${nd(v.d)} = <b>${nd(v.c / v.d, 2)}</b> → ${v.c / v.d < v.p / a ? "c/d &lt; p/a: <b>Cloud gewinnt</b>" : "c/d ≥ p/a: <b>in-house gewinnt</b>"}<br>
    in-house = d · p · 730 h = ${nd(v.d)} · ${nd(v.p)} · 730 = ${eur(v.d * v.p * 730)}<br>Cloud = c · a · 730 h = ${nd(v.c)} · ${nd(a)} · 730 = ${eur(v.c * a * 730)}<br>
    Break-even: c* = d · p / a = <b>${nd(v.d * v.p / a, 2)} €/h</b>. Nicht enthalten: Egress, Migration, Rabattmodelle (Reserved/Savings Plan).`; },
  plot: { x: v => [0, Math.max(v.c * 1.6, v.d * v.p / Math.min(v.a, v.p) * 1.4)], xl: "Cloud-Preis c (€/h)", yl: "€ pro Monat", fns: [
    { label: "in-house (fix)", f: (x, v) => v.d * v.p * 730 }, { label: "Cloud c · a · 730", f: (x, v) => x * Math.min(v.a, v.p) * 730 }],
    points: v => [{ x: v.d * v.p / Math.min(v.a, v.p), y: v.d * v.p * 730, label: "Break-even" }] }
};

/* 5 · CapEx vs. OpEx über die Zeit (itg4-4) */
const onprem = (t, v) => v.h * (1 + Math.floor(t / v.l - 1e-9) * (t > 0 ? 1 : 0)) + v.r * t;
C["itinf-capex"] = {
  title: "Kaufen oder mieten: kumulierte Kosten über 5 Jahre",
  intro: "On-premises: Hardware vorab kaufen (CapEx), danach laufende Kosten für Strom, Fläche und Betreuung; nach der Nutzungsdauer wird neu gekauft. Cloud: monatliche Kosten (OpEx), mit Pay-as-you-go oder mit Reservierung (1 oder 3 Jahre Bindung) günstiger.",
  inputs: [
    { k: "h", label: "Hardware-Kauf (CapEx)", v: 60000, min: 0, max: 500000, step: 5000, unit: "€" },
    { k: "l", label: "Nutzungsdauer", v: 48, min: 24, max: 72, step: 12, unit: "Monate" },
    { k: "r", label: "laufend on-prem pro Monat", v: 800, min: 0, max: 10000, step: 100, unit: "€" },
    { k: "m", label: "Cloud Pay-as-you-go pro Monat", v: 2600, min: 100, max: 20000, step: 100, unit: "€" },
    { k: "d", label: "Rabatt durch Reservierung", v: 40, min: 0, max: 72, step: 1, unit: "%" }
  ],
  out: v => { const T = 60, op = onprem(T, v), pg = v.m * T, rs = v.m * (1 - v.d / 100) * T;
    const be = t => { for (let x = 0; x <= 120; x += 0.25) if (onprem(x, v) <= t * x) return x; return NaN; };
    const b1 = be(v.m), b2 = be(v.m * (1 - v.d / 100));
    return [["on-prem nach 5 Jahren", eur(op)], ["Pay-as-you-go nach 5 Jahren", eur(pg)], ["Reserviert nach 5 Jahren", eur(rs), "", true], ["on-prem billiger als PAYG ab Monat", isFinite(b1) ? nd(b1, 1) : "nie (≤ 10 J.)"], ["on-prem billiger als Reserviert ab Monat", isFinite(b2) ? nd(b2, 1) : "nie (≤ 10 J.)"]]; },
  steps: v => `on-prem(t) = CapEx · Anzahl Kaufzyklen + laufend · t = ${eur(v.h)} · ⌈t / ${v.l}⌉ + ${eur(v.r)} · t<br>
    PAYG(t) = ${eur(v.m)} · t · Reserviert(t) = ${eur(v.m)} · (1 − ${v.d} %) · t = ${eur(v.m * (1 - v.d / 100))} · t<br>
    Erster Schnittpunkt: CapEx / (Cloud-Monatskosten − laufend) = ${eur(v.h)} / ${eur(v.m - v.r)} = <b>${v.m > v.r ? nd(v.h / (v.m - v.r), 1) + " Monate" : "–"}</b> (gegenüber PAYG, innerhalb des ersten Kaufzyklus)<br>
    on-prem pro Monat über die Nutzungsdauer (TCO-Sicht): ${eur(v.h)} / ${v.l} + ${eur(v.r)} = <b>${eur(v.h / v.l + v.r)}</b><br>
    Achtung: Das gilt für <b>statische</b> Last. Schwankt die Last, sinken die Cloud-Kosten mit Autoscaling, die Hardware bleibt bezahlt (p/a-Regel).`,
  plot: { x: [0, 60], xl: "Monate", yl: "€ kumuliert", yfmt: n => n0(n / 1000) + "k", fns: [
    { label: "on-prem (CapEx + laufend)", f: (x, v) => onprem(x, v) }, { label: "Cloud Pay-as-you-go", f: (x, v) => v.m * x }, { label: "Cloud reserviert", f: (x, v) => v.m * (1 - v.d / 100) * x }] }
};

/* 6 · PUE und Energie (itv2-3) */
C["itinf-pue"] = {
  title: "Rechenzentrum: Strom, PUE, Kosten und CO₂",
  intro: "PUE = Gesamtenergie / IT-Energie. Alles über 1,0 ist Overhead für Kühlung, USV-Verluste und Licht. Die Startwerte entsprechen dem Beispiel der Folie (90.000 Server à 500 W).",
  inputs: [
    { k: "n", label: "Server", v: 90000, min: 100, max: 300000, step: 100 },
    { k: "w", label: "Leistung pro Server", v: 500, min: 100, max: 1500, step: 10, unit: "W" },
    { k: "pue", label: "PUE", v: 1.5, min: 1, max: 2.5, step: 0.01 },
    { k: "kwh", label: "Strompreis", v: 0.12, min: 0.02, max: 0.5, step: 0.01, unit: "€/kWh" },
    { k: "co2", label: "Emissionsfaktor Strommix", v: 150, min: 0, max: 800, step: 10, unit: "g/kWh" }
  ],
  out: v => { const it = v.n * v.w * 8760 / 1e9, tot = it * v.pue;
    return [["IT-Energie pro Jahr", nd(it, 1), "GWh"], ["Gesamtenergie pro Jahr", nd(tot, 1), "GWh", true], ["davon Overhead", nd(tot - it, 1), "GWh"], ["Stromkosten pro Jahr", eur(tot * 1e6 * v.kwh)], ["CO₂ pro Jahr", n0(tot * 1e6 * v.co2 / 1e6), "t"], ["Ersparnis bei PUE 1,1", eur((v.pue - 1.1) * it * 1e6 * v.kwh)]]; },
  steps: v => { const it = v.n * v.w * 8760 / 1e9;
    return `IT-Energie = ${n0(v.n)} · ${v.w} W · 8.760 h = ${nd(v.n * v.w * 8760 / 1e6, 0)} MWh = <b>${nd(it, 1)} GWh</b><br>
    Gesamt = IT · PUE = ${nd(it, 1)} · ${nd(v.pue)} = <b>${nd(it * v.pue, 1)} GWh</b> (Vergleich Folie: Stadt mit 300.000 Einwohnern ≈ 525 GWh Haushaltsstrom)<br>
    Kosten = ${nd(it * v.pue * 1e6, 0)} kWh · ${nd(v.kwh)} € = <b>${eur(it * v.pue * 1e6 * v.kwh)}</b><br>
    CO₂ = ${nd(it * v.pue * 1e6, 0)} kWh · ${v.co2} g = <b>${n0(it * v.pue * v.co2)} t</b>`; },
  plot: { x: [1, 2.5], xl: "PUE", yl: "GWh pro Jahr", fns: [{ label: "Gesamtenergie", f: (x, v) => v.n * v.w * 8760 / 1e9 * x }, { label: "IT-Energie", f: (x, v) => v.n * v.w * 8760 / 1e9 }],
    points: v => [{ x: v.pue, y: v.n * v.w * 8760 / 1e9 * v.pue, label: "aktuell" }] }
};

/* 7 · Azure-Subnetze: 5 reservierte Adressen (itx-4) */
C["itinf-vnet"] = {
  title: "VNet und Subnetze planen: wie viele Adressen bleiben übrig?",
  intro: "Azure reserviert in jedem Subnetz <b>5 Adressen</b>: die Netzadresse, drei für Azure (Gateway, DNS) und die letzte. Gib den Adressraum des VNets, die Subnetzgröße und den Bedarf ein.",
  inputs: [
    { k: "v", label: "Präfix des VNet-Adressraums", v: 16, min: 8, max: 29, step: 1, unit: "/" },
    { k: "s", label: "Präfix je Subnetz", v: 24, min: 8, max: 29, step: 1, unit: "/" },
    { k: "need", label: "benötigte IPs im größten Subnetz", v: 120, min: 1, max: 5000, step: 1 }
  ],
  out: v => { const s = Math.max(v.s, v.v), tot = 2 ** (32 - s), use = tot - 5, fit = (() => { for (let q = 29; q >= 8; q--) if (2 ** (32 - q) - 5 >= v.need) return q; return NaN; })();
    return [["Adressen je Subnetz", n0(tot)], ["nutzbar in Azure", n0(use), "", true], ["Subnetze dieser Größe im VNet", n0(2 ** (s - v.v))], [use >= v.need ? "Bedarf passt" : "Bedarf passt NICHT", n0(v.need) + " von " + n0(use)], ["kleinstes passendes Präfix", isFinite(fit) ? "/" + fit + " (" + n0(2 ** (32 - fit) - 5) + " nutzbar)" : "–"]]; },
  steps: v => { const s = Math.max(v.s, v.v);
    return `Adressen = 2<sup>32 − ${s}</sup> = ${n0(2 ** (32 - s))}; nutzbar = ${n0(2 ** (32 - s))} − 5 = <b>${n0(2 ** (32 - s) - 5)}</b><br>
    Anzahl Subnetze = 2<sup>${s} − ${v.v}</sup> = <b>${n0(2 ** (s - v.v))}</b><br>
    Beispiel 10.0.1.0/24: reserviert sind .0 (Netz), .1 (Default Gateway), .2 und .3 (Azure DNS) und .255 → erste nutzbare Adresse 10.0.1.4.<br>
    Das kleinste Subnetz in Azure ist /29 (8 − 5 = 3 nutzbar). Adressräume gepeerter VNets dürfen sich nicht überlappen.`; },
  plot: { yl: "nutzbare Adressen in Azure", bars: v => [29, 28, 27, 26, 25, 24].map(q => ({ label: "/" + q, y: 2 ** (32 - q) - 5 })) }
};

/* 8 · Blob Access Tiers (itx-3) */
const tier = (x, v, st, rd) => v.tb * 1024 * (st + x / 100 * rd);
C["itinf-blob"] = {
  title: "Hot, Cool oder Archive: welche Zugriffsebene ist am günstigsten?",
  intro: "Kühlere Ebenen kosten weniger Speicher, aber mehr pro gelesenem GB. Die Startwerte sind gerundete <b>Beispielpreise</b> in €/GB (LRS); echte Preise je Region im Azure-Preisrechner prüfen. Nicht enthalten: Transaktionen, Mindestspeicherdauer (Cool 30, Cold 90, Archive 180 Tage), Rehydrierungszeit.",
  inputs: [
    { k: "tb", label: "gespeicherte Daten", v: 10, min: 0.1, max: 500, step: 0.1, unit: "TB" },
    { k: "rd", label: "pro Monat gelesen (Anteil)", v: 5, min: 0, max: 100, step: 1, unit: "%" },
    { k: "sh", label: "Hot: Speicher", v: 0.018, min: 0.001, max: 0.1, step: 0.001, unit: "€/GB" },
    { k: "sc", label: "Cool: Speicher", v: 0.01, min: 0.001, max: 0.1, step: 0.001, unit: "€/GB" },
    { k: "rc", label: "Cool: Lesen", v: 0.01, min: 0, max: 0.1, step: 0.001, unit: "€/GB" },
    { k: "sa", label: "Archive: Speicher", v: 0.002, min: 0.0005, max: 0.05, step: 0.0005, unit: "€/GB" },
    { k: "ra", label: "Archive: Lesen (inkl. Rehydrierung)", v: 0.022, min: 0, max: 0.2, step: 0.001, unit: "€/GB" }
  ],
  out: v => { const h = tier(v.rd, v, v.sh, 0), c = tier(v.rd, v, v.sc, v.rc), a = tier(v.rd, v, v.sa, v.ra), best = Math.min(h, c, a);
    return [["Hot pro Monat", eur(h), "", h === best], ["Cool pro Monat", eur(c), "", c === best && h !== best], ["Archive pro Monat", eur(a), "", a === best && h !== best && c !== best], ["Cool lohnt sich bis Leseanteil", v.rc > 0 ? nd(100 * (v.sh - v.sc) / v.rc, 0) + " %" : "immer"]]; },
  steps: v => { const gb = v.tb * 1024;
    return `Datenmenge = ${nd(v.tb, 1)} TB · 1.024 = ${n0(gb)} GB, davon gelesen ${v.rd} % = ${n0(gb * v.rd / 100)} GB<br>
    Hot = ${n0(gb)} · ${v.sh} = <b>${eur(tier(v.rd, v, v.sh, 0))}</b><br>Cool = ${n0(gb)} · ${v.sc} + ${n0(gb * v.rd / 100)} · ${v.rc} = <b>${eur(tier(v.rd, v, v.sc, v.rc))}</b><br>
    Archive = ${n0(gb)} · ${v.sa} + ${n0(gb * v.rd / 100)} · ${v.ra} = <b>${eur(tier(v.rd, v, v.sa, v.ra))}</b><br>
    Archive ist offline: Lesen braucht eine Rehydrierung, die bis zu Stunden dauert. Für Daten, die jemand sofort braucht, scheidet es trotz Preis aus.`; },
  plot: { x: [0, 100], xl: "pro Monat gelesener Anteil (%)", yl: "€ pro Monat", fns: [
    { label: "Hot", f: (x, v) => tier(x, v, v.sh, 0) }, { label: "Cool", f: (x, v) => tier(x, v, v.sc, v.rc) }, { label: "Archive", f: (x, v) => tier(x, v, v.sa, v.ra) }] }
};

/* ======================= ANIMATIONEN ======================= */
const { svg, g, t, tl, r, box, l, p, dot, user, cloud, server } = FX;

FIG["itinf-fig-scale"] = { title: "Scale up oder scale out? Vertikal, horizontal und elastisch",
  svg: () => svg(640, 290,
    t(160, 26, "Vertikal: scale up", { fw: 700, fs: 13 }) + t(480, 26, "Horizontal: scale out", { fw: 700, fs: 13 }) + l(320, 14, 320, 276, { cls: "thin dash" }) +
    g({ on: "0" }, box(110, 110, 100, 60, "VM|2 vCPU · 8 GB", { cls: "fx-soft", fs: 11.5, lh: 15 }) + t(160, 200, "Last steigt …", { fs: 12, cls: "t-warn", fw: 600 })) +
    g({ st: 1 }, box(80, 70, 160, 130, "VM|8 vCPU · 32 GB", { cls: "fx-acc", fs: 12.5, lh: 16 }) + t(160, 228, "Größe ändern = Neustart", { fs: 11, cls: "fx-sub" }) + t(160, 246, "Obergrenze: größte VM-Größe", { fs: 11, cls: "fx-sub" }) + t(160, 264, "bleibt ein Single Point of Failure", { fs: 11, cls: "t-bad" })) +
    g({ st: 2 }, box(420, 44, 120, 30, "Load Balancer", { cls: "fx-info", fs: 11.5 }) +
      [0, 1, 2, 3].map(i => { const x = 352 + i * 68; return l(480, 74, x + 28, 140, { cls: "thin" }) + box(x, 140, 56, 44, "VM " + (i + 1), { cls: i < 2 ? "fx-soft" : "fx-acc", fs: 11, on: i < 2 ? undefined : "2,4" }); }).join("") +
      dot("M480 74 L380 140", { dur: 1.4 }) + dot("M480 74 L448 140", { dur: 1.4, begin: 0.4 })) +
    g({ on: "2" }, t(480, 216, "+2 Instanzen bei CPU > 70 %", { fs: 11.5, fw: 600, cls: "t-acc" })) +
    g({ on: "3" }, [2, 3].map(i => r(352 + i * 68, 140, 56, 44, { cls: "fx-ghost", rx: 8 })).join("") + t(480, 216, "nachts CPU &lt; 30 %: scale in auf 2", { fs: 11.5, fw: 600, cls: "t-ok" }) + t(480, 234, "bezahlt wird nur, was läuft", { fs: 11, cls: "fx-sub" })) +
    g({ on: "4" }, t(480, 216, "keine Obergrenze, kein Neustart,", { fs: 11.5, fw: 600, cls: "t-ok" }) + t(480, 234, "fällt eine VM aus, laufen die anderen", { fs: 11.5, fw: 600, cls: "t-ok" }) + t(480, 262, "Gebot: „Scale out, not up“", { fs: 12, fw: 700, cls: "t-acc" }))),
  steps: [
    "Eine einzelne VM mit 2 vCPU und 8 GB RAM. Am Abend steigt die Last, die CPU läuft am Anschlag.",
    "<b>Vertikal skalieren (scale up)</b>: Die VM bekommt mehr CPU und RAM. Einfach, aber die Größenänderung braucht meist einen Neustart, es gibt eine Obergrenze, und es bleibt ein einzelnes Gerät.",
    "<b>Horizontal skalieren (scale out)</b>: Ein Load Balancer verteilt die Anfragen auf mehrere gleiche Instanzen. Bei hoher Last kommen weitere VMs dazu, z. B. über eine Autoscale-Regel auf die CPU-Auslastung.",
    "<b>Elastizität</b> heißt: auch wieder schrumpfen (scale in). Nachts laufen nur zwei Instanzen, das Minimum für Verfügbarkeit. Abgerechnet wird nach Nutzung (Measured service).",
    "Darum lautet eines der 5 Gebote der Cloud <b>„Scale out, not up“</b>: keine Obergrenze, kein Neustart, und der Ausfall einer Instanz legt den Dienst nicht lahm. Voraussetzung: Die Anwendung ist zustandslos."
  ] };

FIG["itinf-fig-ident"] = { title: "Woher kommen die Benutzer in Entra ID?",
  svg: () => svg(640, 290,
    r(16, 60, 170, 170, { cls: "fx-card", rx: 10 }) + t(101, 82, "On-premises", { fw: 700, fs: 12.5 }) + box(36, 96, 130, 40, "Windows Server AD|(AD DS)", { cls: "fx-mute", fs: 11, lh: 14 }) + user(70, 182) + user(110, 182) + t(101, 216, "Mitarbeitende", { fs: 10.5, cls: "fx-sub" }) +
    cloud(470, 120, 2.6) + t(470, 102, "Microsoft Entra ID", { fw: 700, fs: 13 }) + t(470, 120, "Tenant firma.onmicrosoft.com", { fs: 10.5, cls: "fx-sub" }) +
    box(420, 190, 100, 30, "M365 · Azure", { cls: "fx-info", fs: 11 }) + l(470, 150, 470, 188, { cls: "thin" }) +
    g({ on: "0" }, user(560, 160, { cls: "acc" }) + t(560, 196, "Cloud identity", { fs: 11, fw: 700, cls: "t-acc" }) + t(560, 212, "Quelle: Entra ID", { fs: 10.5, cls: "fx-sub" })) +
    g({ st: 1 }, box(222, 100, 130, 44, "Entra Connect Sync|oder Cloud Sync", { cls: "fx-acc", fs: 11, lh: 14 }) + p("M168 116 L220 116", { cls: "acc", arrow: true, acc: true }) + p("M354 122 L396 122", { cls: "acc", arrow: true, acc: true }) + dot("M168 120 L396 120", { dur: 1.8 })) +
    g({ on: "1,2" }, t(287, 170, "Directory-synchronized", { fs: 11, fw: 700, cls: "t-acc" }) + t(287, 186, "Quelle: Windows Server AD", { fs: 10.5, cls: "fx-sub" })) +
    g({ on: "2" }, box(196, 236, 250, 40, "Änderungen im lokalen AD,|nicht in der Cloud", { cls: "fx-warn", fs: 11, lh: 14 })) +
    g({ st: 3 }, user(600, 250, { cls: "bad" }) + t(600, 280, "Gast (B2B)", { fs: 11, fw: 700 }) + p("M588 246 C 560 236 540 226 522 210", { cls: "dash", arrow: true }) + t(520, 266, "Quelle: Invited User", { fs: 10.5, cls: "fx-sub", a: "end" })) +
    g({ on: "4" }, box(196, 236, 250, 40, "gelöscht: 30 Tage wiederherstellbar,|Gast entfernt = alle Zugriffe weg", { cls: "fx-soft", fs: 10.5, lh: 14 }))),
  steps: [
    "<b>Cloud identity</b>: Der Benutzer wird direkt in Entra ID angelegt, z. B. ein Admin-Konto. Quelle ist Microsoft Entra ID.",
    "<b>Directory-synchronized</b>: Die Benutzer existieren im lokalen Windows Server AD. Microsoft Entra Connect Sync oder Cloud Sync überträgt sie in den Tenant.",
    "Wichtig: Synchronisierte Benutzer werden an der Quelle verwaltet. Wer den Namen nur in der Cloud ändert, wird beim nächsten Sync überschrieben.",
    "<b>Guest user</b>: Eine externe Person aus einer anderen Organisation oder mit privatem Microsoft-Konto wird eingeladen (B2B). Sie meldet sich mit ihrer eigenen Identität an.",
    "Löschen: Gelöschte Benutzer lassen sich 30 Tage wiederherstellen. Wird ein Gast entfernt, verliert er sofort alle Zugriffe auf Ressourcen des Tenants."
  ] };

/* ======================= LEKTIONEN ======================= */
const EX = (title, html) => ({ t: "example", label: "Beispiel durchgerechnet", title, html });
const PR = (title, html) => ({ t: "example", label: "Beispiel aus der Praxis", title, html });
const CK = (q, opts, a, why) => ({ t: "check", q, opts, a, why });

const blocks = {
  "itg1-1": [PR("Ein Grazer Startup ohne eigenen Server", `Ein Team von vier Leuten baut eine Buchungs-App für Fitnessstudios. Statt 15.000 € für Server, Rack und USV auszugeben, nutzt es ab Tag 1 Azure: <b>Compute</b> (App Service für die Web-App), <b>Storage</b> (Blob für Profilbilder), <b>Networking</b> (DNS, CDN) und <b>Analytics</b> (Application Insights). Kosten im ersten Monat: rund 40 €. Als drei Monate später ein Studio-Verband mit 200 Standorten einsteigt, wird die Leistung in Minuten erhöht. Genau das sind die drei Versprechen der Definition: <b>schnellere Innovation, flexible Ressourcen, Economies of Scale</b>.`)],
  "itg1-2": [PR("Prüfstein NIST: Ist das schon Cloud?", `Die IT eines Krankenhauses bietet „interne Cloud-Server“ an: Man schreibt ein Ticket, nach drei Tagen richtet ein Admin die VM ein, verrechnet wird pauschal pro Abteilung.<ul>
    <li><b>On-demand self-service</b>: nein, ein Mensch muss eingreifen.</li><li><b>Broad network access</b>: ja, über das Netz erreichbar.</li><li><b>Resource pooling</b>: ja, die VMs teilen sich einen Cluster.</li>
    <li><b>Rapid elasticity</b>: nein, Wachstum dauert Tage.</li><li><b>Measured service</b>: nein, pauschal statt nach Verbrauch.</li></ul>
    Drei von fünf Merkmalen fehlen, also ist das nach NIST <b>Virtualisierung, aber keine Cloud</b>. Mit Self-Service-Portal, Autoscaling und verbrauchsabhängiger Verrechnung würde daraus eine Private Cloud.`)],
  "itg1-3": [PR("Ein Landeskrankenhaus wählt sein Deployment-Modell", `<ul><li>Patientenakten dürfen laut Vorgaben das eigene Rechenzentrum nicht verlassen → <b>Private Cloud</b> im eigenen Haus.</li>
    <li>Die Terminbuchungs-Website schwankt stark (Grippewelle) → <b>Public Cloud</b>.</li><li>Beides wird über VPN bzw. ExpressRoute verbunden → zusammen eine <b>Hybrid Cloud</b>.</li>
    <li>Fünf Spitäler des Landes teilen sich eine Plattform für Laborbefunde mit gleichen Compliance-Anforderungen → <b>Community Cloud</b>.</li>
    <li>Die KI-Bildauswertung läuft bei einem zweiten Hyperscaler, weil nur dieser das Modell anbietet → zusammen mit Azure eine <b>Multi-Cloud</b>, mit eigener API und eigenen Skripten.</li></ul>`)],
  "itg2-1": [EX("Auslastung: 10 dedizierte Server oder 2 Hosts mit VMs?", `Ein Unternehmen betreibt 10 Anwendungen auf je einem dedizierten Server mit durchschnittlich <b>12 % CPU-Auslastung</b>.<ol>
    <li>Genutzte Kapazität: 10 · 12 % = 1,2 Server-Äquivalente</li><li>Mit Virtualisierung und Ziel-Auslastung 60 %: 1,2 / 0,6 = 2 Hosts, plus 1 Host Reserve für Wartung und Ausfall = <b>3 Hosts</b></li>
    <li>Statt 10 Servern laufen 3, das spart Strom, Fläche und Lizenzen für Hardware-Wartung.</li></ol>
    Mit Containern geht es noch dichter: Die Anwendungen teilen sich ein Betriebssystem, starten in Sekunden statt Minuten und brauchen kein eigenes OS-Image pro App.`)],
  "itg2-2": [{ t: "calc", id: "itinf-faas" }, EX("Bildverkleinerung für einen Webshop: 1,20 $ statt 70 $", `Ein Shop lässt bei jedem Upload ein Produktbild verkleinern: <b>3 Mio. Ausführungen</b> pro Monat, je <b>300 ms</b> bei <b>512 MB</b>.<ol>
    <li>GB-Sekunden = 3.000.000 · 0,3 s · 0,5 GB = <b>450.000 GB-s</b></li><li>Rechenkosten: (450.000 − 400.000 frei) · 0,000016 $ = <b>0,80 $</b></li>
    <li>Ausführungen: (3 Mio. − 1 Mio. frei) · 0,20 $ / Mio. = <b>0,40 $</b></li><li>Summe <b>1,20 $</b> pro Monat, eine dauerhaft laufende VM für denselben Zweck kostet ein Vielfaches.</li></ol>
    Aber: Bei 100 Mio. Ausführungen à 2 s mit 1,5 GB wären es rund 4.800 $. Dann ist ein dauerhaft ausgelasteter Container oder eine VM günstiger. Serverless lohnt sich bei <b>unregelmäßiger, ereignisgetriebener</b> Last.`),
    CK("Wofür bezahlt man bei Azure Functions im Consumption Plan?", ["Pro bereitgestellter VM und Stunde", "Pro Ausführung und pro GB-Sekunde Laufzeit", "Einen Fixpreis pro Monat", "Nur für den Speicherplatz des Codes"], 1, "Ohne Aufrufe entstehen keine Rechenkosten (Scale to Zero). Pro Monat gibt es zusätzlich ein Freikontingent.")],
  "itg3-1": [PR("Ein Webshop in drei Schichten", `Der Fahrradhändler „Murradl“ braucht einen Onlineshop.<ul><li><b>IaaS</b>: Er mietet eine Linux-VM, installiert selbst nginx, PHP, MariaDB und den Shop. Sicherheitsupdates des Betriebssystems sind seine Aufgabe.</li>
    <li><b>PaaS</b>: Er lädt den Shop-Code in Azure App Service und nutzt Azure Database for MySQL. Patches für OS und Datenbank-Engine übernimmt Microsoft.</li>
    <li><b>SaaS</b>: Er bucht einen fertigen Shop wie Shopify, pflegt nur Produkte, Preise und Kundendaten.</li></ul>
    Je weiter oben, desto weniger Kontrolle und desto weniger Arbeit. Die Daten der Kunden bleiben in allen drei Fällen seine Verantwortung.`)],
  "itg3-2": [PR("Pizza as a Service, übersetzt auf die IT", `<table class='dt'><tr><th>Pizza</th><th>Cloud</th><th>Du machst selbst</th></tr>
    <tr><td>Zuhause gemacht</td><td>On-premises</td><td>alles: Ofen, Teig, Belag, Tisch</td></tr><tr><td>Fertigpizza aus dem Supermarkt</td><td>IaaS</td><td>Ofen anwerfen, servieren</td></tr>
    <tr><td>Lieferdienst</td><td>PaaS</td><td>Tisch decken, Getränke</td></tr><tr><td>Restaurant</td><td>SaaS</td><td>nur essen</td></tr></table>
    Prüfungsfrage aus dem Stil der Altprüfung: Microsoft 365 → SaaS, Azure Virtual Machines → IaaS, Azure App Service und Azure SQL Database → PaaS, Azure Functions → Serverless (meist zu PaaS gezählt).`)],
  "itg3-3": [PR("Der Datenabfluss, der nicht Microsofts Schuld war", `Eine Firma speichert Rechnungen in einem Azure Storage Account. Ein Entwickler setzt einen Container zum Testen auf „öffentlicher Lesezugriff“ und vergisst ihn. Ein Suchdienst findet die Dateien.<ul>
    <li>Physische Sicherheit, Hosts und Netz des Rechenzentrums (Anbieter): alles einwandfrei.</li><li>Konfiguration, Zugriffsrechte und Daten (Kunde): Fehler.</li></ul>
    Nach dem Shared Responsibility Model ist das ein Vorfall auf <b>Kundenseite</b>. Gegenmittel: Azure Policy „öffentlichen Blob-Zugriff verbieten“, Least Privilege, regelmäßige Prüfung im Defender for Cloud.`)],
  "itg3-4": [{ t: "fig", id: "itinf-fig-scale" }, { t: "calc", id: "itinf-sla" }, EX("Folien-Übung: App Service + SQL Database + Storage", `<ol><li>Seriell: 0,9995 · 0,9999 · 0,999 = <b>0,998401</b> ≈ 99,84 %</li>
    <li>Ausfall pro Jahr: (1 − 0,998401) · 8.760 h = 0,001599 · 8.760 h ≈ <b>14 h</b></li><li>Pro Monat: 0,001599 · 730 h ≈ <b>1,2 h</b></li>
    <li>Gleiche Kette zusätzlich in einer zweiten Region (Traffic Manager oder Front Door verteilt): 1 − 0,001599² = <b>99,99974 %</b> → ≈ 1,4 min pro Jahr</li></ol>
    Die zweite Region verbessert die Verfügbarkeit um fast drei Zehnerpotenzen, kostet aber doppelte Infrastruktur und braucht Datenreplikation. Der vorgeschaltete globale Lastverteiler hat selbst ein SLA, das man streng genommen seriell dazurechnen müsste.`),
    CK("Eine Anwendung braucht einen Dienst mit 99,9 % und einen mit 99,99 %. Wie viel Ausfall pro Jahr ist zu erwarten?", ["≈ 52 min", "≈ 8,8 h", "≈ 9,6 h", "≈ 17,5 h"], 2, "0,999 · 0,9999 = 0,9989 → 0,0011 · 8.760 h ≈ 9,6 h.")],
  "itg4-1": [EX("Skaleneffekt Strom: Serverraum vs. Hyperscaler", `Ein Mittelständler betreibt 40 Server à 400 W mit PUE 2,0, ein Hyperscaler dieselbe Last mit PUE 1,1.<ol>
    <li>IT-Energie: 40 · 0,4 kW · 8.760 h = <b>140.160 kWh</b></li><li>Serverraum: · 2,0 = 280.320 kWh; Hyperscaler: · 1,1 = 154.176 kWh</li>
    <li>Bei 0,20 €/kWh im Gewerbetarif: 56.064 € gegenüber 30.835 €, bei einem großen Einkaufspreis von 0,10 €/kWh sogar nur <b>15.418 €</b></li></ol>
    Strom (bessere PUE, günstigerer Einkauf), dazu bis 30 % Hardwarerabatt und automatisierter Betrieb: Das sind die Skaleneffekte, die der Kunde als niedrigeren Preis sieht.`)],
  "itg4-2": [{ t: "calc", id: "itinf-autoscale" }, EX("Ein Tag im Webshop: 2 bis 8 Instanzen", `Last: 200 Req/s um 8 Uhr, 2.000 Req/s um 20 Uhr. Eine Instanz schafft 250 Req/s, mindestens 2 laufen immer.<ol>
    <li>Fest für die Spitze: ⌈2.000 / 250⌉ = <b>8 Instanzen</b> · 24 h = 192 Instanz-Stunden pro Tag</li>
    <li>Autoscaling: nachts und morgens 2, am Nachmittag 4–6, abends 8 (je Stunde für die höchste Last dieser Stunde) → zusammen <b>124 Instanz-Stunden</b></li>
    <li>Ersparnis = 1 − 124 / 192 ≈ <b>35 %</b>. Bei 0,20 € pro Instanz-Stunde: 1.152 € statt 744 € pro Monat (30 Tage).</li></ol>
    Das Lastmuster ist <b>periodisch</b> (Time-of-day). Bei <b>statischer</b> Last gäbe es nichts zu sparen.`)],
  "itg4-3": [{ t: "calc", id: "itinf-pa" }, EX("Review-Frage 4 mit Preisen", `Peak 10 Server, Durchschnitt 2 → <b>p/a = 5</b>. Ein eigener Server kostet umgelegt 0,15 € pro Stunde (Abschreibung, Strom, Betreuung).<ul>
    <li>in-house: 0,15 € · 10 Server · 730 h = <b>1.095 € pro Monat</b> (Kapazität für die Spitze)</li>
    <li>Cloud zu 0,45 €/h (das 3-Fache): 0,45 € · 2 · 730 h = <b>657 €</b> → Cloud günstiger, denn c/d = 3 &lt; 5</li>
    <li>Höchster sinnvoller Cloud-Preis: c* = 0,15 · 10 / 2 = <b>0,75 €/h</b>. Bei 0,80 €/h würde in-house gewinnen.</li></ul>`)],
  "itg4-4": [{ t: "calc", id: "itinf-capex" }, EX("Drei Jahre ERP-Server: kaufen, PAYG oder reserviert?", `Eine ERP-Datenbank läuft rund um die Uhr gleichmäßig (statischer Workload).<ul>
    <li><b>Kauf</b>: 60.000 € Hardware, 4 Jahre Nutzung, 800 € pro Monat für Strom, Fläche und Betreuung → nach 36 Monaten 88.800 €</li>
    <li><b>Pay-as-you-go</b>: 2.600 € pro Monat → nach 36 Monaten 93.600 €. On-prem wird ab Monat 60.000 / (2.600 − 800) ≈ <b>33</b> günstiger.</li>
    <li><b>Reserviert</b> mit 40 % Rabatt: 1.560 € pro Monat → nach 36 Monaten <b>56.160 €</b>, deutlich unter beiden.</li></ul>
    Fazit wie auf der Folie: Für statische Grundlast <b>Reserved Instances bzw. Savings Plan</b>. Der Preis ist die Bindung über 1 oder 3 Jahre, also wieder ein Fixkostenelement.`)],
  "itg5-1": [PR("Die 5 Gebote an einem Ausfall erklärt", `Freitag, 18 Uhr: Eine VM des Ticketshops fällt aus.<ul><li><b>Everything fails all the time</b>: Das ist kein Ausnahmefall, darum laufen drei Instanzen hinter einem Load Balancer.</li>
    <li><b>MTTR statt MTTF</b>: Der Health Probe erkennt den Ausfall in 15 s, Autoscale startet eine neue Instanz in 2 min. Niemand repariert die alte VM.</li>
    <li><b>Fallacies</b>: Die App geht nicht davon aus, dass das Netz zuverlässig ist, und wiederholt fehlgeschlagene Aufrufe (Retry mit Backoff).</li>
    <li><b>Scale out, not up</b>: Mehr Last → mehr Instanzen, nicht größere.</li><li><b>Cattle, not pets</b>: Die defekte VM wird gelöscht und aus dem Image neu erzeugt.</li></ul>`)],
  "itg5-2": [PR("Exit-Strategie: Was kostet der Auszug?", `Eine Firma hat 80 TB Daten in Azure Blob Storage und will zu einem europäischen Anbieter wechseln.<ul>
    <li><b>Egress</b>: Bei einem angenommenen Listenpreis von rund 0,05–0,08 € pro GB Datenabfluss wären das grob 4.000–6.400 €. Viele Anbieter erlassen diese Gebühr inzwischen beim Wechsel, der EU Data Act verpflichtet sie, Wechselgebühren bis 2027 abzuschaffen.</li>
    <li><b>Lock-in</b> ist oft teurer als der Transfer: 40 Azure Functions und Logic Apps müssten neu geschrieben werden.</li>
    <li>Lehre: Exit-Strategie ab Tag 1, Daten in offenen Formaten, proprietäre Dienste bewusst wählen.</li></ul>`)],
  "itg6-1": [PR("Minimalarchitektur für die erste Laborübung", `Eine einfache Web-Anwendung in Azure besteht aus wenigen Basiskomponenten:<ol><li><b>Resource Group</b> „rg-lab1-web“ als Container</li><li><b>Virtual Network</b> 10.1.0.0/16 mit Subnetz 10.1.1.0/24</li>
    <li><b>Network Security Group</b>: eingehend nur TCP 443 und SSH 22 von der FH-IP</li><li><b>Virtual Machine</b> (Linux, B-Serie) mit <b>Public IP</b></li><li><b>Storage Account</b> für Boot-Diagnose</li></ol>
    Nach der Übung wird die Resource Group gelöscht, damit sind alle Ressourcen weg und es entstehen keine weiteren Kosten.`)],
  "itg6-2": [PR("Least Privilege im Projektteam", `Ein Team von 6 Entwicklern und 2 Analysten arbeitet in der Subscription „Webshop-Prod“.<ul><li>Entwickler: Gruppe „dev-webshop“ mit <b>Contributor</b> auf der Resource Group „rg-webshop-test“, <b>Reader</b> auf „rg-webshop-prod“.</li>
    <li>Analysten: <b>Reader</b> nur auf die Datenbank-Ressource.</li><li>Azure Policy „Allowed locations = West Europe, North Europe“ auf der Subscription.</li>
    <li>Secrets wie der Datenbank-Connection-String liegen in <b>Key Vault</b>, nicht im Code. Conditional Access verlangt MFA für alle Zugriffe auf das Portal.</li></ul>`)],
  "itv2-1": [PR("Regionswahl für eine österreichische Lern-App", `Kriterien: Nutzer in Österreich und Deutschland, Daten sollen in der EU bleiben, Disaster Recovery gewünscht.<ul>
    <li>Primär <b>Germany West Central</b> (Frankfurt): geringe Latenz, Geography Europe/Germany.</li><li>Paarregion <b>Germany North</b>: über 300 Meilen entfernt, Updates werden nacheinander eingespielt, im Katastrophenfall wird eine Region des Paares priorisiert wiederhergestellt.</li>
    <li>Nicht jeder Dienst ist in jeder Region verfügbar, und die Preise unterscheiden sich je Region. Beides vor der Wahl prüfen.</li></ul>`)],
  "itv2-2": [EX("Drei Verfügbarkeitsoptionen für dieselbe Web-App", `<table class='dt'><tr><th>Option</th><th>SLA laut Folie</th><th>Ausfall pro Jahr</th></tr><tr><td>1 VM (Premium SSD)</td><td>99,9 %</td><td>8,76 h</td></tr>
    <tr><td>2 VMs im Availability Set</td><td>99,95 %</td><td>4,38 h</td></tr><tr><td>2 VMs über 2 Availability Zones</td><td>99,99 %</td><td>52,6 min</td></tr></table>
    Rechnung: (1 − 0,9999) · 8.760 h = 0,876 h = 52,6 min. Zonen schützen gegen den Ausfall eines ganzen Rechenzentrums (eigener Strom, eigene Kühlung). Gegen den Ausfall einer ganzen Region hilft erst eine zweite Region.`)],
  "itv2-3": [{ t: "calc", id: "itinf-pue" }, EX("Folienbeispiel nachgerechnet", `<ol><li>IT: 90.000 Server · 500 W · 8.760 h = 394.200.000 kWh = <b>394,2 GWh</b></li><li>Mit PUE 1,5: 394,2 · 1,5 = <b>591,3 GWh</b> pro Jahr</li>
    <li>Vergleich: Eine Stadt mit 300.000 Einwohnern verbraucht rund 525 GWh Haushaltsstrom.</li><li>Mit PUE 1,1 wären es 433,6 GWh, also <b>157,7 GWh weniger</b>. Bei 0,10 €/kWh sind das 15,8 Mio. € pro Jahr.</li></ol>`),
    CK("Ein Rechenzentrum braucht insgesamt 12 GWh pro Jahr, davon 8 GWh für die IT. Wie hoch ist die PUE?", ["0,67", "1,5", "4", "1,2"], 1, "PUE = Gesamtenergie / IT-Energie = 12 / 8 = 1,5.")],
  "itv2-4": [PR("Tags für die Kostenzuordnung", `Ein Möbelhaus vergibt an jede Ressource drei Tags: <code>costcenter=4711</code>, <code>env=prod|test</code>, <code>owner=team-shop</code>.<br>
    In Cost Management lässt sich die Rechnung über 18.000 € danach gruppieren: Shop-Produktion 11.200 €, Shop-Test 3.900 €, Data-Team 2.900 €. Auffällig: Test kostet ein Drittel der Produktion. Ursache: Test-VMs laufen am Wochenende. Lösung: Auto-Shutdown um 19 Uhr spart rund 60 % der Testkosten.<br>
    Tags werden übrigens nicht automatisch von der Resource Group an die Ressourcen vererbt, dafür braucht man eine Azure Policy.`)],
  "itv2-5": [PR("Dieselbe VM mit CLI und PowerShell", `<pre><code># Azure CLI (Bash oder Cloud Shell)
az group create --name rg-demo --location westeurope
az vm create --resource-group rg-demo --name vm1 --image Ubuntu2204 --admin-username azureuser --generate-ssh-keys

# Azure PowerShell (Modul Az)
New-AzResourceGroup -Name rg-demo -Location westeurope
New-AzVM -ResourceGroupName rg-demo -Name vm1 -Image Ubuntu2204</code></pre>
    Beide Wege landen beim <b>Azure Resource Manager</b>, der authentifiziert, autorisiert (RBAC) und Policies prüft. Deshalb ist das Ergebnis identisch, egal ob Portal, CLI, PowerShell oder REST API.`)],
  "itv3-1": [PR("Subscriptions und Management Groups einer Bankengruppe", `<ul><li>Root Management Group → „Bank“ → „Produktion“ und „Entwicklung“</li><li>Unter „Produktion“: Subscriptions „Kernbank-Prod“ und „Online-Banking-Prod“, unter „Entwicklung“: „Sandbox“ und „Test“</li>
    <li>Policy „Nur EU-Regionen“ an der MG „Bank“ → gilt automatisch für alle vier Subscriptions</li><li>Kosten werden zuerst pro Subscription zusammengefasst: Die Entwicklung sieht ihre eigene Rechnung.</li></ul>
    Grenzen laut Folie: bis 10.000 Management Groups pro Verzeichnis, Baum bis 6 Ebenen tief (ohne Root und Subscription-Ebene).`)],
  "itv3-2": [PR("Policy und Initiative im Einsatz", `Die Initiative „Firmenstandard“ bündelt drei Policies und wird an der Management Group zugewiesen:<ol><li>Allowed locations: West Europe, North Europe (Effekt <b>Deny</b>)</li><li>Tag „costcenter“ erforderlich (Deny)</li><li>Storage Accounts nur mit HTTPS (Audit)</li></ol>
    Ergebnis nach der Auswertung: 212 Ressourcen, 9 nicht konform. Neue Fehlkonfigurationen werden beim Anlegen blockiert, bestehende über einen <b>Remediation Task</b> korrigiert. Neue Zuweisungen greifen nach etwa 5 Minuten, die regelmäßige Auswertung läuft alle 24 Stunden.`)],
  "itv3-3": [PR("Single Sign-On für eine Lern-App", `Eine FH bindet eine externe Lern-App an Entra ID an.<ol><li>Studentin öffnet die App, die leitet sie zum Identity Provider (Entra ID) weiter.</li><li>Entra ID prüft Passwort und MFA (AuthN).</li>
    <li>Entra ID stellt ein signiertes Token mit Claims aus: Name, E-Mail, Gruppe „Studierende“, Anmeldemethode.</li><li>Die App prüft die Signatur, vertraut dem IdP und gewährt Rechte nach der Gruppe (AuthZ).</li></ol>
    Die App sieht nie das Passwort. Verlässt die Studentin die FH, wird ihr Konto deaktiviert und alle angebundenen Apps sind automatisch gesperrt.`)],
  "itv3-4": [PR("Welches Assurance Level braucht welcher Dienst?", `<ul><li><b>Newsletter-Anmeldung</b>: self-asserted Identität, AAL1 reicht.</li><li><b>Online-Banking</b>: Identität beim Kontoeröffnen geprüft (IAL2), Login mit zwei Faktoren (AAL2).</li>
    <li><b>Admin-Zugang zu Kernbank-Systemen</b>: phishing-resistenter Hardware-Authenticator wie FIDO2-Key oder Smartcard (AAL3).</li><li><b>Föderierter Zugriff</b> auf eine Behördenplattform: signierte, gegen Injection geschützte Assertion für genau eine Relying Party (FAL2).</li></ul>
    Faustregel nach 800-63-4: Low/Moderate/High aus der Risikoanalyse ergeben jeweils Stufe 1/2/3.`)],
  "itv3-5": [PR("Self-Service Password Reset statt Helpdesk-Ticket", `Ein Unternehmen mit 800 Mitarbeitenden hat pro Monat rund 120 Passwort-Tickets à 10 Minuten.<ul><li>Aufwand: 120 · 10 min = <b>20 Stunden</b> Helpdesk pro Monat.</li>
    <li>Mit <b>SSPR</b> in Entra ID (in drei Schritten aktiviert: Benutzer festlegen, Authentifizierungsmethoden wählen, Registrierung verlangen) setzen Mitarbeitende ihr Passwort selbst zurück.</li>
    <li>Rückschreiben ins lokale AD für synchronisierte Benutzer braucht einen Premium-Plan. Conditional Access (P1) verlangt zusätzlich MFA bei Anmeldung von außerhalb.</li></ul>`)],
  "itv3-6": [{ t: "fig", id: "itinf-fig-ident" }, PR("Neue Kolleginnen per CSV anlegen", `Zum Semesterbeginn sollen 60 Tutorinnen und Tutoren als Cloud-Benutzer angelegt werden.<ol><li>CSV mit DisplayName, UserPrincipalName, Abteilung</li><li>Schleife in Microsoft Graph PowerShell mit <code>New-MgUser</code></li>
    <li>Prüfen: Duplikate, Tippfehler im UPN, Initialpasswort mit Zwang zur Änderung</li><li>Dynamische Gruppe „Tutoren“ mit der Regel <code>user.department -eq "Tutoring"</code> (benötigt P1) vergibt automatisch die Rechte.</li></ol>
    Am Semesterende reicht es, die Abteilung zu ändern: Die Benutzer fallen automatisch aus der Gruppe.`)],
  "itv3-7": [PR("Rollenzuweisung als Satz: wer, was, wo", `„Die Gruppe <b>Support</b> (wer) bekommt die Rolle <b>Virtual Machine Contributor</b> (was) auf der Resource Group <b>rg-shop-prod</b> (wo).“<ul>
    <li>Support kann VMs starten, stoppen und neu starten, aber keine Rechte an andere vergeben.</li><li>Auf darunterliegende Ressourcen wird die Zuweisung vererbt.</li>
    <li>Wer Zugriff weitergeben darf, braucht <b>Owner</b> oder <b>User Access Administrator</b>. Contributor hat Microsoft.Authorization/*/Write in den NotActions.</li>
    <li>Entra-Rollen wie User Administrator wirken dagegen auf Benutzer und Gruppen im Tenant, nicht auf Azure-Ressourcen.</li></ul>`)]
};

Object.assign(blocks, {
  "itx-1": [PR("Von der Region bis zur Ressource: eine Firma, ein Bild", `Die Spedition „Murtal Logistik“ ordnet ihre Azure-Umgebung:<ul><li><b>Physisch</b>: Region West Europe mit 3 Availability Zones, Paarregion North Europe für Disaster Recovery.</li>
    <li><b>Logisch</b>: Management Group „Murtal“ → Subscriptions „Prod“ und „Dev“ → Resource Groups „rg-tracking-prod“, „rg-tracking-dev“ → Ressourcen (VMs, SQL, Storage).</li>
    <li>Die Policy „nur EU-Regionen“ hängt an der Management Group, Kosten werden pro Subscription getrennt, Rechte vergibt man auf Resource-Group-Ebene.</li></ul>
    Physische und logische Hierarchie sind unabhängig: Eine Resource Group in West Europe darf Ressourcen in North Europe enthalten.`)],
  "itx-2": [EX("VM-Kosten: Compute läuft, Disk zahlt immer", `Eine Test-VM (D4s, 4 vCPU, 16 GB) kostet angenommen 0,20 € pro Stunde Compute, dazu eine Premium-SSD für 20 € pro Monat.<ol>
    <li>Rund um die Uhr: 0,20 € · 730 h = 146 € + 20 € Disk = <b>166 € pro Monat</b></li><li>Nur Mo–Fr 8–18 Uhr (Auto-Shutdown): 0,20 € · 10 h · 22 Tage = 44 € + 20 € = <b>64 €</b></li>
    <li>Gestoppt und <b>deallokiert</b> fällt kein Compute mehr an, die Disk wird weiter verrechnet. Nur im Betriebssystem heruntergefahren (nicht deallokiert) läuft Compute weiter.</li></ol>
    Wichtig: Auf der temporären Disk (Windows D:, Linux /dev/sdb) nie Daten ablegen, sie gehen bei Wartung oder Neuzuordnung verloren.`)],
  "itx-3": [{ t: "calc", id: "itinf-blob" }, EX("10 TB Überwachungsvideos: welche Ebene?", `Eine Tiefgarage speichert 10 TB Videos, gelesen wird im Monat etwa 1 % (bei einem Vorfall). Mit den Beispielpreisen aus dem Rechner:<ul>
    <li><b>Hot</b>: 10.240 GB · 0,018 € = <b>184 €</b></li><li><b>Cool</b>: 10.240 · 0,01 + 102 GB · 0,01 = <b>103 €</b></li><li><b>Archive</b>: 10.240 · 0,002 + 102 GB · 0,022 = <b>23 €</b></li></ul>
    Archive ist am günstigsten, aber offline: Wenn die Polizei ein Video sofort braucht, dauert die Rehydrierung Stunden. Praxislösung: <b>Lifecycle-Regel</b> „nach 30 Tagen Cool, nach 180 Tagen Archive“, so ist Aktuelles schnell verfügbar und Altes billig.`),
    CK("Welche Redundanzoption überlebt den Ausfall eines ganzen Rechenzentrums, hält die Daten aber in einer Region?", ["LRS", "ZRS", "GRS", "RA-GRS"], 1, "ZRS speichert drei Kopien über drei Availability Zones derselben Region. GRS repliziert zusätzlich in die Paarregion.")],
  "itx-4": [{ t: "calc", id: "itinf-vnet" }, EX("Adressplan für ein Hub-and-Spoke-Netz", `<ul><li><b>Hub-VNet</b> 10.0.0.0/22: GatewaySubnet 10.0.0.0/27 (27 nutzbar), AzureFirewallSubnet 10.0.0.64/26, Management 10.0.1.0/24</li>
    <li><b>Spoke Web</b> 10.1.0.0/16: Frontend 10.1.1.0/24 (251 nutzbar), Backend 10.1.2.0/24</li><li><b>Spoke Daten</b> 10.2.0.0/16</li></ul>
    Die Adressräume überlappen nicht, deshalb ist Peering möglich. Spoke Web und Spoke Daten sind jeweils mit dem Hub gepeert, aber <b>nicht miteinander</b>: Peering ist nicht transitiv, der Verkehr läuft über die Firewall im Hub (mit UDR). Mit Gateway Transit nutzen beide Spokes das VPN-Gateway des Hubs.`),
    CK("Wie viele Adressen sind in einem Azure-Subnetz /28 nutzbar?", ["14", "16", "11", "13"], 2, "2⁴ = 16 Adressen, Azure reserviert 5 → 11 nutzbar.")],
  "itx-5": [EX("Welche Route gewinnt?", `Routentabelle am Subnetz „Frontend“:<table class='dt'><tr><th>Präfix</th><th>Next Hop</th><th>Quelle</th></tr><tr><td>0.0.0.0/0</td><td>Virtual appliance 10.0.0.68 (Firewall)</td><td>UDR</td></tr>
    <tr><td>10.2.0.0/16</td><td>Virtual network peering</td><td>System</td></tr><tr><td>10.2.5.0/24</td><td>Virtual appliance 10.0.0.68</td><td>UDR</td></tr></table>
    <ul><li>Ziel <b>10.2.5.20</b>: passt zu /16 und /24 → längstes Präfix gewinnt → über die <b>Firewall</b>.</li><li>Ziel <b>10.2.9.7</b>: nur /16 passt → direkt über das <b>Peering</b>.</li>
    <li>Ziel <b>142.250.1.1</b>: nur 0.0.0.0/0 → über die Firewall ins Internet (die Systemroute 0.0.0.0/0 → Internet wird von der UDR mit gleichem Präfix überschrieben).</li></ul>`)],
  "itx-6": [PR("Idempotenz in der Praxis: dasselbe Bicep-File dreimal", `<pre><code>resource sa 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'stmurtallogs01'
  location: 'westeurope'
  sku: { name: 'Standard_ZRS' }
  kind: 'StorageV2'
}</code></pre><ol><li>Erster Lauf: Das Konto existiert nicht und wird angelegt.</li><li>Zweiter Lauf: Ist-Zustand = Soll-Zustand, es passiert nichts.</li>
    <li>Jemand ändert im Portal auf LRS. Dritter Lauf: Das Deployment stellt wieder ZRS her.</li></ol>
    Das ist <b>deklarativ</b> (beschrieben wird das Ziel, nicht die Schritte) und <b>idempotent</b>. Ein imperatives Skript mit „create“ würde beim zweiten Lauf mit „existiert bereits“ abbrechen.`)]
});

/* ======================= FRAGEN (Mehrfachauswahl wie im Quick-Test) ======================= */
const hsh = s => { let x = 0; for (const ch of s) x = (x * 31 + ch.charCodeAt(0)) >>> 0; return x; };
const M = window.ITINF_M || ((id, topic, q, opts, why) => { const ix = opts.map((_, i) => i); let r = hsh(id); for (let i = ix.length - 1; i > 0; i--) { r = (r * 1103515245 + 12345) >>> 0; const j = (r >>> 16) % (i + 1); [ix[i], ix[j]] = [ix[j], ix[i]]; }
  const o = ix.map(i => opts[i]); return { id, topic, multi: true, q, opts: o.map(x => x[0]), a: o.reduce((m, x, i) => x[1] ? m | (1 << i) : m, 0), notes: o.map(x => x[2] || ""), why }; });
let qn = 0; const Q = (topic, q, opts, why) => M("px-itinf-" + (++qn), topic, q, opts, why);
const T = true, N = false;
const questions = [
/* itg-def */
Q("itg-def", "Welche Aussagen zur Definition von Cloud Computing sind richtig?", [["Computing-Dienste werden über das Internet bereitgestellt.", T], ["Typische Dienstkategorien sind Compute, Networking, Storage und Analytics.", T], ["Cloud bedeutet zwingend, dass keinerlei eigene Hardware mehr existiert.", N, "Hybride Szenarien sind üblich."], ["Versprochen werden schnellere Innovation, flexible Ressourcen und Economies of Scale.", T], ["Die formale Definition liefert NIST SP 800-145.", T]], "NIST: 5 Merkmale, 3 Service-Modelle, 4 Deployment-Modelle."),
Q("itg-def", "Was übersah Gottlieb Daimler laut Folie bei seiner Marktprognose?", [["Dass Kosten und Komplexität drastisch sinken würden.", T], ["Dass später keine Chauffeure mehr nötig sein würden.", T], ["Dass Autos nie mehr als eine Million Stück erreichen.", N, "Das war seine Prognose, sie war falsch."], ["Dass Pferde billiger werden.", N], ["Dass die neue Technik am Alten gemessen und unterschätzt wird.", T]], "Analog zur Cloud: Man beschreibt sie über das, was fehlt."),
Q("itg-def", "Welche Beispiele beschreiben Cloud-Nutzung im Sinne der Definition?", [["Ein Startup betreibt seine App auf Azure App Service.", T], ["Eine Firma speichert Backups in Azure Blob Storage.", T], ["Ein USB-Stick mit Fotos in der Schublade.", N], ["Ein Team nutzt Microsoft 365 im Browser.", T], ["Ein Server im eigenen Keller ohne Netzzugang.", N]], "Entscheidend: Dienst wird über das Internet vom Anbieter bezogen."),
Q("itg-def", "Welche Aussagen zur Frage „Ist die Cloud billiger?“ entsprechen der Vorlesung?", [["Die Antwort lautet „Jein“.", T], ["Sie ist immer billiger, weil keine Hardware gekauft wird.", N], ["Es hängt vom Lastverlauf des konkreten Anwendungsfalls ab.", T], ["Schneller, flexibler und einfacher ist sie in der Regel schon.", T], ["Statische Workloads profitieren am meisten.", N, "Sie profitieren am wenigsten (p/a ≈ 1)."]], "Die Begründung liefert die p/a-Regel."),
/* itg-nist */
Q("itg-nist", "Eine interne IT stellt VMs nur per Ticket nach drei Tagen bereit und verrechnet pauschal. Welche NIST-Merkmale fehlen?", [["On-demand self-service", T], ["Rapid elasticity", T], ["Measured service", T], ["Broad network access", N, "Die VMs sind übers Netz erreichbar."], ["Resource pooling", N, "Die VMs teilen sich einen Cluster."]], "Drei fehlende Merkmale: Virtualisierung, aber keine Cloud."),
Q("itg-nist", "Welche Aussagen zu Resource pooling sind richtig?", [["Mehrere Kunden teilen sich physische Ressourcen (Multi-Tenant).", T], ["Der genaue Standort ist dem Kunden meist unbekannt.", T], ["Der Kunde kann den Ort grob bestimmen, z. B. Land oder Region.", T], ["Jeder Kunde bekommt immer eigene physische Server.", N], ["Pooling ist die Grundlage für Skaleneffekte.", T]], "Pooling glättet auch die Lastschwankungen vieler Kunden."),
Q("itg-nist", "Welche Begriffe gehören NICHT zu den 5 NIST-Merkmalen?", [["Pay-as-you-go", T, "Folgt aus Measured service."], ["Measured service", N], ["Internet", T, "Korrekt heißt es Broad network access."], ["Rapid elasticity", N], ["Multi-Cloud", T]], "Typische Falle im Quick-Test."),
Q("itg-nist", "Ein Webshop startet am Black Friday automatisch 40 statt 4 Instanzen und fährt danach wieder herunter. Welche Merkmale zeigen sich?", [["Rapid elasticity", T], ["Measured service, weil nach Nutzung abgerechnet wird", T], ["On-demand self-service, weil kein Mensch beim Anbieter eingreift", T], ["Community Cloud", N, "Das ist ein Deployment-Modell."], ["Broad network access, weil Kunden mit beliebigen Geräten zugreifen", T]], "Mehrere Merkmale wirken zusammen."),
/* itg-deploy */
Q("itg-deploy", "Welche Aussagen zu den Deployment-Modellen sind richtig?", [["Eine Private Cloud kann auch bei einem Dienstleister off-premises stehen.", T], ["Eine Community Cloud dient mehreren Organisationen mit gemeinsamen Anliegen.", T], ["Multi-Cloud ist eines der vier NIST-Modelle.", N, "Multi-Cloud ist nicht Teil von NIST 800-145."], ["Eine Hybrid Cloud verbindet zwei oder mehr eigenständige Clouds.", T], ["Public Cloud erfordert hohe Vorabinvestitionen.", N]], "NIST: Public, Private, Community, Hybrid."),
Q("itg-deploy", "Ein Spital hält Patientendaten im eigenen RZ und betreibt die Terminbuchung in Azure, beides verbunden. Welche Aussagen passen?", [["Das ist eine Hybrid Cloud.", T], ["Ein typischer Grund ist Compliance.", T], ["Das ist automatisch eine Multi-Cloud.", N, "Multi-Cloud = zwei Public Clouds."], ["Die Terminbuchung profitiert von Elastizität.", T], ["Das lokale RZ muss weiterhin selbst betrieben werden.", T]], ""),
Q("itg-deploy", "Welche Herausforderungen bringt Multi-Cloud?", [["Unterschiedliche APIs und Werkzeuge je Anbieter", T], ["Skills für mehrere Plattformen", T], ["Egress-Kosten beim Datentransfer zwischen Clouds", T], ["Schwierigere Governance und Security", T], ["Garantiert niedrigere Kosten", N]], "Motive sind u. a. Vermeidung von Lock-in und Best-of-Breed."),
Q("itg-deploy", "Welche Aussagen zur Public Cloud stimmen laut Folie?", [["Keine Investitionen (CapEx) zum Hochskalieren", T], ["Anwendungen sind schnell bereit- und abbaubar", T], ["Bezahlt wird nur, was genutzt wird", T], ["Die Organisation verantwortet Hardware-Wartung", N, "Das gilt für die Private Cloud."], ["Volle Kontrolle über die physische Hardware", N]], ""),
/* itg-virt */
Q("itg-virt", "10 Server laufen mit je 12 % CPU-Auslastung. Welche Aussagen treffen zu?", [["Genutzt werden insgesamt etwa 1,2 Server-Kapazitäten.", T], ["Bei 60 % Zielauslastung reichen rechnerisch 2 Virtualisierungshosts plus Reserve.", T], ["Virtualisierung verschlechtert die Auslastung.", N], ["Jede VM bringt ein eigenes Betriebssystem mit.", T], ["Container brauchen je Anwendung ein eigenes Kernel-Image.", N, "Container teilen sich das Betriebssystem des Hosts."]], "1,2 / 0,6 = 2."),
Q("itg-virt", "Welche Aussagen zu Containern sind richtig?", [["Sie enthalten App und Abhängigkeiten.", T], ["Sie teilen sich das Betriebssystem über eine Container-Runtime.", T], ["Sie starten typischerweise schneller als VMs.", T], ["Sie sind der de-facto-Standard für den Betrieb von Anwendungen.", T], ["Sie ersetzen Bare Metal vollständig, weil sie keine Hardware brauchen.", N]], "Darunter liegt immer Hardware."),
Q("itg-virt", "Was ist ein Hypervisor?", [["Software, die einen physischen Server in mehrere VMs aufteilt", T], ["Ein Container-Orchestrator", N], ["Die Grundlage von Golden Images und VM-Verschiebung", T, "Er ermöglicht sie."], ["Ein Betriebssystem für Smartphones", N], ["Eine Voraussetzung für IaaS-Angebote wie Azure VMs", T]], ""),
Q("itg-virt", "Welche Aussagen zum dedizierten Server stimmen?", [["Eine Anwendung pro physischem Server", T], ["Gekauft wird für die Spitzenlast", T], ["Läuft auch nachts im Leerlauf und verbraucht Strom", T], ["Ermöglicht die höchste Ressourcendichte", N], ["Bare Metal bleibt das physische Fundament jeder Cloud", T]], ""),
/* itg-faas */
Q("itg-faas", "3 Mio. Ausführungen à 300 ms mit 512 MB im Consumption Plan. Welche Aussagen stimmen (Preise laut Liste)?", [["Es fallen 450.000 GB-s an.", T], ["Nach dem Freikontingent bleiben 50.000 GB-s zu bezahlen.", T], ["2 Mio. Ausführungen sind kostenpflichtig.", T], ["Die Gesamtkosten liegen bei rund 1,20 $.", T], ["Es fallen auch Kosten an, wenn nachts keine Ausführung läuft.", N, "Scale to Zero."]], "0,80 $ Rechenzeit + 0,40 $ Ausführungen."),
Q("itg-faas", "Welche Trade-offs von Serverless nennt die Vorlesung?", [["Cold Starts", T], ["Ausführungszeitlimits", T], ["Starke Plattformbindung (Lock-in)", T], ["Schwierigeres Debugging und Testen", T], ["Keine automatische Skalierung", N]], "Darum ergänzen Functions meist einen Kern in Containern oder PaaS."),
Q("itg-faas", "Welche Trigger starten eine Azure Function?", [["HTTP-Request", T], ["Neuer Blob im Storage", T], ["Timer (z. B. täglich 02:00)", T], ["Nachricht in einer Queue", T], ["Ausschließlich manueller Start im Portal", N]], "Event-driven."),
Q("itg-faas", "Wann ist eine dauerhaft laufende VM eher günstiger als Serverless?", [["Bei gleichmäßig hoher Last rund um die Uhr", T], ["Bei sehr vielen, langen und speicherintensiven Ausführungen", T], ["Bei seltenen, unregelmäßigen Ereignissen", N], ["Wenn nachts nichts passiert", N], ["Wenn die Last vorhersehbar und statisch ist", T]], "Serverless spielt seine Stärke bei unregelmäßiger Last aus."),
/* itg-svc */
Q("itg-svc", "Welche Zuordnungen von Diensten zu Service-Modellen sind richtig?", [["Azure Virtual Machines → IaaS", T], ["Azure App Service → PaaS", T], ["Microsoft 365 → SaaS", T], ["Azure SQL Database → IaaS", N, "PaaS."], ["Salesforce → SaaS", T]], ""),
Q("itg-svc", "Ein Shop läuft auf einer gemieteten Linux-VM. Was muss der Kunde selbst erledigen?", [["Betriebssystem patchen", T], ["Webserver und Runtime installieren", T], ["Die physischen Server tauschen", N], ["Den Shop-Code betreiben", T], ["Kundendaten schützen", T]], "IaaS: ab Betriebssystem aufwärts beim Kunden."),
Q("itg-svc", "Welche Aussagen zu PaaS stimmen?", [["Der Anbieter verwaltet VMs und Betriebssystem.", T], ["Zielgruppe sind vor allem Developer.", T], ["Der Kunde deployt seine Anwendung.", T], ["Der Kunde patcht das Betriebssystem.", N], ["Daten und Zugriff bleiben Kundensache.", T]], ""),
Q("itg-svc", "Welche Aussagen zu den Service-Schichten sind richtig?", [["Jede Schicht abstrahiert die darunterliegende.", T], ["SaaS richtet sich an Endnutzer.", T], ["IaaS ist dem eigenen Server am ähnlichsten.", T], ["Bei SaaS verwaltet der Kunde die Runtime.", N], ["Je höher die Schicht, desto weniger Kontrolle hat der Kunde.", T]], ""),
/* itg-shared */
Q("itg-shared", "Ein öffentlich lesbarer Storage-Container führt zu einem Datenleck. Welche Aussagen stimmen?", [["Die Verantwortung liegt beim Kunden.", T], ["Fehlkonfiguration ist die häufigste Ursache solcher Vorfälle.", T], ["Microsoft haftet, weil es in Azure passiert ist.", N], ["Azure Policy kann öffentlichen Zugriff verbieten.", T], ["Physische Sicherheit des RZ ist hier nicht das Problem.", T]], "Sicherheit IN der Cloud ist Kundensache."),
Q("itg-shared", "Was bleibt in JEDEM Service-Modell beim Kunden?", [["Informationen und Daten", T], ["Geräte (PCs, Handys)", T], ["Konten und Identitäten", T], ["Physisches Rechenzentrum", N], ["Physische Hosts", N]], ""),
Q("itg-shared", "Welche Aufgaben übernimmt der Anbieter ab IaaS?", [["Rechenzentrum", T], ["Physisches Netzwerk", T], ["Physische Hosts", T], ["Betriebssystem der Kunden-VM", N, "Erst ab PaaS."], ["Zugriffsrechte auf Kundendaten", N]], ""),
Q("itg-shared", "Was gilt bei PaaS laut Modell?", [["Betriebssystem übernimmt der Anbieter.", T], ["Netzwerkkontrollen sind geteilt.", T], ["Anwendungen sind geteilt.", T], ["Identitäts- und Verzeichnisinfrastruktur sind geteilt.", T], ["Daten sind geteilt.", N, "Immer Kunde."]], ""),
/* itg-sla */
Q("itg-sla", "App Service 99,95 %, SQL Database 99,99 %, Storage 99,9 % werden seriell benötigt. Welche Aussagen stimmen?", [["Die Kette erreicht etwa 99,84 %.", T], ["Das sind rund 14 Stunden Ausfall pro Jahr.", T], ["Die Kette ist besser als der schwächste Dienst.", N], ["Pro Monat sind es etwa 1,2 Stunden.", T], ["Eine zweite Region mit derselben Kette hebt die Verfügbarkeit auf über 99,999 %.", T, "1 − 0,0016² ≈ 99,9997 %."]], ""),
Q("itg-sla", "Welche Aussagen zur Ausfallzeit stimmen?", [["99,9 % ≈ 8,76 h pro Jahr", T], ["99,99 % ≈ 52,6 min pro Jahr", T], ["99,95 % ≈ 4,38 h pro Jahr", T], ["99 % ≈ 3,65 Tage pro Jahr", T], ["99,999 % ≈ 52,6 s pro Jahr", N, "≈ 5,26 min."]], "(1 − A) · 8.760 h."),
Q("itg-sla", "Welche Aussagen zur Skalierung stimmen?", [["Scale up = mehr CPU/RAM für eine VM", T], ["Scale out = mehr Instanzen", T], ["Elastizität heißt auch wieder schrumpfen", T], ["Vertikale Skalierung erhöht automatisch die Verfügbarkeit", N], ["Horizontale Skalierung braucht meist einen Load Balancer", T]], ""),
Q("itg-sla", "Wann gilt die Parallelformel 1 − (1 − A)ⁿ?", [["Wenn die Ausfälle unabhängig sind", T], ["Wenn eine Instanz für den Betrieb reicht", T], ["Auch für zwei VMs im selben Rack ohne Einschränkung", N, "Gemeinsame Ausfallursachen."], ["Für Instanzen in getrennten Zonen oder Regionen näherungsweise", T], ["Wenn alle Dienste gleichzeitig nötig sind", N, "Das ist seriell."]], ""),
/* itg-scale */
Q("itg-scale", "Welche vier Skaleneffekte nennt die Folie?", [["Buying power", T], ["Infrastructure labor costs", T], ["Security & reliability", T], ["Cost of power", T], ["Marketing-Budget", N]], ""),
Q("itg-scale", "40 Server à 400 W, Serverraum PUE 2,0 vs. Hyperscaler PUE 1,1. Welche Aussagen stimmen?", [["IT-Energie ≈ 140.160 kWh pro Jahr", T], ["Serverraum ≈ 280.320 kWh gesamt", T], ["Hyperscaler ≈ 154.176 kWh gesamt", T], ["Die PUE beeinflusst nur die IT-Energie", N], ["Der Hyperscaler kauft Strom zudem meist billiger ein", T]], "140.160 · 2,0 bzw. · 1,1."),
Q("itg-scale", "Warum ist die Cloud keine Rückkehr zur Mainframe-Ära?", [["Sie übertrifft die Skaleneffekte des Mainframes.", T], ["Sie bietet Modularität und Agilität wie Client/Server und mehr.", T], ["Der Trade-off zwischen Effizienz und Flexibilität entfällt.", T], ["Sie ist ein einziger zentraler Großrechner.", N], ["Wegbereiter war die Virtualisierung.", T]], "Review-Frage 6."),
Q("itg-scale", "Welche Aussagen zu Buying power stimmen?", [["Bis zu 30 % Rabatt beim Hardwarekauf", T], ["Ermöglicht durch Standardisierung (Homogenität)", T], ["Gilt für kleine Käufer genauso", N], ["Ein Grund für niedrigere Preise pro Einheit", T], ["Betrifft nur Software-Lizenzen", N]], ""),
/* itg-workload */
Q("itg-workload", "Last 200 Req/s morgens, 2.000 Req/s abends, 250 Req/s pro Instanz. Welche Aussagen stimmen?", [["Fest für die Spitze braucht man 8 Instanzen.", T], ["Das Lastmuster ist periodisch (Time-of-day).", T], ["Autoscaling spart Instanz-Stunden.", T], ["Bei statischer Last würde Autoscaling ebenso viel sparen.", N], ["Eine Mindestanzahl Instanzen bleibt für die Verfügbarkeit sinnvoll.", T]], ""),
Q("itg-workload", "Welche Workload-Kategorien nach Fehling et al. gibt es?", [["Static", T], ["Continuously changing", T], ["Periodic", T], ["Unpredictable", T], ["Random-access", N]], ""),
Q("itg-workload", "Welche Aussagen zum Sizing-Problem stimmen?", [["Überkapazität wird bezahlt, aber nicht genutzt.", T], ["Unterkapazität kostet Kunden.", T], ["On-premises plant man für die Spitze.", T], ["Die Cloud kann der Lastkurve genauer folgen.", T], ["Bei Unpredictable Workloads ist on-premises am günstigsten.", N]], ""),
Q("itg-workload", "Welche Beispiele passen zu welchem Lastmuster?", [["Weihnachtsgeschäft im Handel → Industry-specific", T], ["Streaming am Abend → Time-of-day", T], ["Startup nach Blog-Erwähnung → Uncertain growth", T], ["Suche braucht viel CPU, Mail viel Storage → Multi-resource", T], ["Mailabruf zu zufälligen Zeiten → Industry-specific", N, "Randomness."]], ""),
/* itg-pa */
Q("itg-pa", "Peak 10, Durchschnitt 2 Server, in-house 0,15 €/h. Welche Aussagen stimmen?", [["p/a = 5", T], ["In-house kostet pro Monat ca. 1.095 €.", T], ["Eine Cloud zu 0,45 €/h kostet ca. 657 € pro Monat.", T], ["Ab einem Cloud-Preis über 0,75 €/h gewinnt in-house.", T], ["Die Cloud muss pro Stunde billiger als 0,15 € sein.", N]], "c* = d · p / a."),
Q("itg-pa", "Welche Aussagen zur p/a-Regel sind richtig?", [["Cloud lohnt sich, solange c/d < p/a.", T], ["Bei p/a = 1 muss die Cloud pro Einheit billiger sein.", T], ["Je größer die Lastschwankung, desto teurer darf die Cloud sein.", T], ["Die Regel berücksichtigt Egress-Kosten.", N], ["Sie stammt von J. Weinman.", T]], ""),
Q("itg-pa", "Wohnmobil: 32 €/Tag Eigenkosten, 25 Nutzungstage im Jahr. Welche Aussagen stimmen?", [["p/a ≈ 14,6", T], ["Eine Tagesmiete bis etwa 467 € wäre noch günstiger als Kaufen.", T], ["Bei 155 €/Tag kosten 25 Tage 3.875 €.", T], ["Kaufen ist hier günstiger.", N], ["Der Vermieter braucht rund 75 Miettage zur Kostendeckung.", T]], ""),
Q("itg-pa", "Pizza-Workloads: Um welchen Faktor darf der Pizzadienst teurer sein?", [["Static ≈ 1,4×", T], ["Continuously changing ≈ 3×", T], ["Periodic ≈ 7×", T], ["Unpredictable ≈ 17×", T], ["Static ≈ 17×", N]], ""),
/* itg-cost */
Q("itg-cost", "60.000 € Hardware, 800 €/Monat laufend vs. 2.600 €/Monat Pay-as-you-go. Welche Aussagen stimmen?", [["On-prem wird nach ca. 33 Monaten günstiger als PAYG.", T], ["Nach 36 Monaten kostet on-prem 88.800 €.", T], ["PAYG kostet nach 36 Monaten 93.600 €.", T], ["Mit 40 % Reservierungsrabatt kostet die Cloud nach 36 Monaten 56.160 €.", T], ["CapEx wird sofort als Aufwand verbucht.", N, "Abschreibung über die Nutzungsdauer."]], "60.000 / (2.600 − 800) ≈ 33."),
Q("itg-cost", "Welche Preismodelle passen zu welchem Workload?", [["Statische Grundlast → Reserved Instances / Savings Plan", T], ["Unterbrechbare Batch-Jobs → Spot VMs", T], ["Unvorhersehbare Spitzen → Pay-as-you-go / Serverless", T], ["Vorhandene SQL-Server-Lizenzen → Azure Hybrid Benefit", T], ["Kritische Datenbank → Spot VMs", N, "Spot kann jederzeit verdrängt werden."]], ""),
Q("itg-cost", "Welche typischen Kostenfallen nennt die Vorlesung?", [["Vergessene Ressourcen wie idle VMs", T], ["Nicht angehängte Disks", T], ["Überdimensionierte VMs", T], ["Egress-Gebühren", T], ["Ingress-Gebühren als größter Posten", N, "Ingress ist meist kostenlos."]], "Gegenmittel: FinOps mit Budgets, Tags, Alerts, Right-Sizing."),
Q("itg-cost", "Welche Aussagen zu OpEx sind richtig?", [["Aufwand der laufenden Periode", T], ["Kein vorab gebundenes Kapital", T], ["Kosten folgen der Nutzung", T], ["Kann unerwartet steigen", T], ["Wird über 3–5 Jahre abgeschrieben", N]], ""),
/* itg-dist */
Q("itg-dist", "Welche gehören zu den 5 Geboten der Cloud?", [["Everything fails all the time", T], ["Fokus auf MTTR statt MTTF", T], ["Scale out, not up", T], ["Treat resources as cattle, not pets", T], ["Never use more than one region", N]], "Fünftes Gebot: die Fallacies of Distributed Computing respektieren."),
Q("itg-dist", "Welche Annahmen zählen zu den 8 Fallacies of Distributed Computing?", [["The network is reliable", T], ["Latency is zero", T], ["Bandwidth is infinite", T], ["Transport cost is zero", T], ["The database is always consistent", N]], ""),
Q("itg-dist", "Eine VM fällt aus, nach 2 Minuten läuft eine neue aus dem Image. Welche Prinzipien zeigen sich?", [["MTTR statt MTTF", T], ["Cattle, not pets", T], ["Everything fails all the time", T], ["Scale up", N], ["Die alte VM wird aufwendig repariert", N]], ""),
Q("itg-dist", "Welche Phasen hat der Gartner Hype Cycle?", [["Innovation Trigger", T], ["Peak of Inflated Expectations", T], ["Trough of Disillusionment", T], ["Plateau of Productivity", T], ["Valley of Revenue", N]], "Dazwischen: Slope of Enlightenment."),
/* itg-reg */
Q("itg-reg", "Welche Risiken der Cloud nennt die Vorlesung?", [["Vendor Lock-in", T], ["Abhängigkeit und großflächige Ausfälle", T], ["Netzwerkabhängigkeit", T], ["Fehlkonfiguration als häufigste Security-Ursache", T], ["Cloud-Dienste können nie ausfallen", N]], ""),
Q("itg-reg", "Welche Aussagen zu Egress und Lock-in stimmen?", [["Egress = Datenverkehr aus der Cloud hinaus", T], ["Egress-Kosten verstärken Data Gravity", T], ["Proprietäre PaaS- und Serverless-Dienste erschweren den Wechsel", T], ["Der EU Data Act verpflichtet Anbieter, Wechselgebühren bis 2027 abzuschaffen", T], ["Ingress ist meist teurer als Egress", N]], ""),
Q("itg-reg", "Was gehört zu einer guten Exit-Strategie?", [["Daten in offenen Formaten halten", T], ["Abhängigkeit von proprietären Diensten bewusst entscheiden", T], ["Exit-Kosten schon bei der Planung schätzen", T], ["Erst beim Wechsel darüber nachdenken", N], ["Automatisierung mit portablen Werkzeugen (z. B. Container)", T]], ""),
Q("itg-reg", "Was können Cloud-Kunden selbst für Nachhaltigkeit tun?", [["Right-Sizing", T], ["Ressourcen automatisch abschalten", T], ["CO₂-arme Regionen wählen", T], ["Emissionen messen", T], ["Nichts, das liegt allein beim Anbieter", N]], ""),
/* itg-azure */
Q("itg-azure", "Welche Komponenten braucht eine einfache VM-basierte Web-App in Azure typischerweise?", [["Resource Group", T], ["Virtual Network mit Subnetz", T], ["Network Security Group", T], ["Public IP", T], ["Eine Management Group pro VM", N]], ""),
Q("itg-azure", "Was passiert, wenn man nach der Laborübung die Resource Group löscht?", [["Alle Ressourcen darin werden gelöscht.", T], ["Es entstehen für diese Ressourcen keine weiteren Kosten.", T], ["Die Subscription wird gelöscht.", N], ["Andere Resource Groups bleiben unberührt.", T], ["Die Ressourcen werden in den Papierkorb der VM verschoben.", N]], ""),
Q("itg-azure", "Welche Aussagen zu einer NSG sind richtig?", [["Sie filtert Verkehr mit Regeln nach Quelle, Ziel, Port und Protokoll.", T], ["Sie kann einem Subnetz oder einer Netzwerkkarte zugeordnet werden.", T], ["Sie verschlüsselt den Verkehr.", N], ["Regeln haben Prioritäten.", T], ["Eine Regel „SSH nur von der FH-IP“ ist sinnvoll.", T]], ""),
Q("itg-azure", "Welche Ressourcen nennt die Syllabus-Ergänzung als primäre Lernquellen?", [["Microsoft-Dokumentation", T], ["Microsoft Learn", T], ["Lernpfad AZ-900", T], ["Lernpfad AZ-104", T], ["Ausschließlich das Skriptum der Lehrenden", N]], ""),
/* itg-azid */
Q("itg-azid", "Welche Aussagen zu RBAC und Policy stimmen?", [["RBAC regelt, wer handeln darf.", T], ["Policy regelt, welcher Zustand erlaubt ist.", T], ["Eine Rollenzuweisung besteht aus Prinzipal, Rollendefinition und Scope.", T], ["Policy vergibt Benutzerrechte.", N], ["Berechtigungen werden an untergeordnete Scopes vererbt.", T]], ""),
Q("itg-azid", "Was gehört in Azure Key Vault?", [["Secrets wie Connection Strings", T], ["Schlüssel für Verschlüsselung und Signatur", T], ["Zertifikate", T], ["VM-Images", N], ["Passwörter im Klartext im App-Code", N]], ""),
Q("itg-azid", "Welche Signale kann Conditional Access auswerten?", [["Benutzer bzw. Gruppe", T], ["Gerät", T], ["Standort", T], ["Anmelderisiko", T], ["Lieblingsfarbe", N]], "Reaktion z. B. MFA verlangen oder blockieren."),
Q("itg-azid", "Welche Kombinationen sind echte MFA?", [["Passwort + Code aus Authenticator-App", T], ["Smartcard + PIN", T], ["Passwort + Sicherheitsfrage", N, "Zweimal Wissen."], ["FIDO2-Key + Fingerabdruck", T], ["Zwei Passwörter", N]], ""),
/* itv-region */
Q("itv-region", "Welche Aussagen zu Region Pairs stimmen?", [["Mindestens 300 Meilen Abstand", T], ["Updates werden nacheinander eingespielt", T], ["Bei großflächigem Ausfall wird eine Region priorisiert wiederhergestellt", T], ["Daten bleiben in der Geography (Ausnahme Brazil South)", T], ["Beide Regionen liegen im selben Gebäude", N]], ""),
Q("itv-region", "Wonach wählt man eine Region?", [["Nähe zu den Kunden (Latenz)", T], ["Compliance und Data Residency", T], ["Verfügbarkeit des benötigten Dienstes", T], ["Preis je Region", T], ["Alphabetische Reihenfolge", N]], ""),
Q("itv-region", "Welche Aussagen zu speziellen Regionen stimmen?", [["US-Gov-Regionen sind isoliert und werden von überprüftem US-Personal betrieben.", T], ["China-Regionen betreibt der Partner 21Vianet.", T], ["China-Regionen betreibt Microsoft direkt.", N], ["Spezialregionen haben zusätzliche Zertifizierungen.", T], ["Jeder Kunde kann US DoD Central frei nutzen.", N]], ""),
Q("itv-region", "Was gilt für eine Geography?", [["Sie umfasst typischerweise mindestens zwei Regionen.", T], ["Sie dient Data Residency und Compliance.", T], ["Beispiele: Americas, Europe, Asia Pacific, Middle East and Africa", T], ["Sie ist dasselbe wie eine Availability Zone.", N], ["Sie ist kleiner als ein Rechenzentrum.", N]], ""),
/* itv-az */
Q("itv-az", "Welche Aussagen zu den VM-SLAs laut Folie stimmen?", [["Einzelne VM mit Premium SSD: 99,9 %", T], ["Availability Set: 99,95 %", T], ["VMs über Availability Zones: 99,99 %", T], ["99,99 % entsprechen rund 52,6 min Ausfall pro Jahr", T], ["Availability Sets schützen vor dem Ausfall einer ganzen Region", N]], ""),
Q("itv-az", "Welche Aussagen zu Availability Zones stimmen?", [["Physisch getrennte Rechenzentren innerhalb einer Region", T], ["Eigene Stromversorgung, Kühlung und Netzwerk", T], ["Verbunden mit unter 2 ms Round-Trip", T], ["Jede Region hat Zonen", N], ["Mindestens drei Zonen pro zonenfähiger Region", T]], ""),
Q("itv-az", "Zonal vs. zonenredundant: Was ist richtig?", [["Eine zonale VM ist an eine Zone gebunden.", T], ["Bei zonalen Diensten kümmert sich der Kunde um Replikation und Failover.", T], ["Zonenredundante Dienste verteilt Azure automatisch über Zonen.", T], ["Eine Public IP kann zonenredundant sein.", T], ["Zonal heißt automatisch über alle Zonen gespiegelt.", N]], ""),
Q("itv-az", "Eine Web-App läuft auf 2 VMs in 2 Zonen (je 99,9 % unabhängig gerechnet). Welche Aussagen stimmen?", [["Parallel: 1 − 0,001² = 99,9999 %", T], ["Das vertraglich zugesicherte SLA laut Folie beträgt 99,99 %.", T], ["Gegen einen Regionsausfall hilft das nicht.", T], ["Die Verfügbarkeit sinkt durch die zweite VM.", N], ["Für Disaster Recovery nutzt man zusätzlich Region Pairs.", T]], "Rechnerische und vertragliche Werte unterscheiden sich."),
/* itv-green */
Q("itv-green", "Ein RZ braucht 12 GWh gesamt, davon 8 GWh für IT. Welche Aussagen stimmen?", [["PUE = 1,5", T], ["Overhead = 4 GWh", T], ["Ideal wäre PUE 1,0", T], ["Hyperscaler erreichen etwa 1,1", T], ["PUE = IT-Energie / Gesamtenergie", N, "Umgekehrt."]], ""),
Q("itv-green", "Folienbeispiel 90.000 Server à 500 W. Welche Aussagen stimmen?", [["IT-Energie ≈ 394,2 GWh pro Jahr", T], ["Mit PUE 1,5 ≈ 591,3 GWh", T], ["Das ist mehr als der Haushaltsstrom einer Stadt mit 300.000 Einwohnern (≈ 525 GWh)", T], ["Mit PUE 1,1 sinkt der Verbrauch auf rund 433,6 GWh", T], ["Die PUE ändert die IT-Energie", N]], ""),
Q("itv-green", "Welche Aussagen zu den Klimabegriffen stimmen?", [["Carbon neutral: Emissionen kompensieren, auch durch Vermeidung", T], ["Net Zero: so viel entfernen wie ausstoßen", T], ["Carbon negative: mehr entfernen als ausstoßen", T], ["Microsoft will bis 2030 carbon negative sein", T], ["Carbon neutral heißt, dass keine Emissionen entstehen", N]], ""),
Q("itv-green", "Was beschreibt WUE?", [["Liter Wasser pro kWh IT-Energie", T], ["Kühle Standorte brauchen tendenziell weniger Wasser", T], ["Ein Maß für Stromkosten", N], ["Eine Kennzahl der Wassereffizienz", T], ["Das Gleiche wie PUE", N]], ""),
/* itv-rg */
Q("itv-rg", "Welche Aussagen zu Resource Groups stimmen?", [["Jede Ressource liegt in genau einer Resource Group.", T], ["Ressourcen einer RG dürfen in verschiedenen Regionen liegen.", T], ["Löscht man die RG, werden alle Ressourcen darin gelöscht.", T], ["Ressourcen lassen sich zwischen RGs verschieben.", T], ["Eine Ressource kann in zwei RGs gleichzeitig sein.", N]], ""),
Q("itv-rg", "Wofür nutzt man Tags?", [["Kosten nach Kostenstelle oder Projekt zuordnen", T], ["Metadaten und Taxonomie", T], ["Abrechnung zusammenfassen", T], ["Als Ersatz für RBAC-Rechte", N], ["Umgebung kennzeichnen (prod, test)", T]], ""),
Q("itv-rg", "Eine Azure-Rechnung von 18.000 € soll auf Abteilungen verteilt werden. Was hilft?", [["Tags wie costcenter an allen Ressourcen", T], ["Cost Management nach Tags gruppieren", T], ["Eine Policy, die das Tag verpflichtend macht", T], ["Die Rechnung durch die Anzahl der Mitarbeitenden teilen", N], ["Pro Abteilung eigene Subscriptions oder RGs", T]], ""),
Q("itv-rg", "Nach welchem Kriterium gruppiert man Ressourcen in eine Resource Group?", [["Gleicher Lebenszyklus", T], ["Gemeinsam bereitgestellt und gelöscht", T], ["Gleiche Region zwingend", N], ["Gemeinsame Zugriffsrechte auf RG-Ebene", T], ["Alphabetischer Name", N]], ""),
/* itv-tools */
Q("itv-tools", "Welche Aussagen zum Azure Resource Manager stimmen?", [["Alle Werkzeuge laufen über ARM.", T], ["ARM erstellt, aktualisiert und löscht Ressourcen.", T], ["ARM prüft Authentifizierung und Autorisierung.", T], ["Das Portal umgeht ARM.", N], ["Deshalb ist das Ergebnis unabhängig vom Werkzeug gleich.", T]], ""),
Q("itv-tools", "Welche Aussagen zur Cloud Shell stimmen?", [["Läuft im Browser", T], ["Bash oder PowerShell", T], ["Braucht Resource Group, Storage Account und File Share", T], ["Timeout nach 20 Minuten Inaktivität", T], ["Muss lokal installiert werden", N]], ""),
Q("itv-tools", "Welche Befehle legen eine VM an?", [["az vm create", T], ["New-AzVM", T], ["New-AzureRmVM als empfohlener Weg", N, "AzureRM ist eingestellt."], ["Get-Help New-AzVM -Examples", N, "Zeigt nur Beispiele."], ["Ein Deployment über die REST API", T]], ""),
Q("itv-tools", "Welche Aussagen zu Azure PowerShell und CLI stimmen?", [["PowerShell nutzt Cmdlets in Verb-Nomen-Form.", T], ["Das aktuelle PowerShell-Modul heißt Az.", T], ["Die CLI wird mit „az“ aufgerufen.", T], ["„az find“ hilft, Befehle zu finden.", T], ["Die CLI läuft nur unter Windows.", N]], ""),
/* itv-mgmt */
Q("itv-mgmt", "Welche Aussagen zu Subscriptions stimmen?", [["Billing boundary", T], ["Access control boundary", T], ["Mehrere Subscriptions trennen Umgebungen oder Organisationseinheiten", T], ["Kosten werden zuerst pro Subscription aggregiert", T], ["Eine Ressource kann ohne Subscription existieren", N]], ""),
Q("itv-mgmt", "Welche Aussagen zu Management Groups stimmen?", [["Sie fassen Subscriptions zusammen.", T], ["Policies und Rechte werden nach unten vererbt.", T], ["Bis 10.000 Management Groups pro Verzeichnis", T], ["Baum bis 6 Ebenen tief (ohne Root und Subscription-Ebene)", T], ["Sie ersetzen Resource Groups.", N]], ""),
Q("itv-mgmt", "Eine Policy „Nur EU-Regionen“ wird an der MG „Bank“ zugewiesen. Was folgt?", [["Sie gilt für alle Subscriptions darunter.", T], ["Sie gilt auch für Resource Groups darunter.", T], ["Sie gilt nur für die MG selbst.", N], ["Neue Subscriptions unter der MG erben sie.", T], ["Sie muss in jeder Subscription neu zugewiesen werden.", N]], ""),
Q("itv-mgmt", "Gründe für mehrere Subscriptions?", [["Trennung von Produktion und Entwicklung", T], ["Organisationsstruktur", T], ["Getrennte Abrechnung", T], ["Limits einer Subscription umgehen", T], ["Weil eine Subscription nur eine VM erlaubt", N]], ""),
/* itv-policy */
Q("itv-policy", "Welche Aussagen zu Azure Policy stimmen?", [["Findet nicht konforme Ressourcen", T], ["Kann Erstellung blockieren (Deny)", T], ["Kann nur protokollieren (Audit)", T], ["Bestehende Ressourcen über Remediation Tasks korrigieren", T], ["Vergibt Benutzerrechte", N]], ""),
Q("itv-policy", "Was ist eine Initiative?", [["Eine Gruppe aus einer oder mehreren Policy Definitions", T], ["Wird einem Scope zugewiesen", T], ["Eine einzelne RBAC-Rolle", N], ["Vereinfacht die Verwaltung vieler Policies", T], ["Ein anderer Name für Subscription", N]], ""),
Q("itv-policy", "Wann wird die Compliance ausgewertet?", [["Regelmäßig alle 24 Stunden", T], ["Neue Zuweisungen nach etwa 5 Minuten", T], ["Auf Anforderung (on demand)", T], ["Nur einmal beim Anlegen der Subscription", N], ["Nie automatisch", N]], ""),
Q("itv-policy", "Welche Ziele verfolgt Azure Policy laut Folie?", [["Regulatorische Compliance", T], ["Kostenkontrolle", T], ["Sicherheit", T], ["Design-Konsistenz", T], ["Schnellere VMs", N]], ""),
/* itv-iam */
Q("itv-iam", "Welche Aussagen zu AuthN und AuthZ stimmen?", [["AuthN beantwortet „Wer bist du?“", T], ["AuthZ gewährt Zugriff auf Ressourcen", T], ["MFA nutzt mindestens zwei Faktoren", T], ["AuthZ prüft das Passwort", N], ["Owner, Contributor, Reader sind Beispiele für AuthZ-Rollen", T]], ""),
Q("itv-iam", "Was steht in einem Claim bzw. Token des IdP?", [["Identität des Benutzers", T], ["Signatur des IdP", T], ["Anmeldemethode bzw. Assurance Level", T], ["Weitere Attribute wie Gruppen", T], ["Das Klartext-Passwort", N]], ""),
Q("itv-iam", "Welche Probleme löst ein zentraler Identity Provider?", [["Viele Passwörter ohne SSO", T], ["Entwickler müssen keine Passwörter speichern", T], ["Admins müssen nicht jede App einzeln verwalten", T], ["Konto deaktivieren sperrt alle angebundenen Apps", T], ["Er macht Autorisierung in der App überflüssig", N]], ""),
Q("itv-iam", "Was ist Federation?", [["Vertrauen zwischen Realms bzw. Organisationen", T], ["Anmeldung mit der Heimat-Identität bei fremden Diensten", T], ["Technisch z. B. über SAML oder OIDC", T], ["Kopieren aller Passwörter in die Partnerorganisation", N], ["„Mit Google anmelden“ ist ein Alltagsbeispiel", T]], ""),
/* itv-loa */
Q("itv-loa", "Welche Zuordnungen nach NIST SP 800-63-4 stimmen?", [["IAL = Identity Proofing", T], ["AAL = Authentifizierung", T], ["FAL = Schutz der Assertion bei Föderation", T], ["AAL3 verlangt einen phishing-resistenten Public-Key-Authenticator", T], ["IAL3 ist rein online ohne Prüfer", N, "Vor Ort mit geschultem Prüfer."]], ""),
Q("itv-loa", "Welche Stufe passt?", [["Online-Banking-Login mit zwei Faktoren → AAL2", T], ["Admin-Zugang mit FIDO2-Key → AAL3", T], ["Newsletter-Anmeldung → AAL1", T], ["Self-asserted Identität → IAL3", N], ["Kontoeröffnung mit Ausweisprüfung → mindestens IAL2", T]], ""),
Q("itv-loa", "Welche Aussagen zu FAL stimmen?", [["FAL1: Assertion signiert und validiert", T], ["FAL2: zusätzlich Schutz vor Injection, eine Relying Party", T], ["FAL3: zusätzlich Holder-of-Key", T], ["Verschlüsselung ist unabhängig vom FAL", T], ["FAL beschreibt die Passwortlänge", N]], ""),
Q("itv-loa", "Was ändert 800-63-4 gegenüber 800-63-3?", [["DIRM-Prozess statt Entscheidungsbaum", T], ["Low/Moderate/High ergeben die Stufen 1/2/3", T], ["Self-asserted fällt aus IAL1–3 heraus", T], ["Es gibt keine Assurance Levels mehr", N], ["AAL entfällt", N]], ""),
/* itv-entra */
Q("itv-entra", "Welche Aussagen zu Entra ID vs. AD DS stimmen?", [["Entra ID nutzt HTTPS/REST (Graph) statt LDAP.", T], ["Entra ID nutzt SAML, WS-Fed, OIDC statt Kerberos.", T], ["Entra ID ist flach, ohne OUs und GPOs.", T], ["Entra ID ist ein 1:1 gehostetes AD DS.", N], ["Lokales AD lässt sich über Connect Sync anbinden.", T]], ""),
Q("itv-entra", "Welche Funktionen gehören zu welchem Plan?", [["Conditional Access → P1", T], ["Dynamische Gruppen → P1", T], ["Privileged Identity Management → P2", T], ["Risikobasiertes Conditional Access → P2", T], ["Conditional Access → Free", N]], ""),
Q("itv-entra", "Welche Aussagen zum Tenant stimmen?", [["Dedizierte, isolierte Instanz von Entra ID", T], ["Startdomain *.onmicrosoft.com", T], ["Der Ersteller wird Global Administrator", T], ["Ein Tenant gehört immer zu genau einer Subscription", N], ["Tenant und Directory meinen dasselbe", T]], ""),
Q("itv-entra", "Welche Aussagen zur verpflichtenden MFA für Azure stimmen?", [["Phase 1 betrifft u. a. Azure Portal und Entra Admin Center", T], ["Phase 2 betrifft u. a. CLI, PowerShell und IaC", T], ["Workload-Identitäten sind ausgenommen", T], ["Nur Gastbenutzer sind betroffen", N], ["Sie ersetzt Passwörter vollständig", N]], ""),
/* itv-users */
Q("itv-users", "Welche Aussagen zu den Benutzertypen stimmen?", [["Cloud identity: Quelle Entra ID", T], ["Directory-synchronized: Quelle Windows Server AD", T], ["Guest user: Quelle Invited User", T], ["Synchronisierte Benutzer verwaltet man am besten nur in der Cloud", N, "An der Quelle."], ["Entfernt man einen Gast, verliert er alle Zugriffe", T]], ""),
Q("itv-users", "60 Benutzer sollen per CSV angelegt werden. Was ist richtig?", [["Schleife mit New-MgUser (Graph PowerShell)", T], ["Duplikate und Tippfehler im UPN prüfen", T], ["Initialpasswort mit Änderungszwang", T], ["Gelöschte Benutzer sind 30 Tage wiederherstellbar", T], ["Bulk-Anlage ist in Entra ID unmöglich", N]], ""),
Q("itv-users", "Welche Aussagen zu Gruppen stimmen?", [["Security- und Microsoft-365-Gruppen", T], ["Mitgliedschaft Assigned, Dynamic User oder Dynamic Device", T], ["Dynamic Device nur bei Security-Gruppen", T], ["Dynamische Gruppen brauchen P1", T], ["Dynamische Gruppen werden manuell befüllt", N]], ""),
Q("itv-users", "Wofür sind Administrative Units gedacht?", [["Verwaltung auf einen Teil des Tenants beschränken", T], ["z. B. Helpdesk darf nur Benutzer einer Filiale verwalten", T], ["Rolle mit AU-Scope zuweisen", T], ["Sie ersetzen Subscriptions", N], ["AU-Admins brauchen eine P1- oder P2-Lizenz", T]], ""),
/* itv-rbac */
Q("itv-rbac", "Welche Aussagen zu den Built-in-Rollen stimmen?", [["Owner: alles inklusive Zugriff delegieren", T], ["Contributor: alles verwalten, aber keinen Zugriff vergeben", T], ["Reader: nur ansehen", T], ["Contributor kann Rollenzuweisungen schreiben", N], ["User Access Administrator verwaltet Zugriffe", T]], ""),
Q("itv-rbac", "„Support bekommt VM Contributor auf rg-shop-prod.“ Was stimmt?", [["Security Principal = Gruppe Support", T], ["Role Definition = Virtual Machine Contributor", T], ["Scope = rg-shop-prod", T], ["Die Rechte gelten auch für andere Resource Groups", N], ["Support kann darin VMs neu starten", T]], ""),
Q("itv-rbac", "Azure RBAC vs. Entra-Rollen: Was stimmt?", [["Azure RBAC: Azure-Ressourcen, Scope MG/Sub/RG/Ressource", T], ["Entra-Rollen: Benutzer, Gruppen, Apps, Scope Tenant/AU/Objekt", T], ["Global Admin kann sich zum User Access Admin am Root erhöhen", T], ["Billing-Rollen geben automatisch Zugriff auf Ressourcen", N], ["Beide Systeme sind identisch", N]], ""),
Q("itv-rbac", "Welche Aussagen zu den klassischen Administratoren stimmen?", [["Account Admin: einer pro Konto", T], ["Service Admin: einer pro Subscription", T], ["Co-Admin: bis 200 pro Subscription", T], ["Seit 31.8.2024 abgekündigt", T], ["Sie sind die empfohlene Methode für neue Projekte", N]], "")
];

questions.push(
Q("itx-geo", "Welche Aussagen zur physischen und logischen Hierarchie stimmen?", [["Region → Availability Zone → Rechenzentrum ist die physische Sicht.", T], ["Management Group → Subscription → Resource Group → Ressource ist die logische Sicht.", T], ["Eine Resource Group darf Ressourcen aus mehreren Regionen enthalten.", T], ["Jede Region hat genau ein Rechenzentrum.", N], ["Region Pairs dienen dem Disaster Recovery.", T]], ""),
Q("itx-geo", "Eine App soll den Ausfall eines Rechenzentrums überstehen, Daten dürfen die Region nicht verlassen. Was passt?", [["VMs über Availability Zones verteilen", T], ["Zonenredundanter Storage (ZRS)", T], ["GRS mit Kopie in eine andere Geography", N], ["Eine einzelne VM mit Premium SSD", N], ["Zonenredundanter Load Balancer", T]], ""),
Q("itx-geo", "Welche Aussagen zu Region Pairs stimmen?", [["Updates werden nicht gleichzeitig in beiden Regionen ausgerollt.", T], ["GRS repliziert in die Paarregion.", T], ["Die Paarregion liegt in derselben Geography (Ausnahme Brazil South).", T], ["Region Pairs ersetzen Availability Zones.", N], ["Bei großem Ausfall wird eine Region des Paares priorisiert.", T]], ""),
Q("itx-geo", "Was ist eine Availability Zone NICHT?", [["Eine eigene Region", T], ["Ein Rack innerhalb eines Rechenzentrums", T], ["Ein physisch getrennter Standort innerhalb einer Region", N], ["Eine Subscription", T], ["Ein Bereich mit eigener Strom- und Kühlungsversorgung", N]], "Gesucht sind die falschen Beschreibungen."),
Q("itx-org", "Wo vergibt man Rechte für ein Projektteam sinnvollerweise?", [["Auf der Resource Group des Projekts", T], ["Mit Gruppen statt Einzelpersonen", T], ["Nach Least Privilege", T], ["Owner für alle auf der Root Management Group", N], ["Getrennt für Produktion und Test", T]], ""),
Q("itx-org", "Welche Aussagen zur Vererbung stimmen?", [["RBAC-Zuweisungen werden nach unten vererbt.", T], ["Policies an einer Management Group gelten für alle Subscriptions darunter.", T], ["Tags werden automatisch an Ressourcen vererbt.", N, "Nur per Policy."], ["Rechte auf einer Ressource gelten auch für die ganze RG.", N], ["Subscriptions erben von ihrer Management Group.", T]], ""),
Q("itx-org", "Was passiert beim Löschen einer Resource Group?", [["Alle enthaltenen Ressourcen werden gelöscht.", T], ["Ressourcen in anderen RGs bleiben bestehen.", T], ["Die Subscription wird mitgelöscht.", N], ["Ein Resource Lock „CanNotDelete“ kann das verhindern.", T], ["Die Ressourcen werden in eine Standard-RG verschoben.", N]], ""),
Q("itx-org", "Gründe für eine eigene Subscription?", [["Eigene Abrechnung für eine Abteilung", T], ["Harte Trennung von Produktion und Entwicklung", T], ["Eigene Zugriffsgrenze", T], ["Weil eine RG maximal eine VM enthalten darf", N], ["Subscription-Limits", T]], ""),
Q("itx-vm", "Welche Aussagen zu VM-Kosten stimmen?", [["Compute wird nach Laufzeit verrechnet.", T], ["Disks kosten auch bei gestoppter VM.", T], ["Deallokiert fällt kein Compute an.", T], ["Im Gast-OS heruntergefahren, aber nicht deallokiert, läuft Compute weiter.", T], ["Disks sind immer kostenlos.", N]], ""),
Q("itx-vm", "Welche Aussagen zur temporären Disk stimmen?", [["Sie liegt lokal am Host.", T], ["Daten können bei Wartung oder Neuzuordnung verloren gehen.", T], ["Geeignet für Auslagerungsdatei oder Cache", T], ["Ideal für die Produktionsdatenbank", N], ["Unter Windows meist Laufwerk D:", T]], ""),
Q("itx-vm", "Welche VM-Serie passt?", [["B-Serie: burstable, für wenig ausgelastete Dienste", T], ["N-Serie: GPU, z. B. KI oder Rendering", T], ["E-Serie: speicheroptimiert", T], ["F-Serie: rechenoptimiert", T], ["L-Serie: GPU", N, "L = storageoptimiert."]], ""),
Q("itx-vm", "Welche Aussagen zu Availability Sets und Scale Sets stimmen?", [["Fault Domains trennen Racks bzw. Strom.", T], ["Update Domains werden nacheinander gewartet.", T], ["VM Scale Sets sind Gruppen identischer, load-balancierter VMs.", T], ["Autoscale kann nach Metrik oder Zeitplan skalieren.", T], ["Ein Availability Set schützt vor Regionsausfall.", N]], ""),
Q("itx-storage", "Welche Aussagen zu den Redundanzoptionen stimmen?", [["LRS: 3 Kopien in einem Rechenzentrum", T], ["ZRS: 3 Kopien über 3 Zonen", T], ["GRS: LRS primär + LRS in der Sekundärregion, insgesamt 6 Kopien", T], ["RA-GRS erlaubt Lesen in der Sekundärregion ohne Failover", T], ["GZRS ist die günstigste Option", N]], ""),
Q("itx-storage", "10 TB, 1 % pro Monat gelesen. Welche Aussagen stimmen (Beispielpreise)?", [["Hot kostet am meisten.", T], ["Archive ist am billigsten, aber offline.", T], ["Rehydrierung aus Archive kann Stunden dauern.", T], ["Eine Lifecycle-Regel kann Daten automatisch verschieben.", T], ["Archive eignet sich für sofort benötigte Daten.", N]], ""),
Q("itx-storage", "Welche Mindestspeicherdauern gelten für die Zugriffsebenen?", [["Cool: 30 Tage", T], ["Cold: 90 Tage", T], ["Archive: 180 Tage", T], ["Hot: 365 Tage", N], ["Früheres Löschen kann eine Early-Deletion-Gebühr auslösen", T]], ""),
Q("itx-storage", "Welche Dienste bietet ein Storage Account?", [["Blob", T], ["Files", T], ["Queue", T], ["Table", T], ["Virtual Network", N]], ""),
Q("itx-vnet", "Welche Aussagen zu Azure-Subnetzen stimmen?", [["Azure reserviert 5 Adressen pro Subnetz.", T], ["In einem /24 sind 251 Adressen nutzbar.", T], ["Die erste nutzbare Adresse in 10.0.1.0/24 ist 10.0.1.4.", T], ["Ein /28 hat 14 nutzbare Adressen.", N, "16 − 5 = 11."], ["Das kleinste Subnetz ist /29.", T]], ""),
Q("itx-vnet", "Welche Aussagen zu VNet Peering stimmen?", [["Verkehr läuft über das Microsoft-Backbone.", T], ["Adressräume dürfen sich nicht überlappen.", T], ["Peering ist transitiv.", N], ["Global Peering verbindet VNets in verschiedenen Regionen.", T], ["Gateway Transit lässt Spokes das Hub-Gateway nutzen.", T]], ""),
Q("itx-vnet", "Welche Aussagen zu NSGs stimmen?", [["Kleinere Prioritätszahl wird zuerst geprüft.", T], ["Die erste passende Regel gewinnt.", T], ["NSGs sind zustandsbehaftet.", T], ["DenyAllInBound ist eine Standardregel.", T], ["NSGs verschlüsseln Verkehr.", N]], ""),
Q("itx-vnet", "Welche Verbindungsarten zu On-Premises gibt es?", [["Site-to-Site-VPN", T], ["Point-to-Site-VPN", T], ["ExpressRoute (privat, nicht über das Internet)", T], ["VNet Peering direkt zum Firmen-LAN", N], ["Das Gateway liegt im GatewaySubnet", T]], ""),
Q("itx-route", "Routentabelle: 10.2.0.0/16 → Peering, 10.2.5.0/24 → Firewall. Welche Aussagen stimmen?", [["10.2.5.20 geht über die Firewall.", T], ["10.2.9.7 geht direkt über das Peering.", T], ["Das längste passende Präfix gewinnt.", T], ["Die zuerst eingetragene Route gewinnt immer.", N], ["Bei gleichem Präfix gilt UDR vor BGP vor System.", T]], ""),
Q("itx-route", "Welche Next-Hop-Typen gibt es bei UDRs?", [["Virtual appliance", T], ["Virtual network gateway", T], ["Internet", T], ["None", T], ["Load Balancer SKU", N]], ""),
Q("itx-route", "Welche Aussagen zu Service Endpoints stimmen?", [["Sie erweitern die Identität des Subnetzes auf PaaS-Dienste.", T], ["Verkehr bleibt im Azure-Backbone.", T], ["Der Dienst behält seine öffentliche Adresse.", T], ["Sie geben dem Dienst eine private IP im VNet.", N, "Das macht ein Private Endpoint."], ["In der Dienst-Firewall wird das Subnetz zugelassen.", T]], ""),
Q("itx-route", "Was muss man für eine Firewall-VM als Next Hop beachten?", [["Next-Hop-Typ Virtual appliance mit ihrer IP", T], ["IP-Forwarding an der NIC aktivieren", T], ["Routentabelle dem Subnetz zuordnen", T], ["Ein Subnetz kann beliebig viele Routentabellen haben", N, "Höchstens eine."], ["Systemroute 0.0.0.0/0 kann per UDR überschrieben werden", T]], ""),
Q("itx-iac", "Welche Aussagen zu deklarativ und idempotent stimmen?", [["Deklarativ beschreibt den Zielzustand.", T], ["Idempotent: mehrfaches Ausführen ergibt denselben Zustand.", T], ["Bicep und ARM-Templates sind deklarativ.", T], ["Ein imperatives create-Skript ist automatisch idempotent.", N], ["Manuelle Änderungen werden beim nächsten Deployment zurückgesetzt.", T]], ""),
Q("itx-iac", "Welche Werkzeuge gehören zu IaC?", [["ARM-Templates (JSON)", T], ["Bicep", T], ["Terraform", T], ["Paint", N], ["Azure CLI-Skripte (imperativ)", T]], ""),
Q("itx-iac", "Was bedeutet „Cattle, not pets“ für IaC?", [["Server werden aus Code neu erzeugt statt repariert.", T], ["Konfiguration ist versioniert und reproduzierbar.", T], ["Jeder Server wird individuell gepflegt.", N], ["Umgebungen lassen sich identisch klonen.", T], ["Konfigurationsdrift wird vermieden.", T]], ""),
Q("itx-iac", "Welche Vorteile bringt IaC?", [["Wiederholbarkeit", T], ["Review über Pull Requests", T], ["Schnelles Neuaufsetzen nach Ausfall", T], ["Keine Tests mehr nötig", N], ["Dokumentation steckt im Code", T]], "")
);

const F = (id, topic, front, back) => ({ id: "px-itinf-f" + id, cat: "ITINF-GL · Plus", topic, front, back });
const flashcards = [
  F(1, "itg-sla", "Composite SLA rechnen", "Seriell: A1 · A2 · … Parallel (unabhängig): 1 − (1 − A)ⁿ. Ausfall/Jahr = (1 − A) · 8.760 h, pro Monat · 730 h."),
  F(2, "itg-faas", "Azure Functions Consumption: Kostenformel", "GB-s = Ausführungen · Laufzeit (s) · Speicher (GB). Kosten = (Ausführungen − 1 Mio.) · 0,20 $/Mio. + (GB-s − 400.000) · 0,000016 $ (Listenpreise, können sich ändern)."),
  F(3, "itg-pa", "Break-even-Cloudpreis nach Weinman", "c* = d · p / a. Beispiel p = 10, a = 2, d = 0,15 €/h → c* = 0,75 €/h."),
  F(4, "itg-cost", "Break-even CapEx vs. OpEx", "Monate bis on-prem günstiger = CapEx / (Cloud-Monatskosten − laufende on-prem-Kosten). Gilt nur bei statischer Last."),
  F(5, "itg-workload", "Autoscaling-Ersparnis", "Fest: ⌈Spitze/Kapazität⌉ · 24 h. Autoscale: je Stunde ⌈Last/Kapazität⌉ (mit Minimum). Ersparnis steigt mit p/a."),
  F(6, "itv-green", "PUE rechnen", "PUE = Gesamtenergie / IT-Energie. 90.000 · 500 W · 8.760 h = 394,2 GWh; · 1,5 = 591,3 GWh."),
  F(7, "itg-sla", "Scale up vs. scale out", "Up: größere VM, Neustart, Obergrenze, SPOF. Out: mehr Instanzen hinter Load Balancer, elastisch, ausfallsicherer. Gebot: Scale out, not up."),
  F(9, "itx-vnet", "Nutzbare Adressen im Azure-Subnetz", "2^(32 − Präfix) − 5. Reserviert: Netzadresse, .1 Gateway, .2 und .3 DNS, letzte Adresse. /24 → 251, /28 → 11, /29 → 3."),
  F(10, "itx-route", "Routenauswahl in Azure", "Längstes passendes Präfix gewinnt. Nur bei gleichem Präfix: UDR > BGP > Systemroute."),
  F(8, "itv-users", "Quellen von Benutzern in Entra ID", "Cloud identity (Entra ID) · Directory-synchronized (Windows Server AD, Connect Sync/Cloud Sync) · Guest (Invited User, B2B).")
];

(window.STUDYOS_EXT = window.STUDYOS_EXT || {}).itinf = (window.STUDYOS_EXT.itinf || []).concat([{ id: "itinf-plus", blocks, questions, flashcards }]);
})();
