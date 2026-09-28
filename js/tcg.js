/* Collector profile (Pokémon TCG): sets, cards with images, Cardmarket prices, sealed products, portfolio.
   Data: official Cardmarket price guide + product catalogue (daily), card data & images from TCGdex.
   The GitHub Action (tools/build_tcg.py) publishes compact JSON to the 'data' branch. */
(function () {
if (window.STUDYOS_TRACK !== "tcg") return;
const { $, $$, esc, PAGES } = App;
const S = () => App.S();
const T = () => { const s = S(); s.tcg = s.tcg || {}; const t = s.tcg; t.items = t.items || []; t.hist = t.hist || []; t.watch = t.watch || []; t.lang = t.lang || "de"; t.recent = t.recent || []; return t; };
const RAW = "https://raw.githubusercontent.com/Mr11-Study/studyos/data/tcg/";
const IMG = "https://assets.tcgdex.net/";
const LANGS = { de: "Deutsch", en: "Englisch", fr: "Französisch", it: "Italienisch", es: "Spanisch", pt: "Portugiesisch", ja: "Japanisch", zh: "Chinesisch", ko: "Koreanisch" };
const NAME_LANGS = ["de", "en", "fr", "it", "es", "pt"];
const CONDS = [["MT", "Mint"], ["NM", "Near Mint"], ["EX", "Excellent"], ["GD", "Good"], ["LP", "Light Played"], ["PL", "Played"], ["PO", "Poor"]];
const SEALED_COND = [["sealed", "Versiegelt"], ["opened", "Geöffnet"], ["damaged", "Verpackung beschädigt"]];
const eur = (v, d = 2) => v == null || isNaN(v) ? "–" : v.toLocaleString("de-AT", { style: "currency", currency: "EUR", minimumFractionDigits: d, maximumFractionDigits: d });
const eur0 = v => eur(v, v != null && Math.abs(v) >= 1000 ? 0 : 2);
const pct = v => v == null || !isFinite(v) ? "" : (v > 0 ? "+" : "") + v.toLocaleString("de-AT", { maximumFractionDigits: 1 }) + " %";
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = s => { if (!s) return "–"; const d = new Date(s); return isNaN(d) ? s : d.toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric" }); };
const fmtStamp = s => { if (!s) return "–"; const d = new Date(s); return isNaN(d) ? s : d.toLocaleString("de-AT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); };

/* ---------------- shell ---------------- */
App.NAV.length = 0;
[["dash", "Übersicht", "⌂"], ["portfolio", "Sammlung", "◆"], ["sets", "Sets", "▦"], ["cards", "Karten suchen", "⌕"], ["sealed", "Produkte", "▣"], ["watch", "Beobachtet", "☆"], ["path", "Sammler-Guide", "?"]].forEach(x => App.NAV.push(x));
App.BNAV = [["dash", "Übersicht", "⌂"], ["portfolio", "Sammlung", "◆"], ["cards", "Suchen", "⌕"], ["sealed", "Produkte", "▣"], ["__more", "Mehr", "☰"]];
App.BRAND = { logo: "◆", name: "Sammlung", sub: "Pokémon · Cardmarket-Preise" };
App.WELCOME = "Deine Sammlungs-App: Karten und Sealed-Produkte erfassen, Preise aus dem Cardmarket-Preisführer, Gesamtwert und Entwicklung. Alles bleibt auf deinem Gerät.";
App.TOPBAR = () => { const v = totals().value; return v ? `<span class="chip acc tab">${eur0(v)}</span>` : ""; };

/* ---------------- data layer ---------------- */
const D = { meta: null, sets: null, setMap: {}, setData: {}, sealed: null, sealedMap: null, index: null, err: null };
async function getJSON(path, v) {
  const url = RAW + path + "?v=" + encodeURIComponent(v || Date.now());
  const r = await fetch(url, { cache: v ? "default" : "no-store" }); if (!r.ok) throw new Error("HTTP " + r.status); return r.json();
}
async function loadMeta() { const m = await getJSON("meta.json"); const changed = !D.meta || D.meta.updated !== m.updated; D.meta = m; if (changed) { D.setData = {}; D.sealed = null; D.sealedMap = null; D.index = null; D.sets = null; } return changed; }
const ver = () => (D.meta && (D.meta.updated + D.meta.built)) || "0";
async function sets() { if (!D.meta) await loadMeta(); if (!D.sets) { D.sets = await getJSON("sets.json", ver()); D.setMap = Object.fromEntries(D.sets.map(s => [s.id, s])); D.expMap = {}; D.sets.forEach(s => { if (s.e) D.expMap[s.e] = s; }); } return D.sets; }
async function setData(id) { await sets(); if (!D.setData[id]) { const d = await getJSON("sets/" + encodeURIComponent(id) + ".json", ver()); d.map = Object.fromEntries(d.cards.map(c => [c.l, c])); D.setData[id] = d; } return D.setData[id]; }
async function sealed() { await sets(); if (!D.sealed) { const d = await getJSON("sealed.json", ver()); D.sealed = d.items.map(a => ({ id: a[0], n: a[1], c: a[2], e: a[3], d: a[4], p: [a[5], a[6], a[7], a[8], a[9], a[10]] })); D.sealedMap = Object.fromEntries(D.sealed.map(x => [x.id, x])); } return D.sealed; }
async function index() { await sets(); if (!D.index) { const d = await getJSON("index.json", ver()); D.index = d.c; } return D.index; }
const setName = (s, lang) => s ? ((s.n && (s.n[lang || T().lang] || s.n.en || s.n.de)) || s.id) : "";
const cardName = (c, lang) => (c.n && (c.n[lang || T().lang] || c.n.en || c.n.de)) || "?";
window.tcgImgErr = img => { const fb = img.dataset.fb; if (fb && img.src !== fb) { img.src = fb; img.dataset.fb = ""; } else { img.style.display = "none"; const ph = img.parentElement && img.parentElement.querySelector(".ph"); if (ph) ph.style.display = "grid"; } };
const cardImg = (set, lid, q = "low", lang) => { const l = lang || T().lang; const s = D.setMap[set]; if (!s) return ["", ""]; const base = (L) => `${IMG}${L}/${s.s}/${s.id}/${encodeURIComponent(lid)}/${q}.webp`; return [base(NAME_LANGS.includes(l) ? l : "en"), base("en")]; };
const imgTag = (set, lid, q, alt, lang) => { const [a, b] = cardImg(set, lid, q, lang); return `<img loading="lazy" decoding="async" src="${a}" data-fb="${b}" alt="${esc(alt || "")}" onerror="tcgImgErr(this)"><div class="ph" style="display:none">${esc(alt || "")}</div>`; };
const setLogo = s => { const l = T().lang; return `<img loading="lazy" src="${IMG}${l}/${s.s}/${s.id}/logo.webp" data-fb="${IMG}en/${s.s}/${s.id}/logo.webp" alt="" onerror="tcgImgErr(this)"><span class="fb ph" style="display:none">${esc(setName(s))}</span>`; };
const cmSearch = (q, exp) => `https://www.cardmarket.com/de/Pokemon/Products/Search?searchString=${encodeURIComponent(q)}${exp ? "&idExpansion=" + exp : ""}`;
/* Cardmarket ids: languages and minimum condition as used in Cardmarket's offer filters */
const LANG_CM = { en: 1, fr: 2, de: 3, es: 4, it: 5, zh: 6, ja: 7, pt: 8, ko: 10 };
const COND_CM = { MT: 1, NM: 2, EX: 3, GD: 4, LP: 5, PL: 6, PO: 7 };
const cmUrl = (id, o = {}) => { if (!id) return null; const q = new URLSearchParams({ idProduct: id }); if (o.lang && LANG_CM[o.lang]) q.set("language", LANG_CM[o.lang]); if (o.cond && COND_CM[o.cond]) q.set("minCondition", COND_CM[o.cond]); if (o.rev) q.set("isReverseHolo", "Y"); return "https://www.cardmarket.com/de/Pokemon/Products?" + q.toString(); };
const TYPES_DE = { Grass: "Pflanze", Fire: "Feuer", Water: "Wasser", Lightning: "Elektro", Psychic: "Psycho", Fighting: "Kampf", Darkness: "Finsternis", Metal: "Metall", Fairy: "Fee", Dragon: "Drache", Colorless: "Farblos" };
const CAT_DE = { Pokemon: "Pokémon", Trainer: "Trainer", Energy: "Energie" };
/* price adjustments: own price per entry, or trend x language factor x condition factor (all default 100 %) */
const ADJ = () => { const t = T(); t.adj = t.adj || {}; t.adj.lang = t.adj.lang || {}; t.adj.cond = t.adj.cond || {}; return t.adj; };
const fL = l => (ADJ().lang[l] != null ? ADJ().lang[l] : 100) / 100, fC = c => (ADJ().cond[c] != null ? ADJ().cond[c] : 100) / 100;
const factor = (lang, cond, kind) => fL(lang) * (kind === "sealed" ? 1 : fC(cond));
const adjPrice = (base, lang, cond, kind) => base == null ? null : Math.round(base * factor(lang, cond, kind) * 100) / 100;
const hasOwn = it => it.own != null && it.own !== "" && !isNaN(it.own);
const basis = it => hasOwn(it) ? "Eigener Preis" : (f => f === 1 ? "Cardmarket-Trend" : `Trend × ${Math.round(f * 100)} %`)(factor(it.lang, it.cond, it.kind));
const cmOf = (card, variant) => { if (!card) return null; if (variant && variant.startsWith("sp:")) { const x = (card.sp || []).find(y => y[0] === variant.slice(3)); return x ? x[1] : card.cm; } return card.cm; };
const numIn = v => { const n = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isNaN(n) ? null : n; };
const VARIANT_LABEL = { normal: "Normal", holo: "Holo", reverse: "Reverse Holo" };
function variantsOf(card) { const v = []; (card.vt || ["normal"]).forEach(t => { if (t === "reverse") { if (card.rv) v.push(["reverse", "Reverse Holo"]); } else v.push([t, VARIANT_LABEL[t] || t]); }); if (!v.length) v.push(["normal", "Normal"]); (card.sp || []).forEach(s => v.push(["sp:" + s[0], s[0]])); return v; }
function priceOf(card, variant) { if (!card) return null; if (variant === "reverse") return card.rv || null; if (variant && variant.startsWith("sp:")) { const s = (card.sp || []).find(x => x[0] === variant.slice(3)); return s ? [s[2], null, null, null, null, null] : null; } return card.p || null; }
const trendOf = arr => arr ? (arr[0] != null ? arr[0] : arr[1]) : null;
const move = arr => arr && arr[4] != null && arr[5] ? (arr[4] - arr[5]) / arr[5] * 100 : null;

/* ---------------- portfolio ---------------- */
function itemUnit(it) { if (hasOwn(it)) return +it.own; const b = it.last && it.last.t != null ? it.last.t : null; return adjPrice(b, it.lang, it.cond, it.kind); }
function totals(filter) { let value = 0, buy = 0, cards = 0, sealedN = 0, unpriced = 0; T().items.filter(filter || (() => true)).forEach(it => { const u = itemUnit(it); if (u == null) unpriced += it.qty; else value += u * it.qty; buy += (it.buy || 0) * it.qty; if (it.kind === "card") cards += it.qty; else sealedN += it.qty; }); return { value, buy, pl: value - buy, plPct: buy ? (value - buy) / buy * 100 : null, cards, sealed: sealedN, unpriced }; }
async function refreshPrices(force) {
  const t = T(); let changed = false;
  try { changed = await loadMeta(); } catch (e) { D.err = e.message; return false; }
  if (!changed && !force && t.lastPriced === D.meta.updated) return false;
  await sets();
  const setsNeeded = [...new Set(t.items.filter(i => i.kind === "card").map(i => i.set))];
  await Promise.all(setsNeeded.map(id => setData(id).catch(() => null)));
  if (t.items.some(i => i.kind === "sealed") || t.watch.some(w => w.kind === "sealed")) await sealed().catch(() => null);
  t.items.forEach(it => { let arr = null; if (it.kind === "card") { const sd = D.setData[it.set]; arr = sd && priceOf(sd.map[it.l], it.variant); } else { const x = D.sealedMap && D.sealedMap[it.id]; arr = x && x.p; } const tr = trendOf(arr); if (tr != null) it.last = { t: tr, a7: arr[4], a30: arr[5], at: D.meta.updated }; });
  t.lastPriced = D.meta.updated; snapshot(); checkWatch(); App.save(); return true;
}
function snapshot() { const t = T(), tot = totals(); if (!t.items.length) return; const d = today(); const h = t.hist; const e = h.find(x => x.d === d); if (e) { e.v = +tot.value.toFixed(2); e.b = +tot.buy.toFixed(2); } else h.push({ d, v: +tot.value.toFixed(2), b: +tot.buy.toFixed(2) }); if (h.length > 800) h.splice(0, h.length - 800); }
function checkWatch() {
  const t = T(); t.watch.forEach(w => { let arr = null; if (w.kind === "card") { const sd = D.setData[w.set]; arr = sd && priceOf(sd.map[w.l], w.variant || "normal"); } else { const x = D.sealedMap && D.sealedMap[w.id]; arr = x && x.p; } const tr = trendOf(arr); if (tr == null) return; w.cur = tr; w.at = D.meta.updated;
    const hit = w.target && ((w.dir === "above" && tr >= w.target) || (w.dir !== "above" && tr <= w.target));
    if (hit && w.alerted !== D.meta.updated) { w.alerted = D.meta.updated; const msg = `${w.name}: ${eur(tr)} (Ziel ${w.dir === "above" ? "≥" : "≤"} ${eur(w.target)})`; App.toast("Preisalarm", msg, "☆", true); try { if (Notification.permission === "granted") navigator.serviceWorker.ready.then(r => r.showNotification("Preisalarm", { body: msg, icon: "icons/icon-192.png", tag: "pa-" + (w.l || w.id) })); } catch (e) {} } });
}
let refreshing = null;
function autoRefresh(manual) { if (refreshing) return refreshing; refreshing = refreshPrices(manual).then(ch => { refreshing = null; if (ch) { if (["dash", "portfolio", "watch"].includes(App.route().v)) App.render(); App.renderSide(); if (manual) App.toast("Preise aktualisiert", "Cardmarket-Preisführer vom " + fmtStamp(D.meta.updated), "↻"); } else if (manual) App.toast("Alles aktuell", D.meta ? "Stand " + fmtStamp(D.meta.updated) : (D.err || "Keine Verbindung"), "✓"); return ch; }).catch(e => { refreshing = null; D.err = e.message; }); return refreshing; }
App.afterBoot.push(() => { autoRefresh(false); setInterval(() => { if (document.visibilityState === "visible") autoRefresh(false); }, 30 * 60 * 1000); document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && D.meta && Date.now() - (D.lastCheck || 0) > 20 * 60 * 1000) { D.lastCheck = Date.now(); autoRefresh(false); } }); });

/* ---------------- small UI helpers ---------------- */
const loading = (el, msg = "Lade Daten …") => { el.innerHTML = `<div class="page"><div class="empty-state"><div class="spinner" style="width:28px;height:28px;border:3px solid var(--line2);border-top-color:var(--acc);border-radius:50%;animation:spin 1s linear infinite"></div><span class="muted">${msg}</span></div></div>`; };
const fail = (el, e) => { el.innerHTML = `<div class="page"><div class="card empty-state"><b>Daten konnten nicht geladen werden</b><small class="muted">${esc(e && e.message || String(e))}. Bist du online? Beim ersten Öffnen braucht die App eine Internetverbindung.</small><button class="btn pri" onclick="App.render()">Nochmal versuchen</button></div></div>`; };
let seq = 0;
const guard = fn => async (el, p) => { const my = ++seq, r = App.route(); loading(el); const box = document.createElement("div"); const live = () => my === seq && App.route() === r && el.isConnected;
  try { await fn(box, p); if (live()) { el.onclick = null; el.replaceChildren(box); } } catch (e) { console.error(e); if (live()) fail(el, e); } };
function lineChart(pts, h = 120) {
  if (pts.length < 2) return `<div class="muted" style="font-size:13px;padding:16px 0">Der Verlauf erscheint, sobald an mehreren Tagen Preise geladen wurden.</div>`;
  const W = 600, xs = pts.map((p, i) => i), ys = pts.map(p => p.v), bs = pts.map(p => p.b); const mn = Math.min(...ys, ...bs) * 0.97, mx = Math.max(...ys, ...bs) * 1.03 || 1;
  const X = i => 8 + i / (pts.length - 1) * (W - 16), Y = v => h - 18 - (v - mn) / (mx - mn || 1) * (h - 30);
  const line = arr => arr.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1)).join("");
  return `<svg viewBox="0 0 ${W} ${h}" style="width:100%;height:${h}px" preserveAspectRatio="none"><defs><linearGradient id="gv" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#F5C542" stop-opacity=".35"/><stop offset="1" stop-color="#F5C542" stop-opacity="0"/></linearGradient></defs>
    <path d="${line(ys)} L${X(pts.length - 1)} ${h - 18} L${X(0)} ${h - 18} Z" fill="url(#gv)"/><path d="${line(ys)}" fill="none" stroke="#F5C542" stroke-width="2.5" vector-effect="non-scaling-stroke"/><path d="${line(bs)}" fill="none" stroke="#8F9BAE" stroke-width="1.5" stroke-dasharray="5 4" vector-effect="non-scaling-stroke"/>
    <text x="8" y="${h - 3}" fill="#8F9BAE" font-size="11">${fmtDate(pts[0].d)}</text><text x="${W - 8}" y="${h - 3}" fill="#8F9BAE" font-size="11" text-anchor="end">${fmtDate(pts[pts.length - 1].d)}</text></svg>`;
}
const SEALED_ICON = c => { const col = /Display/.test(c) ? "#F5C542" : /Elite/.test(c) ? "#58A6FF" : /Booster/.test(c) ? "#E36B2C" : /Tin/.test(c) ? "#9AA7B8" : /Box/.test(c) ? "#B07CF7" : /Blister/.test(c) ? "#3FB950" : /Coin/.test(c) ? "#E3AE1F" : "#8F9BAE";
  if (/Booster$/.test(c)) return `<svg viewBox="0 0 40 40" width="34"><path d="M12 4h16l2 4-2 2v20l2 2-2 4H12l-2-4 2-2V10l-2-2z" fill="${col}" opacity=".9"/><path d="M14 14h12M14 20h12" stroke="#0C1016" stroke-width="2" opacity=".4"/></svg>`;
  if (/Tin/.test(c)) return `<svg viewBox="0 0 40 40" width="34"><rect x="6" y="10" width="28" height="22" rx="4" fill="${col}"/><rect x="5" y="8" width="30" height="6" rx="3" fill="#C9D2DD"/></svg>`;
  if (/Coin/.test(c)) return `<svg viewBox="0 0 40 40" width="34"><circle cx="20" cy="20" r="14" fill="${col}"/><circle cx="20" cy="20" r="9" fill="none" stroke="#0C1016" stroke-width="2" opacity=".35"/></svg>`;
  return `<svg viewBox="0 0 40 40" width="34"><path d="M6 13l14-7 14 7v15l-14 7-14-7z" fill="${col}" opacity=".95"/><path d="M6 13l14 7 14-7M20 20v15" stroke="#0C1016" stroke-width="1.6" opacity=".35" fill="none"/></svg>`; };
const plSpan = (pl, p) => `<span class="pl ${pl >= 0 ? "up" : "down"}">${pl >= 0 ? "▲" : "▼"} ${eur(Math.abs(pl))}${p != null ? " · " + pct(p) : ""}</span>`;
const moveChip = m => m == null ? "" : `<span class="pl ${m >= 0 ? "up" : "down"}" title="Ø 7 Tage vs. Ø 30 Tage">${m >= 0 ? "▲" : "▼"} ${pct(Math.abs(m)).replace("+", "")}</span>`;

/* ---------------- filter bar: search + sort + collapsible filter panel + active chips ---------------- */
const FST = {}; // remembered filter state per page (for this session)
function filterUI(host, key, cfg) {
  const st = FST[key] = FST[key] || Object.assign({ q: "", sort: cfg.sort[0][0] }, cfg.init || {});
  const defs = cfg.defs.filter(Boolean);
  const isOn = d => { const v = st[d.k]; return !(v === "" || v == null || v === false || (d.def != null && String(v) === String(d.def))); };
  const ctl = d => d.type === "select" ? `<label class="fld">${esc(d.label)}<select data-f="${d.k}">${d.opts.map(([v, l]) => `<option value="${esc(v)}" ${String(st[d.k] ?? "") === String(v) ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>`
    : d.type === "check" ? `<label class="fchk"><input type="checkbox" data-f="${d.k}" ${st[d.k] ? "checked" : ""}><span>${esc(d.label)}</span></label>`
    : `<label class="fld">${esc(d.label)}<input type="${d.type === "num" ? "number" : "text"}" data-f="${d.k}" value="${esc(st[d.k] ?? "")}" placeholder="${esc(d.ph || "")}" ${d.type === "num" ? 'inputmode="decimal" step="any"' : 'autocomplete="off"'}></label>`;
  host.innerHTML = `<div class="fbar"><div class="wiki-search"><span>⌕</span><input type="search" data-f="q" value="${esc(st.q)}" placeholder="${esc(cfg.ph || "Suchen …")}" autocomplete="off"></div>
      <select data-f="sort" aria-label="Sortierung">${cfg.sort.map(([v, l]) => `<option value="${v}" ${st.sort === v ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>
      <button class="btn fbtn" data-ft>Filter <b class="fcount"></b></button></div>
    <div class="fpanel" hidden><div class="fgrid">${defs.map(ctl).join("")}</div><div class="spread"><button class="btn ghost sm" data-freset>Alle Filter zurücksetzen</button><button class="btn pri sm" data-fclose>Fertig</button></div></div>
    <div class="fchips"></div>`;
  const panel = $(".fpanel", host);
  const label = d => { const v = st[d.k]; if (d.type === "check") return d.label; if (d.type === "select") { const o = d.opts.find(x => String(x[0]) === String(v)); return d.label + ": " + (o ? o[1] : v); } return d.label + ": " + v + (d.unit || ""); };
  const sync = () => { const on = defs.filter(isOn); $(".fcount", host).textContent = on.length ? on.length : ""; $("[data-ft]", host).classList.toggle("on", !!on.length);
    $(".fchips", host).innerHTML = on.map(d => `<button class="chip on" data-fx="${d.k}">${esc(label(d))} ✕</button>`).join(""); };
  let deb; const fire = (debounce) => { sync(); clearTimeout(deb); if (debounce) deb = setTimeout(cfg.onChange, 160); else cfg.onChange(); };
  host.addEventListener("input", e => { const k = e.target.dataset.f; if (!k || e.target.tagName === "SELECT") return; st[k] = e.target.type === "checkbox" ? e.target.checked : e.target.value; fire(e.target.type === "text" || e.target.type === "search" || e.target.type === "number"); });
  host.addEventListener("change", e => { const k = e.target.dataset.f; if (!k || e.target.tagName !== "SELECT") return; st[k] = e.target.value; fire(false); });
  host.addEventListener("click", e => {
    if (e.target.closest("[data-ft]")) { panel.hidden = !panel.hidden; return; }
    if (e.target.closest("[data-fclose]")) { panel.hidden = true; return; }
    if (e.target.closest("[data-freset]")) { defs.forEach(d => { st[d.k] = d.def != null ? d.def : (d.type === "check" ? false : ""); const inp = $(`[data-f="${d.k}"]`, host); if (inp) { if (inp.type === "checkbox") inp.checked = !!st[d.k]; else inp.value = st[d.k]; } }); fire(false); return; }
    const x = e.target.closest("[data-fx]"); if (x) { const d = defs.find(y => y.k === x.dataset.fx); st[d.k] = d.def != null ? d.def : (d.type === "check" ? false : ""); const inp = $(`[data-f="${d.k}"]`, host); if (inp) { if (inp.type === "checkbox") inp.checked = !!st[d.k]; else inp.value = st[d.k]; } fire(false); }
  });
  sync(); return st;
}
const opt = (arr, all) => [["", all]].concat(arr);
const between = (v, lo, hi) => (lo === "" || lo == null || (v != null && v >= +lo)) && (hi === "" || hi == null || (v != null && v <= +hi));

/* ---------------- Übersicht ---------------- */
PAGES.dash = guard(async el => {
  await sets().catch(() => null); const t = T(), tot = totals();
  const h = t.hist, last = h[h.length - 1], prev = h.length > 1 ? h[h.length - 2] : null, wk = h.find(x => x.d >= new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10));
  const dDay = prev ? tot.value - prev.v : null, dWk = wk && wk !== last ? tot.value - wk.v : null;
  const top = t.items.filter(i => itemUnit(i) != null).sort((a, b) => itemUnit(b) * b.qty - itemUnit(a) * a.qty).slice(0, 6);
  const movers = t.items.filter(i => i.last && i.last.a7 && i.last.a30).map(i => [i, (i.last.a7 - i.last.a30) / i.last.a30 * 100]).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 5);
  const name = S().name || "";
  el.innerHTML = `<div class="page">
    <div class="tcg-hero"><div class="spread" style="align-items:flex-start;gap:12px"><div><span class="eyebrow">Hallo ${esc(name)} · Gesamtwert deiner Sammlung</span><div class="big" style="margin-top:8px">${eur(tot.value)}</div>
      <div class="row" style="gap:12px;margin-top:6px">${dDay != null ? `<span class="pl ${dDay >= 0 ? "up" : "down"}">${dDay >= 0 ? "▲" : "▼"} ${eur(Math.abs(dDay))} seit gestern</span>` : ""}${dWk != null ? `<span class="pl ${dWk >= 0 ? "up" : "down"}">${dWk >= 0 ? "▲" : "▼"} ${eur(Math.abs(dWk))} in 7 Tagen</span>` : ""}</div></div>
      <button class="btn sm" id="rf">↻ Aktualisieren</button></div>
      <div style="margin-top:12px">${lineChart(h.slice(-90))}</div>
      <div class="tcg-kpis" style="margin-top:8px"><div class="tcg-kpi"><b>${eur0(tot.buy)}</b><small class="muted">Einkaufswert</small></div><div class="tcg-kpi"><b class="${tot.pl >= 0 ? "up" : "down"}">${tot.pl >= 0 ? "+" : "−"}${eur0(Math.abs(tot.pl))}</b><small class="muted">Gewinn/Verlust ${tot.plPct != null ? "(" + pct(tot.plPct) + ")" : ""}</small></div><div class="tcg-kpi"><b>${tot.cards}</b><small class="muted">Karten</small></div><div class="tcg-kpi"><b>${tot.sealed}</b><small class="muted">Sealed-Produkte</small></div></div>
      <p class="stamp" style="margin-top:10px">Preise: offizieller Cardmarket-Preisführer (Trendpreis) · Stand ${D.meta ? fmtStamp(D.meta.updated) : "–"} · wird automatisch aktualisiert</p></div>
    ${!t.items.length ? `<div class="card col" style="gap:12px"><h2>So legst du los</h2><ol style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px"><li><b>Set wählen</b> oder <b>Karte suchen</b> (Name auf Deutsch oder Englisch).</li><li>Karte antippen → Preise ansehen → <b>„Zur Sammlung“</b>: Variante, Sprache, Zustand, Anzahl und Kaufpreis.</li><li>Displays, ETBs, Booster usw. findest du unter <b>Produkte</b>.</li><li>Die <b>Sammlung</b> zeigt dir Gesamtwert, Gewinn/Verlust und Filter.</li></ol><div class="row"><button class="btn pri" data-go="cards">⌕ Karte suchen</button><button class="btn" data-go="sets">▦ Sets durchstöbern</button><button class="btn" data-go="sealed">▣ Produkte</button></div></div>` : ""}
    ${top.length ? `<div class="col" style="gap:10px"><div class="spread"><h2>Wertvollste Stücke</h2><button class="btn ghost sm" data-go="portfolio">Alle →</button></div><div class="tgrid">${top.map(itemTile).join("")}</div></div>` : ""}
    ${movers.length ? `<div class="card col" style="gap:8px"><h3>Preisbewegungen (Ø 7 Tage vs. Ø 30 Tage)</h3>${movers.map(([i, m]) => `<button class="srow" data-item="${i.uid}"><span class="ic">${i.kind === "card" ? `<img src="${cardImg(i.set, i.l, "low", i.lang)[0]}" data-fb="${cardImg(i.set, i.l, "low", "en")[0]}" onerror="tcgImgErr(this)" alt="">` : SEALED_ICON(i.cat || "")}</span><span class="t"><b>${esc(i.name)}</b><small class="muted">${esc(i.sub || "")}</small></span><span class="v"><b>${eur(itemUnit(i))}</b><br>${moveChip(m)}</span></button>`).join("")}</div>` : ""}
    <div class="grid g3"><button class="card col" data-go="cards" style="text-align:left;cursor:pointer;gap:4px"><b>⌕ Karten suchen</b><small class="muted">Alle ${D.meta ? D.meta.cards.toLocaleString("de-AT") : ""} Karten, Top-Preise, Filter</small></button><button class="card col" data-go="sets" style="text-align:left;cursor:pointer;gap:4px"><b>▦ Sets</b><small class="muted">${D.sets ? D.sets.length : ""} Sets mit Bildern und Setwert</small></button><button class="card col" data-go="sealed" style="text-align:left;cursor:pointer;gap:4px"><b>▣ Produkte</b><small class="muted">Displays, ETBs, Booster, Tins …</small></button></div>
  </div>`;
  $("#rf", el).onclick = () => autoRefresh(true);
  el.onclick = e => { const b = e.target.closest("[data-item]"); if (b) openItem(b.dataset.item); };
});
function itemTile(i) { const u = itemUnit(i); return `<button class="tcard" data-item="${i.uid}"><div class="im">${i.kind === "card" ? imgTag(i.set, i.l, "low", i.name, i.lang) : `<div class="ph" style="display:grid">${SEALED_ICON(i.cat || "")}<br>${esc(i.name)}</div>`}${i.qty > 1 ? `<span class="own">×${i.qty}</span>` : ""}</div><div class="nm">${esc(i.name)}</div><div class="meta"><span>${esc(i.short || "")}</span><span class="pr">${eur(u != null ? u * i.qty : null)}</span></div></button>`; }

/* ---------------- Sets ---------------- */
const seriesList = all => { const out = []; all.forEach(s => { if (!out.some(x => x[0] === s.s)) out.push([s.s, (s.sn && (s.sn[T().lang] || s.sn.en)) || s.s]); }); return out; };
PAGES.sets = guard(async (el) => {
  const all = await sets(); const t = T(); const owned = {}; t.items.filter(i => i.kind === "card").forEach(i => { (owned[i.set] = owned[i.set] || new Set()).add(i.l); });
  const years = [...new Set(all.map(s => (s.d || "").slice(0, 4)).filter(Boolean))].sort();
  el.innerHTML = `<div class="page"><div><h1>Sets</h1><p class="muted" style="margin-top:6px">${all.length} Sets. Der Betrag ist der Setwert: die Summe der Cardmarket-Trendpreise aller Karten.</p></div><div id="fb"></div><small class="muted" id="n"></small><div class="sgrid" id="sg"></div></div>`;
  const st = filterUI($("#fb", el), "sets", { ph: "Set suchen … (Name oder Kürzel, z. B. 151, MEW, OBF)", sort: [["new", "Neueste zuerst"], ["old", "Älteste zuerst"], ["value", "Höchster Setwert"], ["cards", "Meiste Karten"], ["mine", "Meine Sets zuerst"], ["name", "Name A–Z"]],
    defs: [{ k: "ser", label: "Serie", type: "select", opts: opt(seriesList(all), "Alle Serien") }, { k: "y1", label: "Erschienen ab", type: "select", opts: opt(years.map(y => [y, y]), "beliebig") }, { k: "y2", label: "Erschienen bis", type: "select", opts: opt(years.slice().reverse().map(y => [y, y]), "beliebig") }, { k: "vmin", label: "Setwert ab €", type: "num" }, { k: "mine", label: "Nur Sets mit Karten in meiner Sammlung", type: "check" }],
    onChange: () => draw() });
  const draw = () => { const q = st.q.toLowerCase().trim();
    let L = all.filter(s => (!st.ser || s.s === st.ser) && (!q || (Object.values(s.n || {}).join(" ") + " " + (s.a || "") + " " + s.id).toLowerCase().includes(q)) && (!st.y1 || (s.d || "").slice(0, 4) >= st.y1) && (!st.y2 || (s.d || "").slice(0, 4) <= st.y2) && (!st.vmin || (s.v || 0) >= +st.vmin) && (!st.mine || owned[s.id]));
    const so = { old: (a, b) => (a.d || "").localeCompare(b.d || ""), value: (a, b) => (b.v || 0) - (a.v || 0), cards: (a, b) => b.t - a.t, mine: (a, b) => ((owned[b.id] || new Set()).size - (owned[a.id] || new Set()).size), name: (a, b) => setName(a).localeCompare(setName(b)) }[st.sort]; if (so) L = L.slice().sort(so);
    $("#n", el).textContent = L.length + " Sets";
    $("#sg", el).innerHTML = L.map(s => { const o = (owned[s.id] || new Set()).size; return `<button class="stile" data-go="set" data-p="${esc(s.id)}"><div class="lg">${setLogo(s)}</div><div><b>${esc(setName(s))}</b><div><small class="muted">${esc((s.sn && (s.sn[t.lang] || s.sn.en)) || "")} · ${fmtDate(s.d)}</small></div></div><div class="spread"><small class="muted">${s.t} Karten${s.a ? " · " + esc(s.a) : ""}</small><span class="pr" title="Summe der Trendpreise aller Karten">${eur0(s.v)}</span></div>${o ? `<div class="bar thin"><i style="width:${Math.round(100 * o / s.t)}%"></i></div><small class="muted">${o} / ${s.t} in deiner Sammlung</small>` : ""}</button>`; }).join("") || `<div class="muted">Kein Set gefunden.</div>`;
  };
  draw();
});

/* ---------------- Set detail ---------------- */
const langMask = c => NAME_LANGS.reduce((m, l, i) => m | (c.n && c.n[l] ? 1 << i : 0), 0);
const LANG_OPTS = NAME_LANGS.map((l, i) => [String(1 << i), LANGS[l]]);
PAGES.set = guard(async (el, id) => {
  if (!id) return App.go("sets"); const sd = await setData(id); const s = D.setMap[id]; const t = T();
  const ownedQty = {}; t.items.filter(i => i.kind === "card" && i.set === id).forEach(i => ownedQty[i.l] = (ownedQty[i.l] || 0) + i.qty);
  const rarities = [...new Set(sd.cards.map(c => c.r).filter(Boolean))], types = [...new Set(sd.cards.flatMap(c => c.ty || []))].sort(), cats = [...new Set(sd.cards.map(c => c.k).filter(Boolean))];
  const val = sd.cards.reduce((a, c) => a + (trendOf(c.p) || 0), 0), nOwned = Object.keys(ownedQty).length; let tab = "cards";
  el.innerHTML = `<div class="page">
    <div class="set-head"><div class="stile" style="padding:10px;cursor:default"><div class="lg">${setLogo(s)}</div></div>
      <div style="min-width:0"><button class="btn ghost sm" data-go="sets">← Alle Sets</button><h1 style="margin-top:4px">${esc(setName(s))}</h1><small class="muted">${esc((s.sn && (s.sn[t.lang] || s.sn.en)) || "")} · erschienen ${fmtDate(s.d)} · ${s.c || s.t} Karten offiziell${s.t > (s.c || 0) ? ` (+${s.t - (s.c || 0)} Secret)` : ""}${s.a ? " · Kürzel " + esc(s.a) : ""}</small></div></div>
    <div class="tcg-kpis"><div class="tcg-kpi"><b>${eur0(val)}</b><small class="muted">Setwert (Σ Trend)</small></div><div class="tcg-kpi"><b>${nOwned} / ${sd.cards.length}</b><small class="muted">in deiner Sammlung</small></div><div class="tcg-kpi"><b>${eur0(sd.cards.filter(c => ownedQty[c.l]).reduce((a, c) => a + (trendOf(c.p) || 0) * ownedQty[c.l], 0))}</b><small class="muted">dein Anteil (Trend)</small></div><div class="tcg-kpi"><b>${eur0(sd.cards.reduce((m, c) => Math.max(m, trendOf(c.p) || 0), 0))}</b><small class="muted">teuerste Karte</small></div></div>
    <div class="tabs"><button data-tab="cards" class="on">Karten</button><button data-tab="sealed">Sealed-Produkte</button></div>
    <div id="fb"></div><small class="muted" id="cn"></small><div class="tgrid" id="cg"></div></div>`;
  const st = filterUI($("#fb", el), "set", { ph: "Name oder Nummer …", sort: [["num", "Nummer"], ["pd", "Preis ↓"], ["pa", "Preis ↑"], ["name", "Name"], ["hp", "KP ↓"]],
    defs: [{ k: "rar", label: "Seltenheit", type: "select", opts: opt(rarities.map(r => [r, r]), "Alle Seltenheiten") },
      cats.length > 1 && { k: "cat", label: "Kategorie", type: "select", opts: opt(cats.map(c => [c, CAT_DE[c] || c]), "Alle Kategorien") },
      types.length && { k: "ty", label: "Typ", type: "select", opts: opt(types.map(x => [x, TYPES_DE[x] || x]), "Alle Typen") },
      { k: "own", label: "Sammlung", type: "select", opts: [["", "Alle Karten"], ["own", "Nur meine"], ["miss", "Nur fehlende"]] },
      { k: "var", label: "Variante", type: "select", opts: [["", "Alle"], ["rev", "mit Reverse Holo"], ["sp", "mit Sonderdruck / Stempel"], ["holo", "Holo"]] },
      { k: "lm", label: "Gibt es auf", type: "select", opts: opt(LANG_OPTS, "jede Sprache") },
      { k: "pmin", label: "Preis ab €", type: "num" }, { k: "pmax", label: "Preis bis €", type: "num" },
      { k: "ill", label: "Illustrator", type: "text", ph: "z. B. Mitsuhiro Arita" }, { k: "hp", label: "KP ab", type: "num" }],
    init: { rar: "", own: "" }, onChange: () => drawCards() });
  const drawCards = () => { const q = st.q.toLowerCase().trim();
    let L = sd.cards.filter(c => (!q || (Object.values(c.n || {}).join(" ") + " " + c.l).toLowerCase().includes(q) || c.l.replace(/^0+/, "") === q.replace(/^0+/, "")) && (!st.rar || c.r === st.rar) && (!st.cat || c.k === st.cat) && (!st.ty || (c.ty || []).includes(st.ty))
      && (!st.own || (st.own === "own" ? ownedQty[c.l] : !ownedQty[c.l])) && (!st.var || (st.var === "rev" ? c.rv : st.var === "sp" ? (c.sp || []).length : (c.vt || []).includes("holo")))
      && (!st.lm || (langMask(c) & +st.lm)) && between(trendOf(c.p), st.pmin, st.pmax) && (!st.ill || (c.i || "").toLowerCase().includes(st.ill.toLowerCase())) && (!st.hp || (c.hp || 0) >= +st.hp));
    const so = { pd: (a, b) => (trendOf(b.p) || 0) - (trendOf(a.p) || 0), pa: (a, b) => (trendOf(a.p) ?? 1e9) - (trendOf(b.p) ?? 1e9), name: (a, b) => cardName(a).localeCompare(cardName(b)), hp: (a, b) => (b.hp || 0) - (a.hp || 0) }[st.sort]; if (so) L = L.slice().sort(so);
    $("#cg", el).innerHTML = L.map(c => `<button class="tcard ${!st.own && nOwned && !ownedQty[c.l] ? "missing" : ""}" data-card="${esc(c.l)}"><div class="im">${imgTag(id, c.l, "low", cardName(c))}${ownedQty[c.l] ? `<span class="own">✓ ${ownedQty[c.l]}</span>` : ""}</div><div class="nm">${esc(cardName(c))}</div><div class="meta"><span>#${esc(c.l)}${c.r ? " · " + esc(shortR(c.r)) : ""}</span><span class="pr">${eur(trendOf(c.p))}</span></div></button>`).join("") || `<div class="muted">Keine Karten für diese Filter.</div>`;
    $("#cn", el).textContent = L.length + " von " + sd.cards.length + " Karten";
  };
  const drawSealed = async () => { const box = $("#cg", el); box.innerHTML = `<div class="muted">Lade Produkte …</div>`; const all = await sealed(); const L = s.e ? all.filter(x => x.e === s.e) : []; box.innerHTML = L.length ? `<div class="col" style="gap:8px;grid-column:1/-1">${L.sort((a, b) => (b.p[0] || 0) - (a.p[0] || 0)).map(sealedRow).join("")}</div>` : `<div class="muted" style="grid-column:1/-1">Für dieses Set sind keine Sealed-Produkte im Cardmarket-Katalog zugeordnet. Schau unter „Produkte“ nach.</div>`; $("#cn", el).textContent = L.length + " Produkte"; };
  el.onclick = e => { const c = e.target.closest("[data-card]"); if (c) return openCard(id, c.dataset.card); const tb = e.target.closest("[data-tab]"); if (tb) { tab = tb.dataset.tab; $$("[data-tab]", el).forEach(b => b.classList.toggle("on", b === tb)); $("#fb", el).style.display = tab === "cards" ? "" : "none"; tab === "cards" ? drawCards() : drawSealed(); return; } const sr = e.target.closest("[data-sealed]"); if (sr) openSealed(+sr.dataset.sealed); };
  drawCards();
});
const shortR = r => ({ "Special illustration rare": "SIR", "Illustration rare": "IR", "Double rare": "RR", "Ultra Rare": "UR", "Hyper rare": "HR", "Common": "C", "Uncommon": "U", "Rare": "R", "Rare Holo": "Holo", "ACE SPEC Rare": "ACE" }[r] || r);

/* ---------------- shared: "your copy" price block (language / condition / Cardmarket link) ---------------- */
function estHTML(tr, lang, cond, kind) {
  if (tr == null) return `<small class="muted">Für diese Variante gibt es keinen Cardmarket-Preis. Trag unten einen eigenen Preis ein.</small>`;
  const f = factor(lang, cond, kind), est = adjPrice(tr, lang, cond, kind);
  return `<div class="spread" style="align-items:flex-end"><div><span class="eyebrow">Wert für ${esc(LANGS[lang] || lang)}${kind === "sealed" ? "" : " · " + esc(cond)}</span><div class="pr" style="font-size:24px;margin-top:2px">${eur(est)}</div></div>
    <small class="muted" style="text-align:right">${f === 1 ? `Cardmarket-Trend (alle Sprachen).<br><button class="linkbtn" data-go="settings">Sprach-/Zustandsfaktoren einstellen</button>` : `Trend ${eur(tr)}<br>× ${Math.round(fL(lang) * 100)} % Sprache${kind === "sealed" ? "" : ` × ${Math.round(fC(cond) * 100)} % Zustand`}`}</small></div>`;
}

/* ---------------- Card detail ---------------- */
async function openCard(setId, lid) {
  const sd = await setData(setId); const c = sd.map[lid]; const s = D.setMap[setId]; if (!c) return;
  const t = T(); const vs = variantsOf(c); const mine = t.items.filter(i => i.kind === "card" && i.set === setId && i.l === lid);
  t.recent = [{ set: setId, l: lid }, ...t.recent.filter(r => !(r.set === setId && r.l === lid))].slice(0, 12);
  const row = (label, a) => a ? `<tr><td>${esc(label)}</td><td><b>${eur(a[0])}</b></td><td>${eur(a[2])}</td><td>${eur(a[1])}</td><td>${eur(a[3])}</td><td>${eur(a[4])}</td><td>${eur(a[5])}</td></tr>` : "";
  const names = NAME_LANGS.filter(l => c.n[l]).map(l => `<span class="chip" title="${LANGS[l]}">${l.toUpperCase()} · ${esc(c.n[l])}</span>`).join("");
  const w = t.watch.find(x => x.kind === "card" && x.set === setId && x.l === lid);
  App.modal(`<div class="spread"><div><h2>${esc(cardName(c))}</h2><small class="muted">${esc(setName(s))} · #${esc(c.l)}/${s.c || s.t}${c.r ? " · " + esc(c.r) : ""}</small></div><button class="btn ghost sm" data-close>✕</button></div>
    <div class="holo" id="ho"><div class="hc">${imgTag(setId, lid, "high", cardName(c))}<div class="gl"></div></div></div>
    <div class="seg" style="justify-content:center;align-self:center">${NAME_LANGS.map(l => `<button data-il="${l}" class="${l === t.lang ? "on" : ""}">${l.toUpperCase()}</button>`).join("")}</div>
    <div class="row" style="gap:6px">${names}</div>
    ${c.i || c.hp || c.ty ? `<small class="muted">${[c.k && (CAT_DE[c.k] || c.k), c.ty && c.ty.map(x => TYPES_DE[x] || x).join("/"), c.hp && c.hp + " KP", c.i && "Illustration: " + c.i].filter(Boolean).map(esc).join(" · ")}</small>` : ""}
    <div><span class="eyebrow">Cardmarket-Preise (alle Sprachen)</span><div class="table-wrap" style="margin-top:6px"><table class="dt ptable"><thead><tr><th>Variante</th><th>Trend</th><th>ab</th><th>Ø</th><th>Ø 1T</th><th>Ø 7T</th><th>Ø 30T</th></tr></thead><tbody>
      ${row(c.vt && c.vt.includes("holo") && !c.vt.includes("normal") ? "Holo" : "Normal / Holo", c.p)}${row("Reverse Holo", c.rv)}${(c.sp || []).map(x => `<tr><td>${esc(x[0])}</td><td><b>${eur(x[2])}</b></td><td colspan="5" class="muted">eigenes Cardmarket-Produkt</td></tr>`).join("")}
      ${!c.p && !c.rv ? `<tr><td colspan="7" class="muted">Für diese Karte gibt es (noch) keinen Preis im Cardmarket-Preisführer.</td></tr>` : ""}</tbody></table></div>
      <small class="stamp">Stand ${fmtStamp(sd.u)} · Trend = Richtwert aus den letzten Verkäufen, meist Near Mint, alle Sprachen zusammen.</small></div>
    <div class="card col" style="gap:12px;background:var(--card2)"><b>Deine Karte</b>
      <div class="grid g3"><label class="fld">Variante<select id="av">${vs.map(([k, l]) => `<option value="${esc(k)}">${esc(l)}</option>`).join("")}</select></label><label class="fld">Sprache<select id="al">${Object.entries(LANGS).map(([k, l]) => `<option value="${k}" ${k === t.lang ? "selected" : ""}>${l}</option>`).join("")}</select></label><label class="fld">Zustand<select id="ac">${CONDS.map(([k, l]) => `<option value="${k}" ${k === "NM" ? "selected" : ""}>${k} – ${l}</option>`).join("")}</select></label></div>
      <div id="est"></div>
      <div class="row" style="gap:8px"><a class="btn pri" id="cml" target="_blank" rel="noopener">Angebote auf Cardmarket ↗</a><a class="btn ghost sm" target="_blank" rel="noopener" href="${cmSearch(c.n.en || cardName(c), s.e)}">Im Set suchen ↗</a><button class="btn ghost sm" id="wt">${w ? "★ Beobachtet" : "☆ Beobachten"}</button></div>
      <small class="muted">Der Cardmarket-Link öffnet genau diese Karte, gefiltert auf die gewählte Sprache und den Mindestzustand. Den dort gefundenen Preis kannst du als eigenen Preis übernehmen.</small>
      <div class="grid g2"><label class="fld">Eigener Preis / Stück (€)<input type="number" id="ao" step="0.01" inputmode="decimal" placeholder="leer = Schätzwert"></label><label class="fld">Anzahl<input type="number" id="aq" value="1" min="1" inputmode="numeric"></label></div>
      <div class="grid g2"><label class="fld">Kaufpreis / Stück (€)<input type="number" id="ab" step="0.01" inputmode="decimal" placeholder="optional"></label><label class="fld">Kaufdatum<input type="date" id="ad" value="${today()}"></label></div>
      <div class="grid g2"><label class="fld">Gradierung (optional)<input type="text" id="ag" placeholder="z. B. PSA 10"></label><label class="fld">Notiz<input type="text" id="an" placeholder="optional"></label></div>
      <button class="btn pri" id="add">＋ Zur Sammlung</button></div>
    ${mine.length ? `<div class="col" style="gap:6px"><span class="eyebrow">In deiner Sammlung</span>${mine.map(i => `<button class="srow" data-edit="${i.uid}"><span class="ic" style="font-weight:700">×${i.qty}</span><span class="t"><b>${esc(variantLabel(c, i.variant))} · ${esc(LANGS[i.lang] || i.lang)} · ${esc(i.cond)}</b><small class="muted">${esc(basis(i))} · Kauf ${eur(i.buy)} / Stück${i.grade ? " · " + esc(i.grade) : ""}</small></span><span class="v"><b>${eur(itemUnit(i) != null ? itemUnit(i) * i.qty : null)}</b></span></button>`).join("")}</div>` : ""}`, (m, close) => {
    const hc = $(".hc", m); const ho = $("#ho", m);
    ho.onpointermove = e => { const r = hc.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; if (x < -0.2 || x > 1.2 || y < -0.2 || y > 1.2) return; hc.style.transform = `rotateY(${(x - .5) * 22}deg) rotateX(${(.5 - y) * 22}deg)`; hc.style.setProperty("--gx", x * 100 + "%"); hc.style.setProperty("--gy", y * 100 + "%"); };
    ho.onpointerleave = () => { hc.style.transform = ""; };
    const upd = () => { const v = $("#av", m).value, l = $("#al", m).value, cd = $("#ac", m).value; $("#est", m).innerHTML = estHTML(trendOf(priceOf(c, v)), l, cd, "card");
      const a = $("#cml", m); a.href = cmUrl(cmOf(c, v), { lang: l, cond: cd, rev: v === "reverse" }) || cmSearch(c.n.en || cardName(c), s.e); a.textContent = `Angebote: ${LANGS[l] || l} · ab ${cd} ↗`; };
    ["#av", "#al", "#ac"].forEach(k => $(k, m).onchange = upd); upd();
    m.addEventListener("click", e => { const il = e.target.closest("[data-il]"); if (il) { $$("[data-il]", m).forEach(b => b.classList.toggle("on", b === il)); const [a, b] = cardImg(setId, lid, "high", il.dataset.il); const img = $(".hc img", m); img.style.display = ""; img.dataset.fb = b; img.src = a; const al = $("#al", m); if (al) { al.value = il.dataset.il; upd(); } } const ed = e.target.closest("[data-edit]"); if (ed) { close(); editItem(ed.dataset.edit); } if (e.target.closest("[data-go]")) close(); });
    $("#wt", m).onclick = () => { close(); watchForm({ kind: "card", set: setId, l: lid, name: cardName(c) + " (" + setName(s) + ")", variant: $("#av", m).value, cur: trendOf(priceOf(c, $("#av", m).value)) }); };
    $("#add", m).onclick = () => { const variant = $("#av", m).value; const arr = priceOf(c, variant); const it = { uid: "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), kind: "card", set: setId, l: lid, name: cardName(c), nameEn: c.n.en, short: `#${lid} · ${s.a || setName(s)}`, sub: `${setName(s)} · #${lid} · ${variantLabel(c, variant)}`, rar: c.r, variant, lang: $("#al", m).value, cond: $("#ac", m).value, qty: Math.max(1, +$("#aq", m).value || 1), own: numIn($("#ao", m).value), buy: numIn($("#ab", m).value) || 0, date: $("#ad", m).value, grade: $("#ag", m).value.trim(), note: $("#an", m).value.trim(), added: Date.now(), last: trendOf(arr) != null ? { t: trendOf(arr), a7: arr[4], a30: arr[5], at: sd.u } : null };
      if (it.own == null) delete it.own; t.items.push(it); snapshot(); App.save(); App.renderSide(); App.toast("Hinzugefügt", `${it.qty}× ${it.name}`, "◆"); close(); if (["set", "portfolio", "dash"].includes(App.route().v)) App.render(); };
  });
}
const variantLabel = (c, v) => v && v.startsWith("sp:") ? v.slice(3) : (VARIANT_LABEL[v] || v || "Normal");

/* ---------------- Sealed ---------------- */
function sealedRow(x) { const s = x.e && D.expMap && D.expMap[x.e]; const own = T().items.filter(i => i.kind === "sealed" && i.id === x.id).reduce((a, i) => a + i.qty, 0); return `<button class="srow" data-sealed="${x.id}"><span class="ic">${SEALED_ICON(x.c)}</span><span class="t"><b>${esc(x.n)}</b><small class="muted">${esc(x.c)}${s ? " · " + esc(setName(s)) : ""}${x.d ? " · " + x.d.slice(0, 4) : ""}${own ? ` · <span style="color:var(--acc)">✓ ${own} in Sammlung</span>` : ""}</small></span><span class="v"><b class="pr">${eur(trendOf(x.p))}</b><br><small class="muted">ab ${eur(x.p[2])}</small></span></button>`; }
PAGES.sealed = guard(async el => {
  const all = await sealed(); const cats = [...new Set(all.map(x => x.c))].sort(); const t = T(); let limit = 60;
  const setsWith = D.sets.filter(s => s.e && all.some(x => x.e === s.e)); const years = [...new Set(all.map(x => (x.d || "").slice(0, 4)).filter(Boolean))].sort().reverse();
  const ownIds = new Set(t.items.filter(i => i.kind === "sealed").map(i => i.id));
  el.innerHTML = `<div class="page" style="max-width:900px"><div><h1>Produkte</h1><p class="muted" style="margin-top:6px">Displays, Elite Trainer Boxes, Booster, Blister, Tins und mehr – mit Cardmarket-Preis. Produktnamen wie auf Cardmarket (Englisch).</p></div>
    <div class="row" style="gap:6px;flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px" id="cats"><button class="chip" data-cat="">Alle</button>${cats.map(c => `<button class="chip" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}</div>
    <div id="fb"></div><small class="muted" id="sn"></small><div class="col" style="gap:8px" id="sl"></div></div>`;
  const st = filterUI($("#fb", el), "sealed", { ph: "Suchen … (z. B. 151 Elite Trainer, Display)", sort: [["new", "Neueste zuerst"], ["pd", "Preis ↓"], ["pa", "Preis ↑"], ["mv", "Stärkster Anstieg (7 vs. 30 Tage)"], ["name", "Name"]],
    defs: [{ k: "cat", label: "Kategorie", type: "select", opts: opt(cats.map(c => [c, c]), "Alle Kategorien") }, { k: "set", label: "Set", type: "select", opts: opt(setsWith.map(s => [String(s.e), setName(s)]), "Alle Sets") },
      { k: "y", label: "Im Katalog seit", type: "select", opts: opt(years.map(y => [y, y]), "beliebig") }, { k: "pmin", label: "Preis ab €", type: "num" }, { k: "pmax", label: "Preis bis €", type: "num" },
      { k: "mine", label: "Nur Produkte in meiner Sammlung", type: "check" }, { k: "all", label: "Auch Produkte ohne Preis zeigen", type: "check" }],
    onChange: () => { limit = 60; syncCats(); draw(); } });
  const syncCats = () => $$("[data-cat]", el).forEach(b => b.classList.toggle("on", b.dataset.cat === (st.cat || "")));
  const draw = () => { const q = st.q.toLowerCase().trim(); const words = q.split(/\s+/).filter(Boolean);
    let L = all.filter(x => (!st.cat || x.c === st.cat) && (st.all || trendOf(x.p) != null) && (!st.set || x.e === +st.set) && (!st.y || (x.d || "").slice(0, 4) === st.y) && between(trendOf(x.p), st.pmin, st.pmax) && (!st.mine || ownIds.has(x.id)) && (!words.length || words.every(w => (x.n + " " + x.c + " " + ((x.e && D.expMap[x.e]) ? setName(D.expMap[x.e]) : "")).toLowerCase().includes(w))));
    const so = { pd: (a, b) => (trendOf(b.p) || 0) - (trendOf(a.p) || 0), pa: (a, b) => (trendOf(a.p) ?? 1e9) - (trendOf(b.p) ?? 1e9), name: (a, b) => a.n.localeCompare(b.n), mv: (a, b) => (move(b.p) ?? -1e9) - (move(a.p) ?? -1e9) }[st.sort]; if (so) L = L.slice().sort(so);
    $("#sl", el).innerHTML = L.slice(0, limit).map(sealedRow).join("") + (L.length > limit ? `<button class="btn" id="more">Mehr anzeigen (${L.length - limit} weitere)</button>` : "") || `<div class="muted">Nichts gefunden.</div>`;
    $("#sn", el).textContent = L.length.toLocaleString("de-AT") + " Produkte"; const mo = $("#more", el); if (mo) mo.onclick = () => { limit += 60; draw(); };
  };
  el.onclick = e => { const c = e.target.closest("[data-cat]"); if (c) { st.cat = c.dataset.cat; const sel = $('[data-f="cat"]', el); if (sel) sel.value = st.cat; sel && sel.dispatchEvent(new Event("change", { bubbles: true })); return; } const r = e.target.closest("[data-sealed]"); if (r) openSealed(+r.dataset.sealed); };
  syncCats(); draw();
});
async function openSealed(id) {
  await sealed(); const x = D.sealedMap[id]; if (!x) return; const t = T(); const s = x.e && D.expMap[x.e]; const mine = t.items.filter(i => i.kind === "sealed" && i.id === id); const w = t.watch.find(v => v.kind === "sealed" && v.id === id);
  App.modal(`<div class="spread"><div class="row" style="gap:12px;flex-wrap:nowrap"><span class="srow" style="padding:0;border:0;background:none;display:block;width:auto"><span class="ic">${SEALED_ICON(x.c)}</span></span><div><h2>${esc(x.n)}</h2><small class="muted">${esc(x.c)}${s ? " · " + esc(setName(s)) : ""}${x.d ? " · im Katalog seit " + fmtDate(x.d) : ""}</small></div></div><button class="btn ghost sm" data-close>✕</button></div>
    <div class="tcg-kpis"><div class="tcg-kpi"><b class="pr">${eur(x.p[0])}</b><small class="muted">Trend</small></div><div class="tcg-kpi"><b>${eur(x.p[2])}</b><small class="muted">ab</small></div><div class="tcg-kpi"><b>${eur(x.p[1])}</b><small class="muted">Durchschnitt</small></div><div class="tcg-kpi"><b>${eur(x.p[4])}</b><small class="muted">Ø 7 Tage</small></div></div>
    <small class="stamp">Cardmarket-Preisführer · alle Sprachen zusammen.</small>
    <div class="card col" style="gap:12px;background:var(--card2)"><b>Dein Produkt</b>
      <div class="grid g2"><label class="fld">Sprache<select id="al">${Object.entries(LANGS).map(([k, l]) => `<option value="${k}" ${k === t.lang ? "selected" : ""}>${l}</option>`).join("")}</select></label><label class="fld">Zustand<select id="ac">${SEALED_COND.map(([k, l]) => `<option value="${k}">${l}</option>`).join("")}</select></label></div>
      <div id="est"></div>
      <div class="row" style="gap:8px"><a class="btn pri" id="cml" target="_blank" rel="noopener">Angebote auf Cardmarket ↗</a><button class="btn ghost sm" id="wt">${w ? "★ Beobachtet" : "☆ Beobachten"}</button></div>
      <div class="grid g2"><label class="fld">Eigener Preis / Stück (€)<input type="number" id="ao" step="0.01" inputmode="decimal" placeholder="leer = Schätzwert"></label><label class="fld">Anzahl<input type="number" id="aq" value="1" min="1" inputmode="numeric"></label></div>
      <div class="grid g2"><label class="fld">Kaufpreis / Stück (€)<input type="number" id="ab" step="0.01" inputmode="decimal" placeholder="optional"></label><label class="fld">Kaufdatum<input type="date" id="ad" value="${today()}"></label></div>
      <label class="fld">Notiz<input type="text" id="an" placeholder="optional"></label>
      <button class="btn pri" id="add">＋ Zur Sammlung</button></div>
    ${mine.length ? `<div class="col" style="gap:6px"><span class="eyebrow">In deiner Sammlung</span>${mine.map(i => `<button class="srow" data-edit="${i.uid}"><span class="ic" style="font-weight:700">×${i.qty}</span><span class="t"><b>${esc(LANGS[i.lang] || i.lang)} · ${esc((SEALED_COND.find(c => c[0] === i.cond) || [0, i.cond])[1])}</b><small class="muted">${esc(basis(i))} · Kauf ${eur(i.buy)} / Stück</small></span><span class="v"><b>${eur(itemUnit(i) != null ? itemUnit(i) * i.qty : null)}</b></span></button>`).join("")}</div>` : ""}`, (m, close) => {
    const upd = () => { const l = $("#al", m).value; $("#est", m).innerHTML = estHTML(trendOf(x.p), l, "", "sealed"); const a = $("#cml", m); a.href = cmUrl(id, { lang: l }); a.textContent = `Angebote: ${LANGS[l] || l} ↗`; };
    $("#al", m).onchange = upd; upd();
    m.addEventListener("click", e => { const ed = e.target.closest("[data-edit]"); if (ed) { close(); editItem(ed.dataset.edit); } if (e.target.closest("[data-go]")) close(); });
    $("#wt", m).onclick = () => { close(); watchForm({ kind: "sealed", id, name: x.n, cur: trendOf(x.p) }); };
    $("#add", m).onclick = () => { const it = { uid: "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), kind: "sealed", id, name: x.n, cat: x.c, e: x.e, short: x.c, sub: `${x.c}${s ? " · " + setName(s) : ""}`, lang: $("#al", m).value, cond: $("#ac", m).value, qty: Math.max(1, +$("#aq", m).value || 1), own: numIn($("#ao", m).value), buy: numIn($("#ab", m).value) || 0, date: $("#ad", m).value, note: $("#an", m).value.trim(), added: Date.now(), last: trendOf(x.p) != null ? { t: trendOf(x.p), a7: x.p[4], a30: x.p[5], at: D.meta && D.meta.updated } : null };
      if (it.own == null) delete it.own; t.items.push(it); snapshot(); App.save(); App.renderSide(); App.toast("Hinzugefügt", `${it.qty}× ${it.name}`, "▣"); close(); if (["portfolio", "dash", "sealed"].includes(App.route().v)) App.render(); };
  });
}

/* ---------------- Karten suchen (global index) ----------------
   index row: [set, nr, nameDe, nameEn, rarity, trend, reverseTrend, category, types, illustrator, hp, languageMask, cmId, specialCount] */
const normNr = x => String(x || "").toLowerCase().replace(/^0+(?=\d)/, "");
PAGES.cards = guard(async (el, pre) => {
  const idx = await index(); const t = T(); const rich = idx.length && idx[0].length > 7;
  const rarities = [...new Set(idx.map(r => r[4]).filter(Boolean))].sort(), types = rich ? [...new Set(idx.flatMap(r => (r[8] || "").split("/")).filter(Boolean))].sort() : [];
  const ownSet = new Set(t.items.filter(i => i.kind === "card").map(i => i.set + "|" + i.l)); let limit = 60;
  const abbr = {}; D.sets.forEach(s => { if (s.a) abbr[s.a.toLowerCase()] = s.id; });
  el.innerHTML = `<div class="page"><div><h1>Karten suchen</h1><p class="muted" style="margin-top:6px">Alle ${idx.length.toLocaleString("de-AT")} Karten aus ${D.sets.length} Sets. Name auf Deutsch oder Englisch, gern mit Set-Kürzel und Nummer (z. B. „Glurak MEW 199“). Ohne Suchbegriff siehst du die teuersten Karten.</p></div>
    <div id="fb"></div><small class="muted" id="n"></small><div class="tgrid" id="rs"></div><button class="btn" id="more" style="display:none">Mehr anzeigen</button></div>`;
  if (pre) (FST.cards = FST.cards || { sort: "pd" }).q = pre;
  const st = filterUI($("#fb", el), "cards", { ph: "z. B. Glurak, Charizard, Pikachu 25 …", sort: [["pd", "Preis ↓"], ["pa", "Preis ↑"], ["new", "Neueste Sets"], ["old", "Älteste Sets"], ["name", "Name"]],
    defs: [{ k: "ser", label: "Serie", type: "select", opts: opt(seriesList(D.sets), "Alle Serien") }, { k: "set", label: "Set", type: "select", opts: opt(D.sets.map(s => [s.id, setName(s) + (s.a ? " (" + s.a + ")" : "")]), "Alle Sets") },
      { k: "rar", label: "Seltenheit", type: "select", opts: opt(rarities.map(r => [r, r]), "Alle Seltenheiten") },
      rich && { k: "cat", label: "Kategorie", type: "select", opts: opt(Object.entries(CAT_DE), "Alle Kategorien") }, rich && types.length && { k: "ty", label: "Typ", type: "select", opts: opt(types.map(x => [x, TYPES_DE[x] || x]), "Alle Typen") },
      rich && { k: "lm", label: "Gibt es auf", type: "select", opts: opt(LANG_OPTS, "jede Sprache") },
      { k: "pmin", label: "Preis ab €", type: "num" }, { k: "pmax", label: "Preis bis €", type: "num" },
      rich && { k: "ill", label: "Illustrator", type: "text", ph: "z. B. Mitsuhiro Arita" }, rich && { k: "hp", label: "KP ab", type: "num" },
      { k: "own", label: "Sammlung", type: "select", opts: [["", "Alle Karten"], ["own", "Nur meine"], ["miss", "Nicht in meiner Sammlung"]] },
      { k: "rev", label: "Reverse-Holo-Preis mit berücksichtigen", type: "check" }, rich && { k: "sp", label: "Nur Karten mit Sonderdruck / Stempel", type: "check" }],
    init: { q: pre || "" }, onChange: () => { limit = 60; draw(); } });
  const draw = () => {
    const words = st.q.toLowerCase().trim().split(/\s+/).filter(Boolean); const setFromAbbr = words.map(w => abbr[w]).find(Boolean);
    const pv = r => st.rev ? Math.max(r[5] || 0, r[6] || 0) || null : r[5];
    let L = idx.filter(r => (!words.length || words.every(w => (r[2] + " " + r[3]).toLowerCase().includes(w) || normNr(r[1]) === normNr(w) || abbr[w] === r[0] || r[0].toLowerCase() === w))
      && (!st.ser || (D.setMap[r[0]] || {}).s === st.ser) && (!st.set || r[0] === st.set) && (!st.rar || r[4] === st.rar) && (!st.cat || r[7] === st.cat) && (!st.ty || (r[8] || "").split("/").includes(st.ty)) && (!st.lm || ((r[11] || 0) & +st.lm))
      && between(pv(r), st.pmin, st.pmax) && (!st.ill || (r[9] || "").toLowerCase().includes(st.ill.toLowerCase())) && (!st.hp || (r[10] || 0) >= +st.hp) && (!st.own || (st.own === "own" ? ownSet.has(r[0] + "|" + r[1]) : !ownSet.has(r[0] + "|" + r[1]))) && (!st.sp || r[13]));
    const anyF = words.length || st.ser || st.set || st.rar || st.cat || st.ty || st.lm || st.pmin || st.pmax || st.ill || st.hp || st.own || st.sp; if (!anyF) L = L.filter(r => r[5] != null);
    const sd = r => (D.setMap[r[0]] || {}).d || "";
    const so = { pd: (a, b) => (pv(b) || 0) - (pv(a) || 0), pa: (a, b) => (pv(a) ?? 1e9) - (pv(b) ?? 1e9), new: (a, b) => sd(b).localeCompare(sd(a)) || normNr(a[1]).localeCompare(normNr(b[1]), undefined, { numeric: true }), old: (a, b) => sd(a).localeCompare(sd(b)) || normNr(a[1]).localeCompare(normNr(b[1]), undefined, { numeric: true }), name: (a, b) => (t.lang === "de" ? a[2] : a[3]).localeCompare(t.lang === "de" ? b[2] : b[3]) }[st.sort];
    if (setFromAbbr && st.sort === "pd" && words.some(w => /^\d/.test(w))) { /* "MEW 199": exact hit first */ }
    if (so) L = L.slice().sort(so);
    $("#rs", el).innerHTML = L.slice(0, limit).map(r => { const s = D.setMap[r[0]]; const nm = t.lang === "en" ? r[3] : r[2]; const own = ownSet.has(r[0] + "|" + r[1]); return `<button class="tcard" data-card="${esc(r[0])}|${esc(r[1])}"><div class="im">${imgTag(r[0], r[1], "low", nm)}${own ? `<span class="own">✓</span>` : ""}</div><div class="nm">${esc(nm)}</div><div class="meta"><span>${esc(s ? (s.a || setName(s)) : r[0])} · #${esc(r[1])}</span><span class="pr">${eur(r[5])}</span></div>${st.rev && r[6] ? `<small class="muted">Reverse ${eur(r[6])}</small>` : ""}</button>`; }).join("") || `<div class="muted">Keine Karten gefunden.</div>`;
    $("#n", el).textContent = L.length.toLocaleString("de-AT") + " Karten" + (L.length > limit ? " · zeige " + limit : "");
    $("#more", el).style.display = L.length > limit ? "" : "none";
  };
  $("#more", el).onclick = () => { limit += 60; draw(); };
  el.onclick = e => { const c = e.target.closest("[data-card]"); if (c) { const [s, l] = c.dataset.card.split("|"); openCard(s, l); } };
  draw();
});

/* ---------------- Sammlung (portfolio) ---------------- */
PAGES.portfolio = guard(async el => {
  await sets().catch(() => null); const t = T();
  const ownedSets = [...new Set(t.items.filter(i => i.kind === "card").map(i => i.set))]; const rars = [...new Set(t.items.map(i => i.rar).filter(Boolean))].sort();
  const years = [...new Set(t.items.map(i => (i.date || "").slice(0, 4)).filter(Boolean))].sort().reverse(); const cats = [...new Set(t.items.filter(i => i.kind === "sealed").map(i => i.cat).filter(Boolean))].sort();
  el.innerHTML = `<div class="page" style="max-width:960px"><div class="spread"><div><h1>Sammlung</h1><p class="muted" style="margin-top:6px">Alles, was du erfasst hast – mit aktuellem Wert.</p></div><div class="row"><button class="btn sm" id="rf">↻ Preise</button><button class="btn sm ghost" id="csv">⤓ CSV</button></div></div>
    <div id="fb"></div><div class="col" style="gap:12px" id="pf"></div></div>`;
  const st = filterUI($("#fb", el), "portfolio", { ph: "In der Sammlung suchen …", sort: [["value", "Wert ↓"], ["unit", "Stückpreis ↓"], ["pl", "Gewinn € ↓"], ["plp", "Gewinn % ↓"], ["loss", "Verlust zuerst"], ["name", "Name"], ["added", "Zuletzt hinzugefügt"], ["bought", "Kaufdatum ↓"], ["group", "Gruppiert nach Set"]],
    defs: [{ k: "kind", label: "Art", type: "select", opts: [["", "Karten & Sealed"], ["card", "Nur Karten"], ["sealed", "Nur Sealed"]] },
      ownedSets.length && { k: "set", label: "Set", type: "select", opts: opt(ownedSets.map(s => [s, setName(D.setMap[s]) || s]), "Alle Sets") },
      cats.length && { k: "cat", label: "Produktart", type: "select", opts: opt(cats.map(c => [c, c]), "Alle Produktarten") },
      rars.length && { k: "rar", label: "Seltenheit", type: "select", opts: opt(rars.map(r => [r, r]), "Alle Seltenheiten") },
      { k: "var", label: "Variante", type: "select", opts: [["", "Alle"], ["normal", "Normal"], ["holo", "Holo"], ["reverse", "Reverse Holo"], ["sp", "Sonderdruck / Stempel"]] },
      { k: "lang", label: "Sprache", type: "select", opts: opt(Object.entries(LANGS), "Alle Sprachen") },
      { k: "cond", label: "Zustand", type: "select", opts: opt(CONDS.concat(SEALED_COND).map(([k, l]) => [k, (COND_CM[k] ? k + " – " : "") + l]), "Alle Zustände") },
      { k: "grade", label: "Gradierung", type: "select", opts: [["", "Egal"], ["y", "Nur gegradete"], ["n", "Nur ungegradete"]] },
      { k: "pl", label: "Gewinn/Verlust", type: "select", opts: [["", "Egal"], ["win", "Nur im Plus"], ["loss", "Nur im Minus"], ["nobuy", "Ohne Kaufpreis"]] },
      { k: "src", label: "Preisbasis", type: "select", opts: [["", "Egal"], ["own", "Eigener Preis"], ["trend", "Cardmarket-Schätzwert"], ["none", "Ohne Preis"]] },
      { k: "pmin", label: "Stückwert ab €", type: "num" }, { k: "pmax", label: "Stückwert bis €", type: "num" },
      years.length && { k: "y", label: "Gekauft im Jahr", type: "select", opts: opt(years.map(y => [y, y]), "Alle Jahre") }],
    onChange: () => draw() });
  const val = i => (itemUnit(i) || 0) * i.qty, pl = i => val(i) - (i.buy || 0) * i.qty;
  const f = i => { const q = st.q.toLowerCase().trim(); const u = itemUnit(i);
    return (!st.kind || i.kind === st.kind) && (!st.set || i.set === st.set) && (!st.cat || i.cat === st.cat) && (!st.rar || i.rar === st.rar) && (!st.var || (st.var === "sp" ? (i.variant || "").startsWith("sp:") : i.kind === "card" && (i.variant || "normal") === st.var))
      && (!st.lang || i.lang === st.lang) && (!st.cond || i.cond === st.cond) && (!st.grade || (st.grade === "y" ? !!i.grade : !i.grade)) && (!st.pl || (st.pl === "nobuy" ? !i.buy : i.buy && (st.pl === "win" ? pl(i) >= 0 : pl(i) < 0)))
      && (!st.src || (st.src === "own" ? hasOwn(i) : st.src === "none" ? u == null : !hasOwn(i) && u != null)) && between(u, st.pmin, st.pmax) && (!st.y || (i.date || "").startsWith(st.y))
      && (!q || (i.name + " " + (i.nameEn || "") + " " + (i.sub || "") + " " + (i.note || "") + " " + (i.grade || "")).toLowerCase().includes(q)); };
  const draw = () => {
    const L = t.items.filter(f); const tot = totals(f); const filtered = st.q || $(".fcount", el).textContent;
    const sorters = { value: (a, b) => val(b) - val(a), group: (a, b) => val(b) - val(a), unit: (a, b) => (itemUnit(b) || 0) - (itemUnit(a) || 0), pl: (a, b) => pl(b) - pl(a), loss: (a, b) => pl(a) - pl(b), plp: (a, b) => ((b.buy ? pl(b) / (b.buy * b.qty) : -1e9) - (a.buy ? pl(a) / (a.buy * a.qty) : -1e9)), name: (a, b) => a.name.localeCompare(b.name), added: (a, b) => (b.added || 0) - (a.added || 0), bought: (a, b) => (b.date || "").localeCompare(a.date || "") };
    L.sort(sorters[st.sort] || sorters.value);
    const rowHTML = i => { const u = itemUnit(i), v = val(i), p = pl(i); return `<button class="srow" data-edit="${i.uid}"><span class="ic">${i.kind === "card" ? `<img loading="lazy" src="${cardImg(i.set, i.l, "low", i.lang)[0]}" data-fb="${cardImg(i.set, i.l, "low", "en")[0]}" onerror="tcgImgErr(this)" alt="">` : SEALED_ICON(i.cat || "")}</span><span class="t"><b>${i.qty > 1 ? i.qty + "× " : ""}${esc(i.name)}</b><small class="muted">${esc(i.sub || "")} · ${esc((i.lang || "").toUpperCase())} · ${esc(i.kind === "card" ? i.cond : ((SEALED_COND.find(c => c[0] === i.cond) || [0, i.cond])[1]))}${i.grade ? " · " + esc(i.grade) : ""}</small><small class="basis">${esc(basis(i))}</small></span><span class="v"><b>${eur(u != null ? v : null)}</b><br>${i.qty > 1 && u != null ? `<small class="muted">${eur(u)} / Stk.</small><br>` : ""}${i.buy ? plSpan(p, p / (i.buy * i.qty) * 100) : ""}</span></button>`; };
    let list;
    if (st.sort === "group") { const G = {}; L.forEach(i => { const k = i.kind === "card" ? i.set : "__sealed"; (G[k] = G[k] || []).push(i); }); list = Object.entries(G).sort((a, b) => b[1].reduce((s, i) => s + val(i), 0) - a[1].reduce((s, i) => s + val(i), 0)).map(([k, arr]) => `<div class="spread" style="margin-top:8px"><b>${k === "__sealed" ? "Sealed-Produkte" : esc(setName(D.setMap[k]) || k)}</b><span class="pr">${eur(arr.reduce((s, i) => s + val(i), 0))}</span></div>${arr.map(rowHTML).join("")}`).join(""); }
    else list = L.map(rowHTML).join("");
    const bySet = {}; L.forEach(i => { const k = i.kind === "card" ? (setName(D.setMap[i.set]) || i.set) : "Sealed"; bySet[k] = (bySet[k] || 0) + val(i); }); const bars = Object.entries(bySet).sort((a, b) => b[1] - a[1]).slice(0, 8); const bmax = bars.length ? bars[0][1] || 1 : 1;
    $("#pf", el).innerHTML = `<div class="tcg-kpis"><div class="tcg-kpi"><b class="pr">${eur0(tot.value)}</b><small class="muted">Wert${filtered ? " (gefiltert)" : ""}</small></div><div class="tcg-kpi"><b>${eur0(tot.buy)}</b><small class="muted">Einkauf</small></div><div class="tcg-kpi"><b class="${tot.pl >= 0 ? "up" : "down"}">${tot.pl >= 0 ? "+" : "−"}${eur0(Math.abs(tot.pl))}</b><small class="muted">${tot.plPct != null ? pct(tot.plPct) : "Gewinn/Verlust"}</small></div><div class="tcg-kpi"><b>${tot.cards} / ${tot.sealed}</b><small class="muted">Karten / Sealed</small></div></div>
      ${!t.items.length ? `<div class="card empty-state"><b>Noch nichts in der Sammlung</b><small class="muted">Such eine Karte oder ein Produkt und tippe auf „Zur Sammlung“.</small><div class="row"><button class="btn pri" data-go="cards">Karte suchen</button><button class="btn" data-go="sealed">Produkte</button></div></div>` : ""}
      ${bars.length > 1 && st.sort !== "group" ? `<div class="card col bars" style="gap:2px"><span class="eyebrow">Wert nach Set</span>${bars.map(([k, v]) => `<div class="bar-row"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(k)}</span><span><i style="width:${Math.max(2, 100 * v / bmax)}%"></i></span><b class="tab">${eur0(v)}</b></div>`).join("")}</div>` : ""}
      <small class="muted">${L.length} von ${t.items.length} Einträgen${tot.unpriced ? ` · ${tot.unpriced} ohne Preis` : ""}</small><div class="col" style="gap:8px">${list}</div>`;
  };
  $("#rf", el).onclick = () => autoRefresh(true).then(draw);
  $("#csv", el).onclick = () => { const rows = [["Typ", "Name", "Name EN", "Set/Kategorie", "Nummer", "Variante", "Sprache", "Zustand", "Gradierung", "Anzahl", "Kaufpreis/Stk", "Cardmarket-Trend/Stk", "Eigener Preis/Stk", "Wert/Stk", "Preisbasis", "Wert", "Gewinn", "Kaufdatum", "Notiz"]].concat(t.items.filter(f).map(i => { const u = itemUnit(i); return [i.kind === "card" ? "Karte" : "Sealed", i.name, i.nameEn || "", i.kind === "card" ? setName(D.setMap[i.set]) || i.set : i.cat, i.l || "", i.kind === "card" ? variantLabel({}, i.variant) : "", LANGS[i.lang] || i.lang, i.cond, i.grade || "", i.qty, (i.buy || 0).toFixed(2), i.last && i.last.t != null ? i.last.t.toFixed(2) : "", hasOwn(i) ? (+i.own).toFixed(2) : "", u != null ? u.toFixed(2) : "", basis(i), u != null ? (u * i.qty).toFixed(2) : "", u != null ? (u * i.qty - (i.buy || 0) * i.qty).toFixed(2) : "", i.date || "", i.note || ""]; }));
    App.download("sammlung-" + today() + ".csv", "﻿" + rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(";")).join("\n"), "text/csv"); };
  el.onclick = e => { const b = e.target.closest("[data-edit]"); if (b) editItem(b.dataset.edit); };
  draw();
});
function openItem(uid) { const i = T().items.find(x => x.uid === uid); if (!i) return; if (i.kind === "card") openCard(i.set, i.l); else openSealed(i.id); }
function editItem(uid) {
  const t = T(), i = t.items.find(x => x.uid === uid); if (!i) return; const card = i.kind === "card";
  const rev = card && i.variant === "reverse"; const cmId = card ? (D.setData[i.set] ? cmOf(D.setData[i.set].map[i.l], i.variant) : null) : i.id;
  App.modal(`<div class="spread"><div><h2>${esc(i.name)}</h2><small class="muted">${esc(i.sub || "")}</small></div><button class="btn ghost sm" data-close>✕</button></div>
    <div class="tcg-kpis"><div class="tcg-kpi"><b id="eu">${eur(itemUnit(i))}</b><small class="muted" id="eba">${esc(basis(i))}</small></div><div class="tcg-kpi"><b>${eur(i.last && i.last.t)}</b><small class="muted">Cardmarket-Trend</small></div></div>
    <div class="grid g2"><label class="fld">Sprache<select id="el">${Object.entries(LANGS).map(([k, l]) => `<option value="${k}" ${k === i.lang ? "selected" : ""}>${l}</option>`).join("")}</select></label><label class="fld">Zustand<select id="ec">${(card ? CONDS : SEALED_COND).map(([k, l]) => `<option value="${k}" ${k === i.cond ? "selected" : ""}>${card ? k + " – " : ""}${l}</option>`).join("")}</select></label></div>
    <div class="row" style="gap:8px"><a class="btn sm" id="ecm" target="_blank" rel="noopener">Angebote auf Cardmarket ↗</a></div>
    <div class="grid g2"><label class="fld">Eigener Preis / Stück (€)<input type="number" id="eo" step="0.01" value="${hasOwn(i) ? i.own : ""}" inputmode="decimal" placeholder="leer = Schätzwert"></label><label class="fld">Anzahl<input type="number" id="eq" value="${i.qty}" min="1" inputmode="numeric"></label></div>
    <div class="grid g2"><label class="fld">Kaufpreis / Stück (€)<input type="number" id="eb" step="0.01" value="${i.buy || ""}" inputmode="decimal"></label><label class="fld">Kaufdatum<input type="date" id="ed" value="${esc(i.date || "")}"></label></div>
    <div class="grid g2">${card ? `<label class="fld">Gradierung<input type="text" id="eg" value="${esc(i.grade || "")}"></label>` : "<span></span>"}<label class="fld">Notiz<input type="text" id="en" value="${esc(i.note || "")}"></label></div>
    <div class="spread"><button class="btn danger sm" id="del">Entfernen</button><div class="row"><button class="btn ghost" id="op">${card ? "Karte" : "Produkt"} öffnen</button><button class="btn pri" id="sv">Speichern</button></div></div>`, (m, close) => {
    const upd = () => { const tmp = Object.assign({}, i, { lang: $("#el", m).value, cond: $("#ec", m).value, own: numIn($("#eo", m).value) }); $("#eu", m).textContent = eur(itemUnit(tmp)); $("#eba", m).textContent = basis(tmp);
      const a = $("#ecm", m); const u = cmUrl(cmId, { lang: tmp.lang, cond: card ? tmp.cond : "", rev }); if (u) { a.href = u; a.textContent = `Angebote: ${LANGS[tmp.lang] || tmp.lang}${card ? " · ab " + tmp.cond : ""} ↗`; } else { a.href = cmSearch(i.nameEn || i.name); a.textContent = "Auf Cardmarket suchen ↗"; } };
    ["#el", "#ec"].forEach(k => $(k, m).onchange = upd); $("#eo", m).oninput = upd; upd();
    $("#sv", m).onclick = () => { i.qty = Math.max(1, +$("#eq", m).value || 1); i.buy = numIn($("#eb", m).value) || 0; i.lang = $("#el", m).value; i.cond = $("#ec", m).value; const o = numIn($("#eo", m).value); if (o == null) delete i.own; else { i.own = o; i.ownAt = today(); } i.date = $("#ed", m).value; if (card) i.grade = $("#eg", m).value.trim(); i.note = $("#en", m).value.trim(); snapshot(); App.save(); close(); App.render(); App.renderSide(); };
    $("#del", m).onclick = () => { if (!confirm("Aus der Sammlung entfernen?")) return; t.items.splice(t.items.indexOf(i), 1); snapshot(); App.save(); close(); App.render(); App.renderSide(); };
    $("#op", m).onclick = () => { close(); openItem(uid); };
  });
  if (card && !D.setData[i.set]) setData(i.set).catch(() => null);
}

/* ---------------- Beobachtet (watchlist + price alerts) ---------------- */
function watchForm(w) {
  const t = T(); const ex = t.watch.find(x => x.kind === w.kind && (w.kind === "card" ? x.set === w.set && x.l === w.l : x.id === w.id)); const cur = ex || w;
  App.modal(`<div class="spread"><h2>Beobachten</h2><button class="btn ghost sm" data-close>✕</button></div><b>${esc(w.name)}</b><small class="muted">Aktueller Trendpreis: ${eur(w.cur)}</small>
    <div class="grid g2"><label class="fld">Alarm, wenn der Preis …<select id="wd"><option value="below" ${cur.dir !== "above" ? "selected" : ""}>fällt auf oder unter</option><option value="above" ${cur.dir === "above" ? "selected" : ""}>steigt auf oder über</option></select></label><label class="fld">Zielpreis (€, optional)<input type="number" id="wp" step="0.01" value="${cur.target || ""}" inputmode="decimal"></label></div>
    <small class="muted">Die App prüft bei jeder Preisaktualisierung. Mit erlaubten Benachrichtigungen bekommst du auch eine Mitteilung.</small>
    <div class="spread">${ex ? `<button class="btn danger sm" id="wr">Nicht mehr beobachten</button>` : "<span></span>"}<button class="btn pri" id="ws">Speichern</button></div>`, (m, close) => {
    $("#ws", m).onclick = () => { const o = ex || Object.assign({}, w); o.dir = $("#wd", m).value; o.target = numIn($("#wp", m).value); o.cur = w.cur; if (!ex) t.watch.push(o); App.save(); try { if (o.target && window.Notification && Notification.permission === "default") Notification.requestPermission(); } catch (e) {} close(); App.toast("Beobachtet", w.name, "☆"); if (App.route().v === "watch") App.render(); };
    const r = $("#wr", m); if (r) r.onclick = () => { t.watch.splice(t.watch.indexOf(ex), 1); App.save(); close(); if (App.route().v === "watch") App.render(); };
  });
}
PAGES.watch = guard(async el => {
  await sets(); const t = T(); if (t.watch.some(w => w.kind === "sealed")) await sealed().catch(() => null);
  await Promise.all([...new Set(t.watch.filter(w => w.kind === "card").map(w => w.set))].map(id => setData(id).catch(() => null))); checkWatch();
  el.innerHTML = `<div class="page" style="max-width:820px"><div><h1>Beobachtet</h1><p class="muted" style="margin-top:6px">Karten und Produkte, die du im Blick behalten willst – mit optionalem Preisalarm.</p></div>
    ${t.watch.length ? `<div class="col" style="gap:8px">${t.watch.map((w, k) => { const hit = w.target && w.cur != null && ((w.dir === "above" && w.cur >= w.target) || (w.dir !== "above" && w.cur <= w.target)); return `<button class="srow" data-w="${k}"><span class="ic">${w.kind === "card" ? `<img src="${cardImg(w.set, w.l, "low")[0]}" data-fb="${cardImg(w.set, w.l, "low", "en")[0]}" onerror="tcgImgErr(this)" alt="">` : SEALED_ICON("")}</span><span class="t"><b>${esc(w.name)}</b><small class="muted">${w.target ? `Alarm ${w.dir === "above" ? "≥" : "≤"} ${eur(w.target)}` : "ohne Zielpreis"}${hit ? ` · <span style="color:var(--acc)">Ziel erreicht!</span>` : ""}</small></span><span class="v"><b class="pr">${eur(w.cur)}</b></span></button>`; }).join("")}</div>` : `<div class="card empty-state"><b>Noch nichts beobachtet</b><small class="muted">Öffne eine Karte oder ein Produkt und tippe auf „☆ Beobachten“.</small></div>`}</div>`;
  el.onclick = e => { const b = e.target.closest("[data-w]"); if (!b) return; const w = t.watch[+b.dataset.w]; if (w.kind === "card") openCard(w.set, w.l); else openSealed(w.id); };
});

/* ---------------- settings additions ---------------- */
const origSettings = PAGES.settings;
PAGES.settings = (el, p) => { origSettings(el, p);
  [...el.querySelectorAll(".card h3")].forEach(h => { if (/KI-Assistent/.test(h.textContent)) h.closest(".card").remove(); });
  const a = ADJ(); const pctIn = (grp, k, l) => `<label class="fld">${esc(l)}<span class="pctin"><input type="number" min="0" max="300" step="1" inputmode="numeric" data-adj="${grp}|${k}" value="${a[grp][k] != null ? a[grp][k] : 100}"><i>%</i></span></label>`;
  const box = document.createElement("div"); box.className = "card col";
  box.innerHTML = `<h3>Sammlung</h3><label class="fld">Sprache für Kartennamen und Bilder<select id="tl">${NAME_LANGS.map(l => `<option value="${l}" ${l === T().lang ? "selected" : ""}>${LANGS[l]}</option>`).join("")}</select></label>
    <p class="muted" style="font-size:13.5px">Datenquellen: Preise aus dem offiziellen <b>Cardmarket-Preisführer</b> und -Produktkatalog (täglich von Cardmarket veröffentlicht, von der App automatisch geholt). Kartennamen und Bilder von <b>TCGdex</b>. Stand: ${D.meta ? fmtStamp(D.meta.updated) : "–"}.</p>
    <div class="row"><button class="btn sm" id="tr">↻ Preise jetzt prüfen</button></div>`;
  const adj = document.createElement("div"); adj.className = "card col";
  adj.innerHTML = `<h3>Preise anpassen</h3><p class="muted" style="font-size:13.5px">Der Cardmarket-Preisführer fasst alle Sprachen zusammen und gilt meist für Near Mint. Hier kannst du festlegen, wie viel Prozent davon eine Karte in einer bestimmten Sprache bzw. einem Zustand wert ist. 100 % = unverändert. Ein <b>eigener Preis</b> bei einem Eintrag hat immer Vorrang.</p>
    <span class="eyebrow">Sprache (gilt für Karten und Sealed)</span><div class="grid g4">${Object.entries(LANGS).map(([k, l]) => pctIn("lang", k, l)).join("")}</div>
    <span class="eyebrow">Zustand (nur Karten)</span><div class="grid g4">${CONDS.map(([k, l]) => pctIn("cond", k, k + " – " + l)).join("")}</div>
    <div class="row"><button class="btn ghost sm" id="adjr">Alle auf 100 % zurücksetzen</button></div>`;
  const page = el.querySelector(".page"); if (page) { page.insertBefore(adj, page.children[1] || null); page.insertBefore(box, adj); }
  $("#tl", box).onchange = e => { T().lang = e.target.value; App.save(); App.toast("Gespeichert", "Namen & Bilder: " + LANGS[e.target.value], "✓"); };
  $("#tr", box).onclick = () => autoRefresh(true);
  let tm; adj.addEventListener("input", e => { const d = e.target.dataset.adj; if (!d) return; const [g, k] = d.split("|"); const v = numIn(e.target.value); if (v == null || v === 100) delete a[g][k]; else a[g][k] = Math.max(0, Math.min(300, v)); clearTimeout(tm); tm = setTimeout(() => { snapshot(); App.save(); App.renderSide(); }, 400); });
  $("#adjr", adj).onclick = () => { a.lang = {}; a.cond = {}; $$("[data-adj]", adj).forEach(i => i.value = 100); snapshot(); App.save(); App.renderSide(); App.toast("Zurückgesetzt", "Alle Faktoren 100 %", "✓"); };
};
if (!document.getElementById("spin-kf")) { const st = document.createElement("style"); st.id = "spin-kf"; st.textContent = "@keyframes spin{to{transform:rotate(360deg)}}"; document.head.appendChild(st); }
window.TCG = { D, T, refreshPrices, openCard, openSealed, totals, itemUnit, cmUrl };
})();
