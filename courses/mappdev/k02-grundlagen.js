/* MAPPDEV · Kapitel 2–4 interaktiv: Kotlin-Grundlagen zum Ausprobieren + Übungsblatt Session 1
   Aufbau eines Kapitels: siehe courses/mappdev/_VORLAGE.js */
(function () {
const EXT = window.STUDYOS_EXT = window.STUDYOS_EXT || {};
(EXT["mappdev"] = EXT["mappdev"] || []).push({
  id: "mappdev-k02",
  blocks: {
    "mad2-1": [
      {
        t: "widget",
        w: "ktrun",
        title: "val, var und const",
        note: "Ändere Werte, entferne den Kommentar in der letzten Zeile und schau dir die (deutsche) Fehlererklärung an.",
        code: `const val MAX_ECTS = 30          // Compile-Zeit-Konstante (top-level)

fun main() {
    val name = "Kevin"           // read-only: einmal zuweisen
    var semester = 3             // veränderbar
    semester++
    println("$name ist im $semester. Semester")
    println("Maximal $MAX_ECTS ECTS pro Semester")
    // name = "Angi"             // ← Kommentar entfernen und ausführen: Val cannot be reassigned
}`
      },
      {
        t: "widget",
        w: "ktrun",
        title: "Fehler-Detektiv: Zähler",
        goal: "Das Programm kompiliert nicht. Ändere <b>ein Wort</b>, sodass es <code>1</code> ausgibt.",
        expect: "1",
        solution: `fun main() {
    var counter = 0
    counter = counter + 1
    println(counter)
}`,
        code: `fun main() {
    val counter = 0
    counter = counter + 1
    println(counter)
}`
      }
    ],
    "mad2-2": [
      {
        t: "widget",
        w: "ktrun",
        title: "Ganzzahl-Division",
        predict: {
          opts: [
            `3
1
3.5`,
            `3.5
1
3.5`,
            `3
1
3`,
            `3.5
0.5
3.5`
          ],
          a: 0,
          why: "Int / Int ergibt wieder Int (Nachkommastellen fallen weg), % ist der Rest. Sobald ein Double beteiligt ist, wird mit Komma gerechnet."
        },
        code: `fun main() {
    val a = 7
    val b = 2
    println(a / b)
    println(a % b)
    println(a / 2.0)
}`
      },
      {
        t: "widget",
        w: "ktrun",
        title: "Zahlentypen erkunden",
        note: "Probiere selbst: Was passiert bei <code>Long.MAX_VALUE + 1</code>? Was ergibt <code>7.0 % 2</code>?",
        code: `fun main() {
    val big = 3_000_000_000          // zu groß für Int → Long
    println(big::class.simpleName)
    println(Int.MAX_VALUE)
    println(Int.MAX_VALUE + 1)       // Überlauf!
    println(10.0 / 3)
    println(10 / 3.toDouble())
    println(0b1010 and 0b0110)       // bitweises UND → 2
    println(255.toString(2))         // binär
}`
      }
    ],
    "mad2-3": [
      {
        t: "widget",
        w: "ktrun",
        title: "Strings, Chars & Arrays",
        code: `fun main() {
    val name = "John Doe"
    println(name[2])
    println(name.length)
    println(name.uppercase())
    val parts = name.split(" ")
    println("\${parts[1]}, \${parts[0]}")
    println('A'.code)                // Char → Zahl
    println('A' + 2)                 // Char + Int → Char
    val arr = arrayOf(1, 2, 3)
    val arr2 = arr + 99              // neues Array, arr bleibt gleich
    println(arr.contentToString() + " " + arr2.contentToString())
}`
      },
      {
        t: "widget",
        w: "ktrun",
        title: "Mini-Challenge: Initialen",
        goal: "Gib die Initialen von <code>name</code> aus, also <code>JD</code> – ohne sie fest hinzuschreiben.",
        expect: "JD",
        solution: `fun main() {
    val name = "John Doe"
    println(name.split(" ").map { it[0] }.joinToString(""))
}`,
        code: `fun main() {
    val name = "John Doe"
    // Gib die Initialen aus – nutze name.split(" ") und das erste Zeichen jedes Teils
    println("??")
}`
      }
    ],
    "mad2-4": [
      {
        t: "widget",
        w: "ktrun",
        title: "Safe Call und Elvis",
        predict: {
          opts: [
            `null
0
-1`,
            `0
0
-1`,
            "NullPointerException",
            `null
0
12`
          ],
          a: 0,
          why: "?. liefert null statt abzustürzen, ?: ersetzt null durch einen Default. toIntOrNull() gibt null zurück, wenn der Text keine Zahl ist."
        },
        code: `fun main() {
    val name: String? = null
    println(name?.length)
    println(name?.length ?: 0)
    val n = "12a".toIntOrNull()
    println(n ?: -1)
}`
      },
      {
        t: "widget",
        w: "ktrun",
        title: "Fehler-Detektiv: Null Safety",
        goal: "Mach den Code null-sicher, sodass er <code>5</code> und dann <code>0</code> ausgibt.",
        expect: `5
0`,
        solution: `fun printLength(name: String?) {
    println(name?.length ?: 0)
}

fun main() {
    printLength("Kevin")
    printLength(null)
}`,
        code: `fun printLength(name: String?) {
    println(name.length)
}

fun main() {
    printLength("Kevin")
    printLength(null)
}`
      }
    ],
    "mad3-1": [
      {
        t: "widget",
        w: "ktrun",
        title: "when als Ausdruck: Notenschlüssel",
        code: `fun grade(points: Int): String = when {
    points >= 91 -> "Sehr gut"
    points >= 81 -> "Gut"
    points >= 71 -> "Befriedigend"
    points >= 61 -> "Genügend"
    else -> "Nicht genügend"
}

fun describe(x: Any): String = when (x) {
    0 -> "Null"
    in 1..9 -> "einstellig"
    is String -> "Text mit \${x.length} Zeichen"   // Smart Cast: x ist hier String
    else -> "etwas anderes"
}

fun main() {
    for (p in listOf(95, 85, 61, 42)) println("$p % → \${grade(p)}")
    val x = 7
    println(if (x % 2 == 0) "gerade" else "ungerade")   // if als Ausdruck statt ?:
    println(describe(5))
    println(describe("Kotlin"))
    println(describe(3.14))
}`
      }
    ],
    "mad3-2": [
      {
        t: "widget",
        w: "ktrun",
        title: "Ranges",
        predict: {
          opts: [
            `1 4 7 10
[10, 6, 2]
[1, 2, 3, 4]`,
            `1 4 7
[10, 6, 2, 1]
[1, 2, 3, 4, 5]`,
            `1 4 7 10
[10, 7, 4, 1]
[1, 2, 3, 4]`,
            `1 3 5 7 9
[10, 6, 2]
[2, 3, 4]`
          ],
          a: 0,
          why: "1..10 schließt 10 ein (1, 4, 7, 10). downTo zählt rückwärts in 4er-Schritten (10, 6, 2). until schließt das Ende aus."
        },
        code: `fun main() {
    println((1..10 step 3).joinToString(" "))
    println((10 downTo 1 step 4).toList())
    println((1 until 5).toList())
}`
      },
      {
        t: "widget",
        w: "ktrun",
        title: "Mini-Challenge: FizzBuzz",
        goal: "Gib statt der Zahl <code>Fizz</code> aus, wenn sie durch 3 teilbar ist, <code>Buzz</code> bei 5 und <code>FizzBuzz</code> bei beidem. Tipp: <code>when { … }</code>.",
        expect: `1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz`,
        solution: `fun main() {
    for (i in 1..15) {
        println(when {
            i % 15 == 0 -> "FizzBuzz"
            i % 3 == 0 -> "Fizz"
            i % 5 == 0 -> "Buzz"
            else -> i
        })
    }
}`,
        code: `fun main() {
    for (i in 1..15) {
        println(i)
    }
}`
      }
    ],
    "mad3-3": [
      {
        t: "widget",
        w: "ktrun",
        title: "Default- und benannte Argumente, Funktionsreferenzen",
        code: `fun printInfo(name: String, program: String = "IMA", semester: Int = 1) =
    "$name · $program · Semester $semester"

fun add(a: Int, b: Int) = a + b

fun main() {
    println(printInfo("Miller"))
    println(printInfo("Miller", semester = 3))
    println(printInfo(semester = 5, name = "Kevin"))
    val f = ::add                       // Funktion als Wert
    println(f(40, 2))
    println(listOf("a", "bb", "ccc").map(String::length))
}`
      }
    ],
    "mad3-4": [
      {
        t: "widget",
        w: "ktrun",
        title: "Lambdas, Higher-Order Functions & Closures",
        note: "Schreib eine eigene Funktion <code>adder(n: Int)</code>, die eine Lambda zurückgibt, und teste sie.",
        code: `fun executor(a: Int, b: Int, op: (Int, Int) -> Int) = op(a, b)

fun multiplier(factor: Int): (Int) -> Int = { x -> x * factor }   // Currying

fun main() {
    println(executor(50, 8) { x, y -> x - y })    // Trailing Lambda
    println(executor(6, 7, Int::times))
    val double = multiplier(2)
    val triple = multiplier(3)
    println(double(21))
    println(listOf(1, 2, 3).map(triple))
    var counter = 0
    val inc = { counter++ }                       // Closure merkt sich counter
    inc(); inc(); inc()
    println("counter = $counter")
}`
      }
    ],
    "mad3-5": [
      {
        t: "widget",
        w: "ktrun",
        title: "try/catch als Ausdruck",
        predict: {
          opts: [
            `OK: 22
Keine Zahl: abc
Ungültig: Alter darf nicht negativ sein: -5`,
            `OK: 22
Ungültig: abc
Ungültig: Alter darf nicht negativ sein: -5`,
            `OK: 22
Keine Zahl: abc
OK: -5`,
            "OK: 22 und dann Absturz mit NumberFormatException"
          ],
          a: 0,
          why: "try ist ein Ausdruck: der Wert des passenden Zweigs landet in result. require wirft eine IllegalArgumentException."
        },
        note: "Experiment: Vertausche die beiden catch-Blöcke. NumberFormatException ist eine Unterklasse von IllegalArgumentException – was passiert jetzt mit \"abc\"?",
        code: `fun parseAge(s: String): Int {
    val n = s.toInt()                 // kann NumberFormatException werfen
    require(n >= 0) { "Alter darf nicht negativ sein: $n" }
    return n
}

fun main() {
    for (input in listOf("22", "abc", "-5")) {
        val result = try {
            "OK: \${parseAge(input)}"
        } catch (e: NumberFormatException) {
            "Keine Zahl: $input"
        } catch (e: IllegalArgumentException) {
            "Ungültig: \${e.message}"
        }
        println(result)
    }
}`
      },
      { t: "widget", w: "ktlab", lab: "kt-grund", at: 999 }
    ],
    "mad4-1": [
      {
        t: "widget",
        w: "ktrun",
        title: "List, Set und Map",
        code: `fun main() {
    val numbers = mutableListOf(1, 2, 3, 4)
    numbers.removeAt(1)
    numbers.add(1, 42)
    println(numbers)

    val unique = setOf(3, 1, 3, 2, 1)
    println("$unique hat \${unique.size} Elemente")

    val ects = mutableMapOf("INFO2" to 5.0, "MAPPDEV" to 5.0)
    ects["DBAENT"] = 4.0
    println(ects)
    println(ects["XYZ"])                     // fehlender Key → null
    println(ects.getOrDefault("XYZ", 0.0))
    for ((code, e) in ects) println("$code: $e")
}`
      },
      {
        t: "widget",
        w: "ktrun",
        title: "Read-only heißt read-only",
        goal: "Das kompiliert nicht, weil <code>listOf</code> read-only ist. Repariere es, sodass <code>[Anna, Ben, Clara]</code> ausgegeben wird.",
        expect: "[Anna, Ben, Clara]",
        solution: `fun main() {
    val names = mutableListOf("Anna", "Ben")
    names.add("Clara")
    println(names)
}`,
        code: `fun main() {
    val names = listOf("Anna", "Ben")
    names.add("Clara")
    println(names)
}`
      }
    ],
    "mad4-2": [
      {
        t: "widget",
        w: "ktrun",
        title: "Funktionale Operatoren verketten",
        note: "Ergänze eigene Zeilen: Wer hat die schlechteste Note (<code>maxBy</code>)? Wie heißen alle, deren Name länger als 3 Zeichen ist?",
        code: `data class Student(val name: String, val grade: Int)

fun main() {
    val students = listOf(Student("Anna", 1), Student("Ben", 4), Student("Clara", 2), Student("David", 5))
    println(students.filter { it.grade <= 4 }.map { it.name })
    println(students.sumOf { it.grade } / students.size.toDouble())
    println(students.fold("") { acc, s -> acc + s.name.first() })
    println(students.sortedBy { it.grade }.first().name)
    println(students.groupBy { if (it.grade <= 4) "positiv" else "negativ" }.mapValues { it.value.size })
    println(students.any { it.grade == 1 })
    println(students.count { it.grade <= 2 })
}`
      },
      {
        t: "widget",
        w: "ktrun",
        title: "fold Schritt für Schritt",
        predict: {
          opts: ["looc", "cool", "c", "\"\""],
          a: 0,
          why: "Jedes Zeichen wird VOR den bisherigen Akkumulator gesetzt: \"\" → \"c\" → \"oc\" → \"ooc\" → \"looc\"."
        },
        code: `fun main() {
    val chars = listOf('c', 'o', 'o', 'l')
    println(chars.fold("") { acc, c -> "$c$acc" })
}`
      },
      { t: "widget", w: "ktlab", lab: "kt-coll", at: 999 }
    ],
    "mad4-3": [
      {
        t: "widget",
        w: "ktrun",
        title: "Generische Funktionen und Klassen",
        code: `fun <T> firstOrDefault(list: List<T>, default: T): T = if (list.isEmpty()) default else list[0]

fun <T : Comparable<T>> biggerOf(a: T, b: T): T = if (a > b) a else b

class Box<T>(val value: T) {
    fun <R> map(f: (T) -> R): Box<R> = Box(f(value))
    override fun toString() = "Box($value)"
}

fun main() {
    println(firstOrDefault(listOf(3, 1, 2), 0))
    println(firstOrDefault(emptyList<String>(), "leer"))
    println(biggerOf("Apfel", "Birne"))
    println(biggerOf(3.5, 2.0))
    println(Box(21).map { it * 2 }.map { "Ergebnis: $it" })
}`
      }
    ]
  },
  lessons: [
    {
      world: "madw4",
      after: "mad4-3",
      lesson: {
        id: "mad4-4",
        title: "Übungsblatt Session 1: Kotlin im Browser",
        topic: "mad-fop",
        min: 45,
        blocks: [
          {
            t: "lead",
            html: "Das Notebook aus Session 1 – jetzt mit echtem Kotlin-Compiler direkt hier: Code schreiben, Tests laufen lassen, grün werden. 😄"
          },
          {
            t: "text",
            h: "Notebook vs. Kotlin-Datei",
            levels: {
              simple: "Im Notebook kannst du jede Zeile direkt ausführen. In einer normalen Kotlin-Datei (und hier im Browser) gehört alles, was „passieren“ soll, in eine Funktion – meistens <code>main()</code>. Funktionen und Klassen selbst stehen außerhalb.",
              normal: "Jupyter mit Kotlin-Kernel arbeitet wie ein <b>Script</b>: Jede Zelle wird sofort ausgewertet, auch lose Anweisungen wie <code>println(…)</code> oder ein Ausdruck in der letzten Zeile. In einer <code>.kt</code>-Datei – in IntelliJ, Android Studio und hier im Kotlin-Labor – sind auf oberster Ebene nur <b>Deklarationen</b> erlaubt (<code>fun</code>, <code>val</code>, <code>class</code>, <code>import</code> …). Der Startpunkt ist <code>fun main()</code>.<br><br>Die Test-Zellen im Notebook machen etwas sehr Einfaches: <code>test(add(40, 2) == 42)</code> wirft eine Exception, wenn der Vergleich <code>false</code> ist. Im Übungsblatt unten passiert dasselbe automatisch – du siehst jeden Test einzeln mit erwartetem und tatsächlichem Wert.",
              technical: "Kotlin-Notebooks kompilieren jede Zelle als Script (<code>.jupyter.kts</code>, daher Fehlermeldungen wie <code>Line_28.jupyter.kts (3:77 - 83)</code> = Zeile 3, Spalte 77–83). Deklarationen späterer Zellen überschreiben frühere – deshalb darf es dort zweimal <code>val numbers</code> geben. In einer Datei wäre das ein <i>Conflicting declarations</i>-Fehler. Das Test-Harness hier hängt eine eigene <code>main()</code> an deinen Code; hast du selbst eine <code>main()</code>, wird sie vor den Tests aufgerufen."
            }
          },
          {
            t: "widget",
            w: "ktrun",
            title: "So sieht ein Notebook-Test als Programm aus",
            note: "Bau absichtlich einen Fehler in <code>add</code> ein (z. B. <code>a - b</code>) und führe es aus – so sieht ein fehlgeschlagener Test aus.",
            code: `fun add(a: Int, b: Int): Int {
    return a + b
}

fun test(ok: Boolean) {
    if (!ok) {
        throw Exception("Test failed!")
    }
}

fun main() {
    test(add(40, 2) == 42)
    test(add(7, 3) == 10)
    println("😄")
}`
          },
          {
            t: "callout",
            html: "Für Aufgabe 8 (wordPicker) liest das Notebook Dateien (<code>File(\"s1_nouns.txt\")</code>). Der Online-Compiler läuft in einer Sandbox ohne Dateizugriff – deshalb bekommen die Funktionen hier die Wörter als Liste. Die Logik ist identisch."
          },
          { t: "widget", w: "ktlab", lab: "kt-s1" },
          {
            t: "keys",
            items: [
              "Anweisungen gehören in <code>main()</code> – auf oberster Ebene nur Deklarationen.",
              "<code>map</code> verwandelt, <code>filter</code> siebt, <code>fold</code> fasst zusammen.",
              "Generics (<code>&lt;T&gt;</code>) machen eine Funktion für jeden Typ nutzbar.",
              "<code>throw</code> ist ein Ausdruck – passt direkt in einen <code>when</code>-Zweig."
            ]
          }
        ]
      }
    }
  ],
  worldPatch: { madw4: { sub: "List, Set, Map, map/filter/fold, Generics + Übungsblatt Session 1" } },
  labs: [
    {
      id: "kt-grund",
      chapter: "Kapitel 2–3",
      title: "Grundlagen-Training",
      lesson: "mad3-5",
      sub: "Variablen, when, Schleifen, Null Safety, Funktionen, Lambdas und Exceptions – kleine Aufgaben mit sofortigem Feedback.",
      tasks: [
        {
          id: "g-temp",
          title: "Celsius → Fahrenheit",
          short: "Temperatur",
          level: 1,
          topic: "mad-types",
          prompt: "<p>Schreibe <code>celsiusToFahrenheit(c: Double): Double</code>. Formel: <code>F = C · 9 / 5 + 32</code>.</p>",
          starter: `fun celsiusToFahrenheit(c: Double): Double {
    TODO("Formel einsetzen")
}`,
          solution: "fun celsiusToFahrenheit(c: Double): Double = c * 9 / 5 + 32",
          tests: [
            { call: "celsiusToFahrenheit(0.0)", expect: "32.0" },
            { call: "celsiusToFahrenheit(100.0)", expect: "212.0" },
            { call: "celsiusToFahrenheit(-40.0)", expect: "-40.0" }
          ],
          hints: [
            "Eine Zeile reicht: <code>return c * 9 / 5 + 32</code>.",
            "Kurzform mit Ausdruckskörper: <code>fun f(c: Double): Double = …</code>"
          ]
        },
        {
          id: "g-leap",
          title: "Schaltjahr",
          short: "Schaltjahr",
          level: 1,
          topic: "mad-types",
          prompt: "<p>Schreibe <code>isLeapYear(year: Int): Boolean</code>: Ein Jahr ist ein Schaltjahr, wenn es durch 4 teilbar ist – außer es ist durch 100 teilbar, dann nur, wenn es auch durch 400 teilbar ist.</p>",
          starter: `fun isLeapYear(year: Int): Boolean {
    TODO()
}`,
          solution: `fun isLeapYear(year: Int): Boolean =
    (year % 4 == 0 && year % 100 != 0) || year % 400 == 0`,
          tests: [
            { call: "isLeapYear(2024)", expect: "true" },
            { call: "isLeapYear(2023)", expect: "false" },
            { call: "isLeapYear(1900)", expect: "false" },
            { call: "isLeapYear(2000)", expect: "true" }
          ],
          hints: [
            "Teilbar heißt: <code>year % 4 == 0</code>.",
            "Kombiniere mit <code>&&</code> und <code>||</code>: (durch 4 UND nicht durch 100) ODER durch 400."
          ]
        },
        {
          id: "g-desc",
          title: "Zahl beschreiben mit when",
          short: "when",
          level: 1,
          topic: "mad-flow",
          prompt: "<p>Schreibe <code>describeNumber(n: Int): String</code> mit <code>when</code>:</p><ul><li>kleiner 0 → <code>\"negativ\"</code></li><li>0 → <code>\"null\"</code></li><li>1 bis 9 → <code>\"einstellig\"</code></li><li>10 bis 99 → <code>\"zweistellig\"</code></li><li>sonst → <code>\"groß\"</code></li></ul>",
          starter: `fun describeNumber(n: Int): String {
    TODO()
}`,
          solution: `fun describeNumber(n: Int): String = when {
    n < 0 -> "negativ"
    n == 0 -> "null"
    n in 1..9 -> "einstellig"
    n in 10..99 -> "zweistellig"
    else -> "groß"
}`,
          tests: [
            { call: "describeNumber(-3)", expect: "\"negativ\"" },
            { call: "describeNumber(0)", expect: "\"null\"" },
            { call: "describeNumber(7)", expect: "\"einstellig\"" },
            { call: "describeNumber(42)", expect: "\"zweistellig\"" },
            { call: "describeNumber(100)", expect: "\"groß\"" }
          ],
          hints: [
            "<code>when { bedingung -> wert … }</code> ohne Argument erlaubt beliebige Bedingungen.",
            "Bereiche prüfst du mit <code>n in 1..9</code>.",
            "Vergiss den <code>else</code>-Zweig nicht – when als Ausdruck muss vollständig sein."
          ]
        },
        {
          id: "g-null",
          title: "Null-sichere Länge",
          short: "Null Safety",
          level: 1,
          topic: "mad-null",
          prompt: "<p>Schreibe <code>safeLength(s: String?): Int</code>, die die Länge liefert – oder <code>0</code>, wenn <code>s</code> null ist. Ohne <code>!!</code>.</p>",
          starter: `fun safeLength(s: String?): Int {
    TODO()
}`,
          solution: "fun safeLength(s: String?): Int = s?.length ?: 0",
          tests: [
            { call: "safeLength(\"Kotlin\")", expect: "6" },
            { call: "safeLength(\"\")", expect: "0" },
            { call: "safeLength(null)", expect: "0" }
          ],
          hints: [
            "Safe Call: <code>s?.length</code> ist null, wenn s null ist.",
            "Elvis-Operator: <code>x ?: 0</code> ersetzt null durch 0."
          ],
          forbid: [["!!", "Verwende kein !! – das ist genau das, was Null Safety vermeiden will."]]
        },
        {
          id: "g-sum",
          title: "Summe mit Schleife",
          short: "for",
          level: 1,
          topic: "mad-flow",
          prompt: "<p>Schreibe <code>sumUpTo(n: Int): Int</code>, die 1 + 2 + … + n mit einer <code>for</code>-Schleife berechnet. Für n &lt; 1 ist das Ergebnis 0.</p>",
          starter: `fun sumUpTo(n: Int): Int {
    var sum = 0
    // Schleife hier
    return sum
}`,
          solution: `fun sumUpTo(n: Int): Int {
    var sum = 0
    for (i in 1..n) {
        sum += i
    }
    return sum
}`,
          tests: [
            { call: "sumUpTo(1)", expect: "1" },
            { call: "sumUpTo(10)", expect: "55" },
            { call: "sumUpTo(100)", expect: "5050" },
            { call: "sumUpTo(0)", expect: "0" },
            { call: "sumUpTo(-5)", expect: "0" }
          ],
          hints: [
            "<code>for (i in 1..n) { … }</code> – ist n kleiner als 1, läuft die Schleife gar nicht.",
            "Innen: <code>sum += i</code>"
          ]
        },
        {
          id: "g-fizz",
          title: "FizzBuzz als Funktion",
          short: "FizzBuzz",
          level: 1,
          topic: "mad-flow",
          prompt: "<p>Schreibe <code>fizzBuzz(n: Int): String</code>: <code>\"FizzBuzz\"</code> bei Teilbarkeit durch 3 und 5, <code>\"Fizz\"</code> durch 3, <code>\"Buzz\"</code> durch 5, sonst die Zahl als String.</p>",
          starter: `fun fizzBuzz(n: Int): String {
    TODO()
}`,
          solution: `fun fizzBuzz(n: Int): String = when {
    n % 15 == 0 -> "FizzBuzz"
    n % 3 == 0 -> "Fizz"
    n % 5 == 0 -> "Buzz"
    else -> n.toString()
}`,
          tests: [
            { call: "fizzBuzz(3)", expect: "\"Fizz\"" },
            { call: "fizzBuzz(10)", expect: "\"Buzz\"" },
            { call: "fizzBuzz(30)", expect: "\"FizzBuzz\"" },
            { call: "fizzBuzz(7)", expect: "\"7\"" }
          ],
          hints: ["Reihenfolge ist wichtig: Prüfe zuerst „durch 15“.", "Die Zahl als Text: <code>n.toString()</code>"]
        },
        {
          id: "g-twice",
          title: "Higher-Order Function",
          short: "Lambda",
          level: 2,
          topic: "mad-lambda",
          prompt: "<p>Schreibe <code>applyTwice(x: Int, f: (Int) -> Int): Int</code>, die <code>f</code> zweimal anwendet: <code>f(f(x))</code>.</p><pre>applyTwice(3) { it * 2 }   // 12</pre>",
          starter: `fun applyTwice(x: Int, f: (Int) -> Int): Int {
    TODO()
}`,
          solution: "fun applyTwice(x: Int, f: (Int) -> Int): Int = f(f(x))",
          tests: [
            { call: "applyTwice(3) { it * 2 }", expect: "12" },
            { call: "applyTwice(10) { it - 1 }", expect: "8" },
            { call: "applyTwice(2) { it * it }", expect: "16" }
          ],
          hints: [
            "Eine Funktion als Parameter rufst du wie jede Funktion auf: <code>f(x)</code>.",
            "Zweimal: das Ergebnis von <code>f(x)</code> nochmal an f geben."
          ]
        },
        {
          id: "g-div",
          title: "Division mit Exception",
          short: "Exception",
          level: 2,
          topic: "mad-err",
          prompt: "<p>Schreibe <code>divide(a: Int, b: Int): Int</code>. Ist <code>b == 0</code>, wirf eine <code>IllegalArgumentException</code> mit der Nachricht <code>\"Division durch 0\"</code>.</p>",
          starter: `fun divide(a: Int, b: Int): Int {
    TODO()
}`,
          solution: `fun divide(a: Int, b: Int): Int {
    if (b == 0) throw IllegalArgumentException("Division durch 0")
    return a / b
}`,
          tests: [
            { call: "divide(10, 2)", expect: "5" },
            { call: "divide(7, 2)", expect: "3" },
            { call: "divide(1, 0)", throws: "IllegalArgumentException", msg: "Division durch 0" }
          ],
          hints: [
            "<code>throw IllegalArgumentException(\"…\")</code> beendet die Funktion sofort.",
            "Alternative: <code>require(b != 0) { \"Division durch 0\" }</code> wirft genau diese Exception."
          ]
        }
      ]
    },
    {
      id: "kt-coll",
      chapter: "Kapitel 4",
      title: "Collections-Werkstatt",
      lesson: "mad4-2",
      sub: "map, filter, fold, groupBy & Co. an realistischen Daten – und eine eigene Extension Function.",
      tasks: [
        {
          id: "c-avg",
          title: "Notendurchschnitt",
          short: "average",
          level: 1,
          topic: "mad-coll",
          prompt: "<p>Schreibe <code>average(grades: List&lt;Int&gt;): Double</code>. Für eine leere Liste ist das Ergebnis <code>0.0</code>.</p>",
          starter: `fun average(grades: List<Int>): Double {
    TODO()
}`,
          solution: "fun average(grades: List<Int>): Double = if (grades.isEmpty()) 0.0 else grades.sum().toDouble() / grades.size",
          tests: [
            { call: "average(listOf(1, 2, 3))", expect: "2.0" },
            { call: "average(listOf(1, 2))", expect: "1.5" },
            { call: "average(listOf())", expect: "0.0" }
          ],
          hints: [
            "Achtung Ganzzahl-Division: <code>3 / 2 == 1</code>. Wandle vorher in Double um: <code>sum().toDouble()</code>.",
            "Es gibt auch <code>grades.average()</code> – aber was liefert das bei einer leeren Liste? Probier es aus!"
          ]
        },
        {
          id: "c-long",
          title: "Längstes Wort",
          short: "maxBy",
          level: 1,
          topic: "mad-fop",
          prompt: "<p>Schreibe <code>longestWord(text: String): String</code>. Wörter sind durch Leerzeichen getrennt; bei Gleichstand gewinnt das erste.</p>",
          starter: `fun longestWord(text: String): String {
    TODO()
}`,
          solution: "fun longestWord(text: String): String = text.split(\" \").maxBy { it.length }",
          tests: [
            { call: "longestWord(\"Kotlin ist echt praktisch\")", expect: "\"praktisch\"" },
            { call: "longestWord(\"ab cd ef\")", expect: "\"ab\"" },
            { call: "longestWord(\"Hallo\")", expect: "\"Hallo\"" }
          ],
          hints: [
            "<code>text.split(\" \")</code> liefert eine Liste von Wörtern.",
            "<code>maxBy { it.length }</code> liefert das (erste) Element mit dem größten Wert."
          ]
        },
        {
          id: "c-freq",
          title: "Wörter zählen",
          short: "groupBy",
          level: 2,
          topic: "mad-fop",
          prompt: `<p>Schreibe <code>wordFrequency(text: String): Map&lt;String, Int&gt;</code>: wie oft kommt jedes Wort vor? Groß-/Kleinschreibung ignorieren (alles klein).</p><pre>wordFrequency("Der Hund und der Ball")
// {der=2, hund=1, und=1, ball=1}</pre>`,
          starter: `fun wordFrequency(text: String): Map<String, Int> {
    TODO()
}`,
          solution: `fun wordFrequency(text: String): Map<String, Int> =
    text.lowercase().split(" ").groupingBy { it }.eachCount()`,
          tests: [
            {
              call: "wordFrequency(\"Der Hund und der Ball\")",
              expect: "mapOf(\"der\" to 2, \"hund\" to 1, \"und\" to 1, \"ball\" to 1)"
            },
            { call: "wordFrequency(\"a a a\")", expect: "mapOf(\"a\" to 3)" }
          ],
          hints: [
            "Erst <code>lowercase()</code>, dann <code>split(\" \")</code>.",
            "<code>groupBy { it }</code> gruppiert gleiche Wörter – <code>mapValues { it.value.size }</code> zählt.",
            "Noch kürzer: <code>groupingBy { it }.eachCount()</code>"
          ]
        },
        {
          id: "c-sq",
          title: "Filtern und quadrieren",
          short: "filter+map",
          level: 1,
          topic: "mad-fop",
          prompt: "<p>Schreibe <code>positiveSquares(nums: List&lt;Int&gt;): List&lt;Int&gt;</code>: nur positive Zahlen behalten, dann quadrieren – als Kette aus <code>filter</code> und <code>map</code>.</p>",
          starter: `fun positiveSquares(nums: List<Int>): List<Int> {
    TODO()
}`,
          solution: "fun positiveSquares(nums: List<Int>): List<Int> = nums.filter { it > 0 }.map { it * it }",
          tests: [
            { call: "positiveSquares(listOf(-2, 3, 0, 4))", expect: "listOf(9, 16)" },
            { call: "positiveSquares(listOf(-1))", expect: "listOf<Int>()" }
          ],
          hints: ["<code>nums.filter { it > 0 }</code> und dann <code>.map { it * it }</code> anhängen."]
        },
        {
          id: "c-mymap",
          title: "Eigene Extension: myMap",
          short: "myMap",
          level: 3,
          topic: "mad-gen",
          prompt: "<p>Schreibe eine <b>Extension Function</b> <code>myMap</code> für jede <code>List&lt;T&gt;</code>, die wie <code>map</code> funktioniert – ohne <code>map</code> zu benutzen.</p><pre>listOf(1, 2, 3).myMap { it * it }   // [1, 4, 9]</pre>",
          starter: `fun <T, R> List<T>.myMap(op: (T) -> R): List<R> {
    TODO()
}`,
          solution: `fun <T, R> List<T>.myMap(op: (T) -> R): List<R> {
    val result = ArrayList<R>(size)
    forEach { result += op(it) }
    return result
}`,
          tests: [
            { call: "listOf(32, 12, 42, 7, 4, 33).myMap { it * it }", expect: "listOf(1024, 144, 1764, 49, 16, 1089)" },
            { call: "listOf(\"a\", \"bb\").myMap { it.length }", expect: "listOf(1, 2)" },
            { call: "listOf<Int>().myMap { it.toString() }", expect: "listOf<String>()" }
          ],
          hints: [
            "In einer Extension Function ist <code>this</code> die Liste – <code>size</code>, <code>forEach</code> usw. kannst du direkt aufrufen.",
            "Ergebnisliste: <code>val result = mutableListOf&lt;R&gt;()</code>, dann für jedes Element <code>result.add(op(it))</code>."
          ],
          forbid: [["\\.map\\s*[({]|\\bmap\\s*\\{", "Ohne das eingebaute map lösen."]]
        },
        {
          id: "c-best",
          title: "Beste Studierende",
          short: "Kette",
          level: 2,
          topic: "mad-fop",
          prompt: "<p>Schreibe <code>topStudents(students: List&lt;Pair&lt;String, Int&gt;&gt;): String</code>: Namen aller mit Note ≤ 2, alphabetisch sortiert, mit <code>\", \"</code> verbunden.</p><pre>topStudents(listOf(\"Ben\" to 2, \"Anna\" to 1, \"Clara\" to 4))  // \"Anna, Ben\"</pre>",
          starter: `fun topStudents(students: List<Pair<String, Int>>): String {
    TODO()
}`,
          solution: `fun topStudents(students: List<Pair<String, Int>>): String =
    students.filter { it.second <= 2 }.map { it.first }.sorted().joinToString(", ")`,
          tests: [
            { call: "topStudents(listOf(\"Ben\" to 2, \"Anna\" to 1, \"Clara\" to 4))", expect: "\"Anna, Ben\"" },
            { call: "topStudents(listOf(\"Zoe\" to 5))", expect: "\"\"" },
            { call: "topStudents(listOf(\"Max\" to 1, \"Ali\" to 2, \"Eva\" to 1))", expect: "\"Ali, Eva, Max\"" }
          ],
          hints: [
            "Ein <code>Pair</code> hat <code>first</code> und <code>second</code>.",
            "Kette: <code>filter</code> → <code>map</code> → <code>sorted()</code> → <code>joinToString(\", \")</code>"
          ]
        }
      ]
    },
    {
      id: "kt-s1",
      chapter: "Übung Session 1",
      title: "Session 1: Hands-on Kotlin",
      lesson: "mad4-4",
      sub: "Die Aufgaben aus dem Notebook Session1.ipynb – mit denselben Tests, jetzt direkt im Browser.",
      tasks: [
        {
          id: "s1-add",
          title: "Exercise 1a: add",
          short: "add",
          level: 1,
          topic: "mad-fop",
          prompt: "<p>Write a function that adds two numbers and returns the sum.</p><pre>add(40, 2) == 42</pre>",
          starter: `fun add(a: Int, b: Int): Int {
    TODO()
}`,
          solution: `fun add(a: Int, b: Int): Int {
    return a + b
}`,
          tests: [{ call: "add(40, 2)", expect: "42" }, { call: "add(7, 3)", expect: "10" }],
          hints: ["Zwei Parameter mit Typ, Rückgabetyp nach dem Doppelpunkt – im Körper nur <code>return a + b</code>."]
        },
        {
          id: "s1-special",
          title: "Exercise 1b: addSpecial",
          short: "addSpecial",
          level: 1,
          topic: "mad-fop",
          prompt: `<p>Write a function <code>addSpecial</code> that adds two numbers by <b>concatenating</b> them.</p><pre>addSpecial(40, 2) == 402
addSpecial(4, 2) == 42
addSpecial(4, 10) == 410</pre>`,
          starter: `fun addSpecial(a: Int, b: Int): Int {
    TODO()
}`,
          solution: "fun addSpecial(a: Int, b: Int) = (a.toString() + b.toString()).toInt()",
          tests: [
            { call: "addSpecial(40, 2)", expect: "402" },
            { call: "addSpecial(4, 2)", expect: "42" },
            { call: "addSpecial(4, 10)", expect: "410" }
          ],
          hints: [
            "Zahlen werden zu Text mit <code>toString()</code>, Text wird zur Zahl mit <code>toInt()</code>.",
            "Oder mit String-Template: <code>\"$a$b\".toInt()</code>"
          ]
        },
        {
          id: "s1-mult",
          title: "Exercise 2: multiply",
          short: "multiply",
          level: 1,
          topic: "mad-fop",
          prompt: "<p>Write a function that multiplies a string by a number – <b>without</b> using <code>String.repeat()</code>.</p><pre>multiply(\"Abc\", 4) == \"AbcAbcAbcAbc\"</pre>",
          starter: `fun multiply(text: String, factor: Int): String {
    TODO()
}`,
          solution: `fun multiply(text: String, factor: Int): String {
    val result = StringBuilder()
    for (i in 1..factor) {
        result.append(text)
    }
    return result.toString()
}`,
          tests: [
            { call: "multiply(\"Abc\", 4)", expect: "\"AbcAbcAbcAbc\"" },
            { call: "multiply(\"Abc\", 1)", expect: "\"Abc\"" },
            { call: "multiply(\"Abc\", 0)", expect: "\"\"" }
          ],
          hints: [
            "Eine Schleife <code>for (i in 1..factor)</code> läuft bei factor = 0 gar nicht – perfekt für den leeren String.",
            "Text sammeln: <code>var result = \"\"</code> und <code>result += text</code> – oder effizienter mit <code>StringBuilder</code>."
          ],
          forbid: [["\\.repeat\\s*\\(", "Ohne String.repeat() lösen – mit einer Schleife."]]
        },
        {
          id: "s1-filternum",
          title: "Exercise 3a: filterNumbers",
          short: "filterNumbers",
          level: 2,
          topic: "mad-fop",
          prompt: "<p>Write your own version of <code>filter</code> for a list of integers: return all values that meet the <code>criterion</code>.</p><pre>filterNumbers(numbers) { it > 50 }</pre><p>Use a loop, not the built-in <code>filter</code>.</p>",
          starter: `fun filterNumbers(list: List<Int>, criterion: (Int) -> Boolean): List<Int> {
    TODO()
}`,
          solution: `fun filterNumbers(list: List<Int>, criterion: (Int) -> Boolean): List<Int> {
    val result = mutableListOf<Int>()
    for (item in list) {
        if (criterion(item)) {
            result.add(item)
        }
    }
    return result
}`,
          tests: [
            {
              call: "filterNumbers(listOf(21, 99, 42, 130, 13, 12, 54, 4, 34, 101)) { it > 50 }",
              expect: "listOf(99, 130, 54, 101)"
            },
            { call: "filterNumbers(listOf(21, 99, 42, 130, 13, 12, 54, 4, 34, 101)) { it < 20 }", expect: "listOf(13, 12, 4)" },
            { call: "filterNumbers(listOf(21, 99, 42, 130, 13, 12, 54, 4, 34, 101)) { it > 1000 }", expect: "listOf<Int>()" },
            {
              call: "filterNumbers(listOf(21, 99, 42, 130, 13, 12, 54, 4, 34, 101)) { it > 0 }",
              expect: "listOf(21, 99, 42, 130, 13, 12, 54, 4, 34, 101)"
            }
          ],
          hints: [
            "Lege eine leere veränderbare Liste an: <code>val result = mutableListOf&lt;Int&gt;()</code>.",
            "Gehe mit <code>for (item in list)</code> durch und rufe <code>criterion(item)</code> auf – bei true: <code>result.add(item)</code>."
          ],
          forbid: [["\\.filter\\s*[({]", "Hier sollst du filter selbst bauen – ohne das eingebaute .filter."]]
        },
        {
          id: "s1-filter",
          title: "Exercise 3b: generic filter",
          short: "filter<T>",
          level: 2,
          topic: "mad-gen",
          prompt: `<p>Now write a modified version that works with <b>whichever type</b> is in the list (Generics!).</p><pre>filter(listOf(true, false, true)) { !it }   // [false]
filter(words) { it.length > 4 }</pre>`,
          starter: `fun <T> filter(list: List<T>, criterion: (T) -> Boolean): List<T> {
    TODO()
}`,
          solution: `fun <T> filter(list: List<T>, criterion: (T) -> Boolean): List<T> {
    val result = mutableListOf<T>()
    for (item in list) {
        if (criterion(item)) result.add(item)
    }
    return result
}`,
          tests: [
            { call: "filter(listOf(21, 99, 42, 130, 13, 12, 54, 4, 34, 101)) { it > 50 }", expect: "listOf(99, 130, 54, 101)" },
            { call: "filter(listOf(21, 99, 42, 130, 13, 12, 54, 4, 34, 101)) { it > 1000 }", expect: "listOf<Int>()" },
            { call: "filter(listOf(true, false, false, true, false)) { !it }", expect: "listOf(false, false, false)" },
            {
              call: "filter(listOf(\"Also\", \"programming\", \"in\", \"Kotlin\", \"is\", \"fun\")) { it.length > 4 }",
              expect: "listOf(\"programming\", \"Kotlin\")"
            }
          ],
          hints: [
            "Gleich wie filterNumbers – nur überall <code>Int</code> durch den Typparameter <code>T</code> ersetzen.",
            "Die leere Liste: <code>mutableListOf&lt;T&gt;()</code>"
          ],
          forbid: [["\\.filter\\s*[({]", "Ohne das eingebaute .filter lösen."]]
        },
        {
          id: "s1-grade",
          title: "Exercise 4a: grade2Text",
          short: "grade2Text",
          level: 1,
          topic: "mad-err",
          prompt: "<p>Write <code>grade2Text</code>: 1..5 → <code>\"very good\"</code>, <code>\"good\"</code>, <code>\"satisfactory\"</code>, <code>\"adequate\"</code>, <code>\"unsatisfactory\"</code>.</p><p>For any other number throw an <code>IllegalArgumentException</code> with the message <code>\"Sorry, but 42 is not a valid grade!\"</code> (with the actual number).</p>",
          starter: `fun grade2Text(grade: Int): String {
    TODO()
}`,
          solution: `fun grade2Text(grade: Int): String {
    return when (grade) {
        1 -> "very good"
        2 -> "good"
        3 -> "satisfactory"
        4 -> "adequate"
        5 -> "unsatisfactory"
        else -> throw IllegalArgumentException("Sorry, but $grade is not a valid grade!")
    }
}`,
          tests: [
            { call: "grade2Text(1)", expect: "\"very good\"" },
            { call: "grade2Text(2)", expect: "\"good\"" },
            { call: "grade2Text(3)", expect: "\"satisfactory\"" },
            { call: "grade2Text(4)", expect: "\"adequate\"" },
            { call: "grade2Text(5)", expect: "\"unsatisfactory\"" },
            { call: "grade2Text(42)", throws: "IllegalArgumentException", msg: "Sorry, but 42 is not a valid grade!" },
            { call: "grade2Text(0)", throws: "IllegalArgumentException", msg: "Sorry, but 0 is not a valid grade!" }
          ],
          hints: [
            "<code>when (grade) { 1 -> \"very good\" … }</code>",
            "<code>throw</code> ist in Kotlin ein Ausdruck – du kannst ihn direkt in den <code>else</code>-Zweig schreiben.",
            "Die Nachricht mit String-Template: <code>\"Sorry, but $grade is not a valid grade!\"</code>"
          ]
        },
        {
          id: "s1-map",
          title: "Exercise 4b: textGrades",
          short: "map",
          level: 1,
          topic: "mad-fop",
          prompt: "<p>Translate an entire list of number grades into text grades. Write <code>toTextGrades(grades: List&lt;Int&gt;): List&lt;String&gt;</code> – one expression with <code>map</code> and your <code>grade2Text</code>.</p>",
          starter: `fun grade2Text(grade: Int): String = when (grade) {
    1 -> "very good"
    2 -> "good"
    3 -> "satisfactory"
    4 -> "adequate"
    5 -> "unsatisfactory"
    else -> throw IllegalArgumentException("Sorry, but $grade is not a valid grade!")
}

fun toTextGrades(grades: List<Int>): List<String> {
    TODO()
}`,
          solution: `fun grade2Text(grade: Int): String = when (grade) {
    1 -> "very good"
    2 -> "good"
    3 -> "satisfactory"
    4 -> "adequate"
    5 -> "unsatisfactory"
    else -> throw IllegalArgumentException("Sorry, but $grade is not a valid grade!")
}

fun toTextGrades(grades: List<Int>): List<String> = grades.map { grade2Text(it) }`,
          tests: [
            {
              call: "toTextGrades(listOf(4, 3, 3, 1, 2, 5, 3))",
              expect: "listOf(\"adequate\", \"satisfactory\", \"satisfactory\", \"very good\", \"good\", \"unsatisfactory\", \"satisfactory\")"
            },
            { call: "toTextGrades(listOf())", expect: "listOf<String>()" }
          ],
          hints: [
            "<code>map</code> wendet eine Funktion auf jedes Element an und liefert eine neue Liste.",
            "<code>grades.map { grade2Text(it) }</code> – oder mit Funktionsreferenz <code>grades.map(::grade2Text)</code>."
          ],
          require: [["\\.map\\s*[({]", "Bitte mit map lösen."]]
        },
        {
          id: "s1-overview",
          title: "Exercise 5: overview of grades",
          short: "overview",
          level: 2,
          topic: "mad-coll",
          prompt: `<p>Write <code>overview(grades: List&lt;Int&gt;): Map&lt;Int, Int&gt;</code>: one entry per grade 1–5 with its count – <b>also grades that occur 0 times</b>.</p><pre>grades = [2,3,1,1,2,4,4]
1: 2   2: 2   3: 1   4: 2   5: 0</pre><p>A grade outside 1..5 → <code>IllegalArgumentException</code> (<code>"Sorry, but 42 is not a valid grade!"</code>).</p>`,
          starter: `fun overview(grades: List<Int>): Map<Int, Int> {
    TODO()
}`,
          solution: `fun overview(grades: List<Int>): Map<Int, Int> {
    val result = mutableMapOf(1 to 0, 2 to 0, 3 to 0, 4 to 0, 5 to 0)
    for (grade in grades) {
        if (grade !in 1..5) {
            throw IllegalArgumentException("Sorry, but $grade is not a valid grade!")
        }
        result[grade] = result.getValue(grade) + 1
    }
    return result
}`,
          tests: [
            { call: "overview(listOf(2, 3, 1, 1, 2, 4, 4))", expect: "mapOf(1 to 2, 2 to 2, 3 to 1, 4 to 2, 5 to 0)" },
            { call: "overview(listOf(1, 1, 1, 1, 5, 5, 5, 5))", expect: "mapOf(1 to 4, 2 to 0, 3 to 0, 4 to 0, 5 to 4)" },
            { call: "overview(listOf())", expect: "mapOf(1 to 0, 2 to 0, 3 to 0, 4 to 0, 5 to 0)" },
            {
              call: "overview(listOf(1, 2, 3, 1, 2, 42, 5, 4))",
              throws: "IllegalArgumentException",
              msg: "Sorry, but 42 is not a valid grade!"
            }
          ],
          hints: [
            "Starte mit allen Noten auf 0: <code>mutableMapOf(1 to 0, 2 to 0, …)</code> oder <code>(1..5).associateWith { 0 }.toMutableMap()</code>.",
            "Zählen: <code>result[grade] = result.getValue(grade) + 1</code>",
            "Prüfen: <code>if (grade !in 1..5) throw …</code>"
          ],
          explain: "Im Notebook prüfte der Test (compMap) nur die Einträge, die in deiner Map vorkommen – eine Map ohne die 0-Einträge ging dort durch. Hier wird die ganze Map verglichen, so wie es die Aufgabe beschreibt."
        },
        {
          id: "s1-count",
          title: "Exercise 6: count with fold",
          short: "fold",
          level: 2,
          topic: "mad-fop",
          prompt: `<p>Write <code>count(text: String, character: Char): Int</code>, which counts how many times the character occurs – <b>case insensitive</b>. Please use <code>fold</code>.</p><pre>count("Programming is fun", 'n') == 2
count("Programming is fun", 'P') == 1</pre>`,
          starter: `fun count(text: String, character: Char): Int {
    TODO()
}`,
          solution: `fun count(text: String, character: Char): Int =
    text.lowercase().fold(0) { acc, c ->
        if (c == character.lowercaseChar()) acc + 1 else acc
    }`,
          tests: [
            { call: "count(\"Programming is fun\", 'n')", expect: "2" },
            { call: "count(\"Programming is fun\", 'p')", expect: "1" },
            { call: "count(\"Programming is fun\", 'P')", expect: "1" },
            { call: "count(\"Programming is fun\", 'x')", expect: "0" }
          ],
          hints: [
            "<code>fold(startwert) { acc, element -> neuerAcc }</code> – Startwert ist hier 0.",
            "Groß-/Kleinschreibung ignorieren: <code>text.lowercase()</code> und <code>character.lowercaseChar()</code>."
          ],
          require: [["\\.fold\\s*\\(", "Bitte mit fold lösen."]]
        },
        {
          id: "s1-countgen",
          title: "Exercise 7: generic count",
          short: "count<T>",
          level: 2,
          topic: "mad-gen",
          prompt: "<p>Write a more general <code>count</code> that counts all elements of a list meeting a criterion – again with <code>fold</code>.</p><pre>count(listOf(43, 21, 13, 2, 9, 32, 10)) { it > 20 }   // 3</pre>",
          starter: `fun <T> count(list: List<T>, criterion: (T) -> Boolean): Int {
    TODO()
}`,
          solution: `fun <T> count(list: List<T>, criterion: (T) -> Boolean): Int =
    list.fold(0) { acc, item -> if (criterion(item)) acc + 1 else acc }`,
          tests: [
            { call: "count(listOf(43, 21, 13, 2, 9, 32, 10)) { it > 20 }", expect: "3" },
            { call: "count(\"Programming is fun\".toList()) { it == 'm' }", expect: "2" },
            { call: "count(listOf(true, true, false)) { it }", expect: "2" },
            { call: "count(listOf<Int>()) { it > 0 }", expect: "0" }
          ],
          hints: [
            "Wie Exercise 6, aber statt des Zeichenvergleichs rufst du <code>criterion(item)</code> auf.",
            "Typparameter vor dem Namen: <code>fun &lt;T&gt; count(…)</code>"
          ],
          require: [["\\.fold\\s*\\(", "Bitte mit fold lösen."]]
        },
        {
          id: "s1-picker",
          title: "Exercise 8a: wordPicker",
          short: "wordPicker",
          level: 2,
          topic: "mad-fop",
          prompt: `<p>In the notebook <code>wordPicker</code> reads words from a file. The browser sandbox can't read files – so here it gets the words as a list: return a <b>random, non-blank</b> word.</p><pre>import kotlin.random.Random
Random.nextInt(11)   // 0..10</pre>`,
          starter: `import kotlin.random.Random

fun wordPicker(words: List<String>): String {
    TODO()
}`,
          solution: `import kotlin.random.Random

fun wordPicker(words: List<String>): String {
    val wordList = words.filter { it.isNotBlank() }
    val randomIndex = Random.nextInt(wordList.size)
    return wordList[randomIndex]
}`,
          tests: [
            {
              call: "wordPicker(listOf(\"apple\", \"tree\", \"house\")) in listOf(\"apple\", \"tree\", \"house\")",
              expect: "true"
            },
            {
              check: "(1..300).all { wordPicker(listOf(\"\", \"x\", \" \", \"\")) == \"x\" }",
              name: "300 Mal: aus [\"\", \"x\", \" \", \"\"] kommt immer \"x\""
            },
            {
              check: "(1..300).map { wordPicker(listOf(\"a\", \"b\", \"c\")) }.toSet() == setOf(\"a\", \"b\", \"c\")",
              name: "über 300 Ziehungen kommt jedes Wort einmal vor"
            }
          ],
          hints: [
            "Erst die leeren Einträge entfernen: <code>words.filter { it.isNotBlank() }</code>.",
            "Der Zufallsindex muss zur <b>gefilterten</b> Liste passen: <code>Random.nextInt(wordList.size)</code>.",
            "Kurzform: <code>words.filter { it.isNotBlank() }.random()</code>"
          ],
          explain: "Achtung, typischer Fehler: In der Notebook-Lösung wird der Index mit <code>words.size</code> (ungefilterte Liste) gezogen, aber in <code>wordList</code> (gefiltert) nachgeschaut. Hat die Datei leere Zeilen, kommt irgendwann eine IndexOutOfBoundsException – der zweite Test hier findet genau das."
        },
        {
          id: "s1-monger",
          title: "Exercise 8b: wordMonger",
          short: "wordMonger",
          level: 1,
          topic: "mad-fop",
          prompt: "<p>Based on <code>wordPicker</code>, write <code>wordMonger</code>: pick one random verb, adjective and noun and return the phrase <i>verb adjective noun</i>.</p>",
          starter: `import kotlin.random.Random

fun wordPicker(words: List<String>): String = words.filter { it.isNotBlank() }.random()

fun wordMonger(verbs: List<String>, adjectives: List<String>, nouns: List<String>): String {
    TODO()
}`,
          solution: `import kotlin.random.Random

fun wordPicker(words: List<String>): String = words.filter { it.isNotBlank() }.random()

fun wordMonger(verbs: List<String>, adjectives: List<String>, nouns: List<String>): String {
    val verb = wordPicker(verbs)
    val adjective = wordPicker(adjectives)
    val noun = wordPicker(nouns)
    return "$verb $adjective $noun"
}`,
          tests: [
            { call: "wordMonger(listOf(\"eat\"), listOf(\"green\"), listOf(\"apple\"))", expect: "\"eat green apple\"" },
            { call: "wordMonger(listOf(\"\", \"run\"), listOf(\"fast\", \"\"), listOf(\"dog\"))", expect: "\"run fast dog\"" },
            {
              check: "wordMonger(listOf(\"a\", \"b\"), listOf(\"c\"), listOf(\"d\", \"e\")).split(\" \").size == 3",
              name: "Ergebnis besteht aus genau 3 Wörtern"
            }
          ],
          hints: [
            "Rufe <code>wordPicker</code> dreimal auf – je einmal pro Liste.",
            "Zusammenbauen mit String-Template: <code>\"$verb $adjective $noun\"</code>"
          ]
        }
      ]
    }
  ]
});
})();
