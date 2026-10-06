/* VORLAGE für ein neues MAppDev-Kapitel – kopieren als courses/mappdev/kNN-thema.js
   (Dateien mit „_“ am Anfang werden nicht geladen.)

   Einbauen:
     1. index.html:  <script src="courses/mappdev/kNN-thema.js"></script>  zu den anderen Kapiteln (vor courses/ext-apply.js)
     2. sw.js:       "courses/mappdev/kNN-thema.js" in SHELL eintragen und VERSION hochzählen
   Alles hier ist optional – nimm nur, was das Kapitel braucht.

   Achtung in `…`-Texten (Template-Strings): \ als \\ schreiben, ` als \`, und ${ als \${
   (sonst versucht JavaScript, Kotlins "$name" / "${x}" selbst auszuwerten). In "…"-Strings: \n für Zeilenumbrüche.

   Kotlin-Beispiele und Übungen laufen auf dem echten Compiler (api.kotlinlang.org). Vor dem Hochladen
   jede Musterlösung einmal in der Spielwiese (Kotlin-Labor) ausführen. */
(function () {
const EXT = window.STUDYOS_EXT = window.STUDYOS_EXT || {};
(EXT["mappdev"] = EXT["mappdev"] || []).push({
  id: "mappdev-kNN",

  /* Neue Themen → tauchen in Wiederholung, Prüfung üben und „Wissen %“ auf */
  topics: {
    "mad-xyz": { name: "Thema XYZ", lesson: "madkN-1" }
  },

  /* Entweder eine GANZ NEUE Welt (= Kapitel im Lernpfad) … */
  world: {
    id: "madwN", n: 99, title: "Kapitel-Titel", sub: "Worum es geht",
    boss: { id: "boss-madwN", title: "Kapiteltest: …", topics: ["mad-xyz"] },
    lessons: [
      {
        id: "madkN-1", title: "Lektionstitel", topic: "mad-xyz", min: 15, xp: 0,
        blocks: [
          { t: "lead", html: "Ein Satz, der neugierig macht." },
          { t: "text", h: "Überschrift", levels: {
              simple: "Erklärung für „Einfach“.",
              normal: "Erklärung für „Normal“ (HTML erlaubt: <code>val</code>, <b>fett</b>).",
              technical: "Erklärung für „Fachlich“." } },

          /* Ausführbares Beispiel (Ausprobieren) */
          { t: "widget", w: "ktrun", title: "Beispiel", note: "Was man hier ausprobieren soll.",
            code: `fun main() {
    val name = "Kevin"
    println("Hallo, \${name}!")
}` },

          /* Vorhersage: erst tippen, dann ausführen */
          { t: "widget", w: "ktrun", title: "Was kommt raus?", code: `fun main() {\n    println(7 / 2)\n}`,
            predict: { opts: ["3.5", "3", "4"], a: 1, why: "Int / Int ist Ganzzahl-Division." } },

          /* Mini-Challenge: Ziel-Ausgabe erreichen (solution = „Lösung zeigen“) */
          { t: "widget", w: "ktrun", title: "Fehler-Detektiv", goal: "Ändere ein Wort, sodass <code>1</code> ausgegeben wird.",
            code: `fun main() {\n    val n = 0\n    n = n + 1\n    println(n)\n}`, expect: "1",
            solution: `fun main() {\n    var n = 0\n    n = n + 1\n    println(n)\n}` },

          /* Übungsblatt mit Tests einbetten (Labs siehe unten) */
          { t: "widget", w: "ktlab", lab: "kt-xyz" }
        ]
      }
    ]
  },

  /* … oder bestehende Welten/Lektionen erweitern */
  worldPatch: { madw5: { bossTopics: ["mad-xyz"] } },                         // Thema in den Kapiteltest aufnehmen
  lessons: [{ world: "madw5", after: "mad5-3", lesson: { id: "madkN-2", title: "…", topic: "mad-xyz", blocks: [] } }],
  blocks: { "mad5-1": [ /* Blöcke wie oben; at: 2 → nach dem 3. Originalblock */ ] },

  /* Fragen (Wiederholung/Prüfung) und Karteikarten – Format wie in courses/mappdev.js */
  questions: [
    { id: "madkNq1", topic: "mad-xyz", q: "Frage?", opts: ["A", "B", "C", "D"], a: 0, why: "Begründung.", ex: "Merksatz." }
  ],
  flashcards: [
    { id: "madkNf1", cat: "Kotlin", topic: "mad-xyz", front: "Vorderseite", back: "Rückseite" }
  ],

  /* Übungsblätter fürs Kotlin-Labor. Tests:
       { call: "add(1, 2)", expect: "3" }                       Ergebnis vergleichen (expect ist Kotlin-Code)
       { call: "div(1, 0)", throws: "IllegalArgumentException", msg: "durch 0" }   Exception erwartet
       { check: "Person(\"a\").toString() == \"…\"", name: "Beschreibung" }         beliebige Bedingung
     forbid / require: [[regex, Meldung]] – prüft den Code (ohne Kommentare), z. B. „ohne .filter lösen“. */
  labs: [
    { id: "kt-xyz", title: "Übungsblatt XYZ", sub: "Kurzbeschreibung", lesson: "madkN-1", tasks: [
      { id: "x-add", title: "Addieren", short: "add", level: 1, topic: "mad-xyz",
        prompt: "<p>Schreibe <code>add(a: Int, b: Int): Int</code>.</p>",
        starter: `fun add(a: Int, b: Int): Int {\n    TODO()\n}`,
        solution: `fun add(a: Int, b: Int): Int = a + b`,
        tests: [{ call: "add(40, 2)", expect: "42" }, { call: "add(-1, 1)", expect: "0" }],
        hints: ["Der Operator heißt +.", "Einzeilig geht es mit = a + b"],
        explain: "Optional: Erklärung, die mit der Musterlösung erscheint.",
        forbid: [["\\bplus\\(", "Bitte mit + lösen, nicht mit plus()."]] }
    ] }
  ]
});
})();
