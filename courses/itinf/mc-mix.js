/* ITINF-GL · Quick-Test-Fragen, Teil 2: quer durch V1–V3, bewusst mit wenigen richtigen Antworten (1–2)
   oder fast allen (4–5), damit man nicht nach Muster („meistens drei“) ankreuzen kann. Helfer M aus mc-v1.js. */
(function () {
const M = window.ITINF_M, X = window.STUDYOS_EXT = window.STUDYOS_EXT || {}; if (!M) return;
const questions = [
/* ---------- V1 ---------- */
M("itmx-1", "itg-def", "Laut NIST SP 800-145: Wie viele Service-Modelle und wie viele Deployment-Modelle gibt es?", [
  ["3 Service-Modelle und 4 Deployment-Modelle", true],
  ["4 Service-Modelle und 3 Deployment-Modelle", false],
  ["5 Service-Modelle und 4 Deployment-Modelle", false, "5 ist die Zahl der Essential Characteristics."],
  ["3 Service-Modelle und 5 Deployment-Modelle", false],
  ["4 Service-Modelle (inkl. Serverless) und 5 Deployment-Modelle (inkl. Multi-Cloud)", false, "Beides spätere Ergänzungen, nicht NIST."]
], "IaaS, PaaS, SaaS · Public, Private, Community, Hybrid."),
M("itmx-2", "itg-nist", "Welche Aussagen beschreiben Measured service UND NICHT ein anderes NIST-Merkmal?", [
  ["Verbrauch wird gemessen, überwacht und berichtet.", true],
  ["Bereitstellung ohne menschliche Interaktion mit dem Anbieter", false, "On-demand self-service"],
  ["Zugriff von heterogenen Endgeräten über Standardprotokolle", false, "Broad network access"],
  ["Ressourcen werden in einem Multi-Tenant-Modell gebündelt.", false, "Resource pooling"],
  ["Automatische Kontrolle und Optimierung durch Metering", true]
], "Measured service ist die Basis der nutzungsbasierten Abrechnung."),
M("itmx-3", "itg-nist", "Ein Kunde startet am Black Friday automatisch 40 zusätzliche Instanzen und gibt sie am Abend wieder frei. Welches NIST-Merkmal steht im Vordergrund?", [
  ["Rapid elasticity", true],
  ["Broad network access", false],
  ["Resource pooling", false],
  ["Community Cloud", false, "Deployment-Modell, kein Merkmal."],
  ["Measured service", false, "Wird zwar gemessen, im Vordergrund steht aber das Wachsen und Schrumpfen."]
], "Elastisch in beide Richtungen, teils automatisch."),
M("itmx-4", "itg-deploy", "Ein Unternehmen nutzt Azure und AWS parallel, aber kein eigenes Rechenzentrum. Was trifft zu?", [
  ["Multi-Cloud", true],
  ["Hybrid Cloud", false, "Hybrid kombiniert on-premises/Private mit Public."],
  ["Community Cloud", false],
  ["Private Cloud", false],
  ["Ein NIST-Deployment-Modell aus dem Jahr 2011", false, "Multi-Cloud kommt in NIST 2011 nicht vor."]
], "Multi-Cloud = zwei oder mehr Public Clouds."),
M("itmx-5", "itg-deploy", "Welche Aussagen über Lock-in und Private Cloud stammen von der Folie?", [
  ["Mit „Cloud“ ist meist stillschweigend Public Cloud gemeint.", true],
  ["Lock-in-Sorgen werden oft mit Private-Cloud-Ansätzen beantwortet, auch wenn das ökonomisch nicht immer sinnvoll ist.", true],
  ["Eine Private Cloud ist immer billiger als die Public Cloud.", false],
  ["Multi-Cloud beseitigt jeden Lock-in vollständig.", false, "Unterschiedliche APIs und Egress bleiben ein Problem."],
  ["Hybrid Cloud ist nur ein Marketingbegriff ohne NIST-Definition.", false, "Hybrid ist eines der vier NIST-Modelle."]
], "Gartner erwartet bis 2027 90 % Hybrid-Ansätze."),
M("itmx-6", "itg-virt", "Welche Aussage über die Isolation von VMs und Containern ist richtig?", [
  ["VMs isolieren stärker, weil jede VM einen eigenen Kernel hat.", true],
  ["Container isolieren stärker, weil sie kleiner sind.", false],
  ["Beide isolieren gleich stark.", false],
  ["Container laufen in der Public Cloud nie innerhalb von VMs.", false, "Meist laufen sie gerade in VMs."],
  ["VMs teilen sich den Kernel des Hosts.", false, "Das tun Container."]
], "Darum laufen Container in der Public Cloud meist innerhalb von VMs."),
M("itmx-7", "itg-faas", "Was ist ein Cold Start?", [
  ["Verzögerung, weil nach Scale to Zero erst eine neue Instanz (Runtime, Code, Abhängigkeiten) hochfahren muss", true],
  ["Der erste Start eines Rechenzentrums nach dem Bau", false],
  ["Ein Kühlsystem für Server", false],
  ["Ein Neustart einer VM nach vertikaler Skalierung", false],
  ["Ein Timer-Trigger, der um Mitternacht startet", false]
], "Cold Starts sind ein typischer Trade-off von Serverless."),
M("itmx-8", "itg-svc", "Wer installiert die Sicherheitspatches für das Betriebssystem einer Azure-VM?", [
  ["Der Kunde", true],
  ["Microsoft", false],
  ["Beide gemeinsam zu gleichen Teilen", false],
  ["Niemand, VMs brauchen keine Patches", false],
  ["Der Hardware-Hersteller des Servers", false]
], "Frage 7 der Folie. Bei IaaS liegt das Betriebssystem in Kundenverantwortung."),
M("itmx-9", "itg-svc", "Welche Zuordnungen von Dienst und Service-Modell sind FALSCH?", [
  ["Azure SQL Database → IaaS", true, "Verwalteter Dienst = PaaS."],
  ["Microsoft 365 → PaaS", true, "Fertige Software = SaaS."],
  ["Azure Virtual Machines → IaaS", false, "Stimmt."],
  ["Azure App Service → PaaS", false, "Stimmt."],
  ["Salesforce CRM → SaaS", false, "Stimmt."]
], "Gefragt sind die falschen Zuordnungen."),
M("itmx-10", "itg-shared", "Bei welchem Modell ist der Kunde für das Betriebssystem verantwortlich?", [
  ["On-premises / Private", true],
  ["IaaS", true],
  ["PaaS", false],
  ["SaaS", false],
  ["Serverless / FaaS", false, "Server und OS übernimmt der Anbieter."]
], "Ab PaaS übernimmt der Anbieter das Betriebssystem."),
M("itmx-11", "itg-sla", "Wie viel Ausfall pro Jahr erlauben 99,95 %?", [
  ["Rund 4,38 Stunden", true],
  ["Rund 8,76 Stunden", false, "Das sind 99,9 %."],
  ["Rund 52,6 Minuten", false, "Das sind 99,99 %."],
  ["Rund 3,65 Tage", false, "Das sind 99 %."],
  ["Rund 43,8 Stunden", false]
], "0,0005 × 8.760 h = 4,38 h."),
M("itmx-12", "itg-sla", "Zwei unabhängige Regionen mit je 99,95 % laufen parallel (redundant). Welche Aussagen sind richtig?", [
  ["Man rechnet 1 − (1 − 0,9995)².", true],
  ["Das Ergebnis liegt bei rund 99,99998 %.", true],
  ["Das Ergebnis liegt bei 99,90 %, weil man multipliziert.", false, "Multipliziert wird nur seriell."],
  ["Parallel ist das Ergebnis schlechter als eine einzelne Region.", false],
  ["Die Formel gilt auch für zwei VMs im selben Rack.", false, "Sie setzt unabhängige Ausfälle voraus."]
], "Parallel: 1 − (1 − A)ⁿ."),
M("itmx-13", "itg-sla", "Welche Aussagen zu Scalability und Elasticity sind richtig?", [
  ["Scalability ist die Fähigkeit zu wachsen.", true],
  ["Elasticity ist automatisches, bedarfsgerechtes Wachsen und Schrumpfen.", true],
  ["Elasticity und Scalability bedeuten exakt dasselbe.", false],
  ["Elasticity bedeutet, dass die VM immer gleich groß bleibt.", false],
  ["Scale up heißt mehr Instanzen hinzufügen.", false, "Scale up = größere VM; scale out = mehr Instanzen."]
], "Autoscaling sorgt dafür, dass die App immer die nötigen Ressourcen hat."),
M("itmx-14", "itg-scale", "Ein Student nennt bei „Economies of Scale“: Einkaufsmacht, Personalkosten, Stromkosten. Was fehlt?", [
  ["Sicherheit und Zuverlässigkeit (Security & reliability)", true],
  ["Elastizität", false, "Ein NIST-Merkmal bzw. Cloud Benefit."],
  ["Multi-Tenancy", false],
  ["Pay-as-you-go", false],
  ["Global reach", false, "Ein Cloud Benefit."]
], "Genau dieser Punkt wurde in einer alten Prüfung desselben Lehrteams oft als fehlend angestrichen."),
M("itmx-15", "itg-workload", "Welches Muster beschreibt „Suche braucht viel CPU, E-Mail viel Storage“?", [
  ["Multi-resource", true],
  ["Randomness", false],
  ["Time-of-day", false],
  ["Industry-specific", false],
  ["Uncertain growth", false]
], "Workloads mit komplementären Ressourcenprofilen auf denselben Servern kombinieren."),
M("itmx-16", "itg-pa", "Ein Workload ist völlig konstant (p = a). Was folgt aus der p/a-Regel?", [
  ["p/a = 1", true],
  ["Die Cloud lohnt sich nur, wenn sie pro Einheit billiger ist als in-house.", true],
  ["Die Cloud darf bis zum 5-Fachen kosten.", false],
  ["Elastizität bringt hier den größten Vorteil.", false],
  ["Serverless ist hier immer die günstigste Wahl.", false]
], "Static tendiert zu On-Premise oder Reserved Instances."),
M("itmx-17", "itg-pa", "Unter welcher Bedingung ist die Cloud nach Weinman wirtschaftlicher?", [
  ["c / d < p / a", true],
  ["c / d > p / a", false],
  ["c < d / (p · a)", false],
  ["p / a < 1", false],
  ["c = d", false]
], "Gleichbedeutend: c < d · p / a."),
M("itmx-18", "itg-cost", "Welches Preismodell passt zu einem nächtlichen Batch-Job, der jederzeit unterbrochen und später fortgesetzt werden darf?", [
  ["Spot VMs", true],
  ["Reserved Instances für 3 Jahre", false],
  ["Azure Hybrid Benefit", false, "Lizenz-Wiederverwendung, kein Preismodell für Batch."],
  ["Savings Plan for Compute", false],
  ["Ein dedizierter physischer Server", false]
], "Spot: bis zu 90 % Rabatt, kann aber jederzeit verdrängt werden."),
M("itmx-19", "itg-cost", "Welche Aussagen zu CapEx und OpEx sind FALSCH?", [
  ["CapEx wird sofort als Aufwand der laufenden Periode verbucht.", true, "Das ist OpEx; CapEx wird abgeschrieben."],
  ["OpEx bindet Kapital für Jahre.", true, "Das ist CapEx."],
  ["Die Cloud verschiebt IT von fixen zu variablen Kosten.", false, "Stimmt."],
  ["Commitments wie Reservierungen bringen Fixkostenelemente zurück.", false, "Stimmt."],
  ["Ein fixes Hardware-Budget ist leichter zu planen als nutzungsabhängige Kosten.", false, "Stimmt laut Vorlesung."]
], "Gefragt sind die falschen Aussagen."),
M("itmx-20", "itg-dist", "Welche Aussage ist KEINE der 8 Fallacies of Distributed Computing?", [
  ["Everything fails all the time", true, "Das ist ein Gebot der Cloud."],
  ["There is one administrator", false],
  ["Topology doesn't change", false],
  ["The network is secure", false],
  ["The network is homogeneous", false]
], "Die Fallacies sind falsche Annahmen; „Everything fails all the time“ ist ein Cloud-Gebot."),
M("itmx-21", "itg-reg", "Ein österreichisches Unternehmen speichert Daten bei einem US-Hyperscaler in Frankfurt. Was gilt?", [
  ["Die Data Residency in der EU ist erfüllt.", true],
  ["Über den CLOUD Act können US-Behörden die Herausgabe verlangen.", true],
  ["Es gilt ausschließlich EU-Recht, weil die Daten in Deutschland liegen.", false],
  ["Die Microsoft EU Data Boundary schließt US-Recht aus.", false],
  ["Damit ist die Datensouveränität vollständig gesichert.", false]
], "Residenz ≠ Souveränität."),
M("itmx-22", "itg-reg", "Welche Regelung erleichtert den Wechsel zwischen Cloud-Anbietern?", [
  ["EU Data Act", true],
  ["DORA", false],
  ["NIS2", false],
  ["US CLOUD Act", false],
  ["DSGVO", false]
], "Der Data Act gilt seit Sept. 2025; Wechselentgelte fallen bis 2027 weg."),

/* ---------- V2 ---------- */
M("itmx-30", "itv-region", "Welche Region Pair ist eine Ausnahme bei der Data Residency?", [
  ["Brazil South (gepaart mit South Central US)", true],
  ["North Europe ↔ West Europe", false],
  ["Japan East ↔ Japan West", false],
  ["UK West ↔ UK South", false],
  ["Australia Southeast ↔ Australia East", false]
], "Brazil South ist Primary und mit einer Region außerhalb der Geography gepaart."),
M("itmx-31", "itv-region", "Was gilt für Region Pairs laut Folie NICHT?", [
  ["Updates werden gleichzeitig in beiden Regionen eingespielt.", true, "Sequenziell, immer nur eine Region."],
  ["Die beiden Regionen liegen im selben Rechenzentrum.", true, "Mindestens 300 Meilen Abstand."],
  ["Bei großen Ausfällen wird eine Region des Paares priorisiert wiederhergestellt.", false, "Stimmt."],
  ["Für einige Dienste gibt es automatische Replikation.", false, "Stimmt."],
  ["Die Regionen liegen in derselben Geography (außer Brazil South).", false, "Stimmt."]
], "Gefragt sind die falschen Aussagen."),
M("itmx-32", "itv-region", "Welche Dienste sind laut Lektion global bzw. nicht an eine Region gebunden?", [
  ["Microsoft Entra ID", true],
  ["Azure Front Door", true],
  ["Azure DNS", true],
  ["Eine einzelne Azure-VM", false, "Eine VM liegt in einer Region (und ggf. Zone)."],
  ["Ein Storage Account", false]
], "Bei fast allen anderen Ressourcen gibt man eine Region (location) an."),
M("itmx-33", "itv-az", "Eine Anwendung soll den Ausfall eines kompletten Rechenzentrums überstehen, aber in einer Region bleiben. Was nutzt du?", [
  ["Availability Zones", true],
  ["Region Pair", false, "Das wäre eine zweite Region."],
  ["Eine größere VM", false],
  ["Eine zweite Resource Group", false, "Logische Gruppierung, kein physischer Schutz."],
  ["Mehr Tags", false]
], "Zonen = getrennte Rechenzentren innerhalb einer Region."),
M("itmx-34", "itv-az", "Welches Beispiel nennt die Folie für einen zonenredundanten Dienst?", [
  ["Public IPs", true],
  ["Virtual Machines", false, "Zonal."],
  ["Resource Groups", false],
  ["Azure Cloud Shell", false],
  ["Management Groups", false]
], "Zonenredundant: Azure repliziert und verteilt automatisch."),
M("itmx-35", "itv-green", "Welche Formel ist richtig?", [
  ["WUE = Liter Wasser ÷ kWh IT-Energie", true],
  ["PUE = IT-Energie ÷ Gesamtenergie", false, "Umgekehrt."],
  ["PUE = Gesamtenergie × IT-Energie", false],
  ["WUE = kWh ÷ Liter Wasser", false],
  ["Energie = Leistung ÷ Stunden", false, "Energie = Leistung × Zeit."]
], "PUE = Gesamtenergie ÷ IT-Energie; WUE = L/kWh."),
M("itmx-36", "itv-green", "Ein Fußballverein zahlt einem Waldbesitzer dafür, seinen Wald nicht zu roden. Wie nennt man das üblicherweise?", [
  ["Carbon neutral (Kompensation durch Vermeidung)", true],
  ["Net Zero", false, "Dafür müsste CO₂ tatsächlich entfernt werden."],
  ["Carbon negative", false],
  ["CO₂-Entnahme (Removal)", false],
  ["PUE-Optimierung", false]
], "Vermeidung verhindert nur etwas Negatives; es werden keine zusätzlichen Bäume gepflanzt."),
M("itmx-37", "itv-rg", "Welche Aussagen zu Resource Groups sind FALSCH?", [
  ["Eine Ressource kann gleichzeitig in zwei Resource Groups liegen.", true],
  ["Alle Ressourcen einer Resource Group müssen in derselben Region liegen.", true],
  ["Resource Groups lassen sich verschachteln.", true],
  ["Löscht man eine Resource Group, sind alle Ressourcen darin weg.", false, "Stimmt."],
  ["Zugriff kann per RBAC auf Resource-Group-Ebene vergeben werden.", false, "Stimmt."]
], "Gefragt sind die falschen Aussagen (typische Fehler laut Folie)."),
M("itmx-38", "itv-rg", "Wofür sind Tags laut Folie „sehr nützlich“?", [
  ["Um Abrechnungsinformationen zusammenzufassen (rolling up billing information)", true],
  ["Um Ressourcen zwischen Regionen zu replizieren", false],
  ["Um Benutzer zu authentifizieren", false],
  ["Um Ressourcen vor dem Löschen zu schützen", false, "Dafür gibt es Resource Locks."],
  ["Um VMs automatisch zu skalieren", false]
], "Tags = Name-Wert-Paare als Metadaten."),
M("itmx-39", "itv-tools", "Welches Werkzeug braucht laut Folie einen Storage Account und eine Azure File Share?", [
  ["Azure Cloud Shell", true],
  ["Azure CLI auf dem eigenen Laptop", false],
  ["Azure Mobile App", false],
  ["Azure Portal", false],
  ["Azure REST API", false]
], "Die Cloud Shell ist temporär; persistiert wird nur in der File Share."),
M("itmx-40", "itv-tools", "Welcher Befehl erstellt eine VM mit Azure PowerShell?", [
  ["New-AzVM", true],
  ["az vm create", false, "CLI."],
  ["Get-AzVM", false, "Anzeigen."],
  ["Remove-AzVM", false, "Löschen."],
  ["New-AzureRmVM", false, "Altes Modul AzureRM, 2024 eingestellt."]
], "Verb-Nomen: New = erstellen."),

/* ---------- V3 ---------- */
M("itmx-50", "itv-mgmt", "Wie tief darf ein Management-Group-Baum laut Folie sein?", [
  ["Bis zu sechs Ebenen (ohne Root- und Subscription-Ebene)", true],
  ["Bis zu drei Ebenen", false],
  ["Bis zu zehn Ebenen", false],
  ["Unbegrenzt", false],
  ["Bis zu 10.000 Ebenen", false, "10.000 ist die Anzahl der Management Groups pro Verzeichnis."]
], "„Zehntausend Ordner, sechs Stockwerke.“"),
M("itmx-51", "itv-mgmt", "Eine Rolle wird auf einer Resource Group vergeben. Für welche Ebenen gilt sie?", [
  ["Für die Resource Group selbst", true],
  ["Für alle Ressourcen in dieser Resource Group", true],
  ["Für die Subscription darüber", false, "Vererbung nur nach unten."],
  ["Für die Management Group darüber", false],
  ["Für alle anderen Resource Groups der Subscription", false]
], "Vererbung läuft immer von oben nach unten."),
M("itmx-52", "itv-policy", "Was ist eine Initiative in Azure Policy?", [
  ["Eine Gruppe aus einer oder mehreren Policy Definitions", true],
  ["Eine Rollenzuweisung in Azure RBAC", false],
  ["Ein Remediation Task", false],
  ["Ein JSON-Template für VMs", false],
  ["Eine Management Group", false]
], "Initiativen bündeln Policies und erfordern Planung."),
M("itmx-53", "itv-policy", "Was unterscheidet Azure Policy von Azure RBAC?", [
  ["Policy regelt, wie Ressourcen aussehen müssen; RBAC regelt, wer etwas tun darf.", true],
  ["Auch wer die nötigen RBAC-Rechte hat, muss die Policy einhalten.", true],
  ["Policy ersetzt RBAC vollständig.", false],
  ["RBAC prüft alle 24 Stunden die Compliance.", false, "Das macht Azure Policy."],
  ["Policy vergibt Rollen wie Owner und Reader.", false]
], "Studentenheim: Schlüssel (RBAC) und Hausordnung (Policy)."),
M("itmx-54", "itv-iam", "Welche Methode ist „etwas, das du weißt“?", [
  ["Passwort", true],
  ["FIDO2-Sicherheitsschlüssel", false, "Besitz."],
  ["Fingerabdruck", false, "Sein."],
  ["Smartcard", false, "Besitz."],
  ["Zertifikat", false, "Besitz."]
], "Wissen, Besitz, Sein."),
M("itmx-55", "itv-iam", "Wo begegnet dir ein Identity Provider im Alltag?", [
  ["„Mit Google anmelden“ bei einer Lern-App", true],
  ["Eine Anmeldung an der FH für Moodle, E-Mail und Teams mit derselben Kennung", true],
  ["Ein Excel-Passwort auf einer einzelnen Datei", false],
  ["Eine App mit eigener Benutzertabelle und eigenem Login-Formular", false, "Genau das ersetzt ein IdP."],
  ["Ein USB-Stick mit Dateien", false]
], "Ein Konto, viele Apps = Single Sign-On."),
M("itmx-56", "itv-loa", "Welche Methode erfüllt AAL3?", [
  ["FIDO2-Sicherheitsschlüssel mit nicht exportierbarem privatem Schlüssel", true],
  ["Smartcard mit Public-Key-Zertifikat", true],
  ["Passwort + SMS-Code", false, "Höchstens AAL2; nicht phishing-resistent."],
  ["Passwort allein", false, "AAL1."],
  ["Passwort + Sicherheitsfrage", false, "Zweimal Wissen."]
], "AAL3: phishing-resistent, kryptografisch, Schlüssel nicht exportierbar."),
M("itmx-57", "itv-loa", "Wie wählt man in NIST SP 800-63-4 die Levels?", [
  ["Über den DIRM-Prozess nach der Auswirkung eines Fehlers: Low, Moderate, High", true],
  ["Über die Entscheidungsbäume aus SP 800-63-3", false, "Ersetzt durch DIRM."],
  ["Immer das höchste Level, damit es sicher ist", false],
  ["Nach dem Preis der Lizenz", false],
  ["Der Benutzer wählt sein Level beim Login selbst", false]
], "Low → 1, Moderate → 2, High → 3 (FAL High → 2 oder 3)."),
M("itmx-58", "itv-entra", "Welche Werkzeuge betrifft Phase 2 der verpflichtenden MFA für Azure?", [
  ["Azure CLI", true], ["Azure PowerShell", true], ["Azure Mobile App", true], ["REST API und IaC-Tools (Control Plane)", true],
  ["Managed Identities", false, "Workload-Identitäten sind ausgenommen."]
], "Phase 2 seit Oktober 2025 (Aufschub bis 1. Juli 2026 möglich)."),
M("itmx-59", "itv-entra", "Welches Protokoll nutzt Entra ID statt Kerberos für die Authentifizierung?", [
  ["SAML", true], ["OpenID Connect", true], ["WS-Federation", true],
  ["LDAP", false, "Abfrageprotokoll von AD DS."], ["SMTP", false]
], "OAuth dient der Autorisierung."),
M("itmx-60", "itv-users", "Ein Mitarbeiter wechselt vom Vertrieb ins Marketing. Was sorgt dafür, dass seine Gruppenmitgliedschaft automatisch angepasst wird?", [
  ["Eine Dynamic-User-Gruppe mit Regel auf das Attribut department", true],
  ["Eine Assigned-Gruppe", false, "Mitglieder werden manuell gepflegt."],
  ["Eine Administrative Unit", false, "Scope für Admin-Rollen, keine Gruppe."],
  ["Ein Guest-Konto", false],
  ["Eine Dynamic-Device-Gruppe", false, "Regeln für Geräte."]
], "Dynamic User braucht Entra ID P1."),
M("itmx-61", "itv-users", "Wie lange kann man gelöschte Benutzer in Entra ID wiederherstellen?", [
  ["30 Tage", true], ["7 Tage", false], ["90 Tage", false], ["24 Stunden", false], ["Gar nicht", false]
], "Laut Folie 30 Tage."),
M("itmx-62", "itv-rbac", "Eine Benutzerin soll in rg-shop VMs erstellen, aber keinen Zugriff an andere vergeben. Welche Rollen mit Scope rg-shop passen?", [
  ["Contributor", true],
  ["Virtual Machine Contributor", true],
  ["Owner", false, "Darf Zugriff delegieren."],
  ["Reader", false, "Darf nur ansehen."],
  ["User Access Administrator", false, "Verwaltet nur Zugriff, keine Ressourcen."]
], "Scope so klein wie möglich (Least Privilege)."),
M("itmx-63", "itv-rbac", "Welche Rolle darf in Azure RBAC Zugriff an andere vergeben UND Ressourcen verwalten?", [
  ["Owner", true],
  ["Contributor", false],
  ["Reader", false],
  ["Virtual Machine Contributor", false],
  ["Security Reader", false]
], "Owner = alles + Zugriff delegieren."),
M("itmx-64", "itv-rbac", "Auf welchen Scope kann man eine Entra-Rolle wie User Administrator beschränken?", [
  ["Tenant", true],
  ["Administrative Unit", true],
  ["Einzelnes Objekt, z. B. eine App", true],
  ["Resource Group", false, "Scope für Azure RBAC."],
  ["Subscription", false, "Scope für Azure RBAC."]
], "Azure RBAC: MG, Subscription, RG, Ressource · Entra: Tenant, AU, Objekt.")
];
(X.itinf = X.itinf || []).push({ id: "itinf-mc-mix", questions });
})();
