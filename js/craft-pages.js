/* Craft track pages: Heute, 3D-Studio, Techniken, Musterdesigner, Maschenlexikon, Reihenzähler, Werkzeuge, Projekte. */
(function () {
if (!window.Craft) return;
const { $, $$, esc, PAGES } = App;
const S = () => App.S(); const K = window.Craft, C = K.C, Y = window.Yarn3D;

/* ---------------- shell configuration ---------------- */
App.NAV.length = 0;
[["dash", "Heute", "⌂"], ["courses", "Kurse", "◫"], ["path", "Lernpfad", "⤳"], ["studio", "3D-Studio", "◈"], ["tech", "Techniken", "✋"], ["designer", "Musterdesigner", "▦"], ["dict", "Maschenlexikon", "❋"],
 ["counter", "Reihenzähler", "#"], ["tools", "Werkzeuge", "⚖"], ["projects", "Projekte", "✿"], ["flash", "Karteikarten", "▭"], ["quiz", "Wissen testen", "?"], ["resources", "Videos & Links", "⎘"]].forEach(x => App.NAV.push(x));
App.BNAV = [["dash", "Heute", "⌂"], ["wiki", "Wissen", "❖"], ["studio", "3D", "◈"], ["counter", "Zähler", "#"], ["__more", "Mehr", "☰"]];
App.BRAND = { logo: "✿", name: "StudyOS", sub: "Stricken & Häkeln" };
App.WELCOME = "Deine Hilfe fürs Stricken und Häkeln: Wissen zum Nachschlagen, Techniken Schritt für Schritt, Maschen in 3D, Musterdesigner und Reihenzähler. Alles bleibt auf deinem Gerät.";

const TIPS = [
  "Setz alle 10 oder 20 Maschen einen Maschenmarkierer – dann musst du nie wieder ganz von vorne zählen.",
  "Rettungsleine: Vor einem schwierigen Musterteil einen glatten Kontrastfaden durch alle Maschen ziehen.",
  "Kauf alle Knäuel für ein Projekt mit derselben Farbpartie (Dye Lot).",
  "Abkettkante zu fest? Mit einer 1–2 Stärken dickeren Nadel abketten.",
  "Anschlagkante zu fest? Über zwei Nadeln zusammen anschlagen.",
  "Beim Rundstricken: Anschlag vor der ersten Runde auf Verdrehen prüfen – zweimal!",
  "Häkeln: Die Schlinge immer auf dem dicken Teil der Nadel bilden – so werden alle Maschen gleich groß.",
  "US „sc“ = UK „dc“ = feste Masche. Prüfe immer, welches System eine Anleitung nutzt.",
  "Fäden einhäkeln statt vernähen: Das Fadenende beim Häkeln einfach mit umhäkeln.",
  "Sauberer Farbwechsel beim Häkeln: Letzten Umschlag schon mit der neuen Farbe durchziehen.",
  "Symmetrische Abnahmen: am Reihenanfang ssk, am Ende k2tog.",
  "Spannen (Blocken) macht aus „selbstgemacht“ „handgemacht“ – vor allem bei Lochmustern.",
  "Maschenprobe waschen, bevor du misst – manche Garne ändern sich beim Waschen stark.",
  "Spannfäden bei Fair Isle locker lassen: Arbeit auf der Nadel leicht auseinanderziehen, bevor du die Farbe wechselst.",
  "Eine gefallene Masche? Sofort mit einem Markierer sichern – dann läuft sie nicht weiter.",
  "Amigurumi: Mit der Füllung nicht sparen – aber erst füllen, bevor die Öffnung zu klein wird.",
  "Glatt rechts rollt sich ein. Gib Schals einen Krausrand oder Rippenrand von 3–4 Maschen.",
  "Zähl nach jeder Reihe die Maschen, solange du neu bist – Fehler findest du so in Sekunden statt Stunden.",
  "Maschen verdreht? Das vordere Bein einer Masche gehört vor die Nadel.",
  "Bei Stäbchen-Reihen zählen die 3 Wendeluftmaschen meist als erstes Stäbchen.",
  "Holznadeln für glatte Garne, Metallnadeln für haarige oder griffige Garne.",
  "Fotografiere deine Maschenprobe mit Lineal – dann hast du sie später noch.",
  "Beim Häkeln in Runden die erste Masche jeder Runde markieren – Spiralrunden verzeihen kein Verzählen.",
  "Rippen-Bündchen mit einer Nadel 0,5–1 mm dünner stricken als den Rest – sie sitzen dann besser."
];
const dayIdx = () => Math.floor(Date.now() / 864e5);

/* ---------------- Heute (calm guide, no game elements) ---------------- */
const GUIDE = [
  ["wiki", "❖", "Wissen", "Alles zum Nachschlagen: Material, Maschen, Muster, Fehler beheben, Tricks – mit Suche."],
  ["tech", "✋", "Techniken", "Jede Masche Schritt für Schritt als Animation. Ideal, wenn du gerade mit Nadel in der Hand nachschauen willst."],
  ["studio", "◈", "3D-Studio", "Maschen von allen Seiten ansehen, drehen und heranzoomen – so verstehst du, wie das Gestrick aufgebaut ist."],
  ["dict", "❋", "Maschenlexikon", "Muster wie Rippen, Perlmuster oder Korbmuster mit Bild, Anleitung und 3D-Ansicht."],
  ["designer", "▦", "Musterdesigner", "Eigene Muster zeichnen – die App schreibt dir die Anleitung Reihe für Reihe."],
  ["counter", "#", "Reihenzähler", "Große Tasten zum Mitzählen, der Bildschirm bleibt an."],
  ["tools", "⚖", "Werkzeuge", "Maschenprobe, gleichmäßig verteilen, Nadelgrößen, Abkürzungen Deutsch/Englisch."],
  ["projects", "✿", "Projekte", "Deine Werkstücke mit Garn, Nadel, Notizen und Foto."],
  ["resources", "⎘", "Videos & Links", "Gute Video-Anleitungen und Seiten zum Weiterlesen."]
];
const RECENT_V = { article: "Wissen", tech: "Technik", studio: "3D-Studio", designer: "Musterdesigner", dict: "Maschenlexikon", tools: "Werkzeuge", counter: "Reihenzähler", projects: "Projekte" };
const origGo = App.go;
App.go = (v, p) => { try { if (RECENT_V[v]) { const c = C(); c.recent = (c.recent || []).filter(r => !(r.v === v && r.p === (p ?? null))); let title = RECENT_V[v]; if (v === "article" && App.LBYID[p]) title = App.LBYID[p].title; if (v === "wiki" && p) return origGo(v, p); if (v === "tech" && p && CraftTech.TECH[p]) title = CraftTech.TECH[p].title; c.recent.unshift({ v, p: p ?? null, title, kind: RECENT_V[v], at: Date.now() }); c.recent = c.recent.slice(0, 6); } } catch (e) {} origGo(v, p); };
PAGES.dash = el => {
  const s = S(), name = s.name || "du", h = new Date().getHours(), greet = h < 11 ? "Guten Morgen" : h < 18 ? "Hallo" : "Guten Abend";
  const courses = App.COURSES; const act = C().projects.filter(p => p.status === "active"); const recent = (C().recent || []).filter(r => r.v !== "dash").slice(0, 4);
  const cont = courses.map(c => { const ls = App.courseLessons(c.id); return { c, next: App.nextLesson(c.id), done: ls.filter(l => App.isDone(l.id)).length, all: ls.length }; });
  const tip = TIPS[dayIdx() % TIPS.length];
  el.innerHTML = `<div class="page" style="max-width:860px">
    <div class="cr-hero"><svg class="yarnball" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="44" fill="#E3A08F"/><g fill="none" stroke="#C8664B" stroke-width="3" opacity=".8"><path d="M22 48c20-12 58-14 80 6"/><path d="M18 64c26-14 66-12 86 8"/><path d="M26 84c20-10 50-10 70 2"/><path d="M40 22c-6 26 2 62 26 82"/><path d="M60 16c-8 30 0 62 22 84"/></g></svg>
      <span class="eyebrow" style="color:var(--acc2)">${new Date().toLocaleDateString("de-AT", { weekday: "long", day: "numeric", month: "long" })}</span>
      <h1 style="margin-top:6px">${greet}, ${esc(name)}</h1><p class="muted" style="margin-top:6px;max-width:46ch">Schön, dass du da bist. Hier findest du alles rund ums Stricken und Häkeln – in deinem Tempo.</p></div>
    ${recent.length ? `<div class="col" style="gap:8px"><span class="eyebrow">Zuletzt geöffnet</span><div class="row" style="gap:8px">${recent.map(r => `<button class="chip" data-go="${r.v}" ${r.p ? `data-p="${esc(r.p)}"` : ""}>${esc(r.title)} <small class="muted">· ${esc(r.kind)}</small></button>`).join("")}</div></div>` : ""}
    <div class="card col" style="gap:12px"><div class="wiki-search"><span>⌕</span><input type="search" id="dq" placeholder="Was suchst du? (z. B. Maschenprobe, Magic Ring)" autocomplete="off"></div>
      <div class="grid g2">${courses.map(c => `<div class="col" style="gap:8px"><div class="row" style="gap:8px"><span style="font-size:20px;color:${c.color}">${c.icon}</span><b style="font:600 17px var(--f-display)">${esc(c.title)}</b></div><div class="row" style="gap:6px">${c.worlds.filter(w => w.lessons && w.lessons.length).map(w => `<button class="chip" data-go="article" data-p="${w.lessons[0].id}">${esc(w.title)}</button>`).join("")}</div></div>`).join("")}</div></div>
    <div class="card col" style="gap:4px"><h2>Wo finde ich was?</h2><p class="muted" style="font-size:14px;margin-bottom:6px">Alles ist auch über das Menü erreichbar (☰ oben links bzw. „Mehr“ unten).</p>
      ${GUIDE.map(([v, ic, t, d]) => `<button class="guide-row" data-go="${v}"><span class="ic">${ic}</span><span><b>${t}</b><small class="muted">${d}</small></span><span class="muted">›</span></button>`).join("")}</div>
    ${act.length ? `<div class="col" style="gap:10px"><h2>In Arbeit</h2>${act.slice(0, 3).map(projCard).join("")}</div>` : ""}
    <div class="card col" style="gap:8px;background:linear-gradient(135deg,#FFFFFF,#F7F1EA)"><span class="eyebrow" style="color:var(--sage)">Tipp</span><p style="font:500 17px/1.45 var(--f-display)">${esc(tip)}</p><div><button class="btn ghost sm" id="tip-next">Noch ein Tipp →</button></div></div>
  </div>`;
  $("#dq", el).onkeydown = e => { if (e.key === "Enter" && e.target.value.trim()) App.go("wiki", e.target.value.trim()); };
  let ti = dayIdx(); $("#tip-next", el).onclick = e => { ti++; e.target.closest(".card").querySelector("p").textContent = TIPS[ti % TIPS.length]; };
};

/* ---------------- 3D-Studio ---------------- */
const VIEWGUIDE = {
  knit: [["Vorne", "Du siehst die rechte Seite. Glatt rechts: Säulen aus Vs. Jedes V = eine Masche, gestapelte Vs = Reihen."], ["Hinten", "Die linke Seite zeigt Knötchen (Maschenköpfe). Deshalb sieht die Rückseite von glatt rechts aus wie lauter linke Maschen."], ["Seite", "Von der Seite erkennst du, warum glatt rechts rollt: Die Maschen liegen vorne und hinten unterschiedlich. Bei Rippen siehst du Höhen und Tiefen."], ["Oben", "Von oben siehst du, wie jede Schlinge durch die Schlinge der Reihe darunter gezogen ist – das ist die ganze Magie des Strickens."], ["Nah", "Ganz nah siehst du die Verzwirnung des Garns und wie die Beine einer Masche über die Nachbarreihe laufen."]],
  crochet: [["Vorne", "Oben auf jeder Reihe liegt eine Kette aus Vs – die Maschenglieder, in die du in der nächsten Reihe einstichst."], ["Hinten", "Häkelmaschen sehen von hinten anders aus als von vorne – deshalb sehen gewendete Reihen gestreift aus."], ["Seite", "Von der Seite siehst du die Höhe: feste Masche niedrig, Stäbchen doppelt so hoch."], ["Oben", "Von oben siehst du die zwei Maschenglieder (vorderes und hinteres) jeder Masche."], ["Nah", "Nah dran siehst du die Umschläge um den Stäbchenkörper."]]
};
PAGES.studio = (el, p) => {
  const M = K.M3; let craft = p && M[p] ? M[p].k : (App.S().course === "crochet" ? "crochet" : "knit"); let cur = p && M[p] ? p : (craft === "knit" ? "stockinette" : "sc");
  const draw = () => {
    el.innerHTML = `<div class="page"><div><h1>3D-Studio</h1><p class="muted" style="margin-top:6px">Echte Garnführung in 3D. Ziehen zum Drehen, zwei Finger zum Zoomen, Ansichten unten. „Aufbauen“ zeigt Reihe für Reihe, wie das Gestrick entsteht.</p></div>
      <div class="seg"><button data-c="knit" class="${craft === "knit" ? "on" : ""}">Stricken</button><button data-c="crochet" class="${craft === "crochet" ? "on" : ""}">Häkeln</button></div>
      <div class="row" style="gap:6px">${Object.entries(M).filter(([k, m]) => m.k === craft).map(([k, m]) => `<button class="chip ${k === cur ? "on" : ""}" data-k="${k}">${esc(m.label)}</button>`).join("")}</div>
      <div class="card" id="st-v"></div>
      <div class="col" style="gap:10px"><h2>Blickwinkel-Guide</h2><div class="grid g2">${VIEWGUIDE[craft].map(([t, d]) => `<div class="card col" style="gap:4px"><b>${t}</b><small style="font-size:13.5px;color:var(--muted)">${d}</small></div>`).join("")}</div></div></div>`;
    const V = K.viewer($("#st-v", el), cur);
    el.onclick = e => { const c = e.target.closest("[data-c]"); if (c) { craft = c.dataset.c; cur = craft === "knit" ? "stockinette" : "sc"; draw(); return; } const k = e.target.closest("[data-k]"); if (k) { cur = k.dataset.k; $$("[data-k]", el).forEach(b => b.classList.toggle("on", b === k)); V.set(cur); } };
  };
  draw();
};

/* ---------------- Techniken ---------------- */
const TEXT_TECH = [
  { id: "longtail", craft: "knit", t: "Kreuzanschlag", en: "long-tail cast on", lvl: 1, steps: ["Fadenende ca. 3× so lang wie die Breite abmessen.", "Anfangsschlinge auf die Nadel.", "Fadenende über den Daumen, Arbeitsfaden über den Zeigefinger (Steinschleuder).", "Nadel von unten in die Daumenschlinge, Zeigefinger-Faden greifen, durch die Daumenschlinge holen.", "Daumen lösen, Masche sanft festziehen. Wiederholen."], q: "Kreuzanschlag stricken" },
  { id: "m1", craft: "knit", t: "Zunahme aus dem Querfaden (M1L/M1R)", en: "make one", lvl: 2, steps: ["Querfaden zwischen zwei Maschen finden.", "M1L: Querfaden von vorne nach hinten mit der linken Nadel aufnehmen, hinteres Glied rechts stricken.", "M1R: Querfaden von hinten nach vorne aufnehmen, vorderes Glied rechts stricken.", "Beide sind fast unsichtbar und neigen in entgegengesetzte Richtungen."], q: "M1L M1R stricken Zunahme" },
  { id: "ssk", craft: "knit", t: "Überzogene Abnahme (ssk)", en: "slip slip knit", lvl: 2, steps: ["2 Maschen einzeln wie zum Rechtsstricken abheben.", "Linke Nadel von links vorne in beide Maschen stecken.", "Beide zusammen verschränkt rechts stricken.", "Neigt sich nach links – Gegenstück zu k2tog."], q: "ssk Abnahme stricken" },
  { id: "cable", craft: "knit", t: "Zopf kreuzen (C4F)", en: "cable 4 front", lvl: 3, steps: ["2 Maschen auf die Zopfnadel heben, vor die Arbeit legen.", "Die nächsten 2 Maschen rechts stricken.", "Die 2 Maschen von der Zopfnadel rechts stricken.", "Für C4B die Zopfnadel hinter die Arbeit legen."], q: "Zopfmuster stricken C4F" },
  { id: "ladder", craft: "knit", t: "Gefallene Masche retten", en: "fix a dropped stitch", lvl: 2, steps: ["Masche sichern (Markierer/Sicherheitsnadel).", "Rechte Seite zu dir drehen.", "Häkelnadel von vorne in die Masche, unterste Sprosse greifen und durchziehen.", "Wiederholen bis oben, Masche richtig herum auf die linke Nadel."], q: "gefallene Masche aufnehmen" },
  { id: "mattress", craft: "knit", t: "Matratzenstich", en: "mattress stitch", lvl: 2, steps: ["Beide Teile mit der rechten Seite nach oben nebeneinander legen.", "Mit der Wollnadel den Querfaden zwischen Rand- und nächster Masche aufnehmen – abwechselnd links und rechts.", "Alle paar Stiche vorsichtig anziehen – die Naht verschwindet."], q: "Matratzenstich zusammennähen stricken" },
  { id: "magic", craft: "crochet", t: "Magic Ring", en: "magic ring / adjustable ring", lvl: 2, steps: ["Faden zweimal um zwei Finger wickeln, Kreuzung festhalten.", "Nadel unter dem Ring durch, Faden holen, durchziehen.", "1 Luftmasche (zählt nicht).", "Gewünschte Maschen in den Ring häkeln.", "Am Fadenende ziehen – Ring schließt sich."], q: "Magic Ring häkeln" },
  { id: "invdec", craft: "crochet", t: "Unsichtbare Abnahme", en: "invisible decrease", lvl: 2, steps: ["In das vordere Glied der nächsten Masche einstechen.", "Direkt in das vordere Glied der übernächsten Masche einstechen.", "Umschlag, durch beide vorderen Glieder ziehen (2 Schlingen).", "Umschlag, durch beide Schlingen."], q: "unsichtbare Abnahme häkeln" },
  { id: "colorchange", craft: "crochet", t: "Farbwechsel", en: "color change", lvl: 1, steps: ["Letzte Masche der alten Farbe bis zum letzten Umschlag arbeiten.", "Neue Farbe als Umschlag nehmen und durchziehen.", "Alte Farbe hinten hängen lassen oder einhäkeln."], q: "Farbwechsel häkeln sauber" },
  { id: "granny", craft: "crochet", t: "Granny Square", en: "granny square", lvl: 2, steps: ["4 Lm, zum Ring schließen.", "3 Lm, 2 Stb in den Ring, *2 Lm, 3 Stb* ×3, 2 Lm, mit Km schließen.", "Nächste Runde: in jede Ecke *3 Stb, 2 Lm, 3 Stb*, an den Seiten 3 Stb in jede Lücke."], q: "Granny Square häkeln Anfänger" }
];
PAGES.tech = (el, id) => {
  const T = CraftTech.TECH;
  if (id && T[id]) {
    const t = T[id];
    el.innerHTML = `<div class="page" style="max-width:760px"><div><button class="btn ghost sm" data-go="tech">← Alle Techniken</button><h1 style="margin-top:8px">${esc(t.title)}</h1><p class="muted">${esc(t.en)} · ${t.craft === "knit" ? "Stricken" : "Häkeln"}</p></div><div class="card" id="tp"></div>
      <div class="row" style="gap:8px">${t.view3d ? `<button class="btn" data-go="studio" data-p="${t.view3d}">◈ In 3D ansehen</button>` : ""}<a class="btn ghost" href="https://www.youtube.com/results?search_query=${encodeURIComponent(t.video)}" target="_blank" rel="noopener">▶ Video suchen</a></div></div>`;
    CraftTech.player($("#tp", el), id, { yarn: t.craft === "knit" ? K.yarn() : "#8A5A7E", onStep: (i, n) => { if (i === n - 1 && App.wdone("techpage-" + id)) App.addXP(8, "tech"); } });
    return;
  }
  const lvl = n => `<span class="lvd">${[1, 2, 3].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;
  const sec = (craft, title) => `<div class="col" style="gap:10px"><h2>${title}</h2><div class="cr-tiles">${Object.entries(T).filter(([k, t]) => t.craft === craft).map(([k, t]) => `<button class="cr-tile ${craft === "crochet" ? "sage" : ""}" data-go="tech" data-p="${k}"><span class="ic">▶</span><b>${esc(t.title)}</b><small>${esc(t.en)}</small>${lvl(t.level)}</button>`).join("")}
    ${TEXT_TECH.filter(t => t.craft === craft).map(t => `<button class="cr-tile gold" data-tt="${t.id}"><span class="ic">≡</span><b>${esc(t.t)}</b><small>${esc(t.en)}</small>${lvl(t.lvl)}</button>`).join("")}</div></div>`;
  el.innerHTML = `<div class="page"><div><h1>Techniken</h1><p class="muted" style="margin-top:6px">▶ = animierte Schritt-für-Schritt-Anleitung · ≡ = Schrittliste mit Video-Suche.</p></div>${sec("knit", "Stricken")}${sec("crochet", "Häkeln")}</div>`;
  el.onclick = e => { const b = e.target.closest("[data-tt]"); if (!b) return; const t = TEXT_TECH.find(x => x.id === b.dataset.tt);
    App.modal(`<div class="spread"><h2>${esc(t.t)}</h2><button class="btn ghost sm" data-close>✕</button></div><small class="muted">${esc(t.en)}</small><ol class="col" style="gap:10px;padding-left:22px;margin:0">${t.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol><a class="btn pri" href="https://www.youtube.com/results?search_query=${encodeURIComponent(t.q)}" target="_blank" rel="noopener">▶ Video dazu suchen</a>`); };
};

/* ---------------- Musterdesigner ---------------- */
function designer(host, opts = {}) {
  const st = { mode: "tex", rows: 12, cols: 12, cells: [], pal: [K.yarn(), "#EFE4D0", "#7E9C84", "#344A6B"], tool: "p", colTool: 1, name: "" };
  const load = key => {
    if (K.PAT[key]) { const p = K.PAT[key]; st.mode = "tex"; st.rows = Math.max(p.rows, opts.compact ? 8 : 12); st.cols = Math.max(p.cols, opts.compact ? 8 : 12); st.cells = []; for (let r = 0; r < st.rows; r++) { const row = []; for (let c = 0; c < st.cols; c++) row.push(p.f(r, c)); st.cells.push(row); } st.name = p.name; }
    else if (key === "heart") { const H = K.COLORCHART.heart; st.mode = "col"; st.rows = H.rows; st.cols = H.cols; st.cells = []; for (let r = 0; r < H.rows; r++) { const row = []; for (let c = 0; c < H.cols; c++) row.push(H.cells[H.rows - 1 - r][c] === "#" ? 1 : 0); st.cells.push(row); } st.pal = ["#EFE4D0", "#B8433A", "#7E9C84", "#344A6B"]; st.name = "Herz"; }
    else if (key === "stripes") { st.mode = "col"; st.rows = 12; st.cols = 12; st.cells = []; for (let r = 0; r < 12; r++) st.cells.push(Array(12).fill([0, 0, 1, 1, 2, 2][r % 6])); st.name = "Streifen"; }
    else { const d = C().designs.find(x => x.id === key); if (d) Object.assign(st, JSON.parse(JSON.stringify(d.st))); }
  };
  const resize = (R, Cc) => { const cells = []; for (let r = 0; r < R; r++) { const row = []; for (let c = 0; c < Cc; c++) row.push(st.cells[r] && st.cells[r][c] != null ? st.cells[r][c] : (st.mode === "tex" ? "k" : 0)); cells.push(row); } st.rows = R; st.cols = Cc; st.cells = cells; };
  load(opts.preset || "seed");
  const written = () => {
    const out = []; const runs = arr => { const o = []; arr.forEach(x => { if (o.length && o[o.length - 1][0] === x) o[o.length - 1][1]++; else o.push([x, 1]); }); return o; };
    for (let r = 0; r < st.rows; r++) {
      const rs = r % 2 === 0; const idx = [...Array(st.cols).keys()]; const order = rs ? idx.reverse() : idx;
      if (st.mode === "tex") { const seq = order.map(c => { const v = st.cells[r][c]; return rs ? (v === "p" ? "li" : "re") : (v === "p" ? "re" : "li"); }); out.push(`R${r + 1} (${rs ? "Hinr." : "Rückr."}): ${runs(seq).map(([t, n]) => `${n} ${t}`).join(", ")}`); }
      else { const L = "ABCD"; const seq = order.map(c => L[st.cells[r][c]]); out.push(`R${r + 1} (${rs ? "Hinr., rechts" : "Rückr., links"}): ${runs(seq).map(([t, n]) => `${n} ${t}`).join(", ")}`); }
    }
    return out.join("\n");
  };
  const cs = () => Math.max(14, Math.min(opts.compact ? 26 : 30, Math.floor(((host.clientWidth || 320) - (parseFloat(getComputedStyle(host).paddingLeft) || 0) * 2 - 30 - 2 * st.cols) / st.cols)));
  const draw = () => {
    host.innerHTML = `<div class="col" style="gap:12px">
      ${opts.compact ? "" : `<div class="row" style="gap:6px;flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px;scrollbar-width:thin">${Object.entries(K.PAT).map(([k, p]) => `<button class="chip" data-pre="${k}">${esc(p.name)}</button>`).join("")}<button class="chip" data-pre="heart">Herz (Farbe)</button><button class="chip" data-pre="stripes">Streifen (Farbe)</button>${C().designs.map(d => `<button class="chip acc" data-pre="${d.id}">★ ${esc(d.name)}</button>`).join("")}</div>`}
      <div class="row" style="justify-content:space-between;gap:8px">
        <div class="seg"><button data-mode="tex" class="${st.mode === "tex" ? "on" : ""}">Struktur (re/li)</button><button data-mode="col" class="${st.mode === "col" ? "on" : ""}">Farbe</button></div>
        ${st.mode === "tex" ? `<div class="seg"><button data-tool="k" class="${st.tool === "k" ? "on" : ""}">□ rechts</button><button data-tool="p" class="${st.tool === "p" ? "on" : ""}">• links</button></div>` : `<div class="swatches">${st.pal.map((c, i) => `<button data-ct="${i}" class="${st.colTool === i ? "on" : ""}" style="background:${c}" title="Farbe ${"ABCD"[i]}"></button>`).join("")}<label class="btn ghost sm" style="padding:4px 8px">Farbe ändern<input type="color" id="d-pc" value="${st.pal[st.colTool]}" style="width:0;height:0;opacity:0;position:absolute"></label></div>`}
      </div>
      <div class="row" style="gap:14px;justify-content:center"><div class="seg" style="align-items:center"><button data-sz="r-">−</button><small class="tab" style="padding:0 6px">${st.rows} Reihen</small><button data-sz="r+">+</button></div><div class="seg" style="align-items:center"><button data-sz="c-">−</button><small class="tab" style="padding:0 6px">${st.cols} Maschen</small><button data-sz="c+">+</button></div></div>
      <div style="overflow-x:auto"><div class="chart-grid" id="d-grid" style="--cs:${cs()}px;grid-template-columns:repeat(${st.cols},var(--cs)) 24px">${[...Array(st.rows).keys()].reverse().map(r => [...Array(st.cols).keys()].map(c => { const v = st.cells[r][c]; return st.mode === "tex" ? `<span data-rc="${r},${c}" style="background:${v === "p" ? "var(--card3)" : "#fff"}">${v === "p" ? "•" : ""}</span>` : `<span data-rc="${r},${c}" style="background:${st.pal[v]}"></span>`; }).join("") + `<small class="muted tab" style="display:grid;place-items:center;font-size:11px">${r % 2 === 0 ? r + 1 : ""}</small>`).join("")}</div></div>
      <small class="muted" style="text-align:center">Zeichne mit dem Finger über das Raster. Reihe 1 ist unten; ungerade Reihen (rechte Zahl) sind Hinreihen.</small>
      <div class="grid g2" style="align-items:start"><div class="col" style="gap:6px"><span class="eyebrow">Vorschau (Rapport 2×2)</span><canvas id="d-prev" style="width:100%;border-radius:12px"></canvas></div>
        <div class="col" style="gap:6px"><span class="eyebrow">Geschriebene Anleitung</span><div class="codeq" style="max-height:${opts.compact ? 180 : 260}px;overflow:auto;font-size:12.5px">${esc(written())}</div></div></div>
      <div class="row" style="gap:8px"><button class="btn pri" id="d-3d">◈ In 3D ansehen</button>${opts.compact ? `<button class="btn" data-go="designer">Großer Designer →</button>` : `<button class="btn" id="d-save">★ Speichern</button><button class="btn ghost" id="d-clear">Leeren</button><button class="btn ghost" id="d-inv">Umkehren</button>`}</div></div>`;
    const R = st.rows, Cc = st.cols; const get = (r, c) => { const rr = r % R, cc = c % Cc; const v = st.cells[rr][cc]; return st.mode === "tex" ? { t: v } : { t: "k", col: st.pal[v] }; };
    const pv = $("#d-prev", host); K.drawFabric(pv, get, R * 2, Cc * 2, { cell: 18, yarn: st.mode === "tex" ? K.yarn() : st.pal[0], fixed: true }); pv.style.aspectRatio = `${pv.width} / ${pv.height}`;
    // painting
    const grid = $("#d-grid", host); let painting = false, val = null;
    const paint = t => { const x = t && t.closest && t.closest("[data-rc]"); if (!x) return; const [r, c] = x.dataset.rc.split(",").map(Number); if (val === null) val = st.mode === "tex" ? (st.cells[r][c] === st.tool ? (st.tool === "p" ? "k" : "p") : st.tool) : st.colTool; if (st.cells[r][c] === val) return; st.cells[r][c] = val; if (st.mode === "tex") { x.style.background = val === "p" ? "var(--card3)" : "#fff"; x.textContent = val === "p" ? "•" : ""; } else x.style.background = st.pal[val]; };
    grid.onpointerdown = e => { painting = true; val = null; grid.setPointerCapture(e.pointerId); paint(e.target); };
    grid.onpointermove = e => { if (!painting) return; paint(document.elementFromPoint(e.clientX, e.clientY)); };
    grid.onpointerup = grid.onpointercancel = () => { if (painting) { painting = false; draw(); } };
    const pc = $("#d-pc", host); if (pc) pc.oninput = e => { st.pal[st.colTool] = e.target.value; draw(); };
    $("#d-3d", host).onclick = () => { K.M3.__design = { label: st.name || "Dein Muster", k: "knit", view: "front", see: "Dein Entwurf, echt verstrickt. Dreh ihn, um die Rückseite zu sehen.", make: y => st.mode === "tex" ? Y.knitModel({ cols: Cc, rows: R, yarn: y, pattern: (r, c) => st.cells[r][c] }) : Y.knitModel({ cols: Cc, rows: R, color: (r, c) => st.pal[st.cells[r][c]] }) };
      App.modal(`<div class="spread"><h2>${esc(st.name || "Dein Muster")} in 3D</h2><button class="btn ghost sm" data-close>✕</button></div><div id="d-v"></div>`, m => { K.viewer($("#d-v", m), "__design", { height: Math.min(420, window.innerHeight - 260), colors: st.mode === "tex" }); }); if (App.wdone("design3d")) App.addXP(10, "design"); };
    const sv = $("#d-save", host); if (sv) sv.onclick = () => { const n = prompt("Name für dein Muster:", st.name || "Mein Muster"); if (!n) return; const id = "d" + Date.now(); st.name = n; C().designs.push({ id, name: n, st: JSON.parse(JSON.stringify(st)) }); App.save(); App.toast("Gespeichert", n, "★"); draw(); };
    const cl = $("#d-clear", host); if (cl) cl.onclick = () => { st.cells = st.cells.map(r => r.map(() => st.mode === "tex" ? "k" : 0)); draw(); };
    const iv = $("#d-inv", host); if (iv) iv.onclick = () => { if (st.mode === "tex") st.cells = st.cells.map(r => r.map(v => v === "p" ? "k" : "p")); else st.cells = st.cells.map(r => r.map(v => v ? 0 : 1)); draw(); };
  };
  host.onclick = e => {
    const pre = e.target.closest("[data-pre]"); if (pre) { load(pre.dataset.pre); draw(); return; }
    const md = e.target.closest("[data-mode]"); if (md) { const m = md.dataset.mode; if (m !== st.mode) { st.mode = m; st.cells = st.cells.map(r => r.map(v => m === "tex" ? (v ? "p" : "k") : (v === "p" ? 1 : 0))); } draw(); return; }
    const tl = e.target.closest("[data-tool]"); if (tl) { st.tool = tl.dataset.tool; draw(); return; }
    const ct = e.target.closest("[data-ct]"); if (ct) { st.colTool = +ct.dataset.ct; draw(); return; }
    const sz = e.target.closest("[data-sz]"); if (sz) { const k = sz.dataset.sz; resize(Math.max(2, Math.min(30, st.rows + (k === "r+" ? 2 : k === "r-" ? -2 : 0))), Math.max(2, Math.min(24, st.cols + (k === "c+" ? 1 : k === "c-" ? -1 : 0)))); draw(); }
  };
  draw();
}
PAGES.designer = (el, p) => { el.innerHTML = `<div class="page" style="max-width:980px"><div><h1>Musterdesigner</h1><p class="muted" style="margin-top:6px">Entwirf Struktur- oder Farbmuster. Die App zeigt dir das Maschenbild, schreibt die Anleitung Reihe für Reihe und strickt es in 3D.</p></div><div class="card" id="dz"></div></div>`; designer($("#dz", el), { preset: p || "seed" }); };
App.W.designer = (el, b) => { el.innerHTML = `<div class="w">${App.whead("Strickschrift-Designer", "Interaktiv")}<div class="dz"></div></div>`; designer(el.querySelector(".dz"), { preset: b.preset, compact: true }); };

/* ---------------- Maschenlexikon ---------------- */
PAGES.dict = el => {
  const lvl = n => `<span class="lvd">${[1, 2, 3].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;
  el.innerHTML = `<div class="page"><div><h1>Maschenlexikon</h1><p class="muted" style="margin-top:6px">Strickmuster aus rechten und linken Maschen – mit Maschenbild, Anleitung und 3D-Ansicht.</p></div>
    <div class="grid g2">${Object.entries(K.PAT).map(([k, p]) => `<button class="dict-item" data-pk="${k}"><canvas data-th="${k}"></canvas><div class="col" style="gap:3px"><b>${esc(p.name)}</b><small class="muted">${esc(p.en)}</small>${lvl(p.lvl)}<small style="color:var(--muted)">${esc(p.use)}</small></div></button>`).join("")}</div></div>`;
  $$("[data-th]", el).forEach(cv => { K.fabricFromChart(cv, K.chartOf(cv.dataset.th), { cell: 12, yarn: K.yarn(), fixed: true }); });
  el.onclick = e => { const b = e.target.closest("[data-pk]"); if (!b) return; const k = b.dataset.pk, p = K.PAT[k];
    K.M3.__dict = { label: p.name, k: "knit", view: "front", see: p.note, make: y => Y.knitModel({ cols: Math.max(10, p.cols), rows: Math.max(8, p.rows), yarn: y, pattern: p.f }) };
    App.modal(`<div class="spread"><div><h2>${esc(p.name)}</h2><small class="muted">${esc(p.en)}</small></div><button class="btn ghost sm" data-close>✕</button></div>
      <div id="dv"></div><div class="col" style="gap:6px"><span class="eyebrow">Anleitung</span><p>${esc(K.writtenFor(k))}</p><span class="eyebrow">Wofür?</span><p>${esc(p.use)}</p><div class="tip"><span>💡</span><span>${esc(p.note)}</span></div></div>
      <div class="row"><button class="btn" data-go="designer" data-p="${k}" data-close>▦ Im Designer öffnen</button></div>`, m => { K.viewer($("#dv", m), "__dict", { height: Math.min(340, window.innerHeight - 380) }); }); };
};

/* ---------------- Reihenzähler ---------------- */
let wake = null;
PAGES.counter = (el, p) => {
  const cs = C().counters; if (!cs.length) { cs.push({ id: "c" + Date.now(), name: "Reihen", n: 0, target: 0, rep: 0 }); App.save(); }
  let cur = cs.find(c => c.id === p) || cs.find(c => c.id === C().curCounter) || cs[0];
  const draw = () => {
    C().curCounter = cur.id; const repTxt = cur.rep ? `Rapport ${Math.floor(cur.n / cur.rep) + 1} · Reihe ${cur.n % cur.rep + 1} von ${cur.rep}` : "";
    const proj = cur.project && C().projects.find(x => x.id === cur.project);
    el.innerHTML = `<div class="page" style="max-width:560px"><div class="spread"><h1>Reihenzähler</h1><button class="btn sm ${wake ? "pri" : ""}" id="wk" title="Bildschirm bleibt an">${wake ? "☀ Bildschirm bleibt an" : "☾ Bildschirm anlassen"}</button></div>
      <div class="row" style="gap:6px">${cs.map(c => `<button class="chip ${c.id === cur.id ? "on" : ""}" data-cid="${c.id}">${esc(c.name)} · ${c.n}</button>`).join("")}<button class="chip" id="c-add">＋ Zähler</button></div>
      <div class="card col" style="gap:14px;align-items:stretch;padding:22px"><div style="text-align:center"><b style="font:600 18px var(--f-display)">${esc(cur.name)}</b>${proj ? `<div><small class="muted">Projekt: ${esc(proj.name)}</small></div>` : ""}</div>
        <div class="counter-big" id="c-n">${cur.n}</div>
        ${repTxt ? `<div style="text-align:center" class="muted">${repTxt}</div>` : ""}
        ${cur.target ? `<div class="col" style="gap:4px">${App.bar(Math.min(100, 100 * cur.n / cur.target), "", "var(--acc)")}<small class="muted" style="text-align:center">${cur.n} von ${cur.target} Reihen · noch ${Math.max(0, cur.target - cur.n)}</small></div>` : ""}
        <div class="counter-pad"><button id="c-m" aria-label="Minus eins">−</button><button class="plus" id="c-p" aria-label="Plus eins">＋</button></div>
        <div class="row" style="justify-content:center;gap:8px"><button class="btn ghost sm" id="c-edit">✎ Einstellungen</button><button class="btn ghost sm" id="c-reset">↺ Auf 0</button></div></div>
      <small class="muted" style="text-align:center">Tipp: Am Laptop funktionieren auch Leertaste (+1) und Rücktaste (−1).</small></div>`;
    const bump = d => { cur.n = Math.max(0, cur.n + d); App.save(); try { navigator.vibrate && navigator.vibrate(d > 0 ? 12 : [6, 40, 6]); } catch (e) {} if (cur.target && cur.n === cur.target) App.toast("Ziel erreicht", cur.name + ": " + cur.n + " Reihen", "✿", true); if (cur.rep && cur.n % cur.rep === 0 && d > 0) App.toast("Rapport fertig", "Neuer Rapport beginnt", "↻"); draw(); };
    $("#c-p", el).onclick = () => bump(1); $("#c-m", el).onclick = () => bump(-1);
    $("#c-reset", el).onclick = () => { if (confirm("Zähler auf 0 setzen?")) { cur.n = 0; App.save(); draw(); } };
    $("#c-add", el).onclick = () => { const c = { id: "c" + Date.now(), name: "Zähler " + (cs.length + 1), n: 0, target: 0, rep: 0 }; cs.push(c); cur = c; App.save(); draw(); edit(); };
    $("#wk", el).onclick = async () => { try { if (wake) { await wake.release(); wake = null; } else if (navigator.wakeLock) { wake = await navigator.wakeLock.request("screen"); wake.addEventListener("release", () => { wake = null; }); } else App.toast("Nicht verfügbar", "Dieser Browser kann den Bildschirm nicht anlassen.", "!"); } catch (e) { wake = null; } draw(); };
    $("#c-edit", el).onclick = edit;
    el.querySelectorAll("[data-cid]").forEach(b => b.onclick = () => { cur = cs.find(c => c.id === b.dataset.cid); draw(); });
  };
  const edit = () => App.modal(`<div class="spread"><h2>Zähler</h2><button class="btn ghost sm" data-close>✕</button></div>
    <label class="fld">Name<input type="text" id="ce-n" value="${esc(cur.name)}"></label>
    <div class="grid g2"><label class="fld">Ziel (Reihen, optional)<input type="number" inputmode="numeric" id="ce-t" value="${cur.target || ""}"></label><label class="fld">Rapport alle … Reihen<input type="number" inputmode="numeric" id="ce-r" value="${cur.rep || ""}" placeholder="z. B. 4"></label></div>
    <label class="fld">Projekt<select id="ce-p"><option value="">–</option>${C().projects.map(p => `<option value="${p.id}" ${cur.project === p.id ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></label>
    <div class="spread"><button class="btn danger sm" id="ce-del">Löschen</button><div class="row"><button class="btn ghost" data-close>Abbrechen</button><button class="btn pri" id="ce-s">Speichern</button></div></div>`, (m, close) => {
    $("#ce-s", m).onclick = () => { cur.name = $("#ce-n", m).value.trim() || "Zähler"; cur.target = +$("#ce-t", m).value || 0; cur.rep = +$("#ce-r", m).value || 0; cur.project = $("#ce-p", m).value || null; App.save(); close(); draw(); };
    $("#ce-del", m).onclick = () => { const cs = C().counters; if (cs.length <= 1) { cur.n = 0; } else { cs.splice(cs.indexOf(cur), 1); cur = cs[0]; } App.save(); close(); draw(); };
  });
  const key = e => { if (!document.body.contains(el) || !$("#c-p", el)) { document.removeEventListener("keydown", key); return; } if (e.target.closest("input,textarea,select")) return; if (e.code === "Space" || e.key === "ArrowUp") { e.preventDefault(); $("#c-p", el).click(); } if (e.key === "Backspace" || e.key === "ArrowDown") { e.preventDefault(); $("#c-m", el).click(); } };
  document.addEventListener("keydown", key);
  draw();
};

/* ---------------- Werkzeuge ---------------- */
const YARNNEED = [["Mütze", "150–250 m", "Worsted/DK"], ["Loop / Schal", "250–450 m", "Worsted"], ["Socken (Paar)", "350–420 m", "Fingering/Sock"], ["Babydecke", "600–900 m", "DK/Worsted"], ["Pullover (Damen, M)", "1000–1400 m", "Worsted"], ["Pullover (Damen, M)", "1300–1700 m", "DK"], ["Amigurumi (klein)", "50–120 m", "DK/Baumwolle"], ["Granny-Square-Decke", "1500–2500 m", "Worsted"]];
PAGES.tools = (el, p) => {
  const T = [["gauge", "Maschenprobe"], ["evenly", "Gleichmäßig verteilen"], ["amiplan", "Runden-Planer"], ["needles", "Nadelstärken"], ["abbrk", "Strick-Abkürzungen"], ["abbrc", "Häkeln US/UK"], ["need", "Garnbedarf"]];
  let cur = p && T.some(t => t[0] === p) ? p : "gauge";
  const draw = () => {
    el.innerHTML = `<div class="page" style="max-width:820px"><div><h1>Werkzeuge</h1><p class="muted" style="margin-top:6px">Rechner und Nachschlagewerke für unterwegs.</p></div>
      <div class="row" style="gap:6px">${T.map(([k, l]) => `<button class="chip ${k === cur ? "on" : ""}" data-t="${k}">${l}</button>`).join("")}</div><div class="card" id="tl"></div></div>`;
    const box = $("#tl", el);
    if (cur === "need") box.innerHTML = `<div class="w">${App.whead("Garnbedarf – grobe Richtwerte", "Tabelle")}<div class="table-wrap"><table class="dt"><thead><tr><th>Projekt</th><th>Lauflänge</th><th>Garnstärke</th></tr></thead><tbody>${YARNNEED.map(r => `<tr><td>${r[0]}</td><td><b>${r[1]}</b></td><td>${r[2]}</td></tr>`).join("")}</tbody></table></div><p class="muted" style="font-size:13px">Richtwerte – die Anleitung hat immer Vorrang. Lieber ein Knäuel mehr kaufen (gleiche Farbpartie!).</p><div class="tip"><span>🧮</span><span>Knäuel = benötigte Meter ÷ Lauflänge pro Knäuel, aufrunden.</span></div></div>`;
    else App.mountWidget(box, cur === "abbrk" || cur === "abbrc" ? "abbr" : cur, { craft: cur === "abbrc" ? "crochet" : "knit" });
    el.onclick = e => { const t = e.target.closest("[data-t]"); if (t) { cur = t.dataset.t; draw(); } };
  };
  draw();
};

/* ---------------- Projekte ---------------- */
const ST = { idea: ["Idee", "var(--info)"], active: ["In Arbeit", "var(--acc)"], done: ["Fertig", "var(--sage)"] };
function projCard(p) { const cnt = C().counters.find(c => c.project === p.id); return `<div class="proj" data-pj="${p.id}"><div class="ph">${p.photo ? `<img src="${p.photo}" alt="">` : (p.craft === "crochet" ? "❀" : "✿")}</div><div class="col" style="gap:4px;min-width:0"><div class="spread"><b style="font:600 16px var(--f-display);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.name)}</b><span class="chip" style="color:${ST[p.status][1]}">${ST[p.status][0]}</span></div><small class="muted">${[p.craft === "crochet" ? "Häkeln" : "Stricken", p.needle, p.yarn].filter(Boolean).map(esc).join(" · ")}</small>${cnt ? `<button class="btn sm" data-go="counter" data-p="${cnt.id}" style="align-self:flex-start"># ${esc(cnt.name)}: ${cnt.n}</button>` : ""}</div></div>`; }
async function shrink(file) { const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); }); const m = 560, k = Math.min(1, m / Math.max(img.width, img.height)); const cv = document.createElement("canvas"); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k); cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height); return cv.toDataURL("image/jpeg", 0.72); }
PAGES.projects = el => {
  const ps = C().projects;
  const draw = () => {
    el.innerHTML = `<div class="page" style="max-width:760px"><div class="spread"><div><h1>Projekte</h1><p class="muted" style="margin-top:6px">Deine Werkstücke mit Garn, Nadel, Notizen, Foto und eigenem Reihenzähler.</p></div><button class="btn pri" id="pj-add">＋ Neues Projekt</button></div>
      ${["active", "idea", "done"].map(s => { const L = ps.filter(p => p.status === s); return L.length ? `<div class="col" style="gap:10px"><h2>${ST[s][0]}</h2>${L.map(projCard).join("")}</div>` : ""; }).join("") || `<div class="card col" style="align-items:center;text-align:center;gap:8px;padding:30px"><span style="font-size:36px">🧶</span><b>Noch keine Projekte</b><small class="muted">Leg dein erstes Projekt an – z. B. „Übungsschal kraus rechts“.</small></div>`}</div>`;
    $("#pj-add", el).onclick = () => form(); el.onclick = e => { if (e.target.closest("[data-go]")) return; const c = e.target.closest("[data-pj]"); if (c) form(ps.find(p => p.id === c.dataset.pj)); };
  };
  const form = p => { const isNew = !p; p = p || { id: "p" + Date.now(), name: "", craft: App.S().course === "crochet" ? "crochet" : "knit", status: "active", yarn: "", needle: "", url: "", notes: "", photo: null };
    App.modal(`<div class="spread"><h2>${isNew ? "Neues Projekt" : "Projekt"}</h2><button class="btn ghost sm" data-close>✕</button></div>
      <label class="fld">Name<input type="text" id="pf-n" value="${esc(p.name)}" placeholder="z. B. Mütze für Kevin"></label>
      <div class="grid g2"><label class="fld">Technik<select id="pf-c"><option value="knit" ${p.craft === "knit" ? "selected" : ""}>Stricken</option><option value="crochet" ${p.craft === "crochet" ? "selected" : ""}>Häkeln</option></select></label><label class="fld">Status<select id="pf-s">${Object.entries(ST).map(([k, v]) => `<option value="${k}" ${p.status === k ? "selected" : ""}>${v[0]}</option>`).join("")}</select></label></div>
      <div class="grid g2"><label class="fld">Garn<input type="text" id="pf-y" value="${esc(p.yarn)}" placeholder="z. B. Merino DK, Rosé"></label><label class="fld">Nadel<input type="text" id="pf-nd" value="${esc(p.needle)}" placeholder="z. B. 4 mm"></label></div>
      <label class="fld">Anleitung (Link)<input type="url" id="pf-u" value="${esc(p.url)}" placeholder="https://…"></label>
      <label class="fld">Notizen<textarea rows="3" id="pf-no">${esc(p.notes)}</textarea></label>
      <div class="row" style="gap:10px;align-items:center">${p.photo ? `<img src="${p.photo}" style="width:64px;height:64px;object-fit:cover;border-radius:12px">` : ""}<label class="btn sm">📷 Foto${p.photo ? " ändern" : ""}<input type="file" accept="image/*" id="pf-ph" hidden></label>${p.url ? `<a class="btn sm ghost" href="${esc(p.url)}" target="_blank" rel="noopener">Anleitung öffnen ↗</a>` : ""}</div>
      <div class="spread">${isNew ? "<span></span>" : `<button class="btn danger sm" id="pf-del">Löschen</button>`}<div class="row"><button class="btn" id="pf-cnt">＋ Zähler</button><button class="btn pri" id="pf-save">Speichern</button></div></div>`, (m, close) => {
      let photo = p.photo;
      $("#pf-ph", m).onchange = async e => { const f = e.target.files[0]; if (!f) return; try { photo = await shrink(f); App.toast("Foto hinzugefügt", "Wird beim Speichern übernommen.", "📷"); } catch (x) { App.toast("Foto", "Konnte nicht geladen werden.", "!"); } };
      const collect = () => Object.assign(p, { name: $("#pf-n", m).value.trim() || "Projekt", craft: $("#pf-c", m).value, status: $("#pf-s", m).value, yarn: $("#pf-y", m).value.trim(), needle: $("#pf-nd", m).value.trim(), url: $("#pf-u", m).value.trim(), notes: $("#pf-no", m).value, photo });
      $("#pf-save", m).onclick = () => { collect(); if (isNew) ps.push(p); App.save(); close(); draw(); if (isNew) App.addXP(5, "project"); };
      $("#pf-cnt", m).onclick = () => { collect(); if (isNew && !ps.includes(p)) ps.push(p); const c = { id: "c" + Date.now(), name: p.name, n: 0, target: 0, rep: 0, project: p.id }; C().counters.push(c); App.save(); close(); App.go("counter", c.id); };
      const d = $("#pf-del", m); if (d) d.onclick = () => { if (!confirm("Projekt löschen?")) return; ps.splice(ps.indexOf(p), 1); C().counters.forEach(c => { if (c.project === p.id) c.project = null; }); App.save(); close(); draw(); };
    }); };
  draw();
};

/* ---------------- course page: hide university-only panels ---------------- */
const origSettings = PAGES.settings;
PAGES.settings = (el, p) => { origSettings(el, p); [...el.querySelectorAll(".card h3")].forEach(h => { if (/KI-Assistent/.test(h.textContent)) h.closest(".card").remove(); }); };
const origLesson = PAGES.lesson;
PAGES.lesson = (el, id) => { origLesson(el, id); const a = el.querySelector("#assist"); if (a) a.remove(); };
const origCourse = PAGES.course;
PAGES.course = (el, cid) => { origCourse(el, cid); const a = el.querySelector("#assess"); if (a && a.parentElement) a.parentElement.remove(); };
})();
