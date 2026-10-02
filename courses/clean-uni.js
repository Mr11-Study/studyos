/* Lernstoff bereinigen: Organisatorisches aus den Syllabi (Noten, Punkte, Anwesenheit, Abgaben, KI-Regeln, ECTS)
   ist KEIN Lernstoff. Diese Datei entfernt solche Fragen, Karten, Lektionen und Absätze nach dem Laden der Kurse.
   Die Infos selbst bleiben in den Kursdaten (assessment, aiRule, events) und erscheinen nur als eingeklappte „Kursinfo“. */
(function () {
const D = window.COURSE_DEFS || [];
const RM_Q = new Set(["kx-q1", "kx-q2", "madq1", "madq2", "madq3", "madq4", "dbaq44", "dbaq45", "dbx-q18", "itgq63", "ufoq58",
  "mmpq44", "mmpq46", "mmpq47", "mmx-q17", "mmx-q18", "eq30"]);
const RM_F = new Set(["madf1", "madf2", "madf5", "dbaf36", "itgf40", "ufof48", "mmpf33", "mmpf34", "bf27", "mmx-f7"]);
const RM_CHECK = new Set(["kxc2", "kxc7", "kxc10", "dbxc1", "dbxc20", "mmxc2", "mmxc16", "mmxc18"]);
const RM_LESSONS = new Set(["mad1-1", "b5-2", "itg6-3", "e8-1"]);
const RM_TOPICS = new Set(["mad-org", "e-glos"]);
const RM_BLOCKS = {
  "w0-1": [3], "w14-1": [0], "k5-5": [2], "e2-1": [0, 4, 5], "mad5-1": [1], "dba1-1": [5], "dba6-3": [0, 1, 4, 5],
  "itg6-1": [0, 2], "itg6-2": [0], "pmg1-4": [5, 6, 7], "ufo6-3": [0, 2, 3, 4, 5], "mmp1-1": [0], "mmp4-2": [0, 6, 10],
  "ufo3-1": [0], "ufo3-2": [0], "ufo3-3": [0], "ufo4-1": [0], "ufo4-2": [0], "ufo5-1": [0], "ufo5-2": [0], "ufo5-3": [0], "ufo6-1": [0], "ufo6-2": [0]
};
const TITLES = { "e2-1": "Useful phrases for presentations", "pmg1-4": "Warum Projekte scheitern", "ufo6-3": "Geschäftsmodell & Business Model Canvas",
  "mmp4-2": "myRollABall Schritt für Schritt", "dba6-3": "Lösungen beurteilen und erklären" };
const TEXT_FIX = [
  [/^Syllabus: „[^“]*“\.\s*/, ""], [/^Lernziel laut Syllabus:\s*/, ""], [/^Laut Syllabus erstellst du/, "Du erstellst"],
  [/Für Aufgabe 1 \(3D Animation, 35 %\) brauchst du beides/, "Du brauchst beides"], [/^Aufgabe 2 „myRollABall“ zählt 55 %\.\s*/, ""]
];
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
D.filter(c => (c.track || "uni") === "uni").forEach(c => {
  // Lektionen, Blöcke, Titel
  c.worlds.forEach(w => {
    w.lessons = w.lessons.filter(l => !RM_LESSONS.has(l.id) && !RM_TOPICS.has(l.topic));
    w.lessons.forEach(l => {
      if (TITLES[l.id]) l.title = TITLES[l.id];
      const rb = RM_BLOCKS[l.id]; if (rb) l.blocks = l.blocks.filter((b, i) => !rb.includes(i));
      l.blocks.forEach(b => { if ((b.t === "lead" || b.t === "callout") && b.html) { let h = b.html; TEXT_FIX.forEach(([a, z]) => { h = h.replace(a, z); }); b.html = cap(h); } });
    });
    if (w.boss) w.boss.topics = w.boss.topics.filter(t => !RM_TOPICS.has(t));
  });
  c.worlds = c.worlds.filter(w => w.lessons.length || w.pending);
  c.worlds.forEach((w, i) => { w.n = c.worlds[0] && c.worlds[0].n === 0 ? i : i + 1; });
  // Themen: entfernte raus, Verweise auf gelöschte Lektionen umbiegen
  const lessonIds = new Set(c.worlds.flatMap(w => w.lessons.map(l => l.id)));
  Object.keys(c.topics).forEach(t => {
    if (RM_TOPICS.has(t)) { delete c.topics[t]; return; }
    if (!lessonIds.has(c.topics[t].lesson)) { const alt = c.worlds.flatMap(w => w.lessons).find(l => l.topic === t); if (alt) c.topics[t].lesson = alt.id; else delete c.topics[t]; }
  });
  const TN = { "dba-proc": "Vorgehensmodell & Lösungsqualität", "mmp-rollaball": "myRollABall & Build" }; Object.keys(TN).forEach(t => { if (c.topics[t]) c.topics[t].name = TN[t]; });
  (c.flashcards || []).forEach(f => { f.front = String(f.front).replace(/\s*\(für Mitarbeit und den Teil „Selbstreflexion & Feedback“\)/, ""); });
  const okT = t => !!c.topics[t];
  c.questions = (c.questions || []).filter(q => !RM_Q.has(q.id) && okT(q.topic));
  c.bossExtra = (c.bossExtra || []).filter(q => !RM_Q.has(q.id) && okT(q.topic));
  c.flashcards = (c.flashcards || []).filter(f => !RM_F.has(f.id) && okT(f.topic));
  const P = c.examPrep;
  if (P) {
    P.checklist = (P.checklist || []).filter(x => !RM_CHECK.has(x.id) && okT(x.topic));
    P.focus = (P.focus || []).filter(x => okT(x.topic));
    P.tasks = (P.tasks || []).filter(x => okT(x.topic));
  }
});
})();
