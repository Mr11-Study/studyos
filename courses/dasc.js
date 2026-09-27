/* StudyOS — course content. Everything course-specific lives here so new courses can be added as data. */
(function () {

const COURSES = [
  { id: "dasc", name: "Einführung in Data Science", short: "EF-DASC", title: "Data Science", semester: 3, ects: 2.5,
    color: "#8BD126", icon: "◆", status: "active",
    lecturers: "DI Dr. Michael Hammer (Part 1) · MMMMag. DDr. Wolfgang Granigg (Part 2)",
    description: "Methods and principles of Data Science, Python for data tasks, linear regression with gradient descent, logistic regression." },
  { id: "prog", name: "Programming", short: "PROG", title: "Programming", semester: null, ects: null, color: "#4C9EFF", icon: "{ }", status: "soon" },
  { id: "math", name: "Mathematics", short: "MATH", title: "Mathematics", semester: null, ects: null, color: "#A78BFA", icon: "∑", status: "soon" },
  { id: "db", name: "Databases", short: "DB", title: "Databases", semester: null, ects: null, color: "#F59E0B", icon: "▤", status: "soon" },
  { id: "is", name: "Information Systems", short: "IS", title: "Information Systems", semester: null, ects: null, color: "#EAB308", icon: "◎", status: "soon" }
];

/* Topics are the unit of mastery. Each points at the lesson that teaches it. */
const TOPICS = {
  "tools":      { name: "Toolchain & uv",            lesson: "w0-1" },
  "git":        { name: "Git & GitLab",              lesson: "w0-2" },
  "ssh":        { name: "SSH & Linux",               lesson: "w0-3" },
  "ds":         { name: "What is Data Science",      lesson: "w1-1" },
  "ethics":     { name: "Ethics",                    lesson: "w1-2" },
  "ai":         { name: "AI approaches",             lesson: "w2-1" },
  "llm":        { name: "Large Language Models",     lesson: "w2-2" },
  "mlbasics":   { name: "Classical SW vs ML",        lesson: "w3-1" },
  "accprec":    { name: "Accuracy vs Precision",     lesson: "w3-2" },
  "corr":       { name: "Correlation vs Causality",  lesson: "w3-3" },
  "classes":    { name: "Classes of ML",             lesson: "w4-1" },
  "supervised": { name: "Supervised Learning",       lesson: "w4-2" },
  "unsup":      { name: "Unsupervised Learning",     lesson: "w4-3" },
  "rl":         { name: "Reinforcement Learning",    lesson: "w4-4" },
  "bias":       { name: "Bias",                      lesson: "w5-1" },
  "lifecycle":  { name: "Data Science Lifecycle",    lesson: "w6-1" },
  "python":     { name: "Python Basics",             lesson: "w7-1" },
  "pandas":     { name: "NumPy & pandas",            lesson: "w7-2" },
  "explore":    { name: "Data Exploration",          lesson: "w8-1" },
  "linreg":     { name: "Linear Regression",         lesson: "w9-1" },
  "gd":         { name: "Gradient Descent",          lesson: "w10-1" },
  "logreg":     { name: "Logistic Regression",       lesson: "w11-1" },
  "methods":    { name: "ML Methods overview",       lesson: "w12-1" },
  "knn":        { name: "k-Nearest Neighbours",      lesson: "w12-2" },
  "trees":      { name: "Decision Trees",            lesson: "w12-3" },
  "kmeans":     { name: "k-Means Clustering",        lesson: "w12-4" },
  "nbayes":     { name: "Naive Bayes",               lesson: "w12-5" },
  "overfit":    { name: "Train/Test & Overfitting",  lesson: "w13-1" },
  "metrics":    { name: "Evaluation Metrics",        lesson: "w13-2" },
  "cv":         { name: "Cross Validation",          lesson: "w13-3" },
  "modsim":     { name: "Models, Systems, Feedback", lesson: "w14-1" },
  "ode":        { name: "Differential Equations",    lesson: "w14-2" },
  "abm":        { name: "Agent-based Modeling",      lesson: "w14-3" },
  "mcevo":      { name: "Monte Carlo & Evolution",   lesson: "w14-4" }
};

/* Lesson block types:
   {t:"lead", html}                       short intro
   {t:"text", h, levels:{simple,normal,technical}, alt:[{label,html}]}
   {t:"widget", w:"venn", topic}          interactive component
   {t:"check", q, opts, a, why}           graded check question
   {t:"keys", items:[...]}                key takeaways
   {t:"callout", html}
*/
const WORLDS = [
 { id: "w0", n: 0, title: "Setup & Tools", sub: "Python, VS Code, uv, Git, SSH — Linux first", boss: null, lessons: [
  { id: "w0-1", title: "Your Python toolchain", topic: "tools", min: 8, xp: 20, blocks: [
    { t: "lead", html: "The course speaks three languages: <b>English</b>, <b>Python</b> and <b>Linux</b>. We build and train algorithms to run at scale, so the approach is “Linux first”." },
    { t: "widget", w: "workflow" },
    { t: "text", h: "What each tool does", levels: {
      simple: "VS Code is where you write code. uv sets up a clean Python project for you. Git remembers every version of your code, and GitLab keeps a copy on the FH server where you hand in homework.",
      normal: "<b>VS Code</b> is the editor (with the Python extension and an integrated terminal). <b>uv</b> is a fast Python package and project manager: <code>uv init</code> creates a project with <code>pyproject.toml</code>, <code>uv add numpy</code> installs a dependency into the project’s virtual environment, <code>uv run main.py</code> runs code inside it. <b>Git</b> versions your code locally, <b>GitLab</b> (gitlab.itplus.fh-joanneum.at) hosts it remotely.",
      technical: "uv resolves dependencies into <code>uv.lock</code> and manages an isolated <code>.venv</code> per project, so builds are reproducible across machines (your laptop, the exam Debian image, a server). Git tracks content-addressed snapshots; pushing to GitLab over SSH authenticates with your public key instead of a password." },
      alt: [
        { label: "Analogy", html: "Think of a workshop: VS Code is the workbench, uv is the tool cabinet that keeps each project’s tools separate, Git is the logbook of every change and GitLab is the safe at the university where you drop off finished pieces." },
        { label: "Step by step", html: "1. <code>uv init ds-course</code> → 2. <code>cd ds-course</code> → 3. <code>uv add numpy pandas matplotlib</code> → 4. open the folder in VS Code → 5. write <code>main.py</code> → 6. <code>uv run main.py</code> → 7. <code>git add . && git commit -m \"…\" && git push</code>." }
      ] },
    { t: "callout", html: "Moodle is your main entry point for information. GitLab is used to manage the code from the lecture and to hand in home assignments. Submission rules are announced in the lecture and may vary per assignment." },
    { t: "check", q: "Which command adds the package <code>pandas</code> to a uv-managed project?", opts: ["pip install pandas --global", "uv add pandas", "git add pandas", "uv run pandas"], a: 1, why: "<code>uv add</code> records the dependency in pyproject.toml and installs it into the project’s environment. <code>git add</code> only stages files for a commit." },
    { t: "check", q: "Why does the course follow a “Linux first” approach?", opts: ["Linux is required to run VS Code", "Models are built and trained to run at scale, and servers mostly run Linux", "Python only works on Linux", "Git only exists on Linux"], a: 1, why: "Data science code usually ends up on servers and clusters, which run Linux. The practical assessment also runs on a dedicated Debian Linux system." }
  ]},
  { id: "w0-2", title: "Git & GitLab workflow", topic: "git", min: 10, xp: 25, blocks: [
    { t: "lead", html: "You work with two kinds of repositories: the <b>course repository</b> (maintained by the lecturer: code from the exercises and data you need) and <b>your personal GitLab group</b>, where you create your own repo for the code you write during the lecture." },
    { t: "text", h: "The commit cycle", levels: {
      simple: "Check what changed, pick the changes you want to save, save them with a message, then upload them.",
      normal: "<code>git status</code> shows changed files → <code>git add .</code> stages them → <code>git commit -m \"message\"</code> records a snapshot locally → <code>git push</code> uploads the commits to GitLab.",
      technical: "The working tree, the index (staging area) and the local repository are separate. <code>add</code> copies content into the index, <code>commit</code> writes a commit object pointing at the index tree, <code>push</code> sends missing objects to the remote and moves the remote branch ref." } },
    { t: "widget", w: "gitorder", topic: "git" },
    { t: "widget", w: "terminal", topic: "git", mission: "git" },
    { t: "check", q: "You committed locally but your lecturer can’t see the code on GitLab. What is missing?", opts: ["git add", "git push", "git status", "git init"], a: 1, why: "A commit only exists in your local repository until you push it to the remote." }
  ]},
  { id: "w0-3", title: "SSH keys & Linux basics", topic: "ssh", min: 8, xp: 20, blocks: [
    { t: "lead", html: "Git talks to GitLab over <b>SSH</b>. You create a key pair once: the <b>private key</b> stays on your machine, the <b>public key</b> is uploaded to GitLab." },
    { t: "text", h: "Keys, not passwords", levels: {
      simple: "The public key is like a lock you give to GitLab. Only your private key opens it, so GitLab knows it’s you.",
      normal: "<code>ssh-keygen -t ed25519</code> creates <code>~/.ssh/id_ed25519</code> (private) and <code>~/.ssh/id_ed25519.pub</code> (public). Paste the .pub content into GitLab → Preferences → SSH Keys. Test with <code>ssh -T git@gitlab.itplus.fh-joanneum.at</code>.",
      technical: "SSH public-key auth: the server sends a challenge, the client signs it with the private key, the server verifies with the stored public key. An <code>~/.ssh/config</code> Host entry can pin the key file and user for a host." } },
    { t: "callout", html: "Tip from the lecture: if you created a new key pair in class, take the private/public key (and your ssh config) with you so you can use it on another computer too." },
    { t: "widget", w: "terminal", topic: "ssh", mission: "ssh" },
    { t: "check", q: "Which file do you upload to GitLab?", opts: ["~/.ssh/id_ed25519", "~/.ssh/id_ed25519.pub", "~/.ssh/known_hosts", "~/.bashrc"], a: 1, why: "Only the public key (.pub) is shared. The private key never leaves your machine." }
  ]}
 ]},

 { id: "w1", n: 1, title: "What is Data Science?", sub: "Skills, questions and responsibility", boss: null, lessons: [
  { id: "w1-1", title: "Data Science as an intersection", topic: "ds", min: 8, xp: 20, blocks: [
    { t: "lead", html: "Drew Conway’s Venn diagram describes Data Science as the overlap of three skill areas. Hover or tap the circles and overlaps." },
    { t: "widget", w: "venn", topic: "ds" },
    { t: "text", h: "More than algorithms", levels: {
      simple: "A good Data Scientist doesn’t only know algorithms. They must understand the problem they’re solving.",
      normal: "Substantive expertise means “business analysis”: asking the right questions and structuring the problem description. It also means the willingness to adapt to new problems and domains, including their language.",
      technical: "Without domain knowledge, hacking skills plus statistics yields models that optimise the wrong target (Conway’s <i>danger zone</i> sits between hacking and domain knowledge without math: plausible-looking but unsound analysis)." } },
    { t: "check", q: "A company tells you: “Our sales are decreasing.” What should a Data Scientist do <b>first</b>?", opts: ["Immediately train a neural network", "Ask questions and define the problem", "Download more data", "Create a dashboard"], a: 1, why: "“Sales are decreasing” is a symptom, not a problem statement. Which products, regions, since when, compared to what? The lifecycle starts with business understanding." },
    { t: "check", q: "In Conway’s diagram, what lies in the overlap of Hacking Skills and Math & Statistics <b>without</b> substantive expertise?", opts: ["Traditional Research", "Machine Learning", "Danger Zone", "Data Engineering"], a: 1, why: "Hacking + Math/Stats = Machine Learning. Math + Expertise = Traditional Research. Hacking + Expertise = Danger Zone." }
  ]},
  { id: "w1-2", title: "Ethics in Data Science", topic: "ethics", min: 7, xp: 20, blocks: [
    { t: "lead", html: "A later version of the Venn diagram adds a fourth circle: “Evil”. Data Science has ethical aspects you are responsible for." },
    { t: "keys", items: ["Data protection and rights on your own data (GDPR)", "Human profiling and manipulation (e.g. Cambridge Analytica)", "Deepfakes and fake news", "Bias and manifesting prejudice", "Safety and security of AI systems", "Unpredictable impact of “strong” AI on society"] },
    { t: "widget", w: "ethics", topic: "ethics" },
    { t: "check", q: "Under GDPR, personal data about you…", opts: ["belongs to whoever collected it", "comes with rights for you, e.g. access and deletion", "may be used for any purpose once public", "is only protected in medical contexts"], a: 1, why: "GDPR gives data subjects rights such as access, rectification, erasure and objection, and requires a legal basis and purpose for processing." }
  ]}
 ]},

 { id: "w2", n: 2, title: "Artificial Intelligence", sub: "AI is more than machine learning", boss: null, lessons: [
  { id: "w2-1", title: "Narrow, general, and six approaches", topic: "ai", min: 10, xp: 25, blocks: [
    { t: "lead", html: "AI (Oxford): the theory and development of computer systems able to perform tasks normally requiring human intelligence, such as visual perception, speech recognition, decision-making and translation." },
    { t: "widget", w: "aitree" },
    { t: "text", h: "AI ≠ Machine Learning", levels: {
      simple: "Machine learning is one way to build AI. There are others, like writing logic rules by hand.",
      normal: "Machine learning is “subsymbolic” AI: the structure of the model is given (inductive bias) but its parameters are learned from data. Symbolic AI, fuzzy logic, swarm intelligence and evolutionary methods are other routes to intelligent behaviour.",
      technical: "Neural networks and statistical learning form the ML core. Fuzzy logic, swarm intelligence, evolutionary algorithms and neural networks are grouped as nature-inspired <i>Computational Intelligence</i>. Statistical learning overlaps with classical statistics and data mining (compare K. Lichtenegger’s map)." } },
    { t: "widget", w: "aicards" },
    { t: "widget", w: "matching", topic: "ai" },
    { t: "check", q: "Which statement is correct?", opts: ["All AI is machine learning", "Machine learning learns model parameters from data, while the model structure is chosen beforehand", "Symbolic AI learns rules from labelled data", "AGI is what ChatGPT already is"], a: 1, why: "That is the lecture’s definition: structure is induced (inductive bias), parameters are learned. ChatGPT is still narrow AI; AGI is the current push." }
  ]},
  { id: "w2-2", title: "How LLMs work", topic: "llm", min: 8, xp: 20, blocks: [
    { t: "lead", html: "A Generative Pre-trained Transformer (GPT) has read huge amounts of text. It predicts the next token from the context, using probabilities it learned." },
    { t: "widget", w: "llm", topic: "llm" },
    { t: "text", h: "What’s behind the success", levels: {
      simple: "A good architecture (the transformer), a fast way to train it (gradient descent) and very powerful graphics cards.",
      normal: "<b>Theory:</b> the transformer architecture (Vaswani et al., <i>Attention Is All You Need</i>, 2017). <b>Algorithm:</b> learning is a huge optimisation problem (GPT-3.5 ≈ 175 billion parameters) solved with back-propagation and efficient gradient descent. <b>Hardware:</b> GPUs grew from 19.5 TFLOPs (A100) to 2,500 TFLOPs (Blackwell).",
      technical: "Self-attention lets every token weigh every other token in the context. Training minimises cross-entropy of next-token prediction; gradients come from back-propagation. Large-scale ML is an engineering task: training on 2,000 Blackwell GPUs over 90 days draws about 4 MW versus 15 MW for 8,000 older GPUs." } },
    { t: "keys", items: ["It has learned patterns and structure of language", "It knows about similarity (semantics) of words", "It can reproduce “facts” it saw during training — which is not the same as knowing they are true"] },
    { t: "check", q: "What does an LLM fundamentally do when generating text?", opts: ["Looks the answer up in a database", "Predicts the next token based on context and learned probabilities", "Runs symbolic logic rules written by engineers", "Copies the most similar web page"], a: 1, why: "Generation is repeated next-token prediction. The context shifts the probabilities." }
  ]}
 ]},

 { id: "w3", n: 3, title: "Machine Learning Fundamentals", sub: "A new programming paradigm", boss: { id: "boss-w3", title: "Fundamentals Boss", topics: ["mlbasics", "accprec", "corr", "ai", "llm", "ds"] }, lessons: [
  { id: "w3-1", title: "Classical software vs. ML", topic: "mlbasics", min: 10, xp: 25, blocks: [
    { t: "lead", html: "Classical software takes rules and input data and produces responses. Machine learning turns this around: it takes input and response data and produces the rule set." },
    { t: "widget", w: "mlflow" },
    { t: "text", h: "A mathematical model", levels: {
      simple: "You show the computer many examples with the right answers. It works out a rule that gives answers close to the right ones, even for new examples.",
      normal: "An ML model takes existing input data (e.g. a vector X = [x₁ x₂]ᵀ) and existing response data y, and learns a rule set that predicts ŷ for any new X, as close as possible to the real y.",
      technical: "Find f̂ from a hypothesis class ℱ (the inductive bias) that minimises expected loss E[L(y, f(X))], estimated by empirical loss on training data. “Existing response data” makes this supervised learning." } },
    { t: "widget", w: "mlslots", topic: "mlbasics" },
    { t: "check", q: "What is the <b>output</b> of the training step in machine learning?", opts: ["The response data", "A model / rule set", "The input data", "A prediction for tomorrow"], a: 1, why: "Training consumes input + known responses and outputs a model. Predictions come later, when the model is applied to new inputs (inference)." }
  ]},
  { id: "w3-2", title: "Accuracy vs. precision", topic: "accprec", min: 6, xp: 20, blocks: [
    { t: "lead", html: "Two different qualities of a prediction. <b>Accuracy</b>: how close to the true value on average. <b>Precision</b>: how close the predictions are to each other." },
    { t: "widget", w: "targets", topic: "accprec" },
    { t: "text", h: "Systematic vs. random error", levels: {
      simple: "Precise but not accurate: always missing in the same direction. Accurate but not precise: right on average, but scattered.",
      normal: "Low accuracy points to systematic error (bias). Low precision points to random error (variance, noise).",
      technical: "For an estimator θ̂: accuracy ↔ bias E[θ̂]−θ, precision ↔ Var(θ̂). MSE = Bias² + Variance." } },
    { t: "check", q: "A scale always shows 200 g too much, but the readings barely vary. The scale is…", opts: ["accurate and precise", "precise but not accurate", "accurate but not precise", "neither"], a: 1, why: "Tightly grouped readings = precise. A constant offset from the truth = not accurate (systematic error)." }
  ]},
  { id: "w3-3", title: "Correlation vs. causality", topic: "corr", min: 6, xp: 20, blocks: [
    { t: "lead", html: "<b>Correlation</b>: A and B happen together. <b>Causality</b>: there is a root-cause relation, possibly through a third factor C." },
    { t: "widget", w: "causal", topic: "corr" },
    { t: "text", h: "Hidden variables", levels: {
      simple: "When two things rise together, look for something that pushes both. Hot weather sells ice cream and causes sunburn.",
      normal: "A confounder C causes both A and B, which creates a correlation between A and B without a causal link. Other possibilities: A causes B, B causes A, or pure coincidence.",
      technical: "Observational correlation cannot identify the causal direction. Controlled experiments (randomisation, A/B tests) or causal-inference methods that adjust for confounders are needed to claim causation." } },
    { t: "check", q: "Countries with more storks have more births. The most plausible explanation is…", opts: ["Storks bring babies", "Births attract storks", "A confounder such as rural area size affects both", "The correlation must be fake"], a: 2, why: "Larger rural areas have both more storks and, historically, more births. The correlation is real, the causal story isn’t." }
  ]}
 ]},

 { id: "w4", n: 4, title: "Classes of Machine Learning", sub: "Supervised, unsupervised, reinforcement", boss: { id: "boss-w4", title: "ML Classes Boss", topics: ["classes", "supervised", "unsup", "rl", "mlbasics"] }, lessons: [
  { id: "w4-1", title: "The map of ML", topic: "classes", min: 6, xp: 20, blocks: [
    { t: "lead", html: "Four families. Tap a branch to open its explanation." },
    { t: "widget", w: "mlmap" },
    { t: "check", q: "Recommender systems are the lecture’s example for…", opts: ["Supervised learning", "Semi-supervised learning", "Reinforcement learning", "Dimensionality reduction"], a: 1, why: "They combine a few known labels (ratings) with a lot of unlabelled interaction data." }
  ]},
  { id: "w4-2", title: "Supervised learning", topic: "supervised", min: 10, xp: 25, blocks: [
    { t: "lead", html: "Base condition: training data <b>with</b> known target labels (ground truth) exists." },
    { t: "text", h: "Classification vs. regression", levels: {
      simple: "Classification picks a category (spam or not). Regression predicts a number (a price).",
      normal: "<b>Classification</b> predicts the class an instance belongs to, usually one of a few countable classes. A common special case is binary classification (infected, defect, spam). <b>Regression</b> predicts a continuous target: tomorrow’s peak temperature, an exchange rate, a house price from m² and rooms.",
      technical: "Classification: f: X → {1,…,K}, often via class probabilities p(y=k|x) and a decision rule; typical loss is cross-entropy. Regression: f: X → ℝ, typical loss is squared error." },
      alt: [{ label: "Example", html: "Same data, two questions: from a flat’s size and district, “what will it cost?” is regression; “will it sell within a month (yes/no)?” is classification." }] },
    { t: "widget", w: "classreg", topic: "supervised" },
    { t: "check", q: "Which is a regression problem?", opts: ["Spam detection", "Customer segmentation", "Predicting a house price", "Detecting transactions as fraud / not fraud"], a: 2, why: "A price is a continuous value. Spam and fraud are classes; segmentation has no labels (unsupervised)." }
  ]},
  { id: "w4-3", title: "Unsupervised learning", topic: "unsup", min: 8, xp: 25, blocks: [
    { t: "lead", html: "No target labels. The goal is to identify structure in the data that is not known upfront." },
    { t: "widget", w: "cluster", topic: "unsup" },
    { t: "keys", items: ["<b>Clustering</b>: assign points to groups based on a metric such as distance (e.g. customer types)", "<b>Anomaly detection</b>: find points that are significantly “different”", "<b>Dimensionality reduction</b>: fewer variables per data point with minimal information loss (e.g. feature extraction)", "Often combined with supervised methods, e.g. dimensionality reduction in feature engineering"] },
    { t: "check", q: "Which is an example of unsupervised learning?", opts: ["Predicting temperature", "Spam classification", "Grouping customers into unknown segments", "Predicting whether a machine fails"], a: 2, why: "The segments are not known beforehand; the algorithm discovers them." }
  ]},
  { id: "w4-4", title: "Reinforcement learning", topic: "rl", min: 10, xp: 25, blocks: [
    { t: "lead", html: "Train an agent’s strategy to take actions in a dynamic environment so that it maximises a reward." },
    { t: "widget", w: "rlloop" },
    { t: "widget", w: "gridworld", topic: "rl" },
    { t: "text", h: "How an agent learns", levels: {
      simple: "It tries things, sees which moves gave points, and does more of those.",
      normal: "The interpreter maps the environment to a <b>state</b> and computes a <b>reward</b> for each <b>action</b>. Over many episodes the agent learns which action is worth most in each state, balancing trying new moves (exploration) against using what works (exploitation).",
      technical: "Q-learning keeps Q(s,a) and updates Q(s,a) ← Q(s,a) + α[r + γ·maxₐ′ Q(s′,a′) − Q(s,a)]. The policy picks argmaxₐ Q(s,a), with ε-greedy exploration." } },
    { t: "check", q: "In RL, who evaluates the reward in the lecture’s diagram?", opts: ["The agent", "The interpreter", "The environment designer at run time", "The labels"], a: 1, why: "The interpreter observes the environment, maps it into a state and evaluates the reward for the agent’s action." }
  ]}
 ]},

 { id: "w5", n: 5, title: "Bias & Data Problems", sub: "Sometimes it is different than it seems", boss: { id: "boss-w5", title: "Bias Boss", topics: ["bias", "corr", "ethics"] }, lessons: [
  { id: "w5-1", title: "The airplane challenge", topic: "bias", min: 8, xp: 30, blocks: [
    { t: "lead", html: "During World War II the US Navy analysed airplanes that returned from the battlefield. The figure shows the accumulated hits on all returning airplanes." },
    { t: "widget", w: "airplane", topic: "bias" }
  ]},
  { id: "w5-2", title: "Types of bias", topic: "bias", min: 8, xp: 20, blocks: [
    { t: "text", h: "Three biases from the lecture", levels: {
      simple: "Survivorship: you only look at the winners. Availability: you use the data that’s easy to get. Frequency illusion: once you notice something, you see it everywhere.",
      normal: "<b>Survivorship bias</b>: limiting the analysis to “survivors”, a general issue for experiments with positive results (customer acquisition, career paths, business models). <b>Availability bias</b>: focusing on easily accessible data instead of a representative sample of the population. <b>Frequency illusion</b>: focusing on something because you just noticed it; strong for effects that depend on time.",
      technical: "Formally these are selection effects: the observed sample distribution P(x | selected) differs from the population P(x). Estimates on the selected sample are biased unless the selection mechanism is modelled or randomised away." } },
    { t: "widget", w: "biascards", topic: "bias" },
    { t: "callout", html: "Key message: be aware and always check your data against possible bias." },
    { t: "check", q: "You train a churn model only on customers who answered a satisfaction survey. The main risk is…", opts: ["Overfitting", "Availability / selection bias", "Frequency illusion", "Too many labels"], a: 1, why: "Survey respondents are the easily available data, not a representative sample of all customers." }
  ]}
 ]},

 { id: "w6", n: 6, title: "Data Science Lifecycle", sub: "Projects are seldom linear", boss: null, lessons: [
  { id: "w6-1", title: "The lifecycle", topic: "lifecycle", min: 8, xp: 25, blocks: [
    { t: "lead", html: "Data science projects are an interdisciplinary challenge, and they are seldom acyclic and linear. The lecture uses Microsoft’s Team Data Science Process; CRISP-DM is the classic comparison." },
    { t: "widget", w: "lifecycle", topic: "lifecycle" },
    { t: "check", q: "Your model performs well offline but poorly after deployment. Which step should have caught the drift?", opts: ["Business understanding", "Monitoring (scoring, performance monitoring)", "Feature selection", "Data source choice"], a: 1, why: "Deployment includes scoring and performance monitoring, which detects when live data drifts from training data." }
  ]}
 ]},

 { id: "w7", n: 7, title: "Python for Data Science", sub: "Code it yourself in the lab", boss: null, lessons: [
  { id: "w7-1", title: "Python basics for data", topic: "python", min: 12, xp: 30, blocks: [
    { t: "lead", html: "Variables, lists, dictionaries, loops and functions are everything you need for the first data tasks. Code in the lab runs in your browser." },
    { t: "widget", w: "lab", tasks: ["mean", "loop", "dict", "func"] }
  ]},
  { id: "w7-2", title: "NumPy & pandas", topic: "pandas", min: 12, xp: 30, blocks: [
    { t: "lead", html: "NumPy gives fast arrays; pandas gives DataFrames (tables with named columns). Most assessment tasks start with <code>pd.read_csv</code>." },
    { t: "keys", items: ["<code>df.head()</code>, <code>df.info()</code>, <code>df.describe()</code> to inspect", "<code>df[\"col\"].mean()</code> for column statistics", "<code>df[df[\"hours\"] > 5]</code> to filter rows", "<code>df.isna().sum()</code> to count missing values", "<code>df.groupby(\"group\")[\"col\"].mean()</code> to aggregate"] },
    { t: "widget", w: "lab", tasks: ["np", "filter", "missing"] }
  ]}
 ]},

 { id: "w8", n: 8, title: "Data Exploration", sub: "Explore and evaluate data", boss: null, lessons: [
  { id: "w8-1", title: "Explore a student dataset", topic: "explore", min: 10, xp: 30, blocks: [
    { t: "lead", html: "Before modelling: inspect, summarise, find gaps, plot. Explore first, then answer." },
    { t: "widget", w: "explorer", topic: "explore" }
  ]}
 ]},

 { id: "w9", n: 9, title: "Linear Regression", sub: "You will implement it yourself", boss: null, lessons: [
  { id: "w9-1", title: "Fit a line by hand", topic: "linreg", min: 12, xp: 35, blocks: [
    { t: "lead", html: "Predict exam score from study hours with ŷ = m·x + b. Move the sliders and watch the residuals and the loss." },
    { t: "widget", w: "linreg", topic: "linreg" },
    { t: "text", h: "Prediction, residual, loss", levels: {
      simple: "Each red line is a mistake. Make the red lines as short as possible overall.",
      normal: "Prediction ŷᵢ = m·xᵢ + b. Residual eᵢ = yᵢ − ŷᵢ. The loss summarises all residuals; mean squared error MSE = (1/n)·Σ eᵢ². Squaring makes big errors count more and avoids positive and negative residuals cancelling.",
      technical: "Least squares has a closed form: m = Σ(xᵢ−x̄)(yᵢ−ȳ) / Σ(xᵢ−x̄)², b = ȳ − m·x̄. In the course you instead minimise the MSE iteratively with gradient descent, which scales to models without closed forms." } },
    { t: "widget", w: "lab", tasks: ["mse", "fit"] }
  ]}
 ]},

 { id: "w10", n: 10, title: "Gradient Descent", sub: "Walk downhill on the loss", boss: null, lessons: [
  { id: "w10-1", title: "Rolling down the valley", topic: "gd", min: 12, xp: 35, blocks: [
    { t: "text", h: "The idea", levels: {
      simple: "Imagine standing on a foggy mountain and wanting to reach the valley. You feel which way is downhill and take a step. Repeat.",
      normal: "Gradient descent updates parameters in the direction that reduces the loss function. The gradient points uphill, so we step against it. The learning rate sets the step size.",
      technical: "θₖ₊₁ = θₖ − η·∇L(θₖ). For linear regression with MSE: ∂L/∂m = −(2/n)·Σ xᵢ(yᵢ − ŷᵢ), ∂L/∂b = −(2/n)·Σ (yᵢ − ŷᵢ). Convergence needs η small enough relative to the curvature (η < 2/L for an L-smooth loss)." },
      alt: [{ label: "Step by step", html: "1. Start with a guess for the parameter. 2. Compute the slope of the loss there. 3. Move a little in the downhill direction: new = old − learning_rate × slope. 4. Repeat until the slope is almost zero." }] },
    { t: "widget", w: "gd", topic: "gd" },
    { t: "check", q: "The loss jumps from side to side and grows with every step. What should you change?", opts: ["Increase the learning rate", "Decrease the learning rate", "Add more features", "Stop after one step"], a: 1, why: "Growing oscillation is overshooting: each step is too large for the curvature, so it lands higher on the other side." },
    { t: "widget", w: "lab", tasks: ["gdstep"] }
  ]}
 ]},

 { id: "w11", n: 11, title: "Logistic Regression", sub: "Classification with probabilities", boss: null, lessons: [
  { id: "w11-1", title: "The sigmoid and the threshold", topic: "logreg", min: 10, xp: 30, blocks: [
    { t: "lead", html: "Logistic regression turns a linear score into a probability with the sigmoid σ(z) = 1 / (1 + e⁻ᶻ). A threshold turns the probability into a class." },
    { t: "widget", w: "logreg", topic: "logreg" },
    { t: "text", h: "Why a threshold matters", levels: {
      simple: "Above the line: predict “pass”. Move the line and some students switch sides.",
      normal: "A lower threshold predicts “pass” more often (more false passes, fewer missed passes). A higher threshold is stricter. In the course you use existing libraries, e.g. scikit-learn’s <code>LogisticRegression</code>, and evaluate the performance.",
      technical: "p(y=1|x) = σ(w·x + b). Parameters are fitted by maximising the log-likelihood (minimising cross-entropy). The threshold trades precision against recall; the ROC curve shows all thresholds at once." } },
    { t: "check", q: "Logistic regression is used for…", opts: ["Regression of continuous targets", "Classification", "Clustering", "Dimensionality reduction"], a: 1, why: "Despite the name, it outputs class probabilities and is a classification method." }
  ]}
 ]},

 { id: "w12", n: 12, title: "Important ML Methods", sub: "kNN, decision trees, k-means, naive Bayes", boss: { id: "boss-w12", title: "Methods Boss", topics: ["methods", "knn", "trees", "kmeans", "nbayes"] }, lessons: [
  { id: "w12-1", title: "Four methods at a glance", topic: "methods", min: 8, xp: 25, blocks: [
    { t: "lead", html: "Four classic methods that every data scientist knows. Three are <b>supervised</b> (kNN, decision tree, naive Bayes), one is <b>unsupervised</b> (k-means). The next lessons let you play with each of them." },
    { t: "widget", w: "methods" },
    { t: "text", h: "Which one when?", levels: {
      simple: "Need a quick first model on a small table? kNN or a tree. Need to explain the decision? Tree. Lots of text? Naive Bayes. No labels at all? k-means.",
      normal: "All four are available in scikit-learn with the same interface: <code>model.fit(X_train, y_train)</code>, then <code>model.predict(X_test)</code> (k-means: <code>fit(X)</code> without y). That is why you can try several methods on the same data and compare them fairly with the evaluation methods from World 13.",
      technical: "kNN is instance-based (lazy, no training phase, O(n) per prediction). Trees are greedy recursive partitioning (CART, Gini/entropy). Naive Bayes is a generative probabilistic model with a conditional independence assumption. k-means minimises within-cluster sum of squares (Lloyd’s algorithm, local optimum, depends on initialisation)." } },
    { t: "check", q: "Which method classifies a new point by a majority vote of the closest training points?", opts: ["k-Means", "k-Nearest Neighbours", "Naive Bayes", "Decision tree"], a: 1, why: "kNN looks at the k closest labelled points. k-Means is unsupervised clustering." },
    { t: "check", q: "Which of the four methods does NOT need labels?", opts: ["kNN", "Decision tree", "k-Means", "Naive Bayes"], a: 2, why: "k-Means groups points only by similarity. The other three learn from labelled examples." }
  ]},
  { id: "w12-2", title: "k-Nearest Neighbours", topic: "knn", min: 10, xp: 30, blocks: [
    { t: "lead", html: "“Tell me who your neighbours are and I’ll tell you who you are.” kNN stores all training points and, for a new point, lets the k closest ones vote." },
    { t: "widget", w: "knn" },
    { t: "text", h: "The two decisions you have to make", levels: {
      simple: "1) How many neighbours (k)? 2) How do you measure “close”? Usually the straight-line distance.",
      normal: "<b>Small k</b> (e.g. 1) follows every single point, including noise → overfitting. <b>Large k</b> smooths too much and ignores local structure → underfitting. Use an <b>odd k</b> for two classes to avoid ties. Because kNN uses distances, <b>scale your features</b> first: otherwise “income in €” (0–100 000) dominates “age” (0–100).",
      technical: "Euclidean distance d(x, x′) = √Σ(xⱼ − x′ⱼ)². With StandardScaler each feature gets mean 0 and std 1. kNN suffers from the curse of dimensionality: in many dimensions all points are almost equally far apart. In scikit-learn: <code>KNeighborsClassifier(n_neighbors=5)</code>; choose k via cross validation." },
      alt: [{ label: "Worked example", html: "Neighbours of a new student (sorted by distance): pass, pass, fail, fail, fail. k = 1 → pass. k = 3 → pass (2:1). k = 5 → fail (2:3). The prediction depends on k!" }] },
    { t: "check", q: "Your kNN model with k = 1 is perfect on the training data but bad on new data. What should you try?", opts: ["k = 0", "A larger k, e.g. 7", "Remove the test data", "Use more features without scaling"], a: 1, why: "With k = 1 every point is its own nearest neighbour, so training accuracy is always 100 %. A larger k averages out noise." },
    { t: "check", q: "Why should features be scaled before using kNN?", opts: ["Scaling makes the model train faster on the GPU", "Otherwise the feature with the largest numeric range dominates the distance", "kNN only works with values between 0 and 1", "Scaling removes outliers"], a: 1, why: "Distances add up squared differences. A feature measured in thousands swamps one measured in single digits." },
    { t: "keys", items: ["kNN = lazy learner: no training, all work at prediction time", "small k → overfitting, large k → underfitting", "scale features first (StandardScaler)", "<code>KNeighborsClassifier(n_neighbors=k)</code>"] }
  ]},
  { id: "w12-3", title: "Decision trees", topic: "trees", min: 12, xp: 35, blocks: [
    { t: "lead", html: "A decision tree is a flowchart of yes/no questions, learned from data. Its big advantage: you can read and explain every decision." },
    { t: "html", html: `<div class="codeq" style="font-size:13px">hours ≤ 3.75 ?\n├─ yes → attendance ≥ 70 % ?\n│         ├─ yes → pass\n│         └─ no  → fail\n└─ no  → pass</div>` },
    { t: "widget", w: "gini" },
    { t: "text", h: "How the tree is built", levels: {
      simple: "The algorithm tries every possible question and picks the one that separates the classes best. Then it repeats this inside each branch.",
      normal: "At every node the algorithm (CART) searches all features and thresholds and chooses the split with the lowest <b>impurity</b> (Gini or entropy) of the resulting groups. It stops when a group is pure or a limit is reached. Without limits a tree grows until every leaf holds one training point → <b>overfitting</b>. Limit it with <code>max_depth</code> or <code>min_samples_leaf</code>.",
      technical: "Gini(S) = 1 − Σₖ pₖ². Split quality = weighted impurity Σ |Sᵢ|/|S| · Gini(Sᵢ); information gain uses entropy H = −Σ pₖ log₂ pₖ. Trees are greedy (locally optimal splits), invariant to feature scaling and handle mixed feature types. Ensembles (Random Forest, Gradient Boosting) combine many trees to reduce variance." } },
    { t: "check", q: "A node contains 5 pass and 5 fail students. What is its Gini impurity?", opts: ["0", "0.25", "0.5", "1"], a: 2, why: "1 − 0.5² − 0.5² = 0.5, the maximum for two classes." },
    { t: "check", q: "Your unlimited decision tree reaches 100 % training accuracy but only 65 % on test data. Best fix?", opts: ["Allow deeper trees", "Limit the depth (max_depth) or leaf size", "Scale the features", "Use the test data for training"], a: 1, why: "A fully grown tree memorises the training data. Pruning or depth limits make it generalise better." },
    { t: "keys", items: ["tree = learned flowchart of yes/no questions", "splits chosen by lowest impurity (Gini / entropy)", "easy to explain, no scaling needed", "overfits easily → max_depth, min_samples_leaf", "many trees together = Random Forest"] }
  ]},
  { id: "w12-4", title: "k-Means clustering", topic: "kmeans", min: 10, xp: 30, blocks: [
    { t: "lead", html: "k-Means finds k groups in unlabelled data by repeating two steps: <b>assign</b> each point to its nearest centre, then <b>move</b> each centre to the mean of its points." },
    { t: "widget", w: "cluster", topic: "kmeans" },
    { t: "text", h: "Things to know", levels: {
      simple: "You must choose how many groups (k) you want. The result can change depending on where the centres start.",
      normal: "k-Means always converges, but maybe to a <b>local</b> optimum → run it several times with different starts (<code>n_init</code>). Choose k with the <b>elbow method</b>: plot the within-cluster distance for k = 1…10 and pick the point where the curve stops dropping steeply. k-Means assumes roughly round, similar-sized clusters and is sensitive to outliers and scaling.",
      technical: "Objective: minimise the within-cluster sum of squares Σₖ Σ_{x∈Cₖ} ‖x − μₖ‖² (inertia). Lloyd’s algorithm alternates assignment and update; each step never increases the objective. k-means++ initialisation spreads the starting centres. For non-convex shapes use DBSCAN or hierarchical clustering." } },
    { t: "check", q: "What happens in the “update” step of k-means?", opts: ["Each point gets a new label from the teacher", "Each centre moves to the mean of the points assigned to it", "k is increased by one", "The farthest point is deleted"], a: 1, why: "Assignment and update alternate until the centres stop moving." },
    { t: "check", q: "How do you usually choose k for k-means?", opts: ["Always k = 2", "Elbow method / domain knowledge", "k = number of data points", "k is learned automatically"], a: 1, why: "k is a hyperparameter. The elbow in the inertia curve or the business question (e.g. “we can handle 4 marketing segments”) guides the choice." }
  ]},
  { id: "w12-5", title: "Naive Bayes", topic: "nbayes", min: 10, xp: 30, blocks: [
    { t: "lead", html: "Naive Bayes updates a belief with evidence: start with how common spam is (prior) and let every word shift the odds." },
    { t: "widget", w: "nbayes" },
    { t: "text", h: "Bayes’ theorem in one line", levels: {
      simple: "How likely is spam, given these words? Take how common spam is and multiply by how typical the words are for spam compared to normal mail.",
      normal: "P(spam | words) ∝ P(spam) · P(word₁ | spam) · P(word₂ | spam) · … The model is “naive” because it assumes the words are <b>independent</b> given the class, which is false in real language (“New” and “York”), but it still works surprisingly well and is very fast. Great for text classification and as a baseline.",
      technical: "Posterior P(C|x) = P(x|C)·P(C) / P(x). With conditional independence P(x|C) = Πⱼ P(xⱼ|C). In practice sums of logs are used to avoid underflow and Laplace smoothing (+1) avoids zero probabilities for unseen words. Variants: MultinomialNB (word counts), BernoulliNB (word present), GaussianNB (continuous features)." } },
    { t: "check", q: "Why is naive Bayes called “naive”?", opts: ["It only works on small datasets", "It assumes features are conditionally independent given the class", "It ignores the prior", "It cannot output probabilities"], a: 1, why: "It multiplies per-feature likelihoods, which is only exact if features are independent given the class." },
    { t: "check", q: "A word never appeared in any spam email during training. Without smoothing, what happens if it appears in a new spam email?", opts: ["Nothing", "P(spam | email) becomes exactly 0", "The prior is doubled", "The email is always spam"], a: 1, why: "P(word | spam) = 0 makes the whole product zero. Laplace smoothing adds a small count to every word to avoid this." }
  ]}
 ]},

 { id: "w13", n: 13, title: "Model Evaluation", sub: "How good is the model really?", boss: { id: "boss-w13", title: "Evaluation Boss", topics: ["overfit", "metrics", "cv", "linreg"] }, lessons: [
  { id: "w13-1", title: "Train / test split & overfitting", topic: "overfit", min: 12, xp: 35, blocks: [
    { t: "lead", html: "A model that is only tested on the data it learned from is like a student who memorised last year’s exam. The real question is: how does it do on <b>new</b> data?" },
    { t: "text", h: "The split", levels: {
      simple: "Put some data aside (e.g. 20 %) before training. Train on the rest. Only at the end check the model on the part you put aside.",
      normal: "<code>train_test_split(X, y, test_size=0.2, random_state=42)</code> splits the data randomly. The <b>training set</b> fits the model, the <b>test set</b> estimates performance on unseen data. For tuning (choosing k, depth, degree…) use a third <b>validation set</b> or cross validation – never the test set, otherwise it is no longer “unseen”.",
      technical: "Typical splits: 80/20 or 60/20/20 (train/val/test). Use <code>stratify=y</code> to keep class ratios for imbalanced data. For time series split chronologically (train on the past, test on the future) to avoid leakage. Any preprocessing (scaling, imputation) must be fitted on the training set only – ideally inside a scikit-learn <code>Pipeline</code>." } },
    { t: "widget", w: "overfit" },
    { t: "text", h: "Under- vs. overfitting", levels: {
      simple: "Too simple: misses the pattern. Too complex: learns the noise. Just right: follows the pattern and ignores the noise.",
      normal: "<b>Underfitting</b> (high bias): high error on training and test data – the model is too simple. <b>Overfitting</b> (high variance): very low training error, high test error – the model memorises noise. Remedies for overfitting: more data, simpler model, regularisation, early stopping. Remedies for underfitting: more features, more complex model.",
      technical: "Bias–variance trade-off: expected test error = bias² + variance + irreducible noise. Increasing model capacity lowers bias and raises variance. Regularisation (L2/Ridge, L1/Lasso) penalises large weights; for trees limit depth, for neural nets use dropout and early stopping." } },
    { t: "check", q: "Training accuracy 99 %, test accuracy 71 %. Diagnosis?", opts: ["Underfitting", "Overfitting", "Perfect model", "Data leakage in the test set"], a: 1, why: "A large gap between training and test performance is the classic sign of overfitting." },
    { t: "check", q: "You tried 20 hyperparameter settings and picked the one with the best <b>test</b> score. What is the problem?", opts: ["None", "The test score is now optimistically biased – the test set was used for model selection", "You should have used fewer settings", "The training set is too small"], a: 1, why: "The test set must stay untouched until the very end. Use a validation set or cross validation for tuning." },
    { t: "keys", items: ["split before you train: <code>train_test_split</code>", "tune on validation / CV, report on test", "underfitting: bad everywhere", "overfitting: great on train, bad on test", "fit preprocessing on train only (Pipeline)"] }
  ]},
  { id: "w13-2", title: "Confusion matrix, precision & recall", topic: "metrics", min: 14, xp: 40, blocks: [
    { t: "lead", html: "Accuracy alone can lie. If 1 % of transactions are fraud, a model that always says “no fraud” has 99 % accuracy and is useless." },
    { t: "widget", w: "confusion" },
    { t: "text", h: "Four boxes, four questions", levels: {
      simple: "Precision: when the model says “yes”, how often is it right? Recall: of all real “yes” cases, how many did it find?",
      normal: "<b>Precision</b> = TP / (TP + FP) – important when false alarms are expensive (spam filter, fraud blocking a card). <b>Recall</b> (sensitivity) = TP / (TP + FN) – important when misses are expensive (cancer screening, defect detection). <b>F1</b> is the harmonic mean of both. Raising the threshold usually increases precision and lowers recall.",
      technical: "Accuracy = (TP+TN)/N, specificity = TN/(TN+FP), F1 = 2PR/(P+R). The ROC curve plots recall vs. false positive rate for all thresholds; AUC summarises it (0.5 = random, 1 = perfect). For heavily imbalanced data the precision–recall curve is more informative. scikit-learn: <code>confusion_matrix</code>, <code>classification_report</code>, <code>roc_auc_score</code>." },
      alt: [{ label: "Worked example", html: "100 patients, 10 sick. The test flags 12: 8 sick, 4 healthy. TP = 8, FP = 4, FN = 2, TN = 86. Precision = 8/12 = 67 %, recall = 8/10 = 80 %, accuracy = 94/100 = 94 %." }] },
    { t: "check", q: "TP = 30, FP = 10, FN = 20, TN = 140. What is the precision?", opts: ["60 %", "75 %", "85 %", "30 %"], a: 1, why: "Precision = 30 / (30 + 10) = 0.75. Recall would be 30 / (30 + 20) = 60 %." },
    { t: "check", q: "For an airport weapon scanner, which metric matters most?", opts: ["Precision", "Recall", "Specificity", "Training accuracy"], a: 1, why: "Missing a weapon (FN) is unacceptable; a false alarm just means a manual check." },
    { t: "check", q: "95 % of emails in a dataset are not spam. A model predicts “not spam” for everything. Accuracy and recall for spam?", opts: ["95 % / 0 %", "95 % / 95 %", "5 % / 100 %", "50 % / 50 %"], a: 0, why: "It is right for all 95 % normal emails but finds none of the spam → recall 0. That is why accuracy is misleading for imbalanced data." },
    { t: "text", h: "Metrics for regression", levels: {
      simple: "For numbers (prices, scores) you measure how far the predictions are off on average.",
      normal: "<b>MAE</b> = mean absolute error (average distance, same unit as y). <b>MSE</b> = mean squared error (punishes big errors more). <b>RMSE</b> = √MSE (back in the unit of y). <b>R²</b> = share of the variance explained by the model (1 = perfect, 0 = no better than always predicting the mean).",
      technical: "R² = 1 − SS_res / SS_tot with SS_res = Σ(yᵢ − ŷᵢ)², SS_tot = Σ(yᵢ − ȳ)². R² can be negative on test data if the model is worse than the mean. scikit-learn: <code>mean_absolute_error</code>, <code>mean_squared_error</code>, <code>r2_score</code>." } },
    { t: "check", q: "Predictions 50, 60, 70 for true values 52, 57, 70. MAE?", opts: ["1.67", "5", "4.33", "2.5"], a: 0, why: "|−2| + |3| + |0| = 5; 5 / 3 ≈ 1.67." }
  ]},
  { id: "w13-3", title: "Cross validation", topic: "cv", min: 10, xp: 30, blocks: [
    { t: "lead", html: "One random split can be lucky or unlucky. Cross validation repeats the split k times so that every data point is used for testing exactly once." },
    { t: "widget", w: "kfold" },
    { t: "text", h: "How to use it", levels: {
      simple: "Split the data into k parts. Train k times, each time leaving a different part out for testing. Average the k scores.",
      normal: "<code>cross_val_score(model, X, y, cv=5)</code> returns 5 scores; report mean ± standard deviation. Use it to compare models or choose hyperparameters (<code>GridSearchCV</code> does this automatically). Keep a final test set aside for the very last check.",
      technical: "Stratified k-fold keeps class proportions per fold (default for classifiers in scikit-learn). Leave-one-out (k = n) has low bias but high variance and cost. Nested CV (outer loop for evaluation, inner loop for tuning) gives an unbiased estimate when hyperparameters are tuned. Group k-fold prevents the same subject/customer from appearing in train and test." } },
    { t: "check", q: "With 5-fold cross validation on 1 000 rows, how many models are trained and on how many rows each?", opts: ["1 model on 1 000 rows", "5 models on 800 rows each", "5 models on 200 rows each", "1 000 models on 999 rows"], a: 1, why: "Each round leaves one fold (200 rows) out and trains on the remaining 800." },
    { t: "check", q: "What is the main advantage of cross validation over a single train/test split?", opts: ["It is faster", "More reliable estimate: every point is tested once and you see the spread", "It needs no test data at all", "It prevents all overfitting"], a: 1, why: "Averaging over k splits reduces the luck of one particular split and the standard deviation shows how stable the model is." },
    { t: "keys", items: ["k-fold: k rounds, each fold is test set once", "report mean ± std", "use CV for tuning, keep a final test set", "<code>cross_val_score</code>, <code>GridSearchCV</code>"] }
  ]}
 ]},

 { id: "w14", n: 14, title: "Modeling & Simulation", sub: "Part 2 · W. Granigg · systems, ODEs, agents, Monte Carlo", boss: { id: "boss-w14", title: "Simulation Boss", topics: ["modsim", "ode", "abm", "mcevo"] }, lessons: [
  { id: "w14-1", title: "Models, systems and feedback", topic: "modsim", min: 12, xp: 35, blocks: [
    { t: "callout", html: "<b>Own material</b> based on the syllabus and the recommended books (Bossel: <i>Systeme, Dynamik, Simulation</i>; Sayama: <i>Introduction to the Modeling and Analysis of Complex Systems</i>). Compare with the lecture slides once Part 2 starts." },
    { t: "lead", html: "Machine learning learns patterns from data. <b>Simulation</b> works the other way round: you describe <i>how</i> a system works and let the computer play out what happens." },
    { t: "text", h: "What is a model?", levels: {
      simple: "A model is a simplified picture of reality that keeps only what matters for your question. A city map ignores the colour of the houses – and that is fine.",
      normal: "A <b>system</b> consists of elements, their relations and a boundary to the environment. A <b>model</b> is a purposeful simplification of a system. A <b>simulation</b> runs the model over time to answer “what if?” questions: What if the interest rate rises? What if 60 % stay home? Simulation is useful when experiments are too expensive, dangerous, slow or impossible.",
      technical: "Model types: static vs. dynamic, deterministic vs. stochastic, continuous (differential equations) vs. discrete (difference equations, events, agents). Modelling cycle: question → system boundary → structure (causal diagram) → equations → implementation → validation against data → experiments. “All models are wrong, but some are useful” (G. Box)." } },
    { t: "text", h: "Stocks, flows and feedback loops", levels: {
      simple: "A stock is something that accumulates (water in a tub, money in an account, people who are ill). Flows fill or empty it. Feedback: the stock itself changes its flows.",
      normal: "<b>Reinforcing loop (+)</b>: more leads to even more – interest on savings, viral growth, rumours. <b>Balancing loop (−)</b>: the system pulls itself towards a goal – thermostat, a draining tub, market saturation. Most interesting behaviour (S-curves, oscillations, overshoot and collapse) comes from combinations of these loops.",
      technical: "System dynamics (J. Forrester) writes a stock as an integral of its net flow: S(t) = S(0) + ∫(inflow − outflow) dt, i.e. dS/dt = inflow − outflow. Delays inside balancing loops cause oscillations (inventory “bullwhip effect”). Causal loop diagrams mark each link with + or −; a loop with an even number of − is reinforcing." } },
    { t: "widget", w: "stockflow" },
    { t: "check", q: "A savings account earns interest on its balance. Which structure is that?", opts: ["Balancing loop", "Reinforcing loop", "No feedback", "Random process"], a: 1, why: "More balance → more interest → even more balance: exponential growth." },
    { t: "check", q: "In the bathtub model with inflow 8 and outflow 0.1·stock, where does the stock end up?", opts: ["0", "8", "80", "It grows forever"], a: 2, why: "Equilibrium when inflow = outflow: 8 = 0.1·S → S = 80." },
    { t: "keys", items: ["model = purposeful simplification", "simulation = run the model over time, test “what if”", "stock accumulates, flows change it", "reinforcing loop → growth; balancing loop → goal seeking", "all models are wrong, some are useful"] }
  ]},
  { id: "w14-2", title: "Modeling with differential equations", topic: "ode", min: 15, xp: 40, blocks: [
    { t: "lead", html: "A differential equation describes <b>how fast</b> something changes depending on its current state. The computer turns this rule into a trajectory with small time steps." },
    { t: "text", h: "From growth to saturation", levels: {
      simple: "Bacteria double regularly – until the food runs out. Then growth slows down and stops at a maximum.",
      normal: "<b>Exponential growth</b>: dN/dt = r·N (reinforcing loop only). <b>Logistic growth</b>: dN/dt = r·N·(1 − N/K) – the factor (1 − N/K) is a balancing loop that slows growth as N approaches the capacity K. Result: the famous S-curve (market adoption, epidemics, populations).",
      technical: "Exponential: N(t) = N₀·e^{rt}. Logistic: N(t) = K / (1 + (K/N₀ − 1)·e^{−rt}), inflection point at N = K/2 with maximum growth rK/4. Most real models have no closed-form solution and are solved numerically (Euler, Runge–Kutta; in Python <code>scipy.integrate.solve_ivp</code>)." } },
    { t: "widget", w: "euler" },
    { t: "text", h: "The Euler method", levels: {
      simple: "Look at the current speed of change, take a small step in that direction, repeat.",
      normal: "N(t + Δt) ≈ N(t) + Δt · f(N(t)). Small Δt → accurate but many steps. Large Δt → fast but inaccurate, it can even produce oscillations that do not exist in reality. Check your result by halving Δt: if the curve barely changes, the step size is fine.",
      technical: "Euler is first order: the global error shrinks proportionally to Δt. Runge–Kutta 4 is fourth order (error ∝ Δt⁴) and evaluates f four times per step. Stiff systems need implicit methods. In Python:<br><code>from scipy.integrate import solve_ivp<br>sol = solve_ivp(lambda t, n: [r*n[0]*(1-n[0]/K)], (0, 12), [5])</code>" } },
    { t: "widget", w: "lotka" },
    { t: "check", q: "Which equation describes growth that slows down near a capacity K?", opts: ["dN/dt = r·N", "dN/dt = r·N·(1 − N/K)", "dN/dt = −r·N", "N(t+1) = N(t) + r"], a: 1, why: "The factor (1 − N/K) goes to 0 as N approaches K, so growth stops." },
    { t: "check", q: "Your Euler simulation oscillates around K although the real system does not. What do you do first?", opts: ["Increase Δt", "Decrease Δt and compare", "Change K", "Ignore it"], a: 1, why: "Oscillations from too large steps are a numerical artefact. Halving Δt shows whether the result is stable." },
    { t: "check", q: "In the predator–prey model, what happens right after the prey population peaks?", opts: ["Predators peak slightly later", "Both die out immediately", "Prey keeps growing forever", "Predators peak slightly earlier"], a: 0, why: "Predators need food first: their peak lags behind the prey peak, creating cycles." }
  ]},
  { id: "w14-3", title: "Agent-based modeling", topic: "abm", min: 12, xp: 35, blocks: [
    { t: "lead", html: "Instead of one equation for the whole population, give every individual (agent) simple rules and watch what the crowd does." },
    { t: "widget", w: "abm" },
    { t: "text", h: "Bottom-up instead of top-down", levels: {
      simple: "Each agent only knows its own rules and its neighbours. The overall pattern – the epidemic curve, a traffic jam, a market crash – appears by itself. That is called emergence.",
      normal: "Agent-based models (ABM) are useful when individuals are <b>different</b> (age, behaviour, location), interact <b>locally</b> or adapt. Examples: traffic, evacuation, spread of opinions, supply chains, Schelling’s segregation model. Because rules contain randomness, you run a simulation <b>many times</b> and look at the distribution of outcomes.",
      technical: "An ABM has agents (state + rules), an environment (grid, network, continuous space) and a scheduler. Compared with the SIR differential equations (dS/dt = −βSI/N, dI/dt = βSI/N − γI, dR/dt = γI) the ABM can include heterogeneity and networks, but is harder to calibrate and analyse. Python: <code>Mesa</code>; classic tool: NetLogo." } },
    { t: "check", q: "What is “emergence” in agent-based models?", opts: ["A bug in the simulation", "A global pattern that arises from simple local rules without being programmed directly", "The start of the simulation", "The agent with the highest score"], a: 1, why: "No agent “knows” the epidemic curve, yet it appears from their interactions." },
    { t: "check", q: "Why do you run a stochastic simulation many times?", opts: ["To make it slower", "Because single runs vary randomly; you need the distribution of outcomes", "To use more memory", "Because the first run is always wrong"], a: 1, why: "Random events make each run different. Averages and ranges over many runs are what you can trust." }
  ]},
  { id: "w14-4", title: "Outlook: Monte Carlo & evolutionary methods", topic: "mcevo", min: 12, xp: 35, blocks: [
    { t: "lead", html: "Two powerful ideas that both use randomness on purpose: <b>Monte Carlo</b> estimates results by sampling, <b>evolutionary algorithms</b> search for good solutions by imitating natural selection." },
    { t: "widget", w: "montecarlo" },
    { t: "text", h: "Monte Carlo simulation", levels: {
      simple: "If something is too complicated to calculate, try it randomly very often and count.",
      normal: "Business uses: risk of a project (draw uncertain costs and durations 10 000 times → distribution of total cost), portfolio risk, queue waiting times, inventory planning. The precision grows with the number of runs, but slowly: error ∝ 1/√n.",
      technical: "Estimate E[f(X)] ≈ (1/n) Σ f(xᵢ) with xᵢ drawn from the input distribution. Standard error = σ/√n. Variance-reduction techniques (antithetic variates, importance sampling) improve efficiency. In NumPy: <code>rng = np.random.default_rng(); x = rng.random(n); y = rng.random(n); pi = 4*np.mean(x**2 + y**2 <= 1)</code>." } },
    { t: "widget", w: "evo" },
    { t: "text", h: "Genetic / evolutionary algorithms", levels: {
      simple: "Create many random solutions, keep the better ones, mix them and change them a little. After many generations the solutions become good.",
      normal: "Components: <b>population</b> of candidate solutions, <b>fitness function</b> (how good is a solution?), <b>selection</b>, <b>crossover</b> and <b>mutation</b>. Useful for hard optimisation problems without a formula for the gradient: timetables, routing, design parameters. No guarantee of the global optimum, but often good solutions quickly.",
      technical: "Mutation keeps diversity (exploration), selection drives improvement (exploitation). Too little mutation → premature convergence; too much → random search. Elitism keeps the best individual. Related methods: evolution strategies, simulated annealing, particle swarm optimisation. Compared with gradient descent (World 10) they need no derivatives." } },
    { t: "check", q: "A Monte Carlo estimate with 10 000 samples has an error of about 0.02. Roughly how many samples for an error of 0.002?", opts: ["20 000", "100 000", "1 000 000", "10 001"], a: 2, why: "Error ∝ 1/√n: 10× more precision needs 100× more samples." },
    { t: "check", q: "In a genetic algorithm, what is the role of mutation?", opts: ["It removes the best solution", "It introduces new variation so the search does not get stuck", "It calculates the gradient", "It sorts the population"], a: 1, why: "Without mutation the population can only recombine existing bits and may never find missing pieces." },
    { t: "keys", items: ["Monte Carlo: repeat random experiments, count, average", "error ∝ 1/√n", "GA: population, fitness, selection, crossover, mutation", "no derivatives needed, no optimum guarantee"] }
  ]}
 ]}
];

/* Question bank. type: mc | tf | fill */
const QUESTIONS = [
 { id: "q1", topic: "supervised", q: "Which statement best describes supervised learning?", opts: ["The algorithm receives no known target variable.", "The training dataset contains target labels.", "The algorithm can only perform clustering.", "The algorithm does not use training data."], a: 1, why: "Supervised = the ground truth for the training data is known.", ex: "A spam filter trained on emails already marked spam / not spam." },
 { id: "q2", topic: "supervised", q: "Which is a regression problem?", opts: ["Spam detection", "Customer segmentation", "Predicting a house price", "Detecting fraudulent transactions as fraud/not fraud"], a: 2, why: "A price is continuous.", ex: "House price from m² and rooms." },
 { id: "q3", topic: "unsup", q: "Which is an example of unsupervised learning?", opts: ["Predicting temperature", "Spam classification", "Grouping customers into unknown segments", "Predicting whether a machine fails"], a: 2, why: "Segments are not known upfront, so there are no labels.", ex: "k-Means on purchase behaviour." },
 { id: "q4", topic: "supervised", q: "Predicting whether a component is broken is…", opts: ["Regression", "Binary classification", "Clustering", "Reinforcement learning"], a: 1, why: "Two classes: broken / working.", ex: "Quality control on a production line." },
 { id: "q5", topic: "supervised", q: "Predicting tomorrow’s peak temperature is…", opts: ["Classification", "Regression", "Anomaly detection", "Dimensionality reduction"], a: 1, why: "Temperature is a continuous value.", ex: "ŷ = 23.4 °C" },
 { id: "q6", topic: "unsup", q: "Dimensionality reduction aims to…", opts: ["add more features", "reduce the number of variables with minimal information loss", "label the data", "remove outliers"], a: 1, why: "Fewer variables, most of the information kept.", ex: "PCA compressing 50 sensor channels to 3 components." },
 { id: "q7", topic: "unsup", q: "Anomaly detection finds…", opts: ["the mean of the data", "data points that are significantly different", "the best learning rate", "missing labels"], a: 1, why: "Outliers are the target.", ex: "An unusual credit-card transaction at 3 a.m. abroad." },
 { id: "q8", topic: "rl", q: "In reinforcement learning the agent tries to maximise…", opts: ["the number of labels", "the reward", "the loss", "the number of clusters"], a: 1, why: "Rewards represent the fitness/quality of its actions.", ex: "AWS DeepRacer learns to drive laps fast." },
 { id: "q9", topic: "rl", q: "“An abstracted view on the environment’s state” is the…", opts: ["Action", "Reward", "State", "Agent"], a: 2, why: "The interpreter maps observations to a state.", ex: "Grid position (row 2, col 3)." },
 { id: "q10", topic: "classes", q: "Semi-supervised learning uses…", opts: ["only labelled data", "a small amount of labelled plus a lot of unlabelled data", "only rewards", "no data"], a: 1, why: "It sits between supervised and unsupervised.", ex: "Recommender systems." },
 { id: "q11", topic: "mlbasics", tf: true, q: "In classical software, the rules are written by a programmer; in machine learning, the rules are learned from data.", a: 0, why: "That is the paradigm shift from the lecture.", ex: "A hand-written spam rule vs. a learned spam model." },
 { id: "q12", topic: "mlbasics", q: "The inputs to supervised ML training are…", opts: ["rules + input data", "input data + response data", "a model + predictions", "rewards + states"], a: 1, why: "Known inputs and known outputs produce the rule set.", ex: "Past house features + sale prices." },
 { id: "q13", topic: "mlbasics", q: "Applying a trained model to new inputs is called…", opts: ["training", "inference", "labelling", "clustering"], a: 1, why: "Inference = using the model to predict.", ex: "Classifying today’s incoming mail." },
 { id: "q14", topic: "accprec", q: "Shots tightly grouped but far from the bullseye are…", opts: ["accurate and precise", "precise, not accurate", "accurate, not precise", "neither"], a: 1, why: "Tight group = precise; offset = inaccurate.", ex: "A miscalibrated sight on a rifle." },
 { id: "q15", topic: "accprec", q: "Scattered shots whose average is the bullseye are…", opts: ["accurate, not precise", "precise, not accurate", "both", "neither"], a: 0, why: "Right on average, large spread.", ex: "An unbiased but noisy sensor." },
 { id: "q16", topic: "corr", q: "Ice cream sales and sunburn cases rise together. Does ice cream cause sunburn?", opts: ["Yes", "No, a hidden variable (sunny weather) drives both"], a: 1, why: "A confounder causes both.", ex: "Hot summer days." },
 { id: "q17", topic: "corr", tf: true, q: "A strong correlation between A and B proves that A causes B.", a: 1, why: "It could be B→A, a confounder C, or chance.", ex: "Firefighters at a fire correlate with damage." },
 { id: "q18", topic: "bias", q: "Armor should be added where returning planes show…", opts: ["the most bullet holes", "no bullet holes", "holes on the wings only", "holes on the tail only"], a: 1, why: "Planes hit there didn’t return: survivorship bias.", ex: "Abraham Wald’s analysis for the Statistical Research Group." },
 { id: "q19", topic: "bias", q: "Studying only successful start-ups to find success factors is an example of…", opts: ["availability bias", "survivorship bias", "frequency illusion", "confirmation of causality"], a: 1, why: "Failed start-ups with the same traits are invisible.", ex: "“They all dropped out of college.”" },
 { id: "q20", topic: "bias", q: "Using whatever data is easiest to access instead of a representative sample is…", opts: ["availability bias", "survivorship bias", "overfitting", "precision"], a: 0, why: "Convenient ≠ representative.", ex: "Surveying only your own students for a national poll." },
 { id: "q21", topic: "bias", q: "After learning a new word you suddenly see it everywhere. This is…", opts: ["frequency illusion", "availability bias", "survivorship bias", "regression to the mean"], a: 0, why: "Noticing, not occurrence, increased.", ex: "Seeing your new car model on every street." },
 { id: "q22", topic: "ai", q: "“Mutation and selection to solve complex optimisation tasks” describes…", opts: ["Swarm intelligence", "Evolutionary methods", "Fuzzy logic", "GOFAI"], a: 1, why: "Evolution’s mechanisms applied to optimisation.", ex: "Genetic algorithms for timetable planning." },
 { id: "q23", topic: "ai", q: "“Many simple individuals create intelligent group behaviour” describes…", opts: ["Neural networks", "Swarm intelligence", "Statistical learning", "Symbolic AI"], a: 1, why: "Simple local rules, emergent global behaviour.", ex: "Ant colony optimisation for routing." },
 { id: "q24", topic: "ai", q: "“Good Old-Fashioned AI” builds on…", opts: ["principles of logic (symbolic methods)", "gradient descent", "rewards", "fuzzy sets"], a: 0, why: "GOFAI = symbolic, rule/logic based.", ex: "Expert systems, theorem provers." },
 { id: "q25", topic: "ai", q: "Fuzzy logic represents…", opts: ["sharp true/false rules", "non-sharp rules resembling human common sense (“Hausverstand”)", "neural weights", "random search"], a: 1, why: "Degrees of truth between 0 and 1.", ex: "“If it’s fairly cold, heat a bit.”" },
 { id: "q26", topic: "ai", q: "ChatGPT is an example of…", opts: ["Artificial General Intelligence", "Artificial Narrow Intelligence", "Symbolic AI", "Swarm intelligence"], a: 1, why: "AGI is the current push, not the current state.", ex: "Strong at language tasks, not a general agent." },
 { id: "q27", topic: "llm", q: "The transformer architecture was introduced in…", opts: ["“Attention Is All You Need” (2017)", "“Deep Blue” (1997)", "“ImageNet” (2012)", "“Perceptron” (1958)"], a: 0, why: "Vaswani et al., 2017.", ex: "The T in GPT." },
 { id: "q28", topic: "llm", q: "Roughly how many parameters did GPT-3.5 have according to the lecture?", opts: ["175 million", "175 billion", "1.75 trillion", "17.5 billion"], a: 1, why: "~175 billion degrees of freedom.", ex: "GPT-3 (175B) on the scaling chart." },
 { id: "q29", topic: "llm", q: "Which hardware made training large models feasible?", opts: ["CPUs", "GPUs", "Hard drives", "FPGAs only"], a: 1, why: "GPU compute grew massively.", ex: "A100 → Blackwell." },
 { id: "q30", topic: "ds", q: "In Conway’s diagram, “Hacking Skills + Substantive Expertise” without math is the…", opts: ["Danger Zone", "Machine Learning", "Traditional Research", "Data Science"], a: 0, why: "Plausible but statistically unsound analysis.", ex: "A dashboard that overinterprets noise." },
 { id: "q31", topic: "ds", q: "Asking the right questions and structuring a problem description belongs to…", opts: ["Hacking skills", "Math & statistics", "Substantive expertise (business analysis)", "Cloud"], a: 2, why: "Domain understanding.", ex: "Clarifying which KPI “sales” means." },
 { id: "q32", topic: "ethics", q: "Cambridge Analytica is the lecture’s example for…", opts: ["deepfakes", "human profiling and manipulation", "AI safety", "GDPR fines"], a: 1, why: "Psychographic profiles used for targeted political ads.", ex: "2016 election campaigns." },
 { id: "q33", topic: "ethics", q: "A hiring model trained on 10 years of past hiring decisions should be checked first for…", opts: ["GPU usage", "historical bias in the data", "the learning rate", "missing Python packages"], a: 1, why: "It learns past prejudice as “ground truth”.", ex: "Amazon’s scrapped recruiting model (2018)." },
 { id: "q34", topic: "lifecycle", q: "Which stage comes first in the Team Data Science Process?", opts: ["Modeling", "Business understanding", "Deployment", "Data acquisition"], a: 1, why: "Start with the problem.", ex: "Define success metrics with stakeholders." },
 { id: "q35", topic: "lifecycle", q: "Feature engineering, model training and model evaluation belong to…", opts: ["Deployment", "Modeling", "Data acquisition", "Customer acceptance"], a: 1, why: "They are the three boxes of the modeling stage.", ex: "Binning, parameter tuning, cross validation." },
 { id: "q36", topic: "lifecycle", tf: true, q: "Data science projects usually run through the lifecycle exactly once, in order.", a: 1, why: "They are seldom acyclic and linear; arrows go both ways.", ex: "Evaluation sends you back to data cleaning." },
 { id: "q37", topic: "git", q: "Which command uploads your local commits to GitLab?", opts: ["git add", "git commit", "git push", "git status"], a: 2, why: "push sends commits to the remote.", ex: "git push origin main" },
 { id: "q38", topic: "git", q: "Which command shows modified and staged files?", opts: ["git log", "git status", "git diff --stat HEAD~5", "git remote -v"], a: 1, why: "status summarises the working tree and index.", ex: "“Changes not staged for commit…”" },
 { id: "q39", topic: "ssh", q: "Which key do you add to GitLab?", opts: ["the private key", "the public key (.pub)", "both", "neither, GitLab generates it"], a: 1, why: "The private key never leaves your machine.", ex: "~/.ssh/id_ed25519.pub" },
 { id: "q40", topic: "tools", q: "Which tool manages Python projects and dependencies in this course?", opts: ["conda", "uv", "npm", "maven"], a: 1, why: "uv is used for project management.", ex: "uv init, uv add, uv run" },
 { id: "q41", topic: "python", code: "numbers = [2, 4, 6, 8]\nprint(sum(numbers) / len(numbers))", q: "What does this code print?", opts: ["5", "5.0", "20", "4"], a: 1, why: "sum = 20, len = 4, and / always returns a float in Python 3.", ex: "20 / 4 → 5.0" },
 { id: "q42", topic: "python", code: "d = {\"a\": 1, \"b\": 2}\nd[\"c\"] = d[\"a\"] + d[\"b\"]\nprint(len(d))", q: "What does this code print?", opts: ["2", "3", "6", "KeyError"], a: 1, why: "A new key \"c\" is added, so the dict has 3 entries.", ex: "{'a':1,'b':2,'c':3}" },
 { id: "q43", topic: "python", code: "s = 0\nfor i in range(1, 4):\n    s += i * i\nprint(s)", q: "What does this code print?", opts: ["14", "30", "9", "6"], a: 0, why: "range(1,4) is 1,2,3 → 1+4+9 = 14.", ex: "range stops before the end value." },
 { id: "q44", topic: "pandas", q: "Which pandas expression keeps only rows where hours > 5?", opts: ["df.filter(hours > 5)", "df[df[\"hours\"] > 5]", "df.where(\"hours\" > 5)", "df.loc[\"hours\" > 5]"], a: 1, why: "A boolean Series indexes the rows.", ex: "df[df[\"hours\"] > 5].shape" },
 { id: "q45", topic: "pandas", q: "How do you count missing values per column?", opts: ["df.count_na()", "df.isna().sum()", "df.missing()", "len(df.null)"], a: 1, why: "isna() gives booleans; sum() counts True per column.", ex: "attendance    2" },
 { id: "q46", topic: "linreg", q: "In ŷ = m·x + b, the residual of a point is…", opts: ["y − ŷ", "m · x", "ŷ / y", "b − m"], a: 0, why: "Observed minus predicted.", ex: "y = 80, ŷ = 74 → residual 6." },
 { id: "q47", topic: "linreg", q: "Why is MSE squared?", opts: ["To make it faster", "So positive and negative errors don’t cancel and large errors weigh more", "Because m is squared", "It isn’t squared"], a: 1, why: "Squares are non-negative and penalise large errors.", ex: "Errors 3 and −3 → MSE 9, not 0." },
 { id: "q48", topic: "gd", q: "In gradient descent, the parameter update is…", opts: ["θ + η·∇L", "θ − η·∇L", "θ · η", "∇L / η"], a: 1, why: "Step against the gradient.", ex: "m = m − lr * dm" },
 { id: "q49", topic: "gd", q: "A learning rate that is too small leads to…", opts: ["divergence", "very slow convergence", "overfitting", "no gradient"], a: 1, why: "Tiny steps, many iterations.", ex: "10,000 steps to reach the minimum." },
 { id: "q50", topic: "gd", q: "A learning rate that is too large leads to…", opts: ["slow convergence", "overshooting / divergence", "a perfect fit", "fewer parameters"], a: 1, why: "Steps jump past the minimum.", ex: "Loss grows each iteration." },
 { id: "q51", topic: "logreg", q: "The sigmoid maps any real number to…", opts: ["{0, 1}", "(0, 1)", "[−1, 1]", "ℝ⁺"], a: 1, why: "A probability between 0 and 1.", ex: "σ(0) = 0.5" },
 { id: "q52", topic: "logreg", q: "Raising the classification threshold from 0.5 to 0.8 makes the model predict the positive class…", opts: ["more often", "less often", "equally often", "never"], a: 1, why: "A higher bar for “positive”.", ex: "Fewer students predicted to pass." },
 { id: "q53", topic: "explore", q: "Which is robust against outliers?", opts: ["the mean", "the median", "the maximum", "the sum"], a: 1, why: "The median ignores how extreme values are.", ex: "Median income vs. mean income." },
 { id: "q54", topic: "explore", q: "A Pearson correlation of −0.9 between two variables means…", opts: ["no relationship", "a strong negative linear relationship", "a weak positive relationship", "causation"], a: 1, why: "Close to −1 = strong, decreasing linear relationship.", ex: "More absences, lower grades." },
 { id: "q55", topic: "methods", q: "k-Means is a…", opts: ["classification method", "clustering method", "regression method", "reinforcement method"], a: 1, why: "Unsupervised grouping into k clusters.", ex: "Customer types." },
 { id: "q56", topic: "methods", q: "A decision tree makes predictions by…", opts: ["averaging all training labels", "a sequence of feature-based splits", "drawing a single line", "random guessing"], a: 1, why: "Each node tests a feature; leaves hold the prediction.", ex: "hours > 4 → attendance > 70% → pass" },
 { id: "q57", topic: "mlbasics", q: "“Machine learning: the structure of the model is induced, parameters are learned.” The induced structure is called…", opts: ["inductive bias", "survivorship bias", "gradient", "label"], a: 0, why: "Assumptions built into the model class.", ex: "Choosing a straight line for linear regression." },
 { id: "q58", topic: "classes", q: "Adaptive controls are the lecture’s example for…", opts: ["unsupervised learning", "reinforcement learning", "supervised learning", "semi-supervised learning"], a: 1, why: "An agent learns a control strategy from rewards.", ex: "A thermostat learning when to heat." },
 { id: "q59", topic: "classes", q: "A spam filter is the lecture’s example for…", opts: ["classification", "clustering", "regression", "dimensionality reduction"], a: 0, why: "Spam / not spam.", ex: "Supervised, binary." },
 { id: "q60", topic: "classes", q: "Feature extraction is the lecture’s example for…", opts: ["clustering", "dimensionality reduction", "regression", "RL"], a: 1, why: "Fewer, more informative variables.", ex: "Compressing images to key features." },
 { id: "q61", topic: "knn", q: "kNN with k = 5: the five nearest neighbours are A, A, B, B, B. Prediction?", opts: ["A", "B", "Tie", "No prediction possible"], a: 1, why: "Majority vote 3:2 for B.", ex: "A new customer is assigned to the segment most of the 5 most similar customers belong to." },
 { id: "q62", topic: "knn", q: "Which statement about kNN is true?", opts: ["Training is slow, prediction is fast", "There is almost no training, but prediction must compare with all stored points", "kNN learns weights with gradient descent", "kNN cannot be used for classification"], a: 1, why: "kNN is a lazy learner: it just stores the data and does the work at prediction time." },
 { id: "q63", topic: "trees", q: "What does a leaf in a decision tree contain?", opts: ["A feature to split on", "The final prediction", "The learning rate", "The test data"], a: 1, why: "Inner nodes ask questions, leaves give the answer (class or value)." },
 { id: "q64", topic: "trees", q: "Which is a strength of decision trees?", opts: ["They never overfit", "They are easy to interpret and need no feature scaling", "They always find the global optimum", "They only work with images"], a: 1, why: "Every prediction can be followed as a path of yes/no questions, and thresholds don’t care about units." },
 { id: "q65", topic: "trees", q: "A node has 8 pass and 0 fail students. Gini impurity?", opts: ["0", "0.5", "1", "0.8"], a: 0, why: "Pure node: 1 − 1² − 0² = 0." },
 { id: "q66", topic: "kmeans", q: "k-Means gives different clusters on two runs. Why?", opts: ["It is broken", "The random initial centres lead to different local optima", "The data changed", "k changes automatically"], a: 1, why: "Lloyd’s algorithm converges to a local optimum that depends on the start. Use several initialisations (n_init)." },
 { id: "q67", topic: "kmeans", q: "Which data problem hurts k-means most?", opts: ["Many rows", "Strong outliers and unscaled features", "Integer values", "Sorted data"], a: 1, why: "Centres are means, so outliers pull them away; unscaled features dominate the distance." },
 { id: "q68", topic: "nbayes", q: "Naive Bayes is especially popular for…", opts: ["Image generation", "Text classification such as spam filtering", "Reinforcement learning", "Time series forecasting"], a: 1, why: "It is fast, needs little data and works well with word features." },
 { id: "q69", topic: "overfit", q: "What is the purpose of the test set?", opts: ["To train the model", "To tune hyperparameters", "To estimate performance on unseen data at the very end", "To fill missing values"], a: 2, why: "The test set must stay untouched until the final evaluation." },
 { id: "q70", topic: "overfit", q: "Both training and test error are high. Diagnosis?", opts: ["Overfitting", "Underfitting", "Data leakage", "Perfect fit"], a: 1, why: "The model is too simple to capture the pattern." },
 { id: "q71", topic: "overfit", q: "You scale the whole dataset with StandardScaler and then split into train/test. What is wrong?", opts: ["Nothing", "Information from the test set leaks into training via mean and std", "Scaling must happen after training", "StandardScaler only works on test data"], a: 1, why: "Fit the scaler on the training data only, then transform both – best inside a Pipeline." },
 { id: "q72", topic: "metrics", q: "Recall is defined as…", opts: ["TP / (TP + FP)", "TP / (TP + FN)", "(TP + TN) / all", "TN / (TN + FP)"], a: 1, why: "Recall: of all actual positives, how many were found." },
 { id: "q73", topic: "metrics", q: "Raising the classification threshold usually…", opts: ["increases recall, lowers precision", "increases precision, lowers recall", "changes nothing", "increases both"], a: 1, why: "The model says “positive” less often: fewer false alarms, but more misses." },
 { id: "q74", topic: "metrics", q: "R² = 0 for a regression model means…", opts: ["perfect predictions", "no better than always predicting the mean", "all predictions are 0", "the model is overfitted"], a: 1, why: "R² compares the model’s squared error with that of the mean predictor." },
 { id: "q75", topic: "metrics", q: "Why is RMSE often preferred over MSE for reporting?", opts: ["It is always smaller", "It is in the same unit as the target variable", "It ignores outliers", "It is a classification metric"], a: 1, why: "MSE is in squared units (e.g. €²); the square root brings it back to €." },
 { id: "q76", topic: "cv", q: "In 10-fold cross validation, each data point is used for testing…", opts: ["never", "exactly once", "ten times", "randomly"], a: 1, why: "Each fold is the test fold in exactly one round." },
 { id: "q77", topic: "cv", q: "Which scikit-learn function evaluates a model with k-fold CV in one line?", opts: ["train_test_split", "cross_val_score", "fit_transform", "confusion_matrix"], a: 1, why: "cross_val_score(model, X, y, cv=5) returns one score per fold." },
 { id: "q78", topic: "modsim", q: "Which is NOT a typical reason to use simulation?", opts: ["Real experiments are too dangerous", "Real experiments are too expensive or slow", "To answer what-if questions", "Because you already have the exact answer"], a: 3, why: "Simulation is used when experiments are impractical or you want to explore scenarios." },
 { id: "q79", topic: "modsim", q: "A thermostat heating a room is an example of…", opts: ["a reinforcing loop", "a balancing loop", "random noise", "a stock without flows"], a: 1, why: "The system moves towards a goal temperature and counteracts deviations." },
 { id: "q80", topic: "modsim", q: "In system dynamics, a “stock” is…", opts: ["something that accumulates over time", "a rate of change", "a random variable", "a parameter that never changes"], a: 0, why: "Stocks (water, money, infected people) are changed by in- and outflows." },
 { id: "q81", topic: "ode", q: "dN/dt = r·N with r > 0 produces…", opts: ["linear growth", "exponential growth", "an S-curve", "oscillations"], a: 1, why: "The growth rate is proportional to N itself: a pure reinforcing loop." },
 { id: "q82", topic: "ode", q: "One Euler step: N = 50, dN/dt = 10, Δt = 0.5. New N?", opts: ["55", "60", "50.5", "45"], a: 0, why: "N + Δt·dN/dt = 50 + 0.5·10 = 55." },
 { id: "q83", topic: "ode", q: "Which Python function solves ODE systems numerically?", opts: ["np.mean", "scipy.integrate.solve_ivp", "pd.read_csv", "sklearn.fit"], a: 1, why: "solve_ivp integrates dy/dt = f(t, y) with adaptive Runge–Kutta methods by default." },
 { id: "q84", topic: "abm", q: "What distinguishes agent-based models from differential equation models?", opts: ["ABMs have no randomness", "ABMs model individuals with their own rules and interactions", "ABMs cannot show time", "ABMs only work for physics"], a: 1, why: "ODEs describe aggregated quantities; ABMs describe individuals and let the aggregate emerge." },
 { id: "q85", topic: "abm", q: "In the SIR model, what does R stand for?", opts: ["Random", "Recovered (or removed)", "Rate", "Risk"], a: 1, why: "Susceptible → Infected → Recovered/Removed." },
 { id: "q86", topic: "mcevo", q: "To estimate π with random points in the unit square, you count points with…", opts: ["x + y ≤ 1", "x² + y² ≤ 1", "x = y", "x·y ≤ 0.5"], a: 1, why: "Those points lie inside the quarter circle whose area is π/4." },
 { id: "q87", topic: "mcevo", q: "Which is a typical business use of Monte Carlo simulation?", opts: ["Spell checking", "Estimating the risk distribution of project costs", "Sorting a list", "Encrypting passwords"], a: 1, why: "Draw uncertain inputs many times and look at the distribution of outcomes." },
 { id: "q88", topic: "mcevo", q: "Which step of a genetic algorithm prefers better solutions?", opts: ["Mutation", "Selection", "Initialisation", "Randomisation"], a: 1, why: "Selection gives fitter individuals a higher chance to become parents." }
];

/* Boss questions combine concepts. */
const BOSS_EXTRA = [
 { id: "b1", topic: "unsup", q: "You receive customer behaviour data but no customer categories. You must automatically discover groups of similar customers. What kind of problem is this?", opts: ["Supervised → classification", "Unsupervised → clustering", "Supervised → regression", "Reinforcement learning"], a: 1, why: "No labels + grouping = clustering." },
 { id: "b2", topic: "supervised", q: "A bank has 5 years of loans labelled repaid / defaulted and wants to score new applicants. Which setup fits?", opts: ["Unsupervised anomaly detection", "Supervised binary classification", "Reinforcement learning", "Dimensionality reduction"], a: 1, why: "Known labels, two classes." },
 { id: "b3", topic: "bias", q: "The bank’s training data only contains applicants who were <i>approved</i> in the past. What problem hides here?", opts: ["Survivorship / selection bias", "Overshooting", "Frequency illusion", "Too few features"], a: 0, why: "Rejected applicants never got a label; the model never sees them." },
 { id: "b4", topic: "corr", q: "A model finds that users of the premium app churn less. Management wants to give everyone premium for free to reduce churn. The flaw?", opts: ["Premium is regression", "Correlation is read as causation; engaged users choose premium", "The model is too precise", "No flaw"], a: 1, why: "Engagement is a likely confounder." },
 { id: "b5", topic: "rl", q: "A warehouse robot should learn efficient routes by trial and error, getting points for fast deliveries. Which class?", opts: ["Supervised", "Unsupervised", "Reinforcement learning", "Semi-supervised"], a: 2, why: "Actions, states, rewards." },
 { id: "b6", topic: "accprec", q: "A temperature model is always 2 °C too warm but very consistent. What helps most?", opts: ["More randomness", "Correct the systematic offset (bias)", "Lower precision", "Nothing"], a: 1, why: "Precise but not accurate → fix the systematic error." },
 { id: "b7", topic: "metrics", q: "A fraud model flags 1 % of transactions. 90 % of flagged cases are real fraud, but it finds only 40 % of all fraud. Which statement fits?", opts: ["High recall, low precision", "High precision, low recall", "High accuracy means it is perfect", "It overfits"], a: 1, why: "90 % of alarms are correct (precision), but most fraud is missed (recall 40 %)." },
 { id: "b8", topic: "overfit", q: "Your team reports 98 % accuracy. You learn they normalised the full dataset and picked the best of 50 models on the test set. Your verdict?", opts: ["Great result", "The 98 % is optimistic: leakage and test-set tuning", "They should use accuracy only", "They need more epochs"], a: 1, why: "Preprocessing and model selection must not see the test data." },
 { id: "b9", topic: "ode", q: "A logistic model uses K = 1 000 customers. After 5 years the simulation shows 1 300 customers and then oscillates. Most likely cause?", opts: ["The market is larger", "Euler step size too large", "Negative growth rate", "Too many agents"], a: 1, why: "Logistic growth never overshoots K in reality; overshooting is a sign of too large time steps." },
 { id: "b10", topic: "abm", q: "An ABM of shoppers produces a different queue length in every run. How do you report the result?", opts: ["Take the first run", "Take the best run", "Run many times and report mean and spread", "Remove the randomness completely"], a: 2, why: "Stochastic models need many replications to give reliable statements." },
 { id: "b11", topic: "knn", q: "kNN works well on 2 features but gets worse when you add 200 more random features. Why?", opts: ["kNN cannot handle numbers", "Irrelevant dimensions dilute the distance (curse of dimensionality)", "k was too small", "The labels changed"], a: 1, why: "With many irrelevant features, all points look almost equally far apart." },
 { id: "b12", topic: "trees", q: "Which model would you choose if the bank must explain every credit decision to the customer?", opts: ["A deep neural network", "A shallow decision tree", "k-means", "Monte Carlo"], a: 1, why: "A small tree gives a readable rule for every decision." }
];

const FLASHCARDS = [
 { id: "f1", cat: "Machine Learning", topic: "supervised", front: "Supervised learning", back: "Learning from training data where the target / ground truth is known." },
 { id: "f2", cat: "Machine Learning", topic: "unsup", front: "Unsupervised learning", back: "Learning patterns or structure without known target labels." },
 { id: "f3", cat: "Machine Learning", topic: "rl", front: "Reinforcement learning", back: "An agent learns actions / strategies by maximising rewards." },
 { id: "f4", cat: "Definitions", topic: "supervised", front: "Classification", back: "Prediction of a discrete class / category." },
 { id: "f5", cat: "Definitions", topic: "supervised", front: "Regression", back: "Prediction of a continuous target variable." },
 { id: "f6", cat: "Definitions", topic: "unsup", front: "Clustering", back: "Identifying groups / structure in unlabelled data." },
 { id: "f7", cat: "Statistics", topic: "corr", front: "Correlation", back: "Two variables change or occur together." },
 { id: "f8", cat: "Statistics", topic: "corr", front: "Causality", back: "One variable has a causal (root-cause) relationship to another." },
 { id: "f9", cat: "Bias", topic: "bias", front: "Survivorship bias", back: "A bias caused by focusing only on observations that passed a selection process or “survived”." },
 { id: "f10", cat: "Bias", topic: "bias", front: "Availability bias", back: "Focusing on easily accessible data instead of a representative sample of the population." },
 { id: "f11", cat: "Bias", topic: "bias", front: "Frequency illusion", back: "Focusing on something because you just noticed it; you then see it everywhere." },
 { id: "f12", cat: "Statistics", topic: "accprec", front: "Accuracy", back: "How close predictions are to the true value (on average)." },
 { id: "f13", cat: "Statistics", topic: "accprec", front: "Precision (of predictions)", back: "How close repeated predictions are to each other (spread)." },
 { id: "f14", cat: "Definitions", topic: "ai", front: "Artificial Narrow Intelligence (ANI)", back: "AI that performs specific tasks. All current systems, including LLMs." },
 { id: "f15", cat: "Definitions", topic: "ai", front: "Artificial General Intelligence (AGI)", back: "Hypothetical AI with human-level ability across tasks; the “current push”." },
 { id: "f16", cat: "Algorithms", topic: "ai", front: "GOFAI", back: "“Good Old-Fashioned AI”: symbolic methods building on principles of logic." },
 { id: "f17", cat: "Algorithms", topic: "ai", front: "Evolutionary methods", back: "Mutation and selection to solve complex (optimisation) tasks." },
 { id: "f18", cat: "Algorithms", topic: "ai", front: "Swarm intelligence", back: "Intelligent behaviour of a crowd of individuals that each follow very simple rules." },
 { id: "f19", cat: "Machine Learning", topic: "mlbasics", front: "Inductive bias", back: "The model structure assumed upfront; ML then learns the parameters from data." },
 { id: "f20", cat: "Machine Learning", topic: "llm", front: "GPT", back: "Generative Pre-trained Transformer: predicts the next token from context using learned probabilities." },
 { id: "f21", cat: "Machine Learning", topic: "unsup", front: "Dimensionality reduction", back: "Reduce the number of variables per data point with minimal information loss." },
 { id: "f22", cat: "Machine Learning", topic: "unsup", front: "Anomaly detection", back: "Identify data points that are significantly “different”." },
 { id: "f23", cat: "Algorithms", topic: "gd", front: "Gradient descent update", back: "θ ← θ − η · ∇L(θ)   (step against the gradient; η = learning rate)" },
 { id: "f24", cat: "Algorithms", topic: "gd", front: "Learning rate too large", back: "Overshooting, oscillation, divergence." },
 { id: "f25", cat: "Statistics", topic: "linreg", front: "Residual", back: "Observed minus predicted value: eᵢ = yᵢ − ŷᵢ" },
 { id: "f26", cat: "Statistics", topic: "linreg", front: "Mean squared error (MSE)", back: "(1/n) · Σ (yᵢ − ŷᵢ)²" },
 { id: "f27", cat: "Algorithms", topic: "logreg", front: "Sigmoid", back: "σ(z) = 1 / (1 + e⁻ᶻ); maps any number to a probability in (0, 1)." },
 { id: "f28", cat: "Python", topic: "pandas", front: "Filter rows in pandas", back: "df[df[\"col\"] > value]" },
 { id: "f29", cat: "Python", topic: "pandas", front: "Count missing values", back: "df.isna().sum()" },
 { id: "f30", cat: "Python", topic: "tools", front: "Add a dependency with uv", back: "uv add <package>" },
 { id: "f31", cat: "Python", topic: "git", front: "Commit cycle", back: "git status → git add . → git commit -m \"msg\" → git push" },
 { id: "f32", cat: "Exam Questions", topic: "lifecycle", front: "Stages of the Team Data Science Process", back: "Business understanding → Data acquisition & understanding → Modeling → Deployment → Customer acceptance (with loops back)." },
 { id: "f33", cat: "Exam Questions", topic: "mlbasics", front: "Classical software vs. ML", back: "Classical: rules + input → output. ML: input + known output → learned rule set (model)." },
 { id: "f34", cat: "Exam Questions", topic: "llm", front: "Three reasons for LLM success", back: "Transformer architecture · back-propagation + gradient descent · GPU compute." },
 { id: "f35", cat: "ML methods", topic: "knn", front: "kNN: effect of k", back: "Small k → overfitting (follows noise). Large k → underfitting (too smooth). Odd k for 2 classes. Scale features!" },
 { id: "f36", cat: "ML methods", topic: "trees", front: "Gini impurity", back: "1 − Σ pₖ². 0 = pure node, 0.5 = 50/50 (two classes). Tree picks the split with the lowest weighted Gini." },
 { id: "f37", cat: "ML methods", topic: "trees", front: "Stop a tree from overfitting", back: "max_depth, min_samples_leaf, pruning – or use a Random Forest." },
 { id: "f38", cat: "ML methods", topic: "kmeans", front: "k-Means algorithm", back: "1) place k centres 2) assign points to nearest centre 3) move centres to mean 4) repeat until stable. Choose k with the elbow method." },
 { id: "f39", cat: "ML methods", topic: "nbayes", front: "Naive Bayes formula", back: "P(C | x) ∝ P(C) · Π P(xⱼ | C). “Naive”: features independent given the class." },
 { id: "f40", cat: "Evaluation", topic: "overfit", front: "Overfitting vs underfitting", back: "Overfitting: train good, test bad (too complex). Underfitting: both bad (too simple)." },
 { id: "f41", cat: "Evaluation", topic: "overfit", front: "train / validation / test", back: "Train: fit. Validation (or CV): tune hyperparameters. Test: final, untouched estimate." },
 { id: "f42", cat: "Evaluation", topic: "metrics", front: "Precision", back: "TP / (TP + FP) – when the model says yes, how often is it right? Important if false alarms are costly." },
 { id: "f43", cat: "Evaluation", topic: "metrics", front: "Recall", back: "TP / (TP + FN) – how many real positives were found? Important if misses are costly." },
 { id: "f44", cat: "Evaluation", topic: "metrics", front: "F1 score", back: "2 · P · R / (P + R), harmonic mean of precision and recall." },
 { id: "f45", cat: "Evaluation", topic: "metrics", front: "MAE · MSE · RMSE · R²", back: "MAE: mean |error|. MSE: mean error². RMSE: √MSE (unit of y). R²: share of variance explained (1 perfect, 0 = mean)." },
 { id: "f46", cat: "Evaluation", topic: "cv", front: "k-fold cross validation", back: "Split into k folds, train k times, each fold is test once, report mean ± std. cross_val_score(model, X, y, cv=5)" },
 { id: "f47", cat: "Simulation", topic: "modsim", front: "Reinforcing vs balancing loop", back: "Reinforcing: more → more (interest, virality). Balancing: moves toward a goal (thermostat, saturation)." },
 { id: "f48", cat: "Simulation", topic: "ode", front: "Logistic growth", back: "dN/dt = r·N·(1 − N/K). S-curve, fastest growth at N = K/2." },
 { id: "f49", cat: "Simulation", topic: "ode", front: "Euler method", back: "N(t+Δt) = N(t) + Δt · f(N(t)). Smaller Δt = more accurate. Check by halving Δt." },
 { id: "f50", cat: "Simulation", topic: "abm", front: "Agent-based model", back: "Individuals with simple local rules + environment + time steps. Global patterns emerge. Run many replications." },
 { id: "f51", cat: "Simulation", topic: "mcevo", front: "Monte Carlo", back: "Estimate by repeated random sampling. Error ∝ 1/√n." },
 { id: "f52", cat: "Simulation", topic: "mcevo", front: "Genetic algorithm", back: "Population → fitness → selection → crossover → mutation → next generation. No gradient needed." }
];

/* Python lab tasks. `test` is appended to user code when a real interpreter is available;
   it must print __OK__ on success. `rx` are static checks used when running isn't possible
   (NumPy/pandas are simulated). */
const PY_TASKS = {
  mean: { title: "Mean of a list", topic: "python", xp: 30,
    prompt: "Given <code>numbers = [2, 4, 6, 8]</code>, compute the mean and store it in <code>mean</code>. Print it.",
    starter: "numbers = [2, 4, 6, 8]\n\n# compute the mean\nmean = \n\nprint(mean)\n",
    hints: ["The mean is the total divided by how many values there are.", "Python has built-ins for both: sum() and len().", "mean = sum(numbers) / ..."],
    solution: "numbers = [2, 4, 6, 8]\nmean = sum(numbers) / len(numbers)\nprint(mean)\n",
    test: "assert abs(mean - 5.0) < 1e-9\nprint('__OK__')", rx: [/mean\s*=\s*sum\(\s*numbers\s*\)\s*\/\s*len\(\s*numbers\s*\)/], out: "5.0" },
  loop: { title: "Sum of squares with a loop", topic: "python", xp: 30,
    prompt: "Use a <code>for</code> loop to compute the sum of squares of <code>values = [1, 2, 3, 4]</code> into <code>total</code>.",
    starter: "values = [1, 2, 3, 4]\ntotal = 0\n\n# loop here\n\nprint(total)\n",
    hints: ["Visit each value once and add something to total.", "Inside the loop, add v * v (or v ** 2).", "for v in values:\n    total += ..."],
    solution: "values = [1, 2, 3, 4]\ntotal = 0\nfor v in values:\n    total += v ** 2\nprint(total)\n",
    test: "assert total == 30\nprint('__OK__')", rx: [/for\s+\w+\s+in\s+values/, /total\s*\+=/], out: "30" },
  dict: { title: "Count grades with a dictionary", topic: "python", xp: 30,
    prompt: "Count how often each grade occurs in <code>grades</code>. Store the result in a dictionary <code>counts</code>, e.g. <code>{1: 2, 2: 1, …}</code>.",
    starter: "grades = [1, 2, 1, 3, 5, 2, 1]\ncounts = {}\n\n# fill counts\n\nprint(counts)\n",
    hints: ["Loop over the grades; for each one, increase its counter.", "counts.get(g, 0) returns 0 if g isn’t a key yet.", "counts[g] = counts.get(g, 0) + 1"],
    solution: "grades = [1, 2, 1, 3, 5, 2, 1]\ncounts = {}\nfor g in grades:\n    counts[g] = counts.get(g, 0) + 1\nprint(counts)\n",
    test: "assert counts == {1: 3, 2: 2, 3: 1, 5: 1}\nprint('__OK__')", rx: [/for\s+\w+\s+in\s+grades/, /counts\[/], out: "{1: 3, 2: 2, 3: 1, 5: 1}" },
  func: { title: "A prediction function", topic: "python", xp: 30,
    prompt: "Write <code>predict(x, m, b)</code> that returns <code>m * x + b</code>. Then print <code>predict(4, 5.0, 50.0)</code>.",
    starter: "def predict(x, m, b):\n    # return the prediction\n    pass\n\nprint(predict(4, 5.0, 50.0))\n",
    hints: ["A function gives its result back with return.", "The formula of a line is m times x plus b.", "return m * x + b"],
    solution: "def predict(x, m, b):\n    return m * x + b\n\nprint(predict(4, 5.0, 50.0))\n",
    test: "assert predict(4, 5.0, 50.0) == 70.0 and predict(0, 2, 1) == 1\nprint('__OK__')", rx: [/def\s+predict\s*\(/, /return\s+m\s*\*\s*x\s*\+\s*b/], out: "70.0" },
  np: { title: "NumPy mean and std", topic: "pandas", xp: 30, simulated: true,
    prompt: "Import NumPy as <code>np</code>, convert <code>hours</code> to an array and print its mean and standard deviation.",
    starter: "hours = [2, 4, 5, 7, 9]\n\n# use numpy\n",
    hints: ["NumPy arrays have methods for statistics.", "np.array(...) creates the array; .mean() and .std() give the statistics.", "import numpy as np\narr = np.array(hours)\nprint(arr.mean(), ...)"],
    solution: "import numpy as np\nhours = [2, 4, 5, 7, 9]\narr = np.array(hours)\nprint(arr.mean(), arr.std())\n",
    rx: [/import\s+numpy\s+as\s+np/, /np\.array\(\s*hours\s*\)/, /\.mean\(\)/, /\.std\(\)/], out: "5.4 2.4166091947189146" },
  filter: { title: "Filter a DataFrame", topic: "pandas", xp: 30, simulated: true,
    prompt: "<code>df</code> has columns <code>hours</code> and <code>score</code>. Keep only students with more than 5 study hours in <code>busy</code> and print its mean score.",
    starter: "import pandas as pd\ndf = pd.read_csv(\"students.csv\")\n\nbusy = \n\n",
    hints: ["Build a True/False mask from a comparison on one column.", "df[\"hours\"] > 5 is the mask; put it inside df[ ... ].", "busy = df[df[\"hours\"] > 5]\nprint(busy[\"score\"]....)"],
    solution: "import pandas as pd\ndf = pd.read_csv(\"students.csv\")\nbusy = df[df[\"hours\"] > 5]\nprint(busy[\"score\"].mean())\n",
    rx: [/busy\s*=\s*df\[\s*df\[\s*["']hours["']\s*\]\s*>\s*5\s*\]/, /busy\[\s*["']score["']\s*\]\.mean\(\)/], out: "81.25" },
  missing: { title: "Find missing values", topic: "pandas", xp: 30, simulated: true,
    prompt: "Print how many values are missing in each column of <code>df</code>, then fill missing <code>attendance</code> with the column median.",
    starter: "import pandas as pd\ndf = pd.read_csv(\"students.csv\")\n\n",
    hints: ["pandas marks missing values as NaN; there is a method that tests for them.", "df.isna().sum() counts per column; fillna() replaces values.", "df[\"attendance\"] = df[\"attendance\"].fillna(df[\"attendance\"]....)"],
    solution: "import pandas as pd\ndf = pd.read_csv(\"students.csv\")\nprint(df.isna().sum())\ndf[\"attendance\"] = df[\"attendance\"].fillna(df[\"attendance\"].median())\n",
    rx: [/\.isna\(\)\.sum\(\)|\.isnull\(\)\.sum\(\)/, /fillna\(\s*df\[\s*["']attendance["']\s*\]\.median\(\)\s*\)/], out: "student          0\nhours            0\nattendance       2\nprevious_grade   0\nexam_score       1\ndtype: int64" },
  mse: { title: "Mean squared error", topic: "linreg", xp: 35,
    prompt: "Write <code>mse(y, y_hat)</code> for two lists of equal length and print <code>mse([3, 5, 7], [2, 5, 9])</code>.",
    starter: "def mse(y, y_hat):\n    # average of squared differences\n    pass\n\nprint(mse([3, 5, 7], [2, 5, 9]))\n",
    hints: ["Take each pair of values, square their difference, then average.", "zip(y, y_hat) walks both lists together.", "return sum((a - b) ** 2 for a, b in zip(y, y_hat)) / ..."],
    solution: "def mse(y, y_hat):\n    return sum((a - b) ** 2 for a, b in zip(y, y_hat)) / len(y)\n\nprint(mse([3, 5, 7], [2, 5, 9]))\n",
    test: "assert abs(mse([3,5,7],[2,5,9]) - 5/3) < 1e-9\nprint('__OK__')", rx: [/def\s+mse/, /\*\*\s*2/, /len\(/], out: "1.6666666666666667" },
  fit: { title: "Linear regression, closed form", topic: "linreg", xp: 40,
    prompt: "Compute slope <code>m</code> and intercept <code>b</code> of the least-squares line for <code>x</code> and <code>y</code> without libraries.<br><small>m = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)², b = ȳ − m·x̄</small>",
    starter: "x = [1, 2, 3, 4, 5]\ny = [52, 57, 61, 68, 72]\n\n# compute means, then m and b\n\nprint(round(m, 2), round(b, 2))\n",
    hints: ["Start with the two means.", "The numerator sums (xi - x_mean) * (yi - y_mean) over all pairs.", "x_mean = sum(x) / len(x)\nnum = sum((a - x_mean) * (c - y_mean) for a, c in zip(x, y))\nden = sum((a - x_mean) ** 2 for a in x)"],
    solution: "x = [1, 2, 3, 4, 5]\ny = [52, 57, 61, 68, 72]\nx_mean = sum(x) / len(x)\ny_mean = sum(y) / len(y)\nnum = sum((a - x_mean) * (c - y_mean) for a, c in zip(x, y))\nden = sum((a - x_mean) ** 2 for a in x)\nm = num / den\nb = y_mean - m * x_mean\nprint(round(m, 2), round(b, 2))\n",
    test: "assert abs(m - 5.1) < 1e-6 and abs(b - 46.7) < 1e-6\nprint('__OK__')", rx: [/m\s*=/, /b\s*=/, /sum\(/], out: "5.1 46.7" },
  gdstep: { title: "Gradient descent loop", topic: "gd", xp: 40,
    prompt: "Minimise L(w) = (w − 3)² with gradient descent. Start at <code>w = 0</code>, learning rate <code>0.1</code>, 50 steps. The gradient is <code>2 * (w - 3)</code>.",
    starter: "w = 0.0\nlr = 0.1\n\nfor step in range(50):\n    # update w\n    pass\n\nprint(round(w, 4))\n",
    hints: ["Each step moves w a little against the slope.", "Compute grad = 2 * (w - 3) inside the loop.", "w = w - lr * grad"],
    solution: "w = 0.0\nlr = 0.1\nfor step in range(50):\n    grad = 2 * (w - 3)\n    w = w - lr * grad\nprint(round(w, 4))\n",
    test: "assert abs(w - 3) < 1e-3\nprint('__OK__')", rx: [/w\s*=\s*w\s*-\s*lr\s*\*|w\s*-=\s*lr\s*\*/, /2\s*\*\s*\(\s*w\s*-\s*3\s*\)/], out: "3.0" }
};

const ACHIEVEMENTS = [
 { id: "first", name: "First Steps", desc: "Complete your first lesson", icon: "▲" },
 { id: "pyrookie", name: "Python Rookie", desc: "Solve your first Python exercise", icon: "λ" },
 { id: "perfect", name: "10/10", desc: "Finish a quiz without a mistake", icon: "✓" },
 { id: "nolabels", name: "No Labels Needed", desc: "Master Unsupervised Learning (90%)", icon: "⁘" },
 { id: "gradient", name: "Gradient Rider", desc: "Master Gradient Descent (90%)", icon: "↘" },
 { id: "biashunter", name: "Bias Hunter", desc: "Complete the airplane challenge, the bias lesson and the Bias Boss", icon: "✈" },
 { id: "boss", name: "Boss Slayer", desc: "Pass a boss challenge", icon: "♛" },
 { id: "codewarrior", name: "Code Warrior", desc: "Solve 25 coding exercises", icon: "⌘" },
 { id: "cards50", name: "Card Shark", desc: "Review 50 flashcards", icon: "▦" },
 { id: "night", name: "Night Owl", desc: "Study after midnight", icon: "☾" },
 { id: "streak7", name: "7 Day Streak", desc: "Study seven days in a row", icon: "▰" },
 { id: "datasci", name: "Data Scientist", desc: "Complete every available Data Science lesson and boss", icon: "◆" }
];

const RESOURCES = {
  course: [
    { title: "Data Meets Engineering — Python and IT Fundamentals", url: "https://pages.itplus.fh-joanneum.at/n49f55/dme/", note: "Tips for setting up a Python development environment for data science and ML" },
    { title: "Course repository (WS 26/27)", url: "https://gitlab.itplus.fh-joanneum.at/study/ima/ima25w/courses/ef-dasc/course-ws-2627", note: "All code from the exercises and the data you need" },
    { title: "Personal GitLab group", url: "https://gitlab.itplus.fh-joanneum.at/study/ima/ima25w/students/", note: "…/students/<fhj-username> — create your own repo here", personal: true },
    { title: "Examiner (assessment environment)", url: "https://examiner.itplus.fh-joanneum.at/", note: "Sites reachable during the knowledge assessment" }
  ],
  git: [
    { title: "OpenSSH setup and configuration", url: "https://pages.itplus.fh-joanneum.at/n49f55/dme/linux/remote/#openssh" },
    { title: "Git", url: "https://pages.itplus.fh-joanneum.at/n49f55/dme/toolchain/git/" }
  ],
  python: [
    { title: "uv and Python project management", url: "https://pages.itplus.fh-joanneum.at/n49f55/dme/python/uv/" }
  ],
  books: [
    { title: "Python for Data Analysis (3rd ed.)", author: "Wes McKinney, 2022, O’Reilly", url: "https://wesmckinney.com/book/", tag: "Recommended" },
    { title: "An Introduction to Statistical Learning with Applications in Python", author: "James et al., 2023, Springer", url: "https://www.statlearning.com/", tag: "Recommended" },
    { title: "The Data Science Manual", author: "Skiena, 2017, Springer", tag: "Supplementary" },
    { title: "Grundkurs Künstliche Intelligenz (4. Aufl.)", author: "Ertel, 2016, Springer-Vieweg", tag: "Supplementary" },
    { title: "Pattern Recognition and Machine Learning", author: "Bishop, 2006, Springer", tag: "Supplementary" },
    { title: "Systeme, Dynamik, Simulation", author: "Bossel, 2004, BoD", tag: "Part 2" },
    { title: "Introduction to the Modeling and Analysis of Complex Systems", author: "Sayama, 2015, Open SUNY Textbooks (free)", url: "https://open.umn.edu/opentextbooks/textbooks/233", tag: "Part 2" }
  ],
  extra: [
    { title: "scikit-learn: Model evaluation (metrics)", url: "https://scikit-learn.org/stable/modules/model_evaluation.html", note: "Precision, recall, F1, ROC, regression metrics" },
    { title: "scikit-learn: Cross-validation", url: "https://scikit-learn.org/stable/modules/cross_validation.html", note: "train_test_split, cross_val_score, GridSearchCV" },
    { title: "scikit-learn: Nearest neighbors, trees, naive Bayes, clustering", url: "https://scikit-learn.org/stable/supervised_learning.html", note: "Official user guide with examples" },
    { title: "SciPy solve_ivp", url: "https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.solve_ivp.html", note: "Solve differential equations in Python" },
    { title: "Mesa – agent-based modeling in Python", url: "https://mesa.readthedocs.io/", note: "Framework for ABM, used in many courses" },
    { title: "NetLogo Models Library", url: "https://ccl.northwestern.edu/netlogo/models/", note: "Classic ABM examples (Virus, Wolf Sheep Predation, Segregation)" }
  ],
  lectures: [
    { title: "Teil 1 — Grundlagen und Maschinelles Lernen", note: "Goals, Python/Linux first, knowledge assessment, literature" },
    { title: "Einheit 1 — Einführung", note: "Course structure, organisation, grading (60% Hammer / 40% Granigg)" },
    { title: "Fundamentals of data science, ML and Python", note: "Venn diagrams, ethics, AI vs ML, LLMs, ML classes, bias, lifecycle, Python" },
    { title: "Syllabus IMA25 — EF-DASC", note: "Semester 3, 2.5 ECTS, not exam-immanent, AI tools allowed except in assessments" }
  ]
};

/* Default grading scheme from the syllabus (first attempt). Editable in the app. */
const ASSESSMENT = {
  parts: [
    { id: "hw", label: "Part 1 · Homework (3 assignments)", max: 15 },
    { id: "ka", label: "Part 1 · Knowledge assessment (10 quiz + 35 practical)", max: 45 },
    { id: "p2m", label: "Part 2 · Participation", max: 10 },
    { id: "p2k", label: "Part 2 · Knowledge assessment", max: 30 }
  ],
  scale: [ [91, "1 · Sehr gut"], [81, "2 · Gut"], [71, "3 · Befriedigend"], [61, "4 · Genügend"], [0, "5 · Nicht genügend"] ]
};

window.COURSE_DEFS = window.COURSE_DEFS || [];
window.COURSE_DEFS.push({ id: "dasc", name: "Einführung in Data Science", short: "EF-DASC", title: "Data Science", semester: 3, ects: 2.5,
  color: "#8BD126", icon: "◆", lang: "en", lecturers: COURSES[0].lecturers, description: COURSES[0].description,
  topics: TOPICS, worlds: WORLDS, questions: QUESTIONS, bossExtra: BOSS_EXTRA, flashcards: FLASHCARDS, pyTasks: PY_TASKS,
  resources: RESOURCES, assessment: ASSESSMENT, exam: "dasc",
  events: [
    { id: "dasc-ka", title: "Data Science · Knowledge Assessment (Teil 1)", type: "exam", date: null, note: "Termin laut Moodle eintragen. Debian-Image, GitLab, keine Smart Devices." },
    { id: "dasc-hw", title: "Data Science · 3 Hausübungen (je 5 Pkt.)", type: "deadline", date: null, note: "Abgabe-Modalitäten werden in der LV bekanntgegeben." }
  ] });
window.GLOBAL_ACH = ACHIEVEMENTS;
})();
