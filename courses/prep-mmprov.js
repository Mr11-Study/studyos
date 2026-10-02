/* Prüfungsvorbereitung MMPROV – KEINE Altprüfungen vorhanden. Aufgebaut aus Syllabus MMPROV (IMA25) und den Beurteilungsregeln/Deliverables der Kursdatei
   (Aufgabe 1: 3D Animation 35 %, Aufgabe 2: myRollABall 55 %, Exkursion 10 %). Alle alt-Items sind selbst erstellte, prüfungsnahe Übungsfragen und Skriptaufgaben. */
(function () {
const c = (window.COURSE_DEFS || []).find(x => x.id === "mmprov"); if (!c) return;

const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const S = s => "<pre><code>" + esc(s) + "</code></pre>";
const SRC = "Prüfungsnah (eigene Frage)";

/* ---------- MC / Richtig-Falsch ---------- */
c.questions.push(
 { id: "mmx-q1", topic: "mmp-csharp", q: "Welche Methode wird auch dann aufgerufen, wenn das Skript-Component deaktiviert ist (das GameObject aber aktiv)?", opts: ["Start()", "Update()", "Awake()", "OnEnable()"], a: 2, why: "Awake läuft beim Laden des aktiven GameObjects – unabhängig davon, ob die Komponente aktiviert ist. Start, Update und OnEnable laufen erst, wenn das Skript aktiviert ist. Reihenfolge: Awake → OnEnable → Start → (FixedUpdate/Update/LateUpdate …).", alt: true, src: SRC },
 { id: "mmx-q2", topic: "mmp-csharp", q: "transform.Translate(Vector3.forward * 5f * Time.deltaTime) in Update(). Wie weit bewegt sich das Objekt pro Sekunde bei 30 fps bzw. 120 fps?", opts: ["30 fps: 5 Einheiten, 120 fps: 20 Einheiten", "In beiden Fällen ca. 5 Einheiten", "30 fps: 150, 120 fps: 600 Einheiten", "In beiden Fällen 5 Einheiten pro Frame"], a: 1, why: "Time.deltaTime ist die Dauer des letzten Frames in Sekunden. Mehr Frames → kleinere Schritte; in Summe immer 5 Einheiten pro Sekunde – framerate-unabhängig. Ohne deltaTime wären es 5 Einheiten pro Frame.", alt: true, src: SRC },
 { id: "mmx-q3", topic: "mmp-code", q: "Was bewirkt Instantiate(prefab, pos, Quaternion.identity, transform)?", opts: ["Erzeugt eine Kopie des Prefabs an pos und macht sie zum Child des Objekts, auf dem das Skript liegt", "Verschiebt das Prefab-Asset an pos", "Erzeugt eine Kopie, die transform übernimmt und den Parent löscht", "Ersetzt das aktuelle Objekt durch das Prefab"], a: 0, why: "Die Überladung Instantiate(original, position, rotation, parent) erzeugt einen Klon an der Weltposition pos mit Rotation und hängt ihn unter parent. Praktisch, um erzeugte Objekte gemeinsam zu drehen oder zu löschen.", alt: true, src: SRC },
 { id: "mmx-q4", topic: "mmp-code", q: "GetComponent&lt;Rigidbody&gt;().AddForce(…) wirft eine NullReferenceException. Wahrscheinlichste Ursache?", opts: ["Rigidbody darf nur in FixedUpdate gelesen werden", "Das GameObject hat gar keinen Rigidbody – GetComponent liefert null", "AddForce braucht immer einen ForceMode", "Das Skript erbt nicht von Rigidbody"], a: 1, why: "GetComponent liefert null, wenn die Komponente fehlt. Abhilfe: Komponente hinzufügen, [RequireComponent(typeof(Rigidbody))] über die Klasse schreiben oder mit TryGetComponent prüfen. Referenz einmal in Awake/Start cachen.", alt: true, src: SRC },
 { id: "mmx-q5", topic: "mmp-licht", q: "Welche Eigenschaft bestimmt den Öffnungswinkel des Lichtkegels eines Spot Lights?", opts: ["range", "intensity", "spotAngle", "shadowStrength"], a: 2, why: "spotAngle = Kegelwinkel in Grad (nur bei LightType.Spot). range begrenzt die Reichweite (Point/Spot), intensity die Helligkeit.", alt: true, src: SRC },
 { id: "mmx-q6", topic: "mmp-licht", q: "Ein Licht steht im Mode „Baked“, die Lightmaps sind gebacken. Im Play-Modus wird light.enabled = false gesetzt. Was sieht man?", opts: ["Die Szene wird sofort dunkel", "Die gebackene Beleuchtung bleibt sichtbar – nur Realtime-Anteile ändern sich", "Unity backt die Lightmaps neu", "Es gibt einen Laufzeitfehler"], a: 1, why: "Baked-Licht ist in Lightmaps (Texturen) gespeichert und wird zur Laufzeit nicht berechnet. Lichter, die per Code gesteuert werden sollen (an/aus, Farbe, Intensität), müssen im Mode Realtime (oder teilweise Mixed) stehen.", alt: true, src: SRC },
 { id: "mmx-q7", topic: "mmp-anim", q: "Welcher Animator-Parametertyp setzt sich nach dem Auslösen einer Transition automatisch zurück?", opts: ["Float", "Int", "Bool", "Trigger"], a: 3, why: "Ein Trigger ist ein Bool, der nach dem Verbrauch durch eine Transition automatisch auf false zurückfällt – ideal für einmalige Ereignisse (Tür öffnen, Sprung). Gesetzt mit animator.SetTrigger(\"Name\").", alt: true, src: SRC },
 { id: "mmx-q8", topic: "mmp-anim", q: "Was passiert mit einer laufenden Coroutine, wenn ihr GameObject mit SetActive(false) deaktiviert wird?", opts: ["Sie läuft normal weiter", "Sie pausiert und läuft beim Aktivieren automatisch weiter", "Sie wird beendet und startet beim Aktivieren nicht von selbst neu", "Unity wirft eine Exception"], a: 2, why: "Coroutines hängen am MonoBehaviour: Deaktivieren des GameObjects stoppt alle Coroutines darauf. Sie müssen bei Bedarf neu gestartet werden (z. B. in OnEnable). Nur das Deaktivieren der Komponente (enabled = false) stoppt sie nicht.", alt: true, src: SRC },
 { id: "mmx-q9", topic: "mmp-input", q: "In welchem Koordinatensystem liefert Input.mousePosition die Mausposition?", opts: ["Weltkoordinaten der Szene", "Bildschirmpixel, Ursprung links unten", "Normierte Koordinaten 0–1, Ursprung Mitte", "Lokale Koordinaten der Kamera"], a: 1, why: "Bildschirmkoordinaten in Pixel, (0,0) = links unten. Für die 3D-Welt braucht man Camera.main.ScreenPointToRay(Input.mousePosition) und einen Raycast (oder ScreenToWorldPoint mit z-Abstand).", alt: true, src: SRC },
 { id: "mmx-q10", topic: "mmp-input", q: "Welche Bedingung entspricht beim Touch dem Input.GetMouseButtonDown(0)?", opts: ["Input.touchCount > 0", "Input.GetTouch(0).phase == TouchPhase.Began", "Input.GetTouch(0).phase == TouchPhase.Moved", "Input.GetTouch(0).tapCount == 0"], a: 1, why: "TouchPhase.Began tritt genau im Frame auf, in dem der Finger den Bildschirm berührt. touchCount > 0 gilt die ganze Zeit (wie GetMouseButton), Moved beim Ziehen, Ended beim Loslassen.", alt: true, src: SRC },
 { id: "mmx-q11", topic: "mmp-media", q: "Direkt in Start() liefert videoPlayer.length den Wert 0, obwohl ein Clip zugewiesen ist. Warum?", opts: ["Das Video ist kaputt", "Der VideoPlayer ist noch nicht vorbereitet – erst nach Prepare()/prepareCompleted bzw. Play sind Länge und Frames bekannt", "length gibt es nur bei URL-Quellen", "length wird immer in Frames angegeben"], a: 1, why: "Der VideoPlayer lädt und dekodiert asynchron. Mit vp.Prepare() und dem Event prepareCompleted weiß man, wann length, frameCount und das erste Bild verfügbar sind – das verhindert auch einen schwarzen ersten Frame.", alt: true, src: SRC },
 { id: "mmx-q12", topic: "mmp-media", q: "Warum ist AudioSource.PlayClipAtPoint(clip, pos) praktisch für Pickup-Sounds?", opts: ["Es spielt den Clip lauter ab", "Es erzeugt ein temporäres Objekt mit AudioSource, das nach dem Clip gelöscht wird – der Sound überlebt das Deaktivieren des Pickups", "Es spielt den Sound nur für den AudioListener des Pickups", "Es benötigt keinen AudioClip"], a: 1, why: "Eine AudioSource auf dem Pickup verstummt, sobald das Pickup deaktiviert wird. PlayClipAtPoint erzeugt ein eigenes kurzlebiges „One shot audio“-Objekt an der Position (3D-Sound) und räumt es selbst auf.", alt: true, src: SRC },
 { id: "mmx-q13", topic: "mmp-ui", q: "Ein Videoplayer-Bedienfeld soll als Bildschirm IN der 3D-Szene (an einer Wand) hängen. Welcher Canvas-Render-Mode passt?", opts: ["Screen Space – Overlay", "Screen Space – Camera", "World Space", "Kein Canvas nötig"], a: 2, why: "World Space macht den Canvas zu einem Objekt in der Szene (positionierbar, perspektivisch). Overlay liegt immer über dem Bild, Screen Space – Camera in fixem Abstand vor einer Kamera.", alt: true, src: SRC },
 { id: "mmx-q14", topic: "mmp-ui", q: "Buttons im Canvas reagieren auf keinen Klick, onClick ist korrekt verknüpft. Was fehlt am wahrscheinlichsten?", opts: ["Ein AudioListener", "Ein EventSystem in der Szene", "Ein Rigidbody am Button", "Ein Animator am Canvas"], a: 1, why: "UI-Eingaben werden vom EventSystem (mit Input Module) verteilt. Es wird beim ersten Anlegen eines Canvas automatisch erzeugt – wird es gelöscht oder fehlt es in einer neuen Szene, reagiert keine UI. Zweite häufige Ursache: ein anderes UI-Element mit Raycast Target liegt darüber.", alt: true, src: SRC },
 { id: "mmx-q15", topic: "mmp-physik", q: "Zwei Würfel mit BoxCollider, beide OHNE Rigidbody; einer wird per transform.position in den anderen geschoben. Wird OnCollisionEnter aufgerufen?", opts: ["Ja, bei beiden", "Ja, nur beim bewegten Würfel", "Nein – mindestens eines der Objekte braucht einen Rigidbody", "Nur wenn Is Trigger aktiv ist"], a: 2, why: "Kollisions- und Trigger-Nachrichten gibt es nur, wenn mindestens ein beteiligtes Objekt einen Rigidbody hat (für OnCollision* zusätzlich: ein nicht-kinematischer Rigidbody bzw. kein Trigger). Reine Collider ohne Rigidbody gelten als statisch.", alt: true, src: SRC },
 { id: "mmx-q16", topic: "mmp-physik", q: "Welcher ForceMode passt für einen einmaligen Sprung beim Drücken der Leertaste?", opts: ["ForceMode.Force", "ForceMode.Impulse", "ForceMode.Acceleration", "Kein ForceMode – transform.position erhöhen"], a: 1, why: "Impulse wirkt sofort einmalig (masseabhängig) – ideal für Sprung/Stoß. Force wirkt kontinuierlich über die Zeit (pro FixedUpdate), wie beim Rollen des Balls.", alt: true, src: SRC },
 { id: "mmx-q17", topic: "mmp-rollaball", q: "Kevin erreicht: Aufgabe 1 = 33/35, Aufgabe 2 = 52/55, Exkursion nicht dokumentiert (0/10). Ergebnis laut Syllabus?", opts: ["Gut (85 Punkte)", "Sehr gut, weil Mitarbeit als Bonus zählt", "Nicht genügend – jeder der drei Teile muss separat positiv sein", "Befriedigend, weil 10 % abgezogen werden"], a: 2, why: "A, B und C müssen laut Syllabus jeweils separat positiv sein. 85 Punkte nützen nichts, wenn die Exkursions-Dokumentation fehlt. Die 10 % der Exkursion sind leicht verdientes Geld – nicht vergessen.", alt: true, src: SRC },
 { id: "mmx-q18", topic: "mmp-rollaball", q: "Kevin nutzt einen KI-Assistenten, um einen Fehler im PlayerController zu finden. Was verlangt der Syllabus?", opts: ["Nichts – KI ist erlaubt", "KI ist verboten, die Aufgabe wird negativ", "Verwendung inkl. Prompts dokumentieren und das DOC-File am Ende mit abgeben", "Nur das Endergebnis im Code kommentieren"], a: 2, why: "In MMPROV ist KI erlaubt, aber die Nutzung inklusive Prompts muss dokumentiert und als DOC-File am Ende abgegeben werden; nur vom Lehrenden zugelassene Systeme. Nicht dokumentierte Nutzung = Täuschungsversuch.", alt: true, src: SRC },
 { id: "mmx-q19", topic: "mmp-editor", q: "Du änderst im Prefab Mode die Farbe des Pickup-Prefabs. Was passiert mit den 12 Pickups in der Szene?", opts: ["Nichts – nur neue Instanzen sind betroffen", "Alle Instanzen übernehmen die Änderung, außer Eigenschaften, die an einer Instanz überschrieben (Override) wurden", "Alle Instanzen werden gelöscht", "Nur die zuerst platzierte Instanz ändert sich"], a: 1, why: "Prefab-Instanzen sind mit dem Asset verknüpft; Änderungen am Prefab wirken auf alle Instanzen. An einer Instanz geänderte Werte (fett im Inspector) sind Overrides und bleiben bestehen, bis man sie per Apply/Revert auflöst.", alt: true, src: SRC },
 { id: "mmx-q20", topic: "mmp-rollaball", q: "SceneManager.LoadScene(\"Level2\") funktioniert im Editor nicht und meldet, die Szene könne nicht geladen werden. Ursache?", opts: ["Die Szene fehlt in der Szenenliste der Build Settings (File → Build Settings / Build Profiles)", "LoadScene funktioniert nur im Build", "Szenennamen müssen Zahlen sein", "Es fehlt ein AudioListener"], a: 0, why: "Nur Szenen, die in den Build Settings eingetragen sind, können per LoadScene geladen werden. Der Build enthält zudem nur diese Szenen – ein häufiger Grund für kaputte Abgaben.", alt: true, src: SRC },
 { id: "mmx-q21", topic: "mmp-csharp", q: "In welche Methode gehört Kamera-Nachführung, die auf die bereits bewegte Position des Spielers reagieren soll?", opts: ["Awake", "FixedUpdate", "LateUpdate", "OnGUI"], a: 2, why: "LateUpdate läuft nach allen Update-Aufrufen eines Frames. So ist die Spielerposition bereits aktualisiert und die Kamera ruckelt nicht hinterher.", alt: true, src: SRC }
);

/* ---------- Offene Fragen: Abgabegespräch / Erklären des eigenen Codes ---------- */
c.flashcards.push(
 { id: "mmx-f1", cat: "MMPROV", topic: "mmp-csharp", alt: true, src: SRC, front: "Erkläre den MonoBehaviour-Lifecycle und ordne zu, welcher Code wohin gehört: Referenzen holen, Eingabe lesen, Kräfte anwenden, Kamera nachführen, Einsammeln.", back: "<table class=\"dt\"><tr><th>Methode</th><th>Wann</th><th>Typischer Code</th></tr><tr><td>Awake</td><td>einmal beim Laden</td><td>eigene Referenzen: <code>rb = GetComponent&lt;Rigidbody&gt;()</code></td></tr><tr><td>Start</td><td>einmal vor dem ersten Update</td><td>Initialisierung, die andere Objekte braucht (Pickups zählen, UI setzen)</td></tr><tr><td>Update</td><td>jeden Frame</td><td>Eingabe lesen (<code>GetKeyDown</code>, <code>GetAxis</code>), nicht-physikalische Bewegung mit <code>Time.deltaTime</code></td></tr><tr><td>FixedUpdate</td><td>fester Physiktakt (Standard 50/s)</td><td><code>rb.AddForce</code>, <code>rb.MovePosition</code></td></tr><tr><td>LateUpdate</td><td>nach allen Updates</td><td>Kamera nachführen</td></tr><tr><td>OnTriggerEnter / OnCollisionEnter</td><td>bei Physik-Ereignissen</td><td>Einsammeln, Treffer, Game Over</td></tr></table>" },
 { id: "mmx-f2", cat: "MMPROV", topic: "mmp-code", alt: true, src: SRC, front: "Drei Wege, im Skript an ein anderes Objekt/eine Komponente zu kommen – mit Vor- und Nachteilen.", back: "<ul><li><b>Inspector-Referenz</b> (<code>[SerializeField] private Light lampe;</code> bzw. public-Feld, im Editor hineinziehen): schnell, eindeutig, robust gegen Umbenennen; muss gesetzt werden, sonst NullReference.</li><li><b>GetComponent&lt;T&gt;()</b>: Komponente am selben Objekt (oder per <code>other.GetComponent</code> an einem getroffenen Objekt); einmal in Awake/Start cachen, nicht jeden Frame.</li><li><b>GameObject.Find(\"Name\") / FindWithTag / FindGameObjectsWithTag</b>: ohne Vorbereitung im Editor, aber langsam (durchsucht die Szene), bricht beim Umbenennen, findet keine inaktiven Objekte → nur in Start, nie in Update. Tags sind robuster als Namen (z. B. alle „PickUp“ zählen).</li></ul>" },
 { id: "mmx-f3", cat: "MMPROV", topic: "mmp-anim", alt: true, src: SRC, front: "Animation per Entwicklungsumgebung vs. per Code: Wann was? Beschreibe den Ablauf im Animator.", back: "<b>Editor (Animation-Fenster + Animator):</b> Keyframes für Position/Rotation/Skalierung/Farbe aufnehmen → AnimationClip; im Animator Controller States (Idle, Open) und Transitions mit Parametern (Trigger/Bool) anlegen; „Has Exit Time“ aus, wenn sofort reagiert werden soll; im Skript <code>animator.SetTrigger(\"Open\")</code>. Gut für gestaltete, komplexe Bewegungsabläufe.<br><b>Code:</b> <code>transform.Rotate</code> mit <code>Time.deltaTime</code> (Dauerrotation), <code>Mathf.Sin</code>/<code>PingPong</code> (Schweben, Pulsieren), <code>Vector3.Lerp</code> in einer Coroutine (A→B in fester Dauer). Gut für parametrische, datengetriebene oder zufällige Bewegungen.<br>Achtung: Ein Animator, der dieselbe Eigenschaft animiert, überschreibt Skriptwerte jeden Frame." },
 { id: "mmx-f4", cat: "MMPROV", topic: "mmp-input", alt: true, src: SRC, front: "Wie funktioniert ein Klick (oder Touch) auf ein 3D-Objekt? Nenne die Schritte und die Voraussetzungen.", back: "<ol><li>Eingabe erkennen: <code>Input.GetMouseButtonDown(0)</code> bzw. <code>Input.GetTouch(0).phase == TouchPhase.Began</code>.</li><li>Strahl erzeugen: <code>Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);</code></li><li>Raycast: <code>if (Physics.Raycast(ray, out RaycastHit hit, 100f)) …</code></li><li>Treffer auswerten: <code>hit.collider.gameObject</code>, <code>hit.point</code>, Tag prüfen, Komponente holen.</li></ol>Voraussetzungen: Objekt hat einen <b>Collider</b>; Hauptkamera ist mit Tag <b>MainCamera</b> versehen; störende Objekte per <b>LayerMask</b> bzw. <code>QueryTriggerInteraction.Ignore</code> ausschließen. Einfachere Alternative für einzelne Objekte: <code>OnMouseDown()</code> (braucht Collider und das alte Input-System)." },
 { id: "mmx-f5", cat: "MMPROV", topic: "mmp-ui", alt: true, src: SRC, front: "Beschreibe den Aufbau eines Videoplayer-Interfaces in Unity (Komponenten und Verknüpfung).", back: "<ul><li><b>VideoPlayer</b> (Source: VideoClip oder URL), Render Mode <b>Render Texture</b> → RenderTexture-Asset; Audio Output Mode <i>Direct</i> oder <i>AudioSource</i>.</li><li><b>Canvas</b> mit <b>RawImage</b> (Texture = RenderTexture) als Bildfläche; <b>EventSystem</b> vorhanden.</li><li><b>Button</b> Play/Pause → <code>onClick.AddListener(PlayPause)</code>; Stop/Mute optional.</li><li><b>Slider</b> Zeitleiste (0–1): <code>onValueChanged</code> → <code>vp.time = wert * vp.length</code>; im Update mit <code>SetValueWithoutNotify</code> nachführen (sonst Rückkopplung).</li><li><b>Slider</b> Lautstärke → <code>vp.SetDirectAudioVolume(0, v)</code> bzw. <code>audioSource.volume</code>.</li><li><b>Text</b> mm:ss / mm:ss; Event <code>loopPointReached</code> für das Videoende.</li></ul>" },
 { id: "mmx-f6", cat: "MMPROV", topic: "mmp-rollaball", alt: true, src: SRC, front: "Was macht dein myRollABall zu mehr als dem Unity-Tutorial? Nenne sinnvolle Erweiterungen und was du dazu erklären können musst.", back: "Mögliche „my“-Erweiterungen (Vorgaben der LV haben Vorrang):<ul><li><b>Sprung</b> mit Bodencheck (Raycast nach unten, <code>ForceMode.Impulse</code>)</li><li><b>Sound</b>: Pickup (<code>PlayClipAtPoint</code>), Hintergrundmusik, Aufprall nach Stärke</li><li><b>Gegner/Hindernisse</b>: kinematischer Rigidbody mit <code>MovePosition</code>, Game Over per <code>OnCollisionEnter</code></li><li><b>Zeitlimit, Neustart</b> (<code>SceneManager.LoadScene</code>), zweites Level, bewegte Plattformen, Absturzzone (Trigger → Reset)</li><li><b>UI</b>: Zähler „x / gesamt“, Timer, Win/Lose-Text, Startmenü</li><li>eigene Materialien, Licht, Partikel</li></ul>Zu jeder Erweiterung erklären können: welche Komponenten, welches Event, warum Update vs. FixedUpdate." },
 { id: "mmx-f7", cat: "MMPROV", topic: "mmp-rollaball", alt: true, src: SRC, front: "Abgabe „Programm und Code“: Was gehört in eine saubere Abgabe?", back: "<ul><li><b>Programm</b>: Windows-Build (File → Build Settings/Build Profiles, alle Szenen eingetragen), außerhalb des Editors getestet; Ordner mit .exe, <code>*_Data</code> und <code>UnityPlayer.dll</code> komplett.</li><li><b>Code/Projekt</b>: <code>Assets</code>, <code>Packages</code>, <code>ProjectSettings</code> – ohne <code>Library</code>, <code>Temp</code>, <code>Logs</code>, <code>obj</code>, <code>Build</code>-Ordner im Projekt (Unity erzeugt sie neu).</li><li>Skripte sauber benannt (Dateiname = Klassenname), kommentiert, keine ungenutzten Testskripte; keine Fehler/Warnungen in der Console.</li><li><b>KI-DOC-File</b> mit Tools und Prompts (falls KI genutzt).</li><li>Abgabe fristgerecht laut Moodle; zur Sicherheit vorher entpacken und testen.</li></ul>" },
 { id: "mmx-f8", cat: "MMPROV", topic: "mmp-physik", alt: true, src: SRC, front: "Warum liest der PlayerController die Eingabe in Update, wendet die Kraft aber in FixedUpdate an? Was passiert, wenn man es vertauscht?", back: "<b>Update</b> läuft einmal pro Frame – nur dort werden <code>GetKeyDown</code>-Ereignisse zuverlässig erkannt (sie gelten genau einen Frame). <b>FixedUpdate</b> läuft im festen Physiktakt; Kräfte dort wirken unabhängig von der Framerate gleich.<br>Vertauscht: Eingaben in FixedUpdate gehen verloren, wenn in einem Frame kein Physikschritt liegt (Sprung „manchmal ignoriert“); <code>AddForce</code> in Update wirkt je nach Framerate unterschiedlich stark. Lösung: Eingabe in Update in eine Variable (z. B. <code>springen = true</code>) schreiben, in FixedUpdate ausführen und zurücksetzen." },
 { id: "mmx-f9", cat: "MMPROV", topic: "mmp-licht", alt: true, src: SRC, front: "Lichtarten in Unity und was man per Code steuern kann.", back: "<ul><li><b>Directional</b>: Sonne, nur Rotation zählt.</li><li><b>Point</b>: Glühbirne, Position + <code>range</code>.</li><li><b>Spot</b>: Kegel, Position + Rotation + <code>range</code> + <code>spotAngle</code>.</li><li><b>Area</b>: Fläche, nur gebacken (bzw. HDRP realtime).</li></ul>Per Code (Light-Komponente): <code>enabled</code>, <code>intensity</code>, <code>color</code>, <code>range</code>, <code>spotAngle</code>, <code>type</code>, <code>shadows</code>; Rotation/Position über <code>transform</code>. Steuerbar nur im Mode <b>Realtime</b> (bzw. Mixed); Baked-Licht steckt in Lightmaps. Material-Farbe: <code>GetComponent&lt;Renderer&gt;().material.color</code>, Leuchten über Emission." }
);

/* ---------- Prüfungsfokus ---------- */
c.examPrep = {
  format: "<b>Es wurden keine Altprüfungen bereitgestellt – MMPROV hat auch keine schriftliche Prüfung.</b> Die LV ist prüfungsimmanent, beurteilt werden drei Teile (gesamt 100 Punkte): <b>A · Aufgabe 1: 3D Animation</b> (Abgabe Programm und Code) <b>35 %</b>, <b>B · Aufgabe 2: myRollABall</b> (Abgabe Programm und Code) <b>55 %</b>, <b>C · Exkursion</b> – Dokumentation laut Punkteliste in Moodle und Kurzinfo <b>10 %</b>. <b>Alle drei Teile müssen separat positiv sein</b>, Mindesterreichung 61 Punkte; Mitarbeit zählt als Bonus. Umsetzung in Unity unter Windows mit C#; beide Aufgaben werden in den Übungen behandelt und können teilweise dort umgesetzt werden. KI ist erlaubt, die Nutzung inkl. Prompts muss aber dokumentiert und als DOC-File am Ende abgegeben werden. Mind. 75 % Anwesenheit; 2./3. Antritt mit denselben Kriterien. Die Fragen und Skriptaufgaben hier sind selbst erstellte Übungen, die genau die Fertigkeiten der beiden Abgaben trainieren.",
  sources: ["Syllabus MMPROV (IMA25)", "Kursdatei MMPROV (Beurteilung, Abgabetermine, Aufgaben)"],
  strategy: [
    "Sehr gut heißt ≥ 91 Punkte: Bei B (55 %) und A (35 %) zählt jeder Punkt – erfülle zuerst alle Pflichtvorgaben der Aufgabenstellungen in Moodle vollständig, erst dann Extras. Frag früh nach dem genauen Bewertungsraster je Aufgabe.",
    "Die Exkursion (10 %) muss positiv sein und ist die leichteste Punktequelle: Punkteliste in Moodle abarbeiten, Kurzinfo fristgerecht abgeben.",
    "myRollABall ist mehr als das Tutorial: plane 2–4 eigene, sauber umgesetzte Erweiterungen (Sound, Sprung, Gegner, Timer/Neustart, zweites Level) und decke damit die Syllabus-Themen ab (Audio, Interaktion, Animation, Licht).",
    "Aufgabe 1 (3D Animation): zeige Syllabus-Themen explizit – Objekte per Code erzeugen/steuern, Licht per Code, Animation sowohl im Editor (Animator) als auch per Code, Maus- und Tastatur-Interaktion.",
    "Code-Qualität: sprechende Namen, Dateiname = Klassenname, [SerializeField] statt GameObject.Find in Update, Physik in FixedUpdate, Time.deltaTime, keine Console-Fehler. Du musst jede Zeile erklären können – auch KI-generierte.",
    "Mitarbeit zählt als Bonus: in den Übungen aktiv mitarbeiten und Teile direkt dort umsetzen; Build vor jeder Abgabe außerhalb des Editors testen und KI-DOC-File laufend führen."
  ],
  focus: [
    { topic: "mmp-rollaball", weight: 3, note: "Aufgabe 2 myRollABall = 55 % – größter Einzelteil; dazu Abgabe- und KI-Regeln" },
    { topic: "mmp-physik", weight: 3, note: "Rigidbody, AddForce, Trigger/Collision sind der Kern von Roll-a-Ball" },
    { topic: "mmp-anim", weight: 3, note: "Aufgabe 1 „3D Animation“ = 35 %; Animation mit Editor und Code ist Syllabus-Inhalt" },
    { topic: "mmp-code", weight: 3, note: "GameObjects über Code steuern, Prefabs, Instantiate – in beiden Aufgaben" },
    { topic: "mmp-csharp", weight: 3, note: "Lifecycle, Update/FixedUpdate, deltaTime – Grundlage jedes Skripts" },
    { topic: "mmp-input", weight: 2, note: "Interaktion mit Maus/Touch/Tastatur (Syllabus), Steuerung in beiden Aufgaben" },
    { topic: "mmp-licht", weight: 2, note: "Lichtquellen setzen und steuern (Syllabus) – gut für Aufgabe 1" },
    { topic: "mmp-media", weight: 2, note: "Audio- und Videofiles abspielen (Syllabus) – Sound als myRollABall-Erweiterung" },
    { topic: "mmp-ui", weight: 2, note: "Videoplayer-Interface (Syllabus), Count/Win-UI in Roll-a-Ball" },
    { topic: "mmp-editor", weight: 1, note: "Werkzeug: Szene, Hierarchy, Prefabs, Build Settings" }
  ],
  checklist: [
    { id: "mmxc1", topic: "mmp-editor", text: "Unity-Version der LV unter Windows installiert; Testprojekt (3D) läuft; Hierarchy/Inspector/Project/Scene/Game sicher bedienen." },
    { id: "mmxc2", topic: "mmp-rollaball", text: "Aufgabenstellungen A und B sowie Exkursions-Punkteliste aus Moodle gelesen; Abgabetermine eingetragen." },
    { id: "mmxc3", topic: "mmp-rollaball", text: "KI-Logbuch (DOC-File) mit Datum, Tool, Prompt, Ergebnis und eigener Anpassung geführt – am Ende mit abgeben." },
    { id: "mmxc4", topic: "mmp-csharp", text: "Lifecycle (Awake, Start, Update, FixedUpdate, LateUpdate, OnTrigger/OnCollision) erklären und richtig einsetzen." },
    { id: "mmxc5", topic: "mmp-code", text: "Objekte per Code erzeugen (Instantiate, CreatePrimitive), finden, verändern, deaktivieren und löschen; Prefabs mit Overrides verstehen." },
    { id: "mmxc6", topic: "mmp-licht", text: "Directional/Point/Spot setzen und per Code schalten, dimmen, färben; Realtime vs. Baked kennen." },
    { id: "mmxc7", topic: "mmp-anim", text: "AnimationClip mit Keyframes, Animator Controller mit Trigger-Transition, und Animation per Code (Rotate, Sin, Lerp in Coroutine) umsetzen." },
    { id: "mmxc8", topic: "mmp-input", text: "Tastatur (GetKey/Down/Up, GetAxis), Maus-Klick per Raycast und Touch (TouchPhase.Began) implementieren; Active Input Handling passend eingestellt." },
    { id: "mmxc9", topic: "mmp-media", text: "AudioSource/AudioListener, PlayOneShot, PlayClipAtPoint, 2D/3D-Sound (spatialBlend); VideoPlayer mit Prepare und Render Texture." },
    { id: "mmxc10", topic: "mmp-ui", text: "Videoplayer-UI: RawImage, Play/Pause-Button, Zeitleiste mit SetValueWithoutNotify, Lautstärke, Zeitanzeige." },
    { id: "mmxc11", topic: "mmp-physik", text: "Rigidbody vs. kinematisch, Collider vs. Trigger, ForceMode, Continuous Collision Detection gezielt einsetzen." },
    { id: "mmxc12", topic: "mmp-rollaball", text: "Roll-a-Ball-Basis komplett: Ground, Wände, Player (Rigidbody, AddForce), Kamera in LateUpdate, Pickup-Prefab mit Rotator + Tag + Trigger, Count- und Win-Text." },
    { id: "mmxc13", topic: "mmp-rollaball", text: "Eigene „my“-Erweiterungen umgesetzt, getestet und begründbar (z. B. Sound, Sprung, Gegner, Timer/Neustart, Level 2)." },
    { id: "mmxc14", topic: "mmp-anim", text: "Aufgabe 1 (3D Animation) deckt Code-Steuerung, Licht, Animation (Editor + Code) und Interaktion ab; fristgerecht abgegeben." },
    { id: "mmxc15", topic: "mmp-rollaball", text: "Windows-Build mit allen Szenen in den Build Settings erstellt, außerhalb des Editors getestet; Projekt ohne Library/Temp/Logs gepackt." },
    { id: "mmxc16", topic: "mmp-rollaball", text: "Exkursion besucht und Dokumentation laut Punkteliste + Kurzinfo abgegeben (muss positiv sein!)." },
    { id: "mmxc17", topic: "mmp-csharp", text: "Jede Zeile des eigenen Codes (auch KI-unterstützte) erklären können; Console ohne Fehler/Warnungen." },
    { id: "mmxc18", topic: "mmp-editor", text: "Mind. 75 % Anwesenheit; in den Übungen mitarbeiten (Bonus) und Aufgaben dort teilweise umsetzen." }
  ],
  tasks: [
   { id: "mmxr1", topic: "mmp-code", title: "Objekte per Code: rotierender Ring aus Prefabs", pts: 10,
     html: "Schreibe ein Skript <code>RingSpawner</code> (auf einem leeren GameObject), das beim Start <b>n</b> Würfel aus einem Prefab im Kreis mit Radius <b>r</b> um das Objekt anordnet, jedem Würfel eine eigene Farbe (Farbkreis) gibt und den ganzen Ring dauerhaft um die Y-Achse dreht. Zusatz: Jeder Würfel schwebt mit eigener Phase auf und ab.",
     solution: S(`using UnityEngine;

public class RingSpawner : MonoBehaviour
{
    [SerializeField] private GameObject cubePrefab;      // im Inspector zuweisen
    [SerializeField] private int anzahl = 12;
    [SerializeField] private float radius = 5f;
    [SerializeField] private float drehGeschwindigkeit = 30f; // Grad pro Sekunde

    void Start()
    {
        for (int i = 0; i < anzahl; i++)
        {
            float winkel = i * Mathf.PI * 2f / anzahl;           // Bogenmaß
            Vector3 offset = new Vector3(Mathf.Cos(winkel), 0f, Mathf.Sin(winkel)) * radius;

            GameObject cube = Instantiate(cubePrefab, transform.position + offset,
                                          Quaternion.identity, transform);   // Child des Rings
            cube.name = "Cube_" + i;
            cube.GetComponent<Renderer>().material.color =
                Color.HSVToRGB((float)i / anzahl, 0.8f, 1f);
            cube.AddComponent<Schweber>();
        }
    }

    void Update()
    {
        transform.Rotate(0f, drehGeschwindigkeit * Time.deltaTime, 0f);
    }
}`) + "Datei <code>Schweber.cs</code>:" + S(`using UnityEngine;

public class Schweber : MonoBehaviour
{
    public float amplitude = 0.5f;
    public float frequenz = 1f;          // Schwingungen pro Sekunde
    private Vector3 start;
    private float phase;

    void Start()
    {
        start = transform.localPosition;      // lokal, weil der Parent sich dreht
        phase = Random.Range(0f, Mathf.PI * 2f);
    }

    void Update()
    {
        float y = amplitude * Mathf.Sin(Time.time * frequenz * 2f * Mathf.PI + phase);
        transform.localPosition = start + Vector3.up * y;
    }
}`) + "<b>Erklärpunkte:</b> Kreisposition über cos/sin; <code>(float)i / anzahl</code> – ohne Cast wäre es eine Ganzzahldivision (immer 0); Instantiate mit Parent → Drehen des Parents dreht alle; <code>.material</code> erzeugt je Würfel eine eigene Materialinstanz (sonst hätten alle dieselbe Farbe); localPosition im Schweber, damit die Rotation des Rings erhalten bleibt. Ohne Prefab: <code>GameObject.CreatePrimitive(PrimitiveType.Cube)</code> + <code>transform.SetParent(transform)</code>." },
   { id: "mmxr2", topic: "mmp-licht", title: "Licht per Code: Tag/Nacht und Lampe", pts: 10,
     html: "Skript <code>LichtSteuerung</code>: Ein Directional Light („Sonne“) dreht sich in <b>tagesDauer</b> Sekunden einmal um die X-Achse; Helligkeit und Farbe hängen vom Sonnenstand ab (Mittag weiß/hell, Horizont orange/dunkel). Ein Point Light („Lampe“) wird mit <b>L</b> ein-/ausgeschaltet und pulsiert in der Intensität zwischen 1 und 3. Mit <b>C</b> wechselt die Lampenfarbe zyklisch (rot → grün → blau).",
     solution: S(`using UnityEngine;

public class LichtSteuerung : MonoBehaviour
{
    [SerializeField] private Light sonne;            // Directional Light, Mode: Realtime
    [SerializeField] private Light lampe;            // Point Light, Mode: Realtime
    [SerializeField] private float tagesDauer = 20f; // Sekunden für 360°
    [SerializeField] private Color tagFarbe = Color.white;
    [SerializeField] private Color abendFarbe = new Color(1f, 0.5f, 0.2f);

    private readonly Color[] farben = { Color.red, Color.green, Color.blue };
    private int farbIndex;

    void Update()
    {
        // Sonne: 360° in tagesDauer Sekunden
        sonne.transform.Rotate(360f / tagesDauer * Time.deltaTime, 0f, 0f);

        // Sonnenhöhe: 1 = Licht kommt senkrecht von oben, 0 = Horizont oder Nacht
        float hoehe = Mathf.Clamp01(Vector3.Dot(-sonne.transform.forward, Vector3.up));
        sonne.intensity = Mathf.Lerp(0f, 1.2f, hoehe);
        sonne.color = Color.Lerp(abendFarbe, tagFarbe, hoehe);

        // Lampe ein/aus
        if (Input.GetKeyDown(KeyCode.L))
            lampe.enabled = !lampe.enabled;

        // Farbe zyklisch wechseln
        if (Input.GetKeyDown(KeyCode.C))
        {
            farbIndex = (farbIndex + 1) % farben.Length;
            lampe.color = farben[farbIndex];
        }

        // Pulsieren zwischen 1 und 3 (PingPong läuft 0..1..0)
        lampe.intensity = 1f + 2f * Mathf.PingPong(Time.time, 1f);
    }
}`) + "<b>Erklärpunkte:</b> Beim Directional Light zählt nur die Rotation; <code>transform.forward</code> zeigt in Leuchtrichtung, deshalb <code>-forward</code> zur Sonne; Skalarprodukt mit <code>Vector3.up</code> = Sonnenhöhe; <code>Color.Lerp</code>/<code>Mathf.Lerp</code> interpolieren; <code>enabled</code> schaltet nur die Light-Komponente (nicht das GameObject); Lichter müssen auf <b>Realtime</b> stehen, sonst wirkt die Steuerung nicht. Modulo sorgt für den Zyklus." },
   { id: "mmxr3", topic: "mmp-anim", title: "Animation: Tür per Coroutine, Truhe per Animator", pts: 12,
     html: "<ol><li>Skript <code>Tuer</code>: Ein Klick auf die Tür fährt sie in <b>dauer</b> Sekunden weich um 3 Einheiten nach oben, ein weiterer Klick wieder nach unten. Während der Bewegung werden Klicks ignoriert.</li><li>Eine Truhe hat einen Animator mit den States <i>Zu</i> und <i>Auf</i>. Beschreibe die Einrichtung im Animator und schreibe das Skript, das per Klick öffnet.</li></ol>",
     solution: "<b>a)</b>" + S(`using System.Collections;
using UnityEngine;

public class Tuer : MonoBehaviour
{
    [SerializeField] private Vector3 offenOffset = new Vector3(0f, 3f, 0f);
    [SerializeField] private float dauer = 1.5f;
    private Vector3 zuPos;
    private bool offen;
    private bool laeuft;

    void Start()
    {
        zuPos = transform.position;
    }

    void OnMouseDown()                       // braucht einen Collider an der Tür
    {
        if (laeuft) return;
        Vector3 ziel = offen ? zuPos : zuPos + offenOffset;
        StartCoroutine(Bewege(ziel));
    }

    IEnumerator Bewege(Vector3 ziel)
    {
        laeuft = true;
        Vector3 start = transform.position;
        float t = 0f;
        while (t < 1f)
        {
            t += Time.deltaTime / dauer;
            transform.position = Vector3.Lerp(start, ziel, Mathf.SmoothStep(0f, 1f, t));
            yield return null;               // bis zum nächsten Frame warten
        }
        transform.position = ziel;           // exakt am Ziel ankommen
        offen = !offen;
        laeuft = false;
    }
}`) + "<b>b)</b> Animation-Fenster: Clip <i>TruheAuf</i> mit Keyframes für die Deckel-Rotation (0° → −110°), Clip <i>TruheZu</i> umgekehrt. Animator Controller: Default-State <i>Zu</i>; Parameter <b>Trigger</b> „Oeffnen“ und „Schliessen“; Transition Zu → Auf mit Condition Oeffnen, Auf → Zu mit Schliessen; <b>Has Exit Time aus</b>, damit sofort reagiert wird; Loop Time bei den Clips aus." + S(`using UnityEngine;

[RequireComponent(typeof(Animator))]
public class Truhe : MonoBehaviour
{
    private Animator animator;
    private bool offen;

    void Awake()
    {
        animator = GetComponent<Animator>();
    }

    void OnMouseDown()
    {
        animator.SetTrigger(offen ? "Schliessen" : "Oeffnen");
        offen = !offen;
    }
}`) + "<b>Erklärpunkte:</b> Coroutine = Methode, die über mehrere Frames läuft (<code>yield return null</code>); <code>t</code> von 0 bis 1 in <code>dauer</code> Sekunden; SmoothStep für weiches Anfahren/Bremsen; das Flag <code>laeuft</code> verhindert parallele Coroutines. OnMouseDown funktioniert nur mit dem alten Input Manager (Active Input Handling: Input Manager oder Both) – sonst Raycast-Lösung aus Aufgabe 4 verwenden." },
   { id: "mmxr4", topic: "mmp-input", title: "Interaktion: Auswahl per Klick/Touch und Kamerasteuerung", pts: 12,
     html: "<ol><li>Skript <code>Auswahl</code>: Klick (Maus) oder Tipp (Touch) auf ein Objekt markiert es gelb; die vorherige Auswahl erhält ihre ursprüngliche Farbe zurück; Klick ins Leere hebt die Auswahl auf. Trigger-Collider sollen ignoriert werden.</li><li>Skript <code>KameraSteuerung</code>: WASD/Pfeiltasten bewegen die Kamera in Blickrichtung, Q/E drehen sie um die Hochachse, das Mausrad zoomt.</li></ol>",
     solution: "<b>a)</b>" + S(`using UnityEngine;

public class Auswahl : MonoBehaviour
{
    [SerializeField] private Color markierFarbe = Color.yellow;
    [SerializeField] private LayerMask klickbar = ~0;     // alle Layer
    private Renderer auswahl;
    private Color originalFarbe;

    void Update()
    {
        bool gedrueckt = false;
        Vector3 zeiger = Vector3.zero;

        if (Input.touchCount > 0 && Input.GetTouch(0).phase == TouchPhase.Began)
        {
            gedrueckt = true;
            zeiger = Input.GetTouch(0).position;
        }
        else if (Input.GetMouseButtonDown(0))
        {
            gedrueckt = true;
            zeiger = Input.mousePosition;
        }
        if (!gedrueckt) return;

        Ray ray = Camera.main.ScreenPointToRay(zeiger);
        if (Physics.Raycast(ray, out RaycastHit hit, 100f, klickbar,
                            QueryTriggerInteraction.Ignore))
            Markiere(hit.collider.GetComponent<Renderer>());
        else
            Markiere(null);
    }

    void Markiere(Renderer neu)
    {
        if (auswahl != null)
            auswahl.material.color = originalFarbe;         // alte Auswahl zurücksetzen
        auswahl = neu;
        if (auswahl != null)
        {
            originalFarbe = auswahl.material.color;
            auswahl.material.color = markierFarbe;
        }
    }
}`) + "<b>b)</b>" + S(`using UnityEngine;

public class KameraSteuerung : MonoBehaviour
{
    [SerializeField] private float tempo = 5f;
    [SerializeField] private float drehTempo = 120f;     // Grad pro Sekunde
    [SerializeField] private float zoomTempo = 2f;

    void Update()
    {
        float h = Input.GetAxis("Horizontal");   // A/D, Pfeil links/rechts
        float v = Input.GetAxis("Vertical");     // W/S, Pfeil hoch/runter
        transform.Translate(new Vector3(h, 0f, v) * tempo * Time.deltaTime, Space.Self);

        if (Input.GetKey(KeyCode.Q))
            transform.Rotate(0f, -drehTempo * Time.deltaTime, 0f, Space.World);
        if (Input.GetKey(KeyCode.E))
            transform.Rotate(0f, drehTempo * Time.deltaTime, 0f, Space.World);

        float scroll = Input.mouseScrollDelta.y;
        if (scroll != 0f)
            transform.Translate(Vector3.forward * scroll * zoomTempo, Space.Self);
    }
}`) + "<b>Erklärpunkte:</b> Touch zuerst prüfen, weil Unity Touches standardmäßig auch als Mausklick simuliert (sonst doppelte Auswertung); <code>ScreenPointToRay</code> + <code>Physics.Raycast</code> mit LayerMask und <code>QueryTriggerInteraction.Ignore</code>; Originalfarbe merken; GetAxis ist geglättet (−1…1), GetKey gilt solange gedrückt, GetKeyDown nur im Frame des Drückens; Translate in <code>Space.Self</code> bewegt in Blickrichtung, Drehung in <code>Space.World</code> um die globale Y-Achse (kein Kippen). Bei Input System only: <code>Mouse.current</code>, <code>Keyboard.current</code>, <code>Touchscreen.current</code> verwenden." },
   { id: "mmxr5", topic: "mmp-ui", title: "Videoplayer-Interface programmieren", pts: 14,
     html: "Gegeben: VideoPlayer (Render Mode Render Texture, Audio Output Mode <i>Direct</i>), Canvas mit RawImage, ein Button mit TextMeshPro-Text, zwei Slider (Zeitleiste 0–1, Lautstärke 0–1) und ein Zeit-Text. Schreibe <code>VideoUI</code>: Play/Pause (Beschriftung wechselt), Springen per Zeitleiste, Zeitleiste läuft mit, Lautstärke, Anzeige „mm:ss / mm:ss“, beim Videoende zurück auf „Play“.",
     solution: S(`using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Video;
using TMPro;

public class VideoUI : MonoBehaviour
{
    [SerializeField] private VideoPlayer vp;
    [SerializeField] private Button playPauseButton;
    [SerializeField] private TMP_Text playPauseLabel;
    [SerializeField] private Slider zeitSlider;     // Min 0, Max 1
    [SerializeField] private Slider lautSlider;     // Min 0, Max 1
    [SerializeField] private TMP_Text zeitText;

    void Start()
    {
        playPauseButton.onClick.AddListener(PlayPause);
        zeitSlider.onValueChanged.AddListener(Springe);
        lautSlider.onValueChanged.AddListener(v => vp.SetDirectAudioVolume(0, v));
        lautSlider.value = 1f;

        vp.playOnAwake = false;
        vp.loopPointReached += Ende;
        vp.Prepare();                               // Länge und erstes Bild laden
        playPauseLabel.text = "Play";
    }

    void PlayPause()
    {
        if (vp.isPlaying)
        {
            vp.Pause();
            playPauseLabel.text = "Play";
        }
        else
        {
            vp.Play();
            playPauseLabel.text = "Pause";
        }
    }

    void Springe(float wert)
    {
        if (vp.length > 0)
            vp.time = wert * vp.length;
    }

    void Update()
    {
        if (vp.length <= 0) return;
        // ohne Event setzen, sonst würde Springe() aufgerufen (Rückkopplung)
        zeitSlider.SetValueWithoutNotify((float)(vp.time / vp.length));
        zeitText.text = Format(vp.time) + " / " + Format(vp.length);
    }

    void Ende(VideoPlayer quelle)
    {
        playPauseLabel.text = "Play";
        zeitSlider.SetValueWithoutNotify(0f);
    }

    static string Format(double sekunden)
    {
        int s = (int)sekunden;
        return (s / 60).ToString("00") + ":" + (s % 60).ToString("00");
    }

    void OnDestroy()
    {
        vp.loopPointReached -= Ende;              // Event sauber abmelden
    }
}`) + "<b>Erklärpunkte:</b> Listener per Code statt im Inspector (beides möglich); <code>vp.time</code> und <code>vp.length</code> sind <code>double</code> → Cast auf float für den Slider; <code>SetValueWithoutNotify</code> verhindert, dass das Nachführen der Zeitleiste einen Sprung auslöst (Ruckeln); <code>loopPointReached</code> meldet das Videoende; mit Audio Output Mode <i>AudioSource</i> stattdessen <code>audioSource.volume = v</code>. Die RawImage zeigt die RenderTexture, in die der VideoPlayer rendert." },
   { id: "mmxr6", topic: "mmp-rollaball", title: "myRollABall erweitern: Sprung, Sound, Zeitlimit, Gegner, Neustart", pts: 20,
     html: "Erweitere den PlayerController aus dem Roll-a-Ball-Tutorial:<ul><li>Sprung mit Leertaste – nur am Boden</li><li>Pickup-Sound, der auch nach dem Deaktivieren des Pickups hörbar ist</li><li>Zähler „Count: x / gesamt“, Zeitlimit mit Anzeige, Win- und Lose-Text</li><li>Berührung eines Objekts mit Tag „Enemy“ = verloren</li><li>Nach Spielende Neustart mit <b>R</b></li></ul>Schreibe außerdem ein Gegner-Skript, das sich mit konstantem Tempo auf den Spieler zubewegt.",
     solution: S(`using UnityEngine;
using UnityEngine.SceneManagement;
using TMPro;

public class PlayerController : MonoBehaviour
{
    [SerializeField] private float speed = 10f;
    [SerializeField] private float sprungKraft = 5f;
    [SerializeField] private float zeitLimit = 60f;
    [SerializeField] private TextMeshProUGUI countText;
    [SerializeField] private TextMeshProUGUI zeitText;
    [SerializeField] private GameObject winTextObject;
    [SerializeField] private GameObject loseTextObject;
    [SerializeField] private AudioClip pickupSound;

    private Rigidbody rb;
    private int count, totalPickups;
    private float movementX, movementY, restZeit;
    private bool springen, spielVorbei;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
        totalPickups = GameObject.FindGameObjectsWithTag("PickUp").Length;
        restZeit = zeitLimit;
        winTextObject.SetActive(false);
        loseTextObject.SetActive(false);
        SetCountText();
    }

    void Update()                                   // Eingabe + Zeit
    {
        if (spielVorbei)
        {
            if (Input.GetKeyDown(KeyCode.R))
                SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
            return;
        }

        movementX = Input.GetAxis("Horizontal");
        movementY = Input.GetAxis("Vertical");
        if (Input.GetKeyDown(KeyCode.Space) && AmBoden())
            springen = true;                        // merken, in FixedUpdate ausführen

        restZeit -= Time.deltaTime;
        zeitText.text = "Zeit: " + Mathf.CeilToInt(Mathf.Max(restZeit, 0f));
        if (restZeit <= 0f)
            SpielEnde(false);
    }

    void FixedUpdate()                              // Physik
    {
        if (spielVorbei) return;
        rb.AddForce(new Vector3(movementX, 0f, movementY) * speed);
        if (springen)
        {
            rb.AddForce(Vector3.up * sprungKraft, ForceMode.Impulse);
            springen = false;
        }
    }

    bool AmBoden()
    {
        // Ball mit Radius 0.5: knapp unter den Mittelpunkt prüfen
        return Physics.Raycast(transform.position, Vector3.down, 0.6f);
    }

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("PickUp"))
        {
            AudioSource.PlayClipAtPoint(pickupSound, other.transform.position);
            other.gameObject.SetActive(false);
            count++;
            SetCountText();
        }
    }

    void OnCollisionEnter(Collision collision)
    {
        if (collision.gameObject.CompareTag("Enemy"))
            SpielEnde(false);
    }

    void SetCountText()
    {
        countText.text = "Count: " + count + " / " + totalPickups;
        if (count >= totalPickups)
            SpielEnde(true);
    }

    void SpielEnde(bool gewonnen)
    {
        if (spielVorbei) return;
        spielVorbei = true;
        if (gewonnen) winTextObject.SetActive(true);
        else loseTextObject.SetActive(true);
        rb.isKinematic = true;                      // Ball anhalten
    }
}`) + "Gegner (Rigidbody mit <b>Is Kinematic</b>, Tag „Enemy“):" + S(`using UnityEngine;

public class Gegner : MonoBehaviour
{
    [SerializeField] private Transform spieler;
    [SerializeField] private float tempo = 2f;
    private Rigidbody rb;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
    }

    void FixedUpdate()
    {
        Vector3 ziel = new Vector3(spieler.position.x, rb.position.y, spieler.position.z);
        rb.MovePosition(Vector3.MoveTowards(rb.position, ziel, tempo * Time.fixedDeltaTime));
    }
}`) + "<b>Erklärpunkte:</b> Eingabe in Update, Kräfte in FixedUpdate (Sprung über Flag); Impulse für den Sprung; der Raycast startet im Ball und trifft dessen eigenen Collider nicht; <code>PlayClipAtPoint</code> überlebt das Deaktivieren; Pickups = Trigger → <code>OnTriggerEnter</code>, Gegner = fester Körper → <code>OnCollisionEnter</code> (kinematischer Rigidbody löst beim dynamischen Ball Kollisionen aus); <code>MovePosition</code> statt transform für Rigidbodies; das Flag <code>spielVorbei</code> verhindert doppeltes Spielende; LoadScene braucht die Szene in den Build Settings. Win/Lose-Texte und Zeit-Text im Inspector zuweisen." },
   { id: "mmxr7", topic: "mmp-physik", title: "Physik: bewegte Plattform und Absturzzone", pts: 10,
     html: "<ol><li>Eine Plattform soll in <b>dauer</b> Sekunden um einen Vektor <b>weg</b> hin und zurück fahren und den Ball dabei physikalisch korrekt mitnehmen/anschieben.</li><li>Unter dem Spielfeld liegt eine große, unsichtbare Absturzzone. Fällt der Ball hinein, wird er ohne Restgeschwindigkeit auf einen Startpunkt zurückgesetzt. Welche Komponenten brauchen die Objekte?</li></ol>",
     solution: "<b>a)</b> Plattform: Collider + Rigidbody mit <b>Is Kinematic</b>." + S(`using UnityEngine;

public class Plattform : MonoBehaviour
{
    [SerializeField] private Vector3 weg = new Vector3(4f, 0f, 0f);
    [SerializeField] private float dauer = 3f;
    private Rigidbody rb;
    private Vector3 start;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
        rb.isKinematic = true;
        start = rb.position;
    }

    void FixedUpdate()
    {
        float t = Mathf.PingPong(Time.time / dauer, 1f);   // 0..1..0
        rb.MovePosition(start + weg * t);
    }
}`) + "<b>b)</b> Absturzzone: Box Collider mit <b>Is Trigger</b>, Mesh Renderer aus/entfernt; Ball: Tag „Player“, Rigidbody, Sphere Collider." + S(`using UnityEngine;

public class Absturzzone : MonoBehaviour
{
    [SerializeField] private Transform startpunkt;

    void OnTriggerEnter(Collider other)
    {
        if (!other.CompareTag("Player")) return;
        Rigidbody rb = other.attachedRigidbody;
        rb.linearVelocity = Vector3.zero;     // Unity 6; ältere Versionen: rb.velocity
        rb.angularVelocity = Vector3.zero;
        rb.position = startpunkt.position;
    }
}`) + "<b>Erklärpunkte:</b> Kinematische Rigidbodies werden nicht von Kräften bewegt, schieben aber dynamische Körper; <code>MovePosition</code> in FixedUpdate interpoliert sauber (transform.position würde „teleportieren“ und den Ball durchdringen); Trigger statt Collider, weil der Ball durch die Zone fallen soll und nur das Ereignis zählt; Geschwindigkeit und Drehung zurücksetzen, sonst rollt der Ball nach dem Reset weiter. Für sehr schnelle Bälle: Collision Detection <i>Continuous</i>." },
   { id: "mmxr8", topic: "mmp-media", title: "Audio: Aufprallsound nach Stärke und Musiksteuerung", pts: 8,
     html: "<ol><li>Skript <code>AufprallSound</code>: Bei jeder Kollision soll ein 3D-Sound abgespielt werden, dessen Lautstärke von der Aufprallgeschwindigkeit abhängt (sehr leichte Berührungen: kein Sound); leichte Tonhöhen-Variation.</li><li>Skript <code>Musik</code>: Hintergrundmusik in Schleife, <b>M</b> schaltet stumm, <b>P</b> pausiert/setzt fort.</li></ol>",
     solution: "<b>a)</b>" + S(`using UnityEngine;

[RequireComponent(typeof(AudioSource))]
public class AufprallSound : MonoBehaviour
{
    [SerializeField] private AudioClip aufprall;
    [SerializeField] private float maxGeschwindigkeit = 10f;
    private AudioSource quelle;

    void Awake()
    {
        quelle = GetComponent<AudioSource>();
        quelle.playOnAwake = false;
        quelle.spatialBlend = 1f;            // 1 = 3D-Sound, 0 = 2D
    }

    void OnCollisionEnter(Collision collision)
    {
        float staerke = Mathf.Clamp01(collision.relativeVelocity.magnitude / maxGeschwindigkeit);
        if (staerke > 0.1f)
        {
            quelle.pitch = Random.Range(0.9f, 1.1f);
            quelle.PlayOneShot(aufprall, staerke);   // Lautstärke-Faktor 0..1
        }
    }
}`) + "<b>b)</b> AudioSource auf einem eigenen Objekt: Clip = Musik, <b>Loop</b> an, <b>Play On Awake</b> an, Spatial Blend 0 (2D)." + S(`using UnityEngine;

public class Musik : MonoBehaviour
{
    [SerializeField] private AudioSource musik;

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.M))
            musik.mute = !musik.mute;

        if (Input.GetKeyDown(KeyCode.P))
        {
            if (musik.isPlaying) musik.Pause();
            else musik.UnPause();
        }
    }
}`) + "<b>Erklärpunkte:</b> Hörbar ist nur, was ein <b>AudioListener</b> (meist an der Main Camera, genau einer pro Szene) aufnimmt; <code>PlayOneShot</code> erlaubt überlappende Sounds und einen Lautstärkefaktor, <code>Play</code> würde den laufenden Clip neu starten; <code>relativeVelocity</code> = Aufprallgeschwindigkeit; spatialBlend 1 → Lautstärke und Panning hängen von der Position ab; Musik als 2D-Sound, damit sie überall gleich laut ist." }
  ]
};
})();
