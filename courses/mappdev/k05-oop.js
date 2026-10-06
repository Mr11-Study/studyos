/* MAPPDEV · Kapitel 5 vertieft: „From Go to OOP in Kotlin“ (Salhofer, Sept. 2026)
   Objekte & Identität, Methoden & Extensions, Kapselung, Overloading/Overriding, Polymorphismus,
   abstrakte Klassen, Interfaces, object & companion object – mit ausführbaren Beispielen und OOP-Übungsblatt. */
(function () {
const EXT = window.STUDYOS_EXT = window.STUDYOS_EXT || {};
(EXT["mappdev"] = EXT["mappdev"] || []).push({
  id: "mappdev-k05-oop",
  topics: {
    "mad-obj": { name: "Objekte, Identität & Referenzen", lesson: "madk5-1" },
    "mad-meth": { name: "Methoden, Extensions & Konstruktoren", lesson: "madk5-2" },
    "mad-enc": { name: "Kapselung: private, Getter & Setter", lesson: "madk5-3" },
    "mad-poly": { name: "Overloading, Overriding & Polymorphismus", lesson: "madk5-4" },
    "mad-abs": { name: "Abstrakte Klassen & Interfaces", lesson: "madk5-5" },
    "mad-comp": { name: "object & companion object", lesson: "madk5-6" }
  },
  worldPatch: {
    madw5: {
      title: "Objektorientierung in Kotlin",
      sub: "From Go to OOP: Objekte, Kapselung, Vererbung, Polymorphismus, Interfaces",
      bossTopics: ["mad-obj", "mad-meth", "mad-enc", "mad-poly", "mad-abs", "mad-comp"]
    }
  },
  lessons: [
    {
      world: "madw5",
      after: "mad5-1",
      lesson: {
        id: "madk5-1",
        title: "Objekte: Identität, Zustand & Referenzen",
        topic: "mad-obj",
        min: 16,
        blocks: [
          {
            t: "lead",
            html: "Warum druckt <code>println(john)</code> so etwas Seltsames wie <code>Person@72d718f4</code> – und warum sind zwei Personen mit identischen Daten trotzdem nicht gleich? Die Antwort steckt in drei Wörtern: <b>Identität, Zustand, Verhalten</b>."
          },
          {
            t: "html",
            html: `<div class="grid g2"><div><small class="muted">Go: struct</small><pre><code>type Person struct {
    firstname, lastname string
    age int
}

john := Person{"John", "Doe", 22}
fmt.Println(john)   // {John Doe 22}</code></pre></div><div><small class="muted">Kotlin: class</small><pre><code>class Person(val firstname: String,
             val lastname: String,
             val age: Int)

val john = Person("John", "Doe", 22)
println(john)       // Person@72d718f4</code></pre></div></div>`
          },
          {
            t: "text",
            h: "Jedes Objekt hat Identität, Zustand und Verhalten",
            levels: {
              simple: "Eine Klasse ist der Bauplan, ein Objekt ein gebautes Exemplar. Jedes Objekt ist ein eigenes „Ding“ (Identität), hat eigene Werte (Zustand) und kann etwas (Verhalten = Methoden). Die Variable <code>john</code> enthält nicht das Objekt selbst, sondern nur seine Adresse – wie ein Zettel mit einer Hausnummer.",
              normal: "Mit <code>Person(\"John\", \"Doe\", 22)</code> wird ein neues Objekt erzeugt – das nennt man <b>Instanziierung</b>; das Objekt ist eine <b>Instanz</b> der Klasse. Jedes Objekt besitzt:<ul><li><b>Identität</b> – es ist einzigartig, auch wenn ein anderes Objekt dieselben Werte hat</li><li><b>Zustand</b> – die aktuellen Werte seiner Properties</li><li><b>Verhalten</b> – die Methoden, die in der Klasse definiert sind</li></ul>Klassen sind <b>Referenztypen</b>: Die Variable speichert die <b>Adresse</b> des Objekts, das woanders im Speicher liegt – technisch genau das, was du aus Go als <b>Pointer</b> kennst. <code>Person@72d718f4</code> ist die Standard-Textdarstellung: Klassenname + ein Hashwert, der aus der Identität kommt. Deshalb gilt für normale Klassen: <code>person1 == person2</code> ist <code>false</code>, wenn es zwei verschiedene Objekte sind – auch bei identischem Zustand. Zeigen beide Variablen auf <b>dasselbe</b> Objekt (<code>val person2 = person1</code>), ist es <code>true</code>.",
              technical: "<code>==</code> ruft in Kotlin <code>equals()</code> auf. Die Default-Implementierung aus <code>Any</code> vergleicht Referenzen – deshalb verhält sich <code>==</code> bei normalen Klassen wie <code>===</code> (referenzielle Gleichheit). <code>toString()</code> aus <code>Any</code> liefert <code>Klassenname@Hex(hashCode())</code>; im Notebook steht davor der Script-Name (<code>Line_0_jupyter$Person</code>). Erst <code>data class</code> oder ein eigenes <code>override fun equals/hashCode/toString</code> ändert das. Der Hashcode ist keine echte Speicheradresse, sondern ein Identitäts-Hash der JVM – das Bild „Adresse“ ist aber für das Verständnis genau richtig."
            }
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Gleich oder dasselbe?",
            predict: {
              opts: [
                `false
true`,
                `true
true`,
                `false
false`,
                `true
false`
              ],
              a: 0,
              why: "person1 und person2 sind zwei verschiedene Objekte (andere Identität). person3 ist nur eine zweite Variable mit derselben Adresse wie person1."
            },
            note: "Mach aus <code>class</code> eine <code>data class</code> und führe es nochmal aus – was ändert sich?",
            code: `class Person(val firstname: String, val lastname: String, val age: Int)

fun main() {
    val person1 = Person("John", "Doe", 22)
    val person2 = Person("John", "Doe", 22)
    val person3 = person1
    println(person1 == person2)
    println(person1 == person3)
}`
          },
          {
            t: "text",
            h: "Call by Value vs. Call by Reference",
            levels: {
              simple: "In Go bekommt eine Funktion normalerweise eine <b>Kopie</b>. In Kotlin bekommt sie bei Objekten die <b>Adresse</b> – ändert die Funktion das Objekt, siehst du die Änderung auch außerhalb.",
              normal: "In Go ist <b>Call by Value</b> der Standard: <code>changeName(john, \"Miller\")</code> bekommt eine Kopie von <code>john</code>, das Original bleibt unverändert. Erst mit einem Pointer (<code>*Person</code> und <code>&amp;john</code>) ändert die Funktion das Original.<br>In Kotlin werden alle Referenztypen (alles außer Zahlen, Boolean und Char) <b>als Referenz</b> übergeben: Es wird keine Kopie erzeugt, die Funktion arbeitet mit <b>demselben</b> Objekt. Damit man Properties ändern kann, müssen sie mit <code>var</code> deklariert sein.",
              technical: "Genau genommen übergeben Kotlin und Java die <b>Referenz als Wert</b> („call by sharing“): Die Funktion bekommt eine Kopie der Adresse. Deshalb wirkt <code>p.lastname = …</code> auf das Original (gleiches Objekt), aber <code>p = Person(…)</code> nur lokal (die Kopie der Adresse zeigt jetzt woanders hin) – Parameter sind in Kotlin ohnehin <code>val</code> und können gar nicht neu zugewiesen werden. Zahlen, Boolean und Char sind zwar auch Objekte, aber <b>unveränderlich</b> – deshalb merkt man den Unterschied dort nie."
            }
          },
          {
            t: "html",
            html: `<div class="grid g2"><div><small class="muted">Go: Kopie vs. Pointer</small><pre><code>func changeName(p Person, n string) {
    p.lastname = n   // ändert die Kopie
}
func changeNameP(p *Person, n string) {
    p.lastname = n   // ändert das Original
}
changeName(john, "Miller")   // {John Doe 22}
changeNameP(&amp;john, "Miller") // {John Miller 22}</code></pre></div><div><small class="muted">Kotlin: immer die Referenz</small><pre><code>class Person(var firstname: String,
             var lastname: String,
             var age: Int)

fun changeName(p: Person, newName: String) {
    p.lastname = newName   // ändert das Original
}
changeName(john, "Miller")  // John, Miller</code></pre></div></div>`
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Referenz übergeben",
            predict: {
              opts: [
                `John Doe
John Doe`,
                `John Miller
John Miller`,
                `John Miller
Jane Roe`,
                `John Doe
Jane Roe`
              ],
              a: 1,
              why: "changeName ändert das Objekt selbst. replacePerson lässt nur die lokale Variable q auf ein neues Objekt zeigen – john zeigt weiter auf das alte."
            },
            code: `class Person(var firstname: String, var lastname: String, var age: Int)

fun changeName(p: Person, newName: String) {
    p.lastname = newName              // ändert das EINE Objekt, auf das p zeigt
}

fun replacePerson(p: Person): Person {
    var q = p
    q = Person("Jane", "Roe", 30)     // q zeigt jetzt auf ein neues Objekt
    return q
}

fun main() {
    val john = Person("John", "Doe", 22)
    changeName(john, "Miller")
    println("\${john.firstname} \${john.lastname}")
    replacePerson(john)
    println("\${john.firstname} \${john.lastname}")
}`
          },
          {
            t: "example",
            title: "Google-Docs-Link vs. PDF-Anhang",
            html: "Du schickst deiner Lerngruppe die Zusammenfassung für MAPPDEV. <b>Variante 1:</b> PDF im Anhang – jede Person hat eine <b>Kopie</b>. Markiert Lena darin etwas, sieht das niemand sonst (<b>Call by Value</b>, wie in Go). <b>Variante 2:</b> Du teilst einen Google-Docs-<b>Link</b>. Alle arbeiten am <b>selben Dokument</b>; ändert Lena eine Zeile, sehen es alle sofort (<b>Referenz</b>, wie bei Kotlin-Objekten). Und wenn Lena ihren Link durch einen anderen ersetzt, ändert das das Original-Dokument natürlich nicht – genau wie <code>replacePerson</code> oben."
          },
          {
            t: "hint",
            title: "Eselsbrücke: Zettel mit Hausnummer",
            html: "Eine Objekt-Variable ist ein <b>Zettel mit einer Hausnummer</b>, nicht das Haus. <code>val b = a</code> kopiert den Zettel – beide führen zum selben Haus. <code>==</code> bei normalen Klassen fragt: „Steht dieselbe Hausnummer drauf?“ Zwei gleich gebaute Häuser in verschiedenen Straßen sind trotzdem zwei Häuser."
          },
          {
            t: "hint",
            title: "Prüfungsfalle: Person@1b6d3586 ist kein Fehler",
            html: "Diese Ausgabe ist die Standard-<code>toString()</code>-Darstellung (Klassenname + Hash). Lesbar wird sie mit einer <code>data class</code> oder mit <code>override fun toString() = …</code>. Die Zahl ändert sich bei jedem Lauf – sie hat nichts mit den Werten des Objekts zu tun."
          },
          {
            t: "keys",
            items: [
              "Objekt = Instanz einer Klasse, Erzeugen = Instanziierung.",
              "Jedes Objekt hat <b>Identität</b>, <b>Zustand</b> (Property-Werte) und <b>Verhalten</b> (Methoden).",
              "Klassen sind Referenztypen: Variablen speichern die Adresse (wie Go-Pointer).",
              "Normale Klassen: <code>==</code> vergleicht die Identität. Gleiche Werte ≠ gleiches Objekt.",
              "Funktionen bekommen die Referenz – Änderungen am Objekt (über <code>var</code>-Properties) sind außen sichtbar."
            ]
          },
          {
            t: "check",
            q: "<code>class P(val x: Int)</code> – was liefert <code>P(1) == P(1)</code>?",
            opts: [
              "true, weil x gleich ist",
              "false, weil es zwei verschiedene Objekte sind",
              "Compilerfehler",
              "true, aber nur bei val"
            ],
            a: 1,
            why: "Ohne data class bzw. eigenes equals vergleicht == die Identität."
          },
          {
            t: "check",
            q: "Eine Funktion setzt <code>p.age = 30</code> auf einem übergebenen Objekt. Was passiert mit dem Objekt beim Aufrufer?",
            opts: [
              "Nichts – Kotlin übergibt eine Kopie",
              "Es hat danach age = 30, weil die Referenz übergeben wurde",
              "Compilerfehler, Parameter sind immer read-only",
              "Nur wenn die Funktion inline ist"
            ],
            a: 1,
            why: "Parameter selbst sind read-only (kein p = …), aber das Objekt dahinter kann über var-Properties geändert werden."
          }
        ]
      }
    },
    {
      world: "madw5",
      after: "mad5-2",
      lesson: {
        id: "madk5-2",
        title: "Methoden, Extension Functions & Konstruktoren",
        topic: "mad-meth",
        min: 16,
        blocks: [
          {
            t: "lead",
            html: "In Go hängst du Methoden mit einem <i>Receiver</i> von außen an ein Struct. Kotlin kennt beides: echte Methoden <b>in</b> der Klasse und – fast wie in Go – <b>Extension Functions</b> von außen."
          },
          {
            t: "html",
            html: `<div class="grid g2"><div><small class="muted">Go: Methode mit Receiver</small><pre><code>func (p Person) SayHello() string {
    return fmt.Sprintf("Hi! I'm %s, %s and %d years old!",
        p.firstname, p.lastname, p.age)
}
john.SayHello()</code></pre></div><div><small class="muted">Kotlin: Extension Function</small><pre><code>fun Person.sayHello() =
    "Hi! I'm $firstname, $lastname and $age years old"

john.sayHello()</code></pre></div></div>`
          },
          {
            t: "text",
            h: "Methode vs. Extension Function",
            levels: {
              simple: "Eine <b>Methode</b> steht im Körper der Klasse und gehört fest zu ihr. Eine <b>Extension Function</b> schreibst du außerhalb – sie sieht beim Aufruf aus wie eine Methode (<code>john.sayHello()</code>), du kannst damit sogar fremde Klassen wie <code>String</code> erweitern.",
              normal: "Eine <b>Methode</b> (Member Function) ist eine normale Funktion im Körper einer Klasse. Sie beschreibt das <b>Verhalten</b> der Objekte und hat Zugriff auf <b>alle</b> Properties – auch auf <code>private</code>.<br>Eine <b>Extension Function</b> hat die Syntax <code>fun Receiver.name(): Typ { … }</code> – wie eine Go-Methode, nur steht der Receiver-Typ vor dem Punkt. Damit fügst du bestehenden Klassen Funktionen hinzu, ohne sie zu ändern oder von ihnen zu erben – auch Klassen, deren Code du nicht besitzt (<code>String</code>, <code>List</code> …). Im Körper ist <code>this</code> das Objekt, auf dem sie aufgerufen wird; <code>this.</code> darf man weglassen.",
              technical: "Extensions werden <b>statisch</b> aufgelöst: Der Compiler übersetzt <code>john.sayHello()</code> in einen normalen Funktionsaufruf <code>sayHello(john)</code>. Folgen: Sie sehen nur <b>öffentliche</b> Member (kein <code>private</code>), sie können nichts überschreiben (kein Polymorphismus über den Laufzeittyp), und hat die Klasse eine Methode mit gleicher Signatur, gewinnt immer die Methode. Die halbe Kotlin-Standardbibliothek besteht aus Extensions – <code>map</code>, <code>filter</code>, <code>forEach</code> sind Extensions auf <code>Iterable</code>. In Android sind Extensions z. B. für <code>Context</code> oder <code>Modifier</code> allgegenwärtig."
            }
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Methode und Extension im Vergleich",
            note: "Schreib eine Extension <code>fun Int.isEven()</code> und probier <code>println(4.isEven())</code>.",
            code: `data class Person(val firstname: String, val lastname: String, val age: Int) {
    fun sayHello() = "Hi! I'm $firstname, $lastname and $age years old"    // Methode
}

fun Person.isAdult() = age >= 18                     // Extension Function
fun String.shout() = uppercase() + "!"                // auch für fremde Klassen

fun main() {
    val john = Person("John", "Doe", 22)
    println(john.sayHello())
    println(john.isAdult())
    println("kotlin".shout())
}`
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Eigenes map als Extension (aus dem Skript)",
            code: `inline fun <T, R> List<T>.myMap(op: (T) -> R): List<R> {
    val result = ArrayList<R>(size)       // size = this.size
    forEach { result += op(it) }
    return result
}

fun main() {
    val list = listOf(32, 12, 42, 7, 4, 33)
    println(list.myMap { it * it })
    println(listOf("Go", "Kotlin").myMap { it.length })
}`
          },
          {
            t: "text",
            h: "Konstruktoren: primär, init und zusätzliche",
            levels: {
              simple: "Der <b>Konstruktor</b> baut ein neues Objekt. In Kotlin steht der wichtigste direkt im Klassenkopf. Willst du Objekte auf mehrere Arten erzeugen können, gibt es zusätzliche Konstruktoren – die müssen aber immer den Hauptkonstruktor aufrufen.",
              normal: "Der <b>primäre Konstruktor</b> ist identisch mit dem Klassenkopf: <code>class Person(val firstname: String, val lastname: String, age: Int)</code>. Parameter mit <code>val</code>/<code>var</code> werden zu Properties, ohne (wie <code>age</code> hier) sind sie nur beim Erzeugen sichtbar.<br>Jede Klasse kann <b>zusätzliche (sekundäre) Konstruktoren</b> haben. Sie heißen <code>constructor(…)</code> und müssen mit <code>: this(…)</code> den primären Konstruktor aufrufen. Beispiel aus dem Skript: Ein <code>Student</code> kann mit id, Name und Studiengang erzeugt werden – oder nur mit Name (die id wird zufällig erzeugt, der Studiengang hat den Default <code>\"IMA\"</code>). Code, der bei jeder Erzeugung laufen soll (z. B. Prüfungen), steht in einem <code>init { … }</code>-Block.",
              technical: "Reihenfolge beim Erzeugen: Argumente des primären Konstruktors → Property-Initialisierer und <code>init</code>-Blöcke in Quelltext-Reihenfolge → Rest des sekundären Konstruktors. Weil beim Aufruf von <code>this(…)</code> das Objekt noch nicht existiert, darf man dort <b>keine Methoden der Instanz</b> aufrufen (→ Lösung: <code>companion object</code>, siehe eigene Lektion). In der Praxis ersetzen <b>Default-Werte</b> die meisten sekundären Konstruktoren; sie sind vor allem für Java-Interop und Android-Views (mehrere Konstruktor-Signaturen) relevant. <code>UUID.randomUUID()</code> kommt aus der Java-Standardbibliothek – Kotlin kann sie direkt nutzen."
            }
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Drei Wege, einen Student zu erzeugen",
            note: "Führe es mehrmals aus – die ids von student2 und student3 sind jedes Mal anders.",
            code: `import java.util.UUID

data class Student(val id: String, val name: String, val studyProgram: String) {

    // zusätzlicher Konstruktor: erzeugt eine zufällige id
    constructor(name: String, studyProgram: String = "IMA") : this(
        UUID.randomUUID().toString(), name, studyProgram   // an den primären Konstruktor weitergeben
    )
}

fun main() {
    val student1 = Student("1944334442", "John Doe", "IMA")   // primärer Konstruktor
    println(student1)
    val student2 = Student("John Doe", "IMA")                 // zusätzlicher Konstruktor
    println(student2)
    val student3 = Student("John Doe")                        // mit Default-Wert
    println(student3)
}`
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Mini-Challenge: zusätzlicher Konstruktor",
            goal: "Ergänze einen zusätzlichen Konstruktor, der nur den <code>code</code> bekommt und <code>ects</code> auf 5 setzt, sodass <code>MAPPDEV: 5</code> ausgegeben wird.",
            expect: "MAPPDEV: 5",
            solution: `class Course(val code: String, val ects: Int) {
    constructor(code: String) : this(code, 5)
}

fun main() {
    val c = Course("MAPPDEV")
    println("\${c.code}: \${c.ects}")
}`,
            code: `class Course(val code: String, val ects: Int) {
    // Ergänze hier einen zusätzlichen Konstruktor
}

fun main() {
    val c = Course("MAPPDEV")
    println("\${c.code}: \${c.ects}")
}`
          },
          {
            t: "example",
            title: "Schlüsseldienst vs. Hausumbau",
            html: "Du willst deiner Haustür eine smarte Klingel hinzufügen. <b>Methode</b> = der Architekt baut sie beim Hausbau gleich in die Wand ein (sie gehört zur Klasse, kommt an alle Leitungen – auch die privaten). <b>Extension</b> = du klebst eine Funk-Klingel von außen an die Tür: Sie wirkt wie eingebaut (<code>haus.klingeln()</code>), aber sie kommt nur an das, was von außen zugänglich ist – und du musstest das Haus dafür nicht umbauen. Genau so hängt Kotlin <code>filter</code> oder <code>map</code> an Listen an."
          },
          {
            t: "hint",
            title: "Default-Wert schlägt zusätzlichen Konstruktor",
            html: "Statt <code>constructor(code: String) : this(code, 5)</code> schreibt man in Kotlin meist einfach <code>class Course(val code: String, val ects: Int = 5)</code>. Zusätzliche Konstruktoren brauchst du, wenn die Werte erst <b>berechnet</b> werden müssen (wie die UUID) oder die Parameterliste ganz anders aussieht."
          },
          {
            t: "hint",
            title: "Typischer Fehler: Methode im this(…)-Aufruf",
            html: "<code>constructor(name: String) : this(makeId(), name)</code> mit einer <b>Methode</b> <code>makeId()</code> kompiliert nicht – das Objekt existiert in diesem Moment noch nicht. Lösung: <code>makeId</code> in ein <code>companion object</code> verschieben oder als top-level-Funktion schreiben."
          },
          {
            t: "keys",
            items: [
              "Methode = Funktion im Klassenkörper, Zugriff auf alle Properties (auch private).",
              "Extension Function: <code>fun Typ.name() = …</code> – erweitert auch fremde Klassen, sieht aber nur Öffentliches.",
              "Primärer Konstruktor = Klassenkopf; <code>init { }</code> läuft bei jeder Erzeugung.",
              "Zusätzlicher Konstruktor: <code>constructor(…) : this(…)</code> – muss den primären aufrufen."
            ]
          },
          {
            t: "check",
            q: "Was ist <code>fun String.initials() = split(\" \").map { it[0] }.joinToString(\"\")</code>?",
            opts: ["Eine Methode der Klasse String", "Eine Extension Function auf String", "Ein Konstruktor", "Ein Lambda"],
            a: 1,
            why: "Receiver-Typ vor dem Punkt: Extension. Aufruf: \"John Doe\".initials() → \"JD\"."
          },
          {
            t: "check",
            q: "Was muss ein zusätzlicher Konstruktor in Kotlin tun (wenn es einen primären gibt)?",
            opts: [
              "Nichts Besonderes",
              "Mit <code>: this(…)</code> den primären Konstruktor aufrufen",
              "Mit <code>super(…)</code> die Oberklasse aufrufen",
              "Alle Properties mit lateinit markieren"
            ],
            a: 1,
            why: "Jeder sekundäre Konstruktor delegiert – direkt oder indirekt – an den primären."
          }
        ]
      }
    },
    {
      world: "madw5",
      after: "madk5-2",
      lesson: {
        id: "madk5-3",
        title: "Kapselung: private, Getter & Setter",
        topic: "mad-enc",
        min: 18,
        blocks: [
          {
            t: "lead",
            html: "Ein Bankkonto, bei dem jede Person einfach <code>balance = -1000.0</code> schreiben kann? Keine gute Idee. <b>Kapselung</b> versteckt Details und erlaubt nur kontrollierte Änderungen."
          },
          {
            t: "text",
            h: "Was ist Kapselung (Encapsulation)?",
            levels: {
              simple: "Kapselung heißt: Das Innenleben eines Objekts geht niemanden etwas an. Von außen gibt es nur bestimmte „Knöpfe“ (Methoden), die sicherstellen, dass nichts kaputtgeht – z. B. dass ein Konto nicht beliebig ins Minus rutscht.",
              normal: "<b>Kapselung</b> ist ein zentrales OOP-Prinzip: Implementierungsdetails (= Komplexität) werden vor den Nutzer:innen einer Klasse <b>versteckt</b>, und der Zustand eines Objekts kann nur <b>sicher und kontrolliert</b> verändert werden.<br>Werkzeuge dafür in Kotlin:<ul><li><code>private</code> – nur innerhalb der Klasse sichtbar (auch ganze Hilfsmethoden)</li><li><b>Getter/Setter</b> – Kotlin erzeugt sie für jede Property automatisch; mit <code>private set</code> bleibt die Property außen lesbar, aber nur innen änderbar</li><li><b>eigene Setter</b> mit Prüfung, z. B. „Gang nur zwischen 1 und 27“</li><li><b>Methoden</b> wie <code>deposit</code>/<code>withdraw</code>, die Regeln durchsetzen</li></ul>",
              technical: "In Kotlin gibt es keine „nackten“ Felder: Jede Property ist ein (verstecktes) <b>Backing Field</b> plus Getter (und bei <code>var</code> Setter). <code>myAccount.balance</code> ruft in Wahrheit <code>getBalance()</code> auf – deshalb kann man Getter/Setter später ändern, ohne den aufrufenden Code anzupassen. Im eigenen Setter greift man mit dem Schlüsselwort <code>field</code> auf das Backing Field zu; schreibt man stattdessen den Property-Namen, ruft sich der Setter rekursiv selbst auf (StackOverflowError). Sichtbarkeiten: <code>public</code> (Default), <code>private</code>, <code>protected</code> (Klasse + Unterklassen), <code>internal</code> (gleiches Modul). In Go regelt das die Groß-/Kleinschreibung des Namens."
            }
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Das Problem: jede:r darf alles",
            code: `class BankAccount(val number: Int, val overdraftLimit: Double = 0.0, var balance: Double = 0.0)

fun main() {
    val myAccount = BankAccount(4711, 0.0, 100.0)
    println("Balance: \${myAccount.balance}, Overdraft Limit: \${myAccount.overdraftLimit}")
    myAccount.balance = -1000.0          // niemand hält uns auf!
    println("Balance: \${myAccount.balance}, Overdraft Limit: \${myAccount.overdraftLimit}")
}`
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Mini-Challenge: lesbar, aber nicht änderbar",
            goal: "<code>private</code> versteckt balance komplett – jetzt kann sie niemand mehr <i>lesen</i>. Ändere nur die Klasse, sodass balance von außen lesbar, aber nicht änderbar ist. Ausgabe: <code>Balance: 0.0</code>.",
            expect: "Balance: 0.0",
            solution: `class BankAccount(val number: Int, val overdraftLimit: Double = 0.0) {
    var balance: Double = 0.0
        private set
}

fun main() {
    val myAccount = BankAccount(4711)
    println("Balance: \${myAccount.balance}")
}`,
            code: `class BankAccount(val number: Int, val overdraftLimit: Double = 0.0) {
    private var balance: Double = 0.0
}

fun main() {
    val myAccount = BankAccount(4711)
    println("Balance: \${myAccount.balance}")
}`
          },
          {
            t: "text",
            h: "Getter, Setter und field",
            levels: {
              simple: "Kotlin baut für jede Property automatisch einen Getter (zum Lesen) und bei <code>var</code> einen Setter (zum Schreiben). Du kannst den Setter selbst schreiben und damit unsinnige Werte abfangen.",
              normal: `Die klassische Lösung aus Java sind Methoden <code>getBalance()</code>/<code>setBalance()</code> – <b>Getter</b> und <b>Setter</b>. Kotlin erzeugt sie für jede nicht-private Property selbst, und zwar immer paarweise bei <code>var</code>. Deshalb schreibt man:<pre>var balance: Double = 0.0
    private set</pre>Der Getter bleibt öffentlich (<code>myAccount.balance</code> sieht aus wie ein normales Feld), der Setter ist privat.<br>Einen <b>eigenen Setter</b> schreibst du mit <code>set(value) { … }</code>. Im Beispiel <code>Bicycle</code> wird ein neuer Gang nur übernommen, wenn er zwischen 1 und <code>numberOfGears</code> liegt; <code>field = value</code> schreibt in das Feld hinter der Property. Analog gibt es <code>get() = …</code> für <b>berechnete Properties</b>.`,
              technical: "Accessor-Syntax: <code>var p: T = init</code> gefolgt von <code>get() { … }</code> und/oder <code>set(value) { … }</code>. Eine Property mit eigenem Getter ohne <code>field</code>-Nutzung hat gar kein Backing Field (<code>val area get() = w * h</code>). Sichtbarkeit von Settern lässt sich einschränken (<code>private set</code>, <code>protected set</code>), die des Getters nicht (sie entspricht immer der Property). <code>private set</code> funktioniert nicht für Properties im primären Konstruktor – dafür die Property im Klassenkörper deklarieren."
            }
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Bicycle: Setter mit Prüfung",
            predict: {
              opts: [
                `Current gear: 1
Current gear: 18
Current gear: 18
Current gear: 18`,
                `Current gear: 1
Current gear: 18
Current gear: 42
Current gear: -4`,
                `Current gear: 1
Current gear: 18
Current gear: 27
Current gear: 1`,
                "Absturz bei 42 mit IllegalArgumentException"
              ],
              a: 0,
              why: "Ungültige Werte werden vom Setter einfach ignoriert – der alte Gang bleibt. Willst du einen Fehler melden, müsstest du im else-Zweig eine Exception werfen."
            },
            code: `class Bicycle(val numberOfGears: Int) {
    var currentGear: Int = 1
        set(value) {
            if (value in 1..numberOfGears) {
                field = value          // 'field' = das Feld hinter dem Setter
            }
        }
}

fun main() {
    val myBike = Bicycle(27)
    println("Current gear: \${myBike.currentGear}")
    myBike.currentGear = 18
    println("Current gear: \${myBike.currentGear}")
    myBike.currentGear = 42
    println("Current gear: \${myBike.currentGear}")
    myBike.currentGear = -4
    println("Current gear: \${myBike.currentGear}")
}`
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Sicher ändern über Methoden",
            note: "Denk mit: Im Skript bedeutet <code>overdraftLimit</code> eigentlich „niedrigster erlaubter Kontostand“. Für einen Überziehungsrahmen von 500 € müsstest du <code>-500.0</code> übergeben. Wie müsste die Bedingung lauten, wenn <code>500.0</code> (positiv) gemeint ist? Probier es aus.",
            code: `class BankAccount(val number: Int, val overdraftLimit: Double = 0.0) {
    var balance: Double = 0.0
        private set

    fun deposit(amount: Double) =
        if (amount > 0.0) { balance += amount; true } else { false }

    fun withdraw(amount: Double) =
        if (amount > 0.0 && balance - amount >= overdraftLimit) {
            balance -= amount; true
        } else { false }
}

fun main() {
    val myAccount = BankAccount(4711, 0.0)
    println(myAccount.deposit(100.0))
    println(myAccount.withdraw(20.0))
    println("Balance: \${myAccount.balance}, Overdraft Limit: \${myAccount.overdraftLimit}")
    println(myAccount.withdraw(2000.0))
    println("Balance: \${myAccount.balance}, Overdraft Limit: \${myAccount.overdraftLimit}")
}`
          },
          {
            t: "example",
            title: "Der Kaffeeautomat in der FH",
            html: "Am Automaten im Foyer drückst du Knöpfe: „Cappuccino“, „Zucker +“, „Bezahlen“. Das sind die <b>öffentlichen Methoden</b>. An den Wassertank, die Münzkasse oder die Temperaturregelung kommst du nicht heran – sie sind <b>private</b>. Der Automat garantiert so, dass niemand 10 € Wechselgeld „einstellt“ oder Wasser mit 200 °C bestellt (wie der <code>Bicycle</code>-Setter, der Gang 42 ignoriert). Die Anzeige „Guthaben: 1,20 €“ kannst du <b>lesen</b>, aber nicht direkt ändern – genau das ist <code>private set</code>."
          },
          {
            t: "hint",
            title: "Prüfungsfalle: Setter, der sich selbst aufruft",
            html: "<code>set(value) { currentGear = value }</code> ruft wieder den Setter auf – der ruft wieder den Setter auf … bis zum <code>StackOverflowError</code>. Im Setter (und Getter) immer <code>field</code> verwenden."
          },
          {
            t: "hint",
            title: "Wann private, wann private set?",
            html: "<b><code>private var</code></b>: niemand außen soll den Wert sehen (Hilfswerte, interne Zähler). <b><code>var … private set</code></b>: alle dürfen lesen, nur die Klasse schreibt (Kontostand, Punktestand). <b><code>val</code></b>: niemand ändert es, auch die Klasse nicht (Kontonummer)."
          },
          {
            t: "warnbox",
            html: "Typische Compilerfehler: <i>Cannot access 'balance': it is private in 'BankAccount'</i> (von außen auf private zugegriffen) · <i>Cannot assign to 'balance': the setter is private</i> (Zuweisung trotz <code>private set</code>) – beides ist gewollt: Die Kapselung funktioniert!"
          },
          {
            t: "keys",
            items: [
              "Kapselung = Details verstecken + Zustand nur kontrolliert ändern.",
              "<code>private</code> = nur in der Klasse sichtbar (Properties und Methoden).",
              "Kotlin erzeugt Getter/Setter automatisch; <code>private set</code> macht eine Property außen read-only.",
              "Eigener Setter: <code>set(value) { if (…) field = value }</code> – immer <code>field</code>, nie den Property-Namen.",
              "Änderungen über Methoden mit Regeln (deposit/withdraw) statt direktem Zugriff."
            ]
          },
          {
            t: "check",
            q: "Wie macht man <code>balance</code> von außen lesbar, aber nur innerhalb der Klasse änderbar?",
            opts: [
              "<code>private var balance = 0.0</code>",
              "<code>val balance = 0.0</code>",
              "<code>var balance = 0.0</code> mit <code>private set</code>",
              "<code>protected var balance = 0.0</code>"
            ],
            a: 2,
            why: "private würde auch das Lesen verbieten, val auch das Ändern innerhalb der Klasse."
          },
          {
            t: "check",
            q: "Was macht <code>field</code> in einem Setter?",
            opts: [
              "Es ist ein Platzhalter für den neuen Wert",
              "Es greift auf das Backing Field hinter der Property zu",
              "Es erzeugt eine neue Property",
              "Es ruft den Getter auf"
            ],
            a: 1,
            why: "Der neue Wert heißt value; field ist der Speicherplatz dahinter."
          }
        ]
      }
    },
    {
      world: "madw5",
      after: "mad5-3",
      lesson: {
        id: "madk5-4",
        title: "Overloading, Overriding & Polymorphismus",
        topic: "mad-poly",
        min: 20,
        blocks: [
          {
            t: "lead",
            html: "Ein Student <i>ist eine</i> Person – also kann er überall auftreten, wo eine Person erwartet wird. Wie Kotlin dann entscheidet, welche Methode läuft, ist das Herz der Objektorientierung."
          },
          {
            t: "html",
            html: `<div class="grid g2"><div><small class="muted">Go: Komposition („besteht aus“)</small><pre><code>type Person struct { Firstname, Lastname string }
type Student struct {
    Person
    DegreeProgram string
}
johnny := Student{Person{"John", "Doe"}, "IMA"}</code></pre></div><div><small class="muted">Kotlin: Vererbung („ist ein“)</small><pre><code>open class Person(val firstname: String, val lastname: String)

class Student(firstname: String, lastname: String,
              val degreeProgram: String) :
    Person(firstname, lastname)

val johnny = Student("John", "Doe", "IMA")</code></pre></div></div>`
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Fehler-Detektiv: Vererbung",
            goal: "Kompiliert nicht: <i>This type is final</i>. Ein Wort fehlt, damit <code>Hi! I'm John, Doe.</code> ausgegeben wird.",
            expect: "Hi! I'm John, Doe.",
            solution: `open class Person(val firstname: String, val lastname: String) {
    fun sayHello() = "Hi! I'm $firstname, $lastname."
}

class Student(firstname: String, lastname: String, val degreeProgram: String) :
    Person(firstname, lastname)

fun main() {
    val johnny = Student("John", "Doe", "IMA")
    println(johnny.sayHello())
}`,
            code: `class Person(val firstname: String, val lastname: String) {
    fun sayHello() = "Hi! I'm $firstname, $lastname."
}

class Student(firstname: String, lastname: String, val degreeProgram: String) :
    Person(firstname, lastname)

fun main() {
    val johnny = Student("John", "Doe", "IMA")
    println(johnny.sayHello())
}`
          },
          {
            t: "text",
            h: "Overloading vs. Overriding",
            levels: {
              simple: "<b>Overloading</b>: mehrere Funktionen mit gleichem Namen, aber verschiedenen Parametern – der Compiler wählt anhand der Argumente. <b>Overriding</b>: Eine Unterklasse ersetzt eine geerbte Methode durch ihre eigene Version.",
              normal: "<b>Overloading (Überladen)</b>: Mehrere Funktionen haben denselben Namen, unterscheiden sich aber in der <b>Anzahl oder den Typen</b> der Parameter, z. B. <code>sayHello()</code> und <code>sayHello(other: Person)</code>. Welche aufgerufen wird, entscheidet der Compiler anhand der Argumente.<br><b>Overriding (Überschreiben)</b>: Die Funktion hat <b>dieselbe Parameterliste</b>, steht aber auf verschiedenen Ebenen der Klassenhierarchie. Die Unterklasse ändert damit das geerbte Verhalten. Voraussetzungen:<ul><li>Die Oberklasse erlaubt es mit <code>open</code> vor der Methode (Sicherheit: stell dir vor, jemand überschreibt <code>withdraw</code> in deinem <code>BankAccount</code>)</li><li>Die Unterklasse schreibt <code>override</code> davor – damit klar ist, dass es Absicht ist und kein zufälliger Namenskonflikt</li></ul>Jede Klasse erbt implizit von <code>Any</code> – deshalb kann man <code>toString()</code> überschreiben, auch ohne sichtbare Oberklasse.",
              technical: "Overloading wird zur <b>Compile-Zeit</b> anhand der statischen Typen aufgelöst, Overriding zur <b>Laufzeit</b> anhand des tatsächlichen Objekttyps (dynamic dispatch, virtuelle Methoden). Ein <code>override</code>-Member ist selbst wieder <code>open</code>; mit <code>final override</code> verhindert man weiteres Überschreiben. Mit <code>super.sayHello()</code> ruft die Unterklasse die geerbte Version auf. Properties der Oberklasse im Unterklassen-Konstruktor ohne <code>val</code>/<code>var</code> übergeben – sonst <i>'firstname' hides member of supertype 'Person' and needs 'override' modifier</i>. <code>open</code> und <code>data</code> sind nicht kombinierbar: von Data Classes kann man nicht erben."
            }
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Overloading: gleicher Name, andere Parameter",
            code: `open class Person(val firstname: String, val lastname: String) {
    fun sayHello() = "Hi! I'm $firstname, $lastname."
    fun sayHello(other: Person) = "Hi \${other.firstname}! I'm $firstname, $lastname."
}

class Student(firstname: String, lastname: String, val degreeProgram: String) :
    Person(firstname, lastname)

fun main() {
    val clara = Person("Clara", "Watson")
    val johnny = Student("John", "Doe", "IMA")
    println(clara.sayHello())           // ohne Parameter
    println(johnny.sayHello(clara))     // mit einer Person als Parameter
}`
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Overriding: toString für alle",
            predict: {
              opts: [
                "Teacher: Jessica, O'Reilly teaching [Math 1, Physics 2].",
                "Person: Jessica, O'Reilly",
                "Teacher@1b6d3586",
                "Compilerfehler: Type mismatch"
              ],
              a: 0,
              why: "Die Variable hat den Typ Person, das Objekt ist aber ein Teacher. Bei überschriebenen Methoden läuft immer die Version des tatsächlichen Objekts."
            },
            code: `open class Person(val firstname: String, val lastname: String) {
    override fun toString() = "Person: $firstname, $lastname"
}
class Student(firstname: String, lastname: String, val degreeProgram: String) :
    Person(firstname, lastname) {
    override fun toString() = "Student: $firstname, $lastname studying $degreeProgram."
}
class Teacher(firstname: String, lastname: String, val subjects: List<String>) :
    Person(firstname, lastname) {
    override fun toString() = "Teacher: $firstname, $lastname teaching $subjects."
}

fun main() {
    val jessica = Teacher("Jessica", "O'Reilly", listOf("Math 1", "Physics 2"))
    val person: Person = jessica
    println(person)
}`
          },
          {
            t: "text",
            h: "Polymorphismus: is, as und Smart Cast",
            levels: {
              simple: "Polymorphismus heißt „Vielgestaltigkeit“: Ein Student kann die Rolle <i>Student</i> oder <i>Person</i> spielen. Als Person „vergisst“ er seine Studenten-Fähigkeiten – mit <code>is</code> kannst du nachschauen, was er wirklich ist.",
              normal: "Wegen der „ist ein“-Beziehung darf ein Objekt der Unterklasse überall verwendet werden, wo die Oberklasse erwartet wird: <code>val person2: Person = Student(…)</code> – obwohl Kotlin sonst sehr streng ist (<code>val d: Double = 42</code> geht nicht!). Umgekehrt geht es nicht: Nicht jede Person ist ein Student.<br>Wird ein Student als Person verwendet, kann er nur, was eine Person kann: <code>person.degreeProgram</code> → <i>Unresolved reference</i>. Zurück zum Student kommst du mit <code>as</code> – das klappt aber nur, wenn das Objekt wirklich ein Student ist, sonst <b>ClassCastException</b>. Deshalb vorher mit <code>is</code> prüfen. Nach <code>if (person is Student)</code> weiß Kotlin, dass <code>person</code> ein Student ist (<b>Smart Cast</b>) – ein <code>as</code> ist dann gar nicht mehr nötig.<br>Der zweite Aspekt: Haben Ober- und Unterklasse dieselbe Methode (z. B. <code>toString</code>), wird immer die aufgerufen, die dem <b>tatsächlichen Typ</b> am nächsten ist. Und jedes Objekt kann die Rolle <code>Any</code> spielen.",
              technical: "Statischer Typ (der deklarierte Typ der Variable) bestimmt, <b>welche</b> Member der Compiler erlaubt; dynamischer Typ (Laufzeittyp des Objekts) bestimmt, <b>welche Implementierung</b> läuft. Upcast passiert implizit, Downcast explizit mit <code>as</code> (unsicher) bzw. <code>as?</code> (liefert <code>null</code> statt Exception: <code>(p as? Student)?.degreeProgram ?: \"–\"</code>). Smart Casts funktionieren bei lokalen <code>val</code>s und unveränderlichen Properties, nicht bei <code>var</code>-Properties, die sich zwischen Prüfung und Zugriff ändern könnten. <code>when (p) { is Student -> … is Teacher -> … }</code> ist der idiomatische Weg für Fallunterscheidungen nach Typ."
            }
          },
          {
            t: "widget",
            w: "ktrun",
            title: "is prüft, Smart Cast hilft",
            code: `open class Person(val firstname: String, val lastname: String)
class Student(firstname: String, lastname: String, val degreeProgram: String) :
    Person(firstname, lastname)

fun printProgram(person: Person) {
    println(
        if (person is Student) {          // prüfen, ob die Person ein Student ist
            "\${person.firstname} is studying \${person.degreeProgram}."   // Smart Cast!
        } else {
            "\${person.firstname} is not a Student!"
        }
    )
}

fun main() {
    val person1: Person = Student("John", "Doe", "IMA")
    val person2: Person = Person("Clara", "Watson")
    printProgram(person1)
    printProgram(person2)
    println((person2 as? Student)?.degreeProgram ?: "kein Studium")   // sicherer Cast
}`
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Fehler-Detektiv: ClassCastException",
            goal: "Stürzt bei Clara mit einer ClassCastException ab. Mach <code>programOf</code> sicher: Für Nicht-Studierende soll <code>kein Studium</code> zurückkommen.",
            expect: `IMA
kein Studium`,
            solution: `open class Person(val firstname: String)
class Student(firstname: String, val degreeProgram: String) : Person(firstname)

fun programOf(p: Person): String =
    if (p is Student) p.degreeProgram else "kein Studium"

fun main() {
    println(programOf(Student("John", "IMA")))
    println(programOf(Person("Clara")))
}`,
            code: `open class Person(val firstname: String)
class Student(firstname: String, val degreeProgram: String) : Person(firstname)

fun programOf(p: Person): String {
    val s = p as Student
    return s.degreeProgram
}

fun main() {
    println(programOf(Student("John", "IMA")))
    println(programOf(Person("Clara")))
}`
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Alles ist Any",
            code: `open class Person(val firstname: String) {
    override fun toString() = "Person: $firstname"
}

fun main() {
    val things = listOf<Any>(Person("Clara"), true, listOf(1, 2, 3), "Test", 42)
    things.forEach { println(it) }
    println(things.count { it is String || it is Int })
}`
          },
          {
            t: "example",
            title: "Beim Arzt bist du Patient:in",
            html: "Du bist Student:in im 3. Semester, aber in der Arztpraxis spielt das keine Rolle: Dort bist du <b>Patient:in</b> (Rolle der Oberklasse). Die Ärztin fragt nach Name und Geburtsdatum – nicht nach deinem Studiengang (<code>person.degreeProgram</code> → geht nicht). Erzählst du von dir selbst (<code>toString()</code>), erzählst du trotzdem <i>deine</i> Geschichte – das ist dynamic dispatch. Und wenn die Ärztin wissen will, ob du ein Studierendenticket bekommst, fragt sie zuerst: „Studieren Sie?“ – das ist <code>is</code>."
          },
          {
            t: "hint",
            title: "Eselsbrücke: Overloading = Ober-flächlich anders",
            html: "<b>Overloading</b>: Die Parameterliste (die „Oberfläche“) ist anders, alles in derselben Klasse – entschieden beim Kompilieren. <b>Overriding</b>: Gleiche Oberfläche, aber eine Etage tiefer in der Hierarchie neu geschrieben (<code>open</code> + <code>override</code>) – entschieden beim Ausführen."
          },
          {
            t: "hint",
            title: "Prüfungsfrage: Was darf der Compiler, was entscheidet die Laufzeit?",
            html: "<code>val p: Person = Teacher(…)</code><br>• <code>p.subjects</code> → Compilerfehler (der <b>Variablentyp</b> Person kennt keine subjects)<br>• <code>p.toString()</code> → Teacher-Version (das <b>Objekt</b> ist ein Teacher)<br>Merksatz: <b>Der Typ der Variable entscheidet, was du aufrufen darfst – das Objekt entscheidet, was passiert.</b>"
          },
          {
            t: "keys",
            items: [
              "Vererbung: <code>open class</code> Oberklasse, <code>class Sub(…) : Ober(…)</code> – Sub erbt Properties und Methoden.",
              "Overloading = gleicher Name, andere Parameter (Compile-Zeit).",
              "Overriding = gleiche Signatur in der Unterklasse, braucht <code>open</code> + <code>override</code> (Laufzeit).",
              "Unterklassen-Objekte dürfen als Oberklasse verwendet werden, nicht umgekehrt.",
              "<code>is</code> prüft den Typ (mit Smart Cast), <code>as</code> castet (ClassCastException möglich), <code>as?</code> liefert null."
            ]
          },
          {
            t: "check",
            q: "<code>fun area(r: Double)</code> und <code>fun area(w: Double, h: Double)</code> in derselben Klasse – was ist das?",
            opts: ["Overriding", "Overloading", "Polymorphismus über Interfaces", "Ein Compilerfehler"],
            a: 1,
            why: "Gleicher Name, unterschiedliche Parameterlisten."
          },
          {
            t: "check",
            q: "<code>val p: Person = Student(\"John\", \"Doe\", \"IMA\")</code>. Was kompiliert?",
            opts: [
              "<code>p.degreeProgram</code>",
              "<code>val s: Student = p</code>",
              "<code>if (p is Student) println(p.degreeProgram)</code>",
              "Nichts davon"
            ],
            a: 2,
            why: "Nach der is-Prüfung greift der Smart Cast. Die anderen beiden scheitern am statischen Typ Person."
          }
        ]
      }
    },
    {
      world: "madw5",
      after: "madk5-4",
      lesson: {
        id: "madk5-5",
        title: "Abstrakte Klassen & Interfaces",
        topic: "mad-abs",
        min: 20,
        blocks: [
          {
            t: "lead",
            html: "Was bekommt man im Lebensmittelgeschäft nicht? <b>Lebensmittel!</b> Bestell mal „250 g Lebensmittel“ – du bekommst Äpfel, Brot oder Schokolade, aber nie „Lebensmittel an sich“. Genau das ist eine <b>abstrakte Klasse</b>."
          },
          {
            t: "text",
            h: "Abstrakte Klassen",
            levels: {
              simple: "„Food“ gibt es nicht wirklich – nur konkrete Dinge wie Brot oder Äpfel. Eine <code>abstract class</code> beschreibt so einen Oberbegriff: Man kann keine Objekte davon erzeugen, aber man kann damit arbeiten, z. B. einen Einkaufskorb voller Food.",
              normal: "Mit <code>abstract class Food(val kCalories: Int)</code> legst du fest: Es gibt keine Objekte vom Typ Food – <code>Food(0)</code> ergibt den Fehler <i>Cannot create an instance of an abstract class</i>. Konkrete Unterklassen wie <code>Bread</code> und <code>Apple</code> erben von Food (ohne <code>open</code> – abstrakte Klassen sind automatisch vererbbar).<br>Dank Polymorphismus kannst du trotzdem mit Food arbeiten: <code>val basket: List&lt;Food&gt; = listOf(kornSpitz, jonaGold)</code>.<br>Eine abstrakte Klasse kann <b>abstrakte Methoden</b> deklarieren – Methoden ohne Körper (<code>abstract fun getInfo(): String</code>). Jede konkrete Unterklasse <b>muss</b> sie implementieren (<code>override fun getInfo() = …</code>), sonst: <i>Class 'Bread' is not abstract and does not implement abstract base class member</i>. Und das Beste: Du kannst abstrakte Methoden aufrufen – es läuft immer die Version des konkreten Objekts.",
              technical: "Abstrakte Klassen dürfen Zustand (Properties mit Werten), Konstruktoren, konkrete und abstrakte Methoden haben. Abstrakte Member sind implizit <code>open</code>. Eine Unterklasse, die nicht alle abstrakten Member implementiert, muss selbst <code>abstract</code> sein. Abstrakte Klassen sind ideal für Template-Method-Muster: Die Oberklasse definiert den Ablauf (konkrete Methode), Unterklassen füllen einzelne Schritte (abstrakte Methoden) – so funktionieren z. B. Androids <code>ViewModel</code> oder (früher) <code>Activity</code>-Lifecycle-Methoden."
            }
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Einkaufen ohne „Food“",
            predict: {
              opts: [
                "You have shopped 376 kcal!",
                "You have shopped 321 kcal!",
                "You have shopped 266 kcal!",
                "Compilerfehler: Food ist abstrakt"
              ],
              a: 0,
              why: "266 + 55 + 55 = 376. Food selbst wird nie erzeugt – nur Bread und Apple, die als Food im Korb liegen."
            },
            code: `abstract class Food(val kCalories: Int)
class Bread(val grain: String, kCalories: Int) : Food(kCalories)
class Apple(val name: String, kCalories: Int) : Food(kCalories)

fun main() {
    val kornSpitz = Bread("wheat", 266)
    val jonaGold = Apple("Jonagold", 55)
    // val food = Food(0)        // ← ausprobieren: geht nicht!
    val shoppingBasket: List<Food> = listOf(kornSpitz, jonaGold, jonaGold)
    val totalKCalories = shoppingBasket.map { it.kCalories }.sum()
    println("You have shopped $totalKCalories kcal!")
}`
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Fehler-Detektiv: abstrakte Methode",
            goal: "Bread und Apple implementieren <code>getInfo()</code> nicht. Ergänze beide so, dass <code>A very nice speciality bread</code> und <code>A classical Austrian apple</code> ausgegeben werden.",
            expect: `A very nice speciality bread
A classical Austrian apple`,
            solution: `abstract class Food(val kCalories: Int) {
    abstract fun getInfo(): String
}
class Bread(val grain: String, kCalories: Int) : Food(kCalories) {
    override fun getInfo() = "A very nice speciality bread"
}
class Apple(val name: String, kCalories: Int) : Food(kCalories) {
    override fun getInfo() = "A classical Austrian apple"
}

fun main() {
    val basket: List<Food> = listOf(Bread("wheat", 266), Apple("Jonagold", 55))
    basket.forEach { println(it.getInfo()) }
}`,
            code: `abstract class Food(val kCalories: Int) {
    abstract fun getInfo(): String
}
class Bread(val grain: String, kCalories: Int) : Food(kCalories)
class Apple(val name: String, kCalories: Int) : Food(kCalories)

fun main() {
    val basket: List<Food> = listOf(Bread("wheat", 266), Apple("Jonagold", 55))
    basket.forEach { println(it.getInfo()) }
}`
          },
          {
            t: "text",
            h: "Interfaces",
            levels: {
              simple: "Ein <b>Interface</b> ist ein Vertrag: „Wer mich implementiert, kann das.“ Anders als bei Vererbung müssen die Klassen sonst nichts gemeinsam haben – ein Auto und eine Person können beide <code>Infoable</code> sein. Und eine Klasse darf viele Interfaces haben, aber nur eine Oberklasse.",
              normal: "Interfaces kennst du aus Go: Sie gruppieren Typen mit gemeinsamem <b>Verhalten</b>. In Kotlin dienen sie genau demselben Zweck, mit zwei Unterschieden:<ul><li>Die Mitgliedschaft wird <b>bei der Klassendeklaration</b> erklärt: <code>class Car(…) : Infoable</code> – und die Methode mit <code>override</code> markiert. In Go wird ein Interface <b>implizit</b> erfüllt, sobald die Methoden da sind.</li><li>Kotlin-Interfaces dürfen neben abstrakten Methoden auch <b>Properties</b> (ohne gespeicherten Wert) und <b>konkrete Methoden</b> mit Körper (Default-Implementierungen) enthalten – das geht in Go nicht.</li></ul>Der große Unterschied zur abstrakten Klasse: Interfaces stehen <b>außerhalb der Klassenhierarchie</b>. Jede Klasse hat genau eine direkte Oberklasse, kann aber beliebig viele Interfaces implementieren – so verbindest du Klassen, die sonst nichts gemeinsam haben (E-Bike und Motorsäge sind beide aufladbar).",
              technical: "Syntax: <code>class Dog(name: String) : Pet(name), NamedItem, Comparable&lt;Dog&gt;</code> – Oberklasse mit Konstruktoraufruf, Interfaces ohne Klammern. Eine Interface-Property wird implementiert als Konstruktor-Property (<code>override val name: String</code>) oder mit Getter (<code>override val name get() = \"$firstName $lastName\"</code>). Interfaces haben keinen Zustand (kein Backing Field) und keinen Konstruktor. Implementieren zwei Interfaces dieselbe Default-Methode, muss die Klasse sie überschreiben und kann mit <code>super&lt;A&gt;.f()</code> wählen. <code>fun interface</code> (genau eine abstrakte Methode) erlaubt Lambdas statt Implementierung – häufig bei Android-Callbacks."
            }
          },
          {
            t: "html",
            html: "<table class=\"dt\"><tr><th></th><th>abstract class</th><th>interface (Kotlin)</th><th>interface (Go)</th></tr><tr><td>Objekte erzeugen</td><td>nein</td><td>nein</td><td>nein</td></tr><tr><td>abstrakte Methoden</td><td>ja</td><td>ja</td><td>ja (nur das)</td></tr><tr><td>konkrete Methoden</td><td>ja</td><td>ja (Default)</td><td>nein</td></tr><tr><td>Zustand / Konstruktor</td><td>ja</td><td>nein</td><td>nein</td></tr><tr><td>Wie viele pro Klasse?</td><td>genau eine Oberklasse</td><td>beliebig viele</td><td>beliebig viele</td></tr><tr><td>Mitgliedschaft</td><td><code>: Food(…)</code></td><td><code>: Infoable</code> + override</td><td>implizit</td></tr></table>"
          },
          {
            t: "html",
            html: `<div class="grid g2"><div><small class="muted">Go: implizit</small><pre><code>type Infoable interface {
    Info() string
}
type Car struct { model, make string; year int }
func (c Car) Info() string { ... }   // fertig!
infos := []Infoable{person, car}</code></pre></div><div><small class="muted">Kotlin: explizit</small><pre><code>interface Infoable {
    fun info(): String
}
class Car(val model: String, val make: String,
          val year: Int) : Infoable {
    override fun info() = "$make, $model built in $year"
}</code></pre></div></div>`
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Infoable: Person und Auto",
            code: `interface Infoable {
    fun info(): String
}

// Die Mitgliedschaft im Interface muss deklariert werden: ': Infoable'
class Person(val firstname: String, val lastname: String) : Infoable {
    override fun info() = "$firstname, $lastname"
}

class Car(val model: String, val make: String, val year: Int) : Infoable {
    override fun info() = "$make, $model built in $year"
}

fun main() {
    val infos: List<Infoable> = listOf(Person("John", "Doe"), Car("Golf", "VW", 2016))
    for (info in infos) {
        println(info.info())
    }
}`
          },
          {
            t: "widget",
            w: "ktrun",
            title: "NamedItem: Interface verbindet zwei Hierarchien",
            predict: {
              opts: [
                `Ceasar
John Doe
Pluto`,
                `Ceasar
John
Pluto`,
                `Dog@1a2b
Person@3c4d
Dog@5e6f`,
                "Compilerfehler: Person hat kein name-Feld"
              ],
              a: 0,
              why: "Person erfüllt den Vertrag mit einem Getter, der Vor- und Nachnamen verbindet; Pet über die Konstruktor-Property."
            },
            note: "Ergänze eine Klasse <code>Cat</code> mit <code>makeSound() = \"meow\"</code> und gib für alle Pets in der Liste das Geräusch aus (Tipp: <code>filterIsInstance&lt;Pet&gt;()</code>).",
            code: `interface NamedItem {
    val name: String
}

class Person(val firstName: String, val lastName: String) : NamedItem {
    override val name: String
        get() = "$firstName $lastName"
}

abstract class Pet(override val name: String) : NamedItem {
    abstract fun makeSound(): String
}

class Dog(name: String) : Pet(name) {
    override fun makeSound(): String = "woof"
}

fun main() {
    val items = listOf<NamedItem>(Dog("Ceasar"), Person("John", "Doe"), Dog("Pluto"))
    items.forEach { println(it.name) }
}`
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Mehrere Interfaces + Default-Methode",
            code: `interface Chargeable {
    var battery: Int                            // abstrakte Property
    fun charge() { battery = 100 }              // Default-Implementierung
    fun status() = "\${this::class.simpleName}: $battery %"
}

interface Rideable {
    fun ride() = "Los geht's!"
}

open class Tool(val brand: String)

class EBike(override var battery: Int) : Rideable, Chargeable
class Chainsaw(brand: String, override var battery: Int) : Tool(brand), Chargeable {
    override fun charge() { battery = 80 }      // lädt nur bis 80 % (Akkuschonung)
}

fun main() {
    val devices: List<Chargeable> = listOf(EBike(12), Chainsaw("Stihl", 5))
    devices.forEach { it.charge() }
    devices.forEach { println(it.status()) }
    println(EBike(50).ride())
}`
          },
          {
            t: "example",
            title: "USB-C als Interface",
            html: "Dein Handy, dein Laptop, deine Kopfhörer und die elektrische Zahnbürste haben <b>nichts</b> gemeinsam – keine gemeinsame „Oberklasse“. Aber alle haben einen <b>USB-C-Anschluss</b>: Das ist das Interface <code>Chargeable</code>. Dein Ladegerät braucht nur zu wissen „das Ding ist Chargeable“, nicht was es sonst ist. Und ein Laptop kann zusätzlich <code>Bluetooth</code>, <code>Touchscreen</code> … implementieren – <b>mehrere Interfaces</b>, aber er ist trotzdem nur <b>ein</b> Gerätetyp (eine Oberklasse)."
          },
          {
            t: "hint",
            title: "Abstrakte Klasse oder Interface?",
            html: "Frag dich: <b>„ist ein“ oder „kann“?</b> Ein Dog <i>ist ein</i> Pet → abstrakte Klasse (gemeinsamer Zustand wie <code>name</code>, gemeinsamer Konstruktor). Ein Dog <i>kann</i> benannt werden, eine Person auch → Interface. Faustregel: Interfaces bevorzugen; abstrakte Klasse, wenn Unterklassen echten gemeinsamen Zustand oder Code teilen."
          },
          {
            t: "hint",
            title: "Prüfungsfalle: Klammern nach dem Doppelpunkt",
            html: "<code>class Dog(name: String) : Pet(name), NamedItem</code> – die <b>Oberklasse</b> bekommt Klammern (Konstruktoraufruf), das <b>Interface nicht</b> (Interfaces haben keinen Konstruktor). <code>: NamedItem()</code> ist ein Fehler."
          },
          {
            t: "keys",
            items: [
              "<code>abstract class</code>: keine Objekte, kann abstrakte und konkrete Member + Zustand haben.",
              "Abstrakte Methoden haben keinen Körper und müssen in konkreten Unterklassen implementiert werden.",
              "Interfaces gruppieren Klassen mit gemeinsamem Verhalten – auch über Hierarchien hinweg.",
              "Kotlin: Interface explizit mit <code>: Name</code> + <code>override</code>; darf Properties und Default-Methoden haben.",
              "Eine Oberklasse, aber beliebig viele Interfaces."
            ]
          },
          {
            t: "check",
            q: "Was passiert bei <code>val f = Food(0)</code>, wenn <code>Food</code> abstrakt ist?",
            opts: [
              "Ein Food-Objekt mit 0 kcal entsteht",
              "Compilerfehler: Cannot create an instance of an abstract class",
              "Laufzeitfehler",
              "Es entsteht automatisch ein Bread"
            ],
            a: 1,
            why: "Abstrakte Klassen können nicht instanziiert werden – nur ihre konkreten Unterklassen."
          },
          {
            t: "check",
            q: "Welche Aussage zu Interfaces in Kotlin ist richtig?",
            opts: [
              "Eine Klasse kann nur ein Interface implementieren",
              "Interfaces werden wie in Go implizit erfüllt",
              "Interfaces können Default-Implementierungen haben, eine Klasse kann mehrere implementieren",
              "Interfaces können Konstruktoren haben"
            ],
            a: 2,
            why: "Mehrere Interfaces + Default-Methoden; Mitgliedschaft muss explizit deklariert werden."
          }
        ]
      }
    },
    {
      world: "madw5",
      after: "madk5-5",
      lesson: {
        id: "madk5-6",
        title: "object & companion object",
        topic: "mad-comp",
        min: 14,
        blocks: [
          {
            t: "lead",
            html: "Manchmal braucht man Funktionen, die zur <i>Klasse</i> gehören und nicht zu einem einzelnen Objekt – etwa eine Hilfsfunktion, die eine id erzeugt, <b>bevor</b> das Objekt existiert. Dafür gibt es das <code>companion object</code>."
          },
          {
            t: "text",
            h: "Das Problem und die Lösung",
            levels: {
              simple: "Im zusätzlichen Konstruktor gibt es das Objekt noch nicht – also kann man dort keine Methode des Objekts aufrufen. Legt man die Hilfsfunktion in ein <code>companion object</code>, gehört sie zur Klasse selbst und ist sofort verfügbar.",
              normal: "Wir wollen den Student-Konstruktor aufräumen und die id-Erzeugung in eine private Hilfsmethode <code>makeId()</code> auslagern. Ergebnis: <i>Cannot access 'makeId' before the instance has been initialized</i>. Methoden haben Zugriff auf alle Properties des Objekts – und das Objekt wird ja gerade erst vom Konstruktor gebaut.<br>Lösung: <code>makeId</code> in ein <b><code>companion object</code></b> verschieben (übernommen aus Scala, mit etwas anderer Syntax). Dann ist <code>makeId</code> kein Member der Student-<b>Objekte</b> mehr, sondern ein Member des <b>Companion Objects</b>, das zur Klasse gehört. Der Name des Companion Objects ist egal und darf auch weggelassen werden.<br>Und was ist ein <code>object</code>? Genau das, was der Name sagt: ein Objekt – die <b>einzige</b> Instanz seiner Klasse, ein <b>Singleton</b>. Es wird automatisch erzeugt; man muss (und kann) es nicht selbst instanziieren.",
              technical: "Kotlin hat kein <code>static</code>. Member eines <code>companion object</code> ruft man über den Klassennamen auf (<code>Student.create(…)</code>), sie entsprechen Javas static-Membern (mit <code>@JvmStatic</code> auch im Bytecode). Typische Inhalte: Factory-Methoden (oft mit <code>private constructor</code>), Konstanten (<code>const val TAG = \"Main\"</code>), Zähler über alle Instanzen. <code>object</code>-Deklarationen werden beim ersten Zugriff lazy und thread-safe initialisiert. Daneben gibt es <b>object expressions</b> (<code>object : Interface { … }</code>) für anonyme Objekte. In Android: <code>companion object { fun newInstance(…) }</code> bei Fragments, <code>object</code> für Repositories/Singletons."
            }
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Fehler-Detektiv: makeId vor dem Objekt",
            goal: "Kompiliert nicht, weil <code>makeId()</code> eine Methode des Objekts ist, das noch gar nicht existiert. Verschiebe sie in ein <code>companion object</code>. Ausgabe: <code>John Doe IMA true</code>.",
            expect: "John Doe IMA true",
            solution: `data class Student(val id: String, val name: String, val studyProgram: String) {

    companion object {
        private fun makeId() = "S-" + (1000..9999).random()
    }

    constructor(name: String, studyProgram: String = "IMA") : this(
        makeId(), name, studyProgram
    )
}

fun main() {
    val s = Student("John Doe")
    println(s.name + " " + s.studyProgram + " " + s.id.startsWith("S-"))
}`,
            code: `data class Student(val id: String, val name: String, val studyProgram: String) {

    private fun makeId() = "S-" + (1000..9999).random()

    constructor(name: String, studyProgram: String = "IMA") : this(
        makeId(), name, studyProgram
    )
}

fun main() {
    val s = Student("John Doe")
    println(s.name + " " + s.studyProgram + " " + s.id.startsWith("S-"))
}`
          },
          {
            t: "widget",
            w: "ktrun",
            title: "object: das Singleton",
            code: `object MyObject {
    var testProperty: String = "MyObject"
    fun testMethod() = "Value = $testProperty"
}

fun main() {
    println(MyObject.testProperty)      // kein MyObject() nötig – es existiert schon
    MyObject.testProperty = "changed"
    println(MyObject.testMethod())
}`
          },
          {
            t: "widget",
            w: "ktrun",
            title: "Companion als Fabrik mit Zähler",
            predict: {
              opts: ["T-1 T-2", "T-0 T-1", "T-1 T-1", "Compilerfehler: Konstruktor ist private"],
              a: 0,
              why: "issued gehört zum Companion Object und existiert nur einmal für alle Tickets. ++issued erhöht zuerst und liefert dann den neuen Wert."
            },
            note: "Versuch in main <code>Ticket(5)</code> – was sagt der Compiler?",
            code: `class Ticket private constructor(val number: Int) {      // von außen nicht direkt erzeugbar
    companion object {
        const val PREFIX = "T-"
        private var issued = 0
        fun next(): Ticket = Ticket(++issued)              // innen darf der Konstruktor aufgerufen werden
    }
    override fun toString() = "$PREFIX$number"
}

fun main() {
    val a = Ticket.next()
    val b = Ticket.next()
    println("$a $b")
}`
          },
          {
            t: "example",
            title: "Der Nummernautomat am Amt",
            html: "Im Bürgerservice ziehst du am Automaten eine Wartenummer. Der <b>Automat</b> ist das <code>companion object</code>: Es gibt ihn genau einmal, er gehört zur „Klasse Wartenummer“, und er weiß, welche Nummer zuletzt ausgegeben wurde (<code>issued</code>). Die einzelnen <b>Zettel</b> sind die Objekte. Selbst einen Zettel schreiben darfst du nicht (<code>private constructor</code>) – nur der Automat druckt sie (<code>Ticket.next()</code>). Und das Amt selbst gibt es nur einmal – ein <code>object</code>."
          },
          {
            t: "hint",
            title: "Merksatz: Kotlin hat kein static",
            html: "Alles, was in Java <code>static</code> wäre, kommt in Kotlin ins <code>companion object</code> (klassenbezogen) oder top-level in die Datei (ganz ohne Klasse). Konstanten: <code>const val</code> im companion object oder top-level."
          },
          {
            t: "keys",
            items: [
              "Im <code>this(…)</code>-Aufruf eines Konstruktors gibt es das Objekt noch nicht → keine Instanz-Methoden.",
              "<code>companion object { … }</code>: Member gehören zur Klasse, Aufruf über den Klassennamen.",
              "<code>object Name { … }</code>: Singleton – genau eine, automatisch erzeugte Instanz.",
              "Kotlin hat kein static; typische Companion-Inhalte: Factory-Methoden, Konstanten, gemeinsame Zähler."
            ]
          },
          {
            t: "check",
            q: "Warum kompiliert <code>constructor(name: String) : this(makeId(), name)</code> mit einer privaten <b>Methode</b> <code>makeId()</code> nicht?",
            opts: [
              "Private Methoden darf man nie aufrufen",
              "Beim Aufruf von this(…) existiert das Objekt noch nicht, Instanz-Methoden sind nicht verfügbar",
              "makeId braucht einen Rückgabetyp",
              "Data Classes dürfen keine sekundären Konstruktoren haben"
            ],
            a: 1,
            why: "Lösung: makeId ins companion object (oder top-level) verschieben."
          },
          {
            t: "check",
            q: "Was ist ein <code>object</code> in Kotlin?",
            opts: [
              "Ein Synonym für class",
              "Eine Klasse mit genau einer, automatisch erzeugten Instanz (Singleton)",
              "Die Oberklasse aller Klassen",
              "Ein Interface ohne Methoden"
            ],
            a: 1,
            why: "Die Oberklasse aller Klassen heißt Any."
          }
        ]
      }
    },
    {
      world: "madw5",
      after: "madk5-6",
      lesson: {
        id: "madk5-7",
        title: "Übung: OOP-Werkstatt",
        topic: "mad-class",
        min: 50,
        blocks: [
          {
            t: "lead",
            html: "Acht Aufgaben vom einfachen <code>toString</code> bis zum Interface – alles aus „From Go to OOP in Kotlin“. Jede Aufgabe wird mit Tests geprüft, Tipps gibt es stufenweise."
          },
          {
            t: "callout",
            html: "So gehst du vor: Aufgabe lesen → die aufklappbaren Tests anschauen (sie zeigen dir genau, wie deine Klassen benutzt werden) → Code schreiben → <b>▶ Tests ausführen</b>. Rote Tests sagen dir, was erwartet wurde und was herauskam. Kompiliert etwas nicht, erklärt StudyOS die Fehlermeldung auf Deutsch."
          },
          { t: "widget", w: "ktlab", lab: "kt-oop" },
          {
            t: "keys",
            items: [
              "<code>override fun toString()</code> für lesbare Ausgaben, <code>data class</code> für Wertobjekte.",
              "Kapselung: <code>private set</code> + Methoden mit Regeln.",
              "Vererbung braucht <code>open</code>; abstrakte Klassen und Interfaces erzwingen Implementierungen.",
              "<code>when (x) { is Typ -> … }</code> für Fallunterscheidungen nach Typ."
            ]
          }
        ]
      }
    }
  ],
  blocks: {
    "mad5-1": [
      {
        t: "widget",
        w: "ktrun",
        title: "Klasse mit Setter, berechneter Property und init",
        code: `class Course(val code: String, ects: Int) {
    var ects: Int = ects
        set(value) {
            require(value > 0) { "ECTS must be positive" }
            field = value
        }
    val isBig: Boolean
        get() = ects >= 5              // berechnete Property

    init {
        require(code.isNotBlank()) { "code required" }
    }

    override fun toString() = "$code ($ects ECTS)"
}

fun main() {
    val c = Course("MAPPDEV", 5)
    println(c)
    println(c.isBig)
    c.ects = 4
    println(c.isBig)
    // c.ects = 0                      // ← ausprobieren: IllegalArgumentException
    // Course("", 3)                   // ← ausprobieren: init-Block schlägt Alarm
}`
      }
    ],
    "mad5-2": [
      {
        t: "widget",
        w: "ktrun",
        title: "data class: copy & Destructuring",
        code: `data class Person(val firstname: String, val lastname: String, val age: Int)

fun main() {
    val person1 = Person("John", "Doe", 22)
    val person2 = person1.copy(age = 23)        // John wurde älter!
    println("person1 = $person1")
    println("person2 = $person2")

    val (first, last, age) = person1             // Destructuring
    println("$first, $last, age=$age")
    val (first2, _, age2) = person2              // _ = interessiert mich nicht (wie in Go)
    println("$first2, age=$age2")
}`
      },
      {
        t: "widget",
        w: "ktrun",
        title: "== oder ===?",
        predict: {
          opts: [
            `true
false
true`,
            `true
true
true`,
            `false
false
true`,
            `true
false
false`
          ],
          a: 0,
          why: "== vergleicht bei data classes den Inhalt (strukturelle Gleichheit), === prüft, ob es dasselbe Objekt ist (referenzielle Gleichheit)."
        },
        code: `data class Person(val firstname: String, val lastname: String, val age: Int)

fun main() {
    val person1 = Person("John", "Doe", 22)
    val person2 = Person("John", "Doe", 22)
    val person3 = person1
    println(person1 == person2)
    println(person1 === person2)
    println(person1 === person3)
}`
      }
    ],
    "mad5-3": [
      {
        t: "widget",
        w: "ktrun",
        title: "Fehler-Detektiv: val in der Unterklasse",
        goal: "<i>'firstname' hides member of supertype</i>: Die Properties gibt es schon in Person. Repariere den Konstruktor von Student, sodass <code>John studiert IMA</code> ausgegeben wird.",
        expect: "John studiert IMA",
        solution: `open class Person(val firstname: String, val lastname: String)

class Student(firstname: String, lastname: String, val degreeProgram: String) :
    Person(firstname, lastname)

fun main() {
    val s = Student("John", "Doe", "IMA")
    println("\${s.firstname} studiert \${s.degreeProgram}")
}`,
        code: `open class Person(val firstname: String, val lastname: String)

class Student(val firstname: String, val lastname: String, val degreeProgram: String) :
    Person(firstname, lastname)

fun main() {
    val s = Student("John", "Doe", "IMA")
    println("\${s.firstname} studiert \${s.degreeProgram}")
}`
      }
    ]
  },
  questions: [
    {
      id: "madk5q1",
      topic: "mad-obj",
      q: "Welche drei Dinge besitzt jedes Objekt?",
      opts: ["Name, Typ, Wert", "Identität, Zustand, Verhalten", "Klasse, Interface, Konstruktor", "Getter, Setter, Feld"],
      a: 1,
      why: "Zustand = Werte der Properties, Verhalten = Methoden.",
      ex: ""
    },
    {
      id: "madk5q2",
      topic: "mad-obj",
      q: "Was gibt der Code aus?",
      code: `class Person(val firstname: String)
val a = Person("John")
val b = Person("John")
println(a == b)`,
      opts: ["true", "false", "Person(firstname=John)", "Compilerfehler"],
      a: 1,
      why: "Normale Klasse: == vergleicht die Identität, es sind zwei Objekte.",
      ex: ""
    },
    {
      id: "madk5q3",
      topic: "mad-obj",
      q: "Was gibt der Code aus?",
      code: `class Person(var lastname: String)
fun change(p: Person) { p.lastname = "Miller" }
val john = Person("Doe")
change(john)
println(john.lastname)`,
      opts: ["Doe", "Miller", "null", "Compilerfehler"],
      a: 1,
      why: "Die Funktion bekommt die Referenz und ändert dasselbe Objekt.",
      ex: ""
    },
    {
      id: "madk5q4",
      topic: "mad-obj",
      q: "Was bedeutet die Ausgabe <code>Person@72d718f4</code>?",
      opts: [
        "Ein Laufzeitfehler",
        "Die Standard-toString-Darstellung: Klassenname + Identitäts-Hash",
        "Die Werte des Objekts in Hex",
        "Die Zeilennummer"
      ],
      a: 1,
      why: "Lesbar wird es mit data class oder override fun toString().",
      ex: ""
    },
    {
      id: "madk5q5",
      topic: "mad-meth",
      q: "Was ist der Unterschied zwischen Methode und Extension Function?",
      opts: [
        "Keiner",
        "Methoden stehen in der Klasse und sehen auch private Member; Extensions stehen außerhalb und sehen nur Öffentliches",
        "Extensions sind schneller",
        "Methoden können keine Parameter haben"
      ],
      a: 1,
      why: "Extensions werden statisch aufgelöst, wie ein normaler Funktionsaufruf mit dem Objekt als Parameter.",
      ex: ""
    },
    {
      id: "madk5q6",
      topic: "mad-meth",
      q: "Was gibt der Code aus?",
      code: `fun String.shout() = uppercase() + "!"
println("kotlin".shout())`,
      opts: ["kotlin!", "KOTLIN!", "Kotlin!", "Compilerfehler: String hat keine Methode shout"],
      a: 1,
      why: "Extension Function auf String; uppercase() wird auf this (dem String) aufgerufen.",
      ex: ""
    },
    {
      id: "madk5q7",
      topic: "mad-meth",
      q: "Wie muss ein zusätzlicher Konstruktor aussehen?",
      opts: [
        "<code>fun constructor(name: String)</code>",
        "<code>constructor(name: String) : this(makeId(), name)</code>",
        "<code>init(name: String)</code>",
        "<code>Student(name: String) : super(name)</code>"
      ],
      a: 1,
      why: "Er heißt constructor und delegiert mit : this(…) an den primären Konstruktor.",
      ex: ""
    },
    {
      id: "madk5q8",
      topic: "mad-enc",
      q: "Was beschreibt Kapselung (Encapsulation)?",
      opts: [
        "Mehrere Klassen in einer Datei",
        "Implementierungsdetails verstecken und den Zustand nur kontrolliert änderbar machen",
        "Eine Klasse von einer anderen ableiten",
        "Code in Funktionen packen"
      ],
      a: 1,
      why: "Werkzeuge: private, private set, eigene Setter, Methoden mit Regeln.",
      ex: ""
    },
    {
      id: "madk5q9",
      topic: "mad-enc",
      q: "Welche Ausgabe erzeugt der Code?",
      code: `class Dial {
    var level = 5
        set(value) { if (value in 1..5) field = value }
}
val d = Dial()
d.level = 10
println(d.level)`,
      opts: ["5", "10", "-1", "Compilerfehler"],
      a: 0,
      why: "Der Setter übernimmt nur Werte von 1 bis 5; 10 wird ignoriert.",
      ex: ""
    },
    {
      id: "madk5q10",
      topic: "mad-enc",
      q: "Welche Zeile kompiliert <b>nicht</b>?",
      code: `class Account {
    var balance = 0.0
        private set
    fun deposit(a: Double) { balance += a }
}
val acc = Account()`,
      opts: [
        "<code>println(acc.balance)</code>",
        "<code>acc.balance = 5.0</code>",
        "<code>acc.deposit(5.0)</code>",
        "<code>val b = acc.balance + 1</code>"
      ],
      a: 1,
      why: "Der Setter ist privat – Lesen geht, Schreiben nur innerhalb der Klasse.",
      ex: ""
    },
    {
      id: "madk5q11",
      topic: "mad-enc",
      q: "Warum führt <code>set(value) { gear = value }</code> in der Property <code>gear</code> zu einem StackOverflowError?",
      opts: [
        "Weil value null ist",
        "Weil der Setter sich selbst immer wieder aufruft – richtig wäre field = value",
        "Weil gear val ist",
        "Weil Setter keine Parameter haben dürfen"
      ],
      a: 1,
      why: "Im Accessor greift man mit field auf das Backing Field zu.",
      ex: ""
    },
    {
      id: "madk5q12",
      topic: "mad-poly",
      q: "Was ist Overriding?",
      opts: [
        "Zwei Funktionen mit gleichem Namen und verschiedenen Parametern",
        "Eine Unterklasse ersetzt eine geerbte open-Methode mit gleicher Signatur durch eine eigene (override)",
        "Eine Variable bekommt einen neuen Wert",
        "Einen Typ mit as umwandeln"
      ],
      a: 1,
      why: "Gleiche Parameter, verschiedene Ebenen der Hierarchie.",
      ex: ""
    },
    {
      id: "madk5q13",
      topic: "mad-poly",
      q: "Was gibt der Code aus?",
      code: `open class Person { open fun who() = "Person" }
class Student : Person() { override fun who() = "Student" }
val p: Person = Student()
println(p.who())`,
      opts: ["Person", "Student", "Compilerfehler", "Person und Student"],
      a: 1,
      why: "Dynamic Dispatch: Es läuft die Methode des tatsächlichen Objekts.",
      ex: ""
    },
    {
      id: "madk5q14",
      topic: "mad-poly",
      q: "<code>val p: Person = Person(\"Clara\")</code> – was passiert bei <code>p as Student</code>?",
      opts: ["Clara wird zum Student", "ClassCastException zur Laufzeit", "Compilerfehler", "Es entsteht null"],
      a: 1,
      why: "as funktioniert nur, wenn das Objekt wirklich ein Student ist. as? würde null liefern.",
      ex: ""
    },
    {
      id: "madk5q15",
      topic: "mad-poly",
      q: "Warum kompiliert <code>open data class Person(val name: String)</code> nicht?",
      opts: [
        "Data Classes brauchen zwei Properties",
        "open und data sind nicht kombinierbar – von Data Classes kann man nicht erben",
        "open muss nach data stehen",
        "Es kompiliert"
      ],
      a: 1,
      why: "Für lesbare Ausgaben in einer Hierarchie: toString() überschreiben.",
      ex: ""
    },
    {
      id: "madk5q16",
      topic: "mad-poly",
      q: "Welcher Fehler entsteht bei <code>class Student(val firstname: String) : Person(firstname)</code>, wenn Person schon <code>val firstname</code> hat?",
      opts: [
        "Unresolved reference",
        "'firstname' hides member of supertype 'Person' and needs 'override' modifier",
        "Type mismatch",
        "Kein Fehler"
      ],
      a: 1,
      why: "Properties der Oberklasse im Unterklassen-Konstruktor ohne val/var übergeben.",
      ex: ""
    },
    {
      id: "madk5q17",
      topic: "mad-abs",
      q: "Was gilt für eine abstrakte Klasse?",
      opts: [
        "Man kann Objekte davon erzeugen",
        "Sie kann nicht instanziiert werden und darf abstrakte Methoden ohne Körper haben",
        "Sie darf keine Properties haben",
        "Sie muss mit open markiert werden, damit man erben kann"
      ],
      a: 1,
      why: "Abstrakte Klassen sind automatisch vererbbar.",
      ex: ""
    },
    {
      id: "madk5q18",
      topic: "mad-abs",
      q: "Was gibt der Code aus?",
      code: `abstract class Food(val kcal: Int)
class Bread(kcal: Int) : Food(kcal)
class Apple(kcal: Int) : Food(kcal)
val basket: List<Food> = listOf(Bread(266), Apple(55), Apple(55))
println(basket.sumOf { it.kcal })`,
      opts: ["376", "321", "Compilerfehler", "0"],
      a: 0,
      why: "266 + 55 + 55 = 376 – Polymorphismus über den abstrakten Typ Food.",
      ex: ""
    },
    {
      id: "madk5q19",
      topic: "mad-abs",
      q: "Wie viele Oberklassen und Interfaces darf eine Kotlin-Klasse haben?",
      opts: [
        "Je eine",
        "Beliebig viele von beiden",
        "Genau eine (direkte) Oberklasse und beliebig viele Interfaces",
        "Keine Oberklasse, nur Interfaces"
      ],
      a: 2,
      why: "Interfaces stehen außerhalb der Klassenhierarchie.",
      ex: ""
    },
    {
      id: "madk5q20",
      topic: "mad-abs",
      q: "Welche Deklaration ist korrekt?",
      opts: [
        "<code>class Dog(name: String) : Pet(name), NamedItem</code>",
        "<code>class Dog(name: String) : Pet, NamedItem()</code>",
        "<code>class Dog(name: String) extends Pet implements NamedItem</code>",
        "<code>class Dog(name: String) : NamedItem(name)</code>"
      ],
      a: 0,
      why: "Oberklasse mit Konstruktoraufruf, Interface ohne Klammern.",
      ex: ""
    },
    {
      id: "madk5q21",
      topic: "mad-abs",
      q: "Was unterscheidet Kotlin-Interfaces von Go-Interfaces?",
      opts: [
        "Nichts",
        "Kotlin: Mitgliedschaft explizit deklariert, dürfen Properties und Default-Methoden haben; Go: implizit erfüllt, nur Methodensignaturen",
        "Go-Interfaces können Zustand speichern",
        "Kotlin-Interfaces können nur eine Methode haben"
      ],
      a: 1,
      why: "",
      ex: ""
    },
    {
      id: "madk5q22",
      topic: "mad-comp",
      q: "Was ist ein <code>companion object</code>?",
      opts: [
        "Eine zweite Instanz jedes Objekts",
        "Ein Objekt in einer Klasse, dessen Member zur Klasse gehören (Ersatz für static)",
        "Eine data class",
        "Ein Interface mit Default-Methoden"
      ],
      a: 1,
      why: "Aufruf über den Klassennamen, z. B. Student.create(…).",
      ex: ""
    },
    {
      id: "madk5q23",
      topic: "mad-comp",
      q: "Was gibt der Code aus?",
      code: `object MyObject {
    var p = "MyObject"
    fun m() = "Value = $p"
}
MyObject.p = "changed"
println(MyObject.m())`,
      opts: ["changed", "Value = changed", "Value = MyObject", "Compilerfehler: MyObject() fehlt"],
      a: 1,
      why: "Ein object existiert automatisch genau einmal.",
      ex: ""
    },
    {
      id: "madk5q24",
      topic: "mad-comp",
      q: "Warum verschiebt man <code>makeId()</code> ins companion object?",
      opts: [
        "Damit sie schneller läuft",
        "Damit sie schon im this(…)-Aufruf des Konstruktors verfügbar ist, bevor das Objekt existiert",
        "Weil private Methoden sonst verboten sind",
        "Damit sie überschrieben werden kann"
      ],
      a: 1,
      why: "",
      ex: ""
    }
  ],
  flashcards: [
    {
      id: "madkf1",
      cat: "MAPPDEV",
      topic: "mad-obj",
      front: "Identität · Zustand · Verhalten",
      back: "Identität = einzigartiges Objekt (Adresse), Zustand = aktuelle Property-Werte, Verhalten = Methoden der Klasse."
    },
    {
      id: "madkf2",
      cat: "MAPPDEV",
      topic: "mad-obj",
      front: "Referenztyp",
      back: "Variable speichert die Adresse des Objekts (wie ein Go-Pointer). val b = a → beide zeigen auf dasselbe Objekt."
    },
    {
      id: "madkf3",
      cat: "MAPPDEV",
      topic: "mad-obj",
      front: "== vs. === (normale Klasse vs. data class)",
      back: "=== immer Identität. == ruft equals(): normale Klasse → Identität, data class → Inhalt."
    },
    {
      id: "madkf4",
      cat: "MAPPDEV",
      topic: "mad-obj",
      front: "Call by Value vs. Reference",
      back: "Go: Kopie (außer mit *Pointer). Kotlin: Objekte werden als Referenz übergeben – Änderungen an var-Properties sind außen sichtbar."
    },
    {
      id: "madkf5",
      cat: "MAPPDEV",
      topic: "mad-meth",
      front: "Extension Function",
      back: "fun Typ.name() = … · erweitert bestehende (auch fremde) Klassen · nur öffentliche Member sichtbar · statisch aufgelöst"
    },
    {
      id: "madkf6",
      cat: "MAPPDEV",
      topic: "mad-meth",
      front: "Zusätzlicher Konstruktor",
      back: "constructor(name: String, p: String = \"IMA\") : this(UUID.randomUUID().toString(), name, p) – muss den primären aufrufen."
    },
    {
      id: "madkf7",
      cat: "MAPPDEV",
      topic: "mad-meth",
      front: "init-Block",
      back: "Code, der bei jeder Objekterzeugung als Teil des primären Konstruktors läuft – z. B. require(…)-Prüfungen."
    },
    {
      id: "madkf8",
      cat: "MAPPDEV",
      topic: "mad-enc",
      front: "Kapselung",
      back: "Details verstecken (private) + Zustand nur kontrolliert ändern (private set, Setter mit Prüfung, Methoden)."
    },
    {
      id: "madkf9",
      cat: "MAPPDEV",
      topic: "mad-enc",
      front: "private set",
      back: `var balance = 0.0
    private set → außen lesbar, nur innerhalb der Klasse änderbar.`
    },
    {
      id: "madkf10",
      cat: "MAPPDEV",
      topic: "mad-enc",
      front: "Eigener Setter mit field",
      back: `var gear = 1
    set(value) { if (value in 1..max) field = value } – field = Backing Field (nie den Property-Namen!)`
    },
    {
      id: "madkf11",
      cat: "MAPPDEV",
      topic: "mad-poly",
      front: "Overloading",
      back: "Gleicher Name, andere Parameterliste (Anzahl/Typen) – Compiler wählt beim Kompilieren."
    },
    {
      id: "madkf12",
      cat: "MAPPDEV",
      topic: "mad-poly",
      front: "Overriding",
      back: "Gleiche Signatur in Unterklasse · Oberklasse: open fun · Unterklasse: override fun · entschieden zur Laufzeit."
    },
    {
      id: "madkf13",
      cat: "MAPPDEV",
      topic: "mad-poly",
      front: "is / as / as?",
      back: "is prüft Typ (+ Smart Cast) · as castet, ClassCastException wenn falsch · as? liefert null statt Exception."
    },
    {
      id: "madkf14",
      cat: "MAPPDEV",
      topic: "mad-poly",
      front: "Statischer vs. dynamischer Typ",
      back: "Variablentyp entscheidet, WAS du aufrufen darfst; Objekttyp entscheidet, WELCHE Implementierung läuft."
    },
    {
      id: "madkf15",
      cat: "MAPPDEV",
      topic: "mad-abs",
      front: "abstract class",
      back: "Keine Objekte · abstrakte Methoden ohne Körper müssen von konkreten Unterklassen implementiert werden · darf Zustand haben."
    },
    {
      id: "madkf16",
      cat: "MAPPDEV",
      topic: "mad-abs",
      front: "Interface (Kotlin)",
      back: "Vertrag für Verhalten · explizit: class X : Infoable + override · Properties ohne Wert + Default-Methoden erlaubt · beliebig viele pro Klasse."
    },
    {
      id: "madkf17",
      cat: "MAPPDEV",
      topic: "mad-abs",
      front: "abstract class vs. interface",
      back: "„ist ein“ + gemeinsamer Zustand → abstract class (genau eine). „kann“ über Hierarchien hinweg → interface (viele)."
    },
    {
      id: "madkf18",
      cat: "MAPPDEV",
      topic: "mad-comp",
      front: "object",
      back: "Singleton: Klasse + einzige Instanz, automatisch erzeugt. Zugriff: MyObject.property"
    },
    {
      id: "madkf19",
      cat: "MAPPDEV",
      topic: "mad-comp",
      front: "companion object",
      back: "Klassenbezogene Member (Kotlin hat kein static): Factory-Methoden, Konstanten, Zähler. Verfügbar, bevor ein Objekt existiert."
    }
  ],
  labs: [
    {
      id: "kt-oop",
      chapter: "Kapitel 5",
      title: "OOP-Werkstatt",
      lesson: "madk5-7",
      sub: "Klassen, Kapselung, Konstruktoren, Vererbung, abstrakte Klassen, Interfaces und Polymorphismus – mit Tests wie in der Übung.",
      tasks: [
        {
          id: "o-person",
          title: "Person mit toString",
          short: "toString",
          level: 1,
          topic: "mad-poly",
          prompt: "<p>Ergänze die Klasse so, dass <code>println(Person(\"John\", \"Doe\"))</code> den Text <code>Person: John, Doe</code> ausgibt – ohne <code>data class</code>.</p>",
          starter: `class Person(val firstname: String, val lastname: String) {
    // toString überschreiben
}`,
          solution: `class Person(val firstname: String, val lastname: String) {
    override fun toString() = "Person: $firstname, $lastname"
}`,
          tests: [
            { call: "Person(\"John\", \"Doe\").toString()", expect: "\"Person: John, Doe\"" },
            { call: "Person(\"Clara\", \"Watson\").toString()", expect: "\"Person: Clara, Watson\"" },
            {
              call: "Person(\"A\", \"B\") == Person(\"A\", \"B\")",
              expect: "false",
              name: "zwei Objekte bleiben verschieden (keine data class)"
            }
          ],
          hints: [
            "Jede Klasse erbt von <code>Any</code> – dort gibt es <code>toString()</code>.",
            "<code>override fun toString() = \"Person: $firstname, $lastname\"</code>"
          ],
          forbid: [["data\\s+class", "Ohne data class – überschreibe toString selbst."]]
        },
        {
          id: "o-point",
          title: "data class Point",
          short: "Point",
          level: 1,
          topic: "mad-meth",
          prompt: "<p>Schreibe eine <code>data class Point(val x: Int, val y: Int)</code> mit</p><ul><li>einer <b>Methode</b> <code>plus(other: Point): Point</code> (komponentenweise addieren)</li><li>einer <b>Extension Function</b> <code>Point.manhattan(): Int</code> = |x| + |y|</li></ul>",
          starter: `data class Point(val x: Int, val y: Int) {
    fun plus(other: Point): Point = TODO()
}

fun Point.manhattan(): Int = TODO()`,
          solution: `import kotlin.math.abs

data class Point(val x: Int, val y: Int) {
    fun plus(other: Point): Point = Point(x + other.x, y + other.y)
}

fun Point.manhattan(): Int = abs(x) + abs(y)`,
          tests: [
            { call: "Point(1, 2) == Point(1, 2)", expect: "true" },
            { call: "Point(1, 2).plus(Point(3, 4))", expect: "Point(4, 6)" },
            { call: "Point(1, 2).copy(y = 5)", expect: "Point(1, 5)" },
            { call: "Point(3, -4).manhattan()", expect: "7" },
            { call: "Point(0, 0).manhattan()", expect: "0" }
          ],
          hints: [
            "In <code>plus</code> ein neues Objekt erzeugen: <code>Point(x + other.x, y + other.y)</code>.",
            "Betrag: <code>kotlin.math.abs(x)</code> – oder <code>if (x &lt; 0) -x else x</code>."
          ]
        },
        {
          id: "o-bank",
          title: "BankAccount mit Kapselung",
          short: "BankAccount",
          level: 2,
          topic: "mad-enc",
          prompt: "<p>Baue ein <code>BankAccount(val number: Int, val overdraft: Double = 0.0)</code>:</p><ul><li><code>balance</code> startet bei 0.0, ist außen <b>lesbar, aber nicht änderbar</b></li><li><code>deposit(amount: Double): Boolean</code> – nur positive Beträge, sonst <code>false</code></li><li><code>withdraw(amount: Double): Boolean</code> – nur positive Beträge und nur, wenn der Kontostand danach nicht unter <code>-overdraft</code> fällt</li></ul>",
          starter: `class BankAccount(val number: Int, val overdraft: Double = 0.0) {
    var balance: Double = 0.0

    fun deposit(amount: Double): Boolean = TODO()

    fun withdraw(amount: Double): Boolean = TODO()
}`,
          solution: `class BankAccount(val number: Int, val overdraft: Double = 0.0) {
    var balance: Double = 0.0
        private set

    fun deposit(amount: Double): Boolean {
        if (amount <= 0.0) return false
        balance += amount
        return true
    }

    fun withdraw(amount: Double): Boolean {
        if (amount <= 0.0 || balance - amount < -overdraft) return false
        balance -= amount
        return true
    }
}`,
          tests: [
            { call: "BankAccount(1).run { deposit(100.0); balance }", expect: "100.0" },
            { call: "BankAccount(1).deposit(-5.0)", expect: "false" },
            { call: "BankAccount(1).run { deposit(50.0); withdraw(20.0) }", expect: "true" },
            {
              call: "BankAccount(1).run { deposit(50.0); withdraw(80.0); balance }",
              expect: "50.0",
              name: "zu viel abheben ändert nichts"
            },
            {
              call: "BankAccount(1, 100.0).run { withdraw(60.0); balance }",
              expect: "-60.0",
              name: "Überziehung bis -overdraft erlaubt"
            },
            { call: "BankAccount(1, 100.0).withdraw(150.0)", expect: "false" },
            { call: "BankAccount(1).withdraw(-1.0)", expect: "false" }
          ],
          hints: [
            "Lesbar, aber nicht änderbar: in der Zeile unter <code>var balance</code> <code>private set</code> ergänzen.",
            "Gültig ist ein Abheben, wenn <code>amount &gt; 0.0 &amp;&amp; balance - amount &gt;= -overdraft</code>.",
            "Boolean zurückgeben: <code>if (…) { balance -= amount; true } else false</code>"
          ],
          require: [["private\\s+set", "balance soll von außen nur lesbar sein (private set)."]]
        },
        {
          id: "o-bike",
          title: "Bicycle-Gangschaltung",
          short: "Setter",
          level: 2,
          topic: "mad-enc",
          prompt: "<p>Ergänze einen <b>eigenen Setter</b>: <code>currentGear</code> übernimmt nur Werte zwischen 1 und <code>numberOfGears</code>, ungültige Werte werden ignoriert.</p>",
          starter: `class Bicycle(val numberOfGears: Int) {
    var currentGear: Int = 1
}`,
          solution: `class Bicycle(val numberOfGears: Int) {
    var currentGear: Int = 1
        set(value) {
            if (value in 1..numberOfGears) field = value
        }
}`,
          tests: [
            { call: "Bicycle(27).apply { currentGear = 18 }.currentGear", expect: "18" },
            { call: "Bicycle(27).apply { currentGear = 42 }.currentGear", expect: "1" },
            { call: "Bicycle(27).apply { currentGear = -4 }.currentGear", expect: "1" },
            { call: "Bicycle(3).apply { currentGear = 3; currentGear = 4 }.currentGear", expect: "3" },
            { call: "Bicycle(27).apply { currentGear = 27 }.currentGear", expect: "27" }
          ],
          hints: [
            "Unter der Property: <code>set(value) { … }</code>",
            "Nur bei gültigem Wert speichern: <code>if (value in 1..numberOfGears) field = value</code> – <code>field</code>, nicht <code>currentGear</code>!"
          ]
        },
        {
          id: "o-student",
          title: "Student: Konstruktor + companion",
          short: "companion",
          level: 3,
          topic: "mad-comp",
          prompt: "<p>Ergänze <code>Student</code> um einen <b>zusätzlichen Konstruktor</b> <code>(name: String, studyProgram: String = \"IMA\")</code>, der die id automatisch vergibt: <code>S0001</code>, <code>S0002</code>, … – fortlaufend über alle Studierenden. Der Zähler und die Hilfsfunktion gehören in ein <code>companion object</code>.</p>",
          starter: `data class Student(val id: String, val name: String, val studyProgram: String) {
    // companion object mit Zähler und makeId()

    // zusätzlicher Konstruktor
}`,
          solution: `data class Student(val id: String, val name: String, val studyProgram: String) {
    companion object {
        private var counter = 0
        private fun makeId(): String {
            counter++
            return "S" + counter.toString().padStart(4, '0')
        }
    }

    constructor(name: String, studyProgram: String = "IMA") : this(makeId(), name, studyProgram)
}`,
          tests: [
            { call: "Student(\"1\", \"Max\", \"IMA\").id", expect: "\"1\"", name: "primärer Konstruktor funktioniert weiter" },
            { call: "Student(\"John\").studyProgram", expect: "\"IMA\"" },
            { call: "Student(\"Jane\", \"WI\").studyProgram", expect: "\"WI\"" },
            { check: "Student(\"x\").id.matches(Regex(\"S\\\\d{4}\"))", name: "id hat das Format S + 4 Ziffern" },
            { check: "Student(\"a\").id != Student(\"b\").id", name: "jede:r bekommt eine andere id" },
            {
              check: "Student(\"a\").id.drop(1).toInt() + 1 == Student(\"b\").id.drop(1).toInt()",
              name: "ids sind fortlaufend"
            }
          ],
          hints: [
            "Im companion object: <code>private var counter = 0</code> und eine Funktion, die ihn erhöht und die id baut.",
            "Mit führenden Nullen: <code>counter.toString().padStart(4, '0')</code>",
            "Konstruktor: <code>constructor(name: String, studyProgram: String = \"IMA\") : this(makeId(), name, studyProgram)</code>"
          ]
        },
        {
          id: "o-shape",
          title: "Abstrakte Klasse Shape",
          short: "Shape",
          level: 2,
          topic: "mad-abs",
          prompt: "<p>Gegeben ist <code>abstract class Shape</code> mit <code>abstract fun area(): Double</code> und als Beispiel <code>Circle</code>. Schreibe:</p><ul><li><code>Rectangle(val width: Double, val height: Double)</code></li><li><code>Square(side: Double)</code> – <b>erbt von Rectangle</b></li><li><code>totalArea(shapes: List&lt;Shape&gt;): Double</code></li></ul>",
          starter: `abstract class Shape {
    abstract fun area(): Double
}

class Circle(val radius: Double) : Shape() {
    override fun area() = Math.PI * radius * radius
}

class Rectangle(val width: Double, val height: Double) : Shape() {
    override fun area(): Double = TODO()
}

class Square(side: Double) : Shape() {          // soll von Rectangle erben!
    override fun area(): Double = TODO()
}

fun totalArea(shapes: List<Shape>): Double = TODO()`,
          solution: `abstract class Shape {
    abstract fun area(): Double
}

class Circle(val radius: Double) : Shape() {
    override fun area() = Math.PI * radius * radius
}

open class Rectangle(val width: Double, val height: Double) : Shape() {
    override fun area(): Double = width * height
}

class Square(side: Double) : Rectangle(side, side)

fun totalArea(shapes: List<Shape>): Double = shapes.sumOf { it.area() }`,
          tests: [
            { call: "Rectangle(2.0, 3.0).area()", expect: "6.0" },
            { call: "Square(3.0).area()", expect: "9.0" },
            { check: "(Square(2.0) as Shape) is Rectangle", name: "Square ist ein Rectangle" },
            { call: "totalArea(listOf(Rectangle(1.0, 2.0), Square(2.0)))", expect: "6.0" },
            { call: "Math.round(Circle(1.0).area() * 100)", expect: "314L" },
            { call: "totalArea(listOf())", expect: "0.0" }
          ],
          hints: [
            "Damit Square von Rectangle erben kann, muss Rectangle <code>open</code> sein.",
            "<code>class Square(side: Double) : Rectangle(side, side)</code> – dann braucht Square gar keine eigene area().",
            "Summe: <code>shapes.sumOf { it.area() }</code>"
          ]
        },
        {
          id: "o-charge",
          title: "Interface Chargeable",
          short: "Interface",
          level: 2,
          topic: "mad-abs",
          prompt: "<p>Schreibe ein Interface <code>Chargeable</code> mit</p><ul><li>abstrakter Property <code>val battery: Int</code></li><li>abstrakter Methode <code>charge(): String</code></li><li>Default-Methode <code>status(): String</code> = <code>\"Akku: 15 %\"</code> (mit dem echten Wert)</li></ul><p>Implementiere es in <code>Phone</code> (<code>charge()</code> → <code>\"Handy lädt per USB-C\"</code>) und <code>EBike</code> (<code>\"E-Bike lädt an der Steckdose\"</code>). Schreibe <code>lowBattery(devices: List&lt;Chargeable&gt;)</code>, die alle Geräte unter 20 % liefert.</p>",
          starter: `interface Chargeable {
    // battery, charge(), status()
}

class Phone(val battery: Int)

class EBike(val battery: Int)

fun lowBattery(devices: List<Chargeable>): List<Chargeable> = TODO()`,
          solution: `interface Chargeable {
    val battery: Int
    fun charge(): String
    fun status() = "Akku: $battery %"
}

class Phone(override val battery: Int) : Chargeable {
    override fun charge() = "Handy lädt per USB-C"
}

class EBike(override val battery: Int) : Chargeable {
    override fun charge() = "E-Bike lädt an der Steckdose"
}

fun lowBattery(devices: List<Chargeable>): List<Chargeable> = devices.filter { it.battery < 20 }`,
          tests: [
            { call: "Phone(15).status()", expect: "\"Akku: 15 %\"" },
            { call: "EBike(80).status()", expect: "\"Akku: 80 %\"" },
            { call: "Phone(50).charge()", expect: "\"Handy lädt per USB-C\"" },
            { call: "EBike(5).charge()", expect: "\"E-Bike lädt an der Steckdose\"" },
            { call: "lowBattery(listOf(Phone(15), EBike(80), EBike(3))).map { it.battery }", expect: "listOf(15, 3)" }
          ],
          hints: [
            "Im Interface: <code>val battery: Int</code> (ohne Wert), <code>fun charge(): String</code> (ohne Körper), <code>fun status() = \"Akku: $battery %\"</code> (mit Körper).",
            "In der Klasse: <code>class Phone(override val battery: Int) : Chargeable { override fun charge() = … }</code>"
          ]
        },
        {
          id: "o-desc",
          title: "Polymorphismus mit when/is",
          short: "is/when",
          level: 2,
          topic: "mad-poly",
          prompt: "<p>Schreibe <code>describe(p: Person): String</code>:</p><ul><li>Student → <code>\"John studiert IMA\"</code></li><li>Teacher → <code>\"Jessica unterrichtet 3 Fächer\"</code></li><li>sonst → <code>\"Clara ist eine Person\"</code></li></ul>",
          starter: `open class Person(val name: String)
class Student(name: String, val program: String) : Person(name)
class Teacher(name: String, val subjects: List<String>) : Person(name)

fun describe(p: Person): String {
    TODO()
}`,
          solution: `open class Person(val name: String)
class Student(name: String, val program: String) : Person(name)
class Teacher(name: String, val subjects: List<String>) : Person(name)

fun describe(p: Person): String = when (p) {
    is Student -> "\${p.name} studiert \${p.program}"
    is Teacher -> "\${p.name} unterrichtet \${p.subjects.size} Fächer"
    else -> "\${p.name} ist eine Person"
}`,
          tests: [
            { call: "describe(Student(\"John\", \"IMA\"))", expect: "\"John studiert IMA\"" },
            {
              call: "describe(Teacher(\"Jessica\", listOf(\"Math 1\", \"Physics 2\", \"Analysis 2\")))",
              expect: "\"Jessica unterrichtet 3 Fächer\""
            },
            { call: "describe(Person(\"Clara\"))", expect: "\"Clara ist eine Person\"" }
          ],
          hints: [
            "<code>when (p) { is Student -> … }</code> – im Zweig ist p automatisch ein Student (Smart Cast).",
            "Anzahl der Fächer: <code>p.subjects.size</code>"
          ]
        }
      ]
    }
  ]
});
})();
