/* StudyOS v2 Git-Labor: simulated git + hosting web UI + missions */
(function () {
const { $, $$, esc, PAGES } = App;
const S = () => App.S();
const hid = () => Math.random().toString(16).slice(2, 9);
const clone = o => JSON.parse(JSON.stringify(o));

/* ---------------- model ---------------- */
function fresh() {
  return { user: { name: "", email: "" }, cwd: "~", dirs: {}, c: {}, R: {}, ssh: { gen: false, added: false, tested: false }, host: "github", events: [], log: [], mission: null, done: {}, stepsDone: {}, flags: {}, base: {}, worlds: {}, v3: true, tab: "code", repoView: null, prView: null };
}
let G = null;
function load() {
  G = S().git && S().git.c ? S().git : fresh(); S().git = G;
  /* v3: every mission has its own sandbox; earlier versions could tick steps automatically, so their mission progress is not trustworthy */
  if (!G.v3) { G.done = {}; G.stepsDone = {}; G.flags = {}; G.base = {}; G.worlds = {}; G.v3 = true; if (G.mission) G.base[G.mission] = null; }
  G.flags = G.flags || {}; G.base = G.base || {}; G.worlds = G.worlds || {};
}
const PROG = ["done", "stepsDone", "flags", "base", "host", "mission", "worlds", "v3"];
const worldKeys = () => Object.keys(G).filter(k => !PROG.includes(k));
function saveWorld() { if (!G.mission) return; const w = {}; worldKeys().forEach(k => w[k] = G[k]); G.worlds[G.mission] = clone(w); }
function loadWorld(id, forceNew) {
  const saved = !forceNew && G.worlds[id];
  worldKeys().forEach(k => delete G[k]);
  const f = fresh(); PROG.forEach(k => delete f[k]);
  Object.assign(G, saved ? clone(saved) : f);
  G.mission = id;
  if (!saved) { const m = M.find(x => x.id === id); m.setup(); G.base[id] = rawState(m); G.flags[id] = []; }
}
function persist() { if (G.log.length > 400) G.log.splice(0, G.log.length - 400); App.save(); }
const HOSTN = () => G.host === "gitlab" ? "gitlab.itplus.fh-joanneum.at" : "github.com";
const PR = () => G.host === "gitlab" ? "Merge Request" : "Pull Request";
const repoUrl = (r) => "git@" + HOSTN() + ":" + r + ".git";
const parseUrl = u => { const m = String(u || "").match(/[:\/]([\w.-]+\/[\w.-]+?)(\.git)?$/); return m ? m[1] : null; };

function mkCommit(tree, parents, msg, by) { const id = hid(); G.c[id] = { id, tree: clone(tree), parents, msg, by: by || G.user.name || "you", ts: Date.now() }; return id; }
const treeOf = id => id && G.c[id] ? G.c[id].tree : {};
function ancestors(id) { const seen = new Set(), st = [id]; while (st.length) { const x = st.pop(); if (!x || seen.has(x)) continue; seen.add(x); (G.c[x] ? G.c[x].parents : []).forEach(p => st.push(p)); } return seen; }
const isAnc = (a, b) => !a || ancestors(b).has(a);
function mergeBase(a, b) { const A = ancestors(a); const q = [b], seen = new Set(); while (q.length) { const x = q.shift(); if (!x || seen.has(x)) continue; seen.add(x); if (A.has(x)) return x; (G.c[x] ? G.c[x].parents : []).forEach(p => q.push(p)); } return null; }
const repo = () => { if (G.cwd === "~") return null; return G.dirs[G.cwd.slice(2)] || null; };
const headId = r => r.branches[r.head] || null;
function ignored(r, path) {
  const gi = (r.files[".gitignore"] || "").split(/\n/).map(x => x.trim()).filter(x => x && !x.startsWith("#"));
  return gi.some(p => { if (p.endsWith("/")) return path.startsWith(p) || path.startsWith(p.slice(0, -1) + "/"); if (p.startsWith("*.")) return path.endsWith(p.slice(1)); return path === p || path.startsWith(p + "/"); });
}
function status(r) {
  const H = treeOf(headId(r)), I = r.index, F = r.files, staged = [], unstaged = [], untracked = [];
  new Set([...Object.keys(H), ...Object.keys(I)]).forEach(p => { if (H[p] !== I[p]) staged.push([p, H[p] === undefined ? "new file" : I[p] === undefined ? "deleted" : "modified"]); });
  Object.keys(I).forEach(p => { if (F[p] !== I[p]) unstaged.push([p, F[p] === undefined ? "deleted" : "modified"]); });
  Object.keys(F).forEach(p => { if (I[p] === undefined && !ignored(r, p)) untracked.push(p); });
  return { staged, unstaged, untracked };
}
function newRepo(name) { return { name, files: {}, index: {}, branches: {}, head: "main", remotes: {}, rt: {}, up: {}, merging: null }; }
function remoteRepo(full, init) { if (!G.R[full]) G.R[full] = { full, branches: {}, prs: [], desc: "" }; if (init) Object.assign(G.R[full], init); return G.R[full]; }

/* ---------------- shell ---------------- */
const out = (t, cls) => G.log.push([cls || "", t]);
function prompt() { const r = repo(); return `kevin@studyos:${G.cwd}${r ? " (" + (r.merging ? r.head + "|MERGING" : r.head) + ")" : ""}$`; }
function tokenize(s) { const m = s.match(/"[^"]*"|'[^']*'|>>|>|\S+/g) || []; return m.map(x => /^["'].*["']$/.test(x) ? { q: true, v: x.slice(1, -1) } : { v: x }); }
function run(line) {
  out(prompt() + " " + line, "p"); const t = tokenize(line.trim()); if (!t.length) return; const a = t.map(x => x.v);
  const redir = a.indexOf(">") >= 0 ? ">" : a.indexOf(">>") >= 0 ? ">>" : null;
  const r = repo();
  try {
    switch (a[0]) {
      case "help": return out("Shell: ls, cat, echo \"text\" > datei, echo \"text\" >> datei, touch, rm, mkdir, cd, pwd, nano <datei>, clear\nSSH: ssh-keygen -t ed25519, cat ~/.ssh/id_ed25519.pub, ssh -T git@" + HOSTN() + "\nGit: config, init, clone, status, add, commit -m, log --oneline, diff, branch, switch (-c), checkout (-b), merge, remote add/-v, push (-u), pull, fetch, restore (--staged)", "g");
      case "clear": G.log = []; return;
      case "pwd": return out("/home/kevin" + G.cwd.slice(1));
      case "ls": if (a[1] && a[1].includes(".ssh")) return out(G.ssh.gen ? "id_ed25519  id_ed25519.pub  known_hosts" : "known_hosts"); if (!r) return out(Object.keys(G.dirs).map(d => d + "/").join("  ") || ""); return out(esc(Object.keys(r.files).filter(p => a[1] === "-a" || !p.startsWith(".")).sort().join("  ")) || "");
      case "mkdir": { const n = a[a[1] === "-p" ? 2 : 1]; if (!n) return out("mkdir: Name fehlt", "e"); if (r) { out("(Unterordner werden im Simulator über Pfade wie ordner/datei.txt angelegt)"); return; } if (!G.dirs[n]) G.dirs[n] = { plain: true, name: n, files: {} }; return; }
      case "cd": { const n = a[1]; if (!n || n === "~" || n === "..") { G.cwd = "~"; return; } if (G.cwd !== "~") return out("cd: Im Simulator nur eine Ebene tief (cd .. zurück)", "e"); if (!G.dirs[n]) return out("cd: " + esc(n) + ": No such file or directory", "e"); G.cwd = "~/" + n; return; }
      case "touch": { const d = cwdFiles(); if (!d) return out("touch: nur in einem Projektordner", "e"); a.slice(1).forEach(f => { if (d[f] === undefined) d[f] = ""; }); return; }
      case "rm": { const d = cwdFiles(); const f = a[a[1] === "-r" || a[1] === "-rf" ? 2 : 1]; if (!d || d[f] === undefined) return out("rm: " + esc(f || "") + ": No such file", "e"); delete d[f]; return; }
      case "cat": { if (a[1] && a[1].includes("id_ed25519.pub")) { if (!G.ssh.gen) return out("cat: " + a[1] + ": No such file or directory", "e"); return out("ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI" + G.ssh.gen + " kevin@studyos", "g"); } if (a[1] && a[1].includes("id_ed25519")) return out("Achtung: Das ist dein PRIVATER Schlüssel. Niemals teilen! (Simulator zeigt ihn nicht.)", "e"); const d = cwdFiles(); if (!d || d[a[1]] === undefined) return out("cat: " + esc(a[1] || "") + ": No such file or directory", "e"); return out(esc(d[a[1]])); }
      case "echo": { const d = cwdFiles(); if (!redir) return out(esc(a.slice(1).join(" "))); const i = a.indexOf(redir), text = a.slice(1, i).join(" "), f = a[i + 1]; if (!d) return out("echo: nur in einem Projektordner", "e"); if (!f) return out("Dateiname fehlt", "e"); d[f] = redir === ">" ? text + "\n" : (d[f] || "") + text + "\n"; return; }
      case "nano": case "code": case "vim": case "vi": { const d = cwdFiles(); if (!d) return out("Öffne zuerst einen Projektordner (cd …)", "e"); if (!a[1]) return out("Dateiname fehlt", "e"); G.editing = a[1]; if (d[a[1]] === undefined) d[a[1]] = ""; return; }
      case "ssh-keygen": G.ssh.gen = hid() + hid(); return out("Generating public/private ed25519 key pair.\nYour identification has been saved in /home/kevin/.ssh/id_ed25519\nYour public key has been saved in /home/kevin/.ssh/id_ed25519.pub\nThe key fingerprint is SHA256:" + G.ssh.gen + " kevin@studyos", "g");
      case "ssh": { if (!G.ssh.gen) return out("git@" + HOSTN() + ": Permission denied (publickey).", "e"); if (!G.ssh.added) return out("git@" + HOSTN() + ": Permission denied (publickey).\nTipp: Öffentlichen Schlüssel im Web unter Einstellungen → SSH Keys hinzufügen.", "e"); G.ssh.tested = true; return out(G.host === "gitlab" ? "Welcome to GitLab, @kevin!" : "Hi kevin! You've successfully authenticated, but GitHub does not provide shell access.", "g"); }
      case "git": return git(a.slice(1), t.slice(1), r);
      default: return out(esc(a[0]) + ": command not found (help für Hilfe)", "e");
    }
  } finally { afterCmd(); }
}
function cwdFiles() { const r = repo(); if (r) return r.files; if (G.cwd !== "~" && G.dirs[G.cwd.slice(2)]) return G.dirs[G.cwd.slice(2)].files; return null; }
function needAuth(url) { if (/^git@/.test(url) && !(G.ssh.gen && G.ssh.added)) { out("git@" + HOSTN() + ": Permission denied (publickey).\nfatal: Could not read from remote repository.\n\nTipp: ssh-keygen, dann den .pub-Schlüssel im Web unter Einstellungen → SSH Keys eintragen.", "e"); return false; } return true; }
function git(a, t, r) {
  const sub = a[0];
  if (!sub) return out("usage: git <command>. Siehe help.");
  if (sub === "config") { const k = a.find(x => x.startsWith("user.")); const v = t.slice(t.findIndex(x => x.v === k) + 1).map(x => x.v).join(" "); if (!k) return out("user.name=" + G.user.name + "\nuser.email=" + G.user.email); if (!v) return out(k === "user.name" ? G.user.name : G.user.email); G.user[k.split(".")[1]] = v; return; }
  if (sub === "init") { const n = a[1]; if (n) { if (G.dirs[n] && !G.dirs[n].plain) return out("Reinitialized existing Git repository"); const files = G.dirs[n] ? G.dirs[n].files : {}; G.dirs[n] = Object.assign(newRepo(n), { files }); return out("Initialized empty Git repository in /home/kevin/" + n + "/.git/\nTipp: cd " + n, "g"); }
    if (G.cwd === "~") return out("Im Home-Ordner kein Repo anlegen. Nutze: git init <name> oder mkdir x && cd x", "e"); const nm = G.cwd.slice(2); if (G.dirs[nm] && !G.dirs[nm].plain) return out("Reinitialized existing Git repository"); G.dirs[nm] = Object.assign(newRepo(nm), { files: (G.dirs[nm] || {}).files || {} }); return out("Initialized empty Git repository in /home/kevin/" + nm + "/.git/", "g"); }
  if (sub === "clone") { const url = a[1], full = parseUrl(url); if (!full) return out("fatal: repository '" + esc(url || "") + "' does not exist", "e"); const R = G.R[full]; if (!R) return out("ERROR: Repository not found.\nfatal: Could not read from remote repository.", "e"); if (!needAuth(url)) return; const name = a[2] || full.split("/")[1]; if (G.dirs[name]) return out("fatal: destination path '" + name + "' already exists", "e");
    const nr = newRepo(name); nr.remotes.origin = url; Object.entries(R.branches).forEach(([b, id]) => nr.rt["origin/" + b] = id); const def = R.branches.main ? "main" : Object.keys(R.branches)[0]; if (def) { nr.branches[def] = R.branches[def]; nr.head = def; nr.up[def] = "origin/" + def; nr.files = clone(treeOf(nr.branches[def])); nr.index = clone(nr.files); } G.dirs[name] = nr;
    return out("Cloning into '" + name + "'...\nremote: Enumerating objects: " + (Object.keys(G.c).length * 3) + ", done.\nReceiving objects: 100%, done.\nTipp: cd " + name, "g"); }
  if (!r) return out("fatal: not a git repository (or any of the parent directories): .git\nTipp: cd <ordner> oder git init <name>", "e");
  switch (sub) {
    case "status": { const s = status(r); let txt = "On branch " + r.head + "\n"; const up = r.up[r.head]; if (up && r.rt[up] !== undefined) { const L = headId(r), U = r.rt[up]; if (L === U) txt += "Your branch is up to date with '" + up + "'.\n"; else if (isAnc(U, L)) txt += "Your branch is ahead of '" + up + "'.\n  (use \"git push\" to publish your local commits)\n"; else if (isAnc(L, U)) txt += "Your branch is behind '" + up + "'.\n  (use \"git pull\" to update your local branch)\n"; else txt += "Your branch and '" + up + "' have diverged.\n"; }
      if (r.merging) txt += "You have unmerged paths.\n  (fix conflicts and run \"git commit\")\n";
      if (!headId(r)) txt += "\nNo commits yet\n";
      if (s.staged.length) txt += "\nChanges to be committed:\n" + s.staged.map(([p, k]) => `\t<span class="g">${k}:   ${esc(p)}</span>`).join("\n") + "\n";
      if (s.unstaged.length) txt += "\nChanges not staged for commit:\n  (use \"git add <file>...\" to update what will be committed)\n" + s.unstaged.map(([p, k]) => `\t<span class="r">${k}:   ${esc(p)}</span>`).join("\n") + "\n";
      if (s.untracked.length) txt += "\nUntracked files:\n  (use \"git add <file>...\" to include in what will be committed)\n" + s.untracked.map(p => `\t<span class="r">${esc(p)}</span>`).join("\n") + "\n";
      if (!s.staged.length && !s.unstaged.length && !s.untracked.length) txt += "\nnothing to commit, working tree clean";
      G.stat = (G.stat || 0) + 1; return out(txt); }
    case "add": { const args = a.slice(1); if (!args.length) return out("Nothing specified, nothing added.", "e"); const all = args.includes(".") || args.includes("-A") || args.includes("--all");
      const paths = all ? new Set([...Object.keys(r.files).filter(p => !ignored(r, p) || r.index[p] !== undefined), ...Object.keys(r.index)]) : args;
      for (const p of paths) { if (r.files[p] === undefined && r.index[p] === undefined) return out("fatal: pathspec '" + esc(p) + "' did not match any files", "e"); if (!all && ignored(r, p) && r.index[p] === undefined) { out("The following paths are ignored by one of your .gitignore files:\n" + esc(p), "e"); continue; } if (r.files[p] === undefined) delete r.index[p]; else r.index[p] = r.files[p]; }
      if (r.merging) r.merging.conflicts = r.merging.conflicts.filter(p => r.index[p] === undefined || /^<{7}|^={7}|^>{7}/m.test(r.index[p])); return; }
    case "restore": { const staged = a.includes("--staged"), f = a.filter(x => !x.startsWith("-"))[1]; if (!f) return out("Datei angeben", "e"); if (f === ".") { if (staged) r.index = clone(treeOf(headId(r))); else Object.keys(r.index).forEach(p => r.files[p] = r.index[p]); return; } if (staged) { const h = treeOf(headId(r))[f]; if (h === undefined) delete r.index[f]; else r.index[f] = h; } else { if (r.index[f] === undefined) return out("error: pathspec '" + esc(f) + "' did not match any file(s) known to git", "e"); r.files[f] = r.index[f]; } return; }
    case "commit": { let msgI = a.indexOf("-m"); if (msgI < 0) msgI = a.indexOf("-am"); if (a.includes("-am") || a.includes("-a")) Object.keys(r.index).forEach(p => { if (r.files[p] === undefined) delete r.index[p]; else r.index[p] = r.files[p]; });
      if (!G.user.name) return out("Author identity unknown\n\n*** Please tell me who you are.\n\n  git config --global user.name \"Dein Name\"\n  git config --global user.email \"du@example.com\"", "e");
      let msg = msgI >= 0 ? t[msgI + 1] && t[msgI + 1].v : null; if (!msg && r.merging) msg = "Merge branch '" + r.merging.name + "'"; if (!msg) return out("Aborting commit due to empty commit message. Nutze: git commit -m \"Nachricht\"", "e");
      if (r.merging) { const bad = Object.keys(r.index).filter(p => /^(<{7}|={7}|>{7})/m.test(r.index[p])); if (bad.length || r.merging.conflicts.length) return out("error: Committing is not possible because you have unmerged files.\n" + (bad.length ? "Konfliktmarker noch in: " + bad.join(", ") + "\n" : "") + "hint: Fix them up in the work tree, and then use 'git add <file>'", "e");
        const id = mkCommit(r.index, [headId(r), r.merging.theirs], msg); r.branches[r.head] = id; r.merging = null; G.resolved = true; App.unlock("gitpro"); return out("[" + r.head + " " + id + "] " + esc(msg), "g"); }
      const s = status(r); if (!s.staged.length) return out("On branch " + r.head + "\nnothing to commit" + (s.unstaged.length || s.untracked.length ? " (use \"git add\" to track)" : ", working tree clean"), "e");
      const par = headId(r) ? [headId(r)] : []; const id = mkCommit(r.index, par, msg); const first = !headId(r); r.branches[r.head] = id; return out("[" + r.head + (first ? " (root-commit)" : "") + " " + id + "] " + esc(msg) + "\n " + s.staged.length + " file" + (s.staged.length > 1 ? "s" : "") + " changed", "g"); }
    case "log": { let id = headId(r); if (!id) return out("fatal: your current branch '" + r.head + "' does not have any commits yet", "e"); const all = a.includes("--all"); const ids = all ? [...new Set(Object.values(r.branches).concat(Object.values(r.rt)))] : [id]; const seen = new Set(), list = []; const st = ids.slice(); while (st.length) { const x = st.shift(); if (!x || seen.has(x)) continue; seen.add(x); list.push(G.c[x]); G.c[x].parents.forEach(p => st.push(p)); } list.sort((x, y) => y.ts - x.ts);
      const labels = x => { const l = []; Object.entries(r.branches).forEach(([b, v]) => { if (v === x) l.push(b === r.head ? "HEAD -> " + b : b); }); Object.entries(r.rt).forEach(([b, v]) => { if (v === x) l.push(b); }); return l.length ? ` <span class="g">(${esc(l.join(", "))})</span>` : ""; };
      const one = a.includes("--oneline"), graph = a.includes("--graph");
      return out(list.map(cmt => one ? `${graph ? (cmt.parents.length > 1 ? "*   " : "* ") : ""}<span style="color:var(--warn)">${cmt.id}</span>${labels(cmt.id)} ${esc(cmt.msg)}` : `<span style="color:var(--warn)">commit ${cmt.id}</span>${labels(cmt.id)}\n${cmt.parents.length > 1 ? "Merge: " + cmt.parents.join(" ") + "\n" : ""}Author: ${esc(cmt.by)}\nDate:   ${new Date(cmt.ts).toLocaleString("de-AT")}\n\n    ${esc(cmt.msg)}\n`).join("\n")); }
    case "diff": { const staged = a.includes("--staged") || a.includes("--cached"); const A = staged ? treeOf(headId(r)) : r.index, B = staged ? r.index : r.files; let txt = ""; new Set([...Object.keys(A), ...Object.keys(B)]).forEach(p => { if (!staged && A[p] === undefined) return; if (A[p] === B[p]) return; txt += `<b>diff --git a/${esc(p)} b/${esc(p)}</b>\n`; const al = (A[p] || "").split("\n"), bl = (B[p] || "").split("\n"); al.forEach(x => { if (!bl.includes(x) && x) txt += `<span class="r">-${esc(x)}</span>\n`; }); bl.forEach(x => { if (!al.includes(x) && x) txt += `<span class="g">+${esc(x)}</span>\n`; }); }); return out(txt || "(keine Änderungen" + (staged ? " im Staging" : "; für gestagte: git diff --staged") + ")"); }
    case "branch": { if (a.includes("-d") || a.includes("-D")) { const b = a[a.length - 1]; if (b === r.head) return out("error: Cannot delete branch '" + b + "' checked out", "e"); if (!r.branches[b]) return out("error: branch '" + b + "' not found.", "e"); if (a.includes("-d") && !isAnc(r.branches[b], headId(r))) return out("error: The branch '" + b + "' is not fully merged. (-D erzwingt)", "e"); delete r.branches[b]; return out("Deleted branch " + b + ".", "g"); }
      if (a.includes("-a") || !a[1]) return out(Object.keys(r.branches).map(b => (b === r.head ? '<span class="g">* ' + b + "</span>" : "  " + b)).concat(a.includes("-a") ? Object.keys(r.rt).map(b => '  <span class="r">remotes/' + b + "</span>") : []).join("\n"));
      if (!headId(r)) return out("fatal: Not a valid object name: 'main'. (Erst committen)", "e"); if (r.branches[a[1]]) return out("fatal: a branch named '" + a[1] + "' already exists", "e"); r.branches[a[1]] = headId(r); return; }
    case "switch": case "checkout": { const create = a.includes("-c") || a.includes("-b"); const b = a[a.length - 1]; if (!b || b === sub) return out("Branch angeben", "e"); if (create) { if (r.branches[b]) return out("fatal: a branch named '" + b + "' already exists", "e"); r.branches[b] = headId(r); } else if (!r.branches[b]) { if (r.rt["origin/" + b]) { r.branches[b] = r.rt["origin/" + b]; r.up[b] = "origin/" + b; out("branch '" + b + "' set up to track 'origin/" + b + "'."); } else return out("fatal: invalid reference: " + esc(b), "e"); }
      const s = status(r); if ((s.staged.length || s.unstaged.length) && !create) { const target = treeOf(r.branches[b]); const clash = s.unstaged.concat(s.staged).map(x => x[0]).filter(p => target[p] !== treeOf(headId(r))[p]); if (clash.length) return out("error: Your local changes to the following files would be overwritten by checkout:\n\t" + clash.join("\n\t") + "\nPlease commit your changes or stash them before you switch branches.", "e"); }
      if (!create) { const oldT = treeOf(headId(r)), newT = treeOf(r.branches[b]); Object.keys(oldT).forEach(p => { if (r.files[p] === oldT[p]) delete r.files[p]; if (r.index[p] === oldT[p]) delete r.index[p]; }); Object.entries(newT).forEach(([p, v]) => { if (r.files[p] === undefined) r.files[p] = v; if (r.index[p] === undefined) r.index[p] = v; }); }
      r.head = b; return out((create ? "Switched to a new branch '" : "Switched to branch '") + b + "'", "g"); }
    case "merge": { const b = a[1]; const theirs = r.branches[b] || r.rt[b]; if (!theirs) return out("merge: " + esc(b || "") + " - not something we can merge", "e"); return doMerge(r, theirs, b); }
    case "remote": { if (a[1] === "add") { if (!a[2] || !a[3]) return out("usage: git remote add origin <url>", "e"); if (r.remotes[a[2]]) return out("error: remote " + a[2] + " already exists.", "e"); r.remotes[a[2]] = a[3]; return; } if (a[1] === "set-url") { r.remotes[a[2]] = a[3]; return; } if (a[1] === "remove") { delete r.remotes[a[2]]; return; } return out(Object.entries(r.remotes).map(([n, u]) => n + "\t" + u + " (fetch)\n" + n + "\t" + u + " (push)").join("\n")); }
    case "fetch": return fetch(r, true);
    case "pull": { if (!fetch(r, false)) return; const up = r.up[r.head] || "origin/" + r.head; const theirs = r.rt[up]; if (!theirs) return out("There is no tracking information for the current branch.\n  git branch --set-upstream-to=origin/" + r.head + " " + r.head, "e"); return doMerge(r, theirs, up); }
    case "push": return push(r, a);
    case "stash": return out("git stash kennt der Simulator noch nicht. Committe oder nutze git restore.", "e");
    default: return out("git: '" + esc(sub) + "' kennt der Simulator nicht. Siehe help.", "e");
  }
}
function fetch(r, verbose) { const url = r.remotes.origin; if (!url) { out("fatal: 'origin' does not appear to be a git repository", "e"); return false; } if (!needAuth(url)) return false; const R = G.R[parseUrl(url)]; if (!R) { out("ERROR: Repository not found.", "e"); return false; } let n = 0; Object.entries(R.branches).forEach(([b, id]) => { if (r.rt["origin/" + b] !== id) n++; r.rt["origin/" + b] = id; }); if (verbose || n) out(n ? "From " + HOSTN() + ":" + R.full + "\n   " + n + " branch(es) updated" : "(bereits aktuell)"); return true; }
function doMerge(r, theirs, name) {
  const ours = headId(r); if (r.merging) return out("error: Merging is not possible because you have unmerged files.", "e");
  const s = status(r); if (s.staged.length || s.unstaged.length) return out("error: Your local changes would be overwritten by merge. Commit first.", "e");
  if (isAnc(theirs, ours)) return out("Already up to date.");
  if (!ours || isAnc(ours, theirs)) { r.branches[r.head] = theirs; r.files = Object.assign(Object.fromEntries(Object.entries(r.files).filter(([p]) => r.index[p] === undefined)), clone(treeOf(theirs))); r.index = clone(treeOf(theirs)); return out("Updating " + (ours || "0000000") + ".." + theirs + "\nFast-forward", "g"); }
  const base = treeOf(mergeBase(ours, theirs)), O = treeOf(ours), T = treeOf(theirs), res = {}, conf = [];
  new Set([...Object.keys(base), ...Object.keys(O), ...Object.keys(T)]).forEach(p => { const b = base[p], o = O[p], t = T[p]; if (o === t) { if (o !== undefined) res[p] = o; } else if (o === b) { if (t !== undefined) res[p] = t; } else if (t === b) { if (o !== undefined) res[p] = o; } else { conf.push(p); res[p] = "<<<<<<< HEAD\n" + (o || "") + "=======\n" + (t || "") + ">>>>>>> " + name + "\n"; } });
  if (!conf.length) { const id = mkCommit(res, [ours, theirs], "Merge " + name + " into " + r.head); r.branches[r.head] = id; r.files = clone(res); r.index = clone(res); return out("Merge made by the 'ort' strategy.", "g"); }
  r.files = clone(res); r.index = Object.fromEntries(Object.entries(res).filter(([p]) => !conf.includes(p))); conf.forEach(p => { if (O[p] !== undefined) r.index[p] = O[p]; }); r.merging = { theirs, name, conflicts: conf.slice() }; G.conflicted = true;
  return out(conf.map(p => "Auto-merging " + p + "\nCONFLICT (content): Merge conflict in " + p).join("\n") + "\nAutomatic merge failed; fix conflicts and then commit the result.\nTipp: nano " + conf[0] + " → Marker <<<<<<< ======= >>>>>>> entfernen → git add → git commit", "e");
}
function push(r, a) {
  const url = r.remotes.origin; if (!url) return out("fatal: No configured push destination.\nTipp: git remote add origin " + repoUrl("kevin/" + r.name), "e"); if (!needAuth(url)) return;
  const R = G.R[parseUrl(url)]; if (!R) return out("ERROR: Repository not found. Lege es zuerst im Web an.", "e");
  const args = a.filter(x => !x.startsWith("-") && x !== "push"); const b = args[1] || r.head; const local = r.branches[b]; if (!local) return out("error: src refspec " + b + " does not match any (noch kein Commit?)", "e");
  if (!r.up[b] && !a.includes("-u") && !a.includes("--set-upstream") && !args[1]) return out("fatal: The current branch " + b + " has no upstream branch.\nTo push the current branch and set the remote as upstream, use\n\n    git push -u origin " + b, "e");
  const rem = R.branches[b]; if (rem && !isAnc(rem, local)) return out(" ! [rejected]        " + b + " -> " + b + " (fetch first)\nerror: failed to push some refs\nhint: Updates were rejected because the remote contains work that you do not have locally.\nhint: Führe zuerst git pull aus.", "e");
  if (rem === local) return out("Everything up-to-date");
  R.branches[b] = local; r.rt["origin/" + b] = local; if (a.includes("-u") || a.includes("--set-upstream")) r.up[b] = "origin/" + b;
  return out("Enumerating objects, done.\nTo " + url + "\n   " + (rem || "[new branch]") + (rem ? ".." + local : "") + "  " + b + " -> " + b + (a.includes("-u") ? "\nbranch '" + b + "' set up to track 'origin/" + b + "'." : "") + (!R.branches.main || b === "main" ? "" : "\nremote: Create a " + PR().toLowerCase() + " for '" + b + "' on " + HOSTN() + ":\nremote:   https://" + HOSTN() + "/" + R.full + "/pull/new/" + b), "g");
}

/* ---------------- web actions ---------------- */
function webEdit(full, branch, path, content, msg, by) { const R = G.R[full]; const base = R.branches[branch]; const tree = clone(treeOf(base)); if (content === null) delete tree[path]; else tree[path] = content; R.branches[branch] = mkCommit(tree, base ? [base] : [], msg, by || "kevin"); }
function mergePR(R, pr) { const into = R.branches[pr.base], from = R.branches[pr.head]; if (isAnc(from, into)) { pr.state = "merged"; return true; } if (isAnc(into, from)) { R.branches[pr.base] = from; pr.state = "merged"; return true; } const base = treeOf(mergeBase(into, from)), O = treeOf(into), T = treeOf(from), res = {}; for (const p of new Set([...Object.keys(base), ...Object.keys(O), ...Object.keys(T)])) { const b = base[p], o = O[p], t = T[p]; if (o === t) { if (o !== undefined) res[p] = o; } else if (o === b) { if (t !== undefined) res[p] = t; } else if (t === b) { if (o !== undefined) res[p] = o; } else return false; } R.branches[pr.base] = mkCommit(res, [into, from], "Merge " + PR().toLowerCase() + " #" + pr.n + " from " + pr.head, "kevin"); pr.state = "merged"; return true; }

/* ---------------- missions ---------------- */
const LECT = "fhj-ef-dasc/course-ws-2627";
const M = [
  { id: "m1", title: "1 · Git einrichten & erstes Repo", goal: "Git konfigurieren, ein Projekt anlegen und den ersten Commit machen.", setup() {},
    steps: [["Name setzen: git config --global user.name \"Kevin …\"", () => !!G.user.name], ["E-Mail setzen: git config --global user.email …", () => !!G.user.email], ["Repo anlegen: git init ds-projekt", () => Object.values(G.dirs).some(d => !d.plain)], ["Hineinwechseln: cd ds-projekt", () => !!repo()], ["README anlegen: echo \"# Mein Projekt\" > README.md", () => { const r = repo(); return r && r.files["README.md"] !== undefined; }], ["Status ansehen: git status", () => (G.stat || 0) > 0], ["Stagen: git add README.md", () => { const r = repo(); return r && r.index["README.md"] !== undefined; }], ["Committen: git commit -m \"Initial commit\"", () => { const r = repo(); return r && !!headId(r); }]] },
  { id: "m2", title: "2 · SSH-Schlüssel & Push", goal: "Mit SSH verbinden, ein Remote-Repo anlegen und pushen.", setup() { if (!Object.values(G.dirs).some(d => !d.plain && Object.keys(d.branches).length)) { G.user.name = G.user.name || "Kevin"; G.user.email = G.user.email || "kevin@example.com"; const r = newRepo("ds-projekt"); r.files = { "README.md": "# Mein Projekt\n", "main.py": "print('hello')\n" }; r.index = clone(r.files); r.branches.main = mkCommit(r.files, [], "Initial commit", "Kevin"); G.dirs["ds-projekt"] = r; G.cwd = "~/ds-projekt"; } },
    steps: [["Schlüssel erzeugen: ssh-keygen -t ed25519", () => !!G.ssh.gen], ["Öffentlichen Schlüssel anzeigen: cat ~/.ssh/id_ed25519.pub", () => G.log.some(l => l[1].startsWith("ssh-ed25519"))], ["Im Web: Einstellungen → SSH Key hinzufügen", () => G.ssh.added], ["Verbindung testen: ssh -T git@HOST", () => G.ssh.tested], ["Im Web: „+ Neues Repository“ kevin/ds-projekt anlegen", () => !!G.R["kevin/ds-projekt"]], ["Remote verbinden: git remote add origin git@HOST:kevin/ds-projekt.git", () => Object.values(G.dirs).some(d => d.remotes && d.remotes.origin)], ["Pushen: git push -u origin main", () => G.R["kevin/ds-projekt"] && !!G.R["kevin/ds-projekt"].branches.main]] },
  { id: "m3", title: "3 · Kursrepo klonen & aktualisieren", goal: "Das Kursrepo des Lehrenden klonen und neue Übungsdaten per pull holen.", setup() { G.ssh.gen = G.ssh.gen || hid(); G.ssh.added = true; if (!G.R[LECT]) { const R = remoteRepo(LECT, { desc: "Course repository EF-DASC WS 26/27" }); R.branches.main = mkCommit({ "README.md": "# EF-DASC Course Repo\nCode and data from the exercises.\n", "ex01/setup.md": "uv init, uv add numpy pandas\n" }, [], "Exercise 1: setup", "Lecturer"); } },
    steps: [["Klonen: git clone git@HOST:" + LECT + ".git", () => !!G.dirs["course-ws-2627"]], ["Hineinwechseln: cd course-ws-2627", () => G.cwd === "~/course-ws-2627"], ["Button „Lehrender pusht Übung 2“ drücken", () => G.R[LECT] && Object.keys(treeOf(G.R[LECT].branches.main)).includes("ex02/students.csv")], ["Holen: git pull", () => { const r = G.dirs["course-ws-2627"]; return r && r.files["ex02/students.csv"] !== undefined; }], ["Ansehen: cat ex02/students.csv", () => G.log.some(l => l[1].includes("student,hours"))]] },
  { id: "m4", title: `4 · Feature-Branch & Pull Request`, goal: "Auf einem eigenen Branch arbeiten, pushen, einen PR/MR öffnen und mergen.", setup() { M[1].setup(); G.ssh.gen = G.ssh.gen || hid(); G.ssh.added = true; const r = G.dirs["ds-projekt"]; if (!G.R["kevin/ds-projekt"]) { remoteRepo("kevin/ds-projekt"); } if (!r.remotes.origin) r.remotes.origin = repoUrl("kevin/ds-projekt"); if (!G.R["kevin/ds-projekt"].branches.main) { G.R["kevin/ds-projekt"].branches.main = r.branches.main; r.rt["origin/main"] = r.branches.main; r.up.main = "origin/main"; } G.cwd = "~/ds-projekt"; },
    steps: [["Branch erstellen: git switch -c feature/analyse", () => Object.values(G.dirs).some(d => d.branches && d.branches["feature/analyse"])], ["Datei ändern: echo \"print(df.mean())\" >> main.py", () => { const r = G.dirs["ds-projekt"]; return r && r.head === "feature/analyse" && /mean/.test(r.files["main.py"] || ""); }], ["Committen (add + commit)", () => { const r = G.dirs["ds-projekt"]; return r && r.branches["feature/analyse"] && r.branches["feature/analyse"] !== r.branches.main; }], ["Pushen: git push -u origin feature/analyse", () => G.R["kevin/ds-projekt"] && !!G.R["kevin/ds-projekt"].branches["feature/analyse"]], ["Im Web: PR/MR öffnen", () => G.R["kevin/ds-projekt"] && G.R["kevin/ds-projekt"].prs.length > 0], ["Im Web: mergen", () => G.R["kevin/ds-projekt"] && G.R["kevin/ds-projekt"].prs.some(p => p.state === "merged")], ["Zurück auf main: git switch main", () => G.dirs["ds-projekt"] && G.dirs["ds-projekt"].head === "main"], ["Aktualisieren: git pull", () => { const r = G.dirs["ds-projekt"]; return r && /mean/.test(r.files["main.py"] || ""); }], ["Aufräumen: git branch -d feature/analyse", () => { const r = G.dirs["ds-projekt"]; return r && !r.branches["feature/analyse"]; }]] },
  { id: "m5", title: "5 · Merge-Konflikt lösen", goal: "Ein Teamkollege ändert dieselbe Zeile. Konflikt erkennen und sauber lösen.", setup() { M[3].setup(); const r = G.dirs["ds-projekt"]; G.cwd = "~/ds-projekt"; if (!G.m5base) { const s0 = status(r); if (s0.staged.length || s0.unstaged.length) { r.files = clone(treeOf(headId(r))); r.index = clone(r.files); } r.head = "main"; if (r.branches["feature/analyse"] === undefined && G.R["kevin/ds-projekt"].branches.main && !isAnc(G.R["kevin/ds-projekt"].branches.main, r.branches.main)) { r.branches.main = G.R["kevin/ds-projekt"].branches.main; } r.files = clone(treeOf(r.branches.main)); r.files["README.md"] = "# Mein Projekt\nDaten: students.csv\n"; r.index = clone(r.files); r.branches.main = mkCommit(r.files, [r.branches.main], "Describe data", "Kevin"); G.R["kevin/ds-projekt"].branches.main = r.branches.main; r.rt["origin/main"] = r.branches.main; r.up.main = "origin/main"; G.m5base = r.branches.main; } },
    steps: [["Button „Teamkollege (Anna) pusht“ drücken", () => !!G.annaPushed], ["Dieselbe Zeile lokal ändern (nano README.md) und committen", () => { const r = G.dirs["ds-projekt"]; return !!(r && G.m5base && r.branches.main && r.branches.main !== G.m5base && isAnc(G.m5base, r.branches.main) && !isAnc(G.annaPushed, r.branches.main)) || !!G.conflicted; }], ["Pushen versuchen: git push (wird abgelehnt)", () => G.log.some(l => l[1].includes("[rejected]"))], ["Holen: git pull → Konflikt", () => !!G.conflicted], ["README.md bereinigen (nano), git add, git commit", () => !!G.resolved], ["Pushen: git push", () => { const r = G.dirs["ds-projekt"]; return !!(G.resolved && r && G.R["kevin/ds-projekt"].branches.main === r.branches.main); }]] },
  { id: "m6", title: "6 · .gitignore & Rückgängig machen", goal: "Virtuelle Umgebung und Geheimnisse nicht committen, Fehler zurücknehmen.", setup() { M[1].setup(); G.cwd = "~/ds-projekt"; const r = G.dirs["ds-projekt"]; r.files[".venv/lib/python3.12/site.py"] = "# venv\n"; r.files["secrets.env"] = "API_KEY=12345\n"; },
    steps: [["Status: Was ist untracked?", () => (G.stat || 0) > 0], [".gitignore anlegen: echo \".venv/\" > .gitignore", () => /\.venv/.test((G.dirs["ds-projekt"] || {}).files[".gitignore"] || "")], ["Auch secrets.env ignorieren: echo \"secrets.env\" >> .gitignore", () => /secrets\.env/.test((G.dirs["ds-projekt"] || {}).files[".gitignore"] || "")], [".gitignore committen", () => { const r = G.dirs["ds-projekt"]; return r && treeOf(r.branches.main)[".gitignore"] !== undefined && !treeOf(r.branches.main)["secrets.env"]; }], ["main.py kaputt machen: echo \"oops\" > main.py", () => ((G.dirs["ds-projekt"] || {}).files || {})["main.py"] === "oops\n" || G.m6r], ["Zurücksetzen: git restore main.py", () => { const r = G.dirs["ds-projekt"]; if (r && r.files["main.py"] !== "oops\n" && G.log.some(l => l[1].includes("git restore main.py"))) G.m6r = true; return !!G.m6r; }]] },
  { id: "free", title: "Freies Üben", goal: "Sandbox ohne Vorgaben. Alles ist erlaubt.", setup() {}, steps: [] }
];
function rawState(m) { return m.steps.map(s => { try { return !!s[1](); } catch (e) { return false; } }); }
/* display only: which steps were really done by the user */
function stepsState(m) { const f = G.flags[m.id] || []; return m.steps.map((s, i) => !!f[i]); }
/* called after user actions: a step counts when its condition became true and was not already true when the mission started */
function evalSteps(m) {
  const f = G.flags[m.id] = G.flags[m.id] || [], base = G.base[m.id] || [], now = rawState(m);
  now.forEach((ok, i) => { if (ok && !base[i]) f[i] = true; if (!ok && base[i]) base[i] = false; });
  G.base[m.id] = base; return stepsState(m);
}
function afterCmd() {
  const m = M.find(x => x.id === G.mission); if (!m || !m.steps.length) return; const st = evalSteps(m); const key = m.id; const prev = G.stepsDone[key] || 0, now = st.filter(Boolean).length;
  if (now > prev) { G.stepsDone[key] = now; App.rec("git", 1); }
  if (st.every(Boolean) && !G.done[m.id]) { G.done[m.id] = Date.now(); App.addXP(40, "git"); App.toast("Mission geschafft", m.title, "⑂", true); }
  persist();
}

App.resetGitLab = () => { S().git = fresh(); load(); G.mission = "m1"; G.base.m1 = rawState(M[0]); G.flags.m1 = []; persist(); };
App._git = { M, rawState, get G() { return G; } };

/* ---------------- page ---------------- */
PAGES.gitlab = el => {
  load(); if (!G.mission) G.mission = "m1"; if (!G.base[G.mission]) G.base[G.mission] = rawState(M.find(x => x.id === G.mission));
  let hist = [], hi = 0;
  const host = () => G.host === "gitlab" ? "GitLab" : "GitHub";
  const draw = () => {
    const m = M.find(x => x.id === G.mission), st = stepsState(m), nDone = Object.keys(G.done).length;
    const r = repo();
    el.innerHTML = `<div class="page" style="max-width:1320px"><div class="spread"><div><h1>Git-Labor</h1><p class="muted" style="margin-top:6px">Simuliertes Terminal + ${host()}-Weboberfläche. Nichts verlässt dein Gerät. Befehle wie im echten Leben; <code>help</code> zeigt alle.</p></div>
      <div class="row"><span class="chip acc tab">${nDone}/${M.length - 1} Missionen</span><select id="gl-host" style="width:auto"><option value="github" ${G.host === "github" ? "selected" : ""}>GitHub-Stil</option><option value="gitlab" ${G.host === "gitlab" ? "selected" : ""}>GitLab-Stil (FH)</option></select><button class="btn ghost sm" id="gl-reset">Labor zurücksetzen</button></div></div>
      <div class="row" style="gap:8px;overflow-x:auto;flex-wrap:nowrap;padding-bottom:4px">${M.map(x => `<button class="mission-card ${x.id === G.mission ? "active" : ""}" data-m="${x.id}" style="min-width:190px"><b style="font-size:13px">${esc(x.title)}</b><small class="muted">${G.done[x.id] ? "✓ geschafft" : x.steps.length ? (G.stepsDone[x.id] || 0) + "/" + x.steps.length + " Schritte" : "Sandbox"}</small></button>`).join("")}</div>
      <div class="card col" style="gap:8px"><div class="spread"><div><b>${esc(m.title)}</b> <small class="muted">${esc(m.goal)}</small></div>${m.id === "m3" ? `<button class="btn sm" id="ev-lect">Lehrender pusht Übung 2</button>` : ""}<div class="row" style="gap:6px">${m.id === "m5" ? `<button class="btn sm" id="ev-anna">Teamkollege (Anna) pusht</button>` : ""}<button class="btn ghost sm" data-mreset="${m.id}" title="Sandbox und Schritte dieser Mission zurücksetzen">↺ Mission neu starten</button></div></div>
        ${m.steps.length ? `<div class="mission">${m.steps.map((s, i) => `<div class="ms ${st[i] ? "done" : ""}"><i>${st[i] ? "✓" : ""}</i>${esc(s[0].replace(/HOST/g, HOSTN()))}</div>`).join("")}</div>` : ""}</div>
      <div class="gl"><div class="term" style="display:flex;flex-direction:column;min-height:460px"><div class="term-bar"><i></i><i></i><i></i><span style="margin-left:8px">bash · ${esc(G.cwd)}</span></div><div class="term-out" id="gl-out" style="flex:1;height:auto;min-height:340px;max-height:520px">${G.log.map(([c, t]) => `<span class="${c}">${c === "p" ? esc(t) : t}</span>`).join("\n")}</div>
        <form class="term-in" id="gl-form"><span>$</span><input id="gl-in" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Befehl eingeben … (help)" aria-label="Terminal"></form>
        ${G.editing ? editorHTML() : ""}</div>
       <div class="gh" id="gh"></div></div>
      <div class="card col"><h3>Spickzettel</h3><div class="grid g3" style="gap:8px;font:12.5px/1.6 var(--f-mono)"><div>git status<br>git add . / datei<br>git commit -m "…"<br>git log --oneline --all</div><div>git switch -c feature/x<br>git push -u origin feature/x<br>git pull<br>git merge branch</div><div>git restore datei<br>git restore --staged datei<br>git diff / --staged<br>git branch -d name</div></div>
        <small class="muted">An der FH nutzt ihr GitLab (gitlab.itplus.fh-joanneum.at): dort heißt ein Pull Request „Merge Request“, sonst ist alles gleich.</small></div></div>`;
    const o = $("#gl-out", el); o.scrollTop = o.scrollHeight;
    const inp = $("#gl-in", el); if (!G.editing && !App._glNoFocus) setTimeout(() => inp && inp.focus({ preventScroll: true }), 0);
    $("#gl-form", el).onsubmit = e => { e.preventDefault(); const v = inp.value; if (!v.trim()) return; hist.push(v); hi = hist.length; v.split("&&").forEach(c => run(c.trim())); persist(); draw(); };
    inp.onkeydown = e => { if (e.key === "ArrowUp" && hi > 0) { hi--; inp.value = hist[hi]; e.preventDefault(); } if (e.key === "ArrowDown") { hi = Math.min(hist.length, hi + 1); inp.value = hist[hi] || ""; } if (e.key === "Tab") { e.preventDefault(); const cmds = ["git status", "git add .", "git commit -m \"\"", "git push", "git pull", "git switch ", "git log --oneline", "git branch", "git merge ", "git restore ", "git remote add origin ", "git clone "]; const m2 = cmds.find(c => c.startsWith(inp.value) && c !== inp.value); if (m2) inp.value = m2; } };
    $("#gl-host", el).onchange = e => { G.host = e.target.value; persist(); draw(); };
    $("#gl-reset", el).onclick = () => { App.modal(`<h2>Labor zurücksetzen?</h2><p class="muted">Alle simulierten Repos, Commits und Missionsfortschritte im Labor werden gelöscht. XP bleiben.</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Abbrechen</button><button class="btn danger" id="rs-y">Zurücksetzen</button></div>`, (mm, close) => { $("#rs-y", mm).onclick = () => { App.resetGitLab(); load(); close(); draw(); }; }); };
    const ev1 = $("#ev-lect", el); if (ev1) ev1.onclick = () => { if (!G.R[LECT]) M[2].setup(); webEdit(LECT, "main", "ex02/students.csv", "student,hours,exam_score\nAnna,2,52\nBen,3,58\n", "Exercise 2: data", "Lecturer"); out("(Der Lehrende hat „Exercise 2: data“ gepusht. Tipp: git pull)", "g"); afterCmd(); draw(); };
    const ev2 = $("#ev-anna", el); if (ev2) ev2.onclick = () => { if (!G.m5base) M[4].setup(); webEdit("kevin/ds-projekt", "main", "README.md", "# Mein Projekt\nDaten: students.csv (Quelle: Anna, bereinigt)\n", "Update data description", "Anna"); G.annaPushed = G.R["kevin/ds-projekt"].branches.main; out("(Anna hat eine Änderung an README.md gepusht. Ändere jetzt lokal dieselbe Zeile, z. B. mit nano README.md.)", "g"); afterCmd(); draw(); };
    if (G.editing) wireEditor();
    drawWeb();
  };
  const editorHTML = () => { const d = cwdFiles() || {}; return `<div class="editor-pop"><div class="term-bar" style="justify-content:space-between"><span>nano · ${esc(G.editing)}</span><span class="row" style="gap:6px"><button class="btn sm pri" id="ed-save">Speichern & schließen</button><button class="btn sm ghost" id="ed-x">Abbrechen</button></span></div><textarea id="ed-ta" spellcheck="false">${esc(d[G.editing] || "")}</textarea><div class="term-bar"><small>Konfliktmarker (&lt;&lt;&lt;&lt;&lt;&lt;&lt;, =======, &gt;&gt;&gt;&gt;&gt;&gt;&gt;) vollständig entfernen und die gewünschte Version stehen lassen.</small></div></div>`; };
  const wireEditor = () => { const ta = $("#ed-ta", el); ta.focus(); $("#ed-save", el).onclick = () => { const d = cwdFiles(); let v = ta.value; if (v && !v.endsWith("\n")) v += "\n"; d[G.editing] = v; out("(" + G.editing + " gespeichert)"); G.editing = null; afterCmd(); draw(); }; $("#ed-x", el).onclick = () => { G.editing = null; persist(); draw(); }; };

  /* ---------- web UI ---------- */
  const drawWeb = () => {
    const box = $("#gh", el); const repos = Object.values(G.R); let full = G.repoView && G.R[G.repoView] ? G.repoView : repos[0] ? repos[0].full : null; const R = full ? G.R[full] : null; const tab = G.tab || "code";
    const branch = G.webBranch && R && R.branches[G.webBranch] ? G.webBranch : "main";
    box.innerHTML = `<div class="gh-top"><span class="gh-logo">⑂</span><b>${host()}</b><span class="gh-muted">Simulation</span><span style="flex:1"></span>${repos.length ? `<select id="gh-repo" style="width:auto;padding:3px 6px">${repos.map(x => `<option ${x.full === full ? "selected" : ""}>${esc(x.full)}</option>`).join("")}</select>` : ""}<button class="gh-btn" id="gh-new">+ Neu</button><button class="gh-btn gray" id="gh-set">⚙</button></div>
      ${tab === "settings" ? settingsView() : tab === "new" ? newView() : !R ? `<div class="gh-body"><p>Noch keine Repositories.</p><p class="gh-muted">Lege mit „+ Neu“ ein Repository an oder starte Mission 3 (Kursrepo).</p></div>` : `
      <div class="gh-tabs">${[["code", "Code"], ["commits", "Commits"], ["branches", "Branches"], ["prs", PR() + "s (" + R.prs.filter(p => p.state === "open").length + ")"]].map(([k, t]) => `<button class="${tab === k ? "on" : ""}" data-tab="${k}">${t}</button>`).join("")}</div>
      <div class="gh-body">${tab === "code" ? codeView(R, branch) : tab === "commits" ? commitsView(R, branch) : tab === "branches" ? branchesView(R) : prView(R)}</div>`}`;
    const sel = $("#gh-repo", box); if (sel) sel.onchange = e => { G.repoView = e.target.value; G.tab = "code"; G.prView = null; persist(); drawWeb(); };
    $("#gh-new", box).onclick = () => { G.tab = "new"; drawWeb(); }; $("#gh-set", box).onclick = () => { G.tab = "settings"; drawWeb(); };
    box.onclick = e => {
      const t = e.target.closest("[data-tab]"); if (t) { G.tab = t.dataset.tab; G.prView = null; persist(); drawWeb(); return; }
      const cp = e.target.closest("[data-copy]"); if (cp) { const inp = $("#gl-in", el); inp.value = "git clone " + cp.dataset.copy; inp.focus(); return; }
      const wb = e.target.closest("[data-wb]"); if (wb) { G.webBranch = wb.dataset.wb; G.tab = "code"; drawWeb(); return; }
      const pv = e.target.closest("[data-pr]"); if (pv) { G.prView = +pv.dataset.pr; drawWeb(); return; }
      const mg = e.target.closest("[data-merge]"); if (mg) { const pr = R.prs.find(p => p.n === +mg.dataset.merge); if (!mergePR(R, pr)) { pr.conflict = true; App.toast("Konflikt", "Der Branch hat Konflikte. Lokal lösen und erneut pushen.", "!"); } afterCmd(); drawWeb(); draw(); return; }
      const cl = e.target.closest("[data-close-pr]"); if (cl) { R.prs.find(p => p.n === +cl.dataset.closePr).state = "closed"; persist(); drawWeb(); return; }
      const ed = e.target.closest("[data-webedit]"); if (ed) { webEditDialog(R, branch, ed.dataset.webedit); return; }
    };
    const f = $("#gh-prf", box); if (f) f.onsubmit = e => { e.preventDefault(); const head = $("#pr-head", box).value, base = $("#pr-base", box).value, title = $("#pr-title", box).value.trim() || head; if (head === base) return; R.prs.push({ n: R.prs.length + 1, head, base, title, state: "open", by: "kevin", ts: Date.now() }); G.prView = R.prs.length; afterCmd(); drawWeb(); draw(); };
    const nf = $("#gh-newf", box); if (nf) nf.onsubmit = e => { e.preventDefault(); const n = $("#nr-name", box).value.trim().replace(/[^\w.-]/g, "-"); if (!n) return; const fullN = "kevin/" + n; if (G.R[fullN]) { App.toast("Existiert schon", fullN, "!"); return; } const R2 = remoteRepo(fullN, { desc: $("#nr-desc", box).value }); if ($("#nr-readme", box).checked) R2.branches.main = mkCommit({ "README.md": "# " + n + "\n" }, [], "Initial commit", "kevin"); G.repoView = fullN; G.tab = "code"; afterCmd(); drawWeb(); draw(); };
    const kf = $("#gh-keyf", box); if (kf) kf.onsubmit = e => { e.preventDefault(); const v = $("#key-v", box).value.trim(); if (!G.ssh.gen) { App.toast("Kein Schlüssel", "Erst im Terminal ssh-keygen ausführen.", "!"); return; } if (!v.startsWith("ssh-ed25519") || !v.includes(G.ssh.gen)) { App.toast("Ungültiger Schlüssel", v.includes("PRIVATE") ? "Niemals den privaten Schlüssel einfügen!" : "Füge die Ausgabe von cat ~/.ssh/id_ed25519.pub ein.", "!"); return; } G.ssh.added = true; afterCmd(); drawWeb(); draw(); };
  };
  const settingsView = () => `<div class="gh-body"><h3 style="margin:0">SSH keys</h3><p class="gh-muted">So erkennt ${host()} deinen Rechner. Füge den <b>öffentlichen</b> Schlüssel ein (Ausgabe von <code>cat ~/.ssh/id_ed25519.pub</code>).</p>
    ${G.ssh.added ? `<div class="gh-box"><div class="gh-row"><span>🔑 studyos-laptop</span><span class="gh-muted">SHA256:${esc(G.ssh.gen)}</span></div></div>` : `<form id="gh-keyf" class="col" style="gap:8px"><label class="gh-muted">Key<textarea id="key-v" rows="3" placeholder="ssh-ed25519 AAAA… kevin@studyos"></textarea></label><div><button class="gh-btn" type="submit">Add SSH key</button></div></form>`}
    <button class="gh-btn gray" data-tab="code">← Zurück</button></div>`;
  const newView = () => `<div class="gh-body"><h3 style="margin:0">Create a new repository</h3><form id="gh-newf" class="col" style="gap:10px"><label class="gh-muted">Owner / Repository name<div class="row" style="flex-wrap:nowrap;gap:6px"><span>kevin /</span><input id="nr-name" placeholder="ds-projekt"></div></label><label class="gh-muted">Description<input id="nr-desc"></label><label class="row" style="gap:8px"><input type="checkbox" id="nr-readme"> Add a README file <span class="gh-muted">(für Mission 2 leer lassen, sonst musst du zuerst pullen)</span></label><div class="row"><button class="gh-btn" type="submit">Create repository</button><button type="button" class="gh-btn gray" data-tab="code">Abbrechen</button></div></form></div>`;
  const codeView = (R, br) => { const tree = treeOf(R.branches[br]); const files = Object.keys(tree).sort(); const last = R.branches[br] ? G.c[R.branches[br]] : null;
    return `<div class="row" style="gap:8px"><select onchange="" id="gh-br" style="width:auto;padding:3px 6px">${Object.keys(R.branches).map(b => `<option ${b === br ? "selected" : ""} data-wb="${esc(b)}">${esc(b)}</option>`).join("") || "<option>main</option>"}</select><span class="gh-muted">${Object.keys(R.branches).length} branches</span><span style="flex:1"></span><button class="gh-btn" data-copy="${esc(repoUrl(R.full))}">Code ▾ SSH</button></div>
    <div class="gh-muted" style="font-family:var(--f-mono);font-size:12px">${esc(repoUrl(R.full))}</div>
    ${files.length ? `<div class="gh-box"><div class="gh-row"><span><b>${esc(last.by)}</b> ${esc(last.msg)}</span><span class="gh-muted">${last.id}</span></div>${files.map(f => `<div class="gh-row"><span>📄 ${esc(f)}</span><button class="gh-btn gray" style="padding:1px 8px;font-size:12px" data-webedit="${esc(f)}">✎</button></div>`).join("")}</div>
      ${tree["README.md"] ? `<div class="gh-box"><div class="gh-row"><b>README.md</b></div><div style="padding:10px 12px;white-space:pre-wrap">${esc(tree["README.md"])}</div></div>` : ""}`
    : `<div class="gh-box"><div class="gh-row"><b>Quick setup</b></div><div style="padding:10px 12px;font:12.5px/1.7 var(--f-mono)">…or push an existing repository from the command line<br>git remote add origin ${esc(repoUrl(R.full))}<br>git branch -M main<br>git push -u origin main</div></div>`}`; };
  const commitsView = (R, br) => { const seen = new Set(), list = [], st = [R.branches[br]]; while (st.length) { const x = st.shift(); if (!x || seen.has(x)) continue; seen.add(x); list.push(G.c[x]); G.c[x].parents.forEach(p => st.push(p)); } list.sort((a, b) => b.ts - a.ts); return `<div class="gh-box">${list.map(c => `<div class="gh-row"><span>${c.parents.length > 1 ? "⑂ " : ""}${esc(c.msg)}<br><span class="gh-muted">${esc(c.by)} · ${new Date(c.ts).toLocaleString("de-AT")}</span></span><code>${c.id}</code></div>`).join("") || `<div class="gh-row">Keine Commits</div>`}</div>`; };
  const branchesView = R => `<div class="gh-box">${Object.entries(R.branches).map(([b, id]) => `<div class="gh-row"><span>⑂ <a href="#" data-wb="${esc(b)}" style="color:#4493F8">${esc(b)}</a> ${b === "main" ? '<span class="gh-pill open" style="background:#30363D">default</span>' : ""}</span><span class="gh-muted">${esc(G.c[id].msg)}</span></div>`).join("") || `<div class="gh-row">Keine Branches</div>`}</div>`;
  const prView = R => { if (G.prView) { const p = R.prs.find(x => x.n === G.prView); const mergeable = !isAnc(R.branches[p.head], R.branches[p.base]); return `<div class="col" style="gap:10px"><button class="gh-btn gray" data-tab="prs" style="align-self:flex-start">← Alle</button><h3 style="margin:0">${esc(p.title)} <span class="gh-muted">#${p.n}</span></h3><div><span class="gh-pill ${p.state}">${p.state === "open" ? "Open" : p.state === "merged" ? "Merged" : "Closed"}</span> <span class="gh-muted">kevin möchte <code>${esc(p.head)}</code> in <code>${esc(p.base)}</code> mergen</span></div>
      ${p.state === "open" ? `<div class="gh-box"><div class="gh-row">${p.conflict ? "⚠ This branch has conflicts that must be resolved" : mergeable ? "✓ This branch has no conflicts with the base branch" : "Nothing to merge"}</div><div class="gh-row"><span class="gh-muted">${p.conflict ? "Lokal lösen: git pull origin " + esc(p.base) + " auf dem Feature-Branch, Konflikt beheben, pushen." : "Merging can be performed automatically."}</span><span class="row" style="gap:6px"><button class="gh-btn gray" data-close-pr="${p.n}">Close</button><button class="gh-btn purple" data-merge="${p.n}" ${mergeable ? "" : "disabled"}>Merge</button></span></div></div>` : ""}</div>`; }
    const branches = Object.keys(R.branches); return `${branches.length > 1 ? `<form id="gh-prf" class="gh-box" style="padding:10px;display:flex;flex-direction:column;gap:8px"><b>New ${PR().toLowerCase()}</b><div class="row" style="gap:6px">base: <select id="pr-base" style="width:auto">${branches.map(b => `<option ${b === "main" ? "selected" : ""}>${esc(b)}</option>`).join("")}</select> ← compare: <select id="pr-head" style="width:auto">${branches.map(b => `<option ${b !== "main" ? "selected" : ""}>${esc(b)}</option>`).join("")}</select></div><input id="pr-title" placeholder="Titel"><div><button class="gh-btn" type="submit">Create ${PR().toLowerCase()}</button></div></form>` : `<p class="gh-muted">Push erst einen zweiten Branch, dann kannst du einen ${PR()} öffnen.</p>`}
      <div class="gh-box">${R.prs.slice().reverse().map(p => `<div class="gh-row"><a href="#" data-pr="${p.n}" style="color:#E6EDF3">${esc(p.title)} <span class="gh-muted">#${p.n} · ${esc(p.head)} → ${esc(p.base)}</span></a><span class="gh-pill ${p.state}">${p.state}</span></div>`).join("") || `<div class="gh-row gh-muted">Keine ${PR()}s</div>`}</div>`; };
  const webEditDialog = (R, br, path) => { App.modal(`<h2>${esc(path)} bearbeiten (${esc(br)})</h2><textarea rows="8" id="we-t" class="mono">${esc(treeOf(R.branches[br])[path] || "")}</textarea><label class="fld">Commit message<input type="text" id="we-m" value="Update ${esc(path)}"></label><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Abbrechen</button><button class="btn pri" id="we-s">Commit changes</button></div>`, (m, close) => { $("#we-s", m).onclick = () => { let v = $("#we-t", m).value; if (v && !v.endsWith("\n")) v += "\n"; webEdit(R.full, br, path, v, $("#we-m", m).value || "Update", G.user.name || "kevin"); out("(Im Web auf " + br + " committet. Lokal: git pull)", "g"); close(); afterCmd(); draw(); }; }); };
  el.addEventListener("click", e => {
    const rs = e.target.closest("[data-mreset]");
    if (rs) { const id = rs.dataset.mreset, mm = M.find(x => x.id === id); delete G.done[id]; G.stepsDone[id] = 0; G.flags[id] = []; loadWorld(id, true); out("── Mission neu gestartet: " + mm.title + " ──", "g"); persist(); draw(); return; }
    const m = e.target.closest("[data-m]"); if (!m || m.dataset.m === G.mission) return;
    saveWorld(); loadWorld(m.dataset.m); const mm = M.find(x => x.id === G.mission);
    if (!G.log.some(l => l[1] && l[1].includes("── Mission: " + mm.title))) out("── Mission: " + mm.title + " ──", "g");
    persist(); draw(); });
  el.addEventListener("change", e => { if (e.target.id === "gh-br") { G.webBranch = e.target.value; drawWeb(); } });
  if (!G.log.length) out("Willkommen im Git-Labor. Tippe <b>help</b> für alle Befehle. Starte mit Mission 1.", "g");
  draw();
};
})();
