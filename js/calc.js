/* StudyOS · Rechner mit Live-Graph
   Lektions-/Skript-Block: { t: "calc", id: "bwl-bep" }  →  Rechner aus window.STUDYOS_CALC[id].
   Ein Rechner:
     { title, intro,                                   Überschrift und kurzer Einleitungstext (HTML)
       inputs: [{ k, label, v, min, max, step, unit }], Eingaben (Zahlenfeld + Schieberegler)
       out: v => [[label, wert, einheit, hervorheben?]],  Ergebnisse; wert = Zahl oder Text
       steps: v => "HTML",                              Rechenweg mit den eingesetzten Zahlen (aufklappbar)
       plot: { x: [a, b] | v => [a, b], y: [a, b] | v => [a, b] (sonst automatisch), xl, yl,
               fns: [{ label, f: (x, v) => y }],        Kurven; beim Darüberfahren zeigt der Graph alle Werte an der Stelle x
               bars: v => [{ label, y }],               statt Kurven: Balken
               points: v => [{ x, y, label }],          markierte Punkte (z. B. Break-even)
               xfmt, yfmt: n => "Text" } }
   Kurven bekommen die Farben fx-c0 … fx-c4 (Theme-abhängig). Wird automatisch eingebunden, auch im Skript. */
(function () {
const CALC = window.STUDYOS_CALC = window.STUDYOS_CALC || {};
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const nf = (n, d) => { if (typeof n !== "number") return String(n); if (!isFinite(n)) return "–"; const a = Math.abs(n); d = d != null ? d : a >= 1000 ? 0 : a >= 10 ? 1 : 2; return n.toLocaleString("de-AT", { minimumFractionDigits: 0, maximumFractionDigits: d }); };
const W = 560, H = 260, P = { l: 52, r: 16, t: 16, b: 34 };
const nice = (lo, hi, n = 5) => { const span = hi - lo || 1, step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0))), st = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= step0) || step0; const a = Math.floor(lo / st) * st, out = []; for (let x = a; x <= hi + st * 1e-9; x += st) if (x >= lo - st * 1e-9) out.push(+x.toFixed(10)); return out; };

function vals(root, c) { const v = {}; c.inputs.forEach(i => { const el = root.querySelector(`input[type=number][data-k="${i.k}"]`); const x = el ? parseFloat(String(el.value).replace(",", ".")) : i.v; v[i.k] = isFinite(x) ? x : i.v; }); return v; }

function plotSVG(c, v) {
  const p = c.plot; if (!p) return "";
  if (p.bars) {
    const bs = p.bars(v), max = Math.max(1e-9, ...bs.map(b => Math.abs(b.y))), bw = (W - P.l - P.r) / bs.length;
    const ys = nice(0, max); if (ys.length > 1 && ys[ys.length - 1] < max) ys.push(+(2 * ys[ys.length - 1] - ys[ys.length - 2]).toFixed(10)); const top = Math.max(ys[ys.length - 1] || 0, max), Y = y => P.t + (H - P.t - P.b) * (1 - y / top);
    return `<svg viewBox="0 0 ${W} ${H}" class="calc-svg" role="img">${ys.map(y => `<line x1="${P.l}" x2="${W - P.r}" y1="${Y(y)}" y2="${Y(y)}" class="cg-grid"/><text x="${P.l - 6}" y="${Y(y) + 4}" class="cg-tick" text-anchor="end">${(p.yfmt || nf)(y)}</text>`).join("")}
      ${bs.map((b, i) => `<g class="cg-bar fx-c${i % 5}"><rect x="${P.l + i * bw + bw * .18}" y="${Y(Math.max(0, b.y))}" width="${bw * .64}" height="${Math.max(0, Y(0) - Y(Math.abs(b.y)))}" rx="5" style="animation-delay:${i * 60}ms"/><text x="${P.l + i * bw + bw / 2}" y="${Y(Math.max(0, b.y)) - 6}" text-anchor="middle" class="cg-val">${(p.yfmt || nf)(b.y)}</text><text x="${P.l + i * bw + bw / 2}" y="${H - 12}" text-anchor="middle" class="cg-tick">${esc(b.label)}</text></g>`).join("")}</svg>`;
  }
  const [x0, x1] = typeof p.x === "function" ? p.x(v) : p.x, N = 120, xs = Array.from({ length: N + 1 }, (_, i) => x0 + (x1 - x0) * i / N);
  const series = p.fns.map(f => xs.map(x => { const y = f.f(x, v); return isFinite(y) ? y : null; }));
  let [y0, y1] = p.y ? (typeof p.y === "function" ? p.y(v) : p.y) : (() => { const all = series.flat().filter(y => y != null).concat((p.points ? p.points(v) : []).map(q => q.y)); let lo = Math.min(0, ...all), hi = Math.max(...all); if (!isFinite(hi)) hi = 1; const pad = (hi - lo) * .08 || 1; return [lo < 0 ? lo - pad : lo, hi + pad]; })();
  if (y1 <= y0) y1 = y0 + 1;
  const X = x => P.l + (W - P.l - P.r) * (x - x0) / (x1 - x0), Y = y => P.t + (H - P.t - P.b) * (1 - (Math.max(y0, Math.min(y1, y)) - y0) / (y1 - y0));
  const xt = nice(x0, x1, 6), yt = nice(y0, y1, 5), xfmt = p.xfmt || nf, yfmt = p.yfmt || nf;
  const path = s => { let d = "", pen = false; s.forEach((y, i) => { if (y == null || y < y0 - (y1 - y0) * 2 || y > y1 + (y1 - y0) * 2) { pen = false; return; } d += (pen ? "L" : "M") + X(xs[i]).toFixed(1) + " " + Y(y).toFixed(1); pen = true; }); return d; };
  return `<svg viewBox="0 0 ${W} ${H}" class="calc-svg" role="img" data-x0="${x0}" data-x1="${x1}" data-y0="${y0}" data-y1="${y1}">
    ${yt.map(y => `<line x1="${P.l}" x2="${W - P.r}" y1="${Y(y)}" y2="${Y(y)}" class="cg-grid${y === 0 ? " zero" : ""}"/><text x="${P.l - 6}" y="${Y(y) + 4}" class="cg-tick" text-anchor="end">${yfmt(y)}</text>`).join("")}
    ${xt.map(x => `<text x="${X(x)}" y="${H - P.b + 16}" class="cg-tick" text-anchor="middle">${xfmt(x)}</text>`).join("")}
    ${p.xl ? `<text x="${W - P.r}" y="${H - 3}" class="cg-lab" text-anchor="end">${esc(p.xl)}</text>` : ""}${p.yl ? `<text x="${P.l}" y="${P.t - 4}" class="cg-lab">${esc(p.yl)}</text>` : ""}
    ${series.map((s, i) => `<path d="${path(s)}" class="cg-line fx-c${i % 5}" pathLength="1"/>`).join("")}
    ${(p.points ? p.points(v) : []).filter(q => isFinite(q.x) && isFinite(q.y) && q.x >= x0 && q.x <= x1).map(q => `<g class="cg-pt"><line x1="${X(q.x)}" x2="${X(q.x)}" y1="${Y(q.y)}" y2="${H - P.b}" class="cg-drop"/><circle cx="${X(q.x)}" cy="${Y(q.y)}" r="5.5"/>${q.label ? `<text x="${X(q.x) + 8}" y="${Y(q.y) - 8}" class="cg-ptl">${esc(q.label)}</text>` : ""}</g>`).join("")}
    <g class="cg-hover" style="display:none"><line y1="${P.t}" y2="${H - P.b}" class="cg-cross"/>${series.map((_, i) => `<circle r="4.5" class="cg-hd fx-c${i % 5}"/>`).join("")}</g>
    <rect x="${P.l}" y="${P.t}" width="${W - P.l - P.r}" height="${H - P.t - P.b}" class="cg-hit"/></svg>`;
}

function draw(root, first) {
  const c = CALC[root.dataset.calc]; if (!c) return; const v = vals(root, c);
  const res = root.querySelector(".calc-out"), rows = c.out ? c.out(v) : [];
  res.innerHTML = rows.map(([l, x, u, hl]) => `<div class="calc-r${hl ? " hl" : ""}"><small>${l}</small><b>${typeof x === "number" ? nf(x) : x}${u ? ` <i>${u}</i>` : ""}</b></div>`).join("");
  const st = root.querySelector(".calc-steps .body"); if (st && c.steps) st.innerHTML = c.steps(v);
  const pl = root.querySelector(".calc-plot"); if (pl && c.plot) { pl.innerHTML = plotSVG(c, v) + (c.plot.fns ? `<div class="cg-legend">${c.plot.fns.map((f, i) => `<span class="fx-c${i % 5}"><i></i>${esc(f.label)}</span>`).join("")}</div><div class="cg-tip" hidden></div>` : ""); if (!first) pl.classList.add("still"); }
}
function hover(root, e) {
  const c = CALC[root.dataset.calc], svg = root.querySelector(".calc-svg"), tip = root.querySelector(".cg-tip"); if (!c || !svg || !tip || !c.plot.fns) return;
  const r = svg.getBoundingClientRect(), sx = (e.clientX - r.left) * W / r.width; if (sx < P.l || sx > W - P.r) return;
  const x0 = +svg.dataset.x0, x1 = +svg.dataset.x1, x = x0 + (x1 - x0) * (sx - P.l) / (W - P.l - P.r), v = vals(root, c), g = svg.querySelector(".cg-hover");
  g.style.display = ""; g.querySelector("line").setAttribute("x1", sx); g.querySelector("line").setAttribute("x2", sx);
  const ys = c.plot.fns.map(f => f.f(x, v)), y0 = +svg.dataset.y0, y1 = +svg.dataset.y1, Y = y => P.t + (H - P.t - P.b) * (1 - (y - y0) / (y1 - y0));
  g.querySelectorAll("circle").forEach((cc, i) => { const y = ys[i]; if (isFinite(y)) { cc.setAttribute("cx", sx); cc.setAttribute("cy", Math.max(P.t, Math.min(H - P.b, Y(y)))); cc.style.display = ""; } else cc.style.display = "none"; });
  tip.hidden = false; tip.innerHTML = `<b>${esc(c.plot.xl || "x")} = ${(c.plot.xfmt || nf)(x)}</b>` + c.plot.fns.map((f, i) => `<span class="fx-c${i % 5}"><i></i>${esc(f.label)}: <b>${(c.plot.yfmt || nf)(ys[i])}</b></span>`).join("");
  const pr = root.querySelector(".calc-plot").getBoundingClientRect(); tip.style.left = Math.min(pr.width - tip.offsetWidth - 4, Math.max(4, e.clientX - pr.left + 12)) + "px";
}

window.CALCX = {
  html: (b, opt = {}) => { const c = CALC[b.id]; if (!c) return "";
    return `<figure class="calc${opt.cls ? " " + opt.cls : ""}" data-calc="${esc(b.id)}">
      <div class="calc-head"><span class="eyebrow">Rechner · zum Ausprobieren</span><b>${c.title}</b>${c.intro ? `<p>${c.intro}</p>` : ""}</div>
      <div class="calc-in">${c.inputs.map(i => `<label class="calc-f"><span>${i.label}</span><div class="calc-iv"><input type="number" inputmode="decimal" data-k="${i.k}" value="${i.v}" step="${i.step || "any"}"${i.min != null ? ` min="${i.min}"` : ""}${i.max != null ? ` max="${i.max}"` : ""}>${i.unit ? `<em>${i.unit}</em>` : ""}</div>${i.min != null && i.max != null ? `<input type="range" data-r="${i.k}" min="${i.min}" max="${i.max}" step="${i.step || (i.max - i.min) / 100}" value="${i.v}">` : ""}</label>`).join("")}</div>
      <div class="calc-out" aria-live="polite"></div>
      ${c.plot ? `<div class="calc-plot"></div>` : ""}
      ${c.steps ? `<details class="calc-steps"><summary>Rechenweg mit deinen Zahlen</summary><div class="body"></div></details>` : ""}
      <div class="calc-foot"><button class="btn ghost sm" data-creset>↺ Beispielwerte</button></div></figure>`; },
  mountAll: el => (el || document).querySelectorAll(".calc[data-calc]").forEach(r => { if (!r._m) { r._m = 1; draw(r, true); } })
};
document.addEventListener("input", e => {
  const root = e.target.closest(".calc[data-calc]"); if (!root) return;
  if (e.target.dataset.r) { const n = root.querySelector(`input[type=number][data-k="${e.target.dataset.r}"]`); if (n) n.value = e.target.value; }
  else if (e.target.dataset.k) { const r = root.querySelector(`input[data-r="${e.target.dataset.k}"]`); if (r && e.target.value !== "") r.value = e.target.value; }
  draw(root);
});
document.addEventListener("click", e => { const b = e.target.closest("[data-creset]"); if (!b) return; const root = b.closest(".calc"), c = CALC[root.dataset.calc];
  c.inputs.forEach(i => { root.querySelectorAll(`[data-k="${i.k}"],[data-r="${i.k}"]`).forEach(x => x.value = i.v); }); root.querySelector(".calc-plot") && root.querySelector(".calc-plot").classList.remove("still"); draw(root, true); });
document.addEventListener("pointermove", e => { const pl = e.target.closest && e.target.closest(".calc-plot"); if (pl) hover(pl.closest(".calc"), e); });
document.addEventListener("pointerdown", e => { const pl = e.target.closest && e.target.closest(".calc-plot"); if (pl) hover(pl.closest(".calc"), e); });
const start = () => { CALCX.mountAll(document); new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && (n.matches(".calc[data-calc]") || n.querySelector(".calc[data-calc]"))) CALCX.mountAll(n.parentElement || n); }).observe(document.body, { childList: true, subtree: true }); };
if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
