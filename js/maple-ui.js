/* StudyOS · Maple-Labor Teil 2: Plot-Befehle, 2D-Plots (SVG), 3D-Plots (Canvas, drehbar), Arbeitsblätter.
   Lektionsblock: { t: "maple", code: ["with(plots):", "plot(x^2, x = -2..2);"], title?, note? }  → ausführbare Maple-Eingaben,
   die beim Öffnen automatisch laufen. Seite „Maple-Labor“ (PAGES.maple) für Kurse mit c.maple (Arbeitsblätter in c.mapleSheets). */
(function () {
const MPL = window.MPL; if (!MPL) return;
const { CMD, ast, fin, unwrap, numOf, compile, free, optsOf, optStr, varRange, pointsOf, err, isExpr, txt, html, esc } = MPL;

/* ================= Farben ================= */
const PAL = ["#C62828", "#1565C0", "#2E7D32", "#6A1B9A", "#EF6C00", "#00838F", "#AD1457", "#5D4037"];
const CN = { red: "#C62828", blue: "#1565C0", green: "#2E7D32", black: "currentColor", orange: "#EF6C00", purple: "#6A1B9A", magenta: "#C2185B", cyan: "#00838F", brown: "#6D4C41", gray: "#757575", grey: "#757575", yellow: "#F9A825", navy: "#1A237E", gold: "#C9A227", pink: "#D81B60", violet: "#7E57C2", maroon: "#7B1F1F", olive: "#827717", teal: "#00796B", coral: "#E65A4B", crimson: "#B71C1C", steelblue: "#4682B4", darkgreen: "#1B5E20", darkred: "#8B0000", lightblue: "#64B5F6", white: "#FFFFFF" };
const colOf = v => { const s = optStr(v); if (!s) return null; const k = String(s).toLowerCase().replace(/"/g, ""); return CN[k] || (/^#[0-9a-f]{3,8}$/i.test(k) ? k : null); };
const colList = v => { v = unwrap(v); if (v && v.T === "list") return v.it.map(colOf); const c = colOf(v); return c ? [c] : null; };
const strList = v => { v = unwrap(v); if (!v) return null; if (v.T === "list") return v.it.map(x => optStr(unwrap(x))); return [optStr(v)]; };

/* ================= Plot-Befehle ================= */
const P2 = (items, o) => ({ T: "plot", dim: 2, items, o: o || {} });
function plotOpts(a) {
  const o = optsOf(a), r = {};
  if (o.title) r.title = optStr(o.title);
  if (o.scaling) r.scaling = optStr(o.scaling);
  if (o.axes) r.axes = optStr(o.axes);
  if (o.labels) r.labels = strList(o.labels);
  if (o.gridlines) r.grid = optStr(o.gridlines) === "true";
  if (o.view) { const v = unwrap(o.view); if (v.T === "list") r.view = v.it.map(x => x.k === "rng" ? [numOf(x.a), numOf(x.b)] : null); else if (v.k === "rng") r.view = [null, [numOf(v.a), numOf(v.b)]]; }
  if (o.orientation) { const v = unwrap(o.orientation); if (v.T === "list") r.orient = v.it.map(numOf); }
  return r;
}
function style(o, i) {
  const cols = o.color ? colList(o.color) : null, leg = o.legend ? strList(o.legend) : null;
  return { color: cols ? cols[i % cols.length] : PAL[i % PAL.length], thick: o.thickness ? Math.max(.5, numOf(o.thickness)) : 2, dash: o.linestyle ? optStr(o.linestyle) : null, legend: leg ? leg[i] : null,
    pt: (() => { const sl = o.style ? strList(o.style) : null; return !!(sl && /point/.test(sl.length > 1 ? sl[i % sl.length] || "" : sl[0] || "")); })(), size: o.symbolsize ? numOf(o.symbolsize) / 3 : 4, alpha: o.transparency != null ? 1 - numOf(o.transparency) : null, filled: o.filled && optStr(o.filled) === "true" };
}
function sample(f, a, b, n) {
  const pts = []; let last = null;
  for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n, y = f(x); if (isFinite(y)) { pts.push([x, y]); last = y; } else if (last !== null) { pts.push(null); last = null; } }
  return pts;
}
function cutJumps(pts, yr) { const out = []; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = out[out.length - 1]; if (p && q && Math.abs(p[1] - q[1]) > (yr[1] - yr[0]) * 3) out.push(null); out.push(p); } return out; }
const isPointList = v => v && v.T === "list" && v.it.length && v.it.every(p => { p = unwrap(p); return p.T === "list" && p.it.length === 2 && p.it.every(z => typeof unwrap(z) === "number"); });
CMD.plot = function (a) {
  const S = this, o = optsOf(a), po = plotOpts(a);
  const rngs = a.filter((x, i) => i > 0 && x && (x.k === "rel" && x.b && x.b.k === "rng" || x.k === "rng"));
  const xr = rngs[0], yr = rngs[1];
  let xa = -10, xb = 10, xv = null;
  if (xr) { if (xr.k === "rng") { xa = numOf(xr.a); xb = numOf(xr.b); } else { xv = xr.a.n; xa = numOf(xr.b.a); xb = numOf(xr.b.b); } }
  if (yr) po.view = [po.view ? po.view[0] : null, yr.k === "rng" ? [numOf(yr.a), numOf(yr.b)] : [numOf(yr.b.a), numOf(yr.b.b)]];
  const n = o.numpoints ? numOf(o.numpoints) : 800, items = [];
  const one = (f, i) => {
    f = unwrap(f); const st = style(o, i);
    if (isPointList(f)) { const pts = pointsOf(f); items.push(Object.assign({}, st, { type: st.pt ? "pts" : "line", pts })); return; }
    if (f && f.T === "list" && f.it.length === 3 && f.it[2].k === "rel") { const t = f.it[2], tv = t.a.n, ta = numOf(t.b.a), tb = numOf(t.b.b), fx = compile(ast(f.it[0]), [tv]), fy = compile(ast(f.it[1]), [tv]); const pts = []; for (let k = 0; k <= n; k++) { const tt = ta + (tb - ta) * k / n, X = fx(tt), Y = fy(tt); pts.push(isFinite(X) && isFinite(Y) ? [X, Y] : null); } items.push(Object.assign({ type: "line", pts }, st)); return; }
    let g;
    if (f && f.T === "proc") g = x => numOf(S.apply(f, [x]));
    else { const e = ast(f); const fv = [...free(e)]; const v = xv || fv[0] || "x"; if (fv.some(z => z !== v)) throw err("plot", "der Ausdruck enthält weitere Unbekannte: " + fv.filter(z => z !== v).join(", ")); const c = compile(e, [v]); g = x => c(x); }
    items.push(Object.assign({}, st, { type: st.pt ? "pts" : "line", pts: sample(g, xa, xb, st.pt ? Math.min(n, 40) : n), fn: true }));
  };
  const f0 = unwrap(a[0]);
  if (f0 && (f0.T === "list" || f0.T === "set") && !isPointList(f0) && !(f0.it.length === 3 && f0.it[2] && f0.it[2].k === "rel")) f0.it.forEach(one); else one(f0, 0);
  if (!po.xr) po.xr = [xa, xb];
  return P2(items, po);
};
CMD.pointplot = function (a) { const o = optsOf(a), st = style(o, 0); let pts; const v = unwrap(a[0]); if (v.T === "list" && v.it.length && v.it.every(x => typeof unwrap(x) === "number") && a[1] && a[1].T === "list") pts = v.it.map((x, i) => [numOf(x), numOf(a[1].it[i])]); else pts = pointsOf(v); return P2([Object.assign({ type: "pts", pts }, st, { color: o.color ? colOf(o.color) : "#1565C0", size: o.symbolsize ? numOf(o.symbolsize) / 3 : 4.5 })], plotOpts(a)); };
CMD.polygonplot = function (a) { const o = optsOf(a), v = unwrap(a[0]);
  /* Matrix: n×2 (Zeilen = Punkte) oder 2×n (Spalten = Punkte, z. B. DeleteRow(P, 3) aus homogenen Koordinaten) */
  const isMt = m => m && m.T === "mat", fromM = m => { const d = m.d.map(r => r.map(numOf)); return m.c === 2 && m.r !== 2 ? d : d[0].map((_, j) => [d[0][j], d[1][j]]); };
  const polys = isMt(v) ? [fromM(v)] : isPointList(v) ? [pointsOf(v)] : v.it.map(p => isMt(unwrap(p)) ? fromM(unwrap(p)) : pointsOf(unwrap(p))); return P2(polys.map((pts, i) => Object.assign({ type: "poly", pts }, style(o, i), { alpha: o.transparency != null ? 1 - numOf(o.transparency) : .35 })), plotOpts(a)); };
CMD.textplot = function (a) { const o = optsOf(a), v = unwrap(a[0]); const it = v.it && v.it.length === 3 && typeof unwrap(v.it[0]) === "number" ? [v] : v.it; return P2(it.map(t => { t = unwrap(t); return { type: "text", x: numOf(t.it[0]), y: numOf(t.it[1]), s: optStr(unwrap(t.it[2])), color: o.color ? colOf(o.color) : "currentColor" }; }), plotOpts(a)); };
CMD.arrow = function (a) { const o = optsOf(a), p = unwrap(a[0]), v = unwrap(a[1]); const P = (p.it || p.d).map(numOf), W = (v.it || v.d).map(numOf); return P2([{ type: "arrow", x1: P[0], y1: P[1], x2: P[0] + W[0], y2: P[1] + W[1], color: o.color ? colOf(o.color) : PAL[1], thick: 2 }], plotOpts(a)); };
CMD.implicitplot = function (a) {
  const o = optsOf(a), po = plotOpts(a), e = MPL.A.sub(ast(unwrap(a[0])).k === "rel" ? fin(ast(unwrap(a[0])).a) : unwrap(a[0]), ast(unwrap(a[0])).k === "rel" ? fin(ast(unwrap(a[0])).b) : 0);
  const r = a.filter(x => x && x.k === "rel" && x.b && x.b.k === "rng").map(varRange); if (r.length < 2) throw err("implicitplot", "Bereiche x = a..b, y = c..d angeben");
  const f = compile(ast(e), [r[0].v, r[1].v]), G = o.grid ? numOf(unwrap(o.grid).it[0]) : 160;
  const segs = contour((x, y) => f(x, y), r[0].lo, r[0].hi, r[1].lo, r[1].hi, G, 0);
  po.xr = [r[0].lo, r[0].hi]; po.yr0 = [r[1].lo, r[1].hi];
  return P2([Object.assign({ type: "seg", segs }, style(o, 0))], po);
};
CMD.contourplot = function (a) {
  const o = optsOf(a), po = plotOpts(a), e = ast(unwrap(a[0])), r = a.filter(x => x && x.k === "rel" && x.b && x.b.k === "rng").map(varRange);
  const f = compile(e, [r[0].v, r[1].v]), nl = o.contours ? (unwrap(o.contours).T === "list" ? unwrap(o.contours).it.map(numOf) : numOf(o.contours)) : 10;
  let lo = Infinity, hi = -Infinity; for (let i = 0; i <= 40; i++) for (let j = 0; j <= 40; j++) { const z = f(r[0].lo + (r[0].hi - r[0].lo) * i / 40, r[1].lo + (r[1].hi - r[1].lo) * j / 40); if (isFinite(z)) { lo = Math.min(lo, z); hi = Math.max(hi, z); } }
  const levels = Array.isArray(nl) ? nl : Array.from({ length: nl }, (_, i) => lo + (hi - lo) * (i + 1) / (nl + 1));
  po.xr = [r[0].lo, r[0].hi]; po.yr0 = [r[1].lo, r[1].hi];
  return P2(levels.map((lv, i) => ({ type: "seg", segs: contour((x, y) => f(x, y), r[0].lo, r[0].hi, r[1].lo, r[1].hi, 90, lv), color: heat((lv - lo) / ((hi - lo) || 1)), thick: 1.6 })), po);
};
CMD.plot3d = function (a) {
  const S = this, o = optsOf(a), po = plotOpts(a), f0 = unwrap(a[0]);
  const rs = a.slice(1).filter(x => x && (x.k === "rng" || (x.k === "rel" && x.b && x.b.k === "rng")));
  const R = rs.map(x => x.k === "rng" ? { v: null, lo: numOf(x.a), hi: numOf(x.b) } : varRange(x)); if (R.length < 2) throw err("plot3d", "zwei Bereiche angeben: x = a..b, y = c..d");
  const gr = o.grid ? unwrap(o.grid).it.map(numOf) : [40, 40];
  const surf = (fe, k) => { let g; if (fe && fe.T === "proc") g = (x, y) => numOf(S.apply(fe, [x, y])); else { const e = ast(fe); const vs = [R[0].v || "x", R[1].v || "y"]; const c = compile(e, vs); g = (x, y) => c(x, y); }
    const xs = Array.from({ length: gr[0] + 1 }, (_, i) => R[0].lo + (R[0].hi - R[0].lo) * i / gr[0]), ys = Array.from({ length: gr[1] + 1 }, (_, j) => R[1].lo + (R[1].hi - R[1].lo) * j / gr[1]);
    return { type: "surf", xs, ys, z: xs.map(x => ys.map(y => { const v = g(x, y); return isFinite(v) ? v : NaN; })), color: o.color ? colOf(o.color) : null, k }; };
  /* plot3d([f, g, h], s = a..b, t = c..d) ist wie in Maple eine Parameterfläche, eine Menge {f, g} mehrere Flächen */
  const psurf = L => { const vs = [R[0].v || "s", R[1].v || "t"], cs = L.map(e => compile(ast(unwrap(e)), vs)); const n0 = gr[0], n1 = gr[1];
    const G = Array.from({ length: n0 + 1 }, (_, i) => Array.from({ length: n1 + 1 }, (_, j) => { const u = R[0].lo + (R[0].hi - R[0].lo) * i / n0, v = R[1].lo + (R[1].hi - R[1].lo) * j / n1; const P = cs.map(c => c(u, v)); return P.every(isFinite) ? P : null; }));
    return { type: "grid", G, color: o.color ? colOf(o.color) : null }; };
  const items = f0 && f0.T === "list" && f0.it.length === 3 && f0.it.every(x => { x = unwrap(x); return !(x && (x.T === "list" || x.T === "set")); }) ? [psurf(f0.it)]
    : f0 && (f0.T === "list" || f0.T === "set") ? f0.it.map((x, k) => surf(unwrap(x), k)) : [surf(f0, 0)];
  if (o.labels) po.labels = strList(o.labels); else po.labels = items[0].type === "grid" ? ["x", "y", "z"] : [R[0].v || "x", R[1].v || "y", ""];
  return { T: "plot", dim: 3, items, o: po };
};
CMD.pointplot3d = function (a) { const v = unwrap(a[0]); const pts = v.it.map(p => unwrap(p).it.map(numOf)); return { T: "plot", dim: 3, items: [{ type: "pts3", pts, color: optsOf(a).color ? colOf(optsOf(a).color) : PAL[1] }], o: plotOpts(a) }; };
CMD.display = function (a) {
  const ps = a.flatMap(x => { x = unwrap(x); return x && (x.T === "list" || x.T === "set") ? x.it.map(unwrap) : [x]; }).filter(x => x && x.T === "plot");
  if (!ps.length) throw err("display", "keine Plots übergeben");
  const po = Object.assign({}, ...ps.map(p => p.o), plotOpts(a));
  const xr = ps.map(p => p.o.xr).filter(Boolean); if (xr.length) po.xr = [Math.min(...xr.map(r => r[0])), Math.max(...xr.map(r => r[1]))];
  return { T: "plot", dim: ps.some(p => p.dim === 3) ? 3 : 2, items: ps.flatMap(p => p.items), o: po };
};
CMD.animate = function () { throw err("animate", "Animationen gibt es hier als Schieberegler in den Lektionen"); };

/* Marching Squares: Niveaulinie f(x,y) = level */
function contour(f, x0, x1, y0, y1, n, level) {
  const segs = [], dx = (x1 - x0) / n, dy = (y1 - y0) / n, Z = [];
  for (let i = 0; i <= n; i++) { Z.push([]); for (let j = 0; j <= n; j++) Z[i].push(f(x0 + i * dx, y0 + j * dy) - level); }
  const ip = (a, b, za, zb) => a + (b - a) * (za / (za - zb));
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const a = Z[i][j], b = Z[i + 1][j], c = Z[i + 1][j + 1], d = Z[i][j + 1]; if (![a, b, c, d].every(isFinite)) continue;
    const X = x0 + i * dx, Y = y0 + j * dy, P = [];
    if ((a > 0) !== (b > 0)) P.push([ip(X, X + dx, a, b), Y]);
    if ((b > 0) !== (c > 0)) P.push([X + dx, ip(Y, Y + dy, b, c)]);
    if ((c > 0) !== (d > 0)) P.push([ip(X + dx, X, c, d), Y + dy]);
    if ((d > 0) !== (a > 0)) P.push([X, ip(Y + dy, Y, d, a)]);
    if (P.length === 2) segs.push([P[0][0], P[0][1], P[1][0], P[1][1]]);
    else if (P.length === 4) { segs.push([P[0][0], P[0][1], P[1][0], P[1][1]]); segs.push([P[2][0], P[2][1], P[3][0], P[3][1]]); }
  }
  return segs;
}
MPL.contour = contour;
function heat(t) { t = Math.max(0, Math.min(1, t)); const h = 240 - 240 * t; return `hsl(${h} 75% 45%)`; }

/* ================= 2D-Renderer (SVG) ================= */
function niceStep(span, target) { const raw = span / target, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p; return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p; }
const fmtTick = v => { const r = +v.toPrecision(6); return Math.abs(r) < 1e-12 ? "0" : String(r).replace("-", "−"); };
function bounds(pl) {
  let xs = [], ys = [];
  pl.items.forEach(it => {
    if (it.pts) it.pts.forEach(p => { if (p) { xs.push(p[0]); ys.push(p[1]); } });
    if (it.segs) it.segs.forEach(s => { xs.push(s[0], s[2]); ys.push(s[1], s[3]); });
    if (it.type === "text") { xs.push(it.x); ys.push(it.y); }
    if (it.type === "arrow") { xs.push(it.x1, it.x2); ys.push(it.y1, it.y2); }
  });
  const o = pl.o; let xr = o.view && o.view[0] ? o.view[0] : o.xr || [Math.min(...xs), Math.max(...xs)];
  let yr;
  if (o.view && o.view[1]) yr = o.view[1];
  else if (o.yr0) yr = o.yr0;
  else {
    const fy = pl.items.filter(it => it.fn).flatMap(it => it.pts.filter(Boolean).map(p => p[1])).sort((a, b) => a - b);
    let lo = Math.min(...ys), hi = Math.max(...ys);
    if (fy.length > 20) { const q1 = fy[Math.floor(fy.length * .03)], q2 = fy[Math.ceil(fy.length * .97) - 1]; const inner = q2 - q1 || 1; if ((hi - lo) > 12 * inner) { lo = Math.max(lo, q1 - inner * .6); hi = Math.min(hi, q2 + inner * .6); } }
    if (!isFinite(lo)) { lo = -1; hi = 1; } if (hi - lo < 1e-12) { lo -= 1; hi += 1; }
    yr = [lo, hi];
  }
  if (!isFinite(xr[0]) || !isFinite(xr[1])) xr = [-1, 1]; if (xr[1] - xr[0] < 1e-12) xr = [xr[0] - 1, xr[1] + 1];
  return { xr: xr.slice(), yr: yr.slice() };
}
MPL.svg2d = function (pl, opt = {}) {
  const W = opt.w || 560, H = opt.h || 360, o = pl.o, hasLeg = pl.items.some(i => i.legend);
  const mt = o.title ? 28 : 14, mb = hasLeg ? 46 : 26, ml = 46, mr = 16;
  let { xr, yr } = bounds(pl);
  const pad = (r, f) => { const d = (r[1] - r[0]) * f; return [r[0] - d, r[1] + d]; };
  if (!(o.view && o.view[1]) && !o.yr0) yr = pad(yr, .04);
  const pw = W - ml - mr, ph = H - mt - mb;
  if (o.scaling === "constrained") { const sx = pw / (xr[1] - xr[0]), sy = ph / (yr[1] - yr[0]); if (sx > sy) { const c = (xr[0] + xr[1]) / 2, h = pw / sy / 2; xr = [c - h, c + h]; } else { const c = (yr[0] + yr[1]) / 2, h = ph / sx / 2; yr = [c - h, c + h]; } }
  const X = x => ml + (x - xr[0]) / (xr[1] - xr[0]) * pw, Y = y => mt + ph - (y - yr[0]) / (yr[1] - yr[0]) * ph;
  const id = "c" + Math.random().toString(36).slice(2, 8);
  let s = `<svg class="mplot" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img"><defs><clipPath id="${id}"><rect x="${ml}" y="${mt}" width="${pw}" height="${ph}"/></clipPath><marker id="${id}a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="context-stroke"/></marker></defs>`;
  if (o.title) s += `<text x="${W / 2}" y="18" class="mp-title" text-anchor="middle">${esc(o.title)}</text>`;
  const sx = niceStep(xr[1] - xr[0], pw / 70), sy = niceStep(yr[1] - yr[0], ph / 45);
  const ax0 = yr[0] <= 0 && yr[1] >= 0 && o.axes !== "boxed" ? Y(0) : mt + ph, ay0 = xr[0] <= 0 && xr[1] >= 0 && o.axes !== "boxed" ? X(0) : ml;
  let grid = "", ticks = "";
  for (let v = Math.ceil(xr[0] / sx) * sx; v <= xr[1] + sx * 1e-9; v += sx) { const px = X(v); grid += `<line x1="${px}" y1="${mt}" x2="${px}" y2="${mt + ph}"/>`; if (Math.abs(px - ay0) > 2 || ax0 === mt + ph) ticks += `<line x1="${px}" y1="${ax0}" x2="${px}" y2="${ax0 + 4}" class="mp-ax"/><text x="${px}" y="${Math.min(ax0 + 15, H - mb + 14)}" text-anchor="middle">${fmtTick(v)}</text>`; }
  for (let v = Math.ceil(yr[0] / sy) * sy; v <= yr[1] + sy * 1e-9; v += sy) { const py = Y(v); grid += `<line x1="${ml}" y1="${py}" x2="${ml + pw}" y2="${py}"/>`; if (Math.abs(py - ax0) > 2 || ay0 === ml) ticks += `<line x1="${ay0 - 4}" y1="${py}" x2="${ay0}" y2="${py}" class="mp-ax"/><text x="${Math.max(ay0 - 7, 30)}" y="${py + 4}" text-anchor="end">${fmtTick(v)}</text>`; }
  if (o.axes !== "none") s += `<g class="mp-grid">${grid}</g>`;
  if (o.axes === "boxed") s += `<rect x="${ml}" y="${mt}" width="${pw}" height="${ph}" class="mp-box"/>`;
  s += `<g clip-path="url(#${id})">`;
  pl.items.forEach(it => {
    const c = it.color || PAL[0];
    if (it.type === "poly") s += `<polygon points="${it.pts.map(p => X(p[0]) + "," + Y(p[1])).join(" ")}" fill="${c}" fill-opacity="${it.alpha == null ? .35 : it.alpha}" stroke="${c}" stroke-width="1.6"/>`;
    else if (it.type === "line") { let d = "", pen = false; it.pts.forEach(p => { if (!p) { pen = false; return; } const px = X(p[0]), py = Y(p[1]); if (Math.abs(py) > 1e5) { pen = false; return; } d += (pen ? "L" : "M") + px.toFixed(2) + " " + py.toFixed(2); pen = true; }); s += `<path d="${d}" fill="none" stroke="${c}" stroke-width="${it.thick}" stroke-linejoin="round" stroke-linecap="round"${it.dash ? ` stroke-dasharray="${it.dash === "dot" ? "2 4" : "7 5"}"` : ""}/>`; }
    else if (it.type === "seg") s += `<path d="${it.segs.map(g => `M${X(g[0]).toFixed(2)} ${Y(g[1]).toFixed(2)}L${X(g[2]).toFixed(2)} ${Y(g[3]).toFixed(2)}`).join("")}" stroke="${c}" stroke-width="${it.thick || 2}" stroke-linecap="round" fill="none"/>`;
    else if (it.type === "arrow") s += `<line x1="${X(it.x1)}" y1="${Y(it.y1)}" x2="${X(it.x2)}" y2="${Y(it.y2)}" stroke="${c}" stroke-width="${it.thick}" marker-end="url(#${id}a)"/>`;
  });
  s += `</g>`;
  if (o.axes !== "none" && o.axes !== "boxed") s += `<g class="mp-ax"><line x1="${ml}" y1="${ax0}" x2="${ml + pw}" y2="${ax0}"/><line x1="${ay0}" y1="${mt}" x2="${ay0}" y2="${mt + ph}"/></g>`;
  if (o.axes !== "none") s += `<g class="mp-tick">${ticks}</g>`;
  pl.items.forEach(it => {
    const c = it.color || PAL[0];
    if (it.type === "pts") s += it.pts.filter(p => p && p[0] >= xr[0] && p[0] <= xr[1] && p[1] >= yr[0] && p[1] <= yr[1]).map(p => `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="${it.size || 4}" fill="${c}"/>`).join("");
    if (it.type === "text") s += `<text x="${X(it.x)}" y="${Y(it.y)}" class="mp-txt" text-anchor="middle" fill="${c}">${esc(it.s)}</text>`;
  });
  const lb = o.labels || ["x", "y"];
  if (o.axes !== "none") s += `<text x="${ml + pw}" y="${ax0 - 6}" class="mp-lab" text-anchor="end">${esc(lb[0] || "")}</text><text x="${ay0 + 6}" y="${mt + 10}" class="mp-lab">${esc(lb[1] || "")}</text>`;
  if (hasLeg) { const L = pl.items.filter(i => i.legend); let x = ml; s += L.map(it => { const w = 26 + it.legend.length * 6.6; const g = `<line x1="${x}" y1="${H - 14}" x2="${x + 18}" y2="${H - 14}" stroke="${it.color}" stroke-width="3"/><text x="${x + 23}" y="${H - 10}" class="mp-leg">${esc(it.legend)}</text>`; x += w + 14; return g; }).join(""); }
  return s + `</svg>`;
};

/* ================= 3D-Renderer (Canvas, mit der Maus/dem Finger drehbar) ================= */
function zcol(t, shade) { t = Math.max(0, Math.min(1, t)); const h = 250 - 250 * t; const l = 30 + 30 * shade; return `hsl(${h.toFixed(0)} 72% ${l.toFixed(0)}%)`; }
MPL.draw3d = function (cv, pl, st) {
  const dpr = window.devicePixelRatio || 1, W = cv.clientWidth || 520, H = cv.clientHeight || 380;
  if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
  const css = getComputedStyle(cv), fg = css.color || "#222", mut = css.getPropertyValue("--muted") || "#777";
  /* jede Fläche als Gitter von Raumpunkten: normale Flächen z = f(x, y) und Parameterflächen gleich behandeln */
  const grids = pl.items.map(it => it.type === "surf" ? { it, G: it.xs.map((x, i) => it.ys.map((y, j) => isFinite(it.z[i][j]) ? [x, y, it.z[i][j]] : null)) } : it.type === "grid" ? { it, G: it.G } : null).filter(Boolean);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  const ext = P => { if (!P) return; x0 = Math.min(x0, P[0]); x1 = Math.max(x1, P[0]); y0 = Math.min(y0, P[1]); y1 = Math.max(y1, P[1]); z0 = Math.min(z0, P[2]); z1 = Math.max(z1, P[2]); };
  grids.forEach(g => g.G.forEach(r => r.forEach(ext))); pl.items.forEach(it => { if (it.type === "pts3" || it.type === "line3") it.pts.forEach(ext); });
  if (!isFinite(x0)) { x0 = -1; x1 = 1; y0 = -1; y1 = 1; z0 = -1; z1 = 1; }
  if (pl.o.view && pl.o.view[2]) { z0 = pl.o.view[2][0]; z1 = pl.o.view[2][1]; }
  if (x1 - x0 < 1e-12) { x0 -= 1; x1 += 1; } if (y1 - y0 < 1e-12) { y0 -= 1; y1 += 1; } if (z1 - z0 < 1e-12) { z0 -= 1; z1 += 1; }
  /* scaling = constrained: gleiche Einheit auf allen Achsen (Rotationskörper sehen sonst verzerrt aus) */
  if (pl.o.scaling === "constrained") { const m = Math.max(x1 - x0, y1 - y0, (z1 - z0) / .8), c = [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2]; x0 = c[0] - m / 2; x1 = c[0] + m / 2; y0 = c[1] - m / 2; y1 = c[1] + m / 2; z0 = c[2] - m * .4; z1 = c[2] + m * .4; }
  const nx = x => (x - x0) / (x1 - x0) * 2 - 1, ny = y => (y - y0) / (y1 - y0) * 2 - 1, nz = z => ((Math.max(z0, Math.min(z1, z)) - z0) / (z1 - z0) * 2 - 1) * .8;
  const th = st.th, ph = st.ph, ct = Math.cos(th), sn = Math.sin(th), cp = Math.cos(ph), sp = Math.sin(ph), sc = Math.min(W, H) * .33 * (st.zoom || 1);
  const pr = (x, y, z) => { const X = x * ct - y * sn, Y = x * sn + y * ct; return [W / 2 + X * sc, H / 2 + 12 - (z * cp + Y * sp) * sc, Y * cp - z * sp]; };
  const box = [[-1, -1, -.8], [1, -1, -.8], [1, 1, -.8], [-1, 1, -.8], [-1, -1, .8], [1, -1, .8], [1, 1, .8], [-1, 1, .8]].map(p => pr(...p));
  const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  g.lineWidth = 1; g.strokeStyle = mut; g.globalAlpha = .45; E.forEach(([a, b]) => { g.beginPath(); g.moveTo(box[a][0], box[a][1]); g.lineTo(box[b][0], box[b][1]); g.stroke(); }); g.globalAlpha = 1;
  const quads = [];
  grids.forEach(({ it, G }) => {
    const P = G.map(r => r.map(w => w ? { p: pr(nx(w[0]), ny(w[1]), nz(w[2])), z: w[2], w: [nx(w[0]), ny(w[1]), nz(w[2])] } : null));
    for (let i = 0; i < P.length - 1; i++) for (let j = 0; j < P[i].length - 1; j++) {
      const a = P[i][j], b = P[i + 1][j], c = P[i + 1][j + 1], d = P[i][j + 1]; if (!a || !b || !c || !d) continue;
      const u = [c.w[0] - a.w[0], c.w[1] - a.w[1], c.w[2] - a.w[2]], v = [d.w[0] - b.w[0], d.w[1] - b.w[1], d.w[2] - b.w[2]];
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], nl = Math.hypot(...n) || 1, lt = Math.abs((n[0] * .3 + n[1] * .4 + n[2] * .85) / nl);
      quads.push({ pts: [a.p, b.p, c.p, d.p], depth: (a.p[2] + b.p[2] + c.p[2] + d.p[2]) / 4, t: ((a.z + b.z + c.z + d.z) / 4 - z0) / (z1 - z0), lt, col: it.color, alpha: it.alpha });
    }
  });
  quads.sort((p, q) => q.depth - p.depth);
  const gridOn = quads.length < 4000;
  quads.forEach(q => { g.beginPath(); g.moveTo(q.pts[0][0], q.pts[0][1]); for (let k = 1; k < 4; k++) g.lineTo(q.pts[k][0], q.pts[k][1]); g.closePath(); g.fillStyle = q.col ? q.col : zcol(q.t, q.lt); g.globalAlpha = q.alpha != null ? q.alpha : q.col ? .55 + .45 * q.lt : 1; g.fill(); g.globalAlpha = 1; if (gridOn) { g.strokeStyle = "rgba(0,0,0,.28)"; g.lineWidth = .5; g.stroke(); } });
  pl.items.forEach(it => { if (it.type !== "line3") return; g.strokeStyle = it.color || fg; g.lineWidth = it.thick || 2.5; if (it.dash) g.setLineDash([6, 4]); g.beginPath(); let on = false; it.pts.forEach(p => { if (!p) { on = false; return; } const q = pr(nx(p[0]), ny(p[1]), nz(p[2])); if (on) g.lineTo(q[0], q[1]); else { g.moveTo(q[0], q[1]); on = true; } }); g.stroke(); g.setLineDash([]); g.lineWidth = 1; });
  pl.items.forEach(it => { if (it.type !== "pts3") return; it.pts.forEach(p => { const q = pr(nx(p[0]), ny(p[1]), nz(p[2])); g.fillStyle = it.color; g.beginPath(); g.arc(q[0], q[1], 4, 0, 7); g.fill(); }); });
  g.fillStyle = fg; g.font = "11px system-ui,sans-serif"; g.textAlign = "center";
  const tk = (A, B, v0, v1, lab) => { const a = A, b = B; for (let k = 0; k <= 4; k++) { const t = k / 4, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t; g.fillText(fmtTick(+(v0 + (v1 - v0) * t).toPrecision(3)), x, y + 14); } if (lab) { g.font = "italic 13px system-ui,sans-serif"; g.fillText(lab, (a[0] + b[0]) / 2 + 12, (a[1] + b[1]) / 2 + 30); g.font = "11px system-ui,sans-serif"; } };
  const lb = pl.o.labels || ["x", "y", ""];
  const lowY = [[0, 1], [3, 2], [0, 3], [1, 2]].map(([i, j]) => ({ i, j, y: (box[i][1] + box[j][1]) / 2 })).sort((a, b) => b.y - a.y);
  const ex = lowY.find(e => (e.i === 0 && e.j === 1) || (e.i === 3 && e.j === 2)), ey = lowY.find(e => (e.i === 0 && e.j === 3) || (e.i === 1 && e.j === 2));
  tk(box[ex.i], box[ex.j], x0, x1, lb[0]); tk(box[ey.i], box[ey.j], y0, y1, lb[1]);
  const left = [0, 1, 2, 3].sort((a, b) => box[a][0] - box[b][0])[0]; g.textAlign = "right"; for (let k = 0; k <= 4; k++) { const t = k / 4, A = box[left], B = box[left + 4]; g.fillText(fmtTick(+(z0 + (z1 - z0) * t).toPrecision(3)), A[0] + (B[0] - A[0]) * t - 6, A[1] + (B[1] - A[1]) * t + 4); }
  if (lb[2]) { g.font = "italic 13px system-ui,sans-serif"; g.fillText(lb[2], box[left + 4][0] - 6, box[left + 4][1] - 8); }
  if (pl.o.title) { g.textAlign = "center"; g.font = "600 13px system-ui,sans-serif"; g.fillText(pl.o.title, W / 2, 16); }
};
function mount3d(wrap, pl) {
  const cv = wrap.querySelector("canvas"), o = pl.o.orient || [-55, 62];
  /* schon montiert (z. B. Schieberegler in einer Abbildung): Blickwinkel behalten, nur neu zeichnen */
  if (cv._st) { cv._pl = pl; cv._redraw(); return; }
  cv._pl = pl;
  const st = { th: o[0] * Math.PI / 180, ph: (90 - o[1]) * Math.PI / 180 * .9 + .2, zoom: 1 }; cv._st = st;
  const draw = () => MPL.draw3d(cv, cv._pl, st); let drag = null;
  cv.onpointerdown = e => { drag = [e.clientX, e.clientY, st.th, st.ph]; cv.setPointerCapture(e.pointerId); };
  cv.onpointermove = e => { if (!drag) return; st.th = drag[2] - (e.clientX - drag[0]) * .01; st.ph = Math.max(-.2, Math.min(1.5, drag[3] + (e.clientY - drag[1]) * .01)); draw(); };
  cv.onpointerup = cv.onpointercancel = () => { drag = null; };
  cv.ondblclick = () => { st.th = o[0] * Math.PI / 180; st.ph = (90 - o[1]) * Math.PI / 180 * .9 + .2; draw(); };
  draw(); cv._redraw = draw;
}
MPL.mount3d = mount3d;

/* ================= Ausgabe einer Eingabegruppe ================= */
function outHTML(r) {
  if (r.err) return `<div class="mw-err">${esc(r.err)}</div>`;
  const v = r.v;
  if (v && v.T === "plot") return v.dim === 3 ? `<div class="mw-plot mw-3d"><canvas></canvas><small>3D-Plot: ziehen zum Drehen, Doppelklick setzt zurück</small></div>` : `<div class="mw-plot">${MPL.svg2d(v)}</div>`;
  const body = html(v, r.fl);
  return `<div class="mw-o">${r.asg ? `<span class="mw-lhs"><i>${esc(MPL.GREEK[r.asg] || r.asg)}</i> ≔ </span>` : ""}${body}</div>`;
}
MPL.runGroup = function (sess, grp) {
  const ta = grp.querySelector(".mw-code"), out = grp.querySelector(".mw-out"); if (!ta || !out) return;
  let res; try { res = sess.run(ta.value); } catch (e) { res = [{ err: "Error, " + e.message }]; }
  out.innerHTML = res.map(outHTML).join("");
  const plots = res.filter(r => r.v && r.v.T === "plot" && r.v.dim === 3); const cvs = out.querySelectorAll(".mw-3d"); plots.forEach((r, i) => mount3d(cvs[i], r.v));
  grp.classList.toggle("has-err", res.some(r => r.err));
};
const rows = s => Math.max(1, String(s).split("\n").length);
MPL.groupHTML = (code, extra = "") => `<div class="mw-g"${extra}><div class="mw-in"><span class="mw-pr">&gt;</span><textarea class="mw-code" spellcheck="false" autocapitalize="off" autocomplete="off" rows="${rows(code)}">${esc(code)}</textarea><button class="mw-run" title="Ausführen (Enter)" aria-label="Ausführen">▶</button></div><div class="mw-out"></div></div>`;
MPL.blockHTML = b => `<div class="mw-sheet mw-lesson" data-auto="1">${b.title ? `<div class="mw-head"><span class="eyebrow">Maple</span><b>${b.title}</b></div>` : `<div class="mw-head"><span class="eyebrow">So geht's in Maple</span></div>`}
  ${(b.code || []).map(c => typeof c === "string" ? MPL.groupHTML(c) : `<p class="mw-text">${c.text}</p>`).join("")}${b.note ? `<p class="mw-note">${b.note}</p>` : ""}<div class="mw-foot"><button class="btn sm ghost" data-mwall>!!! Alles neu ausführen</button>${window.App && App.CBY && App.CBY.math2 ? `<button class="btn sm ghost" data-mwlab>Im Maple-Labor öffnen</button>` : ""}</div></div>`;
MPL.runSheet = sheet => { sheet._sess = new MPL.Session(); sheet.querySelectorAll(".mw-g").forEach(g => MPL.runGroup(sheet._sess, g)); };
const fit = ta => { ta.rows = rows(ta.value); };

document.addEventListener("click", e => {
  const run = e.target.closest(".mw-run"); if (run) { const g = run.closest(".mw-g"), sh = run.closest(".mw-sheet"); if (!sh._sess) MPL.runSheet(sh); else MPL.runGroup(sh._sess, g); return; }
  const all = e.target.closest("[data-mwall]"); if (all) { MPL.runSheet(all.closest(".mw-sheet")); return; }
  const lab = e.target.closest("[data-mwlab]"); if (lab && window.App) { const sh = lab.closest(".mw-sheet"); const code = [...sh.querySelectorAll(".mw-code")].map(t => t.value); App.S().maple = App.S().maple || {}; App.S().maple.scratch = code; App.S().maple.sheet = "scratch"; App.save(); App.go("maple"); }
});
document.addEventListener("keydown", e => {
  const ta = e.target.closest && e.target.closest(".mw-code"); if (!ta) return;
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); const g = ta.closest(".mw-g"), sh = ta.closest(".mw-sheet"); if (!sh._sess) MPL.runSheet(sh); else MPL.runGroup(sh._sess, g); if (sh.dataset.page) { const nx = g.nextElementSibling && g.nextElementSibling.querySelector(".mw-code"); if (nx) nx.focus(); else if (sh._onNew) sh._onNew(); } }
});
document.addEventListener("input", e => { const ta = e.target.closest && e.target.closest(".mw-code"); if (ta) { fit(ta); const sh = ta.closest(".mw-sheet"); if (sh && sh._onEdit) sh._onEdit(); } });
const mo = () => new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) { if (n.nodeType !== 1) continue; const list = n.matches && n.matches(".mw-sheet[data-auto]") ? [n] : n.querySelectorAll ? n.querySelectorAll(".mw-sheet[data-auto]") : []; list.forEach(sh => { if (!sh._sess) setTimeout(() => MPL.runSheet(sh), 0); }); } }).observe(document.body, { childList: true, subtree: true });
if (document.body) mo(); else document.addEventListener("DOMContentLoaded", mo);
window.addEventListener("resize", () => document.querySelectorAll(".mw-3d canvas").forEach(c => c._redraw && c._redraw()));

/* ================= Befehlsübersicht ================= */
const REF = [
  ["Grundlagen", [["f := x^2 + 3*x;", "Ausdruck speichern (:= ist Zuweisung)"], ["f := x -> x^2 + 3*x;", "Funktion definieren, dann f(2)"], ["evalf(%);", "Dezimalzahl des letzten Ergebnisses (%)"], ["evalf[4](Pi);", "auf 4 Stellen"], ["subs(x = 2, f);", "Wert einsetzen"], ["simplify(expr);  expand(expr);", "vereinfachen, ausmultiplizieren"], ["restart;", "alles vergessen"], ["seq(i^2, i = 1..5);  add(i, i = 1..10);", "Folge, Summe"]]],
  ["Gleichungen", [["solve(x^2 - 5*x + 6 = 0, x);", "Gleichung lösen"], ["solve({eq1, eq2}, {x, y});", "Gleichungssystem"], ["fsolve(cos(x) = x, x = 0..1);", "numerisch, im Bereich"]]],
  ["Differenzialrechnung", [["diff(f, x);", "Ableitung nach x"], ["diff(f, x, y);  diff(f, x$2);", "gemischt / zweite Ableitung"], ["with(VectorCalculus): Hessian(f, [x, y]);", "Hesse-Matrix"], ["with(Optimization): Minimize(l);", "Minimum numerisch suchen"]]],
  ["Integralrechnung", [["int(x^2, x);", "Stammfunktion"], ["int(x^2, x = 0..1);", "bestimmtes Integral"], ["int(int(1, y = x^2..x), x = 0..1);", "Doppelintegral"], ["Pi*int(f^2, x = a..b);", "Rotationsvolumen um die x-Achse"], ["int(sqrt(1 + diff(f, x)^2), x = a..b);", "Bogenlänge"]]],
  ["Plots", [["plot(sin(x), x = -Pi..Pi);", "Funktion zeichnen"], ["plot([f, g], x = 0..2, color = [red, blue]);", "mehrere Funktionen"], ["plot3d(x^2 - y^2, x = -1..1, y = -1..1);", "Fläche im Raum (drehbar)"], ["with(plots): implicitplot(x^2 + y^2 = 25, x = -6..6, y = -6..6);", "Kurve aus Gleichung"], ["pointplot([[1, 2], [3, 4]]);", "Punkte"], ["polygonplot([[0, 0], [4, 0], [0, 6]]);", "Dreieck/Polygon"], ["display(p1, p2);", "Plots kombinieren"]]],
  ["Interpolation & Ausgleich", [["with(CurveFitting): PolynomialInterpolation(P, x);", "Polynom durch alle Punkte"], ["Spline(P, x, degree = 3, endpoints = 'natural');", "kubischer Spline"], ["LeastSquares(P, x, curve = a*x + b);", "Ausgleichskurve"], ["with(Statistics): NonlinearFit(a*exp(b*x), X, Y, x);", "nichtlineare Ausgleichskurve"]]],
  ["Matrizen", [["with(LinearAlgebra):", "Paket laden"], ["A := Matrix([[1, 2], [3, 4]]);", "Matrix eingeben"], ["v := Vector([1, 2]);", "Spaltenvektor"], ["A . v;  A . B;", "Matrixprodukt (Punkt!)"], ["Determinant(A);  Transpose(A);  MatrixInverse(A);", "Determinante, Transponierte, Inverse"], ["LinearSolve(A, b);", "Gleichungssystem A·x = b"], ["MatrixPower(A, 10);  A^10;", "Potenz (Markov: n Schritte)"], ["IdentityMatrix(3);", "Einheitsmatrix E"]]]
];
MPL.REF = REF;

/* ================= Seite „Maple-Labor“ ================= */
if (!window.App || !App.PAGES) return;
const { PAGES, CBY, COURSES } = App, S = () => App.S();
const mcourse = () => CBY[S().course] && CBY[S().course].maple ? CBY[S().course] : COURSES.find(c => c.maple);
PAGES.maple = (el, p) => {
  const c = mcourse(); if (!c) { el.innerHTML = `<div class="page"><div class="empty">Kein Kurs mit Maple-Labor.</div></div>`; return; }
  const st = S().maple || (S().maple = {}); st.edits = st.edits || {};
  const sheets = [{ id: "scratch", title: "Freies Arbeitsblatt", ch: "Eigenes", groups: [{ code: "" }] }].concat(c.mapleSheets || []);
  let cur = p && sheets.find(s => s.id === p) ? p : st.sheet && sheets.find(s => s.id === st.sheet) ? st.sheet : "scratch"; st.sheet = cur;
  const sh = sheets.find(s => s.id === cur);
  const codes = cur === "scratch" ? (st.scratch && st.scratch.length ? st.scratch : [""]) : (st.edits[cur] || sh.groups.filter(g => g.code != null).map(g => g.code));
  let gi = 0;
  const body = cur === "scratch" ? codes.map(cd => MPL.groupHTML(cd)).join("") : sh.groups.map(g => g.text != null ? `<div class="mw-text">${g.text}</div>` : MPL.groupHTML(codes[gi++] ?? g.code)).join("");
  const chs = [...new Set(sheets.map(s => s.ch))];
  el.innerHTML = `<div class="page mw-page">
    <header><span class="eyebrow">${App.esc(c.title)}</span><h1>Maple-Labor</h1><p class="muted" style="margin-top:6px;max-width:72ch">Tippe Maple-Befehle wie in Maple 2025 ein und drücke <b>Enter</b> (Shift+Enter für eine neue Zeile). Rechnet direkt hier im Browser: Ableiten, Integrieren, Gleichungen, Matrizen, Interpolation und Plots in 2D und 3D. Die Arbeitsblätter enthalten alle Beispiele aus Skriptum, Folien und Altprüfungen.</p></header>
    <div class="mw-layout">
      <aside class="card mw-side"><span class="eyebrow">Arbeitsblätter</span>${chs.map(ch => `<div class="mw-ch">${App.esc(ch)}</div>` + sheets.filter(s => s.ch === ch).map(s => `<button class="mw-sbtn ${s.id === cur ? "on" : ""}" data-sheet="${s.id}">${App.esc(s.title)}${st.edits[s.id] ? ` <small>· bearbeitet</small>` : ""}</button>`).join("")).join("")}</aside>
      <section class="col" style="gap:12px;min-width:0">
        <div class="mw-toolbar"><b>${App.esc(sh.title)}</b><span class="row" style="gap:6px"><button class="btn sm pri" data-mwall>!!! Alles ausführen</button><button class="btn sm" id="mw-add">+ Eingabe</button>${cur !== "scratch" && st.edits[cur] ? `<button class="btn sm ghost" id="mw-reset">Original wiederherstellen</button>` : cur === "scratch" ? `<button class="btn sm ghost" id="mw-clear">Leeren</button>` : ""}<button class="btn sm ghost" id="mw-ref">Befehle</button></span></div>
        ${sh.intro ? `<div class="callout">${sh.intro}</div>` : ""}
        <div class="mw-sheet card" data-page="1" ${cur !== "scratch" ? `data-auto="1"` : ""}>${body}</div>
        <div class="card mw-refbox" id="mw-refbox" hidden>${REF.map(([h, items]) => `<div><span class="eyebrow">${h}</span>${items.map(([cd, d]) => `<button class="mw-refi" data-ins="${App.esc(cd)}"><code>${App.esc(cd)}</code><small>${d}</small></button>`).join("")}</div>`).join("")}</div>
      </section></div></div>`;
  const sheetEl = el.querySelector(".mw-sheet[data-page]");
  const saveCodes = () => { const cs = [...sheetEl.querySelectorAll(".mw-code")].map(t => t.value); if (cur === "scratch") st.scratch = cs; else st.edits[cur] = cs; App.save(); };
  let tm; sheetEl._onEdit = () => { clearTimeout(tm); tm = setTimeout(saveCodes, 500); };
  const addGroup = (code = "") => { const d = document.createElement("div"); d.innerHTML = MPL.groupHTML(code); const g = d.firstElementChild; sheetEl.appendChild(g); g.querySelector(".mw-code").focus(); saveCodes(); return g; };
  sheetEl._onNew = () => addGroup("");
  el.onclick = e => {
    const sb = e.target.closest("[data-sheet]"); if (sb) { App.go("maple", sb.dataset.sheet); return; }
    if (e.target.closest("#mw-add")) { addGroup(""); return; }
    if (e.target.closest("#mw-reset")) { delete st.edits[cur]; App.save(); App.render(); return; }
    if (e.target.closest("#mw-clear")) { st.scratch = [""]; App.save(); App.render(); return; }
    if (e.target.closest("#mw-ref")) { const b = el.querySelector("#mw-refbox"); b.hidden = !b.hidden; return; }
    const ins = e.target.closest("[data-ins]"); if (ins) { const tas = sheetEl.querySelectorAll(".mw-code"), last = tas[tas.length - 1]; if (last && !last.value.trim()) { last.value = ins.dataset.ins; last.dispatchEvent(new Event("input", { bubbles: true })); last.focus(); } else addGroup(ins.dataset.ins); return; }
  };
  if (cur === "scratch") { sheetEl._sess = new MPL.Session(); if (codes.some(x => x.trim())) MPL.runSheet(sheetEl); }
};
})();
