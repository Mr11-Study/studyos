/* StudyOS · Profilbild: eigenes Foto (zugeschnitten, klein gespeichert), Emoji aus Kategorien oder Anfangsbuchstabe, mit Hintergrundfarbe.
   Alle Avatare in der App tragen data-avatar und werden über App.avatar.paint() sofort aktualisiert.
   Das Foto bleibt im Profil (und im eigenen Sync), Freunde unter „Gemeinsam“ sehen weiterhin Emoji oder Buchstaben.
   Muss vor extras.js geladen werden. */
(function () {
const { $, $$, esc } = App;
const S = () => App.S();
const st = () => S().settings || (S().settings = {});

const CATS = [
  ["beliebt", "Beliebt", "🦊🦉🐼🐱🐶🐧🐙🐝🦁🐢🚀🎧📚☕🌱⚡🎯🦄🐸🌈🔥💎🎮🍀"],
  ["katzen", "Katzen", "🐱😺😸😹😻😼😽🙀😿😾🐈🐈‍⬛🦁🐯🐆🐅"],
  ["hunde", "Hunde", "🐶🐕🦮🐕‍🦺🐩🐺🦊🦝🐾🦴"],
  ["tiere", "Tiere", "🐼🐨🐻🐻‍❄️🐹🐰🐭🐮🐷🐸🐵🐔🐧🐦🐤🦆🦅🦉🦇🐴🦄🐝🐞🦋🐌🐢🦎🐍🦖🦕🦔🦦🦥🦘🦒🐘🦛🦏🐿️🦩🦚🦜"],
  ["meer", "Meer", "🐙🦑🦀🦞🦐🐠🐟🐡🐬🐳🐋🦈🦭🐚🪸🌊"],
  ["natur", "Natur", "🌱🌿🍀🌵🌴🌲🌳🍁🍄🌸🌷🌻🌹🌼🪷🌙⭐🌞☀️⛅🌈❄️🔥⚡🌍"],
  ["essen", "Essen", "☕🍵🧋🍕🍔🌮🍣🍜🥨🥐🍩🍪🧁🍰🍫🍿🍓🍉🍑🥑🍋🍎🥕🌶️"],
  ["sport", "Sport", "⚽🏀🏈⚾🎾🏐🏓🏸🥊🏋️🚴🏃🧗🏄⛷️🏂🎿⛸️🏊🧘🏆🥇🎳♟️"],
  ["lernen", "Lernen & Tech", "📚📖✏️📝🎓🧠💡🔬🧪🧮📐📊💻⌨️🖥️📱🤖👾🛰️🚀🔭🧩🗂️📎"],
  ["gesichter", "Gesichter", "😀😎🤓🧐😇🥳🤩😴🤔😏🙂😊😄🥸🤠😺🤖👻💀👽🧑‍🎓🧑‍💻🧑‍🔬🧑‍🎨"],
  ["fantasie", "Fantasie", "🦄🐉🐲🧙🧚🧜🧛🧞🦸🦹🥷👑🔮🪄🏰🗿🪐☄️✨💫"],
  ["reisen", "Reisen", "✈️🚀🚂🚲🛴🚗🏍️⛵🗺️🧭🏔️🏝️🏕️🗼🗽🎡🎢🏙️🌋🎒"],
  ["symbole", "Symbole", "❤️🧡💛💚💙💜🖤🤍💎⭐🌟🎯🎵🎧🎨🎸🎹🎲🎮🪩🍀☮️♾️✅"]
];
const split = s => Array.from(new Intl.Segmenter ? new Intl.Segmenter("de", { granularity: "grapheme" }).segment(s) : s, x => x.segment || x);
CATS.forEach(c => c[2] = split(c[2]));
const ALL = [...new Set(CATS.flatMap(c => c[2]))];
const SUGGEST = ["🐱", "🐶", "🦊", "🦉", "🐼", "🚀", "📚"];
const BGS = [["", "Standard"], ["#76B82A", "FH-Grün"], ["#0E6B6B", "Petrol"], ["#2E66AE", "Blau"], ["#6E54B8", "Violett"], ["#A8336A", "Beere"], ["#B8611A", "Orange"], ["#B8931A", "Gold"], ["#4A5566", "Grau"],
  ["linear-gradient(135deg,#F6A35B,#D6456B)", "Sonnenuntergang"], ["linear-gradient(135deg,#3EC5D8,#2E66AE)", "Ozean"], ["linear-gradient(135deg,#9BE15D,#00A88F)", "Frühling"], ["linear-gradient(135deg,#B993FF,#6E54B8)", "Lavendel"]];

/* nur echte, kleine Bilder (aus dem Sync könnte sonst beliebiger Text kommen) */
const okImg = v => typeof v === "string" && v.length < 200000 && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v);
const okBg = v => BGS.some(b => b[0] === v);
const initial = () => (S().name || "?").trim().charAt(0).toUpperCase() || "?";
const inner = () => { const s = st(); return okImg(s.avatarImg) ? `<img src="${s.avatarImg}" alt="">` : esc(s.avatar || initial()); };
const cls = () => { const s = st(); return okImg(s.avatarImg) ? "has-img" : s.avatarBg && okBg(s.avatarBg) ? "has-bg" : ""; };
const html = (c, extra) => `<div class="${c} ${cls()}" data-avatar ${extra || ""} style="${cls() === "has-bg" ? "--avbg:" + st().avatarBg : ""}">${inner()}</div>`;
function paint() {
  $$("[data-avatar]").forEach(n => { n.innerHTML = inner(); n.classList.remove("has-img", "has-bg"); const c = cls(); if (c) n.classList.add(c); if (c === "has-bg") n.style.setProperty("--avbg", st().avatarBg); else n.style.removeProperty("--avbg");
    if (!n.closest(".modal")) { n.classList.remove("pop"); void n.offsetWidth; n.classList.add("pop"); } });
  $$("[data-av]").forEach(b => b.classList.toggle("on", !okImg(st().avatarImg) && (st().avatar || "") === b.dataset.av));
  $$("[data-avbg]").forEach(b => b.classList.toggle("on", (st().avatarBg || "") === b.dataset.avbg));
}
function set(patch) { Object.assign(st(), patch); App.save(); paint(); }
const pickEmoji = a => set({ avatar: a, avatarImg: "" });

/* ---------- Foto zuschneiden: ziehen zum Verschieben, Regler oder Mausrad zum Zoomen ---------- */
const N = 256;
function cropDialog(file, done) {
  if (!file || !/^image\//.test(file.type)) return App.toast("Kein Bild", "Bitte ein Foto (JPG, PNG, WebP) wählen.", "!");
  const url = URL.createObjectURL(file), img = new Image();
  img.onerror = () => { URL.revokeObjectURL(url); App.toast("Bild nicht lesbar", "Versuch es mit einem anderen Foto oder einem Screenshot davon.", "!"); };
  img.onload = () => {
    const W = img.naturalWidth, H = img.naturalHeight, base = Math.min(W, H);
    let z = 1, cx = W / 2, cy = H / 2;
    App.modal(`<div class="spread"><h2>Foto zuschneiden</h2><button class="btn ghost sm" data-close>✕</button></div>
      <p class="muted" style="font-size:14px">Ziehe das Bild zurecht und zoome, bis dein Gesicht im Kreis sitzt.</p>
      <div class="av-crop"><canvas width="${N * 2}" height="${N * 2}" id="avc" aria-label="Vorschau"></canvas></div>
      <label class="pf-goal av-zoom"><span aria-hidden="true">−</span><input type="range" id="avz" min="1" max="4" step="0.01" value="1" aria-label="Zoom"><span aria-hidden="true">＋</span></label>
      <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Abbrechen</button><button class="btn pri" id="avok">Übernehmen</button></div>`, (m, close) => {
      const cv = $("#avc", m), g = cv.getContext("2d");
      const clamp = () => { const s = base / z / 2; cx = Math.min(W - s, Math.max(s, cx)); cy = Math.min(H - s, Math.max(s, cy)); };
      const draw = (ctx, n) => { const s = base / z; ctx.clearRect(0, 0, n, n); ctx.drawImage(img, cx - s / 2, cy - s / 2, s, s, 0, 0, n, n); };
      const paintC = () => { clamp(); draw(g, cv.width); };
      let drag = null;
      cv.onpointerdown = e => { drag = { x: e.clientX, y: e.clientY, cx, cy }; cv.setPointerCapture(e.pointerId); };
      cv.onpointermove = e => { if (!drag) return; const k = base / z / cv.getBoundingClientRect().width; cx = drag.cx - (e.clientX - drag.x) * k; cy = drag.cy - (e.clientY - drag.y) * k; paintC(); };
      cv.onpointerup = cv.onpointercancel = () => { drag = null; };
      cv.onwheel = e => { e.preventDefault(); z = Math.min(4, Math.max(1, z * (e.deltaY < 0 ? 1.08 : 1 / 1.08))); $("#avz", m).value = z; paintC(); };
      $("#avz", m).oninput = e => { z = +e.target.value; paintC(); };
      paintC();
      $("#avok", m).onclick = () => {
        const c = document.createElement("canvas"); c.width = c.height = N; draw(c.getContext("2d"), N);
        let d = c.toDataURL("image/webp", 0.82); if (!/^data:image\/webp/.test(d)) d = c.toDataURL("image/jpeg", 0.85);
        URL.revokeObjectURL(url); close(); set({ avatarImg: d }); App.toast("Profilbild gespeichert", "Dein Foto ist jetzt dein Avatar.", "✓"); done && done();
      };
    });
  };
  img.src = url;
}
const fileInput = `<input type="file" accept="image/*" hidden data-avfile>`;
document.addEventListener("change", e => { const f = e.target.closest && e.target.closest("[data-avfile]"); if (!f || !f.files[0]) return; const file = f.files[0]; f.value = ""; cropDialog(file); });

/* ---------- Alle Avatare: Kategorien statt einer langen Liste ---------- */
let lastCat = "beliebt";
function picker() {
  const s = st();
  App.modal(`<div class="spread"><h2>Profilbild</h2><button class="btn ghost sm" data-close>✕</button></div>
    <div class="av-top">${html("av-big")}<div class="col" style="gap:8px;min-width:0"><b>${esc(S().name || "Student")}</b>
      <div class="row" style="gap:6px;flex-wrap:wrap"><label class="btn sm pri">Foto hochladen${fileInput}</label><button class="btn sm ghost" data-av="" title="Anfangsbuchstabe">${esc(initial())} Buchstabe</button>${okImg(s.avatarImg) ? `<button class="btn sm ghost" id="av-rmimg">Foto entfernen</button>` : ""}</div></div></div>
    <div class="av-sec"><span class="eyebrow">Hintergrund</span><div class="av-bgs">${BGS.map(([v, t]) => `<button type="button" data-avbg="${esc(v)}" class="${(s.avatarBg || "") === v ? "on" : ""}" style="--sw:${v || "var(--card3)"}" title="${t}" aria-label="Hintergrund ${t}">${v ? "" : "A"}</button>`).join("")}</div><small class="muted">Gilt für Emoji und Buchstabe.</small></div>
    <div class="av-sec"><div class="av-cats" role="tablist">${CATS.map(([k, t, l]) => `<button role="tab" data-cat="${k}" class="${k === lastCat ? "on" : ""}" aria-selected="${k === lastCat}">${l[0]} ${t}</button>`).join("")}</div>
      <div class="av-grid" id="av-grid"></div></div>
    <div class="row" style="justify-content:flex-end"><button class="btn pri" data-close>Fertig</button></div>`, (m) => {
    const grid = () => { const c = CATS.find(x => x[0] === lastCat); $("#av-grid", m).innerHTML = c[2].map(a => `<button type="button" data-av="${esc(a)}" aria-label="Avatar ${esc(a)}">${a}</button>`).join(""); paint(); };
    m.addEventListener("click", e => {
      const c = e.target.closest("[data-cat]"); if (c) { lastCat = c.dataset.cat; $$("[data-cat]", m).forEach(b => { b.classList.toggle("on", b === c); b.setAttribute("aria-selected", b === c); }); grid(); return; }
      const a = e.target.closest("[data-av]"); if (a) { pickEmoji(a.dataset.av); const r = $("#av-rmimg", m); if (r) r.remove(); return; }
      const b = e.target.closest("[data-avbg]"); if (b) { set({ avatarBg: b.dataset.avbg }); return; }
      if (e.target.closest("#av-rmimg")) { set({ avatarImg: "" }); e.target.closest("#av-rmimg").remove(); }
    });
    grid();
  });
}

/* ---------- kompakte Auswahl für die Profil-Karte: ein paar Vorschläge und „Mehr“ ---------- */
function rowHTML() {
  const s = st(), cur = s.avatar && !SUGGEST.includes(s.avatar) ? [s.avatar] : [];
  return `<div class="pf-row pf-avrow"><span class="pf-l">Profilbild</span><div class="pf-avwrap">
      <button type="button" class="pf-me" data-avopen aria-label="Profilbild ändern">${html("av-mid")}<i aria-hidden="true">✎</i></button>
      <div class="pf-av">${["", ...cur, ...SUGGEST].map(a => `<button type="button" data-av="${esc(a)}" class="${!okImg(s.avatarImg) && (s.avatar || "") === a ? "on" : ""}" aria-label="${a ? "Avatar " + a : "Anfangsbuchstabe"}">${a || esc(initial())}</button>`).join("")}
        <button type="button" class="pf-moreb" data-avopen>Mehr <small>${ALL.length}+</small></button></div>
      <label class="btn sm pf-photo">📷 Eigenes Foto${fileInput}</label></div></div>`;
}
document.addEventListener("click", e => {
  if (e.target.closest("[data-avopen]")) { e.preventDefault(); return picker(); }
  const a = e.target.closest(".pf-av [data-av]"); if (a) pickEmoji(a.dataset.av);
});

App.avatar = { html, paint, picker, rowHTML, CATS, BGS, ok: okImg };
})();
