/* StudyOS interactive widgets, part 1: concepts */
(function () {
const { $, $$, esc, shuffle, clamp, D } = App;
const W = App.W = App.W || {};
const S = () => App.S();
const head = (title, tag = "Interactive", right = "") => `<div class="w-head"><div class="w-title"><span class="tag">${tag}</span><h3>${title}</h3></div>${right}</div>`;
const done = App.wdone;

/* ---------- workflow ---------- */
W.workflow = el => {
  const N = [["Computer", "Your laptop. The course is “Linux first”: get used to a terminal, even on Windows (WSL, PowerShell) or macOS."],
    ["VS Code", "Editor with the Python extension and an integrated terminal. Open your project folder, not single files."],
    ["Python project", "Created with uv: pyproject.toml, uv.lock and an isolated .venv. Run code with uv run."],
    ["Git", "Local version control. Every commit is a snapshot you can go back to."],
    ["GitLab", "gitlab.itplus.fh-joanneum.at: course repo from the lecturer, your personal group for your own repos and hand-ins."]];
  el.innerHTML = `<div class="w">${head("Your workflow", "Visual")}<div class="row" style="gap:6px;align-items:stretch">${N.map((n, i) => `${i ? `<span class="farrow" style="align-self:center">→</span>` : ""}<button class="fnode" data-i="${i}" style="flex:1;min-width:92px;cursor:pointer">${n[0]}</button>`).join("")}</div><div class="venn-info" id="wf-info"><span class="muted">Tap a step to see what it does.</span></div></div>`;
  el.onclick = e => { const b = e.target.closest("[data-i]"); if (!b) return; $$(".fnode", el).forEach(x => x.classList.toggle("hot", x === b)); $("#wf-info", el).innerHTML = `<b>${N[b.dataset.i][0]}</b><div style="margin-top:4px">${N[b.dataset.i][1]}</div>`; };
};

/* ---------- git ordering ---------- */
W.gitorder = (el, b) => {
  const CORRECT = ["git status", 'git add .', 'git commit -m "message"', "git push"];
  const items = shuffle(CORRECT.concat(["git init"]));
  let seq = [];
  const draw = (res) => {
    el.innerHTML = `<div class="w">${head("Put the commands in order", "Ordering")}
      <p class="muted">You changed three files and want them on GitLab. Tap the commands in the order you’d run them. One command isn’t needed.</p>
      <div class="pool">${items.map((c, i) => `<button class="tok mono ${seq.includes(i) ? "used" : ""}" data-i="${i}">${esc(c)}</button>`).join("")}</div>
      <div class="slots" style="grid-template-columns:repeat(4,minmax(0,1fr))">${[0, 1, 2, 3].map(k => `<div class="slot mono ${seq[k] !== undefined ? "filled" : ""} ${res ? (items[seq[k]] === CORRECT[k] ? "ok" : "no") : ""}">${seq[k] !== undefined ? esc(items[seq[k]]) : k + 1}</div>`).join("")}</div>
      <div class="row"><button class="btn pri sm" id="go-check" ${seq.length < 4 ? "disabled" : ""}>Check order</button><button class="btn ghost sm" id="go-reset">Reset</button></div>
      ${res ? `<div class="why ${res.ok ? "" : "bad"}"><b>${res.ok ? "Right order." : "Not quite."}</b><div>status shows what changed → add stages the changes → commit records a snapshot locally → push uploads it. <code>git init</code> is only for creating a new repository.</div></div>` : ""}</div>`;
    $("#go-check", el).onclick = () => { const ok = seq.every((s, k) => items[s] === CORRECT[k]); App.rec(b.topic || "git", ok ? 1 : 0); if (ok && done("gitorder")) App.addXP(10, "git", $("#go-check", el)); draw({ ok }); };
    $("#go-reset", el).onclick = () => { seq = []; draw(); };
  };
  el.onclick = e => { const t = e.target.closest(".tok"); if (!t || seq.length >= 4) return; seq.push(+t.dataset.i); draw(); };
  draw();
};

/* ---------- fake terminal ---------- */
W.terminal = (el, b) => {
  const mission = b.mission || "git";
  const st = { cwd: "~/ds-course", staged: [], modified: ["analysis.py", "data/students.csv", "README.md"], commits: 1, pushed: 1, key: false, shown: false, tested: false };
  const MS = mission === "git"
    ? [["status", "Check what changed (git status)"], ["add", "Stage all changes"], ["commit", "Commit with a message"], ["push", "Push to GitLab"]]
    : [["keygen", "Create an ed25519 key pair"], ["cat", "Print your public key"], ["test", "Test the connection to GitLab"]];
  const doneSet = new Set();
  const out = [];
  const P = () => `<span class="p">kevin@fhj:${st.cwd}$</span> `;
  const print = (s, cls) => out.push(cls ? `<span class="${cls}">${s}</span>` : s);
  const status = () => {
    let s = "On branch main\nYour branch is " + (st.commits > st.pushed ? `ahead of 'origin/main' by ${st.commits - st.pushed} commit.` : "up to date with 'origin/main'.") + "\n";
    if (st.staged.length) s += "\nChanges to be committed:\n" + st.staged.map(f => `        <span class="g">modified:   ${f}</span>`).join("\n") + "\n";
    if (st.modified.length) s += "\nChanges not staged for commit:\n  (use \"git add &lt;file&gt;...\" to update what will be committed)\n" + st.modified.map(f => `        <span class="r">modified:   ${f}</span>`).join("\n") + "\n";
    if (!st.staged.length && !st.modified.length) s += "\nnothing to commit, working tree clean";
    return s;
  };
  const run = raw => {
    const cmd = raw.trim(); print(P() + esc(cmd)); if (!cmd) return;
    const [c0, c1, ...rest] = cmd.split(/\s+/);
    if (cmd === "clear") { out.length = 0; return; }
    if (cmd === "help") { print("Try: git status · git add . · git add &lt;file&gt; · git commit -m \"msg\" · git push · git log --oneline · ls · pwd · ssh-keygen -t ed25519 · cat ~/.ssh/id_ed25519.pub · ssh -T git@gitlab.itplus.fh-joanneum.at · uv run main.py"); return; }
    if (c0 === "pwd") return print("/home/kevin/" + st.cwd.replace("~/", ""));
    if (c0 === "ls") return print(c1 && c1.includes(".ssh") ? (st.key ? "id_ed25519  id_ed25519.pub  known_hosts" : "known_hosts") : "README.md  analysis.py  data/  main.py  pyproject.toml  uv.lock");
    if (c0 === "cd") { st.cwd = !c1 || c1 === "~" ? "~" : c1 === ".." ? "~" : (st.cwd === "~" ? "~/" + c1 : st.cwd + "/" + c1); return; }
    if (c0 === "uv") { if (c1 === "run") return print("Mean exam score: 68.2"); if (c1 === "add") return print(`Resolved 12 packages in 214ms\nInstalled ${rest.join(" ") || "package"}`); if (c1 === "init") return print(`Initialized project \`${rest[0] || "ds-course"}\``); return print("usage: uv [init|add|run|sync] …"); }
    if (c0 === "git") {
      if (c1 === "status") { doneSet.add("status"); return print(status()); }
      if (c1 === "add") { const t = rest[0]; if (!t) return print("Nothing specified, nothing added.", "e"); if (t === "." || t === "-A") { st.staged.push(...st.modified); st.modified = []; } else { const i = st.modified.indexOf(t); if (i < 0) return print(`fatal: pathspec '${esc(t)}' did not match any files`, "e"); st.staged.push(t); st.modified.splice(i, 1); } if (!st.modified.length) doneSet.add("add"); return; }
      if (c1 === "commit") { if (!/-m\s+["'].+["']/.test(cmd)) return print("Aborting commit due to empty commit message. Use -m \"message\".", "e"); if (!st.staged.length) return print(status()); const n = st.staged.length; st.staged = []; st.commits++; if (!st.modified.length) doneSet.add("commit"); return print(`[main 3f9a2c${st.commits}] ${esc(cmd.match(/-m\s+["'](.+)["']/)[1])}\n ${n} files changed, 42 insertions(+), 7 deletions(-)`); }
      if (c1 === "push") { if (st.commits === st.pushed) return print("Everything up-to-date"); st.pushed = st.commits; doneSet.add("push"); return print("Enumerating objects: 9, done.\nWriting objects: 100% (5/5), 1.21 KiB, done.\nTo gitlab.itplus.fh-joanneum.at:study/ima/ima25w/students/kevin/ds-course.git\n   8d1e0a4..3f9a2c" + st.commits + "  main -> main", "g"); }
      if (c1 === "log") return print(Array.from({ length: st.commits }, (_, i) => `3f9a2c${st.commits - i} ${i === st.commits - 1 ? "Initial commit" : "Update analysis"}`).join("\n"));
      if (c1 === "clone") return print("Cloning into 'course-ws-2627'...\ndone.");
      return print(`git: '${esc(c1 || "")}' is not a git command in this simulator. Type help.`, "e");
    }
    if (c0 === "ssh-keygen") { st.key = true; doneSet.add("keygen"); return print("Generating public/private ed25519 key pair.\nEnter file in which to save the key (/home/kevin/.ssh/id_ed25519): \nYour identification has been saved in /home/kevin/.ssh/id_ed25519\nYour public key has been saved in /home/kevin/.ssh/id_ed25519.pub"); }
    if (c0 === "cat") { if (!c1) return; if (c1.includes("id_ed25519.pub")) { if (!st.key) return print("cat: " + esc(c1) + ": No such file or directory", "e"); doneSet.add("cat"); return print("ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK7q…b3Xw kevin@fhj   ← paste this into GitLab → Preferences → SSH Keys", "g"); } if (c1.includes("id_ed25519")) return print("Careful: that is your PRIVATE key. Never share it. (Simulator refuses to print it.)", "e"); return print("cat: " + esc(c1) + ": No such file or directory", "e"); }
    if (c0 === "ssh") { if (!st.key) return print("git@gitlab.itplus.fh-joanneum.at: Permission denied (publickey).", "e"); doneSet.add("test"); return print("Welcome to GitLab, @kevin!", "g"); }
    print(`${esc(c0)}: command not found. Type help.`, "e");
  };
  const hist = []; let hi = 0;
  const draw = () => {
    const all = MS.every(m => doneSet.has(m[0]));
    el.innerHTML = `<div class="w">${head(mission === "git" ? "Mission: commit and push" : "Mission: connect with SSH", "Terminal", `<span class="chip ${all ? "acc" : ""}">${all ? "Mission complete" : doneSet.size + " / " + MS.length}</span>`)}
      <div class="mission">${MS.map(m => `<div class="ms ${doneSet.has(m[0]) ? "done" : ""}"><i>${doneSet.has(m[0]) ? "✓" : ""}</i>${m[1]}</div>`).join("")}</div>
      <div class="term"><div class="term-bar"><i></i><i></i><i></i><span style="margin-left:8px">bash — simulated</span></div><div class="term-out" id="tout">${out.join("\n")}</div>
      <form class="term-in" id="tform"><span>$</span><input id="tin-${mission}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type a command, or help" aria-label="Terminal input"></form></div></div>`;
    const o = $("#tout", el); o.scrollTop = o.scrollHeight;
    const inp = $("input", el);
    $("#tform", el).onsubmit = e => { e.preventDefault(); const v = inp.value; hist.push(v); hi = hist.length; const before = MS.every(m => doneSet.has(m[0])); run(v); const after = MS.every(m => doneSet.has(m[0])); draw(); $("input", el).focus();
      if (!before && after && done("term-" + mission)) { App.rec(b.topic || (mission === "git" ? "git" : "ssh"), 1); App.addXP(20, "terminal", $("#tout", el)); App.toast("Mission complete", mission === "git" ? "Your changes are on GitLab." : "GitLab recognises your key.", "✓"); } };
    inp.onkeydown = e => { if (e.key === "ArrowUp" && hi > 0) { hi--; inp.value = hist[hi]; e.preventDefault(); } if (e.key === "ArrowDown") { hi = Math.min(hist.length, hi + 1); inp.value = hist[hi] || ""; } };
  };
  print(mission === "git" ? "You edited three files in your course project. Get them onto GitLab. Type <b>help</b> for commands." : "Set up SSH access to GitLab. Type <b>help</b> for commands.", "g");
  draw();
};

/* ---------- Venn ---------- */
W.venn = el => {
  const C = [{ k: "H", name: "Hacking skills", x: 190, y: 150, col: "#F0616D", items: ["Data Management", "Data Engineering", "Distributed compute & storage", "DevOps / MLOps", "Cloud"], info: "Programming and computing craft: getting data, moving it, running code at scale." },
    { k: "M", name: "Math & statistics", x: 310, y: 150, col: "#8BD126", items: ["Linear algebra", "Information theory", "Descriptive & inductive statistics", "Optimization", "Mathematical modeling & simulation", "Dynamic systems"], info: "The theory that tells you whether a result means anything." },
    { k: "S", name: "Substantive expertise", x: 250, y: 250, col: "#A78BFA", items: ["Business analysis (ask the right questions, structure the problem)", "Profound and broad base knowledge", "Willingness to adapt to new problems and domains (language!)"], info: "Domain knowledge: understanding the problem you are solving." }];
  const R = 100;
  const REG = { "HM": ["Machine Learning", "Hacking + math, without domain knowledge. Powerful methods, but nobody asks whether they answer the right question."],
    "MS": ["Traditional Research", "Math + domain expertise. Rigorous, but limited by what you can compute by hand."],
    "HS": ["Danger Zone!", "Hacking + domain knowledge without math. Produces analyses that look convincing but may be statistically wrong."],
    "HMS": ["Data Science", "All three together. The rare overlap the course aims at."] };
  let visited = new Set();
  el.innerHTML = `<div class="w">${head("Drew Conway’s Data Science Venn diagram", "Explore", `<small class="muted" id="vv">0 / 4 overlaps found</small>`)}
    <div class="svgbox"><svg viewBox="0 0 500 380" id="vsvg" role="img" aria-label="Venn diagram of hacking skills, math and statistics, substantive expertise" style="max-width:560px;margin:0 auto">
      ${C.map(c => `<circle cx="${c.x}" cy="${c.y}" r="${R}" fill="${c.col}" fill-opacity=".13" stroke="${c.col}" stroke-opacity=".7" stroke-width="1.5"/>`).join("")}
      <circle id="vhi" r="6" fill="var(--text)" opacity="0"/>
      <text x="120" y="92" fill="#F0616D" font-size="13" font-weight="600" text-anchor="middle" font-family="Sora,sans-serif">Hacking skills</text>
      <text x="380" y="92" fill="#8BD126" font-size="13" font-weight="600" text-anchor="middle" font-family="Sora,sans-serif">Math &amp; statistics</text>
      <text x="250" y="372" fill="#A78BFA" font-size="13" font-weight="600" text-anchor="middle" font-family="Sora,sans-serif">Substantive expertise</text>
      <text x="250" y="122" fill="var(--muted)" font-size="11" text-anchor="middle">Machine Learning</text>
      <text x="198" y="232" fill="var(--muted)" font-size="11" text-anchor="middle">Danger Zone</text>
      <text x="304" y="232" fill="var(--muted)" font-size="11" text-anchor="middle">Research</text>
      <text x="250" y="190" fill="var(--text)" font-size="12" font-weight="700" text-anchor="middle">Data Science</text>
    </svg></div>
    <div class="venn-info" id="vinfo"><span class="muted">Hover or tap inside the diagram. Every region has a meaning.</span></div>
    <div class="grid g3">${C.map(c => `<div class="col" style="gap:6px"><span class="eyebrow" style="color:${c.col}">${c.name}</span>${c.items.map(i => `<span class="chip" style="white-space:normal">${i}</span>`).join("")}</div>`).join("")}</div></div>`;
  const svg = $("#vsvg", el);
  const at = e => { const r = svg.getBoundingClientRect(); const x = (e.clientX - r.left) * 500 / r.width, y = (e.clientY - r.top) * 380 / r.height; return [x, y]; };
  const show = e => {
    const [x, y] = at(e); const inside = C.filter(c => (x - c.x) ** 2 + (y - c.y) ** 2 <= R * R).map(c => c.k).join("");
    const info = $("#vinfo", el);
    if (!inside) { info.innerHTML = `<span class="muted">Outside the circles.</span>`; return; }
    if (inside.length === 1) { const c = C.find(c => c.k === inside); info.innerHTML = `<b style="color:${c.col}">${c.name}</b><div style="margin-top:4px">${c.info}</div>`; return; }
    const r = REG[inside]; visited.add(inside); $("#vv", el).textContent = visited.size + " / 4 overlaps found";
    info.innerHTML = `<b>${r[0]}</b><div style="margin-top:4px">${r[1]}</div>`;
    if (visited.size === 4 && done("venn")) App.addXP(10, "venn", info);
  };
  svg.addEventListener("pointermove", show); svg.addEventListener("pointerdown", show);
};

/* ---------- Ethics scenarios ---------- */
W.ethics = (el, b) => {
  const SC = [
    { s: "A company trains a hiring algorithm on 10 years of historical hiring decisions.", q: "What should you investigate first?", o: ["Whether the GPU is fast enough", "Historical bias in the dataset", "Which learning rate to use"], a: 1, w: "The model learns past decisions as ground truth. If past hiring disadvantaged a group, the model repeats it at scale: bias and manifesting prejudice." },
    { s: "A week before an election a realistic video shows a candidate saying something they never said.", q: "Which ethical issue is this?", o: ["Deepfakes and fake news", "Data protection", "Survivorship bias"], a: 0, w: "Generative models make convincing fakes cheap. Detection, provenance and media literacy are the counter-measures." },
    { s: "A fitness app sells users’ location histories to advertisers. Users were never told.", q: "Which framework is violated most directly?", o: ["GDPR: purpose and consent for personal data", "Correlation vs. causality", "The data science lifecycle"], a: 0, w: "Under GDPR personal data needs a legal basis and a stated purpose, and users keep rights on their own data." },
    { s: "A political campaign builds psychological profiles from social-media likes to target individual voters with tailored messages.", q: "What is this an example of?", o: ["Anomaly detection", "Human profiling and manipulation", "AI safety research"], a: 1, w: "This is the Cambridge Analytica pattern from the lecture." }];
  let i = 0; let score = 0;
  const draw = () => {
    if (i >= SC.length) { el.innerHTML = `<div class="w">${head("Ethics scenarios", "Scenarios")}<div class="why"><b>${score} / ${SC.length} correct.</b><div>Ethics isn’t a separate step. Ask these questions at the start of every project.</div></div><div><button class="btn sm" id="er">Play again</button></div></div>`; $("#er", el).onclick = () => { i = 0; score = 0; draw(); }; return; }
    const c = SC[i];
    el.innerHTML = `<div class="w">${head("Ethics scenarios", "Scenario " + (i + 1) + "/" + SC.length)}<div class="card" style="background:var(--bg)"><p>${c.s}</p></div>
      ${App.questionHTML({ q: c.q, opts: c.o, a: c.a, why: c.w }, "eth")}<div class="row" id="enext" hidden><button class="btn sm">Next scenario →</button></div></div>`;
    el.onclick = e => {
      const btn = e.target.closest("[data-eth]"); if (btn && !btn.disabled) { const ok = App.reveal(el, { q: c.q, opts: c.o, a: c.a, why: c.w }, +btn.dataset.eth); if (ok) score++; App.rec(b.topic || "ethics", ok ? 1 : 0); if (ok) App.addXP(3, "eth", btn); $("#enext", el).hidden = false; return; }
      if (e.target.closest("#enext button")) { i++; draw(); }
    };
  };
  draw();
};

/* ---------- AI tree ---------- */
W.aitree = el => {
  const INFO = { ai: ["Artificial Intelligence", "Computer systems that perform tasks normally requiring human intelligence: perception, speech recognition, decisions, translation. Compare the Turing test."],
    ani: ["Artificial Narrow Intelligence", "Strong at one task or a family of tasks. Everything in use today is narrow, including ChatGPT and Stable Diffusion. Key recent building blocks: variational autoencoders (→ Stable Diffusion) and generative pre-trained transformers (→ ChatGPT)."],
    agi: ["Artificial General Intelligence", "Human-level ability across tasks, learning new domains on its own. Not reached yet; the lecture calls it the current push."] };
  el.innerHTML = `<div class="w">${head("From AI to narrow and general", "Visual")}
    <div class="col" style="align-items:center;gap:10px">
      <button class="fnode" data-k="ai" style="min-width:220px;cursor:pointer">Artificial Intelligence (AI)</button>
      <svg viewBox="0 0 300 30" width="300" height="30" aria-hidden="true" style="max-width:100%"><path d="M150 0 V12 H70 V30 M150 12 H230 V30" fill="none" stroke="var(--line2)" stroke-width="1.5"/></svg>
      <div class="row" style="gap:16px;justify-content:center"><button class="fnode" data-k="ani" style="min-width:180px;cursor:pointer">Narrow (ANI)</button><button class="fnode" data-k="agi" style="min-width:180px;cursor:pointer">General (AGI)</button></div>
      <small class="muted">ANI → AGI: the current push</small></div>
    <div class="venn-info" id="ai-info"><span class="muted">Tap a box.</span></div></div>`;
  el.onclick = e => { const b = e.target.closest("[data-k]"); if (!b) return; $$(".fnode", el).forEach(x => x.classList.toggle("hot", x === b)); const i = INFO[b.dataset.k]; $("#ai-info", el).innerHTML = `<b>${i[0]}</b><div style="margin-top:4px">${i[1]}</div>`; };
};

/* ---------- AI approach cards ---------- */
const APPROACHES = [
  { n: "Symbolic AI (GOFAI)", d: "Builds on principles of logic: explicit symbols and rules.", e: "An expert system: IF fever AND rash THEN check measles.", u: "Rule engines, planning, theorem proving, configuration.", r: "Not ML: rules are written, not learned." },
  { n: "Fuzzy logic", d: "“Fuzzy” (non-sharp) rules that represent human common sense (Hausverstand).", e: "Temperature is 0.7 “warm” and 0.3 “hot”.", u: "Washing machines, climate control, cameras.", r: "Not ML by itself; can be combined with learning." },
  { n: "Swarm intelligence", d: "Intelligent group behaviour from many individuals that follow very simple rules.", e: "Ant colonies finding the shortest path to food.", u: "Routing, scheduling, drone swarms.", r: "Nature-inspired computational intelligence; optimisation rather than learning from labels." },
  { n: "Evolutionary algorithms", d: "Mutation and selection to solve complex optimisation tasks.", e: "Evolving antenna shapes over generations.", u: "Design optimisation, timetabling, hyper-parameter search.", r: "Can tune ML models; not ML in the narrow sense." },
  { n: "Neural networks", d: "Inspired by early understanding of neurons; scales to huge numbers of trainable parameters (deep learning).", e: "GPT, image classifiers.", u: "Vision, speech, language, generative AI.", r: "Core of ML: structure fixed, parameters learned." },
  { n: "Statistical learning", d: "Well-known statistics (decision trees, dimensionality reduction, Bayes) combined with modern compute (e.g. Monte Carlo).", e: "A decision tree predicting loan default.", u: "Tabular business data, forecasting.", r: "Core of ML and the focus of this course." }];
W.aicards = el => {
  el.innerHTML = `<div class="w">${head("Six approaches to AI", "Cards")}<p class="muted">Machine learning covers the last two. Tap a card for details.</p>
   <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(230px,1fr))">${APPROACHES.map((a, i) => `<button class="card col" data-i="${i}" style="background:var(--bg);text-align:left;gap:6px;cursor:pointer;${i >= 4 ? "border-color:var(--acc-line)" : ""}"><div class="spread"><h3>${a.n}</h3>${i >= 4 ? `<span class="chip acc">ML</span>` : ""}</div><small>${a.d}</small><div class="more" hidden><div class="divider" style="margin:8px 0"></div><div style="font-size:13px" class="col"><div><span class="eyebrow">Example</span><br>${a.e}</div><div><span class="eyebrow">Used in</span><br>${a.u}</div><div><span class="eyebrow">Relation to ML</span><br>${a.r}</div></div></div></button>`).join("")}</div></div>`;
  el.onclick = e => { const b = e.target.closest("[data-i]"); if (!b) return; const m = $(".more", b); m.hidden = !m.hidden; };
};

/* ---------- matching ---------- */
W.matching = (el, b) => {
  const P = [["Mutation + selection", 3], ["Many simple individuals create intelligent group behaviour", 2], ["Non-sharp rules like human common sense", 1], ["Rules built on principles of logic", 0], ["Brain-inspired structure with a huge number of trainable parameters", 4], ["Decision trees and Bayes statistics with modern compute", 5]];
  const left = shuffle(P.map((p, i) => i)); const right = shuffle([0, 1, 2, 3, 4, 5]);
  let sel = null; const matched = {}; const missed = new Set(); let first = 0;
  const draw = () => {
    const n = Object.keys(matched).length, fin = n === P.length;
    const usedR = Object.values(matched);
    el.innerHTML = `<div class="w">${head("Match the description to the approach", "Matching", `<small class="muted tab">${n}/${P.length}</small>`)}
      <div class="grid g2"><div class="col" style="gap:8px">${left.map(i => `<button class="opt ${sel === i ? "sel" : ""} ${matched[i] !== undefined ? "ok" : ""}" data-l="${i}" ${matched[i] !== undefined ? "disabled" : ""}><span>${P[i][0]}</span></button>`).join("")}</div>
      <div class="col" style="gap:8px">${right.map(k => `<button class="opt ${usedR.includes(k) ? "ok" : ""}" data-r="${k}" ${usedR.includes(k) ? "disabled" : ""}><span>${APPROACHES[k].n}</span></button>`).join("")}</div></div>
      ${fin ? `<div class="why"><b>${first} of ${P.length} right on the first try.</b><div>Symbolic and fuzzy approaches are hand-built; swarm and evolutionary methods are nature-inspired optimisation; neural networks and statistical learning are machine learning.</div></div><div><button class="btn sm" id="mt-re">Shuffle and replay</button></div>` : `<small class="muted">Pick a description on the left, then its approach on the right.</small>`}</div>`;
    const re = $("#mt-re", el); if (re) re.onclick = () => W.matching(el, b);
  };
  el.onclick = e => {
    const l = e.target.closest("[data-l]"), r = e.target.closest("[data-r]");
    if (l) { sel = +l.dataset.l; draw(); return; }
    if (r && sel !== null) {
      const k = +r.dataset.r;
      if (P[sel][1] === k) {
        if (!missed.has(sel)) first++;
        App.rec(b.topic || "ai", missed.has(sel) ? 0.5 : 1);
        matched[sel] = k; sel = null; draw();
        if (Object.keys(matched).length === P.length && done("matching")) App.addXP(10, "match", el);
      } else { missed.add(sel); App.rec(b.topic || "ai", 0); r.classList.add("no"); setTimeout(() => r.classList.remove("no"), 450); }
    }
  };
  draw();
};

/* ---------- LLM token game ---------- */
W.llm = el => {
  const T = { am: [["reading", .42], ["working", .27], ["learning", .18], ["sleeping", .13]], reading: [["a", .34], ["books", .29], ["the", .22], ["now", .15]], working: [["at", .46], ["on", .31], ["from", .15], ["hard", .08]], learning: [["Python", .41], ["statistics", .24], ["to", .21], ["about", .14]], sleeping: [["now", .44], ["in", .28], ["on", .16], ["badly", .12]], a: [["book", .52], ["paper", .23], ["novel", .15], ["report", .10]], the: [["news", .37], ["book", .29], ["paper", .21], ["slides", .13]], at: [["the", .41], ["office", .34], ["home", .17], ["university", .08]], on: [["a", .45], ["the", .32], ["my", .16], ["Data", .07]], from: [["home", .72], ["the", .18], ["Graz", .06], ["bed", .04]], Python: [[".", .44], ["today", .25], ["and", .19], ["code", .12]], to: [["code", .38], ["learn", .27], ["cook", .20], ["fly", .15]], about: [["AI", .46], ["bias", .24], ["data", .2], ["myself", .1]], statistics: [[".", .5], ["today", .3], ["again", .2]] };
  const GEN = [[".", .5], ["and", .28], ["today", .22]];
  let words = ["I", "am"], temp = 1;
  const dist = () => { const base = T[words[words.length - 1]] || GEN; const p = base.map(([w, q]) => [w, Math.pow(q, 1 / temp)]); const s = p.reduce((a, b) => a + b[1], 0); return p.map(([w, q]) => [w, q / s]); };
  const draw = () => {
    const end = words[words.length - 1] === "." || words.length > 9; const d = dist();
    el.innerHTML = `<div class="w">${head("Predict the next token", "LLM", `<button class="btn ghost sm" id="lr">Reset</button>`)}
      <div class="sentence">${words.map((w, i) => `<span class="${i === words.length - 1 && i > 1 ? "new" : ""}">${esc(w)}</span>`).join(" ").replace(/ <span class="(new)?">\.<\/span>/, `<span class="new">.</span>`)}${end ? "" : ` <span class="faint">…</span>`}</div>
      ${end ? `<div class="why"><b>Sentence finished.</b><div>Each word was chosen from a probability distribution that depends on the context so far. Real models use far more context (thousands of tokens) and vocabularies of ~100,000 tokens.</div></div>` :
      `<div class="col" style="gap:4px">${d.map(([w, p]) => `<button class="tokbar" data-w="${esc(w)}"><span class="mono">${esc(w)}</span><div class="bar"><i style="width:${Math.round(p * 100)}%"></i></div><span class="tab muted">${Math.round(p * 100)}%</span></button>`).join("")}</div>
      <div class="row"><button class="btn sm pri" id="ls">Sample next token</button><small class="muted">or tap a word yourself</small></div>`}
      <label class="fld">Temperature: <span class="tab" id="tv">${temp.toFixed(1)}</span> <input type="range" id="lt" min="0.2" max="2" step="0.1" value="${temp}"><small>Low temperature sharpens the distribution (predictable text); high temperature flattens it (creative, riskier).</small></label></div>`;
    $("#lr", el).onclick = () => { words = ["I", "am"]; draw(); };
    const s = $("#ls", el); if (s) s.onclick = () => { let r = Math.random(); for (const [w, p] of d) { r -= p; if (r <= 0) { words.push(w); break; } } if (r > 0) words.push(d[0][0]); draw(); };
    $("#lt", el).onchange = e => { temp = +e.target.value; draw(); }; $("#lt", el).oninput = e => { $("#tv", el).textContent = (+e.target.value).toFixed(1); };
  };
  el.onclick = e => { const t = e.target.closest("[data-w]"); if (t) { words.push(t.dataset.w); draw(); } };
  draw();
};

/* ---------- ML flow animation ---------- */
W.mlflow = el => {
  const rows = [
    { t: "Classical software", n: ["Input data", "Rules (written by you)", "Classical software", "Output"] },
    { t: "Machine learning · training", n: ["Input data", "Known output (labels)", "Learning algorithm", "Model / rule set"] },
    { t: "Machine learning · inference", n: ["New input", "", "Model", "Prediction ŷ"] }];
  el.innerHTML = `<div class="w">${head("The new programming paradigm", "Animated", `<button class="btn sm pri" id="fplay">▶ Play</button>`)}
   ${rows.map((r, ri) => `<div class="col" style="gap:6px"><span class="eyebrow">${r.t}</span><div class="flow" style="grid-template-columns:1fr 1fr auto 1fr auto 1fr">
      <div class="fnode" data-s="${ri}-0">${r.n[0]}</div>${r.n[1] ? `<div class="fnode" data-s="${ri}-1">+ ${r.n[1]}</div>` : `<div></div>`}<span class="farrow">→</span><div class="fnode" data-s="${ri}-2">${r.n[2]}</div><span class="farrow">→</span><div class="fnode" data-s="${ri}-3">${r.n[3]}</div></div></div>`).join("")}
   <small class="muted">ML models take existing input data and response data to learn the rule set, which then predicts ŷ for new inputs, as close as possible to the real y.</small></div>`;
  let timer;
  $("#fplay", el).onclick = () => {
    clearInterval(timer); const seq = []; [0, 1, 2].forEach(r => [0, 1, 2, 3].forEach(k => seq.push(r + "-" + k)));
    let i = 0; $$(".fnode", el).forEach(x => x.classList.remove("hot"));
    timer = setInterval(() => { if (i >= seq.length) { clearInterval(timer); return; } const n = $(`[data-s="${seq[i]}"]`, el); if (n) n.classList.add("hot"); if (i % 4 === 3) setTimeout(() => {}, 0); i++; }, 380);
  };
  App.cleanup = (old => () => { clearInterval(timer); old && old(); })(App.cleanup);
};

/* ---------- ML slots exercise ---------- */
W.mlslots = (el, b) => {
  const TOK = ["Input Data", "Rules", "Output", "Training Data", "Labels", "Model", "Prediction"];
  const pool = shuffle(TOK.map((t, i) => i)); const put = {}; let sel = null, res = null;
  const ACC = { s1: ["Input Data", "Rules"], s2: ["Input Data", "Rules"], s3: ["Output"], s4: ["Training Data", "Labels"], s5: ["Training Data", "Labels"], s6: ["Model"], s7: ["Prediction"] };
  const slot = (id) => { const t = put[id] !== undefined ? TOK[put[id]] : ""; const r = res ? (res[id] ? "ok" : "no") : ""; return `<div class="slot ${t ? "filled" : ""} ${r}" data-slot="${id}">${t || "drop here"}</div>`; };
  const draw = () => {
    const usedIdx = Object.values(put);
    el.innerHTML = `<div class="w">${head("Place the pieces", "Drag & drop")}<p class="muted">Drag the items into the slots, or tap an item and then a slot.</p>
     <div class="pool">${pool.map(i => `<span class="tok ${sel === i ? "sel" : ""} ${usedIdx.includes(i) ? "used" : ""}" draggable="true" data-t="${i}" role="button" tabindex="0">${TOK[i]}</span>`).join("")}</div>
     <div class="col" style="gap:10px">
      <span class="eyebrow">Classical software</span><div class="flow" style="grid-template-columns:1fr 1fr auto 1fr auto 1fr">${slot("s1")}${slot("s2")}<span class="farrow">→</span><div class="fnode">Program</div><span class="farrow">→</span>${slot("s3")}</div>
      <span class="eyebrow">ML training</span><div class="flow" style="grid-template-columns:1fr 1fr auto 1fr auto 1fr">${slot("s4")}${slot("s5")}<span class="farrow">→</span><div class="fnode">Learning algorithm</div><span class="farrow">→</span>${slot("s6")}</div>
      <span class="eyebrow">ML inference</span><div class="flow" style="grid-template-columns:1fr 1fr auto 1fr auto 1fr"><div class="fnode">New input</div><div></div><span class="farrow">→</span><div class="fnode">Trained model</div><span class="farrow">→</span>${slot("s7")}</div></div>
     <div class="row"><button class="btn pri sm" id="ms-check" ${Object.keys(put).length < 7 ? "disabled" : ""}>Check</button><button class="btn ghost sm" id="ms-reset">Reset</button></div>
     ${res ? `<div class="why ${res.score === 7 ? "" : "bad"}"><b>${res.score} / 7 correct.</b><div>Classical: input + rules → output. Training: training data + labels → model. Inference: the model turns new input into a prediction.</div></div>` : ""}</div>`;
    $("#ms-check", el).onclick = () => { res = {}; let sc = 0; Object.keys(ACC).forEach(k => { res[k] = ACC[k].includes(TOK[put[k]]); if (res[k]) sc++; }); if (TOK[put.s1] === TOK[put.s2] || TOK[put.s4] === TOK[put.s5]) {} res.score = sc; App.rec(b.topic || "mlbasics", sc / 7); if (sc === 7 && done("mlslots")) App.addXP(15, "slots", $("#ms-check", el)); draw(); };
    $("#ms-reset", el).onclick = () => { Object.keys(put).forEach(k => delete put[k]); res = null; sel = null; draw(); };
    $$(".tok", el).forEach(t => { t.ondragstart = e => { e.dataTransfer.setData("text/plain", t.dataset.t); }; });
    $$(".slot", el).forEach(s => { s.ondragover = e => e.preventDefault(); s.ondrop = e => { e.preventDefault(); const i = +e.dataTransfer.getData("text/plain"); place(s.dataset.slot, i); }; });
  };
  const place = (slotId, i) => { Object.keys(put).forEach(k => { if (put[k] === i) delete put[k]; }); put[slotId] = i; sel = null; res = null; draw(); };
  el.onclick = e => {
    const t = e.target.closest(".tok"); if (t) { sel = +t.dataset.t; draw(); return; }
    const s = e.target.closest("[data-slot]"); if (s) { if (sel !== null) place(s.dataset.slot, sel); else if (put[s.dataset.slot] !== undefined) { delete put[s.dataset.slot]; res = null; draw(); } }
  };
  draw();
};

/* ---------- Accuracy / precision targets ---------- */
W.targets = (el, b) => {
  const TYPES = [["acc-prec", "Accurate + precise", [0, 0], 7], ["acc-noprec", "Accurate, not precise", [0, 0], 34], ["noacc-prec", "Not accurate, precise", [30, -26], 7], ["noacc-noprec", "Not accurate, not precise", [26, -24], 30]];
  const order = shuffle([0, 1, 2, 3]); const rnd = (s => () => (s = (s * 9301 + 49297) % 233280) / 233280)(Math.floor(Math.random() * 1000));
  const shots = order.map(k => { const [, , c, sd] = TYPES[k]; return Array.from({ length: 7 }, () => { const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * sd; return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]; }); });
  const pick = {}; let checked = false;
  const draw = () => {
    el.innerHTML = `<div class="w">${head("Classify the targets", "Guess")}<p class="muted">Each target shows seven predictions. The centre is the true value.</p>
     <div class="targets">${order.map((k, i) => `<div class="target ${checked ? (pick[i] == k ? "done" : "") : ""}"><svg viewBox="-60 -60 120 120" width="100%" style="max-width:150px" aria-hidden="true">${[50, 36, 22, 9].map((r, j) => `<circle r="${r}" fill="${j % 2 ? "var(--card3)" : "var(--card2)"}" stroke="var(--line2)"/>`).join("")}<circle r="3" fill="var(--acc)"/>${shots[i].map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="var(--text)" stroke="var(--bg)"/>`).join("")}</svg>
       <select id="tg-${i}" aria-label="Classification for target ${i + 1}" ${checked ? "disabled" : ""}><option value="">Choose…</option>${TYPES.map((t, j) => `<option value="${j}" ${pick[i] == j ? "selected" : ""}>${t[1]}</option>`).join("")}</select>
       ${checked ? `<small style="color:${pick[i] == k ? "var(--acc)" : "var(--bad)"}">${pick[i] == k ? "✓" : "✗ " + TYPES[k][1]}</small>` : ""}</div>`).join("")}</div>
     <div class="row"><button class="btn pri sm" id="tg-check" ${Object.keys(pick).length < 4 || checked ? "disabled" : ""}>Check</button>${checked ? `<button class="btn ghost sm" id="tg-new">New targets</button>` : ""}</div>
     ${checked ? `<div class="why"><b>Accuracy</b> is about the centre of the group (systematic error). <b>Precision</b> is about the spread (random error).</div>` : ""}</div>`;
    $$("select", el).forEach((s, i) => s.onchange = () => { pick[i] = s.value; draw(); });
    $("#tg-check", el).onclick = () => { checked = true; const sc = order.filter((k, i) => pick[i] == k).length; App.rec(b.topic || "accprec", sc / 4); if (sc === 4 && done("targets")) App.addXP(10, "targets", el); draw(); };
    const n = $("#tg-new", el); if (n) n.onclick = () => W.targets(el, b);
  };
  draw();
};

/* ---------- correlation vs causation ---------- */
W.causal = (el, b) => {
  const SC = [
    { a: "Ice cream sales", b: "Sunburn cases", q: "Both rise in summer. Does ice cream cause sunburn?", o: ["Yes, A causes B", "No, B causes A", "No, a hidden variable C (hot, sunny weather) drives both", "It’s pure coincidence"], ans: 2, c: "Sunny weather", w: "Sunny days make people buy ice cream and get sunburnt. The correlation is real, the causal link runs through C." },
    { a: "Shoe size", b: "Reading ability", q: "In a primary school, children with bigger feet read better. Why?", o: ["Big feet cause reading skill", "Reading makes feet grow", "Age drives both", "Measurement error"], ans: 2, c: "Age", w: "Older children have bigger feet and more reading practice." },
    { a: "Firefighters on site", b: "Fire damage", q: "More firefighters at a fire go with more damage. Should we send fewer?", o: ["Yes, they cause damage", "No, the size of the fire drives both", "Yes, it’s causal both ways", "No correlation exists"], ans: 1, c: "Fire size", w: "Big fires cause both more damage and more firefighters. Sending fewer would make it worse." }];
  let i = 0, score = 0, ans = null;
  const draw = () => {
    if (i >= SC.length) { el.innerHTML = `<div class="w">${head("Correlation or causation?", "Scenarios")}<div class="why"><b>${score} / ${SC.length}.</b><div>Before claiming “A causes B”, rule out B→A, a confounder C and chance. Only experiments or careful causal methods can establish causation.</div></div><div><button class="btn sm" id="cr">Again</button></div></div>`; $("#cr", el).onclick = () => { i = 0; score = 0; ans = null; draw(); }; return; }
    const s = SC[i]; const showC = ans !== null && s.ans === 2 || (ans !== null && s.c);
    el.innerHTML = `<div class="w">${head("Correlation or causation?", "Scenario " + (i + 1) + "/" + SC.length)}
      <svg viewBox="0 0 420 150" style="max-width:460px;width:100%;margin:0 auto;display:block" aria-hidden="true">
        <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--info)"/></marker></defs>
        <rect x="10" y="100" width="150" height="40" rx="20" fill="var(--card2)" stroke="var(--acc2)"/><text x="85" y="125" text-anchor="middle" fill="var(--text)" font-size="13">${s.a}</text>
        <rect x="260" y="100" width="150" height="40" rx="20" fill="var(--card2)" stroke="var(--acc2)"/><text x="335" y="125" text-anchor="middle" fill="var(--text)" font-size="13">${s.b}</text>
        <line x1="165" y1="120" x2="255" y2="120" stroke="var(--faint)" stroke-dasharray="4 4"/><text x="210" y="112" text-anchor="middle" fill="var(--muted)" font-size="11">correlated</text>
        ${showC ? `<rect x="135" y="10" width="150" height="40" rx="20" fill="var(--acc-soft)" stroke="var(--acc)"/><text x="210" y="35" text-anchor="middle" fill="var(--acc)" font-size="13" font-weight="600">C: ${s.c}</text><path d="M180 50 L110 98" stroke="var(--info)" stroke-width="2" marker-end="url(#ah)"/><path d="M240 50 L310 98" stroke="var(--info)" stroke-width="2" marker-end="url(#ah)"/>` : `<text x="210" y="40" text-anchor="middle" fill="var(--faint)" font-size="22">?</text>`}
      </svg>
      ${App.questionHTML({ q: s.q, opts: s.o, a: s.ans, why: s.w }, "cs")}<div id="cn" hidden><button class="btn sm">Next →</button></div></div>`;
    if (ans !== null) { App.reveal(el, { q: s.q, opts: s.o, a: s.ans, why: s.w }, ans); $("#cn", el).hidden = false; }
  };
  el.onclick = e => {
    const btn = e.target.closest("[data-cs]"); if (btn && ans === null) { ans = +btn.dataset.cs; const ok = ans === SC[i].ans; if (ok) { score++; App.addXP(3, "corr", btn); } App.rec(b.topic || "corr", ok ? 1 : 0); draw(); return; }
    if (e.target.closest("#cn button")) { i++; ans = null; draw(); }
  };
  draw();
};

/* ---------- ML map ---------- */
W.mlmap = el => {
  const B = { sup: ["Supervised learning", "Target variable should be predicted; the ground truth for the training data is known.", ["Classification · e.g. spam filter", "Regression · e.g. failure prediction"], "w4-2"],
    uns: ["Unsupervised learning", "Identify “structure” in data that is not known upfront.", ["Clustering · e.g. customer types", "Dimensionality reduction · e.g. feature extraction", "Anomaly detection"], "w4-3"],
    semi: ["Semi-supervised learning", "Few labels, lots of unlabelled data.", ["e.g. recommender systems"], null],
    rl: ["Reinforcement learning", "One or multiple agents learn strategies by trying to optimise the “rewards”.", ["e.g. adaptive controls"], "w4-4"] };
  const box = (k, col) => `<button class="card col" data-k="${k}" style="background:var(--bg);cursor:pointer;text-align:left;gap:6px;border-color:${col}"><h3 style="color:${col}">${B[k][0]}</h3>${B[k][2].map(x => `<small>${x}</small>`).join("")}</button>`;
  el.innerHTML = `<div class="w">${head("Classes of machine learning", "Map")}
    <div class="grid" style="grid-template-columns:1fr 1fr 1fr;align-items:center">
      ${box("uns", "#A78BFA")}${box("semi", "var(--muted)")}${box("sup", "var(--acc)")}
      <div></div><div class="card" style="text-align:center;background:var(--card2);border-color:var(--line2)"><h2>Machine<br>Learning</h2></div><div></div>
      <div></div>${box("rl", "#4C9EFF")}<div></div></div>
    <div class="venn-info" id="mm-info"><span class="muted">Tap a branch.</span></div></div>`;
  el.onclick = e => { const b = e.target.closest("[data-k]"); if (!b) return; const x = B[b.dataset.k]; $("#mm-info", el).innerHTML = `<b>${x[0]}</b><div style="margin-top:4px">${x[1]}</div>${x[3] ? `<div style="margin-top:8px"><button class="btn sm" data-go="lesson" data-p="${x[3]}">Open lesson →</button></div>` : ""}`; };
};

/* ---------- Classification or regression game ---------- */
const CR = [["Predict tomorrow’s peak temperature", "R"], ["Detect spam emails", "C"], ["Predict a house price from m² and rooms", "R"], ["Decide whether a component is broken", "C"], ["Predict next month’s energy consumption", "R"], ["Recognise whether a photo shows a cat or a dog", "C"], ["Estimate a student’s exam score from study hours", "R"], ["Decide whether a patient is infected", "C"], ["Forecast the EUR/USD exchange rate", "R"], ["Assign a support ticket to one of 5 departments", "C"], ["Predict how many minutes a delivery takes", "R"], ["Flag a credit-card transaction as fraud / not fraud", "C"], ["Predict a car’s fuel consumption in l/100 km", "R"], ["Predict whether a customer will churn (yes/no)", "C"], ["Estimate the remaining lifetime of a machine in hours", "R"], ["Classify handwritten digits 0–9", "C"], ["Predict the number of visitors at a festival", "R"], ["Decide if a loan applicant will default", "C"]];
W.classreg = (el, b) => {
  let q, i, score, tmr, t0, state = "idle", hist; const N = 10, T = 7000;
  const start = () => { q = shuffle(CR).slice(0, N); i = 0; score = 0; hist = []; state = "play"; next(); };
  const next = () => { if (i >= N) return finish(); t0 = Date.now(); draw(); clearInterval(tmr); tmr = setInterval(() => { const p = 1 - (Date.now() - t0) / T; const bar = $(".timer i", el); if (bar) bar.style.width = Math.max(0, p * 100) + "%"; if (p <= 0) answer(null); }, 80); };
  const answer = a => { if (state !== "play") return; clearInterval(tmr); const ok = a === q[i][1]; if (ok) score++; hist.push(ok); App.rec(b.topic || "supervised", ok ? 1 : 0); state = "fb"; draw(ok, a); setTimeout(() => { state = "play"; i++; next(); }, ok ? 650 : 1400); };
  const finish = () => { state = "end"; clearInterval(tmr); const xp = score * 2 + (score >= 8 ? 10 : 0); App.addXP(xp, "game", el); S().widgets.crBest = Math.max(S().widgets.crBest || 0, score); App.save(); draw(); };
  const draw = (ok, a) => {
    if (state === "idle") { el.innerHTML = `<div class="w">${head("Classification or Regression?", "Speed game", `<small class="muted">Best: ${S().widgets.crBest ?? "–"}/10</small>`)}<p class="muted">10 scenarios, 7 seconds each. Keyboard: <span class="kbd">←</span> classification, <span class="kbd">→</span> regression.</p><div><button class="btn pri" id="cr-go">Start game</button></div></div>`; $("#cr-go", el).onclick = start; return; }
    if (state === "end") { el.innerHTML = `<div class="w">${head("Classification or Regression?", "Result")}<div class="row" style="gap:20px"><div class="result-big" style="color:${score >= 8 ? "var(--acc)" : "var(--warn)"}">${score}/${N}</div><div><p>${score >= 8 ? "Excellent. +10 XP bonus." : "Rule of thumb: a category → classification; a number on a scale → regression."}</p><small class="muted">+${score * 2 + (score >= 8 ? 10 : 0)} XP</small></div></div><div class="qprog">${hist.map(h => `<i class="${h ? "ok" : "no"}"></i>`).join("")}</div><div><button class="btn pri" id="cr-go">Play again</button></div></div>`; $("#cr-go", el).onclick = start; return; }
    const cur = q[i];
    el.innerHTML = `<div class="w">${head("Classification or Regression?", (i + 1) + " / " + N, `<small class="tab">${score} correct</small>`)}
      <div class="timer"><i style="width:100%"></i></div>
      <div class="game-q" style="${state === "fb" ? `border-color:${ok ? "var(--acc)" : "var(--bad)"}` : ""}">${cur[0]}${state === "fb" ? `<div style="font-size:14px;margin-top:10px;color:${ok ? "var(--acc)" : "var(--bad)"}">${ok ? "✓ " : "✗ "}${cur[1] === "C" ? "Classification: the answer is a category." : "Regression: the answer is a continuous number."}</div>` : ""}</div>
      <div class="grid g2"><button class="btn" data-a="C" ${state === "fb" ? "disabled" : ""}>← Classification</button><button class="btn" data-a="R" ${state === "fb" ? "disabled" : ""}>Regression →</button></div></div>`;
  };
  el.onclick = e => { const x = e.target.closest("[data-a]"); if (x) answer(x.dataset.a); };
  const key = e => { if (state !== "play" || !document.body.contains(el)) return; if (e.key === "ArrowLeft") answer("C"); if (e.key === "ArrowRight") answer("R"); };
  window.addEventListener("keydown", key);
  App.cleanup = (old => () => { clearInterval(tmr); window.removeEventListener("keydown", key); old && old(); })(App.cleanup);
  draw();
};

/* ---------- clustering ---------- */
W.cluster = (el, b) => {
  const COLS = ["#8BD126", "#4C9EFF", "#F2B84B", "#A78BFA", "#F0616D"];
  let pts, cents, assign, k = 3, iter = 0, tmr, anomalies = false;
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const gen = () => { const C = [[25, 30], [70, 28], [48, 72]]; pts = []; C.forEach(c => { for (let i = 0; i < 22; i++) pts.push([c[0] + gauss() * 7, c[1] + gauss() * 7]); }); pts.push([92, 88], [8, 90], [95, 55]); pts = pts.map(p => [clamp(p[0], 2, 98), clamp(p[1], 2, 98)]); cents = null; assign = null; iter = 0; };
  const step = () => {
    if (!cents) cents = shuffle(pts).slice(0, k).map(p => p.slice());
    assign = pts.map(p => { let bi = 0, bd = 1e9; cents.forEach((c, j) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2; if (d < bd) { bd = d; bi = j; } }); return bi; });
    const nc = cents.map((c, j) => { const m = pts.filter((_, i) => assign[i] === j); return m.length ? [m.reduce((s, p) => s + p[0], 0) / m.length, m.reduce((s, p) => s + p[1], 0) / m.length] : c; });
    const moved = nc.some((c, j) => Math.abs(c[0] - cents[j][0]) + Math.abs(c[1] - cents[j][1]) > 0.01); cents = nc; iter++; return moved;
  };
  const dist = i => { const c = cents[assign[i]]; return Math.hypot(pts[i][0] - c[0], pts[i][1] - c[1]); };
  const draw = () => {
    const thr = assign ? (() => { const d = pts.map((_, i) => dist(i)).sort((a, b) => a - b); return d[Math.floor(d.length * 0.95)]; })() : 0;
    el.innerHTML = `<div class="w">${head("Run k-means clustering", "Simulation", `<small class="muted tab">${assign ? "iteration " + iter : "unlabelled data"}</small>`)}
      <div class="svgbox"><svg viewBox="0 0 100 100" style="max-width:420px;margin:0 auto;background:var(--bg);border-radius:10px;border:1px solid var(--line)" role="img" aria-label="Scatter plot">
        ${[20, 40, 60, 80].map(v => `<line x1="${v}" y1="0" x2="${v}" y2="100" stroke="var(--line)" stroke-width=".3"/><line x1="0" y1="${v}" x2="100" y2="${v}" stroke="var(--line)" stroke-width=".3"/>`).join("")}
        ${pts.map((p, i) => { const an = anomalies && assign && dist(i) >= thr; return `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${an ? 2.4 : 1.6}" fill="${assign ? COLS[assign[i]] : "var(--muted)"}" ${an ? `stroke="var(--bad)" stroke-width=".8"` : ""} style="transition:fill .4s"/>`; }).join("")}
        ${cents && assign ? cents.map((c, j) => `<g style="transition:transform .5s" transform="translate(${c[0].toFixed(1)} ${c[1].toFixed(1)})"><path d="M-3 -3L3 3M3 -3L-3 3" stroke="${COLS[j]}" stroke-width="1.4"/><circle r="4.2" fill="none" stroke="var(--text)" stroke-width=".4"/></g>`).join("") : ""}
      </svg></div>
      <div class="row"><button class="btn pri sm" id="cl-run">Run clustering</button><button class="btn sm" id="cl-new">New data</button><label class="row" style="gap:8px">k = <input type="range" id="cl-k" min="2" max="5" value="${k}" style="width:110px"><b class="tab">${k}</b></label><label class="row" style="gap:6px"><input type="checkbox" id="cl-an" ${anomalies ? "checked" : ""} ${assign ? "" : "disabled"}>Show anomalies</label></div>
      <p class="muted" style="font-size:14px">${assign ? "The algorithm discovered structure that was not labelled beforehand. Each point joins its nearest centre (×), each centre moves to the mean of its points, repeat until nothing moves. Points far from every centre are anomaly candidates." : "The points carry no labels. Can the algorithm find groups on its own?"}</p></div>`;
    $("#cl-run", el).onclick = () => { clearInterval(tmr); cents = null; iter = 0; step(); draw(); tmr = setInterval(() => { const m = step(); draw(); if (!m || iter > 12) { clearInterval(tmr); if (done("cluster")) App.addXP(10, "cluster", el); } }, 650); };
    $("#cl-new", el).onclick = () => { clearInterval(tmr); gen(); draw(); };
    $("#cl-k", el).oninput = e => { k = +e.target.value; clearInterval(tmr); cents = null; assign = null; draw(); };
    $("#cl-an", el).onchange = e => { anomalies = e.target.checked; draw(); };
  };
  App.cleanup = (old => () => { clearInterval(tmr); old && old(); })(App.cleanup);
  gen(); draw();
};

/* ---------- RL loop ---------- */
W.rlloop = el => {
  const N = { env: ["Environment", "Any dynamic environment the agent can act on through a defined set of possible actions."], interp: ["Interpreter", "Observes the environment and maps its observation into a state for the agent. It also evaluates the reward for the action the agent’s strategy decided."], state: ["State", "An abstracted view on the environment’s state."], reward: ["Reward", "The fitness/quality of the agent’s action."], agent: ["Agent", "Holds the strategy that decides on the next action, based on state and past rewards."], action: ["Action", "Changes the environment, with the goal of maximising the agent’s reward."] };
  el.innerHTML = `<div class="w">${head("The reinforcement learning loop", "Visual")}
    <svg viewBox="0 0 440 250" style="max-width:480px;width:100%;margin:0 auto;display:block" role="img" aria-label="Reinforcement learning loop">
      <defs><marker id="rla" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--muted)"/></marker></defs>
      <path d="M300 40 C 420 40, 420 200, 300 210" fill="none" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#rla)"/>
      <path d="M150 210 C 60 210, 40 130, 80 110" fill="none" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#rla)"/>
      <path d="M140 40 C 90 40, 80 70, 80 88" fill="none" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#rla)"/>
      <path d="M120 125 C 180 140, 200 170, 215 188" fill="none" stroke="var(--acc)" stroke-width="1.5" marker-end="url(#rla)"/>
      <path d="M100 135 C 110 190, 150 205, 200 208" fill="none" stroke="var(--info)" stroke-width="1.5" marker-end="url(#rla)"/>
      ${[["env", 220, 40], ["interp", 80, 110], ["agent", 225, 210]].map(([k, x, y]) => `<g data-k="${k}" style="cursor:pointer"><rect x="${x - 70}" y="${y - 20}" width="140" height="40" rx="9" fill="var(--card2)" stroke="var(--line2)"/><text x="${x}" y="${y + 5}" text-anchor="middle" fill="var(--text)" font-size="14" font-family="Sora,sans-serif">${N[k][0]}</text></g>`).join("")}
      <g data-k="action" style="cursor:pointer"><text x="395" y="128" text-anchor="middle" fill="var(--text)" font-size="12">Action</text></g>
      <g data-k="reward" style="cursor:pointer"><text x="200" y="152" fill="var(--acc)" font-size="12">Reward</text></g>
      <g data-k="state" style="cursor:pointer"><text x="100" y="192" fill="var(--info)" font-size="12">State</text></g>
    </svg><div class="venn-info" id="rl-info"><span class="muted">Tap a part of the loop.</span></div>
    <small class="muted">For inspiration: AWS DeepRacer and OpenAI’s hide-and-seek agents.</small></div>`;
  el.onclick = e => { const g = e.target.closest("[data-k]"); if (!g) return; const n = N[g.dataset.k]; $("#rl-info", el).innerHTML = `<b>${n[0]}</b><div style="margin-top:4px">${n[1]}</div>`; };
};

/* ---------- Grid world ---------- */
W.gridworld = (el, b) => {
  const G = ["S..#", ".#..", "...G"]; const H = 3, Wd = 4;
  const wall = (r, c) => r < 0 || c < 0 || r >= H || c >= Wd || G[r][c] === "#";
  let pos, total, steps, path, over, policy = null, log = [];
  const reset = () => { pos = [0, 0]; total = 0; steps = 0; path = ["0,0"]; over = false; log = []; };
  const MOV = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
  const move = d => {
    if (over) return; const [dr, dc] = MOV[d]; const n = [pos[0] + dr, pos[1] + dc]; steps++;
    if (wall(n[0], n[1])) { total -= 2; log.unshift(`${d}: bumped into a wall (−2)`); }
    else { pos = n; path.push(n.join(",")); if (G[n[0]][n[1]] === "G") { total += 10; over = true; log.unshift(`${d}: reached the goal (+10)`); const opt = total >= 6; App.rec(b.topic || "rl", opt ? 1 : 0.6); if (done("grid")) App.addXP(15, "grid", el); } else { total -= 1; log.unshift(`${d}: move (−1)`); } }
    draw();
  };
  const learn = () => {
    const Q = {}; const q = (s, a) => Q[s + a] || 0; const acts = Object.keys(MOV);
    for (let ep = 0; ep < 400; ep++) { let s = [0, 0]; for (let t = 0; t < 40; t++) {
      const a = Math.random() < 0.2 ? acts[Math.floor(Math.random() * 4)] : acts.reduce((x, y) => q(s, y) > q(s, x) ? y : x);
      const n = [s[0] + MOV[a][0], s[1] + MOV[a][1]]; let r, ns = s, end = false;
      if (wall(n[0], n[1])) r = -2; else { ns = n; if (G[n[0]][n[1]] === "G") { r = 10; end = true; } else r = -1; }
      const best = end ? 0 : Math.max(...acts.map(x => q(ns, x)));
      Q[s + a] = q(s, a) + 0.5 * (r + 0.95 * best - q(s, a)); s = ns; if (end) break; } }
    policy = {}; for (let r = 0; r < H; r++) for (let c = 0; c < Wd; c++) { if (G[r][c] === "#" || G[r][c] === "G") continue; policy[r + "," + c] = acts.reduce((x, y) => q([r, c], y) > q([r, c], x) ? y : x); }
    draw();
  };
  const ARW = { up: "↑", down: "↓", left: "←", right: "→" };
  const draw = () => {
    el.innerHTML = `<div class="w">${head("Guide the agent to G", "Mini game", `<span class="chip ${over ? "acc" : ""} tab">Reward ${total >= 0 ? "+" : ""}${total} · ${steps} moves</span>`)}
     <p class="muted">Goal +10 · wall −2 · normal move −1. Use the buttons or arrow keys. Can you find the path with the highest total reward?</p>
     <div class="row" style="align-items:flex-start;gap:20px">
      <div class="grid-world" style="grid-template-columns:repeat(${Wd},1fr)">${G.map((row, r) => row.split("").map((ch, c) => { const k = r + "," + c; return `<div class="cell ${ch === "#" ? "wall" : ""} ${ch === "G" ? "goal" : ""} ${path.includes(k) ? "path" : ""}">${pos[0] === r && pos[1] === c ? `<div class="agent"></div>` : ch === "G" ? "G" : ch === "S" ? "S" : policy && policy[k] ? `<span style="color:var(--acc);font-size:18px">${ARW[policy[k]]}</span>` : ""}</div>`; }).join("")).join("")}</div>
      <div class="col" style="gap:10px"><div class="pad"><span></span><button class="btn" data-m="up" aria-label="Up">↑</button><span></span><button class="btn" data-m="left" aria-label="Left">←</button><button class="btn" data-m="down" aria-label="Down">↓</button><button class="btn" data-m="right" aria-label="Right">→</button></div>
       <div class="row"><button class="btn sm" id="gw-reset">Reset</button><button class="btn sm ${over ? "pri" : ""}" id="gw-learn">Let an agent learn</button></div>
       <div style="font:12px var(--f-mono);color:var(--muted);max-height:96px;overflow:auto">${log.slice(0, 6).join("<br>")}</div></div></div>
     ${over ? `<div class="why ${total >= 6 ? "" : "bad"}"><b>${total >= 6 ? "Optimal: total reward +6." : "Goal reached with " + total + ". The best possible is +6."}</b><div>Each move costs −1, so shorter paths win. An RL agent learns this by trial and error: it tries actions, sees the rewards and gradually prefers moves that lead to higher total reward.</div></div>` : ""}
     ${policy ? `<div class="why"><b>Learned policy (Q-learning, 400 episodes).</b><div>The arrows show the action the agent now considers best in each cell. Nobody told it the path; it found it from rewards alone.</div></div>` : ""}</div>`;
    $("#gw-reset", el).onclick = () => { reset(); draw(); };
    $("#gw-learn", el).onclick = learn;
  };
  el.onclick = e => { const m = e.target.closest("[data-m]"); if (m) move(m.dataset.m); };
  const key = e => { if (!document.body.contains(el)) return; const m = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" }[e.key]; if (m && el.matches(":hover, :focus-within")) { e.preventDefault(); move(m); } };
  window.addEventListener("keydown", key); App.cleanup = (old => () => { window.removeEventListener("keydown", key); old && old(); })(App.cleanup);
  reset(); draw();
};

/* ---------- Airplane survivorship challenge ---------- */
W.airplane = (el, b) => {
  const SEC = {
    A: { d: "M28 162 L128 150 L128 196 L28 186 Z", holes: 16, name: "Left wing" },
    E: { d: "M372 162 L272 150 L272 196 L372 186 Z", holes: 15, name: "Right wing" },
    C: { d: "M128 140 L272 140 L272 212 L128 212 Z", holes: 24, name: "Centre fuselage & inner wings" },
    B: { d: "M136 92 L162 92 L162 170 L136 170 Z", holes: 0, name: "Left engine" },
    D: { d: "M238 92 L264 92 L264 170 L238 170 Z", holes: 0, name: "Right engine" },
    F: { d: "M186 212 L214 212 L212 298 L188 298 Z", holes: 0, name: "Rear fuselage" },
    G: { d: "M118 298 L282 298 L276 330 L124 330 Z", holes: 11, name: "Tail / elevators" } };
  const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(42);
  const holes = []; const box = { A: [34, 124, 156, 186], E: [276, 366, 156, 186], C: [132, 268, 146, 208], G: [126, 274, 302, 326] };
  Object.entries(box).forEach(([k, [x0, x1, y0, y1]]) => { for (let i = 0; i < SEC[k].holes; i++) { let x, y; do { x = x0 + rnd() * (x1 - x0); y = y0 + rnd() * (y1 - y0); } while (k === "C" && ((x > 132 && x < 166 && y < 172) || (x > 234 && x < 268 && y < 172))); holes.push([x, y]); } });
  const sel = new Set(); let submitted = false;
  const draw = () => {
    const right = ["B", "D", "F"]; const sc = submitted ? Object.keys(SEC).filter(k => right.includes(k) === sel.has(k)).length : 0;
    el.innerHTML = `<div class="w">${head("Where would you add armor?", "Challenge 1")}
      <p class="muted">Red dots: accumulated hits on all airplanes that <b>returned</b>. Tap the sectors (A–G) you would reinforce, then submit.</p>
      <div class="svgbox"><svg viewBox="0 0 400 350" style="max-width:460px;margin:0 auto;background:#EEF1F4;border-radius:12px" role="img" aria-label="Airplane top view with sectors A to G">
        <path d="M200 14 C 212 30 214 60 214 140 L214 298 L200 336 L186 298 L186 140 C186 60 188 30 200 14Z" fill="#DCE1E7" stroke="#2A3340" stroke-width="2"/>
        ${Object.entries(SEC).map(([k, s]) => `<path d="${s.d}" data-s="${k}" fill="${sel.has(k) ? (submitted ? (["B", "D", "F"].includes(k) ? "rgba(121,192,0,.55)" : "rgba(240,97,109,.45)") : "rgba(76,158,255,.45)") : submitted && ["B", "D", "F"].includes(k) ? "rgba(121,192,0,.25)" : "#DCE1E7"}" stroke="#2A3340" stroke-width="2" style="cursor:pointer"/>`).join("")}
        <line x1="149" y1="80" x2="149" y2="92" stroke="#2A3340" stroke-width="2"/><line x1="138" y1="80" x2="160" y2="80" stroke="#2A3340" stroke-width="3"/>
        <line x1="251" y1="80" x2="251" y2="92" stroke="#2A3340" stroke-width="2"/><line x1="240" y1="80" x2="262" y2="80" stroke="#2A3340" stroke-width="3"/>
        ${holes.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="#C8102E" pointer-events="none"/>`).join("")}
        ${Object.entries({ A: [70, 176], B: [149, 135], C: [200, 196], D: [251, 135], E: [330, 176], F: [200, 262], G: [240, 318] }).map(([k, [x, y]]) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="16" font-weight="700" fill="#10151C" pointer-events="none" font-family="Sora,sans-serif">${k}</text>`).join("")}
      </svg></div>
      <div class="plane-legend">${Object.keys(SEC).map(k => `<button class="chip ${sel.has(k) ? "on" : ""}" data-s="${k}" ${submitted ? "disabled" : ""}>${k} · ${SEC[k].name}</button>`).join("")}</div>
      ${submitted ? `<div class="why ${sc === 7 ? "" : "bad"}"><b>${sc === 7 ? "Exactly right: B, D and F." : "The answer: B, D and F (engines and rear fuselage)."}</b>
         <div>This is <b>survivorship bias</b>. The planes you see are the ones that came back. Many holes in the wings mean a plane <i>can</i> take hits there and still return. Planes hit in the engines or the rear fuselage mostly didn’t return, so those holes never show up in the data. The missing data is the most important data.</div>
         <div class="muted">Historical note: the statistician Abraham Wald made this argument for the US Navy in WWII.</div></div>` : ""}
      <div class="row"><button class="btn pri sm" id="ap-go" ${submitted || !sel.size ? "disabled" : ""}>Submit choice</button>${submitted ? `<button class="btn ghost sm" id="ap-re">Try again</button>` : ""}</div></div>`;
    $("#ap-go", el).onclick = () => { submitted = true; const s = Object.keys(SEC).filter(k => ["B", "D", "F"].includes(k) === sel.has(k)).length; App.rec(b.topic || "bias", s === 7 ? 1 : s >= 5 ? 0.4 : 0); S().widgets.airplane = true; App.save(); if (done("airplane-xp")) App.addXP(s === 7 ? 25 : 10, "airplane", el); App.checkAch(); draw(); };
    const re = $("#ap-re", el); if (re) re.onclick = () => { submitted = false; sel.clear(); draw(); };
  };
  el.onclick = e => { const s = e.target.closest("[data-s]"); if (!s || submitted) return; const k = s.dataset.s; sel.has(k) ? sel.delete(k) : sel.add(k); draw(); };
  draw();
};

/* ---------- Bias classification cards ---------- */
W.biascards = (el, b) => {
  const T = ["Survivorship bias", "Availability bias", "Frequency illusion"];
  const C = [["Business", "A consultant studies 20 hugely successful companies and concludes that bold CEOs cause success.", 0, "Failed companies with equally bold CEOs aren’t in the sample."],
    ["Career success", "Blog posts about college drop-outs who became billionaires make dropping out look like a good strategy.", 0, "You only hear about the drop-outs who made it."],
    ["Customer acquisition", "To learn why customers love the product, the team only interviews customers who stayed for more than a year.", 0, "Churned customers, who might reveal problems, are excluded."],
    ["Medical research", "A study recruits only patients from one university hospital because their records are easy to access.", 1, "Convenient data isn’t representative of all patients."],
    ["ML datasets", "A face-recognition model is trained on photos scraped from the easiest available source, mostly of young adults.", 1, "The model will be worse on groups missing from the easy data."],
    ["Analysis", "After reading about a data breach, an analyst suddenly sees “breach risks” in every log file this week.", 2, "Recently noticed things feel more frequent than they are."]];
  const order = shuffle(C.map((_, i) => i)); let i = 0, score = 0, fb = null;
  const draw = () => {
    if (i >= order.length) { el.innerHTML = `<div class="w">${head("Spot the bias", "Classify")}<div class="why"><b>${score} / ${C.length} correct.</b><div>Key message from the lecture: be aware and always check your data against possible bias.</div></div><div><button class="btn sm" id="bc-re">Again</button></div></div>`; $("#bc-re", el).onclick = () => W.biascards(el, b); if (score >= 5 && done("biascards")) App.addXP(15, "bias", el); return; }
    const c = C[order[i]];
    el.innerHTML = `<div class="w">${head("Spot the bias", (i + 1) + " / " + C.length)}<div class="card" style="background:var(--bg)"><span class="eyebrow">${c[0]}</span><p style="margin-top:6px">${c[1]}</p></div>
      <div class="grid g3">${T.map((t, j) => `<button class="opt ${fb !== null ? (j === c[2] ? "ok" : fb === j ? "no" : "") : ""}" data-b="${j}" ${fb !== null ? "disabled" : ""}><span>${t}</span></button>`).join("")}</div>
      ${fb !== null ? `<div class="why ${fb === c[2] ? "" : "bad"}"><b>${T[c[2]]}.</b><div>${c[3]}</div></div><div><button class="btn sm" id="bc-n">Next →</button></div>` : ""}</div>`;
    const n = $("#bc-n", el); if (n) n.onclick = () => { i++; fb = null; draw(); };
  };
  el.onclick = e => { const x = e.target.closest("[data-b]"); if (!x || fb !== null) return; fb = +x.dataset.b; const ok = fb === C[order[i]][2]; if (ok) score++; App.rec(b.topic || "bias", ok ? 1 : 0); draw(); };
  draw();
};

/* ---------- Lifecycle ---------- */
W.lifecycle = (el, b) => {
  const ST = [["Define problem", "biz", "Business understanding: what decision should the result support? Define objectives and success metrics with stakeholders."],
    ["Collect data", "data", "Data source: on-premises vs cloud, database vs files. Pipeline: streaming vs batch."],
    ["Understand data", "data", "Which columns, units, time ranges? Is the data representative (bias!)?"],
    ["Clean data", "data", "Wrangling and cleaning: missing values, wrong types, duplicates, outliers. Data validation."],
    ["Explore data", "data", "Descriptive statistics and visualisation. Structured vs unstructured data."],
    ["Feature engineering", "model", "Transform, binning; temporal, text and image features; feature selection."],
    ["Train model", "model", "Algorithms, ensembles, parameter tuning, retraining, model management."],
    ["Evaluate model", "model", "Cross validation, model reporting, A/B testing."],
    ["Deploy", "dep", "Model store, web services, intelligent applications."],
    ["Monitor", "dep", "Scoring and performance monitoring: detect when live data drifts away from training data."],
    ["Improve", "biz", "Customer acceptance, then loop back. Projects are seldom acyclic and linear."]];
  const COL = { biz: "#F2B84B", data: "#4C9EFF", model: "#A78BFA", dep: "#8BD126" }; const GRP = { biz: "Business understanding", data: "Data acquisition & understanding", model: "Modeling", dep: "Deployment" };
  const SCN = [["12% of the attendance values are empty and some are typed as text.", 3], ["Stakeholders ask whether the model should also cover part-time students.", 0], ["Accuracy dropped after data from the new semester came in.", 9], ["You create a feature “hours per week” from raw study-session logs.", 5], ["You compare the model on held-out data with 5-fold cross validation.", 7]];
  let sel = null, si = 0, ans = null, score = 0;
  const cx = 170, cy = 170, R = 128;
  const draw = () => {
    const s = SCN[si];
    el.innerHTML = `<div class="w">${head("The data science lifecycle", "Interactive")}
     <div class="row" style="align-items:flex-start;gap:20px">
      <svg viewBox="0 0 340 340" style="width:100%;max-width:340px;flex:1 1 280px" role="img" aria-label="Lifecycle circle">
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--line2)" stroke-dasharray="3 5"/>
        <text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="var(--muted)" font-size="12">seldom linear —</text><text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="var(--muted)" font-size="12">loops are normal</text>
        ${ST.map((st, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / ST.length; const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a); const on = sel === i; return `<g data-i="${i}" style="cursor:pointer" tabindex="0" role="button" aria-label="${st[0]}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${on ? 20 : 17}" fill="${on ? COL[st[1]] : "var(--card2)"}" stroke="${COL[st[1]]}" stroke-width="2"/><text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700" fill="${on ? "#0B0F14" : "var(--text)"}">${i + 1}</text></g>`; }).join("")}
      </svg>
      <div class="col" style="flex:1 1 240px;gap:10px"><div class="lc-info">${sel === null ? `<span class="muted">Tap a stage.</span>` : `<span class="eyebrow" style="color:${COL[ST[sel][1]]}">${GRP[ST[sel][1]]}</span><h3 style="margin:4px 0 6px">${sel + 1}. ${ST[sel][0]}</h3><div>${ST[sel][2]}</div>`}</div>
       <div class="row" style="gap:6px;font-size:12px">${Object.keys(COL).map(k => `<span class="chip"><i style="width:8px;height:8px;border-radius:50%;background:${COL[k]};display:inline-block"></i>${GRP[k]}</span>`).join("")}</div></div></div>
     <div class="divider"></div>
     ${si < SCN.length ? `<div class="col"><span class="eyebrow">Scenario ${si + 1} / ${SCN.length} · which stage are you in?</span><p>${s[0]}</p>
       <div class="row" style="gap:6px">${ST.map((st, i) => `<button class="chip ${ans !== null ? (i === s[1] ? "acc" : i === ans ? "bad" : "") : ""}" data-a="${i}" ${ans !== null ? "disabled" : ""}>${i + 1} ${st[0]}</button>`).join("")}</div>
       ${ans !== null ? `<div class="row"><span style="color:${ans === s[1] ? "var(--acc)" : "var(--bad)"}">${ans === s[1] ? "Correct." : "It’s “" + ST[s[1]][0] + "”."}</span><button class="btn sm" id="lc-n">Next →</button></div>` : ""}</div>`
      : `<div class="why"><b>${score} / ${SCN.length} scenarios correct.</b><div>In practice you jump between stages; the circle is a map, not a sequence.</div></div>`}</div>`;
    const n = $("#lc-n", el); if (n) n.onclick = () => { si++; ans = null; draw(); if (si >= SCN.length && score >= 4 && done("lifecycle")) App.addXP(15, "lc", el); };
  };
  el.onclick = e => { const g = e.target.closest("[data-i]"); if (g) { sel = +g.dataset.i; draw(); return; } const a = e.target.closest("[data-a]"); if (a && ans === null) { ans = +a.dataset.a; const ok = ans === SCN[si][1]; if (ok) score++; App.rec(b.topic || "lifecycle", ok ? 1 : 0); draw(); } };
  draw();
};

/* ---------- ML methods preview ---------- */
W.methods = el => {
  const M = [["k-Nearest Neighbours", "Classifies a point by a majority vote of its k closest labelled neighbours.", "Look at your neighbours and join the most common group.", "Small, low-dimensional data; a quick baseline.", "No training, easy to explain.", "Slow on big data; needs feature scaling; suffers in high dimensions."],
    ["Decision trees", "A sequence of yes/no questions on features that ends in a prediction.", "A flowchart: hours > 4? → attendance > 70%? → pass.", "Tabular data, when you need interpretable rules.", "Readable, handles mixed feature types.", "Overfits easily; ensembles (random forests, boosting) fix this."],
    ["k-Means clustering", "Unsupervised: splits data into k groups around moving centres.", "Place k centres, assign points, move centres, repeat.", "Customer segmentation, compression.", "Simple and fast.", "You must choose k; assumes round clusters."],
    ["Naive Bayes", "Probabilistic classifier using Bayes’ theorem with the assumption that features are independent given the class.", "Spam: each word shifts the odds a little.", "Text classification, spam filters.", "Very fast, works with little data.", "The independence assumption is rarely true."]];
  let k = 0;
  const draw = () => { const m = M[k]; el.innerHTML = `<div class="w">${head("Methods from the syllabus", "Preview")}<div class="row" style="gap:6px">${M.map((x, i) => `<button class="chip ${i === k ? "on" : ""}" data-k="${i}">${x[0]}</button>`).join("")}</div>
    <div class="grid g2"><div class="col"><div><span class="eyebrow">What is it?</span><p>${m[1]}</p></div><div><span class="eyebrow">Intuition</span><p>${m[2]}</p></div><div><span class="eyebrow">When to use</span><p>${m[3]}</p></div></div>
    <div class="col"><div><span class="eyebrow" style="color:var(--acc)">Strengths</span><p>${m[4]}</p></div><div><span class="eyebrow" style="color:var(--bad)">Weaknesses</span><p>${m[5]}</p></div></div></div></div>`; };
  el.onclick = e => { const c = e.target.closest("[data-k]"); if (c) { k = +c.dataset.k; draw(); } };
  draw();
};
})();
