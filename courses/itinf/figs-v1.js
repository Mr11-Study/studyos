/* IT-Infrastruktur V1 · Grafiken & Animationen (Engine: js/figs.js, Einbau über ext-apply „blocks“) */
(function () {
const F = window.STUDYOS_FIG, { svg, g, t, tl, r, box, c, l, p, dot, cloud, server, user, db, laptop, phone, axes, fmt } = window.FX;
const bld = (x, y, w, h, label, o = {}) => g(o, `<path d="M${x} ${y + 16} L${x + w / 2} ${y} L${x + w} ${y + 16} Z" class="fx-mute"/>` + r(x + 4, y + 16, w - 8, h - 16, { rx: 3, cls: o.cls2 || "fx-card" }) + t(x + w / 2, y + h + 15, label, { fs: 11.5, fw: 600 }));

/* 1 · Vom Serverraum zur Cloud */
F["itf-cloud"] = { title: "Vom eigenen Serverraum zur Cloud",
  svg: () => svg(480, 240,
    g({ on: "0,1" }, bld(24, 60, 130, 120, "Eigener Serverraum") + server(66, 140) + server(112, 140)) +
    g({ st: 2 }, bld(24, 60, 130, 120, "Serverraum wird kleiner", { cls2: "fx-ghost" }) + server(89, 140, { cls: "fx-ghost" })) +
    laptop(240, 205) + t(240, 232, "Firma / Nutzer", { fs: 11, cls: "fx-sub" }) +
    l(222, 196, 140, 150, { cls: "acc", on: "0", flow: true }) +
    g({ st: 1 }, cloud(370, 92, 2.3) + t(370, 58, "Cloud-Anbieter", { fw: 700 }) +
      box(300, 76, 66, 24, "Compute", { fs: 11, cls: "fx-acc" }) + box(374, 76, 66, 24, "Netzwerk", { fs: 11, cls: "fx-acc" }) +
      box(300, 106, 66, 24, "Speicher", { fs: 11, cls: "fx-acc" }) + box(374, 106, 66, 24, "Analytics", { fs: 11, cls: "fx-acc" }) +
      p("M258 196 C300 180 330 160 350 140", { cls: "acc", flow: true, arrow: true, acc: true }) + t(330, 186, "über das Internet", { fs: 11, cls: "fx-sub" })) +
    g({ st: 2 }, r(392, 160, 84, 46, { cls: "fx-ok" }) + t(434, 179, "€ / Stunde", { fs: 11, fw: 700 }) + t(434, 196, "nach Verbrauch", { fs: 10, cls: "fx-sub" }))),
  steps: [
    "Früher betreibt jede Firma ihren eigenen Serverraum: kaufen, aufbauen, warten, kühlen. Der Strom läuft auch, wenn nachts niemand arbeitet.",
    "Cloud Computing heißt: Computing-Dienste wie Compute, Netzwerk, Speicher und Analytics kommen <b>über das Internet</b> vom Anbieter.",
    "Bezahlt wird nach Verbrauch, der eigene Serverraum schrumpft. Wie beim „Horseless Carriage“ beschreiben wir das Neue noch über das, was fehlt („kein eigener Server“)."
  ] };

/* 2 · NIST: 5 Merkmale */
const NIST = [["On-demand|self-service", "fx-soft"], ["Broad network|access", "fx-soft"], ["Resource|pooling", "fx-soft"], ["Rapid|elasticity", "fx-soft"], ["Measured|service", "fx-soft"]];
F["itf-nist"] = { title: "NIST SP 800-145: die 5 Merkmale einer Cloud",
  svg: () => { const cx = 240, cy = 128, R = 92;
    return svg(480, 260, c(cx, cy, 44, { cls: "fx-acc" }) + tl(cx, cy + 4, "Cloud|(NIST)", { cls: "fx-onacc", fw: 700 }) +
      NIST.map(([lab], i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5, x = cx + Math.cos(a) * R * 1.55, y = cy + Math.sin(a) * R * 1.12;
        return g({ st: i + 1 }, l(cx + Math.cos(a) * 46, cy + Math.sin(a) * 46, x - Math.cos(a) * 40, y - Math.sin(a) * 18, { cls: "acc" }) + box(x - 58, y - 20, 116, 40, lab, { cls: "fx-soft", fs: 11.5, lh: 13, hl: i === 4 ? 6 : undefined })); }).join("")); },
  steps: [
    "NIST definiert Cloud Computing über <b>fünf Merkmale</b>. Fehlt eines, ist es streng genommen keine Cloud. Klick dich durch.",
    "<b>On-demand self-service:</b> Du stellst Ressourcen selbst und automatisch bereit, ohne Ticket und ohne Menschen beim Anbieter. Beispiel: VM im Portal anlegen.",
    "<b>Broad network access:</b> Zugriff über das Netz mit Standardprotokollen, von beliebigen Geräten: Handy, Tablet, Laptop, Workstation.",
    "<b>Resource pooling:</b> Viele Kunden teilen sich die Hardware (Multi-Tenant). Den genauen Ort kennst du nicht, nur grob: Land, Region, Rechenzentrum.",
    "<b>Rapid elasticity:</b> Ressourcen wachsen und schrumpfen schnell mit der Nachfrage (scale out / scale in). Sie wirken fast unbegrenzt.",
    "<b>Measured service:</b> Der Verbrauch wird automatisch gemessen, überwacht und abgerechnet, transparent für Anbieter und Kunde.",
    "Prüfungsfalle: <b>„Pay-as-you-go“</b> ist kein eigenes Merkmal. Es folgt aus Measured service. Auch „Internet“ heißt korrekt Broad network access."
  ] };

/* 3 · Deployment-Modelle */
const orgs = (hl) => [["Org A", 70], ["Org B", 200], ["Org C", 330], ["Alle", 440]].map(([n, x], i) => g({}, i < 3 ? bld(x - 26, 178, 52, 34, n) : user(x, 196) + t(x, 228, "Allgemeinheit", { fs: 11, fw: 600 }))).join("");
F["itf-deploy"] = { title: "Die 4 Deployment-Modelle (NIST) und Multi-Cloud",
  svg: () => svg(480, 240, orgs() +
    /* Public */ g({ on: "0" }, cloud(250, 70, 2.6) + t(250, 74, "Public Cloud", { fw: 700 }) + [70, 200, 330, 440].map(x => l(x, 176, 250 + (x - 250) * 0.3, 104, { cls: "acc", flow: true })).join("")) +
    /* Private */ g({ on: "1" }, cloud(90, 70, 1.9) + t(90, 74, "Private Cloud", { fw: 700 }) + l(70, 176, 82, 100, { cls: "acc", flow: true }) + t(300, 70, "nur für Org A,", { fs: 12, cls: "fx-sub" }) + t(300, 88, "egal ob im eigenen Gebäude", { fs: 12, cls: "fx-sub" }) + t(300, 106, "oder beim Dienstleister", { fs: 12, cls: "fx-sub" })) +
    /* Community */ g({ on: "2" }, cloud(140, 66, 2.2) + t(140, 70, "Community Cloud", { fw: 700 }) + l(70, 176, 115, 98, { cls: "acc", flow: true }) + l(200, 176, 160, 98, { cls: "acc", flow: true }) + t(350, 76, "Org A + B mit", { fs: 12, cls: "fx-sub" }) + t(350, 94, "gemeinsamem Anliegen", { fs: 12, cls: "fx-sub" })) +
    /* Hybrid */ g({ on: "3" }, cloud(90, 70, 1.8) + t(90, 74, "Private", { fw: 700 }) + cloud(330, 70, 2.1) + t(330, 74, "Public", { fw: 700 }) + l(150, 64, 262, 64, { cls: "acc", both: true, acc: true, flow: true }) + t(206, 52, "verbunden", { fs: 11, cls: "fx-sub" }) + l(70, 176, 82, 100, { cls: "acc", flow: true })) +
    /* Multi */ g({ on: "4" }, cloud(130, 70, 1.9) + t(130, 74, "Azure", { fw: 700 }) + cloud(330, 70, 1.9) + t(330, 74, "AWS", { fw: 700 }) + l(70, 176, 118, 100, { cls: "acc", flow: true }) + l(80, 176, 310, 100, { cls: "acc", flow: true }) + tl(420, 132, "eigene API|je Anbieter", { fs: 11.5, cls: "t-warn", fw: 600 }))),
  steps: [
    "<b>Public Cloud:</b> offen für die Allgemeinheit. Keine Investitionen (CapEx), Bezahlung nur für das Genutzte. Sie liegt beim Cloud-Anbieter.",
    "<b>Private Cloud:</b> die fünf NIST-Merkmale, aber <b>exklusiv für eine Organisation</b>. Sie kann im eigenen Gebäude oder off-premises bei einem Dienstleister stehen.",
    "<b>Community Cloud:</b> exklusiv für eine Gemeinschaft von Organisationen mit gemeinsamen Anliegen (Mission, Security, Compliance).",
    "<b>Hybrid Cloud:</b> zwei oder mehr eigenständige Clouds, verbunden durch standardisierte Technik. Grund heute oft: Compliance, manche Daten bleiben lokal.",
    "<b>Multi-Cloud:</b> zwei oder mehr <b>Public</b> Clouds (z. B. Azure + AWS). Kein NIST-Modell. Problem: Jede Cloud hat eine eigene API, ein AWS-Skript läuft nicht auf Azure."
  ] };

/* 4 · Dedicated → VM → Container → Serverless */
const stack = (x, w, layers) => { let y = 214; return layers.map(([lab, cls, h = 26, parts]) => { y -= h + 3; const yy = y;
  if (parts) { const pw = (w - (parts.length - 1) * 4) / parts.length; return parts.map((pl, k) => box(x + k * (pw + 4), yy, pw, h, pl, { cls, fs: 10.5, lh: 12 })).join(""); }
  return box(x, yy, w, h, lab, { cls, fs: 11 }); }).join(""); };
F["itf-virt"] = { title: "Vom dedizierten Server zu Serverless",
  svg: () => svg(480, 250,
    [["1 · Dedicated", [["Hardware", "fx-mute"], ["Betriebssystem", "fx-card"], ["App A", "fx-acc", 60]]],
     ["2 · VMs", [["Hardware", "fx-mute"], ["Hypervisor", "fx-info"], ["", "fx-card", 26, ["OS", "OS"]], ["", "fx-acc", 31, ["A", "B"]]]],
     ["3 · Container", [["Hardware", "fx-mute"], ["Betriebssystem", "fx-card"], ["Container-Runtime", "fx-info"], ["", "fx-acc", 28, ["A", "B", "C"]]]],
     ["4 · Serverless", [["Hardware", "fx-mute"], ["FaaS-Runtime", "fx-info"], ["", "fx-acc", 28, ["ƒ", "ƒ", "ƒ", "ƒ"]]]]]
    .map(([title, layers], i) => g({ st: i }, t(14 + i * 117 + 52, 22, title, { fw: 700, fs: 12 }) + stack(14 + i * 117, 104, layers) +
      tl(66 + i * 117, 236, ["1 App =|1 Server", "jede VM|bootet ein OS", "teilen sich|ein OS", "nur bei|Requests aktiv"][i], { fs: 10, cls: "fx-sub", lh: 12 }))).join("") +
    g({ st: 4 }, l(20, 34, 460, 34, { cls: "acc", arrow: true, acc: true }) + t(240, 46, "kleinere Deployment Units · schnellerer Start · höhere Dichte", { fs: 10.5, cls: "t-acc", fw: 600 }))),
  steps: [
    "<b>Dedicated Server:</b> Jede Anwendung hat ihren eigenen physischen Server. Er ist für die Spitzenlast gekauft und läuft auch nachts im Leerlauf.",
    "<b>Virtualisierung:</b> Ein Hypervisor teilt einen Bare-Metal-Server in mehrere VMs. Bessere Auslastung, leicht verschiebbar, Golden Images. Aber jede VM bootet ein komplettes Betriebssystem.",
    "<b>Container:</b> packen nur App + Abhängigkeiten und teilen sich das Betriebssystem über eine Container-Runtime. Kleiner, schneller, de-facto-Standard.",
    "<b>Serverless / FaaS:</b> Die Plattform startet Funktionen nur bei eingehenden Requests (Time-Sharing). Ohne Last läuft nichts.",
    "Die Stufen schließen sich nicht aus. Je weiter rechts, desto kleiner die Einheit, die man ausliefert, und desto mehr übernimmt die Plattform."
  ] };

/* 5 · Serverless-Webshop */
const trig = (y, ic, a, fn, res, st) => g({ st }, box(6, y, 134, 36, a, { fs: 10.5, cls: "fx-card" }) +
  l(142, y + 18, 186, y + 18, { cls: "acc", arrow: true, acc: true }) + box(190, y, 118, 36, fn, { fs: 11, cls: "fx-acc" }) + l(310, y + 18, 352, y + 18, { cls: "acc", arrow: true, acc: true }) + box(356, y, 112, 36, res, { fs: 11, cls: "fx-ok" }) +
  dot(`M142 ${y + 18} L186 ${y + 18}`, { dur: 1.2 }) + dot(`M310 ${y + 18} L352 ${y + 18}`, { dur: 1.2, begin: 0.6 }));
F["itf-faas"] = { title: "Webshop mit Azure Functions: Code läuft nur bei Events",
  svg: () => svg(480, 240,
    g({ on: "0" }, box(150, 70, 180, 60, "0 Instanzen · 0 €", { cls: "fx-mute" }) + t(240, 150, "Nachts: keine Bestellung, nichts läuft", { cls: "fx-sub", fs: 12 }) + t(240, 40, "🌙", { fs: 26 })) +
    trig(20, "", "HTTP: Bestellung", "SendConfirmation", "Bestätigungsmail", 1) +
    trig(80, "", "Blob: Bild hochgeladen", "ResizeImage", "Thumbnails", 2) +
    trig(140, "", "Timer: 02:00", "DailySalesReport", "Bericht", 3) +
    g({ st: 4 }, [0, 1, 2, 3, 4].map(k => r(196 + k * 6, 188 - k * 4, 106, 26, { cls: "fx-soft", rx: 6 })).join("") + t(275, 232, "Black Friday: 5 … 500 Instanzen", { fs: 11, fw: 600 }) + t(90, 206, "Abrechnung pro", { fs: 11, cls: "fx-sub" }) + t(90, 220, "Ausführung (GB-s)", { fs: 11, cls: "fx-sub" }))),
  steps: [
    "Nachts bestellt niemand. Es läuft keine Funktion, also gibt es in der Public Cloud keine Kosten: <b>Scale to Zero</b>.",
    "<b>HTTP-Trigger:</b> Eine neue Bestellung kommt rein. Die Funktion SendConfirmation startet und verschickt die Bestellbestätigung.",
    "<b>Blob-Trigger:</b> Ein Produktbild wird hochgeladen. ResizeImage erzeugt die Thumbnails für den Shop.",
    "<b>Timer-Trigger:</b> Jede Nacht um 02:00 erstellt DailySalesReport den Verkaufsbericht.",
    "Am Black Friday startet die Plattform automatisch so viele Instanzen wie nötig. Abgerechnet wird pro Ausführung und Laufzeit. Grenzen: Cold Starts, Laufzeitlimits, Lock-in."
  ] };

/* 6 · Service-Schichten */
F["itf-layers"] = { title: "Die Service-Schichten: wer arbeitet auf welcher Ebene?",
  svg: () => svg(480, 230,
    [["Layer 1 · Hardware", "Rechenzentrum", "Server, Netzwerk, Storage", "fx-mute", 400],
     ["Layer 2 · IaaS", "Administrator", "VMs, Storage, Netzwerk, Elastizität", "fx-info", 340],
     ["Layer 3 · PaaS", "Developer", "APIs, Plattformdienste", "fx-vio", 280],
     ["Layer 4 · SaaS", "Kunde / User", "fertige Software", "fx-acc", 220]]
    .map(([n, who, what, cls, w], i) => { const y = 176 - i * 48, cx = 300, x = cx - w * 0.43;
      return g({ st: i }, r(x, y, w * 0.86, 40, { cls, rx: 6 }) + t(cx, y + 17, n, { fw: 700, cls: cls === "fx-acc" ? "fx-onacc" : "" }) + t(cx, y + 32, what, { fs: 10.5, cls: cls === "fx-acc" ? "fx-onacc" : "fx-sub" }) +
        user(18, y + 22, { cls: "acc" }) + t(36, y + 25, who, { a: "start", fs: 11.5, fw: 600 })); }).join("")),
  steps: [
    "Ganz unten: das <b>Rechenzentrum</b> mit physischen Servern, Netzwerk und Storage.",
    "<b>IaaS</b> für Administratoren: virtuelle Maschinen, Speicher und Netze zum Mieten. Am nächsten am eigenen Server, OS-Wartung macht der Kunde.",
    "<b>PaaS</b> für Developer: Der Anbieter verwaltet VMs und Betriebssystem, du deployst nur deine Anwendung (z. B. Azure App Service).",
    "<b>SaaS</b> für Endnutzer: fertige Software im Browser (Microsoft 365, Teams, Salesforce). Du lieferst nur deine Daten. Jede Schicht abstrahiert die darunter."
  ] };

/* 7 · Wer verwaltet was? (On-Prem / IaaS / PaaS / SaaS) */
const LAY = ["Daten und Zugriff", "Anwendungen", "Runtime", "Betriebssystem", "Virtueller Computer", "Compute · Netz · Speicher"];
const WHO = [[1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 0, 0], [1, 1, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0]];
F["itf-whomanages"] = { title: "Wer verwaltet was? Kunde vs. Anbieter",
  svg: () => svg(480, 240, LAY.map((n, i) => t(150, 58 + i * 28, n, { a: "end", fs: 11.5, fw: 600 })).join("") +
    ["On-prem", "IaaS", "PaaS", "SaaS"].map((m, j) => g({ st: j }, t(196 + j * 78, 30, m, { fw: 700 }) + LAY.map((_, i) => r(162 + j * 78, 42 + i * 28, 68, 24, { cls: WHO[j][i] ? "fx-acc" : "fx-mute", rx: 5 }) + t(196 + j * 78, 58 + i * 28, WHO[j][i] ? "Kunde" : "Anbieter", { fs: 10.5, cls: WHO[j][i] ? "fx-onacc" : "fx-sub" })).join(""))).join("") +
    g({ st: 4 }, r(158, 39, 316, 30, { cls: "fx-dashacc", rx: 6 }) + t(316, 222, "Daten und Zugriff bleiben immer beim Kunden", { fs: 11.5, cls: "t-acc", fw: 700 }))),
  steps: [
    "<b>On-premises:</b> Du verwaltest alles selbst, vom Rechenzentrum bis zu den Daten.",
    "<b>IaaS:</b> Der Anbieter übernimmt Hardware und Virtualisierung. Betriebssystem, Runtime und Anwendungen bleiben bei dir.",
    "<b>PaaS:</b> Jetzt gehören auch Betriebssystem und Runtime dem Anbieter. Du kümmerst dich um Anwendung und Daten.",
    "<b>SaaS:</b> Der Anbieter betreibt sogar die Anwendung. Wie bei „Pizza as a Service“: vom Selbermachen bis zum Essen im Restaurant.",
    "Wichtig: <b>Daten und Zugriff</b> sind in jeder Spalte deine Aufgabe, auch bei SaaS. Speicherst du Daten in Outlook, bist du verantwortlich, nicht Microsoft."
  ] };

/* 8 · Shared Responsibility */
const SR = [["Informationen & Daten", "KKKK"], ["Geräte (PC, Handy)", "KKKK"], ["Konten & Identitäten", "KKKK"], ["Identitäts-/Verzeichnis-Infra", "KKGG"], ["Anwendungen", "KKGA"], ["Netzwerkkontrollen", "KKGA"], ["Betriebssystem", "KKAA"], ["Physische Hosts", "KAAA"], ["Physisches Netzwerk", "KAAA"], ["Rechenzentrum", "KAAA"]];
const SRC = { K: ["fx-acc", "Kunde"], G: ["fx-warn", "geteilt"], A: ["fx-mute", "Anbieter"] };
F["itf-shared"] = { title: "Shared Responsibility: Sicherheit DER Cloud vs. IN der Cloud",
  svg: () => svg(480, 300, SR.map(([n], i) => t(168, 54 + i * 22, n, { a: "end", fs: 11, fw: 600 })).join("") +
    ["On-prem", "IaaS", "PaaS", "SaaS"].map((m, j) => g({ st: j }, t(208 + j * 72, 28, m, { fw: 700 }) + SR.map(([, w], i) => { const [cls, lab] = SRC[w[j]]; return r(176 + j * 72, 40 + i * 22, 64, 19, { cls, rx: 4 }) + t(208 + j * 72, 53.5 + i * 22, lab, { fs: 10, cls: cls === "fx-acc" ? "fx-onacc" : "fx-sub" }); }).join(""))).join("") +
    g({ st: 4 }, r(172, 37, 304, 68, { cls: "fx-dashacc", rx: 6 }) + t(324, 278, "Oben: immer Kunde · Unten (ab IaaS): immer Anbieter", { fs: 11, cls: "t-acc", fw: 700 }) + r(244, 191, 232, 68, { cls: "fx-ghost", rx: 6 }))),
  steps: [
    "<b>On-premises</b> trägst du die Verantwortung für alles, auch für Gebäude, Strom und Kabel.",
    "<b>IaaS:</b> Rechenzentrum, physisches Netz und Hosts gehen an den Anbieter. Betriebssystem, Netzwerkkontrollen und Anwendungen bleiben bei dir.",
    "<b>PaaS:</b> Das Betriebssystem übernimmt der Anbieter. Anwendungen, Netzwerkkontrollen und Identitäts-Infrastruktur sind geteilt.",
    "<b>SaaS:</b> Der Anbieter betreibt Anwendung und Netzwerkkontrollen. Trotzdem bleibt oben einiges bei dir.",
    "Merksatz: Der Anbieter sorgt für Sicherheit <b>der</b> Cloud, du für Sicherheit <b>in</b> der Cloud. Daten, Geräte, Konten bleiben immer bei dir. Die meisten Vorfälle sind Fehlkonfigurationen des Kunden."
  ] };

/* 9 · Composite SLA (interaktiv) */
const AV = [99, 99.5, 99.9, 99.95, 99.99, 99.999];
const pc = x => String(+(x * 100).toFixed(5)).replace(".", ",") + " %";
const down = a => { const h = (1 - a) * 8760; return h >= 24 ? fmt(h / 24, 2) + " Tage" : h >= 1 ? fmt(h, 1) + " h" : h * 60 >= 1 ? fmt(h * 60, 1) + " min" : fmt(h * 3600, 1) + " s"; };
F["itf-sla"] = { title: "SLA-Rechner: seriell vs. parallel",
  svg: () => svg(480, 170, ""),
  ui: () => `<div class="seg"><label><input type="radio" name="sla-m" value="s" checked> Seriell (alle nötig)</label><label><input type="radio" name="sla-m" value="p"> Parallel (eine reicht)</label></div>
    <label><span>Dienst 1: <b data-o="a1"></b></span><input type="range" min="0" max="5" value="3" data-i="a1"></label>
    <label><span>Dienst 2: <b data-o="a2"></b></span><input type="range" min="0" max="5" value="4" data-i="a2"></label>
    <div class="fig-out" data-o="res"></div>`,
  cap: "Seriell multiplizieren sich die Verfügbarkeiten, das Ergebnis wird schlechter als der schwächste Dienst. Parallel multiplizieren sich die Ausfälle, das Ergebnis wird besser als der beste.",
  update: root => {
    const q = s => root.querySelector(s), a1 = AV[+q("[data-i=a1]").value] / 100, a2 = AV[+q("[data-i=a2]").value] / 100, par = (q("input[name=sla-m]:checked") || {}).value === "p";
    q("[data-o=a1]").textContent = pc(a1); q("[data-o=a2]").textContent = pc(a2);
    const res = par ? 1 - (1 - a1) * (1 - a2) : a1 * a2;
    const b = (x, y, a, lab) => box(x, y, 120, 44, lab, { cls: "fx-soft", fs: 12 }) + t(x + 60, y + 58, pc(a), { fs: 11, cls: "fx-sub" });
    q(".fig-stage").innerHTML = svg(480, 170, user(26, 90) + (par
      ? l(44, 90, 90, 90, { cls: "acc" }) + p("M90 90 L130 46 L160 46", { cls: "acc", arrow: true, acc: true }) + p("M90 90 L130 124 L160 124", { cls: "acc", arrow: true, acc: true }) + b(162, 24, a1, "Region 1 · Dienst 1") + b(162, 102, a2, "Region 2 · Dienst 2") + dot("M44 90 L90 90 L130 46 L160 46", { dur: 1.6 }) + t(400, 80, "eine Kopie", { fs: 12, cls: "fx-sub" }) + t(400, 96, "reicht", { fs: 12, cls: "fx-sub" })
      : l(44, 90, 96, 90, { cls: "acc", arrow: true, acc: true }) + b(98, 68, a1, "App Service") + l(220, 90, 280, 90, { cls: "acc", arrow: true, acc: true }) + b(282, 68, a2, "SQL Database") + dot("M44 90 L96 90 M220 90 L280 90", { dur: 1.6 }) + t(240, 30, "beide müssen laufen", { fs: 12, cls: "fx-sub" })));
    q("[data-o=res]").innerHTML = `${par ? "1 − (1 − A₁) · (1 − A₂)" : "A₁ · A₂"} = <b>${pc(res)}</b> → max. Ausfall <b>${down(res)}</b> pro Jahr (${down(1 - (1 - res) / 12)} pro Monat).`;
  } };

/* 10 · Economies of Scale */
F["itf-scale"] = { title: "Economies of Scale: je größer, desto billiger pro Einheit",
  svg: () => svg(480, 240, axes(50, 24, 400, 170, "Größe des Rechenzentrums", "Kosten pro Server") +
    p("M58 40 C120 130 200 165 440 180", { cls: "acc fx-draw", st: 0 }) +
    g({ st: 1 }, c(80, 76, 6) + t(92, 72, "Serverraum im Keller", { a: "start", fs: 11.5, fw: 600 })) +
    g({ st: 1 }, c(210, 158, 6) + t(210, 146, "Firmen-Rechenzentrum", { fs: 11.5, fw: 600 })) +
    g({ st: 1 }, c(420, 179, 7, { cls: "fx-acc fx-pulse" }) + t(420, 166, "Hyperscaler", { fs: 11.5, fw: 700, a: "end" })) +
    g({ st: 2 }, box(232, 26, 240, 92, "", { cls: "fx-soft" }) + ["bis 30 % Rabatt beim Hardwarekauf", "Automatisierung spart Personal", "Strom: bessere PUE, billiger Einkauf", "Security-Kosten verteilen sich"].map((s, i) => t(242, 46 + i * 19, "• " + s, { a: "start", fs: 11 })).join(""))),
  steps: [
    "Je größer der Betreiber, desto weniger kostet eine einzelne Einheit (Server, MIPS, GB). Cloud ist vor allem eine <b>ökonomische</b> Entwicklung: „Es geht ums Geld.“",
    "Ein Serverraum im Keller ist pro Server teuer, ein Firmen-Rechenzentrum günstiger, ein Hyperscaler wie Azure am günstigsten.",
    "Warum? <b>Buying power</b> (bis 30 % Rabatt dank einheitlicher Hardware), <b>Automatisierung</b> (kaum Personal im RZ), <b>Strom</b> (bessere PUE) und fixe Kosten für <b>Security</b>, die sich auf viele Kunden verteilen."
  ] };

/* 11 · Workload-Kategorien */
const WL = [["Static", "M0 40 L180 40", "fx-sub"], ["Continuously changing", "M0 70 L180 18", ""], ["Periodic", "M0 64 C15 64 15 20 30 20 S45 64 60 64 S75 20 90 20 S105 64 120 64 S135 20 150 20 S165 64 180 64", ""], ["Unpredictable", "M0 62 L70 60 L80 12 L92 58 L180 62", ""]];
const wlPeak = [40, 18, 20, 12];
F["itf-workload"] = { title: "Workload-Kategorien: feste Kapazität vs. Cloud",
  svg: () => svg(480, 270, WL.map(([n, d], i) => { const x = 22 + (i % 2) * 234, y = 30 + Math.floor(i / 2) * 124;
    return g({ tf: `translate(${x} ${y})` }, t(0, -8, n, { a: "start", fw: 700 }) + `<line x1="0" y1="80" x2="200" y2="80" class="fx-ln thin"/><line x1="0" y1="0" x2="0" y2="80" class="fx-ln thin"/>` +
      g({ st: 1 }, r(0, wlPeak[i] - 6, 196, 86 - wlPeak[i], { cls: "fx-mute", rx: 0 }) + `<line x1="0" y1="${wlPeak[i] - 6}" x2="196" y2="${wlPeak[i] - 6}" class="fx-ln bad dash"/>`) +
      p(d, { cls: "acc", tf: "" }).replace("<path", `<path transform="translate(8 6)"`) +
      g({ st: 2 }, p(d, { cls: "ok dash" }).replace("<path", `<path transform="translate(8 0)"`))); }).join("") +
    g({ st: 1 }, `<line x1="230" y1="262" x2="248" y2="262" class="fx-ln bad dash"/>` + t(252, 266, "feste Kapazität (für die Spitze)", { a: "start", fs: 10.5 })) +
    g({ st: 2 }, `<line x1="22" y1="262" x2="40" y2="262" class="fx-ln ok dash"/>` + t(44, 266, "Cloud folgt der Last", { a: "start", fs: 10.5 }))),
  steps: [
    "Vier Formen von Lastkurven (Fehling et al.): <b>Static</b>, <b>Continuously changing</b>, <b>Periodic</b> und <b>Unpredictable</b>.",
    "On-premises musst du für die <b>Spitze</b> kaufen. Die graue Fläche unter der roten Linie ist bezahlt, aber meist ungenutzt (Überkapazität). Kaufst du weniger, verlierst du Kunden.",
    "In der Cloud folgt die Kapazität (grün) der Last. Je unruhiger die Kurve, desto mehr sparst du. Bei <b>Static</b> bringt die Cloud fast nichts."
  ] };

/* 12 · p/a-Regel (interaktiv) */
const PRE = { wm: [14.6, 4.8, "Wohnmobil: p/a ≈ 14,6, Miete 155 € statt 32 €/Tag (≈ 4,8×)"], st: [1.4, 1.5, "Pizza „Fast Food“ (static): p/a ≈ 1,4"], un: [17.1, 3, "Pizza „Familienwochenende“ (unpredictable): p/a ≈ 17,1"], ex: [4, 3, "Übung: Peak 12, Ø 3 Server → p/a = 4, Cloud 3× so teuer"] };
F["itf-pa"] = { title: "Die p/a-Regel ausprobieren: Wann ist die Cloud billiger?",
  svg: () => svg(480, 190, ""),
  ui: () => `<div class="seg">${Object.entries(PRE).map(([k, v]) => `<label><input type="radio" name="pa-pre" value="${k}"> ${v[2].split(":")[0]}</label>`).join("")}</div>
    <label><span>Spitze ÷ Durchschnitt (p/a): <b data-o="pa"></b></span><input type="range" min="1" max="20" step="0.1" value="5" data-i="pa"></label>
    <label><span>Cloud-Preis ÷ eigener Preis (c/d): <b data-o="cd"></b></span><input type="range" min="1" max="20" step="0.1" value="3" data-i="cd"></label>
    <div class="fig-out" data-o="res"></div>`,
  cap: "In-house zahlst du die Spitze die ganze Zeit (d · p). In der Cloud zahlst du nur den Durchschnitt, dafür teurer (c · a). Cloud gewinnt, wenn c/d < p/a.",
  update: root => {
    const q = s => root.querySelector(s), pre = q("input[name=pa-pre]:checked");
    if (pre && root._pre !== pre.value) { root._pre = pre.value; q("[data-i=pa]").value = PRE[pre.value][0]; q("[data-i=cd]").value = PRE[pre.value][1]; }
    const pa = +q("[data-i=pa]").value, cd = +q("[data-i=cd]").value; q("[data-o=pa]").textContent = fmt(pa, 1); q("[data-o=cd]").textContent = fmt(cd, 1) + "×";
    const inh = pa, cl = cd, mx = Math.max(inh, cl), H = 120, win = cd < pa;
    q(".fig-stage").innerHTML = svg(480, 190, axes(60, 20, 380, 140) +
      r(110, 160 - H * inh / mx, 110, H * inh / mx, { cls: win ? "fx-mute" : "fx-ok", rx: 4 }) + t(165, 152 - H * inh / mx, "In-house: d · p", { fw: 700 }) + t(165, 178, "Kapazität für die Spitze", { fs: 10.5, cls: "fx-sub" }) +
      r(280, 160 - H * cl / mx, 110, H * cl / mx, { cls: win ? "fx-ok" : "fx-mute", rx: 4 }) + t(335, 152 - H * cl / mx, "Cloud: c · a", { fw: 700 }) + t(335, 178, "nur der Durchschnitt", { fs: 10.5, cls: "fx-sub" }));
    q("[data-o=res]").innerHTML = (pre ? PRE[pre.value][2] + "<br>" : "") + `c/d = ${fmt(cd, 1)} ${win ? "&lt;" : cd === pa ? "=" : "&gt;"} p/a = ${fmt(pa, 1)} → <b>${win ? "Cloud ist billiger" : cd === pa ? "gleich teuer" : "eigene Hardware ist billiger"}</b>.`;
  } };

/* 13 · CapEx vs. OpEx */
F["itf-capex"] = { title: "CapEx vs. OpEx: Wie sich die Kosten über die Zeit verteilen",
  svg: () => svg(480, 240, axes(50, 20, 400, 180, "Zeit (Jahre)", "Kosten kumuliert") + [1, 2, 3, 4, 5].map(k => t(50 + k * 76, 216, k, { fs: 10.5, cls: "fx-sub" })).join("") +
    g({ st: 0 }, p("M52 200 L52 90 L126 82 L202 74 L278 66 L354 58 L428 50", { cls: "bad" }) + t(58, 112, "Server kaufen", { a: "start", fs: 11, fw: 600, cls: "t-bad" }) + t(300, 46, "CapEx: Abschreibung 3–5 Jahre", { fs: 11, cls: "t-bad" })) +
    g({ st: 1 }, p("M52 200 L90 192 L126 180 L164 186 L202 166 L240 150 L278 156 L316 128 L354 120 L392 96 L428 86", { cls: "ok" }) + t(390, 150, "OpEx: zahlen nach Nutzung", { fs: 11, cls: "t-ok" })) +
    g({ st: 2 }, box(64, 122, 150, 40, "Kapital vorab gebunden,|Kapazität für Jahre fix", { cls: "fx-bad", fs: 10.5, lh: 13 }) + box(300, 172, 150, 22, "Kosten folgen der Nutzung", { cls: "fx-ok", fs: 10.5 }))),
  steps: [
    "<b>CapEx</b> (Capital Expenditure): Du kaufst Server vorab. Viel Geld am Anfang, in der Bilanz als Vermögen, abgeschrieben über 3–5 Jahre.",
    "<b>OpEx</b> (Operational Expenditure): Du zahlst laufend nach Bedarf (pay-as-you-go), sofort als Aufwand verbucht.",
    "Die Cloud verschiebt IT von fixen zu variablen Kosten. Vorsicht: Variable Kosten können auch unerwartet steigen, z. B. durch vergessene VMs oder Egress-Gebühren."
  ] };

/* Einbau in die Lektionen (at = Position im Original, 0 = direkt nach der Einleitung) */
(window.STUDYOS_EXT = window.STUDYOS_EXT || {}).itinf = (window.STUDYOS_EXT.itinf || []).concat([{ id: "itinf-figs-v1", blocks: {
  "itg1-1": [{ t: "fig", id: "itf-cloud", at: 0 }],
  "itg1-2": [{ t: "fig", id: "itf-nist", at: 0 }],
  "itg1-3": [{ t: "fig", id: "itf-deploy", at: 0 }],
  "itg2-1": [{ t: "fig", id: "itf-virt", at: 0 }],
  "itg2-2": [{ t: "fig", id: "itf-faas", at: 0 }],
  "itg3-1": [{ t: "fig", id: "itf-layers", at: 0 }],
  "itg3-2": [{ t: "fig", id: "itf-whomanages", at: 0 }],
  "itg3-3": [{ t: "fig", id: "itf-shared", at: 0 }],
  "itg3-4": [{ t: "fig", id: "itf-sla" }],
  "itg4-1": [{ t: "fig", id: "itf-scale", at: 0 }],
  "itg4-2": [{ t: "fig", id: "itf-workload", at: 0 }],
  "itg4-3": [{ t: "fig", id: "itf-pa" }],
  "itg4-4": [{ t: "fig", id: "itf-capex", at: 0 }]
} }]);
})();
