/* MMPROV · Plus: Rechner (deltaTime/FPS, Lerp & Glättung, Sprung-Flugbahn, Lautstärke in dB, Videozeit), Schritt-Animationen
   (Lifecycle, Update vs. FixedUpdate, Parent/Child-Transform, Raycast, Animator, Pickup-Ablauf), Beispiele je Lektion und Zusatzfragen */
(function () {
const C = window.STUDYOS_CALC = window.STUDYOS_CALC || {};
const FIG = window.STUDYOS_FIG = window.STUDYOS_FIG || {};
const FX = window.FX;
const { svg, g, t, tl, r, box, l } = FX;
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const S = s => "<pre><code>" + esc(s) + "</code></pre>";
const nf = (n, d = 2) => (typeof n === "number" && isFinite(n)) ? n.toLocaleString("de-AT", { maximumFractionDigits: d }) : "–";

/* ===================== Rechner ===================== */
C["mmprov-fps"] = {
  title: "Framerate und Time.deltaTime",
  intro: "Ein Objekt soll sich mit einer festen Geschwindigkeit bewegen. Vergleiche: mit <code>* Time.deltaTime</code> (Einheiten pro Sekunde) und ohne (Einheiten pro Frame).",
  inputs: [
    { k: "v", label: "speed", v: 5, min: 0.1, max: 30, step: 0.1, unit: "Einh./s" },
    { k: "fps", label: "Framerate", v: 60, min: 10, max: 240, step: 1, unit: "FPS" },
    { k: "s", label: "Spielzeit", v: 2, min: 0.5, max: 10, step: 0.5, unit: "s" }
  ],
  out: v => { const dt = 1 / v.fps;
    return [["Time.deltaTime", nf(dt * 1000, 2), "ms"], ["Weg pro Frame (mit deltaTime)", nf(v.v * dt, 4), "Einh."], ["Weg nach " + nf(v.s, 1) + " s mit deltaTime", nf(v.v * v.s, 2), "Einh.", true], ["Weg ohne deltaTime", nf(v.v * v.fps * v.s, 1), "Einh."], ["FixedUpdate-Aufrufe pro Frame (Ø, 0,02 s)", nf(50 / v.fps, 2), ""]]; },
  steps: v => { const dt = 1 / v.fps;
    return `Time.deltaTime ≈ 1 / FPS = 1 / ${v.fps} = <b>${nf(dt, 4)} s</b><br>
    Mit deltaTime: pro Frame speed · deltaTime = ${v.v} · ${nf(dt, 4)} = ${nf(v.v * dt, 4)}; nach ${v.s} s: ${v.fps} · ${v.s} Frames · ${nf(v.v * dt, 4)} = <b>${nf(v.v * v.s, 2)}</b> Einheiten – unabhängig von der FPS.<br>
    Ohne deltaTime: speed wird pro <i>Frame</i> addiert: ${v.v} · ${v.fps} · ${v.s} = <b>${nf(v.v * v.fps * v.s, 1)}</b> Einheiten – doppelte FPS, doppelter Weg.<br>
    FixedUpdate läuft unabhängig davon 1 / 0,02 = 50-mal pro Sekunde, also im Schnitt ${nf(50 / v.fps, 2)}-mal pro Frame.`; },
  plot: { x: v => [0, v.s], xl: "Zeit (s)", yl: "Weg (Einheiten)",
    fns: [{ label: "mit deltaTime (jede FPS)", f: (x, v) => v.v * x }, { label: "ohne deltaTime @ 30 FPS", f: (x, v) => v.v * 30 * x }, { label: "ohne deltaTime @ gewählte FPS", f: (x, v) => v.v * v.fps * x }] }
};

const smooth = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
const follow = (x, v) => { const f = Math.min(1, v.k / v.fps), n = Math.floor(x * v.fps + 1e-9); return v.d * (1 - Math.pow(1 - f, n)); };
C["mmprov-lerp"] = {
  title: "Lerp, SmoothStep und „Lerp-Glättung“ im Vergleich",
  intro: "Ein Objekt fährt von 0 zu einem Ziel. <b>Lerp</b> mit t = Zeit/Dauer ist linear, <b>SmoothStep</b> beschleunigt und bremst sanft, und <code>Lerp(pos, ziel, k * Time.deltaTime)</code> pro Frame nähert sich nur asymptotisch an.",
  inputs: [
    { k: "d", label: "Distanz zum Ziel", v: 10, min: 1, max: 50, step: 1, unit: "Einh." },
    { k: "D", label: "Dauer (Lerp/SmoothStep)", v: 2, min: 0.2, max: 10, step: 0.1, unit: "s" },
    { k: "k", label: "Glättungsfaktor k", v: 3, min: 0.5, max: 20, step: 0.5, unit: "1/s" },
    { k: "fps", label: "Framerate", v: 60, min: 10, max: 240, step: 1, unit: "FPS" }
  ],
  out: v => { const f = Math.min(1, v.k / v.fps), n95 = f >= 1 ? 1 : Math.ceil(Math.log(0.05) / Math.log(1 - f));
    return [["Lerp nach halber Dauer", nf(v.d * 0.5, 2), "Einh."], ["SmoothStep nach ¼ Dauer", nf(v.d * smooth(0.25), 2), "Einh."], ["Glättung: Anteil pro Frame", nf(f * 100, 2), "%"], ["Glättung: 95 % erreicht nach", nf(n95 / v.fps, 2), "s", true]]; },
  steps: v => { const f = Math.min(1, v.k / v.fps), n95 = f >= 1 ? 1 : Math.ceil(Math.log(0.05) / Math.log(1 - f));
    return `<b>Lerp</b>: pos = Lerp(0, ${v.d}, t / ${v.D}) – bei t = ${nf(v.D / 2)} s: ${v.d} · 0,5 = ${nf(v.d / 2)}<br>
    <b>SmoothStep</b>: s(u) = 3u² − 2u³; bei u = 0,25: 3 · 0,0625 − 2 · 0,015625 = 0,15625 → ${nf(v.d * 0.15625, 3)} (langsamer Start), bei u = 0,5 genau die Hälfte.<br>
    <b>Lerp-Glättung</b>: pro Frame wird der Anteil k · deltaTime = ${v.k} / ${v.fps} = ${nf(f, 4)} des Restwegs zurückgelegt. Rest nach n Frames: (1 − ${nf(f, 4)})<sup>n</sup>.<br>
    95 % erreicht, wenn (1 − ${nf(f, 4)})<sup>n</sup> ≤ 0,05 → n = ln 0,05 / ln(1 − ${nf(f, 4)}) ≈ <b>${n95} Frames ≈ ${nf(n95 / v.fps, 2)} s</b>. Das Ziel wird mathematisch nie ganz erreicht – darum am Ende einrasten (z. B. wenn der Abstand &lt; 0,01).<br>
    <small>Weil k · deltaTime nur näherungsweise frameunabhängig ist, weicht das Ergebnis bei sehr niedriger FPS etwas ab; exakt wäre 1 − e<sup>−k·Δt</sup>.</small>`; },
  plot: { x: v => [0, Math.max(v.D, 3 / v.k) * 1.2], y: v => [0, v.d * 1.05], xl: "Zeit (s)", yl: "Position",
    fns: [{ label: "Lerp (linear)", f: (x, v) => v.d * Math.min(1, x / v.D) }, { label: "SmoothStep", f: (x, v) => v.d * smooth(x / v.D) }, { label: "Lerp-Glättung pro Frame", f: follow }] }
};

C["mmprov-jump"] = {
  title: "Sprung mit ForceMode.Impulse: Höhe, Flugzeit, Flugbahn",
  intro: "<code>rb.AddForce(Vector3.up * jump, ForceMode.Impulse)</code> ändert die Geschwindigkeit sofort um Impuls / Masse. Danach bremst die Schwerkraft (Unity-Standard 9,81 m/s²). Luftwiderstand (Damping) bleibt hier unberücksichtigt.",
  inputs: [
    { k: "J", label: "Impuls (jump)", v: 5, min: 0.5, max: 30, step: 0.5, unit: "N·s" },
    { k: "m", label: "Masse (Rigidbody.mass)", v: 1, min: 0.1, max: 10, step: 0.1, unit: "kg" },
    { k: "g", label: "Schwerkraft", v: 9.81, min: 1, max: 30, step: 0.01, unit: "m/s²" },
    { k: "vx", label: "Vorwärtsgeschwindigkeit", v: 3, min: 0.5, max: 15, step: 0.5, unit: "m/s" }
  ],
  out: v => { const v0 = v.J / v.m, h = v0 * v0 / (2 * v.g), tu = v0 / v.g;
    return [["Startgeschwindigkeit v₀ = J / m", nf(v0, 2), "m/s"], ["Maximale Höhe", nf(h, 2), "m", true], ["Zeit bis zum Gipfel", nf(tu, 2), "s"], ["Flugzeit gesamt", nf(2 * tu, 2), "s"], ["Sprungweite", nf(v.vx * 2 * tu, 2), "m"]]; },
  steps: v => { const v0 = v.J / v.m, h = v0 * v0 / (2 * v.g), tu = v0 / v.g;
    return `v₀ = J / m = ${v.J} / ${v.m} = <b>${nf(v0, 3)} m/s</b><br>
    h<sub>max</sub> = v₀² / (2g) = ${nf(v0, 3)}² / (2 · ${v.g}) = <b>${nf(h, 3)} m</b><br>
    t<sub>Gipfel</sub> = v₀ / g = ${nf(tu, 3)} s, Flugzeit = 2 · t<sub>Gipfel</sub> = <b>${nf(2 * tu, 3)} s</b><br>
    Weite = v<sub>x</sub> · Flugzeit = ${v.vx} · ${nf(2 * tu, 3)} = <b>${nf(v.vx * 2 * tu, 2)} m</b><br>
    <small>Doppelte Masse halbiert v₀ und viertelt die Höhe. Mit <code>ForceMode.VelocityChange</code> wäre die Masse egal (v₀ = Wert direkt).</small>`; },
  plot: { x: v => { const tu = (v.J / v.m) / v.g; return [0, Math.max(0.5, v.vx * 2 * tu * 1.08)]; }, y: v => { const v0 = v.J / v.m; return [0, Math.max(0.2, v0 * v0 / (2 * v.g) * 1.15)]; }, xl: "Weite (m)", yl: "Höhe (m)",
    fns: [{ label: "Flugbahn", f: (x, v) => { const tt = x / v.vx, y = (v.J / v.m) * tt - v.g / 2 * tt * tt; return y >= -1e-9 ? y : NaN; } },
          { label: "mit doppelter Masse", f: (x, v) => { const tt = x / v.vx, y = (v.J / (2 * v.m)) * tt - v.g / 2 * tt * tt; return y >= -1e-9 ? y : NaN; } }],
    points: v => { const v0 = v.J / v.m, tu = v0 / v.g; return [{ x: v.vx * tu, y: v0 * v0 / (2 * v.g), label: "Gipfel" }]; } }
};

C["mmprov-audio"] = {
  title: "AudioSource.volume in Dezibel und Abstandsdämpfung",
  intro: "<code>volume</code> ist ein linearer Faktor von 0 bis 1 – unser Ohr hört aber logarithmisch. Dazu: Wie leise wird ein 3D-Sound mit der Entfernung (logarithmischer Rolloff, näherungsweise minDistance / Abstand)?",
  inputs: [
    { k: "vol", label: "volume", v: 0.5, min: 0.01, max: 1, step: 0.01, unit: "" },
    { k: "min", label: "Min Distance", v: 1, min: 0.1, max: 20, step: 0.1, unit: "m" },
    { k: "dist", label: "Abstand zum AudioListener", v: 4, min: 0.1, max: 100, step: 0.1, unit: "m" }
  ],
  out: v => { const roll = v.dist <= v.min ? 1 : v.min / v.dist, eff = v.vol * roll;
    return [["volume in dB", nf(20 * Math.log10(v.vol), 1), "dB"], ["Rolloff-Faktor (≈)", nf(roll, 3), ""], ["wirksame Lautstärke (≈)", nf(eff, 3), ""], ["wirksam in dB (≈)", nf(20 * Math.log10(eff), 1), "dB", true]]; },
  steps: v => { const roll = v.dist <= v.min ? 1 : v.min / v.dist;
    return `dB = 20 · log₁₀(volume) = 20 · log₁₀(${v.vol}) = <b>${nf(20 * Math.log10(v.vol), 2)} dB</b> (volume 0,5 ≈ −6 dB, 0,1 = −20 dB)<br>
    Rolloff (logarithmisch, vereinfacht): bis Min Distance volle Lautstärke, danach ≈ min / d = ${v.min} / ${v.dist} = ${nf(roll, 3)}<br>
    Wirksam: ${v.vol} · ${nf(roll, 3)} = ${nf(v.vol * roll, 3)} → <b>${nf(20 * Math.log10(v.vol * roll), 1)} dB</b>. Jede Verdopplung des Abstands kostet so etwa 6 dB.<br>
    <small>Gilt nur für 3D-Sound (Spatial Blend = 1). Eine 2D-Hintergrundmusik ist überall gleich laut. Die exakte Kurve lässt sich in der AudioSource als Custom Rolloff einstellen.</small>`; },
  plot: { x: v => [0.1, Math.max(v.dist * 2, v.min * 4)], xl: "Abstand (m)", yl: "Lautstärke",
    fns: [{ label: "wirksame Lautstärke (≈)", f: (x, v) => v.vol * (x <= v.min ? 1 : v.min / x) }],
    points: v => [{ x: v.dist, y: v.vol * (v.dist <= v.min ? 1 : v.min / v.dist), label: "Listener" }] }
};

const mmss = s => { s = Math.max(0, Math.floor(s)); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); };
C["mmprov-video"] = {
  title: "Videoplayer-Interface: Zeit, Slider und Frame",
  intro: "Was müssen Zeitanzeige und Slider zeigen? <code>videoPlayer.time</code> und <code>length</code> sind Sekunden (double), der Slider läuft von 0 bis 1.",
  inputs: [
    { k: "len", label: "videoPlayer.length", v: 212, min: 5, max: 3600, step: 1, unit: "s" },
    { k: "time", label: "videoPlayer.time", v: 83.4, min: 0, max: 3600, step: 0.1, unit: "s" },
    { k: "fr", label: "frameRate", v: 30, min: 12, max: 60, step: 1, unit: "fps" }
  ],
  out: v => { const tm = Math.min(v.time, v.len);
    return [["Anzeige", mmss(tm) + " / " + mmss(v.len), "", true], ["slider.value", nf(tm / v.len, 4), ""], ["aktueller Frame", Math.floor(tm * v.fr), ""], ["Frames gesamt", Math.round(v.len * v.fr), ""], ["Restzeit", mmss(v.len - tm), ""]]; },
  steps: v => { const tm = Math.min(v.time, v.len);
    return `Minuten = (int)(time / 60) = ${Math.floor(tm / 60)}, Sekunden = (int)(time % 60) = ${Math.floor(tm) % 60} → <b>${mmss(tm)}</b> (Format <code>{0:00}:{1:00}</code>)<br>
    slider.value = time / length = ${nf(tm, 1)} / ${v.len} = <b>${nf(tm / v.len, 4)}</b><br>
    Frame = time · frameRate = ${nf(tm, 1)} · ${v.fr} = ${nf(tm * v.fr, 1)} → Frame ${Math.floor(tm * v.fr)}<br>
    Springen (Slider gezogen auf Wert w): <code>videoPlayer.time = w * videoPlayer.length</code>; den Slider beim Abspielen mit <code>SetValueWithoutNotify</code> aktualisieren, sonst löst jedes Update selbst einen Sprung aus.`; }
};

/* ===================== Animationen ===================== */
FIG["mmprov-lifecycle"] = { title: "MonoBehaviour-Lifecycle: wer wird wann aufgerufen?",
  svg: () => { const B = (x, y, w, s, hl, cls) => box(x, y, w, 34, s, { fs: 12, cls: cls || "fx-card", hl });
    return svg(640, 300,
      t(14, 22, "einmal beim Start", { a: "start", fs: 11.5, cls: "fx-sub" }) +
      B(14, 32, 120, "Awake()", "1") + l(134, 49, 152, 49, { arrow: true }) + B(154, 32, 120, "OnEnable()", "1") + l(274, 49, 292, 49, { arrow: true }) + B(294, 32, 120, "Start()", "2") +
      g({ st: 3 }, t(14, 104, "jeder Frame (Schleife)", { a: "start", fs: 11.5, cls: "fx-sub" }) + r(14, 112, 612, 96, { cls: "fx-soft", rx: 12 }) +
        B(28, 124, 132, "FixedUpdate() 0…n×", "3", "fx-card") + l(160, 141, 178, 141, { arrow: true }) +
        B(180, 124, 128, "OnTrigger/Collision", "3", "fx-card") + l(308, 141, 326, 141, { arrow: true }) +
        B(328, 124, 92, "Update()", "4") + l(420, 141, 438, 141, { arrow: true }) + B(440, 124, 100, "LateUpdate()", "5") + l(540, 141, 556, 141, { arrow: true }) +
        B(558, 124, 58, "Bild", "5", "fx-ok") + FX.p("M587 158 C587 196 94 196 94 160", { arrow: true, cls: "acc" }) + t(340, 200, "nächster Frame", { fs: 10.5, cls: "fx-sub" })) +
      g({ st: 6 }, t(14, 236, "am Ende", { a: "start", fs: 11.5, cls: "fx-sub" }) + B(14, 244, 130, "OnDisable()", "6") + l(144, 261, 162, 261, { arrow: true }) + B(164, 244, 130, "OnDestroy()", "6")) +
      [["0", "Unity ruft diese Methoden selbst auf –|du rufst sie nie direkt."], ["1", "Awake: Referenzen holen,|auch wenn das Skript deaktiviert ist."], ["2", "Start: einmal vor dem ersten|Update, nur wenn aktiv."], ["3", "Physik im festen Takt (0,02 s),|danach Physik-Ereignisse."], ["4", "Update: Eingaben lesen,|Bewegung mit deltaTime."], ["5", "LateUpdate: Kamera folgt,|nachdem alles bewegt wurde."], ["6", "Beim Deaktivieren bzw.|Zerstören des Objekts."]].map(([on, s]) => g({ on }, tl(520, 52, s, { fs: 11.5, lh: 16 }))).join("") +
      g({ on: "6" }, tl(470, 262, "SetActive(false) → OnDisable|Destroy(obj) → OnDisable + OnDestroy", { fs: 11, lh: 15, cls: "fx-sub" })));
  },
  steps: [
    "Jedes Skript, das von <code>MonoBehaviour</code> erbt, bekommt seine Methoden von Unity aufgerufen – in einer festen Reihenfolge.",
    "<code>Awake</code> und <code>OnEnable</code> laufen sofort beim Laden des Objekts. Awake läuft sogar, wenn das Skript-Häkchen aus ist (das GameObject muss aber aktiv sein).",
    "<code>Start</code> läuft genau einmal, unmittelbar vor dem ersten Update – nur wenn Objekt und Skript aktiv sind. Typisch: Startwerte setzen, UI initialisieren.",
    "Pro Frame zuerst die Physik: <code>FixedUpdate</code> 0-, 1- oder mehrmals (fester Takt), danach Trigger- und Kollisionsereignisse.",
    "Dann <code>Update</code> einmal pro Frame: Eingaben abfragen, Objekte ohne Physik bewegen (mit <code>Time.deltaTime</code>).",
    "<code>LateUpdate</code> läuft, nachdem alle Updates fertig sind – ideal für die Kamera. Danach wird das Bild gerendert, und der nächste Frame beginnt.",
    "Am Ende: <code>OnDisable</code> beim Deaktivieren, <code>OnDestroy</code> beim Zerstören (auch beim Szenenwechsel)."
  ] };

FIG["mmprov-timeline"] = { title: "Update vs. FixedUpdate auf der Zeitachse",
  svg: () => { const X = s => 40 + s * 5600, frames = [0, 0.016, 0.033, 0.083, 0.091, 0.1], fixed = [0.02, 0.04, 0.06, 0.08, 0.1];
    return svg(640, 300,
      l(30, 150, 620, 150, { arrow: true }) + [0, 0.02, 0.04, 0.06, 0.08, 0.1].map(s => t(X(s), 170, nf(s, 2) + " s", { fs: 10.5, cls: "fx-sub" })).join("") +
      t(30, 40, "Update (Frames, unregelmäßig)", { a: "start", fs: 12, fw: 700 }) +
      frames.map((s, i) => g({ hl: i === 3 ? "2" : i === 4 ? "3" : undefined }, r(X(s) - 14, 56, 28, 28, { cls: "fx-acc", rx: 6 }) + t(X(s), 75, "U", { fs: 12, fw: 700, cls: "fx-onacc" }) + l(X(s), 84, X(s), 146, { cls: "fx-dashacc" }))).join("") +
      g({ st: 1 }, t(30, 206, "FixedUpdate (fest alle 0,02 s)", { a: "start", fs: 12, fw: 700 }) +
        fixed.map(s => r(X(s) - 12, 216, 24, 24, { cls: "fx-ok", rx: 5 }) + t(X(s), 233, "F", { fs: 11.5, fw: 700 }) + l(X(s), 154, X(s), 214, { cls: "fx-dashacc" })).join("")) +
      g({ on: "1" }, tl(365, 112, "Frames: mal 16 ms, mal 50 ms.|Physik: immer 20 ms.", { fs: 11.5, lh: 16, cls: "fx-sub" })) +
      g({ on: "2" }, r(X(0.033) + 6, 92, X(0.083) - X(0.033) - 12, 40, { cls: "fx-warn" }) + tl((X(0.033) + X(0.083)) / 2, 112, "langsamer Frame:|3× FixedUpdate", { fs: 11, lh: 14 })) +
      g({ on: "3" }, r(476, 92, 154, 40, { cls: "fx-bad" }) + tl(553, 112, "kein FixedUpdate –|GetKeyDown dort verpasst", { fs: 10.5, lh: 14 })) +
      g({ on: "4" }, r(14, 252, 612, 40, { cls: "fx-soft" }) + t(320, 277, "Eingaben in Update lesen (merken), Kräfte in FixedUpdate anwenden.", { fs: 12 })));
  },
  steps: [
    "Oben die Frames: <code>Update</code> läuft einmal pro gerendertem Bild. Die Abstände schwanken je nach Last – hier zwischen 8 und 50 ms.",
    "Unten <code>FixedUpdate</code>: unabhängig von der Framerate exakt alle 0,02 s Spielzeit (Standard, 50 Hz). Unity holt vor jedem Frame so viele Physik-Schritte nach, wie seit dem letzten Frame fällig wurden.",
    "Nach dem langsamen Frame (33 → 83 ms) sind drei Physik-Schritte fällig (0,04, 0,06, 0,08): FixedUpdate läuft vor diesem Update dreimal hintereinander.",
    "Der nächste Frame kommt schon nach 8 ms – dazwischen liegt kein Physik-Tick. Wer <code>Input.GetKeyDown</code> in FixedUpdate abfragt, verpasst Tastendrücke, die nur in diesem einen Frame „true“ sind.",
    "Deshalb: Eingaben in <code>Update</code> lesen und in einer Variable merken, Kräfte (<code>AddForce</code>) in <code>FixedUpdate</code> anwenden. Bewegung in Update mit <code>Time.deltaTime</code>, in FixedUpdate ist der Schritt fix."
  ] };

FIG["mmprov-hierarchy"] = { title: "Parent und Child: localPosition vs. position",
  svg: () => { const O = { x: 60, y: 250 }, U = 40, P = (x, z) => [O.x + x * U, O.y - z * U];
    const grid = [...Array(13)].map((_, i) => l(O.x + i * U, 30, O.x + i * U, O.y, { cls: "fx-dashacc" })).join("") + [...Array(6)].map((_, i) => l(O.x, O.y - i * U, O.x + 12 * U, O.y - i * U, { cls: "fx-dashacc" })).join("");
    const cube = (x, z, s, lab, o) => { const [px, py] = P(x, z), w = s * U * 0.7; return g(o, r(px - w / 2, py - w / 2, w, w, { cls: o.cls || "fx-acc", rx: 4 }) + t(px, o.below ? py + w / 2 + 14 : py - w / 2 - 6, lab, { fs: 11, fw: 700 })); };
    return svg(640, 300, `<g opacity=".35">${grid}</g>` + t(O.x + 12 * U, O.y + 18, "x", { fs: 11, cls: "fx-sub" }) + t(O.x - 10, 34, "z", { fs: 11, cls: "fx-sub" }) +
      [0, 2, 4, 6, 8, 10, 12].map(i => t(O.x + i * U, O.y + 16, String(i), { fs: 10, cls: "fx-sub" })).join("") +
      cube(2, 1, 1, "Parent (2, 0, 1)", { on: "0,1" }) + cube(2, 1, 2, "Parent, scale 2", { on: "2", cls: "fx-acc" }) + cube(2, 4, 2, "Parent (2, 0, 4), scale 2", { on: "3,4", cls: "fx-acc" }) +
      cube(3, 1, 1, "Child", { on: "1", cls: "fx-ok", below: 1 }) + cube(4, 1, 2, "Child", { on: "2", cls: "fx-ok", below: 1 }) + cube(4, 4, 2, "Child", { on: "3,4", cls: "fx-ok", below: 1 }) +
      r(390, 40, 236, 108, { cls: "fx-card" }) +
      [["0", "Parent: position = (2, 0, 1)|scale = 1"], ["1", "Child: localPosition = (1, 0, 0)|→ position = (3, 0, 1)"], ["2", "Parent scale = 2:|Child-Abstand wird mitskaliert|→ position = (4, 0, 1)"], ["3", "Parent verschoben auf (2, 0, 4):|Child wandert mit → (4, 0, 4)|localPosition bleibt (1, 0, 0)"], ["4", "transform.position = Welt|transform.localPosition = relativ|zum Parent"]].map(([on, s]) => g({ on }, tl(508, 96, s, { fs: 11.5, lh: 17 }))).join(""));
  },
  steps: [
    "Draufsicht auf die Szene (x nach rechts, z nach oben). Ein leeres Parent-Objekt steht bei (2, 0, 1).",
    "Ein Child mit <code>localPosition = (1, 0, 0)</code> liegt eine Einheit rechts vom Parent – in Weltkoordinaten (3, 0, 1).",
    "Wird der Parent auf <code>scale = 2</code> gesetzt, wächst auch das Child, und sein lokaler Abstand zählt doppelt: Welt-x = 2 + 2 · 1 = 4.",
    "Verschiebt man den Parent nach (2, 0, 4), wandert das Child mit. Seine localPosition ändert sich dabei nicht.",
    "Merke: <code>position</code> ist die Weltposition, <code>localPosition</code> die Position relativ zum Parent (Inspector zeigt die lokale). Darum gruppiert man zusammengehörige Objekte unter einem Parent."
  ] };

FIG["mmprov-raycast"] = { title: "Mausklick auf ein 3D-Objekt: der Raycast",
  svg: () => svg(640, 300,
    g({}, r(24, 120, 44, 34, { cls: "fx-soft", rx: 6 }) + `<path d="M68 128 L86 118 L86 156 L68 146 Z" class="fx-soft"/>`) + t(46, 176, "Main Camera", { fs: 11, fw: 700 }) +
    r(150, 40, 70, 220, { cls: "fx-card", rx: 4 }) + t(185, 32, "Bildschirm", { fs: 11, cls: "fx-sub" }) +
    g({ st: 1 }, FX.c(185, 132, 6, { cls: "fx-acc" }) + t(185, 280, "mousePosition (x, y)", { fs: 10.5, cls: "fx-sub" })) +
    g({ st: 2 }, l(86, 137, 610, 125, { cls: "acc", arrow: true, acc: true })) +
    box(300, 110, 90, 40, "Kugel|ohne Collider", { fs: 10.5, lh: 13, cls: "fx-ghost", rx: 20 }) +
    box(460, 98, 70, 54, "Würfel|+ BoxCollider", { fs: 10.5, lh: 13, cls: "fx-card", hl: "3,4" }) +
    g({ st: 3 }, FX.c(460, 128, 6, { cls: "fx-acc" }) + t(460, 176, "hit.point", { fs: 10.5, cls: "fx-sub" })) +
    g({ on: "2" }, tl(380, 230, "Der Strahl geht durch die Kugel|hindurch – sie hat keinen Collider.", { fs: 11.5, lh: 16 })) +
    g({ on: "3" }, tl(380, 230, "Physics.Raycast(ray, out hit) → true|hit.collider.gameObject = Würfel", { fs: 11.5, lh: 16 })) +
    g({ on: "4" }, box(240, 206, 380, 50, "hit.collider.GetComponent<Renderer>()|.material.color = Color.red".replace("<", "&lt;").replace(">", "&gt;"), { fs: 11.5, lh: 16, cls: "fx-ok" }))),
  steps: [
    "Die Maus klickt auf einen <b>2D-Punkt</b> am Bildschirm. Welches 3D-Objekt liegt „dahinter“?",
    "<code>Input.mousePosition</code> liefert die Pixelkoordinaten des Klicks (Ursprung links unten).",
    "<code>Camera.main.ScreenPointToRay(Input.mousePosition)</code> erzeugt einen Strahl von der Kamera durch diesen Punkt in die Szene. Die Kugel ohne Collider ist für die Physik unsichtbar.",
    "<code>Physics.Raycast(ray, out RaycastHit hit)</code> liefert true beim ersten getroffenen <b>Collider</b>: hier der Würfel. <code>hit.point</code> ist der Auftreffpunkt, <code>hit.distance</code> die Entfernung.",
    "Jetzt kannst du mit dem getroffenen Objekt arbeiten, z. B. es einfärben. Kürzere Alternative: <code>OnMouseDown()</code> in einem Skript am Objekt – braucht ebenfalls einen Collider."
  ] };

FIG["mmprov-animator"] = { title: "Animator: Tür auf und zu per Bool-Parameter",
  svg: () => svg(640, 300,
    box(24, 110, 90, 36, "Entry", { fs: 12, cls: "fx-ok", rx: 18 }) + l(114, 128, 186, 128, { arrow: true }) +
    box(188, 104, 130, 48, "Closed|(DoorClosed.anim)", { fs: 11.5, lh: 15, cls: "fx-soft", hl: "0,1,4" }) +
    box(450, 104, 130, 48, "Open|(DoorOpen.anim)", { fs: 11.5, lh: 15, cls: "fx-soft", hl: "2,3" }) +
    FX.p("M318 116 C370 90 400 90 448 116", { arrow: true, cls: "acc", st: 0 }) + t(383, 82, "isOpen == true", { fs: 11 }) +
    FX.p("M448 142 C400 168 370 168 318 142", { arrow: true, cls: "acc" }) + t(383, 182, "isOpen == false", { fs: 11 }) +
    r(24, 210, 210, 74, { cls: "fx-card" }) + t(129, 230, "Parameter", { fs: 11.5, fw: 700 }) +
    [["isOpen = false", "0,1,4"], ["isOpen = true", "2,3"]].map(([s, on]) => t(129, 260, s, { fs: 13, fw: 700, on })).join("") +
    r(250, 210, 376, 74, { cls: "fx-card" }) +
    [["0", "Start: Entry → Default-State Closed"], ["1", "Taste O: animator.SetBool(\"isOpen\", true)"], ["2", "Bedingung erfüllt → Übergang nach Open"], ["3", "Has Exit Time aus: sofort, ohne auf Clip-Ende zu warten"], ["4", "Erneut O: SetBool(\"isOpen\", false) → zurück"]].map(([on, s]) => g({ on }, t(438, 252, s, { fs: 11.5 }))).join("")),
  steps: [
    "Der Animator Controller ist eine <b>State Machine</b>. Beim Start geht es von <i>Entry</i> in den Default-State <i>Closed</i>.",
    "Das Skript reagiert auf die Taste O und setzt den Bool-Parameter: <code>doorAnimator.SetBool(\"isOpen\", true)</code>.",
    "Die Transition Closed → Open hat die Bedingung <code>isOpen == true</code>. Sie ist erfüllt, der Clip <i>DoorOpen</i> wird abgespielt.",
    "Soll die Tür sofort reagieren, muss bei der Transition <b>Has Exit Time</b> deaktiviert sein – sonst wartet Unity, bis der aktuelle Clip durchgelaufen ist.",
    "Mit <code>SetBool(\"isOpen\", false)</code> greift die Rück-Transition. Für einmalige Ereignisse (Sprung, Schuss) nimmt man stattdessen einen <b>Trigger</b>-Parameter und <code>SetTrigger</code>."
  ] };

FIG["mmprov-pickup"] = { title: "Roll-a-Ball: vom Berühren zum Punktestand",
  svg: () => { const st = ["Ball rollt in den|Pickup (Is Trigger)", "OnTriggerEnter|(Collider other)", "other.gameObject|.CompareTag(\"PickUp\")", "SetActive(false)", "count++|SetCountText()", "count >= 12 →|winTextObject aktiv"];
    return svg(640, 300,
      FX.c(70, 70, 22, { cls: "fx-acc" }) + t(70, 108, "Player", { fs: 11, fw: 700 }) +
      g({ on: "0,1,2" }, r(150, 52, 36, 36, { cls: "fx-ok", rx: 4 }) + t(168, 108, "PickUp", { fs: 11, fw: 700 })) +
      g({ on: "3,4,5" }, r(150, 52, 36, 36, { cls: "fx-ghost", rx: 4 }) + t(168, 108, "deaktiviert", { fs: 11, cls: "fx-sub" })) +
      g({ on: "0" }, l(96, 70, 144, 70, { arrow: true, cls: "acc" })) +
      r(250, 40, 376, 70, { cls: "fx-card" }) + t(438, 62, "UI (TextMeshPro)", { fs: 11.5, fw: 700 }) +
      [["Count: 11", "0,1,2,3"], ["Count: 12", "4,5"]].map(([s, on]) => t(438, 92, s, { fs: 15, fw: 700, on })).join("") +
      g({ on: "5" }, t(560, 92, "You Win!", { fs: 13, fw: 700 })) +
      st.map((s, i) => { const x = 14 + (i % 3) * 208, y = 126 + Math.floor(i / 3) * 60; return box(x, y, 192, 48, (i + 1) + " · " + s, { fs: 11, lh: 15, cls: i === 2 ? "fx-soft" : "fx-card", hl: String(i) }) + (i % 3 < 2 ? l(x + 192, y + 24, x + 206, y + 24, { arrow: true }) : ""); }).join("") +
      g({ on: "2" }, tl(320, 268, "CompareTag statt other.tag == \"PickUp\": schneller und ohne Garbage.|Tippfehler im Tag (\"Pickup\") = nichts passiert!", { fs: 11.5, lh: 16 })) +
      g({ on: "1" }, tl(320, 268, "Voraussetzung: Collider an beiden, Is Trigger am Pickup,|Rigidbody am Ball.", { fs: 11.5, lh: 16 })) +
      g({ on: "3" }, tl(320, 268, "SetActive(false) statt Destroy: Objekt bleibt in der Szene,|kann z. B. beim Neustart wieder aktiviert werden.", { fs: 11.5, lh: 16 })));
  },
  steps: [
    "Der Ball (Rigidbody + SphereCollider, Tag „Player“) rollt auf einen rotierenden Pickup-Würfel zu. Der Pickup hat einen Collider mit <b>Is Trigger</b>.",
    "Die Physik meldet die Überschneidung: Unity ruft <code>OnTriggerEnter(Collider other)</code> im PlayerController auf – <code>other</code> ist der Collider des Pickups.",
    "Nicht jeder Trigger ist ein Pickup. Darum prüft man <code>other.gameObject.CompareTag(\"PickUp\")</code> – Groß-/Kleinschreibung muss exakt zum Tag passen.",
    "Der Pickup wird mit <code>SetActive(false)</code> ausgeblendet (statt zerstört).",
    "Der Zähler erhöht sich, <code>SetCountText()</code> schreibt „Count: 12“ in das TextMeshPro-Feld.",
    "Ist die Anzahl erreicht (hier 12 Pickups), wird der Gewinntext aktiviert. Erweiterungen wie Countdown oder Neustart hängen genau hier an."
  ] };

/* ===================== Beispiele je Lektion ===================== */
const ex = (title, html, label) => ({ t: "example", label: label || "Beispiel aus der Praxis", title, html });
const BLOCKS = {
  "mmp1-1": [{ t: "fig", id: "mmprov-hierarchy" }, ex("Ein Tisch aus fünf Würfeln – Positionen ausrechnen", `Ein Unity-Würfel ist 1 × 1 × 1 groß, seine Position ist die <b>Mitte</b>. Gesucht: Tisch, 0,8 m hoch, Platte 2 × 1 m, 0,1 m dick.<table class="dt"><tr><th>Objekt</th><th>Scale (x, y, z)</th><th>localPosition (x, y, z)</th><th>Begründung</th></tr><tr><td>Table (leer, Parent)</td><td>1, 1, 1</td><td>0, 0, 0</td><td>Bezugspunkt am Boden</td></tr><tr><td>Top</td><td>2, 0,1, 1</td><td>0, 0,75, 0</td><td>Oberkante 0,75 + 0,05 = 0,8</td></tr><tr><td>Leg FL</td><td>0,1, 0,7, 0,1</td><td>−0,95, 0,35, −0,45</td><td>Höhe 0,7 → Mitte bei 0,35; Rand: 1 − 0,05</td></tr><tr><td>Leg FR / BL / BR</td><td>0,1, 0,7, 0,1</td><td>±0,95, 0,35, ±0,45</td><td>Vorzeichen spiegeln</td></tr></table>Kontrolle: Beine reichen von 0 bis 0,7, die Platte von 0,7 bis 0,8 – kein Spalt, keine Überschneidung. Weil alle Teile Kinder von <i>Table</i> sind, verschiebt oder dreht man den Tisch über den Parent als Ganzes. Den <b>Parent nicht skalieren</b>, sonst verzerren sich die Kinder (vor allem nach Rotationen).`, "Beispiel durchgerechnet")],
  "mmp1-2": [{ t: "fig", id: "mmprov-lifecycle" }, { t: "calc", id: "mmprov-fps" }, ex("90 Grad pro Sekunde – bei 30 und 144 FPS", S(`public class Spinner : MonoBehaviour
{
    public float degPerSecond = 90f;
    void Update()
    {
        transform.Rotate(0f, degPerSecond * Time.deltaTime, 0f);   // richtig
        // transform.Rotate(0f, 1f, 0f);                            // 1 Grad pro FRAME
    }
}`) + `<table class="dt"><tr><th></th><th>30 FPS</th><th>144 FPS</th></tr><tr><td>Time.deltaTime</td><td>0,0333 s</td><td>0,00694 s</td></tr><tr><td>Drehung pro Frame (mit deltaTime)</td><td>90 · 0,0333 = 3°</td><td>90 · 0,00694 = 0,625°</td></tr><tr><td>Drehung pro Sekunde (mit deltaTime)</td><td>30 · 3° = <b>90°</b></td><td>144 · 0,625° = <b>90°</b></td></tr><tr><td>ohne deltaTime (1° pro Frame)</td><td>30°/s</td><td>144°/s – fast 5× so schnell</td></tr></table>Mit deltaTime ist die Einheit „pro Sekunde“, ohne „pro Frame“. Auf dem Gaming-PC würde sich das Objekt sonst viel schneller drehen als am Laptop.`, "Beispiel durchgerechnet")],
  "mmp2-1": [ex("Ein 5 × 4-Raster aus Prefabs, zentriert", S(`public class GridSpawner : MonoBehaviour
{
    public GameObject cubePrefab;       // im Inspector zuweisen
    public int cols = 5, rows = 4;
    public float spacing = 1.5f;

    void Start()
    {
        for (int i = 0; i < cols; i++)
            for (int j = 0; j < rows; j++)
            {
                float x = (i - (cols - 1) / 2f) * spacing;
                float z = (j - (rows - 1) / 2f) * spacing;
                GameObject c = Instantiate(cubePrefab, new Vector3(x, 0.5f, z), Quaternion.identity, transform);
                c.name = $"Cube_{i}_{j}";
            }
    }
}`) + `x-Werte bei 5 Spalten: (i − 2) · 1,5 → <b>−3; −1,5; 0; 1,5; 3</b>. z-Werte bei 4 Zeilen: (j − 1,5) · 1,5 → <b>−2,25; −0,75; 0,75; 2,25</b>. Ergebnis: 20 Würfel, symmetrisch um den Spawner. Wichtig: <code>/ 2f</code> statt <code>/ 2</code> – sonst rechnet C# ganzzahlig, (4 − 1) / 2 = 1 statt 1,5, und das Raster ist verschoben. Der letzte Parameter <code>transform</code> macht alle Würfel zu Kindern des Spawners (übersichtliche Hierarchy).`, "Beispiel durchgerechnet")],
  "mmp2-2": [ex("Tag-Nacht-Zyklus: Sonne drehen, Helligkeit anpassen", S(`public class DayNight : MonoBehaviour
{
    public Light sun;                       // Directional Light
    public float dayLength = 120f;          // Sekunden für 360°
    public Color nightColor = new Color(0.2f, 0.25f, 0.5f);

    void Update()
    {
        sun.transform.Rotate(Vector3.right, 360f / dayLength * Time.deltaTime);
        // wie steil scheint die Sonne nach unten? 1 = Mittag, <= 0 = Nacht
        float h = Mathf.Clamp01(Vector3.Dot(sun.transform.forward, Vector3.down));
        sun.intensity = h * 1.2f;
        sun.color = Color.Lerp(nightColor, Color.white, h);
    }
}`) + `Rechnung: 360° / 120 s = <b>3° pro Sekunde</b>, ein voller Tag dauert 2 Minuten. Steht die Sonne 30° über dem Horizont, ist <code>Dot(forward, down)</code> = sin 30° = <b>0,5</b> → intensity 0,6, Farbe halb zwischen Nachtblau und Weiß. Bei 90° (Mittag): 1,0 → intensity 1,2. Unter dem Horizont wird das Skalarprodukt negativ, <code>Clamp01</code> macht daraus 0. Bei einem Directional Light zählt nur die <b>Rotation</b>, nicht die Position.`, "Beispiel durchgerechnet")],
  "mmp2-3": [{ t: "fig", id: "mmprov-animator" }, { t: "calc", id: "mmprov-lerp" }, ex("Tür in 1,5 s öffnen – mit SmoothStep", S(`IEnumerator OpenDoor(float duration)
{
    Quaternion from = transform.rotation;
    Quaternion to = from * Quaternion.Euler(0f, 90f, 0f);
    float t = 0f;
    while (t < 1f)
    {
        t += Time.deltaTime / duration;
        transform.rotation = Quaternion.Slerp(from, to, Mathf.SmoothStep(0f, 1f, t));
        yield return null;
    }
    transform.rotation = to;          // exakt einrasten
}
// Aufruf: StartCoroutine(OpenDoor(1.5f));`) + `<table class="dt"><tr><th>Zeit</th><th>t = Zeit / 1,5</th><th>SmoothStep(t) = 3t² − 2t³</th><th>Winkel</th></tr><tr><td>0,375 s</td><td>0,25</td><td>0,156</td><td>14,1°</td></tr><tr><td>0,75 s</td><td>0,5</td><td>0,5</td><td>45°</td></tr><tr><td>1,125 s</td><td>0,75</td><td>0,844</td><td>75,9°</td></tr><tr><td>1,5 s</td><td>1</td><td>1</td><td>90°</td></tr></table>Im ersten und letzten Viertel bewegt sich die Tür nur je 14°, in der Mitte 62° – sie startet und stoppt weich. Mit reinem Lerp wären es gleichmäßig 22,5° pro Viertel. Das <code>transform.rotation = to</code> nach der Schleife gleicht aus, dass t im letzten Frame leicht über 1 springt.`, "Beispiel durchgerechnet")],
  "mmp3-1": [{ t: "fig", id: "mmprov-raycast" }, ex("Angeklicktes Objekt einfärben und Abstand anzeigen", S(`public class ClickPainter : MonoBehaviour
{
    public float maxDistance = 50f;
    void Update()
    {
        if (Input.GetMouseButtonDown(0))                 // nur im Klick-Frame
        {
            Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
            if (Physics.Raycast(ray, out RaycastHit hit, maxDistance))
            {
                hit.collider.GetComponent<Renderer>().material.color = Random.ColorHSV();
                Debug.Log($"{hit.collider.name} in {hit.distance:0.0} m bei {hit.point}");
            }
        }
    }
}`) + `Beispielausgabe: <code>Cube_2_1 in 7.4 m bei (1.50, 0.85, 0.75)</code>. Steht ein Objekt 60 m entfernt, liefert der Raycast wegen <code>maxDistance = 50</code> false. Typische Fehlerquellen: kein Collider am Objekt, Kamera nicht mit Tag <i>MainCamera</i> (dann ist <code>Camera.main</code> null), oder im Projekt ist nur das neue Input System aktiv (<code>Input.*</code> wirft dann eine Exception).`)],
  "mmp3-2": [{ t: "calc", id: "mmprov-audio" }, ex("Schritt-Sounds, die nicht nach Maschine klingen", S(`public class Footsteps : MonoBehaviour
{
    public AudioSource source;          // Spatial Blend = 1 (3D)
    public AudioClip[] steps;           // 4 verschiedene Clips
    public float stepInterval = 0.45f;  // Sekunden zwischen Schritten
    float timer;

    void Update()
    {
        bool moving = Input.GetAxis("Horizontal") != 0 || Input.GetAxis("Vertical") != 0;
        timer -= Time.deltaTime;
        if (moving && timer <= 0f)
        {
            source.pitch = Random.Range(0.9f, 1.1f);
            source.PlayOneShot(steps[Random.Range(0, steps.Length)], 0.5f);
            timer = stepInterval;
        }
    }
}`) + `Rechnung: 1 / 0,45 s ≈ <b>2,2 Schritte pro Sekunde</b>. <code>PlayOneShot(clip, 0.5f)</code> spielt mit halber Lautstärke (≈ −6 dB) und unterbricht einen noch laufenden Schritt nicht – anders als <code>Play()</code>. <code>Random.Range(0, steps.Length)</code> liefert bei int-Argumenten 0 bis 3 (obere Grenze exklusiv). Die Tonhöhe ±10 % und vier Clips verhindern den „Maschinengewehr-Effekt“. Achtung: <code>pitch</code> gilt für die ganze AudioSource, also auch für noch klingende OneShots.`)],
  "mmp3-3": [{ t: "calc", id: "mmprov-video" }, ex("Zeitanzeige und Slider synchron halten", S(`public class PlayerUI : MonoBehaviour
{
    public VideoPlayer vp;
    public Slider timeline;             // Min 0, Max 1
    public TMP_Text timeText;

    void Start() => timeline.onValueChanged.AddListener(Seek);

    void Update()
    {
        if (vp.length <= 0) return;                         // noch nicht vorbereitet
        timeline.SetValueWithoutNotify((float)(vp.time / vp.length));
        timeText.text = Format(vp.time) + " / " + Format(vp.length);
    }

    void Seek(float v) => vp.time = v * vp.length;

    static string Format(double s) =>
        string.Format("{0:00}:{1:00}", (int)(s / 60), (int)(s % 60));
}`) + `Video 3:32 (212 s), aktuelle Zeit 83,4 s: 83,4 / 60 = 1 Minute, 83,4 mod 60 = 23 Sekunden → <b>„01:23 / 03:32“</b>, Slider = 83,4 / 212 = <b>0,393</b>. Zieht die Benutzerin den Slider auf 0,75, springt das Video auf 0,75 · 212 = <b>159 s (02:39)</b>. Ohne <code>SetValueWithoutNotify</code> würde jedes Update <code>onValueChanged</code> auslösen und ständig neu springen – das Video ruckelt.`, "Beispiel durchgerechnet")],
  "mmp4-1": [{ t: "fig", id: "mmprov-timeline" }, { t: "calc", id: "mmprov-jump" }, ex("Sprung nur am Boden: Impuls 5 bei Masse 1", S(`public class Jumper : MonoBehaviour
{
    public float jumpImpulse = 5f;
    Rigidbody rb;
    bool jumpRequested;

    void Awake() => rb = GetComponent<Rigidbody>();

    void Update()                                  // Eingabe hier lesen
    {
        if (Input.GetKeyDown(KeyCode.Space)) jumpRequested = true;
    }

    void FixedUpdate()                             // Physik hier anwenden
    {
        bool grounded = Physics.Raycast(transform.position, Vector3.down, 0.55f);
        if (jumpRequested && grounded)
            rb.AddForce(Vector3.up * jumpImpulse, ForceMode.Impulse);
        jumpRequested = false;
    }
}`) + `Ball mit Radius 0,5 und Masse 1: v₀ = 5 / 1 = <b>5 m/s</b>, Höhe = 5² / (2 · 9,81) = <b>1,27 m</b>, Gipfel nach 5 / 9,81 = 0,51 s, Flugzeit <b>1,02 s</b>. Der Raycast ist 0,55 lang (Radius 0,5 + 0,05 Toleranz). Doppelte Masse (2 kg) ergibt nur noch 2,5 m/s und 0,32 m Höhe. Das <code>jumpRequested</code>-Flag verbindet Update (Eingabe) und FixedUpdate (Physik), damit kein Tastendruck verloren geht.`, "Beispiel durchgerechnet")],
  "mmp4-2": [{ t: "fig", id: "mmprov-pickup" }, ex("Countdown-Erweiterung: 60 Sekunden für 12 Pickups", S(`public float timeLimit = 60f;
float timeLeft;
bool running = true;

void Start() { timeLeft = timeLimit; count = 0; SetCountText(); }

void Update()
{
    if (!running) return;
    timeLeft -= Time.deltaTime;
    timerText.text = "Zeit: " + Mathf.CeilToInt(Mathf.Max(timeLeft, 0f));
    if (timeLeft <= 0f) { running = false; loseTextObject.SetActive(true); rb.isKinematic = true; }
}

void OnTriggerEnter(Collider other)
{
    if (!running || !other.gameObject.CompareTag("PickUp")) return;
    other.gameObject.SetActive(false);
    count++;
    SetCountText();
    if (count >= 12) { running = false; winTextObject.SetActive(true); }
}`) + `Rechnung: 12 Pickups in 60 s = im Schnitt <b>5 s pro Pickup</b>. Bei 60 FPS wird <code>timeLeft</code> pro Frame um ≈ 0,0167 verringert; <code>CeilToInt</code> zeigt 59,98 noch als „60“ und 0,4 als „1“ – erst bei 0 steht „0“. <code>rb.isKinematic = true</code> friert den Ball nach Ablauf ein (Physik wirkt nicht mehr).`, "Beispiel durchgerechnet")]
};
const CHK = {
  "mmp1-1": { t: "check", q: "Parent bei (2, 0, 1) mit scale 2, Child mit localPosition (1, 0, 0). Wo liegt das Child in Weltkoordinaten?", opts: ["(1, 0, 0)", "(3, 0, 1)", "(4, 0, 1)", "(2, 0, 2)"], a: 2, why: "Der lokale Abstand wird mit der Parent-Skalierung multipliziert: 2 + 2 · 1 = 4." },
  "mmp2-1": { t: "check", q: "Was ergibt in C# <code>(4 - 1) / 2</code>?", opts: ["1,5", "1", "2", "Fehler"], a: 1, why: "Ganzzahl-Division. Für 1,5: (4 - 1) / 2f." },
  "mmp3-3": { t: "check", q: "Warum aktualisiert man den Zeit-Slider in Update mit SetValueWithoutNotify?", opts: ["Weil value schreibgeschützt ist", "Damit onValueChanged nicht ausgelöst wird und das Video nicht bei jedem Frame neu springt", "Damit der Slider unsichtbar bleibt", "Weil es schneller rendert"], a: 1, why: "Nur echte Benutzeränderungen sollen einen Sprung (Seek) auslösen." },
  "mmp4-1": { t: "check", q: "Ein Frame dauert 50 ms, Fixed Timestep ist 0,02 s. Wie oft läuft FixedUpdate (ungefähr) vor diesem Update?", opts: ["0-mal", "1-mal", "2- bis 3-mal", "50-mal"], a: 2, why: "50 ms / 20 ms = 2,5 – je nach Lage der Takte 2 oder 3 Physik-Schritte." }
};
Object.entries(CHK).forEach(([k, b]) => BLOCKS[k].push(b));

/* ===================== Fragen ===================== */
const Q = [
 ["mmp-editor", "Wo liegt ein Unity-Würfel mit Position (0, 0,5, 0) und Scale (1, 1, 1) relativ zum Boden bei y = 0?", ["Er steckt halb im Boden", "Er steht genau auf dem Boden – die Position ist die Mitte", "Er schwebt 0,5 über dem Boden", "Er liegt unter dem Boden"], 1, "Würfel sind 1 hoch; Mitte bei 0,5 → Unterkante bei 0."],
 ["mmp-editor", "Was zeigt der Inspector bei einem Child-Objekt unter Transform → Position an?", ["Die Weltposition", "Die Position relativ zum Parent (localPosition)", "Die Bildschirmposition", "Die Position der Kamera"], 1, "Im Code entspricht das transform.localPosition."],
 ["mmp-editor", "Warum sollte man einen Parent mit Kindern möglichst nicht ungleichmäßig skalieren?", ["Weil Unity das verbietet", "Weil die Kinder mitskaliert und nach Rotationen verzerrt werden können", "Weil sonst die Hierarchy gelöscht wird", "Weil Scale nur für Kameras gilt"], 1, "Ungleichmäßige Scale vererbt sich – gedrehte Kinder werden geschert."],
 ["mmp-editor", "Welche Komponente hat jedes GameObject immer?", ["Rigidbody", "Renderer", "Transform", "Collider"], 2, "Ohne Transform keine Position in der Szene."],
 ["mmp-editor", "Ein leeres GameObject „Table“ wird verschoben. Was passiert mit seinen Kindern Top und Legs?", ["Nichts", "Sie bewegen sich mit, ihre localPosition bleibt gleich", "Sie werden gelöscht", "Ihre localPosition ändert sich"], 1, "Kinder folgen dem Parent; lokal ändert sich nichts."],
 ["mmp-csharp", "Bei 30 FPS dreht transform.Rotate(0, 90 * Time.deltaTime, 0) pro Frame um …", ["90°", "3°", "30°", "0,33°"], 1, "90 · (1/30) = 3° pro Frame, also 90° pro Sekunde."],
 ["mmp-csharp", "Was passiert, wenn man Bewegung in Update ohne Time.deltaTime schreibt?", ["Nichts, Unity gleicht aus", "Die Geschwindigkeit hängt von der Framerate ab", "Das Objekt bewegt sich gar nicht", "Es entsteht ein Compilerfehler"], 1, "Der Wert gilt dann pro Frame statt pro Sekunde."],
 ["mmp-csharp", "Welche Methode läuft auch dann, wenn das Skript-Häkchen deaktiviert ist (GameObject aktiv)?", ["Start", "Update", "Awake", "LateUpdate"], 2, "Awake läuft beim Laden; Start und Update nur bei aktivem Skript."],
 ["mmp-csharp", "Wie oft läuft FixedUpdate standardmäßig pro Sekunde?", ["30-mal", "50-mal", "60-mal", "So oft wie Update"], 1, "Fixed Timestep 0,02 s → 50 Hz."],
 ["mmp-csharp", "Der Klassenname im Skript lautet Spinner, die Datei heißt Rotator.cs. Was passiert?", ["Funktioniert normal", "Das Skript lässt sich nicht als Komponente anhängen", "Unity benennt die Datei automatisch um", "Nur Update läuft nicht"], 1, "Klassenname und Dateiname müssen übereinstimmen."],
 ["mmp-code", "Was bewirkt der letzte Parameter in Instantiate(prefab, pos, Quaternion.identity, transform)?", ["Die Rotation", "Das neue Objekt wird Kind des Objekts mit diesem Transform", "Die Skalierung", "Es wird sofort zerstört"], 1, "So landen gespawnte Objekte übersichtlich unter dem Spawner."],
 ["mmp-code", "Welche x-Positionen erzeugt (i - (5 - 1) / 2f) * 1.5f für i = 0 … 4?", ["0; 1,5; 3; 4,5; 6", "−3; −1,5; 0; 1,5; 3", "−2; −1; 0; 1; 2", "−6; −3; 0; 3; 6"], 1, "(i − 2) · 1,5 – symmetrisch um 0."],
 ["mmp-code", "Warum sollte GameObject.Find nicht in Update stehen?", ["Es funktioniert dort nicht", "Es durchsucht jedes Frame die ganze Szene – langsam; besser einmal in Start suchen und merken", "Es löscht Objekte", "Es ist nur im Editor verfügbar"], 1, "Referenzen cachen."],
 ["mmp-code", "Was ist der Unterschied zwischen SetActive(false) und Destroy(obj)?", ["Keiner", "SetActive blendet aus und lässt das Objekt bestehen; Destroy entfernt es endgültig", "Destroy ist rückgängig machbar", "SetActive löscht Komponenten"], 1, "Deaktivierte Objekte kann man später wieder einschalten."],
 ["mmp-code", "Was ist ein Prefab?", ["Ein Skript", "Eine wiederverwendbare Vorlage eines GameObjects mit Komponenten, aus der man Instanzen erzeugt", "Eine Szene", "Ein Material"], 1, "Änderungen am Prefab wirken auf alle Instanzen."],
 ["mmp-licht", "dayLength = 120 s für eine volle Umdrehung. Um wie viel Grad pro Sekunde dreht sich die Sonne?", ["120°", "3°", "0,33°", "360°"], 1, "360 / 120 = 3."],
 ["mmp-licht", "Was beeinflusst bei einem Directional Light die Beleuchtung der Szene?", ["Nur die Position", "Nur die Rotation (Richtung), nicht die Position", "Nur die Scale", "Position und Scale"], 1, "Directional Lights simulieren eine unendlich weit entfernte Quelle wie die Sonne."],
 ["mmp-licht", "Was liefert Color.Lerp(Color.black, Color.white, 0.25f)?", ["Weiß", "Ein dunkles Grau (0,25; 0,25; 0,25)", "Schwarz", "Ein helles Grau (0,75)"], 1, "Lineare Mischung: 25 % des Wegs von Schwarz zu Weiß."],
 ["mmp-licht", "Was ist der Unterschied zwischen renderer.material und renderer.sharedMaterial?", ["Keiner", "material erzeugt eine eigene Kopie für dieses Objekt; sharedMaterial ändert das Material aller Objekte, die es verwenden", "sharedMaterial ist schreibgeschützt", "material gilt nur im Editor"], 1, "Häufige Falle: sharedMaterial-Änderungen bleiben auch nach dem Play-Modus im Asset."],
 ["mmp-licht", "Welche Lichtart strahlt kegelförmig wie eine Taschenlampe?", ["Directional Light", "Point Light", "Spot Light", "Area Light"], 2, "Spot: Kegel mit Spot Angle; Point: in alle Richtungen."],
 ["mmp-anim", "Was ergibt Mathf.SmoothStep(0f, 1f, 0.25f)?", ["0,25", "0,15625", "0,5", "0,0625"], 1, "3 · 0,25² − 2 · 0,25³ = 0,1875 − 0,03125 = 0,15625."],
 ["mmp-anim", "Warum erreicht transform.position = Vector3.Lerp(transform.position, ziel, 5f * Time.deltaTime) das Ziel nie ganz?", ["Weil Lerp fehlerhaft ist", "Weil pro Frame nur ein Anteil des Restwegs zurückgelegt wird – der Rest wird kleiner, aber nie 0", "Weil deltaTime 0 ist", "Weil Vector3 gerundet wird"], 1, "Exponentielles Annähern; am Ende auf das Ziel einrasten."],
 ["mmp-anim", "Eine Tür soll beim Tastendruck sofort öffnen, wartet aber, bis die Idle-Animation fertig ist. Was ist zu ändern?", ["Loop Time aktivieren", "Bei der Transition „Has Exit Time“ deaktivieren", "Den Animator entfernen", "Die Animation rückwärts abspielen"], 1, "Mit Exit Time wartet der Übergang auf das Clip-Ende."],
 ["mmp-anim", "Welcher Parametertyp passt zu einem einmaligen Sprung-Ereignis?", ["Bool", "Trigger mit SetTrigger(\"Jump\")", "Float", "Int"], 1, "Ein Trigger setzt sich nach dem Übergang selbst zurück."],
 ["mmp-anim", "Ein Objekt wird per Animator animiert und gleichzeitig per Skript verschoben, bewegt sich aber nicht. Wahrscheinlichste Ursache?", ["Das Skript ist zu langsam", "Der Animator überschreibt die Position jeden Frame – besser ein leeres Parent-Objekt verwenden", "Es fehlt ein Rigidbody", "Die Kamera ist falsch"], 1, "Animierte Eigenschaften werden vom Animator gesetzt."],
 ["mmp-input", "Was liefert Physics.Raycast, wenn der Strahl nur ein Objekt ohne Collider trifft?", ["true", "false – Raycasts treffen nur Collider", "Eine Exception", "Das Objekt"], 1, "Ohne Collider ist das Objekt für die Physik unsichtbar."],
 ["mmp-input", "Wo liegt der Ursprung von Input.mousePosition?", ["Bildschirmmitte", "Links unten, in Pixeln", "Links oben", "In Weltkoordinaten bei (0, 0, 0)"], 1, "Bildschirmkoordinaten beginnen links unten."],
 ["mmp-input", "Wofür steht der Parameter 0 in Input.GetMouseButtonDown(0)?", ["Rechte Taste", "Linke Taste", "Mittlere Taste", "Mausrad"], 1, "0 links, 1 rechts, 2 Mitte."],
 ["mmp-input", "In einem neuen Unity-6-Projekt wirft Input.GetKeyDown eine InvalidOperationException. Warum?", ["Tastatur nicht angeschlossen", "Nur das neue Input System ist aktiv; Active Input Handling auf Both stellen oder das neue System verwenden", "Update fehlt", "Das Skript ist deaktiviert"], 1, "So steht es auch in der Lektion."],
 ["mmp-input", "Warum normalisiert man einen Bewegungsvektor aus zwei Achsen?", ["Damit er schneller wird", "Damit diagonal (Länge √2 ≈ 1,41) nicht schneller gelaufen wird als gerade", "Damit er negativ wird", "Unity verlangt es"], 1, "(1, 1) hat Länge 1,41; normalisiert 1."],
 ["mmp-media", "Welche AudioSource.volume entspricht etwa −6 dB?", ["0,25", "0,5", "0,1", "0,75"], 1, "20 · log₁₀(0,5) ≈ −6 dB."],
 ["mmp-media", "Was ist der Unterschied zwischen Play() und PlayOneShot(clip)?", ["Keiner", "Play spielt den zugewiesenen Clip und stoppt einen laufenden; PlayOneShot überlagert, ohne zu unterbrechen", "PlayOneShot geht nur in 2D", "Play ist nur für Video"], 1, "Ideal für kurze Effekte wie Schritte oder Pickups."],
 ["mmp-media", "Wozu braucht eine Szene einen AudioListener?", ["Für Video", "Er ist das „Ohr“ – ohne ihn hört man nichts; meist an der Main Camera", "Für Mikrofon-Eingaben", "Er ersetzt die AudioSource"], 1, "Genau ein AudioListener pro Szene."],
 ["mmp-media", "Ein Pickup-Sound bricht ab, weil das Pickup sofort deaktiviert wird. Lösung?", ["Lauter abspielen", "Den Sound über eine AudioSource am Player oder AudioSource.PlayClipAtPoint abspielen", "Den Pickup früher deaktivieren", "Loop aktivieren"], 1, "Eine deaktivierte AudioSource verstummt."],
 ["mmp-media", "Was steuert Spatial Blend an der AudioSource?", ["Die Tonhöhe", "Wie stark der Sound als 3D-Sound (positions- und abstandsabhängig) statt als 2D-Sound wirkt", "Die Lautstärke der Musik", "Die Länge des Clips"], 1, "0 = 2D, 1 = voll 3D."],
 ["mmp-ui", "Video 212 s lang, time = 83,4 s. Was zeigt die Anzeige im Format mm:ss?", ["83:40", "01:23", "01:24", "1:23,4"], 1, "83,4 / 60 = 1 Minute, Rest 23 Sekunden."],
 ["mmp-ui", "Slider (0–1) steht auf 0,75 bei einem 212-s-Video. Auf welche Zeit springt das Video bei vp.time = v * vp.length?", ["75 s", "159 s", "212 s", "0,75 s"], 1, "0,75 · 212 = 159 s."],
 ["mmp-ui", "Was braucht ein UI-Button in der Szene zusätzlich zum Canvas, damit Klicks ankommen?", ["Einen Rigidbody", "Ein EventSystem", "Einen AudioListener", "Einen Collider"], 1, "Das EventSystem verteilt Eingaben an UI-Elemente."],
 ["mmp-ui", "Warum taucht eine Methode im OnClick-Menü eines Buttons nicht auf?", ["Weil sie private ist oder unpassende Parameter hat", "Weil sie zu lang ist", "Weil sie void ist", "Weil der Button grau ist"], 0, "Nur öffentliche Methoden mit passender Signatur (0 oder 1 einfacher Parameter) werden angezeigt."],
 ["mmp-ui", "Wie bleibt ein Button beim Drehen des Handys am rechten unteren Rand?", ["Feste Pixelposition", "Anchor auf die rechte untere Ecke setzen", "Scale auf 0", "Einen Collider hinzufügen"], 1, "Anchors legen fest, woran sich ein UI-Element ausrichtet."],
 ["mmp-physik", "Impuls 5 N·s auf einen Rigidbody mit 1 kg (ForceMode.Impulse). Wie hoch steigt er ohne Luftwiderstand ungefähr (g = 9,81)?", ["5 m", "1,27 m", "0,51 m", "2,55 m"], 1, "v₀ = 5 m/s; h = 25 / 19,62 ≈ 1,27 m."],
 ["mmp-physik", "Wie verändert sich die Sprunghöhe, wenn die Masse bei gleichem Impuls verdoppelt wird?", ["Halbiert", "Geviertelt", "Gleich", "Verdoppelt"], 1, "v₀ halbiert sich, die Höhe hängt von v₀² ab → ein Viertel."],
 ["mmp-physik", "Welcher ForceMode ändert die Geschwindigkeit sofort und unabhängig von der Masse?", ["Force", "Impulse", "VelocityChange", "Acceleration"], 2, "Acceleration ist auch masseunabhängig, wirkt aber kontinuierlich."],
 ["mmp-physik", "Warum liest man die Sprungtaste in Update und springt in FixedUpdate?", ["Weil FixedUpdate keine Eingaben kennt", "GetKeyDown ist nur in einem Frame true; FixedUpdate läuft nicht in jedem Frame. Physik gehört aber in FixedUpdate", "Weil Update keine Physik kennt", "Aus Stilgründen"], 1, "Eingabe merken (Flag), in FixedUpdate anwenden."],
 ["mmp-physik", "Ein schneller Ball fliegt durch eine dünne Wand. Welche Einstellung hilft?", ["Masse erhöhen", "Collision Detection auf Continuous stellen", "Is Trigger aktivieren", "Gravity ausschalten"], 1, "Diskrete Kollisionserkennung kann dünne Objekte zwischen zwei Physik-Schritten überspringen."],
 ["mmp-rollaball", "Welche Methode im PlayerController reagiert auf das Einsammeln eines Pickups?", ["OnCollisionEnter(Collision c)", "OnTriggerEnter(Collider other)", "OnMouseDown()", "Start()"], 1, "Pickups sind Trigger."],
 ["mmp-rollaball", "Der Tag heißt im Editor „PickUp“, im Code steht CompareTag(\"Pickup\"). Was passiert?", ["Funktioniert, Groß-/Kleinschreibung egal", "Es wird nichts eingesammelt – Tags sind case-sensitive", "Compilerfehler", "Alle Objekte werden eingesammelt"], 1, "Exakte Schreibweise nötig."],
 ["mmp-rollaball", "Warum steht der CameraController-Code in LateUpdate?", ["Weil Update für Kameras verboten ist", "Damit die Kamera erst folgt, nachdem sich der Ball in diesem Frame bewegt hat – kein Ruckeln", "Weil LateUpdate schneller ist", "Weil es nur einmal läuft"], 1, "LateUpdate läuft nach allen Updates."],
 ["mmp-rollaball", "Ein 60-s-Countdown zeigt die Zeit mit Mathf.CeilToInt(timeLeft). Was steht bei timeLeft = 0,4?", ["0", "1", "0,4", "60"], 1, "CeilToInt rundet auf: 0,4 → 1."],
 ["mmp-rollaball", "Der Ball soll sich relativ zur Kamera bewegen, die Kamera folgt mit festem Offset. Wie berechnet der CameraController die Position?", ["transform.position = player.transform.position", "transform.position = player.transform.position + offset, mit offset = Startabstand aus Start()", "transform.position += offset jeden Frame", "Kamera als Child des Balls"], 1, "Als Child würde die Kamera die Rotation des rollenden Balls mitmachen."]
];
const questions = Q.map(([topic, q, opts, a, why], i) => ({ id: "px-mmprov-" + (i + 1), topic, q: esc(q), opts: opts.map(esc), a, why: esc(why), ex: "" }));

const FC = [
 ["mmp-csharp", "Time.deltaTime", "Zeit seit dem letzten Frame in Sekunden (≈ 1 / FPS). speed * Time.deltaTime = Einheiten pro Sekunde, framerate-unabhängig."],
 ["mmp-csharp", "Fixed Timestep", "Standard 0,02 s → FixedUpdate 50-mal pro Sekunde, 0- bis mehrmals pro Frame."],
 ["mmp-anim", "SmoothStep", "s(t) = 3t² − 2t³: sanfter Start und sanftes Ende; s(0,25) ≈ 0,156, s(0,5) = 0,5."],
 ["mmp-anim", "Lerp-Glättung", "pos = Lerp(pos, ziel, k * deltaTime) nähert sich exponentiell an und erreicht das Ziel nie exakt – am Ende einrasten."],
 ["mmp-physik", "Sprunghöhe", "v₀ = Impuls / Masse, h = v₀² / (2g), Flugzeit = 2 v₀ / g."],
 ["mmp-input", "Raycast-Kette", "ScreenPointToRay(Input.mousePosition) → Physics.Raycast(ray, out hit) → hit.collider.gameObject; nur Collider werden getroffen."],
 ["mmp-media", "Lautstärke in dB", "dB = 20 · log₁₀(volume): 0,5 ≈ −6 dB, 0,1 = −20 dB."],
 ["mmp-ui", "Zeit als mm:ss", "string.Format(\"{0:00}:{1:00}\", (int)(t / 60), (int)(t % 60)); Slider = time / length."],
 ["mmp-editor", "Parent-Skalierung", "Welt-Position eines Childs = Parent-Position + Parent-Scale · localPosition (ohne Rotation)."]
];
const flashcards = FC.map(([topic, front, back], i) => ({ id: "px-mmprov-f" + (i + 1), cat: "MMPROV", topic, front, back }));

window.STUDYOS_EXT = window.STUDYOS_EXT || {};
(window.STUDYOS_EXT["mmprov"] = window.STUDYOS_EXT["mmprov"] || []).push({ id: "mmprov-plus", blocks: BLOCKS, questions, flashcards });
})();
