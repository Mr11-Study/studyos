/* Multimediaprogrammierung und Visualisierung (MMPROV) — FH-Prof. DI Dr. Alexander K Nischelwitzer, WS 2026/27 */
(function () {
const TOPICS = {
  "mmp-editor":    { name: "Unity-Editor, Szene, GameObjects",     lesson: "mmp1-1" },
  "mmp-csharp":    { name: "C#-Skripte & MonoBehaviour-Lifecycle", lesson: "mmp1-2" },
  "mmp-code":      { name: "GameObjects per Code & Prefabs",       lesson: "mmp2-1" },
  "mmp-licht":     { name: "Licht & Material",                     lesson: "mmp2-2" },
  "mmp-anim":      { name: "Animationen (Editor & Code)",          lesson: "mmp2-3" },
  "mmp-input":     { name: "Interaktion: Maus, Touch, Tastatur",   lesson: "mmp3-1" },
  "mmp-media":     { name: "Audio & Video abspielen",              lesson: "mmp3-2" },
  "mmp-ui":        { name: "UI & Videoplayer-Interface",           lesson: "mmp3-3" },
  "mmp-physik":    { name: "Physik: Rigidbody, Collider, Trigger", lesson: "mmp4-1" },
  "mmp-rollaball": { name: "myRollABall, Build & Abgabe",          lesson: "mmp4-2" }
};

const code = s => "<pre><code>" + s + "</code></pre>";
const PREP = { t: "callout", html: "<b>Vorbereitung auf Basis des Syllabus – Unterlagen aus der LV ergänzen.</b> Zu MMPROV liegt bisher nur der Syllabus vor. Die Inhalte sind ein Unity/C#-Primer entlang der Syllabus-Themen; Versionen, Projektvorlagen und konkrete Aufgabenstellungen gelten so, wie sie in der LV/auf Moodle vorgegeben werden." };

const WORLDS = [
 { id: "mmpw1", n: 1, title: "Unity & C# Grundlagen", sub: "Editor, Szene, Skripte", boss: { id: "boss-mmpw1", title: "Kapiteltest: Unity & C# Grundlagen", topics: ["mmp-editor", "mmp-csharp"] }, lessons: [
  { id: "mmp1-1", title: "Unity-Editor, Szenen und GameObjects", topic: "mmp-editor", min: 14, xp: 0, blocks: [
    PREP,
    { t: "lead", html: "In Unity besteht alles aus <b>GameObjects</b>, die durch <b>Komponenten</b> Verhalten bekommen. Jede Szene ist eine Hierarchie solcher Objekte – das ist die Grundlage für „3D-Welten“ laut Syllabus." },
    { t: "text", h: "Die wichtigsten Fenster", levels: {
      simple: "Hierarchy = Liste der Objekte, Scene = Baustelle, Game = was der Spieler sieht, Inspector = Eigenschaften des gewählten Objekts, Project = deine Dateien.",
      normal: "<ul><li><b>Hierarchy</b>: alle GameObjects der aktuellen Szene, verschachtelt (Parent/Child).</li><li><b>Scene View</b>: 3D-Arbeitsbereich zum Platzieren (Tasten <code>W</code> Move, <code>E</code> Rotate, <code>R</code> Scale, <code>F</code> Fokus).</li><li><b>Game View</b>: Sicht durch die Kamera; Play-Modus mit ▶. <b>Achtung:</b> Änderungen im Play-Modus gehen beim Stoppen verloren.</li><li><b>Inspector</b>: Komponenten und Werte des ausgewählten Objekts.</li><li><b>Project</b>: Assets (Skripte, Materialien, Prefabs, Audio, Video, Modelle), Ordner <code>Assets/</code>.</li><li><b>Console</b>: Ausgaben von <code>Debug.Log</code>, Fehler und Warnungen.</li></ul>",
      technical: "Eine Szene ist eine <code>.unity</code>-Datei. Unity arbeitet mit einem <b>linkshändigen</b> Koordinatensystem, <b>Y zeigt nach oben</b>, Einheit 1 = 1 Meter. Für Builds müssen Szenen in <i>File → Build Profiles / Build Settings</i> eingetragen sein. Laut Syllabus erfolgt die Umsetzung in Unity unter <b>Windows</b> mit <b>C#</b>." } },
    { t: "text", h: "GameObject, Komponente, Transform", levels: {
      simple: "Ein GameObject ist ein leerer Behälter. Erst Komponenten machen daraus z. B. einen sichtbaren Würfel, ein Licht oder eine Kamera.",
      normal: "Jedes GameObject hat immer einen <b>Transform</b> (Position, Rotation, Scale). Weitere typische Komponenten: <b>MeshFilter</b> + <b>MeshRenderer</b> (Form und Darstellung), <b>Collider</b> (Kollisionsform), <b>Rigidbody</b> (Physik), <b>Light</b>, <b>Camera</b>, <b>AudioSource</b>, <b>VideoPlayer</b> und deine eigenen <b>Skripte</b> (MonoBehaviour).<br>Kinder übernehmen die Transformationen des Parents: Verschiebst du den Parent, bewegen sich alle Kinder mit (lokale vs. Welt-Koordinaten).",
      technical: "<code>transform.position</code> = Weltkoordinaten, <code>transform.localPosition</code> = relativ zum Parent. Rotationen werden intern als <b>Quaternion</b> gespeichert (<code>transform.rotation</code>), der Inspector zeigt Euler-Winkel (<code>transform.eulerAngles</code>). <b>Tags</b> und <b>Layers</b> dienen zum Identifizieren bzw. Filtern (z. B. Tag „PickUp“ im Roll-a-Ball)." } },
    { t: "widget", w: "pairs", topic: "mmp-editor", title: "Fenster & Komponenten", pairs: [["Hierarchy", "Liste aller GameObjects der Szene"], ["Inspector", "Komponenten und Werte des gewählten Objekts"], ["Transform", "Position, Rotation, Scale – hat jedes GameObject"], ["MeshRenderer", "macht ein Mesh sichtbar (mit Material)"], ["Collider", "Form für Kollisionen und Klicks"], ["Console", "Debug.Log-Ausgaben und Fehler"]] },
    { t: "warnbox", html: "Typischer Anfängerfehler: Im <b>Play-Modus</b> Werte einstellen und dann stoppen – alles ist weg. Tipp: <i>Preferences → Colors → Playmode tint</i> auf eine auffällige Farbe stellen." },
    { t: "check", q: "Welche Komponente besitzt jedes GameObject zwingend?", opts: ["Rigidbody", "MeshRenderer", "Transform", "Collider"], a: 2, why: "Transform ist immer vorhanden – auch bei einem leeren GameObject." },
    { t: "check", q: "In Unity zeigt standardmäßig welche Achse nach oben?", opts: ["X", "Y", "Z", "W"], a: 1, why: "Y ist oben, Z zeigt nach vorne, X nach rechts." }
  ]},
  { id: "mmp1-2", title: "C#-Skripte und der MonoBehaviour-Lifecycle", topic: "mmp-csharp", min: 16, xp: 0, blocks: [
    { t: "lead", html: "Ein Unity-Skript ist eine C#-Klasse, die von <code>MonoBehaviour</code> erbt und als Komponente an ein GameObject gehängt wird. Unity ruft bestimmte Methoden (Start, Update, …) automatisch auf." },
    { t: "html", html: code(`using UnityEngine;

public class Spinner : MonoBehaviour   // Klassenname = Dateiname Spinner.cs
{
    public float speed = 90f;          // im Inspector einstellbar
    [SerializeField] private Color startColor = Color.cyan;

    void Start()                       // einmal, vor dem ersten Frame
    {
        GetComponent&lt;Renderer&gt;().material.color = startColor;
        Debug.Log("Spinner gestartet auf " + gameObject.name);
    }

    void Update()                      // jeden Frame
    {
        transform.Rotate(0f, speed * Time.deltaTime, 0f);   // Grad pro Sekunde
    }
}`) },
    { t: "text", h: "Lifecycle und Time.deltaTime", levels: {
      simple: "Start läuft einmal am Anfang, Update in jedem Bild. Damit Bewegungen auf schnellen und langsamen PCs gleich schnell sind, multipliziert man mit Time.deltaTime.",
      normal: "<b>Reihenfolge (vereinfacht)</b>: <code>Awake</code> (beim Laden, auch wenn das Skript deaktiviert ist) → <code>OnEnable</code> → <code>Start</code> (vor dem ersten Update, nur wenn aktiv) → wiederholt <code>FixedUpdate</code> (fester Physik-Takt, Standard 0,02 s) · <code>Update</code> (jeden Frame) · <code>LateUpdate</code> (nach allen Updates, ideal für Kameras) → <code>OnDisable</code> → <code>OnDestroy</code>.<br><b>Time.deltaTime</b> = Zeit seit dem letzten Frame in Sekunden. <code>speed * Time.deltaTime</code> macht Bewegungen <b>framerate-unabhängig</b> (Einheiten pro Sekunde statt pro Frame).<br><b>Felder im Inspector</b>: <code>public</code> oder <code>[SerializeField] private</code>. Der Inspector-Wert überschreibt den Initialwert im Code!",
      technical: "Physik (Kräfte auf Rigidbodies) gehört in <code>FixedUpdate</code>, Eingaben werden in <code>Update</code> gelesen (sonst gehen <code>GetKeyDown</code>-Ereignisse verloren). Weitere Ereignis-Methoden: <code>OnTriggerEnter</code>, <code>OnCollisionEnter</code>, <code>OnMouseDown</code>. Komponenten holt man mit <code>GetComponent&lt;T&gt;()</code> – am besten einmal in <code>Awake</code>/<code>Start</code> cachen, nicht jeden Frame. Der Klassenname muss exakt dem Dateinamen entsprechen, sonst lässt sich das Skript nicht anhängen." } },
    { t: "widget", w: "sorter", topic: "mmp-csharp", title: "Welche Methode passt?", cats: [{ k: "s", label: "Start / Awake" }, { k: "u", label: "Update" }, { k: "f", label: "FixedUpdate" }, { k: "l", label: "LateUpdate" }], items: [
      { t: "Rigidbody-Referenz mit GetComponent holen und speichern", a: "s", why: "Einmalige Initialisierung." }, { t: "Tastendruck mit Input.GetKeyDown abfragen", a: "u", why: "Ereignisse nur in Update zuverlässig." }, { t: "rb.AddForce(...) für die Ballsteuerung", a: "f", why: "Physik im festen Takt." }, { t: "Kamera folgt dem Spieler mit Offset", a: "l", why: "Nachdem sich der Spieler bewegt hat." }, { t: "Objekt mit transform.Rotate drehen (Pickup)", a: "u", why: "" }, { t: "Startwert für Punktestand setzen und UI-Text initialisieren", a: "s", why: "" }] },
    { t: "widget", w: "gapfill", topic: "mmp-csharp", title: "C# in Unity", items: [{ s: "Eigene Unity-Skripte erben von ___.", a: ["MonoBehaviour"] }, { s: "Framerate-unabhängig bewegen: speed * Time.___", a: ["deltaTime"] }, { s: "Private Felder im Inspector zeigen mit dem Attribut [___]", a: ["SerializeField"] }, { s: "Textausgabe in die Console: Debug.___(\"Hallo\");", a: ["Log"] }] },
    { t: "check", q: "Warum multipliziert man Bewegungen in Update mit Time.deltaTime?", opts: ["Damit die Bewegung pro Sekunde statt pro Frame definiert ist", "Damit das Objekt schwerer wird", "Weil Update sonst nicht aufgerufen wird", "Um Physik zu aktivieren"], a: 0, why: "Bei 30 oder 144 FPS bewegt sich das Objekt dann gleich schnell." }
  ]}
 ]},
 { id: "mmpw2", n: 2, title: "3D-Welt per Code", sub: "Vorbereitung Aufgabe 1: 3D Animation (35 %)", boss: { id: "boss-mmpw2", title: "Kapiteltest: 3D-Welt per Code", topics: ["mmp-code", "mmp-licht", "mmp-anim"] }, lessons: [
  { id: "mmp2-1", title: "GameObjects per Code erzeugen, finden, steuern", topic: "mmp-code", min: 16, xp: 0, blocks: [
    { t: "lead", html: "Syllabus: „Gameobjekte über Code steuern“. Du erzeugst Objekte mit <code>Instantiate</code> oder <code>CreatePrimitive</code>, greifst über Referenzen auf sie zu und veränderst ihren Transform." },
    { t: "html", html: code(`using UnityEngine;

public class GridSpawner : MonoBehaviour
{
    public GameObject prefab;     // Prefab aus dem Project-Fenster hineinziehen
    public int size = 5;
    public float spacing = 1.5f;

    void Start()
    {
        for (int x = 0; x &lt; size; x++)
        {
            for (int z = 0; z &lt; size; z++)
            {
                Vector3 pos = new Vector3(x * spacing, 0.5f, z * spacing);
                GameObject go = Instantiate(prefab, pos, Quaternion.identity, transform);
                go.name = "Cube_" + x + "_" + z;
                float hue = (float)(x * size + z) / (size * size);
                go.GetComponent&lt;Renderer&gt;().material.color = Color.HSVToRGB(hue, 0.7f, 1f);
            }
        }

        // Ohne Prefab: primitives Objekt direkt erzeugen
        GameObject sphere = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        sphere.transform.position = new Vector3(0f, 3f, 0f);
        sphere.transform.localScale = Vector3.one * 2f;
    }
}`) },
    { t: "text", h: "Referenzen, Prefabs, Zerstören", levels: {
      simple: "Ein Prefab ist eine Vorlage, aus der man beliebig viele Kopien erzeugen kann. Am einfachsten verbindest du Objekte, indem du sie im Inspector in ein public-Feld ziehst.",
      normal: "<ul><li><b>Prefab</b>: wiederverwendbare Vorlage (GameObject aus der Hierarchy ins Project-Fenster ziehen). Änderungen am Prefab wirken auf alle Instanzen.</li><li><b>Referenzen</b> bekommst du am besten über <b>Inspector-Felder</b> (<code>public GameObject player;</code>). Alternativen: <code>GameObject.Find(\"Name\")</code>, <code>GameObject.FindWithTag(\"Player\")</code> – langsamer und fehleranfällig bei Umbenennung.</li><li><b>Komponenten</b>: <code>GetComponent&lt;Light&gt;()</code>, hinzufügen mit <code>AddComponent&lt;Rigidbody&gt;()</code>.</li><li><b>Transform ändern</b>: <code>transform.position = …</code>, <code>transform.Translate(Vector3.forward * 2f * Time.deltaTime)</code>, <code>transform.Rotate(…)</code>, <code>transform.localScale = …</code>, <code>transform.LookAt(target)</code>.</li><li><b>Löschen/Ausblenden</b>: <code>Destroy(go)</code> bzw. <code>Destroy(go, 2f)</code> (nach 2 s); <code>go.SetActive(false)</code> deaktiviert nur.</li></ul>",
      technical: "<code>Instantiate</code> klont das komplette Objekt inkl. Kinder und Komponenten. Für viele kurzlebige Objekte (Projektile) nutzt man Object Pooling statt ständig Instantiate/Destroy. <code>Find</code>-Methoden finden keine inaktiven Objekte. <code>Quaternion.identity</code> = keine Rotation; <code>Quaternion.Euler(0, 45, 0)</code> = 45° um Y." } },
    { t: "widget", w: "pairs", topic: "mmp-code", title: "Was macht welcher Befehl?", pairs: [["Instantiate(prefab, pos, rot)", "erzeugt eine Kopie des Prefabs"], ["Destroy(go, 2f)", "löscht das Objekt nach 2 Sekunden"], ["go.SetActive(false)", "deaktiviert das Objekt, ohne es zu löschen"], ["GetComponent<Light>()", "holt eine Komponente vom selben GameObject"], ["AddComponent<Rigidbody>()", "fügt zur Laufzeit eine Komponente hinzu"], ["transform.LookAt(target)", "dreht das Objekt zum Ziel"]] },
    { t: "check", q: "Was ist ein Prefab?", opts: ["Ein Shader für Licht", "Eine wiederverwendbare Vorlage eines GameObjects inkl. Komponenten", "Eine C#-Klasse ohne MonoBehaviour", "Ein Kamera-Typ"], a: 1, why: "Aus Prefabs erzeugt man Instanzen per Drag & Drop oder Instantiate." }
  ]},
  { id: "mmp2-2", title: "Lichtquellen setzen und steuern, Materialien", topic: "mmp-licht", min: 14, xp: 0, blocks: [
    { t: "lead", html: "Syllabus: „Lichtquellen setzen und steuern“. Licht bestimmt Stimmung und Lesbarkeit einer 3D-Welt – und lässt sich vollständig per Code verändern." },
    { t: "html", html: "<table class='dt'><tr><th>Light Type</th><th>Wirkung</th><th>Beispiel</th></tr><tr><td><b>Directional</b></td><td>parallele Strahlen aus einer Richtung, Position egal, nur Rotation zählt</td><td>Sonne, Mond</td></tr><tr><td><b>Point</b></td><td>strahlt kugelförmig in alle Richtungen, mit <code>range</code></td><td>Glühbirne, Fackel</td></tr><tr><td><b>Spot</b></td><td>Lichtkegel mit <code>spotAngle</code> und <code>range</code></td><td>Taschenlampe, Bühnenscheinwerfer</td></tr><tr><td><b>Area</b></td><td>flächiges Licht, (je nach Pipeline) nur gebacken/Baked</td><td>Fenster, Leuchtpaneel</td></tr></table>" },
    { t: "html", html: code(`using System.Collections;
using UnityEngine;

public class LightController : MonoBehaviour
{
    public Light sun;              // Directional Light
    public Light lamp;             // Point oder Spot Light
    public float dayLength = 30f;  // Sekunden für eine volle Umdrehung

    void Start()
    {
        // Licht komplett per Code erzeugen
        GameObject go = new GameObject("Spotlight");
        Light spot = go.AddComponent&lt;Light&gt;();
        spot.type = LightType.Spot;
        spot.spotAngle = 30f;
        spot.range = 15f;
        spot.intensity = 3f;
        spot.color = Color.yellow;
        go.transform.position = new Vector3(0f, 5f, 0f);
        go.transform.rotation = Quaternion.Euler(90f, 0f, 0f);   // nach unten

        StartCoroutine(Flicker());
    }

    void Update()
    {
        sun.transform.Rotate(Vector3.right, 360f / dayLength * Time.deltaTime);  // Tag/Nacht
        if (Input.GetKeyDown(KeyCode.L)) lamp.enabled = !lamp.enabled;           // Licht an/aus
    }

    IEnumerator Flicker()
    {
        while (true)
        {
            lamp.intensity = Random.Range(0.6f, 1.4f);
            yield return new WaitForSeconds(0.1f);
        }
    }
}`) },
    { t: "text", h: "Materialien und Farben", levels: {
      simple: "Ein Material sagt, wie eine Oberfläche aussieht (Farbe, glänzend, Textur). Licht und Material zusammen ergeben das Bild.",
      normal: "Ein <b>Material</b> verwendet einen <b>Shader</b> (z. B. URP <i>Lit</i> oder Built-in <i>Standard</i>) und Eigenschaften wie Grundfarbe, Textur (Albedo/Base Map), Metallic, Smoothness, Emission. Per Code: <code>GetComponent&lt;Renderer&gt;().material.color = Color.red;</code><br>Weitere Lichtquellen: <b>Emission</b> (selbstleuchtendes Material), <b>Skybox</b> und <b>Environment Lighting</b> (Window → Rendering → Lighting).",
      technical: "<code>renderer.material</code> erzeugt eine <b>eigene Kopie</b> des Materials für dieses Objekt; <code>renderer.sharedMaterial</code> verändert das Asset für alle Objekte, die es verwenden. Echtzeit- vs. gebackenes Licht (Baked Lightmaps): gebacken ist performant, aber statisch. Schatten: <code>light.shadows = LightShadows.Soft;</code>" } },
    { t: "widget", w: "sorter", topic: "mmp-licht", title: "Welcher Light Type?", cats: [{ k: "d", label: "Directional" }, { k: "p", label: "Point" }, { k: "s", label: "Spot" }], items: [
      { t: "Sonne für Tag-Nacht-Zyklus", a: "d", why: "" }, { t: "Lagerfeuer, das rundum leuchtet", a: "p", why: "" }, { t: "Taschenlampe des Spielers", a: "s", why: "" }, { t: "Nur die Rotation beeinflusst die Beleuchtung", a: "d", why: "Position ist irrelevant." }, { t: "Bühnenscheinwerfer mit Lichtkegel", a: "s", why: "" }, { t: "Leuchtende Kugel über einem Pickup", a: "p", why: "" }] },
    { t: "check", q: "Welche Eigenschaft hat nur ein Spot Light, aber kein Point Light?", opts: ["intensity", "color", "spotAngle", "range"], a: 2, why: "range haben beide, den Kegelwinkel nur Spot." }
  ]},
  { id: "mmp2-3", title: "Einfache Animationen: Editor und Code", topic: "mmp-anim", min: 18, xp: 0, blocks: [
    { t: "lead", html: "Syllabus: „Einfache Animationen mittels Entwicklungsumgebung und Code“. Für Aufgabe 1 (3D Animation, 35 %) brauchst du beides: Keyframes im <b>Animation-Fenster</b> und Bewegung per <b>Skript</b>." },
    { t: "text", h: "Animation im Editor: Clip, Animator, Controller", levels: {
      simple: "Du nimmst Positionen zu bestimmten Zeitpunkten auf (Keyframes), Unity rechnet die Bewegung dazwischen. Ein Animator entscheidet, welche Animation gerade läuft.",
      normal: "<ol><li>Objekt wählen → <b>Window → Animation → Animation</b> → <i>Create</i>: legt ein <b>AnimationClip</b> (<code>.anim</code>) und einen <b>Animator Controller</b> an und hängt eine <b>Animator</b>-Komponente an.</li><li><b>Record</b> (roter Punkt) → Zeitleiste verschieben → Werte ändern = <b>Keyframes</b>. Unity interpoliert dazwischen (Kurven im <i>Curves</i>-Modus).</li><li>Im <b>Animator-Fenster</b> (State Machine) gibt es <b>States</b> (je ein Clip) und <b>Transitions</b> mit Bedingungen.</li><li><b>Parameter</b> (Bool, Trigger, Float, Int) steuern die Übergänge – per Code setzbar.</li></ol>",
      technical: "Bei Transitions, die sofort auf einen Trigger reagieren sollen, <b>Has Exit Time</b> deaktivieren. Loop Time im Clip-Inspector für Endlosschleifen. Animationen auf einem Parent-Objekt animieren relative Werte der Kinder – für bewegte Objekte, die auch per Code verschoben werden, ein leeres Parent-Objekt verwenden (sonst überschreibt der Animator die Position)." } },
    { t: "html", html: code(`using System.Collections;
using UnityEngine;

public class DoorAndBob : MonoBehaviour
{
    public Animator doorAnimator;     // Animator mit Bool-Parameter "isOpen"
    public float bobHeight = 0.5f;
    public float bobSpeed = 2f;
    private Vector3 startPos;

    void Start()
    {
        startPos = transform.position;
    }

    void Update()
    {
        // Code-Animation: auf- und abschweben mit Sinus
        float y = Mathf.Sin(Time.time * bobSpeed) * bobHeight;
        transform.position = startPos + new Vector3(0f, y, 0f);

        // Editor-Animation über Parameter steuern
        if (Input.GetKeyDown(KeyCode.O))
            doorAnimator.SetBool("isOpen", !doorAnimator.GetBool("isOpen"));
    }

    // Weiche Bewegung von A nach B in einer festen Dauer
    public IEnumerator MoveTo(Vector3 target, float duration)
    {
        Vector3 from = transform.position;
        float t = 0f;
        while (t &lt; 1f)
        {
            t += Time.deltaTime / duration;
            transform.position = Vector3.Lerp(from, target, Mathf.SmoothStep(0f, 1f, t));
            yield return null;    // auf den nächsten Frame warten
        }
    }
}`) },
    { t: "tip", html: "Aufruf der Coroutine: <code>StartCoroutine(MoveTo(new Vector3(0, 2, 5), 1.5f));</code> – nicht einfach <code>MoveTo(…)</code> aufrufen, sonst passiert nichts. Achtung: Das Sinus-Schweben in <code>Update</code> setzt die Position jeden Frame und würde <code>MoveTo</code> überschreiben – im echten Projekt nur eine der beiden Bewegungen auf demselben Objekt verwenden." },
    { t: "widget", w: "pairs", topic: "mmp-anim", title: "Animations-Bausteine", pairs: [["AnimationClip", "aufgenommene Keyframes für eine Bewegung"], ["Animator Controller", "State Machine mit States und Transitions"], ["Trigger-Parameter", "einmaliger Auslöser, z. B. SetTrigger(\"Jump\")"], ["Coroutine", "Methode, die über mehrere Frames läuft (yield return)"], ["Vector3.Lerp", "lineare Interpolation zwischen zwei Positionen"], ["Mathf.Sin(Time.time)", "periodische Bewegung (Schweben, Pendeln)"]] },
    { t: "check", q: "Wie wechselt man per Code in einen Animator-State, dessen Transition an den Trigger „Jump“ gebunden ist?", opts: ["animator.Play()", "animator.SetTrigger(\"Jump\")", "animator.enabled = false", "Destroy(animator)"], a: 1, why: "Parameter (Bool/Trigger/Float/Int) steuern die Transitions." },
    { t: "check", q: "Was bewirkt <code>yield return null;</code> in einer Coroutine?", opts: ["Beendet das Spiel", "Wartet bis zum nächsten Frame und setzt dann fort", "Wartet genau eine Sekunde", "Löscht das GameObject"], a: 1, why: "Für Sekunden: yield return new WaitForSeconds(1f);" }
  ]}
 ]},
 { id: "mmpw3", n: 3, title: "Medien & Interaktion", sub: "Maus/Touch/Tastatur, Audio, Video, Player-UI", boss: { id: "boss-mmpw3", title: "Kapiteltest: Medien & Interaktion", topics: ["mmp-input", "mmp-media", "mmp-ui"] }, lessons: [
  { id: "mmp3-1", title: "Interaktion mit Maus, Touch und Tastatur", topic: "mmp-input", min: 16, xp: 0, blocks: [
    { t: "lead", html: "Syllabus: „Interaktion mittels Maus (Touchscreen) und Tastatur“. Unity kennt zwei Eingabesysteme: den klassischen <b>Input Manager</b> (<code>Input.*</code>) und das neuere <b>Input System</b>-Package." },
    { t: "html", html: code(`using UnityEngine;

public class InputDemo : MonoBehaviour
{
    public float speed = 5f;

    void Update()
    {
        // Tastatur: Achsen (WASD / Pfeiltasten), Werte -1 .. 1
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");
        transform.Translate(new Vector3(h, 0f, v) * speed * Time.deltaTime);

        // Einzelne Tasten
        if (Input.GetKeyDown(KeyCode.Space)) Debug.Log("Space gedrückt (einmal)");
        if (Input.GetKey(KeyCode.LeftShift)) speed = 10f; else speed = 5f;

        // Maus (auf Touchscreens wird der erste Finger als Maus simuliert)
        if (Input.GetMouseButtonDown(0))
        {
            Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
            if (Physics.Raycast(ray, out RaycastHit hit))
            {
                hit.collider.GetComponent&lt;Renderer&gt;().material.color = Random.ColorHSV();
            }
        }

        // Touch explizit
        if (Input.touchCount &gt; 0)
        {
            Touch touch = Input.GetTouch(0);
            if (touch.phase == TouchPhase.Began) Debug.Log("Touch bei " + touch.position);
        }
    }
}`) },
    { t: "text", h: "GetKey vs. GetKeyDown, OnMouseDown, Raycast", levels: {
      simple: "GetKeyDown = nur im Moment des Drückens. GetKey = solange die Taste gehalten wird. Um zu wissen, worauf man geklickt hat, schießt man einen unsichtbaren Strahl (Raycast) von der Kamera in die Szene.",
      normal: "<ul><li><code>GetKeyDown</code>: genau ein Frame beim Drücken · <code>GetKey</code>: jeden Frame, solange gehalten · <code>GetKeyUp</code>: beim Loslassen.</li><li><code>Input.GetAxis</code> liefert geglättete Werte (−1 … 1), <code>GetAxisRaw</code> ungeglättet (−1, 0, 1).</li><li><code>GetMouseButtonDown(0)</code> = linke, <code>1</code> = rechte, <code>2</code> = mittlere Maustaste; <code>Input.mousePosition</code> in Bildschirmpixeln.</li><li><b>Raycast</b>: <code>Camera.main.ScreenPointToRay</code> + <code>Physics.Raycast</code> liefert das getroffene Objekt – es braucht einen <b>Collider</b>.</li><li>Einfacher: Methode <code>void OnMouseDown()</code> in einem Skript am Objekt (ebenfalls Collider nötig).</li></ul>",
      technical: "In neuen Unity-6-Projekten ist oft nur das <b>Input System Package</b> aktiv – dann werfen <code>Input.*</code>-Aufrufe eine <code>InvalidOperationException</code>. Lösung: <i>Project Settings → Player → Active Input Handling</i> auf <b>Both</b> stellen, oder das neue System verwenden: <code>using UnityEngine.InputSystem;</code> … <code>Keyboard.current.spaceKey.wasPressedThisFrame</code>, <code>Mouse.current.leftButton.wasPressedThisFrame</code>, <code>Mouse.current.position.ReadValue()</code>. <code>Camera.main</code> findet die Kamera mit Tag <i>MainCamera</i>. Welche Variante in der LV verwendet wird: laut Unterlagen der LV." } },
    { t: "widget", w: "sorter", topic: "mmp-input", title: "Welcher Aufruf?", cats: [{ k: "kd", label: "GetKeyDown" }, { k: "k", label: "GetKey" }, { k: "ax", label: "GetAxis" }, { k: "rc", label: "Raycast / OnMouseDown" }], items: [
      { t: "Springen, einmal pro Tastendruck", a: "kd", why: "" }, { t: "Sprinten, solange Shift gehalten wird", a: "k", why: "" }, { t: "Ball mit WASD/Pfeiltasten weich steuern", a: "ax", why: "" }, { t: "Angeklicktes 3D-Objekt einfärben", a: "rc", why: "" }, { t: "Pause-Menü mit Escape umschalten", a: "kd", why: "Toggle → nur einmal auslösen." }, { t: "Auf ein Objekt tippen (Touchscreen) und es auswählen", a: "rc", why: "" }] },
    { t: "warnbox", html: "Ohne <b>Collider</b> funktionieren weder <code>Physics.Raycast</code> noch <code>OnMouseDown</code>. Und: Input immer in <code>Update</code> lesen, nicht in <code>FixedUpdate</code> – sonst gehen einzelne Tastendrücke verloren." },
    { t: "check", q: "Welche Methode liefert <b>true</b>, solange eine Taste gedrückt gehalten wird?", opts: ["Input.GetKeyDown", "Input.GetKey", "Input.GetKeyUp", "Input.anyKeyDown"], a: 1, why: "GetKeyDown/GetKeyUp sind nur im jeweiligen Frame true." }
  ]},
  { id: "mmp3-2", title: "Audio- und Videofiles abspielen", topic: "mmp-media", min: 16, xp: 0, blocks: [
    { t: "lead", html: "Syllabus: „Audio- und Videofiles abspielen“. Audio läuft über <b>AudioSource</b> (Quelle) und <b>AudioListener</b> (Ohr, meist an der Kamera); Video über die <b>VideoPlayer</b>-Komponente." },
    { t: "text", h: "Audio: Source, Listener, Clip", levels: {
      simple: "Die AudioSource ist der Lautsprecher, der AudioListener das Ohr. Ein AudioClip ist die Sounddatei (z. B. .wav, .mp3, .ogg).",
      normal: "<ul><li><b>AudioClip</b>: importierte Datei (WAV, MP3, OGG, AIFF).</li><li><b>AudioSource</b>-Eigenschaften: <code>clip</code>, <code>volume</code> (0–1), <code>pitch</code>, <code>loop</code>, <code>playOnAwake</code>, <code>spatialBlend</code> (0 = 2D, 1 = 3D, Lautstärke abhängig von der Entfernung).</li><li><b>AudioListener</b>: genau <b>einer</b> pro Szene (standardmäßig an der Main Camera).</li><li>Methoden: <code>Play()</code>, <code>Pause()</code>, <code>Stop()</code>, <code>PlayOneShot(clip)</code> (für kurze Effekte, überlagert sich, unterbricht nichts), <code>isPlaying</code>.</li></ul>",
      technical: "Hintergrundmusik: eigene AudioSource mit <code>loop = true</code>, <code>spatialBlend = 0</code>. Soundeffekte (Pickup-Sound): <code>PlayOneShot</code>. Wird das Objekt mit der AudioSource deaktiviert/zerstört (z. B. Pickup), bricht der Sound ab → Sound lieber an einem anderen Objekt abspielen oder <code>AudioSource.PlayClipAtPoint(clip, position)</code> verwenden. Für Mischung und Effekte: Audio Mixer." } },
    { t: "html", html: code(`using UnityEngine;
using UnityEngine.Video;

public class MediaDemo : MonoBehaviour
{
    public AudioSource music;        // loop = true, Play On Awake aus
    public AudioClip clickSound;
    public VideoPlayer videoPlayer;  // Render Mode z. B. Render Texture

    void Start()
    {
        music.volume = 0.5f;
        music.Play();

        videoPlayer.isLooping = false;
        videoPlayer.loopPointReached += OnVideoFinished;  // Event am Ende
        videoPlayer.Prepare();                            // vorladen
        videoPlayer.prepareCompleted += vp =&gt; vp.Play();
    }

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.M))
        {
            if (music.isPlaying) music.Pause(); else music.UnPause();
        }
        if (Input.GetMouseButtonDown(0)) music.PlayOneShot(clickSound);
    }

    void OnVideoFinished(VideoPlayer vp)
    {
        Debug.Log("Video zu Ende");
    }
}`) },
    { t: "text", h: "VideoPlayer: Quelle und Render Mode", levels: {
      simple: "Der VideoPlayer spielt ein Video ab – entweder direkt hinter/vor der Kamera, auf einem 3D-Objekt (z. B. ein Fernseher) oder in eine Textur, die man im UI anzeigt.",
      normal: "<b>Source</b>: <i>Video Clip</i> (importiertes Asset, z. B. MP4/H.264) oder <i>URL</i> (Datei-Pfad oder Web-Adresse, <code>videoPlayer.url</code>).<br><b>Render Mode</b>:<ul><li><b>Camera Far Plane / Near Plane</b> – Video hinter bzw. vor der Szene</li><li><b>Render Texture</b> – Video wird in eine <b>RenderTexture</b> geschrieben; diese zeigt man auf einem Material oder in einem UI-<b>RawImage</b> (Basis für den eigenen Videoplayer)</li><li><b>Material Override</b> – Video direkt auf dem Material eines Renderers (z. B. TV-Bildschirm in der 3D-Welt)</li><li><b>API Only</b> – nur per Code über <code>videoPlayer.texture</code></li></ul>Steuerung: <code>Play()</code>, <code>Pause()</code>, <code>Stop()</code>, <code>isPlaying</code>, <code>time</code> (aktuelle Position, Sekunden), <code>length</code> (Gesamtlänge), <code>isLooping</code>, <code>playbackSpeed</code>.",
      technical: "Audio des Videos: <code>audioOutputMode</code> = <i>Direct</i> (Lautstärke über <code>SetDirectAudioVolume(0, v)</code>) oder <i>Audio Source</i> (dann die AudioSource-Lautstärke ändern). <code>time</code> und <code>length</code> sind <code>double</code>. Vor dem Seeken/Abfragen der Länge sollte das Video vorbereitet sein (<code>isPrepared</code>). Für Builds: Video-Dateien mit URL-Quelle in <code>Assets/StreamingAssets</code> ablegen und mit <code>Application.streamingAssetsPath</code> referenzieren." } },
    { t: "widget", w: "gapfill", topic: "mmp-media", title: "Audio & Video", items: [{ s: "Kurze Soundeffekte überlagernd abspielen: audioSource.___(clip)", a: ["PlayOneShot"] }, { s: "Pro Szene darf es nur einen Audio___ geben.", a: ["Listener"] }, { s: "spatialBlend = ___ bedeutet reiner 2D-Sound.", a: ["0"] }, { s: "Event am Ende eines Videos: videoPlayer.___", a: ["loopPointReached"] }, { s: "Damit ein Video im UI angezeigt werden kann, rendert man es in eine Render___.", a: ["Texture", "Textur"] }] },
    { t: "check", q: "Welcher Render Mode eignet sich, um ein Video in einem UI-RawImage für einen eigenen Player anzuzeigen?", opts: ["Camera Far Plane", "Render Texture", "API Only ohne Textur", "Audio Source"], a: 1, why: "Die RenderTexture wird dem RawImage als Textur zugewiesen." }
  ]},
  { id: "mmp3-3", title: "Interface für einen Videoplayer", topic: "mmp-ui", min: 18, xp: 0, blocks: [
    { t: "lead", html: "Syllabus: „Interface für einen Videoplayer“. Mit Unitys UI-System (Canvas, Button, Slider, TextMeshPro) baust du Play/Pause, Zeitleiste, Lautstärke und Zeitanzeige." },
    { t: "keys", items: ["<b>Canvas</b> = Wurzel aller UI-Elemente (Render Mode <i>Screen Space – Overlay</i> für normales UI); beim Anlegen entsteht automatisch ein <b>EventSystem</b> – ohne EventSystem reagieren Buttons nicht", "<b>RawImage</b> zeigt die RenderTexture des VideoPlayers", "<b>Button</b> → <code>onClick</code> · <b>Slider</b> → <code>onValueChanged</code> (float) · <b>TextMeshPro – Text (UI)</b> für Anzeigen", "Events im Inspector verknüpfen (OnClick +) oder per Code mit <code>AddListener</code>", "<b>Rect Transform + Anchors</b> sorgen dafür, dass das UI bei verschiedenen Auflösungen richtig sitzt; Canvas Scaler auf <i>Scale With Screen Size</i>"] },
    { t: "html", html: code(`using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Video;
using TMPro;

public class VideoControls : MonoBehaviour
{
    public VideoPlayer videoPlayer;
    public Button playPauseButton;
    public TextMeshProUGUI playPauseLabel;
    public Slider timeSlider;      // Min 0, Max 1
    public Slider volumeSlider;    // Min 0, Max 1
    public TextMeshProUGUI timeText;

    void Start()
    {
        playPauseButton.onClick.AddListener(TogglePlay);
        timeSlider.onValueChanged.AddListener(Seek);
        volumeSlider.onValueChanged.AddListener(SetVolume);
        videoPlayer.loopPointReached += OnVideoEnd;
    }

    void Update()
    {
        if (videoPlayer.length &gt; 0)
        {
            // Slider bewegen, OHNE onValueChanged auszulösen (sonst Endlos-Seek)
            timeSlider.SetValueWithoutNotify((float)(videoPlayer.time / videoPlayer.length));
            timeText.text = Format(videoPlayer.time) + " / " + Format(videoPlayer.length);
        }
    }

    void TogglePlay()
    {
        if (videoPlayer.isPlaying) { videoPlayer.Pause(); playPauseLabel.text = "Play"; }
        else { videoPlayer.Play(); playPauseLabel.text = "Pause"; }
    }

    void Seek(float value)
    {
        videoPlayer.time = value * videoPlayer.length;
    }

    void SetVolume(float value)
    {
        videoPlayer.SetDirectAudioVolume(0, value);   // Audio Output Mode = Direct
    }

    void OnVideoEnd(VideoPlayer vp)
    {
        vp.Stop();
        playPauseLabel.text = "Play";
    }

    string Format(double seconds)
    {
        int s = (int)seconds;
        return (s / 60).ToString("00") + ":" + (s % 60).ToString("00");
    }
}`) },
    { t: "text", h: "Aufbau Schritt für Schritt", levels: {
      simple: "Erst Video auf eine Textur rendern, dann Textur im UI anzeigen, dann Buttons und Slider mit dem Skript verbinden.",
      normal: "<ol><li>Im Project: <i>Create → Render Texture</i> (z. B. 1920×1080).</li><li>GameObject mit <b>VideoPlayer</b>: Source = Clip/URL, Render Mode = <b>Render Texture</b>, Target Texture = die RenderTexture.</li><li><i>GameObject → UI → Raw Image</i>, Texture = die RenderTexture (Seitenverhältnis beachten).</li><li>Buttons (Play/Pause, Stop), Slider für Zeit und Lautstärke, TextMeshPro-Text für die Zeit hinzufügen (beim ersten TMP-Element: <i>Import TMP Essentials</i>).</li><li>Skript <code>VideoControls</code> an ein Objekt hängen und alle Felder im Inspector befüllen.</li><li>Testen: Play, Seek, Lautstärke, Ende des Videos, unterschiedliche Fenstergrößen (Anchors).</li></ol>",
      technical: "Erweiterungen für ein gutes Interface (Usability laut Lernergebnissen): Tastaturkürzel (Space = Play/Pause, Pfeiltasten = ±5 s), Vollbild-Umschaltung (<code>Screen.fullScreen = !Screen.fullScreen</code>), Mute-Button, Wiedergabegeschwindigkeit (<code>playbackSpeed</code>), Hover-States der Buttons (Button → Transition: Color Tint), Playlist mit mehreren Clips. Beim Seek mit Slider kann es kurz ruckeln – <code>videoPlayer.canSetTime</code> prüfen." } },
    { t: "widget", w: "pairs", topic: "mmp-ui", title: "UI-Element → Aufgabe", pairs: [["Canvas", "Wurzel aller UI-Elemente"], ["EventSystem", "verarbeitet Klicks/Touch auf UI-Elemente"], ["RawImage", "zeigt die RenderTexture des Videos"], ["Slider.onValueChanged", "liefert den neuen Wert beim Verschieben"], ["Button.onClick.AddListener", "verknüpft einen Klick per Code mit einer Methode"], ["SetValueWithoutNotify", "setzt den Slider-Wert ohne Event auszulösen"]] },
    { t: "check", q: "Buttons im UI reagieren nicht auf Klicks. Was fehlt am wahrscheinlichsten?", opts: ["Ein Rigidbody", "Ein EventSystem in der Szene", "Ein AudioListener", "Ein Directional Light"], a: 1, why: "Das EventSystem verteilt Eingaben an UI-Elemente; es wird mit dem ersten Canvas automatisch angelegt, kann aber gelöscht worden sein." },
    { t: "check", q: "Warum <code>SetValueWithoutNotify</code> statt <code>timeSlider.value = …</code> in Update?", opts: ["Weil value schreibgeschützt ist", "Damit das Setzen nicht onValueChanged → Seek auslöst und das Video ständig springt", "Weil es schneller rendert", "Weil sonst das Video stummgeschaltet wird"], a: 1, why: "Sonst würde jeder Frame einen Seek auslösen – Ruckeln/Endlosschleife." }
  ]}
 ]},
 { id: "mmpw4", n: 4, title: "myRollABall & Abgabe", sub: "Vorbereitung Aufgabe 2 (55 %) · Build · KI-Doku", boss: { id: "boss-mmpw4", title: "Kapiteltest: Physik & Roll-a-Ball", topics: ["mmp-physik", "mmp-rollaball"] }, lessons: [
  { id: "mmp4-1", title: "Physik: Rigidbody, Collider, Trigger", topic: "mmp-physik", min: 16, xp: 0, blocks: [
    { t: "lead", html: "Ein Ball, der rollt, fällt und Pickups einsammelt, braucht die Physik-Engine: <b>Rigidbody</b> für Bewegung durch Kräfte, <b>Collider</b> für Kollisionen und <b>Trigger</b> zum Einsammeln." },
    { t: "text", h: "Rigidbody und Kräfte", levels: {
      simple: "Mit Rigidbody wirkt Schwerkraft auf das Objekt und man kann es anschubsen (AddForce), statt es einfach zu verschieben.",
      normal: "<b>Rigidbody</b>: <code>mass</code>, <code>useGravity</code>, <code>isKinematic</code> (wird nicht von Physik bewegt, nur per Code/Animation), Dämpfung (Drag). Bewegung über Kräfte: <code>rb.AddForce(richtung * kraft)</code> in <b>FixedUpdate</b>.<br><b>ForceMode</b>: <code>Force</code> (Standard, kontinuierlich, masseabhängig) · <code>Acceleration</code> (masseunabhängig) · <code>Impulse</code> (einmaliger Stoß, z. B. Sprung) · <code>VelocityChange</code> (sofortige Geschwindigkeitsänderung, masseunabhängig).<br><b>Wichtig</b>: Objekte mit Rigidbody nicht per <code>transform.position</code> „teleportieren“ – das umgeht die Physik (Durchdringen von Wänden).",
      technical: "Sprung: <code>rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);</code> nur wenn am Boden (z. B. <code>Physics.Raycast(transform.position, Vector3.down, 0.6f)</code>). In Unity 6 heißen einige Eigenschaften neu: <code>rb.linearVelocity</code> (früher <code>velocity</code>), <code>linearDamping</code>/<code>angularDamping</code> (früher <code>drag</code>/<code>angularDrag</code>). Für schnelle Objekte: Collision Detection auf <i>Continuous</i>." } },
    { t: "html", html: "<table class='dt'><tr><th></th><th>Kollision (Collision)</th><th>Trigger</th></tr><tr><td>Einstellung</td><td>Collider normal</td><td>Collider mit <b>Is Trigger</b> ✓</td></tr><tr><td>Physisch</td><td>Objekte prallen ab / blockieren</td><td>Objekte gehen durch, nur Ereignis</td></tr><tr><td>Methoden</td><td><code>OnCollisionEnter(Collision c)</code>, …Stay, …Exit</td><td><code>OnTriggerEnter(Collider other)</code>, …Stay, …Exit</td></tr><tr><td>Voraussetzung</td><td colspan='2'>beide Objekte haben Collider, <b>mindestens eines einen Rigidbody</b></td></tr><tr><td>Roll-a-Ball</td><td>Ball ↔ Boden, Wände</td><td>Ball ↔ Pickups</td></tr></table>" },
    { t: "html", html: code(`using UnityEngine;

public class Bumper : MonoBehaviour
{
    public float pushForce = 8f;

    void OnCollisionEnter(Collision collision)
    {
        Rigidbody otherRb = collision.rigidbody;
        if (otherRb != null &amp;&amp; collision.gameObject.CompareTag("Player"))
        {
            Vector3 dir = (collision.transform.position - transform.position).normalized;
            otherRb.AddForce(dir * pushForce, ForceMode.Impulse);
        }
    }
}`) },
    { t: "widget", w: "sorter", topic: "mmp-physik", title: "Collider oder Trigger?", cats: [{ k: "c", label: "normaler Collider (Kollision)" }, { k: "t", label: "Trigger (Is Trigger)" }], items: [
      { t: "Wände der Spielfläche", a: "c", why: "Ball soll abprallen." }, { t: "Rotierende Pickup-Würfel zum Einsammeln", a: "t", why: "Ball fährt durch, Ereignis zählt Punkte." }, { t: "Ziellinie, die eine Siegmeldung auslöst", a: "t", why: "" }, { t: "Boden (Ground)", a: "c", why: "" }, { t: "Bumper, der den Ball wegstößt", a: "c", why: "Physischer Kontakt mit OnCollisionEnter." }, { t: "Unsichtbare Zone, in der Musik startet", a: "t", why: "" }] },
    { t: "check", q: "OnTriggerEnter wird nicht aufgerufen. Ball und Pickup haben Collider, der Pickup ist Trigger. Was fehlt am ehesten?", opts: ["Ein Rigidbody an mindestens einem der beiden Objekte", "Ein AudioListener", "Ein Animator", "Ein Canvas"], a: 0, why: "Physik-Ereignisse brauchen mindestens einen Rigidbody (beim Ball ohnehin nötig)." },
    { t: "check", q: "Welcher ForceMode eignet sich für einen einmaligen Sprung?", opts: ["ForceMode.Force", "ForceMode.Impulse", "ForceMode.Acceleration jeden Frame", "Gar keiner – transform.position setzen"], a: 1, why: "Impulse = einmaliger Stoß, masseabhängig." }
  ]},
  { id: "mmp4-2", title: "myRollABall Schritt für Schritt, Build & Abgabe", topic: "mmp-rollaball", min: 25, xp: 0, blocks: [
    PREP,
    { t: "lead", html: "Aufgabe 2 „myRollABall“ zählt <b>55 %</b>. Basis ist das klassische Unity-Tutorial <i>Roll-a-Ball</i> (Unity Learn) – das „my“ deutet auf eine eigene Erweiterung hin. Die genauen Anforderungen gibt die LV vor." },
    { t: "keys", items: ["<b>1 · Szene</b>: Plane „Ground“ (Scale 2,1,2), Sphere „Player“ bei Y = 0,5, Materialien zuweisen", "<b>2 · Spieler</b>: Rigidbody an den Player, Skript <code>PlayerController</code> (Input → <code>AddForce</code> in FixedUpdate)", "<b>3 · Kamera</b>: <code>CameraController</code> mit Offset, Position in <b>LateUpdate</b> nachführen (Kamera nicht als Child des Balls – sie würde mitrollen)", "<b>4 · Spielfeld</b>: vier Wände (skalierte Cubes) als Begrenzung", "<b>5 · Pickups</b>: Cube, gedreht und klein, Skript <code>Rotator</code>, als <b>Prefab</b>, Tag <b>PickUp</b>, Collider <b>Is Trigger</b>; ca. 12 Stück verteilen", "<b>6 · Sammeln & UI</b>: <code>OnTriggerEnter</code> → Pickup deaktivieren, Zähler erhöhen, TextMeshPro-Text „Count: x“, Siegtext bei allen Pickups → <b>7 · Build</b>"] },
    { t: "html", html: code(`using UnityEngine;
using TMPro;

public class PlayerController : MonoBehaviour
{
    public float speed = 10f;
    public TextMeshProUGUI countText;
    public GameObject winTextObject;

    private Rigidbody rb;
    private int count;
    private int totalPickups;
    private float movementX, movementY;

    void Start()
    {
        rb = GetComponent&lt;Rigidbody&gt;();
        count = 0;
        totalPickups = GameObject.FindGameObjectsWithTag("PickUp").Length;
        SetCountText();
        winTextObject.SetActive(false);
    }

    void Update()                      // Eingabe lesen
    {
        movementX = Input.GetAxis("Horizontal");
        movementY = Input.GetAxis("Vertical");
    }

    void FixedUpdate()                 // Physik anwenden
    {
        Vector3 movement = new Vector3(movementX, 0.0f, movementY);
        rb.AddForce(movement * speed);
    }

    void OnTriggerEnter(Collider other)
    {
        if (other.gameObject.CompareTag("PickUp"))
        {
            other.gameObject.SetActive(false);
            count++;
            SetCountText();
        }
    }

    void SetCountText()
    {
        countText.text = "Count: " + count;
        if (count &gt;= totalPickups) winTextObject.SetActive(true);
    }
}`) },
    { t: "html", html: code(`using UnityEngine;

public class CameraController : MonoBehaviour
{
    public GameObject player;
    private Vector3 offset;

    void Start()
    {
        offset = transform.position - player.transform.position;
    }

    void LateUpdate()
    {
        transform.position = player.transform.position + offset;
    }
}

public class Rotator : MonoBehaviour   // in eigene Datei Rotator.cs!
{
    void Update()
    {
        transform.Rotate(new Vector3(15, 30, 45) * Time.deltaTime);
    }
}`) },
    { t: "text", h: "Neues Input System (wie im aktuellen Unity-Learn-Tutorial)", levels: {
      simple: "Im aktuellen Tutorial bekommt der Ball eine „Player Input“-Komponente, und Unity ruft automatisch OnMove auf, wenn man WASD drückt.",
      normal: "Player-Objekt: Komponente <b>Player Input</b> mit Actions (Standard-Asset <i>InputSystem_Actions</i> oder eigenes), Behavior <i>Send Messages</i>. Dann im Skript:<pre><code>using UnityEngine.InputSystem;\n\nvoid OnMove(InputValue movementValue)\n{\n    Vector2 movementVector = movementValue.Get&lt;Vector2&gt;();\n    movementX = movementVector.x;\n    movementY = movementVector.y;\n}</code></pre>Die <code>Update</code>-Methode mit <code>Input.GetAxis</code> entfällt dann.",
      technical: "Die Methode muss <code>On</code> + Action-Name heißen (<i>Move</i> → <code>OnMove</code>). Mischformen sind möglich, wenn <i>Active Input Handling</i> auf <b>Both</b> steht. Halte dich an die Variante, die in der LV gezeigt wird." } },
    { t: "text", h: "Build, Test und Abgabe", levels: {
      simple: "Am Ende baust du eine ausführbare Windows-Version, testest sie und gibst Programm, Code und die KI-Dokumentation ab.",
      normal: "<ol><li><b>Szene(n)</b> in die Build-Liste eintragen (<i>File → Build Profiles</i> bzw. <i>Build Settings</i> → Add Open Scenes).</li><li>Plattform <b>Windows</b>, <i>Player Settings</i>: Company/Product Name, Auflösung, Icon.</li><li><b>Build</b> in einen eigenen Ordner (nicht in <code>Assets/</code>) → <code>.exe</code> + <code>_Data</code>-Ordner gehören zusammen.</li><li>Build außerhalb des Editors testen (Steuerung, UI-Skalierung, Sound, Video-Pfade).</li><li>Abgabe laut Syllabus: <b>Programm und Code</b> (Projektordner ohne <code>Library/</code>, <code>Temp/</code>, <code>Obj/</code>, <code>Logs/</code> – diese erzeugt Unity neu).</li><li><b>KI-Dokumentation</b>: Verwendung inkl. <b>Prompts</b> in einem DOC-File festhalten und am Ende mit abgeben.</li></ol>",
      technical: "Ideen für „my“-Erweiterungen (nur falls von der LV gewünscht/erlaubt): Sprung mit Impulse, bewegliche Hindernisse (Animator), Gegner mit NavMesh, Soundeffekte beim Einsammeln (<code>AudioSource.PlayClipAtPoint</code>), Timer/Highscore, Partikeleffekte, mehrere Levels mit <code>SceneManager.LoadScene</code>, Restart mit Taste R. Versionsverwaltung mit Git + Unity-<code>.gitignore</code> schützt vor Datenverlust." } },
    { t: "widget", w: "gapfill", topic: "mmp-rollaball", title: "Roll-a-Ball-Check", items: [{ s: "Die Pickups bekommen den Tag ___.", a: ["PickUp", "Pickup"] }, { s: "Die Kamera wird in ___Update nachgeführt.", a: ["Late"] }, { s: "Eingesammelte Pickups werden mit SetActive(___) ausgeblendet.", a: ["false"] }, { s: "Der Ball wird mit rb.Add___ bewegt.", a: ["Force"] }, { s: "Die KI-Nutzung inkl. ___ wird in einem DOC-File dokumentiert.", a: ["Prompts", "Prompt"] }] },
    { t: "warnbox", html: "Häufige Roll-a-Ball-Fehler: Ball fällt durch den Boden (Ground ohne Collider bzw. Ball zu tief gestartet) · Pickups werden nicht eingesammelt (Tag falsch geschrieben, <i>Is Trigger</i> nicht gesetzt) · Text bleibt leer (Feld im Inspector nicht zugewiesen → <code>NullReferenceException</code> in der Console) · Kamera dreht sich wild (als Child des Balls angehängt)." },
    { t: "check", q: "Warum wird die Kamera <b>nicht</b> einfach als Child des Balls angehängt?", opts: ["Weil Kameras keine Parents haben dürfen", "Weil sie sonst die Rotation des rollenden Balls übernimmt und mitdreht", "Weil die Kamera sonst keinen AudioListener hat", "Weil das den Build verhindert"], a: 1, why: "Daher ein Offset-Skript in LateUpdate, das nur die Position übernimmt." },
    { t: "check", q: "Was gehört laut Syllabus zur Abgabe der Aufgaben?", opts: ["Nur ein Video der Anwendung", "Programm und Code; zusätzlich die KI-Nutzung inkl. Prompts im DOC-File", "Nur der Library-Ordner", "Eine schriftliche Prüfung"], a: 1, why: "Aufgabe 1 und 2: Abgabe Programm und Code; KI-Dokumentation am Ende mit abgeben." }
  ]}
 ]}
];

const QUESTIONS = [
 { id: "mmpq1", topic: "mmp-editor", q: "In welchem Fenster siehst du alle GameObjects der aktuellen Szene als Baumstruktur?", opts: ["Project", "Hierarchy", "Inspector", "Console"], a: 1, why: "Project zeigt Dateien/Assets, Inspector die Komponenten des gewählten Objekts.", ex: "" },
 { id: "mmpq2", topic: "mmp-editor", q: "Was passiert mit Änderungen, die du im Play-Modus im Inspector machst?", opts: ["Sie werden automatisch gespeichert", "Sie gehen beim Beenden des Play-Modus verloren", "Sie werden nur im Build übernommen", "Sie werden in die Console geschrieben"], a: 1, why: "Klassische Falle – Werte notieren oder Component → Copy/Paste Values.", ex: "" },
 { id: "mmpq3", topic: "mmp-editor", q: "Ein Child-Objekt hat localPosition (0, 1, 0), der Parent steht bei (5, 0, 0) ohne Rotation/Skalierung. Weltposition des Childs?", opts: ["(0, 1, 0)", "(5, 1, 0)", "(5, 0, 0)", "(0, 0, 0)"], a: 1, why: "Lokale Position relativ zum Parent: (5,0,0) + (0,1,0).", ex: "" },
 { id: "mmpq4", topic: "mmp-editor", q: "Welche Komponentenkombination macht einen Würfel sichtbar?", opts: ["Rigidbody + Collider", "MeshFilter + MeshRenderer (mit Material)", "AudioSource + AudioListener", "Animator + Light"], a: 1, why: "MeshFilter liefert die Form, MeshRenderer zeichnet sie mit Material.", ex: "" },
 { id: "mmpq5", topic: "mmp-csharp", q: "Welche Methode ruft Unity einmal auf, bevor das erste Update eines aktiven Skripts läuft?", opts: ["Update", "Start", "LateUpdate", "OnDestroy"], a: 1, why: "Awake kommt noch davor (auch bei deaktiviertem Skript).", ex: "" },
 { id: "mmpq6", topic: "mmp-csharp", q: "Wohin gehören Physik-Kräfte wie rb.AddForce?", opts: ["Update", "FixedUpdate", "Start", "OnGUI"], a: 1, why: "FixedUpdate läuft im festen Physik-Takt (Standard 0,02 s).", ex: "" },
 { id: "mmpq7", topic: "mmp-csharp", q: "Ein Skript heißt in der Datei „PlayerController.cs“, die Klasse aber „Player“. Folge?", opts: ["Kein Problem", "Das Skript lässt sich nicht als Komponente anhängen", "Unity benennt die Datei automatisch um", "Nur der Build schlägt fehl, der Editor nicht"], a: 1, why: "Für MonoBehaviours müssen Datei- und Klassenname übereinstimmen.", ex: "" },
 { id: "mmpq8", topic: "mmp-csharp", q: "transform.Rotate(0, 90 * Time.deltaTime, 0) in Update bewirkt …", opts: ["90° pro Frame", "90° pro Sekunde um die Y-Achse", "eine einmalige Drehung um 90°", "nichts, weil deltaTime 0 ist"], a: 1, why: "deltaTime = Sekunden seit dem letzten Frame → framerate-unabhängig.", ex: "" },
 { id: "mmpq9", topic: "mmp-csharp", q: "Wie macht man ein privates Feld im Inspector sichtbar?", opts: ["[HideInInspector]", "[SerializeField]", "static", "const"], a: 1, why: "public macht es ebenfalls sichtbar, aber auch für andere Klassen zugreifbar.", ex: "" },
 { id: "mmpq10", topic: "mmp-code", q: "Welcher Aufruf erzeugt eine Kopie eines Prefabs an Position pos ohne Rotation?", opts: ["new GameObject(prefab)", "Instantiate(prefab, pos, Quaternion.identity)", "prefab.Clone(pos)", "GameObject.Find(prefab)"], a: 1, why: "Quaternion.identity = keine Rotation.", ex: "" },
 { id: "mmpq11", topic: "mmp-code", q: "Was ist der Unterschied zwischen Destroy(go) und go.SetActive(false)?", opts: ["Kein Unterschied", "Destroy entfernt das Objekt, SetActive(false) deaktiviert es nur (reaktivierbar)", "SetActive löscht auch das Prefab", "Destroy wirkt nur im Editor"], a: 1, why: "Roll-a-Ball nutzt SetActive(false) für eingesammelte Pickups.", ex: "" },
 { id: "mmpq12", topic: "mmp-code", q: "Wie erzeugt man ohne Prefab per Code eine Kugel?", opts: ["GameObject.CreatePrimitive(PrimitiveType.Sphere)", "new Sphere()", "Instantiate(\"Sphere\")", "AddComponent&lt;Sphere&gt;()"], a: 0, why: "CreatePrimitive legt Mesh, Renderer und Collider an.", ex: "" },
 { id: "mmpq13", topic: "mmp-code", q: "Welche Methode fügt einem GameObject zur Laufzeit eine Komponente hinzu?", opts: ["GetComponent&lt;T&gt;()", "AddComponent&lt;T&gt;()", "Instantiate&lt;T&gt;()", "FindObjectOfType&lt;T&gt;()"], a: 1, why: "GetComponent holt eine bestehende Komponente.", ex: "" },
 { id: "mmpq14", topic: "mmp-code", q: "Warum sind Inspector-Referenzen meist besser als GameObject.Find(\"Name\")?", opts: ["Find funktioniert nie", "Find ist langsamer, bricht bei Umbenennung und findet keine inaktiven Objekte", "Inspector-Referenzen brauchen keinen Speicher", "Find ist in C# verboten"], a: 1, why: "Referenzen direkt zuweisen ist robuster und performanter.", ex: "" },
 { id: "mmpq15", topic: "mmp-licht", q: "Bei welchem Light Type spielt die Position keine Rolle, nur die Rotation?", opts: ["Point", "Spot", "Directional", "Area"], a: 2, why: "Parallele Strahlen wie Sonnenlicht.", ex: "" },
 { id: "mmpq16", topic: "mmp-licht", q: "Wie schaltet man ein Licht per Code aus?", opts: ["light.intensity = -1", "light.enabled = false", "Destroy(light.color)", "light.type = LightType.None"], a: 1, why: "Komponente deaktivieren; intensity = 0 ginge auch.", ex: "" },
 { id: "mmpq17", topic: "mmp-licht", q: "Was ändert renderer.material.color = Color.red?", opts: ["Das Material-Asset für alle Objekte", "Nur die Farbe dieses Objekts (eigene Material-Instanz)", "Die Lichtfarbe", "Die Skybox"], a: 1, why: "sharedMaterial würde das Asset für alle ändern.", ex: "" },
 { id: "mmpq18", topic: "mmp-licht", q: "Welche Eigenschaft begrenzt die Reichweite eines Point Lights?", opts: ["spotAngle", "range", "shadowStrength", "bounceIntensity"], a: 1, why: "spotAngle gibt es nur beim Spot Light.", ex: "" },
 { id: "mmpq19", topic: "mmp-anim", q: "Welche Komponente spielt Animationen aus einem Animator Controller ab?", opts: ["Animation Clip", "Animator", "Rigidbody", "Transform"], a: 1, why: "Der Animator verweist auf den Controller (State Machine).", ex: "" },
 { id: "mmpq20", topic: "mmp-anim", q: "Was sind Keyframes?", opts: ["Tastenkürzel im Editor", "Gespeicherte Werte zu bestimmten Zeitpunkten, zwischen denen interpoliert wird", "Frames, in denen Input gelesen wird", "Physik-Schritte"], a: 1, why: "Im Animation-Fenster mit Record aufgenommen.", ex: "" },
 { id: "mmpq21", topic: "mmp-anim", q: "Welche Zeile startet eine Coroutine korrekt?", opts: ["MoveTo(target, 1f);", "StartCoroutine(MoveTo(target, 1f));", "Invoke(MoveTo);", "yield MoveTo();"], a: 1, why: "Coroutinen müssen über StartCoroutine gestartet werden.", ex: "" },
 { id: "mmpq22", topic: "mmp-anim", q: "Eine Transition soll sofort auf einen Trigger reagieren, wartet aber das Clip-Ende ab. Was ist zu ändern?", opts: ["Loop Time deaktivieren", "Has Exit Time deaktivieren", "Animator löschen", "Time.timeScale = 0"], a: 1, why: "Has Exit Time zwingt zum Abwarten der Exit-Zeit.", ex: "" },
 { id: "mmpq23", topic: "mmp-anim", q: "transform.position = startPos + Vector3.up * Mathf.Sin(Time.time) erzeugt …", opts: ["eine lineare Aufwärtsbewegung ohne Ende", "ein Auf- und Abschweben um startPos", "eine Drehung", "eine Skalierung"], a: 1, why: "Sinus schwingt periodisch zwischen −1 und 1.", ex: "" },
 { id: "mmpq24", topic: "mmp-input", q: "Welche Abfrage ist nur im Frame des Drückens true?", opts: ["Input.GetKey(KeyCode.Space)", "Input.GetKeyDown(KeyCode.Space)", "Input.GetAxis(\"Jump\")", "Input.anyKey"], a: 1, why: "GetKey ist true, solange gehalten.", ex: "" },
 { id: "mmpq25", topic: "mmp-input", q: "Welche Werte liefert Input.GetAxis(\"Horizontal\")?", opts: ["0 oder 1", "−1 bis 1 (geglättet)", "Pixelkoordinaten", "Bool"], a: 1, why: "GetAxisRaw liefert ungeglättet −1, 0 oder 1.", ex: "" },
 { id: "mmpq26", topic: "mmp-input", q: "Welche Voraussetzung braucht OnMouseDown() bzw. ein Physics.Raycast-Treffer?", opts: ["Einen Rigidbody", "Einen Collider am Objekt", "Einen AudioListener", "Einen Animator"], a: 1, why: "Ohne Collider gibt es nichts zu treffen.", ex: "" },
 { id: "mmpq27", topic: "mmp-input", q: "In einem neuen Unity-6-Projekt wirft Input.GetKeyDown eine InvalidOperationException. Ursache?", opts: ["Tastatur nicht angeschlossen", "Nur das neue Input System ist aktiv (Active Input Handling)", "Fehlende Lichtquelle", "Skript liegt im falschen Ordner"], a: 1, why: "Player Settings → Active Input Handling auf Both oder neues API verwenden.", ex: "" },
 { id: "mmpq28", topic: "mmp-input", q: "Wie bekommt man einen Strahl von der Kamera durch die Mausposition?", opts: ["Camera.main.ScreenPointToRay(Input.mousePosition)", "Input.GetRay()", "Physics.Mouse()", "transform.forward"], a: 0, why: "Dann Physics.Raycast(ray, out RaycastHit hit).", ex: "" },
 { id: "mmpq29", topic: "mmp-media", q: "Welche Komponente ist das „Ohr“ der Szene?", opts: ["AudioSource", "AudioListener", "AudioClip", "AudioMixer"], a: 1, why: "Genau einer pro Szene, meist an der Main Camera.", ex: "" },
 { id: "mmpq30", topic: "mmp-media", q: "Welche Methode eignet sich für kurze, sich überlagernde Soundeffekte?", opts: ["Play()", "PlayOneShot(clip)", "Stop()", "UnPause()"], a: 1, why: "Play() würde den laufenden Clip neu starten.", ex: "" },
 { id: "mmpq31", topic: "mmp-media", q: "spatialBlend = 1 an einer AudioSource bedeutet …", opts: ["Stumm", "Vollständig 3D – Lautstärke/Richtung abhängig von der Position zum Listener", "Doppelte Lautstärke", "Endlosschleife"], a: 1, why: "0 = 2D (z. B. Hintergrundmusik).", ex: "" },
 { id: "mmpq32", topic: "mmp-media", q: "Welches Event meldet das Ende eines Videos im VideoPlayer?", opts: ["onFinished", "loopPointReached", "videoEnd", "OnTriggerExit"], a: 1, why: "Wird bei jedem Erreichen des Endes ausgelöst (auch bei Loop).", ex: "" },
 { id: "mmpq33", topic: "mmp-media", q: "Welcher Render Mode zeigt ein Video direkt auf dem Material eines 3D-Fernsehers?", opts: ["Camera Far Plane", "Material Override", "API Only", "Camera Near Plane"], a: 1, why: "Alternativ Render Texture, die dem Material zugewiesen wird.", ex: "" },
 { id: "mmpq34", topic: "mmp-ui", q: "Welche UI-Komponente zeigt eine RenderTexture an?", opts: ["Image (Sprite)", "RawImage", "Button", "Slider"], a: 1, why: "Image erwartet ein Sprite, RawImage eine beliebige Textur.", ex: "" },
 { id: "mmpq35", topic: "mmp-ui", q: "Wie verknüpft man per Code einen Button-Klick mit einer Methode?", opts: ["button.onClick.AddListener(TogglePlay);", "button.Click = TogglePlay();", "OnMouseDown(button);", "button.SendMessage(\"Click\")"], a: 0, why: "Alternativ im Inspector über OnClick (+).", ex: "" },
 { id: "mmpq36", topic: "mmp-ui", q: "Zeitleisten-Slider (0–1): Welche Zeile springt an die gewählte Stelle des Videos?", opts: ["videoPlayer.time = value * videoPlayer.length;", "videoPlayer.length = value;", "videoPlayer.frame = value;", "videoPlayer.playbackSpeed = value;"], a: 0, why: "time ist die Position in Sekunden, length die Gesamtdauer.", ex: "" },
 { id: "mmpq37", topic: "mmp-ui", q: "Wozu dienen Anchors im Rect Transform?", opts: ["Für Physik-Gelenke", "Damit UI-Elemente bei unterschiedlichen Bildschirmgrößen richtig positioniert bleiben", "Zum Abspielen von Sound", "Für Lichtberechnung"], a: 1, why: "Zusammen mit dem Canvas Scaler (Scale With Screen Size).", ex: "" },
 { id: "mmpq38", topic: "mmp-physik", q: "Welche Bedingung muss für OnTriggerEnter erfüllt sein?", opts: ["Kein Collider darf Trigger sein", "Ein Collider ist Trigger und mindestens ein Objekt hat einen Rigidbody", "Beide brauchen einen Animator", "Das Objekt muss ein Prefab sein"], a: 1, why: "Physik-Ereignisse benötigen einen Rigidbody.", ex: "" },
 { id: "mmpq39", topic: "mmp-physik", q: "isKinematic = true an einem Rigidbody bedeutet …", opts: ["Das Objekt fällt doppelt so schnell", "Das Objekt wird nicht von Kräften/Schwerkraft bewegt, nur per Code oder Animation", "Kollisionen werden deaktiviert", "Das Objekt wird unsichtbar"], a: 1, why: "Nützlich für bewegte Plattformen.", ex: "" },
 { id: "mmpq40", topic: "mmp-physik", q: "Warum sollte man einen Ball mit Rigidbody nicht über transform.position bewegen?", opts: ["Weil es nicht kompiliert", "Weil man damit die Physik umgeht (Teleportieren, Durchdringen von Wänden)", "Weil transform.position schreibgeschützt ist", "Weil der Ball dann unsichtbar wird"], a: 1, why: "Kräfte (AddForce) oder Rigidbody-Methoden verwenden.", ex: "" },
 { id: "mmpq41", topic: "mmp-physik", q: "Welche Methode wird bei einer physischen Kollision zweier nicht-Trigger-Collider aufgerufen?", opts: ["OnTriggerEnter(Collider other)", "OnCollisionEnter(Collision collision)", "OnMouseDown()", "OnBecameVisible()"], a: 1, why: "Trigger → OnTrigger…, sonst OnCollision…", ex: "" },
 { id: "mmpq42", topic: "mmp-rollaball", q: "Warum wird die Kamera im Roll-a-Ball in LateUpdate nachgeführt?", opts: ["Weil Update für Kameras verboten ist", "Damit sie erst nach der Bewegung des Spielers im selben Frame folgt – kein Ruckeln", "Damit sie Physik nutzt", "Damit sie Sound abspielt"], a: 1, why: "LateUpdate läuft nach allen Update-Aufrufen.", ex: "" },
 { id: "mmpq43", topic: "mmp-rollaball", q: "Wie erkennt der PlayerController, dass ein Pickup berührt wurde?", opts: ["other.gameObject.CompareTag(\"PickUp\") in OnTriggerEnter", "Input.GetKey(\"PickUp\")", "GameObject.Find(\"Pickup\").isTouched", "Animator.SetTrigger(\"PickUp\")"], a: 0, why: "Tag am Prefab setzen, Is Trigger aktivieren.", ex: "" },
 { id: "mmpq44", topic: "mmp-rollaball", q: "Wie viel zählt Aufgabe 2 „myRollABall“ laut Syllabus?", opts: ["35 %", "55 %", "10 %", "75 %"], a: 1, why: "Aufgabe 1 (3D Animation) 35 %, Exkursion 10 %.", ex: "" },
 { id: "mmpq45", topic: "mmp-rollaball", q: "Welche Ordner müssen bei der Abgabe des Unity-Projekts nicht mitgeschickt werden, weil Unity sie neu erzeugt?", opts: ["Assets und ProjectSettings", "Library, Temp, Obj, Logs", "Packages", "Scenes"], a: 1, why: "Assets, Packages und ProjectSettings sind das eigentliche Projekt.", ex: "" },
 { id: "mmpq46", topic: "mmp-rollaball", q: "Welche Regel gilt laut Syllabus für KI-Assistenzsysteme in MMPROV?", opts: ["Komplett verboten", "Erlaubt; Verwendung inkl. Prompts dokumentieren und das DOC-File am Ende mit abgeben", "Nur für die Exkursion erlaubt", "Erlaubt ohne Dokumentation"], a: 1, why: "Nicht genehmigte bzw. nicht dokumentierte Nutzung kann als Täuschungsversuch gewertet werden.", ex: "" },
 { id: "mmpq47", topic: "mmp-rollaball", q: "Wie ist die Beurteilung in MMPROV aufgebaut?", opts: ["Schriftliche Prüfung 100 %", "Aufgabe 1 35 %, Aufgabe 2 55 %, Exkursion 10 % – jeder Teil muss positiv sein", "Aufgabe 1 50 %, Aufgabe 2 50 %", "Nur Mitarbeit"], a: 1, why: "Mitarbeit zählt als Bonus; mindestens 61 Punkte.", ex: "" }
];

const BOSS_EXTRA = [
 { id: "mmpb1", topic: "mmp-csharp", q: "Ein Spieler-Skript liest Input.GetKeyDown(KeyCode.Space) in FixedUpdate; Sprünge werden manchmal ignoriert. Warum?", opts: ["Space ist reserviert", "FixedUpdate läuft nicht in jedem Frame; das Down-Ereignis kann zwischen zwei Physik-Schritten verloren gehen", "GetKeyDown funktioniert nur in Start", "Der Rigidbody ist zu schwer"], a: 1, why: "Input in Update lesen, in einer Variablen merken und in FixedUpdate anwenden." },
 { id: "mmpb2", topic: "mmp-rollaball", q: "Die Pickups werden nicht eingesammelt. Tag „PickUp“ ist gesetzt, Ball hat Rigidbody. Im Prefab ist bei Box Collider „Is Trigger“ aus. Was passiert?", opts: ["Alles funktioniert", "Der Ball prallt an den Pickups ab und OnTriggerEnter wird nie aufgerufen", "Die Pickups fallen herunter", "Unity meldet einen Compiler-Fehler"], a: 1, why: "Ohne Is Trigger gibt es eine physische Kollision (OnCollisionEnter) statt eines Trigger-Ereignisses." },
 { id: "mmpb3", topic: "mmp-ui", q: "Der Zeitleisten-Slider ruckelt und das Video springt ständig zurück. Im Update steht timeSlider.value = (float)(vp.time / vp.length). Ursache?", opts: ["RawImage zu klein", "Das Setzen von value löst onValueChanged → Seek aus; jeder Frame führt einen Seek durch", "Video ist zu lang", "Der Slider braucht einen Rigidbody"], a: 1, why: "Lösung: SetValueWithoutNotify oder ein Flag, das nur bei Benutzerinteraktion seekt." },
 { id: "mmpb4", topic: "mmp-media", q: "Ein Pickup spielt seinen Sound mit der eigenen AudioSource und wird direkt danach mit SetActive(false) ausgeblendet. Der Sound ist nicht hörbar. Beste Lösung?", opts: ["Volume auf 2 setzen", "AudioSource.PlayClipAtPoint(clip, position) oder Sound über ein anderes, aktives Objekt abspielen", "AudioListener an das Pickup hängen", "spatialBlend = 1"], a: 1, why: "Deaktivierte Objekte stoppen ihre AudioSource sofort." },
 { id: "mmpb5", topic: "mmp-anim", q: "Ein Objekt hat einen Animator mit animierter Position UND ein Skript, das transform.position setzt. Das Skript scheint wirkungslos. Warum, und was hilft?", opts: ["Skripte laufen nie bei Animatoren", "Der Animator überschreibt die animierten Eigenschaften jeden Frame – Objekt in ein Parent hängen und Animation/Script auf verschiedene Ebenen verteilen", "Time.deltaTime ist null", "Der Animator braucht einen Collider"], a: 1, why: "Animierte Properties werden nach Update vom Animator gesetzt." },
 { id: "mmpb6", topic: "mmp-code", q: "for-Schleife mit Instantiate(prefab, new Vector3(i, 0, 0), Quaternion.identity) für i = 0 … 9 in Update(). Problem?", opts: ["Keines", "Jeder Frame erzeugt 10 neue Objekte – nach Sekunden Tausende; gehört in Start oder hinter eine Bedingung", "Quaternion.identity ist ungültig", "Instantiate darf nur in Awake stehen"], a: 1, why: "Update läuft jeden Frame." },
 { id: "mmpb7", topic: "mmp-physik", q: "Ein schneller Ball fliegt manchmal durch dünne Wände. Welche Maßnahme ist am passendsten?", opts: ["Licht heller machen", "Rigidbody Collision Detection auf Continuous stellen bzw. Wände dicker machen", "Is Trigger an den Wänden aktivieren", "transform.position statt AddForce verwenden"], a: 1, why: "Diskrete Kollisionserkennung kann dünne Collider zwischen zwei Physik-Schritten überspringen (Tunneling)." },
 { id: "mmpb8", topic: "mmp-input", q: "Ein Klick auf ein 3D-Objekt per Raycast trifft immer ein großes, unsichtbares Trigger-Objekt davor. Was hilft?", opts: ["Kamera entfernen", "Layer-Maske im Raycast verwenden oder das Objekt auf den Layer Ignore Raycast legen", "Input.GetKey statt GetMouseButtonDown", "Rigidbody auf kinematic"], a: 1, why: "Physics.Raycast(ray, out hit, maxDistance, layerMask) filtert Layer." }
];

const FLASHCARDS = [
 ["GameObject", "Behälter in der Szene; erhält Verhalten durch Komponenten; hat immer einen Transform", "mmp-editor"],
 ["Transform", "Position, Rotation (Quaternion), Scale; position = Welt, localPosition = relativ zum Parent", "mmp-editor"],
 ["Koordinatensystem Unity", "linkshändig, Y nach oben, Z nach vorne, 1 Einheit = 1 m", "mmp-editor"],
 ["Play-Modus-Falle", "Änderungen im Play-Modus gehen beim Stoppen verloren", "mmp-editor"],
 ["MonoBehaviour", "Basisklasse für Unity-Skripte; Klassenname = Dateiname", "mmp-csharp"],
 ["Lifecycle-Reihenfolge", "Awake → OnEnable → Start → (FixedUpdate · Update · LateUpdate)* → OnDisable → OnDestroy", "mmp-csharp"],
 ["Time.deltaTime", "Sekunden seit dem letzten Frame → Bewegung pro Sekunde, framerate-unabhängig", "mmp-csharp"],
 ["Update vs. FixedUpdate", "Update: jeden Frame (Input, Logik) · FixedUpdate: fester Physik-Takt (AddForce)", "mmp-csharp"],
 ["[SerializeField]", "zeigt private Felder im Inspector", "mmp-csharp"],
 ["Prefab", "wiederverwendbare Vorlage eines GameObjects; Instanzen per Instantiate", "mmp-code"],
 ["Instantiate", "Instantiate(prefab, position, rotation[, parent]) → Klon", "mmp-code"],
 ["Destroy vs. SetActive(false)", "löschen (optional verzögert) vs. nur deaktivieren", "mmp-code"],
 ["GetComponent / AddComponent", "Komponente holen (cachen!) / zur Laufzeit hinzufügen", "mmp-code"],
 ["Light Types", "Directional (Sonne), Point (Glühbirne), Spot (Kegel), Area (flächig, gebacken)", "mmp-licht"],
 ["Licht per Code", "light.enabled, intensity, color, range, spotAngle, type = LightType.Spot", "mmp-licht"],
 ["material vs. sharedMaterial", "eigene Instanz nur für dieses Objekt vs. Asset für alle Objekte", "mmp-licht"],
 ["AnimationClip / Animator Controller", "Keyframes einer Bewegung / State Machine mit States, Transitions, Parametern", "mmp-anim"],
 ["Animator-Parameter per Code", "SetBool, SetTrigger, SetFloat, SetInteger", "mmp-anim"],
 ["Coroutine", "IEnumerator-Methode mit yield return null / new WaitForSeconds(s); Start mit StartCoroutine", "mmp-anim"],
 ["Vector3.Lerp", "Lerp(a, b, t) – Interpolation, t von 0 bis 1", "mmp-anim"],
 ["GetKey / GetKeyDown / GetKeyUp", "gehalten / Frame des Drückens / Frame des Loslassens", "mmp-input"],
 ["Raycast-Klick", "Camera.main.ScreenPointToRay(Input.mousePosition) + Physics.Raycast(ray, out hit) – Collider nötig", "mmp-input"],
 ["Touch", "Input.touchCount, Input.GetTouch(0), touch.phase == TouchPhase.Began; erster Finger simuliert Maus", "mmp-input"],
 ["Active Input Handling", "Player Settings: Input Manager (Old), Input System Package (New) oder Both", "mmp-input"],
 ["AudioSource / AudioListener", "Lautsprecher (Play, PlayOneShot, volume, loop, spatialBlend) / Ohr – einer pro Szene", "mmp-media"],
 ["VideoPlayer Render Modes", "Camera Far/Near Plane, Render Texture, Material Override, API Only", "mmp-media"],
 ["VideoPlayer-Steuerung", "Play, Pause, Stop, isPlaying, time, length, loopPointReached, SetDirectAudioVolume", "mmp-media"],
 ["Videoplayer-UI", "Canvas + EventSystem, RawImage (RenderTexture), Buttons (onClick), Slider (onValueChanged), TextMeshPro", "mmp-ui"],
 ["SetValueWithoutNotify", "Slider-Wert setzen, ohne onValueChanged auszulösen", "mmp-ui"],
 ["Collision vs. Trigger", "OnCollisionEnter(Collision) – prallen ab · OnTriggerEnter(Collider) – Is Trigger, durchlässig; mind. ein Rigidbody", "mmp-physik"],
 ["ForceMode", "Force (kontinuierlich), Acceleration (masseunabh.), Impulse (Stoß), VelocityChange", "mmp-physik"],
 ["Roll-a-Ball-Skripte", "PlayerController (AddForce, OnTriggerEnter, Count), CameraController (Offset, LateUpdate), Rotator (Pickups drehen)", "mmp-rollaball"],
 ["MMPROV Beurteilung", "A Aufgabe 1 3D Animation 35 % · B Aufgabe 2 myRollABall 55 % · C Exkursion 10 % · alle positiv · Mitarbeit Bonus", "mmp-rollaball"],
 ["MMPROV KI-Regel", "KI erlaubt; Nutzung inkl. Prompts dokumentieren, DOC-File am Ende mit abgeben", "mmp-rollaball"]
].map((c, i) => ({ id: "mmpf" + (i + 1), cat: "MMPROV", topic: c[2], front: c[0], back: c[1] }));

window.COURSE_DEFS = window.COURSE_DEFS || [];
window.COURSE_DEFS.push({
  id: "mmprov", name: "Multimediaprogrammierung und Visualisierung", short: "MMPROV", title: "Multimedia & Unity", semester: 3, ects: 2.5,
  color: "#56CCF2", icon: "◆", lang: "de",
  lecturers: "FH-Prof. DI Dr. Alexander K Nischelwitzer",
  description: "Interaktive Multimediaanwendungen mit Unity und C#: 3D-Welten, GameObjects per Code, Licht, Audio und Video, Videoplayer-Interface, Maus-/Touch-/Tastatur-Interaktion und einfache Animationen. Vorbereitung auf Basis des Syllabus – Unterlagen aus der LV ergänzen.",
  aiRule: "KI-Assistenzsysteme sind erlaubt. Die Verwendung (inkl. Prompts) muss dokumentiert und das DOC-File am Ende mit abgegeben werden. Es dürfen nur vom Lehrenden zugelassene KI-Systeme verwendet werden; jede nicht genehmigte Verwendung gilt als Täuschungsversuch und führt zu einer negativen Beurteilung der Prüfungsleistung.",
  topics: TOPICS, worlds: WORLDS, questions: QUESTIONS, bossExtra: BOSS_EXTRA, flashcards: FLASHCARDS,
  assessment: { parts: [
      { id: "a1", label: "A · Aufgabe 1: 3D Animation (Abgabe Programm und Code) – 35 %", max: 35 },
      { id: "a2", label: "B · Aufgabe 2: myRollABall (Abgabe Programm und Code) – 55 %", max: 55 },
      { id: "exk", label: "C · Exkursion: Dokumentation (Punkteliste in Moodle und Kurzinfo) – 10 %", max: 10 }
    ], scale: [[91, "1 · Sehr gut"], [81, "2 · Gut"], [71, "3 · Befriedigend"], [61, "4 · Genügend"], [0, "5 · Nicht genügend"]],
    note: "Gesamt 100 Punkte; alle drei Teile müssen separat positiv sein; Mindesterreichung 61 Punkte. Mitarbeit wird als Bonus gewertet. Beide Aufgaben werden in den Übungen behandelt und können teilweise direkt dort umgesetzt werden. Umsetzung in Unity unter Windows, C#. Anwesenheit mind. 75 %. 2./3. Antritt: gleiche Kriterien wie beim ersten Antritt; 3. Antritt vor Prüfungskommission." },
  resources: { sections: [
      { title: "Moodle / Unterlagen", items: [
        { title: "Syllabus MMPROV (IMA25)", note: "Bisher einzige Unterlage – Folien, Projektvorlagen und Aufgabenstellungen aus der LV ergänzen." },
        { title: "Aufgabenstellung Aufgabe 1: 3D Animation", note: "Laut Moodle." },
        { title: "Aufgabenstellung Aufgabe 2: myRollABall", note: "Laut Moodle." },
        { title: "Exkursion: Punkteliste und Kurzinfo", note: "In Moodle." },
        { title: "KI-Dokumentation (DOC-File mit Prompts)", note: "Am Ende mit abgeben." }
      ] },
      { title: "Web", items: [
        { title: "www.unity.com", note: "Laut Syllabus; Unity Hub, Editor, Dokumentation" },
        { title: "Unity Learn: Roll-a-Ball", note: "Klassisches Einsteiger-Tutorial als Grundlage für myRollABall" },
        { title: "Unity Manual & Scripting API", note: "docs.unity3d.com" }
      ] }
    ],
    books: [] },
  events: [
    { id: "mmp-e1", title: "MMPROV · Abgabe Aufgabe 1: 3D Animation (35 %)", type: "deadline", date: null, note: "Termin laut Moodle eintragen. Programm + Code." },
    { id: "mmp-e2", title: "MMPROV · Abgabe Aufgabe 2: myRollABall (55 %)", type: "deadline", date: null, note: "Termin laut Moodle eintragen. Programm + Code." },
    { id: "mmp-e3", title: "MMPROV · Exkursion (10 %)", type: "info", date: null, note: "Termin laut Moodle eintragen. Dokumentation laut Punkteliste/Kurzinfo." },
    { id: "mmp-e4", title: "MMPROV · KI-Dokumentation (DOC-File) abgeben", type: "deadline", date: null, note: "Am Ende der LV mit abgeben – Termin laut Moodle eintragen." }
  ],
  tasks: [
    { id: "mmpt1", title: "Unity Hub und die in der LV verwendete Unity-Version unter Windows installieren, Testprojekt (3D) anlegen", note: "Version laut LV – nicht einfach die neueste nehmen, wenn eine bestimmte vorgegeben ist." },
    { id: "mmpt2", title: "KI-Logbuch (DOC-File) anlegen: Datum, Tool, Prompt, Ergebnis, was selbst angepasst wurde", note: "Laut Syllabus Pflicht bei KI-Nutzung, am Ende mit abgeben." },
    { id: "mmpt3", title: "Aufgabe 1 vorbereiten: Szene mit per Code erzeugten Objekten, Lichtsteuerung und Animation (Animator + Skript) bauen", note: "Lektionen 2.1–2.3." },
    { id: "mmpt4", title: "Roll-a-Ball Schritt 1–3: Ground, Player mit Rigidbody, PlayerController, CameraController", note: "" },
    { id: "mmpt5", title: "Roll-a-Ball Schritt 4–6: Wände, Pickup-Prefab mit Rotator, Tag „PickUp“, Trigger, Count-UI, Siegtext", note: "" },
    { id: "mmpt6", title: "Eigene „my“-Erweiterung für RollABall planen (nach Vorgaben der LV)", note: "z. B. Sound, Sprung, Hindernisse, zweites Level." },
    { id: "mmpt7", title: "Videoplayer-UI nachbauen: RenderTexture, RawImage, Play/Pause, Zeitleiste, Lautstärke", note: "Syllabus-Thema „Interface für einen Videoplayer“." },
    { id: "mmpt8", title: "Windows-Build erstellen, außerhalb des Editors testen und Abgabeordner ohne Library/Temp packen", note: "" }
  ]
});
})();
