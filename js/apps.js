/* StudyOS · Fach-Apps (uni)
   Jedes Fach ist eine eigene App mit eigenem Design (css/apps.css): Wer Data Science öffnet, sieht nur Data Science.
   Übergreifend (Hub) bleiben: Heute, Fächer, Wiederholen über alle Fächer, Kalender, Aufgaben, Merkliste.
   Muss nach allen Seiten-Dateien geladen werden, weil es die Seiten umhüllt. */
(function () {
if ((window.STUDYOS_TRACK || "uni") !== "uni") return;
const { $, $$, esc, PAGES, CBY, COURSES, TOPICS, LBYID } = App;
const S = () => App.S();

const HUB = new Set(["dash", "courses", "calendar", "plan", "bookmarks", "news"]);
const worldOf = id => { for (const c of COURSES) for (const w of c.worlds) if (w.id === id) return c.id; return null; };
const app = () => S().app && CBY[S().app] ? S().app : null;
function setApp(v, p) {
  let a = app();
  if (HUB.has(v)) a = null;
  else if (v === "course" || v === "skript" || v === "prep") a = CBY[p] ? p : a || S().course;
  else if (v === "lesson") a = LBYID[p] ? LBYID[p].course : a;
  else if (v === "boss" || v === "path") a = worldOf(p) || a || S().course;
  else if (v === "review") { const s = String(p || ""); if (s === "all") a = null; else if (s.startsWith("c:") || s.startsWith("alt:")) a = s.split(":")[1]; else if (s.startsWith("topic:") && TOPICS[s.slice(6)]) a = TOPICS[s.slice(6)].course; }
  else if (v !== "settings") a = a || S().course;
  S().app = a; if (a && S().course !== a) S().course = a;
  const b = document.body; b.className = b.className.replace(/\bth-\S+/g, "").replace(/\bin-app\b/g, "").trim();
  if (a) b.classList.add("in-app", "th-" + a);
  const tc = document.querySelector('meta[name="theme-color"]'); if (tc) tc.content = a ? CBY[a].color : "#121417";
}
App.currentApp = app;

/* Seiten umhüllen: vor jeder Seite wird festgelegt, in welcher App man ist */
const wrapPage = (k, pre) => { const orig = PAGES[k]; if (!orig) return; PAGES[k] = (el, p) => { p = pre ? pre(p) : p; setApp(k, p); return orig(el, p); }; };
Object.keys(PAGES).forEach(k => wrapPage(k, {
  review: p => { const ui = S().settings.review || (S().settings.review = { cid: null, size: 20 }); if (p === "all") { ui.cid = null; S().app = null; return null; } if (!p && app()) ui.cid = app(); return p; },
  skript: p => p || app(), prep: p => p || app()
}[k]));
const prepPage = PAGES.prep;
PAGES.prep = (el, p) => { const c = CBY[p || app()]; if (c && !c.examPrep) return App.go("exam"); return prepPage(el, p); };

/* ---------- Navigation ---------- */
const counts = cid => App.reviewCounts ? App.reviewCounts(cid) : { due: 0, fresh: 0 };
const GENERIC_W = ["sorter", "pairs", "gapfill"];
const hasPractice = c => ["dasc", "bwl2", "eng3", "kommu"].includes(c.id) || (c.ktLabs || []).length || App.courseLessons(c.id).some(l => l.blocks.some(b => b.t === "widget" && GENERIC_W.includes(b.w)));
function appNav(c) {
  const qt = c.exam === "quicktest";
  return [
    ["Lernen", [["course", c.id, "Übersicht", "◐"], ["skript", c.id, "Skript", "❡"], ["review", "c:" + c.id, "Üben", "↻"]]],
    ["Prüfung", [c.examPrep && ["prep", c.id, qt ? "Quick-Test-Vorbereitung" : "Prüfung üben", "✎"], ["exam", "", qt ? "Quick-Test" : "Prüfungssimulation", "⏱"]].filter(Boolean)],
    ["Werkzeuge", [hasPractice(c) && ["practice", "", "Übungen", "λ"], c.id === "mappdev" && ["ktlab", "", "Kotlin-Labor", "K"], c.id === "dasc" && ["gitlab", "", "Git-Labor", "⑂"], c.maple && ["maple", "", "Maple-Labor", "▸"], ["resources", "", "Material", "⎘"], ["settings", "", "Einstellungen", "⚙"]].filter(Boolean)]
  ];
}
const HUBNAV = [["Überblick", [["dash", "", "Heute", "◐"], ["courses", "", "Fächer", "▦"], ["review", "all", "Wiederholen", "↻"]]],
  ["Planen", [["calendar", "", "Kalender", "▦"], ["plan", "", "Aufgaben & Lernplan", "☑"], ["bookmarks", "", "Merkliste", "★"]]], ["Konto", [["settings", "", "Einstellungen", "⚙"], ["news", "", "Neuigkeiten", "✦"]]]];
const ACT = { lesson: "course", path: "course", boss: "course", quiz: "review", flash: "review", challenges: "review" };
const btn = ([v, p, t, i], on, badge) => `<button data-go="${v}"${p ? ` data-p="${esc(p)}"` : ""} class="${on ? "on" : ""}"><span class="ni">${i}</span>${t}${badge || ""}</button>`;

const oldSide = App.SIDE;
App.SIDE = () => {
  oldSide(); const side = $("#side"); if (!side) return;
  const R = App.route(), v = ACT[R.v] || R.v, a = app(), c = a && CBY[a], st = App.streak();
  const me = side.querySelector(".me"), meHTML = me ? me.outerHTML : "";
  if (c) {
    const due = counts(c.id).due;
    side.innerHTML = `<button class="app-back" data-go="courses">← Alle Fächer</button>
      <div class="brand app-brand"><div class="logo">${esc(c.icon || c.short[0])}</div><div><b>${esc(c.title)}</b><small>${esc(c.short)}${c.ects ? " · " + String(c.ects).replace(".", ",") + " ECTS" : ""}</small></div></div>
      <nav class="nav" aria-label="${esc(c.title)}">${appNav(c).map(([g, items]) => items.length ? `<div class="eyebrow lbl">${g}</div>` + items.map(x => btn(x, v === x[0], x[0] === "review" && due ? `<span class="badge">${due}</span>` : "")).join("") : "").join("")}</nav>${meHTML}`;
  } else {
    const due = counts().due, alerts = App.urgentCount ? App.urgentCount() : 0;
    side.innerHTML = `<div class="brand"><div class="logo">S</div><div><b>StudyOS</b><small class="muted">Wirtschaftsinformatik · FH JOANNEUM</small></div></div>
      <nav class="nav" aria-label="Hauptmenü">${HUBNAV.map(([g, items]) => `<div class="eyebrow lbl">${g}</div>` + items.map(x => btn(x, v === x[0], x[0] === "review" && due ? `<span class="badge">${due}</span>` : x[0] === "plan" && alerts ? `<span class="badge warn">${alerts}</span>` : "")).join("")).join("")}
        <div class="eyebrow lbl">Deine Fächer</div><div class="hub-apps">${COURSES.map(x => `<button data-go="course" data-p="${x.id}" class="hd-${x.id}"><i></i>${esc(x.title)}</button>`).join("")}</div></nav>${meHTML}`;
  }
  const psw = $("#pswitch"); if (psw) psw.onclick = () => StudyProfiles.switchTo();
  const tbb = $(".topbar > b"); if (tbb) tbb.outerHTML = `<span class="tb-app"></span>`;
  const tba = $(".topbar .tb-app"); if (tba) tba.innerHTML = c ? `<i></i>${esc(c.title)}` : "StudyOS";
  const due = counts(c ? c.id : undefined).due, tb = $("#tb-stats"); if (tb) tb.innerHTML = due ? `<button class="chip acc" data-go="review" data-p="${c ? "c:" + c.id : "all"}">↻ ${due} fällig</button>` : "";
  const bn = $("#bnav"); if (bn) {
    const items = c ? [["course", c.id, "Übersicht", "◐"], ["skript", c.id, "Skript", "❡"], ["review", "c:" + c.id, "Üben", "↻"], c.examPrep ? ["prep", c.id, "Prüfung", "⏱"] : ["exam", "", "Prüfung", "⏱"]]
      : [["dash", "", "Heute", "◐"], ["courses", "", "Fächer", "▦"], ["review", "all", "Wiederholen", "↻"], ["calendar", "", "Kalender", "▦"]];
    bn.innerHTML = items.map(x => `<button data-go="${x[0]}"${x[1] ? ` data-p="${esc(x[1])}"` : ""} class="${v === x[0] || (x[0] === "prep" && v === "exam") ? "on" : ""}"><span class="ni">${x[3]}${x[0] === "review" && due ? `<i class="bdot"></i>` : ""}</span>${x[2]}</button>`).join("") + `<button id="bmore"><span class="ni">☰</span>Mehr</button>`;
    $("#bmore").onclick = () => $("#side").classList.add("open");
  }
};

/* ---------- Fächer: Launcher, jede Kachel im Design ihrer App ---------- */
PAGES.courses = (el) => {
  el.innerHTML = `<div class="page"><header><span class="eyebrow">${esc(App.SEMLABEL || "")}</span><h1>Deine Fächer</h1><p class="muted" style="margin-top:6px;max-width:66ch">Jedes Fach ist eine eigene App mit eigenem Skript, Üben und Prüfungstraining. Über „← Alle Fächer“ kommst du jederzeit hierher zurück.</p></header>
   ${App.TRACK === "uni" && window.StudyProfiles && StudyProfiles.active() ? `<div class="semtabs" role="tablist" aria-label="Semester">${App.SEMS.map(x => { const n = App.semCount(x.n); return `<button class="semtab ${x.n === App.SEM ? "on" : ""}" data-sem="${x.n}" role="tab" aria-selected="${x.n === App.SEM}" ${n ? "" : "disabled"}><b>Semester ${x.n}</b><small>${x.term} · ${n ? n + (n === 1 ? " Fach" : " Fächer") : "noch keine Fächer"}</small></button>`; }).join("")}</div>` : ""}
   <div class="appgrid">${COURSES.map(c => { const ls = App.courseLessons(c.id), n = ls.length, u = ls.filter(l => App.isDone(l.id)).length, k = App.knowCourse ? App.knowCourse(c.id) : 0, cn = counts(c.id);
     return `<button class="apptile th-${c.id}" data-go="course" data-p="${c.id}"><div class="spread"><div class="at-ic">${esc(c.icon || c.short[0])}</div><small>${esc(c.short)}</small></div>
       <div><h3>${esc(c.title)}</h3><small>${esc(c.name)}</small></div>
       <div class="col" style="gap:5px"><div class="spread"><small>Wissen</small><small class="tab">${k} %</small></div><div class="at-bar"><i style="width:${k}%"></i></div></div>
       <div class="at-meta"><span>${u}/${n} Lektionen</span>${cn.due ? `<span class="w">${cn.due} fällig</span>` : ""}${c.exam === "quicktest" ? `<span>Quick-Tests</span>` : ""}</div></button>`; }).join("")}</div></div>`;
};
document.addEventListener("click", e => { const b = e.target.closest(".semtab[data-sem]"); if (!b || b.disabled || +b.dataset.sem === App.SEM) return; StudyProfiles.setSem(+b.dataset.sem); });
wrapPage("courses"); // setApp läuft ohnehin

/* ---------- Einstellungen: Fach-Optionen ---------- */
const settingsPage = PAGES.settings;
PAGES.settings = (el, p) => {
  settingsPage(el, p); const c = app() && CBY[app()]; if (!c || !c.multiOnly) return;
  const pg = $(".page", el) || el, on = !!(S().settings.singles || {})[c.id];
  const card = document.createElement("div"); card.className = "card col";
  card.innerHTML = `<h3>${esc(c.title)} · Fragen</h3><p class="muted">In diesem Fach kommen beim Üben, im Kapiteltest und im Quick-Test nur Mehrfachauswahl-Fragen (5 Antworten, 1 bis 5 richtig, Teilpunkte). Klassische Fragen mit genau einer richtigen Antwort kannst du dazuschalten.</p>
    <label class="row" style="gap:10px;cursor:pointer"><input type="checkbox" id="singles" ${on ? "checked" : ""}> Auch Einfachauswahl-Fragen üben</label>`;
  pg.insertBefore(card, pg.children[1] || null);
  $("#singles", card).onchange = e => { const s = S().settings.singles || (S().settings.singles = {}); if (e.target.checked) s[c.id] = 1; else delete s[c.id]; App.save(); location.reload(); };
};
wrapPage("settings");

App.afterBoot.push(() => { const R = App.route(); setApp(R.v, R.p); App.renderSide(); });
})();
