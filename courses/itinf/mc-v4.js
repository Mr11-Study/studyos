/* ITINF-GL · Quick-Test-Fragen V4 (Storage Fundamentals / Azure Storage) – Mehrfachauswahl, 5 Antworten, 1 bis 5 richtig.
   Nur Inhalte aus dem gesprochenen Skript vom 2.11.2026 (Folien-Details werden nicht abgefragt).
   Helfer M kommt aus mc-v1.js (window.ITINF_M). */
(function () {
const M = window.ITINF_M, X = window.STUDYOS_EXT = window.STUDYOS_EXT || {}; if (!M) return;
const questions = [
/* ---------- Einstieg, Datenarten, Block/File/Object ---------- */
M("itm4-1", "itv-sfund", "Welche Aussagen zu den Datenarten aus dem Vortrag sind richtig?", [
  ["Bei einer Datenbank ist eine Änderung der Tabelle eine Schemaänderung, die man planen muss.", true],
  ["In eine JSON-Datei kann man einfach einen Eintrag hinzufügen.", true],
  ["Auch Word-Dateien kann man zu den unstrukturierten Daten zählen.", true],
  ["80 bis 90 Prozent der Unternehmensdaten sind unstrukturiert – gemessen an der Anzahl der Dateien.", false, "Gemessen am Volumen."],
  ["YAML gilt als strukturiert, weil es eingerückt ist.", false, "JSON, XML und YAML sind halbstrukturiert."]
], "Strukturiert = Datenbank, halbstrukturiert = JSON/XML/YAML (auch CSV/Excel), unstrukturiert = Bilder, Videos, Word."),
M("itm4-2", "itv-sfund", "Welche Aussagen zu Block-Storage sind richtig?", [
  ["Er weiß nichts von Dateien, sondern besteht aus nummerierten Blöcken.", true],
  ["Man spricht ihn z. B. über SATA, NVMe, SCSI oder iSCSI an.", true],
  ["Daraus entstehen Disks, auf denen man Partitionen mit ext4, APFS oder NTFS anlegt.", true],
  ["In Azure entspricht er den Managed Disks.", true],
  ["Echte Festplatten sieht man in Azure nicht mehr.", true]
], ""),
M("itm4-3", "itv-sfund", "Was gilt laut Vortrag für Object-Storage?", [
  ["Er ist vor allem für Betriebssystem-Partitionen gedacht.", false, "Dafür nimmt man Block-Storage."],
  ["Jedes Objekt hat eine ID und kann Metadaten haben.", true],
  ["Der Zugriff läuft über HTTP(S) bzw. eine REST-API.", true],
  ["Azure Blob Storage ist S3-kompatibel.", false, "Ist es nicht – Zwischenschicht oder Code anpassen."],
  ["Er hat ein Dateisystem mit Ordnern und Sperren.", false]
], ""),
M("itm4-4", "itv-sfund", "Zwei VMs hängen an derselben Azure-Disk und ändern dieselbe Datei. Welche Aussagen stimmen?", [
  ["Einer gewinnt einfach.", true],
  ["NTFS und ext4 sind nicht dafür gebaut, von mehreren Rechnern gleichzeitig beschrieben zu werden.", true],
  ["Zum Teilen von Dateien sollte man Table Storage verwenden.", false, "Dafür nimmt man Azure Files."],
  ["Azure führt die Änderungen automatisch zusammen.", false],
  ["Das NAS in Azure sperrt die Datei automatisch.", false, "Eine Disk ist kein NAS."]
], "Dafür bräuchte es ein clusterfähiges Dateisystem."),
M("itm4-5", "itv-sfund", "Welche Aussagen zum Einstieg in die Einheit sind richtig?", [
  ["Seit 2024 braucht die Cloud Shell nicht zwingend einen Storage Account.", true],
  ["Azure Storage liegt im Shared-Responsibility-Modell am ehesten bei PaaS.", true],
  ["MurBikes hat heute einen Server im Keller, ein NAS und USB-Platten für Backups.", true],
  ["Azure Storage ist reines Software as a Service.", false, "Man liegt zwischen IaaS und SaaS."],
  ["MurBikes hat Standorte in Graz und Wien.", false, "Graz und Leoben."]
], ""),
M("itm4-6", "itv-sfund", "Ein Unternehmen wechselt von Amazon S3 zu Azure Blob Storage. Was trifft zu?", [
  ["Der Code muss angepasst werden oder man braucht eine Zwischenschicht.", true],
  ["AzCopy kann die Daten direkt von S3 nach Azure kopieren.", true],
  ["Viele andere Anbieter implementieren die S3-API, Azure aber nicht.", true],
  ["Der Wechsel ist ohne jede Änderung möglich.", false],
  ["Die Daten muss man zuerst auf USB-Platten kopieren.", false]
], ""),

/* ---------- DAS, NAS, SAN, Ceph, ZFS ---------- */
M("itm4-7", "itv-arch", "Welche Aussagen zu DAS und NAS sind richtig?", [
  ["DAS ist schnell und einfach, erzeugt aber Datensilos.", true],
  ["Ein NAS ist dafür gedacht, dass mehrere auf dieselben Dateien zugreifen.", true],
  ["Ein RAID im NAS schützt vor dem Ausfall einer einzelnen Platte.", true],
  ["Ein RAID im NAS schützt auch vor einem Blitzschlag am Standort.", false],
  ["Ein NAS kann man nur im lokalen Netz nutzen, nie von außen.", false, "Z. B. über QuickConnect."]
], ""),
M("itm4-8", "itv-arch", "MurBikes sichert sein NAS auf eine USB-Platte. Welche Hinweise aus dem Vortrag gelten?", [
  ["Man muss daran denken, die Platte regelmäßig anzustecken.", true],
  ["Man muss sie danach wieder abstecken, sonst trifft sie der Blitz gleich mit.", true],
  ["Auch USB-Platten halten nicht ewig.", true],
  ["Alternativ kann man in die Cloud des Herstellers sichern – dann zahlt man wieder.", true],
  ["Eine dauerhaft angesteckte USB-Platte ist am sichersten.", false]
], ""),
M("itm4-9", "itv-arch", "Was gilt für QuickConnect bei Synology?", [
  ["Man muss keinen Port im Router öffnen.", true],
  ["Die Daten bleiben lokal, nur der Verbindungsaufbau läuft über Server des Herstellers.", true],
  ["Für eine kleine Firma ist das sehr kostengünstig.", true],
  ["Alle Daten werden dauerhaft in die Cloud des Herstellers kopiert.", false],
  ["Es ist ein RAID-Level.", false]
], ""),
M("itm4-10", "itv-arch", "Welche Aussagen zum SAN sind richtig?", [
  ["Es ist ein eigenes Netz mit großen Storage-Arrays.", true],
  ["Server verbinden sich über Fibre Channel oder iSCSI.", true],
  ["Server sehen anfangs nur eine LUN und legen Partitionen und Dateisystem selbst an.", true],
  ["Für eine kleine Firma ist es völliger Overkill.", true],
  ["Man braucht jemanden, der sich sehr gut auskennt – immerhin liegen dort alle Daten.", true]
], ""),
M("itm4-11", "itv-arch", "Wo begegnet man LUNs in Azure?", [
  ["Jede Datendisk einer VM bekommt eine LUN-Nummer.", true],
  ["Man sieht sie im Portal bei den Disks der VM.", true],
  ["Bei jedem Blob als Teil des Namens.", false],
  ["In der Last Sync Time.", false],
  ["Als Partition Key in Table Storage.", false]
], ""),
M("itm4-12", "itv-arch", "Welche Aussagen zu Ceph sind richtig?", [
  ["Es macht aus den lokalen Platten vieler Server einen gemeinsamen Speicher.", true],
  ["Die Daten werden in der Regel dreimal auf verschiedene Server verteilt.", true],
  ["Fällt ein Server aus, repliziert Ceph selbstständig neu.", true],
  ["Es bietet Block-, File- und Object-Zugriff.", true],
  ["Es wird z. B. in Proxmox eingesetzt, einer Plattform auf Basis von KVM.", true]
], "Alle fünf Aussagen stammen aus dem Vortrag."),
M("itm4-13", "itv-arch", "Welche Aussagen zu ZFS sind richtig?", [
  ["Es ist Dateisystem und Volume-Manager in einem.", true],
  ["Es erkennt über Prüfsummen beschädigte Blöcke und repariert sie.", true],
  ["Es ist ein S3-kompatibler Cloud-Dienst von Microsoft.", false],
  ["Es braucht zwingend ein Hardware-RAID.", false, "Es ersetzt das Hardware-RAID durch Software."],
  ["Es kann keine Snapshots anlegen.", false, "Sehr schnelle Snapshots sind eine Stärke."]
], ""),
M("itm4-14", "itv-arch", "Welche Zuordnungen aus dem Quick Check sind richtig?", [
  ["Gemeinsamer Ordner für Graz und Leoben → File-Storage (NAS oder Azure Files)", true],
  ["Datenbank mit hohem Durchsatz → Server direkt mit einer Disk verbinden", true],
  ["Produktfotos für den Webshop → Blob Storage", true],
  ["Kamera-Aufnahmen, nach 72 h weg → Blob mit Lifecycle-Regel", true],
  ["Kamera-Aufnahmen → Queue Storage", false]
], ""),

/* ---------- Storage Account ---------- */
M("itm4-15", "itv-sa", "Welche Dienste bietet ein Storage Account?", [
  ["Blobs", true], ["Files", true], ["Queues", true], ["Tables", true],
  ["Azure SQL Database", false, "Eigener Dienst."]
], ""),
M("itm4-16", "itv-sa", "Was sagt der Vortrag zu Datenbanken und Table Storage?", [
  ["Table Storage ist die Schmalspur-Variante.", true],
  ["Cosmos DB kann man SQL-ähnlich abfragen, obwohl keine SQL-Tabelle dahinter steht.", true],
  ["Betreibt man MySQL auf einer VM, legt man die Datenbankdateien sinnvollerweise auf eine eigene Managed Disk.", true],
  ["Azure SQL Database ist Teil des Storage Accounts.", false],
  ["Mit Table Storage kann man Daten SQL-ähnlich abfragen.", false]
], ""),
M("itm4-17", "itv-sa", "Welche Aussagen zu Name und Endpoints sind richtig?", [
  ["Der Name muss weltweit eindeutig sein.", true],
  ["Aus dem Namen wird eine Subdomain wie name.blob.core.windows.net.", true],
  ["Jeder der vier Dienste hat eine eigene Subdomain.", true],
  ["Eine eigene Domain geht über einen CNAME; für HTTPS braucht man zusätzlich Front Door oder ein CDN.", true],
  ["Der Name muss nur in der Resource Group eindeutig sein.", false]
], ""),
M("itm4-18", "itv-sa", "Welche Zuordnungen von Schicht zu Aufgabe sind richtig?", [
  ["Partition Layer → prüft, wer zugreifen darf", false],
  ["Partition Layer → asynchrone Replikation in eine zweite Region", true],
  ["Stream Layer → asynchrone Replikation in die zweite Region", false],
  ["Stream Layer → Authentifizierung", false],
  ["Front-end Layer → Daten auf Festplatten schreiben", false]
], ""),
M("itm4-19", "itv-sa", "Welche Aussagen zu den Account-Typen sind richtig?", [
  ["Standard General Purpose v2 enthält alle vier Dienste und den Data Lake Store.", true],
  ["Premium-Typen bieten Queue und Table nicht mehr.", true],
  ["Den Typ kann man später nicht mehr ändern.", true],
  ["General Purpose v1 ist der empfohlene Standard ab 2026.", false, "Seit Sept. 2026 keine Neuanlage, Okt. 2026 migriert."],
  ["Premium bietet alle Dienste, nur schneller.", false]
], ""),
M("itm4-20", "itv-sa", "Welche Aussagen zu Standard und Premium sind richtig?", [
  ["Bei Standard liegen die Daten auf HDDs.", true],
  ["Bei Standard zahlt man gespeicherte Daten und Transaktionen.", true],
  ["Bei Premium bezahlt man reservierten Platz, auch wenn er leer ist.", true],
  ["Bei Premium wachsen die IOPS mit der Größe.", true],
  ["Premium ist kostenlos, solange man ihn nicht nutzt.", false]
], ""),
M("itm4-21", "itv-sa", "Warum kostet der Storage Account der Cloud Shell fast nichts?", [
  ["Er ist ein Standard-Account mit verbrauchsabhängiger Abrechnung.", true],
  ["Er ist ein Premium-Account mit reserviertem Platz.", false, "Bei Premium würde reservierter Platz bezahlt."],
  ["Ohne Nutzung gibt es keine Transaktionen.", true],
  ["Microsoft schenkt Studierenden alle Storage Accounts.", false],
  ["Er liegt im Archive Tier.", false]
], ""),

/* ---------- Redundanz ---------- */
M("itm4-22", "itv-red", "Welche Aussagen zu LRS sind richtig?", [
  ["Die Daten liegen auf drei verschiedenen Disks an einem physischen Ort.", true],
  ["Es schützt gegen den Ausfall einer Platte oder eines Racks.", true],
  ["Es ist günstiger als die anderen Varianten.", true],
  ["Es schützt gegen ein Ereignis im ganzen Rechenzentrum.", false],
  ["Die Kopien liegen in drei Regionen.", false]
], ""),
M("itm4-23", "itv-red", "Welche Aussagen zu ZRS sind richtig?", [
  ["Die drei Kopien liegen in drei verschiedenen Availability Zones.", true],
  ["Die Kopien liegen in zwei verschiedenen Regionen.", false],
  ["Fällt eine ganze Zone aus, macht das nichts.", true],
  ["ZRS übersteht auch ein Erdbeben, das die ganze Region trifft.", false],
  ["ZRS hat sechs Kopien.", false]
], ""),
M("itm4-24", "itv-red", "Welche Aussagen zu den Neunern sind richtig?", [
  ["Sie beschreiben die Wahrscheinlichkeit, dass Daten nicht unwiederbringlich verloren gehen.", true],
  ["Sie sind nicht das SLA.", true],
  ["ZRS hat einen Neuner mehr als LRS, weil die Kopien räumlich getrennt sind.", true],
  ["GRS hat 16 statt 11 Neuner.", true],
  ["Die Zahl steigt mit den weiteren Redundanzvarianten.", true]
], ""),
M("itm4-25", "itv-red", "Welche Aussagen zu GRS und RA-GRS sind richtig?", [
  ["GRS repliziert in die Paired Region, die man nicht aussuchen kann.", true],
  ["GRS hat sechs Kopien.", true],
  ["Bei GRS greift man nur über die Primärregion zu.", true],
  ["Bei RA-GRS kann man bei Ausfall der Primärregion in der Sekundärregion lesen, aber nicht schreiben.", true],
  ["Bei RA-GRS kann man in beiden Regionen schreiben.", false]
], ""),
M("itm4-26", "itv-red", "Welche Option verteilt in der Primärregion über Zonen UND erlaubt bei einem Regionsausfall das Lesen in der Sekundärregion?", [
  ["RA-GZRS", true], ["GZRS", false, "Ohne RA kein Lesezugriff auf die Sekundärregion."], ["ZRS", false, "Keine Sekundärregion."],
  ["RA-GRS", false, "Primär nur LRS, keine Zonen."], ["LRS", false]
], "GZRS: primär über Zonen, sekundär LRS; RA = lesbar."),
M("itm4-27", "itv-red", "Welche Aussagen zu synchron und asynchron sind richtig?", [
  ["Bei LRS und ZRS kommt 201 erst, wenn alle drei Kopien geschrieben sind.", true],
  ["Bei GRS kommt 201 nach den lokalen Kopien, die Replikation in die Sekundärregion ist asynchron.", true],
  ["Microsoft gibt typisch unter 15 Minuten an, garantiert ist aber nichts.", true],
  ["Fällt genau in der Zwischenzeit die Primärregion aus, hat man drüben einen älteren Stand.", true],
  ["Bei GRS wird synchron in beide Regionen geschrieben.", false]
], ""),
M("itm4-28", "itv-red", "In der Moodle-Simulation fällt bei einem LRS-Account eine ganze Zone aus. Was passiert?", [
  ["Man bekommt 503.", true],
  ["Man bekommt 201, weil zwei Kopien übrig sind.", false, "Das gilt beim Ausfall eines Racks."],
  ["Microsoft schaltet sofort auf die Paired Region um.", false],
  ["Die Daten werden aus Archive rehydriert.", false],
  ["Nichts, LRS ist zonenredundant.", false]
], ""),
M("itm4-29", "itv-red", "Welche Aussagen zu Durability und Availability sind richtig?", [
  ["Availability steht im SLA.", true],
  ["Durability heißt, dass die Daten gespeichert bleiben.", true],
  ["99,9 % pro Monat sind bis zu 43 Minuten ohne Zugriff.", true],
  ["Die vielen Neuner stehen im SLA.", false, "Die Neuner sind die Durability."],
  ["Wird das SLA verletzt, garantiert Microsoft, dass keine Daten fehlen.", false, "Man bekommt nur Geld zurück."]
], ""),
M("itm4-30", "itv-red", "Welche Aussagen zu RPO und Last Sync Time sind richtig?", [
  ["Die RPO ist die Zeitspanne an Daten, die man verliert.", true],
  ["Bei GRS ist die RPO der Abstand, bis die Sekundärregion denselben Stand hat.", true],
  ["Mit RA-GRS kann man die Last Sync Time über den -secondary-Endpoint abfragen.", true],
  ["Die RPO ist die Zeit, bis das System wieder läuft.", false, "Das ist die RTO."],
  ["Je seltener man sichert, desto kleiner die RPO.", false]
], ""),
M("itm4-31", "itv-red", "Welche Aussagen zum Failover sind richtig?", [
  ["Ein Microsoft-managed Failover kommt nur bei einer Katastrophe, die eine ganze Region betrifft.", true],
  ["Beim Microsoft-managed Failover entscheidet Microsoft über den Zeitpunkt.", true],
  ["Beim geplanten Failover sind beide Regionen gesund, es geht nichts verloren.", true],
  ["Nach einem ungeplanten Failover ist der Account nur noch LRS.", true],
  ["Mit dem Microsoft-managed Failover sollte man fest planen.", false]
], ""),
M("itm4-32", "itv-red", "Welche MurBikes-Entscheidungen aus dem Vortrag sind richtig?", [
  ["Produktfotos → ZRS", true],
  ["Rechnungen → GZRS", true],
  ["Thumbnails → LRS", true],
  ["Rechnungen → LRS, weil sie ohnehin im Archive liegen", false],
  ["Thumbnails → RA-GZRS, weil sie im Shop am sichtbarsten sind", false]
], ""),
M("itm4-33", "itv-red", "Welche Aussagen zu Region und Datenschutz sind richtig?", [
  ["Nicht jede Region bietet jede Redundanzoption.", true],
  ["ZRS braucht Availability Zones, GRS eine Paired Region.", true],
  ["Der US CLOUD Act bleibt auch bei Daten in Europa ein Thema.", true],
  ["Im Portal verschwindet eine nicht verfügbare Option oft einfach.", true],
  ["Mit ZRS ist jede Datenschutzfrage endgültig erledigt.", false]
], ""),

/* ---------- Blob ---------- */
M("itm4-34", "itv-blob", "Welche Aussagen zu Containern und Zugriff sind richtig?", [
  ["Für Blobs braucht man auf jeden Fall einen Container.", true],
  ["Anonymer Zugriff ist standardmäßig deaktiviert.", true],
  ["Videos kann man verlinken und direkt streamen.", true],
  ["Account Keys sollte man eher nicht verwenden, weil man damit alles auslesen kann.", true],
  ["Ein Account darf höchstens einen Container haben.", false]
], ""),
M("itm4-35", "itv-blob", "Welche Aussagen zu den Blob-Typen sind richtig?", [
  ["Ein Block Blob ist trotz des Namens Object-Storage.", true],
  ["Block Blobs sind für VM-Disks gedacht.", false, "Dafür nimmt man Page Blobs."],
  ["Mit Page Blobs ist man auf Block-Ebene und kann daraus eine Disk machen.", true],
  ["Block Blobs sind Block-Storage wie eine Festplatte.", false],
  ["Append Blobs eignen sich für VM-Disks.", false]
], ""),
M("itm4-36", "itv-blob", "Welche Aussagen zum flachen Namespace und zum Data Lake sind richtig?", [
  ["Im flachen Namespace ist ein „Ordner“ einfach Teil des Dateinamens.", true],
  ["Verschieben heißt im flachen Namespace kopieren und löschen.", true],
  ["Der Data Lake bietet echte Verzeichnisse und ACLs auf jeder Ebene.", true],
  ["Den Data Lake muss man beim Anlegen festlegen.", true],
  ["„Verzeichnis anlegen“ im Portal erzeugt immer ein POSIX-Verzeichnis.", false]
], ""),
M("itm4-37", "itv-blob", "Welche Aussagen zu den Access Tiers sind richtig?", [
  ["In Hot ist das Speichern am teuersten, der Zugriff am günstigsten.", true],
  ["Je kälter der Tier, desto billiger das Speichern und desto teurer der Zugriff.", true],
  ["Archive-Daten muss man vor dem Lesen rehydrieren.", true],
  ["Rehydrieren dauert mit normaler Priorität bis zu 15 Stunden.", true],
  ["Mit hoher Priorität geht es bei kleineren Objekten meist unter einer Stunde.", true]
], ""),
M("itm4-38", "itv-blob", "Welche Tier-Zuordnungen für MurBikes nennt der Vortrag?", [
  ["Produktfotos → Hot", true],
  ["Rechnungen vom letzten Jahr → Cool", true],
  ["Rechnungen, zwei bis drei Jahre alt → Cold", true],
  ["Rechnungen, vier bis sieben Jahre alt → Archive", true],
  ["Produktfotos → Archive", false]
], ""),
M("itm4-39", "itv-blob", "Welche Aussagen zu Smart Tier sind richtig?", [
  ["Seit 14. April 2026 allgemein verfügbar", true],
  ["Kein Zugriff: nach 30 Tagen Hot → Cool, nach weiteren 60 Tagen → Cold", true],
  ["Jeder Zugriff holt die Daten sofort nach Hot zurück.", true],
  ["Objekte unter 128 KiB bleiben in Hot.", true],
  ["Es funktioniert mit jedem LRS-Account.", false, "Voraussetzung: zonenredundanter Account."]
], ""),
M("itm4-40", "itv-blob", "Welche Gebühren fallen bei Smart Tier an?", [
  ["Eine kleine Monitoring-Gebühr pro Objekt", true],
  ["Gebühren für vorzeitiges Löschen", false],
  ["Gebühren für den Tier-Wechsel", false],
  ["Abrufgebühren", false],
  ["Eine Rehydrierungsgebühr beim Zurück nach Hot", false]
], ""),
M("itm4-41", "itv-blob", "Welche Aussagen zu Lifecycle-Regeln sind richtig?", [
  ["Sie sind im Prinzip Wenn-dann-Anweisungen.", true],
  ["Sie können Daten verschieben oder löschen.", true],
  ["Man kann sie im Portal oder in JSON definieren.", true],
  ["Sie laufen einmal täglich; Änderungen können bis zu 24 Stunden brauchen.", true],
  ["Man kann festlegen, dass Rechnungen nach sieben Jahren gelöscht werden.", true]
], ""),
M("itm4-42", "itv-blob", "Welche Aussagen zu Pricing und Object Replication sind richtig?", [
  ["Standard ist verbrauchsabhängig, Premium und Managed Disks sind provisioniert.", true],
  ["Auch Tier-Wechsel zwischen Hot und Cool kosten.", true],
  ["Der Moodle-Rechner ist nur fürs Gefühl, echte Kosten liefert der Azure Pricing Calculator.", true],
  ["Object Replication kann Blobs auch in andere Regionen als die Paired Region replizieren.", true],
  ["Bei viel Lesezugriff ist Cold immer am billigsten.", false, "Bei viel Zugriff werden die kalten Tiers immer teurer."]
], ""),

/* ---------- Files, Queue, Table, Disks ---------- */
M("itm4-43", "itv-svc", "Welche Aussagen zu Azure Files sind richtig?", [
  ["Es ist ein typisches Lift-and-Shift-Szenario für den Fileserver im Keller.", true],
  ["Es unterstützt SMB und NFS, NFS nur bei Premium File Shares.", true],
  ["Unter Windows muss zum Einbinden Port 445 offen sein.", true],
  ["Bei File-Shares arbeitet man mit Snapshots statt mit Versionierung.", true],
  ["Ein Video für die Website gehört besser in Azure Files als in Blob.", false]
], ""),
M("itm4-44", "itv-svc", "Was braucht man für Azure File Sync?", [
  ["Einen Storage Sync Service in Azure", true],
  ["Einen oder mehrere Windows Server mit Sync Agent", true],
  ["Port 445 muss in jeder Filiale gesperrt sein", false],
  ["Ein SAN mit Fibre Channel", false],
  ["Einen Append Blob pro Standort", false]
], ""),
M("itm4-45", "itv-svc", "Welche Aussagen zum Thumbnail-Beispiel mit Queue Storage sind richtig?", [
  ["Die Web-App speichert das große Foto in einem Blob-Container.", true],
  ["In die Queue kommt die HTTPS-URL des Fotos.", true],
  ["Ein Worker holt sich die URL, macht das Thumbnail und speichert es in einem anderen Container.", true],
  ["Die Storage Queue pusht die Nachricht aktiv an den Worker.", false, "Der Worker fragt ab – oder eine Azure Function mit Queue-Trigger."],
  ["In die Queue kommt das ganze Foto als Nachricht.", false]
], ""),
M("itm4-46", "itv-svc", "Welche Dienste nennt der Vortrag als leistungsfähigere Alternativen zu Queue Storage?", [
  ["Service Bus", true], ["Event Grid", true], ["Event Hubs", true],
  ["Table Storage", false], ["Azure Files", false]
], "Queue Storage ist einfach die simpelste Lösung."),
M("itm4-47", "itv-svc", "Welche Aussagen zu Table Storage sind richtig?", [
  ["Es ist ein NoSQL-Speicher für Key-Value-Paare.", true],
  ["Er ist eine relationale SQL-Datenbank.", false],
  ["Partition Key und Row Key müssen gemeinsam eindeutig sein.", true],
  ["Von 255 Properties stehen 252 frei zur Verfügung.", true],
  ["Jeder Eintrag muss exakt dieselben Felder haben.", false]
], ""),
M("itm4-48", "itv-svc", "Welche Aussagen zu Managed Disks sind richtig?", [
  ["Es gibt sie als LRS oder ZRS, aber nicht geo-redundant.", true],
  ["Ein Backup sollte man trotzdem auf jeden Fall machen.", true],
  ["Azure Site Recovery repliziert ganze VMs in eine andere Region.", true],
  ["Wegen ZRS braucht man kein Backup.", false],
  ["Es gibt nur einen einzigen Disk-Typ.", false, "Von HDD über SSD-Varianten bis Ultra Disk."]
], ""),

/* ---------- Security & Netzwerk ---------- */
M("itm4-49", "itv-sec", "Welche Aussagen zur Verschlüsselung sind richtig?", [
  ["Der Speicher wird immer automatisch mit AES-256 verschlüsselt.", true],
  ["Man kann die Verschlüsselung nicht abschalten.", true],
  ["Man muss seinen Code dafür nicht anpassen.", true],
  ["Customer-managed Keys legt man in einem Azure Key Vault ab.", true],
  ["Azure Disk Encryption ist ab 2028 der empfohlene Weg.", false, "Sie wird im September 2028 eingestellt; es gibt Encryption at Host."]
], ""),
M("itm4-50", "itv-sec", "Welche Aussagen zu Rollen beim Storage Account sind richtig?", [
  ["Owner darf über Entra ID automatisch alle Blob-Daten lesen.", false],
  ["Owner und Contributor erlauben die Verwaltung des Accounts.", true],
  ["Zum Lesen der Daten über Entra ID braucht man eine Datenrolle wie Storage Blob Data Reader.", true],
  ["Contributor darf automatisch alle Blobs lesen.", false],
  ["Anonymer Zugriff ist der sicherste Weg.", false]
], ""),
M("itm4-51", "itv-sec", "Welche Aussagen zu Shared Access Signatures sind richtig?", [
  ["Man gibt für eine gewisse Zeit Rechte und bekommt eine lange URL.", true],
  ["Jeder, der die URL hat, kann sie verwenden.", true],
  ["Man legt Startdatum, Enddatum, Protokoll und Berechtigungen fest.", true],
  ["Das Token ist lang, aber lesbar.", true],
  ["Die Signatur bleibt auch nach Rotation des Keys gültig.", false]
], ""),
M("itm4-52", "itv-sec", "Eine SAS ist in falsche Hände geraten. Welche Wege gibt es?", [
  ["Den Key rotieren, mit dem sie signiert wurde", true],
  ["Die Stored Access Policy ändern oder löschen, falls die SAS daran hängt", true],
  ["Den Blob nach Archive verschieben", false],
  ["Den Smart Tier abschalten", false],
  ["Gar keinen – sie gilt immer bis zum Ablauf", false]
], "Vorbeugend: User Delegation SAS (Entra ID, max. 7 Tage)."),
M("itm4-53", "itv-sec", "Welche Aussagen zur User Delegation SAS sind richtig?", [
  ["Sie wird mit Entra-ID-Anmeldedaten signiert.", true],
  ["Sie gilt höchstens sieben Tage.", true],
  ["Rotiert man den Account Key, wird sie automatisch ungültig.", false, "Sie hängt nicht am Account Key, sondern an Entra ID."],
  ["Sie wird mit dem Account Key signiert.", false],
  ["Sie gilt unbegrenzt.", false]
], ""),
M("itm4-54", "itv-sec", "Welche Aussagen zum Netzwerkzugriff sind richtig?", [
  ["Man kann den Zugriff auf bestimmte öffentliche IP-Adressen beschränken.", true],
  ["Man kann ihn auf ein bestimmtes VNet oder Subnetz beschränken.", true],
  ["Ein Private Endpoint gibt dem Account eine private IP-Adresse.", true],
  ["Mit Private Endpoint geht von außen nur noch der Zugriff über VPN.", true],
  ["Ein Account mit URL muss immer aus dem Internet erreichbar sein.", false]
], ""),
M("itm4-55", "itv-sec", "Ein bösartiger Mitarbeiter mit Zugriff auf den Webserver will Daten in seinen eigenen Storage Account kopieren. Was hilft?", [
  ["Eine Service Endpoint Policy", true],
  ["Anonymen Zugriff deaktivieren", false, "Ist schon Standard – hilft hier nicht."],
  ["Den Access Tier auf Cool stellen", false],
  ["Ein Wechsel auf GZRS", false],
  ["Eine Lifecycle-Regel", false]
], "Sie legt fest, welche Storage Accounts ein Subnetz überhaupt erreichen darf."),

/* ---------- Protection, Backup, Tools ---------- */
M("itm4-56", "itv-prot", "Welche Aussagen zu den Schutzfunktionen sind richtig?", [
  ["Soft Delete funktioniert wie ein Papierkorb.", true],
  ["Point-in-time Restore setzt die Block Blobs eines Containers auf einen Zeitpunkt zurück.", true],
  ["WORM heißt einmal schreiben, beliebig oft lesen, nie mehr ändern.", true],
  ["Ein Resource Lock schützt gegen das Löschen der Resource Group.", true],
  ["Point-in-time Restore beschreibt, wie lange eine Wiederherstellung dauert.", false]
], ""),
M("itm4-57", "itv-prot", "Welche Zuordnungen „Was hilft wogegen?“ sind richtig?", [
  ["Mitarbeiter löscht etwas → Papierkorb", true],
  ["Skript überschreibt Daten → Versionierung", true],
  ["Ransomware → Backup", true],
  ["Region fällt aus → in die andere Region wechseln", true],
  ["Ransomware → Replikation", false, "Die verschlüsselten Daten werden sofort mitrepliziert."]
], ""),
M("itm4-58", "itv-prot", "Welche Aussagen zu 3-2-1, RPO und RTO sind richtig?", [
  ["3-2-1: drei Kopien, zwei Medien, eine an einem anderen Ort", true],
  ["Backups in der Cloud kosten keinen Speicherplatz.", false],
  ["Die RTO ist die Zeit, bis das System nach dem Ausfall wieder läuft.", true],
  ["Backup um 14 Uhr, Ausfall am nächsten Tag um 13:58 → knapp 24 Stunden Datenverlust", true],
  ["Die RTO ist die Zeitspanne an verlorenen Daten.", false]
], ""),
M("itm4-59", "itv-prot", "Welche Aussagen zu den Tools sind richtig?", [
  ["Azure Storage Explorer gibt es für Mac, Linux und Windows.", true],
  ["AzCopy kopiert schnell über die Kommandozeile.", true],
  ["Bei Azure Data Box schickt Microsoft ein Gerät zum Befüllen.", true],
  ["100 TB über 1 Gbit/s dauern etwa eine Stunde.", false, "Mehr als neun Tage."],
  ["Beim Import/Export-Service schickt Microsoft immer eigene Festplatten.", false, "Dort verwendet man eigene Festplatten."]
], ""),
M("itm4-60", "itv-prot", "Welche Zuordnungen der Entscheidungshilfe sind richtig?", [
  ["Disk für eine VM → Managed Disk", true],
  ["Gemeinsamer Ordner per SMB/NFS → Azure Files", true],
  ["Nachrichten zwischen Anwendungsteilen → Queue Storage", true],
  ["Einfache Key-Value-Daten → Table Storage (oder Cosmos DB)", true],
  ["Alles andere über HTTPS → Blob Storage mit passendem Tier und Lifecycle", true]
], "Danach entscheidet man über Redundanz, Zugriff, Netzwerk und Schutzfunktionen.")
];
(X.itinf = X.itinf || []).push({ id: "itinf-mc-v4", questions });
})();
