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
const POOL = 4;
async function runPool(jobs) { let i = 0; await Promise.all(Array.from({ length: Math.min(POOL, jobs.length) }, async () => { while (i < jobs.length) await jobs[i++](); })); }
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
  await runPool(slow.map(n => async () => { const src = n.data; orig.set(n, src); const out = await trText(src); if (n.data === src) { n.data = out; mine.set(n, out); } }));
  if (root.nodeType === 1) for (const el of root.querySelectorAll("[placeholder],[title]")) for (const a of ["placeholder", "title"]) {
    const v = el.getAttribute(a); if (!v || el.dataset["tr" + a] === v) continue;
    const out = await trText(v); el.setAttribute(a, out); el.dataset["tr" + a] = out;
  }
}
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
function guard() { /* Code, Maple und Formeln vor dem Online-Übersetzer schützen */
  const mark = r => r.querySelectorAll && r.querySelectorAll(SKIP).forEach(e => e.classList.add("notranslate"));
  mark(document);
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) { if (n.matches(SKIP)) n.classList.add("notranslate"); mark(n); } }))).observe(document.body, { childList: true, subtree: true });
}
function useWidget() {
  gtCookie("/de/" + gl(lang())); document.documentElement.lang = lang(); guard();
  const d = document.createElement("div"); d.id = "gt-el"; d.style.display = "none"; document.body.appendChild(d);
  window.studyosGT = () => { try { new google.translate.TranslateElement({ pageLanguage: "de", autoDisplay: false }, "gt-el"); } catch (e) {} };
  const sc = document.createElement("script"); sc.src = "https://translate.google.com/translate_a/element.js?cb=studyosGT";
  sc.onerror = () => App.toast("Sprache", "Die Übersetzung braucht eine Internetverbindung. Ohne Internet zeigt StudyOS den deutschen Text.", "文");
  document.head.appendChild(sc);
}
const MSG = {
  noapi: "Dieser Browser hat keinen eingebauten Übersetzer, darum übersetzt StudyOS hier online mit Google Übersetzer (Internet nötig).",
  unavailable: "Für diese Sprache hat der Browser kein Sprachpaket. Bitte eine andere Sprache wählen.",
  error: "Das Sprachpaket konnte nicht geladen werden. Bitte mit Internet erneut versuchen.",
  "needs-click": "Zum Übersetzen einmal in den Einstellungen unter „Sprache“ auf „Übersetzen“ tippen. Dann lädt der Browser das Sprachpaket."
};

App.afterBoot.push(() => {
  if (lang() === "de") { if (/googtrans=/.test(document.cookie)) gtCookie(null); return; }
  const want = engine() === "device" || !navigator.onLine;
  if (!want) return useWidget();
  ready(false).then(r => { if (r === "ok") start(); else useWidget(); });
});

/* Einstellungen: Sprachwahl ganz oben */
const settingsPage = PAGES.settings;
PAGES.settings = (el, p) => {
  settingsPage(el, p);
  const pg = $(".page", el) || el, card = document.createElement("div"); card.className = "card col";
  const cur = lang(), api = hasAPI();
  card.innerHTML = `<h3>Sprache</h3><p class="muted" style="font-size:14px">StudyOS ist auf Deutsch geschrieben. Wähle eine andere Sprache, dann wird die ganze App übersetzt: am Laptop direkt auf dem Gerät, am Handy online mit Google Übersetzer. Code, Maple-Befehle und Formeln bleiben, wie sie sind.</p>
    <div class="row"><select id="lg-sel" aria-label="Sprache">${LANGS.map(([k, n]) => `<option value="${k}" ${k === cur ? "selected" : ""}>${esc(n)}</option>`).join("")}</select><button class="btn pri sm" id="lg-go">${cur === "de" ? "Übernehmen" : "Übersetzen"}</button></div>
    <div class="switch"><div><div>Übersetzer</div><small>Online mit Google versteht ganze Sätze und ist schneller. „Auf dem Gerät“ geht auch offline, übersetzt aber Satzteile einzeln.</small></div>
      <div class="lvl st-seg" role="radiogroup" id="lg-eng"><button role="radio" data-eng="google" class="${engine() === "google" ? "on" : ""}" aria-checked="${engine() === "google"}">Online</button><button role="radio" data-eng="device" class="${engine() === "device" ? "on" : ""}" aria-checked="${engine() === "device"}" ${api ? "" : "disabled title=\"In diesem Browser nicht verfügbar\""}>Auf dem Gerät</button></div></div>
    <small class="muted" id="lg-msg">${api || engine() !== "device" ? "" : esc(MSG.noapi)}</small>`;
  const h = pg.querySelector("h1"); const anchor = h ? h.closest(".page > *") : null;
  if (anchor && anchor.nextSibling) pg.insertBefore(card, anchor.nextSibling); else pg.prepend(card);
  card.querySelector(".row").setAttribute("translate", "no"); card.querySelector(".row").classList.add("notranslate");
  $("#lg-eng", card).onclick = e => { const b = e.target.closest("[data-eng]"); if (!b || b.disabled || b.dataset.eng === engine()) return; S().settings.trEngine = b.dataset.eng; App.save();
    if (lang() !== "de") { if (b.dataset.eng === "device") gtCookie(null); location.reload(); } else $$("[data-eng]", card).forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); }); };
  $("#lg-go", card).onclick = async () => {
    const v = $("#lg-sel", card).value, msg = $("#lg-msg", card);
    if (v === "de") { if (cur !== "de") { S().settings.lang = "de"; App.save(); gtCookie(null); location.reload(); } return; }
    S().settings.lang = v; App.save();
    if (engine() !== "device") { location.reload(); return; }
    gtCookie(null);
    msg.textContent = hasAPI() ? "Lade Sprachpaket …" : "Übersetze …";
    const r = await ready(true, x => { msg.textContent = "Lade Sprachpaket … " + Math.round(100 * x) + " %"; });
    if (r !== "ok") { location.reload(); return; } /* ohne eingebauten Übersetzer: nach dem Neuladen übersetzt Google online */
    if (on) location.reload(); else { msg.textContent = ""; start(); }
  };
};
})();
