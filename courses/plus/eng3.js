/* ENG3 · Plus: interactive "describing trends" lab, percentage calculator, step animations (chart description, presentation
   structure, story arc, SWOT, active listening), worked examples, extra questions and flashcards.
   All datasets are fictional practice data. The homework descriptions (Netflix / OTT) must be your own work without AI,
   so none of the examples here use those datasets. */
(function () {
const C = window.STUDYOS_CALC = window.STUDYOS_CALC || {};
const FIG = window.STUDYOS_FIG = window.STUDYOS_FIG || {};
const FX = window.FX; if (!FX) return;
const { svg, g, t, tl, r, box, l, p, c } = FX;
const en = (n, d = 1) => Number(n).toLocaleString("en-GB", { maximumFractionDigits: d });

/* ---------- 1 · Interactive trend lab ---------- */
const YEARS = [2021, 2022, 2023, 2024, 2025, 2026];
const series = (s, e, shape) => {
  const lin = YEARS.map((_, i) => s + (e - s) * i / 5);
  if (shape === "peak") { const top = Math.min(100, Math.max(s, e) + 12 + Math.abs(e - s) * 0.3); return [s, s + (top - s) * 0.45, s + (top - s) * 0.8, top, top - (top - e) * 0.55, e]; }
  if (shape === "dip") { const low = Math.max(2, Math.min(s, e) - 8 - Math.abs(e - s) * 0.15); return [s, s - (s - low) * 0.45, s - (s - low) * 0.8, low, low + (e - low) * 0.55, e]; }
  if (shape === "fluct") { const a = Math.max(5, (s + e) * 0.09), off = [0, 1, -0.8, 1.1, -0.7, 0]; return lin.map((v, i) => Math.max(1, Math.min(100, v + a * off[i]))); }
  return lin;
};
const strength = pct => { const a = Math.abs(pct); return a < 3 ? null : a < 10 ? ["slight", "slightly"] : a < 25 ? ["moderate", "moderately"] : a < 50 ? ["significant", "significantly"] : ["dramatic", "dramatically"]; };
FIG["eng3-trends"] = { title: "Trend lab: move the sliders, read the matching English",
  svg: () => svg(640, 250, ""),
  ui: () => `<div class="seg"><label><input type="radio" name="e3t-u" value="rev" checked> Revenue (€m)</label><label><input type="radio" name="e3t-u" value="share"> Market share (%)</label></div>
    <div class="seg"><label><input type="radio" name="e3t-s" value="steady" checked> steady change</label><label><input type="radio" name="e3t-s" value="peak"> peak</label><label><input type="radio" name="e3t-s" value="dip"> dip</label><label><input type="radio" name="e3t-s" value="fluct"> fluctuate</label></div>
    <div class="seg"><label><input type="radio" name="e3t-t" value="past" checked> finished period (past simple)</label><label><input type="radio" name="e3t-t" value="perf"> up to now (present perfect)</label></div>
    <label><span>Value in 2021: <b data-o="s"></b></span><input type="range" min="10" max="90" step="1" value="40" data-i="s"></label>
    <label><span>Value in 2026: <b data-o="e"></b></span><input type="range" min="10" max="90" step="1" value="58" data-i="e"></label>
    <div class="fig-out" data-o="res"></div>`,
  cap: "Fictional data. Watch the prepositions: <b>from</b> = old value, <b>to</b> = new value, <b>by</b> = size of the change, <b>at</b> = a level, <b>of</b> after a noun (a rise <b>of</b> 10 %).",
  update: root => {
    const q = s => root.querySelector(s), val = n => (q(`input[name=${n}]:checked`) || {}).value;
    const share = val("e3t-u") === "share", shape = val("e3t-s"), perf = val("e3t-t") === "perf";
    const s = +q("[data-i=s]").value, e = +q("[data-i=e]").value;
    const f = v => share ? `${en(v, 0)}%` : `€${en(v, 0)}m`;
    q("[data-o=s]").textContent = f(s); q("[data-o=e]").textContent = f(e);
    const ys = series(s, e, shape).map(v => Math.round(v));
    /* chart */
    const X = i => 80 + i * 104, Y = v => 214 - v * 1.9;
    const grid = [0, 25, 50, 75, 100].map(v => `<line x1="60" x2="620" y1="${Y(v)}" y2="${Y(v)}" class="fx-ln thin"/>` + t(54, Y(v) + 4, share ? v + "%" : "€" + v + "m", { a: "end", fs: 10.5, cls: "fx-sub" })).join("");
    const xl = YEARS.map((y, i) => t(X(i), 234, y, { fs: 11, cls: "fx-sub" })).join("");
    const d = ys.map((v, i) => (i ? "L" : "M") + X(i) + " " + Y(v)).join(" ");
    const ext = shape === "peak" ? 3 : shape === "dip" ? 3 : -1;
    const dots = ys.map((v, i) => c(X(i), Y(v), i === 0 || i === 5 || i === ext ? 5.5 : 3.5, { cls: i === ext ? "fx-acc fx-pulse" : "fx-acc" }) +
      (i === 0 || i === 5 || i === ext ? t(X(i), Y(v) - 10, f(v), { fs: 11.5, fw: 700 }) : "")).join("");
    q(".fig-stage").innerHTML = svg(640, 250, grid + xl + `<path d="${d}" class="fx-ln acc"/>` + dots + t(620, 18, share ? "Market share" : "Revenue", { a: "end", fs: 11, fw: 600, cls: "fx-sub" }));
    /* language */
    const subj = share ? "Market share" : "Revenue", lc = share ? "market share" : "revenue";
    const diff = e - s, pct = diff / s * 100, st = strength(pct), up = diff > 0;
    const absCh = share ? `${en(Math.abs(diff), 0)} percentage points` : `€${en(Math.abs(diff), 0)}m`;
    const verbP = up ? "rose" : "fell", verbPP = up ? "has risen" : "has fallen", noun = up ? "rise" : "fall", verbBy = up ? "increased" : "decreased";
    const lines = [];
    if (!st) {
      lines.push(perf ? `${subj} <b>has remained stable</b> since 2021 and now <b>stands at</b> ${f(e)}.` : `${subj} <b>remained stable</b> at around ${f(e)} between 2021 and 2026.`);
      lines.push(perf ? `There <b>has been</b> hardly any change in ${lc} since 2021.` : `There was hardly any change: ${lc} <b>levelled off</b> at around ${f(e)}.`);
    } else {
      lines.push(perf ? `${subj} <b>${verbPP} ${st[1]}</b> since 2021 and now <b>stands at</b> ${f(e)}.` : `${subj} <b>${verbP} ${st[1]}</b> <b>from</b> ${f(s)} in 2021 <b>to</b> ${f(e)} in 2026.`);
      lines.push(perf ? `There <b>has been</b> a <b>${st[0]} ${noun} of</b> ${share ? absCh : en(Math.abs(pct), 0) + "%"} in ${lc} since 2021.` : `There was a <b>${st[0]} ${noun} of</b> ${share ? absCh : en(Math.abs(pct), 0) + "%"} in ${lc} between 2021 and 2026.`);
      lines.push(`${subj} ${perf ? "has " + verbBy : verbBy} <b>by</b> ${absCh}` + (share ? ` (a relative ${up ? "increase" : "decrease"} of ${en(Math.abs(pct), 0)}%, <i>not</i> ${en(Math.abs(diff), 0)}%).` : ` (${up ? "+" : "−"}${en(Math.abs(pct), 0)}%).`));
      if (Math.abs(pct) >= 50) lines.push(`Stronger verb: ${lc} ${perf ? "has " : ""}<b>${up ? (perf ? "soared" : "soared") : (perf ? "plummeted" : "plummeted")}</b>.` + (up && e >= 2 * s ? ` It ${perf ? "has " : ""}${e >= 3 * s ? "more than tripled" : e === 2 * s ? "doubled" : "more than doubled"}.` : !up && e * 2 <= s ? ` It ${e * 2 === s ? (perf ? "has halved" : "halved") : (perf ? "has fallen" : "fell") + " by more than half"}.` : ""));
    }
    const yPk = ys[3], last = perf ? "has since" : "then";
    if (shape === "peak") lines.push(`${subj} <b>peaked at</b> ${f(yPk)} in 2024 and ${last} <b>${perf ? "fallen back" : "fell back"} to</b> ${f(e)}.` + (perf ? " <small>(2024 is a finished time → <i>peaked</i> stays in the past simple.)</small>" : ""));
    if (shape === "dip") lines.push(`${subj} <b>dipped to a low of</b> ${f(yPk)} in 2024 and ${last} <b>recovered to</b> ${f(e)}.` + (perf ? " <small>(2024 is a finished time → <i>dipped</i> stays in the past simple.)</small>" : ""));
    if (shape === "fluct") { const lo = Math.min(...ys), hi = Math.max(...ys); lines.push(`${subj} <b>${perf ? "has fluctuated" : "fluctuated"} between</b> ${f(lo)} <b>and</b> ${f(hi)}${perf ? " since 2021" : ", ending the period at " + f(e)}.`); }
    if (shape === "steady" && st) lines.push(`The ${up ? "increase" : "decrease"} was <b>steady</b>: every year was ${up ? "higher" : "lower"} than the one before.`);
    q("[data-o=res]").innerHTML = lines.map(x => "• " + x).join("<br>");
  } };

/* ---------- 2 · Model chart description ---------- */
const DN = [12, 18, 27, 25, 33, 41];
const dX = i => 90 + i * 88, dY = v => 230 - v * 4.2;
FIG["eng3-chartdesc"] = { title: "Describing a chart in five moves",
  svg: () => svg(640, 300,
    g({ hl: 0 }, FX.axes(60, 30, 520, 210, "", "") + t(66, 22, "Subscriptions at DataNest (thousands)", { a: "start", fs: 11.5, fw: 700 })) +
    DN.map((_, i) => t(dX(i), 256, 2021 + i, { fs: 11, cls: "fx-sub" })).join("") +
    [10, 20, 30, 40].map(v => t(54, dY(v) + 4, v, { a: "end", fs: 10.5, cls: "fx-sub" }) + `<line x1="60" x2="580" y1="${dY(v)}" y2="${dY(v)}" class="fx-ln thin"/>`).join("") +
    `<path d="${DN.map((v, i) => (i ? "L" : "M") + dX(i) + " " + dY(v)).join(" ")}" class="fx-ln acc"/>` +
    DN.map((v, i) => c(dX(i), dY(v), 4, { cls: "fx-acc" }) + t(dX(i), dY(v) - 9, v, { fs: 10.5, fw: 600 })).join("") +
    g({ on: "2" }, p(`M${dX(1)} ${dY(18) + 18} L${dX(2)} ${dY(27) + 18}`, { cls: "ok", arrow: true }) + t(dX(1) + 52, dY(18) + 40, "+9 (+50%)", { fs: 11, fw: 700, cls: "t-ok" })) +
    g({ on: "3" }, c(dX(3), dY(25), 12, { cls: "fx-ghost" }) + t(dX(3), dY(25) + 30, "slight dip", { fs: 11, fw: 700, cls: "t-bad" })) +
    g({ on: "4" }, c(dX(5), dY(41), 12, { cls: "fx-ghost" }) + t(dX(5) - 16, dY(41) + 4, "all-time high", { a: "end", fs: 11, fw: 700, cls: "t-acc" })) +
    g({ on: "5" }, `<path d="M${dX(5)} ${dY(41)} L${dX(5) + 50} ${dY(50)}" class="fx-ln acc dash"/>` + c(dX(5) + 50, dY(50), 4, { cls: "fx-ghost" }) + t(dX(5) + 44, dY(50) - 10, "2027?", { a: "end", fs: 11, fw: 700, cls: "t-acc" })) +
    g({ on: "1" }, p(`M${dX(0)} ${dY(12) + 20} L${dX(5)} ${dY(41) + 20}`, { cls: "ok dash", arrow: true }) + t(330, 210, "overall: more than tripled", { fs: 11.5, fw: 700, cls: "t-ok" }))),
  steps: [
    "<b>1 · Introduce</b> the chart: type, topic, unit, period. <i>The line graph shows the number of subscriptions at DataNest, in thousands, between 2021 and 2026.</i>",
    "<b>2 · Overall trend</b> first, in one sentence: <i>Overall, subscriptions rose dramatically and more than tripled, from 12,000 to 41,000.</i>",
    "<b>3 · Key feature</b>: select, don't list every number. <i>The sharpest increase came between 2022 and 2023, when subscriptions jumped by 9,000, or 50 per cent.</i>",
    "<b>4 · Exception</b>: <i>There was a slight dip in 2024, to 25,000.</i> “slight” fits: −2,000 is about −7 per cent.",
    "<b>5 · End point</b>: <i>Subscriptions then recovered and climbed steadily to an all-time high of 41,000 in 2026.</i>",
    "<b>Optional · Forecast</b> with careful language: <i>If this trend continues, subscriptions are expected to reach around 50,000 in 2027.</i> Use <i>may, is likely to, is expected to</i>."
  ] };

/* ---------- 3 · Presentation structure ---------- */
const PRES = [["Opening", "Good morning, everyone. My name is … Have you ever|wondered why …? (hook / rhetorical question)"], ["Purpose & outline", "Today I'd like to talk about … First, … then, …|and finally …"],
  ["Body + visuals", "As you can see in this drawing, … · This drawing|shows …"], ["Signposting", "So much for … Let's now move on to …|This brings me to …"], ["Activity", "Now it's your turn: talk to your neighbour for one|minute about … (at least one activity is required)"],
  ["Summary", "To sum up, … · Let's recap what we have heard|so far: …"], ["Conclusion & Q&A", "I'd like to conclude by emphasizing … Are there any|questions? · That's a good question, let me think …"]];
FIG["eng3-pres"] = { title: "The shape of a 5–7 minute podcast presentation",
  svg: () => svg(640, 300,
    PRES.map(([h], i) => box(14, 8 + i * 41, 196, 34, h, { cls: i === 4 ? "fx-ok" : "fx-soft", fs: 12, hl: i }) + (i < 6 ? l(112, 42 + i * 41, 112, 49 + i * 41, { cls: "thin" }) : "")).join("") +
    PRES.map(([h, s], i) => g({ on: String(i) }, l(212, 25 + i * 41, 236, 25 + i * 41, { cls: "acc", arrow: true, acc: true }) +
      r(238, Math.min(196, Math.max(8, i * 41 - 20)), 392, 96, { cls: "fx-card" }) + t(254, Math.min(196, Math.max(8, i * 41 - 20)) + 24, h, { a: "start", fw: 700, cls: "t-acc" }) +
      tl(254, Math.min(196, Math.max(8, i * 41 - 20)) + 60, s, { a: "start", fs: 12, lh: 17 }))).join("")),
  steps: [
    "<b>Opening</b>: greet, introduce yourself and hook the audience, e.g. with a rhetorical question or a surprising fact from your podcast.",
    "<b>Purpose and outline</b>: say what the talk is about and how it is organised. The audience relaxes when it knows the route.",
    "<b>Body with visuals</b>: your 4–8 A3 drawings (or one A0 poster) carry the content. Refer to them explicitly.",
    "<b>Signposting</b> between parts tells the audience where you are. Avoid German “So, …” at the start: use “Right, …” or “OK, …”.",
    "<b>Activity</b>: the task requires at least one activity and questions for your colleagues. Plan it with a clear instruction and a time limit.",
    "<b>Summary</b>: repeat the two or three key ideas, not every detail.",
    "<b>Conclusion and questions</b>: end with a clear message, then invite questions. A buying-time gambit helps with tricky ones. Remember: cue cards with keywords only."
  ] };

/* ---------- 4 · Story arc ---------- */
const ARC = [[60, 230, "Setting &|characters"], [170, 175, "Conflict"], [290, 120, "Rising|tension"], [410, 50, "Climax"], [530, 160, "Resolution"]];
FIG["eng3-story"] = { title: "Story arc: from setting to resolution",
  svg: () => svg(640, 300,
    g({ st: 0 }, p("M40 250 L60 230 L170 175 L290 120 L410 50 L530 160 L610 190", { cls: "acc fx-draw" })) +
    ARC.map(([x, y, s], i) => g({ st: i }, c(x, y, 6, { cls: "fx-acc" }) + tl(x, y + (i === 3 ? -22 : 30), s, { fs: 12, fw: 700, lh: 14 }))).join("") +
    g({ on: "0" }, box(14, 8, 290, 62, "“It was 11 p.m., the night before go-live.|Only Mia and I were still in the office.”", { cls: "fx-card", fs: 11.5, lh: 16 })) +
    g({ on: "1" }, box(14, 8, 290, 62, "“Then the payment page went blank.|Every test failed.” (person vs. technology)", { cls: "fx-card", fs: 11.5, lh: 16 })) +
    g({ on: "2" }, box(14, 8, 290, 62, "“Mia whispered: ‘The client is presenting|it at nine.’ (pause) My hands were cold.”", { cls: "fx-card", fs: 11.5, lh: 16 })) +
    g({ on: "3" }, box(14, 8, 290, 62, "“At 3:47 a.m. we found it: one missing|comma in a config file.”", { cls: "fx-card", fs: 11.5, lh: 16 })) +
    g({ on: "4" }, box(14, 8, 290, 62, "“The demo worked. Since then, we run|every config through a validator.”", { cls: "fx-card", fs: 11.5, lh: 16 }))),
  steps: [
    "<b>Setting and characters</b>: dive straight in. Time, place, people. Specific details paint a mental picture.",
    "<b>Conflict</b> makes a story irresistible: person vs. nature, self, society or another person (here: a technical crisis).",
    "<b>Rising tension</b>: use dialogue, not narration, and include pauses. Show emotions with face, gestures and body language.",
    "<b>Climax</b>: the turning point. Short sentences increase the tension.",
    "<b>Resolution</b>: what happened and what changed. In a business talk, connect it to your message."
  ] };

/* ---------- 5 · SWOT ---------- */
const SW = [["Strengths", "unlocks with the|student ID card", "fx-ok", 190, 60], ["Weaknesses", "only two developers,|small budget", "fx-bad", 430, 60], ["Opportunities", "the city is building|new bike lanes", "fx-info", 190, 185], ["Threats", "e-scooter firms|enter the market", "fx-warn", 430, 185]];
FIG["eng3-swot"] = { title: "SWOT step by step: a campus bike-sharing app",
  svg: () => svg(640, 300,
    t(190, 22, "helpful (+)", { fw: 700, cls: "fx-sub" }) + t(430, 22, "harmful (−)", { fw: 700, cls: "fx-sub" }) +
    tl(40, 100, "inside|(internal)", { fs: 11, fw: 700, cls: "fx-sub" }) + tl(40, 225, "outside|(external)", { fs: 11, fw: 700, cls: "fx-sub" }) +
    SW.map(([h, s, cls, x, y], i) => g({ st: i + 1 }, r(x - 112, y - 28, 224, 108, { cls, hl: i + 1 }) + t(x, y - 4, h, { fw: 700, fs: 13 }) + tl(x, y + 40, s, { fs: 12, lh: 16 }))).join("") +
    g({ st: 5 }, l(78, 157, 600, 157, { cls: "acc dash" }) + t(600, 151, "you control ↑ · you react ↓", { a: "end", fs: 11, fw: 700, cls: "t-acc" }))),
  steps: [
    "SWOT sorts facts along two questions: <b>inside or outside</b> the company/product? <b>Helpful or harmful</b>?",
    "<b>Strengths</b> (internal, +): what your product does well. <i>One key strength is that the app unlocks bikes with the student ID card.</i>",
    "<b>Weaknesses</b> (internal, −): your limits. <i>A major weakness is the small team of only two developers.</i>",
    "<b>Opportunities</b> (external, +): trends you can use. <i>The city's plan to build new bike lanes is a great opportunity.</i>",
    "<b>Threats</b> (external, −): risks you cannot control. <i>E-scooter companies entering the market pose a serious threat.</i>",
    "Exam trick: ask <b>“Could we change this tomorrow by ourselves?”</b> Yes → S or W. No → O or T."
  ] };

/* ---------- 6 · Active listening loop ---------- */
FIG["eng3-listen"] = { title: "Active listening: restate, check, ask",
  svg: () => svg(640, 300,
    FX.user(70, 70) + t(70, 104, "Client", { fw: 700, fs: 12 }) + FX.user(570, 70) + t(570, 104, "You (support)", { fw: 700, fs: 12 }) +
    g({ st: 0 }, box(110, 30, 420, 50, "“The export never works and I'm losing|hours every week!”", { cls: "fx-card", fs: 12, lh: 16 })) +
    g({ st: 1 }, box(110, 100, 420, 50, "Restate: “So what you're saying is the export|fails regularly and it's costing you time?”", { cls: "fx-soft", fs: 12, lh: 16, hl: 1 })) +
    g({ st: 2 }, box(110, 170, 420, 50, "Check: “Yes – mainly the PDF export on Mondays.”|→ understanding confirmed and corrected", { cls: "fx-ok", fs: 12, lh: 16, hl: 2 })) +
    g({ st: 3 }, box(110, 240, 420, 50, "Open question: “Could you walk me through|what happens when you click Export?”", { cls: "fx-info", fs: 12, lh: 16, hl: 3 })) +
    g({ st: 4 }, p("M530 265 C600 265 610 140 540 125", { cls: "acc dash", arrow: true, acc: true }) + t(612, 210, "loop", { fs: 11, fw: 700, cls: "t-acc", a: "end" }))),
  steps: [
    "The client is frustrated. A quick answer (“Just restart it”) would be a barrier: it sends your message instead of receiving theirs.",
    "<b>Restatement</b>: repeat the core in your own words. It shows understanding, not agreement.",
    "The client <b>confirms or corrects</b>. Here a new detail appears: PDF export, on Mondays. You could not have guessed that.",
    "<b>Open-ended questions</b> (what, how, could you …) draw the speaker out. Avoid yes/no questions at this stage.",
    "Repeat the loop until the client says “Exactly”. Only then move to solutions."
  ] };

/* ---------- Calculator: per cent vs. percentage points ---------- */
C["eng3-pct"] = {
  title: "Per cent or percentage points? Check your numbers",
  intro: "Type an old and a new value. If the values are themselves percentages (market share, unemployment rate), the difference is in <b>percentage points</b>; the relative change is in <b>per cent</b>.",
  inputs: [
    { k: "a", label: "Old value", v: 20, min: 0.1, max: 200, step: 0.1, unit: "" },
    { k: "b", label: "New value", v: 18, min: 0, max: 200, step: 0.1, unit: "" }
  ],
  out: v => { const d = v.b - v.a, pc = d / v.a * 100;
    return [["Absolute change (new − old)", d, ""], ["Relative change", pc, "%", true], ["If both values are %: change in", Math.abs(d), "percentage points"], ["Factor (new ÷ old)", v.b / v.a, "×"]]; },
  steps: v => { const d = v.b - v.a, pc = d / v.a * 100, up = d >= 0, w = up ? "rose" : "fell";
    return `Relative change = (new − old) ÷ old × 100 = (${en(v.b, 2)} − ${en(v.a, 2)}) ÷ ${en(v.a, 2)} × 100 = <b>${en(pc, 1)} %</b><br>
      Plain values: <i>Sales ${w} <b>by</b> ${en(Math.abs(d), 2)} units, or ${en(Math.abs(pc), 1)} per cent, <b>from</b> ${en(v.a, 2)} <b>to</b> ${en(v.b, 2)}.</i><br>
      Values in %: <i>Market share ${w} <b>by</b> ${en(Math.abs(d), 2)} percentage points, from ${en(v.a, 2)}% to ${en(v.b, 2)}%</i> – that is a relative ${up ? "increase" : "decrease"} of ${en(Math.abs(pc), 1)} per cent, not ${en(Math.abs(d), 2)} per cent.` +
      (v.b >= 2 * v.a ? `<br>The value ${v.b >= 3 * v.a ? "more than tripled" : v.b === 2 * v.a ? "doubled" : "more than doubled"}.` : v.b > 0 && v.b <= v.a / 2 ? `<br>The value ${v.b === v.a / 2 ? "halved" : "fell by more than half"}.` : ""); },
  plot: { bars: v => [{ label: "old", y: v.a }, { label: "new", y: v.b }] }
};

/* ---------- Example helpers ---------- */
const PR = "Example from practice", WK = "Worked example";
const weak = s => `<p><b>Weak:</b> ${s}</p>`, strong = s => `<p><b>Strong:</b> ${s}</p>`;

window.STUDYOS_EXT = window.STUDYOS_EXT || {};
(window.STUDYOS_EXT["eng3"] = window.STUDYOS_EXT["eng3"] || []).push({ id: "eng3-plus",
  blocks: {
    "e1-1": [
      { t: "fig", id: "eng3-trends" },
      { t: "example", label: WK, title: "E-scooter rides in Graz: one dataset, many sentences", html:
        `<p>Fictional data, rides per month (thousands): <b>Jan 20 · Apr 35 · Jul 70 · Oct 40 · Dec 18</b>.</p>` +
        `<table class="dt"><tr><th>Period</th><th>Verb + adverb</th><th>Adjective + noun</th></tr>` +
        `<tr><td>Jan–Apr (+75%)</td><td>Rides <b>rose sharply</b> from 20,000 to 35,000.</td><td>There was a <b>sharp rise of</b> 75 per cent.</td></tr>` +
        `<tr><td>Apr–Jul (×2)</td><td>Rides <b>doubled</b> / <b>soared</b> to 70,000.</td><td>There was a <b>dramatic increase</b> in rides.</td></tr>` +
        `<tr><td>July</td><td>Rides <b>peaked at</b> 70,000.</td><td>Rides <b>reached a peak</b> in July.</td></tr>` +
        `<tr><td>Jul–Oct (−43%)</td><td>Rides <b>fell significantly</b> by 30,000.</td><td>There was a <b>significant drop</b> of 43 per cent.</td></tr>` +
        `<tr><td>Oct–Dec (−55%)</td><td>Rides <b>plummeted</b> to 18,000.</td><td>There was a <b>steep decline</b> to 18,000.</td></tr></table>` +
        `<p>Check the maths before you choose the word: 20 → 35 is +15, and 15 ÷ 20 = 75 per cent. Grammar: verb + <b>by</b> (rose by 15,000), noun + <b>of</b> (a rise of 15,000). Use the <b>past simple</b> for a finished period (2026 data: <i>rose</i>), the <b>present perfect</b> for a period up to now (<i>have risen since January</i>).</p>` },
      { t: "check", at: 99, q: "Rides went from 40,000 to 18,000. Which sentence is correct?", opts: ["Rides fell to 22,000.", "Rides fell by 22,000, from 40,000 to 18,000.", "Rides fell of 22,000.", "Rides fell at 18,000."], a: 1, why: "by = size of the change, from = old value, to = new value. 40 − 18 = 22." }
    ],
    "e1-2": [
      { t: "fig", id: "eng3-chartdesc" },
      { t: "calc", id: "eng3-pct" },
      { t: "example", label: WK, title: "Bookshop sales: weak vs. strong description", html:
        `<p>Fictional bar chart: a bookshop's sales in € thousands. Online: 2022 <b>40</b> → 2026 <b>95</b>. In-store: 2022 <b>160</b> → 2026 <b>120</b>.</p>` +
        weak(`“In 2022 online was 40 and in 2023 it was 52 and in 2024 it was 70 and … The online sales increased of 55. In-store sales are falling to 25 per cent.”`) +
        `<p>Problems: lists every number, “increased <i>of</i>”, wrong tense, and the 25 per cent is wrong (160 → 120 is −40, which is −25 per cent, so the sales fell <i>by</i> 25 per cent, not <i>to</i> 25 per cent).</p>` +
        strong(`“The bar chart compares a bookshop's online and in-store sales between 2022 and 2026. Overall, online sales grew rapidly, while in-store sales declined. Online sales more than doubled, rising from €40,000 to €95,000. In contrast, in-store sales fell by a quarter, from €160,000 to €120,000. However, in-store sales were still higher than online sales in 2026.”`) +
        `<p>Structure: introduce → overall trend → key figures → comparison (<i>in contrast, however, while</i>) → no new numbers in the last sentence.</p>` },
      { t: "check", at: 99, q: "In-store sales fell from €160,000 to €120,000. Which is correct?", opts: ["They fell to 25 per cent.", "They fell by 25 per cent.", "They fell by 40 per cent.", "They fell of €40,000."], a: 1, why: "−40,000 ÷ 160,000 = −25 per cent. “to” would mean the new level." },
      { t: "check", at: 99, q: "Unemployment went from 5% to 6%. What is the most precise sentence?", opts: ["Unemployment rose by 1 per cent.", "Unemployment rose by one percentage point, a relative increase of 20 per cent.", "Unemployment rose to 20 per cent.", "Unemployment doubled."], a: 1, why: "5 → 6 is +1 percentage point; 1 ÷ 5 = +20 per cent relative." }
    ],
    "e2-1": [
      { t: "fig", id: "eng3-pres" },
      { t: "example", label: PR, title: "The first 40 seconds: weak vs. strong opening", html:
        `<p>Topic: a (fictional) HBR IdeaCast episode on why remote meetings fail.</p>` +
        weak(`“So, I am Lukas and I make my presentation about remote meetings. So, I begin. The podcast is about remote meetings.”`) +
        `<p>German “So, …”, no hook, no outline, and the purpose is repeated twice.</p>` +
        strong(`“Good morning, everyone. How many of you have been in an online meeting this week where nobody said anything for the first five minutes? <i>(pause, hands go up)</i> Right – you're not alone. My name is Lukas, and <b>today I'd like to talk about</b> why remote meetings fail and how to fix them. <b>First</b>, I'll present the three main problems from the podcast. <b>Then</b> you'll try a short activity, and <b>finally</b> I'll sum up the expert's best tips.”`) +
        `<p>Later in the talk: “<b>As you can see in this drawing</b>, … <b>So much for</b> the problems. <b>Let's now move on to</b> the solutions.” End: “<b>To sum up</b>, … <b>I'd like to conclude by emphasizing</b> … Are there any questions?”</p>` },
      { t: "check", at: 99, q: "Which phrase refers the audience to a visual?", opts: ["This brings me to …", "As you can see in this drawing …", "To sum up …", "Today I'd like to talk about …"], a: 1, why: "“As you can see …” and “This drawing shows …” point to visuals." }
    ],
    "e2-2": [
      { t: "fig", id: "eng3-story" },
      { t: "example", label: PR, title: "Narration vs. dialogue: the same story twice", html:
        weak(`“There was a problem with the payment page before the go-live. We looked for the error for a long time. In the end we found it and the demo worked.”`) +
        `<p>Correct, but flat: no characters, no tension, no details.</p>` +
        strong(`“It was 11 p.m., the night before go-live. Mia looked up from her screen and said: ‘The payment page is blank.’ <i>(pause)</i> I refreshed it. Blank. ‘The client is presenting it at nine,’ she whispered. At 3:47 a.m. we found it – one missing comma in a config file. The next morning the demo worked perfectly.”`) +
        `<p>What changed: a specific time and place, two characters, a conflict, dialogue instead of narration, a pause, and short sentences at the climax.</p>` },
    ],
    "e3-1": [
      { t: "fig", id: "eng3-swot" },
      { t: "example", label: PR, title: "From SWOT to research plan: campus bike-sharing", html:
        `<p><b>SWOT in full sentences</b> (useful for presentations):</p><ul><li><b>Strength:</b> <i>One key strength is that students can unlock bikes with their ID card.</i></li><li><b>Weakness:</b> <i>Our main weakness is the small team, which limits how fast we can add features.</i></li><li><b>Opportunity:</b> <i>The new bike lanes planned by the city could increase demand.</i></li><li><b>Threat:</b> <i>E-scooter companies entering the market pose a serious threat.</i></li></ul>` +
        `<p><b>Research plan</b>: primary research = you collect new data (a <b>survey</b> of 200 students, a <b>focus group</b> with 8 students, <b>test marketing</b> on one campus); secondary research = data that already exists (city traffic statistics, <b>benchmarking</b> against existing bike apps, the university's mobility report).</p>` +
        `<p>Language for the target group: <i>The app reflects students' <b>values</b> (sustainability), <b>passions</b> (sport, being outdoors) and <b>experience</b> (tight budgets, short distances between buildings).</i></p>` },
      { t: "check", at: 99, q: "“The university plans to raise parking fees next year.” For the bike app, this is …", opts: ["a strength", "a weakness", "an opportunity", "a threat"], a: 2, why: "It is external (you cannot control it) and helpful: more students may switch to bikes." }
    ],
    "e4-1": [
      { t: "example", label: PR, title: "One request, four DiSC styles", html:
        `<p>You want your team lead to approve a new testing tool (€30 per month). Adapt the pitch to the listener's style:</p>` +
        `<table class="dt"><tr><th>Style</th><th>How to say it</th></tr>` +
        `<tr><td><b>D</b> (fast, task)</td><td>“Bottom line: this tool cuts our test time by half for €30 a month. Option A: we start Monday. Option B: a two-week trial. Which do you prefer?”</td></tr>` +
        `<tr><td><b>i</b> (fast, people)</td><td>“I'm really excited about this – the team at our partner company loves it, and it would make release days much less stressful for everyone!”</td></tr>` +
        `<tr><td><b>S</b> (slow, people)</td><td>“I've written a short summary for you. Nothing changes in our current process at first – we'd try it on one project, and I'll help everyone get started. Take your time.”</td></tr>` +
        `<tr><td><b>C</b> (slow, task)</td><td>“Here is a comparison of three tools with test times, costs and data-protection details. The figures are from a two-week trial. Could you let me know by Friday?”</td></tr></table>` +
        `<p>Remember: DiSC describes behaviour at work, not intelligence or ability. Nobody is “only” one style.</p>` },
      { t: "check", at: 99, q: "Your listener is a high i. What works best?", opts: ["A long spreadsheet and a deadline", "Enthusiasm, recognition and a friendly, informal tone", "Pressure to decide immediately", "Avoiding any personal talk"], a: 1, why: "i = influence: fast-paced and people-oriented, motivated by enthusiasm and recognition." }
    ],
    "e5-1": [
      { t: "fig", id: "eng3-listen" },
      { t: "example", label: PR, title: "Help-desk call: barrier vs. active listening", html:
        `<p>Client: “The export never works and I'm losing hours every week!”</p>` +
        weak(`“Did you restart it?” · “That's strange, it works for everyone else.” · “You should use the CSV export instead.”`) +
        `<p>Closed question, an emotional barrier (implied blame) and advice before understanding the problem.</p>` +
        strong(`“So what you're saying is the export fails regularly and that's costing you a lot of time?” – “Yes, mainly the PDF export on Mondays.” – “I see. Could you walk me through what happens when you click Export?” – “Well, it starts, and after a minute …” – “Tell me more about that error message.”`) +
        `<p>Restatement + open-ended questions. Notice: restating does not mean agreeing that the software is bad. It means checking that you understood.</p>` },
      { t: "check", at: 99, q: "Which reply is a restatement?", opts: ["“Did you restart your computer?”", "“If I hear you correctly, your concern is that the export is too slow?”", "“That never happens.”", "“You should try another browser.”"], a: 1, why: "A restatement repeats the core message in your own words to check understanding." }
    ],
    "e5-2": [
      { t: "example", label: PR, title: "Sprint planning with a client: gambits in action", html:
        `<p><b>Client:</b> We need the dashboard by the end of the month.<br><b>Developer:</b> <i>I see your point, but</i> I'm not sure that's realistic with the current scope. <span class="muted">(disagreeing politely)</span><br><b>Client:</b> What would you suggest, then?<br><b>Developer:</b> <i>That's a good question, let me think …</i> <span class="muted">(buying time)</span> We could deliver the three main charts first.<br><b>Project manager:</b> <i>Exactly, that's what I was going to say.</i> <span class="muted">(agreeing)</span><br><b>Client:</b> Fine. <i>By the way</i>, did you hear that the data team is switching databases? <span class="muted">(changing topic)</span><br><b>Project manager:</b> <i>Speaking of that</i>, we should check the API. <i>Anyway, I think we've covered everything – let's catch up again on Friday.</i> <span class="muted">(ending)</span></p>` +
        `<p>Without the gambits, the same meeting sounds blunt: “No. That's impossible.” – “The charts first.” – “Yes.” – “Bye.”</p>` },
      { t: "check", at: 99, q: "“Speaking of that …” is used to …", opts: ["end a conversation", "change or link to a related topic", "disagree", "buy time"], a: 1, why: "It connects a new point to what was just said." }
    ],
    "e5-3": [
      { t: "example", label: PR, title: "Project team: you-messages rewritten", html:
        `<table class="dt"><tr><th>You-message</th><th>I-message (feeling · behaviour · need/request)</th></tr>` +
        `<tr><td>You never answer in the team chat.</td><td>I feel worried when my questions in the chat stay unanswered for two days, because I need the information to continue. Could you reply within a day, even briefly?</td></tr>` +
        `<tr><td>You always change the design at the last minute.</td><td>I feel stressed when the design changes the day before the deadline, because I need time to test. I'd appreciate it if changes came by Wednesday.</td></tr>` +
        `<tr><td>You didn't prepare anything for the meeting.</td><td>I feel frustrated when we start the meeting without an agenda, because I want to use our time well. Could you send a short agenda the evening before?</td></tr></table>` +
        `<p><b>Trap:</b> “I feel that you don't care” and “I feel ignored” are judgments in disguise. Test: if you can replace <i>feel</i> with <i>think</i>, it's not a feeling. Also avoid the German pattern “I'd like that you …” – say “I'd like you to …” or “I'd appreciate it if you …”.</p>` },
      { t: "check", at: 99, q: "Which sentence is grammatically correct?", opts: ["I'd like that you send the agenda.", "I'd like you to send the agenda.", "I'd like you send the agenda.", "I'd like that you sending the agenda."], a: 1, why: "like + object + to-infinitive. “I'd like that you …” is a German pattern." }
    ],
    "e6-1": [
      { t: "example", label: PR, title: "Role-play: Duncan confronts Rob", html:
        `<p>Duncan chooses the course of action <b>confrontation</b> – but in a calm, professional way:</p>` +
        `<p><b>Duncan:</b> “Rob, have you got a minute? I saw that Paxham's placed a new order this morning, and it was logged under your name.”<br><b>Rob:</b> “Well, I took the call. And we'd all been <i>softening them up</i> for years.”<br><b>Duncan:</b> “I understand the team did a lot of groundwork. Still, I feel unfairly treated, because I <i>closed the deal</i> with them, and they're my client. I'd like the <i>commission</i> on this order to go to me.”<br><b>Rob:</b> “Times are hard, Duncan. The <i>recession</i> hits everybody.”<br><b>Duncan:</b> “I know. Could we look at the <i>corporate policy</i> on commission together, and if it's unclear, ask Diana?”</p>` +
        `<p>Language used: an I-message (feeling + reason + request), an objective criterion (<i>corporate policy</i>) and a fallback to the next option (<i>go straight to the top</i>). Which option do you think is best? Argue for it in your own words.</p>` },
      { t: "check", at: 99, q: "“To soften up a client” means …", opts: ["to lower the price", "to build friendly relations before trying to sell", "to cancel an order", "to complain to the client"], a: 1, why: "Rob claims the team had been softening up Paxham's for years." }
    ],
    "e7-1": [
      { t: "example", label: PR, title: "PixelForge: from sole trader to plc", html:
        `<p>A fictional company story with the key terms:</p><ol>` +
        `<li><b>2018 – sole trader:</b> Sara builds websites alone under her own name. She keeps all the profit but has <b>unlimited liability</b>: if the business fails, she can lose her private savings.</li>` +
        `<li><b>2020 – private limited company (Ltd):</b> She and a co-founder set up PixelForge Ltd, a <b>separate legal entity</b>. Their liability is limited to the capital they invested. Shares are held privately, e.g. by a business angel.</li>` +
        `<li><b>2024 – growth:</b> The business <b>flourishes</b>. PixelForge opens new offices and <b>sets up a subsidiary</b> in Germany.</li>` +
        `<li><b>2026 – public limited company (plc):</b> PixelForge is <b>listed on the stock exchange</b>; anyone can buy shares. It may now become a <b>takeover target</b>, and its share price can be <b>volatile</b>.</li></ol>` +
        `<p>Don't confuse: a <b>public limited company</b> (shares traded publicly) is not a <b>public corporation</b> (owned and run by the state, e.g. a national railway).</p>` },
      { t: "check", at: 99, q: "PixelForge sets up a company in Germany that it fully owns. This company is a …", opts: ["retailer", "subsidiary", "sole trader", "public corporation"], a: 1, why: "A subsidiary is a company owned or controlled by another company." }
    ],
    "e8-1": [
      { t: "example", label: PR, title: "What a complete glossary entry needs", html:
        `<p>Structure only – the content of your entries must be your own. Example term: <b>scalability</b>.</p>` +
        `<ul><li><b>Definition:</b> copied from vocabulary.com or Cambridge Dictionary, <b>with the source named</b>.</li><li><b>Sentence 1:</b> a sentence from <i>your</i> presentation or the course material in which the term appears, e.g. a sentence from your podcast talk.</li><li><b>Sentence 2:</b> an example sentence from vocabulary.com (IT, science or business), <b>with the source</b>.</li></ul>` +
        `<p><b>Common reasons for losing points:</b> no source given · definition invented or written by AI · sentence 2 taken from a random website · the term does not actually appear in one of the sentences · fewer than three terms from your own podcast · late submission (not accepted after 10 Jan 2027).</p>` },
      { t: "check", at: 99, q: "How many glossary terms must come from your own podcast?", opts: ["none", "at least one", "at least three of the five", "all five"], a: 2, why: "Five course-related terms, at least three of them from your podcast." }
    ]
  },

  questions: [
    /* e-trend */
    { id: "px-eng3-1", topic: "e-trend", q: "Which sentence is correct?", opts: ["The company raised by 10 per cent.", "Sales rose by 10 per cent.", "Sales raised 10 per cent.", "Sales have rised by 10 per cent."], a: 1, why: "<i>rise – rose – risen</i> has no object. <i>raise</i> needs an object: the company raised its prices.", ex: "" },
    { id: "px-eng3-2", topic: "e-trend", q: "Which verb describes a very quick, strong fall?", opts: ["level off", "plummet", "edge up", "recover"], a: 1, why: "plummet = fall very quickly and by a large amount.", ex: "" },
    { id: "px-eng3-3", topic: "e-trend", q: "“Sales have increased since January.” Why the present perfect?", opts: ["Because the period is finished", "Because the period continues up to now", "Because it is a forecast", "Because there is a number"], a: 1, why: "since + starting point → present perfect. For a finished period (in 2025, last year) use the past simple.", ex: "" },
    { id: "px-eng3-4", topic: "e-trend", q: "Turn “Profits fell slightly.” into adjective + noun:", opts: ["There was a slightly fall in profits.", "There was a slight fall in profits.", "There was a slight falling of profits.", "Profits had a slightly fall."], a: 1, why: "Adverb (slightly) + verb ↔ adjective (slight) + noun (fall).", ex: "" },
    { id: "px-eng3-5", topic: "e-trend", q: "Prices went up and down many times during the year. Which verb fits best?", opts: ["peaked", "fluctuated", "levelled out", "doubled"], a: 1, why: "fluctuate = rise and fall irregularly.", ex: "" },
    { id: "px-eng3-6", topic: "e-trend", q: "Complete: “There was a rise ___ 15 per cent in revenue.”", opts: ["by", "of", "to", "at"], a: 1, why: "Noun + of (a rise of 15 per cent). Verb + by (revenue rose by 15 per cent).", ex: "" },
    /* e-chart */
    { id: "px-eng3-7", topic: "e-chart", q: "Subscriptions: 12,000 → 41,000. Which description is accurate?", opts: ["Subscriptions doubled.", "Subscriptions more than tripled.", "Subscriptions rose by 41,000.", "Subscriptions rose to 29,000."], a: 1, why: "41 ÷ 12 ≈ 3.4, so more than three times as many.", ex: "" },
    { id: "px-eng3-8", topic: "e-chart", q: "What should come right after the introduction of a chart description?", opts: ["Every single figure in order", "The overall trend", "Your personal opinion", "The source of the data"], a: 1, why: "Introduce → overall trend → key features → comparison/conclusion. Select, don't list.", ex: "" },
    { id: "px-eng3-9", topic: "e-chart", q: "A value went from 27 to 25. Which adjective fits best?", opts: ["dramatic", "slight", "substantial", "enormous"], a: 1, why: "−2 out of 27 is about −7 per cent: a slight dip.", ex: "" },
    { id: "px-eng3-10", topic: "e-chart", q: "Market share: 30% → 33%. What is correct?", opts: ["It rose by 3 per cent.", "It rose by 3 percentage points (10 per cent in relative terms).", "It rose by 33 per cent.", "It rose to 3 percentage points."], a: 1, why: "33 − 30 = 3 percentage points; 3 ÷ 30 = 10 per cent relative.", ex: "" },
    { id: "px-eng3-11", topic: "e-chart", q: "Which phrase is best for a careful forecast?", opts: ["Sales will definitely double.", "Sales are expected to reach about 50,000 next year.", "Sales doubled next year.", "Sales have reached 50,000 next year."], a: 1, why: "Forecasts use hedging: be expected to, be likely to, may.", ex: "" },
    { id: "px-eng3-12", topic: "e-chart", q: "Which linking word introduces a contrast between two lines in a chart?", opts: ["Moreover", "In contrast", "As a result", "In addition"], a: 1, why: "“Online sales grew. In contrast, in-store sales declined.”", ex: "" },
    /* e-pres */
    { id: "px-eng3-13", topic: "e-pres", q: "Which phrase is best to start the summary?", opts: ["Let's move on to …", "To sum up …", "As you can see …", "Good morning, everyone."], a: 1, why: "“To sum up” / “Let's recap what we have heard so far” introduce the summary.", ex: "" },
    { id: "px-eng3-14", topic: "e-pres", q: "Which phrase signals a move to the next part?", opts: ["So much for the problems. Let's now move on to the solutions.", "I'd like to conclude by emphasizing …", "This drawing shows …", "Are there any questions?"], a: 0, why: "“So much for … Let's now move to …” is signposting.", ex: "" },
    { id: "px-eng3-15", topic: "e-pres", q: "German speakers often start with “So, …”. Which is the better English start?", opts: ["“So, I start now.”", "“Right, let's get started.”", "“So is it.”", "“Good, so, so.”"], a: 1, why: "English “so” expresses a result. Use “Right, …” or “OK, …” instead.", ex: "" },
    { id: "px-eng3-16", topic: "e-pres", q: "Which element is required in your podcast presentation?", opts: ["A video clip", "At least one activity and questions for your colleagues", "A written handout", "A full script on cue cards"], a: 1, why: "4–8 A3 drawings or one A0 poster, at least one activity, cue cards with keywords only.", ex: "" },
    { id: "px-eng3-17", topic: "e-pres", q: "Which linking word shows a result?", opts: ["although", "consequently", "moreover", "in spite of"], a: 1, why: "consequently / therefore / as a result = result.", ex: "" },
    /* e-story */
    { id: "px-eng3-19", topic: "e-story", q: "Which sentence “shows” rather than “tells”?", opts: ["I was very nervous.", "My hands were cold and I read the same line three times.", "It was a stressful situation.", "Everything was difficult."], a: 1, why: "Specific details paint a mental picture.", ex: "" },
    { id: "px-eng3-20", topic: "e-story", q: "Where does the climax come in a story?", opts: ["At the very beginning", "At the turning point of highest tension", "In the introduction of the characters", "After the resolution"], a: 1, why: "Setting → conflict → rising tension → climax → resolution.", ex: "" },
    { id: "px-eng3-21", topic: "e-story", q: "Which is a storytelling tip from the course material?", opts: ["Avoid pauses so the audience doesn't get bored", "Include pauses and give specific details", "Tell the ending first", "Keep emotions out of your face"], a: 1, why: "Pauses, specific details, dialogue and visible emotions bring a story to life.", ex: "" },
    /* e-app */
    { id: "px-eng3-22", topic: "e-app", q: "“Our team has no marketing experience.” This is a …", opts: ["strength", "weakness", "opportunity", "threat"], a: 1, why: "Internal and harmful.", ex: "" },
    { id: "px-eng3-23", topic: "e-app", q: "“The city is building new bike lanes.” For a bike-sharing app, this is a/an …", opts: ["strength", "weakness", "opportunity", "threat"], a: 2, why: "External and helpful.", ex: "" },
    { id: "px-eng3-24", topic: "e-app", q: "Which is primary research?", opts: ["Reading city traffic statistics", "A survey of 200 students", "Comparing competitors' websites", "Reading an industry report"], a: 1, why: "Primary research: you collect new data yourself.", ex: "" },
    { id: "px-eng3-25", topic: "e-app", q: "A quick test to decide between S/W and O/T is:", opts: ["Is it positive?", "Could we change it ourselves?", "Is it expensive?", "Is it new?"], a: 1, why: "Things you control are internal (S/W); things you can only react to are external (O/T).", ex: "" },
    /* e-disc */
    { id: "px-eng3-26", topic: "e-disc", q: "Which DiSC style is slower-paced and task-oriented?", opts: ["D", "i", "S", "C"], a: 3, why: "C = Conscientiousness: careful, analytical, quality-focused.", ex: "" },
    { id: "px-eng3-27", topic: "e-disc", q: "A colleague is a team player and dislikes sudden change. How do you introduce a new tool?", opts: ["Announce it and switch tomorrow", "Explain it calmly, give time and show how you will support the team", "Pitch it with jokes in the corridor", "Send only a price list"], a: 1, why: "S styles value stability, sincerity and time.", ex: "" },
    { id: "px-eng3-28", topic: "e-disc", q: "What are the two axes of the DiSC model?", opts: ["Young vs. old, local vs. global", "Faster vs. slower paced, task vs. people oriented", "Introvert vs. extrovert, rich vs. poor", "Manager vs. employee, online vs. offline"], a: 1, why: "D: fast/task, i: fast/people, S: slow/people, C: slow/task.", ex: "" },
    { id: "px-eng3-29", topic: "e-disc", q: "“Bottom line: here are two options. Which do you prefer?” suits which style best?", opts: ["D", "i", "S", "C"], a: 0, why: "D wants brevity, results and choices.", ex: "" },
    /* e-listen */
    { id: "px-eng3-30", topic: "e-listen", q: "Which is an open-ended question?", opts: ["Did it crash?", "Is it the PDF export?", "Could you walk me through what happens when you click Export?", "Are you angry?"], a: 2, why: "It invites a longer explanation.", ex: "" },
    { id: "px-eng3-31", topic: "e-listen", q: "Active listening means …", opts: ["agreeing with the speaker", "repeating back in your own words what someone said, to their satisfaction", "giving quick advice", "remembering every word"], a: 1, why: "Understanding, not agreement.", ex: "" },
    { id: "px-eng3-32", topic: "e-listen", q: "Noise from a building site and tiredness are … barriers.", opts: ["physical", "emotional", "semantic", "cultural"], a: 0, why: "Physical: environment and body. Emotional: red-flag words, prejudice. Semantic: vocabulary.", ex: "" },
    { id: "px-eng3-33", topic: "e-listen", q: "A client uses a technical term you don't understand. Best reaction?", opts: ["Nod and continue", "“What do you mean by …?”", "Change the topic", "Ignore it"], a: 1, why: "An open clarifying question removes the semantic barrier.", ex: "" },
    /* e-gambit */
    { id: "px-eng3-34", topic: "e-gambit", q: "“I couldn't agree more” means …", opts: ["I disagree", "I agree completely", "I'm not sure", "I can't agree yet"], a: 1, why: "A strong way of agreeing.", ex: "" },
    { id: "px-eng3-35", topic: "e-gambit", q: "Which gambit ends a conversation politely?", opts: ["By the way …", "Anyway, I should be going now – let's catch up soon.", "That's a tough one …", "Exactly!"], a: 1, why: "Anyway + reason + friendly close.", ex: "" },
    { id: "px-eng3-36", topic: "e-gambit", q: "Which reply disagrees most diplomatically?", opts: ["“That's wrong.”", "“No way.”", "“That's an interesting point, although I see it a bit differently.”", "“You don't understand.”"], a: 2, why: "Acknowledge first, then disagree softly.", ex: "" },
    { id: "px-eng3-37", topic: "e-gambit", q: "Which is a typical German mistake?", opts: ["I agree.", "I am agree.", "I agree with you.", "I don't agree."], a: 1, why: "agree is a verb: I agree / I don't agree.", ex: "" },
    /* e-imsg */
    { id: "px-eng3-38", topic: "e-imsg", q: "Which is a real feeling?", opts: ["I feel ignored.", "I feel that you don't care.", "I feel worried.", "I feel you're lazy."], a: 2, why: "The others describe what the other person does or are judgments.", ex: "" },
    { id: "px-eng3-39", topic: "e-imsg", q: "What is missing in “I feel stressed when the design changes the day before the deadline.”?", opts: ["the feeling", "the behaviour", "the need or request", "nothing"], a: 2, why: "Add e.g. “because I need time to test. Could changes come by Wednesday?”", ex: "" },
    { id: "px-eng3-40", topic: "e-imsg", q: "Which is correct English?", opts: ["I'd appreciate it if you sent the agenda.", "I'd appreciate that you send the agenda.", "I'd like that you send the agenda.", "I appreciate if you would to send the agenda."], a: 0, why: "“I'd appreciate it if you + past simple” or “I'd like you to …”.", ex: "" },
    { id: "px-eng3-41", topic: "e-imsg", q: "Which is the best I-message for “You never answer in the team chat”?", opts: ["“I feel you never answer.”", "“I feel worried when my questions stay unanswered for two days, because I need the information. Could you reply within a day?”", "“I think you're ignoring me.”", "“You should answer faster.”"], a: 1, why: "Feeling + behaviour without blame + need + request.", ex: "" },
    /* e-hard */
    { id: "px-eng3-42", topic: "e-hard", q: "“To close a deal” means …", opts: ["to end a partnership", "to make a sale", "to cancel an order", "to go bankrupt"], a: 1, why: "Duncan closed the Paxham's deal within five minutes.", ex: "" },
    { id: "px-eng3-43", topic: "e-hard", q: "Which course of action means Rob and Duncan share the commission?", opts: ["confrontation", "compromise", "ignore the problem", "go straight to the top"], a: 1, why: "A compromise: both give up something.", ex: "" },
    { id: "px-eng3-44", topic: "e-hard", q: "“Up-market” means …", opts: ["cheap and simple", "sophisticated and expensive", "on the stock exchange", "outside the city"], a: 1, why: "Paxham's Menswear is an up-market shop.", ex: "" },
    { id: "px-eng3-45", topic: "e-hard", q: "A “recession” is …", opts: ["a period of reduced business activity", "a payment per sale", "a company rule", "a type of advertising space"], a: 0, why: "Bluebird Publications was hit by the recession.", ex: "" },
    /* e-comp */
    { id: "px-eng3-46", topic: "e-comp", q: "Which statement about a private limited company is true?", opts: ["Its shares are traded on the stock exchange.", "It is a separate legal entity with limited liability and privately held shares.", "It is owned by the state.", "The owner has unlimited liability."], a: 1, why: "Ltd = limited liability, shares not offered to the public.", ex: "" },
    { id: "px-eng3-47", topic: "e-comp", q: "A national railway owned and financed by the government is a …", opts: ["public limited company", "public corporation", "non-profit organisation", "sole trader"], a: 1, why: "Public corporation = state-owned. Public limited company = shares sold to the public.", ex: "" },
    { id: "px-eng3-48", topic: "e-comp", q: "“The business flourished” means …", opts: ["it failed", "it grew and was successful", "it was sold", "it moved abroad"], a: 1, why: "flourish = grow and be successful (Tesco vocabulary).", ex: "" },
    { id: "px-eng3-49", topic: "e-comp", q: "A charity that teaches coding and reinvests its surplus is a …", opts: ["plc", "non-profit organisation", "sole trader", "subsidiary"], a: 1, why: "Non-profits reinvest surplus in their mission.", ex: "" },
    { id: "px-eng3-50", topic: "e-comp", q: "Why could a plc become a “takeover target”?", opts: ["Because its shares can be bought by anyone, including another company", "Because it is owned by the state", "Because it has unlimited liability", "Because it cannot sell shares"], a: 0, why: "Shares on the stock exchange can be bought up by a company that wants control.", ex: "" },
    /* e-glos */
    { id: "px-eng3-51", topic: "e-glos", q: "What must each glossary definition include?", opts: ["Only the term", "The definition from vocabulary.com or Cambridge Dictionary with the source", "A translation into German", "An AI-generated explanation"], a: 1, why: "The source must be named.", ex: "" },
    { id: "px-eng3-52", topic: "e-glos", q: "Where does the first example sentence come from?", opts: ["Any website", "Your presentation or the course material", "vocabulary.com", "A German newspaper"], a: 1, why: "Sentence 1: your presentation/course material. Sentence 2: vocabulary.com with source.", ex: "" },
    { id: "px-eng3-53", topic: "e-glos", q: "What happens to glossary entries submitted after 10 January 2027?", opts: ["They lose half the points", "They are not accepted", "They are accepted with a warning", "Nothing"], a: 1, why: "Late entries are not accepted.", ex: "" },
    { id: "px-eng3-54", topic: "e-glos", q: "How many terms are in the glossary?", opts: ["three", "five", "ten", "as many as you like"], a: 1, why: "Five course-related terms, at least three from your podcast (15 points).", ex: "" }
  ],

  flashcards: [
    ["rise vs. raise", "rise – rose – risen: no object (sales rose). raise – raised: needs an object (we raised prices).", "e-trend"],
    ["from / to / by / at", "from = old value · to = new value · by = size of change · at = a level (stands at 13%).", "e-trend"],
    ["a rise of vs. rose by", "Noun + of (a rise of 10%) · verb + by (rose by 10%).", "e-trend"],
    ["Past simple vs. present perfect (trends)", "Finished period (in 2025) → past simple. Up to now (since 2021) → present perfect.", "e-trend"],
    ["fluctuate", "to rise and fall irregularly", "e-trend"],
    ["plummet", "to fall very quickly and by a large amount", "e-trend"],
    ["recover / rebound", "to go back up after a fall", "e-trend"],
    ["more than tripled", "increased to more than three times the original value (12 → 41)", "e-chart"],
    ["Five moves of a chart description", "introduce → overall trend → key feature → exception/comparison → end point (optional forecast)", "e-chart"],
    ["Hedging a forecast", "is expected to · is likely to · may · could", "e-chart"],
    ["“So, …” in English", "Not a starter like German „So, …“. Use “Right, …” or “OK, …”.", "e-pres"],
    ["show, don't tell", "Use specific details (cold hands) instead of labels (I was nervous).", "e-story"],
    ["Story arc", "setting & characters → conflict → rising tension → climax → resolution", "e-story"],
    ["SWOT test question", "Could we change it ourselves? Yes → S/W (internal). No → O/T (external).", "e-app"],
    ["I'd like you to …", "Correct structure. Not: “I'd like that you …”.", "e-imsg"],
    ["takeover target", "a company that another company wants to buy (gain control of)", "e-comp"]
  ].map((x, i) => ({ id: "px-eng3-f" + (i + 1), cat: "English", topic: x[2], front: x[0], back: x[1] }))
});
})();
