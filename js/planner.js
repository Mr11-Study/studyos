/* StudyOS v2 planner: calendar, events, tasks, study plans, notifications, ICS */
(function () {
const { $, $$, esc, PAGES, CBY, COURSES, TOPICS, dkey, today, fmtDate, daysUntil } = App;
const S = () => App.S();
const TYPES = { exam: ["Prüfung", "var(--bad)"], deadline: ["Abgabe", "var(--warn)"], register: ["Anmeldung", "var(--info)"], class: ["LV-Termin", "var(--violet)"], study: ["Lernblock", "var(--acc)"], info: ["Info", "var(--muted)"], other: ["Sonstiges", "var(--muted)"] };
App.EV_TYPES = TYPES;
const addDays = (k, n) => { const d = new Date(k + "T12:00:00"); d.setDate(d.getDate() + n); return dkey(d); };

/* ---------------- events model ---------------- */
function courseEvents() {
  const out = [];
  COURSES.forEach(c => (c.events || []).forEach(e => { const ov = S().eventOv[e.id] || {}; if (ov.hidden) return; out.push(Object.assign({ course: c.id, src: "course" }, e, ov)); }));
  return out;
}
function userEvents() { return (S().events || []).map(e => Object.assign({ src: "user" }, e)); }
function planEvents() {
  const out = []; Object.entries(S().plans || {}).forEach(([pid, p]) => (p.blocks || []).forEach((b, i) => out.push({ id: pid + "#" + i, planId: pid, idx: i, title: (b.kind === "exam" ? "Probeprüfung" : b.kind === "work" ? "Arbeitsblock" : "Lernen") + ": " + (b.label || (TOPICS[b.topic] ? TOPICS[b.topic].name : "")), type: "study", course: p.course, date: b.date, time: p.time || null, min: b.min, done: b.done, src: "plan", topic: b.topic, kind: b.kind })));
  return out;
}
function expand(e, from, to) {
  if (!e.date) return [];
  if (e.repeat !== "weekly") return e.date >= from && e.date <= to ? [e] : [];
  const out = []; let k = e.date; const end = e.until && e.until < to ? e.until : to;
  while (k <= end) { if (k >= from && !(e.skip || []).includes(k)) out.push(Object.assign({}, e, { date: k, occ: true })); k = addDays(k, 7); }
  return out;
}
function eventsBetween(from, to, withPlan = true) {
  return courseEvents().concat(userEvents()).flatMap(e => expand(e, from, to)).concat(withPlan ? planEvents().filter(e => e.date >= from && e.date <= to) : [])
    .sort((a, b) => (a.date + (a.time || "99")).localeCompare(b.date + (b.time || "99")));
}
App.eventsBetween = eventsBetween;
const undated = () => courseEvents().filter(e => !e.date && !e.done);
App.nextExam = () => eventsBetween(today(), addDays(today(), 400), false).find(e => e.type === "exam" && !e.done) || null;
App.urgentCount = () => eventsBetween(addDays(today(), -30), addDays(today(), 2), false).filter(e => ["deadline", "exam", "register"].includes(e.type) && !e.done && !e.occ).length;
App.todayPlanBlocks = () => planEvents().filter(e => e.date === today()).map(e => Object.assign({ examTitle: (S().plans[e.planId] || {}).title || "" }, e));
function setEventProp(e, props) {
  if (e.src === "course") { S().eventOv[e.id] = Object.assign(S().eventOv[e.id] || {}, props); }
  else if (e.src === "user") { const u = S().events.find(x => x.id === e.id); if (u) Object.assign(u, props); }
  else if (e.src === "plan") { const p = S().plans[e.planId]; if (p) Object.assign(p.blocks[e.idx], props); }
  App.save(); App.syncReminders();
}
App.setEventDate = (id, date, time) => { const e = courseEvents().find(x => x.id === id); if (e) setEventProp(e, Object.assign({ date }, time ? { time } : {})); };
function toggleDone(e) {
  const v = !e.done; setEventProp(e, { done: v, doneAt: v ? Date.now() : null });
  if (v) { App.addXP(e.src === "plan" ? 15 : 10, "task"); if (e.type === "deadline" && e.date && daysUntil(e.date) > 3) App.unlock("early"); }
}

/* ---------------- tasks ---------------- */
function allTasks() {
  const out = []; COURSES.forEach(c => (c.tasks || []).forEach(t => { const st = S().tasks[t.id] || {}; out.push(Object.assign({ course: c.id, src: "course" }, t, st)); }));
  (S().userTasks || []).forEach(t => out.push(Object.assign({ src: "user" }, t)));
  return out;
}
function setTask(t, props) { if (t.src === "course") S().tasks[t.id] = Object.assign(S().tasks[t.id] || {}, props); else Object.assign(S().userTasks.find(x => x.id === t.id), props); App.save(); App.syncReminders(); }

/* ---------------- event card ---------------- */
const color = e => e.course && CBY[e.course] ? CBY[e.course].color : TYPES[e.type] ? TYPES[e.type][1] : "var(--muted)";
function gcalLink(e) {
  const d = e.date.replace(/-/g, ""); let dates;
  if (e.time) { const [h, m] = e.time.split(":").map(Number); const st = new Date(e.date + "T" + e.time + ":00"); const en = new Date(st.getTime() + (e.min || 60) * 60000); const f = x => x.getFullYear() + String(x.getMonth() + 1).padStart(2, "0") + String(x.getDate()).padStart(2, "0") + "T" + String(x.getHours()).padStart(2, "0") + String(x.getMinutes()).padStart(2, "0") + "00"; dates = f(st) + "/" + f(en); void h; void m; }
  else dates = d + "/" + addDays(e.date, 1).replace(/-/g, "");
  return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(e.title) + "&dates=" + dates + "&details=" + encodeURIComponent((e.note || "") + "\n\n– StudyOS") + "&ctz=Europe/Vienna";
}
function agendaItem(e, opts = {}) {
  const du = daysUntil(e.date), over = du < 0 && !e.done && e.type !== "study" && e.type !== "class" && e.type !== "info";
  const d = new Date(e.date + "T12:00:00");
  return `<div class="agenda-item ${e.done ? "done" : ""} ${over ? "over" : ""}" style="--c:${color(e)}">
    <div class="ad"><b>${d.getDate()}</b><small class="muted">${d.toLocaleDateString("de-AT", { month: "short" })}</small></div>
    <div style="min-width:0"><div class="row" style="gap:6px"><span class="type-pill ${e.type}">${TYPES[e.type] ? TYPES[e.type][0] : e.type}</span>${e.course && CBY[e.course] ? `<small class="muted">${esc(CBY[e.course].title)}</small>` : ""}<small class="tab ${over ? "" : "muted"}" style="${over ? "color:var(--bad)" : ""}">${du === 0 ? "heute" : du === 1 ? "morgen" : du < 0 ? "vor " + (-du) + " Tagen" : "in " + du + " Tagen"}${e.time ? " · " + e.time : ""}</small></div>
      <div style="margin-top:3px;${e.done ? "text-decoration:line-through" : ""}">${esc(e.title)}</div>${e.note && !opts.compact ? `<small class="muted">${esc(e.note)}</small>` : ""}</div>
    <div class="row" style="gap:6px;flex-wrap:nowrap">${e.src === "plan" && e.topic && !e.done ? `<button class="btn sm" data-go="${e.kind === "exam" ? "exam" : "lesson"}" data-p="${e.kind === "exam" ? "" : TOPICS[e.topic] ? TOPICS[e.topic].lesson : ""}">Start</button>` : ""}${e.type !== "info" ? `<button class="btn sm ${e.done ? "" : "ghost"}" data-done="${esc(e.src)}|${esc(e.id)}|${e.date}" title="Erledigt">${e.done ? "✓" : "○"}</button>` : ""}${!opts.compact ? `<button class="btn ghost sm" data-edit="${esc(e.src)}|${esc(e.id)}" title="Bearbeiten">✎</button>` : ""}</div></div>`;
}
function findEvent(src, id) { if (src === "course") return courseEvents().find(e => e.id === id); if (src === "user") return userEvents().find(e => e.id === id); return planEvents().find(e => e.id === id); }
function wireAgenda(root, rerender) {
  root.addEventListener("click", e => {
    const d = e.target.closest("[data-done]"); if (d) { const [src, id] = d.dataset.done.split("|"); const ev = findEvent(src, id); if (ev) { toggleDone(ev); rerender(); } return; }
    const ed = e.target.closest("[data-edit]"); if (ed) { const [src, id] = ed.dataset.edit.split("|"); const ev = findEvent(src, id); if (ev) eventForm(ev, rerender); }
  });
}

/* ---------------- event form ---------------- */
function eventForm(ev, onDone, preset = {}) {
  const isNew = !ev; ev = ev || Object.assign({ src: "user", id: "u" + Date.now(), title: "", type: "exam", course: S().course, date: today(), time: "", note: "", repeat: "none", until: "" }, preset);
  const ro = ev.src === "course", plan = ev.src === "plan";
  App.modal(`<div class="spread"><h2>${isNew ? "Neuer Termin" : "Termin bearbeiten"}</h2><button class="btn ghost sm" data-close>✕</button></div>
    <label class="fld">Titel<input type="text" id="ef-title" value="${esc(ev.title)}" ${ro || plan ? "disabled" : ""} placeholder="z. B. BWL 2 Klausur, Anmeldung Prüfung …"></label>
    <div class="grid g2"><label class="fld">Art<select id="ef-type" ${ro || plan ? "disabled" : ""}>${Object.entries(TYPES).map(([k, v]) => `<option value="${k}" ${ev.type === k ? "selected" : ""}>${v[0]}</option>`).join("")}</select></label>
      <label class="fld">Kurs<select id="ef-course" ${ro || plan ? "disabled" : ""}><option value="">–</option>${COURSES.map(c => `<option value="${c.id}" ${ev.course === c.id ? "selected" : ""}>${esc(c.title)}</option>`).join("")}</select></label></div>
    <div class="grid g2"><label class="fld">Datum<input type="date" id="ef-date" value="${esc(ev.date || "")}"></label><label class="fld">Uhrzeit (optional)<input type="time" id="ef-time" value="${esc(ev.time || "")}"></label></div>
    ${!ro && !plan ? `<div class="grid g2"><label class="fld">Wiederholung<select id="ef-rep"><option value="none">keine</option><option value="weekly" ${ev.repeat === "weekly" ? "selected" : ""}>wöchentlich (z. B. LV)</option></select></label><label class="fld">bis (optional)<input type="date" id="ef-until" value="${esc(ev.until || "")}"></label></div>` : ""}
    <label class="fld">Notiz<textarea rows="3" id="ef-note" ${ro ? "disabled" : ""}>${esc(ev.note || "")}</textarea></label>
    ${ev.date ? `<a class="btn ghost sm" href="${gcalLink(ev)}" target="_blank" rel="noopener">In Google Kalender übernehmen ↗</a>` : ""}
    <div class="spread"><div class="row">${!isNew && ev.src !== "plan" ? `<button class="btn danger sm" id="ef-del">${ro ? "Ausblenden" : "Löschen"}</button>` : ""}</div><div class="row"><button class="btn ghost" data-close>Abbrechen</button><button class="btn pri" id="ef-save">Speichern</button></div></div>`, (m, close) => {
    $("#ef-save", m).onclick = () => {
      const date = $("#ef-date", m).value, time = $("#ef-time", m).value;
      if (ro) { setEventProp(ev, { date, time }); }
      else if (plan) { setEventProp(ev, { date }); }
      else { const t = $("#ef-title", m).value.trim(); if (!t) { $("#ef-title", m).focus(); return; }
        const obj = { id: ev.id, title: t, type: $("#ef-type", m).value, course: $("#ef-course", m).value || null, date, time, note: $("#ef-note", m).value, repeat: $("#ef-rep", m).value, until: $("#ef-until", m).value };
        const i = S().events.findIndex(x => x.id === ev.id); if (i >= 0) S().events[i] = Object.assign(S().events[i], obj); else S().events.push(obj); App.save(); App.syncReminders(); }
      close(); onDone && onDone(); App.renderSide(); };
    const del = $("#ef-del", m); if (del) del.onclick = () => { if (ro) setEventProp(ev, { hidden: true }); else { S().events = S().events.filter(x => x.id !== ev.id); App.save(); } close(); onDone && onDone(); };
  });
}
App.eventForm = eventForm;

/* ---------------- dashboard: today card ---------------- */
App.renderTodayTodo = box => {
  const t = today(), list = eventsBetween(addDays(t, -30), addDays(t, 7)).filter(e => !(e.done && e.date < t) && !(e.type === "info" && e.date < t) && !(e.type === "class" && e.date !== t) && !(e.src === "plan" && e.date !== t));
  const over = list.filter(e => e.date < t && !e.done && ["deadline", "exam", "register"].includes(e.type)), tod = list.filter(e => e.date === t), soon = list.filter(e => e.date > t);
  const miss = undated().filter(e => e.type === "exam");
  const draw = () => {
    box.innerHTML = `<div class="card col" style="gap:12px"><div class="spread"><h3>Heute zu tun</h3><div class="row"><button class="btn ghost sm" data-go="calendar">Kalender</button><button class="btn sm" id="tt-add">+ Termin</button></div></div>
      ${over.length ? `<div class="col" style="gap:8px"><span class="eyebrow" style="color:var(--bad)">Überfällig</span>${over.map(e => agendaItem(e, { compact: true })).join("")}</div>` : ""}
      ${tod.length ? `<div class="col" style="gap:8px"><span class="eyebrow">Heute</span>${tod.map(e => agendaItem(e, { compact: true })).join("")}</div>` : `<p class="muted" style="font-size:14px">Heute keine festen Termine.${App.todayPlanBlocks().length ? "" : " Leg dir einen Lernplan an, dann stehen hier deine Lernblöcke."}</p>`}
      ${soon.length ? `<div class="col" style="gap:8px"><span class="eyebrow">Nächste 7 Tage</span>${soon.slice(0, 5).map(e => agendaItem(e, { compact: true })).join("")}</div>` : ""}
      ${miss.length ? `<div class="callout" style="font-size:13px"><b>${miss.length} Prüfungstermin${miss.length > 1 ? "e fehlen" : " fehlt"}:</b> ${miss.map(e => esc(e.title)).join(" · ")}. <button class="btn sm" data-go="calendar" style="margin-left:6px">Eintragen</button></div>` : ""}
      ${!S().notify.enabled ? `<div class="row" style="gap:8px"><small class="muted">Erinnerungen sind aus.</small><button class="btn ghost sm" id="tt-notif">Benachrichtigungen einschalten</button></div>` : ""}</div>`;
    $("#tt-add", box).onclick = () => eventForm(null, () => App.render());
    const n = $("#tt-notif", box); if (n) n.onclick = () => App.enableNotifications();
  };
  wireAgenda(box, () => App.render()); draw();
};
App.renderCourseEvents = (box, cid) => {
  const ev = courseEvents().filter(e => e.course === cid).concat(userEvents().filter(e => e.course === cid)).sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
  const tasks = allTasks().filter(t => t.course === cid);
  box.innerHTML = `<div class="spread"><h3>Termine & Aufgaben</h3><button class="btn sm" id="ce-add">+ Termin</button></div>
    ${ev.map(e => e.date ? agendaItem(e, { compact: true }) : `<div class="agenda-item" style="--c:${color(e)}"><div class="ad"><b>?</b></div><div><span class="type-pill ${e.type}">${TYPES[e.type][0]}</span><div>${esc(e.title)}</div><small class="muted">${esc(e.note || "")}</small></div><div><button class="btn sm pri" data-edit="${e.src}|${esc(e.id)}">Datum eintragen</button></div></div>`).join("") || `<p class="muted">Keine Termine.</p>`}
    ${tasks.length ? `<div class="divider"></div><span class="eyebrow">Moodle-Aufgaben</span>${tasks.map(t => `<label class="todo ${t.done ? "done" : ""}"><input type="checkbox" data-task="${esc(t.src)}|${esc(t.id)}" ${t.done ? "checked" : ""}><div><div class="tt">${esc(t.title)}</div>${t.note ? `<small class="muted">${esc(t.note)}</small>` : ""}</div><small class="tab muted">${t.due ? fmtDate(t.due) : ""}</small></label>`).join("")}` : ""}`;
  $("#ce-add", box).onclick = () => eventForm(null, () => App.render(), { course: cid });
  wireAgenda(box, () => App.render());
  box.addEventListener("change", e => { const c = e.target.closest("[data-task]"); if (!c) return; const [src, id] = c.dataset.task.split("|"); const t = allTasks().find(x => x.src === src && x.id === id); setTask(t, { done: c.checked }); if (c.checked) App.addXP(10, "task", c); App.render(); });
};

/* ---------------- calendar page ---------------- */
PAGES.calendar = el => {
  let view = new Date(); view.setDate(1); if (App.route().p && /^\d{4}-\d{2}/.test(App.route().p)) view = new Date(App.route().p + "-01T12:00:00");
  const draw = () => {
    const y = view.getFullYear(), m = view.getMonth(), first = new Date(y, m, 1), start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7));
    const cells = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
    const from = dkey(cells[0]), to = dkey(cells[41]), evs = eventsBetween(from, to), by = {}; evs.forEach(e => (by[e.date] = by[e.date] || []).push(e));
    const agenda = eventsBetween(today(), addDays(today(), 60)).filter(e => e.type !== "class" || daysUntil(e.date) < 8), miss = undated();
    el.innerHTML = `<div class="page"><div class="spread"><div><h1>Kalender</h1><p class="muted" style="margin-top:6px">Abgaben, Prüfungen, Anmeldungen, LV-Termine und deine Lernblöcke an einem Ort.</p></div>
      <div class="row"><button class="btn" id="cal-ics">⤓ Export (.ics)</button><button class="btn" id="cal-notif">${S().notify.enabled ? "🔔 Erinnerungen an" : "🔕 Erinnerungen"}</button><button class="btn pri" id="cal-add">+ Termin</button></div></div>
      ${miss.length ? `<div class="card col" style="border-color:var(--warn)"><h3>Fehlende Termine</h3><p class="muted" style="font-size:14px">Diese Termine sind aus den Moodle-Infos bekannt, aber noch ohne Datum. Trag sie ein, sobald du sie weißt (Prüfungsanmeldung!).</p>${miss.map(e => `<div class="spread" style="padding:6px 0;border-top:1px solid var(--line)"><div><span class="type-pill ${e.type}">${TYPES[e.type][0]}</span> ${esc(e.title)}<div><small class="muted">${esc(e.note || "")}</small></div></div><div class="row" style="gap:6px;flex-wrap:nowrap"><input type="date" data-setdate="${esc(e.id)}" style="width:150px"><input type="time" data-settime="${esc(e.id)}" style="width:110px"></div></div>`).join("")}</div>` : ""}
      <div class="grid" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:16px" id="cal-grid">
       <div class="card col"><div class="spread"><button class="btn ghost sm" id="cal-prev">←</button><h3>${view.toLocaleDateString("de-AT", { month: "long", year: "numeric" })}</h3><div class="row"><button class="btn ghost sm" id="cal-today">Heute</button><button class="btn ghost sm" id="cal-next">→</button></div></div>
        <div class="cal">${["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(d => `<div class="dh">${d}</div>`).join("")}${cells.map(d => { const k = dkey(d), es = by[k] || []; return `<div class="dc ${d.getMonth() !== m ? "out" : ""} ${k === today() ? "today" : ""}" data-day="${k}"><span class="dn">${d.getDate()}</span>${es.slice(0, 3).map(e => `<div class="ev" style="--c:${TYPES[e.type] ? TYPES[e.type][1] : color(e)}" title="${esc(e.title)}">${esc(e.title)}</div>`).join("")}${es.length > 3 ? `<small class="faint">+${es.length - 3}</small>` : ""}</div>`; }).join("")}</div>
        <div class="row" style="gap:10px;font-size:12px">${Object.entries(TYPES).slice(0, 5).map(([k, v]) => `<span class="row" style="gap:4px"><span class="dot" style="--c:${v[1]}"></span>${v[0]}</span>`).join("")}</div></div>
       <div class="col" style="gap:8px"><h3>Nächste 60 Tage</h3><div class="col" style="gap:8px" id="agenda">${agenda.length ? agenda.map(e => agendaItem(e)).join("") : `<div class="empty">Keine Termine.</div>`}</div></div></div></div>`;
    $("#cal-prev", el).onclick = () => { view.setMonth(view.getMonth() - 1); draw(); }; $("#cal-next", el).onclick = () => { view.setMonth(view.getMonth() + 1); draw(); }; $("#cal-today", el).onclick = () => { view = new Date(); view.setDate(1); draw(); };
    $("#cal-add", el).onclick = () => eventForm(null, draw); $("#cal-ics", el).onclick = () => exportICS(); $("#cal-notif", el).onclick = () => App.notifySettings();
    $$("[data-setdate]", el).forEach(i => i.onchange = () => { const t = $(`[data-settime="${i.dataset.setdate}"]`, el).value; App.setEventDate(i.dataset.setdate, i.value, t); App.toast("Termin eingetragen", "Erinnerungen sind geplant.", "▦"); draw(); App.renderSide(); });
    if (window.innerWidth < 1000) $("#cal-grid", el).style.gridTemplateColumns = "minmax(0,1fr)";
  };
  el.addEventListener("click", e => { const d = e.target.closest("[data-day]"); if (!d) return; const k = d.dataset.day, es = eventsBetween(k, k);
    App.modal(`<div class="spread"><h2>${fmtDate(k, { weekday: "long", day: "numeric", month: "long" })}</h2><button class="btn ghost sm" data-close>✕</button></div><div class="col" style="gap:8px" id="dm">${es.map(x => agendaItem(x)).join("") || `<p class="muted">Keine Termine.</p>`}</div><button class="btn pri" id="dm-add">+ Termin an diesem Tag</button>`, (m, close) => { $("#dm-add", m).onclick = () => { close(); eventForm(null, draw, { date: k }); }; wireAgenda(m, () => { close(); draw(); }); }); });
  wireAgenda(el, () => draw());
  draw();
};

/* ---------------- tasks & plans page ---------------- */
const SUGGEST_H = { bwl2: 29, dasc: 20, eng3: 10, kommu: 6 };
PAGES.plan = (el, p) => {
  let tab = p && p.startsWith("mk:") ? "plans" : "tasks";
  const draw = () => {
    const tasks = allTasks(), open = tasks.filter(t => !t.done), deadlines = eventsBetween(today(), addDays(today(), 400), false).filter(e => e.type === "deadline" && !e.done);
    el.innerHTML = `<div class="page"><div class="spread"><div><h1>Aufgaben & Lernplan</h1><p class="muted" style="margin-top:6px">StudyOS sagt dir, was wann zu tun ist. Lernpläne verteilen den Stoff bis zur Prüfung auf Lernblöcke.</p></div></div>
      <div class="row" style="gap:6px"><button class="chip ${tab === "tasks" ? "on" : ""}" data-tab="tasks">Aufgaben (${open.length})</button><button class="chip ${tab === "plans" ? "on" : ""}" data-tab="plans">Lernpläne (${Object.keys(S().plans).length})</button><button class="chip ${tab === "dl" ? "on" : ""}" data-tab="dl">Abgaben (${deadlines.length})</button></div>
      <div id="tab"></div></div>`;
    const box = $("#tab", el);
    if (tab === "tasks") {
      box.innerHTML = `<div class="card col"><form id="nt" class="grid g3" style="align-items:end"><label class="fld">Neue Aufgabe<input type="text" id="nt-t" placeholder="z. B. Mindmap für Homegroup posten"></label><label class="fld">Kurs<select id="nt-c">${COURSES.map(c => `<option value="${c.id}" ${c.id === S().course ? "selected" : ""}>${esc(c.title)}</option>`).join("")}</select></label><div class="row"><label class="fld" style="flex:1">Fällig<input type="date" id="nt-d"></label><button class="btn pri" type="submit">+</button></div></form></div>
        ${COURSES.map(c => { const ts = tasks.filter(t => t.course === c.id).sort((a, b) => (a.done - b.done) || (a.due || "9").localeCompare(b.due || "9")); if (!ts.length) return ""; return `<div class="card col"><div class="spread"><h3><span class="dot" style="--c:${c.color}"></span> ${esc(c.title)}</h3><small class="muted">${ts.filter(t => t.done).length}/${ts.length} erledigt</small></div>${ts.map(t => `<div class="todo ${t.done ? "done" : ""}"><input type="checkbox" data-task="${esc(t.src)}|${esc(t.id)}" ${t.done ? "checked" : ""} aria-label="erledigt"><div><div class="tt">${esc(t.title)}</div>${t.note ? `<small class="muted">${esc(t.note)}</small>` : ""}</div><div class="row" style="gap:6px;flex-wrap:nowrap"><input type="date" value="${esc(t.due || "")}" data-due="${esc(t.src)}|${esc(t.id)}" style="width:140px;padding:4px 6px" aria-label="Fälligkeit">${t.src === "user" ? `<button class="btn ghost sm" data-deltask="${esc(t.id)}">✕</button>` : ""}</div></div>`).join("")}</div>`; }).join("")}`;
      $("#nt", box).onsubmit = e => { e.preventDefault(); const t = $("#nt-t", box).value.trim(); if (!t) return; S().userTasks.push({ id: "t" + Date.now(), title: t, course: $("#nt-c", box).value, due: $("#nt-d", box).value, done: false }); App.save(); App.syncReminders(); draw(); };
      box.onchange = e => { const c = e.target.closest("[data-task]"), d = e.target.closest("[data-due]"); if (c) { const [src, id] = c.dataset.task.split("|"); setTask(tasks.find(x => x.src === src && x.id === id), { done: c.checked, doneAt: c.checked ? Date.now() : null }); if (c.checked) App.addXP(10, "task", c); draw(); } if (d) { const [src, id] = d.dataset.due.split("|"); setTask(tasks.find(x => x.src === src && x.id === id), { due: d.value }); } };
      box.onclick = e => { const x = e.target.closest("[data-deltask]"); if (x) { S().userTasks = S().userTasks.filter(t => t.id !== x.dataset.deltask); App.save(); draw(); } };
    } else if (tab === "plans") { plansTab(box, draw, p); p = null; }
    else {
      box.innerHTML = `<div class="col" style="gap:10px">${deadlines.map(e => `<div class="card col"><div class="spread"><div><span class="type-pill deadline">Abgabe</span> <b>${esc(e.title)}</b><div><small class="muted">${fmtDate(e.date, { weekday: "long", day: "numeric", month: "long" })} · in ${daysUntil(e.date)} Tagen</small></div></div>${S().plans["w:" + e.id] ? `<span class="chip acc">Arbeitsplan aktiv</span>` : `<button class="btn sm" data-wp="${esc(e.id)}">Arbeitsplan erstellen</button>`}</div>${e.note ? `<small class="muted">${esc(e.note)}</small>` : ""}</div>`).join("") || `<div class="empty">Keine offenen Abgaben mit Datum.</div>`}</div>`;
      box.onclick = e => { const x = e.target.closest("[data-wp]"); if (x) { const ev = deadlines.find(d => d.id === x.dataset.wp); workPlanForm(ev, draw); } };
    }
    $$("[data-tab]", el).forEach(b => b.onclick = () => { tab = b.dataset.tab; draw(); });
  };
  draw();
};
function plansTab(box, redraw, p) {
  const exams = eventsBetween(today(), addDays(today(), 400), false).filter(e => e.type === "exam" && !e.done);
  const plans = Object.entries(S().plans);
  box.innerHTML = `${exams.filter(e => !S().plans[e.id]).length ? `<div class="card col"><h3>Lernplan für eine Prüfung erstellen</h3>${exams.filter(e => !S().plans[e.id]).map(e => `<div class="spread" style="padding:6px 0;border-top:1px solid var(--line)"><div><b>${esc(e.title)}</b><div><small class="muted">${fmtDate(e.date)} · in ${daysUntil(e.date)} Tagen</small></div></div><button class="btn pri sm" data-mk="${esc(e.id)}">Plan erstellen</button></div>`).join("")}</div>` : exams.length ? "" : `<div class="card col"><p class="muted">Trag zuerst Prüfungstermine im Kalender ein (Art: Prüfung).</p><button class="btn sm" data-go="calendar">Zum Kalender</button></div>`}
    ${plans.map(([pid, pl]) => { const done = pl.blocks.filter(b => b.done).length, c = CBY[pl.course]; const up = pl.blocks.map((b, i) => Object.assign({ i }, b)).filter(b => !b.done).slice(0, 6);
      return `<div class="card col" style="border-top:3px solid ${c ? c.color : "var(--line)"}"><div class="spread"><div><h3>${esc(pl.title)}</h3><small class="muted">${pl.blocks.length} Blöcke à ${pl.min} min · ${pl.days.map(d => ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d]).join(", ")}${pl.time ? " · " + pl.time : ""}</small></div><div class="row"><span class="chip tab">${done}/${pl.blocks.length}</span><button class="btn ghost sm" data-delplan="${esc(pid)}">Löschen</button></div></div>
        ${App.bar(100 * done / (pl.blocks.length || 1), "", c ? c.color : null)}
        <div class="col" style="gap:6px">${up.map(b => `<div class="todo"><input type="checkbox" data-blk="${esc(pid)}|${b.i}"><div><div class="tt">${esc(b.kind === "exam" ? "Probeprüfung im Prüfungstrainer" : b.label || (TOPICS[b.topic] ? TOPICS[b.topic].name : ""))}</div><small class="muted">${fmtDate(b.date)} · ${b.min} min${b.topic && TOPICS[b.topic] ? " · Mastery " + App.mastery(b.topic) + " %" : ""}</small></div>${b.topic && TOPICS[b.topic] ? `<button class="btn sm" data-go="lesson" data-p="${TOPICS[b.topic].lesson}">Start</button>` : b.kind === "exam" ? `<button class="btn sm" data-go="exam">Start</button>` : "<span></span>"}</div>`).join("") || `<p class="okline">Alle Blöcke erledigt.</p>`}</div></div>`; }).join("")}`;
  box.onclick = e => { const mk = e.target.closest("[data-mk]"), del = e.target.closest("[data-delplan]"); if (mk) { studyPlanForm(exams.find(x => x.id === mk.dataset.mk), redraw); } if (del) { delete S().plans[del.dataset.delplan]; App.save(); App.syncReminders(); redraw(); } };
  box.onchange = e => { const b = e.target.closest("[data-blk]"); if (!b) return; const [pid, i] = b.dataset.blk.split("|"); S().plans[pid].blocks[+i].done = b.checked; App.save(); if (b.checked) App.addXP(15, "plan", b); redraw(); };
  if (p && p.startsWith("mk:")) { const ex = exams.find(x => x.id === p.slice(3)); if (ex) setTimeout(() => studyPlanForm(ex, redraw), 50); }
}
function planDays(from, to, days) { const out = []; let k = from; while (k < to) { if (days.includes(new Date(k + "T12:00:00").getDay())) out.push(k); k = addDays(k, 1); } return out; }
function studyPlanForm(ex, redraw) {
  const c = CBY[ex.course] || CBY[S().course];
  App.modal(`<div class="spread"><h2>Lernplan: ${esc(ex.title)}</h2><button class="btn ghost sm" data-close>✕</button></div>
    <p class="muted" style="font-size:14px">Prüfung am ${fmtDate(ex.date, { weekday: "long", day: "numeric", month: "long" })} (in ${daysUntil(ex.date)} Tagen). StudyOS verteilt die Themen von ${esc(c.title)} auf deine Lerntage, schwächste zuerst, und plant am Ende Probeprüfungen ein.</p>
    <div class="grid g2"><label class="fld">Lernzeit gesamt (Stunden)<input type="number" id="sp-h" min="1" value="${SUGGEST_H[c.id] || 10}"></label><label class="fld">Minuten pro Block<select id="sp-m"><option>30</option><option selected>45</option><option>60</option><option>90</option></select></label></div>
    <div class="grid g2"><label class="fld">Start<input type="date" id="sp-s" value="${today()}"></label><label class="fld">Erinnerung um<input type="time" id="sp-t" value="${S().notify.daily || "18:00"}"></label></div>
    <div><span class="eyebrow">Lerntage</span><div class="row" style="gap:6px;margin-top:6px">${[1, 2, 3, 4, 5, 6, 0].map(d => `<label class="chip"><input type="checkbox" data-wd="${d}" ${d >= 1 && d <= 5 ? "checked" : ""} style="accent-color:var(--acc)"> ${["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d]}</label>`).join("")}</div></div>
    ${c.id === "bwl2" ? `<small class="muted">Richtwert aus dem Workload: 29,4 h Klausurvorbereitung.</small>` : ""}
    <div id="sp-prev" class="muted" style="font-size:13px"></div>
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Abbrechen</button><button class="btn pri" id="sp-go">Plan erstellen</button></div>`, (m, close) => {
    const calc = () => { const days = $$("[data-wd]", m).filter(x => x.checked).map(x => +x.dataset.wd), min = +$("#sp-m", m).value, h = +$("#sp-h", m).value, avail = planDays($("#sp-s", m).value, ex.date, days); const need = Math.ceil(h * 60 / min); return { days, min, avail, need, perDay: Math.ceil(need / Math.max(1, avail.length)) }; };
    const prev = () => { const r = calc(); $("#sp-prev", m).innerHTML = r.avail.length ? `${r.need} Blöcke auf ${r.avail.length} Lerntage → ${r.perDay > 1 ? "<b style='color:var(--warn)'>" + r.perDay + " Blöcke pro Tag</b>" : "1 Block pro Tag"}.` : `<span style="color:var(--bad)">Keine Lerntage bis zur Prüfung.</span>`; };
    m.oninput = m.onchange = prev; prev();
    $("#sp-go", m).onclick = () => { const r = calc(); if (!r.avail.length) return;
      const topics = Object.keys(TOPICS).filter(t => TOPICS[t].course === c.id).sort((a, b) => App.mastery(a) - App.mastery(b));
      const blocks = []; let ti = 0; const nExam = Math.min(2, Math.max(1, Math.floor(r.need / 8)));
      const slots = []; r.avail.forEach(d => { for (let k = 0; k < r.perDay; k++) slots.push(d); });
      const use = slots.slice(0, r.need); use.forEach((d, i) => { if (i >= use.length - nExam) blocks.push({ date: d, min: r.min, kind: "exam", topic: topics[0], done: false }); else { blocks.push({ date: d, min: r.min, kind: "topic", topic: topics[ti % topics.length], done: false }); ti++; } });
      S().plans[ex.id] = { title: ex.title, course: c.id, exam: ex.date, min: r.min, days: r.days, time: $("#sp-t", m).value, blocks, created: Date.now() };
      App.unlock("planner"); App.save(); App.syncReminders(); close(); App.toast("Lernplan erstellt", blocks.length + " Lernblöcke im Kalender.", "▦"); redraw(); App.renderSide(); };
  });
}
function workPlanForm(ev, redraw) {
  App.modal(`<div class="spread"><h2>Arbeitsplan: ${esc(ev.title)}</h2><button class="btn ghost sm" data-close>✕</button></div>
    <p class="muted" style="font-size:14px">Abgabe am ${fmtDate(ev.date, { weekday: "long", day: "numeric", month: "long" })}. Teile die Arbeit in Blöcke auf und plane einen Puffer ein.</p>
    <label class="fld">Arbeitsschritte (eine Zeile pro Block)<textarea rows="5" id="wp-s">${esc(defaultSteps(ev))}</textarea></label>
    <div class="grid g2"><label class="fld">Puffer vor Deadline (Tage)<input type="number" id="wp-b" min="0" value="3"></label><label class="fld">Minuten pro Block<input type="number" id="wp-m" min="15" value="60"></label></div>
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Abbrechen</button><button class="btn pri" id="wp-go">Erstellen</button></div>`, (m, close) => {
    $("#wp-go", m).onclick = () => { const steps = $("#wp-s", m).value.split(/\n/).map(x => x.trim()).filter(Boolean), end = addDays(ev.date, -(+$("#wp-b", m).value || 0)); let start = today(); if (end <= start) start = addDays(ev.date, -Math.max(1, steps.length));
      const span = Math.max(1, daysUntil(end) - daysUntil(start)); const blocks = steps.map((s, i) => ({ date: addDays(start, Math.floor(i * span / steps.length)), min: +$("#wp-m", m).value || 60, kind: "work", label: s, done: false }));
      S().plans["w:" + ev.id] = { title: ev.title, course: ev.course, exam: ev.date, min: +$("#wp-m", m).value || 60, days: [0, 1, 2, 3, 4, 5, 6], blocks, created: Date.now() }; App.save(); App.syncReminders(); close(); App.toast("Arbeitsplan erstellt", blocks.length + " Blöcke im Kalender.", "▦"); redraw(); };
  });
}
function defaultSteps(ev) {
  if (/portfolio/i.test(ev.title)) return "Arbeitsauftrag 1 ausformulieren\nArbeitsauftrag 2 ausformulieren\nArbeitsauftrag 3 ausformulieren\nSelbstreflexion (8 Fragen, Wort „laufen“!)\nFeedback (5 Fragen)\nInhaltsverzeichnis, Kopf-/Fußzeile, Seitenzahlen, Rechtschreibung";
  if (/deep talk/i.test(ev.title)) return "Deep-Talk-Einträge vervollständigen\nGefühle/Bedürfnisse prüfen\nFinale Durchsicht und Upload";
  if (/trend/i.test(ev.title)) return "Datensatz wählen (Netflix oder OTT)\nGraph zeichnen\nBeschreibung beider Charts vorbereiten (ohne KI)\nAufnahme üben (Name am Anfang und Ende)\nFinale Aufnahme + Dateinamen prüfen";
  if (/glossary/i.test(ev.title)) return "5 Begriffe auswählen\nDefinitionen + Quellen\nSätze 1 (Präsentation/Material)\nSätze 2 (vocabulary.com + Quelle)\nIm Moodle-Glossar eintragen";
  return "Anforderungen lesen\nErster Entwurf\nÜberarbeiten\nAbgeben";
}

/* ---------------- ICS export ---------------- */
function icsEsc(s) { return String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }
function exportICS() {
  const evs = eventsBetween(addDays(today(), -30), addDays(today(), 400)).filter(e => e.type !== "info"); const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const before = S().notify.before || [7, 3, 1, 0];
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//StudyOS//DE", "CALSCALE:GREGORIAN", "X-WR-CALNAME:StudyOS"];
  evs.forEach(e => { const d = e.date.replace(/-/g, "");
    lines.push("BEGIN:VEVENT", "UID:" + (e.id + "-" + e.date).replace(/[^\w-]/g, "") + "@studyos", "DTSTAMP:" + stamp, "SUMMARY:" + icsEsc(e.title), "DESCRIPTION:" + icsEsc((e.note || "") + (e.course && CBY[e.course] ? "\nKurs: " + CBY[e.course].title : "")));
    if (e.time) { const t = e.time.replace(":", "") + "00"; const endMin = e.min || 60; const st = new Date(e.date + "T" + e.time + ":00"), en = new Date(st.getTime() + endMin * 60000); lines.push("DTSTART;TZID=Europe/Vienna:" + d + "T" + t, "DTEND;TZID=Europe/Vienna:" + dkey(en).replace(/-/g, "") + "T" + String(en.getHours()).padStart(2, "0") + String(en.getMinutes()).padStart(2, "0") + "00"); }
    else lines.push("DTSTART;VALUE=DATE:" + d, "DTEND;VALUE=DATE:" + addDays(e.date, 1).replace(/-/g, ""));
    const al = e.type === "study" ? [0] : before; al.forEach(n => lines.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + icsEsc(e.title), "TRIGGER:" + (e.time ? (n ? "-P" + n + "D" : "-PT1H") : (n ? "-P" + (n - 1) + "DT16H" : "PT8H")), "END:VALARM"));
    lines.push("END:VEVENT"); });
  lines.push("END:VCALENDAR");
  App.download("studyos-kalender.ics", lines.join("\r\n"), "text/calendar");
  App.modal(`<div class="spread"><h2>Kalender exportiert</h2><button class="btn ghost sm" data-close>✕</button></div><p>Die Datei <b>studyos-kalender.ics</b> enthält ${evs.length} Termine mit Erinnerungen (${before.join(", ")} Tage vorher).</p>
    <ul class="install-steps"><li><b>Xiaomi/Android:</b> Datei im Datei-Manager antippen → mit „Kalender“ öffnen → importieren. Falls das nicht geht: am Laptop über calendar.google.com → Einstellungen → Importieren; der Google-Kalender synchronisiert aufs Handy.</li><li><b>Laptop:</b> Doppelklick öffnet Outlook/Kalender, oder Google Kalender → Importieren.</li><li>Nach Änderungen neu exportieren. Doppelte Termine vermeidet die gleiche UID.</li></ul>
    <p class="muted" style="font-size:13px">Tipp: Die Erinnerungen des Handy-Kalenders sind die zuverlässigste Variante, auch wenn StudyOS geschlossen ist.</p>`);
}
App.exportICS = exportICS;
App.download = (name, content, type) => { const blob = content instanceof Blob ? content : new Blob([content], { type: type || "application/octet-stream" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); };

/* ---------------- notifications ---------------- */
function reminderList() {
  const out = [], n = S().notify, before = n.before || [7, 3, 1, 0];
  eventsBetween(addDays(today(), -3), addDays(today(), 60), false).filter(e => !e.done && ["exam", "deadline", "register", "other"].includes(e.type)).forEach(e => before.forEach(d => { const at = new Date(addDays(e.date, -d) + "T08:00:00").getTime(); out.push({ key: e.id + "|" + e.date + "|" + d, at, title: (d === 0 ? "Heute: " : d === 1 ? "Morgen: " : "In " + d + " Tagen: ") + e.title, body: (e.time ? e.time + " · " : "") + (e.note || TYPES[e.type][0]), tag: e.id }); }));
  allTasks().filter(t => !t.done && t.due).forEach(t => [1, 0].forEach(d => out.push({ key: "task|" + t.id + "|" + d, at: new Date(addDays(t.due, -d) + "T08:00:00").getTime(), title: (d ? "Morgen fällig: " : "Heute fällig: ") + t.title, body: CBY[t.course] ? CBY[t.course].title : "", tag: t.id })));
  const [hh, mm] = (n.daily || "18:00").split(":").map(Number);
  for (let i = 0; i < 14; i++) { const k = addDays(today(), i), blocks = planEvents().filter(e => e.date === k && !e.done); const d = new Date(k + "T00:00:00"); d.setHours(hh, mm); out.push({ key: "daily|" + k, at: d.getTime(), title: blocks.length ? "Lernzeit: " + blocks.length + " Block" + (blocks.length > 1 ? "e" : "") + " geplant" : "Kurz lernen? 🔥", body: blocks.length ? blocks.map(b => b.title).join(" · ") : "Halte deine Serie am Leben: 5 Karteikarten reichen.", tag: "daily", daily: true }); }
  return out;
}
App.reminderList = reminderList;
async function show(r) {
  const opts = { body: r.body, tag: r.tag, icon: "icons/icon-192.png", badge: "icons/icon-192.png", data: { url: "./#dash" } };
  try { const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration(); if (reg) { await reg.showNotification(r.title, opts); return; } } catch (e) {}
  try { new Notification(r.title, opts); } catch (e) {}
}
function checkReminders() {
  const n = S().notify; if (!n.enabled || typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const now = Date.now(); let changed = false;
  reminderList().forEach(r => { if (r.at <= now && r.at > now - 36 * 3600e3 && !n.sent[r.key]) { if (r.daily && (App.day().xp > 0)) { n.sent[r.key] = now; changed = true; return; } show(r); n.sent[r.key] = now; changed = true; } });
  Object.keys(n.sent).forEach(k => { if (n.sent[k] < now - 90 * 864e5) delete n.sent[k]; });
  if (changed) App.save();
}
App.syncReminders = async () => {
  try { if (!("caches" in window)) return; const c = await caches.open("studyos-data"); await c.put("./__reminders.json", new Response(JSON.stringify({ enabled: S().notify.enabled, list: reminderList(), sent: S().notify.sent, xpToday: App.day().xp, today: today() }), { headers: { "Content-Type": "application/json" } })); } catch (e) {}
};
App.enableNotifications = async () => {
  if (typeof Notification === "undefined") { App.toast("Nicht unterstützt", "Dieser Browser kann keine Benachrichtigungen. Nutze den Kalender-Export.", "!"); return false; }
  const p = await Notification.requestPermission(); if (p !== "granted") { App.toast("Benachrichtigungen blockiert", "In den Browser- bzw. App-Einstellungen erlauben.", "!"); return false; }
  S().notify.enabled = true; App.save(); App.syncReminders();
  try { const reg = await navigator.serviceWorker.ready; if (reg.periodicSync) { const st = await navigator.permissions.query({ name: "periodic-background-sync" }); if (st.state === "granted") await reg.periodicSync.register("studyos-reminders", { minInterval: 6 * 3600e3 }); } } catch (e) {}
  show({ title: "StudyOS erinnert dich jetzt", body: "Abgaben und Prüfungen " + (S().notify.before || []).join(", ") + " Tage vorher, Lernblöcke um " + S().notify.daily + ".", tag: "hello" });
  App.render(); return true;
};
App.notifySettings = () => {
  const n = S().notify;
  App.modal(`<div class="spread"><h2>Erinnerungen</h2><button class="btn ghost sm" data-close>✕</button></div>
    <label class="switch"><div><div>Benachrichtigungen</div><small>${typeof Notification === "undefined" ? "Nicht unterstützt" : "Status: " + Notification.permission}</small></div><input type="checkbox" class="tgl" id="nf-on" ${n.enabled ? "checked" : ""}></label>
    <label class="fld">Tägliche Lern-Erinnerung um<input type="time" id="nf-daily" value="${esc(n.daily)}"></label>
    <div><span class="eyebrow">Vor Abgaben und Prüfungen erinnern</span><div class="row" style="gap:6px;margin-top:6px">${[14, 7, 3, 2, 1, 0].map(d => `<label class="chip"><input type="checkbox" data-bf="${d}" ${n.before.includes(d) ? "checked" : ""} style="accent-color:var(--acc)"> ${d === 0 ? "am Tag" : d + " T."}</label>`).join("")}</div></div>
    <div class="callout" style="font-size:13px"><b>So zuverlässig sind die Erinnerungen:</b> Solange StudyOS offen ist oder du es regelmäßig öffnest, kommen sie sicher. Ist die App lange geschlossen, kann Android sie verzögern. Für 100 % Sicherheit: <b>Kalender-Export (.ics)</b> – dann erinnert dein Handy-Kalender.<br>Xiaomi: Einstellungen → Apps → StudyOS/Chrome → Benachrichtigungen erlauben und „Autostart“ + „Keine Einschränkungen“ beim Akku setzen.</div>
    <div class="row" style="justify-content:space-between"><button class="btn" id="nf-test">Test-Benachrichtigung</button><div class="row"><button class="btn" id="nf-ics">.ics exportieren</button><button class="btn pri" id="nf-save">Speichern</button></div></div>`, (m, close) => {
    $("#nf-test", m).onclick = async () => { if (Notification.permission !== "granted") { if (!(await App.enableNotifications())) return; } show({ title: "Test von StudyOS", body: "So sehen deine Erinnerungen aus.", tag: "test" }); };
    $("#nf-ics", m).onclick = () => { close(); exportICS(); };
    $("#nf-save", m).onclick = async () => { n.daily = $("#nf-daily", m).value || "18:00"; n.before = $$("[data-bf]", m).filter(x => x.checked).map(x => +x.dataset.bf).sort((a, b) => b - a); const on = $("#nf-on", m).checked; if (on && !n.enabled) { close(); await App.enableNotifications(); } else { n.enabled = on; App.save(); App.syncReminders(); close(); App.render(); } };
  });
};
App.afterBoot.push(() => { checkReminders(); App.syncReminders(); setInterval(checkReminders, 60000); document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") checkReminders(); }); });
})();
