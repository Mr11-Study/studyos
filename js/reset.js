/* StudyOS: reset & restart progress (per lesson, per course, Git-Labor) */
(function () {
const { $, esc, PAGES } = App;
const S = () => App.S();
const widgetsOf = lessons => { const w = new Set(); lessons.forEach(l => (l.blocks || []).forEach(b => { if (b.t === "widget" && b.w) w.add(b.w); })); return [...w]; };

App.resetLesson = id => {
  const l = App.LBYID[id]; if (!l) return;
  delete S().lessons[id];
  widgetsOf([l]).forEach(w => delete S().widgets[w]);
  App.save();
};

/* what: { lessons, mastery, cards } */
App.resetCourse = (cid, what) => {
  const s = S(), c = App.CBY[cid]; if (!c) return;
  const ls = App.LESSONS.filter(l => l.course === cid);
  if (what.lessons) {
    ls.forEach(l => delete s.lessons[l.id]);
    widgetsOf(ls).forEach(w => delete s.widgets[w]);
    c.worlds.forEach(w => { delete s.widgets["world-" + w.id]; if (w.boss) delete s.bosses[w.boss.id]; });
  }
  if (what.mastery) {
    Object.keys(App.TOPICS).filter(t => App.courseOfTopic(t) === cid).forEach(t => delete s.topics[t]);
    s.quizHist = (s.quizHist || []).filter(q => q.course !== cid);
    s.exams = (s.exams || []).filter(e => e.course !== cid);
    Object.values(s.masteryHist || {}).forEach(d => { if (d && typeof d === "object") delete d[cid]; });
  }
  if (what.cards) App.FLASH.filter(f => f.course === cid).forEach(f => delete s.cards[f.id]);
  App.save();
};

App.resetDialog = (cid, onDone) => {
  const c = App.CBY[cid];
  App.modal(`<div class="spread"><h2>${esc(c.title)} neu lernen</h2><button class="btn ghost sm" data-close>✕</button></div>
    <p class="muted">Wähle, was zurückgesetzt werden soll. XP, Level, Erfolge, Notizen, Termine und Lernpläne bleiben erhalten.</p>
    <label class="switch"><div><div>Lektionen, Welten & Bosse</div><small>Alles wieder „nicht begonnen“, Lernpfad startet bei der ersten Lektion.</small></div><input type="checkbox" class="tgl" id="rs-l" checked></label>
    <label class="switch"><div><div>Mastery & Quiz-Statistik</div><small>Wissensstand pro Thema auf 0 %, Quiz- und Prüfungsverlauf dieses Kurses löschen.</small></div><input type="checkbox" class="tgl" id="rs-m"></label>
    <label class="switch"><div><div>Karteikarten</div><small>Alle Karten dieses Kurses gelten wieder als neu.</small></div><input type="checkbox" class="tgl" id="rs-c"></label>
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Abbrechen</button><button class="btn danger" id="rs-go">Zurücksetzen</button></div>`, (m, close) => {
    $("#rs-go", m).onclick = () => { const what = { lessons: $("#rs-l", m).checked, mastery: $("#rs-m", m).checked, cards: $("#rs-c", m).checked }; if (!what.lessons && !what.mastery && !what.cards) return; App.resetCourse(cid, what); close(); App.toast("Zurückgesetzt", c.title + " – viel Spaß beim Neu-Lernen.", "↺"); onDone ? onDone() : App.render(); App.renderSide(); };
  });
};

/* course page: reset button under the worlds */
const origCourse = PAGES.course;
PAGES.course = (el, cid) => {
  origCourse(el, cid); const c = App.CBY[App.S().course] || App.CBY[cid]; if (!c) return;
  const box = document.createElement("div"); box.className = "card spread";
  box.innerHTML = `<div><b>Nochmal von vorne?</b><div><small class="muted">Lektionen, Mastery oder Karteikarten dieses Kurses zurücksetzen. XP bleiben.</small></div></div><button class="btn sm" id="rs-open">↺ Kurs zurücksetzen</button>`;
  const page = el.querySelector(".page"); if (page) page.appendChild(box);
  $("#rs-open", el).onclick = () => App.resetDialog(c.id);
};

/* lesson page: restart a finished lesson */
const origLesson = PAGES.lesson;
PAGES.lesson = (el, id) => {
  origLesson(el, id); const st = S().lessons[id]; if (!st || (!st.done && !Object.keys(st.checks || {}).length)) return;
  const done = $("#complete", el); if (!done) return;
  const b = document.createElement("button"); b.className = "btn ghost sm"; b.textContent = "↺ Lektion neu starten"; b.style.marginLeft = "8px";
  b.onclick = () => { App.resetLesson(id); App.go("lesson", id); App.toast("Lektion zurückgesetzt", "Checks und Übungen sind wieder offen.", "↺"); };
  done.insertAdjacentElement("afterend", b);
};

/* settings: reset per course + Git-Labor */
const origSettings = PAGES.settings;
PAGES.settings = (el, p) => {
  origSettings(el, p);
  const danger = [...el.querySelectorAll(".card h3")].find(h => h.textContent.trim() === "Zurücksetzen"); if (!danger) return;
  const box = document.createElement("div"); box.className = "card col";
  box.innerHTML = `<h3>Lernfortschritt zurücksetzen</h3><p class="muted" style="font-size:14px">Einzelne Kurse neu lernen, ohne XP, Termine oder Notizen zu verlieren.</p>
    ${App.COURSES.filter(c => App.LESSONS.some(l => l.course === c.id)).map(c => `<div class="spread" style="padding:6px 0;border-top:1px solid var(--line)"><div><span class="dot" style="--c:${c.color}"></span> ${esc(c.title)} <small class="muted">${App.courseLessons(c.id).filter(l => App.isDone(l.id)).length}/${App.courseLessons(c.id).length} Lektionen</small></div><button class="btn sm" data-rs="${c.id}">↺ Zurücksetzen</button></div>`).join("")}
    <div class="spread" style="padding:6px 0;border-top:1px solid var(--line)"><div>Git-Labor <small class="muted">Missionen & simulierte Repos</small></div><button class="btn sm" id="rs-git">↺ Zurücksetzen</button></div>`;
  danger.closest(".card").insertAdjacentElement("beforebegin", box);
  box.onclick = e => { const x = e.target.closest("[data-rs]"); if (x) App.resetDialog(x.dataset.rs, () => App.go("settings")); };
  $("#rs-git", box).onclick = () => { if (App.resetGitLab) { App.resetGitLab(); App.toast("Git-Labor zurückgesetzt", "Alle Missionen sind wieder offen.", "↺"); App.go("settings"); } };
};
})();
