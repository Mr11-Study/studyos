/* English for ICT & Business 3: Communication Skills (ENG3) — Lisa Zimmermann, WINF 2025, WS 2026/27 */
(function () {
const TOPICS = {
  "e-trend":  { name: "Describing trends",        lesson: "e1-1" },
  "e-chart":  { name: "Figures & charts",         lesson: "e1-2" },
  "e-pres":   { name: "Presentation phrases",     lesson: "e2-1" },
  "e-story":  { name: "Storytelling",             lesson: "e2-2" },
  "e-app":    { name: "App dev & SWOT",           lesson: "e3-1" },
  "e-disc":   { name: "DiSC styles",              lesson: "e4-1" },
  "e-listen": { name: "Active listening",         lesson: "e5-1" },
  "e-gambit": { name: "Language gambits",         lesson: "e5-2" },
  "e-imsg":   { name: "I-messages",               lesson: "e5-3" },
  "e-hard":   { name: "Hard Times (vocab)",       lesson: "e6-1" },
  "e-comp":   { name: "Company types",            lesson: "e7-1" },
  "e-glos":   { name: "Glossary skills",          lesson: "e8-1" }
};

const WORLDS = [
 { id: "ew1", n: 1, title: "Figures & Trends", sub: "Boom or bust?", boss: null, lessons: [
  { id: "e1-1", title: "The vocabulary of trends", topic: "e-trend", min: 12, xp: 30, blocks: [
    { t: "lead", html: "In business you describe figures all the time. <b>Always give context</b>: compare with a previous period, another unit, company or country – e.g. <i>This is up by 50 per cent on last year.</i>" },
    { t: "widget", w: "sorter", topic: "e-trend", title: "Up, down or stable?", cats: [{ k: "u", label: "↗ Upward" }, { k: "d", label: "↘ Downward" }, { k: "s", label: "→ Stable" }, { k: "p", label: "⌃ Top point" }],
      items: [{ t: "climb", a: "u", why: "to go up gradually or steadily" }, { t: "boom", a: "u", why: "a period of rapid growth" }, { t: "soar", a: "u", why: "to rise very quickly" }, { t: "ramp up", a: "u", why: "to increase (production, activity)" }, { t: "drop (to)", a: "d", why: "to fall" }, { t: "dip (to)", a: "d", why: "a small, temporary fall" }, { t: "slump", a: "d", why: "a sudden large fall" }, { t: "decline", a: "d", why: "to become less" }, { t: "slash", a: "d", why: "to cut sharply (e.g. interest rates)" }, { t: "level out", a: "s", why: "to stop rising or falling" }, { t: "remain steady at", a: "s", why: "to stay the same" }, { t: "even out", a: "s", why: "to become stable after changes" }, { t: "peak at", a: "p", why: "to reach the highest point" }, { t: "reach an all-time high", a: "p", why: "highest level ever" }] },
    { t: "widget", w: "sorter", topic: "e-trend", title: "How strong is the change?", cats: [{ k: "big", label: "Large" }, { k: "mid", label: "Moderate" }, { k: "small", label: "Small" }],
      items: [{ t: "dramatic", a: "big", why: "" }, { t: "substantial", a: "big", why: "" }, { t: "considerable", a: "big", why: "" }, { t: "significant", a: "big", why: "" }, { t: "enormous", a: "big", why: "" }, { t: "moderate", a: "mid", why: "" }, { t: "steady", a: "mid", why: "" }, { t: "gradual", a: "mid", why: "" }, { t: "slight", a: "small", why: "" }, { t: "minimal", a: "small", why: "" }] },
    { t: "widget", w: "gapfill", topic: "e-trend", title: "Complete the headline", items: [
      { s: "Public trust in government falls to an all-time ___.", a: ["low"], hint: "the opposite of high" },
      { s: "Why the Federal Reserve plans to ___ interest rates.", a: ["slash", "cut"], hint: "to reduce sharply" },
      { s: "Tourism is slowly ___ up again.", a: ["ramping"], hint: "r…ing" },
      { s: "This is up ___ 50 per cent on last year.", a: ["by"], hint: "preposition for the size of a change" },
      { s: "It currently stands ___ 13 per cent.", a: ["at"], hint: "preposition for a level" },
      { s: "Demand has risen ___ over the last five months.", a: ["tenfold"], hint: "ten times" },
      { s: "Because of the increase in demand, prices have ___.", a: ["soared", "risen", "rocketed"], hint: "rose very quickly" }] },
    { t: "check", q: "Which preposition shows the <b>size</b> of a change?", opts: ["at", "by", "to", "on"], a: 1, why: "rose <b>by</b> 5% (the change) · rose <b>to</b> 40 (the new level) · stands <b>at</b> 13% (the level)." },
    { t: "check", q: "“Given recent market volatility, investment has taken a hit.” What does <i>taken a hit</i> mean?", opts: ["increased", "been negatively affected", "stayed stable", "doubled"], a: 1, why: "An idiom for suffering damage or a decline." }
  ]},
  { id: "e1-2", title: "Chart lab", topic: "e-chart", min: 15, xp: 30, blocks: [
    { t: "lead", html: "Practise with the classroom datasets (Exercises 3–6). You can also type in any table to draw your own chart – e.g. for your homework drawing. The <b>description</b> of the homework charts must be your own, without AI." },
    { t: "widget", w: "chartlab", topic: "e-chart" },
    { t: "callout", html: "Home assignment (due 29 Oct 2026): choose Netflix revenue by region <b>or</b> worldwide OTT users (material p. 19/20), draw a graph and record an oral description of both charts. Start and end with your full name. Files: <code>SURNAME_Initial_HWK1_Drawing</code> and <code>SURNAME_Initial_HWK1_Podcast</code>. Only the graph design may be AI-assisted." }
  ]}
 ]},
 { id: "ew2", n: 2, title: "Presenting", sub: "HBR podcast presentation", boss: null, lessons: [
  { id: "e2-1", title: "Useful phrases & rubric", topic: "e-pres", min: 12, xp: 30, blocks: [
    { t: "lead", html: "Your presentation: one HBR IdeaCast podcast, 5–7 minutes, based on <b>4–8 A3 drawings or one A0 poster</b>, at least one activity and questions for your colleagues, cue cards with <b>keywords only</b>." },
    { t: "widget", w: "sorter", topic: "e-pres", title: "Which job does the phrase do?", cats: [{ k: "purpose", label: "Purpose" }, { k: "visual", label: "Refer to visual" }, { k: "sign", label: "Signposting" }, { k: "sum", label: "Summary" }],
      items: [{ t: "Today I'd like to talk about …", a: "purpose", why: "" }, { t: "What I'll be proposing in my presentation is …", a: "purpose", why: "" }, { t: "As you can see …", a: "visual", why: "" }, { t: "This drawing shows …", a: "visual", why: "" }, { t: "Let's move on to …", a: "sign", why: "" }, { t: "This brings me to …", a: "sign", why: "" }, { t: "So much for … Let's now move to …", a: "sign", why: "" }, { t: "To sum up …", a: "sum", why: "" }, { t: "Let's recap what we have heard so far …", a: "sum", why: "" }, { t: "I'd like to conclude by emphasizing …", a: "sum", why: "" }] },
    { t: "widget", w: "sorter", topic: "e-pres", title: "Linking words", cats: [{ k: "res", label: "Result" }, { k: "con", label: "Contrast" }, { k: "add", label: "Addition" }],
      items: [{ t: "therefore", a: "res", why: "" }, { t: "consequently", a: "res", why: "" }, { t: "as a result", a: "res", why: "" }, { t: "however", a: "con", why: "" }, { t: "although", a: "con", why: "" }, { t: "in spite of", a: "con", why: "" }, { t: "moreover", a: "add", why: "" }, { t: "in addition to this", a: "add", why: "" }, { t: "not only … but also", a: "add", why: "" }] },
    { t: "check", q: "Be careful with English “so”. Which sentence uses it correctly?", opts: ["So, I go home now. (= German „So, ich gehe jetzt“)", "He heard there was a soup kitchen nearby, so he went and tried to find it.", "So is it.", "Right so."], a: 1, why: "English “so” expresses a result. For the German „So, …“ use “Right, …” or “OK, …”." },
    { t: "check", q: "How many points is the oral presentation worth in the final mark?", opts: ["25", "40", "50", "60"], a: 2, why: "50 of 200 points; you need 61 % in it to pass the course." },
    { t: "widget", w: "presplanner" }
  ]},
  { id: "e2-2", title: "Storytelling", topic: "e-story", min: 8, xp: 20, blocks: [
    { t: "keys", items: ["A story = a sequence of events with <b>connection, characters, tension, conflict</b> (person vs. nature / self / society / person)", "Dive into your story", "Communicate emotions through face, gestures, body language", "Introduce a conflict to make it irresistible", "Paint a mental picture · include pauses · give specific details", "Use dialogue, not narration"] },
    { t: "check", q: "Which tip is from the course material?", opts: ["Use narration, not dialogue", "Use dialogue, not narration", "Avoid pauses", "Keep details vague"], a: 1, why: "Dialogue brings the listener into the scene." },
    { t: "check", q: "In a story, <i>conflict</i> can be person versus …", opts: ["nature, self, society or person", "only another person", "only nature", "the audience"], a: 0, why: "Four classic types of conflict." }
  ]}
 ]},
 { id: "ew3", n: 3, title: "Products & Markets", sub: "App development · SWOT · research", boss: null, lessons: [
  { id: "e3-1", title: "App development & SWOT", topic: "e-app", min: 10, xp: 25, blocks: [
    { t: "lead", html: "Design an app for a target group (default: senior citizens) that reflects their <b>passions</b> (gardening), <b>values</b> (family relationships) and <b>experience</b> (retirement)." },
    { t: "widget", w: "sorter", topic: "e-app", title: "SWOT: where does it go?", intro: "Example: a gardening app for senior citizens.", cats: [{ k: "s", label: "Strengths (internal +)" }, { k: "w", label: "Weaknesses (internal −)" }, { k: "o", label: "Opportunities (external +)" }, { k: "t", label: "Threats (external −)" }],
      items: [{ t: "Large, easy-to-read buttons", a: "s", why: "Internal advantage of the product." }, { t: "Small development budget", a: "w", why: "Internal limitation." }, { t: "Growing number of senior smartphone users", a: "o", why: "External market trend." }, { t: "Big tech companies launch similar apps", a: "t", why: "External competition." }, { t: "Works offline in the garden", a: "s", why: "Product feature." }, { t: "No marketing experience in the team", a: "w", why: "Internal." }, { t: "Partnership with garden centres", a: "o", why: "External chance." }, { t: "New data protection rules raise costs", a: "t", why: "External risk." }] },
    { t: "widget", w: "sorter", topic: "e-app", title: "Which research method?", cats: [{ k: "prim", label: "Primary (you collect it)" }, { k: "sec", label: "Secondary (already exists)" }],
      items: [{ t: "focus groups", a: "prim", why: "" }, { t: "face-to-face interviews with customers", a: "prim", why: "" }, { t: "observation of consumer behaviour", a: "prim", why: "" }, { t: "test marketing in one town", a: "prim", why: "" }, { t: "statistics in government publications", a: "sec", why: "" }, { t: "statistics in specialized publications", a: "sec", why: "" }, { t: "comparison with competitors (benchmarking)", a: "sec", why: "Mostly based on existing information." }, { t: "analysis of sales figures", a: "sec", why: "Existing internal data." }] },
    { t: "check", q: "Opportunities and threats are …", opts: ["internal factors", "external factors", "financial ratios", "features"], a: 1, why: "S/W are internal, O/T are external." }
  ]}
 ]},
 { id: "ew4", n: 4, title: "Communication Style", sub: "Marston's DiSC model", boss: null, lessons: [
  { id: "e4-1", title: "D · i · S · C", topic: "e-disc", min: 14, xp: 30, blocks: [
    { t: "lead", html: "DiSC (William Marston, 1920s) describes <b>how</b> a person behaves at work. Two axes: faster vs. slower paced, task vs. people oriented." },
    { t: "widget", w: "disc" },
    { t: "widget", w: "sorter", topic: "e-disc", title: "Which style? (situations from p. 28–29)", cats: [{ k: "D", label: "D · Dominance" }, { k: "i", label: "i · Influence" }, { k: "S", label: "S · Steadiness" }, { k: "C", label: "C · Conscientiousness" }],
      items: [{ t: "Administrative assistant: independent, fast paced, no time for small talk", a: "D", why: "Results, speed, directness." }, { t: "Vice president: talks a lot about successes, praises associates, very enthusiastic", a: "i", why: "Enthusiasm and recognition." }, { t: "Senior HR professional: team player, reluctant to change a smooth-running operation", a: "S", why: "Stability, team, resistance to change." }, { t: "Copywriter: perfectionist, detail oriented, slow to act, defensive about her work", a: "C", why: "Accuracy and quality." }, { t: "Systems analyst: reserved, cautious, prefers analytical projects, avoids team politics", a: "C", why: "Analytical, reserved." }, { t: "Publicist: fast paced, restless, interrupts, always pressed for time", a: "D", why: "Fast, results, impatient." }, { t: "Salesperson: friendly, always in a hurry, not concerned about details", a: "i", why: "Fast and people oriented." }] },
    { t: "check", q: "When talking to a high <b>C</b>, you should …", opts: ["keep it light and use humour", "minimize socializing, give deadlines, value accuracy", "skip the facts", "force a quick decision"], a: 1, why: "C styles want data, time and clear expectations." },
    { t: "check", q: "With a high <b>S</b>, you should NOT …", opts: ["show sincere interest", "present your case logically and in writing", "force a quick response", "listen carefully"], a: 2, why: "S styles need time and are resistant to sudden change." }
  ]}
 ]},
 { id: "ew5", n: 5, title: "Listening", sub: "Active listening · gambits · I-messages", boss: { id: "boss-ew5", title: "Communication Boss", topics: ["e-listen", "e-gambit", "e-imsg", "e-disc"] }, lessons: [
  { id: "e5-1", title: "Active listening", topic: "e-listen", min: 10, xp: 25, blocks: [
    { t: "lead", html: "“When I listen, I listen. When I talk, I talk.” Active listening means you can repeat back in your own words what someone said – to their satisfaction. It does not mean you agree." },
    { t: "keys", items: ["<b>Restatement</b>: “So what you're saying is …”, “If I hear you correctly, your concern is …”", "<b>Open-ended questions</b>: “What do you mean by …?”, “Could you give me an example?”, “Tell me more about that …”", "No yes/no questions when you want to draw someone out", "Barriers: physical (noise, fatigue), emotional (red-flag words, prejudice), semantic (vocabulary)"] },
    { t: "widget", w: "sorter", topic: "e-listen", title: "Open or closed question?", cats: [{ k: "o", label: "Open-ended" }, { k: "c", label: "Closed (yes/no)" }],
      items: [{ t: "What kinds of changes have been hardest for you?", a: "o", why: "" }, { t: "Is it hard?", a: "c", why: "" }, { t: "How have these changes affected your daily work?", a: "o", why: "" }, { t: "Did you finish the report?", a: "c", why: "" }, { t: "Could you give me an example?", a: "o", why: "Formally yes/no, but it invites explanation – listed as an open prompt in the material." }, { t: "Are you stressed?", a: "c", why: "" }] },
    { t: "widget", w: "listentest" },
    { t: "check", q: "Restatement means …", opts: ["you agree with the speaker", "you confirm your understanding in your own words", "you give advice", "you change the topic"], a: 1, why: "It shows understanding, not agreement." }
  ]},
  { id: "e5-2", title: "Language gambits", topic: "e-gambit", min: 10, xp: 25, blocks: [
    { t: "lead", html: "Gambits are the “social glue” of conversation: little phrases to take turns, buy time, soften disagreement and change or close a topic." },
    { t: "widget", w: "sorter", topic: "e-gambit", title: "Match the gambit to its purpose", cats: [{ k: "ag", label: "Agreeing" }, { k: "dis", label: "Disagreeing" }, { k: "time", label: "Buying time" }, { k: "topic", label: "Changing topic" }, { k: "end", label: "Ending" }],
      items: [{ t: "That's a good question, let me think …", a: "time", why: "" }, { t: "Exactly, that's what I was saying!", a: "ag", why: "" }, { t: "Anyway, I should be going now.", a: "end", why: "" }, { t: "By the way, did you hear about …?", a: "topic", why: "" }, { t: "I see your point, but I'm not sure I agree.", a: "dis", why: "" }, { t: "I couldn't agree more.", a: "ag", why: "" }, { t: "That's a tough one …", a: "time", why: "" }, { t: "Speaking of that …", a: "topic", why: "" }, { t: "That's an interesting point, although …", a: "dis", why: "" }, { t: "Let's catch up again soon.", a: "end", why: "" }] },
    { t: "check", q: "“Well, how can I put it …” is used to …", opts: ["agree", "buy time", "end a conversation", "change topic"], a: 1, why: "A hesitation gambit." }
  ]},
  { id: "e5-3", title: "You- to I-messages", topic: "e-imsg", min: 10, xp: 25, blocks: [
    { t: "text", h: "The 3-part formula", levels: {
      simple: "Say how you feel, what happened, and what you need.",
      normal: "1) <b>Feeling</b>: “I feel …” (real emotions, not judgments) · 2) <b>Behaviour</b> without blame: “when …” · 3) <b>Need or request</b>: “because I need / I'd like / I would appreciate …”",
      technical: "Example: “You never call me.” → “I feel disconnected when we don't talk, and I'd really like to hear from you more often.” Avoid disguised judgments like “I feel ignored” – that describes what the other person does." } },
    { t: "widget", w: "imsg", topic: "e-imsg", lang: "en" },
    { t: "check", q: "Which is a real feeling (not a judgment)?", opts: ["I feel ignored.", "I feel that you're unfair.", "I feel frustrated.", "I feel you never listen."], a: 2, why: "“Ignored” and “unfair” describe what the other person does." }
  ]}
 ]},
 { id: "ew6", n: 6, title: "Ethics at Work", sub: "Crimes & Misdemeanours · Hard Times", boss: null, lessons: [
  { id: "e6-1", title: "Hard Times: the telesales case", topic: "e-hard", min: 12, xp: 30, blocks: [
    { t: "lead", html: "Recession hit Bluebird Publications. Team leader <b>Rob Grewal</b>, the top salesperson, can barely close deals. New recruit <b>Duncan Black</b> lands a huge order from Paxham's Menswear in five minutes. Later, Rob takes an order on Duncan's phone and claims the commission." },
    { t: "widget", w: "pairs", topic: "e-hard", title: "Vocabulary", pairs: [["recession", "a period of reduction in business activity"], ["commission", "payment to a salesperson when s/he makes a sale"], ["to close a deal", "to make a sale"], ["to soften up", "to build friendly relations before trying to sell"], ["to reap the reward", "to get the benefit"], ["prestigious", "important and highly respected"], ["corporate policy", "a set of rules or behaviour agreed by a company"], ["up-market", "sophisticated, expensive"]] },
    { t: "widget", w: "sorter", topic: "e-hard", title: "Get the facts straight", cats: [{ k: "d", label: "Duncan" }, { k: "r", label: "Rob" }],
      items: [{ t: "Who made the sale to Paxham's?", a: "d", why: "" }, { t: "Who should get the Paxham's commission?", a: "d", why: "" }, { t: "Whose client placed the new order?", a: "d", why: "" }, { t: "Who took the new order on the phone?", a: "r", why: "" }, { t: "Who is claiming the commission?", a: "r", why: "" }] },
    { t: "keys", items: ["Five courses of action: <b>confrontation</b> · <b>go straight to the top</b> · <b>ignore the problem</b> · <b>get something for yourself</b> · <b>compromise</b> (Rob and Duncan share)", "Character profile task (p. 47–48): write your own profile of Rob using the template – three adjectives from: generous, aggressive, persuasive, mean, selfish, tough, kind, arrogant"] },
    { t: "widget", w: "charprofile" },
    { t: "check", q: "Why does Rob say Duncan's commission should be split?", opts: ["Because Duncan broke a rule", "Because everyone had been “softening up” Paxham's for years", "Because Duncan asked him to", "Because of corporate policy"], a: 1, why: "He claims the team's work made the deal possible." }
  ]}
 ]},
 { id: "ew7", n: 7, title: "Companies", sub: "Legal entities · Tesco", boss: null, lessons: [
  { id: "e7-1", title: "Company types", topic: "e-comp", min: 12, xp: 30, blocks: [
    { t: "widget", w: "sorter", topic: "e-comp", title: "Which legal structure?", cats: [{ k: "sole", label: "Sole trader" }, { k: "ltd", label: "Private limited (Ltd)" }, { k: "plc", label: "Public limited (plc)" }, { k: "np", label: "Non-profit" }, { k: "pub", label: "Public corporation" }],
      items: [{ t: "A national railway fully managed by the government", a: "pub", why: "Owned and financed by the state." }, { t: "A tech startup with two founders, shares held by close investors", a: "ltd", why: "Shares not sold to the public." }, { t: "A software developer working alone under her own name", a: "sole", why: "Owner = business, unlimited liability." }, { t: "A social media company traded on the stock exchange", a: "plc", why: "Shares sold to the general public." }, { t: "An educational charity teaching coding", a: "np", why: "Reinvests surplus in its mission." }, { t: "Owner has unlimited liability in case of bankruptcy", a: "sole", why: "" }, { t: "Minimum €50,000 share capital at incorporation", a: "plc", why: "" }, { t: "Minimum €35,000 share capital at set-up", a: "ltd", why: "" }, { t: "Relies on volunteers but managed by paid professionals", a: "np", why: "" }, { t: "Board of directors appointed by the government", a: "pub", why: "" }] },
    { t: "widget", w: "pairs", topic: "e-comp", title: "Tesco case vocabulary", pairs: [["retailer", "a business that sells goods to the public"], ["outlet", "a shop that sells a company's products"], ["flourish", "to grow and be successful"], ["premises", "the building and land a business uses"], ["rock bottom prices", "the lowest possible prices"], ["takeover target", "a company another company wants to buy"], ["volatile", "likely to change suddenly"], ["set up a subsidiary", "create a company owned by another company"]] },
    { t: "check", q: "A private limited company …", opts: ["can sell shares to the general public", "is a legally separate entity whose shares are privately held", "is run by the government", "has unlimited liability"], a: 1, why: "Ltd: limited liability, private shareholders." }
  ]}
 ]},
 { id: "ew8", n: 8, title: "Glossary", sub: "Five terms everyone should know", boss: null, lessons: [
  { id: "e8-1", title: "Build your glossary entries", topic: "e-glos", min: 15, xp: 30, blocks: [
    { t: "lead", html: "Five course-related terms (at least three from your podcast). For each: definition from <b>vocabulary.com</b> or <b>Cambridge Dictionary</b> with the source, sentence 1 from your presentation or course material, sentence 2 from vocabulary.com (IT/science/business) with its source. Deadline 10 Jan 2027." },
    { t: "widget", w: "glossary" },
    { t: "callout", html: "You write the entries yourself. The app only checks the format (source named, two sentences, term used in each) and turns finished entries into flashcards." }
  ]}
 ]}
];

const QUESTIONS = [
 { id: "eq1", topic: "e-trend", q: "Sales went from 30 to 45. Which is correct?", opts: ["Sales rose to 50 per cent.", "Sales rose by 50 per cent.", "Sales rose at 50 per cent.", "Sales rose on 50 per cent."], a: 1, why: "+15 on 30 = +50 %; “by” gives the size of the change.", ex: "rose by 15 units / to 45 units" },
 { id: "eq2", topic: "e-trend", q: "“Prices may even out next year” means prices will …", opts: ["double", "become stable", "crash", "peak"], a: 1, why: "even out = level off after fluctuation.", ex: "" },
 { id: "eq3", topic: "e-trend", q: "The opposite of “boom” is …", opts: ["bust", "peak", "surge", "ramp up"], a: 0, why: "boom or bust", ex: "" },
 { id: "eq4", topic: "e-trend", q: "Which adjective describes a SMALL change?", opts: ["substantial", "dramatic", "slight", "considerable"], a: 2, why: "", ex: "a slight decrease" },
 { id: "eq5", topic: "e-trend", q: "“It accounts for more than a third of …” describes …", opts: ["a trend", "a proportion", "a forecast", "a reason"], a: 1, why: "Talking about fractions.", ex: "" },
 { id: "eq6", topic: "e-chart", q: "Quarterly profits 2026: Q1 32, Q2 34, Q3 37, Q4 40. Which describes the trend best?", opts: ["Profits fluctuated wildly.", "Profits rose steadily throughout the year, peaking at 40 million in Q4.", "Profits peaked in Q2.", "Profits declined sharply."], a: 1, why: "Every quarter is higher than the one before.", ex: "" },
 { id: "eq7", topic: "e-chart", q: "Website traffic 2025: Apr 160 → May 155. What happened?", opts: ["a slight dip", "a surge", "a peak", "a slump"], a: 0, why: "A small, temporary fall.", ex: "" },
 { id: "eq8", topic: "e-chart", q: "Market share iPlus: 20 % (2025) → 18 % (2026). Which sentence is right?", opts: ["iPlus gained market share.", "iPlus lost two percentage points of market share.", "iPlus lost 2 per cent of its share.", "iPlus remained stable."], a: 1, why: "20 → 18 is −2 percentage points (−10 % relative). Distinguish points from per cent!", ex: "" },
 { id: "eq9", topic: "e-chart", q: "Which chart type does the material suggest for comparing shares of a whole (IT tickets by category)?", opts: ["line chart", "pie chart", "scatter plot", "histogram"], a: 1, why: "Exercise 6 asks for a pie chart for both years.", ex: "" },
 { id: "eq10", topic: "e-pres", q: "Which phrase is signposting?", opts: ["Good morning, my name is …", "Now, turning to …", "To sum up …", "For IT experts like yourselves …"], a: 1, why: "Signposting moves the audience to the next part.", ex: "" },
 { id: "eq11", topic: "e-pres", q: "Cue cards for the podcast presentation may contain …", opts: ["full sentences", "keywords only", "the whole script", "nothing, they're forbidden"], a: 1, why: "Keywords only, and you must submit them.", ex: "" },
 { id: "eq12", topic: "e-pres", q: "How long is the podcast presentation?", opts: ["2–3 min", "5–7 min", "10–15 min", "20 min"], a: 1, why: "", ex: "" },
 { id: "eq13", topic: "e-pres", q: "“How will this affect us?” is an example of …", opts: ["a rhetorical question", "a summary", "a greeting", "a gambit for ending"], a: 0, why: "Rhetorical strategies engage the audience.", ex: "" },
 { id: "eq14", topic: "e-disc", q: "Which DiSC style is fast paced and people oriented?", opts: ["D", "i", "S", "C"], a: 1, why: "i = Influence: enthusiastic, sociable.", ex: "" },
 { id: "eq15", topic: "e-disc", q: "With a high D you should …", opts: ["chat to build rapport first", "be brief, clear and provide alternatives", "avoid facts", "go slowly and wait"], a: 1, why: "D wants results and choices.", ex: "" },
 { id: "eq16", topic: "e-disc", q: "DiSC measures …", opts: ["intelligence", "how a person behaves in the work environment", "technical skills", "salary expectations"], a: 1, why: "It describes behaviour (surface traits), not personality core or abilities.", ex: "" },
 { id: "eq17", topic: "e-listen", q: "Which is an open-ended question?", opts: ["Do you like it?", "Is it finished?", "What are the reasons for the delay?", "Are you sure?"], a: 2, why: "Open questions invite an explanation.", ex: "" },
 { id: "eq18", topic: "e-listen", q: "Red-flag words and prejudices are … barriers.", opts: ["physical", "emotional", "semantic", "technical"], a: 1, why: "", ex: "" },
 { id: "eq19", topic: "e-gambit", q: "“I see what you mean, but …” is used to …", opts: ["agree", "disagree politely", "end", "buy time"], a: 1, why: "", ex: "" },
 { id: "eq20", topic: "e-gambit", q: "Which gambit changes the topic?", opts: ["Exactly!", "Oh, that reminds me …", "Let me think …", "I couldn't agree more."], a: 1, why: "", ex: "" },
 { id: "eq21", topic: "e-imsg", q: "Turn “You did a horrible job.” into an I-message. Best option:", opts: ["I feel you did a horrible job.", "I'm worried when the report has several errors, because I need it to be reliable for the client. Could we go through it together?", "You should do better.", "I think you're bad at this."], a: 1, why: "Feeling + behaviour without blame + need + request.", ex: "" },
 { id: "eq22", topic: "e-hard", q: "“Commission” in Hard Times means …", opts: ["a group of officials", "a payment to a salesperson per sale", "a mistake", "a type of advert"], a: 1, why: "", ex: "" },
 { id: "eq23", topic: "e-hard", q: "Why was Duncan's Paxham's deal surprising?", opts: ["Paxham's never buys advertising space – it's against their corporate policy", "Duncan was the team leader", "It was very small", "Rob had signed it before"], a: 0, why: "", ex: "" },
 { id: "eq24", topic: "e-hard", q: "Which course of action means “report Rob's action to a superior”?", opts: ["confrontation", "go straight to the top", "compromise", "ignore the problem"], a: 1, why: "", ex: "" },
 { id: "eq25", topic: "e-comp", q: "Which structure means the owner has unlimited liability?", opts: ["plc", "Ltd", "sole trader", "public corporation"], a: 2, why: "", ex: "" },
 { id: "eq26", topic: "e-comp", q: "A public corporation is …", opts: ["listed on the stock exchange", "funded and operated by the state to serve public interests", "a charity", "a one-person business"], a: 1, why: "Don't confuse with public LIMITED company.", ex: "" },
 { id: "eq27", topic: "e-comp", q: "Shares can be traded on the stock exchange in a …", opts: ["sole trader", "private limited company", "public limited company", "non-profit"], a: 2, why: "", ex: "" },
 { id: "eq28", topic: "e-story", q: "Which is NOT a storytelling tip from the material?", opts: ["Include pauses", "Provide specific details", "Avoid emotions", "Paint a mental picture"], a: 2, why: "Communicate the emotions through face, gestures, body language.", ex: "" },
 { id: "eq29", topic: "e-app", q: "“A competitor launches a cheaper app next month” belongs to …", opts: ["Strengths", "Weaknesses", "Opportunities", "Threats"], a: 3, why: "External and negative.", ex: "" },
 { id: "eq30", topic: "e-glos", q: "For the glossary, the second example sentence must come from …", opts: ["ChatGPT", "your own imagination", "vocabulary.com (IT/science/business) with source", "Wikipedia"], a: 2, why: "Sentence 1: your presentation/material. Sentence 2: vocabulary.com with source.", ex: "" }
];
const BOSS_EXTRA = [
 { id: "eb1", topic: "e-disc", q: "Your colleague is a high C and you need her approval for a new tool. Best approach?", opts: ["Pitch it enthusiastically in the corridor", "Send a written comparison with data, and give her time to decide", "Ask for a decision on the spot", "Tell a funny story first"], a: 1, why: "C: facts, accuracy, time." },
 { id: "eb2", topic: "e-listen", q: "A client says: “I get frustrated when I can't reach anyone.” Best first reply?", opts: ["“That's not our fault.”", "“So you're saying it's frustrating when you can't get help right away – what happened last time?”", "“Just email us.”", "“Everyone says that.”"], a: 1, why: "Restatement plus an open question." },
 { id: "eb3", topic: "e-gambit", q: "In a meeting you need a moment before answering a tricky question. You say:", opts: ["“Exactly!”", "“That's a good question, let me think for a moment …”", "“Anyway, I should get going.”", "“By the way …”"], a: 1, why: "Buying time." },
 { id: "eb4", topic: "e-imsg", q: "Which one is a real I-message?", opts: ["“I feel you're lazy.”", "“I feel left out when I'm not in the email thread, and I'd appreciate being copied in.”", "“I think you ignore me.”", "“I feel that nobody cares.”"], a: 1, why: "Real feeling, neutral behaviour, clear request." }
];

const FLASHCARDS = [
 ["soar", "to rise very quickly and strongly"], ["plummet / slump", "to fall very quickly / a sudden large fall"], ["peak (at)", "to reach the highest point"], ["level out / off", "to stop rising or falling and stay the same"],
 ["dip", "a small, usually temporary fall"], ["ramp up", "to increase (production, activity)"], ["kick-start", "to do something to get a process started quickly"], ["slash", "to reduce sharply (prices, interest rates)"],
 ["shore up", "to support or strengthen something that is weak"], ["volatility", "the tendency to change quickly and unpredictably"], ["tenfold", "ten times as much"], ["percentage point vs. per cent", "20 % → 18 % = −2 percentage points = −10 per cent"],
 ["signposting", "phrases that guide the audience through a presentation (“Now, turning to …”)"], ["gambit", "a phrase that manages conversation: agree, disagree, buy time, change topic, end"],
 ["restatement", "repeating what someone said in your own words to confirm understanding"], ["open-ended question", "a question that invites an explanation, not yes/no"],
 ["I-message formula", "I feel … when … because I need / I'd appreciate …"], ["DiSC", "Dominance · influence · Steadiness · Conscientiousness (Marston)"],
 ["SWOT", "Strengths, Weaknesses (internal) · Opportunities, Threats (external)"], ["benchmarking", "comparing your product or company with competitors"],
 ["commission", "payment to a salesperson based on the sales they make"], ["to reap the reward", "to get the benefit of something"], ["to soften up", "to build friendly relations before trying to sell"],
 ["sole trader", "business owned and run by one person, unlimited liability"], ["private limited company (Ltd)", "separate legal entity, limited liability, shares held privately"],
 ["public limited company (plc)", "limited liability, shares traded on the stock exchange"], ["public corporation", "owned and financed by the state, board appointed by government"],
 ["subsidiary", "a company owned or controlled by another company"], ["retailer", "a business that sells goods directly to the public"]
].map((c, i) => ({ id: "ef" + (i + 1), cat: "English", topic: i < 12 ? "e-trend" : i < 14 ? "e-pres" : i < 16 ? "e-listen" : i < 17 ? "e-imsg" : i < 18 ? "e-disc" : i < 20 ? "e-app" : i < 23 ? "e-hard" : "e-comp", front: c[0], back: c[1] }));

const CHART_SETS = {
  profits: { title: "Quarterly profits (million USD)", type: "line", labels: ["Q1", "Q2", "Q3", "Q4"], series: [["2025", [25, 30, 28, 35]], ["2026", [32, 34, 37, 40]]], task: "Describe using: increase, peak, decline, stable. Which quarter showed the highest growth? Which was the weakest?" },
  traffic: { title: "Website traffic (unique visitors, thousands)", type: "bar", labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], series: [["2025", [120, 135, 150, 160, 155, 170]], ["2026", [180, 190, 200, 210, 205, 220]]], task: "Use: higher than, ramping up, expected to, may. Which year shows faster growth? Predict July and August." },
  share: { title: "Smartphone market share (%)", type: "bar", labels: ["TechOne", "SmartX", "iPlus", "Other"], series: [["2025", [25, 30, 20, 25]], ["2026", [28, 32, 18, 22]]], task: "Which brand gained, which lost? Compare with: higher than, in contrast to, the biggest increase." },
  tickets: { title: "IT support tickets by category", type: "bar", labels: ["Hardware", "Software", "Network", "Other"], series: [["2025", [420, 510, 380, 90]], ["2026", [390, 560, 400, 100]]], task: "Largest increase? Largest decrease? Use: more than, less than, substantial, significant, considerable." },
  netflixsubs: { title: "Netflix subscribers worldwide (million)", type: "line", labels: ["2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"], series: [["Subscribers", [89.09, 110.64, 139.25, 167.09, 203.66, 221.84, 230.75, 260.28, 302, 325]]], task: "Classroom source (Figure 4). Describe the overall trend and the slowdown in 2021–2022." }
};

window.COURSE_DEFS = window.COURSE_DEFS || [];
window.COURSE_DEFS.push({
  id: "eng3", name: "English for ICT & Business 3", short: "ENG3", title: "English", semester: 3, ects: null, color: "#4C9EFF", icon: "Aa", lang: "en",
  lecturers: "Lisa Zimmermann · Communication Skills",
  description: "Describing trends, HBR podcast presentation, DiSC, active listening, gambits, company types.",
  aiRule: "AI only for text correction and research, and it must be disclosed (prompts + extent). The trend descriptions must be made without AI; AI may only help design your graph. Glossary and presentation are your own work.",
  topics: TOPICS, worlds: WORLDS, questions: QUESTIONS, bossExtra: BOSS_EXTRA, flashcards: FLASHCARDS, chartSets: CHART_SETS,
  assessment: { parts: [{ id: "part", label: "Active participation (incl. AI@FHJ training)", max: 40 }, { id: "glos", label: "Glossary on Moodle", max: 15 }, { id: "grid", label: "Interview grid", max: 10 }, { id: "pres", label: "Oral presentation (HBR podcast)", max: 50 }, { id: "hwk", label: "Oral homework (describing trends)", max: 25 }, { id: "final", label: "Final assessment", max: 60 }],
    scale: [[91, "1 · very good"], [81, "2 · good"], [71, "3 · satisfying"], [61, "4 · sufficient"], [0, "5 · fail"]], note: "61 % needed in the presentation AND the final assessment; 75 % attendance; −2 points per missed unit." },
  resources: { sections: [{ title: "Links", items: [{ title: "HBR IdeaCast podcasts", url: "https://hbr.org/2018/01/podcast-ideacast", note: "Pick a topic nobody in your group has taken" }, { title: "vocabulary.com", url: "https://www.vocabulary.com", note: "Definitions + example sentences for the glossary" }, { title: "Cambridge Dictionary", url: "https://dictionary.cambridge.org/dictionary/english/", note: "Alternative definition source" }, { title: "Dave Isay – TED talk (Storytelling)", url: "https://www.ted.com/talks/dave_isay_everyone_around_you_has_a_story_the_world_needs_to_hear" }, { title: "Julian Treasure – 5 ways to listen better", url: "https://www.ted.com/talks/julian_treasure_5_ways_to_listen_better" }, { title: "Free DiSC test (12 questions)", url: "https://discpersonalitytesting.com/free-disc-test/" }, { title: "DiSC styles", url: "https://www.discprofile.com/disc-styles" }] }, { title: "Material", items: [{ title: "English for ICT and Business: Communication Skills (course material, 55 p.)" }, { title: "Oral Presentation Assessment Rubric" }, { title: "Interview Grid (11 sessions)" }, { title: "Character Profile template – Rob Grewal" }] }] },
  events: [
    { id: "eng-hwk1-open", title: "ENG3 · Describing Trends öffnet", type: "info", date: "2026-09-29", time: "09:00", note: "" },
    { id: "eng-hwk1", title: "ENG3 · Home Assignment: Describing Trends (25 P.)", type: "deadline", date: "2026-10-29", time: "23:59", note: "Graph (drawing) + oral podcast. Name at start and end. Files: SURNAME_Initial_HWK1_Drawing / _Podcast. Descriptions without AI." },
    { id: "eng-topic", title: "ENG3 · Podcast-Thema im Forum posten", type: "deadline", date: "2026-10-31", time: "23:59", note: "Subject: G1 - <Podcast title>. URL posten. First come, first served." },
    { id: "eng-glossary", title: "ENG3 · Glossary (5 terms, 15 P.)", type: "deadline", date: "2027-01-10", time: "23:59", note: "Late entries are not accepted." },
    { id: "eng-pres", title: "ENG3 · My podcast presentation", type: "exam", date: null, note: "Termin laut Präsentationsplan eintragen (Sessions 6–10)." },
    { id: "eng-final", title: "ENG3 · Final assessment (60 P.)", type: "exam", date: null, note: "Session 12. Termin eintragen." }
  ],
  tasks: [
    { id: "et-ai", title: "AI@FHJ Basic Competency Training abschließen", note: "Pflicht, Teil der Mitarbeit." },
    { id: "et-char", title: "Character Profile: Rob Grewal (p. 47–48)", note: "Template ausfüllen." },
    { id: "et-grid", title: "Interview Grid führen (jede Session)", note: "5 Minuten pro Session, jedes Mal ein anderer Kollege. Am Ende hochladen." },
    { id: "et-drawings", title: "4–8 A3-Zeichnungen für Podcast-Präsentation", note: "Communicating-science-through-drawings. Plus Cue Cards (nur Keywords)." },
    { id: "et-activity", title: "Aktivität + Fragen für Präsentation planen", note: "Mindestens eine Activity, Diskussion anregen." }
  ]
});
})();
