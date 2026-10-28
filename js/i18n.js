/* StudyOS · Sprache der App
   Alle Inhalte sind auf Deutsch geschrieben. Für eine andere Sprache übersetzt der eingebaute Übersetzer des Browsers
   (Translator API, läuft auf dem Gerät und nach dem ersten Download offline) jeden sichtbaren Text, auch nach jedem Seitenwechsel.
   Hat der Browser diesen Übersetzer nicht (z. B. am Handy), übersetzt der Google-Übersetzer-Baustein online.
   Code, Maple-Eingaben und Formeln bleiben unverändert. Muss vor apps.js geladen werden. */
(function () {
const { $, $$, esc, PAGES } = App;
const S = () => App.S();
const LANGS = [["de", "Deutsch (Original)"], ["en", "English"], ["es", "Español"], ["fr", "Français"], ["it", "Italiano"], ["pt", "Português"], ["nl", "Nederlands"],
  ["pl", "Polski"], ["cs", "Čeština"], ["hr", "Hrvatski"], ["sr", "Srpski"], ["sl", "Slovenščina"], ["hu", "Magyar"], ["ro", "Română"], ["tr", "Türkçe"], ["ru", "Русский"],
  ["uk", "Українська"], ["ar", "العربية"], ["zh", "中文"], ["ja", "日本語"], ["ko", "한국어"], ["hi", "हिन्दी"]];
const lang = () => (S().settings && S().settings.lang) || "de";
const hasAPI = () => "Translator" in self;
/* Übersetzer: „google“ (online, versteht ganze Sätze, schnell), „device“ (im Browser, offline, Satzteile einzeln). Standard: online, ohne Internet auf dem Gerät. */
const engine = () => (S().settings && S().settings.trEngine) || "google";

let tr = null, on = false, obs = null;
const orig = new WeakMap(), mine = new WeakMap();
let cache = {};
const cacheKey = () => "studyos.tr." + lang();
const loadCache = () => { try { cache = JSON.parse(localStorage.getItem(cacheKey()) || "{}"); } catch (e) { cache = {}; } };
let saveT; const saveCache = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { const k = Object.keys(cache); if (k.length > 20000) k.slice(0, k.length - 20000).forEach(x => delete cache[x]); localStorage.setItem(cacheKey(), JSON.stringify(cache)); } catch (e) {} }, 1500); };

const SKIP = "script,style,code,pre,textarea,input,select,svg,math,.katex,.mw-in,.mw-code,.mw-out,[translate=no],.notranslate";
const worth = t => /[A-Za-zÄÖÜäöüß]{2}/.test(t);
const inflight = new Map();
async function trText(t) {
  const core = t.trim(); if (!worth(core)) return t;
  let out = cache[core];
  if (out === undefined) {
    if (!inflight.has(core)) inflight.set(core, tr.translate(core).then(r => { cache[core] = r; saveCache(); return r; }, () => null).finally(() => inflight.delete(core)));
    out = await inflight.get(core); if (out == null) return t;
  }
  return t.replace(core, out);
}
/* sichtbare Texte zuerst, mehrere gleichzeitig: so ist das, was man gerade sieht, schnell übersetzt */
const POOL = 4, POOL_ON = 200;
async function runPool(jobs) { let i = 0; await Promise.all(Array.from({ length: Math.min(tr === online ? POOL_ON : POOL, jobs.length) }, async () => { while (i < jobs.length) await jobs[i++](); })); }
const topOf = n => { const e = n.parentElement; if (!e) return 1e9; const r = e.getBoundingClientRect(); return r.bottom < 0 ? 1e6 + -r.bottom : r.top > innerHeight ? 1e6 + r.top : r.top; };
async function walk(root) {
  if (!on || !root) return;
  const nodes = [];
  if (root.nodeType === 3) nodes.push(root);
  else if (root.nodeType === 1 && !root.closest(SKIP)) { const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement && !n.parentElement.closest(SKIP) ? 1 : 2 }); while (w.nextNode()) nodes.push(w.currentNode); }
  const todo = nodes.filter(n => mine.get(n) !== n.data && worth(n.data));
  const quick = [], slow = [];
  todo.forEach(n => { const c = cache[n.data.trim()]; if (c !== undefined) { orig.set(n, n.data); n.data = n.data.replace(n.data.trim(), c); mine.set(n, n.data); } else slow.push(n); });
  slow.sort((a, b) => topOf(a) - topOf(b));
  const uniq = new Set(slow.map(n => n.data.trim()).filter(t => cache[t] === undefined)).size;
  if (uniq) prog.add(uniq); else prog.seen();
  const counted = new Set();
  await runPool(slow.map(n => async () => { const src = n.data, k = src.trim(); orig.set(n, src); const out = await trText(src); if (!counted.has(k)) { counted.add(k); prog.tick(); } if (n.data === src) { n.data = out; mine.set(n, out); } }));
  prog.sync(counted.size, uniq);
  if (root.nodeType === 1) for (const el of root.querySelectorAll("[placeholder],[title]")) for (const a of ["placeholder", "title"]) {
    const v = el.getAttribute(a); if (!v || el.dataset["tr" + a] === v) continue;
    const out = await trText(v); el.setAttribute(a, out); el.dataset["tr" + a] = out;
  }
}
/* Abbrechen: zurück auf Deutsch. Was schon übersetzt wurde, bleibt im Cache und geht beim nächsten Mal sofort. */
function stop() { on = false; if (obs) obs.disconnect(); S().settings.lang = "de"; App.save(); App.toast && App.toast("Übersetzung abgebrochen", "StudyOS zeigt wieder Deutsch. Unter Einstellungen › Sprache kannst du es erneut versuchen.", "文"); setTimeout(() => location.reload(), 600); }
/* Ladeanzeige: beim ersten Übersetzen ein Ladebildschirm mit Fortschritt, bei jedem Seitenwechsel ein kurzer
   Ladebildschirm für die neue Seite, sonst (Texte, die nachträglich auftauchen) ein kleiner Hinweis oben */
const NAME = () => (LANGS.find(x => x[0] === lang()) || [, lang()])[1];
const PAGE_MIN = 550;
const prog = (() => {
  let total = 0, done = 0, el = null, mode = "", first = true, t = null, hideT = null, since = 0, lastR = null;
  const ui = () => {
    if (!el) { el = document.createElement("div"); el.id = "tr-load"; el.setAttribute("translate", "no"); el.className = "notranslate"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite"); document.body.appendChild(el);
      el.addEventListener("click", e => { if (e.target.closest("#tr-bg")) { mode = "pill"; paint(); } if (e.target.closest("#tr-stop")) stop(); }); }
    return el; };
  const paint = () => {
    if (!el) return; const pct = total ? Math.min(100, Math.round(100 * done / total)) : 0, fin = done >= total;
    el.className = "notranslate " + mode + (fin ? " fin" : "");
    el.innerHTML = mode === "full"
      ? `<div class="trl-box"><div class="trl-ic" aria-hidden="true">文</div><b>${fin ? "Fertig übersetzt" : "StudyOS wird übersetzt"}</b><span class="trl-lang">Deutsch → ${esc(NAME())}</span>
         <div class="trl-bar"><i style="width:${pct}%"></i></div><small>${fin ? "Alles bereit." : `${done} von ${total} Texten · ${pct} %`}</small>
         ${fin ? "" : `<div class="trl-act"><button class="btn ghost sm" id="tr-stop">Abbrechen</button><button class="btn sm" id="tr-bg">Im Hintergrund weiter</button></div><small class="trl-note">Beim ersten Mal dauert es etwas. Danach merkt sich StudyOS die Übersetzungen.</small>`}</div>`
      : mode === "page"
      ? `<div class="trl-box"><div class="trl-ic" aria-hidden="true">${fin ? "✓" : "文"}</div><b>${fin ? "Seite übersetzt" : "Seite wird übersetzt"}</b><span class="trl-lang">Deutsch → ${esc(NAME())}</span>
         <div class="trl-bar"><i style="width:${fin ? 100 : pct}%"></i></div>${fin ? "" : `<button class="trl-x" id="tr-stop" title="Abbrechen, Deutsch anzeigen">Abbrechen</button>`}</div>`
      : `<span class="trl-ic" aria-hidden="true">${fin ? "✓" : "文"}</span><span>${fin ? "Übersetzt" : `Übersetze … ${pct} %`}</span><i class="trl-mini"><b style="width:${pct}%"></b></i>${fin ? "" : `<button class="trl-x" id="tr-stop" aria-label="Übersetzung abbrechen" title="Abbrechen, Deutsch anzeigen">✕</button>`}`;
  };
  const finish = () => { paint(); if (hideT) return;
    /* der Seiten-Ladebildschirm bleibt kurz stehen, damit man sieht, dass übersetzt wurde */
    const wait = mode === "full" ? 700 : mode === "page" ? Math.max(250, PAGE_MIN - (Date.now() - since)) : 900;
    hideT = setTimeout(() => { hideT = null; if (done < total) return; const gone = el; gone && gone.classList.add("out"); el = null; total = done = 0; mode = ""; setTimeout(() => gone && gone.remove(), 300); }, wait); first = false; };
  return {
    add(n) { clearTimeout(hideT); hideT = null; if (total === 0) done = 0; total += n;
      const R = App.route && App.route(), nav = lastR !== null && R !== lastR; lastR = R;
      if (first) { mode = "full"; ui(); paint(); }
      else if (nav && mode !== "full") { clearTimeout(t); t = null; if (mode !== "page") since = Date.now(); mode = "page"; ui(); paint(); }
      else if (!el && !t) t = setTimeout(() => { t = null; if (done < total) { mode = "pill"; ui(); paint(); } }, 350);
      else if (el) paint(); },
    tick() { done++; if (el) { if (done >= total) finish(); else paint(); } else if (done >= total) { first = false; total = done = 0; } },
    sync() { if (total && done >= total) { if (el) finish(); else { first = false; total = done = 0; } } },
    seen() { lastR = App.route && App.route(); }
  };
})();
function start() {
  on = true; document.documentElement.lang = lang(); loadCache();
  walk(document.body);
  let queue = new Set(), t = null;
  obs = new MutationObserver(ms => {
    ms.forEach(m => { if (m.type === "characterData") { if (mine.get(m.target) !== m.target.data) queue.add(m.target); } else m.addedNodes.forEach(n => queue.add(n)); });
    if (!t) t = setTimeout(() => { t = null; const q = [...queue]; queue = new Set(); q.forEach(n => n.isConnected && walk(n)); }, 30); /* kein Debounce: Seiten, die laufend neu zeichnen, würden sonst nie übersetzt */
  });
  obs.observe(document.body, { childList: true, subtree: true, characterData: true });
}

/* Übersetzer holen. Beim ersten Mal lädt der Browser das Sprachpaket herunter, das braucht einen Klick (gesture=true). */
async function ready(gesture, onProgress) {
  if (!hasAPI()) return "noapi";
  const opts = { sourceLanguage: "de", targetLanguage: lang() };
  const limit = (pr, ms) => Promise.race([pr, new Promise((_, no) => setTimeout(() => no(new Error("timeout")), ms))]); /* hängt der Download, nimmt StudyOS den Online-Übersetzer */
  let av; try { av = await limit(Translator.availability(opts), 5000); } catch (e) { return "unavailable"; }
  if (av === "unavailable") return "unavailable";
  if (av !== "available" && !gesture) return "needs-click";
  try { tr = await limit(Translator.create(Object.assign(opts, { monitor(m) { m.addEventListener("downloadprogress", e => onProgress && onProgress(e.loaded)); } })), 60000); } catch (e) { return "error"; }
  return "ok";
}
/* Ersatz ohne eingebauten Übersetzer: Google-Übersetzer-Baustein, gesteuert über das Cookie googtrans */
const gl = l => ({ zh: "zh-CN" }[l] || l);
function gtCookie(v) {
  const end = v ? "" : "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "googtrans=" + (v || "") + "; path=/" + end;
  if (location.hostname.includes(".")) document.cookie = "googtrans=" + (v || "") + "; path=/; domain=" + location.hostname + end;
}
/* Online-Übersetzer: Google Übersetzer direkt abfragen (der alte Google-Baustein wurde am 1.10.2026 abgeschaltet).
   Texte werden gesammelt und zeilenweise in wenigen Anfragen übersetzt; Ergebnisse landen im Cache, also nur einmal pro Text. */
const GT = "https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=de&tl=";
let gq = [], gT = null, gPause = 0;
const flat = t => t.replace(/\s+/g, " ");
async function gtBatch(items) {
  const res = await fetch(GT + encodeURIComponent(gl(lang())) + "&q=" + encodeURIComponent(items.map(x => flat(x.t)).join("\n")), { cache: "no-store" });
  if (res.status === 429) { gPause = Date.now() + 60e3; throw new Error("429"); }
  if (!res.ok) throw new Error("HTTP " + res.status);
  const d = await res.json(), out = (d[0] || []).map(x => x[0] || "").join("").split("\n");
  if (out.length !== items.length) { if (items.length === 1) return items[0].ok(out.join(" ")); for (const x of items) await gtBatch([x]); return; }
  items.forEach((x, i) => x.ok(out[i].trim() || x.t));
}
function gtFlush() {
  gT = null; const all = gq; gq = [];
  const batches = []; let cur = [], len = 0;
  all.forEach(x => { const n = encodeURIComponent(flat(x.t)).length + 3; if (cur.length && (len + n > 4500 || cur.length >= 60)) { batches.push(cur); cur = []; len = 0; } cur.push(x); len += n; });
  if (cur.length) batches.push(cur);
  batches.forEach(bt => gtBatch(bt).catch(() => bt.forEach(x => x.no())));
}
const online = { translate: t => new Promise((ok, no) => { if (Date.now() < gPause || !navigator.onLine) return no(new Error("pause")); gq.push({ t, ok, no }); if (!gT) gT = setTimeout(gtFlush, 40); }) };
const MSG = {
  noapi: "Dieser Browser hat keinen eingebauten Übersetzer. Wähle „Online“, dann übersetzt Google Übersetzer (Internet nötig).",
  unavailable: "Für diese Sprache hat der Browser kein Sprachpaket. Bitte eine andere Sprache wählen.",
  error: "Das Sprachpaket konnte nicht geladen werden. Bitte mit Internet erneut versuchen.",
  "needs-click": "Zum Übersetzen einmal in den Einstellungen unter „Sprache“ auf „Übersetzen“ tippen. Dann lädt der Browser das Sprachpaket."
};

App.afterBoot.push(() => {
  if (/googtrans=/.test(document.cookie)) gtCookie(null);
  if (lang() === "de") return;
  const goOnline = () => { tr = online; start(); };
  if (engine() !== "device" && navigator.onLine) return goOnline();
  ready(false).then(r => { if (r === "ok") start(); else if (navigator.onLine) goOnline(); else { App.toast("Sprache", "Ohne Internet und ohne Übersetzer im Browser zeigt StudyOS den deutschen Text.", "文"); addEventListener("online", goOnline, { once: true }); } });
});

/* Einstellungen: Sprachwahl ganz oben */
const settingsPage = PAGES.settings;
PAGES.settings = (el, p) => {
  settingsPage(el, p);
  const pg = $(".page", el) || el, card = document.createElement("div"); card.className = "card col";
  const cur = lang(), api = hasAPI();
  card.innerHTML = `<h3>Sprache</h3><p class="muted" style="font-size:14px">StudyOS ist auf Deutsch geschrieben. Wähle eine andere Sprache, dann wird die ganze App übersetzt: am Laptop direkt auf dem Gerät, am Handy online mit Google Übersetzer. Code, Maple-Befehle und Formeln bleiben, wie sie sind.</p>
    <div class="row"><select id="lg-sel" aria-label="Sprache">${LANGS.map(([k, n]) => `<option value="${k}" ${k === cur ? "selected" : ""}>${esc(n)}</option>`).join("")}</select><button class="btn pri sm" id="lg-go">${cur === "de" ? "Übernehmen" : "Übersetzen"}</button></div>
    <div class="switch"><div><div>Übersetzer</div><small>„Online“ übersetzt mit Google Übersetzer, schnell und in allen Sprachen. „Auf dem Gerät“ nutzt den Übersetzer von Chrome oder Edge und geht auch offline.</small></div>
      <div class="lvl st-seg" role="radiogroup" id="lg-eng"><button role="radio" data-eng="google" class="${engine() === "google" ? "on" : ""}" aria-checked="${engine() === "google"}">Online</button><button role="radio" data-eng="device" class="${engine() === "device" ? "on" : ""}" aria-checked="${engine() === "device"}" ${api ? "" : "disabled title=\"In diesem Browser nicht verfügbar\""}>Auf dem Gerät</button></div></div>
    <small class="muted" id="lg-msg">${api || engine() !== "device" ? "" : esc(MSG.noapi)}</small>`;
  const h = pg.querySelector("h1"); const anchor = h ? h.closest(".page > *") : null;
  if (anchor && anchor.nextSibling) pg.insertBefore(card, anchor.nextSibling); else pg.prepend(card);
  card.querySelector(".row").setAttribute("translate", "no"); card.querySelector(".row").classList.add("notranslate");
  $("#lg-eng", card).onclick = e => { const b = e.target.closest("[data-eng]"); if (!b || b.disabled || b.dataset.eng === engine()) return; S().settings.trEngine = b.dataset.eng; App.save();
    if (lang() !== "de") location.reload(); else $$("[data-eng]", card).forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); }); };
  $("#lg-go", card).onclick = async () => {
    const v = $("#lg-sel", card).value, msg = $("#lg-msg", card);
    if (v === "de") { if (cur !== "de") { S().settings.lang = "de"; App.save(); gtCookie(null); location.reload(); } return; }
    S().settings.lang = v; App.save();
    if (engine() !== "device") { location.reload(); return; }
    msg.textContent = hasAPI() ? "Lade Sprachpaket …" : "Übersetze …";
    const r = await ready(true, x => { msg.textContent = "Lade Sprachpaket … " + Math.round(100 * x) + " %"; });
    if (r !== "ok") { location.reload(); return; } /* ohne eingebauten Übersetzer: nach dem Neuladen übersetzt Google online */
    if (on) location.reload(); else { msg.textContent = ""; start(); }
  };
};
})();
