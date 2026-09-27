/* Yarn3D: tiny dependency-free WebGL renderer for yarn tubes (knitting & crochet models).
   create(el, opts) -> viewer with setModel(model), setProgress(p), setView(name), destroy(). */
(function () {
/* ---------- math ---------- */
const V = {
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s], dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  len: a => Math.hypot(a[0], a[1], a[2]), norm: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
};
function persp(fov, asp, n, f) { const t = 1 / Math.tan(fov / 2), nf = 1 / (n - f); return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0]; }
function lookAt(e, c, up) { const z = V.norm(V.sub(e, c)), x = V.norm(V.cross(up, z)), y = V.cross(z, x); return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -V.dot(x, e), -V.dot(y, e), -V.dot(z, e), 1]; }
function mmul(a, b) { const o = new Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; }
const hex = h => { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255]; };

/* ---------- tube geometry ---------- */
function tube(pts, radius, color, seg, out, base) {
  const n = pts.length; if (n < 2) return 0;
  const T = pts.map((p, i) => V.norm(V.sub(pts[Math.min(n - 1, i + 1)], pts[Math.max(0, i - 1)])));
  let N0 = Math.abs(T[0][1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]; N0 = V.norm(V.cross(V.cross(T[0], N0), T[0]));
  const Ns = [N0]; for (let i = 1; i < n; i++) { const prev = Ns[i - 1]; let nn = V.sub(prev, V.mul(T[i], V.dot(prev, T[i]))); if (V.len(nn) < 1e-6) nn = prev; Ns.push(V.norm(nn)); }
  let arc = 0; const c = typeof color === "string" ? hex(color) : color;
  for (let i = 0; i < n; i++) {
    if (i) arc += V.len(V.sub(pts[i], pts[i - 1]));
    const Nn = Ns[i], B = V.cross(T[i], Nn), r = Array.isArray(radius) ? radius[i] : radius;
    for (let j = 0; j <= seg; j++) {
      const a = j / seg * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      const nrm = [Nn[0] * ca + B[0] * sa, Nn[1] * ca + B[1] * sa, Nn[2] * ca + B[2] * sa];
      out.pos.push(pts[i][0] + nrm[0] * r, pts[i][1] + nrm[1] * r, pts[i][2] + nrm[2] * r);
      out.nrm.push(nrm[0], nrm[1], nrm[2]); out.col.push(c[0], c[1], c[2]); out.uv.push(arc / (r * 2), j / seg);
    }
  }
  const start = out.idx.length;
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < seg; j++) {
    const a = base + i * (seg + 1) + j, b = a + seg + 1;
    out.idx.push(a, b, a + 1, a + 1, b, b + 1);
  }
  // end caps (flat-ish) so cut ends don't look hollow
  return { first: start, count: out.idx.length - start, verts: n * (seg + 1) };
}

/* ---------- shaders ---------- */
const VS = `attribute vec3 aP; attribute vec3 aN; attribute vec3 aC; attribute vec2 aU;
uniform mat4 uMVP; varying vec3 vN; varying vec3 vC; varying vec2 vU; varying vec3 vP;
void main(){ vN=aN; vC=aC; vU=aU; vP=aP; gl_Position=uMVP*vec4(aP,1.0); }`;
const FS = `precision mediump float; varying vec3 vN; varying vec3 vC; varying vec2 vU; varying vec3 vP;
uniform vec3 uCam; uniform float uPly; uniform float uDim; uniform vec3 uTint;
void main(){
  vec3 N=normalize(vN); vec3 Vd=normalize(uCam-vP);
  if(dot(N,Vd)<0.0) N=-N;
  vec3 up=vec3(0.0,1.0,0.0); vec3 side=normalize(cross(up,Vd)+vec3(0.0001)); vec3 L1=normalize(Vd*0.75+up*0.55+side*0.35), L2=normalize(Vd*0.5-side*0.8+up*0.1), L3=normalize(-Vd*0.4+up*0.9);
  float d=max(dot(N,L1),0.0)*0.72+max(dot(N,L2),0.0)*0.28+max(dot(N,L3),0.0)*0.12;
  float twist=sin(vU.x*uPly + vU.y*6.2831*2.0);
  float ply=0.80+0.20*smoothstep(-0.6,0.9,twist);
  float fuzz=0.97+0.03*sin(vU.x*37.0+vU.y*53.0);
  vec3 H=normalize(L1+Vd); float sp=pow(max(dot(N,H),0.0),28.0)*0.16*ply;
  float rim=pow(1.0-max(dot(N,Vd),0.0),2.5)*0.22;
  vec3 c=vC*mix(vec3(1.0),uTint,0.0);
  vec3 col=c*(0.30+0.85*d)*ply*fuzz + vec3(sp) + c*rim;
  col=mix(col, vec3(0.93,0.90,0.86), uDim);
  gl_FragColor=vec4(col,1.0);
}`;

function create(el, opts = {}) {
  const wrap = document.createElement("div"); wrap.className = "v3d"; wrap.style.height = (opts.height || 360) + "px";
  const cv = document.createElement("canvas"); wrap.appendChild(cv);
  const hint = document.createElement("div"); hint.className = "v3d-hint"; hint.textContent = opts.hint || (window.matchMedia && matchMedia("(pointer:coarse)").matches ? "Wischen = drehen · 2 Finger = zoomen" : "Ziehen = drehen · Mausrad = zoomen"); wrap.appendChild(hint);
  const lbl = document.createElement("div"); lbl.className = "v3d-lbl"; lbl.style.display = "none"; wrap.appendChild(lbl);
  const tl = document.createElement("div"); tl.className = "v3d-tl"; tl.innerHTML = `<button data-z="in" aria-label="Näher">＋</button><button data-z="out" aria-label="Weiter weg">－</button><button data-z="reset" aria-label="Ansicht zurücksetzen">⟲</button>`; wrap.appendChild(tl);
  el.appendChild(wrap);
  const gl = cv.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: false }) || cv.getContext("experimental-webgl");
  if (!gl) { wrap.innerHTML = `<div style="padding:30px;text-align:center" class="muted">3D wird von diesem Browser nicht unterstützt.</div>`; return { setModel() {}, setProgress() {}, setView() {}, destroy() {}, label() {} }; }
  const u32 = gl.getExtension("OES_element_index_uint");
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(o)); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
  const loc = { P: gl.getAttribLocation(pr, "aP"), N: gl.getAttribLocation(pr, "aN"), C: gl.getAttribLocation(pr, "aC"), U: gl.getAttribLocation(pr, "aU"), mvp: gl.getUniformLocation(pr, "uMVP"), cam: gl.getUniformLocation(pr, "uCam"), ply: gl.getUniformLocation(pr, "uPly"), dim: gl.getUniformLocation(pr, "uDim"), tint: gl.getUniformLocation(pr, "uTint") };
  const buf = { P: gl.createBuffer(), N: gl.createBuffer(), C: gl.createBuffer(), U: gl.createBuffer(), I: gl.createBuffer() };
  gl.enable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0);
  let parts = [], center = [0, 0, 0], radius = 10, yaw = 0, pitch = 0.15, dist = 30, target = null, progress = Infinity, groups = 0, dimFn = null, raf = 0, idxType = gl.UNSIGNED_SHORT, idxSize = 2, dead = false, anim = null;
  const view0 = { yaw: 0, pitch: 0.15, zoom: 1 }; let zoom = 1;

  function setModel(model) {
    const out = { pos: [], nrm: [], col: [], uv: [], idx: [] }; parts = []; let vbase = 0;
    const seg = model.seg || 10;
    model.curves.forEach(cu => { const r = tube(cu.pts, cu.r || model.r || 0.3, cu.color || "#C8664B", seg, out, vbase); if (!r) return; vbase += r.verts; parts.push({ first: r.first, count: r.count, group: cu.group || 0, tag: cu.tag }); });
    if (vbase > 65000 && !u32) { console.warn("too many vertices"); }
    idxType = vbase > 65000 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT; idxSize = idxType === gl.UNSIGNED_INT ? 4 : 2;
    const put = (b, data, n, l) => { gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, 0, 0); };
    put(buf.P, out.pos, 3, loc.P); put(buf.N, out.nrm, 3, loc.N); put(buf.C, out.col, 3, loc.C); put(buf.U, out.uv, 2, loc.U);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf.I); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idxType === gl.UNSIGNED_INT ? new Uint32Array(out.idx) : new Uint16Array(out.idx), gl.STATIC_DRAW);
    let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; for (let i = 0; i < out.pos.length; i += 3) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], out.pos[i + k]); mx[k] = Math.max(mx[k], out.pos[i + k]); }
    center = model.center || V.mul(V.add(mn, mx), 0.5); radius = model.radius || V.len(V.sub(mx, mn)) / 2;
    groups = parts.reduce((m, p) => Math.max(m, p.group), 0); progress = Infinity; dimFn = null;
    gl.uniform1f(loc.ply, model.ply || 2.2);
    if (model.view) Object.assign(view0, model.view); if (!model.keepView) { yaw = view0.yaw; pitch = view0.pitch; zoom = view0.zoom || 1; }
    draw();
  }
  function resize() { const r = wrap.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1); const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d)); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; } gl.viewport(0, 0, w, h); }
  function draw() {
    if (dead) return; resize(); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); if (!parts.length) return;
    const asp = cv.width / cv.height, fov = 0.62; dist = radius / Math.sin(fov / 2) * 1.02 / zoom * (asp < 1 ? 1 / Math.max(asp, 0.55) : 1);
    const eye = [center[0] + dist * Math.cos(pitch) * Math.sin(yaw), center[1] + dist * Math.sin(pitch), center[2] + dist * Math.cos(pitch) * Math.cos(yaw)];
    const m = mmul(persp(fov, asp, dist * 0.05, dist * 4), lookAt(eye, center, [0, 1, 0]));
    gl.uniformMatrix4fv(loc.mvp, false, new Float32Array(m)); gl.uniform3fv(loc.cam, eye);
    parts.forEach(p => {
      if (p.group > progress) return; let cnt = p.count;
      if (p.group === Math.floor(progress) && progress !== Math.floor(progress)) { cnt = Math.floor(p.count * (progress - Math.floor(progress)) / 6) * 6; }
      if (p.group === Math.ceil(progress) && progress !== Math.ceil(progress) && p.group > Math.floor(progress)) return;
      gl.uniform1f(loc.dim, dimFn ? dimFn(p) : 0);
      if (cnt > 0) gl.drawElements(gl.TRIANGLES, cnt, idxType, p.first * idxSize);
    });
  }
  const req = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw(); }); };
  /* ---------- interaction ---------- */
  const pts = new Map(); let pinch0 = 0, zoom0 = 1, last = null, moved = 0;
  wrap.addEventListener("pointerdown", e => { if (e.target.closest(".v3d-tl")) return; wrap.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); last = [e.clientX, e.clientY]; moved = 0; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); zoom0 = zoom; } hint.style.opacity = 0; stopAnim(); });
  wrap.addEventListener("pointermove", e => { if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); zoom = Math.min(6, Math.max(0.5, zoom0 * d / (pinch0 || d))); req(); return; }
    const dx = e.clientX - last[0], dy = e.clientY - last[1]; last = [e.clientX, e.clientY]; moved += Math.abs(dx) + Math.abs(dy);
    yaw -= dx * 0.008; pitch = Math.max(-1.45, Math.min(1.45, pitch + dy * 0.008)); req(); });
  const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch0 = 0; if (pts.size === 1) last = [...pts.values()][0]; };
  wrap.addEventListener("pointerup", up); wrap.addEventListener("pointercancel", up);
  wrap.addEventListener("wheel", e => { e.preventDefault(); zoom = Math.min(6, Math.max(0.5, zoom * (e.deltaY < 0 ? 1.1 : 0.9))); req(); }, { passive: false });
  tl.addEventListener("click", e => { const b = e.target.closest("[data-z]"); if (!b) return; const z = b.dataset.z; if (z === "in") zoom = Math.min(6, zoom * 1.25); if (z === "out") zoom = Math.max(0.5, zoom / 1.25); if (z === "reset") return setView("reset"); req(); });
  const ro = window.ResizeObserver ? new ResizeObserver(req) : null; ro && ro.observe(wrap);
  function stopAnim() { if (anim) { cancelAnimationFrame(anim); anim = null; } }
  function tween(to, ms = 700) { stopAnim(); const from = { yaw, pitch, zoom }, t0 = performance.now(); const step = now => { const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; yaw = from.yaw + (to.yaw - from.yaw) * e; pitch = from.pitch + (to.pitch - from.pitch) * e; zoom = from.zoom + (to.zoom - from.zoom) * e; draw(); if (k < 1) anim = requestAnimationFrame(step); else anim = null; }; anim = requestAnimationFrame(step); }
  const VIEWS = { front: { yaw: 0, pitch: 0.12, zoom: 1 }, back: { yaw: Math.PI, pitch: 0.12, zoom: 1 }, side: { yaw: Math.PI / 2.1, pitch: 0.2, zoom: 1.1 }, top: { yaw: 0.2, pitch: 1.2, zoom: 1.05 }, close: { yaw: 0.35, pitch: 0.3, zoom: 2.6 }, tilt: { yaw: 0.6, pitch: 0.45, zoom: 1 } };
  function setView(name) { if (name === "reset") return tween({ yaw: view0.yaw, pitch: view0.pitch, zoom: view0.zoom || 1 }); const v = VIEWS[name]; if (!v) return; let y = v.yaw; while (y - yaw > Math.PI) y -= 2 * Math.PI; while (yaw - y > Math.PI) y += 2 * Math.PI; tween(Object.assign({}, v, { yaw: y })); }
  let pAnim = null;
  function build(ms = 6000, onDone) { if (pAnim) cancelAnimationFrame(pAnim); const t0 = performance.now(); const tot = groups + 1; const step = now => { const k = Math.min(1, (now - t0) / ms); progress = k * tot - 0.0001; if (k >= 1) progress = Infinity; draw(); if (k < 1 && !dead) pAnim = requestAnimationFrame(step); else { pAnim = null; onDone && onDone(); } }; pAnim = requestAnimationFrame(step); }
  return {
    el: wrap, setModel, setView, build,
    setProgress(p) { progress = p; req(); }, groups: () => groups,
    dim(fn) { dimFn = fn; req(); },
    label(t) { lbl.textContent = t || ""; lbl.style.display = t ? "" : "none"; },
    spin(on) { if (!on) return stopAnim(); stopAnim(); let prev = performance.now(); const step = now => { yaw += (now - prev) * 0.0004; prev = now; draw(); if (!dead) anim = requestAnimationFrame(step); }; anim = requestAnimationFrame(step); },
    destroy() { dead = true; stopAnim(); if (pAnim) cancelAnimationFrame(pAnim); ro && ro.disconnect(); const lose = gl.getExtension("WEBGL_lose_context"); lose && lose.loseContext(); wrap.remove(); }
  };
}

/* ======================= MODELS ======================= */
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const PALETTE = { terracotta: "#C8664B", rose: "#E3A08F", sage: "#7E9C84", cream: "#EFE4D0", navy: "#344A6B", mustard: "#D4A23A", plum: "#7D4E6E", charcoal: "#4A4442", sky: "#86A9C9", white: "#F3EFE8" };

/* Knitted fabric. pattern(row, col) -> "k" | "p" as seen from the RIGHT side. colors(row,col) optional. */
function knitModel(o) {
  const cols = o.cols || 10, rows = o.rows || 10, W = 4.3, kx = W / (2 * Math.PI), b = 2.05, c = 0.62, a = 0.95, H = 2.85, R = 0.66, S = 28;
  const pat = o.pattern || (() => "k"), colorOf = o.color || (() => o.yarn || PALETTE.terracotta);
  const curves = [];
  for (let r = 0; r < rows; r++) {
    const y0 = r * H, ltr = r % 2 === 0; const pts = []; const cps = [];
    const sgn = i => pat(r, i) === "p" ? -1 : 1;
    const order = [...Array(cols).keys()]; if (!ltr) order.reverse();
    order.forEach((i, k) => {
      const s = sgn(i), sl = i > 0 ? sgn(i - 1) : s, sr = i < cols - 1 ? sgn(i + 1) : s;
      for (let q = 0; q <= S; q++) {
        if (q === 0 && k > 0) continue;
        let t = -Math.PI + q / S * 2 * Math.PI; if (!ltr) t = -t;
        let sg = s; if (t > Math.PI - 0.9) sg = s + (((s + sr) / 2) - s) * smooth(Math.PI - 0.9, Math.PI, t); if (t < -Math.PI + 0.9) sg = s + (((s + sl) / 2) - s) * smooth(-Math.PI + 0.9, -Math.PI, t);
        let x = i * W + t * kx + a * Math.sin(2 * t), y = y0 + b * Math.cos(t), z = -c * Math.cos(2 * t) * sg;
        if (o.needle && r === rows - 1 && Math.abs(t) < 1.55) {
          const w = smooth(1.55, 0.7, Math.abs(t)), th = (t / 1.55 + 1) * Math.PI / 2 * (ltr ? 1 : 1), rn = 1.25;
          const ny = y0 + b * 0.8, qy = ny + rn * Math.sin(th), qz = rn * Math.cos(th) * (sg);
          y = y + (qy - y) * w; z = z + (qz - z) * w;
        }
        if (pat(r, i) === "x") { x = i * W + t * kx; y = y0 - b * 0.55 + 0.25 * Math.sin(t * 3); z = -0.25; }
        pts.push([x, y, z]); cps.push(i);
      }
    });
    // split into per-stitch colored pieces if multi-colour, else one curve
    if (o.color) { let cur = [], ci = cps[0]; pts.forEach((p, k) => { if (cps[k] !== ci && cur.length > 1) { cur.push(p); curves.push({ pts: cur, color: colorOf(r, ci), group: r, r: R }); cur = [p]; ci = cps[k]; } else cur.push(p); }); if (cur.length > 1) curves.push({ pts: cur, color: colorOf(r, ci), group: r, r: R }); }
    else curves.push({ pts, color: o.rowColors ? o.rowColors[r % o.rowColors.length] : colorOf(r, 0), group: r, r: R });
    // turning loop to next row (flat knitting)
    if (r < rows - 1 && o.edges !== false) {
      const xe = ltr ? (cols - 1) * W + Math.PI * kx : -Math.PI * kx, dir = ltr ? 1 : -1, e = [];
      for (let q = 0; q <= 14; q++) { const th = -Math.PI / 2 + q / 14 * Math.PI; e.push([xe + dir * 0.9 * Math.cos(th), y0 - b * 0.75 + (H) * (q / 14), -0.2 * Math.sin(th * 2)]); }
      curves.push({ pts: e, color: o.rowColors ? o.rowColors[r % o.rowColors.length] : colorOf(r, ltr ? cols - 1 : 0), group: r, r: R });
    }
  }
  if (o.needle) { const ny = (rows - 1) * H + b * 0.8, L = []; for (let q = 0; q <= 2; q++) L.push([-5 + q * ((cols - 1) * W + 12) / 2, ny, 0]); curves.push({ pts: L, r: 0.95, color: "#B98A5E", group: rows - 1, tag: "needle" }); }
  return { curves, ply: 2.4, seg: 10, view: o.view || { yaw: 0, pitch: 0.12, zoom: 1 } };
}

/* Crochet chain: interlocked loops with alternating tilt (reads as a row of Vs from the front). */
function chainModel(o) {
  const n = o.n || 8, d = 2.1, curves = [], S = 40;
  for (let k = 0; k < n; k++) {
    const pts = [], tilt = (k % 2 ? 1 : -1) * 0.95, cx = k * d;
    for (let q = 0; q <= S; q++) { const t = q / S * Math.PI * 2; const lx = Math.cos(t) * 1.6, ly = Math.sin(t) * 1.0; pts.push([cx + lx, ly * Math.cos(tilt), ly * Math.sin(tilt) + (k % 2 ? 0.15 : -0.15)]); }
    curves.push({ pts, color: o.yarn || PALETTE.sage, group: k, r: 0.34 });
  }
  if (o.hook) { const hx = (n - 1) * d + 0.9; curves.push({ pts: [[hx, 0.1, 0], [hx + 1.2, 0.25, 0], [hx + 3.5, 0.6, 0], [hx + 7, 1.4, 0]], r: 0.5, color: "#A8B0BA", group: n - 1, tag: "hook" }); }
  return { curves, ply: 2.6, seg: 10, view: { yaw: 0, pitch: 0.2, zoom: 1 } };
}

/* Crochet fabric: rows of stitches (type per row: "sc" | "hdc" | "dc"). */
function crochetModel(o) {
  const cols = o.cols || 8, rowsT = o.rows || ["sc", "sc", "sc", "sc", "sc", "sc"], w = 2.4, curves = [];
  const HT = { sc: 2.2, hdc: 3.1, dc: 4.4 }; let y = 0;
  const col = r => o.rowColors ? o.rowColors[r % o.rowColors.length] : (o.yarn || PALETTE.plum);
  // foundation chain
  for (let k = 0; k < cols; k++) { const pts = []; const tl = (k % 2 ? 1 : -1) * 0.9; for (let q = 0; q <= 32; q++) { const t = q / 32 * Math.PI * 2, ly = Math.sin(t) * 0.8; pts.push([k * w + Math.cos(t) * 1.5, ly * Math.cos(tl) * 0.55, ly * Math.sin(tl)]); } curves.push({ pts, color: col(0), group: 0, r: 0.36 }); }
  rowsT.forEach((tp, ri) => {
    const r = ri + 1, h = HT[tp] || 2.2, yTop = y + h;
    for (let k = 0; k < cols; k++) {
      const cx = k * w, pts = [];
      // top "V": a horizontal loop at the top of the stitch
      const tl = (k % 2 ? 1 : -1) * 0.9; for (let q = 0; q <= 32; q++) { const t = q / 32 * Math.PI * 2, lx = Math.cos(t) * 1.5, ly = Math.sin(t) * 0.8; pts.push([cx + lx, yTop + ly * Math.cos(tl) * 0.55, ly * Math.sin(tl)]); }
      curves.push({ pts, color: col(r), group: r, r: 0.36 });
      // post: two legs from the top loop down into the previous row's top loop
      [-1, 1].forEach(sd => { const P = []; for (let q = 0; q <= 16; q++) { const f = q / 16; const yy = yTop - 0.25 - f * (h - 0.1); const tw = Math.sin(f * Math.PI) * 0.35 * sd; P.push([cx + sd * 0.45 * (1 - f * 0.6) + tw * 0.4, yy, 0.35 * sd * Math.cos(f * Math.PI) + (f > 0.8 ? -0.3 * (f - 0.8) * 5 : 0)]); } curves.push({ pts: P, color: col(r), group: r, r: 0.36 }); });
      if (tp !== "sc") { const P = []; const ym = y + h * (tp === "dc" ? 0.45 : 0.4); for (let q = 0; q <= 24; q++) { const t = -Math.PI * 0.95 + q / 24 * Math.PI * 1.9; P.push([cx + Math.sin(t) * 0.85, ym + q / 24 * 0.7 - 0.35, Math.cos(t) * 0.8]); } curves.push({ pts: P, color: col(r), group: r, r: 0.3 }); }
      if (tp === "dc") { const P = []; const ym = y + h * 0.72; for (let q = 0; q <= 24; q++) { const t = -Math.PI * 0.95 + q / 24 * Math.PI * 1.9; P.push([cx + Math.sin(t) * 0.8, ym + q / 24 * 0.6 - 0.3, Math.cos(t) * 0.75]); } curves.push({ pts: P, color: col(r), group: r, r: 0.3 }); }
    }
    y = yTop;
  });
  return { curves, ply: 2.6, seg: 10, view: { yaw: 0, pitch: 0.12, zoom: 1 } };
}

/* Amigurumi sphere: stitches placed on a sphere-like shell following round counts. */
function amiModel(o) {
  const rounds = o.rounds || [6, 12, 18, 24, 30, 30, 30, 30, 24, 18, 12, 6], curves = [], R = 9;
  const n = rounds.length; let ring = 0;
  const radii = []; let acc = 0; rounds.forEach((c, i) => { radii.push(c); });
  rounds.forEach((cnt, ri) => {
    const phi = (ri + 0.5) / n * Math.PI, yy = -R * Math.cos(phi), rr = Math.max(1.2, Math.min(R * Math.sin(phi), cnt * 0.52));
    for (let k = 0; k < cnt; k++) {
      const a0 = k / cnt * Math.PI * 2 + ri * 0.13, a1 = (k + 1) / cnt * Math.PI * 2 + ri * 0.13, pts = [];
      for (let q = 0; q <= 10; q++) { const a = a0 + (a1 - a0) * q / 10, bump = Math.sin(q / 10 * Math.PI); pts.push([Math.cos(a) * (rr + 0.35 * bump), yy + 0.45 * bump, Math.sin(a) * (rr + 0.35 * bump)]); }
      curves.push({ pts, color: o.colors ? o.colors[ri % o.colors.length] : (o.yarn || PALETTE.mustard), group: ri, r: 0.62 });
      const pts2 = []; const am = (a0 + a1) / 2, ny = -R * Math.cos((ri - 0.5) / n * Math.PI), nr = ri ? Math.max(1.2, Math.min(R * Math.sin((ri - 0.5) / n * Math.PI), rounds[ri - 1] * 0.52)) : 0.4;
      for (let q = 0; q <= 8; q++) { const f = q / 8; pts2.push([Math.cos(am) * (rr + (nr - rr) * f) , yy + (ny - yy) * f, Math.sin(am) * (rr + (nr - rr) * f)]); }
      curves.push({ pts: pts2, color: o.colors ? o.colors[ri % o.colors.length] : (o.yarn || PALETTE.mustard), group: ri, r: 0.55 });
    }
  });
  return { curves, ply: 2.6, seg: 8, view: { yaw: 0.3, pitch: 0.35, zoom: 1 } };
}

window.Yarn3D = { create, knitModel, chainModel, crochetModel, amiModel, PALETTE };
})();
