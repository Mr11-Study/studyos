/* Vertiefung & Alltagsbeispiele – MMPROV */
(function () {
window.STUDYOS_DEEP = window.STUDYOS_DEEP || {};
window.STUDYOS_DEEP["mmprov"] = {

/* ===================== Kapitel 1: Unity & C# Grundlagen ===================== */

"mmp1-1": [
  { t: "text", h: "Vertiefung: Szene, Hierarchie und Koordinaten wirklich verstehen", levels: {
    simple: `Stell dir Unity wie ein Theater vor. Die <b>Szene</b> ist die Bühne, die <b>GameObjects</b> sind alles, was darauf steht (Schauspieler, Scheinwerfer, Kulissen, die Kamera als Zuschauerauge). Jedes Objekt hat einen <b>Transform</b> = seinen Platz auf der Bühne. Hängst du ein Objekt an ein anderes (Parent/Child), bewegt es sich mit – wie ein Hut auf dem Kopf eines Schauspielers. Das <b>Project</b>-Fenster ist das Lager hinter der Bühne: dort liegen Kostüme und Requisiten, die noch nicht auf der Bühne stehen.`,
    normal: `<p>Wichtig ist der Unterschied zwischen <b>Asset</b> und <b>Instanz</b>: Im <b>Project</b>-Fenster liegen Dateien (Assets) – ein Material, ein 3D-Modell, ein Skript. Erst wenn du sie in die Szene ziehst, entsteht in der <b>Hierarchy</b> ein GameObject, das dieses Asset verwendet. Löschst du das GameObject, ist das Asset noch da; löschst du das Asset, fehlt es überall.</p>
<p><b>Parent/Child und Koordinaten:</b> Ein Child speichert seine Werte <i>relativ</i> zum Parent (<code>localPosition</code>, <code>localRotation</code>, <code>localScale</code>). Der Inspector zeigt bei Children immer diese lokalen Werte. Beispiel: Parent steht bei (2, 0, 0) mit Scale 2, Child hat localPosition (1, 0, 0) → Weltposition = 2 + 1·2 = <b>(4, 0, 0)</b>, denn die Skalierung des Parents wirkt auch auf den Abstand.</p>
<p>Im Scene View gibt es zwei Umschalter neben den Werkzeugen: <b>Pivot/Center</b> (dreht um den Ursprung des Objekts oder um die Mitte der Auswahl) und <b>Local/Global</b> (Gizmo-Achsen am Objekt ausgerichtet oder an der Welt). Wer sich wundert, warum der Pfeil „schief“ zeigt, hat meist Local aktiv.</p>
<p><b>Tags</b> sind Namensschilder (genau eines pro Objekt, z. B. „Player“, „PickUp“) für Code-Abfragen wie <code>CompareTag</code>. <b>Layers</b> sind Gruppen zum Filtern: welche Objekte eine Kamera rendert, welche miteinander kollidieren oder welche ein Raycast trifft.</p>`,
    technical: `<p>Eine Szene (<code>.unity</code>) ist eine serialisierte Liste von GameObjects mit ihren Komponenten und Feldwerten (YAML-Format). Der Transform bildet einen Baum; die Weltmatrix eines Objekts ergibt sich als Produkt der lokalen TRS-Matrizen (Translation · Rotation · Scale) aller Vorfahren: <code>M_welt = M_parent · M_lokal</code>. Deshalb führen nicht-uniforme Scales am Parent (z. B. 2, 1, 1) bei rotierten Children zu Scherungen – Faustregel: Parents möglichst mit Scale (1, 1, 1) belassen und nur die sichtbaren Children skalieren.</p>
<p>Unity nutzt ein linkshändiges System (X rechts, Y oben, Z nach vorne/in den Bildschirm). Positive Rotation folgt der Linke-Hand-Regel (Daumen in Achsrichtung, Finger zeigen die Drehrichtung): Schaut man von der Pfeilspitze der Achse auf den Ursprung, dreht sie im Uhrzeigersinn – z. B. +90° um Y (von oben gesehen) macht aus „vorne“ (0, 0, 1) „rechts“ (1, 0, 0). <code>transform.forward</code> ist die lokale Z-Achse in Weltkoordinaten, <code>transform.right</code> die lokale X-Achse, <code>transform.up</code> die lokale Y-Achse. Umrechnung: <code>transform.TransformPoint(lokal)</code> → Welt, <code>transform.InverseTransformPoint(welt)</code> → lokal.</p>` } },
  { t: "example", title: "Das Theater „Unity-Bühne“", html: `<p>Regisseurin <b>Lena</b> inszeniert „Romeo und Julia“.</p>
<ul>
<li><b>Szene</b> = die Bühne für den 2. Akt (Balkonszene). Für den 3. Akt gibt es eine eigene Bühne – in Unity eine zweite <code>.unity</code>-Datei.</li>
<li><b>GameObjects</b> = alles auf der Bühne: der Balkon, Julia, Romeo, zwei Scheinwerfer und die Kamera (= der Blick des Publikums aus Reihe 5).</li>
<li><b>Hierarchy</b> = Lenas Besetzungsliste. Julia steht <i>auf</i> dem Balkon → in der Hierarchy ist „Julia“ ein <b>Child</b> von „Balkon“. Schieben die Bühnenarbeiter den Balkon 2 m nach links, wandert Julia automatisch mit (ihre <code>localPosition</code> bleibt gleich, die Weltposition ändert sich).</li>
<li><b>Inspector</b> = das Datenblatt zu einer Person: Position auf der Bühne, Kostümfarbe, Text.</li>
<li><b>Project</b> = der Fundus im Keller: Kostüme (Materialien), Requisiten (Modelle), Drehbücher (Skripte).</li>
<li><b>Game View</b> = was das Publikum sieht; <b>Scene View</b> = Lenas Blick von der Seitenbühne, auch auf Dinge hinter den Kulissen.</li>
</ul>
<p>Die Generalprobe ist der <b>Play-Modus</b>: Was Lena während der Probe umstellt, wird nicht ins Regiebuch übernommen – nach „Stop“ steht alles wieder wie vorher.</p>` },
  { t: "example", title: "Hierarchie-Rechnung mit Zahlen", html: `<p><b>Tim</b> baut einen Tisch in Unity: ein leeres GameObject „Tisch“ bei Weltposition (3, 0, 5) und als Child die „Lampe“ mit localPosition (0, 1, 0).</p>
<ul>
<li>Weltposition der Lampe = (3, 0, 5) + (0, 1, 0) = <b>(3, 1, 5)</b>.</li>
<li>Tim dreht den Tisch um 90° um Y. Die Lampe liegt genau über dem Ursprung des Tisches → bleibt bei (3, 1, 5), dreht sich aber mit.</li>
<li>Hätte die Lampe localPosition (1, 1, 0), würde sie durch die 90°-Drehung von (4, 1, 5) nach (3, 1, 4) wandern – sie kreist mit dem Tisch.</li>
</ul>
<p>Merke: Der Inspector der Lampe zeigt immer (0, 1, 0) bzw. (1, 1, 0) – die <i>lokalen</i> Werte. Die Weltposition siehst du nur über <code>transform.position</code> im Code (z. B. mit <code>Debug.Log(transform.position)</code>).</p>` },
  { t: "hint", title: "Eselsbrücke: Q W E R T", html: `Die Werkzeuge liegen links oben auf der Tastatur nebeneinander: <b>Q</b> = Hand (Ansicht verschieben), <b>W</b> = Move („<b>W</b>eg“), <b>E</b> = Rotate („dr<b>E</b>hen“), <b>R</b> = Scale („<b>R</b>iesig/winzig“), <b>T</b> = Rect Tool (für UI/2D). Dazu <b>F</b> = „<b>F</b>okus“ auf das gewählte Objekt; rechte Maustaste + WASD = durch die Szene fliegen.` },
  { t: "hint", title: "Typische Prüfungsfalle: Project ≠ Hierarchy", html: `Fragen wie „Wo findest du das Prefab / das Material?“ → <b>Project</b> (Dateien auf der Festplatte, Ordner <code>Assets/</code>). „Wo siehst du alle Objekte der aktuellen Szene?“ → <b>Hierarchy</b>. Und: Der Inspector zeigt bei einem Child <b>lokale</b> Werte, nicht Weltkoordinaten.` },
  { t: "hint", title: "So vermeidest du verzerrte Objekte", html: `Skaliere nie einen Parent ungleichmäßig (z. B. 5, 0.2, 5 für eine Tischplatte), wenn er Children hat. Besser: leeres Parent „Tisch“ mit Scale (1, 1, 1), darunter die sichtbare „Platte“ als Child mit Scale (5, 0.2, 5). Dann bleiben andere Children (Lampe, Tasse) unverzerrt.` }
],

"mmp1-2": [
  { t: "text", h: "Vertiefung: Wie Unity deine Skripte aufruft", levels: {
    simple: `Ein Skript ist wie eine Anleitung, die du einem GameObject an den Gürtel hängst. Unity liest die Anleitung nicht von oben nach unten durch, sondern ruft bestimmte „Termine“ automatisch auf: <b>Awake</b> (aufwachen), <b>Start</b> (Vorhang auf), <b>Update</b> (jedes Bild), <b>FixedUpdate</b> (jeder Physik-Takt). Die Namen müssen exakt stimmen – <code>update()</code> mit kleinem u wird nie aufgerufen. <b>Time.deltaTime</b> ist die Zeit seit dem letzten Bild, damit Bewegungen überall gleich schnell sind.`,
    normal: `<p><b>Klasse und Vererbung:</b> <code>public class Spinner : MonoBehaviour</code> heißt: Spinner <i>ist ein</i> MonoBehaviour und erbt dessen Fähigkeiten (z. B. <code>transform</code>, <code>gameObject</code>, <code>GetComponent</code>, <code>StartCoroutine</code>). Erst dadurch kann das Skript als <b>Komponente</b> an ein GameObject gehängt werden. Jede angehängte Kopie ist ein eigenes Objekt mit eigenen Feldwerten – zwei Würfel mit Spinner können verschiedene <code>speed</code>-Werte haben.</p>
<p><b>Message-Methoden:</b> Start, Update usw. werden <i>nicht</i> mit <code>override</code> überschrieben. Unity sucht beim Laden per Name nach diesen Methoden und ruft sie auf, wenn es sie gibt. Darum sind Tippfehler gefährlich: <code>void start()</code> kompiliert fehlerfrei, wird aber nie ausgeführt.</p>
<p><b>Update vs. FixedUpdate mit Zahlen:</b> FixedUpdate läuft im festen Takt von 0,02 s (50-mal pro Sekunde). Update läuft einmal pro gerendertem Bild. Bei 100 FPS kommt FixedUpdate nur in jedem zweiten Frame dran, bei 25 FPS zweimal pro Frame. Darum: Physik (AddForce) in FixedUpdate, Eingaben und sichtbare Bewegungen ohne Physik in Update.</p>
<p><b>Serialisierung:</b> <code>public</code>-Felder oder <code>[SerializeField] private</code>-Felder speichert Unity mit der Szene. Der Wert im Code (<code>= 90f</code>) ist nur der Startwert beim ersten Anhängen; danach gilt der Inspector-Wert. Änderst du später den Code auf <code>= 200f</code>, bleibt im Inspector 90 stehen.</p>`,
    technical: `<p>Unity-Skripte werden von der C#-Laufzeit kompiliert; MonoBehaviour-Instanzen dürfen nicht mit <code>new</code> erzeugt werden, sondern nur über <code>AddComponent&lt;T&gt;()</code> bzw. Anhängen im Editor. Ablauf je Frame (vereinfacht): FixedUpdate (0…n-mal, bis die Physikzeit aufgeholt ist) → interne Physiksimulation und Trigger/Collision-Callbacks → Input-Verarbeitung → Update → Coroutines (<code>yield return null</code>) → Animator → LateUpdate → Rendering.</p>
<p><code>Time.deltaTime</code> liefert in Update die Frame-Dauer, in FixedUpdate automatisch <code>Time.fixedDeltaTime</code> (0,02 s). <code>Time.time</code> ist die Zeit seit Spielstart; <code>Time.timeScale = 0</code> pausiert alles, was mit deltaTime arbeitet, und auch FixedUpdate. Die Reihenfolge der Skripte untereinander ist nicht garantiert (änderbar über <i>Script Execution Order</i>) – daher in Awake nur eigene Referenzen setzen und erst in Start auf andere Objekte zugreifen.</p>
<p>Häufige Exceptions: <code>NullReferenceException</code> (Feld im Inspector nicht zugewiesen oder <code>GetComponent</code> fand nichts), <code>MissingReferenceException</code> (Objekt wurde zerstört, Referenz besteht noch).</p>` } },
  { t: "example", title: "Ein Theaterabend als Lifecycle", html: `<p>Schauspieler <b>Max</b> (= GameObject mit Skript) spielt heute Abend.</p>
<ul>
<li><b>Awake</b> = 18:00, Max kommt in die Garderobe und zieht sein Kostüm an (eigene Referenzen holen: <code>rb = GetComponent&lt;Rigidbody&gt;()</code>). Das passiert auch, wenn er heute nur Zweitbesetzung ist (Skript deaktiviert, GameObject aktiv).</li>
<li><b>Start</b> = 19:30, Vorhang auf. Jetzt schaut Max, wo seine Partnerin steht (Zugriff auf andere Objekte). Start passiert nur, wenn Max wirklich spielt (Skript aktiv).</li>
<li><b>Update</b> = jeder Augenblick des Stücks: Max reagiert auf das, was gerade passiert (Eingaben prüfen).</li>
<li><b>FixedUpdate</b> = das Metronom des Orchesters: tickt stur alle 0,02 s, egal wie schnell die Szene gerade „läuft“ (Physik).</li>
<li><b>LateUpdate</b> = der Kameramann, der erst schwenkt, nachdem alle Schauspieler ihre Position eingenommen haben.</li>
<li><b>OnDestroy</b> = Max verlässt nach dem Stück das Theater.</li>
</ul>` },
  { t: "example", title: "deltaTime beim Lauf-Tracker", html: `<p><b>Sarah</b> joggt mit 3 m/s. Ihre Lauf-App aktualisiert die Anzeige manchmal 10-mal, manchmal 60-mal pro Sekunde.</p>
<ul>
<li>Ohne deltaTime: Die App würde pro Aktualisierung „+3 m“ rechnen → bei 60 Updates/s zeigt sie 180 m nach einer Sekunde. Falsch!</li>
<li>Mit deltaTime: pro Aktualisierung <code>3 * deltaTime</code>. Bei 60 Updates ist deltaTime ≈ 0,0167 s → 60 · 3 · 0,0167 ≈ 3 m. Bei 10 Updates: 10 · 3 · 0,1 = 3 m. <b>Immer 3 m pro Sekunde.</b></li>
</ul>
<p>In Unity genau so:</p>
<pre><code>public class Jogger : MonoBehaviour
{
    [SerializeField] private float speed = 3f;   // Meter pro Sekunde

    void Update()
    {
        transform.Translate(Vector3.forward * speed * Time.deltaTime);
    }
}</code></pre>
<p><code>speed</code> = Sarahs Tempo, <code>Time.deltaTime</code> = Zeit seit der letzten Aktualisierung, <code>Translate</code> = der zurückgelegte Weg in diesem Moment.</p>` },
  { t: "hint", title: "Eselsbrücke: „A-O-S, dann F-U-L“", html: `Einmalig: <b>A</b>wake → <b>O</b>nEnable → <b>S</b>tart („erst aufwachen, dann einschalten, dann starten“). Laufend: <b>F</b>ixedUpdate (Physik-Metronom) · <b>U</b>pdate (jedes Bild) · <b>L</b>ateUpdate (zuletzt, Kamera). Merksatz: „<b>F</b>orce in <b>F</b>ixed“ – AddForce gehört in FixedUpdate.` },
  { t: "hint", title: "Typische Prüfungsfalle: Inspector schlägt Code", html: `Du änderst im Code <code>public float speed = 5f;</code> auf <code>10f</code>, aber der Würfel bleibt langsam? Der im Inspector gespeicherte Wert (5) gewinnt. Lösung: im Inspector ändern oder über das Drei-Punkte-Menü der Komponente <b>Reset</b> wählen. Ebenso: Klassenname ≠ Dateiname → Skript lässt sich nicht anhängen.` },
  { t: "hint", title: "Debug.Log richtig nutzen", html: `Wenn etwas „nicht passiert“, setze <code>Debug.Log("Start läuft auf " + name);</code> an den Anfang der Methode. Erscheint nichts in der Console, wird die Methode gar nicht aufgerufen (Tippfehler im Namen, Skript nicht angehängt, Objekt inaktiv). Mit <code>Debug.Log("…", this)</code> markiert ein Klick auf die Meldung das betroffene Objekt in der Hierarchy.` }
],

/* ===================== Kapitel 2: Objekte, Licht, Animation ===================== */

"mmp2-1": [
  { t: "text", h: "Vertiefung: Prefab, Instanz und Referenz – wer kennt wen?", levels: {
    simple: `Ein <b>Prefab</b> ist wie eine Keksform: Einmal gebaut, kannst du daraus beliebig viele gleiche Kekse ausstechen (<code>Instantiate</code>). Jeder Keks ist danach ein eigenes Objekt, das du einzeln verzieren kannst. Damit ein Skript mit einem anderen Objekt „reden“ kann, braucht es eine <b>Referenz</b> – am einfachsten ziehst du das Objekt im Inspector in ein Feld. <code>Destroy</code> wirft einen Keks weg, <code>SetActive(false)</code> legt ihn nur in die Schublade.`,
    normal: `<p><b>Prefab-Asset vs. Instanz:</b> Das Prefab liegt als <code>.prefab</code>-Datei im Project-Fenster. Ziehst du es in die Szene oder rufst du <code>Instantiate</code> auf, entsteht eine <b>Instanz</b> (in der Hierarchy blau dargestellt). Änderst du das Prefab im Prefab-Modus (Doppelklick), übernehmen alle Instanzen die Änderung. Änderst du nur eine Instanz, ist das ein <b>Override</b> (im Inspector fett markiert) – mit <i>Overrides → Apply All</i> schreibst du ihn ins Prefab zurück.</p>
<p><b>Instantiate liefert die Kopie zurück:</b> <code>GameObject go = Instantiate(prefab, pos, rot);</code> – über <code>go</code> veränderst du die neue Kopie, nicht das Prefab. Ohne Namen heißt die Kopie „Cube(Clone)“. Ist das Feld vom Typ einer Komponente, z. B. <code>public Rigidbody ballPrefab;</code>, liefert Instantiate direkt den Rigidbody der Kopie – praktisch, um sofort <code>AddForce</code> aufzurufen.</p>
<p><b>Referenzen – drei Wege, schnellster zuerst:</b> (1) Inspector-Feld (Drag &amp; Drop, sofort verfügbar), (2) <code>GetComponent&lt;T&gt;()</code> für Komponenten am <i>selben</i> Objekt, <code>GetComponentInChildren&lt;T&gt;()</code> für Kinder, (3) <code>GameObject.Find</code> / <code>FindWithTag</code> – durchsuchen die ganze Szene, darum nur einmal in Start, nie in Update.</p>
<p><b>Aus- und Abschalten:</b> <code>go.SetActive(false)</code> schaltet das ganze Objekt samt Kindern ab (unsichtbar, keine Updates, keine Kollisionen). <code>component.enabled = false</code> schaltet nur eine Komponente ab (z. B. nur das Licht, das Objekt bleibt). <code>Destroy(go)</code> entfernt endgültig – allerdings erst am Ende des aktuellen Frames.</p>`,
    technical: `<p><code>Instantiate</code> ist eine statische Methode von <code>UnityEngine.Object</code> mit Überladungen: <code>Instantiate(original)</code>, <code>Instantiate(original, parent)</code>, <code>Instantiate(original, position, rotation)</code>, <code>Instantiate(original, position, rotation, parent)</code>. Sie ist generisch (<code>T Instantiate&lt;T&gt;(T original) where T : Object</code>) und klont das gesamte GameObject inkl. Children; bei der Kopie laufen sofort Awake und OnEnable, Start erst vor ihrem ersten Update.</p>
<p><code>activeSelf</code> gibt den eigenen Schalter zurück, <code>activeInHierarchy</code> berücksichtigt auch inaktive Vorfahren. Zerstörte Objekte vergleichen sich in Unity mit <code>null</code> als gleich (überladener <code>==</code>-Operator), daher funktioniert <code>if (target != null)</code> auch nach <code>Destroy</code>; der C#-Operator <code>?.</code> umgeht diese Überladung und sollte bei Unity-Objekten vermieden werden.</p>
<p>Performance: Häufiges Instantiate/Destroy erzeugt Garbage und Ladespitzen. Object Pooling (Objekte deaktivieren und wiederverwenden, seit Unity 2021 mit <code>UnityEngine.Pool.ObjectPool&lt;T&gt;</code>) vermeidet das.</p>` } },
  { t: "example", title: "Flipper-Automat: Kugeln aus dem Prefab", html: `<p><b>Jonas</b> baut einen Flipper. Pro Spiel gibt es 3 Kugeln; jede neue Kugel wird an der Abschussrampe erzeugt.</p>
<pre><code>using UnityEngine;

public class BallLauncher : MonoBehaviour
{
    public Rigidbody ballPrefab;      // Prefab "Ball" mit Rigidbody hineinziehen
    public Transform launchPoint;     // leeres GameObject an der Rampe
    public float launchImpulse = 12f;
    private int ballsLeft = 3;

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Space) &amp;&amp; ballsLeft &gt; 0)
        {
            Rigidbody ball = Instantiate(ballPrefab, launchPoint.position, Quaternion.identity);
            ball.name = "Ball_" + ballsLeft;
            ball.AddForce(launchPoint.forward * launchImpulse, ForceMode.Impulse);
            ballsLeft--;
            Destroy(ball.gameObject, 30f);   // nach 30 s aufräumen
        }
    }
}</code></pre>
<p>Zuordnung: <b>Prefab</b> = die Kugel-Vorlage im Lager, <b>Instantiate</b> = eine neue Kugel kommt aus dem Magazin, <b>Referenz</b> <code>launchPoint</code> = Jonas sagt dem Skript, wo die Rampe ist, <b>Destroy</b> = die Kugel fällt ins Aus. Ein einmaliger Impuls darf hier in Update stehen – nur dauerhafte Kräfte gehören zwingend in FixedUpdate.</p>` },
  { t: "example", title: "WG-Kühlschrank: SetActive vs. Destroy", html: `<p>In der WG von <b>Mia</b> und <b>Paul</b> steht ein Kühlschrank (Parent) mit Fächern (Children).</p>
<ul>
<li><code>kuehlschrank.SetActive(false)</code> = Stecker ziehen und Tür zu: Alles darin ist „aus“, aber noch da. <code>SetActive(true)</code> und alles ist wieder wie vorher.</li>
<li><code>kuehlschrank.GetComponent&lt;Light&gt;().enabled = false</code> = nur das Innenlicht aus – das Kühlen (andere Komponenten) läuft weiter.</li>
<li><code>Destroy(joghurt)</code> = Paul isst den Joghurt: endgültig weg. Wer danach noch <code>joghurt.transform</code> verwendet, bekommt eine <code>MissingReferenceException</code>.</li>
</ul>
<p>Darum deaktiviert man in Roll-a-Ball eingesammelte Pickups nur (<code>SetActive(false)</code>): Für einen Neustart könnte man sie einfach wieder aktivieren.</p>` },
  { t: "hint", title: "Eselsbrücke: Form → Keks → Teller", html: `<b>Prefab</b> = Keksform (Project), <b>Instanz</b> = Keks (Hierarchy), <b>Parent</b> beim Instantiate = der Teller, auf den der Keks gelegt wird. Wer das Prefab statt der Kopie verändert (<code>prefab.transform.position = …</code>), ändert die Form – nicht den Keks!` },
  { t: "hint", title: "Typische Prüfungsfalle: Find in Update", html: `<code>GameObject.Find("Player")</code> in jedem Frame durchsucht jedes Mal die ganze Szene und findet inaktive Objekte gar nicht. Lösung: Referenz einmal in <code>Start()</code> holen und in einem Feld speichern – oder gleich per Inspector zuweisen.` },
  { t: "hint", title: "So löst du „Erzeuge N Objekte im Raster“-Aufgaben", html: `Zwei verschachtelte <code>for</code>-Schleifen (x und z), Position = Index · Abstand, z. B. <code>new Vector3(x * 1.5f, 0.5f, z * 1.5f)</code>. Y = 0.5 bei Würfeln der Größe 1, damit sie <i>auf</i> dem Boden stehen. Zum Zentrieren ziehst du <code>(size - 1) * spacing / 2f</code> von x und z ab.` }
],

"mmp2-2": [
  { t: "text", h: "Vertiefung: Wie aus Licht und Material ein Bild entsteht", levels: {
    simple: `Was du am Bildschirm siehst, ist immer das Zusammenspiel von <b>Licht</b> (woher kommt es, wie hell, welche Farbe?) und <b>Material</b> (wie reagiert die Oberfläche darauf?). Ein rotes Material unter blauem Licht wirkt fast schwarz – genau wie ein rotes T-Shirt in einer Disco mit blauem Licht. Ohne Licht ist die Szene dunkel, außer ein Material leuchtet selbst (<b>Emission</b>).`,
    normal: `<p><b>Lichteigenschaften:</b> <code>intensity</code> (Helligkeit), <code>color</code>, <code>range</code> (Point/Spot: Reichweite in Metern, an der Grenze ist das Licht null), <code>spotAngle</code> (Spot: Öffnungswinkel des Kegels in Grad), <code>shadows</code> (None, Hard, Soft). Beim Directional Light zählt nur die Rotation: eine Rotation von (50, -30, 0) heißt „Sonne kommt schräg von oben“; (90, 0, 0) = Mittag, Licht senkrecht von oben; (-10, 0, 0) = Sonne unter dem Horizont.</p>
<p><b>Neben den Lichtquellen</b> gibt es <b>Umgebungslicht</b> (Ambient/Environment Lighting, meist von der Skybox): Es hellt auch Schattenseiten auf, damit sie nicht pechschwarz sind. <b>Realtime</b>-Licht wird jeden Frame berechnet (bewegbar, per Code steuerbar, kostet Leistung). <b>Baked</b> wird vorab in Lightmaps „eingebrannt“ (schnell, aber im Spiel nicht veränderbar). <b>Mixed</b> kombiniert beides.</p>
<p><b>Material-Eigenschaften:</b> Base Color/Albedo (Grundfarbe, ggf. Textur), <b>Metallic</b> (0 = Kunststoff/Holz, 1 = Metall, spiegelt die Umgebung), <b>Smoothness</b> (0 = matt wie Papier, 1 = glatt wie Lack – kleiner, scharfer Glanzpunkt), <b>Emission</b> (Eigenleuchten, beleuchtet aber ohne Baking/Post-Processing andere Objekte nicht). Das Material hängt am <b>MeshRenderer</b>; der <b>Shader</b> legt fest, welche Eigenschaften es überhaupt gibt.</p>`,
    technical: `<p>Unity rendert je nach Projekt mit der <b>Built-in Render Pipeline</b> (Shader „Standard“) oder der <b>Universal Render Pipeline</b> (URP, Shader „Universal Render Pipeline/Lit“). Die Property-Namen unterscheiden sich: Built-in <code>_Color</code>/<code>_MainTex</code>, URP <code>_BaseColor</code>/<code>_BaseMap</code>. <code>material.color</code> funktioniert in beiden, weil URP Lit <code>_BaseColor</code> als Haupt-Farbe markiert; allgemein: <code>material.SetColor("_BaseColor", c)</code>.</p>
<p>Emission per Code: <code>mat.EnableKeyword("_EMISSION"); mat.SetColor("_EmissionColor", Color.yellow * 2f);</code> – Werte über 1 erzeugen mit Bloom einen Glow. Physikalisch basiertes Rendering (PBR) berechnet pro Pixel diffusen und spiegelnden Anteil aus Normale, Lichtrichtung, Blickrichtung sowie Metallic/Smoothness. Jedes zusätzliche Echtzeitlicht mit Schatten erhöht die Render-Kosten (Shadow-Map-Pass); in URP Forward ist die Zahl der Lichter pro Objekt begrenzt (einstellbar im URP-Asset).</p>` } },
  { t: "example", title: "Lichtschalter im Wohnzimmer", html: `<p><b>Anna</b> baut für Aufgabe 1 ein 3D-Wohnzimmer. Klickt man auf den Schalter an der Wand, geht die Deckenlampe (Point Light) an oder aus, und der Lampenschirm leuchtet mit.</p>
<pre><code>using UnityEngine;

public class LightSwitch : MonoBehaviour   // am Schalter-Objekt (mit Collider!)
{
    public Light ceilingLamp;              // Point Light hineinziehen
    public Renderer lampShade;             // Lampenschirm mit Emission-Material
    private bool isOn = true;

    void OnMouseDown()
    {
        isOn = !isOn;
        ceilingLamp.enabled = isOn;
        if (isOn)
        {
            lampShade.material.EnableKeyword("_EMISSION");
            lampShade.material.SetColor("_EmissionColor", new Color(1f, 0.9f, 0.6f) * 1.5f);
        }
        else
        {
            lampShade.material.DisableKeyword("_EMISSION");
        }
    }
}</code></pre>
<p>Zuordnung: <b>Schalter</b> = GameObject mit Collider (damit <code>OnMouseDown</code> funktioniert), <b>Glühbirne</b> = Light-Komponente (<code>enabled</code> = Strom an/aus), <b>leuchtender Lampenschirm</b> = Material-Emission. Dass der Raum dunkel wird, aber nicht schwarz, liegt am Umgebungslicht. Hinweis: <code>OnMouseDown</code> nutzt den klassischen Input Manager (Active Input Handling „Both“ oder „Input Manager“).</p>` },
  { t: "example", title: "Bühnenbeleuchtung im Theater", html: `<p>Beleuchter <b>Ömer</b> leuchtet die Theaterbühne aus – jede Lampe entspricht einem Unity-Light-Type:</p>
<ul>
<li><b>Directional Light</b> = das „Tageslicht“ durch das gemalte Fenster der Kulisse: kommt überall gleich schräg an, egal wo man steht.</li>
<li><b>Spot Light</b> = der Verfolgerscheinwerfer auf die Hauptdarstellerin: <code>spotAngle = 20</code> (schmaler Kegel), <code>range = 25</code>.</li>
<li><b>Point Light</b> = die Kerze auf dem Tisch: leuchtet rundum, nach 3 m (<code>range = 3</code>) ist ihr Licht weg.</li>
<li><b>Ambient Light</b> = das Streulicht im Saal, das verhindert, dass Schatten pechschwarz sind.</li>
</ul>
<p>Bei einem Szenenwechsel dimmt Ömer langsam ab – in Unity: <code>spot.intensity = Mathf.MoveTowards(spot.intensity, 0f, 2f * Time.deltaTime);</code> in Update (2 Intensitätseinheiten pro Sekunde).</p>` },
  { t: "hint", title: "Eselsbrücke: Sonne, Birne, Taschenlampe", html: `<b>D</b>irectional = <b>D</b>ie Sonne (nur Richtung zählt, Position egal). <b>P</b>oint = <b>P</b>unkt, von dem aus eine Glühbirne rundum strahlt (mit range). <b>S</b>pot = <b>S</b>cheinwerfer/Taschenlampe (Kegel, spotAngle + range). Area = Leuchtpaneel/Fenster (meist nur gebacken).` },
  { t: "hint", title: "Typische Prüfungsfalle: material vs. sharedMaterial", html: `<code>renderer.material.color = Color.red;</code> färbt <b>nur dieses</b> Objekt (Unity legt eine Kopie des Materials an). <code>renderer.sharedMaterial.color = Color.red;</code> färbt <b>alle</b> Objekte mit diesem Material – und ändert im Editor sogar die Asset-Datei dauerhaft.` },
  { t: "hint", title: "Szene zu dunkel? Checkliste", html: `1) Gibt es überhaupt ein Licht und ist es aktiv? 2) Zeigt das Directional Light nach unten (X-Rotation positiv, z. B. 50)? 3) Intensity &gt; 0, bei Point/Spot ist range groß genug? 4) Window → Rendering → Lighting: Environment-Licht/Skybox gesetzt? 5) Material nicht schwarz oder Metallic = 1 ohne Umgebung zum Spiegeln?` }
],

"mmp2-3": [
  { t: "text", h: "Vertiefung: Interpolation – das Geheimnis jeder Animation", levels: {
    simple: `Jede Animation funktioniert wie ein Daumenkino: Du legst ein paar wichtige Bilder fest (<b>Keyframes</b>), und der Computer zeichnet die Bilder dazwischen (<b>Interpolation</b>). Im Editor machst du das mit dem Animation-Fenster, im Code mit <code>Vector3.Lerp</code>: „Gehe einen bestimmten Anteil des Weges von A nach B.“ Bei t = 0 bist du bei A, bei t = 1 bei B, bei t = 0,5 genau in der Mitte.`,
    normal: `<p><b>Lerp mit Zahlen:</b> <code>Vector3.Lerp(a, b, t) = a + (b − a) · t</code>. Von a = (0, 0, 0) nach b = (10, 0, 0): t = 0,25 → (2,5; 0; 0). In einer Coroutine erhöhst du t pro Frame um <code>Time.deltaTime / dauer</code>: Bei 2 s Dauer und 50 FPS wächst t pro Frame um 0,01 → nach 100 Frames = 2 s ist t = 1.</p>
<p><b>Easing:</b> Lineare Bewegung wirkt mechanisch. <code>Mathf.SmoothStep(0, 1, t)</code> macht daraus „langsam anfahren, langsam abbremsen“. Noch flexibler ist ein <code>public AnimationCurve curve;</code>-Feld: Du zeichnest die Kurve im Inspector und rechnest mit <code>curve.Evaluate(t)</code>.</p>
<p><b>Animator-State-Machine:</b> Ein <b>State</b> spielt einen Clip ab. Vom <i>Entry</i> geht es in den orange markierten Default-State. <b>Transitions</b> (Pfeile) haben Bedingungen auf <b>Parameter</b>. <i>Has Exit Time</i> = der Übergang wartet, bis der Clip einen bestimmten Punkt erreicht hat; <i>Transition Duration</i> = Überblendzeit zwischen zwei Clips. <i>Any State</i> erlaubt Übergänge aus jedem Zustand (z. B. „Hinfallen“).</p>
<p><b>Coroutine:</b> Eine Methode mit Rückgabetyp <code>IEnumerator</code>, die bei <code>yield return</code> pausiert und später weiterläuft – ideal für Abläufe über Zeit („3 Sekunden fahren, 1 Sekunde warten, zurückfahren“), ohne dass du dafür Zähler in Update brauchst.</p>`,
    technical: `<p>Ein <code>AnimationClip</code> speichert pro animierter Eigenschaft (z. B. <code>m_LocalPosition.y</code>) eine Kurve aus Keyframes mit Tangenten; zwischen Keyframes wird per kubischer Hermite-Interpolation gerechnet (Tangentenmodi Auto, Linear, Constant usw.). Der <code>Animator</code> wertet nach Update und vor LateUpdate aus und <b>überschreibt</b> alle animierten Eigenschaften – darum werden Transform-Änderungen aus Update auf animierten Properties wirkungslos.</p>
<p>Parameter-API: <code>SetBool</code>, <code>SetFloat</code>, <code>SetInteger</code>, <code>SetTrigger</code>/<code>ResetTrigger</code>; schneller mit gecachten Hashes <code>Animator.StringToHash("isOpen")</code>. Trigger bleiben gesetzt, bis eine Transition sie konsumiert. Coroutines laufen nach Update; <code>yield return new WaitForSeconds(t)</code> respektiert <code>Time.timeScale</code>, <code>WaitForSecondsRealtime</code> nicht. <code>StopCoroutine</code>/<code>StopAllCoroutines</code> beenden sie; beim Deaktivieren des GameObjects enden sie automatisch.</p>
<p>Anti-Pattern: <code>transform.position = Vector3.Lerp(transform.position, target, 0.1f);</code> pro Frame – das ist kein lineares Lerp, sondern exponentielles Annähern (jedes Frame 10 % des Restwegs), framerate-abhängig und erreicht das Ziel nie exakt.</p>` } },
  { t: "example", title: "Das Daumenkino der Musik-App", html: `<p><b>Lisa</b> animiert für ihr Projekt eine Schallplatte, die sich beim Abspielen dreht und dabei sanft auf den Plattenteller sinkt.</p>
<ul>
<li><b>Keyframe 1</b> (0 s): Platte bei Y = 1,0 (schwebt).</li>
<li><b>Keyframe 2</b> (1 s): Platte bei Y = 0,1 (liegt auf).</li>
<li>Bei 0,5 s berechnet Unity selbst ungefähr Y = 0,55 – das ist die <b>Interpolation</b> (Zwischenbilder des Daumenkinos).</li>
</ul>
<p>Das Drehen macht sie per Code, weil es endlos und per Button steuerbar sein soll:</p>
<pre><code>using System.Collections;
using UnityEngine;

public class Record : MonoBehaviour
{
    public float rpm = 33f;          // Umdrehungen pro Minute
    private bool spinning;

    void Update()
    {
        if (spinning)
            transform.Rotate(0f, rpm * 6f * Time.deltaTime, 0f);   // 33 U/min = 198 Grad/s
    }

    public void PlayPressed() { StartCoroutine(SpinUp()); }

    IEnumerator SpinUp()
    {
        yield return new WaitForSeconds(1f);   // erst ablegen (Clip dauert 1 s)
        spinning = true;
    }
}</code></pre>
<p>Rechnung: 1 Umdrehung = 360°, pro Sekunde 33/60 Umdrehungen → 33 · 360 / 60 = 33 · 6 = 198 °/s. Damit sich Clip (Y-Position) und Skript (Rotation) nicht stören, animiert der Clip nur die Position, das Skript nur die Drehung.</p>` },
  { t: "example", title: "Garagentor als State Machine", html: `<p><b>Familie Huber</b> hat ein automatisches Garagentor. Im Animator von <b>Felix</b>' Szene:</p>
<ul>
<li><b>States</b>: „Zu“ (Default), „Öffnet“ (Clip 3 s), „Offen“, „Schließt“.</li>
<li><b>Parameter</b>: Trigger <code>Remote</code> (Fernbedienung gedrückt).</li>
<li><b>Transitions</b>: Zu → Öffnet bei <code>Remote</code> (Has Exit Time aus, sonst reagiert das Tor verzögert); Öffnet → Offen mit Has Exit Time = 1 (wenn der Clip fertig ist); Offen → Schließt bei <code>Remote</code>; Schließt → Zu nach Clip-Ende.</li>
</ul>
<p>Code an der Fernbedienung: <code>if (Input.GetKeyDown(KeyCode.G)) garageAnimator.SetTrigger("Remote");</code></p>
<p>Zuordnung: Das Tor kann immer nur <i>einen</i> Zustand haben – genau das garantiert die State Machine. Der Knopfdruck ist ein <b>Trigger</b> (einmaliges Ereignis), „Licht in der Garage an“ wäre eher ein <b>Bool</b>.</p>` },
  { t: "hint", title: "Eselsbrücke: Lerp = „Lauf ein Prozent“", html: `<b>Lerp(a, b, t)</b> heißt: „Von a nach b, und zwar t Prozent des Weges“ (t als 0…1). t = 0 → Start, t = 1 → Ziel. Für eine Bewegung mit fester Dauer: <code>t += Time.deltaTime / dauer;</code> – nach genau <i>dauer</i> Sekunden ist t = 1.` },
  { t: "hint", title: "Typische Prüfungsfalle: Animator blockiert Code", html: `Ein Objekt mit Animator lässt sich per Code nicht mehr verschieben? Der Animator überschreibt animierte Eigenschaften jeden Frame. Lösung: leeres <b>Parent</b>-Objekt per Code bewegen, Child animieren – oder die Animation nur auf Eigenschaften anwenden, die der Code nicht anfasst. Und: Coroutines immer mit <code>StartCoroutine(...)</code> starten.` },
  { t: "hint", title: "Animation oder Code? Entscheidungshilfe", html: `<b>Editor-Animation</b>, wenn die Bewegung immer gleich ist und „schön“ aussehen soll (Tür, Begrüßungsanimation, Kamerafahrt). <b>Code</b>, wenn sie von Werten abhängt (Ziel wird zur Laufzeit gewählt, Geschwindigkeit per Slider, endlose Drehung). Oft kombiniert: Code setzt nur Parameter des Animators.` }
],

/* ===================== Kapitel 3: Interaktion, Medien, UI ===================== */

"mmp3-1": [
  { t: "text", h: "Vertiefung: Vom Tastendruck bis zum getroffenen 3D-Objekt", levels: {
    simple: `Unity fragt in jedem Bild nach: Welche Tasten sind gedrückt? Wo ist die Maus? Gibt es Finger auf dem Bildschirm? Die Maus kennt aber nur <b>Bildschirm-Pixel</b> (z. B. x = 800, y = 450), deine Objekte stehen in der <b>3D-Welt</b>. Um herauszufinden, worauf geklickt wurde, schießt Unity einen unsichtbaren Laserstrahl (<b>Raycast</b>) von der Kamera durch den Mauspunkt in die Szene. Das erste Objekt mit Collider, das der Strahl trifft, ist das angeklickte.`,
    normal: `<p><b>Bildschirmkoordinaten:</b> <code>Input.mousePosition</code> ist in Pixeln, Ursprung (0, 0) <b>links unten</b>, rechts oben = (<code>Screen.width</code>, <code>Screen.height</code>). Bei einem Full-HD-Fenster liegt die Mitte bei (960, 540).</p>
<p><b>Raycast in vier Schritten:</b> (1) <code>Camera.main.ScreenPointToRay(Input.mousePosition)</code> baut einen Strahl: Startpunkt an der Kamera, Richtung durch den Pixel. (2) <code>Physics.Raycast(ray, out RaycastHit hit, 100f)</code> verfolgt ihn max. 100 m. (3) Rückgabe <code>true</code>, wenn etwas getroffen wurde. (4) <code>hit</code> enthält <code>hit.collider</code> (was), <code>hit.point</code> (wo, Weltkoordinate), <code>hit.distance</code> (wie weit), <code>hit.normal</code> (Ausrichtung der Oberfläche).</p>
<p><b>GetAxis-Glättung:</b> Bei Tastatur steigt der Wert nicht sofort auf 1, sondern mit „Sensitivity“ 3 Einheiten pro Sekunde – nach ca. 0,33 s ist er bei 1, beim Loslassen fällt er mit „Gravity“ 3 wieder ab. Das ergibt weiches Anfahren. <code>GetAxisRaw</code> springt sofort auf −1/0/1 (präzise Steuerung, z. B. Jump-and-Run).</p>
<p><b>Touch:</b> Jeder Finger ist ein <code>Touch</code> mit <code>position</code>, <code>deltaPosition</code> und <code>phase</code>: <i>Began</i> (Finger aufgesetzt) → <i>Moved</i>/<i>Stationary</i> → <i>Ended</i> (losgelassen) oder <i>Canceled</i>. Standardmäßig simuliert Unity den ersten Finger zusätzlich als Maus – darum funktionieren <code>GetMouseButtonDown(0)</code> und <code>OnMouseDown</code> auch auf dem Touchscreen.</p>`,
    technical: `<p>Input Manager (alt): Achsen sind in <i>Project Settings → Input Manager</i> konfigurierbar (Name, Positive/Negative Button, Gravity, Dead, Sensitivity, Snap). Input-Zustände werden einmal pro Frame vor Update aktualisiert; <code>GetKeyDown</code> ist genau in diesem einen Frame true. Läuft FixedUpdate in einem Frame 0-mal (hohe FPS), sieht es den Down-Frame nie – daher Eingaben in Update lesen und in Feldern an FixedUpdate übergeben.</p>
<p><code>Physics.Raycast(Ray ray, out RaycastHit hit, float maxDistance, int layerMask)</code>: Der Layermask-Parameter filtert Layer, z. B. <code>LayerMask.GetMask("Clickable")</code>. <code>Physics.RaycastAll</code> liefert alle Treffer (unsortiert). Trigger-Collider werden standardmäßig mitgetroffen (<code>QueryTriggerInteraction</code>). Für 2D-Collider gibt es eigene Methoden (<code>Physics2D</code>).</p>
<p>Input System Package (neu): <code>Keyboard.current</code>, <code>Mouse.current</code>, <code>Touchscreen.current</code> geben direkt Gerätezustände (<code>isPressed</code>, <code>wasPressedThisFrame</code>, <code>wasReleasedThisFrame</code>); abstrakter über <i>Input Actions</i> (Action „Move“ gebunden an WASD, Stick und Pfeiltasten). <code>ScreenPointToRay</code> und Raycasts funktionieren unverändert, nur die Mausposition kommt aus <code>Mouse.current.position.ReadValue()</code>.</p>` } },
  { t: "example", title: "Laserpointer im Hörsaal = Raycast", html: `<p>Professorin <b>Berger</b> zeigt mit einem Laserpointer auf die Projektionsleinwand mit 3D-Modellen.</p>
<ul>
<li><b>Ihre Hand</b> = die Kamera (Startpunkt des Strahls).</li>
<li><b>Die Richtung</b>, in die sie zielt = <code>ScreenPointToRay(Input.mousePosition)</code>.</li>
<li><b>Der rote Punkt</b> = <code>hit.point</code>; <b>das Modell, auf dem er landet</b> = <code>hit.collider.gameObject</code>.</li>
<li>Ein Glasmodell ohne Collider wird vom Laser „durchdrungen“ – der Punkt landet auf dem Objekt dahinter.</li>
</ul>
<pre><code>using UnityEngine;

public class Pointer : MonoBehaviour
{
    public Transform marker;   // kleine rote Kugel ohne Collider

    void Update()
    {
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        if (Physics.Raycast(ray, out RaycastHit hit, 100f))
        {
            marker.position = hit.point;
            if (Input.GetMouseButtonDown(0))
                Debug.Log("Ausgewählt: " + hit.collider.name + " in " + hit.distance.ToString("0.0") + " m");
        }
    }
}</code></pre>
<p>Wichtig: Der Marker selbst hat keinen Collider – sonst würde der Strahl ihn treffen und er „flieht“ auf die Kamera zu.</p>` },
  { t: "example", title: "Fotos wischen am Handy = Touch-Phasen", html: `<p><b>Elif</b> wischt in ihrer Galerie-App nach links zum nächsten Foto. In Unity nachgebaut:</p>
<pre><code>private Vector2 startPos;

void Update()
{
    if (Input.touchCount &gt; 0)
    {
        Touch t = Input.GetTouch(0);
        if (t.phase == TouchPhase.Began) startPos = t.position;     // Finger aufgesetzt
        else if (t.phase == TouchPhase.Ended)                        // Finger gehoben
        {
            float dx = t.position.x - startPos.x;
            if (dx &lt; -100f) Debug.Log("Nächstes Foto");
            else if (dx &gt; 100f) Debug.Log("Vorheriges Foto");
            else Debug.Log("Antippen");
        }
    }
}</code></pre>
<p>Zuordnung: Finger setzt bei x = 900 auf (<b>Began</b>), gleitet (<b>Moved</b>), hebt bei x = 300 ab (<b>Ended</b>) → dx = −600 &lt; −100 → Wisch nach links. Unter 100 Pixel Bewegung zählt es als Tippen. Die 100-Pixel-Schwelle verhindert, dass leichtes Zittern als Wisch erkannt wird.</p>` },
  { t: "hint", title: "Eselsbrücke: Down – Hold – Up", html: `<b>GetKeyDown</b> = Türklingel: einmal „Ding“ beim Drücken. <b>GetKey</b> = Gaspedal: wirkt, solange du drauf stehst. <b>GetKeyUp</b> = Fotoauslöser beim Loslassen. Toggle-Aktionen (Licht an/aus, Pause) immer mit <b>Down</b>, sonst schaltet es bei 60 FPS 60-mal pro Sekunde um.` },
  { t: "hint", title: "Typische Prüfungsfalle: Klick wird nicht erkannt", html: `Checkliste: 1) Hat das Objekt einen <b>Collider</b>? 2) Hat die Kamera den Tag <b>MainCamera</b> (sonst ist <code>Camera.main</code> null)? 3) Liegt ein anderes Objekt (oder UI) davor? 4) Ist im neuen Projekt nur das neue Input System aktiv (Fehler <code>InvalidOperationException</code> bei <code>Input.*</code>)?` },
  { t: "hint", title: "Diagonal zu schnell? Normalisieren!", html: `Mit <code>new Vector3(h, 0, v)</code> ist die Länge diagonal (h = 1, v = 1) √2 ≈ 1,41 – man ist 41 % schneller. Lösung: <code>Vector3.ClampMagnitude(new Vector3(h, 0f, v), 1f)</code> – begrenzt auf Länge 1, behält aber kleine Werte (sanftes Anfahren) bei.` }
],

"mmp3-2": [
  { t: "text", h: "Vertiefung: Klang im Raum und Videos als Textur", levels: {
    simple: `Bei Audio gibt es drei Rollen: die <b>Datei</b> (AudioClip, wie ein Song), den <b>Lautsprecher</b> (AudioSource, hängt an einem Objekt) und das <b>Ohr</b> (AudioListener, meist an der Kamera). Ein 3D-Sound wird leiser, je weiter das Ohr vom Lautsprecher entfernt ist, und kommt von links oder rechts. Ein Video wird Bild für Bild auf eine Fläche „gemalt“ – auf einen Fernseher in der Szene oder auf ein Bild im Menü.`,
    normal: `<p><b>3D-Audio:</b> Mit <code>spatialBlend = 1</code> wird der Sound räumlich. <i>Min Distance</i> (z. B. 1 m): bis dahin volle Lautstärke. <i>Max Distance</i> (z. B. 20 m): ab da wird nicht weiter abgeschwächt. Dazwischen regelt die <i>Volume Rolloff</i>-Kurve: <i>Logarithmic</i> (realistisch, schnell leiser) oder <i>Linear</i> (bei Max Distance genau 0). Links/rechts ergibt sich aus der Position relativ zum Listener.</p>
<p><b>pitch</b> verändert Tempo <i>und</i> Tonhöhe: <code>pitch = 2</code> = doppelt so schnell, eine Oktave höher; <code>pitch = 0.5</code> = halb so schnell, tiefer. Leichte Zufallsvariation (<code>Random.Range(0.9f, 1.1f)</code>) lässt wiederholte Effekte (Schritte, Klicks) natürlicher klingen.</p>
<p><b>Import-Einstellungen eines AudioClips</b> (Inspector der Datei): <i>Load Type</i> „Decompress On Load“ für kurze Effekte (sofort abspielbereit, mehr RAM), „Compressed In Memory“ für mittlere, „Streaming“ für lange Musik (wird während des Abspielens von der Platte gelesen). <i>Compression Format</i>: PCM (unkomprimiert), ADPCM (leicht), Vorbis (stark, gut für Musik).</p>
<p><b>Video intern:</b> Ein Video ist eine Folge von Einzelbildern (Frames). <code>frameRate</code> 30 heißt 30 Bilder pro Sekunde; <code>frameCount</code> = Gesamtzahl; also <code>length = frameCount / frameRate</code>. Der VideoPlayer dekodiert jedes Bild in eine Textur, die dann wie jede andere Textur angezeigt wird. Empfohlenes Format: MP4 mit H.264-Video und AAC-Audio – das unterstützen alle Plattformen.</p>`,
    technical: `<p>Pro Szene genau ein aktiver <code>AudioListener</code> (bei zwei gibt Unity eine Warnung aus). <code>AudioSource.Play()</code> startet den zugewiesenen <code>clip</code> neu (bricht ihn ab, falls er schon läuft); <code>PlayOneShot(clip, volumeScale)</code> mischt zusätzliche Instanzen dazu, die sich mit <code>Stop()</code> nicht einzeln steuern lassen. <code>AudioSource.PlayClipAtPoint(clip, pos)</code> erzeugt intern ein temporäres GameObject, das nach dem Clip zerstört wird. <code>isPlaying</code> ist auch nach <code>Pause()</code> false – Pausenzustand daher selbst in einem bool merken.</p>
<p><code>VideoPlayer</code>: <code>Prepare()</code> lädt asynchron; danach <code>isPrepared</code> und Event <code>prepareCompleted</code>. Weitere Events: <code>started</code>, <code>loopPointReached</code> (Ende, auch ohne Loop), <code>errorReceived</code>, <code>seekCompleted</code>. Positionierung über <code>time</code> (Sekunden, double) oder <code>frame</code> (long). <code>skipOnDrop = true</code> überspringt Frames, damit das Video synchron zur Zeit bleibt. Bei <code>audioOutputMode = AudioSource</code> wird die Tonspur über <code>SetTargetAudioSource(0, source)</code> an eine AudioSource geleitet (dann auch 3D-Ton möglich, z. B. ein Fernseher im Raum).</p>` } },
  { t: "example", title: "Die eigene Musik-Player-App", html: `<p><b>David</b> baut einen Mini-Spotify: Playlist, nächster Titel, Pause. Zuordnung: <b>Playlist</b> = Array von AudioClips, <b>Lautsprecher</b> = AudioSource (2D, <code>spatialBlend = 0</code>), <b>Kopfhörer</b> = AudioListener an der Kamera.</p>
<pre><code>using UnityEngine;

public class MusicPlayer : MonoBehaviour
{
    public AudioSource source;       // Play On Awake aus, Loop aus
    public AudioClip[] playlist;
    private int index = 0;
    private bool paused = false;

    void Start() { PlayTrack(0); }

    void Update()
    {
        // Titel zu Ende (nicht pausiert) -&gt; automatisch weiter
        if (!source.isPlaying &amp;&amp; !paused) Next();

        if (Input.GetKeyDown(KeyCode.Space)) TogglePause();
        if (Input.GetKeyDown(KeyCode.RightArrow)) Next();
    }

    void PlayTrack(int i)
    {
        index = i;
        source.clip = playlist[index];
        source.Play();
        Debug.Log("Jetzt läuft: " + source.clip.name);
    }

    public void Next() { PlayTrack((index + 1) % playlist.Length); }   // nach dem letzten wieder der erste

    public void TogglePause()
    {
        if (paused) source.UnPause(); else source.Pause();
        paused = !paused;
    }
}</code></pre>
<p>Der <code>paused</code>-Merker ist nötig, weil <code>isPlaying</code> auch bei Pause false ist – sonst würde Pause sofort zum nächsten Titel springen. Bei 4 Titeln: Index 3 → (3 + 1) % 4 = 0, die Playlist beginnt von vorne.</p>` },
  { t: "example", title: "Theater-Ton: 2D-Musik und 3D-Effekte", html: `<p>Tontechnikerin <b>Clara</b> betreut die Vorstellung:</p>
<ul>
<li><b>Hintergrundmusik</b> aus den Saallautsprechern hört jeder gleich laut, egal wo er sitzt → AudioSource mit <code>spatialBlend = 0</code> (2D), <code>loop = true</code>.</li>
<li><b>Die Kirchenglocke</b> läutet hinten links auf der Bühne → <code>spatialBlend = 1</code>, Min Distance 2 m, Max Distance 30 m: Zuschauer in Reihe 1 hören sie laut von links, in Reihe 20 leise.</li>
<li><b>Der Zuschauer</b> = AudioListener. In Unity sitzt er an der Kamera; bewegt sich die Kamera, verändert sich die Klangposition.</li>
<li><b>Der Fernseher auf der Bühne</b> zeigt eine Nachrichtensendung = VideoPlayer mit Render Mode <i>Material Override</i> auf dem Bildschirm-Mesh; der Ton geht über eine 3D-AudioSource am Fernseher.</li>
</ul>` },
  { t: "hint", title: "Eselsbrücke: Clip – Source – Listener", html: `<b>C</b>lip = <b>C</b>D (der Inhalt), <b>S</b>ource = <b>S</b>peaker (wo es herkommt), <b>L</b>istener = <b>L</b>auscher (das Ohr, nur einer pro Szene). Ohne Listener hört man nichts, mit zwei gibt es eine Warnung.` },
  { t: "hint", title: "Typische Prüfungsfalle: Sound bricht beim Einsammeln ab", html: `Hängt die AudioSource am Pickup und du rufst direkt danach <code>SetActive(false)</code> oder <code>Destroy</code> auf, verstummt der Sound sofort. Lösung: <code>AudioSource.PlayClipAtPoint(clip, transform.position);</code> oder den Sound über eine AudioSource am Spieler/Game-Manager abspielen.` },
  { t: "hint", title: "Play vs. PlayOneShot – wann was?", html: `<b>Play()</b>: genau ein Clip pro Source, steuerbar (Pause, Stop, time) – für Musik und Dialoge. <b>PlayOneShot(clip)</b>: viele kurze Effekte übereinander (Klicks, Münzen), nicht einzeln stoppbar. Zweimal schnell <code>Play()</code> = der erste Sound wird abgeschnitten.` }
],

"mmp3-3": [
  { t: "text", h: "Vertiefung: Canvas, Rect Transform und der Weg eines Klicks", levels: {
    simple: `Das UI liegt wie eine durchsichtige Folie über dem Spiel (<b>Canvas</b>). Darauf klebst du Buttons, Slider und Texte. Damit sie auf jedem Bildschirm an der richtigen Stelle bleiben, gibst du jedem Element einen <b>Anker</b>: „Ich gehöre in die untere Mitte“ – egal ob Handy oder großer Monitor. Klickt man auf einen Button, gibt das <b>EventSystem</b> den Klick weiter, und der Button ruft deine Methode auf.`,
    normal: `<p><b>Canvas Render Modes:</b> <i>Screen Space – Overlay</i>: UI liegt immer obenauf, unabhängig von der Kamera (Standard für Menüs und Player-Steuerung). <i>Screen Space – Camera</i>: UI wird in festem Abstand vor einer Kamera gezeichnet (Post-Effekte wirken mit). <i>World Space</i>: UI ist ein Objekt in der 3D-Welt (z. B. ein Bildschirm an der Wand, Namensschild über einer Figur).</p>
<p><b>Rect Transform:</b> Statt Position hat ein UI-Element <b>Anchors</b> (Bezugspunkte im Parent, 0…1), <b>Pivot</b> (eigener Drehpunkt, 0…1) und Abstände in Pixeln. Anchor unten-mitte (0,5 / 0) + Pos Y = 40 → das Element sitzt immer 40 px über dem unteren Rand, horizontal mittig. Ziehen sich die Anchors auseinander (Min 0, Max 1), wird das Element <b>gestreckt</b> – z. B. eine Zeitleiste, die immer die volle Breite einnimmt (Left/Right = Abstand zum Rand).</p>
<p><b>Canvas Scaler</b> „Scale With Screen Size“ mit Referenzauflösung 1920 × 1080: Auf einem 3840 × 2160-Monitor wird alles doppelt so groß gezeichnet, auf 1280 × 720 auf zwei Drittel – Proportionen bleiben gleich.</p>
<p><b>Zeichenreihenfolge:</b> Was in der Hierarchy <i>weiter unten</i> steht, wird <i>später</i> gezeichnet und liegt damit oben. Das Video-RawImage gehört also nach oben in die Liste, die Buttons darunter.</p>
<p><b>Weg eines Klicks:</b> EventSystem (verwaltet Eingaben) → GraphicRaycaster am Canvas (welches UI-Element liegt unter dem Zeiger?) → oberstes Element mit <i>Raycast Target</i> ✓ bekommt den Klick → Button feuert <code>onClick</code> → alle registrierten Methoden laufen.</p>`,
    technical: `<p><code>Button.onClick</code> ist ein <code>UnityEvent</code>, <code>Slider.onValueChanged</code> ein <code>UnityEvent&lt;float&gt;</code>. Im Inspector verknüpfte Methoden müssen <code>public</code> sein (bei Slider: <i>Dynamic float</i> wählen, damit der Wert übergeben wird). Per Code: <code>AddListener(Methode)</code> / <code>RemoveListener</code>; Lambdas sind möglich: <code>muteButton.onClick.AddListener(() =&gt; videoPlayer.SetDirectAudioMute(0, true));</code></p>
<p>Ein Slider hat <code>minValue</code>, <code>maxValue</code>, <code>wholeNumbers</code>; <code>SetValueWithoutNotify</code> setzt den Wert ohne Event. Für „Ziehen beginnt/endet“ (Video während des Scrubbens pausieren) implementiert man an einem Skript am Slider die Interfaces <code>IPointerDownHandler</code>/<code>IPointerUpHandler</code> aus <code>UnityEngine.EventSystems</code>. Unsichtbare Images mit Raycast Target ✓ blockieren Klicks auf darunterliegende Elemente – Raycast Target bei reinen Deko-Elementen deaktivieren. <code>CanvasGroup</code> (<code>alpha</code>, <code>interactable</code>, <code>blocksRaycasts</code>) blendet ganze Bedienleisten ein/aus.</p>
<p>Architektur: Der <code>VideoPlayer</code> ist das <b>Modell</b> (Zustand: time, isPlaying), die UI-Elemente sind die <b>View</b>, das Skript <code>VideoControls</code> ist der <b>Controller</b>, der beide verbindet (MVC-Prinzip).</p>` } },
  { t: "example", title: "Netflix-Leiste im Eigenbau", html: `<p><b>Kevin</b> und <b>Nora</b> bauen eine Bedienleiste wie bei einer Streaming-App:</p>
<ul>
<li><b>Bildfläche</b> = RawImage, Anchors gestreckt (Min 0/0, Max 1/1) → füllt immer den ganzen Bildschirm.</li>
<li><b>Bedienleiste</b> = Panel unten, Anchor Min (0, 0), Max (1, 0), Höhe 120 px → immer volle Breite, klebt am unteren Rand.</li>
<li><b>Play/Pause</b> = Button links in der Leiste, <b>Zeitleiste</b> = Slider gestreckt dazwischen, <b>„02:05 / 45:00“</b> = TextMeshPro rechts.</li>
<li>Nach 3 s ohne Mausbewegung blenden sie die Leiste mit <code>canvasGroup.alpha = 0</code> aus.</li>
</ul>
<p><b>Zeitformat nachgerechnet:</b> <code>videoPlayer.time</code> = 125,7 s → <code>(int)125.7</code> = 125 → 125 / 60 = <b>2</b> Minuten (Ganzzahldivision), 125 % 60 = <b>5</b> Sekunden → mit <code>ToString("00")</code> „02:05“. Gesamtlänge 2700 s → „45:00“. Slider-Wert = 125,7 / 2700 ≈ 0,047 → der Regler steht bei knapp 5 % der Leiste.</p>` },
  { t: "example", title: "Handy drehen: warum Anchors zählen", html: `<p><b>Sophie</b> testet ihren Videoplayer auf dem Tablet. Sie hat den Lautstärke-Slider im Editor bei 1920 × 1080 einfach mit Anchor <i>Mitte</i> bei Pos X = 800 platziert.</p>
<ul>
<li>Querformat 1920 breit: Slider sitzt 800 px rechts der Mitte → am rechten Rand, passt.</li>
<li>Hochformat 1080 breit: 800 px rechts der Mitte = bei x = 1340 → <b>außerhalb des Bildschirms!</b> (sofern der Canvas Scaler nicht nachhilft)</li>
</ul>
<p>Lösung: Anchor <b>rechts unten</b> (1, 0), Pos X = −120, Pos Y = 60 → der Slider bleibt immer 120 px vom rechten und 60 px vom unteren Rand, egal wie das Gerät gedreht wird. Shortcut: Im Anchor-Preset-Menü <b>Alt</b> (Mac: Option) gedrückt halten setzt Position und Pivot gleich mit.</p>` },
  { t: "hint", title: "Eselsbrücke: Unten in der Liste = oben am Bildschirm", html: `Die Hierarchy unter dem Canvas ist wie ein Stapel Folien: Die <b>letzte</b> Folie wird zuletzt aufgelegt und liegt <b>oben</b>. Verdeckt das Video deine Buttons, schieb das RawImage in der Hierarchy nach oben (oder die Buttons nach unten).` },
  { t: "hint", title: "Typische Prüfungsfalle: Methode taucht im OnClick-Menü nicht auf", html: `Im Inspector-OnClick-Feld erscheinen nur <b>public</b>-Methoden mit höchstens einem einfachen Parameter (int, float, string, bool, Object). Außerdem musst du das <b>GameObject mit dem Skript</b> ins Feld ziehen, nicht die Skript-Datei aus dem Project-Fenster.` },
  { t: "hint", title: "So baust du die Zeitanzeige fehlerfrei", html: `Rechne immer mit ganzen Sekunden: <code>int s = (int)seconds;</code> Minuten = <code>s / 60</code>, Sekunden = <code>s % 60</code>, beide mit <code>ToString("00")</code>. Vor der Anzeige prüfen, ob <code>videoPlayer.length &gt; 0</code> – vor dem Vorbereiten ist die Länge 0, und eine Division durch 0 beim Slider-Wert ergibt NaN.` }
],

/* ===================== Kapitel 4: Physik & Roll-a-Ball ===================== */

"mmp4-1": [
  { t: "text", h: "Vertiefung: Wie die Physik-Engine rechnet", levels: {
    simple: `Die Physik-Engine ist wie ein unsichtbarer Schiedsrichter, der 50-mal pro Sekunde nachschaut: Wo ist jedes Objekt mit <b>Rigidbody</b>, wie schnell ist es, berührt es etwas? Der <b>Collider</b> ist die unsichtbare Hülle, mit der Objekte sich berühren können – ohne ihn fällt alles durch. Ein <b>Trigger</b> ist eine Hülle, durch die man durchgehen kann, die aber meldet: „Da ist jemand reingegangen!“`,
    normal: `<p><b>Drei Arten von Physik-Objekten:</b> (1) <b>Statischer Collider</b> – nur Collider, kein Rigidbody: Boden, Wände; bewegt sich nicht. (2) <b>Dynamischer Rigidbody</b> – wird von Schwerkraft und Kräften bewegt: Ball, Kisten. (3) <b>Kinematischer Rigidbody</b> (<code>isKinematic = true</code>) – bewegt sich nur durch Code/Animation, schiebt andere aber physikalisch weg: Aufzug, bewegliche Plattform, Flipperhebel.</p>
<p><b>Kräfte mit Zahlen:</b> Gravitation −9,81 m/s². <code>rb.AddForce(Vector3.up * 5f, ForceMode.Impulse)</code> bei <code>mass = 1</code> ändert die Geschwindigkeit sofort um 5 m/s nach oben (Δv = Impuls / Masse). Sprunghöhe h = v² / (2g) = 25 / 19,62 ≈ <b>1,27 m</b>. Mit <code>mass = 2</code> nur 2,5 m/s → ≈ 0,32 m. <code>ForceMode.Force</code> dagegen wirkt pro Physik-Schritt nur anteilig (Δv = F · 0,02 s / m) und ist für <i>dauerhaftes</i> Schieben gedacht, z. B. jede FixedUpdate.</p>
<p><b>Physic Material</b> (am Collider): <i>Dynamic/Static Friction</i> (Reibung 0 = Eis, 1 = Gummi) und <i>Bounciness</i> (0 = Knetmasse, 1 = Flummi, der fast gleich hoch zurückspringt).</p>
<p><b>Wann gibt es welches Ereignis?</b> OnCollision… nur, wenn mindestens einer der beiden einen nicht-kinematischen Rigidbody hat. OnTrigger…, wenn einer der Collider Trigger ist und mindestens einer einen Rigidbody (auch kinematisch) hat. Zwei statische Collider melden nie etwas.</p>`,
    technical: `<p>Unity 3D nutzt NVIDIA PhysX. Der Simulationsschritt läuft mit <code>Time.fixedDeltaTime</code> (Standard 0,02 s); pro Frame werden so viele Schritte ausgeführt, wie Zeit aufgelaufen ist (begrenzt durch <i>Maximum Allowed Timestep</i>). Integration: v ← v + (F/m + g)·Δt, x ← x + v·Δt (semi-implizites Euler); danach Kollisionserkennung und -auflösung.</p>
<p><b>Tunneling:</b> Mit <i>Discrete</i> Collision Detection wird nur an den Schrittpositionen geprüft. Ball mit 50 m/s → 50 · 0,02 = 1 m pro Schritt; eine 0,2 m dicke Wand kann übersprungen werden. Abhilfe: <i>Continuous</i> / <i>Continuous Dynamic</i> (Sweep-Tests), dickere Collider, kleinerer Timestep. Rigidbodies bewegt man per <code>AddForce</code>, <code>linearVelocity</code> (Unity 6; vorher <code>velocity</code>) oder bei kinematischen per <code>rb.MovePosition</code>/<code>MoveRotation</code> in FixedUpdate – nicht per <code>transform.position</code>, sonst wird teleportiert und Kontakte werden nicht korrekt aufgelöst.</p>
<p>Die <i>Layer Collision Matrix</i> (Project Settings → Physics) legt fest, welche Layer überhaupt miteinander kollidieren. <code>Collision</code> liefert <code>contacts</code>/<code>GetContact(i)</code>, <code>relativeVelocity</code>, <code>impulse</code>; <code>OnTriggerEnter</code> nur den anderen <code>Collider</code>. Mesh Collider müssen bei dynamischen Rigidbodies <i>Convex</i> sein.</p>` } },
  { t: "example", title: "Der Flipper-Automat im Unity-Detail", html: `<p><b>Jonas</b> baut seinen Flipper fertig. Jedes Bauteil entspricht einem Physik-Begriff:</p>
<ul>
<li><b>Kugel</b> = dynamischer Rigidbody (Sphere Collider, <code>mass = 0.1</code>, Collision Detection <i>Continuous Dynamic</i>, weil sie schnell ist).</li>
<li><b>Spielfeld und Banden</b> = statische Collider (kein Rigidbody), Physic Material mit wenig Reibung.</li>
<li><b>Pilz-Bumper</b> = Collider mit Physic Material Bounciness 0,9 + Skript mit <code>OnCollisionEnter</code>, das zusätzlich einen Impuls gibt und 100 Punkte zählt.</li>
<li><b>Flipperhebel</b> = kinematischer Rigidbody, per <code>rb.MoveRotation</code> in FixedUpdate gedreht → er schlägt die Kugel physikalisch korrekt weg.</li>
<li><b>Rollover-Lichtschranke</b> in der Gasse = Trigger: Kugel rollt durch, <code>OnTriggerEnter</code> zündet eine Lampe.</li>
<li><b>Aus (Drain)</b> = Trigger am unteren Rand: <code>Destroy(other.gameObject)</code> und neue Kugel anfordern.</li>
</ul>
<pre><code>public class Drain : MonoBehaviour      // Box Collider mit Is Trigger ✓
{
    public BallLauncher launcher;

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Ball"))
        {
            Destroy(other.gameObject);
            Debug.Log("Kugel verloren!");
        }
    }
}</code></pre>
<p>Die Tischneigung simuliert Jonas einfach, indem er das ganze Spielfeld um 6° kippt – die Schwerkraft (−9,81 auf Y) zieht die Kugel dann von selbst nach unten.</p>` },
  { t: "example", title: "Einkaufswagen im Supermarkt: Kraft vs. Masse", html: `<p><b>Herr Novak</b> schiebt zwei Einkaufswagen mit gleicher Kraft an: einen leeren (10 kg) und einen vollen (40 kg).</p>
<ul>
<li><code>ForceMode.Force</code> / <code>Impulse</code> sind <b>masseabhängig</b>: Der volle Wagen wird nur ein Viertel so schnell – wie im echten Leben.</li>
<li><code>ForceMode.Acceleration</code> / <code>VelocityChange</code> <b>ignorieren die Masse</b>: Beide Wagen würden gleich schnell – praktisch, wenn sich die Steuerung unabhängig vom Gewicht gleich anfühlen soll.</li>
<li><b>Linear Damping</b> (früher Drag) = Rollwiderstand: Lässt Herr Novak los, rollt der Wagen aus, statt ewig weiterzufahren.</li>
<li>Rollt der Wagen gegen das Regal (statischer Collider), stoppt er – ein <code>OnCollisionEnter</code> könnte „Rumms!“ abspielen, mit <code>collision.relativeVelocity.magnitude</code> als Lautstärke-Maß.</li>
</ul>` },
  { t: "hint", title: "Eselsbrücke: Collider = Haut, Rigidbody = Muskeln + Gewicht", html: `Der <b>Collider</b> ist die Haut (Form zum Berühren), der <b>Rigidbody</b> sind Gewicht und Muskeln (Schwerkraft, Kräfte). Haut ohne Muskeln = Wand (bleibt stehen). Muskeln ohne Haut = fällt durch alles durch. <b>Is Trigger</b> = Geisterhaut: spürt Berührung, hält aber nichts auf.` },
  { t: "hint", title: "Typische Prüfungsfalle: Trigger und Collision verwechselt", html: `<code>OnTriggerEnter(Collider other)</code> – Parameter ist ein <b>Collider</b>. <code>OnCollisionEnter(Collision collision)</code> – Parameter ist eine <b>Collision</b> (mit Kontaktpunkten). Falscher Parametertyp = Methode wird nie aufgerufen, ohne Fehlermeldung. Und: Ist „Is Trigger“ aktiv, kommt nur OnTrigger…, nie OnCollision….` },
  { t: "hint", title: "Ball fliegt durch die Wand? So prüfst du es", html: `1) Hat die Wand einen Collider? 2) Wird der Ball per <code>transform.position</code> bewegt statt mit <code>AddForce</code>? 3) Ist er sehr schnell → Collision Detection auf <i>Continuous</i>. 4) Ist die Wand sehr dünn (Plane hat nur eine Seite!) → Cube als Wand verwenden.` }
],

"mmp4-2": [
  { t: "text", h: "Vertiefung: Wie die Roll-a-Ball-Teile zusammenspielen", levels: {
    simple: `Roll-a-Ball ist ein kleines, komplettes Spiel, in dem alle bisherigen Themen zusammenkommen: <b>Szene</b> (Boden, Wände), <b>Skripte</b> (Spieler, Kamera, Drehung), <b>Input</b> (Tasten), <b>Physik</b> (Ball rollt, Pickups sind Trigger), <b>Prefabs</b> (12 gleiche Pickups) und <b>UI</b> (Punktestand). Wenn du verstehst, welches Teil welches andere „kennt“, kannst du jeden Fehler finden und das Spiel erweitern.`,
    normal: `<p><b>Datenfluss pro Frame:</b></p>
<ol>
<li><b>Update</b> (PlayerController): Tastatur lesen → <code>movementX/Y</code> merken.</li>
<li><b>FixedUpdate</b> (PlayerController): daraus eine Kraft machen → <code>rb.AddForce</code>. Die Physik-Engine bewegt den Ball.</li>
<li><b>Physik</b>: Ball überlappt einen Pickup-Trigger → Unity ruft <code>OnTriggerEnter</code> am Ball auf → Tag prüfen, Pickup deaktivieren, <code>count++</code>, UI-Text aktualisieren, ggf. Siegtext zeigen.</li>
<li><b>Update</b> (Rotator an jedem Pickup): Würfel drehen.</li>
<li><b>LateUpdate</b> (CameraController): Kamera = Ballposition + Offset – erst jetzt, weil der Ball sich in diesem Frame schon bewegt hat.</li>
</ol>
<p><b>Wer kennt wen?</b> PlayerController kennt (per Inspector) den TextMeshPro-Text und das Win-Text-Objekt; CameraController kennt den Player; die Pickups kennen niemanden – sie werden über ihren <b>Tag</b> erkannt. Diese lose Kopplung ist der Grund, warum du beliebig viele Pickups hinzufügen kannst, ohne Code zu ändern.</p>
<p><b>Offset-Rechnung:</b> Kamera bei (0, 10, −10), Ball bei (0, 0,5, 0) → <code>offset</code> = (0, 9,5, −10). Rollt der Ball nach (3, 0,5, 4), steht die Kamera bei (3, 10, −6) – gleicher Blickwinkel, aber keine Drehung mit dem Ball.</p>
<p><b>Projekt sauber halten:</b> Ordner <code>Scripts</code>, <code>Materials</code>, <code>Prefabs</code>, <code>Scenes</code>; Szene regelmäßig mit Strg+S speichern (ein Sternchen * im Tab zeigt ungespeicherte Änderungen).</p>`,
    technical: `<p>Ein Unity-Projekt besteht aus <code>Assets/</code> (deine Inhalte inkl. <code>.meta</code>-Dateien mit GUIDs – <b>immer mitkopieren</b>, sonst gehen Referenzen verloren), <code>Packages/</code> (manifest.json) und <code>ProjectSettings/</code>. <code>Library/</code>, <code>Temp/</code>, <code>Obj/</code>, <code>Logs/</code>, <code>UserSettings/</code> sind generiert und gehören nicht in Abgabe oder Git (Unity-<code>.gitignore</code>-Vorlage).</p>
<p>Build: Plattform „Windows, Mac, Linux“, Target Windows, Architektur x86_64 → erzeugt <code>Spielname.exe</code>, <code>Spielname_Data/</code>, <code>UnityPlayer.dll</code> (und weitere DLLs) – nur zusammen lauffähig. Development Build aktiviert Konsolen-Logs im Build. Szenenwechsel/Neustart: <code>using UnityEngine.SceneManagement;</code> → <code>SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);</code> – funktioniert nur für Szenen in der Build-Liste.</p>
<p>Robustheit: Pickup-Anzahl über <code>FindGameObjectsWithTag</code> in Start zählen (nicht hartkodieren); Siegbedingung mit <code>&gt;=</code>; bei Neustart ggf. <code>Time.timeScale = 1</code> zurücksetzen, falls pausiert wurde.</p>` } },
  { t: "example", title: "Premiere statt Probe: der Build", html: `<p>Das Theaterensemble von <b>Regisseurin Lena</b> hat wochenlang auf der Probebühne geprobt (= Unity-Editor mit Play-Modus). Jetzt ist <b>Premiere</b> im großen Haus (= der Build auf einem fremden PC).</p>
<ul>
<li><b>Besetzungsliste prüfen</b> = Szenen in die Build-Liste eintragen. Wer nicht auf der Liste steht, darf nicht auf die Bühne – <code>LoadScene</code> scheitert.</li>
<li><b>Requisiten mitnehmen</b> = <code>.exe</code> <i>und</i> <code>_Data</code>-Ordner zusammen weitergeben. Ohne den Ordner fehlt die ganze Kulisse.</li>
<li><b>Generalprobe im echten Saal</b> = den Build außerhalb des Editors starten: andere Auflösung (sitzt das UI noch?), kein Editor-Fenster, Video-Pfade aus <code>StreamingAssets</code>.</li>
<li><b>Programmheft</b> = die Abgabe: Projektordner (ohne <code>Library/</code> &amp; Co.) und KI-Dokumentation inkl. Prompts im DOC-File.</li>
</ul>` },
  { t: "example", title: "„my“-Erweiterung: Countdown und Neustart", html: `<p><b>Kevin</b> erweitert sein Roll-a-Ball: 60 Sekunden Zeit, um alle Pickups zu sammeln, Taste R startet neu.</p>
<pre><code>using UnityEngine;
using UnityEngine.SceneManagement;
using TMPro;

public class GameTimer : MonoBehaviour
{
    public TextMeshProUGUI timerText;
    public float timeLimit = 60f;
    private float remaining;
    private bool running = true;

    void Start() { remaining = timeLimit; }

    void Update()
    {
        if (running)
        {
            remaining -= Time.deltaTime;
            if (remaining &lt;= 0f)
            {
                remaining = 0f;
                running = false;
                timerText.text = "Zeit abgelaufen! R = Neustart";
            }
            else
            {
                timerText.text = "Zeit: " + Mathf.CeilToInt(remaining);
            }
        }
        if (Input.GetKeyDown(KeyCode.R))
            SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }

    public void StopTimer() { running = false; }   // vom PlayerController beim Sieg aufrufen
}</code></pre>
<p>Im PlayerController: Feld <code>public GameTimer timer;</code> und in <code>SetCountText()</code> beim Sieg <code>timer.StopTimer();</code>. Bei 59,3 s Rest zeigt <code>CeilToInt</code> „60“, bei 0,2 s „1“ – so springt die Anzeige erst auf 0, wenn die Zeit wirklich um ist. Die Neustart-Taste lädt die Szene komplett neu: alle Pickups sind wieder aktiv, <code>count</code> ist wieder 0.</p>` },
  { t: "hint", title: "Fehlersuche in 30 Sekunden", html: `<b>Console zuerst!</b> Rote Meldung <code>NullReferenceException … PlayerController.cs:42</code> → in Zeile 42 ist eine Referenz leer, meist ein nicht zugewiesenes Inspector-Feld (countText, winTextObject, player). Doppelklick auf die Meldung springt in die Zeile. Keine Meldung, aber nichts passiert → Tag, Is Trigger, Rigidbody, Methodenname prüfen.` },
  { t: "hint", title: "Typische Prüfungsfalle: Tag-Schreibweise", html: `<code>CompareTag("PickUp")</code> ist <b>case-sensitive</b>: „Pickup“, „pickup“ oder „PickUp “ (Leerzeichen) treffen nicht. Der Tag muss im Tag Manager angelegt <i>und</i> am Prefab gesetzt sein. Gibt es den Tag gar nicht, meldet <code>CompareTag</code> einen Fehler in der Console.` },
  { t: "hint", title: "Erweiterungen planen: klein anfangen", html: `Jede Erweiterung einzeln einbauen und testen, dann committen (Git) bzw. Sicherungskopie machen. Gute Reihenfolge: 1) Sound beim Einsammeln, 2) Timer/Neustart, 3) Sprung (Impulse + Bodencheck), 4) bewegliches Hindernis (kinematischer Rigidbody oder Animator), 5) zweites Level mit <code>SceneManager.LoadScene</code>. KI-Prompts dabei gleich mitdokumentieren.` }
]
};
})();
