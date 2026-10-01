/* Datenbank Anwendungsentwicklung (DB-AENT) — Klemens Konopasek, WS 2026/27 */
(function () {
const TOPICS = {
  "dba-arch":    { name: "Datenbankanwendung & Schichten",       lesson: "dba1-1" },
  "dba-zugriff": { name: "Datenzugriff aus dem Frontend",        lesson: "dba1-2" },
  "dba-server":  { name: "Client- vs. serverseitige Logik",      lesson: "dba1-3" },
  "dba-sql":     { name: "Komplexe SQL-Abfragen",                lesson: "dba2-1" },
  "dba-tsql":    { name: "T-SQL: Variablen & Kontrollstrukturen", lesson: "dba2-2" },
  "dba-cursor":  { name: "Cursor vs. Mengenoperationen",         lesson: "dba2-3" },
  "dba-sp":      { name: "Stored Procedures",                    lesson: "dba3-1" },
  "dba-tx":      { name: "Transaktionen & TRY/CATCH",            lesson: "dba3-2" },
  "dba-udf":     { name: "User-defined Functions",               lesson: "dba3-3" },
  "dba-trigger": { name: "Trigger",                              lesson: "dba4-1" },
  "dba-integ":   { name: "Deklarative vs. prozedurale Integrität", lesson: "dba4-3" },
  "dba-sec":     { name: "Indirekte Zugriffe & Berechtigungen",  lesson: "dba5-1" },
  "dba-inj":     { name: "SQL-Injection",                        lesson: "dba5-2" },
  "dba-json":    { name: "JSON im SQL Server",                   lesson: "dba5-3" },
  "dba-proc":    { name: "Vorgehensmodell & Code-Review",        lesson: "dba6-1" },
  "dba-proj":    { name: "Praxisprojekt: Backend-Wrapper",       lesson: "dba6-2" }
};
const SQL = (code) => `<pre><code>${code}</code></pre>`;

const SCHEMA = SQL(`-- Beispielschema „Webshop“ (wird in allen Lektionen verwendet)
CREATE TABLE dbo.kunde (
  kdnr   INT IDENTITY(1,1) CONSTRAINT pk_kunde PRIMARY KEY,
  name   NVARCHAR(100) NOT NULL,
  email  NVARCHAR(200) NOT NULL CONSTRAINT uq_kunde_email UNIQUE,
  aktiv  BIT NOT NULL CONSTRAINT df_kunde_aktiv DEFAULT 1
);
CREATE TABLE dbo.artikel (
  artnr       INT CONSTRAINT pk_artikel PRIMARY KEY,
  bezeichnung NVARCHAR(100) NOT NULL,
  vk          DECIMAL(10,2) NOT NULL CONSTRAINT ck_artikel_vk CHECK (vk &gt;= 0),
  ust_satz    DECIMAL(4,2) NOT NULL CONSTRAINT df_artikel_ust DEFAULT 20,
  attribute   NVARCHAR(MAX) NULL CONSTRAINT ck_artikel_json CHECK (ISJSON(attribute) = 1),
  aktiv       BIT NOT NULL CONSTRAINT df_artikel_aktiv DEFAULT 1
);
CREATE TABLE dbo.lager (
  lagernr INT CONSTRAINT pk_lager PRIMARY KEY,
  ort     NVARCHAR(50) NOT NULL
);
CREATE TABLE dbo.lagerstand (
  artnr   INT NOT NULL CONSTRAINT fk_ls_artikel REFERENCES dbo.artikel(artnr),
  lagernr INT NOT NULL CONSTRAINT fk_ls_lager   REFERENCES dbo.lager(lagernr),
  menge   INT NOT NULL CONSTRAINT ck_ls_menge CHECK (menge &gt;= 0),
  CONSTRAINT pk_lagerstand PRIMARY KEY (artnr, lagernr)
);
CREATE TABLE dbo.bestellung (
  bestnr INT IDENTITY(1,1) CONSTRAINT pk_bestellung PRIMARY KEY,
  kdnr   INT NOT NULL CONSTRAINT fk_best_kunde REFERENCES dbo.kunde(kdnr),
  datum  DATETIME2 NOT NULL CONSTRAINT df_best_datum DEFAULT SYSDATETIME()
);
CREATE TABLE dbo.bestellposition (
  bestnr INT NOT NULL CONSTRAINT fk_pos_best REFERENCES dbo.bestellung(bestnr),
  posnr  INT NOT NULL,
  artnr  INT NOT NULL CONSTRAINT fk_pos_artikel REFERENCES dbo.artikel(artnr),
  menge  INT NOT NULL CONSTRAINT ck_pos_menge CHECK (menge &gt; 0),
  preis  DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL CONSTRAINT df_pos_status DEFAULT 'offen',
  CONSTRAINT pk_bestellposition PRIMARY KEY (bestnr, posnr)
);
CREATE TABLE dbo.preis_log (
  id INT IDENTITY(1,1) PRIMARY KEY, artnr INT NOT NULL,
  vk_alt DECIMAL(10,2), vk_neu DECIMAL(10,2),
  geaendert_am DATETIME2 NOT NULL, geaendert_von SYSNAME NOT NULL
);`);

const WORLDS = [
 { id: "dbaw1", n: 1, title: "Datenbankanwendungen", sub: "DB + Applikation, Datenzugriff, Logik am Client oder Server", boss: { id: "boss-dbaw1", title: "Kapiteltest: Datenbankanwendungen", topics: ["dba-arch", "dba-zugriff", "dba-server"] }, lessons: [
  { id: "dba1-1", title: "Datenbankanwendung = DB + Applikation", topic: "dba-arch", min: 10, xp: 0, blocks: [
    { t: "lead", html: "Eine Datenbankanwendung besteht aus der <b>Datenbank</b> und der <b>Anwendung</b>, die sie nutzt. In DB-AENT baust du den Datenbankteil – verschränkt mit Mobile App Development (MAPPDEV), wo die App dazu entsteht." },
    { t: "text", h: "Server-Datenbanksysteme und Schichten", levels: {
      simple: "Die Datenbank läuft auf einem Server. Die App schickt eine Frage (SQL) hin und bekommt eine Antwort (Ergebnis) zurück. Dazwischen gibt es Schichten: Daten, Programmlogik und Benutzeroberfläche.",
      normal: "Bei einem <b>Server-DBMS</b> (SQL Server, Oracle, MySQL, MariaDB …) läuft die <b>Datenbank-Engine am Server</b>. Der Client schickt eine <b>SQL-Anfrage</b> und erhält ein <b>Ergebnis</b>. Eine Datenbankanwendung lässt sich in Schichten denken:<ul><li><b>Data Layer</b> – die Tabellen und Daten im DBMS</li><li><b>Programm Layer am Server</b> – Logik direkt in der DB (Transact-SQL, PL/SQL, .NET CLR)</li><li><b>Programm Layer am Client</b> – Logik in der Anwendung (C#, Java, Kotlin …)</li><li><b>Presentation Layer</b> – die Benutzeroberfläche</li></ul>Wo die Programmlogik liegt (Server oder Client), ist eine zentrale Architekturentscheidung dieser LV.",
      technical: "Klassische Varianten: 2-Tier (Client spricht direkt SQL mit dem DB-Server) und 3-/n-Tier (eine Middleware/API dazwischen, z. B. ein REST- oder SOAP-Service). Im Praxisprojekt ist es n-Tier: App → bereitgestellte API → DB, wobei die API nur durchreicht und die eigentliche Logik in Stored Procedures liegt. Server-DBMS unterscheiden sich von dateibasierten Systemen (z. B. Access, SQLite) durch einen eigenen Serverprozess mit Mehrbenutzerbetrieb, Transaktionsverwaltung, Rechteverwaltung und Netzwerkzugriff." } },
    { t: "html", html: `<table class="dt"><tr><th>Backend (DB)</th><th>Programmierung serverseitig</th><th>Programmierung clientseitig / Frontend</th></tr><tr><td>SQL Server, Oracle, MySQL, MariaDB, Access</td><td>Transact-SQL (SQL Server), PL/SQL (Oracle), .NET CLR</td><td>C++/C#, VB.NET, Java, Delphi, HTML mit ASP.NET, PHP …</td></tr></table>` },
    { t: "text", h: "DB-Zugriff über Schnittstellen", levels: {
      simple: "Programme reden nicht direkt mit der Datenbank, sondern über eine Schnittstelle (einen „Treiber“).",
      normal: "Frontend-Sprachen greifen über standardisierte <b>Schnittstellen</b> auf die DB zu: <b>ODBC</b> (Open Database Connectivity, sprachunabhängig), <b>JDBC</b> (Java), <b>ADO</b> bzw. <b>ADO.NET</b> (Microsoft, .NET-Sprachen wie C#/VB.NET). Über die Schnittstelle wird letztlich immer <b>SQL</b> an den Server geschickt.",
      technical: "Ein Treiber übernimmt Verbindungsaufbau (Connection String: Server, Datenbank, Authentifizierung), Übertragung der Anweisungen und Parameter (beim SQL Server über das TDS-Protokoll) und das Zurückliefern von Resultsets. Connection Pooling sorgt dafür, dass Verbindungen wiederverwendet werden." } },
    { t: "widget", w: "sorter", topic: "dba-arch", title: "Backend oder Frontend?", cats: [{ k: "b", label: "Backend / serverseitig" }, { k: "f", label: "Frontend / clientseitig" }],
      items: [{ t: "Transact-SQL-Prozedur im SQL Server", a: "b", why: "" }, { t: "PL/SQL-Package in Oracle", a: "b", why: "" }, { t: "Kotlin-Code der Mobile App", a: "f", why: "" }, { t: "Tabellen und Constraints", a: "b", why: "" }, { t: "Formular-Validierung in der App-Oberfläche", a: "f", why: "" }, { t: "Trigger auf einer Tabelle", a: "b", why: "" }, { t: "C#-Desktopanwendung mit ADO.NET", a: "f", why: "" }] },
    { t: "callout", html: "<b>Rahmen der LV:</b> 1,5 SWS (22,5 h LV), 2,5 ECTS (62,5 h Gesamtaufwand, 1 ECTS = 25 Echtstunden). DB-AENT und MAPPDEV setzen ein <b>gemeinsames Praxisprojekt</b> um; der Datenbank- und der App-Teil werden getrennt in der jeweiligen LV beurteilt." },
    { t: "check", q: "Welche Sprache ist eine serverseitige Spracherweiterung von SQL beim MS SQL Server?", opts: ["PL/SQL","JDBC","Transact-SQL","LINQ"], a: 2, why: "T-SQL ist die prozedurale Erweiterung beim SQL Server (und Sybase). PL/SQL ist das Oracle-Pendant, JDBC eine Schnittstelle, LINQ eine Abfragesprache in .NET." }
  ]},
  { id: "dba1-2", title: "Datenzugriff aus der Frontendapplikation", topic: "dba-zugriff", min: 12, xp: 0, blocks: [
    { t: "lead", html: "Drei Wege, wie eine Anwendung SQL zur Datenbank bringt: SQL als String, SQL mit Parametern und objektrelationale Mapper (ORM)." },
    { t: "text", h: "(1) SQL-Anweisung als String", levels: {
      simple: "Das Programm baut den SQL-Befehl als Text zusammen. Fehler merkt man erst beim Ausführen – und Benutzereingaben können den Befehl manipulieren.",
      normal: "Die Anweisung wird aus <b>statischen und dynamischen Elementen</b> zusammengesetzt. Für den Compiler ist sie nur ein <b>String</b>: Fehler in der Anweisung werden zu <b>Laufzeitfehlern</b> (Runtime Error/Exception). Größtes Risiko: <b>SQL-Injection</b>." + SQL(`Dim nr As Integer = 1344
Dim sql As String
sql = "SELECT vk FROM dbo.artikel WHERE artnr = " &amp; nr.ToString() &amp; ";"`),
      technical: "Zusätzlich zur Injection-Gefahr kann der Server bei jedem anders zusammengesetzten String einen eigenen Ausführungsplan kompilieren (Plan-Cache-Verschmutzung), weil sich der Text jedes Mal ändert. Datums- und Dezimalformate hängen dann von der Formatierung im Client ab (z. B. Komma vs. Punkt)." } },
    { t: "text", h: "(2) SQL-String mit Parametern", levels: {
      simple: "Die Werte werden nicht in den Text geklebt, sondern als eigene „Parameter“ mitgeschickt. Das ist viel sicherer.",
      normal: "Variablen werden in <b>Parameter</b> gekapselt (z. B. <code>@artnr</code>). Parameter haben einen <b>Datentyp</b>, der Wert wird getrennt vom SQL-Text übertragen – SQL-Injection ist damit zumindest deutlich erschwert." + SQL(`sql = "SELECT vk FROM dbo.artikel WHERE artnr = @artnr;"
...
cmd.Parameters.AddWithValue("@artnr", nr)`),
      technical: "Beim SQL Server werden parametrisierte Befehle intern über <code>sp_executesql</code> ausgeführt; der Plan kann wiederverwendet werden. <code>AddWithValue</code> leitet den Typ aus dem .NET-Wert ab – bei Strings besser explizit Typ und Länge angeben (<code>Parameters.Add(\"@name\", SqlDbType.NVarChar, 100)</code>), um implizite Konvertierungen zu vermeiden." } },
    { t: "text", h: "(3) Objektrelationale Mapper (ORM)", levels: {
      simple: "Tabellen werden zu Objekten im Programm. Man schreibt kein SQL mehr selbst, das macht das Framework.",
      normal: "Tabellen werden auf <b>Objekte gemappt</b>; der Zugriff erfolgt über eigene Sprachelemente, z. B. <b>LINQ</b> (Language Integrated Query). SQL wird im Hintergrund erzeugt und gekapselt.<ul><li><b>Vorteil:</b> Datenzugriffslogik wird beim <b>Kompilieren geprüft</b> – Fehler werden zu Syntaxfehlern statt Laufzeitfehlern.</li><li><b>Nachteil:</b> Probleme, wenn die Objekte nach einer Änderung des DB-Schemas nicht mitaktualisiert werden.</li></ul>",
      technical: "Beispiele: Entity Framework (.NET), Hibernate/JPA (Java), Room/Exposed (Kotlin). Weitere typische ORM-Probleme: ineffizient generiertes SQL, das N+1-Problem (eine Abfrage pro Objekt in einer Schleife) und die Tendenz, Logik zeilenweise im Client statt mengenorientiert in der DB auszuführen." } },
    { t: "widget", w: "pairs", topic: "dba-zugriff", title: "Zugriffsart und Eigenschaft", pairs: [["SQL als String", "Fehler erst zur Laufzeit, Injection-gefährdet"], ["SQL mit Parametern", "typisierte Werte, getrennt vom SQL-Text übertragen"], ["ORM", "Tabellen werden auf Objekte abgebildet"], ["LINQ", "Abfragesyntax in .NET, vom Compiler geprüft"], ["ADO.NET / JDBC", "Schnittstelle zwischen Programm und DBMS"]] },
    { t: "warnbox", html: "Benutzereingaben <b>niemals</b> per String-Verkettung in SQL einbauen. Auch scheinbar „harmlose“ Zahlenfelder können manipuliert werden, wenn sie als Text ankommen." },
    { t: "check", q: "Was ist laut Folien der Vorteil eines ORM gegenüber SQL-Strings?", opts: ["Datenzugriffslogik wird beim Kompilieren geprüft","SQL-Injection ist grundsätzlich unmöglich, egal wie man es nutzt","Es braucht keine Datenbankverbindung","Das DB-Schema passt sich automatisch an die Objekte an"], a: 0, why: "Fehler in der Datenzugriffslogik werden zu Syntaxfehlern. Nachteil: Objekte müssen bei Schemaänderungen nachgezogen werden." }
  ]},
  { id: "dba1-3", title: "Programmlogik am Client oder am Server", topic: "dba-server", min: 12, xp: 0, blocks: [
    { t: "lead", html: "Liegt die Logik am Client, wandern für einen Ablauf viele SQL-Anweisungen und Zwischenergebnisse über das Netz. Liegt sie am Server, genügt ein Prozeduraufruf." },
    { t: "text", h: "Zwei Architekturen im Vergleich", levels: {
      simple: "Client-Logik: Die App fragt die DB zehnmal hintereinander. Server-Logik: Die App ruft einmal eine Prozedur auf, die DB erledigt alle Schritte selbst und meldet nur das Ergebnis.",
      normal: "<b>Programmlogik am Client:</b> Der DB-Client schickt SQL-Anweisung 1, erhält Abfrageergebnis 1, schickt Anweisung 2 … bis n. Jeder Schritt bedeutet einen Netzwerk-Roundtrip; Zwischenergebnisse werden übertragen.<br><b>Programmlogik am Server</b> (z. B. Stored Procedure): Der Client startet die Prozedur mit einem Aufruf. Am Server laufen Schritt 1 bis n mit ihren Zwischenergebnissen ab; an den Client wird nur das <b>gemeldete Ergebnis</b> zurückgegeben.",
      technical: "Neben der Netzlast spielt die Konsistenz eine Rolle: Ein mehrstufiger Ablauf am Server kann in einer kurzen Transaktion laufen, während eine Transaktion über mehrere Client-Roundtrips Sperren lange hält. Gegenargument: DB-Server sind schwerer horizontal zu skalieren als App-Server – rechenintensive Algorithmen ohne Datenbezug gehören eher in die Anwendung („komplexe Datenzugriffe vs. Algorithmus“)." } },
    { t: "keys", items: ["Aufgaben „ohne“ Benutzerinteraktion laufen gut am Server", "Nutzen systemspezifischer Fähigkeiten über SQL hinaus", "Komplexe Datenzugriffe → Server; reiner Algorithmus → eher Client", "Performancesteigerung und Wiederverwendbarkeit (konstanter Faktor: DBMS oder Anwendung? Standard- vs. Individualsoftware)", "Hohe Datensicherheit durch strenge <b>indirekte Zugriffsberechtigungen</b> (DSGVO) und Schutz vor <b>SQL-Injection</b>"] },
    { t: "widget", w: "sorter", topic: "dba-server", title: "Wo gehört die Logik eher hin?", cats: [{ k: "s", label: "eher serverseitig (DB)" }, { k: "c", label: "eher clientseitig (App)" }],
      items: [{ t: "Bestellung anlegen: Lagerstand prüfen, abbuchen, Bestellung und Positionen speichern", a: "s", why: "Mehrere datenbezogene Schritte, eine Transaktion." }, { t: "Animation beim Wischen durch die Produktliste", a: "c", why: "Reine UI-Logik." }, { t: "Nächtliche Bereinigung alter Warenkörbe", a: "s", why: "Aufgabe ohne Benutzerinteraktion." }, { t: "Sicherstellen, dass die App nur eigene Kundendaten lesen kann", a: "s", why: "Indirekte Berechtigungen über Prozeduren." }, { t: "Eingabefeld zeigt sofort „E-Mail ungültig“", a: "c", why: "Komfortprüfung im Frontend – die DB prüft trotzdem nochmals." }, { t: "Bildbearbeitung eines Profilfotos", a: "c", why: "Algorithmus ohne Datenzugriff." }] },
    { t: "check", q: "Welcher Vorteil serverseitiger Programmierung wird auf den Folien im Zusammenhang mit der DSGVO genannt?", opts: ["Daten werden automatisch verschlüsselt","Es sind keine Benutzerkonten mehr nötig","Personenbezogene Daten werden nicht gespeichert","Hohe Datensicherheit durch strenge indirekte Zugriffsberechtigungen"], a: 3, why: "Die Anwendung bekommt nur Rechte auf Prozeduren/Sichten, nicht auf die Tabellen dahinter." },
    { t: "check", q: "Ein Ablauf benötigt 8 SQL-Anweisungen. Was ändert sich, wenn er als Stored Procedure umgesetzt wird?", opts: ["Es werden weiterhin 8 Roundtrips benötigt","Ein Aufruf über das Netz, die Schritte laufen am Server","Die Anweisungen werden am Client kompiliert","Zwischenergebnisse werden an den Client geschickt"], a: 1, why: "Ein Aufruf für „viele“ Tätigkeiten → Reduktion der Netzwerklast." }
  ]}
 ]},
 { id: "dbaw2", n: 2, title: "SQL & Transact-SQL", sub: "Abfragen, Variablen, Kontrollstrukturen, Cursor", boss: { id: "boss-dbaw2", title: "Kapiteltest: SQL & T-SQL", topics: ["dba-sql", "dba-tsql", "dba-cursor"] }, lessons: [
  { id: "dba2-1", title: "Beispielschema und komplexe SQL-Abfragen", topic: "dba-sql", min: 18, xp: 0, blocks: [
    { t: "lead", html: "Grundlage jeder DB-Anwendung sind gute Abfragen. Alle Beispiele dieses Kurses verwenden dasselbe kleine <b>Webshop-Schema</b> (Kunden, Artikel, Lager, Bestellungen)." },
    { t: "html", html: SCHEMA },
    { t: "text", h: "JOIN, GROUP BY, HAVING", levels: {
      simple: "JOIN verbindet Tabellen über gemeinsame Schlüssel. GROUP BY fasst Zeilen zusammen, HAVING filtert diese Gruppen.",
      normal: "Umsatz je Kunde der letzten 12 Monate, nur Kunden über 500 €:" + SQL(`SELECT k.kdnr, k.name,
       COUNT(DISTINCT b.bestnr)  AS bestellungen,
       SUM(p.menge * p.preis)    AS umsatz
FROM dbo.kunde k
JOIN dbo.bestellung b      ON b.kdnr = k.kdnr
JOIN dbo.bestellposition p ON p.bestnr = b.bestnr
WHERE b.datum &gt;= DATEADD(MONTH, -12, SYSDATETIME())
GROUP BY k.kdnr, k.name
HAVING SUM(p.menge * p.preis) &gt; 500
ORDER BY umsatz DESC;`) + "<b>WHERE</b> filtert Zeilen vor der Gruppierung, <b>HAVING</b> filtert Gruppen danach. Jede Spalte im SELECT muss im GROUP BY stehen oder aggregiert sein.",
      technical: "Logische Verarbeitungsreihenfolge: <code>FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → TOP/OFFSET</code>. Deshalb darf der Alias <code>umsatz</code> im ORDER BY verwendet werden, aber nicht im WHERE oder HAVING. <code>COUNT(DISTINCT b.bestnr)</code> ist nötig, weil der JOIN auf Positionen jede Bestellung vervielfacht." } },
    { t: "text", h: "Unterabfragen, EXISTS, LEFT JOIN", levels: {
      simple: "Mit NOT EXISTS findest du Dinge, zu denen es etwas nicht gibt – z. B. Artikel, die nie bestellt wurden.",
      normal: "Artikel, die nie bestellt wurden – zwei gleichwertige Varianten:" + SQL(`-- Variante 1: korrelierte Unterabfrage
SELECT a.artnr, a.bezeichnung
FROM dbo.artikel a
WHERE NOT EXISTS (SELECT 1 FROM dbo.bestellposition p WHERE p.artnr = a.artnr);

-- Variante 2: LEFT JOIN + IS NULL
SELECT a.artnr, a.bezeichnung
FROM dbo.artikel a
LEFT JOIN dbo.bestellposition p ON p.artnr = a.artnr
WHERE p.artnr IS NULL;`),
      technical: "Vorsicht bei <code>NOT IN (SELECT …)</code>: Liefert die Unterabfrage auch nur einen NULL-Wert, ist das Ergebnis leer (dreiwertige Logik). <code>NOT EXISTS</code> ist NULL-sicher. Bei LEFT JOIN gehören Filter auf die rechte Tabelle in die ON-Klausel, sonst wird der LEFT JOIN faktisch zum INNER JOIN." } },
    { t: "text", h: "CTE und Fensterfunktionen", levels: {
      simple: "Eine CTE (WITH …) ist eine benannte Hilfsabfrage. Fensterfunktionen rechnen über mehrere Zeilen, ohne sie zusammenzufassen.",
      normal: "Meistverkaufter Artikel je Kunde:" + SQL(`WITH mengen AS (
  SELECT b.kdnr, p.artnr, SUM(p.menge) AS stk,
         ROW_NUMBER() OVER (PARTITION BY b.kdnr
                            ORDER BY SUM(p.menge) DESC) AS rang
  FROM dbo.bestellung b
  JOIN dbo.bestellposition p ON p.bestnr = b.bestnr
  GROUP BY b.kdnr, p.artnr
)
SELECT kdnr, artnr, stk
FROM mengen
WHERE rang = 1;`) + "<code>OVER (PARTITION BY … ORDER BY …)</code> definiert das Fenster; <code>ROW_NUMBER</code>, <code>RANK</code>, <code>SUM(…) OVER</code> (laufende Summen), <code>LAG/LEAD</code> sind typische Fensterfunktionen.",
      technical: "Fensterfunktionen werden nach GROUP BY ausgewertet – deshalb kann im OVER-ORDER-BY ein Aggregat stehen. Sie dürfen nicht direkt im WHERE stehen, daher der Umweg über die CTE. Laufende Summe: <code>SUM(menge) OVER (ORDER BY datum ROWS UNBOUNDED PRECEDING)</code>. Eine CTE gilt nur für die unmittelbar folgende Anweisung." } },
    { t: "widget", w: "gapfill", topic: "dba-sql", title: "SQL-Lücken", items: [{ s: "Gruppen nach dem GROUP BY filtert man mit ___.", a: ["HAVING"] }, { s: "Artikel ohne Bestellung findet man NULL-sicher mit NOT ___ (SELECT 1 …).", a: ["EXISTS"] }, { s: "ROW_NUMBER() ___ (PARTITION BY kdnr ORDER BY datum) nummeriert je Kunde.", a: ["OVER"] }, { s: "Eine benannte Hilfsabfrage beginnt mit dem Schlüsselwort ___.", a: ["WITH"] }] },
    { t: "check", q: "Warum darf der Spaltenalias „umsatz“ zwar im ORDER BY, aber nicht im WHERE verwendet werden?", opts: ["Weil WHERE nur Zahlen vergleichen kann","Weil SELECT logisch nach WHERE, aber vor ORDER BY verarbeitet wird","Weil Aliase nur bei Aggregaten erlaubt sind","Weil ORDER BY immer vor WHERE ausgeführt wird"], a: 1, why: "Logische Reihenfolge: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY." }
  ]},
  { id: "dba2-2", title: "Transact-SQL: Variablen und Kontrollstrukturen", topic: "dba-tsql", min: 16, xp: 0, blocks: [
    { t: "lead", html: "Transact-SQL ist die <b>herstellerproprietäre, prozedurale Spracherweiterung</b> zum standardisierten SQL (ANSI) beim SQL Server (und Sybase). Mit ihr entstehen Procedures („tun etwas“) und Functions („liefern etwas“)." },
    { t: "keys", items: ["Elemente von T-SQL: <b>Variablen</b>, <b>Kontrollstrukturen</b>, <b>Cursor</b>", "<b>Input- und Outputparameter</b>", "<b>direkter Einsatz von SQL</b> im Code", "<b>Funktionen und Systemfunktionen</b>"] },
    { t: "text", h: "Variablen", levels: {
      simple: "Variablen beginnen mit @, werden mit DECLARE angelegt und mit SET oder SELECT befüllt.",
      normal: SQL(`DECLARE @artnr INT = 1344,
        @preis DECIMAL(10,2),
        @name  NVARCHAR(100);

SET @artnr = 1089;                          -- ein Wert
SELECT @preis = vk, @name = bezeichnung     -- Werte aus einer Abfrage
FROM dbo.artikel
WHERE artnr = @artnr;

PRINT CONCAT(N'Preis von ', @name, N': ', @preis);`) + "Lokale Variablen gelten nur im aktuellen <b>Batch</b> (bis zum nächsten <code>GO</code> in SSMS) bzw. in der Prozedur. Nicht initialisierte Variablen sind <code>NULL</code>.",
      technical: "Liefert <code>SELECT @x = …</code> keine Zeile, behält die Variable ihren alten Wert (!). Liefert sie mehrere Zeilen, erhält sie den Wert der letzten – ohne Fehler. <code>SET @x = (SELECT …)</code> setzt bei keiner Zeile NULL und wirft bei mehreren Zeilen einen Fehler. Systemvariablen beginnen mit <code>@@</code>, z. B. <code>@@ROWCOUNT</code>, <code>@@TRANCOUNT</code>, <code>@@FETCH_STATUS</code>." } },
    { t: "text", h: "Kontrollstrukturen", levels: {
      simple: "IF/ELSE für Entscheidungen, WHILE für Schleifen, BEGIN … END fasst mehrere Anweisungen zu einem Block zusammen.",
      normal: "<ul><li><code>IF … ELSE</code> – Verzweigung; für mehr als eine Anweisung ist ein <code>BEGIN … END</code>-Block nötig</li><li><code>WHILE</code> mit <code>BREAK</code>/<code>CONTINUE</code> – Schleife</li><li><code>CASE</code> – <b>Ausdruck</b> (liefert einen Wert, z. B. im SELECT), keine Ablaufsteuerung</li><li><code>RETURN</code> – Prozedur/Batch verlassen</li><li><code>EXISTS</code> – prüft, ob eine Abfrage mindestens eine Zeile liefert</li></ul>Beispiel aus dem Struktogramm der Folien: Artikelnummer, Lagernummer und Menge einlesen; gibt es den Artikel im Lager schon → Lagerstand anpassen (UPDATE), sonst neuen Datensatz einfügen (INSERT):" + SQL(`DECLARE @artnr INT = 1089, @lagernr INT = 1, @menge INT = 25;

IF EXISTS (SELECT 1 FROM dbo.lagerstand
           WHERE artnr = @artnr AND lagernr = @lagernr)
BEGIN
  UPDATE dbo.lagerstand
  SET menge = menge + @menge
  WHERE artnr = @artnr AND lagernr = @lagernr;
END
ELSE
BEGIN
  INSERT INTO dbo.lagerstand (artnr, lagernr, menge)
  VALUES (@artnr, @lagernr, @menge);
END;`),
      technical: "Alternative ohne Verzweigung: zuerst <code>UPDATE</code> versuchen und bei <code>@@ROWCOUNT = 0</code> einfügen – spart eine Abfrage. Bei gleichzeitigen Zugriffen kann zwischen EXISTS und INSERT eine andere Session denselben Datensatz anlegen (Race Condition → PK-Verletzung); abhilfe schafft eine Transaktion mit <code>WITH (UPDLOCK, HOLDLOCK)</code> beim Prüfen. <code>MERGE</code> wäre eine Einzelanweisung für Upsert, hat beim SQL Server aber bekannte Tücken bei Nebenläufigkeit." } },
    { t: "widget", w: "pairs", topic: "dba-tsql", title: "T-SQL-Elemente", pairs: [["DECLARE", "legt eine lokale Variable an"], ["@@ROWCOUNT", "Anzahl der von der letzten Anweisung betroffenen Zeilen"], ["BEGIN … END", "fasst mehrere Anweisungen zu einem Block zusammen"], ["CASE", "Ausdruck, der abhängig von Bedingungen einen Wert liefert"], ["WHILE", "wiederholt einen Block, solange die Bedingung wahr ist"], ["GO", "Batch-Trenner in SSMS (kein T-SQL-Befehl)"]] },
    { t: "warnbox", html: "<code>IF @x = NULL</code> ist nie wahr! NULL vergleicht man mit <code>IS NULL</code>. Und: Ohne <code>BEGIN … END</code> gehört nur die <b>erste</b> Anweisung nach IF zur Bedingung." },
    { t: "check", q: "Was passiert bei SELECT @preis = vk FROM dbo.artikel WHERE artnr = 9999, wenn es den Artikel nicht gibt?", opts: ["@preis behält seinen bisherigen Wert","@preis wird NULL","Es tritt ein Laufzeitfehler auf","@preis wird 0"], a: 0, why: "Ohne Ergebniszeile findet keine Zuweisung statt. Darum vorher auf NULL setzen oder @@ROWCOUNT prüfen." }
  ]},
  { id: "dba2-3", title: "Cursor – und warum Mengenoperationen meist besser sind", topic: "dba-cursor", min: 15, xp: 0, blocks: [
    { t: "lead", html: "„Auch wenn ich mein Programmierwissen bei der Datenbankprogrammierung einsetze, leide ich nicht unter <b>Schleifitis</b> und verwende Mengenoperationen, wann immer möglich.“ (Folie „Data Expert“)" },
    { t: "text", h: "Cursor: zeilenweise Verarbeitung", levels: {
      simple: "Ein Cursor geht ein Abfrageergebnis Zeile für Zeile durch – wie eine Schleife über eine Liste.",
      normal: "Das Struktogramm der Folien zeigt eine Zuteilung: Lagerstand in <code>@stk</code> einlesen; <b>solange @stk &gt; 0</b> die nächste Bestellmenge in <code>@best_stk</code> lesen; wenn <code>@stk &gt;= @best_stk</code> → Menge zuteilen und <code>@stk</code> reduzieren, sonst Bestellung auf Rückstand stellen. Mit einem Cursor:" + SQL(`DECLARE @artnr INT = 1089, @stk INT, @best_stk INT,
        @bestnr INT, @posnr INT;

SELECT @stk = ISNULL(SUM(menge), 0)
FROM dbo.lagerstand WHERE artnr = @artnr;

DECLARE c_pos CURSOR LOCAL FAST_FORWARD FOR
  SELECT p.bestnr, p.posnr, p.menge
  FROM dbo.bestellposition p
  JOIN dbo.bestellung b ON b.bestnr = p.bestnr
  WHERE p.artnr = @artnr AND p.status = 'offen'
  ORDER BY b.datum;

OPEN c_pos;
FETCH NEXT FROM c_pos INTO @bestnr, @posnr, @best_stk;

WHILE @@FETCH_STATUS = 0 AND @stk &gt; 0
BEGIN
  IF @stk &gt;= @best_stk
  BEGIN
    UPDATE dbo.bestellposition SET status = 'zugeteilt'
    WHERE bestnr = @bestnr AND posnr = @posnr;
    SET @stk = @stk - @best_stk;
  END
  ELSE
    UPDATE dbo.bestellposition SET status = 'rueckstand'
    WHERE bestnr = @bestnr AND posnr = @posnr;

  FETCH NEXT FROM c_pos INTO @bestnr, @posnr, @best_stk;
END;

CLOSE c_pos;
DEALLOCATE c_pos;`) + "Lebenszyklus: <b>DECLARE → OPEN → FETCH (in Schleife, solange @@FETCH_STATUS = 0) → CLOSE → DEALLOCATE</b>.",
      technical: "<code>LOCAL</code> beschränkt den Cursor auf Batch/Prozedur, <code>FAST_FORWARD</code> = nur vorwärts, nur lesend, am performantesten. Ohne CLOSE/DEALLOCATE bleibt ein globaler Cursor offen und der nächste DECLARE mit gleichem Namen scheitert. Jeder FETCH und jedes UPDATE ist eine Einzeloperation – bei 100.000 Zeilen sind das 100.000 Anweisungen statt einer." } },
    { t: "text", h: "Mengenorientierte Alternative", levels: {
      simple: "Statt jede Zeile einzeln zu ändern, sagt man der DB in einem Befehl, welche Zeilen wie geändert werden sollen.",
      normal: "Viele „Schleifen“ lassen sich als <b>eine</b> Anweisung formulieren. Eine strenge FIFO-Zuteilung (wer zuerst bestellt, bekommt zuerst – ohne kleinere spätere Bestellungen vorzuziehen) mit laufender Summe:" + SQL(`WITH offen AS (
  SELECT p.bestnr, p.posnr,
         SUM(p.menge) OVER (ORDER BY b.datum, p.bestnr, p.posnr
                            ROWS UNBOUNDED PRECEDING) AS kumuliert
  FROM dbo.bestellposition p
  JOIN dbo.bestellung b ON b.bestnr = p.bestnr
  WHERE p.artnr = @artnr AND p.status = 'offen'
)
UPDATE p
SET status = CASE WHEN o.kumuliert &lt;= @stk THEN 'zugeteilt'
                  ELSE 'rueckstand' END
FROM dbo.bestellposition p
JOIN offen o ON o.bestnr = p.bestnr AND o.posnr = p.posnr;`) + "Die Logik ist nicht 1:1 dieselbe wie im Cursor (dort können kleinere spätere Bestellungen noch zugeteilt werden) – genau solche Unterschiede muss man im Code-Review erklären können.",
      technical: "Der Optimizer kann eine Mengenoperation als Ganzes planen (Joins, Indizes, Parallelität). Cursor sind gerechtfertigt, wenn pro Zeile wirklich etwas Unteilbares passieren muss, z. B. eine Prozedur pro Zeile aufrufen, E-Mails pro Datensatz erzeugen oder komplexe zustandsabhängige Algorithmen, die sich nicht als Menge formulieren lassen." } },
    { t: "widget", w: "gapfill", topic: "dba-cursor", title: "Cursor-Lebenszyklus", items: [{ s: "Nach DECLARE muss der Cursor mit ___ geöffnet werden.", a: ["OPEN"] }, { s: "Die nächste Zeile holt man mit FETCH ___ FROM c_pos INTO …", a: ["NEXT"] }, { s: "Die Schleife läuft, solange @@___ = 0 ist.", a: ["FETCH_STATUS"] }, { s: "Zum Schluss: CLOSE und ___ – sonst bleiben Ressourcen belegt.", a: ["DEALLOCATE"] }] },
    { t: "check", q: "Wann ist ein Cursor am ehesten gerechtfertigt?", opts: ["Um alle Preise um 5 % zu erhöhen","Um den Umsatz je Kunde zu summieren","Wenn für jede Zeile eine Stored Procedure aufgerufen werden muss","Um alle inaktiven Kunden zu löschen"], a: 2, why: "Preiserhöhung, Summen und Löschen sind klassische Mengenoperationen. Ein Prozeduraufruf pro Zeile lässt sich nicht als eine Anweisung formulieren." }
  ]}
 ]},
 { id: "dbaw3", n: 3, title: "Prozeduren & Funktionen", sub: "Stored Procedures, Transaktionen, Fehlerbehandlung, UDFs", boss: { id: "boss-dbaw3", title: "Kapiteltest: Prozeduren & Funktionen", topics: ["dba-sp", "dba-tx", "dba-udf"] }, lessons: [
  { id: "dba3-1", title: "Stored Procedures", topic: "dba-sp", min: 18, xp: 0, blocks: [
    { t: "lead", html: "Einsatzbereiche serverseitiger Programmierung: <b>Stored Procedures</b>, <b>User-defined Functions</b>, <b>Trigger</b> und die direkte Befehlsverarbeitung. Prozeduren sind das Rückgrat des Praxisprojekts." },
    { t: "keys", items: ["Auf dem Server gespeicherte Programme; <b>ein Aufruf für „viele“ Tätigkeiten</b>", "Reduktion von Netzwerklast und Entwicklungsaufwand, Aufruf von unterschiedlichen Front-Ends", "Sinnvoll: Steuerung <b>sämtlicher datenrelevanter Prozesse</b> einer Anwendung", "In Transact-SQL oder einer .NET-Sprache erstellbar; steuern <b>indirekte Zugriffsberechtigungen</b>", "Werden <b>explizit aufgerufen</b>, bekommen Parameter, lesen/schreiben Tabellen, können ausgeben, prüfen, Fehler behandeln und Transaktionen enthalten"] },
    { t: "text", h: "Aufbau einer Prozedur", levels: {
      simple: "Eine Prozedur hat einen Namen, Parameter (Eingaben, optional Ausgaben) und einen Rumpf mit T-SQL-Code. Aufgerufen wird sie mit EXEC.",
      normal: "Preisabfrage wie im Projektbeispiel der Folien (Netto- oder Bruttopreis):" + SQL(`CREATE OR ALTER PROCEDURE dbo.sp_artikelpreis
  @artnr  INT,
  @brutto BIT = 0,                  -- Default-Wert: optionaler Parameter
  @preis  DECIMAL(10,2) OUTPUT      -- Ausgabeparameter
AS
BEGIN
  SET NOCOUNT ON;
  SET @preis = NULL;

  SELECT @preis = CASE WHEN @brutto = 1
                       THEN vk * (1 + ust_satz / 100)
                       ELSE vk END
  FROM dbo.artikel
  WHERE artnr = @artnr AND aktiv = 1;

  IF @preis IS NULL
    RETURN 1;          -- Statuscode: Artikel nicht gefunden
  RETURN 0;            -- Statuscode: OK
END;`) + "Aufruf:" + SQL(`DECLARE @p DECIMAL(10,2), @rc INT;
EXEC @rc = dbo.sp_artikelpreis @artnr = 1344, @brutto = 1, @preis = @p OUTPUT;
SELECT @rc AS returncode, @p AS preis;`) + "Drei Wege, Ergebnisse zu liefern: <b>OUTPUT-Parameter</b> (beliebige Typen, mehrere), <b>RETURN-Wert</b> (nur INT, üblich als Status-/Fehlercode) und <b>Resultsets</b> (ein SELECT in der Prozedur).",
      technical: "<code>OUTPUT</code> muss bei Deklaration <b>und</b> Aufruf stehen, sonst kommt der Wert nicht zurück. <code>SET NOCOUNT ON</code> unterdrückt die „(n rows affected)“-Meldungen, die manche Client-Bibliotheken als zusätzliche Resultsets interpretieren. <code>CREATE OR ALTER</code> (ab SQL Server 2016 SP1) macht Skripte wiederholt ausführbar und behält Berechtigungen. Prozeduren immer mit Schema (<code>dbo.</code>) ansprechen; das Präfix <code>sp_</code> ist eigentlich für Systemprozeduren reserviert (der Server sucht zuerst in master) – im Projekt ist die Namenskonvention <code>dbo.sp_backend_wrapper</code> aber vorgegeben. Der Ausführungsplan wird beim ersten Aufruf kompiliert und gecacht (Stichwort Parameter Sniffing)." } },
    { t: "widget", w: "pairs", topic: "dba-sp", title: "Prozedur-Bausteine", pairs: [["@preis DECIMAL(10,2) OUTPUT", "liefert einen Wert an den Aufrufer zurück"], ["RETURN 1", "ganzzahliger Statuscode"], ["@brutto BIT = 0", "optionaler Parameter mit Default"], ["SET NOCOUNT ON", "unterdrückt Zeilenanzahl-Meldungen"], ["EXEC @rc = …", "fängt den RETURN-Wert auf"], ["CREATE OR ALTER", "legt an oder ändert, Skript wiederholbar"]] },
    { t: "warnbox", html: "Klassiker: <code>EXEC dbo.sp_artikelpreis 1344, 1, @p</code> – ohne <code>OUTPUT</code> beim Aufruf bleibt <code>@p</code> NULL, ohne Fehlermeldung." },
    { t: "check", q: "Welcher Datentyp ist für den RETURN-Wert einer Stored Procedure erlaubt?", opts: ["beliebiger Datentyp","nur NVARCHAR","nur BIT","nur INT"], a: 3, why: "RETURN liefert immer einen INT – typischerweise einen Statuscode. Für andere Typen: OUTPUT-Parameter." },
    { t: "check", q: "Was beschreibt eine Prozedur laut Folien am besten?", opts: ["Wird durch INSERT/UPDATE/DELETE ausgelöst","Liefert immer genau einen Wert und hat keine Nebenwirkungen","Bildet einen klar definierten Prozess aus mehreren Schritten ab und wird explizit aufgerufen","Kann nur lesend auf Tabellen zugreifen"], a: 2, why: "Prozeduren „tun etwas“: Parameter verarbeiten, lesen, schreiben, prüfen, Fehler behandeln, Transaktionen." }
  ]},
  { id: "dba3-2", title: "Transaktionen und Fehlerbehandlung (TRY/CATCH)", topic: "dba-tx", min: 18, xp: 0, blocks: [
    { t: "lead", html: "Prozeduren „können Fehler behandeln“ und „können Transaktionen enthalten“. Zusammen sorgen beide dafür, dass ein mehrstufiger Prozess <b>ganz oder gar nicht</b> passiert." },
    { t: "text", h: "Transaktionen", levels: {
      simple: "Eine Transaktion ist ein Paket von Änderungen: Entweder alle klappen (COMMIT) oder alle werden zurückgenommen (ROLLBACK).",
      normal: "Eigenschaften (<b>ACID</b>): <b>Atomicity</b> (alles oder nichts), <b>Consistency</b> (von einem konsistenten Zustand in den nächsten), <b>Isolation</b> (parallele Transaktionen stören sich nicht), <b>Durability</b> (bestätigte Änderungen bleiben). In T-SQL: <code>BEGIN TRANSACTION</code> – <code>COMMIT TRANSACTION</code> bzw. <code>ROLLBACK TRANSACTION</code>. Ohne explizite Transaktion ist jede einzelne Anweisung ihre eigene Transaktion (Autocommit).",
      technical: "<code>@@TRANCOUNT</code> zählt offene Transaktionen; ein inneres <code>BEGIN TRAN</code> erhöht nur den Zähler, ein <code>COMMIT</code> senkt ihn, erst der äußerste COMMIT schreibt fest. Ein <code>ROLLBACK</code> rollt dagegen <b>immer alles</b> zurück und setzt @@TRANCOUNT auf 0. <code>XACT_STATE()</code> liefert 1 (committable), −1 (doomed, nur noch ROLLBACK möglich) oder 0 (keine Transaktion). Isolationslevel: READ UNCOMMITTED, READ COMMITTED (Standard), REPEATABLE READ, SERIALIZABLE, SNAPSHOT." } },
    { t: "text", h: "TRY/CATCH und THROW", levels: {
      simple: "Code im TRY-Block wird ausgeführt; geht etwas schief, springt das Programm in den CATCH-Block. Dort wird zurückgerollt und der Fehler gemeldet.",
      normal: "Standardmuster für eine Prozedur mit Transaktion:" + SQL(`CREATE OR ALTER PROCEDURE dbo.sp_bestellung_anlegen
  @kdnr INT, @artnr INT, @lagernr INT, @menge INT,
  @bestnr INT OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  BEGIN TRY
    BEGIN TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM dbo.kunde WHERE kdnr = @kdnr AND aktiv = 1)
      THROW 50001, N'Kunde unbekannt oder inaktiv', 1;

    UPDATE dbo.lagerstand
    SET menge = menge - @menge
    WHERE artnr = @artnr AND lagernr = @lagernr AND menge &gt;= @menge;
    IF @@ROWCOUNT = 0
      THROW 50002, N'Lagerstand nicht ausreichend', 1;

    INSERT INTO dbo.bestellung (kdnr) VALUES (@kdnr);
    SET @bestnr = SCOPE_IDENTITY();

    INSERT INTO dbo.bestellposition (bestnr, posnr, artnr, menge, preis, status)
    SELECT @bestnr, 1, artnr, @menge, vk, 'zugeteilt'
    FROM dbo.artikel WHERE artnr = @artnr;

    COMMIT TRANSACTION;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT &gt; 0
      ROLLBACK TRANSACTION;
    THROW;   -- Originalfehler an den Aufrufer weitergeben
  END CATCH
END;`) + "Im CATCH stehen <code>ERROR_NUMBER()</code>, <code>ERROR_MESSAGE()</code>, <code>ERROR_LINE()</code>, <code>ERROR_PROCEDURE()</code>, <code>ERROR_SEVERITY()</code> und <code>ERROR_STATE()</code> zur Verfügung – z. B. um einen Fehlercode als JSON an die API zu liefern.",
      technical: "<code>THROW nummer, text, state</code>: eigene Fehlernummern ab 50000, Schweregrad immer 16, beendet den Batch. <code>THROW;</code> ohne Argumente (nur im CATCH) wirft den Originalfehler erneut. Die Anweisung <b>vor</b> THROW muss mit Semikolon abgeschlossen sein. Das ältere <code>RAISERROR</code> beendet die Ausführung nicht automatisch und erlaubt printf-Formatierung. <code>SET XACT_ABORT ON</code> sorgt dafür, dass jeder Laufzeitfehler die Transaktion als doomed markiert bzw. zurückrollt – auch bei Fehlern wie Timeouts vom Client, die gar nicht in den CATCH kommen. TRY/CATCH fängt keine Kompilierfehler im selben Scope (z. B. Syntaxfehler, nicht existierende Tabelle bei verzögerter Namensauflösung) und keine Meldungen mit Schweregrad ≤ 10." } },
    { t: "warnbox", html: "Ohne TRY/CATCH und ohne XACT_ABORT bricht bei vielen Fehlern (z. B. CHECK-Verletzung) nur <b>die eine Anweisung</b> ab – die Prozedur läuft weiter und COMMIT schreibt einen halben Prozess fest. Und: Eine Prüfung wie „Lagerstand ausreichend?“ gehört <b>in</b> die Transaktion, sonst kann sich der Wert zwischen Prüfen und Buchen ändern." },
    { t: "widget", w: "gapfill", topic: "dba-tx", title: "Fehlerbehandlung", items: [{ s: "Eigene Fehler wirft man mit THROW; die Fehlernummer muss mindestens ___ sein.", a: ["50000"] }, { s: "Im CATCH prüft man vor dem ROLLBACK, ob @@___ größer 0 ist.", a: ["TRANCOUNT"] }, { s: "Den Fehlertext im CATCH liefert die Funktion ___().", a: ["ERROR_MESSAGE"] }, { s: "Den Wert einer neu erzeugten IDENTITY-Spalte liefert ___().", a: ["SCOPE_IDENTITY"] }] },
    { t: "check", q: "Ein ROLLBACK innerhalb von zwei verschachtelten BEGIN TRANSACTION …", opts: ["rollt alles zurück und setzt @@TRANCOUNT auf 0","rollt nur die innere Transaktion zurück","ist in T-SQL nicht erlaubt","wird ignoriert, bis der äußere ROLLBACK kommt"], a: 0, why: "SQL Server kennt keine echten verschachtelten Transaktionen: ROLLBACK (ohne Savepoint) rollt immer bis zur äußersten zurück." },
    { t: "check", q: "Wozu dient THROW; ohne Parameter im CATCH-Block?", opts: ["Es löscht den Fehler","Es startet die Transaktion neu","Es schreibt den Fehler ins Windows-Eventlog","Es wirft den ursprünglichen Fehler erneut an den Aufrufer"], a: 3, why: "Re-Throw: Der Aufrufer erfährt die originale Fehlernummer und -meldung." }
  ]},
  { id: "dba3-3", title: "User-defined Functions", topic: "dba-udf", min: 15, xp: 0, blocks: [
    { t: "lead", html: "Functions „liefern etwas“: ein Ergebnis als <b>skalaren Wert</b> oder als <b>Tabelle</b> – und sie lassen sich direkt in Abfragen verwenden." },
    { t: "html", html: `<table class="dt"><tr><th>Art</th><th>liefert</th><th>vergleichbar mit</th></tr><tr><td>Skalarfunktion</td><td>einen Wert</td><td>einer integrierten Funktion (z. B. ROUND)</td></tr><tr><td>Funktion mit mehreren Anweisungen und Tabellenrückgabe (Multi-Statement TVF)</td><td>Tabellenvariable, im Rumpf befüllt</td><td>einer gespeicherten Prozedur; SQL-Verweise wie bei einer Sicht</td></tr><tr><td>Inlinefunktion mit Tabellenrückgabe (Inline TVF)</td><td>Ergebnis <b>einer einzelnen SELECT-Anweisung</b></td><td>einer <b>Sicht mit Parameter</b></td></tr></table>` },
    { t: "text", h: "Die drei Arten im Code", levels: {
      simple: "Skalarfunktion: rechnet einen Wert aus. Inline-Tabellenfunktion: eine Abfrage mit Parameter. Multi-Statement-Funktion: baut eine Ergebnistabelle Schritt für Schritt auf.",
      normal: SQL(`-- 1) Skalarfunktion
CREATE OR ALTER FUNCTION dbo.fn_brutto (@netto DECIMAL(10,2), @ust DECIMAL(4,2))
RETURNS DECIMAL(10,2)
AS
BEGIN
  RETURN ROUND(@netto * (1 + @ust / 100), 2);
END;
GO
-- 2) Inline TVF: „Sicht mit Parameter“
CREATE OR ALTER FUNCTION dbo.fn_bestellungen_kunde (@kdnr INT)
RETURNS TABLE
AS
RETURN (
  SELECT b.bestnr, b.datum, SUM(p.menge * p.preis) AS summe
  FROM dbo.bestellung b
  JOIN dbo.bestellposition p ON p.bestnr = b.bestnr
  WHERE b.kdnr = @kdnr
  GROUP BY b.bestnr, b.datum
);
GO
-- 3) Multi-Statement TVF
CREATE OR ALTER FUNCTION dbo.fn_lagerampel (@grenze INT)
RETURNS @erg TABLE (artnr INT PRIMARY KEY, bestand INT, ampel VARCHAR(5))
AS
BEGIN
  INSERT INTO @erg (artnr, bestand)
  SELECT a.artnr, ISNULL(SUM(l.menge), 0)
  FROM dbo.artikel a
  LEFT JOIN dbo.lagerstand l ON l.artnr = a.artnr
  GROUP BY a.artnr;

  UPDATE @erg
  SET ampel = CASE WHEN bestand = 0 THEN 'rot'
                   WHEN bestand &lt; @grenze THEN 'gelb'
                   ELSE 'gruen' END;
  RETURN;
END;`) + "Verwendung:" + SQL(`SELECT artnr, vk, dbo.fn_brutto(vk, ust_satz) AS brutto FROM dbo.artikel;
SELECT * FROM dbo.fn_bestellungen_kunde(7) ORDER BY datum;
SELECT k.name, f.bestnr, f.summe
FROM dbo.kunde k
CROSS APPLY dbo.fn_bestellungen_kunde(k.kdnr) f;
SELECT * FROM dbo.fn_lagerampel(10) WHERE ampel &lt;&gt; 'gruen';`),
      technical: "Einschränkungen von Funktionen: <b>keine Änderungen an Tabellen</b> (nur an eigenen Tabellenvariablen), kein Aufruf von Stored Procedures, kein TRY/CATCH, kein THROW/RAISERROR, keine Transaktionssteuerung, kein dynamisches SQL. Skalarfunktionen müssen mit Schema aufgerufen werden (<code>dbo.fn_brutto</code>). Performance: Inline TVFs werden wie Sichten in die Abfrage „eingefaltet“ und optimiert; Multi-Statement TVFs und klassische Skalar-UDFs werden zeilenweise ausgeführt (ab SQL Server 2019 teils durch Scalar UDF Inlining gemildert). Im Zweifel: Inline TVF." } },
    { t: "widget", w: "sorter", topic: "dba-udf", title: "Prozedur oder Funktion?", cats: [{ k: "p", label: "Stored Procedure" }, { k: "f", label: "User-defined Function" }],
      items: [{ t: "Bestellung anlegen und Lagerstand abbuchen", a: "p", why: "Ändert Tabellen – in Funktionen verboten." }, { t: "Bruttopreis in einem SELECT berechnen", a: "f", why: "" }, { t: "Alle Bestellungen eines Kunden als Tabelle für einen JOIN", a: "f", why: "Inline TVF." }, { t: "Fehler mit TRY/CATCH behandeln und Transaktion zurückrollen", a: "p", why: "" }, { t: "Wird mit EXEC aufgerufen", a: "p", why: "" }, { t: "Kann in WHERE oder FROM einer Abfrage stehen", a: "f", why: "" }] },
    { t: "check", q: "Welche UDF-Art entspricht einer „Sicht mit Parameter“?", opts: ["Skalarfunktion","Inlinefunktion mit Tabellenrückgabe","Multi-Statement-Funktion","Aggregatfunktion"], a: 1, why: "Inline TVF: Rückgabe einer einzelnen SELECT-Anweisung, parametrisiert." }
  ]}
 ]},
 { id: "dbaw4", n: 4, title: "Trigger & Integrität", sub: "Triggerarten, inserted/deleted, Constraints vs. prozedurale Prüfungen", boss: { id: "boss-dbaw4", title: "Kapiteltest: Trigger & Integrität", topics: ["dba-trigger", "dba-integ"] }, lessons: [
  { id: "dba4-1", title: "Trigger: Konzept und Triggerarten", topic: "dba-trigger", min: 16, xp: 0, blocks: [
    { t: "lead", html: "Trigger sind Programme, die <b>nur implizit</b> aufgerufen werden: Sie reagieren auf ein Ereignis und sind <b>fix mit einer Tabelle verbunden</b>." },
    { t: "keys", items: ["DML-Trigger „feuern“ auf <b>INSERT</b>, <b>UPDATE</b> oder <b>DELETE</b> – niemals expliziter Aufruf", "Prüfen Dinge, die über die Komplexität eines Constraints hinausgehen; unterbinden ggf. den auslösenden Vorgang", "Dürfen in Tabellen lesen und schreiben (auch in anderen)", "Geben <b>nie</b> etwas aus und <b>bekommen nie</b> etwas (keine Parameter)"] },
    { t: "text", h: "Triggerarten allgemein (z. B. Oracle)", levels: {
      simple: "Ein Trigger kann einmal pro Befehl oder einmal pro betroffener Zeile laufen – und vor oder nach der Änderung.",
      normal: "<ul><li><b>Statement-Trigger</b>: wird einmal pro Anweisung ausgeführt, egal wie viele Zeilen betroffen sind</li><li><b>Row-Trigger</b>: feuert einmal für jede betroffene Zeile</li><li><b>Before-Trigger</b>: vor dem auslösenden Ereignis</li><li><b>After-Trigger</b>: nach dem auslösenden Ereignis</li></ul>Ablauf bei einem UPDATE auf 3 Zeilen: BEFORE STATEMENT → BEFORE ROW 1, 2, 3 → <b>Constraints</b> → AFTER ROW 1, 2, 3 → AFTER STATEMENT.",
      technical: "In Oracle (PL/SQL) gibt es alle Kombinationen; Row-Trigger greifen über <code>:NEW</code> und <code>:OLD</code> auf die Zeilenwerte zu, BEFORE-ROW-Trigger können Werte noch verändern. Seit Oracle 11g fassen Compound Trigger alle Zeitpunkte zusammen." } },
    { t: "text", h: "Triggerarten beim MS SQL Server", levels: {
      simple: "Der SQL Server kennt nur Statement-Trigger: einmal pro Befehl. Die betroffenen Zeilen stehen in zwei Hilfstabellen: inserted und deleted.",
      normal: "<ul><li>Nur <b>Statement-Trigger</b>; sie feuern <b>nach den Constraints</b></li><li><b>FOR</b> / <b>AFTER</b>: nach dem Ereignis (laut Folie: FOR nach dem Ereignis, AFTER nach kaskadierenden Änderungen)</li><li><b>INSTEAD OF</b>: <b>anstelle</b> des Ereignisses („Umleitungen“)</li><li>Mehrere Trigger pro Ereignis (Insert/Update/Delete) möglich</li><li>Mehrere Zeilen werden mengenorientiert über <code>inserted</code>/<code>deleted</code> oder bei Bedarf über einen Cursor verarbeitet</li><li>Interne Tabellen <b>inserted</b> (Daten <b>nach</b> der Änderung) und <b>deleted</b> (Daten <b>vor</b> der Änderung) haben immer die Struktur der betroffenen Tabelle</li></ul>",
      technical: "In der aktuellen T-SQL-Syntax sind <code>FOR</code> und <code>AFTER</code> gleichbedeutend: Der Trigger feuert, nachdem die Anweisung inklusive Constraint-Prüfungen und referenzieller Kaskaden erfolgreich war. INSTEAD-OF-Trigger feuern vor den Constraints – pro Tabelle und Ereignis ist nur einer erlaubt, und sie sind auch auf Sichten möglich. Die Reihenfolge mehrerer AFTER-Trigger lässt sich nur für ersten/letzten mit <code>sp_settriggerorder</code> festlegen. Der Trigger läuft in der Transaktion der auslösenden Anweisung." } },
    { t: "html", html: `<table class="dt"><tr><th>Anweisung</th><th>inserted</th><th>deleted</th></tr><tr><td>INSERT</td><td>neue Zeilen</td><td>leer</td></tr><tr><td>UPDATE</td><td>Zeilen mit <b>neuen</b> Werten</td><td>dieselben Zeilen mit <b>alten</b> Werten</td></tr><tr><td>DELETE</td><td>leer</td><td>gelöschte Zeilen</td></tr></table>` },
    { t: "widget", w: "pairs", topic: "dba-trigger", title: "Triggerbegriffe", pairs: [["Row-Trigger", "feuert einmal je betroffener Zeile"], ["Statement-Trigger", "feuert einmal je Anweisung"], ["INSTEAD OF", "wird anstelle des auslösenden Ereignisses ausgeführt"], ["inserted", "Daten nach der Änderung"], ["deleted", "Daten vor der Änderung"], ["AFTER", "läuft nach Ereignis und Constraint-Prüfung"]] },
    { t: "check", q: "Ein UPDATE ändert 50 Zeilen der Tabelle artikel. Wie oft feuert ein AFTER UPDATE-Trigger beim SQL Server?", opts: ["50-mal","einmal","gar nicht, nur bei INSERT","zweimal (vorher und nachher)"], a: 1, why: "SQL Server kennt nur Statement-Trigger. Die 50 Zeilen stehen gesammelt in inserted und deleted." },
    { t: "check", q: "Welche Aussage über Trigger ist laut Folien falsch?", opts: ["Sie bekommen Parameter vom Aufrufer","Sie werden durch INSERT, UPDATE oder DELETE ausgelöst","Sie können den auslösenden Vorgang unterbinden","Sie können in andere Tabellen schreiben"], a: 0, why: "Trigger geben nie etwas aus und bekommen nie etwas." }
  ]},
  { id: "dba4-2", title: "Trigger in der Praxis: prüfen, protokollieren, umleiten", topic: "dba-trigger", min: 16, xp: 0, blocks: [
    { t: "lead", html: "Einsatzbereiche: komplexe <b>Gültigkeitsüberprüfungen</b>, die mit Constraints nicht umsetzbar sind; automatische <b>Zusatzaufgaben ohne Umgehungsmöglichkeit</b>; <b>Ersatzhandlungen</b> anstelle des auslösenden Ereignisses." },
    { t: "text", h: "Gültigkeitsprüfung: „Gibt es etwas, was nicht passt?“", levels: {
      simple: "Der Trigger schaut, ob unter den neuen Zeilen eine ist, die eine Regel verletzt. Wenn ja: alles zurückrollen.",
      normal: "<code>inserted</code> und <code>deleted</code> enthalten <b>alle</b> vom Statement betroffenen Zeilen und erlauben Vergleiche mit anderen Tabellen (<b>JOIN!</b>). Prüffrage: „Gibt es etwas, was nicht passt?“ – Aktion, wenn ja: <b>ROLLBACK</b>. Regel: Inaktive Artikel dürfen nicht bestellt werden (tabellenübergreifend → kein CHECK möglich):" + SQL(`CREATE OR ALTER TRIGGER dbo.trg_bestellposition_artikel_aktiv
ON dbo.bestellposition
AFTER INSERT, UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (SELECT 1
             FROM inserted i
             JOIN dbo.artikel a ON a.artnr = i.artnr
             WHERE a.aktiv = 0)
  BEGIN
    ROLLBACK TRANSACTION;
    THROW 50010, N'Inaktive Artikel können nicht bestellt werden', 1;
  END
END;`),
      technical: "Der ROLLBACK im Trigger rollt die gesamte Transaktion zurück, inklusive aller vorherigen Anweisungen einer umgebenden Prozedur-Transaktion; der Batch wird abgebrochen. In der aufrufenden Prozedur landet man daher im CATCH, wo <code>@@TRANCOUNT</code> bereits 0 ist – deshalb dort immer <code>IF @@TRANCOUNT &gt; 0</code> vor dem ROLLBACK. Mit <code>IF UPDATE(spalte)</code> kann man prüfen, ob eine Spalte im SET vorkam (nicht, ob sich der Wert geändert hat)." } },
    { t: "text", h: "Zusatzaufgaben: Protokollierung ohne Umgehungsmöglichkeit", levels: {
      simple: "Jede Preisänderung wird automatisch mitgeschrieben – egal, ob sie aus der App, aus SSMS oder aus einer Prozedur kommt.",
      normal: SQL(`CREATE OR ALTER TRIGGER dbo.trg_artikel_preislog
ON dbo.artikel
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF UPDATE(vk)
    INSERT INTO dbo.preis_log (artnr, vk_alt, vk_neu, geaendert_am, geaendert_von)
    SELECT d.artnr, d.vk, i.vk, SYSDATETIME(), SUSER_SNAME()
    FROM deleted d
    JOIN inserted i ON i.artnr = d.artnr
    WHERE d.vk &lt;&gt; i.vk;
END;`) + "Der JOIN von deleted (alt) und inserted (neu) über den Primärschlüssel liefert für jede geänderte Zeile alten und neuen Wert.",
      technical: "Wird der Primärschlüssel selbst geändert, funktioniert der JOIN über den PK nicht mehr – ein Grund, PKs unveränderlich zu halten (z. B. IDENTITY). SQL Server bietet für reine Historisierung auch System-Versioned Temporal Tables." } },
    { t: "text", h: "Ersatzhandlungen mit INSTEAD OF", levels: {
      simple: "Statt einen Kunden wirklich zu löschen, wird er nur auf „inaktiv“ gesetzt.",
      normal: "Beispiele der Folien: <b>deaktivieren anstelle von löschen</b>; Änderungen an einer schreibgeschützten <b>Sicht</b> auf die dahinterliegenden Tabellen übertragen." + SQL(`CREATE OR ALTER TRIGGER dbo.trg_kunde_soft_delete
ON dbo.kunde
INSTEAD OF DELETE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE k
  SET aktiv = 0
  FROM dbo.kunde k
  JOIN deleted d ON d.kdnr = k.kdnr;
END;`),
      technical: "Eine Sicht über mehrere Tabellen ist meist nicht direkt änderbar; ein INSTEAD-OF-INSERT-Trigger auf der Sicht kann die Werte aus <code>inserted</code> auf die Basistabellen verteilen. Wichtig: Der INSTEAD-OF-Trigger ersetzt die Anweisung vollständig – vergisst man die eigentliche Aktion, passiert schlicht nichts." } },
    { t: "warnbox", html: "Häufigster Triggerfehler: <code>SELECT @artnr = artnr FROM inserted</code> – das funktioniert nur bei <b>einer</b> Zeile. Bei einem UPDATE auf 100 Zeilen wird nur eine geprüft. Trigger immer <b>mengenorientiert</b> (EXISTS/JOIN) schreiben." },
    { t: "widget", w: "gapfill", topic: "dba-trigger", title: "Trigger-Lücken", items: [{ s: "Die alten Werte bei einem UPDATE stehen in der Tabelle ___.", a: ["deleted"] }, { s: "Soll ein Löschen durch Deaktivieren ersetzt werden, verwendet man einen ___ OF DELETE-Trigger.", a: ["INSTEAD"] }, { s: "Passt etwas nicht, macht der Trigger ein ___ TRANSACTION.", a: ["ROLLBACK"] }] },
    { t: "check", q: "Warum ist ein Trigger zum Protokollieren von Preisänderungen besser als dieselbe Logik in der App?", opts: ["Trigger sind immer schneller","Die App darf keine INSERTs ausführen","Er läuft ohne Umgehungsmöglichkeit, egal woher die Änderung kommt","Trigger brauchen keine Transaktion"], a: 2, why: "„Automatische Ausführung von Zusatzaufgaben ohne Umgehungsmöglichkeit“ – auch bei Änderungen aus SSMS oder anderen Clients." }
  ]},
  { id: "dba4-3", title: "Deklarative vs. prozedurale Integrität", topic: "dba-integ", min: 15, xp: 0, blocks: [
    { t: "lead", html: "Lernziel laut Syllabus: <b>prozedurale Mechanismen zur Konsistenzprüfung</b> konstruieren und <b>taugliche von untauglichen Lösungen unterscheiden</b>. Die erste Frage ist immer: Reicht ein Constraint?" },
    { t: "text", h: "Deklarative Integrität: Constraints", levels: {
      simple: "Constraints sind Regeln, die man direkt an die Tabelle schreibt. Die Datenbank hält sie automatisch ein.",
      normal: "<table class=\"dt\"><tr><th>Constraint</th><th>Beispiel im Schema</th></tr><tr><td>NOT NULL</td><td><code>name NVARCHAR(100) NOT NULL</code></td></tr><tr><td>PRIMARY KEY</td><td><code>pk_lagerstand (artnr, lagernr)</code></td></tr><tr><td>UNIQUE</td><td><code>uq_kunde_email</code></td></tr><tr><td>FOREIGN KEY</td><td><code>fk_pos_artikel REFERENCES dbo.artikel</code></td></tr><tr><td>CHECK</td><td><code>CHECK (menge &gt;= 0)</code>, <code>CHECK (ISJSON(attribute) = 1)</code></td></tr><tr><td>DEFAULT</td><td><code>DEFAULT SYSDATETIME()</code></td></tr></table><b>Deklarativ</b> heißt: Man beschreibt <i>was</i> gelten soll, nicht <i>wie</i> es geprüft wird. Constraints gelten immer, für jeden Client, sind schnell, für den Optimizer sichtbar und selbstdokumentierend.",
      technical: "Fremdschlüssel können mit <code>ON DELETE/UPDATE CASCADE | SET NULL | SET DEFAULT | NO ACTION</code> referenzielle Aktionen auslösen. Ein CHECK-Constraint sieht nur die eigene Zeile; Skalar-UDFs in CHECKs, die andere Tabellen lesen, sind möglich, aber gefährlich (zeilenweise Auswertung, nicht bei jeder Änderung der anderen Tabelle geprüft). Constraints mit <code>WITH NOCHECK</code> nachträglich angelegt sind „untrusted“ und werden vom Optimizer nicht genutzt." } },
    { t: "text", h: "Prozedurale Integrität: Trigger und Prozeduren", levels: {
      simple: "Wenn eine Regel zu kompliziert für einen Constraint ist, schreibt man sie als Code – in einen Trigger (gilt immer) oder in eine Prozedur (gilt nur, wenn die Prozedur benutzt wird).",
      normal: "Für Regeln, die ein Constraint nicht abbilden kann – z. B. <b>tabellenübergreifende Bedingungen</b>, Zustandsübergänge (Status „storniert“ darf nicht mehr „offen“ werden), Summenregeln über mehrere Zeilen:<ul><li><b>Trigger</b>: greifen bei jeder Änderung der Tabelle, nicht umgehbar</li><li><b>Stored Procedure</b>: prüft im Rahmen eines Prozesses; wirkt nur, wenn alle Änderungen über die Prozedur laufen (mit indirekten Berechtigungen erzwingbar)</li></ul>Reihenfolge der Prüfungen beim SQL Server: INSTEAD-OF-Trigger → <b>Constraints</b> → AFTER-Trigger.",
      technical: "Faustregel für taugliche Lösungen: <b>so deklarativ wie möglich, so prozedural wie nötig</b>. Untaugliche Lösungen sind etwa: Regeln nur im Frontend prüfen (umgehbar), Trigger, die nur die erste Zeile prüfen, Prüfungen außerhalb der Transaktion (Race Conditions), Cursor-Schleifen für Prüfungen, die ein EXISTS erledigen könnte, oder ein Trigger für etwas, das ein CHECK/FK schon kann (langsamer, unübersichtlicher, schwerer zu warten)." } },
    { t: "widget", w: "sorter", topic: "dba-integ", title: "Welcher Mechanismus passt?", cats: [{ k: "c", label: "Constraint (deklarativ)" }, { k: "t", label: "Trigger" }, { k: "p", label: "Prüfung in Prozedur" }],
      items: [{ t: "Menge einer Bestellposition muss größer 0 sein", a: "c", why: "CHECK (menge > 0)" }, { t: "E-Mail-Adresse darf nur einmal vorkommen", a: "c", why: "UNIQUE" }, { t: "Position darf nur auf existierenden Artikel verweisen", a: "c", why: "FOREIGN KEY" }, { t: "Inaktive Artikel dürfen nicht in neue Positionen", a: "t", why: "Tabellenübergreifend, muss immer gelten." }, { t: "Jede Preisänderung protokollieren", a: "t", why: "Zusatzaufgabe ohne Umgehungsmöglichkeit." }, { t: "Bestellung nur anlegen, wenn Lagerstand reicht, und dabei abbuchen", a: "p", why: "Teil eines mehrstufigen Prozesses in einer Transaktion." }, { t: "Kunde muss beim Registrieren einen Fehlercode bekommen, wenn E-Mail schon vergeben ist", a: "p", why: "Rückmeldung an die API; der UNIQUE-Constraint sichert zusätzlich ab." }] },
    { t: "tip", html: "Im Code-Review gut argumentieren: „Ich habe <code>CHECK (menge &gt; 0)</code> statt einer Prüfung im Trigger gewählt, weil Constraints immer gelten, vor den AFTER-Triggern geprüft werden und keinen Code brauchen.“" },
    { t: "check", q: "Welche Lösung ist für „Lagerstand darf nie negativ werden“ am tauglichsten?", opts: ["Prüfung nur in der Mobile App","Cursor, der nachts alle negativen Bestände auf 0 setzt","AFTER-Trigger, der die erste Zeile aus inserted prüft","CHECK (menge >= 0) auf dbo.lagerstand"], a: 3, why: "Einzeilige Regel → deklarativ. Die anderen Varianten sind umgehbar, zu spät oder fehlerhaft bei mehreren Zeilen." }
  ]}
 ]},
 { id: "dbaw5", n: 5, title: "Sicherheit & JSON", sub: "Indirekte Zugriffe, SQL-Injection, JSON-Funktionen", boss: { id: "boss-dbaw5", title: "Kapiteltest: Sicherheit & JSON", topics: ["dba-sec", "dba-inj", "dba-json"] }, lessons: [
  { id: "dba5-1", title: "Indirekte Zugriffe und Berechtigungen", topic: "dba-sec", min: 15, xp: 0, blocks: [
    { t: "lead", html: "Die Anwendung bekommt Rechte auf <b>Sichten und Prozeduren</b> – nicht auf die Tabellen dahinter. So darf sie genau das, was die Prozedur erledigt, und nicht mehr." },
    { t: "keys", items: ["Berechtigungen über <b>Sichten und gespeicherte Prozeduren</b>", "Berechtigungen auf die dahinterliegenden Tabellen werden <b>nicht benötigt</b>", "Einschränkung auf das, was eine Sicht bereitstellt oder eine Prozedur erledigt", "Standardmäßig auf das <b>Schema</b> beschränkt", "Ermöglicht eine stark differenzierte Berechtigungssteuerung"] },
    { t: "text", h: "Anmeldung, Benutzer, Rollen beim SQL Server", levels: {
      simple: "Zuerst meldet man sich am Server an (Login). In jeder Datenbank braucht man dann einen Benutzer. Rechte vergibt man am besten an Rollen, nicht an einzelne Benutzer.",
      normal: "<ul><li><b>Anmeldung (Login)</b> auf Serverebene – per <b>Windows-Authentifizierung</b> (Windows-Domäne) oder <b>SQL-Server-Authentifizierung</b> (Name + Kennwort)</li><li><b>Serverrollen</b> bündeln Rechte auf Serverebene</li><li>Pro Datenbank (DB1, DB2, DB3 …) ein <b>Benutzer</b>, der einer Anmeldung zugeordnet ist</li><li><b>Datenbankrollen</b> bündeln Rechte innerhalb der Datenbank</li></ul>Zugriff von überall: Windows, Linux/Unix, Web, WAN, VPN, iOS, Android. Im Projekt: Datenbank <code>WINF25_dbaent_nn</code>, Benutzer <code>app_user24nn</code>, Rolle <code>app_role</code>." + SQL(`CREATE ROLE app_role;
GRANT EXECUTE ON OBJECT::dbo.sp_backend_wrapper TO app_role;
-- KEINE Rechte auf dbo.kunde, dbo.artikel ... nötig!
CREATE USER app_user FOR LOGIN app_login;
ALTER ROLE app_role ADD MEMBER app_user;`),
      technical: "Technische Grundlage ist die <b>Ownership Chain</b>: Gehören Prozedur und Tabellen demselben Besitzer (typisch: Schema dbo), prüft der Server beim Zugriff aus der Prozedur keine Rechte auf die Tabellen mehr. Die Kette bricht bei <b>dynamischem SQL</b> (<code>EXEC(@sql)</code>/<code>sp_executesql</code>) und bei Objekten mit anderem Besitzer – dann braucht der Aufrufer doch Tabellenrechte, oder man arbeitet mit <code>EXECUTE AS</code> bzw. Modul-Signierung. <code>GRANT EXECUTE ON SCHEMA::dbo</code> würde alle Prozeduren eines Schemas freigeben." } },
    { t: "text", h: "Relevanz in der Praxis", levels: {
      simple: "Bei Standardsoftware wenig beliebt, bei Individualsoftware sehr. Durch Cloud, SaaS und JSON wird DB-Programmierung wichtiger.",
      normal: "<ul><li>Wegen fehlender einheitlicher Syntax verschiedener Systeme bei Entwickler:innen von <b>Standardsoftware oft verpönt</b> (die Software soll auf vielen DBMS laufen)</li><li>Beliebt bei Entwickler:innen von <b>Individualsoftware</b></li><li>Durch den Trend zu <b>Cloud und Software as a Service</b> steigt die Bedeutung datenbankseitiger Programmierung</li><li>Bedeutung steigt durch die <b>Verarbeitbarkeit von JSON</b></li></ul>",
      technical: "Bei SaaS betreibt der Hersteller selbst die DB – die Plattformunabhängigkeit verliert an Gewicht, die Vorteile (Performance, Sicherheit, zentrale Logik für viele Clients) bleiben." } },
    { t: "widget", w: "pairs", topic: "dba-sec", title: "Sicherheitsbegriffe", pairs: [["Login / Anmeldung", "Zugang auf Serverebene"], ["Datenbankbenutzer", "einer Anmeldung zugeordnet, gilt in einer DB"], ["Datenbankrolle", "bündelt Rechte für mehrere Benutzer"], ["GRANT EXECUTE", "erlaubt das Ausführen einer Prozedur"], ["Ownership Chain", "Tabellenrechte entfallen bei gleichem Besitzer"], ["Dynamisches SQL", "unterbricht die Besitzkette"]] },
    { t: "check", q: "app_role hat nur EXECUTE auf dbo.sp_backend_wrapper. Die Prozedur liest dbo.kunde (gleicher Besitzer dbo). Was passiert?", opts: ["Fehler: SELECT-Recht auf dbo.kunde fehlt","Funktioniert nur mit Windows-Authentifizierung","Funktioniert dank Besitzkette, direkter SELECT auf dbo.kunde bleibt verboten","app_role bekommt automatisch SELECT auf alle Tabellen"], a: 2, why: "Indirekter Zugriff: Rechte auf die Tabellen werden nicht benötigt, solange die Kette nicht bricht." }
  ]},
  { id: "dba5-2", title: "SQL-Injection", topic: "dba-inj", min: 12, xp: 0, blocks: [
    { t: "lead", html: "SQL-Injection = <b>Einschleusung von SQL-Statements</b> innerhalb anderer Anweisungen. Gefährlich, sobald SQL aus Texten zusammengesetzt wird." },
    { t: "text", h: "Das Beispiel der Folien", levels: {
      simple: "Ein Angreifer tippt in das Benutzerfeld ein Stück SQL. Weil der Text einfach eingeklebt wird, ändert sich die Bedeutung des Befehls – und das Kennwort wird nie geprüft.",
      normal: "Login-Abfrage per String-Verkettung:" + SQL(`sql = "SELECT id FROM benutzer WHERE benutzername = '" _
      &amp; benutzer &amp; "' AND pwd = '" &amp; kennwort &amp; "';"`) + "Normale Eingabe <code>impfer</code> / <code>stich4all@IMA!</code> ergibt die erwartete Abfrage. Mit Benutzer <code>hihi' OR 1 = 1;--</code> entsteht:" + SQL(`SELECT id
FROM benutzer
WHERE benutzername = 'hihi' OR 1 = 1;
--' AND pwd = 'you can me crosswise';`) + "Das <code>'</code> schließt den String, <code>OR 1 = 1</code> macht die Bedingung immer wahr, <code>--</code> kommentiert die Kennwortprüfung aus. Ergebnis: Login ohne Kennwort.",
      technical: "Gefährlicher noch: gestapelte Anweisungen (<code>'; DROP TABLE benutzer;--</code>), UNION-basierte Angriffe zum Auslesen anderer Tabellen oder Blind Injection über Zeitverzögerungen (<code>WAITFOR DELAY</code>). Kennwörter gehören übrigens nie im Klartext in eine Tabelle, sondern als gesalzener Hash." } },
    { t: "text", h: "Abwehr", levels: {
      simple: "Benutzereingaben immer als Parameter übergeben, nie in den SQL-Text kleben.",
      normal: "<ul><li><b>Sofortmaßnahme:</b> <code>'</code> in jeder Benutzereingabe durch zwei <code>''</code> ersetzen</li><li><b>Richtig:</b> Benutzereingaben in Client-Anwendungen als <b>Parameter</b> übergeben (Client-Bibliotheken, Stored Procedures)</li><li>Zusätzlich: indirekte Zugriffe – selbst wenn etwas eingeschleust würde, hat der Benutzer keine Tabellenrechte</li></ul>Auch <b>innerhalb</b> einer Prozedur gilt: dynamisches SQL nur mit Parametern:" + SQL(`-- unsicher
SET @sql = N'SELECT * FROM dbo.kunde WHERE name = ''' + @name + N'''';
EXEC (@sql);

-- sicher
SET @sql = N'SELECT * FROM dbo.kunde WHERE name = @n';
EXEC sp_executesql @sql, N'@n NVARCHAR(100)', @n = @name;`),
      technical: "Objektnamen (Tabellen, Spalten) lassen sich nicht parametrisieren – dafür <code>QUOTENAME(@spalte)</code> verwenden und gegen eine Whitelist (z. B. <code>sys.columns</code>) prüfen. Das Verdoppeln von Hochkommas schützt nur Stringliterale, nicht Zahlen ohne Anführungszeichen. Eine Prozedur ohne dynamisches SQL ist per Konstruktion injection-sicher, weil Parameter immer als Werte behandelt werden." } },
    { t: "widget", w: "gapfill", topic: "dba-inj", title: "Injection verstehen", items: [{ s: "Mit -- beginnt in SQL ein ___, der den Rest der Zeile ignoriert.", a: ["Kommentar"] }, { s: "Sofortmaßnahme: jedes ' in Benutzereingaben durch ___ Hochkommas ersetzen.", a: ["zwei", "2"] }, { s: "Dynamisches SQL mit Parametern führt man mit ___ aus.", a: ["sp_executesql"] }] },
    { t: "check", q: "Welche Maßnahme schützt am zuverlässigsten gegen SQL-Injection?", opts: ["Benutzereingaben als typisierte Parameter übergeben","Eingaben in Großbuchstaben umwandeln","Die Länge der Eingabe auf 50 Zeichen begrenzen","Fehlermeldungen ausblenden"], a: 0, why: "Parameter werden nie als SQL-Code interpretiert, sondern immer als Wert." }
  ]},
  { id: "dba5-3", title: "JSON in der Datenbank", topic: "dba-json", min: 20, xp: 0, blocks: [
    { t: "lead", html: "JSON ist in vielen Backends das bevorzugte Format. Stored Procedures für sicheren Datenzugriff mit JSON in der Kommunikation zu kombinieren, bietet sich an – genau so funktioniert das Praxisprojekt." },
    { t: "text", h: "Wann JSON speichern – und wann nicht", levels: {
      simple: "JSON eignet sich für Zusatzinfos ohne feste Struktur, z. B. besondere Produkteigenschaften. Wonach man oft sucht oder filtert, gehört in eine normale Spalte.",
      normal: "Speichern von <b>Zusatzinformationen</b> zu Datensätzen, z. B. spezielle Eigenschaften bei Produkten (Farbe beim Shirt, Akkulaufzeit beim Handy):<ul><li>keine fixe Struktur vorgegeben → hohe Flexibilität</li><li>unabhängig vom Datenmodell bei Erweiterungen</li><li><b>nicht sinnvoll</b> für Informationen, die als <b>Filterkriterien</b> relevant sind – dafür ist eine <b>indizierbare Spalte</b> besser</li></ul>Im Schema: <code>artikel.attribute NVARCHAR(MAX)</code> mit <code>CHECK (ISJSON(attribute) = 1)</code>.",
      technical: "Bis SQL Server 2022 wird JSON als <code>NVARCHAR</code> gespeichert; SQL Server 2025 bringt einen nativen <code>json</code>-Datentyp. Muss doch nach einem JSON-Wert gefiltert werden, kann man eine berechnete Spalte <code>AS JSON_VALUE(attribute, '$.farbe')</code> anlegen und diese indizieren." } },
    { t: "html", html: `<table class="dt"><tr><th>Funktion</th><th>Zweck</th></tr><tr><td><code>JSON_OBJECT()</code></td><td>Objekt erstellen</td></tr><tr><td><code>JSON_ARRAY()</code></td><td>Array erstellen</td></tr><tr><td><code>JSON_MODIFY()</code></td><td>Attributwerte ändern, ergänzen oder entfernen</td></tr><tr><td><code>JSON_VALUE()</code></td><td>skalaren Attributwert auslesen</td></tr><tr><td><code>JSON_QUERY()</code></td><td>nicht skalaren Wert (Array, Objekt) auslesen</td></tr><tr><td><code>ISJSON()</code></td><td>prüfen, ob gültiges JSON vorliegt</td></tr><tr><td><code>JSON_PATH_EXISTS()</code></td><td>prüfen, ob ein Pfad vorhanden ist</td></tr><tr><td><code>JSON_OBJECTAGG()</code> / <code>JSON_ARRAYAGG()</code></td><td>neu in SQL Server 2025: Objekt bzw. Array aus einer Gruppierung</td></tr></table>` },
    { t: "text", h: "JSON-Funktionen anwenden", levels: {
      simple: "JSON_VALUE holt einen einzelnen Wert, JSON_QUERY ein ganzes Objekt oder Array. Pfade beginnen mit $.",
      normal: SQL(`DECLARE @j NVARCHAR(MAX) =
  N'{"typ":"preisabfrage","parameter":{"artnr":123456,"brutto":true}}';

SELECT ISJSON(@j)                              AS gueltig,     -- 1
       JSON_VALUE(@j, '$.typ')                 AS typ,         -- preisabfrage
       JSON_VALUE(@j, '$.parameter.artnr')     AS artnr,       -- 123456
       JSON_QUERY(@j, '$.parameter')           AS parameter,   -- {"artnr":...}
       JSON_PATH_EXISTS(@j, '$.parameter.lager') AS hat_lager; -- 0

SET @j = JSON_MODIFY(@j, '$.parameter.lager', 3);     -- ergänzen
SET @j = JSON_MODIFY(@j, '$.parameter.brutto', NULL); -- entfernen

SELECT JSON_OBJECT('ok': CAST(1 AS BIT), 'preis': 13.89) AS antwort,
       JSON_ARRAY(1089, 1244, 1366)                     AS artikelliste;`),
      technical: "<code>JSON_VALUE</code> liefert <code>NVARCHAR(4000)</code> – Zahlen und <code>true</code>/<code>false</code> kommen als Text und müssen ggf. konvertiert werden. Auf ein Objekt angewandt liefert JSON_VALUE NULL (im Standardmodus lax), JSON_QUERY auf einen Skalar ebenfalls NULL; mit dem Präfix <code>strict $.…</code> gibt es stattdessen einen Fehler. JSON_MODIFY mit NULL entfernt im lax-Modus den Schlüssel. Ein JSON_OBJECT als Wert in einem anderen JSON_OBJECT wird als verschachteltes Objekt eingebettet, nicht als String." } },
    { t: "text", h: "JSON aus Tabellendaten und zurück", levels: {
      simple: "FOR JSON macht aus einem SELECT-Ergebnis JSON. OPENJSON macht aus JSON wieder eine Tabelle.",
      normal: "<b>Tabelle → JSON</b> mit <code>FOR JSON AUTO</code> (Struktur automatisch aus den Tabellen des SELECT) oder <code>FOR JSON PATH</code> (Struktur über Spaltenaliase mit Punkten steuerbar):" + SQL(`SELECT a.artnr        AS [nr],
       a.bezeichnung  AS [name],
       a.vk           AS [preis.netto],
       dbo.fn_brutto(a.vk, a.ust_satz) AS [preis.brutto]
FROM dbo.artikel a
WHERE a.aktiv = 1
FOR JSON PATH, ROOT('artikel');
-- {"artikel":[{"nr":1089,"name":"...","preis":{"netto":10.00,"brutto":12.00}}, ...]}`) + "<b>JSON → Tabelle</b> mit <code>FROM OPENJSON(…)</code>, z. B. die Positionen einer Bestellung aus der App:" + SQL(`DECLARE @pos NVARCHAR(MAX) =
  N'[{"artnr":1089,"menge":2},{"artnr":1244,"menge":1}]';

SELECT artnr, menge
FROM OPENJSON(@pos)
WITH (artnr INT '$.artnr',
      menge INT '$.menge');`),
      technical: "Optionen: <code>WITHOUT_ARRAY_WRAPPER</code> (Einzelobjekt statt Array), <code>INCLUDE_NULL_VALUES</code> (NULL-Spalten nicht weglassen), <code>ROOT('name')</code>. OPENJSON ohne WITH liefert die Spalten <code>key</code>, <code>value</code>, <code>type</code>; mit WITH ein typisiertes Schema. Verschachtelte Arrays: <code>positionen NVARCHAR(MAX) '$.positionen' AS JSON</code> und dann <code>CROSS APPLY OPENJSON(positionen)</code>. OPENJSON benötigt Kompatibilitätsgrad ≥ 130. Mengenorientiert: <code>INSERT INTO … SELECT … FROM OPENJSON(…)</code> fügt alle Positionen in einer Anweisung ein – kein Cursor nötig." } },
    { t: "widget", w: "pairs", topic: "dba-json", title: "JSON-Funktion und Zweck", pairs: [["JSON_VALUE", "liest einen skalaren Wert"], ["JSON_QUERY", "liest ein Objekt oder Array"], ["JSON_MODIFY", "ändert, ergänzt oder entfernt ein Attribut"], ["ISJSON", "prüft auf gültiges JSON"], ["OPENJSON", "zerlegt JSON in Tabellenform"], ["FOR JSON PATH", "erzeugt JSON aus einem SELECT, Struktur über Aliase"]] },
    { t: "check", q: "Mit welcher Funktion liest du aus {\"parameter\":{\"artnr\":5}} das ganze Objekt „parameter“ aus?", opts: ["JSON_VALUE(@j, '$.parameter')","JSON_MODIFY(@j, '$.parameter')","ISJSON(@j, '$.parameter')","JSON_QUERY(@j, '$.parameter')"], a: 3, why: "Nicht skalare Werte (Objekt, Array) liest JSON_QUERY; JSON_VALUE würde hier NULL liefern." },
    { t: "check", q: "Ein Shop filtert sehr häufig nach der Farbe eines Artikels. Wohin gehört die Farbe?", opts: ["in das JSON-Attributfeld","in eine eigene, indizierbare Spalte","in einen Trigger","in eine Skalarfunktion"], a: 1, why: "JSON ist nicht sinnvoll für Filterkriterien – dafür eine indizierbare Spalte." }
  ]}
 ]},
 { id: "dbaw6", n: 6, title: "Praxisprojekt & Code-Review", sub: "Vorgehensmodell, Backend-Wrapper, Review-Vorbereitung", boss: { id: "boss-dbaw6", title: "Kapiteltest: Praxisprojekt", topics: ["dba-proc", "dba-proj", "dba-sp", "dba-json"] }, lessons: [
  { id: "dba6-1", title: "Vorgehensmodell: von Anforderungen zur Implementierung", topic: "dba-proc", min: 14, xp: 0, blocks: [
    { t: "lead", html: "Laut Syllabus erstellst du Datenbankanwendungen, indem du ein <b>Vorgehensmodell</b> anwendest: <b>Anforderungen analysieren → Datenmodell planen und konstruieren → Funktionen zu dessen Nutzung entwickeln</b>." },
    { t: "text", h: "Die Phasen im DB-Projekt", levels: {
      simple: "Erst klären, was die App können soll. Dann die Tabellen planen. Dann die Prozeduren schreiben. Dann testen.",
      normal: "<ol><li><b>Anforderungen</b>: Welche Anwendungsfälle hat die App? Daraus entsteht eine Liste von Aufrufen (z. B. „preisabfrage“, „bestellung“), jeweils mit Eingabe-JSON und erwarteter Antwort – abgestimmt mit dem MAPPDEV-Teil.</li><li><b>Datenmodell</b>: ER-Modell, Normalisierung (mind. 3. NF), Schlüssel, Datentypen, Constraints. Welche Regeln deklarativ, welche prozedural?</li><li><b>Implementierung</b>: DDL-Skript, Einzelprozeduren, Wrapper, Trigger, Funktionen – als wiederholbar ausführbare Skripte.</li><li><b>Test</b>: jede Prozedur mit gültigen und ungültigen Eingaben, Grenzfällen, mehreren Zeilen, Fehlerpfaden.</li><li><b>Betrieb/Weiterentwicklung</b>: Berechtigungen, Änderungsskripte.</li></ol>",
      technical: "Software-Engineering-Praktiken in der DB-Entwicklung: Skripte versionieren (Git), Namenskonventionen (<code>pk_</code>, <code>fk_</code>, <code>ck_</code>, <code>trg_</code>, <code>fn_</code>), idempotente Skripte (<code>CREATE OR ALTER</code>, <code>DROP … IF EXISTS</code>), ein zentraler Fehlercode-Katalog, Testskripte mit erwarteten Ergebnissen, Kommentare zu nicht offensichtlichen Entscheidungen. Iterative Vorgehensmodelle passen gut zur gemeinsamen Entwicklung mit dem App-Team: kleine Funktionen nacheinander end-to-end fertigstellen." } },
    { t: "text", h: "Backend oder Frontend? Anwendungsszenarien erkennen", levels: {
      simple: "Was alle Clients betrifft und mit Daten zu tun hat, gehört ins Backend. Was nur die Bedienung betrifft, ins Frontend.",
      normal: "Lernziel: Anwendungsszenarien für Entwicklungen im <b>Backend</b> und im <b>Frontend</b> erkennen, unterscheiden und gezielt einsetzen. Backend: Datenintegrität, Geschäftsregeln, Berechtigungen, mehrstufige Datenprozesse, Auswertungen. Frontend: Darstellung, Benutzerführung, Komfortprüfungen (sofortiges Feedback), Offline-Zwischenspeicherung. Viele Prüfungen gibt es sinnvoll <b>doppelt</b>: im Frontend für die Bedienbarkeit, im Backend für die Sicherheit.",
      technical: "Fehlermeldungen: Die Folien sehen vor, dass Prozeduren einen <b>Fehlercode</b> und eventuell einen Fehlertext liefern – Sprache und Logik liegen in der Datenbank. Alternativ übersetzt die App Codes in Texte; wichtig ist ein dokumentierter, stabiler Katalog." } },
    { t: "widget", w: "sorter", topic: "dba-proc", title: "Welche Phase?", cats: [{ k: "a", label: "Anforderungen" }, { k: "d", label: "Datenmodell" }, { k: "i", label: "Implementierung/Test" }],
      items: [{ t: "Mit dem App-Team festlegen, welche JSON-Aufrufe es gibt", a: "a", why: "" }, { t: "ER-Diagramm zeichnen und normalisieren", a: "d", why: "" }, { t: "Entscheiden, dass „Menge größer 0“ als CHECK umgesetzt wird", a: "d", why: "" }, { t: "sp_bestellung_anlegen mit TRY/CATCH schreiben", a: "i", why: "" }, { t: "Use Case „Kunde sieht seine Bestellungen“ beschreiben", a: "a", why: "" }, { t: "Wrapper mit ungültigem JSON aufrufen und Antwort prüfen", a: "i", why: "" }] },
    { t: "check", q: "Warum wird eine E-Mail-Prüfung oft sowohl in der App als auch in der Datenbank umgesetzt?", opts: ["Weil SQL Server keine UNIQUE-Constraints kennt","App: schnelles Feedback für die Bedienung; DB: nicht umgehbare Absicherung","Weil die App keine Fehlermeldungen anzeigen kann","Das ist ein Fehler und sollte vermieden werden"], a: 1, why: "Frontend-Prüfungen sind Komfort, die DB garantiert die Integrität für alle Clients." }
  ]},
  { id: "dba6-2", title: "Projektaufbau: API, Backend-Wrapper und Einzelprozeduren", topic: "dba-proj", min: 22, xp: 0, blocks: [
    { t: "lead", html: "Projekt-Aufbau: <b>Datenbank</b> als relationale Datenquelle (DBAENT) · <b>API-Schnittstelle</b> (SOAP-Protokoll, bereitgestellt) für vereinheitlichten, sicheren Zugriff · <b>Mobile App</b> als GUI für Endanwender (MAPPDEV)." },
    { t: "html", html: `<table class="dt"><tr><th>MAPPDEV</th><th>API (bereitgestellt)</th><th>DBAENT</th></tr><tr><td>Mobile App</td><td>https://mappdev-db-WINF25.ima.fh-joanneum.at/service/nn</td><td>Server IMAMSSQL, DB <code>WINF25_dbaent_nn</code>, User <code>app_user24nn</code>, Role <code>app_role</code></td></tr><tr><td colspan="3">App ⇄ <b>JSON</b> ⇄ API (DB-Connection) ⇄ <b>JSON</b> ⇄ <code>dbo.sp_backend_wrapper @input nvarchar(max), @output nvarchar(max)</code></td></tr></table>` },
    { t: "keys", items: ["<b>Eine einheitliche Prozedur für alle Zugriffe</b> (lesen und schreiben): <code>dbo.sp_backend_wrapper</code> mit <code>@input</code> und <code>@output</code> (je <code>nvarchar(max)</code>)", "Bekommt das JSON, das der API übergeben wird, <b>direkt durchgereicht</b>", "Das JSON enthält alles: <b>was zu tun ist</b> und <b>alle nötigen Eingabewerte</b>", "Der Wrapper erkennt am Inhalt, <b>welche Prozedur</b> aufzurufen ist, und gibt Informationen als JSON an die API zurück", "Einzelprozeduren: Parameter auslesen, Prozess abbilden, Rückmeldung erzeugen (Erfolg mit Ergebnis oder Fehlercode + ggf. Fehlertext)"] },
    { t: "text", h: "Logik im Wrapper – ein Gerüst", levels: {
      simple: "Der Wrapper liest aus dem JSON den „typ“, ruft die passende Prozedur auf und verpackt deren Ergebnis wieder als JSON mit ok, fehlercode, fehler und ergebnis.",
      normal: "Beispiel der Folien: Eingabe <code>{\"typ\":\"preisabfrage\",\"parameter\":{\"artnr\":123456,\"brutto\":true}}</code> → <code>EXEC dbo.sp_artikelpreis …</code> → Antwort <code>{\"ok\":true,\"fehlercode\":null,\"fehler\":null,\"ergebnis\":{\"preis\":13.89}}</code>. Ein mögliches Gerüst (Einzelprozedur mit Skalarwerten, siehe dba3-1):" + SQL(`CREATE OR ALTER PROCEDURE dbo.sp_backend_wrapper
  @input  NVARCHAR(MAX),
  @output NVARCHAR(MAX) OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @typ NVARCHAR(50), @rc INT,
          @artnr INT, @brutto BIT, @preis DECIMAL(10,2);
  BEGIN TRY
    IF ISNULL(ISJSON(@input), 0) = 0
      THROW 50100, N'Ungültiges JSON', 1;

    SET @typ = JSON_VALUE(@input, '$.typ');

    IF @typ = N'preisabfrage'
    BEGIN
      SET @artnr  = JSON_VALUE(@input, '$.parameter.artnr');
      SET @brutto = CASE JSON_VALUE(@input, '$.parameter.brutto')
                         WHEN 'true' THEN 1 ELSE 0 END;
      EXEC @rc = dbo.sp_artikelpreis @artnr = @artnr, @brutto = @brutto,
                                     @preis = @preis OUTPUT;
      IF @rc &lt;&gt; 0
        THROW 50200, N'Artikel nicht gefunden', 1;

      SET @output = JSON_OBJECT('ok': CAST(1 AS BIT), 'fehlercode': NULL,
                                'fehler': NULL,
                                'ergebnis': JSON_OBJECT('preis': @preis));
    END
    ELSE
      THROW 50101, N'Unbekannter Typ', 1;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT &gt; 0 ROLLBACK TRANSACTION;
    SET @output = JSON_OBJECT('ok': CAST(0 AS BIT),
                              'fehlercode': ERROR_NUMBER(),
                              'fehler': ERROR_MESSAGE(),
                              'ergebnis': NULL);
  END CATCH
END;`) + "Weitere Typen werden als zusätzliche <code>ELSE IF @typ = N'…'</code>-Zweige ergänzt.",
      technical: "Designentscheidungen, die man begründen können sollte: Der Wrapper fängt alle Fehler und liefert immer ein gültiges JSON (die API muss nie eine SQL-Exception interpretieren). <code>ISNULL(ISJSON(@input), 0)</code>, weil ISJSON(NULL) NULL liefert. Fehlercodes ≥ 50000 für fachliche Fehler, Systemfehler (z. B. 547 Constraint-Verletzung) werden durchgereicht oder auf eigene Codes gemappt. Die Rolle <code>app_role</code> braucht nur EXECUTE auf den Wrapper; die Einzelprozeduren sind über die Besitzkette erreichbar. Testen in SSMS:" + SQL(`DECLARE @out NVARCHAR(MAX);
EXEC dbo.sp_backend_wrapper
     @input = N'{"typ":"preisabfrage","parameter":{"artnr":1344,"brutto":true}}',
     @output = @out OUTPUT;
SELECT @out;`) } },
    { t: "text", h: "Überlegungen: Wo wird JSON gelesen und gebaut?", levels: {
      simple: "Drei Möglichkeiten: Die Einzelprozeduren sprechen selbst JSON, oder sie bekommen normale Werte, oder ein eigener „Übersetzer“ dazwischen kümmert sich ums JSON.",
      normal: "<table class=\"dt\"><tr><th>Variante</th><th>Vorteile</th><th>Nachteile</th></tr><tr><td><b>1</b> Wrapper ⇄ <b>JSON</b> ⇄ Einzelprozedur</td><td>Wrapper bleibt schlank (nur Verteiler); neue Felder ohne Signaturänderung</td><td>Einzelprozeduren sind an JSON gebunden, schwerer direkt aufzurufen/zu testen, Parameter untypisiert</td></tr><tr><td><b>2</b> Wrapper ⇄ <b>Skalarwerte</b> ⇄ Einzelprozedur</td><td>Einzelprozeduren typisiert, wiederverwendbar (auch für andere Clients), gut testbar</td><td>Wrapper wird groß: JSON-Lesen und -Bauen für alle Typen an einer Stelle</td></tr><tr><td><b>3</b> Wrapper ⇄ JSON ⇄ <b>JSON-Wrapper</b> ⇄ Skalarwerte ⇄ Einzelprozedur</td><td>Saubere Trennung: Verteilen, Übersetzen, Fachlogik</td><td>Mehr Objekte, mehr Aufrufe, mehr Code</td></tr></table>Dazu kommt die <b>Mischvariante</b>. Es gibt keine einzig richtige Lösung – im Code-Review zählt, dass du deine Wahl und ihre Vorteile gegenüber einer anderen Lösung begründen kannst.",
      technical: "Listen-Ergebnisse (z. B. alle Bestellungen eines Kunden) lassen sich in Variante 1 elegant mit <code>SELECT … FOR JSON PATH</code> direkt in der Einzelprozedur erzeugen; in Variante 2 bräuchte man Resultsets oder Tabellenvariablen, die der Wrapper nicht direkt per EXEC in eine Variable bekommt (nur über <code>INSERT … EXEC</code>). Ein häufiger Kompromiss: Eingaben als Skalarparameter, Listen-Ausgaben als JSON-OUTPUT-Parameter." } },
    { t: "widget", w: "sorter", topic: "dba-proj", title: "Welche Wrapper-Variante beschreibt das?", cats: [{ k: "1", label: "V1: JSON bis in die Einzelprozedur" }, { k: "2", label: "V2: Skalarwerte an Einzelprozedur" }, { k: "3", label: "V3: eigener JSON-Wrapper dazwischen" }],
      items: [{ t: "Die Einzelprozedur hat nur @json_in und @json_out als Parameter", a: "1", why: "" }, { t: "sp_artikelpreis @artnr INT, @brutto BIT, @preis OUTPUT wird direkt vom Backend-Wrapper aufgerufen", a: "2", why: "Wie im Folienbeispiel." }, { t: "Eine Prozedur sp_json_preisabfrage übersetzt JSON in Parameter und ruft dann sp_artikelpreis auf", a: "3", why: "" }, { t: "Der Backend-Wrapper enthält für jeden Typ eigene JSON_VALUE-Aufrufe", a: "2", why: "" }] },
    { t: "check", q: "Welche Parameter hat dbo.sp_backend_wrapper laut Folien?", opts: ["@input nvarchar(max) und @output nvarchar(max)","@typ und @parameter","@json und @rc INT","keine – sie liest aus einer Tabelle"], a: 0, why: "Eine einheitliche Prozedur für alle Zugriffe, Ein- und Ausgabe jeweils als JSON-Text." },
    { t: "check", q: "Warum fängt der Wrapper sämtliche Fehler im CATCH ab und baut daraus ein JSON?", opts: ["Weil THROW im Wrapper verboten ist","Damit Transaktionen nie zurückgerollt werden","Damit die API immer eine einheitliche Antwort (ok/fehlercode/fehler/ergebnis) erhält","Weil JSON_OBJECT nur im CATCH funktioniert"], a: 2, why: "Die Einzelprozeduren erzeugen Erfolgs- oder Fehlermeldungen; die API bekommt immer ein definiertes JSON-Format." }
  ]},
  { id: "dba6-3", title: "Code-Review vorbereiten und Lösungen beurteilen", topic: "dba-proc", min: 14, xp: 0, blocks: [
    { t: "lead", html: "Mit dem Praxisprojekt allein ist maximal ein <b>„Befriedigend“</b> möglich. Für „Gut“ oder „Sehr gut“ gibt es ein freiwilliges, <b>mündliches Code-Review</b> zum DB-Teil – einzeln, mit Fokus auf <b>Code-Verständnis</b>." },
    { t: "callout", html: "Laut Syllabus: Jeder beliebige Codeteil des Projekts muss <b>detailliert erklärt</b> werden können, inklusive der <b>Vorteile gegenüber einer anderen Lösung</b>. Das Review kann die Note verbessern <b>oder verschlechtern</b>. Wer es wählt, muss es mit mindestens <b>60 %</b> positiv abschließen – ein negatives Review führt zu einer negativen Beurteilung des ersten Antritts." },
    { t: "text", h: "Typische Review-Fragen", levels: {
      simple: "Rechne damit, dass du jede Zeile deines Codes erklären und sagen musst, warum du es so und nicht anders gemacht hast.",
      normal: "<ul><li>Was passiert in dieser Zeile genau? Was steht an dieser Stelle in <code>inserted</code>/<code>deleted</code>?</li><li>Warum ein Trigger und kein CHECK-Constraint (oder umgekehrt)?</li><li>Was passiert, wenn das UPDATE 100 Zeilen betrifft?</li><li>Was passiert bei einem Fehler zwischen dem zweiten und dritten Schritt? Wo beginnt und endet die Transaktion?</li><li>Warum OUTPUT-Parameter statt Resultset? Warum Skalarwerte statt JSON an die Einzelprozedur?</li><li>Wie verhindert dein Code SQL-Injection? Welche Rechte hat <code>app_role</code>?</li><li>Könnte man diesen Cursor durch eine Mengenoperation ersetzen?</li></ul>",
      technical: "Gute Antworten nennen <b>Alternative + Kriterium + Entscheidung</b>: „Statt eines Cursors habe ich ein INSERT … SELECT FROM OPENJSON verwendet, weil es eine Mengenoperation ist, atomar läuft und der Optimizer sie als Ganzes plant.“ Bereite für jede Prozedur einen Testaufruf vor, der den Erfolgs- und einen Fehlerpfad zeigt." } },
    { t: "widget", w: "sorter", topic: "dba-proc", title: "Tauglich oder untauglich?", cats: [{ k: "ok", label: "taugliche Lösung" }, { k: "no", label: "untaugliche Lösung" }],
      items: [{ t: "Trigger prüft mit IF EXISTS (SELECT … FROM inserted JOIN …)", a: "ok", why: "Mengenorientiert, alle Zeilen geprüft." }, { t: "Trigger liest mit SELECT @id = id FROM inserted nur eine Zeile", a: "no", why: "Versagt bei Mehrzeilen-Anweisungen." }, { t: "Lagerprüfung und Abbuchung in einer Transaktion mit TRY/CATCH", a: "ok", why: "" }, { t: "SQL-Text im Wrapper per Verkettung mit JSON-Werten bauen und mit EXEC(@sql) ausführen", a: "no", why: "Injection-Gefahr, bricht die Besitzkette." }, { t: "Rolle der App hat nur EXECUTE auf den Wrapper", a: "ok", why: "" }, { t: "Prüfung „Menge größer 0“ nur in der App", a: "no", why: "Umgehbar, gehört als CHECK in die DB." }, { t: "Cursor, der jede Zeile einzeln um 5 % teurer macht", a: "no", why: "Ein UPDATE reicht." }] },
    { t: "warnbox", html: "KI-Unterstützung ist laut Syllabus im Praxisprojekt erlaubt – im Review musst du aber <b>jeden</b> Codeteil selbst erklären können. Code, den du nicht verstehst, ist im Review ein Risiko für die Note." },
    { t: "check", q: "Welche Aussage zum Code-Review stimmt laut Syllabus?", opts: ["Es wird in der Gruppe abgehalten","Es kann die Note nur verbessern","Es ist für alle verpflichtend","Es ist einzeln, mündlich und kann die Note auch verschlechtern"], a: 3, why: "Freiwillig, einzeln, mündlich; Verbesserung oder Herabsetzung möglich; mind. 60 % nötig." }
  ]}
 ]}
];

const QUESTIONS = [
  { id: "dbaq1", topic: "dba-arch", q: "Was versteht man bei einem Server-DBMS unter dem Prinzip „Datenbankengine am Server“?", opts: ["Jeder Client hat eine eigene Kopie der Datenbank","Die Datenbank wird beim Start der App heruntergeladen","Die Engine läuft zentral am Server, Clients schicken SQL-Anfragen und erhalten Ergebnisse","SQL wird im Client in Maschinencode übersetzt"], a: 2, why: "Client sendet Anfrage (SQL), der DB-Server verarbeitet und liefert das Ergebnis.", ex: "" },
  { id: "dbaq2", topic: "dba-arch", q: "Welche der folgenden ist eine Schnittstelle für den DB-Zugriff und keine Programmiersprache?", opts: ["ODBC","C#","Transact-SQL","Delphi"], a: 0, why: "ODBC, JDBC, ADO, ADO.NET sind Zugriffsschnittstellen.", ex: "" },
  { id: "dbaq3", topic: "dba-arch", q: "Was ist PL/SQL?", opts: ["Ein ORM für Java","Der Name des SQL-Server-Managementtools","Eine Abfragesprache für JSON","Die prozedurale SQL-Erweiterung von Oracle"], a: 3, why: "PL/SQL (Oracle) ist das Gegenstück zu Transact-SQL (SQL Server).", ex: "" },
  { id: "dbaq4", topic: "dba-zugriff", q: "Warum werden Fehler in einer als String zusammengesetzten SQL-Anweisung erst zur Laufzeit erkannt?", opts: ["Weil SQL Server keine Syntaxprüfung hat","Weil der Compiler SQL ignoriert, er sieht nur einen String","Weil Strings nicht kompiliert werden dürfen","Weil ODBC die Prüfung abschaltet"], a: 1, why: "Aus Sicht des Compilers ist die SQL-Anweisung ein String.", ex: "" },
  { id: "dbaq5", topic: "dba-zugriff", q: "Welcher Nachteil eines ORM wird auf den Folien genannt?", opts: ["SQL-Injection ist immer möglich","Probleme, wenn Objekte nach Schemaänderungen nicht mitaktualisiert werden","Es unterstützt keine JOINs","Datenzugriffe werden nicht geprüft"], a: 1, why: "Objekte und DB-Schema können auseinanderlaufen.", ex: "" },
  { id: "dbaq6", topic: "dba-zugriff", q: "Was bewirkt cmd.Parameters.AddWithValue(\"@artnr\", nr)?", opts: ["Es übergibt den Wert als typisierten Parameter getrennt vom SQL-Text","Es hängt den Wert als Text an den SQL-String","Es legt eine Variable in der Datenbank an","Es erzeugt eine Stored Procedure"], a: 0, why: "Parameter kapseln Variablen, haben einen Datentyp und erschweren Injection.", ex: "" },
  { id: "dbaq7", topic: "dba-server", q: "Welcher Punkt spricht für Programmlogik am Server?", opts: ["Aufwändige Grafikberechnung","Die App funktioniert ohne Netzwerk","Reduktion der Netzwerklast durch einen Aufruf statt vieler SQL-Anweisungen","Die Logik ist unabhängig vom DBMS"], a: 2, why: "Ein Prozeduraufruf ersetzt viele Roundtrips.", ex: "" },
  { id: "dbaq8", topic: "dba-server", q: "„Komplexe Datenzugriffe vs. Algorithmus“ bedeutet für die Platzierung von Logik …", opts: ["Alles gehört in die Datenbank","Algorithmen gehören in Trigger","Datenzugriffe gehören in die App","Datenintensive Logik eher am Server, reine Rechenalgorithmen eher in der Anwendung"], a: 3, why: "Die DB ist stark bei Mengenoperationen, nicht bei allgemeinen Algorithmen.", ex: "" },
  { id: "dbaq9", topic: "dba-server", q: "Was ist mit „Wiederverwendbarkeit – was ist der konstante Faktor?“ gemeint?", opts: ["Die Anzahl der Tabellen","Die Anzahl der Clients ist konstant","Ob DBMS oder Anwendung langfristig gleich bleibt, entscheidet, wo Logik wiederverwendbar ist","Prozeduren dürfen nur einmal aufgerufen werden"], a: 2, why: "Bei Individualsoftware ist oft die DB konstant (mehrere Frontends), bei Standardsoftware eher die Anwendung (mehrere DBMS).", ex: "" },
  { id: "dbaq10", topic: "dba-sql", q: "Welche Klausel filtert Gruppen nach einer Aggregation?", opts: ["HAVING","WHERE","ORDER BY","ON"], a: 0, why: "WHERE filtert Zeilen vor, HAVING Gruppen nach GROUP BY.", ex: "" },
  { id: "dbaq11", topic: "dba-sql", q: "Warum liefert WHERE artnr NOT IN (SELECT artnr FROM dbo.bestellposition) eventuell keine Zeilen?", opts: ["NOT IN ist in T-SQL nicht erlaubt","Weil Unterabfragen immer leer sind","Weil artnr ein INT ist","Wenn die Unterabfrage einen NULL-Wert liefert, ist die Bedingung nie wahr"], a: 3, why: "Dreiwertige Logik: x NOT IN (…, NULL) ist UNKNOWN. NOT EXISTS ist NULL-sicher.", ex: "" },
  { id: "dbaq12", topic: "dba-sql", q: "Wozu dient PARTITION BY in ROW_NUMBER() OVER (PARTITION BY kdnr ORDER BY datum)?", opts: ["Die Tabelle wird physisch aufgeteilt","Die Nummerierung beginnt für jeden Kunden neu","Es filtert Kunden ohne Bestellung","Es gruppiert wie GROUP BY und reduziert Zeilen"], a: 1, why: "Fensterfunktionen reduzieren keine Zeilen; PARTITION BY definiert Teilfenster.", ex: "" },
  { id: "dbaq13", topic: "dba-tsql", q: "Wie wird in T-SQL eine lokale Variable deklariert?", opts: ["VAR artnr INT","DECLARE @artnr INT","SET artnr AS INT","DIM @artnr AS INT"], a: 1, why: "Lokale Variablen beginnen mit @ und werden mit DECLARE angelegt.", ex: "" },
  { id: "dbaq14", topic: "dba-tsql", q: "Was liefert @@ROWCOUNT?", opts: ["Anzahl der von der letzten Anweisung betroffenen Zeilen","Anzahl der Zeilen der Tabelle","Anzahl offener Transaktionen","Anzahl der Spalten"], a: 0, why: "Typisch nach UPDATE: IF @@ROWCOUNT = 0 → nichts gefunden.", ex: "" },
  { id: "dbaq15", topic: "dba-tsql", q: "Was gilt für Transact-SQL laut Folien?", opts: ["Es ist ANSI-Standard und auf allen DBMS gleich","Es ist eine Frontend-Sprache","Es ist eine herstellerproprietäre, prozedurale Erweiterung von SQL (SQL Server, Sybase)","Es kennt keine Variablen"], a: 2, why: "Proprietär – deshalb bei Standardsoftware-Herstellern oft verpönt.", ex: "" },
  { id: "dbaq16", topic: "dba-cursor", q: "Welche Reihenfolge der Cursor-Befehle ist korrekt?", opts: ["OPEN, DECLARE, FETCH, DEALLOCATE, CLOSE","DECLARE, FETCH, OPEN, CLOSE","FETCH, DECLARE, OPEN, CLOSE","DECLARE, OPEN, FETCH, CLOSE, DEALLOCATE"], a: 3, why: "Deklarieren, öffnen, Zeilen holen, schließen, freigeben.", ex: "" },
  { id: "dbaq17", topic: "dba-cursor", q: "Was bedeutet @@FETCH_STATUS = 0?", opts: ["Der Cursor ist leer","Der Cursor ist geschlossen","Der letzte FETCH war erfolgreich","Es ist ein Fehler aufgetreten"], a: 2, why: "0 = Zeile erfolgreich gelesen; −1 = keine weitere Zeile.", ex: "" },
  { id: "dbaq18", topic: "dba-cursor", q: "Was meint der Begriff „Schleifitis“ auf der Folie „Data Expert“?", opts: ["Das übermäßige Verwenden von Schleifen/Cursorn statt Mengenoperationen","Endlosschleifen in Triggern","Zu viele verschachtelte Transaktionen","Schleifen in der Mobile App"], a: 0, why: "Datenexpert:innen verwenden Mengenoperationen, wann immer möglich.", ex: "" },
  { id: "dbaq19", topic: "dba-sp", q: "Wie erhält der Aufrufer den Wert eines OUTPUT-Parameters?", opts: ["Automatisch, ohne Angabe beim Aufruf","Über RETURN","Über PRINT","Indem beim Aufruf hinter der Variable ebenfalls OUTPUT steht"], a: 3, why: "OUTPUT muss bei Deklaration und beim Aufruf angegeben werden.", ex: "" },
  { id: "dbaq20", topic: "dba-sp", q: "Welcher Vorteil von Stored Procedures wird auf den Folien NICHT genannt?", opts: ["Reduktion der Netzwerklast","Automatische Plattformunabhängigkeit zwischen DBMS","Aufruf von unterschiedlichen Front-Ends","Steuern von indirekten Zugriffsberechtigungen"], a: 1, why: "Im Gegenteil: fehlende einheitliche Syntax ist ein Nachteil.", ex: "" },
  { id: "dbaq21", topic: "dba-sp", q: "Was bewirkt SET NOCOUNT ON in einer Prozedur?", opts: ["Es verhindert, dass Zeilen gezählt werden können (@@ROWCOUNT = 0)","Es unterdrückt die Meldungen „(n rows affected)“","Es deaktiviert Trigger","Es verhindert COMMIT"], a: 1, why: "@@ROWCOUNT funktioniert weiterhin; nur die Meldungen an den Client entfallen.", ex: "" },
  { id: "dbaq22", topic: "dba-tx", q: "Wofür steht das „A“ in ACID?", opts: ["Atomicity – alles oder nichts","Availability","Authentication","Aggregation"], a: 0, why: "Atomicity, Consistency, Isolation, Durability.", ex: "" },
  { id: "dbaq23", topic: "dba-tx", q: "Welche Fehlernummer ist für THROW mit eigenem Fehler gültig?", opts: ["547","16","50001","-1"], a: 2, why: "Benutzerdefinierte Fehlernummern beginnen bei 50000.", ex: "" },
  { id: "dbaq24", topic: "dba-tx", q: "Warum prüft man im CATCH-Block IF @@TRANCOUNT > 0 vor ROLLBACK?", opts: ["Weil ROLLBACK sonst nur die letzte Anweisung zurückrollt","Weil @@TRANCOUNT sonst nicht zurückgesetzt wird","Das ist nur eine Stilfrage","Weil ROLLBACK ohne offene Transaktion selbst einen Fehler auslöst"], a: 3, why: "Z. B. wenn ein Trigger bereits zurückgerollt hat oder der Fehler vor BEGIN TRAN auftrat.", ex: "" },
  { id: "dbaq25", topic: "dba-udf", q: "Welche Aussage über User-defined Functions im SQL Server ist richtig?", opts: ["Sie dürfen Tabellen per INSERT ändern","Sie werden mit EXEC aufgerufen und haben OUTPUT-Parameter","Sie liefern einen Skalarwert oder eine Tabelle","Sie können Transaktionen steuern"], a: 2, why: "Functions liefern etwas: Skalar oder Tabelle. Keine Nebenwirkungen auf Tabellen.", ex: "" },
  { id: "dbaq26", topic: "dba-udf", q: "Eine Inlinefunktion mit Tabellenrückgabe …", opts: ["besteht aus genau einer SELECT-Anweisung","füllt eine Tabellenvariable in mehreren Schritten","liefert immer genau einen Wert","darf keine Parameter haben"], a: 0, why: "„Ähnlich einer Sicht mit Parameter“.", ex: "" },
  { id: "dbaq27", topic: "dba-udf", q: "Wie ruft man eine Tabellenwertfunktion für jede Zeile einer anderen Tabelle auf?", opts: ["Mit EXEC in einer Schleife","Mit UNION","Mit einem Trigger","Mit CROSS APPLY"], a: 3, why: "SELECT … FROM dbo.kunde k CROSS APPLY dbo.fn_bestellungen_kunde(k.kdnr).", ex: "" },
  { id: "dbaq28", topic: "dba-trigger", q: "Was enthält bei einem UPDATE die Tabelle deleted?", opts: ["Nichts","Die betroffenen Zeilen mit den alten Werten","Die betroffenen Zeilen mit den neuen Werten","Alle Zeilen der Tabelle"], a: 1, why: "deleted = Daten vor der Änderung, inserted = Daten nach der Änderung.", ex: "" },
  { id: "dbaq29", topic: "dba-trigger", q: "Welche Triggerart erlaubt „deaktivieren anstelle von löschen“?", opts: ["AFTER DELETE","INSTEAD OF DELETE","FOR INSERT","BEFORE ROW"], a: 1, why: "INSTEAD OF ersetzt das auslösende Ereignis.", ex: "" },
  { id: "dbaq30", topic: "dba-trigger", q: "Wann feuern AFTER-Trigger beim SQL Server im Verhältnis zu den Constraints?", opts: ["Nach den Constraints","Vor den Constraints","Gleichzeitig","Nur wenn ein Constraint verletzt wurde"], a: 0, why: "Laut Folie feuern SQL-Server-Trigger nach den Constraints; scheitert ein Constraint, feuert der AFTER-Trigger gar nicht.", ex: "" },
  { id: "dbaq31", topic: "dba-integ", q: "Welche Regel kann NICHT mit einem einfachen CHECK-Constraint umgesetzt werden?", opts: ["vk >= 0","menge > 0","Bestellpositionen dürfen nur aktive Artikel enthalten","ust_satz IN (10, 13, 20)"], a: 2, why: "Tabellenübergreifend – dafür Trigger (oder Prüfung in Prozeduren).", ex: "" },
  { id: "dbaq32", topic: "dba-integ", q: "Was bedeutet „deklarative Integrität“?", opts: ["Regeln werden als Code mit IF/ELSE geprüft","Regeln stehen in der Dokumentation","Regeln werden im Frontend geprüft","Regeln werden als Constraints beschrieben und vom DBMS automatisch durchgesetzt"], a: 3, why: "Man beschreibt was gilt, nicht wie geprüft wird.", ex: "" },
  { id: "dbaq33", topic: "dba-integ", q: "Warum ist eine Prüfung nur in einer Stored Procedure schwächer als ein Trigger?", opts: ["Prozeduren sind langsamer","Prozeduren können nicht zurückrollen","Sie greift nur, wenn die Änderung über diese Prozedur läuft","Prozeduren dürfen keine Tabellen lesen"], a: 2, why: "Direkte Änderungen (z. B. aus SSMS) umgehen sie – außer man erzwingt Zugriff nur über Prozeduren.", ex: "" },
  { id: "dbaq34", topic: "dba-sec", q: "Was ist der Kern von „indirekten Zugriffen“?", opts: ["Berechtigungen werden über Sichten und Prozeduren vergeben, ohne Rechte auf die Tabellen","Benutzer greifen über VPN zu","Alle Benutzer verwenden dasselbe Login","Zugriffe laufen über einen Trigger"], a: 0, why: "Einschränkung auf das, was Sicht oder Prozedur erledigt.", ex: "" },
  { id: "dbaq35", topic: "dba-sec", q: "Wo werden beim SQL Server Datenbankbenutzer angelegt?", opts: ["Auf Serverebene, einmal für alle DBs","Nur im Windows-Active-Directory","In der Mobile App","In jeder Datenbank, zugeordnet zu einer Anmeldung"], a: 3, why: "Anmeldung (Login) am Server, Benutzer pro Datenbank.", ex: "" },
  { id: "dbaq36", topic: "dba-sec", q: "Welche Aussage zur Praxisrelevanz serverseitiger Programmierung trifft laut Folien zu?", opts: ["Sie verliert durch die Cloud an Bedeutung","Durch Cloud/SaaS und JSON steigt ihre Bedeutung","Sie ist bei Individualsoftware verpönt","Sie ist nur bei Access relevant"], a: 1, why: "Bei Standardsoftware oft verpönt, bei Individualsoftware beliebt; Cloud/SaaS und JSON stärken sie.", ex: "" },
  { id: "dbaq37", topic: "dba-inj", q: "Benutzer gibt hihi' OR 1 = 1;-- ein. Wozu dient das -- ?", opts: ["Es subtrahiert 1","Es kommentiert den Rest der Anweisung (die Kennwortprüfung) aus","Es beendet die Verbindung","Es ist ein Fehler im Angriff"], a: 1, why: "Alles nach -- wird ignoriert.", ex: "" },
  { id: "dbaq38", topic: "dba-inj", q: "Welche Sofortmaßnahme gegen SQL-Injection nennen die Folien?", opts: ["Jedes ' in Benutzereingaben durch zwei ' ersetzen","Alle Leerzeichen entfernen","Eingaben verschlüsseln","Die Datenbank umbenennen"], a: 0, why: "Die eigentliche Lösung bleibt die Parameterübergabe.", ex: "" },
  { id: "dbaq39", topic: "dba-inj", q: "Eine Prozedur baut intern SQL mit EXEC(N'SELECT … WHERE name = ''' + @name + ''''). Ist sie injection-sicher?", opts: ["Ja, weil sie eine Stored Procedure ist","Ja, weil @name ein Parameter ist","Nein, dynamisches SQL per Verkettung ist auch in Prozeduren angreifbar","Nur bei Windows-Authentifizierung nicht"], a: 2, why: "Lösung: sp_executesql mit Parametern.", ex: "" },
  { id: "dbaq40", topic: "dba-json", q: "Welche Funktion liest einen skalaren Wert aus einem JSON-Text?", opts: ["JSON_QUERY","JSON_ARRAY","OPENJSON","JSON_VALUE"], a: 3, why: "JSON_VALUE für Skalare, JSON_QUERY für Objekte/Arrays.", ex: "" },
  { id: "dbaq41", topic: "dba-json", q: "Mit welcher Klausel erzeugt man aus einem SELECT JSON mit über Aliase gesteuerter Struktur?", opts: ["FOR JSON AUTO","OPENJSON","FOR JSON PATH","FOR XML RAW"], a: 2, why: "PATH: Aliase wie [preis.netto] erzeugen verschachtelte Objekte.", ex: "" },
  { id: "dbaq42", topic: "dba-json", q: "Welche JSON-Funktionen sind laut Folien neu in SQL Server 2025?", opts: ["JSON_OBJECTAGG und JSON_ARRAYAGG","JSON_VALUE und JSON_QUERY","ISJSON und JSON_MODIFY","OPENJSON und FOR JSON"], a: 0, why: "Sie erstellen Objekte bzw. Arrays aus einer Gruppierung heraus.", ex: "" },
  { id: "dbaq43", topic: "dba-proc", q: "Welche Reihenfolge entspricht dem Vorgehensmodell laut Lernergebnissen?", opts: ["Implementierung → Datenmodell → Anforderungen","Datenmodell → Code-Review → Anforderungen","Funktionen → Anforderungen → Test","Anforderungen analysieren → Datenmodell planen und konstruieren → Funktionen entwickeln"], a: 3, why: "So steht es in den Lernergebnissen des Syllabus.", ex: "" },
  { id: "dbaq44", topic: "dba-proc", q: "Welche Note ist mit dem Praxisprojekt allein maximal erreichbar?", opts: ["Sehr gut","Befriedigend","Gut","Genügend"], a: 1, why: "Für Gut/Sehr gut braucht es das freiwillige Code-Review.", ex: "" },
  { id: "dbaq45", topic: "dba-proc", q: "Was passiert, wenn das freiwillige Code-Review negativ ist?", opts: ["Es zählt nur das Projekt","Der erste Leistungsantritt wird negativ beurteilt","Man darf es sofort wiederholen","Die Note sinkt um genau eine Stufe"], a: 1, why: "Laut Syllabus: mind. 60 % nötig, sonst negativer erster Antritt.", ex: "" },
  { id: "dbaq46", topic: "dba-proj", q: "Woran erkennt dbo.sp_backend_wrapper, welche Einzelprozedur aufzurufen ist?", opts: ["Am Inhalt des übergebenen JSON (z. B. Feld „typ“)","Am Namen des Datenbankbenutzers","An der Uhrzeit des Aufrufs","An einem eigenen Parameter @procname"], a: 0, why: "Das JSON enthält alle Informationen, was zu tun ist, und alle Eingabewerte.", ex: "" },
  { id: "dbaq47", topic: "dba-proj", q: "Welche Felder hat die Antwort im Folienbeispiel?", opts: ["status, data","success, message","ok, fehlercode, fehler, ergebnis","rc, output"], a: 2, why: "{ok: true, fehlercode: null, fehler: null, ergebnis: {preis: 13.89}}.", ex: "" },
  { id: "dbaq48", topic: "dba-proj", q: "Welcher Vorteil spricht für Variante 2 (Wrapper übergibt Skalarwerte an die Einzelprozedur)?", opts: ["Der Wrapper bleibt besonders klein","Es braucht keine JSON-Funktionen","Neue Felder erfordern nie Änderungen","Einzelprozeduren sind typisiert, wiederverwendbar und einfach direkt testbar"], a: 3, why: "Nachteil: Der Wrapper übernimmt das gesamte JSON-Lesen und -Bauen.", ex: "" }
];

const BOSS_EXTRA = [
  { id: "dbaq49", topic: "dba-trigger", q: "Ein AFTER-UPDATE-Trigger enthält: SELECT @artnr = artnr FROM inserted; IF (SELECT aktiv FROM dbo.artikel WHERE artnr = @artnr) = 0 ROLLBACK. Ein UPDATE ändert 20 Positionen, davon 3 mit inaktiven Artikeln. Was passiert?", opts: ["Alle 20 werden zurückgerollt","Der Trigger feuert 20-mal und rollt 3 zurück","Es hängt davon ab, welche Zeile zufällig in @artnr landet – die Regel wird unzuverlässig geprüft","Fehler: inserted darf nicht gelesen werden"], a: 2, why: "Statement-Trigger + Variablenzuweisung = nur eine Zeile geprüft. Richtig: IF EXISTS mit JOIN.", ex: "" },
  { id: "dbaq50", topic: "dba-tx", q: "Prozedur ohne TRY/CATCH und ohne XACT_ABORT: BEGIN TRAN; UPDATE (verletzt CHECK); INSERT (ok); COMMIT. Was steht danach in der DB?", opts: ["Das INSERT ist festgeschrieben, das UPDATE nicht","Nichts, alles wurde zurückgerollt","Beides ist festgeschrieben","Die Transaktion bleibt offen"], a: 0, why: "Eine CHECK-Verletzung bricht nur die Anweisung ab; die Prozedur läuft weiter und COMMIT schreibt den Rest fest.", ex: "" },
  { id: "dbaq51", topic: "dba-sec", q: "app_role hat nur EXECUTE auf dbo.sp_suche, die intern EXEC(@sql) auf dbo.kunde ausführt. Was passiert beim Aufruf?", opts: ["Funktioniert dank Besitzkette","Funktioniert, aber nur lesend","Die Prozedur wird beim Anlegen abgelehnt","Fehler: Dynamisches SQL unterbricht die Besitzkette, SELECT-Recht auf dbo.kunde fehlt"], a: 3, why: "Dynamisches SQL läuft in eigenem Kontext; die Ownership Chain greift nicht.", ex: "" },
  { id: "dbaq52", topic: "dba-cursor", q: "Welche Umsetzung erhöht alle Preise der Warengruppe 3 um 5 % am besten?", opts: ["Cursor über alle Artikel, UPDATE pro Zeile","Ein UPDATE … SET vk = vk * 1.05 WHERE warengruppe = 3","WHILE-Schleife mit TOP 1 und Zähler","Ein Trigger auf dbo.artikel"], a: 1, why: "Klassische Mengenoperation – ein Statement, atomar, optimierbar.", ex: "" },
  { id: "dbaq53", topic: "dba-json", q: "Die App schickt {\"kdnr\":7,\"positionen\":[{\"artnr\":1089,\"menge\":2},{\"artnr\":1244,\"menge\":1}]}. Wie fügt man die Positionen am besten ein?", opts: ["Cursor über JSON_VALUE mit Index 0, 1, 2 …","INSERT … SELECT … FROM OPENJSON(@j, '$.positionen') WITH (artnr INT, menge INT)","Pro Position ein eigener API-Aufruf","JSON als Ganzes in eine NVARCHAR-Spalte schreiben"], a: 1, why: "OPENJSON zerlegt das Array in Zeilen → eine Mengenoperation.", ex: "" },
  { id: "dbaq54", topic: "dba-sp", q: "EXEC dbo.sp_artikelpreis @artnr = 5, @brutto = 1, @preis = @p; – @p ist danach NULL, obwohl Artikel 5 existiert. Warum?", opts: ["OUTPUT fehlt beim Aufruf","Der Artikel ist inaktiv","RETURN 0 überschreibt @p","@brutto muss 'true' sein"], a: 0, why: "Ohne OUTPUT beim Aufruf wird der Wert nicht zurückgegeben.", ex: "" },
  { id: "dbaq55", topic: "dba-integ", q: "Welche Kombination ist für „E-Mail eindeutig, App soll verständlichen Fehlercode bekommen“ am tauglichsten?", opts: ["Nur Prüfung in der App","Nur ein Trigger","UNIQUE-Constraint plus Prüfung in der Registrierungsprozedur, die einen definierten Fehlercode liefert","Nächtlicher Cursor, der Duplikate löscht"], a: 2, why: "Constraint garantiert, Prozedur liefert die fachliche Rückmeldung an die API.", ex: "" },
  { id: "dbaq56", topic: "dba-proj", q: "Warum ist ISNULL(ISJSON(@input), 0) = 0 robuster als ISJSON(@input) = 0?", opts: ["ISJSON liefert Text","Es ist schneller","ISJSON ist ohne ISNULL nicht erlaubt","ISJSON(NULL) liefert NULL, die Bedingung wäre dann nicht wahr und NULL-Eingaben würden durchrutschen"], a: 3, why: "NULL = 0 ist UNKNOWN, also nicht wahr.", ex: "" },
  { id: "dbaq57", topic: "dba-udf", q: "Eine Funktion soll beim Abruf zusätzlich einen Zugriffslog-Eintrag in dbo.log schreiben. Was ist die richtige Lösung?", opts: ["INSERT in der Funktion","Multi-Statement TVF mit INSERT INTO dbo.log","Eine Stored Procedure verwenden, da Funktionen keine Tabellen ändern dürfen","Skalarfunktion mit EXEC"], a: 2, why: "Funktionen dürfen nur eigene Tabellenvariablen ändern.", ex: "" },
  { id: "dbaq58", topic: "dba-zugriff", q: "Warum erschweren parametrisierte Befehle SQL-Injection?", opts: ["Weil der Parameterwert getrennt vom SQL-Text übertragen und nie als Code interpretiert wird","Weil sie verschlüsselt übertragen werden","Weil Parameter keine Sonderzeichen enthalten dürfen","Weil sie nur Zahlen erlauben"], a: 0, why: "Der SQL-Text steht fest; der Wert ist nur Daten.", ex: "" }
];

const FLASHCARDS = [
  { id: "dbaf1", cat: "DB-AENT", topic: "dba-arch", front: "Datenbankanwendung", back: "Datenbank + Anwendung/Applikation; Logik kann am Server (T-SQL, PL/SQL, .NET CLR) oder am Client (C#, Java, Kotlin …) liegen." },
  { id: "dbaf2", cat: "DB-AENT", topic: "dba-arch", front: "ODBC, JDBC, ADO.NET", back: "Schnittstellen, über die Anwendungen SQL an das DBMS schicken und Ergebnisse empfangen." },
  { id: "dbaf3", cat: "DB-AENT", topic: "dba-zugriff", front: "Drei Arten des Datenzugriffs aus dem Frontend", back: "1) SQL als String, 2) SQL-String mit Parametern, 3) Objektrelationaler Mapper (z. B. LINQ)." },
  { id: "dbaf4", cat: "DB-AENT", topic: "dba-zugriff", front: "ORM – Vor- und Nachteil", back: "+ Datenzugriffslogik wird beim Kompilieren geprüft. − Probleme, wenn Objekte nach Schemaänderungen nicht aktualisiert werden." },
  { id: "dbaf5", cat: "DB-AENT", topic: "dba-server", front: "Gründe für serverseitige Programmierung", back: "Aufgaben ohne Benutzerinteraktion, systemspezifische Fähigkeiten, komplexe Datenzugriffe, Performance, Wiederverwendbarkeit, indirekte Berechtigungen (DSGVO), Schutz vor SQL-Injection." },
  { id: "dbaf6", cat: "DB-AENT", topic: "dba-server", front: "Programmlogik am Client vs. am Server", back: "Client: n SQL-Anweisungen und n Ergebnisse über das Netz. Server: ein Prozeduraufruf, Schritte laufen am Server, nur das Ergebnis wird gemeldet." },
  { id: "dbaf7", cat: "DB-AENT", topic: "dba-sql", front: "Logische Reihenfolge einer SELECT-Abfrage", back: "FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY." },
  { id: "dbaf8", cat: "DB-AENT", topic: "dba-sql", front: "NOT EXISTS vs. NOT IN", back: "NOT EXISTS ist NULL-sicher; NOT IN liefert nichts, sobald die Unterabfrage einen NULL-Wert enthält." },
  { id: "dbaf9", cat: "DB-AENT", topic: "dba-sql", front: "Fensterfunktion", back: "Berechnung über ein Zeilenfenster ohne Zeilen zu reduzieren: z. B. ROW_NUMBER() OVER (PARTITION BY kdnr ORDER BY datum)." },
  { id: "dbaf10", cat: "DB-AENT", topic: "dba-tsql", front: "Elemente von T-SQL (Folie)", back: "Variablen, Kontrollstrukturen, Cursor, Input-/Outputparameter, direkter Einsatz von SQL, Funktionen und Systemfunktionen." },
  { id: "dbaf11", cat: "DB-AENT", topic: "dba-tsql", front: "SET @x = (SELECT …) vs. SELECT @x = …", back: "SET: keine Zeile → NULL, mehrere → Fehler. SELECT: keine Zeile → Wert bleibt, mehrere → letzter Wert." },
  { id: "dbaf12", cat: "DB-AENT", topic: "dba-cursor", front: "Cursor-Lebenszyklus", back: "DECLARE → OPEN → FETCH NEXT (Schleife solange @@FETCH_STATUS = 0) → CLOSE → DEALLOCATE." },
  { id: "dbaf13", cat: "DB-AENT", topic: "dba-cursor", front: "Wann Cursor, wann Mengenoperation?", back: "Mengenoperation, wann immer möglich (keine „Schleifitis“). Cursor nur, wenn pro Zeile etwas Unteilbares nötig ist (z. B. Prozeduraufruf je Zeile)." },
  { id: "dbaf14", cat: "DB-AENT", topic: "dba-sp", front: "Stored Procedure", back: "Auf dem Server gespeichertes Programm, explizit per EXEC aufgerufen; Parameter, liest/schreibt Tabellen, prüft, behandelt Fehler, enthält Transaktionen." },
  { id: "dbaf15", cat: "DB-AENT", topic: "dba-sp", front: "Drei Wege, Ergebnisse aus einer Prozedur zu liefern", back: "OUTPUT-Parameter (beliebige Typen), RETURN-Wert (nur INT, Statuscode), Resultset (SELECT)." },
  { id: "dbaf16", cat: "DB-AENT", topic: "dba-tx", front: "ACID", back: "Atomicity, Consistency, Isolation, Durability." },
  { id: "dbaf17", cat: "DB-AENT", topic: "dba-tx", front: "TRY/CATCH-Muster mit Transaktion", back: "BEGIN TRY BEGIN TRAN … COMMIT END TRY BEGIN CATCH IF @@TRANCOUNT > 0 ROLLBACK; THROW; END CATCH" },
  { id: "dbaf18", cat: "DB-AENT", topic: "dba-tx", front: "THROW", back: "THROW nummer (≥ 50000), text, state; – wirft eigenen Fehler, Schweregrad 16. THROW; ohne Argumente im CATCH wirft den Originalfehler erneut." },
  { id: "dbaf19", cat: "DB-AENT", topic: "dba-udf", front: "Drei Arten von UDFs", back: "Skalarfunktion (ein Wert), Multi-Statement-TVF (Tabellenvariable in mehreren Schritten), Inline-TVF (ein SELECT, „Sicht mit Parameter“)." },
  { id: "dbaf20", cat: "DB-AENT", topic: "dba-udf", front: "Was dürfen Funktionen nicht?", back: "Tabellen ändern, Prozeduren aufrufen, TRY/CATCH, THROW, Transaktionen steuern, dynamisches SQL." },
  { id: "dbaf21", cat: "DB-AENT", topic: "dba-trigger", front: "Trigger", back: "Implizit durch INSERT/UPDATE/DELETE einer Tabelle ausgelöst, nie explizit aufgerufen; bekommt nie etwas, gibt nie etwas aus." },
  { id: "dbaf22", cat: "DB-AENT", topic: "dba-trigger", front: "inserted / deleted", back: "Interne Tabellen mit der Struktur der betroffenen Tabelle: inserted = Daten nach, deleted = Daten vor der Änderung; enthalten alle betroffenen Zeilen." },
  { id: "dbaf23", cat: "DB-AENT", topic: "dba-trigger", front: "Triggerarten SQL Server", back: "Nur Statement-Trigger, feuern nach Constraints: FOR/AFTER (nach dem Ereignis), INSTEAD OF (anstelle); mehrere pro Ereignis möglich." },
  { id: "dbaf24", cat: "DB-AENT", topic: "dba-trigger", front: "Einsatzbereiche von Triggern", back: "Komplexe Gültigkeitsprüfungen über Constraints hinaus, Zusatzaufgaben ohne Umgehungsmöglichkeit, Ersatzhandlungen (deaktivieren statt löschen, Änderungen an Sichten)." },
  { id: "dbaf25", cat: "DB-AENT", topic: "dba-integ", front: "Deklarative vs. prozedurale Integrität", back: "Deklarativ: Constraints (NOT NULL, PK, UNIQUE, FK, CHECK, DEFAULT). Prozedural: Trigger, Prüfungen in Prozeduren. „So deklarativ wie möglich, so prozedural wie nötig.“" },
  { id: "dbaf26", cat: "DB-AENT", topic: "dba-integ", front: "Prüfreihenfolge beim SQL Server", back: "INSTEAD-OF-Trigger → Constraints → AFTER-Trigger." },
  { id: "dbaf27", cat: "DB-AENT", topic: "dba-sec", front: "Indirekte Zugriffe", back: "Rechte nur auf Sichten/Prozeduren, nicht auf Tabellen; Einschränkung auf das, was die Prozedur erledigt; standardmäßig auf das Schema beschränkt (Besitzkette)." },
  { id: "dbaf28", cat: "DB-AENT", topic: "dba-sec", front: "Login – Benutzer – Rolle", back: "Login/Anmeldung am Server (Windows- oder SQL-Server-Authentifizierung), Benutzer pro Datenbank, Rechte über Server- bzw. Datenbankrollen." },
  { id: "dbaf29", cat: "DB-AENT", topic: "dba-inj", front: "SQL-Injection", back: "Einschleusung von SQL in zusammengesetzte Anweisungen, z. B. hihi' OR 1 = 1;-- im Benutzerfeld." },
  { id: "dbaf30", cat: "DB-AENT", topic: "dba-inj", front: "Abwehr von SQL-Injection", back: "Sofort: ' durch '' ersetzen. Richtig: Eingaben als Parameter übergeben (Client-Bibliotheken, Stored Procedures, sp_executesql)." },
  { id: "dbaf31", cat: "DB-AENT", topic: "dba-json", front: "JSON_VALUE vs. JSON_QUERY", back: "JSON_VALUE liest Skalare, JSON_QUERY Objekte/Arrays." },
  { id: "dbaf32", cat: "DB-AENT", topic: "dba-json", front: "FOR JSON / OPENJSON", back: "FOR JSON AUTO/PATH: Tabellendaten → JSON. FROM OPENJSON(…) WITH (…): JSON → Tabellenform." },
  { id: "dbaf33", cat: "DB-AENT", topic: "dba-json", front: "Wann JSON-Spalte, wann normale Spalte?", back: "JSON für flexible Zusatzinfos ohne fixe Struktur; für Filterkriterien besser eine indizierbare Spalte." },
  { id: "dbaf34", cat: "DB-AENT", topic: "dba-proj", front: "dbo.sp_backend_wrapper", back: "Einheitliche Prozedur für alle Zugriffe (@input/@output nvarchar(max)); bekommt das API-JSON durchgereicht, ruft die passende Prozedur auf, gibt JSON zurück." },
  { id: "dbaf35", cat: "DB-AENT", topic: "dba-proj", front: "Drei Wrapper-Varianten", back: "1) JSON bis in die Einzelprozedur, 2) Skalarwerte an die Einzelprozedur, 3) eigener JSON-Wrapper dazwischen – plus Mischvarianten." },
  { id: "dbaf36", cat: "DB-AENT", topic: "dba-proc", front: "Beurteilung DB-AENT (1. Antritt)", back: "Praxisprojekt (Gruppe) 75 + optionales Code-Review 25; Projekt allein max. Befriedigend; Review einzeln, mündlich, ≥ 60 %, sonst 1. Antritt negativ." },
  { id: "dbaf37", cat: "DB-AENT", topic: "dba-proc", front: "Vorgehensmodell für DB-Anwendungen", back: "Anforderungen analysieren → Datenmodell planen/konstruieren → Funktionen (Prozeduren, Trigger, Functions) entwickeln → testen." }
];

window.COURSE_DEFS = window.COURSE_DEFS || [];
window.COURSE_DEFS.push({
  id: "dbaent", name: "Datenbank Anwendungsentwicklung", short: "DB-AENT", title: "DB-Anwendungen", semester: 3, ects: 2.5,
  color: "#2F80ED", icon: "⛁", lang: "de",
  lecturers: "Klemens Konopasek",
  description: "Serverseitige Datenbankprogrammierung mit Transact-SQL am MS SQL Server: komplexe Abfragen, Stored Procedures, Functions, Trigger, Transaktionen, Sicherheit und JSON – umgesetzt in einem gemeinsamen Praxisprojekt mit Mobile App Development.",
  aiRule: "KI-Assistenzsysteme dürfen zur Unterstützung im Praxisprojekt eingesetzt werden. Für Prüfungsleistungen sind ausschließlich die von der bzw. dem Lehrenden ausdrücklich zugelassenen KI-Systeme erlaubt; jede nicht genehmigte Verwendung gilt als Täuschungsversuch und führt zu einer negativen Beurteilung der Prüfungsleistung.",
  topics: TOPICS, worlds: WORLDS, questions: QUESTIONS, bossExtra: BOSS_EXTRA, flashcards: FLASHCARDS, exam: "mc",
  assessment: {
    parts: [
      { id: "projekt", label: "Praxisprojekt (in Gruppen), 75 %, muss positiv sein", max: 75 },
      { id: "review", label: "Code-Review (optional, einzeln, mündlich), 25 %, muss positiv sein", max: 25 }
    ],
    scale: [[91, "1 · Sehr gut"], [81, "2 · Gut"], [71, "3 · Befriedigend"], [61, "4 · Genügend"], [0, "5 · Nicht genügend"]],
    note: "Prüfungsimmanente LV, mindestens 75 % Anwesenheit (online nur mit aktivierter Kamera). Mit dem Praxisprojekt allein ist maximal „Befriedigend“ möglich; für „Gut“/„Sehr gut“ freiwilliges mündliches Code-Review zum DB-Teil (einzeln, jeder Codeteil muss detailliert erklärt werden können, inkl. Vorteile gegenüber anderen Lösungen). Das Review kann die Note verbessern oder verschlechtern, muss mit mind. 60 % positiv sein, sonst ist der erste Antritt negativ. 2./3. Antritt: Klausur mit Programmierbeispielen (100 %); der 3. Antritt erfolgt vor einer Prüfungskommission. Projekt gemeinsam mit MAPPDEV, Beurteilung von DB- und App-Teil getrennt. Rundung nach DIN 1333."
  },
  resources: {
    sections: [
      { title: "Moodle / Unterlagen", items: [
        { title: "Foliensatz DB-AENT – Entwicklung von Datenbankanwendungen, Verschränkung mit MAPPDEV (46 Folien)" },
        { title: "Syllabus DB-AENT (IMA25)" },
        { title: "Unterlage für die Übung als eBook über die FH-Bibliothek", note: "permalink.obvsg.at/fhj/AC12251801 – mit FH-Campus-IP oder außerhalb über VPN" }
      ]},
      { title: "Werkzeuge & Projektumgebung", items: [
        { title: "SQL Server Management Studio (SSMS) am PC" },
        { title: "DB-Server IMAMSSQL, Datenbank WINF25_dbaent_nn", note: "Benutzer app_user24nn, Rolle app_role (nn = eure Nummer)" },
        { title: "Bereitgestellte API: https://mappdev-db-WINF25.ima.fh-joanneum.at/service/nn", note: "reicht das JSON an dbo.sp_backend_wrapper durch" }
      ]}
    ],
    books: [
      { title: "SQL Server 2022 Programmierung, Teil 1: Grundlagen, Transact-SQL, Stored Procedures", author: "Konopasek, LinkedIn Learning", tag: "Empfohlen" },
      { title: "SQL Server 2022 Programmierung, Teil 2: Trigger, User-defined Functions, JSON", author: "Konopasek, LinkedIn Learning", tag: "Empfohlen" }
    ]
  },
  events: [
    { id: "dba-e1", title: "DB-AENT · Abgabe Praxisprojekt (DB-Teil)", type: "deadline", date: null, note: "Termin laut Moodle eintragen. Gemeinsames Projekt mit MAPPDEV." },
    { id: "dba-e2", title: "DB-AENT · Code-Review (optional, mündlich)", type: "exam", date: null, note: "Termin laut Moodle eintragen. Einzeln; für Gut/Sehr gut; mind. 60 % nötig." },
    { id: "dba-e3", title: "DB-AENT · 2./3. Antritt: Klausur mit Programmierbeispielen", type: "info", date: null, note: "Termin laut Moodle eintragen. Nur bei negativem ersten Antritt." }
  ],
  tasks: [
    { id: "dbat1", title: "SSMS installieren und Verbindung zu IMAMSSQL / WINF25_dbaent_nn testen", note: "Auch prüfen, was app_user24nn darf und was nicht." },
    { id: "dbat2", title: "eBook „SQL Server 2022 Programmierung“ über die FH-Bibliothek öffnen (VPN)", note: "" },
    { id: "dbat3", title: "Mit dem MAPPDEV-Team die API-Aufrufe festlegen", note: "Pro „typ“: Eingabe-JSON, Antwort-JSON (ok/fehlercode/fehler/ergebnis), Fehlerfälle." },
    { id: "dbat4", title: "ER-Modell und DDL-Skript mit allen Constraints erstellen", note: "Je Regel entscheiden: Constraint, Trigger oder Prüfung in der Prozedur – und begründen." },
    { id: "dbat5", title: "Fehlercode-Katalog anlegen (≥ 50000) und dokumentieren", note: "" },
    { id: "dbat6", title: "Wrapper-Variante wählen (JSON / Skalarwerte / JSON-Wrapper) und Gerüst von dbo.sp_backend_wrapper bauen", note: "Vorteile gegenüber den anderen Varianten notieren – Review-Frage!" },
    { id: "dbat7", title: "Erste Einzelprozedur mit TRY/CATCH und Transaktion end-to-end über die API testen", note: "" },
    { id: "dbat8", title: "Mindestens einen mengenorientierten Trigger für eine Regel umsetzen, die kein Constraint abdeckt", note: "Mit Mehrzeilen-UPDATE testen." },
    { id: "dbat9", title: "Testskript schreiben: gültige, ungültige und bösartige Eingaben (Injection-Versuche, kaputtes JSON)", note: "" },
    { id: "dbat10", title: "Code-Review vorbereiten: jeden Codeteil erklären und eine Alternative nennen können", note: "Freiwillig, einzeln, mündlich; Note kann auch sinken; mind. 60 %." },
    { id: "dbat11", title: "Programmierbeispiele ohne Hilfsmittel üben (Prozedur, Funktion, Trigger, TRY/CATCH)", note: "Relevant für eine eventuelle Klausur beim 2./3. Antritt." }
  ]
});
})();
