/* StudyOS · Gemeinsam: Freunde, Direktchat, Lerngruppen pro Fach und offener Live-Chat pro Fach (Supabase).
   Alles andere in StudyOS bleibt offline nutzbar. Die Supabase-Bibliothek wird erst geladen, wenn man den Bereich öffnet.
   Der anon key ist öffentlich gedacht; geschützt wird über Row Level Security (siehe ANLEITUNG.md, supabase-setup.sql).
   Muss vor apps.js geladen werden, damit „Gemeinsam“ als Hub-Seite umhüllt wird. */
(function () {
const { $, $$, esc, PAGES, CBY, COURSES } = App;
const S = () => App.S();
const SB_URL = "https://nanknvsfotrcyxjzwsyd.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmtudnNmb3RyY3l4anp3c3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MzY4NDUsImV4cCI6MjEwODAxMjg0NX0.jm2jc4Fix2W1JuawR8a3kYT1pkAfabnDMnZjK38pGGk";
const LINK = location.origin + location.pathname;

/* Einladungslinks (#friend=CODE, #group=CODE) vor dem Routing abfangen */
const INVITE = (/^#(friend|group)=([A-Za-z0-9]{4,12})$/.exec(location.hash) || []).slice(1);
if (INVITE.length) { try { sessionStorage.setItem("studyos.invite", JSON.stringify(INVITE)); history.replaceState(null, "", location.pathname + location.search); } catch (e) {} }

/* ---------- Verbindung ---------- */
let sb = null, me = null, loading = null;
const st = () => S().settings.online || (S().settings.online = {});
const loadLib = () => window.supabase ? Promise.resolve() : new Promise((ok, no) => { const s = document.createElement("script"); s.src = "js/vendor/supabase.js"; s.onload = ok; s.onerror = () => no(new Error("Bibliothek nicht geladen")); document.head.appendChild(s); });
async function connect() {
  if (sb && me) return;
  if (loading) return loading;
  loading = (async () => {
    await loadLib();
    sb = sb || window.supabase.createClient(SB_URL, SB_KEY, { auth: { storageKey: "studyos.sb." + (window.STUDYOS_PID || "x"), persistSession: true, autoRefreshToken: true } });
    let { data } = await sb.auth.getSession(), user = data && data.session && data.session.user;
    if (!user) { const r = await sb.auth.signInAnonymously(); if (r.error) throw r.error; user = r.data.user; }
    const prof = { id: user.id, name: (S().name || "Studi").slice(0, 40), avatar: (S().settings.avatar || "").slice(0, 8) || null };
    const r = await sb.from("profiles").upsert(prof).select().single(); if (r.error) throw r.error;
    me = r.data; names[me.id] = me; cleanOwn();
  })();
  try { await loading; } finally { loading = null; }
}
const fail = e => { const m = String((e && (e.message || e.msg)) || e || ""); return /relation|does not exist|schema cache|PGRST20/.test(m) ? "Die Datenbank ist noch nicht eingerichtet. Im Supabase SQL Editor einmal supabase-setup.sql ausführen." : /anonymous.*disabled|disabled.*anonymous/i.test(m) ? "Anonyme Anmeldung ist in Supabase noch ausgeschaltet (Authentication → Sign In / Providers → Allow anonymous sign-ins, dann Save changes). Supabase meldet: " + m : /fetch|network|Bibliothek/i.test(m) ? "Keine Verbindung. Prüf dein Internet und versuch es nochmal." : "Fehler von Supabase: " + (m || "unbekannt"); };
const q = async p => { const r = await p; if (r.error) throw r.error; return r.data; };

/* Namen und Avatare anderer zwischenspeichern */
const names = {};
async function loadNames(ids) { const miss = [...new Set(ids)].filter(id => id && !names[id]); if (miss.length) (await q(sb.from("profiles").select("id,name,avatar,code").in("id", miss))).forEach(p => { names[p.id] = p; }); }
const av = p => `<span class="so-av" aria-hidden="true">${esc((p && p.avatar) || ((p && p.name) || "?")[0].toUpperCase())}</span>`;
const nm = id => (names[id] && names[id].name) || "Unbekannt";
const qr = url => { try { const x = qrcode(0, "M"); x.addData(url); x.make(); return x.createSvgTag({ cellSize: 4, margin: 3, scalable: true }); } catch (e) { return ""; } };
const copy = (txt, label) => (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => App.toast("Kopiert", label || txt, "⎘"), () => prompt("Kopieren:", txt));
function shareDialog(title, text, url, code) {
  App.modal(`<h2>${esc(title)}</h2><p>${esc(text)}</p><div class="pair-qr">${qr(url)}</div>
    <p class="so-code-big">${esc(code)}</p>
    <div class="row" style="justify-content:flex-end;flex-wrap:wrap"><button class="btn sm" id="so-cp">Link kopieren</button>${navigator.share ? `<button class="btn sm" id="so-sh">Teilen …</button>` : ""}<button class="btn pri sm" data-close>Fertig</button></div>`, m => {
    $("#so-cp", m).onclick = () => copy(url, "Einladungslink in der Zwischenablage.");
    const sh = $("#so-sh", m); if (sh) sh.onclick = () => navigator.share({ title: "StudyOS", text, url }).catch(() => {});
  });
}

/* ---------- Chat (DM, Gruppe oder Fach) ---------- */
let chan = null, curR = null;
const drop = () => { if (chan && sb) { sb.removeChannel(chan); } chan = null; };
const stale = () => App.route() !== curR; /* Seite inzwischen gewechselt: nichts mehr hineinschreiben */
const time = t => { const d = new Date(t), today = new Date().toDateString() === d.toDateString(); return d.toLocaleString("de-AT", today ? { hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); };
const linkify = s => esc(s).replace(/https?:\/\/[^\s<]+/g, u => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);

/* Dateien: privater Speicher „chat“, sichtbar nur für alle, die auch die Nachricht sehen dürfen (Policy in supabase-update-2.sql).
   Anhänge laufen nach 24 Stunden ab, der offene Fach-Chat ebenso; Lerngruppen und Direktchats bleiben. */
const MAXB = 5 * 1024 * 1024, BUCKET = "chat", DAY = 864e5, urls = {};
const expired = m => !!(m.file && (m.file.expired || Date.now() - new Date(m.created_at) > DAY));
/* Fotos vor dem Hochladen verkleinern (max. 1600 px, JPEG), GIFs bleiben unverändert, damit sie sich bewegen */
async function shrink(f) {
  if (!/^image\/(jpe?g|png|webp|bmp)$/i.test(f.type) || f.size < 400 * 1024 || !window.createImageBitmap) return f;
  try {
    const bmp = await createImageBitmap(f), k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height)), c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise(ok => c.toBlob(ok, "image/jpeg", .82));
    return blob && blob.size < f.size ? new File([blob], f.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : f;
  } catch (e) { return f; }
}
/* Eigene abgelaufene Dateien beim Öffnen aus dem Speicher entfernen */
async function cleanOwn() {
  try { const r = await sb.storage.from(BUCKET).list(me.id, { limit: 100, sortBy: { column: "created_at", order: "asc" } }); const old = (r.data || []).filter(o => o.created_at && Date.now() - new Date(o.created_at) > DAY).map(o => me.id + "/" + o.name); if (old.length) await sb.storage.from(BUCKET).remove(old); } catch (e) {}
}
const size = n => n < 1024 ? n + " B" : n < 1048576 ? Math.round(n / 1024) + " KB" : (n / 1048576).toFixed(1).replace(".", ",") + " MB";
const isImg = f => /^image\/(png|jpe?g|gif|webp|avif|bmp)$/i.test(f.type || "");
const fIcon = f => /pdf/.test(f.type) ? "PDF" : /word|document/.test(f.type) ? "DOC" : /sheet|excel|csv/.test(f.type) ? "XLS" : /presentation|powerpoint/.test(f.type) ? "PPT" : /zip|compressed/.test(f.type) ? "ZIP" : /^text|json|javascript|python|kotlin/.test(f.type) ? "TXT" : ((f.name || "").split(".").pop() || "?").slice(0, 4).toUpperCase();
async function sign(paths) {
  const miss = [...new Set(paths)].filter(p => p && !urls[p]); if (!miss.length) return;
  try { const r = await sb.storage.from(BUCKET).createSignedUrls(miss, 6 * 3600); (r.data || []).forEach(x => { if (x.signedUrl) urls[x.path] = x.signedUrl; }); } catch (e) {}
}
function fileHTML(m) {
  const f = m.file, u = !expired(m) && urls[f.path];
  if (!u && !m.pending) return `<div class="so-file off"><i>${isImg(f) ? "BILD" : esc(fIcon(f))}</i><span><b>${esc(f.name)}</b><small>Datei abgelaufen (Anhänge bleiben 24 Stunden)</small></span></div>`;
  if (isImg(f)) return u ? `<button class="so-img" data-view="${esc(f.path)}" aria-label="Bild ${esc(f.name)} groß anzeigen"><img src="${esc(u)}" alt="${esc(f.name)}" loading="lazy"></button>` : `<div class="so-file"><i>BILD</i><span><b>${esc(f.name)}</b><small>nicht mehr verfügbar</small></span></div>`;
  return `<a class="so-file" ${u ? `href="${esc(u)}" download="${esc(f.name)}" target="_blank" rel="noopener"` : ""}><i>${esc(fIcon(f))}</i><span><b>${esc(f.name)}</b><small>${size(f.size || 0)}${u ? " · herunterladen" : " · nicht mehr verfügbar"}</small></span></a>`;
}
function msgHTML(m, prev) {
  const mine = m.sender === me.id, same = prev && prev.sender === m.sender && new Date(m.created_at) - new Date(prev.created_at) < 300000;
  return `<div class="so-m ${mine ? "mine" : ""} ${same ? "cont" : ""} ${m.file ? "has-file" : ""}" data-mid="${m.id}">${mine || same ? "" : av(names[m.sender])}
    <div class="so-b">${mine || same ? "" : `<b>${esc(nm(m.sender))}</b>`}${m.file ? fileHTML(m) : ""}${m.body ? `<p>${linkify(m.body)}</p>` : ""}<small>${m.pending ? "wird gesendet …" : time(m.created_at)}${mine && !m.pending ? ` · <button class="so-del" data-del="${m.id}" aria-label="Nachricht löschen">löschen</button>` : ""}</small></div></div>`;
}
function viewImage(path, name) {
  App.modal(`<div class="so-view"><img src="${esc(urls[path])}" alt="${esc(name)}"></div><div class="row" style="justify-content:space-between;align-items:center;gap:10px"><small class="muted" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(name)}</small><span class="row" style="gap:8px"><a class="btn sm" href="${esc(urls[path])}" download="${esc(name)}" target="_blank" rel="noopener">Herunterladen</a><button class="btn pri sm" data-close>Schließen</button></span></div>`);
}
/* target: { to_user } | { group_id } | { course } */
async function chat(box, target, hint) {
  drop();
  const key = Object.keys(target)[0], val = target[key];
  box.innerHTML = `<div class="so-chat"><div class="so-log" aria-live="polite"><div class="so-load">Lade Nachrichten …</div></div>
    <div class="so-drop" aria-hidden="true">Datei hier ablegen</div>
    <form class="so-in"><input type="file" class="so-fi" hidden multiple><button type="button" class="btn ghost so-att" aria-label="Bild oder Datei anhängen" title="Bild oder Datei anhängen (bis 5 MB, wird nach 24 Stunden gelöscht)">📎</button><textarea rows="1" maxlength="2000" placeholder="${esc(hint || "Nachricht schreiben …")}" aria-label="Nachricht"></textarea><button class="btn pri" type="submit" aria-label="Senden">➤</button></form></div>`;
  const log = $(".so-log", box), ta = $("textarea", box), form = $("form", box), wrap = $(".so-chat", box), fi = $(".so-fi", box);
  /* Chat füllt den sichtbaren Bereich, das Eingabefeld bleibt über der Handy-Leiste */
  const fit = () => { if (!box.isConnected) return removeEventListener("resize", fit); const bn = $("#bnav"), nb = bn && getComputedStyle(bn).display !== "none" ? bn.offsetHeight : 0; wrap.style.height = Math.max(300, innerHeight - (wrap.getBoundingClientRect().top + scrollY) - nb - 16) + "px"; };
  fit(); addEventListener("resize", fit);
  let list = [];
  const paint = () => {
    log.innerHTML = list.length ? list.map((m, i) => msgHTML(m, list[i - 1])).join("") : `<div class="so-empty">Noch keine Nachrichten. Schreib die erste!</div>`;
    log.scrollTop = log.scrollHeight;
    $$("img", log).forEach(i => { if (!i.complete) i.onload = () => { log.scrollTop = log.scrollHeight; }; });
  };
  let query = sb.from("messages").select("*").order("created_at", { ascending: false }).limit(150);
  query = key === "to_user" ? query.or(`and(sender.eq.${me.id},to_user.eq.${val}),and(sender.eq.${val},to_user.eq.${me.id})`) : query.eq(key, val);
  if (key === "course") query = query.gt("created_at", new Date(Date.now() - DAY).toISOString()); /* offener Fach-Chat zeigt nur die letzten 24 Stunden */
  try { list = (await q(query)).reverse(); await Promise.all([loadNames(list.map(m => m.sender)), sign(list.filter(m => m.file && !expired(m)).map(m => m.file.path))]); if (!box.isConnected) return; paint(); }
  catch (e) { log.innerHTML = `<div class="so-empty">${esc(fail(e))}</div>`; return; }
  const add = async m => {
    if (!box.isConnected) return drop();
    if (list.some(x => x.id === m.id)) return;
    if (key === "to_user" && !((m.sender === val && m.to_user === me.id) || (m.sender === me.id && m.to_user === val))) return;
    await Promise.all([loadNames([m.sender]), sign([m.file && m.file.path])]); list.push(m); paint();
  };
  chan = sb.channel("so-" + key + "-" + val + "-" + Date.now())
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: key === "to_user" ? `to_user=eq.${me.id}` : `${key}=eq.${val}` }, p => add(p.new))
    .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages" }, p => { const n = list.length; list = list.filter(m => m.id !== p.old.id); if (list.length !== n) paint(); })
    .subscribe();
  App.cleanup = drop;
  const send = async () => {
    const body = ta.value.trim(); if (!body) return;
    ta.value = ""; ta.style.height = "";
    try { add(await q(sb.from("messages").insert({ body, [key]: val }).select().single())); }
    catch (e) { ta.value = body; App.toast("Nicht gesendet", fail(e), "!"); }
  };
  /* Bilder, GIFs und Dateien: hochladen, dann als Nachricht mit Anhang senden (Text im Feld wird zur Bildunterschrift) */
  const upload = async files => {
    for (const raw of files) {
      const f = await shrink(raw);
      if (f.size > MAXB) { App.toast("Zu groß", `${f.name} hat ${size(f.size)}. Erlaubt sind bis 5 MB.`, "!"); continue; }
      const name = (f.name || "bild.png").replace(/[^\w.\-äöüÄÖÜß ]+/g, "_").slice(-80) || "datei", path = `${me.id}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${name.replace(/\s+/g, "_")}`;
      const body = ta.value.trim(); ta.value = ""; ta.style.height = "";
      const tmp = { id: "tmp" + Date.now(), sender: me.id, body, file: { path, name, type: f.type || "application/octet-stream", size: f.size }, created_at: new Date().toISOString(), pending: true };
      if (isImg(tmp.file)) urls[path] = URL.createObjectURL(f);
      list.push(tmp); paint();
      try {
        const up = await sb.storage.from(BUCKET).upload(path, f, { contentType: tmp.file.type, upsert: false }); if (up.error) throw up.error;
        const m = await q(sb.from("messages").insert({ body, file: tmp.file, [key]: val }).select().single());
        delete urls[path]; await sign([path]); list = list.filter(x => x !== tmp); add(m);
      } catch (e) { list = list.filter(x => x !== tmp); paint(); if (body && !ta.value) ta.value = body; App.toast("Nicht gesendet", /bucket|not found/i.test(String(e && e.message)) ? "Der Dateispeicher ist noch nicht eingerichtet (supabase-update-2.sql)." : fail(e), "!"); }
    }
  };
  $(".so-att", box).onclick = () => fi.click();
  fi.onchange = () => { const fs = [...fi.files]; fi.value = ""; upload(fs); };
  ta.onpaste = e => { const fs = [...((e.clipboardData && e.clipboardData.files) || [])]; if (fs.length) { e.preventDefault(); upload(fs); } };
  let dragN = 0;
  wrap.ondragenter = e => { if ([...e.dataTransfer.types].includes("Files")) { dragN++; wrap.classList.add("drag"); } };
  wrap.ondragleave = () => { if (--dragN <= 0) { dragN = 0; wrap.classList.remove("drag"); } };
  wrap.ondragover = e => e.preventDefault();
  wrap.ondrop = e => { e.preventDefault(); dragN = 0; wrap.classList.remove("drag"); const fs = [...e.dataTransfer.files]; if (fs.length) upload(fs); };
  form.onsubmit = e => { e.preventDefault(); send(); };
  ta.onkeydown = e => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } };
  ta.oninput = () => { ta.style.height = ""; ta.style.height = Math.min(ta.scrollHeight, 160) + "px"; };
  log.onclick = async e => {
    const v = e.target.closest("[data-view]"); if (v) { const m = list.find(x => x.file && x.file.path === v.dataset.view); return viewImage(v.dataset.view, m ? m.file.name : ""); }
    const d = e.target.closest("[data-del]"); if (!d || !confirm("Nachricht löschen?")) return;
    const m = list.find(x => x.id === +d.dataset.del);
    try { await q(sb.from("messages").delete().eq("id", +d.dataset.del)); if (m && m.file) sb.storage.from(BUCKET).remove([m.file.path]).catch(() => {}); list = list.filter(x => x.id !== +d.dataset.del); paint(); } catch (er) { App.toast("Fehler", fail(er), "!"); }
  };
}

/* ---------- Daten ---------- */
async function friends() {
  const rows = await q(sb.from("friendships").select("a,b,accepted"));
  const other = r => r.a === me.id ? r.b : r.a; await loadNames(rows.map(other));
  return { ok: rows.filter(r => r.accepted).map(other), inc: rows.filter(r => !r.accepted && r.b === me.id).map(other), out: rows.filter(r => !r.accepted && r.a === me.id).map(other) };
}
const myGroups = async () => (await q(sb.from("group_members").select("group_id, groups(id,name,course,invite,owner)").eq("user_id", me.id))).map(r => r.groups).filter(Boolean);
async function addFriend(code) { const id = await q(sb.rpc("add_friend", { code: code.trim().toUpperCase() })); await loadNames([id]); return id; }
async function joinGroup(code) { return q(sb.rpc("join_group", { code: code.trim().toUpperCase() })); }
async function createGroup(course, name) {
  const g = await q(sb.from("groups").insert({ course, name, owner: me.id }).select().single());
  await q(sb.from("group_members").insert({ group_id: g.id, user_id: me.id })); return g;
}
async function takeInvite() {
  let inv = null; try { inv = JSON.parse(sessionStorage.getItem("studyos.invite") || "null"); sessionStorage.removeItem("studyos.invite"); } catch (e) {}
  if (!inv) return null;
  try {
    if (inv[0] === "friend") { const id = await addFriend(inv[1]); App.toast("Freundschaftsanfrage", `${nm(id)} bekommt deine Anfrage.`, "☺"); return "dm:" + id; }
    const g = await joinGroup(inv[1]); App.toast("Beigetreten", "Du bist jetzt in der Lerngruppe.", "◎"); return "g:" + g;
  } catch (e) { App.toast("Einladung", /Unbekannt/.test(fail(e)) ? "Der Code ist ungültig oder abgelaufen." : fail(e), "!"); return null; }
}

/* ---------- Seiten ---------- */
const head = (title, sub, back) => `<header class="so-head">${back ? `<button class="btn ghost sm so-back" data-go="${back[0]}"${back[1] ? ` data-p="${esc(back[1])}"` : ""}>← ${esc(back[2])}</button>` : ""}<span class="eyebrow">Gemeinsam</span><h1>${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ""}</header>`;
function gate(el, cont) {
  if (!st().on) {
    el.innerHTML = `<div class="page so">${head("Gemeinsam lernen", "Freunde, Chats, Lerngruppen und ein offener Live-Chat zu jedem Fach.")}
      <section class="card so-intro"><div class="so-ill" aria-hidden="true"><i></i><i></i><i></i></div>
        <h3>Online-Modus einschalten</h3>
        <ul class="muted"><li>Freunde per QR-Code oder Freundescode hinzufügen und privat schreiben.</li><li>Lerngruppen pro Fach gründen, Fragen reinschicken und gemeinsam grübeln.</li><li>Zu jedem Fach ein offener Live-Chat mit allen, die StudyOS nutzen.</li></ul>
        <p class="muted" style="font-size:13px">Sichtbar für andere sind nur dein Name „${esc(S().name || "Studi")}“ und dein Avatar, nicht dein Lernstand. Nachrichten liegen auf einem Server in der EU. Ohne Internet funktioniert alles andere in StudyOS wie bisher.</p>
        <button class="btn pri big" id="so-on">Online-Modus einschalten</button></section></div>`;
    $("#so-on", el).onclick = () => { st().on = true; App.save(); cont(); };
    return false;
  }
  if (!navigator.onLine) { el.innerHTML = `<div class="page so">${head("Gemeinsam", "")}<div class="empty">Du bist gerade offline. Freunde und Chats brauchen Internet, alles andere in StudyOS funktioniert weiter.</div></div>`; return false; }
  return true;
}
async function boot(el, render) {
  curR = App.route();
  if (!gate(el, () => boot(el, render))) return;
  if (!(sb && me)) el.innerHTML = `<div class="page so"><div class="so-wait"><span class="so-spin"></span>Verbinde …</div></div>`;
  try { await connect(); } catch (e) { drop(); if (stale()) return; el.innerHTML = `<div class="page so">${head("Gemeinsam", "")}<div class="empty">${esc(fail(e))}<br><br><button class="btn sm" id="so-re">Nochmal versuchen</button></div></div>`; $("#so-re", el).onclick = () => boot(el, render); return; }
  if (stale()) return;
  try { await render(); } catch (e) { if (stale()) return; el.innerHTML = `<div class="page so">${head("Gemeinsam", "")}<div class="empty">${esc(fail(e))}</div></div>`; }
}

/* Hub-Seite: Übersicht, Direktchat (dm:ID), Gruppe (g:ID), Fach-Chat (c:FACH) */
PAGES.together = (el, p) => boot(el, async () => {
  const inv = await takeInvite(); if (inv && !p) p = inv;
  drop();
  const [kind, id] = String(p || "").split(/:(.*)/);
  if (kind === "dm") return dmPage(el, id);
  if (kind === "g") return groupPage(el, id, ["together", "", "Gemeinsam"]);
  if (kind === "c" && CBY[id]) return App.go("coursechat", id);
  const [fr, gs] = await Promise.all([friends(), myGroups()]); if (stale()) return;
  el.innerHTML = `<div class="page so">${head("Gemeinsam", "Freunde, Lerngruppen und die Live-Chats der Fächer.")}
    <section class="card so-me">${av(me)}<div><b>${esc(me.name)}</b><small class="muted">Dein Freundescode</small><span class="so-code">${esc(me.code)}</span></div>
      <div class="so-me-act"><button class="btn pri sm" id="so-qr">QR-Code zeigen</button><button class="btn sm" id="so-add">Freund hinzufügen</button></div></section>
    ${fr.inc.length ? `<section class="card so-req"><h3>Anfragen</h3>${fr.inc.map(id => `<div class="so-row">${av(names[id])}<b>${esc(nm(id))}</b><span class="so-sp"></span><button class="btn pri sm" data-acc="${id}">Annehmen</button><button class="btn ghost sm" data-rej="${id}">Ablehnen</button></div>`).join("")}</section>` : ""}
    <div class="so-grid">
      <section class="card"><div class="spread"><h3>Freunde</h3><span class="chip">${fr.ok.length}</span></div>
        ${fr.ok.length ? fr.ok.map(id => `<button class="so-row so-link" data-go="together" data-p="dm:${id}">${av(names[id])}<b>${esc(nm(id))}</b><span class="so-sp"></span><span class="muted">Chat ›</span></button>`).join("") : `<p class="muted">Noch keine Freunde. Zeig deinen QR-Code oder gib einen Freundescode ein.</p>`}
        ${fr.out.length ? `<p class="muted so-out">Wartet auf Bestätigung: ${fr.out.map(id => esc(nm(id))).join(", ")}</p>` : ""}</section>
      <section class="card"><div class="spread"><h3>Lerngruppen</h3><span class="chip">${gs.length}</span></div>
        ${gs.length ? gs.map(g => `<button class="so-row so-link th-dot-${esc(g.course)}" data-go="together" data-p="g:${g.id}"><span class="so-gi">${esc((CBY[g.course] && CBY[g.course].short) || g.course)}</span><b>${esc(g.name)}</b><span class="so-sp"></span><span class="muted">›</span></button>`).join("") : `<p class="muted">Gründe eine Gruppe für ein Fach oder tritt mit einem Code bei.</p>`}
        <div class="row so-gact"><button class="btn sm pri" id="so-new">Gruppe gründen</button><button class="btn sm" id="so-join">Mit Code beitreten</button></div></section>
    </div>
    <section class="card"><h3>Live-Chat pro Fach</h3><p class="muted">Offen für alle, die StudyOS nutzen, Nachrichten bleiben 24 Stunden. Frag, was du nicht verstehst, oder hilf anderen.</p>
      <div class="so-courses">${COURSES.map(c => `<button class="so-cc th-${c.id}" data-go="coursechat" data-p="${c.id}"><i></i><b>${esc(c.title)}</b><small>${esc(c.short)}</small></button>`).join("")}</div></section></div>`;
  $("#so-qr", el).onclick = () => shareDialog("Dein Freundescode", "Lass den Code scannen oder schick den Link. Wer ihn öffnet, schickt dir eine Freundschaftsanfrage.", LINK + "#friend=" + me.code, me.code);
  $("#so-add", el).onclick = () => codeDialog("Freund hinzufügen", "Freundescode (8 Zeichen)", async c => { const id = await addFriend(c); App.toast("Anfrage gesendet", `${nm(id)} muss noch bestätigen.`, "☺"); PAGES.together(el, ""); });
  $("#so-new", el).onclick = () => newGroupDialog(App.currentApp && App.currentApp(), g => App.go("together", "g:" + g.id));
  $("#so-join", el).onclick = () => codeDialog("Lerngruppe beitreten", "Gruppencode (8 Zeichen)", async c => { const g = await joinGroup(c); App.go("together", "g:" + g); });
  el.onclick = async e => {
    const a = e.target.closest("[data-acc],[data-rej]"); if (!a) return;
    try {
      if (a.dataset.acc) await q(sb.from("friendships").update({ accepted: true }).eq("a", a.dataset.acc).eq("b", me.id));
      else await q(sb.from("friendships").delete().eq("a", a.dataset.rej).eq("b", me.id));
      PAGES.together(el, "");
    } catch (er) { App.toast("Fehler", fail(er), "!"); }
  };
});
function codeDialog(title, label, run) {
  App.modal(`<h2>${esc(title)}</h2><form class="col" id="so-cf"><label class="fld">${esc(label)}<input id="so-ci" maxlength="12" autocomplete="off" autocapitalize="characters" spellcheck="false" style="text-transform:uppercase;letter-spacing:.12em"></label>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost sm" data-close>Abbrechen</button><button class="btn pri sm">OK</button></div></form>`, (m, close) => {
    const i = $("#so-ci", m); setTimeout(() => i.focus(), 50);
    $("#so-cf", m).onsubmit = async e => { e.preventDefault(); if (!i.value.trim()) return; try { await run(i.value); close(); } catch (er) { App.toast("Hat nicht geklappt", /Unbekannt/.test(fail(er)) ? "Diesen Code gibt es nicht." : fail(er), "!"); } };
  });
}
function newGroupDialog(course, done) {
  App.modal(`<h2>Lerngruppe gründen</h2><form class="col" id="so-gf"><label class="fld">Fach<select id="so-gc">${COURSES.map(c => `<option value="${c.id}" ${c.id === course ? "selected" : ""}>${esc(c.title)}</option>`).join("")}</select></label>
    <label class="fld">Name der Gruppe<input id="so-gn" maxlength="60" placeholder="z. B. BWL Lerngruppe Dienstag"></label>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost sm" data-close>Abbrechen</button><button class="btn pri sm">Gründen</button></div></form>`, (m, close) => {
    $("#so-gf", m).onsubmit = async e => { e.preventDefault(); const n = $("#so-gn", m).value.trim(); if (!n) return $("#so-gn", m).focus();
      try { const g = await createGroup($("#so-gc", m).value, n); close(); App.toast("Gruppe gegründet", "Lade andere mit dem Gruppencode ein.", "◎"); done(g); } catch (er) { App.toast("Fehler", fail(er), "!"); } };
  });
}
async function dmPage(el, id) {
  await loadNames([id]); if (stale()) return;
  el.innerHTML = `<div class="page so so-full">${head(`${av(names[id])} ${esc(nm(id))}`, "", ["together", "", "Gemeinsam"])}<div class="so-tools"><button class="btn ghost sm" id="so-unf">Freundschaft beenden</button></div><div class="card so-box"></div></div>`;
  $("#so-unf", el).onclick = async () => { if (!confirm(`Freundschaft mit ${nm(id)} beenden?`)) return; try { await q(sb.from("friendships").delete().or(`and(a.eq.${me.id},b.eq.${id}),and(a.eq.${id},b.eq.${me.id})`)); App.go("together", ""); } catch (e) { App.toast("Fehler", fail(e), "!"); } };
  chat($(".so-box", el), { to_user: id }, `Nachricht an ${nm(id)} …`);
}
async function groupPage(el, gid, back) {
  const g = await q(sb.from("groups").select("*").eq("id", gid).single());
  const mem = await q(sb.from("group_members").select("user_id").eq("group_id", gid)); await loadNames(mem.map(m => m.user_id)); if (stale()) return;
  const c = CBY[g.course];
  el.innerHTML = `<div class="page so so-full">${head(esc(g.name), `${esc(c ? c.title : g.course)} · ${mem.length} ${mem.length === 1 ? "Mitglied" : "Mitglieder"}`, back)}
    <div class="so-tools"><div class="so-mem">${mem.slice(0, 8).map(m => `<span title="${esc(nm(m.user_id))}">${av(names[m.user_id])}</span>`).join("")}</div><span class="so-sp"></span>
      <button class="btn sm pri" id="so-inv">Einladen</button><button class="btn ghost sm" id="so-leave">${g.owner === me.id ? "Gruppe löschen" : "Verlassen"}</button></div>
    <div class="card so-box"></div></div>`;
  $("#so-inv", el).onclick = () => shareDialog("In die Gruppe einladen", `Wer den Code scannt oder den Link öffnet, tritt „${g.name}“ bei.`, LINK + "#group=" + g.invite, g.invite);
  $("#so-leave", el).onclick = async () => {
    const own = g.owner === me.id; if (!confirm(own ? "Gruppe für alle löschen?" : "Gruppe verlassen?")) return;
    try { await q(own ? sb.from("groups").delete().eq("id", gid) : sb.from("group_members").delete().eq("group_id", gid).eq("user_id", me.id)); App.go(back[0], back[1]); } catch (e) { App.toast("Fehler", fail(e), "!"); }
  };
  chat($(".so-box", el), { group_id: gid }, "In die Gruppe schreiben …");
}

/* Fach-App: Live-Chat und Lerngruppen dieses Fachs (p = Fach-ID oder "FACH|g:GRUPPE") */
PAGES.coursechat = (el, p) => boot(el, async () => {
  drop();
  const [cid, sub] = String(p || (App.currentApp && App.currentApp()) || "").split("|"), c = CBY[cid];
  if (!c) return App.go("together", "");
  if (sub && sub.startsWith("g:")) return groupPage(el, sub.slice(2), ["coursechat", cid, "Live-Chat " + c.short]);
  const gs = (await myGroups()).filter(g => g.course === cid); if (stale()) return;
  el.innerHTML = `<div class="page so so-full">${head(`Live-Chat · ${esc(c.title)}`, "Offen für alle, die StudyOS nutzen. Nachrichten und Anhänge verschwinden nach 24 Stunden. Bleib freundlich, keine privaten Daten.")}
    <div class="so-tools so-gtabs">${gs.map(g => `<button class="chip" data-go="coursechat" data-p="${cid}|g:${g.id}">◎ ${esc(g.name)}</button>`).join("")}<button class="chip acc" id="so-cnew">+ Lerngruppe</button><button class="chip" id="so-cjoin">Code eingeben</button><button class="chip" data-go="together">Freunde ›</button></div>
    <div class="card so-box"></div></div>`;
  $("#so-cnew", el).onclick = () => newGroupDialog(cid, g => App.go("coursechat", cid + "|g:" + g.id));
  $("#so-cjoin", el).onclick = () => codeDialog("Lerngruppe beitreten", "Gruppencode (8 Zeichen)", async code => { const g = await joinGroup(code); App.go("together", "g:" + g); });
  chat($(".so-box", el), { course: cid }, `Frag etwas zu ${c.title} …`);
});

/* Einladungslink geöffnet: direkt zu „Gemeinsam“ */
App.afterBoot.push(() => { try { if (sessionStorage.getItem("studyos.invite")) setTimeout(() => App.go("together", ""), 50); } catch (e) {} });
App.social = { connect, me: () => me, client: () => sb };
})();
