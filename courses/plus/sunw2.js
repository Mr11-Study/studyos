/* SUNW2 · Plus: Rechner mit Live-Graph, Animationen, durchgerechnete Beispiele, zusätzliche Fragen (über STUDYOS_EXT, siehe courses/ext-apply.js) */
(function () {
const C = window.STUDYOS_CALC = window.STUDYOS_CALC || {};
const FIG = window.STUDYOS_FIG = window.STUDYOS_FIG || {};
const FX = window.FX;
const n0 = (n, d = 0) => Number(n).toLocaleString("de-AT", { minimumFractionDigits: d, maximumFractionDigits: d });
const nd = (n, d = 2) => Number(n).toLocaleString("de-AT", { maximumFractionDigits: d });
const eur = n => "€ " + Number(n).toLocaleString("de-AT", { maximumFractionDigits: 0 });
const pct = (x, d = 3) => (x * 100).toLocaleString("de-AT", { maximumFractionDigits: d }) + " %";
const sci = x => { if (!isFinite(x)) return "∞"; if (x === 0) return "0"; const e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e); return e < 6 ? n0(x) : nd(m, 2) + " · 10^" + e; };
const dur = s => { if (!isFinite(s)) return "∞"; if (s < 1) return nd(s * 1000, 1) + " ms"; if (s < 120) return nd(s, 1) + " s"; if (s < 7200) return nd(s / 60, 1) + " min"; if (s < 172800) return nd(s / 3600, 1) + " h"; if (s < 3.156e7 * 2) return nd(s / 86400, 1) + " Tage"; return sci(s / 3.156e7) + " Jahre"; };
const Phi = x => { const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x / 2); return x >= 0 ? (1 + y) / 2 : (1 - y) / 2; };

/* ======================= RECHNER ======================= */

/* 1 · Quantitative Risikoanalyse (snw1-1) */
C["snw-risk"] = {
  title: "Risiko in Euro: lohnt sich die Maßnahme?",
  intro: "Risiko ≈ Eintrittshäufigkeit × Schadenshöhe. In der quantitativen Risikoanalyse heißt das <b>ALE = SLE × ARO</b> (Annualized Loss Expectancy). Stell Wert, Schadensanteil und Häufigkeit ein und prüfe, ob sich eine Schutzmaßnahme rechnet.",
  inputs: [
    { k: "av", label: "Wert des Assets (AV)", v: 400000, min: 0, max: 2000000, step: 10000, unit: "€" },
    { k: "ef", label: "Schadensanteil pro Vorfall (EF)", v: 50, min: 1, max: 100, step: 1, unit: "%" },
    { k: "aro", label: "Vorfälle pro Jahr (ARO)", v: 0.2, min: 0, max: 3, step: 0.05, unit: "/Jahr" },
    { k: "k", label: "Kosten der Maßnahme pro Jahr", v: 12000, min: 0, max: 200000, step: 1000, unit: "€" },
    { k: "r", label: "Maßnahme senkt die Häufigkeit um", v: 80, min: 0, max: 100, step: 5, unit: "%" }
  ],
  out: v => { const sle = v.av * v.ef / 100, a0 = sle * v.aro, a1 = a0 * (1 - v.r / 100), net = a0 - a1 - v.k;
    return [["Schaden pro Vorfall (SLE)", eur(sle)], ["ALE ohne Maßnahme", eur(a0), "/Jahr"], ["ALE mit Maßnahme", eur(a1), "/Jahr"], [net >= 0 ? "Nutzen der Maßnahme" : "Maßnahme kostet mehr, als sie spart", eur(net), "/Jahr", true]]; },
  steps: v => { const sle = v.av * v.ef / 100, a0 = sle * v.aro, a1 = a0 * (1 - v.r / 100), be = v.r > 0 && sle > 0 ? v.k / (sle * v.r / 100) : NaN;
    return `SLE = AV · EF = ${eur(v.av)} · ${n0(v.ef)} % = <b>${eur(sle)}</b><br>
    ALE<sub>vorher</sub> = SLE · ARO = ${eur(sle)} · ${nd(v.aro)} = <b>${eur(a0)}</b> pro Jahr<br>
    ALE<sub>nachher</sub> = ${eur(a0)} · (1 − ${n0(v.r)} %) = <b>${eur(a1)}</b><br>
    Nutzen = ALE<sub>vorher</sub> − ALE<sub>nachher</sub> − Kosten = ${eur(a0)} − ${eur(a1)} − ${eur(v.k)} = <b>${eur(a0 - a1 - v.k)}</b><br>
    Break-even-Häufigkeit: Die Maßnahme lohnt sich ab ARO = K / (SLE · Senkung) = <b>${isFinite(be) ? nd(be, 3) : "–"}</b> Vorfällen pro Jahr.`; },
  plot: { x: v => [0, Math.max(1, v.aro * 2.5)], xl: "Vorfälle pro Jahr (ARO)", yl: "€ pro Jahr", yfmt: n => n0(n / 1000) + "k",
    fns: [{ label: "ALE ohne Maßnahme", f: (x, v) => v.av * v.ef / 100 * x }, { label: "ALE mit Maßnahme + Kosten", f: (x, v) => v.av * v.ef / 100 * x * (1 - v.r / 100) + v.k }],
    points: v => { const sle = v.av * v.ef / 100, be = v.r > 0 && sle > 0 ? v.k / (sle * v.r / 100) : NaN; return isFinite(be) ? [{ x: be, y: sle * be, label: "lohnt ab hier" }] : []; } }
};

/* 2 · Passwort-Brute-Force (snw1-4) */
C["snw-brute"] = {
  title: "Wie lange dauert Brute Force?",
  intro: "Ein Angreifer hat einen Passwort-Hash erbeutet und probiert offline alle Kombinationen. Zeichenvorrat N und Länge L bestimmen den Schlüsselraum N<sup>L</sup>. Die Kurven zeigen die mittlere Knackzeit (log-Skala) für typische Zeichenvorräte.",
  inputs: [
    { k: "n", label: "Zeichenvorrat N (10 Ziffern, 26 klein, 62 alnum, 94 alle)", v: 62, min: 10, max: 94, step: 1, unit: "Zeichen" },
    { k: "l", label: "Länge L", v: 8, min: 4, max: 20, step: 1, unit: "Zeichen" },
    { k: "g", label: "Rateversuche pro Sekunde", v: 10, min: 0.001, max: 1000, step: 0.001, unit: "Mrd./s" }
  ],
  out: v => { const ks = Math.pow(v.n, v.l), g = v.g * 1e9, bits = v.l * Math.log2(v.n);
    return [["Schlüsselraum N^L", sci(ks)], ["Entropie", nd(bits, 1), "Bit"], ["schlimmster Fall", dur(ks / g)], ["im Mittel (halber Raum)", dur(ks / g / 2), "", true]]; },
  steps: v => { const ks = Math.pow(v.n, v.l), g = v.g * 1e9;
    return `Schlüsselraum = N<sup>L</sup> = ${v.n}<sup>${v.l}</sup> = <b>${sci(ks)}</b> Kombinationen<br>
    Entropie = L · log<sub>2</sub>(N) = ${v.l} · ${nd(Math.log2(v.n), 3)} = <b>${nd(v.l * Math.log2(v.n), 1)} Bit</b><br>
    mittlere Zeit = N<sup>L</sup> / (2 · Rate) = ${sci(ks)} / (2 · ${sci(g)}/s) = <b>${dur(ks / g / 2)}</b><br>
    Einordnung: 10 Mrd./s schafft ein GPU-Rechner gegen schnelle Hashes (z. B. NTLM, MD5). Gegen langsame Hashes (bcrypt, Argon2) sind es nur Tausende pro Sekunde, online mit Kontosperre nur eine Handvoll. Mit <b>2FA</b> hilft das geknackte Passwort allein dem Angreifer nicht.`; },
  plot: { x: [4, 20], xl: "Länge L", yl: "Ø Zeit in Jahren (10^y)", yfmt: n => "10^" + n0(n), xfmt: n => n0(n),
    fns: [10, 26, 62, 94].map(N => ({ label: `N = ${N}`, f: (x, v) => Math.log10(Math.pow(N, Math.round(x)) / (v.g * 1e9) / 2 / 3.156e7) })),
    points: v => [{ x: v.l, y: Math.log10(Math.pow(v.n, v.l) / (v.g * 1e9) / 2 / 3.156e7), label: "deine Wahl" }] }
};

/* 3 · VoIP-Bandbreite (snw2-1) */
C["snw-voip"] = {
  title: "VoIP über UDP: Wie viel Bandbreite braucht ein Gespräch?",
  intro: "Sprache wird in kleinen Paketen verschickt. Jedes Paket trägt Header von RTP, UDP, IP und Ethernet. Je kürzer das Paketintervall, desto größer der Header-Anteil. Für TCP statt UDP trage 20 Byte als Layer-4-Header ein.",
  inputs: [
    { k: "codec", label: "Codec-Datenrate (G.711 = 64)", v: 64, min: 8, max: 128, step: 1, unit: "kbit/s" },
    { k: "ms", label: "Paketintervall", v: 20, min: 10, max: 60, step: 5, unit: "ms" },
    { k: "l4", label: "Layer-4-Header (UDP 8, TCP 20)", v: 8, min: 8, max: 20, step: 12, unit: "Byte" },
    { k: "link", label: "Leitung (eine Richtung)", v: 10, min: 1, max: 1000, step: 1, unit: "Mbit/s" }
  ],
  out: v => { const pl = v.codec * v.ms / 8, pk = pl + 12 + v.l4 + 20 + 18, pps = 1000 / v.ms, bw = pk * 8 * pps / 1000;
    return [["Nutzdaten pro Paket", n0(pl), "Byte"], ["Paket auf dem Kabel", n0(pk), "Byte"], ["Pakete pro Sekunde", nd(pps, 1)], ["Bandbreite pro Gespräch und Richtung", nd(bw, 1), "kbit/s", true], ["Header-Anteil", nd(100 * (pk - pl) / pk, 1), "%"], ["gleichzeitige Gespräche", n0(Math.floor(v.link * 1000 / bw))]]; },
  steps: v => { const pl = v.codec * v.ms / 8, pk = pl + 12 + v.l4 + 20 + 18, pps = 1000 / v.ms, bw = pk * 8 * pps / 1000;
    return `Nutzdaten = ${v.codec} kbit/s · ${v.ms} ms / 8 = <b>${n0(pl)} Byte</b><br>
    Paket = Nutzdaten + RTP 12 + L4 ${v.l4} + IP 20 + Ethernet 18 = <b>${n0(pk)} Byte</b><br>
    Pakete/s = 1000 / ${v.ms} = ${nd(pps, 1)}<br>
    Bandbreite = ${n0(pk)} Byte · 8 · ${nd(pps, 1)}/s = <b>${nd(bw, 1)} kbit/s</b> (je Richtung)<br>
    Gespräche auf ${v.link} Mbit/s = ${n0(v.link * 1000)} / ${nd(bw, 1)} = <b>${n0(Math.floor(v.link * 1000 / bw))}</b> (ohne Reserve; in der Praxis höchstens ca. 75 % der Leitung einplanen)`; },
  plot: { x: [10, 60], xl: "Paketintervall (ms)", yl: "kbit/s", fns: [
    { label: "Bandbreite mit allen Headern", f: (x, v) => (v.codec * x / 8 + 12 + v.l4 + 20 + 18) * 8 * (1000 / x) / 1000 },
    { label: "reine Codec-Datenrate", f: (x, v) => v.codec }],
    points: v => [{ x: v.ms, y: (v.codec * v.ms / 8 + 50 + v.l4) * 8 * (1000 / v.ms) / 1000, label: "aktuell" }] }
};

/* 4 · MAC-Flooding vs. Port Security (snw3-1) */
C["snw-cam"] = {
  title: "MAC-Flooding: Wie schnell ist die CAM-Tabelle voll?",
  intro: "Der Angreifer schickt Frames mit zufälligen Absender-MACs. Ist die CAM-Tabelle voll, flutet der Switch unbekannte Ziele an alle Ports, und der Angreifer kann mitlesen. Port Security begrenzt die MACs pro Port.",
  inputs: [
    { k: "size", label: "Größe der CAM-Tabelle", v: 8192, min: 1024, max: 131072, step: 1024, unit: "Einträge" },
    { k: "used", label: "davon schon belegt (legitim)", v: 600, min: 0, max: 20000, step: 50, unit: "Einträge" },
    { k: "rate", label: "gefälschte MACs pro Sekunde", v: 2500, min: 100, max: 20000, step: 100, unit: "/s" },
    { k: "max", label: "Port Security: max. MACs pro Port", v: 2, min: 1, max: 10, step: 1, unit: "" },
    { k: "ports", label: "Ports, an denen der Angreifer hängt", v: 1, min: 1, max: 48, step: 1, unit: "" }
  ],
  out: v => { const free = Math.max(0, v.size - v.used), t = free / v.rate, ps = v.ports * v.max;
    return [["freie Einträge", n0(free)], ["Zeit bis zum Überlauf ohne Schutz", dur(t), "", true], ["Einträge mit Port Security höchstens", n0(ps)], ["Füllstand mit Port Security", nd(100 * Math.min(v.size, v.used + ps) / v.size, 1), "%"]]; },
  steps: v => { const free = Math.max(0, v.size - v.used);
    return `frei = ${n0(v.size)} − ${n0(v.used)} = ${n0(free)} Einträge<br>Zeit bis voll = ${n0(free)} / ${n0(v.rate)} pro s = <b>${dur(free / v.rate)}</b><br>
    Mit Port Security (maximum ${v.max}) lernt der Switch je Port höchstens ${v.max} MACs: ${v.ports} · ${v.max} = <b>${v.ports * v.max}</b> Einträge. Weitere Absender lösen die Violation-Aktion aus (protect, restrict oder shutdown → err-disabled).<br>
    Die Einträge altern nach der Aging Time (Standard 300 s) aus. Der Angreifer muss deshalb dauerhaft weiterfluten, was im Monitoring auffällt.`; },
  plot: { x: v => [0, Math.max(2, Math.max(0, v.size - v.used) / v.rate * 2)], xl: "Sekunden", yl: "belegte Einträge", fns: [
    { label: "ohne Port Security", f: (x, v) => Math.min(v.size, v.used + v.rate * x) },
    { label: "mit Port Security", f: (x, v) => Math.min(v.size, v.used + Math.min(v.ports * v.max, v.rate * x)) },
    { label: "Kapazität", f: (x, v) => v.size }] }
};

/* 5 · Subnetz- und Wildcard-Rechner (snw3-4, snw4-3) */
const ipStr = x => [24, 16, 8, 0].map(s => (x >>> s) & 255).join(".");
const bin = x => [24, 16, 8, 0].map(s => ((x >>> s) & 255).toString(2).padStart(8, "0")).join(".");
const sub = v => { const o = [v.o1, v.o2, v.o3, v.o4].map(x => Math.max(0, Math.min(255, Math.round(x)))), p = Math.max(0, Math.min(32, Math.round(v.p)));
  const ip = ((o[0] * 16777216) + (o[1] << 16) + (o[2] << 8) + o[3]) >>> 0, mask = p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0, wc = (~mask) >>> 0, net = (ip & mask) >>> 0, bc = (net | wc) >>> 0;
  const hosts = p === 32 ? 1 : p === 31 ? 2 : Math.pow(2, 32 - p) - 2; return { o, p, ip, mask, wc, net, bc, hosts }; };
C["snw-subnet"] = {
  title: "Subnetz- und Wildcard-Rechner",
  intro: "IP-Adresse und Präfix eingeben: Der Rechner liefert Netz, Broadcast, Host-Bereich und die Masken, die du für Cisco-ACLs brauchst (IOS: Wildcard, ASA: Subnetzmaske).",
  inputs: [
    { k: "o1", label: "Oktett 1", v: 10, min: 0, max: 255, step: 1 },
    { k: "o2", label: "Oktett 2", v: 10, min: 0, max: 255, step: 1 },
    { k: "o3", label: "Oktett 3", v: 30, min: 0, max: 255, step: 1 },
    { k: "o4", label: "Oktett 4", v: 77, min: 0, max: 255, step: 1 },
    { k: "p", label: "Präfixlänge", v: 26, min: 8, max: 32, step: 1, unit: "/" }
  ],
  out: v => { const s = sub(v);
    return [["Netzadresse", ipStr(s.net) + "/" + s.p, "", true], ["Broadcast", ipStr(s.bc)], ["erster bis letzter Host", s.p >= 31 ? ipStr(s.net) + " – " + ipStr(s.bc) : ipStr(s.net + 1) + " – " + ipStr(s.bc - 1)], ["nutzbare Hosts", n0(s.hosts)], ["Subnetzmaske (ASA)", ipStr(s.mask)], ["Wildcard (IOS-ACL)", ipStr(s.wc)]]; },
  steps: v => { const s = sub(v);
    return `<code>IP&nbsp;&nbsp;&nbsp;${bin(s.ip)}</code><br><code>Maske ${bin(s.mask)}</code> (/${s.p} = ${s.p} Einsen)<br><code>Netz&nbsp;${bin(s.net)}</code> = IP UND Maske = <b>${ipStr(s.net)}</b><br>
    Broadcast = alle ${32 - s.p} Hostbits auf 1 = <b>${ipStr(s.bc)}</b><br>
    Hosts = 2<sup>${32 - s.p}</sup> − 2 = <b>${n0(s.hosts)}</b> (Netz- und Broadcastadresse sind nicht nutzbar${s.p >= 31 ? "; /31 und /32 sind Sonderfälle für Punkt-zu-Punkt bzw. Einzelhost" : ""})<br>
    Wildcard = 255.255.255.255 − Maske = <b>${ipStr(s.wc)}</b><br>
    IOS: <code>permit ip ${ipStr(s.net)} ${ipStr(s.wc)} any</code> · ASA: <code>permit ip ${ipStr(s.net)} ${ipStr(s.mask)} any</code>`; }
};

/* 6 · Verfügbarkeit von Firewall-Architekturen (snw4-4) */
C["snw-fwha"] = {
  title: "Ein- oder zweistufig: Was passiert mit der Verfügbarkeit?",
  intro: "Zwei Firewalls hintereinander (seriell) müssen <b>beide</b> laufen, damit der Internetzugang funktioniert. Erst ein Cluster je Stufe (parallel, Active/Standby) erhöht die Verfügbarkeit. Annahme: Ausfälle sind unabhängig.",
  inputs: [
    { k: "a", label: "Verfügbarkeit einer Firewall", v: 99.9, min: 99, max: 99.999, step: 0.001, unit: "%" },
    { k: "l", label: "Verfügbarkeit der Internetleitung", v: 99.95, min: 99, max: 100, step: 0.01, unit: "%" }
  ],
  out: v => { const a = v.a / 100, L = v.l / 100, cl = 1 - (1 - a) ** 2, h = x => (1 - x) * 8760;
    const r = [["einstufig, 1 Gerät", a * L], ["einstufig, Cluster", cl * L], ["zweistufig, je 1 Gerät", a * a * L], ["zweistufig, je Cluster", cl * cl * L]];
    return r.map(([lab, x], i) => [lab, pct(x, 4) + " · " + nd(h(x), 1) + " h/Jahr", "", i === 3]); },
  steps: v => { const a = v.a / 100, L = v.l / 100, cl = 1 - (1 - a) ** 2;
    return `Seriell (alles muss laufen): Verfügbarkeiten multiplizieren. Parallel (eine reicht): Ausfallwahrscheinlichkeiten multiplizieren.<br>
    Cluster = 1 − (1 − ${nd(v.a, 3)} %)² = 1 − ${nd((1 - a) * 100, 3)} %² = <b>${pct(cl, 5)}</b><br>
    einstufig = A<sub>FW</sub> · A<sub>Leitung</sub> = ${pct(a)} · ${pct(L)} = <b>${pct(a * L, 4)}</b><br>
    zweistufig = A<sub>FW</sub> · A<sub>FW</sub> · A<sub>Leitung</sub> = <b>${pct(a * a * L, 4)}</b> → Ausfall (1 − A) · 8.760 h = <b>${nd((1 - a * a * L) * 8760, 1)} h/Jahr</b><br>
    zweistufig mit Clustern = ${pct(cl, 5)}² · ${pct(L)} = <b>${pct(cl * cl * L, 4)}</b>. Jetzt begrenzt die einzelne Internetleitung, also wäre eine zweite Leitung der nächste Schritt.`; },
  plot: { x: [99, 99.99], xl: "Verfügbarkeit einer Firewall (%)", yl: "Ausfall h/Jahr", xfmt: n => nd(n, 2), fns: [
    { label: "einstufig, 1 Gerät", f: (x, v) => (1 - x / 100 * v.l / 100) * 8760 },
    { label: "zweistufig, je 1 Gerät", f: (x, v) => (1 - (x / 100) ** 2 * v.l / 100) * 8760 },
    { label: "zweistufig, je Cluster", f: (x, v) => (1 - (1 - (1 - x / 100) ** 2) ** 2 * v.l / 100) * 8760 }],
    points: v => [{ x: v.a, y: (1 - (v.a / 100) ** 2 * v.l / 100) * 8760, label: "zweistufig" }] }
};

/* 7 · PAT-Kapazität (snw5-1) */
C["snw-pat"] = {
  title: "PAT: Wie viele Nutzer passen hinter eine öffentliche IP?",
  intro: "PAT unterscheidet Verbindungen über den Quellport. Pro öffentlicher IP und Protokoll stehen die Ports 1024–65535 zur Verfügung, also 64.512. Ein Browser hält oft Dutzende Verbindungen gleichzeitig offen.",
  inputs: [
    { k: "ips", label: "öffentliche IP-Adressen", v: 1, min: 1, max: 16, step: 1 },
    { k: "ports", label: "nutzbare Ports pro IP", v: 64512, min: 1000, max: 64512, step: 512 },
    { k: "c", label: "gleichzeitige Verbindungen pro Nutzer", v: 120, min: 10, max: 600, step: 10 },
    { k: "res", label: "Reserve", v: 20, min: 0, max: 50, step: 5, unit: "%" }
  ],
  out: v => { const tot = v.ips * v.ports, u = Math.floor(tot * (1 - v.res / 100) / v.c);
    return [["Übersetzungen gesamt", n0(tot)], ["Nutzer gleichzeitig (mit Reserve)", n0(u), "", true], ["Nutzer ohne Reserve", n0(Math.floor(tot / v.c))]]; },
  steps: v => { const tot = v.ips * v.ports;
    return `Ports gesamt = ${v.ips} IP · ${n0(v.ports)} = <b>${n0(tot)}</b><br>Nutzer = ${n0(tot)} · (1 − ${v.res} %) / ${v.c} = <b>${n0(Math.floor(tot * (1 - v.res / 100) / v.c))}</b><br>
    Vereinfachte Obergrenze: Viele Geräte nutzen denselben Quellport parallel zu verschiedenen Zielen, und TCP und UDP haben getrennte Portbereiche. Wichtig für die Prüfung: Die PAT-Tabelle ist nur eine Übersetzungstabelle, <b>kein Filter</b>.`; },
  plot: { x: [10, 600], xl: "Verbindungen pro Nutzer", yl: "Nutzer", fns: [
    { label: "mit deinen IPs", f: (x, v) => v.ips * v.ports * (1 - v.res / 100) / x },
    { label: "mit 1 IP", f: (x, v) => v.ports * (1 - v.res / 100) / x }],
    points: v => [{ x: v.c, y: v.ips * v.ports * (1 - v.res / 100) / v.c, label: "aktuell" }] }
};

/* 8 · IDS-Tuning: False Positives, False Negatives, CER (snw5-2) */
C["snw-ids"] = {
  title: "IDS abstimmen: Fehlalarme gegen übersehene Angriffe",
  intro: "Modell: Jedes Ereignis bekommt einen Verdachtswert. Harmlose Ereignisse streuen um 0, Angriffe um die <b>Trennschärfe d</b>. Alles über der <b>Schwelle</b> löst Alarm aus. Senkst du die Schwelle (höhere Sensitivität), sinken die False Negatives und steigen die False Positives. Der Schnittpunkt ist die Crossover Error Rate.",
  inputs: [
    { k: "d", label: "Trennschärfe d (Qualität der Signaturen)", v: 3, min: 0.5, max: 6, step: 0.1 },
    { k: "t", label: "Alarm-Schwelle", v: 2, min: -1, max: 7, step: 0.1 },
    { k: "n", label: "Ereignisse pro Tag", v: 1000000, min: 10000, max: 10000000, step: 10000 },
    { k: "atk", label: "echte Angriffe pro Tag", v: 20, min: 1, max: 1000, step: 1 }
  ],
  out: v => { const fpr = 1 - Phi(v.t), fnr = Phi(v.t - v.d), fp = (v.n - v.atk) * fpr, tp = v.atk * (1 - fnr), cer = 1 - Phi(v.d / 2);
    return [["False-Positive-Rate", pct(fpr, 3)], ["False-Negative-Rate", pct(fnr, 2)], ["Fehlalarme pro Tag", n0(fp), "", true], ["übersehene Angriffe pro Tag", nd(v.atk * fnr, 1)], ["Anteil echter Alarme (Precision)", pct(tp / (tp + fp || 1), 2)], ["CER (bei Schwelle d/2)", pct(cer, 2)]]; },
  steps: v => { const fpr = 1 - Phi(v.t), fnr = Phi(v.t - v.d), fp = (v.n - v.atk) * fpr, tp = v.atk * (1 - fnr);
    return `FPR = Anteil harmloser Ereignisse über der Schwelle = <b>${pct(fpr, 3)}</b><br>FNR = Anteil Angriffe unter der Schwelle = <b>${pct(fnr, 2)}</b><br>
    Fehlalarme = (${n0(v.n)} − ${v.atk}) · ${pct(fpr, 3)} = <b>${n0(fp)}</b> pro Tag<br>erkannte Angriffe = ${v.atk} · (1 − ${pct(fnr, 2)}) = ${nd(tp, 1)}<br>
    Precision = ${nd(tp, 1)} / (${nd(tp, 1)} + ${n0(fp)}) = <b>${pct(tp / (tp + fp || 1), 2)}</b> der Alarme sind echt.<br>
    Das ist der <b>Base-Rate-Effekt</b>: Weil Angriffe selten sind, erzeugt schon eine winzige FPR mehr Fehlalarme als echte Treffer. Tuning mit Kontextwissen (irrelevante Signaturen abschalten) erhöht die Trennschärfe und senkt beide Kurven.`; },
  plot: { x: v => [-1, v.d + 3], xl: "Alarm-Schwelle", yl: "Fehlerrate in %", y: [0, 100], fns: [
    { label: "False Positives (FPR)", f: (x, v) => 100 * (1 - Phi(x)) },
    { label: "False Negatives (FNR)", f: (x, v) => 100 * Phi(x - v.d) }],
    points: v => [{ x: v.d / 2, y: 100 * (1 - Phi(v.d / 2)), label: "CER" }] }
};

/* ======================= ANIMATIONEN ======================= */
const { svg, g, t, tl, r, box, c, l, p, dot, server, user, laptop, lock } = FX;
const sw = (x, y, lab, o = {}) => g(o, r(x - 46, y - 18, 92, 36, { cls: o.cls || "fx-info", rx: 6 }) + [0, 1, 2, 3, 4, 5].map(i => r(x - 38 + i * 13, y + 4, 9, 7, { cls: "fx-mute", rx: 1.5 })).join("") + t(x, y - 3, lab, { fs: 11.5, fw: 700 }));
const xmark = (x, y, o = {}) => g(o, `<path d="M${x - 9} ${y - 9} L${x + 9} ${y + 9} M${x + 9} ${y - 9} L${x - 9} ${y + 9}" class="fx-ln bad" stroke-width="4"/>`);

/* A · ARP-Spoofing und Dynamic ARP Inspection (snw3-2) */
FIG["snw-fig-arp"] = { title: "ARP-Spoofing als Man-in-the-Middle und wie DAI es stoppt",
  svg: () => svg(640, 300,
    laptop(80, 120) + tl(80, 160, "PC Anna|10.0.0.10 · MAC AA", { fs: 11, lh: 14 }) +
    sw(320, 120, "Switch") +
    box(510, 98, 110, 44, "Gateway", { cls: "fx-card", sub: "10.0.0.1 · MAC GG", fs: 12 }) +
    laptop(320, 250) + tl(400, 250, "Angreifer|10.0.0.66 · MAC EE", { fs: 11, lh: 14, a: "start", cls: "t-bad" }) +
    l(104, 120, 272, 120, { cls: "acc" }) + l(368, 120, 508, 120, { cls: "acc" }) + l(320, 140, 320, 232, { cls: "thin" }) +
    g({ on: "0,4" }, dot("M104 116 L272 116 L368 116 L508 116", { dur: 2 })) +
    g({ on: "0" }, box(18, 196, 150, 48, "ARP-Cache Anna:|10.0.0.1 → GG", { cls: "fx-ok", fs: 11, lh: 14 })) +
    g({ on: "1,2" }, box(18, 196, 150, 48, "ARP-Cache Anna:|10.0.0.1 → EE", { cls: "fx-bad", fs: 11, lh: 14 })) +
    g({ on: "1" }, p("M306 236 C 240 200 160 170 104 136", { cls: "bad dash", arrow: true }) + box(150, 56, 200, 30, "ARP-Reply: „10.0.0.1 ist EE“", { cls: "fx-bad", fs: 11 })) +
    g({ on: "2" }, dot("M104 124 L300 124 L316 232", { dur: 2, cls: "fx-bad" }) + dot("M324 232 L340 124 L508 124", { dur: 2, begin: 1, cls: "fx-bad" }) + t(470, 200, "Anna → Angreifer → Gateway", { fs: 11.5, fw: 600, cls: "t-bad" }) + t(470, 216, "Mitlesen und Manipulieren", { fs: 11, cls: "fx-sub" })) +
    g({ on: "3" }, p("M306 236 L330 150", { cls: "bad dash" }) + xmark(326, 170) + box(380, 160, 240, 62, "DAI prüft gegen die DHCP-|Snooping-Binding-Tabelle:|10.0.0.66 ↔ EE, nicht 10.0.0.1", { cls: "fx-warn", fs: 11, lh: 14 }) + t(160, 70, "gefälschter ARP-Reply wird verworfen", { fs: 12, fw: 700, cls: "t-ok" })) +
    g({ on: "4" }, box(18, 196, 150, 48, "ARP-Cache Anna:|10.0.0.1 → GG", { cls: "fx-ok", fs: 11, lh: 14 }) + box(380, 170, 240, 48, "Port des Angreifers: untrusted,|Log-Eintrag, ggf. err-disabled", { cls: "fx-soft", fs: 11, lh: 14 }))),
  steps: [
    "Normalbetrieb: Anna kennt per ARP die MAC des Gateways (GG). Ihr Verkehr ins Internet geht über den Switch direkt zum Gateway.",
    "Der Angreifer verschickt ungefragt ARP-Replies: „10.0.0.1 ist bei MAC EE“. ARP prüft nichts, Anna überschreibt ihren Cache (<b>ARP-Poisoning</b>).",
    "Jetzt schickt Anna alles an den Angreifer. Er leitet es weiter, damit niemand etwas merkt, und liest dabei mit: ein klassischer <b>Man-in-the-Middle</b>.",
    "Mit <b>Dynamic ARP Inspection</b> vergleicht der Switch jedes ARP-Paket auf untrusted Ports mit der Binding-Tabelle aus <b>DHCP Snooping</b>. Die IP 10.0.0.1 gehört nicht zur MAC EE, also wird das Paket verworfen.",
    "Annas Cache bleibt korrekt. Zusätzlich begrenzt DAI die ARP-Rate pro Port. Statische Geräte ohne DHCP brauchen eine ARP-ACL, sonst blockiert DAI auch sie."
  ] };

/* B · 802.1X-Ablauf (snw3-3) */
FIG["snw-fig-dot1x"] = { title: "802.1X: Vom Einstecken bis zum freigeschalteten Port",
  svg: () => svg(640, 290,
    laptop(70, 120) + t(70, 156, "Supplicant", { fs: 12, fw: 700 }) + t(70, 172, "Laptop mit 802.1X-Client", { fs: 10.5, cls: "fx-sub" }) +
    sw(300, 120, "Authenticator") + t(300, 172, "Switch / WLAN-AP", { fs: 10.5, cls: "fx-sub" }) +
    server(540, 128) + t(540, 156, "Authentication Server", { fs: 12, fw: 700 }) + t(540, 172, "RADIUS (z. B. NPS, ISE)", { fs: 10.5, cls: "fx-sub" }) +
    l(96, 120, 252, 120, { cls: "thin" }) + l(348, 120, 512, 120, { cls: "thin" }) +
    g({ on: "0" }, lock(178, 104, { cls: "bad" }) + t(178, 78, "Port unautorisiert:", { fs: 11, fw: 600, cls: "t-bad" }) + t(178, 92, "nur EAPoL erlaubt", { fs: 11, cls: "fx-sub" })) +
    g({ on: "1" }, p("M252 108 L98 108", { cls: "acc", arrow: true, acc: true }) + t(175, 100, "EAP-Request/Identity", { fs: 11 }) + p("M98 132 L252 132", { cls: "acc", arrow: true, acc: true }) + t(175, 148, "EAP-Response: anna@firma", { fs: 11 }) + t(175, 66, "Layer 2: EAP over LAN", { fs: 11.5, fw: 700, cls: "t-acc" })) +
    g({ on: "2" }, p("M348 108 L510 108", { cls: "acc", arrow: true, acc: true }) + t(430, 100, "RADIUS Access-Request", { fs: 11 }) + t(430, 66, "EAP verpackt in RADIUS (UDP 1812)", { fs: 11.5, fw: 700, cls: "t-acc" }) + box(462, 196, 160, 48, "prüft Zertifikat / Login|gegen Verzeichnis (AD)", { cls: "fx-soft", fs: 11, lh: 14 })) +
    g({ on: "3" }, p("M510 132 L350 132", { cls: "ok", arrow: true }) + t(430, 148, "Access-Accept + VLAN 20", { fs: 11, fw: 600, cls: "t-ok" }) + box(190, 200, 220, 48, "Port autorisiert:|Anna landet in VLAN 20", { cls: "fx-ok", fs: 11.5, lh: 15 }) + dot("M96 124 L252 124", { dur: 1.4, cls: "fx-ok" })) +
    g({ on: "4" }, p("M510 132 L350 132", { cls: "bad", arrow: true }) + t(430, 148, "Access-Reject / nicht konform", { fs: 11, fw: 600, cls: "t-bad" }) + box(150, 200, 300, 48, "Gast- oder Quarantäne-VLAN:|nur Internet bzw. Update-Server", { cls: "fx-warn", fs: 11.5, lh: 15 }))),
  steps: [
    "Ein Laptop wird angesteckt. Der Switchport ist zunächst <b>unautorisiert</b>: Nur EAP-Pakete (EAP over LAN) dürfen durch, sonst nichts, auch kein DHCP.",
    "Der <b>Authenticator</b> (Switch) fragt nach der Identität, der <b>Supplicant</b> antwortet. Das passiert auf Layer 2, der Laptop hat noch keine IP.",
    "Der Switch entscheidet nicht selbst. Er verpackt EAP in RADIUS und fragt den <b>Authentication Server</b>. Dieser prüft Zertifikat oder Benutzerdaten, z. B. per EAP-TLS gegen das Active Directory.",
    "Bei Erfolg kommt <b>Access-Accept</b>, oft mit einem VLAN-Attribut. Der Port wird freigeschaltet, der Laptop landet im richtigen Segment.",
    "Scheitert die Anmeldung oder ist das Gerät nicht konform (NAC-Posture, z. B. Virenschutz veraltet), landet es im Gast- oder Quarantäne-VLAN. Geräte ohne Supplicant (Drucker) nutzen oft MAB, also die MAC als schwachen Ersatz."
  ] };

/* C · Stateful Firewall (snw4-1) */
FIG["snw-fig-stateful"] = { title: "Stateful Inspection: die State-Tabelle merkt sich Verbindungen",
  svg: () => svg(640, 300,
    laptop(64, 92) + tl(64, 128, "Client|10.0.0.5", { fs: 11, lh: 14 }) +
    r(266, 48, 72, 92, { cls: "fx-info", rx: 8 }) + tl(302, 94, "Stateful|Firewall", { fs: 11.5, fw: 700, lh: 15 }) +
    server(560, 100) + tl(560, 128, "Webserver|93.184.216.34", { fs: 11, lh: 14 }) +
    user(560, 230, { cls: "bad" }) + t(560, 262, "Angreifer", { fs: 11, cls: "t-bad", fw: 600 }) +
    l(90, 92, 264, 92, { cls: "thin" }) + l(340, 92, 530, 92, { cls: "thin" }) +
    box(18, 196, 360, 74, "", { cls: "fx-card" }) + t(30, 214, "State-Tabelle", { a: "start", fs: 11.5, fw: 700 }) +
    g({ st: 1 }, t(30, 236, "TCP 10.0.0.5:51000 ↔ 93.184.216.34:443", { a: "start", fs: 11 }) + t(30, 254, "Zustand: SYN gesendet → ESTABLISHED", { a: "start", fs: 11, cls: "fx-sub" })) +
    g({ on: "4" }, r(24, 222, 348, 40, { cls: "fx-mute", rx: 4 }) + t(198, 246, "Eintrag gelöscht (FIN / Timeout)", { fs: 11, fw: 600 })) +
    g({ on: "0,1" }, p("M92 84 L264 84 M340 84 L528 84", { cls: "acc", arrow: true, acc: true }) + t(180, 74, "SYN → Port 443", { fs: 11, fw: 600 }) + t(440, 74, "Regel: inside → any tcp 443", { fs: 10.5, cls: "t-ok" })) +
    g({ on: "2" }, p("M528 100 L340 100 M264 100 L92 100", { cls: "ok", arrow: true }) + t(440, 116, "SYN/ACK zurück", { fs: 11, fw: 600 }) + t(180, 116, "passt zur Tabelle: erlaubt", { fs: 11, cls: "t-ok", fw: 600 })) +
    g({ on: "3" }, p("M540 222 L344 128", { cls: "bad dash", arrow: true }) + xmark(352, 140) + box(394, 150, 236, 48, "ACK an 10.0.0.5:51000 von 6.6.6.6|kein passender Eintrag: Drop", { cls: "fx-bad", fs: 10.5, lh: 14 }))),
  steps: [
    "Der Client öffnet eine HTTPS-Verbindung. Die Regel „inside darf TCP 443 nach außen“ erlaubt das erste Paket (SYN).",
    "Die Firewall legt einen Eintrag in der <b>State-Tabelle</b> an: 5-Tuple plus TCP-Zustand.",
    "Die Antwort des Servers passt exakt zum Eintrag (vertauschte Adressen und Ports). Sie darf zurück, ohne dass eine eigene Regel für den Rückweg nötig ist.",
    "Ein Angreifer schickt ein Paket mit gesetztem ACK-Flag an den Client. Ein stateless Paketfilter mit <code>established</code> würde es durchlassen, weil nur das Flag geprüft wird. Die Stateful Firewall findet keinen passenden Eintrag und verwirft es.",
    "Nach FIN/RST oder Timeout wird der Eintrag gelöscht. Spätere Pakete zu dieser Verbindung sind wieder unbekannt."
  ] };

/* D · ACL first match (snw4-3) */
const ACL = ["10 permit ip host 10.0.0.100 any", "20 permit tcp 10.0.0.0 0.0.0.255 host 192.168.0.2 eq 8080", "30 permit udp 10.0.0.0 0.0.0.255 any eq 53", "40 deny ip any any log", "(implizit) deny any"];
const PK = [["10.0.0.100 → 8.8.8.8", "TCP 443", 0, true], ["10.0.0.23 → 192.168.0.2", "TCP 8080", 1, true], ["10.0.0.23 → 1.1.1.1", "UDP 53", 2, true], ["10.0.0.23 → 1.1.1.1", "TCP 443", 3, false]];
FIG["snw-fig-acl"] = { title: "ACL-Abarbeitung: von oben nach unten, der erste Treffer entscheidet",
  svg: () => svg(640, 290,
    t(16, 26, "ACL am Inside-Interface (eingehend)", { a: "start", fs: 12, fw: 700 }) +
    ACL.map((s, i) => g({}, r(196, 40 + i * 42, 430, 34, { cls: i === 4 ? "fx-mute" : "fx-card", rx: 6 }) + t(206, 62 + i * 42, s, { a: "start", fs: 11.5, fw: 600 }))).join("") +
    PK.map(([a, b, hit, ok], k) => g({ on: String(k) },
      box(14, 110, 160, 56, a + "|" + b, { cls: "fx-soft", fs: 11, lh: 15 }) + t(94, 98, "Paket " + (k + 1), { fs: 11.5, fw: 700 }) +
      [...Array(hit).keys()].map(i => r(196, 40 + i * 42, 430, 34, { cls: "fx-ghost", rx: 6 }) + t(612, 62 + i * 42, "kein Treffer", { a: "end", fs: 10.5, cls: "fx-sub" })).join("") +
      r(196, 40 + hit * 42, 430, 34, { cls: ok ? "fx-dashacc" : "fx-dashacc", rx: 6 }) + t(612, 62 + hit * 42, ok ? "TREFFER: permit" : "TREFFER: deny + log", { a: "end", fs: 11, fw: 700, cls: ok ? "t-ok" : "t-bad" }) +
      p(`M174 138 C 186 138 186 ${57 + hit * 42} 194 ${57 + hit * 42}`, { cls: ok ? "ok" : "bad", arrow: true }) +
      t(94, 190, ok ? "durchgelassen" : "verworfen", { fs: 12, fw: 700, cls: ok ? "t-ok" : "t-bad" }))).join("") +
    g({ on: "4" }, box(14, 100, 160, 76, "Ausnahme unter|das deny geschoben?|Dann nie erreicht!", { cls: "fx-warn", fs: 11, lh: 15 }) + r(196, 40, 430, 34, { cls: "fx-dashacc", rx: 6 }) + t(612, 62, "gehört nach oben", { a: "end", fs: 11, fw: 700, cls: "t-warn" }))),
  steps: [
    "Paket 1 von Host 10.0.0.100 trifft gleich Zeile 10. Die Prüfung endet sofort, das Paket darf durch, egal welcher Port.",
    "Paket 2 passt nicht zu Zeile 10 (anderer Host), aber zu Zeile 20: Client-Netz zum Proxy auf TCP 8080. Erlaubt.",
    "Paket 3 ist eine DNS-Anfrage. Ohne Zeile 30 könnte der Browser keine Namen auflösen. Das ist der häufigste Punkteverlust in der Prüfung.",
    "Paket 4 (direktes HTTPS ohne Proxy) passt zu keiner Erlaubnis und landet bei <code>deny ip any any log</code>. Es wird verworfen und protokolliert. Ohne das explizite deny würde das implizite deny greifen, aber nichts loggen.",
    "Merke: Ausnahmen und spezifische Regeln zuerst. Stünde Zeile 10 unter Zeile 40, würde Host 10.0.0.100 nie erreicht, weil das deny vorher trifft."
  ] };

/* E · DMZ zweistufig (snw4-4) */
FIG["snw-fig-dmz"] = { title: "Zweistufige DMZ: welche Wege offen sind und welche nicht",
  svg: () => svg(640, 300,
    FX.cloud(64, 140, 1.5) + t(64, 144, "Internet", { fs: 12, fw: 700 }) +
    r(150, 96, 46, 96, { cls: "fx-info", rx: 6 }) + tl(173, 144, "FW|außen", { fs: 11, fw: 700, lh: 14 }) + t(173, 210, "Hersteller A", { fs: 10, cls: "fx-sub" }) +
    r(220, 40, 180, 210, { cls: "fx-warn", rx: 10 }) + t(310, 60, "DMZ", { fs: 13, fw: 700 }) +
    box(242, 76, 136, 40, "Webserver :443", { cls: "fx-card", fs: 11.5 }) + box(242, 128, 136, 40, "Mail-Relay :25", { cls: "fx-card", fs: 11.5 }) + box(242, 180, 136, 40, "Reverse Proxy", { cls: "fx-card", fs: 11.5 }) +
    r(424, 96, 46, 96, { cls: "fx-info", rx: 6 }) + tl(447, 144, "FW|innen", { fs: 11, fw: 700, lh: 14 }) + t(447, 210, "Hersteller B", { fs: 10, cls: "fx-sub" }) +
    r(494, 40, 132, 210, { cls: "fx-ok", rx: 10 }) + t(560, 60, "internes LAN", { fs: 12.5, fw: 700 }) +
    laptop(530, 110) + laptop(590, 110) + FX.db(560, 190) + t(560, 226, "ERP-Datenbank", { fs: 10.5 }) +
    g({ on: "1" }, p("M96 134 L148 134 M198 112 L240 98", { cls: "ok", arrow: true }) + dot("M96 130 L148 130 L198 110 L240 96", { dur: 1.6, cls: "fx-ok" }) + t(310, 276, "Internet → Webserver TCP 443: erlaubt", { fs: 12, fw: 700, cls: "t-ok" })) +
    g({ on: "2" }, p("M96 150 L146 150", { cls: "bad dash", arrow: true }) + xmark(172, 150) + t(310, 276, "Internet → LAN direkt: an der äußeren Firewall blockiert", { fs: 12, fw: 700, cls: "t-bad" })) +
    g({ on: "3" }, box(242, 76, 136, 40, "Webserver gehackt", { cls: "fx-bad", fs: 11.5 }) + p("M378 104 L420 134", { cls: "bad dash", arrow: true }) + xmark(447, 140) + t(310, 276, "DMZ → LAN: innere Firewall verbietet den Verbindungsaufbau", { fs: 12, fw: 700, cls: "t-bad" })) +
    g({ on: "4" }, p("M510 120 L472 140 M422 150 L380 198", { cls: "acc", arrow: true, acc: true }) + p("M240 200 L198 170 M148 160 L100 156", { cls: "acc", arrow: true, acc: true }) + t(310, 276, "LAN → Proxy (DMZ) → Internet: kontrolliert erlaubt", { fs: 12, fw: 700, cls: "t-acc" }))),
  steps: [
    "Aufbau: äußere Firewall zwischen Internet und DMZ, innere Firewall zwischen DMZ und LAN. Idealerweise von zwei Herstellern, damit ein einzelner Exploit nicht beide überwindet.",
    "Öffentliche Dienste sind erreichbar: Die äußere Firewall lässt nur die nötigen Ports zu, z. B. TCP 443 zum Webserver.",
    "Das interne LAN ist von außen nie direkt erreichbar. Eingehende Verbindungen ins LAN werden schon außen verworfen.",
    "Ernstfall: Der Webserver wird kompromittiert. Der Angreifer kommt trotzdem nicht ins LAN, weil die innere Firewall Verbindungsaufbau aus der DMZ verbietet. Das ist <b>Defense in Depth</b>.",
    "Aus dem LAN geht es kontrolliert hinaus, z. B. über den Proxy in der DMZ. Achtung: Zwei Firewalls in Serie erhöhen die Sicherheit, aber nicht die Verfügbarkeit. Dafür braucht jede Stufe einen Cluster."
  ] };

/* F · IPSec Transport vs. Tunnel Mode (snw5-3) */
const seg = (x, y, w, lab, cls, o = {}) => box(x, y, w, 30, lab, Object.assign({ cls, fs: 10.5, rx: 4 }, o));
FIG["snw-fig-ipsec"] = { title: "IPSec ESP: Transport Mode und Tunnel Mode im Paket",
  svg: () => svg(640, 290,
    t(14, 30, "Original", { a: "start", fs: 12, fw: 700 }) +
    seg(110, 14, 150, "IP 10.1.1.5 → 10.2.2.9", "fx-card") + seg(262, 14, 70, "TCP", "fx-card") + seg(334, 14, 150, "Daten", "fx-card") +
    g({ st: 1 }, t(14, 100, "Transport", { a: "start", fs: 12, fw: 700 }) +
      seg(110, 84, 150, "IP 10.1.1.5 → 10.2.2.9", "fx-card") + seg(262, 84, 56, "ESP", "fx-info") + seg(320, 84, 60, "TCP", "fx-acc") + seg(382, 84, 120, "Daten", "fx-acc") + seg(504, 84, 60, "Trailer", "fx-acc") + seg(566, 84, 56, "ICV", "fx-info") +
      t(440, 130, "verschlüsselt", { fs: 10.5, cls: "t-acc", fw: 600 }) + t(200, 130, "Original-Header bleibt sichtbar", { fs: 10.5, cls: "fx-sub" })) +
    g({ st: 2 }, t(14, 180, "Tunnel", { a: "start", fs: 12, fw: 700 }) +
      seg(84, 164, 120, "IP GW1 → GW2", "fx-warn") + seg(206, 164, 46, "ESP", "fx-info") + seg(254, 164, 120, "IP 10.1.1.5→10.2.2.9", "fx-acc") + seg(376, 164, 46, "TCP", "fx-acc") + seg(424, 164, 82, "Daten", "fx-acc") + seg(508, 164, 60, "Trailer", "fx-acc") + seg(570, 164, 56, "ICV", "fx-info") +
      t(410, 210, "inneres Paket komplett verschlüsselt", { fs: 10.5, cls: "t-acc", fw: 600 }) + t(144, 210, "neuer öffentlicher Header", { fs: 10.5, cls: "fx-sub" })) +
    g({ st: 3 }, box(84, 236, 120, 30, "+ UDP 4500", { cls: "fx-warn", fs: 10.5, rx: 4 }) + t(220, 256, "NAT-Traversal: ESP in UDP verpackt, damit NAT/PAT die Pakete übersetzen kann", { a: "start", fs: 11, cls: "fx-sub" })) +
    g({ st: 4 }, r(84, 156, 542, 46, { cls: "fx-dashacc", rx: 6 }) + t(360, 150, "ICV sichert ESP-Header + verschlüsselten Teil (Integrität, Authentizität)", { fs: 10.5, fw: 600, cls: "t-acc" }))),
  steps: [
    "Ausgangspunkt: ein normales IP-Paket von 10.1.1.5 an 10.2.2.9 mit TCP und Nutzdaten.",
    "<b>Transport Mode</b> (Host zu Host): Zwischen IP-Header und TCP kommt der ESP-Header, TCP und Daten werden verschlüsselt. Die echten Adressen bleiben sichtbar.",
    "<b>Tunnel Mode</b> (Site-to-Site): Das <b>ganze</b> Originalpaket inklusive interner Adressen wird verschlüsselt und in ein neues IP-Paket zwischen den Gateways gepackt. Für die Hosts ist das transparent.",
    "Liegt NAT dazwischen, verpackt IPSec ESP zusätzlich in <b>UDP 4500</b> (NAT-T). Firewall-Freigaben für IPSec: UDP 500 (IKE), UDP 4500, IP-Protokoll 50 (ESP).",
    "Das ICV (Integrity Check Value) am Ende sichert den ESP-Teil. AH würde zusätzlich den äußeren IP-Header schützen und verträgt sich deshalb nicht mit NAT."
  ] };

/* ======================= LEKTIONEN ======================= */
const EX = (title, html) => ({ t: "example", label: "Beispiel durchgerechnet", title, html });
const PR = (title, html) => ({ t: "example", label: "Beispiel aus der Praxis", title, html });
const CK = (q, opts, a, why) => ({ t: "check", q, opts, a, why });

const blocks = {
  "snw1-1": [
    { t: "calc", id: "snw-risk" },
    EX("Ransomware beim Steuerberater: lohnt sich ein Offline-Backup?", `Eine Kanzlei mit 25 Mitarbeitenden bewertet ihre Mandantendaten samt Betrieb mit <b>AV = 400.000 €</b>. Bei einem Ransomware-Vorfall gehen erfahrungsgemäß rund <b>50 %</b> des Werts verloren (Stillstand, Wiederherstellung, Strafen): <b>EF = 50 %</b>.<ol>
      <li>SLE = 400.000 € · 0,5 = <b>200.000 €</b> pro Vorfall</li>
      <li>Die Branche rechnet mit einem Vorfall alle fünf Jahre: ARO = 0,2 → ALE = 200.000 € · 0,2 = <b>40.000 € pro Jahr</b></li>
      <li>Maßnahme: unveränderliches Offline-Backup plus EDR für 12.000 € pro Jahr senkt die Häufigkeit eines schweren Schadens um 80 % → ALE = 8.000 €</li>
      <li>Nutzen = 40.000 − 8.000 − 12.000 = <b>20.000 € pro Jahr</b></li></ol>
      Die Maßnahme rechnet sich. Was übrig bleibt (8.000 €/Jahr), ist das <b>Restrisiko</b>, das die Geschäftsführung bewusst trägt oder versichert.`),
    CK("Ein Asset ist 100.000 € wert, ein Vorfall vernichtet 30 % davon und tritt im Schnitt alle zwei Jahre auf. Wie hoch ist die jährliche Verlusterwartung (ALE)?", ["30.000 €", "15.000 €", "60.000 €", "50.000 €"], 1, "SLE = 100.000 · 0,3 = 30.000 €; ARO = 0,5 → ALE = 15.000 € pro Jahr.")
  ],
  "snw1-2": [
    EX("CVSS 3.1 Base Score selbst ausrechnen: 9,8", `Ein Webserver hat eine Lücke mit dem Vektor <code>AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H</code>: über das Netz (N), ohne Hürden (L), ohne Rechte (N), ohne Mitwirkung eines Users (N), Scope unverändert, volle Auswirkung auf C, I und A.<ol>
      <li>Impact-Teilwert: ISS = 1 − (1 − 0,56)³ = 1 − 0,44³ = <b>0,9148</b> (H = 0,56)</li>
      <li>Impact = 6,42 · 0,9148 = <b>5,873</b> (Scope unverändert)</li>
      <li>Exploitability = 8,22 · AV 0,85 · AC 0,77 · PR 0,85 · UI 0,85 = <b>3,887</b></li>
      <li>Base Score = aufrunden(5,873 + 3,887) = aufrunden(9,760) = <b>9,8 → Critical</b></li></ol>
      Wäre für den Angriff ein Klick des Users nötig (UI:R = 0,62), sinkt die Exploitability auf 2,835 und der Score auf <b>8,8 (High)</b>. Du musst die Gewichte nicht auswendig können, aber verstehen: <b>Netzwerk-erreichbar, ohne Login, ohne User-Interaktion</b> treibt den Score nach oben.`),
    PR("Patch-Reihenfolge am Montagmorgen", `Drei neue CVEs im Wochenbericht: <b>A</b> CVSS 9,8 in einer Bibliothek auf einem isolierten Testserver ohne Netzzugang · <b>B</b> CVSS 7,5 im VPN-Gateway, steht auf der Liste aktiv ausgenutzter Lücken (CISA KEV) · <b>C</b> CVSS 5,3 in einem internen Druckerdienst.<br>Richtige Reihenfolge: <b>B vor A vor C</b>. Der Base Score sagt nur, wie schwer eine Lücke technisch ist. Für die Priorisierung zählen zusätzlich <b>Erreichbarkeit</b>, <b>Kritikalität des Assets</b> und <b>aktive Ausnutzung</b>.`)
  ],
  "snw1-3": [
    PR("CIA in einer Arztpraxis: je eine technische und eine organisatorische Lösung", `<table class='dt'><tr><th>Schutzziel</th><th>Risiko in der Praxis</th><th>technisch</th><th>organisatorisch</th></tr>
      <tr><td>Vertraulichkeit</td><td>Befunde landen beim falschen Empfänger</td><td>verschlüsselter Befundversand, BitLocker auf Laptops</td><td>Berechtigungskonzept: Empfang sieht keine Diagnosen</td></tr>
      <tr><td>Integrität</td><td>Dosierung im Rezept wird unbemerkt geändert</td><td>signierte E-Rezepte, Audit-Log in der Praxissoftware</td><td>Vier-Augen-Prinzip bei Medikationsänderungen</td></tr>
      <tr><td>Verfügbarkeit</td><td>Server fällt Montag 8 Uhr aus</td><td>USV, gespiegelte Platten, tägliches Backup</td><td>Notfallplan mit Papierformularen, Wartungsvertrag mit 4-h-Reaktion</td></tr></table>
      So holst du die vollen Punkte: Begriff, ein Satz Erklärung, dann je eine passende Maßnahme der verlangten Art.`),
    CK("Ein Angreifer ändert in einer abgefangenen Überweisung unbemerkt die IBAN. Welches Schutzziel ist primär verletzt?", ["Vertraulichkeit", "Verfügbarkeit", "Integrität", "Accounting"], 2, "Die Daten wurden unbefugt verändert. Gegenmittel: Signatur/MAC (technisch) bzw. Rückruf über bekannte Nummer (organisatorisch).")
  ],
  "snw1-4": [
    { t: "calc", id: "snw-brute" },
    EX("Passwortlänge schlägt Komplexität", `Ein Angreifer erbeutet NTLM-Hashes und schafft offline 10<sup>10</sup> Versuche pro Sekunde.<ul>
      <li><b>8 Zeichen, nur Kleinbuchstaben</b>: 26<sup>8</sup> ≈ 2,1 · 10<sup>11</sup> → im Mittel 2,1 · 10<sup>11</sup> / (2 · 10<sup>10</sup>) ≈ <b>10 Sekunden</b></li>
      <li><b>8 Zeichen, alle 94 Zeichen</b>: 94<sup>8</sup> ≈ 6,1 · 10<sup>15</sup> → ≈ 3,05 · 10<sup>5</sup> s ≈ <b>3,5 Tage</b></li>
      <li><b>14 Zeichen, nur Kleinbuchstaben</b> (Passphrase): 26<sup>14</sup> ≈ 6,5 · 10<sup>19</sup> → ≈ 3,2 · 10<sup>9</sup> s ≈ <b>100 Jahre</b></li></ul>
      Jedes zusätzliche Zeichen multipliziert den Aufwand mit N. Trotzdem: Gegen Phishing hilft keine Länge, denn dort wird das Passwort einfach abgefangen. Darum <b>2FA</b> mit einem zweiten, unabhängigen Faktor.`)
  ],
  "snw1-5": [
    PR("Inventar trifft CVE: drei Zeilen, die eine Entscheidung tragen", `Auszug aus der CMDB eines Logistikunternehmens:<table class='dt'><tr><th>Asset</th><th>Software</th><th>Owner</th><th>Kritikalität</th><th>Erreichbar</th></tr>
      <tr><td>fw-edge-01</td><td>FortiOS 7.2.4</td><td>Netzwerkteam</td><td>hoch</td><td>Internet</td></tr>
      <tr><td>srv-erp-02</td><td>Windows Server 2019</td><td>ERP-Team</td><td>hoch</td><td>intern</td></tr>
      <tr><td>lab-pi-07</td><td>Raspbian, nginx 1.18</td><td>?</td><td>niedrig</td><td>Gäste-WLAN (!)</td></tr></table>
      Eine kritische FortiOS-Lücke betrifft sofort <b>fw-edge-01</b>: Owner und Version sind bekannt, Patch am selben Tag. Die dritte Zeile zeigt zwei Befunde ohne jede CVE: <b>kein Owner</b> und ein Gerät im falschen Segment. Genau das findet man nur mit gepflegtem Inventar.`),
    CK("Welcher Eintrag im Asset-Inventar ermöglicht es, eine neu veröffentlichte CVE den betroffenen Systemen zuzuordnen?", ["Anschaffungspreis", "Software-Version", "Farbe des Gehäuses", "Name des Lieferanten"], 1, "CVEs beschreiben betroffene Produkte und Versionen. Ohne Versionsstand im Inventar bleibt nur Raten.")
  ],
  "snw2-1": [
    { t: "calc", id: "snw-voip" },
    EX("Ein G.711-Gespräch braucht nicht 64, sondern 87,2 kbit/s", `<ol><li>Codec G.711: 64 kbit/s, alle 20 ms ein Paket → Nutzdaten = 64.000 · 0,02 / 8 = <b>160 Byte</b></li>
      <li>Header: RTP 12 + UDP 8 + IP 20 + Ethernet 18 = <b>58 Byte</b> → Paket = 218 Byte</li>
      <li>50 Pakete pro Sekunde · 218 Byte · 8 = <b>87.200 bit/s = 87,2 kbit/s</b> pro Richtung</li>
      <li>Eine 10-Mbit/s-Leitung trägt damit rechnerisch 114 Gespräche, mit 25 % Reserve rund 85.</li></ol>
      Mit TCP statt UDP kämen 12 Byte mehr Header dazu, vor allem aber Neuübertragungen: Ein verlorenes Paket kommt erst an, wenn es niemand mehr hören will. Deshalb nutzt Echtzeit-Sprache UDP.`),
    CK("Wie ändert sich das 5-Tuple der Antwort des Webservers auf eine Client-Anfrage (TCP, 10.0.0.5:51000 → 1.2.3.4:443)?", ["Es bleibt identisch", "Protokoll wird UDP", "Quelle und Ziel tauschen: 1.2.3.4:443 → 10.0.0.5:51000", "Nur die Ports tauschen"], 2, "Die Antwort läuft in Gegenrichtung: Quell- und Zieladresse sowie Quell- und Zielport sind vertauscht, das Protokoll bleibt TCP.")
  ],
  "snw2-2": [
    EX("NetFlow-Auswertung: Scan und Datenabfluss erkennen", `Ausschnitt aus Flow-Records einer Nacht:<table class='dt'><tr><th>Zeit</th><th>Quelle</th><th>Ziel</th><th>Proto/Port</th><th>Bytes</th><th>Dauer</th></tr>
      <tr><td>02:10</td><td>10.0.5.33</td><td>10.0.1.1 … 10.0.1.254</td><td>TCP 445</td><td>je 60</td><td>&lt; 1 s</td></tr>
      <tr><td>03:00</td><td>10.0.2.15</td><td>185.220.x.x</td><td>TCP 443</td><td>9 GB</td><td>30 min</td></tr></table>
      <b>Zeile 1</b>: ein Host, 254 Ziele, immer Port 445, winzige Flows → <b>horizontaler Scan</b> (z. B. Wurm, der SMB sucht).<br>
      <b>Zeile 2</b>: Durchsatz = 9 GB · 8 / 1.800 s = 72.000 Mbit / 1.800 s = <b>40 Mbit/s</b> über eine halbe Stunde, nachts, zu einer unbekannten Adresse → Verdacht auf <b>Datenabfluss</b>.<br>
      NetFlow sieht dabei keinen Inhalt, nur Metadaten. Gerade weil der Verkehr verschlüsselt ist (443), sind Menge, Uhrzeit und Gegenstelle die einzigen Hinweise.`),
    CK("Ein nmap-SYN-Scan erhält auf Port 23 ein RST zurück. Was bedeutet das?", ["Der Port ist offen", "Der Port ist geschlossen, der Host ist aber erreichbar", "Eine Firewall filtert den Port stillschweigend", "Der Host ist ausgeschaltet"], 1, "SYN/ACK = offen, RST = geschlossen, keine Antwort = gefiltert (oder Host nicht erreichbar).")
  ],
  "snw3-1": [
    { t: "calc", id: "snw-cam" },
    EX("MAC-Flooding in 3,3 Sekunden", `Ein Access-Switch hat eine CAM-Tabelle mit <b>8.192</b> Einträgen, davon sind 600 legitim belegt. Ein Flooding-Tool erzeugt <b>2.500</b> gefälschte MACs pro Sekunde.<ol>
      <li>frei: 8.192 − 600 = 7.592 Einträge</li><li>Zeit bis voll: 7.592 / 2.500 = <b>≈ 3 Sekunden</b></li>
      <li>Danach kennt der Switch neue Ziel-MACs nicht mehr und flutet die Frames an alle Ports des VLANs. Der Angreifer sieht fremden Verkehr wie an einem Hub.</li></ol>
      Mit <code>switchport port-security maximum 2</code> lernt der Switch am Angreiferport höchstens 2 MACs. Der dritte Absender löst die Violation aus, im Modus <b>shutdown</b> ist der Port sofort err-disabled.`),
    CK("Ein Angreifer verschickt massenhaft DHCP-Discover mit wechselnden MACs, bis der Adresspool leer ist. Wie heißt der Angriff?", ["ARP-Poisoning", "DHCP-Starvation", "VLAN-Hopping", "MAC-Spoofing des Gateways"], 1, "Danach kann ein Rogue-DHCP-Server einspringen. Gegenmittel: Port Security und DHCP Snooping mit Rate-Limit.")
  ],
  "snw3-2": [
    { t: "fig", id: "snw-fig-arp" },
    PR("Ein Access-Switch, vier Schutzfunktionen", `Konfiguration eines Cisco-Access-Switches (VLAN 10 Clients, Gi0/24 Uplink zum DHCP-Server):<pre><code>ip dhcp snooping
ip dhcp snooping vlan 10
ip arp inspection vlan 10
interface range gi0/1 - 23
 switchport mode access
 switchport access vlan 10
 switchport port-security
 switchport port-security maximum 2
 switchport port-security violation restrict
 ip dhcp snooping limit rate 10
 ip verify source
interface gi0/24
 ip dhcp snooping trust
 ip arp inspection trust</code></pre>
      Test: Ein Kollege steckt einen privaten WLAN-Router an Gi0/7, dessen DHCP-Server anspringt. Seine DHCP-Offers kommen auf einem <b>untrusted</b> Port an und werden verworfen. Ohne DHCP Snooping hätten Clients das falsche Gateway bekommen.`)
  ],
  "snw3-3": [
    { t: "fig", id: "snw-fig-dot1x" },
    PR("Ein Tag mit 802.1X im Büro", `<ul><li><b>08:02</b> Lisa dockt ihr Firmen-Notebook an. EAP-TLS mit Maschinenzertifikat → Access-Accept, VLAN 20 (Verwaltung).</li>
      <li><b>09:15</b> Ein Besucher steckt seinen Laptop in die Dose im Besprechungsraum. Kein Supplicant, keine Antwort → nach Timeout <b>Gast-VLAN</b> mit Internet only.</li>
      <li><b>11:40</b> Der Netzwerkdrucker kann kein 802.1X. Er wird per <b>MAB</b> anhand seiner MAC in VLAN 40 gelassen. Risiko: MACs lassen sich fälschen, deshalb darf VLAN 40 nur den Druckserver erreichen.</li>
      <li><b>14:30</b> Marcos Laptop hat seit 30 Tagen keine Virensignaturen geladen. Die NAC-Posture-Prüfung schlägt fehl → <b>Quarantäne-VLAN</b> mit Zugriff nur auf den Update-Server, danach neue Prüfung.</li></ul>`)
  ],
  "snw3-4": [
    { t: "calc", id: "snw-subnet" },
    EX("10.10.30.77/26 Schritt für Schritt", `<ol><li>/26 → Maske 255.255.255.192, im letzten Oktett 6 Hostbits → Blockgröße 2<sup>6</sup> = <b>64</b></li>
      <li>Blöcke im letzten Oktett: 0, 64, 128, 192. Die 77 liegt im Block <b>64–127</b>.</li>
      <li>Netz <b>10.10.30.64</b>, Broadcast <b>10.10.30.127</b>, Hosts .65 bis .126 = <b>62</b></li>
      <li>Wildcard = 255.255.255.255 − 255.255.255.192 = <b>0.0.0.63</b></li>
      <li>ACL-Zeile, die genau dieses Segment erlaubt: <code>permit ip 10.10.30.64 0.0.0.63 any</code></li></ol>
      Planungsfrage dazu: Die Entwicklungsabteilung braucht 70 Geräte plus 30 % Reserve = 91 Adressen. /26 (62) reicht nicht, /25 (126) passt.`),
    CK("Welches Präfix ist das kleinste, das 100 Hosts aufnehmen kann?", ["/26", "/25", "/24", "/27"], 1, "/25 = 2⁷ − 2 = 126 Hosts. /26 bietet nur 62.")
  ],
  "snw4-1": [
    { t: "fig", id: "snw-fig-stateful" },
    PR("Gleiche Aufgabe, drei Firewall-Typen", `Ziel: Mitarbeitende dürfen im Web surfen, aber keine Dateien über Cloud-Speicherdienste hochladen.<ul>
      <li><b>Paketfilter</b>: kann nur TCP 443 erlauben oder verbieten. Upload und normales Surfen sehen gleich aus. Für Antworten braucht er zusätzlich eine Regel mit <code>established</code>.</li>
      <li><b>Stateful Firewall</b>: lässt Antworten automatisch zu und erkennt gefälschte ACK-Pakete, sieht aber ebenfalls nur „HTTPS zu Adresse X“.</li>
      <li><b>NGFW mit TLS-Inspection und App-ID</b>: erkennt die Anwendung („Dropbox-Upload“) und kann genau diese Funktion sperren, während Lesen erlaubt bleibt.</li></ul>
      Die Anforderung bestimmt also den Firewall-Typ. Preis der NGFW: TLS-Inspection braucht eine eigene CA auf allen Clients und kostet Durchsatz.`),
    CK("Warum ist eine ACL-Regel mit dem Schlüsselwort „established“ schwächer als eine Stateful Firewall?", ["Sie prüft nur, ob ACK oder RST gesetzt ist, nicht ob die Verbindung wirklich existiert", "Sie blockiert alle Antworten", "Sie funktioniert nur mit UDP", "Sie verschlüsselt den Rückverkehr"], 0, "Ein Angreifer kann Pakete mit gesetztem ACK-Flag schicken. Nur die State-Tabelle weiß, welche Verbindungen tatsächlich aufgebaut wurden.")
  ],
  "snw4-2": [
    PR("Regelwerks-Review mit Hit-Countern", `Ausschnitt aus <code>show access-list</code> nach 90 Tagen Betrieb:<pre><code>10 permit tcp any host 192.168.0.2 eq 443   (1.204.311 matches)
20 permit tcp any any eq 3389               (12 matches)
30 permit tcp any host 192.168.0.2 eq 8443  (0 matches)
40 permit ip 10.0.0.0 0.255.255.255 any     (88.410 matches)
50 permit tcp 10.0.5.0 0.0.0.255 any eq 22  (0 matches)</code></pre>
      Befunde: <b>Zeile 20</b> öffnet RDP aus dem ganzen Internet, 12 Treffer sind vermutlich Scans: sofort entfernen bzw. auf VPN beschränken. <b>Zeile 30</b> ist ein Altlast-Eintrag ohne Treffer: per Change-Prozess löschen. <b>Zeile 50</b> wird nie erreicht, weil Zeile 40 alles aus 10.0.0.0/8 schon erlaubt (<b>verdeckte Regel</b>). Jede Änderung mit Ticket, Begründung und Owner dokumentieren.`),
    CK("Eine Regel hat nach Monaten 0 Treffer, weil eine allgemeinere Regel darüber denselben Verkehr erfasst. Wie nennt man das?", ["Implizites deny", "Verdeckte (shadowed) Regel", "Stateful Inspection", "Port Forwarding"], 1, "Verdeckte Regeln machen das Regelwerk unübersichtlich und täuschen eine Einschränkung vor, die nie wirkt. Hit-Counter helfen beim Aufräumen.")
  ],
  "snw4-3": [
    { t: "fig", id: "snw-fig-acl" },
    { t: "calc", id: "snw-subnet" },
    EX("Wildcard für ein /22 und Treffer prüfen", `Aufgabe: Das Standortnetz 172.16.8.0/22 soll per IOS-ACL nur den Proxy 172.16.100.10 auf TCP 3128 erreichen; der Admin-PC 172.16.9.200 darf alles.<ol>
      <li>/22 = 255.255.252.0 → Wildcard <b>0.0.3.255</b>. Erfasst 172.16.8.0 bis 172.16.11.255.</li>
      <li>Ausnahme zuerst: <code>access-list 120 permit ip host 172.16.9.200 any</code></li>
      <li><code>access-list 120 permit udp 172.16.8.0 0.0.3.255 any eq 53</code> (DNS)</li>
      <li><code>access-list 120 permit tcp 172.16.8.0 0.0.3.255 host 172.16.100.10 eq 3128</code></li>
      <li><code>access-list 120 deny ip any any log</code> und <code>ip access-group 120 in</code> am Interface zum Standortnetz (nahe der Quelle)</li></ol>
      Test: 172.16.10.4 → 8.8.8.8 TCP 443 trifft keine Erlaubnis und wird verworfen. 172.16.12.4 liegt gar nicht im /22 und würde von keiner permit-Zeile erfasst.`)
  ],
  "snw4-4": [
    { t: "fig", id: "snw-fig-dmz" },
    { t: "calc", id: "snw-fwha" },
    EX("Zwei Firewalls, schlechtere Verfügbarkeit", `Jede Firewall hat 99,9 % Verfügbarkeit (≈ 8,8 h Ausfall pro Jahr).<ul>
      <li><b>einstufig, ein Gerät</b>: 99,9 % → 8,76 h/Jahr</li>
      <li><b>zweistufig, je ein Gerät</b> (seriell): 0,999 · 0,999 = 0,998 → <b>99,8 %</b> → 0,002 · 8.760 = <b>17,5 h/Jahr</b></li>
      <li><b>zweistufig, je ein Cluster</b>: pro Stufe 1 − 0,001² = 99,9999 %, beide Stufen zusammen ≈ <b>99,9998 %</b> → rund 1 Minute pro Jahr</li></ul>
      Ergebnis für die Prüfung: Die zweistufige Architektur bringt <b>Sicherheit</b> (Defense in Depth), aber erst Cluster je Stufe bringen <b>Verfügbarkeit</b>.`),
    CK("Zwei Firewalls mit je 99,5 % Verfügbarkeit stehen hintereinander. Wie verfügbar ist der Weg durch beide?", ["99,75 %", "99,5 %", "≈ 99,0 %", "≈ 99,9975 %"], 2, "Seriell: 0,995 · 0,995 = 0,990025 ≈ 99,0 %. 99,9975 % wäre die parallele Variante 1 − 0,005².")
  ],
  "snw5-1": [
    { t: "calc", id: "snw-pat" },
    EX("PAT-Tabelle lesen und Kapazität abschätzen", `Firma mit Outside-IP 203.0.113.10:<table class='dt'><tr><th>innen</th><th>außen (übersetzt)</th><th>Ziel</th></tr>
      <tr><td>10.0.0.11:51544</td><td>203.0.113.10:1025</td><td>142.250.1.1:443</td></tr>
      <tr><td>10.0.0.12:51544</td><td>203.0.113.10:1026</td><td>142.250.1.1:443</td></tr>
      <tr><td>10.0.0.11:51545</td><td>203.0.113.10:1027</td><td>151.101.2.1:443</td></tr></table>
      Beide Clients nutzen zufällig denselben Quellport 51544. PAT löst den Konflikt, indem es außen verschiedene Ports vergibt.<br>
      <b>Kapazität</b>: 64.512 Ports / 120 Verbindungen pro Person ≈ <b>537 Personen</b> gleichzeitig, mit 20 % Reserve ≈ 430. Für 1.500 Mitarbeitende braucht man also einen kleinen Pool von 4 öffentlichen IPs.<br>
      Sicherheit? Ein Angreifer, der Port 1026 trifft, landet direkt bei 10.0.0.12, solange der Eintrag existiert. Filtern muss die Firewall-Regel, nicht die Übersetzung.`)
  ],
  "snw5-2": [
    { t: "calc", id: "snw-ids" },
    EX("Der Base-Rate-Effekt: 99 % Erkennung, trotzdem fast nur Fehlalarme", `Ein IDS sieht <b>1.000.000</b> Ereignisse pro Tag, davon sind <b>10</b> echte Angriffe. Es erkennt 99 % der Angriffe und stuft 0,1 % der harmlosen Ereignisse fälschlich als Angriff ein.<ol>
      <li>True Positives = 10 · 0,99 ≈ <b>10</b></li><li>False Positives = 999.990 · 0,001 ≈ <b>1.000</b></li>
      <li>Precision = 10 / (10 + 1.000) ≈ <b>1 %</b>: Nur jeder hundertste Alarm ist echt.</li>
      <li>Bei 5 Minuten Prüfaufwand pro Alarm sind das über 83 Stunden Arbeit pro Tag.</li></ol>
      Darum ist <b>Tuning</b> Pflicht: irrelevante Signaturen abschalten (keine Windows-Signaturen gegen reine Linux-Server), Schwellen anpassen und Alarme im SIEM korrelieren. Ein IPS mit diesen Werten würde täglich 1.000 legitime Verbindungen blockieren.`),
    CK("Ein IDS soll weniger Angriffe übersehen. Welche Nebenwirkung hat eine niedrigere Alarmschwelle?", ["Mehr False Negatives", "Mehr False Positives", "Keine, beide Raten sinken", "Das IDS wird inline geschaltet"], 1, "Höhere Sensitivität senkt die False Negatives und erhöht die Fehlalarme. Beide Raten sinken nur durch bessere Signaturen bzw. Kontextwissen.")
  ],
  "snw5-3": [
    { t: "fig", id: "snw-fig-ipsec" },
    PR("Zentrale, Filiale und Außendienst richtig anbinden", `Ein Großhändler hat die Zentrale in Graz, eine Filiale in Wien (25 Arbeitsplätze, Kassen, Drucker) und 40 Außendienstler mit Laptops.<ul>
      <li><b>Wien ↔ Graz</b>: Site-to-Site-IPSec zwischen den beiden Firewalls (IKEv2, Zertifikate, AES-GCM, Tunnel Mode). Kassen und Drucker brauchen keine Software.</li>
      <li><b>Außendienst</b>: Remote-Access-VPN (SSL/TLS über 443) mit Benutzer-Login und MFA über RADIUS. Funktioniert auch im Hotel-WLAN, das nur Web durchlässt.</li>
      <li><b>Firewall-Freigaben in Graz</b>: UDP 500 und UDP 4500 vom Wiener Gateway, IP-Protokoll 50 (ESP); TCP 443 zum VPN-Gateway für Remote Access.</li>
      <li>Kein <b>Split Tunneling</b> für den Außendienst, damit der Internetverkehr der Laptops ebenfalls über die Firmen-Firewall läuft.</li></ul>`),
    CK("Welche Freigaben braucht eine Firewall für ein IPSec-Site-to-Site-VPN mit NAT-Traversal?", ["TCP 22 und TCP 23", "UDP 500, UDP 4500 und IP-Protokoll 50 (ESP)", "Nur TCP 443", "UDP 53 und UDP 123"], 1, "IKE nutzt UDP 500, NAT-T UDP 4500, ESP ist IP-Protokoll 50. AH wäre Protokoll 51.")
  ]
};

/* ======================= FRAGEN ======================= */
const Q = (n, topic, q, opts, a, why) => ({ id: "px-sunw2-" + n, topic, q, opts, a, why, ex: "" });
const questions = [
  // snw-basics
  Q(1, "snw-basics", "Ein Asset hat einen Wert von 200.000 €, ein Vorfall zerstört 25 % davon und tritt im Schnitt alle zwei Jahre auf. Wie hoch ist die jährliche Verlusterwartung?", ["50.000 €", "25.000 €", "100.000 €", "12.500 €"], 1, "SLE = 200.000 · 0,25 = 50.000 €; ARO = 0,5 → ALE = 25.000 € pro Jahr."),
  Q(2, "snw-basics", "Eine Firma schließt eine Cyberversicherung ab. Welche Form der Risikobehandlung ist das?", ["Risikovermeidung", "Risikoverminderung", "Risikoübertragung (Transfer)", "Risikoakzeptanz"], 2, "Der finanzielle Schaden wird auf die Versicherung übertragen. Das Risiko selbst bleibt bestehen."),
  Q(3, "snw-basics", "Ein Angreifer manipuliert die Steuerung einer Heizungsanlage, die daraufhin überhitzt. Welche Aussage trifft zu?", ["Ein reines Safety-Problem, weil Hitze entsteht", "Ein Security-Vorfall, der ein Safety-Problem auslöst", "Weder Safety noch Security, sondern Compliance", "Ein reines Security-Problem ohne physische Folgen"], 1, "Ursache ist ein absichtlicher Angriff (Security), die Folge eine gefährliche Fehlfunktion (Safety). In OT-Netzen überschneiden sich beide."),
  Q(4, "snw-basics", "Was bezeichnet das Restrisiko?", ["Das Risiko vor jeder Maßnahme", "Das Risiko, das nach allen Maßnahmen übrig bleibt und bewusst getragen wird", "Ein Risiko, das nur Safety betrifft", "Das Risiko eines Zero-Day-Exploits"], 1, "Risiko 0 gibt es nicht. Was übrig bleibt, wird vom Management akzeptiert, versichert oder weiter reduziert."),
  Q(5, "snw-basics", "Eine Maßnahme kostet 20.000 € pro Jahr und senkt die jährliche Verlusterwartung von 50.000 € auf 35.000 €. Was gilt?", ["Sie rechnet sich, Nutzen 15.000 €", "Sie rechnet sich nicht, sie kostet 5.000 € mehr, als sie spart", "Nutzen 30.000 €", "Das lässt sich ohne ARO nicht sagen"], 1, "Ersparnis 15.000 € minus Kosten 20.000 € = −5.000 €. Finanziell lohnt sie sich nicht, außer es gibt andere Gründe (z. B. Compliance)."),
  // snw-vuln
  Q(6, "snw-vuln", "Eine Lücke hat den CVSS-Base-Score 7,5. Wie wird sie eingestuft?", ["Medium", "High", "Critical", "Low"], 1, "7,0–8,9 = High, ab 9,0 Critical."),
  Q(7, "snw-vuln", "Was ist eine Zero-Day-Lücke?", ["Eine Lücke mit CVSS 0", "Eine Lücke, die ausgenutzt wird, bevor ein Patch verfügbar ist", "Eine Lücke, die am Tag der Veröffentlichung gepatcht wurde", "Eine Lücke nur in Hardware"], 1, "Der Hersteller hatte „null Tage“ Zeit zu reagieren."),
  Q(8, "snw-vuln", "Welche Lücke patchst du zuerst?", ["CVSS 9,8 auf einem isolierten Testsystem ohne Netzzugang", "CVSS 7,5 im internetexponierten VPN-Gateway, aktiv ausgenutzt", "CVSS 5,0 in einem internen Druckerdienst", "Die mit der niedrigsten CVE-Nummer"], 1, "Neben dem Base Score zählen Erreichbarkeit, Kritikalität des Assets und aktive Ausnutzung."),
  Q(9, "snw-vuln", "Welche Eigenschaft treibt den CVSS-Score am stärksten nach oben?", ["Angriff nur mit physischem Zugriff", "Angriff über das Netz, ohne Login und ohne Mitwirkung eines Users", "Hohe Angriffskomplexität", "Nur Leserechte betroffen"], 1, "AV:N, PR:N und UI:N ergeben die höchste Exploitability."),
  Q(10, "snw-vuln", "Welche Angabe ist eine gültige CVE-ID?", ["CVSS-9.8-2021", "CWE-79", "CVE-2021-44228", "KB5034441"], 2, "Format CVE-Jahr-Nummer. CWE-79 ist eine Schwachstellenklasse (XSS), KB-Nummern sind Microsoft-Patches."),
  // snw-cia
  Q(11, "snw-cia", "Ein DDoS-Angriff legt den Webshop für Stunden lahm. Welches Schutzziel ist verletzt?", ["Vertraulichkeit", "Integrität", "Verfügbarkeit", "Authentizität"], 2, "Daten werden weder gelesen noch verändert, der Dienst ist aber nicht nutzbar."),
  Q(12, "snw-cia", "Ein Firmenlaptop wird im Zug gestohlen. Welche technische Maßnahme schützt die Vertraulichkeit der Daten?", ["Tägliches Backup", "Festplattenverschlüsselung (z. B. BitLocker)", "Redundantes Netzteil", "Vier-Augen-Prinzip"], 1, "Backup schützt die Verfügbarkeit, Vier-Augen-Prinzip ist organisatorisch."),
  Q(13, "snw-cia", "Ransomware verschlüsselt Dateien und kopiert sie vorher auf einen Server der Täter. Welche Schutzziele sind betroffen?", ["Nur Verfügbarkeit", "Verfügbarkeit und Vertraulichkeit", "Nur Integrität", "Keines, die Daten existieren noch"], 1, "Die Daten sind nicht mehr nutzbar (Verfügbarkeit) und abgeflossen (Vertraulichkeit). Doppelte Erpressung."),
  Q(14, "snw-cia", "Welche Lösung ist ORGANISATORISCH und dient der Verfügbarkeit?", ["RAID 1", "Notfall- und Wiederanlaufplan mit regelmäßigen Übungen", "TLS 1.3", "SHA-256-Prüfsumme"], 1, "RAID ist technisch, TLS dient der Vertraulichkeit, Hashes der Integrität."),
  // snw-aaa
  Q(15, "snw-aaa", "Welches AAA-Protokoll verschlüsselt das gesamte Paket und trennt Authentication, Authorization und Accounting?", ["RADIUS", "TACACS+", "LDAP", "Kerberos"], 1, "TACACS+ (TCP 49) eignet sich besonders für Geräteadministration mit Befehlsautorisierung. RADIUS verschlüsselt nur das Passwort."),
  Q(16, "snw-aaa", "Eine 4-stellige PIN wird nach 3 Fehlversuchen gesperrt. Wie wahrscheinlich ist es, sie durch Raten zu treffen?", ["0,3 %", "0,03 %", "3 %", "0,003 %"], 1, "10⁴ = 10.000 Möglichkeiten, 3 Versuche → 3 / 10.000 = 0,03 %. Die Sperre macht kurze PINs erst sicher."),
  Q(17, "snw-aaa", "Was beschreibt „MFA-Fatigue“?", ["Nutzer vergessen ihr zweites Gerät", "Der Angreifer schickt so lange Push-Anfragen, bis der Nutzer genervt bestätigt", "Ein Token-Akku ist leer", "Die Passwortrichtlinie ist zu streng"], 1, "Gegenmittel: Number Matching, Kontextinfo in der App, phishing-resistente Verfahren wie FIDO2."),
  Q(18, "snw-aaa", "Wie viele Kombinationen hat ein 8-stelliges Passwort aus 62 Zeichen (a–z, A–Z, 0–9)?", ["62 · 8 = 496", "8⁶² ", "62⁸ ≈ 2,2 · 10¹⁴", "2⁶² ≈ 4,6 · 10¹⁸"], 2, "Schlüsselraum = N^L. Jede zusätzliche Stelle multipliziert mit 62."),
  // snw-asset
  Q(19, "snw-asset", "Welche Quellen eignen sich für eine automatische Asset-Discovery?", ["Netzwerk-Scans, DHCP-Leases und 802.1X/NAC-Logs", "Nur Rechnungen der Buchhaltung", "Nur Interviews mit Mitarbeitenden", "Der CVSS-Rechner"], 0, "Kombiniert ergeben sie ein aktuelles Bild, das mit dem Soll-Inventar abgeglichen wird."),
  Q(20, "snw-asset", "Wozu dient die Kritikalität eines Assets im Inventar?", ["Sie bestimmt die Farbe im Netzplan", "Sie hilft, Patches und Maßnahmen zu priorisieren", "Sie ersetzt den CVSS-Score", "Sie gibt die Garantiedauer an"], 1, "Gleiche Lücke, unterschiedliche Dringlichkeit: Ein kritisches System wird zuerst gepatcht."),
  Q(21, "snw-asset", "Ein Team betreibt ohne Wissen der IT einen eigenen Cloud-Speicher mit Kundendaten. Wie nennt man das?", ["Shadow IT (Schatten-IT)", "Defense in Depth", "Shared Responsibility", "Port Forwarding"], 0, "Schatten-IT fehlt im Inventar, wird nicht gepatcht und nicht überwacht."),
  Q(22, "snw-asset", "Warum ist ein Asset ohne eingetragenen Owner ein Sicherheitsproblem?", ["Weil es dann keine IP-Adresse bekommt", "Weil niemand für Patches, Freigaben und Ausmusterung verantwortlich ist", "Weil der CVSS-Score dann 0 ist", "Es ist kein Problem"], 1, "Verantwortung ist die Voraussetzung dafür, dass Maßnahmen tatsächlich umgesetzt werden."),
  // snw-tcpudp
  Q(23, "snw-tcpudp", "Welche Bandbreite braucht ein G.711-Gespräch (64 kbit/s, 20 ms, über Ethernet) etwa pro Richtung?", ["64 kbit/s", "≈ 87 kbit/s", "≈ 160 kbit/s", "≈ 32 kbit/s"], 1, "160 Byte Nutzlast + 58 Byte Header (RTP 12, UDP 8, IP 20, Ethernet 18) = 218 Byte · 50/s · 8 = 87,2 kbit/s."),
  Q(24, "snw-tcpudp", "Warum nutzt DNS für normale Anfragen UDP?", ["Weil UDP verschlüsselt", "Weil kurze Frage-Antwort-Abläufe ohne Verbindungsaufbau schneller sind", "Weil TCP für DNS verboten ist", "Weil UDP Reihenfolge garantiert"], 1, "Für große Antworten und Zonentransfers nutzt DNS TCP 53. Deshalb in ACLs oft beides freigeben."),
  Q(25, "snw-tcpudp", "Wie groß ist der Header von UDP im Vergleich zu TCP (ohne Optionen)?", ["UDP 8 Byte, TCP 20 Byte", "UDP 20 Byte, TCP 8 Byte", "beide 20 Byte", "UDP 12 Byte, TCP 40 Byte"], 0, "Der kleine UDP-Header ist ein Grund für den geringen Overhead."),
  Q(26, "snw-tcpudp", "Welcher Dienst nutzt standardmäßig UDP 161?", ["SNMP", "SMTP", "RDP", "LDAP"], 0, "SNMP-Abfragen auf UDP 161, Traps auf UDP 162. RDP nutzt 3389, SMTP 25."),
  // snw-flow
  Q(27, "snw-flow", "Über 30 Minuten fließen 9 GB zu einer externen Adresse. Welcher mittlere Durchsatz ist das?", ["5 Mbit/s", "40 Mbit/s", "300 Mbit/s", "4,8 Mbit/s"], 1, "9 GB · 8 = 72.000 Mbit; / 1.800 s = 40 Mbit/s."),
  Q(28, "snw-flow", "Ein Host kontaktiert in 2 Minuten 4.000 verschiedene interne Adressen jeweils auf TCP 445 mit sehr kleinen Flows. Was ist das wahrscheinlich?", ["Ein normales Windows-Update", "Ein horizontaler Scan, z. B. ein Wurm auf der Suche nach SMB-Zielen", "Ein Backup-Job", "Ein DNS-Ausfall"], 1, "Viele Ziele, ein Port, kaum Bytes: klassisches Scan-Muster in Flow-Daten."),
  Q(29, "snw-flow", "Was enthält ein NetFlow-Record NICHT?", ["Quell- und Ziel-IP", "Ports und Protokoll", "Anzahl Bytes und Pakete", "Den Inhalt der Nutzdaten"], 3, "NetFlow liefert nur Metadaten. Für Inhalte bräuchte man einen Paketmitschnitt."),
  Q(30, "snw-flow", "Warum gilt der SYN-Scan als „halboffen“?", ["Er sendet nur jedes zweite Paket", "Er baut den Handshake nicht fertig auf, sondern antwortet auf SYN/ACK mit RST", "Er scannt nur die Hälfte der Ports", "Er nutzt nur UDP"], 1, "Der Handshake wird nie abgeschlossen, deshalb protokollieren manche Dienste den Versuch nicht."),
  // snw-l2
  Q(31, "snw-l2", "Eine CAM-Tabelle hat 16.000 freie Einträge, ein Angreifer erzeugt 4.000 gefälschte MACs pro Sekunde. Wann ist sie voll?", ["nach 0,25 s", "nach 4 s", "nach 40 s", "nie, sie altert vorher aus"], 1, "16.000 / 4.000 = 4 s. Die Aging Time (300 s) ist viel länger."),
  Q(32, "snw-l2", "Port Security ist mit „violation shutdown“ konfiguriert. Was passiert bei einer Verletzung?", ["Der Frame wird still verworfen, der Port bleibt aktiv", "Der Port geht in den Zustand err-disabled", "Der Switch startet neu", "Die MAC wird automatisch erlaubt"], 1, "protect = still verwerfen, restrict = verwerfen + loggen, shutdown = Port err-disabled (Standard)."),
  Q(33, "snw-l2", "Welche Maßnahme schützt gegen VLAN-Hopping per Switch Spoofing?", ["DTP auf Access-Ports abschalten (switchport mode access, nonegotiate)", "Mehr MAC-Adressen pro Port erlauben", "DHCP-Pool vergrößern", "ARP-Cache leeren"], 0, "Sonst kann ein Angreifer einen Trunk aushandeln. Zusätzlich: Native VLAN auf ein ungenutztes VLAN setzen."),
  Q(34, "snw-l2", "Welcher Port ist bei DHCP Snooping als „trusted“ zu konfigurieren?", ["Jeder Client-Port", "Der Uplink in Richtung des legitimen DHCP-Servers", "Der Port des Druckers", "Kein Port"], 1, "Nur dort dürfen DHCP-Offers und -ACKs ankommen. Alle anderen Ports sind untrusted."),
  // snw-nac
  Q(35, "snw-nac", "Welche Pakete erlaubt ein 802.1X-Port, bevor sich das Gerät authentifiziert hat?", ["Alle", "Nur DHCP", "Nur EAPoL (EAP over LAN)", "Nur DNS"], 2, "Erst nach Access-Accept wird der Port autorisiert."),
  Q(36, "snw-nac", "Warum ist MAB (MAC Authentication Bypass) schwächer als 802.1X mit EAP-TLS?", ["Weil MAB nur bei WLAN funktioniert", "Weil sich MAC-Adressen leicht fälschen lassen", "Weil MAB keinen RADIUS-Server nutzt", "Weil MAB verschlüsselt"], 1, "MAB ist eine Notlösung für Geräte ohne Supplicant. Deshalb in ein eng gefiltertes VLAN."),
  Q(37, "snw-nac", "Was zeichnet EAP-TLS aus?", ["Anmeldung nur per Passwort", "Gegenseitige Authentifizierung mit Zertifikaten auf Client und Server", "Keine Verschlüsselung", "Funktioniert ohne RADIUS"], 1, "EAP-TLS gilt als sicherstes gängiges EAP-Verfahren, braucht aber eine PKI."),
  Q(38, "snw-nac", "Ein Gerät besteht die Posture-Prüfung nicht. Was ist eine typische NAC-Reaktion?", ["Vollzugriff mit Warnung", "Zuweisung in ein Quarantäne-VLAN mit Zugriff nur auf Update-Server", "Löschen des Benutzerkontos", "Abschalten des ganzen Switches"], 1, "Nach erfolgreicher Remediation wird erneut geprüft."),
  // snw-seg
  Q(39, "snw-seg", "Welche Netzadresse und welchen Broadcast hat 192.168.10.77/27?", ["192.168.10.64 und 192.168.10.95", "192.168.10.0 und 192.168.10.255", "192.168.10.72 und 192.168.10.79", "192.168.10.64 und 192.168.10.127"], 0, "/27 → Blockgröße 32: Blöcke 0, 32, 64, 96. Die 77 liegt in 64–95."),
  Q(40, "snw-seg", "Eine Abteilung braucht 70 Adressen plus 30 % Reserve. Welches Präfix passt am knappsten?", ["/26", "/25", "/24", "/23"], 1, "70 · 1,3 = 91 Adressen. /26 bietet 62, /25 bietet 126."),
  Q(41, "snw-seg", "Ein VLAN bekommt 10.10.80.0/23. Welche Adressen belegt es?", ["10.10.80.0 bis 10.10.80.255", "10.10.80.0 bis 10.10.81.255", "10.10.79.0 bis 10.10.80.255", "10.10.80.0 bis 10.10.83.255"], 1, "/23 = 512 Adressen, also zwei /24. Dort darf kein weiteres Netz 10.10.81.0/24 geplant werden."),
  Q(42, "snw-seg", "Welcher Adressbereich ist privat nach RFC 1918?", ["172.16.0.0/12", "172.32.0.0/12", "100.64.0.0/10", "169.254.0.0/16"], 0, "Privat: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. 100.64.0.0/10 ist Carrier-Grade-NAT, 169.254.0.0/16 Link-Local."),
  // snw-fw
  Q(43, "snw-fw", "Welche Firewall terminiert die Verbindung und baut eine eigene zum Ziel auf?", ["Stateless Paketfilter", "Stateful Firewall", "Application Layer Gateway / Proxy", "Layer-2-Switch"], 2, "Der Proxy versteht das Anwendungsprotokoll und kann Inhalte prüfen."),
  Q(44, "snw-fw", "Warum braucht eine NGFW TLS-Inspection, um Dateien in HTTPS-Verbindungen zu prüfen?", ["Weil HTTPS sonst nicht funktioniert", "Weil der Inhalt verschlüsselt ist und ohne Aufbrechen unsichtbar bleibt", "Weil TLS-Inspection den Durchsatz erhöht", "Weil Ports sonst nicht erkannt werden"], 1, "Ohne Inspection sieht sie nur Metadaten wie SNI und Zieladresse."),
  Q(45, "snw-fw", "Ein Paket mit gesetztem ACK-Flag kommt ohne vorherigen Handshake von außen. Was macht eine Stateful Firewall?", ["Sie lässt es durch, weil ACK gesetzt ist", "Sie verwirft es, weil kein passender Eintrag in der State-Tabelle existiert", "Sie leitet es an den IDS-Sensor weiter und lässt es durch", "Sie antwortet mit SYN/ACK"], 1, "Genau hier ist sie dem Paketfilter mit „established“ überlegen."),
  Q(46, "snw-fw", "Auf welchen Schichten arbeitet ein klassischer Paketfilter?", ["Layer 1 und 2", "Layer 3 und 4", "Layer 5 bis 7", "nur Layer 7"], 1, "IP-Adressen, Protokoll und Ports, ohne Zustand und ohne Inhalt."),
  // snw-fwops
  Q(47, "snw-fwops", "Zwei Firewalls mit je 99,9 % Verfügbarkeit stehen in Serie. Wie viel Ausfall ist pro Jahr zu erwarten?", ["≈ 8,8 h", "≈ 17,5 h", "≈ 1 min", "≈ 4,4 h"], 1, "0,999² = 0,998 → 0,002 · 8.760 h ≈ 17,5 h."),
  Q(48, "snw-fwops", "Was bringt ein Active/Standby-Cluster?", ["Doppelten Durchsatz", "Weiterbetrieb bei Ausfall eines Geräts (Hochverfügbarkeit)", "Zwei getrennte Regelwerke", "Herstellerdiversität"], 1, "Der Standby übernimmt inklusive State-Tabelle, Sessions bleiben erhalten."),
  Q(49, "snw-fwops", "Eine Regel zeigt nach 90 Tagen 0 Treffer. Was ist der richtige nächste Schritt?", ["Sofort ohne Rücksprache löschen", "Prüfen, ob sie verdeckt oder veraltet ist, und per Change-Prozess mit dem Owner bereinigen", "Sie ganz nach oben verschieben", "Logging für diese Regel abschalten"], 1, "Regelwerkspflege läuft dokumentiert über Change Management."),
  Q(50, "snw-fwops", "Warum werden Firewall-Regeln regelmäßig rezertifiziert?", ["Damit der Hersteller Lizenzen verkaufen kann", "Damit nur noch benötigte Freigaben mit verantwortlichem Owner bestehen", "Weil Regeln sonst automatisch ablaufen", "Damit die Firewall schneller bootet"], 1, "Alte Freigaben sind offene Türen, die niemand mehr braucht."),
  // snw-acl
  Q(51, "snw-acl", "Welche IOS-Wildcard-Maske gehört zu 172.16.8.0/22?", ["0.0.3.255", "255.255.252.0", "0.0.0.255", "0.0.7.255"], 0, "255.255.255.255 − 255.255.252.0 = 0.0.3.255."),
  Q(52, "snw-acl", "Welche Adresse wird von „172.16.8.0 0.0.3.255“ erfasst?", ["172.16.12.1", "172.16.7.255", "172.16.11.200", "172.17.8.1"], 2, "Der Bereich reicht von 172.16.8.0 bis 172.16.11.255."),
  Q(53, "snw-acl", "ACL: 10 deny ip any any log · 20 permit tcp host 10.0.0.5 any eq 443. Was passiert mit HTTPS von 10.0.0.5?", ["Erlaubt, weil Zeile 20 genauer ist", "Verworfen und geloggt, weil Zeile 10 zuerst trifft", "Erlaubt, aber geloggt", "Zufällig, je nach Last"], 1, "First match: Die Prüfung endet bei Zeile 10."),
  Q(54, "snw-acl", "Wo platziert man eine Standard-ACL (nur Quell-IP)?", ["Möglichst nahe an der Quelle", "Möglichst nahe am Ziel", "Immer am Outside-Interface", "Nur auf dem Core-Switch"], 1, "Sie kann nicht nach Ziel unterscheiden. Nahe der Quelle würde sie zu viel blockieren."),
  Q(55, "snw-acl", "Welche Notation verwendet die Cisco ASA in ACLs für ein /24-Netz?", ["10.0.0.0 0.0.0.255", "10.0.0.0 255.255.255.0", "10.0.0.0/24 any", "10.0.0.* "], 1, "IOS nutzt Wildcards, die ASA Subnetzmasken."),
  // snw-dmz
  Q(56, "snw-dmz", "Wo steht die Datenbank eines Webshops idealerweise?", ["In der DMZ neben dem Webserver", "Im internen bzw. eigenen Datenbanksegment hinter der inneren Firewall, erreichbar nur vom Webserver auf dem DB-Port", "Direkt im Internet", "Im Gäste-WLAN"], 1, "In die DMZ gehört nur, was von außen erreichbar sein muss."),
  Q(57, "snw-dmz", "Auf einer ASA hat inside den Security Level 100, dmz 50, outside 0. Was gilt für Verkehr von dmz nach inside?", ["Er ist ohne Regel erlaubt", "Er braucht eine explizite ACL", "Er ist technisch unmöglich", "Er wird automatisch verschlüsselt"], 1, "Von niedrigerem zu höherem Level nur mit ACL. Von hoch nach niedrig ist standardmäßig erlaubt."),
  Q(58, "snw-dmz", "Wozu dient ein Reverse Proxy in der DMZ?", ["Er verteilt eingehende Anfragen auf interne Server und versteckt diese, oft mit TLS-Terminierung", "Er vergibt IP-Adressen", "Er ersetzt die innere Firewall", "Er dient nur dem ausgehenden Surfen"], 0, "Damit kann z. B. ein Port 443 für mehrere Webdienste genutzt werden (Auswahl per Hostname)."),
  Q(59, "snw-dmz", "Wie erreicht eine zweistufige DMZ-Architektur zusätzlich hohe Verfügbarkeit?", ["Gar nicht, zweistufig ist automatisch hochverfügbar", "Durch einen Cluster (z. B. Active/Standby) pro Stufe", "Durch ein längeres Regelwerk", "Durch NAT"], 1, "In Serie sinkt die Verfügbarkeit, erst Redundanz je Stufe hebt sie."),
  // snw-nat
  Q(60, "snw-nat", "Wie viele Personen mit je 120 gleichzeitigen Verbindungen passen ungefähr hinter eine PAT-Adresse (64.512 Ports)?", ["≈ 54", "≈ 537", "≈ 5.376", "≈ 64.512"], 1, "64.512 / 120 ≈ 537 (ohne Reserve)."),
  Q(61, "snw-nat", "Ein zweiter Webserver soll über dieselbe öffentliche IP erreichbar sein. Welche Port-Forwarding-Lösung funktioniert?", ["Beide auf extern 443", "Extern 8443 → Server 2 intern 443", "Server 2 bekommt dieselbe interne IP", "UDP 443 statt TCP 443 für Server 2"], 1, "Alternativ: zweite öffentliche IP oder Reverse Proxy mit Hostnamen-Unterscheidung."),
  Q(62, "snw-nat", "Was unterscheidet Static NAT von PAT?", ["Static NAT übersetzt 1:1 und ist von außen erreichbar, PAT bündelt viele interne Hosts hinter einer IP über Ports", "Static NAT verschlüsselt", "PAT funktioniert nur mit UDP", "Es gibt keinen Unterschied"], 0, "Static NAT eignet sich für Server, PAT für ausgehende Client-Verbindungen."),
  Q(63, "snw-nat", "Mit IPv6 gibt es meist kein NAT mehr. Was schützt dann interne Hosts vor unerwünschten Verbindungen von außen?", ["Nichts, IPv6 ist automatisch sicher", "Eine Stateful Firewall mit Default-Deny für eingehenden Verkehr", "Längere Adressen allein", "DHCPv6"], 1, "Das zeigt, dass der vermeintliche Schutz von NAT nie die eigentliche Sicherheitsfunktion war."),
  // snw-ids
  Q(64, "snw-ids", "1.000.000 Ereignisse, 10 echte Angriffe, FPR 0,1 %, alle Angriffe erkannt. Etwa welcher Anteil der Alarme ist echt?", ["≈ 99 %", "≈ 50 %", "≈ 1 %", "≈ 0,01 %"], 2, "≈ 1.000 Fehlalarme + 10 echte → 10 / 1.010 ≈ 1 % (Base-Rate-Effekt)."),
  Q(65, "snw-ids", "Ein IDS hängt an einem SPAN-Port. Warum kann es einen Ein-Paket-Angriff nicht verhindern?", ["Weil es nur eine Kopie sieht und das Original schon unterwegs zum Ziel ist", "Weil SPAN-Ports keine Pakete spiegeln", "Weil IDS nur UDP prüfen", "Weil es dafür zu schnell ist"], 0, "Verhindern kann nur ein IPS inline im Datenpfad."),
  Q(66, "snw-ids", "Welche drei Attribute hat eine Signatur laut Vorlesung?", ["Type, Trigger, Action", "Source, Destination, Port", "Low, Medium, High", "Detect, Prevent, Report"], 0, "Type = atomar oder composite, Trigger = Alarmbedingung, Action = z. B. Alarm, Drop, Reset."),
  Q(67, "snw-ids", "Welchen Vorteil hat anomaliebasierte Erkennung gegenüber signaturbasierter?", ["Sie erzeugt keine Fehlalarme", "Sie kann auch unbekannte Angriffe (Zero-Days) als Abweichung erkennen", "Sie braucht keine Lernphase", "Sie ist immer schneller"], 1, "Preis: mehr Fehlalarme und ein Normalprofil, das gepflegt werden muss."),
  // snw-vpn
  Q(68, "snw-vpn", "Warum funktioniert IPSec AH nicht durch NAT?", ["AH ist verschlüsselt", "AH sichert auch den IP-Header, den NAT verändert, wodurch die Prüfung fehlschlägt", "AH nutzt TCP", "AH ist für IPv6 reserviert"], 1, "ESP mit NAT-T (UDP 4500) ist NAT-tauglich."),
  Q(69, "snw-vpn", "Was ist das Risiko von Split Tunneling bei Remote Access?", ["Der VPN-Tunnel ist langsamer", "Internetverkehr des Laptops läuft an der Firmen-Firewall vorbei, ein kompromittierter Laptop wird zur Brücke", "Es funktioniert nur mit IPSec", "Es verdoppelt die Lizenzkosten"], 1, "Ohne Split Tunneling läuft alles über die zentrale Sicherheitsinfrastruktur, kostet aber Bandbreite."),
  Q(70, "snw-vpn", "Welcher IPSec-Modus verschlüsselt auch die internen IP-Adressen?", ["Transport Mode", "Tunnel Mode", "Aggressive Mode", "Main Mode"], 1, "Im Tunnel Mode wird das gesamte Originalpaket verpackt. Main/Aggressive Mode sind IKEv1-Phase-1-Varianten."),
  Q(71, "snw-vpn", "Welches Protokoll handelt bei IPSec Schlüssel und Security Associations aus?", ["ESP", "AH", "IKE (UDP 500)", "GRE"], 2, "IKE authentifiziert die Peers und erzeugt die SAs, ESP schützt danach die Daten.")
];

const F = (id, topic, front, back) => ({ id: "px-sunw2-f" + id, cat: "SUNW2", topic, front, back });
const flashcards = [
  F(1, "snw-basics", "ALE, SLE, ARO", "SLE = Assetwert · Schadensanteil (EF). ALE = SLE · ARO (Vorfälle pro Jahr). Eine Maßnahme lohnt sich, wenn ALE-Senkung > Kosten."),
  F(2, "snw-vuln", "Was treibt den CVSS-Base-Score?", "Exploitability (Angriffsweg Netz, geringe Komplexität, keine Rechte, keine User-Interaktion) + Impact auf C, I, A. AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H = 9,8."),
  F(3, "snw-aaa", "Brute-Force-Zeit", "Schlüsselraum N^L, im Mittel die Hälfte durchprobieren: N^L / (2 · Rate). Länge wirkt stärker als Zeichenvorrat. Gegen Phishing hilft nur 2FA."),
  F(4, "snw-seg", "Subnetz schnell rechnen", "Blockgröße = 2^(Hostbits im Oktett). Netz = größtes Vielfaches ≤ Adresse, Broadcast = Netz + Block − 1, Hosts = 2^h − 2. Wildcard = 255.255.255.255 − Maske."),
  F(5, "snw-fwops", "Verfügbarkeit seriell / parallel", "Seriell: A1 · A2 (schlechter als das schwächste Glied). Parallel: 1 − (1 − A1)(1 − A2). Ausfall/Jahr = (1 − A) · 8.760 h."),
  F(6, "snw-nat", "PAT-Kapazität", "≈ 64.512 Ports (1024–65535) pro öffentlicher IP und Protokoll, geteilt durch gleichzeitige Verbindungen pro Nutzer. NAT ist trotzdem kein Filter."),
  F(7, "snw-ids", "Base-Rate-Effekt", "Sind Angriffe selten, erzeugt schon eine kleine False-Positive-Rate mehr Fehl- als Echtalarme. Abhilfe: Tuning mit Kontextwissen, Korrelation im SIEM."),
  F(8, "snw-vpn", "IPSec Tunnel vs. Transport Mode", "Tunnel: ganzes Paket verschlüsselt, neuer IP-Header zwischen Gateways (Site-to-Site). Transport: nur Nutzlast geschützt, Original-Header bleibt (Host zu Host)."),
  F(9, "snw-l2", "MAC-Flooding", "CAM-Tabelle mit gefälschten MACs füllen → Switch flutet wie ein Hub → Mitlesen. Schutz: Port Security (maximum, violation shutdown)."),
  F(10, "snw-fw", "Stateful vs. established", "„established“ prüft nur ACK/RST-Flags (fälschbar). Stateful Firewall prüft gegen die State-Tabelle, ob die Verbindung wirklich existiert.")
];

window.STUDYOS_EXT = window.STUDYOS_EXT || {};
(window.STUDYOS_EXT.sunw2 = window.STUDYOS_EXT.sunw2 || []).push({ id: "sunw2-plus", blocks, questions, flashcards });
})();
