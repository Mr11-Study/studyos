/* DB-AENT · Plus: Roundtrip-Rechner, Schritt-Animationen (Abfragereihenfolge, JOINs, TRY/CATCH, Sperren, Trigger, SQL-Injection),
   durchgerechnete Beispiele je Lektion und zusätzliche Übungsfragen (Einbau über STUDYOS_EXT, siehe courses/ext-apply.js) */
(function () {
const C = window.STUDYOS_CALC = window.STUDYOS_CALC || {};
const FIG = window.STUDYOS_FIG = window.STUDYOS_FIG || {};
const FX = window.FX;
const { svg, g, t, tl, r, box, l, lock } = FX;
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const S = s => "<pre><code>" + esc(s) + "</code></pre>";
const ind = s => esc(s).replace(/^ +/, m => "\u00a0".repeat(m.length));
const ms = n => n.toLocaleString("de-AT", { maximumFractionDigits: 1 }) + " ms";

/* ===================== Rechner ===================== */
C["dbaent-roundtrip"] = {
  title: "Roundtrip-Rechner: Logik am Client oder am Server",
  intro: "Ein Ablauf braucht <i>n</i> SQL-Anweisungen. Liegt die Logik am Client, kostet jede Anweisung einen Netzwerk-Roundtrip (RTT). Als Stored Procedure gibt es nur einen Aufruf. Probier ein schnelles LAN (1 ms) und ein Handy im Mobilnetz (40 ms).",
  inputs: [
    { k: "n", label: "SQL-Anweisungen im Ablauf", v: 6, min: 1, max: 40, step: 1, unit: "Stk" },
    { k: "rtt", label: "Netzwerk-Roundtrip (RTT)", v: 25, min: 0.5, max: 150, step: 0.5, unit: "ms" },
    { k: "ex", label: "Ausführungszeit je Anweisung am Server", v: 3, min: 0.1, max: 50, step: 0.1, unit: "ms" },
    { k: "h", label: "Abläufe pro Stunde", v: 2000, min: 1, max: 50000, step: 100, unit: "/h" }
  ],
  out: v => { const cl = v.n * (v.rtt + v.ex), sv = v.rtt + v.n * v.ex, sav = cl - sv;
    return [["Dauer mit Logik am Client", ms(cl)], ["Dauer mit Stored Procedure", ms(sv), "", true], ["Ersparnis je Ablauf", ms(sav)], ["Faktor", sv > 0 ? (cl / sv).toLocaleString("de-AT", { maximumFractionDigits: 1 }) + " ×" : "–"], ["Gesparte Wartezeit pro Stunde", (sav * v.h / 1000 / 60).toLocaleString("de-AT", { maximumFractionDigits: 1 }), "min"]]; },
  steps: v => { const cl = v.n * (v.rtt + v.ex), sv = v.rtt + v.n * v.ex;
    return `Client-Logik: t = n · (RTT + t<sub>exec</sub>) = ${v.n} · (${v.rtt} + ${v.ex}) ms = <b>${ms(cl)}</b><br>
    Server-Logik: t = RTT + n · t<sub>exec</sub> = ${v.rtt} + ${v.n} · ${v.ex} ms = <b>${ms(sv)}</b><br>
    Ersparnis = (n − 1) · RTT = ${v.n - 1} · ${v.rtt} ms = <b>${ms(cl - sv)}</b> je Ablauf<br>
    Pro Stunde: ${ms(cl - sv)} · ${v.h} = ${((cl - sv) * v.h / 1000).toLocaleString("de-AT", { maximumFractionDigits: 0 })} s ≈ <b>${((cl - sv) * v.h / 60000).toLocaleString("de-AT", { maximumFractionDigits: 1 })} min</b> weniger Wartezeit (summiert über alle Benutzer)<br>
    <small>Vereinfachtes Modell: ohne Übertragungsdauer großer Ergebnismengen und ohne Parsen am Client. Die Ersparnis wächst mit der Latenz – im Mobilnetz besonders stark.</small>`; },
  plot: { x: v => [1, Math.max(10, v.n * 2)], xl: "Anzahl Anweisungen n", yl: "ms je Ablauf",
    fns: [{ label: "Logik am Client", f: (x, v) => x * (v.rtt + v.ex) }, { label: "Stored Procedure", f: (x, v) => v.rtt + x * v.ex }],
    points: v => [{ x: v.n, y: v.n * (v.rtt + v.ex), label: "Client" }, { x: v.n, y: v.rtt + v.n * v.ex, label: "Server" }] }
};

/* ===================== Animationen ===================== */
/* kleine Tabelle: cols = [[Überschrift, xRel]], rows = [[zellen…], klasse?] */
const tbl = (x, y, w, title, cols, rows, o = {}) => g(o,
  t(x + 4, y - 6, title, { a: "start", fs: 11.5, fw: 700 }) +
  r(x, y, w, 22, { rx: 4, cls: "fx-soft" }) + cols.map(([h, cx]) => t(x + cx, y + 15, h, { a: "start", fs: 11, fw: 700 })).join("") +
  rows.map(([cells, cls], i) => r(x, y + 24 + i * 24, w, 22, { rx: 4, cls: cls || "fx-card" }) + cells.map((c, j) => t(x + cols[j][1], y + 39 + i * 24, c, { a: "start", fs: 11.5 })).join("")).join(""));

FIG["dbaent-qorder"] = { title: "Logische Reihenfolge einer SELECT-Abfrage",
  svg: () => { const W = 94, X = i => 14 + i * 104;
    const written = ["SELECT …", "FROM … JOIN", "WHERE …", "GROUP BY …", "HAVING …", "ORDER BY …"], ord = [5, 1, 2, 3, 4, 6];
    const exec = ["FROM / JOIN", "WHERE", "GROUP BY", "HAVING", "SELECT", "ORDER BY"];
    const data = [["240 Zeilen", "verknüpft"], ["180 Zeilen", "nur 2026"], ["35 Gruppen", "je Kunde"], ["6 Gruppen", "Umsatz &gt; 500"], ["6 Zeilen", "3 Spalten"], ["6 Zeilen", "sortiert"]];
    return svg(640, 300,
      t(14, 16, "So schreibst du die Abfrage:", { a: "start", fs: 12, cls: "fx-sub" }) +
      written.map((w, i) => box(X(i), 32, W, 30, w, { fs: 11.5, cls: "fx-card" }) + g({ st: 1 }, FX.c(X(i) + W - 2, 30, 9, { cls: "fx-acc" }) + t(X(i) + W - 2, 34, String(ord[i]), { fs: 11, fw: 700, cls: "fx-onacc" }))).join("") +
      g({ st: 1 }, t(14, 104, "So arbeitet der Server sie ab:", { a: "start", fs: 12, cls: "fx-sub" })) +
      exec.map((e, i) => g({ st: 1 }, box(X(i), 114, W, 40, (i + 1) + " · " + e, { fs: 11.5, cls: "fx-soft", hl: i + 1 }) + (i < 5 ? l(X(i) + W + 1, 134, X(i + 1) - 1, 134, { arrow: true }) : ""))).join("") +
      data.map((d, i) => g({ st: i + 1 }, box(X(i), 170, W, 44, d.join("|"), { fs: 11, lh: 15, cls: i === 3 ? "fx-ok" : "fx-card" }))).join("") +
      g({ st: 7 }, r(14, 236, 612, 48, { cls: "fx-warn" }) + tl(320, 262, "Ein Spaltenalias aus SELECT (Schritt 5) existiert in WHERE und HAVING noch nicht –|in ORDER BY (Schritt 6) darf er verwendet werden.", { fs: 12, lh: 16 })));
  },
  steps: [
    "Geschrieben wird eine Abfrage in der Reihenfolge SELECT – FROM – WHERE – GROUP BY – HAVING – ORDER BY. Beispiel: Umsatz je Kunde 2026, nur Kunden über 500 €.",
    "Der Server beginnt aber mit <b>FROM/JOIN</b>: Kunde, Bestellung und Bestellposition werden verknüpft – hier 240 Zeilen (eine je Position). Die Kreise oben zeigen die Ausführungsreihenfolge.",
    "<b>WHERE</b> filtert einzelne Zeilen, bevor gruppiert wird: nur Bestellungen aus 2026 bleiben (180 Zeilen). Aggregatfunktionen wie SUM sind hier noch nicht erlaubt.",
    "<b>GROUP BY</b> fasst die Zeilen je Kunde zusammen: 35 Gruppen. Ab jetzt gibt es pro Gruppe genau eine Ergebniszeile.",
    "<b>HAVING</b> filtert Gruppen nach dem Aggregat: SUM(menge · preis) &gt; 500 lässt 6 Kunden übrig.",
    "Erst jetzt wird <b>SELECT</b> ausgewertet: Spalten, Ausdrücke und Aliase wie <code>AS umsatz</code> entstehen.",
    "<b>ORDER BY</b> sortiert zuletzt das fertige Ergebnis, z. B. <code>ORDER BY umsatz DESC</code>.",
    "Daraus folgt die klassische Prüfungsfalle: Den Alias <code>umsatz</code> kannst du in ORDER BY verwenden, in WHERE oder HAVING nicht – dort musst du den Ausdruck wiederholen."
  ] };

FIG["dbaent-joins"] = { title: "INNER JOIN, LEFT JOIN und Anti-Join an drei Kunden",
  svg: () => { const K = [["1", "Anna"], ["2", "Ben"], ["3", "Cem"]], B = [["10", "1"], ["11", "1"], ["12", "2"]];
    const res = (title, sql, cols, rows, on) => g({ on }, t(372, 26, title, { a: "start", fs: 12.5, fw: 700 }) + t(372, 44, sql, { a: "start", fs: 11, cls: "fx-sub" }) + tbl(372, 62, 254, "", cols, rows));
    return svg(640, 300,
      tbl(16, 62, 150, "dbo.kunde", [["kdnr", 10], ["name", 62]], K.map(k => [k, "fx-card"])) +
      tbl(196, 62, 150, "dbo.bestellung", [["bestnr", 10], ["kdnr", 80]], B.map(b => [b])) +
      g({ on: "1,2" }, l(166, 97, 196, 97, { cls: "acc", flow: true }) + l(166, 97, 196, 121, { cls: "acc", flow: true }) + l(166, 121, 196, 145, { cls: "acc", flow: true })) +
      g({ on: "0" }, tl(490, 120, "Cem (kdnr 3) hat|noch nie bestellt.", { fs: 12.5, lh: 18, cls: "fx-sub" })) +
      res("INNER JOIN", "nur Kunden mit passender Bestellung", [["name", 10], ["bestnr", 130]], [[["Anna", "10"]], [["Anna", "11"]], [["Ben", "12"]]], "1") +
      res("LEFT JOIN", "alle Kunden, fehlende Seite = NULL", [["name", 10], ["bestnr", 130]], [[["Anna", "10"]], [["Anna", "11"]], [["Ben", "12"]], [["Cem", "NULL"], "fx-warn"]], "2") +
      res("Anti-Join", "LEFT JOIN … WHERE b.bestnr IS NULL", [["name", 10], ["bestnr", 130]], [[["Cem", "NULL"], "fx-ok"]], "3") +
      res("Zählen je Kunde", "LEFT JOIN + GROUP BY k.name", [["name", 10], ["COUNT(b.bestnr)", 70], ["COUNT(*)", 186]], [[["Anna", "2", "2"]], [["Ben", "1", "1"]], [["Cem", "0", "1"], "fx-warn"]], "4") +
      g({ on: "3" }, r(372, 120, 254, 70, { cls: "fx-soft" }) + tl(499, 156, "gleichwertig und NULL-sicher:|WHERE NOT EXISTS (SELECT 1 FROM|dbo.bestellung b WHERE b.kdnr = k.kdnr)", { fs: 11, lh: 16 })) +
      g({ on: "4" }, tl(499, 206, "COUNT(*) zählt die NULL-Zeile mit,|COUNT(spalte) ignoriert NULL.", { fs: 11.5, lh: 16, cls: "fx-sub" })) +
      g({ st: 1 }, r(16, 236, 610, 46, { cls: "fx-card" }) +
        g({ on: "1" }, tl(321, 260, "Cem fällt beim INNER JOIN weg – es gibt keine Bestellung mit kdnr 3.", { fs: 12 })) +
        g({ on: "2" }, tl(321, 260, "LEFT JOIN behält jede Zeile der linken Tabelle; Cem bekommt NULL als bestnr.", { fs: 12 })) +
        g({ on: "3" }, tl(321, 260, "Gesucht „Kunden ohne Bestellung“: genau die NULL-Zeilen des LEFT JOIN.", { fs: 12 })) +
        g({ on: "4" }, tl(321, 260, "Für „Anzahl Bestellungen inkl. 0“: COUNT(b.bestnr), nicht COUNT(*).", { fs: 12 }))));
  },
  steps: [
    "Ausgangslage: drei Kunden und drei Bestellungen. Die Verbindung läuft über <code>kdnr</code>.",
    "<b>INNER JOIN</b> liefert nur Paare, bei denen die ON-Bedingung zutrifft. Anna erscheint zweimal (zwei Bestellungen), Cem gar nicht.",
    "<b>LEFT JOIN</b> behält alle Zeilen der linken Tabelle (kunde). Wo keine Bestellung passt, sind die Spalten der rechten Seite NULL.",
    "<b>Anti-Join</b>: Mit <code>WHERE b.bestnr IS NULL</code> bleiben genau die Kunden ohne Bestellung. <code>NOT EXISTS</code> liefert dasselbe und ist – anders als <code>NOT IN</code> – NULL-sicher.",
    "Beim Zählen nach einem LEFT JOIN entscheidet die Spalte: <code>COUNT(b.bestnr)</code> ergibt für Cem 0, <code>COUNT(*)</code> zählt die NULL-Zeile mit und ergibt 1."
  ] };

const TC = ["BEGIN TRY", "  BEGIN TRAN;", "  UPDATE dbo.lagerstand SET menge -= 2 WHERE artnr = 1089;", "  INSERT dbo.bestellposition (…) VALUES (… artnr 9999 …);", "  COMMIT;", "END TRY", "BEGIN CATCH", "  IF @@TRANCOUNT > 0 ROLLBACK;", "  THROW;", "END CATCH"];
FIG["dbaent-trycatch"] = { title: "TRY/CATCH mit Transaktion: was bei einem Fehler passiert",
  svg: () => { const hl = { 1: 1, 2: 2, 3: 3, 7: 4, 8: 5 };
    return svg(640, 300,
      TC.map((s, i) => g({ hl: hl[i] != null ? String(hl[i]) : (i === 0 ? "0" : undefined) }, r(14, 12 + i * 27, 372, 23, { rx: 4, cls: i === 3 ? "fx-card" : "fx-card" }) + t(24, 28 + i * 27, ind(s), { a: "start", fs: 11 }))).join("") +
      g({ on: "3,4,5" }, r(14, 93, 372, 23, { rx: 4, cls: "fx-bad" }) + t(24, 109, esc(TC[3]), { a: "start", fs: 11 }) + r(14, 120, 372, 23, { rx: 4, cls: "fx-ghost" }) + t(24, 136, "  COMMIT;   ← wird übersprungen", { a: "start", fs: 11, cls: "fx-sub" })) +
      g({ on: "3" }, FX.p("M386 104 C424 104 424 186 386 186", { cls: "acc", arrow: true, acc: true })) +
      r(412, 12, 214, 72, { cls: "fx-soft" }) + t(519, 34, "@@TRANCOUNT", { fs: 12, fw: 700 }) +
      [["0", "0"], ["1", "1,2,3"], ["0", "4,5"]].map(([n, on]) => t(519, 70, n, { fs: 28, fw: 700, on })).join("") +
      r(412, 96, 214, 72, { cls: "fx-soft" }) + t(519, 116, "lagerstand 1089 (menge)", { fs: 11.5, fw: 700 }) +
      [["10", "0,1", ""], ["8 (vorläufig)", "2,3", "fx-sub"], ["10", "4,5", ""]].map(([n, on, cls]) => t(519, 152, n, { fs: n.length > 3 ? 18 : 26, fw: 700, on, cls })).join("") +
      r(412, 182, 214, 104, { cls: "fx-card" }) +
      g({ on: "0" }, tl(519, 234, "Ausgangslage:|10 Stück lagernd,|keine Transaktion offen.", { fs: 11.5, lh: 16 })) +
      g({ on: "1" }, tl(519, 234, "Ab hier gehört jede|Änderung zur Transaktion|(alles oder nichts).", { fs: 11.5, lh: 16 })) +
      g({ on: "2" }, tl(519, 234, "Änderung ist gesperrt|und noch nicht|festgeschrieben.", { fs: 11.5, lh: 16 })) +
      g({ on: "3" }, tl(519, 234, "Fehler 547:|FOREIGN KEY verletzt|(Artikel 9999 fehlt).", { fs: 11.5, lh: 16, cls: "" })) +
      g({ on: "4" }, tl(519, 234, "ROLLBACK macht auch|das erfolgreiche UPDATE|rückgängig.", { fs: 11.5, lh: 16 })) +
      g({ on: "5" }, tl(519, 234, "THROW; gibt den Original-|fehler an den Aufrufer|(Wrapper/App) weiter.", { fs: 11.5, lh: 16 })));
  },
  steps: [
    "Eine Bestellung soll 2 Stück von Artikel 1089 abbuchen und eine Position anlegen. Vorher: menge = 10, keine offene Transaktion.",
    "<code>BEGIN TRAN</code> erhöht <code>@@TRANCOUNT</code> auf 1. Ab jetzt gilt: alles oder nichts (Atomicity).",
    "Das UPDATE gelingt: menge ist jetzt 8 – aber nur vorläufig. Die Zeile ist exklusiv gesperrt, andere Sitzungen sehen (bei READ COMMITTED) den alten Wert erst nach dem Ende der Transaktion.",
    "Das INSERT verletzt den Fremdschlüssel (Artikel 9999 existiert nicht, Fehler 547). Die Ausführung springt sofort in den CATCH-Block – das COMMIT wird nie erreicht.",
    "<code>IF @@TRANCOUNT &gt; 0 ROLLBACK;</code> rollt die ganze Transaktion zurück, also auch das erfolgreiche UPDATE: menge ist wieder 10, @@TRANCOUNT 0. Die Prüfung verhindert einen Folgefehler, falls keine Transaktion mehr offen ist.",
    "<code>THROW;</code> ohne Argumente wirft den Originalfehler weiter. Ohne THROW würde der Aufrufer glauben, alles hätte geklappt."
  ] };

FIG["dbaent-locks"] = { title: "Das letzte Stück: Lost Update und die atomare Lösung",
  svg: () => { const A = 14, B = 426, Wd = 200;
    const act = (x, y, s, on, cls) => g({ on }, box(x, y, Wd, 40, s, { fs: 11, lh: 14, cls: cls || "fx-card" }));
    return svg(640, 300,
      box(A, 12, Wd, 30, "Sitzung A (App von Lisa)", { fs: 12, cls: "fx-soft" }) + box(B, 12, Wd, 30, "Sitzung B (App von Max)", { fs: 12, cls: "fx-soft" }) +
      r(250, 70, 140, 88, { cls: "fx-card" }) + FX.db(320, 100) + t(320, 134, "lagerstand 1089", { fs: 11, fw: 700 }) +
      [["menge = 1", "0,1"], ["menge = 0", "2"], ["menge = 1", "3"], ["menge = 0", "4"]].map(([s, on]) => t(320, 151, s, { fs: 12, fw: 700, on })).join("") +
      act(A, 62, "SELECT @m = menge|→ @m = 1", "1,2") + act(B, 62, "SELECT @m = menge|→ @m = 1", "1,2") +
      act(A, 114, "UPDATE … SET menge = @m − 1|COMMIT → verkauft", "2", "fx-bad") + act(B, 114, "UPDATE … SET menge = @m − 1|COMMIT → verkauft", "2", "fx-bad") +
      g({ on: "2" }, l(214, 134, 250, 134, { arrow: true }) + l(426, 134, 390, 134, { arrow: true }) + r(20, 232, 600, 50, { cls: "fx-bad" }) + tl(320, 258, "Zwei Verkäufe, aber nur ein Stück: B überschreibt A mit einem veralteten Wert (Lost Update).", { fs: 12 })) +
      act(A, 62, "UPDATE … menge = menge − 1|WHERE … AND menge &gt;= 1", "3,4", "fx-ok") +
      act(B, 62, "dieselbe Anweisung", "3") + g({ on: "3" }, box(B, 114, Wd, 40, "wartet auf die Sperre …", { fs: 11.5, cls: "fx-warn" }) + lock(320, 186, { cls: "" }) + t(320, 214, "X-Sperre von A", { fs: 11, cls: "fx-sub" }) + l(214, 82, 250, 100, { arrow: true })) +
      act(A, 114, "@@ROWCOUNT = 1|COMMIT → verkauft", "4", "fx-ok") +
      act(B, 62, "dieselbe Anweisung prüft|jetzt menge = 0 >= 1 → falsch".replace(">", "&gt;"), "4") + act(B, 114, "@@ROWCOUNT = 0|→ THROW 50001 „ausverkauft“", "4", "fx-warn") +
      g({ on: "4" }, r(20, 232, 600, 50, { cls: "fx-ok" }) + tl(320, 258, "Prüfen und Abbuchen in einer Anweisung: Die Sperre serialisiert die Zugriffe, niemand verkauft doppelt.", { fs: 12 })) +
      g({ on: "0" }, r(20, 232, 600, 50, { cls: "fx-card" }) + tl(320, 258, "Beide tippen gleichzeitig auf „Kaufen“. Was steht am Ende in der Datenbank?", { fs: 12 })) +
      g({ on: "1" }, r(20, 232, 600, 50, { cls: "fx-card" }) + tl(320, 258, "Beide lesen den Wert in eine Variable – und beide sehen noch 1 Stück.", { fs: 12 })) +
      g({ on: "3" }, r(20, 232, 600, 50, { cls: "fx-card" }) + tl(320, 258, "Lösung: Bedingung und Änderung in einem UPDATE. A sperrt die Zeile exklusiv, B muss warten.", { fs: 12 })));
  },
  steps: [
    "Artikel 1089 hat nur noch <b>1 Stück</b>. Lisa und Max tippen fast gleichzeitig auf „Kaufen“. Beide Apps rufen dieselbe Prozedur auf.",
    "Naive Umsetzung: Die Prozedur liest zuerst <code>SELECT @m = menge</code>. Beide Sitzungen lesen 1 – noch hält niemand eine Sperre, die das verhindern würde.",
    "Beide schreiben <code>menge = @m − 1</code> = 0 und bestätigen den Kauf. Ergebnis: zwei Verkäufe, ein Stück. Das ist ein <b>Lost Update</b> – ein Isolationsproblem (das I in ACID).",
    "Besser: Prüfung und Änderung in <b>einer</b> Anweisung: <code>UPDATE … SET menge = menge − 1 WHERE artnr = 1089 AND menge &gt;= 1</code>. A bekommt eine exklusive Sperre (X-Lock) auf die Zeile, B wartet.",
    "Nach A's COMMIT wird B fortgesetzt und prüft die Bedingung mit dem aktuellen Wert 0: keine Zeile betroffen, <code>@@ROWCOUNT = 0</code>. Die Prozedur meldet „ausverkauft“ – sauber und ohne Überverkauf."
  ] };

FIG["dbaent-trigger"] = { title: "Ein UPDATE, drei Zeilen, ein AFTER-Trigger",
  svg: () => { const rowsD = [["1089", "10.00"], ["1244", "25.50"], ["1302", "4.90"]], rowsI = [["1089", "11.00"], ["1244", "28.05"], ["1302", "5.39"]];
    return svg(640, 300,
      box(14, 10, 612, 30, "UPDATE dbo.artikel SET vk = vk * 1.10 WHERE warengruppe = 3;   →  3 Zeilen", { fs: 12, cls: "fx-soft", hl: "0" }) +
      [["1 · INSTEAD OF", "hier keiner"], ["2 · Constraints", "CHECK vk &gt;= 0 ✓"], ["3 · Änderung", "in dbo.artikel"], ["4 · AFTER-Trigger", "1× für alle 3 Zeilen"]].map(([a, b], i) =>
        g({ st: 1 }, box(14 + i * 156, 56, 144, 44, a + "|" + b, { fs: 11.5, lh: 15, cls: i === 3 ? "fx-soft" : "fx-card", hl: i === 1 ? "1" : i === 2 ? "2" : i === 3 ? "3" : undefined }) + (i < 3 ? l(158 + i * 156, 78, 170 + i * 156, 78, { arrow: true }) : ""))).join("") +
      g({ st: 2 }, tbl(14, 136, 280, "deleted (alte Werte)", [["artnr", 12], ["vk", 120]], rowsD.map(x => [x])) + tbl(346, 136, 280, "inserted (neue Werte)", [["artnr", 12], ["vk", 120]], rowsI.map(x => [x, "fx-ok"]))) +
      g({ on: "3" }, r(14, 252, 612, 40, { cls: "fx-card" }) + t(320, 276, "INSERT dbo.preis_log … SELECT … FROM inserted i JOIN deleted d ON d.artnr = i.artnr", { fs: 11.5 })) +
      g({ on: "4" }, r(14, 252, 612, 40, { cls: "fx-bad" }) + t(320, 276, "ROLLBACK im Trigger → das gesamte UPDATE (alle 3 Zeilen) wird zurückgerollt", { fs: 12 })));
  },
  steps: [
    "Ein einziges UPDATE erhöht die Preise der Warengruppe 3 um 10 % und betrifft 3 Zeilen.",
    "SQL Server prüft in fester Reihenfolge: zuerst INSTEAD-OF-Trigger (gibt es hier keinen), dann die <b>Constraints</b>. Würde ein CHECK verletzt, käme der AFTER-Trigger gar nicht zum Zug.",
    "Die Zeilen werden geändert. In den internen Tabellen stehen alle betroffenen Zeilen: <b>deleted</b> mit den Werten <i>vor</i>, <b>inserted</b> mit den Werten <i>nach</i> der Änderung.",
    "Der AFTER-Trigger feuert <b>einmal pro Anweisung</b>, nicht pro Zeile. Darum arbeitet er mengenorientiert mit einem JOIN von inserted und deleted – nie mit <code>SELECT @x = … FROM inserted</code>.",
    "Der Trigger läuft in derselben Transaktion wie das UPDATE. Ein ROLLBACK (oder THROW ohne Behandlung) im Trigger macht die gesamte Anweisung rückgängig."
  ] };

FIG["dbaent-inj"] = { title: "SQL-Injection: wie aus einer Eingabe Code wird",
  svg: () => svg(640, 300,
    t(14, 26, "Login-Formular", { a: "start", fs: 12, fw: 700 }) +
    t(14, 52, "Benutzer:", { a: "start", fs: 11.5 }) + box(84, 36, 200, 24, "hihi' OR 1 = 1;--", { fs: 12, cls: "fx-warn", rx: 4 }) +
    t(310, 52, "Kennwort:", { a: "start", fs: 11.5 }) + box(378, 36, 120, 24, "egal", { fs: 12, cls: "fx-card", rx: 4 }) +
    g({ st: 1 }, t(14, 92, "Code in der Anwendung (String-Verkettung):", { a: "start", fs: 11.5, cls: "fx-sub" }) +
      box(14, 100, 612, 28, "sql = \"SELECT * FROM dbo.kunde WHERE name = '\" + name + \"' AND pw = '\" + pw + \"'\"", { fs: 11.5, cls: "fx-card", rx: 4 })) +
    g({ on: "2,3,4" }, t(14, 152, "Diesen Text bekommt der Server:", { a: "start", fs: 11.5, cls: "fx-sub" }) +
      box(14, 160, 200, 28, "… WHERE name = 'hihi'", { fs: 11.5, cls: "fx-card", rx: 4 }) + box(222, 160, 110, 28, "OR 1 = 1;", { fs: 11.5, cls: "fx-bad", rx: 4, hl: "2" }) +
      box(340, 160, 286, 28, "-- ' AND pw = 'egal'", { fs: 11.5, cls: "fx-ghost", rx: 4, hl: "3" })) +
    g({ on: "3,4" }, t(483, 206, "Kommentar: Kennwortprüfung ist weg", { fs: 11, cls: "fx-sub" })) +
    g({ on: "4" }, r(14, 222, 612, 60, { cls: "fx-bad" }) + tl(320, 252, "1 = 1 ist für jede Zeile wahr → alle Kunden werden geliefert.|Die App meldet „Login ok“ für den ersten Datensatz.", { fs: 12, lh: 17 })) +
    g({ on: "5" }, t(14, 152, "Richtig: Parameter statt Verkettung", { a: "start", fs: 11.5, cls: "fx-sub" }) +
      box(14, 160, 612, 28, "SELECT * FROM dbo.kunde WHERE name = @name AND pw_hash = @hash", { fs: 11.5, cls: "fx-ok", rx: 4 }) +
      box(14, 196, 612, 28, "@name = N'hihi'' OR 1 = 1;--'   (ein einziger Textwert, nie Code)", { fs: 11.5, cls: "fx-card", rx: 4 }) +
      r(14, 236, 612, 46, { cls: "fx-ok" }) + t(320, 264, "Kein Kunde heißt so → 0 Zeilen → Login abgelehnt.", { fs: 12 }))),
  steps: [
    "Ein Angreifer tippt ins Benutzerfeld: <code>hihi' OR 1 = 1;--</code>. Das Kennwort ist ihm egal.",
    "Die Anwendung baut die SQL-Anweisung per <b>String-Verkettung</b> zusammen. Für den Compiler ist das nur Text – was in <code>name</code> steht, landet ungeprüft im SQL.",
    "Das Hochkomma in der Eingabe <b>schließt</b> das String-Literal. Danach folgt echter SQL-Code: <code>OR 1 = 1</code>.",
    "<code>--</code> macht den Rest der Zeile zum Kommentar. Die Kennwortprüfung wird nicht mehr ausgeführt.",
    "Die Bedingung ist für jede Zeile wahr. Die Anwendung findet „einen“ Benutzer und lässt den Angreifer hinein.",
    "Mit <b>Parametern</b> (Client-Bibliothek, Stored Procedure, <code>sp_executesql</code>) wird die Eingabe getrennt vom SQL-Text übertragen. Sie bleibt ein Wert, egal welche Zeichen sie enthält."
  ] };

/* ===================== Beispiele je Lektion ===================== */
const ex = (title, html, label) => ({ t: "example", label: label || "Beispiel aus der Praxis", title, html });
const BLOCKS = {
  "dba1-1": [ex("Ein Preisabruf mit ADO.NET – Zeile für Zeile", `So sieht der Datenzugriff aus, wenn ein C#-Frontend direkt über die Schnittstelle ADO.NET mit dem SQL Server spricht (2-Tier):` + S(`using var con = new SqlConnection(
    "Server=sql01;Database=webshop;Integrated Security=true");   // 1 Verbindung
con.Open();
using var cmd = new SqlCommand(
    "SELECT vk FROM dbo.artikel WHERE artnr = @artnr", con);     // 2 SQL-Text
cmd.Parameters.Add("@artnr", SqlDbType.Int).Value = 1089;         // 3 Parameter
decimal vk = (decimal)cmd.ExecuteScalar();                        // 4 Ausführen
Console.WriteLine($"Preis: {vk:0.00} €");                         // 5 Ergebnis`) +
  `<ol><li><b>Connection String</b>: Server, Datenbank, Anmeldung. Die Sitzung legt fest, mit welchen Rechten gearbeitet wird.</li><li>Der SQL-Text wird als String übergeben – der C#-Compiler prüft ihn <b>nicht</b>.</li><li>Der Wert reist getrennt als typisierter Parameter.</li><li>Am Server: parsen, Rechte prüfen, Plan erstellen, ausführen.</li><li>Zurück kommt ein Wert (hier 13,89 €).</li></ol>Im Praxisprojekt ist es <b>n-Tier</b>: Die Kotlin-App spricht mit der API, die API ruft <code>dbo.sp_backend_wrapper</code> auf. Die Schritte 1–5 passieren dann in der API, nicht in der App.`)],
  "dba1-2": [ex("Dieselbe Abfrage dreimal: String, Parameter, ORM", `Aufgabe: alle aktiven Artikel bis zu einem Höchstpreis, den der Benutzer eingibt (<code>eingabe = "20"</code>).` + S(`// (1) String-Verkettung – Fehler erst zur Laufzeit, Injection möglich
var sql = "SELECT artnr, bezeichnung FROM dbo.artikel WHERE aktiv = 1 AND vk <= " + eingabe;

// (2) Parameter – Wert getrennt vom SQL-Text, mit Datentyp
var sql = "SELECT artnr, bezeichnung FROM dbo.artikel WHERE aktiv = 1 AND vk <= @max";
cmd.Parameters.Add("@max", SqlDbType.Decimal).Value = decimal.Parse(eingabe);

// (3) ORM mit LINQ – vom Compiler geprüft, SQL wird erzeugt
var liste = db.Artikel.Where(a => a.Aktiv && a.Vk <= max)
                      .Select(a => new { a.Artnr, a.Bezeichnung }).ToList();`) +
  `<table class="dt"><tr><th>Eingabe</th><th>(1) String</th><th>(2) Parameter</th><th>(3) ORM</th></tr><tr><td><code>20</code></td><td>funktioniert</td><td>funktioniert</td><td>funktioniert</td></tr><tr><td><code>20,5</code></td><td>Syntaxfehler zur Laufzeit (Komma)</td><td>wird als Dezimalzahl übergeben</td><td>wird als Dezimalzahl übergeben</td></tr><tr><td><code>20 OR 1=1</code></td><td>liefert <b>alle</b> Artikel (Injection)</td><td>Parse-Fehler im Client, kein SQL</td><td>Parse-Fehler im Client, kein SQL</td></tr></table>Merke: Variante 1 ist nicht nur unsicher, sondern auch fehleranfällig bei Formaten (Komma vs. Punkt, Datum).`)],
  "dba1-3": [{ t: "calc", id: "dbaent-roundtrip" }, ex("Checkout im Mobilnetz: 6 Anweisungen, 1 oder 6 Roundtrips?", `Ein Checkout braucht 6 SQL-Anweisungen (Kunde prüfen, Lagerstand lesen, abbuchen, Bestellung anlegen, 2 Positionen). Roundtrip im Mobilnetz: <b>25 ms</b>, Ausführung am Server je Anweisung: <b>3 ms</b>.<ul><li>Logik am Client: 6 · (25 + 3) = <b>168 ms</b></li><li>Stored Procedure: 25 + 6 · 3 = <b>43 ms</b></li><li>Ersparnis: (6 − 1) · 25 = <b>125 ms</b> je Checkout, Faktor ≈ 3,9</li></ul>Bei 2.000 Checkouts pro Stunde sind das 2.000 · 0,125 s = 250 s ≈ <b>4,2 Minuten</b> Wartezeit weniger. Dazu kommt: Die Transaktion ist am Server nur ~18 ms offen statt ~168 ms – Sperren werden kürzer gehalten. Im LAN (RTT 1 ms) wäre der Unterschied mit 24 ms vs. 19 ms dagegen klein.`, "Beispiel durchgerechnet")],
  "dba2-1": [{ t: "fig", id: "dbaent-qorder" }, { t: "fig", id: "dbaent-joins" }, ex("Bestseller je Lager mit ROW_NUMBER", `Gesucht: pro Lager der Artikel mit der höchsten Menge. Eine Fensterfunktion nummeriert je Lager, ohne Zeilen zu reduzieren; der äußere Filter behält Platz 1.` + S(`WITH rang AS (
  SELECT l.ort, a.bezeichnung, ls.menge,
         ROW_NUMBER() OVER (PARTITION BY ls.lagernr ORDER BY ls.menge DESC) AS rn
  FROM dbo.lagerstand ls
  JOIN dbo.lager   l ON l.lagernr = ls.lagernr
  JOIN dbo.artikel a ON a.artnr   = ls.artnr
)
SELECT ort, bezeichnung, menge
FROM rang
WHERE rn = 1;`) + `<table class="dt"><tr><th>ort</th><th>bezeichnung</th><th>menge</th><th>rn</th></tr><tr><td>Graz</td><td>USB-Kabel</td><td>120</td><td><b>1</b></td></tr><tr><td>Graz</td><td>Kopfhörer</td><td>45</td><td>2</td></tr><tr><td>Wien</td><td>Ladegerät</td><td>80</td><td><b>1</b></td></tr><tr><td>Wien</td><td>USB-Kabel</td><td>80</td><td>2</td></tr></table>Ergebnis: Graz – USB-Kabel (120), Wien – Ladegerät (80). Achtung beim Gleichstand in Wien: ROW_NUMBER vergibt trotzdem 1 und 2 (zufällig). Sollen beide erscheinen, nimm <code>RANK()</code>. Warum nicht <code>WHERE ROW_NUMBER() … = 1</code> direkt? Weil WHERE vor SELECT ausgewertet wird – deshalb der Umweg über die CTE.`)],
  "dba2-2": [ex("Staffelrabatt mit Variablen, IF und CASE", `Regel: ab 100 € Warenwert 3 %, ab 250 € 5 % Rabatt. Für Bestellung 4711 ergibt sich ein Warenwert von 240 €.` + S(`DECLARE @summe DECIMAL(10,2), @rabatt DECIMAL(4,2);

SELECT @summe = SUM(menge * preis)
FROM dbo.bestellposition WHERE bestnr = 4711;          -- 240.00

IF @summe >= 250      SET @rabatt = 5;
ELSE IF @summe >= 100 SET @rabatt = 3;                  -- trifft zu
ELSE                  SET @rabatt = 0;

PRINT CONCAT('Summe: ', @summe, ' | Rabatt: ', @rabatt, ' % | zu zahlen: ',
             CAST(@summe * (100 - @rabatt) / 100 AS DECIMAL(10,2)));
-- Summe: 240.00 | Rabatt: 3.00 % | zu zahlen: 232.80`) + `Rechnung: 240 · (100 − 3) / 100 = 240 · 0,97 = <b>232,80 €</b>.<br>Mengenorientiert für <b>alle</b> Bestellungen auf einmal geht dasselbe mit CASE statt IF:` + S(`SELECT bestnr, SUM(menge * preis) AS summe,
       CASE WHEN SUM(menge * preis) >= 250 THEN 5
            WHEN SUM(menge * preis) >= 100 THEN 3 ELSE 0 END AS rabatt_prozent
FROM dbo.bestellposition GROUP BY bestnr;`) + `Reihenfolge der Bedingungen beachten: Stünde <code>&gt;= 100</code> zuerst, bekäme auch eine 300-€-Bestellung nur 3 %.`, "Beispiel durchgerechnet")],
  "dba2-3": [ex("Laufende Summe: Cursor gegen SUM() OVER", `Für ein Umsatz-Chart braucht die App den kumulierten Umsatz je Tag. Mit Cursor:` + S(`DECLARE @tag DATE, @umsatz DECIMAL(12,2), @kum DECIMAL(12,2) = 0;
DECLARE @erg TABLE (tag DATE, umsatz DECIMAL(12,2), kumuliert DECIMAL(12,2));
DECLARE c CURSOR LOCAL FAST_FORWARD FOR
  SELECT tag, umsatz FROM dbo.v_tagesumsatz ORDER BY tag;
OPEN c;
FETCH NEXT FROM c INTO @tag, @umsatz;
WHILE @@FETCH_STATUS = 0
BEGIN
  SET @kum += @umsatz;
  INSERT @erg VALUES (@tag, @umsatz, @kum);
  FETCH NEXT FROM c INTO @tag, @umsatz;
END
CLOSE c; DEALLOCATE c;
SELECT * FROM @erg;`) + `Als <b>eine</b> Mengenoperation mit Fensterfunktion:` + S(`SELECT tag, umsatz,
       SUM(umsatz) OVER (ORDER BY tag ROWS UNBOUNDED PRECEDING) AS kumuliert
FROM dbo.v_tagesumsatz;`) + `<table class="dt"><tr><th>tag</th><th>umsatz</th><th>kumuliert</th></tr><tr><td>01.10.</td><td>320</td><td>320</td></tr><tr><td>02.10.</td><td>150</td><td>470</td></tr><tr><td>03.10.</td><td>410</td><td>880</td></tr><tr><td>04.10.</td><td>90</td><td>970</td></tr></table>Gleiches Ergebnis, aber 3 Zeilen statt 14, keine Variablen, kein vergessenes zweites FETCH, und der Optimizer verarbeitet alles in einem Durchlauf.`)],
  "dba3-1": [ex("sp_lager_buchen: Parameter, RETURN-Code und OUTPUT", `Eine Prozedur bucht Ware aus einem Lager ab und meldet den neuen Bestand.` + S(`CREATE OR ALTER PROCEDURE dbo.sp_lager_buchen
  @artnr INT, @lagernr INT, @menge INT,
  @neu   INT OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  SET @neu = NULL;                                           -- definierter Startwert
  IF @menge <= 0 RETURN 1;                                   -- ungültige Menge
  UPDATE dbo.lagerstand
     SET menge = menge - @menge, @neu = menge - @menge
   WHERE artnr = @artnr AND lagernr = @lagernr AND menge >= @menge;
  IF @@ROWCOUNT = 0 RETURN 2;                                -- nicht genug lagernd
  RETURN 0;                                                  -- ok
END;`) + `Aufruf mit Bestand 10 in Lager 1:` + S(`DECLARE @rc INT, @rest INT;
EXEC @rc = dbo.sp_lager_buchen @artnr = 1089, @lagernr = 1, @menge = 4, @neu = @rest OUTPUT;
SELECT @rc AS rc, @rest AS rest;   -- rc = 0, rest = 6
EXEC @rc = dbo.sp_lager_buchen 1089, 1, 9, @rest OUTPUT;
SELECT @rc AS rc, @rest AS rest;   -- rc = 2, rest = NULL (UPDATE traf keine Zeile)`) + `Die drei Rückgabewege im Einsatz: <b>RETURN</b> für den Status (nur INT), <b>OUTPUT</b> für den fachlichen Wert, und ein Resultset wäre für Listen gedacht. Bemerkenswert: <code>@neu = menge - @menge</code> im UPDATE liest den Bestand in derselben Anweisung – ohne Lücke zwischen Prüfen und Schreiben.`)],
  "dba3-2": [{ t: "fig", id: "dbaent-trycatch" }, { t: "fig", id: "dbaent-locks" }, ex("Bestellung mit zwei Positionen – Position 2 scheitert", `Ablauf in einer Transaktion, Lagerstand vorher: Artikel 1089 = 10, Artikel 1244 = 1.` + S(`DECLARE @bestnr INT;
SET XACT_ABORT ON;
BEGIN TRY
  BEGIN TRAN;                                                    -- @@TRANCOUNT = 1
  INSERT dbo.bestellung (kdnr) VALUES (7);
  SET @bestnr = SCOPE_IDENTITY();                                -- z. B. 5021
  INSERT dbo.bestellposition (bestnr, posnr, artnr, menge, preis) VALUES (@bestnr, 1, 1089, 2, 13.89);
  UPDATE dbo.lagerstand SET menge -= 2 WHERE artnr = 1089 AND lagernr = 1;  -- 10 → 8
  INSERT dbo.bestellposition (bestnr, posnr, artnr, menge, preis) VALUES (@bestnr, 2, 1244, 3, 4.50);
  UPDATE dbo.lagerstand SET menge -= 3 WHERE artnr = 1244 AND lagernr = 1;  -- 1 − 3 = −2 → CHECK!
  COMMIT;
END TRY
BEGIN CATCH
  IF @@TRANCOUNT > 0 ROLLBACK;                                   -- alles zurück
  THROW;                                                         -- Fehler 547 an Aufrufer
END CATCH;`) + `<table class="dt"><tr><th>Zeitpunkt</th><th>@@TRANCOUNT</th><th>1089</th><th>1244</th><th>Bestellung 5021</th></tr><tr><td>vor BEGIN TRAN</td><td>0</td><td>10</td><td>1</td><td>–</td></tr><tr><td>nach 2. UPDATE (Fehler)</td><td>1</td><td>8 (vorläufig)</td><td>1</td><td>vorläufig angelegt</td></tr><tr><td>nach ROLLBACK</td><td>0</td><td><b>10</b></td><td><b>1</b></td><td><b>existiert nicht</b></td></tr></table>Das CHECK-Constraint <code>menge &gt;= 0</code> löst Fehler 547 aus. Weil TRY/CATCH (bzw. XACT_ABORT) greift, bleibt keine halbe Bestellung übrig. <i>Ohne</i> beides würde – wie in den Fragen zu Transaktionen gezeigt – nur die fehlerhafte Anweisung abgebrochen und der Rest mit COMMIT festgeschrieben. Hinweis: Die IDENTITY-Nummer 5021 ist trotzdem „verbraucht“; die nächste Bestellung bekommt 5022.`, "Beispiel durchgerechnet")],
  "dba3-3": [ex("Inline-TVF: Umsatz je Artikel in einem Zeitraum", `Eine Inline-Tabellenwertfunktion ist eine „Sicht mit Parametern“ – sie besteht aus genau einem SELECT.` + S(`CREATE OR ALTER FUNCTION dbo.fn_artikelumsatz (@von DATE, @bis DATE)
RETURNS TABLE
AS RETURN (
  SELECT p.artnr, SUM(p.menge) AS stueck, SUM(p.menge * p.preis) AS umsatz
  FROM dbo.bestellposition p
  JOIN dbo.bestellung b ON b.bestnr = p.bestnr
  WHERE b.datum >= @von AND b.datum < DATEADD(DAY, 1, @bis)
  GROUP BY p.artnr
);
GO
-- wie eine Tabelle verwenden, auch in JOINs:
SELECT a.bezeichnung, u.stueck, u.umsatz
FROM dbo.fn_artikelumsatz('2026-10-01', '2026-10-31') u
JOIN dbo.artikel a ON a.artnr = u.artnr
ORDER BY u.umsatz DESC;`) + `<table class="dt"><tr><th>bezeichnung</th><th>stueck</th><th>umsatz</th></tr><tr><td>Kopfhörer</td><td>12</td><td>1.078,80</td></tr><tr><td>USB-Kabel</td><td>85</td><td>424,15</td></tr><tr><td>Ladegerät</td><td>14</td><td>279,30</td></tr></table>Warum <code>&lt; DATEADD(DAY, 1, @bis)</code> statt <code>&lt;= @bis</code>? <code>datum</code> ist DATETIME2 – eine Bestellung am 31.10. um 14:30 ist größer als „2026-10-31 00:00“ und würde sonst fehlen.`)],
  "dba4-1": [{ t: "fig", id: "dbaent-trigger" }, ex("Was steht in inserted und deleted?", `Tabelle <code>dbo.lagerstand</code> enthält (1089, 1, 10) und (1244, 1, 5). Drei Anweisungen, jeweils mit dem Inhalt der internen Tabellen im Trigger:` + `<table class="dt"><tr><th>Anweisung</th><th>deleted</th><th>inserted</th><th>Trigger-Aufrufe</th></tr><tr><td><code>INSERT … VALUES (1302, 1, 7)</code></td><td>leer</td><td>(1302, 1, 7)</td><td>1</td></tr><tr><td><code>UPDATE … SET menge = menge + 5 WHERE lagernr = 1</code></td><td>(1089, 1, 10), (1244, 1, 5), (1302, 1, 7)</td><td>(1089, 1, 15), (1244, 1, 10), (1302, 1, 12)</td><td>1</td></tr><tr><td><code>DELETE … WHERE menge &gt; 100</code></td><td>leer (keine Zeile betroffen)</td><td>leer</td><td>1 (feuert trotzdem!)</td></tr></table>Daraus folgt für jeden Trigger: Er muss mit 0, 1 oder vielen Zeilen umgehen können. Ein typischer Einstieg:` + S(`CREATE OR ALTER TRIGGER dbo.tr_lagerstand_upd ON dbo.lagerstand AFTER UPDATE AS
BEGIN
  SET NOCOUNT ON;
  IF NOT EXISTS (SELECT 1 FROM inserted) RETURN;   -- 0 Zeilen: nichts zu tun
  INSERT dbo.lagerlog (artnr, lagernr, alt, neu, zeit)
  SELECT i.artnr, i.lagernr, d.menge, i.menge, SYSDATETIME()
  FROM inserted i JOIN deleted d ON d.artnr = i.artnr AND d.lagernr = i.lagernr;
END;`))],
  "dba4-2": [ex("Prüf-Trigger, der auch bei 3 Zeilen richtig prüft", `Regel: Bestellpositionen dürfen nur aktive Artikel enthalten (tabellenübergreifend → kein CHECK möglich).` + S(`CREATE OR ALTER TRIGGER dbo.tr_bp_nur_aktive ON dbo.bestellposition
AFTER INSERT, UPDATE AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (SELECT 1 FROM inserted i
             JOIN dbo.artikel a ON a.artnr = i.artnr
             WHERE a.aktiv = 0)
    THROW 50010, 'Bestellposition mit inaktivem Artikel', 1;
END;`) + `Test mit drei Zeilen in einer Anweisung, Artikel 1302 ist inaktiv:` + S(`INSERT dbo.bestellposition (bestnr, posnr, artnr, menge, preis)
VALUES (5021, 1, 1089, 1, 13.89), (5021, 2, 1302, 2, 4.90), (5021, 3, 1244, 1, 4.50);
-- Msg 50010: Bestellposition mit inaktivem Artikel → keine der 3 Zeilen bleibt`) + `Die falsche Variante <code>SELECT @artnr = artnr FROM inserted</code> prüft nur <i>eine</i> zufällige der drei Zeilen – je nach Ausführungsplan rutscht 1302 durch. <code>THROW</code> im Trigger beendet die Anweisung, und da der Trigger in derselben Transaktion läuft, werden alle drei Zeilen zurückgenommen.`)],
  "dba4-3": [ex("Eine Regel, drei Umsetzungen: Mengen und Mindestbestellwert", `Drei Regeln für den Webshop – welche Technik passt?` + `<table class="dt"><tr><th>Regel</th><th>Technik</th><th>Begründung</th></tr><tr><td>Menge einer Position zwischen 1 und 99</td><td><b>CHECK</b> <code>menge BETWEEN 1 AND 99</code></td><td>bezieht sich nur auf die eigene Zeile → deklarativ</td></tr><tr><td>Position nur für aktive Artikel</td><td><b>Trigger</b> auf bestellposition</td><td>tabellenübergreifend, darf nicht umgangen werden</td></tr><tr><td>Bestellung erst ab 10 € Warenwert abschicken</td><td><b>Prüfung in der Prozedur</b> sp_bestellung_abschliessen</td><td>gilt nur beim fachlichen Ereignis „Abschließen“; während des Befüllens ist der Warenkorb noch kleiner</td></tr></table>` + S(`ALTER TABLE dbo.bestellposition DROP CONSTRAINT ck_pos_menge;   -- bisher: menge > 0
ALTER TABLE dbo.bestellposition
  ADD CONSTRAINT ck_pos_menge CHECK (menge BETWEEN 1 AND 99);
-- INSERT … menge = 0  → Fehler 547, ohne eine Zeile Code im Trigger`) + `Faustregel aus der Vorlesung: <b>so deklarativ wie möglich, so prozedural wie nötig</b>. Der Mindestbestellwert zeigt, dass manche Regeln an einen Ablauf gebunden sind und deshalb in die Prozedur gehören – nicht in einen Trigger, der bei jeder einzelnen Position feuern würde.`)],
  "dba5-1": [ex("Rechtekonzept für die Shop-API in fünf Zeilen", `Die API meldet sich mit einem eigenen Benutzer an, der <b>nur</b> den Wrapper ausführen darf.` + S(`CREATE LOGIN shop_api WITH PASSWORD = 'S1cher!Lang#2026';   -- Serverebene
CREATE USER  shop_api FOR LOGIN shop_api;                    -- in der DB webshop
CREATE ROLE  app_role;
ALTER ROLE   app_role ADD MEMBER shop_api;
GRANT EXECUTE ON dbo.sp_backend_wrapper TO app_role;          -- sonst nichts`) + `Test aus Sicht der API:` + S(`EXECUTE AS USER = 'shop_api';
EXEC dbo.sp_backend_wrapper @input = N'{"typ":"artikelpreis","artnr":1089}', @output = @o OUTPUT;  -- ok
SELECT * FROM dbo.kunde;      -- Msg 229: SELECT permission denied
REVERT;`) + `Warum funktioniert der Wrapper, obwohl <code>shop_api</code> keine Tabellenrechte hat? <b>Besitzkette</b>: Prozedur und Tabellen gehören <code>dbo</code>, darum prüft SQL Server beim Zugriff aus der Prozedur keine weiteren Rechte. Wird die Zugangsdaten-Datei der API gestohlen, kann der Angreifer trotzdem nur das, was der Wrapper erlaubt – kein <code>SELECT * FROM dbo.kunde</code>, kein <code>DELETE</code>.`)],
  "dba5-2": [{ t: "fig", id: "dbaent-inj" }, ex("Optionale Suchfilter sicher mit sp_executesql", `Die Artikelsuche hat zwei optionale Filter (Text, Höchstpreis). Dynamisches SQL ist hier praktisch – aber nur mit Parametern:` + S(`CREATE OR ALTER PROCEDURE dbo.sp_artikelsuche @text NVARCHAR(50) = NULL, @max DECIMAL(10,2) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @sql NVARCHAR(MAX) = N'SELECT artnr, bezeichnung, vk FROM dbo.artikel WHERE aktiv = 1';
  IF @text IS NOT NULL SET @sql += N' AND bezeichnung LIKE @p_text';
  IF @max  IS NOT NULL SET @sql += N' AND vk <= @p_max';
  EXEC sp_executesql @sql,
       N'@p_text NVARCHAR(52), @p_max DECIMAL(10,2)',
       @p_text = N'%' + @text + N'%', @p_max = @max;
END;`) + `Angriffsversuch: <code>@text = N''' OR 1=1 --'</code><br>Ausgeführt wird <code>… WHERE aktiv = 1 AND bezeichnung LIKE @p_text</code> mit dem Wert <code>%' OR 1=1 --%</code>. Gesucht wird nach Artikeln, deren Bezeichnung diesen Text enthält → <b>0 Treffer</b>, kein eingeschleuster Code. Der SQL-Text selbst enthält nur feste Bausteine, nie Benutzereingaben.`)],
  "dba5-3": [ex("JSON rein, JSON raus: Attribute ändern und verschachtelt ausgeben", `Artikel 1089 hat <code>attribute = {"farbe":"schwarz","kabel":true,"tags":["audio"]}</code>.` + S(`-- Wert ändern und Array erweitern
UPDATE dbo.artikel
SET attribute = JSON_MODIFY(JSON_MODIFY(attribute, '$.farbe', 'weiß'),
                            'append $.tags', 'bluetooth')
WHERE artnr = 1089;
-- {"farbe":"weiß","kabel":true,"tags":["audio","bluetooth"]}

-- verschachtelte Antwort für die App
SELECT artnr, bezeichnung,
       vk AS [preis.netto],
       CAST(vk * (1 + ust_satz / 100) AS DECIMAL(10,2)) AS [preis.brutto],
       JSON_VALUE(attribute, '$.farbe') AS farbe,
       JSON_QUERY(attribute, '$.tags')  AS tags
FROM dbo.artikel WHERE artnr = 1089
FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;`) + `Ergebnis (netto 11,58 €, 20 % USt):` + S(`{"artnr":1089,"bezeichnung":"Kopfhörer","preis":{"netto":11.58,"brutto":13.90},
 "farbe":"weiß","tags":["audio","bluetooth"]}`) + `Zwei Details: Der Alias mit Punkt erzeugt das Unterobjekt <code>preis</code>. Und <code>tags</code> braucht JSON_QUERY – mit JSON_VALUE käme NULL zurück (Array ist kein Skalar), als normaler Text würde es als String mit escapten Anführungszeichen ausgegeben.`)],
  "dba6-1": [ex("Von der Anforderung zur Prozedur: „Artikel bewerten“", `<b>1 · Anforderung</b>: Kund:innen können gekaufte Artikel mit 1–5 Sternen und optionalem Text bewerten, je Artikel nur einmal.<br><b>2 · Datenmodell</b>:` + S(`CREATE TABLE dbo.bewertung (
  kdnr   INT NOT NULL CONSTRAINT fk_bew_kunde   REFERENCES dbo.kunde(kdnr),
  artnr  INT NOT NULL CONSTRAINT fk_bew_artikel REFERENCES dbo.artikel(artnr),
  sterne TINYINT NOT NULL CONSTRAINT ck_bew_sterne CHECK (sterne BETWEEN 1 AND 5),
  text   NVARCHAR(500) NULL,
  datum  DATETIME2 NOT NULL CONSTRAINT df_bew_datum DEFAULT SYSDATETIME(),
  CONSTRAINT pk_bewertung PRIMARY KEY (kdnr, artnr)        -- „nur einmal“
);`) + `<b>3 · Funktion</b>: Die Regel „nur gekaufte Artikel“ ist tabellenübergreifend → Prüfung in der Prozedur, mit eigenem Fehlercode für die App:` + S(`CREATE OR ALTER PROCEDURE dbo.sp_bewertung_anlegen
  @kdnr INT, @artnr INT, @sterne TINYINT, @text NVARCHAR(500) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  IF NOT EXISTS (SELECT 1 FROM dbo.bestellung b JOIN dbo.bestellposition p ON p.bestnr = b.bestnr
                 WHERE b.kdnr = @kdnr AND p.artnr = @artnr)
    THROW 50020, 'Artikel wurde nicht gekauft', 1;
  INSERT dbo.bewertung (kdnr, artnr, sterne, text) VALUES (@kdnr, @artnr, @sterne, @text);
END;`) + `<b>4 · JSON-Vertrag</b>: <code>{"typ":"bewertung","kdnr":7,"artnr":1089,"sterne":4}</code> → <code>{"ok":true,…}</code> bzw. <code>{"ok":false,"fehlercode":50020,…}</code>. Doppelte Bewertung liefert automatisch Fehler 2627 (PK-Verletzung) – deklarativ, ohne eigenen Code.`)],
  "dba6-2": [ex("Ein neuer typ im Wrapper: „lagerstand“ von Anfang bis Ende", `Die App fragt: <code>{"typ":"lagerstand","artnr":1089}</code>. Im Wrapper (Variante 2: Skalarwerte an die Einzelprozedur) kommt ein Zweig dazu:` + S(`DECLARE @typ NVARCHAR(50) = JSON_VALUE(@input, '$.typ');
IF @typ = N'lagerstand'
BEGIN
  DECLARE @artnr INT = TRY_CAST(JSON_VALUE(@input, '$.artnr') AS INT);
  IF @artnr IS NULL THROW 50001, 'artnr fehlt oder ist keine Zahl', 1;
  SET @output = (
    SELECT CAST(1 AS BIT) AS ok, NULL AS fehlercode, NULL AS fehler,
           (SELECT l.ort, ls.menge
              FROM dbo.lagerstand ls JOIN dbo.lager l ON l.lagernr = ls.lagernr
             WHERE ls.artnr = @artnr
               FOR JSON PATH) AS ergebnis
    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER, INCLUDE_NULL_VALUES);
END`) + `Antwort an die App:` + S(`{"ok":true,"fehlercode":null,"fehler":null,
 "ergebnis":[{"ort":"Graz","menge":8},{"ort":"Wien","menge":80}]}`) + `Testfälle für die Abgabe: gültige artnr (2 Lager), artnr ohne Lagerstand (<code>ergebnis</code> fehlt bzw. ist leer – im Vertrag festlegen!), <code>"artnr":"abc"</code> (→ Fehler 50001 im einheitlichen Fehler-JSON des CATCH-Blocks). <code>INCLUDE_NULL_VALUES</code> sorgt dafür, dass <code>fehlercode</code> und <code>fehler</code> als <code>null</code> im JSON stehen, statt ganz zu fehlen.`)],
  "dba6-3": [ex("Selbst-Review: fünf Mängel in zwölf Zeilen", `Diese Prozedur „funktioniert“ im Test – trotzdem würde sie im Code-Review schlecht abschneiden:` + S(`CREATE PROCEDURE dbo.sp_storno @bestnr INT AS
DECLARE @artnr INT, @menge INT
SELECT @artnr = artnr, @menge = menge FROM dbo.bestellposition WHERE bestnr = @bestnr   -- (1)
UPDATE dbo.lagerstand SET menge = menge + @menge WHERE artnr = @artnr                  -- (2)
DELETE FROM dbo.bestellposition WHERE bestnr = @bestnr                                 -- (3)
DELETE FROM dbo.bestellung WHERE bestnr = @bestnr
PRINT 'storniert'                                                                      -- (4)
-- (5) kein SET NOCOUNT ON, keine Prüfung, ob die Bestellung existiert`) + `<ol><li>Variablenzuweisung aus mehreren Positionen: Nur <b>eine</b> Position wird zurückgebucht.</li><li>Ohne <code>lagernr</code> werden alle Lager des Artikels erhöht.</li><li>Keine Transaktion und kein TRY/CATCH: Scheitert ein DELETE, bleibt der Lagerstand trotzdem erhöht.</li><li><code>PRINT</code> erreicht die App nicht – Rückmeldung per JSON/OUTPUT bzw. Fehler per THROW.</li><li>Fehlende Existenzprüfung: eine unbekannte bestnr läuft „erfolgreich“ durch.</li></ol>Verbesserte Kernzeile, mengenorientiert für alle Positionen:` + S(`UPDATE ls SET ls.menge = ls.menge + p.menge
FROM dbo.lagerstand ls
JOIN dbo.bestellposition p ON p.artnr = ls.artnr AND p.lagernr = ls.lagernr
WHERE p.bestnr = @bestnr;`) + `(Annahme: die Position speichert das Lager, aus dem geliefert wurde.) Genau solche Begründungen – „was passiert bei mehreren Zeilen, bei Fehlern, bei falschen Eingaben?“ – erwartet das Code-Review.`)]
};

/* zusätzliche Selbsttests in Lektionen */
const CHK = {
  "dba2-1": { t: "check", q: "Warum ist <code>SELECT SUM(vk) AS summe FROM dbo.artikel WHERE summe &gt; 100</code> ungültig?", opts: ["SUM ist in T-SQL nicht erlaubt", "WHERE wird vor SELECT ausgewertet – der Alias existiert dort noch nicht, und Aggregate gehören in HAVING", "Ein Alias darf nie verwendet werden", "Es fehlt ORDER BY"], a: 1, why: "Logische Reihenfolge: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY." },
  "dba3-2": { t: "check", q: "Zwei Sitzungen führen gleichzeitig <code>UPDATE … SET menge = menge − 1 WHERE artnr = 1089 AND menge &gt;= 1</code> aus, menge = 1. Was passiert?", opts: ["Beide Updates gelingen, menge = −1", "Beide scheitern", "Die erste sperrt die Zeile, die zweite wartet und findet danach keine passende Zeile (@@ROWCOUNT = 0)", "Deadlock in jedem Fall"], a: 2, why: "Die Bedingung wird beim Ändern unter Sperre geprüft – Prüfen und Schreiben sind eine atomare Anweisung." },
  "dba4-1": { t: "check", q: "Ein DELETE trifft keine einzige Zeile. Feuert ein AFTER-DELETE-Trigger?", opts: ["Nein, nie", "Ja, einmal – deleted ist dann leer", "Ja, aber nur bei INSTEAD OF", "Nur wenn NOCOUNT OFF ist"], a: 1, why: "Statement-Trigger feuern pro Anweisung, auch bei 0 betroffenen Zeilen." },
  "dba5-2": { t: "check", q: "Welche Zeile ist injection-sicher?", opts: ["<code>EXEC('SELECT * FROM dbo.kunde WHERE name = ''' + @n + '''')</code>", "<code>EXEC sp_executesql N'SELECT * FROM dbo.kunde WHERE name = @p', N'@p NVARCHAR(100)', @p = @n</code>", "<code>EXEC sp_executesql N'SELECT * FROM dbo.kunde WHERE name = ''' + @n + ''''</code>", "<code>SET @sql = REPLACE(@n, '--', '')</code>"], a: 1, why: "Nur wenn der Wert als Parameter übergeben wird, bleibt er Daten. sp_executesql mit verkettetem Text ist genauso angreifbar." }
};
Object.entries(CHK).forEach(([k, b]) => BLOCKS[k].push(b));

/* ===================== Fragen ===================== */
const Q = [
 // dba-arch
 ["dba-arch", "Was unterscheidet ein Server-DBMS wie SQL Server grundlegend von einer Access-Datei auf einem Netzlaufwerk?", ["Access kennt keine Tabellen", "Beim Server-DBMS verarbeitet eine zentrale Engine die Anfragen; bei der Datei liest jeder Client die Datei selbst", "Server-DBMS speichern nur JSON", "Access kann kein SQL"], 1, "Server-DBMS: Engine am Server, Clients schicken SQL und bekommen nur Ergebnisse."],
 ["dba-arch", "Im Praxisprojekt ruft die Kotlin-App eine API auf, die das JSON an dbo.sp_backend_wrapper weiterreicht. Welche Architektur ist das?", ["2-Tier: App spricht direkt SQL", "Reine Client-Logik", "n-Tier: App → API → Datenbank, Logik in Stored Procedures", "Peer-to-Peer"], 2, "Zwischen App und DB liegt eine Middleware (API); die eigentliche Logik steckt in den Prozeduren."],
 ["dba-arch", "Welche Zuordnung ist richtig?", ["PL/SQL – Schnittstelle, ODBC – Sprache", "JDBC – Schnittstelle für Java, T-SQL – serverseitige Sprache des SQL Servers", "ADO.NET – Datenbank, C# – Treiber", "Transact-SQL – Oracle"], 1, "Schnittstellen: ODBC, JDBC, ADO.NET. Serverseitige Sprachen: T-SQL (SQL Server), PL/SQL (Oracle)."],
 ["dba-arch", "Was enthält ein Connection String typischerweise?", ["Den SQL-Text der Abfrage", "Server, Datenbank und Art der Anmeldung", "Die Tabellendefinitionen", "Den Ausführungsplan"], 1, "Er beschreibt, wohin und als wer die Verbindung aufgebaut wird."],
 ["dba-arch", "Was passiert am Server, bevor eine Abfrage tatsächlich Daten liest?", ["Nichts, sie wird direkt ausgeführt", "Die App kompiliert sie in Maschinencode", "Parsen, Namen auflösen, Berechtigungen prüfen und einen Ausführungsplan erstellen", "Die Tabelle wird kopiert"], 2, "Erst nach Prüfung und Optimierung wird ausgeführt."],
 // dba-zugriff
 ["dba-zugriff", "Ein C#-Programm baut \"… WHERE vk <= \" + eingabe. Der Benutzer tippt 20,5. Was passiert?", ["Es funktioniert, SQL kennt Kommas", "Laufzeitfehler: Im SQL-Text steht 20,5 – das Komma ist kein Dezimaltrennzeichen", "Der Compiler meldet einen Fehler", "SQL Server rundet auf 20"], 1, "Bei String-Verkettung hängen Formate vom Client ab; Parameter übertragen den Wert typisiert."],
 ["dba-zugriff", "Welcher Vorteil ergibt sich aus Parametern neben der Sicherheit?", ["Abfragen brauchen keine Verbindung", "Der Ausführungsplan kann wiederverwendet werden, weil der SQL-Text gleich bleibt", "Tabellen werden automatisch indiziert", "Es entfällt das Datenbank-Login"], 1, "Gleicher Text mit wechselnden Werten → Planwiederverwendung statt Neukompilieren."],
 ["dba-zugriff", "Was beschreibt das N+1-Problem bei ORMs?", ["Eine Abfrage zu viel beim Login", "Für eine Liste wird eine Abfrage und dann pro Objekt eine weitere ausgeführt", "Jede Tabelle braucht N+1 Spalten", "Ein Fehler bei N+1 gleichzeitigen Benutzern"], 1, "Z. B. 1 Abfrage für 100 Bestellungen + 100 Abfragen für deren Kunden statt eines JOINs."],
 ["dba-zugriff", "Warum ist AddWithValue bei Strings nicht ideal?", ["Es ist nicht injection-sicher", "Der Typ wird aus dem .NET-Wert abgeleitet; Länge/Typ können von der Spalte abweichen und implizite Konvertierungen auslösen", "Es funktioniert nur mit Zahlen", "Es verschlüsselt den Wert"], 1, "Besser: Parameters.Add(\"@name\", SqlDbType.NVarChar, 100)."],
 // dba-server
 ["dba-server", "Ein Ablauf mit 10 Anweisungen, RTT 40 ms, 2 ms Ausführung je Anweisung. Wie lange dauert er mit Client-Logik bzw. als Prozedur?", ["420 ms bzw. 60 ms", "400 ms bzw. 40 ms", "420 ms bzw. 420 ms", "60 ms bzw. 420 ms"], 0, "Client: 10 · (40 + 2) = 420 ms. Server: 40 + 10 · 2 = 60 ms."],
 ["dba-server", "Welche Aufgabe gehört eher in die App als in die Datenbank?", ["Lagerstand prüfen und abbuchen", "Bildfilter auf ein Profilfoto anwenden", "Nächtliche Archivierung alter Bestellungen", "Prüfung, dass ein Artikel aktiv ist"], 1, "Rechenintensiver Algorithmus ohne Datenbezug → Anwendung."],
 ["dba-server", "Warum hält eine Transaktion über mehrere Client-Roundtrips Sperren länger?", ["Weil der Client die Sperren verwaltet", "Weil zwischen den Anweisungen jeweils Netzwerkzeit vergeht, während die Sperren gehalten werden", "Weil Sperren nur am Client existieren", "Gar nicht, Sperren sind immer gleich lang"], 1, "Am Server laufen die Schritte direkt hintereinander – die Transaktion ist kürzer offen."],
 ["dba-server", "Ein Standardsoftware-Hersteller unterstützt SQL Server, Oracle und PostgreSQL. Wo liegt seine Logik eher?", ["In T-SQL-Prozeduren", "In der Anwendung – die Anwendung ist der konstante Faktor, das DBMS wechselt", "In Triggern", "In PL/SQL"], 1, "Proprietäre Spracherweiterungen müssten für jedes DBMS neu geschrieben werden."],
 // dba-sql
 ["dba-sql", "Kunden mit Bestellungen in 2026, Ausgabe je Kunde die Anzahl. Welche Anfrage ist richtig?", ["SELECT kdnr, COUNT(*) FROM dbo.bestellung WHERE YEAR(datum) = 2026 GROUP BY kdnr", "SELECT kdnr, COUNT(*) FROM dbo.bestellung GROUP BY kdnr WHERE YEAR(datum) = 2026", "SELECT kdnr, COUNT(*) FROM dbo.bestellung HAVING YEAR(datum) = 2026", "SELECT kdnr FROM dbo.bestellung WHERE COUNT(*) > 0"], 0, "WHERE vor GROUP BY; Zeilenfilter gehören in WHERE."],
 ["dba-sql", "SELECT k.name, COUNT(*) FROM dbo.kunde k LEFT JOIN dbo.bestellung b ON b.kdnr = k.kdnr GROUP BY k.name – was zeigt ein Kunde ohne Bestellung?", ["0", "NULL", "1", "Er fehlt im Ergebnis"], 2, "COUNT(*) zählt die LEFT-JOIN-Zeile mit NULL-Werten. Richtig wäre COUNT(b.bestnr)."],
 ["dba-sql", "Ein LEFT JOIN kunde → bestellung bekommt zusätzlich WHERE b.datum >= '2026-01-01'. Was passiert mit Kunden ohne Bestellung?", ["Sie bleiben mit NULL erhalten", "Sie fallen weg – der WHERE-Filter auf die rechte Tabelle macht den LEFT JOIN faktisch zum INNER JOIN", "Sie erscheinen doppelt", "Es gibt einen Syntaxfehler"], 1, "NULL >= Datum ist UNKNOWN. Der Filter gehört in die ON-Bedingung, wenn die Kunden bleiben sollen."],
 ["dba-sql", "Umsätze 900, 700, 700, 500 werden mit DENSE_RANK() OVER (ORDER BY umsatz DESC) gereiht. Welchen Rang bekommt 500?", ["4", "3", "2", "5"], 1, "DENSE_RANK lässt keine Lücken: 1, 2, 2, 3. RANK ergäbe 4."],
 ["dba-sql", "Warum kann man ROW_NUMBER() nicht direkt in WHERE filtern?", ["Fensterfunktionen gibt es nur in Oracle", "Fensterfunktionen werden im SELECT-Schritt berechnet, WHERE kommt davor – deshalb CTE oder Unterabfrage", "ROW_NUMBER liefert Text", "WHERE darf keine Zahlen vergleichen"], 1, "Logische Reihenfolge: WHERE vor SELECT."],
 // dba-tsql
 ["dba-tsql", "DECLARE @a INT = 7, @b INT = 2; SELECT @a / @b; – Ergebnis?", ["3,5", "3", "4", "Fehler"], 1, "Ganzzahldivision bei zwei INT-Werten. Für 3,5: @a * 1.0 / @b oder CAST."],
 ["dba-tsql", "Welche Variante ist korrekt, um bei Warenwert ab 250 € 5 % und ab 100 € 3 % zu geben?", ["IF @s >= 100 SET @r = 3 ELSE IF @s >= 250 SET @r = 5", "IF @s >= 250 SET @r = 5 ELSE IF @s >= 100 SET @r = 3 ELSE SET @r = 0", "IF @s >= 250 AND @s >= 100 SET @r = 8", "CASE @s WHEN >= 250 THEN 5 END"], 1, "Die strengere Bedingung muss zuerst geprüft werden."],
 ["dba-tsql", "Ein IF ohne BEGIN … END steht vor zwei Anweisungen. Was gilt?", ["Beide gehören zum IF", "Nur die erste Anweisung ist bedingt, die zweite läuft immer", "Syntaxfehler", "Keine wird ausgeführt"], 1, "Ohne BEGIN/END bezieht sich IF nur auf eine Anweisung."],
 ["dba-tsql", "Was liefert ISNULL(@rabatt, 0) * 10, wenn @rabatt deklariert, aber nie gesetzt wurde?", ["NULL", "0", "10", "Fehler"], 1, "Nicht gesetzte Variablen sind NULL; ISNULL ersetzt durch 0 → 0 · 10 = 0."],
 // dba-cursor
 ["dba-cursor", "In einer Cursor-Schleife fehlt das FETCH NEXT am Ende des WHILE-Blocks. Was passiert?", ["Die Schleife läuft genau einmal", "Endlosschleife: @@FETCH_STATUS bleibt 0 und dieselbe Zeile wird immer wieder verarbeitet", "Der Cursor schließt sich automatisch", "Compilerfehler"], 1, "Ohne erneutes FETCH ändert sich der Status nie."],
 ["dba-cursor", "Laufende Summe der Tagesumsätze – welche Lösung ist mengenorientiert?", ["Cursor mit Variable @kum", "WHILE-Schleife über das Datum", "SUM(umsatz) OVER (ORDER BY tag ROWS UNBOUNDED PRECEDING)", "Trigger auf der Umsatztabelle"], 2, "Fensterfunktion: ein Statement, keine Schleife."],
 ["dba-cursor", "Wann ist ein Cursor in T-SQL vertretbar?", ["Für jede Preisänderung", "Wenn je Zeile eine Prozedur aufgerufen werden muss, die nicht mengenorientiert arbeiten kann (z. B. Mailversand)", "Für Summen", "Für JOINs zwischen zwei Tabellen"], 1, "EXEC lässt sich nicht pro Zeile in ein SELECT einbauen."],
 ["dba-cursor", "Was bewirkt LOCAL FAST_FORWARD bei DECLARE … CURSOR?", ["Der Cursor ist global und änderbar", "Ein lokaler, vorwärts gerichteter, schreibgeschützter Cursor mit wenig Overhead", "Der Cursor wird parallel ausgeführt", "Die Daten werden in JSON umgewandelt"], 1, "Die sparsamste Variante, wenn man einmal von vorne nach hinten liest."],
 // dba-sp
 ["dba-sp", "Welcher Datentyp ist für einen RETURN-Wert einer Prozedur erlaubt?", ["DECIMAL", "NVARCHAR", "INT", "Jeder Typ"], 2, "RETURN liefert nur INT, üblich als Statuscode; fachliche Werte über OUTPUT."],
 ["dba-sp", "EXEC @rc = dbo.sp_lager_buchen 1089, 1, 9, @rest OUTPUT; – lagernd sind 5. Welche Werte haben @rc und @rest nach dem Beispiel aus der Lektion?", ["0 und −4", "2 und NULL", "1 und 5", "0 und 5"], 1, "Das UPDATE trifft keine Zeile (menge >= 9 ist falsch) → RETURN 2, @neu wird nicht gesetzt."],
 ["dba-sp", "Wie übergibt man Parameter beim Aufruf unabhängig von der Reihenfolge?", ["Gar nicht", "Mit Namen: EXEC dbo.sp_x @menge = 4, @artnr = 1089", "Mit Komma-Index", "Nur über JSON"], 1, "Benannte Parameter machen den Aufruf lesbar und reihenfolgeunabhängig."],
 ["dba-sp", "Ein Parameter ist mit @text NVARCHAR(50) = NULL deklariert. Was bedeutet das?", ["Er muss immer NULL sein", "Er ist optional; ohne Angabe ist sein Wert NULL", "Er ist ein OUTPUT-Parameter", "Er darf nicht NULL sein"], 1, "Defaultwerte machen Parameter optional."],
 // dba-tx
 ["dba-tx", "SET XACT_ABORT ON ist gesetzt. In einer Transaktion verletzt das zweite von drei INSERTs einen Fremdschlüssel (kein TRY/CATCH). Ergebnis?", ["Nur das zweite INSERT fehlt", "Die gesamte Transaktion wird zurückgerollt und der Batch abgebrochen", "Alle drei bleiben", "Die Transaktion bleibt offen"], 1, "XACT_ABORT ON: Laufzeitfehler → Rollback der ganzen Transaktion."],
 ["dba-tx", "Welches ACID-Prinzip verletzt ein Lost Update?", ["Atomicity", "Consistency", "Isolation", "Durability"], 2, "Gleichzeitige Transaktionen beeinflussen sich, als liefen sie nicht isoliert."],
 ["dba-tx", "Wie verhindert man beim Verkauf des letzten Stücks den Überverkauf am einfachsten?", ["Erst SELECT, dann UPDATE mit dem gelesenen Wert", "UPDATE … SET menge = menge − 1 WHERE … AND menge >= 1 und danach @@ROWCOUNT prüfen", "Den Lagerstand in der App zwischenspeichern", "Mit einem Cursor"], 1, "Prüfen und Ändern in einer Anweisung – unter Sperre, atomar."],
 ["dba-tx", "BEGIN TRAN; INSERT … (IDENTITY → 5021); ROLLBACK; INSERT … – welche Nummer bekommt der neue Datensatz?", ["5021", "5022", "1", "NULL"], 1, "IDENTITY-Werte werden durch ROLLBACK nicht zurückgegeben – es entstehen Lücken."],
 // dba-udf
 ["dba-udf", "Woran erkennt man eine Inline-Tabellenwertfunktion?", ["RETURNS @t TABLE (…) mit BEGIN … END", "RETURNS TABLE AS RETURN (ein SELECT)", "RETURNS INT", "Sie hat keine Parameter"], 1, "Inline-TVF = genau ein SELECT, wie eine Sicht mit Parametern."],
 ["dba-udf", "Ein Filter WHERE datum <= @bis (DATETIME2-Spalte, @bis = '2026-10-31') übersieht Bestellungen vom 31.10. nachmittags. Warum?", ["DATETIME2 kennt keinen Oktober", "@bis wird als 31.10. 00:00 interpretiert, spätere Uhrzeiten sind größer", "<= ist in Funktionen verboten", "Der Filter ist richtig"], 1, "Sicher: datum < DATEADD(DAY, 1, @bis)."],
 ["dba-udf", "Wie verwendet man eine Inline-TVF in einer Abfrage?", ["EXEC dbo.fn_x(…)", "Wie eine Tabelle: SELECT … FROM dbo.fn_x(…) u JOIN …", "Nur in einem Trigger", "Über OPENJSON"], 1, "Tabellenwertfunktionen stehen im FROM."],
 ["dba-udf", "Welche Aussage über Skalar-UDFs in einer SELECT-Liste über viele Zeilen trifft zu?", ["Sie werden nur einmal ausgewertet", "Sie werden pro Zeile aufgerufen; aufwändige Skalarfunktionen können Abfragen deutlich bremsen", "Sie ändern die Tabelle", "Sie sind verboten"], 1, "Neuere SQL-Server-Versionen können manche Skalarfunktionen inlinen, grundsätzlich gilt aber: Aufruf je Zeile."],
 // dba-trigger
 ["dba-trigger", "UPDATE dbo.lagerstand SET menge = menge + 5 WHERE lagernr = 1 betrifft 3 Zeilen. Wie viele Zeilen stehen in deleted?", ["0", "1", "3", "6"], 2, "deleted enthält alle betroffenen Zeilen mit den alten Werten."],
 ["dba-trigger", "Ein AFTER-INSERT-Trigger ruft THROW auf. Was geschieht mit der auslösenden INSERT-Anweisung?", ["Sie bleibt bestehen", "Sie wird zurückgenommen, weil der Trigger in derselben Transaktion läuft", "Nur die letzte Zeile wird entfernt", "THROW ist in Triggern verboten"], 1, "Trigger und auslösende Anweisung bilden eine Einheit."],
 ["dba-trigger", "Wie erkennt ein AFTER-UPDATE-Trigger Zeilen, deren Preis sich wirklich geändert hat?", ["IF UPDATE(vk)", "JOIN inserted i mit deleted d über den Schlüssel und WHERE i.vk <> d.vk", "SELECT @vk FROM inserted", "@@ROWCOUNT > 0"], 1, "UPDATE(vk) ist auch true, wenn vk = vk gesetzt wird."],
 ["dba-trigger", "Wofür verwendet man einen INSTEAD-OF-Trigger auf einer Sicht?", ["Um Constraints abzuschalten", "Um Änderungen an einer Sicht, die mehrere Tabellen verbindet, auf die Basistabellen umzuleiten", "Um die Sicht schneller zu machen", "Um JSON zu erzeugen"], 1, "Ersatzhandlung anstelle der nicht direkt möglichen Änderung."],
 // dba-integ
 ["dba-integ", "Regel: „Menge einer Bestellposition zwischen 1 und 99“. Beste Umsetzung?", ["Trigger", "CHECK-Constraint menge BETWEEN 1 AND 99", "Prüfung nur in der App", "Cursor in der Nacht"], 1, "Bezieht sich nur auf die eigene Zeile → deklarativ."],
 ["dba-integ", "Warum gehört „Mindestbestellwert 10 €“ eher in sp_bestellung_abschliessen als in einen Trigger auf bestellposition?", ["Trigger können nicht rechnen", "Die Regel gilt beim fachlichen Ereignis „Abschließen“; während des Befüllens wäre der Warenkorb noch kleiner", "Prozeduren sind immer schneller", "Weil CHECK-Constraints das nicht dürfen"], 1, "Ablaufgebundene Regeln gehören in die Prozedur des Ablaufs."],
 ["dba-integ", "Welcher Fehler entsteht beim Einfügen eines zweiten Datensatzes mit gleichem Primärschlüssel?", ["547", "2627", "50000", "229"], 1, "2627: Verletzung einer PRIMARY-KEY- bzw. UNIQUE-Einschränkung. 547 betrifft FK/CHECK."],
 ["dba-integ", "Welche Aussage über DEFAULT-Constraints ist richtig?", ["Sie prüfen Werte", "Sie liefern einen Wert, wenn beim INSERT keiner angegeben wird", "Sie verhindern NULL in jedem Fall", "Sie sind prozedural"], 1, "DEFAULT füllt fehlende Werte; NOT NULL verhindert NULL."],
 // dba-sec
 ["dba-sec", "Mit welcher Anweisung testet man als dbo, ob ein Benutzer etwas darf?", ["GRANT TEST", "EXECUTE AS USER = 'shop_api'; … REVERT;", "SET USER shop_api", "LOGIN AS shop_api"], 1, "Man wechselt den Sicherheitskontext und kehrt mit REVERT zurück."],
 ["dba-sec", "shop_api hat nur EXECUTE auf dbo.sp_backend_wrapper. Was liefert SELECT * FROM dbo.kunde unter diesem Benutzer?", ["Alle Kunden", "Fehler 229: SELECT-Berechtigung verweigert", "Eine leere Tabelle", "Nur aktive Kunden"], 1, "Kein Recht auf die Tabelle – der Zugriff geht nur indirekt über die Prozedur."],
 ["dba-sec", "Was ist der Vorteil, Rechte an eine Rolle statt an einzelne Benutzer zu vergeben?", ["Rollen sind schneller", "Rechte werden einmal definiert; neue Benutzer bekommen sie durch Mitgliedschaft", "Rollen umgehen die Besitzkette", "Benutzer brauchen dann kein Login"], 1, "Einfachere Verwaltung, weniger Fehler."],
 ["dba-sec", "Unter welcher Bedingung prüft SQL Server beim Tabellenzugriff aus einer Prozedur keine weiteren Rechte?", ["Immer", "Wenn Prozedur und Tabelle denselben Besitzer haben und statisches SQL verwendet wird (Besitzkette)", "Wenn die Prozedur NOCOUNT setzt", "Nie"], 1, "Dynamisches SQL oder andere Besitzer unterbrechen die Kette."],
 // dba-inj
 ["dba-inj", "Warum hilft das Verdoppeln von Hochkommas nicht bei einem Zahlenfeld wie \"WHERE artnr = \" + eingabe?", ["Weil Zahlen keine Hochkommas brauchen – „1 OR 1=1“ kommt ganz ohne ' aus", "Weil SQL Server Hochkommas ignoriert", "Es hilft immer", "Weil Zahlen verschlüsselt werden"], 0, "Ohne umschließende Hochkommas gibt es nichts zu „brechen“; nur Parameter helfen."],
 ["dba-inj", "Welche Eingabe zeigt beim Login-Beispiel den Angriff mit Kommentar?", ["hihi", "hihi' OR 1 = 1;--", "' '", "1 = 1"], 1, "Hochkomma schließt den String, OR 1 = 1 macht die Bedingung wahr, -- kommentiert den Rest aus."],
 ["dba-inj", "In sp_artikelsuche wird nur ' AND bezeichnung LIKE @p_text' angehängt, der Wert über sp_executesql übergeben. Ist das sicher?", ["Nein, jedes dynamische SQL ist unsicher", "Ja – der SQL-Text besteht nur aus festen Bausteinen, Benutzereingaben reisen als Parameter", "Nur mit QUOTENAME", "Nur ohne LIKE"], 1, "Dynamisch zusammengesetzt, aber ohne Benutzerdaten im Text."],
 ["dba-inj", "Welche zusätzliche Maßnahme begrenzt den Schaden, falls doch eine Injection gelingt?", ["Längere Tabellennamen", "Minimale Rechte für das App-Login (nur EXECUTE auf Prozeduren)", "Mehr Indizes", "SET NOCOUNT ON"], 1, "Least Privilege: Ohne Tabellenrechte kann eingeschleuster Code wenig anrichten."],
 // dba-json
 ["dba-json", "JSON_VALUE(attribute, '$.tags') auf {\"tags\":[\"audio\"]} liefert …", ["[\"audio\"]", "audio", "NULL (im Lax-Modus), weil tags kein Skalar ist", "Fehler 547"], 2, "Für Arrays/Objekte JSON_QUERY verwenden."],
 ["dba-json", "Was bewirkt JSON_MODIFY(@j, 'append $.tags', 'neu')?", ["Ersetzt das Array durch 'neu'", "Hängt 'neu' als Element an das Array tags an", "Löscht tags", "Fügt ein neues Objekt 'append' ein"], 1, "Mit append wird an ein Array angehängt."],
 ["dba-json", "Wozu dient INCLUDE_NULL_VALUES bei FOR JSON?", ["NULL-Spalten werden als \"feld\": null ausgegeben statt weggelassen", "NULL wird zu 0", "Leere Arrays werden entfernt", "Es erzwingt ein Array"], 0, "Sonst fehlen Felder mit NULL ganz – für einen festen API-Vertrag ungünstig."],
 ["dba-json", "Ein Alias [preis.brutto] in FOR JSON PATH erzeugt …", ["ein Feld mit Punkt im Namen", "ein Unterobjekt preis mit dem Feld brutto", "einen Fehler", "ein Array"], 1, "PATH interpretiert Punkte als Verschachtelung."],
 // dba-proc
 ["dba-proc", "Was kommt im Vorgehensmodell nach „Anforderungen analysieren“?", ["Code-Review", "Datenmodell planen und konstruieren", "Funktionen testen", "Deployment"], 1, "Anforderungen → Datenmodell → Funktionen."],
 ["dba-proc", "Bei „Artikel bewerten, je Artikel nur einmal pro Kunde“ – wie setzt man „nur einmal“ am besten um?", ["Prüfung in der App", "Zusammengesetzter Primärschlüssel (kdnr, artnr)", "Trigger, der Duplikate löscht", "Cursor"], 1, "Deklarativ: Duplikate werden vom DBMS abgewiesen (Fehler 2627)."],
 ["dba-proc", "Welche Frage stellt ein gutes Code-Review an jede Prozedur?", ["Ist sie möglichst lang?", "Was passiert bei mehreren Zeilen, bei Fehlern und bei ungültigen Eingaben?", "Verwendet sie einen Cursor?", "Hat sie PRINT-Ausgaben?"], 1, "Mehrzeilenfähigkeit, Fehlerbehandlung und Eingabeprüfung sind die Kernpunkte."],
 ["dba-proc", "Warum ist PRINT als Rückmeldung an die App ungeeignet?", ["PRINT ist verboten", "PRINT-Meldungen kommen nicht im JSON/OUTPUT an; die App sieht nur Rückgabewerte, Resultsets und Fehler", "PRINT rollt Transaktionen zurück", "PRINT ist zu langsam"], 1, "Rückmeldungen gehören in den definierten JSON-Vertrag."],
 // dba-proj
 ["dba-proj", "Warum verwendet man im Wrapper TRY_CAST(JSON_VALUE(@input, '$.artnr') AS INT)?", ["Damit das JSON gültig wird", "Ungültige Werte wie \"abc\" liefern NULL statt eines Konvertierungsfehlers – man kann gezielt einen eigenen Fehler werfen", "Damit artnr ein String bleibt", "TRY_CAST ist schneller als CAST"], 1, "So entsteht eine verständliche Fehlermeldung im einheitlichen Format."],
 ["dba-proj", "Welche Testfälle gehören mindestens zu einem neuen typ im Wrapper?", ["Nur der Erfolgsfall", "Erfolgsfall, Grenzfall (z. B. keine Daten) und Fehlerfall (ungültige/fehlende Eingabe)", "Nur ungültiges JSON", "Keiner, die API testet"], 1, "Gut-, Grenz- und Fehlerfall zeigen, dass der Vertrag eingehalten wird."],
 ["dba-proj", "Woher bekommt die App bei einem Fehler im Wrapper die Fehlernummer?", ["Aus PRINT", "Aus dem CATCH-Block, der ERROR_NUMBER() und ERROR_MESSAGE() ins Antwort-JSON schreibt", "Aus @@ROWCOUNT", "Gar nicht"], 1, "{ok:false, fehlercode: ERROR_NUMBER(), fehler: ERROR_MESSAGE()}."],
 ["dba-proj", "Wie liefert der Wrapper eine Liste (z. B. Lagerstände) im Feld ergebnis?", ["Als kommagetrennter String", "Als Unterabfrage mit FOR JSON PATH, die ein Array erzeugt", "Mit PRINT", "Mit einem Cursor, der JSON zusammenbaut"], 1, "Verschachteltes FOR JSON PATH erzeugt ein echtes JSON-Array."]
];
const questions = Q.map(([topic, q, opts, a, why], i) => ({ id: "px-dbaent-" + (i + 1), topic, q: esc(q), opts: opts.map(esc), a, why: esc(why), ex: "" }));

const FC = [
 ["dba-sql", "Anti-Join", "Zeilen ohne Partner finden: LEFT JOIN … WHERE rechts.schluessel IS NULL oder NOT EXISTS (NULL-sicher)."],
 ["dba-sql", "COUNT(*) vs. COUNT(spalte)", "COUNT(*) zählt alle Zeilen, COUNT(spalte) nur Nicht-NULL-Werte – wichtig nach LEFT JOIN."],
 ["dba-sql", "ROW_NUMBER, RANK, DENSE_RANK bei Gleichstand", "ROW_NUMBER: 1, 2, 3 · RANK: 1, 2, 2, 4 · DENSE_RANK: 1, 2, 2, 3."],
 ["dba-server", "Roundtrip-Formel", "Client-Logik: n · (RTT + t_exec). Prozedur: RTT + n · t_exec. Ersparnis = (n − 1) · RTT."],
 ["dba-tx", "Lost Update", "Zwei Sitzungen lesen denselben Wert und schreiben nacheinander – die zweite überschreibt die erste. Lösung: Prüfen und Ändern in einem UPDATE (unter Sperre)."],
 ["dba-tx", "SET XACT_ABORT ON", "Laufzeitfehler brechen den Batch ab und rollen die gesamte offene Transaktion zurück."],
 ["dba-trigger", "Trigger bei 0 Zeilen", "Statement-Trigger feuern auch, wenn keine Zeile betroffen ist – inserted/deleted sind dann leer."],
 ["dba-inj", "sp_executesql richtig", "EXEC sp_executesql @sql, N'@p NVARCHAR(100)', @p = @wert; – Wert als Parameter, nie im Text verkettet."],
 ["dba-json", "INCLUDE_NULL_VALUES", "FOR JSON gibt NULL-Felder als null aus, statt sie wegzulassen – für feste API-Verträge."],
 ["dba-sec", "EXECUTE AS USER … REVERT", "Rechte eines Benutzers testen, indem man vorübergehend in seinem Kontext arbeitet."]
];
const flashcards = FC.map(([topic, front, back], i) => ({ id: "px-dbaent-f" + (i + 1), cat: "DB-AENT", topic, front, back }));

window.STUDYOS_EXT = window.STUDYOS_EXT || {};
(window.STUDYOS_EXT["dbaent"] = window.STUDYOS_EXT["dbaent"] || []).push({ id: "dbaent-plus", blocks: BLOCKS, questions, flashcards });
})();
