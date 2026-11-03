/* ITINF-GL · Quick-Test-Fragen V4 (Storage Fundamentals / Azure Storage) – Mehrfachauswahl, 5 Antworten, 1 bis 5 richtig.
   Helfer M kommt aus mc-v1.js (window.ITINF_M). */
(function () {
const M = window.ITINF_M, X = window.STUDYOS_EXT = window.STUDYOS_EXT || {}; if (!M) return;
const questions = [
/* ---------- Datenarten & Block/File/Object ---------- */
M("itm4-1", "itv-sfund", "Welche Aussagen zu Datenarten sind richtig?", [
  ["Strukturierte Daten haben ein festes Schema und werden mit SQL abgefragt.", true],
  ["JSON und XML sind typische semistrukturierte Formate.", true],
  ["Fotos, Videos und PDFs sind unstrukturierte Daten.", true],
  ["Laut Folie sind rund 10–20 % der Unternehmensdaten unstrukturiert.", false, "80–90 %."],
  ["Semistrukturierte Daten brauchen immer ein vorab definiertes Tabellenschema.", false, "Sie beschreiben sich selbst über Keys/Tags."]
], "MurBikes: Bestellungen → SQL, Katalog → JSON/Table, Fotos/Rechnungen → Blob."),
M("itm4-2", "itv-sfund", "Welche Aussagen zu Block-Storage sind richtig?", [
  ["Daten liegen in gleich großen, einzeln adressierten Blöcken.", true],
  ["Der Host partitioniert die Disk und legt das Dateisystem an.", true],
  ["Typische Schnittstellen sind SMB und NFS.", false, "Das sind Dateiprotokolle."],
  ["Der Zugriff erfolgt über HTTPS-URLs mit Objekt-ID.", false, "Das ist Object-Storage."],
  ["In Azure entspricht er den Managed Disks.", true]
], "Höchste Performance und Flexibilität, weil das OS direkt mit den Blöcken arbeitet."),
M("itm4-3", "itv-sfund", "Welche Aussagen zu Object-Storage sind richtig?", [
  ["Er hat einen flachen Namespace.", true],
  ["Jedes Objekt wird über eine LUN adressiert.", false, "Über eine ID per HTTP(S)."],
  ["Der Zugriff erfolgt über HTTP(S) und eine REST-API.", true],
  ["Das NAS verwaltet Ordner und Sperren.", false, "Das ist File-Storage."],
  ["Azure Blob Storage ist vollständig S3-kompatibel.", false, "Nicht S3-kompatibel – Code anpassen oder Zwischenschicht."]
], "Beispiele: Amazon S3, Google Cloud Storage, Azure Blob Storage."),
M("itm4-4", "itv-sfund", "Welche Zuordnungen von MurBikes-Anforderung zu Speicherart sind richtig?", [
  ["Gemeinsamer Ordner für Graz und Leoben → File-Storage", true],
  ["ERP-Datenbank mit vielen IOPS → Block-Storage", true],
  ["8.000 Produktfotos im Webshop → Object-Storage", true],
  ["Kamera-Videos, 72 h aufbewahren → Blob Storage mit Lifecycle-Regel", true],
  ["Rechnungen 7 Jahre → Blob + Lifecycle + Immutability", true]
], "Quick Check der Folien."),
M("itm4-5", "itv-sfund", "Welche Zuordnungen von Speicherart zu Azure-Dienst sind richtig?", [
  ["Block-Storage → Managed Disks (Page Blobs)", true],
  ["File-Storage → Azure Files", true],
  ["Object-Storage → Blob Storage", true],
  ["Block Blobs → Block-Storage", false, "Block Blobs sind Object-Storage."],
  ["File-Storage → Table Storage", false]
], ""),
/* ---------- DAS / NAS / SAN / SDS ---------- */
M("itm4-6", "itv-arch", "Welche Aussagen zu DAS sind richtig?", [
  ["Der Speicher ist physisch und exklusiv an einen Host angeschlossen.", true],
  ["Andere Server greifen direkt ohne den Host auf die Daten zu.", false, "Exklusiver Zugriff – andere müssen über den Host."],
  ["DAS braucht immer Fibre-Channel-Switches.", false],
  ["DAS lässt sich problemlos zentral für viele Server verwalten.", false, "Keine zentrale Verwaltung."],
  ["Ein Nachteil sind Datensilos.", true]
], "Vorteile: Performance, günstig, Plug and Play."),
M("itm4-7", "itv-arch", "Welche Aussagen zu NAS sind richtig?", [
  ["Ein NAS stellt Speicher auf Datei-Ebene im IP-Netz bereit.", true],
  ["Es hat ein eigenes, meist Linux-basiertes Betriebssystem.", true],
  ["Typische Protokolle sind SMB und NFS.", true],
  ["RAID im NAS schützt auch gegen Brand und Blitzschlag am Standort.", false, "Alle Platten stehen am selben Ort."],
  ["Ein NAS liefert LUNs per Fibre Channel.", false, "Das ist ein SAN."]
], ""),
M("itm4-8", "itv-arch", "Welche Aussagen zu SAN sind richtig?", [
  ["Es ist ein eigenes Netz parallel zum LAN.", true],
  ["Es arbeitet auf Block-Ebene und stellt LUNs bereit.", true],
  ["Der Server formatiert die LUN selbst (z. B. NTFS, ext4).", true],
  ["iSCSI braucht immer eigene Glasfaser.", false, "Läuft über normales Ethernet."],
  ["Das Storage-Array kennt die Dateien auf jeder LUN.", false, "Das Array kennt nur Blöcke."]
], "Typisch: Virtualisierung, große Datenbanken."),
M("itm4-9", "itv-arch", "Welche Aussagen zu LUNs sind richtig?", [
  ["LUN steht für Logical Unit Number.", true],
  ["Eine LUN ist eine logische Disk, die ein Speichersystem einem Server präsentiert.", true],
  ["Normalerweise gilt: eine LUN – ein Server (oder ein Cluster).", true],
  ["LUN Masking und Zoning regeln, welcher Server welche LUN sieht.", true],
  ["In Azure bekommt jede Datendisk einer VM einen LUN-Slot am virtuellen SCSI-Controller.", true]
], "Alle fünf stehen so auf der Folie."),
M("itm4-10", "itv-arch", "Welche Aussagen zu Ceph und ZFS sind richtig?", [
  ["Ceph verteilt Objekte mit dem CRUSH-Algorithmus, meist in 3 Kopien.", true],
  ["Ceph bietet nur Object-Zugriff.", false, "RBD (Block), CephFS (File), RGW (Object)."],
  ["ZFS erkennt stille Datenkorruption über Prüfsummen auf jedem Block.", true],
  ["ZFS überschreibt Daten immer an Ort und Stelle.", false, "Copy-on-Write."],
  ["ZFS-Snapshots belegen sofort den vollen Platz der Daten.", false, "Nur Änderungen brauchen Platz."]
], "In der Cloud betreibt Microsoft das alles – on-prem ist es deine Aufgabe."),
M("itm4-11", "itv-arch", "Welche Zuordnungen von Protokoll zu Ebene sind richtig?", [
  ["NVMe → Block", true], ["NFS → Block", false, "NFS ist File."], ["NFS → File", true],
  ["SMB → Object", false, "SMB ist File."], ["HTTPS + REST → Object", true]
], ""),
/* ---------- Storage Account ---------- */
M("itm4-12", "itv-sa", "Welche Dienste gehören zum Storage Account?", [
  ["Azure Blobs", true], ["Azure Files", true], ["Azure Queues", true], ["Azure Tables", true],
  ["Azure SQL Database", false, "Eigener Dienst."]
], "Managed Disks sind eine eigene Ressource."),
M("itm4-13", "itv-sa", "Welche Namen sind als Storage-Account-Name gültig?", [
  ["murbikes2026", true], ["mbw", true], ["MurBikes", false, "Keine Großbuchstaben."],
  ["murbikes-web", false, "Kein Bindestrich."], ["ab", false, "Mindestens 3 Zeichen."]
], "3–24 Zeichen, nur Kleinbuchstaben und Ziffern, weltweit eindeutig."),
M("itm4-14", "itv-sa", "Welche Aussagen zu den Schichten eines Storage Stamps sind richtig?", [
  ["Der Front-end Layer authentifiziert und autorisiert Anfragen.", true],
  ["Der Partition Layer teilt Daten in Partitionen und übernimmt die asynchrone Geo-Replikation.", true],
  ["Der Stream Layer hält 3 synchrone Kopien in Extents.", true],
  ["Der Stream Layer repliziert asynchron in die Paired Region.", false, "Das macht der Partition Layer."],
  ["Der Front-end Layer speichert die Bits auf Disk.", false, "Das macht der Stream Layer."]
], "Review-Frage 3."),
M("itm4-15", "itv-sa", "Welche Aussagen zu den Account-Typen sind richtig?", [
  ["Premium-Accounts unterstützen RA-GZRS.", false, "Nur LRS und ZRS."],
  ["Premium block blobs, file shares und page blobs bieten nur LRS und ZRS.", true],
  ["Der Account-Typ lässt sich später nicht ändern (nur GPv1 → GPv2).", true],
  ["GPv1 ist ab Oktober 2026 wieder der empfohlene Standard.", false, "Verbleibende werden auf GPv2 migriert."],
  ["Premium file shares unterstützen auch Queue und Table.", false, "Ein Dienst pro Premium-Account."]
], ""),
M("itm4-16", "itv-sa", "Welche Aussagen zu Standard und Premium sind richtig?", [
  ["Standard ist SSD-basiert und provisioniert.", false],
  ["Premium ist kostenlos, wenn man die Kapazität nicht nutzt.", false, "Reserviert ist reserviert."],
  ["Bei Premium gibt es alle sechs Redundanzoptionen.", false],
  ["Bei Premium wachsen IOPS und Durchsatz mit der Kapazität.", true],
  ["Access Tiers (Hot, Cool …) gibt es nur bei Premium.", false, "Nur bei Standard GPv2 (Block Blobs)."]
], ""),
/* ---------- Redundanz ---------- */
M("itm4-17", "itv-red", "Welche Aussagen zu LRS sind richtig?", [
  ["Daten werden synchron dreimal an einem physischen Ort gespeichert.", true],
  ["LRS ist die teuerste Option.", false],
  ["LRS schützt vor Disk-, Node- und Rack-Ausfällen.", true],
  ["LRS schützt sicher vor Feuer im Rechenzentrum.", false],
  ["LRS bietet mindestens 11 Neuner Durability pro Jahr.", true]
], ""),
M("itm4-18", "itv-red", "Welche Aussagen zu ZRS sind richtig?", [
  ["Daten liegen synchron in drei Availability Zones der Primärregion.", true],
  ["ZRS übersteht den Ausfall einer Zone.", true],
  ["ZRS bietet mindestens 12 Neuner Durability.", true],
  ["Jede Zone hat eigene Stromversorgung, Kühlung und Netzwerk.", true],
  ["ZRS wird auch für Data-Governance-Anforderungen (Daten in einem Land) empfohlen.", true]
], ""),
M("itm4-19", "itv-red", "Welche Aussagen zu GRS sind richtig?", [
  ["In der Primärregion wird per ZRS gespeichert.", false, "Das ist GZRS."],
  ["In die Sekundärregion wird asynchron repliziert.", true],
  ["Insgesamt gibt es 3 Kopien.", false, "6 Kopien."],
  ["Ohne RA kann man in der Sekundärregion erst nach einem Failover lesen.", true],
  ["Die Sekundärregion kann man frei wählen.", false, "Es ist die Paired Region."]
], "16 Neuner Durability."),
M("itm4-20", "itv-red", "Welche Optionen erlauben Lesen in der Sekundärregion ohne Failover?", [
  ["RA-GRS", true], ["RA-GZRS", true], ["GRS", false], ["GZRS", false], ["ZRS", false, "Hat gar keine Sekundärregion."]
], "RA = Read Access über konto-secondary.…"),
M("itm4-21", "itv-red", "Welche Aussagen zu RPO und Last Sync Time sind richtig?", [
  ["Die typische RPO der Geo-Replikation liegt unter 15 Minuten.", true],
  ["Für die Replikationsdauer gibt es ein SLA von 15 Minuten.", false, "Es gibt kein SLA dafür."],
  ["Schreibvorgänge nach der Last Sync Time sind „at risk“.", true],
  ["Bei RA-Varianten lässt sich die Last Sync Time abfragen.", true],
  ["Bei LRS gibt es eine Last Sync Time zur Sekundärregion.", false, "LRS hat keine Sekundärregion."]
], ""),
M("itm4-22", "itv-red", "Welche Aussagen zu Durability und Availability sind richtig?", [
  ["Die Neuner (11/12/16) beschreiben die Durability.", true],
  ["Das SLA für Lesen (Hot) liegt bei LRS bei 99,9 %.", true],
  ["RA-GRS und RA-GZRS haben 99,99 % Lese-SLA (Hot).", true],
  ["99,9 % pro Monat sind bis zu 43 Minuten ohne Zugriff.", true],
  ["Das SLA bedeutet Geld zurück (Service Credits), nicht dass nichts passiert.", true]
], "Review-Frage 5."),
M("itm4-23", "itv-red", "Welche Aussagen zum Failover sind richtig?", [
  ["Beim Planned Failover sind beide Regionen gesund und es gehen keine Daten verloren.", true],
  ["Beim Unplanned Failover gehen Schreibvorgänge nach der Last Sync Time verloren.", true],
  ["Nach einem Unplanned Failover ist der Account LRS.", true],
  ["Mit einem Microsoft-managed Failover sollte man fest planen.", false, "Nur bei Regionskatastrophe, MS entscheidet."],
  ["Beim Planned Failover gehen alle Daten nach der Last Sync Time verloren.", false]
], ""),
M("itm4-24", "itv-red", "Welche MurBikes-Redundanz-Entscheidungen entsprechen der Folie?", [
  ["Produktfotos → ZRS", true], ["Rechnungen (7 Jahre) → GZRS oder GRS", true], ["Thumbnails → LRS", true],
  ["Produktdaten bei Regionsausfall lesbar → RA-GZRS", true], ["Thumbnails → RA-GZRS, weil sie am wichtigsten sind", false, "Jederzeit neu erzeugbar → LRS."]
], ""),
/* ---------- Blob ---------- */
M("itm4-25", "itv-blob", "Welche Aussagen zu Containern sind richtig?", [
  ["Alle Blobs müssen in einem Container liegen.", true],
  ["Ein Account darf höchstens 10 Container haben.", false, "Unbegrenzt."],
  ["Anonymer Zugriff ist standardmäßig deaktiviert.", true],
  ["Das Level „Container“ erlaubt anonym Lesen und Auflisten.", true],
  ["Das Level „Blob“ erlaubt anonymes Schreiben.", false, "Nur anonymes Lesen."]
], ""),
M("itm4-26", "itv-blob", "Welche Aussagen zu Blob-Typen sind richtig?", [
  ["Block Blobs sind der Normalfall für Bilder, Videos, Backups.", true],
  ["Append Blobs eignen sich für VM-Festplatten.", false, "Das sind Page Blobs."],
  ["Page Blobs arbeiten mit 512-Byte-Seiten und dienen als VM-Disks.", true],
  ["Den Blob-Typ kann man nach dem Upload ändern.", false],
  ["Page Blobs liegen auf Block-Ebene – das OS sieht eine Disk.", true]
], ""),
M("itm4-27", "itv-blob", "Welche Aussagen zum hierarchischen Namespace (Data Lake Gen2) sind richtig?", [
  ["Er bietet echte Verzeichnisse mit atomarem Umbenennen.", true],
  ["Er ist für jeden Account automatisch aktiv.", false, "Option beim Anlegen."],
  ["Er macht Blob Storage S3-kompatibel.", false],
  ["Man muss ihn beim Anlegen des Accounts aktivieren.", true],
  ["Im flachen Namespace ist Umbenennen eines Ordners ebenfalls eine atomare Operation.", false, "Kopieren + Löschen jedes Blobs."]
], ""),
M("itm4-28", "itv-blob", "Welche Mindestdauern der Access Tiers sind richtig?", [
  ["Cool: 30 Tage", true], ["Cold: 90 Tage", true], ["Archive: 180 Tage", true],
  ["Hot: 30 Tage", false, "Hot hat keine Mindestdauer."], ["Archive: 7 Tage", false]
], "Vorzeitiges Löschen/Verschieben kostet eine Early-deletion Fee."),
M("itm4-29", "itv-blob", "Welche Aussagen zum Archive Tier sind richtig?", [
  ["Er hat die niedrigsten Zugriffskosten.", false, "Die höchsten."],
  ["Er ist offline – Blobs müssen vor dem Lesen rehydriert werden.", true],
  ["Rehydrierung mit Standard-Priorität dauert bis zu 15 Stunden.", true],
  ["Lesen aus Archive dauert wie bei Hot nur Millisekunden.", false],
  ["Mit hoher Priorität geht es bei kleineren Objekten meist unter einer Stunde.", true]
], ""),
M("itm4-30", "itv-blob", "Welche Aussagen zu Smart Tier sind richtig?", [
  ["GA seit 14. April 2026", true],
  ["Nach 30 Tagen ohne Zugriff Hot → Cool, nach weiteren 60 Tagen → Cold", true],
  ["Ein Zugriff holt den Blob zurück nach Hot.", true],
  ["Smart Tier verschiebt nach 180 Tagen automatisch nach Archive.", false, "Nur bis Cold."],
  ["Voraussetzung ist ein zonenredundanter Account.", true]
], "Keine Early-deletion-Gebühr, nur Monitoring; < 128 KiB bleibt Hot."),
M("itm4-31", "itv-blob", "Welche Aussagen zu Lifecycle Management sind richtig?", [
  ["Regeln können Blobs in kühlere Tiers verschieben und löschen.", true],
  ["Regeln filtern nur nach Dateigröße.", false, "Präfix oder Index Tags."],
  ["Regeln können nur löschen, nicht den Tier ändern.", false],
  ["Die Regeln laufen einmal täglich; Änderungen können bis zu 24 h dauern.", true],
  ["Regeln greifen sofort in derselben Sekunde.", false]
], "MurBikes: invoices 30/365/1095/2600 Tage, cctv löschen > 3 Tage."),
M("itm4-32", "itv-blob", "Welche Aussagen zu den Kosten sind richtig?", [
  ["Je kühler der Tier, desto niedriger die Speicher- und höher die Zugriffskosten.", true],
  ["Transaktionen sind in Cool kostenlos.", false],
  ["Hot → Cool verursacht Lesegebühren.", false, "Schreibgebühren; Cool → Hot Lesegebühren."],
  ["Geo-Replikation ist immer kostenlos.", false],
  ["Tier-Wechsel sind immer kostenlos.", false]
], ""),
/* ---------- Files, Queue, Table, Disks ---------- */
M("itm4-33", "itv-svc", "Welche Aussagen zu Azure Files sind richtig?", [
  ["Zugriff über SMB 3.x und NFS 4.1 (NFS nur Premium)", true],
  ["Typisch für Lift and Shift eines Fileservers", true],
  ["Unter Windows muss Port 445 offen sein.", true],
  ["Share Snapshots sind beschreibbar.", false, "Read-only."],
  ["Ein Video für die Website liegt besser in Blob Storage als in Files.", true]
], ""),
M("itm4-34", "itv-svc", "Welche Aussagen zu Azure File Sync sind richtig?", [
  ["Der Storage Sync Service ist die oberste Ressource.", true],
  ["Der Agent läuft auf Windows Server.", true],
  ["Ein Cloud Endpoint ist ein Azure File Share.", true],
  ["Der Registered Server ist ein Azure File Share.", false, "Das ist der Cloud Endpoint."],
  ["Eine Sync Group legt fest, welche Benutzer Owner sind.", false, "Welche Dateien synchron bleiben."]
], ""),
M("itm4-35", "itv-svc", "Welche Aussagen zu Queue Storage sind richtig?", [
  ["Nachrichten sind bis zu 64 KiB groß.", true],
  ["Sie entkoppelt Anwendungskomponenten asynchron.", true],
  ["Eine Queue kann Millionen Nachrichten enthalten.", true],
  ["Die Queue pusht Nachrichten aktiv an den Worker.", false, "Der Worker pollt; eine Azure Function mit Queue-Trigger übernimmt das."],
  ["Für Enterprise-Messaging gibt es mit Service Bus eine leistungsfähigere Alternative.", true]
], ""),
M("itm4-36", "itv-svc", "Welche Aussagen zu Table Storage sind richtig?", [
  ["NoSQL Key-Value, schemalos", true],
  ["Eine Entity ist maximal 1 MB groß.", true],
  ["Von 255 Properties sind 252 frei nutzbar.", true],
  ["PartitionKey und RowKey müssen gemeinsam eindeutig sein.", true],
  ["Table Storage ist meist günstiger als eine SQL-Datenbank.", true]
], "Reserviert: PartitionKey, RowKey, Timestamp."),
M("itm4-37", "itv-svc", "Welche Aussagen zu Managed Disks sind richtig?", [
  ["Man muss für jede Disk einen Storage Account selbst verwalten.", false],
  ["Technisch steckt ein Append Blob dahinter.", false],
  ["Es gibt sie als LRS oder ZRS – aber nicht als GRS.", true],
  ["Regionsübergreifendes DR macht man mit Azure Site Recovery oder Azure Backup.", true],
  ["Bei Premium SSD kann man eine Disk verkleinern.", false, "Kann wachsen, nicht schrumpfen."]
], ""),
M("itm4-38", "itv-svc", "Welche Zuordnungen von Disk-Typ zu Einsatz sind richtig?", [
  ["Ultra Disk → SAP HANA, Latenz unter 1 ms", true], ["Premium SSD v2 → Größe, IOPS, Durchsatz unabhängig", true],
  ["Standard SSD → Webserver, Dev/Test", true], ["Standard HDD → Backups, seltener Zugriff", true],
  ["Standard HDD → Top-Datenbanken", false]
], ""),
/* ---------- Security ---------- */
M("itm4-39", "itv-sec", "Welche Aussagen zur Autorisierung sind richtig?", [
  ["Entra ID + RBAC ist die empfohlene Methode.", true],
  ["Eine User Delegation SAS ist mit Entra-ID-Anmeldedaten signiert und gilt höchstens 7 Tage.", true],
  ["Eine Service SAS wird mit dem Account Key signiert.", true],
  ["Shared Key sollte möglichst deaktiviert werden.", true],
  ["Anonymer Zugriff ist bei neuen Accounts standardmäßig aktiv.", false]
], "Review-Frage 7."),
M("itm4-40", "itv-sec", "Wie kann man eine Service SAS widerrufen, die in falsche Hände geraten ist?", [
  ["Die Stored Access Policy ändern oder löschen, an der sie hängt", true],
  ["Den Account Key rotieren, mit dem sie signiert wurde", true],
  ["Den Blob in Archive verschieben", false],
  ["Gar nicht, sie gilt immer bis zum Ablauf", false, "Mit Policy oder Key-Rotation geht es."],
  ["Die Smart-Tier-Option deaktivieren", false]
], "Key-Rotation macht alle SAS dieses Keys ungültig."),
M("itm4-41", "itv-sec", "Welche Aussagen zu Control Plane und Data Plane sind richtig?", [
  ["Owner und Contributor gehören zur Control Plane.", true],
  ["Storage Blob Data Reader und Contributor gehören zur Data Plane.", true],
  ["Owner auf der Resource Group reicht für Datenzugriff mit Entra ID nicht aus.", true],
  ["Contributor darf über Entra ID automatisch alle Blobs lesen.", false],
  ["Im Lab weist man sich Storage Blob Data Contributor zu.", true]
], ""),
M("itm4-42", "itv-sec", "Welche Aussagen zur Verschlüsselung sind richtig?", [
  ["SSE verschlüsselt mit AES-256.", true],
  ["SSE ist für alle Accounts aktiv und kann nicht deaktiviert werden.", true],
  ["Customer-managed Keys liegen in Azure Key Vault oder Managed HSM.", true],
  ["Customer-managed Keys liegen im Blob-Container selbst.", false, "In Key Vault / Managed HSM."],
  ["SSE erfordert, dass man den Anwendungscode anpasst.", false, "Transparent."]
], ""),
M("itm4-43", "itv-sec", "Welche Aussagen zum Netzwerkzugriff sind richtig?", [
  ["Mit einem Service Endpoint läuft der Verkehr über den Azure-Backbone, der Account behält eine öffentliche IP.", true],
  ["Ein Private Endpoint gibt dem Account eine private IP im VNet.", true],
  ["Ein Service Endpoint gibt dem Account eine private IP.", false, "Das macht der Private Endpoint."],
  ["Firewall-VNets dürfen in jeder beliebigen Region liegen.", false, "Gleiche Region oder Region Pair."],
  ["Ein Storage Account mit URL muss immer aus dem Internet erreichbar sein.", false]
], ""),
/* ---------- Data Protection & Tools ---------- */
M("itm4-44", "itv-prot", "Welche Funktionen schützen gegen versehentliches Löschen oder Ransomware?", [
  ["Soft Delete", true], ["Versionierung", true], ["Immutable Storage (WORM)", true], ["Azure Backup (vaulted)", true],
  ["GZRS allein", false, "Redundanz ist kein Backup."]
], "Review-Frage 8."),
M("itm4-45", "itv-prot", "Welche Aussagen zum Datenschutz sind richtig?", [
  ["Soft Delete hält Gelöschtes höchstens 24 Stunden.", false, "1–365 Tage."],
  ["Point-in-time Restore braucht Versionierung, Change Feed und Soft Delete.", true],
  ["Bei Immutable Storage kann ein Admin jederzeit löschen.", false],
  ["Versionierung schützt den Account vor dem Löschen.", false, "Dafür gibt es Locks."],
  ["Snapshots sind beschreibbare Kopien.", false, "Read-only."]
], ""),
M("itm4-46", "itv-prot", "Welche Aussagen zur 3-2-1-Regel sind richtig?", [
  ["3 Kopien der Daten (Original + 2 Backups)", true],
  ["2 verschiedene Speichermedien", true],
  ["1 Kopie off-site", true],
  ["3-2-1-1-0 ergänzt eine immutable Kopie und 0 Fehler beim Restore-Test", true],
  ["3 Kopien auf derselben Platte reichen aus", false]
], ""),
M("itm4-47", "itv-prot", "Welche „Ups!“-Zuordnungen stimmen?", [
  ["Ordner gelöscht → Soft Delete", true],
  ["Skript überschreibt Fotos → Versionierung / Point-in-time Restore", true],
  ["Ransomware auf dem File Share → Share Snapshots / Azure Backup", true],
  ["Admin löscht den Account → Resource Lock", true],
  ["Region down → Soft Delete", false, "GZRS/RA-GZRS + Failover."]
], ""),
M("itm4-48", "itv-prot", "Welche Aussagen zu den Tools sind richtig?", [
  ["Storage Explorer gibt es für Windows, macOS und Linux.", true],
  ["AzCopy kann direkt von Amazon S3 nach Azure kopieren.", true],
  ["Storage Explorer gibt es nur für Windows.", false],
  ["Der Import/Export-Service kann auch aus Azure Files exportieren.", false, "Export nur aus Blobs."],
  ["100 TB über 1 Gbit/s dauern mehr als 9 Tage.", true]
], ""),
M("itm4-49", "itv-prot", "Welche Einstellungen setzt das Hands-on-Lab beim Anlegen des Accounts?", [
  ["--sku Standard_ZRS", true], ["--min-tls-version TLS1_2", true], ["--allow-shared-key-access false", true],
  ["--allow-blob-public-access false", true], ["--sku Premium_GRS", false]
], "Sicherer Account: keine Keys, kein anonymer Zugriff, zonenredundant.")
];
(X.itinf = X.itinf || []).push({ id: "itinf-mc-v4", questions });
})();
