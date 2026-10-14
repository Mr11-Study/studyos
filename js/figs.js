/* Bilder & Animationen für Lektionen und Skript.
   Block in einer Lektion: { t: "fig", id: "itf-nist" }  →  Grafik aus window.STUDYOS_FIG[id].
   Eine Grafik: { title, svg: () => "<svg …>", steps: ["Text Schritt 1", …] }   (Schritt-für-Schritt-Animation)
            oder { title, svg, cap, ui: () => "<input …>", update: root => {} }  (interaktiv, z. B. Schieberegler)
   In der SVG: data-st="2" = erscheint ab Schritt 2 · data-on="1,3" = nur in diesen Schritten sichtbar ·
               data-hl="2" = in Schritt 2 hervorgehoben. Farben über Klassen (fx-acc, fx-ok …), damit hell/dunkel und App-Design passen.
   Diese Datei wird VOR den Kursdateien mit Grafiken geladen (index.html). */
(function () {
const FIG = window.STUDYOS_FIG = window.STUDYOS_FIG || {};
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const at = o => (o.st != null ? ` data-st="${o.st}"` : "") + (o.on != null ? ` data-on="${o.on}"` : "") + (o.hl != null ? ` data-hl="${o.hl}"` : "") + (o.id ? ` id="${o.id}"` : "");

/* ---------- Zeichen-Bausteine (Koordinaten im viewBox, Schrift ~12–13) ---------- */
const FX = window.FX = {
  esc,
  svg: (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" role="img" xmlns="http://www.w3.org/2000/svg"><defs>
    <marker id="fxa" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="fx-ah"/></marker>
    <marker id="fxa2" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="fx-ah2"/></marker></defs>${body}</svg>`,
  g: (o, body) => `<g class="${o.cls || ""}"${at(o)}${o.tf ? ` transform="${o.tf}"` : ""}>${body}</g>`,
  t: (x, y, s, o = {}) => `<text x="${x}" y="${y}" class="fx-t ${o.cls || ""}" text-anchor="${o.a || "middle"}"${o.fs ? ` font-size="${o.fs}"` : ""}${o.fw ? ` font-weight="${o.fw}"` : ""}${at(o)}>${s}</text>`,
  /* mehrzeiliger Text: Zeilen mit | trennen */
  tl: (x, y, s, o = {}) => { const ls = String(s).split("|"), lh = o.lh || 15; return `<text x="${x}" y="${y - (ls.length - 1) * lh / 2}" class="fx-t ${o.cls || ""}" text-anchor="${o.a || "middle"}"${o.fs ? ` font-size="${o.fs}"` : ""}${o.fw ? ` font-weight="${o.fw}"` : ""}${at(o)}>${ls.map((l, i) => `<tspan x="${x}" dy="${i ? lh : 0}">${l}</tspan>`).join("")}</text>`; },
  r: (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 8 : o.rx}" class="${o.cls || "fx-card"}"${at(o)}/>`,
  /* Box mit Beschriftung (label darf | für Zeilenumbruch enthalten) */
  box: (x, y, w, h, label, o = {}) => `<g class="fx-box ${o.cls || "fx-card"}"${at(o)}><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 8 : o.rx}"/>${FX.tl(x + w / 2, y + h / 2 + 4.5, label, { fs: o.fs, fw: o.fw || 600, lh: o.lh })}${o.sub ? FX.t(x + w / 2, y + h - 7, o.sub, { cls: "fx-sub", fs: 10 }) : ""}</g>`,
  c: (x, y, r, o = {}) => `<circle cx="${x}" cy="${y}" r="${r}" class="${o.cls || "fx-acc"}"${at(o)}/>`,
  l: (x1, y1, x2, y2, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="fx-ln ${o.cls || ""}${o.flow ? " fx-flow" : ""}"${o.arrow ? ` marker-end="url(#${o.acc ? "fxa2" : "fxa"})"` : ""}${o.both ? ` marker-start="url(#${o.acc ? "fxa2" : "fxa"})"` : ""}${at(o)}/>`,
  p: (d, o = {}) => `<path d="${d}" class="fx-ln ${o.cls || ""}${o.flow ? " fx-flow" : ""}"${o.arrow ? ` marker-end="url(#${o.acc ? "fxa2" : "fxa"})"` : ""}${at(o)}/>`,
  /* Datenpaket, das entlang eines Pfads läuft */
  dot: (d, o = {}) => `<circle r="${o.r || 4.5}" class="${o.cls || "fx-acc"}"${at(o)}><animateMotion dur="${o.dur || 2.2}s" repeatCount="indefinite"${o.begin ? ` begin="${o.begin}s"` : ""} path="${d}"/></circle>`,
  /* kleine Symbole */
  cloud: (x, y, s = 1, o = {}) => `<path transform="translate(${x} ${y}) scale(${s})" d="M-34 14 a14 14 0 0 1 2-28 a20 20 0 0 1 38-6 a15 15 0 0 1 28 10 a12 12 0 0 1 0 24 z" class="${o.cls || "fx-soft"}"${at(o)}/>`,
  server: (x, y, o = {}) => `<g class="fx-ico ${o.cls || ""}"${at(o)}>${[0, 1, 2].map(i => `<rect x="${x - 16}" y="${y - 20 + i * 13}" width="32" height="11" rx="2.5"/><circle cx="${x + 10}" cy="${y - 14.5 + i * 13}" r="1.8" class="fx-led"/>`).join("")}</g>`,
  user: (x, y, o = {}) => `<g class="fx-ico ${o.cls || ""}"${at(o)}><circle cx="${x}" cy="${y - 9}" r="7"/><path d="M${x - 12} ${y + 12} a12 11 0 0 1 24 0 z"/></g>`,
  db: (x, y, o = {}) => `<g class="fx-ico ${o.cls || ""}"${at(o)}><path d="M${x - 14} ${y - 12} v22 a14 5 0 0 0 28 0 v-22"/><ellipse cx="${x}" cy="${y - 12}" rx="14" ry="5"/></g>`,
  laptop: (x, y, o = {}) => `<g class="fx-ico ${o.cls || ""}"${at(o)}><rect x="${x - 14}" y="${y - 12}" width="28" height="18" rx="2"/><path d="M${x - 19} ${y + 8} h38 l-3 4 h-32 z"/></g>`,
  phone: (x, y, o = {}) => `<g class="fx-ico ${o.cls || ""}"${at(o)}><rect x="${x - 8}" y="${y - 14}" width="16" height="28" rx="3"/></g>`,
  lock: (x, y, o = {}) => `<g class="fx-ico ${o.cls || ""}"${at(o)}><path d="M${x - 6} ${y - 3} v-5 a6 6 0 0 1 12 0 v5" fill="none" stroke-width="2.5"/><rect x="${x - 9}" y="${y - 3}" width="18" height="13" rx="2.5"/></g>`,
  key: (x, y, o = {}) => `<g class="fx-ico ${o.cls || ""}"${at(o)}><circle cx="${x - 6}" cy="${y}" r="6"/><rect x="${x - 1}" y="${y - 2}" width="16" height="4" rx="1"/><rect x="${x + 10}" y="${y}" width="3" height="6"/></g>`,
  /* Achsen für kleine Diagramme */
  axes: (x, y, w, h, xl, yl) => `<g class="fx-axis"><line x1="${x}" y1="${y + h}" x2="${x + w}" y2="${y + h}" marker-end="url(#fxa)"/><line x1="${x}" y1="${y + h}" x2="${x}" y2="${y}" marker-end="url(#fxa)"/></g>${xl ? FX.t(x + w, y + h + 15, xl, { a: "end", cls: "fx-sub", fs: 10.5 }) : ""}${yl ? FX.t(x + 4, y - 6, yl, { a: "start", cls: "fx-sub", fs: 10.5 }) : ""}`,
  fmt: (n, d = 2) => Number(n).toLocaleString("de-AT", { minimumFractionDigits: d, maximumFractionDigits: d })
};

/* ---------- HTML eines Grafik-Blocks ---------- */
FX.html = (b, opt = {}) => {
  const f = FIG[b.id]; if (!f) return "";
  const n = (f.steps || []).length;
  return `<figure class="fig${opt.cls ? " " + opt.cls : ""}" data-fig="${esc(b.id)}" data-s="0">
    <div class="fig-head"><span class="eyebrow">${n ? "Animation · Schritt für Schritt" : f.ui ? "Zum Ausprobieren" : "Grafik"}</span><b>${f.title}</b></div>
    <div class="fig-stage">${f.svg()}</div>
    ${n ? `<div class="fig-cap" aria-live="polite">${f.steps[0]}</div>
      <div class="fig-ctl"><button class="btn sm" data-fs="-1" disabled aria-label="Zurück">◀</button><span class="fig-dots">${f.steps.map((_, i) => `<i data-fgo="${i}" class="${i ? "" : "on"}"></i>`).join("")}</span><button class="btn sm pri" data-fs="1">Weiter ▶</button><button class="btn sm ghost" data-fplay>⟳ Abspielen</button></div>`
      : `${f.ui ? `<div class="fig-ui">${f.ui()}</div>` : ""}${f.cap ? `<figcaption class="fig-cap">${f.cap}</figcaption>` : ""}`}
  </figure>`;
};

const setStep = (root, k) => {
  const f = FIG[root.dataset.fig]; if (!f || !f.steps) return; const n = f.steps.length;
  k = Math.max(0, Math.min(n - 1, k)); root.dataset.s = k;
  root.querySelectorAll("[data-st]").forEach(e => e.classList.toggle("fx-in", k >= +e.dataset.st));
  root.querySelectorAll("[data-on]").forEach(e => e.classList.toggle("fx-in", e.dataset.on.split(",").map(Number).includes(k)));
  root.querySelectorAll("[data-hl]").forEach(e => e.classList.toggle("fx-hl", e.dataset.hl.split(",").map(Number).includes(k)));
  const cap = root.querySelector(".fig-cap"); if (cap) cap.innerHTML = `<b>${k + 1}/${n}</b> ${f.steps[k]}`;
  root.querySelectorAll(".fig-dots i").forEach((d, i) => d.classList.toggle("on", i <= k));
  const pv = root.querySelector("[data-fs='-1']"), nx = root.querySelector("[data-fs='1']");
  if (pv) pv.disabled = k === 0; if (nx) { nx.disabled = k === n - 1; nx.textContent = k === n - 1 ? "Fertig ✓" : "Weiter ▶"; }
  if (f.onStep) f.onStep(root, k);
};
const stop = root => { if (root._play) { clearInterval(root._play); root._play = null; const b = root.querySelector("[data-fplay]"); if (b) b.textContent = "⟳ Abspielen"; } };
const mount = root => {
  if (root._fx) return; root._fx = 1; const f = FIG[root.dataset.fig]; if (!f) return;
  if (f.steps) setStep(root, 0);
  if (f.update) { try { f.update(root); } catch (e) { console.error(e); } }
};
FX.mountAll = (el = document) => el.querySelectorAll(".fig[data-fig]").forEach(mount);

document.addEventListener("click", e => {
  const root = e.target.closest(".fig[data-fig]"); if (!root) return;
  const k = +root.dataset.s || 0, fs = e.target.closest("[data-fs]"), go = e.target.closest("[data-fgo]"), pl = e.target.closest("[data-fplay]");
  if (fs) { stop(root); setStep(root, k + +fs.dataset.fs); }
  else if (go) { stop(root); setStep(root, +go.dataset.fgo); }
  else if (pl) {
    if (root._play) return stop(root);
    const n = FIG[root.dataset.fig].steps.length; setStep(root, 0); pl.textContent = "■ Stopp";
    root._play = setInterval(() => { if (!root.isConnected) return stop(root); const s = +root.dataset.s; if (s >= n - 1) return stop(root); setStep(root, s + 1); }, 2800);
  }
});
document.addEventListener("input", e => { const root = e.target.closest(".fig[data-fig]"); if (!root) return; const f = FIG[root.dataset.fig]; if (f && f.update) f.update(root); });
/* Grafiken werden als HTML-Text eingefügt (Lektion, Skript, Bibliothek) – neue automatisch starten */
const obs = () => new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) { if (n.matches && n.matches(".fig[data-fig]")) mount(n); else if (n.querySelector && n.querySelector(".fig[data-fig]")) FX.mountAll(n); } }).observe(document.body, { childList: true, subtree: true });
if (document.body) obs(); else document.addEventListener("DOMContentLoaded", obs);
})();
