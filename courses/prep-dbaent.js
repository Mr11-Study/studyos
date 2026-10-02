/* Prüfungsvorbereitung DB-AENT – KEINE Altprüfungen vorhanden. Aufgebaut aus Syllabus DB-AENT (IMA25), Foliensatz (Beurteilung, Projekt-Aufbau, Wrapper)
   und den Beurteilungsregeln/Deliverables der Kursdatei. Alle alt-Items sind selbst erstellte, prüfungsnahe Übungsfragen (Code-Review + Klausur 2./3. Antritt). */
(function () {
const c = (window.COURSE_DEFS || []).find(x => x.id === "dbaent"); if (!c) return;

const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const S = s => "<pre><code>" + esc(s) + "</code></pre>";
const SRC = "Prüfungsnah (eigene Frage)";

/* ---------- MC / Richtig-Falsch (prüfungsnah, selbst erstellt) ---------- */
c.questions.push(
 { id: "dbx-q1", topic: "dba-tx", q: "Welchen Wert hat @@TRANCOUNT nach: BEGIN TRAN; BEGIN TRAN; COMMIT;", opts: ["0", "1", "2", "Fehler – inneres COMMIT ist nicht erlaubt"], a: 1, why: "Jedes BEGIN TRAN erhöht den Zähler (→ 2), jedes COMMIT senkt ihn um 1 (→ 1). Festgeschrieben wird erst beim äußersten COMMIT; ein ROLLBACK würde dagegen sofort alles zurückrollen und auf 0 setzen.", alt: true, src: SRC },
 { id: "dbx-q2", topic: "dba-tx", q: "XACT_STATE() liefert im CATCH-Block −1. Was bedeutet das?", opts: ["Es gibt keine offene Transaktion", "Die Transaktion ist committable – COMMIT ist noch möglich", "Die Transaktion ist „doomed“ – nur noch ROLLBACK ist möglich", "Der Fehler hatte Schweregrad ≤ 10"], a: 2, why: "1 = offen und committable, 0 = keine Transaktion, −1 = nicht mehr festschreibbar (z. B. mit SET XACT_ABORT ON nach einem Laufzeitfehler). Dann ist nur ROLLBACK erlaubt.", alt: true, src: SRC },
 { id: "dbx-q3", topic: "dba-sql", q: "SELECT k.name, b.bestnr FROM dbo.kunde k LEFT JOIN dbo.bestellung b ON b.kdnr = k.kdnr WHERE b.datum >= '2026-01-01'; – Was passiert mit Kunden ohne Bestellung?", opts: ["Sie erscheinen mit bestnr = NULL", "Sie fallen weg – das WHERE auf die rechte Tabelle macht den LEFT JOIN faktisch zum INNER JOIN", "Die Abfrage liefert einen Fehler", "Sie erscheinen nur, wenn datum einen DEFAULT hat"], a: 1, why: "Für Kunden ohne Bestellung ist b.datum NULL; NULL >= '2026-01-01' ist UNKNOWN → die Zeile wird gefiltert. Richtig: Bedingung in die ON-Klausel verschieben (ON b.kdnr = k.kdnr AND b.datum >= '2026-01-01').", alt: true, src: SRC },
 { id: "dbx-q4", topic: "dba-sql", q: "Anzahl Bestellungen je Kunde inkl. Kunden ohne Bestellung (LEFT JOIN kunde → bestellung). Welcher Ausdruck liefert für Kunden ohne Bestellung korrekt 0?", opts: ["COUNT(*)", "COUNT(b.bestnr)", "SUM(1)", "COUNT(k.kdnr)"], a: 1, why: "Ein Kunde ohne Bestellung erzeugt beim LEFT JOIN genau eine Zeile mit NULL in den Bestellspalten. COUNT(*), SUM(1) und COUNT(k.kdnr) zählen diese Zeile (→ 1); COUNT(spalte) ignoriert NULL (→ 0).", alt: true, src: SRC },
 { id: "dbx-q5", topic: "dba-sql", q: "Umsätze 500, 500, 300 werden mit RANK() OVER (ORDER BY umsatz DESC) gereiht. Welchen Rang erhält 300?", opts: ["2", "3", "1", "NULL"], a: 1, why: "RANK vergibt bei Gleichstand denselben Rang und lässt dann Lücken: 1, 1, 3. DENSE_RANK ergäbe 1, 1, 2; ROW_NUMBER 1, 2, 3 (willkürlich bei Gleichstand).", alt: true, src: SRC },
 { id: "dbx-q6", topic: "dba-tsql", q: "DECLARE @k INT; SET @k = (SELECT kdnr FROM dbo.kunde); – die Tabelle enthält 5 Kunden. Was passiert?", opts: ["@k erhält den ersten Kunden", "@k erhält den letzten Kunden", "Laufzeitfehler 512: Unterabfrage liefert mehr als einen Wert", "@k bleibt NULL"], a: 2, why: "SET mit Unterabfrage verlangt genau einen Wert und wirft sonst Fehler 512. SELECT @k = kdnr FROM … würde dagegen ohne Fehler irgendeinen (meist den letzten gelesenen) Wert zuweisen – eine typische Fehlerquelle.", alt: true, src: SRC },
 { id: "dbx-q7", topic: "dba-sp", q: "Eine Prozedur soll einen Preis vom Typ DECIMAL(10,2) an den Aufrufer liefern. Welche Lösung ist korrekt?", opts: ["RETURN @preis;", "Einen OUTPUT-Parameter @preis DECIMAL(10,2) OUTPUT verwenden", "PRINT @preis;", "Eine globale Variable @@preis setzen"], a: 1, why: "RETURN liefert nur INT (ein Preis würde abgeschnitten bzw. konvertiert) und ist für Statuscodes gedacht. Werte beliebigen Typs kommen über OUTPUT-Parameter (bei Deklaration und Aufruf OUTPUT angeben) oder ein Resultset.", alt: true, src: SRC },
 { id: "dbx-q8", topic: "dba-udf", q: "Was darf eine skalare User-defined Function im SQL Server enthalten?", opts: ["INSERT INTO dbo.log …", "BEGIN TRY … END TRY BEGIN CATCH … END CATCH", "DECLARE, SET/SELECT in Variablen und IF-Verzweigungen", "THROW 50001, N'Fehler', 1;"], a: 2, why: "Funktionen dürfen keine Seiteneffekte haben: keine Änderungen an Tabellen (nur an lokalen Tabellenvariablen), kein TRY/CATCH, kein THROW/RAISERROR, keine Transaktionen, kein dynamisches SQL. Variablen und Kontrollstrukturen sind erlaubt.", alt: true, src: SRC },
 { id: "dbx-q9", topic: "dba-trigger", q: "Ein UPDATE ändert 50 Zeilen von dbo.bestellposition. Wie oft feuert ein AFTER-UPDATE-Trigger auf dieser Tabelle?", opts: ["50-mal, einmal pro Zeile", "Einmal pro Anweisung – inserted/deleted enthalten alle 50 Zeilen", "Gar nicht, Trigger feuern nur bei INSERT", "Einmal pro geänderter Spalte"], a: 1, why: "SQL-Server-Trigger sind anweisungsbezogen (statement-level). Deshalb müssen sie mengenorientiert (JOIN/EXISTS auf inserted/deleted) geschrieben sein.", alt: true, src: SRC },
 { id: "dbx-q10", topic: "dba-trigger", q: "Richtig oder falsch: Ein AFTER-UPDATE-Trigger feuert auch dann, wenn das UPDATE wegen seines WHERE 0 Zeilen betrifft.", opts: ["Richtig", "Falsch"], a: 0, why: "Der Trigger feuert pro Anweisung – auch bei 0 betroffenen Zeilen; inserted und deleted sind dann leer. Mengenorientierte Prüfungen mit EXISTS sind dadurch automatisch korrekt; manche Trigger beginnen zusätzlich mit IF NOT EXISTS (SELECT 1 FROM inserted) RETURN;", alt: true, src: SRC },
 { id: "dbx-q11", topic: "dba-trigger", q: "UPDATE dbo.artikel SET vk = vk WHERE artnr = 1089; – was liefert IF UPDATE(vk) im Trigger?", opts: ["FALSE, weil sich der Wert nicht geändert hat", "TRUE, weil vk in der SET-Liste vorkommt", "NULL", "Einen Fehler"], a: 1, why: "UPDATE(spalte) prüft nur, ob die Spalte im SET (bzw. in der INSERT-Spaltenliste) vorkam – nicht, ob sich der Wert geändert hat. Deshalb filtert der Preislog-Trigger zusätzlich mit WHERE d.vk &lt;&gt; i.vk.", alt: true, src: SRC },
 { id: "dbx-q12", topic: "dba-integ", q: "Regel: „Ein Kunde darf höchstens 5 Bestellungen mit Positionen im Status ‚offen‘ haben.“ Welche Umsetzung ist am tauglichsten?", opts: ["CHECK-Constraint auf dbo.bestellung", "UNIQUE-Constraint auf (kdnr, status)", "Mengenorientierter AFTER-Trigger auf dbo.bestellposition (INSERT, UPDATE)", "Prüfung nur in der App"], a: 2, why: "Die Regel braucht Aggregation über mehrere Zeilen und zwei Tabellen – das kann kein CHECK/UNIQUE. Ein Trigger greift bei jedem Zugriffsweg (nicht umgehbar); eine Prüfung nur in der App ist leicht zu umgehen. Zusätzlich darf die Prozedur vorab prüfen, um eine schöne Fehlermeldung zu liefern.", alt: true, src: SRC },
 { id: "dbx-q13", topic: "dba-sec", q: "dbo.sp_backend_wrapper (Besitzer dbo) liest dbo.artikel (Besitzer dbo) mit statischem SQL. app_role hat nur EXECUTE auf den Wrapper. Ergebnis beim Aufruf durch app_user24nn?", opts: ["Fehler: SELECT permission denied on dbo.artikel", "Funktioniert – ununterbrochene Besitzkette, die Rechte auf dbo.artikel werden nicht geprüft", "Funktioniert nur mit WITH RECOMPILE", "Funktioniert nur, wenn app_role db_datareader ist"], a: 1, why: "Ownership Chaining: Gehören Prozedur und referenzierte Objekte demselben Besitzer, prüft der SQL Server nur das EXECUTE-Recht. Bei dynamischem SQL (EXEC(@sql)) oder anderem Besitzer bricht die Kette.", alt: true, src: SRC },
 { id: "dbx-q14", topic: "dba-inj", q: "Welche Variante ist injection-sicher?", opts: ["EXEC(N'SELECT * FROM dbo.kunde WHERE email = ''' + @email + '''')", "EXEC sys.sp_executesql N'SELECT * FROM dbo.kunde WHERE email = @e', N'@e NVARCHAR(200)', @e = @email", "EXEC(N'SELECT * FROM dbo.kunde WHERE email = ''' + REPLACE(@email, '--', '') + '''')", "Alle drei sind gleich sicher"], a: 1, why: "Bei sp_executesql mit Parameterliste wird @email als Wert übergeben und nie als SQL-Code interpretiert. String-Verkettung bleibt angreifbar; das Entfernen von „--“ ist eine unvollständige Blacklist.", alt: true, src: SRC },
 { id: "dbx-q15", topic: "dba-json", q: "@j = N'{\"typ\":\"bestellen\",\"parameter\":{\"kdnr\":7}}'. Was liefert JSON_VALUE(@j, '$.parameter')?", opts: ["{\"kdnr\":7}", "7", "NULL (im Standardmodus lax), weil der Wert kein Skalar ist", "Den Text parameter"], a: 2, why: "JSON_VALUE liest nur Skalare. Für Objekte/Arrays braucht man JSON_QUERY. Mit 'strict $.parameter' gäbe es statt NULL einen Fehler.", alt: true, src: SRC },
 { id: "dbx-q16", topic: "dba-json", q: "Wozu dient die Option WITHOUT_ARRAY_WRAPPER bei FOR JSON PATH?", opts: ["Sie entfernt NULL-Werte", "Sie liefert ein einzelnes Objekt {…} statt eines Arrays [{…}]", "Sie fügt einen Root-Knoten hinzu", "Sie verhindert das Escapen von Sonderzeichen"], a: 1, why: "FOR JSON liefert standardmäßig ein Array. Bei genau einer Ergebniszeile (z. B. Detailansicht eines Artikels) entfernt WITHOUT_ARRAY_WRAPPER die eckigen Klammern. ROOT('x') fügt einen Root-Knoten hinzu, INCLUDE_NULL_VALUES behält NULL-Spalten.", alt: true, src: SRC },
 { id: "dbx-q17", topic: "dba-json", q: "Die App schickt {\"kdnr\":7,\"positionen\":[{\"artnr\":1,\"menge\":2}]}. Wie deklariert man in OPENJSON … WITH die Spalte positionen, um sie weiter mit CROSS APPLY OPENJSON zu zerlegen?", opts: ["positionen NVARCHAR(MAX) '$.positionen'", "positionen NVARCHAR(MAX) '$.positionen' AS JSON", "positionen INT '$.positionen'", "positionen JSON_QUERY('$.positionen')"], a: 1, why: "Ohne AS JSON würde ein Array/Objekt als NULL geliefert (nur Skalare). Mit NVARCHAR(MAX) … AS JSON kommt der JSON-Teiltext zurück und kann mit CROSS APPLY OPENJSON(positionen) WITH (…) in Zeilen zerlegt werden.", alt: true, src: SRC },
 { id: "dbx-q18", topic: "dba-proc", q: "Kevin erreicht im Praxisprojekt (DB-Teil) eine sehr gute Bewertung und verzichtet auf das Code-Review. Welche Note ist höchstens möglich?", opts: ["Sehr gut", "Gut", "Befriedigend", "Genügend"], a: 2, why: "Laut Syllabus ist mit dem Praxisprojekt allein maximal „Befriedigend“ möglich. Für Gut/Sehr gut ist das freiwillige mündliche Code-Review (einzeln, mind. 60 %) nötig – es kann die Note aber auch senken.", alt: true, src: SRC },
 { id: "dbx-q19", topic: "dba-cursor", q: "Welchen Wert hat @@FETCH_STATUS, nachdem FETCH NEXT über die letzte Zeile hinaus gelesen hat?", opts: ["0", "1", "−1", "NULL"], a: 2, why: "0 = Zeile erfolgreich gelesen, −1 = keine weitere Zeile (Ende), −2 = Zeile fehlt (bei keyset-Cursorn gelöscht). Deshalb läuft die Schleife WHILE @@FETCH_STATUS = 0.", alt: true, src: SRC },
 { id: "dbx-q20", topic: "dba-sp", q: "Nach INSERT INTO dbo.bestellung feuert ein Trigger, der in eine Log-Tabelle mit IDENTITY schreibt. Womit erhält die Prozedur sicher die neue bestnr?", opts: ["@@IDENTITY", "SCOPE_IDENTITY()", "IDENT_CURRENT('dbo.bestellung')", "MAX(bestnr) aus dbo.bestellung"], a: 1, why: "SCOPE_IDENTITY() liefert den letzten Identitywert im aktuellen Scope (die Prozedur). @@IDENTITY würde den Wert aus der Log-Tabelle des Triggers liefern, IDENT_CURRENT und MAX() sind bei parallelen Zugriffen falsch. Alternative: OUTPUT inserted.bestnr.", alt: true, src: SRC },
 { id: "dbx-q21", topic: "dba-integ", q: "Richtig oder falsch: Ein AFTER-Trigger kann eine CHECK-Verletzung (z. B. lagerstand.menge &lt; 0) noch „abfangen“ und korrigieren.", opts: ["Richtig", "Falsch"], a: 1, why: "Beim SQL Server werden Constraints vor AFTER-Triggern geprüft. Verletzt die Anweisung einen CHECK, bricht sie ab, bevor der AFTER-Trigger überhaupt feuert. Ein AFTER-Trigger, der nur menge &lt; 0 prüft, ist daher wirkungslos (Code-Review-Fallstrick). Nur INSTEAD-OF-Trigger laufen vor den Constraints.", alt: true, src: SRC }
);

/* ---------- Offene Fragen (Code-Review / Klausur) mit Musterantwort ---------- */
c.flashcards.push(
 { id: "dbx-f1", cat: "DB-AENT", topic: "dba-proj", alt: true, src: SRC, front: "Code-Review: Erkläre den kompletten Weg eines Aufrufs – vom Button in der App bis zur Antwort.", back: "<ol><li>Die App (MAPPDEV) baut ein JSON, z. B. <code>{\"typ\":\"bestellen\",\"parameter\":{…}}</code>, und schickt es an die bereitgestellte <b>API</b> (…/service/nn).</li><li>Die API verbindet sich als <code>app_user24nn</code> (Rolle <code>app_role</code>) mit <code>WINF25_dbaent_nn</code> und reicht das JSON unverändert an <code>dbo.sp_backend_wrapper @input, @output OUTPUT</code> durch.</li><li>Der Wrapper prüft <code>ISJSON</code>, liest <code>$.typ</code> und verzweigt zur passenden <b>Einzelprozedur</b> (Parameter per <code>JSON_VALUE</code>/<code>OPENJSON</code>).</li><li>Die Einzelprozedur bildet den Prozess in einer <b>Transaktion</b> mit TRY/CATCH ab; fachliche Fehler per <code>THROW 50xxx</code>.</li><li>Der Wrapper baut immer ein Antwort-JSON <code>{ok, fehlercode, fehler, ergebnis}</code> – auch im Fehlerfall (CATCH) – und gibt es über <code>@output</code> an die API zurück, die es an die App liefert.</li></ol>" },
 { id: "dbx-f2", cat: "DB-AENT", topic: "dba-proj", alt: true, src: SRC, front: "Code-Review: Warum hast du deine Wrapper-Variante gewählt und welche Vorteile hat sie gegenüber einer anderen? (Beispiel: Variante 2 – Skalarwerte)", back: "<b>Variante 2:</b> Der Wrapper liest das JSON, ruft typisierte Einzelprozeduren mit Skalarparametern auf und baut das Antwort-JSON.<ul><li><b>Vorteile ggü. Variante 1</b> (JSON bis in die Einzelprozedur): Parameter sind typisiert (INT, DECIMAL) → Typfehler fallen beim Aufruf auf; Einzelprozeduren sind in SSMS direkt testbar und für andere Clients wiederverwendbar; JSON-Logik an genau einer Stelle.</li><li><b>Nachteil:</b> Der Wrapper wird groß; Listen-Ergebnisse muss man trotzdem als JSON-OUTPUT oder per <code>FOR JSON</code> erzeugen.</li><li><b>Variante 3</b> (eigener JSON-Wrapper) trennt noch sauberer, bedeutet aber mehr Objekte und Aufrufe – für die Projektgröße unnötig.</li></ul>Wichtig im Review: Es gibt keine einzig richtige Lösung – man muss die eigene Wahl <b>begründen</b> können." },
 { id: "dbx-f3", cat: "DB-AENT", topic: "dba-tx", alt: true, src: SRC, front: "Erkläre jede Zeile: SET XACT_ABORT ON · BEGIN TRY · BEGIN TRANSACTION · COMMIT · BEGIN CATCH · IF @@TRANCOUNT > 0 ROLLBACK · THROW;", back: "<ul><li><code>SET XACT_ABORT ON</code>: jeder Laufzeitfehler macht die Transaktion „doomed“ bzw. rollt sie zurück – kein halber Prozess, auch bei Client-Timeouts.</li><li><code>BEGIN TRY</code>: Fehler (Schweregrad &gt; 10) springen in den CATCH-Block.</li><li><code>BEGIN TRANSACTION … COMMIT</code>: alle Schritte (Lager buchen, Bestellung, Positionen) atomar – ganz oder gar nicht (ACID).</li><li><code>IF @@TRANCOUNT &gt; 0 ROLLBACK</code>: nur zurückrollen, wenn noch eine Transaktion offen ist – ein Trigger könnte schon zurückgerollt haben (sonst Fehler 3903).</li><li><code>THROW;</code>: Originalfehler (Nummer, Text) an den Aufrufer (Wrapper) weitergeben, statt ihn zu verschlucken; der Wrapper macht daraus das Fehler-JSON.</li></ul>" },
 { id: "dbx-f4", cat: "DB-AENT", topic: "dba-trigger", alt: true, src: SRC, front: "Warum muss ein Trigger mengenorientiert sein? Zeige den typischen Fehler und die Korrektur.", back: "Ein Trigger feuert <b>einmal pro Anweisung</b>; inserted/deleted können viele Zeilen enthalten.<br><b>Falsch:</b><pre><code>SELECT @artnr = artnr FROM inserted;\nIF (SELECT aktiv FROM dbo.artikel WHERE artnr = @artnr) = 0\n  ROLLBACK;</code></pre>→ prüft nur eine (zufällige) Zeile; bei einem Mehrzeilen-UPDATE rutschen ungültige Zeilen durch.<br><b>Richtig:</b><pre><code>IF EXISTS (SELECT 1 FROM inserted i\n           JOIN dbo.artikel a ON a.artnr = i.artnr\n           WHERE a.aktiv = 0)\nBEGIN\n  ROLLBACK TRANSACTION;\n  THROW 50010, N'Inaktive Artikel können nicht bestellt werden', 1;\nEND</code></pre>Prüffrage: „Gibt es etwas, was nicht passt?“" },
 { id: "dbx-f5", cat: "DB-AENT", topic: "dba-integ", alt: true, src: SRC, front: "Ordne zu und begründe: Constraint, Trigger oder Prüfung in der Prozedur? (a) Menge > 0 (b) E-Mail eindeutig (c) nur aktive Artikel bestellbar (d) Preisänderungen protokollieren (e) Lagerstand reicht für Bestellung", back: "<table class=\"dt\"><tr><th>Regel</th><th>Mechanismus</th><th>Begründung</th></tr><tr><td>(a) Menge &gt; 0</td><td>CHECK</td><td>zeilenbezogen, deklarativ, schnell, nicht umgehbar</td></tr><tr><td>(b) E-Mail eindeutig</td><td>UNIQUE</td><td>deklarativ, mit Index; Prozedur kann vorab prüfen für einen sprechenden Fehlercode</td></tr><tr><td>(c) nur aktive Artikel</td><td>Trigger</td><td>tabellenübergreifend → kein CHECK möglich</td></tr><tr><td>(d) Preislog</td><td>AFTER-UPDATE-Trigger</td><td>Zusatzaufgabe ohne Umgehungsmöglichkeit</td></tr><tr><td>(e) Lagerstand</td><td>Prozedur (bedingtes UPDATE + @@ROWCOUNT) + CHECK menge &gt;= 0 als Sicherheitsnetz</td><td>Teil des Prozesses, liefert eigenen Fehlercode; CHECK verhindert Negativbestand auch bei parallelen Zugriffen</td></tr></table>Faustregel: deklarativ, wo möglich – prozedural nur, wo nötig." },
 { id: "dbx-f6", cat: "DB-AENT", topic: "dba-sec", alt: true, src: SRC, front: "Warum braucht app_role nur EXECUTE auf dbo.sp_backend_wrapper? Wann funktioniert das nicht mehr?", back: "<b>Indirekter Zugriff + Besitzkette (Ownership Chaining):</b> Wrapper, Einzelprozeduren und Tabellen gehören alle <code>dbo</code>. Ruft ein Objekt ein anderes desselben Besitzers auf, prüft der Server nur das Recht auf das erste Objekt (EXECUTE). Die App kann dadurch <b>nur</b> die definierten Prozesse ausführen, nie beliebiges SQL auf Tabellen.<br><b>Die Kette bricht</b> bei: dynamischem SQL (<code>EXEC(@sql)</code>, <code>sp_executesql</code>) – dort werden die Rechte des Aufrufers geprüft; Objekten mit anderem Besitzer/Schema-Besitzer; DB-übergreifenden Zugriffen. Lösung, falls nötig: statisches SQL, oder <code>EXECUTE AS OWNER</code> bzw. Modulsignatur." },
 { id: "dbx-f7", cat: "DB-AENT", topic: "dba-inj", alt: true, src: SRC, front: "Code-Review: Ist euer Backend gegen SQL-Injection geschützt? Begründe.", back: "Ja, wenn gilt:<ul><li>Die API übergibt das JSON als <b>Parameter</b> <code>@input</code> – es wird nie in einen SQL-String eingebaut.</li><li>Im Wrapper und in den Prozeduren gibt es <b>kein dynamisches SQL</b>; Werte werden mit <code>JSON_VALUE</code>/<code>OPENJSON</code> gelesen und als typisierte Variablen/Parameter verwendet → Eingaben bleiben immer Daten, nie Code.</li><li>Falls dynamisches SQL nötig wäre: <code>sp_executesql</code> mit Parameterliste, Objektnamen per <code>QUOTENAME</code> und Whitelist.</li><li>Zusätzlich minimale Rechte: <code>app_role</code> hat nur EXECUTE – selbst eine erfolgreiche Injection könnte keine Tabellen direkt lesen.</li></ul>Kaputtes JSON wird mit <code>ISNULL(ISJSON(@input),0) = 0</code> abgefangen." },
 { id: "dbx-f8", cat: "DB-AENT", topic: "dba-json", alt: true, src: SRC, front: "Wie liest du ein Array von Bestellpositionen aus dem Eingabe-JSON und fügst es ein – und warum ohne Cursor?", back: "<pre><code>INSERT INTO dbo.bestellposition (bestnr, posnr, artnr, menge, preis)\nSELECT @bestnr,\n       ROW_NUMBER() OVER (ORDER BY j.artnr),\n       j.artnr, j.menge, a.vk\nFROM OPENJSON(@input, '$.parameter.positionen')\n     WITH (artnr INT '$.artnr', menge INT '$.menge') AS j\nJOIN dbo.artikel a ON a.artnr = j.artnr;</code></pre><b>Mengenorientiert:</b> eine Anweisung für alle Positionen – schneller, weniger Code, atomar, Trigger/Constraints prüfen alle Zeilen auf einmal. Ein Cursor wäre „Schleifitis“: Zeile für Zeile, langsam, fehleranfälliger." },
 { id: "dbx-f9", cat: "DB-AENT", topic: "dba-sp", alt: true, src: SRC, front: "Warum verwendet ihr eigene Fehlercodes ≥ 50000 und wie kommt ein Fehler bei der App an?", back: "<ul><li>Fehlernummern unter 50000 sind für Systemmeldungen reserviert; <code>THROW</code> verlangt eigene Nummern ≥ 50000.</li><li>Eigene Codes sind <b>fachlich</b> (z. B. 50002 = Lagerstand nicht ausreichend) und im Fehlercode-Katalog dokumentiert → die App kann je Code reagieren (Text in passender Sprache, Hinweis an den Benutzer).</li><li>Ablauf: Einzelprozedur <code>THROW 50002, …</code> → CATCH der Prozedur: Rollback + <code>THROW;</code> → CATCH des Wrappers: <code>JSON_OBJECT('ok': 0, 'fehlercode': ERROR_NUMBER(), 'fehler': ERROR_MESSAGE(), 'ergebnis': NULL)</code> → API → App.</li><li>Systemfehler (z. B. 547 FK/CHECK, 2627 UNIQUE) werden durchgereicht oder auf eigene Codes gemappt.</li></ul>" },
 { id: "dbx-f10", cat: "DB-AENT", topic: "dba-udf", alt: true, src: SRC, front: "Warum ist dbo.fn_bestellungen_kunde eine Inline-Tabellenwertfunktion und keine Prozedur oder Multi-Statement-TVF?", back: "<ul><li><b>Gegenüber einer Prozedur:</b> Eine Funktion ist in Abfragen verwendbar (<code>FROM</code>, <code>JOIN</code>, <code>CROSS APPLY</code>, <code>WHERE</code>), ihr Ergebnis kann weiter gefiltert, sortiert, aggregiert oder mit <code>FOR JSON</code> ausgegeben werden. Ein Prozedur-Resultset geht nur über <code>INSERT … EXEC</code> weiter.</li><li><b>Gegenüber Multi-Statement-TVF:</b> Eine Inline-TVF ist nur ein parametrisiertes SELECT – der Optimierer fügt sie wie eine Sicht in die Abfrage ein (gute Pläne, Indizes nutzbar). Multi-Statement-TVFs füllen eine Tabellenvariable, deren Zeilenzahl schlecht geschätzt wird.</li><li>Einschränkung: keine Seiteneffekte – Schreiben (z. B. Logging) gehört in eine Prozedur.</li></ul>" },
 { id: "dbx-f11", cat: "DB-AENT", topic: "dba-server", alt: true, src: SRC, front: "Warum liegt die Geschäftslogik in eurem Projekt in der Datenbank und nicht in der App? Nenne auch ein Gegenargument.", back: "<b>Für den Server:</b><ul><li>Konstanter Faktor ist die Datenbank: Logik einmal implementiert, von jedem Client (App, Web, Import) gleich genutzt – Wiederverwendbarkeit.</li><li>Sicherheit: indirekter Zugriff nur über Prozeduren, keine Tabellenrechte für die App.</li><li>Datenintensive Abläufe laufen nah an den Daten – weniger Netzwerkverkehr, Transaktionen am Server.</li><li>Integrität ist nicht umgehbar (Constraints, Trigger).</li></ul><b>Dagegen:</b> rechenintensive Algorithmen, UI-nahe Validierung (sofortiges Feedback) und Portabilität (T-SQL ist herstellerspezifisch) sprechen für Logik im Client bzw. in einer Middleware." },
 { id: "dbx-f12", cat: "DB-AENT", topic: "dba-cursor", alt: true, src: SRC, front: "Wann wäre ein Cursor vertretbar – und wie ersetzt du einen typischen Cursor durch eine Mengenoperation?", back: "Vertretbar nur, wenn <b>pro Zeile</b> etwas getan werden muss, das nicht mengenorientiert geht – z. B. pro Zeile eine bestehende Prozedur aufrufen (EXEC) oder pro Kunde eine E-Mail-Prozedur starten.<br>Typischer Fall „alle aktiven Artikel um @p % erhöhen“:<pre><code>-- statt DECLARE c CURSOR … FETCH … UPDATE … WHERE artnr = @artnr\nUPDATE dbo.artikel\nSET vk = ROUND(vk * (1 + @p / 100), 2)\nWHERE aktiv = 1;</code></pre>Eine Anweisung, ein Triggeraufruf (Preislog mengenorientiert), atomar, deutlich schneller. Wenn doch Cursor: <code>LOCAL FAST_FORWARD</code>, und <code>CLOSE</code> + <code>DEALLOCATE</code> nicht vergessen." },
 { id: "dbx-f13", cat: "DB-AENT", topic: "dba-proc", alt: true, src: SRC, front: "Wie seid ihr laut Vorgehensmodell von den Anforderungen zur Implementierung gekommen?", back: "<ol><li><b>Anforderungen analysieren:</b> Use Cases der App sammeln, je Use Case einen API-<code>typ</code> mit Eingabe- und Antwort-JSON und Fehlerfällen festlegen (gemeinsam mit MAPPDEV).</li><li><b>Datenmodell planen:</b> ER-Modell, Normalisierung, Schlüssel.</li><li><b>Konstruieren:</b> DDL mit allen Constraints; je Regel entscheiden: Constraint, Trigger oder Prozedur.</li><li><b>Funktionen zur Nutzung entwickeln:</b> Einzelprozeduren, Funktionen, Trigger, Wrapper, Fehlercode-Katalog.</li><li><b>Testen:</b> Testskript mit gültigen, ungültigen und bösartigen Eingaben; End-to-End über die API.</li></ol>" }
);

/* ---------- Prüfungsfokus ---------- */
c.examPrep = {
  format: "<b>Es wurden keine Altprüfungen bereitgestellt</b> – diese Vorbereitung basiert auf Syllabus, Folien und den Beurteilungsregeln; alle Fragen und Aufgaben sind selbst erstellt und prüfungsnah. <b>1. Antritt (prüfungsimmanent):</b> Praxisprojekt in Gruppen (gemeinsam mit MAPPDEV, DB-Teil wird separat beurteilt) = <b>75 %</b>, muss positiv sein; optionales <b>mündliches Code-Review</b> zum DB-Teil, einzeln = <b>25 %</b>, muss mit mind. <b>60 %</b> positiv sein. Mit dem Projekt allein ist höchstens „Befriedigend“ möglich; das Review kann die Note verbessern oder verschlechtern, ein negatives Review macht den ganzen 1. Antritt negativ. Im Review muss jeder beliebige Codeteil detailliert erklärt werden können, inkl. Vorteilen gegenüber anderen Lösungen. Mindestens 75 % Anwesenheit (online nur mit Kamera). <b>2./3. Antritt:</b> Klausur mit Programmierbeispielen (100 %), der 3. vor einer Kommission. Notenschlüssel: ab 91 % Sehr gut, ab 81 % Gut.",
  sources: ["Syllabus DB-AENT (IMA25)", "Foliensatz DB-AENT WS26/27 (Beurteilung, Projekt-Aufbau, Wrapper-Überlegungen)", "Kursdatei DB-AENT (Beurteilung, Termine, Projektaufgaben)"],
  strategy: [
    "Für ein Sehr gut führt kein Weg am Code-Review vorbei: Projekt allein = max. Befriedigend. Plane das Review fix ein und bereite es wie eine mündliche Prüfung vor – du brauchst ≥ 91 % gesamt, also ein (fast) fehlerfreies Projekt UND ein starkes Review.",
    "Schreibe den DB-Teil so, dass du ihn allein erklären kannst: jede Prozedur, jeden Trigger, jede Zeile im TRY/CATCH-Muster. Gehe Code von Teamkollegen Zeile für Zeile durch – im Review kann jeder beliebige Codeteil drankommen.",
    "Zu jeder Designentscheidung eine Alternative mit Vor-/Nachteil parat haben: Wrapper-Variante 1/2/3, Constraint vs. Trigger vs. Prozedur, Inline-TVF vs. Prozedur, Menge vs. Cursor, statisches vs. dynamisches SQL.",
    "Qualitätsmerkmale, die ein Prüfer sucht: mengenorientierte Trigger, Transaktion + TRY/CATCH + IF @@TRANCOUNT > 0 + THROW, SET NOCOUNT/XACT_ABORT ON, sprechende Fehlercodes ≥ 50000, keine Tabellenrechte für app_role, kein dynamisches SQL, Wrapper liefert immer gültiges JSON.",
    "Teste mit einem Skript in SSMS (gültig, ungültig, bösartig, Mehrzeilen-Updates) – und zeige es im Review. Konkrete Testfälle sind das beste Argument, dass die Lösung „tauglich“ ist.",
    "Für den Notfall (2./3. Antritt) die Programmieraufgaben unten ohne Hilfsmittel auf Papier lösen: SELECT mit JOIN/GROUP BY/Fensterfunktion, Prozedur mit Transaktion, Funktion, Trigger, JSON."
  ],
  focus: [
    { topic: "dba-proj", weight: 3, note: "Kern des Projekts (75 %) und Hauptthema im Code-Review: Wrapper, Varianten, Antwort-JSON" },
    { topic: "dba-tx", weight: 3, note: "Jede schreibende Prozedur braucht Transaktion + TRY/CATCH – wird im Review Zeile für Zeile erfragt" },
    { topic: "dba-sp", weight: 3, note: "Einzelprozeduren sind der Großteil des Projektcodes; Parameter, OUTPUT, RETURN, Fehlercodes" },
    { topic: "dba-trigger", weight: 3, note: "Mengenorientierte Trigger für Regeln ohne Constraint – klassischer Review- und Klausurstoff" },
    { topic: "dba-json", weight: 3, note: "Ein- und Ausgabe des Wrappers laufen komplett über JSON (JSON_VALUE, OPENJSON, FOR JSON, JSON_OBJECT)" },
    { topic: "dba-integ", weight: 2, note: "„Taugliche von untauglichen Lösungen unterscheiden“ (Lernergebnis): je Regel Constraint/Trigger/Prozedur begründen" },
    { topic: "dba-sql", weight: 2, note: "Komplexe Abfragen (JOIN, GROUP BY/HAVING, EXISTS, CTE, Fensterfunktionen) – Basis jeder Leseprozedur und Klausur" },
    { topic: "dba-sec", weight: 2, note: "app_role nur EXECUTE, Besitzkette – typische Review-Frage „warum funktioniert das?“" },
    { topic: "dba-inj", weight: 2, note: "Sicherheit der Lösung begründen können" },
    { topic: "dba-udf", weight: 2, note: "Funktionen in Abfragen, Einschränkungen (keine Seiteneffekte)" },
    { topic: "dba-cursor", weight: 2, note: "Mengenorientiert statt Schleife – Lösung muss „tauglich“ sein" },
    { topic: "dba-tsql", weight: 1, note: "Variablen, IF/WHILE, @@ROWCOUNT als Handwerkszeug" },
    { topic: "dba-proc", weight: 1, note: "Vorgehensmodell und Beurteilungsregeln kennen" },
    { topic: "dba-server", weight: 1, note: "Begründung, warum Logik am Server liegt" },
    { topic: "dba-zugriff", weight: 1, note: "Hintergrund: wie die API auf die DB zugreift (parametrisiert)" },
    { topic: "dba-arch", weight: 1, note: "Begriffe Datenbankanwendung, Schichten" }
  ],
  checklist: [
    { id: "dbxc1", topic: "dba-proc", text: "Mind. 75 % Anwesenheit sichern (online: Kamera an) und Code-Review-Termin rechtzeitig fixieren (Moodle)." },
    { id: "dbxc2", topic: "dba-proj", text: "SSMS-Verbindung zu IMAMSSQL / WINF25_dbaent_nn als app_user24nn getestet; wissen, was die Rolle app_role darf." },
    { id: "dbxc3", topic: "dba-proj", text: "Mit MAPPDEV alle API-Typen festgelegt: je typ Eingabe-JSON, Antwort-JSON {ok, fehlercode, fehler, ergebnis}, Fehlerfälle." },
    { id: "dbxc4", topic: "dba-proc", text: "ER-Modell und DDL-Skript mit allen PK/FK/UNIQUE/CHECK/DEFAULT-Constraints fertig; je Regel Mechanismus begründet." },
    { id: "dbxc5", topic: "dba-sp", text: "Fehlercode-Katalog (≥ 50000) angelegt und dokumentiert; jeder fachliche Fehler hat einen eigenen Code." },
    { id: "dbxc6", topic: "dba-proj", text: "dbo.sp_backend_wrapper @input/@output steht: ISJSON-Prüfung, Verzweigung nach typ, CATCH liefert immer gültiges Fehler-JSON." },
    { id: "dbxc7", topic: "dba-proj", text: "Gewählte Wrapper-Variante (JSON / Skalarwerte / JSON-Wrapper / Mischform) mit Vorteilen gegenüber den anderen frei erklären können." },
    { id: "dbxc8", topic: "dba-tx", text: "Jede schreibende Prozedur: SET NOCOUNT ON, SET XACT_ABORT ON, TRY/CATCH, BEGIN TRAN/COMMIT, IF @@TRANCOUNT > 0 ROLLBACK, THROW; – jede Zeile erklären können." },
    { id: "dbxc9", topic: "dba-trigger", text: "Mind. ein mengenorientierter Trigger für eine Regel, die kein Constraint abdeckt – mit Mehrzeilen-UPDATE getestet." },
    { id: "dbxc10", topic: "dba-trigger", text: "inserted/deleted je Ereignis, AFTER vs. INSTEAD OF, Prüfreihenfolge (Constraints vor AFTER-Triggern), IF UPDATE() erklären können." },
    { id: "dbxc11", topic: "dba-json", text: "JSON_VALUE vs. JSON_QUERY, OPENJSON … WITH (inkl. AS JSON), FOR JSON PATH/ROOT/WITHOUT_ARRAY_WRAPPER, JSON_OBJECT sicher anwenden." },
    { id: "dbxc12", topic: "dba-sql", text: "Abfragen mit mehreren JOINs, LEFT JOIN + COUNT(spalte), GROUP BY/HAVING, NOT EXISTS, CTE und ROW_NUMBER/RANK/LAG ohne Hilfe schreiben." },
    { id: "dbxc13", topic: "dba-udf", text: "Skalare UDF und Inline-TVF schreiben und mit CROSS APPLY verwenden; erklären, was Funktionen nicht dürfen." },
    { id: "dbxc14", topic: "dba-sec", text: "Besitzkette erklären: warum app_role nur EXECUTE braucht und warum dynamisches SQL die Kette bricht." },
    { id: "dbxc15", topic: "dba-inj", text: "Nachweisen können, dass das Backend injection-sicher ist (kein dynamisches SQL bzw. sp_executesql mit Parametern)." },
    { id: "dbxc16", topic: "dba-cursor", text: "Keine Cursor/Schleifen, wo eine Mengenoperation reicht; Cursor-Code auf UPDATE/INSERT … SELECT umschreiben können." },
    { id: "dbxc17", topic: "dba-integ", text: "Für jede Geschäftsregel des Projekts sagen können: deklarativ oder prozedural – und warum." },
    { id: "dbxc18", topic: "dba-proj", text: "Testskript mit gültigen, ungültigen und bösartigen Eingaben (kaputtes JSON, Injection-Versuch, unbekannter typ) läuft fehlerfrei durch." },
    { id: "dbxc19", topic: "dba-server", text: "Argumente für/gegen Logik am Server (Wiederverwendbarkeit, Sicherheit, Netzwerk vs. Portabilität, Algorithmen) parat." },
    { id: "dbxc20", topic: "dba-proj", text: "DB-Teil des Praxisprojekts fristgerecht abgegeben (Termin laut Moodle)." }
  ],
  tasks: [
   { id: "dbxr1", topic: "dba-sql", title: "Abfragen: Lagerbestand und relationale Division", pts: 10,
     html: "Webshop-Schema wie im Kurs (kunde, artikel, lager, lagerstand, bestellung, bestellposition).<ol><li>Liste alle <b>aktiven</b> Artikel mit ihrem <b>Gesamtbestand über alle Lager</b> und der Anzahl Lager, in denen sie geführt werden. Artikel ohne Lagerstand-Eintrag sollen mit Bestand 0 erscheinen. Nur Artikel mit Gesamtbestand &lt; 10, aufsteigend nach Bestand.</li><li>Welche Artikel sind in <b>allen</b> Lagern mit Menge &gt; 0 vorrätig?</li></ol>",
     solution: "<b>a)</b>" + S(`SELECT a.artnr, a.bezeichnung,
       COALESCE(SUM(ls.menge), 0) AS bestand_gesamt,
       COUNT(ls.lagernr)          AS anzahl_lager
FROM dbo.artikel a
LEFT JOIN dbo.lagerstand ls ON ls.artnr = a.artnr
WHERE a.aktiv = 1
GROUP BY a.artnr, a.bezeichnung
HAVING COALESCE(SUM(ls.menge), 0) < 10
ORDER BY bestand_gesamt, a.artnr;`) + "LEFT JOIN, damit Artikel ohne Lagerstand nicht verschwinden; <code>COUNT(ls.lagernr)</code> statt <code>COUNT(*)</code>, sonst zählt die NULL-Zeile als 1; <code>COALESCE</code>, weil SUM über nur NULL NULL liefert. Der Alias darf im ORDER BY, aber nicht im HAVING verwendet werden.<br><b>b)</b> Doppeltes NOT EXISTS („es gibt kein Lager, in dem der Artikel fehlt“):" + S(`SELECT a.artnr, a.bezeichnung
FROM dbo.artikel a
WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.lager l
        WHERE NOT EXISTS (
                SELECT 1
                FROM dbo.lagerstand ls
                WHERE ls.artnr = a.artnr
                  AND ls.lagernr = l.lagernr
                  AND ls.menge > 0));`) + "Alternative mit Zählen:" + S(`SELECT ls.artnr
FROM dbo.lagerstand ls
WHERE ls.menge > 0
GROUP BY ls.artnr
HAVING COUNT(*) = (SELECT COUNT(*) FROM dbo.lager);`) + "(funktioniert, weil (artnr, lagernr) Primärschlüssel ist – keine Doppelzählung)." },
   { id: "dbxr2", topic: "dba-sql", title: "Fensterfunktionen: Ranking, Anteil, Abstand, laufende Summe", pts: 12,
     html: "<ol><li>Umsatz je Kunde im laufenden Kalenderjahr mit <b>Rang</b> (bei Gleichstand gleicher Rang) und <b>Anteil in %</b> am Gesamtumsatz.</li><li>Jede Bestellung mit der Anzahl <b>Tage seit der vorherigen Bestellung desselben Kunden</b>.</li><li>Umsatz je Monat mit <b>kumuliertem Jahresumsatz</b> (laufende Summe, beginnt jedes Jahr neu).</li></ol>",
     solution: "<b>a)</b>" + S(`WITH u AS (
  SELECT k.kdnr, k.name, SUM(p.menge * p.preis) AS umsatz
  FROM dbo.kunde k
  JOIN dbo.bestellung b      ON b.kdnr = k.kdnr
  JOIN dbo.bestellposition p ON p.bestnr = b.bestnr
  WHERE b.datum >= DATEFROMPARTS(YEAR(SYSDATETIME()), 1, 1)
  GROUP BY k.kdnr, k.name
)
SELECT kdnr, name, umsatz,
       RANK() OVER (ORDER BY umsatz DESC) AS rang,
       CAST(100.0 * umsatz / SUM(umsatz) OVER () AS DECIMAL(5,2)) AS anteil_prozent
FROM u
ORDER BY rang;`) + "<code>SUM(umsatz) OVER ()</code> = Gesamtsumme über alle Zeilen, ohne die Zeilen zu gruppieren. Das Datum als Bereich (&gt;= 1.1.) statt <code>YEAR(b.datum) = …</code> bleibt indexfähig (sargable).<br><b>b)</b>" + S(`SELECT b.kdnr, b.bestnr, b.datum,
       DATEDIFF(DAY,
                LAG(b.datum) OVER (PARTITION BY b.kdnr ORDER BY b.datum),
                b.datum) AS tage_seit_vorheriger
FROM dbo.bestellung b
ORDER BY b.kdnr, b.datum;`) + "Für die erste Bestellung eines Kunden liefert LAG NULL → Ergebnis NULL.<br><b>c)</b>" + S(`SELECT m.jahr, m.monat, m.umsatz,
       SUM(m.umsatz) OVER (PARTITION BY m.jahr ORDER BY m.monat
                           ROWS UNBOUNDED PRECEDING) AS kumuliert
FROM (
  SELECT YEAR(b.datum) AS jahr, MONTH(b.datum) AS monat,
         SUM(p.menge * p.preis) AS umsatz
  FROM dbo.bestellung b
  JOIN dbo.bestellposition p ON p.bestnr = b.bestnr
  GROUP BY YEAR(b.datum), MONTH(b.datum)
) AS m
ORDER BY m.jahr, m.monat;`) + "PARTITION BY jahr startet die Summe jedes Jahr neu; ROWS UNBOUNDED PRECEDING = vom Partitionsanfang bis zur aktuellen Zeile." },
   { id: "dbxr3", topic: "dba-tx", title: "Prozedur mit Transaktion: Lagerumbuchung", pts: 15,
     html: "Schreibe <code>dbo.sp_lager_umbuchen @artnr INT, @von_lager INT, @nach_lager INT, @menge INT</code>:<ul><li>Menge muss &gt; 0 sein, Quell- und Ziellager verschieden, Ziellager muss existieren (eigene Fehlercodes ≥ 50000).</li><li>Im Quelllager muss genug Bestand sein.</li><li>Gibt es im Ziellager noch keinen Lagerstand-Eintrag für den Artikel, wird er angelegt.</li><li>Alles oder nichts; Fehler werden an den Aufrufer weitergegeben.</li></ul>Zeige auch einen Testaufruf.",
     solution: S(`CREATE OR ALTER PROCEDURE dbo.sp_lager_umbuchen
  @artnr INT, @von_lager INT, @nach_lager INT, @menge INT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  BEGIN TRY
    IF @menge IS NULL OR @menge <= 0
      THROW 50020, N'Menge muss größer 0 sein', 1;
    IF @von_lager = @nach_lager
      THROW 50021, N'Quell- und Ziellager sind identisch', 1;
    IF NOT EXISTS (SELECT 1 FROM dbo.lager WHERE lagernr = @nach_lager)
      THROW 50022, N'Ziellager unbekannt', 1;

    BEGIN TRANSACTION;

    -- Abbuchen nur, wenn genug da ist (Prüfen + Buchen in EINER Anweisung)
    UPDATE dbo.lagerstand
    SET menge = menge - @menge
    WHERE artnr = @artnr AND lagernr = @von_lager AND menge >= @menge;
    IF @@ROWCOUNT = 0
      THROW 50023, N'Bestand im Quelllager nicht ausreichend', 1;

    -- Zubuchen oder neu anlegen
    UPDATE dbo.lagerstand
    SET menge = menge + @menge
    WHERE artnr = @artnr AND lagernr = @nach_lager;
    IF @@ROWCOUNT = 0
      INSERT INTO dbo.lagerstand (artnr, lagernr, menge)
      VALUES (@artnr, @nach_lager, @menge);

    COMMIT TRANSACTION;
    RETURN 0;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0
      ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END;
GO

-- Test
EXEC dbo.sp_lager_umbuchen @artnr = 1089, @von_lager = 1, @nach_lager = 2, @menge = 5;
SELECT * FROM dbo.lagerstand WHERE artnr = 1089;`) + "<b>Erklärpunkte fürs Review:</b><ul><li>Parameterprüfungen <b>vor</b> der Transaktion – billig, sperren nichts.</li><li>Das bedingte UPDATE mit <code>menge &gt;= @menge</code> prüft und bucht atomar – kein Zeitfenster zwischen Prüfung und Buchung.</li><li>„UPDATE, sonst INSERT“ (Upsert); alternativ MERGE. Bei paralleler Neuanlage würde der PK verletzt → Fehler → Rollback, keine inkonsistenten Daten.</li><li>THROW innerhalb des TRY springt in den CATCH; dort Rollback und <code>THROW;</code> reicht den Fehler (z. B. 50023) an den Wrapper weiter.</li><li>Ein Fehler beim Zubuchen nach erfolgreichem Abbuchen wird komplett zurückgerollt (Atomarität).</li></ul>" },
   { id: "dbxr4", topic: "dba-udf", title: "Funktionen: skalar, Inline-TVF, CROSS APPLY", pts: 12,
     html: "<ol><li>Skalare Funktion <code>dbo.fn_bestellsumme(@bestnr INT)</code>: Summe menge × preis einer Bestellung, 0 wenn keine Positionen.</li><li>Inline-Tabellenwertfunktion <code>dbo.fn_artikel_umsatz(@von DATE, @bis DATE)</code>: je Artikel Stückzahl und Umsatz im Zeitraum (beide Tage inklusive). Zeige eine Abfrage, die das Ergebnis mit der Artikelbezeichnung absteigend nach Umsatz ausgibt.</li><li>Gib für jeden aktiven Kunden seine <b>drei letzten</b> Bestellungen mit Summe aus – unter Verwendung der vorhandenen <code>dbo.fn_bestellungen_kunde(@kdnr)</code>.</li></ol>",
     solution: "<b>a)</b>" + S(`CREATE OR ALTER FUNCTION dbo.fn_bestellsumme (@bestnr INT)
RETURNS DECIMAL(12,2)
AS
BEGIN
  DECLARE @summe DECIMAL(12,2);
  SELECT @summe = SUM(menge * preis)
  FROM dbo.bestellposition
  WHERE bestnr = @bestnr;
  RETURN ISNULL(@summe, 0);
END;`) + "Aufruf immer mit Schema: <code>SELECT bestnr, dbo.fn_bestellsumme(bestnr) FROM dbo.bestellung;</code> (skalare UDFs werden pro Zeile ausgeführt – bei großen Mengen ist ein JOIN mit GROUP BY schneller).<br><b>b)</b>" + S(`CREATE OR ALTER FUNCTION dbo.fn_artikel_umsatz (@von DATE, @bis DATE)
RETURNS TABLE
AS
RETURN (
  SELECT p.artnr,
         SUM(p.menge)           AS stueck,
         SUM(p.menge * p.preis) AS umsatz
  FROM dbo.bestellposition p
  JOIN dbo.bestellung b ON b.bestnr = p.bestnr
  WHERE b.datum >= @von
    AND b.datum <  DATEADD(DAY, 1, @bis)
  GROUP BY p.artnr
);
GO

SELECT a.bezeichnung, u.stueck, u.umsatz
FROM dbo.fn_artikel_umsatz('2026-01-01', '2026-06-30') AS u
JOIN dbo.artikel a ON a.artnr = u.artnr
ORDER BY u.umsatz DESC;`) + "<code>&lt; @bis + 1 Tag</code>, weil datum DATETIME2 mit Uhrzeit ist – <code>&lt;= @bis</code> würde Bestellungen am letzten Tag nach 00:00 verlieren.<br><b>c)</b>" + S(`SELECT k.kdnr, k.name, x.bestnr, x.datum, x.summe
FROM dbo.kunde k
CROSS APPLY (
  SELECT TOP (3) f.bestnr, f.datum, f.summe
  FROM dbo.fn_bestellungen_kunde(k.kdnr) AS f
  ORDER BY f.datum DESC
) AS x
WHERE k.aktiv = 1
ORDER BY k.kdnr, x.datum DESC;`) + "CROSS APPLY ruft die Funktion je Kunde auf (Kunden ohne Bestellung fallen weg; mit OUTER APPLY blieben sie mit NULL erhalten)." },
   { id: "dbxr5", topic: "dba-trigger", title: "Trigger: Statusregel und Soft-Delete", pts: 15,
     html: "<ol><li>Positionen mit Status <code>'versendet'</code> dürfen nicht mehr geändert werden; außerdem darf eine Position nicht von <code>'zugeteilt'</code> zurück auf <code>'offen'</code> gesetzt werden. Fehlercode 50030/50031.</li><li>Beim Löschen eines Artikels: Wurde er schon einmal bestellt, wird er nur <b>deaktiviert</b>; nie bestellte Artikel werden samt Lagerständen wirklich gelöscht.</li></ol>Beide Trigger müssen auch bei Mehrzeilen-Anweisungen korrekt arbeiten.",
     solution: "<b>a)</b>" + S(`CREATE OR ALTER TRIGGER dbo.trg_pos_status
ON dbo.bestellposition
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (SELECT 1 FROM deleted WHERE status = 'versendet')
  BEGIN
    ROLLBACK TRANSACTION;
    THROW 50030, N'Versendete Positionen dürfen nicht mehr geändert werden', 1;
  END

  IF EXISTS (SELECT 1
             FROM deleted d
             JOIN inserted i ON i.bestnr = d.bestnr AND i.posnr = d.posnr
             WHERE d.status = 'zugeteilt' AND i.status = 'offen')
  BEGIN
    ROLLBACK TRANSACTION;
    THROW 50031, N'Status darf nicht zurückgesetzt werden', 1;
  END
END;`) + "deleted = Zustand vorher, inserted = nachher; JOIN über den Primärschlüssel. Prüffrage „Gibt es etwas, was nicht passt?“ → EXISTS → ROLLBACK + THROW. Mengenorientiert, daher korrekt bei 1 oder 1000 Zeilen.<br><b>b)</b>" + S(`CREATE OR ALTER TRIGGER dbo.trg_artikel_delete
ON dbo.artikel
INSTEAD OF DELETE
AS
BEGIN
  SET NOCOUNT ON;

  -- bereits bestellt: nur deaktivieren
  UPDATE a
  SET aktiv = 0
  FROM dbo.artikel a
  JOIN deleted d ON d.artnr = a.artnr
  WHERE EXISTS (SELECT 1 FROM dbo.bestellposition p WHERE p.artnr = d.artnr);

  -- nie bestellt: Lagerstände und Artikel wirklich löschen
  DELETE ls
  FROM dbo.lagerstand ls
  JOIN deleted d ON d.artnr = ls.artnr
  WHERE NOT EXISTS (SELECT 1 FROM dbo.bestellposition p WHERE p.artnr = d.artnr);

  DELETE a
  FROM dbo.artikel a
  JOIN deleted d ON d.artnr = a.artnr
  WHERE NOT EXISTS (SELECT 1 FROM dbo.bestellposition p WHERE p.artnr = d.artnr);
END;`) + "Der INSTEAD-OF-Trigger <b>ersetzt</b> das DELETE – die eigentliche Löschung muss er selbst ausführen (ein DELETE auf dieselbe Tabelle im INSTEAD-OF-Trigger löst ihn nicht rekursiv aus). Lagerstände zuerst löschen, sonst verletzt das DELETE den FK fk_ls_artikel. Vorteil gegenüber Logik in der App: gilt für jeden Zugriffsweg." },
   { id: "dbxr6", topic: "dba-json", title: "Wrapper erweitern: Bestellung mit Positionen-Array und Bestellliste", pts: 20,
     html: "Die App schickt<pre><code>{\"typ\":\"bestellen\",\"parameter\":{\"kdnr\":7,\n \"positionen\":[{\"artnr\":1089,\"lagernr\":1,\"menge\":2},\n               {\"artnr\":1244,\"lagernr\":2,\"menge\":1}]}}</code></pre><ol><li>Schreibe <code>dbo.sp_bestellung_json @kdnr INT, @positionen NVARCHAR(MAX), @bestnr INT OUTPUT</code>: prüft Kunde, Artikel und Lagerstand <b>für alle Positionen</b>, bucht mengenorientiert ab und legt Bestellung + Positionen an – alles oder nichts.</li><li>Ergänze im Wrapper (Variante 2) die Zweige <code>bestellen</code> und <code>bestellungen</code> (Liste aller Bestellungen eines Kunden als JSON-Array im Feld <code>ergebnis</code>).</li></ol>",
     solution: "<b>a)</b>" + S(`CREATE OR ALTER PROCEDURE dbo.sp_bestellung_json
  @kdnr       INT,
  @positionen NVARCHAR(MAX),
  @bestnr     INT OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;
  DECLARE @pos TABLE (artnr INT NOT NULL, lagernr INT NOT NULL, menge INT NOT NULL,
                      PRIMARY KEY (artnr, lagernr));
  BEGIN TRY
    IF ISNULL(ISJSON(@positionen), 0) = 0
      THROW 50100, N'Ungültiges JSON', 1;

    IF EXISTS (SELECT 1
               FROM OPENJSON(@positionen)
                    WITH (artnr INT '$.artnr', lagernr INT '$.lagernr', menge INT '$.menge')
               WHERE artnr IS NULL OR lagernr IS NULL OR menge IS NULL OR menge <= 0)
      THROW 50040, N'Position unvollständig oder Menge <= 0', 1;

    -- doppelte Artikel/Lager-Kombinationen zusammenfassen
    INSERT INTO @pos (artnr, lagernr, menge)
    SELECT artnr, lagernr, SUM(menge)
    FROM OPENJSON(@positionen)
         WITH (artnr INT '$.artnr', lagernr INT '$.lagernr', menge INT '$.menge')
    GROUP BY artnr, lagernr;

    IF NOT EXISTS (SELECT 1 FROM @pos)
      THROW 50041, N'Keine Positionen übergeben', 1;

    BEGIN TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM dbo.kunde WHERE kdnr = @kdnr AND aktiv = 1)
      THROW 50001, N'Kunde unbekannt oder inaktiv', 1;

    IF EXISTS (SELECT 1 FROM @pos p
               LEFT JOIN dbo.artikel a ON a.artnr = p.artnr AND a.aktiv = 1
               WHERE a.artnr IS NULL)
      THROW 50042, N'Artikel unbekannt oder inaktiv', 1;

    IF EXISTS (SELECT 1 FROM @pos p
               LEFT JOIN dbo.lagerstand ls WITH (UPDLOCK, HOLDLOCK)
                      ON ls.artnr = p.artnr AND ls.lagernr = p.lagernr
               WHERE ls.menge IS NULL OR ls.menge < p.menge)
      THROW 50002, N'Lagerstand nicht ausreichend', 1;

    UPDATE ls
    SET menge = ls.menge - p.menge
    FROM dbo.lagerstand ls
    JOIN @pos p ON p.artnr = ls.artnr AND p.lagernr = ls.lagernr;

    INSERT INTO dbo.bestellung (kdnr) VALUES (@kdnr);
    SET @bestnr = SCOPE_IDENTITY();

    INSERT INTO dbo.bestellposition (bestnr, posnr, artnr, menge, preis, status)
    SELECT @bestnr,
           ROW_NUMBER() OVER (ORDER BY p.artnr, p.lagernr),
           p.artnr, p.menge, a.vk, 'zugeteilt'
    FROM @pos p
    JOIN dbo.artikel a ON a.artnr = p.artnr;

    COMMIT TRANSACTION;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0
      ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END;`) + "<b>b)</b> Zusätzliche Variablen im DECLARE des Wrappers: <code>@kdnr INT, @positionen NVARCHAR(MAX), @bestnr INT, @liste NVARCHAR(MAX)</code>. Zweige:" + S(`    ELSE IF @typ = N'bestellen'
    BEGIN
      SET @kdnr       = JSON_VALUE(@input, '$.parameter.kdnr');
      SET @positionen = JSON_QUERY(@input, '$.parameter.positionen');
      EXEC dbo.sp_bestellung_json @kdnr = @kdnr, @positionen = @positionen,
                                  @bestnr = @bestnr OUTPUT;
      SET @output = JSON_OBJECT('ok': CAST(1 AS BIT), 'fehlercode': NULL, 'fehler': NULL,
                                'ergebnis': JSON_OBJECT('bestnr': @bestnr));
    END
    ELSE IF @typ = N'bestellungen'
    BEGIN
      SET @kdnr  = JSON_VALUE(@input, '$.parameter.kdnr');
      SET @liste = (SELECT f.bestnr, f.datum, f.summe
                    FROM dbo.fn_bestellungen_kunde(@kdnr) AS f
                    ORDER BY f.datum DESC
                    FOR JSON PATH);
      SET @output = JSON_OBJECT('ok': CAST(1 AS BIT), 'fehlercode': NULL, 'fehler': NULL,
                                'ergebnis': JSON_QUERY(ISNULL(@liste, N'[]')));
    END`) + "<b>Begründungen:</b> JSON_QUERY für das Array (JSON_VALUE würde NULL liefern); <code>OPENJSON … WITH</code> + <code>INSERT … SELECT</code> statt Cursor; Gruppierung verhindert, dass doppelte Zeilen beim UPDATE … FROM nur einmal abgebucht werden; <code>UPDLOCK, HOLDLOCK</code> sperrt die geprüften Lagerzeilen bis zum Commit (keine parallele Überbuchung; der CHECK menge &gt;= 0 ist zusätzlich Sicherheitsnetz); <code>JSON_QUERY(ISNULL(@liste, N'[]'))</code> liefert bei 0 Bestellungen ein leeres Array statt NULL und bettet es als JSON (nicht als String) ein. Fehler landen im CATCH des Wrappers und werden zu <code>{\"ok\":false,\"fehlercode\":50002,…}</code>." },
   { id: "dbxr7", topic: "dba-inj", title: "Sicherheit: Injection-Lücke finden und Rechte setzen", pts: 10,
     html: "Gegeben:" + S(`CREATE OR ALTER PROCEDURE dbo.sp_kunde_suche @name NVARCHAR(100)
AS
BEGIN
  DECLARE @sql NVARCHAR(MAX) =
    N'SELECT kdnr, name, email FROM dbo.kunde WHERE name LIKE ''%' + @name + N'%''';
  EXEC (@sql);
END;`) + "<ol><li>Was liefert der Aufruf mit <code>@name = N'x'' OR 1=1;--'</code>?</li><li><code>app_role</code> hat nur EXECUTE auf die Prozedur. Warum bekommt app_user24nn trotzdem einen Berechtigungsfehler?</li><li>Schreibe die Prozedur sicher um (zwei Varianten).</li><li>Welche Rechte bekommt app_role im Projekt?</li></ol>",
     solution: "<ol><li>Es entsteht <code>… WHERE name LIKE '%x' OR 1=1;--%'</code>: Das Hochkomma beendet den String, <code>OR 1=1</code> ist immer wahr, <code>--</code> kommentiert den Rest aus → <b>alle Kunden</b> inkl. E-Mail werden geliefert. Es könnten auch weitere Anweisungen angehängt werden.</li><li><code>EXEC(@sql)</code> ist dynamisches SQL – es läuft in einem eigenen Batch, die <b>Besitzkette bricht</b>, und es werden die Rechte des Aufrufers auf dbo.kunde geprüft (SELECT fehlt → Fehler 229).</li><li>Variante 1 – statisches SQL (am besten):" + S(`CREATE OR ALTER PROCEDURE dbo.sp_kunde_suche @name NVARCHAR(100)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT kdnr, name, email
  FROM dbo.kunde
  WHERE aktiv = 1
    AND name LIKE N'%' + @name + N'%';
END;`) + "Variante 2 – falls dynamisch nötig, parametrisiert:" + S(`EXEC sys.sp_executesql
     N'SELECT kdnr, name, email FROM dbo.kunde WHERE name LIKE N''%'' + @n + N''%'';',
     N'@n NVARCHAR(100)',
     @n = @name;`) + "(hier bricht die Besitzkette weiterhin – daher für das Projekt Variante 1). Hinweis: % und _ in @name wirken weiter als LIKE-Platzhalter – das ist keine Injection, kann aber per ESCAPE behandelt werden.</li><li>" + S(`GRANT EXECUTE ON OBJECT::dbo.sp_backend_wrapper TO app_role;
-- keine SELECT/INSERT/UPDATE/DELETE-Rechte auf Tabellen vergeben;
-- Einzelprozeduren und Tabellen erreicht der Wrapper über die Besitzkette (alles dbo).`) + "Prinzip der minimalen Rechte: Die App kann nur die definierten Prozesse ausführen.</li></ol>" },
   { id: "dbxr8", topic: "dba-proc", title: "Code-Review-Simulation: Finde die Schwächen", pts: 16,
     html: "Ein Teamkollege hat folgenden Code geschrieben. Nenne zu jedem Teil das Problem, die Folge und eine bessere Lösung – so, wie du es im Review begründen würdest." + S(`-- (A)
CREATE OR ALTER PROCEDURE dbo.sp_preis_erhoehen @prozent DECIMAL(5,2) AS
BEGIN
  DECLARE @artnr INT, @vk DECIMAL(10,2);
  DECLARE c CURSOR FOR SELECT artnr, vk FROM dbo.artikel WHERE aktiv = 1;
  OPEN c;
  FETCH NEXT FROM c INTO @artnr, @vk;
  WHILE @@FETCH_STATUS = 0
  BEGIN
    UPDATE dbo.artikel SET vk = @vk * (1 + @prozent / 100) WHERE artnr = @artnr;
    FETCH NEXT FROM c INTO @artnr, @vk;
  END
  CLOSE c;
END;

-- (B)
CREATE OR ALTER TRIGGER dbo.trg_ls_min ON dbo.lagerstand AFTER UPDATE AS
BEGIN
  DECLARE @menge INT;
  SELECT @menge = menge FROM inserted;
  IF @menge < 0 ROLLBACK;
END;

-- (C) in einer Einzelprozedur
BEGIN TRY
  BEGIN TRAN;
  INSERT INTO dbo.bestellung (kdnr) VALUES (@kdnr);
  SET @bestnr = @@IDENTITY;
  INSERT INTO dbo.bestellposition (bestnr, posnr, artnr, menge, preis)
  VALUES (@bestnr, 1, @artnr, @menge, @preis);
  COMMIT;
END TRY
BEGIN CATCH
  ROLLBACK;
  SELECT ERROR_MESSAGE();
END CATCH

-- (D)
SELECT * FROM dbo.bestellung WHERE YEAR(datum) = 2026;`),
     solution: "<table class=\"dt\"><tr><th>Teil</th><th>Problem → Folge</th><th>Bessere Lösung</th></tr><tr><td>A</td><td>Cursor („Schleifitis“) für eine reine Mengenoperation → langsam, Trigger feuert n-mal; <code>DEALLOCATE</code> fehlt → Cursor-Ressource bleibt bestehen, zweiter Aufruf in derselben Session scheitert („Cursor existiert bereits“, da global). Keine Rundung auf 2 Stellen.</td><td><code>UPDATE dbo.artikel SET vk = ROUND(vk * (1 + @prozent / 100), 2) WHERE aktiv = 1;</code> – eine Anweisung, atomar; der Preislog-Trigger protokolliert alle Zeilen auf einmal.</td></tr><tr><td>B</td><td>(1) nicht mengenorientiert – prüft nur eine Zeile; (2) <b>wirkungslos</b>: CHECK ck_ls_menge (menge &gt;= 0) wird vor AFTER-Triggern geprüft, negative Mengen kommen nie im Trigger an; (3) kein THROW/Fehlercode.</td><td>Trigger löschen – deklarative Integrität (CHECK) reicht. Für einen eigenen Fehlercode: in der Prozedur bedingtes UPDATE + <code>@@ROWCOUNT</code> + <code>THROW 50002</code>.</td></tr><tr><td>C</td><td><code>@@IDENTITY</code> kann den Identitywert eines Triggers liefern; CATCH ohne <code>IF @@TRANCOUNT &gt; 0</code> → Fehler 3903, wenn ein Trigger schon zurückgerollt hat; Fehler wird <b>verschluckt</b> (nur SELECT) → Wrapper/App glauben an Erfolg; kein XACT_ABORT; Preis kommt vom Client statt aus dbo.artikel (manipulierbar).</td><td><code>SET XACT_ABORT ON</code>, <code>SCOPE_IDENTITY()</code>, Preis per <code>INSERT … SELECT … vk FROM dbo.artikel</code>, CATCH: <code>IF @@TRANCOUNT &gt; 0 ROLLBACK; THROW;</code></td></tr><tr><td>D</td><td><code>YEAR(datum)</code> ist nicht sargable → kein Index-Seek; <code>SELECT *</code> liefert unnötige Spalten und bricht bei Schemaänderungen die JSON-Struktur.</td><td><code>SELECT bestnr, kdnr, datum FROM dbo.bestellung WHERE datum &gt;= '2026-01-01' AND datum &lt; '2027-01-01';</code></td></tr></table>Im Review zählt, Problem <b>und</b> Folge <b>und</b> Alternative mit Vorteil zu nennen." }
  ]
};
})();
