/* StudyOS planner: Termine (Fach- und eigene), Termin-Formular, Erinnerungen, ICS-Export. Die Kalender-Seite liegt in calendar.js. */
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
function planEvents() { return []; } /* Lernpläne gibt es seit 4.14 nicht mehr */
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

/* ---------------- course page: dated events ---------------- */
App.renderCourseEvents = (box, cid) => {
  const t = today(), ev = courseEvents().concat(userEvents()).filter(e => e.course === cid && e.date && e.type !== "info" && e.type !== "class").flatMap(e => expand(e, addDays(t, -14), addDays(t, 300))).filter(e => e.date >= t || !e.done).sort((a, b) => a.date.localeCompare(b.date));
  box.innerHTML = `<div class="spread"><h3>Termine</h3><button class="btn sm" id="ce-add">+ Termin</button></div>
    ${ev.length ? ev.slice(0, 8).map(e => agendaItem(e, { compact: true })).join("") : `<p class="muted" style="font-size:14px">Keine Termine. Abgaben und Prüfungen mit Datum erscheinen hier und im Kalender.</p>`}`;
  $("#ce-add", box).onclick = () => eventForm(null, () => App.render(), { course: cid });
  wireAgenda(box, () => App.render());
};

/* „Aufgaben & Lernplan“ gibt es nicht mehr (4.14). Alte Links führen zur Startseite. */
PAGES.plan = () => App.go("dash");

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
  const [hh, mm] = (n.daily || "18:00").split(":").map(Number);
  for (let i = 0; i < 14; i++) { const k = addDays(today(), i), blocks = planEvents().filter(e => e.date === k && !e.done); const d = new Date(k + "T00:00:00"); d.setHours(hh, mm); out.push({ key: "daily|" + k, at: d.getTime(), title: blocks.length ? "Lernzeit: " + blocks.length + " Block" + (blocks.length > 1 ? "e" : "") + " geplant" : "Kurz lernen? 🔥", body: blocks.length ? blocks.map(b => b.title).join(" · ") : "Halte deine Serie am Leben: 5 Karteikarten reichen.", tag: "daily", daily: true }); }
  return out;
}
App.reminderList = reminderList;
async function show(r) {
  const opts = { body: r.body, tag: r.tag, icon: "icons/v2/icon-192.png", badge: "icons/v2/icon-192.png", data: { url: "./#dash" } };
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
