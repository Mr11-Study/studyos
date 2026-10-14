/* ITINF-GL · Quick-Test-Fragen V2 (Azure-Rechenzentren & Architektur) – Mehrfachauswahl, 5 Antworten, 1 bis 5 richtig.
   Helfer M kommt aus mc-v1.js (window.ITINF_M). */
(function () {
const M = window.ITINF_M, X = window.STUDYOS_EXT = window.STUDYOS_EXT || {}; if (!M) return;
const questions = [
/* ---------- Globales Netz, Regionen, Region Pairs ---------- */
M("itm2-1", "itv-region", "Welche Angaben zum Microsoft Global Network stehen auf der Folie?", [
  ["Mehr als 300.000 Meilen Datenleitungen (Glasfaser und Seekabel)", true],
  ["40 Rechenzentren", false, "400+."],
  ["IP-Verkehr zwischen Microsoft-Rechenzentren bleibt im Microsoft-Netz und betritt nie das öffentliche Internet.", true],
  ["Es verarbeitet Anfragen an Azure, Bing, Microsoft 365, Xbox und weitere Dienste.", true],
  ["Es wird von Telekom-Providern gemietet und über das öffentliche Internet geroutet.", false]
], "Eines der größten privaten Glasfasernetze der Welt, low latency rund um den Globus."),
M("itm2-2", "itv-region", "Welche Aussagen zu Azure-Regionen sind richtig?", [
  ["Eine Region besteht aus einem oder mehreren Rechenzentren in enger Nähe zueinander.", true],
  ["Azure hat laut Folie weniger Regionen als jeder andere große Anbieter.", false, "Laut Folie mehr als jeder andere: 60+."],
  ["Man wählt eine Region nahe bei den Kunden, um die Latenz zu senken.", true],
  ["Die Region wählt Azure immer selbst, man kann sie nicht angeben.", false, "Man gibt sie fast immer selbst an."],
  ["Eine Region besteht immer aus genau einem Rechenzentrum.", false]
], "Regionen bringen Flexibilität, Skalierung und helfen bei Compliance (Daten bleiben, wo man sie haben will)."),
M("itm2-3", "itv-region", "Welche Vorteile von Region Pairs nennt die Folie?", [
  ["Mindestens 300 Meilen (≈ 480 km) Abstand zwischen den beiden Regionen", true],
  ["Automatische Replikation für einige Dienste", true],
  ["Priorisierte Wiederherstellung einer Region des Paares bei einem großen Ausfall", true],
  ["Geplante Updates werden nacheinander ausgerollt, nie in beiden Regionen gleichzeitig.", true],
  ["Die Daten bleiben in derselben Geography (Ausnahme: Brazil South).", true]
], "Merkhilfe: Platz, Priorität, Patches nacheinander – und Daten bleiben in der Geography."),
M("itm2-4", "itv-region", "Welche Aussagen zu Region Pairs stimmen laut Vorlesung NICHT?", [
  ["Man wählt die Partnerregion beim Anlegen selbst aus.", true, "Die Partnerregion legt Microsoft fest."],
  ["Das Paar macht die eigenen Daten automatisch und kostenlos ausfallsicher.", true, "Die Kopie in der Partnerregion muss man selbst einrichten und bezahlen."],
  ["Ein Region Pair besteht aus zwei Availability Zones.", true, "Zonen liegen innerhalb einer Region; ein Paar sind zwei Regionen."],
  ["Updates werden in beiden Regionen sequenziell ausgerollt.", false, "Das stimmt."],
  ["Paare liegen in derselben Geography, damit z. B. europäische Daten nicht in die USA repliziert werden.", false, "Das stimmt."]
], "Gefragt sind die falschen Aussagen. Das Paar ist eine Designentscheidung: Wie teuer wäre ein Ausfall?"),
M("itm2-5", "itv-region", "Welche Region Pairs stehen als Beispiel auf der Folie?", [
  ["North Europe ↔ West Europe", true],
  ["East US ↔ West US", true],
  ["Japan East ↔ Japan West", true],
  ["Brazil South ↔ South Central US", true],
  ["West Europe ↔ East US", false, "Paare bleiben in derselben Geography."]
], "Brazil South ist mit South Central US gepaart; darum die Ausnahme bei der Data Residency."),
M("itm2-6", "itv-region", "Welche Aussagen zu den speziellen Azure-Regionen sind richtig?", [
  ["US DoD Central und US Gov Virginia sind physisch und logisch netzwerkisolierte Instanzen für US-Behörden.", true],
  ["Die US-Gov-Regionen werden über den Partner 21Vianet betrieben.", false, "21Vianet betreibt die China-Regionen."],
  ["Die China-Regionen sind über eine Partnerschaft mit 21Vianet verfügbar.", true],
  ["Microsoft betreibt die Rechenzentren in China direkt.", false],
  ["Jeder Azure-Kunde kann US Gov Virginia frei für seine Firmendaten nutzen.", false, "Nur für US-Behörden und deren Partner."]
], "Spezialregionen gibt es aus Compliance- und rechtlichen Gründen."),
M("itm2-7", "itv-region", "Welche Aussagen zu Geographies sind richtig?", [
  ["Eine Geography enthält typischerweise zwei oder mehr Regionen.", true],
  ["Sie erlaubt, Daten und Anwendungen für Data Residency und Compliance im selben Rechtsraum zu halten.", true],
  ["Azure teilt in Americas, Europe, Asia Pacific sowie Middle East and Africa ein.", true],
  ["Eine Geography ist ein einzelnes Gebäude mit mehreren Zonen.", false],
  ["Eine Geography ist kleiner als eine Region.", false, "Eine Geography enthält Regionen."]
], "Physische Hierarchie: Rechenzentrum → (Zone) → Region → Region Pair → Geography."),
M("itm2-8", "itv-region", "Eine Grazer Bäckerei verkauft online in Österreich und Deutschland. Welche Überlegungen zur Region sind sinnvoll?", [
  ["Eine Region nahe bei den Kunden wählen, z. B. Austria East (Latenz)", true],
  ["Personenbezogene Daten in der Geography Europe halten (Compliance)", true],
  ["Prüfen, ob die benötigten Dienste und VM-Größen in der Region verfügbar sind", true],
  ["Preise vergleichen, weil dieselbe VM je Region unterschiedlich viel kostet", true],
  ["„East US“ wählen, weil das die größte Region ist und deshalb immer am schnellsten", false]
], "Latenz, Compliance, Dienstverfügbarkeit und Preis; dazu Zonen und eine zweite Region für den Notfall."),
M("itm2-9", "itv-region", "Wie heißen laut Vorlesung die zwei vermutlich größten Azure-Standorte in Europa?", [
  ["West Europe (Amsterdam)", true],
  ["North Europe (Dublin)", true],
  ["Austria East (Graz)", false, "Austria East liegt rund um Wien."],
  ["Germany Central (Wien)", false],
  ["Die Regionen heißen immer nach Städten, z. B. „Region Frankfurt“.", false, "Sie heißen z. B. West Europe, nicht nach Städten."]
], "Regionen tragen geografische Namen wie West Europe und North Europe."),

/* ---------- Availability Zones ---------- */
M("itm2-10", "itv-az", "Welche Aussagen zu Availability Zones sind richtig?", [
  ["Sie sind physisch getrennte Rechenzentren innerhalb einer Azure-Region.", true],
  ["Jede Zone hat eigene, unabhängige Strom-, Kühlungs- und Netzwerkinfrastruktur.", true],
  ["Die Zonen sind über das öffentliche Internet mit ca. 50 ms verbunden.", false, "Private Glasfaser, < 2 ms."],
  ["In jeder zonenfähigen Region gibt es genau eine Zone.", false, "Mindestens drei."],
  ["Jede Azure-Region hat drei Availability Zones.", false, "Nicht jede Region ist zonenfähig."]
], "Zweck: Resilienz innerhalb einer Region gegen Probleme auf Rechenzentrumsebene."),
M("itm2-11", "itv-az", "Welche Aussagen zu zonalen und zonenredundanten Diensten sind richtig?", [
  ["Zonale Dienste werden an eine bestimmte Zone gebunden (pinned).", true],
  ["Bei zonalen Diensten übernimmt Azure Replikation und Failover automatisch.", false, "Das wäre zonenredundant."],
  ["Virtual Machines sind ein Beispiel für zonale Dienste.", true],
  ["Zonenredundante Dienste replizieren automatisch und verteilen Anfragen über mehrere Zonen.", true],
  ["Public IPs sind ein Beispiel für zonale Dienste.", false, "Laut Folie Beispiel für zonenredundant."]
], "Merkhilfe: Zonal = „Zuständig bin ich“ (VM). Zonenredundant = „Redundanz macht Azure“ (Public IP)."),
M("itm2-12", "itv-az", "Eine VM wird in Zone 1 erstellt. Was gilt?", [
  ["Die VM ist ein zonenredundanter Dienst.", false, "VMs sind zonal."],
  ["Replikation und Failover in andere Zonen muss der Kunde selbst einrichten.", true],
  ["Azure verschiebt die VM bei einem Ausfall automatisch in Zone 2.", false],
  ["Fällt Zone 1 aus, ist die VM betroffen.", true],
  ["Man kann beim Anlegen ein konkretes Gebäude wie „Schwechat“ wählen.", false, "Man wählt nur „egal“ oder Zone 1, 2, 3."]
], "Zonen sind ein logisches Konstrukt; die Unabhängigkeit betrifft Strom, Kühlung, Netz, nicht die Daten."),
M("itm2-13", "itv-az", "Welche Verfügbarkeitsoptionen und SLAs für VMs sind richtig zugeordnet?", [
  ["Single VM (mit Premium Storage): 99,9 %", true],
  ["Availability Set: 99,999 %", false, "99,95 %."],
  ["VMs über Availability Zones: 99,99 %", true],
  ["Region Pairs: Schutz gegen den Ausfall einer ganzen Region", true],
  ["Availability Zones: Schutz gegen den Ausfall einer ganzen Region", false, "Zonen schützen vor dem Ausfall eines Rechenzentrums innerhalb einer Region."]
], "Jede Stufe schützt gegen einen größeren Ausfall: Server → Rack → Rechenzentrum → Region."),
M("itm2-14", "itv-az", "Du startest drei VMs für einen ausfallsicheren Dienst. Welche Aussagen sind richtig?", [
  ["Liegen alle drei in derselben Zone, sind bei einem Zonenausfall alle drei weg.", true],
  ["Besser ist je eine VM in Zone 1, 2 und 3.", true],
  ["Für 99,99 % braucht man laut SLA mindestens zwei VMs in mindestens zwei Zonen.", true],
  ["Drei VMs in drei Zonen kosten gleich viel wie eine einzelne VM.", false, "Etwa dreimal so viel."],
  ["Drei VMs in derselben Zone erreichen automatisch 99,99 %.", false]
], "Hochverfügbarkeit kostet: Was kostet eine Stunde Ausfall?"),
M("itm2-15", "itv-az", "Welche Aussagen zu Hochverfügbarkeit, Disaster Recovery und Backup sind richtig?", [
  ["Availability Zones sind keine Datensicherung.", true],
  ["Ein zonenredundanter Dienst repliziert auch versehentliches Löschen oder Ransomware.", true],
  ["Disaster Recovery bedeutet, eine einzelne gelöschte Datei wiederherzustellen.", false, "Das ist Backup."],
  ["Backup bedeutet, zu einem früheren Zeitpunkt zurückkehren zu können.", true],
  ["Mit drei Zonen braucht man kein Backup mehr.", false]
], "HA (Zonen) ≠ DR (zweite Region) ≠ Backup (früherer Stand)."),
M("itm2-16", "itv-az", "Welche Ebene ist laut Vortragendem die wichtigste, die man gut kennen muss?", [
  ["Die Availability Zones", true],
  ["Einzelne Rechenzentrumsgebäude", false],
  ["Die Geographies", false],
  ["Die Seekabel des Global Network", false],
  ["Die Regionen der US-Regierung", false]
], "Regionen und einzelne Rechenzentren muss man weniger im Detail kennen."),
M("itm2-17", "itv-az", "Welche Aussagen zu Austria East und Zonen sind laut Vorlesung richtig?", [
  ["Austria East hat drei Bereiche rund um Wien.", true],
  ["Eine Zone kann aus einem oder mehreren Rechenzentren bestehen.", true],
  ["Daten auf Anwendungsebene duplizieren (z. B. zwei Server hinter einem Load Balancer) muss man selbst.", true],
  ["Austria East liegt in Graz und Linz.", false],
  ["Zonen garantieren automatisch, dass Datenbanken repliziert werden.", false]
], "Die Unabhängigkeit der Zonen betrifft Strom, Kühlung und Netzwerk."),

/* ---------- Energie & Nachhaltigkeit ---------- */
M("itm2-20", "itv-green", "Welche Aussagen zu PUE sind richtig?", [
  ["PUE = Gesamtenergie des Rechenzentrums ÷ Energie der IT-Geräte", true],
  ["Je höher der Wert, desto effizienter", false, "Je näher an 1,0."],
  ["Zur IT-Energie zählen Server, Storage und Netzwerk.", true],
  ["Kühlung zählt zur IT-Energie.", false, "Kühlung ist Facility-Energie."],
  ["Ein PUE-Wert unter 1 ist der beste mögliche Wert.", false, "Unter 1 heißt: Zähler und Nenner vertauscht."]
], "Branchendurchschnitt laut V2-Folie 1,5; Hyperscaler nahe 1,1."),
M("itm2-21", "itv-green", "Ein Rechenzentrum verbraucht insgesamt 15 GWh, die IT-Geräte 12 GWh. Welche Aussagen sind richtig?", [
  ["PUE = 1,25", true],
  ["3 GWh entfallen auf Kühlung, Beleuchtung usw.", true],
  ["PUE = 0,8", false, "Das wäre IT ÷ Gesamt."],
  ["Der Wert ist besser als der Branchendurchschnitt von 1,5.", true],
  ["Der Wert sagt nichts über die CO₂-Intensität des Stroms aus.", true]
], "PUE = 15 ÷ 12 = 1,25."),
M("itm2-22", "itv-green", "Welche Aussagen zu WUE sind richtig?", [
  ["WUE = Liter Wasser pro kWh IT-Energie", true],
  ["Standorte in kühleren Regionen wie Schweden und Finnland brauchen weniger Wasser.", true],
  ["Heiße Standorte (z. B. Asien-Pazifik) brauchen wassergekühlte Kältemaschinen und mehr Wasser.", true],
  ["Rechenzentren in Schweden brauchen mehr Wasser als solche in heißen Regionen.", false, "Kühle Standorte brauchen weniger."],
  ["Freikühlung mit Außenluft ist in kalten Klimazonen eine Alternative.", true]
], "Klassischer Zielkonflikt zwischen Strom und Wasser."),
M("itm2-23", "itv-green", "Rechenbeispiel der Folie: 90.000 Server à 500 W, ganzjährig unter Volllast. Welche Aussagen sind richtig?", [
  ["Energie ohne PUE: 394,2 GWh pro Jahr", true],
  ["Mit PUE 1,5: 591,3 GWh pro Jahr", true],
  ["Die Leistung beträgt 394,2 GW.", false, "45 MW Leistung; 394,2 GWh ist Energie pro Jahr."],
  ["Eine Stadt mit 300.000 Einwohnern braucht laut Folie rund 5.250 GWh Haushaltsstrom.", false, "150.000 Haushalte × 3.500 kWh = 525 GWh."],
  ["Energie ohne PUE: 39,42 GWh pro Jahr", false, "90.000 × 500 W × 8.760 h = 394,2 GWh."]
], "Leistung (W) × Stunden = Energie (Wh). 1 GWh = 1.000.000 kWh."),
M("itm2-24", "itv-green", "Wasser im Rechenbeispiel (WUE 0,5 L/kWh, 394 Mio. kWh): Welche Aussagen sind richtig?", [
  ["Rund 197 Millionen Liter pro Jahr", true],
  ["Die Folie vergleicht das mit dem Verbrauch von rund 1,5 Millionen Österreicher:innen.", true],
  ["Grundlage sind 130 Liter pro Person und Tag.", true],
  ["Rund 1,97 Millionen Liter pro Jahr", false],
  ["Die Kühlung kann fast so viel Energie verbrauchen wie die Server selbst.", true]
], "394.000.000 kWh × 0,5 L/kWh = 197.000.000 L."),
M("itm2-25", "itv-green", "Welche Aussagen zu carbon neutral, Net Zero und carbon negative sind richtig?", [
  ["Carbon neutral kann auch reine Kompensation durch vermiedene Emissionen sein.", true],
  ["Net Zero heißt, tatsächlich so viel CO₂ zu entfernen, wie man ausstößt.", true],
  ["Carbon negative heißt, gar keine Emissionen mehr zu verursachen.", false, "Mehr entfernen als ausstoßen."],
  ["Jemanden dafür zu bezahlen, Bäume nicht zu fällen, ist Vermeidung, keine Entnahme.", true],
  ["Net Zero bedeutet, dass das Unternehmen gar kein CO₂ mehr ausstößt.", false, "„Net“, weil es weiterhin Emissionen gibt."]
], "Nur echte Entnahme (Removal) senkt die CO₂-Menge in der Atmosphäre aktiv."),
M("itm2-26", "itv-green", "Welche Klimaziele und Prinzipien von Microsoft nennt die Folie?", [
  ["Bis 2030 carbon negative", true],
  ["Bis 2050 alles CO₂ entfernen, das seit der Gründung 1975 ausgestoßen wurde", true],
  ["10 Milliarden Dollar für den Climate Innovation Fund", false, "1 Milliarde."],
  ["Bis 2030 alle eigenen Rechenzentren abschalten", false, "Steht nicht auf der Folie."],
  ["Bis 2030 Net Zero und bis 2050 carbon neutral", false]
], "Weiters: Emissionen bis 2030 mehr als halbieren, Kunden befähigen, politische Stimme, Mitarbeitende einbinden."),
M("itm2-27", "itv-green", "Welche Microsoft-Projekte verlinkt die Folie?", [
  ["Project Natick (Unterwasser-Rechenzentrum)", true],
  ["Project Silica (Speicherung in Glas)", true],
  ["Wasserstoff-Brennstoffzellen als Notstrom", true],
  ["Flüssigkeitskühlung mit siedender Flüssigkeit", true],
  ["Azure Orbital (Satelliten-Bodenstationen)", true]
], "Dazu: Modular Datacenter und Project Xcloud."),
M("itm2-28", "itv-green", "Warum ist Effizienz ein Argument für die Cloud?", [
  ["Durch Pooling laufen weniger Server im Leerlauf.", true],
  ["Große Anlagen erreichen niedrigere PUE und WUE.", true],
  ["Anbieter sichern sich langfristig günstigen und CO₂-armen Strom.", true],
  ["Effizienzgewinne garantieren, dass der absolute Stromverbrauch sinkt.", false, "KI-getriebener Mehrverbrauch überkompensiert die Gewinne (Rebound)."],
  ["Kunden haben keinen Einfluss auf Verbrauch oder Emissionen.", false, "Right-Sizing, Abschalten, CO₂-arme Regionen."]
], "Effizienz pro Recheneinheit und absoluter Verbrauch sind getrennt zu bewerten."),

/* ---------- Ressourcen, Resource Groups, Tags ---------- */
M("itm2-30", "itv-rg", "Welche Regeln für Resource Groups stehen auf der Folie?", [
  ["Eine Ressource kann nur in einer einzigen Resource Group existieren.", true],
  ["Ressourcen in einer Resource Group können in verschiedenen Regionen liegen.", true],
  ["Eine Ressource kann nach dem Anlegen nie mehr in eine andere Resource Group.", false, "Ressourcen sind verschiebbar."],
  ["Löscht man eine Resource Group, bleiben die Ressourcen erhalten.", false, "Alle Ressourcen werden mitgelöscht."],
  ["Resource Groups können ineinander verschachtelt werden.", false]
], "Kurzform: 1 Ressource = 1 RG · Regionen dürfen gemischt sein · verschiebbar · RG löschen = alles weg."),
M("itm2-31", "itv-rg", "Welche Aussagen zu Resource Groups sind richtig?", [
  ["Sie sind Container für Ressourcen mit demselben Lebenszyklus.", true],
  ["Zugriff lässt sich auf Ebene der Resource Group per RBAC absichern.", true],
  ["Eine Anwendung darf immer nur genau eine Resource Group nutzen.", false, "Mehrere sind möglich."],
  ["Es gibt strenge Regeln, wie man Ressourcen aufteilen muss.", false, "Man überlegt selbst, was sinnvoll ist."],
  ["Ohne Resource Group gibt es keine Ressource.", true]
], "Stell dir eine RG wie einen Ordner vor."),
M("itm2-32", "itv-rg", "Ein Entwickler löscht die Resource Group „rg-labor-01“. Welche Aussagen sind richtig?", [
  ["Alle Ressourcen in der Resource Group werden mitgelöscht.", true],
  ["Gelöschte Ressourcen liegen 30 Tage im Papierkorb der Resource Group.", false, "Laut Vorlesung gibt es keinen Papierkorb."],
  ["Für das Aufräumen nach dem Labor ist das praktisch.", true],
  ["Die Ressourcen werden automatisch in eine andere Resource Group verschoben.", false],
  ["Resource Locks (CanNotDelete) können vor versehentlichem Löschen schützen.", true]
], "„If you delete a resource group, all the resources will be deleted.“"),
M("itm2-33", "itv-rg", "Strategie „alles einer App in eine Resource Group“: Wann und warum?", [
  ["Für große Umgebungen mit getrennten Netzwerk- und DB-Teams", false, "Das spricht für Strategie 2."],
  ["Für Entwicklungs- und Testumgebungen", true],
  ["Updates und Konfigurationsänderungen gehen in einem Schritt.", true],
  ["Alle Ressourcen haben denselben Lebenszyklus.", true],
  ["Damit ein Netzwerk-Team und ein VM-Team getrennt arbeiten können", false, "Das spricht für Strategie 2 (nach Rolle)."]
], "Strategie 2 (nach Rolle: rg-network, rg-web, rg-db …) ist in größeren Umgebungen üblich."),
M("itm2-34", "itv-rg", "Welche Aussagen zu Tags sind richtig?", [
  ["Tags sind Name-Wert-Paare, z. B. Environment = Production.", true],
  ["Sie bestimmen, in welcher Region eine Ressource läuft.", false, "Tags sind nur Metadaten."],
  ["Sie sind sehr nützlich, um Abrechnungsinformationen zusammenzufassen.", true],
  ["Eine Ressource kann nur ein einziges Tag haben.", false, "Beliebig viele."],
  ["Tags werden automatisch von der Resource Group an alle Ressourcen vererbt.", false, "Das erzwingt man z. B. mit Azure Policy."]
], "RG: „Was wird gemeinsam verwaltet und gelöscht?“ – Tag: „Welche Eigenschaften hat die Ressource?“"),
M("itm2-35", "itv-rg", "Welche der folgenden sind Azure-Ressourcen laut Folie?", [
  ["Virtual Machines", true], ["Storage Accounts", true], ["Virtual Networks", true], ["SQL Databases", true], ["Functions", true]
], "Ressourcen sind die Bausteine von Cloud-Lösungen; dazu auch App Services."),
M("itm2-36", "itv-rg", "Welche Hierarchie (von unten nach oben) nennt die Vorlesung?", [
  ["Ressource → Resource Group → Subscription → Management Group", true],
  ["Resource Group → Ressource → Subscription → Management Group", false],
  ["Ressource → Subscription → Resource Group → Management Group", false],
  ["Management Group → Ressource → Resource Group → Subscription", false],
  ["Ressource → Resource Group → Region → Subscription", false]
], "Für die Übungen bekommt jede und jeder eine eigene Resource Group."),
M("itm2-37", "itv-rg", "Die Azure-Rechnung eines Möbelhauses beträgt 18.000 €. Wie findet man heraus, welche Abteilung was verbraucht hat?", [
  ["Jede Ressource mit einem Tag wie Abteilung versehen und in Cost Management danach gruppieren", true],
  ["Kosten nach Resource Group aufschlüsseln, wenn die RGs nach Abteilungen gebildet sind", true],
  ["Jede Ressource in mehrere Resource Groups legen, eine pro Abteilung", false, "Eine Ressource liegt in genau einer RG."],
  ["Tags quer zur RG-Struktur auswerten, z. B. alle Kosten mit CostCenter = Marketing", true],
  ["Das ist ohne eigene Rechnung pro Abteilung unmöglich.", false]
], "Tags sind die Grundlage für FinOps."),

/* ---------- ARM & Werkzeuge ---------- */
M("itm2-40", "itv-tools", "Welche Aussagen zum Azure Resource Manager (ARM) sind richtig?", [
  ["ARM ist eine Verwaltungsschicht zum Erstellen, Aktualisieren und Löschen von Ressourcen.", true],
  ["Portal, PowerShell, CLI, Mobile App, REST API und Cloud Shell sprechen alle mit ARM.", true],
  ["Jedes Werkzeug hat eine eigene Verwaltungsschicht neben ARM.", false, "Alle laufen über ARM."],
  ["ARM ist das alte PowerShell-Modul, das 2024 eingestellt wurde.", false, "Das war AzureRM."],
  ["Das Portal umgeht ARM und spricht direkt mit den Servern.", false, "Auch das Portal geht über ARM."]
], "Wie Fernbedienung, Handy-App und Sprachassistent beim Fernseher: alles landet bei derselben Steuerung."),
M("itm2-41", "itv-tools", "Welche Aussagen zur Azure Cloud Shell sind richtig?", [
  ["Sie ist eine interaktive Shell im Browser.", true],
  ["Sie bietet Bash oder PowerShell.", true],
  ["Sie braucht eine Resource Group, einen Storage Account und eine Azure File Share.", true],
  ["Sie speichert alle Dateien dauerhaft, auch ohne Storage Account.", false, "Persistenz nur über die File Share."],
  ["Sie hat ein Timeout nach 20 Minuten Inaktivität.", true]
], "Temporär, pro Sitzung und pro Benutzer bereitgestellt."),
M("itm2-42", "itv-tools", "Welche Befehle gehören zur Azure CLI?", [
  ["az vm create", true], ["Get-AzVM", false, "PowerShell."], ["az network vnet subnet list", true],
  ["New-AzVM", false, "PowerShell (Verb-Nomen)."], ["Get-Help New-AzVirtualNetwork -Examples", false, "PowerShell."]
], "CLI: beginnt mit az, kleingeschrieben, Gruppen und Untergruppen."),
M("itm2-43", "itv-tools", "Welche Aussagen zu Azure PowerShell sind richtig?", [
  ["Das aktuelle Modul heißt „Az“.", true],
  ["Das alte Modul „AzureRM“ wurde 2024 eingestellt und soll nicht mehr verwendet werden.", true],
  ["Cmdlets folgen der Verb-Nomen-Namenskonvention, z. B. New-AzVM.", true],
  ["Hilfe gibt es mit az vm --help.", false, "Das ist die CLI."],
  ["Azure PowerShell läuft nur unter Windows.", false, "Windows, macOS, Linux und Docker."]
], "Get = anzeigen, New = erstellen, Remove = löschen, Set = ändern."),
M("itm2-44", "itv-tools", "Welche Aussagen zur Azure CLI sind richtig?", [
  ["Sie ist für Windows, macOS, Linux und als Docker-Container verfügbar.", true],
  ["Sie kann interaktiv oder in Skripten genutzt werden.", true],
  ["Mit az find findet man Befehle, mit --help bekommt man Hilfe.", true],
  ["Befehle folgen der Verb-Nomen-Konvention, z. B. New-AzVM.", false, "Das ist PowerShell."],
  ["Die CLI ist ein Modul für PowerShell.", false, "Das ist Azure PowerShell (Az)."]
], "Beispiel: az network --help → az network vnet --help → az network vnet subnet create --help."),
M("itm2-45", "itv-tools", "Was kann das Azure Portal laut Folie?", [
  ["Ressourcen, Dienste und Dokumentation suchen", true],
  ["Eigene Dashboards und Favoriten erstellen", true],
  ["Die Cloud Shell öffnen", true],
  ["Subscriptions und Abrechnung verwalten", true],
  ["Benachrichtigungen empfangen", true]
], "Dazu: Ressourcen verwalten. Das Portal gibt es im Browser und als App."),
M("itm2-46", "itv-tools", "Welche Zuordnungen zum Aufbau des Azure Portals sind richtig?", [
  ["Global search: Ressource, Dienst oder Doku finden", true],
  ["Global controls: Cloud Shell, Subscription-Filter, Benachrichtigungen, Einstellungen", true],
  ["Resource menu: linkes Fenster, kontextabhängig", true],
  ["Breadcrumb: Benachrichtigungen anzeigen", false, "Breadcrumb = eine Ebene zurück."],
  ["Working pane: Liste aller Subscriptions des Unternehmens", false, "Working pane = Details der Ressource im Fokus."]
], "Acht Elemente: Page header, Global search, Global controls, Kontoinformationen, Resource menu, Command bar, Working pane, Breadcrumb."),
M("itm2-47", "itv-tools", "Eine Lehrende braucht für 25 Studierende je eine Resource Group mit VM. Welche Aussagen sind sinnvoll?", [
  ["Mit einer Schleife in der Cloud Shell (az group create, az vm create) geht es schneller als im Portal.", true],
  ["Ein zweites Skript kann nach dem Semester alle Resource Groups wieder löschen.", true],
  ["Wiederholbare, automatisierte Bereitstellung führt zu Infrastructure as Code.", true],
  ["Das geht nur im Portal, weil die CLI keine VMs anlegen kann.", false],
  ["Ressourcen werden so eher „cattle, not pets“.", true]
], "Klicken für Überblick und Einmaliges, Skripten für Wiederholbares."),
M("itm2-48", "itv-tools", "Welche Befehle gehören zu Azure PowerShell?", [
  ["az vm list", false, "CLI."], ["Remove-AzVirtualNetwork", true], ["New-AzVirtualNetwork", true],
  ["az vm delete", false, "CLI."], ["az find storage", false, "CLI."]
], "PowerShell: Verb-AzNomen mit Bindestrich.")
];
(X.itinf = X.itinf || []).push({ id: "itinf-mc-v2", questions });
})();
