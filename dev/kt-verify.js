// Prüft alle Kotlin-Inhalte der MAppDev-Kapitel mit einem lokalen Kotlin-Compiler:
// jedes Beispiel, jede Vorhersage, jede Musterlösung (muss alle Tests bestehen) und jede Vorlage (darf nicht schon bestehen).
//   node dev/kt-verify.js [kapitel-id]          VORLAGE=1 node dev/kt-verify.js   → prüft courses/mappdev/_VORLAGE.js
// Braucht Java 17+ und in $KT_JARS (Standard ./.kt) diese Jars von Maven Central (org.jetbrains.kotlin, Version 2.1.0):
//   kotlin-compiler-embeddable, kotlin-stdlib, kotlin-script-runtime, kotlin-daemon-embeddable, kotlin-reflect 1.6.10,
//   kotlinx-coroutines-core-jvm 1.6.4, annotations 13.0, trove4j 1.0.20200330
const fs = require("fs"), path = require("path"), cp = require("child_process"), os = require("os");
const ROOT = path.resolve(__dirname, ".."), KT = path.resolve(process.env.KT_JARS || ROOT + "/.kt"), WORK = path.join(os.tmpdir(), "studyos-ktverify");
global.window = {};
global.App = { $: () => null, $$: () => [], esc: s => s, PAGES: { practice() {} }, W: {}, S: () => ({}), COURSES: [] };
global.navigator = { onLine: true }; global.setTimeout = () => 0;
const only = process.argv[2];
for (const f of fs.readdirSync(ROOT + "/courses/mappdev").sort()) if (f.endsWith(".js") && (process.env.VORLAGE ? f === "_VORLAGE.js" : !f.startsWith("_"))) require(ROOT + "/courses/mappdev/" + f);
require(ROOT + "/js/kotlin.js");
const chapters = window.STUDYOS_EXT.mappdev;
const jobs = [];
const add = (kind, label, src, check) => jobs.push({ kind, label, src, check });
for (const ch of chapters) {
  if (only && ch.id !== only) continue;
  const allBlocks = [];
  Object.entries(ch.blocks || {}).forEach(([lid, bs]) => bs.forEach(b => allBlocks.push([lid, b])));
  (ch.lessons || []).forEach(x => x.lesson.blocks.forEach(b => allBlocks.push([x.lesson.id, b])));
  if (ch.world) ch.world.lessons.forEach(l => l.blocks.forEach(b => allBlocks.push([l.id, b])));
  for (const [lid, b] of allBlocks) {
    if (b.t !== "widget" || b.w !== "ktrun") continue;
    const lab = `${lid} · ${b.title}`;
    if (b.goal) {
      if (!b.solution) { console.log("WARN no solution for goal", lab); }
      else add("goal-sol", lab, b.solution, r => !r.cerr && r.out.trim() === String(b.expect).trim() || `Lösung erreicht Ziel nicht: ${JSON.stringify(r.out)} ${r.cerr || ""}`);
      add("goal-orig", lab, b.code, r => { if (r.cerr) { if (!App.kt.explainCompile(r.cerr)) return "keine Fehlererklärung für: " + r.cerr; return true; } return r.out.trim() !== String(b.expect).trim() || "Original erreicht Ziel schon"; });
    } else if (b.predict) {
      add("predict", lab, b.code, r => !r.cerr && !r.rerr && r.out.replace(/\n$/, "") === b.predict.opts[b.predict.a] || `Vorhersage falsch: Ausgabe=${JSON.stringify(r.out)} ${r.cerr || r.rerr || ""}`);
    } else add("run", lab, b.code, r => !r.cerr || `Kompiliert nicht: ${r.cerr}`);
    if (b.alsoFails) add("fails", lab, b.alsoFails, r => r.cerr ? (App.kt.explainCompile(r.cerr) ? true : "keine Fehlererklärung für: " + r.cerr) : "sollte nicht kompilieren");
  }
  for (const lab of ch.labs || []) for (const t of lab.tasks) {
    const sol = App.kt.buildTest(t.solution, t), st = App.kt.buildTest(t.starter, t);
    const plain = c => c.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
    const rules = (t.forbid || []).filter(([rx]) => new RegExp(rx).test(plain(t.solution))).concat((t.require || []).filter(([rx]) => !new RegExp(rx).test(plain(t.solution))));
    if (rules.length) console.log("RULE VIOLATION in solution", t.id, rules);
    add("task-sol", `${lab.id}/${t.id}`, sol.src, r => {
      if (r.cerr) return "Lösung kompiliert nicht: " + r.cerr;
      const res = {}; r.out.split("\n").forEach(l => { const m = l.match(/^##KT#(-?\d+)#(\w+)#(.*)$/); if (m) res[m[1]] = m[2] + " " + m[3]; });
      const bad = t.tests.map((x, i) => res[i] && res[i].startsWith("OK") ? null : `test ${i} (${x.call || x.check}): ${res[i]}`).filter(Boolean);
      return bad.length ? bad.join("; ") : true; });
    add("task-start", `${lab.id}/${t.id}`, st.src, r => {
      if (r.cerr) { const zs = [...r.cerr.matchAll(/Z(\d+):/g)].map(m => +m[1]);
        return zs.length && zs.every(z => z > st.userLines) || "Vorlage kompiliert nicht (Fehler im eigenen Code): " + r.cerr; }
      const okc = (r.out.match(/#OK#/g) || []).length; return okc < t.tests.length || "Vorlage besteht schon alle Tests"; });
  }
}
// compile
fs.rmSync(WORK, { recursive: true, force: true }); fs.mkdirSync(WORK + "/src", { recursive: true });
const jars = fs.readdirSync(KT).filter(f => f.endsWith(".jar")).map(f => KT + "/" + f).join(":");
const std = KT + "/kotlin-stdlib-2.1.0.jar";
function compile(files, out) {
  const r = cp.spawnSync("java", ["-cp", jars, "org.jetbrains.kotlin.cli.jvm.K2JVMCompiler", ...files, "-d", out, "-no-stdlib", "-no-reflect", "-cp", std, "-nowarn"], { encoding: "utf8" });
  return (r.stderr + r.stdout).split("\n").filter(l => /error:/.test(l)).join("\n");
}
jobs.forEach((j, i) => { j.file = `${WORK}/src/J${i}.kt`; fs.writeFileSync(j.file, `package j${i}\n` + j.src); });
console.log(jobs.length, "Programme …");
// try batch compile of all non-failing-expected
let batchErr = compile(jobs.map(j => j.file), WORK + "/out");
const errOf = {};
if (batchErr) {
  // attribute errors to files
  batchErr.split("\n").forEach(l => { const m = l.match(/J(\d+)\.kt:(\d+):(\d+): error: (.*)/); if (m) (errOf[m[1]] = errOf[m[1]] || []).push(`Z${m[2] - 1}: ${m[4]}`); });
  // compile clean ones again so classes exist
  const clean = jobs.filter((j, i) => !errOf[i]).map(j => j.file);
  fs.rmSync(WORK + "/out", { recursive: true, force: true });
  const e2 = compile(clean, WORK + "/out"); if (e2) console.log("unexpected batch errors:\n" + e2);
}
let fails = 0;
jobs.forEach((j, i) => {
  let r = { cerr: errOf[i] ? errOf[i].join(" | ") : null, out: "", rerr: null };
  if (!r.cerr) {
    const x = cp.spawnSync("java", ["-Dstdout.encoding=UTF-8", "-Dfile.encoding=UTF-8", "-cp", WORK + "/out:" + std, `j${i}.J${i}Kt`], { encoding: "utf8", timeout: 20000 });
    r.out = x.stdout; const se = x.stderr.split("\n").filter(l => l && !/JAVA_TOOL_OPTIONS/.test(l)).join("\n"); if (se) r.rerr = se.split("\n")[0];
  }
  const v = j.check(r);
  if (v !== true) { fails++; console.log(`✗ [${j.kind}] ${j.label}: ${v}`); }
});
console.log(fails ? `${fails} Probleme` : "Alles OK ✓");
