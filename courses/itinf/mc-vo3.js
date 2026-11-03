/* ITINF-GL · Quick-Test-Fragen V3 (Vorlesung 13.10.2026) – Mehrfachauswahl, 5 Antworten, 1 bis 5 richtig.
   Nur Inhalte aus dem gesprochenen Skript (Folien-Details werden nicht abgefragt).
   Helfer M kommt aus mc-v1.js (window.ITINF_M). */
(function () {
const M = window.ITINF_M, X = window.STUDYOS_EXT = window.STUDYOS_EXT || {}; if (!M) return;
const questions = [
M("itn3-1", "vo3-review", "Welche Beispiele für Atomstrom für Rechenzentren wurden genannt?", [
  ["Microsoft lässt einen Reaktor in Three Mile Island reaktivieren.", true],
  ["Google bezieht Strom aus dem reaktivierten Duane Arnold Energy Center.", true],
  ["Google will bis 2030 Energie aus kleinen Reaktoren (Kairos Power) einkaufen.", true],
  ["Meta sicherte sich die Produktion eines Kernkraftwerks in Illinois für 20 Jahre.", true],
  ["Die Kurzfassung des Vortragenden: „Wir brauchen Strom.“", true]
], "Kurz gesagt: Wir brauchen Strom."),
M("itn3-2", "vo3-review", "Wofür ist der Kunde laut Wiederholungsfrage 3 immer verantwortlich?", [
  ["Für die Daten", true],
  ["Für die Geräte (Devices)", true],
  ["Für Accounts und Identitäten", true],
  ["Für die physischen Hosts im Rechenzentrum", false],
  ["Für das physische Netzwerk des Anbieters", false]
], "Unabhängig vom Service-Modell."),
M("itn3-3", "vo3-review", "Ein Workload hat eine Spitze von 10 Servern und einen Durchschnitt von 2. Welche Aussagen stimmen?", [
  ["p/a = 5", true],
  ["Die Cloud darf pro Einheit bis zu fünfmal so teuer sein wie der Eigenbetrieb.", true],
  ["p/a = 0,2", false],
  ["Die Cloud lohnt sich nur, wenn sie billiger ist als der Eigenbetrieb pro Einheit.", false],
  ["Die Cloud darf höchstens doppelt so teuer sein.", false]
], "Wiederholungsfrage 4."),
M("itn3-4", "vo3-review", "Zwei Services mit 99,9 % und 99,95 % werden beide benötigt. Welche Aussagen stimmen?", [
  ["Die Werte werden multipliziert.", true],
  ["Das Ergebnis ist etwas kleiner als der schwächere Einzelwert, ≈ 99,85 %.", true],
  ["Das entspricht rund 13,1 Stunden Ausfall pro Jahr.", true],
  ["Das Ergebnis ist der Durchschnitt, ≈ 99,925 %.", false],
  ["Das Ergebnis ist größer als 99,95 %.", false]
], "Wiederholungsfrage 5."),
M("itn3-5", "vo3-review", "Warum ist die Cloud laut Vortrag keine Rückkehr zur Mainframe-Ära?", [
  ["Sie ist virtualisiert.", true],
  ["Sie ist immer erreichbar.", true],
  ["Man braucht keinen Admin, um Ressourcen anzufordern (Self-Service).", true],
  ["Sie verbindet die Skaleneffekte des Mainframes mit der Modularität und Agilität von Client/Server.", true],
  ["Bei der Cloud teilt sich niemand etwas mit anderen.", false, "Die Grundidee – zentral geteilt – ist ähnlich."]
], "Wiederholungsfrage 6."),
M("itn3-6", "vo3-review", "Welche Zuordnungen am Webshop-Beispiel (Wiederholungsfrage 2) stimmen?", [
  ["Eigene VM mit SQL Server → IaaS", true],
  ["App Service → PaaS", true],
  ["Azure Functions verkleinern Produktbilder → Serverless/FaaS", true],
  ["Teams oder Salesforce → SaaS", true],
  ["App Service → SaaS", false]
], ""),
M("itn3-7", "vo3-dc", "Welche Aussagen zum Microsoft Global Network sind laut Vortrag richtig?", [
  ["Es ist das hauseigene Netzwerk von Microsoft und nicht das Internet.", true],
  ["Es ist eindeutig kritische Infrastruktur.", true],
  ["Es ist ein Low-Latency-Netzwerk rund um die Welt.", true],
  ["Darauf laufen u. a. Azure, Microsoft 365, Xbox und Bing.", true],
  ["AWS, Google und Meta nutzen dasselbe Netz mit.", false, "Sie haben eigene, teils größere Netze."]
], "Laut Folie 300.000+ Meilen, 400+ Rechenzentren."),
M("itn3-8", "vo3-dc", "Was gilt laut Vortrag für Rechenzentrums-Generationen?", [
  ["Es geht darum, wo man Kühlung und Notstromversorgung unterbringt.", true],
  ["Ziel ist, effizienter zu werden und weniger Energie zu verbrauchen.", true],
  ["Laut Vortrag ist der Umweltgedanke im Endeffekt wichtiger als der wirtschaftliche Faktor.", false, "Umgekehrt: eher Strom und Kosten."],
  ["Alle Hersteller bauen nach demselben Standard.", false, "Jeder kocht sein eigenes Süppchen."],
  ["Man baut nie in die Höhe.", false]
], ""),
M("itn3-9", "vo3-dc", "Welche Zuordnungen Stadt → Azure-Region stimmen?", [
  ["Amsterdam → West Europe", true],
  ["Dublin → North Europe", true],
  ["Amsterdam → North Europe", false],
  ["Dublin → Austria East", false],
  ["Quincy → West Europe", false, "Quincy liegt in Washington, USA."]
], "West Europe und North Europe sind vermutlich die zwei größten Azure-Standorte in Europa."),
M("itn3-10", "vo3-region", "Welche Aussagen zu Azure-Regionen sind richtig?", [
  ["Beim Anfordern einer Ressource muss man die Region angeben.", true],
  ["Eine Region besteht aus einem, meist aber mehreren Rechenzentren in räumlicher Nähe.", true],
  ["Innerhalb einer Region soll die Latenz extrem gering sein.", true],
  ["Man wählt die Region auch danach, wo die eigenen Kunden sind.", true],
  ["Regionen heißen „Datencenter Irland“ oder „Datencenter Niederlande“.", false]
], ""),
M("itn3-11", "vo3-region", "Welche Kriterien spielen laut Vortrag bei der Wahl einer Region eine Rolle?", [
  ["DSGVO-Konformität bzw. Compliance-Vorgaben", true],
  ["Nähe zu den Kunden", true],
  ["Die Farbe des Gebäudes", false],
  ["Der Name des Rechenzentrumsleiters", false],
  ["Ob die Region mit „West“ beginnt", false]
], "Europa hat teilweise andere Compliance-Vorgaben als Amerika."),
M("itn3-12", "vo3-region", "Welche Aussagen zu speziellen Regionen sind richtig?", [
  ["US-Government-Regionen sind physisch und logisch isoliert.", true],
  ["Sie werden von überprüftem US-Personal betrieben.", true],
  ["In China betreibt Microsoft die Rechenzentren nicht selbst, sondern über 21Vianet.", true],
  ["Jeder Kunde kann die US-Gov-Regionen frei nutzen.", false],
  ["China-Regionen werden von AWS betrieben.", false]
], "Betreffen uns nicht wirklich."),
M("itn3-13", "vo3-region", "Was wurde zur Tafelskizze einer Region gesagt?", [
  ["Drei Rechenzentren, untereinander mit unter 2 ms verbunden.", true],
  ["Jedes hat eigene Stromversorgung, eigene Kühlung und eigenes Netzwerk.", true],
  ["Fällt eines aus, fallen automatisch auch die anderen beiden aus.", false],
  ["Alle drei teilen sich eine Stromleitung.", false],
  ["Die Latenz zwischen ihnen beträgt rund zwei Sekunden.", false]
], "Faktencheck: Die drei Blöcke entsprechen eher den drei Zonen."),
M("itn3-14", "vo3-pair", "Welche Aussagen zu Region Pairs sind laut Vortrag richtig?", [
  ["Welche Regionen ein Paar bilden, legt Microsoft fest.", true],
  ["Die Daten in der Partnerregion muss man meist selbst einrichten und dafür bezahlen.", true],
  ["Ob man die Partnerregion nutzt, ist eine Designentscheidung.", true],
  ["Geplante Updates werden jeweils nur in einer Region des Paares ausgerollt.", true],
  ["Alle Daten werden automatisch und kostenlos in die Partnerregion repliziert.", false]
], "Automatische Replikation nur für einige Services."),
M("itn3-15", "vo3-pair", "Welche Eigenschaften von Region Pairs nennt die Folie?", [
  ["Räumliche Trennung von mindestens 300 Meilen", true],
  ["Automatische Replikation für einige Services", true],
  ["Priorisierte Wiederherstellung einer Region bei einem großflächigen Ausfall", true],
  ["Sequenzielle Updates", true],
  ["Die Trennung soll verhindern, dass ein regionales Erdbeben, ein Stromausfall oder eine Überschwemmung beide Regionen trifft", true]
], ""),
M("itn3-16", "vo3-pair", "Warum liegen die Regionen eines Paares in derselben Geografie?", [
  ["Weil beide denselben Kriterien wie der DSGVO unterliegen müssen.", true],
  ["Aus steuer- und strafrechtlichen Gründen.", true],
  ["Damit Daten nicht ungewollt z. B. nach Amerika repliziert werden.", true],
  ["Weil Glasfaser keine Ozeane überqueren kann.", false],
  ["Damit Updates in beiden Regionen gleichzeitig kommen.", false]
], "Ausnahme: Brazil South ↔ South Central US."),
M("itn3-17", "vo3-pair", "Welche Region ist die im Vortrag genannte Ausnahme mit einem Partner außerhalb der eigenen Geografie?", [
  ["Brazil South", true],
  ["North Europe", false],
  ["West Europe", false],
  ["Austria East", false],
  ["Japan East", false]
], "Brasilien hatte nur eine Region, gepaart mit South Central US."),
M("itn3-18", "vo3-pair", "Welche Aussagen zu Geografien sind richtig?", [
  ["Eine Geografie enthält typischerweise zwei oder mehr Regionen.", true],
  ["Sie hilft Kunden mit Anforderungen an Datenresidenz und Compliance.", true],
  ["Eingeteilt wird nur in Europa und Amerika.", false, "Americas, Europe, Asia Pacific, Middle East und Africa."],
  ["Eine Geografie ist dasselbe wie eine Availability Zone.", false],
  ["Eine Geografie besteht aus genau einem Rechenzentrum.", false]
], ""),
M("itn3-19", "vo3-az", "Welche Aussagen zu Availability Zones sind richtig?", [
  ["Jede Zone ist unabhängig in Strom, Kühlung und Netzwerk.", true],
  ["Die Zonen sind mit unter 2 ms Round-Trip-Latenz verbunden.", true],
  ["In AZ-fähigen Regionen gibt es mindestens drei Zonen.", true],
  ["Nicht alle Regionen unterstützen Availability Zones.", true],
  ["Man kann beim Deployen eine beliebige Zone wie „Zone 35“ wählen.", false, "Nur Zone 1, 2 oder 3."]
], "Zonen sind ein logisches Konstrukt."),
M("itn3-20", "vo3-az", "Worauf bezieht sich die Unabhängigkeit der Availability Zones laut Antwort auf die Publikumsfrage?", [
  ["Stromversorgung", true],
  ["Kühlung", true],
  ["Netzwerk", true],
  ["Datenreplikation auf Applikationsebene", false, "Die liegt bei Ihnen."],
  ["RAID zwischen den Zonen", false]
], "Nur Strom, Kühlung, Netzwerk."),
M("itn3-21", "vo3-az", "Ein Team will mit drei VMs ausfallsicher sein. Welche Aussagen stimmen laut Vortrag?", [
  ["Liegen alle drei in derselben Zone, hat das Team alles falsch gemacht.", true],
  ["Die VMs sollten auf verschiedene Zonen verteilt werden.", true],
  ["Ein Load Balancer davor verteilt die Last; stirbt eine VM, sind die anderen erreichbar.", true],
  ["Die Daten zwischen den VMs muss das Team selbst replizieren.", true],
  ["Azure verteilt die VMs automatisch auf drei Zonen.", false, "VMs sind zonale Dienste."]
], ""),
M("itn3-22", "vo3-az", "Welche Aussagen zu zonalen und zonenredundanten Services sind richtig?", [
  ["Zonale Services sind an eine bestimmte Zone gepinnt.", true],
  ["Bei zonalen Services verwaltet der Benutzer Replikation und Failover selbst.", true],
  ["Zonenredundante Services verteilt Azure automatisch über mehrere Zonen.", true],
  ["Virtual Machines sind das Folienbeispiel für zonal, Public IPs für zonenredundant.", true],
  ["Zonenredundante Services liegen immer in zwei Regionen.", false]
], ""),
M("itn3-23", "vo3-az", "Welche SLA-Zuordnungen nennt die Folie „Availability Options“?", [
  ["Single VM (Premium Storage) → 99,9 %", true],
  ["Availability Zones → 99,99 %", true],
  ["Region Pairs → Schutz vor dem Ausfall einer ganzen Region", true],
  ["Single VM → 99,99 %", false],
  ["Availability Zones → 95 %", false]
], "Je mehr man verteilt, desto höher die Ausfallsicherheit."),
M("itn3-24", "vo3-az", "Wo liegen die drei markierten Bereiche der Region Austria East laut Folie ungefähr?", [
  ["Bei Klosterneuburg", true],
  ["Bei Mödling", true],
  ["Bei Schwechat", true],
  ["In Graz", false],
  ["In Linz", false]
], "Rund um Wien."),
M("itn3-25", "vo3-pue", "Welche Aussagen zur PUE sind richtig?", [
  ["PUE = Gesamtenergie der Anlage ÷ Energie der IT-Geräte", true],
  ["Ein PUE von 1,0 wäre ideal.", true],
  ["Microsoft kommt laut Folie global auf 1,18.", true],
  ["Asia Pacific liegt mit 1,405 relativ hoch, weil viel Energie fürs Kühlen nötig ist.", true],
  ["Je höher der PUE, desto effizienter das Rechenzentrum.", false]
], ""),
M("itn3-26", "vo3-pue", "Welche Aussagen zur WUE sind richtig?", [
  ["WUE = Liter Wasser für Befeuchtung und Kühlung ÷ kWh der IT-Geräte", true],
  ["Microsoft kommt laut Folie global auf 0,49 L/kWh.", true],
  ["Rechenzentren in Schweden und Finnland brauchen weniger Wasser zum Kühlen.", true],
  ["Asia Pacific hat die niedrigste WUE.", false, "Mit 1,65 L/kWh die höchste."],
  ["Die WUE misst den Stromverbrauch der Server.", false]
], ""),
M("itn3-27", "vo3-pue", "Welche Rechenschritte aus dem Vergleich Stadt vs. Rechenzentrum stimmen?", [
  ["150.000 Haushalte × 3.500 kWh = 525 GWh", true],
  ["90.000 Server × 500 W × 8.760 h = 394,2 GWh", true],
  ["394,2 GWh × PUE 1,5 = 591,3 GWh", true],
  ["Der Vergleich zeigt eine ähnliche Größenordnung, hinkt aber.", true],
  ["Die Stadtzahl enthält Heizung, Industrie und Verkehr.", false, "Genau die sind nicht eingerechnet."]
], ""),
M("itn3-28", "vo3-pue", "Welche Aussagen zur Wasser-Rechnung sind richtig?", [
  ["394 GWh sind 394.000.000 kWh.", true],
  ["Mit WUE 0,5 L/kWh ergibt das rund 197 Millionen Liter pro Jahr.", true],
  ["Eine Person in Österreich verbraucht rund 130 Liter Wasser pro Tag.", true],
  ["1,5 Millionen Österreicher verbrauchen an einem Tag so viel wie das Rechenzentrum im ganzen Jahr.", true],
  ["Das Rechenzentrum verbraucht pro Jahr so viel wie ganz Österreich in einem Jahr.", false]
], ""),
M("itn3-29", "vo3-pue", "Welche Aussage über geplante 2-GW-Rechenzentren machte der Vortragende?", [
  ["Rechenzentren mit 2–3 GW brauchen so viel wie oder mehr als ganz Berlin.", true],
  ["Sie brauchen weniger als ein Einfamilienhaus.", false],
  ["Sie sind kleiner als das 90.000-Server-Beispiel.", false],
  ["Sie kommen ohne Kühlung aus.", false],
  ["Sie verbrauchen nur Strom aus Wasserstoff.", false]
], "2 GW × 8.760 h ergibt einige Terawattstunden pro Jahr."),
M("itn3-30", "vo3-green", "Welche Aussagen zu Project Natick sind richtig?", [
  ["Ein Container mit 864 Servern wurde 2018 vor den Orkney-Inseln im Meer versenkt.", true],
  ["Er wurde 2020 nach rund zwei Jahren geborgen.", true],
  ["Die Ausfallrate lag bei etwa einem Achtel jener an Land.", true],
  ["Es hat sich nicht durchgesetzt; Microsoft hat das Projekt beendet.", true],
  ["Getestet wurde, wie gut kaltes Meerwasser kühlt.", true]
], "Alle fünf stimmen."),
M("itn3-31", "vo3-green", "Warum baut man Rechenzentren laut Vortrag nicht nur im kühlen Norden?", [
  ["Man wäre nicht nah am Kunden (Latenz).", true],
  ["Das Netzwerk müsste entsprechend ausgebaut werden.", true],
  ["Man muss regionale Compliance-Vorgaben erfüllen.", true],
  ["Die Logistik wäre schwierig.", true],
  ["Rechenzentren im Norden sind weniger effizient.", false, "Sie sind effizienter – das ist unbestritten."]
], ""),
M("itn3-32", "vo3-green", "Welche Aussagen zu Net Zero, Carbon Negative und Carbon Neutral sind richtig?", [
  ["Net Zero heißt, so viel CO₂ aus der Atmosphäre zu holen, wie man emittiert.", true],
  ["Carbon negative heißt, mehr zu entnehmen, als man emittiert.", true],
  ["Carbon neutral heißt oft, sich über zugekaufte Zertifikate neutral zu rechnen.", true],
  ["Net Zero heißt, gar kein CO₂ mehr auszustoßen.", false, "Es gibt weiter Emissionen, sie werden durch Entnahme ausgeglichen."],
  ["Zahlen für das Nicht-Roden eines Waldes ist Net Zero.", false, "Das vermeidet nur, pflanzt keine Bäume."]
], ""),
M("itn3-33", "vo3-green", "Welche Aussagen zu Microsofts Klimazielen stimmen laut Vortrag?", [
  ["Microsoft will bis 2030 carbon negative sein.", true],
  ["Bis 2050 will Microsoft allen seit 1975 emittierten Kohlenstoff entfernen.", true],
  ["Microsoft investiert 1 Mrd. $ in einen Climate Innovation Fund.", true],
  ["Der Vortragende bezweifelt, dass Microsoft das schafft – auch wegen KI.", true],
  ["Microsoft hat seine Ziele für 2030 bereits 2024 erreicht.", false]
], ""),
M("itn3-34", "vo3-rg", "Welche Aussagen zur Hierarchie in Azure sind richtig?", [
  ["Ressourcen liegen in Resource Groups.", true],
  ["Resource Groups liegen in Subscriptions.", true],
  ["Management Groups gruppieren mehrere Subscriptions.", true],
  ["Ohne Resource Group kann man keine Ressource anlegen.", true],
  ["Subscriptions liegen in Resource Groups.", false]
], "Management Groups → Subscriptions → Resource Groups → Ressourcen."),
M("itn3-35", "vo3-rg", "Welche Grundregeln für Resource Groups wurden genannt?", [
  ["Eine Ressource existiert in genau einer Resource Group.", true],
  ["Ressourcen können in eine andere Resource Group verschoben werden.", true],
  ["Ressourcen einer Resource Group können in verschiedenen Regionen liegen.", true],
  ["Alle Ressourcen müssen in der Location der Resource Group liegen.", false],
  ["Eine Ressource kann in mehreren Resource Groups gleichzeitig sein.", false]
], ""),
M("itn3-36", "vo3-rg", "Was passiert, wenn man eine Resource Group mit einer wichtigen Datenbank löscht?", [
  ["Alles in der Resource Group wird gelöscht, auch die Datenbank – unwiederbringlich.", true],
  ["Die Datenbank landet im Papierkorb.", false, "Es gibt keinen Papierkorb."],
  ["Nur die Gruppe wird gelöscht, die Datenbank bleibt bestehen.", false],
  ["Azure verschiebt die Datenbank automatisch in eine andere Resource Group.", false],
  ["Die Datenbank wird in die Partnerregion verschoben.", false]
], "„Damit muss man leben.“"),
M("itn3-37", "vo3-rg", "Welche Aussagen zur Aufteilung von Resource Groups sind laut Vortrag richtig?", [
  ["Es gibt keine festen Regeln für die Aufteilung.", true],
  ["Alles in eine Resource Group passt für kleine Apps sowie Dev- und Testumgebungen.", true],
  ["Nach Rolle aufzuteilen ist in größeren Umgebungen üblicher.", true],
  ["Die Aufteilung nach Rolle passt zu Berechtigungen per RBAC, etwa nur Netzwerktechniker auf die Netzwerk-RG.", true],
  ["Resource Groups fassen Ressourcen mit demselben Lebenszyklus zusammen.", true]
], "Alle fünf stimmen."),
M("itn3-38", "vo3-rg", "Welche Aussagen zu den Resource Groups in den Übungen stimmen?", [
  ["Jede bzw. jeder bekommt eine eigene Resource Group mit dem eigenen Namen.", true],
  ["Nur die jeweilige Person hat Rechte darauf.", true],
  ["Man sieht, welche Resource Group wie viel verbraucht hat.", true],
  ["Man soll möglichst viele andere in die eigene Resource Group einladen.", false, "Bitte nicht."],
  ["Jede Person bekommt eine eigene Subscription, die sie selbst bezahlt.", false, "Die FH hat eine Subscription, die sie bezahlt."]
], "")
];
(X.itinf = X.itinf || []).push({ id: "itinf-mc-vo3", questions });
})();
