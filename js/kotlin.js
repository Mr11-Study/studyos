/* StudyOS · Kotlin-Labor
   Echter Kotlin-Code im Browser: Der Code wird an den offiziellen Compiler-Server von JetBrains geschickt
   (api.kotlinlang.org, derselbe Dienst wie play.kotlinlang.org), dort kompiliert und auf der JVM ausgeführt.
   Bausteine:
     KT.editor(el, opts)     Code-Editor mit Zeilennummern, Syntax-Farben, Auto-Einrückung
     KT.run(code)            kompiliert + führt aus → { errors, warnings, out, err, exception }
     W.ktrun                 „Ausprobieren“-Block in Lektionen (optional: erst Ausgabe tippen, Ziel-Ausgabe)
     W.ktlab                 Übungsblatt mit automatischen Tests (wie die test()-Zellen im Notebook)
     PAGES.ktlab             Kotlin-Labor: Spielwiese, Übungsblätter, Fehler-Übersetzer */
(function () {
const { $, $$, esc, PAGES } = App;
const W = App.W = App.W || {};
const S = () => App.S();
const KT = App.kt = {};
const API = "https://api.kotlinlang.org", FALLBACK_V = "2.1.0";
const st = () => { const s = S(); return s.kt || (s.kt = { tasks: {}, snippets: [], play: null }); };
const taskState = id => { const k = st(); return k.tasks[id] || (k.tasks[id] = {}); };
const head = (t, tag, right) => App.whead ? App.whead(t, tag, right) : `<h3>${t}</h3>`;

/* ================= Labs & Aufgaben (aus courses/<kurs>/*.js über ext-apply) ================= */
const LABS = [], LAB = {}, TASK = {};
(App.COURSES || []).forEach(c => (c.ktLabs || []).forEach(lab => { lab.course = c.id; LABS.push(lab); LAB[lab.id] = lab; lab.tasks.forEach(t => { t.lab = lab.id; TASK[t.id] = t; }); }));
KT.LABS = LABS; KT.LAB = LAB; KT.TASK = TASK;
const labSolved = lab => lab.tasks.filter(t => (st().tasks[t.id] || {}).solved).length;
KT.labSolved = labSolved;

/* ================= Compiler-Server ================= */
let verP = null;
KT.version = () => verP || (verP = (async () => {
  try { const c = JSON.parse(localStorage.getItem("studyos-ktver") || "null"); if (c && Date.now() - c.t < 7 * 864e5) return c.v; } catch (e) {}
  try {
    const list = await (await fetch(API + "/versions")).json();
    const v = (list.find(x => x.latestStable) || list[list.length - 1]).version;
    try { localStorage.setItem("studyos-ktver", JSON.stringify({ v, t: Date.now() })); } catch (e) {}
    return v;
  } catch (e) { verP = null; return FALLBACK_V; }
})());
// der Server liefert die Ausgabe HTML-escaped innerhalb von <outStream>…</outStream>
const unent = t => t.replace(/&(lt|gt|quot|#39|amp);/g, (m, e) => ({ lt: "<", gt: ">", quot: '"', "#39": "'", amp: "&" }[e]));
function parseResult(j) {
  const diags = [].concat(...Object.values(j.errors || {}));
  const out = [], err = [], txt = j.text || "";
  let tagged = false;
  txt.replace(/<(outStream|errStream)>([\s\S]*?)<\/\1>/g, (m, k, body) => { tagged = true; (k === "outStream" ? out : err).push(unent(body)); return ""; });
  return {
    errors: diags.filter(d => d.severity === "ERROR"), warnings: diags.filter(d => d.severity === "WARNING"),
    out: tagged ? out.join("") : txt, err: err.join(""), exception: j.exception || null
  };
}
KT.run = async code => {
  if (navigator.onLine === false) return { net: "offline" };
  const v = await KT.version(), ctrl = new AbortController(), tm = setTimeout(() => ctrl.abort(), 45000);
  try {
    const r = await fetch(`${API}/api/${v}/compiler/run`, { method: "POST", signal: ctrl.signal, headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ args: "", files: [{ name: "File.kt", text: code, publicId: "" }], confType: "java" }) });
    if (!r.ok) return { net: "HTTP " + r.status };
    return parseResult(await r.json());
  } catch (e) { return { net: e.name === "AbortError" ? "timeout" : (e.message || String(e)) }; }
  finally { clearTimeout(tm); }
};

/* ================= Fehler-Übersetzer (Compiler- & Laufzeitfehler auf Deutsch) ================= */
const CERR = [
  [/expecting a top level declaration|expecting member declaration/i, "In einer .kt-Datei dürfen außerhalb von Funktionen nur <b>Deklarationen</b> stehen (fun, val, class …). Anweisungen wie <code>println(…)</code> oder ein Funktionsaufruf gehören in eine Funktion, z. B. in <code>fun main() { … }</code>. Im Jupyter-Notebook ging das direkt, hier nicht."],
  [/unresolved reference/i, "Diesen Namen kennt der Compiler nicht. Häufig: Tippfehler (Groß-/Kleinschreibung!), Variable in einem anderen Block deklariert, fehlender <code>import</code> oder die Funktion heißt anders als in der Aufgabe."],
  [/'?val'? cannot be reassigned/i, "<code>val</code> ist read-only und kann nach der Zuweisung nicht mehr geändert werden. Brauchst du einen veränderbaren Wert, nimm <code>var</code>."],
  [/null can ?not be a value of a non-null type/i, "Dieser Typ erlaubt kein <code>null</code>. Mach ihn mit <code>?</code> nullable, z. B. <code>String?</code>."],
  [/only safe \(\?\.\) or non-null asserted/i, "Der Wert kann <code>null</code> sein. Greif sicher zu: <code>x?.length</code>, mit Default <code>x?.length ?: 0</code> oder prüfe vorher <code>if (x != null)</code> (Smart Cast)."],
  [/type mismatch|argument type mismatch|initializer type mismatch|return type mismatch|assignment type mismatch/i, "Die Typen passen nicht zusammen. Kotlin wandelt Typen <b>nie automatisch</b> um (auch nicht Int → Double). Nutze z. B. <code>toDouble()</code>, <code>toString()</code>, <code>toInt()</code> oder passe den deklarierten Typ an."],
  [/the integer literal does not conform|the floating-point literal does not conform/i, "Eine Zahl passt nicht zum erwarteten Typ: <code>val d: Double = 42</code> geht nicht, schreib <code>42.0</code>. Für Long: <code>42L</code>, Float: <code>4.2f</code>."],
  [/no value passed for parameter/i, "Beim Aufruf fehlt ein Argument. Prüfe die Parameterliste der Funktion bzw. des Konstruktors (oder gib dem Parameter einen Default-Wert)."],
  [/too many arguments/i, "Beim Aufruf übergibst du mehr Argumente, als die Funktion bzw. der Konstruktor Parameter hat."],
  [/none of the following (candidates|functions)|cannot be called with the arguments/i, "Es gibt Funktionen mit diesem Namen, aber keine passt zu deinen Argumenten (Anzahl oder Typen). Vergleiche die Signatur."],
  [/this type is final/i, "Kotlin-Klassen sind standardmäßig <b>final</b>. Damit man von einer Klasse erben darf, braucht sie <code>open</code> (oder <code>abstract</code>)."],
  [/is final and cannot be overridden/i, "Diese Methode ist nicht <code>open</code>. In der Oberklasse <code>open fun …</code> schreiben, dann kann die Unterklasse sie mit <code>override</code> überschreiben."],
  [/hides member of supertype.*override|needs 'override' modifier|'override' modifier is required/i, "Die Oberklasse hat schon ein Member mit diesem Namen. Willst du es überschreiben: <code>override</code> davor (und in der Oberklasse <code>open</code>). Bei Properties der Oberklasse im Konstruktor <b>kein</b> <code>val</code>/<code>var</code> wiederholen."],
  [/overrides nothing/i, "Mit <code>override</code> behauptest du, ein Member der Oberklasse/des Interfaces zu überschreiben – es gibt dort aber keins mit genau diesem Namen und dieser Parameterliste."],
  [/is not abstract and does not implement/i, "Die Klasse erbt eine <code>abstract</code>-Methode (aus abstrakter Klasse oder Interface), implementiert sie aber nicht. Ergänze <code>override fun …</code> oder mach die Klasse selbst <code>abstract</code>."],
  [/cannot create an instance of an abstract class|cannot create an instance of an interface|interface .* does not have constructors/i, "Von abstrakten Klassen und Interfaces kann man keine Objekte erzeugen. Erzeuge ein Objekt einer konkreten Unterklasse."],
  [/modifier 'open' is incompatible with 'data'|modifier 'data' is incompatible/i, "Eine <code>data class</code> kann nicht <code>open</code> sein, also kann man nicht von ihr erben. Nimm eine normale <code>open class</code> und überschreibe <code>toString()</code> selbst."],
  [/cannot access .*it is private|cannot access .*private/i, "Dieses Member ist <code>private</code> – nur innerhalb der Klasse sichtbar. Von außen geht es nur über eine öffentliche Methode oder Property (z. B. mit <code>private set</code>)."],
  [/cannot access .*before the instance has been initialized|cannot access .*before (the )?superclass constructor/i, "Beim Aufruf des primären Konstruktors (<code>: this(…)</code>) existiert das Objekt noch nicht – Methoden der Klasse sind noch nicht verfügbar. Lege die Hilfsfunktion in ein <code>companion object</code> oder top-level."],
  [/conflicting overloads|conflicting declarations|redeclaration/i, "Derselbe Name ist doppelt deklariert (gleiche Parameterliste). Überladen geht nur mit <b>unterschiedlichen</b> Parametern; Variablen gleichen Namens im selben Block sind nicht erlaubt."],
  [/overload resolution ambiguity/i, "Mehrere Funktionen passen gleich gut zum Aufruf – der Compiler kann sich nicht entscheiden. Typen der Argumente präzisieren."],
  [/'when' expression must be exhaustive|must be exhaustive/i, "Wenn <code>when</code> einen Wert liefert, muss jeder mögliche Fall abgedeckt sein. Ergänze einen <code>else</code>-Zweig (oder alle Enum-/sealed-Fälle)."],
  [/a 'return' expression required|missing return/i, "Eine Funktion mit Block-Körper <code>{ … }</code> und Rückgabetyp braucht ein <code>return</code> auf jedem Weg. Oder nutze die Kurzform <code>fun f() = …</code>."],
  [/variable '.*' must be initialized|must be initialized/i, "Die Variable bzw. Property hat noch keinen Wert. Gib einen Startwert an oder weise ihn auf jedem Weg zu, bevor du sie liest."],
  [/smart cast to .* is impossible/i, "Smart Cast geht hier nicht, weil sich der Wert zwischen Prüfung und Verwendung ändern könnte (z. B. <code>var</code>-Property). Kopiere ihn in eine lokale <code>val</code> oder nutze <code>?.let { }</code>."],
  [/unexpected tokens|expecting '[)}\]]'|expecting an element|expecting an expression|expecting ','|unclosed comment|incorrect character literal|expecting '"'/i, "Syntaxfehler: Meist fehlt eine Klammer <code>)</code> <code>}</code>, ein Komma oder ein Anführungszeichen – oder zwei Anweisungen stehen ohne Zeilenumbruch in einer Zeile. Schau in der genannten Zeile und der Zeile davor."],
  [/unresolved label/i, "Das Label (z. B. <code>@outer</code>) existiert nicht. Es muss vor der Schleife stehen: <code>outer@ for (…)</code>."],
  [/modifier '.*' is not applicable/i, "Dieses Schlüsselwort ist an dieser Stelle nicht erlaubt (z. B. <code>const</code> nur top-level oder in <code>object</code>, <code>private set</code> nur bei <code>var</code>-Properties im Klassenkörper)."],
  [/abstract (function|property) .* in non-abstract class|abstract member .* not abstract class/i, "Abstrakte Member darf nur eine <code>abstract class</code> (oder ein Interface) haben."],
  [/function declaration must have a name|function '.*' must have a body/i, "Eine normale Funktion braucht einen Körper <code>{ … }</code> oder <code>= Ausdruck</code>. Nur <code>abstract</code>-Funktionen und Funktionen in Interfaces dürfen ohne Körper sein."],
  [/'(val|var)' on (secondary constructor|function) parameter/i, "<code>val</code>/<code>var</code> sind nur im <b>primären</b> Konstruktor erlaubt. In Funktionen und sekundären Konstruktoren nur <code>name: Typ</code>."],
  [/class '.*' is final.*data|data class must have at least one/i, "Eine <code>data class</code> braucht mindestens einen <code>val</code>/<code>var</code>-Parameter im primären Konstruktor."],
  [/private set|private setter/i, "<code>private set</code> funktioniert nur bei einer <code>var</code>-Property im Klassenkörper, nicht bei <code>val</code> oder Konstruktorparametern."]
];
const RERR = [
  [/NotImplementedError/, "Hier steht noch <code>TODO()</code> – diese Funktion ist noch nicht implementiert."],
  [/NullPointerException/, "Ein Wert war <code>null</code>, obwohl er es nicht sein durfte – oft durch <code>!!</code>. Lieber <code>?.</code> und <code>?:</code> verwenden."],
  [/ClassCastException/, "Ein <code>as</code>-Cast ist fehlgeschlagen: Das Objekt hat nicht den Typ, auf den du castest. Vorher mit <code>is</code> prüfen oder <code>as?</code> nutzen (liefert null statt Absturz)."],
  [/IndexOutOfBounds|ArrayIndexOutOfBounds|StringIndexOutOfBounds/, "Zugriff auf einen Index, den es nicht gibt. Indizes laufen von <code>0</code> bis <code>size - 1</code> (<code>0 until size</code>)."],
  [/NumberFormatException/, "Ein String ließ sich nicht in eine Zahl umwandeln (<code>\"12a\".toInt()</code>). Sicher: <code>toIntOrNull()</code>."],
  [/ArithmeticException/, "Rechenfehler, meist eine Ganzzahl-Division durch 0."],
  [/IllegalArgumentException/, "Eine Funktion hat ein ungültiges Argument abgelehnt (<code>throw IllegalArgumentException</code> oder <code>require(…)</code>)."],
  [/IllegalStateException/, "Ein Objekt war im falschen Zustand (<code>check(…)</code>, <code>error(…)</code> oder <code>throw IllegalStateException</code>)."],
  [/NoSuchElementException/, "Kein Element vorhanden, z. B. <code>first()</code> auf einer leeren Liste. Alternative: <code>firstOrNull()</code>."],
  [/StackOverflowError/, "Endlose Rekursion: Eine Funktion ruft sich ohne Abbruchbedingung immer wieder selbst auf (oder ein Getter liest sich selbst statt <code>field</code>)."],
  [/ConcurrentModificationException/, "Die Liste wurde verändert, während du darüber iterierst. Erst sammeln, dann ändern – oder <code>removeAll { }</code> nutzen."],
  [/AccessControlException|SecurityException/, "Der Online-Compiler läuft in einer Sandbox: Dateien lesen/schreiben, Netzwerk und System-Befehle sind dort gesperrt. Im Browser deshalb mit Listen statt Dateien üben – in IntelliJ geht es."]
];
KT.explainCompile = msg => (CERR.find(([rx]) => rx.test(msg)) || [0, ""])[1];
KT.explainRuntime = name => (RERR.find(([rx]) => rx.test(name)) || [0, ""])[1];

/* ================= Code-Editor ================= */
const KW = new Set(("fun val var class interface object data open abstract override private protected internal public return if else when for while do in is as break continue throw try catch finally import package companion init constructor this super null true false enum sealed inline get set field lateinit by typealias vararg const suspend operator infix out where reified crossinline noinline tailrec value annotation inner").split(" "));
function hl(src) {
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|("""[\s\S]*?(?:"""|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)|(\b0[xb][0-9a-fA-F_]+L?\b|\b\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?[fFL]?\b)|(@?[A-Za-z_][A-Za-z0-9_]*)(?=(\s*\())?/g;
  let out = "", last = 0, m;
  while ((m = re.exec(src))) {
    out += esc(src.slice(last, m.index)); last = re.lastIndex;
    if (m[1]) out += `<span class="k-com">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="k-str">${esc(m[2]).replace(/\$\{[^}]*\}|\$[A-Za-z_]\w*/g, x => `<span class="k-tpl">${x}</span>`)}</span>`;
    else if (m[3]) out += `<span class="k-num">${m[3]}</span>`;
    else if (m[4]) { const w = m[4]; out += KW.has(w) ? `<span class="k-kw">${w}</span>` : w[0] === "@" ? `<span class="k-ann">${w}</span>` : m[5] !== undefined ? `<span class="k-fn">${w}</span>` : /^[A-Z]/.test(w) ? `<span class="k-type">${w}</span>` : w; }
    if (m[0] === "") re.lastIndex++;
  }
  return out + esc(src.slice(last)) + "\n";
}
KT.hl = hl;
KT.editor = (host, o = {}) => {
  host.innerHTML = `<div class="kted"><div class="kted-g" aria-hidden="true"></div><div class="kted-s"><pre class="kted-hl" aria-hidden="true"></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="${esc(o.label || "Kotlin-Code")}"></textarea></div></div>`;
  const ta = $("textarea", host), pre = $(".kted-hl", host), gut = $(".kted-g", host);
  let marks = {};
  const paint = () => {
    pre.innerHTML = hl(ta.value);
    const n = ta.value.split("\n").length;
    gut.innerHTML = Array.from({ length: n }, (_, i) => `<div class="${marks[i] ? "bad" : ""}" ${marks[i] ? `title="${esc(marks[i])}"` : ""}>${i + 1}</div>`).join("");
    ta.style.height = "0px"; ta.style.height = Math.max(ta.scrollHeight, (o.minLines || 6) * 21 + 20) + "px";
    pre.style.height = ta.style.height;
  };
  const insert = txt => { ta.focus(); if (!document.execCommand || !document.execCommand("insertText", false, txt)) { const s = ta.selectionStart; ta.setRangeText(txt, s, ta.selectionEnd, "end"); } };
  ta.value = o.code || "";
  ta.addEventListener("input", () => { marks = {}; paint(); o.onChange && o.onChange(ta.value); });
  ta.addEventListener("scroll", () => { pre.scrollLeft = ta.scrollLeft; });
  ta.addEventListener("keydown", e => {
    const v = ta.value, s = ta.selectionStart, en = ta.selectionEnd, ls = v.lastIndexOf("\n", s - 1) + 1, line = v.slice(ls, s);
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); o.onRun && o.onRun(); return; }
    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) { const cut = (v.slice(ls).match(/^ {1,4}/) || [""])[0].length; if (cut) { ta.setSelectionRange(ls, ls + cut); insert(""); ta.setSelectionRange(Math.max(ls, s - cut), Math.max(ls, en - cut)); } }
      else insert("    ");
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && s === en) {
      e.preventDefault();
      const ind = (line.match(/^\s*/) || [""])[0], open = /[{(\[]\s*$|->\s*$/.test(line), close = /^\s*[}\])]/.test(v.slice(s));
      if (open && close) { insert("\n" + ind + "    \n" + ind); const p = s + 1 + ind.length + 4; ta.setSelectionRange(p, p); }
      else insert("\n" + ind + (open ? "    " : ""));
      return;
    }
    if (e.key === "}" && /^\s+$/.test(line) && s === en) { e.preventDefault(); const cut = Math.min(4, line.length); ta.setSelectionRange(s - cut, s); insert("}"); }
  });
  paint();
  return {
    ta, get: () => ta.value, set: v => { ta.value = v; marks = {}; paint(); o.onChange && o.onChange(v); },
    mark: m => { marks = m || {}; paint(); }, focus: () => ta.focus(),
    goLine: n => { const pos = ta.value.split("\n").slice(0, n).join("\n").length + (n ? 1 : 0); ta.focus(); ta.setSelectionRange(pos, pos); }
  };
};

/* ================= Ausgabe-Konsole ================= */
const NET = n => n === "offline"
  ? `<span class="err">Du bist offline.</span> Der Kotlin-Compiler läuft auf dem Server von JetBrains – sobald du wieder Internet hast, funktioniert „Ausführen“. Lesen, Tippen und Speichern geht auch offline.`
  : n === "timeout" ? `<span class="err">Zeitüberschreitung.</span> Der Server hat nicht rechtzeitig geantwortet – oft eine Endlosschleife (Bedingung prüfen!) oder der Server ist gerade langsam. Nochmal versuchen.`
  : `<span class="err">Der Kotlin-Server ist gerade nicht erreichbar (${esc(n)}).</span> Später nochmal versuchen – oder den Code kopieren und in <a href="https://play.kotlinlang.org" target="_blank" rel="noopener">play.kotlinlang.org</a> bzw. IntelliJ ausführen.`;
const ln = d => d.interval && d.interval.start ? d.interval.start.line : null;
function errorHTML(errors, userLines, mapLine) {
  const seen = new Set();
  return `<div class="kt-errs"><b class="err">✗ Kompiliert nicht</b>${errors.map(d => {
    const L = ln(d), inUser = L == null || L < userLines, where = L == null ? "" : inUser ? `Zeile ${L + 1}` : (mapLine ? mapLine(L) : "in den Tests"), tip = KT.explainCompile(d.message);
    const key = tip && !seen.has(tip) ? (seen.add(tip), tip) : "";
    return `<div class="kt-err" ${inUser && L != null ? `data-line="${L}"` : ""}><span class="kt-where">${esc(where)}</span><code>${esc(d.message)}</code>${key ? `<div class="kt-tip">💡 ${key}</div>` : ""}</div>`;
  }).join("")}</div>`;
}
function exceptionHTML(ex) {
  const name = ex.fullName || "Exception", tip = KT.explainRuntime(name + " " + (ex.message || ""));
  const frame = (ex.stackTrace || []).find(f => f.fileName === "File.kt");
  return `<div class="kt-errs"><b class="err">✗ Absturz zur Laufzeit</b><div class="kt-err"><span class="kt-where">${frame ? "Zeile " + frame.lineNumber : ""}</span><code>${esc(name)}${ex.message ? ": " + esc(ex.message) : ""}</code>${tip ? `<div class="kt-tip">💡 ${tip}</div>` : ""}</div></div>`;
}
function markErrors(ed, errors, userLines) { const m = {}; errors.forEach(d => { const L = ln(d); if (L != null && L < userLines) m[L] = (m[L] ? m[L] + "\n" : "") + d.message; }); ed.mark(m); }
function wireErrClicks(box, ed) { box.onclick = e => { const x = e.target.closest("[data-line]"); if (x) ed.goLine(+x.dataset.line); }; }

/* ================= Test-Harness ================= */
/* Aus dem Code der Lernenden + den Tests einer Aufgabe wird ein Programm mit eigener main() gebaut.
   Jede Prüfung läuft einzeln in try/catch und meldet sich mit "##KT#<nr>#<status>#<detail>". */
const SHOW = `fun __show(x: Any?): String = when (x) { null -> "null"; is String -> "\\"" + x + "\\""; is Char -> "'" + x + "'"; is Array<*> -> x.contentToString(); else -> x.toString() }
fun __exc(t: Throwable): String = t.javaClass.simpleName + (if (t.message != null) ": " + t.message else "")
fun __r(i: Int, s: String, d: String) = println("##KT#" + i + "#" + s + "#" + d.replace("\\n", "⏎"))`;
const kstr = s => s == null ? "null" : JSON.stringify(String(s)).replace(/\$/g, "\\$");
KT.buildTest = (user, task) => {
  let code = user.replace(/\r/g, "");
  const mm = code.match(/\bfun\s+main\s*\(\s*(\w+\s*:\s*Array<String>)?\s*\)/);
  if (mm) code = code.replace(mm[0], "fun __userMain(" + (mm[1] || "") + ")");
  const userLines = code.split("\n").length;
  const lines = [code, "", (task.prelude || "").trim(), "// ---- StudyOS-Tests (werden automatisch angehängt) ----", SHOW, "fun main() {"];
  if (mm) lines.push(`    try { __userMain(${mm[1] ? "arrayOf()" : ""}) } catch (t: Throwable) { __r(-1, "EXC", __exc(t)) }`);
  const testAt = [];
  task.tests.forEach((t, i) => {
    let body;
    if (t.throws) body = `try { val a: Any? = run { ${t.call} }; __r(${i}, "NOEXC", __show(a)) } catch (t: Throwable) { if (t.javaClass.simpleName == ${kstr(t.throws)}${t.msg != null ? ` && t.message == ${kstr(t.msg)}` : ""}) __r(${i}, "OK", "") else __r(${i}, "WRONG", __exc(t)) }`;
    else body = `try { val a: Any? = run { ${t.call || t.check} }; val e: Any? = run { ${t.check ? "true" : t.expect} }; if (a == e) __r(${i}, "OK", "") else __r(${i}, "FAIL", __show(a)) } catch (t: Throwable) { __r(${i}, "EXC", __exc(t)) }`;
    testAt.push(lines.join("\n").split("\n").length); lines.push("    " + body);
  });
  lines.push("}");
  return { src: lines.join("\n"), userLines, testAt };
};
const testLabel = t => t.name || (t.throws ? `${t.call} wirft ${t.throws}` : t.check ? t.check : `${t.call} == ${t.expect}`);
function testsHTML(task, res) {
  const R = {}, rest = [];
  (res.out || "").split("\n").forEach(l => { const m = l.match(/^##KT#(-?\d+)#(\w+)#(.*)$/); if (m) R[m[1]] = { s: m[2], d: m[3].replace(/⏎/g, "\n") }; else rest.push(l); });
  const ok = task.tests.filter((t, i) => R[i] && R[i].s === "OK").length, all = task.tests.length;
  const items = task.tests.map((t, i) => {
    const r = R[i]; let why = "";
    if (!r) why = "nicht ausgeführt";
    else if (r.s === "FAIL") why = `erwartet <code>${esc(t.expect != null ? t.expect : "true")}</code>, bekommen <code>${esc(r.d)}</code>`;
    else if (r.s === "EXC") why = /NotImplementedError/.test(r.d) ? "noch nicht implementiert (TODO)" : `Exception: <code>${esc(r.d)}</code>`;
    else if (r.s === "NOEXC") why = `erwartet: wirft <code>${esc(t.throws)}</code> – es kam aber <code>${esc(r.d)}</code> zurück`;
    else if (r.s === "WRONG") why = `erwartet <code>${esc(t.throws)}${t.msg != null ? ": " + esc(t.msg) : ""}</code>, bekommen <code>${esc(r.d)}</code>`;
    return `<li class="${r && r.s === "OK" ? "ok" : "no"}"><span>${r && r.s === "OK" ? "✓" : "✗"}</span><div><code>${esc(testLabel(t))}</code>${why ? `<small>${why}</small>` : ""}</div></li>`;
  }).join("");
  const um = R["-1"] ? `<div class="kt-tip">Deine main() ist abgestürzt: <code>${esc(R["-1"].d)}</code></div>` : "";
  const txt = rest.join("\n").replace(/\n+$/, "");
  return { ok, all, html: `${txt ? `<div class="kt-sub">Ausgabe</div><pre class="kt-out">${esc(txt)}</pre>` : ""}${um}<div class="kt-sub">Tests ${ok}/${all}</div><ul class="kt-tests">${items}</ul>` };
}

/* ================= W.ktrun – „Ausprobieren“ in Lektionen =================
   Block: { t:"widget", w:"ktrun", title, code, note?, goal?, expect?, predict?: { q?, opts:[…], a, why? }, topic? } */
W.ktrun = (el, b, l) => {
  const key = "run:" + (l ? l.id : "x") + ":" + (b.title || b.code.slice(0, 40));
  const saved = st().runs && st().runs[key];
  let picked = b.predict ? (st().pred || {})[key] : undefined, running = false;
  el.classList.add("kt-card");
  el.innerHTML = `<div class="w">${head(esc(b.title || "Ausprobieren"), b.predict ? "Vorhersage" : b.goal ? "Mini-Challenge" : "Ausprobieren", `<small class="muted kt-online"></small>`)}
    ${b.note ? `<p class="muted">${b.note}</p>` : ""}
    ${b.predict ? `<div class="kt-pred"></div>` : ""}
    ${b.goal ? `<div class="kt-goal"><b>Ziel:</b> ${b.goal}</div>` : ""}
    <div class="kt-ed"></div>
    <div class="ed-actions kt-act"><button class="btn pri sm" data-k="run">▶ Ausführen</button><button class="btn sm" data-k="reset">↺ Original</button><button class="btn sm" data-k="copy">⧉ Kopieren</button><button class="btn ghost sm" data-k="play">In Spielwiese öffnen</button>${b.solution ? `<button class="btn ghost sm" data-k="sol">Lösung zeigen</button>` : ""}<small class="faint kt-kbd">Strg + Enter</small></div>
    <div class="kt-solbox" hidden></div>
    <div class="kt-res" hidden></div></div>`;
  const res = $(".kt-res", el);
  const ed = KT.editor($(".kt-ed", el), { code: saved || b.code, minLines: Math.min(8, b.code.split("\n").length), onRun: () => run(),
    onChange: v => { const k = st(); k.runs = k.runs || {}; if (v === b.code) delete k.runs[key]; else k.runs[key] = v; clearTimeout(ed && ed._t); if (ed) ed._t = setTimeout(App.save, 900); } });
  const drawPred = () => { const p = $(".kt-pred", el); if (!p) return; const P = b.predict;
    p.innerHTML = `<p><b>${P.q || "Was gibt das Programm aus? Erst tippen, dann ausführen."}</b></p><div class="kt-opts">${P.opts.map((o, i) => `<button class="opt ${picked == null ? "" : i === P.a ? "ok" : i === picked ? "no" : ""}" data-p="${i}" ${picked != null ? "disabled" : ""}><span>${esc(o)}</span></button>`).join("")}</div>${picked != null ? `<div class="why"><b>${picked === P.a ? "Richtig!" : "Nicht ganz."}</b> ${P.why || ""} Führe den Code aus und überzeug dich selbst – dann verändere ihn.</div>` : ""}`; };
  drawPred();
  const run = async () => {
    if (running) return; running = true;
    const btn = $("[data-k=run]", el); btn.disabled = true; btn.textContent = "Läuft …"; res.hidden = false; res.innerHTML = `<div class="faint">Kompiliere und starte auf dem Kotlin-Server …</div>`;
    const code = ed.get(), r = await KT.run(code); running = false; btn.disabled = false; btn.textContent = "▶ Ausführen";
    if (r.net) { res.innerHTML = `<div class="kt-msg">${NET(r.net)}</div>`; return; }
    markErrors(ed, r.errors, code.split("\n").length);
    let h = "";
    if (r.errors.length) h = errorHTML(r.errors, code.split("\n").length);
    else {
      const out = (r.out || "").replace(/\n$/, "");
      h = `<div class="kt-sub">Ausgabe</div><pre class="kt-out">${out ? esc(out) : `<span class="faint">(keine Ausgabe – nutze println(…))</span>`}${r.err ? `\n<span class="err">${esc(r.err)}</span>` : ""}</pre>`;
      if (r.exception) h += exceptionHTML(r.exception);
      if (b.expect != null) { const hit = out.trim() === String(b.expect).trim(); h += hit ? `<div class="kt-win">✓ Ziel erreicht!</div>` : `<div class="kt-tip">Noch nicht die Ziel-Ausgabe: <code>${esc(b.expect)}</code></div>`;
        if (hit) { const k = st(); k.goals = k.goals || {}; if (!k.goals[key]) { k.goals[key] = 1; App.rec(b.topic || (l && l.topic), 1); App.save(); } } }
    }
    res.innerHTML = h; wireErrClicks(res, ed);
  };
  el.addEventListener("click", e => {
    const p = e.target.closest("[data-p]"); if (p && picked == null) { picked = +p.dataset.p; const k = st(); k.pred = k.pred || {}; k.pred[key] = picked; App.rec(b.topic || (l && l.topic), picked === b.predict.a ? 1 : 0); App.save(); drawPred(); return; }
    const k = e.target.closest("[data-k]"); if (!k) return;
    if (k.dataset.k === "run") run();
    if (k.dataset.k === "reset") { ed.set(b.code); res.hidden = true; }
    if (k.dataset.k === "copy") copy(ed.get(), k);
    if (k.dataset.k === "play") { st().play = ed.get(); App.save(); App.go("ktlab", "play"); }
    if (k.dataset.k === "sol") { const box = $(".kt-solbox", el); box.hidden = !box.hidden; k.textContent = box.hidden ? "Lösung zeigen" : "Lösung ausblenden";
      if (!box.hidden) box.innerHTML = `<div class="hint"><b>Eine mögliche Lösung</b><pre class="kt-sol">${hl(b.solution)}</pre><button class="btn sm" data-k="soluse">In den Editor übernehmen</button></div>`; }
    if (k.dataset.k === "soluse") ed.set(b.solution);
  });
  online($(".kt-online", el));
};
function copy(txt, btn) { const done = () => { const o = btn.textContent; btn.textContent = "✓ Kopiert"; setTimeout(() => btn.textContent = o, 1400); };
  if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, () => {}); else { const t = document.createElement("textarea"); t.value = txt; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); done(); } }
function online(x) { if (x) x.textContent = navigator.onLine === false ? "offline – Ausführen braucht Internet" : "echter Kotlin-Compiler"; }

/* ================= W.ktlab – Übungsblatt mit Tests =================
   Block: { t:"widget", w:"ktlab", lab:"<lab-id>", start?:"<task-id>" } oder { tasks:["id", …] } */
W.ktlab = (el, b, l) => {
  const ids = b.tasks || (LAB[b.lab] ? LAB[b.lab].tasks.map(t => t.id) : []);
  if (!ids.length) { el.innerHTML = `<p class="muted">Übungsblatt nicht gefunden.</p>`; return; }
  let cur = b.start && ids.includes(b.start) ? b.start : ids.find(id => !(st().tasks[id] || {}).solved) || ids[0];
  let hints = {}, sol = {}, ed = null, running = false;
  const lab = LAB[b.lab];
  el.classList.add("kt-card");
  const draw = () => {
    const t = TASK[cur], ps = taskState(cur), h = Math.max(hints[cur] || 0, 0), solved = ids.filter(id => (st().tasks[id] || {}).solved).length;
    el.innerHTML = `<div class="w">${head(esc(b.title || (lab ? lab.title : "Kotlin-Übungen")), "Kotlin + Tests", `<small class="muted tab">${solved}/${ids.length} gelöst</small>`)}
      ${ids.length > 1 ? `<div class="kt-tabs">${ids.map((id, i) => `<button data-t="${id}" class="${id === cur ? "on" : ""} ${(st().tasks[id] || {}).solved ? "solved" : ""}" title="${esc(TASK[id].title)}">${i + 1}. ${esc(TASK[id].short || TASK[id].title)}</button>`).join("")}</div>` : ""}
      <div class="kt-lab">
        <div class="kt-task"><div class="spread"><h3>${esc(t.title)}</h3>${ps.solved ? `<span class="chip acc">✓ Gelöst</span>` : t.level ? `<span class="chip">${"●".repeat(t.level)}${"○".repeat(3 - t.level)}</span>` : ""}</div>
          <div class="kt-prompt">${t.prompt}</div>
          <details class="kt-testlist"><summary>Diese Tests muss dein Code bestehen (${t.tests.length})</summary><ul>${t.tests.map(x => `<li><code>${esc(testLabel(x))}</code></li>`).join("")}</ul></details>
          ${h ? `<div class="col" style="gap:8px">${t.hints.slice(0, h).map((x, i) => `<div class="hint"><b>Tipp ${i + 1}</b><div>${x}</div></div>`).join("")}</div>` : ""}
          ${sol[cur] === 1 ? `<div class="confirm" style="background:var(--warn-soft);border-color:rgba(242,184,75,.3)">Lösung wirklich anzeigen? Versuch es noch ein bisschen – so lernst du am meisten.<div class="row"><button class="btn sm" data-a="sol-yes">Lösung zeigen</button><button class="btn ghost sm" data-a="sol-no">Weiter probieren</button></div></div>` : ""}
          ${sol[cur] === 2 ? `<div class="hint"><b>Musterlösung</b><pre class="kt-sol">${hl(t.solution)}</pre>${t.explain ? `<div>${t.explain}</div>` : ""}<button class="btn sm" data-a="sol-use">In den Editor übernehmen</button></div>` : ""}
        </div>
        <div class="kt-work"><div class="kt-ed"></div>
          <div class="ed-actions"><button class="btn pri sm" data-a="run">▶ Tests ausführen</button><button class="btn sm" data-a="hint" ${h >= t.hints.length ? "disabled" : ""}>💡 Tipp${h < t.hints.length ? ` (${h + 1}/${t.hints.length})` : ""}</button><button class="btn sm" data-a="showsol" ${sol[cur] ? "hidden" : ""}>Lösung …</button><button class="btn ghost sm" data-a="reset">↺ Neu anfangen</button><button class="btn ghost sm" data-a="copy">⧉</button><small class="faint kt-kbd">Strg + Enter</small></div>
          <div class="kt-res"><span class="faint">Schreib deinen Code und starte die Tests. Sie laufen auf dem echten Kotlin-Compiler – wie die test()-Zellen im Notebook.</span></div>
        </div></div></div>`;
    ed = KT.editor($(".kt-ed", el), { code: ps.code != null ? ps.code : t.starter, minLines: 10, onRun: () => run(),
      onChange: v => { taskState(cur).code = v; clearTimeout(ed && ed._t); if (ed) ed._t = setTimeout(App.save, 800); } });
  };
  const run = async () => {
    if (running) return; running = true;
    const t = TASK[cur], ps = taskState(cur), code = ed.get(), res = $(".kt-res", el), btn = $("[data-a=run]", el);
    btn.disabled = true; btn.textContent = "Läuft …"; res.innerHTML = `<div class="faint">Kompiliere und teste …</div>`;
    const B = KT.buildTest(code, t), r = await KT.run(B.src); running = false; btn.disabled = false; btn.textContent = "▶ Tests ausführen";
    ps.attempts = (ps.attempts || 0) + 1; ps.code = code;
    if (r.net) { res.innerHTML = `<div class="kt-msg">${NET(r.net)}</div>`; App.save(); return; }
    markErrors(ed, r.errors, B.userLines);
    if (r.errors.length) {
      const mapLine = L => { let i = -1; B.testAt.forEach((at, k) => { if (L >= at) i = k; }); return i >= 0 ? `Test ${i + 1}: ${testLabel(t.tests[i])}` : "im Test-Code"; };
      const inTests = r.errors.some(d => ln(d) != null && ln(d) >= B.userLines);
      res.innerHTML = errorHTML(r.errors, B.userLines, mapLine) + (inTests ? `<div class="kt-tip">Fehler „in den Tests“ heißen meist: Die Tests rufen deine Funktion anders auf, als du sie geschrieben hast. Vergleiche <b>Name, Parameter-Typen und Rückgabetyp</b> mit der Aufgabe.</div>` : "");
      wireErrClicks(res, ed); App.rec(t.topic, 0); App.save(); return;
    }
    const T = testsHTML(t, r); let h = T.html;
    if (r.exception) h += exceptionHTML(r.exception);
    const plain = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
    const rules = (t.forbid || []).filter(([rx]) => new RegExp(rx).test(plain)).concat((t.require || []).filter(([rx]) => !new RegExp(rx).test(plain))).map(x => x[1]);
    if (T.ok === T.all && rules.length) h = `<div class="kt-tip">Alle Tests sind grün – aber die Aufgabe hat eine Regel: <b>${rules.map(esc).join(" · ")}</b></div>` + h;
    else if (T.ok === T.all) {
      const first = !ps.solved; ps.solved = true; ps.solvedAt = ps.solvedAt || Date.now();
      h = `<div class="kt-win">✓ Alle ${T.all} Tests bestanden! 😄${first ? "" : " (schon gelöst)"}</div>` + h;
      if (first) App.rec(t.topic, ps.sawSolution ? 0.4 : Math.max(0.5, 1 - 0.15 * (ps.hints || 0)));
      const nx = ids.find(id => !(st().tasks[id] || {}).solved); if (nx) h += `<div><button class="btn sm" data-t="${nx}">Nächste Aufgabe →</button></div>`;
      $$(".kt-tabs button", el).forEach(x => x.classList.toggle("solved", !!(st().tasks[x.dataset.t] || {}).solved));
    } else App.rec(t.topic, T.ok / T.all * 0.5);
    KT.lastRun = { task: t.id, ok: T.ok, all: T.all, rules };
    App.save(); res.innerHTML = h;
  };
  el.onclick = e => {
    const tb = e.target.closest("[data-t]"); if (tb) { cur = tb.dataset.t; draw(); el.scrollIntoView({ block: "nearest" }); return; }
    const a = e.target.closest("[data-a]"); if (!a) return; const t = TASK[cur], ps = taskState(cur);
    ({ run, hint: () => { hints[cur] = Math.min(t.hints.length, (hints[cur] || 0) + 1); ps.hints = Math.max(ps.hints || 0, hints[cur]); App.save(); keep(); },
      showsol: () => { sol[cur] = 1; keep(); }, "sol-no": () => { sol[cur] = 0; keep(); },
      "sol-yes": () => { sol[cur] = 2; ps.sawSolution = true; App.save(); keep(); },
      "sol-use": () => { ed.set(t.solution); },
      reset: () => { if (ed.get() !== t.starter && !confirm("Deinen Code durch die Vorlage ersetzen?")) return; ed.set(t.starter); },
      copy: () => copy(ed.get(), a) })[a.dataset.a]();
  };
  const keep = () => { const code = ed.get(), out = $(".kt-res", el).innerHTML; draw(); ed.set(code); $(".kt-res", el).innerHTML = out; };
  draw();
};

/* ================= PAGES.ktlab – Kotlin-Labor ================= */
const TEMPLATES = [
  ["Hallo Kotlin", `fun main() {\n    val name = "Kevin"\n    println("Hallo, $name!")\n}`],
  ["Klasse & Objekt", `class Student(val name: String, var semester: Int = 1) {\n    fun advance() { semester++ }\n    override fun toString() = "$name (Semester $semester)"\n}\n\nfun main() {\n    val s = Student("Kevin", 3)\n    s.advance()\n    println(s)\n}`],
  ["data class", `data class Course(val code: String, val ects: Double)\n\nfun main() {\n    val a = Course("MAPPDEV", 5.0)\n    val b = a.copy(ects = 2.5)\n    println(a)\n    println(a == Course("MAPPDEV", 5.0))\n    val (code, ects) = b\n    println("$code hat $ects ECTS")\n}`],
  ["Vererbung & Polymorphismus", `open class Person(val firstname: String, val lastname: String) {\n    open fun sayHello() = "Hi! I'm $firstname, $lastname."\n}\n\nclass Student(firstname: String, lastname: String, val degreeProgram: String) :\n    Person(firstname, lastname) {\n    override fun sayHello() = "Hi! I'm $firstname and studying $degreeProgram."\n}\n\nfun main() {\n    val people: List<Person> = listOf(Person("Clara", "Watson"), Student("John", "Doe", "IMA"))\n    people.forEach { println(it.sayHello()) }\n}`],
  ["Interface", `interface Infoable {\n    fun info(): String\n}\n\nclass Car(val make: String, val model: String, val year: Int) : Infoable {\n    override fun info() = "$make $model, built in $year"\n}\n\nfun main() {\n    val items: List<Infoable> = listOf(Car("VW", "Golf", 2016))\n    items.forEach { println(it.info()) }\n}`],
  ["Collections & Lambdas", `fun main() {\n    val grades = listOf(2, 3, 1, 1, 2, 4, 4)\n    println(grades.filter { it <= 2 })\n    println(grades.map { it * 10 })\n    println(grades.fold(0) { acc, g -> acc + g })\n    println(grades.groupingBy { it }.eachCount())\n}`],
  ["Null Safety", `fun main() {\n    val input: String? = null\n    println(input?.length ?: 0)\n    val n = "42".toIntOrNull()\n    if (n != null) println(n + 1)   // Smart Cast\n}`],
  ["Leer", `fun main() {\n    \n}`]
];
PAGES.ktlab = (el, p) => {
  let tab = p === "play" ? "play" : p && p.startsWith("lab:") ? "labs" : p === "err" ? "err" : (S().ui && S().ui.ktTab) || "labs";
  let openLab = p && p.startsWith("lab:") ? p.slice(4) : null;
  const draw = () => {
    S().ui = Object.assign(S().ui || {}, { ktTab: tab });
    el.innerHTML = `<div class="page"><div><h1>Kotlin-Labor</h1><p class="muted" style="margin-top:6px">Echter Kotlin-Code direkt im Browser – kompiliert und ausgeführt vom offiziellen Kotlin-Compiler von JetBrains. Ausführen braucht Internet, dein Code wird lokal gespeichert.</p></div>
      <div class="kt-pages">${[["labs", "Übungsblätter"], ["play", "Spielwiese"], ["err", "Fehler-Übersetzer"]].map(([k, t]) => `<button class="chip ${tab === k ? "on" : ""}" data-tab="${k}">${t}</button>`).join("")}</div>
      <div id="ktp" class="col" style="gap:16px"></div></div>`;
    const box = $("#ktp", el);
    if (tab === "labs") {
      if (openLab && LAB[openLab]) {
        const lab = LAB[openLab];
        box.innerHTML = `<div class="row"><button class="btn sm" data-lab="">← Alle Übungsblätter</button>${lab.lesson ? `<button class="btn ghost sm" data-go="lesson" data-p="${lab.lesson}">Zur Lektion</button>` : ""}</div>${lab.sub ? `<p class="muted">${lab.sub}</p>` : ""}<div class="card" id="ktl"></div>`;
        App.mountWidget($("#ktl", box), "ktlab", { lab: lab.id, title: lab.title });
      } else {
        const tot = LABS.reduce((s, x) => s + x.tasks.length, 0), done = LABS.reduce((s, x) => s + labSolved(x), 0);
        box.innerHTML = `<div class="card spread"><div><b>${done} von ${tot} Aufgaben gelöst</b><div class="muted">Jede Aufgabe hat automatische Tests. Grün = bestanden. Tipps gibt es stufenweise, die Musterlösung erst ganz am Ende.</div></div><div style="min-width:140px">${App.bar ? App.bar(tot ? 100 * done / tot : 0) : ""}</div></div>
          <div class="grid g2">${LABS.map(x => { const n = labSolved(x); return `<button class="card kt-labcard" data-lab="${x.id}"><span class="eyebrow">${esc(x.chapter || "")}</span><h3>${esc(x.title)}</h3><p class="muted">${x.sub || ""}</p><div class="spread"><small>${n}/${x.tasks.length} gelöst</small><small class="muted">${x.tasks.map(t => (st().tasks[t.id] || {}).solved ? "●" : "○").join("")}</small></div></button>`; }).join("")}</div>`;
      }
    }
    if (tab === "play") {
      const k = st();
      box.innerHTML = `<div class="card col" style="gap:10px"><div class="spread"><div class="row"><select id="kt-tpl" aria-label="Vorlage"><option value="">Vorlage laden …</option>${TEMPLATES.map((x, i) => `<option value="${i}">${esc(x[0])}</option>`).join("")}</select>${k.snippets.length ? `<select id="kt-snip" aria-label="Gespeichert"><option value="">Gespeichert …</option>${k.snippets.map((x, i) => `<option value="${i}">${esc(x.name)}</option>`).join("")}</select>` : ""}</div><small class="muted kt-online"></small></div>
        <div class="kt-ed"></div>
        <div class="ed-actions"><button class="btn pri sm" data-a="run">▶ Ausführen</button><button class="btn sm" data-a="save">Speichern unter …</button>${k.snippets.length ? `<button class="btn ghost sm" data-a="del">Gespeichertes löschen …</button>` : ""}<button class="btn ghost sm" data-a="copy">⧉ Kopieren</button><small class="faint kt-kbd">Strg + Enter</small></div>
        <div class="kt-res" hidden></div></div>
        <div class="card"><h3>So funktioniert die Spielwiese</h3><ul class="keys"><li><span>Alles, was laufen soll, gehört in <code>fun main() { … }</code>. Klassen, Funktionen und Interfaces stehen <b>außerhalb</b> davon.</span></li><li><span><code>println(…)</code> schreibt in die Ausgabe. Fehler werden auf Deutsch erklärt, die Zeile wird markiert – auf den Fehler tippen springt hin.</span></li><li><span>Dateien lesen, Netzwerk und <code>readln()</code> gehen im Browser nicht (Sandbox). Dafür IntelliJ nutzen.</span></li></ul></div>`;
      const res = $(".kt-res", box);
      const ed = KT.editor($(".kt-ed", box), { code: k.play || TEMPLATES[0][1], minLines: 14, onRun: () => run(), onChange: v => { k.play = v; clearTimeout(ed && ed._t); if (ed) ed._t = setTimeout(App.save, 800); } });
      const run = async () => { const b = $("[data-a=run]", box); b.disabled = true; b.textContent = "Läuft …"; res.hidden = false; res.innerHTML = `<div class="faint">Kompiliere …</div>`;
        const code = ed.get(), r = await KT.run(code); b.disabled = false; b.textContent = "▶ Ausführen";
        if (r.net) { res.innerHTML = `<div class="kt-msg">${NET(r.net)}</div>`; return; }
        markErrors(ed, r.errors, code.split("\n").length);
        res.innerHTML = r.errors.length ? errorHTML(r.errors, code.split("\n").length) : `<div class="kt-sub">Ausgabe</div><pre class="kt-out">${esc((r.out || "").replace(/\n$/, "")) || `<span class="faint">(keine Ausgabe)</span>`}</pre>${r.exception ? exceptionHTML(r.exception) : ""}`;
        wireErrClicks(res, ed); };
      $("#kt-tpl", box).onchange = e => { const i = e.target.value; if (i === "") return; if (ed.get().trim() && ed.get() !== k.play && !confirm("Aktuellen Code ersetzen?")) return; ed.set(TEMPLATES[+i][1]); e.target.value = ""; };
      const sn = $("#kt-snip", box); if (sn) sn.onchange = e => { const i = e.target.value; if (i === "") return; ed.set(k.snippets[+i].code); e.target.value = ""; };
      box.onclick = e => { const a = e.target.closest("[data-a]"); if (!a) return;
        if (a.dataset.a === "run") run();
        if (a.dataset.a === "copy") copy(ed.get(), a);
        if (a.dataset.a === "save") { const n = prompt("Name für dieses Snippet:", "Snippet " + (k.snippets.length + 1)); if (!n) return; const ex = k.snippets.find(x => x.name === n); if (ex) ex.code = ed.get(); else k.snippets.push({ name: n, code: ed.get(), t: Date.now() }); App.save(); draw(); }
        if (a.dataset.a === "del") { const n = prompt("Welches löschen? Namen eintippen:\n" + k.snippets.map(x => "• " + x.name).join("\n")); const i = k.snippets.findIndex(x => x.name === n); if (i >= 0) { k.snippets.splice(i, 1); App.save(); draw(); } } };
      online($(".kt-online", box));
    }
    if (tab === "err") {
      box.innerHTML = `<div class="card col" style="gap:10px"><h3>Fehlermeldung einfügen</h3><p class="muted">Aus IntelliJ, Android Studio oder dem Notebook kopieren – StudyOS erklärt, was sie bedeutet und was meist hilft.</p><textarea id="kt-msg" rows="4" placeholder="z. B. Line_28.jupyter.kts (3:77 - 83) This type is final, so it cannot be inherited from"></textarea><div id="kt-exp"></div></div>
        <div class="card"><h3>Die häufigsten Fehler auf einen Blick</h3><div class="kt-errgrid">${CERR.slice(0, 22).map(([rx, tip]) => `<div><code>${esc(rx.source.split("|")[0].replace(/\\/g, "").replace(/\.\*/g, " … ").replace(/[()?]/g, ""))}</code><div class="muted">${tip}</div></div>`).join("")}</div></div>`;
      const ta = $("#kt-msg", box), ex = $("#kt-exp", box);
      ta.oninput = () => { const v = ta.value.trim(); if (!v) { ex.innerHTML = ""; return; } const c = KT.explainCompile(v), r = KT.explainRuntime(v);
        ex.innerHTML = c || r ? `<div class="kt-tip">💡 ${c || r}</div>` : `<div class="muted">Dazu kenne ich noch keine Erklärung. Tipp: Lies die Meldung von hinten – meist steht dort, welcher Name oder Typ das Problem ist, und die Zahl in Klammern ist (Zeile:Spalte).</div>`; };
    }
  };
  el.onclick = e => { const t = e.target.closest("[data-tab]"); if (t) { tab = t.dataset.tab; openLab = null; draw(); return; } const lb = e.target.closest("[data-lab]"); if (lb) { openLab = lb.dataset.lab || null; tab = "labs"; draw(); window.scrollTo({ top: 0 }); } };
  draw();
};

/* ================= Übungen-Seite: Kotlin-Übungsblätter des Kurses ================= */
const prevPractice = PAGES.practice;
PAGES.practice = (el, start) => {
  prevPractice(el, start);
  const c = App.CBY[S().course]; if (!c || !c.ktLabs || !c.ktLabs.length) return; const pr = $("#pr", el); if (!pr) return;
  const emp = $(".empty", pr); if (emp) emp.remove();
  const sec = document.createElement("div"); sec.className = "col"; sec.style.gap = "12px";
  sec.innerHTML = `<div><h2>Kotlin programmieren</h2><p class="muted">Übungsblätter mit automatischen Tests – echter Kotlin-Compiler im Browser. Mehr im <button class="linkbtn" data-go="ktlab">Kotlin-Labor</button>.</p></div>
    <div class="grid g2">${c.ktLabs.map(x => `<button class="card kt-labcard" data-go="ktlab" data-p="lab:${x.id}"><span class="eyebrow">${esc(x.chapter || "")}</span><h3>${esc(x.title)}</h3><small>${labSolved(x)}/${x.tasks.length} gelöst</small></button>`).join("")}</div>`;
  pr.prepend(sec);
};

/* Skript: Ausprobieren-Blöcke als Code anzeigen */
App.ktSkript = (b, l) => b.w === "ktrun" ? `<div class="sk-code"><span class="eyebrow">${esc(b.title || "Ausprobieren")}</span><pre><code>${esc(b.code)}</code></pre><button class="linkbtn" data-go="lesson" data-p="${l.id}">▸ In der Lektion ausführen und verändern</button></div>`
  : b.w === "ktlab" ? `<p class="sk-widget"><button class="linkbtn" data-go="ktlab" data-p="lab:${esc(b.lab || "")}">▸ Kotlin-Übungsblatt${LAB[b.lab] ? ": " + esc(LAB[b.lab].title) : ""} – im Kotlin-Labor</button></p>` : null;

/* Version vorab holen, damit der erste Klick schneller ist */
if (navigator.onLine !== false) setTimeout(() => { if (LABS.length) KT.version(); }, 4000);
})();
