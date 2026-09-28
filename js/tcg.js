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
const LANGS = { de: "Deutsch", en: "Englisch", fr: "Französisch", it: "Italienisch", es: "Spanisch", pt: "Portugiesisch", ja: "Japanisch", ko: "Koreanisch", "zh-cn": "Chinesisch (vereinfacht)", "zh-tw": "Chinesisch (traditionell)", id: "Indonesisch / Thai", zh: "Chinesisch" };
const LANG_LIST = Object.entries(LANGS).filter(([k]) => k !== "zh");
const EDITION = { ja: "japanische", ko: "koreanische", "zh-cn": "vereinfacht-chinesische", "zh-tw": "traditionell-chinesische", id: "indonesisch/thailändische" };
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
[["dash", "Übersicht", "⌂"], ["portfolio", "Sammlung", "◆"], ["sets", "Sets", "▦"], ["cards", "Karten suchen", "⌕"], ["sealed", "Produkte", "▣"], ["wish", "Wunschliste", "♡"], ["watch", "Beobachtet", "☆"], ["path", "Sammler-Guide", "?"]].forEach(x => App.NAV.push(x));
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
async function sealed() { await sets(); if (!D.sealed) { const d = await getJSON("sealed.json", ver()); D.sealed = d.items.map(a => ({ id: a[0], n: a[1], c: a[2], e: a[3], d: a[4], p: [a[5], a[6], a[7], a[8], a[9], a[10]], img: a[11] || null })); D.sealedMap = Object.fromEntries(D.sealed.map(x => [x.id, x])); } return D.sealed; }
async function index() { await sets(); if (!D.index) { const d = await getJSON("index.json", ver()); D.index = d.c; D.idxMap = {}; d.c.forEach(r => { if (r[14]) D.idxMap[r[0] + "|" + r[1]] = r; }); } return D.index; }
const setName = (s, lang) => s ? ((s.n && (s.n[lang || T().lang] || s.n.en || s.n.de || s.n.ja || s.n.ko)) || s.id) : "";
const isAsia = s => !!(s && s.rg);
const cardName = (c, lang) => (c.n && (c.n[lang || T().lang] || c.n.de || c.n.en || c.n.ja || c.n.ko)) || "?";
window.tcgImgErr = img => { const list = (img.dataset.fb || "").split("|").filter(u => u && u !== img.src); if (list.length) { img.dataset.fb = list.slice(1).join("|"); img.src = list[0]; } else { img.style.display = "none"; const ph = img.parentElement && img.parentElement.querySelector(".ph"); if (ph) ph.style.display = "grid"; } };
/* image chain: TCGdex (chosen language) → TCGdex fallback → TCGplayer catalogue photo → placeholder */
const tpOf = (set, lid, tp) => { if (tp) return tp; const sd = D.setData[set]; const c = sd && sd.map[lid]; if (c && c.tp) return c.tp; const r = D.idxMap && D.idxMap[set + "|" + lid]; return (r && r[14]) || null; };
const TPIMG = (id, q) => id ? `https://tcgplayer-cdn.tcgplayer.com/product/${id}_${q === "high" ? "400" : "200"}w.jpg` : "";
const cardImg = (set, lid, q = "low", lang, tp) => { const l = lang || T().lang; const s = D.setMap[set]; if (!s) return ["", ""]; const t = TPIMG(tpOf(set, lid, tp), q);
  if (s.rg) { const b = ext => `${IMG}${s.il || "ja"}/${s.rs}/${s.rid}/${encodeURIComponent(lid)}/${q}.${ext}`; return [b("webp"), [b("png"), t].filter(Boolean).join("|")]; }
  const base = (L) => `${IMG}${L}/${s.s}/${s.id}/${encodeURIComponent(lid)}/${q}.webp`; const L = NAME_LANGS.includes(l) ? l : "en"; return [base(L), [L !== "en" ? base("en") : "", t].filter(Boolean).join("|")]; };
const imgTag = (set, lid, q, alt, lang) => { const [a, b] = cardImg(set, lid, q, lang); return `<img loading="lazy" decoding="async" src="${a}" data-fb="${esc(b)}" alt="${esc(alt || "")}" onerror="tcgImgErr(this)"><div class="ph" style="display:none">${esc(alt || "")}</div>`; };
const thumbImg = i => { const [a, b] = cardImg(i.set, i.l, "low", i.lang, i.tp); return `<img loading="lazy" src="${a}" data-fb="${esc(b)}" onerror="tcgImgErr(this)" alt="">`; };
const topCardImg = s => { if (!s.top) return ""; const [a, b] = cardImg(s.id, s.top, "low", undefined, s.tt); return `<img loading="lazy" class="topcard" src="${a}" data-fb="${esc(b)}" alt="" onerror="tcgImgErr(this)">`; };
const setLogo = s => { const l = T().lang; if (s.rg) return `<span class="jp-logo">${topCardImg(s)}<b>${esc(s.rid)}</b></span><span class="fb ph" style="display:none">${esc(s.rid)}</span>`; return `<img loading="lazy" src="${IMG}${l}/${s.s}/${s.id}/logo.webp" data-fb="${IMG}en/${s.s}/${s.id}/logo.webp" alt="" onerror="if(this.dataset.fb){tcgImgErr(this)}else{this.outerHTML=this.dataset.top||'';}" data-top="${esc(`<span class='jp-logo'>${topCardImg(s)}<b>${esc(s.a || "")}</b></span>`)}"><span class="fb ph" style="display:none">${esc(setName(s))}</span>`; };
const cmSearch = (q, exp) => `https://www.cardmarket.com/de/Pokemon/Products/Search?searchString=${encodeURIComponent(q)}${exp ? "&idExpansion=" + exp : ""}`;
/* Cardmarket ids: languages and minimum condition as used in Cardmarket's offer filters */
const LANG_CM = { en: 1, fr: 2, de: 3, es: 4, it: 5, zh: 6, "zh-cn": 6, ja: 7, pt: 8, ko: 10, "zh-tw": 11 };
const COND_CM = { MT: 1, NM: 2, EX: 3, GD: 4, LP: 5, PL: 6, PO: 7 };
const cmUrl = (id, o = {}) => { if (!id) return null; const q = new URLSearchParams({ idProduct: id }); if (o.lang && LANG_CM[o.lang]) q.set("language", LANG_CM[o.lang]); if (o.cond && COND_CM[o.cond]) q.set("minCondition", COND_CM[o.cond]); if (o.rev) q.set("isReverseHolo", "Y"); return "https://www.cardmarket.com/de/Pokemon/Products?" + q.toString(); };
const TYPES_DE = { Grass: "Pflanze", Fire: "Feuer", Water: "Wasser", Lightning: "Elektro", Psychic: "Psycho", Fighting: "Kampf", Darkness: "Finsternis", Metal: "Metall", Fairy: "Fee", Dragon: "Drache", Colorless: "Farblos" };
const CAT_DE = { Pokemon: "Pokémon", Trainer: "Trainer", Energy: "Energie" };
/* price adjustments: own price per entry, or trend x language factor x condition factor (all default 100 %) */
const ADJ = () => { const t = T(); t.adj = t.adj || {}; t.adj.lang = t.adj.lang || {}; t.adj.cond = t.adj.cond || {}; return t.adj; };
const fL = l => (ADJ().lang[l] != null ? ADJ().lang[l] : 100) / 100, fC = c => (ADJ().cond[c] != null ? ADJ().cond[c] : 100) / 100;
const factor = (lang, cond, kind, rg) => (rg ? 1 : fL(lang)) * (kind === "sealed" ? 1 : fC(cond));
const adjPrice = (base, lang, cond, kind, rg) => base == null ? null : Math.round(base * factor(lang, cond, kind, rg) * 100) / 100;
const hasOwn = it => it.own != null && it.own !== "" && !isNaN(it.own);
const basis = it => hasOwn(it) ? "Eigener Preis" : lpOf(it) ? `Cardmarket ${(LANGS[it.lang] || it.lang)}${it.kind === "sealed" ? "" : " · " + it.cond}, notiert ${fmtDate(lpOf(it).at)}` : (f => f === 1 ? "Cardmarket-Trend" : `Trend × ${Math.round(f * 100)} %`)(factor(it.lang, it.cond, it.kind, it.rg));
const cmOf = (card, variant, lang) => { if (!card) return null; if (lang && card.alt && card.alt[lang]) return card.alt[lang][0]; if (card.cml) return null; if (variant && variant.startsWith("sp:")) { const x = (card.sp || []).find(y => y[0] === variant.slice(3)); return x ? x[1] : card.cm; } return card.cm; };
const numIn = v => { const n = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isNaN(n) ? null : n; };
const VARIANT_LABEL = { normal: "Normal", holo: "Holo", reverse: "Reverse Holo" };
function variantsOf(card) { const v = []; (card.vt || ["normal"]).forEach(t => { if (t === "reverse") { if (card.rv) v.push(["reverse", "Reverse Holo"]); } else v.push([t, VARIANT_LABEL[t] || t]); }); if (!v.length) v.push(["normal", "Normal"]); (card.sp || []).forEach(s => v.push(["sp:" + s[0], s[0]])); return v; }
/* price of the edition in that language: Asian editions are separate Cardmarket products (card.alt) */
function priceOfLang(card, variant, lang) { if (card && lang && card.alt && card.alt[lang]) { const a = card.alt[lang]; return a[1] != null || a[2] != null ? [a[1], null, a[2], null, null, null] : null; } return priceOf(card, variant); }
function priceOf(card, variant) { if (!card) return null; if (variant === "reverse") return card.rv || null; if (variant && variant.startsWith("sp:")) { const s = (card.sp || []).find(x => x[0] === variant.slice(3)); return s ? [s[2], null, null, null, null, null] : null; } return card.p || null; }
const trendOf = arr => arr ? (arr[0] != null ? arr[0] : arr[1] != null ? arr[1] : arr[2]) : null;
const move = arr => arr && arr[4] != null && arr[5] ? (arr[4] - arr[5]) / arr[5] * 100 : null;

/* ---------------- portfolio ---------------- */
/* noted Cardmarket prices per language & condition: {key: {v, at}} — shared by all entries of the same card version */
const LP = () => { const t = T(); t.lp = t.lp || {}; return t.lp; };
const lpKey = (o) => o.kind === "sealed" ? `S|${o.id}|${o.lang}|${o.cond || ""}` : `${o.set}|${o.l}|${o.variant || "normal"}|${o.lang}|${o.cond}`;
const lpOf = o => LP()[lpKey(o)] || null;
const setLp = (o, v) => { const k = lpKey(o); if (v == null) delete LP()[k]; else LP()[k] = { v: Math.round(v * 100) / 100, at: today() }; };
function itemUnit(it) { if (hasOwn(it)) return +it.own; const lp = lpOf(it); if (lp) return lp.v; const b = it.last && it.last.t != null ? it.last.t : null; return adjPrice(b, it.lang, it.cond, it.kind, it.rg); }
/* ---------------- Wunschliste (export as Cardmarket "Wants" deck list) ---------------- */
const WL = () => { const t = T(); t.wish = t.wish || []; return t.wish; };
function wantsOf(c, s, variant, lang) {
  if (lang && c.alt && c.alt[lang] && c.alt[lang][3]) return c.alt[lang][3];
  if (variant && variant.startsWith("sp:")) { const x = (c.sp || []).find(y => y[0] === variant.slice(3)); if (x && x[3]) return x[3]; }
  return c.wl || `${c.n.en || cardName(c)} (${(s.n && s.n.en) || setName(s)})`;
}
const wishKey = w => w.kind === "sealed" ? `S|${w.id}|${w.lang}|${w.cond}` : `${w.set}|${w.l}|${w.variant}|${w.lang}|${w.cond}`;
function wishAdd(w, d = 1) { const L = WL(); const k = wishKey(w); const ex = L.find(x => wishKey(x) === k);
  if (ex) { ex.qty += d; if (ex.qty <= 0) L.splice(L.indexOf(ex), 1); } else if (d > 0) L.push(Object.assign({ uid: "w" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), qty: d, added: Date.now() }, w));
  App.save(); App.renderSide(); }
const wishCount = w => { const x = WL().find(y => wishKey(y) === wishKey(w)); return x ? x.qty : 0; };
function cardWish(c, s, setId, variant, lang, cond) { const arr = priceOfLang(c, variant, lang); return { kind: "card", set: setId, l: c.l, variant, lang, cond, name: cardName(c), nameEn: c.n.en, sub: `${setName(s)} · #${c.l} · ${variantLabel(c, variant)}`, wl: wantsOf(c, s, variant, lang), rev: variant === "reverse", price: trendOf(arr), cm: cmOf(c, variant, lang), tp: c.tp }; }
function totals(filter) { let value = 0, buy = 0, cards = 0, sealedN = 0, unpriced = 0; T().items.filter(filter || (() => true)).forEach(it => { const u = itemUnit(it); if (u == null) unpriced += it.qty; else value += u * it.qty; buy += (it.buy || 0) * it.qty; if (it.kind === "card") cards += it.qty; else sealedN += it.qty; }); return { value, buy, pl: value - buy, plPct: buy ? (value - buy) / buy * 100 : null, cards, sealed: sealedN, unpriced }; }
async function refreshPrices(force) {
  const t = T(); let changed = false;
  try { changed = await loadMeta(); } catch (e) { D.err = e.message; return false; }
  if (!changed && !force && t.lastPriced === D.meta.updated) return false;
  await sets();
  const setsNeeded = [...new Set(t.items.filter(i => i.kind === "card").map(i => i.set))];
  await Promise.all(setsNeeded.map(id => setData(id).catch(() => null)));
  if (t.items.some(i => i.kind === "sealed") || t.watch.some(w => w.kind === "sealed")) await sealed().catch(() => null);
  t.items.forEach(it => { let arr = null; if (it.kind === "card") { const sd = D.setData[it.set]; arr = sd && priceOfLang(sd.map[it.l], it.variant, it.lang); } else { const x = D.sealedMap && D.sealedMap[it.id]; arr = x && x.p; } const tr = trendOf(arr); if (tr != null) it.last = { t: tr, a7: arr[4], a30: arr[5], at: D.meta.updated }; });
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
/* product photos for sealed items (TCGplayer catalogue images, matched in the data build) */
const PIMG = (id, w = 200) => id ? `https://tcgplayer-cdn.tcgplayer.com/product/${id}_${w}w.jpg` : null;
const imgIdOf = i => { const x = D.sealedMap && D.sealedMap[i.id]; return (x && x.img) || i.img || null; };
const miniArt = (cat, e) => { const s = e && D.expMap && D.expMap[e]; const [c1, c2] = CAT_COL(cat || ""); const logo = s ? (s.rg ? `${IMG}${s.il || "ja"}/${s.rs}/${s.rid}/logo.webp` : `${IMG}en/${s.s}/${s.id}/logo.webp`) : "";
  return `<span class="mini-art" style="--c1:${c1};--c2:${c2}">${logo ? `<img src="${logo}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{innerHTML:this.dataset.ic}))" data-ic="${esc(SEALED_ICON(cat || ""))}">` : SEALED_ICON(cat || "")}</span>`; };
const sealedThumb = (imgId, cat, e) => !imgId ? miniArt(cat, e) : `<img loading="lazy" decoding="async" class="pimg" src="${PIMG(imgId)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{innerHTML:this.dataset.ic||''}))" data-ic="${esc(SEALED_ICON(cat || ""))}">`;
/* product "box art" when no photo exists: category-coloured package with the set logo */
const CAT_COL = c => /Display/.test(c) ? ["#F5C542", "#B8860B"] : /Elite/.test(c) ? ["#58A6FF", "#1F4E8C"] : /Booster/.test(c) ? ["#E36B2C", "#8C3A12"] : /Tin/.test(c) ? ["#9AA7B8", "#4B5563"] : /Blister/.test(c) ? ["#3FB950", "#1B5E2A"] : /Coin/.test(c) ? ["#E3AE1F", "#7A5A00"] : /Deck|Kit/.test(c) ? ["#F85149", "#7F1D1D"] : ["#B07CF7", "#4C1D95"];
const boxArt = (cat, e, name) => { const s = e && D.expMap && D.expMap[e]; const [c1, c2] = CAT_COL(cat || "");
  const logo = s ? (s.rg ? `${IMG}${s.il || "ja"}/${s.rs}/${s.rid}/logo.webp` : `${IMG}en/${s.s}/${s.id}/logo.webp`) : "";
  return `<div class="sart" style="--c1:${c1};--c2:${c2}"><div class="sart-box">${logo ? `<img src="${logo}" alt="" onerror="this.remove()">` : ""}<b>${esc(s ? setName(s) : (name || "").split(/[:(]/)[0])}</b></div><span class="sart-cat">${esc(cat || "Produkt")}</span></div>`; };
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
  host.innerHTML = (cfg.seg ? `<div class="seg fseg">${cfg.seg.opts.map(([v, l]) => `<button data-seg="${v}" class="${String(st[cfg.seg.k] || "") === v ? "on" : ""}">${esc(l)}</button>`).join("")}</div>` : "") + `<div class="fbar"><div class="wiki-search"><span>⌕</span><input type="search" data-f="q" value="${esc(st.q)}" placeholder="${esc(cfg.ph || "Suchen …")}" autocomplete="off"></div>
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
    const sg = e.target.closest("[data-seg]"); if (sg) { st[cfg.seg.k] = sg.dataset.seg; $$("[data-seg]", host).forEach(b => b.classList.toggle("on", b === sg)); fire(false); return; }
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
    ${movers.length ? `<div class="card col" style="gap:8px"><h3>Preisbewegungen (Ø 7 Tage vs. Ø 30 Tage)</h3>${movers.map(([i, m]) => `<button class="srow" data-item="${i.uid}"><span class="ic ${i.kind === "card" ? "" : "pbg"}">${i.kind === "card" ? `${thumbImg(i)}` : sealedThumb(imgIdOf(i), i.cat, i.e)}</span><span class="t"><b>${esc(i.name)}</b><small class="muted">${esc(i.sub || "")}</small></span><span class="v"><b>${eur(itemUnit(i))}</b><br>${moveChip(m)}</span></button>`).join("")}</div>` : ""}
    <div class="grid g3"><button class="card col" data-go="cards" style="text-align:left;cursor:pointer;gap:4px"><b>⌕ Karten suchen</b><small class="muted">Alle ${D.meta ? D.meta.cards.toLocaleString("de-AT") : ""} Karten, Top-Preise, Filter</small></button><button class="card col" data-go="sets" style="text-align:left;cursor:pointer;gap:4px"><b>▦ Sets</b><small class="muted">${D.sets ? D.sets.length : ""} Sets mit Bildern und Setwert</small></button><button class="card col" data-go="sealed" style="text-align:left;cursor:pointer;gap:4px"><b>▣ Produkte</b><small class="muted">Displays, ETBs, Booster, Tins …</small></button></div>
  </div>`;
  $("#rf", el).onclick = () => autoRefresh(true);
  el.onclick = e => { const b = e.target.closest("[data-item]"); if (b) openItem(b.dataset.item); };
});
function itemTile(i) { const u = itemUnit(i); return `<button class="tcard" data-item="${i.uid}"><div class="im">${i.kind === "card" ? imgTag(i.set, i.l, "low", i.name, i.lang) : (imgIdOf(i) ? `<img loading="lazy" class="pimg" src="${PIMG(imgIdOf(i), 400)}" alt="${esc(i.name)}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{innerHTML:this.dataset.art}).firstChild)" data-art="${esc(boxArt(i.cat, i.e, i.name))}">` : boxArt(i.cat, i.e, i.name))}${i.qty > 1 ? `<span class="own">×${i.qty}</span>` : ""}</div><div class="nm">${esc(i.name)}</div><div class="meta"><span>${esc(i.short || "")}</span><span class="pr">${eur(u != null ? u * i.qty : null)}</span></div></button>`; }

/* ---------------- Sets ---------------- */
const seriesList = all => { const out = []; all.forEach(s => { if (!out.some(x => x[0] === s.s)) out.push([s.s, (s.sn && (s.sn[T().lang] || s.sn.en)) || s.s]); }); return out; };
PAGES.sets = guard(async (el) => {
  const all = await sets(); const t = T(); const owned = {}; t.items.filter(i => i.kind === "card").forEach(i => { (owned[i.set] = owned[i.set] || new Set()).add(i.l); });
  const years = [...new Set(all.map(s => (s.d || "").slice(0, 4)).filter(Boolean))].sort();
  el.innerHTML = `<div class="page"><div><h1>Sets</h1><p class="muted" style="margin-top:6px">${all.length} Sets. Der Betrag ist der Setwert: die Summe der Cardmarket-Trendpreise aller Karten.</p></div><div id="fb"></div><small class="muted" id="n"></small><div class="sgrid" id="sg"></div></div>`;
  const st = filterUI($("#fb", el), "sets", { ph: "Set suchen … (Name oder Kürzel, z. B. 151, MEW, OBF)", sort: [["new", "Neueste zuerst"], ["old", "Älteste zuerst"], ["value", "Höchster Setwert"], ["cards", "Meiste Karten"], ["mine", "Meine Sets zuerst"], ["name", "Name A–Z"]], seg: { k: "rg", opts: REGION_SEG },
    defs: [{ k: "ser", label: "Serie", type: "select", opts: opt(seriesList(all), "Alle Serien") }, { k: "y1", label: "Erschienen ab", type: "select", opts: opt(years.map(y => [y, y]), "beliebig") }, { k: "y2", label: "Erschienen bis", type: "select", opts: opt(years.slice().reverse().map(y => [y, y]), "beliebig") }, { k: "vmin", label: "Setwert ab €", type: "num" }, { k: "mine", label: "Nur Sets mit Karten in meiner Sammlung", type: "check" }],
    init: { rg: "intl" }, onChange: () => draw() });
  const draw = () => { const q = st.q.toLowerCase().trim();
    let L = all.filter(s => inRegion(s, st.rg) && (!st.ser || s.s === st.ser) && (!q || (Object.values(s.n || {}).join(" ") + " " + (s.a || "") + " " + s.id).toLowerCase().includes(q)) && (!st.y1 || (s.d || "").slice(0, 4) >= st.y1) && (!st.y2 || (s.d || "").slice(0, 4) <= st.y2) && (!st.vmin || (s.v || 0) >= +st.vmin) && (!st.mine || owned[s.id]));
    const so = { old: (a, b) => (a.d || "").localeCompare(b.d || ""), value: (a, b) => (b.v || 0) - (a.v || 0), cards: (a, b) => b.t - a.t, mine: (a, b) => ((owned[b.id] || new Set()).size - (owned[a.id] || new Set()).size), name: (a, b) => setName(a).localeCompare(setName(b)) }[st.sort]; if (so) L = L.slice().sort(so);
    $("#n", el).textContent = L.length + " Sets";
    $("#sg", el).innerHTML = L.map(s => { const o = (owned[s.id] || new Set()).size; return `<button class="stile" data-go="set" data-p="${esc(s.id)}"><div class="lg">${setLogo(s)}</div><div><b>${rgBadge(s)}${esc(setName(s))}</b><div><small class="muted">${esc((s.sn && (s.sn[t.lang] || s.sn.en)) || "")} · ${fmtDate(s.d)}</small></div></div><div class="spread"><small class="muted">${s.t} Karten${s.a ? " · " + esc(s.a) : ""}</small><span class="pr" title="Summe der Trendpreise aller Karten">${eur0(s.v)}</span></div>${o ? `<div class="bar thin"><i style="width:${Math.round(100 * o / s.t)}%"></i></div><small class="muted">${o} / ${s.t} in deiner Sammlung</small>` : ""}</button>`; }).join("") || `<div class="muted">Kein Set gefunden.</div>`;
  };
  draw();
});

/* ---------------- Set detail ---------------- */
const langMask = c => c.lm || NAME_LANGS.reduce((m, l, i) => m | (c.n && c.n[l] ? 1 << i : 0), 0);
const LANG_OPTS = NAME_LANGS.map((l, i) => [String(1 << i), LANGS[l]]).concat([["64", "Japanisch"], ["128", "Koreanisch"]]);
const REGION_SEG = [["", "Alle"], ["intl", "International"], ["ja", "Japan & Korea"]];
const inRegion = (s, rg) => !rg || (rg === "ja" ? isAsia(s) : !isAsia(s));
const rgBadge = s => isAsia(s) ? `<span class="rgb">JP</span>` : "";
PAGES.set = guard(async (el, id) => {
  if (!id) return App.go("sets"); const sd = await setData(id); const s = D.setMap[id]; const t = T();
  const ownedQty = {}; t.items.filter(i => i.kind === "card" && i.set === id).forEach(i => ownedQty[i.l] = (ownedQty[i.l] || 0) + i.qty);
  const rarities = [...new Set(sd.cards.map(c => c.r).filter(Boolean))], types = [...new Set(sd.cards.flatMap(c => c.ty || []))].sort(), cats = [...new Set(sd.cards.map(c => c.k).filter(Boolean))];
  const val = sd.cards.reduce((a, c) => a + (trendOf(c.p) || 0), 0), nOwned = Object.keys(ownedQty).length; let tab = "cards";
  el.innerHTML = `<div class="page">
    <div class="set-head"><div class="stile" style="padding:10px;cursor:default"><div class="lg">${setLogo(s)}</div></div>
      <div style="min-width:0"><button class="btn ghost sm" data-go="sets">← Alle Sets</button><h1 style="margin-top:4px">${esc(setName(s))}</h1><small class="muted">${esc((s.sn && (s.sn[t.lang] || s.sn.en)) || "")} · erschienen ${fmtDate(s.d)} · ${s.c || s.t} Karten offiziell${s.t > (s.c || 0) ? ` (+${s.t - (s.c || 0)} Secret)` : ""}${s.a ? " · Kürzel " + esc(s.a) : ""}</small></div></div>${isAsia(s) ? `<div class="tip" ><span>🇯🇵</span><span>Japanisches Set${s.n.ko ? " (auch auf Koreanisch erschienen)" : ""}. Auf Cardmarket sind japanische Karten eigene Produkte – die Preise gelten also für die japanische Version. Koreanisch: Im Kartenfenster Sprache „Koreanisch“ wählen, der Link filtert die Angebote.</span></div>` : ""}
    <div class="tcg-kpis"><div class="tcg-kpi"><b>${eur0(val)}</b><small class="muted">Setwert (Σ Trend)</small></div><div class="tcg-kpi"><b>${nOwned} / ${sd.cards.length}</b><small class="muted">in deiner Sammlung</small></div><div class="tcg-kpi"><b>${eur0(sd.cards.filter(c => ownedQty[c.l]).reduce((a, c) => a + (trendOf(c.p) || 0) * ownedQty[c.l], 0))}</b><small class="muted">dein Anteil (Trend)</small></div><div class="tcg-kpi"><b>${eur0(sd.cards.reduce((m, c) => Math.max(m, trendOf(c.p) || 0), 0))}</b><small class="muted">teuerste Karte</small></div></div>
    <div class="tabs"><button data-tab="cards" class="on">Karten</button><button data-tab="sealed">Sealed-Produkte</button></div>
    <div id="qa"></div><div id="fb"></div><small class="muted" id="cn"></small><div class="tgrid" id="cg"></div></div>`;
  /* quick add: pick language / condition / variant once, then + / − directly on every card */
  const QA = t.qa = Object.assign({ on: false, lang: t.lang, cond: "NM", rev: false, target: "col" }, t.qa || {});
  const qaLangs = isAsia(s) ? ["ja"].concat([...new Set(sd.cards.flatMap(c => Object.keys(c.alt || {})))]).concat(sd.cards.some(c => c.n.ko) ? ["ko"] : []) : NAME_LANGS.concat(["ja", "ko"]);
  if (!qaLangs.includes(QA.lang)) QA.lang = qaLangs[0];
  const qaVar = c => QA.rev && (c.rv || (c.vt || []).includes("reverse")) ? "reverse" : variantsOf(c)[0][0];
  const qaMatch = (i, c) => i.kind === "card" && i.set === id && i.l === c.l && i.lang === QA.lang && i.cond === QA.cond && (i.variant || "normal") === qaVar(c) && !i.grade;
  const qaWish = c => cardWish(c, s, id, qaVar(c), QA.lang, QA.cond);
  const qaCount = c => QA.target === "wish" ? wishCount(qaWish(c)) : t.items.filter(i => qaMatch(i, c)).reduce((a, i) => a + i.qty, 0);
  const drawQA = () => { $("#qa", el).innerHTML = `<div class="qa-bar ${QA.on ? "on" : ""}"><button class="btn ${QA.on ? "pri" : ""}" data-qa-toggle>⚡ Schnell erfassen${QA.on ? " · an" : ""}</button>
      ${QA.on ? `<div class="seg qa-lang">${qaLangs.map(l => `<button data-qa-lang="${l}" class="${QA.lang === l ? "on" : ""}">${l.split("-")[0].toUpperCase()}${l.includes("-") ? "·" + l.split("-")[1].toUpperCase() : ""}</button>`).join("")}</div>
      <select data-qa-cond aria-label="Zustand">${CONDS.map(([k, l]) => `<option value="${k}" ${QA.cond === k ? "selected" : ""}>${k} – ${l}</option>`).join("")}</select>
      <div class="seg"><button data-qa-rev="0" class="${QA.rev ? "" : "on"}">Normal/Holo</button><button data-qa-rev="1" class="${QA.rev ? "on" : ""}">Reverse</button></div>
      <div class="seg"><button data-qa-target="col" class="${QA.target === "wish" ? "" : "on"}">◆ in Sammlung</button><button data-qa-target="wish" class="${QA.target === "wish" ? "on" : ""}">♡ auf Wunschliste</button></div>
      ${QA.target === "wish" ? `<button class="btn sm" data-qa-missing>♡ Alle fehlenden dieses Sets auf die Wunschliste</button>` : ""}
      <small class="muted">Tippe + / − auf einer Karte: ${QA.target === "wish" ? "Wunschliste" : "Sammlung"} · ${esc(LANGS[QA.lang] || QA.lang)} · ${QA.cond} · ${QA.rev ? "Reverse Holo" : "Normal/Holo"}</small>` : `<small class="muted">Karten mit + / − direkt in einer Sprache zur Sammlung hinzufügen</small>`}</div>`; };
  const qaChange = (c, d) => { if (QA.target === "wish") return wishAdd(qaWish(c), d); const ex = t.items.filter(i => qaMatch(i, c));
    if (d > 0) { if (ex.length) ex[0].qty++; else { const v = qaVar(c), arr = priceOfLang(c, v, QA.lang); t.items.push({ uid: "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), kind: "card", set: id, rg: s.rg || undefined, tp: c.tp || undefined, l: c.l, name: cardName(c), nameEn: c.n.en, short: `#${c.l} · ${s.a || setName(s)}`, sub: `${setName(s)} · #${c.l} · ${variantLabel(c, v)}`, rar: c.r, variant: v, lang: QA.lang, cond: QA.cond, qty: 1, buy: 0, date: today(), added: Date.now(), last: trendOf(arr) != null ? { t: trendOf(arr), a7: arr[4], a30: arr[5], at: sd.u } : null }); } }
    else if (ex.length) { const i = ex[ex.length - 1]; i.qty--; if (i.qty <= 0) t.items.splice(t.items.indexOf(i), 1); }
    ownedQty[c.l] = t.items.filter(i => i.kind === "card" && i.set === id && i.l === c.l).reduce((a, i) => a + i.qty, 0); if (!ownedQty[c.l]) delete ownedQty[c.l];
    snapshot(); App.save(); App.renderSide(); };
  drawQA();
  const st = filterUI($("#fb", el), "set:" + id, { ph: "Name oder Nummer …", sort: [["num", "Nummer"], ["pd", "Preis ↓"], ["pa", "Preis ↑"], ["name", "Name"], ["hp", "KP ↓"]],
    defs: [{ k: "rar", label: "Seltenheit", type: "select", opts: opt(rarities.map(r => [r, r]), "Alle Seltenheiten") },
      cats.length > 1 && { k: "cat", label: "Kategorie", type: "select", opts: opt(cats.map(c => [c, CAT_DE[c] || c]), "Alle Kategorien") },
      types.length && { k: "ty", label: "Typ", type: "select", opts: opt(types.map(x => [x, TYPES_DE[x] || x]), "Alle Typen") },
      { k: "own", label: "Sammlung", type: "select", opts: [["", "Alle Karten"], ["own", "Nur meine"], ["miss", "Nur fehlende"]] },
      { k: "var", label: "Variante", type: "select", opts: [["", "Alle"], ["rev", "mit Reverse Holo"], ["sp", "mit Sonderdruck / Stempel"], ["holo", "Holo"]] },
      { k: "lm", label: "Gibt es auf", type: "select", opts: opt(LANG_OPTS, "jede Sprache") },
      { k: "pmin", label: "Preis ab €", type: "num" }, { k: "pmax", label: "Preis bis €", type: "num" },
      { k: "ill", label: "Illustrator", type: "text", ph: "z. B. Mitsuhiro Arita" }, { k: "hp", label: "KP ab", type: "num" }],
    init: { rar: "", own: "" }, onChange: () => drawCards() });
  el.addEventListener("change", e => { if (e.target.matches("[data-qa-cond]")) { QA.cond = e.target.value; App.save(); drawQA(); drawCards(); } });
  const drawCards = () => { const q = st.q.toLowerCase().trim();
    let L = sd.cards.filter(c => (!q || (Object.values(c.n || {}).join(" ") + " " + c.l).toLowerCase().includes(q) || c.l.replace(/^0+/, "") === q.replace(/^0+/, "")) && (!st.rar || c.r === st.rar) && (!st.cat || c.k === st.cat) && (!st.ty || (c.ty || []).includes(st.ty))
      && (!st.own || (st.own === "own" ? ownedQty[c.l] : !ownedQty[c.l])) && (!st.var || (st.var === "rev" ? c.rv : st.var === "sp" ? (c.sp || []).length : (c.vt || []).includes("holo")))
      && (!st.lm || (langMask(c) & +st.lm)) && between(trendOf(c.p), st.pmin, st.pmax) && (!st.ill || (c.i || "").toLowerCase().includes(st.ill.toLowerCase())) && (!st.hp || (c.hp || 0) >= +st.hp));
    const so = { pd: (a, b) => (trendOf(b.p) || 0) - (trendOf(a.p) || 0), pa: (a, b) => (trendOf(a.p) ?? 1e9) - (trendOf(b.p) ?? 1e9), name: (a, b) => cardName(a).localeCompare(cardName(b)), hp: (a, b) => (b.hp || 0) - (a.hp || 0) }[st.sort]; if (so) L = L.slice().sort(so);
    $("#cg", el).innerHTML = L.map(c => `<div role="button" tabindex="0" class="tcard ${!st.own && nOwned && !ownedQty[c.l] ? "missing" : ""}" data-card="${esc(c.l)}"><div class="im">${imgTag(id, c.l, "low", cardName(c))}${ownedQty[c.l] ? `<span class="own">✓ ${ownedQty[c.l]}</span>` : ""}</div><div class="nm">${esc(cardName(c))}</div><div class="meta"><span>#${esc(c.l)}${c.r ? " · " + esc(shortR(c.r)) : ""}</span><span class="pr">${eur(trendOf(QA.on ? priceOfLang(c, qaVar(c), QA.lang) : c.p))}</span></div>${QA.on ? `<div class="qa-ctl" data-qa="${esc(c.l)}"><button data-qm aria-label="weniger">−</button><b>${qaCount(c)}</b><button data-qp aria-label="mehr">+</button></div>` : ""}</div>`).join("") || `<div class="muted">Keine Karten für diese Filter.</div>`;
    $("#cn", el).textContent = L.length + " von " + sd.cards.length + " Karten";
  };
  const drawSealed = async () => { const box = $("#cg", el); box.innerHTML = `<div class="muted">Lade Produkte …</div>`; const all = await sealed(); const L = s.e ? all.filter(x => x.e === s.e) : []; box.innerHTML = L.length ? `<div class="col" style="gap:8px;grid-column:1/-1">${L.sort((a, b) => (b.p[0] || 0) - (a.p[0] || 0)).map(sealedRow).join("")}</div>` : `<div class="muted" style="grid-column:1/-1">Für dieses Set sind keine Sealed-Produkte im Cardmarket-Katalog zugeordnet. Schau unter „Produkte“ nach.</div>`; $("#cn", el).textContent = L.length + " Produkte"; };
  el.onclick = e => {
    if (e.target.closest("[data-qa-toggle]")) { QA.on = !QA.on; App.save(); drawQA(); drawCards(); return; }
    const ql = e.target.closest("[data-qa-lang]"); if (ql) { QA.lang = ql.dataset.qaLang; App.save(); drawQA(); drawCards(); return; }
    const qr = e.target.closest("[data-qa-rev]"); if (qr) { QA.rev = qr.dataset.qaRev === "1"; App.save(); drawQA(); drawCards(); return; }
    const qt = e.target.closest("[data-qa-target]"); if (qt) { QA.target = qt.dataset.qaTarget; App.save(); drawQA(); drawCards(); return; }
    if (e.target.closest("[data-qa-missing]")) { let n = 0; sd.cards.forEach(c => { if (!ownedQty[c.l] && !wishCount(qaWish(c))) { wishAdd(qaWish(c), 1); n++; } }); App.toast("Wunschliste", `${n} fehlende Karten hinzugefügt (${LANGS[QA.lang] || QA.lang} · ${QA.cond})`, "♡"); drawCards(); return; }
    const qc = e.target.closest("[data-qa]"); if (qc) { const b = e.target.closest("[data-qm],[data-qp]"); if (b) { const c = sd.map[qc.dataset.qa]; qaChange(c, b.hasAttribute("data-qp") ? 1 : -1); $("b", qc).textContent = qaCount(c); const tile = qc.closest(".tcard"); tile.classList.toggle("missing", !!(nOwned && !ownedQty[c.l])); let ow = $(".own", tile); if (ownedQty[c.l]) { if (!ow) { ow = document.createElement("span"); ow.className = "own"; $(".im", tile).appendChild(ow); } ow.textContent = "✓ " + ownedQty[c.l]; } else if (ow) ow.remove(); b.classList.add("pulse"); setTimeout(() => b.classList.remove("pulse"), 250); } return; }
    const c = e.target.closest("[data-card]"); if (c) return openCard(id, c.dataset.card); const tb = e.target.closest("[data-tab]"); if (tb) { tab = tb.dataset.tab; $$("[data-tab]", el).forEach(b => b.classList.toggle("on", b === tb)); $("#fb", el).style.display = tab === "cards" ? "" : "none"; tab === "cards" ? drawCards() : drawSealed(); return; } const sr = e.target.closest("[data-sealed]"); if (sr) openSealed(+sr.dataset.sealed); };
  drawCards();
});
const shortR = r => ({ "Special illustration rare": "SIR", "Illustration rare": "IR", "Double rare": "RR", "Ultra Rare": "UR", "Hyper rare": "HR", "Common": "C", "Uncommon": "U", "Rare": "R", "Rare Holo": "Holo", "ACE SPEC Rare": "ACE" }[r] || r);

/* ---------------- shared: "your copy" price block (language / condition / Cardmarket link) ---------------- */
/* International cards: Cardmarket publishes one price for all languages. The price for one language/condition
   is read on Cardmarket (button) and noted here once – it then applies to every entry of that card version. */
function langPriceHTML(o, arr) {
  const where = `${esc(LANGS[o.lang] || o.lang)}${o.kind === "sealed" ? "" : " · " + esc(o.cond)}`, lp = lpOf(o), old = lp && (Date.now() - new Date(lp.at)) > 30 * 864e5;
  const all = arr ? `Cardmarket gesamt (alle Sprachen): Trend <b>${eur(arr[0])}</b> · günstigstes Angebot <b>${eur(arr[2])}</b>` : "Kein Cardmarket-Richtwert vorhanden.";
  return `<div class="col" style="gap:8px"><span class="eyebrow">Preis für ${where}</span>
    ${lp ? `<div class="spread" style="align-items:flex-end"><div class="pr" style="font-size:26px">${eur(lp.v)}</div><small class="muted">notiert am ${fmtDate(lp.at)}${old ? ` · <span style="color:var(--bad)">älter als 30 Tage</span>` : ""}</small></div>` : `<div class="muted" style="font-size:14px">Noch nicht notiert. Tippe auf „Angebote“, schau den günstigsten Preis für ${where} an und trag ihn hier ein:</div>`}
    <div class="row" style="gap:8px;flex-wrap:nowrap"><input type="number" step="0.01" min="0" inputmode="decimal" class="lp-in" placeholder="Preis ${where} in €" value="${lp ? lp.v : ""}" style="flex:1;min-width:0"><button class="btn sm pri lp-save">Speichern</button>${lp ? `<button class="btn sm ghost lp-del" title="entfernen">✕</button>` : ""}</div>
    <small class="muted">${all}</small></div>`;
}
function bindLangPrice(box, o, arr, after) {
  box.onclick = e => { if (e.target.closest(".lp-save")) { const v = numIn($(".lp-in", box).value); if (v == null) return; setLp(o, v); snapshot(); App.save(); App.renderSide(); App.toast("Preis notiert", `${LANGS[o.lang] || o.lang}: ${eur(v)}`, "✓"); after && after(); }
    if (e.target.closest(".lp-del")) { setLp(o, null); App.save(); after && after(); } };
  const inp = $(".lp-in", box); if (inp) inp.onkeydown = e => { if (e.key === "Enter") $(".lp-save", box).click(); };
}
function estHTML(tr, lang, cond, kind, rg, edition) {
  const where = `${esc(LANGS[lang] || lang)}${kind === "sealed" ? "" : " · " + esc(cond)}`;
  if (tr == null) return `<small class="muted">Für ${rg ? "diese Edition" : "diese Variante"} gibt es (noch) keinen Cardmarket-Richtwert. Schau über den Knopf unten auf Cardmarket nach und trag den Preis als eigenen Preis ein.</small>`;
  const f = factor(lang, cond, kind, rg), est = adjPrice(tr, lang, cond, kind, rg);
  if (rg) return `<div><span class="eyebrow">Cardmarket · ${EDITION[edition || "ja"] || "japanische"} Edition</span><div class="pr" style="font-size:24px;margin-top:2px">${eur(est)}</div><small class="muted">${edition && edition !== "ja" ? "Günstigstes Angebot bzw. Trend der" : "Trendpreis der"} ${EDITION[edition || "ja"] || "japanischen"} Ausgabe dieser Karte – auf Cardmarket ein eigenes Produkt, also wirklich der Preis dieser Sprache.</small></div>`;
  if (f === 1) return `<div><span class="eyebrow">Cardmarket-Richtwert · alle Sprachen</span><div class="pr" style="font-size:24px;margin-top:2px">${eur(est)}</div>
    <small class="muted">Das ist <b>kein</b> Preis speziell für ${where}: Cardmarket veröffentlicht frei nur einen gemeinsamen Trendpreis über alle Sprachen (meist Near Mint). Den echten Preis für ${where} zeigt der Knopf unten – den kannst du als <b>eigenen Preis</b> eintragen. Alternativ: <button class="linkbtn" data-go="settings">Prozent-Faktoren je Sprache/Zustand</button>.</small></div>`;
  return `<div><span class="eyebrow">Schätzwert für ${where}</span><div class="pr" style="font-size:24px;margin-top:2px">${eur(est)}</div><small class="muted">Cardmarket-Trend ${eur(tr)} (alle Sprachen) × ${Math.round(fL(lang) * 100)} % Sprache${kind === "sealed" ? "" : ` × ${Math.round(fC(cond) * 100)} % Zustand`} – deine Faktoren aus den Einstellungen. Den echten Preis zeigt der Knopf unten.</small></div>`;
}

/* ---------------- Card detail ---------------- */
async function openCard(setId, lid) {
  const sd = await setData(setId); const c = sd.map[lid]; const s = D.setMap[setId]; if (!c) return;
  const t = T(); const vs = variantsOf(c); const mine = t.items.filter(i => i.kind === "card" && i.set === setId && i.l === lid);
  t.recent = [{ set: setId, l: lid }, ...t.recent.filter(r => !(r.set === setId && r.l === lid))].slice(0, 12);
  const row = (label, a) => a ? `<tr><td>${esc(label)}</td><td><b>${eur(a[0])}</b></td><td>${eur(a[2])}</td><td>${eur(a[1])}</td><td>${eur(a[3])}</td><td>${eur(a[4])}</td><td>${eur(a[5])}</td></tr>` : "";
  const asia = isAsia(s), defLang = asia ? (c.n.ja ? "ja" : "ko") : t.lang, imgLangs = asia ? ["ja", "ko"].filter(l => l === (s.il || "ja") || c.n[l]) : NAME_LANGS;
  const names = NAME_LANGS.concat(["ja", "ko"]).filter(l => c.n[l]).map(l => `<span class="chip" title="${LANGS[l]}">${l.toUpperCase()} · ${esc(c.n[l])}</span>`).join("");
  const w = t.watch.find(x => x.kind === "card" && x.set === setId && x.l === lid);
  App.modal(`<div class="spread"><div><h2>${esc(cardName(c))}</h2><small class="muted">${esc(setName(s))} · #${esc(c.l)}/${s.c || s.t}${c.r ? " · " + esc(c.r) : ""}</small></div><button class="btn ghost sm" data-close>✕</button></div>
    <div class="holo" id="ho"><div class="hc">${imgTag(setId, lid, "high", cardName(c), asia ? defLang : undefined)}<div class="gl"></div></div></div>
    ${imgLangs.length > 1 ? `<div class="seg" style="justify-content:center;align-self:center">${imgLangs.map(l => `<button data-il="${l}" class="${l === (asia ? defLang : t.lang) ? "on" : ""}">${l.toUpperCase()}</button>`).join("")}</div>` : ""}
    <div class="row" style="gap:6px">${names}</div>
    ${c.i || c.hp || c.ty ? `<small class="muted">${[c.k && (CAT_DE[c.k] || c.k), c.ty && c.ty.map(x => TYPES_DE[x] || x).join("/"), c.hp && c.hp + " KP", c.i && "Illustration: " + c.i].filter(Boolean).map(esc).join(" · ")}</small>` : ""}
    <div><span class="eyebrow">${asia ? "Cardmarket-Preise (japanische Karte)" : "Cardmarket-Preise (alle Sprachen)"}</span><div class="table-wrap" style="margin-top:6px"><table class="dt ptable"><thead><tr><th>Variante</th><th title="Preis-Trend">Trend</th><th title="günstigstes aktuelles Angebot (alle Sprachen & Zustände)">ab</th><th title="Durchschnittlicher Verkaufspreis">Ø</th><th>Ø 1T</th><th>Ø 7T</th><th>Ø 30T</th></tr></thead><tbody>
      ${row(c.vt && c.vt.includes("holo") && !c.vt.includes("normal") ? "Holo" : "Normal / Holo", c.p)}${row("Reverse Holo", c.rv)}${(c.sp || []).map(x => `<tr><td>${esc(x[0])}</td><td><b>${eur(x[2])}</b></td><td colspan="5" class="muted">eigenes Cardmarket-Produkt</td></tr>`).join("")}
      ${!c.p && !c.rv ? `<tr><td colspan="7" class="muted">Für diese Karte gibt es (noch) keinen Preis im Cardmarket-Preisführer.</td></tr>` : ""}</tbody></table></div>
      <small class="stamp">Stand ${fmtStamp(sd.u)} · Trend = Richtwert aus den letzten Verkäufen, meist Near Mint${asia ? ". Japanische Karten sind auf Cardmarket eigene Produkte – der Preis gilt für die japanische Version." : ", alle Sprachen zusammen."}</small></div>
    <div class="col" style="gap:8px"><button class="btn ghost sm" id="ov" style="align-self:flex-start">⇄ Andere Versionen dieser Karte (${asia ? "international" : "auch japanisch"})</button><div id="ovl" class="col" style="gap:6px"></div></div>
    <div class="card col" style="gap:12px;background:var(--card2)"><b>Deine Karte</b>
      <div class="grid g3"><label class="fld">Variante<select id="av">${vs.map(([k, l]) => `<option value="${esc(k)}">${esc(l)}</option>`).join("")}</select></label><label class="fld">Sprache<select id="al">${(asia ? ["ja"].concat(Object.keys(c.alt || {})).concat(c.n.ko && !(c.alt || {}).ko ? ["ko"] : []) : Object.keys(LANGS).filter(k => k !== "zh")).map(k => `<option value="${k}" ${k === defLang ? "selected" : ""}>${LANGS[k]}${asia && (c.alt || {})[k] ? " – eigene Edition" : ""}</option>`).join("")}</select></label><label class="fld">Zustand<select id="ac">${CONDS.map(([k, l]) => `<option value="${k}" ${k === "NM" ? "selected" : ""}>${k} – ${l}</option>`).join("")}</select></label></div>
      <div id="est"></div>
      <div class="row" style="gap:8px"><a class="btn pri" id="cml" target="_blank" rel="noopener">Angebote auf Cardmarket ↗</a><a class="btn ghost sm" target="_blank" rel="noopener" href="${cmSearch(c.n.en || cardName(c), s.e)}">Im Set suchen ↗</a><button class="btn ghost sm" id="wt">${w ? "★ Beobachtet" : "☆ Beobachten"}</button></div>
      <small class="muted">Der Knopf öffnet genau diese Karte auf Cardmarket, gefiltert auf Sprache und Mindestzustand. Den günstigsten Preis dort oben bei „Preis für …“ eintragen – er gilt dann für alle deine Einträge dieser Karte in dieser Sprache und diesem Zustand.</small>
      <div class="grid g2"><label class="fld">Eigener Preis / Stück (€)<input type="number" id="ao" step="0.01" inputmode="decimal" placeholder="leer = Schätzwert"></label><label class="fld">Anzahl<input type="number" id="aq" value="1" min="1" inputmode="numeric"></label></div>
      <div class="grid g2"><label class="fld">Kaufpreis / Stück (€)<input type="number" id="ab" step="0.01" inputmode="decimal" placeholder="optional"></label><label class="fld">Kaufdatum<input type="date" id="ad" value="${today()}"></label></div>
      <div class="grid g2"><label class="fld">Gradierung (optional)<input type="text" id="ag" placeholder="z. B. PSA 10"></label><label class="fld">Notiz<input type="text" id="an" placeholder="optional"></label></div>
      <div class="row" style="gap:8px"><button class="btn pri" id="add" style="flex:1">＋ Zur Sammlung</button><button class="btn" id="wsh">♡ Wunschliste</button></div></div>
    ${mine.length ? `<div class="col" style="gap:6px"><span class="eyebrow">In deiner Sammlung</span>${mine.map(i => `<button class="srow" data-edit="${i.uid}"><span class="ic" style="font-weight:700">×${i.qty}</span><span class="t"><b>${esc(variantLabel(c, i.variant))} · ${esc(LANGS[i.lang] || i.lang)} · ${esc(i.cond)}</b><small class="muted">${esc(basis(i))} · Kauf ${eur(i.buy)} / Stück${i.grade ? " · " + esc(i.grade) : ""}</small></span><span class="v"><b>${eur(itemUnit(i) != null ? itemUnit(i) * i.qty : null)}</b></span></button>`).join("")}</div>` : ""}`, (m, close) => {
    const hc = $(".hc", m); const ho = $("#ho", m);
    ho.onpointermove = e => { const r = hc.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; if (x < -0.2 || x > 1.2 || y < -0.2 || y > 1.2) return; hc.style.transform = `rotateY(${(x - .5) * 22}deg) rotateX(${(.5 - y) * 22}deg)`; hc.style.setProperty("--gx", x * 100 + "%"); hc.style.setProperty("--gy", y * 100 + "%"); };
    ho.onpointerleave = () => { hc.style.transform = ""; };
    const upd = () => { const v = $("#av", m).value, l = $("#al", m).value, cd = $("#ac", m).value; const ed = asia && c.alt && c.alt[l];
      if (asia) $("#est", m).innerHTML = estHTML(trendOf(priceOfLang(c, v, l)), l, cd, "card", s.rg, ed ? l : "ja");
      else { const o = { kind: "card", set: setId, l: lid, variant: v, lang: l, cond: cd }; $("#est", m).innerHTML = langPriceHTML(o, priceOf(c, v)); bindLangPrice($("#est", m), o, priceOf(c, v), upd); }
      const a = $("#cml", m); a.href = (ed ? cmUrl(c.alt[l][0], { cond: cd }) : cmUrl(cmOf(c, v), { lang: l, cond: cd, rev: v === "reverse" })) || cmSearch(c.n.en || cardName(c), s.e); a.textContent = `Angebote: ${LANGS[l] || l} · ab ${cd} ↗`; };
    ["#av", "#al", "#ac"].forEach(k => $(k, m).onchange = upd); upd();
    // back from Cardmarket: jump straight to the price field
    $("#cml", m).addEventListener("click", () => { const back = () => { if (document.visibilityState !== "visible") return; document.removeEventListener("visibilitychange", back); const i = $(".lp-in", m); if (i) { i.scrollIntoView({ block: "center" }); i.focus(); } }; document.addEventListener("visibilitychange", back); });
    $("#ov", m).onclick = async e => { const box = $("#ovl", m); e.currentTarget.disabled = true; box.innerHTML = `<small class="muted">Suche …</small>`;
      try { const idx = await index(); const en = (c.n.en || "").toLowerCase(), de = (c.n.de || "").toLowerCase();
        const L = idx.filter(r => !(r[0] === setId && r[1] === lid) && ((en && (r[3] || "").toLowerCase() === en) || (de && (r[2] || "").toLowerCase() === de))).sort((a, b) => ((D.setMap[b[0]] || {}).d || "").localeCompare((D.setMap[a[0]] || {}).d || "")).slice(0, 24);
        box.innerHTML = L.length ? L.map(r => { const ss = D.setMap[r[0]]; return `<button class="srow" data-oc="${esc(r[0])}|${esc(r[1])}"><span class="ic"><img loading="lazy" src="${cardImg(r[0], r[1], "low", undefined, r[14])[0]}" data-fb="${esc(cardImg(r[0], r[1], "low", undefined, r[14])[1])}" onerror="tcgImgErr(this)" alt=""></span><span class="t"><b>${rgBadge(ss)}${esc(setName(ss))}</b><small class="muted">#${esc(r[1])}${r[4] ? " · " + esc(r[4]) : ""}${ss && ss.d ? " · " + ss.d.slice(0, 4) : ""}</small></span><span class="v"><b class="pr">${eur(r[5])}</b></span></button>`; }).join("") : `<small class="muted">Keine andere Version mit genau diesem Namen gefunden.</small>`;
      } catch (err) { box.innerHTML = `<small class="muted">Konnte nicht geladen werden.</small>`; } };
    m.addEventListener("click", e => { const il = e.target.closest("[data-il]"); if (il) { $$("[data-il]", m).forEach(b => b.classList.toggle("on", b === il)); const [a, b] = cardImg(setId, lid, "high", il.dataset.il); const img = $(".hc img", m); img.style.display = ""; const ph = $(".hc .ph", m); if (ph) ph.style.display = "none"; img.dataset.fb = b; img.src = a; const al = $("#al", m); if (al) { al.value = il.dataset.il; upd(); } } const ed = e.target.closest("[data-edit]"); if (ed) { close(); editItem(ed.dataset.edit); } if (e.target.closest("[data-go]")) close(); const oc = e.target.closest("[data-oc]"); if (oc) { close(); const [a, b] = oc.dataset.oc.split("|"); openCard(a, b); } });
    $("#wsh", m).onclick = () => { const w = cardWish(c, s, setId, $("#av", m).value, $("#al", m).value, $("#ac", m).value); wishAdd(w, Math.max(1, +$("#aq", m).value || 1)); App.toast("Auf der Wunschliste", `${w.name} · ${LANGS[w.lang] || w.lang} · ${w.cond}`, "♡"); close(); };
    $("#wt", m).onclick = () => { close(); watchForm({ kind: "card", set: setId, l: lid, name: cardName(c) + " (" + setName(s) + ")", variant: $("#av", m).value, cur: trendOf(priceOf(c, $("#av", m).value)) }); };
    $("#add", m).onclick = () => { const variant = $("#av", m).value; const arr = priceOfLang(c, variant, $("#al", m).value); const it = { uid: "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), kind: "card", set: setId, rg: s.rg || undefined, tp: c.tp || undefined, l: lid, name: cardName(c), nameEn: c.n.en, short: `#${lid} · ${s.a || setName(s)}`, sub: `${setName(s)} · #${lid} · ${variantLabel(c, variant)}`, rar: c.r, variant, lang: $("#al", m).value, cond: $("#ac", m).value, qty: Math.max(1, +$("#aq", m).value || 1), own: numIn($("#ao", m).value), buy: numIn($("#ab", m).value) || 0, date: $("#ad", m).value, grade: $("#ag", m).value.trim(), note: $("#an", m).value.trim(), added: Date.now(), last: trendOf(arr) != null ? { t: trendOf(arr), a7: arr[4], a30: arr[5], at: sd.u } : null };
      if (it.own == null) delete it.own; t.items.push(it); snapshot(); App.save(); App.renderSide(); App.toast("Hinzugefügt", `${it.qty}× ${it.name}`, "◆"); close(); if (["set", "portfolio", "dash"].includes(App.route().v)) App.render(); };
  });
}
const variantLabel = (c, v) => v && v.startsWith("sp:") ? v.slice(3) : (VARIANT_LABEL[v] || v || "Normal");

/* ---------------- Sealed ---------------- */
const sealedAsia = x => !!((x.e && D.expMap && isAsia(D.expMap[x.e])) || /\b(japanese|korean|japan)\b/i.test(x.n));
function sealedRow(x) { const s = x.e && D.expMap && D.expMap[x.e]; const own = T().items.filter(i => i.kind === "sealed" && i.id === x.id).reduce((a, i) => a + i.qty, 0); return `<button class="srow" data-sealed="${x.id}"><span class="ic ${x.img ? "pbg" : "art"}">${sealedThumb(x.img, x.c, x.e)}</span><span class="t"><b>${esc(x.n)}</b><small class="muted">${esc(x.c)}${s ? " · " + esc(setName(s)) : ""}${x.d ? " · " + x.d.slice(0, 4) : ""}${own ? ` · <span style="color:var(--acc)">✓ ${own} in Sammlung</span>` : ""}</small></span><span class="v"><b class="pr">${eur(trendOf(x.p))}</b><br><small class="muted">ab ${eur(x.p[2])}</small></span></button>`; }
PAGES.sealed = guard(async el => {
  const all = await sealed(); const cats = [...new Set(all.map(x => x.c))].sort(); const t = T(); let limit = 60;
  const setsWith = D.sets.filter(s => s.e && all.some(x => x.e === s.e)); const years = [...new Set(all.map(x => (x.d || "").slice(0, 4)).filter(Boolean))].sort().reverse();
  const ownIds = new Set(t.items.filter(i => i.kind === "sealed").map(i => i.id));
  el.innerHTML = `<div class="page" style="max-width:900px"><div><h1>Produkte</h1><p class="muted" style="margin-top:6px">Displays, Elite Trainer Boxes, Booster, Blister, Tins und mehr – mit Cardmarket-Preis. Produktnamen wie auf Cardmarket (Englisch).</p></div>
    <div class="row" style="gap:6px;flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px" id="cats"><button class="chip" data-cat="">Alle</button>${cats.map(c => `<button class="chip" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}</div>
    <div id="fb"></div><small class="muted" id="sn"></small><div class="col" style="gap:8px" id="sl"></div></div>`;
  const st = filterUI($("#fb", el), "sealed", { ph: "Suchen … (z. B. 151 Elite Trainer, Display)", sort: [["new", "Neueste zuerst"], ["pd", "Preis ↓"], ["pa", "Preis ↑"], ["mv", "Stärkster Anstieg (7 vs. 30 Tage)"], ["name", "Name"]], seg: { k: "rg", opts: REGION_SEG },
    defs: [{ k: "cat", label: "Kategorie", type: "select", opts: opt(cats.map(c => [c, c]), "Alle Kategorien") }, { k: "set", label: "Set", type: "select", opts: opt(setsWith.map(s => [String(s.e), setName(s)]), "Alle Sets") },
      { k: "y", label: "Im Katalog seit", type: "select", opts: opt(years.map(y => [y, y]), "beliebig") }, { k: "pmin", label: "Preis ab €", type: "num" }, { k: "pmax", label: "Preis bis €", type: "num" },
      { k: "mine", label: "Nur Produkte in meiner Sammlung", type: "check" }, { k: "all", label: "Auch Produkte ohne Preis zeigen", type: "check" }],
    onChange: () => { limit = 60; syncCats(); draw(); } });
  const syncCats = () => $$("[data-cat]", el).forEach(b => b.classList.toggle("on", b.dataset.cat === (st.cat || "")));
  const draw = () => { const q = st.q.toLowerCase().trim(); const words = q.split(/\s+/).filter(Boolean);
    let L = all.filter(x => (!st.rg || (st.rg === "ja") === sealedAsia(x)) && (!st.cat || x.c === st.cat) && (st.all || trendOf(x.p) != null) && (!st.set || x.e === +st.set) && (!st.y || (x.d || "").slice(0, 4) === st.y) && between(trendOf(x.p), st.pmin, st.pmax) && (!st.mine || ownIds.has(x.id)) && (!words.length || words.every(w => (x.n + " " + x.c + " " + ((x.e && D.expMap[x.e]) ? setName(D.expMap[x.e]) : "")).toLowerCase().includes(w))));
    const so = { pd: (a, b) => (trendOf(b.p) || 0) - (trendOf(a.p) || 0), pa: (a, b) => (trendOf(a.p) ?? 1e9) - (trendOf(b.p) ?? 1e9), name: (a, b) => a.n.localeCompare(b.n), mv: (a, b) => (move(b.p) ?? -1e9) - (move(a.p) ?? -1e9) }[st.sort]; if (so) L = L.slice().sort(so);
    $("#sl", el).innerHTML = L.slice(0, limit).map(sealedRow).join("") + (L.length > limit ? `<button class="btn" id="more">Mehr anzeigen (${L.length - limit} weitere)</button>` : "") || `<div class="muted">Nichts gefunden.</div>`;
    $("#sn", el).textContent = L.length.toLocaleString("de-AT") + " Produkte"; const mo = $("#more", el); if (mo) mo.onclick = () => { limit += 60; draw(); };
  };
  el.onclick = e => { const c = e.target.closest("[data-cat]"); if (c) { st.cat = c.dataset.cat; const sel = $('[data-f="cat"]', el); if (sel) sel.value = st.cat; sel && sel.dispatchEvent(new Event("change", { bubbles: true })); return; } const r = e.target.closest("[data-sealed]"); if (r) openSealed(+r.dataset.sealed); };
  syncCats(); draw();
});
async function openSealed(id) {
  await sealed(); const x = D.sealedMap[id]; if (!x) return; const t = T(); const s = x.e && D.expMap[x.e]; const mine = t.items.filter(i => i.kind === "sealed" && i.id === id); const w = t.watch.find(v => v.kind === "sealed" && v.id === id);
  App.modal(`<div class="spread" style="flex-wrap:nowrap;align-items:flex-start"><div class="row" style="gap:12px;flex-wrap:nowrap;min-width:0">${x.img ? "" : `<span class="srow" style="padding:0;border:0;background:none;display:block;width:auto"><span class="ic">${SEALED_ICON(x.c)}</span></span>`}<div><h2>${esc(x.n)}</h2><small class="muted">${esc(x.c)}${s ? " · " + esc(setName(s)) : ""}${x.d ? " · im Katalog seit " + fmtDate(x.d) : ""}</small></div></div><button class="btn ghost sm" data-close>✕</button></div>
    ${x.img ? `<div class="pshow"><img src="${PIMG(x.img, 400)}" alt="${esc(x.n)}" onerror="this.parentElement.remove()"></div><small class="stamp" style="text-align:center">Produktfoto: TCGplayer-Katalog (englische Ausgabe, kann von der Sprachversion abweichen)</small>` : `<div class="pshow art">${boxArt(x.c, x.e, x.n)}</div>`}
    <div class="tcg-kpis"><div class="tcg-kpi"><b class="pr">${eur(x.p[0])}</b><small class="muted">Trend</small></div><div class="tcg-kpi"><b>${eur(x.p[2])}</b><small class="muted">ab</small></div><div class="tcg-kpi"><b>${eur(x.p[1])}</b><small class="muted">Durchschnitt</small></div><div class="tcg-kpi"><b>${eur(x.p[4])}</b><small class="muted">Ø 7 Tage</small></div></div>
    <small class="stamp">Cardmarket-Preisführer · alle Sprachen zusammen.</small>
    <div class="card col" style="gap:12px;background:var(--card2)"><b>Dein Produkt</b>
      <div class="grid g2"><label class="fld">Sprache<select id="al">${LANG_LIST.map(([k, l]) => `<option value="${k}" ${k === t.lang ? "selected" : ""}>${l}</option>`).join("")}</select></label><label class="fld">Zustand<select id="ac">${SEALED_COND.map(([k, l]) => `<option value="${k}">${l}</option>`).join("")}</select></label></div>
      <div id="est"></div>
      <div class="row" style="gap:8px"><a class="btn pri" id="cml" target="_blank" rel="noopener">Angebote auf Cardmarket ↗</a><button class="btn ghost sm" id="wt">${w ? "★ Beobachtet" : "☆ Beobachten"}</button></div>
      <div class="grid g2"><label class="fld">Eigener Preis / Stück (€)<input type="number" id="ao" step="0.01" inputmode="decimal" placeholder="leer = Schätzwert"></label><label class="fld">Anzahl<input type="number" id="aq" value="1" min="1" inputmode="numeric"></label></div>
      <div class="grid g2"><label class="fld">Kaufpreis / Stück (€)<input type="number" id="ab" step="0.01" inputmode="decimal" placeholder="optional"></label><label class="fld">Kaufdatum<input type="date" id="ad" value="${today()}"></label></div>
      <label class="fld">Notiz<input type="text" id="an" placeholder="optional"></label>
      <div class="row" style="gap:8px"><button class="btn pri" id="add" style="flex:1">＋ Zur Sammlung</button><button class="btn" id="wsh">♡ Wunschliste</button></div></div>
    ${mine.length ? `<div class="col" style="gap:6px"><span class="eyebrow">In deiner Sammlung</span>${mine.map(i => `<button class="srow" data-edit="${i.uid}"><span class="ic" style="font-weight:700">×${i.qty}</span><span class="t"><b>${esc(LANGS[i.lang] || i.lang)} · ${esc((SEALED_COND.find(c => c[0] === i.cond) || [0, i.cond])[1])}</b><small class="muted">${esc(basis(i))} · Kauf ${eur(i.buy)} / Stück</small></span><span class="v"><b>${eur(itemUnit(i) != null ? itemUnit(i) * i.qty : null)}</b></span></button>`).join("")}</div>` : ""}`, (m, close) => {
    const upd = () => { const l = $("#al", m).value; const o = { kind: "sealed", id, lang: l, cond: $("#ac", m).value }; $("#est", m).innerHTML = langPriceHTML(o, x.p); bindLangPrice($("#est", m), o, x.p, upd); const a = $("#cml", m); a.href = cmUrl(id, { lang: l }); a.textContent = `Angebote: ${LANGS[l] || l} ↗`; };
    $("#al", m).onchange = upd; $("#ac", m).onchange = upd; upd();
    m.addEventListener("click", e => { const ed = e.target.closest("[data-edit]"); if (ed) { close(); editItem(ed.dataset.edit); } if (e.target.closest("[data-go]")) close(); });
    $("#wt", m).onclick = () => { close(); watchForm({ kind: "sealed", id, name: x.n, cur: trendOf(x.p) }); };
    $("#wsh", m).onclick = () => { wishAdd({ kind: "sealed", id, name: x.n, sub: x.c, lang: $("#al", m).value, cond: "", wl: x.n, price: trendOf(x.p), cm: id, img: x.img, cat: x.c, e: x.e }, Math.max(1, +$("#aq", m).value || 1)); App.toast("Auf der Wunschliste", x.n, "♡"); close(); };
    $("#add", m).onclick = () => { const it = { uid: "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), kind: "sealed", id, img: x.img || undefined, name: x.n, cat: x.c, e: x.e, short: x.c, sub: `${x.c}${s ? " · " + setName(s) : ""}`, lang: $("#al", m).value, cond: $("#ac", m).value, qty: Math.max(1, +$("#aq", m).value || 1), own: numIn($("#ao", m).value), buy: numIn($("#ab", m).value) || 0, date: $("#ad", m).value, note: $("#an", m).value.trim(), added: Date.now(), last: trendOf(x.p) != null ? { t: trendOf(x.p), a7: x.p[4], a30: x.p[5], at: D.meta && D.meta.updated } : null };
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
  el.innerHTML = `<div class="page"><div><h1>Karten suchen</h1><p class="muted" style="margin-top:6px">Alle ${idx.length.toLocaleString("de-AT")} Karten aus ${D.sets.length} Sets – international sowie japanische &amp; koreanische. Name auf Deutsch oder Englisch, gern mit Set-Kürzel und Nummer (z. B. „Glurak MEW 199“). Ohne Suchbegriff siehst du die teuersten Karten.</p></div>
    <div id="fb"></div><small class="muted" id="n"></small><div class="tgrid" id="rs"></div><button class="btn" id="more" style="display:none">Mehr anzeigen</button></div>`;
  if (pre) (FST.cards = FST.cards || { sort: "pd" }).q = pre;
  const st = filterUI($("#fb", el), "cards", { ph: "z. B. Glurak, Charizard, Pikachu 25 …", sort: [["pd", "Preis ↓"], ["pa", "Preis ↑"], ["new", "Neueste Sets"], ["old", "Älteste Sets"], ["name", "Name"]], seg: { k: "rg", opts: REGION_SEG },
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
      && inRegion(D.setMap[r[0]], st.rg) && (!st.ser || (D.setMap[r[0]] || {}).s === st.ser) && (!st.set || r[0] === st.set) && (!st.rar || r[4] === st.rar) && (!st.cat || r[7] === st.cat) && (!st.ty || (r[8] || "").split("/").includes(st.ty)) && (!st.lm || ((r[11] || 0) & +st.lm))
      && between(pv(r), st.pmin, st.pmax) && (!st.ill || (r[9] || "").toLowerCase().includes(st.ill.toLowerCase())) && (!st.hp || (r[10] || 0) >= +st.hp) && (!st.own || (st.own === "own" ? ownSet.has(r[0] + "|" + r[1]) : !ownSet.has(r[0] + "|" + r[1]))) && (!st.sp || r[13]));
    const anyF = words.length || st.rg || st.ser || st.set || st.rar || st.cat || st.ty || st.lm || st.pmin || st.pmax || st.ill || st.hp || st.own || st.sp; if (!anyF) L = L.filter(r => r[5] != null);
    const sd = r => (D.setMap[r[0]] || {}).d || "";
    const so = { pd: (a, b) => (pv(b) || 0) - (pv(a) || 0), pa: (a, b) => (pv(a) ?? 1e9) - (pv(b) ?? 1e9), new: (a, b) => sd(b).localeCompare(sd(a)) || normNr(a[1]).localeCompare(normNr(b[1]), undefined, { numeric: true }), old: (a, b) => sd(a).localeCompare(sd(b)) || normNr(a[1]).localeCompare(normNr(b[1]), undefined, { numeric: true }), name: (a, b) => (t.lang === "de" ? a[2] : a[3]).localeCompare(t.lang === "de" ? b[2] : b[3]) }[st.sort];
    if (setFromAbbr && st.sort === "pd" && words.some(w => /^\d/.test(w))) { /* "MEW 199": exact hit first */ }
    if (so) L = L.slice().sort(so);
    $("#rs", el).innerHTML = L.slice(0, limit).map(r => { const s = D.setMap[r[0]]; const nm = t.lang === "en" ? r[3] : r[2]; const own = ownSet.has(r[0] + "|" + r[1]); return `<button class="tcard" data-card="${esc(r[0])}|${esc(r[1])}"><div class="im">${imgTag(r[0], r[1], "low", nm)}${own ? `<span class="own">✓</span>` : ""}${rgBadge(s)}</div><div class="nm">${esc(nm)}</div><div class="meta"><span>${esc(s ? (s.a || setName(s)) : r[0])} · #${esc(r[1])}</span><span class="pr">${eur(r[5])}</span></div>${st.rev && r[6] ? `<small class="muted">Reverse ${eur(r[6])}</small>` : ""}</button>`; }).join("") || `<div class="muted">Keine Karten gefunden.</div>`;
    $("#n", el).textContent = L.length.toLocaleString("de-AT") + " Karten" + (L.length > limit ? " · zeige " + limit : "");
    $("#more", el).style.display = L.length > limit ? "" : "none";
  };
  $("#more", el).onclick = () => { limit += 60; draw(); };
  el.onclick = e => { const c = e.target.closest("[data-card]"); if (c) { const [s, l] = c.dataset.card.split("|"); openCard(s, l); } };
  draw();
});

/* ---------------- Sammlung (portfolio) ---------------- */
PAGES.portfolio = guard(async el => {
  await sets().catch(() => null); const t = T(); if (t.items.some(i => i.kind === "sealed" && !i.img)) await sealed().catch(() => null);
  const ownedSets = [...new Set(t.items.filter(i => i.kind === "card").map(i => i.set))]; const rars = [...new Set(t.items.map(i => i.rar).filter(Boolean))].sort();
  const years = [...new Set(t.items.map(i => (i.date || "").slice(0, 4)).filter(Boolean))].sort().reverse(); const cats = [...new Set(t.items.filter(i => i.kind === "sealed").map(i => i.cat).filter(Boolean))].sort();
  el.innerHTML = `<div class="page" style="max-width:960px"><div class="spread"><div><h1>Sammlung</h1><p class="muted" style="margin-top:6px">Alles, was du erfasst hast – mit aktuellem Wert.</p></div><div class="row"><button class="btn sm pri" id="lpr">✎ Sprachpreise eintragen</button><button class="btn sm" id="rf">↻ Preise</button><button class="btn sm ghost" id="csv">⤓ CSV</button></div></div>
    <div id="fb"></div><div class="col" style="gap:12px" id="pf"></div></div>`;
  const st = filterUI($("#fb", el), "portfolio", { ph: "In der Sammlung suchen …", seg: { k: "lang", opts: [["", "Alle Sprachen"]].concat([...new Set(t.items.map(i => i.lang).filter(Boolean))].map(l => [l, LANGS[l] || l])) }, sort: [["value", "Wert ↓"], ["unit", "Stückpreis ↓"], ["pl", "Gewinn € ↓"], ["plp", "Gewinn % ↓"], ["loss", "Verlust zuerst"], ["name", "Name"], ["added", "Zuletzt hinzugefügt"], ["bought", "Kaufdatum ↓"], ["group", "Gruppiert nach Set"]],
    defs: [{ k: "kind", label: "Art", type: "select", opts: [["", "Karten & Sealed"], ["card", "Nur Karten"], ["sealed", "Nur Sealed"]] },
      { k: "rg", label: "Region", type: "select", opts: [["", "Alle"], ["intl", "International"], ["ja", "Japan & Korea"]] },
      ownedSets.length && { k: "set", label: "Set", type: "select", opts: opt(ownedSets.map(s => [s, setName(D.setMap[s]) || s]), "Alle Sets") },
      cats.length && { k: "cat", label: "Produktart", type: "select", opts: opt(cats.map(c => [c, c]), "Alle Produktarten") },
      rars.length && { k: "rar", label: "Seltenheit", type: "select", opts: opt(rars.map(r => [r, r]), "Alle Seltenheiten") },
      { k: "var", label: "Variante", type: "select", opts: [["", "Alle"], ["normal", "Normal"], ["holo", "Holo"], ["reverse", "Reverse Holo"], ["sp", "Sonderdruck / Stempel"]] },
      { k: "cond", label: "Zustand", type: "select", opts: opt(CONDS.concat(SEALED_COND).map(([k, l]) => [k, (COND_CM[k] ? k + " – " : "") + l]), "Alle Zustände") },
      { k: "grade", label: "Gradierung", type: "select", opts: [["", "Egal"], ["y", "Nur gegradete"], ["n", "Nur ungegradete"]] },
      { k: "pl", label: "Gewinn/Verlust", type: "select", opts: [["", "Egal"], ["win", "Nur im Plus"], ["loss", "Nur im Minus"], ["nobuy", "Ohne Kaufpreis"]] },
      { k: "src", label: "Preisbasis", type: "select", opts: [["", "Egal"], ["own", "Eigener Preis"], ["trend", "Cardmarket-Schätzwert"], ["none", "Ohne Preis"]] },
      { k: "pmin", label: "Stückwert ab €", type: "num" }, { k: "pmax", label: "Stückwert bis €", type: "num" },
      years.length && { k: "y", label: "Gekauft im Jahr", type: "select", opts: opt(years.map(y => [y, y]), "Alle Jahre") }],
    onChange: () => draw() });
  const val = i => (itemUnit(i) || 0) * i.qty, pl = i => val(i) - (i.buy || 0) * i.qty;
  const f = i => { const q = st.q.toLowerCase().trim(); const u = itemUnit(i);
    const ia = i.kind === "card" ? !!(i.rg || isAsia(D.setMap[i.set])) : ["ja", "ko"].includes(i.lang) || /\b(japanese|korean)\b/i.test(i.name);
    return (!st.kind || i.kind === st.kind) && (!st.rg || (st.rg === "ja") === ia) && (!st.set || i.set === st.set) && (!st.cat || i.cat === st.cat) && (!st.rar || i.rar === st.rar) && (!st.var || (st.var === "sp" ? (i.variant || "").startsWith("sp:") : i.kind === "card" && (i.variant || "normal") === st.var))
      && (!st.lang || i.lang === st.lang) && (!st.cond || i.cond === st.cond) && (!st.grade || (st.grade === "y" ? !!i.grade : !i.grade)) && (!st.pl || (st.pl === "nobuy" ? !i.buy : i.buy && (st.pl === "win" ? pl(i) >= 0 : pl(i) < 0)))
      && (!st.src || (st.src === "own" ? hasOwn(i) : st.src === "none" ? u == null : !hasOwn(i) && u != null)) && between(u, st.pmin, st.pmax) && (!st.y || (i.date || "").startsWith(st.y))
      && (!q || (i.name + " " + (i.nameEn || "") + " " + (i.sub || "") + " " + (i.note || "") + " " + (i.grade || "")).toLowerCase().includes(q)); };
  const draw = () => {
    const L = t.items.filter(f); const tot = totals(f); const filtered = st.q || $(".fcount", el).textContent;
    const sorters = { value: (a, b) => val(b) - val(a), group: (a, b) => val(b) - val(a), unit: (a, b) => (itemUnit(b) || 0) - (itemUnit(a) || 0), pl: (a, b) => pl(b) - pl(a), loss: (a, b) => pl(a) - pl(b), plp: (a, b) => ((b.buy ? pl(b) / (b.buy * b.qty) : -1e9) - (a.buy ? pl(a) / (a.buy * a.qty) : -1e9)), name: (a, b) => a.name.localeCompare(b.name), added: (a, b) => (b.added || 0) - (a.added || 0), bought: (a, b) => (b.date || "").localeCompare(a.date || "") };
    L.sort(sorters[st.sort] || sorters.value);
    const rowHTML = i => { const u = itemUnit(i), v = val(i), p = pl(i); return `<button class="srow" data-edit="${i.uid}"><span class="ic ${i.kind === "card" ? "" : "pbg"}">${i.kind === "card" ? `${thumbImg(i)}` : sealedThumb(imgIdOf(i), i.cat, i.e)}</span><span class="t"><b>${i.qty > 1 ? i.qty + "× " : ""}${esc(i.name)}</b><small class="muted">${esc(i.sub || "")} · ${esc((i.lang || "").toUpperCase())} · ${esc(i.kind === "card" ? i.cond : ((SEALED_COND.find(c => c[0] === i.cond) || [0, i.cond])[1]))}${i.grade ? " · " + esc(i.grade) : ""}</small><small class="basis">${esc(basis(i))}</small></span><span class="v"><b>${eur(u != null ? v : null)}</b><br>${i.qty > 1 && u != null ? `<small class="muted">${eur(u)} / Stk.</small><br>` : ""}${i.buy ? plSpan(p, p / (i.buy * i.qty) * 100) : ""}</span></button>`; };
    let list;
    if (st.sort === "group") { const G = {}; L.forEach(i => { const k = i.kind === "card" ? i.set : "__sealed"; (G[k] = G[k] || []).push(i); }); list = Object.entries(G).sort((a, b) => b[1].reduce((s, i) => s + val(i), 0) - a[1].reduce((s, i) => s + val(i), 0)).map(([k, arr]) => `<div class="spread" style="margin-top:8px"><b>${k === "__sealed" ? "Sealed-Produkte" : esc(setName(D.setMap[k]) || k)}</b><span class="pr">${eur(arr.reduce((s, i) => s + val(i), 0))}</span></div>${arr.map(rowHTML).join("")}`).join(""); }
    else list = L.map(rowHTML).join("");
    const byLang = {}; L.forEach(i => { const k = LANGS[i.lang] || i.lang || "?"; byLang[k] = (byLang[k] || 0) + val(i); }); const lbars = Object.entries(byLang).sort((a, b) => b[1] - a[1]); const lmax = lbars.length ? lbars[0][1] || 1 : 1;
    const bySet = {}; L.forEach(i => { const k = i.kind === "card" ? (setName(D.setMap[i.set]) || i.set) : "Sealed"; bySet[k] = (bySet[k] || 0) + val(i); }); const bars = Object.entries(bySet).sort((a, b) => b[1] - a[1]).slice(0, 8); const bmax = bars.length ? bars[0][1] || 1 : 1;
    $("#pf", el).innerHTML = `<div class="tcg-kpis"><div class="tcg-kpi"><b class="pr">${eur0(tot.value)}</b><small class="muted">Wert${filtered ? " (gefiltert)" : ""}</small></div><div class="tcg-kpi"><b>${eur0(tot.buy)}</b><small class="muted">Einkauf</small></div><div class="tcg-kpi"><b class="${tot.pl >= 0 ? "up" : "down"}">${tot.pl >= 0 ? "+" : "−"}${eur0(Math.abs(tot.pl))}</b><small class="muted">${tot.plPct != null ? pct(tot.plPct) : "Gewinn/Verlust"}</small></div><div class="tcg-kpi"><b>${tot.cards} / ${tot.sealed}</b><small class="muted">Karten / Sealed</small></div></div>
      ${!t.items.length ? `<div class="card empty-state"><b>Noch nichts in der Sammlung</b><small class="muted">Such eine Karte oder ein Produkt und tippe auf „Zur Sammlung“.</small><div class="row"><button class="btn pri" data-go="cards">Karte suchen</button><button class="btn" data-go="sealed">Produkte</button></div></div>` : ""}
      ${bars.length > 1 && st.sort !== "group" ? `<div class="card col bars" style="gap:2px"><span class="eyebrow">Wert nach Set</span>${bars.map(([k, v]) => `<div class="bar-row"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(k)}</span><span><i style="width:${Math.max(2, 100 * v / bmax)}%"></i></span><b class="tab">${eur0(v)}</b></div>`).join("")}</div>` : ""}
      ${lbars.length > 1 ? `<div class="card col bars" style="gap:2px"><span class="eyebrow">Wert nach Sprache</span>${lbars.map(([k, v]) => `<div class="bar-row"><span>${esc(k)}</span><span><i style="width:${Math.max(2, 100 * v / lmax)}%"></i></span><b class="tab">${eur0(v)}</b></div>`).join("")}</div>` : ""}
      <small class="muted">${L.length} von ${t.items.length} Einträgen${tot.unpriced ? ` · ${tot.unpriced} ohne Preis` : ""}</small><div class="col" style="gap:8px">${list}</div>`;
  };
  $("#rf", el).onclick = () => autoRefresh(true).then(draw);
  $("#lpr", el).onclick = () => priceRun(draw);
  $("#csv", el).onclick = () => { const rows = [["Typ", "Name", "Name EN", "Set/Kategorie", "Nummer", "Variante", "Sprache", "Zustand", "Gradierung", "Anzahl", "Kaufpreis/Stk", "Cardmarket-Trend/Stk", "Eigener Preis/Stk", "Wert/Stk", "Preisbasis", "Wert", "Gewinn", "Kaufdatum", "Notiz"]].concat(t.items.filter(f).map(i => { const u = itemUnit(i); return [i.kind === "card" ? "Karte" : "Sealed", i.name, i.nameEn || "", i.kind === "card" ? setName(D.setMap[i.set]) || i.set : i.cat, i.l || "", i.kind === "card" ? variantLabel({}, i.variant) : "", LANGS[i.lang] || i.lang, i.cond, i.grade || "", i.qty, (i.buy || 0).toFixed(2), i.last && i.last.t != null ? i.last.t.toFixed(2) : "", hasOwn(i) ? (+i.own).toFixed(2) : "", u != null ? u.toFixed(2) : "", basis(i), u != null ? (u * i.qty).toFixed(2) : "", u != null ? (u * i.qty - (i.buy || 0) * i.qty).toFixed(2) : "", i.date || "", i.note || ""]; }));
    App.download("sammlung-" + today() + ".csv", "﻿" + rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(";")).join("\n"), "text/csv"); };
  el.onclick = e => { const b = e.target.closest("[data-edit]"); if (b) editItem(b.dataset.edit); };
  draw();
});
/* go through the collection once: open each card version on Cardmarket (filtered to its language & condition) and note the price */
async function priceRun(after) {
  const t = T(); const seen = new Set(); const rows = [];
  for (const i of t.items) { if (hasOwn(i) || i.rg) continue; const k = lpKey(i); if (seen.has(k)) continue; seen.add(k); rows.push(i); }
  await Promise.all([...new Set(rows.filter(i => i.kind === "card").map(i => i.set))].map(id => setData(id).catch(() => null))); if (rows.some(i => i.kind === "sealed")) await sealed().catch(() => null);
  rows.sort((a, b) => (lpOf(a) ? 1 : 0) - (lpOf(b) ? 1 : 0) || (itemUnit(b) || 0) - (itemUnit(a) || 0));
  const link = i => i.kind === "card" ? (cmUrl(cmOf(D.setData[i.set] && D.setData[i.set].map[i.l], i.variant, i.lang), { lang: i.lang, cond: i.cond, rev: i.variant === "reverse" }) || cmSearch(i.nameEn || i.name)) : cmUrl(i.id, { lang: i.lang });
  App.modal(`<div class="spread"><div><h2>Sprachpreise eintragen</h2><small class="muted">${rows.length} Versionen in deiner Sammlung · zuerst die ohne notierten Preis</small></div><button class="btn ghost sm" data-close>✕</button></div>
    <p class="muted" style="font-size:13.5px">Tippe „Cardmarket ↗“ – die Karte öffnet sich gefiltert auf Sprache und Zustand. Den günstigsten Preis eintragen, fertig. Der Preis gilt für alle Einträge dieser Version.</p>
    ${rows.length ? rows.map((i, n) => { const lp = lpOf(i); return `<div class="srow lprow" data-n="${n}" style="cursor:default"><span class="ic ${i.kind === "card" ? "" : "pbg"}">${i.kind === "card" ? thumbImg(i) : sealedThumb(imgIdOf(i), i.cat, i.e)}</span><span class="t"><b>${esc(i.name)}</b><small class="muted">${esc(i.sub || "")} · <b>${esc(LANGS[i.lang] || i.lang)}${i.kind === "card" ? " · " + esc(i.cond) : ""}</b></small><small class="basis">${lp ? "notiert " + eur(lp.v) + " · " + fmtDate(lp.at) : "Richtwert alle Sprachen: " + eur(i.last && i.last.t)}</small>
      <span class="row" style="gap:6px;flex-wrap:nowrap;margin-top:6px"><a class="btn sm" href="${link(i)}" target="_blank" rel="noopener">Cardmarket ↗</a><input type="number" step="0.01" min="0" inputmode="decimal" class="lp-in" value="${lp ? lp.v : ""}" placeholder="€" style="width:90px"><button class="btn sm pri lp-save">✓</button></span></span></div>`; }).join("") : `<div class="empty-state"><b>Nichts zu tun</b><small class="muted">Alle Einträge haben einen eigenen Preis oder sind japanische Karten mit eigenem Cardmarket-Preis.</small></div>`}`, (m, close) => {
    m.addEventListener("click", e => { const b = e.target.closest(".lp-save"); if (!b) return; const r = b.closest(".lprow"); const i = rows[+r.dataset.n]; const v = numIn($(".lp-in", r).value); if (v == null) return; setLp(i, v); snapshot(); App.save(); App.renderSide(); b.textContent = "✓ gespeichert"; b.disabled = true; $(".basis", r).textContent = "notiert " + eur(v) + " · heute"; after && after(); });
    m.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.classList.contains("lp-in")) e.target.closest(".lprow").querySelector(".lp-save").click(); });
  });
}
function openItem(uid) { const i = T().items.find(x => x.uid === uid); if (!i) return; if (i.kind === "card") openCard(i.set, i.l); else openSealed(i.id); }
function editItem(uid) {
  const t = T(), i = t.items.find(x => x.uid === uid); if (!i) return; const card = i.kind === "card";
  const rev = card && i.variant === "reverse"; const cmFor = lang => card ? (D.setData[i.set] ? cmOf(D.setData[i.set].map[i.l], i.variant, lang) : null) : i.id;
  App.modal(`<div class="spread"><div><h2>${esc(i.name)}</h2><small class="muted">${esc(i.sub || "")}</small></div><button class="btn ghost sm" data-close>✕</button></div>
    <div class="tcg-kpis"><div class="tcg-kpi"><b id="eu">${eur(itemUnit(i))}</b><small class="muted" id="eba">${esc(basis(i))}</small></div><div class="tcg-kpi"><b>${eur(i.last && i.last.t)}</b><small class="muted">Cardmarket-Trend</small></div></div>
    <div class="grid g2"><label class="fld">Sprache<select id="el">${LANG_LIST.map(([k, l]) => `<option value="${k}" ${k === i.lang ? "selected" : ""}>${l}</option>`).join("")}</select></label><label class="fld">Zustand<select id="ec">${(card ? CONDS : SEALED_COND).map(([k, l]) => `<option value="${k}" ${k === i.cond ? "selected" : ""}>${card ? k + " – " : ""}${l}</option>`).join("")}</select></label></div>
    <div class="row" style="gap:8px"><a class="btn sm" id="ecm" target="_blank" rel="noopener">Angebote auf Cardmarket ↗</a></div>
    <div class="grid g2"><label class="fld">Eigener Preis / Stück (€)<input type="number" id="eo" step="0.01" value="${hasOwn(i) ? i.own : ""}" inputmode="decimal" placeholder="leer = Schätzwert"></label><label class="fld">Anzahl<input type="number" id="eq" value="${i.qty}" min="1" inputmode="numeric"></label></div>
    <div class="grid g2"><label class="fld">Kaufpreis / Stück (€)<input type="number" id="eb" step="0.01" value="${i.buy || ""}" inputmode="decimal"></label><label class="fld">Kaufdatum<input type="date" id="ed" value="${esc(i.date || "")}"></label></div>
    <div class="grid g2">${card ? `<label class="fld">Gradierung<input type="text" id="eg" value="${esc(i.grade || "")}"></label>` : "<span></span>"}<label class="fld">Notiz<input type="text" id="en" value="${esc(i.note || "")}"></label></div>
    <div class="spread"><button class="btn danger sm" id="del">Entfernen</button><div class="row"><button class="btn ghost" id="op">${card ? "Karte" : "Produkt"} öffnen</button><button class="btn pri" id="sv">Speichern</button></div></div>`, (m, close) => {
    const upd = () => { const tmp = Object.assign({}, i, { lang: $("#el", m).value, cond: $("#ec", m).value, own: numIn($("#eo", m).value) }); $("#eu", m).textContent = eur(itemUnit(tmp)); $("#eba", m).textContent = basis(tmp);
      const a = $("#ecm", m); const u = cmUrl(cmFor(tmp.lang), { lang: tmp.lang, cond: card ? tmp.cond : "", rev }); if (u) { a.href = u; a.textContent = `Angebote: ${LANGS[tmp.lang] || tmp.lang}${card ? " · ab " + tmp.cond : ""} ↗`; } else { a.href = cmSearch(i.nameEn || i.name); a.textContent = "Auf Cardmarket suchen ↗"; } };
    ["#el", "#ec"].forEach(k => $(k, m).onchange = upd); $("#eo", m).oninput = upd; upd();
    $("#sv", m).onclick = () => { i.qty = Math.max(1, +$("#eq", m).value || 1); i.buy = numIn($("#eb", m).value) || 0; i.lang = $("#el", m).value; i.cond = $("#ec", m).value; const o = numIn($("#eo", m).value); if (o == null) delete i.own; else { i.own = o; i.ownAt = today(); } i.date = $("#ed", m).value; if (card) i.grade = $("#eg", m).value.trim(); i.note = $("#en", m).value.trim(); snapshot(); App.save(); close(); App.render(); App.renderSide(); };
    $("#del", m).onclick = () => { if (!confirm("Aus der Sammlung entfernen?")) return; t.items.splice(t.items.indexOf(i), 1); snapshot(); App.save(); close(); App.render(); App.renderSide(); };
    $("#op", m).onclick = () => { close(); openItem(uid); };
  });
  if (card && !D.setData[i.set]) setData(i.set).catch(() => null);
}

/* ---------------- Wunschliste page ---------------- */
PAGES.wish = guard(async el => {
  await sets().catch(() => null); const L = WL(); const OPEN = {};
  if (L.some(w => w.kind === "sealed")) await sealed().catch(() => null);
  const draw = () => {
    const groups = {}; L.forEach(w => (groups[w.lang] = groups[w.lang] || []).push(w));
    const langs = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);
    const sum = arr => arr.reduce((a, w) => a + (w.price || 0) * w.qty, 0);
    const lineOf = w => `${w.qty} ${w.wl}`;
    el.innerHTML = `<div class="page" style="max-width:900px"><div class="spread"><div><h1>Wunschliste</h1><p class="muted" style="margin-top:6px">Karten und Produkte, die du kaufen willst – als Liste für Cardmarket („Wants“) zum Kopieren oder Herunterladen.</p></div>${L.length ? `<button class="btn ghost sm" id="wclr">Liste leeren</button>` : ""}</div>
      ${!L.length ? `<div class="card empty-state"><b>Noch leer</b><small class="muted">Im Kartenfenster auf „♡ Wunschliste“ tippen – oder im Set „⚡ Schnell erfassen“ → „♡ auf Wunschliste“ und mit + / − füllen. Dort gibt es auch „Alle fehlenden dieses Sets“.</small><div class="row"><button class="btn pri" data-go="sets">Sets öffnen</button></div></div>` : ""}
      ${langs.map(lg => { const arr = groups[lg]; const lines = arr.map(lineOf); const chunks = []; for (let i = 0; i < lines.length; i += 150) chunks.push(lines.slice(i, i + 150));
        return `<div class="card col" style="gap:10px"><div class="spread"><h2>${esc(LANGS[lg] || lg)} <small class="muted" style="font-size:14px">· ${arr.reduce((a, w) => a + w.qty, 0)} Stück · Richtwert ≈ ${eur(sum(arr))}</small></h2></div>
          <div class="col" style="gap:6px">${arr.slice(0, OPEN[lg] ? arr.length : 12).map(w => `<div class="srow" style="cursor:default" data-w="${w.uid}"><span class="ic ${w.kind === "card" ? "" : "pbg"}">${w.kind === "card" ? thumbImg(w) : sealedThumb(w.img, w.cat, w.e)}</span><span class="t"><b>${esc(w.name)}</b><small class="muted">${esc(w.sub || "")}${w.cond ? " · " + esc(w.cond) : ""}${w.rev ? " · <span style='color:var(--acc)'>Reverse Holo</span>" : ""}</small><small class="basis" style="color:var(--muted)">${esc(w.wl)}</small></span><span class="v"><span class="qa-ctl mini"><button data-wm>−</button><b>${w.qty}</b><button data-wp>+</button></span><small class="muted">${eur(w.price)}</small></span></div>`).join("")}${arr.length > 12 && !OPEN[lg] ? `<button class="btn ghost sm" data-open="${lg}">Alle ${arr.length} anzeigen</button>` : ""}</div>
          ${chunks.map((ch, ci) => `<div class="col" style="gap:6px"><span class="eyebrow">Cardmarket-Liste${chunks.length > 1 ? ` ${ci + 1}/${chunks.length} (max. 150 Einträge je Wants-Liste)` : ""}</span><textarea readonly class="wl-text" rows="${Math.min(8, ch.length + 1)}">${esc(ch.join("\n"))}</textarea>
            <div class="row" style="gap:8px"><button class="btn pri sm" data-copy="${lg}|${ci}">📋 Kopieren</button><button class="btn sm" data-txt="${lg}|${ci}">⤓ .txt</button><button class="btn sm ghost" data-csv="${lg}">⤓ CSV</button><a class="btn sm ghost" href="https://www.cardmarket.com/de/Pokemon/Wants" target="_blank" rel="noopener">Cardmarket Wants ↗</a></div></div>`).join("")}
          ${arr.some(w => w.rev) ? `<small class="muted">Reverse-Holo-Karten: auf Cardmarket beim jeweiligen Eintrag „Reverse Holo“ anhaken (die Import-Liste kennt das nicht).</small>` : ""}</div>`; }).join("")}
      ${L.length ? `<div class="card col" style="gap:6px;background:var(--card2)"><h3>So kommt die Liste auf Cardmarket</h3><ol style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:4px;font-size:14px">
        <li>Oben bei der Sprache auf <b>„📋 Kopieren“</b> tippen (oder .txt herunterladen).</li>
        <li>Auf Cardmarket einloggen → <b>Wants</b> → neue Wants-Liste anlegen (z. B. „Papa Deutsch“).</li>
        <li>In das Feld zum <b>Hinzufügen einer Deckliste</b> einfügen und auf <b>Hinzufügen</b> tippen. Jede Zeile ist eine Karte mit Anzahl, Name, Attacken, Version (V.x) und Erweiterung – so findet Cardmarket genau die richtige Karte.</li>
        <li>In der Wants-Liste <b>Sprache</b> (z. B. Deutsch) und <b>Mindestzustand</b> einstellen – die Liste ist deshalb schon nach Sprachen getrennt.</li>
        <li>Mit dem <b>Shopping Wizard</b> findet Cardmarket die günstigste Kombination aus Verkäufern.</li></ol>
        <small class="muted">Meldet Cardmarket bei einer Zeile „keine Treffer“, die Karte dort einfach per Suche hinzufügen.</small></div>` : ""}</div>`;
    const clr = $("#wclr", el); if (clr) clr.onclick = () => { if (confirm("Wunschliste komplett leeren?")) { L.length = 0; App.save(); draw(); } };
  };
  const linesFor = (lg, ci) => { const arr = L.filter(w => w.lang === lg).map(w => `${w.qty} ${w.wl}`); return arr.slice(ci * 150, ci * 150 + 150).join("\n"); };
  el.onclick = async e => {
    const op = e.target.closest("[data-open]"); if (op) { OPEN[op.dataset.open] = true; draw(); return; }
    const r = e.target.closest("[data-w]"); if (r && e.target.closest("[data-wm],[data-wp]")) { const w = L.find(x => x.uid === r.dataset.w); w.qty += e.target.closest("[data-wp]") ? 1 : -1; if (w.qty <= 0) L.splice(L.indexOf(w), 1); App.save(); App.renderSide(); draw(); return; }
    const cp = e.target.closest("[data-copy]"); if (cp) { const [lg, ci] = cp.dataset.copy.split("|"); const txt = linesFor(lg, +ci); try { await navigator.clipboard.writeText(txt); } catch (err) { const ta = cp.closest(".col").querySelector("textarea"); ta.select(); document.execCommand && document.execCommand("copy"); } App.toast("Kopiert", "Jetzt auf Cardmarket in eine Wants-Liste einfügen", "📋"); return; }
    const tx = e.target.closest("[data-txt]"); if (tx) { const [lg, ci] = tx.dataset.txt.split("|"); App.download(`cardmarket-wants-${lg}${+ci ? "-" + (+ci + 1) : ""}.txt`, linesFor(lg, +ci), "text/plain"); return; }
    const cv = e.target.closest("[data-csv]"); if (cv) { const lg = cv.dataset.csv; const rows = [["Anzahl", "Cardmarket-Zeile", "Name", "Set / Kategorie", "Nummer", "Variante", "Sprache", "Zustand", "Richtwert/Stk"]].concat(L.filter(w => w.lang === lg).map(w => [w.qty, w.wl, w.name, w.kind === "card" ? setName(D.setMap[w.set]) : w.sub, w.l || "", w.kind === "card" ? variantLabel({}, w.variant) : "", LANGS[w.lang] || w.lang, w.cond || "", w.price != null ? w.price.toFixed(2) : ""]));
      App.download(`wunschliste-${lg}.csv`, "\ufeff" + rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(";")).join("\n"), "text/csv"); return; }
  };
  draw();
});

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
    ${t.watch.length ? `<div class="col" style="gap:8px">${t.watch.map((w, k) => { const hit = w.target && w.cur != null && ((w.dir === "above" && w.cur >= w.target) || (w.dir !== "above" && w.cur <= w.target)); return `<button class="srow" data-w="${k}"><span class="ic">${w.kind === "card" ? `${thumbImg(w)}` : sealedThumb(imgIdOf(w), "")}</span><span class="t"><b>${esc(w.name)}</b><small class="muted">${w.target ? `Alarm ${w.dir === "above" ? "≥" : "≤"} ${eur(w.target)}` : "ohne Zielpreis"}${hit ? ` · <span style="color:var(--acc)">Ziel erreicht!</span>` : ""}</small></span><span class="v"><b class="pr">${eur(w.cur)}</b></span></button>`; }).join("")}</div>` : `<div class="card empty-state"><b>Noch nichts beobachtet</b><small class="muted">Öffne eine Karte oder ein Produkt und tippe auf „☆ Beobachten“.</small></div>`}</div>`;
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
    <span class="eyebrow">Sprache (gilt für Karten und Sealed)</span><div class="grid g4">${LANG_LIST.map(([k, l]) => pctIn("lang", k, l)).join("")}</div>
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
