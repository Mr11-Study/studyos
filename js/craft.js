/* Craft track: data, 2D fabric renderer, 3D presets and lesson widgets (knitting & crochet). */
(function () {
if ((window.STUDYOS_TRACK || "uni") !== "craft") { window.Craft = null; return; }
const { $, $$, esc } = App;
const W = App.W = App.W || {};
const S = () => App.S();
const C = () => { const s = S(); if (!s.craft) s.craft = {}; const c = s.craft; c.counters = c.counters || []; c.projects = c.projects || []; c.designs = c.designs || []; c.yarn = c.yarn || "#C8664B"; c.seen = c.seen || {}; return c; };
const Y = window.Yarn3D;
const YARNS = [["Terracotta", "#C8664B"], ["Rosé", "#E3A08F"], ["Salbei", "#7E9C84"], ["Senf", "#D4A23A"], ["Navy", "#344A6B"], ["Pflaume", "#7D4E6E"], ["Himmel", "#86A9C9"], ["Creme", "#E9DDC7"], ["Anthrazit", "#4A4442"]];

/* ---------------- stitch patterns (chart functions, RS view) ---------------- */
const PAT = {
  stock: { name: "Glatt rechts", en: "Stockinette", lvl: 1, rows: 8, cols: 8, f: () => "k", rs: "alle Maschen rechts", ws: "alle Maschen links", use: "Pullis, Mützen, Socken – die Standardfläche.", note: "Rollt sich an den Rändern ein." },
  garter: { name: "Kraus rechts", en: "Garter stitch", lvl: 1, rows: 8, cols: 8, f: r => r % 2 ? "p" : "k", written: "Alle Reihen rechts stricken.", use: "Schals, Decken, Ränder – liegt flach.", note: "Beide Seiten sehen gleich aus." },
  rib1: { name: "1×1-Rippe", en: "1×1 rib", lvl: 1, rows: 8, cols: 8, f: (r, c) => c % 2 ? "p" : "k", written: "Jede Reihe: *1 re, 1 li* – Maschen stricken, wie sie erscheinen.", use: "Bündchen, feine Kanten.", note: "Sehr elastisch in der Breite." },
  rib2: { name: "2×2-Rippe", en: "2×2 rib", lvl: 1, rows: 8, cols: 8, f: (r, c) => c % 4 >= 2 ? "p" : "k", written: "Jede Reihe: *2 re, 2 li* – wie die Maschen erscheinen.", use: "Mützen- und Ärmelbündchen.", note: "Etwas markanter als 1×1." },
  seed: { name: "Perlmuster", en: "Seed stitch", lvl: 1, rows: 8, cols: 8, f: (r, c) => (r + c) % 2 ? "p" : "k", written: "Ungerade Maschenzahl – jede Reihe: *1 re, 1 li*, 1 re.", use: "Ränder, Schals, Waschlappen.", note: "Flach, körnig, rollt nicht." },
  moss: { name: "Doppeltes Perlmuster", en: "Double seed / Moss", lvl: 2, rows: 8, cols: 8, f: (r, c) => ((Math.floor(r / 2) + c) % 2) ? "p" : "k", written: "Reihe 1+2: *1 re, 1 li*. Reihe 3+4: *1 li, 1 re*.", use: "Strukturflächen, Kissen.", note: "Versatz alle 2 Reihen." },
  basket: { name: "Korbmuster", en: "Basketweave", lvl: 2, rows: 8, cols: 8, f: (r, c) => ((Math.floor(r / 4) + Math.floor(c / 4)) % 2) ? "p" : "k", written: "4 Reihen *4 re, 4 li*, dann 4 Reihen *4 li, 4 re* (RS-Sicht).", use: "Decken, Taschen.", note: "Wirkt geflochten, liegt flach." },
  check: { name: "Schachbrett", en: "Checkerboard", lvl: 2, rows: 6, cols: 6, f: (r, c) => ((Math.floor(r / 3) + Math.floor(c / 3)) % 2) ? "p" : "k", written: "3 Reihen *3 re, 3 li*, dann 3 Reihen versetzt.", use: "Topflappen, Kissen.", note: "Kleiner Bruder des Korbmusters." },
  diag: { name: "Diagonalrippen", en: "Diagonal rib", lvl: 3, rows: 8, cols: 8, f: (r, c) => ((c + r) % 4) < 2 ? "k" : "p", written: "Jede Reihe verschiebt *2 re, 2 li* um 1 Masche.", use: "Schals, Mützen mit Bewegung.", note: "Genau mitzählen – ein Markierer pro Rapport hilft." },
  diamond: { name: "Rautenstruktur", en: "Diamond texture", lvl: 3, rows: 10, cols: 10, f: (r, c) => { const x = Math.abs((c % 10) - 4.5), y = Math.abs((r % 10) - 4.5); return Math.abs(x + y - 4.5) < 1 ? "p" : "k"; }, written: "Linke Maschen bilden eine Raute auf glattem Grund – nach Strickschrift arbeiten.", use: "Pullover-Vorderteile, Kissen.", note: "Reine Rechts/Links-Struktur, keine Zöpfe nötig." }
};
const COLORCHART = {
  heart: { name: "Herz (Fair Isle)", rows: 9, cols: 11, bg: 0, fg: 1, cells: ["...........", "..##...##..", ".####.####.", ".#########.", ".#########.", "..#######..", "...#####...", "....###....", ".....#....."] },
  stripes: { name: "Streifen", rows: 8, cols: 8, rowsColors: [0, 0, 1, 1] }
};
function chartOf(key) { const p = PAT[key]; if (!p) return null; const rows = p.rows, cols = p.cols; const cells = []; for (let r = 0; r < rows; r++) { const row = []; for (let c = 0; c < cols; c++) row.push(p.f(r, c)); cells.push(row); } return { rows, cols, cells }; }

/* ---------------- 2D fabric renderer ---------------- */
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return `rgb(${f(r)},${f(g)},${f(b)})`; };
function drawFabric(cv, get, rows, cols, opts = {}) {
  const cw = opts.cell || 22, ch = Math.round(cw * 0.82), W2 = cols * cw, H2 = rows * ch + ch * 0.4, d = Math.min(2, window.devicePixelRatio || 1);
  cv.width = W2 * d; cv.height = H2 * d; if (!opts.fixed) { cv.style.width = W2 + "px"; cv.style.height = H2 + "px"; }
  const g = cv.getContext("2d"); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, W2, H2);
  const base = opts.yarn || "#C8664B"; g.fillStyle = shade(base, -0.55); g.fillRect(0, 0, W2, H2);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cell = get(r, c); const col = cell.col || base; const x = c * cw + cw / 2, y = H2 - (r + 0.5) * ch - ch * 0.2;
    if (cell.t === "p") {
      const gr = g.createLinearGradient(0, y - ch * 0.35, 0, y + ch * 0.35); gr.addColorStop(0, shade(col, 0.25)); gr.addColorStop(0.55, col); gr.addColorStop(1, shade(col, -0.35));
      g.fillStyle = gr; g.beginPath(); g.ellipse(x, y + ch * 0.05, cw * 0.47, ch * 0.34, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = shade(col, -0.45); g.lineWidth = 0.8; g.stroke();
    } else {
      [-1, 1].forEach(s => { g.save(); g.translate(x + s * cw * 0.2, y); g.rotate(s * 0.5); const gr = g.createLinearGradient(-cw * 0.2, 0, cw * 0.2, 0); gr.addColorStop(0, shade(col, s < 0 ? 0.28 : -0.15)); gr.addColorStop(0.5, col); gr.addColorStop(1, shade(col, s < 0 ? -0.2 : 0.2)); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, cw * 0.19, ch * 0.64, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = shade(col, -0.45); g.lineWidth = 0.8; g.stroke(); g.restore(); });
    }
  }
  return cv;
}
const fabricFromChart = (cv, ch, opts) => drawFabric(cv, (r, c) => ({ t: ch.cells[r][c] }), ch.rows, ch.cols, opts);

/* ---------------- 3D presets ---------------- */
const yarn = () => C().yarn;
const heartColor = (r, c) => { const H = COLORCHART.heart; const rr = H.rows - 1 - (r % H.rows), cc = c % H.cols; return H.cells[rr][cc] === "#" ? "#B8433A" : "#EFE4D0"; };
const M3 = {
  stockinette: { label: "Glatt rechts", k: "knit", make: y => Y.knitModel({ cols: 9, rows: 8, yarn: y }), view: "front", see: "Vorne: senkrechte Säulen aus <b>Vs</b>. Jedes V ist eine rechte Masche." },
  reverse: { label: "Glatt links", k: "knit", make: y => Y.knitModel({ cols: 9, rows: 8, yarn: y }), view: "back", see: "Die Rückseite von glatt rechts: waagrechte <b>Knötchen</b> – so sehen linke Maschen aus." },
  garter: { label: "Kraus rechts", k: "knit", make: y => Y.knitModel({ cols: 9, rows: 10, yarn: y, pattern: PAT.garter.f }), view: "front", see: "Abwechselnd V- und Knötchenreihen: Jede Rippe besteht aus 2 Reihen." },
  rib1: { label: "1×1-Rippe", k: "knit", make: y => Y.knitModel({ cols: 10, rows: 8, yarn: y, pattern: PAT.rib1.f }), view: "tilt", see: "Rechte Säulen treten hervor, linke liegen tiefer. Deshalb zieht sich die Rippe zusammen." },
  rib2: { label: "2×2-Rippe", k: "knit", make: y => Y.knitModel({ cols: 12, rows: 8, yarn: y, pattern: PAT.rib2.f }), view: "tilt", see: "Zwei V-Säulen, zwei Knötchensäulen – klassisches Bündchen." },
  seed: { label: "Perlmuster", k: "knit", make: y => Y.knitModel({ cols: 9, rows: 8, yarn: y, pattern: PAT.seed.f }), view: "front", see: "V und Knötchen wechseln wie ein Schachbrett – deshalb liegt es so flach." },
  basket: { label: "Korbmuster", k: "knit", make: y => Y.knitModel({ cols: 12, rows: 12, yarn: y, pattern: PAT.basket.f }), view: "front", see: "Blöcke aus rechten und linken Maschen wirken wie geflochten." },
  needle: { label: "Auf der Nadel", k: "knit", make: y => Y.knitModel({ cols: 8, rows: 7, yarn: y, needle: true }), view: "tilt", see: "Die oberste Reihe sitzt als <b>Schlingen</b> auf der Nadel. Jede Schlinge hat ein vorderes und ein hinteres Bein." },
  count: { label: "Reihen zählen", k: "knit", make: y => Y.knitModel({ cols: 9, rows: 8, yarn: y, color: (r, c) => c === 4 ? (r % 2 ? "#D4A23A" : "#E8BE5E") : y }), view: "front", see: "Die gelbe Säule: Zähl die Vs von unten nach oben – das sind die Reihen." },
  stripes: { label: "Streifen", k: "knit", make: y => Y.knitModel({ cols: 9, rows: 10, rowColors: [y, y, "#EFE4D0", "#EFE4D0", "#7E9C84", "#7E9C84"] }), view: "front", see: "Jeder Farbwechsel beginnt am Rand. 2 Reihen = 1 schmaler Streifen." },
  fairisle: { label: "Fair Isle", k: "knit", make: () => Y.knitModel({ cols: 11, rows: 9, color: heartColor }), view: "front", see: "Zwei Farben pro Reihe. Dreh auf die Rückseite: dort würden die Spannfäden laufen." },
  ladder: { label: "Laufmasche", k: "knit", make: y => Y.knitModel({ cols: 9, rows: 8, yarn: y, pattern: (r, c) => (c === 4 && r >= 2) ? "x" : "k" }), view: "front", see: "In der mittleren Säule fehlen die Schlingen – übrig sind die waagrechten <b>Sprossen</b>. Jede Sprosse wird mit der Häkelnadel wieder zur Masche." },
  chain: { label: "Luftmaschen", k: "crochet", make: y => Y.chainModel({ n: 10, yarn: y, hook: true }), view: "tilt", see: "Jede Luftmasche ist eine Schlinge, die durch die vorherige gezogen wurde." },
  sc: { label: "Feste Maschen", k: "crochet", make: y => Y.crochetModel({ cols: 8, rows: ["sc", "sc", "sc", "sc", "sc"], yarn: y }), view: "front", see: "Oben auf jeder Masche liegt ein V aus vorderem und hinterem Glied." },
  heights: { label: "fM · hStb · Stb", k: "crochet", make: y => Y.crochetModel({ cols: 7, rows: ["sc", "sc", "hdc", "hdc", "dc", "dc"], rowColors: ["#7E9C84", "#7E9C84", "#7E9C84", "#D4A23A", "#D4A23A", "#8A5A7E", "#8A5A7E"] }), view: "front", see: "Grün: feste Maschen. Gelb: halbe Stäbchen. Lila: Stäbchen – mit den schrägen Umschlägen in der Mitte." },
  dc: { label: "Stäbchen", k: "crochet", make: y => Y.crochetModel({ cols: 7, rows: ["dc", "dc", "dc"], yarn: y }), view: "front", see: "Stäbchen sind hoch und luftig; die Umschläge liegen schräg um den Maschenkörper." },
  ami: { label: "Amigurumi-Kugel", k: "crochet", make: () => Y.amiModel({ colors: ["#D4A23A", "#E8BE5E", "#C8664B", "#E3A08F", "#7E9C84", "#A7C0AB", "#86A9C9", "#344A6B", "#8A5A7E", "#B98AAE", "#D4A23A", "#E8BE5E"] }), view: "tilt", see: "Jede Farbe = eine Runde. Unten Zunahmen, in der Mitte gerade, oben Abnahmen." }
};
const GROUPS = { "compare-glatt": ["stockinette", "reverse", "garter"], "compare-rippe": ["rib1", "rib2", "seed"] };
const VIEWS = [["front", "Vorne"], ["back", "Hinten"], ["side", "Seite"], ["top", "Oben"], ["close", "Nah"]];
const live = [];
function viewer(el, key, opts = {}) {
  live.splice(0).forEach(v => { if (!document.body.contains(v.el)) v.destroy(); else live.push(v); });
  const keys = GROUPS[key] || (Array.isArray(key) ? key : [key]); let cur = keys[0];
  el.innerHTML = `<div class="col" style="gap:10px">
    ${keys.length > 1 ? `<div class="seg" data-role="models">${keys.map(k => `<button data-m="${k}" class="${k === cur ? "on" : ""}">${esc(M3[k].label)}</button>`).join("")}</div>` : ""}
    <div data-role="stage"></div>
    <div class="row" style="justify-content:space-between;gap:8px"><div class="seg" data-role="views">${VIEWS.map(([k, l]) => `<button data-v="${k}">${l}</button>`).join("")}</div>
      <div class="row" style="gap:6px"><button class="btn sm" data-a="build">▶ Aufbauen</button><button class="btn sm ghost" data-a="spin">⟳ Drehen</button></div></div>
    ${opts.colors === false ? "" : `<div class="swatches" data-role="yarn">${YARNS.map(([n, h]) => `<button title="${n}" data-y="${h}" style="background:${h}" class="${h === yarn() ? "on" : ""}"></button>`).join("")}</div>`}
    <div class="muted" data-role="see" style="font-size:14px"></div></div>`;
  const v = Y.create(el.querySelector("[data-role=stage]"), { height: opts.height || (window.innerWidth < 600 ? 300 : 380) }); live.push(v);
  let spinning = false;
  const load = (keepView) => { const m = M3[cur]; const model = m.make(yarn()); if (keepView) model.keepView = true; v.setModel(model); if (!keepView) setTimeout(() => v.setView(m.view || "front"), 30); v.label(m.label); el.querySelector("[data-role=see]").innerHTML = m.see || ""; };
  load(false);
  el.onclick = e => {
    const m = e.target.closest("[data-m]"); if (m) { cur = m.dataset.m; $$("[data-m]", el).forEach(b => b.classList.toggle("on", b === m)); load(false); return; }
    const vw = e.target.closest("[data-v]"); if (vw) { $$("[data-v]", el).forEach(b => b.classList.toggle("on", b === vw)); v.setView(vw.dataset.v); return; }
    const a = e.target.closest("[data-a]"); if (a) { if (a.dataset.a === "build") { v.build(M3[cur].k === "crochet" ? 5000 : 6500); if (App.addXP && !C().seen["b-" + cur]) { C().seen["b-" + cur] = 1; App.addXP(3, "studio"); } } else { spinning = !spinning; v.spin(spinning); a.classList.toggle("on", spinning); } return; }
    const y = e.target.closest("[data-y]"); if (y) { C().yarn = y.dataset.y; App.save(); $$("[data-y]", el).forEach(b => b.classList.toggle("on", b === y)); load(true); }
  };
  return { viewer: v, set(k) { cur = k; load(false); } };
}

/* ---------------- lesson widgets ---------------- */
const head = (t, tag, right = "") => App.whead(t, tag, right);
W.v3d = (el, b, l) => {
  el.innerHTML = `<div class="w">${head(esc(b.title || "3D-Modell"), "3D")}${b.note ? `<p class="muted" style="font-size:14px;margin-bottom:10px">${b.note}</p>` : ""}<div class="v3d-host"></div></div>`;
  viewer(el.querySelector(".v3d-host"), b.model);
  if (l && App.wdone("v3d-" + l.id + b.model)) App.rec(l.topic, 1);
};
W.tech = (el, b, l) => {
  const T = CraftTech.TECH[b.id]; if (!T) return;
  el.innerHTML = `<div class="w">${head(esc(T.title), "Schritt für Schritt", `<small class="muted">${esc(T.en)}</small>`)}${b.intro ? `<p class="muted" style="font-size:14px;margin-bottom:10px">${b.intro}</p>` : ""}<div class="tp-host"></div>
    <div class="row" style="gap:8px;margin-top:10px">${T.view3d ? `<button class="btn sm" data-go="studio" data-p="${T.view3d === "reverse" ? "reverse" : T.view3d}">◈ In 3D ansehen</button>` : ""}<a class="btn sm ghost" href="https://www.youtube.com/results?search_query=${encodeURIComponent(T.video)}" target="_blank" rel="noopener">▶ Video suchen</a></div></div>`;
  CraftTech.player(el.querySelector(".tp-host"), b.id, { yarn: T.craft === "knit" ? yarn() : "#8A5A7E", onStep: (i, n) => { if (i === n - 1 && l && App.wdone("tech-" + b.id + l.id)) { App.rec(l.topic, 1); App.addXP(8, "tech", el); } } });
};
W.video = (el, b) => { el.innerHTML = `<a class="spread" style="text-decoration:none;color:inherit" href="https://www.youtube.com/results?search_query=${encodeURIComponent(b.q)}" target="_blank" rel="noopener"><div class="row" style="gap:12px;flex-wrap:nowrap"><span style="width:44px;height:44px;border-radius:12px;background:#FDE7E3;color:#C0443A;display:grid;place-items:center;font-size:18px">▶</span><div><b>Video dazu ansehen</b><div><small class="muted">YouTube-Suche: „${esc(b.q)}“</small></div></div></div><span class="muted">↗</span></a>`; };
W.fabric = (el, b) => {
  const ch = chartOf(b.preset); el.innerHTML = `<div class="w">${head(esc(b.title || PAT[b.preset].name), "Maschenbild")}<div class="row" style="gap:16px;align-items:flex-start"><canvas></canvas><div class="col" style="gap:6px;flex:1;min-width:180px"><b>${esc(PAT[b.preset].name)}</b><small class="muted">${esc(PAT[b.preset].en)}</small><p style="font-size:14px">${esc(writtenFor(b.preset))}</p><div class="row" style="gap:6px"><button class="btn sm" data-go="designer" data-p="${b.preset}">▦ Im Designer öffnen</button></div></div></div></div>`;
  fabricFromChart(el.querySelector("canvas"), ch, { cell: 24, yarn: yarn() });
};
function writtenFor(key) { const p = PAT[key]; if (p.written) return p.written; return `Hinreihe: ${p.rs}. Rückreihe: ${p.ws}.`; }

/* needle sizes */
const NEEDLES = [[2, "0", "14", "—"], [2.25, "1", "13", "B/1"], [2.75, "2", "12", "C/2"], [3, "—", "11", "—"], [3.25, "3", "10", "D/3"], [3.5, "4", "—", "E/4"], [3.75, "5", "9", "F/5"], [4, "6", "8", "G/6"], [4.5, "7", "7", "7"], [5, "8", "6", "H/8"], [5.5, "9", "5", "I/9"], [6, "10", "4", "J/10"], [6.5, "10½", "3", "K/10½"], [8, "11", "0", "L/11"], [9, "13", "00", "M/13"], [10, "15", "000", "N/15"], [12, "17", "—", "O/17"], [15, "19", "—", "P/Q"]];
W.needles = el => {
  el.innerHTML = `<div class="w">${head("Nadelstärken umrechnen", "Tabelle")}<label class="fld">Suchen (mm, US oder UK)<input type="text" id="nd-q" placeholder="z. B. 4 oder US 6" autocomplete="off"></label>
    <div class="table-wrap" style="max-height:320px;overflow:auto"><table class="dt"><thead><tr><th>Metrisch</th><th>US Stricken</th><th>UK alt</th><th>US Häkeln</th></tr></thead><tbody id="nd-b"></tbody></table></div></div>`;
  const draw = q => { q = (q || "").toLowerCase().replace(",", ".").replace(/us|uk|mm/g, "").trim(); $("#nd-b", el).innerHTML = NEEDLES.filter(n => !q || n.some(x => String(x).toLowerCase() === q || String(x).toLowerCase().startsWith(q))).map(n => `<tr><td><b>${String(n[0]).replace(".", ",")} mm</b></td><td>${n[1]}</td><td>${n[2]}</td><td>${n[3]}</td></tr>`).join("") || `<tr><td colspan="4" class="muted">Nichts gefunden.</td></tr>`; };
  $("#nd-q", el).oninput = e => draw(e.target.value); draw("");
};
/* gauge calculator */
W.gauge = el => {
  const st = C().gauge || (C().gauge = { pS: 22, pR: 30, mS: 22, mR: 30, w: 50, h: 60 });
  el.innerHTML = `<div class="w">${head("Maschenprobe-Rechner", "Rechner")}
    <div class="grid g2"><div class="col" style="gap:8px"><span class="eyebrow">Anleitung (auf 10 cm)</span><div class="grid g2"><label class="fld">Maschen<input type="number" inputmode="decimal" data-g="pS" value="${st.pS}"></label><label class="fld">Reihen<input type="number" inputmode="decimal" data-g="pR" value="${st.pR}"></label></div></div>
      <div class="col" style="gap:8px"><span class="eyebrow">Meine Probe (auf 10 cm)</span><div class="grid g2"><label class="fld">Maschen<input type="number" inputmode="decimal" data-g="mS" value="${st.mS}"></label><label class="fld">Reihen<input type="number" inputmode="decimal" data-g="mR" value="${st.mR}"></label></div></div></div>
    <div class="grid g2"><label class="fld">Gewünschte Breite (cm)<input type="number" inputmode="decimal" data-g="w" value="${st.w}"></label><label class="fld">Gewünschte Höhe (cm)<input type="number" inputmode="decimal" data-g="h" value="${st.h}"></label></div>
    <div id="g-out"></div></div>`;
  const calc = () => { const n = k => +String(st[k]).replace(",", ".") || 0; const dS = n("mS") - n("pS"), pct = n("pS") ? Math.round(100 * n("mS") / n("pS") - 100) : 0;
    const verdict = Math.abs(dS) < 0.5 ? `<div class="tip"><span>✅</span><span>Passt! Deine Maschenprobe stimmt mit der Anleitung überein.</span></div>` : dS > 0 ? `<div class="warnbox"><span>↗</span><span>Du strickst <b>fester</b> (${pct > 0 ? "+" : ""}${pct} % Maschen). Nimm eine <b>dickere Nadel</b> – etwa ${(Math.max(0.25, Math.round(Math.abs(dS) / 2) * 0.5)).toLocaleString("de-AT")} mm mehr.</span></div>` : `<div class="warnbox"><span>↘</span><span>Du strickst <b>lockerer</b> (${pct} % Maschen). Nimm eine <b>dünnere Nadel</b> – etwa ${(Math.max(0.25, Math.round(Math.abs(dS) / 2) * 0.5)).toLocaleString("de-AT")} mm weniger.</span></div>`;
    const sts = Math.round(n("w") * n("mS") / 10), rows = Math.round(n("h") * n("mR") / 10);
    $("#g-out", el).innerHTML = `${verdict}<div class="cr-kpis" style="margin-top:10px"><div class="cr-kpi"><b>${sts}</b><small>Maschen anschlagen<br>(+ ggf. 2 Randmaschen)</small></div><div class="cr-kpi"><b>${rows}</b><small>Reihen für ${n("h")} cm</small></div><div class="cr-kpi"><b>${(n("mS") / 10).toLocaleString("de-AT", { maximumFractionDigits: 2 })}</b><small>Maschen pro cm</small></div></div>`; };
  $$("[data-g]", el).forEach(i => i.oninput = () => { st[i.dataset.g] = i.value; App.save(); calc(); }); calc();
};
/* distribute evenly */
W.evenly = el => {
  let total = 96, n = 8, mode = "inc", round = false;
  el.innerHTML = `<div class="w">${head("Gleichmäßig verteilen", "Rechner")}
    <div class="grid g2"><label class="fld">Maschen auf der Nadel<input type="number" inputmode="numeric" id="ev-t" value="${total}"></label><label class="fld">Anzahl<input type="number" inputmode="numeric" id="ev-n" value="${n}"></label></div>
    <div class="row" style="gap:8px"><div class="seg"><button data-md="inc" class="on">Zunehmen</button><button data-md="dec">Abnehmen</button></div><div class="seg"><button data-rd="0" class="on">In Reihen</button><button data-rd="1">In Runden</button></div></div><div id="ev-o"></div></div>`;
  const calc = () => {
    total = +$("#ev-t", el).value || 0; n = +$("#ev-n", el).value || 0; const o = $("#ev-o", el);
    if (!total || !n || (mode === "dec" && n * 2 > total)) { o.innerHTML = `<p class="muted">Bitte sinnvolle Werte eingeben.</p>`; return; }
    const parts = round ? n : n + 1, sec = total / parts; const base = Math.floor(sec), extra = total - base * parts;
    let txt;
    if (mode === "inc") {
      if (round) { const big = extra, small = n - extra; txt = `${big ? `${big}× *${base + 1} M, 1 Zunahme*` : ""}${big && small ? " und " : ""}${small ? `${small}× *${base} M, 1 Zunahme*` : ""}`; }
      else { const segs = []; for (let i = 0; i < parts; i++) segs.push(base + (i < Math.ceil(extra / 2) || i >= parts - Math.floor(extra / 2) ? 1 : 0)); txt = segs.map((s, i) => i < parts - 1 ? `${s} M, 1 Zunahme` : `${s} M`).join(" · "); }
    } else {
      const k = round ? n : n; const secD = total / k, b2 = Math.floor(secD), ex2 = total - b2 * k; txt = `${ex2 ? `${ex2}× *${b2 + 1 - 2} M, 2 zus.*` : ""}${ex2 && k - ex2 ? " und " : ""}${k - ex2 ? `${k - ex2}× *${b2 - 2} M, 2 zus.*` : ""}${!round ? " – Rest rechts" : ""}`;
    }
    o.innerHTML = `<div class="codeq" style="margin-top:10px">${txt}</div><p class="muted" style="font-size:13.5px;margin-top:6px">Ergebnis: <b>${mode === "inc" ? total + n : total - n} Maschen</b>. ${mode === "inc" ? "Zunahme z. B. als M1 (aus dem Querfaden, verschränkt)." : "Abnahme z. B. als k2tog."}</p>`;
  };
  el.oninput = calc; el.onclick = e => { const m = e.target.closest("[data-md]"), r = e.target.closest("[data-rd]"); if (m) { mode = m.dataset.md; $$("[data-md]", el).forEach(x => x.classList.toggle("on", x === m)); calc(); } if (r) { round = r.dataset.rd === "1"; $$("[data-rd]", el).forEach(x => x.classList.toggle("on", x === r)); calc(); } };
  calc();
};
/* abbreviations */
const ABBR = {
  knit: [["rechte Masche", "k (knit)", "re"], ["linke Masche", "p (purl)", "li"], ["anschlagen", "CO (cast on)", "anschl."], ["abketten", "BO (bind off) · UK: cast off", "abk."], ["Masche(n)", "st(s)", "M"], ["Reihe / Runde", "row / rnd", "R / Rd"], ["Hinreihe / Rückreihe", "RS / WS", "Hinr. / Rückr."], ["Umschlag", "yo (yarn over)", "U"], ["2 rechts zusammen", "k2tog", "2 re zus."], ["2 links zusammen", "p2tog", "2 li zus."], ["überzogene Abnahme", "ssk / skp", "1 abh., 1 re, überz."], ["aus Querfaden zunehmen", "M1L / M1R", "1 M zun."], ["vorne und hinten rechts", "kfb", "1 M re, 1 M re verschr."], ["verschränkt rechts", "k tbl", "re verschr."], ["abheben", "sl (slip)", "abh."], ["Markierer setzen/abheben", "pm / sm", "MM"], ["wiederholen", "rep / *…*", "wdh."], ["Zopf vorne/hinten", "C4F / C4B", "Zopf li/re gekreuzt"], ["zusammen", "tog", "zus."], ["Arbeit wenden", "turn", "wenden"]],
  crochet: [["Luftmasche", "ch", "ch", "Lm"], ["Kettmasche", "sl st", "ss", "Km"], ["feste Masche", "sc", "dc", "fM"], ["halbes Stäbchen", "hdc", "htr", "hStb"], ["Stäbchen", "dc", "tr", "Stb"], ["Doppelstäbchen", "tr", "dtr", "DStb"], ["Zunahme", "inc", "inc", "2 M in 1"], ["Abnahme", "dec / sc2tog", "dec / dc2tog", "2 M zus."], ["Umschlag", "yo", "yoh", "U"], ["Magic Ring", "MR", "MR", "Fadenring"], ["nur hinteres Glied", "BLO", "BLO", "hint. Glied"], ["nur vorderes Glied", "FLO", "FLO", "vord. Glied"], ["Luftmaschenbogen", "ch-sp", "ch-sp", "Lm-Bogen"], ["überspringen", "sk", "miss", "übergehen"]]
};
W.abbr = (el, b) => {
  const k = b.craft || "knit"; const rows = ABBR[k];
  el.innerHTML = `<div class="w">${head(k === "knit" ? "Strick-Abkürzungen" : "Häkel-Abkürzungen US · UK", "Lexikon")}<input type="text" id="ab-q" placeholder="Suchen … (z. B. k2tog, Stäbchen)" autocomplete="off">
    <div class="abbr-row" style="border-top:0;font-weight:600;color:var(--muted);font-size:12px;${k === "crochet" ? "grid-template-columns:1.2fr .8fr .8fr .9fr" : ""}"><span>Deutsch</span><span>${k === "knit" ? "Englisch" : "US"}</span>${k === "crochet" ? "<span>UK</span>" : ""}<span>${k === "knit" ? "Kürzel DE" : "Kürzel DE"}</span></div><div id="ab-l"></div></div>`;
  const draw = q => { q = (q || "").toLowerCase(); $("#ab-l", el).innerHTML = rows.filter(r => !q || r.join(" ").toLowerCase().includes(q)).map(r => `<div class="abbr-row" style="${k === "crochet" ? "grid-template-columns:1.2fr .8fr .8fr .9fr" : ""}"><span>${esc(r[0])}</span><b>${esc(r[1])}</b>${k === "crochet" ? `<b style="color:var(--acc)">${esc(r[2])}</b><span class="muted">${esc(r[3])}</span>` : `<span class="muted">${esc(r[2])}</span>`}</div>`).join(""); };
  $("#ab-q", el).oninput = e => draw(e.target.value); draw("");
};
/* amigurumi / circle round planner */
W.amiplan = el => {
  let start = 6, max = 36, straight = 4, shape = "ball";
  el.innerHTML = `<div class="w">${head("Runden-Planer", "Rechner")}<div class="grid g2"><label class="fld">Start (Maschen im Ring)<input type="number" id="am-s" value="6"></label><label class="fld">Größter Umfang (Maschen)<input type="number" id="am-m" value="36" step="6"></label></div>
    <div class="row" style="gap:8px"><div class="seg"><button data-sh="flat">Flacher Kreis</button><button data-sh="ball" class="on">Kugel</button><button data-sh="cup">Schale/Mütze</button></div><label class="fld" style="flex-direction:row;align-items:center;gap:8px">Gerade Runden <input type="number" id="am-g" value="4" style="width:70px"></label></div><div id="am-o"></div></div>`;
  const calc = () => {
    start = Math.max(3, +$("#am-s", el).value || 6); max = Math.max(start, +$("#am-m", el).value || 36); straight = Math.max(0, +$("#am-g", el).value || 0);
    const R = []; let n = start, r = 1; R.push([r++, `${start} fM in den Ring`, n]);
    while (n + start <= max) { const k = n / start - 1; R.push([r++, k === 0 ? `${start}× inc` : `*${k} fM, inc* ×${start}`, n += start]); }
    if (shape !== "flat") for (let i = 0; i < straight; i++) R.push([r++, `${n} fM (gerade)`, n]);
    if (shape === "ball") while (n - start >= start) { const k = n / start - 2; R.push([r++, k === 0 ? `${start}× dec` : `*${k} fM, dec* ×${start}`, n -= start]); }
    $("#am-o", el).innerHTML = `<div class="codeq" style="margin-top:10px;max-height:260px;overflow:auto">${R.map(x => `R${x[0]}: ${x[1]} (${x[2]})`).join("\n")}${shape === "ball" ? "\nFüllen, Faden durch die vorderen Glieder ziehen, zuziehen." : ""}</div><div class="row" style="margin-top:8px"><button class="btn sm" data-go="studio" data-p="ami">◈ Kugel in 3D</button><small class="muted">${R.length} Runden</small></div>`;
  };
  el.oninput = calc; el.onclick = e => { const s = e.target.closest("[data-sh]"); if (s) { shape = s.dataset.sh; $$("[data-sh]", el).forEach(x => x.classList.toggle("on", x === s)); calc(); } };
  calc();
};

window.Craft = { C, PAT, COLORCHART, chartOf, drawFabric, fabricFromChart, M3, GROUPS, viewer, YARNS, yarn, writtenFor, shade };
})();
