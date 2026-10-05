/* Fügt Vertiefungen & Alltagsbeispiele (courses/deep-*.js) in die Lektionen ein: nach dem letzten Erklärblock, vor Kernpunkten/Checks/Übungen. */
(function () {
const DEEP = window.STUDYOS_DEEP || {};
(window.COURSE_DEFS || []).forEach(c => {
  const D = DEEP[c.id]; if (!D) return;
  c.worlds.forEach(w => w.lessons.forEach(l => {
    const add = D[l.id]; if (!add || !add.length) return;
    let at = -1; l.blocks.forEach((b, i) => { if (["text", "html", "lead"].includes(b.t)) at = i; });
    l.blocks.splice(at + 1, 0, ...add.map(b => Object.assign({ deep: true }, b)));
    l.min = (l.min || 10) + Math.max(2, Math.round(add.length * 2));
  }));
});
})();
