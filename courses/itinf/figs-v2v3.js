/* IT-Infrastruktur V2 + V3 · Grafiken & Animationen (Engine: js/figs.js) */
(function () {
const F = window.STUDYOS_FIG, { svg, g, t, tl, r, box, c, l, p, dot, cloud, server, user, db, laptop, phone, lock, key, axes, fmt } = window.FX;
const dc = (x, y, o = {}) => g(o, r(x - 9, y - 8, 18, 16, { rx: 2, cls: o.cls || "fx-card" }) + `<line x1="${x - 5}" y1="${y - 2}" x2="${x + 5}" y2="${y - 2}" class="fx-ln thin"/><line x1="${x - 5}" y1="${y + 3}" x2="${x + 5}" y2="${y + 3}" class="fx-ln thin"/>`);

/* 1 · Rechenzentrum → Zone → Region → Region Pair → Geography */
const zoneBox = (x, y, st, n) => g({ st }, r(x, y, 50, 46, { cls: "fx-info", rx: 6 }) + t(x + 25, y + 13, "Zone " + n, { fs: 9.5, fw: 600 }) + dc(x + 15, y + 30) + dc(x + 35, y + 30));
const region = (x, name, city) => r(x, 64, 182, 128, { cls: "fx-soft", rx: 10 }) + t(x + 91, 82, name, { fw: 700 }) + t(x + 91, 96, city, { fs: 10.5, cls: "fx-sub" });
F["itf-geo"] = { title: "Von Rechenzentrum bis Geography: die physische Landkarte von Azure",
  svg: () => svg(480, 250,
    g({ st: 4 }, r(8, 26, 464, 200, { cls: "fx-ghost", rx: 14 }) + t(240, 44, "Geography: Europe", { fw: 700, cls: "t-acc" })) +
    g({ st: 2 }, region(24, "Region West Europe", "(Amsterdam)")) +
    g({ st: 3 }, region(274, "Region North Europe", "(Dublin)") + l(208, 128, 272, 128, { cls: "acc", both: true, acc: true }) + tl(240, 114, "≥ 300|Meilen", { fs: 10, fw: 700, cls: "t-acc", lh: 12 }) + tl(240, 150, "Region|Pair", { fs: 10, cls: "fx-sub", lh: 12 })) +
    g({ st: 0 }, dc(46, 138, { cls: "fx-acc" })) +
    zoneBox(31, 108, 1, 1) + zoneBox(88, 108, 1, 2) + zoneBox(145, 108, 1, 3) +
    g({ st: 3 }, zoneBox(281, 108, 3, 1) + zoneBox(338, 108, 3, 2) + zoneBox(395, 108, 3, 3)) +
    g({ st: 1 }, t(115, 176, "eigener Strom, Kühlung, Netz", { fs: 10, cls: "fx-sub" }) + t(115, 188, "&lt; 2 ms zwischen den Zonen", { fs: 10, cls: "fx-sub" })) +
    g({ st: 5 }, p("M40 238 C160 214 320 214 440 238", { cls: "acc", flow: true }) + t(240, 246, "Microsoft Global Network: Verkehr bleibt im eigenen Glasfasernetz", { fs: 10.5, fw: 600 }))),
  steps: [
    "Ganz unten steht ein <b>Rechenzentrum</b>: ein physisches Gebäude mit Servern. Azure hat über 400 davon.",
    "Eine <b>Availability Zone</b> sind physisch getrennte Rechenzentren in einer Region, mit eigenem Strom, Kühlung und Netz. Mindestens 3 pro zonenfähiger Region, &lt; 2 ms Round-Trip.",
    "Eine <b>Region</b> besteht aus einem oder mehreren Rechenzentren in enger Nähe. Beim Anlegen jeder Ressource wählst du eine Region, am besten nahe bei deinen Kunden (Latenz).",
    "Ein <b>Region Pair</b> sind zwei Regionen derselben Geography, mindestens 300 Meilen auseinander. Updates gehen nacheinander, eine Region wird bei Großausfällen bevorzugt wiederhergestellt. Die Kopie dort musst du selbst einrichten.",
    "Eine <b>Geography</b> (Americas, Europe, Asia Pacific, Middle East &amp; Africa) hält Daten im selben Rechtsraum: Data Residency und Compliance.",
    "Alles ist über das <b>Microsoft Global Network</b> verbunden: über 300.000 Meilen Glasfaser und Seekabel. Verkehr zwischen den Rechenzentren bleibt im Microsoft-Netz."
  ] };

/* 2 · Availability Zones: Ausfall einer Zone */
F["itf-az"] = { title: "Availability Zones: Was passiert, wenn ein Rechenzentrum ausfällt?",
  svg: () => { const Z = [80, 240, 400];
    return svg(480, 260, r(10, 70, 460, 180, { cls: "fx-soft", rx: 12 }) + t(462, 88, "Region Austria East (rund um Wien)", { fw: 700, a: "end" }) +
      Z.map((x, i) => g({}, r(x - 62, 100, 124, 136, { cls: i === 0 ? "fx-info" : "fx-info", rx: 8, }) + t(x, 118, "Zone " + (i + 1), { fw: 700 }) + t(x, 228, "eigener Strom & Netz", { fs: 8.5, cls: "fx-sub" }))).join("") +
      g({ on: "2,4" }, r(18, 100, 124, 136, { cls: "fx-bad", rx: 8 }) + t(80, 118, "Zone 1", { fw: 700 }) + t(80, 210, "⚡ Ausfall", { fw: 700, cls: "t-bad" })) +
      g({ on: "1" }, server(80, 172, { cls: "acc" }) + t(80, 196, "1 VM", { fs: 11 }) + t(240, 172, "SLA 99,9 %", { fw: 700 }) + t(240, 188, "≈ 8,8 h Ausfall/Jahr", { fs: 11, cls: "fx-sub" })) +
      g({ on: "2" }, server(80, 172, { cls: "bad" }) + t(240, 172, "Anwendung offline", { fw: 700, cls: "t-bad" })) +
      g({ on: "3,4" }, server(80, 172, { cls: "acc" }) + server(240, 172, { cls: "acc" }) + t(400, 172, "SLA 99,99 %", { fw: 700 }) + t(400, 188, "≈ 53 min/Jahr", { fs: 11, cls: "fx-sub" })) +
      g({ on: "4" }, server(80, 172, { cls: "bad" })) +
      user(240, 24) + g({ st: 1 }, box(190, 44, 100, 22, "Load Balancer", { fs: 10.5, cls: "fx-card", on: "3,4" })) +
      g({ on: "1,2" }, l(240, 40, 80, 150, { cls: "acc", flow: true })) +
      g({ on: "3" }, l(225, 66, 80, 150, { cls: "acc", flow: true }) + l(255, 66, 240, 150, { cls: "acc", flow: true })) +
      g({ on: "4" }, l(255, 66, 240, 150, { cls: "ok", flow: true }) + t(240, 208, "läuft weiter ✓", { fw: 700, cls: "t-ok" }))); },
  steps: [
    "Eine zonenfähige Region hat <b>mindestens drei Zonen</b>. Jede hat eigenen Strom, eigene Kühlung und eigenes Netz. Du wählst nur „Zone 1, 2 oder 3“, nie ein bestimmtes Gebäude.",
    "<b>Eine einzelne VM</b> (Premium Storage) in Zone 1: SLA 99,9 %. Sie ist ein <b>zonaler</b> Dienst, also an diese Zone gebunden.",
    "Fällt Zone 1 aus (Brand, Strom, Kühlung), ist die Anwendung <b>offline</b>. Eine größere VM hätte nicht geholfen.",
    "Besser: <b>zwei VMs in zwei Zonen</b> hinter einem Load Balancer. SLA 99,99 %. Die Daten zwischen den VMs musst du selbst replizieren.",
    "Fällt jetzt Zone 1 aus, schickt der Load Balancer alle Anfragen an Zone 2. Die Anwendung <b>läuft weiter</b>. Gegen den Ausfall einer ganzen Region hilft erst das Region Pair."
  ] };

/* 3 · PUE (interaktiv) */
F["itf-pue"] = { title: "PUE ausprobieren: Wie viel Strom braucht ein Rechenzentrum wirklich?",
  svg: () => svg(480, 170, ""),
  ui: () => `<label><span>PUE: <b data-o="pue"></b></span><input type="range" min="1" max="2.5" step="0.05" value="1.5" data-i="pue"></label><div class="fig-out" data-o="res"></div>`,
  cap: "Beispiel der Folie: 90.000 Server à 500 W rund um die Uhr = 394,2 GWh IT-Strom pro Jahr. PUE = Gesamtenergie ÷ IT-Energie. 1,0 wäre perfekt, Hyperscaler schaffen ≈ 1,1, die Folie rechnet mit 1,5.",
  update: root => {
    const q = s => root.querySelector(s), pue = +q("[data-i=pue]").value, it = 394.2, tot = it * pue, city = 525, mx = 1000, W = 360;
    q("[data-o=pue]").textContent = fmt(pue, 2);
    q(".fig-stage").innerHTML = svg(480, 170,
      t(10, 34, "Rechenzentrum", { a: "start", fw: 700 }) + r(110, 18, W * it / mx, 26, { cls: "fx-acc", rx: 4 }) + t(116, 36, "IT 394 GWh", { a: "start", fs: 11, cls: "fx-onacc", fw: 600 }) +
      r(110 + W * it / mx, 18, W * (tot - it) / mx, 26, { cls: "fx-warn", rx: 4 }) + t(116 + W * tot / mx, 36, fmt(tot, 0) + " GWh", { a: "start", fs: 11, fw: 700 }) +
      t(10, 80, "Stadt", { a: "start", fw: 700 }) + t(10, 94, "300.000 Einw.", { a: "start", fs: 10.5, cls: "fx-sub" }) + r(110, 70, W * city / mx, 26, { cls: "fx-mute", rx: 4 }) + t(116 + W * city / mx, 88, "525 GWh Haushaltsstrom", { a: "start", fs: 11 }) +
      r(110, 130, 14, 12, { cls: "fx-acc", rx: 2 }) + t(130, 140, "IT-Geräte (Server, Storage, Netz)", { a: "start", fs: 10.5 }) + r(330, 130, 14, 12, { cls: "fx-warn", rx: 2 }) + t(350, 140, "Kühlung, Licht, Verluste", { a: "start", fs: 10.5 }));
    q("[data-o=res]").innerHTML = `394,2 GWh × ${fmt(pue, 2)} = <b>${fmt(tot, 1)} GWh</b> pro Jahr. Davon gehen <b>${fmt(tot - it, 1)} GWh</b> nicht in die Rechner. ${tot > city ? "Mehr als der Haushaltsstrom einer Stadt mit 300.000 Einwohnern." : "Weniger als der Haushaltsstrom einer Stadt mit 300.000 Einwohnern."}`;
  } };

/* 4 · Resource Groups & Tags */
const res = (x, y, ic, n, reg, o = {}) => g(o, r(x, y, 96, 52, { cls: "fx-card", rx: 8 }) + ic(x + 22, y + 26) + t(x + 62, y + 22, n, { fs: 11, fw: 600 }) + t(x + 62, y + 38, reg, { fs: 9.5, cls: "fx-sub" }));
const vmI = (x, y) => server(x, y + 6, { cls: "acc" }), dbI = (x, y) => db(x, y + 2, { cls: "acc" }), stI = (x, y) => g({}, r(x - 12, y - 10, 24, 20, { cls: "fx-soft", rx: 3 })), netI = (x, y) => g({}, c(x - 8, y, 4) + c(x + 8, y - 6, 4) + c(x + 8, y + 6, 4) + `<line x1="${x - 8}" y1="${y}" x2="${x + 8}" y2="${y - 6}" class="fx-ln"/><line x1="${x - 8}" y1="${y}" x2="${x + 8}" y2="${y + 6}" class="fx-ln"/>`);
F["itf-rg"] = { title: "Resource Group: der Ordner für Ressourcen mit gleichem Lebenszyklus",
  svg: () => svg(480, 250,
    g({ st: 1 }, r(14, 30, 452, 160, { cls: "fx-soft", rx: 12 }) + t(30, 52, "📁 rg-webshop-test", { a: "start", fw: 700 })) +
    g({ on: "0,1,2" }, res(34, 70, vmI, "VM", "West Europe") + res(142, 70, dbI, "SQL DB", "West Europe") + res(250, 70, stI, "Storage", "North Europe") + res(358, 70, netI, "VNet", "West Europe")) +
    g({ on: "3" }, [34, 142, 250, 358].map(x => r(x, 70, 96, 52, { cls: "fx-bad", rx: 8 }) + t(x + 48, 100, "gelöscht", { fw: 700, cls: "t-bad" })).join("")) +
    g({ st: 2, on: "2" }, [34, 142, 250, 358].map(x => r(x + 4, 132, 88, 20, { cls: "fx-warn", rx: 10 }) + t(x + 48, 146, "Env = Test", { fs: 10 })).join("") + [34, 142, 250, 358].map(x => r(x + 4, 158, 88, 20, { cls: "fx-warn", rx: 10 }) + t(x + 48, 172, "CostCenter = 4711", { fs: 9.5 })).join("")) +
    g({ on: "1" }, t(240, 150, "jede Ressource in genau einer RG · Regionen dürfen verschieden sein", { fs: 11, cls: "fx-sub" })) +
    g({ on: "2" }, t(240, 210, "Tags = Name-Wert-Paare → Kosten pro Kostenstelle zusammenfassen", { fs: 11.5, fw: 600 })) +
    g({ on: "3" }, t(240, 210, "RG löschen = alle Ressourcen darin löschen", { fs: 12, fw: 700, cls: "t-bad" })) +
    g({ on: "0" }, t(240, 30, "Ressourcen: Bausteine wie VM, Datenbank, Storage, Netzwerk", { fs: 11.5, fw: 600 }))),
  steps: [
    "<b>Ressourcen</b> sind die Bausteine einer Cloud-Lösung: Virtual Machines, SQL-Datenbanken, Storage Accounts, virtuelle Netzwerke, App Services, Functions.",
    "Eine <b>Resource Group</b> ist ein Container (wie ein Ordner). Jede Ressource liegt in genau einer RG. Die Ressourcen darin dürfen in verschiedenen Regionen liegen und lassen sich verschieben.",
    "<b>Tags</b> sind Name-Wert-Paare (Environment = Test, CostCenter = 4711). Sie ordnen Ressourcen und fassen die Abrechnung zusammen.",
    "Weil eine RG Ressourcen mit <b>gleichem Lebenszyklus</b> bündelt, gilt: RG löschen = alles darin löschen. Praktisch für Testumgebungen, gefährlich in Produktion."
  ] };

/* 5 · Azure Resource Manager */
const TOOLS = ["Azure Portal", "Azure CLI", "PowerShell", "REST API", "Cloud Shell", "Mobile App"];
F["itf-arm"] = { title: "Azure Resource Manager: jeder Weg führt durch denselben Türsteher",
  svg: () => svg(480, 250, TOOLS.map((n, i) => box(8, 14 + i * 38, 104, 30, n, { fs: 11, cls: "fx-card", st: 0 })).join("") +
    g({ st: 1 }, TOOLS.map((_, i) => l(114, 29 + i * 38, 186, 125, { cls: "acc", arrow: true, acc: true })).join("") + TOOLS.map((_, i) => dot(`M114 ${29 + i * 38} L186 125`, { dur: 1.6, begin: i * 0.25 })).join("")) +
    g({ st: 1 }, r(190, 70, 110, 110, { cls: "fx-acc", rx: 12 }) + tl(245, 120, "Azure|Resource|Manager", { cls: "fx-onacc", fw: 700 })) +
    g({ st: 2 }, box(180, 186, 130, 22, "Entra ID: wer?", { fs: 10, cls: "fx-info" }) + box(180, 212, 130, 22, "RBAC + Policy: darf?", { fs: 10, cls: "fx-vio" })) +
    g({ st: 3 }, [["VMs", 40], ["Storage", 100], ["Netzwerk", 160], ["SQL", 220]].map(([n, y]) => l(302, 125, 360, y - 4, { cls: "acc", arrow: true, acc: true }) + box(362, y - 20, 108, 32, n, { fs: 11, cls: "fx-ok" })).join("") + dot("M302 125 L360 96", { dur: 1.4 }))),
  steps: [
    "Es gibt viele Werkzeuge: <b>Portal</b>, <b>Azure CLI</b>, <b>Azure PowerShell</b>, <b>REST API</b>, <b>Cloud Shell</b> und die <b>Mobile App</b>.",
    "Alle schicken ihre Anfragen an denselben Dienst: den <b>Azure Resource Manager</b> (ARM). Er ist die Verwaltungsschicht zum Erstellen, Ändern und Löschen.",
    "ARM prüft zuerst: Wer bist du (<b>Entra ID</b>)? Darfst du das (<b>RBAC</b>)? Hält es die Regeln ein (<b>Azure Policy</b>)?",
    "Erst dann legt ARM die Ressourcen an. Weil alles über ARM läuft, bekommst du mit jedem Werkzeug <b>dasselbe Ergebnis</b>."
  ] };

/* 6 · Hierarchie & Vererbung */
const node = (x, y, w, lab, cls, o = {}) => box(x - w / 2, y - 14, w, 28, lab, Object.assign({ fs: 10.5, cls }, o));
F["itf-mg"] = { title: "Management Groups, Subscriptions, Resource Groups: wer erbt was?",
  svg: () => svg(480, 260,
    g({ st: 2 }, node(240, 24, 130, "Root Management Group", "fx-vio") + l(240, 38, 130, 64, {}) + l(240, 38, 350, 64, {}) + node(130, 78, 120, "MG Production", "fx-vio", { hl: 3 }) + node(350, 78, 120, "MG Development", "fx-vio")) +
    g({ st: 1 }, node(70, 134, 100, "Sub Webshop", "fx-info") + node(190, 134, 100, "Sub HR", "fx-info") + node(350, 134, 110, "Sub Test", "fx-info") + g({ st: 2 }, l(130, 92, 70, 120, {}) + l(130, 92, 190, 120, {}) + l(350, 92, 350, 120, {}))) +
    g({ st: 0 }, node(40, 190, 70, "rg-web", "fx-soft") + node(112, 190, 70, "rg-db", "fx-soft") + node(190, 190, 70, "rg-hr", "fx-soft") + node(350, 190, 80, "rg-test", "fx-soft") +
      [40, 112, 190, 350].map(x => r(x - 26, 216, 16, 14, { cls: "fx-card", rx: 2 }) + r(x - 6, 216, 16, 14, { cls: "fx-card", rx: 2 }) + r(x + 14, 216, 12, 14, { cls: "fx-card", rx: 2 })).join("") +
      t(240, 250, "Ressourcen", { fs: 10.5, cls: "fx-sub" }) + g({ st: 1 }, l(70, 148, 40, 176, {}) + l(70, 148, 112, 176, {}) + l(190, 148, 190, 176, {}) + l(350, 148, 350, 176, {}))) +
    g({ st: 3 }, box(14, 40, 92, 22, "Policy: nur West US", { fs: 9.5, cls: "fx-warn" }) + p("M130 92 L70 120", { cls: "warn", flow: true }) + p("M130 92 L190 120", { cls: "warn", flow: true }) + p("M70 148 L40 176", { cls: "warn", flow: true }) + p("M70 148 L112 176", { cls: "warn", flow: true }) + p("M190 148 L190 176", { cls: "warn", flow: true })) +
    g({ st: 2 }, t(470, 30, "max. 6 Ebenen", { a: "end", fs: 10, cls: "fx-sub" }) + t(470, 44, "10.000 MGs/Verzeichnis", { a: "end", fs: 10, cls: "fx-sub" }))),
  steps: [
    "Unten: <b>Ressourcen</b> liegen in <b>Resource Groups</b>. Ohne Resource Group keine Ressource.",
    "Resource Groups liegen in <b>Subscriptions</b>. Eine Subscription ist die Grenze für Abrechnung (billing boundary) und Zugriff (access control boundary).",
    "Darüber ordnen <b>Management Groups</b> die Subscriptions, z. B. Production und Development. Der Baum ist bis zu 6 Ebenen tief (ohne Root und Subscription-Ebene).",
    "Eine Policy auf <b>MG Production</b> („VMs nur in West US“) wird an alle Subscriptions, Resource Groups und Ressourcen darunter <b>vererbt</b>. Development ist nicht betroffen."
  ] };

/* 7 · Azure Policy */
F["itf-policy"] = { title: "Azure Policy: vom Regelwerk zur Compliance",
  svg: () => svg(480, 230,
    box(10, 20, 100, 44, "Policy|Definition", { fs: 11, cls: "fx-card", st: 0 }) +
    g({ st: 1 }, l(112, 42, 138, 42, { cls: "acc", arrow: true, acc: true }) + box(140, 14, 104, 56, "Initiative|(mehrere Policies)", { fs: 10.5, cls: "fx-soft" })) +
    g({ st: 2 }, l(246, 42, 272, 42, { cls: "acc", arrow: true, acc: true }) + box(274, 20, 92, 44, "Zuweisen|an Scope", { fs: 11, cls: "fx-vio" }) + t(320, 80, "MG · Sub · RG", { fs: 10, cls: "fx-sub" })) +
    g({ st: 3 }, l(368, 42, 390, 42, { cls: "acc", arrow: true, acc: true }) + box(392, 20, 80, 44, "Compliance|ermitteln", { fs: 11, cls: "fx-acc" }) + t(432, 80, "alle 24 h", { fs: 10, cls: "fx-sub" })) +
    g({ st: 3 }, [["VM West US", 1], ["VM East Asia", 0], ["Storage", 1], ["VM West US", 1]].map(([n, ok], i) => box(30 + i * 110, 112, 96, 40, n, { fs: 10.5, cls: ok ? "fx-ok" : "fx-bad" }) + t(78 + i * 110, 168, ok ? "konform" : "nicht konform", { fs: 10, cls: ok ? "t-ok" : "t-bad", fw: 700 })).join("")) +
    g({ st: 4 }, l(188, 174, 188, 190, { cls: "ok", arrow: true }) + box(120, 192, 170, 28, "Remediation Task behebt", { fs: 10.5, cls: "fx-ok" }))),
  steps: [
    "Eine <b>Policy Definition</b> beschreibt eine Regel, z. B. „Erlaubte Regionen: West US“ oder „Jede Ressource braucht den Tag CostCenter“.",
    "Mehrere Policies lassen sich zu einer <b>Initiative</b> bündeln, z. B. alle Regeln für einen Sicherheitsstandard.",
    "Die Policy oder Initiative wird einem <b>Scope</b> zugewiesen: Management Group, Subscription oder Resource Group. Alles darunter erbt sie.",
    "Azure Policy wertet aus und findet <b>nicht konforme</b> Ressourcen: regelmäßig alle 24 Stunden, neue Zuweisungen nach etwa 5 Minuten oder auf Knopfdruck.",
    "Mit <b>Remediation Tasks</b> lassen sich nicht konforme Ressourcen nachträglich korrigieren. Ziel: Compliance, Kostenkontrolle, Sicherheit, einheitliches Design."
  ] };

/* 8 · MFA-Faktoren */
F["itf-mfa"] = { title: "Authentifizierung: Was zählt als zweiter Faktor?",
  svg: () => svg(480, 230,
    [["Wissen", "Passwort, PIN,|Sicherheitsfrage", "fx-info", 80], ["Besitz", "Handy-App, Smartcard,|FIDO2-Schlüssel", "fx-vio", 240], ["Sein", "Fingerabdruck,|Gesicht", "fx-ok", 400]]
      .map(([n, ex, cls, x], i) => g({ st: 0 }, c(x, 62, 46, { cls }) + t(x, 58, n, { fw: 700 }) + tl(x, 132, ex, { fs: 10.5, cls: "fx-sub", lh: 13 }))).join("") +
    g({ on: "1" }, box(40, 170, 400, 40, "Passwort + PIN  →  zweimal WISSEN  →  nur 1 Faktor ✗", { cls: "fx-bad", fs: 12 }) + p("M80 148 C80 158 120 162 140 168", { cls: "bad" })) +
    g({ on: "2" }, box(40, 170, 400, 40, "Passwort + Code aus Authenticator-App  →  Wissen + Besitz  →  MFA ✓", { cls: "fx-ok", fs: 11.5 }) + p("M80 148 C90 158 120 162 150 168", { cls: "ok" }) + p("M240 148 C240 158 260 162 280 168", { cls: "ok" })) +
    g({ on: "3" }, box(40, 170, 400, 40, "FIDO2-Schlüssel + Fingerabdruck  →  Besitz + Sein  →  MFA ✓", { cls: "fx-ok", fs: 11.5 }) + p("M240 148 C240 158 230 162 220 168", { cls: "ok" }) + p("M400 148 C400 158 360 162 330 168", { cls: "ok" }))),
  steps: [
    "Authentifizierung beantwortet <b>„Wer bist du?“</b>. Es gibt drei Faktor-Kategorien: etwas, das du <b>weißt</b>, <b>hast</b> oder <b>bist</b>.",
    "<b>Passwort + PIN</b> sind zwei Dinge, aber beide aus derselben Kategorie (Wissen). Das ist keine echte Multi-Faktor-Authentifizierung.",
    "<b>Passwort + Code aus der Authenticator-App</b> kombiniert Wissen und Besitz. Das ist MFA.",
    "<b>FIDO2-Sicherheitsschlüssel + Fingerabdruck</b> kombiniert Besitz und Sein, ganz ohne Passwort. Auch das ist MFA (und phishing-resistent)."
  ] };

/* 9 · Claim-based Access & Federation */
F["itf-claims"] = { title: "Claim-based Access: Die App lässt den Identity Provider prüfen",
  svg: () => svg(480, 260,
    user(50, 130) + t(50, 160, "Benutzer", { fs: 11, fw: 600 }) +
    box(330, 24, 140, 56, "Anwendung|(Relying Party)", { fs: 11, cls: "fx-card" }) + box(330, 180, 140, 56, "Identity Provider|(Entra ID)", { fs: 11, cls: "fx-acc" }) +
    g({ on: "0" }, p("M70 120 L328 56", { cls: "acc", arrow: true, acc: true, flow: true }) + t(190, 74, "1 · Seite aufrufen", { fs: 11, fw: 600 })) +
    g({ on: "1" }, p("M328 64 C250 120 140 140 74 134", { cls: "acc", arrow: true, acc: true, flow: true }) + p("M74 140 L328 204", { cls: "acc", arrow: true, acc: true, flow: true }) + t(190, 200, "2 · weiter zum Login (+ MFA)", { fs: 11, fw: 600 })) +
    g({ on: "2" }, p("M328 212 L74 140", { cls: "acc", arrow: true, acc: true, flow: true }) + g({}, r(150, 168, 120, 64, { cls: "fx-warn", rx: 6 }) + t(210, 184, "Token / Claims", { fs: 11, fw: 700 }) + t(210, 199, "ID · Signatur des IdP", { fs: 9.5 }) + t(210, 212, "Methode (MFA)", { fs: 9.5 }) + t(210, 225, "Attribute, Rollen", { fs: 9.5 }))) +
    g({ on: "3" }, p("M74 124 L328 60", { cls: "acc", arrow: true, acc: true, flow: true }) + r(150, 64, 70, 24, { cls: "fx-warn", rx: 6 }) + t(185, 80, "Token", { fs: 11, fw: 700 }) + p("M400 82 L400 178", { cls: "ok dash", both: true }) + t(408, 134, "Vertrauen", { a: "start", fs: 11, fw: 700, cls: "t-ok" }) + t(408, 148, "(Zertifikat)", { a: "start", fs: 10, cls: "fx-sub" })) +
    g({ on: "4" }, box(120, 24, 120, 40, "App 2", { fs: 11, cls: "fx-card" }) + box(120, 80, 120, 40, "App 3", { fs: 11, cls: "fx-card" }) + p("M240 44 C300 120 330 170 352 180", { cls: "ok dash" }) + p("M240 100 C290 150 320 170 352 182", { cls: "ok dash" }) + p("M400 82 L400 178", { cls: "ok dash" }) + t(150, 160, "Single Sign-On", { fs: 13, fw: 700, cls: "t-ok" }) + t(150, 176, "ein Login, viele Apps", { fs: 11, cls: "fx-sub" }))),
  steps: [
    "Der Benutzer ruft eine Anwendung auf. Die App hat <b>keine eigene Benutzerdatenbank</b> und kein eigenes Login-Formular mehr.",
    "Die App leitet ihn zum <b>Identity Provider</b> (z. B. Entra ID) weiter. Dort meldet er sich an, mit Passwort und MFA. Die Authentifizierung ist aus der App herausgelöst.",
    "Der IdP stellt ein <b>Token mit Claims</b> aus: eindeutige Benutzer-ID, Signatur des IdP, ob und wie (Methode) die Anmeldung erfolgreich war, dazu Attribute und Rollen.",
    "Der Benutzer bringt das Token zur App. Die App <b>vertraut</b> dem IdP (z. B. über ein Zertifikat) und akzeptiert es. Die Autorisierung bleibt in der App.",
    "Viele Apps vertrauen demselben IdP: <b>Single Sign-On</b>. Verlässt jemand die Firma, sperrt der Admin nur ein Konto. Vertrauen zwischen zwei IdPs verschiedener Realms heißt <b>Federation</b>."
  ] };

/* 10 · IAL / AAL / FAL */
const LOA = [["IAL", "Identitätsnachweis", ["Kernattribute gegen|Quellen geprüft", "strenger geprüft +|echter Inhaber", "vor Ort mit Prüfer|+ Biometrie"]],
  ["AAL", "Anmeldung", ["ein Faktor", "2 Faktoren + phishing-|resistente Option", "phishing-resistenter|Public-Key-Schlüssel"]],
  ["FAL", "Assertion (Föderation)", ["signiert und|von RP validiert", "+ Injection-Schutz,|nur eine RP", "+ Holder-of-Key"]]];
F["itf-loa"] = { title: "Assurance Levels nach NIST SP 800-63-4",
  svg: () => svg(480, 280, LOA.map(([n, sub, lv], i) => { const x = 6 + i * 158;
    return g({ st: i }, t(x + 75, 22, n, { fw: 800, fs: 15, cls: "t-acc" }) + t(x + 75, 38, sub, { fs: 10.5, cls: "fx-sub" }) +
      lv.map((d, k) => { const y = 196 - k * 64; return r(x, y, 150, 56, { cls: k === 2 ? "fx-acc" : k === 1 ? "fx-soft" : "fx-card", rx: 8 }) + t(x + 10, y + 16, n + (k + 1), { a: "start", fw: 800, fs: 12, cls: k === 2 ? "fx-onacc" : "" }) + tl(x + 75, y + 38, d, { fs: 10, lh: 12, cls: k === 2 ? "fx-onacc" : "" }); }).join("")); }).join("") +
    g({ st: 3 }, t(240, 272, "↑ Je höher die Stufe, desto mehr Vertrauen", { fs: 11, cls: "t-acc", fw: 700 }))),
  steps: [
    "<b>IAL</b> (Identity Assurance Level): Wie gut wurde geprüft, dass die Person wirklich existiert und die ist, die sie vorgibt? Von validierten Kernattributen bis zur Prüfung vor Ort mit Biometrie.",
    "<b>AAL</b> (Authenticator Assurance Level): Wie stark ist die Anmeldung? AAL1 ein Faktor, AAL2 zwei Faktoren, AAL3 ein phishing-resistenter Public-Key-Authenticator wie FIDO2 oder Smartcard.",
    "<b>FAL</b> (Federation Assurance Level): Wie gut ist die Assertion geschützt, die der IdP an die Relying Party schickt? FAL3 verlangt zusätzlich Holder-of-Key.",
    "Je höher die Stufe, desto mehr Vertrauen. Neu in 800-63-4: Low → 1, Moderate → 2, High → 3. Ohne Identitätsprüfung (self-asserted) liegt man außerhalb von IAL1–3."
  ] };

/* 11 · RBAC */
F["itf-rbac"] = { title: "Azure RBAC: Wer + Was + Wo = Rollenzuweisung",
  svg: () => svg(480, 250,
    g({ st: 0 }, box(10, 24, 120, 70, "Security|Principal", { cls: "fx-info", fs: 12 }) + t(70, 112, "WER: Benutzer,", { fs: 10, cls: "fx-sub" }) + t(70, 125, "Gruppe, App-Identität", { fs: 10, cls: "fx-sub" })) +
    g({ st: 1 }, t(145, 64, "+", { fs: 22, fw: 700 }) + box(160, 24, 120, 70, "Role|Definition", { cls: "fx-vio", fs: 12 }) + t(220, 112, "WAS: z. B.", { fs: 10, cls: "fx-sub" }) + t(220, 125, "Contributor", { fs: 10, cls: "fx-sub" })) +
    g({ st: 2 }, t(295, 64, "+", { fs: 22, fw: 700 }) + box(310, 24, 100, 70, "Scope", { cls: "fx-warn", fs: 12 }) + t(360, 112, "WO: MG, Sub,", { fs: 10, cls: "fx-sub" }) + t(360, 125, "RG, Ressource", { fs: 10, cls: "fx-sub" })) +
    g({ st: 3 }, t(430, 64, "=", { fs: 22, fw: 700 }) + box(444, 24, 30, 70, "✓", { cls: "fx-acc", fs: 16 }) + box(80, 150, 320, 34, "Role Assignment: Anna · Contributor · rg-webshop", { cls: "fx-acc", fs: 11 }) +
      p("M240 184 L120 214", { cls: "acc", flow: true }) + p("M240 184 L240 214", { cls: "acc", flow: true }) + p("M240 184 L360 214", { cls: "acc", flow: true }) +
      box(70, 214, 100, 26, "VM", { fs: 10.5, cls: "fx-ok" }) + box(190, 214, 100, 26, "SQL DB", { fs: 10.5, cls: "fx-ok" }) + box(310, 214, 100, 26, "Storage", { fs: 10.5, cls: "fx-ok" }))),
  steps: [
    "<b>Security Principal</b> = WER bekommt Zugriff: ein Benutzer, eine Gruppe, ein Service Principal oder eine Managed Identity.",
    "<b>Role Definition</b> = WAS darf er tun: eine Liste von Berechtigungen. Owner darf alles inkl. Rechte vergeben, Contributor alles außer Rechte vergeben, Reader nur ansehen.",
    "<b>Scope</b> = WO gilt das: Management Group, Subscription, Resource Group oder eine einzelne Ressource.",
    "Alle drei zusammen ergeben eine <b>Role Assignment</b>. Sie wird nach unten vererbt: Contributor auf der Resource Group gilt für jede Ressource darin. Prinzip: so wenig Rechte wie nötig (Least Privilege)."
  ] };

(window.STUDYOS_EXT = window.STUDYOS_EXT || {}).itinf = (window.STUDYOS_EXT.itinf || []).concat([{ id: "itinf-figs-v2v3", blocks: {
  "itv2-1": [{ t: "fig", id: "itf-geo", at: 0 }],
  "itv2-2": [{ t: "fig", id: "itf-az", at: 0 }],
  "itv2-3": [{ t: "fig", id: "itf-pue" }],
  "itv2-4": [{ t: "fig", id: "itf-rg", at: 0 }],
  "itv2-5": [{ t: "fig", id: "itf-arm", at: 0 }],
  "itv3-1": [{ t: "fig", id: "itf-mg", at: 0 }],
  "itv3-2": [{ t: "fig", id: "itf-policy", at: 0 }],
  "itv3-3": [{ t: "fig", id: "itf-claims", at: 0 }, { t: "fig", id: "itf-mfa" }],
  "itv3-4": [{ t: "fig", id: "itf-loa", at: 0 }],
  "itv3-7": [{ t: "fig", id: "itf-rbac", at: 0 }]
} }]);
})();
