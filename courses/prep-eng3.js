/* Prüfungsvorbereitung ENG3 – aus Altprüfungen (Dok1: 9 Fotos/Screenshots einer bizExaminer/Moodle-Final-Assessment, „Frage x von 23“: Describing trends, Business language, Confusables, Listening Skills: Open-Ended Questioning, Business knowledge & skills, Writing-Aufgabe Netflix vs. Amazon Prime; dazu ein 10-Fragen-MC-Quiz zum TED-Talk von Julian Treasure) */
(function () {
const c = (window.COURSE_DEFS || []).find(x => x.id === "eng3"); if (!c) return;

const T = (head, rows) => "<table class='dt'><tr>" + head.map(h => "<th>" + h + "</th>").join("") + "</tr>" +
  rows.map(r => "<tr>" + r.map(x => "<td>" + x + "</td>").join("") + "</tr>").join("") + "</table>";

/* ---------- neue Topics ---------- */
Object.assign(c.topics, {
  "ex-write":    { name: "Exam writing: trends, headlines, charts", lesson: "exx-1" },
  "ex-lang":     { name: "Business language: diplomacy & confusables", lesson: "exx-2" },
  "ex-treasure": { name: "Julian Treasure: 5 ways to listen better", lesson: "exx-3" }
});

/* ---------- Netflix-Chart aus der Altprüfung ---------- */
const NETFLIX = T(["Year", "2017", "2018", "2019", "2020", "2021", "2022", "2023"], [
  ["<b>Netflix</b>", "51.1 %", "76.6 %", "76.9 %", "76.8 %", "77.4 %", "77.9 %", "79.0 %"],
  ["<b>Amazon Prime Video</b>", "83.9 %", "73.7 %", "68.8 %", "68.9 %", "71.4 %", "72.7 %", "74.3 %"]
]);

/* ---------- Zusatzkapitel ---------- */
c.worlds.push({ id: "exw", n: 9, title: "Prüfungstraining: Final Assessment", sub: "Trends schreiben · Business language · Listening", boss: null, lessons: [

{ id: "exx-1", title: "Writing toolkit: trend verbs, headlines, chart descriptions", topic: "ex-write", min: 25, xp: 0, blocks: [
  { t: "lead", html: "In the old final assessment, <b>“Describing trends”</b> was the biggest block: write down three verbs for a given line shape, explain newspaper headlines in your own words, and – as the writing task – give a detailed description of a chart <b>in the correct tense and with the source</b>." },
  { t: "text", h: "Verbs for every line shape", levels: {
    simple: "Learn at least three verbs for each shape: strong up, strong down, small changes, staying flat, top point, bottom point and coming back up.",
    normal: T(["Line shape", "Verbs (learn ≥ 3 each)"], [
      ["very strong upward ↗↗", "soar, rocket, skyrocket, surge, shoot up, jump, leap"],
      ["upward ↗", "rise, increase, go up, grow, climb, ramp up, pick up"],
      ["very strong downward ↘↘", "plummet, plunge, slump, collapse, crash, nosedive, tumble"],
      ["downward ↘", "fall, drop, decrease, decline, go down, sink, dip (small)"],
      ["stable →", "remain stable/steady/constant, stay the same, level out/off, even out, stabilise, flatten out, plateau"],
      ["top point ⌃", "peak (at), reach a peak / a high / an all-time high, top out"],
      ["lowest point ⌄", "bottom out, hit/reach a low (an all-time low), hit rock bottom"],
      ["up again after a low point ⌄↗", "recover, rebound, bounce back, pick up, rally, turn around, revive"],
      ["up and down", "fluctuate, be volatile"]
    ]) + "Nouns: a rise, an increase, a jump, a surge, a fall, a drop, a decline, a slump, a dip, a peak, a recovery, a rebound, a fluctuation.",
    technical: "Transitive vs. intransitive: prices <b>rise</b> (no object) – the company <b>raises</b> prices (object). Likewise: sales <b>increase</b> / we <b>increase</b> sales; the bank <b>slashes</b>/<b>cuts</b> rates; <b>ramp up</b> production. Prepositions: rose <b>from</b> 30 <b>to</b> 45 (levels), <b>by</b> 15 (difference), stood <b>at</b> 45 (level), peaked <b>at</b> 79 %, a rise <b>of</b> 15 % <b>in</b> sales. Percentage vs. percentage points: 20 % → 18 % = a fall of 2 percentage points (= 10 per cent)." } },
  { t: "text", h: "Verb + adverb ⇄ adjective + noun", levels: {
    simple: "You can say the same thing in two ways: “Sales rose sharply.” = “There was a sharp rise in sales.”",
    normal: "Exam tasks often ask you to rewrite a sentence:<ul><li>Sales <b>rose sharply</b> in May. → There was a <b>sharp rise</b> in sales in May.</li><li>Profits <b>fell slightly</b>. → Profits saw/showed a <b>slight fall</b>.</li><li>Prices <b>increased steadily</b>. → There was a <b>steady increase</b> in prices.</li><li>Demand <b>dropped dramatically</b>. → Demand experienced a <b>dramatic drop</b>.</li></ul>Adjectives → adverbs: sharp → sharply, slight → slightly, steady → steadily, dramatic → dramatically, gradual → gradually, significant → significantly, considerable → considerably, moderate → moderately, marginal → marginally.",
    technical: "Strength scale: dramatic / enormous / substantial / considerable / significant / sharp (large) – moderate / steady / gradual (medium, regular) – slight / marginal / minimal (small). Speed: rapid / sudden / swift vs. slow / gradual. With nouns use <i>there was / we saw / the period witnessed</i>. Avoid double intensifiers (<i>very dramatically soared</i>): a strong verb like <i>soar</i> needs no adverb." } },
  { t: "widget", w: "gapfill", topic: "ex-write", title: "Rewrite: verb + adverb → adjective + noun", items: [
    { s: "Sales rose sharply. → There was a ___ rise in sales.", a: ["sharp"] },
    { s: "Profits fell slightly. → There was a slight ___ in profits.", a: ["fall", "drop", "decrease", "decline"] },
    { s: "Prices increased steadily. → There was a ___ increase in prices.", a: ["steady"] },
    { s: "There was a dramatic drop in demand. → Demand dropped ___.", a: ["dramatically"] },
    { s: "There was a gradual recovery. → The market recovered ___.", a: ["gradually"] },
    { s: "After the low in 2019, Amazon's figures ___ back. (Synonyms: recover, rebound)", a: ["bounced"] }
  ] },
  { t: "text", h: "Explaining headlines", levels: {
    simple: "Say what the headline means in normal words. Explain the difficult word (e.g. “shore up” = support).",
    normal: "Headlines leave out articles and use dramatic verbs. Your answer: one or two full sentences in <b>your own words</b>, explain the key verb/idiom, keep the meaning.<ul><li><i>Public trust in government falls to all-time low</i> → People trust the government less than ever before; trust has dropped to the lowest level since records began.</li><li><i>Trillions alone are not enough to shore up the economy</i> → Spending enormous amounts of money (trillions of dollars/euros) is not sufficient on its own to support or strengthen the weak economy; other measures are needed as well.</li></ul>",
    technical: "Headline grammar: present simple for past events (<i>falls</i> = has fallen), infinitive for the future (<i>Fed to slash rates</i> = will cut), past participle = passive (<i>Jobs cut</i> = jobs have been cut). Idioms from the course: shore up (support), take a hit (be badly affected), kick-start (get going again), slash (cut sharply), ramp up (increase)." } },
  { t: "text", h: "Chart description – the exam recipe", levels: {
    simple: "Say what the chart shows and where it is from, then describe the biggest changes with numbers, then sum up. Past data = past tense.",
    normal: "<ol><li><b>Introduction</b>: chart type, topic, unit, period, <b>source</b> (author, title, website, date). <i>The line graph, taken from … published on … , shows …</i></li><li><b>Overview</b>: the main trend in one sentence (who is ahead, overall up/down).</li><li><b>Details</b>: 3–5 key movements with exact figures, strong verbs and adjectives/adverbs, comparisons (<i>whereas, while, by contrast</i>).</li><li><b>Conclusion</b>: summary or the gap at the end.</li></ol><b>Tense</b>: finished years → <b>past simple</b> (<i>rose, fell, peaked</i>); a development up to now → present perfect (<i>has risen since 2021</i>); describing the chart itself → present simple (<i>The graph shows …</i>).",
    technical: "Typical word count in practice tasks: 80–100 words (homework / short task) or a longer “detailed description”. Do not list every number – select the significant points (start, end, highest, lowest, crossing points). Units: % of users → use <i>percentage points</i> for differences. AI is not allowed for the description." } },
  { t: "html", html: "<p><b>Altprüfung, Frage 23:</b> Netflix vs. Amazon Prime Video Viewers in Germany, 2017–2023 (% of subscription OTT video service users). Source: article “In Germany, Amazon Prime Video begins closing gap with Netflix”, published on 14 Oct 2023 on insiderintelligence.com.</p>" + NETFLIX },
  { t: "check", q: "Which tense is correct for “Netflix ___ to 76.6 % in 2018”?", opts: ["has jumped", "jumped", "jumps", "is jumping"], a: 1, why: "A finished year (2018) → past simple." },
  { t: "check", q: "Netflix: 76.9 % → Amazon: 68.8 % (2019). The gap is …", opts: ["8.1 per cent", "8.1 percentage points", "11 percentage points", "8.1 points per cent"], a: 1, why: "Difference between two percentages = percentage points (76.9 − 68.8 = 8.1)." },
  { t: "warnbox", html: "Exam traps: forgetting the <b>source</b>; wrong tense (present simple for 2017–2023); “raise” instead of “rise”; <i>increased of</i> instead of <i>increased by</i>; per cent vs. percentage points; copying the headline words instead of explaining them." }
]},

{ id: "exx-2", title: "Business language: diplomacy & confusables", topic: "ex-lang", min: 15, xp: 0, blocks: [
  { t: "lead", html: "The old exam asked you to make a blunt sentence <b>more diplomatic using given words</b> (“Don't forget the terms of the contract!” – sure / don't need / remind) and to tick the right word in <b>confusables</b> (delayed vs. postponed)." },
  { t: "text", h: "Softening techniques", levels: {
    simple: "Make orders into polite questions or soft statements. Use “I'm sure”, “Could you …?”, “I'm afraid”, “a bit”, “not quite”.",
    normal: "<ul><li><b>Softening intro</b>: I'm sure …, I'm afraid …, Unfortunately …, To be honest …</li><li><b>Modal / question</b>: Could you …? Would you mind …-ing? Perhaps we could …</li><li><b>Negative + positive word</b>: “bad” → “not very good”, “wrong” → “not quite right”</li><li><b>Qualifiers</b>: a bit, slightly, a little, rather</li><li><b>Past continuous / conditional</b>: I was wondering if …, It might be better to …</li></ul><b>Exam solution</b>: “Don't forget the terms of the contract!” → <b>“I'm sure I don't need to remind you of the terms of the contract.”</b>",
    technical: "Further examples: “You're late again.” → “I'm afraid you're a little late again.” · “Send me the report today!” → “Could you possibly send me the report today?” · “Your price is too high.” → “I'm afraid your price is slightly higher than we expected.” · “That's a bad idea.” → “I'm not sure that's the best idea.” · “We can't do that.” → “Unfortunately, that might be a bit difficult for us.” Note: <i>remind somebody <b>of</b> something</i> / <i>remind somebody <b>to</b> do something</i>." } },
  { t: "html", html: T(["Confusable", "Meaning", "Example"], [
    ["<b>delay</b>", "make (something) late / happen later than planned, usually not on purpose", "My plane was <b>delayed</b> by an hour due to computer failure."],
    ["<b>postpone</b>", "deliberately move an event to a later date", "The meeting was <b>postponed</b> until next week."],
    ["<b>rise</b> / <b>raise</b>", "go up (no object) / lift, increase something (object)", "Prices rose. – The shop raised prices."],
    ["<b>economic</b> / <b>economical</b>", "related to the economy / saving money", "economic growth – an economical car"],
    ["<b>affect</b> / <b>effect</b>", "verb: influence / noun: result", "The crisis affected sales. – It had a big effect."],
    ["<b>lend</b> / <b>borrow</b>", "give for a time / take for a time", "The bank lends money; companies borrow money."],
    ["<b>actual</b> / <b>current</b>", "real / happening now (German „aktuell“ = current!)", "the current figures"],
    ["<b>chef</b> / <b>boss</b>", "cook / manager (German „Chef“ = boss)", "My boss approved it."]
  ]) },
  { t: "widget", w: "gapfill", topic: "ex-lang", title: "Diplomatic or confusable?", items: [
    { s: "I'm sure I don't need to ___ you of the terms of the contract.", a: ["remind"] },
    { s: "My plane was ___ by an hour due to computer failure.", a: ["delayed"] },
    { s: "Because of the strike, the conference has been ___ until May.", a: ["postponed"] },
    { s: "The company ___ its prices by 5 % last year.", a: ["raised"] },
    { s: "___ you possibly send me the figures by Friday?", a: ["could"] },
    { s: "I'm ___ your offer is slightly higher than we expected.", a: ["afraid"] }
  ] },
  { t: "check", q: "Which version is the most diplomatic?", opts: ["Send the invoice now!", "You must send the invoice.", "Could you possibly send the invoice today?", "Why haven't you sent the invoice?"], a: 2, why: "Question form + modal + “possibly” softens the request." }
]},

{ id: "exx-3", title: "Julian Treasure: 5 ways to listen better", topic: "ex-treasure", min: 12, xp: 0, blocks: [
  { t: "lead", html: "One part of the assessment was a <b>10-question multiple-choice quiz on the TED talk “5 ways to listen better” by Julian Treasure</b>. The key facts below answer every question that was asked." },
  { t: "keys", items: [
    "We spend roughly <b>60 %</b> of our communication time listening, but we retain only about <b>25 %</b> of what we hear.",
    "Listening = <b>making meaning from sound</b> (a mental process of extraction).",
    "Techniques: <b>pattern recognition</b> (that's why you hear your <b>name</b> in a noisy room/cocktail party), <b>differencing</b> (we stop noticing constant sounds), <b>filters</b> (culture, language, values, beliefs, attitudes, expectations, intentions) – they take us from all sound down to what we <b>pay attention</b> to.",
    "We are losing our listening: recording (writing down), a noisy world → people retreat into <b>headphones</b> (“millions of tiny private sound bubbles”), impatience/soundbites, media that have to <b>“scream”</b> at us (headlines, <b>capital letters</b>), desensitisation.",
    "Five exercises: <b>1. Silence</b> – three minutes a day to reset your ears · <b>2. The mixer</b> – how many channels of sound can you hear? · <b>3. Savouring</b> – enjoy mundane sounds (“the hidden choir”) · <b>4. Listening positions</b> (active/passive, reductive/expansive, critical/empathetic) · <b>5. RASA</b>: Receive, Appreciate, Summarise, Ask – Sanskrit for <b>“juice”</b> or essence.",
    "“Conscious listening always creates <b>understanding</b>.”"
  ] },
  { t: "widget", w: "pairs", topic: "ex-treasure", title: "Match the RASA steps and tools", pairs: [
    ["Receive", "pay attention to the person"], ["Appreciate", "make little noises: hmm, oh, okay"], ["Summarise", "“so …” – very important in communication"], ["Ask", "ask questions afterwards"], ["Silence", "three minutes a day to reset your ears"], ["Savouring", "enjoying mundane sounds – the hidden choir"]
  ] },
  { t: "warnbox", html: "In the photographed attempt several answers were <b>wrong</b> (30 % instead of 60 %, 15 % instead of 25 %, “filtering information” instead of headphones, “attention” instead of “juice”). Learn the figures from the talk exactly." },
  { t: "check", q: "What does conscious listening always create?", opts: ["fear", "understanding", "intention", "recognition"], a: 1, why: "Treasure: “Conscious listening always creates understanding.”" }
]}
]});

/* ---------- MC / True-False aus der Altprüfung + Zusatzfragen ---------- */
c.questions.push(
  // Julian Treasure quiz (10 questions, transcribed)
  { id: "exq1", topic: "ex-treasure", q: "According to Julian Treasure: How much communication time do we spend listening?", opts: ["20 %", "30 %", "40 %", "50 %", "60 %", "70 %"], a: 4, why: "“We spend roughly 60 % of our communication time listening.” (The photographed attempt ticked 30 % – wrong.)", alt: true, src: "Altprüfung" },
  { id: "exq2", topic: "ex-treasure", q: "When we listen to others, how much do we usually remember?", opts: ["5 %", "15 %", "25 %", "35 %", "45 %", "55 %"], a: 2, why: "We retain only about 25 % of what we hear.", alt: true, src: "Altprüfung" },
  { id: "exq3", topic: "ex-treasure", q: "How does the speaker define “listening”?", opts: ["hearing what is being said", "filtering out noises", "making meaning from sound", "relating to our name", "recognizing patterns", "focusing on channels"], a: 2, why: "Listening = making meaning from sound; filters and pattern recognition are only tools of it.", alt: true, src: "Altprüfung" },
  { id: "exq4", topic: "ex-treasure", q: "Why do we recognize our name in a noisy environment?", opts: ["because we have a certain attachment to our name", "because we make meaning from sound", "because we can generally hear well", "because we expect our name being mentioned", "because we recognize familiar patterns"], a: 4, why: "Pattern recognition distinguishes signal from noise – especially our name (cocktail-party effect).", alt: true, src: "Altprüfung" },
  { id: "exq5", topic: "ex-treasure", q: "Why do we need “filters” when listening?", opts: ["to understand", "to pay attention", "to extract", "to find meaning", "to make coffee"], a: 1, why: "Filters take us from all sound down to what we pay attention to.", alt: true, src: "Altprüfung" },
  { id: "exq6", topic: "ex-treasure", q: "How do people try to deal with noisy environments?", opts: ["through listening to their mobile phones", "by using headphones", "through filtering information", "by chewing bubble gum"], a: 1, why: "The world is so noisy that people retreat into headphones – “millions of tiny private sound bubbles”.", alt: true, src: "Altprüfung" },
  { id: "exq7", topic: "ex-treasure", q: "Give an example of how media can “scream” at its audience.", opts: ["by using capital letters", "by using a microphone", "by asking a presenter to shout", "by generating sound bubbles"], a: 0, why: "Media have to scream at us with headlines – e.g. capital letters – to get our attention.", alt: true, src: "Altprüfung" },
  { id: "exq8", topic: "ex-treasure", q: "What does conscious listening create?", opts: ["intention", "understanding", "recognition", "extraction", "attention", "fear"], a: 1, why: "“Conscious listening always creates understanding.”", alt: true, src: "Altprüfung" },
  { id: "exq9", topic: "ex-treasure", q: "What does the speaker recommend to “reset” your ears?", opts: ["three minutes of noise per day", "three minutes of conscious listening per day", "three minutes of hidden choir per day", "three minutes of silence per day"], a: 3, why: "Exercise 1: silence – three minutes a day (or just quiet).", alt: true, src: "Altprüfung" },
  { id: "exq10", topic: "ex-treasure", q: "What does the Sanskrit word RASA mean?", opts: ["juice", "attention"], a: 0, why: "RASA = Receive, Appreciate, Summarise, Ask; the Sanskrit word means “juice” or essence. (The attempt ticked “attention” – wrong.)", alt: true, src: "Altprüfung" },
  { id: "exq11", topic: "ex-treasure", q: "Which of these is NOT one of Treasure's five listening exercises?", opts: ["silence", "the mixer", "savouring", "speed listening"], a: 3, why: "The five: silence, the mixer, savouring, listening positions, RASA.", alt: true },
  // Tesco (multi-select in exam → combinations + T/F)
  { id: "exq12", topic: "e-comp", q: "Tesco case study: which company types did Tesco represent in the course of its history? (exam: tick all)", opts: ["Sole trader, private limited company (Ltd) and public limited company (plc)", "Private limited company and public corporation", "Non-profit organization and plc", "Only public limited company (plc)"], a: 0, why: "Jack Cohen started with a market stall as a sole trader (1919), the business became Tesco Stores Ltd (private limited, 1932) and was floated on the London Stock Exchange (1947) → today Tesco plc. It was never a non-profit or a state-owned public corporation.", alt: true, src: "Altprüfung" },
  { id: "exq13", topic: "e-comp", q: "True or false? Tesco has been a public corporation (state-owned) at some point in its history.", opts: ["True", "False"], a: 1, why: "Tesco has always been privately owned; a public corporation is run by the state.", alt: true, src: "Altprüfung" },
  { id: "exq14", topic: "e-comp", q: "True or false? Tesco started as a sole trader business.", opts: ["True", "False"], a: 0, why: "Founder Jack Cohen sold groceries from a market stall in London's East End.", alt: true, src: "Altprüfung" },
  // Confusables
  { id: "exq15", topic: "ex-lang", q: "Tick the correct word: My plane was ___ by an hour due to computer failure.", opts: ["delayed", "postponed"], a: 0, why: "Delayed = late, not on purpose. Postponed = deliberately moved to a later date (meetings, events).", alt: true, src: "Altprüfung" },
  { id: "exq16", topic: "ex-lang", q: "Tick the correct word: Due to the strike, the board meeting has been ___ until next month.", opts: ["delayed", "postponed"], a: 1, why: "A decision to move an event to a later date → postponed.", alt: true },
  { id: "exq17", topic: "ex-lang", q: "Tick the correct word: The company ___ its prices last year.", opts: ["rose", "raised"], a: 1, why: "raise + object (prices); rise has no object (prices rose).", alt: true },
  { id: "exq18", topic: "ex-lang", q: "Tick the correct word: The recession ___ our sales badly.", opts: ["affected", "effected"], a: 0, why: "affect = verb (to influence); effect = noun (result).", alt: true },
  { id: "exq19", topic: "ex-lang", q: "Tick the correct word: We need more ___ growth in the region.", opts: ["economical", "economic"], a: 1, why: "economic = relating to the economy; economical = saving money.", alt: true },
  { id: "exq20", topic: "ex-lang", q: "Make diplomatic with (sure / don't need / remind): “Don't forget the terms of the contract!” Best answer:", opts: ["I'm sure you don't need forget the contract.", "I'm sure I don't need to remind you of the terms of the contract.", "Remind the terms, I'm sure you don't need.", "I'm sure you don't need to remind me the contract."], a: 1, why: "remind somebody OF something; the speaker reminds the listener – polite, indirect.", alt: true, src: "Altprüfung" },
  { id: "exq21", topic: "ex-lang", q: "Which is the most diplomatic version of “Your price is too high.”?", opts: ["Your price is very high.", "I'm afraid your price is slightly higher than we expected.", "Lower your price.", "Your price is not OK."], a: 1, why: "Softener (I'm afraid) + qualifier (slightly) + comparative.", alt: true },
  // Describing trends (gapfill-like MC)
  { id: "exq22", topic: "ex-write", q: "Which three verbs describe a very strong downward trend?", opts: ["dip, ease, slip", "plummet, plunge, slump", "decline, decrease, fall", "level off, flatten, stabilise"], a: 1, why: "plummet/plunge/slump (also collapse, crash, nosedive) = very strong falls; dip/slip/ease = small.", alt: true, src: "Altprüfung" },
  { id: "exq23", topic: "ex-write", q: "Which three verbs describe an upward trend after reaching a lower point?", opts: ["recover, rebound, bounce back", "peak, top out, soar", "fluctuate, vary, waver", "dip, slide, drop"], a: 0, why: "Coming back up after a low: recover, rebound, bounce back, pick up, rally.", alt: true, src: "Altprüfung" },
  { id: "exq24", topic: "ex-write", q: "“Public trust in government falls to all-time low” means …", opts: ["Trust in the government is lower than ever before.", "Trust in the government is falling slowly.", "The government trusts the public less.", "Trust is low at the moment but used to be lower."], a: 0, why: "all-time low = the lowest level ever recorded.", alt: true, src: "Altprüfung" },
  { id: "exq25", topic: "ex-write", q: "“Trillions alone are not enough to shore up the economy” – what does “shore up” mean?", opts: ["to sell off", "to support / strengthen something weak", "to measure", "to cut sharply"], a: 1, why: "shore up = support, strengthen (originally: prop up a wall).", alt: true, src: "Altprüfung" },
  { id: "exq26", topic: "ex-write", q: "Rewrite with adjective + noun: “Sales increased dramatically in 2018.”", opts: ["There was a dramatically increase in sales in 2018.", "There was a dramatic increase in sales in 2018.", "There was a dramatic increase of sales by 2018.", "Sales were dramatic increase in 2018."], a: 1, why: "Adjective (dramatic) before the noun; a rise/increase IN something.", alt: true },
  { id: "exq27", topic: "ex-write", q: "Rewrite with verb + adverb: “There was a slight fall in profits.”", opts: ["Profits fell slight.", "Profits slightly fall.", "Profits fell slightly.", "Profits were fallen slightly."], a: 2, why: "verb (fell, past simple) + adverb (slightly).", alt: true },
  { id: "exq28", topic: "ex-write", q: "Amazon Prime Video: 68.8 % (2019) → 74.3 % (2023). Which sentence is correct?", opts: ["Amazon's share recovered steadily, rising by 5.5 percentage points to 74.3 % in 2023.", "Amazon's share recovers by 74.3 % in 2023.", "Amazon's share raised to 74.3 %.", "Amazon's share has risen of 5.5 % in 2023."], a: 0, why: "Past simple for finished period, by = difference, to = new level, percentage points for differences of percentages; rise (not raise).", alt: true, src: "Altprüfung" },
  { id: "exq29", topic: "ex-write", q: "In the old exam's writing task (Netflix vs. Amazon Prime 2017–2023), what were you explicitly told not to forget?", opts: ["a title", "the source", "a drawing", "your opinion"], a: 1, why: "“Focus on the correct tense and do not forget to include the source.”", alt: true, src: "Altprüfung" },
  { id: "exq30", topic: "ex-write", q: "Which word describes a line that goes up and down repeatedly?", opts: ["level off", "fluctuate", "bottom out", "plateau"], a: 1, why: "fluctuate = change frequently up and down.", alt: true },
  // DiSC / SWOT / open questions
  { id: "exq31", topic: "e-disc", q: "What do the letters DiSC stand for?", opts: ["Dominance, influence, Steadiness, Conscientiousness", "Direction, interest, Stability, Control", "Drive, intelligence, Sincerity, Competence", "Dominance, inspiration, Support, Creativity"], a: 0, why: "Marston's model: D – Dominance, i – influence, S – Steadiness, C – Conscientiousness.", alt: true, src: "Altprüfung" },
  { id: "exq32", topic: "e-app", q: "What does SWOT stand for (Netflix SWOT analysis)?", opts: ["Strategy, Work, Opportunities, Targets", "Strengths, Weaknesses, Opportunities, Threats", "Strengths, Weaknesses, Options, Trends", "Sales, Weaknesses, Objectives, Threats"], a: 1, why: "S/W internal, O/T external.", alt: true, src: "Altprüfung" },
  { id: "exq33", topic: "e-listen", q: "Your supervisor says: “I want a big improvement in your work this year.” Which is a good open-ended question?", opts: ["Is my work bad?", "Do you want more reports?", "Which areas of my work would you most like to see improve?", "Will I get a bonus?"], a: 2, why: "Open questions (what/which/how) draw the speaker out; yes/no questions close the conversation.", alt: true, src: "Altprüfung" }
);

/* ---------- Offene Fragen (Selbstbewertung) ---------- */
c.flashcards.push(
  { id: "exf1", cat: "ENG3", topic: "ex-write", front: "Altprüfung (Frage 10): Write down three <b>verbs</b> that describe a very <b>strong downward trend</b> (a line pointing downwards).", back: "Any three of: <b>plummet, plunge, slump, collapse, crash, nosedive, tumble, sink dramatically</b>.<br><i>Not</i> enough: dip, slip, ease, decline slightly (small changes).", alt: true },
  { id: "exf2", cat: "ENG3", topic: "ex-write", front: "Altprüfung (Frage 9): Write down three <b>verbs</b> that describe an <b>upward trend after reaching a lower point</b> (line starting a little higher up, going down and then pointing upwards again).", back: "Any three of: <b>recover, rebound, bounce back, pick up, rally, turn around, revive</b> (after the low point: bottom out first).", alt: true },
  { id: "exf3", cat: "ENG3", topic: "ex-write", front: "Altprüfung (Frage 7): Explain the newspaper headline in your own words: <b>“Public trust in government falls to all-time low”</b>", back: "Model: <i>People trust the government less than ever before – the level of trust has dropped to the lowest point since records began.</i><br>Key words: all-time low = lowest level ever; falls = has fallen (headline present).", alt: true },
  { id: "exf4", cat: "ENG3", topic: "ex-write", front: "Altprüfung (Frage 8): Explain the newspaper headline in your own words: <b>“Trillions alone are not enough to shore up the economy”</b>", back: "Model: <i>Even spending enormous sums of money (trillions of dollars/euros, e.g. government stimulus packages) is not sufficient on its own to support and strengthen the weak economy – other measures are needed too.</i><br>shore up = support / strengthen something weak; alone = on its own.", alt: true },
  { id: "exf5", cat: "ENG3", topic: "ex-write", front: "Write down three verbs for a <b>very strong upward trend</b>.", back: "soar, rocket, skyrocket, surge, shoot up, jump, leap", alt: true },
  { id: "exf6", cat: "ENG3", topic: "ex-write", front: "Write down three verbs/phrases for a line that <b>stops changing</b> (becomes flat).", back: "level out / level off, even out, stabilise, flatten out, plateau, remain steady/stable/constant", alt: true },
  { id: "exf7", cat: "ENG3", topic: "ex-write", front: "Write down three verbs/phrases for the <b>highest</b> and three for the <b>lowest</b> point.", back: "Highest: peak (at), reach a peak / an all-time high, top out.<br>Lowest: bottom out, hit a low / an all-time low, hit rock bottom.", alt: true },
  { id: "exf8", cat: "ENG3", topic: "ex-write", front: "Explain the headline: <b>“Tech shares rebound after week of heavy losses”</b>", back: "Model: <i>After falling sharply for a whole week, the prices of technology companies' shares have gone up again.</i> rebound = recover / bounce back after a fall.", alt: true },
  { id: "exf9", cat: "ENG3", topic: "ex-write", front: "Explain the headline: <b>“Central bank to slash interest rates as inflation eases”</b>", back: "Model: <i>The central bank is going to cut interest rates sharply because prices are rising more slowly now.</i> to + infinitive = future; slash = cut drastically; ease = become less strong.", alt: true },
  { id: "exf10", cat: "ENG3", topic: "ex-write", front: "Explain the headline: <b>“Car sales plummet as demand takes a hit”</b>", back: "Model: <i>The number of cars sold has fallen dramatically because fewer people want to buy cars – demand has been badly affected.</i>", alt: true },
  { id: "exf11", cat: "ENG3", topic: "ex-write", front: "Rewrite with <b>adjective + noun</b>: (1) Prices rose sharply. (2) Unemployment fell gradually. (3) Exports increased significantly.", back: "(1) There was a <b>sharp rise</b> in prices. (2) There was a <b>gradual fall</b> in unemployment. (3) There was a <b>significant increase</b> in exports. (Also: “… saw a …”, “… experienced a …”.)", alt: true },
  { id: "exf12", cat: "ENG3", topic: "ex-write", front: "Rewrite with <b>verb + adverb</b>: (1) There was a slight drop in sales. (2) There was a steady climb in users. (3) There was a dramatic decline in profits.", back: "(1) Sales <b>dropped slightly</b>. (2) Users <b>climbed steadily</b>. (3) Profits <b>declined dramatically</b>.", alt: true },
  { id: "exf13", cat: "ENG3", topic: "e-listen", front: "Altprüfung (Frage 6) – Open-ended questioning: Your supervisor says: <b>“I want a big improvement in your work this year.”</b> Write down questions to draw out your listener (objective: fully understand what they are saying).", back: "Several open questions (what/which/how/could you …), e.g.:<ul><li>Which areas of my work would you most like to see improve?</li><li>What exactly do you mean by a “big improvement”?</li><li>Could you give me an example of where my work hasn't met your expectations?</li><li>How will the improvement be measured / what would success look like at the end of the year?</li><li>What support or training could help me get there?</li></ul>Avoid yes/no questions (“Is my work bad?”).", alt: true },
  { id: "exf14", cat: "ENG3", topic: "e-listen", front: "Altprüfung (Frage 5) – Open-ended questioning: Your colleague says: <b>“What with all the changes we've had lately, it's hard to keep up with the demands of the work.”</b> Write down questions to draw out your listener.", back: "E.g.:<ul><li>Which changes have been the hardest for you?</li><li>How have these changes affected your daily work?</li><li>What do you find most demanding at the moment?</li><li>Tell me more about what makes it hard to keep up.</li><li>What would help you to cope better?</li></ul>Optionally start with a restatement: “So what you're saying is that the changes have increased your workload …”", alt: true },
  { id: "exf15", cat: "ENG3", topic: "e-listen", front: "Open-ended questioning: A customer says: <b>“Your new software is just too complicated.”</b> Write down three open questions.", back: "What parts of the software do you find most complicated? · Could you give me an example of a task that is difficult? · How do you usually use the software in your daily work? · What would make it easier for you?", alt: true },
  { id: "exf16", cat: "ENG3", topic: "ex-lang", front: "Altprüfung (Frage 18): Make the sentence more diplomatic using the words in brackets: <b>“Don't forget the terms of the contract!”</b> (sure / don't need / remind)", back: "<b>I'm sure I don't need to remind you of the terms of the contract.</b><br>(remind somebody <b>of</b> something)", alt: true },
  { id: "exf17", cat: "ENG3", topic: "ex-lang", front: "Make more diplomatic: (1) “You're late again.” (afraid / a little) (2) “Send me the report today!” (could / possibly) (3) “That's a bad idea.” (not sure / best)", back: "(1) I'm afraid you're a little late again.<br>(2) Could you possibly send me the report today?<br>(3) I'm not sure that's the best idea.", alt: true },
  { id: "exf18", cat: "ENG3", topic: "ex-lang", front: "Make more diplomatic: (1) “We can't do that.” (unfortunately / might / bit) (2) “You made a mistake in the invoice.” (seems / slight) (3) “I want a discount.” (wondering / possible)", back: "(1) Unfortunately, that might be a bit difficult for us.<br>(2) There seems to be a slight mistake in the invoice.<br>(3) I was wondering whether a discount might be possible.", alt: true },
  { id: "exf19", cat: "ENG3", topic: "e-disc", front: "Altprüfung (Frage 2): What do the letters <b>DiSC</b> stand for?", back: "<b>D</b>ominance · <b>i</b>nfluence · <b>S</b>teadiness · <b>C</b>onscientiousness (William Marston).", alt: true },
  { id: "exf20", cat: "ENG3", topic: "e-app", front: "Altprüfung (Frage 3): We talked about Netflix and the SWOT analysis of that company. What does <b>SWOT</b> stand for?", back: "<b>S</b>trengths · <b>W</b>eaknesses (internal) · <b>O</b>pportunities · <b>T</b>hreats (external).", alt: true },
  { id: "exf21", cat: "ENG3", topic: "ex-treasure", front: "What does <b>RASA</b> stand for (Julian Treasure), and what does the word mean?", back: "<b>R</b>eceive · <b>A</b>ppreciate · <b>S</b>ummarise · <b>A</b>sk. Sanskrit for “juice” or essence.", alt: true },
  { id: "exf22", cat: "ENG3", topic: "ex-treasure", front: "Name Julian Treasure's five exercises for better listening.", back: "1. Silence (3 min/day) · 2. The mixer · 3. Savouring (the hidden choir) · 4. Listening positions · 5. RASA", alt: true },
  { id: "exf23", cat: "ENG3", topic: "ex-write", front: "Chart description: what must the <b>introduction</b> contain, and which tense for 2017–2023 data?", back: "Chart type, topic, unit, period and <b>source</b> (title of article, author, website, date). Finished years → <b>past simple</b> (rose, fell, peaked); “The graph shows” → present simple; up to now → present perfect.", alt: true }
);

/* ---------- Exam prep ---------- */
c.examPrep = {
  format: "Laut Altprüfung (Fotos, bizExaminer/Moodle) ist das Final Assessment (60 P., Session 12) ein Online-Test mit <b>23 Fragen</b> in Abschnitten (Listening Skills · Business Knowledge & Skills/Business Language · Writing). Gesehen wurden: Kurzantworten (DiSC, SWOT), Multi-Select (Tesco-Unternehmensformen), offene Fragen zu Open-Ended Questioning, Describing trends (3 Verben nennen, Headlines erklären), Business Language (diplomatisch umformulieren mit vorgegebenen Wörtern), Confusables (Wort ankreuzen) und als letzte Frage eine <b>Writing-Aufgabe: detaillierte Chart-Beschreibung mit richtiger Zeit und Quelle</b>. Dazu gab es ein 10-Fragen-MC-Quiz zum TED-Talk von Julian Treasure (eventuell Frage 1). Punkte pro Frage und Dauer sind auf den Fotos nicht erkennbar; die Fragen 1, 11–17, 19, 21, 22 sind nicht fotografiert.",
  sources: ["Dok1.pdf – 9 Fotos der Altprüfung (Fragen 2–10, 18, 20, 23 von 23 + Julian-Treasure-Quiz)", "eng3.js – Kursinhalte und Assessment (Final assessment 60 P.)"],
  strategy: [
    "Pro Linienform mindestens drei Verben auswendig: stark fallend (plummet, plunge, slump), Erholung nach Tief (recover, rebound, bounce back), stark steigend, stabil, Hoch-/Tiefpunkt.",
    "Chart-Beschreibung üben: Einleitung mit <b>Quelle</b> (Artikel, Website, Datum) → Overview → 3–5 Details mit Zahlen → Schluss; abgeschlossene Jahre im <b>Past Simple</b>, Differenzen in Prozentpunkten.",
    "Headlines: Kernvokabel erklären (shore up, all-time low, slash, take a hit) und den Satz komplett in eigenen Worten umformulieren – nicht die Wörter der Headline wiederholen.",
    "Open-ended questioning: 3–5 W-Fragen (What/Which/How/Could you give me an example) ohne Ja/Nein-Fragen; optional mit Restatement einleiten.",
    "Julian-Treasure-Fakten exakt lernen (60 % / 25 %, making meaning from sound, pattern recognition, headphones, capital letters, 3 min silence, RASA = juice) – im fotografierten Versuch waren mehrere Antworten falsch.",
    "Kurzantworten sicher: DiSC, SWOT, Tesco (sole trader → Ltd → plc), diplomatische Umformulierung (I'm sure I don't need to remind you of …), delayed vs. postponed."
  ],
  focus: [
    { topic: "ex-write", weight: 3, note: "Describing trends: 4 der 12 sichtbaren Fragen (Verben, Headlines) + Writing-Aufgabe (Chart-Beschreibung)" },
    { topic: "e-trend", weight: 3, note: "Trend-Vokabular ist Grundlage für Headlines, Verben und Writing" },
    { topic: "e-chart", weight: 3, note: "Chart-Beschreibung Netflix vs. Amazon Prime als letzte Frage (Writing)" },
    { topic: "e-listen", weight: 3, note: "Open-Ended Questioning: 2 offene Fragen (Frage 5 und 6)" },
    { topic: "ex-treasure", weight: 2, note: "10-Fragen-MC-Quiz zum TED-Talk „5 ways to listen better“" },
    { topic: "ex-lang", weight: 2, note: "Business language (diplomatisch umformulieren, Frage 18) + Confusables (Frage 20)" },
    { topic: "e-disc", weight: 2, note: "Frage 2: DiSC-Buchstaben" },
    { topic: "e-app", weight: 2, note: "Frage 3: SWOT (Netflix)" },
    { topic: "e-comp", weight: 2, note: "Frage 4: Tesco-Unternehmensformen (Multi-Select)" },
    { topic: "e-gambit", weight: 1, note: "nicht auf den Fotos, aber Kursinhalt (möglich in den fehlenden Fragen)" },
    { topic: "e-imsg", weight: 1, note: "nicht auf den Fotos, aber Kursinhalt" },
    { topic: "e-hard", weight: 1, note: "nicht auf den Fotos, Hard-Times-Vokabular möglich" }
  ],
  checklist: [
    { id: "exc1", topic: "ex-write", text: "Je 3 Verben für: stark steigend, stark fallend, stabil, Höchstpunkt, Tiefpunkt, Erholung nach Tief" },
    { id: "exc2", topic: "ex-write", text: "Headlines „all-time low“ und „shore up the economy“ in eigenen Worten erklären" },
    { id: "exc3", topic: "ex-write", text: "Verb + Adverb ⇄ Adjektiv + Nomen umformen (rose sharply ⇄ a sharp rise in)" },
    { id: "exc4", topic: "e-trend", text: "Präpositionen by / to / from / at / of / in richtig verwenden; rise vs. raise" },
    { id: "exc5", topic: "e-chart", text: "Netflix-vs-Amazon-Chart vollständig beschreiben (Quelle, Past Simple, Prozentpunkte)" },
    { id: "exc6", topic: "e-chart", text: "Unbekanntes Chart in 80–100 Wörtern beschreiben, ohne alle Zahlen aufzuzählen" },
    { id: "exc7", topic: "e-listen", text: "Zu jeder Aussage (Chef, Kollege, Kunde) 3–5 offene Fragen formulieren" },
    { id: "exc8", topic: "e-listen", text: "Restatement-Phrasen und Listening-Barrieren nennen" },
    { id: "exc9", topic: "ex-treasure", text: "Treasure: 60 %/25 %, Definition, pattern recognition, filters, headphones, capital letters" },
    { id: "exc10", topic: "ex-treasure", text: "Die 5 Übungen inkl. RASA (Receive, Appreciate, Summarise, Ask = „juice“)" },
    { id: "exc11", topic: "ex-lang", text: "Satz mit vorgegebenen Wörtern diplomatischer machen (I'm sure … / Could you possibly … / I'm afraid …)" },
    { id: "exc12", topic: "ex-lang", text: "Confusables: delay/postpone, rise/raise, affect/effect, economic/economical" },
    { id: "exc13", topic: "e-disc", text: "DiSC ausschreiben und die vier Stile beschreiben" },
    { id: "exc14", topic: "e-app", text: "SWOT ausschreiben, intern/extern zuordnen (Netflix-Beispiel)" },
    { id: "exc15", topic: "e-comp", text: "Tesco-Geschichte: sole trader → Ltd → plc; Unterschied plc vs. public corporation" },
    { id: "exc16", topic: "e-gambit", text: "Gambits für agree/disagree/buy time/change topic/end parat haben" },
    { id: "exc17", topic: "e-imsg", text: "You-Message in I-Message (Gefühl – Verhalten – Bedürfnis) umformen" }
  ],
  tasks: [
    { id: "exr1", topic: "e-chart", title: "Altprüfung Frage 23: Netflix vs. Amazon Prime Video (Writing)",
      html: "<p>Give a <b>detailed description</b> of the chart below. Focus on the <b>correct tense</b> and do not forget to <b>include the source</b>.</p><p><b>Netflix vs. Amazon Prime Video Viewers in Germany, 2017–2023</b> (% of subscription OTT video service users)</p>" + NETFLIX + "<p><small>OTT = “over-the-top”: technology that delivers streamed content via internet-connected devices. The chart was featured in the article “In Germany, Amazon Prime Video begins closing gap with Netflix” (author's name not fully legible on the photo), published on 14 October 2023 on insiderintelligence.com.</small></p>",
      solution: "<p><b>Model answer (~150 words):</b></p><p>The line graph, taken from the article “In Germany, Amazon Prime Video begins closing gap with Netflix”, published on insiderintelligence.com on 14 October 2023, shows the percentage of subscription OTT video service users in Germany who watched Netflix and Amazon Prime Video between 2017 and 2023.</p><p>In 2017, Amazon Prime was clearly ahead with 83.9 %, while Netflix stood at only 51.1 %. In 2018, however, Netflix's share soared by 25.5 percentage points to 76.6 % and overtook Amazon, whose share dropped sharply to 73.7 %. Amazon continued to decline, bottomed out at 68.8 % in 2019 and remained stable in 2020 (68.9 %). Netflix, by contrast, levelled off at around 77 %. From 2021 onwards, Amazon recovered steadily and reached 74.3 % in 2023, while Netflix rose slightly to a peak of 79.0 %.</p><p>Overall, Netflix has stayed in the lead since 2018, but the gap narrowed from 8.1 percentage points in 2019 to 4.7 points in 2023.</p><p><b>Checkliste:</b> Quelle ✓ · Past Simple für 2017–2023 ✓ · Prozentpunkte ✓ · starke Verben (soar, overtake, bottom out, recover, level off) ✓ · Vergleich (while, by contrast) ✓</p>" },
    { id: "exr2", topic: "e-chart", title: "Chart in 80–100 words (Übungsdaten)",
      html: "<p>Describe the chart in <b>80–100 words</b>. Include the source and use the correct tense.</p><p><b>Monthly active users of the app “GreenThumb”, Jan–Jun 2026 (in thousands)</b> – Übungsdaten, source: GreenThumb Ltd, Annual Report 2026</p>" + T(["Jan", "Feb", "Mar", "Apr", "May", "Jun"], [["20", "22", "41", "35", "36", "36"]]),
      solution: "<p><b>Model (≈ 95 words):</b> The table, taken from GreenThumb Ltd's Annual Report 2026, shows the monthly active users of the app “GreenThumb” from January to June 2026. In January the app had 20,000 users, a figure that rose slightly to 22,000 in February. In March, the number almost doubled and peaked at 41,000 – probably because of the start of the gardening season. In April, however, it dropped significantly to 35,000. After that, users recovered marginally to 36,000 in May and levelled off at this level in June. Overall, the number of users increased by 80 per cent over the six months.</p><p>(20 → 36 = +16 = +80 %.)</p>" },
    { id: "exr3", topic: "ex-write", title: "Explain the headlines in your own words",
      html: "<ol><li>Public trust in government falls to all-time low <i>(Altprüfung)</i></li><li>Trillions alone are not enough to shore up the economy <i>(Altprüfung)</i></li><li>Oil prices plunge as demand slumps</li><li>Retail sales bounce back after disappointing winter</li><li>Investment takes a hit amid market volatility</li></ol>",
      solution: "<ol><li>People trust the government less than ever before; trust has reached its lowest level since records began.</li><li>Even huge amounts of money (trillions, e.g. government spending) are not sufficient on their own to support and strengthen the weak economy; other measures are needed.</li><li>The price of oil is falling dramatically because demand for oil has dropped sharply.</li><li>Shops are selling more again after poor sales figures in the winter – sales have recovered.</li><li>Investment has been badly affected/has fallen because prices on the markets are changing quickly and unpredictably.</li></ol>" },
    { id: "exr4", topic: "ex-write", title: "Three verbs for each line shape",
      html: "<p>Write down three <b>verbs</b> for each line:</p><ol><li>a very strong downward trend <i>(Altprüfung)</i></li><li>an upward trend after reaching a lower point <i>(Altprüfung)</i></li><li>a very strong upward trend</li><li>a line that stops changing</li><li>a small, temporary fall</li><li>a line that goes up and down</li></ol>",
      solution: "<ol><li>plummet, plunge, slump (collapse, crash, nosedive, tumble)</li><li>recover, rebound, bounce back (pick up, rally)</li><li>soar, rocket, surge (skyrocket, shoot up, jump)</li><li>level out/off, even out, stabilise (remain steady, plateau)</li><li>dip, slip, ease (fall slightly)</li><li>fluctuate, vary, be volatile</li></ol>" },
    { id: "exr5", topic: "ex-write", title: "Rewrite: adverb ⇄ adjective + noun",
      html: "<ol><li>Sales rose sharply in March. → There was …</li><li>Profits fell slightly last quarter. → There was …</li><li>There was a gradual increase in users. → Users …</li><li>There was a dramatic drop in exports. → Exports …</li><li>Prices increased steadily. → There was …</li><li>There was a significant decline in costs. → Costs …</li></ol>",
      solution: "<ol><li>There was a sharp rise in sales in March.</li><li>There was a slight fall in profits last quarter.</li><li>Users increased gradually.</li><li>Exports dropped dramatically.</li><li>There was a steady increase in prices.</li><li>Costs declined significantly.</li></ol>" },
    { id: "exr6", topic: "e-listen", title: "Open-ended questioning (Altprüfung Fragen 5 & 6)",
      html: "<p>Read the scenarios and write down questions to draw out your listener. Your objective is to fully understand what the other person is saying.</p><ol><li>Your colleague says: “What with all the changes we've had lately, it's hard to keep up with the demands of the work.”</li><li>Your supervisor says: “I want a big improvement in your work this year.”</li></ol>",
      solution: "<ol><li>Which changes have been the hardest for you? · How have they affected your daily work? · What exactly makes it hard to keep up? · Tell me more about the demands you mean. · What would help you most right now?</li><li>Which areas of my work would you most like to see improve? · What do you mean by a “big” improvement? · Could you give me an example? · How will you measure the improvement? · What support can I get to achieve it?</li></ol><p>Keine Ja/Nein-Fragen; mit What/Which/How/Could you … beginnen.</p>" },
    { id: "exr7", topic: "ex-lang", title: "Business language: diplomacy & confusables",
      html: "<p>A) Make the sentences more diplomatic using the words in brackets:</p><ol><li>Don't forget the terms of the contract! (sure / don't need / remind) <i>(Altprüfung)</i></li><li>You haven't paid the invoice. (seem / yet)</li><li>We need the goods earlier. (would / grateful / if)</li></ol><p>B) Tick the correct word:</p><ol start='4'><li>My plane was (delayed / postponed) by an hour due to computer failure. <i>(Altprüfung)</i></li><li>The launch event has been (delayed / postponed) until March.</li><li>Inflation has (risen / raised) by 2 %.</li></ol>",
      solution: "<ol><li>I'm sure I don't need to remind you of the terms of the contract.</li><li>You don't seem to have paid the invoice yet.</li><li>We would be grateful if you could deliver the goods earlier.</li><li><b>delayed</b> (late, not planned)</li><li><b>postponed</b> (deliberately moved to a later date)</li><li><b>risen</b> (no object)</li></ol>" },
    { id: "exr8", topic: "e-comp", title: "Business knowledge short answers (Fragen 2–4)",
      html: "<ol><li>What do the letters DiSC stand for?</li><li>We talked about Netflix and its SWOT analysis. What does SWOT stand for?</li><li>Tesco case study: which company types did Tesco represent in the course of its history? (sole trader / private limited company (Ltd) / public limited company (plc) / non-profit organization / public corporation)</li></ol>",
      solution: "<ol><li>Dominance, influence, Steadiness, Conscientiousness</li><li>Strengths, Weaknesses, Opportunities, Threats</li><li><b>Sole trader</b> (Jack Cohen's market stall, 1919), <b>private limited company</b> (Tesco Stores Ltd, 1932), <b>public limited company</b> (stock-market listing 1947 → Tesco plc). Not a non-profit and not a public corporation (state-owned).</li></ol>" }
  ]
};
})();
