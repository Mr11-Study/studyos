/* StudyOS · Gemeinsam: Freunde, Direktchat, Lerngruppen (auch pro Fach) und ein Global-Chat für alle (Supabase).
   Alles andere in StudyOS bleibt offline nutzbar. Die Supabase-Bibliothek wird erst geladen, wenn man den Bereich öffnet.
   Der anon key ist öffentlich gedacht; geschützt wird über Row Level Security (siehe ANLEITUNG.md, supabase-setup.sql).
   Muss vor apps.js geladen werden, damit „Gemeinsam“ als Hub-Seite umhüllt wird. */
(function () {
const { $, $$, esc, PAGES, CBY, COURSES } = App;
const S = () => App.S();
const SB_URL = "https://nanknvsfotrcyxjzwsyd.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmtudnNmb3RyY3l4anp3c3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MzY4NDUsImV4cCI6MjEwODAxMjg0NX0.jm2jc4Fix2W1JuawR8a3kYT1pkAfabnDMnZjK38pGGk";
const LINK = location.origin + location.pathname;
App.SB = { url: SB_URL, key: SB_KEY }; /* auch für den Kalender-Abruf (Edge Function „kalender“) */

/* Einladungslinks (#friend=CODE, #group=CODE) vor dem Routing abfangen */
const INVITE = (/^#(friend|group)=([A-Za-z0-9]{4,12})$/.exec(location.hash) || []).slice(1);
if (INVITE.length) { try { sessionStorage.setItem("studyos.invite", JSON.stringify(INVITE.concat("link"))); history.replaceState(null, "", location.pathname + location.search); } catch (e) {} }

/* ---------- Verbindung ---------- */
let sb = null, me = null, user = null, loading = null;
const st = () => S().settings.online || (S().settings.online = {});
const loadLib = () => window.supabase ? Promise.resolve() : new Promise((ok, no) => { const s = document.createElement("script"); s.src = "js/vendor/supabase.js"; s.onload = ok; s.onerror = () => no(new Error("Bibliothek nicht geladen")); document.head.appendChild(s); });
async function client() { await loadLib(); sb = sb || window.supabase.createClient(SB_URL, SB_KEY, { auth: { storageKey: "studyos.sb." + (window.STUDYOS_PID || "x"), persistSession: true, autoRefreshToken: true } }); return sb; }
async function connect() {
  if (sb && me) return;
  if (loading) return loading;
  loading = (async () => {
    await client();
    const { data } = await sb.auth.getSession(); user = data && data.session && data.session.user;
    if (!user) throw Object.assign(new Error("Nicht angemeldet"), { auth: "login" });
    if (isGuest()) throw Object.assign(new Error("Gastkonto"), { auth: "secure" }); /* alte Gastkonten erst mit E-Mail sichern */
    const prof = { id: user.id, name: (S().name || "Studi").slice(0, 40), avatar: (S().settings.avatar || "").slice(0, 8) || null };
    const r = await sb.from("profiles").upsert(prof).select().single(); if (r.error) throw r.error;
    me = r.data; names[me.id] = me;
    try { const c = await sb.rpc("my_code"); if (!c.error && c.data) me.code = c.data; } catch (e) {} /* ab Update 5 steht der Code nicht mehr im Profil */
    cleanOwn();
  })();
  try { await loading; } finally { loading = null; }
}
const fail = e => { const m = String((e && (e.message || e.msg)) || e || ""); return /discover_groups|join_open_group|groups_extra_ok|column [^ ]*(open|tags|about)/i.test(m) ? "Für offene Gruppen und Tags fehlt noch ein Datenbank-Update. Im Supabase SQL Editor einmal supabase-update-4.sql ausführen." : /relation|does not exist|schema cache|PGRST20/.test(m) ? "Die Datenbank ist noch nicht eingerichtet. Im Supabase SQL Editor einmal supabase-setup.sql ausführen." : /anonymous.*disabled|disabled.*anonymous/i.test(m) ? "Anonyme Anmeldung ist in Supabase noch ausgeschaltet (Authentication → Sign In / Providers → Allow anonymous sign-ins, dann Save changes). Supabase meldet: " + m : /fetch|network|Bibliothek/i.test(m) ? "Keine Verbindung. Prüf dein Internet und versuch es nochmal." : "Fehler von Supabase: " + (m || "unbekannt"); };
const q = async p => { const r = await p; if (r.error) throw r.error; return r.data; };

/* Namen und Avatare anderer zwischenspeichern */
const names = {};
async function loadNames(ids) { const miss = [...new Set(ids)].filter(id => id && !names[id]); if (miss.length) (await q(sb.from("profiles").select("id,name,avatar").in("id", miss))).forEach(p => { names[p.id] = p; }); }
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
const linkify = s => esc(s).replace(/https?:\/\/[^\s<]+/g, u => `<a href="${u}" target="_blank" rel="noopener noreferrer">${u}</a>`);

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
  if (key === "course") query = query.gt("created_at", new Date(Date.now() - DAY).toISOString()); /* offener Global-Chat zeigt nur die letzten 24 Stunden */
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
const myGroups = async () => (await q(sb.from("group_members").select("group_id, groups(*)").eq("user_id", me.id))).map(r => r.groups).filter(Boolean);
/* Freundesliste live halten: neue Anfragen und Bestätigungen erscheinen ohne Neuladen */
function watchFriends(redraw) {
  drop(); let t = null; const again = () => { clearTimeout(t); t = setTimeout(() => { if (!stale()) redraw(); }, 250); };
  chan = sb.channel("so-fr-" + Date.now())
    .on("postgres_changes", { event: "*", schema: "public", table: "friendships", filter: `a=eq.${me.id}` }, again)
    .on("postgres_changes", { event: "*", schema: "public", table: "friendships", filter: `b=eq.${me.id}` }, again)
    .subscribe();
  App.cleanup = drop;
}
async function friendToast(id) {
  const ok = (await friends()).ok.includes(id);
  App.toast(ok ? "Ihr seid befreundet" : "Anfrage gesendet", ok ? `${nm(id)} ist jetzt in deiner Freundesliste.` : `${nm(id)} muss deine Anfrage noch annehmen.`, "☺");
}
async function addFriend(code) { const id = await q(sb.rpc("add_friend", { code: code.trim().toUpperCase() })); await loadNames([id]); return id; }
const joinOpen = gid => q(sb.rpc("join_open_group", { gid })).then(r => { inboxSoon(); return r; });
async function joinGroup(code) { const g = await q(sb.rpc("join_group", { code: code.trim().toUpperCase() })); inboxSoon(); return g; }
async function createGroup(f) {
  const row = { course: f.course || null, name: f.name, owner: me.id };
  if (f.open || f.tags.length || f.about) Object.assign(row, { open: f.open, tags: f.tags, about: f.about || null }); /* ohne Update 4 klappen private Gruppen weiterhin */
  const g = await q(sb.from("groups").insert(row).select().single());
  await q(sb.from("group_members").insert({ group_id: g.id, user_id: me.id })); inboxSoon(); return g;
}
async function takeInvite() {
  let inv = null; try { inv = JSON.parse(sessionStorage.getItem("studyos.invite") || "null"); sessionStorage.removeItem("studyos.invite"); } catch (e) {}
  if (!inv) return null;
  if (inv[2] === "link" && !standalone()) { inv = inv.slice(0, 2); try { sessionStorage.setItem("studyos.invite", JSON.stringify(inv)); } catch (e) {} browserHint(inv, () => App.go("together", "")); return null; }
  try {
    if (inv[0] === "friend") { const id = await addFriend(inv[1]); await friendToast(id); return "dm:" + id; }
    const g = await joinGroup(inv[1]); App.toast("Beigetreten", "Du bist jetzt in der Lerngruppe.", "◎"); return "g:" + g;
  } catch (e) { App.toast("Einladung", /Unbekannt/.test(fail(e)) ? "Der Code ist ungültig oder abgelaufen." : fail(e), "!"); return null; }
}

/* ---------- Konto: Online-Funktionen nur mit Konto (E-Mail und Passwort) ----------
   Dasselbe Konto gilt in der installierten App, im Browser und auf jedem Gerät. Alte Gastkonten (anonyme Anmeldung)
   müssen erst mit E-Mail und Passwort gesichert werden, die ID bleibt dabei gleich.
   Voraussetzung in Supabase: Authentication → Sign In / Providers → Email: „Confirm email“ ausgeschaltet. */
const isGuest = () => !user || user.is_anonymous || !user.email;
const authErr = er => { const t = String((er && er.message) || er); return /invalid login|invalid credentials/i.test(t) ? "E-Mail oder Passwort stimmt nicht." : /already|registered|exists/i.test(t) ? "Diese E-Mail hat schon ein Konto. Melde dich damit an." : /confirm|not confirmed/i.test(t) ? "Supabase verlangt noch eine E-Mail-Bestätigung. In Supabase unter Authentication → Sign In / Providers → Email „Confirm email“ ausschalten." : /weak|short|at least|password/i.test(t) ? "Das Passwort ist zu kurz oder zu einfach (mindestens 8 Zeichen)." : /valid email|invalid.*email|email.*invalid/i.test(t) ? "Diese E-Mail-Adresse ist ungültig." : /rate|too many/i.test(t) ? "Zu viele Versuche. Warte kurz und versuch es dann nochmal." : fail(er); };
/* mode: "signup" | "login" | "secure" (altes Gastkonto) */
function authView(el, cont, mode) {
  const intro = mode !== "secure" && !st().on;
  const T = { signup: ["Konto erstellen", "Erstelle ein Konto mit E-Mail und Passwort. Damit bist du in der App, im Browser und auf jedem Gerät dieselbe Person.", "Konto erstellen"],
    login: ["Anmelden", "Melde dich mit deiner E-Mail und deinem Passwort an. Freunde, Gruppen und Chats sind dann auch hier da.", "Anmelden"],
    secure: ["Konto sichern", "Gemeinsam funktioniert jetzt nur noch mit Konto. Sichere dein bisheriges Gastkonto mit E-Mail und Passwort, dann bleiben Freunde, Gruppen und Chats erhalten.", "Konto sichern"] }[mode];
  el.innerHTML = `<div class="page so">${head("Gemeinsam lernen", "Freunde, Chats, Gruppen und ein Global-Chat für alle.")}
    <div class="so-auth-wrap">${intro ? `<section class="card so-intro"><div class="so-ill" aria-hidden="true"><i></i><i></i><i></i></div>
        <ul class="muted"><li>Freunde per QR-Code oder Freundescode hinzufügen und privat schreiben.</li><li>Offene oder private Gruppen gründen, zum Lernen, mit Freunden oder für Projekte.</li><li>Ein offener Global-Chat mit allen, die StudyOS nutzen.</li></ul>
        <p class="muted" style="font-size:13px">Sichtbar für andere sind nur dein Name „${esc(S().name || "Studi")}“ und dein Avatar, nicht deine E-Mail und nicht dein Lernstand. Nachrichten liegen auf einem Server in der EU. Ohne Internet funktioniert alles andere in StudyOS wie bisher.</p></section>` : ""}
    <section class="card so-auth">${mode === "secure" ? "" : `<div class="so-seg" role="tablist"><button class="chip ${mode === "signup" ? "acc" : ""}" data-mode="signup" role="tab" aria-selected="${mode === "signup"}">Konto erstellen</button><button class="chip ${mode === "login" ? "acc" : ""}" data-mode="login" role="tab" aria-selected="${mode === "login"}">Anmelden</button></div>`}
      <h3>${T[0]}</h3><p class="muted">${T[1]}</p>
      <form class="col" id="so-af"><label class="fld">E-Mail<input id="so-ae" type="email" autocomplete="email" required placeholder="name@edu.fh-joanneum.at"></label>
        <label class="fld">Passwort${mode === "login" ? "" : " (mindestens 8 Zeichen)"}<input id="so-ap" type="password" minlength="${mode === "login" ? 1 : 8}" autocomplete="${mode === "login" ? "current-password" : "new-password"}" required></label>
        <div class="row so-gate-act"><button type="submit" class="btn pri">${T[2]}</button>${mode === "secure" ? `<button type="button" class="btn ghost sm" id="so-other">Mit anderem Konto anmelden</button>` : ""}</div></form></section></div></div>`;
  $$("[data-mode]", el).forEach(b => b.onclick = () => authView(el, cont, b.dataset.mode));
  const oth = $("#so-other", el); if (oth) oth.onclick = async () => { if (!confirm("Das Gastkonto auf diesem Gerät geht dabei verloren. Weiter?")) return; try { await sb.auth.signOut(); } catch (e) {} user = me = null; authView(el, cont, "login"); };
  $("#so-af", el).onsubmit = async ev => {
    ev.preventDefault(); const btn = $("#so-af [type=submit]", el); btn.disabled = true;
    const email = $("#so-ae", el).value.trim().toLowerCase(), password = $("#so-ap", el).value;
    try {
      await client();
      if (mode === "login") { const r = await sb.auth.signInWithPassword({ email, password }); if (r.error) throw r.error; user = r.data.user; }
      else if (mode === "signup") {
        const r = await sb.auth.signUp({ email, password }); if (r.error) throw r.error;
        if (!r.data.session) throw new Error("confirm"); user = r.data.user;
      } else {
        const a = await sb.auth.updateUser({ email }); if (a.error) throw a.error;
        if ((a.data.user.email || "").toLowerCase() !== email) throw new Error("confirm");
        const b = await sb.auth.updateUser({ password }); if (b.error) throw b.error; user = b.data.user;
      }
      me = null; st().on = true; App.save();
      (App.authHooks || []).forEach(f => { try { f("login", user); } catch (e) {} });
      App.toast(mode === "login" ? "Angemeldet" : mode === "signup" ? "Konto erstellt" : "Konto gesichert", "Mit " + email + " meldest du dich auf jedem Gerät an.", "✓");
      cont();
    } catch (er) { btn.disabled = false; App.toast("Hat nicht geklappt", authErr(er), "!"); }
  };
  setTimeout(() => { const e = $("#so-ae", el); if (e && !intro) e.focus(); }, 50);
}
async function logout() {
  if (!confirm("Abmelden? Du kannst dich jederzeit wieder mit E-Mail und Passwort anmelden.")) return;
  drop(); try { const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration(), sub = reg && reg.pushManager && await reg.pushManager.getSubscription(); if (sub && me) await sb.from("push_subs").delete().eq("user_id", me.id).eq("endpoint", sub.endpoint); } catch (e) {} delete st().push;
  if (inbox) { sb.removeChannel(inbox); inbox = null; } unread = {}; reqs = 0; paintBadges(); try { await sb.auth.signOut(); } catch (e) {}
  me = null; user = null; st().on = false; App.save(); (App.authHooks || []).forEach(f => { try { f("logout"); } catch (e) {} }); App.go("together", "");
}

/* ---------- QR-Code in der App scannen (statt mit der Kamera-App, die den Link im Browser öffnen würde) ---------- */
const loadJsQR = () => window.jsQR ? Promise.resolve() : new Promise((ok, no) => { const s = document.createElement("script"); s.src = "js/vendor/jsqr.js"; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
function scanDialog(onCode) {
  let stream = null, alive = true, det = null;
  const stop = () => { alive = false; if (stream) stream.getTracks().forEach(t => t.stop()); };
  const close = App.modal(`<h2>QR-Code scannen</h2><div class="so-scan"><video playsinline muted></video><i aria-hidden="true"></i></div>
    <p class="muted so-scan-msg">Halte die Kamera auf den QR-Code einer Einladung.</p><div class="row" style="justify-content:flex-end"><button class="btn pri sm" data-close>Abbrechen</button></div>`, m => {
    const video = $("video", m), msg = $(".so-scan-msg", m), c = document.createElement("canvas"), g = c.getContext("2d", { willReadFrequently: true });
    new MutationObserver((_, o) => { if (!m.isConnected) { stop(); o.disconnect(); } }).observe(document.body, { childList: true });
    const tick = async () => {
      if (!alive) return;
      if (video.readyState >= 2) {
        let text = null;
        try {
          if (det) { const r = await det.detect(video); text = r[0] && r[0].rawValue; }
          else if (window.jsQR) { const w = c.width = Math.min(640, video.videoWidth), h = c.height = Math.round(w * video.videoHeight / video.videoWidth); g.drawImage(video, 0, 0, w, h); const r = jsQR(g.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "dontInvert" }); text = r && r.data; }
        } catch (e) {}
        if (text) { stop(); close(); onCode(text); return; }
      }
      setTimeout(tick, 180);
    };
    (async () => {
      try {
        if ("BarcodeDetector" in window) { try { if ((await BarcodeDetector.getSupportedFormats()).includes("qr_code")) det = new BarcodeDetector({ formats: ["qr_code"] }); } catch (e) {} }
        if (!det) await loadJsQR();
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (!alive) return stop();
        video.srcObject = stream; await video.play(); tick();
      } catch (e) { msg.textContent = "Die Kamera ist nicht verfügbar oder wurde nicht erlaubt. Du kannst den Code auch eintippen."; }
    })();
  });
}
/* Gescannten Inhalt auswerten: Freund, Gruppe oder Geräte-Sync */
function handleScan(text) {
  const inv = /#(friend|group)=([A-Za-z0-9]{4,12})/.exec(text), pair = /#pair=([\w-]+)/.exec(text);
  if (inv) { try { sessionStorage.setItem("studyos.invite", JSON.stringify([inv[1], inv[2]])); } catch (e) {} return App.go("together", ""); }
  if (pair) { try { sessionStorage.setItem("studyos.pair", pair[1]); } catch (e) {} return location.reload(); }
  App.toast("Unbekannter Code", "Das ist kein StudyOS-Einladungscode.", "!");
}
/* Links, die in der schon offenen installierten App landen (Android: manifest handle_links + launch_handler).
   Dort lädt die Seite nicht neu, nur der #-Teil ändert sich bzw. launchQueue meldet den Link. Doppelte Meldungen werden ignoriert. */
let lastLink = ["", 0];
try { if (INVITE.length) lastLink = ["#" + INVITE[0] + "=" + INVITE[1], Date.now()]; else if (sessionStorage.getItem("studyos.pair")) lastLink = ["#pair=" + sessionStorage.getItem("studyos.pair"), Date.now()]; } catch (e) {}
function takeLink(url) {
  const h = (/#(?:friend|group|pair)=[\w-]+/.exec(url || "") || [])[0]; if (!h) return false;
  if (h === lastLink[0] && Date.now() - lastLink[1] < 8000) return true;
  lastLink = [h, Date.now()]; handleScan(h); return true;
}
window.addEventListener("hashchange", () => { if (takeLink(location.hash)) try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} });
if ("launchQueue" in window) try { window.launchQueue.setConsumer(p => p && p.targetURL && takeLink(p.targetURL)); } catch (e) {}
/* Im Browser geöffneter Einladungslink, obwohl die App installiert sein könnte: Code anzeigen */
const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
function browserHint(inv, cont) {
  App.modal(`<h2>${inv[0] === "friend" ? "Freundschaftsanfrage" : "Einladung in eine Lerngruppe"}</h2>
    <p>Du hast den Link im Browser geöffnet. Wenn du StudyOS als App installiert hast, öffne lieber die App, geh auf <b>Gemeinsam</b> und tippe auf <b>QR scannen</b> oder <b>Code eingeben</b>:</p>
    <p class="so-code-big">${esc(inv[1])}</p>
    <p class="muted" style="font-size:13px">Du kannst auch hier im Browser weitermachen und dich mit deinem Konto anmelden.</p>
    <div class="row" style="justify-content:flex-end;flex-wrap:wrap"><button class="btn sm" id="so-hc">Code kopieren</button><button class="btn pri sm" id="so-hb" data-close>Hier im Browser weiter</button></div>`, m => {
    $("#so-hc", m).onclick = () => copy(inv[1], "Code in der Zwischenablage.");
    $("#so-hb", m).addEventListener("click", cont);
  });
}

/* ---------- Seiten ---------- */
const head = (title, sub, back) => `<header class="so-head">${back ? `<button class="btn ghost sm so-back" data-go="${back[0]}"${back[1] ? ` data-p="${esc(back[1])}"` : ""}>← ${esc(back[2])}</button>` : ""}<span class="eyebrow">Gemeinsam</span><h1>${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ""}</header>`;
function gate(el, cont) {
  if (!st().on && !(sb && me)) { authView(el, cont, "signup"); return false; }
  if (!navigator.onLine) { el.innerHTML = `<div class="page so">${head("Gemeinsam", "")}<div class="empty">Du bist gerade offline. Freunde und Chats brauchen Internet, alles andere in StudyOS funktioniert weiter.</div></div>`; return false; }
  return true;
}
async function boot(el, render) {
  curR = App.route();
  if (!gate(el, () => boot(el, render))) return;
  if (!(sb && me)) el.innerHTML = `<div class="page so"><div class="so-wait"><span class="so-spin"></span>Verbinde …</div></div>`;
  try { await connect(); } catch (e) { drop(); if (stale()) return; if (e && e.auth) return authView(el, () => boot(el, render), e.auth); el.innerHTML = `<div class="page so">${head("Gemeinsam", "")}<div class="empty">${esc(fail(e))}<br><br><button class="btn sm" id="so-re">Nochmal versuchen</button></div></div>`; $("#so-re", el).onclick = () => boot(el, render); return; }
  inboxSoon();
  if (stale()) return;
  try { await render(); } catch (e) { if (stale()) return; el.innerHTML = `<div class="page so">${head("Gemeinsam", "")}<div class="empty">${esc(fail(e))}</div></div>`; }
}

/* Hub-Seite: Übersicht, Direktchat (dm:ID), Gruppe (g:ID), Global-Chat (global) */
PAGES.together = (el, p) => boot(el, async () => {
  const inv = await takeInvite(); if (inv && !p) p = inv;
  drop();
  const [kind, id] = String(p || "").split(/:(.*)/);
  if (kind === "dm") return dmPage(el, id);
  if (kind === "g") return groupPage(el, id, ["together", "", "Gemeinsam"]);
  if (kind === "global" || kind === "c") return globalPage(el);
  if (kind === "find") return findPage(el, id || "");
  const [fr, gs] = await Promise.all([friends(), myGroups()]); if (stale()) return;
  reqs = fr.inc.length; gs.forEach(g => { gnames[g.id] = g.name; });
  el.innerHTML = `<div class="page so">${head("Gemeinsam", "Freunde, Lerngruppen und der Global-Chat.")}
    <section class="card so-me">${av(me)}<div><b>${esc(me.name)}</b><small class="muted">Dein Freundescode</small><span class="so-code">${esc(me.code)}</span></div>
      <div class="so-me-act"><button class="btn pri sm" id="so-qr">QR-Code zeigen</button><button class="btn sm" id="so-scan">QR scannen</button><button class="btn sm" id="so-add">Code eingeben</button></div>
      <div class="so-sum">${summary()}</div><div class="so-acc"><span>Angemeldet als <b>${esc(user.email)}</b></span><span class="so-sp"></span><button class="btn ghost sm" id="so-out">Abmelden</button></div></section>
    ${fr.inc.length ? `<section class="card so-req"><h3>Anfragen</h3>${fr.inc.map(id => `<div class="so-row">${av(names[id])}<b>${esc(nm(id))}</b><span class="so-sp"></span><button class="btn pri sm" data-acc="${id}">Annehmen</button><button class="btn ghost sm" data-rej="${id}">Ablehnen</button></div>`).join("")}</section>` : ""}
    <div class="so-grid">
      <section class="card"><div class="spread"><h3>Freunde</h3><span class="chip">${fr.ok.length}</span></div>
        ${fr.ok.map(id => `<button class="so-row so-link" data-go="together" data-p="dm:${id}">${av(names[id])}<b>${esc(nm(id))}</b><span class="so-sp"></span><span class="muted">Chat ›</span></button>`).join("")}
        ${fr.out.map(id => `<div class="so-row">${av(names[id])}<b>${esc(nm(id))}</b><span class="so-sp"></span><span class="so-tag">wartet auf Bestätigung</span></div>`).join("")}
        ${fr.ok.length || fr.out.length ? "" : `<p class="muted">Noch keine Freunde. Zeig deinen QR-Code oder gib einen Freundescode ein.</p>`}</section>
      <section class="card"><div class="spread"><h3>Gruppen</h3><span class="chip">${gs.length}</span></div>
        ${gs.length ? gs.map(g => `<button class="so-row so-link so-grow" data-go="together" data-p="g:${g.id}"><span class="so-gi">${esc(gIcon(g))}</span><span class="so-gtxt"><b>${esc(g.name)}</b>${badges(g)}</span><span class="so-sp"></span><span class="muted">›</span></button>`).join("") : `<p class="muted">Gründe eine Gruppe, zum Lernen, mit Freunden oder für ein Projekt, oder tritt einer offenen Gruppe bei.</p>`}
        <div class="row so-gact"><button class="btn sm pri" id="so-new">Gruppe gründen</button><button class="btn sm" data-go="together" data-p="find">Gruppen entdecken</button><button class="btn ghost sm" id="so-join">Mit Code beitreten</button></div></section>
    </div>
    <section class="card so-global"><div class="spread"><h3>Global-Chat</h3><button class="btn pri sm" data-go="together" data-p="global">Öffnen ›</button></div><p class="muted">Ein Chat für alle, die StudyOS nutzen. Nachrichten bleiben 24 Stunden. Frag, was du nicht verstehst, oder hilf anderen.</p></section></div>`;
  $("#so-qr", el).onclick = () => shareDialog("Dein Freundescode", "Lass den Code scannen oder schick den Link. Wer ihn öffnet, ist mit dir befreundet.", LINK + "#friend=" + me.code, me.code);
  $("#so-scan", el).onclick = () => scanDialog(handleScan);
  $("#so-out", el).onclick = logout;
  $("#so-add", el).onclick = () => codeDialog("Freund hinzufügen", "Freundescode (8 Zeichen)", async c => { const id = await addFriend(c); await friendToast(id); PAGES.together(el, ""); });
  $("#so-new", el).onclick = () => newGroupDialog(App.currentApp && App.currentApp(), g => App.go("together", "g:" + g.id));
  $("#so-join", el).onclick = () => codeDialog("Lerngruppe beitreten", "Gruppencode (8 Zeichen)", async c => { const g = await joinGroup(c); App.go("together", "g:" + g); });
  watchFriends(() => PAGES.together(el, ""));
  el.onclick = async e => {
    const a = e.target.closest("[data-acc],[data-rej]"); if (!a) return;
    try {
      if (a.dataset.acc) await q(sb.from("friendships").update({ accepted: true }).eq("a", a.dataset.acc).eq("b", me.id));
      else await q(sb.from("friendships").delete().eq("a", a.dataset.rej).eq("b", me.id));
      reqs = Math.max(0, reqs - 1); paintBadges(); PAGES.together(el, "");
    } catch (er) { App.toast("Fehler", fail(er), "!"); }
  };
});
function codeDialog(title, label, run) {
  App.modal(`<h2>${esc(title)}</h2><form class="col" id="so-cf"><label class="fld">${esc(label)}<input type="text" id="so-ci" maxlength="12" autocomplete="off" autocapitalize="characters" spellcheck="false" style="text-transform:uppercase;letter-spacing:.12em"></label>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost sm" data-close>Abbrechen</button><button class="btn pri sm">OK</button></div></form>`, (m, close) => {
    const i = $("#so-ci", m); setTimeout(() => i.focus(), 50);
    $("#so-cf", m).onsubmit = async e => { e.preventDefault(); if (!i.value.trim()) return; try { await run(i.value); close(); } catch (er) { App.toast("Hat nicht geklappt", /Unbekannt/.test(fail(er)) ? "Diesen Code gibt es nicht." : fail(er), "!"); } };
  });
}
/* ---------- Gruppen: offen oder privat, mit Tags ---------- */
const TAGS = ["Lerngruppe", "Freunde", "Prüfung", "Hausübung", "Projekt", "Erstsemester", "Austausch"];
const gIcon = g => (CBY[g.course] && CBY[g.course].short) || (g.tags && g.tags.includes("Freunde") ? "☺" : "◎");
const badges = (g, n) => `<span class="so-tags">${g.open ? `<span class="so-tag open">Offen</span>` : `<span class="so-tag priv">Privat</span>`}${(g.tags || []).map(t => `<span class="so-tag">#${esc(t)}</span>`).join("")}${n != null ? `<span class="so-tag n">${n} ${n === 1 ? "Mitglied" : "Mitglieder"}</span>` : ""}</span>`;
const cleanTags = list => [...new Set(list.map(t => t.replace(/^#+/, "").replace(/[<>]/g, "").trim().slice(0, 20)).filter(Boolean))].slice(0, 6);
function groupDialog(course, g, done) {
  const tags = new Set((g && g.tags) || []), extra = [...tags].filter(t => !TAGS.includes(t)).join(", "), open = !!(g && g.open);
  App.modal(`<h2>${g ? "Gruppe bearbeiten" : "Gruppe gründen"}</h2><form class="col" id="so-gf">
    <label class="fld">Name der Gruppe<input type="text" id="so-gn" maxlength="60" placeholder="z. B. BWL Lerngruppe Dienstag" value="${esc((g && g.name) || "")}"></label>
    <label class="fld">Fach<select id="so-gc"><option value="">Kein bestimmtes Fach</option>${COURSES.map(c => `<option value="${c.id}" ${c.id === ((g && g.course) || course) ? "selected" : ""}>${esc(c.title)}</option>`).join("")}</select></label>
    <div class="fld">Wer kann beitreten?<div class="so-vis">
      <label class="so-opt"><input type="radio" name="so-vis" value="0" ${open ? "" : "checked"}><span><b>Privat</b><small>Nur mit Einladung per Code oder QR-Code</small></span></label>
      <label class="so-opt"><input type="radio" name="so-vis" value="1" ${open ? "checked" : ""}><span><b>Offen</b><small>Alle finden die Gruppe unter „Gruppen entdecken“ und können direkt beitreten</small></span></label></div></div>
    <div class="fld">Tags<div class="so-tagpick">${TAGS.map(t => `<button type="button" class="chip" data-tag="${esc(t)}" aria-pressed="${tags.has(t)}">#${esc(t)}</button>`).join("")}</div>
      <input type="text" id="so-gt" maxlength="80" placeholder="Eigene Tags, mit Komma getrennt" value="${esc(extra)}"></div>
    <label class="fld">Beschreibung (optional)<textarea id="so-ga" maxlength="200" rows="2" placeholder="Worum geht es, wann trefft ihr euch?">${esc((g && g.about) || "")}</textarea></label>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost sm" data-close>Abbrechen</button><button type="submit" class="btn pri sm">${g ? "Speichern" : "Gründen"}</button></div></form>`, (m, close) => {
    $(".so-tagpick", m).onclick = e => { const b = e.target.closest("[data-tag]"); if (b) b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true"); };
    setTimeout(() => $("#so-gn", m).focus(), 50);
    $("#so-gf", m).onsubmit = async e => {
      e.preventDefault(); const name = $("#so-gn", m).value.trim(); if (!name) return $("#so-gn", m).focus();
      const f = { name, course: $("#so-gc", m).value, open: $("[name=so-vis]:checked", m).value === "1", about: $("#so-ga", m).value.trim(),
        tags: cleanTags($$("[data-tag][aria-pressed=true]", m).map(b => b.dataset.tag).concat($("#so-gt", m).value.split(","))) };
      try {
        if (g) { await q(sb.from("groups").update({ name: f.name, course: f.course || null, open: f.open, tags: f.tags, about: f.about || null }).eq("id", g.id)); close(); App.toast("Gespeichert", f.open ? "Die Gruppe ist offen und auffindbar." : "Die Gruppe ist privat.", "✓"); return done(g); }
        const ng = await createGroup(f); close();
        App.toast("Gruppe gegründet", f.open ? "Sie ist offen, andere finden sie unter „Gruppen entdecken“." : "Lade andere mit dem Gruppencode ein.", "◎"); done(ng);
      } catch (er) { App.toast("Fehler", fail(er), "!"); }
    };
  });
}
const newGroupDialog = (course, done) => groupDialog(course, null, done);
/* Offene Gruppen finden und beitreten (p = "find" oder "find:FACH") */
async function findPage(el, fach) {
  const f = { search: "", tag: null, fach: CBY[fach] ? fach : null };
  el.innerHTML = `<div class="page so">${head("Gruppen entdecken", "Offene Gruppen, denen du direkt beitreten kannst. Private Gruppen erscheinen hier nicht.", ["together", "", "Gemeinsam"])}
    <div class="so-find"><input type="search" id="so-fq" placeholder="Name, Thema oder Tag suchen …" autocomplete="off"><select id="so-fc"><option value="">Alle Fächer</option>${COURSES.map(c => `<option value="${c.id}" ${c.id === f.fach ? "selected" : ""}>${esc(c.title)}</option>`).join("")}</select><button class="btn pri sm" id="so-fnew">Gruppe gründen</button></div>
    <div class="so-tagbar"><button class="chip acc" data-ft="">Alle</button>${TAGS.map(t => `<button class="chip" data-ft="${esc(t)}">#${esc(t)}</button>`).join("")}</div>
    <div class="so-found"><p class="muted">Lädt …</p></div></div>`;
  const box = $(".so-found", el); let tmr = null, n = 0;
  const load = async () => {
    const my = ++n;
    try {
      const rows = await q(sb.rpc("discover_groups", { search: f.search, tag: f.tag, fach: f.fach })); if (my !== n || stale()) return;
      box.innerHTML = rows.length ? rows.map(g => `<article class="card so-gcard"><div class="so-gcard-h"><span class="so-gi">${esc(gIcon(g))}</span><b>${esc(g.name)}</b></div>${badges(Object.assign({ open: true }, g), Number(g.members))}
        ${g.about ? `<p class="muted">${esc(g.about)}</p>` : ""}<div class="row">${g.joined ? `<button class="btn sm" data-go="together" data-p="g:${g.id}">Öffnen</button>` : `<button class="btn pri sm" data-join="${g.id}">Beitreten</button>`}</div></article>`).join("")
        : `<div class="empty">Keine offene Gruppe gefunden.<br><br><button class="btn sm pri" id="so-fnew2">Selbst eine gründen</button></div>`;
      const b2 = $("#so-fnew2", box); if (b2) b2.onclick = () => newGroupDialog(f.fach, g => App.go("together", "g:" + g.id));
    } catch (e) { if (my === n && !stale()) box.innerHTML = `<div class="empty">${esc(fail(e))}</div>`; }
  };
  $("#so-fq", el).oninput = e => { clearTimeout(tmr); tmr = setTimeout(() => { f.search = e.target.value.trim(); load(); }, 250); };
  $("#so-fc", el).onchange = e => { f.fach = e.target.value || null; load(); };
  $("#so-fnew", el).onclick = () => newGroupDialog(f.fach, g => App.go("together", "g:" + g.id));
  el.onclick = async e => {
    const t = e.target.closest("[data-ft]");
    if (t) { f.tag = t.dataset.ft || null; $$("[data-ft]", el).forEach(b => b.classList.toggle("acc", b === t)); return load(); }
    const j = e.target.closest("[data-join]"); if (!j) return;
    j.disabled = true;
    try { await joinOpen(j.dataset.join); App.toast("Beigetreten", "Du bist jetzt in der Gruppe.", "◎"); App.go("together", "g:" + j.dataset.join); }
    catch (er) { j.disabled = false; App.toast("Hat nicht geklappt", /privat/i.test(fail(er)) ? "Die Gruppe ist inzwischen privat." : fail(er), "!"); }
  };
  load();
}
async function dmPage(el, id) {
  const fr = await friends(); if (stale()) return;
  if (!fr.ok.includes(id)) {
    const inc = fr.inc.includes(id), out = fr.out.includes(id);
    el.innerHTML = `<div class="page so">${head(`${av(names[id])} ${esc(nm(id))}`, "", ["together", "", "Gemeinsam"])}<div class="empty">${inc ? `${esc(nm(id))} möchte mit dir befreundet sein.<br><br><button class="btn pri sm" id="so-dacc">Annehmen</button>` : out ? `${esc(nm(id))} muss deine Anfrage noch annehmen. Sobald das passiert, könnt ihr hier schreiben.` : "Ihr seid (noch) nicht befreundet."}</div></div>`;
    const b = $("#so-dacc", el); if (b) b.onclick = async () => { try { await q(sb.from("friendships").update({ accepted: true }).eq("a", id).eq("b", me.id)); dmPage(el, id); } catch (e) { App.toast("Fehler", fail(e), "!"); } };
    watchFriends(() => dmPage(el, id)); return;
  }
  await loadNames([id]); if (stale()) return;
  el.innerHTML = `<div class="page so so-full">${head(`${av(names[id])} ${esc(nm(id))}`, "", ["together", "", "Gemeinsam"])}<div class="so-tools"><button class="btn ghost sm" id="so-unf">Freundschaft beenden</button></div><div class="card so-box"></div></div>`;
  $("#so-unf", el).onclick = async () => { if (!confirm(`Freundschaft mit ${nm(id)} beenden?`)) return; try { await q(sb.from("friendships").delete().or(`and(a.eq.${me.id},b.eq.${id}),and(a.eq.${id},b.eq.${me.id})`)); App.go("together", ""); } catch (e) { App.toast("Fehler", fail(e), "!"); } };
  chat($(".so-box", el), { to_user: id }, `Nachricht an ${nm(id)} …`); markRead("dm:" + id);
}
async function groupPage(el, gid, back) {
  const g = await q(sb.from("groups").select("*").eq("id", gid).single());
  const mem = await q(sb.from("group_members").select("user_id").eq("group_id", gid)); await loadNames(mem.map(m => m.user_id)); if (stale()) return;
  const c = CBY[g.course];
  el.innerHTML = `<div class="page so so-full">${head(esc(g.name), `${esc(c ? c.title : "Allgemeine Gruppe")} · ${mem.length} ${mem.length === 1 ? "Mitglied" : "Mitglieder"}${g.about ? " · " + esc(g.about) : ""}`, back)}${badges(g)}
    <div class="so-tools"><div class="so-mem">${mem.slice(0, 8).map(m => `<span title="${esc(nm(m.user_id))}">${av(names[m.user_id])}</span>`).join("")}</div><span class="so-sp"></span>
      <button class="btn sm pri" id="so-inv">Einladen</button>${g.owner === me.id ? `<button class="btn sm" id="so-edit">Bearbeiten</button>` : ""}<button class="btn ghost sm" id="so-leave">${g.owner === me.id ? "Gruppe löschen" : "Verlassen"}</button></div>
    <div class="card so-box"></div></div>`;
  const ed = $("#so-edit", el); if (ed) ed.onclick = () => groupDialog(null, g, () => groupPage(el, gid, back));
  $("#so-inv", el).onclick = () => shareDialog("In die Gruppe einladen", `Wer den Code scannt oder den Link öffnet, tritt „${g.name}“ bei.`, LINK + "#group=" + g.invite, g.invite);
  $("#so-leave", el).onclick = async () => {
    const own = g.owner === me.id; if (!confirm(own ? "Gruppe für alle löschen?" : "Gruppe verlassen?")) return;
    try { await q(own ? sb.from("groups").delete().eq("id", gid) : sb.from("group_members").delete().eq("group_id", gid).eq("user_id", me.id)); App.go(back[0], back[1]); } catch (e) { App.toast("Fehler", fail(e), "!"); }
  };
  gnames[gid] = g.name; chat($(".so-box", el), { group_id: gid }, "In die Gruppe schreiben …"); markRead("g:" + gid);
}

/* Global-Chat: ein offener Raum für alle (messages.course = "global", 24 Stunden) */
function globalPage(el) {
  el.innerHTML = `<div class="page so so-full">${head("Global-Chat", "Offen für alle, die StudyOS nutzen. Nachrichten und Anhänge verschwinden nach 24 Stunden. Bleib freundlich, keine privaten Daten.")}
    <div class="so-tools so-gtabs"><button class="chip" data-go="together">‹ Gemeinsam</button><button class="chip" data-go="together" data-p="find">Gruppen entdecken</button></div>
    <div class="card so-box"></div></div>`;
  chat($(".so-box", el), { course: "global" }, "An alle schreiben …");
}

/* Fach-App: Lerngruppen dieses Fachs (p = Fach-ID oder "FACH|g:GRUPPE") */
PAGES.coursechat = (el, p) => boot(el, async () => {
  drop();
  const [cid, sub] = String(p || (App.currentApp && App.currentApp()) || "").split("|"), c = CBY[cid];
  if (!c) return App.go("together", "");
  if (sub && sub.startsWith("g:")) return groupPage(el, sub.slice(2), ["coursechat", cid, "Lerngruppen " + c.short]);
  const gs = (await myGroups()).filter(g => g.course === cid); if (stale()) return;
  el.innerHTML = `<div class="page so">${head(`Lerngruppen · ${esc(c.title)}`, "Deine Gruppen zu diesem Fach. Für alle offen schreibst du im Global-Chat.")}
    <section class="card"><div class="spread"><h3>Gruppen</h3><span class="chip">${gs.length}</span></div>
      ${gs.length ? gs.map(g => `<button class="so-row so-link so-grow" data-go="coursechat" data-p="${cid}|g:${g.id}"><span class="so-gi">${esc(gIcon(g))}</span><span class="so-gtxt"><b>${esc(g.name)}</b>${badges(g)}</span><span class="so-sp"></span><span class="muted">›</span></button>`).join("") : `<p class="muted">Noch keine Gruppe zu ${esc(c.title)}. Gründe eine oder tritt einer offenen Gruppe bei.</p>`}
      <div class="row so-gact"><button class="btn sm pri" id="so-cnew">Gruppe gründen</button><button class="btn sm" data-go="together" data-p="find:${cid}">Offene Gruppen</button><button class="btn ghost sm" id="so-cjoin">Mit Code beitreten</button></div></section>
    <section class="card so-global"><div class="spread"><h3>Global-Chat</h3><button class="btn pri sm" data-go="together" data-p="global">Öffnen ›</button></div><p class="muted">Ein offener Chat für alle, die StudyOS nutzen.</p></section>
    <div class="row"><button class="btn ghost sm" data-go="together">Freunde & alle Gruppen ›</button></div></div>`;
  $("#so-cnew", el).onclick = () => newGroupDialog(cid, g => App.go("coursechat", cid + "|g:" + g.id));
  $("#so-cjoin", el).onclick = () => codeDialog("Lerngruppe beitreten", "Gruppencode (8 Zeichen)", async code => { const g = await joinGroup(code); App.go("together", "g:" + g); });
});

/* ---------- Web Push: Mitteilungen auch bei geschlossener App ----------
   Nur im Modus „Am Gerät“. Das Gerät meldet sich bei der Edge Function „push“ an (supabase-update-6.sql + supabase/functions/push).
   st().push: "ok" | "missing" (Dienst noch nicht eingerichtet) | "unsupported" | Fehlertext */
const u8 = b64 => { const s = atob(b64.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64.length + 3) % 4)); return Uint8Array.from(s, c => c.charCodeAt(0)); };
const pushOk = () => st().push === "ok";
async function pushSync() {
  if (!sb || !me) return;
  const s = st(), want = note().mode === "system" && typeof Notification !== "undefined" && Notification.permission === "granted";
  let reg = null; try { reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration(); } catch (e) {}
  if (!reg || !reg.pushManager) { if (want) { s.push = "unsupported"; App.save(); } return; }
  let sub = null; try { sub = await reg.pushManager.getSubscription(); } catch (e) {}
  if (!want) { if (sub) try { await sb.from("push_subs").delete().eq("user_id", me.id).eq("endpoint", sub.endpoint); } catch (e) {} if (s.push) { delete s.push; App.save(); } return; }
  try {
    const r = await fetch(SB_URL + "/functions/v1/push", { headers: { Authorization: "Bearer " + SB_KEY, apikey: SB_KEY } });
    if (!r.ok) throw Object.assign(new Error("HTTP " + r.status), { missing: r.status === 404 || r.status === 500 });
    const key = (await r.json()).key; if (!key) throw Object.assign(new Error("kein Schlüssel"), { missing: true });
    const opts = { userVisibleOnly: true, applicationServerKey: u8(key) };
    try { if (!sub) sub = await reg.pushManager.subscribe(opts); }
    catch (e) { if (sub) await sub.unsubscribe().catch(() => {}); sub = await reg.pushManager.subscribe(opts); }
    if (sub.options && sub.options.applicationServerKey && btoa(String.fromCharCode(...new Uint8Array(sub.options.applicationServerKey))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") !== key) { await sub.unsubscribe(); sub = await reg.pushManager.subscribe(opts); }
    const j = sub.toJSON();
    await q(sb.from("push_subs").upsert({ user_id: me.id, endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth }, { onConflict: "user_id,endpoint" }));
    s.push = "ok";
  } catch (e) { s.push = e && e.missing || /push_subs|relation|schema cache/i.test(String(e && e.message)) ? "missing" : String((e && e.message) || e).slice(0, 120); }
  App.save(); const ps = $(".so-push"); if (ps) ps.textContent = pushText();
}
const pushText = () => { if (note().mode !== "system") return ""; const p = st().push;
  return p === "ok" ? "✓ Auch bei geschlossener App: Dieses Gerät bekommt Mitteilungen, solange der Browser bzw. das Handy sie zulässt."
    : p === "missing" ? "Bei geschlossener App noch nicht: Der Push-Dienst ist in Supabase noch nicht eingerichtet (supabase-update-6.sql und Funktion „push“). Solange StudyOS offen oder im Hintergrund ist, klappt es schon."
    : p === "unsupported" ? "Dieser Browser kann keine Mitteilungen bei geschlossener App. Installiere StudyOS als App (Chrome oder Edge)."
    : p ? "Push-Anmeldung fehlgeschlagen: " + p : "Melde dieses Gerät an …"; };
/* ---------- Benachrichtigungen und ungelesene Nachrichten ----------
   Sobald man angemeldet ist, hört StudyOS im Hintergrund auf neue Direktnachrichten, Gruppen-Nachrichten und Freundschaftsanfragen.
   Einstellung (pro Profil): „system“ = Mitteilung von Windows, macOS oder Handy, auch wenn StudyOS nur im Hintergrund offen ist;
   „app“ = Hinweis nur in StudyOS, solange es offen ist; „off“ = nur die Zähler. Ungelesen zählt pro Chat ab dem letzten Öffnen. */
const note = () => st().note || (st().note = { mode: "app" });
let inbox = null, gids = [], gnames = {}, unread = {}, reqs = 0, painting = 0;
const keyOf = m => m.group_id ? "g:" + m.group_id : "dm:" + (m.sender === (me && me.id) ? m.to_user : m.sender);
const readAt = k => (st().read || {})[k] || st().readBase || 0;
const msgCount = () => Object.values(unread).reduce((a, u) => a + u.n, 0);
App.unread = () => ({ messages: msgCount(), requests: reqs, total: msgCount() + reqs });
/* welcher Chat gerade sichtbar offen ist */
function viewing() {
  if (document.visibilityState !== "visible") return null;
  const R = App.route(), p = String(R.p || "");
  if (R.v === "together" && /^(dm|g):/.test(p)) return p;
  if (R.v === "coursechat" && p.includes("|g:")) return "g:" + p.split("|g:")[1];
  return null;
}
function markRead(k) {
  const s = st(); s.read = s.read || {}; s.read[k] = Math.max(Date.now(), (unread[k] && unread[k].last) || 0);
  if (unread[k]) { delete unread[k]; paintBadges(); } App.save();
}
async function loadUnread() {
  const rd = st().read || {}, since = Math.min(st().readBase || Date.now(), ...Object.values(rd));
  let qq = sb.from("messages").select("id,sender,to_user,group_id,created_at").neq("sender", me.id).gt("created_at", new Date(since).toISOString()).order("created_at", { ascending: false }).limit(300);
  qq = gids.length ? qq.or(`to_user.eq.${me.id},group_id.in.(${gids.join(",")})`) : qq.eq("to_user", me.id);
  const rows = await q(qq), next = {};
  rows.forEach(m => { const k = keyOf(m), t = Date.parse(m.created_at); if (t > readAt(k)) { const u = next[k] || (next[k] = { n: 0, last: 0 }); u.n++; u.last = Math.max(u.last, t); } });
  const v = viewing(); unread = next; if (v && unread[v]) markRead(v);
  try { reqs = (await friends()).inc.length; } catch (e) {}
  await loadNames(rows.filter(m => !m.group_id).map(m => m.sender)); paintBadges();
}
async function startInbox() {
  if (!sb || !me) return;
  const s = st(); if (!s.readBase) { s.readBase = Date.now(); App.save(); } /* beim ersten Mal zählt nur, was ab jetzt kommt */
  const gs = await myGroups(); gs.forEach(g => { gnames[g.id] = g.name; });
  const ids = gs.map(g => g.id).sort();
  if (!inbox || ids.join() !== gids.join()) {
    if (inbox) sb.removeChannel(inbox); gids = ids;
    inbox = sb.channel("so-inbox-" + me.id + "-" + Date.now())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `to_user=eq.${me.id}` }, p => incoming(p.new))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "friendships", filter: `b=eq.${me.id}` }, p => friendReq(p.new));
    if (gids.length) inbox.on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `group_id=in.(${gids.join(",")})` }, p => incoming(p.new));
    inbox.subscribe();
  }
  await loadUnread(); pushSync().catch(() => {});
}
const inboxSoon = () => { if (sb && me) startInbox().catch(() => {}); };
async function incoming(m) {
  if (!m || m.sender === me.id) return;
  const k = keyOf(m), t = Date.parse(m.created_at) || Date.now();
  if (viewing() === k) return markRead(k);
  const u = unread[k] || (unread[k] = { n: 0, last: 0 }); u.n++; u.last = Math.max(u.last, t); paintBadges();
  await loadNames([m.sender]);
  const who = nm(m.sender), title = m.group_id ? (gnames[m.group_id] || "Gruppe") : who;
  const body = (m.group_id ? who + ": " : "") + (m.body ? m.body.slice(0, 140) : m.file ? "📎 " + m.file.name : "Neue Nachricht");
  alertUser(title, body, k, names[m.sender]);
}
async function friendReq(r) {
  if (!r || r.b !== me.id) return;
  if (!r.accepted) { reqs++; paintBadges(); }
  await loadNames([r.a]);
  alertUser(r.accepted ? "Neuer Freund" : "Freundschaftsanfrage", nm(r.a) + (r.accepted ? " hat dich als Freund hinzugefügt. Schreib doch gleich etwas!" : " möchte mit dir befreundet sein."), "dm:" + r.a, names[r.a]);
  if (App.route().v === "together" && !App.route().p && !document.querySelector(".modal-back")) App.go("together", "");
}
/* Hinweis zeigen: im Fenster als antippbare Karte, im Hintergrund als Mitteilung des Systems */
async function alertUser(title, body, k, who) {
  const mode = note().mode; if (mode === "off") return;
  const sys = mode === "system" && typeof Notification !== "undefined" && Notification.permission === "granted";
  if (document.visibilityState === "visible" && document.hasFocus()) return inAppNote(title, body, k, who);
  if (sys && pushOk() && k !== "test") return; /* kommt per Push vom Server, sonst doppelt */
  if (sys) {
    const opts = { body, tag: "so-" + k, renotify: true, icon: "icons/v2/icon-192.png", badge: "icons/v2/icon-192.png", data: { url: "./#chat=" + k, chat: k } };
    try { const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration(); if (reg) return reg.showNotification(title, opts); } catch (e) {}
    try { const n = new Notification(title, opts); n.onclick = () => { focus(); openChat(k); n.close(); }; return; } catch (e) {}
  }
  inAppNote(title, body, k, who); /* nur „in der App“: liegt bereit, wenn man zurückkommt */
}
function inAppNote(title, body, k, who) {
  const box = $("#toasts"); if (!box) return;
  const t = document.createElement("button"); t.className = "toast so-note"; t.type = "button";
  t.innerHTML = `${av(who)}<div><div class="eyebrow">${esc(title)}</div><div>${esc(body)}</div></div>`;
  t.onclick = () => { t.remove(); openChat(k); };
  box.appendChild(t); setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 320); }, 6500);
}
const openChat = k => App.go("together", k);
/* Zähler überall eintragen: Seitenleiste, „Mehr“ am Handy, Freundes- und Gruppenzeilen, Fenstertitel und App-Symbol */
function pill(b, n, cls) {
  let s = b.querySelector(".so-unr");
  if (!n) { if (s) s.remove(); return; }
  if (!s) { s = document.createElement("span"); s.className = "so-unr " + (cls || ""); const at = b.querySelector(".so-sp") || null; at ? b.insertBefore(s, at) : b.appendChild(s); }
  const txt = n > 99 ? "99+" : String(n); if (s.textContent !== txt) s.textContent = txt;
  s.setAttribute("aria-label", n + " ungelesen");
}
function paintBadges() {
  if (painting) return; painting = 1;
  try {
    const { total } = App.unread();
    $$('#side [data-go="together"]:not([data-p])').forEach(b => pill(b, total, "badge"));
    const more = $("#bmore .ni"); if (more) { const d = more.querySelector(".so-dot"); if (total && !d) more.insertAdjacentHTML("beforeend", `<i class="bdot so-dot"></i>`); else if (!total && d) d.remove(); }
    $$('[data-go="together"][data-p^="dm:"],[data-go="together"][data-p^="g:"]').forEach(b => pill(b, (unread[b.dataset.p] || {}).n));
    $$('[data-go="coursechat"][data-p*="|g:"]').forEach(b => pill(b, (unread["g:" + b.dataset.p.split("|g:")[1]] || {}).n));
    const sum = $(".so-sum"), sh = summary(); if (sum && sum.dataset.h !== sh) { sum.innerHTML = sh; sum.dataset.h = sh; }
    const base = document.title.replace(/^\(\d+\+?\) /, ""), want = total ? `(${total > 99 ? "99+" : total}) ${base}` : base; if (document.title !== want) document.title = want;
    try { if (navigator.setAppBadge) total ? navigator.setAppBadge(total) : navigator.clearAppBadge(); } catch (e) {}
  } finally { painting = 0; }
}
const summary = () => { const { messages: m, requests: r } = App.unread(), mode = note().mode;
  return `<span class="so-sum-t">${m || r ? [m ? `<b>${m}</b> ${m === 1 ? "neue Nachricht" : "neue Nachrichten"}` : "", r ? `<b>${r}</b> ${r === 1 ? "Anfrage" : "Anfragen"}` : ""].filter(Boolean).join(" · ") : "Alles gelesen"}</span><button class="btn ghost sm" id="so-bell">🔔 ${mode === "system" ? "Am Gerät" : mode === "app" ? "In der App" : "Aus"}</button>`; };
let painter = 0;
new MutationObserver(() => { if (painting || painter) return; painter = requestAnimationFrame(() => { painter = 0; if (inbox) paintBadges(); }); }).observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener("click", e => { if (e.target.closest("#so-bell")) noteDialog(); });
/* Einstellung: wie StudyOS Bescheid gibt */
const MODES = [["system", "Am Gerät", "Mitteilung von Windows, macOS oder dem Handy, auch wenn StudyOS im Hintergrund oder minimiert ist."], ["app", "Nur in der App", "Ein Hinweis oben auf dem Bildschirm, solange StudyOS offen ist. Keine Mitteilungen vom System."], ["off", "Aus", "Kein Hinweis, nur die Zähler an Gemeinsam, Freunden und Gruppen."]];
const permText = () => typeof Notification === "undefined" ? "Dieser Browser kann keine Mitteilungen anzeigen." : Notification.permission === "granted" ? "Mitteilungen sind erlaubt." : Notification.permission === "denied" ? "Mitteilungen sind blockiert. Erlaube sie in den Einstellungen des Browsers bzw. der App (Schloss-Symbol neben der Adresse)." : "Beim Wählen fragt der Browser einmal nach Erlaubnis.";
function noteHTML() {
  const mode = note().mode;
  return `<div class="so-modes" role="radiogroup">${MODES.map(([k, t, d]) => `<label class="so-opt"><input type="radio" name="so-nm" value="${k}" ${mode === k ? "checked" : ""}><span><b>${t}</b><small>${d}</small></span></label>`).join("")}</div>
    <small class="muted so-perm">${mode === "system" ? permText() : ""}</small><small class="so-push">${pushText()}</small>
    <small class="muted">Gilt für neue Direktnachrichten, Nachrichten in deinen Gruppen und Freundschaftsanfragen. Der Global-Chat meldet sich nicht. Mit „Am Gerät“ kommen Mitteilungen auch bei geschlossener App. Am Handy muss der Browser dafür im Hintergrund laufen dürfen (Xiaomi: Autostart und Akku „Keine Einschränkungen“ für Chrome).</small>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn sm" id="so-ntest">Test</button></div>`;
}
function bindNote(box, after) {
  $$("[name=so-nm]", box).forEach(r => r.onchange = async () => {
    let v = r.value;
    if (v === "system") {
      if (typeof Notification === "undefined") { App.toast("Nicht unterstützt", "Dieser Browser kann keine Mitteilungen. „Nur in der App“ funktioniert trotzdem.", "!"); v = "app"; }
      else if (Notification.permission !== "granted" && (await Notification.requestPermission()) !== "granted") { App.toast("Nicht erlaubt", "Ohne Erlaubnis zeigt StudyOS Hinweise nur in der App.", "!"); v = "app"; }
    }
    note().mode = v; App.save(); $$("[name=so-nm]", box).forEach(x => { x.checked = x.value === v; });
    $(".so-perm", box).textContent = v === "system" ? permText() : ""; $(".so-push", box).textContent = pushText(); paintBadges(); after && after();
    if (sb && me) pushSync().then(() => { $(".so-push", box).textContent = pushText(); }).catch(() => {});
  });
  $("#so-ntest", box).onclick = () => { const mode = note().mode;
    if (mode === "off") return App.toast("Benachrichtigungen sind aus", "Wähle „Am Gerät“ oder „Nur in der App“.", "!");
    if (mode === "system" && typeof Notification !== "undefined" && Notification.permission === "granted") {
      App.toast("Test kommt gleich", "Wechsle kurz in ein anderes Fenster, dann siehst du die Mitteilung.", "🔔");
      setTimeout(() => alertUser("StudyOS", "So sieht eine neue Nachricht aus.", "test", me), 3000); }
    else inAppNote("StudyOS", "So sieht eine neue Nachricht aus.", "test", me); };
}
function noteDialog() {
  App.modal(`<div class="spread"><h2>Benachrichtigungen</h2><button class="btn ghost sm" data-close>✕</button></div><p class="muted" style="font-size:14px">Wie soll StudyOS Bescheid geben, wenn dir jemand schreibt?</p>${noteHTML()}`, m => bindNote(m));
}
const settingsPage = PAGES.settings;
PAGES.settings = (el, p) => {
  settingsPage(el, p);
  const pg = $(".page", el) || el, card = document.createElement("div"); card.className = "card col";
  card.innerHTML = `<h3>Benachrichtigungen (Chat)</h3><p class="muted" style="font-size:14px">Wenn dir Freunde oder deine Gruppen schreiben${st().on ? "" : " (nach der Anmeldung unter Gemeinsam)"}.</p>${noteHTML()}`;
  pg.appendChild(card); bindNote(card);
};
/* Klick auf eine Mitteilung des Systems: der Service Worker schickt den Chat, oder die App startet mit #chat=… */
if (navigator.serviceWorker) navigator.serviceWorker.addEventListener("message", e => { const d = e.data || {}; if (d.type === "open-chat" && /^(dm|g):/.test(d.chat || "")) openChat(d.chat); });
const START_CHAT = (/^#chat=((?:dm|g):[\w-]+)$/.exec(location.hash) || [])[1];
if (START_CHAT) try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
App.afterBoot.push(() => {
  if (START_CHAT) setTimeout(() => openChat(START_CHAT), 60);
  const go = () => { if (!st().on || !navigator.onLine) return; connect().then(startInbox).catch(() => {}); };
  setTimeout(go, 1200);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { const v = viewing(); if (v && unread[v]) markRead(v); if (inbox) inboxSoon(); else go(); } });
  window.addEventListener("online", go);
});

/* Einladungslink geöffnet: direkt zu „Gemeinsam“ */
App.afterBoot.push(() => { try { if (sessionStorage.getItem("studyos.invite")) setTimeout(() => App.go("together", ""), 50); } catch (e) {} });
App.social = { connect, me: () => me, client: () => sb, ensure: client };
})();
