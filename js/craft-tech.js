/* Technique player: animated step-by-step diagrams for knitting & crochet.
   Frames describe positions; CSS transitions animate needle/hook, yarn and loops between steps. */
(function () {
const NS = "http://www.w3.org/2000/svg";
const R2D = 180 / Math.PI;
const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const P = (a) => a.map(n => Math.round(n * 10) / 10);
/* yarn path always: M + 3 cubic segments (so CSS d-transitions can morph) */
const yarnD = (p) => `M${P(p[0])} C${P(p[1])} ${P(p[2])} ${P(p[3])} C${P(p[4])} ${P(p[5])} ${P(p[6])} C${P(p[7])} ${P(p[8])} ${P(p[9])}`;

/* ============ KNITTING SCENE ============ */
const K = { A: [-30, 128], T: [176, 108] };
const onL = u => [K.A[0] + (K.T[0] - K.A[0]) * u, K.A[1] + (K.T[1] - K.A[1]) * u];
const LU = [0.88, 0.72, 0.56, 0.40, 0.24];
const RDIR = [Math.cos(0.14), Math.sin(0.14)];
function knitSVG(yarn) {
  const loopsL = LU.map((u, i) => { const [x, y] = onL(u); return { i, x, y }; });
  const V = (x, y, s = 1) => `<path d="M${x - 8 * s} ${y} Q${x - 5 * s} ${y + 9 * s} ${x} ${y + 13 * s} Q${x + 5 * s} ${y + 9 * s} ${x + 8 * s} ${y}" class="yk"/>`;
  let fab = ""; loopsL.forEach(l => { for (let r = 0; r < 5; r++) fab += V(l.x, l.y + 26 + r * 14); });
  const loopBack = (x, y, id) => `<path id="${id}b" class="yl" d="M${x - 8} ${y + 3} C${x - 9} ${y - 13} ${x + 9} ${y - 13} ${x + 8} ${y + 3}"/>`;
  const loopFront = (x, y, id) => `<g id="${id}f"><path class="yl" d="M${x - 8} ${y + 3} C${x - 9} ${y + 12} ${x - 4} ${y + 20} ${x} ${y + 26}"/><path class="yl" d="M${x + 8} ${y + 3} C${x + 9} ${y + 12} ${x + 4} ${y + 20} ${x} ${y + 26}"/></g>`;
  const rLoop = (d, id) => { const x = d * RDIR[0], y = d * RDIR[1]; return `<g id="${id}"><path class="yl" d="M${x - 7} ${y + 3} C${x - 8} ${y - 12} ${x + 8} ${y - 12} ${x + 7} ${y + 3}"/><path class="yl" d="M${x - 7} ${y + 3} C${x - 7} ${y + 10} ${x + 7} ${y + 10} ${x + 7} ${y + 3}" style="opacity:.55"/></g>`; };
  const needle = (len, id, extra = "") => `<g id="${id}" class="tt">${extra}<path d="M0 0 L16 -4.2 L${len} -4.8 L${len} 4.8 L16 4.2 Z" fill="url(#wood)" stroke="#8C6440" stroke-width="1"/><circle cx="${len}" cy="0" r="7" fill="#9C7048"/></g>`;
  return `<svg viewBox="0 0 360 250" xmlns="${NS}" role="img" aria-label="Strick-Illustration">
    <defs><linearGradient id="wood" x1="0" y1="-5" x2="0" y2="5" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#E4C39B"/><stop offset=".5" stop-color="#C99A68"/><stop offset="1" stop-color="#A57848"/></linearGradient>
      <marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#2E2420"/></marker>
      </defs>
    <style>.yl,.yk{fill:none;stroke:${yarn};stroke-width:6.5;stroke-linecap:round}.yk{stroke-width:5.5;opacity:.92}.yo{fill:none;stroke:rgba(60,30,20,.35);stroke-width:8.5;stroke-linecap:round}.yh{fill:none;stroke:rgba(255,255,255,.35);stroke-width:1.6;stroke-linecap:round}
      .tt{transition:transform .8s cubic-bezier(.45,.05,.3,1),opacity .6s}.yd{transition:d .8s cubic-bezier(.45,.05,.3,1)}.fd{transition:opacity .5s,transform .8s}</style>
    <g id="fab">${fab}</g>
    <g id="yback"><path class="yo yd yy" d="M0 0 C0 0 0 0 0 0 C0 0 0 0 0 0 C0 0 0 0 0 0"/><path class="yl yd yy" style="stroke-width:6" d="M0 0 C0 0 0 0 0 0 C0 0 0 0 0 0 C0 0 0 0 0 0"/></g>
    ${loopsL.map((l, i) => loopBack(l.x, l.y, "L" + (i + 1))).join("")}
    ${needle(210, "nL", "")}
    <g id="nRu"></g>
    ${loopsL.map((l, i) => loopFront(l.x, l.y, "L" + (i + 1))).join("")}
    ${needle(200, "nR", rLoop(12, "Rn") + rLoop(36, "R1") + rLoop(60, "R2") + rLoop(84, "R3"))}
    <g id="L1over" class="fd"><path class="yl" d="M${onL(LU[0])[0] - 8} ${onL(LU[0])[1] + 3} C${onL(LU[0])[0] - 9} ${onL(LU[0])[1] + 12} ${onL(LU[0])[0] - 4} ${onL(LU[0])[1] + 20} ${onL(LU[0])[0]} ${onL(LU[0])[1] + 26}"/></g>
    <g id="yfront"><path class="yo yd yy" d="M0 0 C0 0 0 0 0 0 C0 0 0 0 0 0 C0 0 0 0 0 0"/><path class="yl yd yy" style="stroke-width:6" d="M0 0 C0 0 0 0 0 0 C0 0 0 0 0 0 C0 0 0 0 0 0"/><path class="yh yd yy" d="M0 0 C0 0 0 0 0 0 C0 0 0 0 0 0 C0 0 0 0 0 0"/></g>
    <path id="arrow" class="fd" d="" fill="none" stroke="#2E2420" stroke-width="2.2" stroke-dasharray="5 4" marker-end="url(#ah)"/>
    <circle id="focus" class="fd" r="15" fill="none" stroke="#C8664B" stroke-width="2.5" stroke-dasharray="3 3" opacity="0"/>
  </svg>`;
}
function knitApply(svg, f) {
  const $ = id => svg.querySelector("#" + id);
  const nL = $("nL"); nL.style.transform = `translate(${K.T[0]}px,${K.T[1]}px) rotate(${Math.atan2(K.A[1] - K.T[1], K.A[0] - K.T[0]) * R2D}deg)`;
  const r = f.nR || { x: 214, y: 112, a: 8 }; const nR = $("nR"); nR.style.transform = `translate(${r.x}px,${r.y}px) rotate(${r.a}deg)`;
  const tip = (d, off = 0) => { const a = r.a / R2D; const [dx, dy] = rot(d, off, a); return [r.x + dx, r.y + dy]; };
  ["Rn", "R1", "R2", "R3"].forEach((id, i) => { const on = (f.rLoops || [0, 1, 1, 1])[i]; $(id).style.opacity = on ? 1 : 0; $(id).style.transition = "opacity .5s"; });
  (f.lOff || []).forEach(() => {}); LU.forEach((u, i) => { const off = (f.lOff || []).includes(i + 1); ["b", "f"].forEach(s => { const e = $("L" + (i + 1) + s); e.style.transition = "opacity .6s, transform .8s"; e.style.opacity = off ? 0 : 1; e.style.transform = off ? "translateY(22px)" : "none"; }); });
  const hl = f.hl || []; LU.forEach((u, i) => { ["b", "f"].forEach(s => { $("L" + (i + 1) + s).querySelectorAll("path").forEach(p => p.style.stroke = hl.includes(i + 1) ? "#E38B3A" : ""); if ($("L" + (i + 1) + s).tagName === "path") $("L" + (i + 1) + s).style.stroke = hl.includes(i + 1) ? "#E38B3A" : ""; }); });
  $("L1over").style.opacity = f.over ? 1 : 0;
  const ball = [336, 244];
  const src = f.rLoops && f.rLoops[0] ? tip(12, 6) : tip(36, 6);
  let pts;
  if (f.yarn === "wrap") { const t0 = tip(4, 0); pts = [src, [src[0] - 6, src[1] + 30], [t0[0] + 10, t0[1] + 26], [t0[0] + 4, t0[1] + 10], [t0[0] - 2, t0[1] - 16], [t0[0] - 16, t0[1] - 6], [t0[0] - 6, t0[1] + 12], [t0[0] + 20, t0[1] + 60], [ball[0] - 60, ball[1]], ball]; }
  else if (f.yarn === "wrapP") { const t0 = tip(4, 0); pts = [src, [src[0] - 4, src[1] + 24], [t0[0] + 8, t0[1] + 22], [t0[0] + 2, t0[1] + 8], [t0[0] - 6, t0[1] - 18], [t0[0] - 16, t0[1] - 2], [t0[0] - 6, t0[1] + 10], [t0[0] + 30, t0[1] + 70], [ball[0] - 60, ball[1]], ball]; }
  else if (f.yarn === "yo") { const t0 = tip(30, 0); pts = [src, [src[0] - 4, src[1] - 22], [t0[0] - 6, t0[1] - 24], [t0[0], t0[1] - 8], [t0[0] + 6, t0[1] + 8], [t0[0] + 14, t0[1] + 16], [t0[0] + 16, t0[1] + 30], [t0[0] + 40, t0[1] + 90], [ball[0] - 60, ball[1]], ball]; }
  else { pts = [src, [src[0] - 2, src[1] + 30], [src[0] + 30, src[1] + 60], [src[0] + 50, src[1] + 80], [src[0] + 70, src[1] + 100], [ball[0] - 70, ball[1] - 10], [ball[0] - 40, ball[1]], [ball[0] - 20, ball[1] + 4], [ball[0] - 8, ball[1]], ball]; }
  svg.querySelectorAll(".yy").forEach(e => e.style.d = `path("${yarnD(pts)}")`);
  const front = f.yarnFront; $("yfront").style.display = front ? "" : "none"; $("yback").style.display = front ? "none" : "";
  // purl: needle passes in front of the loop → draw needle after L1 front legs
  const under = svg.querySelector("#nRu"); if (f.purl) { if (nR.parentNode !== svg) {} svg.insertBefore(nR, $("L1over").nextSibling); } else { svg.insertBefore(nR, $("L1over")); }
  const ar = $("arrow"); if (f.arrow) { ar.setAttribute("d", f.arrow); ar.style.opacity = 1; } else ar.style.opacity = 0;
  const fc = $("focus"); if (f.focus) { fc.setAttribute("cx", f.focus[0]); fc.setAttribute("cy", f.focus[1]); fc.style.opacity = 1; } else fc.style.opacity = 0;
}
const L1 = onL(LU[0]), L2 = onL(LU[1]);
const REST = { x: 214, y: 112, a: 8 };
const KNIT = [
  { t: "Ausgangslage", d: "Linke Nadel mit den Maschen in der linken Hand, leere bzw. rechte Nadel in der rechten. Der Arbeitsfaden liegt <b>hinter</b> der Arbeit.", tip: "Die Maschen sitzen locker auf der Nadel – nicht bis zur Spitze schieben, dann rutschen sie nicht herunter.", nR: REST, rLoops: [0, 1, 1, 1], focus: [L1[0], L1[1] - 2] },
  { t: "Einstechen", d: "Mit der rechten Nadel <b>von vorne nach hinten</b> und von links nach rechts in die erste Masche stechen. Die Nadeln bilden ein X, die rechte liegt hinten.", tip: "Schau auf das vordere Maschenglied: Die Nadel geht dahinter durch.", nR: { x: L1[0] - 12, y: L1[1] + 4, a: -22 }, rLoops: [0, 1, 1, 1], over: true, arrow: `M290 70 C240 40 ${L1[0] + 10} 60 ${L1[0] - 4} ${L1[1] - 6}`, focus: [L1[0], L1[1]] },
  { t: "Faden umschlingen", d: "Den Arbeitsfaden <b>gegen den Uhrzeigersinn</b> um die Spitze der rechten Nadel legen – von hinten zwischen die Nadeln nach vorne.", tip: "Der Faden liegt über dem Zeigefinger der linken bzw. rechten Hand – so bleibt die Spannung gleichmäßig.", nR: { x: L1[0] - 12, y: L1[1] + 4, a: -22 }, rLoops: [0, 1, 1, 1], over: true, yarn: "wrap", yarnFront: true, arrow: `M${L1[0] + 34} ${L1[1] + 26} C${L1[0] + 50} ${L1[1] - 10} ${L1[0] + 10} ${L1[1] - 40} ${L1[0] - 20} ${L1[1] - 14}` },
  { t: "Durchholen", d: "Die rechte Nadel mit dem umgelegten Faden <b>nach vorne</b> durch die alte Masche ziehen. Auf der rechten Nadel entsteht eine neue Schlinge.", tip: "Die Nadelspitze leicht nach unten kippen, dann rutscht der Faden nicht ab.", nR: { x: L1[0] + 18, y: L1[1] + 14, a: 4 }, rLoops: [1, 1, 1, 1], over: false, arrow: `M${L1[0] - 6} ${L1[1] + 10} C${L1[0] + 4} ${L1[1] + 30} ${L1[0] + 30} ${L1[1] + 30} ${L1[0] + 46} ${L1[1] + 16}` },
  { t: "Alte Masche abgleiten lassen", d: "Die alte Masche von der linken Nadel gleiten lassen. Die neue <b>rechte Masche</b> sitzt jetzt auf der rechten Nadel – von vorne siehst du ein V.", tip: "Zähl nach jeder Reihe deine Maschen – so merkst du sofort, wenn eine fehlt oder dazugekommen ist.", nR: REST, rLoops: [1, 1, 1, 1], lOff: [1], focus: [REST.x + 10, REST.y] }
];
const PURL = [
  { t: "Ausgangslage", d: "Der Arbeitsfaden liegt <b>vor</b> der Arbeit. Das ist der wichtigste Unterschied zur rechten Masche.", tip: "Wechselst du zwischen rechts und links (z. B. Rippen), muss der Faden jedes Mal zwischen den Nadeln nach vorne bzw. hinten.", nR: REST, rLoops: [0, 1, 1, 1], yarnFront: true, focus: [L1[0], L1[1] - 2] },
  { t: "Einstechen", d: "Mit der rechten Nadel <b>von rechts nach links</b> und von hinten nach vorne in die erste Masche stechen – die rechte Nadel liegt <b>vor</b> der linken.", tip: "Die Nadel geht vor dem vorderen Maschenglied hinein.", nR: { x: L1[0] + 2, y: L1[1] - 2, a: 12 }, rLoops: [0, 1, 1, 1], purl: true, yarnFront: true, arrow: `M300 60 C260 40 ${L1[0] + 30} 60 ${L1[0] + 8} ${L1[1] - 4}` },
  { t: "Faden umlegen", d: "Den Faden von vorne <b>gegen den Uhrzeigersinn</b> um die rechte Nadelspitze legen: von oben nach unten zwischen den Nadeln.", tip: "Faden locker halten – linke Maschen werden sonst oft fester als rechte.", nR: { x: L1[0] + 2, y: L1[1] - 2, a: 12 }, rLoops: [0, 1, 1, 1], purl: true, yarn: "wrapP", yarnFront: true },
  { t: "Nach hinten durchschieben", d: "Die rechte Nadel mit der neuen Schlinge <b>nach hinten</b> durch die alte Masche schieben.", tip: "Mit dem linken Zeigefinger die alte Masche festhalten, dann klappt das Durchschieben leichter.", nR: { x: L1[0] + 22, y: L1[1] + 10, a: 4 }, rLoops: [1, 1, 1, 1], purl: true, yarnFront: true, arrow: `M${L1[0] + 4} ${L1[1] + 4} C${L1[0] + 12} ${L1[1] + 24} ${L1[0] + 34} ${L1[1] + 26} ${L1[0] + 44} ${L1[1] + 14}` },
  { t: "Abgleiten lassen", d: "Alte Masche fallen lassen. Von vorne sieht die <b>linke Masche</b> wie ein kleines Knötchen (Querbalken) aus.", tip: "Rückseite von glatt rechts = lauter linke Maschen. Das ist dieselbe Masche von der anderen Seite!", nR: REST, rLoops: [1, 1, 1, 1], lOff: [1], yarnFront: true }
];
const K2TOG = [
  { t: "Zwei Maschen im Blick", d: "Für <b>2 Maschen rechts zusammenstricken</b> (k2tog) nimmst du die ersten beiden Maschen der linken Nadel gemeinsam.", tip: "k2tog ist eine rechtsgeneigte Abnahme – die Masche neigt sich nach rechts.", nR: REST, rLoops: [0, 1, 1, 1], hl: [1, 2], focus: [(L1[0] + L2[0]) / 2, L1[1] + 2] },
  { t: "Durch beide einstechen", d: "Rechte Nadel wie beim Rechtsstricken von vorne nach hinten <b>durch beide Maschen gleichzeitig</b> – zuerst durch die zweite, dann durch die erste.", tip: "Ist es zu eng? Maschen vorher mit der Nadelspitze leicht weiten.", nR: { x: L2[0] - 12, y: L2[1] + 5, a: -20 }, rLoops: [0, 1, 1, 1], hl: [1, 2], over: true },
  { t: "Umschlingen & durchholen", d: "Faden umschlingen und durch beide Maschen holen – wie bei einer normalen rechten Masche.", tip: "", nR: { x: L1[0] + 18, y: L1[1] + 14, a: 4 }, rLoops: [1, 1, 1, 1], hl: [1, 2], yarn: "wrap", yarnFront: true },
  { t: "Beide abgleiten lassen", d: "Beide alten Maschen fallen lassen. Aus 2 Maschen wurde 1 – die Reihe hat eine Masche weniger.", tip: "Für eine linksgeneigte Abnahme nimmst du ssk (überzogene Abnahme).", nR: REST, rLoops: [1, 1, 1, 1], lOff: [1, 2] }
];
const YO = [
  { t: "Vor der nächsten Masche", d: "Ein <b>Umschlag</b> (yo) ist eine Zunahme und macht ein kleines Loch – die Basis jeder Lochmuster-Spitze.", tip: "", nR: REST, rLoops: [0, 1, 1, 1] },
  { t: "Faden nach vorne", d: "Den Faden zwischen den Nadeln <b>nach vorne</b> holen.", tip: "", nR: REST, rLoops: [0, 1, 1, 1], yarnFront: true },
  { t: "Über die Nadel legen", d: "Den Faden <b>von vorne über die rechte Nadel nach hinten</b> legen – das ist der Umschlag. Dann die nächste Masche normal rechts stricken.", tip: "In der Rückreihe den Umschlag wie eine normale Masche abstricken – dann entsteht das Loch.", nR: REST, rLoops: [1, 1, 1, 1], yarn: "yo", yarnFront: true, focus: [REST.x + 30 * Math.cos(0.14), REST.y + 30 * Math.sin(0.14)] }
];
const BINDOFF = [
  { t: "Zwei Maschen stricken", d: "Zu Beginn zwei Maschen normal (rechts) stricken. Beide liegen auf der rechten Nadel.", tip: "Abketten locker arbeiten – notfalls mit einer Nadel eine Stärke dicker.", nR: REST, rLoops: [1, 1, 1, 1], focus: [REST.x + 24, REST.y + 3] },
  { t: "Linke Nadel einstechen", d: "Mit der linken Nadelspitze <b>in die zweite (hintere) Masche</b> der rechten Nadel stechen.", tip: "", nR: REST, rLoops: [1, 1, 1, 1], arrow: `M150 70 C190 50 230 70 ${REST.x + 36} ${REST.y - 2}`, focus: [REST.x + 36, REST.y + 5] },
  { t: "Überziehen", d: "Diese Masche <b>über die erste Masche und über die Nadelspitze heben</b> und fallen lassen. Eine Masche ist abgekettet.", tip: "", nR: REST, rLoops: [1, 0, 1, 1], arrow: `M${REST.x + 36} ${REST.y - 10} C${REST.x + 30} ${REST.y - 40} ${REST.x} ${REST.y - 30} ${REST.x - 8} ${REST.y - 4}` },
  { t: "Wiederholen", d: "Eine weitere Masche stricken und wieder die hintere darüberziehen. Am Ende den Faden abschneiden und durch die letzte Schlinge ziehen.", tip: "Die letzte Masche wird oft groß – ein kleiner Trick: die vorletzte Masche etwas fester ziehen.", nR: REST, rLoops: [1, 0, 0, 1] }
];

/* ============ CROCHET SCENE ============ */
const HU = [Math.cos(-0.36), Math.sin(-0.36)];
const hookPt = (h, d, off = 0) => { const a = h.a / R2D; const [dx, dy] = rot(d, off, a); return [h.x + dx, h.y + dy]; };
function crochetSVG(yarn) {
  const cols = []; for (let k = 0; k < 11; k++) cols.push(34 + k * 29);
  const topV = (x, y, id, cls = "yl") => `<g id="${id}"><path class="${cls}" d="M${x - 13} ${y} C${x - 6} ${y - 9} ${x + 6} ${y - 9} ${x + 13} ${y}"/><path class="${cls}" d="M${x - 13} ${y} C${x - 6} ${y + 7} ${x + 6} ${y + 7} ${x + 13} ${y}" style="opacity:.7"/></g>`;
  const post = (x, y) => `<path class="yk" d="M${x - 5} ${y + 5} C${x - 7} ${y + 16} ${x - 3} ${y + 24} ${x - 5} ${y + 34}"/><path class="yk" d="M${x + 5} ${y + 5} C${x + 7} ${y + 16} ${x + 3} ${y + 24} ${x + 5} ${y + 34}"/>`;
  let fab = ""; cols.forEach((x, i) => { fab += post(x, 184) + topV(x, 222, "b" + i, "yk") + post(x, 222 - 38 + 38); });
  const loop = (d, id) => `<g id="${id}"><path d="M${d - 3} -1 C${d - 7} -14 ${d + 5} -15 ${d + 4} -2" fill="none" stroke="${yarn}" stroke-width="5.5" stroke-linecap="round" opacity=".55"/><path d="M${d - 3} -1 C${d - 5} 12 ${d + 6} 13 ${d + 4} -2" fill="none" stroke="${yarn}" stroke-width="5.5" stroke-linecap="round"/></g>`;
  return `<svg viewBox="0 0 360 260" xmlns="${NS}" role="img" aria-label="Häkel-Illustration">
    <defs><linearGradient id="steel" x1="0" y1="-5" x2="0" y2="5" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#E8ECF0"/><stop offset=".5" stop-color="#AEB7C1"/><stop offset="1" stop-color="#7E8894"/></linearGradient>
      <marker id="ah2" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#2E2420"/></marker>
      </defs>
    <style>.yl,.yk{fill:none;stroke:${yarn};stroke-width:6;stroke-linecap:round}.yk{stroke-width:5;opacity:.9}.yo{fill:none;stroke:rgba(60,30,20,.3);stroke-width:8;stroke-linecap:round}.yh{fill:none;stroke:rgba(255,255,255,.35);stroke-width:1.5;stroke-linecap:round}
      .tt{transition:transform .8s cubic-bezier(.45,.05,.3,1)}.yd{transition:d .8s cubic-bezier(.45,.05,.3,1)}.fd{transition:opacity .5s}</style>
    <g id="fab">${fab}${cols.map((x, i) => topV(x, 184, "t" + i)).join("")}</g>
    <g id="tgt" class="fd"><path d="M${cols[5] - 13} 184 C${cols[5] - 6} 175 ${cols[5] + 6} 175 ${cols[5] + 13} 184" fill="none" stroke="#E38B3A" stroke-width="6.5" stroke-linecap="round"/></g>
    <g id="yarnB"><path class="yo yd yy" d="M0 0 C0 0 0 0 0 0 C0 0 0 0 0 0 C0 0 0 0 0 0"/><path class="yl yd yy" d="M0 0 C0 0 0 0 0 0 C0 0 0 0 0 0 C0 0 0 0 0 0"/></g>
    <g id="hook" class="tt"><path d="M0 -3 C2 -7 9 -8 14 -5 L12 -1 C9 -3 6 -2 5 1 L6 3 L240 4 L240 -4 L14 -5" fill="url(#steel)" stroke="#6B7580" stroke-width="1"/><rect x="120" y="-7" width="40" height="14" rx="3" fill="#C8664B" opacity=".85"/>
      ${loop(24, "h1")}${loop(40, "h2")}${loop(56, "h3")}${loop(10, "hn")}</g>
    <g id="tgtF" class="fd"><path d="M${cols[5] - 13} 184 C${cols[5] - 6} 191 ${cols[5] + 6} 191 ${cols[5] + 13} 184" fill="none" stroke="#E38B3A" stroke-width="6.5" stroke-linecap="round" opacity=".9"/></g>
    <g id="yarnF"><path class="yo yd yy" d="M0 0 C0 0 0 0 0 0 C0 0 0 0 0 0 C0 0 0 0 0 0"/><path class="yl yd yy" d="M0 0 C0 0 0 0 0 0 C0 0 0 0 0 0 C0 0 0 0 0 0"/><path class="yh yd yy" d="M0 0 C0 0 0 0 0 0 C0 0 0 0 0 0 C0 0 0 0 0 0"/></g>
    <g id="newch" class="fd"><path class="yl" d="M${cols[5] - 5} 182 C${cols[5] - 7} 170 ${cols[5] - 3} 160 ${cols[5] - 5} 150"/><path class="yl" d="M${cols[5] + 5} 182 C${cols[5] + 7} 170 ${cols[5] + 3} 160 ${cols[5] + 5} 150"/>${topV(cols[5], 146, "nc")}</g>
    <path id="arrow" class="fd" d="" fill="none" stroke="#2E2420" stroke-width="2.2" stroke-dasharray="5 4" marker-end="url(#ah2)"/>
    <text id="cnt" x="344" y="30" text-anchor="end" style="font:600 13px Inter,system-ui;fill:#7A6A60"></text>
  </svg>`;
}
function crochetApply(svg, f) {
  const $ = id => svg.querySelector("#" + id);
  const h = f.h || { x: 176, y: 120, a: -20 }; $("hook").style.transform = `translate(${h.x}px,${h.y}px) rotate(${h.a}deg)`;
  const loops = f.loops == null ? 1 : f.loops; ["h1", "h2", "h3"].forEach((id, i) => { $(id).style.opacity = i < loops ? 1 : 0; $(id).style.transition = "opacity .45s"; });
  $("hn").style.opacity = f.newLoop ? 1 : 0; $("hn").style.transition = "opacity .45s";
  $("tgt").style.opacity = f.target ? 1 : 0; $("tgtF").style.opacity = f.target && f.inserted ? 1 : 0;
  $("newch").style.opacity = f.done ? 1 : 0;
  const ball = [26, 36], last = hookPt(h, 24 + (loops - 1) * 16, 0), throat = hookPt(h, 8, -6);
  let pts;
  if (f.yarn === "over") pts = [last, [last[0] + 6, last[1] + 16], [throat[0] + 16, throat[1] + 14], [throat[0] + 6, throat[1] + 8], [throat[0] - 4, throat[1] + 2], [throat[0] - 8, throat[1] - 14], [throat[0] + 2, throat[1] - 18], [throat[0] + 10, throat[1] - 60], [ball[0] + 60, ball[1] + 10], ball];
  else pts = [last, [last[0] + 4, last[1] + 18], [last[0] - 30, last[1] + 20], [last[0] - 50, last[1] + 6], [last[0] - 70, last[1] - 8], [ball[0] + 70, ball[1] + 50], [ball[0] + 40, ball[1] + 30], [ball[0] + 20, ball[1] + 16], [ball[0] + 8, ball[1] + 6], ball];
  svg.querySelectorAll(".yy").forEach(e => e.style.d = `path("${yarnD(pts)}")`);
  $("yarnF").style.display = f.yarn === "over" ? "" : "none"; $("yarnB").style.display = f.yarn === "over" ? "none" : "";
  const ar = $("arrow"); if (f.arrow) { ar.setAttribute("d", f.arrow); ar.style.opacity = 1; } else ar.style.opacity = 0;
  $("cnt").textContent = `${loops + (f.newLoop ? 1 : 0)} ${loops + (f.newLoop ? 1 : 0) === 1 ? "Schlinge" : "Schlingen"} auf der Nadel`;
}
const T5 = 34 + 5 * 29;
const HR = { x: 170, y: 118, a: -18 }, HIN = { x: T5 - 2, y: 186, a: -30 }, HUP = { x: T5 - 4, y: 150, a: -22 };
const arrIn = `M${T5 + 40} 118 C${T5 + 30} 150 ${T5 + 10} 160 ${T5 + 2} 176`, arrOut = `M${T5 - 2} 196 C${T5 - 16} 190 ${T5 - 18} 170 ${T5 - 6} 156`;
const CHAIN = [
  { t: "Anfangsschlinge auf der Nadel", d: "Eine Schlinge liegt auf der Häkelnadel. Der Faden kommt vom Knäuel über den linken Zeigefinger.", tip: "Die Nadel hält man wie einen Stift oder wie ein Messer – beides ist richtig.", h: HR, loops: 1 },
  { t: "Umschlag", d: "Den Faden <b>von hinten nach vorne</b> über die Nadel legen (Umschlag, yo). Er liegt im Haken.", tip: "Nicht die Nadel um den Faden drehen – den Haken unter den Faden bewegen.", h: HR, loops: 1, yarn: "over" },
  { t: "Durchziehen", d: "Den Umschlag <b>durch die Schlinge</b> auf der Nadel ziehen. Fertig ist eine Luftmasche.", tip: "Luftmaschen gleich groß arbeiten – sie sind die Basis für die erste Reihe. Lieber etwas lockerer!", h: { x: 150, y: 110, a: -14 }, loops: 1, arrow: `M170 118 C160 104 146 100 134 106`, done: true }
];
const SC = [
  { t: "Masche wählen", d: "Die nächste Masche der Vorreihe suchen. Oben siehst du ein liegendes V: <b>zwei Maschenglieder</b>.", tip: "Unter beiden Gliedern einstechen, außer die Anleitung sagt etwas anderes (z. B. nur hinteres Glied → Rippenoptik).", h: HR, loops: 1, target: true },
  { t: "Einstechen", d: "Mit der Nadel <b>von vorne nach hinten unter beiden Gliedern</b> durchstechen.", tip: "", h: HIN, loops: 1, target: true, inserted: true, arrow: arrIn },
  { t: "Umschlag holen", d: "Umschlag: Faden von hinten nach vorne um die Nadel legen.", tip: "", h: HIN, loops: 1, target: true, inserted: true, yarn: "over" },
  { t: "Schlinge hochholen", d: "Den Faden <b>durch die Masche</b> nach vorne holen. Jetzt liegen <b>2 Schlingen</b> auf der Nadel.", tip: "Schlinge auf die Höhe der Reihe hochziehen – nicht zu kurz.", h: HUP, loops: 2, target: true, arrow: arrOut },
  { t: "Umschlag", d: "Nochmal einen Umschlag holen.", tip: "", h: HUP, loops: 2, target: true, yarn: "over" },
  { t: "Durch beide ziehen", d: "Den Umschlag <b>durch beide Schlingen</b> ziehen. Die feste Masche ist fertig, 1 Schlinge bleibt.", tip: "Zähl die Maschen am Ende jeder Reihe – vor allem an den Rändern gehen gern welche verloren.", h: HR, loops: 1, done: true }
];
const HDC = [
  { t: "Umschlag zuerst", d: "Beim <b>halben Stäbchen</b> beginnst du mit einem Umschlag: 2 Schlingen auf der Nadel.", tip: "", h: HR, loops: 2, target: true },
  { t: "Einstechen", d: "In die nächste Masche einstechen.", tip: "", h: HIN, loops: 2, target: true, inserted: true, arrow: arrIn },
  { t: "Durchholen", d: "Umschlag holen und durch die Masche ziehen: jetzt <b>3 Schlingen</b>.", tip: "", h: HUP, loops: 3, target: true, arrow: arrOut },
  { t: "Durch alle drei", d: "Umschlag und <b>durch alle 3 Schlingen</b> auf einmal ziehen.", tip: "Klappt es nicht? Die Schlingen vorher etwas lockerer auf der Nadel verteilen.", h: HUP, loops: 3, target: true, yarn: "over" },
  { t: "Fertig", d: "Ein halbes Stäbchen – etwa 1,5× so hoch wie eine feste Masche.", tip: "", h: HR, loops: 1, done: true }
];
const DC = [
  { t: "Umschlag", d: "Beim <b>Stäbchen</b>: zuerst ein Umschlag (2 Schlingen).", tip: "", h: HR, loops: 2, target: true },
  { t: "Einstechen & durchholen", d: "In die Masche einstechen, Umschlag holen, durchziehen: <b>3 Schlingen</b>.", tip: "", h: HUP, loops: 3, target: true, arrow: arrOut },
  { t: "Durch zwei", d: "Umschlag und <b>durch die ersten 2 Schlingen</b> ziehen: 2 Schlingen bleiben.", tip: "Immer „2 und 2“ – das ist das Geheimnis des Stäbchens.", h: HUP, loops: 3, target: true, yarn: "over" },
  { t: "Nochmal durch zwei", d: "Umschlag und durch die letzten 2 Schlingen: das Stäbchen ist fertig.", tip: "", h: HUP, loops: 2, target: true, yarn: "over" },
  { t: "Fertig", d: "Ein Stäbchen ist etwa doppelt so hoch wie eine feste Masche.", tip: "Zu Beginn der Reihe ersetzen meist 3 Luftmaschen das erste Stäbchen (Wendeluftmaschen).", h: HR, loops: 1, done: true }
];
const SLST = [
  { t: "Einstechen", d: "Bei der <b>Kettmasche</b> in die Masche einstechen.", tip: "Kettmaschen sind flach – ideal zum Schließen von Runden und zum Weiterwandern ohne Höhe.", h: HIN, loops: 1, target: true, inserted: true, arrow: arrIn },
  { t: "Umschlag", d: "Umschlag holen.", tip: "", h: HIN, loops: 1, target: true, inserted: true, yarn: "over" },
  { t: "In einem Zug", d: "Den Umschlag <b>durch die Masche und durch die Schlinge</b> auf der Nadel ziehen – in einem Zug.", tip: "", h: HR, loops: 1, done: true, arrow: arrOut }
];

const TECH = {
  knit: { title: "Rechte Masche", en: "knit (k)", craft: "knit", frames: KNIT, level: 1, view3d: "stockinette", video: "rechte Masche stricken lernen" },
  purl: { title: "Linke Masche", en: "purl (p)", craft: "knit", frames: PURL, level: 1, view3d: "reverse", video: "linke Masche stricken lernen" },
  k2tog: { title: "2 Maschen rechts zusammen", en: "k2tog", craft: "knit", frames: K2TOG, level: 2, video: "2 Maschen rechts zusammenstricken" },
  yo: { title: "Umschlag", en: "yarn over (yo)", craft: "knit", frames: YO, level: 2, video: "Umschlag stricken" },
  bindoff: { title: "Abketten", en: "bind off / cast off (BO)", craft: "knit", frames: BINDOFF, level: 1, video: "Maschen abketten stricken" },
  chain: { title: "Luftmasche", en: "chain (ch)", craft: "crochet", frames: CHAIN, level: 1, view3d: "chain", video: "Luftmaschen häkeln lernen" },
  slst: { title: "Kettmasche", en: "slip stitch (sl st)", craft: "crochet", frames: SLST, level: 1, video: "Kettmasche häkeln" },
  sc: { title: "Feste Masche", en: "single crochet (sc) · UK: double crochet", craft: "crochet", frames: SC, level: 1, view3d: "sc", video: "feste Masche häkeln lernen" },
  hdc: { title: "Halbes Stäbchen", en: "half double crochet (hdc) · UK: htr", craft: "crochet", frames: HDC, level: 2, video: "halbes Stäbchen häkeln" },
  dc: { title: "Stäbchen", en: "double crochet (dc) · UK: treble (tr)", craft: "crochet", frames: DC, level: 2, view3d: "dc", video: "Stäbchen häkeln lernen" }
};

function player(el, id, opts = {}) {
  const T = TECH[id]; if (!T) return;
  const yarn = opts.yarn || (T.craft === "knit" ? "#C8664B" : "#7D4E6E");
  let i = 0, timer = null, speed = 1;
  el.innerHTML = `<div class="col" style="gap:12px">
    <div class="tech-stage">${T.craft === "knit" ? knitSVG(yarn) : crochetSVG(yarn)}</div>
    <div class="steps-nav" aria-hidden="true">${T.frames.map((f, k) => `<i data-k="${k}"></i>`).join("")}</div>
    <div class="col" style="gap:6px;min-height:118px"><div class="spread" style="align-items:baseline"><span class="tech-cap" id="tp-t"></span><small class="tab" id="tp-n"></small></div><p id="tp-d" style="margin:0"></p><div id="tp-tip"></div></div>
    <div class="row" style="justify-content:space-between;flex-wrap:nowrap;gap:8px"><button class="btn" id="tp-prev" aria-label="Zurück">‹</button><button class="btn pri" id="tp-play" style="flex:1">▶ Abspielen</button><button class="btn" id="tp-next" aria-label="Weiter">›</button></div>
    <div class="row" style="gap:6px;justify-content:center"><span class="muted" style="font-size:12.5px">Tempo</span>${[["langsam", 1.6], ["normal", 1], ["schnell", 0.6]].map(([l, v]) => `<button class="chip ${v === 1 ? "on" : ""}" data-sp="${v}">${l}</button>`).join("")}</div>
  </div>`;
  const svg = el.querySelector("svg"), apply = T.craft === "knit" ? knitApply : crochetApply;
  const show = k => { i = Math.max(0, Math.min(T.frames.length - 1, k)); const f = T.frames[i]; apply(svg, f);
    el.querySelector("#tp-t").textContent = f.t; el.querySelector("#tp-n").textContent = `Schritt ${i + 1}/${T.frames.length}`; el.querySelector("#tp-d").innerHTML = f.d;
    el.querySelector("#tp-tip").innerHTML = f.tip ? `<div class="tip"><span>💡</span><span>${f.tip}</span></div>` : "";
    el.querySelectorAll(".steps-nav i").forEach((d, k) => d.classList.toggle("on", k === i));
    opts.onStep && opts.onStep(i, T.frames.length); };
  const stop = () => { clearInterval(timer); timer = null; el.querySelector("#tp-play").textContent = "▶ Abspielen"; };
  el.querySelector("#tp-prev").onclick = () => { stop(); show(i - 1); };
  el.querySelector("#tp-next").onclick = () => { stop(); show(i + 1); };
  el.querySelector("#tp-play").onclick = () => { if (timer) return stop(); if (i >= T.frames.length - 1) show(0); el.querySelector("#tp-play").textContent = "❚❚ Pause"; timer = setInterval(() => { if (!document.body.contains(el)) return stop(); if (i >= T.frames.length - 1) { show(0); } else show(i + 1); }, 2600 * speed); };
  el.querySelectorAll("[data-sp]").forEach(b => b.onclick = () => { speed = +b.dataset.sp; el.querySelectorAll("[data-sp]").forEach(x => x.classList.toggle("on", x === b)); svg.querySelectorAll(".tt,.yd").forEach(x => x.style.transitionDuration = (0.8 * speed) + "s"); if (timer) { stop(); el.querySelector("#tp-play").click(); } });
  el.querySelector(".steps-nav").onclick = e => { const d = e.target.closest("[data-k]"); if (d) { stop(); show(+d.dataset.k); } };
  // first paint without transition
  svg.querySelectorAll(".tt,.yd").forEach(x => x.style.transition = "none"); show(0); requestAnimationFrame(() => requestAnimationFrame(() => svg.querySelectorAll(".tt,.yd").forEach(x => x.style.transition = "")));
  return { show, stop };
}
window.CraftTech = { TECH, player };
})();
