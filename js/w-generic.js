/* StudyOS v2: generic + Kommunikation / English / BWL widgets */
(function () {
const { $, $$, esc, shuffle, clamp } = App;
const W = App.W = App.W || {};
App.mountWidgets = (root, lesson) => $$("[data-widget]", root).forEach(el => { const f = W[el.dataset.widget]; if (f) { try { f(el, el._block || {}, lesson); } catch (e) { console.error(e); el.innerHTML = `<p class="muted">Widget konnte nicht geladen werden.</p>`; } } });
App.mountWidget = (el, name, block = {}, lesson = null) => { el.dataset.widget = name; W[name] && W[name](el, block, lesson); };
const S = () => App.S();
const head = (title, tag = "Interaktiv", right = "") => `<div class="w-head"><div class="w-title"><span class="tag">${tag}</span><h3>${title}</h3></div>${right}</div>`;
App.whead = head;
const done = key => { const s = S(); if (s.widgets[key]) return false; s.widgets[key] = true; App.save(); return true; };
App.wdone = done;
const topicOf = (b, l) => b.topic || (l && l.topic);
const fmt = (v, d = 2) => (isFinite(v) ? v : NaN).toLocaleString("de-AT", { minimumFractionDigits: d, maximumFractionDigits: d });
App.fmtNum = fmt;
const parseNum = s => { if (s == null) return NaN; s = String(s).trim().replace(/\s|€|%/g, ""); if (/,\d{1,2}$/.test(s) || (s.includes(",") && !s.includes("."))) s = s.replace(/\./g, "").replace(",", "."); else s = s.replace(/,/g, ""); return parseFloat(s); };
App.parseNum = parseNum;

/* ---------- sorter: classify items into categories ---------- */
W.sorter = (el, b, l) => {
  const items = shuffle(b.items.map((it, i) => Object.assign({ i }, it))); const pick = {}; let checked = false;
  const draw = () => {
    const nDone = Object.keys(pick).length, score = items.filter(it => pick[it.i] === it.a).length;
    el.innerHTML = `<div class="w">${head(esc(b.title || "Zuordnen"), "Zuordnen", `<small class="muted tab">${checked ? score + " / " + items.length + " richtig" : nDone + " / " + items.length}</small>`)}
      ${b.intro ? `<p class="muted">${b.intro}</p>` : ""}
      <div class="sort-items">${items.map(it => { const p = pick[it.i]; const cls = checked ? (p === it.a ? "ok" : "no") : "";
        return `<div class="sort-row ${cls}"><div class="sr-t">${esc(it.t)}</div><div class="sr-c">${b.cats.map(c => { let k = ""; if (checked) { if (c.k === it.a) k = "right"; else if (c.k === p) k = "wrong"; } else if (p === c.k) k = "pick"; return `<button data-it="${it.i}" data-c="${c.k}" class="${k}" ${checked ? "disabled" : ""}>${esc(c.label)}</button>`; }).join("")}</div>${checked && it.why ? `<div class="sr-why">${esc(it.why)}</div>` : ""}</div>`; }).join("")}</div>
      <div class="row">${checked ? `<button class="btn sm" id="so-re">Neu mischen</button>` : `<button class="btn pri sm" id="so-chk" ${nDone < items.length ? "disabled" : ""}>Prüfen</button><small class="muted">${nDone < items.length ? "Ordne alle Einträge zu." : ""}</small>`}</div></div>`;
    const c = $("#so-chk", el); if (c) c.onclick = () => { checked = true; const sc = items.filter(it => pick[it.i] === it.a).length; App.rec(topicOf(b, l), sc / items.length); if (sc === items.length && done("sorter-" + (b.title || "") + (l ? l.id : ""))) App.addXP(10, "sort", c); draw(); };
    const r = $("#so-re", el); if (r) r.onclick = () => W.sorter(el, b, l);
  };
  el.onclick = e => { const x = e.target.closest("[data-it]"); if (!x || checked) return; pick[x.dataset.it] = x.dataset.c; draw(); };
  draw();
};

/* ---------- pairs: match left to right ---------- */
W.pairs = (el, b, l) => {
  const P = b.pairs; const left = shuffle(P.map((_, i) => i)), right = shuffle(P.map((_, i) => i));
  let sel = null; const matched = new Set(), missed = new Set(); let first = 0;
  const draw = () => {
    const fin = matched.size === P.length;
    el.innerHTML = `<div class="w">${head(esc(b.title || "Zuordnen"), "Matching", `<small class="muted tab">${matched.size}/${P.length}</small>`)}
      <div class="grid g2"><div class="col" style="gap:8px">${left.map(i => `<button class="opt ${sel === i ? "sel" : ""} ${matched.has(i) ? "ok" : ""}" data-l="${i}" ${matched.has(i) ? "disabled" : ""}><span>${esc(P[i][0])}</span></button>`).join("")}</div>
      <div class="col" style="gap:8px">${right.map(i => `<button class="opt ${matched.has(i) ? "ok" : ""}" data-r="${i}" ${matched.has(i) ? "disabled" : ""}><span>${esc(P[i][1])}</span></button>`).join("")}</div></div>
      ${fin ? `<div class="why"><b>${first} von ${P.length} beim ersten Versuch.</b></div><div><button class="btn sm" id="pr-re">Nochmal</button></div>` : `<small class="muted">Links wählen, dann rechts die Entsprechung.</small>`}</div>`;
    const re = $("#pr-re", el); if (re) re.onclick = () => W.pairs(el, b, l);
  };
  el.onclick = e => {
    const lb = e.target.closest("[data-l]"), rb = e.target.closest("[data-r]");
    if (lb) { sel = +lb.dataset.l; draw(); return; }
    if (rb && sel !== null) { const r = +rb.dataset.r; if (r === sel) { if (!missed.has(sel)) first++; App.rec(topicOf(b, l), missed.has(sel) ? 0.5 : 1); matched.add(sel); sel = null; draw(); if (matched.size === P.length && done("pairs-" + (b.title || "") + (l ? l.id : ""))) App.addXP(10, "pairs", el); } else { missed.add(sel); App.rec(topicOf(b, l), 0); rb.classList.add("no"); setTimeout(() => rb.classList.remove("no"), 450); } }
  };
  draw();
};

/* ---------- gap fill ---------- */
W.gapfill = (el, b, l) => {
  const val = {}; let checked = false;
  const draw = () => {
    el.innerHTML = `<div class="w">${head(esc(b.title || "Lückentext"), "Lücken")}<div>${b.items.map((it, i) => { const ok = checked && it.a.some(a => (val[i] || "").trim().toLowerCase() === a.toLowerCase()); const parts = it.s.split("___");
      return `<div class="gap-row">${esc(parts[0])}<input type="text" id="gap-${i}" value="${esc(val[i] || "")}" class="${checked ? (ok ? "ok" : "no") : ""}" ${checked ? "disabled" : ""} aria-label="Lücke ${i + 1}" autocapitalize="off">${esc(parts[1] || "")}${checked && !ok ? `<small class="muted">→ ${esc(it.a[0])}</small>` : !checked ? `<small class="faint">(${esc(it.hint || "")})</small>` : ""}</div>`; }).join("")}</div>
      <div class="row">${checked ? `<button class="btn sm" id="gf-re">Nochmal</button>` : `<button class="btn pri sm" id="gf-chk">Prüfen</button>`}</div></div>`;
    $$("input", el).forEach(inp => inp.oninput = () => { val[inp.id.split("-")[1]] = inp.value; });
    const c = $("#gf-chk", el); if (c) c.onclick = () => { checked = true; const sc = b.items.filter((it, i) => it.a.some(a => (val[i] || "").trim().toLowerCase() === a.toLowerCase())).length; App.rec(topicOf(b, l), sc / b.items.length); if (sc === b.items.length && done("gap-" + (l ? l.id : ""))) App.addXP(10, "gap", c); draw(); };
    const r = $("#gf-re", el); if (r) r.onclick = () => { checked = false; Object.keys(val).forEach(k => delete val[k]); draw(); };
  };
  draw();
};

/* ---------- chain (Konrad Lorenz) ---------- */
W.chain = (el, b) => {
  let n = 0;
  const draw = () => { el.innerHTML = `<div class="w">${head("Die Kommunikationskette", "Visuell")}<div class="chain">${b.steps.map((s, i) => `${i ? '<span class="farrow">→</span>' : ""}<button data-i="${i}" class="${i <= n ? "on" : ""}">${esc(s)}</button>`).join("")}</div><p class="muted" style="font-size:14px">${esc(b.note)}</p><small class="faint">Tippe auf eine Station: Bis wohin kommt eine Botschaft, die du gestern in einer Gruppenarbeit gesagt hast?</small></div>`; };
  el.onclick = e => { const x = e.target.closest("[data-i]"); if (x) { n = +x.dataset.i; draw(); } };
  draw();
};

/* ---------- Schulz von Thun: four ears ---------- */
W.fourears = (el, b) => {
  const SIDES = [["s", "Sachinhalt", "#4C9EFF", "Worüber ich informiere"], ["o", "Selbstkundgabe", "#8BD126", "Was ich von mir zeige"], ["b", "Beziehung", "#EAB308", "Was ich von dir halte"], ["a", "Appell", "#F0616D", "Was ich bei dir erreichen will"]];
  const CASES = [
    { s: "Vater zum erwachsenen Sohn: „IT-Studierende sollten mehr Praktika machen.“", d: { s: "Praktika sind für IT-Studierende sinnvoll.", o: "Ich mache mir Sorgen um deine Zukunft.", b: "Ich glaube, du tust zu wenig.", a: "Such dir ein Praktikum!" } },
    { s: "Vortragende zu einem Studierenden nach seiner Frage: „Können Sie mir jetzt folgen?“", d: { s: "Frage nach dem Verständnis.", o: "Ich will sichergehen, dass ich gut erkläre.", b: "Ich zweifle, ob Sie mitkommen.", a: "Sagen Sie mir, ob es klar ist." } },
    { s: "Mann zu Frau beim ersten Date an ihrer Wohnungstür: „Deine Augen sind wirklich schön.“", d: { s: "Deine Augen sind schön.", o: "Ich bin verliebt / nervös.", b: "Ich mag dich.", a: "Bitte mich hinein / Küss mich." } },
    { s: "Politikerin zu arbeitsloser Person: „Arbeitslose Menschen bekommen viel zu viel Geld vom Staat.“", d: { s: "Behauptung über die Höhe von Leistungen.", o: "Ich finde das System ungerecht.", b: "Ich halte dich für einen Profiteur.", a: "Such dir einen Job!" } }
  ];
  let ci = 0; const shown = new Set();
  const draw = () => { const c = CASES[ci];
    el.innerHTML = `<div class="w">${head("Vier Schnäbel, vier Ohren", "Explorer", `<small class="muted">Situation ${ci + 1}/${CASES.length}</small>`)}
      <div class="card" style="background:var(--bg)"><p>${esc(c.s)}</p></div>
      <div class="grid g2">${SIDES.map(([k, n, col, d]) => `<button class="ear" data-k="${k}" style="border-color:${col};cursor:pointer;text-align:left;color:inherit"><b style="color:${col}">${n}</b><small class="muted">${d}</small>${shown.has(k) ? `<div>${esc(c.d[k])}</div>` : `<small class="faint">Tippen, um eine mögliche Deutung zu sehen. Überleg zuerst selbst.</small>`}</button>`).join("")}</div>
      <div class="row"><button class="btn sm" id="fe-prev" ${ci === 0 ? "disabled" : ""}>←</button><button class="btn sm" id="fe-next" ${ci === CASES.length - 1 ? "disabled" : ""}>Nächste Situation →</button></div>
      <small class="muted">Aus dem Skript (S. 19). Die Deutungen sind Vorschläge; im Unterricht zählt eure Begründung.</small></div>`;
    $("#fe-prev", el).onclick = () => { ci--; shown.clear(); draw(); }; $("#fe-next", el).onclick = () => { ci++; shown.clear(); draw(); if (ci === CASES.length - 1 && done("fourears")) App.addXP(10, "ears", el); };
  };
  el.onclick = e => { const x = e.target.closest("[data-k]"); if (x) { shown.add(x.dataset.k); draw(); } };
  draw();
};

/* ---------- Watzlawick axioms ---------- */
W.axioms = el => {
  const A = [["Man kann nicht nicht kommunizieren.", "Auch Schweigen und Nichthandeln haben Mitteilungscharakter. Beispiel: Die Frau im Wartezimmer, die auf den Boden starrt, teilt mit, dass sie keinen Kontakt möchte."],
    ["Jede Kommunikation hat einen Inhalts- und einen Beziehungsaspekt, wobei letzterer den ersten bestimmt.", "Inhalt: Daten und Fakten. Beziehung: wie der Inhalt aufzufassen ist (Mimik, Gestik, Tonfall). Wird ein Beziehungskonflikt auf der Inhaltsebene ausgetragen, entsteht gestörte Kommunikation."],
    ["Kommunikation ist immer Ursache und Wirkung.", "Kommunikation ist nicht in Kausalketten auflösbar; wer „angefangen“ hat, wird subjektiv festgelegt (Interpunktion). Beispiel: Johannes und die Austauschstudentin; Nörgeln ↔ Zurückziehen als Teufelskreis."],
    ["Menschliche Kommunikation bedient sich analoger und digitaler Modalitäten.", "Digital: Worte, logisch, Inhalt. Analog: Mimik, Gestik, Beziehung. Widersprechen sie sich, entsteht eine Doppelbindung (double bind), etwa die Mutter, die verbal Liebe fordert, aber bei Umarmungen erstarrt."],
    ["Kommunikationsabläufe sind symmetrisch oder komplementär.", "Symmetrisch: Streben nach Gleichheit. Komplementär: Unterschiedlichkeit, oft Über-/Unterordnung. Störung: symmetrische Eskalation (gegenseitiges Ausstechen) oder paradoxe Aufforderungen (Pullover-Beispiel)."]];
  let open = null;
  const draw = () => { el.innerHTML = `<div class="w">${head("Die fünf Axiome", "Karten")}<div class="col" style="gap:8px">${A.map((a, i) => `<button class="opt ${open === i ? "sel" : ""}" data-i="${i}" style="flex-direction:column;gap:6px"><div class="row" style="gap:10px;flex-wrap:nowrap"><span class="k" style="font-size:14px;color:var(--warn)">${i + 1}</span><b>${esc(a[0])}</b></div>${open === i ? `<div class="muted" style="font-size:14px">${esc(a[1])}</div>` : ""}</button>`).join("")}</div></div>`; };
  el.onclick = e => { const x = e.target.closest("[data-i]"); if (x) { open = open === +x.dataset.i ? null : +x.dataset.i; draw(); } };
  draw();
};

/* ---------- Bedürfnis-Rätsel (Skript S. 38) ---------- */
W.riddle = (el, b, l) => {
  const R = [["G", "Mir ist wichtig, dass ich mich auf Zusagen verlassen kann.", 1], ["B", "Ich möchte mich erst einen Monat lang gründlich einarbeiten.", 0], ["E", "Frau Kunz liegt viel an Pünktlichkeit.", 1], ["P", "Verstehe mich bitte richtig.", 0], ["S", "Kinder brauchen Geborgenheit.", 1], ["I", "Ich habe kein Interesse daran, Überstunden zu machen.", 0], ["C", "Ich möchte wahrgenommen werden.", 1], ["O", "Sie braucht einen zuverlässigen Freund.", 0], ["H", "Hans legt großen Wert auf Sicherheit.", 1], ["F", "Mir ist wichtig, dass wir im Winter gemeinsam zum Skifahren gehen.", 0], ["G", "Die Firma legt Wert darauf, dass du dich regelmäßig weiterbildest.", 0], ["E", "Die Einhaltung von Terminen ist besonders wichtig für unsere Projektleiterin.", 1], ["A", "Es ist mir ein Anliegen, nicht unachtsam zu sein.", 0], ["N", "Zugehörigkeit liegt mir am Herzen.", 1], ["K", "Du möchtest ernst genommen werden?", 1]];
  const sel = new Set(); let checked = false;
  const draw = () => { const word = R.map((r, i) => sel.has(i) ? r[0] : "").join("");
    el.innerHTML = `<div class="w">${head("Bedürfnis-Rätsel", "Rätsel", `<span class="chip tab mono">${word || "…"}</span>`)}<p class="muted">Markiere die Sätze mit <b>echten Bedürfnissen</b>: positiv, frei von Zeit und Ort, ohne dass eine bestimmte Person etwas tut. Die Buchstaben ergeben ein Lösungswort.</p>
      <div class="col" style="gap:6px">${R.map((r, i) => `<button class="opt ${sel.has(i) ? "sel" : ""} ${checked ? (!!r[2] === sel.has(i) ? "ok" : "no") : ""}" data-i="${i}" ${checked ? "disabled" : ""}><span class="k">${i + 1}</span><span><b class="mono">(${r[0]})</b> ${esc(r[1])}</span></button>`).join("")}</div>
      <div class="row">${checked ? `<div class="why ${word === "GESCHENK" ? "" : "bad"}"><b>${word === "GESCHENK" ? "Lösungswort: GESCHENK" : "Das Lösungswort ist GESCHENK."}</b><div>Nicht-Bedürfnisse enthalten eine Zeitangabe (Monat, Winter), eine Person, die etwas tun soll (Freund, Firma, „verstehe mich“) oder sind negativ formuliert (kein Interesse, nicht unachtsam).</div></div>` : `<button class="btn pri sm" id="rd-chk">Lösung prüfen</button>`}</div></div>`;
    const c = $("#rd-chk", el); if (c) c.onclick = () => { checked = true; const sc = R.filter((r, i) => !!r[2] === sel.has(i)).length; App.rec(topicOf(b, l), sc / R.length); if (sc === R.length && done("riddle")) App.addXP(15, "riddle", c); draw(); };
  };
  el.onclick = e => { const x = e.target.closest("[data-i]"); if (!x || checked) return; const i = +x.dataset.i; sel.has(i) ? sel.delete(i) : sel.add(i); draw(); };
  draw();
};

/* ---------- GFK 4-step trainer (heuristic, no AI) ---------- */
const EVAL_WORDS = ["immer", "nie", "niemals", "ständig", "schon wieder", "total", "völlig", "zu viel", "zu wenig", "faul", "unzuverlässig", "aggressiv", "respektlos", "schlampig", "unfähig", "dumm", "blöd", "egoistisch", "rücksichtslos", "grundlos", "furchtbar", "unmöglich", "wieder mal"];
const PSEUDO = ["ignoriert", "übergangen", "ausgenutzt", "benutzt", "im stich gelassen", "manipuliert", "angegriffen", "missverstanden", "abgelehnt", "betrogen", "bevormundet", "unter druck gesetzt", "nicht ernst genommen", "übersehen", "provoziert", "verraten", "als ob", "wie ", "dass ", "unwichtig", "unfähig"];
const FEEL = ["froh", "traurig", "enttäuscht", "verärgert", "ärgerlich", "wütend", "frustriert", "besorgt", "ängstlich", "angespannt", "gestresst", "erleichtert", "dankbar", "glücklich", "unsicher", "nervös", "müde", "erschöpft", "genervt", "irritiert", "verwirrt", "ungeduldig", "hilflos", "einsam", "zufrieden", "neugierig", "gelassen", "ruhig", "überfordert", "bedrückt", "sauer", "unruhig", "verletzt", "zuversichtlich", "berührt", "begeistert", "unwohl", "unzufrieden", "sorgenvoll", "entmutigt", "mutlos", "motiviert", "erfreut"];
const NEEDS = ["verlässlichkeit", "respekt", "anerkennung", "wertschätzung", "klarheit", "ruhe", "unterstützung", "sicherheit", "vertrauen", "kontakt", "aufmerksamkeit", "zusammenarbeit", "ordnung", "struktur", "transparenz", "effektivität", "gehört werden", "gesehen werden", "verständnis", "autonomie", "freiheit", "zugehörigkeit", "gemeinschaft", "fairness", "gerechtigkeit", "entspannung", "erholung", "kompetenz", "orientierung", "planbarkeit", "mitsprache", "ehrlichkeit", "rücksicht", "nähe", "harmonie", "effizienz", "qualität", "sinn", "lernen", "wachstum", "information", "austausch", "kooperation", "leichtigkeit", "spaß", "freude", "privatsphäre", "ernst genommen", "gleichwertigkeit", "balance", "zuverlässigkeit", "pünktlichkeit", "entlastung"];
W.gfk4 = (el, b, l) => {
  const SC = [
    { s: "Ein Teammitglied pusht wiederholt Code ohne Tests ins Hauptrepository, was zu Fehlern führt.", ex: ["Diese Woche wurden drei Commits von dir ohne Tests in main gemergt, danach schlug der Build zweimal fehl.", "besorgt und frustriert", "Verlässlichkeit und Qualität", "Bist du bereit, ab heute vor jedem Merge die Tests lokal laufen zu lassen, und wollen wir morgen 15 Minuten die Pipeline gemeinsam anschauen?"] },
    { s: "Softwareentwickler Peter hat die letzten drei Projektberichte jeweils drei Tage nach der Deadline eingereicht.", ex: ["Die letzten drei Berichte kamen jeweils drei Tage nach dem vereinbarten Termin.", "angespannt", "Planbarkeit und Verlässlichkeit", "Kannst du mir bis Freitag sagen, was dich beim Bericht aufhält, und würdest du mit mir einen realistischen Termin für den nächsten vereinbaren?"] },
    { s: "Nach dem letzten Update der Finanzsoftware unter Marias Leitung gab es erhebliche Fehler und Beschwerden.", ex: ["Seit dem Update am Montag sind 14 Kundenbeschwerden zu Buchungsfehlern eingegangen.", "beunruhigt", "Qualität und Vertrauen der Kund:innen", "Magst du mir heute Nachmittag zeigen, wie das Update getestet wurde, damit wir gemeinsam einen Plan für einen Hotfix machen?"] },
    { s: "In den letzten Teammeetings verstanden mehrere Teammitglieder ihre Aufgaben nicht, es kam zu Doppelarbeit.", ex: ["In den letzten zwei Meetings haben drei Personen an derselben Aufgabe gearbeitet.", "verwirrt und etwas frustriert", "Klarheit und effektive Zusammenarbeit", "Wärt ihr einverstanden, dass wir am Ende jedes Meetings die Aufgaben mit Namen im Board eintragen und kurz wiederholen?"] },
    { s: "Eigene Situation", own: true }
  ];
  let si = 0; const val = ["", "", "", ""]; let fb = null, showEx = false;
  const check = () => {
    const [o, f, n, r] = val.map(v => v.toLowerCase()); const out = [];
    const ev = EVAL_WORDS.filter(w => o.includes(w)); out.push(o.length < 10 ? ["warn", "Beobachtung: noch zu kurz. Was würde eine Kamera aufzeichnen?"] : ev.length ? ["warn", "Beobachtung enthält Bewertungswörter: „" + ev.join("“, „") + "“. Beschreibe nur, was man sehen oder hören kann."] : /\d|montag|dienstag|mittwoch|donnerstag|freitag|gestern|heute|woche|uhr/.test(o) ? ["ok", "Beobachtung: konkret, mit Zeit- oder Mengenangabe. Gut."] : ["info", "Beobachtung: keine Bewertungswörter gefunden. Tipp: Zeit, Anzahl oder Ort machen sie noch überprüfbarer."]);
    const ps = PSEUDO.filter(w => f.includes(w)), fe = FEEL.filter(w => f.includes(w)); out.push(ps.length ? ["warn", "Gefühl: „" + ps[0].trim() + "“ klingt nach Pseudogefühl (beschreibt, was andere tun oder ein Gedanke). Welches Gefühl steckt dahinter?"] : fe.length ? ["ok", "Gefühl: „" + fe.join(", ") + "“ ist ein echtes Gefühl."] : f.length < 3 ? ["warn", "Gefühl fehlt noch."] : ["info", "Gefühl: nicht in der Liste aus dem Skript (S. 31). Prüfe, ob es wirklich ein Gefühl ist."]);
    const ne = NEEDS.filter(w => n.includes(w)); out.push(/\b(du|dich|dir|er|sie|peter|maria)\b/.test(n) ? ["warn", "Bedürfnis nennt eine Person. Bedürfnisse sind unabhängig davon, wer sie erfüllt."] : /(montag|dienstag|mittwoch|donnerstag|freitag|morgen|heute|uhr|woche)/.test(n) ? ["warn", "Bedürfnis enthält Zeitangaben – das ist eher eine Strategie."] : ne.length ? ["ok", "Bedürfnis: „" + ne.join(", ") + "“."] : n.length < 3 ? ["warn", "Bedürfnis fehlt noch."] : ["info", "Bedürfnis nicht in der Liste (S. 33–34). Ist es abstrakt genug?"]);
    out.push(r.length < 10 ? ["warn", "Bitte fehlt noch oder ist zu kurz."] : /(nicht mehr|hör auf|sei doch|sei nicht|endlich|mehr mühe)/.test(r) ? ["warn", "Bitte ist negativ oder vage formuliert. Sag, was du willst, nicht was du nicht willst."] : /\?$/.test(r.trim()) && /(bist du bereit|kannst du|könntest du|würdest du|magst du|wärst du|wollen wir|wärt ihr|können wir)/.test(r) ? ["ok", "Bitte: konkret gefragt, die andere Person kann Ja oder Nein sagen."] : ["info", "Bitte: formuliere sie als Frage mit konkreter Handlung (z. B. „Bist du bereit, …?“)."]);
    return out;
  };
  const draw = () => { const sc = SC[si];
    el.innerHTML = `<div class="w">${head("4-Schritte-Trainer", "Üben")}
      <div class="row" style="gap:6px">${SC.map((s, i) => `<button class="chip ${i === si ? "on" : ""}" data-si="${i}">${s.own ? "Eigene" : String.fromCharCode(65 + i)}</button>`).join("")}</div>
      <div class="card" style="background:var(--bg)"><p>${esc(sc.s)}</p>${sc.own ? `<small class="muted">Für Arbeitsauftrag 3: nutze eine eigene Situation aus dem Studienalltag. Nichts davon verlässt dein Gerät.</small>` : ""}</div>
      ${["1 · Beobachtung (was sieht/hört die Kamera?)", "2 · Gefühl", "3 · Bedürfnis", "4 · Bitte"].map((t, i) => `<label class="fld">${t}<textarea rows="2" id="gfk-${i}">${esc(val[i])}</textarea></label>`).join("")}
      <div class="row"><button class="btn pri sm" id="gfk-chk">Prüfen</button>${!sc.own ? `<button class="btn ghost sm" id="gfk-ex">${showEx ? "Beispiel ausblenden" : "Beispiellösung zeigen"}</button>` : ""}<button class="btn ghost sm" id="gfk-clr">Leeren</button></div>
      ${fb ? `<div class="col" style="gap:6px">${fb.map(([k, t]) => `<div class="${k === "ok" ? "okline" : k === "warn" ? "warnline" : "muted"}" style="font-size:13px">${k === "ok" ? "✓" : k === "warn" ? "!" : "·"} ${esc(t)}</div>`).join("")}</div>` : ""}
      ${showEx && !sc.own ? `<div class="alt-box"><span class="eyebrow">Eine mögliche Lösung</span><ol style="margin:6px 0 0;padding-left:18px">${sc.ex.map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>` : ""}
      <small class="faint">Die Prüfung ist eine einfache Wortlisten-Heuristik aus dem Skript, kein Urteil über deinen Text.</small></div>`;
    $$("textarea", el).forEach(t => t.oninput = () => { val[+t.id.split("-")[1]] = t.value; });
    $("#gfk-chk", el).onclick = () => { fb = check(); const ok = fb.filter(x => x[0] === "ok").length; App.rec(topicOf(b, l), ok / 4); if (ok === 4 && done("gfk4-" + si)) App.addXP(15, "gfk", el); draw(); };
    const ex = $("#gfk-ex", el); if (ex) ex.onclick = () => { showEx = !showEx; draw(); };
    $("#gfk-clr", el).onclick = () => { val.fill(""); fb = null; draw(); };
  };
  el.onclick = e => { const x = e.target.closest("[data-si]"); if (x) { si = +x.dataset.si; val.fill(""); fb = null; showEx = false; draw(); } };
  draw();
};

/* ---------- You → I messages ---------- */
W.imsg = (el, b, l) => {
  const de = b.lang !== "en";
  const LIST = de ? ["Nie rufst du mich an.", "Du hörst mir nicht zu!", "Jede Person hier hasst mich!", "Das ist eine blöde Idee.", "Nie tut jemand etwas hier.", "Du nervst mich, geh weg.", "Lass mich in Ruhe!", "Immer lügst du mich an.", "Wer hat denn dich eingeladen?", "Das hast du wirklich verbockt.", "Du gehst mir so auf die Nerven.", "Du bist einfach rücksichtslos!"]
    : ["You never listen to me.", "You don't listen to me!", "Everyone here hates me!", "That's a dumb idea.", "No one does anything here.", "You annoy me, go away!", "Leave me alone!", "You lied to me.", "Who invited you?", "You did a horrible job.", "You make me so mad.", "You are so inconsiderate!"];
  const FEEL_EN = ["frustrated", "hurt", "sad", "worried", "disappointed", "angry", "annoyed", "anxious", "disconnected", "lonely", "stressed", "overwhelmed", "confused", "upset", "concerned", "left out", "unappreciated", "nervous", "uncomfortable", "tired", "irritated"];
  const PSEUDO_EN = ["ignored", "used", "attacked", "manipulated", "betrayed", "rejected", "misunderstood", "that you", "like you", "as if"];
  let i = 0, txt = "", fb = null;
  const check = () => { const t = txt.toLowerCase(), out = [];
    if (de) {
      out.push(/^\s*ich\b/.test(t) ? ["ok", "Beginnt mit „Ich“."] : ["warn", "Starte mit „Ich …“."]);
      const ps = PSEUDO.filter(w => t.includes(w) && w.trim().length > 3); const fe = FEEL.filter(w => t.includes(w));
      out.push(fe.length && !ps.length ? ["ok", "Echtes Gefühl: " + fe.join(", ")] : ps.length ? ["warn", "„" + ps[0].trim() + "“ ist eher ein Pseudogefühl."] : ["warn", "Nenne ein Gefühl (Liste S. 31)."]);
      out.push(/\bdu bist\b|\bdu hast .* (verbockt|falsch)|\bimmer\b|\bnie\b/.test(t) ? ["warn", "Enthält noch Du-Urteil oder „immer/nie“."] : ["ok", "Kein Du-Urteil."]);
      out.push(/(weil|mir ist|ich brauche|ich wünsche|wichtig|würde mich freuen|bitte|kannst du|magst du|bist du bereit)/.test(t) ? ["ok", "Bedürfnis oder Wunsch vorhanden."] : ["warn", "Ergänze Bedürfnis oder Wunsch („weil mir … wichtig ist“, „ich würde mich freuen, wenn …“)."]);
    } else {
      out.push(/^\s*i\b/.test(t) ? ["ok", "Starts with “I”."] : ["warn", "Start with “I …”."]);
      const ps = PSEUDO_EN.filter(w => t.includes(w)), fe = FEEL_EN.filter(w => t.includes(w));
      out.push(fe.length && !ps.length ? ["ok", "Real feeling: " + fe.join(", ")] : ps.length ? ["warn", "“" + ps[0] + "” is a judgment, not a feeling."] : ["warn", "Name a feeling (I feel frustrated / hurt / left out …)."]);
      out.push(/\bwhen\b/.test(t) ? ["ok", "Describes the behaviour (“when …”)."] : ["warn", "Describe the behaviour: “… when …”."]);
      out.push(/(because|i need|i'd like|i would like|i'd appreciate|i would appreciate|could you|would you)/.test(t) ? ["ok", "Need or request included."] : ["warn", "Add your need or request (“because I need …”, “I'd appreciate …”)."]);
    }
    return out; };
  const draw = () => {
    el.innerHTML = `<div class="w">${head(de ? "Du → Ich" : "You → I", de ? "Umformulieren" : "Rewrite", `<small class="muted tab">${i + 1}/${LIST.length}</small>`)}
      <div class="card" style="background:var(--bg)"><p style="font-size:17px">„${esc(LIST[i])}“</p></div>
      <label class="fld">${de ? "Deine Ich-Botschaft" : "Your I-message"}<textarea rows="3" id="im-t">${esc(txt)}</textarea></label>
      <div class="row"><button class="btn pri sm" id="im-chk">${de ? "Prüfen" : "Check"}</button><button class="btn sm" id="im-next">${de ? "Nächste →" : "Next →"}</button></div>
      ${fb ? `<div class="col" style="gap:4px">${fb.map(([k, t]) => `<div class="${k === "ok" ? "okline" : "warnline"}">${k === "ok" ? "✓" : "!"} ${esc(t)}</div>`).join("")}</div>` : ""}</div>`;
    $("#im-t", el).oninput = e => { txt = e.target.value; };
    $("#im-chk", el).onclick = () => { fb = check(); const ok = fb.filter(x => x[0] === "ok").length; App.rec(topicOf(b, l), ok / 4); if (ok === 4) App.addXP(3, "imsg", el); draw(); };
    $("#im-next", el).onclick = () => { i = (i + 1) % LIST.length; txt = ""; fb = null; draw(); };
  };
  draw();
};

/* ---------- Harvard orange ---------- */
W.orange = (el, b, l) => {
  let step = 0, pick = null;
  const draw = () => {
    el.innerHTML = `<div class="w">${head("Die Orange", "Szenario")}
      <div class="card" style="background:var(--bg)"><p>Zwei Kinder kommen zur Mutter. Jedes will unbedingt <b>die eine Orange</b>. Was tut die Mutter?</p></div>
      <div class="opts">${[["Orange halbieren", "Klassischer Kompromiss: jede Position bekommt einen Anteil."], ["Dem Kind geben, das zuerst gefragt hat", "Machtentscheidung, ein Kind verliert."], ["Fragen: „Warum wollt ihr die Orange?“", "Interessen statt Positionen."]].map((o, i) => `<button class="opt ${pick === i ? (i === 2 ? "ok" : "no") : ""}" data-i="${i}" ${pick !== null ? "disabled" : ""}><span class="k">${String.fromCharCode(65 + i)}</span><span><b>${o[0]}</b><br><small class="muted">${o[1]}</small></span></button>`).join("")}</div>
      ${pick !== null ? `<div class="why ${pick === 2 ? "" : "bad"}"><b>${pick === 2 ? "Genau." : "Möglich, aber nicht optimal."}</b><div>Das erste Kind will frisch gepressten Saft, das zweite braucht die <b>Schale</b> für einen Kuchen. Durch das Hinterfragen bekommen beide 100 % von dem, was sie wirklich brauchen. Halbieren hätte beiden nur die Hälfte gegeben.</div></div>` : ""}</div>`;
  };
  el.onclick = e => { const x = e.target.closest("[data-i]"); if (!x || pick !== null) return; pick = +x.dataset.i; App.rec(topicOf(b, l), pick === 2 ? 1 : 0); if (pick === 2 && done("orange")) App.addXP(10, "orange", x); draw(); };
  draw();
};

/* ---------- Get thinking riddles (English, p. 32) ---------- */
W.listentest = (el) => {
  const Q = [["Why can't a man living in London be buried west of the River Thames?", "Because he's living – you don't bury living people."], ["How much soil is there in a hole that is 3 m long, 2 m wide and 1 m deep?", "None – it's a hole."], ["The 20th and 22nd presidents had the same mother and father but were not brothers. Explanation?", "They were the same person (Grover Cleveland served two non-consecutive terms)."], ["You live in a square house with windows on each side facing south. What colour is the bear in your garden?", "White – the house must be at the North Pole, so it's a polar bear."], ["How did a window cleaner cleaning the 20th floor fall but escape injury?", "He was cleaning the inside of the window, or fell off a low ladder."], ["Door 1: a madman who wants to kill you. Door 2: a tiger that hasn't eaten for three years. Which door?", "Door 2 – a tiger that hasn't eaten for three years is dead."], ["What is odd about this paragraph (p. 32, Q7)?", "It doesn't contain the letter “e”, the most common letter in English."]];
  const open = new Set();
  const draw = () => { el.innerHTML = `<div class="w">${head("Get thinking", "Listening")}<p class="muted">Listen carefully to the exact words. Think first, then reveal.</p><div class="col" style="gap:8px">${Q.map((q, i) => `<div class="card col" style="background:var(--bg);gap:6px"><div><b>Q${i + 1}.</b> ${esc(q[0])}</div>${open.has(i) ? `<div class="okline" style="font-size:14px">${esc(q[1])}</div>` : `<div><button class="btn ghost sm" data-i="${i}">Reveal answer</button></div>`}</div>`).join("")}</div></div>`; };
  el.onclick = e => { const x = e.target.closest("[data-i]"); if (x) { open.add(+x.dataset.i); draw(); if (open.size === Q.length && done("riddles")) App.addXP(5, "riddle", el); } };
  draw();
};

/* ---------- DiSC quadrant ---------- */
W.disc = el => {
  const D = { D: ["Dominance", "#F0616D", "faster paced · task oriented", "Shapes the environment by overcoming opposition to get results. Wants: results, challenge, authority.", "Be brief, clear and specific. Stay on task, present facts logically, provide alternatives. No chitchat.", "direct and demanding approach, little empathy, little social interaction"], i: ["influence", "#F2B84B", "faster paced · people oriented", "Shapes the environment by persuading others. Wants: recognition, social contact, enthusiasm.", "Keep it light, ask about their ideas, allow time to socialise, put details in writing, don't leave decisions in the air.", "attempts to persuade, need to be the centre of attention, overestimating abilities"], S: ["Steadiness", "#8BD126", "slower paced · people oriented", "Cooperates to carry out the task. Wants: stability, appreciation, sincere interest.", "Be logical and systematic, show interest in them as people, don't force quick responses, listen carefully.", "resistance to change, difficulty prioritising, difficulty with deadlines"], C: ["Conscientiousness", "#4C9EFF", "slower paced · task oriented", "Works within existing circumstances to ensure quality and accuracy. Wants: data, time, clear expectations.", "Minimise socialising, be straightforward, give information and time, be clear about deadlines, prove with data.", "discomfort with ambiguity, desire to double-check, little need to affiliate"] };
  let sel = "D";
  const draw = () => { const d = D[sel];
    el.innerHTML = `<div class="w">${head("The four styles", "Model")}
      <div class="grid g2" style="gap:6px">${["D", "i", "C", "S"].map(k => `<button class="card" data-k="${k}" style="cursor:pointer;text-align:left;border-color:${sel === k ? D[k][1] : "var(--line)"};background:${sel === k ? "var(--card2)" : "var(--card)"}"><div class="row" style="gap:10px"><b style="font:700 26px var(--f-display);color:${D[k][1]}">${k}</b><div><b>${D[k][0]}</b><div><small>${D[k][2]}</small></div></div></div></button>`).join("")}</div>
      <div class="card col" style="background:var(--bg);border-color:${d[1]}"><div><span class="eyebrow">Style</span><p>${d[3]}</p></div><div><span class="eyebrow">When relating to ${sel}</span><p>${d[4]}</p></div><div><span class="eyebrow">Be prepared for</span><p>${d[5]}</p></div></div>
      <small class="muted">Find your own style: free DiSC tests are linked under Resources.</small></div>`; };
  el.onclick = e => { const x = e.target.closest("[data-k]"); if (x) { sel = x.dataset.k; draw(); } };
  draw();
};

/* ---------- chart lab (English) ---------- */
function svgChart(set, w = 520, h = 260) {
  const pad = { l: 44, r: 12, t: 16, b: 40 }, cols = ["var(--info)", "var(--acc)", "var(--warn)", "var(--violet)"];
  const all = set.series.flatMap(s => s[1]).filter(isFinite); if (!all.length) return "";
  if (set.type === "pie") {
    const s = set.series[set.series.length - 1]; const tot = s[1].reduce((a, v) => a + v, 0); let a0 = -Math.PI / 2; const cx = w / 2 - 80, cy = h / 2, r = Math.min(h / 2 - 16, 110);
    return `<svg viewBox="0 0 ${w} ${h}" class="chart" style="width:100%;max-width:${w}px" role="img" aria-label="${esc(set.title)}">${s[1].map((v, i) => { const a1 = a0 + v / tot * Math.PI * 2; const p = `M${cx} ${cy}L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)}A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}Z`; a0 = a1; const c = ["#4C9EFF", "#8BD126", "#F2B84B", "#A78BFA", "#F0616D", "#22D3EE"][i % 6]; return `<path d="${p}" fill="${c}" stroke="var(--bg)" stroke-width="2"/><rect x="${w / 2 + 40}" y="${24 + i * 22}" width="12" height="12" rx="2" fill="${c}"/><text x="${w / 2 + 58}" y="${34 + i * 22}">${esc(set.labels[i])} ${Math.round(v / tot * 1000) / 10} %</text>`; }).join("")}<text x="${w / 2 + 40}" y="${h - 10}">${esc(s[0])}</text></svg>`;
  }
  const max = Math.max(...all) * 1.1, min = Math.min(0, ...all), n = set.labels.length, iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const Y = v => pad.t + ih - (v - min) / (max - min) * ih, X = i => pad.l + (n === 1 ? iw / 2 : set.type === "bar" ? (i + 0.5) * iw / n : i * iw / (n - 1));
  const ticks = 4, grid = Array.from({ length: ticks + 1 }, (_, k) => min + (max - min) * k / ticks);
  let body = "";
  if (set.type === "bar") { const gw = iw / n * 0.7, bw = gw / set.series.length; set.series.forEach((s, si) => s[1].forEach((v, i) => { body += `<rect x="${X(i) - gw / 2 + si * bw}" y="${Y(Math.max(v, 0))}" width="${bw - 2}" height="${Math.abs(Y(v) - Y(0))}" rx="2" fill="${cols[si % 4]}"><title>${esc(s[0])} · ${esc(set.labels[i])}: ${v}</title></rect>`; })); }
  else set.series.forEach((s, si) => { body += `<path d="M${s[1].map((v, i) => X(i) + " " + Y(v)).join("L")}" fill="none" stroke="${cols[si % 4]}" stroke-width="2.5"/>` + s[1].map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="3.5" fill="${cols[si % 4]}"><title>${esc(s[0])} · ${esc(set.labels[i])}: ${v}</title></circle>`).join(""); });
  return `<svg viewBox="0 0 ${w} ${h}" class="chart" style="width:100%;max-width:${w}px" role="img" aria-label="${esc(set.title)}">
    ${grid.map(g => `<line class="gridl" x1="${pad.l}" x2="${w - pad.r}" y1="${Y(g)}" y2="${Y(g)}"/><text x="${pad.l - 6}" y="${Y(g) + 4}" text-anchor="end">${Math.round(g * 10) / 10}</text>`).join("")}
    ${set.labels.map((lb, i) => (n <= 10 || i % 2 === 0) ? `<text x="${X(i)}" y="${h - pad.b + 16}" text-anchor="middle">${esc(lb)}</text>` : "").join("")}${body}
    ${set.series.map((s, si) => `<rect x="${pad.l + si * 110}" y="${h - 14}" width="10" height="10" rx="2" fill="${cols[si % 4]}"/><text x="${pad.l + 14 + si * 110}" y="${h - 5}">${esc(s[0])}</text>`).join("")}</svg>`;
}
App.svgChart = svgChart;
W.chartlab = (el, b, l) => {
  const c = App.CBY.eng3; const sets = c ? c.chartSets : {}; let key = Object.keys(sets)[0], type = null, custom = S().forms.chartCustom || "Year, US & Canada, EMEA\n2018, 8.3, 4.0\n2019, 10.1, 5.5";
  const PH = ["rise", "increase", "climb", "fall", "drop", "decline", "dip", "peak", "remain", "stable", "steady", "level", "slight", "sharp", "significant", "gradual", "by", "compared", "in contrast", "whereas", "overall", "per cent", "percent"];
  const parseCustom = () => { const rows = custom.trim().split(/\n/).map(r => r.split(/[,;\t]/).map(x => x.trim())); if (rows.length < 2) return null; const hdr = rows[0]; const labels = rows.slice(1).map(r => r[0]); const series = hdr.slice(1).map((h, j) => [h, rows.slice(1).map(r => parseNum(r[j + 1]))]); return { title: "Your chart", type: type || "line", labels, series }; };
  let rec = null, chunks = [], audioURL = null, t0 = 0, tmr;
  const draw = () => {
    const set = key === "custom" ? parseCustom() : Object.assign({}, sets[key], type ? { type } : {});
    el.innerHTML = `<div class="w">${head("Chart lab", "Practice")}
      <div class="row" style="gap:6px">${Object.entries(sets).map(([k, s]) => `<button class="chip ${k === key ? "on" : ""}" data-k="${k}">${esc(s.title.split("(")[0])}</button>`).join("")}<button class="chip ${key === "custom" ? "on" : ""}" data-k="custom">+ Own table</button></div>
      ${key === "custom" ? `<label class="fld">Table (first row = headers, first column = labels; comma or tab separated)<textarea rows="5" id="cl-custom" class="mono">${esc(custom)}</textarea></label>` : ""}
      <div class="row" style="gap:6px"><span class="eyebrow">Type</span>${["line", "bar", "pie"].map(t => `<button class="chip ${(set && set.type) === t ? "on" : ""}" data-t="${t}">${t}</button>`).join("")}</div>
      <div class="svgbox">${set ? svgChart(set) : `<p class="muted">Enter at least one header row and one data row.</p>`}</div>
      ${set && set.task ? `<div class="callout"><b>Task:</b> ${esc(set.task)}</div>` : ""}
      <div class="card col" style="background:var(--bg)"><span class="eyebrow">Speaking practice</span>
        <div class="rec">${rec ? `<span class="recdot"></span><span class="tab" id="cl-time">0:00</span><button class="btn sm danger" id="cl-stop">Stop</button>` : `<button class="btn sm" id="cl-rec">● Record</button>`}${audioURL ? `<audio controls src="${audioURL}" style="max-width:100%"></audio>` : ""}</div>
        <small class="muted">Recordings stay on this device. Start and end with your full name for the homework. Useful: ${PH.slice(0, 12).join(", ")} …</small>
        <label class="fld">Or type notes to check your vocabulary range<textarea rows="3" id="cl-notes">${esc(S().forms.chartNotes || "")}</textarea></label><div id="cl-vocab" class="muted" style="font-size:13px"></div></div></div>`;
    const ta = $("#cl-custom", el); if (ta) ta.oninput = e => { custom = e.target.value; S().forms.chartCustom = custom; App.save(); clearTimeout(ta._t); ta._t = setTimeout(() => { const pos = ta.selectionStart; draw(); const n = $("#cl-custom", el); n.focus(); n.selectionStart = n.selectionEnd = pos; }, 600); };
    const nt = $("#cl-notes", el); const vocab = () => { const t = (nt.value || "").toLowerCase(); const used = PH.filter(p => t.includes(p)); $("#cl-vocab", el).innerHTML = t ? `Trend words used: <b>${used.length}</b> of ${PH.length}${used.length ? " · " + used.join(", ") : ""}` : ""; }; nt.oninput = () => { S().forms.chartNotes = nt.value; App.save(); vocab(); }; vocab();
    const r = $("#cl-rec", el); if (r) r.onclick = async () => { try { const st = await navigator.mediaDevices.getUserMedia({ audio: true }); chunks = []; rec = new MediaRecorder(st); rec.ondataavailable = e => chunks.push(e.data); rec.onstop = () => { st.getTracks().forEach(t => t.stop()); if (audioURL) URL.revokeObjectURL(audioURL); audioURL = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType })); rec = null; clearInterval(tmr); draw(); if (done("chartrec")) App.addXP(10, "rec", el); }; rec.start(); t0 = Date.now(); tmr = setInterval(() => { const s = Math.round((Date.now() - t0) / 1000); const tt = $("#cl-time", el); if (tt) tt.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }, 500); draw(); } catch (e) { App.toast("Mikrofon", "Kein Zugriff auf das Mikrofon. In der installierten App bzw. über https erlauben.", "!"); } };
    const s = $("#cl-stop", el); if (s) s.onclick = () => rec && rec.stop();
  };
  el.onclick = e => { const k = e.target.closest("[data-k]"), t = e.target.closest("[data-t]"); if (k) { key = k.dataset.k; type = null; draw(); if (done("chart-" + key)) App.rec("e-chart", 0.6); } if (t) { type = t.dataset.t; draw(); } };
  App.cleanup = (old => () => { clearInterval(tmr); if (rec) try { rec.stop(); } catch (e) {} old && old(); })(App.cleanup);
  draw();
};

/* ---------- podcast presentation planner ---------- */
W.presplanner = el => {
  const F = S().forms.pres || (S().forms.pres = { topic: "", url: "", date: "", drawings: 0, cues: "", activity: "", questions: "", terms: "", checks: {} });
  const RUB = ["Drawings clear (4–8 A3 or 1 A0)", "Drawings support and structure the content", "Content summed up clearly", "Transition words used", "Language gambits used", "Non-words avoided (ähm, like …)", "Reference to presenter stated", "Introduction · body · conclusion", "Questions + activity prepared", "Eye contact, rhetorical questions", "Why it matters for business informatics students", "5 terms identified for the glossary"];
  const draw = () => {
    const long = (F.cues || "").split(/\n/).filter(x => x.trim().split(/\s+/).length > 6);
    const done_ = RUB.filter((_, i) => F.checks[i]).length;
    el.innerHTML = `<div class="w">${head("Podcast presentation planner", "Plan", `<span class="chip tab">${done_}/${RUB.length}</span>`)}
      <div class="grid g2"><label class="fld">HBR podcast title<input type="text" id="pp-topic" value="${esc(F.topic)}"></label><label class="fld">URL (post in forum: “G1 – title”)<input type="text" id="pp-url" value="${esc(F.url)}"></label></div>
      <div class="grid g2"><label class="fld">Presentation date<input type="date" id="pp-date" value="${esc(F.date)}"></label><label class="fld">A3 drawings done<input type="number" min="0" max="8" id="pp-drawings" value="${F.drawings}"></label></div>
      <label class="fld">Cue cards (one card per line, keywords only)<textarea rows="4" id="pp-cues" class="mono">${esc(F.cues)}</textarea></label>
      ${long.length ? `<div class="warnline">${long.length} card(s) look like full sentences (more than 6 words). Use keywords only.</div>` : F.cues ? `<div class="okline">Cue cards look like keywords. 👍</div>` : ""}
      <label class="fld">Activity for the audience<textarea rows="2" id="pp-activity">${esc(F.activity)}</textarea></label>
      <label class="fld">Questions for colleagues<textarea rows="2" id="pp-questions">${esc(F.questions)}</textarea></label>
      <div class="col" style="gap:4px"><span class="eyebrow">Rubric self-check</span>${RUB.map((r, i) => `<label class="row" style="gap:10px;flex-wrap:nowrap;font-size:14px"><input type="checkbox" data-c="${i}" ${F.checks[i] ? "checked" : ""}>${esc(r)}</label>`).join("")}</div>
      ${F.date ? `<div class="row"><button class="btn sm" id="pp-cal">Add date to calendar</button></div>` : ""}
      <small class="muted">Topic deadline 31 Oct 2026, first come first served. Timer for practice runs is in the Exam trainer.</small></div>`;
    ["topic", "url", "date", "drawings", "cues", "activity", "questions"].forEach(k => { const inp = $("#pp-" + k, el); inp.onchange = inp.oninput = () => { F[k] = k === "drawings" ? +inp.value : inp.value; App.save(); if (k === "cues" || k === "date") { clearTimeout(inp._t); inp._t = setTimeout(() => { const pos = inp.selectionStart; draw(); const n = $("#pp-" + k, el); n.focus(); try { n.selectionStart = n.selectionEnd = pos; } catch (e) {} }, 700); } }; });
    $$("[data-c]", el).forEach(c => c.onchange = () => { F.checks[c.dataset.c] = c.checked; App.save(); draw(); });
    const cal = $("#pp-cal", el); if (cal) cal.onclick = () => { App.setEventDate && App.setEventDate("eng-pres", F.date); App.toast("Kalender", "Präsentationstermin eingetragen.", "▦"); };
  };
  draw();
};

/* ---------- character profile ---------- */
W.charprofile = el => {
  const FIELDS = ["Nicknames", "Character type", "Physical characteristics", "Age", "Sex", "Height", "Weight", "Hair", "Eyes", "Unique physical characteristics", "Personality type", "Wants / goals", "Fears", "Passions", "Flaws (weaknesses)", "Problems", "Attitude towards work", "Attitude towards friends", "Clothes preference", "Food preference", "Habits", "Reactions when something goes wrong", "Reactions when something goes right", "Family structure", "Major life traumas", "Major life successes", "Unique past activity", "Hobbies", "Sports", "Volunteer efforts", "Reaction: confrontation", "Reaction: ignoring the problem", "Reaction: going straight to the top", "Reaction: share commission with you", "Reaction: share commission with Duncan (compromise)"];
  const ADJ = ["generous", "aggressive", "persuasive", "mean", "selfish", "tough", "kind", "arrogant"];
  const F = S().forms.rob || (S().forms.rob = { adj: [], v: {} });
  const draw = () => {
    const filled = FIELDS.filter(f => (F.v[f] || "").trim()).length;
    el.innerHTML = `<div class="w">${head("Character profile: Rob Grewal", "Template", `<span class="chip tab">${filled}/${FIELDS.length}</span>`)}
      <div><span class="eyebrow">Choose three adjectives</span><div class="row" style="gap:6px;margin-top:6px">${ADJ.map(a => `<button class="chip ${F.adj.includes(a) ? "on" : ""}" data-a="${a}">${a}</button>`).join("")}</div></div>
      <div class="col" style="gap:6px">${FIELDS.map(f => `<label class="fld">${esc(f)}<input type="text" data-f="${esc(f)}" value="${esc(F.v[f] || "")}"></label>`).join("")}</div>
      <div class="row"><button class="btn sm" id="cp-copy">Copy as text</button><small class="muted">Your own writing, saved on this device. Paste it into the Word template for Moodle.</small></div></div>`;
    $$("[data-f]", el).forEach(i => i.oninput = () => { F.v[i.dataset.f] = i.value; App.save(); });
    $("#cp-copy", el).onclick = async () => { const t = "Character Profile: Rob Grewal\nAdjectives: " + F.adj.join(", ") + "\n\nName: Rob Grewal\n" + FIELDS.map(f => f + ": " + (F.v[f] || "")).join("\n"); try { await navigator.clipboard.writeText(t); App.toast("Kopiert", "Profil in der Zwischenablage.", "⎘"); } catch (e) { App.toast("Kopieren fehlgeschlagen", "Markiere den Text manuell.", "!"); } };
  };
  el.onclick = e => { const a = e.target.closest("[data-a]"); if (!a) return; const x = a.dataset.a; F.adj = F.adj.includes(x) ? F.adj.filter(y => y !== x) : F.adj.length < 3 ? F.adj.concat(x) : F.adj; App.save(); draw(); };
  draw();
};

/* ---------- glossary builder (format checker) ---------- */
W.glossary = el => {
  const G = S().forms.glossary || (S().forms.glossary = [0, 1, 2, 3, 4].map(() => ({ term: "", def: "", src: "", s1: "", s2: "", s2src: "" })));
  const val = g => { const t = g.term.trim().toLowerCase(), out = [];
    if (!t) return [["warn", "Term missing"]];
    out.push(g.def.trim().length > 10 ? ["ok", "Definition"] : ["warn", "Definition missing"]);
    out.push(/vocabulary\.com|cambridge/i.test(g.src) ? ["ok", "Definition source named"] : ["warn", "Name the source (vocabulary.com or Cambridge)"]);
    const stem = t.slice(0, Math.max(3, t.length - 2));
    out.push(g.s1.toLowerCase().includes(stem) ? ["ok", "Sentence 1 uses the term"] : ["warn", "Sentence 1 must use the term"]);
    out.push(g.s2.toLowerCase().includes(stem) ? ["ok", "Sentence 2 uses the term"] : ["warn", "Sentence 2 must use the term"]);
    out.push(g.s2src.trim().length > 3 ? ["ok", "Sentence 2 source named"] : ["warn", "Name the source of sentence 2 (vocabulary.com)"]);
    return out; };
  let open = 0;
  const draw = () => {
    const okCount = G.filter(g => val(g).every(x => x[0] === "ok")).length;
    el.innerHTML = `<div class="w">${head("Glossary entries", "Format", `<span class="chip ${okCount === 5 ? "acc" : ""} tab">${okCount}/5 complete</span>`)}
      <div class="row" style="gap:6px">${G.map((g, i) => `<button class="chip ${i === open ? "on" : ""}" data-o="${i}">${esc(g.term || "Term " + (i + 1))}${val(g).every(x => x[0] === "ok") ? " ✓" : ""}</button>`).join("")}</div>
      ${(() => { const g = G[open]; return `<div class="col" style="gap:8px">
        <label class="fld">Term<input type="text" data-k="term" value="${esc(g.term)}"></label>
        <label class="fld">Definition<textarea rows="2" data-k="def">${esc(g.def)}</textarea></label>
        <label class="fld">Definition source (URL)<input type="text" data-k="src" value="${esc(g.src)}" placeholder="https://www.vocabulary.com/dictionary/…"></label>
        <label class="fld">Sentence 1 (from your presentation or course material)<textarea rows="2" data-k="s1">${esc(g.s1)}</textarea></label>
        <label class="fld">Sentence 2 (from vocabulary.com, IT/science/business)<textarea rows="2" data-k="s2">${esc(g.s2)}</textarea></label>
        <label class="fld">Sentence 2 source (title/author)<input type="text" data-k="s2src" value="${esc(g.s2src)}"></label>
        <div class="col" style="gap:3px">${val(g).map(([k, t]) => `<div class="${k === "ok" ? "okline" : "warnline"}">${k === "ok" ? "✓" : "!"} ${esc(t)}</div>`).join("")}</div></div>`; })()}
      <div class="row"><button class="btn sm" id="gl-cards" ${okCount ? "" : "disabled"}>Make flashcards from complete entries</button><button class="btn sm" id="gl-copy">Copy all as text</button></div>
      <small class="muted">Deadline 10 Jan 2027. Late entries are not accepted.</small></div>`;
    $$("[data-k]", el).forEach(i => i.oninput = () => { G[open][i.dataset.k] = i.value; App.save(); clearTimeout(i._t); i._t = setTimeout(() => { const k = i.dataset.k, pos = i.selectionStart; draw(); const n = $(`[data-k="${k}"]`, el); n.focus(); try { n.selectionStart = n.selectionEnd = pos; } catch (e) {} }, 900); });
    $("#gl-cards", el).onclick = () => { let n = 0; G.forEach((g, i) => { if (!val(g).every(x => x[0] === "ok")) return; const id = "gloss" + i; const ex = S().customCards.find(c => c.id === id); const card = { id, cat: "English", topic: "e-glos", course: "eng3", front: g.term, back: g.def + "\n\n“" + g.s1 + "”" }; if (ex) Object.assign(ex, card); else S().customCards.push(card); n++; }); App.save(); App.toast("Karteikarten", n + " Glossar-Karten erstellt.", "▭"); };
    $("#gl-copy", el).onclick = async () => { const t = G.filter(g => g.term).map(g => `${g.term}\n${g.def} (Source: ${g.src})\nSentence 1: ${g.s1}\nSentence 2: ${g.s2}\n${g.s2src}`).join("\n\n"); try { await navigator.clipboard.writeText(t); App.toast("Kopiert", "Glossar in der Zwischenablage.", "⎘"); } catch (e) {} };
  };
  el.onclick = e => { const o = e.target.closest("[data-o]"); if (o) { open = +o.dataset.o; draw(); } };
  draw();
};

/* ================= BWL widgets ================= */
W.bookings = (el, b, l) => {
  const C = [
    ["Einkauf von Handelswaren auf Ziel (€ 35.000)", "verl", "0", "0", "Vorräte ↑, Verbindlichkeiten LL ↑ (Bilanzverlängerung). Kein Aufwand, erst beim Wareneinsatz."],
    ["Eingang einer Kundenforderung in bar (€ 2.000)", "aktiv", "0", "+", "Kassa ↑, Forderungen ↓ (Aktivtausch)."],
    ["Barzahlung von Postspesen (€ 13)", "verk", "auf", "-", "Kassa ↓, Eigenkapital ↓ über Aufwand (Bilanzverkürzung)."],
    ["Zahlung noch nicht erfasster FK-Zinsen per Überweisung (€ 200)", "verk", "auf", "-", "Bank ↓, Aufwand (Zinsen) ↑."],
    ["Verkauf von Fertigerzeugnissen auf Ziel (€ 25.000)", "verl", "ert", "0", "Forderungen ↑, Umsatzerlös ↑; Geld kommt später."],
    ["Planmäßige Abschreibung der Software (€ 8.000)", "verk", "auf", "0", "Immaterielles AV ↓, Abschreibungsaufwand ↑, keine Auszahlung."],
    ["Rückzahlung eines Kredits per Banküberweisung", "verk", "0", "-", "Bank ↓, Verbindlichkeiten ↓, kein Aufwand."],
    ["Aufnahme eines Bankkredits, Gutschrift am Konto", "verl", "0", "+", "Bank ↑, Verbindlichkeiten ↑."],
    ["Umwandlung einer kurzfristigen in eine langfristige Verbindlichkeit", "passiv", "0", "0", "Passivtausch."]
  ];
  const BIL = [["aktiv", "Aktivtausch"], ["passiv", "Passivtausch"], ["verl", "Bilanzverlängerung"], ["verk", "Bilanzverkürzung"]], GUV = [["ert", "Ertrag"], ["auf", "Aufwand"], ["0", "keine"]], LIQ = [["+", "steigen"], ["-", "sinken"], ["0", "unverändert"]];
  const ans = {}; let checked = false;
  const draw = () => {
    const sc = C.filter((c, i) => ans[i] && ans[i].b === c[1] && ans[i].g === c[2] && ans[i].l === c[3]).length;
    el.innerHTML = `<div class="w">${head("Geschäftsfälle: Wirkung auf Bilanz, GuV, Liquidität", "Übung 1", checked ? `<span class="chip tab">${sc}/${C.length}</span>` : "")}
      <div class="col" style="gap:10px">${C.map((c, i) => { const a = ans[i] || {}; const row = (arr, k, correct) => `<div class="sr-c">${arr.map(([v, t]) => { let cls = ""; if (checked) { if (v === correct) cls = "right"; else if (a[k] === v) cls = "wrong"; } else if (a[k] === v) cls = "pick"; return `<button data-i="${i}" data-k="${k}" data-v="${v}" class="${cls}" ${checked ? "disabled" : ""}>${t}</button>`; }).join("")}</div>`;
        return `<div class="sort-row ${checked ? (a.b === c[1] && a.g === c[2] && a.l === c[3] ? "ok" : "no") : ""}"><div class="sr-t"><b>${esc(c[0])}</b></div><small class="eyebrow">Bilanz</small>${row(BIL, "b", c[1])}<small class="eyebrow">GuV</small>${row(GUV, "g", c[2])}<small class="eyebrow">Liquide Mittel</small>${row(LIQ, "l", c[3])}${checked ? `<div class="sr-why">${esc(c[4])}</div>` : ""}</div>`; }).join("")}</div>
      <div class="row">${checked ? `<button class="btn sm" id="bk-re">Nochmal</button>` : `<button class="btn pri sm" id="bk-chk">Prüfen</button>`}</div></div>`;
    const ch = $("#bk-chk", el); if (ch) ch.onclick = () => { checked = true; const s = C.filter((c, i) => ans[i] && ans[i].b === c[1] && ans[i].g === c[2] && ans[i].l === c[3]).length; App.rec(topicOf(b, l), s / C.length); if (s === C.length && done("bookings")) App.addXP(15, "bk", ch); draw(); };
    const re = $("#bk-re", el); if (re) re.onclick = () => { checked = false; Object.keys(ans).forEach(k => delete ans[k]); draw(); };
  };
  el.onclick = e => { const x = e.target.closest("[data-v]"); if (!x || checked) return; const a = ans[x.dataset.i] || (ans[x.dataset.i] = {}); a[x.dataset.k] = x.dataset.v; draw(); };
  draw();
};

W.ratio = (el, b, l) => {
  const set = App.CBY.bwl2.ratioSets[b.set]; const v = Object.fromEntries(set.fields.map(f => [f[0], f[2]]));
  const draw = () => {
    el.innerHTML = `<div class="w">${head(esc(set.title), "Rechner")}<p class="muted" style="font-size:13px">Werte aus deinem Fall eintragen (z. B. Pix Mania GmbH aus Übung 2). Die Vorbelegung stammt teilweise aus dem KFR-Fallbeispiel der Folien (TEUR).</p>
      <div class="grid g2" style="gap:8px">${set.fields.map(f => `<label class="fld">${esc(f[1])}<input type="text" inputmode="decimal" data-f="${f[0]}" value="${String(v[f[0]]).replace(".", ",")}"></label>`).join("")}</div>
      <div class="res-grid">${set.out.map(o => { const r = o[2](v); return `<div class="stat"><span>${esc(o[0])}</span><b class="tab">${isFinite(r) ? fmt(r, o[1] === "%" ? 1 : 2) : "–"} ${o[1]}</b></div>`; }).join("")}</div>
      <small class="muted">Nicht vergessen: Zahlen allein sind noch keine Antwort. Interpretiere sie im Zeit-, Branchen- oder Soll-Ist-Vergleich.</small></div>`;
    $$("[data-f]", el).forEach(i => i.onchange = () => { v[i.dataset.f] = parseNum(i.value); draw(); if (done("ratio-" + b.set)) App.rec(topicOf(b, l), 0.5); });
  };
  draw();
};

W.cfbuilder = (el, b, l) => {
  const L = [["Jahresüberschuss", 69], ["+ Abschreibungen auf das AV", 203], ["− Gewinne Anlagenabgang, aktivierte Eigenleistungen", -112], ["+ Dotierung langfristiger Rückstellungen (Abfertigung)", 26], ["= Cash-Flow aus dem Ergebnis", 186, true], ["+ Senkung Vorräte, ARA", 113], ["− Erhöhung Forderungen LL, Konzernforderungen; Senkung sonst. Forderungen", -193], ["+ Veränderung Verbindlichkeiten LL, Wechsel, Konzern-, sonst. Verbindlichkeiten", 484], ["− Senkung kurzfristiger Rückstellungen", -82], ["= Cash-Flow aus dem operativen Bereich", 508, true], ["+ Abgänge AV (Restbuchwerte + Gewinne)", 112], ["− Investitionen in das AV", -400], ["= Cash-Flow aus Investitionstätigkeit", -288, true], ["− Rückzahlung kurzfristiger Kredite", -73], ["− Rückzahlung langfristiger Kredite", -148], ["= Cash-Flow aus Finanzierungstätigkeit", -221, true], ["= Veränderung liquide Mittel", -1, true], ["+ Anfangsbestand liquide Mittel", 2], ["= Endbestand liquide Mittel", 1, true]];
  const v = {}; let checked = false;
  const draw = () => {
    const tot = L.filter(x => x[2]).length, sc = L.filter((x, i) => x[2] && parseNum(v[i]) === x[1]).length;
    el.innerHTML = `<div class="w">${head("Kapitalflussrechnung (Fallbeispiel Folien 80–84)", "Aufbauen", checked ? `<span class="chip tab">${sc}/${tot}</span>` : "")}
      <p class="muted" style="font-size:13px">Die Einzelposten sind aus Bilanz und GuV abgeleitet. Rechne die Zwischensummen (fett) selbst aus, in TEUR.</p>
      <div>${L.map((x, i) => `<div class="num-in"><span style="${x[2] ? "font-weight:600" : ""}">${esc(x[0])}</span>${x[2] ? `<input type="text" inputmode="decimal" data-i="${i}" value="${esc(v[i] || "")}" class="${checked ? (parseNum(v[i]) === x[1] ? "ok" : "no") : ""}" placeholder="?">` : `<span class="tab" style="text-align:right">${x[1] > 0 ? "+" : ""}${x[1]}</span>`}${checked && x[2] && parseNum(v[i]) !== x[1] ? `<span class="how">→ ${x[1]}</span>` : ""}</div>`).join("")}</div>
      <div class="row">${checked ? `<button class="btn sm" id="cf-re">Nochmal</button>` : `<button class="btn pri sm" id="cf-chk">Prüfen</button>`}</div></div>`;
    $$("[data-i]", el).forEach(i => i.oninput = () => { v[i.dataset.i] = i.value; });
    const c = $("#cf-chk", el); if (c) c.onclick = () => { checked = true; const s = L.filter((x, i) => x[2] && parseNum(v[i]) === x[1]).length; App.rec(topicOf(b, l), s / tot); if (s === tot && done("cf")) App.addXP(20, "cf", c); draw(); };
    const r = $("#cf-re", el); if (r) r.onclick = () => { checked = false; Object.keys(v).forEach(k => delete v[k]); draw(); };
  };
  draw();
};

W.costcurve = el => {
  let F = 10000, kv = 5, x = 2000;
  const draw = () => {
    const W_ = 520, H = 220, maxX = 5000, maxK = F + kv * maxX, X = q => 44 + q / maxX * 460, Y = k => 190 - k / maxK * 170, Yu = k => 190 - k / (F / 250 + kv) * 170;
    el.innerHTML = `<div class="w">${head("Fixe und variable Kosten", "Interaktiv")}
      <div class="grid g2"><div><span class="eyebrow">Gesamtkosten</span><svg viewBox="0 0 ${W_} ${H}" class="chart" style="width:100%"><line class="gridl" x1="44" x2="504" y1="190" y2="190"/><path d="M${X(0)} ${Y(F)}L${X(maxX)} ${Y(F)}" stroke="var(--warn)" stroke-width="2" stroke-dasharray="5 4"/><path d="M${X(0)} ${Y(F)}L${X(maxX)} ${Y(F + kv * maxX)}" stroke="var(--acc)" stroke-width="2.5"/><circle cx="${X(x)}" cy="${Y(F + kv * x)}" r="5" fill="var(--info)"/><text x="48" y="${Y(F) - 6}">Fixkosten</text><text x="${X(maxX) - 4}" y="${Y(F + kv * maxX) + 14}" text-anchor="end">K = F + kv·x</text><text x="274" y="212" text-anchor="middle">Menge x</text></svg></div>
      <div><span class="eyebrow">Stückkosten (Fixkostendegression)</span><svg viewBox="0 0 ${W_} ${H}" class="chart" style="width:100%"><line class="gridl" x1="44" x2="504" y1="190" y2="190"/><path d="M${Array.from({ length: 60 }, (_, i) => { const q = 250 + i * (maxX - 250) / 59; return X(q) + " " + Yu(F / q + kv); }).join("L")}" fill="none" stroke="var(--acc)" stroke-width="2.5"/><path d="M${X(0)} ${Yu(kv)}L${X(maxX)} ${Yu(kv)}" stroke="var(--warn)" stroke-dasharray="5 4"/><circle cx="${X(x)}" cy="${Yu(F / x + kv)}" r="5" fill="var(--info)"/><text x="${X(maxX) - 4}" y="${Yu(kv) - 6}" text-anchor="end">kv</text><text x="274" y="212" text-anchor="middle">Menge x</text></svg></div></div>
      <div class="grid g3"><label class="fld">Fixkosten <b class="tab">€ ${fmt(F, 0)}</b><input type="range" id="cc-f" min="0" max="30000" step="500" value="${F}"></label><label class="fld">var. Kosten/Stk <b class="tab">€ ${fmt(kv, 2)}</b><input type="range" id="cc-v" min="0" max="20" step="0.5" value="${kv}"></label><label class="fld">Menge <b class="tab">${fmt(x, 0)}</b><input type="range" id="cc-x" min="250" max="5000" step="50" value="${x}"></label></div>
      <div class="res-grid"><div class="stat"><span>Gesamtkosten</span><b class="tab">€ ${fmt(F + kv * x, 0)}</b></div><div class="stat"><span>Stückkosten</span><b class="tab">€ ${fmt(F / x + kv, 2)}</b></div><div class="stat"><span>davon fix je Stk</span><b class="tab">€ ${fmt(F / x, 2)}</b></div></div></div>`;
    [["cc-f", v => F = v], ["cc-v", v => kv = v], ["cc-x", v => x = v]].forEach(([id, set]) => { $("#" + id, el).oninput = e => { set(+e.target.value); draw(); $("#" + id, el).focus(); }; });
  };
  draw();
};

W.zuschlag = el => {
  const v = { fm: 10000, mgk: 10, fl: 5250, fgk: 150, sek: 0, vwvt: 8, gew: 15, sko: 2, rab: 10, ust: 20 };
  const L = [["fm", "Fertigungsmaterial €"], ["mgk", "MGK-Zuschlag %"], ["fl", "Fertigungslöhne €"], ["fgk", "FGK-Zuschlag %"], ["sek", "Sondereinzelkosten Fertigung €"], ["vwvt", "Verw./Vertr.-Zuschlag % (auf HK)"], ["gew", "Gewinnzuschlag %"], ["sko", "Skonto % (im Hundert)"], ["rab", "Rabatt % (im Hundert)"], ["ust", "USt %"]];
  const draw = () => {
    const mk = v.fm * (1 + v.mgk / 100), fk = v.fl * (1 + v.fgk / 100) + v.sek, hk = mk + fk, sk = hk * (1 + v.vwvt / 100), nbp = sk * (1 + v.gew / 100), nzp = nbp / (1 - v.sko / 100), bzp = nzp / (1 - v.rab / 100), brutto = bzp * (1 + v.ust / 100);
    const rows = [["Fertigungsmaterial", v.fm], ["+ MGK " + v.mgk + " %", v.fm * v.mgk / 100], ["= Materialkosten", mk, 1], ["Fertigungslöhne", v.fl], ["+ FGK " + v.fgk + " %", v.fl * v.fgk / 100], ["+ SEK Fertigung", v.sek], ["= Fertigungskosten", fk, 1], ["= Herstellkosten", hk, 1], ["+ Verwaltung/Vertrieb " + v.vwvt + " %", hk * v.vwvt / 100], ["= Selbstkosten", sk, 1], ["+ Gewinn " + v.gew + " %", sk * v.gew / 100], ["= Nettobarpreis", nbp, 1], ["+ Skonto", nzp - nbp], ["= Nettozielpreis", nzp, 1], ["+ Rabatt", bzp - nzp], ["= Bruttozielpreis ohne USt", bzp, 1], ["+ USt", brutto - bzp], ["= Bruttozielpreis inkl. USt", brutto, 1]];
    el.innerHTML = `<div class="w">${head("Zuschlagskalkulation", "Rechner")}<div class="grid g2"><div class="grid g2" style="gap:8px;align-content:start">${L.map(([k, t]) => `<label class="fld">${t}<input type="text" inputmode="decimal" data-k="${k}" value="${String(v[k]).replace(".", ",")}"></label>`).join("")}</div>
      <div class="table-wrap"><table class="dt"><tbody>${rows.map(r => `<tr class="${r[2] ? "hl" : ""}"><td>${esc(r[0])}</td><td>€ ${fmt(r[1])}</td></tr>`).join("")}</tbody></table></div></div>
      <small class="muted">Vorbelegt mit dem Auftrag aus Übung 3 (Material € 10.000, 500 h × € 10,50). Die Zuschlagssätze musst du aus deinem BAB übernehmen. Skonto und Rabatt werden im Hundert gerechnet.</small></div>`;
    $$("[data-k]", el).forEach(i => i.onchange = () => { v[i.dataset.k] = parseNum(i.value) || 0; draw(); });
  };
  draw();
};

W.dbcalc = (el, b, l) => {
  const P = [["S1", 10, 6, 200, "eigen", "M1"], ["S2", 20, 14.4, 400, "eigen", "M2"], ["S3", 15, 12, 350, "eigen", "M2"], ["S4", 25, 22, 450, "handel", null], ["S5", 10, 8, 150, "handel", null]];
  const FIX = { M1: 400, M2: 2290, eigen: 1000, handel: 1700, total: 5500 };
  let mode = 1;
  const draw = () => {
    const db = P.map(p => (p[1] - p[2]) * p[3]), sum = db.reduce((a, c) => a + c, 0);
    const dbM1 = db[0] - FIX.M1, dbM2 = db[1] + db[2] - FIX.M2, dbE = dbM1 + dbM2 - FIX.eigen, dbH = db[3] + db[4] - FIX.handel, rest = FIX.total - FIX.M1 - FIX.M2 - FIX.eigen - FIX.handel, be = dbE + dbH - rest;
    el.innerHTML = `<div class="w">${head("Ein- und mehrstufige DB-Rechnung (Übung 3, Bsp. 2)", "Rechnung")}
      <div class="row" style="gap:6px"><button class="chip ${mode === 1 ? "on" : ""}" data-m="1">Einstufig</button><button class="chip ${mode === 2 ? "on" : ""}" data-m="2">Stufenweise Fixkostendeckung</button></div>
      <div class="table-wrap"><table class="dt"><thead><tr><th>Artikel</th><th>p</th><th>kv</th><th>db/Stk</th><th>Menge</th><th>DB I</th></tr></thead><tbody>${P.map((p, i) => `<tr><td>${p[0]} <small class="faint">${p[4] === "eigen" ? "Eigenerzeugnis" : "Handelsware"}</small></td><td>${fmt(p[1])}</td><td>${fmt(p[2])}</td><td>${fmt(p[1] - p[2])}</td><td>${p[3]}</td><td>${fmt(db[i], 0)}</td></tr>`).join("")}<tr class="hl"><td>Summe DB</td><td></td><td></td><td></td><td></td><td>${fmt(sum, 0)}</td></tr></tbody></table></div>
      ${mode === 1 ? `<div class="res-grid"><div class="stat"><span>Summe DB</span><b class="tab">€ ${fmt(sum, 0)}</b></div><div class="stat"><span>− Fixkosten gesamt</span><b class="tab">€ ${fmt(FIX.total, 0)}</b></div><div class="stat"><span>= Betriebsergebnis</span><b class="tab" style="color:var(--acc)">€ ${fmt(sum - FIX.total, 0)}</b></div></div><p class="muted" style="font-size:14px">Alle Artikel haben einen positiven DB. Einstufig betrachtet gibt es keinen Grund, einen Artikel zu streichen.</p>`
      : `<div class="table-wrap"><table class="dt"><tbody>
        <tr><td>DB I S1</td><td>${fmt(db[0], 0)}</td></tr><tr><td>− Erzeugnisfix Spezialmaschine S1</td><td>−400</td></tr><tr class="hl"><td>DB II S1</td><td>${fmt(dbM1, 0)}</td></tr>
        <tr><td>DB I S2 + S3</td><td>${fmt(db[1] + db[2], 0)}</td></tr><tr><td>− Erzeugnisgruppenfix Maschine S2/S3</td><td>−2.290</td></tr><tr class="hl"><td>DB II S2/S3</td><td>${fmt(dbM2, 0)}</td></tr>
        <tr><td>− Bereichsfix Eigenerzeugnisse</td><td>−1.000</td></tr><tr class="hl"><td>DB III Eigenerzeugnisse</td><td>${fmt(dbE, 0)}</td></tr>
        <tr><td>DB I S4 + S5</td><td>${fmt(db[3] + db[4], 0)}</td></tr><tr><td>− Bereichsfix Handelswaren</td><td>−1.700</td></tr><tr class="hl"><td>DB III Handelswaren</td><td style="color:var(--bad)">${fmt(dbH, 0)}</td></tr>
        <tr><td>− Unternehmensfixkosten (Rest)</td><td>−${fmt(rest, 0)}</td></tr><tr class="hl"><td>Betriebsergebnis</td><td>${fmt(be, 0)}</td></tr></tbody></table></div>
        <div class="why"><b>Interpretation</b><div>Der Bereich Handelswaren deckt seine eigenen Fixkosten nicht (DB III −50). Sind die € 1.700 abbaubar, würde die Aufgabe des Bereichs das Ergebnis um € 50 verbessern. Bevor man streicht: Verbundeffekte (Kund:innen kaufen Handelswaren mit), Preiserhöhung bei S4 oder günstigerer Einkauf prüfen.</div></div>`}</div>`;
  };
  el.onclick = e => { const m = e.target.closest("[data-m]"); if (m) { mode = +m.dataset.m; draw(); if (mode === 2 && done("db2")) App.rec(topicOf(b, l), 0.7); } };
  draw();
};

W.cases = (el, b, l) => {
  const list = App.CBY.bwl2.cases[b.set]; let ci = 0; const vals = {}; const shown = {}; const res = {};
  const draw = () => { const c = list[ci];
    el.innerHTML = `<div class="w">${head(esc(c.title), "Fall", `<small class="muted">${ci + 1}/${list.length}</small>`)}
      <div class="row" style="gap:6px">${list.map((x, i) => `<button class="chip ${i === ci ? "on" : ""}" data-ci="${i}">Bsp. ${i + 1}${S().widgets["case-" + b.set + i] ? " ✓" : ""}</button>`).join("")}</div>
      <div class="card" style="background:var(--bg)"><p style="font-size:14px">${esc(c.text)}</p></div>
      <div>${c.steps.map((s, j) => { const k = ci + "-" + j, r = res[k]; return `<div class="num-in"><span>${esc(s.q)}</span><input type="text" inputmode="decimal" data-k="${k}" value="${esc(vals[k] || "")}" class="${r === undefined ? "" : r ? "ok" : "no"}" placeholder="Ergebnis">${shown[k] || r === false ? `<span class="how">${r === false ? "Lösung: " + fmt(s.a, Math.abs(s.a) < 100 && s.a % 1 ? 2 : s.a % 1 ? 2 : 0) + " · " : ""}${esc(s.how)}</span>` : ""}</div>`; }).join("")}</div>
      <div class="row"><button class="btn pri sm" id="cs-chk">Prüfen</button><button class="btn ghost sm" id="cs-how">Rechenwege zeigen</button></div>
      ${c.steps.every((s, j) => res[ci + "-" + j] !== undefined) ? `<div class="why"><b>Ergebnis & Interpretation</b><div>${esc(c.concl)}</div></div>` : ""}
      <small class="faint">Toleranz: Rundung. Dezimaltrennzeichen Komma oder Punkt.</small></div>`;
    $$("[data-k]", el).forEach(i => i.oninput = () => { vals[i.dataset.k] = i.value; });
    $("#cs-chk", el).onclick = () => { let ok = 0; c.steps.forEach((s, j) => { const k = ci + "-" + j; const v = parseNum(vals[k]); res[k] = isFinite(v) && Math.abs(v - s.a) <= s.tol; if (res[k]) ok++; }); App.rec(topicOf(b, l), ok / c.steps.length); if (ok === c.steps.length && done("case-" + b.set + ci)) { App.addXP(20, "case", el); } if (["stat", "dyn"].every(st => App.CBY.bwl2.cases[st].every((_, i) => S().widgets["case-" + st + i]))) App.unlock("invest"); draw(); };
    $("#cs-how", el).onclick = () => { c.steps.forEach((s, j) => shown[ci + "-" + j] = true); draw(); };
  };
  el.onclick = e => { const x = e.target.closest("[data-ci]"); if (x) { ci = +x.dataset.ci; draw(); } };
  draw();
};

W.breakeven = el => {
  let F = 300000, p = 5, kv = 2.5, cap = 200000;
  const draw = () => {
    const db = p - kv, be = db > 0 ? F / db : Infinity, maxX = cap, maxY = Math.max(p * maxX, F + kv * maxX), W_ = 540, H = 250;
    const X = q => 50 + q / maxX * 470, Y = v => 215 - v / maxY * 195;
    el.innerHTML = `<div class="w">${head("Break-Even-Diagramm", "Interaktiv")}
      <svg viewBox="0 0 ${W_} ${H}" class="chart" style="width:100%;max-width:640px">
        ${[0, .25, .5, .75, 1].map(f => `<line class="gridl" x1="50" x2="520" y1="${Y(maxY * f)}" y2="${Y(maxY * f)}"/><text x="46" y="${Y(maxY * f) + 4}" text-anchor="end">${fmt(maxY * f / 1000, 0)}k</text>`).join("")}
        <line x1="${X(0)}" y1="${Y(F)}" x2="${X(maxX)}" y2="${Y(F)}" stroke="var(--warn)" stroke-dasharray="5 4"/>
        <line x1="${X(0)}" y1="${Y(F)}" x2="${X(maxX)}" y2="${Y(F + kv * maxX)}" stroke="var(--bad)" stroke-width="2.5"/>
        <line x1="${X(0)}" y1="${Y(0)}" x2="${X(maxX)}" y2="${Y(p * maxX)}" stroke="var(--acc)" stroke-width="2.5"/>
        ${isFinite(be) && be <= maxX ? `<circle cx="${X(be)}" cy="${Y(p * be)}" r="6" fill="var(--info)"/><line x1="${X(be)}" x2="${X(be)}" y1="${Y(p * be)}" y2="215" stroke="var(--info)" stroke-dasharray="3 3"/><text x="${X(be)}" y="232" text-anchor="middle" style="fill:var(--info)">BEP ${fmt(be, 0)}</text>` : ""}
        <text x="520" y="${Y(p * maxX) + 14}" text-anchor="end">Erlöse</text><text x="520" y="${Y(F + kv * maxX) - 6}" text-anchor="end">Kosten</text><text x="56" y="${Y(F) - 6}">Fixkosten</text></svg>
      <div class="grid g2"><label class="fld">Fixkosten/Jahr <b class="tab">€ ${fmt(F, 0)}</b><input type="range" id="be-f" min="0" max="600000" step="10000" value="${F}"></label><label class="fld">Preis <b class="tab">€ ${fmt(p)}</b><input type="range" id="be-p" min="1" max="10" step="0.1" value="${p}"></label><label class="fld">var. Stückkosten <b class="tab">€ ${fmt(kv)}</b><input type="range" id="be-v" min="0" max="9" step="0.1" value="${kv}"></label><label class="fld">Kapazität <b class="tab">${fmt(cap, 0)}</b><input type="range" id="be-c" min="50000" max="400000" step="10000" value="${cap}"></label></div>
      <div class="res-grid"><div class="stat"><span>DB je Stück</span><b class="tab">€ ${fmt(db)}</b></div><div class="stat"><span>Break-Even-Menge</span><b class="tab">${isFinite(be) ? fmt(be, 0) : "–"}</b></div><div class="stat"><span>Gewinn bei Kapazität</span><b class="tab">€ ${fmt(db * cap - F, 0)}</b></div></div>
      <small class="muted">Vorbelegt mit der Tausendschön GmbH (Übung 4, Bsp. 2).</small></div>`;
    [["be-f", v => F = v], ["be-p", v => p = v], ["be-v", v => kv = v], ["be-c", v => cap = v]].forEach(([id, set]) => { $("#" + id, el).oninput = e => { set(+e.target.value); draw(); $("#" + id, el).focus(); }; });
  };
  draw();
};

const npv = (cf, i) => cf.reduce((s, v, t) => s + v / Math.pow(1 + i, t), 0);
function irr(cf) { let lo = -0.99, hi = 1; if (npv(cf, lo) * npv(cf, hi) > 0) { hi = 10; if (npv(cf, lo) * npv(cf, hi) > 0) return NaN; } for (let k = 0; k < 200; k++) { const m = (lo + hi) / 2; if (npv(cf, lo) * npv(cf, m) <= 0) hi = m; else lo = m; } return (lo + hi) / 2; }
App.fin = { npv, irr };
W.npv = (el, b, l) => {
  let cf = [-200000, 60000, 60000, 60000, 60000, 60000, 60000, 70000], i = 0.10;
  const draw = () => {
    const kw = npv(cf, i), n = cf.length - 1, ann = kw * i / (1 - Math.pow(1 + i, -n)), r = irr(cf);
    const pts = Array.from({ length: 41 }, (_, k) => { const z = k * 0.01; return [z, npv(cf, z)]; }); const ys = pts.map(p => p[1]); const ymax = Math.max(...ys, 0), ymin = Math.min(...ys, 0);
    const X = z => 50 + z / 0.4 * 460, Y = v => 20 + (ymax - v) / (ymax - ymin || 1) * 180;
    el.innerHTML = `<div class="w">${head("Kapitalwert, Annuität, interner Zinsfuß", "Rechner")}
      <div class="table-wrap"><table class="dt"><thead><tr><th>t</th>${cf.map((_, t) => `<th>${t}</th>`).join("")}<th></th></tr></thead><tbody><tr><td>Zahlung</td>${cf.map((v, t) => `<td><input type="text" inputmode="decimal" data-t="${t}" value="${String(v).replace(".", ",")}" style="width:92px;text-align:right;padding:4px 6px"></td>`).join("")}<td><button class="btn sm" id="np-add">+</button> <button class="btn sm" id="np-del" ${cf.length <= 2 ? "disabled" : ""}>−</button></td></tr>
        <tr><td>Barwert</td>${cf.map((v, t) => `<td>${fmt(v / Math.pow(1 + i, t), 0)}</td>`).join("")}<td></td></tr></tbody></table></div>
      <label class="fld">Kalkulationszinssatz <b class="tab">${fmt(i * 100, 1)} %</b><input type="range" id="np-i" min="0" max="0.4" step="0.005" value="${i}"></label>
      <div class="res-grid"><div class="stat"><span>Kapitalwert</span><b class="tab" style="color:${kw >= 0 ? "var(--acc)" : "var(--bad)"}">€ ${fmt(kw)}</b></div><div class="stat"><span>Annuität</span><b class="tab">€ ${fmt(ann)}</b></div><div class="stat"><span>Interner Zinsfuß (exakt)</span><b class="tab">${isFinite(r) ? fmt(r * 100, 2) + " %" : "–"}</b></div></div>
      <svg viewBox="0 0 530 230" class="chart" style="width:100%;max-width:640px"><line class="gridl" x1="50" x2="510" y1="${Y(0)}" y2="${Y(0)}" style="stroke:var(--muted)"/>${[0, 0.1, 0.2, 0.3, 0.4].map(z => `<text x="${X(z)}" y="222" text-anchor="middle">${z * 100} %</text>`).join("")}<path d="M${pts.map(p => X(p[0]) + " " + Y(p[1])).join("L")}" fill="none" stroke="var(--acc)" stroke-width="2.5"/><circle cx="${X(i)}" cy="${Y(kw)}" r="5" fill="var(--info)"/>${isFinite(r) && r <= 0.4 && r >= 0 ? `<circle cx="${X(r)}" cy="${Y(0)}" r="5" fill="var(--warn)"/><text x="${X(r)}" y="${Y(0) - 8}" text-anchor="middle" style="fill:var(--warn)">IZF</text>` : ""}<text x="54" y="16">KW</text></svg>
      <div class="row" style="gap:6px"><span class="eyebrow">Beispiele</span><button class="chip" data-ex="b4">Bsp. 4</button><button class="chip" data-ex="m1">Bsp. 5 M1</button><button class="chip" data-ex="m2">Bsp. 5 M2</button><button class="chip" data-ex="i1">Bsp. 6 M I</button><button class="chip" data-ex="i2">Bsp. 6 M II</button><button class="chip" data-ex="f">Folie 202 A</button></div>
      <small class="muted">Die Kurve zeigt: steigt der Zins, sinkt der KW (Sensitivitätsanalyse). Wo sie die Null-Linie schneidet, liegt der IZF. In der Klausur: Excel-Zielwertsuche wie in Zielwertsuche.xlsx.</small></div>`;
    $$("[data-t]", el).forEach(inp => inp.onchange = () => { cf[+inp.dataset.t] = parseNum(inp.value) || 0; draw(); });
    $("#np-i", el).oninput = e => { i = +e.target.value; draw(); $("#np-i", el).focus(); };
    $("#np-add", el).onclick = () => { cf.push(0); draw(); }; $("#np-del", el).onclick = () => { cf.pop(); draw(); };
  };
  const EX = { b4: [[-200000, 60000, 60000, 60000, 60000, 60000, 60000, 70000], .10], m1: [[-10000, 2000, 3000, 3000, 3500, 3000], .08], m2: [[-10000, 2500, 3500, 3000, 4500], .08], i1: [[-90000, 15000, 21000, 17000, 25000, 25000, 30000], .06], i2: [[-90000, 20000, 25000, 30000, 20000, 9000, 13000], .06], f: [[-40000, 7000, 40700], .07] };
  el.onclick = e => { const x = e.target.closest("[data-ex]"); if (x) { cf = EX[x.dataset.ex][0].slice(); i = EX[x.dataset.ex][1]; draw(); if (done("npv-" + x.dataset.ex)) App.rec(topicOf(b, l), 0.6); } };
  draw();
};
})();
