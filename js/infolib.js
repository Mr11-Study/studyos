/* Info library for the calm profiles (craft, tcg): course content becomes searchable reference articles.
   No lessons, checks, learning path, quizzes or flashcards – just "Wissen" to look things up. */
(function () {
if (!App.NOGAME) return;
const { $, $$, esc, PAGES } = App;
const S = () => App.S();
const TRACK = window.STUDYOS_TRACK;
const TITLE = TRACK === "tcg" ? "Sammler-Wissen" : "Wissen";
const INTRO = TRACK === "tcg" ? "Nachschlagen statt lernen: Zustände, Seltenheiten, Produkte, Preise, Grading, Fälschungen und Aufbewahrung."
  : "Alles zum Nachschlagen – Material, Maschen, Techniken, Muster und Tricks. Einfach suchen oder ein Thema öffnen.";

/* ---------- navigation: replace learning entries by one "Wissen" entry ---------- */
const DROP = ["courses", "path", "flash", "quiz", "practice", "exam", "stats", "challenges", "gitlab"];
let placed = false; const nav = App.NAV.filter(([v]) => { if (DROP.includes(v)) { if (!placed) { placed = true; return true; } return false; } return true; }).map(x => DROP.includes(x[0]) ? ["wiki", TITLE, "❖"] : x);
if (!placed) nav.push(["wiki", TITLE, "❖"]);
App.NAV.length = 0; nav.forEach(x => App.NAV.push(x));
if (App.BNAV) App.BNAV = App.BNAV.map(x => DROP.includes(x[0]) ? ["wiki", "Wissen", "❖"] : x);

/* ---------- article index ---------- */
const strip = h => String(h || "").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
const textOf = l => l.blocks.map(b => b.t === "text" ? (b.h || "") + " " + strip((b.levels && (b.levels.normal || b.levels.simple)) || "") : b.t === "keys" ? b.items.map(strip).join(" ") : ["lead", "html", "callout", "tip", "warnbox"].includes(b.t) ? strip(b.html) : "").join(" ");
const summaryOf = l => { const lead = l.blocks.find(b => b.t === "lead"); const t = lead ? strip(lead.html) : strip((l.blocks.find(b => b.t === "text") || {}).levels?.normal || ""); return t.length > 150 ? t.slice(0, 147).replace(/\s\S*$/, "") + " …" : t; };
const ART = App.LESSONS.map(l => ({ l, id: l.id, title: l.title, course: App.CBY[l.course], world: l.world, sum: summaryOf(l), hay: (l.title + " " + (l.world && l.world.title) + " " + textOf(l)).toLowerCase() }));
const ABY = Object.fromEntries(ART.map(a => [a.id, a]));
const EXTRA = () => { const x = [];
  if (window.CraftTech) Object.entries(CraftTech.TECH).forEach(([k, t]) => x.push({ kind: "Technik", title: t.title, go: "tech", p: k, hay: (t.title + " " + (t.en || "") + " " + (t.sub || "")).toLowerCase(), sum: (t.en ? t.en + " · " : "") + "Animation Schritt für Schritt" }));
  if (window.Craft && Craft.PAT) Object.entries(Craft.PAT).forEach(([k, p]) => x.push({ kind: "Maschenlexikon", title: p.name, go: "dict", p: null, hay: (p.name + " " + (p.en || "") + " " + (p.use || "")).toLowerCase(), sum: p.use || "" }));
  return x; };
const bm = id => (S().bookmarks || []).some(b => b.kind === "lesson" && b.id === id);

function hl(text, q) { if (!q) return esc(text); const i = text.toLowerCase().indexOf(q); if (i < 0) return esc(text); return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length)); }
function snippet(a, q) { if (!q) return a.sum; const t = textOf(a.l); const i = t.toLowerCase().indexOf(q); if (i < 0) return a.sum; const s = Math.max(0, i - 60); return (s ? "… " : "") + t.slice(s, i + 90) + " …"; }
const row = (a, q) => `<button class="guide-row" data-go="article" data-p="${a.id}"><span class="ic" style="color:${a.course.color}">${a.course.icon}</span><span><b>${hl(a.title, q)}</b><small class="muted">${hl(snippet(a, q), q)}</small></span><span class="muted">${bm(a.id) ? "★" : "›"}</span></button>`;

/* ---------- Wissen (index + search) ---------- */
PAGES.wiki = (el, pre) => {
  let q = typeof pre === "string" && !pre.startsWith("c:") ? pre : "", cf = typeof pre === "string" && pre.startsWith("c:") ? pre.slice(2) : "";
  const courses = App.COURSES;
  el.innerHTML = `<div class="page" style="max-width:860px"><div><h1>${TITLE}</h1><p class="muted" style="margin-top:6px">${INTRO}</p></div>
    <div class="wiki-search"><span>⌕</span><input type="search" id="wq" placeholder="Suchen … ${TRACK === "tcg" ? "(z. B. Reverse, PSA, Display)" : "(z. B. Maschenprobe, Magic Ring, abketten)"}" value="${esc(q)}" autocomplete="off"></div>
    ${courses.length > 1 ? `<div class="row" style="gap:6px"><button class="chip ${!cf ? "on" : ""}" data-cf="">Alles</button>${courses.map(c => `<button class="chip ${cf === c.id ? "on" : ""}" data-cf="${c.id}">${c.icon} ${esc(c.title)}</button>`).join("")}</div>` : ""}
    <div id="wl" class="col" style="gap:14px"></div></div>`;
  const draw = () => { const qq = q.toLowerCase().trim(); const box = $("#wl", el);
    const saved = ART.filter(a => bm(a.id) && (!cf || a.course.id === cf));
    if (qq) { const hits = ART.filter(a => (!cf || a.course.id === cf) && a.hay.includes(qq)).sort((a, b) => (b.title.toLowerCase().includes(qq) ? 1 : 0) - (a.title.toLowerCase().includes(qq) ? 1 : 0)); const ex = EXTRA().filter(x => x.hay.includes(qq)).slice(0, 8);
      box.innerHTML = `<small class="muted">${hits.length + ex.length} Treffer</small>${hits.length ? `<div class="card col" style="gap:0;padding:6px 16px">${hits.map(a => row(a, qq)).join("")}</div>` : ""}${ex.length ? `<div class="card col" style="gap:0;padding:6px 16px"><span class="eyebrow" style="padding-top:10px">Auch in der App</span>${ex.map(x => `<button class="guide-row" data-go="${x.go}" ${x.p ? `data-p="${esc(x.p)}"` : ""}><span class="ic">${x.kind === "Technik" ? "✋" : "❋"}</span><span><b>${hl(x.title, qq)}</b><small class="muted">${esc(x.kind)} · ${esc(x.sum)}</small></span><span class="muted">›</span></button>`).join("")}</div>` : ""}${!hits.length && !ex.length ? `<div class="card empty-state"><b>Nichts gefunden</b><small class="muted">Versuch ein anderes Wort oder die englische Bezeichnung.</small></div>` : ""}`; return; }
    box.innerHTML = (saved.length ? `<div class="card col" style="gap:0;padding:6px 16px"><span class="eyebrow" style="padding-top:10px">★ Gemerkt</span>${saved.map(a => row(a)).join("")}</div>` : "") +
      courses.filter(c => !cf || c.id === cf).map(c => c.worlds.map(w => { const arts = ART.filter(a => a.world === w); if (!arts.length) return ""; return `<div class="col" style="gap:8px"><div class="row" style="gap:8px;align-items:baseline"><span class="eyebrow" style="color:${c.color}">${esc(courses.length > 1 ? c.title : "Kapitel")}</span><h2 style="font-size:19px">${esc(w.title)}</h2></div>${w.sub ? `<small class="muted" style="margin-top:-4px">${esc(w.sub)}</small>` : ""}<div class="card col" style="gap:0;padding:6px 16px">${arts.map(a => row(a)).join("")}</div></div>`; }).join("")).join("");
  };
  let deb; $("#wq", el).oninput = e => { clearTimeout(deb); deb = setTimeout(() => { q = e.target.value; draw(); }, 120); };
  el.onclick = e => { const c = e.target.closest("[data-cf]"); if (c) { cf = c.dataset.cf; $$("[data-cf]", el).forEach(b => b.classList.toggle("on", b === c)); draw(); } };
  draw();
};

/* ---------- Artikel ---------- */
PAGES.article = (el, id) => {
  const a = ABY[id]; if (!a) return App.go("wiki"); const l = a.l, c = a.course, w = a.world;
  const siblings = ART.filter(x => x.world === w), i = siblings.indexOf(a), prev = siblings[i - 1], next = siblings[i + 1];
  const lvl = S().settings.level || "normal", de = c.lang !== "en";
  el.innerHTML = `<div class="page">
    <div class="crumbs"><button data-go="wiki">${TITLE}</button><span>/</span><button data-go="wiki" data-p="c:${c.id}">${esc(c.title)}</button><span>/</span><span>${esc(w.title)}</span></div>
    <div class="spread"><div><h1>${esc(l.title)}</h1><div class="row" style="margin-top:8px;gap:8px"><span class="chip tab">≈ ${l.min} min Lesezeit</span>${App.bmBtn("lesson", l.id, l.title, l.id)}</div></div>
      ${l.blocks.some(b => b.t === "text") ? `<div class="row"><span class="eyebrow">Erklärung</span><div class="lvl" role="group">${[["simple", "Kurz & einfach"], ["normal", "Normal"], ["technical", "Ausführlich"]].map(([k, t]) => `<button data-lvl="${k}" class="${lvl === k ? "on" : ""}">${t}</button>`).join("")}</div></div>` : ""}</div>
    <div class="lesson"><div class="lesson-main" id="blocks"></div>
      <aside class="lesson-aside">
        <div class="card col" style="gap:0;padding:6px 16px"><span class="eyebrow" style="padding-top:10px">Mehr zu „${esc(w.title)}“</span>${siblings.filter(x => x !== a).map(x => row(x)).join("") || `<small class="muted" style="padding:10px 0">Keine weiteren Artikel.</small>`}</div>
        <div class="spread">${prev ? `<button class="btn ghost sm" data-go="article" data-p="${prev.id}">← ${esc(prev.title)}</button>` : "<span></span>"}${next ? `<button class="btn ghost sm" data-go="article" data-p="${next.id}">${esc(next.title)} →</button>` : ""}</div>
        <div class="card col notes" id="notes"></div>
      </aside></div></div>`;
  const blocks = $("#blocks", el); const st = { checks: {} };
  l.blocks.forEach((b, k) => { if (b.t === "check") return; const d = App.renderBlock(b, k, l, st, lvl); blocks.appendChild(d); });
  $$("[data-alt]", blocks).forEach(b => { b.textContent = "Anders erklärt"; });
  el.querySelector(".page").addEventListener("click", e => { const lb = e.target.closest("[data-lvl]"); if (lb) { S().settings.level = lb.dataset.lvl; App.save(); App.render(); } });
  App.renderNotes($("#notes", el), l); App.mountWidgets(blocks, l);
};

/* ---------- old learning routes → Wissen ---------- */
PAGES.lesson = (el, id) => ABY[id] ? App.go("article", id) : App.go("wiki");
["path", "courses", "course", "quiz", "flash", "boss", "exam", "practice", "stats", "challenges", "gitlab", "achievements"].forEach(v => { PAGES[v] = () => App.go("wiki"); });
App.INFOLIB = { ART, ABY, TITLE };
})();
