/* Kapitel-Erweiterungen einbauen (courses/<kurs>/*.js → window.STUDYOS_EXT[kurs]).
   Läuft nach den Kursdateien und VOR deep-apply.js / core.js. Ein Kapitel-Objekt kann enthalten:
     topics:     { "mad-xyz": { name, lesson } }                 neue Themen (für Wiederholung & Wissen %)
     world:      { id, n, title, sub, boss, lessons: [...] }     eine ganz neue Welt (= Kapitel im Lernpfad)
     worldPatch: { madw5: { title, sub, bossTopics: [...] } }   bestehende Welt anpassen / Kapiteltest erweitern
     lessons:    [{ world: "madw5", after: "mad5-1", lesson }]  neue Lektion in bestehende Welt einfügen
     blocks:     { "mad3-3": [block, …] }                       Blöcke in bestehende Lektion einfügen
                 (block.at = Index im Original → direkt danach; sonst nach dem letzten Erklärblock)
     questions, flashcards: [...]                               Fragen / Karteikarten (Format wie im Kurs)
     labs:       [{ id, title, sub, lesson, tasks: [...] }]     Kotlin-Übungsblätter (js/kotlin.js) */
(function () {
const EXT = window.STUDYOS_EXT || {};
const lastExplain = blocks => { let at = -1; blocks.forEach((b, i) => { if (["text", "html", "lead", "callout"].includes(b.t)) at = i; }); return at; };
(window.COURSE_DEFS || []).forEach(c => {
  const chapters = EXT[c.id]; if (!chapters || !chapters.length) return;
  const findWorld = id => c.worlds.find(w => w.id === id);
  const findLesson = id => { for (const w of c.worlds) { const l = w.lessons.find(x => x.id === id); if (l) return l; } return null; };
  chapters.forEach(ch => {
    try {
      Object.assign(c.topics, ch.topics || {});
      if (ch.world) { const old = findWorld(ch.world.id); if (old) Object.assign(old, ch.world); else c.worlds.push(ch.world); c.worlds.sort((a, b) => a.n - b.n); }
      Object.entries(ch.worldPatch || {}).forEach(([id, p]) => { const w = findWorld(id); if (!w) return;
        const { bossTopics, ...rest } = p; Object.assign(w, rest);
        if (bossTopics && w.boss) bossTopics.forEach(t => { if (!w.boss.topics.includes(t)) w.boss.topics.push(t); }); });
      (ch.lessons || []).forEach(({ world, after, lesson }) => { const w = findWorld(world); if (!w || findLesson(lesson.id)) return;
        const i = after ? w.lessons.findIndex(l => l.id === after) : -1; w.lessons.splice(i >= 0 ? i + 1 : w.lessons.length, 0, Object.assign({ xp: 0, min: 12 }, lesson)); });
      Object.entries(ch.blocks || {}).forEach(([lid, add]) => { const l = findLesson(lid); if (!l || !add.length) return;
        const orig = l.blocks.slice(), def = lastExplain(orig);
        const at = new Map(); add.forEach(b => { const k = b.at != null ? Math.min(b.at, orig.length - 1) : def; (at.get(k) || at.set(k, []).get(k)).push(b); });
        [...at.keys()].sort((a, b) => b - a).forEach(k => l.blocks.splice(k + 1, 0, ...at.get(k)));
        l.min = (l.min || 10) + add.length * 2; });
      if (ch.questions) c.questions = (c.questions || []).concat(ch.questions);
      if (ch.flashcards) c.flashcards = (c.flashcards || []).concat(ch.flashcards);
      if (ch.labs) c.ktLabs = (c.ktLabs || []).concat(ch.labs);
    } catch (e) { console.error("Kapitel-Erweiterung fehlerhaft:", ch && ch.id, e); }
  });
});
})();
