/* ITINF-GL · Quick-Test-Fragen V2 (Vorlesung 8.10.2026) – Mehrfachauswahl, 5 Antworten, 1 bis 5 richtig.
   Nur Inhalte aus dem gesprochenen Skript (Folien-Details werden nicht abgefragt).
   Helfer M kommt aus mc-v1.js (window.ITINF_M). */
(function () {
const M = window.ITINF_M, X = window.STUDYOS_EXT = window.STUDYOS_EXT || {}; if (!M) return;
const questions = [
M("itn2-1", "vo2-ki", "Welche Aussagen zur KI-Nutzung aus der Diskussion am 8.10. sind richtig?", [
  ["Nur weil man etwas generiert hat, hat man noch nichts gelernt.", true],
  ["Bei der Prüfung darf keine KI verwendet werden.", true],
  ["In Firmen wird man laut Vortrag kaum mehr ohne KI-Tools arbeiten.", true],
  ["Human in the Loop heißt, dass die KI am Ende entscheidet, was deployt wird.", false, "Ein Mensch entscheidet."],
  ["Fragen zu Urheberrecht spielen beim Generieren keine Rolle.", false, "Sie sollten mitschwingen."]
], "Beim Lernen ist grundsätzlich alles erlaubt."),
M("itn2-2", "vo2-ki", "Was gilt laut Vortrag für den Self-Learning-Bereich in Moodle?", [
  ["Er enthält eine Datei aus der Vorlesungsaufnahme.", true],
  ["Die Studierenden sollen daraus Lernmaterial erzeugen und es für alle wieder hochladen.", true],
  ["Das rohe Whisper-Transkript ist perfekt lesbar.", false, "Halbe Sätze, Fehler, Dialekt."],
  ["Nur Podcasts sind als Lernmaterial erlaubt.", false, "Grundsätzlich ist alles erlaubt."],
  ["Er ersetzt die Prüfung.", false]
], ""),
M("itn2-3", "vo2-capex", "Welche Aussagen beschreiben CapEx richtig?", [
  ["Man nimmt im Vorhinein Geld in die Hand und kauft physische Infrastruktur.", true],
  ["Die Hardware wird über ihre Nutzungsdauer abgeschrieben, typischerweise drei bis fünf Jahre.", true],
  ["Kapital ist gebunden und die Kapazität für Jahre fix.", true],
  ["Der Wert der Hardware sinkt über die Zeit.", true],
  ["Abgerechnet wird sofort als Aufwand der laufenden Periode.", false, "Das ist OpEx."]
], "Capital Expenditure."),
M("itn2-4", "vo2-capex", "Welche Aussagen zu OpEx und Pay-as-you-go sind richtig?", [
  ["Man zahlt nur, was man tatsächlich genutzt hat.", true],
  ["Die Kosten werden in kleinere Portionen aufgeteilt.", true],
  ["Es ist in Summe immer billiger als CapEx.", false, "Hängt vom Lastverlauf ab."],
  ["Die Kosten sind ohne Erfahrungswerte immer exakt vorhersehbar.", false, "Genau das ist schwierig."],
  ["Man muss im Voraus große Beträge investieren.", false]
], ""),
M("itn2-5", "vo2-capex", "Was gehört laut Vortrag zur Total Cost of Ownership?", [
  ["Lizenzen", true],
  ["Energie für Betrieb und Kühlung", true],
  ["Fläche und Personal", true],
  ["Ausfallzeiten", true],
  ["Migrations- und Ausstiegskosten", true]
], "Man zahlt nicht nur die Hardware."),
M("itn2-6", "vo2-capex", "Ein Unternehmen hat keine Erfahrungswerte und will Cloud-Kosten für das nächste Wirtschaftsjahr planen. Welche Aussagen passen zum Vortrag?", [
  ["Das ist schwierig – man weiß nicht, was es kosten wird, und kann es nur ausprobieren.", true],
  ["Für einen Forecast ist das nicht gern gesehen.", true],
  ["Ein fixes Budget wie beim Hardwarekauf wäre leichter zu planen.", true],
  ["Mit Pay-as-you-go sind die Kosten am ersten Tag exakt bekannt.", false],
  ["Variable Kosten sind für Firmen immer leichter zu planen.", false]
], "Beispiel Videoportal: Abo, dann zusätzliche Credits."),
M("itn2-7", "vo2-capex", "Was steht laut Vortrag hinter der Folienaussage „Better cost prediction“ beim verbrauchsbasierten Modell?", [
  ["Es ist die Argumentation der Cloud-Anbieter: Jede Ressource hat einen Preis, abgerechnet wird nach Nutzung.", true],
  ["Der Vortragende nannte sie verwirrend, weil die Kosten eigentlich schwerer abzuschätzen sind.", true],
  ["Sie bedeutet, dass die Cloud immer billiger ist.", false],
  ["Sie bedeutet, dass es in der Cloud fixe Jahrespreise gibt.", false],
  ["Sie gilt nur für Spot-VMs.", false]
], ""),
M("itn2-8", "vo2-price", "Welche Zuordnungen Preismodell → Eigenschaft stimmen?", [
  ["Reserved Instances: 1 oder 3 Jahre, bis zu 72 % günstiger", true],
  ["Savings Plan for Compute: stündlicher Ausgabebetrag, bis zu 65 %", true],
  ["Spot-VMs: bis zu 90 % Rabatt, jederzeit entziehbar", true],
  ["Azure Hybrid Benefit: vorhandene Windows-Server- und SQL-Server-Lizenzen weiterverwenden", true],
  ["Pay-as-you-go: drei Jahre Mindestbindung", false, "Keine Bindung."]
], "Wichtig ist, wann man welches Modell einsetzen kann."),
M("itn2-9", "vo2-price", "Für welche Fälle sind Spot-VMs laut Vortrag geeignet?", [
  ["Ein Batch-Job, bei dem nur das Endergebnis zählt und der bei Unterbrechung neu gestartet wird", true],
  ["Der Webshop, auf den Kunden ständig zugreifen", false, "Dafür ist das nichts."],
  ["Das Online-Banking", false],
  ["Ein Dienst, der nie unterbrochen werden darf", false],
  ["Die Anmeldeseite einer Universität während der Prüfungsanmeldung", false]
], "Spot-VMs können jederzeit entzogen werden."),
M("itn2-10", "vo2-price", "Welche Zuordnungen Workload → Preismodell entsprechen der Tabelle im Vortrag?", [
  ["Statische Grundlast → Reserved Instances / Savings Plan (oder lokal hosten)", true],
  ["Periodisch → Autoscaling, Pay-as-you-go, außerhalb der Geschäftszeiten abschalten", true],
  ["Unvorhersehbar → Pay-as-you-go, Serverless", true],
  ["Unterbrechbare Batch-Jobs → Spot-VMs", true],
  ["Kontinuierlich ändernd → nur Spot-VMs", false, "Autoscaling + Savings Plan."]
], ""),
M("itn2-11", "vo2-price", "Warum sind Reserved Instances laut Vortrag günstiger?", [
  ["Weil man sich für ein oder drei Jahre committet.", true],
  ["Weil auch der Anbieter mit fixen Einnahmen rechnen kann.", true],
  ["Weil sie jederzeit entzogen werden können.", false, "Das sind Spot-VMs."],
  ["Weil sie keinen Strom verbrauchen.", false],
  ["Weil sie ohne Lizenzen laufen.", false]
], "Ähnlich wie eigene Hardware kaufen."),
M("itn2-12", "vo2-cost", "Welche Kostenfallen nennt die Folie?", [
  ["Vergessene Ressourcen wie laufende VMs oder nicht angehängte Disks", true],
  ["Überdimensionierte VMs", true],
  ["Egress-Gebühren", true],
  ["Fehlende Tags und Budgets", true],
  ["Zu viele Availability Zones", false]
], "Dagegen hilft FinOps: Budgets, Tags, Alerts, Right-Sizing."),
M("itn2-13", "vo2-cost", "Was gilt laut Vortrag für Budget-Alerts im Azure-Tenant der FH?", [
  ["Wird ein Budget voraussichtlich überschritten, kommt eine E-Mail bzw. ein Alert.", true],
  ["Die Ressourcen laufen weiter und werden weiter verrechnet.", true],
  ["Bei Erreichen des Budgets wird automatisch alles gestoppt.", false, "Genau das kann man nicht einstellen."],
  ["Ressourcen werden bei Erreichen des Budgets gelöscht.", false],
  ["Budget-Alerts gibt es im FH-Tenant nicht.", false]
], "Darum aufräumen und skripten."),
M("itn2-14", "vo2-cost", "Welche Aussagen zu 37signals und „Ist die Cloud immer billiger?“ sind richtig?", [
  ["37signals zahlte 2022 rund 3,2 Mio. $ für die Cloud.", true],
  ["Die Firma kaufte Server um rund 700.000 $ und berichtet für 2024 rund 2 Mio. $ Ersparnis.", true],
  ["Solche Business Cases gibt es laut Vortrag in beide Richtungen.", true],
  ["Laut Weinman rechnet sich die Cloud, wenn p/a hoch ist.", true],
  ["Das Beispiel beweist, dass jede Firma aus der Cloud ausziehen sollte.", false]
], ""),
M("itn2-15", "vo2-cost", "Warum sollen Studierende laut Vortrag ihren Aufbau skripten?", [
  ["Damit sie ihn leicht löschen und wieder aufbauen können.", true],
  ["Weil das näher an der Realität ist als Zusammenklicken in der GUI.", true],
  ["Weil man beim Zusammenklicken am Ende oft nicht mehr weiß, was konfiguriert ist.", true],
  ["Weil Skripte keine Kosten verursachen.", false],
  ["Weil die GUI im FH-Tenant gesperrt ist.", false]
], "Ressourcen übers Wochenende laufen lassen kostet ohne Nutzen."),
M("itn2-16", "vo2-cost", "Was sind Lock-in-Kosten laut Vortrag?", [
  ["Proprietäre PaaS- und Serverless-Dienste mit herstellerspezifischen Besonderheiten erschweren den Wechsel.", true],
  ["Hohe Kosten, um Daten von einem Provider zum anderen zu transferieren.", true],
  ["Gebühren für das Abschließen von Serverräumen.", false],
  ["Rabatte für Reserved Instances.", false],
  ["Kosten für Budget-Alerts.", false]
], "Man kann nicht einfach zu AWS wechseln, nur weil es dort billiger ist."),
M("itn2-17", "vo2-market", "Welche Aussagen zum Cloud-Markt sind laut Vortrag richtig?", [
  ["AWS ist seit Jahren Marktführer.", true],
  ["Die Reihenfolge ist AWS, Azure, Google Cloud.", true],
  ["Die drei Großen haben zusammen rund 63 %.", true],
  ["Die Abstände zwischen den Anbietern werden kleiner.", true],
  ["Die Anbieter investieren massiv in künftige Rechenzentren.", true]
], "≈ 28 %, 21 %, 14 %."),
M("itn2-18", "vo2-market", "Welche Aussagen zum Gartner Hype Cycle sind richtig?", [
  ["Nach dem Innovation Trigger steigen die Erwartungen schnell.", true],
  ["Im Trough of Disillusionment sterben manche Produkte.", true],
  ["Am Plateau of Productivity lässt sich gut Geld verdienen.", true],
  ["Auf der Grafik von 2022 lag Cloud-native ganz oben am Peak.", true],
  ["Der Peak of Inflated Expectations ist die letzte Phase.", false, "Die letzte Phase ist das Plateau."]
], ""),
M("itn2-19", "vo2-rules", "Welche gehören zu den fünf Geboten der Cloud?", [
  ["Everything fails all the time", true],
  ["Fokus auf MTTR statt MTTF", true],
  ["Die acht Fallacies respektieren", true],
  ["Scale out, not up", true],
  ["Treat resources as cattle, not pets", true]
], "Alle fünf."),
M("itn2-20", "vo2-rules", "Welche Aussagen zu MTTR und MTTF sind richtig?", [
  ["MTTR ist die Mean Time to Repair.", true],
  ["Laut Vortrag ist wichtiger, wie schnell etwas wieder läuft, als wann es ausfällt.", true],
  ["MTTF ist die Mean Time to Failure.", true],
  ["Ziel ist, Ausfälle zu 100 % zu verhindern.", false, "Das gibt es nicht."],
  ["Bei Instagram fällt ein Ausfall von 30 Tagen kaum auf.", false, "Zehn Minuten fallen kaum auf."]
], ""),
M("itn2-21", "vo2-rules", "Warum „scale out, not up“?", [
  ["Fällt eine große Maschine aus, ist viel betroffen.", true],
  ["Bei einer großen Maschine ist die MTTR hoch.", true],
  ["Bei vielen kleinen Maschinen laufen die anderen weiter.", true],
  ["Weil vertikale Skalierung technisch unmöglich ist.", false],
  ["Weil horizontale Skalierung keine Kosten verursacht.", false]
], "Horizontal = mehr VMs, vertikal = mehr vCPUs/Memory."),
M("itn2-22", "vo2-rules", "Was bedeutet „cattle, not pets“?", [
  ["Server werden nicht mehr repariert, sondern durch neue ersetzt.", true],
  ["Server pflegt man wie Haustiere und geht mit ihnen „zum Tierarzt“.", false],
  ["Jeder Server bekommt einen Namen und wird individuell betreut.", false],
  ["Man betreibt möglichst nur einen einzigen Server.", false],
  ["Ausfälle einzelner Server sind ein großes Drama für den Betrieb.", false]
], "Fällt eine „Kuh“ um, ersetzt man sie."),
M("itn2-23", "vo2-fall", "Welche Annahmen gehören zu den acht Fallacies of Distributed Computing?", [
  ["Das Netzwerk ist zuverlässig.", true],
  ["Die Latenz ist null.", true],
  ["Die Bandbreite ist unendlich.", true],
  ["Es gibt einen Administrator.", true],
  ["Die CPU ist unendlich schnell.", false]
], "Dazu: Netzwerk sicher, Topologie fix, Transportkosten null, Netzwerk homogen."),
M("itn2-24", "vo2-fall", "Welche Aussagen zur Herkunft der Fallacies sind richtig?", [
  ["Die Liste stammt ursprünglich von Sun Microsystems.", true],
  ["Peter Deutsch erweiterte sie 1994 auf sieben Punkte.", true],
  ["James Gosling fügte um 1997 den achten Punkt hinzu.", true],
  ["Bill Joy und Tom Lyon begannen mit vier Punkten.", true],
  ["Microsoft hat die Liste 2011 erfunden.", false]
], ""),
M("itn2-25", "vo2-fall", "Warum ändert sich die Topologie laut Vortrag trotzdem?", [
  ["Weil man skalieren muss.", true],
  ["Weil man etwas nicht bedacht hat.", true],
  ["Weil man anfangs bewusst klein und günstig gebaut hat und später viele Benutzer kommen.", true],
  ["Weil Netzwerke homogen sind.", false],
  ["Sie ändert sich nie.", false]
], "„Die Topologie ändert sich nicht“ ist eine falsche Annahme."),
M("itn2-26", "vo2-risk", "Welche Aussagen zu Lock-in und Egress sind laut Vortrag richtig?", [
  ["Liegen 500 TB in Azure, kostet das Verschieben zu AWS viel Geld.", true],
  ["Der EU Data Act verlangt, dass Wechselentgelte bis 2027 abgeschafft werden.", true],
  ["Die Folie rät zu einer Exit-Strategie vom ersten Tag an.", true],
  ["Egress kostet bei allen Anbietern seit jeher nichts.", false],
  ["Data Gravity erleichtert den Umzug.", false, "Je mehr Daten an einem Ort, desto schwerer der Umzug."]
], ""),
M("itn2-27", "vo2-risk", "Welche Aussagen zum AWS-Ausfall am 20. Oktober 2025 stimmen?", [
  ["Betroffen war us-east-1 in Nordvirginia.", true],
  ["Ausgelöst wurde er durch ein Problem bei der DNS-Auflösung des DynamoDB-Endpunkts.", true],
  ["Unter anderem Signal und WhatsApp waren betroffen.", true],
  ["Er wurde durch ein Erdbeben ausgelöst.", false],
  ["Nur ein einziger Kunde war betroffen.", false, "Tausende Kunden gleichzeitig."]
], "Meist sind es simple Fehler wie DNS oder ein abgelaufenes Zertifikat."),
M("itn2-28", "vo2-risk", "Welche Risiken nennt die Folie zusätzlich?", [
  ["Compliance und Datenschutz: Wo liegen die Daten und wer kann zugreifen?", true],
  ["Skills: Cloud-Architektur, Security und Kostenmanagement brauchen neue Kompetenzen", true],
  ["Security: Fehlkonfiguration ist die häufigste Ursache für Sicherheitsvorfälle", true],
  ["Netzwerkabhängigkeit: Latenz, Bandbreite, Verfügbarkeit der Anbindung", true],
  ["Kostenkontrolle: variable Kosten brauchen Governance (FinOps)", true]
], "Alle fünf stehen auf der Folie."),
M("itn2-29", "vo2-law", "Welche Aussagen zum US CLOUD Act sind richtig?", [
  ["Er stammt aus 2018.", true],
  ["US-Anbieter sind grundsätzlich verpflichtet, Daten an US-Behörden herauszugeben – auch aus europäischen Rechenzentren.", true],
  ["Ein EU-Rechenzentrum eines US-Anbieters schützt davor vollständig.", false],
  ["Er gilt nur für chinesische Anbieter.", false],
  ["Er schafft Wechselentgelte ab.", false, "Das ist der EU Data Act."]
], "Darum: Residency ≠ Sovereignty."),
M("itn2-30", "vo2-law", "Welche Zuordnungen Regelung → Inhalt stimmen?", [
  ["DORA → ICT-Risikomanagement im Finanzsektor", true],
  ["EU Data Act → Wechsel zwischen Cloud-Anbietern erleichtern", true],
  ["NIS2 → Cybersecurity-Pflichten rund um kritische Infrastruktur", true],
  ["DSGVO → Wahl der Availability Zone", false],
  ["CLOUD Act → europäischer Datenschutz", false]
], ""),
M("itn2-31", "vo2-law", "Ein Unternehmen nutzt Microsofts EU Data Boundary. Welche Aussagen stimmen?", [
  ["Die Daten bleiben in der EU/EFTA – das betrifft die Datenresidenz.", true],
  ["Microsoft unterliegt weiterhin US-Recht.", true],
  ["Die Datensouveränität ist damit vollständig gesichert.", false],
  ["Der CLOUD Act gilt dann nicht mehr.", false],
  ["Die DSGVO muss dann nicht mehr eingehalten werden.", false]
], "Residency ≠ Sovereignty."),
M("itn2-32", "vo2-law", "Welche Aussagen zu Sovereign Clouds und europäischen Anbietern sind richtig?", [
  ["Microsoft Sovereign Cloud und AWS European Sovereign Cloud versuchen, den CLOUD Act auszuhebeln.", true],
  ["Ob das wirklich Souveränität bedeutet, ist laut Vortrag streitbar.", true],
  ["IONOS, STACKIT und OVHcloud sind europäische Anbieter.", true],
  ["STACKIT gehört zur Schwarz Gruppe, zu der auch Lidl gehört.", true],
  ["OVHcloud ist ein amerikanischer Anbieter.", false, "Frankreich."]
], ""),
M("itn2-33", "vo2-law", "Was sagte Anton Carniaux (Microsoft Frankreich) im Juni 2025?", [
  ["Er könne nicht garantieren, dass Daten französischer Bürger nicht ohne Zustimmung der Regierung an ausländische Behörden gehen.", true],
  ["Microsoft gebe niemals Daten an US-Behörden heraus.", false],
  ["Der CLOUD Act gelte in Frankreich nicht.", false],
  ["Daten in Frankreich seien automatisch souverän.", false],
  ["Er sagte es in einer Werbeanzeige, nicht unter Eid.", false, "Unter Eid vor dem französischen Senat."]
], ""),
M("itn2-34", "vo2-energy", "Welche Zahlen und Aussagen zur Energie nennt die Folie vom 8.10.?", [
  ["Rechenzentren verbrauchten 2024 rund 415 TWh, etwa 1,5 % des weltweiten Stroms.", true],
  ["Für 2030 werden rund 945 TWh erwartet, Haupttreiber ist KI.", true],
  ["Große Anbieter erreichen PUE-Werte nahe 1,1.", true],
  ["Die Anbieter sichern sich sogar Atomstrom.", true],
  ["Der Verbrauch soll bis 2030 halbiert werden.", false]
], ""),
M("itn2-35", "vo2-energy", "Welche Hebel haben Sie als Cloud-Kunde laut Folie?", [
  ["Right-Sizing", true],
  ["Automatisches Abschalten", true],
  ["Regionen mit CO₂-armem Strom wählen", true],
  ["Den PUE des Rechenzentrums selbst festlegen", false],
  ["Die Kühlung im Rechenzentrum austauschen", false]
], "Dazu: Emissionen messen (z. B. Emissions Impact Dashboard).")
];
(X.itinf = X.itinf || []).push({ id: "itinf-mc-vo2", questions });
})();
