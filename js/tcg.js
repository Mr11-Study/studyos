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
const cmSearch = q => `https://www.cardmarket.com/de/Pokemon/Products/Search?searchString=${encodeURIComponent(q)}`;
const VARIANT_LABEL = { normal: "Normal", holo: "Holo", reverse: "Reverse Holo" };
function variantsOf(card) { const v = []; (card.vt || ["normal"]).forEach(t => { if (t === "reverse") { if (card.rv) v.push(["reverse", "Reverse Holo"]); } else v.push([t, VARIANT_LABEL[t] || t]); }); if (!v.length) v.push(["normal", "Normal"]); (card.sp || []).forEach(s => v.push(["sp:" + s[0], s[0]])); return v; }
function priceOf(card, variant) { if (!card) return null; if (variant === "reverse") return card.rv || null; if (variant && variant.startsWith("sp:")) { const s = (card.sp || []).find(x => x[0] === variant.slice(3)); return s ? [s[2], null, null, null, null, null] : null; } return card.p || null; }
const trendOf = arr => arr ? (arr[0] != null ? arr[0] : arr[1]) : null;
const move = arr => arr && arr[4] != null && arr[5] ? (arr[4] - arr[5]) / arr[5] * 100 : null;

/* ---------------- portfolio ---------------- */
function itemUnit(it) { return it.last && it.last.t != null ? it.last.t : null; }
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
PAGES.sets = guard(async (el) => {
  const all = await sets(); const t = T(); const owned = {}; t.items.filter(i => i.kind === "card").forEach(i => { (owned[i.set] = owned[i.set] || new Set()).add(i.l); });
  const series = []; all.forEach(s => { if (!series.some(x => x[0] === s.s)) series.push([s.s, (s.sn && (s.sn[t.lang] || s.sn.en)) || s.s]); });
  let q = "", ser = "", sort = "new";
  const draw = () => {
    let L = all.filter(s => (!ser || s.s === ser) && (!q || (setName(s) + " " + (s.n.en || "") + " " + (s.a || "") + " " + s.id).toLowerCase().includes(q)));
    if (sort === "value") L = L.slice().sort((a, b) => (b.v || 0) - (a.v || 0)); if (sort === "mine") L = L.slice().sort((a, b) => ((owned[b.id] || new Set()).size - (owned[a.id] || new Set()).size));
    $("#sg", el).innerHTML = L.map(s => { const o = (owned[s.id] || new Set()).size; return `<button class="stile" data-go="set" data-p="${s.id}"><div class="lg">${setLogo(s)}</div><div><b>${esc(setName(s))}</b><div><small class="muted">${esc((s.sn && (s.sn[t.lang] || s.sn.en)) || "")} · ${fmtDate(s.d)}</small></div></div><div class="spread"><small class="muted">${s.t} Karten${s.a ? " · " + esc(s.a) : ""}</small><span class="pr" title="Summe der Trendpreise aller Karten">${eur0(s.v)}</span></div>${o ? `<div class="bar thin"><i style="width:${Math.round(100 * o / s.t)}%"></i></div><small class="muted">${o} / ${s.t} in deiner Sammlung</small>` : ""}</button>`; }).join("") || `<div class="muted">Kein Set gefunden.</div>`;
  };
  el.innerHTML = `<div class="page"><div><h1>Sets</h1><p class="muted" style="margin-top:6px">${all.length} Sets, neueste zuerst. Der Betrag ist der Setwert: die Summe der Cardmarket-Trendpreise aller Karten.</p></div>
    <div class="filters"><input type="text" id="sq" placeholder="Set suchen … (z. B. 151, Obsidian, Karmesin)"><select id="ss"><option value="">Alle Serien</option>${series.map(([k, n]) => `<option value="${k}">${esc(n)}</option>`).join("")}</select><select id="so"><option value="new">Neueste zuerst</option><option value="value">Höchster Setwert</option><option value="mine">Meine Sets zuerst</option></select></div>
    <div class="sgrid" id="sg"></div></div>`;
  $("#sq", el).oninput = e => { q = e.target.value.toLowerCase().trim(); draw(); }; $("#ss", el).onchange = e => { ser = e.target.value; draw(); }; $("#so", el).onchange = e => { sort = e.target.value; draw(); };
  draw();
});

/* ---------------- Set detail ---------------- */
PAGES.set = guard(async (el, id) => {
  if (!id) return App.go("sets"); const sd = await setData(id); const s = D.setMap[id]; const t = T();
  const ownedQty = {}; t.items.filter(i => i.kind === "card" && i.set === id).forEach(i => ownedQty[i.l] = (ownedQty[i.l] || 0) + i.qty);
  const rarities = [...new Set(sd.cards.map(c => c.r).filter(Boolean))];
  let q = "", rar = "", own = "", sort = "num", tab = "cards", minP = "";
  const val = sd.cards.reduce((a, c) => a + (trendOf(c.p) || 0), 0), nOwned = Object.keys(ownedQty).length;
  const drawCards = () => {
    let L = sd.cards.filter(c => (!q || (cardName(c) + " " + (c.n.en || "") + " " + c.l).toLowerCase().includes(q)) && (!rar || c.r === rar) && (!own || (own === "own" ? ownedQty[c.l] : !ownedQty[c.l])) && (!minP || (trendOf(c.p) || 0) >= +minP));
    if (sort === "pd") L = L.slice().sort((a, b) => (trendOf(b.p) || 0) - (trendOf(a.p) || 0)); if (sort === "pa") L = L.slice().sort((a, b) => (trendOf(a.p) ?? 1e9) - (trendOf(b.p) ?? 1e9)); if (sort === "name") L = L.slice().sort((a, b) => cardName(a).localeCompare(cardName(b)));
    $("#cg", el).innerHTML = L.map(c => `<button class="tcard ${own === "" && nOwned && !ownedQty[c.l] ? "missing" : ""}" data-card="${esc(c.l)}"><div class="im">${imgTag(id, c.l, "low", cardName(c))}${ownedQty[c.l] ? `<span class="own">✓ ${ownedQty[c.l]}</span>` : ""}</div><div class="nm">${esc(cardName(c))}</div><div class="meta"><span>#${esc(c.l)}${c.r ? " · " + esc(shortR(c.r)) : ""}</span><span class="pr">${eur(trendOf(c.p))}</span></div></button>`).join("") || `<div class="muted">Keine Karten für diese Filter.</div>`;
    $("#cn", el).textContent = L.length + " Karten";
  };
  const drawSealed = async () => { const box = $("#cg", el); box.innerHTML = `<div class="muted">Lade Produkte …</div>`; const all = await sealed(); const L = s.e ? all.filter(x => x.e === s.e) : []; box.innerHTML = L.length ? `<div class="col" style="gap:8px;grid-column:1/-1">${L.sort((a, b) => (b.p[0] || 0) - (a.p[0] || 0)).map(sealedRow).join("")}</div>` : `<div class="muted" style="grid-column:1/-1">Für dieses Set sind keine Sealed-Produkte im Cardmarket-Katalog zugeordnet. Schau unter „Produkte“ nach.</div>`; $("#cn", el).textContent = L.length + " Produkte"; };
  el.innerHTML = `<div class="page">
    <div class="row" style="gap:16px;align-items:center"><div class="stile" style="padding:10px;cursor:default;min-width:120px;max-width:200px"><div class="lg">${setLogo(s)}</div></div>
      <div><button class="btn ghost sm" data-go="sets">← Alle Sets</button><h1 style="margin-top:4px">${esc(setName(s))}</h1><small class="muted">${esc((s.sn && (s.sn[t.lang] || s.sn.en)) || "")} · erschienen ${fmtDate(s.d)} · ${s.c || s.t} Karten offiziell${s.t > (s.c || 0) ? ` (+${s.t - (s.c || 0)} Secret)` : ""}</small></div></div>
    <div class="tcg-kpis"><div class="tcg-kpi"><b>${eur0(val)}</b><small class="muted">Setwert (Σ Trend)</small></div><div class="tcg-kpi"><b>${nOwned} / ${sd.cards.length}</b><small class="muted">in deiner Sammlung</small></div><div class="tcg-kpi"><b>${eur0(sd.cards.filter(c => ownedQty[c.l]).reduce((a, c) => a + (trendOf(c.p) || 0) * ownedQty[c.l], 0))}</b><small class="muted">dein Anteil (Normal-Preis)</small></div><div class="tcg-kpi"><b>${eur0(sd.cards.reduce((m, c) => Math.max(m, trendOf(c.p) || 0), 0))}</b><small class="muted">teuerste Karte</small></div></div>
    <div class="tabs"><button data-tab="cards" class="on">Karten</button><button data-tab="sealed">Sealed-Produkte</button></div>
    <div class="filters" id="cf"><input type="text" id="q" placeholder="Name oder Nummer …"><select id="r"><option value="">Alle Seltenheiten</option>${rarities.map(r => `<option>${esc(r)}</option>`).join("")}</select><select id="o"><option value="">Alle Karten</option><option value="own">Nur meine</option><option value="miss">Fehlende</option></select><select id="s"><option value="num">Nummer</option><option value="pd">Preis ↓</option><option value="pa">Preis ↑</option><option value="name">Name</option></select><input type="number" id="mp" placeholder="ab € …" inputmode="decimal" style="max-width:110px"></div>
    <small class="muted" id="cn"></small><div class="tgrid" id="cg"></div></div>`;
  $("#q", el).oninput = e => { q = e.target.value.toLowerCase().trim(); drawCards(); }; $("#r", el).onchange = e => { rar = e.target.value; drawCards(); }; $("#o", el).onchange = e => { own = e.target.value; drawCards(); }; $("#s", el).onchange = e => { sort = e.target.value; drawCards(); }; $("#mp", el).oninput = e => { minP = e.target.value; drawCards(); };
  el.onclick = e => { const c = e.target.closest("[data-card]"); if (c) return openCard(id, c.dataset.card); const tb = e.target.closest("[data-tab]"); if (tb) { tab = tb.dataset.tab; $$("[data-tab]", el).forEach(b => b.classList.toggle("on", b === tb)); $("#cf", el).style.display = tab === "cards" ? "" : "none"; tab === "cards" ? drawCards() : drawSealed(); return; } const sr = e.target.closest("[data-sealed]"); if (sr) openSealed(+sr.dataset.sealed); };
  drawCards();
});
const shortR = r => ({ "Special illustration rare": "SIR", "Illustration rare": "IR", "Double rare": "RR", "Ultra Rare": "UR", "Hyper rare": "HR", "Common": "C", "Uncommon": "U", "Rare": "R", "Rare Holo": "Holo", "ACE SPEC Rare": "ACE" }[r] || r);

/* ---------------- Card detail ---------------- */
async function openCard(setId, lid, preItem) {
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
    <div><span class="eyebrow">Cardmarket-Preise</span><div class="table-wrap" style="margin-top:6px"><table class="dt ptable"><thead><tr><th>Variante</th><th>Trend</th><th>ab</th><th>Ø</th><th>Ø 1T</th><th>Ø 7T</th><th>Ø 30T</th></tr></thead><tbody>
      ${row(c.vt && c.vt.includes("holo") && !c.vt.includes("normal") ? "Holo" : "Normal / Holo", c.p)}${row("Reverse Holo", c.rv)}${(c.sp || []).map(x => `<tr><td>${esc(x[0])}</td><td><b>${eur(x[2])}</b></td><td colspan="5" class="muted">eigenes Cardmarket-Produkt</td></tr>`).join("")}
      ${!c.p && !c.rv ? `<tr><td colspan="7" class="muted">Für diese Karte gibt es (noch) keinen Preis im Cardmarket-Preisführer.</td></tr>` : ""}</tbody></table></div>
      <small class="stamp">Stand ${fmtStamp(sd.u)} · Trend = Richtwert aus den letzten Verkäufen, meist Zustand NM, alle Sprachen zusammen.</small></div>
    <div class="row" style="gap:8px"><a class="btn" href="${cmSearch((c.n.en || cardName(c)) + " " + (s.n.en || ""))}" target="_blank" rel="noopener">Auf Cardmarket ansehen ↗</a><button class="btn ghost" id="wt">${w ? "★ Beobachtet" : "☆ Beobachten"}</button></div>
    ${c.i ? `<small class="muted">Illustration: ${esc(c.i)}${c.hp ? " · " + c.hp + " KP" : ""}${c.ty ? " · " + c.ty.join(", ") : ""}</small>` : ""}
    ${mine.length ? `<div class="col" style="gap:6px"><span class="eyebrow">In deiner Sammlung</span>${mine.map(i => `<button class="srow" data-edit="${i.uid}"><span class="ic" style="font-weight:700">×${i.qty}</span><span class="t"><b>${esc(variantLabel(c, i.variant))} · ${esc(LANGS[i.lang] || i.lang)} · ${esc(i.cond)}</b><small class="muted">Kauf ${eur(i.buy)} / Stück${i.date ? " · " + fmtDate(i.date) : ""}${i.grade ? " · " + esc(i.grade) : ""}</small></span><span class="v"><b>${eur(itemUnit(i) != null ? itemUnit(i) * i.qty : null)}</b></span></button>`).join("")}</div>` : ""}
    <div class="card col" style="gap:10px;background:var(--card2)"><b>Zur Sammlung hinzufügen</b>
      <div class="grid g2"><label class="fld">Variante<select id="av">${vs.map(([k, l]) => `<option value="${esc(k)}">${esc(l)}${priceOf(c, k) && trendOf(priceOf(c, k)) != null ? " – " + eur(trendOf(priceOf(c, k))) : ""}</option>`).join("")}</select></label><label class="fld">Sprache der Karte<select id="al">${Object.entries(LANGS).map(([k, l]) => `<option value="${k}" ${k === t.lang ? "selected" : ""}>${l}</option>`).join("")}</select></label></div>
      <div class="grid g2"><label class="fld">Zustand<select id="ac">${CONDS.map(([k, l]) => `<option value="${k}" ${k === "NM" ? "selected" : ""}>${k} – ${l}</option>`).join("")}</select></label><label class="fld">Anzahl<input type="number" id="aq" value="1" min="1" inputmode="numeric"></label></div>
      <div class="grid g2"><label class="fld">Kaufpreis pro Stück (€)<input type="number" id="ab" step="0.01" inputmode="decimal" placeholder="optional"></label><label class="fld">Kaufdatum<input type="date" id="ad" value="${today()}"></label></div>
      <div class="grid g2"><label class="fld">Gradierung (optional)<input type="text" id="ag" placeholder="z. B. PSA 10"></label><label class="fld">Notiz<input type="text" id="an" placeholder="optional"></label></div>
      <button class="btn pri" id="add">＋ Zur Sammlung</button></div>`, (m, close) => {
    const hc = $(".hc", m); const ho = $("#ho", m);
    ho.onpointermove = e => { const r = hc.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; if (x < -0.2 || x > 1.2 || y < -0.2 || y > 1.2) return; hc.style.transform = `rotateY(${(x - .5) * 22}deg) rotateX(${(.5 - y) * 22}deg)`; hc.style.setProperty("--gx", x * 100 + "%"); hc.style.setProperty("--gy", y * 100 + "%"); };
    ho.onpointerleave = () => { hc.style.transform = ""; };
    m.addEventListener("click", e => { const il = e.target.closest("[data-il]"); if (il) { $$("[data-il]", m).forEach(b => b.classList.toggle("on", b === il)); const [a, b] = cardImg(setId, lid, "high", il.dataset.il); const img = $(".hc img", m); img.style.display = ""; img.dataset.fb = b; img.src = a; } const ed = e.target.closest("[data-edit]"); if (ed) { close(); editItem(ed.dataset.edit); } });
    $("#wt", m).onclick = () => { close(); watchForm({ kind: "card", set: setId, l: lid, name: cardName(c) + " (" + setName(s) + ")", variant: "normal", cur: trendOf(c.p) }); };
    $("#add", m).onclick = () => { const variant = $("#av", m).value; const arr = priceOf(c, variant); const it = { uid: "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), kind: "card", set: setId, l: lid, name: cardName(c), nameEn: c.n.en, short: `#${lid} · ${s.a || setName(s)}`, sub: `${setName(s)} · #${lid} · ${variantLabel(c, variant)}`, rar: c.r, variant, lang: $("#al", m).value, cond: $("#ac", m).value, qty: Math.max(1, +$("#aq", m).value || 1), buy: +String($("#ab", m).value).replace(",", ".") || 0, date: $("#ad", m).value, grade: $("#ag", m).value.trim(), note: $("#an", m).value.trim(), added: Date.now(), last: trendOf(arr) != null ? { t: trendOf(arr), a7: arr[4], a30: arr[5], at: sd.u } : null };
      t.items.push(it); snapshot(); App.save(); App.renderSide(); App.toast("Hinzugefügt", `${it.qty}× ${it.name}`, "◆"); close(); if (["set", "portfolio", "dash"].includes(App.route().v)) App.render(); };
  });
}
const variantLabel = (c, v) => v && v.startsWith("sp:") ? v.slice(3) : (VARIANT_LABEL[v] || v || "Normal");

/* ---------------- Sealed ---------------- */
function sealedRow(x) { const s = x.e && D.expMap && D.expMap[x.e]; const own = T().items.filter(i => i.kind === "sealed" && i.id === x.id).reduce((a, i) => a + i.qty, 0); return `<button class="srow" data-sealed="${x.id}"><span class="ic">${SEALED_ICON(x.c)}</span><span class="t"><b>${esc(x.n)}</b><small class="muted">${esc(x.c)}${s ? " · " + esc(setName(s)) : ""}${x.d ? " · " + x.d.slice(0, 4) : ""}${own ? ` · <span style="color:var(--acc)">✓ ${own} in Sammlung</span>` : ""}</small></span><span class="v"><b class="pr">${eur(trendOf(x.p))}</b><br><small class="muted">ab ${eur(x.p[2])}</small></span></button>`; }
PAGES.sealed = guard(async el => {
  const all = await sealed(); const cats = [...new Set(all.map(x => x.c))].sort(); let q = "", cat = "", sort = "new", onlyPriced = true, limit = 60, setF = "";
  const setsWith = D.sets.filter(s => s.e && all.some(x => x.e === s.e));
  const draw = () => {
    let L = all.filter(x => (!cat || x.c === cat) && (!onlyPriced || trendOf(x.p) != null) && (!setF || x.e === +setF) && (!q || x.n.toLowerCase().includes(q)));
    if (sort === "pd") L = L.slice().sort((a, b) => (trendOf(b.p) || 0) - (trendOf(a.p) || 0)); if (sort === "pa") L = L.slice().sort((a, b) => (trendOf(a.p) ?? 1e9) - (trendOf(b.p) ?? 1e9)); if (sort === "name") L = L.slice().sort((a, b) => a.n.localeCompare(b.n));
    $("#sl", el).innerHTML = L.slice(0, limit).map(sealedRow).join("") + (L.length > limit ? `<button class="btn" id="more">Mehr anzeigen (${L.length - limit} weitere)</button>` : "") || `<div class="muted">Nichts gefunden.</div>`;
    $("#sn", el).textContent = L.length.toLocaleString("de-AT") + " Produkte"; const mo = $("#more", el); if (mo) mo.onclick = () => { limit += 60; draw(); };
  };
  el.innerHTML = `<div class="page" style="max-width:900px"><div><h1>Produkte</h1><p class="muted" style="margin-top:6px">Displays, Elite Trainer Boxes, Booster, Blister, Tins und mehr – mit Cardmarket-Preis. Produktnamen wie auf Cardmarket (Englisch).</p></div>
    <div class="row" style="gap:6px;flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px"><button class="chip on" data-cat="">Alle</button>${cats.map(c => `<button class="chip" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}</div>
    <div class="filters"><input type="text" id="q" placeholder="Suchen … (z. B. 151 Elite Trainer, Display)"><select id="st"><option value="">Alle Sets</option>${setsWith.map(s => `<option value="${s.e}">${esc(setName(s))}</option>`).join("")}</select><select id="s"><option value="new">Neueste zuerst</option><option value="pd">Preis ↓</option><option value="pa">Preis ↑</option><option value="name">Name</option></select><label class="row" style="gap:6px;font-size:13px"><input type="checkbox" id="op" checked> nur mit Preis</label></div>
    <small class="muted" id="sn"></small><div class="col" style="gap:8px" id="sl"></div></div>`;
  $("#q", el).oninput = e => { q = e.target.value.toLowerCase().trim(); limit = 60; draw(); }; $("#s", el).onchange = e => { sort = e.target.value; draw(); }; $("#op", el).onchange = e => { onlyPriced = e.target.checked; draw(); }; $("#st", el).onchange = e => { setF = e.target.value; draw(); };
  el.onclick = e => { const c = e.target.closest("[data-cat]"); if (c) { cat = c.dataset.cat; $$("[data-cat]", el).forEach(b => b.classList.toggle("on", b === c)); limit = 60; draw(); return; } const r = e.target.closest("[data-sealed]"); if (r) openSealed(+r.dataset.sealed); };
  draw();
});
async function openSealed(id) {
  await sealed(); const x = D.sealedMap[id]; if (!x) return; const t = T(); const s = x.e && D.expMap[x.e]; const mine = t.items.filter(i => i.kind === "sealed" && i.id === id); const w = t.watch.find(v => v.kind === "sealed" && v.id === id);
  App.modal(`<div class="spread"><div class="row" style="gap:12px;flex-wrap:nowrap"><span class="srow" style="padding:0;border:0;background:none;display:block;width:auto"><span class="ic">${SEALED_ICON(x.c)}</span></span><div><h2>${esc(x.n)}</h2><small class="muted">${esc(x.c)}${s ? " · " + esc(setName(s)) : ""}${x.d ? " · im Katalog seit " + fmtDate(x.d) : ""}</small></div></div><button class="btn ghost sm" data-close>✕</button></div>
    <div class="tcg-kpis"><div class="tcg-kpi"><b class="pr">${eur(x.p[0])}</b><small class="muted">Trend</small></div><div class="tcg-kpi"><b>${eur(x.p[2])}</b><small class="muted">ab</small></div><div class="tcg-kpi"><b>${eur(x.p[1])}</b><small class="muted">Durchschnitt</small></div><div class="tcg-kpi"><b>${eur(x.p[4])}</b><small class="muted">Ø 7 Tage</small></div></div>
    <small class="stamp">Cardmarket-Preisführer · alle Sprachen zusammen. Für den Preis einer bestimmten Sprache lohnt der Blick auf Cardmarket.</small>
    <div class="row" style="gap:8px"><a class="btn" href="${cmSearch(x.n)}" target="_blank" rel="noopener">Auf Cardmarket ansehen ↗</a><button class="btn ghost" id="wt">${w ? "★ Beobachtet" : "☆ Beobachten"}</button></div>
    ${mine.length ? `<div class="col" style="gap:6px"><span class="eyebrow">In deiner Sammlung</span>${mine.map(i => `<button class="srow" data-edit="${i.uid}"><span class="ic" style="font-weight:700">×${i.qty}</span><span class="t"><b>${esc(LANGS[i.lang] || i.lang)} · ${esc((SEALED_COND.find(c => c[0] === i.cond) || [0, i.cond])[1])}</b><small class="muted">Kauf ${eur(i.buy)} / Stück${i.date ? " · " + fmtDate(i.date) : ""}</small></span><span class="v"><b>${eur(itemUnit(i) != null ? itemUnit(i) * i.qty : null)}</b></span></button>`).join("")}</div>` : ""}
    <div class="card col" style="gap:10px;background:var(--card2)"><b>Zur Sammlung hinzufügen</b>
      <div class="grid g2"><label class="fld">Sprache<select id="al">${Object.entries(LANGS).map(([k, l]) => `<option value="${k}" ${k === t.lang ? "selected" : ""}>${l}</option>`).join("")}</select></label><label class="fld">Zustand<select id="ac">${SEALED_COND.map(([k, l]) => `<option value="${k}">${l}</option>`).join("")}</select></label></div>
      <div class="grid g2"><label class="fld">Anzahl<input type="number" id="aq" value="1" min="1" inputmode="numeric"></label><label class="fld">Kaufpreis pro Stück (€)<input type="number" id="ab" step="0.01" inputmode="decimal" placeholder="optional"></label></div>
      <div class="grid g2"><label class="fld">Kaufdatum<input type="date" id="ad" value="${today()}"></label><label class="fld">Notiz<input type="text" id="an" placeholder="optional"></label></div>
      <button class="btn pri" id="add">＋ Zur Sammlung</button></div>`, (m, close) => {
    m.addEventListener("click", e => { const ed = e.target.closest("[data-edit]"); if (ed) { close(); editItem(ed.dataset.edit); } });
    $("#wt", m).onclick = () => { close(); watchForm({ kind: "sealed", id, name: x.n, cur: trendOf(x.p) }); };
    $("#add", m).onclick = () => { const it = { uid: "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), kind: "sealed", id, name: x.n, cat: x.c, e: x.e, short: x.c, sub: `${x.c}${s ? " · " + setName(s) : ""}`, lang: $("#al", m).value, cond: $("#ac", m).value, qty: Math.max(1, +$("#aq", m).value || 1), buy: +String($("#ab", m).value).replace(",", ".") || 0, date: $("#ad", m).value, note: $("#an", m).value.trim(), added: Date.now(), last: trendOf(x.p) != null ? { t: trendOf(x.p), a7: x.p[4], a30: x.p[5], at: D.meta && D.meta.updated } : null };
      t.items.push(it); snapshot(); App.save(); App.renderSide(); App.toast("Hinzugefügt", `${it.qty}× ${it.name}`, "▣"); close(); if (["portfolio", "dash", "sealed"].includes(App.route().v)) App.render(); };
  });
}

/* ---------------- Karten suchen (global index) ---------------- */
PAGES.cards = guard(async (el, pre) => {
  const idx = await index(); const t = T(); const series = []; D.sets.forEach(s => { if (!series.some(x => x[0] === s.s)) series.push([s.s, (s.sn && (s.sn[t.lang] || s.sn.en)) || s.s]); });
  const rarities = [...new Set(idx.map(r => r[4]).filter(Boolean))].sort();
  let q = pre || "", ser = "", rar = "", sort = "pd", minP = "", maxP = "", limit = 60, withRev = false;
  const draw = () => {
    const qq = q.toLowerCase().trim(); let L = idx.filter(r => (!qq || (r[2] + " " + r[3]).toLowerCase().includes(qq) || r[1] === qq) && (!ser || (D.setMap[r[0]] || {}).s === ser) && (!rar || r[4] === rar) && (!minP || (r[5] || 0) >= +minP) && (!maxP || (r[5] != null && r[5] <= +maxP)));
    if (!qq && !ser && !rar && !minP && !maxP) L = L.filter(r => r[5] != null);
    const pv = r => withRev ? Math.max(r[5] || 0, r[6] || 0) : (r[5] || 0);
    if (sort === "pd") L = L.slice().sort((a, b) => pv(b) - pv(a)); if (sort === "pa") L = L.filter(r => r[5] != null).sort((a, b) => a[5] - b[5]); if (sort === "new") L = L.slice().sort((a, b) => ((D.setMap[b[0]] || {}).d || "").localeCompare((D.setMap[a[0]] || {}).d || "")); if (sort === "name") L = L.slice().sort((a, b) => (t.lang === "de" ? a[2] : a[3]).localeCompare(t.lang === "de" ? b[2] : b[3]));
    $("#rs", el).innerHTML = L.slice(0, limit).map(r => { const s = D.setMap[r[0]]; const nm = t.lang === "en" ? r[3] : r[2]; const own = t.items.some(i => i.kind === "card" && i.set === r[0] && i.l === r[1]); return `<button class="tcard" data-card="${esc(r[0])}|${esc(r[1])}"><div class="im">${imgTag(r[0], r[1], "low", nm)}${own ? `<span class="own">✓</span>` : ""}</div><div class="nm">${esc(nm)}</div><div class="meta"><span>${esc(s ? (s.a || setName(s)) : r[0])} · #${esc(r[1])}</span><span class="pr">${eur(r[5])}</span></div>${withRev && r[6] ? `<small class="muted">Reverse ${eur(r[6])}</small>` : ""}</button>`; }).join("") || `<div class="muted">Keine Karten gefunden.</div>`;
    $("#n", el).textContent = L.length.toLocaleString("de-AT") + " Karten" + (L.length > limit ? " · zeige " + limit : "");
    const mo = $("#more", el); mo.style.display = L.length > limit ? "" : "none";
  };
  el.innerHTML = `<div class="page"><div><h1>Karten suchen</h1><p class="muted" style="margin-top:6px">Alle ${idx.length.toLocaleString("de-AT")} Karten aus ${D.sets.length} Sets – Name auf Deutsch oder Englisch. Ohne Suchbegriff siehst du die teuersten Karten überhaupt.</p></div>
    <div class="filters"><input type="text" id="q" placeholder="z. B. Glurak, Charizard, Pikachu …" value="${esc(q)}" autocomplete="off"><select id="se"><option value="">Alle Serien</option>${series.map(([k, n]) => `<option value="${k}">${esc(n)}</option>`).join("")}</select><select id="ra"><option value="">Alle Seltenheiten</option>${rarities.map(r => `<option>${esc(r)}</option>`).join("")}</select><select id="so"><option value="pd">Preis ↓</option><option value="pa">Preis ↑</option><option value="new">Neueste Sets</option><option value="name">Name</option></select><input type="number" id="mi" placeholder="ab €" style="max-width:90px" inputmode="decimal"><input type="number" id="ma" placeholder="bis €" style="max-width:90px" inputmode="decimal"><label class="row" style="gap:6px;font-size:13px"><input type="checkbox" id="rv"> Reverse-Preise</label></div>
    <small class="muted" id="n"></small><div class="tgrid" id="rs"></div><button class="btn" id="more" style="display:none">Mehr anzeigen</button></div>`;
  let deb; $("#q", el).oninput = e => { clearTimeout(deb); deb = setTimeout(() => { q = e.target.value; limit = 60; draw(); }, 180); };
  $("#se", el).onchange = e => { ser = e.target.value; draw(); }; $("#ra", el).onchange = e => { rar = e.target.value; draw(); }; $("#so", el).onchange = e => { sort = e.target.value; draw(); }; $("#mi", el).oninput = e => { minP = e.target.value; draw(); }; $("#ma", el).oninput = e => { maxP = e.target.value; draw(); }; $("#rv", el).onchange = e => { withRev = e.target.checked; draw(); };
  $("#more", el).onclick = () => { limit += 60; draw(); };
  el.onclick = e => { const c = e.target.closest("[data-card]"); if (c) { const [s, l] = c.dataset.card.split("|"); openCard(s, l); } };
  draw();
});

/* ---------------- Sammlung (portfolio) ---------------- */
PAGES.portfolio = guard(async el => {
  await sets().catch(() => null); const t = T();
  let kind = "", lang = "", cond = "", setF = "", q = "", sort = "value", group = false;
  const ownedSets = [...new Set(t.items.filter(i => i.kind === "card").map(i => i.set))];
  const draw = () => {
    const f = i => (!kind || i.kind === kind) && (!lang || i.lang === lang) && (!cond || i.cond === cond) && (!setF || i.set === setF) && (!q || (i.name + " " + (i.nameEn || "") + " " + (i.sub || "")).toLowerCase().includes(q));
    const L = t.items.filter(f); const tot = totals(f);
    const val = i => (itemUnit(i) || 0) * i.qty, pl = i => val(i) - (i.buy || 0) * i.qty;
    const sorters = { value: (a, b) => val(b) - val(a), unit: (a, b) => (itemUnit(b) || 0) - (itemUnit(a) || 0), pl: (a, b) => pl(b) - pl(a), plp: (a, b) => ((b.buy ? pl(b) / (b.buy * b.qty) : -1e9) - (a.buy ? pl(a) / (a.buy * a.qty) : -1e9)), name: (a, b) => a.name.localeCompare(b.name), added: (a, b) => (b.added || 0) - (a.added || 0) };
    L.sort(sorters[sort]);
    const rowHTML = i => { const u = itemUnit(i), v = val(i), p = pl(i); return `<button class="srow" data-edit="${i.uid}"><span class="ic">${i.kind === "card" ? `<img loading="lazy" src="${cardImg(i.set, i.l, "low", i.lang)[0]}" data-fb="${cardImg(i.set, i.l, "low", "en")[0]}" onerror="tcgImgErr(this)" alt="">` : SEALED_ICON(i.cat || "")}</span><span class="t"><b>${i.qty > 1 ? i.qty + "× " : ""}${esc(i.name)}</b><small class="muted">${esc(i.sub || "")} · ${esc((i.lang || "").toUpperCase())} · ${esc(i.kind === "card" ? i.cond : ((SEALED_COND.find(c => c[0] === i.cond) || [0, i.cond])[1]))}${i.grade ? " · " + esc(i.grade) : ""}</small></span><span class="v"><b>${eur(u != null ? v : null)}</b><br>${i.qty > 1 && u != null ? `<small class="muted">${eur(u)} / Stk.</small><br>` : ""}${i.buy ? plSpan(p, i.buy ? p / (i.buy * i.qty) * 100 : null) : ""}</span></button>`; };
    let list;
    if (group) { const G = {}; L.forEach(i => { const k = i.kind === "card" ? i.set : "__sealed"; (G[k] = G[k] || []).push(i); }); list = Object.entries(G).sort((a, b) => b[1].reduce((s, i) => s + val(i), 0) - a[1].reduce((s, i) => s + val(i), 0)).map(([k, arr]) => `<div class="spread" style="margin-top:8px"><b>${k === "__sealed" ? "Sealed-Produkte" : esc(setName(D.setMap[k]) || k)}</b><span class="pr">${eur(arr.reduce((s, i) => s + val(i), 0))}</span></div>${arr.map(rowHTML).join("")}`).join(""); }
    else list = L.map(rowHTML).join("");
    const bySet = {}; t.items.forEach(i => { const k = i.kind === "card" ? (setName(D.setMap[i.set]) || i.set) : "Sealed"; bySet[k] = (bySet[k] || 0) + val(i); }); const bars = Object.entries(bySet).sort((a, b) => b[1] - a[1]).slice(0, 8); const bmax = bars.length ? bars[0][1] || 1 : 1;
    $("#pf", el).innerHTML = `<div class="tcg-kpis"><div class="tcg-kpi"><b class="pr">${eur0(tot.value)}</b><small class="muted">Wert${kind || lang || cond || setF || q ? " (gefiltert)" : ""}</small></div><div class="tcg-kpi"><b>${eur0(tot.buy)}</b><small class="muted">Einkauf</small></div><div class="tcg-kpi"><b class="${tot.pl >= 0 ? "up" : "down"}">${tot.pl >= 0 ? "+" : "−"}${eur0(Math.abs(tot.pl))}</b><small class="muted">${tot.plPct != null ? pct(tot.plPct) : "Gewinn/Verlust"}</small></div><div class="tcg-kpi"><b>${tot.cards} / ${tot.sealed}</b><small class="muted">Karten / Sealed</small></div></div>
      ${!t.items.length ? `<div class="card empty-state"><b>Noch nichts in der Sammlung</b><small class="muted">Such eine Karte oder ein Produkt und tippe auf „Zur Sammlung“.</small><div class="row"><button class="btn pri" data-go="cards">Karte suchen</button><button class="btn" data-go="sealed">Produkte</button></div></div>` : ""}
      ${bars.length > 1 && !group ? `<div class="card col bars" style="gap:2px"><span class="eyebrow">Wert nach Set</span>${bars.map(([k, v]) => `<div class="bar-row"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(k)}</span><span><i style="width:${Math.max(2, 100 * v / bmax)}%"></i></span><b class="tab">${eur0(v)}</b></div>`).join("")}</div>` : ""}
      <small class="muted">${L.length} Einträge${tot.unpriced ? ` · ${tot.unpriced} ohne Preis` : ""}</small><div class="col" style="gap:8px">${list}</div>`;
  };
  el.innerHTML = `<div class="page" style="max-width:960px"><div class="spread"><div><h1>Sammlung</h1><p class="muted" style="margin-top:6px">Alles, was du erfasst hast – mit aktuellem Cardmarket-Wert.</p></div><div class="row"><button class="btn sm" id="rf">↻ Preise</button><button class="btn sm ghost" id="csv">⤓ CSV</button></div></div>
    <div class="filters"><input type="text" id="q" placeholder="Suchen …"><select id="k"><option value="">Karten & Sealed</option><option value="card">Nur Karten</option><option value="sealed">Nur Sealed</option></select><select id="st"><option value="">Alle Sets</option>${ownedSets.map(s => `<option value="${esc(s)}">${esc(setName(D.setMap[s]) || s)}</option>`).join("")}</select><select id="lg"><option value="">Alle Sprachen</option>${Object.entries(LANGS).map(([k, l]) => `<option value="${k}">${l}</option>`).join("")}</select><select id="cd"><option value="">Alle Zustände</option>${CONDS.concat(SEALED_COND).map(([k, l]) => `<option value="${k}">${l}</option>`).join("")}</select><select id="so"><option value="value">Wert ↓</option><option value="unit">Stückpreis ↓</option><option value="pl">Gewinn € ↓</option><option value="plp">Gewinn % ↓</option><option value="name">Name</option><option value="added">Zuletzt hinzugefügt</option></select><label class="row" style="gap:6px;font-size:13px"><input type="checkbox" id="gr"> nach Set gruppieren</label></div>
    <div class="col" style="gap:12px" id="pf"></div></div>`;
  const bind = (id, fn, ev = "onchange") => { $(id, el)[ev] = e => { fn(e.target.type === "checkbox" ? e.target.checked : e.target.value); draw(); }; };
  bind("#q", v => q = v.toLowerCase().trim(), "oninput"); bind("#k", v => kind = v); bind("#st", v => setF = v); bind("#lg", v => lang = v); bind("#cd", v => cond = v); bind("#so", v => sort = v); bind("#gr", v => group = v);
  $("#rf", el).onclick = () => autoRefresh(true).then(draw);
  $("#csv", el).onclick = () => { const rows = [["Typ", "Name", "Name EN", "Set/Kategorie", "Nummer", "Variante", "Sprache", "Zustand", "Gradierung", "Anzahl", "Kaufpreis/Stk", "Trend/Stk", "Wert", "Gewinn", "Kaufdatum", "Notiz"]].concat(t.items.map(i => [i.kind === "card" ? "Karte" : "Sealed", i.name, i.nameEn || "", i.kind === "card" ? setName(D.setMap[i.set]) || i.set : i.cat, i.l || "", i.kind === "card" ? variantLabel({}, i.variant) : "", i.lang, i.cond, i.grade || "", i.qty, (i.buy || 0).toFixed(2), itemUnit(i) != null ? itemUnit(i).toFixed(2) : "", itemUnit(i) != null ? (itemUnit(i) * i.qty).toFixed(2) : "", itemUnit(i) != null ? (itemUnit(i) * i.qty - (i.buy || 0) * i.qty).toFixed(2) : "", i.date || "", i.note || ""]));
    App.download("sammlung-" + today() + ".csv", "﻿" + rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(";")).join("\n"), "text/csv"); };
  el.onclick = e => { const b = e.target.closest("[data-edit]"); if (b) editItem(b.dataset.edit); };
  draw();
});
function openItem(uid) { const i = T().items.find(x => x.uid === uid); if (!i) return; if (i.kind === "card") openCard(i.set, i.l); else openSealed(i.id); }
function editItem(uid) {
  const t = T(), i = t.items.find(x => x.uid === uid); if (!i) return; const card = i.kind === "card";
  App.modal(`<div class="spread"><div><h2>${esc(i.name)}</h2><small class="muted">${esc(i.sub || "")}</small></div><button class="btn ghost sm" data-close>✕</button></div>
    <div class="grid g2"><label class="fld">Anzahl<input type="number" id="eq" value="${i.qty}" min="1" inputmode="numeric"></label><label class="fld">Kaufpreis pro Stück (€)<input type="number" id="eb" step="0.01" value="${i.buy || ""}" inputmode="decimal"></label></div>
    <div class="grid g2"><label class="fld">Sprache<select id="el">${Object.entries(LANGS).map(([k, l]) => `<option value="${k}" ${k === i.lang ? "selected" : ""}>${l}</option>`).join("")}</select></label><label class="fld">Zustand<select id="ec">${(card ? CONDS : SEALED_COND).map(([k, l]) => `<option value="${k}" ${k === i.cond ? "selected" : ""}>${card ? k + " – " : ""}${l}</option>`).join("")}</select></label></div>
    <div class="grid g2"><label class="fld">Kaufdatum<input type="date" id="ed" value="${esc(i.date || "")}"></label>${card ? `<label class="fld">Gradierung<input type="text" id="eg" value="${esc(i.grade || "")}"></label>` : "<span></span>"}</div>
    <label class="fld">Notiz<input type="text" id="en" value="${esc(i.note || "")}"></label>
    <div class="tcg-kpis"><div class="tcg-kpi"><b>${eur(itemUnit(i))}</b><small class="muted">Trend / Stück</small></div><div class="tcg-kpi"><b>${eur(itemUnit(i) != null ? itemUnit(i) * i.qty : null)}</b><small class="muted">Wert</small></div></div>
    <div class="spread"><button class="btn danger sm" id="del">Entfernen</button><div class="row"><button class="btn ghost" id="op">${card ? "Karte" : "Produkt"} öffnen</button><button class="btn pri" id="sv">Speichern</button></div></div>`, (m, close) => {
    $("#sv", m).onclick = () => { i.qty = Math.max(1, +$("#eq", m).value || 1); i.buy = +String($("#eb", m).value).replace(",", ".") || 0; i.lang = $("#el", m).value; i.cond = $("#ec", m).value; i.date = $("#ed", m).value; if (card) i.grade = $("#eg", m).value.trim(); i.note = $("#en", m).value.trim(); snapshot(); App.save(); close(); App.render(); App.renderSide(); };
    $("#del", m).onclick = () => { if (!confirm("Aus der Sammlung entfernen?")) return; t.items.splice(t.items.indexOf(i), 1); snapshot(); App.save(); close(); App.render(); App.renderSide(); };
    $("#op", m).onclick = () => { close(); openItem(uid); };
  });
}

/* ---------------- Beobachtet (watchlist + price alerts) ---------------- */
function watchForm(w) {
  const t = T(); const ex = t.watch.find(x => x.kind === w.kind && (w.kind === "card" ? x.set === w.set && x.l === w.l : x.id === w.id)); const cur = ex || w;
  App.modal(`<div class="spread"><h2>Beobachten</h2><button class="btn ghost sm" data-close>✕</button></div><b>${esc(w.name)}</b><small class="muted">Aktueller Trendpreis: ${eur(w.cur)}</small>
    <div class="grid g2"><label class="fld">Alarm, wenn der Preis …<select id="wd"><option value="below" ${cur.dir !== "above" ? "selected" : ""}>fällt auf oder unter</option><option value="above" ${cur.dir === "above" ? "selected" : ""}>steigt auf oder über</option></select></label><label class="fld">Zielpreis (€, optional)<input type="number" id="wp" step="0.01" value="${cur.target || ""}" inputmode="decimal"></label></div>
    <small class="muted">Die App prüft bei jeder Preisaktualisierung. Mit erlaubten Benachrichtigungen bekommst du auch eine Mitteilung.</small>
    <div class="spread">${ex ? `<button class="btn danger sm" id="wr">Nicht mehr beobachten</button>` : "<span></span>"}<button class="btn pri" id="ws">Speichern</button></div>`, (m, close) => {
    $("#ws", m).onclick = () => { const o = ex || Object.assign({}, w); o.dir = $("#wd", m).value; o.target = +String($("#wp", m).value).replace(",", ".") || null; o.cur = w.cur; if (!ex) t.watch.push(o); App.save(); try { if (o.target && window.Notification && Notification.permission === "default") Notification.requestPermission(); } catch (e) {} close(); App.toast("Beobachtet", w.name, "☆"); if (App.route().v === "watch") App.render(); };
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
  const box = document.createElement("div"); box.className = "card col";
  box.innerHTML = `<h3>Sammlung</h3><label class="fld">Sprache für Kartennamen und Bilder<select id="tl">${NAME_LANGS.map(l => `<option value="${l}" ${l === T().lang ? "selected" : ""}>${LANGS[l]}</option>`).join("")}</select></label>
    <p class="muted" style="font-size:13.5px">Datenquellen: Preise aus dem offiziellen <b>Cardmarket-Preisführer</b> und -Produktkatalog (täglich von Cardmarket veröffentlicht, von der App automatisch geholt). Kartennamen und Bilder von <b>TCGdex</b>. Stand: ${D.meta ? fmtStamp(D.meta.updated) : "–"}.</p>
    <div class="row"><button class="btn sm" id="tr">↻ Preise jetzt prüfen</button></div>`;
  const page = el.querySelector(".page"); page && page.children[1] ? page.insertBefore(box, page.children[1]) : page && page.appendChild(box);
  $("#tl", box).onchange = e => { T().lang = e.target.value; App.save(); App.toast("Gespeichert", "Namen & Bilder: " + LANGS[e.target.value], "✓"); };
  $("#tr", box).onclick = () => autoRefresh(true);
};
PAGES.course = (el) => App.go("path");
if (!document.getElementById("spin-kf")) { const st = document.createElement("style"); st.id = "spin-kf"; st.textContent = "@keyframes spin{to{transform:rotate(360deg)}}"; document.head.appendChild(st); }
window.TCG = { D, T, refreshPrices, openCard, openSealed, totals };
})();
