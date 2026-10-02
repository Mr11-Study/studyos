/* Prüfungsvorbereitung MAPPDEV – aus Quiz-Fragensammlungen (handschriftliche QA-Notizen UE1/UE2 + Screenshots „Fragen“ 12 S., Word-Dokument „QA“ mit 38 Moodle-Screenshots inkl. Antworten) */
(function () {
const c = (window.COURSE_DEFS || []).find(x => x.id === "mappdev"); if (!c) return;

const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const C = L => "<pre><code>" + esc(L.join("\n")) + "</code></pre>";

/* ---------- neue Topics (Android-Teil der Quizzes, im Kurs bisher nur Kotlin-Grundlagen) ---------- */
Object.assign(c.topics, {
  "mad-x-android":  { name: "Android-Grundlagen: Activity, Lifecycle, Intents, Gradle", lesson: "madx-1" },
  "mad-x-views":    { name: "Klassische Views: ConstraintLayout, RecyclerView, Fragments", lesson: "madx-2" },
  "mad-x-compose":  { name: "Jetpack Compose: Composables, Layouts, Modifier", lesson: "madx-3" },
  "mad-x-material": { name: "Material Design in Compose: Theme, Scaffold, TopAppBar", lesson: "madx-4" },
  "mad-x-state":    { name: "State in Compose: remember, derivedStateOf, Hoisting", lesson: "madx-5" },
  "mad-x-arch":     { name: "App-Architektur: ViewModel, LiveData, Navigation", lesson: "madx-6" },
  "mad-x-data":     { name: "Persistenz: Room, SharedPreferences, Storage", lesson: "madx-7" },
  "mad-x-async":    { name: "Threads, AsyncTask & Coroutines", lesson: "madx-8" },
  "mad-x-se":       { name: "Testing, Debugging, Refactoring, SCM & Scrum", lesson: "madx-9" }
});

/* ---------- Zusatzkapitel ---------- */
c.worlds.push({ id: "madwx", n: 6, title: "Prüfungstraining: Android & Software Engineering", sub: "Alles, was die QA-Quizzes zu Android, Compose, Architektur, Persistenz und Testing fragen", boss: null, lessons: [

 { id: "madx-1", title: "Android-Grundlagen: Activity, Lifecycle, Intents, Gradle", topic: "mad-x-android", min: 18, xp: 0, blocks: [
   { t: "lead", html: "Die Quizzes fragen immer wieder dieselben Android-Bausteine ab: Was ist eine Activity, welcher Lifecycle-Callback bedeutet was, wie unterscheiden sich explizite und implizite Intents – und was macht Gradle?" },
   { t: "text", h: "Android & Activity", levels: {
     simple: "Android ist ein <b>anpassbares mobiles Betriebssystem</b>. Eine Activity ist ein Bildschirm deiner App. Du erzeugst sie nie selbst – das macht das System.",
     normal: "<b>Android</b> ist ein <b>mobile operating system</b> auf Linux-Basis, Open Source (AOSP) und daher von Herstellern <b>customizable</b>.<br><b>Activity</b> = ein Einstiegspunkt mit Benutzeroberfläche (meist ein Screen):<ul><li>erbt von einer Oberklasse (<code>ComponentActivity</code> / <code>AppCompatActivity</code>) – hat also sehr wohl eine Superklasse</li><li>muss in der <code>AndroidManifest.xml</code> deklariert sein</li><li>wird <b>vom System instanziiert</b> (nie <code>MainActivity()</code> selbst aufrufen – man startet sie per Intent)</li><li>hat typischerweise ein Layout bzw. per <code>setContent { … }</code> eine Compose-UI</li><li>läuft im <b>Vordergrund</b>; Hintergrundarbeit gehört in Services/WorkManager/Coroutines</li></ul>",
     technical: "Das System erzeugt die Activity per Reflection (Default-Konstruktor) und ruft dann die Lifecycle-Callbacks auf. Deshalb dürfen Activities keine eigenen Konstruktorparameter haben; Daten kommen über den Intent (Extras) oder ein ViewModel." } },
   { t: "html", html: "<table class=\"dt\"><tr><th>Callback</th><th>Bedeutung</th></tr><tr><td><code>onCreate()</code></td><td>Activity wird erzeugt: UI aufbauen (<code>setContent</code>), einmalige Initialisierung. Praktisch immer überschrieben.</td></tr><tr><td><code>onStart()</code></td><td>Activity wird <b>sichtbar</b>.</td></tr><tr><td><code>onResume()</code></td><td>Activity ist im Vordergrund, oben auf dem Activity-Stack, im Zustand <b>running/resumed</b> – der User beginnt mit ihr zu <b>interagieren</b>.</td></tr><tr><td><code>onPause()</code></td><td>Verliert den Fokus (z. B. Dialog einer anderen App, Multi-Window).</td></tr><tr><td><code>onStop()</code></td><td>Activity ist <b>nicht mehr sichtbar</b>.</td></tr><tr><td><code>onRestart()</code></td><td>Vor erneutem <code>onStart()</code> nach einem Stop.</td></tr><tr><td><code>onDestroy()</code></td><td>Activity wird zerstört (finish oder Konfigurationsänderung wie Rotation).</td></tr></table>" },
   { t: "text", h: "Intents", levels: {
     simple: "Explizit = du sagst genau, welche Activity startet. Implizit = du sagst nur, <b>was</b> passieren soll (z. B. Webseite anzeigen), Android sucht eine passende App.",
     normal: "<b>Expliziter Intent</b>: nennt die <b>exakte Komponente</b> (Klasse), z. B. die Detail-Activity der eigenen App.<br><b>Impliziter Intent</b>: nennt nur die <b>Action</b> (z. B. <code>ACTION_VIEW</code>, <code>ACTION_SEND</code>) plus Daten; das System sucht über Intent-Filter eine passende App.<br>Daten übergibt man als Extras: <code>putExtra(\"KEY\", 42)</code>, gelesen mit dem typpassenden Getter inkl. Default: <code>intent.getIntExtra(\"KEY\", 0)</code>.",
     technical: "Für Strings gibt es <code>getStringExtra(key)</code> (liefert <code>String?</code>, kein Default). Eine Methode <code>getExtra(key)</code> existiert nicht; allgemein geht <code>intent.extras?.getInt(key)</code>. <code>getLongExtra</code> liefert für einen als Int abgelegten Wert nur den Default." } },
   { t: "html", html: C([
     "// explizit: genaue Komponente",
     "val i = Intent(this, DetailActivity::class.java)",
     "i.putExtra(\"EXTRA_KEY\", 42)",
     "startActivity(i)",
     "",
     "// in DetailActivity",
     "val id = intent.getIntExtra(\"EXTRA_KEY\", 0)",
     "",
     "// implizit: nur Action + Daten",
     "startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(\"https://fh-joanneum.at\")))"]) },
   { t: "text", h: "Gradle & Annotations", levels: {
     normal: "<b>Gradle</b> ist das Build-System: kompiliert, verwaltet <b>3rd-Party-Dependencies</b> und <b>packt die App</b> (APK/AAB). Nicht zuständig für JSON oder UI-Design.<br>Im <code>android { defaultConfig { … } }</code>-Block der Modul-<code>build.gradle(.kts)</code>: <code>applicationId</code>, <code>minSdk</code> (minimales API-Level), <code>targetSdk</code>, <code>versionCode</code> (interne, steigende Ganzzahl) und <code>versionName</code> (<b>benutzerfreundlicher Versionsname</b>, z. B. \"1.2.0\").<br><b>Annotations</b> beginnen mit <code>@</code> (nicht <code>$</code>), sind Metadaten (keine Kommentare), lassen sich auf Klassen, <b>Methoden</b>, Properties und Parameter anwenden und werden oft zur <b>Code-Generierung zur Compile-Zeit</b> genutzt (Room via KSP/kapt, Compose-Compiler).",
     technical: "Beispiele: <code>@Composable</code>, <code>@Preview</code>, <code>@Entity</code>, <code>@Dao</code>, <code>@Query</code>, <code>@Test</code>. versionCode muss bei jedem Play-Store-Upload größer werden; versionName ist frei wählbar." } },
   { t: "keys", items: ["Activity: Manifest-Eintrag, vom System instanziiert, hat ein Layout/UI, hat eine Superklasse.", "onResume = oben auf dem Stack, running, User interagiert. onStop = nicht mehr sichtbar.", "Explizit = exakte Komponente · implizit = Action (VIEW, SEND).", "Int-Extra lesen: <code>getIntExtra(\"KEY\", default)</code>.", "Gradle = Packaging + Dependencies · versionName = lesbarer Name, versionCode = Zahl."] },
   { t: "widget", w: "pairs", topic: "mad-x-android", title: "Lifecycle-Callbacks zuordnen", pairs: [["onCreate", "Activity wird erzeugt, UI wird aufgebaut"], ["onStart", "Activity wird sichtbar"], ["onResume", "User beginnt zu interagieren (running)"], ["onPause", "Fokus geht verloren"], ["onStop", "Activity ist nicht mehr sichtbar"], ["onDestroy", "Activity wird zerstört"]] },
   { t: "check", q: "Du drehst das Gerät. Was passiert standardmäßig mit der Activity?", opts: ["Nichts", "Nur onPause/onResume", "Sie wird zerstört und neu erzeugt (onPause → onStop → onDestroy → onCreate → onStart → onResume)", "Die App wird beendet"], a: 2, why: "Rotation ist eine Konfigurationsänderung → Neuaufbau. Daher State in ViewModel oder rememberSaveable halten." }
 ]},

 { id: "madx-2", title: "Klassische Views: ConstraintLayout, ScrollView, RecyclerView, Fragments", topic: "mad-x-views", min: 16, xp: 0, blocks: [
   { t: "lead", html: "Ältere Quiz-Jahrgänge (XML-Views) fragen viel zu ConstraintLayout und RecyclerView. Im aktuellen Kurs wird mit Compose gebaut – die Konzepte tauchen im Fragenpool aber weiterhin auf." },
   { t: "text", h: "Maßeinheiten & Layouts", levels: {
     normal: "<b>dp</b> (density-independent pixels) für View-Größen, Padding, Margins; <b>sp</b> (scale-independent pixels) für Text (skaliert mit der Schriftgröße des Users). <b>Nicht</b> verwenden: <b>px</b>, <b>pt</b>, <b>mm</b> (und in) – sie sehen je nach Bildschirmdichte unterschiedlich aus.<br>Layouts: <b>LinearLayout</b> horizontal oder vertikal · <b>FrameLayout</b> stapelt Kinder (ein Kind „im Stack“ sichtbar) · <b>GridLayout</b> Raster · <b>RelativeLayout</b> relativ zueinander · <b>ConstraintLayout</b> <b>verbindet Views mit Constraints</b>." } },
   { t: "text", h: "ConstraintLayout", levels: {
     normal: "<ul><li>Warum? <b>Flache View-Hierarchie</b> statt verschachtelter Layouts → <b>bessere Performance</b>; außerdem <b>Drag&amp;Drop-Design</b> im Layout Editor.</li><li>Jede View braucht <b>mindestens 1 horizontalen und 1 vertikalen Constraint</b>. Ohne Constraint springt sie zur Laufzeit nach links oben (0,0) – auch wenn sie im Editor woanders steht.</li><li>Jeder Constraint-Handle hat <b>höchstens einen ausgehenden</b>, aber beliebig viele <b>eingehende</b> Constraints.</li><li>Größen: <b>fixed</b> (z. B. <code>100dp</code>), <b>wrap_content</b>, <b>match_constraint</b> (<code>0dp</code>). match_parent ist in ConstraintLayout nicht vorgesehen.</li><li><b>Guidelines</b>: unsichtbare Hilfslinien, <b>vertikal oder horizontal</b> (nie diagonal), Position fix in <b>dp</b> (<code>layout_constraintGuide_begin</code>/<code>_end</code>) oder in Prozent (<code>layout_constraintGuide_percent</code>); sie bewegen sich nicht mit den Views.</li></ul>" } },
   { t: "text", h: "ScrollView, RecyclerView, Fragments", levels: {
     normal: "<b>ScrollView</b>: genau <b>ein</b> direktes Kind (meist ein LinearLayout). Eine RecyclerView in eine ScrollView zu packen ist schlecht: das Recycling greift nicht mehr → <b>schlechte Performance</b>.<br><b>RecyclerView</b>: zeigt lange Listen und recycelt Item-Views. Der <b>Adapter</b> <b>verbindet Daten mit Item-Views</b> und überschreibt:<ul><li><code>onCreateViewHolder</code> – Layout inflaten, ViewHolder erzeugen</li><li><code>onBindViewHolder</code> – <b>Inhalte der View an Position X setzen</b></li><li><code>getItemCount</code> – Anzahl der Items</li></ul>Ein einzelnes Item repräsentiert der <b>ViewHolder</b>, nicht der Adapter.<br><b>Fragments</b>: teilen die UI in <b>eigenständige Teile</b>, haben einen <b>eigenen Lifecycle</b>, müssen aber <b>von einer Activity oder einem anderen Fragment gehostet</b> werden; Einstiegspunkt der App bleibt eine Activity." } },
   { t: "warnbox", html: "Falle Guideline-Attribut: Es heißt <code>app:layout_constraintGuide_begin</code> (bzw. <code>_end</code>, <code>_percent</code>) – nicht <code>_start</code>." },
   { t: "widget", w: "sorter", topic: "mad-x-views", title: "Einheit verwenden oder vermeiden?", cats: [{ k: "y", label: "verwenden" }, { k: "n", label: "vermeiden" }], items: [{ t: "dp für Padding und Margins", a: "y", why: "" }, { t: "sp für Textgrößen", a: "y", why: "" }, { t: "px für View-Größen", a: "n", why: "dichteabhängig" }, { t: "pt für Text", a: "n", why: "" }, { t: "mm für Text", a: "n", why: "" }] },
   { t: "check", q: "Welche Methode des Adapters füllt einen ViewHolder mit den Daten an einer Position?", opts: ["onCreateViewHolder", "getItemCount", "onBindViewHolder", "onResume"], a: 2, why: "onCreateViewHolder erzeugt, onBindViewHolder befüllt." }
 ]},

 { id: "madx-3", title: "Jetpack Compose: Composables, Layouts, Modifier", topic: "mad-x-compose", min: 16, xp: 0, blocks: [
   { t: "lead", html: "Compose ist ein <b>deklaratives</b> UI-Framework – wie React.js, SwiftUI und Flutter: Du beschreibst, wie die UI für einen Zustand aussieht, statt Views Schritt für Schritt zu verändern." },
   { t: "text", h: "Composables & Standard-Layouts", levels: {
     simple: "Eine UI-Funktion mit <code>@Composable</code> zeichnet einen Teil des Bildschirms. Ändert sich der State, wird sie neu ausgeführt (Recomposition).",
     normal: "<b>Composable</b> = Kotlin-Funktion mit <code>@Composable</code>, die UI emittiert (kein Rückgabewert). Bei State-Änderung ruft Compose betroffene Composables erneut auf (<b>Recomposition</b>).<br><b>Standard-Layouts</b>: <code>Column</code> (untereinander), <code>Row</code> (nebeneinander), <code>Box</code> (übereinander gestapelt). „Rectangle“ oder „div“ gibt es nicht.<br><b>Lange Listen</b>: <code>LazyColumn</code> / <code>LazyRow</code> – komponieren nur sichtbare Items (Gegenstück zu RecyclerView).<br><b>Modifier</b> <b>dekorieren</b> Composables oder fügen <b>Verhalten</b> hinzu: <code>padding</code>, <code>size</code>, <code>fillMaxWidth</code>, <code>background</code>, <code>clickable</code>. Reihenfolge zählt: <code>padding(16.dp).background(Red)</code> ≠ <code>background(Red).padding(16.dp)</code>.",
     technical: "Modifier werden von außen nach innen angewendet: Beim ersten Beispiel bleibt der Rand ohne Farbe, beim zweiten ist auch der Innenabstand rot. Für LazyColumn stabile <code>key</code>s angeben, damit Items bei Änderungen korrekt zugeordnet werden." } },
   { t: "html", html: C([
     "@Composable",
     "fun StudentCard(",
     "    name: String,                    // 1. Pflichtparameter",
     "    modifier: Modifier = Modifier,   // 2. modifier = erster optionaler Parameter",
     "    semester: Int = 1,               // 3. weitere optionale Parameter",
     "    onClick: () -> Unit = {}         // 4. Lambdas am Ende",
     ") {",
     "    Row(modifier.padding(8.dp).clickable { onClick() }) {",
     "        Text(name)",
     "        Spacer(Modifier.width(8.dp))",
     "        Text(\"Semester $semester\")",
     "    }",
     "}",
     "",
     "@Composable",
     "fun StudentList(names: List<String>) {",
     "    LazyColumn {",
     "        items(names) { StudentCard(name = it) }",
     "    }",
     "}"]) },
   { t: "text", h: "Wiederverwendbare Komponenten", levels: {
     normal: "Regeln aus der Vorlesung (Compose API Guidelines): Composables <b>klein halten</b>; Parameterliste beginnt mit den <b>Pflichtparametern</b>, danach optionale; <b>der <code>modifier</code> ist der erste optionale Parameter</b> (Default <code>Modifier</code>) und wird an das äußerste Element weitergereicht. Composables dürfen (und sollen) Parameter haben – „mindestens 200 Zeilen“ ist natürlich Unsinn." } },
   { t: "keys", items: ["Deklarativ wie React.js, SwiftUI, Flutter.", "Standard-Layouts: Box, Row, Column.", "Lange Listen: LazyColumn (True!).", "Modifier = dekorieren / Verhalten hinzufügen; Reihenfolge zählt.", "Parameter: Pflicht → modifier → optionale → Lambdas."] },
   { t: "widget", w: "gapfill", topic: "mad-x-compose", title: "Compose-Lücken", items: [{ s: "Für lange, scrollbare Listen nutzt man ___ statt Column.", a: ["LazyColumn"] }, { s: "Elemente übereinander stapeln: ___", a: ["Box"] }, { s: "Der erste optionale Parameter eines Composables ist der ___.", a: ["modifier", "Modifier"] }] },
   { t: "check", q: "Was gilt für Modifier?", opts: ["Sie verbinden XML- und Kotlin-Dateien", "Sie dekorieren Composables oder fügen Verhalten hinzu", "Sie implementieren Material Design", "Sie definieren das Packaging der App"], a: 1, why: "z. B. padding, background, clickable." }
 ]},

 { id: "madx-4", title: "Material Design: Theme, Typografie, Scaffold, TopAppBar", topic: "mad-x-material", min: 12, xp: 0, blocks: [
   { t: "lead", html: "Material 3 liefert Farben, Typografie und Formen – Compose stellt sie über <code>MaterialTheme</code> bereit; <code>Scaffold</code> hält die Screen-Teile zusammen." },
   { t: "text", h: "MaterialTheme & Dynamic Color", levels: {
     normal: "<code>MaterialTheme(colorScheme, typography, shapes) { … }</code> ist eine <b>Composable-Funktion</b>, die das Theme an alle Kinder weitergibt; gelesen wird über <code>MaterialTheme.colorScheme.primary</code> bzw. <code>MaterialTheme.typography.titleLarge</code>.<br><b>Dynamic Color</b> (Material You, ab Android 12) leitet das Farbschema aus dem <b>Hintergrundbild (Wallpaper)</b> des Users ab: <code>dynamicLightColorScheme(context)</code> / <code>dynamicDarkColorScheme(context)</code>.<br><b>Typography</b>: <code>TextStyle</code> mit <code>fontFamily</code>, <code>fontWeight</code>, <code>fontSize</code>, <code>lineHeight</code>, <code>letterSpacing</code> – Dinge wie „textBlink“ oder „textGlow“ gibt es nicht.",
     technical: "Technisch gibt es sowohl die Composable-Funktion <code>MaterialTheme { }</code> als auch ein gleichnamiges <code>object MaterialTheme</code> für den Zugriff auf die aktuellen Werte (CompositionLocals). Im Quiz ist „a Composable Function“ die gewünschte Antwort." } },
   { t: "text", h: "Scaffold & TopAppBar", levels: {
     normal: "<b>Scaffold</b> hält die Grundstruktur eines Screens zusammen: <code>topBar</code> (TopAppBar), <code>bottomBar</code> (BottomAppBar/NavigationBar), <code>floatingActionButton</code>, <code>snackbarHost</code> und den <b>Content</b> (bekommt <code>innerPadding</code>). Fragments und Activities sind keine Scaffold-Slots.<br><b>TopAppBar</b>: wichtigste Parameter <code>title</code>, <code>navigationIcon</code> (z. B. Zurück-Pfeil), <code>actions</code>, <code>colors</code>, <code>scrollBehavior</code>." } },
   { t: "html", html: C([
     "Scaffold(",
     "    topBar = { TopAppBar(title = { Text(\"StudyOS\") },",
     "        navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) } }) },",
     "    floatingActionButton = { FloatingActionButton(onClick = onAdd) { Icon(Icons.Default.Add, null) } }",
     ") { innerPadding ->",
     "    StudentList(names, Modifier.padding(innerPadding))",
     "}"]) },
   { t: "widget", w: "sorter", topic: "mad-x-material", title: "Gehört das in den Scaffold?", cats: [{ k: "y", label: "Scaffold-Slot" }, { k: "n", label: "kein Slot" }], items: [{ t: "TopAppBar", a: "y", why: "" }, { t: "BottomAppBar", a: "y", why: "" }, { t: "Content", a: "y", why: "" }, { t: "FloatingActionButton", a: "y", why: "" }, { t: "Fragments", a: "n", why: "" }, { t: "Activities", a: "n", why: "" }] },
   { t: "check", q: "Woraus leitet Dynamic Color die Farben ab?", opts: ["Aus der Lautstärke", "Aus dem Wallpaper des Users", "Aus dem Benutzernamen", "Aus den Chrome-Einstellungen"], a: 1, why: "Material You, Android 12+." }
 ]},

 { id: "madx-5", title: "State in Compose: remember, rememberSaveable, derivedStateOf", topic: "mad-x-state", min: 16, xp: 0, blocks: [
   { t: "lead", html: "State ist alles, was sich über die Zeit ändert. Compose zeichnet neu, wenn gelesener State sich ändert – die Quizfragen drehen sich darum, <b>wie lange</b> State überlebt und <b>wann</b> neu komponiert wird." },
   { t: "text", h: "remember vs. rememberSaveable vs. ViewModel", levels: {
     simple: "remember merkt sich einen Wert nur, solange der Screen nicht neu aufgebaut wird. Beim Drehen ist er weg – dafür gibt es rememberSaveable.",
     normal: "<code>var count by remember { mutableStateOf(0) }</code> – überlebt <b>Recompositions</b>, aber <b>keine</b> Konfigurationsänderung (Rotation), keinen App- oder Geräte-Neustart.<br><code>rememberSaveable</code> – überlebt zusätzlich <b>Konfigurationsänderungen</b> (und vom System beendete Prozesse), weil der Wert im Bundle gespeichert wird.<br><b>ViewModel</b> – überlebt Konfigurationsänderungen, hält Screen-State und Logik.<br>Dauerhaft (App-/Geräte-Neustart) nur mit <b>Persistenz</b> (DataStore/SharedPreferences, Room).",
     technical: "rememberSaveable funktioniert für Bundle-fähige Typen (primitive, String, Parcelable) bzw. mit eigenem Saver. Wischt der User die App aus den Recents, ist auch der gespeicherte Instance-State weg." } },
   { t: "text", h: "State Hoisting, derivedStateOf, späte State-Reads", levels: {
     normal: "<b>State Hoisting</b>: State wird zum Aufrufer „hochgezogen“; das Composable wird <b>stateless</b> und bekommt <code>value</code> + <code>onValueChange</code> (Unidirectional Data Flow: State nach unten, Events nach oben).<br><b>derivedStateOf</b>: wenn sich Eingabe-State <b>öfter ändert, als die UI aktualisiert werden muss</b> (z. B. Scroll-Position → nur „Button zeigen ja/nein“). Gelesener State in <code>derivedStateOf</code> löst <b>selbst keine Recomposition</b> aus – nur eine Änderung des <b>Ergebnisses</b>. Man nutzt es also, um <b>seltener</b> neu zu komponieren. Ändert sich das Ergebnis genauso oft wie die Eingabe (z. B. Vorname + Nachname), reicht <code>remember(key) { … }</code> statt derivedStateOf.<br><b>State so spät wie möglich lesen</b>: z. B. Lambda-Modifier <code>Modifier.offset { … }</code> statt <code>Modifier.offset(x.dp)</code> → nur Layout/Draw statt Recomposition." } },
   { t: "html", html: C([
     "@Composable",
     "fun Counter(count: Int, onIncrement: () -> Unit) {     // stateless",
     "    Button(onClick = onIncrement) { Text(\"Klicks: $count\") }",
     "}",
     "",
     "@Composable",
     "fun CounterScreen() {",
     "    var count by rememberSaveable { mutableIntStateOf(0) }   // überlebt Rotation",
     "    Counter(count = count, onIncrement = { count++ })",
     "}",
     "",
     "val listState = rememberLazyListState()",
     "val showTopButton by remember {",
     "    derivedStateOf { listState.firstVisibleItemIndex > 0 }   // ändert sich selten",
     "}"]) },
   { t: "keys", items: ["remember → nur Recompositions.", "rememberSaveable → auch Rotation/Konfigurationsänderung.", "derivedStateOf → seltener recomponieren, wenn nicht jede State-Änderung relevant ist.", "State so spät wie möglich lesen.", "Hoisting: value + onValueChange, Composable wird stateless."] },
   { t: "widget", w: "sorter", topic: "mad-x-state", title: "Was überlebt eine Bildschirmrotation?", cats: [{ k: "y", label: "überlebt" }, { k: "n", label: "geht verloren" }], items: [{ t: "remember { mutableStateOf(0) }", a: "n", why: "nur Recompositions" }, { t: "rememberSaveable { mutableStateOf(0) }", a: "y", why: "" }, { t: "State im ViewModel", a: "y", why: "" }, { t: "lokale Variable ohne remember", a: "n", why: "geht schon bei jeder Recomposition verloren" }] },
   { t: "check", q: "Welche Aussage zum Lesen von State stimmt?", opts: ["Es macht keinen Unterschied, wann State gelesen wird", "State sollte so spät wie möglich gelesen werden", "State sollte so früh wie möglich gelesen werden", "State darf nur im ViewModel gelesen werden"], a: 1, why: "Späte Reads begrenzen, welche Phasen/Scopes neu ausgeführt werden." }
 ]},

 { id: "madx-6", title: "App-Architektur: ViewModel, LiveData, Navigation", topic: "mad-x-arch", min: 16, xp: 0, blocks: [
   { t: "lead", html: "Gute Architektur heißt <b>Separation of Concerns</b>: keine „God Activities“ und kein Spaghetti-Code, sondern klar getrennte Schichten." },
   { t: "text", h: "Schichten & ViewModel", levels: {
     normal: "<b>UI-Schicht</b> (Composables/Activity) zeigt nur an und meldet Events → <b>ViewModel</b> hält den Screen-State, überlebt Konfigurationsänderungen und ruft das <b>Repository</b> auf → Repository kapselt die Datenquellen (Room, Netzwerk).<br>Was ein ViewModel <b>nie</b> tun darf: <b>eine View, einen Lifecycle oder irgendeine Klasse mit Referenz auf den Activity-Context halten</b> – das ViewModel lebt länger als die Activity → Memory Leak. LiveData halten, Repository-Methoden aufrufen und Berechnungen sind ausdrücklich erlaubt.",
     technical: "Braucht man einen Context, nimmt man <code>AndroidViewModel</code> (Application-Context) oder injiziert Abhängigkeiten über das Repository. Coroutines im ViewModel: <code>viewModelScope.launch { … }</code> – werden beim <code>onCleared()</code> automatisch abgebrochen." } },
   { t: "text", h: "LiveData & StateFlow", levels: {
     normal: "<b>LiveData</b> ist ein <b>lifecycle-aware</b> Observable – Implementierung des <b>Observer Patterns</b>. Es benachrichtigt nur aktive Beobachter (STARTED/RESUMED) und entfernt sie bei DESTROYED automatisch → <b>vermeidet Memory Leaks</b> und <b>Crashes durch gestoppte Activities</b>. Werte setzen: <code>setValue</code> auf dem Main-Thread, <code>postValue</code> aus einem Hintergrund-Thread (also nicht „nur aus dem Hintergrund“). Mit JSON oder UI-Design hat LiveData nichts zu tun.<br>In Compose-Apps nutzt man heute meist <code>StateFlow</code> + <code>collectAsStateWithLifecycle()</code>." } },
   { t: "text", h: "Navigation Compose", levels: {
     normal: "<b>NavController</b>: <b>zentrale API</b> der Navigation-Komponente, verwaltet den <b>Back Stack</b> (<code>navigate(\"detail/7\")</code>, <code>popBackStack()</code>), wird mit <code>rememberNavController()</code> erzeugt.<br><b>NavHost</b> (mit dem NavGraph) <b>verknüpft Routen mit Destinations</b> – das ist nicht Aufgabe des NavControllers." } },
   { t: "html", html: C([
     "class StudentViewModel(private val repo: StudentRepository) : ViewModel() {",
     "    private val _students = MutableStateFlow<List<Student>>(emptyList())",
     "    val students: StateFlow<List<Student>> = _students",
     "    fun load() = viewModelScope.launch { _students.value = repo.getAll() }",
     "}",
     "",
     "val nav = rememberNavController()",
     "NavHost(nav, startDestination = \"list\") {",
     "    composable(\"list\") { ListScreen(onOpen = { id -> nav.navigate(\"detail/$id\") }) }",
     "    composable(\"detail/{id}\") { DetailScreen(onBack = { nav.popBackStack() }) }",
     "}"]) },
   { t: "widget", w: "pairs", topic: "mad-x-arch", title: "Wer macht was?", pairs: [["ViewModel", "hält Screen-State, überlebt Rotation"], ["Repository", "kapselt Datenquellen"], ["LiveData", "lifecycle-aware Observable"], ["NavController", "verwaltet den Back Stack"], ["NavHost", "verknüpft Routen mit Destinations"]] },
   { t: "check", q: "Welches Design Pattern implementiert LiveData?", opts: ["Strategy", "Observer", "Visitor", "Command"], a: 1, why: "Beobachter registrieren sich und werden bei Änderungen benachrichtigt." }
 ]},

 { id: "madx-7", title: "Persistenz: Room, SharedPreferences, Storage", topic: "mad-x-data", min: 16, xp: 0, blocks: [
   { t: "lead", html: "Welche Daten wohin? Einstellungen → SharedPreferences/DataStore, strukturierte Daten → Room, Bilder/Videos → Dateien auf internem/externem Speicher." },
   { t: "text", h: "Speicherorte", levels: {
     normal: "<ul><li><b>SharedPreferences</b> (bzw. DataStore): kleine Key-Value-Paare (Dark Mode, Username).</li><li><b>Internal Storage</b>: immer verfügbar, privat für die App, wird bei Deinstallation gelöscht.</li><li><b>External Storage</b>: <b>nicht immer verfügbar</b> (z. B. SD-Karte entfernt), klassisch <b>world-readable</b> (andere Apps, angeschlossener PC). Nicht mit SQL abfragbar.</li><li><b>Room</b> (SQLite): strukturierte Daten, SQL-Abfragen.</li><li><b>Bilder/Videos</b>: als Dateien auf internem/externem Speicher; in der DB höchstens den Pfad speichern.</li></ul>",
     technical: "Seit Android 10 gilt Scoped Storage: Apps sehen auf dem externen Speicher nur ihre eigenen Verzeichnisse bzw. Medien über den MediaStore; „world-readable“ beschreibt das klassische Modell aus der Vorlesung." } },
   { t: "html", html: C([
     "val prefs = getSharedPreferences(packageName, Context.MODE_PRIVATE)",
     "val darkMode = prefs.getBoolean(\"DARK_MODE\", false)   // Boolean, Default false",
     "prefs.edit { putBoolean(\"DARK_MODE\", true) }"]) },
   { t: "text", h: "Room: Entity, DAO, Database", levels: {
     normal: "<b>Entity</b> (<code>@Entity</code>): definiert das <b>Schema einer Tabelle</b>; <b>jede Instanz = eine Zeile</b>.<br><b>DAO</b> (<code>@Dao</code>-Interface): stellt die <b>Funktionen zum Abfragen</b> bereit (<code>@Query</code>, <code>@Insert</code>, <code>@Update</code>, <code>@Delete</code>).<br><b>Database</b> (<code>@Database</code>, abstrakte Klasse, erbt von <code>RoomDatabase</code>): stellt die <b>Verbindung</b> zur SQLite-Datenbank her und liefert die DAOs.<br>Beim DAO auf <b>Tabelle, Rückgabetyp und Parameter</b> achten: „einen Student per id“ → <code>SELECT * FROM students WHERE id = :id</code> mit Rückgabe <code>Student?</code>." } },
   { t: "html", html: C([
     "@Entity(tableName = \"students\")",
     "data class Student(@PrimaryKey(autoGenerate = true) val id: Int = 0, val name: String, val semester: Int)",
     "",
     "@Dao",
     "interface StudentDao {",
     "    @Query(\"SELECT * FROM students WHERE id = :id\")",
     "    suspend fun findById(id: Int): Student?",
     "    @Query(\"SELECT * FROM students\")",
     "    fun getAll(): Flow<List<Student>>",
     "    @Insert(onConflict = OnConflictStrategy.REPLACE)",
     "    suspend fun insert(student: Student)",
     "}",
     "",
     "@Database(entities = [Student::class], version = 1)",
     "abstract class AppDatabase : RoomDatabase() {",
     "    abstract fun studentDao(): StudentDao",
     "}"]) },
   { t: "widget", w: "sorter", topic: "mad-x-data", title: "Room-Baustein zuordnen", cats: [{ k: "e", label: "Entity" }, { k: "d", label: "DAO" }, { k: "b", label: "Database" }], items: [{ t: "definiert das Tabellenschema", a: "e", why: "" }, { t: "eine Instanz = eine Zeile", a: "e", why: "" }, { t: "stellt Abfrage-Funktionen bereit", a: "d", why: "" }, { t: "@Query / @Insert", a: "d", why: "" }, { t: "stellt die Verbindung zur SQLite-DB her", a: "b", why: "" }, { t: "abstrakte Klasse, erbt von RoomDatabase", a: "b", why: "" }] },
   { t: "check", q: "Wo speicherst du am besten Bilder und Videos?", opts: ["In SharedPreferences", "Auf internem oder externem Speicher (Dateien)", "In der build.gradle", "Im Quellcode"], a: 1, why: "Große Binärdaten gehören ins Dateisystem; die DB speichert höchstens den Pfad." }
 ]},

 { id: "madx-8", title: "Threads, AsyncTask & Coroutines", topic: "mad-x-async", min: 10, xp: 0, blocks: [
   { t: "lead", html: "Zwei Regeln: Die UI darf <b>nur vom UI-(Main-)Thread</b> aus verändert werden, und lang laufende Aufgaben gehören <b>nicht</b> auf den UI-Thread." },
   { t: "text", h: "Main-Thread-Regeln", levels: {
     normal: "Blockiert lange Arbeit (Netzwerk, DB, große Dateien) den Main-Thread, friert die UI ein; nach ca. 5 s zeigt Android einen <b>ANR</b>-Dialog (Application Not Responding). Netzwerk auf dem Main-Thread → <code>NetworkOnMainThreadException</code>; Room verbietet Main-Thread-Queries standardmäßig. UI-Änderung aus einem Hintergrund-Thread → <code>CalledFromWrongThreadException</code>.<br><b>AsyncTask</b> (alt, seit API 30 deprecated – kommt aber im Quiz): <code>onPreExecute</code> (UI-Thread, vorher) → <code>doInBackground</code> (<b>Hintergrund-Thread</b>, lang laufende Arbeit, <b>darf die UI nicht ändern</b>) → <code>onProgressUpdate</code> (UI-Thread, Fortschritt, ausgelöst durch <code>publishProgress</code>) → <code>onPostExecute</code> (UI-Thread, <b>nach</b> der Hintergrundarbeit).<br><b>Heute</b>: Kotlin Coroutines – <code>viewModelScope.launch { val data = withContext(Dispatchers.IO) { repo.load() }; _state.value = data }</code>." } },
   { t: "widget", w: "pairs", topic: "mad-x-async", title: "AsyncTask-Methoden", pairs: [["onPreExecute", "UI-Thread, vor der Arbeit"], ["doInBackground", "Hintergrund-Thread, lange Arbeit"], ["onProgressUpdate", "UI-Thread, Fortschritt anzeigen"], ["onPostExecute", "UI-Thread, nach der Arbeit"]] },
   { t: "check", q: "Was gilt für doInBackground?", opts: ["Wird nach der Hintergrundarbeit aufgerufen", "Läuft auf einem Hintergrund-Thread und darf die UI nicht direkt ändern", "Ist für Fortschrittsanzeigen zuständig", "Läuft auf dem UI-Thread"], a: 1, why: "Fortschritt → onProgressUpdate, Ergebnis → onPostExecute." }
 ]},

 { id: "madx-9", title: "Testing, Debugging, Refactoring, SCM & Scrum", topic: "mad-x-se", min: 14, xp: 0, blocks: [
   { t: "lead", html: "Der Software-Engineering-Teil der Quizzes: Testpyramide, Given-When-Then, Testen vs. Debuggen, Refactoring, Configuration Management und Scrum-Events." },
   { t: "html", html: "<table class=\"dt\"><tr><th>Testart</th><th>Anteil</th><th>Was wird getestet?</th><th>Wo (Android)</th></tr><tr><td>Unit Tests</td><td>~70 %</td><td>eine einzelne Unit (Klasse, Funktion), schnell</td><td><code>src/test</code>, JVM</td></tr><tr><td>Integration Tests</td><td>~20 %</td><td>Zusammenspiel mehrerer Units</td><td>test / androidTest</td></tr><tr><td>End-to-End / UI Tests</td><td>~10 %</td><td>ein <b>ganzer Use Case</b> über die UI, langsam</td><td><code>src/androidTest</code>, Instrumented (Gerät/Emulator)</td></tr></table>" },
   { t: "text", h: "Given – When – Then", levels: {
     normal: "<b>Given</b>: der Zustand der Welt, bevor du beginnst (Ausgangslage). <b>When</b>: <b>das spezifizierte Verhalten, das getestet wird</b> (die Aktion). <b>Then</b>: ob das Verhalten zum erwarteten Ergebnis führt (Assertion). Feature/Use Case ist der Rahmen, nicht das When." } },
   { t: "html", html: C([
     "@Test",
     "fun average_ofTwoGrades_isCorrect() {",
     "    val calc = GradeCalculator()                 // Given",
     "    val result = calc.average(listOf(1, 3))      // When",
     "    assertEquals(2.0, result, 0.001)             // Then",
     "}"]) },
   { t: "text", h: "Testen vs. Debuggen, Refactoring, SCM, Scrum", levels: {
     normal: "<b>Testen</b> findet heraus, <b>ob</b> eine App wie vorgesehen funktioniert – kann automatisiert werden. <b>Debuggen</b> findet heraus, <b>warum</b> sie es nicht tut – wird (laut Vorlesung) <b>manuell von Entwickler:innen</b> gemacht, nicht von Managern und nicht automatisiert.<br><b>Refactoring</b>: Struktur verbessern, ohne das Verhalten zu ändern – <b>kontinuierlich</b> bzw. <b>sobald Code zu komplex aussieht</b>, nicht nach Kalender (Tests als Sicherheitsnetz).<br><b>Software Configuration Management (SCM)</b>: wie man die <b>Evolution</b> eines Softwaresystems kontrolliert (Konfigurationen identifizieren, Änderungen steuern, Status, Audits). <b>Versionsmanagement</b> (z. B. Git) ist der <b>technische</b> Teil davon. Jede neue Version/Upgrade kann <b>neue Probleme</b> bringen – deshalb SCM.<br><b>Scrum-Events</b>: Sprint Planning, Daily Scrum, <b>Sprint Review</b> (Ende des Sprints, Inkrement wird <b>mit Kunde/Stakeholdern</b> begutachtet), Sprint Retrospective (Team reflektiert den Prozess)." } },
   { t: "keys", items: ["Testpyramide 70 / 20 / 10 (Unit / Integration / E2E).", "When = das getestete Verhalten.", "Testen = OB · Debuggen = WARUM (manuell).", "Refactoring kontinuierlich bzw. wenn Code zu komplex wird.", "SCM = Evolution kontrollieren, Versionsmanagement = technischer Teil.", "Meeting am Sprint-Ende mit Kunde = Sprint Review."] },
   { t: "widget", w: "sorter", topic: "mad-x-se", title: "Unit- oder End-to-End-Test?", cats: [{ k: "u", label: "Unit Test" }, { k: "e", label: "End-to-End-Test" }], items: [{ t: "~70 % aller Tests", a: "u", why: "" }, { t: "~10 % aller Tests", a: "e", why: "" }, { t: "testet eine einzelne Klasse/Funktion", a: "u", why: "" }, { t: "testet einen ganzen Use Case", a: "e", why: "" }, { t: "läuft schnell auf der JVM", a: "u", why: "" }, { t: "klickt sich durch die UI", a: "e", why: "" }] },
   { t: "check", q: "Wie heißt das Meeting am Ende eines Sprints, in dem das Inkrement mit dem Kunden besprochen wird?", opts: ["Daily Scrum", "Sprint Planning", "Sprint Review", "Sprint Retrospective"], a: 2, why: "Die Retrospektive ist teamintern und betrifft den Prozess." }
 ]}
]});

/* ---------- Helfer für Multi-Select-Fragen (Optionen = Kombinationen) ---------- */
const L = "abcdefgh";
const fmt = s => s.length === 1 ? "nur " + s : s.split("").slice(0, -1).join(", ") + " und " + s.slice(-1);
const MS = (id, topic, stem, stmts, wrong, why, src) => {
  const correct = stmts.map((s, i) => s[1] ? L[i] : "").join("");
  const w = [...new Set(wrong)].filter(x => x !== correct).slice(0, 3);
  const pos = [...id].reduce((s, ch) => s + ch.charCodeAt(0), 0) % (w.length + 1);
  const opts = w.map(fmt); opts.splice(pos, 0, fmt(correct));
  return { id, topic, q: stem + "<br><i>Mehrfachauswahl – welche Kombination ist richtig?</i><ol type=\"a\">" + stmts.map(s => "<li>" + s[0] + "</li>").join("") + "</ol>", opts, a: pos, why, alt: true, src: src || "QA-Quiz" };
};
const Q = (id, topic, q, opts, a, why, src, code) => { const o = { id, topic, q, opts, a, why, alt: true, src: src || "QA-Quiz" }; if (code) o.code = code; return o; };
const H = "QA-Quiz (Mitschrift „Fragen“)", W = "QA-Quiz (Word-Sammlung)", B = "QA-Quiz (beide Sammlungen)", X = "Zusatzfrage (prüfungsnah)";

c.questions.push(
 /* ===== Kotlin (UE1/UE2) ===== */
 Q("madx-q1", "mad-types", "UE1: Map the Go types/operators to Kotlin: <code>float32</code>, <code>float64</code>, <code>&lt;&lt;</code>", ["Float, Double, shl", "Double, Float, shl", "Float, Double, &lt;&lt;", "Float32, Float64, shl"], 0, "Go float32 → Kotlin Float, float64 → Double; Bit-Shift-Operatoren sind in Kotlin Infix-Funktionen: &lt;&lt; → shl, &gt;&gt; → shr, &amp; → and, | → or.", H),
 MS("madx-q2", "mad-fop", "UE1: Select the function operations we covered in the lecture:", [["transform", false], ["forEach", true], ["change", false], ["map", true], ["apply", false], ["find", false], ["None of the other options", false]], ["bdf", "abd", "g", "bde"], "In der Vorlesung: forEach, map (und filter/fold). „transform“/„change“ gibt es nicht; apply ist eine Scope-Function, kein Collection-Operator. Laut Mitschrift heißt Gos „find“-Idee in Kotlin filter.", H),
 Q("madx-q3", "mad-fop", "UE1: What is <code>result</code>?", ["[\"Sandra\", \"Marcus\"]", "[false, true, false, true]", "[5, 5]", "This will cause an error!", "None of the other options"], 4, "Kein Name ist kürzer als 4 Zeichen (John und Josy haben genau 4) → result ist eine <b>leere Liste []</b>, die nicht unter den Optionen steht. [\"Sandra\", \"Marcus\"] wäre das Ergebnis von length &gt; 4.", H, "val values = listOf(\"John\", \"Sandra\", \"Josy\", \"Marcus\")\nval result = values.filter { it.length < 4 }"),
 Q("madx-q4", "mad-class", "UE2: What will be printed?", ["true", "false", "none of the other options"], 1, "Product ist keine data class und überschreibt equals nicht → == vergleicht die Referenzen: zwei verschiedene Objekte → false. Die selbstgeschriebene equality-Funktion wird von == nicht verwendet (&amp;&amp; bricht ab, sobald der erste Teil false ist).", H, "class Product(val name: String) {\n    fun equality(other: Any) = other is Product && other.name == name\n}\nval product1 = Product(\"xy\")\nval product2 = Product(\"xy\")\nprintln(product1 == product2)"),
 Q("madx-q5", "mad-inh", "UE2: What was printed?", ["3", "the code does not compile", "null", "none of the other options", "NullPointerException is thrown"], 1, "Person hat nur den Konstruktorparameter name. Person(\"Max\", 3) → Too many arguments → Compilerfehler. Student(\"Max\", 3) wäre korrekt.", H, "open class Person(val name: String) {}\nclass Student(name: String, val year: Int) : Person(name) {}\n\nvar person = Person(\"Max\", 3)\nprintln(person)"),
 Q("madx-q6", "mad-class", "UE2: The process of creating a new object (from a class) is called …", ["Deklaration", "Instanziierung (instantiation)", "Vererbung", "Kapselung"], 1, "Ein Objekt ist eine Instanz einer Klasse; der Konstruktoraufruf <code>Student(\"Kevin\")</code> instanziiert. (In der Mitschrift war „none of the other options“ markiert – die Originaloptionen sind nicht erhalten.)", H),
 Q("madx-q7", "mad-class", "Was gibt <code>println(product1.equality(product2))</code> beim UE2-Product-Code aus?", ["true", "false", "Compilerfehler", "null"], 0, "Hier wird die eigene Funktion aufgerufen: other is Product → true, und beide Namen sind \"xy\" → true.", X),
 Q("madx-q8", "mad-data", "Was gibt der Code aus?", ["true false", "false false", "true true", "false true"], 0, "data class generiert equals → == vergleicht den Inhalt (true). === prüft Referenzgleichheit: zwei Objekte → false.", X, "data class Product(val name: String)\nval a = Product(\"xy\")\nval b = Product(\"xy\")\nprintln(\"${a == b} ${a === b}\")"),
 Q("madx-q9", "mad-inh", "Welche Zeile kompiliert <b>nicht</b>?", ["<code>println(s.name)</code>", "<code>println(s.year)</code>", "<code>println(s is Student)</code>", "<code>println((s as Student).year)</code>"], 1, "Der statische Typ von s ist Person – Person kennt kein year (Unresolved reference). Mit Cast oder Smart Cast nach is-Check klappt es.", X, "open class Person(val name: String)\nclass Student(name: String, val year: Int) : Person(name)\nval s: Person = Student(\"Max\", 3)"),
 Q("madx-q10", "mad-fop", "Was gibt der Code aus?", ["[KOTLIN, FUN, ANDROID]", "[KOTLIN, IS, FUN, GO, ANDROID]", "[IS, GO]", "[Kotlin, fun, Android]"], 0, "filter behält Wörter mit mehr als 2 Zeichen, map wandelt in Großbuchstaben um.", X, "val words = listOf(\"Kotlin\", \"is\", \"fun\", \"Go\", \"Android\")\nprintln(words.filter { it.length > 2 }.map { it.uppercase() })"),

 /* ===== Android-Grundlagen ===== */
 Q("madx-q11", "mad-x-android", "Android is a ___ that is ___ (drag &amp; drop: mobile operating system / customizable / Facebook / not customizable)", ["mobile operating system – not customizable", "Facebook – customizable", "mobile operating system – customizable", "Facebook – not customizable"], 2, "Android ist ein offenes (AOSP), von Herstellern anpassbares mobiles Betriebssystem.", B),
 MS("madx-q12", "mad-x-android", "An Android Activity …", [["Does not have a superclass", false], ["Is instantiated by the System", true], ["Runs in the background", false], ["Typically has a layout associated with it that defines its UI", true], ["Must be declared in the AndroidManifest.xml", true]], ["de", "bd", "abde", "cde"], "Activities erben von ComponentActivity/AppCompatActivity, werden vom System erzeugt, im Manifest deklariert und haben eine UI. Hintergrundarbeit → Services/Coroutines.", B),
 MS("madx-q13", "mad-x-android", "The Lifecycle callback function <b>onResume</b> …", [["Indicates that the activity has moved to top of the Activity stack", true], ["Indicates that the activity is in the running state", true], ["Is called when the Activity is no longer visible to the user", false], ["Is called when the Activity will start interacting with the user", true], ["Is the only callback function we <b>must</b> implement", false]], ["bd", "abde", "abc", "ad"], "„No longer visible“ ist onStop. Pflicht ist keine einzelne Callback – praktisch überschreibt man immer onCreate.", B),
 Q("madx-q14", "mad-x-android", "What is the main characteristic of an <b>explicit</b> intent?", ["It does not communicate with the Android system.", "It specifies the app version.", "It specifies the action to be performed (i.e. View, Send).", "It specifies the Android OS version.", "It specifies the exact component (e.g. the activity to be started)."], 4, "Explizit: Intent(this, DetailActivity::class.java). Die Action beschreibt den impliziten Intent.", H),
 Q("madx-q15", "mad-x-android", "What is the main characteristic of an <b>implicit</b> intent?", ["It specifies the action to be performed (i.e. View, Send).", "It specifies the app version.", "It specifies the exact component (e.g. the activity to be started).", "It specifies the Android OS version.", "It does not communicate with the Android system."], 0, "Implizit: nur Action + Daten, das System sucht eine passende App über Intent-Filter.", W),
 Q("madx-q16", "mad-x-android", "Which of the following code snippets is correct when trying to read an <b>Int</b> value from an Intent?", ["<code>intent.getIntExtra(\"EXTRA_KEY\", 0)</code>", "<code>intent.getLongExtra(\"EXTRA_KEY\", 0)</code>", "<code>intent.getExtra(\"EXTRA_KEY\") as? Int</code>", "<code>intent.getStringExtra(\"EXTRA_KEY\")</code>", "<code>intent.getExtra(\"EXTRA_KEY\") as? String</code>"], 0, "Typpassender Getter mit Default-Wert. getExtra(…) existiert nicht; getLongExtra würde für einen Int-Wert nur den Default liefern.", H),
 Q("madx-q17", "mad-x-android", "What does the <b>versionName</b> in the android block of the build.gradle on the module level define?", ["A user-friendly version name for the app.", "The version of the SDK build tools used by Gradle.", "The minimum API level required to run the app.", "The version number of the app.", "The API level used to test the app."], 0, "versionName = lesbarer Name (\"1.2.0\"); die interne Versionsnummer ist versionCode, das minimale API-Level minSdk.", W),
 MS("madx-q18", "mad-x-android", "What is <b>Gradle</b> responsible for?", [["JSON De-/Serialization", false], ["Packaging the App", true], ["Building UI Designs", false], ["Managing 3rd Party dependencies", true]], ["abd", "bcd", "d", "ab"], "Gradle baut, packt (APK/AAB) und verwaltet Abhängigkeiten. JSON → Bibliotheken wie kotlinx.serialization/Gson.", W),
 MS("madx-q19", "mad-x-android", "Which statements about <b>Annotations</b> are correct?", [["Can be used to do code generation at compile-time", true], ["Can be applied to <b>Methods</b>", true], ["Are prefixed with $", false], ["Are how we add comments in Android", false]], ["b", "abc", "ad", "a"], "Annotationen beginnen mit @ (z. B. @Query) und sind Metadaten, keine Kommentare; Room/KSP generiert daraus Code.", W),
 Q("madx-q20", "mad-x-android", "In welcher Reihenfolge werden die Callbacks beim ersten Start einer Activity aufgerufen?", ["onStart → onCreate → onResume", "onCreate → onResume → onStart", "onCreate → onStart → onResume", "onResume → onStart → onCreate"], 2, "Erzeugt → sichtbar → interaktiv.", X),
 Q("madx-q21", "mad-x-android", "Der User drückt den Home-Button, während deine Activity läuft. Welche Callbacks folgen?", ["onPause → onStop", "onPause → onStop → onDestroy", "nur onPause", "onDestroy"], 0, "Die Activity ist nicht mehr sichtbar, bleibt aber erhalten. Beim Zurückkehren: onRestart → onStart → onResume.", X),

 /* ===== Views (ältere Quizzes) ===== */
 Q("madx-q22", "mad-x-views", "A Constraint Layout … (select one)", ["Positions views on a grid", "Connects views with constraints", "Shows one child in a stack of children", "Positions views horizontally or vertically", "Positions child views relative to each other"], 1, "Grid = GridLayout, Stack = FrameLayout, horizontal/vertikal = LinearLayout, relativ zueinander = RelativeLayout.", B),
 MS("madx-q23", "mad-x-views", "Which units of measurement should we <b>not</b> use in Android Layouts?", [["px (Pixels) for View sizes, padding and margins", true], ["dp (Density Independent Pixels) for View sizes, padding and margins", false], ["pt (Points) for Text", true], ["mm (Millimeters) for Text", true], ["sp (Scale Independent Pixels) for Text", false]], ["be", "ac", "acde", "ad"], "Richtig sind dp für Größen und sp für Text. px/pt/mm sind dichteabhängig bzw. ignorieren die Schriftgrößen-Einstellung.", B),
 MS("madx-q24", "mad-x-views", "The <b>Adapter</b> of a RecyclerView …", [["Overrides <b>onCreateViewHolder</b> to inflate a view and create a ViewHolder", true], ["Represents a single item in a recycler view", false], ["Connects data with view items", true], ["Is a separate XML File", false]], ["ab", "abc", "c", "cd"], "Ein einzelnes Item repräsentiert der ViewHolder; der Adapter ist eine Kotlin-Klasse.", H),
 Q("madx-q25", "mad-x-views", "The <b>onBindViewHolder</b> callback in the RecyclerView adapter is responsible for:", ["Counting the items in the List", "Setting the contents of a view at a given position", "Creating the ViewHolder", "Creating a list of Data"], 1, "Zählen → getItemCount, Erzeugen → onCreateViewHolder.", H),
 MS("madx-q26", "mad-x-views", "Which statements about a <b>ScrollView</b> are true?", [["A ScrollView takes exactly <b>one</b> child.", true], ["It's a <b>good idea</b> to have a RecyclerView as the child of a ScrollView.", false], ["Adding a RecyclerView as the child of a ScrollView leads to <b>poor performance</b>.", true], ["A ScrollView can have multiple <b>children</b>.", false]], ["ad", "bc", "acd", "a"], "Mehrere Views → in ein LinearLayout packen. RecyclerView scrollt selbst; in einer ScrollView verliert sie das Recycling.", H),
 MS("madx-q27", "mad-x-views", "For a view in a Constraint Layout we have the following sizing options:", [["match_constraint (0dp)", true], ["wrap_content", true], ["match_sibling", false], ["fixed (e.g. 100dp)", true], ["wrap_neighbor", false]], ["ab", "abc", "bde", "abde"], "match_sibling und wrap_neighbor gibt es nicht.", H),
 MS("madx-q28", "mad-x-views", "Which statements about <b>Guidelines</b> in a Constraint Layout are correct?", [["They have an attribute called <code>app:layout_constraintGuide_start</code>.", false], ["The position of a Guideline moves based on the Views contained within.", false], ["They can be <b>vertical</b>.", true], ["They can be <b>diagonal</b>.", false], ["They can be positioned in <b>dp</b>.", true]], ["ace", "ce", "bce", "acd"], "Guidelines sind vertikal oder horizontal, positioniert in dp (layout_constraintGuide_begin/_end) oder Prozent (_percent). Achtung: In der Mitschrift war auch a angekreuzt – ein Attribut „…Guide_start“ gibt es aber nicht (es heißt …Guide_begin). Falls das Moodle-Quiz a doch wertet, dann wegen dieser Verwechslung.", H),
 MS("madx-q29", "mad-x-views", "Why did Google create the constraint layout when everything it can do could also be achieved with a combination of other layouts?", [["To <b>decrease</b> performance.", false], ["To make layout-building <b>more</b> complex.", false], ["It <b>increases</b> nesting of views.", false], ["To <b>improve</b> performance.", true], ["It allows for <b>Drag&amp;Drop</b> Design of UI.", true]], ["cd", "d", "cde", "ae"], "Flache Hierarchie statt verschachtelter Layouts → schnelleres Measure/Layout; dazu der grafische Editor.", H),
 MS("madx-q30", "mad-x-views", "Which statements about positioning a view within a constraint layout are correct?", [["A view can have at <b>most</b> 5 constraints (3 horizontal and 2 vertical)", false], ["For a view to know its position in a constraint layout it needs at least <b>1 horizontal</b> and <b>1 vertical</b> constraint.", true], ["Each constraint handle can only have <b>one outgoing</b> constraint but <b>many incoming</b> constraints", true], ["For a view to know its position in a constraint layout it needs at least <b>1 vertical</b> constraint.", false], ["A view without a constraint <b>stays</b> at the position it is dragged-to in the graphical editor.", false]], ["bce", "b", "cd", "bcd"], "Ohne Constraint landet die View zur Laufzeit bei (0,0) – die Position im Editor ist nur eine Design-Zeit-Angabe.", H),
 MS("madx-q31", "mad-x-views", "Fragments in Android …", [["can live on their own", false], ["have their own lifecycle", true], ["are the entry point to our app", false], ["divide the UI in discrete chunks", true], ["must be hosted by an activity or another fragment", true]], ["bd", "abde", "bce", "de"], "Fragments brauchen immer einen Host; Einstiegspunkt ist eine Activity (Launcher-Intent-Filter im Manifest).", H),
 Q("madx-q32", "mad-x-views", "Welche Einheit nutzt man für Textgrößen?", ["dp", "sp", "px", "pt"], 1, "sp skaliert zusätzlich mit der vom User gewählten Schriftgröße (Barrierefreiheit).", X),

 /* ===== Compose ===== */
 Q("madx-q33", "mad-x-compose", "Modifiers in Jetpack Compose …", ["Merge XML and Kotlin Files", "Decorate or add behavior to Compose UI elements", "Are responsible for implementing MaterialDesign", "Define how an Android App should be packaged"], 1, "z. B. Modifier.padding(8.dp).clickable { … }.", W),
 Q("madx-q34", "mad-x-compose", "In order to display long Lists in Jetpack Compose we use LazyColumn.", ["True", "False"], 0, "LazyColumn/LazyRow komponieren nur sichtbare Items – das Compose-Gegenstück zur RecyclerView.", W),
 Q("madx-q35", "mad-x-compose", "Jetpack Compose is a declarative UI Framework, similar to …", ["Bitcoin, Ethereum and Monero", "TypeScript, Dart and Python", "Ajax, jQuery and DOM", "React.js, SwiftUI and Flutter"], 3, "Alle drei beschreiben UI deklarativ als Funktion des States. TypeScript/Dart/Python sind Sprachen, jQuery/DOM imperativ.", W),
 MS("madx-q36", "mad-x-compose", "In order to layout elements in Jetpack Compose we use these \"Standard Layouts\":", [["Box", true], ["Rectangle", false], ["Row", true], ["Column", true], ["div", false]], ["cd", "acde", "abcd", "ad"], "Box, Row, Column. „div“ ist HTML, „Rectangle“ kein Layout.", W),
 MS("madx-q37", "mad-x-compose", "Which statements about building reusable components are correct?", [["The Parameter list should start with required ones, followed by optional Parameters", true], ["Composables should have <b>at least 200</b> lines of code", false], ["Composables cannot have parameters", false], ["The modifier should be the first optional parameter", true], ["They should be kept small", true]], ["ae", "ade", "de", "abde"], "Compose API Guidelines: Pflichtparameter → modifier: Modifier = Modifier → weitere optionale → Content-Lambda.", W),
 Q("madx-q38", "mad-x-compose", "Was ist der Unterschied zwischen <code>Modifier.padding(16.dp).background(Color.Red)</code> und <code>Modifier.background(Color.Red).padding(16.dp)</code>?", ["Keiner", "Beim ersten bleibt der 16-dp-Rand ungefärbt, beim zweiten ist auch der Rand rot", "Beim ersten ist auch der Rand rot, beim zweiten nicht", "Das zweite kompiliert nicht"], 1, "Modifier werden in Reihenfolge angewendet: zuerst Abstand, dann Hintergrund für den inneren Bereich – bzw. umgekehrt.", X),
 Q("madx-q39", "mad-x-compose", "Was macht die Annotation <code>@Composable</code>?", ["Sie macht aus einer Klasse eine Activity", "Sie markiert eine Funktion, die UI beschreibt und vom Compose-Compiler verarbeitet wird", "Sie speichert State dauerhaft", "Sie registriert die Funktion im Manifest"], 1, "Composables dürfen nur aus anderen Composables aufgerufen werden.", X),

 /* ===== Material ===== */
 Q("madx-q40", "mad-x-material", "The <b>dynamic color</b> scheme derives its colors from:", ["The current volume", "The user's wallpaper", "The username", "The settings in chrome"], 1, "Material You (Android 12+): dynamicLightColorScheme(context).", W),
 MS("madx-q41", "mad-x-material", "What are some key parameters of a <b>TopAppBar</b>?", [["BottomBarItem", false], ["FloatingActionButton", false], ["NavigationItem", true], ["Title", true]], ["bd", "d", "acd", "bcd"], "TopAppBar(title, navigationIcon, actions, …). Der FAB ist ein eigener Scaffold-Slot.", W),
 MS("madx-q42", "mad-x-material", "What are some customization options of Typography TextStyles?", [["textBlink", false], ["textGlow", false], ["fontWeight", true], ["fontFamily", true]], ["bcd", "d", "abcd", "ac"], "TextStyle: fontFamily, fontWeight, fontSize, lineHeight, letterSpacing …", W),
 MS("madx-q43", "mad-x-material", "Which parts of the UI does the <b>Scaffold</b> \"hold together\"?", [["Fragments", false], ["TopAppBar", true], ["BottomAppBar", true], ["Activities", false], ["Content", true]], ["bc", "abce", "bcde", "be"], "Slots: topBar, bottomBar, floatingActionButton, snackbarHost, content.", W),
 Q("madx-q44", "mad-x-material", "The <b>MaterialTheme</b> is …", ["a ViewModel", "a Composable Function", "an Object", "an Activity"], 1, "MaterialTheme(colorScheme, typography, shapes) { content } ist eine Composable-Funktion. (Es gibt zusätzlich ein object MaterialTheme zum Auslesen, z. B. MaterialTheme.colorScheme – gefragt ist aber die Composable.)", W),

 /* ===== State ===== */
 MS("madx-q45", "mad-x-state", "Using <b>remember</b> preserves state across …", [["Recompositions", true], ["App Restarts", false], ["Device Restarts", false], ["Orientation Changes", false]], ["ad", "abcd", "d", "ab"], "Für Orientation Changes braucht man rememberSaveable (oder ViewModel), für Neustarts Persistenz.", W),
 MS("madx-q46", "mad-x-state", "Which statements about <b>derivedStateOf</b> are correct?", [["Used when we want to recompose <b>more</b> often", false], ["Reading state in derivedStateOf does <b>NOT</b> lead to recomposition", true], ["Instead of <b>derivedStateOf</b>, <b>remember</b> can be used", true], ["Used when there is <b>no need</b> to update on every state change", true]], ["bd", "abd", "cd", "abcd"], "derivedStateOf reduziert Recompositions: Nur eine Änderung des Ergebnisses löst Recomposition aus. c gilt laut Lösung, weil man bei Ergebnissen, die sich genauso oft ändern wie die Eingaben, einfach remember(keys) { … } verwendet (derivedStateOf wäre dann Overhead).", W),
 Q("madx-q47", "mad-x-state", "Which statement about reading state is correct?", ["It makes no difference when state is read", "State should be read as late as possible", "State should be read as early as possible"], 1, "Spätes Lesen (z. B. Lambda-Modifier) beschränkt, was bei Änderungen neu ausgeführt wird.", W),
 Q("madx-q48", "mad-x-state", "Welcher Code merkt sich einen Zähler auch über eine Bildschirmrotation hinweg?", ["<code>var n = 0</code>", "<code>var n by remember { mutableStateOf(0) }</code>", "<code>var n by rememberSaveable { mutableStateOf(0) }</code>", "<code>val n = mutableStateOf(0)</code>"], 2, "remember überlebt nur Recompositions; ohne remember wird der Wert bei jeder Recomposition neu erzeugt.", X),
 Q("madx-q49", "mad-x-state", "Was bedeutet <b>State Hoisting</b>?", ["State wird in einer globalen Variable gespeichert", "State wird zum Aufrufer verschoben; das Composable bekommt value und onValueChange und wird stateless", "State wird in SharedPreferences gespeichert", "Ein Composable liest State so früh wie möglich"], 1, "Unidirectional Data Flow: State fließt nach unten, Events nach oben – macht Composables wiederverwendbar und testbar.", X),

 /* ===== Architektur ===== */
 Q("madx-q50", "mad-x-arch", "What is an important property of good Software Architecture?", ["Spaghetti Code", "Separation of Concerns", "God Activities", "Lots of files"], 1, "Jede Komponente hat eine klar abgegrenzte Aufgabe (UI, ViewModel, Repository, Datenquelle).", B),
 Q("madx-q51", "mad-x-arch", "Which design pattern does LiveData implement?", ["Strategy Pattern", "Observer Pattern", "Visitor Pattern", "Command Pattern"], 1, "Beobachter registrieren sich mit observe(owner) { … } und werden bei Änderungen benachrichtigt.", B),
 Q("madx-q52", "mad-x-arch", "What is the one thing a ViewModel should never do?", ["call the methods of a Repository", "reference a view, Lifecycle, or any class that holds a reference to the activity context", "hold LiveData objects", "calculations of any sort"], 1, "Das ViewModel lebt länger als die Activity (z. B. bei Rotation) → Referenzen auf View/Context verursachen Memory Leaks.", B),
 MS("madx-q53", "mad-x-arch", "The LiveData Architecture Component …", [["helps to avoid crashes due to stopped activities", true], ["makes designing UI easier", false], ["helps to <b>avoid</b> memory leaks", true], ["can change its value only from a <b>background</b> thread", false], ["is responsible for de-/serialization of JSON", false]], ["acd", "c", "ab", "ce"], "Lifecycle-aware: nur aktive Beobachter werden benachrichtigt, bei DESTROYED automatisch entfernt. setValue (Main-Thread) und postValue (beliebiger Thread) sind beide möglich.", B),
 MS("madx-q54", "mad-x-arch", "Which statements about <b>NavController</b> are correct?", [["Central API for the Navigation component", true], ["Responsible for managing back stack", true], ["Can be created with <b>rememberNavController()</b>", true], ["Responsible for linking routes to destinations", false]], ["abcd", "ab", "bcd", "ac"], "Routen mit Destinations verknüpft der NavHost (NavGraph).", W),
 Q("madx-q55", "mad-x-arch", "Warum überlebt State im ViewModel eine Bildschirmrotation, State in der Activity aber nicht?", ["Weil das ViewModel in SharedPreferences gespeichert wird", "Weil das ViewModel an den ViewModelStore gebunden ist und erst bei endgültigem Beenden (onCleared) zerstört wird, nicht bei der Neuerzeugung der Activity", "Weil Rotationen die Activity nicht neu erzeugen", "Weil das ViewModel auf einem eigenen Thread läuft"], 1, "Die Activity wird bei Konfigurationsänderungen neu erzeugt, das ViewModel wird der neuen Instanz wieder übergeben.", X),

 /* ===== Persistenz ===== */
 MS("madx-q56", "mad-x-data", "Which statements about <b>Entities</b> in Room are true?", [["Entities define the schema of a Database Table", true], ["They are used to establish the connection to a SQLite database", false], ["They provide functions to query the database", false], ["Entities are stored in shared preferences", false], ["Each entity instance represents a single row in a database table", true]], ["abe", "ace", "e", "ae"], "Verbindung → @Database-Klasse, Abfragefunktionen → DAO.", B),
 MS("madx-q57", "mad-x-data", "Android's <b>external storage</b> …", [["Is always available", false], ["Is not always available, could be removed (e.g. SDCARD)", true], ["Is only accessible by your app, unless explicitly set to be readable or writable", false], ["Can be queried with SQL", false], ["Is world-readable (by other apps or a connected pc)", true]], ["bc", "be", "abe", "ce"], "„Nur für die eigene App“ beschreibt den internen Speicher. (Seit Android 10 schränkt Scoped Storage den Zugriff weiter ein – im Quiz gilt das klassische Modell.)", H),
 Q("madx-q58", "mad-x-data", "What is the best place to store files such as images or videos?", ["In the SharedPreferences", "On internal or external storage", "In the app's build.gradle file", "In the source code of the app", "In a database (e.g. SQLite with Room)"], 1, "Große Binärdaten als Dateien; die DB speichert höchstens Pfad/URI.", B),
 Q("madx-q59", "mad-x-data", "Which of the following DAO functions tries to find and return a <b>single Student</b> Entity by its id?", ["<code>@Query(\"SELECT * from pets where id = :id\") fun findById(id: Int): Student?</code>", "<code>@Insert(onConflict = OnConflictStrategy.REPLACE) fun insert(pet: Pet)</code>", "<code>@Query(\"SELECT * from pets where id = :id\") fun findById(id: Int): Pet?</code>", "<code>@Query(\"SELECT * from students where id = :id\") fun findById(id: Int): Student?</code>", "<code>@Query(\"SELECT * from pets\") fun find(): List&lt;Pet&gt;</code>"], 3, "Tabelle students, Parameter :id, Rückgabe Student? (null, wenn nicht gefunden). Option a fragt die falsche Tabelle ab.", B),
 MS("madx-q60", "mad-x-data", "Which statements about the <b>second</b> line of the code are correct?<br><code>val sharedPreferences = getSharedPreferences(packageName, Context.MODE_PRIVATE)</code><br><code>val darkMode = sharedPreferences.getBoolean(\"DARK_MODE\", false)</code>", [["It retrieves a <b>Boolean</b> with the Key <b>DARK_MODE</b> from the sharedPreferences", true], ["If no value can be found for the specified key, <b>false</b> is returned.", true], ["It retrieves a <b>Boolean</b> with the Key <b>USERNAME</b> from the sharedPreferences", false], ["It retrieves a <b>String</b> with the Key <b>DARK_MODE</b> from the sharedPreferences", false], ["It retrieves an <b>Int</b> with the Key <b>DARK_MODE</b> from the sharedPreferences", false]], ["a", "abd", "b", "abe"], "getBoolean(key, defValue): der zweite Parameter ist der Default.", B),
 Q("madx-q61", "mad-x-data", "Welche Annotation/Klasse stellt in Room die Verbindung zur SQLite-Datenbank her?", ["@Entity", "@Dao", "Eine abstrakte Klasse mit @Database, die von RoomDatabase erbt", "@Query"], 2, "Die Database-Klasse wird mit Room.databaseBuilder(context, AppDatabase::class.java, \"app.db\").build() erzeugt und liefert die DAOs.", X),
 Q("madx-q62", "mad-x-data", "Wo speicherst du am sinnvollsten die Einstellung „Dark Mode an/aus“?", ["Room-Datenbank mit eigener Tabelle", "SharedPreferences bzw. DataStore", "Externer Speicher als Datei", "In der build.gradle"], 1, "Kleine Key-Value-Einstellungen → SharedPreferences/DataStore.", X),

 /* ===== Threads ===== */
 MS("madx-q63", "mad-x-async", "Which statements about <b>Threads</b> in Android are correct?", [["UI can only be updated from the UI Thread.", true], ["Long-Running tasks <b>should</b> be done on the UI Thread.", false], ["UI can be updated from any Thread.", false], ["Long-Running tasks <b>should not</b> be done on the UI Thread.", true]], ["ab", "cd", "d", "abd"], "Sonst CalledFromWrongThreadException bzw. eingefrorene UI/ANR.", W),
 MS("madx-q64", "mad-x-async", "Which statements about AsyncTask's <b>doInBackground</b> method are correct?", [["Called after background work is done.", false], ["Cannot be used to update the UI.", true], ["Used for progress-updates during background processing.", false], ["Runs on a background Thread.", true], ["This is where long-running / slow tasks are run without blocking the UI Threads.", true]], ["de", "bcde", "abd", "bd"], "Danach → onPostExecute; Fortschritt → onProgressUpdate (UI-Thread). AsyncTask ist deprecated, Ersatz: Coroutines.", W),
 Q("madx-q65", "mad-x-async", "Was passiert, wenn du auf dem Main-Thread mehrere Sekunden lang auf eine Netzwerkantwort wartest?", ["Nichts, Android parallelisiert automatisch", "Die UI friert ein, nach ca. 5 s erscheint ein ANR-Dialog (Netzwerk auf dem Main-Thread wirft sogar NetworkOnMainThreadException)", "Die App wird schneller", "Die Antwort wird im Hintergrund zwischengespeichert"], 1, "Lösung: Coroutine mit withContext(Dispatchers.IO) bzw. suspend-Funktionen von Retrofit/Room.", X),

 /* ===== Software Engineering ===== */
 Q("madx-q66", "mad-x-se", "Was beschreibt Software Configuration Management (SCM) im Unterschied zum Versionsmanagement?", ["Beides ist dasselbe", "SCM ist, wie man die Evolution eines Softwaresystems kontrolliert; Versionsmanagement ist der technische Teil davon", "SCM ist nur das Einrichten von Git", "Versionsmanagement ist der organisatorische, SCM der technische Teil"], 1, "Laut Mitschrift: „SCM is how you control the evolution – Version Mgmt is technical“; und neue Versionen/Upgrades können neue Probleme bringen (→ ja).", H),
 Q("madx-q67", "mad-x-se", "Wie heißt das Meeting am Ende eines Sprints mit dem Kunden?", ["Daily Scrum", "Sprint Review", "Sprint Retrospective", "Backlog Refinement"], 1, "Im Sprint Review wird das Inkrement mit Stakeholdern/Kunde begutachtet; die Retrospektive ist teamintern.", H),
 MS("madx-q68", "mad-x-se", "Which statements about debugging are <b>not correct</b>?", [["It is always done manually", false], ["It can be automated", true], ["It is used to find out <b>why</b> an app does not work as intended", false], ["It is used to find out <b>if</b> an app works as intended", true], ["Is usually done by a Manager", true]], ["ade", "de", "bcd", "abe"], "Gesucht sind die falschen Aussagen: b (automatisieren kann man das Testen, nicht das Debuggen), d (OB es funktioniert = Testen) und e. Achtung: In der Word-Sammlung steht „a, e, d“ – das widerspricht der handschriftlichen Lösung (dort „can be automated“, „manager“, „if“ angekreuzt) und der Vorlesungslogik Testen = automatisierbar / Debuggen = manuell.", B),
 Q("madx-q69", "mad-x-se", "What does the <b>WHEN</b> part of a test describe?", ["Whether the behaviour leads to the expected outcome", "The Feature to test", "The state of the world before you begin", "The specified behaviour to test", "The Use Case to test"], 3, "Given = Ausgangszustand, When = getestetes Verhalten, Then = erwartetes Ergebnis.", B),
 MS("madx-q70", "mad-x-se", "End-to-End Tests …", [["should account for about 10% of tests", true], ["should test a full use case", true], ["should account for about 70% of tests", false], ["should test a single Unit (Class, Function) of an App", false]], ["bc", "b", "abd", "ac"], "Spitze der Testpyramide: wenige, langsame, aber realistische Tests.", B),
 MS("madx-q71", "mad-x-se", "Unit Tests …", [["should test the UI", false], ["should test a single Unit (Class, Function) of an App", true], ["should account for about 70% of tests", true], ["should account for about 10% of tests", false]], ["ab", "bd", "c", "abc"], "Basis der Testpyramide: viele schnelle Tests ohne UI.", B),
 MS("madx-q72", "mad-x-se", "When should we do <b>refactoring</b> of our code?", [["Continuously", true], ["Whenever code looks too complex", true], ["Every 10th commit", false], ["Only on Sundays", false]], ["a", "abc", "b", "bd"], "Refactoring ist ein ständiger Begleiter der Entwicklung, abgesichert durch Tests.", B),
 Q("madx-q73", "mad-x-se", "Wo liegen in einem Android-Projekt Instrumented Tests (z. B. UI-Tests mit Compose)?", ["src/main", "src/test (laufen auf der JVM)", "src/androidTest (laufen auf Gerät/Emulator)", "res/raw"], 2, "Unit Tests in src/test laufen lokal auf der JVM; Instrumented Tests brauchen ein Gerät oder einen Emulator.", X),
 Q("madx-q74", "mad-x-se", "Was ist Refactoring?", ["Neue Features hinzufügen", "Die interne Struktur verbessern, ohne das beobachtbare Verhalten zu ändern", "Bugs mit dem Debugger suchen", "Den Code in eine andere Sprache übersetzen"], 1, "Deshalb braucht Refactoring gute Tests: Sie zeigen, dass sich das Verhalten nicht verändert hat.", X)
);

/* ---------- offene Fragen / Karteikarten ---------- */
c.flashcards.push(
 { id: "madxf1", cat: "MAPPDEV", topic: "mad-class", front: "Wie nennt man das Erzeugen eines neuen Objekts aus einer Klasse? Wie sieht es in Kotlin aus?", back: "<b>Instanziierung</b> (instantiation) – das Objekt ist eine Instanz der Klasse. Kotlin: Konstruktoraufruf ohne <code>new</code>: <code>val s = Student(\"Kevin\")</code>.", alt: true },
 { id: "madxf2", cat: "MAPPDEV", topic: "mad-x-android", front: "Nenne die Activity-Lifecycle-Callbacks in Reihenfolge und ihre Bedeutung.", back: "<ul><li><b>onCreate</b> – erzeugt, UI aufbauen</li><li><b>onStart</b> – sichtbar</li><li><b>onResume</b> – im Vordergrund, running, User interagiert</li><li><b>onPause</b> – Fokus verloren</li><li><b>onStop</b> – nicht mehr sichtbar</li><li><b>onDestroy</b> – zerstört (finish/Rotation)</li><li><b>onRestart</b> – vor erneutem onStart</li></ul>", alt: true },
 { id: "madxf3", cat: "MAPPDEV", topic: "mad-x-android", front: "Expliziter vs. impliziter Intent – Unterschied und Beispiel?", back: "<b>Explizit</b>: exakte Komponente, z. B. <code>Intent(this, DetailActivity::class.java)</code>.<br><b>Implizit</b>: nur Action + Daten, z. B. <code>Intent(Intent.ACTION_VIEW, Uri.parse(url))</code> – das System wählt eine passende App über Intent-Filter.", alt: true },
 { id: "madxf4", cat: "MAPPDEV", topic: "mad-x-android", front: "versionCode vs. versionName vs. minSdk", back: "<b>versionCode</b>: interne Ganzzahl, muss bei jedem Release steigen · <b>versionName</b>: benutzerfreundlicher Name (\"1.2.0\") · <b>minSdk</b>: minimales API-Level zum Ausführen.", alt: true },
 { id: "madxf5", cat: "MAPPDEV", topic: "mad-x-views", front: "Welche drei Methoden überschreibt ein RecyclerView-Adapter – und was macht jede?", back: "<b>onCreateViewHolder</b>: Item-Layout inflaten, ViewHolder erzeugen · <b>onBindViewHolder</b>: Daten an Position X in den ViewHolder schreiben · <b>getItemCount</b>: Anzahl der Items. Der Adapter verbindet Daten mit Item-Views; ein Item = ViewHolder.", alt: true },
 { id: "madxf6", cat: "MAPPDEV", topic: "mad-x-views", front: "Regeln für Views im ConstraintLayout (Constraints, Größen, Guidelines)?", back: "Mind. <b>1 horizontaler + 1 vertikaler</b> Constraint (sonst zur Laufzeit bei 0,0) · Handle: 1 ausgehender, viele eingehende Constraints · Größen: fixed (100dp), wrap_content, match_constraint (0dp) · Guidelines: vertikal/horizontal, in dp (begin/end) oder Prozent · Vorteil: flache Hierarchie = Performance, Drag&amp;Drop-Editor.", alt: true },
 { id: "madxf7", cat: "MAPPDEV", topic: "mad-x-state", front: "remember vs. rememberSaveable vs. ViewModel vs. Persistenz – was überlebt was?", back: "<table class=\"dt\"><tr><th></th><th>Recomposition</th><th>Rotation</th><th>App-/Geräte-Neustart</th></tr><tr><td>remember</td><td>✓</td><td>✗</td><td>✗</td></tr><tr><td>rememberSaveable</td><td>✓</td><td>✓</td><td>✗</td></tr><tr><td>ViewModel</td><td>✓</td><td>✓</td><td>✗</td></tr><tr><td>DataStore/Room</td><td>✓</td><td>✓</td><td>✓</td></tr></table>", alt: true },
 { id: "madxf8", cat: "MAPPDEV", topic: "mad-x-state", front: "Wann verwendet man derivedStateOf?", back: "Wenn sich Eingabe-State <b>öfter ändert, als die UI aktualisiert werden muss</b> (z. B. <code>listState.firstVisibleItemIndex &gt; 0</code> → Button zeigen). Recomposition nur bei Änderung des <b>Ergebnisses</b>; meist als <code>remember { derivedStateOf { … } }</code>. Ändert sich das Ergebnis so oft wie die Eingabe → <code>remember(key) { … }</code> reicht.", alt: true },
 { id: "madxf9", cat: "MAPPDEV", topic: "mad-x-arch", front: "Was darf ein ViewModel nie tun – und warum?", back: "Eine <b>View, einen Lifecycle oder eine Klasse mit Referenz auf den Activity-Context</b> halten. Das ViewModel überlebt die Activity (z. B. Rotation) → die alte Activity könnte nicht freigegeben werden → <b>Memory Leak</b>. Erlaubt: LiveData/StateFlow halten, Repository aufrufen, Berechnungen.", alt: true },
 { id: "madxf10", cat: "MAPPDEV", topic: "mad-x-arch", front: "Vorteile von LiveData (und welches Pattern)?", back: "<b>Observer Pattern</b>, lifecycle-aware: benachrichtigt nur aktive Beobachter, entfernt sie bei DESTROYED → <b>keine Memory Leaks</b>, <b>keine Crashes durch gestoppte Activities</b>, UI immer aktuell, übersteht Konfigurationsänderungen. setValue (Main) / postValue (Hintergrund).", alt: true },
 { id: "madxf11", cat: "MAPPDEV", topic: "mad-x-data", front: "Die drei Bausteine von Room und ihre Aufgaben?", back: "<b>Entity</b> (@Entity): Tabellenschema, Instanz = Zeile · <b>DAO</b> (@Dao): Abfragefunktionen (@Query, @Insert, @Update, @Delete) · <b>Database</b> (@Database, abstract, erbt RoomDatabase): Verbindung zur SQLite-DB, liefert DAOs.", alt: true },
 { id: "madxf12", cat: "MAPPDEV", topic: "mad-x-data", front: "Welche Daten speichert man wo? (Einstellungen, strukturierte Daten, Bilder/Videos) – und Internal vs. External Storage?", back: "Einstellungen → SharedPreferences/DataStore · strukturierte Daten → Room · Bilder/Videos → Dateien (intern/extern).<br><b>Internal</b>: immer verfügbar, privat, bei Deinstallation gelöscht · <b>External</b>: nicht immer verfügbar (SD-Karte), world-readable.", alt: true },
 { id: "madxf13", cat: "MAPPDEV", topic: "mad-x-async", front: "Die zwei Thread-Regeln in Android + moderne Lösung?", back: "1. UI <b>nur vom Main/UI-Thread</b> ändern. 2. <b>Keine lang laufenden Aufgaben</b> auf dem Main-Thread (sonst ANR). Lösung: Coroutines – <code>viewModelScope.launch { withContext(Dispatchers.IO) { … } }</code>; früher AsyncTask (doInBackground im Hintergrund, onPostExecute auf dem UI-Thread).", alt: true },
 { id: "madxf14", cat: "MAPPDEV", topic: "mad-x-se", front: "Testpyramide: Anteile und Inhalte?", back: "<b>Unit</b> ~70 % – eine Klasse/Funktion, schnell (src/test) · <b>Integration</b> ~20 % – Zusammenspiel · <b>End-to-End/UI</b> ~10 % – ganzer Use Case, langsam (src/androidTest, Instrumented).", alt: true },
 { id: "madxf15", cat: "MAPPDEV", topic: "mad-x-se", front: "Given – When – Then erklären", back: "<b>Given</b>: Zustand der Welt vor dem Test · <b>When</b>: das spezifizierte Verhalten (Aktion), das getestet wird · <b>Then</b>: prüfen, ob das Verhalten zum erwarteten Ergebnis führt.", alt: true },
 { id: "madxf16", cat: "MAPPDEV", topic: "mad-x-se", front: "Testen vs. Debuggen", back: "<b>Testen</b>: findet heraus, <b>ob</b> die App wie vorgesehen funktioniert – automatisierbar. <b>Debuggen</b>: findet heraus, <b>warum</b> nicht – manuell, durch Entwickler:innen (Breakpoints, Step into F7 / over F8).", alt: true },
 { id: "madxf17", cat: "MAPPDEV", topic: "mad-x-se", front: "SCM vs. Versionsmanagement; Scrum-Events", back: "<b>SCM</b> = wie man die Evolution der Software kontrolliert (Konfigurationen, Änderungen, Status, Audits); <b>Versionsmanagement</b> (Git) = technischer Teil. Neue Versionen/Upgrades können neue Probleme bringen.<br>Scrum: Sprint Planning · Daily Scrum · <b>Sprint Review</b> (Sprint-Ende, mit Kunde) · Retrospective (Team, Prozess).", alt: true },
 { id: "madxf18", cat: "MAPPDEV", topic: "mad-x-compose", front: "Regeln für wiederverwendbare Composables?", back: "Klein halten · Pflichtparameter zuerst · <code>modifier: Modifier = Modifier</code> als <b>erster optionaler</b> Parameter, an das äußerste Element weitergeben · danach optionale Parameter · Content-/Event-Lambdas am Ende · State hoisten (value + onValueChange).", alt: true },
 { id: "madxf19", cat: "MAPPDEV", topic: "mad-x-material", front: "Scaffold-Slots und TopAppBar-Parameter?", back: "<b>Scaffold</b>: topBar, bottomBar, floatingActionButton, snackbarHost, content(innerPadding).<br><b>TopAppBar</b>: title, navigationIcon, actions, colors, scrollBehavior. MaterialTheme = Composable-Funktion (colorScheme, typography, shapes); Dynamic Color aus dem Wallpaper.", alt: true }
);

/* ---------- Prüfungsfokus ---------- */
c.examPrep = {
  format: "Laut den Quiz-Sammlungen: Zu Beginn jeder Übung (UE1, UE2, …) gibt es ein kurzes Moodle-Quiz („QA“, 11 × 5 P.) mit wenigen Fragen der Typen <b>Select one</b>, <b>Select one or more</b> (Mehrfachauswahl, alle richtigen ankreuzen), True/False, Dropdown-Zuordnung (z. B. Go-Typ → Kotlin-Typ) und Drag&amp;Drop-Lückentext. Fragen sind auf Englisch, oft mit kurzen Code-Snippets („What will be printed?“, „none of the other options“). Inhalt: zuerst Kotlin (UE1/UE2), dann Android (Activity, Intents, Layouts, Compose, State, Architektur, Room, Threads) und Software Engineering (Testing, Debugging, Refactoring, SCM, Scrum). Ältere Jahrgänge (2021) fragen XML-Views/ConstraintLayout/RecyclerView, neuere Jetpack Compose. Format und Fragenmix des Knowledge Assessments (100 P.) sind aus den Quellen nicht ersichtlich – vermutlich ähnliche Moodle-Fragen über den gesamten Stoff.",
  sources: ["Handschriftliche QA-Mitschrift „Fragen“ (12 Seiten, UE1 15.10.21, UE2 + Moodle-Screenshots)", "Word-Dokument „QA“ (38 Moodle-Screenshots mit notierten Antworten)"],
  strategy: [
    "Mehrfachauswahl: jede Aussage einzeln als richtig/falsch prüfen – die Quizzes mischen 2–3 richtige Aussagen mit offensichtlichen Scherz-Distraktoren („Only on Sundays“, „Bitcoin“), aber auch feinen Fallen (onStop vs. onResume, NavController vs. NavHost).",
    "Code-Snippets im Kopf ausführen und auf Compilerfehler achten: falsche Konstruktor-Argumente, Zugriff auf Subklassen-Property über Oberklassen-Typ, == bei Klassen ohne data/equals → false.",
    "„None of the other options“ ernst nehmen: z. B. liefert filter { it.length &lt; 4 } eine leere Liste, die nicht angeboten wird.",
    "Paare auswendig: onResume/onStop, explizit (Komponente)/implizit (Action), remember/rememberSaveable, Entity/DAO/Database, Unit 70 %/E2E 10 %, Given/When/Then, Testen (ob)/Debuggen (warum).",
    "Die Mitschrift-Antworten sind nicht immer richtig (z. B. Guideline-Attribut, Debugging-Frage in der Word-Sammlung) – im Zweifel die hier erklärte Lösung lernen.",
    "Vor jeder Übung das zugehörige Kapitel hier durchklicken: das Quiz prüft genau den Stoff der vorigen Einheit."
  ],
  focus: [
    { topic: "mad-x-android", weight: 3, note: "Activity, onResume, explizite/implizite Intents, Gradle, Annotations – in beiden Sammlungen, ~11 Fragen" },
    { topic: "mad-x-se", weight: 3, note: "Testpyramide, Given-When-Then, Debugging, Refactoring – in beiden Sammlungen wiederholt; SCM/Scrum in der Mitschrift" },
    { topic: "mad-x-arch", weight: 3, note: "ViewModel-Regel, LiveData (Observer), Separation of Concerns, NavController – in beiden Sammlungen" },
    { topic: "mad-x-data", weight: 3, note: "Room-Entities, DAO-Query, SharedPreferences, Speicherorte – in beiden Sammlungen" },
    { topic: "mad-x-compose", weight: 3, note: "Modifier, LazyColumn, Standard-Layouts, wiederverwendbare Komponenten – aktueller Compose-Stoff (Word-Sammlung)" },
    { topic: "mad-x-state", weight: 3, note: "remember, derivedStateOf, späte State-Reads – aktueller Compose-Stoff" },
    { topic: "mad-x-material", weight: 2, note: "Dynamic Color, TopAppBar, Typography, Scaffold, MaterialTheme – 5 Fragen in der Word-Sammlung" },
    { topic: "mad-x-views", weight: 2, note: "ConstraintLayout, ScrollView, RecyclerView, Fragments, dp/sp – viele Fragen im Jahrgang 2021; aktuell wird mit Compose gearbeitet" },
    { topic: "mad-x-async", weight: 2, note: "UI-Thread-Regeln, AsyncTask.doInBackground – Word-Sammlung" },
    { topic: "mad-fop", weight: 2, note: "UE1: forEach/map, filter-Ergebnis vorhersagen" },
    { topic: "mad-class", weight: 2, note: "UE2: Gleichheit ohne data class, Instanziierung" },
    { topic: "mad-inh", weight: 2, note: "UE2: Konstruktor der Oberklasse, Compilerfehler erkennen" },
    { topic: "mad-types", weight: 1, note: "UE1: Go → Kotlin (float32 → Float, float64 → Double, &lt;&lt; → shl)" },
    { topic: "mad-data", weight: 1, note: "data class: equals/== vs. ===" },
    { topic: "mad-null", weight: 1, note: "nicht direkt in den Sammlungen, aber Kern-Kotlin (?. ?: !!)" },
    { topic: "mad-coll", weight: 1, note: "Grundlage für Code-Snippet-Fragen" },
    { topic: "mad-lambda", weight: 1, note: "Grundlage für filter/map-Snippets" }
  ],
  checklist: [
    { id: "madxc1", topic: "mad-types", text: "Go-Typen und -Operatoren nach Kotlin übersetzen (float32/64, int64, &lt;&lt;, &amp;, |)." },
    { id: "madxc2", topic: "mad-fop", text: "Ergebnis von filter/map/fold-Ketten im Kopf berechnen – inkl. leerer Liste." },
    { id: "madxc3", topic: "mad-class", text: "Erklären, warum == bei einer normalen Klasse false liefert und bei einer data class true; === kennen." },
    { id: "madxc4", topic: "mad-inh", text: "Compilerfehler bei Konstruktoraufrufen und Subklassen-Properties über Oberklassen-Referenzen erkennen." },
    { id: "madxc5", topic: "mad-x-android", text: "Activity-Eigenschaften und alle Lifecycle-Callbacks inkl. Reihenfolge bei Start, Home-Button und Rotation aufzählen." },
    { id: "madxc6", topic: "mad-x-android", text: "Expliziten und impliziten Intent schreiben, Extra übergeben und mit getIntExtra(key, default) lesen." },
    { id: "madxc7", topic: "mad-x-android", text: "Aufgaben von Gradle, versionName/versionCode/minSdk und Annotations erklären." },
    { id: "madxc8", topic: "mad-x-views", text: "ConstraintLayout-Regeln (Constraints, Größen, Guidelines, Vorteile) und Einheiten dp/sp sicher beantworten." },
    { id: "madxc9", topic: "mad-x-views", text: "RecyclerView-Adapter (onCreateViewHolder, onBindViewHolder, getItemCount), ScrollView- und Fragment-Regeln erklären." },
    { id: "madxc10", topic: "mad-x-compose", text: "Ein wiederverwendbares Composable mit korrekter Parameter-Reihenfolge, Modifier und LazyColumn schreiben." },
    { id: "madxc11", topic: "mad-x-material", text: "Scaffold-Slots, TopAppBar-Parameter, TextStyle-Optionen, MaterialTheme und Dynamic Color benennen." },
    { id: "madxc12", topic: "mad-x-state", text: "remember vs. rememberSaveable vs. ViewModel unterscheiden; State Hoisting und derivedStateOf mit Beispiel erklären." },
    { id: "madxc13", topic: "mad-x-arch", text: "Schichten UI → ViewModel → Repository → Datenquelle skizzieren; die ViewModel-Verbotsregel und LiveData-Vorteile nennen." },
    { id: "madxc14", topic: "mad-x-arch", text: "NavController (Back Stack, rememberNavController) und NavHost (Routen ↔ Destinations) abgrenzen." },
    { id: "madxc15", topic: "mad-x-data", text: "Room-Entity, DAO (findById, getAll, insert) und Database-Klasse aus dem Kopf schreiben." },
    { id: "madxc16", topic: "mad-x-data", text: "SharedPreferences lesen/schreiben und für Daten den richtigen Speicherort wählen (intern/extern/DB/Prefs)." },
    { id: "madxc17", topic: "mad-x-async", text: "Main-Thread-Regeln, AsyncTask-Methoden und die Coroutine-Alternative erklären." },
    { id: "madxc18", topic: "mad-x-se", text: "Testpyramide (70/20/10), Given-When-Then und den Unterschied Testen/Debuggen wiedergeben." },
    { id: "madxc19", topic: "mad-x-se", text: "Refactoring, SCM vs. Versionsmanagement und die Scrum-Events (v. a. Sprint Review) definieren." }
  ],
  tasks: [
    { id: "madxr1", topic: "mad-fop", title: "Was gibt dieser Code aus? (Collections)", html: "Gib die Ausgabe jeder Zeile an:" + C([
      "val words = listOf(\"Kotlin\", \"is\", \"fun\", \"Go\", \"Android\")",
      "println(words.filter { it.length < 4 })                 // (1)",
      "println(words.filter { it.length > 2 }.map { it.uppercase() })  // (2)",
      "println(words.map { it.length }.fold(0) { acc, n -> acc + n })  // (3)",
      "println(words.find { it.startsWith(\"X\") } ?: \"none\")      // (4)",
      "println(words.count { it.length >= 3 })                 // (5)"]),
      solution: "<ol><li><code>[is, fun, Go]</code> – Längen 2, 3, 2 sind &lt; 4.</li><li><code>[KOTLIN, FUN, ANDROID]</code></li><li><code>20</code> – 6 + 2 + 3 + 2 + 7.</li><li><code>none</code> – find liefert null, Elvis ersetzt es.</li><li><code>3</code> – Kotlin, fun, Android.</li></ol>" },
    { id: "madxr2", topic: "mad-class", title: "Was gibt dieser Code aus? (Gleichheit & Vererbung)", html: "Welche Ausgaben erzeugen die Zeilen (1)–(4)? Welche Zeile (5) würde nicht kompilieren und warum?" + C([
      "class Product(val name: String)",
      "data class DProduct(val name: String)",
      "open class Person(val name: String)",
      "class Student(name: String, val year: Int) : Person(name)",
      "",
      "println(Product(\"xy\") == Product(\"xy\"))      // (1)",
      "println(DProduct(\"xy\") == DProduct(\"xy\"))    // (2)",
      "println(DProduct(\"xy\") === DProduct(\"xy\"))   // (3)",
      "val s: Person = Student(\"Max\", 3)",
      "println(s.name)                               // (4)",
      "println(s.year)                               // (5)"]),
      solution: "<ol><li><code>false</code> – keine data class, kein equals-Override → Referenzvergleich.</li><li><code>true</code> – data class vergleicht Inhalte.</li><li><code>false</code> – === prüft Identität, es sind zwei Objekte.</li><li><code>Max</code></li><li>Kompiliert nicht: statischer Typ ist Person, die kein <code>year</code> hat (Unresolved reference). Lösung: <code>(s as Student).year</code> oder <code>if (s is Student) println(s.year)</code> (Smart Cast).</li></ol>" },
    { id: "madxr3", topic: "mad-inh", title: "Fehler finden und beheben", html: "Der Code aus dem UE2-Quiz kompiliert nicht bzw. liefert nicht das gewünschte Ergebnis. Korrigiere ihn so, dass <code>Student(\"Max\", 3)</code> ausgegeben wird als <code>Student(name=Max, year=3)</code> und zwei Produkte mit gleichem Namen als gleich gelten." + C([
      "open class Person(val name:String) {}",
      "class Student(name:String, val year: Int): Person(name) {}",
      "var person = Person(\"Max\", 3)",
      "println(person)",
      "",
      "class Product(val name:String)",
      "println(Product(\"xy\") == Product(\"xy\"))   // soll true sein"]),
      solution: "Fehler 1: <code>Person</code> hat nur einen Parameter → <code>Student(\"Max\", 3)</code> instanziieren. Fehler 2: Für die lesbare Ausgabe in <code>Student</code> <code>toString()</code> überschreiben (sonst erscheint z. B. <code>Student@1b6d3586</code>). Fehler 3: <code>Product</code> als <code>data class</code> (oder equals/hashCode überschreiben)." + C([
      "open class Person(val name: String)",
      "class Student(name: String, val year: Int) : Person(name) {",
      "    override fun toString() = \"Student(name=$name, year=$year)\"",
      "}",
      "val person: Person = Student(\"Max\", 3)",
      "println(person)                     // Student(name=Max, year=3)",
      "",
      "data class Product(val name: String)",
      "println(Product(\"xy\") == Product(\"xy\"))   // true"]) },
    { id: "madxr4", topic: "mad-fop", title: "Funktion schreiben: Initialen", html: "Schreibe eine Funktion <code>initials(names: List&lt;String&gt;): String</code>, die leere/blanke Namen ignoriert und die großgeschriebenen Anfangsbuchstaben aneinanderhängt. Beispiel: <code>initials(listOf(\"john\", \"\", \"sandra\", \"marcus\"))</code> → <code>\"JSM\"</code>. Verwende filter und map (keine Schleife).",
      solution: C([
      "fun initials(names: List<String>): String =",
      "    names.filter { it.isNotBlank() }",
      "         .map { it.first().uppercaseChar() }",
      "         .joinToString(\"\")"]) + "Alternativ mit fold: <code>names.filter { it.isNotBlank() }.fold(\"\") { acc, n -&gt; acc + n.first().uppercaseChar() }</code>." },
    { id: "madxr5", topic: "mad-x-android", title: "Lifecycle-Szenario", html: "Gib die Folge der Lifecycle-Callbacks an:<ol><li>App wird gestartet (MainActivity).</li><li>User dreht das Gerät.</li><li>User drückt den Home-Button.</li><li>User öffnet die App wieder aus den Recents.</li></ol>Welcher State geht bei 2. verloren, und wie verhinderst du das?",
      solution: "<ol><li>onCreate → onStart → onResume</li><li>onPause → onStop → onDestroy → onCreate → onStart → onResume (Activity wird neu erzeugt)</li><li>onPause → onStop</li><li>onRestart → onStart → onResume</li></ol>Bei der Rotation geht State verloren, der nur in der Activity oder mit <code>remember</code> gehalten wird. Abhilfe: <code>rememberSaveable</code> (kleiner UI-State) oder ein <b>ViewModel</b> (Screen-State); dauerhaft mit DataStore/Room." },
    { id: "madxr6", topic: "mad-x-android", title: "Intents schreiben", html: "a) Starte aus der <code>MainActivity</code> die <code>DetailActivity</code> und übergib die Student-ID 42 unter dem Key <code>\"EXTRA_ID\"</code>.<br>b) Lies die ID in der DetailActivity (Default 0).<br>c) Öffne die FH-Website im Browser. Welche Intent-Art verwendest du jeweils?",
      solution: C([
      "// a) expliziter Intent",
      "val i = Intent(this, DetailActivity::class.java)",
      "i.putExtra(\"EXTRA_ID\", 42)",
      "startActivity(i)",
      "",
      "// b)",
      "val id = intent.getIntExtra(\"EXTRA_ID\", 0)",
      "",
      "// c) impliziter Intent: nur Action + Daten",
      "startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(\"https://www.fh-joanneum.at\")))"]) + "a) explizit (exakte Komponente), c) implizit (Action VIEW, das System wählt den Browser)." },
    { id: "madxr7", topic: "mad-x-data", title: "Room: Entity, DAO und Database schreiben", html: "Schreibe für eine Tabelle <code>students</code> (id, name, semester) eine Room-Entity, ein DAO mit <code>findById</code> (einzelner Student oder null), <code>getAll</code> (als Flow) und <code>insert</code> (bei Konflikt ersetzen) sowie die Database-Klasse.",
      solution: C([
      "@Entity(tableName = \"students\")",
      "data class Student(",
      "    @PrimaryKey(autoGenerate = true) val id: Int = 0,",
      "    val name: String,",
      "    val semester: Int",
      ")",
      "",
      "@Dao",
      "interface StudentDao {",
      "    @Query(\"SELECT * FROM students WHERE id = :id\")",
      "    suspend fun findById(id: Int): Student?",
      "",
      "    @Query(\"SELECT * FROM students\")",
      "    fun getAll(): Flow<List<Student>>",
      "",
      "    @Insert(onConflict = OnConflictStrategy.REPLACE)",
      "    suspend fun insert(student: Student)",
      "}",
      "",
      "@Database(entities = [Student::class], version = 1)",
      "abstract class AppDatabase : RoomDatabase() {",
      "    abstract fun studentDao(): StudentDao",
      "}",
      "",
      "val db = Room.databaseBuilder(context, AppDatabase::class.java, \"app.db\").build()"]) + "Entity = Schema (Instanz = Zeile), DAO = Abfragen, Database = Verbindung. suspend/Flow, weil Room keine Main-Thread-Abfragen erlaubt." },
    { id: "madxr8", topic: "mad-x-state", title: "Compose: Zähler mit State Hoisting", html: "Schreibe ein <b>stateless</b> Composable <code>Counter</code>, das die Anzahl anzeigt und per Button erhöht, sowie ein <code>CounterScreen</code>, das den State hält. Der Zähler soll eine Bildschirmrotation überleben. Beachte die Parameter-Reihenfolge für wiederverwendbare Komponenten.",
      solution: C([
      "@Composable",
      "fun Counter(",
      "    count: Int,                       // Pflichtparameter",
      "    onIncrement: () -> Unit,",
      "    modifier: Modifier = Modifier     // erster optionaler Parameter",
      ") {",
      "    Row(modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {",
      "        Text(\"Klicks: $count\")",
      "        Spacer(Modifier.width(8.dp))",
      "        Button(onClick = onIncrement) { Text(\"+1\") }",
      "    }",
      "}",
      "",
      "@Composable",
      "fun CounterScreen() {",
      "    var count by rememberSaveable { mutableIntStateOf(0) }",
      "    Counter(count = count, onIncrement = { count++ })",
      "}"]) + "<code>rememberSaveable</code> statt <code>remember</code>, damit der Wert die Rotation überlebt. Counter ist stateless (State Hoisting: value + Event-Lambda) und dadurch wiederverwendbar und testbar." },
    { id: "madxr9", topic: "mad-x-arch", title: "ViewModel mit StateFlow und Coroutine", html: "Ein Screen lädt eine Studentenliste aus einem Repository (<code>suspend fun getAll(): List&lt;Student&gt;</code>). Schreibe das ViewModel und zeige, wie das Composable die Liste beobachtet. Erkläre, warum das ViewModel keine Referenz auf die Activity halten darf.",
      solution: C([
      "class StudentViewModel(private val repo: StudentRepository) : ViewModel() {",
      "    private val _students = MutableStateFlow<List<Student>>(emptyList())",
      "    val students: StateFlow<List<Student>> = _students.asStateFlow()",
      "",
      "    init {",
      "        viewModelScope.launch {",
      "            _students.value = repo.getAll()      // läuft nicht blockierend",
      "        }",
      "    }",
      "}",
      "",
      "@Composable",
      "fun StudentScreen(vm: StudentViewModel = viewModel()) {",
      "    val students by vm.students.collectAsStateWithLifecycle()",
      "    LazyColumn { items(students) { Text(it.name) } }",
      "}"]) + "Das ViewModel überlebt die Activity (Rotation). Hält es eine Referenz auf View/Activity-Context, kann die alte Activity nicht vom Garbage Collector freigegeben werden → Memory Leak. Die UI beobachtet den State (Observer-Prinzip wie bei LiveData), viewModelScope bricht Coroutines bei onCleared() ab." },
    { id: "madxr10", topic: "mad-x-se", title: "Unit Test nach Given-When-Then", html: "Schreibe einen JUnit-Test für <code>fun average(grades: List&lt;Int&gt;): Double</code> einer Klasse <code>GradeCalculator</code>, der prüft, dass der Durchschnitt von 1 und 3 genau 2.0 ist. Markiere Given, When, Then. In welchem Ordner liegt der Test und welchen Anteil der Tests sollten solche Tests ausmachen?",
      solution: C([
      "class GradeCalculatorTest {",
      "    @Test",
      "    fun average_ofOneAndThree_isTwo() {",
      "        // Given – Zustand vor dem Test",
      "        val calc = GradeCalculator()",
      "        // When – das getestete Verhalten",
      "        val result = calc.average(listOf(1, 3))",
      "        // Then – erwartetes Ergebnis",
      "        assertEquals(2.0, result, 0.0001)",
      "    }",
      "}"]) + "Liegt in <code>src/test</code> (lokaler Unit Test auf der JVM). Unit Tests sollen ca. <b>70 %</b> aller Tests ausmachen (Integration ~20 %, End-to-End ~10 %)." }
  ]
};
})();
