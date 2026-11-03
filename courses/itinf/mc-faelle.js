/* ITINF-GL · Quick-Test-Fallfragen V1–V4: längere Situationen aus der Praxis, Antworten als ganze Sätze
   (Entscheidungen, Begründungen, Folgen). Weiterhin Mehrfachauswahl mit 5 Antworten, 1 bis 5 richtig.
   Helfer M kommt aus mc-v1.js (window.ITINF_M). */
(function () {
const M = window.ITINF_M, X = window.STUDYOS_EXT = window.STUDYOS_EXT || {}; if (!M) return;
const questions = [
/* ================= V1 · Cloud Concepts ================= */
M("itfa1-1", "itg-nist", "Ein Start-up meldet sich im Azure-Portal an, legt um 23 Uhr ohne Rückfrage beim Anbieter selbst drei VMs an, sieht am Monatsende in der Rechnung jede einzelne CPU-Stunde und weiß nur, dass seine Daten „in Westeuropa“ liegen. Welche NIST-Merkmale werden in dieser Situation beschrieben?", [
  ["On-demand self-service, weil die VMs ohne menschliche Interaktion mit dem Anbieter selbst bereitgestellt werden.", true],
  ["Broad network access, weil die Rechnung per E-Mail kommt.", false, "Broad network access = Zugriff übers Netz mit Standardmechanismen."],
  ["Measured service, weil jede CPU-Stunde gemessen und abgerechnet wird.", true],
  ["Rapid elasticity, weil die Rechnung am Monatsende kommt.", false, "Elastizität heißt schnelles Hinzufügen und Freigeben von Ressourcen."],
  ["Hochverfügbarkeit, die laut NIST das sechste Merkmal ist.", false, "Es gibt nur fünf Merkmale; Hochverfügbarkeit gehört nicht dazu."]
], "Die fünf Merkmale: On-demand self-service, Broad network access, Resource pooling, Rapid elasticity, Measured service."),
M("itfa1-2", "itg-deploy", "Eine Bank betreibt ihre Kernbanken-Datenbank aus rechtlichen Gründen im eigenen Rechenzentrum. Vor Weihnachten reicht die Kapazität für das Online-Banking nicht, deshalb werden zusätzliche Webserver automatisch in Azure gestartet und danach wieder abgebaut. Welche Aussagen beschreiben das richtig?", [
  ["Das ist eine Hybrid Cloud, weil eine Private Cloud und eine Public Cloud zusammen genutzt werden.", true],
  ["Das zeitweise Auslagern von Spitzenlast in die Public Cloud heißt Cloud Bursting.", true],
  ["Die Kernbanken-Datenbank liegt dabei in der Public Cloud.", false],
  ["Das ist eine Multi-Cloud, weil zwei Rechenzentren beteiligt sind.", false, "Multi-Cloud = mehrere Public-Cloud-Anbieter."],
  ["Das ist eine Community Cloud, weil viele Bankkunden sie nutzen.", false]
], ""),
M("itfa1-3", "itg-svc", "Ein Webshop-Team will sich nicht mehr um Betriebssystem-Updates, Patches und das Netzwerk der Server kümmern, aber weiterhin seinen eigenen Code deployen. Die Buchhaltung nutzt dagegen nur noch Microsoft 365 im Browser. Welche Einordnungen sind richtig?", [
  ["Für das Webshop-Team passt PaaS, etwa Azure App Service.", true],
  ["Microsoft 365 im Browser ist SaaS.", true],
  ["Das Webshop-Team bräuchte IaaS, weil nur dort eigener Code laufen kann.", false, "Auch bei PaaS deployt der Kunde seinen Code."],
  ["Bei SaaS verwaltet die Buchhaltung das Betriebssystem der Server selbst.", false],
  ["Bei PaaS bleibt das Team trotzdem für die Betriebssystem-Patches verantwortlich.", false, "Das übernimmt der Anbieter."]
], ""),
M("itfa1-4", "itg-shared", "Eine Firma nutzt Microsoft 365 (SaaS). Ein Mitarbeiter verwendet überall dasselbe schwache Passwort, sein Konto wird übernommen und vertrauliche Dateien werden geteilt. Wer ist laut Shared Responsibility Model zuständig?", [
  ["Die Firma, weil Konten und Identitäten immer beim Kunden liegen.", true],
  ["Die Firma, weil Informationen und Daten immer beim Kunden liegen.", true],
  ["Microsoft, weil bei SaaS der Anbieter für alles verantwortlich ist.", false],
  ["Microsoft wäre verantwortlich, wenn das physische Rechenzentrum ausfällt.", true],
  ["Niemand, weil Fehlkonfigurationen in der Cloud nicht vorkommen.", false, "Fehlkonfiguration beim Kunden ist die häufigste Ursache."]
], "Immer beim Kunden: Daten, Geräte, Konten und Identitäten."),
M("itfa1-5", "itg-sla", "Ein Webshop braucht gleichzeitig App Service (SLA 99,95 %), eine SQL Database (99,99 %) und Storage (99,9 %). Der Chef fragt, wie verfügbar der Shop insgesamt ist. Welche Antworten sind richtig?", [
  ["Man multipliziert die Verfügbarkeiten, weil alle drei Dienste gebraucht werden (seriell).", true],
  ["Das Composite SLA liegt bei etwa 99,84 % und damit unter jedem einzelnen Dienst.", true],
  ["Das ergibt rund 14 Stunden möglichen Ausfall pro Jahr.", true],
  ["Parallel betriebene, redundante Instanzen erhöhen die Verfügbarkeit nach A = 1 − (1 − A)ⁿ.", true],
  ["Mehr Verfügbarkeit erreicht man mit redundanten Instanzen in mehreren Zonen oder Regionen.", true]
], "0,9995 · 0,9999 · 0,999 ≈ 0,9984."),
M("itfa1-6", "itg-pa", "Ein Onlinehändler braucht im Jahresdurchschnitt 2 Server, zur Spitze im Dezember aber 10. Ein Cloud-Server kostet pro Stunde das 4-Fache eines eigenen Servers. Lohnt sich die Cloud nach Weinman?", [
  ["Ja, weil c/d = 4 kleiner ist als p/a = 5.", true],
  ["Nein, weil die Cloud pro Stunde teurer ist und das immer entscheidet.", false, "Entscheidend ist der Vergleich c/d mit p/a."],
  ["Würde die Cloud das 6-Fache kosten, wäre eigene Hardware günstiger.", true],
  ["In-house muss man für die Spitze kaufen und zahlt die 10 Server das ganze Jahr.", true],
  ["Bei perfekt statischer Last (p/a = 1) wäre die Cloud trotz 4-fachem Preis günstiger.", false]
], "Cloud lohnt, solange c/d < p/a."),
M("itfa1-7", "itg-cost", "Eine Firma hat eine Datenbank-VM, die rund um die Uhr gleich ausgelastet ist, und einen Testserver, der nur während der Bürozeiten gebraucht wird. Außerdem gibt es nächtliche Rechenjobs, die ruhig unterbrochen werden dürfen. Welche Preismodelle passen?", [
  ["Für die gleichmäßig ausgelastete Datenbank-VM passen Reserved Instances oder ein Savings Plan.", true],
  ["Den Testserver bucht man als Reserved Instance für drei Jahre, damit er rund um die Uhr läuft.", false, "Periodisch → abschalten, Pay-as-you-go."],
  ["Für die Nachtjobs muss man Dedicated Hosts kaufen.", false, "Unterbrechbare Jobs → Spot VMs."],
  ["Spot VMs sind ideal für die Datenbank, weil sie nie verdrängt werden.", false, "Spot VMs können jederzeit evicted werden."],
  ["Ein Budget-Alert schaltet die VMs automatisch ab, wenn das Budget erreicht ist.", false, "Er schickt nur eine E-Mail."]
], ""),
M("itfa1-8", "itg-dist", "Ein Admin hat seinen Webserver „Zeus“ getauft, pflegt ihn seit Jahren von Hand und repariert ihn bei jedem Problem. Ein Cloud-Architekt rät zu „cattle, not pets“. Was meint er damit?", [
  ["Server sollen aus Images oder Templates erzeugt und bei Problemen ersetzt statt repariert werden.", true],
  ["„Zeus“ ist ein typischer Pet-Server mit Namen und Handpflege.", true],
  ["Statt einen Server immer größer zu machen, nimmt man mehr Instanzen (scale out, not up).", true],
  ["Man sollte davon ausgehen, dass alles ständig ausfallen kann (everything fails all the time).", true],
  ["Wichtiger als ein langer MTTF ist ein kurzer MTTR.", true]
], ""),
M("itfa1-9", "itg-reg", "Ein österreichisches Krankenhaus speichert Patientendaten bei einem US-Hyperscaler in einem Rechenzentrum in Frankfurt. Die IT-Leitung sagt: „Die Daten liegen in der EU, also sind wir souverän.“ Welche Einwände sind berechtigt?", [
  ["Die Datenresidenz (Speicherort EU) ist erfüllt, die Datensouveränität aber nicht automatisch.", true],
  ["Über den CLOUD Act können US-Behörden Daten von US-Anbietern verlangen, auch wenn sie in der EU liegen.", true],
  ["Die EU Data Boundary ändert nichts daran, dass US-Recht für den Anbieter gilt.", true],
  ["Weil die DSGVO eine Richtlinie ist, gilt sie in Österreich erst nach Umsetzung.", false, "Die DSGVO ist eine Verordnung und gilt direkt."],
  ["Europäische Angebote wie STACKIT, IONOS oder OVHcloud wären eine mögliche Alternative.", true]
], ""),
M("itfa1-10", "itg-faas", "Ein Webshop soll nach jeder Bestellung eine Bestätigungsmail schicken und jede Nacht um 2 Uhr einen Verkaufsbericht erstellen. Tagsüber kommen die Bestellungen sehr unregelmäßig. Warum passt Serverless (Azure Functions) gut, und was ist zu beachten?", [
  ["Die Bestellung kann eine Function per HTTP-Trigger auslösen, der Bericht per Timer-Trigger.", true],
  ["Ohne Aufrufe skaliert Serverless auf null, es entstehen dann keine Rechenkosten.", true],
  ["Nach längerer Pause kann ein Cold Start die erste Ausführung verzögern.", true],
  ["Functions eignen sich besonders für Jobs, die viele Stunden am Stück laufen.", false, "Ausführungszeitlimits."],
  ["Serverless bringt eine starke Bindung an die Plattform (Lock-in) mit sich.", true]
], ""),
M("itfa1-11", "itg-workload", "Eine Steuerberatungs-Software in den USA hat fast das ganze Jahr wenig Last, aber kurz vor dem 15. April eine riesige Spitze. Welche Aussagen treffen zu?", [
  ["Das ist ein Industry-specific Workload Pattern.", true],
  ["On-premises reicht eine Kapazität für den Durchschnitt, die Spitze fällt nicht ins Gewicht.", false],
  ["Gerade hier bringt die Elastizität der Cloud wenig, weil die Last statisch ist.", false],
  ["In der Cloud kann die Kapazität dem Bedarf folgen.", true],
  ["Das p/a-Verhältnis liegt bei etwa 1.", false, "Spitze weit über dem Durchschnitt → p/a hoch."]
], ""),
M("itfa1-12", "itg-virt", "Ein Team betreibt zehn kleine Microservices. Jeder läuft heute in einer eigenen VM mit eigenem Betriebssystem, die Server sind kaum ausgelastet. Was spricht für Container?", [
  ["Container teilen sich den Kernel des Hosts und booten kein eigenes Betriebssystem.", true],
  ["Container haben kleinere Deployment Units und sparen Ressourcen.", true],
  ["Container brauchen eine Container-Runtime auf Bare Metal oder in einer VM.", true],
  ["Container sind laut Vorlesung der de-facto-Standard moderner Softwareentwicklung.", true],
  ["Container laufen ganz ohne Betriebssystem auf der Hardware.", false]
], ""),

/* ================= V2 · Azure-Architektur ================= */
M("itfa2-1", "itv-region", "Ein Wiener Onlineshop hat fast nur Kunden in Österreich und muss Daten in der EU halten. Er überlegt, seine Ressourcen in „East US“ anzulegen, weil das dort etwas billiger ist. Was ist dazu richtig?", [
  ["Man sollte eine Region nahe bei den Kunden wählen, damit die Latenz gering bleibt.", true],
  ["Compliance und Data Residency sprechen für eine Region in der Geography Europe.", true],
  ["East US hat für österreichische Kunden die gleiche Latenz wie West Europe.", false],
  ["Die Region wird einmal pro Microsoft-Konto festgelegt und gilt für alle Ressourcen.", false],
  ["Region Pairs liegen immer im selben Rechenzentrum.", false, "Mindestens 300 Meilen auseinander."]
], ""),
M("itfa2-2", "itv-az", "Ein Unternehmen betreibt eine wichtige Anwendung auf zwei VMs. Fällt ein ganzes Rechenzentrum in West Europe aus, soll die Anwendung trotzdem weiterlaufen. Welche Lösung und welche Aussagen passen?", [
  ["Die beiden VMs in verschiedene Availability Zones verteilen.", true],
  ["Mit VMs über Availability Zones gibt Microsoft ein SLA von 99,99 %.", true],
  ["Ein Availability Set (99,95 %) schützt genauso gut vor dem Ausfall eines ganzen Rechenzentrums.", false, "Availability Sets verteilen innerhalb eines Rechenzentrums."],
  ["Eine VM ist ein zonaler Dienst: Replikation und Failover muss der Kunde selbst organisieren.", true],
  ["Zwischen den Zonen gibt es private Glasfaser mit weniger als 2 ms Round-Trip.", true]
], ""),
M("itfa2-3", "itv-rg", "Ein Team baut einen Webshop mit Web-App, Datenbank und Storage, die immer gemeinsam erstellt und gelöscht werden. Ein zweites, großes Unternehmen hat eigene Teams für Netzwerk, Datenbanken und VMs. Welche Strategien für Resource Groups passen?", [
  ["Für den Webshop: alles in eine Resource Group, weil alle Ressourcen denselben Lebenszyklus haben.", true],
  ["Für das große Unternehmen: Resource Groups nach Rolle, etwa eine fürs Netzwerk und eine für VMs.", true],
  ["Wird die Resource Group des Webshops gelöscht, werden alle Ressourcen darin mitgelöscht.", true],
  ["Alle Ressourcen einer Resource Group müssen in derselben Region liegen.", false, "Regionen dürfen gemischt werden."],
  ["Eine Ressource kann gleichzeitig in zwei Resource Groups liegen.", false]
], ""),
M("itfa2-4", "itv-rg", "Die Geschäftsführung will am Monatsende sehen, welche Kosten auf die Marketing-Kampagne entfallen. Die Ressourcen dafür liegen in verschiedenen Resource Groups. Was hilft?", [
  ["Den Ressourcen ein Tag wie „Projekt = Kampagne2026“ geben.", true],
  ["Tags funktionieren nur, wenn alle Ressourcen in derselben Resource Group liegen.", false],
  ["Man muss alle Ressourcen in eine neue Subscription verschieben, sonst geht es nicht.", false],
  ["Ohne Tags kann Azure gar keine Rechnung erstellen.", false],
  ["Tags ändern die Region der Ressource.", false]
], ""),
M("itfa2-5", "itv-tools", "Ein Student will auf einem Leih-Laptop ohne Installation schnell eine VM per Skript anlegen. Ein Kollege arbeitet lieber mit PowerShell-Befehlen im Verb-Nomen-Stil. Welche Aussagen sind richtig?", [
  ["Die Azure Cloud Shell läuft im Browser und braucht keine Installation.", true],
  ["Die Cloud Shell bietet Bash oder PowerShell und meldet automatisch an.", true],
  ["Die Cloud Shell braucht eine Resource Group, einen Storage Account und einen File Share.", true],
  ["In Azure PowerShell legt man eine VM mit New-AzVM an, in der Azure CLI mit az vm create.", true],
  ["Portal, CLI und PowerShell laufen alle über den Azure Resource Manager.", true]
], ""),
M("itfa2-6", "itv-green", "Ein Rechenzentrum verbraucht im Jahr 1.500 MWh, davon entfallen 1.000 MWh auf die IT-Geräte. Der Betreiber behauptet, er sei „so effizient wie ein Hyperscaler“. Was stimmt?", [
  ["Die PUE beträgt 1,5.", true],
  ["Hyperscaler erreichen eine PUE von etwa 1,1 – die Behauptung stimmt also nicht.", true],
  ["Eine PUE von 1,0 wäre das theoretische Ideal.", true],
  ["Die PUE berechnet man als IT-Energie geteilt durch Gesamtenergie.", false, "Gesamtenergie ÷ IT-Energie."],
  ["Die WUE gibt an, wie viele Liter Wasser pro kWh verbraucht werden.", true]
], ""),

/* ================= V3 · Governance & Identität ================= */
M("itfa3-1", "itv-mgmt", "Ein Konzern hat 40 Subscriptions. In allen Produktions-Subscriptions sollen VMs nur in West Europe angelegt werden dürfen, und kein Subscription-Owner soll das ändern können. Wie setzt man das am besten um?", [
  ["Die Produktions-Subscriptions in eine Management Group „Production“ legen.", true],
  ["Eine Policy „Allowed locations“ auf der Management Group zuweisen; sie wird an alle Subscriptions vererbt.", true],
  ["Der Owner einer Subscription kann die vererbte Policy jederzeit löschen.", false],
  ["Die Regel in jeder der 40 Subscriptions einzeln per RBAC-Rolle festlegen.", false, "RBAC regelt wer, Policy regelt wie."],
  ["Ein Management-Group-Baum darf höchstens zwei Ebenen tief sein.", false, "Bis zu sechs Ebenen."]
], ""),
M("itfa3-2", "itv-policy", "Ein Entwickler startet in der Test-Subscription versehentlich eine riesige GPU-VM, die über das Wochenende tausende Euro kostet. Außerdem fehlt auf vielen Ressourcen das Tag „CostCenter“. Was hilft mit Azure Policy?", [
  ["Eine Policy „Allowed virtual machine size SKUs“ erlaubt nur noch kleine VM-Größen.", true],
  ["Eine Policy kann ein Tag „CostCenter“ für jede Ressource erzwingen.", true],
  ["Mehrere solche Policies lassen sich zu einer Initiative bündeln.", true],
  ["Bestehende nicht konforme Ressourcen kann ein Remediation Task beheben.", true],
  ["Azure Policy prüft die Compliance nur ein einziges Mal beim Erstellen.", false, "Alle 24 h, neue Zuweisung nach ca. 5 min, on demand."]
], ""),
M("itfa3-3", "itv-iam", "Eine Studentin meldet sich bei einer Lern-App mit „Mit Microsoft anmelden“ an, gibt ihr Passwort und einen Code aus der Authenticator-App ein, und die App zeigt danach nur die Kurse, für die sie eingeschrieben ist. Welche Aussagen sind richtig?", [
  ["Passwort plus Authenticator-Code ist MFA, weil Wissen und Besitz kombiniert werden.", true],
  ["Die Anmeldung beim Identity Provider ist die Authentifizierung.", true],
  ["Dass sie nur ihre Kurse sieht, ist Autorisierung.", true],
  ["Die Lern-App sieht ihr Passwort nie, sie bekommt nur ein signiertes Token.", true],
  ["Die App vertraut dem Identity Provider (claim-based access).", true]
], ""),
M("itfa3-4", "itv-loa", "Eine Behörde will, dass sich Mitarbeitende für ein Steuersystem phishing-resistent mit einem kryptografischen Schlüssel anmelden, dessen privater Teil das Gerät nicht verlassen kann. Was ist richtig?", [
  ["Das entspricht AAL3 nach NIST SP 800-63-4.", true],
  ["Ein FIDO2-Sicherheitsschlüssel oder eine Smartcard erfüllt das.", true],
  ["Passwort plus SMS-Code reicht für AAL3.", false],
  ["AAL beschreibt die Prüfung des Ausweises vor Ort.", false, "Das ist IAL."],
  ["AAL3 verlangt, dass die Person persönlich beim Anbieter erscheint.", false, "Das ist IAL3."]
], ""),
M("itfa3-5", "itv-entra", "Ein Unternehmen mit 800 Mitarbeitenden hat jeden Monat rund 120 Helpdesk-Tickets wegen vergessener Passwörter. Außerdem sollen Logins aus unbekannten Ländern zusätzlich geprüft werden. Was bietet Microsoft Entra ID?", [
  ["Self-Service Password Reset (SSPR) entlastet den Helpdesk.", true],
  ["Für SSPR legt man fest, wer es nutzen darf, wie viele Methoden nötig sind, und die Benutzer registrieren sich.", true],
  ["Conditional Access ist ab Entra ID P1 enthalten.", true],
  ["Conditional Access ist im Free-Plan enthalten.", false, "Ab P1."],
  ["Risikobasierte Conditional Access und PIM gibt es mit P2.", true]
], ""),
M("itfa3-6", "itv-users", "Zum Semesterbeginn sollen 60 Tutorinnen und Tutoren als Benutzer angelegt werden, außerdem bekommt eine externe Firma Zugriff als Gäste. Nach dem Semester wird ein Tutor versehentlich gelöscht. Was stimmt?", [
  ["Viele Benutzer legt man per CSV und Schleife mit New-MgUser an.", true],
  ["Externe Personen bekommen einfach das Passwort eines bestehenden Kontos.", false],
  ["Gelöschte Benutzer sind sofort endgültig weg.", false, "30 Tage wiederherstellbar."],
  ["Zum Anlegen reicht die Azure-RBAC-Rolle Reader.", false, "Mindestens User Administrator."],
  ["Gäste müssen zuerst im lokalen Active Directory angelegt werden.", false]
], ""),
M("itfa3-7", "itv-rbac", "Die Gruppe „Support“ soll in der Resource Group rg-shop-prod VMs neu starten können, aber keine Rechte an andere vergeben und nichts außerhalb dieser Resource Group sehen. Welche Aussagen sind richtig?", [
  ["Security Principal ist die Gruppe Support.", true],
  ["Als Rolle passt Virtual Machine Contributor (oder eine eigene Rolle).", true],
  ["Als Scope wählt man die Resource Group rg-shop-prod.", true],
  ["Die Rolle gilt automatisch auch für die übergeordnete Subscription.", false, "Vererbung nur nach unten."],
  ["Owner wäre hier die passende Rolle, weil sie am wenigsten erlaubt.", false, "Least Privilege – Owner darf alles."]
], ""),
M("itfa3-8", "itv-rbac", "Ein Global Administrator in Entra ID wundert sich, dass er die VMs der Firma nicht verwalten kann. Was ist die Erklärung?", [
  ["Entra-Rollen und Azure-RBAC-Rollen sind zwei getrennte Rollensysteme.", true],
  ["Global Administrator verwaltet Benutzer, Gruppen und Apps, nicht automatisch Azure-Ressourcen.", true],
  ["Über „Elevate Access“ kann er sich zum User Access Administrator am Root (/) machen.", true],
  ["Global Administrator ist eine Azure-RBAC-Rolle auf der Subscription.", false],
  ["Er muss einen klassischen Co-Administrator anlegen.", false, "Seit 31.8.2024 nicht mehr unterstützt."]
], ""),

/* ================= V4 · Storage ================= */
M("itfa4-1", "itv-red", "MurBikes speichert Rechnungen, die sieben Jahre aufbewahrt werden müssen und sogar den Verlust der ganzen Region West Europe überstehen sollen. Der Webshop soll außerdem bei einem Regionsausfall Produktdaten weiter lesen können. Welche Entscheidungen sind richtig?", [
  ["Für die Rechnungen GZRS wählen.", true],
  ["Für die Produktdaten RA-GZRS wählen, damit man über den Secondary Endpoint lesen kann.", true],
  ["Zusätzlich Immutable Storage und Soft Delete für die Rechnungen einschalten, weil Redundanz kein Backup ist.", true],
  ["LRS reicht für die Rechnungen, weil es auch drei Kopien hat.", false, "Alle drei liegen an einem Ort."],
  ["Mit GZRS kann man ohne Failover sofort in North Europe lesen.", false, "Dafür braucht es RA-GZRS."]
], ""),
M("itfa4-2", "itv-red", "Um 10:00 fällt West Europe komplett aus. Der Storage Account von MurBikes ist GRS, die Last Sync Time steht auf 09:52. Die IT startet einen ungeplanten Failover. Was passiert?", [
  ["North Europe wird zur neuen Primärregion.", true],
  ["Schreibvorgänge zwischen 09:52 und 10:00 sind verloren.", true],
  ["Nach dem Failover ist der Account automatisch wieder GRS.", false, "Er ist LRS."],
  ["Es geht garantiert nichts verloren, weil die RPO per SLA bei 0 liegt.", false, "Typisch < 15 min, ohne SLA."],
  ["Die Daten nach 09:52 werden später automatisch nachgeliefert.", false]
], ""),
M("itfa4-3", "itv-blob", "Die Buchhaltung braucht Rechnungen vom letzten Jahr nur selten, zwei bis drei Jahre alte kaum und vier bis sieben Jahre alte praktisch nie. Nach sieben Jahren müssen sie gelöscht werden, und niemand soll daran denken müssen. Was entspricht dem Vortrag?", [
  ["Rechnungen vom letzten Jahr in Cool, zwei bis drei Jahre alte in Cold, vier bis sieben Jahre alte in Archive.", true],
  ["Eine Lifecycle-Regel als Wenn-dann-Anweisung, die die Rechnungen nach sieben Jahren automatisch löscht.", true],
  ["Die Lifecycle-Regel läuft einmal täglich; eine Änderung kann bis zu 24 Stunden brauchen, bis sie greift.", true],
  ["Rechnungen im Archive Tier sind wie in Hot sofort lesbar.", false, "Erst rehydrieren: bis 15 h, mit hoher Priorität meist < 1 h."],
  ["Alle Rechnungen bleiben am besten in Hot, weil dort das Speichern am billigsten ist.", false, "In Hot ist das Speichern am teuersten."]
], ""),
M("itfa4-4", "itv-blob", "Ein Entwickler bei MurBikes will sich nicht mehr selbst darum kümmern, welche Produktbilder in welchem Tier liegen. Manche Bilder werden monatelang nicht angesehen, dann plötzlich wieder oft. Der Account ist zonenredundant. Was gilt, wenn er Smart Tier einschaltet?", [
  ["Bilder ohne Zugriff wandern nach 30 Tagen von Hot nach Cool und nach weiteren 60 Tagen nach Cold.", true],
  ["Sobald ein Bild wieder gelesen wird, geht es sofort zurück nach Hot.", true],
  ["Es fallen keine Gebühren für Tier-Wechsel oder Abruf an, nur eine kleine Monitoring-Gebühr pro Objekt.", true],
  ["Sehr kleine Bilder unter 128 KiB bleiben einfach in Hot.", true],
  ["Nach 180 Tagen ohne Zugriff verschiebt Smart Tier die Bilder automatisch nach Archive.", false, "Smart Tier geht bis Cold."]
], "Smart Tier ist seit 14. April 2026 allgemein verfügbar und braucht einen zonenredundanten Account."),
M("itfa4-5", "itv-svc", "Die Filialen Graz und Leoben arbeiten heute mit einem Windows-Fileserver im Keller. Sie wollen die Daten zentral in Azure haben, die gewohnten Laufwerke behalten und an beiden Standorten dieselben Dateien sehen. Was passt?", [
  ["Azure Files als Dateifreigabe in der Cloud – Lift and Shift des Fileservers.", true],
  ["Azure File Sync mit einem Storage Sync Service und dem Sync Agent auf einem Windows Server pro Standort.", true],
  ["Die Server werden mit Subscription, Resource Group und Sync Service registriert.", true],
  ["Unter Windows muss zum direkten Einbinden Port 445 offen sein, sonst VPN oder File Sync.", true],
  ["Blob Storage mit flachem Namespace, weil man dort Ordner gratis verschieben kann.", false, "Verschieben heißt dort kopieren und löschen."]
], ""),
M("itfa4-6", "itv-svc", "Kunden laden in der MurBikes-App Fotos hoch. Daraus sollen Thumbnails entstehen, ohne dass die App beim Hochladen warten muss. Welche Architektur entspricht dem Beispiel aus dem Vortrag?", [
  ["Die App speichert das Foto im Blob-Container und legt dessen URL als Nachricht in eine Queue.", true],
  ["Ein Worker holt sich die URL, lädt das Foto, erzeugt das Thumbnail und speichert es in einem anderen Container.", true],
  ["Statt eines eigenen Workers kann eine Azure Function mit Queue-Trigger das Abfragen übernehmen.", true],
  ["Die Thumbnails können LRS sein, weil sie jederzeit neu erzeugt werden können.", true],
  ["Die Storage Queue pusht jede Nachricht aktiv an den Worker.", false, "Der Worker fragt die Queue ab."]
], ""),
M("itfa4-7", "itv-svc", "Für die Datenbank der Webshop-VM wird eine schnelle Disk gebraucht. Der Chef will sie zusätzlich „auf GRS stellen“, damit sie einen Regionsausfall übersteht. Was antwortest du?", [
  ["Managed Disks gibt es nur als LRS oder ZRS, nicht als GRS.", true],
  ["Für Disaster Recovery reicht es, die Disk auf Premium SSD v2 umzustellen.", false, "Site Recovery oder Backup."],
  ["Bei Premium SSD bleibt die Performance unabhängig von der Größe immer gleich.", false, "Sie wächst mit der Größe (unabhängig erst bei v2)."],
  ["Die Disk kann man einfach in einen GPv2-Account mit RA-GZRS verschieben.", false],
  ["Ein Backup ist überflüssig, weil die Disk ohnehin drei Kopien hat.", false]
], ""),
M("itfa4-8", "itv-sec", "Ein externer Lackierer soll eine Stunde lang ein einziges Foto herunterladen können. Gleichzeitig will die IT, dass die eigene Web-App nicht mehr mit den Access Keys arbeitet. Welche Vorgehensweisen sind richtig?", [
  ["Für die Web-App einen Service Principal bzw. eine Managed Identity mit RBAC verwenden.", true],
  ["Für den Lackierer eine User Delegation SAS mit Leserecht und einer Stunde Gültigkeit erstellen.", true],
  ["Die User Delegation SAS wird mit Entra-ID-Anmeldedaten signiert und gilt höchstens sieben Tage.", true],
  ["Dem Lackierer einen der beiden Access Keys schicken, weil das am einfachsten ist.", false, "Wer einen Key hat, kann alle Daten lesen."],
  ["Den Container auf anonymen Zugriff stellen, damit er an alles kommt.", false]
], ""),
M("itfa4-9", "itv-sec", "Anna ist Owner der Resource Group, in der der Storage Account liegt. Sie meldet sich mit ihrem Entra-ID-Konto an und will Blobs lesen, bekommt aber „not authorized“. Was ist richtig?", [
  ["Owner erlaubt die Verwaltung des Accounts, aber nicht automatisch das Lesen der Daten über Entra ID.", true],
  ["Sie braucht eine Datenrolle wie Storage Blob Data Reader oder Storage Blob Data Contributor.", true],
  ["Mit einem Account Key käme sie zwar an alle Daten, Keys sollte man aber nicht verwenden.", true],
  ["Owner hat zu wenig Rechte, um den Storage Account zu verwalten.", false],
  ["Der Fehler kommt, weil die Daten mit AES-256 verschlüsselt sind.", false, "Die Verschlüsselung ist transparent."]
], ""),
M("itfa4-10", "itv-sec", "Ein Mitarbeiter mit Zugriff auf den Webserver im VNet versucht, Kundendaten in seinen privaten Storage Account zu kopieren. Außerdem soll der MurBikes-Account aus dem Internet gar nicht mehr erreichbar sein. Was hilft?", [
  ["Eine Service Endpoint Policy erlaubt dem Subnetz nur Verbindungen zu den eigenen Storage Accounts.", true],
  ["Ein Private Endpoint gibt dem Storage Account eine private IP im VNet.", true],
  ["Public network access deaktivieren, dann geht aus dem Internet nichts mehr.", true],
  ["Die Firewall des MurBikes-Accounts verhindert auch das Schreiben in einen fremden Account.", false, "Sie schützt nur den eigenen Account."],
  ["Mit Private Endpoint ist der Account auch von on-prem über VPN erreichbar.", true]
], ""),
M("itfa4-11", "itv-prot", "Ransomware auf einem Büro-PC in Leoben verschlüsselt das eingebundene Azure File Share. Der Account ist GZRS. Die IT sagt: „Kein Problem, wir haben sechs Kopien.“ Was ist richtig?", [
  ["Die Aussage ist falsch: Replikation hilft gar nicht, die verschlüsselten Daten werden sofort mitrepliziert.", true],
  ["Retten können Snapshots von vorher oder ein Backup, etwa mit Azure Backup.", true],
  ["Nach der 3-2-1-Regel sollte eine Kopie an einem anderen Ort und auf einem anderen Medium liegen.", true],
  ["Ein Failover nach North Europe stellt die unverschlüsselten Dateien wieder her.", false, "Dort sind sie ebenfalls verschlüsselt."],
  ["Ein Resource Lock hätte die Verschlüsselung verhindert.", false, "Ein Lock schützt nur gegen das Löschen der Ressource."]
], "Ransomware → Backup."),
M("itfa4-12", "itv-prot", "MurBikes will 120 TB Videoarchiv aus dem Keller nach Azure bringen. Die Internetleitung hat 1 Gbit/s. Welche Überlegungen sind richtig?", [
  ["Schon 100 TB dauern über 1 Gbit/s bei voller Geschwindigkeit mehr als neun Tage.", true],
  ["Azure Data Box (Gerät von Microsoft) oder Import/Export (eigene Platten) sind sinnvoll.", true],
  ["Für kleinere Mengen kopiert AzCopy schnell über die Kommandozeile.", true],
  ["Lange nicht angesehene Archivvideos können danach per Lifecycle in kalte Tiers wandern.", true],
  ["Über 1 Gbit/s sind 120 TB in wenigen Stunden hochgeladen.", false]
], ""),
M("itfa4-13", "itv-sfund", "Ein Kollege sagt: „Block Blobs sind Block-Storage, deshalb kann ich mein Linux-Dateisystem direkt darauf anlegen.“ Was ist richtig?", [
  ["Block Blobs sind Object-Storage und werden über HTTPS und die REST-API angesprochen.", true],
  ["„Block“ bedeutet, dass Linux den Blob als /dev/sdc sieht.", false],
  ["Ein Dateisystem legt man auf einer Disk an – Page Blobs sind tatsächlich auf Block-Ebene.", true],
  ["Die Aussage stimmt: Block Blobs werden wie eine LUN formatiert.", false],
  ["Bei Block-Storage regelt das NAS, wer gleichzeitig schreibt.", false, "Block-Storage weiß nichts von Dateien."]
], ""),
M("itfa4-14", "itv-arch", "Ein kleiner Betrieb fragt, ob er für seinen Fileserver ein SAN mit Fibre Channel anschaffen soll. Was ist eine gute Antwort?", [
  ["Für eine kleine Firma ist ein SAN Overkill – Aufbau, Betrieb und Know-how sind teuer.", true],
  ["Für gemeinsame Ordner reicht ein NAS oder in der Cloud Azure Files.", true],
  ["Ein SAN liefert Blöcke (LUNs), die der Server selbst formatiert, keine Freigaben auf Datei-Ebene.", true],
  ["Ein NAS mit RAID schützt nicht vor Brand oder Blitz am Standort – ein Backup off-site bleibt nötig.", true],
  ["Ein SAN ist die einzige Möglichkeit, Dateien im Büro zu teilen.", false]
], "")
];
(X.itinf = X.itinf || []).push({ id: "itinf-mc-faelle", questions });
})();
