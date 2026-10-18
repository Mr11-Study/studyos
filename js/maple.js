/* StudyOS · Maple-Labor: ein kleiner Maple-Nachbau für Mathematik 2.
   Versteht die Maple-Befehle aus Vorlesung und Übung (diff, int, solve, plot, plot3d, LinearAlgebra, CurveFitting, …),
   rechnet symbolisch, wo es einfach geht (Ableiten, einfache Stammfunktionen), sonst numerisch, und zeichnet Plots wie Maple.
   Teil 1 (diese Datei): Parser, Rechenkern, Befehle. Teil 2 (js/maple-ui.js): Plots, Arbeitsblatt, Seite „Maple-Labor“.
   Läuft auch ohne DOM (node), damit der Rechenkern testbar ist. */
(function (root) {
const MPL = root.MPL = root.MPL || {};

/* ================= Lexer ================= */
const OPS = [":=", "->", "..", "<=", ">=", "<>", "+", "-", "*", "/", "^", ".", ",", ";", ":", "(", ")", "[", "]", "{", "}", "=", "<", ">", "$", "%", "!", "|"];
function lex(src) {
  const T = []; let i = 0; const n = src.length;
  while (i < n) {
    const ch = src[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === "#") { while (i < n && src[i] !== "\n") i++; continue; }
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(src[i + 1] || "") && src[i - 1] !== ".")) {
      let j = i; while (j < n && /[0-9]/.test(src[j])) j++;
      if (src[j] === "." && src[j + 1] !== ".") { j++; while (j < n && /[0-9]/.test(src[j])) j++; }
      if (/[eE]/.test(src[j] || "") && /[-+0-9]/.test(src[j + 1] || "")) { let k = j + 1; if (/[-+]/.test(src[k])) k++; if (/[0-9]/.test(src[k] || "")) { j = k; while (j < n && /[0-9]/.test(src[j])) j++; } }
      const lit = src.slice(i, j); T.push({ t: "num", v: parseFloat(lit), f: /[.eE]/.test(lit) }); i = j; continue;
    }
    if (/[A-Za-z_]/.test(ch)) { let j = i; while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++; T.push({ t: "id", v: src.slice(i, j) }); i = j; continue; }
    if (ch === '"') { let j = i + 1; while (j < n && src[j] !== '"') j++; T.push({ t: "str", v: src.slice(i + 1, j) }); i = j + 1; continue; }
    if (ch === "'") { let j = i + 1; while (j < n && src[j] !== "'") j++; T.push({ t: "quote", v: src.slice(i + 1, j) }); i = j + 1; continue; }
    if (ch === "`") { let j = i + 1; while (j < n && src[j] !== "`") j++; T.push({ t: "id", v: src.slice(i + 1, j) }); i = j + 1; continue; }
    const op = OPS.find(o => src.startsWith(o, i)); if (!op) throw err("Syntax", "unerwartetes Zeichen „" + ch + "“");
    T.push({ t: "op", v: op }); i += op.length;
  }
  return T;
}
function err(where, msg) { const e = new Error(msg); e.mpl = where; return e; }

/* ================= Parser (Pratt) =================
   AST: n(Zahl) s(Symbol) str add mul pow fn(Funktion/Befehl) rel rng list set seq arrow asg ix rep fact quote */
const LBP = { ":=": 5, "->": 8, "=": 10, "<>": 10, "<": 10, "<=": 10, ">": 10, ">=": 10, "..": 15, "$": 12, "+": 20, "-": 20, "*": 30, "/": 30, ".": 30, "^": 40, "!": 50, "(": 60, "[": 60 };
function parseProgram(src) {
  const T = lex(src), out = []; let p = 0;
  const peek = () => T[p], next = () => T[p++];
  const isOp = (v, t = peek()) => t && t.t === "op" && t.v === v;
  const expect = v => { const t = next(); if (!t || t.t !== "op" || t.v !== v) throw err("Syntax", `„${v}“ erwartet`); return t; };
  function list(close) { const it = []; if (isOp(close)) { next(); return it; } for (;;) { it.push(expr(0)); if (isOp(",")) { next(); continue; } expect(close); return it; } }
  function nud(t) {
    if (!t) throw err("Syntax", "unvollständige Eingabe");
    if (t.t === "num") return t.f ? { k: "n", v: t.v, f: 1 } : { k: "n", v: t.v };
    if (t.t === "id") return { k: "s", n: t.v };
    if (t.t === "str") return { k: "str", v: t.v };
    if (t.t === "quote") { const inner = parseProgram(t.v)[0]; return { k: "quote", e: inner ? inner.e : { k: "s", n: t.v } }; }
    if (t.t === "op") {
      if (t.v === "-") return { k: "neg", a: expr(35) };
      if (t.v === "+") return expr(35);
      if (t.v === "%") return { k: "s", n: "%" };
      if (t.v === "(") { const it = list(")"); return it.length === 1 ? { k: "paren", e: it[0] } : { k: "seq", it }; }
      if (t.v === "[") return { k: "list", it: list("]") };
      if (t.v === "{") return { k: "set", it: list("}") };
    }
    throw err("Syntax", `unerwartetes „${t.v}“`);
  }
  function led(t, left) {
    const o = t.v;
    if (o === "(") return { k: "call", f: left, args: list(")") };
    if (o === "[") return { k: "ix", a: left, i: list("]") };
    if (o === "!") return { k: "fact", a: left };
    if (o === ":=") return { k: "asg", l: left, v: expr(4) };
    if (o === "->") return { k: "arrow", p: (left.k === "seq" ? left.it : left.k === "paren" ? [left.e] : [left]).map(x => x.n), body: expr(7) };
    if (o === "^") return { k: "bin", o, a: left, b: expr(39) };
    if (o === "..") return { k: "rng", a: left, b: expr(15) };
    if (o === "$") return { k: "rep", a: left, b: expr(12) };
    return { k: o === "=" || o === "<>" || o === "<" || o === "<=" || o === ">" || o === ">=" ? "rel" : "bin", o, a: left, b: expr(LBP[o]) };
  }
  function expr(rbp) {
    let left = nud(next());
    for (;;) { const t = peek(); if (!t || t.t !== "op" || !(t.v in LBP) || LBP[t.v] <= rbp) break; next(); left = led(t, left); }
    return left;
  }
  while (p < T.length) {
    if (isOp(";") || isOp(":")) { next(); continue; }
    const start = p, e = expr(0); let show = true;
    if (isOp(";")) next(); else if (isOp(":")) { next(); show = false; } else if (p < T.length) throw err("Syntax", "fehlendes Semikolon oder Operator");
    out.push({ e, show, start });
  }
  return out;
}

/* ================= Zahlen & Ausdrücke ================= */
const N = v => ({ k: "n", v }), Sy = n => ({ k: "s", n });
const isN = e => typeof e === "number" || (e && e.k === "n");
const nv = e => typeof e === "number" ? e : e.v;
const ast = v => typeof v === "number" ? N(v) : v;
const isExpr = v => typeof v === "number" || (v && typeof v === "object" && !v.T && v.k);
const FNUM = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan, cot: x => 1 / Math.tan(x), sec: x => 1 / Math.cos(x), csc: x => 1 / Math.sin(x),
  arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  arcsinh: Math.asinh, arccosh: Math.acosh, arctanh: Math.atanh,
  exp: Math.exp, ln: Math.log, log: Math.log, log10: Math.log10, log2: Math.log2, sqrt: Math.sqrt, abs: Math.abs, signum: Math.sign,
  floor: Math.floor, ceil: Math.ceil, round: Math.round, trunc: Math.trunc, frac: x => x - Math.trunc(x),
  factorial: x => { let r = 1; for (let i = 2; i <= x; i++) r *= i; return r; }
};
const keyOf = e => txt(e);
const fact = n => FNUM.factorial(n);

/* Vereinfachen: flach machen, Zahlen zusammenfassen, gleiche Terme/Faktoren sammeln, Zahl über Summe verteilen (wie Maple) */
function simp(e) {
  if (typeof e === "number") return N(e);
  switch (e.k) {
    case "n": case "s": case "str": return e;
    case "add": {
      const terms = []; let c = 0;
      const push = t => { t = simp(t); if (t.k === "add") t.t.forEach(push); else if (t.k === "n") c += t.v; else terms.push(t); };
      e.t.forEach(push);
      const m = new Map();
      for (const t of terms) { let co = 1, rest = t; if (t.k === "mul" && t.f[0].k === "n") { co = t.f[0].v; rest = t.f.length === 2 ? t.f[1] : { k: "mul", f: t.f.slice(1) }; } const k = keyOf(rest); const o = m.get(k); if (o) o.c += co; else m.set(k, { c: co, r: rest }); }
      const out = []; for (const { c: co, r } of m.values()) { if (Math.abs(co) < 1e-14) continue; out.push(co === 1 ? r : simp({ k: "mul", f: [N(co), r] })); }
      out.sort((a, b) => deg(b) - deg(a) || (keyOf(a) < keyOf(b) ? -1 : 1));
      if (Math.abs(c) > 1e-14 || !out.length) out.push(N(clean(c)));
      return out.length === 1 ? out[0] : { k: "add", t: out };
    }
    case "mul": {
      let c = 1; const fs = [];
      const push = f => { f = simp(f); if (f.k === "mul") f.f.forEach(push); else if (f.k === "n") c *= f.v; else fs.push(f); };
      e.f.forEach(push);
      if (c === 0) return N(0);
      const m = new Map();
      for (const f of fs) { let b = f, x = N(1); if (f.k === "pow" && f.e.k === "n") { b = f.b; x = f.e; } const k = keyOf(b); const o = m.get(k); if (o && o.x.k === "n" && x.k === "n") o.x = N(o.x.v + x.v); else if (o) m.set(k + "#" + m.size, { b, x }); else m.set(k, { b, x }); }
      const out = []; for (const { b, x } of m.values()) { if (x.k === "n" && Math.abs(x.v) < 1e-14) continue; out.push(x.k === "n" && x.v === 1 ? b : simp({ k: "pow", b, e: x })); }
      c = clean(c);
      if (!out.length) return N(c);
      out.sort((a, b) => fOrd(a) - fOrd(b) || (keyOf(a) < keyOf(b) ? -1 : 1));
      if (out.length === 1 && out[0].k === "add" && c !== 1) return simp({ k: "add", t: out[0].t.map(t => ({ k: "mul", f: [N(c), t] })) });
      if (c !== 1) out.unshift(N(c));
      return out.length === 1 ? out[0] : { k: "mul", f: out };
    }
    case "pow": {
      const b = simp(e.b), x = simp(e.e);
      if (x.k === "n") { if (x.v === 0) return N(1); if (x.v === 1) return b; }
      if (b.k === "n") { if (b.v === 1) return N(1); if (x.k === "n") { const r = Math.pow(b.v, x.v); if (isFinite(r) && !isNaN(r)) return N(clean(r)); } if (b.v === 0 && x.k === "n" && x.v > 0) return N(0); }
      if (b.k === "pow" && x.k === "n" && b.e.k === "n" && (Number.isInteger(x.v) || b.e.v > 0 && Number.isInteger(b.e.v) === false)) return simp({ k: "pow", b: b.b, e: N(b.e.v * x.v) });
      if (b.k === "mul" && x.k === "n" && Number.isInteger(x.v)) return simp({ k: "mul", f: b.f.map(f => ({ k: "pow", b: f, e: x })) });
      if (b.k === "fn" && b.n === "exp") return simp({ k: "fn", n: "exp", a: [{ k: "mul", f: [b.a[0], x] }] });
      return { k: "pow", b, e: x };
    }
    case "fn": {
      const a = e.a.map(x => isExpr(x) ? simp(x) : x);
      if (e.n === "sqrt" && a.length === 1) return simp({ k: "pow", b: a[0], e: N(0.5) });
      if (e.n === "piecewise") { const out = []; let i = 0; for (; i + 1 < a.length; i += 2) { const c = a[i]; if (c && c.k === "rel") { const l = simp(c.a), r = simp(c.b); if (l.k === "n" && r.k === "n") { const L = l.v, R = r.v, ok = { "<": L < R, "<=": L <= R, ">": L > R, ">=": L >= R, "=": L === R, "<>": L !== R }[c.o]; if (ok && !out.length) return a[i + 1]; if (ok) { out.push(a[i + 1]); return { k: "fn", n: e.n, a: out }; } continue; } } out.push(c, a[i + 1]); } if (i < a.length) { if (!out.length) return a[i]; out.push(a[i]); } return out.length ? { k: "fn", n: e.n, a: out } : N(0); }
      if (e.n === "exp" && a[0].k === "n" && a[0].v === 0) return N(1);
      if ((e.n === "ln" || e.n === "log") && a[0].k === "fn" && a[0].n === "exp") return a[0].a[0];
      if (e.n === "ln" && a[0].k === "n" && a[0].v === 1) return N(0);
      if (e.n === "abs" && a[0].k === "n") return N(Math.abs(a[0].v));
      if (FNUM[e.n] && a.length === 1 && a[0].k === "n") { const r = FNUM[e.n](a[0].v); if (isFinite(r) && !isNaN(r)) return N(clean(r)); }
      return { k: "fn", n: e.n, a };
    }
    default: return e;
  }
}
const clean = v => { if (!isFinite(v)) return v; const r = Math.round(v); if (Math.abs(v - r) < 1e-11 * Math.max(1, Math.abs(v))) return r; return +v.toPrecision(15); };
const fOrd = f => f.k === "n" ? 0 : f.k === "s" ? 1 : f.k === "pow" && f.b.k === "s" ? 1 : f.k === "add" ? 3 : 2;
function deg(e) { if (e.k === "n") return 0; if (e.k === "s") return 1; if (e.k === "pow") return e.e.k === "n" ? deg(e.b) * e.e.v : 1; if (e.k === "mul") return e.f.reduce((s, f) => s + deg(f), 0); if (e.k === "add") return Math.max(...e.t.map(deg)); return 0.5; }
const free = (e, set = new Set()) => { if (!e || typeof e !== "object") return set; if (e.k === "s") { if (!CONST[e.n]) set.add(e.n); } else if (e.k === "fn" && e.n === "int") { const inner = free(e.a[0]); const v = e.a[1] && e.a[1].k === "rel" ? e.a[1].a.n : e.a[1] && e.a[1].n; inner.delete(v); inner.forEach(x => set.add(x)); if (e.a[1] && e.a[1].k === "rel") free(e.a[1].b, set); } else ["t", "f", "a", "it"].forEach(k => Array.isArray(e[k]) && e[k].forEach(x => free(x, set))); if (e.b && e.k !== "s") free(e.b, set); if (e.e && typeof e.e === "object") free(e.e, set); return set; };
const has = (e, x) => free(e).has(x);
const CONST = { Pi: Math.PI, pi: Math.PI, infinity: Infinity, gamma: 0.5772156649015329, true: 1, false: 0 };

/* Rechnen mit Zahlen, Ausdrücken, Matrizen, Vektoren und Listen */
const A = {
  add: (a, b) => { if (typeof a === "number" && typeof b === "number") return clean(a + b); if (isM(a) || isM(b)) return mzip(a, b, A.add, "+"); if (isL(a) && isL(b)) return lmap2(a, b, A.add); if (isEq(a) || isEq(b)) return eqmap(a, b, A.add); return fin(simp({ k: "add", t: [ast(a), ast(b)] })); },
  sub: (a, b) => A.add(a, A.neg(b)),
  neg: a => { if (typeof a === "number") return -a; if (isM(a)) return mmap(a, A.neg); if (isL(a)) return Object.assign({}, a, { it: a.it.map(A.neg) }); if (isEq(a)) return { k: "rel", o: a.o, a: ast(A.neg(a.a)), b: ast(A.neg(a.b)) }; return fin(simp({ k: "mul", f: [N(-1), a] })); },
  mul: (a, b) => { if (typeof a === "number" && typeof b === "number") return clean(a * b); if (isM(a) && isM(b)) return matmul(a, b); if (isM(a)) return mmap(a, x => A.mul(x, b)); if (isM(b)) return mmap(b, x => A.mul(a, x)); if (isL(a) && !isL(b)) return Object.assign({}, a, { it: a.it.map(x => A.mul(x, b)) }); if (isL(b) && !isL(a)) return Object.assign({}, b, { it: b.it.map(x => A.mul(a, x)) }); if (isEq(a) || isEq(b)) return eqmap(a, b, A.mul); return fin(simp({ k: "mul", f: [ast(a), ast(b)] })); },
  div: (a, b) => { if (typeof a === "number" && typeof b === "number") { if (b === 0) throw err("division", "Division durch null"); return clean(a / b); } if (isM(b)) return A.mul(a, minv(b)); if (isM(a)) return mmap(a, x => A.div(x, b)); if (isL(a)) return Object.assign({}, a, { it: a.it.map(x => A.div(x, b)) }); if (isEq(a) || isEq(b)) return eqmap(a, b, A.div); return fin(simp({ k: "mul", f: [ast(a), { k: "pow", b: ast(b), e: N(-1) }] })); },
  pow: (a, b) => {
    if (typeof a === "number" && typeof b === "number") { const r = Math.pow(a, b); if (isNaN(r) && a < 0) { const q = 1 / b; if (Number.isInteger(q) && q % 2 === 1) return clean(-Math.pow(-a, b)); } return clean(r); }
    if (isM(a)) { if (typeof b !== "number" || !Number.isInteger(b)) throw err("^", "Matrixpotenz braucht einen ganzzahligen Exponenten"); return mpow(a, b); }
    if (isEq(a)) return eqmap(a, b, A.pow);
    return fin(simp({ k: "pow", b: ast(a), e: ast(b) }));
  },
  dot: (a, b) => { if (isM(a) && isM(b)) return matmul(a, b); if (isM(a) || isM(b)) return A.mul(a, b); return A.mul(a, b); }
};
const fin = e => e && e.k === "n" ? e.v : e;
const isM = v => v && (v.T === "mat" || v.T === "vec");
const isL = v => v && (v.T === "list" || v.T === "set");
const isEq = v => v && v.k === "rel";
const lmap2 = (a, b, f) => { if (a.it.length !== b.it.length) throw err("+", "Listen haben verschiedene Länge"); return { T: a.T, it: a.it.map((x, i) => f(x, b.it[i])) }; };
const eqmap = (a, b, f) => ({ k: "rel", o: "=", a: ast(f(isEq(a) ? fin(a.a) : a, isEq(b) ? fin(b.a) : b)), b: ast(f(isEq(a) ? fin(a.b) : a, isEq(b) ? fin(b.b) : b)) });

/* ================= Lineare Algebra ================= */
const M = (r, c, f) => ({ T: "mat", r, c, d: Array.from({ length: r }, (_, i) => Array.from({ length: c }, (_, j) => f(i, j))) });
const V = (arr, row) => ({ T: "vec", row: !!row, d: arr.slice() });
const asMat = v => v.T === "mat" ? v : v.row ? { T: "mat", r: 1, c: v.d.length, d: [v.d.slice()] } : { T: "mat", r: v.d.length, c: 1, d: v.d.map(x => [x]) };
const fromMat = (m, like) => like && like.T === "vec" && (m.c === 1 || m.r === 1) ? V(m.c === 1 ? m.d.map(r => r[0]) : m.d[0], m.r === 1) : m;
const mmap = (a, f) => a.T === "vec" ? V(a.d.map(f), a.row) : M(a.r, a.c, (i, j) => f(a.d[i][j]));
function mzip(a, b, f, o) {
  if (!isM(a) || !isM(b)) throw err(o, "Matrix und Skalar kann man so nicht addieren");
  const x = asMat(a), y = asMat(b); if (x.r !== y.r || x.c !== y.c) throw err(o, `Dimensionen passen nicht (${x.r}×${x.c} und ${y.r}×${y.c})`);
  return fromMat(M(x.r, x.c, (i, j) => f(x.d[i][j], y.d[i][j])), a);
}
function matmul(a, b) {
  const x = asMat(a), y = asMat(b);
  if (a.T === "vec" && a.row && b.T === "vec" && !b.row && a.d.length === b.d.length) return a.d.reduce((s, v, i) => A.add(s, A.mul(v, b.d[i])), 0);
  if (x.c !== y.r) { if (a.T === "vec" && b.T === "vec" && a.d.length === b.d.length) return a.d.reduce((s, v, i) => A.add(s, A.mul(v, b.d[i])), 0); throw err(".", `Dimensionen passen nicht (${x.r}×${x.c} · ${y.r}×${y.c})`); }
  const r = M(x.r, y.c, (i, j) => { let s = 0; for (let k = 0; k < x.c; k++) s = A.add(s, A.mul(x.d[i][k], y.d[k][j])); return s; });
  if (b.T === "vec" && !b.row) return V(r.d.map(z => z[0]));
  if (a.T === "vec" && a.row && r.r === 1) return V(r.d[0], true);
  return r;
}
const allNum = m => asMat(m).d.every(r => r.every(x => typeof x === "number"));
const ident = n => M(n, n, (i, j) => i === j ? 1 : 0);
function mpow(a, n) { const m = asMat(a); if (m.r !== m.c) throw err("^", "Matrix ist nicht quadratisch"); if (n < 0) return mpow(minv(m), -n); let r = ident(m.r), b = m; while (n > 0) { if (n & 1) r = matmul(r, b); b = matmul(b, b); n >>= 1; } return r; }
function rref(m0, aug) {
  const m = m0.d.map(r => r.slice()), R = m.length, C = m[0].length, piv = []; let row = 0;
  for (let col = 0; col < (aug ? C - 1 : C) && row < R; col++) {
    let best = row; for (let i = row + 1; i < R; i++) if (Math.abs(m[i][col]) > Math.abs(m[best][col])) best = i;
    if (Math.abs(m[best][col]) < 1e-11) continue;
    [m[row], m[best]] = [m[best], m[row]]; const pv = m[row][col]; for (let j = 0; j < C; j++) m[row][j] /= pv;
    for (let i = 0; i < R; i++) if (i !== row && Math.abs(m[i][col]) > 0) { const f = m[i][col]; for (let j = 0; j < C; j++) m[i][j] -= f * m[row][j]; }
    piv.push(col); row++;
  }
  for (const r of m) for (let j = 0; j < C; j++) r[j] = clean(r[j]);
  return { m, piv };
}
function det(a) {
  const m = asMat(a); if (m.r !== m.c) throw err("Determinant", "Matrix ist nicht quadratisch");
  if (!allNum(m)) { const d = m.d, n = m.r; if (n === 1) return d[0][0]; let s = 0; for (let j = 0; j < n; j++) { const minor = M(n - 1, n - 1, (i, k) => d[i + 1][k < j ? k : k + 1]); s = A.add(s, A.mul((j % 2 ? -1 : 1), A.mul(d[0][j], det(minor)))); } return s; }
  const d = m.d.map(r => r.slice()), n = m.r; let s = 1;
  for (let c = 0; c < n; c++) { let p = c; for (let i = c + 1; i < n; i++) if (Math.abs(d[i][c]) > Math.abs(d[p][c])) p = i; if (Math.abs(d[p][c]) < 1e-14) return 0; if (p !== c) { [d[p], d[c]] = [d[c], d[p]]; s = -s; } s *= d[c][c]; for (let i = c + 1; i < n; i++) { const f = d[i][c] / d[c][c]; for (let j = c; j < n; j++) d[i][j] -= f * d[c][j]; } }
  return clean(s);
}
function minv(a) {
  const m = asMat(a); if (m.r !== m.c) throw err("MatrixInverse", "Matrix ist nicht quadratisch");
  if (!allNum(m)) { if (m.r !== 2) throw err("MatrixInverse", "symbolische Inverse nur für 2×2"); const [[p, q], [r, s]] = m.d, D = A.sub(A.mul(p, s), A.mul(q, r)); return M(2, 2, (i, j) => A.div([[s, A.neg(q)], [A.neg(r), p]][i][j], D)); }
  const n = m.r, aug = M(n, 2 * n, (i, j) => j < n ? m.d[i][j] : (j - n === i ? 1 : 0)), { m: R, piv } = rref(aug);
  if (piv.length < n || piv[n - 1] !== n - 1) throw err("MatrixInverse", "die Matrix ist singulär (Determinante 0), es gibt keine Inverse");
  return M(n, n, (i, j) => R[i][j + n]);
}
function linsolve(a, b) {
  const m = asMat(a), y = b.T === "vec" ? b.d : asMat(b).d.map(r => r[0]);
  if (!allNum(m) || !y.every(v => typeof v === "number")) throw err("LinearSolve", "nur für Zahlen-Matrizen");
  const aug = M(m.r, m.c + 1, (i, j) => j < m.c ? m.d[i][j] : y[i]), { m: R, piv } = rref(aug, true);
  for (let i = piv.length; i < R.length; i++) if (Math.abs(R[i][m.c]) > 1e-9) throw err("LinearSolve", "das Gleichungssystem hat keine Lösung (inconsistent system)");
  const freeV = []; for (let j = 0; j < m.c; j++) if (!piv.includes(j)) freeV.push(j);
  const sol = Array(m.c).fill(0); freeV.forEach((j, k) => sol[j] = Sy("_t" + (k + 1)));
  piv.forEach((col, i) => { let v = R[i][m.c]; freeV.forEach(j => { if (Math.abs(R[i][j]) > 1e-12) v = A.sub(v, A.mul(R[i][j], sol[j])); }); sol[col] = v; });
  return V(sol);
}
function nullspace(a) {
  const m = asMat(a); if (!allNum(m)) throw err("NullSpace", "nur für Zahlen-Matrizen");
  const { m: R, piv } = rref(m), out = [];
  for (let j = 0; j < m.c; j++) if (!piv.includes(j)) { const v = Array(m.c).fill(0); v[j] = 1; piv.forEach((col, i) => v[col] = clean(-R[i][j])); out.push(V(v)); }
  return { T: "set", it: out };
}

/* ================= Ableiten ================= */
function D(e, x) {
  e = ast(e);
  switch (e.k) {
    case "n": case "str": return N(0);
    case "s": return N(e.n === x ? 1 : 0);
    case "add": return simp({ k: "add", t: e.t.map(t => D(t, x)) });
    case "mul": return simp({ k: "add", t: e.f.map((f, i) => ({ k: "mul", f: e.f.map((g, j) => i === j ? D(g, x) : g) })) });
    case "pow": {
      const b = e.b, p = e.e, hb = has(b, x), hp = has(p, x);
      if (!hb && !hp) return N(0);
      if (!hp) return simp({ k: "mul", f: [p, { k: "pow", b, e: { k: "add", t: [p, N(-1)] } }, D(b, x)] });
      if (!hb) return simp({ k: "mul", f: [e, { k: "fn", n: "ln", a: [b] }, D(p, x)] });
      return simp({ k: "mul", f: [e, { k: "add", t: [{ k: "mul", f: [D(p, x), { k: "fn", n: "ln", a: [b] }] }, { k: "mul", f: [p, D(b, x), { k: "pow", b, e: N(-1) }] }] }] });
    }
    case "fn": {
      if (e.n === "piecewise") return simp({ k: "fn", n: "piecewise", a: e.a.map((c, i) => i % 2 === 1 || i === e.a.length - 1 && e.a.length % 2 === 1 ? D(c, x) : c) });
      if (e.n === "int") return D(fin(evalInt(e.a, {})), x);
      const u = e.a[0], du = D(u, x); if (du.k === "n" && du.v === 0) return N(0);
      const F = (n, ...a) => ({ k: "fn", n, a }), P = (b, k) => ({ k: "pow", b, e: N(k) }), S = (...t) => ({ k: "add", t }), Mu = (...f) => ({ k: "mul", f });
      const outer = {
        sin: () => F("cos", u), cos: () => Mu(N(-1), F("sin", u)), tan: () => S(N(1), P(F("tan", u), 2)), cot: () => S(N(-1), Mu(N(-1), P(F("cot", u), 2))),
        exp: () => F("exp", u), ln: () => P(u, -1), log: () => P(u, -1), log10: () => P(Mu(u, N(Math.LN10)), -1),
        arcsin: () => P(S(N(1), Mu(N(-1), P(u, 2))), -0.5), arccos: () => Mu(N(-1), P(S(N(1), Mu(N(-1), P(u, 2))), -0.5)), arctan: () => P(S(N(1), P(u, 2)), -1),
        sinh: () => F("cosh", u), cosh: () => F("sinh", u), tanh: () => S(N(1), Mu(N(-1), P(F("tanh", u), 2))), abs: () => F("signum", u), signum: () => N(0)
      }[e.n];
      if (!outer) return simp(Mu(F("D(" + e.n + ")", ...e.a), du));
      return simp(Mu(outer(), du));
    }
    default: throw err("diff", "kann diesen Ausdruck nicht ableiten");
  }
}

/* ================= Stammfunktionen (einfache Fälle wie im Skriptum) ================= */
function linIn(u, x) { const d = simp(D(u, x)); if (has(d, x)) return null; return d; }
function antider(e, x) {
  e = simp(ast(e));
  if (!has(e, x)) return simp({ k: "mul", f: [e, Sy(x)] });
  if (e.k === "add") { const p = e.t.map(t => antider(t, x)); return p.includes(null) ? null : simp({ k: "add", t: p }); }
  if (e.k === "mul") { const c = e.f.filter(f => !has(f, x)), v = e.f.filter(f => has(f, x)); if (c.length) { const r = antider(v.length === 1 ? v[0] : { k: "mul", f: v }, x); return r && simp({ k: "mul", f: c.concat([r]) }); } const ex = expand(e); if (ex.k === "add") return antider(ex, x); return byParts(e, x); }
  if (e.k === "s") return simp({ k: "mul", f: [N(0.5), { k: "pow", b: e, e: N(2) }] });
  if (e.k === "pow" && !has(e.e, x)) { const a = linIn(e.b, x); if (!a) { if (e.b.k === "add" && e.e.k === "n" && Number.isInteger(e.e.v) && e.e.v > 1) return antider(expand(e), x); return null; } const n = e.e.k === "n" ? e.e.v : null; if (n === -1) return simp({ k: "mul", f: [{ k: "pow", b: a, e: N(-1) }, { k: "fn", n: "ln", a: [e.b] }] }); return simp({ k: "mul", f: [{ k: "pow", b: { k: "mul", f: [a, { k: "add", t: [e.e, N(1)] }] }, e: N(-1) }, { k: "pow", b: e.b, e: { k: "add", t: [e.e, N(1)] } }] }); }
  if (e.k === "pow" && !has(e.b, x)) { const a = linIn(e.e, x); if (!a) return null; return simp({ k: "mul", f: [e, { k: "pow", b: { k: "mul", f: [a, { k: "fn", n: "ln", a: [e.b] }] }, e: N(-1) }] }); }
  if (e.k === "fn" && e.a.length === 1) { const u = e.a[0], a = linIn(u, x); if (!a) return null; const inv = { k: "pow", b: a, e: N(-1) };
    const r = { exp: () => e, sin: () => ({ k: "mul", f: [N(-1), { k: "fn", n: "cos", a: [u] }] }), cos: () => ({ k: "fn", n: "sin", a: [u] }), sinh: () => ({ k: "fn", n: "cosh", a: [u] }), cosh: () => ({ k: "fn", n: "sinh", a: [u] }),
      ln: () => ({ k: "add", t: [{ k: "mul", f: [u, { k: "fn", n: "ln", a: [u] }] }, { k: "mul", f: [N(-1), u] }] }), tan: () => ({ k: "mul", f: [N(-1), { k: "fn", n: "ln", a: [{ k: "fn", n: "cos", a: [u] }] }] }) }[e.n];
    return r ? simp({ k: "mul", f: [inv, r()] }) : null; }
  return null;
}
/* partielle Integration: Polynom · exp/sin/cos(ax+b) */
function byParts(e, x) {
  const g = e.f.filter(f => f.k === "fn" && ["exp", "sin", "cos", "sinh", "cosh"].includes(f.n)), p = e.f.filter(f => !g.includes(f));
  if (g.length !== 1 || !p.length || p.some(f => !(f.k === "s" || (f.k === "pow" && f.b.k === "s" && f.e.k === "n" && Number.isInteger(f.e.v) && f.e.v > 0)))) return null;
  let P = simp({ k: "mul", f: p }), G = antider(g[0], x), sg = 1; const terms = [];
  for (let i = 0; i < 12 && G; i++) { terms.push({ k: "mul", f: [N(sg), P, G] }); P = D(P, x); if (P.k === "n" && P.v === 0) return simp({ k: "add", t: terms }); G = antider(G, x); sg = -sg; }
  return null;
}
function expand(e) {
  e = simp(ast(e));
  if (e.k === "add") return simp({ k: "add", t: e.t.map(expand) });
  if (e.k === "pow" && e.b.k === "add" && e.e.k === "n" && Number.isInteger(e.e.v) && e.e.v > 1 && e.e.v <= 12) { let r = N(1); for (let i = 0; i < e.e.v; i++) r = mulOut(r, expand(e.b)); return r; }
  if (e.k === "mul") return e.f.map(expand).reduce((a, b) => mulOut(a, b), N(1));
  if (e.k === "fn") return simp({ k: "fn", n: e.n, a: e.a.map(a => isExpr(a) ? expand(a) : a) });
  return e;
}
function mulOut(a, b) { const ta = a.k === "add" ? a.t : [a], tb = b.k === "add" ? b.t : [b]; const t = []; ta.forEach(x => tb.forEach(y => t.push({ k: "mul", f: [x, y] }))); return simp({ k: "add", t }); }

/* ================= Numerik ================= */
/* Ausdruck → schnelle JS-Funktion f(v0, v1, …) */
function compile(e, vars) {
  e = ast(e); const idx = Object.fromEntries(vars.map((v, i) => [v, i]));
  const c = e => {
    switch (e.k) {
      case "n": { const v = e.v; return () => v; }
      case "s": { if (e.n in idx) { const i = idx[e.n]; return a => a[i]; } if (e.n in CONST) { const v = CONST[e.n]; return () => v; } return () => NaN; }
      case "add": { const fs = e.t.map(c); return a => { let s = 0; for (const f of fs) s += f(a); return s; }; }
      case "mul": { const fs = e.f.map(c); return a => { let s = 1; for (const f of fs) s *= f(a); return s; }; }
      case "pow": { const b = c(e.b), x = c(e.e); if (e.e.k === "n") { const p = e.e.v; if (p === 2) return a => { const v = b(a); return v * v; }; if (p === 0.5) return a => Math.sqrt(b(a)); if (p === -1) return a => 1 / b(a); const q = 1 / p; if (Number.isInteger(q) && q % 2) return a => { const v = b(a); return v < 0 ? -Math.pow(-v, p) : Math.pow(v, p); }; } return a => Math.pow(b(a), x(a)); }
      case "fn": {
        if (e.n === "piecewise") { const ps = e.a.map(c); return a => { for (let i = 0; i + 1 < ps.length; i += 2) if (ps[i](a)) return ps[i + 1](a); return ps.length % 2 ? ps[ps.length - 1](a) : 0; }; }
        if (e.n === "int") { const v = e.a[1].a.n, lo = c(e.a[1].b.a), hi = c(e.a[1].b.b), body = compile(e.a[0], vars.concat([v])); return a => simpson(t => body(a.concat([t])), lo(a), hi(a)); }
        if (e.n === "max" || e.n === "min") { const fs = e.a.map(c); return a => Math[e.n](...fs.map(f => f(a))); }
        const f = FNUM[e.n]; if (!f) return () => NaN; const u = c(e.a[0]); return a => f(u(a));
      }
      case "rel": { const x = c(e.a), y = c(e.b); return { "<": a => x(a) < y(a), "<=": a => x(a) <= y(a), ">": a => x(a) > y(a), ">=": a => x(a) >= y(a), "=": a => Math.abs(x(a) - y(a)) < 1e-12, "<>": a => x(a) !== y(a) }[e.o]; }
      case "and": { const x = c(e.a), y = c(e.b); return a => x(a) && y(a); }
      default: return () => NaN;
    }
  };
  const f = c(e); return (...a) => f(a);
}
/* adaptive Simpson-Regel */
function simpson(f, a, b, eps = 1e-10) {
  if (a === b) return 0; if (a > b) return -simpson(f, b, a, eps);
  if (!isFinite(a) || !isFinite(b)) { const g = t => { const x = t / (1 - t * t); const d = (1 + t * t) / ((1 - t * t) ** 2); return f(x) * d; }; const ta = isFinite(a) ? inv(a) : -1 + 1e-9, tb = isFinite(b) ? inv(b) : 1 - 1e-9; return simpson(g, ta, tb, eps); }
  if (!isFinite(f(a)) || !isFinite(f(b))) return snap(deQuad(f, a, b));
  const n = 64, h = (b - a) / n; let s = 0;
  for (let i = 0; i < n; i++) { const x0 = a + i * h, x1 = x0 + h, m = (x0 + x1) / 2; s += ad(f, x0, x1, f(x0), f(m), f(x1), eps / n, 18); }
  if (!isFinite(s)) return snap(deQuad(f, a, b));
  return clean(s);
  function inv(x) { return x === 0 ? 0 : (-1 + Math.sqrt(1 + 4 * x * x)) / (2 * x); }
}
/* Ergebnis der Randsingularitäts-Quadratur auf „schöne“ Werte (Bruch, Vielfaches von π) einrasten, sonst auf 8 Stellen runden */
function snap(v) { for (let q = 1; q <= 60; q++) { const p = Math.round(v * q); if (Math.abs(v - p / q) < 2e-8 * Math.max(1, Math.abs(v))) return p / q; const r = Math.round(v / Math.PI * q); if (r && Math.abs(v - r / q * Math.PI) < 2e-8 * Math.max(1, Math.abs(v))) return r / q * Math.PI; } return +v.toPrecision(8); }
/* Doppelt-exponentielle Quadratur (tanh-sinh): verträgt Singularitäten an den Rändern, z. B. Bogenlänge am Kreisrand */
function deQuad(f, a, b) {
  const c = (a + b) / 2, r = (b - a) / 2; let prev = NaN;
  for (let lev = 3; lev <= 8; lev++) {
    const h = Math.pow(2, -lev); let s = 0;
    for (let k = -Math.ceil(4 / h); k <= Math.ceil(4 / h); k++) { const t = k * h, u = Math.PI / 2 * Math.sinh(t), ch = Math.cosh(u), x = Math.tanh(u), w = Math.PI / 2 * Math.cosh(t) / (ch * ch); const xx = c + r * x; if (xx <= a || xx >= b) continue; const v = f(xx); if (isFinite(v)) s += w * v; }
    s *= h * r; if (Math.abs(s - prev) < 1e-11 * Math.max(1, Math.abs(s))) return s; prev = s;
  }
  return prev;
}
function ad(f, a, b, fa, fm, fb, eps, depth) {
  const m = (a + b) / 2, lm = (a + m) / 2, rm = (m + b) / 2, flm = f(lm), frm = f(rm);
  const whole = (b - a) / 6 * (fa + 4 * fm + fb), left = (m - a) / 6 * (fa + 4 * flm + fm), right = (b - m) / 6 * (fm + 4 * frm + fb);
  if (depth <= 0 || Math.abs(left + right - whole) <= 15 * eps || !isFinite(whole)) return left + right + (left + right - whole) / 15;
  return ad(f, a, m, fa, flm, fm, eps / 2, depth - 1) + ad(f, m, b, fm, frm, fb, eps / 2, depth - 1);
}
/* Nullstellen in einer Variablen: Vorzeichenwechsel + Newton von vielen Startwerten */
function roots1(f, lo = -1e3, hi = 1e3) {
  const out = []; const addR = r => { if (!isFinite(r) || r < lo - 1e-9 || r > hi + 1e-9) return; if (Math.abs(f(r)) > 1e-7 * Math.max(1, Math.abs(r))) return; if (!out.some(o => Math.abs(o - r) < 1e-7 * Math.max(1, Math.abs(r)))) out.push(clean(+r.toPrecision(13))); };
  const grid = []; const span = hi - lo;
  if (span <= 2000) { const n = 4000; for (let i = 0; i <= n; i++) grid.push(lo + span * i / n); }
  else { for (let i = -400; i <= 400; i++) grid.push(i / 4); for (let k = 2; k <= 12; k++) for (let i = 1; i <= 40; i++) { const v = i * Math.pow(10, k - 2) * 2.5; grid.push(v, -v); } grid.sort((a, b) => a - b); }
  let px = grid[0], pv = f(px);
  for (let i = 1; i < grid.length; i++) {
    const x = grid[i], v = f(x);
    if (isFinite(pv) && isFinite(v)) { if (pv === 0) addR(px); else if (pv * v < 0) { let a = px, b = x, fa = pv; for (let k = 0; k < 200; k++) { const m = (a + b) / 2, fm = f(m); if (fa * fm <= 0) b = m; else { a = m; fa = fm; } if (b - a < 1e-15 * Math.max(1, Math.abs(a))) break; } addR((a + b) / 2); } }
    px = x; pv = v;
  }
  /* doppelte Nullstellen (Berührpunkte): Newton auf f' */
  const df = x => (f(x + 1e-6) - f(x - 1e-6)) / 2e-6;
  for (let i = 1; i < grid.length - 1; i += 7) { let x = grid[i]; for (let k = 0; k < 60; k++) { const d = (df(x + 1e-5) - df(x - 1e-5)) / 2e-5; if (!d) break; const nx = x - df(x) / d; if (!isFinite(nx)) break; if (Math.abs(nx - x) < 1e-13) { x = nx; break; } x = nx; } if (Math.abs(f(x)) < 1e-10) addR(x); }
  return out.sort((a, b) => a - b);
}
/* Gleichungssysteme: Newton mit numerischer Jacobi-Matrix von vielen Startpunkten */
function rootsN(fs, n, starts) {
  const out = [], F = x => fs.map(f => f(...x));
  const tryFrom = x0 => {
    let x = x0.slice();
    for (let it = 0; it < 80; it++) {
      const fx = F(x); if (fx.some(v => !isFinite(v))) return;
      const nr = Math.hypot(...fx); if (nr < 1e-13) break;
      const J = fx.map((_, i) => x.map((_, j) => { const h = 1e-7 * Math.max(1, Math.abs(x[j])); const xp = x.slice(); xp[j] += h; const xm = x.slice(); xm[j] -= h; return (fs[i](...xp) - fs[i](...xm)) / (2 * h); }));
      let dx; try { dx = solveSq(J, fx.map(v => -v)); } catch (e) { return; }
      let lam = 1; for (let k = 0; k < 12; k++) { const xn = x.map((v, j) => v + lam * dx[j]); const nn = Math.hypot(...F(xn)); if (isFinite(nn) && nn < nr) { x = xn; break; } lam /= 2; if (k === 11) x = xn; }
      if (Math.hypot(...dx) < 1e-14 * Math.max(1, Math.hypot(...x))) break;
    }
    const r = Math.hypot(...F(x)); if (!(r < 1e-8)) return;
    x = x.map(v => clean(+v.toPrecision(12)));
    if (!out.some(o => o.every((v, j) => Math.abs(v - x[j]) < 1e-6 * Math.max(1, Math.abs(v))))) out.push(x);
  };
  starts.forEach(tryFrom);
  return out;
}
function solveSq(Am, b) { const n = b.length, m = Am.map((r, i) => r.concat([b[i]])); for (let c = 0; c < n; c++) { let p = c; for (let i = c + 1; i < n; i++) if (Math.abs(m[i][c]) > Math.abs(m[p][c])) p = i; if (Math.abs(m[p][c]) < 1e-300) throw new Error("singulär"); [m[p], m[c]] = [m[c], m[p]]; for (let i = 0; i < n; i++) if (i !== c) { const f = m[i][c] / m[c][c]; for (let j = c; j <= n; j++) m[i][j] -= f * m[c][j]; } } return m.map((r, i) => r[n] / r[i]); }
function startGrid(n) { const vals = n === 1 ? [-50, -10, -5, -3, -2, -1, -0.5, 0, 0.3, 0.7, 1, 2, 3, 5, 10, 50] : n === 2 ? [-20, -5, -2, -1, -0.6, -0.2, 0.1, 0.5, 1, 2, 5, 20] : n === 3 ? [-10, -2, -0.7, 0.2, 1, 3, 12] : [-3, -0.5, 0.4, 2, 8]; let pts = [[]]; for (let i = 0; i < n; i++) { const nx = []; pts.forEach(p => vals.forEach(v => nx.push(p.concat([v])))); pts = nx; } if (pts.length > 3000) pts = pts.filter((_, i) => i % Math.ceil(pts.length / 3000) === 0); return pts; }
/* Nelder-Mead für Minimize/Maximize */
function nelder(f, x0, step = 1) {
  const n = x0.length; let S = [x0.slice()]; for (let i = 0; i < n; i++) { const p = x0.slice(); p[i] += step * (Math.abs(p[i]) > 1 ? Math.abs(p[i]) * .2 : 1); S.push(p); }
  let F = S.map(p => f(p));
  for (let it = 0; it < 4000; it++) {
    const o = S.map((p, i) => i).sort((a, b) => F[a] - F[b]); S = o.map(i => S[i]); F = o.map(i => F[i]);
    if (Math.abs(F[n] - F[0]) < 1e-15 * (1 + Math.abs(F[0])) && it > 50) break;
    const c = Array(n).fill(0); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) c[j] += S[i][j] / n;
    const xr = c.map((v, j) => v + (v - S[n][j])), fr = f(xr);
    if (fr < F[0]) { const xe = c.map((v, j) => v + 2 * (v - S[n][j])), fe = f(xe); if (fe < fr) { S[n] = xe; F[n] = fe; } else { S[n] = xr; F[n] = fr; } }
    else if (fr < F[n - 1]) { S[n] = xr; F[n] = fr; }
    else { const xc = c.map((v, j) => v + .5 * (S[n][j] - v)), fc = f(xc); if (fc < F[n]) { S[n] = xc; F[n] = fc; } else { for (let i = 1; i <= n; i++) { S[i] = S[i].map((v, j) => S[0][j] + .5 * (v - S[0][j])); F[i] = f(S[i]); } } }
  }
  return { x: S[0], f: F[0] };
}

/* ================= Kurvenanpassung ================= */
function polyInterp(xs, ys) {
  const n = xs.length; const Am = xs.map(x => Array.from({ length: n }, (_, j) => Math.pow(x, n - 1 - j)));
  return solveSq(Am, ys).map(clean);
}
function polyAst(co, x) { const n = co.length; return simp({ k: "add", t: co.map((c, i) => ({ k: "mul", f: [N(clean(c)), { k: "pow", b: Sy(x), e: N(n - 1 - i) }] })) }); }
/* kubischer Spline: natürlich (Krümmung 0 an den Rändern), periodisch oder „notaknot“ */
function spline(xs, ys, mode = "natural") {
  const n = xs.length; if (n < 2) throw err("Spline", "mindestens 2 Punkte nötig");
  const h = xs.slice(1).map((x, i) => x - xs[i]);
  const Am = Array.from({ length: n }, () => Array(n).fill(0)), r = Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) { Am[i][i - 1] = h[i - 1]; Am[i][i] = 2 * (h[i - 1] + h[i]); Am[i][i + 1] = h[i]; r[i] = 6 * ((ys[i + 1] - ys[i]) / h[i] - (ys[i] - ys[i - 1]) / h[i - 1]); }
  if (mode === "periodic" && n > 2) { Am[0][0] = 1; Am[0][n - 1] = -1; Am[n - 1][0] = 2 * h[0]; Am[n - 1][1] = h[0]; Am[n - 1][n - 2] = h[n - 2]; Am[n - 1][n - 1] = 2 * h[n - 2]; r[n - 1] = 6 * ((ys[1] - ys[0]) / h[0] - (ys[n - 1] - ys[n - 2]) / h[n - 2]); }
  else if (mode === "notaknot" && n > 3) { Am[0][0] = h[1]; Am[0][1] = -(h[0] + h[1]); Am[0][2] = h[0]; Am[n - 1][n - 3] = h[n - 2]; Am[n - 1][n - 2] = -(h[n - 3] + h[n - 2]); Am[n - 1][n - 1] = h[n - 3]; }
  else { Am[0][0] = 1; Am[n - 1][n - 1] = 1; }
  const Mm = n === 2 ? [0, 0] : solveSq(Am, r);
  const pieces = [];
  for (let i = 0; i < n - 1; i++) { const a = ys[i], b = (ys[i + 1] - ys[i]) / h[i] - h[i] * (2 * Mm[i] + Mm[i + 1]) / 6, c = Mm[i] / 2, d = (Mm[i + 1] - Mm[i]) / (6 * h[i]); pieces.push({ x0: xs[i], x1: xs[i + 1], a, b, c, d }); }
  return pieces;
}
function splineAst(pieces, x) {
  const args = [];
  pieces.forEach((p, i) => { const u = { k: "add", t: [Sy(x), N(-p.x0)] }; const poly = expand({ k: "add", t: [N(p.a), { k: "mul", f: [N(p.b), u] }, { k: "mul", f: [N(p.c), { k: "pow", b: u, e: N(2) }] }, { k: "mul", f: [N(p.d), { k: "pow", b: u, e: N(3) }] }] });
    if (i < pieces.length - 1) args.push({ k: "rel", o: "<", a: Sy(x), b: N(p.x1) }); args.push(poly); });
  return { k: "fn", n: "piecewise", a: args };
}
/* lineare Ausgleichsrechnung: Modell linear in den Parametern */
function leastSquares(xs, ys, model, x, params) {
  const f = compile(model, [x].concat(params)), z = params.map(() => 0);
  const base = xs.map(xv => f(xv, ...z));
  const cols = params.map((_, j) => xs.map((xv, i) => { const p = z.slice(); p[j] = 1; return f(xv, ...p) - base[i]; }));
  const NtN = params.map((_, a) => params.map((_, b) => cols[a].reduce((s, v, i) => s + v * cols[b][i], 0)));
  const Nty = params.map((_, a) => cols[a].reduce((s, v, i) => s + v * (ys[i] - base[i]), 0));
  return solveSq(NtN, Nty).map(v => +v.toPrecision(12));
}
/* nichtlineare Ausgleichsrechnung: Levenberg–Marquardt */
function nonlinFit(xs, ys, model, x, params, start) {
  const f = compile(model, [x].concat(params)); let p = start || params.map(() => 1);
  const res = q => xs.map((xv, i) => f(xv, ...q) - ys[i]), ss = q => res(q).reduce((s, v) => s + v * v, 0);
  if (!start) { let best = p, bs = ss(p); for (const s of [[1, 0.1], [1, 1], [10, 0.1], [ys[0] || 1, 0.1], [ys[0] || 1, 0.3], [ys[0] || 1, 0.05], [1, 0.01], [ys[0] || 1, -0.1]]) { const q = params.map((_, i) => s[i] != null ? s[i] : 1); const v = ss(q); if (isFinite(v) && v < bs) { best = q; bs = v; } } p = best; }
  let lam = 1e-3;
  for (let it = 0; it < 500; it++) {
    const r = res(p), J = xs.map((xv, i) => p.map((pv, j) => { const h = 1e-7 * Math.max(1, Math.abs(pv)); const q = p.slice(); q[j] += h; return (f(xv, ...q) - f(xv, ...p)) / h; }));
    const JtJ = p.map((_, a) => p.map((_, b) => J.reduce((s, row) => s + row[a] * row[b], 0))), Jtr = p.map((_, a) => J.reduce((s, row, i) => s + row[a] * r[i], 0));
    const cur = ss(p); let improved = false;
    for (let k = 0; k < 20; k++) { const Am = JtJ.map((row, a) => row.map((v, b) => a === b ? v * (1 + lam) + 1e-12 : v)); let dp; try { dp = solveSq(Am, Jtr.map(v => -v)); } catch (e) { lam *= 10; continue; } const q = p.map((v, j) => v + dp[j]); const nv2 = ss(q); if (isFinite(nv2) && nv2 < cur) { p = q; lam = Math.max(lam / 10, 1e-12); improved = true; if (Math.abs(cur - nv2) < 1e-15 * (1 + cur)) it = 1e9; break; } lam *= 10; }
    if (!improved) break;
  }
  return p.map(v => +v.toPrecision(10));
}

/* ================= Ausgabe ================= */
const GREEK = { alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", lambda: "λ", mu: "μ", pi: "π", Pi: "π", theta: "θ", phi: "φ", sigma: "σ", omega: "ω", rho: "ρ", tau: "τ", xi: "ξ", eta: "η", kappa: "κ", nu: "ν", psi: "ψ", Delta: "Δ", Lambda: "Λ", Omega: "Ω", Sigma: "Σ", Phi: "Φ", Theta: "Θ", infinity: "∞" };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const SQF = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23, 26, 29, 30, 31, 33, 34, 35, 37, 38, 39, 41, 42, 43, 46, 47, 51, 53, 55, 57, 58, 59, 61, 62, 65, 66, 67, 69, 70, 71, 73, 74, 77, 78, 79, 82, 83, 85, 86, 87, 89, 91, 93, 94, 95, 97];
function frac(v, maxQ = 1000) { for (let q = 1; q <= maxQ; q++) { const p = Math.round(v * q); if (Math.abs(v - p / q) < 1e-10 * Math.max(1, Math.abs(v))) return [p, q]; } return null; }
/* Zahl erkennen: ganze Zahl, kurzer Dezimalbruch, Bruch, Vielfaches von π, Wurzel – wie Maples exakte Ausgabe */
function recog(v) {
  if (!isFinite(v)) return { t: v > 0 ? "∞" : v < 0 ? "-∞" : "undefined" };
  if (Number.isInteger(v)) return { int: v };
  const f = frac(v); if (f && f[1] <= 999) return { p: f[0], q: f[1] };
  const s = +v.toFixed(4); if (Math.abs(s - v) < 1e-12 * Math.max(1, Math.abs(v))) return { dec: s };
  const fp = frac(v / Math.PI, 60); if (fp && Math.abs(fp[0]) <= 400) return { p: fp[0], q: fp[1], pi: true };
  for (const r of SQF) { const g = frac(v / Math.sqrt(r), 30); if (g && Math.abs(g[0]) <= 200) return { p: g[0], q: g[1], sq: r }; }
  return { flt: v };
}
const fmtF = (v, d = 10) => { if (!isFinite(v)) return v > 0 ? "∞" : v < 0 ? "-∞" : "undefined"; if (v === 0) return "0."; let s = (+v.toPrecision(d)).toString(); if (/e/.test(s)) { const [m, ex] = s.split("e"); return `${m}×10<sup>${+ex}</sup>`; } if (!/\./.test(s)) s += "."; return s; };
const fmtFT = (v, d = 10) => { if (!isFinite(v)) return String(v); let s = (+v.toPrecision(d)).toString(); return s; };
function numHTML(v, float) {
  if (float) return fmtF(v, float === true ? 10 : float);
  const r = recog(v);
  if (r.t) return r.t; if (r.int != null) return String(r.int); if (r.dec != null) return String(r.dec);
  if (r.flt != null) return fmtF(r.flt);
  const sg = r.p < 0 ? "−" : "", p = Math.abs(r.p);
  const top = r.pi ? (p === 1 ? "π" : p + " π") : r.sq ? (p === 1 ? `√<span class="mo">${r.sq}</span>` : `${p} √<span class="mo">${r.sq}</span>`) : String(p);
  return r.q === 1 ? sg + top : `${sg}<span class="mf"><span>${top}</span><span>${r.q}</span></span>`;
}
function numTxt(v) { const r = recog(v); if (r.t) return r.t; if (r.int != null) return String(r.int); if (r.dec != null) return String(r.dec); if (r.flt != null) return fmtFT(r.flt); const b = r.pi ? (Math.abs(r.p) === 1 ? (r.p < 0 ? "-" : "") + "Pi" : r.p + "*Pi") : r.sq ? (Math.abs(r.p) === 1 ? (r.p < 0 ? "-" : "") + `sqrt(${r.sq})` : `${r.p}*sqrt(${r.sq})`) : String(r.p); return r.q === 1 ? b : `${b}/${r.q}`; }
const PREC = { add: 1, mul: 2, neg: 2, pow: 3 };
const prec = e => e.k === "n" ? (e.v < 0 ? 1.5 : recog(e.v).q > 1 ? 2.5 : 9) : PREC[e.k] || 9;
/* Maple-1D-Text (wird auch als Schlüssel zum Vergleichen benutzt) */
function txt(e) {
  if (typeof e === "number") return numTxt(e);
  if (!e || typeof e !== "object") return String(e);
  if (e.T) return valTxt(e);
  switch (e.k) {
    case "n": return numTxt(e.v);
    case "s": return e.n;
    case "str": return `"${e.v}"`;
    case "add": return e.t.map((t, i) => { const s = txt(t); return i && !s.startsWith("-") ? "+" + s : s; }).join("");
    case "mul": { if (e.f[0].k === "n" && e.f[0].v < 0) { const rest = e.f.length === 2 ? e.f[1] : { k: "mul", f: e.f.slice(1) }; return "-" + (e.f[0].v === -1 ? par(rest, 2, txt) : txt({ k: "mul", f: [N(-e.f[0].v)].concat(e.f.slice(1)) })); } return e.f.map(f => par(f, 2, txt)).join("*"); }
    case "pow": return e.e.k === "n" && e.e.v === 0.5 ? `sqrt(${txt(e.b)})` : par(e.b, 3.5, txt) + "^" + par(e.e, 3.5, txt);
    case "fn": return e.n + "(" + e.a.map(txt).join(", ") + ")";
    case "rel": return txt(e.a) + " " + e.o + " " + txt(e.b);
    case "rng": return txt(e.a) + " .. " + txt(e.b);
    default: return "?";
  }
}
const par = (e, p, f) => prec(e) < p ? "(" + f(e) + ")" : f(e);
/* hübsche 2D-Ausgabe (HTML) */
function html(e, fl) {
  if (typeof e === "number") return numHTML(e, fl);
  if (!e || typeof e !== "object") return esc(String(e));
  if (e.T) return valHTML(e, fl);
  if (e.fl || e.flt) fl = fl || true;
  switch (e.k) {
    case "n": return numHTML(e.v, fl);
    case "s": return `<i>${GREEK[e.n] || esc(e.n)}</i>`;
    case "str": return `<span class="mstr">"${esc(e.v)}"</span>`;
    case "add": return e.t.map((t, i) => { const neg = (t.k === "n" && t.v < 0) || (t.k === "mul" && t.f[0].k === "n" && t.f[0].v < 0); if (!i) return html(t, fl).replace(/^-/, "−"); if (!neg) return " + " + html(t, fl); return " − " + html(A.neg(t) && ast(A.neg(t)), fl); }).join("");
    case "mul": {
      let c = 1, num = [], den = [];
      e.f.forEach(f => { if (f.k === "n") c *= f.v; else if (f.k === "pow" && f.e.k === "n" && f.e.v < 0) den.push(f.e.v === -1 ? f.b : { k: "pow", b: f.b, e: N(-f.e.v) }); else num.push(f); });
      let sg = c < 0 ? "−" : ""; c = Math.abs(c); let cq = 1, cp = c;
      if (!fl) { const r = recog(c); if (r.q && !r.pi && !r.sq) { cp = r.p; cq = r.q; } }
      const fpart = (arr, k) => arr.map(f => prec(f) < 2 || (f.k === "add") ? "(" + html(f, fl) + ")" : html(f, fl)).join(" ");
      let top = (cp !== 1 || !num.length ? numHTML(cp, fl) + (num.length ? " " : "") : "") + fpart(num);
      let bot = (cq !== 1 ? numHTML(cq, fl) + (den.length ? " " : "") : "") + fpart(den);
      return bot ? `${sg}<span class="mf"><span>${top || "1"}</span><span>${bot}</span></span>` : sg + top;
    }
    case "pow": {
      if (e.e.k === "n" && e.e.v === 0.5) return `√<span class="mo">${html(e.b, fl)}</span>`;
      if (e.e.k === "n" && e.e.v < 0) return `<span class="mf"><span>1</span><span>${html(e.e.v === -1 ? e.b : { k: "pow", b: e.b, e: N(-e.e.v) }, fl)}</span></span>`;
      const b = prec(e.b) < 9 || e.b.k === "pow" || (e.b.k === "n" && e.b.v < 0) ? "(" + html(e.b, fl) + ")" : html(e.b, fl);
      return `${b}<sup>${e.e.k === "n" && Number.isInteger(e.e.v) ? e.e.v : html(e.e, fl)}</sup>`;
    }
    case "fn": {
      if (e.n === "exp") return `e<sup>${html(e.a[0], fl)}</sup>`;
      if (e.n === "abs") return `|${html(e.a[0], fl)}|`;
      if (e.n === "piecewise") { const rows = []; for (let i = 0; i < e.a.length; i += 2) rows.push(i + 1 < e.a.length ? `<tr><td>${html(e.a[i + 1], fl)}</td><td class="mpw-c">${html(e.a[i], fl)}</td></tr>` : `<tr><td>${html(e.a[i], fl)}</td><td class="mpw-c">otherwise</td></tr>`); return `<span class="mpw"><span class="mpw-b">{</span><table>${rows.join("")}</table></span>`; }
      if (e.n === "int") { const r = e.a[1]; return r && r.k === "rel" ? `∫<sub>${html(r.b.a, fl)}</sub><sup>${html(r.b.b, fl)}</sup> ${html(e.a[0], fl)} d<i>${esc(r.a.n)}</i>` : `∫ ${html(e.a[0], fl)} d<i>${esc(r ? r.n : "x")}</i>`; }
      return `${esc(e.n)}(${e.a.map(a => html(a, fl)).join(", ")})`;
    }
    case "rel": return html(e.a, fl) + ` ${{ "<=": "≤", ">=": "≥", "<>": "≠" }[e.o] || esc(e.o)} ` + html(e.b, fl);
    case "rng": return html(e.a, fl) + " .. " + html(e.b, fl);
    default: return "?";
  }
}
function valHTML(v, fl) {
  switch (v.T) {
    case "mat": return `<table class="mmat">${v.d.map(r => `<tr>${r.map(x => `<td>${html(x, fl)}</td>`).join("")}</tr>`).join("")}</table>`;
    case "vec": return v.row ? `<table class="mmat"><tr>${v.d.map(x => `<td>${html(x, fl)}</td>`).join("")}</tr></table>` : `<table class="mmat">${v.d.map(x => `<tr><td>${html(x, fl)}</td></tr>`).join("")}</table>`;
    case "list": return `[${v.it.map(x => html(x, fl)).join(", ")}]`;
    case "set": return `{${v.it.map(x => html(x, fl)).join(", ")}}`;
    case "seq": return v.it.map(x => html(x, fl)).join(", ");
    case "proc": return `${v.p.length === 1 ? `<i>${esc(v.p[0])}</i>` : "(" + v.p.map(p => `<i>${esc(p)}</i>`).join(", ") + ")"} ↦ ${html(v.body, fl)}`;
    case "str": return `<span class="mstr">${esc(v.v)}</span>`;
    case "msg": return v.html;
    case "flt": return html(v.v, true);
    case "nul": return "";
    default: return "";
  }
}
function valTxt(v) { switch (v.T) { case "mat": return "Matrix([" + v.d.map(r => "[" + r.map(txt).join(", ") + "]").join(", ") + "])"; case "vec": return "Vector([" + v.d.map(txt).join(", ") + "])"; case "list": return "[" + v.it.map(txt).join(", ") + "]"; case "set": return "{" + v.it.map(txt).join(", ") + "}"; case "seq": return v.it.map(txt).join(", "); case "flt": return fmtFT(v.v); case "str": return v.v; default: return ""; } }

/* ================= Auswerten ================= */
function Session() {
  this.env = Object.create(null); this.last = null; this.digits = 10; this.pkgs = new Set(); this.taint = new Set(); this.fl = false;
}
const unwrap = v => v && v.T === "flt" ? v.v : v && v.T === "seq" && v.it.length === 1 ? unwrap(v.it[0]) : v;
Session.prototype.run = function (src) {
  const res = []; let prog;
  try { prog = parseProgram(src); } catch (e) { return [{ err: errText(e) }]; }
  for (const st of prog) {
    try { this.fl = false; const v = this.ev(st.e, true); this.last = v; const fl = this.fl; if (st.e.k === "asg") { if (fl) this.taint.add(v.name); else this.taint.delete(v.name); } if (st.show && v !== undefined && !(v && v.T === "nul")) res.push(st.e.k === "asg" ? { asg: v.name, v: v.val, fl } : { v, fl }); }
    catch (e) { res.push({ err: errText(e) }); break; }
  }
  return res;
};
const errText = e => e.mpl ? `Error, (in ${e.mpl}) ${e.message}` : `Error, ${e.message}`;
Session.prototype.ev = function (e, top) {
  const S = this;
  switch (e.k) {
    case "n": if (e.f) S.fl = true; return e.v;
    case "lit": return e.v;
    case "str": return { T: "str", v: e.v };
    case "quote": return e.e.k === "s" ? e.e : S.ev(e.e);
    case "paren": return S.ev(e.e);
    case "s": {
      if (e.n === "%") { if (S.last == null) throw err("%", "kein vorheriges Ergebnis"); return S.last; }
      if (e.n in S.env) { if (S.taint.has(e.n)) S.fl = true; return fullEval(S, S.env[e.n], e.n, 0); }
      if (e.n === "Pi" || e.n === "pi") return Math.PI; if (e.n === "infinity") return Infinity;
      if (e.n === "NULL") return { T: "nul" }; if (e.n === "restart") { S.env = Object.create(null); S.pkgs.clear(); S.taint.clear(); S.last = null; return { T: "nul" }; } if (e.n === "true") return 1; if (e.n === "false") return 0;
      return Sy(e.n);
    }
    case "neg": return A.neg(unwrap(S.ev(e.a)));
    case "bin": { const a = unwrap(S.ev(e.a)), b = unwrap(S.ev(e.b)); return { "+": A.add, "-": A.sub, "*": A.mul, "/": A.div, "^": A.pow, ".": A.dot }[e.o](a, b); }
    case "fact": { const a = unwrap(S.ev(e.a)); if (typeof a !== "number") return { k: "fn", n: "factorial", a: [ast(a)] }; return fact(a); }
    case "rel": return { k: "rel", o: e.o, a: ast(toE(S.ev(e.a))), b: e.b.k === "rng" ? S.ev(e.b) : ast(toE(S.ev(e.b))) };
    case "rng": return { k: "rng", a: ast(unwrap(S.ev(e.a))), b: ast(unwrap(S.ev(e.b))) };
    case "list": return { T: "list", it: flat(e.it.map(x => S.ev(x))) };
    case "set": { const it = flat(e.it.map(x => S.ev(x))), seen = new Set(); return { T: "set", it: it.filter(x => { const k = txt(x); if (seen.has(k)) return false; seen.add(k); return true; }) }; }
    case "seq": return { T: "seq", it: flat(e.it.map(x => S.ev(x))) };
    case "arrow": return { T: "proc", p: e.p, body: e.body, env: S };
    case "rep": { const a = S.ev(e.a), n = unwrap(S.ev(e.b)); return { T: "seq", it: Array(Math.max(0, n | 0)).fill(a) }; }
    case "asg": {
      if (e.l.k === "s" && PROTECTED.has(e.l.n)) throw new Error(`attempting to assign to \`${e.l.n}\` which is protected.  Try declaring \`local ${e.l.n}\`; see ?protect for details.`);
      if (e.l.k === "s") { let v = S.ev(e.v); if (v && v.T === "seq" && v.it.length === 1) v = v.it[0]; v = unwrap(v); if (e.l.n === "Digits") S.digits = v; if (v && v.k === "s" && v.n === e.l.n) delete S.env[e.l.n]; else S.env[e.l.n] = v; return { name: e.l.n, val: v }; }
      if (e.l.k === "call" && e.l.f.k === "s") { const v = { T: "proc", p: e.l.args.map(a => a.n), body: e.v, env: S }; S.env[e.l.f.n] = v; return { name: e.l.f.n, val: v }; }
      if (e.l.k === "ix" && e.l.a.k === "s") { const m = S.env[e.l.a.n]; if (!isM(m)) throw err("assignment", "nur Matrix-/Vektor-Elemente können zugewiesen werden"); const ii = e.l.i.map(x => unwrap(S.ev(x)) - 1), v = unwrap(S.ev(e.v)); if (m.T === "vec") m.d[ii[0]] = v; else m.d[ii[0]][ii[1]] = v; return { name: e.l.a.n, val: m }; }
      throw err("assignment", "ungültige linke Seite");
    }
    case "ix": {
      if (e.a.k === "s" && (e.a.n === "Vector" || e.a.n === "evalf" || e.a.n === "plots" || e.a.n === "LinearAlgebra" || e.a.n === "CurveFitting" || e.a.n === "Statistics" || e.a.n === "Student" || e.a.n === "VectorCalculus" || e.a.n === "Optimization")) return { T: "ixname", n: e.a.n, i: e.i.map(x => x.k === "s" ? x.n : unwrap(S.ev(x))) };
      const b = unwrap(S.ev(e.a)), ii = e.i.map(x => unwrap(S.ev(x)));
      if (b && b.T === "mat") { if (ii.length === 1) return V(b.d[ii[0] - 1], true); return b.d[ii[0] - 1][ii[1] - 1]; }
      if (b && (b.T === "vec")) return b.d[ii[0] - 1];
      if (b && (b.T === "list" || b.T === "set" || b.T === "seq")) { if (ii[0] && ii[0].k === "rng") return { T: b.T, it: b.it.slice(nv(ii[0].a) - 1, nv(ii[0].b)) }; return b.it[ii[0] - 1]; }
      return { k: "s", n: (b && b.n || "?") + "[" + ii.map(txt).join(",") + "]" };
    }
    case "call": return S.call(e);
    default: throw err("eval", "unbekannter Ausdruck");
  }
};
const flat = arr => arr.flatMap(x => x && x.T === "seq" ? x.it : x && x.T === "nul" ? [] : [x]);
const toE = v => v && v.T === "flt" ? v.v : v;
/* proc anwenden */
Session.prototype.apply = function (pr, args) {
  if (pr.T !== "proc") throw err("apply", "keine Funktion");
  const S = pr.env, saved = {}; pr.p.forEach((p, i) => { saved[p] = Object.prototype.hasOwnProperty.call(S.env, p) ? S.env[p] : undefined; S.env[p] = args[i] !== undefined ? args[i] : Sy(p); });
  try { return unwrap(S.ev(pr.body)); } finally { pr.p.forEach(p => { if (saved[p] === undefined) delete S.env[p]; else S.env[p] = saved[p]; }); }
};
const optsOf = args => { const o = {}; args.forEach(a => { if (a && a.k === "rel" && a.o === "=" && a.a.k === "s" && !(a.b && a.b.k === "rng")) o[a.a.n] = a.b; }); return o; };
const optStr = v => v == null ? null : v.k === "s" ? v.n : v.T === "str" ? v.v : v.k === "str" ? v.v : v.k === "n" ? v.v : txt(v);
const varRange = a => a && a.k === "rel" && a.b && a.b.k === "rng" ? { v: a.a.n, lo: numOf(a.b.a), hi: numOf(a.b.b) } : null;
function numOf(e) { const v = fin(ast(e)); if (typeof v === "number") return v; const f = compile(v, []); const r = f(); if (!isFinite(r) && !(r === Infinity || r === -Infinity)) throw err("evalf", "Ausdruck ist nicht numerisch: " + txt(v)); return r; }
const pointsOf = v => { v = unwrap(v); const it = v.T === "list" || v.T === "set" ? v.it : v.T === "mat" ? v.d.map(r => ({ T: "list", it: r })) : null; if (!it) throw err("points", "Punkteliste [[x1,y1],[x2,y2],…] erwartet"); return it.map(p => { const q = unwrap(p); const a = q.T === "list" ? q.it : q.T === "vec" ? q.d : null; if (!a) throw err("points", "Punkte als [x, y] angeben"); return a.map(numOf); }); };

/* symbolische Summe Σ_{k=0|1}^{m} p(k) für Polynome bis Grad 3 in k (Faulhaber), z. B. Riemann-Summen */
function faulhaber(e, k, lo, m) {
  const ex = expand(e), terms = ex.k === "add" ? ex.t : [ex], out = [];
  const one = Sy("1"), P = (b, n) => ({ k: "pow", b, e: N(n) }), Mu = (...f) => ({ k: "mul", f }), Ad = (...t) => ({ k: "add", t });
  const SK = [Ad(m, N(lo === 0 ? 1 : 0)), Mu(N(0.5), m, Ad(m, N(1))), Mu(N(1 / 6), m, Ad(m, N(1)), Ad(Mu(N(2), m), N(1))), Mu(N(0.25), P(m, 2), P(Ad(m, N(1)), 2))];
  for (const t of terms) {
    const fs = t.k === "mul" ? t.f : [t]; let j = 0; const c = [];
    for (const f of fs) { if (f.k === "s" && f.n === k) j += 1; else if (f.k === "pow" && f.b.k === "s" && f.b.n === k && f.e.k === "n" && Number.isInteger(f.e.v) && f.e.v > 0) j += f.e.v; else if (has(f, k)) return null; else c.push(f); }
    if (j > 3) return null; out.push(Mu(...(c.length ? c : [N(1)]), SK[j]));
  }
  void one; return simp(Ad(...out));
}
/* Paket-Inhalte (für with()) */
const PKG = {
  LinearAlgebra: ["Determinant", "Transpose", "MatrixInverse", "LinearSolve", "IdentityMatrix", "MatrixPower", "Multiply", "NullSpace", "Rank", "DotProduct", "Norm", "RowDimension", "ColumnDimension", "Eigenvalues", "Trace"],
  CurveFitting: ["PolynomialInterpolation", "Spline", "LeastSquares"],
  plots: ["display", "implicitplot", "contourplot", "pointplot", "polygonplot", "textplot", "plot3d", "arrow"],
  Statistics: ["NonlinearFit", "Fit", "LinearFit", "Mean"],
  VectorCalculus: ["Gradient", "Hessian"],
  Optimization: ["Minimize", "Maximize"],
  Student: ["Calculus1"]
};
MPL.PKG = PKG;

Session.prototype.call = function (e) {
  const S = this;
  let fname = e.f.k === "s" ? e.f.n : null, fidx = null;
  if (e.f.k === "ix") { const r = S.ev(e.f); if (r.T === "ixname") { fname = r.n === "plots" || r.n === "LinearAlgebra" || r.n === "CurveFitting" || r.n === "Statistics" || r.n === "Student" || r.n === "VectorCalculus" || r.n === "Optimization" ? String(r.i[0]) : r.n; fidx = r.i; } }
  if (fname && fname in S.env && S.env[fname].T === "proc") return S.apply(S.env[fname], flat(e.args.map(a => S.ev(a))).map(unwrap));
  if (!fname) { const f = S.ev(e.f); if (f && f.T === "proc") return S.apply(f, flat(e.args.map(a => S.ev(a))).map(unwrap)); throw err("call", "das ist keine Funktion"); }
  /* Befehle mit eigener Auswertung der Argumente */
  if (fname === "with") { const p = e.args[0] && e.args[0].n; if (!PKG[p]) throw err("with", `Paket „${p}“ gibt es hier nicht (verfügbar: ${Object.keys(PKG).join(", ")})`); S.pkgs.add(p); return { T: "list", it: PKG[p].map(Sy) }; }
  if (fname === "restart") { S.env = Object.create(null); S.pkgs.clear(); S.last = null; return { T: "nul" }; }
  if (fname === "seq" || fname === "add" || fname === "sum" || fname === "mul" || fname === "product") {
    const r = e.args[1]; if (!r || r.k !== "rel" || r.b.k !== "rng") throw err(fname, "Bereich i = a..b erwartet");
    const v = r.a.n, lo = unwrap(S.ev(r.b.a)), hi = unwrap(S.ev(r.b.b)), saved = S.env[v], out = [];
    if (typeof lo !== "number" || typeof hi !== "number") { if (fname === "sum" && typeof lo === "number" && (lo === 0 || lo === 1)) { const fs = faulhaber(ast(unwrap(S.ev(e.args[0]))), v, lo, ast(hi)); if (fs) return fin(fs); } return { k: "fn", n: fname, a: [ast(S.ev(e.args[0])), ast(S.ev(r))] }; }
    try { for (let i = lo; i <= hi + 1e-9; i++) { S.env[v] = i; out.push(unwrap(S.ev(e.args[0]))); } } finally { if (saved === undefined) delete S.env[v]; else S.env[v] = saved; }
    if (fname === "seq") return { T: "seq", it: out };
    if (fname === "add" || fname === "sum") return out.reduce((s, x) => A.add(s, x), 0);
    return out.reduce((s, x) => A.mul(s, x), 1);
  }
  const args = flat(e.args.map(a => S.ev(a)));
  const a0 = unwrap(args[0]);
  const C = CMD[fname];
  if (C) return C.call(S, args.map(unwrap), fidx, e);
  if (FNUM[fname]) { if (args.length !== 1) throw err(fname, "erwartet ein Argument"); const x = a0; if (typeof x === "number") { const r = FNUM[fname](x); if (isNaN(r)) throw err(fname, "Argument außerhalb des Definitionsbereichs"); return clean(r); } if (isM(x)) return mmap(x, z => typeof z === "number" ? clean(FNUM[fname](z)) : fin(simp({ k: "fn", n: fname, a: [ast(z)] }))); return fin(simp({ k: "fn", n: fname, a: [ast(x)] })); }
  /* unbekannte Funktion: unausgewertet lassen (wie Maple) */
  return { k: "fn", n: fname, a: args.map(x => ast(unwrap(x))) };
};

const exprOf = v => { v = unwrap(v); if (v && v.k === "rel" && v.o === "=") return fin(simp({ k: "add", t: [v.a, { k: "mul", f: [N(-1), v.b] }] })); return v; };
const varsOf = v => { v = unwrap(v); if (!v) return null; if (v.k === "s") return [v.n]; if (v.T === "set" || v.T === "list") return v.it.map(x => x.n); return null; };
function solveSys(S, eqs, vars, ranges) {
  const ex = eqs.map(exprOf).map(ast);
  if (!vars) { const fv = new Set(); ex.forEach(x => free(x, fv)); vars = [...fv].sort(); }
  if (!vars.length) throw err("solve", "keine Unbekannten");
  if (ex.some(x => [...free(x)].some(v => !vars.includes(v)))) throw err("solve", "die Gleichungen enthalten weitere freie Variablen; weise ihnen zuerst Werte zu");
  if (vars.length === 1 && ex.length === 1) { const f = compile(ex[0], vars), r = ranges && ranges[vars[0]]; let rs = roots1(x => f(x), r ? r[0] : -1e3, r ? r[1] : 1e3);
    /* periodische Gleichungen (sin, cos, tan): wie Maple nur die Hauptlösung (kleinster Betrag) */
    if (!r && rs.length > 6 && /"n":"(sin|cos|tan)"/.test(JSON.stringify(ex[0]))) rs = [rs.slice().sort((a, b) => Math.abs(a) - Math.abs(b) || b - a)[0]];
    return { one: true, sol: rs.map(x => [x]), vars }; }
  const fs = ex.map(x => compile(x, vars));
  let starts = startGrid(vars.length);
  if (ranges) starts = starts.concat(Array.from({ length: 200 }, () => vars.map(v => ranges[v] ? ranges[v][0] + Math.random() * (ranges[v][1] - ranges[v][0]) : (Math.random() - .5) * 20)));
  let sol = fs.length === vars.length ? rootsN(fs, vars.length, starts) : (() => { const g = x => fs.reduce((s, f) => s + f(...x) ** 2, 0); const out = []; starts.slice(0, 300).forEach(s => { const r = nelder(g, s); if (r.f < 1e-14) { const x = r.x.map(v => clean(+v.toPrecision(10))); if (!out.some(o => o.every((v, j) => Math.abs(v - x[j]) < 1e-6))) out.push(x); } }); return out; })();
  if (ranges) sol = sol.filter(x => vars.every((v, j) => !ranges[v] || (x[j] >= ranges[v][0] - 1e-9 && x[j] <= ranges[v][1] + 1e-9)));
  sol.sort((a, b) => { for (let j = 0; j < a.length; j++) if (Math.abs(a[j] - b[j]) > 1e-9) return a[j] - b[j]; return 0; });
  return { sol, vars };
}
const solOut = (r, asSet, float) => { const W = x => float ? { T: "flt", v: x } : x; if (r.one && !asSet) return r.sol.length ? { T: "seq", it: r.sol.map(x => W(x[0])) } : { T: "nul" }; return r.sol.length ? { T: "seq", it: r.sol.map(x => ({ T: "set", it: r.vars.map((v, j) => ({ k: "rel", o: "=", a: Sy(v), b: N(x[j]), fl: float })) })) } : { T: "nul" }; };

const CMD = {
  /* --- Grundbefehle --- */
  evalf(a, idx) { this.fl = true; const d = idx ? idx[0] : a[1]; const f = v => { v = unwrap(v); if (typeof v === "number") return { T: "flt", v: d ? +v.toPrecision(d) : v, d }; if (isM(v)) return mmap(v, x => typeof x === "number" ? x : numOf(x)); if (isL(v) || (v && v.T === "seq")) return Object.assign({}, v, { it: v.it.map(f) }); if (v && v.k === "rel") return { k: "rel", o: v.o, a: ast(unwrap(f(v.a)).v ?? v.a), b: ast(unwrap(f(v.b)).v ?? v.b) }; if (isExpr(v)) { if (!free(v).size) return { T: "flt", v: numOf(v) }; return fltE(v, d); } return v; }; return f(a[0]); },
  diff(a) { let e = a[0]; const vs = a.slice(1).flatMap(v => v.T === "seq" ? v.it : [v]); if (isM(e)) return mmap(e, z => vs.reduce((s, v) => fin(D(s, v.n)), z)); for (const v of vs) { if (!v || v.k !== "s") throw err("diff", "zweites Argument muss eine Variable sein"); e = fin(D(e, v.n)); } return e; },
  int(a) {
    const e = a[0], r = a[1]; if (!r) throw err("int", "Integrationsvariable fehlt, z. B. int(f, x) oder int(f, x = 0..1)");
    if (isM(e)) return mmap(e, z => CMD.int([z, r]));
    if (r.k === "rel" && r.b && r.b.k === "rng") { return evalInt([ast(e), r], this); }
    if (r.k === "s") { const F = antider(e, r.n); if (F) return fin(F); return { k: "fn", n: "int", a: [ast(e), r] }; }
    throw err("int", "zweites Argument: x oder x = a..b");
  },
  Int(a) { return { k: "fn", n: "int", a: [ast(a[0]), a[1]] }; },
  value(a) { const v = a[0]; if (v && v.k === "fn" && v.n === "int") return evalInt(v.a, this); return v; },
  subs(a) { const e = a[a.length - 1]; let eqs = a.slice(0, -1).flatMap(x => x.T === "set" || x.T === "list" ? x.it : [x]); return substAll(this, e, eqs); },
  eval(a) { if (a.length < 2) return a[0]; const eqs = a[1].T === "set" || a[1].T === "list" ? a[1].it : [a[1]]; return substAll(this, a[0], eqs); },
  simplify(a) { if (!isExpr(a[0])) return a[0]; const e = simp(ast(a[0])), vs = [...free(e)]; if (vs.length) { const f = compile(e, vs); const vals = [0.37, 1.21, -0.83, 2.9].map(t => f(...vs.map((_, i) => t + 0.17 * i))); if (vals.every(v => isFinite(v) && Math.abs(v - vals[0]) < 1e-10 * Math.max(1, Math.abs(v)))) return clean(vals[0]); } return fin(e); },
  expand(a) { return isExpr(a[0]) ? fin(expand(a[0])) : a[0]; },
  factor(a) { return a[0]; }, normal(a) { return isExpr(a[0]) ? fin(simp(ast(a[0]))) : a[0]; }, combine(a) { return a[0]; },
  lhs(a) { return fin(a[0].a); }, rhs(a) { return fin(a[0].b); },
  unapply(a) { return { T: "proc", p: a.slice(1).map(v => v.n), body: { k: "lit", v: a[0] }, env: this }; },
  nops(a) { const v = a[0]; return v.T ? (v.it || v.d || []).length : 1; },
  op(a) { const v = a[a.length - 1], i = a.length > 1 ? a[0] : null; const it = v.T ? v.it : v.k === "add" ? v.t : v.k === "mul" ? v.f : [v]; return i ? it[i - 1] : { T: "seq", it }; },
  coeff(a) { const x = a[1], n = a[2] == null ? 1 : numOf(a[2]); if (!x || x.k !== "s") throw err("coeff", "zweites Argument muss eine Variable sein"); let e = isExpr(a[0]) ? a[0] : unwrap(a[0]), f = 1; for (let i = 1; i <= n; i++) { e = fin(D(e, x.n)); f *= i; } return fin(simp(A.mul(substE(ast(e), { [x.n]: N(0) }), 1 / f))); },
  max(a) { a = a.map(x => { x = unwrap(x); return x && x.T === "flt" ? x.v : x; }); const v = a.flatMap(x => x.T ? x.it.map(y => { y = unwrap(y); return y && y.T === "flt" ? y.v : isExpr(y) && !free(y).size ? numOf(y) : y; }) : [x]); return v.every(x => typeof x === "number") ? Math.max(...v) : { k: "fn", n: "max", a: v.map(ast) }; },
  min(a) { a = a.map(x => { x = unwrap(x); return x && x.T === "flt" ? x.v : x; }); const v = a.flatMap(x => x.T ? x.it.map(y => { y = unwrap(y); return y && y.T === "flt" ? y.v : isExpr(y) && !free(y).size ? numOf(y) : y; }) : [x]); return v.every(x => typeof x === "number") ? Math.min(...v) : { k: "fn", n: "min", a: v.map(ast) }; },
  binomial(a) { const [n, k] = a; let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return clean(r); },
  piecewise(a) { const c = a.map(x => ast(x)); const fv = new Set(); c.forEach(x => free(x, fv)); if (!fv.size) { const f = compile({ k: "fn", n: "piecewise", a: c }, []); return clean(f()); } return { k: "fn", n: "piecewise", a: c }; },
  print(a) { return { T: "seq", it: a }; },
  convert(a) { return a[0]; },
  /* --- Gleichungen --- */
  solve(a) { const eq = a[0], eqs = eq.T === "set" || eq.T === "list" ? eq.it : [eq], vars = a[1] ? varsOf(a[1]) : null; return solOut(solveSys(this, eqs, vars), a[1] && a[1].T === "set" || eqs.length > 1); },
  fsolve(a) { const eq = a[0], eqs = eq.T === "set" || eq.T === "list" ? eq.it : [eq]; const rg = {}; let vars = null; a.slice(1).forEach(x => { if (x.T === "set" || x.T === "list") { const it = x.it; if (it.every(y => y.k === "s")) vars = it.map(y => y.n); else it.forEach(y => { const q = varRange(y); if (q) { rg[q.v] = [q.lo, q.hi]; (vars = vars || []).push(q.v); } }); } else if (x.k === "s") vars = [x.n]; else { const q = varRange(x); if (q) { rg[q.v] = [q.lo, q.hi]; vars = (vars || []).concat(q.v); } } }); const r = solveSys(this, eqs, vars, Object.keys(rg).length ? rg : null); if (!r.one) r.sol = r.sol.slice(0, 1); return solOut(r, eqs.length > 1 || (a[1] && a[1].T === "set"), true); },
  /* --- Optimierung --- */
  Minimize(a) { return optim(this, a, 1); }, Maximize(a) { return optim(this, a, -1); },
  /* --- Vektoranalysis --- */
  Gradient(a) { const vs = varsOf(a[1]); return V(vs.map(v => fin(D(a[0], v)))); },
  Hessian(a) { const vs = varsOf(a[1]); return M(vs.length, vs.length, (i, j) => fin(D(D(a[0], vs[i]), vs[j]))); },
  /* --- Lineare Algebra --- */
  Matrix(a) { const o = optsOf(a); if (a[0] && (a[0].T === "list")) { const rows = a[0].it.map(r => unwrap(r)); if (rows.every(r => r.T === "list")) { const c = Math.max(...rows.map(r => r.it.length)); return M(rows.length, c, (i, j) => unwrap(rows[i].it[j] ?? 0)); } return M(1, rows.length, (i, j) => rows[j]); } if (typeof a[0] === "number") { const r = a[0], c = typeof a[1] === "number" ? a[1] : r; if (o.shape && optStr(o.shape) === "identity") return ident(r); const fill = a.find((x, i) => i >= 2 && !(x.k === "rel")); if (fill && fill.T === "proc") return M(r, c, (i, j) => this.apply(fill, [i + 1, j + 1])); return M(r, c, () => typeof fill === "number" ? fill : 0); } if (a[0] && a[0].T === "vec") return asMat(a[0]); throw err("Matrix", "Matrix([[a, b], [c, d]]) erwartet"); },
  Vector(a, idx) { const row = idx && idx[0] === "row"; if (a[0] && a[0].T === "list") return V(a[0].it.map(unwrap), row); if (typeof a[0] === "number") return V(Array(a[0]).fill(0), row); throw err("Vector", "Vector([a, b, c]) erwartet"); },
  IdentityMatrix(a) { return ident(a[0]); },
  Transpose(a) { const v = a[0]; if (v.T === "vec") return V(v.d, !v.row); const m = asMat(v); return M(m.c, m.r, (i, j) => m.d[j][i]); },
  Determinant(a) { return det(a[0]); },
  MatrixInverse(a) { return minv(a[0]); },
  MatrixPower(a) { return mpow(a[0], a[1]); },
  Multiply(a) { return matmul(a[0], a[1]); },
  LinearSolve(a) { if (a.length === 1) { const m = asMat(a[0]); return linsolve(M(m.r, m.c - 1, (i, j) => m.d[i][j]), V(m.d.map(r => r[m.c - 1]))); } return linsolve(a[0], a[1]); },
  NullSpace(a) { return nullspace(a[0]); },
  Rank(a) { return rref(asMat(a[0])).piv.length; },
  Trace(a) { const m = asMat(a[0]); let s = 0; for (let i = 0; i < Math.min(m.r, m.c); i++) s = A.add(s, m.d[i][i]); return s; },
  DotProduct(a) { return a[0].d.reduce((s, v, i) => A.add(s, A.mul(v, a[1].d[i])), 0); },
  Norm(a) { const v = a[0], p = a[1] == null ? Infinity : a[1]; const d = (v.T === "vec" ? v.d : asMat(v).d.flat()).map(numOf); return clean(p === Infinity || (p && p.k === "s" && p.n === "infinity") ? Math.max(...d.map(Math.abs)) : p === 1 ? d.reduce((s, x) => s + Math.abs(x), 0) : Math.hypot(...d)); },
  RowDimension(a) { return asMat(a[0]).r; }, ColumnDimension(a) { return asMat(a[0]).c; },
  Eigenvalues(a) { const m = asMat(a[0]); if (m.r !== m.c || !allNum(m)) throw err("Eigenvalues", "nur numerische quadratische Matrizen"); const n = m.r; const p = x => det(M(n, n, (i, j) => m.d[i][j] - (i === j ? x : 0))); const ev = roots1(p, -1e3, 1e3); return V(ev); },
  /* --- Kurvenanpassung --- */
  PolynomialInterpolation(a) { let xs, ys, x; if (a.length >= 3 && a[0].T === "list" && a[1].T === "list") { xs = a[0].it.map(numOf); ys = a[1].it.map(numOf); x = a[2].n; } else { const P = pointsOf(a[0]); xs = P.map(p => p[0]); ys = P.map(p => p[1]); x = a[1].n; } if (new Set(xs).size !== xs.length) throw err("PolynomialInterpolation", "die x-Werte müssen verschieden sein"); return fin(polyAst(polyInterp(xs, ys), x)); },
  Spline(a) { let xs, ys, x, rest; if (a[0].T === "list" && a[1].T === "list") { xs = a[0].it.map(numOf); ys = a[1].it.map(numOf); x = a[2].n; rest = a.slice(3); } else { const P = pointsOf(a[0]); xs = P.map(p => p[0]); ys = P.map(p => p[1]); x = a[1].n; rest = a.slice(2); } const o = optsOf(rest), dg = o.degree ? numOf(o.degree) : 3, ep = o.endpoints ? optStr(o.endpoints) : "natural"; const ord = xs.map((v, i) => i).sort((i, j) => xs[i] - xs[j]); xs = ord.map(i => xs[i]); ys = ord.map(i => ys[i]); if (dg === 1) { const args = []; for (let i = 0; i < xs.length - 1; i++) { const k = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]); if (i < xs.length - 2) args.push({ k: "rel", o: "<", a: Sy(x), b: N(xs[i + 1]) }); args.push(simp({ k: "add", t: [N(ys[i] - k * xs[i]), { k: "mul", f: [N(k), Sy(x)] }] })); } return { k: "fn", n: "piecewise", a: args }; } const sp = splineAst(spline(xs, ys, ep), x); sp.a = sp.a.map((t, i) => i % 2 === 0 && i < sp.a.length - 1 ? t : fltE(t)); return sp; },
  LeastSquares(a) { let xs, ys, x, rest; if (a[0].T === "list" && a[1].T === "list") { xs = a[0].it.map(numOf); ys = a[1].it.map(numOf); x = a[2].n; rest = a.slice(3); } else { const P = pointsOf(a[0]); xs = P.map(p => p[0]); ys = P.map(p => p[1]); x = a[1].n; rest = a.slice(2); } const o = optsOf(rest); let curve = o.curve ? ast(o.curve) : { k: "add", t: [Sy("_a"), { k: "mul", f: [Sy("_b"), Sy(x)] }] }; const params = [...free(curve)].filter(v => v !== x).sort(); const p = leastSquares(xs, ys, curve, x, params); return fitRes(curve, params, p); },
  NonlinearFit(a) { const model = ast(a[0]); let xs, ys, x; if (a[1].T === "list" && a[2].T === "list") { xs = a[1].it.map(numOf); ys = a[2].it.map(numOf); x = a[3].n; } else if (isM(a[1]) && isM(a[2])) { xs = a[1].d.map(numOf); ys = a[2].d.map(numOf); x = a[3].n; } else { const P = pointsOf(a[1]); xs = P.map(p => p[0]); ys = P.map(p => p[1]); x = a[2].n; } const o = optsOf(a); const params = [...free(model)].filter(v => v !== x).sort(); let st = null; if (o.initialvalues) { const iv = unwrap(o.initialvalues); const m = {}; (iv.it || []).forEach(q => m[q.a.n] = numOf(q.b)); st = params.map(v => m[v] != null ? m[v] : 1); } const p = nonlinFit(xs, ys, model, x, params, st); return fitRes(model, params, p, true); },
  Fit(a) { return CMD.NonlinearFit.call(this, a); },
  limit(a) { const e = ast(a[0]), r = a[1]; if (!r || r.k !== "rel") throw err("limit", "limit(f, n = infinity) oder limit(f, x = a) erwartet"); const v = r.a.n, to = r.b, f = compile(e, [v]); const inf = (to.k === "n" && to.v === Infinity) || (to.k === "s" && to.n === "infinity") ? 1 : to.k === "n" && to.v === -Infinity ? -1 : to.k === "neg" || (to.k === "mul" && JSON.stringify(to).includes("infinity")) ? -1 : 0;
    const seqv = inf ? [1e5, 1e7, 1e9].map(x => f(inf * x)) : (() => { const c = numOf(to); return [1e-4, 1e-6, 1e-8].map(h => (f(c + h) + f(c - h)) / 2); })();
    const L = seqv[2]; if (!isFinite(L)) return L > 0 ? Sy("infinity") : Sy("-infinity"); if (Math.abs(seqv[2] - seqv[1]) > 1e-4 * Math.max(1, Math.abs(L))) return Math.abs(L) > 1e6 ? Sy(L > 0 ? "infinity" : "-infinity") : { k: "fn", n: "limit", a: [e, r] };
    for (let q = 1; q <= 200; q++) { const p = Math.round(L * q); if (Math.abs(L - p / q) < 1e-7 * Math.max(1, Math.abs(L))) return clean(p / q); } const fp = frac(L / Math.PI, 60); if (fp && Math.abs(L - fp[0] / fp[1] * Math.PI) < 1e-6) return clean(fp[0] / fp[1] * Math.PI); if (Math.abs(L - Math.E) < 1e-6) return { k: "fn", n: "exp", a: [N(1)] }; return clean(+L.toPrecision(10)); },
  LinearFit(a) { const basis = a[0].it.map(ast); let xs, ys, x; if (a[1].T === "list" && a[2].T === "list") { xs = a[1].it.map(numOf); ys = a[2].it.map(numOf); x = a[3].n; } else { const P = pointsOf(a[1]); xs = P.map(p => p[0]); ys = P.map(p => p[1]); x = a[2].n; } const params = basis.map((_, i) => "_c" + i); const model = { k: "add", t: basis.map((b, i) => ({ k: "mul", f: [Sy(params[i]), b] })) }; const p = leastSquares(xs, ys, model, x, params); return fitRes(model, params, p); },
  Mean(a) { const d = a[0].T === "list" ? a[0].it.map(numOf) : a[0].d.map(numOf); return clean(d.reduce((s, v) => s + v, 0) / d.length); }
};
CMD.sqrt = null; delete CMD.sqrt;
/* Plot-Befehle werden in maple-ui.js ergänzt (MPL.CMD) */
MPL.CMD = CMD;

/* Ausgleichsergebnis: exakt anzeigen, wenn alle Parameter „schöne“ Zahlen sind (wie Maple bei ganzzahligen Daten), sonst als Gleitkommazahlen */
function fitRes(model, params, p, float) { const r = fin(simp(substE(model, Object.fromEntries(params.map((v, i) => [v, N(p[i])]))))); if (!float && p.every(v => { const q = recog(v); return q.int != null || q.dec != null || (q.q && !q.pi && !q.sq); })) return r; return typeof r === "number" ? { T: "flt", v: r } : fltE(r); }
function fltE(e, d) { if (typeof e === "number") return { T: "flt", v: e }; if (!e || typeof e !== "object" || !e.k) return e; const r = JSON.parse(JSON.stringify(e)); (function walk(x) { if (!x || typeof x !== "object") return; if (x.k === "n") x.fl = true; ["t", "f", "a", "it"].forEach(k => Array.isArray(x[k]) && x[k].forEach(walk)); if (x.b && typeof x.b === "object") walk(x.b); if (x.e && typeof x.e === "object") walk(x.e); })(r); r.flt = true; return r; }
function substE(e, map) {
  if (typeof e === "number") return N(e);
  if (!e || !e.k) return e;
  switch (e.k) {
    case "s": return e.n in map ? ast(map[e.n]) : e;
    case "add": return { k: "add", t: e.t.map(t => substE(t, map)) };
    case "mul": return { k: "mul", f: e.f.map(t => substE(t, map)) };
    case "pow": return { k: "pow", b: substE(e.b, map), e: substE(e.e, map) };
    case "fn": if (e.n === "int" && e.a[1] && e.a[1].k === "rel") { const v = e.a[1].a.n, m2 = Object.assign({}, map); delete m2[v]; return { k: "fn", n: "int", a: [substE(e.a[0], m2), { k: "rel", o: "=", a: e.a[1].a, b: { k: "rng", a: substE(e.a[1].b.a, map), b: substE(e.a[1].b.b, map) } }] }; } return { k: "fn", n: e.n, a: e.a.map(t => isExpr(t) ? substE(t, map) : t) };
    case "rel": return { k: "rel", o: e.o, a: substE(e.a, map), b: substE(e.b, map) };
    default: return e;
  }
}
/* geschützte Namen wie in Maple (D ist der Differentialoperator, I die imaginäre Einheit …) */
const PROTECTED = new Set(["D", "I", "Pi", "sin", "cos", "tan", "exp", "ln", "log", "sqrt", "abs", "int", "diff", "sum", "evalf", "solve", "fsolve", "plot", "Matrix", "Vector", "max", "min", "seq", "add", "subs", "eval", "true", "false", "infinity", "gamma", "Digits_"]);
/* volle Auswertung wie in Maple: Namen in gespeicherten Ausdrücken, die inzwischen einen Wert haben, werden beim Gebrauch eingesetzt */
function fullEval(S, v, self, depth) {
  const u = unwrap(v); if (depth > 8 || !u || typeof u !== "object" || u.T === "proc" || u.T === "plot" || u.T === "str") return v;
  if (!(isExpr(u) || isM(u) || isL(u))) return v;
  const js = JSON.stringify(u), eqs = [];
  for (const k in S.env) if (k !== self && js.includes('"n":"' + k + '"')) { const w = unwrap(fullEval(S, S.env[k], k, depth + 1)); if (typeof w === "number" || isExpr(w)) { eqs.push({ k: "rel", o: "=", a: Sy(k), b: ast(w) }); if (S.taint.has(k)) S.fl = true; } }
  return eqs.length ? substAll(S, u, eqs) : v;
}
function substAll(S, e, eqs) {
  const map = {}; eqs.forEach(q => { if (q && q.k === "rel" && q.a.k === "s") { const b = unwrap(q.b); map[q.a.n] = typeof b === "number" ? N(b) : b; } });
  const one = v => { v = unwrap(v); if (isM(v)) return mmap(v, one); if (isL(v) || (v && v.T === "seq")) return Object.assign({}, v, { it: v.it.map(one) }); if (isExpr(v)) { const r = simp(substE(ast(v), map)); if (r.k === "fn" && r.n === "int") return evalInt(r.a, S); return fin(r); } return v; };
  return one(e);
}
function evalInt(args, S) {
  const e = ast(args[0]), r = args[1], v = r.a.n;
  const lo = ast(r.b.a), hi = ast(r.b.b), fv = free(e); fv.delete(v); free(lo, fv); free(hi, fv);
  if (fv.size) { const F = antider(e, v); if (F) return fin(simp({ k: "add", t: [substE(F, { [v]: hi }), { k: "mul", f: [N(-1), substE(F, { [v]: lo })] }] })); return { k: "fn", n: "int", a: [e, { k: "rel", o: "=", a: Sy(v), b: { k: "rng", a: lo, b: hi } }] }; }
  const f = compile(e, [v]), a = numOf(lo), b = numOf(hi);
  /* exakter Wert über Stammfunktion, wenn möglich (genauer), sonst numerisch */
  const F = antider(e, v); if (F && isFinite(a) && isFinite(b)) { const g = compile(F, [v]); const val = g(b) - g(a); const chk = simpson(t => f(t), a, b); if (isFinite(val) && Math.abs(val - chk) < 1e-6 * Math.max(1, Math.abs(val))) return clean(val); }
  const val = simpson(t => f(t), a, b); if (!isFinite(val)) throw err("int", "das Integral konvergiert nicht"); return val;
}
function optim(S, a, sgn) {
  const e = ast(exprOf(a[0])), o = optsOf(a), vars = [...free(e)].sort(); if (!vars.length) throw err("Minimize", "keine Variablen");
  const f = compile(e, vars), rg = {}; a.slice(1).forEach(x => { const q = varRange(x); if (q) rg[q.v] = [q.lo, q.hi]; if (x && (x.T === "set" || x.T === "list")) x.it.forEach(y => { const q2 = varRange(y); if (q2) rg[q2.v] = [q2.lo, q2.hi]; }); });
  const pen = x => vars.reduce((s, v, j) => s + (rg[v] ? (x[j] < rg[v][0] ? 1e6 * (rg[v][0] - x[j]) ** 2 + 1e3 : x[j] > rg[v][1] ? 1e6 * (x[j] - rg[v][1]) ** 2 + 1e3 : 0) : 0), 0);
  const g = x => { const v = sgn * f(...x); return (isFinite(v) ? v : 1e300) + pen(x); };
  let starts = startGrid(vars.length).slice(0, 400); if (o.initialpoint) { const ip = unwrap(o.initialpoint), m = {}; (ip.it || []).forEach(q => m[q.a.n] = numOf(q.b)); starts = [vars.map(v => m[v] ?? 0)]; }
  if (Object.keys(rg).length) starts = starts.concat(Array.from({ length: 60 }, () => vars.map(v => rg[v] ? rg[v][0] + Math.random() * (rg[v][1] - rg[v][0]) : (Math.random() - .5) * 10)));
  let best = null; for (const s of starts) { const r = nelder(g, s); if (!best || r.f < best.f) best = r; }
  const x = best.x.map(v => clean(+v.toPrecision(10)));
  return { T: "list", it: [{ T: "flt", v: clean(+f(...x).toPrecision(10)) }, { T: "list", it: vars.map((v, j) => ({ k: "rel", o: "=", a: Sy(v), b: N(x[j]), fl: true })) }] };
}

Object.assign(MPL, { lex, parseProgram, Session, simp, D, antider, expand, compile, simpson, roots1, rootsN, solveSq, polyInterp, spline, leastSquares, nonlinFit, nelder, txt, html, numHTML, numTxt, recog, A, M, V, matmul, det, minv, linsolve, nullspace, ast, fin, unwrap, numOf, free, substE, optsOf, optStr, varRange, pointsOf, err, isM, isExpr, flat, fmtF, esc, GREEK });
/* Ausdrücke direkt aus Text (für Grafiken und Aufgaben): MPL.ex("x^2-y^2") → AST, MPL.fn("x^2", ["x"]) → JS-Funktion */
MPL.ex = src => { const s = new Session(); return ast(unwrap(s.ev(parseProgram(src)[0].e))); };
MPL.fn = (src, vars) => compile(MPL.ex(src), vars);
})(typeof window !== "undefined" ? window : globalThis);
