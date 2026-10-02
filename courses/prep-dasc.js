/* Exam preparation EF-DASC Part 2 (Granigg: Modelling & Simulation) – from the Anki deck "DataScience Granigg 4. True/False" (66 cards: true/false statements + short open definition questions) */
(function () {
const c = (window.COURSE_DEFS || []).find(x => x.id === "dasc"); if (!c) return;

const T = (head, rows) => "<table class='dt'><tr>" + head.map(h => "<th>" + h + "</th>").join("") + "</tr>" +
  rows.map(r => "<tr>" + r.map(x => "<td>" + x + "</td>").join("") + "</tr>").join("") + "</table>";

/* ---------- new topics ---------- */
Object.assign(c.topics, {
  "dx-sysmod": { name: "Systems & model classification", lesson: "dx-1" },
  "dx-sd": { name: "System Dynamics & WORLD3", lesson: "dx-2" },
  "dx-exp": { name: "Experiment, hypothesis & scenario", lesson: "dx-3" },
  "dx-ca": { name: "Game of Life, emergence & topology", lesson: "dx-4" },
  "dx-abmx": { name: "ABM concepts & NetLogo", lesson: "dx-5" }
});

/* ---------- extra chapter ---------- */
c.worlds.push({ id: "dxw", n: 15, title: "Exam training: Modelling & Simulation (Granigg)", sub: "Theory behind the true/false part", boss: null, lessons: [

{ id: "dx-1", title: "Systems, models and how to classify them", topic: "dx-sysmod", min: 15, xp: 0, blocks: [
  { t: "lead", html: "The true/false part of the exam tests <b>exact definitions</b>: what a system is, what a model is, and which model classes exist. Many statements are wrong only because two terms were swapped." },
  { t: "text", h: "System (System)", levels: {
    simple: "A system is a set of parts that work together for a purpose and that you can draw a border around.",
    normal: "A <b>system</b> is a set of <b>system elements</b> connected by <b>relationships (Wirkungsverknüpfungen)</b> that together fulfil a purpose and are separated from their environment by a <b>system boundary</b>. The term can refer both to a <b>partial reality</b> (a real company, a real forest) and to an <b>abstraction</b> of such a partial reality.<br>Three criteria (after Bossel) decide whether something is a system:<ul><li><b>System purpose / function (Systemzweck)</b> – the object fulfils a recognisable purpose or function.</li><li><b>System structure (Systemstruktur)</b> – it consists of a specific combination of system elements and relationships.</li><li><b>System integrity (Systemintegrität / Identität)</b> – it loses its identity (its purpose) when it is split up; it is not divisible without losing what makes it the system.</li></ul>A <b>dynamic system</b> is a system whose <b>state variables change over time</b>.",
    technical: "Exam trap: “consists of a specific combination of elements and relationships” is the criterion <b>system structure</b>, not system integrity. Integrity = indivisibility: a car cut in half is two piles of parts, not two cars. Note also that <b>model boundaries are not the same as system boundaries</b>: the system boundary separates the real system from its environment; the model boundary decides which variables are modelled endogenously, which are exogenous inputs and what is left out." } },
  { t: "text", h: "Model (Modell)", levels: {
    simple: "A model is a simplified copy of a piece of reality, built for a question.",
    normal: "A <b>model</b> is, in general, a <b>simplified representation of a partial reality</b>. It keeps only what matters for the purpose. Golden rule: a model should be <b>as simple as possible and as complex as necessary</b> (“so einfach wie möglich, so komplex wie nötig”).<br><b>Behaviour-descriptive models (verhaltensbeschreibende Modelle)</b> only reproduce the observed <i>behaviour</i> of a system (black box, e.g. a regression curve fitted to past data). <b>Structure-valid / behaviour-explaining models (strukturgültige, verhaltenserklärende Modelle)</b> reproduce the behaviour of the real system <b>with the same essential cause-and-effect structure and functionally equivalent system elements</b> – only these can be trusted for new, never observed situations (scenarios).",
    technical: "Typical trap: the definition “same essential structure and functionally equivalent elements” belongs to <b>structure-valid</b> models. A behaviour-descriptive model may fit history perfectly and still fail when the system structure changes (no extrapolation beyond the data)." } },
  { t: "html", html: T(["Criterion", "Class A", "Class B"], [
    ["Time", "<b>time-continuous (zeitkontinuierlich)</b>: states are defined and measurable at <i>every</i> point in time (ODE / System Dynamics)", "<b>time-discrete (zeitdiskret)</b>: states only at discrete time steps (difference equations, ABM, Game of Life)"],
    ["Values", "<b>value-continuous (wertkontinuierlich)</b>: states can take <i>any</i> value in a range (e.g. 12.37 tonnes)", "<b>value-discrete (wertdiskret)</b>: only countable values (number of agents, alive/dead)"],
    ["Randomness", "<b>deterministic</b>: same input → same output, no randomness", "<b>stochastic</b>: random changes of parameters, relationships etc. are modelled with probabilities"],
    ["Change", "<b>static</b>: no time dimension", "<b>dynamic</b>: state variables change over time"],
    ["Validity", "<b>behaviour-descriptive</b>: reproduces behaviour only", "<b>structure-valid</b>: same essential structure + functionally equivalent elements"]
  ]) },
  { t: "warnbox", html: "Swap traps seen in the deck: <i>value-continuous</i> ↔ <i>time-continuous</i>, <i>deterministic</i> ↔ <i>stochastic</i>, <i>integrity</i> ↔ <i>structure</i>, “as simple as <b>possible</b>, as complex as <b>necessary</b>” (not the other way round)." },
  { t: "widget", w: "sorter", topic: "dx-sysmod", title: "Time-continuous or time-discrete?", cats: [{ k: "c", label: "time-continuous" }, { k: "d", label: "time-discrete" }], items: [
    { t: "System Dynamics model of a population (differential equations)", a: "c", why: "SD = system of ODEs, states defined at every t." },
    { t: "Conway’s Game of Life", a: "d", why: "Generations = discrete steps." },
    { t: "NetLogo epidemic model with ticks", a: "d", why: "ABMs run in successive time steps." },
    { t: "Radioactive decay dN/dt = −λN", a: "c", why: "Continuous time ODE." },
    { t: "Monthly bank balance recursion B(t+1) = 1.01·B(t)", a: "d", why: "Difference equation, monthly steps." }
  ] },
  { t: "check", q: "“The states are defined and measurable at every arbitrary point in time.” This defines…", opts: ["value-continuous models", "time-continuous models", "stochastic models", "behaviour-descriptive models"], a: 1, why: "Every point in time → time-continuous. Value-continuous refers to the range of values a state can take." },
  { t: "keys", items: ["system = elements + relationships + purpose + boundary; can be real or an abstraction", "3 criteria: purpose, structure, integrity (indivisibility)", "model = simplified representation of a partial reality; as simple as possible, as complex as necessary", "structure-valid ≠ behaviour-descriptive", "model boundary ≠ system boundary"] }
] },

{ id: "dx-2", title: "System Dynamics in depth & WORLD3", topic: "dx-sd", min: 15, xp: 0, blocks: [
  { t: "lead", html: "System Dynamics (SD) was developed by <b>Jay W. Forrester at MIT in the 1950s</b>. It is a method for modelling and simulating dynamic systems that builds on <b>systems theory and cybernetics</b>." },
  { t: "text", h: "The five kinds of variables", levels: {
    simple: "Stocks store, flows fill and empty them, helpers calculate in between, inputs come from outside, results are what you want to watch.",
    normal: T(["Term (German)", "Meaning"], [
      ["<b>State variable / stock (Zustandsgröße)</b>", "Accumulates over time; describes the state of the system. State variables are (at least partly) <b>independent</b> of each other – they cannot be fully calculated from other state variables. Each state variable gets exactly <b>one differential equation</b>."],
      ["<b>Flow / rate (Zustandsveränderungsgröße, Flussgröße)</b>", "Inflows and outflows that change a state variable: dS/dt = inflow − outflow."],
      ["<b>Auxiliary (Zwischen- bzw. Hilfsgröße)</b>", "Intermediate calculations that make the model readable (e.g. birth rate × population)."],
      ["<b>Input parameter (Vorgabe- bzw. Eingriffsparameter)</b>", "Constant or time-varying quantities defined <b>exogenously</b> in a scenario (policy levers, assumptions)."],
      ["<b>Result variable (Ergebnisgröße)</b>", "Indicators whose development is of special interest (the <b>dependent variables</b>). Can be state variables, flows <i>or</i> auxiliaries."]
    ]),
    technical: "An SD model <b>is a system of (generally non-linear) differential equations</b>: number of state variables = number of ODEs. It is <b>not</b> “simple linear equations” – the interesting behaviour comes precisely from non-linear feedback. Numerically the ODEs are integrated step by step (Euler, Runge–Kutta)." } },
  { t: "text", h: "Rules for feedback loops", levels: {
    simple: "Count the minus signs in a loop: even → it reinforces itself, odd → it balances itself.",
    normal: "<b>Polarity rule:</b> a feedback loop is <b>positive (reinforcing)</b> if the number of <b>opposite (gegensinnig, −) links</b> in the closed chain is <b>even</b> (0, 2, …), and <b>negative (balancing)</b> if it is odd. A negative loop usually – but not always – stabilises; a positive loop usually – but not always – escalates (delays and interaction with other loops can change the overall effect).<br><b>Ban on algebraic loops (Verbot algebraischer Schleifen):</b> every feedback loop must contain <b>at least one state variable</b>. A loop made only of auxiliaries/flows would be a simultaneous equation with no delay (the variable would depend on itself in the same instant).",
    technical: "Trap: the ban requires a <b>state variable</b> (stock), not an auxiliary. Also: the number of relationships in a causal graph has nothing to do with the length of its longest loop." } },
  { t: "text", h: "WORLD3 – the most famous SD model", levels: {
    simple: "A computer model of the whole world from 1972 that warned: endless growth on a finite planet ends in collapse.",
    normal: "WORLD3 was commissioned by the <b>Club of Rome</b> and published 1972 as <i>The Limits to Growth</i> (Meadows et al., MIT, built on Forrester’s WORLD2). It is still one of the best-known SD models. It links a small number of sectors (population, industrial capital, agriculture/food, non-renewable resources, persistent pollution). <b>Core message:</b> if unchecked growth of economy and population continues, the limits to growth will be reached sometime in the 21st century, most probably followed by a <b>sudden, uncontrollable decline (overshoot and collapse)</b> of population and industrial capacity – <b>not</b> a “population explosion”.",
    technical: "Deck statement “nineteen sub-models and 28 differential equations” is marked FALSE: WORLD3 is organised in about five sectors, not nineteen sub-models (compare the exact numbers with Granigg’s slide). The principle behind the second half – one ODE per state variable – is correct in general." } },
  { t: "widget", w: "pairs", topic: "dx-sd", title: "Match the SD terms", pairs: [
    ["Zustandsgröße", "stock that accumulates, one ODE each"],
    ["Zustandsveränderungsgröße", "inflow or outflow of a stock"],
    ["Hilfsgröße", "intermediate calculation"],
    ["Vorgabeparameter", "exogenously defined in a scenario"],
    ["Ergebnisgröße", "indicator of special interest (dependent variable)"]
  ] },
  { t: "check", q: "A loop contains the links +, −, −, +. What is its polarity?", opts: ["positive (reinforcing)", "negative (balancing)", "undefined", "algebraic loop"], a: 0, why: "Two opposite links = even → positive loop." },
  { t: "keys", items: ["Forrester, MIT, 1950s; systems theory & cybernetics", "SD model = system of differential equations; #states = #ODEs", "even number of − links → positive loop", "each loop needs at least one state variable (no algebraic loops)", "WORLD3 / Club of Rome / Limits to Growth: overshoot and collapse"] }
] },

{ id: "dx-3", title: "Experiment, hypothesis, scenario and simulation", topic: "dx-exp", min: 12, xp: 0, blocks: [
  { t: "lead", html: "Simulation is treated as a kind of <b>experiment on a model</b>. The vocabulary comes from empirical research." },
  { t: "text", h: "Vocabulary of empirical research", levels: {
    simple: "You change something (independent variable) and watch what happens (dependent variable).",
    normal: "<ul><li><b>Experiment</b>: empirical research method in which one or more <b>independent variables</b> are varied to observe the effect on certain <b>dependent variables</b>.</li><li><b>Hypothesis</b>: a generally valid assumption/claim about facts in the form of a <b>conditional sentence</b> (“if – then”, “the more – the more”) that must be – at least potentially – <b>falsifiable</b>.</li><li><b>Independent variable</b> = the <b>if / the more</b> part (“Wenn / Je”). <b>Dependent variable</b> = the <b>then / the more</b> part (“Dann / Desto”).</li><li><b>Confounding variable (Störvariable)</b>: a condition or cause that influences the result but was not captured.</li><li><b>Parameter</b>: a fixed value that is not influenced by the variables.</li><li><b>Theory</b>: a network of well-confirmed hypotheses; with increasing confirmation it takes on the character of a <b>law (Gesetzmäßigkeit)</b>.</li></ul>",
    technical: "Popper: hypotheses can never be verified definitively, only falsified; a hypothesis that survives many tests is “bewährt” (corroborated)." } },
  { t: "text", h: "Scenario and simulation", levels: {
    simple: "A scenario is one set of input settings. Simulating means computing what the model does with them.",
    normal: "A <b>scenario</b> is a specific combination of the <b>independent</b> variables (input parameters) for one simulation run – not of the dependent ones (those are the results).<br><b>Simulation in the broad sense (i. w. S.)</b> = the whole complex of modelling and simulation. <b>Simulation in the narrow sense (i. e. S.)</b> = one central step of that process: the actual <b>computation of a scenario</b>.",
    technical: "Same split for agents: ABM (modelling) → ABP (programming/implementation) → ABS i. e. S. (computing scenarios over time); ABS i. w. S. is the umbrella term for all three." } },
  { t: "widget", w: "gapfill", topic: "dx-exp", title: "Fill the gaps", items: [
    { s: "The independent variable belongs to the ___ part of a hypothesis.", a: ["if", "wenn", "if/the more", "je"] },
    { s: "The dependent variable belongs to the ___ part of a hypothesis.", a: ["then", "dann", "desto", "then/the more"] },
    { s: "A hypothesis must be at least potentially ___.", a: ["falsifiable", "falsifizierbar"] },
    { s: "A network of well-confirmed hypotheses is called a ___.", a: ["theory", "theorie"] },
    { s: "A scenario is a combination of the ___ variables.", a: ["independent", "unabhängigen", "unabhängige"] }
  ] },
  { t: "check", q: "Which statement about a scenario is correct?", opts: ["It is a combination of dependent variables", "It is a combination of independent variables / input parameters for a run", "It is the same as a theory", "It is the computed result of a run"], a: 1, why: "Inputs (independent variables, Vorgabeparameter) define the scenario; the dependent variables are what you observe." },
  { t: "keys", items: ["experiment: vary independent, observe dependent variables", "hypothesis: conditional sentence, falsifiable", "Störvariable = uncaptured cause; parameter = fixed value", "theory = network of corroborated hypotheses → law", "simulation i. w. S. = whole process; i. e. S. = computing a scenario"] }
] },

{ id: "dx-4", title: "Game of Life, emergence and the torus", topic: "dx-ca", min: 12, xp: 0, blocks: [
  { t: "lead", html: "Conway’s <b>Game of Life</b> shows how a tiny rule set on the level of <b>cellular automata</b> can produce complex dynamic processes – the classic example of <b>emergence</b>." },
  { t: "text", h: "Game of Life", levels: {
    simple: "Squares on a grid are alive or dead. Each round they look at their 8 neighbours and follow two simple rules.",
    normal: "Designed by <b>John Horton Conway in 1970</b>, building on ideas of <b>John von Neumann</b> (self-reproducing cellular automata). Each cell is alive or dead and has 8 neighbours (Moore neighbourhood). Rules per generation (all cells update <b>simultaneously</b>):<ul><li>a dead cell with exactly <b>3</b> live neighbours is born,</li><li>a live cell with <b>2 or 3</b> live neighbours survives,</li><li>otherwise the cell dies / stays dead.</li></ul>From this, still lifes (block), oscillators (blinker) and moving gliders emerge.",
    technical: "Rule notation B3/S23. The Game of Life is Turing-complete. It is time-discrete, value-discrete and deterministic." } },
  { t: "text", h: "Emergence", levels: {
    simple: "The whole shows something none of the parts has or was told to do.",
    normal: "<b>Emergence</b> is a non-trivial relationship between the properties of a system on the <b>disaggregated</b> level (individual elements/agents) and on the <b>aggregated</b> level (the whole). Example: traffic jams, flocks, glider patterns – nobody programmed them directly.",
    technical: "ABMs are the typical tool to study emergence: rules are formulated on the micro level, results observed on the macro level." } },
  { t: "text", h: "Torus and Euler characteristic", levels: {
    simple: "If the grid wraps around at the edges (like Pac-Man), it is a donut surface: finite, but you never hit a wall.",
    normal: "Grid worlds (Game of Life, NetLogo) often wrap around horizontally and vertically – topologically a <b>flat 2-torus</b>: a surface of <b>finite area that is nevertheless unbounded</b> (no edge). The <b>Euler characteristic</b> χ = V − E + F of a <b>2-sphere is 2</b>, of a <b>2-torus 0</b>.<br>Poincaré–Hopf / hairy ball theorem: on a closed surface with χ <b>≠ 0</b> (e.g. sphere) every continuous vector field must have at least one <b>vortex/zero (Wirbel)</b> – “you cannot comb a hairy ball flat”. On a surface with χ <b>= 0</b> (torus) a vector field <b>without</b> any vortex is possible.",
    technical: "Sum of the indices of all zeros of a vector field = χ. For χ = 0 the sum can be 0 with no zeros at all, so no vortex is forced. Wrapping avoids edge effects in simulations." } },
  { t: "check", q: "Which statement about a flat 2-torus is correct?", opts: ["infinite area, clearly bounded", "finite area, but unbounded (no edge)", "infinite area, unbounded", "finite area with four edges"], a: 1, why: "Wrapping removes the edges, but the area stays finite." },
  { t: "keys", items: ["Game of Life: Conway 1970, based on von Neumann; B3/S23", "emergence: non-trivial link between disaggregated and aggregated level", "flat torus: finite but unbounded", "χ(sphere) = 2, χ(torus) = 0", "χ ≠ 0 → every vector field has a vortex; χ = 0 → not necessarily"] }
] },

{ id: "dx-5", title: "Agent-based modelling: concepts, NetLogo, learning", topic: "dx-abmx", min: 15, xp: 0, blocks: [
  { t: "lead", html: "Granigg’s ABM part is definition-heavy. Learn the terms exactly." },
  { t: "text", h: "Definitions", levels: {
    simple: "Model the individuals, program them, run them, watch the whole.",
    normal: "<b>Agent-based modelling (ABM)</b>: the <b>disaggregated</b>, mostly <b>explanatory</b> and <b>stochastic</b> formulation of a complex system. <i>Purpose</i>: understanding, optimisation or prognosis. <i>Focus</i>: similar but quite heterogeneous units of a system whose interaction forms an emergence.<br><b>Agent-based programming (ABP)</b>: implementing an ABM in a suitable programming language or modelling and simulation environment.<br><b>Agent-based simulation i. e. S.</b>: computing scenarios in an implemented ABM over time. <b>ABS i. w. S.</b>: umbrella term for ABM, ABP and ABS i. e. S.",
    technical: "Typical characteristics of ABMs:<ul><li><b>Ontological representation</b>: usually a direct correspondence between the model’s agents and the actors of the real system (persons, firms, states …).</li><li><b>Heterogeneity</b>: agents differ in certain dimensions (age, sex, …), values mostly drawn randomly from probability distributions.</li><li><b>Direct representation of the environment</b>: the outside world/environment is usually a direct part of the model and does not lie outside the modelling.</li></ul>" } },
  { t: "text", h: "Time and the parallelism problem", levels: {
    simple: "Agents act in rounds. In theory they all act at the same time – a computer has to fake that.",
    normal: "ABMs are generally <b>time-discrete</b>: the simulation runs in successive time steps (ticks). Within one discrete step all agents should in principle work <b>in parallel / simultaneously</b>. Because a computer activates them one after the other, there are three strategies:<ul><li><b>Sequential asynchronous execution</b>: all agents are activated serially in a <b>fixed order</b> per time step.</li><li><b>Random asynchronous execution</b>: all agents are activated serially in a <b>random order</b> per time step (NetLogo’s <code>ask</code> does this).</li><li><b>Simulated synchronous execution</b>: multiple activation of all agents per step so that <b>all inputs of all agents happen before all outputs</b> – the best but most complex approach (e.g. first all agents read/decide, then all update).</li></ul>",
    technical: "Fixed order creates systematic advantages for early agents (order artefacts); random order removes the bias on average; synchronous execution reproduces true simultaneity (Game of Life must be updated this way)." } },
  { t: "text", h: "Learning of agents", levels: {
    simple: "Learn alone, learn from others, or the whole population learns over generations.",
    normal: "<ul><li><b>Individual learning</b>: insights that individual agents gain individually (e.g. trial and error, reinforcement learning).</li><li><b>Social learning</b>: individually gained insights are <b>passed on</b> to other agents (imitation, communication). Passing on knowledge is <b>not</b> reinforcement learning.</li><li><b>Evolutionary learning</b>: insights are available to a <b>whole population</b> (through reproduction, variation and selection over generations).</li></ul>",
    technical: "Evolution mechanisms: <b>reproduction</b> (agents create new agents), <b>variation/mutation</b> (new agents differ in certain dimensions), <b>selection</b> (this leads to different survival probabilities). <b>Phylogenesis</b> = evolution of a species over (millions of) generations; <b>ontogenesis</b> = development of one individual during its lifetime." } },
  { t: "text", h: "NetLogo", levels: {
    simple: "A free tool for agent models with turtles that walk on patches.",
    normal: "NetLogo was and is developed at the <b>Center for Connected Learning and Computer-Based Modeling (CCL), Northwestern University</b> (Evanston, near Chicago; Uri Wilensky, 1999). Agent types: <b>turtles</b> (mobile agents), <b>patches</b> (cells of the grid), <b>links</b> (connections between turtles) – strictly speaking also the <b>observer</b>, who gives commands from above. The default world wraps around: a torus.",
    technical: "Ticks advance time (<code>tick</code>); <code>ask turtles [ … ]</code> activates agents in random order." } },
  { t: "widget", w: "pairs", topic: "dx-abmx", title: "Match the execution scheme", pairs: [
    ["Sequential asynchronous", "fixed order, serial, once per step"],
    ["Random asynchronous", "random order, serial, once per step"],
    ["Simulated synchronous", "all inputs before all outputs"],
    ["Social learning", "insights are passed on"],
    ["Evolutionary learning", "insights available to whole population"]
  ] },
  { t: "check", q: "Agents imitate the strategy of a successful neighbour. Which learning type?", opts: ["individual learning", "social learning", "evolutionary learning", "reinforcement learning"], a: 1, why: "Insights of one agent are passed on to others → social learning." },
  { t: "keys", items: ["ABM: disaggregated, mostly explanatory and stochastic", "ABM → ABP → ABS i. e. S.; ABS i. w. S. = all three", "ontological representation, heterogeneity, direct environment", "time-discrete; three execution schemes", "NetLogo: CCL Northwestern; turtles, patches, links (+ observer)"] }
] },

{ id: "dx-6", title: "Evolution simulation & metaheuristics", topic: "mcevo", min: 8, xp: 0, blocks: [
  { t: "lead", html: "Evolutionary algorithms and swarm methods are <b>metaheuristics</b>: general search strategies that find good (not guaranteed optimal) solutions to hard problems." },
  { t: "text", h: "Mechanisms and metaheuristics", levels: {
    simple: "Copy the good ones, change them a bit, keep the best – repeat.",
    normal: "Three mechanisms to simulate evolution:<ul><li><b>Reproduction</b> – agents bring forth new agents,</li><li><b>Variation / mutation</b> – new agents differ in certain dimensions,</li><li><b>Selection</b> – this leads to different survival probabilities.</li></ul>Important <b>metaheuristics</b>: genetic/evolutionary algorithms, <b>ACO</b> (Ant Colony Optimization – virtual ants lay pheromone on good paths) and <b>PSO</b> (Particle Swarm Optimization – particles move towards their own and the swarm’s best position), also simulated annealing, tabu search.",
    technical: "Phylogenesis (evolution of a species) vs. ontogenesis (development of an individual). Genetic algorithms model phylogenesis; individual learning of agents models ontogenesis." } },
  { t: "check", q: "Which pair are both metaheuristics?", opts: ["ACO and PSO", "OLS and PCA", "SQL and CSV", "k-NN and SIR"], a: 0, why: "Ant Colony Optimization and Particle Swarm Optimization are swarm-based metaheuristics." }
] }
] });

/* ---------- 65 true/false statements from the Anki deck (card 51 is only a reminder "look at slides from p. 64 again") ---------- */
const SRC = "Anki deck Granigg (T/F)";
const TF = (id, topic, q, isTrue, why) => ({ id, topic, q, opts: ["True", "False"], a: isTrue ? 0 : 1, why, alt: true, src: SRC });
c.questions.push(
  TF("dxq1", "modsim", "“Dynamic systems” are systems whose state variables change over time.", true, "Correct – that is the definition of a dynamic system (dynamisches System)."),
  TF("dxq2", "dx-ca", "The ‘Game of Life’ was designed by John Horton Conway in 1970, building on ideas of John von Neumann.", true, "Correct – Conway 1970, inspired by von Neumann’s self-reproducing cellular automata."),
  TF("dxq3", "dx-sysmod", "Behaviour-descriptive models (verhaltensbeschreibende Modelle) reproduce the behaviour of real systems with the same essential cause-and-effect structure and functionally equivalent system elements.", false, "False – that defines <b>structure-valid (strukturgültige / verhaltenserklärende)</b> models. Behaviour-descriptive models only reproduce the observed behaviour, not the structure."),
  TF("dxq4", "dx-sd", "System Dynamics was developed by Jay W. Forrester at MIT in the 1950s.", true, "Correct."),
  TF("dxq5", "dx-sd", "The core message of WORLD3 is that continuing unchecked economic and population growth will lead to a dynamic population explosion sometime in the 21st century.", false, "False – the limits to growth would be reached in the 21st century, most probably followed by <b>overshoot and collapse</b>: a sudden, uncontrollable decline of population and industrial capacity."),
  TF("dxq6", "dx-ca", "Emergence (Emergenz) is a non-trivial relationship between the properties of a system on the disaggregated and on the aggregated level.", true, "Correct – that is the lecture definition of emergence."),
  TF("dxq7", "dx-sd", "System Dynamics is a method for modelling and simulating dynamic systems that builds on systems-theoretical or cybernetic foundations.", true, "Correct."),
  TF("dxq8", "dx-sysmod", "The states of value-continuous (wertkontinuierliche) models are defined and measurable at every arbitrary point in time.", false, "False – that holds for <b>time-continuous</b> models. Value-continuous means a state can take any value within a range."),
  TF("dxq9", "dx-sd", "WORLD3 is a System Dynamics model consisting of nineteen sub-models and containing a total of 28 differential equations describing its 28 state variables.", false, "False (per the deck) – WORLD3 is organised in about five sectors (population, capital, agriculture, resources, pollution), not nineteen sub-models; check the exact numbers on the slide. (That one ODE belongs to each state variable is correct in general.)"),
  TF("dxq10", "dx-exp", "An experiment is an empirical research method in which one or more independent variables are varied in order to observe the effect on certain dependent variables.", true, "Correct."),
  TF("dxq11", "dx-sd", "In System Dynamics, state variables are essentially modelled with simple linear equations.", false, "False – state variables are modelled with <b>differential equations</b> (integration of flows), generally non-linear. An SD model is a system of ODEs."),
  TF("dxq12", "dx-abmx", "In NetLogo the agent types ‘patches’, ‘turtles’ and ‘links’ can be distinguished; strictly speaking the overarching ‘observer’ is also an agent type of its own.", true, "Correct."),
  TF("dxq13", "dx-sd", "A System Dynamics model corresponds to a system of differential equations.", true, "Correct – one differential equation per state variable."),
  TF("dxq14", "dx-exp", "A ‘scenario’ is a specific combination of the dependent variables for a simulation.", false, "False – a scenario is a combination of the <b>independent</b> variables (input parameters, Vorgabe-/Eingriffsparameter). Dependent variables are the results."),
  TF("dxq15", "dx-sysmod", "The criterion of system integrity (Systemintegrität) is fulfilled exactly when an object consists of a specific combination of system elements and relationships.", false, "False – that is the criterion <b>system structure</b>. System integrity means the system loses its identity/purpose when divided."),
  TF("dxq16", "dx-sd", "Input or intervention parameters (Vorgabe- bzw. Eingriffsparameter) in System Dynamics models are constant or time-varying quantities that are defined exogenously within scenarios.", true, "Correct."),
  TF("dxq17", "mcevo", "ACO and PSO are important metaheuristics.", true, "Correct – Ant Colony Optimization and Particle Swarm Optimization."),
  TF("dxq18", "dx-abmx", "NetLogo was/is developed at the Center for Connected Learning and Computer-Based Modeling (CCL) at Northwestern University in Chicago.", true, "Correct (strictly: Evanston, a suburb of Chicago; developed by Uri Wilensky)."),
  TF("dxq19", "dx-sd", "State variables are (at least partly) independent of each other, i.e. they cannot be fully calculated from other state variables.", true, "Correct – otherwise they would be auxiliaries, not states."),
  TF("dxq20", "dx-abmx", "When individually gained insights are passed on, this is called reinforcement learning.", false, "False – passing on individual insights is <b>social learning</b>. Reinforcement learning is a form of individual learning by reward."),
  TF("dxq21", "dx-sysmod", "A model should always be as simple as necessary and at the same time as complex as possible.", false, "False – reversed: <b>as simple as possible and as complex as necessary</b>."),
  TF("dxq22", "dx-sd", "The world model WORLD3, commissioned by the Club of Rome, is still one of the best-known System Dynamics models.", true, "Correct – published 1972 as “The Limits to Growth”."),
  TF("dxq23", "dx-ca", "A flat 2-torus yields an infinitely large area that is, however, clearly bounded.", false, "False – the opposite: a flat torus has a <b>finite</b> area but is <b>unbounded</b> (no edges)."),
  TF("dxq24", "modsim", "A negative feedback loop usually, but not always, has a stabilising overall effect.", true, "Correct – delays or interacting loops can cause oscillations instead."),
  TF("dxq25", "dx-sd", "The ban on algebraic loops in System Dynamics states that feedback loops must contain at least one intermediate/auxiliary variable.", false, "False – every feedback loop must contain at least one <b>state variable (Zustandsgröße)</b>."),
  TF("dxq26", "dx-sysmod", "In “deterministic models”, random changes of parameters, relationships etc. are modelled with probabilities.", false, "False – that describes <b>stochastic</b> models. Deterministic models contain no randomness."),
  TF("dxq27", "dx-sysmod", "In general, a ‘model’ is a simplified representation of a partial reality.", true, "Correct."),
  TF("dxq28", "dx-sysmod", "The term ‘system’ can refer both to partial realities and to abstractions of these partial realities.", true, "Correct."),
  TF("dxq29", "modsim", "A ‘positive feedback loop’ exists if the number of opposite (gegensinnige, −) relationships in a closed chain of effects is even.", true, "Correct – even number of − links (incl. zero) → positive/reinforcing; odd → negative."),
  TF("dxq30", "modsim", "The number of relationships in a causal graph (Wirkungsgraph) always equals the length of the longest feedback loop in this graph.", false, "False – there is no such rule; a graph can have many links that are not part of any loop."),
  TF("dxq31", "dx-abmx", "‘Agent-based programming’ means implementing an agent-based model in a suitable programming language or in a suitable modelling and simulation environment.", true, "Correct."),
  TF("dxq32", "dx-sd", "‘State-change variables’ (Zustandsveränderungsgrößen) in System Dynamics models represent inflows or outflows of state variables (‘flows’).", true, "Correct."),
  TF("dxq33", "dx-ca", "The Game of Life impressively shows how a simple rule set on the level of ‘cellular automata’ can produce complex dynamic processes.", true, "Correct – a classic example of emergence."),
  TF("dxq34", "dx-ca", "A 2-sphere has an Euler characteristic of 2, whereas a 2-torus has an Euler characteristic of 0.", true, "Correct (χ = V − E + F)."),
  TF("dxq35", "dx-ca", "For closed surfaces with an Euler characteristic equal to 0, any vector field drawn on them must have at least one vortex.", false, "False – only for χ <b>≠ 0</b> (e.g. the sphere) is a vortex forced. On a torus (χ = 0) a vortex-free vector field exists."),
  TF("dxq36", "dx-ca", "For closed surfaces with an Euler characteristic not equal to 0, any vector field drawn on them must have at least one vortex.", true, "Correct – Poincaré–Hopf / hairy ball theorem."),
  TF("dxq37", "modsim", "A positive feedback loop usually, but not always, has an escalating overall effect.", true, "Correct."),
  TF("dxq38", "dx-ca", "On a 2-torus (Euler characteristic 0) it is possible to draw a continuous vector field without any vortex.", true, "Correct – this is why the deck marks “χ = 0 → must have a vortex” as false (the deck asks this twice)."),
  TF("dxq39", "dx-exp", "A hypothesis is a generally valid assumption/claim about facts; it must have the form of a conditional sentence (‘if–then’ / ‘the more–the more’) that is at least potentially falsifiable.", true, "Correct."),
  TF("dxq40", "dx-exp", "An independent variable belongs to the ‘if’ / ‘the more’ (Wenn / Je) part of a hypothesis.", true, "Correct."),
  TF("dxq41", "dx-exp", "A dependent variable belongs to the ‘if’ (Wenn) part of a hypothesis.", false, "False – the dependent variable belongs to the <b>‘then’ / ‘the more’ (Dann / Desto)</b> part."),
  TF("dxq42", "dx-exp", "A confounding variable (Störvariable) is a condition or cause that was not captured.", true, "Correct."),
  TF("dxq43", "dx-exp", "A parameter is a fixed value that is not influenced by the variables.", true, "Correct."),
  TF("dxq44", "dx-exp", "A theory is a network of well-confirmed (bewährte) hypotheses.", true, "Correct."),
  TF("dxq45", "dx-exp", "With an increasing degree of confirmation, a theory takes on the character of a law (Gesetzmäßigkeit).", true, "Correct."),
  TF("dxq46", "dx-exp", "Simulation in the broad sense (i. w. S.) means only the actual computation of a single scenario.", false, "False – that is simulation in the <b>narrow</b> sense. In the broad sense it is the whole complex of modelling and simulation."),
  TF("dxq47", "dx-exp", "Simulation in the narrow sense (i. e. S.) is one central step of the modelling-and-simulation process, namely the actual computation of a scenario.", true, "Correct."),
  TF("dxq48", "dx-abmx", "Individual learning means insights that individual agents gain individually.", true, "Correct."),
  TF("dxq49", "dx-abmx", "Social learning means that individually gained insights are passed on.", true, "Correct."),
  TF("dxq50", "dx-abmx", "Evolutionary learning means that insights are available only to the single agent that gained them.", false, "False – in evolutionary learning insights are available to a <b>whole population</b> (via reproduction and selection)."),
  TF("dxq51", "dx-abmx", "Agent-based simulation in the narrow sense is the computation of scenarios in an implemented agent-based model over time.", true, "Correct."),
  TF("dxq52", "dx-abmx", "Agent-based simulation in the broad sense is an umbrella term for agent-based modelling, agent-based programming and agent-based simulation in the narrow sense.", true, "Correct."),
  TF("dxq53", "dx-abmx", "‘Ontological representation’ means that there is usually a direct correspondence between the agents of the model and the actors of the real system (persons, firms, states …).", true, "Correct."),
  TF("dxq54", "dx-abmx", "‘Heterogeneity’ in ABMs means that all agents are modelled identically so that results stay comparable.", false, "False – heterogeneity means agents differ in certain dimensions (age, sex …), usually with values drawn randomly from probability distributions."),
  TF("dxq55", "dx-abmx", "In agent-based modelling the environment of a system usually lies outside the model and is only represented by exogenous inputs.", false, "False – <b>direct representation of the environment</b>: in ABMs the environment is usually a direct part of the model and does not lie outside the modelling."),
  TF("dxq56", "dx-sysmod", "Model boundaries are not the same as system boundaries.", true, "Correct – the model boundary decides what is modelled endogenously; it is a modelling choice, not the boundary of the real system."),
  TF("dxq57", "mcevo", "Reproduction, variation/mutation and selection are three important mechanisms when simulating evolutionary processes.", true, "Correct: reproduction (agents create new agents), variation (new agents differ), selection (different survival probabilities)."),
  TF("dxq58", "mcevo", "Phylogenesis describes the development of one individual within its lifetime.", false, "False – that is <b>ontogenesis</b>. Phylogenesis is the evolution of a species over (millions of) years/generations."),
  TF("dxq59", "dx-abmx", "Agent-based models are in general time-discrete models, i.e. agent-based simulations run in successive time steps.", true, "Correct."),
  TF("dxq60", "dx-abmx", "In ‘random asynchronous execution’ all agents are activated serially in a fixed order per time unit.", false, "False – fixed order = <b>sequential</b> asynchronous execution. Random asynchronous uses a random order each time unit."),
  TF("dxq61", "dx-abmx", "‘Simulated synchronous execution’ activates all agents several times per time unit so that all inputs of all agents take place before all outputs; it is the best but also the most complex approach.", true, "Correct."),
  TF("dxq62", "dx-abmx", "When simulating agent-based models it is generally required that within one discrete time step all agents ‘work’ in parallel / simultaneously.", true, "Correct – hence the parallelism problem and the three execution schemes."),
  TF("dxq63", "dx-sd", "Result variables (Ergebnisgrößen) in System Dynamics models are quantities or indicators whose development is of special interest (dependent variables).", true, "Correct."),
  TF("dxq64", "dx-sd", "Result variables can be state variables, state-change variables or intermediate/auxiliary variables.", true, "Correct – any variable can be chosen as an indicator of interest."),
  TF("dxq65", "dx-sd", "The number of state variables equals the number of differential equations.", true, "Correct – each stock gets one ODE."),
  TF("dxq66", "dx-abmx", "‘Agent-based modelling’ means the disaggregated and mostly explanatory and stochastic formulation of a complex system.", true, "Correct. Purpose: understanding, optimisation or prognosis; focus: similar, but heterogeneous units whose interaction forms an emergence."),
  /* extra exam-style items */
  { id: "dxq67", topic: "dx-sysmod", q: "Which combination describes Conway’s Game of Life?", opts: ["time-continuous, value-continuous, stochastic", "time-discrete, value-discrete, deterministic", "time-discrete, value-continuous, stochastic", "time-continuous, value-discrete, deterministic"], a: 1, why: "Generations (discrete time), alive/dead (discrete values), fixed rules without randomness.", alt: true, src: "Exam-style" },
  { id: "dxq68", topic: "modsim", q: "A causal loop has the links −, −, −. Its polarity is…", opts: ["positive (reinforcing)", "negative (balancing)", "neutral", "cannot be determined"], a: 1, why: "Three opposite links = odd number → negative loop.", alt: true, src: "Exam-style" },
  { id: "dxq69", topic: "dx-sd", q: "A loop consists only of auxiliaries A → B → C → A. What is wrong?", opts: ["Nothing", "It is an algebraic loop – it needs at least one state variable", "It needs an input parameter", "It needs a result variable"], a: 1, why: "Without a stock the variables would determine each other simultaneously – forbidden in SD.", alt: true, src: "Exam-style" },
  { id: "dxq70", topic: "dx-ca", q: "A dead cell in the Game of Life has exactly 3 live neighbours. What happens in the next generation?", opts: ["it stays dead", "it becomes alive", "it depends on random chance", "it dies twice"], a: 1, why: "Birth rule B3.", alt: true, src: "Exam-style" }
);

/* ---------- open cards (definitions asked in the deck + key terms) ---------- */
const F = (id, topic, front, back) => ({ id, cat: "DASC", topic, front, back, alt: true });
c.flashcards.push(
  F("dxf1", "dx-exp", "What is a theory?", "A <b>network of well-confirmed (bewährte) hypotheses</b>; with increasing confirmation it takes on the character of a law (Gesetzmäßigkeit)."),
  F("dxf2", "dx-exp", "Simulation in the broad vs. narrow sense?", "<b>Broad (i. w. S.)</b>: the whole complex of modelling and simulation.<br><b>Narrow (i. e. S.)</b>: a central step of this process – the actual computation of a scenario."),
  F("dxf3", "dx-abmx", "Individual, social and evolutionary learning?", "<ul><li><b>Individual</b>: insights single agents gain individually</li><li><b>Social</b>: individually gained insights are passed on</li><li><b>Evolutionary</b>: insights are available to a whole population</li></ul>"),
  F("dxf4", "dx-abmx", "Agent-based simulation in the narrow and broad sense?", "<b>Narrow</b>: computing scenarios in an implemented ABM over time.<br><b>Broad</b>: umbrella term for agent-based modelling, agent-based programming and agent-based simulation (narrow sense)."),
  F("dxf5", "dx-abmx", "What is ‘ontological representation’ in ABM?", "There is usually a <b>direct correspondence</b> between the agents of the model and the actors of the real system (persons, firms, states …)."),
  F("dxf6", "dx-abmx", "What is ‘heterogeneity’ in ABM?", "Agents are usually not modelled uniformly but differ in certain dimensions (age, sex …); the values are mostly drawn randomly from probability distributions."),
  F("dxf7", "dx-abmx", "Direct representation of the system environment in ABM?", "The outside world / environment of a system is usually a <b>direct part of the model</b> in ABM and therefore does not lie outside the modelling."),
  F("dxf8", "mcevo", "Name and describe 3 mechanisms for simulating evolutionary processes.", "<ul><li><b>Reproduction</b>: agents bring forth new agents</li><li><b>Variation / mutation</b>: new agents differ in certain dimensions</li><li><b>Selection</b>: leads to different survival probabilities</li></ul>"),
  F("dxf9", "mcevo", "Phylogenesis vs. ontogenesis?", "<b>Phylogenesis</b> = evolution of a <b>species</b> over (millions of) years.<br><b>Ontogenesis</b> = development of an <b>individual</b> within its lifetime."),
  F("dxf10", "dx-abmx", "Parallelism problem: explain sequential asynchronous, random asynchronous and simulated synchronous execution.", "<ul><li><b>Sequential asynchronous</b>: all agents activated serially in a fixed order per time unit</li><li><b>Random asynchronous</b>: serially in a random order per time unit</li><li><b>Simulated synchronous</b>: multiple activation of all agents per time unit so that all inputs of all agents happen before all outputs – best but most complex</li></ul>"),
  F("dxf11", "dx-abmx", "Define agent-based modelling. Purpose? Focus?", "The <b>disaggregated</b>, mostly <b>explanatory</b> and <b>stochastic</b> formulation of a complex system.<br><b>Purpose</b>: understanding, optimisation or prognosis.<br><b>Focus</b>: similar but heterogeneous units of a system that together form an emergence."),
  F("dxf12", "dx-sd", "Name the five kinds of variables in a System Dynamics model.", "<b>State variables</b> (Zustandsgrößen, stocks), <b>state-change variables</b> (Zustandsveränderungsgrößen, flows), <b>auxiliaries</b> (Zwischen-/Hilfsgrößen), <b>input/intervention parameters</b> (Vorgabe-/Eingriffsparameter, exogenous), <b>result variables</b> (Ergebnisgrößen, indicators of interest)."),
  F("dxf13", "dx-sd", "Ban on algebraic loops + polarity rule?", "Every feedback loop must contain <b>at least one state variable</b>.<br>Loop polarity: <b>even</b> number of opposite (−) links → positive/reinforcing; <b>odd</b> → negative/balancing."),
  F("dxf14", "dx-sysmod", "Three criteria of a system (Bossel)?", "<b>System purpose/function</b>, <b>system structure</b> (specific combination of elements and relationships), <b>system integrity</b> (not divisible without losing its identity)."),
  F("dxf15", "dx-sysmod", "Behaviour-descriptive vs. structure-valid models?", "<b>Behaviour-descriptive</b>: only reproduce observed behaviour (black box).<br><b>Structure-valid</b>: reproduce behaviour with the same essential cause-and-effect structure and functionally equivalent elements → usable for new scenarios."),
  F("dxf16", "dx-sysmod", "Time-continuous vs. value-continuous?", "<b>Time-continuous</b>: states defined and measurable at every point in time.<br><b>Value-continuous</b>: states can take any value within a range.<br>(Opposites: time-discrete, value-discrete.)"),
  F("dxf17", "dx-ca", "Emergence – definition and example?", "A non-trivial relationship between the properties of a system on the <b>disaggregated</b> and the <b>aggregated</b> level. Example: gliders in the Game of Life, traffic jams, flocking."),
  F("dxf18", "dx-exp", "Hypothesis: definition and which variable goes where?", "Generally valid assumption in the form of a conditional sentence (if–then / the more–the more), at least potentially <b>falsifiable</b>. Independent variable → if/the more part; dependent variable → then/the more part."),
  F("dxf19", "dx-sd", "What is WORLD3 and what is its core message?", "SD world model commissioned by the <b>Club of Rome</b> (Meadows et al., MIT, “The Limits to Growth”, 1972). If unchecked growth continues, the limits are reached in the 21st century, most probably followed by <b>overshoot and collapse</b> of population and industrial capacity."),
  F("dxf20", "dx-ca", "Euler characteristic of sphere and torus – and what follows for vector fields?", "χ(sphere) = 2, χ(torus) = 0. If χ ≠ 0, every continuous vector field has at least one vortex/zero (hairy ball theorem); if χ = 0 a vortex-free field is possible.")
);

/* ---------- exam prep overview ---------- */
c.examPrep = {
  format: "Part 2 (Granigg, modelling & simulation) is graded via a knowledge assessment worth 30 points plus 10 points participation; Part 1 (Hammer) has its own homework and knowledge assessment. According to the Anki deck from former students, the Part-2 assessment contains a true/false section with statements that are very close to the slide wording (often a correct definition with one term swapped), plus short open definition questions (e.g. parallelism problem, learning types, phylogenesis/ontogenesis). Exact duration, number of items and whether wrong answers cost points are not in the sources – check Moodle.",
  sources: ["Anki deck “DataScience Granigg 4. True/False” (66 cards)"],
  strategy: [
    "Learn the definitions word-for-word: model, system, emergence, experiment, hypothesis, scenario, simulation i. w. S./i. e. S., ABM/ABP/ABS – most false statements swap exactly one term.",
    "Know the classic swap pairs: time- vs. value-continuous, deterministic vs. stochastic, structure vs. integrity, dependent vs. independent, sequential vs. random asynchronous, phylo- vs. ontogenesis.",
    "SD rules: #state variables = #ODEs, every loop needs a state variable, even number of − links = positive loop; negative loops usually (not always) stabilise.",
    "Names and dates: Forrester/MIT/1950s, Conway/1970/von Neumann, WORLD3/Club of Rome/overshoot and collapse, NetLogo/CCL/Northwestern.",
    "Topology: sphere χ = 2, torus χ = 0; χ ≠ 0 forces a vortex; flat torus = finite but unbounded.",
    "Practise one Euler step and one loop-polarity analysis so that calculation questions are routine."
  ],
  focus: [
    { topic: "dx-sd", weight: 3, note: "16 of 66 deck cards: SD history, variable types, ODEs, algebraic loops, WORLD3" },
    { topic: "dx-abmx", weight: 3, note: "17 cards: ABM definitions, characteristics, parallelism, learning types, NetLogo" },
    { topic: "dx-exp", weight: 3, note: "11 cards: experiment, hypothesis, variables, theory, scenario, simulation i. w. S./i. e. S." },
    { topic: "dx-sysmod", weight: 3, note: "8 cards: system, model, model classification, model vs. system boundary" },
    { topic: "dx-ca", weight: 2, note: "8 cards: Game of Life, emergence, torus, Euler characteristic" },
    { topic: "modsim", weight: 2, note: "5 cards: dynamic systems, feedback polarity and effect" },
    { topic: "mcevo", weight: 2, note: "3 cards: evolution mechanisms, phylo-/ontogenesis, metaheuristics ACO/PSO" },
    { topic: "ode", weight: 1, note: "not asked directly in the deck, but SD = ODEs; Euler step for transfer tasks" },
    { topic: "abm", weight: 1, note: "basics behind the ABM definitions (emergence, stochastic runs)" }
  ],
  checklist: [
    { id: "dxc1", topic: "dx-sysmod", text: "Define system and model and name the three system criteria (purpose, structure, integrity)." },
    { id: "dxc2", topic: "dx-sysmod", text: "Classify any model as time-/value-continuous or discrete, deterministic or stochastic, behaviour-descriptive or structure-valid." },
    { id: "dxc3", topic: "dx-sysmod", text: "Explain why model boundaries ≠ system boundaries and why a model should be as simple as possible, as complex as necessary." },
    { id: "dxc4", topic: "dx-sd", text: "Name the five SD variable types (German + English) with an example each." },
    { id: "dxc5", topic: "dx-sd", text: "State: SD model = ODE system, #states = #ODEs, states are partly independent." },
    { id: "dxc6", topic: "dx-sd", text: "Explain the ban on algebraic loops (loop needs a state variable)." },
    { id: "dxc7", topic: "modsim", text: "Determine loop polarity by counting − links; know “usually, but not always” stabilising/escalating." },
    { id: "dxc8", topic: "dx-sd", text: "Forrester/MIT/1950s; WORLD3: Club of Rome, Limits to Growth, overshoot and collapse." },
    { id: "dxc9", topic: "dx-exp", text: "Define experiment, hypothesis (conditional, falsifiable), independent/dependent variable, Störvariable, parameter, theory." },
    { id: "dxc10", topic: "dx-exp", text: "Define scenario (independent variables!) and simulation in the broad vs. narrow sense." },
    { id: "dxc11", topic: "dx-ca", text: "State the Game of Life rules, its origin (Conway 1970, von Neumann) and why it shows emergence." },
    { id: "dxc12", topic: "dx-ca", text: "Euler characteristic of sphere/torus, vortex theorem, flat torus finite but unbounded." },
    { id: "dxc13", topic: "dx-abmx", text: "Define ABM (disaggregated, explanatory, stochastic), its purpose and focus; ABP; ABS i. e. S./i. w. S." },
    { id: "dxc14", topic: "dx-abmx", text: "Explain ontological representation, heterogeneity and direct representation of the environment." },
    { id: "dxc15", topic: "dx-abmx", text: "Explain the parallelism problem and the three execution schemes." },
    { id: "dxc16", topic: "dx-abmx", text: "Distinguish individual, social and evolutionary learning." },
    { id: "dxc17", topic: "dx-abmx", text: "NetLogo: CCL Northwestern; turtles, patches, links, observer." },
    { id: "dxc18", topic: "mcevo", text: "Reproduction, variation, selection; phylogenesis vs. ontogenesis; ACO and PSO as metaheuristics." },
    { id: "dxc19", topic: "ode", text: "Compute Euler steps for a stock-and-flow or logistic model." }
  ],
  tasks: [
    { id: "dxr1", topic: "dx-sysmod", title: "Classify five models",
      html: "Classify each model by time (continuous/discrete), values (continuous/discrete) and randomness (deterministic/stochastic):<ol type='a'><li>SD model of a warehouse: stock of goods (tonnes), inflow deliveries, outflow sales, solved as ODEs.</li><li>Conway’s Game of Life.</li><li>NetLogo epidemic model: persons susceptible/infected/recovered, infection with probability 5 % per contact, ticks = days.</li><li>Monte Carlo model of project cost: 10 000 random draws of uncertain cost items (euros).</li><li>Trend line fitted to the last 10 years of sales and extrapolated. Is it behaviour-descriptive or structure-valid?</li></ol>",
      solution: T(["", "Time", "Values", "Randomness"], [["a", "continuous", "continuous", "deterministic"], ["b", "discrete", "discrete (alive/dead)", "deterministic"], ["c", "discrete (ticks)", "discrete (agent states)", "stochastic"], ["d", "static (no time dimension)", "continuous (euros)", "stochastic"], ["e", "discrete (years)", "continuous", "deterministic"]]) + "<p>(e) is <b>behaviour-descriptive</b>: it reproduces past behaviour without the cause-and-effect structure, so it cannot be trusted when the structure changes. (a) can be structure-valid if stocks and flows correspond to the real elements.</p>" },
    { id: "dxr2", topic: "modsim", title: "Causal loop diagram: population and food",
      html: "Variables: population P, births B, deaths D, food per capita F. Assumptions: more population → more births; births increase population; more population → more deaths; deaths decrease population; more population → less food per capita; more food per capita → fewer deaths.<br>Draw the causal loop diagram, mark each link + or −, find all loops and determine their polarity. Which loop must contain a state variable?",
      solution: "<ul><li>P →(+) B →(+) P: 0 negative links → <b>positive (reinforcing)</b> loop R1 (growth).</li><li>P →(+) D →(−) P: 1 negative link → <b>negative (balancing)</b> loop B1.</li><li>P →(−) F →(−) D →(−) P: 3 negative links → odd → <b>negative (balancing)</b> loop B2 (crowding).</li></ul><p>All three loops contain the state variable <b>P</b> (population), so the ban on algebraic loops is respected. B and D are flows (state-change variables), F is an auxiliary.</p>" },
    { id: "dxr3", topic: "ode", title: "Euler steps: stock with inflow and outflow",
      html: "A stock S has a constant inflow of 100 units/month and an outflow of 0.2·S per month. S(0) = 200. Use Euler with Δt = 0.5 months.<ol type='a'><li>Write the differential equation.</li><li>Compute S at t = 0.5, 1.0 and 1.5.</li><li>Where is the equilibrium?</li></ol>",
      solution: "<ol type='a'><li>dS/dt = 100 − 0.2·S</li><li>t = 0.5: net = 100 − 40 = 60 → S = 200 + 0.5·60 = <b>230</b><br>t = 1.0: net = 100 − 46 = 54 → S = 230 + 27 = <b>257</b><br>t = 1.5: net = 100 − 51.4 = 48.6 → S = 257 + 24.3 = <b>281.3</b></li><li>Equilibrium when inflow = outflow: 100 = 0.2·S → <b>S* = 500</b> (balancing loop through the outflow).</li></ol>" },
    { id: "dxr4", topic: "ode", title: "Euler steps: logistic growth",
      html: "Customers N grow logistically: dN/dt = r·N·(1 − N/K) with r = 0.5 per year, K = 1000, N(0) = 100. Compute N for years 1, 2, 3 with Δt = 1 and name the two feedback loops.",
      solution: "<ul><li>Year 1: f = 0.5·100·0.9 = 45 → N = <b>145</b></li><li>Year 2: f = 0.5·145·0.855 = 61.99 → N ≈ <b>206.99</b></li><li>Year 3: f = 0.5·206.99·0.793 = 82.07 → N ≈ <b>289.06</b></li></ul><p>Reinforcing loop: more customers → more growth (r·N). Balancing loop: more customers → smaller (1 − N/K) → less growth. One state variable N → one differential equation.</p>" },
    { id: "dxr5", topic: "dx-sd", title: "Identify SD variable types",
      html: "Model of a savings account: balance B, interest payments I = rate · B, deposits D (fixed by the customer in each scenario), interest rate (set by the scenario), withdrawals W. The bank manager wants to observe the balance after 10 years.<br>Assign each quantity to an SD variable type, write the differential equation, and state how many ODEs the model has.",
      solution: T(["Quantity", "Type"], [["B (balance)", "state variable (Zustandsgröße) + result variable"], ["I (interest)", "state-change variable / inflow"], ["D (deposits)", "inflow, value set exogenously → input parameter"], ["interest rate", "input / intervention parameter (Vorgabeparameter)"], ["W (withdrawals)", "outflow (state-change variable)"]]) + "<p>dB/dt = I + D − W = rate·B + D − W. One state variable → <b>one ODE</b>. Loop B → I → B is positive (no − links) → exponential growth; it contains the state variable B, so no algebraic loop.</p>" },
    { id: "dxr6", topic: "dx-abmx", title: "Parallelism problem in practice",
      html: "Three agents sit in a ring A → B → C → A with values A = 1, B = 2, C = 3. Rule per tick: each agent takes the value of its left neighbour (A takes C’s, B takes A’s, C takes B’s).<br>Compute the values after one tick with (a) sequential asynchronous execution in the order A, B, C and (b) simulated synchronous execution. What does this show?",
      solution: "<p>(a) Sequential: A takes C = 3 → A = 3; B takes A = 3 → B = 3; C takes B = 3 → C = 3. Result <b>(3, 3, 3)</b>.</p><p>(b) Synchronous (all read first, then all write): A = 3, B = 1, C = 2. Result <b>(3, 1, 2)</b> – the intended rotation.</p><p>The order of activation changes the result (order artefact). Simulated synchronous execution (inputs of all agents before all outputs) reproduces true simultaneity; random asynchronous execution removes the systematic bias only on average.</p>" },
    { id: "dxr7", topic: "dx-ca", title: "One Game of Life generation",
      html: "On a 5×5 grid, cells (row 3, columns 2, 3, 4) are alive (a horizontal ‘blinker’); all others are dead. Compute the next generation and the one after it. Which kind of pattern is this, and which model classes does the Game of Life belong to?",
      solution: "<p>Middle cell (3,3) has 2 live neighbours → survives. Ends (3,2) and (3,4) have 1 neighbour → die. Cells (2,3) and (4,3) have 3 live neighbours → born. Generation 1: vertical line (2,3), (3,3), (4,3). Generation 2: horizontal again.</p><p>The blinker is an <b>oscillator</b> with period 2. Game of Life: time-discrete, value-discrete, deterministic; a cellular automaton showing emergence; all cells updated synchronously.</p>" },
    { id: "dxr8", topic: "dx-exp", title: "Design a simulation experiment",
      html: "A city wants to know whether a higher bus frequency reduces car traffic. Formulate a falsifiable hypothesis, name independent and dependent variables, one parameter, one confounding variable and two scenarios.",
      solution: "<ul><li><b>Hypothesis</b>: The more buses per hour, the fewer car trips per day (je–desto; falsifiable).</li><li><b>Independent variable</b> (je-part): bus frequency. <b>Dependent variable</b> (desto-part): car trips per day (result variable).</li><li><b>Parameter</b>: city population, road network (fixed).</li><li><b>Confounding variable</b>: fuel price change or weather not captured in the model.</li><li><b>Scenarios</b> (combinations of independent variables): S1 = 4 buses/h (status quo), S2 = 8 buses/h; optionally combined with ticket price.</li></ul><p>Running the model for S1 and S2 is simulation in the narrow sense; the whole process is simulation in the broad sense.</p>" }
  ]
};
})();
