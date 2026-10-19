/* MAPPDEV · Plus: Rechner (Bit-Operatoren, Division & Rest), Schritt-Animationen (Null Safety, Collection-Ketten,
   Closures, Exceptions, Referenzen, dynamisches Binden), durchgerechnete Beispiele je Lektion und zusätzliche Fragen */
(function () {
const C = window.STUDYOS_CALC = window.STUDYOS_CALC || {};
const FIG = window.STUDYOS_FIG = window.STUDYOS_FIG || {};
const FX = window.FX;
const { svg, g, t, tl, r, box, l } = FX;
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const S = s => "<pre><code>" + esc(s) + "</code></pre>";
const ind = s => esc(s).replace(/^ +/, m => "\u00a0".repeat(m.length));
const nf = (n, d = 1) => n.toLocaleString("de-AT", { maximumFractionDigits: d });

/* ===================== Rechner ===================== */
const bin = (n, w = 8) => (n >>> 0).toString(2).padStart(w, "0");
C["mappdev-bits"] = {
  title: "Bit-Operatoren in Kotlin: and, or, xor, shl, shr",
  intro: "Zwei Zahlen zwischen 0 und 255 (8 Bit). Die Ausgabe zeigt Dezimalwert und Binärdarstellung – so wie <code>toString(2)</code> sie liefert (ohne führende Nullen).",
  inputs: [
    { k: "a", label: "a", v: 22, min: 0, max: 255, step: 1 },
    { k: "b", label: "b", v: 37, min: 0, max: 255, step: 1 },
    { k: "n", label: "Shift um n Stellen", v: 1, min: 0, max: 7, step: 1 }
  ],
  out: v => { const a = Math.round(v.a), b = Math.round(v.b), n = Math.round(v.n);
    return [["a and b", (a & b) + " = " + (a & b).toString(2), "", true], ["a or b", (a | b) + " = " + (a | b).toString(2)], ["a xor b", (a ^ b) + " = " + (a ^ b).toString(2)], ["a shl " + n, (a << n) + " = " + (a << n).toString(2)], ["a shr " + n, (a >> n) + " = " + (a >> n).toString(2)]]; },
  steps: v => { const a = Math.round(v.a), b = Math.round(v.b), n = Math.round(v.n), row = (lab, x) => `<tr><td>${lab}</td><td><code>${bin(x, 9)}</code></td><td>${x}</td></tr>`;
    return `<table class="dt"><tr><th></th><th>Bits</th><th>dezimal</th></tr>${row("a", a)}${row("b", b)}${row("a and b (beide 1)", a & b)}${row("a or b (mind. eine 1)", a | b)}${row("a xor b (genau eine 1)", a ^ b)}${row("a shl " + n + " (× 2<sup>" + n + "</sup>)", a << n)}${row("a shr " + n + " (÷ 2<sup>" + n + "</sup>, abgerundet)", a >> n)}</table>
    Kontrolle Shift: ${a} · 2<sup>${n}</sup> = ${a * Math.pow(2, n)}, ${a} / 2<sup>${n}</sup> = ${nf(a / Math.pow(2, n), 3)} → ganzzahlig ${a >> n}.<br><small>In Go: <code>&amp; | ^ &lt;&lt; &gt;&gt;</code>. In Kotlin sind es Infix-Funktionen: <code>a and b</code>, <code>a shl 1</code>.</small>`; },
  plot: { bars: v => { const a = Math.round(v.a), b = Math.round(v.b), n = Math.round(v.n); return [{ label: "a", y: a }, { label: "b", y: b }, { label: "and", y: a & b }, { label: "or", y: a | b }, { label: "xor", y: a ^ b }, { label: "shl", y: a << n }, { label: "shr", y: a >> n }]; } }
};

const rem = (a, b) => a % b, kmod = (a, b) => { const x = a % b; return x !== 0 && Math.sign(x) !== Math.sign(b) ? x + b : x; };
C["mappdev-div"] = {
  title: "Ganzzahl-Division: /, %, mod und floorDiv",
  intro: "Bei zwei Int-Werten rechnet Kotlin ganzzahlig. Interessant wird es bei negativen Zahlen: <code>%</code> (rem) übernimmt das Vorzeichen des Dividenden, <code>mod</code> das des Divisors. Probier a = −7, b = 2.",
  inputs: [
    { k: "a", label: "a (Dividend)", v: -7, min: -50, max: 50, step: 1 },
    { k: "b", label: "b (Divisor, ≠ 0)", v: 2, min: -10, max: 10, step: 1 }
  ],
  out: v => { const a = Math.round(v.a), b = Math.round(v.b);
    if (b === 0) return [["a / b", "ArithmeticException: / by zero", "", true], ["a / b.toDouble()", a === 0 ? "NaN" : a > 0 ? "Infinity" : "-Infinity"]];
    return [["a / b", Math.trunc(a / b), "", true], ["a % b (rem)", rem(a, b)], ["a.mod(b)", kmod(a, b)], ["a.floorDiv(b)", Math.floor(a / b)], ["a / b.toDouble()", Number((a / b).toFixed(6)).toLocaleString("en-US", { maximumFractionDigits: 6 })]]; },
  steps: v => { const a = Math.round(v.a), b = Math.round(v.b); if (b === 0) return "Division durch 0 ist bei Int ein Laufzeitfehler (<code>ArithmeticException</code>), bei Double ergibt sie Infinity oder NaN.";
    const q = Math.trunc(a / b), fq = Math.floor(a / b);
    return `a / b = ${a} / ${b} = ${nf(a / b, 4)} → <b>Richtung 0 abgeschnitten: ${q}</b><br>
    a % b = a − (a / b) · b = ${a} − (${q}) · ${b} = <b>${rem(a, b)}</b> (Vorzeichen wie a)<br>
    a.floorDiv(b) = abgerundet: <b>${fq}</b><br>
    a.mod(b) = a − floorDiv · b = ${a} − (${fq}) · ${b} = <b>${kmod(a, b)}</b> (Vorzeichen wie b)<br>
    <small>Für „ist gerade?“ funktioniert <code>x % 2 == 0</code> auch bei negativen Zahlen; <code>x % 2 == 1</code> erkennt −7 aber <i>nicht</i> als ungerade (−7 % 2 = −1).</small>`; },
  plot: { x: v => { const b = Math.abs(Math.round(v.b)) || 1; return [-3 * b - 1, 3 * b + 1]; }, xl: "a", yl: "Rest",
    fns: [{ label: "a % b (rem)", f: (x, v) => { const b = Math.round(v.b); return b ? rem(Math.trunc(x), b) : NaN; } }, { label: "a.mod(b)", f: (x, v) => { const b = Math.round(v.b); return b ? kmod(Math.trunc(x), b) : NaN; } }],
    points: v => { const a = Math.round(v.a), b = Math.round(v.b); return b ? [{ x: a, y: rem(a, b), label: "a % b" }] : []; } }
};

/* ===================== Animationen ===================== */
FIG["mappdev-null"] = { title: "Safe Call und Elvis: user?.address?.city ?: \"unbekannt\"",
  svg: () => { const Y = 118;
    return svg(640, 300,
      box(14, 12, 612, 32, "val city = user?.address?.city ?: \"unbekannt\"", { fs: 13, cls: "fx-soft" }) +
      g({ on: "0,1,2,3,5" }, t(14, 70, "Fall A: user = User(\"Lisa\", address = null)", { a: "start", fs: 12, fw: 700 })) +
      g({ on: "4" }, t(14, 70, "Fall B: user = User(\"Max\", address = Address(\"Graz\"))", { a: "start", fs: 12, fw: 700 })) +
      box(14, Y - 18, 120, 44, "user", { fs: 12.5, cls: "fx-card", hl: "1" }) +
      t(160, Y - 4, "?.", { fs: 15, fw: 700, cls: "fx-sub" }) + l(136, Y + 4, 186, Y + 4, { arrow: true }) +
      box(188, Y - 18, 130, 44, "address", { fs: 12.5, cls: "fx-card", hl: "2,4" }) +
      t(344, Y - 4, "?.", { fs: 15, fw: 700, cls: "fx-sub" }) + l(320, Y + 4, 370, Y + 4, { arrow: true }) +
      box(372, Y - 18, 110, 44, "city", { fs: 12.5, cls: "fx-card", hl: "4" }) +
      t(508, Y - 4, "?:", { fs: 15, fw: 700, cls: "fx-sub" }) + l(484, Y + 4, 532, Y + 4, { arrow: true }) +
      box(534, Y - 18, 92, 44, "Ergebnis", { fs: 12.5, cls: "fx-soft", hl: "3,4" }) +
      g({ st: 1, on: "1,2,3" }, box(14, 150, 120, 36, "User(\"Lisa\")", { fs: 11.5, cls: "fx-ok" })) +
      g({ on: "2,3" }, box(188, 150, 130, 36, "null", { fs: 12, cls: "fx-bad" }) + box(372, 150, 110, 36, "nicht ausgewertet", { fs: 10.5, cls: "fx-ghost" })) +
      g({ on: "3" }, box(534, 150, 92, 36, "\"unbekannt\"", { fs: 11.5, cls: "fx-ok" })) +
      g({ on: "4" }, box(14, 150, 120, 36, "User(\"Max\")", { fs: 11.5, cls: "fx-ok" }) + box(188, 150, 130, 36, "Address(\"Graz\")", { fs: 11.5, cls: "fx-ok" }) + box(372, 150, 110, 36, "\"Graz\"", { fs: 12, cls: "fx-ok" }) + box(534, 150, 92, 36, "\"Graz\"", { fs: 12, cls: "fx-ok" })) +
      g({ on: "5" }, box(14, 150, 612, 36, "user!!.address!!.city   →   address ist null   →   NullPointerException", { fs: 12, cls: "fx-bad" })) +
      r(14, 206, 612, 80, { cls: "fx-card" }) +
      [["0", "Der Typ von city ist String (nicht String?), weil ?: den null-Fall ersetzt."], ["1", "user ist nicht null → der Safe Call geht weiter zu address."], ["2", "address ist null → ?. bricht ab: Der ganze Rest der Kette ergibt null, city wird gar nicht gelesen."], ["3", "Links vom Elvis steht null → der rechte Wert \"unbekannt\" wird verwendet."], ["4", "Alles vorhanden → die Kette liefert \"Graz\", der Elvis-Operator greift nicht."], ["5", "!! verspricht „ist nie null“ – im Fall A ist das gelogen und die App stürzt ab."]].map(([on, s]) => g({ on }, tl(320, 250, s, { fs: 12 }))).join(""));
  },
  steps: [
    "Ausgangslage: <code>user</code> hat den Typ <code>User?</code>, <code>address</code> ist <code>Address?</code>. Die Kette prüft jeden Schritt auf null.",
    "Fall A: <code>user</code> ist ein echtes Objekt (Lisa). Der Safe Call <code>?.</code> greift also auf <code>address</code> zu.",
    "Lisa hat keine Adresse: <code>address</code> ist null. <code>?.city</code> wird nicht ausgeführt, die gesamte Kette ergibt <b>null</b> – ohne Absturz.",
    "Der Elvis-Operator <code>?:</code> ersetzt null durch den rechten Wert. Ergebnis: <code>\"unbekannt\"</code>.",
    "Fall B: Max wohnt in Graz. Jeder Schritt liefert einen Wert, das Ergebnis ist <code>\"Graz\"</code>; der rechte Teil des Elvis wird nicht ausgewertet.",
    "Zum Vergleich: <code>user!!.address!!.city</code> wirft im Fall A eine <b>NullPointerException</b>. <code>!!</code> ist eine Garantie, keine Prüfung."
  ] };

FIG["mappdev-chain"] = { title: "Collection-Kette: filter → map → fold",
  svg: () => { const X = [16, 176, 336, 496], W = 128, chip = (x, y, s, o = {}) => box(x + 24, y, 80, 24, s, Object.assign({ fs: 12, rx: 12 }, o));
    return svg(640, 300,
      box(16, 10, 608, 30, "(1..6).filter { it % 2 == 0 }.map { it * it }.fold(0) { acc, x -> acc + x }".replace(">", "&gt;"), { fs: 12, cls: "fx-soft" }) +
      ["1..6", "filter", "map", "fold(0)"].map((s, i) => g({ st: i }, t(X[i] + W / 2, 64, s, { fs: 12.5, fw: 700 }) + (i < 3 ? l(X[i] + W - 6, 140, X[i + 1] + 6, 140, { arrow: true, st: i + 1 }) : ""))).join("") +
      [1, 2, 3, 4, 5, 6].map((n, i) => chip(X[0], 74 + i * 30, String(n), { cls: n % 2 ? "fx-card" : "fx-soft", hl: n % 2 ? "1" : undefined })).join("") +
      [2, 4, 6].map((n, i) => g({ st: 1 }, chip(X[1], 74 + i * 30, String(n), { cls: "fx-soft" }))).join("") +
      g({ on: "1" }, tl(X[1] + W / 2, 198, "1, 3, 5 fallen weg|(Prädikat false)", { fs: 11, lh: 15, cls: "fx-sub" })) +
      [4, 16, 36].map((n, i) => g({ st: 2 }, chip(X[2], 74 + i * 30, String(n), { cls: "fx-soft", hl: String(i + 3) }))).join("") +
      g({ on: "2" }, tl(X[2] + W / 2, 198, "gleich viele Elemente,|jedes quadriert", { fs: 11, lh: 15, cls: "fx-sub" })) +
      g({ st: 3 }, r(X[3], 74, W, 120, { cls: "fx-card" }) + t(X[3] + W / 2, 94, "acc", { fs: 11, cls: "fx-sub" }) +
        [["0 + 4 = 4", "3"], ["4 + 16 = 20", "4"], ["20 + 36 = 56", "5,6"]].map(([s, on]) => t(X[3] + W / 2, 140, s, { fs: 13, fw: 700, on })).join("") +
        t(X[3] + W / 2, 178, "Startwert 0", { fs: 11, cls: "fx-sub" })) +
      g({ st: 6 }, r(16, 232, 608, 54, { cls: "fx-ok" }) + tl(320, 259, "Ergebnis: 56 (Int). Jeder Schritt liefert eine neue Collection –|die ursprüngliche Range 1..6 bleibt unverändert.", { fs: 12, lh: 17 })));
  },
  steps: [
    "Ausgangspunkt ist die Range <code>1..6</code> (beide Grenzen inklusive): 1, 2, 3, 4, 5, 6.",
    "<code>filter { it % 2 == 0 }</code> behält nur Elemente, für die das Prädikat true ist: <b>[2, 4, 6]</b>. Typ bleibt <code>List&lt;Int&gt;</code>.",
    "<code>map { it * it }</code> verwandelt jedes Element: <b>[4, 16, 36]</b> – gleich viele Elemente wie vorher.",
    "<code>fold(0)</code> startet mit acc = 0 und verarbeitet das erste Element: 0 + 4 = 4.",
    "Zweites Element: acc = 4, x = 16 → 20.",
    "Drittes Element: acc = 20, x = 36 → <b>56</b>. Das ist der Rückgabewert von fold.",
    "Ergebnis: <code>56</code>. Keine Schleife, keine veränderliche Variable – und die Ausgangsdaten bleiben unverändert."
  ] };

FIG["mappdev-closure"] = { title: "Closures: jede Funktion merkt sich ihre eigene Variable",
  svg: () => { const code = ["fun makeCounter(): () -> Int {", "    var count = 0", "    return { count += 1; count }", "}", "val c1 = makeCounter()", "val c2 = makeCounter()", "println(c1())", "println(c1())", "println(c2())"];
    const hl = { 4: "1", 5: "2", 6: "3", 7: "4", 8: "5" };
    return svg(640, 300,
      code.map((s, i) => g({ hl: hl[i] }, r(14, 10 + i * 30, 300, 26, { rx: 4, cls: i < 4 ? "fx-soft" : "fx-card" }) + t(24, 28 + i * 30, ind(s), { a: "start", fs: 12 }))).join("") +
      g({ st: 1 }, box(350, 30, 120, 36, "c1 (Lambda)", { fs: 12, cls: "fx-acc" }) + l(410, 66, 410, 92, { arrow: true }) + r(350, 94, 120, 60, { cls: "fx-card" }) + t(410, 114, "eingefangen:", { fs: 11, cls: "fx-sub" }) +
        [["count = 0", "1,2"], ["count = 1", "3"], ["count = 2", "4,5,6"]].map(([s, on]) => t(410, 140, s, { fs: 13, fw: 700, on })).join("")) +
      g({ st: 2 }, box(500, 30, 120, 36, "c2 (Lambda)", { fs: 12, cls: "fx-acc" }) + l(560, 66, 560, 92, { arrow: true }) + r(500, 94, 120, 60, { cls: "fx-card" }) + t(560, 114, "eingefangen:", { fs: 11, cls: "fx-sub" }) +
        [["count = 0", "2,3,4"], ["count = 1", "5,6"]].map(([s, on]) => t(560, 140, s, { fs: 13, fw: 700, on })).join("")) +
      r(350, 176, 270, 110, { cls: "fx-card" }) + t(485, 196, "Konsole", { fs: 11.5, fw: 700 }) +
      g({ st: 3 }, t(370, 222, "1", { a: "start", fs: 13 })) + g({ st: 4 }, t(370, 244, "2", { a: "start", fs: 13 })) + g({ st: 5 }, t(370, 266, "1", { a: "start", fs: 13 })) +
      g({ on: "0" }, tl(485, 236, "Noch nichts ausgegeben", { fs: 11.5, cls: "fx-sub" })));
  },
  steps: [
    "<code>makeCounter</code> liefert eine Funktion vom Typ <code>() -&gt; Int</code> zurück. Die lokale Variable <code>count</code> wird im Lambda verwendet.",
    "<code>c1 = makeCounter()</code>: Ein Lambda entsteht und <b>fängt</b> sein eigenes <code>count</code> (0) ein – obwohl <code>makeCounter</code> schon fertig ist, lebt die Variable weiter.",
    "<code>c2 = makeCounter()</code>: ein zweiter, unabhängiger Aufruf – mit einem eigenen <code>count</code>.",
    "<code>c1()</code> erhöht <i>sein</i> count auf 1 und liefert 1.",
    "<code>c1()</code> noch einmal: 2. Die Variable bleibt zwischen den Aufrufen erhalten.",
    "<code>c2()</code> liefert 1 – c2 hat von c1 nichts mitbekommen. Ausgabe insgesamt: 1, 2, 1. Genau das ist eine <b>Closure</b>: Funktion + eingefangene Umgebung.",
  ] };

FIG["mappdev-exc"] = { title: "try / catch / finally – drei Eingaben, drei Wege",
  svg: () => { const code = ["fun parseQty(input: String): Int {", "    try {", "        val n = input.toInt()", "        require(n > 0) { \"Menge muss > 0 sein\" }", "        return n", "    } catch (e: NumberFormatException) {", "        println(\"Keine Zahl: $input\")", "        return 0", "    } finally {", "        println(\"geprüft: $input\")", "    }", "}"];
    const hl = { 2: "1,2,3", 3: "1,3", 4: "1", 5: "2", 6: "2", 7: "2", 9: "1,2,3" };
    return svg(640, 300,
      code.map((s, i) => g({ hl: hl[i] }, r(14, 8 + i * 24, 360, 21, { rx: 4, cls: "fx-card" }) + t(22, 23 + i * 24, ind(s), { a: "start", fs: 11 }))).join("") +
      [["1", "parseQty(\"3\")", "toInt → 3, require ok|finally → „geprüft: 3“|Rückgabe 3", "fx-ok"], ["2", "parseQty(\"12a\")", "toInt wirft NumberFormatException|catch → „Keine Zahl“, finally|Rückgabe 0", "fx-warn"], ["3", "parseQty(\"-2\")", "require wirft IllegalArgumentException|kein passender catch, finally läuft|Exception geht an den Aufrufer", "fx-bad"]].map(([on, h, s, cls]) =>
        g({ on }, t(507, 30, h, { fs: 13, fw: 700 }) + box(392, 46, 232, 96, s, { fs: 11, lh: 17, cls }))).join("") +
      g({ on: "0" }, tl(507, 90, "Welche Zeilen laufen|bei welcher Eingabe?", { fs: 12.5, lh: 18, cls: "fx-sub" })) +
      g({ on: "4" }, box(392, 46, 232, 96, "finally läuft immer – auch|nach return und auch, wenn|die Exception weiterfliegt.", { fs: 11.5, lh: 17, cls: "fx-soft" })) +
      g({ st: 1 }, r(392, 160, 232, 124, { cls: "fx-card" }) + t(508, 180, "Konsole", { fs: 11.5, fw: 700 }) +
        g({ on: "1" }, tl(508, 222, "geprüft: 3", { fs: 12 })) +
        g({ on: "2" }, tl(508, 222, "Keine Zahl: 12a|geprüft: 12a", { fs: 12, lh: 18 })) +
        g({ on: "3,4" }, tl(508, 222, "geprüft: -2|Exception in thread \"main\"|IllegalArgumentException", { fs: 11, lh: 17 }))));
  },
  steps: [
    "Die Funktion wandelt eine Benutzereingabe in eine Menge um. Spiel drei Eingaben durch.",
    "<b>\"3\"</b>: <code>toInt()</code> gelingt, <code>require</code> ist erfüllt, <code>return 3</code>. Vor dem Verlassen läuft noch <code>finally</code>.",
    "<b>\"12a\"</b>: <code>toInt()</code> wirft eine <code>NumberFormatException</code>. Der passende catch-Block fängt sie, gibt 0 zurück – und auch hier läuft finally.",
    "<b>\"-2\"</b>: <code>toInt()</code> klappt, aber <code>require</code> wirft eine <code>IllegalArgumentException</code>. Der catch-Block passt nicht (falscher Typ), finally läuft, dann fliegt die Exception zum Aufrufer weiter.",
    "Merke: catch fängt nur den angegebenen Typ (und Unterklassen). <code>finally</code> läuft in jedem Fall – ideal zum Aufräumen (Datei schließen, Ladeanzeige ausblenden)."
  ] };

FIG["mappdev-ref"] = { title: "Referenzen: zwei Variablen, ein Objekt",
  svg: () => svg(640, 300,
    t(90, 24, "Variablen", { fs: 12, fw: 700 }) + t(430, 24, "Objekte im Speicher (Heap)", { fs: 12, fw: 700 }) +
    box(30, 50, 120, 38, "val a", { fs: 13, cls: "fx-soft" }) +
    g({ st: 1 }, box(30, 110, 120, 38, "val b", { fs: 13, cls: "fx-soft" })) +
    g({ st: 3 }, box(30, 190, 120, 38, "val c", { fs: 13, cls: "fx-soft" })) +
    r(300, 44, 260, 96, { cls: "fx-card" }) + t(430, 66, "BankAccount #1", { fs: 12, fw: 700 }) + t(430, 86, "number = 1", { fs: 12 }) +
    [["balance = 100.0", "0,1"], ["balance = 150.0", "2,3,4"]].map(([s, on]) => t(430, 110, s, { fs: 13, fw: 700, on })).join("") +
    l(150, 69, 298, 80, { arrow: true, cls: "acc" }) + g({ st: 1 }, l(150, 129, 298, 104, { arrow: true, cls: "acc" })) +
    g({ st: 3 }, r(300, 172, 260, 74, { cls: "fx-card" }) + t(430, 194, "BankAccount #2", { fs: 12, fw: 700 }) + t(430, 214, "number = 1, balance = 150.0", { fs: 12 }) + l(150, 209, 298, 209, { arrow: true, cls: "acc" })) +
    g({ on: "2" }, box(300, 186, 260, 50, "b.deposit(50.0) ändert #1 –|a sieht die Änderung auch", { fs: 11.5, lh: 16, cls: "fx-warn" })) +
    g({ on: "4" }, r(14, 256, 612, 36, { cls: "fx-soft" }) + t(320, 279, "a === b → true   ·   a === c → false   ·   a == c → false (normale Klasse) / true (data class)", { fs: 12 }))),
  steps: [
    "<code>val a = BankAccount(1, 100.0)</code> erzeugt ein Objekt. <code>a</code> speichert nicht das Objekt selbst, sondern eine <b>Referenz</b> darauf.",
    "<code>val b = a</code> kopiert nur die Referenz. Es gibt weiterhin <b>ein</b> Objekt, auf das jetzt zwei Variablen zeigen.",
    "<code>b.deposit(50.0)</code> ändert den Zustand des Objekts. Weil a auf dasselbe Objekt zeigt, liefert auch <code>a.balance</code> jetzt 150.0. <code>val</code> verhindert nur das Umhängen der Referenz, nicht Änderungen am Objekt.",
    "<code>val c = BankAccount(1, 150.0)</code> erzeugt ein <b>zweites</b> Objekt mit gleichem Inhalt, aber eigener Identität.",
    "<code>===</code> vergleicht Identität (dasselbe Objekt?), <code>==</code> ruft <code>equals</code> auf. Ohne eigenes equals ist das bei einer normalen Klasse ebenfalls ein Identitätsvergleich – erst eine <code>data class</code> vergleicht die Inhalte."
  ] };

FIG["mappdev-dispatch"] = { title: "Polymorphismus: welches area() läuft wirklich?",
  svg: () => svg(640, 300,
    box(14, 10, 612, 30, "val shapes: List<Shape> = listOf(Circle(1.0), Rectangle(2.0, 3.0), Square(2.0))".replace("<", "&lt;").replace(">", "&gt;"), { fs: 12, cls: "fx-soft" }) +
    t(110, 64, "for (s in shapes) println(s.area())", { fs: 11.5, fw: 700 }) +
    [["Circle(1.0)", "1"], ["Rectangle(2.0, 3.0)", "2"], ["Square(2.0)", "3"]].map(([s, hl], i) => box(14, 76 + i * 50, 196, 38, "s: Shape → " + s, { fs: 11.5, cls: "fx-card", hl })).join("") +
    box(400, 52, 200, 40, "abstract class Shape|abstract fun area(): Double", { fs: 11, lh: 15, cls: "fx-soft", hl: "4" }) +
    box(260, 128, 168, 54, "Circle|override fun area() =|PI * r * r", { fs: 11, lh: 15, cls: "fx-card", hl: "1" }) +
    box(452, 128, 168, 54, "open class Rectangle|override fun area() =|w * h", { fs: 11, lh: 15, cls: "fx-card", hl: "2,3" }) +
    box(452, 210, 168, 40, "Square : Rectangle|(kein eigenes area)", { fs: 11, lh: 15, cls: "fx-card", hl: "3" }) +
    l(344, 128, 470, 92, { arrow: true }) + l(536, 128, 510, 92, { arrow: true }) + l(536, 210, 536, 182, { arrow: true }) +
    r(14, 236, 420, 50, { cls: "fx-card" }) +
    [["0", "Statischer Typ von s: Shape – der Compiler kennt nur area()."], ["1", "Laufzeittyp Circle → Circle.area() → 3.14159…"], ["2", "Laufzeittyp Rectangle → Rectangle.area() → 6.0"], ["3", "Square erbt area() von Rectangle → 2.0 · 2.0 = 4.0"], ["4", "s.r → Compilerfehler. Erst nach if (s is Circle) ist s.r erlaubt."]].map(([on, s]) => g({ on }, t(224, 266, s, { fs: 11.5 }))).join("")),
  steps: [
    "Eine Liste mit dem statischen Typ <code>List&lt;Shape&gt;</code> enthält Objekte verschiedener Unterklassen. Die Schleife ruft für jedes <code>s.area()</code> auf.",
    "Erstes Element: Das Objekt ist zur Laufzeit ein <code>Circle</code>. Aufgerufen wird <b>Circle.area()</b>: π · 1 · 1 ≈ 3.14.",
    "Zweites Element: ein <code>Rectangle</code> → <b>Rectangle.area()</b> = 2.0 · 3.0 = 6.0.",
    "Drittes Element: <code>Square</code> überschreibt area() nicht. Gesucht wird nach oben in der Hierarchie – <b>Rectangle.area()</b> mit w = h = 2.0 → 4.0.",
    "Welche Methode läuft, entscheidet die <b>Laufzeit</b> (dynamisches Binden). Was überhaupt aufrufbar ist, entscheidet der <b>Compiler</b> anhand des statischen Typs Shape – deshalb braucht <code>s.r</code> erst einen Typcheck mit <code>is</code> (Smart Cast)."
  ] };

/* ===================== Beispiele je Lektion ===================== */
const ex = (title, html, label) => ({ t: "example", label: label || "Beispiel aus der Praxis", title, html });
const BLOCKS = {
  "mad1-2": [ex("Java-Bibliotheken direkt aus Kotlin nutzen", `Kotlin läuft auf der JVM – jede Java-Klasse ist sofort verwendbar, ohne Wrapper:` + S(`import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.util.UUID

fun main() {
    val abgabe = LocalDate.of(2027, 1, 25)            // Java-Klasse
    val heute = LocalDate.of(2026, 10, 19)
    val tage = ChronoUnit.DAYS.between(heute, abgabe) // Java-Methode
    println("Noch $tage Tage bis zur Projektabgabe")  // Noch 98 Tage …
    println("Build-ID: " + UUID.randomUUID())          // z. B. 3f2c…
}`) + `Rechnung: 19.10. → 31.10. = 12 Tage, + 30 (Nov.) + 31 (Dez.) + 25 (Jän.) = <b>98 Tage</b>. Kotlin übernimmt die Java-Getter als Properties: <code>abgabe.year</code> statt <code>abgabe.getYear()</code>. Genau das meint <b>Interoperabilität</b> – und darum kann eine Android-App alte Java-Bibliotheken weiterverwenden.`)],
  "mad1-3": [ex("Refactoring in 60 Sekunden mit drei Shortcuts", `Ausgangscode im Lab:` + S(`fun main() {
    val p = listOf(45.7, 13.0, 145.6)
    var s = 0.0
    for (x in p) s += x * 1.2
    println(s)
}`) + `<ol><li>Cursor auf <code>p</code>, <b>Shift + F6</b> → <code>netPrices</code> (alle Vorkommen werden umbenannt).</li><li>Zeilen 3–4 markieren, <b>Ctrl + Alt + M</b> (Extract Method) → <code>grossTotal(netPrices)</code>.</li><li><b>Alt + Enter</b> auf der Schleife → „Replace with sumOf“ (Intention Action), dann <b>Ctrl + Alt + L</b> (Reformat).</li></ol>` + S(`fun main() {
    val netPrices = listOf(45.7, 13.0, 145.6)
    println(grossTotal(netPrices))      // 245.16
}

fun grossTotal(netPrices: List<Double>) = netPrices.sumOf { it * 1.2 }`) + `(45,7 + 13,0 + 145,6) · 1,2 = 204,3 · 1,2 = 245,16 – ausgegeben wird wegen Gleitkomma eventuell <code>245.16000000000003</code>. Kein Tippen von Hand, kein vergessenes Vorkommen beim Umbenennen.`)],
  "mad2-1": [ex("Konfiguration einer Lern-App: const val, val, var", S(`const val MAX_QUIZ_POINTS = 55          // Compile-Zeit-Konstante, top-level

fun main() {
    val student = "Kevin"                 // ändert sich nicht
    var points = 0                        // ändert sich laufend
    points += 5; points += 4; points += 5 // nach 3 Quizzes: 14
    val ratio = points * 100 / MAX_QUIZ_POINTS
    println("$student: $points/$MAX_QUIZ_POINTS Punkte ($ratio %)")
    // student = "Angi"                   // Fehler: Val cannot be reassigned
    // const val local = 3               // Fehler: const nur top-level/object/companion
}`) + `Ausgabe: <code>Kevin: 14/55 Punkte (25 %)</code> – 14 · 100 / 55 = 1400 / 55 = 25,45…, als Int-Division <b>25</b>. Faustregel aus dem Skript: Zuerst <code>val</code> schreiben und nur dann auf <code>var</code> umstellen, wenn sich der Wert wirklich ändern muss.`)],
  "mad2-2": [{ t: "calc", id: "mappdev-div" }, { t: "calc", id: "mappdev-bits" }, ex("Durchschnitt und Überlauf – zwei stille Fehler", S(`val total = 17
val count = 4
println(total / count)               // 4      (Int-Division!)
println(total / count.toDouble())    // 4.25
println(total.toDouble() / count)    // 4.25

val max = Int.MAX_VALUE              // 2147483647
println(max + 1)                     // -2147483648 (Überlauf, kein Fehler)
println(max.toLong() + 1)            // 2147483648
println(2_000_000_000 + 2_000_000_000)        // -294967296
println(2_000_000_000L + 2_000_000_000)       // 4000000000`) + `Warum −294967296? 4.000.000.000 − 2<sup>32</sup> (4.294.967.296) = <b>−294.967.296</b>: Der Wert „wickelt“ um. Für Summen über 2,1 Mrd. (z. B. Cent-Beträge eines ganzen Jahres) also <code>Long</code> verwenden.`, "Beispiel durchgerechnet")],
  "mad2-3": [ex("String-Werkzeugkasten an einer Matrikelnummer", S(`val id = "ima25-0412"
println(id.uppercase())                 // IMA25-0412
println(id.substring(0, 3))             // ima   (Ende exklusiv)
println(id.split("-"))                  // [ima25, 0412]
println(id.length)                      // 10
println(id[5])                          // -     (Char)
println("7".padStart(4, '0'))           // 0007
val year = id.substring(3, 5).toInt()   // 25
println("Jahrgang 20$year")             // Jahrgang 2025

val a = arrayOf(1, 2, 3); val b = arrayOf(1, 2, 3)
println(a == b)                         // false (verschiedene Arrays)
println(a.contentEquals(b))             // true  (gleicher Inhalt)`) + `Index zählt ab 0: <code>substring(3, 5)</code> nimmt die Zeichen an Position 3 und 4 („25“). <code>id[5]</code> ist ein <code>Char</code> (einfache Hochkommas), kein String.`)],
  "mad2-4": [{ t: "fig", id: "mappdev-null" }, ex("Profilanzeige mit fehlenden Daten", S(`data class Address(val city: String)
data class User(val name: String, val nickname: String?, val address: Address?)

fun greeting(u: User?): String {
    val name = u?.nickname ?: u?.name ?: "Gast"
    val city = u?.address?.city ?: "unbekannt"
    return "Hallo $name aus $city"
}

fun main() {
    println(greeting(User("Lisa", null, null)))               // Hallo Lisa aus unbekannt
    println(greeting(User("Maximilian", "Max", Address("Graz"))))  // Hallo Max aus Graz
    println(greeting(null))                                    // Hallo Gast aus unbekannt
    User("Tom", "T", null).address?.let { println(it.city) }   // gibt nichts aus
}`) + `Elvis-Ketten werden von links nach rechts gelesen: erst der Spitzname, dann der echte Name, zuletzt „Gast“. <code>?.let { }</code> führt den Block nur aus, wenn der Wert nicht null ist – bei Tom passiert deshalb nichts.`)],
  "mad3-1": [ex("Notenschlüssel als when-Ausdruck", S(`fun grade(points: Int): String = when (points) {
    in 273..300 -> "Sehr gut"
    in 243..272 -> "Gut"
    in 213..242 -> "Befriedigend"
    in 183..212 -> "Genügend"
    in 0..182   -> "Nicht genügend"
    else        -> throw IllegalArgumentException("ungültig: $points")
}

fun main() {
    listOf(250, 183, 182, 300).forEach { println("$it → \${grade(it)}") }
    val bonus = if (grade(250) == "Gut") 10 else 0
    println(bonus)
}`) + `Ausgabe: <code>250 → Gut</code>, <code>183 → Genügend</code>, <code>182 → Nicht genügend</code>, <code>300 → Sehr gut</code>, dann <code>10</code>. Weil <code>when</code> hier ein <b>Ausdruck</b> ist, muss er für jeden Int einen Wert liefern – deshalb das <code>else</code>. Auch <code>if</code> liefert einen Wert (<code>bonus</code>), es braucht keinen Ternary-Operator.`)],
  "mad3-2": [ex("Sparziel mit while, Countdown mit downTo", S(`var balance = 500.0
var months = 0
while (balance < 1000) {          // indefinit: Anzahl unbekannt
    balance = balance * 1.01 + 50  // 1 % Zinsen + 50 € Sparrate
    months++
}
println("$months Monate, Stand %.2f".format(balance))

for (i in 10 downTo 0 step 5) print("$i ")   // 10 5 0
println()
for (i in 0 until 3) print("$i ")            // 0 1 2
println()
outer@ for (row in 1..3) {
    for (col in 1..3) {
        if (row * col == 4) break@outer
        print("\${row * col} ")                // 1 2 3 2
    }
}`) + `Monat 1: 500 · 1,01 + 50 = 555,00; Monat 2: 555 · 1,01 + 50 = 610,55; … nach <b>9 Monaten</b> liegt der Stand erstmals über 1.000 € (≈ 1.015,27 €). Bei der Label-Schleife bricht <code>break@outer</code> beide Schleifen ab, sobald 2 · 2 = 4 erreicht ist.`, "Beispiel durchgerechnet")],
  "mad3-3": [ex("Eine Preisfunktion, viele Aufrufe", S(`fun price(net: Double, vat: Double = 0.20, discount: Double = 0.0): Double =
    net * (1 - discount) * (1 + vat)

fun gross(net: Double) = price(net)

fun main() {
    println(price(100.0))                         // 120.0
    println(price(100.0, 0.10))                   // 110.00000000000001
    println(price(100.0, discount = 0.25))        // 90.0
    println(price(discount = 0.5, net = 40.0))    // 24.0
    println(listOf(10.0, 25.0).map(::gross))      // [12.0, 30.0]
}`) + `<code>price(100.0, discount = 0.25)</code>: 100 · 0,75 · 1,2 = <b>90</b>. Mit benannten Parametern darf man Default-Werte überspringen und sogar die Reihenfolge ändern. <code>::gross</code> ist eine <b>Funktionsreferenz</b> – die Funktion wird als Wert an <code>map</code> übergeben, statt ein Lambda zu schreiben. Das <code>…00000000000001</code> ist kein Kotlin-Fehler, sondern Gleitkomma-Darstellung.`)],
  "mad3-4": [{ t: "fig", id: "mappdev-closure" }, ex("Currying: Mehrwertsteuer vorkonfigurieren", S(`fun withVat(rate: Double): (Double) -> Double = { net -> net * (1 + rate) }

val at20 = withVat(0.20)
val at10 = withVat(0.10)

fun main() {
    println(at20(50.0))                           // 60.0
    println(at10(50.0))                           // 55.00000000000001
    val prices = listOf(10.0, 20.0, 30.0)
    println(prices.map(at20))                     // [12.0, 24.0, 36.0]
    println(prices.map { it * 2 }.filter { it > 30 })  // [40.0, 60.0]
    val apply: (Double, (Double) -> Double) -> Double = { x, f -> f(x) }
    println(apply(100.0, at20))                   // 120.0
}`) + `<code>withVat</code> ist eine <b>Higher-Order Function</b>: Sie gibt eine Funktion zurück. Die zurückgegebene Funktion merkt sich <code>rate</code> (Closure). Aus einer Funktion mit „zwei Eingaben“ (Satz, Nettobetrag) werden zwei Schritte mit je einer Eingabe – das ist <b>Currying</b>.`)],
  "mad3-5": [{ t: "fig", id: "mappdev-exc" }, ex("try als Ausdruck für eine Mengeneingabe", S(`fun readQty(s: String): Int = try {
    s.trim().toInt()
} catch (e: NumberFormatException) {
    1                                // Standardmenge
}

fun main() {
    for (s in listOf("5", " 3 ", "x", "")) println("'$s' → \${readQty(s)}")
    println("12a".toIntOrNull() ?: 0)          // 0 – Alternative ohne try
    val qty = 0
    require(qty > 0) { "Menge muss positiv sein" }   // IllegalArgumentException
}`) + `Ausgabe: <code>'5' → 5</code>, <code>' 3 ' → 3</code>, <code>'x' → 1</code>, <code>'' → 1</code>, dann <code>0</code> und zuletzt eine <code>IllegalArgumentException: Menge muss positiv sein</code>. Weil <code>try</code> in Kotlin ein Ausdruck ist, liefert der letzte Ausdruck des try- bzw. catch-Blocks den Wert – ähnlich wie bei <code>if</code>.`)],
  "mad4-1": [ex("Notenbuch mit Map und Set", S(`val grades = mutableMapOf("MATH2" to 2, "BWL2" to 1)
grades["MAPPDEV"] = 3                       // hinzufügen
grades["MAPPDEV"] = 2                       // überschreiben
println(grades)                             // {MATH2=2, BWL2=1, MAPPDEV=2}
println(grades["DASC"])                     // null (Typ Int?)
println(grades.getOrDefault("DASC", 5))     // 5
println(grades.values.average())            // 1.6666666666666667

val tags = mutableSetOf("kotlin", "android")
tags.add("kotlin")                          // false – schon vorhanden
println(tags.size)                          // 2

val ro = listOf(1, 2, 3)
// ro.add(4)                                // Compilerfehler: List ist read-only
println(ro + 4)                             // [1, 2, 3, 4] – neue Liste`) + `Durchschnitt: (2 + 1 + 2) / 3 = 5 / 3 ≈ <b>1,67</b>. Wichtig für die Prüfung: <code>map[key]</code> liefert immer einen <b>nullable</b> Typ, weil der Schlüssel fehlen könnte. Und <code>ro + 4</code> verändert <code>ro</code> nicht, sondern erzeugt eine neue Liste.`, "Beispiel durchgerechnet")],
  "mad4-2": [{ t: "fig", id: "mappdev-chain" }, ex("Wetter-App: Wochenstatistik ohne Schleife", S(`val temps = listOf(18, 21, 24, 19, 15, 22, 26)    // Mo … So
println(temps.average())                          // 20.714285714285715
println(temps.max())                              // 26
println(temps.filter { it > 20 })                 // [21, 24, 22, 26]
println(temps.count { it > 20 })                  // 4
println(temps.map { it * 9 / 5 + 32 })            // [64, 69, 75, 66, 59, 71, 78]
val warmDays = temps.withIndex().filter { it.value >= 24 }.map { it.index }
println(warmDays)                                 // [2, 6]  (Mi, So)
println(temps.fold(0) { acc, t -> if (t > acc) t else acc })   // 26`) + `Summe 145 / 7 = <b>20,71 °C</b>. Achtung bei <code>it * 9 / 5 + 32</code>: Das ist Int-Arithmetik, 21 · 9 / 5 = 189 / 5 = 37 (abgeschnitten) + 32 = 69 statt 69,8. Mit <code>it * 1.8 + 32</code> bekäme man Double-Werte. Das letzte <code>fold</code> zeigt, dass man damit auch ein Maximum bauen kann – acc ist dann „bisher größter Wert“.`, "Beispiel durchgerechnet")],
  "mad4-3": [ex("Eine generische Funktion, drei Typen", S(`fun <T> List<T>.secondOrNull(): T? = if (size >= 2) this[1] else null

class Box<T>(val value: T) {
    fun <R> map(f: (T) -> R): Box<R> = Box(f(value))
}

fun main() {
    println(listOf(3, 7, 9).secondOrNull())        // 7      (T = Int)
    println(listOf("a").secondOrNull())            // null   (T = String)
    val b: Box<String> = Box(42).map { "Nr. $it" }
    println(b.value)                               // Nr. 42
    val pair: Pair<String, Int> = "ECTS" to 5
    println("\${pair.first}: \${pair.second}")       // ECTS: 5
}`) + `<code>&lt;T&gt;</code> steht <b>vor</b> dem Funktionsnamen bzw. hinter dem Klassennamen. Der Compiler leitet T aus dem Aufruf ab – <code>Box(42)</code> ist automatisch <code>Box&lt;Int&gt;</code>, nach <code>map</code> wird daraus <code>Box&lt;String&gt;</code>. Rückgabetyp <code>T?</code>: Auch für Nicht-null-Typen kann die Funktion null liefern.`)],
  "mad5-1": [ex("Course: Prüfung im init-Block, berechnete Property", S(`class Course(val code: String, val ects: Int) {
    init {
        require(ects in 1..30) { "ECTS ungültig: $ects" }
    }
    val workloadHours: Int
        get() = ects * 25                // 1 ECTS = 25 Stunden
    var enrolled = 0
        private set
    fun enroll() { enrolled++ }
    override fun toString() = "$code ($ects ECTS, $workloadHours h)"
}

fun main() {
    val c = Course("MAPPDEV", 5)
    c.enroll(); c.enroll()
    println(c)                          // MAPPDEV (5 ECTS, 125 h)
    println(c.enrolled)                 // 2
    // c.enrolled = 10                  // Fehler: setter is private
    Course("XY", 0)                     // IllegalArgumentException: ECTS ungültig: 0
}`) + `5 ECTS · 25 h = <b>125 h</b>. <code>workloadHours</code> hat kein Feld, sondern wird bei jedem Zugriff neu berechnet. <code>init</code> läuft beim Erzeugen jedes Objekts, direkt nach dem primären Konstruktor.`)],
  "mad5-2": [ex("data class: equals, copy und Destructuring", S(`data class Grade(val course: String, val value: Int)

fun main() {
    val g1 = Grade("MATH2", 2)
    val g2 = Grade("MATH2", 2)
    println(g1 == g2)                        // true  (Inhalt gleich)
    println(g1 === g2)                       // false (zwei Objekte)
    println(g1)                              // Grade(course=MATH2, value=2)
    val better = g1.copy(value = 1)          // neues Objekt, ein Feld geändert
    val (course, value) = better             // component1(), component2()
    println("$course: $value")               // MATH2: 1
    println(setOf(g1, g2, better).size)      // 2  (g1 und g2 sind „gleich“)
}`) + `Die data class erzeugt <code>equals</code>, <code>hashCode</code>, <code>toString</code>, <code>copy</code> und <code>componentN</code> aus den Properties des <b>primären Konstruktors</b>. Darum zählt das Set nur 2 Elemente: g1 und g2 haben denselben Inhalt und damit denselben Hashcode.`)],
  "mad5-3": [ex("Benachrichtigungen: ein Interface, zwei Implementierungen", S(`interface Notifier {
    val channel: String
    fun send(msg: String): String
    fun sendAll(msgs: List<String>) = msgs.map { send(it) }   // Default-Implementierung
}
class EmailNotifier(private val to: String) : Notifier {
    override val channel = "E-Mail"
    override fun send(msg: String) = "[$channel an $to] $msg"
}
class PushNotifier : Notifier {
    override val channel = "Push"
    override fun send(msg: String) = "[$channel] \${msg.take(20)}"
}

fun main() {
    val all: List<Notifier> = listOf(EmailNotifier("kevin@fh.at"), PushNotifier())
    all.forEach { println(it.send("Quiz 4 startet in 10 Minuten")) }
}`) + `Ausgabe: <code>[E-Mail an kevin@fh.at] Quiz 4 startet in 10 Minuten</code> und <code>[Push] Quiz 4 startet in 10</code> (<code>take(20)</code> kürzt auf 20 Zeichen). Die Schleife kennt nur den Typ <code>Notifier</code> – welche <code>send</code>-Methode läuft, entscheidet das Objekt. Neue Kanäle (SMS) kommen dazu, ohne die Schleife zu ändern.`)],
  "madk5-1": [{ t: "fig", id: "mappdev-ref" }, ex("Eine Funktion ändert das Objekt des Aufrufers", S(`class Person(var firstname: String, var age: Int)

fun birthday(p: Person) { p.age++ }               // ändert das Objekt
fun rename(p: Person) {
    // p = Person("Neu", 0)                         // Fehler: Parameter sind val
    p.firstname = "Johnny"                          // erlaubt: Objekt ändern
}

fun main() {
    val john = Person("John", 22)
    birthday(john); birthday(john)
    rename(john)
    println("\${john.firstname}, \${john.age}")       // Johnny, 24
    println(john)                                   // Person@1b6d3586 (Hashcode variiert)
}`) + `Kotlin übergibt immer die <b>Referenz</b> (in Go bräuchte man dafür <code>&amp;john</code> und einen Pointer-Parameter). Die Funktion kann das Objekt verändern, aber den Parameter nicht auf ein anderes Objekt umhängen. <code>Person@1b6d3586</code> ist die Standard-<code>toString</code>-Ausgabe einer normalen Klasse – kein Fehler.`)],
  "madk5-2": [ex("Extension Functions statt Hilfsklasse", S(`fun String.initials(): String =
    split(" ").filter { it.isNotBlank() }.map { it.first().uppercaseChar() }.joinToString("")

fun Double.roundTo(digits: Int): Double {
    var factor = 1.0
    repeat(digits) { factor *= 10 }
    return Math.round(this * factor) / factor
}

fun main() {
    println("kevin maier".initials())              // KM
    println("Anna  Lena Huber".initials())        // ALH
    println((10.0 / 3).roundTo(2))                // 3.33
    println(2.675.roundTo(1))                     // 2.7
}`) + `Eine Extension wird wie eine Methode aufgerufen, ändert die Klasse aber nicht – <code>this</code> ist der Empfänger (<code>"kevin maier"</code> bzw. die Zahl). Sie sieht nur öffentliche Members. Das doppelte Leerzeichen in „Anna  Lena“ erzeugt ein leeres Stück, das <code>filter { it.isNotBlank() }</code> entfernt – sonst würde <code>first()</code> eine Exception werfen.`)],
  "madk5-3": [ex("Thermostat: Setter mit Prüfung und field", S(`class Thermostat(initial: Double) {
    var target: Double = initial.coerceIn(5.0, 30.0)
        set(value) {
            field = value.coerceIn(5.0, 30.0)       // field = Backing Field
        }
    var changes = 0
        private set
    fun up() { target += 0.5; changes++ }
}

fun main() {
    val t = Thermostat(21.0)
    t.up(); t.up()
    println(t.target)          // 22.0
    t.target = 35.0
    println(t.target)          // 30.0  (begrenzt)
    println(t.changes)         // 2
    // t.changes = 0           // Fehler: Cannot assign to 'changes': the setter is private
}`) + `Im Setter steht <code>field</code> statt <code>target</code> – <code>target = …</code> würde den Setter erneut aufrufen (Endlosrekursion → StackOverflowError). <code>private set</code> erlaubt das Lesen von außen, ändern darf nur die Klasse selbst. Auch <code>up()</code> läuft über den Setter, die Grenzen gelten also überall.`)],
  "madk5-4": [{ t: "fig", id: "mappdev-dispatch" }, ex("Ticketpreise: Overloading und Overriding in einem Beispiel", S(`open class Ticket(val base: Double) {
    open fun price(): Double = base
    fun price(age: Int): Double = if (age < 15) price() * 0.5 else price()   // Overload
}
class StudentTicket(base: Double) : Ticket(base) {
    override fun price(): Double = base * 0.7                              // Override
}

fun main() {
    val tickets: List<Ticket> = listOf(Ticket(20.0), StudentTicket(20.0))
    for (t in tickets) println("\${t.price()} / \${t.price(10)}")
}`) + `Ausgabe: <code>20.0 / 10.0</code> und <code>14.0 / 7.0</code>. Der Overload <code>price(age)</code> ist nur in <code>Ticket</code> definiert, ruft aber intern <code>price()</code> auf – und das ist beim StudentTicket die überschriebene Version: 20 · 0,7 = 14, davon die Hälfte = 7. <b>Overloading</b>: gleicher Name, andere Parameter, Auswahl zur Compile-Zeit. <b>Overriding</b>: gleiche Signatur in der Unterklasse, Auswahl zur Laufzeit.`, "Beispiel durchgerechnet")],
  "madk5-5": [ex("Abstrakte Klasse und Interface kombiniert", S(`abstract class Vehicle(val name: String) {
    abstract fun maxSpeed(): Int                      // muss implementiert werden
    fun describe() = "$name fährt bis \${maxSpeed()} km/h"
}
interface Electric {
    val batteryKWh: Double
    fun rangeKm(): Double = batteryKWh / 0.15         // Default: 15 kWh/100 km
}
class EScooter : Vehicle("E-Scooter"), Electric {
    override fun maxSpeed() = 25
    override val batteryKWh = 0.6
    override fun rangeKm() = batteryKWh / 0.015       // Scooter: 1,5 kWh/100 km
}
class ECar : Vehicle("E-Auto"), Electric {
    override fun maxSpeed() = 180
    override val batteryKWh = 60.0
}

fun main() {
    val fleet = listOf(EScooter(), ECar())
    fleet.forEach { println(it.describe() + ", Reichweite \${it.rangeKm()} km") }
    // val v = Vehicle("X")                          // Fehler: abstrakte Klasse
}`) + `Ausgabe: „E-Scooter fährt bis 25 km/h, Reichweite 40.0 km“ (0,6 / 0,015) und „E-Auto fährt bis 180 km/h, Reichweite 400.0 km“ (60 / 0,15). Eine Klasse erbt von <b>höchstens einer</b> Klasse, implementiert aber beliebig viele Interfaces. Die Liste hat den gemeinsamen Typ beider Elemente (Vehicle und Electric), deshalb sind beide Methoden aufrufbar. Gleitkomma kann hier minimal abweichen (z. B. 39.99999…).`, "Beispiel durchgerechnet")],
  "madk5-6": [ex("companion object als Fabrik, object als Singleton", S(`object AppConfig {                       // genau eine Instanz
    const val API_URL = "https://api.example.at"
    var darkMode = false
}

class Order private constructor(val id: Int, val total: Double) {
    companion object {
        private var nextId = 1000
        fun create(total: Double): Order {
            require(total > 0)
            return Order(nextId++, total)
        }
    }
}

fun main() {
    val o1 = Order.create(24.90)
    val o2 = Order.create(9.50)
    println("\${o1.id}, \${o2.id}")       // 1000, 1001
    AppConfig.darkMode = true
    println(AppConfig.darkMode)         // true – überall dieselbe Instanz
    // Order(5, 1.0)                    // Fehler: Konstruktor ist private
}`) + `Der private Konstruktor zwingt alle Aufrufer über <code>Order.create</code> – so kann die Klasse IDs fortlaufend vergeben und Eingaben prüfen. <code>nextId</code> gehört zum companion object und existiert nur <b>einmal</b> für alle Orders (vergleichbar mit <code>static</code> in Java).`)]
};
const CHK = {
  "mad2-2": { t: "check", q: "Was gibt <code>println(-7 % 2)</code> in Kotlin aus?", opts: ["1", "-1", "-3", "0"], a: 1, why: "% ist rem: Das Vorzeichen folgt dem Dividenden. (-7).mod(2) wäre 1." },
  "mad3-4": { t: "check", q: "Was geben <code>val c = makeCounter(); c(); println(c())</code> und anschließend <code>println(makeCounter()())</code> aus?", opts: ["2 und 3", "2 und 1", "1 und 1", "1 und 2"], a: 1, why: "c hat sein eigenes count (1, dann 2). Ein neuer makeCounter-Aufruf beginnt wieder bei 0 → 1." },
  "madk5-4": { t: "check", q: "<code>val s: Shape = Square(3.0)</code> – Square erbt von Rectangle und überschreibt area() nicht. Was liefert <code>s.area()</code>?", opts: ["Compilerfehler", "Shape.area() → Exception", "Rectangle.area() → 9.0", "0.0"], a: 2, why: "Dynamisches Binden: Es läuft die speziellste vorhandene Implementierung entlang der Hierarchie." }
};
Object.entries(CHK).forEach(([k, b]) => BLOCKS[k].push(b));

/* ===================== Fragen ===================== */
const Q = [
 ["mad-tool", "Wozu wird Kotlin-Code für Android letztlich übersetzt?", ["Direkt in Maschinencode für jede CPU", "In JVM-Bytecode und weiter in DEX-Bytecode für die Android Runtime", "In JavaScript", "In Go-Binaries"], 1, "Kotlin → Bytecode → DEX → APK."],
 ["mad-tool", "Welcher Shortcut extrahiert markierten Code in eine neue Methode (Windows/Linux)?", ["Ctrl + Alt + V", "Ctrl + Alt + M", "Shift + F6", "Alt + Insert"], 1, "M wie Method, V wie Variable."],
 ["mad-tool", "Im Debugger willst du in die aufgerufene Funktion hineinspringen. Welche Taste?", ["F8", "F7", "F9", "F2"], 1, "F7 Step into, F8 Step over, F9 Resume."],
 ["mad-tool", "Was bedeutet „Kotlin ist statisch typisiert mit Type Inference“?", ["Typen werden erst zur Laufzeit bestimmt", "Typen stehen zur Compile-Zeit fest, müssen aber oft nicht hingeschrieben werden", "Es gibt keine Typen", "Jeder Typ muss immer explizit angegeben werden"], 1, "Der Compiler leitet den Typ aus dem Wert ab – geprüft wird trotzdem beim Kompilieren."],
 ["mad-var", "Welche Deklaration ist in einer Funktion gültig?", ["const val x = 5", "var x: Int = null", "val x = 5", "var x"], 2, "const nur top-level/object/companion; Int ist nicht nullable; var ohne Typ und ohne Wert lässt sich nicht inferieren."],
 ["mad-var", "val list = mutableListOf(1, 2); list.add(3) – was passiert?", ["Compilerfehler, weil val", "list enthält [1, 2, 3] – val verhindert nur das Neuzuweisen der Referenz", "Laufzeitfehler", "list bleibt [1, 2]"], 1, "Unveränderlich ist die Referenz, nicht das Objekt."],
 ["mad-var", "Was ist der Unterschied zwischen val und const val?", ["Keiner", "const val ist eine Compile-Zeit-Konstante (nur primitive Typen und String, nur top-level/object/companion), val wird zur Laufzeit einmal zugewiesen", "val ist schneller", "const val kann geändert werden"], 1, "Ein val kann z. B. das Ergebnis eines Funktionsaufrufs halten, ein const val nicht."],
 ["mad-var", "Ausgabe? var p = 0; p += 5; p += 4; p += 5; println(p * 100 / 55)", ["25,45", "25", "26", "14"], 1, "14 · 100 / 55 = 1400 / 55 = 25 (Int-Division)."],
 ["mad-types", "Welchen Typ hat val x = 2_000_000_000 + 2_000_000_000 und welcher Wert entsteht?", ["Long, 4000000000", "Int, -294967296 (Überlauf)", "Double, 4.0E9", "Compilerfehler"], 1, "Beide Literale sind Int, die Summe läuft still über."],
 ["mad-types", "Was liefert 7 / 2 * 2.0?", ["7.0", "6.0", "8.0", "Compilerfehler"], 1, "Links nach rechts: 7 / 2 = 3 (Int), dann 3 * 2.0 = 6.0."],
 ["mad-types", "Was ergibt (-7).mod(2)?", ["-1", "1", "-3", "-4"], 1, "mod übernimmt das Vorzeichen des Divisors; -7 % 2 wäre -1."],
 ["mad-types", "Was ergibt 0b1100 xor 0b1010 als Dezimalzahl?", ["8", "6", "14", "2"], 1, "1100 xor 1010 = 0110 = 6."],
 ["mad-types", "Was ergibt 5 shl 3?", ["15", "40", "8", "0"], 1, "Links-Shift um 3 = · 2³ = 5 · 8 = 40."],
 ["mad-str", "Was liefert \"ima25-0412\".substring(3, 5)?", ["\"25-\"", "\"25\"", "\"a25\"", "\"5-\""], 1, "Start inklusive (Index 3), Ende exklusiv (Index 5)."],
 ["mad-str", "Welchen Typ hat \"Kotlin\"[0]?", ["String", "Char", "Int", "Byte"], 1, "Der Index-Zugriff auf einen String liefert einen Char."],
 ["mad-str", "arrayOf(1, 2) == arrayOf(1, 2) ergibt …", ["true", "false – Arrays vergleichen mit == die Identität; contentEquals vergleicht den Inhalt", "Compilerfehler", "eine Exception"], 1, "Bei Listen würde == den Inhalt vergleichen."],
 ["mad-str", "Was gibt println(\"Summe: \${2 + 3}\") aus?", ["Summe: 2 + 3", "Summe: 5", "Summe: \${2 + 3}", "Summe: 23"], 1, "In geschweiften Klammern steht ein Ausdruck, der ausgewertet wird."],
 ["mad-null", "val s: String? = null; println(s?.length ?: -1) gibt aus …", ["null", "-1", "0", "NullPointerException"], 1, "Safe Call → null, Elvis → -1."],
 ["mad-null", "Welchen Typ hat val c = user?.address?.city ?: \"unbekannt\" (city ist String)?", ["String?", "String", "Any", "Nothing"], 1, "Der Elvis-Operator ersetzt null – das Ergebnis kann nicht mehr null sein."],
 ["mad-null", "Was bewirkt x?.let { println(it) }, wenn x null ist?", ["Gibt null aus", "Nichts – der Block wird nicht ausgeführt", "NullPointerException", "Compilerfehler"], 1, "Der Safe Call überspringt let, der Ausdruck ergibt null."],
 ["mad-null", "Warum funktioniert ein Smart Cast nach if (name != null) bei einer var-Property einer Klasse nicht zuverlässig?", ["Smart Casts gibt es nur in Java", "Die Property könnte zwischen Prüfung und Zugriff (z. B. von einem anderen Thread) geändert werden", "var-Properties sind nie nullable", "Weil if kein Ausdruck ist"], 1, "Smart Casts funktionieren bei lokalen Variablen und val-Properties ohne Custom Getter."],
 ["mad-flow", "Was liefert when (183) { in 273..300 -> \"1\"; in 243..272 -> \"2\"; in 183..212 -> \"4\"; else -> \"5\" }?", ["\"5\"", "\"4\"", "\"2\"", "Compilerfehler"], 1, "183 liegt in 183..212."],
 ["mad-flow", "Welche Schleife gibt 10 5 0 aus?", ["for (i in 10..0 step 5)", "for (i in 10 downTo 0 step 5)", "for (i in 0..10 step 5)", "for (i in 10 until 0)"], 1, "10..0 ist leer; abwärts zählt man mit downTo."],
 ["mad-flow", "Wann darf bei when als Ausdruck das else fehlen?", ["Nie", "Wenn der Compiler beweisen kann, dass alle Fälle abgedeckt sind (z. B. Boolean, enum, sealed)", "Immer", "Nur bei Strings"], 1, "Ein when-Ausdruck muss exhaustive sein."],
 ["mad-flow", "Was gibt for (i in 0 until 3) print(i) aus?", ["0123", "012", "123", "0 1 2 3"], 1, "until schließt die obere Grenze aus."],
 ["mad-fun", "fun price(net: Double, vat: Double = 0.2, discount: Double = 0.0) – welcher Aufruf ergibt 90.0 für net = 100.0?", ["price(100.0, 0.25)", "price(100.0, discount = 0.25)", "price(discount = 0.25)", "price(100.0, 0.2, 25)"], 1, "100 · 0,75 · 1,2 = 90. Ohne Namen würde 0.25 als vat interpretiert."],
 ["mad-fun", "Was ist ::gross?", ["Ein Kommentar", "Eine Funktionsreferenz – die Funktion als Wert", "Ein Generic", "Eine Extension"], 1, "Kann z. B. an map übergeben werden: list.map(::gross)."],
 ["mad-fun", "fun double(x: Int) = x * 2 – welchen Rückgabetyp hat die Funktion?", ["Unit", "Int (inferiert aus dem Ausdruck)", "Any", "Nothing"], 1, "Bei Expression-Body wird der Rückgabetyp abgeleitet."],
 ["mad-fun", "Eine Funktion mit Block-Body ohne return-Typ und ohne return gibt zurück …", ["den letzten Ausdruck", "Unit", "null", "Nothing"], 1, "Block-Body ohne Typangabe → Unit. Der letzte Ausdruck wird nur bei Lambdas zurückgegeben."],
 ["mad-lambda", "Welchen Typ hat val f = { x: Int, y: Int -> x + y }?", ["(Int) -> Int", "(Int, Int) -> Int", "Int", "() -> Int"], 1, "Zwei Int-Parameter, Rückgabe Int."],
 ["mad-lambda", "val at20 = withVat(0.2) mit fun withVat(rate: Double): (Double) -> Double = { it * (1 + rate) }. Was liefert at20(50.0)?", ["50.0", "60.0", "10.0", "Compilerfehler"], 1, "50 · 1,2 = 60. Die Funktion merkt sich rate (Closure)."],
 ["mad-lambda", "Was bezeichnet it in einem Lambda?", ["Den Rückgabewert", "Den impliziten Namen des einzigen Parameters", "Die aktuelle Klasse", "Den Index"], 1, "Nur bei genau einem Parameter verfügbar."],
 ["mad-lambda", "Welche Schreibweise ist ein Trailing Lambda?", ["list.map({ it * 2 })", "list.map { it * 2 }", "list.map(it * 2)", "map list { it * 2 }"], 1, "Ist das Lambda der letzte Parameter, darf es hinter die Klammern."],
 ["mad-err", "Was ist der Wert von val n = try { \"x\".toInt() } catch (e: NumberFormatException) { -1 }?", ["0", "-1", "null", "Die Exception fliegt weiter"], 1, "try ist ein Ausdruck: Der catch-Block liefert -1."],
 ["mad-err", "Läuft finally, wenn im try-Block return ausgeführt wird?", ["Nein", "Ja, vor dem tatsächlichen Verlassen der Funktion", "Nur bei Exceptions", "Nur ohne catch"], 1, "finally läuft immer."],
 ["mad-err", "require(n > 0) wirft bei n = -2 …", ["NumberFormatException", "IllegalArgumentException", "IllegalStateException", "NullPointerException"], 1, "require prüft Argumente; check prüft Zustand (IllegalStateException)."],
 ["mad-err", "Ein catch (e: NumberFormatException) steht vor catch (e: Exception). Warum ist diese Reihenfolge richtig?", ["Sie ist egal", "Der speziellere Typ muss zuerst stehen, sonst würde der allgemeine alles abfangen", "Exception muss immer zuerst stehen", "Weil NumberFormatException kein Exception-Typ ist"], 1, "catch-Blöcke werden von oben nach unten geprüft."],
 ["mad-coll", "val m = mapOf(\"A\" to 1); welchen Typ hat m[\"B\"]?", ["Int", "Int? (Wert null)", "String", "Exception"], 1, "Der Schlüssel könnte fehlen – deshalb nullable."],
 ["mad-coll", "val s = mutableSetOf(1, 2); s.add(2); s.add(3) – was ist s.size?", ["4", "3", "2", "Exception"], 1, "Sets enthalten keine Duplikate: {1, 2, 3}."],
 ["mad-coll", "val ro = listOf(1, 2); val x = ro + 3 – was gilt?", ["ro ist jetzt [1, 2, 3]", "x ist [1, 2, 3], ro bleibt [1, 2]", "Compilerfehler", "x ist 6"], 1, "+ erzeugt eine neue Liste."],
 ["mad-coll", "Wie bekommt man einen Standardwert, wenn ein Map-Schlüssel fehlt?", ["map.get(key)!!", "map.getOrDefault(key, wert) oder map[key] ?: wert", "map.first()", "map.size"], 1, "Beides liefert einen Ersatzwert ohne Exception."],
 ["mad-fop", "Was ergibt (1..6).filter { it % 2 == 0 }.map { it * it }.sum()?", ["21", "56", "91", "12"], 1, "[2, 4, 6] → [4, 16, 36] → 56."],
 ["mad-fop", "listOf(18, 21, 24).map { it * 9 / 5 + 32 } – welcher Wert entsteht für 21?", ["69.8", "69", "70", "37"], 1, "Int-Arithmetik: 189 / 5 = 37, + 32 = 69."],
 ["mad-fop", "Was liefert listOf(3, 8, 5).fold(0) { acc, x -> if (x > acc) x else acc }?", ["16", "8", "3", "0"], 1, "fold mit Maximum-Logik: 0 → 3 → 8 → 8."],
 ["mad-fop", "Worin unterscheidet sich reduce von fold?", ["Gar nicht", "reduce nimmt das erste Element als Startwert und wirft bei leerer Liste eine Exception", "reduce liefert eine Liste", "fold geht von rechts"], 1, "fold hat einen expliziten Startwert und funktioniert auch bei leerer Liste."],
 ["mad-gen", "Wo steht der Typparameter bei einer generischen Funktion?", ["Nach dem Rückgabetyp", "Vor dem Funktionsnamen: fun <T> name(…)", "In eckigen Klammern wie in Go", "Nach den Parametern"], 1, "fun <T> List<T>.secondOrNull(): T?"],
 ["mad-gen", "Box(42).map { \"Nr. $it\" } mit class Box<T>(val value: T) { fun <R> map(f: (T) -> R) = Box(f(value)) } hat den Typ …", ["Box<Int>", "Box<String>", "String", "Box<Any>"], 1, "R wird aus dem Lambda als String abgeleitet."],
 ["mad-gen", "Warum liefert fun <T> List<T>.secondOrNull() den Typ T? statt T?", ["Weil T immer nullable ist", "Weil bei weniger als zwei Elementen null zurückgegeben wird", "Weil Generics das verlangen", "Ohne Grund"], 1, "Das Fragezeichen erlaubt den null-Fall auch bei nicht-nullable T."],
 ["mad-gen", "Was ist der Typ von \"ECTS\" to 5?", ["Map<String, Int>", "Pair<String, Int>", "List<Any>", "String"], 1, "to ist eine Infix-Funktion, die ein Pair erzeugt."],
 ["mad-class", "Wann läuft ein init-Block?", ["Nur beim ersten Objekt", "Bei jeder Objekterzeugung, nach der Initialisierung durch den primären Konstruktor (in Reihenfolge mit den Property-Initialisierern)", "Bei jedem Methodenaufruf", "Nie automatisch"], 1, "Ideal für Prüfungen wie require(ects in 1..30)."],
 ["mad-class", "class Course(code: String) – warum ist c.code nicht zugreifbar?", ["code ist private", "Ohne val/var ist code nur ein Konstruktorparameter, keine Property", "Strings sind nie zugreifbar", "Es fehlt ein Getter"], 1, "Erst class Course(val code: String) erzeugt eine Property."],
 ["mad-class", "Was ist eine berechnete Property wie val workloadHours get() = ects * 25?", ["Ein Feld, das einmal gesetzt wird", "Eine Property ohne Backing Field, die bei jedem Zugriff neu berechnet wird", "Eine Funktion mit Parametern", "Eine Konstante"], 1, "Ändert sich ects (bei var), ändert sich auch das Ergebnis."],
 ["mad-class", "Was bewirkt var enrolled = 0 private set?", ["Die Property ist von außen unsichtbar", "Lesen ist öffentlich, Ändern nur innerhalb der Klasse", "Sie kann nie geändert werden", "Sie ist eine Konstante"], 1, "Typisches Kapselungsmuster für Zähler."],
 ["mad-data", "data class Grade(val course: String, val value: Int); setOf(Grade(\"A\", 1), Grade(\"A\", 1)).size ist …", ["2", "1", "0", "Exception"], 1, "equals/hashCode vergleichen den Inhalt."],
 ["mad-data", "Was macht g.copy(value = 1)?", ["Ändert g", "Erzeugt ein neues Objekt mit geändertem value, alle anderen Werte wie g", "Kopiert nur value", "Compilerfehler bei val"], 1, "data classes bleiben so unveränderlich und trotzdem bequem."],
 ["mad-data", "Welche Properties berücksichtigt das generierte equals einer data class?", ["Alle Properties der Klasse", "Nur die Properties im primären Konstruktor", "Nur die erste", "Keine"], 1, "Properties im Klassenrumpf zählen nicht."],
 ["mad-data", "val (c, v) = Grade(\"MATH2\", 2) – was ist v?", ["\"MATH2\"", "2", "Grade", "Compilerfehler"], 1, "Destructuring über component1() und component2()."],
 ["mad-inh", "Warum lässt sich von class Person nicht erben?", ["Kotlin kennt keine Vererbung", "Klassen sind standardmäßig final – man braucht open class", "Weil Person keinen Konstruktor hat", "Weil Person kein Interface ist"], 1, "Auch Methoden müssen open sein, um überschrieben zu werden."],
 ["mad-inh", "Ein Interface Notifier hat fun sendAll(msgs: List<String>) = msgs.map { send(it) }. Was gilt?", ["Interfaces dürfen keine Methoden mit Rumpf haben", "Das ist eine Default-Implementierung, die implementierende Klassen erben", "sendAll muss überschrieben werden", "Compilerfehler"], 1, "Interfaces in Kotlin dürfen Default-Implementierungen enthalten, aber keinen Zustand (Backing Fields)."],
 ["mad-inh", "Wie viele Klassen bzw. Interfaces kann eine Kotlin-Klasse erweitern?", ["Beliebig viele Klassen", "Höchstens eine Klasse, aber beliebig viele Interfaces", "Eine Klasse und ein Interface", "Keine"], 1, "Einfachvererbung bei Klassen."],
 ["mad-inh", "Wie ruft eine überschriebene Methode die Version der Oberklasse auf?", ["this.methode()", "super.methode()", "base.methode()", "parent.methode()"], 1, "super verweist auf die Implementierung der Oberklasse."],
 ["mad-obj", "val a = BankAccount(1, 100.0); val b = a; b.deposit(50.0) – was liefert a.balance?", ["100.0", "150.0", "50.0", "Compilerfehler"], 1, "a und b zeigen auf dasselbe Objekt."],
 ["mad-obj", "Was prüft === ?", ["Gleichen Inhalt", "Ob beide Referenzen auf dasselbe Objekt zeigen", "Gleichen Typ", "Gleichen Hashcode"], 1, "== ruft equals auf, === vergleicht die Identität."],
 ["mad-obj", "Was gibt println(Person(\"John\", 22)) bei einer normalen Klasse ohne toString aus?", ["Person(firstname=John, age=22)", "Etwas wie Person@1b6d3586", "John 22", "Compilerfehler"], 1, "Standard-toString: Klassenname@Hashcode. Die schöne Ausgabe hat nur eine data class."],
 ["mad-obj", "Kann eine Funktion fun f(p: Person) das übergebene Objekt des Aufrufers verändern?", ["Nein, Kotlin übergibt Kopien", "Ja, über die Referenz kann sie Properties ändern – den Parameter selbst aber nicht neu zuweisen", "Nur mit &p", "Nur bei data classes"], 1, "Parameter sind val, das Objekt dahinter ist änderbar (sofern var-Properties)."],
 ["mad-meth", "Was liefert \"kevin maier\".initials() mit fun String.initials() = split(\" \").map { it.first().uppercaseChar() }.joinToString(\"\")?", ["\"km\"", "\"KM\"", "\"Kevin Maier\"", "\"K M\""], 1, "Erster Buchstabe jedes Wortes, groß, ohne Trennzeichen."],
 ["mad-meth", "Worauf kann eine Extension Function zugreifen?", ["Auch auf private Members der Klasse", "Nur auf öffentlich sichtbare Members des Empfängers", "Auf gar nichts", "Nur auf Konstanten"], 1, "Extensions ändern die Klasse nicht – sie sind statisch aufgelöste Hilfsfunktionen."],
 ["mad-meth", "Wie ruft ein sekundärer Konstruktor den primären auf?", ["super(…)", "constructor(code: String) : this(code, 5)", "init(…)", "Gar nicht nötig"], 1, "Delegation an den primären Konstruktor ist Pflicht, wenn es einen gibt."],
 ["mad-meth", "Was ist in Kotlin meist die einfachere Alternative zu einem zusätzlichen Konstruktor?", ["Ein companion object", "Default-Werte für Parameter", "Eine abstrakte Klasse", "Eine Extension"], 1, "class Course(val code: String, val ects: Int = 5)."],
 ["mad-enc", "Warum steht im Setter field = value statt target = value?", ["Aus Stilgründen", "target = … würde den Setter erneut aufrufen – Endlosrekursion", "field ist schneller", "value ist sonst null"], 1, "field ist das Backing Field der Property."],
 ["mad-enc", "Thermostat begrenzt target mit coerceIn(5.0, 30.0). Was liefert t.target nach t.target = 35.0?", ["35.0", "30.0", "5.0", "Exception"], 1, "coerceIn schneidet auf den Bereich ab."],
 ["mad-enc", "Welcher Sichtbarkeitsmodifikator ist in Kotlin der Standard?", ["private", "internal", "public", "protected"], 2, "Ohne Angabe ist alles public."],
 ["mad-enc", "Warum ändert man den Kontostand besser über deposit()/withdraw() als über einen öffentlichen Setter?", ["Methoden sind schneller", "Methoden können Regeln prüfen (z. B. Überziehungsrahmen) und halten das Objekt gültig", "Setter gibt es in Kotlin nicht", "Wegen der JVM"], 1, "Kapselung: Zustand nur über kontrollierte Operationen ändern."],
 ["mad-poly", "StudentTicket überschreibt price() mit base * 0.7; price(age) (nur in Ticket) liefert für age < 15 price() * 0.5. Was ergibt StudentTicket(20.0).price(10)?", ["10.0", "7.0", "14.0", "20.0"], 1, "price() läuft dynamisch als StudentTicket-Version: 14 · 0,5 = 7."],
 ["mad-poly", "Was ist Overloading?", ["Eine Methode in der Unterklasse neu schreiben", "Mehrere Funktionen mit gleichem Namen, aber unterschiedlichen Parametern", "Zu viele Objekte", "Mehrfachvererbung"], 1, "Die Auswahl passiert zur Compile-Zeit anhand der Argumente."],
 ["mad-poly", "val s: Shape = Circle(1.0); s.r – was passiert, wenn r nur in Circle existiert?", ["Liefert 1.0", "Compilerfehler – der statische Typ Shape hat kein r", "ClassCastException", "Liefert null"], 1, "Erst nach if (s is Circle) ist s.r per Smart Cast erlaubt."],
 ["mad-poly", "Was passiert bei val st = p as Student, wenn p zur Laufzeit ein Teacher ist?", ["st wird null", "ClassCastException", "Compilerfehler", "st ist ein leerer Student"], 1, "as? würde stattdessen null liefern."],
 ["mad-abs", "Was ist bei abstract class Vehicle(val name: String) nicht erlaubt?", ["Unterklassen bilden", "Vehicle(\"X\") direkt instanziieren", "Konkrete Methoden definieren", "Properties definieren"], 1, "Abstrakte Klassen können nicht instanziiert werden."],
 ["mad-abs", "Was muss eine nicht-abstrakte Unterklasse von Vehicle tun?", ["Nichts", "Alle abstrakten Members (z. B. maxSpeed()) implementieren", "Alle Methoden überschreiben", "Ein Interface implementieren"], 1, "Sonst muss sie selbst abstract sein."],
 ["mad-abs", "Worin unterscheidet sich ein Interface von einer abstrakten Klasse?", ["Interfaces können keine Methoden haben", "Interfaces haben keinen Konstruktor und keinen gespeicherten Zustand; eine Klasse kann mehrere Interfaces implementieren", "Abstrakte Klassen sind immer public", "Es gibt keinen Unterschied"], 1, "Abstrakte Klassen dürfen Zustand und Konstruktoren haben, aber nur eine kann geerbt werden."],
 ["mad-abs", "ECar implementiert Electric, überschreibt rangeKm() aber nicht (Default batteryKWh / 0.15). batteryKWh = 60.0 – Reichweite?", ["60.0", "400.0", "9.0", "Compilerfehler"], 1, "60 / 0,15 = 400 (Default-Implementierung aus dem Interface)."],
 ["mad-comp", "Wie viele Instanzen hat ein object AppConfig?", ["Eine pro Aufruf", "Genau eine (Singleton)", "Keine", "Beliebig viele"], 1, "object deklariert und erzeugt gleichzeitig die einzige Instanz."],
 ["mad-comp", "Wie ruft man eine Funktion create() im companion object von Order auf?", ["Order().create()", "Order.create()", "Order.companion.create() ist Pflicht", "create(Order)"], 1, "Über den Klassennamen, ohne Objekt."],
 ["mad-comp", "Order hat einen private constructor und Order.create() vergibt IDs ab 1000. Was liefern zwei Aufrufe?", ["1000 und 1000", "1000 und 1001", "1 und 2", "Compilerfehler"], 1, "nextId gehört dem companion object und existiert nur einmal."],
 ["mad-comp", "Womit ist ein companion object am ehesten vergleichbar?", ["Mit einer data class", "Mit static-Members in Java", "Mit einem Interface", "Mit einer Extension"], 1, "Gehört zur Klasse, nicht zu einzelnen Objekten."]
];
const questions = Q.map(([topic, q, opts, a, why], i) => ({ id: "px-mappdev-" + (i + 1), topic, q: esc(q), opts: opts.map(esc), a, why: esc(why), ex: "" }));

const FC = [
 ["mad-types", "rem (%) vs. mod", "-7 % 2 = -1 (Vorzeichen des Dividenden), (-7).mod(2) = 1 (Vorzeichen des Divisors)."],
 ["mad-types", "Int-Überlauf", "Int.MAX_VALUE + 1 = Int.MIN_VALUE, ohne Fehler. Für große Summen Long verwenden (z. B. 2_000_000_000L)."],
 ["mad-lambda", "Closure", "Ein Lambda, das Variablen aus seiner Umgebung einfängt und behält – z. B. jeder makeCounter()-Zähler hat sein eigenes count."],
 ["mad-lambda", "Currying", "Funktion mit mehreren Parametern als Kette von Funktionen mit je einem: withVat(0.2)(50.0)."],
 ["mad-err", "try als Ausdruck", "val n = try { s.toInt() } catch (e: NumberFormatException) { 0 } – der letzte Ausdruck des ausgeführten Blocks ist der Wert."],
 ["mad-obj", "== vs. ===", "== ruft equals auf (Inhalt bei data class), === prüft Identität (dasselbe Objekt)."],
 ["mad-poly", "Statischer vs. dynamischer Typ", "Der Compiler prüft gegen den statischen Typ (was ist aufrufbar), die Laufzeit wählt die Implementierung des tatsächlichen Objekts."],
 ["mad-enc", "Backing Field", "Im Custom-Setter field = value schreiben, nicht propertyName = value (sonst Endlosrekursion)."],
 ["mad-comp", "private constructor + companion", "Fabrikmethode im companion object erzwingt Prüfungen und vergibt z. B. fortlaufende IDs."],
 ["mad-fop", "fold Schritt für Schritt", "listOf(4, 16, 36).fold(0) { acc, x -> acc + x }: 0 → 4 → 20 → 56."]
];
const flashcards = FC.map(([topic, front, back], i) => ({ id: "px-mappdev-f" + (i + 1), cat: "MAPPDEV", topic, front, back }));

window.STUDYOS_EXT = window.STUDYOS_EXT || {};
(window.STUDYOS_EXT["mappdev"] = window.STUDYOS_EXT["mappdev"] || []).push({ id: "mappdev-plus", blocks: BLOCKS, questions, flashcards });
})();
