/* ITINF-GL · Quick-Test-Fragen V1 (Vorlesung 28.09.2026) – Mehrfachauswahl, 5 Antworten, 1 bis 5 richtig.
   Nur Inhalte aus dem gesprochenen Skript (Folien-Details werden nicht abgefragt).
   Helfer M kommt aus mc-v1.js (window.ITINF_M). */
(function () {
const M = window.ITINF_M, X = window.STUDYOS_EXT = window.STUDYOS_EXT || {}; if (!M) return;
const questions = [
M("itn1-1", "vo1-intro", "Was gehört laut Vortrag zum Horseless Carriage Syndrome?", [
  ["Das Neue wird über das Alte beschrieben („Kutsche ohne Pferd“).", true],
  ["Es gab ein Auto mit Pferdekopf, damit Pferde nicht scheuten.", true],
  ["Um 1900 hieß es, das Automobil sei nur eine Modeerscheinung.", true],
  ["Das Muster sieht der Vortragende auch beim Smartphone und aktuell bei der KI.", true],
  ["Es beschreibt, dass neue Technik sofort von allen richtig eingeschätzt wird.", false, "Im Gegenteil – oft wird sie unterschätzt."]
], "Auch Pioniere wie Daimler erkannten das Potenzial nicht."),
M("itn1-2", "vo1-intro", "Was ist zu Gottlieb Daimlers Schätzung richtig?", [
  ["Er hielt höchstens eine Million Autos für möglich.", true],
  ["Als Grund nannte er hohe Kosten und zu wenige Chauffeure.", true],
  ["1920 gab es erst rund hunderttausend Autos.", false, "Bereits acht Millionen."],
  ["Heute gibt es rund 13 Milliarden Autos.", false, "Rund 1,3 Milliarden."],
  ["Er hat vorhergesehen, dass Kosten und Komplexität stark sinken würden.", false, "Genau das hat er übersehen."]
], ""),
M("itn1-3", "vo1-intro", "Was sagte der Vortragende zur Frage, ob die Cloud billiger ist?", [
  ["„Jein.“", true],
  ["Schneller, einfacher, flexibler und effektiver kann man so sagen.", true],
  ["Man muss es immer auf den konkreten Anwendungsfall herunterbrechen.", true],
  ["Die Cloud ist in jedem Fall billiger.", false],
  ["Die Anbieter haben kein Interesse an einem Geschäft.", false, "Sie wollen natürlich ein Geschäft machen."]
], ""),
M("itn1-4", "vo1-intro", "Was ist zum Cloud-Markt und zu den Stimmen von 2008 richtig?", [
  ["Die drei Großen sind AWS, Microsoft Azure und Google Cloud.", true],
  ["Kein europäischer Anbieter ist unter den Großen.", true],
  ["Larry Ellison warnte vor allem davor, in der Cloud „gefangen“ zu sein.", false, "Das war Stallman – Ellison sah nur Client/Server mit anderen Worten."],
  ["Richard Stallman hielt die Cloud für dasselbe wie Client/Server.", false, "Das meinte Ellison."],
  ["Die Zitate stammen aus der Zeit nach der NIST-Definition.", false, "2008 – vor NIST 2011."]
], ""),
M("itn1-5", "vo1-intro", "Welche Themen nannte der Vortragende für die erste Einheit?", [
  ["Warum die Cloud – vor allem aus Sicht der Kosten", true],
  ["Die NIST-Definition", true],
  ["SLAs", true],
  ["KI im Detail", false, "Wird nicht im Detail behandelt."],
  ["Die Programmierung von Azure Functions in C#", false]
], ""),
M("itn1-6", "vo1-nist", "Welche Charakteristiken gehören zur NIST-Definition?", [
  ["On-Demand Self-Service", true],
  ["Broad Network Access", true],
  ["Resource Pooling", true],
  ["Rapid Elasticity", true],
  ["Measured Service", true]
], "„Die muss man ein bisschen auswendig lernen.“"),
M("itn1-7", "vo1-nist", "Was ist zur NIST-Definition richtig?", [
  ["Sie stammt aus 2011.", true],
  ["Sie ist nach wie vor gültig.", true],
  ["Sie umfasst vier Deployment-Modelle und drei Service-Modelle.", true],
  ["Sie enthält Multi-Cloud als fünftes Deployment-Modell.", false],
  ["Sie umfasst über hundert Seiten Definition.", false, "Rund drei Seiten."]
], ""),
M("itn1-8", "vo1-nist", "Was gilt laut Vortrag für Resource Pooling?", [
  ["Wir teilen uns die Hardware mit anderen Kunden.", true],
  ["Wir wissen nur ungefähr, wo die Ressourcen liegen (z. B. Frankfurt, Wien).", true],
  ["Die genaue Location muss und kann man als Endkunde nicht wissen.", true],
  ["Jeder Kunde bekommt eigene physische Server.", false],
  ["Man kann jederzeit das Rechenzentrum besichtigen.", false]
], "Multi-Tenant und Location Independence."),
M("itn1-9", "vo1-nist", "Was ist zu Rapid Elasticity und Measured Service richtig?", [
  ["In der Cloud skaliert man per Mausklick statt Hardware nachzukaufen.", true],
  ["Für uns wirkt es, als hätten wir unbegrenzte Ressourcen.", true],
  ["Der Anbieter stellt Metriken und Logs bereit, damit verrechnet werden kann.", true],
  ["Ein Cloud-Rechenzentrum ist tatsächlich unendlich groß.", false],
  ["Metriken darf man nicht in der eigenen Applikation verwenden.", false]
], ""),
M("itn1-10", "vo1-nist", "Was ist zu On-Demand Self-Service und Broad Network Access richtig?", [
  ["Ressourcen lassen sich ohne menschliche Interaktion beim Anbieter anlegen.", true],
  ["Im Unternehmen mit eigenen Servern geht das immer ohne Ticket.", false, "Dort öffnet man meist ein Ticket."],
  ["Der Zugriff ist nur direkt aus dem Rechenzentrum möglich.", false],
  ["Es funktioniert nur mit Workstations.", false, "Alle Client-Plattformen."],
  ["Self-Service gibt es nur bei AWS, nicht bei kleineren Anbietern wie Hetzner.", false]
], ""),
M("itn1-11", "vo1-deploy", "Was gilt für die Private Cloud laut Vortrag?", [
  ["Sie ist exklusiv für eine Organisation.", true],
  ["Sie muss zwingend im eigenen Gebäude stehen.", false, "On- oder off-premises."],
  ["Man muss nichts vorab investieren.", false, "Hardware muss vorab gekauft werden."],
  ["Man hat volle Kontrolle, aber auch die Pflicht, Updates einzuspielen.", true],
  ["Sie wird mit Geschäftspartnern geteilt.", false, "Das wäre eine Community Cloud."]
], ""),
M("itn1-12", "vo1-deploy", "Was ist zur Hybrid Cloud richtig?", [
  ["Sie ist sehr verbreitet und historisch gewachsen.", true],
  ["Sie verbindet eigene Services und Server mit der Public Cloud.", true],
  ["Sie ist sinnvoll bei Compliance und rechtlichen Anforderungen.", true],
  ["Cloud Bursting funktioniert dabei immer nahtlos ohne Vorbereitung.", false, "Erfordert viel Planung."],
  ["Hybrid bedeutet, zwei Public Clouds gleichzeitig zu nutzen.", false, "Das ist Multi-Cloud."]
], ""),
M("itn1-13", "vo1-deploy", "Was gehört laut Vergleich zur Public Cloud?", [
  ["Keine Vorab-Investitionen, um zu skalieren", true],
  ["Ressourcen schnell bereitstellen und wieder freigeben", true],
  ["Pay-as-you-go – nur zahlen, was man nutzt", true],
  ["Hardware vorab kaufen und selbst warten", false],
  ["Volle Pflicht, selbst die physische Hardware zu aktualisieren", false]
], "Wie die Stromrechnung."),
M("itn1-14", "vo1-deploy", "Was ist zu Multi-Cloud richtig?", [
  ["Man nutzt zwei oder mehr Public Clouds gleichzeitig.", true],
  ["Sie ist das fünfte Deployment-Modell der NIST-Definition.", false, "Sie kommt in NIST 2011 nicht vor."],
  ["Jeder Anbieter hat eine eigene API – Skripte sind nicht übertragbar.", true],
  ["Ein Motiv ist die Vermeidung von Vendor Lock-in.", true],
  ["Alle Anbieter nutzen eine gemeinsame Standard-API.", false]
], ""),
M("itn1-15", "vo1-deploy", "Welche Hinweise zum Vergleich der Modelle wurden genannt?", [
  ["Mit „Cloud Computing“ ist meist die Public Cloud gemeint.", true],
  ["Bei intensiver Public-Cloud-Nutzung entsteht ein Vendor Lock-in.", true],
  ["Die Lock-in-Sorge wird oft mit Private-Cloud-Ansätzen beantwortet.", true],
  ["Private-Cloud-Ansätze sind immer wirtschaftlich sinnvoll.", false, "Nicht immer."],
  ["Die Community Cloud ist das häufigste Modell.", false, "Der Begriff ist eher selten."]
], ""),
M("itn1-16", "vo1-virt", "Welche Nachteile hat Bare Metal laut Vortrag?", [
  ["Applikationen lassen sich nicht leicht umziehen.", true],
  ["Die Hardware ist oft nur zu 5 bis 10 % ausgelastet.", true],
  ["Backup und Recovery werden kompliziert.", true],
  ["Bare Metal ist immer voll ausgelastet.", false],
  ["Bare Metal braucht man heute für jede neue Applikation.", false, "Eigentlich nur noch für alte Applikationen."]
], ""),
M("itn1-17", "vo1-virt", "Was ist zu VMs und Containern richtig?", [
  ["VMs lassen sich relativ leicht auf andere Server verschieben.", true],
  ["Golden Images werden nur bei Containern verwendet.", false, "Bei VMs – für standardisierte Umgebungen."],
  ["Ein Container bringt alles mit, was er zum Laufen braucht.", true],
  ["VMs lassen sich schneller deployen als Container.", false],
  ["Container brauchen keinerlei Hardware darunter.", false, "Meist eine VM mit Container-Engine."]
], ""),
M("itn1-18", "vo1-virt", "Welche Trigger-Beispiele für den Webshop nannte der Vortrag?", [
  ["HTTP-Request (neue Bestellung) → Bestellbestätigung", true],
  ["Upload eines Produktbilds in den Blob Storage → Bild verkleinern", true],
  ["Timer jede Nacht um 2:00 Uhr → täglicher Verkaufsbericht", true],
  ["Telefonanruf beim Admin → VM wird gekauft", false],
  ["Stromausfall → Rechenzentrum wird gebaut", false]
], ""),
M("itn1-19", "vo1-virt", "Was gilt laut Vortrag für Function as a Service?", [
  ["Eine Funktion ist nach der Ausführung beendet.", true],
  ["Ohne Aufruf braucht sie keine CPU – in der Public Cloud keine Kosten.", true],
  ["Am Black Friday muss man Functions von Hand hochskalieren.", false, "Die Plattform startet automatisch tausende Instanzen."],
  ["Functions dürfen beliebig lange laufen.", false, "Laufzeitlimit, z. B. etwa zehn Minuten."],
  ["Ein laufender Container ist genauso kostenlos wie eine nicht aufgerufene Funktion.", false, "Ein Container braucht immer etwas CPU und Speicher."]
], "Scale to Zero."),
M("itn1-20", "vo1-virt", "Was sagte der Vortragende zum Webshop-Szenario und zur Folie „Example Webshop | 1“?", [
  ["Abends ist Spitzenlast, nachts kaum Last.", true],
  ["Der Server ist meist im Leerlauf, verbraucht aber Strom.", true],
  ["Das Diagramm auf der Folie ist fehlerhaft und wurde mit KI erstellt.", true],
  ["Für die Aussage zählt der Text der Folie.", true],
  ["Der Server wird nachts automatisch abgeschaltet.", false, "Er läuft trotzdem durch."]
], ""),
M("itn1-21", "vo1-virt", "Was ist zum Fazit und zur Demo richtig?", [
  ["Bare Metal, VMs, Container und Serverless schließen einander nicht aus.", true],
  ["Die Wahl hängt auch vom Know-how im Team ab.", true],
  ["In der Demo wurde per QEMU/KVM eine Debian-VM gestartet.", true],
  ["Man konnte sich danach per SSH einloggen.", true],
  ["Braucht man die VM nicht mehr, wird sie wieder gelöscht.", true]
], ""),
M("itn1-22", "vo1-svc", "Was ist zu den Layern richtig?", [
  ["Layer 1 ist die Hardware – als Kunde kommen wir nicht heran.", true],
  ["Bei IaaS patcht der Kunde das Betriebssystem selbst.", true],
  ["Bei PaaS patcht der Kunde das Betriebssystem selbst.", false, "Das übernimmt der Anbieter."],
  ["SaaS sind z. B. Azure App Service und Azure Functions.", false, "Das ist PaaS bzw. FaaS."],
  ["Bei SaaS muss man sich selbst um alle Updates kümmern.", false]
], ""),
M("itn1-23", "vo1-svc", "Was gilt für PaaS laut Vortrag?", [
  ["Der Kunde patcht das Betriebssystem selbst.", false, "Das übernimmt der Anbieter."],
  ["Die Applikation kann nicht skalieren.", false, "Sie kann automatisch skalieren."],
  ["Azure App Service ist ein typisches Beispiel.", true],
  ["Function as a Service wird bei SaaS eingeordnet.", false, "Bei PaaS bzw. als Zwischenschicht."],
  ["Man wählt fix vier vCPUs und das bleibt immer so.", false, "Das ist bei einer VM so."]
], ""),
M("itn1-24", "vo1-svc", "Was ist zum Prüfungstipp richtig?", [
  ["Service-Modelle: IaaS, PaaS, SaaS", true],
  ["Deployment-Modelle: Public, Private, Hybrid, Community", true],
  ["In den Service-Modellen steckt immer „as a Service“.", true],
  ["Multi-Cloud ist eines der vier NIST-Deployment-Modelle.", false],
  ["Hybrid Cloud ist ein Service-Modell.", false]
], "Eine Frage, die immer wieder falsch beantwortet wird."),
M("itn1-25", "vo1-svc", "Was ist zu XaaS und SaaS-Kosten richtig?", [
  ["XaaS steht für „Everything as a Service“.", true],
  ["Database as a Service kam nach der NIST-Definition dazu.", true],
  ["1.000 Benutzer × 30 € × 12 Monate = 360.000 € pro Jahr.", true],
  ["SaaS wird meist im Abo-Modell bezahlt.", true],
  ["NIST definiert über zehn Service-Modelle.", false, "Nur drei."]
], ""),
M("itn1-26", "vo1-svc", "Welche Zuordnungen bei Pizza as a Service stimmen?", [
  ["Homemade: alles selbst – entspricht On-Premises.", true],
  ["Take & Bake: nur noch Ofen, Getränke, Tisch.", true],
  ["Home Delivery: nur noch Tisch (Getränke evtl. mitbestellen).", true],
  ["Restaurant: um nichts mehr kümmern.", true],
  ["Restaurant: man bringt den eigenen Ofen mit.", false]
], ""),
M("itn1-27", "vo1-shared", "Wofür ist der Kunde unabhängig vom Service-Modell immer verantwortlich?", [
  ["Informationen und Daten", true],
  ["Geräte, mit denen zugegriffen wird", true],
  ["Accounts und Identitäten", true],
  ["Physische Hosts", false, "Immer Anbieter."],
  ["Physisches Netzwerk", false, "Immer Anbieter."]
], "„Always yours.“"),
M("itn1-28", "vo1-shared", "Was ist zum Pfeil und zu den Grafiken richtig?", [
  ["Nach rechts (SaaS) wird es einfacher, aber der Lock-in stärker.", true],
  ["Nach links ist man unabhängiger, muss sich aber um mehr kümmern.", true],
  ["In der zweiten Grafik sind „Daten und Zugriff“ immer grün.", true],
  ["Speichern Sie Daten in Outlook, sind Sie dafür verantwortlich.", true],
  ["Laut Vortrag ist die erste Grafik die bessere.", false, "Die zweite ist besser."]
], ""),
M("itn1-29", "vo1-shared", "Welche Zuordnungen aus dem Quiz sind richtig?", [
  ["Azure-VM mit eigenem SQL Server → IaaS", true],
  ["Azure SQL Database → PaaS", true],
  ["Microsoft Teams → SaaS", true],
  ["Azure Functions, die Bilder verkleinern → SaaS", false, "PaaS bzw. FaaS."],
  ["Die OS-Patches einer Azure-VM installiert Microsoft.", false, "Der Kunde."]
], ""),
M("itn1-30", "vo1-benefit", "Was ist zu SLAs und Skalierung richtig?", [
  ["Ein SLA garantiert vertraglich, dass das System nicht öfter ausfällt als angegeben.", true],
  ["Je höher das SLA, desto billiger wird es.", false],
  ["Vertikal skalieren heißt, mehr vCPUs und RAM hinzuzufügen.", true],
  ["Horizontal skalieren heißt, einer VM mehr RAM zu geben.", false, "Das ist vertikal."],
  ["Heute skaliert man eher vertikal, weil eine große Maschine ausfallsicherer ist.", false, "Eher horizontal – Single Point of Failure."]
], ""),
M("itn1-31", "vo1-benefit", "Was ist zu Disaster Recovery, Replikation und Backup richtig?", [
  ["Bei einem großen Stromausfall in Wien kann man auf eine andere Region (z. B. Amsterdam) ausweichen.", true],
  ["Replikation schützt vor Datenverlust durch defekte Festplatten.", true],
  ["Replikation bedeutet nicht automatisch, dass man zu einem Stand von vor drei Wochen zurück kann.", true],
  ["Der OneDrive-Papierkorb ist eher ein Backup.", true],
  ["Georedundanz bekommt man bei eigenen Ressourcen immer automatisch und gratis.", false, "Bewusst entscheiden und bezahlen."]
], ""),
M("itn1-32", "vo1-benefit", "Welche Cloud-Vorteile wurden im Vortrag einzeln erklärt?", [
  ["Hochverfügbarkeit", true],
  ["Skalierbarkeit", true],
  ["Elastizität", true],
  ["Agilität", true],
  ["Globale Reichweite", true]
], "Dazu Disaster Recovery."),
M("itn1-33", "vo1-sla", "Welche Paare aus Verfügbarkeit und maximaler Ausfallzeit pro Jahr stimmen?", [
  ["99 % → 3,65 Tage", true],
  ["99,9 % → 8,76 Stunden", true],
  ["99,99 % → 52,6 Minuten", true],
  ["99,95 % → 52,6 Minuten", false, "4,38 Stunden."],
  ["99,999 % → 8,76 Stunden", false, "5,26 Minuten."]
], "8.760 h × (1 − Verfügbarkeit)."),
M("itn1-34", "vo1-sla", "Was ist zum zusammengesetzten SLA richtig?", [
  ["Seriell (alle Dienste gebraucht) werden die Verfügbarkeiten multipliziert.", true],
  ["99,95 % × 99,99 % ≈ 99,94 % ≈ 5,3 Stunden pro Jahr.", true],
  ["Parallel gilt 1 − (1 − A)ⁿ.", true],
  ["Zwei Regionen mit je 99,95 % ergeben ≈ 99,99998 %.", true],
  ["Seriell wird das Ergebnis besser als der beste Einzeldienst.", false, "Schlechter als der schwächste."]
], ""),
M("itn1-35", "vo1-scale", "Welche vier Kostentreiber der Economies of Scale nennt der Vortrag?", [
  ["Einkaufsmacht", true],
  ["Personalkosten", true],
  ["Sicherheit und Zuverlässigkeit", true],
  ["Stromkosten", true],
  ["Werbebudget", false]
], "Alle vier nennen."),
M("itn1-36", "vo1-scale", "Was ist zu den Beispielen der Kostentreiber richtig?", [
  ["Die 30 % Rabatt sind ein exakter, aktueller Wert.", false, "Aus einem alten Whitepaper, nicht exakt zu nehmen."],
  ["Das österreichische Microsoft-Rechenzentrum kann man jederzeit besichtigen.", false, "Hochsicherheitstrakt, nur sehr wenige Personen haben Zutritt."],
  ["Strom wird zunehmend zum größten Posten der Gesamtbetriebskosten.", true],
  ["Große Anbieter wählen Standorte unabhängig vom Strompreis.", false],
  ["Kleine Firmen können über den Strompreis genauso verhandeln wie große Abnehmer.", false]
], ""),
M("itn1-37", "vo1-scale", "Was ist zur Economics of the Cloud richtig?", [
  ["Von Mainframe über Client/Server zur Cloud – möglich durch Virtualisierung.", true],
  ["Dass wir in der Cloud sind, hat vor allem mit Ökonomie zu tun.", true],
  ["Je größer man baut, desto günstiger die einzelne Einheit.", true],
  ["Cloud ist eine reine Rückkehr zur Mainframe-Ära.", false],
  ["Technik war laut Vortrag der Haupttreiber, Geld spielt keine Rolle.", false]
], ""),
M("itn1-38", "vo1-workload", "Welche Zuordnungen von Beispiel und Workload-Pattern stimmen?", [
  ["Exchange-Server → zufälliges Muster", true],
  ["Suchanfragen in UK und Japan → Tageszeit-Muster", true],
  ["US-Steuererklärung bis 15. April → branchenspezifisches Muster", true],
  ["CPU-lastige + speicherlastige App kombinieren → Multi-Ressourcen-Muster", true],
  ["TechCrunch-Effekt → Tageszeit-Muster", false, "Unsicheres Wachstum."]
], ""),
M("itn1-39", "vo1-workload", "Was ist zum Dimensionierungsproblem richtig?", [
  ["On-premises reicht die Kapazität für den Durchschnitt.", false, "Mindestens für den Peak."],
  ["Überprovisioniert zu sein kostet nichts extra.", false, "Man zahlt für ungenutzte Ressourcen."],
  ["In der Cloud kann die Kapazität dem Bedarf folgen.", true],
  ["On-premises folgt man steigender Last exakt entlang der Kurve.", false, "Treppenförmig."],
  ["Prognosen treffen on-premises immer exakt ein.", false]
], ""),
M("itn1-40", "vo1-pa", "Was ist zur Formel c/d < p/a richtig?", [
  ["c sind die Cloud-Kosten, d die In-house-Kosten.", true],
  ["p ist die Spitzenlast, a die Durchschnittslast.", true],
  ["Die Cloud darf pro Einheit teurer sein als in-house.", true],
  ["Die Cloud ist besonders wirtschaftlich, wenn die Last stark schwankt.", true],
  ["Bei konstanter Last ist p/a besonders groß.", false, "Dann ist p/a ≈ 1."]
], ""),
M("itn1-41", "vo1-pa", "Welche Zahlen zum Wohnmobil-Beispiel stimmen?", [
  ["Kaufpreis 92.000 €, Wertverlust 10 % = 9.200 €", true],
  ["Mit 2.500 € Vollkasko kostet es im ersten Jahr 11.700 €.", true],
  ["p/a ≈ 1,46, also bis ≈ 47 € pro Tag akzeptabel", false, "p/a ≈ 14,6, bis ≈ 467 €."],
  ["25 Tage Miete zu 155 € kosten 3.875 €.", true],
  ["Der Vermieter deckt seine Kosten schon nach 25 Tagen.", false, "Nach rund 75,5 Tagen."]
], ""),
M("itn1-42", "vo1-pa", "Was ist zu Serial vs. Parallel richtig?", [
  ["20 Pizzen mit einem Ofen à 15 Minuten dauern 20 Minuten.", false, "5 Stunden."],
  ["Mit 20 Öfen dauert es ebenfalls 5 Stunden.", false, "15 Minuten."],
  ["Eine VM für 1.000 Stunden kostet gleich viel wie 1.000 VMs für eine Stunde.", true],
  ["On-premises wäre der Kauf von Hardware für 1.000 VMs günstiger.", false, "Deutlich teurer – und danach nicht ausgelastet."],
  ["1.000 VMs für eine Stunde sind in der Cloud 1.000-mal teurer.", false]
], ""),
M("itn1-43", "vo1-gran", "Welche Paare aus Pizza-Workload und p/a stimmen?", [
  ["Statisch („Fast Food“) → ≈ 1,4", true],
  ["Kontinuierlich ändernd („Trendsetter“) → ≈ 3,1", true],
  ["Periodisch („Spieleabend“) → ≈ 7,1", true],
  ["Unvorhersehbar („Familienwochenende“) → ≈ 17,1", true],
  ["Statisch → ≈ 17,1", false]
], ""),
M("itn1-44", "vo1-gran", "Was ist zum Effekt feiner Granularität richtig?", [
  ["Bei 4 vCPU und 120 Minuten mietet man 120 vCPU-Stunden.", true],
  ["Bei 1 vCPU und 5 Minuten braucht man nur 56,42 vCPU-Stunden.", true],
  ["Je feingranularer, desto günstiger kann es werden.", true],
  ["Bei 4 vCPU/120 min sind 73 % mit 50 % Last oder weniger ausgelastet.", true],
  ["Bei 1 vCPU und 5 Minuten sind nur 27 % voll ausgelastet.", false, "66 %."]
], "")
];
(X.itinf = X.itinf || []).push({ id: "itinf-mc-vo1", questions });
})();
