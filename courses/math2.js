/* Mathematik 2 für WirtschaftsinformatikerInnen (MATH-2, 2. Semester) — FH-Prof. DI Dr. Rüdiger Rudolf, SS 2026
   Grundlage: Skriptum „Mathematik 2“ (59 S.), Foliensätze Integral, Mehrdimensionale Differenzialrechnung, Numerische Mathematik,
   Computergrafik, Markovketten und zwei Altprüfungen (SS 2012, SS 2016). Gerechnet wird in der LV mit Maple 2025 →
   dafür gibt es das Maple-Labor (js/maple.js, js/maple-ui.js). Kapitel stehen in courses/math2/k1…k5.js (über STUDYOS_EXT). */
(function () {
/* kleine Helfer für Formeln in den Kapiteldateien */
const M2 = window.M2 = {
  fr: (a, b) => `<span class="mf"><span>${a}</span><span>${b}</span></span>`,
  mx: s => `<div class="mx">${s}</div>`,
  int: (a, b) => `∫<sub>${a}</sub><sup>${b}</sup>`,
  mat: rows => `<table class="mmat">${rows.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join("")}</tr>`).join("")}</table>`,
  /* richtige Antwort deterministisch verteilen (Optionen werden in der App nicht gemischt) */
  Q: (id, topic, q, right, wrong, why) => { let h = 7; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0; const opts = wrong.slice(), a = h % (wrong.length + 1); opts.splice(a, 0, right); return { id, topic, q, opts, a, why, ex: "" }; },
  C: (q, right, wrong, why, seed) => { let h = 11; for (const ch of q + (seed || "")) h = (h * 33 + ch.charCodeAt(0)) >>> 0; const opts = wrong.slice(), a = h % (wrong.length + 1); opts.splice(a, 0, right); return { t: "check", q, opts, a, why }; },
  F: (id, topic, front, back) => ({ id, cat: "MATH-2", topic, front, back })
};

window.COURSE_DEFS = window.COURSE_DEFS || [];
window.COURSE_DEFS.push({
  id: "math2", name: "Mathematik 2 für WirtschaftsinformatikerInnen", short: "MATH-2", title: "Mathematik 2", semester: 2, ects: 3,
  color: "#C8102E", icon: "∫", lang: "de", maple: true,
  lecturers: "FH-Prof. DI Dr. Rüdiger Rudolf",
  description: "Integralrechnung, mehrdimensionale Differenzialrechnung, Interpolation und Ausgleichsrechnung sowie Anwendungen der Matrizenrechnung (Computergrafik, Markovketten). Gerechnet wird mit Maple: dafür gibt es hier ein eingebautes Maple-Labor mit allen Beispielen aus Skriptum, Folien und Altprüfungen.",
  topics: {}, worlds: [], questions: [], bossExtra: [], flashcards: [], exam: "maple",
  assessment: { parts: [{ id: "ex", label: "Schriftliche Prüfung (5 Aufgaben)", max: 16 }],
    scale: [[87.5, "1 · Sehr gut"], [75, "2 · Gut"], [62.5, "3 · Befriedigend"], [50, "4 · Genügend"], [0, "5 · Nicht genügend"]],
    note: "Laut Altprüfungen: 5 Aufgaben, zusammen 16 Punkte, gelöst mit Maple. Notenschlüssel der Altprüfungen: 0–8 Nicht genügend, 8–10 Genügend, 10–12 Befriedigend, 12–14 Gut, 14–16 Sehr gut." },
  resources: { sections: [
      { title: "Unterlagen der LV", items: [{ title: "Skriptum „Mathematik 2“ (WINF, SS 2026)", note: "Kapitel 1–5: Mehrdim. Differenzialrechnung, Interpolation & Ausgleich, Integral, Computergrafik, Markovketten" }, { title: "Foliensatz Integralrechnung" }, { title: "Foliensatz Mehrdimensionale Differenzialrechnung" }, { title: "Foliensatz Numerische Mathematik (Interpolation & Ausgleich)" }, { title: "Foliensatz Computergrafik" }, { title: "Foliensatz Markovketten" }, { title: "Altprüfungen SS 2012 und SS 2016", note: "beide komplett gelöst unter „Prüfung üben“" }] },
      { title: "Maple", items: [{ title: "Maple 2025 (Maplesoft)", note: "Campuslizenz laut LV; im Maple-Labor dieser App laufen dieselben Befehle" }, { title: "Maple Help: plot, plot3d, int, diff, solve, LinearAlgebra, CurveFitting" }] }
    ],
    books: [{ title: "Mathematik für Informatiker, Band 2: Analysis und Statistik", author: "Gerald Teschl, Susanne Teschl, Springer", tag: "Literatur laut Syllabus" }] },
  events: [{ id: "m2-e1", title: "MATH-2 · Schriftliche Prüfung", type: "exam", date: null, note: "Termin laut Moodle eintragen. 5 Aufgaben, 16 Punkte, mit Maple." }],
  tasks: [
    { id: "m2t1", title: "Maple 2025 installieren und starten", note: "Im Maple-Labor dieser App kannst du alle Befehle vorab ausprobieren." },
    { id: "m2t2", title: "Altprüfung SS 2016 selbst rechnen, dann mit den Lösungen vergleichen", note: "Prüfung üben → Aufgaben wie in der Prüfung" },
    { id: "m2t3", title: "Altprüfung SS 2012 selbst rechnen, dann mit den Lösungen vergleichen", note: "" },
    { id: "m2t4", title: "Eine Prüfungssimulation (5 Aufgaben, 16 Punkte) unter Zeitdruck machen", note: "Jede Simulation hat neue Zahlen." }
  ]
});
})();
