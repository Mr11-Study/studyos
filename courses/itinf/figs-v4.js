/* IT-Infrastruktur V4 · Grafiken & Simulatoren (Engine: js/figs.js)
   Nachgebaut nach den drei Moodle-Simulatoren der Einheit: Redundanz & Failover, Tiers & Lifecycle, Netzwerkzugriff.
   Preise im Tier-Rechner sind Beispielwerte (USD, LRS) – nur fürs Gefühl, nicht für echte Kalkulationen. */
(function () {
const F = window.STUDYOS_FIG, { svg, g, t, tl, r, box, c, l, p, dot, cloud, server, user, db, laptop, lock, key, axes, fmt } = window.FX;
if (!F) return;
const q = (root, s) => root.querySelector(s);
const val = (root, name) => (root.querySelector(`input[name=${name}]:checked`) || {}).value;
const on = (root, k) => { const x = root.querySelector(`[data-i=${k}]`); return !!(x && x.checked); };
const lay = (y, cls, a, b) => r(164, y, 176, 40, { cls, rx: 8 }) + t(252, y + 17, a, { fs: 11.5, fw: 600 }) + t(252, y + 32, b, { fs: 9.5, cls: "fx-sub" });
const disk = (x, y, cls) => g({ cls: "" }, r(x - 10, y - 12, 20, 24, { rx: 4, cls: cls || "fx-ok" }) + `<line x1="${x - 5}" y1="${y - 4}" x2="${x + 5}" y2="${y - 4}" class="fx-ln thin"/><line x1="${x - 5}" y1="${y + 2}" x2="${x + 5}" y2="${y + 2}" class="fx-ln thin"/>`);

/* 1 · Block, File, Object */
F["itf-bfo"] = { title: "Block, File und Object: Wer kennt was?",
  svg: () => svg(480, 250,
    g({ st: 0 }, r(8, 20, 150, 210, { cls: "fx-soft", rx: 12 }) + t(83, 40, "Block", { fw: 700 }) +
      [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => r(24 + (i % 3) * 40, 54 + Math.floor(i / 3) * 34, 34, 28, { rx: 4, cls: i === 2 || i === 3 || i === 7 ? "fx-acc" : "fx-card" }) + t(41 + (i % 3) * 40, 72 + Math.floor(i / 3) * 34, String(i), { fs: 10 })).join("") +
      t(83, 172, "nummerierte Blöcke", { fs: 10, cls: "fx-sub" }) + t(83, 188, "weiß nichts von Dateien", { fs: 10, cls: "fx-sub" }) + t(83, 212, "SATA · NVMe · SCSI · iSCSI", { fs: 10, fw: 600 })) +
    g({ st: 1 }, r(165, 20, 150, 210, { cls: "fx-soft", rx: 12 }) + t(240, 40, "File", { fw: 700 }) +
      t(180, 66, "📁 /shared", { a: "start", fs: 11 }) + t(192, 86, "📁 pricelists/", { a: "start", fs: 11 }) + t(204, 106, "📄 2026-spring.xlsx", { a: "start", fs: 10.5 }) + t(192, 126, "📁 workshop/", { a: "start", fs: 11 }) +
      t(240, 172, "Ordner, Unterordner, Dateien", { fs: 10, cls: "fx-sub" }) + t(240, 188, "NAS regelt Konflikte", { fs: 10, cls: "fx-sub" }) + t(240, 212, "SMB · NFS", { fs: 10, fw: 600 })) +
    g({ st: 2 }, r(322, 20, 150, 210, { cls: "fx-soft", rx: 12 }) + t(397, 40, "Object", { fw: 700 }) +
      box(334, 52, 126, 34, "ID: photos/trail29.jpg", { fs: 9, cls: "fx-info" }) + box(334, 90, 126, 30, "color=red · tier=Hot", { fs: 9.5, cls: "fx-vio" }) + box(334, 124, 126, 30, "Daten (Bytes)", { fs: 10, cls: "fx-card" }) +
      t(397, 172, "flacher Namespace", { fs: 10, cls: "fx-sub" }) + t(397, 188, "kein Dateisystem", { fs: 10, cls: "fx-sub" }) + t(397, 212, "HTTPS + REST (GET/PUT)", { fs: 10, fw: 600 })) +
    g({ st: 3 }, t(83, 244, "→ Managed Disks", { fs: 11, fw: 700, cls: "t-acc" }) + t(240, 244, "→ Azure Files", { fs: 11, fw: 700, cls: "t-acc" }) + t(397, 244, "→ Blob Storage", { fs: 11, fw: 700, cls: "t-acc" }))),
  steps: [
    "<b>Block-Storage</b>: Die Disk ist eine Reihe leerer, nummerierter Blöcke. Eine Datei belegt einige davon (markiert). Der Block-Storage selbst <b>weiß nichts von Dateien</b> – daraus werden Disks mit Partitionen und Dateisystem (ext4, APFS, NTFS).",
    "<b>File-Storage</b>: Ordner, Unterordner, Dateien. Das <b>NAS</b> liefert sie über SMB oder NFS und regelt, was passiert, wenn zwei gleichzeitig dieselbe Datei bearbeiten.",
    "<b>Object-Storage</b>: Jedes Objekt hat eine <b>ID</b>, <b>Metadaten</b> und die <b>Daten</b>. Kein Dateisystem, Zugriff über HTTP(S) und eine REST-API – ideal für Dateien, die man „irgendwo hinschmeißen“ will, etwa Videos.",
    "In Azure: Block = <b>Managed Disks</b>, File = <b>Azure Files</b>, Object = <b>Blob Storage</b>. Achtung: Block <i>Blobs</i> sind trotzdem Object-Storage."
  ] };

/* 2 · Storage Stamp: Front-end, Partition, Stream + Geo-Replikation */
F["itf-stamp"] = { title: "Hinter dem Endpoint: der Weg eines Schreibvorgangs",
  svg: () => svg(480, 260,
    g({ st: 0 }, laptop(40, 40) + t(40, 66, "Webshop", { fs: 10.5 }) + p("M62 40 L150 40", { cls: "acc", arrow: true, acc: true }) + t(106, 32, "PUT trail29.jpg", { fs: 9.5, cls: "fx-sub" })) +
    g({ st: 0 }, r(152, 14, 200, 236, { cls: "fx-ghost", rx: 12 }) + t(252, 30, "Storage Account · West Europe", { fs: 10.5, fw: 700 })) +
    g({ st: 1, hl: 1 }, lay(40, "fx-info", "Front-end Layer", "AuthN/AuthZ · Routing")) +
    g({ st: 2, hl: 2 }, lay(96, "fx-vio", "Partition Layer", "Dienste · Geo-Replikation") + l(252, 80, 252, 96, { cls: "acc", arrow: true, acc: true })) +
    g({ st: 3, hl: 3 }, lay(152, "fx-warn", "Stream Layer", "Bits auf mehreren Platten") + l(252, 136, 252, 152, { cls: "acc", arrow: true, acc: true }) +
      disk(198, 220) + disk(252, 220) + disk(306, 220) + l(220, 192, 198, 208, { cls: "thin" }) + l(252, 192, 252, 208, { cls: "thin" }) + l(284, 192, 306, 208, { cls: "thin" })) +
    g({ st: 4 }, p("M150 60 L64 60", { cls: "acc", arrow: true, acc: true }) + t(106, 76, "201 Created", { fs: 11, fw: 700, cls: "t-ok" })) +
    g({ st: 5 }, r(372, 80, 100, 140, { cls: "fx-soft", rx: 10 }) + t(422, 98, "North Europe", { fs: 10.5, fw: 700 }) + t(422, 112, "(Paired Region)", { fs: 9.5, cls: "fx-sub" }) +
      disk(394, 150, "fx-mute") + disk(422, 150, "fx-mute") + disk(450, 150, "fx-mute") + t(422, 190, "LRS", { fs: 10.5, fw: 600 }) +
      p("M340 116 C356 116 360 140 372 140", { cls: "fx-dashacc", arrow: true }) + t(422, 210, "async · RPO &lt; 15 min", { fs: 9, cls: "fx-sub" }) + dot("M340 116 C356 116 360 140 372 140", { dur: 2.4 }))),
  steps: [
    "Der Webshop schreibt <code>PUT https://murbikesweb.blob.core.windows.net/photos/trail29.jpg</code>. Hinter dem Endpoint liegt der Speicher in <b>drei Schichten</b>.",
    "<b>Front-end Layer</b>: klärt, <b>wer überhaupt zugreifen darf</b> – erst authentifizieren und autorisieren, dann geht es zu den unteren Schichten.",
    "<b>Partition Layer</b>: stellt die <b>Dienste</b> bereit: Blobs, Files, Queues und Tables.",
    "<b>Stream Layer</b>: hier geht es wirklich um die <b>Bits</b>: Sie liegen auf Festplatten an <b>mehreren Orten</b> – ähnlich wie bei einem RAID (LRS: drei Disks, ZRS: drei Zonen).",
    "Erst wenn alle drei Kopien geschrieben sind, bekommt der Webshop <b>201</b> – das ist <b>synchron</b>.",
    "Bei GRS/GZRS kopiert der <b>Partition Layer</b> danach <b>asynchron</b> in die Paired Region (dort wieder LRS). Bis die Kopie ankommt, entsteht ein Loch mit ungleichem Datenstand – die <b>RPO</b>, typisch unter 15 Minuten, garantiert ist nichts."
  ] };

/* 3 · Simulator: Redundanz & Ausfall (nach 01-redundancy.html) */
const RED = {
  LRS: { z: false, geo: false, ra: false, d: "11", sla: "99,9 %" }, ZRS: { z: true, geo: false, ra: false, d: "12", sla: "99,9 %" },
  GRS: { z: false, geo: true, ra: false, d: "16", sla: "99,9 %" }, "RA-GRS": { z: false, geo: true, ra: true, d: "16", sla: "99,99 %" },
  GZRS: { z: true, geo: true, ra: false, d: "16", sla: "99,9 %" }, "RA-GZRS": { z: true, geo: true, ra: true, d: "16", sla: "99,99 %" }
};
const OUT = { none: "Kein Ausfall", disk: "Disk", rack: "Rack", zone: "Zone 1 (Brand/Hochwasser)", region: "Region West Europe (Katastrophe)" };
F["itf-red"] = { title: "Simulator: Redundanz und Ausfall",
  svg: () => svg(480, 230, ""),
  ui: () => `<div class="seg">${Object.keys(RED).map((k, i) => `<label><input type="radio" name="red-o" value="${k}"${i === 2 ? " checked" : ""}> ${k}</label>`).join("")}</div>
    <div class="seg">${Object.entries(OUT).map(([k, v], i) => `<label><input type="radio" name="red-x" value="${k}"${i ? "" : " checked"}> ⚡ ${v}</label>`).join("")}</div>
    <div class="seg"><label><input type="radio" name="red-f" value="no" checked> kein Failover</label><label><input type="radio" name="red-f" value="unpl"> ungeplanter Failover</label></div>
    <div class="fig-out" data-o="res"></div>`,
  cap: "Wähle eine Redundanzoption und löse einen Ausfall aus. Grün = Kopie intakt, rot = Kopie verloren, grau = Sekundärregion (asynchron).",
  update: root => {
    const o = RED[val(root, "red-o")] || RED.GRS, x = val(root, "red-x") || "none", fo = val(root, "red-f") === "unpl";
    /* Kopien: Primär 3 Stück, je nach Option in 1 Rechenzentrum (3 Racks) oder 3 Zonen */
    const lostP = i => x === "region" || (x === "zone" && (o.z ? i === 0 : true)) || (x === "rack" && i === 0) || (x === "disk" && i === 0);
    const aliveP = [0, 1, 2].filter(i => !lostP(i)).length, regionDown = x === "region", zoneLrsDown = x === "zone" && !o.z;
    const survive = aliveP > 0 || o.geo, readP = !regionDown && !zoneLrsDown;
    const readable = readP || (o.geo && (o.ra || fo)), writable = readP || (o.geo && fo);
    let body = r(10, 18, 290, 196, { cls: "fx-soft", rx: 12 }) + t(155, 36, "Primär: West Europe", { fw: 700, fs: 12 });
    if (o.z) [0, 1, 2].forEach(i => { const X = 22 + i * 94; body += r(X, 48, 86, 120, { cls: x === "zone" && i === 0 || regionDown ? "fx-bad" : "fx-info", rx: 8 }) + t(X + 43, 64, "Zone " + (i + 1), { fs: 10.5, fw: 600 }) + disk(X + 43, 110, lostP(i) ? "fx-bad" : "fx-ok"); });
    else { body += r(22, 48, 274, 120, { cls: regionDown || x === "zone" ? "fx-bad" : "fx-info", rx: 8 }) + t(159, 64, "Zone 1 · ein Rechenzentrum", { fs: 10.5, fw: 600 }); [0, 1, 2].forEach(i => { body += t(70 + i * 88, 86, "Rack " + (i + 1), { fs: 9.5, cls: "fx-sub" }) + disk(70 + i * 88, 116, lostP(i) ? "fx-bad" : "fx-ok"); }); }
    body += t(155, 190, "synchron: 201 erst nach 3 Kopien", { fs: 10, cls: "fx-sub" }) + t(155, 206, readP ? "✓ Lesen und Schreiben" : "✕ 503 – kein Zugriff", { fs: 11, fw: 700, cls: readP ? "t-ok" : "t-bad" });
    if (o.geo) {
      body += r(316, 18, 154, 196, { cls: fo && regionDown ? "fx-ok" : "fx-soft", rx: 12 }) + t(393, 36, fo && regionDown ? "Neue Primärregion" : "Sekundär: North Europe", { fw: 700, fs: 11 }) +
        [0, 1, 2].map(i => disk(345 + i * 48, 104, "fx-mute")).join("") + t(393, 140, "LRS · asynchron", { fs: 10, cls: "fx-sub" }) +
        t(393, 160, o.ra ? "RA: Secondary Endpoint" : "nur nach Failover lesbar", { fs: 9.5, cls: "fx-sub" }) +
        t(393, 186, regionDown ? (o.ra || fo ? "✓ Lesen" : "✕ kein Zugriff") : (o.ra ? "✓ Lesen möglich" : "–"), { fs: 11, fw: 700, cls: regionDown ? (o.ra || fo ? "t-ok" : "t-bad") : "fx-sub" }) +
        (regionDown && fo ? t(393, 204, "✓ Schreiben (jetzt LRS)", { fs: 10, fw: 700, cls: "t-ok" }) : "") +
        p("M300 80 L316 80", { cls: "fx-dashacc", arrow: true }) + (regionDown ? "" : dot("M300 80 L316 80", { dur: 1.6 }));
    } else body += r(316, 18, 154, 196, { cls: "fx-mute", rx: 12 }) + tl(393, 110, "keine|Sekundärregion", { fs: 11, cls: "fx-sub" });
    q(root, ".fig-stage").innerHTML = svg(480, 230, body);
    const lost = !survive ? "<b class='t-bad'>Daten verloren</b> – alle Kopien lagen in der ausgefallenen Region/Zone." : regionDown ? (fo ? "Daten in North Europe erhalten – <b>Schreibvorgänge nach der Last Sync Time sind verloren</b>, der Account ist danach LRS." : "Daten in North Europe erhalten (die letzten Minuten evtl. nicht).") : "Daten vollständig erhalten.";
    q(root, "[data-o=res]").innerHTML = `<b>${val(root, "red-o")}</b> · ${o.geo ? 6 : 3} Kopien · Durability ${o.d} Neuner · Lese-SLA (Hot) ${o.sla}<br>⚡ ${OUT[x]}: ${lost}<br>Lesen: ${readable ? "✓" : "✕"} · Schreiben: ${writable ? "✓" : "✕"}${regionDown && o.geo && !fo && !o.ra ? " – erst ein Failover macht die Daten wieder zugänglich." : ""}${x === "zone" && !o.z ? " – bei LRS liegen alle Kopien in einem Rechenzentrum." : ""}`;
  } };

/* 4 · Rechner: Access Tiers & Lifecycle (nach 02-tiers.html) – Beispielpreise USD/GB bzw. pro 10.000 Lesevorgänge */
const PR = { hot: { s: 0.0184, rd: 0, op: 0.0044, min: 0 }, cool: { s: 0.01, rd: 0.01, op: 0.01, min: 1 }, cold: { s: 0.0036, rd: 0.03, op: 0.1, min: 3 }, arch: { s: 0.00099, rd: 0.022, op: 5.5, min: 6 } };
const TN = { hot: "Hot", cool: "Cool", cold: "Cold", arch: "Archive" };
F["itf-tier"] = { title: "Rechner: Welcher Access Tier ist am billigsten?",
  svg: () => svg(480, 200, ""),
  ui: () => `<label><span>Gespeicherte Daten: <b data-o="gb"></b></span><input type="range" min="0" max="40" value="20" data-i="gb"></label>
    <label><span>Davon gelesen pro Monat: <b data-o="rd"></b></span><input type="range" min="0" max="100" value="30" data-i="rd"></label>
    <label><span>Lesevorgänge pro Monat: <b data-o="ops"></b></span><input type="range" min="0" max="30" value="18" data-i="ops"></label>
    <label><span>Wie lange bleiben die Daten? <b data-o="mo"></b></span><input type="range" min="1" max="24" value="12" data-i="mo"></label>
    <div class="fig-out" data-o="res"></div>`,
  cap: "Beispielpreise (USD, LRS) – nur fürs Gefühl. Kalt = billig speichern, teuer lesen. Wer vor der Mindestdauer löscht, zahlt die Early-deletion Fee (Rest der Mindestdauer).",
  update: root => {
    const gbv = Math.round(Math.pow(10, 1 + +q(root, "[data-i=gb]").value / 10)), rdp = +q(root, "[data-i=rd]").value, ops = Math.round(Math.pow(10, 2 + +q(root, "[data-i=ops]").value / 6)), mo = +q(root, "[data-i=mo]").value;
    q(root, "[data-o=gb]").textContent = gbv >= 1000 ? fmt(gbv / 1000, 1) + " TB" : gbv + " GB"; q(root, "[data-o=rd]").textContent = rdp + " %"; q(root, "[data-o=ops]").textContent = ops.toLocaleString("de-AT"); q(root, "[data-o=mo]").textContent = mo + (mo === 1 ? " Monat" : " Monate");
    const cost = {}; for (const k in PR) { const P = PR[k], billMo = Math.max(mo, P.min); cost[k] = gbv * P.s * billMo + mo * (gbv * rdp / 100 * P.rd + ops / 10000 * P.op); }
    const ks = Object.keys(PR), mx = Math.max(...ks.map(k => cost[k])) || 1, best = ks.reduce((a, b) => cost[a] <= cost[b] ? a : b);
    let body = axes(70, 14, 390, 150);
    ks.forEach((k, i) => { const w = 360 * cost[k] / mx, y = 26 + i * 36; body += t(64, y + 15, TN[k], { a: "end", fs: 11.5, fw: 600 }) + r(72, y, Math.max(2, w), 22, { rx: 4, cls: k === best ? "fx-ok" : "fx-mute" }) + t(78 + Math.max(2, w), y + 15, "$ " + fmt(cost[k], 2), { a: "start", fs: 10.5, fw: k === best ? 700 : 400 }); });
    q(root, ".fig-stage").innerHTML = svg(480, 190, body + t(265, 184, "Gesamtkosten über die Laufzeit (Speicher + Abruf + Transaktionen + Early deletion)", { fs: 9.5, cls: "fx-sub" }));
    const early = ks.filter(k => PR[k].min > mo).map(k => `${TN[k]} (${PR[k].min * 30} Tage)`);
    q(root, "[data-o=res]").innerHTML = `Am günstigsten: <b>${TN[best]}</b> mit ≈ $ ${fmt(cost[best], 2)}.${early.length ? ` Early-deletion Fee fällt an bei: ${early.join(", ")}.` : ""}${best === "arch" ? " Achtung: Archive ist offline – Lesen erst nach Rehydrierung (bis 15 h)." : ""}${rdp >= 50 ? " Viel Lesen macht die kalten Tiers teuer." : ""}`;
  } };

/* 5 · Simulator: Netzwerkzugriff (nach 03-network.html) */
const CL = [
  ["inet", "Laptop im Internet", "öffentliche IP"], ["office", "Büro Graz", "öffentliche IP 203.0.113.10"], ["web", "Webserver", "Subnetz 1 im VNet"],
  ["erp", "ERP-Server", "Subnetz 2 im VNet"], ["vpn", "On-prem über VPN", "Leoben, Site-to-Site"], ["exfil", "Webserver → fremd", "Exfiltrationsversuch"]
];
F["itf-net"] = { title: "Simulator: Wer kommt an den Storage Account?",
  svg: () => svg(480, 250, ""),
  ui: () => `<div class="seg"><span class="faint" style="align-self:center">Public network access:</span><label><input type="radio" name="net-p" value="all" checked> alle Netze</label><label><input type="radio" name="net-p" value="sel"> ausgewählte Netze</label><label><input type="radio" name="net-p" value="off"> deaktiviert</label></div>
    <div class="seg"><label><input type="checkbox" data-i="ip"> Firewall: IP Büro Graz</label><label><input type="checkbox" data-i="se"> Service Endpoint (Subnetz 1)</label><label><input type="checkbox" data-i="pe"> Private Endpoint (10.0.2.5)</label><label><input type="checkbox" data-i="sep"> Service Endpoint Policy</label></div>
    <div class="fig-out" data-o="res"></div>`,
  cap: "Ziel der MurBikes-Challenge: Webserver und ERP kommen ran, Leoben über VPN auch, das Internet nicht – und der Kopierversuch in einen fremden Account scheitert.",
  update: root => {
    const pa = val(root, "net-p") || "all", ip = on(root, "ip"), se = on(root, "se"), pe = on(root, "pe"), sep = on(root, "sep");
    const ok = {
      inet: pa === "all", office: pa === "all" || (pa === "sel" && ip), web: pa === "all" || (pa === "sel" && se) || pe,
      erp: pe || pa === "all", vpn: pe, exfil: !(se && sep)
    };
    const why = {
      inet: ok.inet ? "öffentlich offen" : "blockiert", office: ok.office ? (pa === "all" ? "öffentlich offen" : "IP-Regel") : "keine IP-Regel",
      web: ok.web ? (pe ? "Private Endpoint" : pa === "all" ? "öffentlich" : "Service Endpoint") : "Subnetz nicht erlaubt", erp: ok.erp ? (pe ? "Private Endpoint" : "öffentlich") : "blockiert",
      vpn: ok.vpn ? "Private Endpoint über VPN" : "kein privater Weg", exfil: ok.exfil ? "möglich ⚠" : "Policy blockiert"
    };
    let body = r(300, 70, 170, 110, { cls: pa === "off" ? "fx-mute" : "fx-info", rx: 12 }) + db(385, 108) + t(385, 140, "murbikesdata", { fs: 11, fw: 700 }) + t(385, 156, pa === "off" ? "nur privat" : "öffentliche IP", { fs: 9.5, cls: "fx-sub" }) +
      (pe ? box(300, 186, 170, 26, "Private Endpoint 10.0.2.5", { fs: 10, cls: "fx-ok" }) : "") + lock(456, 84, { cls: pa === "all" ? "" : "fx-acc" });
    CL.forEach(([k, n], i) => { const y = 14 + i * 38, good = k === "exfil" ? !ok[k] : ok[k], Y2 = 125 + (i - 2.5) * 9;
      body += r(8, y, 160, 32, { rx: 8, cls: good ? "fx-ok" : "fx-bad" }) + t(88, y + 14, n, { fs: 10.5, fw: 600 }) + t(88, y + 27, (good ? "✓ " : "✕ ") + why[k], { fs: 9, cls: good ? "t-ok" : "t-bad" }) +
        (k === "exfil" ? p(`M168 ${y + 16} L226 ${y + 16}`, { cls: ok[k] ? "acc" : "thin", arrow: ok[k], acc: ok[k] }) + box(228, y + 4, 62, 24, "fremd", { fs: 9.5, cls: "fx-warn" })
          : p(`M168 ${y + 16} L298 ${Y2}`, { cls: ok[k] ? "acc" : "thin", arrow: ok[k], acc: ok[k] })); });
    q(root, ".fig-stage").innerHTML = svg(480, 250, body);
    const goal = !ok.inet && ok.web && ok.erp && ok.vpn && !ok.exfil;
    q(root, "[data-o=res]").innerHTML = goal ? "✓ <b>Challenge gelöst:</b> Nur das eigene Netz (und Leoben über VPN) kommt an die Daten, das Internet nicht, und die Service Endpoint Policy stoppt die Exfiltration."
      : `Noch nicht ideal: ${[ok.inet && "das Internet kommt ran", !ok.web && "der Webserver kommt nicht ran", !ok.erp && "das ERP kommt nicht ran", !ok.vpn && "Leoben über VPN braucht einen Private Endpoint", ok.exfil && "Daten können in einen fremden Account kopiert werden (Service Endpoint + Policy)"].filter(Boolean).join(" · ")}.`;
  } };

(window.STUDYOS_EXT = window.STUDYOS_EXT || {}).itinf = (window.STUDYOS_EXT.itinf || []).concat([{ id: "itinf-figs-v4", blocks: {
  "itv4-1": [{ t: "fig", id: "itf-bfo", at: 0 }],
  "itv4-3": [{ t: "fig", id: "itf-stamp", at: 0 }],
  "itv4-4": [{ t: "fig", id: "itf-red" }],
  "itv4-5": [{ t: "fig", id: "itf-tier" }],
  "itv4-7": [{ t: "fig", id: "itf-net" }]
} }]);
})();
