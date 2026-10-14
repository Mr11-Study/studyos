/* ITINF-GL · Quick-Test-Fragen V1 (Cloud Concepts) – Mehrfachauswahl: 5 Antworten, 1 bis 5 richtig.
   Stoff: Folien V1 + Vortrag. Stil wie die Fragen des Lehrteams: Definitionen mit Eigenschaften, „Welche … sind richtig?“, Zuordnen, Begründen.
   Format je Antwort: [Text, richtig?, optionale Erklärung]. Die Reihenfolge wird pro Frage fest gemischt.
   Dieses File stellt außerdem den Kurs auf Quick-Tests um (course-Patch, siehe courses/ext-apply.js). */
(function () {
const X = window.STUDYOS_EXT = window.STUDYOS_EXT || {};
const h = s => { let x = 0; for (const ch of s) x = (x * 31 + ch.charCodeAt(0)) >>> 0; return x; };
const M = (id, topic, q, opts, why) => {
  const ix = opts.map((_, i) => i); let r = h(id); for (let i = ix.length - 1; i > 0; i--) { r = (r * 1103515245 + 12345) >>> 0; const j = (r >>> 16) % (i + 1); [ix[i], ix[j]] = [ix[j], ix[i]]; }
  const o = ix.map(i => opts[i]);
  return { id, topic, multi: true, q, opts: o.map(x => x[0]), a: o.reduce((m, x, i) => x[1] ? m | (1 << i) : m, 0), notes: o.map(x => x[2] || ""), why };
};
window.ITINF_M = M;

const V1 = ["itg-def", "itg-nist", "itg-deploy", "itg-virt", "itg-faas", "itg-svc", "itg-shared", "itg-sla", "itg-scale", "itg-workload", "itg-pa", "itg-cost", "itg-dist", "itg-reg"];
const V2 = ["itv-region", "itv-az", "itv-green", "itv-rg", "itv-tools"];
const V3 = ["itv-mgmt", "itv-policy", "itv-iam", "itv-loa", "itv-entra", "itv-users", "itv-rbac"];

const questions = [
/* ---------- Definition & Horseless Carriage ---------- */
M("itm1-1", "itg-def", "Welche Aussagen zum „Horseless Carriage Syndrome“ sind richtig?", [
  ["Eine neue Technologie wird über das beschrieben, was ihr im Vergleich zur alten fehlt.", true],
  ["Gottlieb Daimler schätzte den Automarkt auf höchstens rund 100 Millionen Fahrzeuge.", false, "Er schätzte höchstens rund eine Million."],
  ["Daimler begründete seine Schätzung mit zu wenigen fähigen Chauffeuren und hohen Kosten.", true],
  ["Übersehen wurde, dass Kosten und Komplexität drastisch sinken.", true],
  ["Das Syndrom beschreibt, dass neue Technologien grundsätzlich überschätzt werden.", false, "Umgekehrt: Man misst das Neue am Alten und unterschätzt es."]
], "Die Folie überträgt das auf die IT: Der Wechsel von Client/Server zur Cloud wird anfangs über das Fehlende („kein eigener Server“) beschrieben."),
M("itm1-2", "itg-def", "Welche Dienstkategorien nennt die Folie als typische Cloud-Dienste?", [
  ["Compute", true], ["Networking", true], ["Storage", true], ["Hardware-Wartung im Rechenzentrum des Kunden", false, "Kein Dienst über das Internet."],
  ["Analytics", true]
], "Cloud Computing = Bereitstellung von Computing-Diensten über das Internet: Compute, Networking, Storage, Analytics."),
M("itm1-3", "itg-def", "Woraus besteht das Cloud-Modell nach NIST SP 800-145?", [
  ["5 Essential Characteristics", true], ["3 Service Models", true], ["4 Deployment Models", true],
  ["Serverless als viertes Service-Modell", false, "Serverless ist eine spätere Ergänzung, nicht Teil von NIST 2011."],
  ["Multi-Cloud als fünftes Deployment-Modell", false, "Multi-Cloud kommt in NIST 2011 nicht vor."]
], "NIST (Mell/Grance 2011): 5 Merkmale, 3 Service-Modelle (IaaS, PaaS, SaaS), 4 Deployment-Modelle (Public, Private, Community, Hybrid)."),
M("itm1-4", "itg-def", "„Ist die Cloud billiger, schneller, einfacher, flexibler?“ Welche Einschätzungen entsprechen der Antwort aus der Vorlesung?", [
  ["Schneller, einfacher, flexibler und effektiver: grundsätzlich ja.", true],
  ["Billiger hängt vom konkreten Anwendungsfall ab, vor allem vom Lastverlauf.", true],
  ["Die Cloud ist in jedem Fall billiger als eigene Hardware.", false, "Bei statischer Last kann eigene Hardware billiger sein (p/a-Regel)."],
  ["Der Treiber des Wandels ist vor allem neue Technik; Geld spielt kaum eine Rolle.", false, "Laut Vorlesung geht es grundsätzlich ums Geld."],
  ["Die Cloud ist nur ein neuer Name für Client/Server.", false, "Das war Larry Ellisons Spott von 2008, nicht die Aussage der Vorlesung."]
], "Antwort des Vortragenden: „Jein.“ Ob es billiger ist, entscheidet der Workload, siehe p/a-Regel."),
M("itm1-5", "itg-def", "Welche Aussagen zur Herkunft und Gültigkeit der NIST-Definition sind richtig?", [
  ["Sie stammt aus dem Jahr 2011.", true],
  ["Sie gilt laut Vorlesung nach wie vor.", true],
  ["Die NIST-Definition stammt von Larry Ellison (2008).", false, "Ellison spottete 2008; NIST ist von 2011 (Mell/Grance)."],
  ["Sie definiert Multi-Cloud als eigenes Modell.", false],
  ["Sie wurde 2020 durch eine Definition von Microsoft ersetzt.", false]
], "NIST SP 800-145 (2011) ist weiter die Referenzdefinition. Serverless und Multi-Cloud sind spätere Ergänzungen."),

/* ---------- NIST: 5 Merkmale ---------- */
M("itm1-10", "itg-nist", "Welche der folgenden sind Essential Characteristics nach NIST?", [
  ["On-demand self-service", true], ["Broad network access", true], ["Resource pooling", true],
  ["Pay-as-you-go", false, "Folgt aus Measured service, ist aber kein eigenes Merkmal."],
  ["Rapid elasticity", true]
], "Die fünf: On-demand self-service, Broad network access, Resource pooling, Rapid elasticity, Measured service."),
M("itm1-11", "itg-nist", "Welche Aussagen zu On-demand self-service sind richtig?", [
  ["Der Kunde stellt Ressourcen selbst und automatisch bereit.", true],
  ["Es ist keine menschliche Interaktion mit dem Anbieter nötig.", true],
  ["Das Merkmal gilt nur für Rechenleistung, nicht für Netzwerkspeicher.", false, "Laut NIST z. B. Server-Zeit und Netzwerkspeicher."],
  ["Der Anbieter prüft jede Bestellung händisch, bevor sie freigeschaltet wird.", false],
  ["Das Merkmal gilt nur für AWS, nicht für europäische Anbieter wie Hetzner.", false, "Es ist anbieterunabhängig."]
], "On-demand self-service: einseitig („unilaterally“) und automatisch, ohne Ticket und ohne Mensch beim Anbieter."),
M("itm1-12", "itg-nist", "Welche Aussagen zu Resource pooling sind richtig?", [
  ["Ressourcen des Anbieters werden in einem Multi-Tenant-Modell gebündelt.", true],
  ["Ressourcen werden jedem Kunden einmalig fest zugeteilt und nie neu verteilt.", false, "Sie werden dynamisch zugeteilt."],
  ["Der Kunde kennt den genauen Standort meist nicht, kann ihn aber grob festlegen (z. B. Land, Region).", true],
  ["Jeder Kunde bekommt eigene, nur für ihn reservierte physische Server.", false, "Das widerspricht dem Teilen der Hardware."],
  ["Der Kunde kann immer den exakten Server wählen, auf dem seine Daten liegen.", false, "Nur grob: Land, Region, Rechenzentrum."]
], "Resource pooling: Hardware wird mit anderen Kunden geteilt; man weiß nur grob, wo („Frankfurt“, „Wien“)."),
M("itm1-13", "itg-nist", "Ein Kunde kann für seine Daten nur „Region Westeuropa“ wählen, nicht den konkreten Server. Welches NIST-Merkmal beschreibt das?", [
  ["Resource pooling", true],
  ["Broad network access", false],
  ["Measured service", false],
  ["Rapid elasticity", false],
  ["On-demand self-service", false]
], "Resource pooling enthält eine „sense of location independence“: Der Ort ist nur auf höherer Ebene wählbar."),
M("itm1-14", "itg-nist", "Welche Aussagen zu Rapid elasticity sind richtig?", [
  ["Ressourcen können schnell, teils automatisch, hinzugefügt und wieder freigegeben werden.", true],
  ["Für den Kunden wirken die Ressourcen praktisch unbegrenzt.", true],
  ["Skaliert wird nach außen und nach innen (scale out / scale in).", true],
  ["Statt Hardware zu bestellen und einzubauen, genügt ein Mausklick.", true],
  ["Rapid elasticity ist nur ein anderer Name für On-demand self-service.", false, "Zwei eigene Merkmale."]
], "Rapid elasticity: bedarfsgerecht in beide Richtungen; deutlich mehr als bloße Skalierbarkeit."),
M("itm1-15", "itg-nist", "Welche Aussagen zu Measured service sind richtig?", [
  ["Der Verbrauch wird gemessen (Metering), überwacht und berichtet.", true],
  ["Gemessen wird nur für den Anbieter; der Kunde sieht seinen Verbrauch nicht.", false, "Transparenz für beide Seiten."],
  ["Es ist die Voraussetzung für nutzungsbasierte Abrechnung.", true],
  ["Beispiele für Messgrößen sind Speicher, CPU-Zeit, Bandbreite oder aktive User.", true],
  ["Es bedeutet, dass jeder Dienst einen fixen Monatspreis hat.", false]
], "Measured service: Metriken und Logs, damit Nutzung gemessen und verrechnet werden kann."),
M("itm1-16", "itg-nist", "Welche Begriffe sind KEINE eigenen NIST-Merkmale (Prüfungsfalle)?", [
  ["Pay-as-you-go", true, "Ergibt sich aus Measured service."],
  ["Internet", true, "Heißt bei NIST Broad network access."],
  ["Hochverfügbarkeit", true, "Ein Cloud Benefit, kein NIST-Merkmal."],
  ["Broad network access", false],
  ["Measured service", false]
], "Pay-as-you-go, „Internet“ und Hochverfügbarkeit klingen nach Cloud, gehören aber nicht zu den fünf NIST-Merkmalen."),
M("itm1-17", "itg-nist", "Welche Aussagen zu Broad network access sind richtig?", [
  ["Zugriff erfolgt über das Netz mit Standardmechanismen.", true],
  ["Heterogene Thin- und Thick-Clients werden unterstützt (Handy, Tablet, Laptop, Workstation).", true],
  ["Zugriff ist nur aus dem Firmennetz des Kunden erlaubt.", false],
  ["Es ist ein Deployment-Modell.", false, "Es ist ein Essential Characteristic."],
  ["Es setzt proprietäre Protokolle des Anbieters voraus.", false, "Gerade Standardprotokolle sind gemeint."]
], "Broad network access = Standardprotokolle, beliebige Endgeräte."),

/* ---------- Deployment-Modelle ---------- */
M("itm1-20", "itg-deploy", "Welche sind Deployment-Modelle nach NIST?", [
  ["Public Cloud", true], ["Private Cloud", true], ["Community Cloud", true], ["Hybrid Cloud", true],
  ["Multi-Cloud", false, "Gelebte Praxis, aber nicht in NIST 2011."]
], "Vier Deployment-Modelle: Public, Private, Community, Hybrid. Achtung: Das Wort „Service“ kommt hier nicht vor."),
M("itm1-21", "itg-deploy", "Welche Aussagen zur Private Cloud sind laut NIST richtig?", [
  ["Sie wird exklusiv von einer Organisation genutzt.", true],
  ["Sie darf nicht von einem Dritten betrieben werden.", false, "Darf sie."],
  ["Sie kann off premises liegen, also nicht im eigenen Gebäude.", true],
  ["Sie muss zwingend im eigenen Rechenzentrum stehen.", false, "Entscheidend ist die exklusive Nutzung, nicht der Ort."],
  ["Eine Private Cloud darf von mehreren Organisationen gemeinsam genutzt werden.", false, "Das wäre eine Community Cloud."]
], "Private Cloud = die fünf Charakteristiken + exklusiv für eine Organisation, egal wo und von wem betrieben."),
M("itm1-22", "itg-deploy", "Welche Aussagen zur Hybrid Cloud sind richtig?", [
  ["Sie ist eine Komposition aus zwei oder mehr eigenständigen Clouds.", true],
  ["Die beteiligten Clouds verlieren ihre Eigenständigkeit und verschmelzen zu einer einzigen Cloud.", false, "Die Clouds bleiben eigenständig."],
  ["Cloud Bursting ist ein typisches Beispiel.", true],
  ["Ein Grund dafür sind Compliance und rechtliche Vorgaben, manche Daten lokal zu halten.", true],
  ["Hybrid bedeutet dasselbe wie Multi-Cloud.", false, "Hybrid = on-prem/Private + Public; Multi-Cloud = mehrere Public Clouds."]
], "Hybrid ist historisch gewachsen: erst alles on-premises, ab ca. 2006–2010 kamen Cloud-Dienste dazu."),
M("itm1-23", "itg-deploy", "Welche Aussagen zu Multi-Cloud sind richtig?", [
  ["Multi-Cloud nutzt Dienste von zwei oder mehr Public-Cloud-Anbietern.", true],
  ["Multi-Cloud ist Teil der NIST-Definition von 2011.", false],
  ["Ein Hauptproblem ist, dass jede Cloud ihre eigene API hat.", true],
  ["Die Anbieter haben großes Interesse an einem gemeinsamen Standard.", false, "Ein Standard würde den Wechsel erleichtern; daran haben sie wenig Interesse."],
  ["Bei Multi-Cloud fallen keine Datentransferkosten an.", false, "Egress-Kosten sind eine Herausforderung."]
], "Ein AWS-Skript läuft nicht auf Azure. Motive für Multi-Cloud: Lock-in vermeiden, Best-of-Breed, Resilienz, Regulatorik, Verhandlungsmacht."),
M("itm1-24", "itg-deploy", "Welche Aussagen zur Community Cloud sind richtig?", [
  ["Sie wird exklusiv von einer Gemeinschaft von Organisationen genutzt.", true],
  ["Die Organisationen haben gemeinsame Anliegen, z. B. Mission, Security, Policy oder Compliance.", true],
  ["Sie kann von einer der Organisationen oder von Dritten betrieben werden.", true],
  ["Sie kann on oder off premises liegen.", true],
  ["Sie muss immer von einem externen Dritten betrieben werden.", false, "Auch eine der Organisationen kann sie betreiben."]
], "Community Cloud: geteilt von mehreren Organisationen mit gleichen Anforderungen, nicht öffentlich."),
M("itm1-25", "itg-deploy", "Welche Eigenschaften passen laut Folie zur Public Cloud?", [
  ["Keine Investitionen (CapEx), um hochzuskalieren", true],
  ["Anwendungen sind schnell bereit- und wieder abbaubar", true],
  ["Man zahlt eine fixe Jahresgebühr, unabhängig von der Nutzung", false, "Public Cloud: man zahlt, was man nutzt."],
  ["Der Kunde muss die Hardware selbst kaufen und warten", false, "Trifft auf die Private Cloud zu."],
  ["Volle Kontrolle über Ressourcen und physische Sicherheit beim Kunden", false, "Trifft auf die Private Cloud zu."]
], "Public = kein CapEx, schnell, pay-per-use. Private = Hardware kaufen, volle Kontrolle, Wartung selbst."),

/* ---------- Bare Metal, VMs, Container ---------- */
M("itm1-30", "itg-virt", "Welche Probleme hat der klassische Webshop auf dediziertem Server laut Folie?", [
  ["Leerlauf kostet: In der Nacht passiert nichts, der Server läuft trotzdem.", true],
  ["Überdimensionierung: Der Server muss für die Spitzenlast ausgelegt werden.", true],
  ["Das Betriebssystem ist eng an die Hardware gebunden; Wiederherstellung ist schwierig.", true],
  ["Der Server kann nicht ans Internet angebunden werden.", false],
  ["Der Server wird dynamisch zwischen vielen Kunden geteilt.", false, "Beim dedizierten Server geht genau das nicht."]
], "Leerlauf + Überdimensionierung = die Lücke zwischen Peak und Average (p/a). Die Hardwarebindung löst die Virtualisierung."),
M("itm1-31", "itg-virt", "Welche Vorteile von virtuellen Maschinen nennt die Folie?", [
  ["Bessere Auslastung, weil sich mehrere VMs einen Bare-Metal-Server teilen", true],
  ["Hardwareunabhängigkeit: VMs lassen sich auf andere Server verschieben", true],
  ["Keinerlei Overhead gegenüber Bare Metal", false, "Jede VM bootet ein komplettes OS."],
  ["VMs starten schneller als Container.", false, "Container starten schneller; jede VM bootet ein ganzes OS."],
  ["Kein eigenes Betriebssystem pro VM nötig", false, "Das ist der Vorteil von Containern; jede VM bootet ein eigenes OS."]
], "VMs: Auslastung, Hardwareunabhängigkeit, einfache Prozesse, Golden Images. Nachteil: großer Overhead durch eigenes OS."),
M("itm1-32", "itg-virt", "Welche Aussagen zu Containern sind richtig?", [
  ["Container teilen sich das Betriebssystem (den Kernel) des Hosts.", true],
  ["Jeder Container bringt einen eigenen Kernel mit.", false, "Container teilen den Kernel des Hosts."],
  ["Sie brauchen eine Container-Runtime auf Bare Metal oder in einer VM.", true],
  ["Sie bieten eine stärkere Isolation als VMs.", false, "Schwächere Isolation; darum laufen sie in der Public Cloud meist in VMs."],
  ["Sie gelten als de-facto-Standard moderner Softwareentwicklung.", true]
], "Container: ressourceneffizient, portabel, schnelles Deployment, gleiche Images auf jedem Entwicklerrechner."),
M("itm1-33", "itg-virt", "Warum sind Container ressourcensparender als VMs?", [
  ["Weil nicht jede Instanz ein komplettes eigenes Betriebssystem bootet", true],
  ["Weil sie kleinere Deployment Units haben", true],
  ["Weil sie stärker isoliert sind", false, "Container isolieren schwächer als VMs."],
  ["Weil sie keine CPU brauchen, solange sie laufen", false, "Ein laufender Container braucht immer etwas CPU und Speicher."],
  ["Weil sie die Hardware direkt ohne Betriebssystem ansprechen", false]
], "Kein eigenes OS je Instanz → weniger Overhead, schneller Start, höhere Dichte pro VM."),
M("itm1-34", "itg-virt", "Ordne die Stufen nach Kratzke: Welche Aussagen sind richtig?", [
  ["Stufe 1: Jede Anwendung läuft auf einem eigenen physischen Server.", true],
  ["Stufe 2: Anwendungen laufen in VMs auf einem Bare-Metal-Server; VM-Images sind sehr groß.", true],
  ["Stufe 3: Mehrere Container teilen sich das Betriebssystem einer VM.", true],
  ["Stufe 4: Jede Function bekommt dauerhaft eine eigene VM.", false, "Die FaaS-Runtime teilt sich den Host per Time-Sharing."],
  ["Stufe 4: Die FaaS-Runtime teilt sich den Host per Time-Sharing.", true]
], "Dedicated → Virtualisierung → Containerization/Microservices → Serverless/FaaS. Die Stufen schließen sich nicht aus."),

/* ---------- Serverless ---------- */
M("itm1-40", "itg-faas", "Welche Aussagen zu Serverless / FaaS sind richtig?", [
  ["Code läuft event-getrieben, z. B. bei HTTP-Request, Datei-Upload oder Timer.", true],
  ["Ohne Last wird auf null skaliert (Scale to Zero).", true],
  ["Abgerechnet wird pro Ausführung und Laufzeit, nicht pro bereitgestelltem Server.", true],
  ["Es laufen dabei überhaupt keine Server mehr.", false, "Server gibt es weiterhin, sie verwaltet nur der Anbieter."],
  ["Serverless ist die Abstraktionsstufe unterhalb von IaaS.", false, "Serverless ist die nächste Stufe nach PaaS."]
], "Serverless = nächste Abstraktionsstufe nach PaaS. Nur zahlen, wenn etwas passiert."),
M("itm1-41", "itg-faas", "Welche Nachteile von Serverless nennt die Folie?", [
  ["Cold Starts", true], ["Ausführungszeitlimits (z. B. ca. 10 Minuten)", true], ["Starke Plattformbindung (Lock-in)", true],
  ["Kann nicht auf HTTP-Requests reagieren", false, "HTTP ist ein typischer Trigger."],
  ["Hohe Kosten im Leerlauf", false, "Im Leerlauf kostet Serverless gerade nichts."]
], "Darum bleibt der Kern-Shop meist in Containern oder PaaS; Functions ergänzen ihn."),
M("itm1-42", "itg-faas", "Webshop mit Azure Functions: Welche Zuordnungen von Trigger und Aufgabe stammen aus der Vorlesung?", [
  ["HTTP-Trigger: neue Bestellung → Bestellbestätigung verschicken", true],
  ["Blob-Trigger: neue Bestellung → Bestellbestätigung verschicken", false, "Das ist der HTTP-Trigger."],
  ["Timer-Trigger: jede Nacht um 2:00 → täglicher Verkaufsbericht", true],
  ["Timer-Trigger: Produktbild hochgeladen → Thumbnail erzeugen", false, "Das ist ein Blob-Trigger."],
  ["HTTP-Trigger: jede Nacht um 2:00 → Bericht an das Management", false, "Zeitgesteuert = Timer-Trigger."]
], "HTTP → SendConfirmation, Blob → ResizeImage, Timer → DailySalesReport."),
M("itm1-43", "itg-faas", "Was ist der Unterschied zwischen einem laufenden Container und einer Function?", [
  ["Ein laufender Container braucht immer etwas CPU und Speicher, auch wenn er nichts tut.", true],
  ["Eine Function ist nach dem Aufruf beendet.", true],
  ["In der Public Cloud entstehen für eine Function ohne Aufrufe keine Rechenkosten.", true],
  ["Eine Function startet nie mit Verzögerung.", false, "Nach Scale to Zero gibt es Cold Starts."],
  ["Nach Scale to Zero kann ein Cold Start auftreten.", true]
], "Scale to Zero ist der Kernunterschied: Leerlauf kostet bei Functions nichts."),
M("itm1-44", "itg-faas", "Für welche Workloads ist Serverless laut Folie besonders gut geeignet?", [
  ["Event-getriebene Aufgaben", true],
  ["Unvorhersehbare Lastspitzen", true],
  ["Workloads mit p/a = 1", false, "Konstante Last; dafür passt eher eine Reservierung."],
  ["Lang laufende Berechnungen über viele Stunden ohne Unterbrechung", false, "Laufzeitlimits sprechen dagegen."],
  ["Konstante Grundlast rund um die Uhr", false, "Dafür passen eher Reserved Instances oder eigene Hardware."]
], "Serverless lohnt sich, wo Leerlauf sonst viel kosten würde."),
M("itm1-45", "itg-faas", "Welche Aussagen fassen die Lektion „Vom Bare Metal zu Serverless“ richtig zusammen?", [
  ["Bare Metal ist das physische Fundament.", true],
  ["Bare Metal wird durch Container überflüssig.", false, "Bare Metal bleibt das physische Fundament."],
  ["Container sind die effizienteste Methode, Anwendungen zu betreiben.", true],
  ["Serverless Functions ergänzen das für event-getriebene Aufgaben und unvorhersehbare Spitzen.", true],
  ["Ausgewählt wird nach Use Case, Kosten, Performance und Know-how im Team.", true]
], "Fazit der Folie: Jede Stufe hat ihren Zweck."),

/* ---------- IaaS, PaaS, SaaS ---------- */
M("itm1-50", "itg-svc", "Welche sind Service-Modelle nach NIST?", [
  ["IaaS", true], ["PaaS", true], ["SaaS", true],
  ["Hybrid", false, "Deployment-Modell."], ["Community", false, "Deployment-Modell."]
], "Prüfungsklassiker: In jedem Service-Modell steckt „as a Service“. Deployment-Modelle: Public, Private, Hybrid, Community."),
M("itm1-51", "itg-svc", "Welche Aussagen zu IaaS sind richtig?", [
  ["IaaS kommt dem Betrieb physischer Server am nächsten.", true],
  ["Der Anbieter hält die Hardware aktuell.", true],
  ["Betriebssystem-Wartung und Netzwerkkonfiguration liegen beim Kunden.", true],
  ["IaaS verbirgt die Betriebskomplexität fast vollständig.", false, "Das gilt für SaaS; bei IaaS bleibt viel Komplexität beim Kunden."],
  ["Der Anbieter installiert die Sicherheitspatches für das Betriebssystem der VM.", false, "Bei IaaS patcht der Kunde das OS."]
], "Beispiele: Azure Virtual Machines, Managed Disks, Virtual Networks. Maximale Flexibilität, aber hohe operative Komplexität."),
M("itm1-52", "itg-svc", "Welche Aussagen zu PaaS sind richtig?", [
  ["PaaS ist eine verwaltete Hosting-Umgebung.", true],
  ["Der Anbieter verwaltet VMs inklusive Betriebssystem und Netzwerkressourcen.", true],
  ["Der Kunde deployt seine Anwendung in die Umgebung.", true],
  ["Bei PaaS patcht der Kunde das Betriebssystem selbst.", false, "Das OS verwaltet bei PaaS der Anbieter."],
  ["Bei PaaS gibt es keinen Vendor Lock-in.", false, "Ein gewisses Maß an Lock-in muss man akzeptieren."]
], "Beispiele: Azure App Service, Azure SQL Database. Kompromiss zwischen Komfort und Lock-in."),
M("itm1-53", "itg-svc", "Welche Aussagen zu SaaS sind richtig?", [
  ["Der Konsument nutzt die Anwendungen des Anbieters, z. B. über den Webbrowser.", true],
  ["Der Konsument kontrolliert weder Server noch Betriebssystem noch Storage.", true],
  ["Höchstens begrenzte benutzerspezifische Einstellungen sind möglich.", true],
  ["Der Konsument kann einzelne Anwendungsfunktionen frei umprogrammieren.", false, "Höchstens begrenzte benutzerspezifische Einstellungen."],
  ["Der Anbieter ist auch für die Daten des Kunden verantwortlich.", false, "Daten bleiben immer Kundensache."]
], "Beispiele: Microsoft 365, Teams, Salesforce CRM. SaaS verbirgt die Betriebskomplexität fast vollständig."),
M("itm1-54", "itg-svc", "Zuordnungsquiz am Webshop: Welche Zuordnungen sind richtig?", [
  ["Microsoft Teams → SaaS", true],
  ["Azure-VM mit selbst installiertem SQL Server → IaaS", true],
  ["Azure App Service mit dem Webshop → SaaS", false, "PaaS."],
  ["Azure SQL Database → IaaS", false, "Verwalteter Dienst = PaaS."],
  ["Salesforce CRM → PaaS", false, "Fertige Software für End-User = SaaS."]
], "Weitere Zuordnung aus der Vorlesung: Azure Functions zum Bilderverkleinern → PaaS/FaaS (Serverless)."),
M("itm1-55", "itg-svc", "Pizza as a Service: Welche Zuordnungen sind richtig?", [
  ["Homemade (alles selbst) → on-premises", true],
  ["Take + Bake (fertige Pizza im eigenen Ofen backen) → IaaS", true],
  ["Home Delivery (nur Getränke und Tisch selbst) → PaaS", true],
  ["Take + Bake → PaaS", false, "Take + Bake = IaaS."],
  ["Home Delivery → SaaS", false, "Restaurant entspricht SaaS."]
], "Die Analogie zeigt die wandernde Verantwortungsgrenze. Auch im Restaurant bleibt der Gast für manches verantwortlich."),
M("itm1-56", "itg-svc", "1.000 Benutzer zahlen je 30 € pro Monat für ein SaaS-Produkt. Welche Aussagen sind richtig?", [
  ["Die Kosten betragen 360.000 € pro Jahr.", true],
  ["Es handelt sich um einen einmaligen Lizenzkauf (CapEx).", false, "Abo-Modell, OpEx."],
  ["Die Kosten betragen 36.000 € pro Jahr.", false, "1.000 × 30 € × 12 = 360.000 €."],
  ["Der Kunde muss das Betriebssystem der Server selbst patchen.", false],
  ["Die Kosten sind OpEx, kein CapEx.", true]
], "SaaS-Rechnung aus der Vorlesung: 1.000 × 30 € × 12 Monate = 360.000 € pro Jahr."),
M("itm1-57", "itg-svc", "Welche Aussagen zum Weg IaaS → PaaS → SaaS sind richtig?", [
  ["Der ausgelagerte Anteil der IT-Wertschöpfung wird größer.", true],
  ["Der Lock-in sinkt.", false, "Er steigt."],
  ["Die operative Komplexität für den Kunden sinkt.", true],
  ["Die Margen der Anbieter steigen tendenziell.", true],
  ["In umgekehrter Richtung sinkt der Lock-in, aber die Komplexität steigt.", true]
], "In umgekehrter Richtung: weniger Lock-in, aber mehr Komplexität. Alle Service-Modelle folgen denselben ökonomischen Gesetzen."),

/* ---------- Shared Responsibility ---------- */
M("itm1-60", "itg-shared", "Wofür ist der Kunde unabhängig vom Service-Modell IMMER verantwortlich?", [
  ["Informationen und Daten", true], ["Geräte (PCs, Laptops, Handys), die zugreifen", true], ["Konten und Identitäten", true],
  ["Physische Hosts", false, "Immer der Anbieter."], ["Physisches Netzwerk", false, "Immer der Anbieter."]
], "Immer Kunde: Daten, Geräte, Accounts/Identitäten. Immer Anbieter: Rechenzentrum, physisches Netz, physische Hosts."),
M("itm1-61", "itg-shared", "Wofür ist bei IaaS der Kunde verantwortlich?", [
  ["Betriebssystem", true], ["Physische Hosts", false, "Immer der Anbieter."], ["Anwendungen", true], ["Daten und Zugriff", true],
  ["Virtueller Computer, Compute, Netzwerk und Speicher (physisch)", false, "Ab IaaS übernimmt das der Anbieter."]
], "IaaS: Anbieter bis zum virtuellen Computer, ab dem Betriebssystem der Kunde."),
M("itm1-62", "itg-shared", "Welche Aussagen zum Shared Responsibility Model sind richtig?", [
  ["Bei IaaS ist der Anbieter für das Betriebssystem verantwortlich.", false, "Bei IaaS patcht der Kunde das OS."],
  ["Bei PaaS ist der Kunde für das Betriebssystem verantwortlich.", false, "Bei PaaS übernimmt das der Anbieter."],
  ["Bei SaaS ist der Anbieter für alles verantwortlich, auch für die Daten.", false, "Klassischer Irrtum."],
  ["Bei IaaS konfiguriert der Kunde das virtuelle Netz zwischen zwei VMs, verlegt aber keine Kabel.", true],
  ["Speichert man Daten in Outlook, ist man selbst für diese Daten verantwortlich.", true]
], "Die bessere der beiden Grafiken zeigt „Daten und Zugriff“ immer grün: immer Sache des Kunden."),
M("itm1-63", "itg-shared", "Was ist laut Folie die häufigste Ursache von Cloud-Sicherheitsvorfällen?", [
  ["Fehlkonfiguration auf Kundenseite", true],
  ["Physische Einbrüche in Rechenzentren", false],
  ["Hardwaredefekte beim Anbieter", false],
  ["Fehler im Hypervisor des Anbieters", false],
  ["Stromausfälle", false]
], "Gartner: bis 2025 sind 99 % der Cloud-Security-Failures Fehler des Kunden."),
M("itm1-64", "itg-shared", "Welche Verantwortungen hängen vom Service-Modell ab?", [
  ["Betriebssystem", true], ["Physisches Rechenzentrum", false, "Immer der Anbieter."], ["Anwendungen", true], ["Identitäts- und Verzeichnisinfrastruktur", true],
  ["Konten und Identitäten der eigenen Benutzer", false, "Immer Kunde."]
], "Modellabhängig: OS, Netzwerkkontrollen, Anwendungen, Identitäts- und Verzeichnisinfrastruktur."),

/* ---------- Benefits & SLAs ---------- */
M("itm1-70", "itg-sla", "Welche Punkte stehen auf der Liste der Cloud Benefits der Folie?", [
  ["High availability", true], ["Fault tolerance", true], ["Global reach", true], ["Disaster recovery", true], ["Security", true]
], "Weiters: Scalability, Elasticity, Customer latency capabilities, Agility, Predictive cost considerations."),
M("itm1-71", "itg-sla", "Welche Aussagen zu Skalierung sind richtig?", [
  ["Vertikal (scale up) = mehr Instanzen hinzufügen.", false, "Das ist scale out."],
  ["Horizontal (scale out) = mehr Instanzen, z. B. zusätzliche VMs.", true],
  ["Horizontales Skalieren erzwingt einen Neustart aller bestehenden VMs.", false, "Neue Instanzen kommen einfach dazu."],
  ["Heute skaliert man meist horizontal, um keinen Single Point of Failure zu haben.", true],
  ["Vertikale Skalierung erhöht die Verfügbarkeit, weil die Maschine stärker ist.", false, "Eine große Maschine bleibt ein Single Point of Failure."]
], "Scale out, not up: viele kleine Maschinen statt einer großen."),
M("itm1-72", "itg-sla", "Welche Aussagen zu SLAs sind richtig?", [
  ["Ein SLA ist eine vertragliche Garantie, keine Messung.", true],
  ["Ein höheres SLA ist meist teurer.", true],
  ["99,9 % Verfügbarkeit erlauben rund 8,76 Stunden Ausfall pro Jahr.", true],
  ["99,99 % erlauben rund 5,26 Minuten Ausfall pro Jahr.", false, "5,26 min gelten für 99,999 %; 99,99 % = 52,6 min."],
  ["99 % erlauben rund 3,65 Stunden Ausfall pro Jahr.", false, "99 % = 3,65 Tage."]
], "Ausfall = (1 − Verfügbarkeit) × 8.760 h/Jahr."),
M("itm1-73", "itg-sla", "Zwei Dienste mit 99,9 % und 99,95 % werden beide gebraucht (seriell). Welche Aussagen sind richtig?", [
  ["Das Composite SLA ist ca. 99,85 %.", true],
  ["Das Composite SLA ist schlechter als jeder Einzeldienst.", true],
  ["Der Ausfall liegt bei rund 1,3 Stunden pro Jahr.", false, "0,0015 × 8.760 h ≈ 13,1 h."],
  ["Das Composite SLA ist 99,95 %, weil der bessere Wert zählt.", false],
  ["Man rechnet 0,999 × 0,9995.", true]
], "Seriell multiplizieren: 0,999 × 0,9995 ≈ 0,9985. 0,0015 × 8.760 h ≈ 13,1 h."),
M("itm1-74", "itg-sla", "Webshop aus App Service (99,95 %), SQL Database (99,99 %) und Storage (99,9 %). Welche Aussagen sind richtig?", [
  ["Composite SLA ≈ 99,84 %", true],
  ["Ausfall ≈ 14 Stunden pro Jahr", true],
  ["Composite SLA ≈ 99,99 %", false, "Der beste Einzelwert zählt nicht; seriell wird multipliziert."],
  ["Composite SLA ≈ 99,9 %, weil das schwächste Glied entscheidet", false, "Das Ergebnis ist sogar schlechter als das schwächste Glied."],
  ["Seriell ist das Ergebnis immer besser als das schwächste Glied.", false, "Immer schlechter."]
], "0,9995 × 0,9999 × 0,999 ≈ 0,9984 → 0,0016 × 8.760 h ≈ 14 h."),
M("itm1-75", "itg-sla", "Wie erhöht man die Verfügbarkeit einer Anwendung?", [
  ["Redundante Instanzen in unabhängigen Zonen oder Regionen", true],
  ["Parallel betreiben: A = 1 − (1 − A)ⁿ steigt mit n", true],
  ["Mehr CPUs in dieselbe VM (vertikal skalieren)", false],
  ["Zwei VMs im selben Rack gelten als völlig unabhängig", false, "Die Parallelformel setzt unabhängige Ausfälle voraus."],
  ["Mehr Dienste seriell hintereinander schalten", false, "Seriell sinkt die Verfügbarkeit."]
], "Zwei Regionen mit je 99,95 %: 1 − 0,0005² ≈ 99,99998 %."),
M("itm1-76", "itg-sla", "Welche Aussagen zu Replikation, Backup und Disaster Recovery sind richtig?", [
  ["Replikation ist kein Backup.", true],
  ["Replikation erlaubt nicht automatisch, zum Stand von vor drei Wochen zurückzukehren.", true],
  ["Georedundanz für eigene Dienste ist immer automatisch und gratis inklusive.", false, "Muss man selbst wählen und bezahlen."],
  ["Disaster Recovery: bei einem großen Stromausfall in Wien auf eine andere Region ausweichen.", true],
  ["Der Anbieter macht automatisch und kostenlos Backups aller Kundendaten.", false]
], "Der OneDrive-Papierkorb ist eher ein Backup als die Replikation auf viele Platten."),
M("itm1-77", "itg-sla", "Welche Verfügbarkeitswerte für Azure-VMs nennt die Folie?", [
  ["Einzelne VM mit Premium SSD: 99,9 %", true],
  ["Availability Set: 99,5 %", false, "99,95 %."],
  ["VMs über Availability Zones: 99,99 %", true],
  ["Einzelne VM mit Standard-HDD: 99,999 %", false],
  ["VMs über Availability Zones: 99,9 %", false]
], "Die Werte können sich ändern; Prinzip: mehr Unabhängigkeit = höheres SLA."),

/* ---------- Economies of Scale ---------- */
M("itm1-80", "itg-scale", "Welche Punkte gehören zu den Economies of Scale laut Folie?", [
  ["Buying power (Einkaufsmacht)", true],
  ["Infrastructure labor costs (Personalkosten)", true],
  ["Security & reliability (Sicherheit und Zuverlässigkeit)", true],
  ["Cost of power (Stromkosten)", true],
  ["Unbegrenzte Gratis-Bandbreite für Kunden", false]
], "In einer alten Prüfung desselben Lehrteams wurde bei vielen Antworten Sicherheit als fehlend angestrichen. Alle vier nennen."),
M("itm1-81", "itg-scale", "Welche Aussagen zu Buying power sind richtig?", [
  ["Große Betreiber bekommen bis zu ca. 30 % Rabatt auf Hardware.", true],
  ["Möglich wird das durch Standardisierung auf wenige Architekturen (Infrastrukturhomogenität).", true],
  ["Kleine Käufer bekommen dieselben Konditionen.", false],
  ["MIPS misst die Stromkosten eines Rechenzentrums.", false, "MIPS = Millions of Instructions per Second."],
  ["Buying power betrifft nur Software-Lizenzen, nicht Hardware.", false]
], "Homogene Hardware in großen Mengen → bessere Preise."),
M("itm1-82", "itg-scale", "Warum führt Sicherheit zu Skaleneffekten?", [
  ["Die Investition in Sicherheit und Zuverlässigkeit ist weitgehend fix und verteilt sich auf viele Kunden.", true],
  ["Große Anbieter können sich mehrere Spezialisten leisten.", true],
  ["Jeder Kunde trägt die vollen Sicherheitskosten allein.", false, "Die Kosten verteilen sich auf viele Kunden."],
  ["Große Anbieter haben mehr Expertise als typische Unternehmens-IT.", true],
  ["In großen Rechenzentren ist Sicherheit absolut, Angriffe sind ausgeschlossen.", false, "Sicherheit ist nie absolut (Spafford-Zitat)."]
], "Fixkosten pro Kunde sinken mit der Größe."),
M("itm1-83", "itg-scale", "Welche Aussagen zu Stromkosten und Personal sind richtig?", [
  ["Strom ist der kleinste TCO-Posten.", false, "Er wird zum größten."],
  ["Große Anlagen haben einen schlechteren (höheren) PUE als kleine Serverräume.", false, "Große Anlagen haben den besseren PUE."],
  ["Große Betreiber bauen an Standorten mit günstigem Strom und verhandeln Preise.", true],
  ["Automatisierung senkt die Personalkosten; im laufenden Betrieb haben nur wenige Personen Zutritt.", true],
  ["Das österreichische Azure-Rechenzentrum kann man regelmäßig besichtigen.", false, "Laut Vorlesung nicht; fast alles ist automatisiert."]
], "Labor costs und cost of power sinken mit der Größe."),
M("itm1-84", "itg-scale", "Warum ist die Cloud KEINE Rückkehr zur Mainframe-Ära?", [
  ["Sie bietet Skaleneffekte und Effizienz, die die eines Mainframes übertreffen.", true],
  ["Sie kombiniert das mit Modularität und Agilität jenseits von Client/Server.", true],
  ["Der frühere Trade-off zwischen Effizienz und Flexibilität entfällt.", true],
  ["Die Cloud übernimmt den alten Trade-off: effizient, aber unflexibel.", false, "Der Trade-off entfällt."],
  ["Weil die Cloud ausschließlich auf Mainframes läuft.", false]
], "Die Cloud vereint die besten ökonomischen Eigenschaften von Mainframe und Client/Server."),

/* ---------- Workload Patterns ---------- */
M("itm1-90", "itg-workload", "Welche Application Workload Patterns nennt die Folie?", [
  ["Randomness", true], ["Time-of-day", true], ["Industry-specific", true], ["Multi-resource", true], ["Uncertain growth", true]
], "Fünf Muster; Pooling vieler unterschiedlicher Workloads glättet die Schwankungen."),
M("itm1-91", "itg-workload", "Welche Zuordnungen von Muster und Beispiel stammen aus der Vorlesung?", [
  ["Randomness → Exchange-Server, Leute checken Mails zu zufälligen Zeiten", true],
  ["Time-of-day → Suchanfragen UK vs. Japan", true],
  ["Industry-specific → US-Steuererklärung bis 15. April", true],
  ["Time-of-day → Händler vor Weihnachten", false, "Das ist branchenspezifisch."],
  ["Multi-resource → Olympische Spiele", false, "Olympia ist branchenspezifisch/vorhersehbar; Multi-resource = CPU- vs. speicherlastige Workloads."]
], "Multi-resource: Suche braucht viel CPU, E-Mail viel Storage; Server kommen aber als Bündel."),
M("itm1-92", "itg-workload", "Wie lässt sich Time-of-day-Variabilität ausgleichen?", [
  ["Workloads aus mehreren Zeitzonen auf denselben Servern betreiben", true],
  ["Consumer-Dienste (abends) mit Enterprise-Diensten (tagsüber) kombinieren", true],
  ["Server nachts ausschalten und Kunden aus anderen Zeitzonen abweisen", false],
  ["Jeder Zeitzone eigene, getrennte Server geben", false, "Gerade das Teilen gleicht die Last aus."],
  ["Größere Server kaufen", false]
], "Wenn Europa schläft, ist Asien wach: optimale Auslastung durch Pooling."),
M("itm1-93", "itg-workload", "Welche Aussagen zum Sizing-Problem im klassischen Rechenzentrum sind richtig?", [
  ["Man hat entweder Überkapazität (bezahlt, aber ungenutzt) oder Unterkapazität (verlorene Kunden).", true],
  ["On-premises muss man für den Peak kaufen.", true],
  ["In der Cloud kann die Kapazität dem Bedarf folgen.", true],
  ["Bei elastischer Skalierung ist die Kapazität eine Linie auf Höhe der Spitze.", false, "Elastisch folgt die Kapazität der Last; statisch ist sie die Linie."],
  ["On-premises gibt es das Problem nicht, weil man genau so viel kauft, wie man braucht.", false]
], "Quelle: Berkeley-Report „Above the Clouds“."),
M("itm1-94", "itg-workload", "Welche sind Workload-Kategorien nach Fehling et al. (Cloud Computing Patterns)?", [
  ["Static", true], ["Continuously changing", true], ["Periodic", true], ["Unpredictable / once-in-a-lifetime", true],
  ["Randomized multi-tenant", false]
], "Unvorhersehbare Spitzen sind on-premises am teuersten, weil Kapazität dauerhaft vorgehalten werden muss."),
M("itm1-95", "itg-workload", "Bei welchem Workload bringt Elastizität am wenigsten?", [
  ["Static: konstante Last", true],
  ["Periodic: wiederkehrende Spitzen", false],
  ["Unpredictable: seltene, unvorhersehbare Spitze", false],
  ["Continuously changing: stetig wachsende Last", false],
  ["Uncertain growth bei einem Startup", false]
], "Je kleiner der Abstand zwischen Spitze und Durchschnitt, desto weniger bringt Elastizität."),

/* ---------- p/a-Regel ---------- */
M("itm1-100", "itg-pa", "Welche Aussagen zur p/a-Regel nach Weinman sind richtig?", [
  ["Die Cloud lohnt sich, solange c/d < p/a gilt.", true],
  ["p ist der Preis, a die Anzahl der Server.", false, "p = Peak, a = Average."],
  ["c sind die In-house-Kosten, d die Cloud-Kosten.", false, "Umgekehrt: c = Cloud, d = in-house."],
  ["Bei perfekt statischer Last (p/a = 1) lohnt sich die Cloud nur, wenn sie pro Einheit billiger ist.", true],
  ["Je kleiner p/a, desto eher lohnt sich die Cloud.", false, "Je größer p/a, desto mehr darf die Cloud kosten."]
], "c < d · p/a. Ein statisches Rechenzentrum muss Kapazität für p vorhalten, nutzt aber im Schnitt nur a."),
M("itm1-101", "itg-pa", "Peak 10 Server, Durchschnitt 2 Server. Welche Aussagen sind richtig?", [
  ["p/a = 5", true],
  ["Die Cloud bleibt billiger, solange sie pro Ressource weniger als das 5-Fache der In-house-Kosten kostet.", true],
  ["Kostet die Cloud das 4-Fache, ist sie wirtschaftlicher.", true],
  ["Kostet die Cloud das 6-Fache, ist eigene Hardware wirtschaftlicher.", true],
  ["p/a = 0,2", false, "Das wäre a/p."]
], "Review-Frage 4 der Folie."),
M("itm1-102", "itg-pa", "Wohnmobil-Beispiel: Kauf 92.000 €, 10 % Wertverlust, 2.500 € Vollkasko, 25 Urlaubstage. Welche Aussagen sind richtig?", [
  ["Kosten im ersten Jahr: 11.700 €, also rund 32 € pro Tag.", true],
  ["p = 1 und a = 25/365 ≈ 0,0685, also p/a ≈ 14,6.", true],
  ["Der Vermieter dürfte bis ca. 467 € pro Tag verlangen, damit Mieten noch günstiger ist.", true],
  ["Bei 155 €/Tag lohnt sich der Kauf mehr als das Mieten.", false, "25 × 155 € = 3.875 € statt 11.700 €."],
  ["Der Vermieter braucht rund 7,5 Miettage pro Jahr, um seine Kosten zu decken.", false, "11.700 € ÷ 155 € ≈ 75,5 Miettage."]
], "Merksatz: Je mehr man etwas nutzt, desto eher lohnt sich der Kauf."),
M("itm1-103", "itg-pa", "Pizza-Workloads (30 Tage): Welche p/a-Werte nennt die Folie?", [
  ["Statisch („Fast Food“, 22 Werktage): ≈ 1,4", true],
  ["Kontinuierlich ändernd („Trendsetter“): ≈ 1,4", false, "≈ 3,1."],
  ["Periodisch („Spieleabend“): ≈ 71", false, "≈ 7,1."],
  ["Unvorhersehbar („Familienwochenende“): ≈ 17,1", true],
  ["Statisch: ≈ 17,1", false]
], "Fazit: Static tendiert zu On-Premise, Unpredictable klar zur Cloud."),
M("itm1-104", "itg-pa", "1 VM für 1.000 Stunden oder 1.000 VMs für 1 Stunde: Was gilt in der Cloud (IaaS)?", [
  ["Die Kosten sind gleich.", true],
  ["Das Ergebnis liegt parallel nach 1 statt nach 1.000 Stunden vor.", true],
  ["On-premises müsste man Hardware für 1.000 VMs kaufen, die danach ungenutzt bliebe.", true],
  ["1.000 VMs für 1 Stunde kosten 1.000-mal mehr.", false],
  ["Wie 20 Pizzen in 20 Öfen statt nacheinander in einem.", true]
], "Serial vs. parallel: gleiche Ressourcenstunden, gleiche Kosten, viel schnelleres Ergebnis."),
M("itm1-105", "itg-pa", "Was bewirkt eine feinere Granularität der Abrechnung (Kratzke)?", [
  ["Die Kapazität folgt der Lastkurve genauer.", true],
  ["Man zahlt für denselben Lastverlauf weniger vCPU-Stunden.", true],
  ["Der Anteil voll genutzter Ressourcen steigt.", true],
  ["4 vCPU mit mindestens 120 min ergeben im Beispiel die wenigsten vCPU-Stunden.", false, "Das ergibt mit 120 vCPU-h die meisten; 1 vCPU/5 min nur 56,42."],
  ["Kleinere Einheiten und kürzere Mindestmietdauer sind günstiger für schwankende Last.", true]
], "Beispiel: 120 → 68 → 64 → 56,42 vCPU-Stunden."),
M("itm1-106", "itg-pa", "Peak 12 Server, Durchschnitt 3 Server, die Cloud kostet pro Server das 3-Fache. Was gilt?", [
  ["p/a = 4", true],
  ["Die Cloud ist günstiger, weil 3 < 4.", true],
  ["Eigene Hardware ist günstiger, weil 3 > 1.", false],
  ["Die Cloud wäre auch beim 3,9-Fachen noch günstiger.", true],
  ["Beim 5-Fachen wäre eigene Hardware günstiger.", true]
], "c/d < p/a → Cloud wirtschaftlicher."),

/* ---------- CapEx/OpEx, Pricing ---------- */
M("itm1-110", "itg-cost", "Welche Aussagen zu CapEx sind richtig?", [
  ["Vorab-Ausgaben für physische Infrastruktur", true],
  ["Vermögenswert in der Bilanz, abgeschrieben über die Nutzungsdauer", true],
  ["IT-Hardware wird typisch über 20–30 Jahre abgeschrieben.", false, "Typisch 3–5 Jahre."],
  ["Bindet Kapital vorab und fixiert Kapazität für Jahre", true],
  ["Der Wert der Anlage nimmt über die Zeit ab.", true]
], "CapEx = Capital Expenditure; der Wert nimmt über die Zeit ab."),
M("itm1-111", "itg-cost", "Welche Aussagen zu OpEx sind richtig?", [
  ["Aufwand in der GuV der laufenden Periode", true],
  ["Bindet kein Kapital", true],
  ["Kosten folgen der Nutzung, können aber auch unerwartet steigen.", true],
  ["OpEx erscheint als Vermögenswert in der Bilanz.", false, "Das ist CapEx."],
  ["Wird über 3–5 Jahre abgeschrieben", false, "Das betrifft CapEx."]
], "Die Cloud verschiebt IT von fixen zu variablen Kosten: niedrige Einstiegshürde, „fail fast“."),
M("itm1-112", "itg-cost", "Welche Zuordnungen von Workload und Azure-Preismodell stammen aus der Vorlesung?", [
  ["Statische Grundlast → Reserved Instances / Savings Plan", true],
  ["Kontinuierlich ändernd → Autoscaling + Savings Plan", true],
  ["Periodisch → Autoscaling, Pay-as-you-go, außerhalb der Geschäftszeiten abschalten", true],
  ["Unvorhersehbar → Reserved Instances für 3 Jahre", false, "Unvorhersehbar → Pay-as-you-go, Serverless."],
  ["Unterbrechbare Batch-Jobs → Reserved Instances für 3 Jahre", false, "Dafür passen Spot-VMs."]
], "Interruptible Batch → Spot VMs."),
M("itm1-113", "itg-cost", "Welche maximalen Rabatte nennt die Folie (können sich ändern)?", [
  ["Reserved Instances: bis zu 72 %", true],
  ["Savings Plan for Compute: bis zu 95 %", false, "Bis zu 65 %."],
  ["Spot VMs: bis zu 90 %", true],
  ["Pay-as-you-go: bis zu 50 %", false, "Pay-as-you-go ist der Listenpreis ohne Bindung."],
  ["Reserved Instances: bis zu 90 %", false]
], "RI und Savings Plan: Bindung 1 oder 3 Jahre. Spot: können jederzeit verdrängt werden."),
M("itm1-114", "itg-cost", "Welche Aussagen zu Spot VMs und Azure Hybrid Benefit sind richtig?", [
  ["Spot VMs nutzen ungenutzte Kapazität des Anbieters.", true],
  ["Spot VMs können jederzeit verdrängt (evicted) werden.", true],
  ["Spot VMs eignen sich für die Produktionsdatenbank des Webshops.", false],
  ["Azure Hybrid Benefit erlaubt, vorhandene Windows-Server- und SQL-Server-Lizenzen weiterzuverwenden.", true],
  ["Azure Hybrid Benefit ist ein Rabatt für Hybrid-Cloud-Netzwerkverbindungen.", false]
], "Spot nur für unterbrechbare Jobs."),
M("itm1-115", "itg-cost", "Welche Aussagen zu Budgets und Kostenfallen sind richtig?", [
  ["Ein Budget-Alert schickt nur eine E-Mail, er stoppt nichts.", true],
  ["Vergessene Ressourcen (idle VMs, nicht angehängte Disks) sind typische Kostenfallen.", true],
  ["Egress-Gebühren sind eine Kostenfalle.", true],
  ["Ein Budget-Alert schaltet bei Erreichen alle Ressourcen automatisch ab.", false],
  ["Ingress (Daten in die Cloud hinein) ist die größte Kostenfalle.", false, "Ingress ist meist kostenlos; Egress kostet."]
], "Für die Laborübungen: aufräumen und möglichst skripten, dann kann man löschen und neu aufbauen."),
M("itm1-116", "itg-cost", "Welche Aussagen zum Fall 37signals (Basecamp, HEY) sind richtig?", [
  ["Die Cloud-Rechnung 2022 lag bei rund 3,2 Mio. $.", true],
  ["Die Firma kaufte Server um rund 7 Mio. $.", false, "Rund 700.000 $."],
  ["Sie berichtet für 2024 Mehrkosten von rund 2 Mio. $.", false, "Rund 2 Mio. $ Ersparnis."],
  ["Das nennt man Repatriierung.", true],
  ["Der Fall beweist, dass die Cloud immer teurer ist.", false, "Business Cases gibt es in beide Richtungen."]
], "Weinman: Bei statischen Workloads kann eigene Hardware billiger sein."),
M("itm1-117", "itg-cost", "Was gehört in eine Total Cost of Ownership (TCO)?", [
  ["Hardware und Lizenzen", true], ["Energie, Fläche und Kühlung", true], ["Personal", true], ["Ausfallzeiten", true], ["Migrations- und Exit-Kosten", true]
], "Entscheidung immer auf TCO-Basis, nicht nur nach Listenpreisen."),

/* ---------- Markt, Hype Cycle, Gebote, Fallacies ---------- */
M("itm1-120", "itg-dist", "Welche gehören zu den 5 Geboten der Cloud?", [
  ["Everything fails all the time", true],
  ["Fokus auf MTTF statt MTTR", false, "Umgekehrt."],
  ["Die 8 Fallacies of Distributed Computing respektieren", true],
  ["Scale out, not up", true],
  ["Treat resources as cattle, not pets", true]
], "Ressourcen sind austauschbar: ersetzen statt pflegen."),
M("itm1-121", "itg-dist", "Welche der folgenden sind Fallacies of Distributed Computing?", [
  ["The network is reliable", true], ["Latency is zero", true], ["The cloud is always cheaper", false, "Keine der 8 Fallacies."], ["Transport cost is zero", true],
  ["The network is heterogeneous", false, "Die Fallacy lautet „The network is homogeneous“."]
], "Weiters: The network is secure, Topology doesn't change, There is one administrator."),
M("itm1-122", "itg-dist", "Welche Aussagen zur Herkunft der Fallacies sind richtig?", [
  ["Sie stammen von Sun Microsystems.", true],
  ["Bill Joy und Tom Lyon begannen mit vier Punkten.", true],
  ["Peter Deutsch erweiterte 1994 auf zwölf.", false, "Auf sieben."],
  ["James Gosling strich 1997 alle Punkte bis auf vier.", false, "Er ergänzte den achten."],
  ["Sie wurden 2011 von NIST veröffentlicht.", false]
], "„Transport cost is zero“ hat in der Cloud eine konkrete Form: Egress-Gebühren."),
M("itm1-123", "itg-dist", "Welche Aussagen zu MTTR und MTTF sind richtig?", [
  ["MTTR = Mean Time to Repair", true],
  ["MTTF = Mean Time to Failure", true],
  ["Wichtiger ist, wie schnell etwas wieder läuft, als wann es ausfällt.", true],
  ["Ein System mit hoher MTTR erholt sich besonders schnell.", false, "Hohe MTTR = lange Reparaturzeit."],
  ["Everything fails all the time: Ausfälle sind normal, nicht die Ausnahme.", true]
], "Everything fails all the time → schnell wiederherstellen."),
M("itm1-124", "itg-dist", "Welche Aussagen zu „cattle, not pets“ sind richtig?", [
  ["Ein „Pet“-Server hat einen Namen und wird bei Problemen repariert.", true],
  ["„Cattle“ werden aus Images oder Templates erzeugt und bei Problemen ersetzt.", true],
  ["Cattle-Server bekommen individuelle Namen und werden händisch gepflegt.", false, "Das sind Pets."],
  ["Man sollte jeden Server liebevoll pflegen, damit er lange hält.", false],
  ["Ressourcen werden als austauschbar behandelt.", true]
], "Server ersetzen wie ein Nutztier in einer großen Herde, statt sie zu pflegen wie ein Haustier."),
M("itm1-125", "itg-dist", "Welche Phasen hat der Gartner Hype Cycle?", [
  ["Innovation Trigger", true], ["Peak of Inflated Expectations", true], ["Trough of Disillusionment", true], ["Slope of Enlightenment", true], ["Plateau of Productivity", true]
], "Im Trough sterben manche Produkte; auf dem Plateau verdient man Geld."),
M("itm1-126", "itg-dist", "Welche Aussagen zum Cloud-Markt sind richtig (Größenordnung)?", [
  ["AWS hat rund 28 % Marktanteil.", true],
  ["Microsoft Azure hat rund 50 %.", false, "Rund 21 %."],
  ["Google Cloud hat rund 40 %.", false, "Rund 14 %."],
  ["Ein europäischer Anbieter ist unter den drei Größten.", false],
  ["Haupttreiber des Wachstums ist KI.", true]
], "Big Three zusammen ≈ 63 %. Genaue Zahlen „muss man sich nicht merken“."),

/* ---------- Risiken, Recht, Souveränität, Energie ---------- */
M("itm1-130", "itg-reg", "Welche Aussagen zu Datenresidenz und Datensouveränität sind richtig?", [
  ["Data Residency = welchem Recht die Daten unterliegen.", false, "Das ist Data Sovereignty."],
  ["Data Sovereignty = welchem Recht die Daten unterliegen und wer Zugriff erzwingen kann.", true],
  ["Ein US-Anbieter mit EU-Rechenzentrum erfüllt die Residenz, bleibt aber über den CLOUD Act US-Recht unterworfen.", true],
  ["Liegen die Daten in Frankfurt, gilt automatisch nur EU-Recht.", false, "Falsch, wenn der Anbieter ein US-Unternehmen ist."],
  ["Die Microsoft EU Data Boundary ändert nichts daran, dass US-Recht gilt.", true]
], "Residenz ≠ Souveränität (Review-Frage 7)."),
M("itm1-131", "itg-reg", "Welche Zuordnungen von Regelung und Kernaussage sind richtig?", [
  ["CLOUD Act (2018): US-Behörden können Daten von US-Anbietern verlangen, auch aus der EU.", true],
  ["DORA: Cybersecurity-Pflichten für Unternehmen jeder Branche", false, "DORA betrifft den Finanzsektor."],
  ["NIS2: gilt nur für Banken und Versicherungen", false, "Finanzsektor ist DORA; NIS2 betrifft wesentliche und wichtige Einrichtungen."],
  ["EU Data Act: erleichterter Anbieterwechsel, Wechselgebühren fallen bis 2027 weg", true],
  ["DSGVO: verbietet jede Speicherung personenbezogener Daten in der Cloud", false, "Daten dürfen die EU nur mit angemessenen Garantien verlassen."]
], "DSGVO: z. B. EU-US Data Privacy Framework seit Juli 2023 als Garantie."),
M("itm1-132", "itg-reg", "Welche Aussagen zu NIS2 und DSGVO sind richtig?", [
  ["NIS2 ist eine EU-Richtlinie und muss in nationales Recht umgesetzt werden.", true],
  ["Die DSGVO ist eine Verordnung und gilt direkt.", true],
  ["Zulieferer fallen automatisch unter NIS2.", false, "Die erfasste Einrichtung muss ihre Lieferkette absichern, meist per Vertrag."],
  ["Cloud-Anbieter sind als digitale Infrastruktur selbst erfasst.", true],
  ["NIS2 gilt als Verordnung unmittelbar, ohne nationale Umsetzung.", false, "NIS2 ist eine Richtlinie."]
], "Verordnungen gelten unmittelbar, Richtlinien brauchen nationale Umsetzung."),
M("itm1-133", "itg-reg", "Welche Risiken der Cloud nennt die Folie?", [
  ["Vendor Lock-in (proprietäre Dienste, Data Gravity, Egress)", true],
  ["Abhängigkeit: Ein Ausfall eines Hyperscalers trifft tausende Kunden gleichzeitig.", true],
  ["Netzwerkabhängigkeit: Latenz, Bandbreite, Internetanbindung", true],
  ["Compliance, Datenschutz, Kostenkontrolle und Skills", true],
  ["Fehlkonfiguration als häufigste Sicherheitsursache", true]
], "Tipp: Exit-Strategie ab Tag 1."),
M("itm1-134", "itg-reg", "Welche Aussagen zum AWS-Ausfall vom 20. Oktober 2025 sind richtig?", [
  ["Betroffen war die Region us-east-1 (Nord-Virginia).", true],
  ["Ausgelöst wurde er durch ein Problem bei der DNS-Auflösung des DynamoDB-Endpunkts.", true],
  ["Betroffen war die Region West Europe in Amsterdam.", false, "us-east-1 in Nord-Virginia."],
  ["Ursache war ein Brand im Rechenzentrum.", false],
  ["Meist sind es simple Fehler, aber bei einem Hyperscaler trifft es tausende Kunden.", true]
], "Abhängigkeit & Ausfälle als Risiko."),
M("itm1-135", "itg-reg", "Ein Rechenzentrum verbraucht insgesamt 1.320 MWh, die IT-Geräte davon 1.200 MWh. Welche Aussagen sind richtig?", [
  ["PUE = 1,1", true],
  ["Rund 50 % der Energie gehen in Kühlung und Overhead.", false, "Rund 10 %."],
  ["PUE = Gesamtenergie ÷ Energie der IT-Geräte", true],
  ["Ein PUE von 2,0 wäre ideal.", false, "1,0 wäre ideal."],
  ["PUE = 0,91", false, "Das wäre IT ÷ Gesamt, also verkehrt herum."]
], "Große Anbieter erreichen Werte nahe 1,1; kleine Serverräume liegen weit darüber."),
M("itm1-136", "itg-reg", "Welche Aussagen zu Energie und Nachhaltigkeit sind richtig?", [
  ["Rechenzentren verbrauchten 2024 rund 415 TWh, ca. 1,5 % des weltweiten Stroms.", true],
  ["Prognose bis 2030: Der Verbrauch halbiert sich dank Effizienz.", false, "Er verdoppelt sich etwa (≈ 945 TWh)."],
  ["Haupttreiber ist KI.", true],
  ["Microsoft sichert sich Strom sogar aus Kernkraft (Three Mile Island).", true],
  ["Als Kunde hat man keinen Hebel, z. B. Right-Sizing oder CO₂-arme Regionen.", false]
], "Eigene Hebel: Right-Sizing, automatisches Abschalten, CO₂-arme Regionen, Emissionen messen."),
M("itm1-137", "itg-reg", "Welche Anbieter nennt die Folie als europäische oder souveräne Cloud-Angebote?", [
  ["IONOS", true], ["STACKIT (Schwarz Gruppe)", true], ["OVHcloud", true], ["AWS European Sovereign Cloud", true],
  ["Google Workspace", false, "SaaS-Produkt eines US-Anbieters, kein Sovereign-Cloud-Angebot der Folie."]
], "Kritiker sprechen bei manchen Angeboten von „Sovereignty Washing“ (Aussage Microsoft Frankreich vor dem Senat, Juni 2025).")
];

(X.itinf = X.itinf || []).push({
  id: "itinf-mc-v1",
  course: {
    exam: "quicktest", multiOnly: true,
    quicktest: { units: [{ id: "v1", title: "V1 · Cloud Concepts", topics: V1 }, { id: "v2", title: "V2 · Azure-Architektur", topics: V2 }, { id: "v3", title: "V3 · Governance & Identität", topics: V3 }] },
    examPrep: {
      format: "Keine Abschlussprüfung mehr: Zu jeder Einheit und Übung gibt es einen Quick-Test auf Deutsch. Fragen sind Multiple Choice mit fünf Antworten, von denen eine bis alle fünf richtig sein können. Es gibt Teilpunkte, die Wertung ist aber streng: Falsche Kreuze ziehen richtige wieder ab. Den Stil der Fragen kennst du aus einer alten Prüfung desselben Lehrteams (WS 2023/24): Definitionen mit ihren Eigenschaften, „Welche … sind richtig?“, Zuordnungen und Begründungen.",
      strategy: [
        "Jede Antwort einzeln prüfen: Stimmt diese Aussage für sich? Nicht nach der „einen“ richtigen suchen.",
        "Lieber ein unsicheres Kreuz weglassen als raten: Ein falsches Kreuz kostet so viel, wie ein richtiges bringt.",
        "Aufzählungen vollständig können (5 NIST-Merkmale, 4 Economies of Scale inkl. Sicherheit, 3 Teile von RBAC).",
        "Service-Modelle (IaaS, PaaS, SaaS) und Deployment-Modelle (Public, Private, Hybrid, Community) nie verwechseln.",
        "Rechnungen im Kopf üben: Composite SLA seriell/parallel, p/a, PUE."
      ]
    }
  },
  questions
});
})();
