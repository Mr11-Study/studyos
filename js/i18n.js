/* StudyOS · Sprache der App
   Alle Inhalte sind auf Deutsch geschrieben. Für eine andere Sprache übersetzt der eingebaute Übersetzer des Browsers
   (Translator API, läuft auf dem Gerät und nach dem ersten Download offline) jeden sichtbaren Text, auch nach jedem Seitenwechsel.
   Code, Maple-Eingaben und Formeln bleiben unverändert. Muss vor apps.js geladen werden. */
(function () {
const { $, esc, PAGES } = App;
const S = () => App.S();
const LANGS = [["de", "Deutsch (Original)"], ["en", "English"], ["es", "Español"], ["fr", "Français"], ["it", "Italiano"], ["pt", "Português"], ["nl", "Nederlands"],
  ["pl", "Polski"], ["cs", "Čeština"], ["hr", "Hrvatski"], ["sr", "Srpski"], ["sl", "Slovenščina"], ["hu", "Magyar"], ["ro", "Română"], ["tr", "Türkçe"], ["ru", "Русский"],
  ["uk", "Українська"], ["ar", "العربية"], ["zh", "中文"], ["ja", "日本語"], ["ko", "한국어"], ["hi", "हिन्दी"]];
const lang = () => (S().settings && S().settings.lang) || "de";
const hasAPI = () => "Translator" in self;

let tr = null, on = false, obs = null;
const orig = new WeakMap(), mine = new WeakMap();
let cache = {};
const cacheKey = () => "studyos.tr." + lang();
const loadCache = () => { try { cache = JSON.parse(localStorage.getItem(cacheKey()) || "{}"); } catch (e) { cache = {}; } };
let saveT; const saveCache = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { const k = Object.keys(cache); if (k.length > 20000) k.slice(0, k.length - 20000).forEach(x => delete cache[x]); localStorage.setItem(cacheKey(), JSON.stringify(cache)); } catch (e) {} }, 1500); };

const SKIP = "script,style,code,pre,textarea,input,select,svg,math,.katex,.mw-in,.mw-code,.mw-out,[translate=no],.notranslate";
const worth = t => /[A-Za-zÄÖÜäöüß]{2}/.test(t);
async function trText(t) {
  const core = t.trim(); if (!worth(core)) return t;
  let out = cache[core];
  if (out === undefined) { try { out = await tr.translate(core); } catch (e) { return t; } cache[core] = out; saveCache(); }
  return t.replace(core, out);
}
async function walk(root) {
  if (!on || !root) return;
  const nodes = [];
  if (root.nodeType === 3) nodes.push(root);
  else if (root.nodeType === 1 && !root.closest(SKIP)) { const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement && !n.parentElement.closest(SKIP) ? 1 : 2 }); while (w.nextNode()) nodes.push(w.currentNode); }
  for (const n of nodes) {
    if (mine.get(n) === n.data || !worth(n.data)) continue;
    const src = n.data; orig.set(n, src);
    const out = await trText(src);
    if (n.data === src) { n.data = out; mine.set(n, out); }
  }
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
  let av; try { av = await Translator.availability(opts); } catch (e) { return "unavailable"; }
  if (av === "unavailable") return "unavailable";
  if (av !== "available" && !gesture) return "needs-click";
  try { tr = await Translator.create(Object.assign(opts, { monitor(m) { m.addEventListener("downloadprogress", e => onProgress && onProgress(e.loaded)); } })); } catch (e) { return "error"; }
  return "ok";
}
const MSG = {
  noapi: "Dieser Browser hat keinen eingebauten Übersetzer. Er ist in Google Chrome und Microsoft Edge am Laptop dabei (aktuelle Version). Am Handy hilft: StudyOS in Chrome öffnen → Menü ⋮ → „Übersetzen…“.",
  unavailable: "Für diese Sprache hat der Browser kein Sprachpaket. Bitte eine andere Sprache wählen.",
  error: "Das Sprachpaket konnte nicht geladen werden. Bitte mit Internet erneut versuchen.",
  "needs-click": "Zum Übersetzen einmal in den Einstellungen unter „Sprache“ auf „Übersetzen“ tippen. Dann lädt der Browser das Sprachpaket."
};

App.afterBoot.push(() => {
  if (lang() === "de") return;
  ready(false).then(r => { if (r === "ok") start(); else App.toast("Sprache", MSG[r] || MSG.error, "文"); });
});

/* Einstellungen: Sprachwahl ganz oben */
const settingsPage = PAGES.settings;
PAGES.settings = (el, p) => {
  settingsPage(el, p);
  const pg = $(".page", el) || el, card = document.createElement("div"); card.className = "card col";
  const cur = lang(), api = hasAPI();
  card.innerHTML = `<h3>Sprache</h3><p class="muted" style="font-size:14px">StudyOS ist auf Deutsch geschrieben. Wähle eine andere Sprache, dann übersetzt der eingebaute Übersetzer deines Browsers die ganze App direkt auf dem Gerät. Code, Maple-Befehle und Formeln bleiben, wie sie sind.</p>
    <div class="row"><select id="lg-sel" aria-label="Sprache">${LANGS.map(([k, n]) => `<option value="${k}" ${k === cur ? "selected" : ""}>${esc(n)}</option>`).join("")}</select><button class="btn pri sm" id="lg-go">${cur === "de" ? "Übernehmen" : "Übersetzen"}</button></div>
    <small class="muted" id="lg-msg">${api ? "" : esc(MSG.noapi)}</small>`;
  const h = pg.querySelector("h1"); const anchor = h ? h.closest(".page > *") : null;
  if (anchor && anchor.nextSibling) pg.insertBefore(card, anchor.nextSibling); else pg.prepend(card);
  card.querySelector(".row").setAttribute("translate", "no");
  $("#lg-go", card).onclick = async () => {
    const v = $("#lg-sel", card).value, msg = $("#lg-msg", card);
    if (v === "de") { if (cur !== "de") { S().settings.lang = "de"; App.save(); location.reload(); } return; }
    S().settings.lang = v; App.save();
    msg.textContent = "Lade Sprachpaket …";
    const r = await ready(true, x => { msg.textContent = "Lade Sprachpaket … " + Math.round(100 * x) + " %"; });
    if (r !== "ok") { msg.textContent = MSG[r] || MSG.error; S().settings.lang = cur; App.save(); return; }
    if (on) location.reload(); else { msg.textContent = ""; start(); }
  };
};
})();
