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

/* Anmelde-Link aus der FH-Bestätigungsmail (#access_token=…&type=magiclink): Sitzung merken, Adresse leeren */
const FHLINK = (() => { const h = new URLSearchParams((location.hash || "").replace(/^#/, ""));
  if (!h.get("access_token") || !/^(magiclink|recovery)$/.test(h.get("type") || "")) return null;
  try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  return { access_token: h.get("access_token"), refresh_token: h.get("refresh_token") }; })();

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
    let fromMail = false;
    if (FHLINK && !FHLINK.used) { FHLINK.used = true; try { const r = await sb.auth.setSession(FHLINK); fromMail = !r.error; } catch (e) {} }
    const { data } = await sb.auth.getSession(); user = data && data.session && data.session.user;
    if (!user) throw Object.assign(new Error("Nicht angemeldet"), { auth: "login" });
    if (fromMail && !st().on) { st().on = true; App.save(); }
    try { const P = SP(); if (P && !P.isGuest() && !P.acct()) P.bind(user.email); } catch (e) {}
    if (isGuest()) throw Object.assign(new Error("Gastkonto"), { auth: "secure" }); /* alte Gastkonten erst mit E-Mail sichern */
    const prof = { id: user.id, name: (S().name || "Studi").slice(0, 40), avatar: (S().settings.avatar || "").slice(0, 8) || null };
    const r = await sb.from("profiles").upsert(prof).select().single(); if (r.error) throw r.error;
    me = r.data; names[me.id] = me;
    try { const c = await sb.rpc("my_code"); if (!c.error && c.data) me.code = c.data; } catch (e) {} /* ab Update 5 steht der Code nicht mehr im Profil */
    cleanOwn();
    await modLoad().catch(() => {}); nameCheck(prof.name); notesCheck().catch(() => {}); startMod();
    await fhLoad();
    if (fromMail && fhKind(user.email) && !fhRow) await fhConfirm().then(() => App.toast("FH-Adresse bestätigt", fhOk() ? "Du kannst jetzt Lerngruppen nutzen." : "Jetzt noch den Studiengangs-Code eingeben (Fach-App → Lerngruppen).", "✓")).catch(() => {});
  })();
  try { await loading; } finally { loading = null; }
}
const fail = e => { const m = String((e && (e.message || e.msg)) || e || ""); return /Nur für FH-Konten/.test(m) ? "Lerngruppen zu einem Fach gibt es nur für bestätigte FH-JOANNEUM-Konten aus Wirtschaftsinformatik." : /fh_verify|fh_join_wi|admin_wi_code|admin_fh_(?!test)|fh_verified/i.test(m) ? "Dafür fehlt noch ein Datenbank-Update. Im Supabase SQL Editor einmal supabase-update-11.sql ausführen." : /admin_fh_test|fh_admin_test/i.test(m) ? "Dafür fehlt noch ein Datenbank-Update. Im Supabase SQL Editor einmal supabase-update-12.sql ausführen." : /discover_groups|join_open_group|groups_extra_ok|column [^ ]*(open|tags|about)/i.test(m) ? "Für offene Gruppen und Tags fehlt noch ein Datenbank-Update. Im Supabase SQL Editor einmal supabase-update-4.sql ausführen." : /relation|does not exist|schema cache|PGRST20/.test(m) ? "Die Datenbank ist noch nicht eingerichtet. Im Supabase SQL Editor einmal supabase-setup.sql ausführen." : /anonymous.*disabled|disabled.*anonymous/i.test(m) ? "Anonyme Anmeldung ist in Supabase noch ausgeschaltet (Authentication → Sign In / Providers → Allow anonymous sign-ins, dann Save changes). Supabase meldet: " + m : /fetch|network|Bibliothek/i.test(m) ? "Keine Verbindung. Prüf dein Internet und versuch es nochmal." : "Fehler von Supabase: " + (m || "unbekannt"); };
const q = async p => { const r = await p; if (r.error) throw r.error; return r.data; };

/* Namen und Avatare anderer zwischenspeichern */
const names = {};
async function loadNames(ids) { const miss = [...new Set(ids)].filter(id => id && !names[id]); if (miss.length) (await q(sb.from("profiles").select("id,name,avatar").in("id", miss))).forEach(p => { names[p.id] = p; }); }
const av = p => `<span class="so-av" aria-hidden="true">${esc((p && p.avatar) || ((p && p.name) || "?")[0].toUpperCase())}</span>`;
const nm = id => mask((names[id] && names[id].name) || "Unbekannt");
/* ---------- Moderation: Schimpfwort-Filter, Melden, Admin (supabase-update-9.sql) ----------
   Die Datenbank verdeckt und meldet selbst (Trigger), die App warnt nur vorher und verdeckt alte Nachrichten.
   Wer Admin ist, steht nur in der Tabelle admins; die App blendet die Admin-Knöpfe bloß ein. */
let isAdmin = (() => { try { return !!st().admin; } catch (e) { return false; } })(), modOk = false, adminSet = new Set(), badRe = null, words = [], modCh = null, nameWarned = false, adminRedraw = null;
App.ADMIN = isAdmin;
const WORDS0 = ["a55hole", "aloch", "amk", "ananı sikeyim", "arrombado", "arsch", "arschgeige", "arschgesicht", "arschkriecher", "arschl0ch", "arschloch", "arsehole", "asozial", "asshole", "b1tch", "bakayaro", "bastard", "baszd", "batard", "bazdmeg", "behenchod", "beidl", "bhenchod", "bhosdi", "bhosdike", "biatch", "bitch", "blowjob", "blya", "blyad", "blyat", "blöde kuh", "blöde sau", "blödian", "blödmann", "bollocks", "bring dich um", "buceta", "bullshit", "bumsen", "bâtard", "cabron", "cabrón", "caralho", "cazzo", "chinga", "chingada", "chinks", "chuj", "chutiya", "cipa", "cocksucker", "coglione", "connard", "connasse", "coño", "culero", "cunt", "curak", "căcat", "damn", "depp", "dickhead", "dildo", "dipshit", "douchebag", "drecksack", "drecksau", "dreckskerl", "dreckssau", "drecksschwein", "dreckstück", "drkadžija", "dumbass", "dummbeutel", "dumme kuh", "dumme sau", "dummkopf", "dupek", "ebat", "eierlutscher", "encule", "enculé", "f1ck", "faggot", "faszfej", "faszom", "fetzenschädl", "fick", "fikk", "filho da puta", "fils de pute", "flittchen", "foda", "fodase", "fotze", "frocio", "fuck", "funsn", "gamoto", "gandon", "gfrast", "gilipollas", "godverdomme", "govno", "gschissener", "gschissn", "gtfo", "hackfresse", "halt dein maul", "halt die fresse", "halt die schnauze", "halts maul", "heil hitler", "hentai", "hijo de perra", "hijo de puta", "hirni", "hohlkopf", "hovno", "huevón", "huj", "hure", "huren", "hurens0hn", "hurensohn", "häng dich auf", "ibn el sharmouta", "ibne", "idiot", "jackass", "javla", "jebac", "jebać", "jebem", "jebem ti mater", "jebi", "jebo", "jebote", "joder", "jävla", "kack", "kacke", "kahpe", "kameltreiber", "kanacke", "kanake", "khuy", "kikes", "kill yourself", "kinderficker", "klootzak", "kokot", "kos omak", "kotzbrocken", "kreten", "kurcina", "kurva", "kurva anyád", "kurčina", "kusipää", "kutwijf", "kys", "leck mich", "madarchod", "malaka", "malakas", "malparido", "maricon", "maricón", "merda", "merde", "mierda", "milf", "minchia", "missgeburt", "mistgeburt", "mistkerl", "miststück", "mistvieh", "mongoloid", "mongool", "moron", "motherfucker", "mudak", "muie", "möse", "nahui", "nahuy", "neger", "nigga", "nigger", "nique ta mere", "nique ta mère", "niquer", "nutte", "oasch", "oaschloch", "omfg", "orospu", "pendejo", "penner", "perkele", "pezevenk", "phuck", "picsa", "pidar", "pidaras", "pidh", "pidor", "pierdol", "pimmel", "piss", "pisser", "pissnelke", "pizda", "pizdec", "pizdets", "piç", "pička", "pička ti materina", "pičku", "polacke", "porca puttana", "porn", "porno", "poutana", "prdel", "pussy", "puta madre", "putain", "puttana", "pédé", "píča", "retard", "saatana", "salopes", "sauhund", "saukerl", "sautrottel", "sch31ss", "scheiss", "scheiß", "schlampe", "schlitzauge", "schwachkopf", "schwachmat", "schwanzlutscher", "schwuchtel", "sh1t", "sharmoota", "sharmouta", "sharmuta", "shit", "sieg heil", "sikerim", "sikeyim", "sikiyim", "siktir", "skurwiel", "skurwysyn", "sluts", "slutty", "spacken", "spacko", "spast", "spierdalaj", "stfu", "stronza", "stronzo", "stupid", "suka", "supak", "ta gueule", "titte", "tranny", "troia", "trottel", "trottl", "tschusch", "tunte", "twat", "va te faire foutre", "vaffanculo", "verpiss", "verreck", "vittu", "vollasi", "vollhorst", "vollidiot", "vollkoffer", "vollpfosten", "vollspast", "volltrottel", "wanker", "wappler", "white power", "whore", "wichs", "wichser", "wichsvorlage", "wixer", "wixx", "wixxer", "wtf", "yarak", "yarrak", "yebat", "zalupa", "zigeuner", "zipfelklatscher", "zmrd", "čurák", "šupak", "γαμώτο", "μαλάκα", "πουτάνα", "бля", "блядь", "блять", "гандон", "долбоёб", "ебал", "ебать", "залупа", "мудак", "нахуй", "пидор", "пидорас", "пизда", "пиздец", "сука", "уёбок", "хуй", "хуйня", "ёбаный", "شرموطة", "قحبة", "منيوك", "他妈的", "操你妈", "王八蛋"];
const okWord = w => /^[\p{L}\p{N} ]{3,40}$/u.test(w) && w === w.toLowerCase(); /* alle Schriften, aber keine Sonderzeichen */
function setWords(ws) {
  words = [...new Set(ws.map(x => String(x).toLowerCase().trim()).filter(okWord))].sort();
  const alt = words.slice().sort((a, b) => b.length - a.length).join("|");
  badRe = alt ? new RegExp("(^|[^\\p{L}\\p{N}])(" + alt + ")[\\p{L}\\p{N}]*", "giu") : null;
}
setWords(WORDS0);
const badHits = t => badRe && t ? [...new Set([...String(t).matchAll(badRe)].map(m => m[2].toLowerCase()))] : [];
const mask = t => badRe && t ? String(t).replace(badRe, "$1★★★") : t;
const modFail = e => /PGRST202|could not find the function|function .* does not exist|relation .*(reports|mutes|user_notes|bad_words|admins)/i.test(String((e && (e.message || e.code)) || e)) ? "Dafür fehlt noch ein Datenbank-Update. Im Supabase SQL Editor einmal supabase-update-9.sql ausführen." : fail(e);
const until = t => new Date(t).toLocaleString("de-AT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const settle = p => Promise.resolve(p).then(r => r, error => ({ error }));
async function modLoad() {
  const [a, ids, w] = await Promise.all([settle(sb.from("admins").select("user_id").eq("user_id", me.id)), settle(sb.rpc("admin_ids")), settle(sb.from("bad_words").select("word").limit(2000))]);
  modOk = !a.error;
  const was = isAdmin; isAdmin = modOk && !!(a.data || []).length; App.ADMIN = isAdmin;
  if (!ids.error && Array.isArray(ids.data)) adminSet = new Set(ids.data.map(x => typeof x === "string" ? x : Object.values(x || {})[0]));
  if (!w.error && w.data && w.data.length) setWords(w.data.map(x => x.word));
  if (!!st().admin !== isAdmin) { if (isAdmin) st().admin = true; else delete st().admin; App.save(); }
  if (was !== isAdmin) App.renderSide();
}
/* Name mit gesperrtem Wort: der Server zeigt „Studi“, die App sagt einmal Bescheid */
function nameCheck(sent) {
  if (nameWarned || !me || me.name === sent || !badHits(sent).length) return;
  nameWarned = true;
  App.toast("Name ausgeblendet", "Dein Name enthält ein gesperrtes Wort. Andere sehen dich als „Studi“. Ändern kannst du ihn in den Einstellungen.", "!");
}
/* Verwarnungen vom Admin: beim Öffnen und live */
async function notesCheck() {
  if (!modOk) return;
  const r = await sb.from("user_notes").select("*").eq("user_id", me.id).eq("seen", false).order("created_at", { ascending: true }).limit(10);
  if (!r.error && r.data && r.data.length) showNotes(r.data);
}
function showNotes(list) {
  list = list.filter(n => n && n.user_id === me.id && !n.seen); if (!list.length) return;
  const open = $(".so-notem .so-nts");
  if (open) { open.insertAdjacentHTML("beforeend", list.map(warnHTML).join("")); }
  else App.modal(`<div class="so-notem"><span class="eyebrow">Gemeinsam</span><h2>Hinweis vom Admin</h2><div class="so-nts">${list.map(warnHTML).join("")}</div>
    <p class="muted">Bitte halte dich an einen freundlichen Umgangston. Bei weiteren Verstößen kann das Schreiben gesperrt werden.</p>
    <div class="row" style="justify-content:flex-end"><button class="btn pri sm" data-close>Verstanden</button></div></div>`);
  sb.from("user_notes").update({ seen: true }).in("id", list.map(n => n.id)).then(() => {}, () => {});
}
const warnHTML = n => `<div class="so-nt"><p>${esc(n.text)}</p><small class="muted">${time(n.created_at)}</small></div>`;
async function muteInfo() {
  if (!modOk) return null;
  const r = await settle(sb.from("mutes").select("until,reason").eq("user_id", me.id).gt("until", new Date().toISOString()).limit(1));
  return (!r.error && r.data && r.data[0]) || null;
}
const muteTxt = mu => `Du bist bis ${until(mu.until)} stummgeschaltet${mu.reason ? ` (${mu.reason})` : ""} und kannst so lange nichts schreiben.`;
/* eigener Kanal, damit ein fehlendes Update 9 die übrigen Live-Updates nicht stört */
function startMod() {
  if (!modOk || modCh) return;
  modCh = sb.channel("so-mod-" + me.id + "-" + Date.now())
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "user_notes", filter: `user_id=eq.${me.id}` }, p => showNotes([p.new]));
  if (isAdmin) modCh.on("postgres_changes", { event: "INSERT", schema: "public", table: "reports" }, p => adminAlert(p.new));
  modCh.subscribe();
}
const KIND = { filter: "Filter", user: "Gemeldet", name: "Name" };
async function adminAlert(r) {
  if (!r || !isAdmin) return;
  await loadNames([r.sender, r.reporter].filter(Boolean)).catch(() => {});
  if (adminRedraw) adminRedraw();
  alertUser("Admin · " + (r.kind === "user" ? "Neue Meldung" : r.kind === "name" ? "Name gefiltert" : "Schimpfwort gefiltert"), `${nm(r.sender)} (${r.place || "Chat"}): ${String(r.body || "").slice(0, 120)}`, "admin", names[r.sender]);
}
function reportDialog(mid) {
  const R = ["Beleidigung", "Belästigung oder Drohung", "Spam", "Unangemessener Inhalt", "Persönliche Daten"];
  App.modal(`<h2>Nachricht melden</h2><p class="muted">Die Meldung geht an den Admin. Die Person erfährt nicht, wer gemeldet hat.</p>
    <div class="so-rsns" role="radiogroup" aria-label="Grund">${R.map((x, i) => `<label class="so-rsn"><input type="radio" name="so-rsn" value="${esc(x)}"${i ? "" : " checked"}><span>${esc(x)}</span></label>`).join("")}</div>
    <textarea class="so-rtx" maxlength="200" rows="2" placeholder="Optional: was ist passiert?" aria-label="Details"></textarea>
    <div class="row" style="justify-content:flex-end;gap:8px"><button class="btn sm" data-close>Abbrechen</button><button class="btn pri sm" id="so-rsend">Melden</button></div>`, (m, close) => {
    $("#so-rsend", m).onclick = async () => {
      const why = [($("input:checked", m) || {}).value, $(".so-rtx", m).value.trim()].filter(Boolean).join(": ");
      try { await q(sb.rpc("report_message", { mid, why })); close(); App.toast("Gemeldet", "Danke. Der Admin schaut sich die Nachricht an.", "✓"); }
      catch (e) { App.toast("Nicht gemeldet", modFail(e), "!"); }
    };
  });
}

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
const drop = () => { if (chan && sb) { sb.removeChannel(chan); } if (chanL && sb) sb.removeChannel(chanL); chan = null; chanL = null; };
/* Likes (supabase-update-10.sql): Nachricht → Menge der Personen, die sie mögen */
let chanL = null, likeOk = false; const likes = {};
async function loadLikes(ids) {
  const r = await settle(sb.from("message_likes").select("message_id,user_id").in("message_id", ids.length ? ids : [0]));
  likeOk = !r.error; if (!likeOk) return;
  ids.forEach(id => { likes[id] = new Set(); }); (r.data || []).forEach(l => (likes[l.message_id] || (likes[l.message_id] = new Set())).add(l.user_id));
}
const likeHTML = m => { if (!likeOk || m.pending) return ""; const L = likes[m.id], n = L ? L.size : 0, on = !!(L && L.has(me.id));
  return `<button class="so-like${on ? " on" : ""}${n ? " has" : ""}" data-like="${m.id}" aria-pressed="${on}" aria-label="${on ? "Like zurücknehmen" : "Gefällt mir"}${n ? ", " + n + (n === 1 ? " Like" : " Likes") : ""}"><span aria-hidden="true">${on ? "♥" : "♡"}</span>${n ? `<b>${n}</b>` : ""}</button>`; };
/* Profil antippen: Name, Status, Freund hinzufügen (Anfrage), für Admins Verwarnen und Stummschalten */
async function profileDialog(uid) {
  if (!uid || uid === me.id) return;
  await loadNames([uid]).catch(() => {});
  const fr = await friends().catch(() => ({ ok: [], inc: [], out: [] }));
  const rel = fr.ok.includes(uid) ? "ok" : fr.inc.includes(uid) ? "inc" : fr.out.includes(uid) ? "out" : "";
  const who = esc(nm(uid));
  App.modal(`<div class="so-prof">${av(names[uid])}<h2>${who}${adminSet.has(uid) ? `<i class="so-adm">Admin</i>` : ""}</h2>
    <p class="muted">${rel === "ok" ? "Ihr seid befreundet." : rel === "out" ? "Anfrage gesendet. Sobald sie angenommen wird, könnt ihr direkt schreiben." : rel === "inc" ? `${who} möchte mit dir befreundet sein.` : "Ihr seid noch nicht befreundet."}</p>
    <div class="so-pact">${rel === "ok" ? `<button class="btn pri" data-pa="chat">Chat öffnen</button>` : rel === "inc" ? `<button class="btn pri" data-pa="acc">Anfrage annehmen</button>` : rel === "out" ? `<button class="btn" disabled>Anfrage gesendet</button>` : `<button class="btn pri" data-pa="add">＋ Freund hinzufügen</button>`}
      ${isAdmin ? `<button class="btn sm" data-pa="warn">Verwarnen</button><button class="btn sm" data-pa="mute">Stummschalten</button>` : ""}<button class="btn ghost sm" data-close>Schließen</button></div></div>`, (m, close) => {
    m.onclick = async e => {
      const b = e.target.closest("[data-pa]"); if (!b) return; const a = b.dataset.pa;
      try {
        if (a === "chat") { close(); App.go("together", "dm:" + uid); }
        else if (a === "acc") { await q(sb.from("friendships").update({ accepted: true }).eq("a", uid).eq("b", me.id)); close(); reqs = Math.max(0, reqs - 1); paintBadges(); App.toast("Ihr seid befreundet", `${nm(uid)} ist jetzt in deiner Freundesliste.`, "☺"); }
        else if (a === "add") { b.disabled = true; const ok = await q(sb.rpc("request_friend", { uid })); close(); App.toast(ok ? "Ihr seid befreundet" : "Anfrage gesendet", ok ? `${nm(uid)} ist jetzt in deiner Freundesliste.` : `${nm(uid)} bekommt deine Anfrage und muss sie noch annehmen.`, "☺"); }
        else if (a === "warn") { close(); warnDialog(uid); }
        else if (a === "mute") { close(); muteDialog(uid); }
      } catch (er) { b.disabled = false; App.toast("Nicht möglich", /PGRST202|request_friend/i.test(String(er && (er.message || er.code))) ? "Dafür fehlt noch ein Datenbank-Update. Im Supabase SQL Editor einmal supabase-update-10.sql ausführen." : fail(er), "!"); }
    };
  });
}
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
  return `<div class="so-m ${mine ? "mine" : ""} ${same ? "cont" : ""} ${m.file ? "has-file" : ""}" data-mid="${m.id}">${mine || same ? "" : `<button class="so-avb" data-prof="${esc(m.sender)}" aria-label="Profil von ${esc(nm(m.sender))}">${av(names[m.sender])}</button>`}
    <div class="so-b">${mine || same ? "" : `<b><button class="so-nmb" data-prof="${esc(m.sender)}">${esc(nm(m.sender))}</button>${adminSet.has(m.sender) ? `<i class="so-adm" title="Admin von StudyOS">Admin</i>` : ""}</b>`}${m.file ? fileHTML(m) : ""}${m.body ? `<p>${linkify(mask(m.body))}</p>` : ""}<small>${likeHTML(m)}${m.pending ? "wird gesendet …" : time(m.created_at)}${m.pending ? "" : mine ? ` · <button class="so-del" data-del="${m.id}" aria-label="Eigene Nachricht löschen">löschen</button>` : `${modOk ? ` · <button class="so-rep" data-rep="${m.id}" aria-label="Nachricht melden">melden</button>` : ""}${isAdmin ? ` · <button class="so-del so-adel" data-adel="${m.id}" aria-label="Nachricht als Admin löschen">löschen</button>` : ""}`}</small></div></div>`;
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
  const paintKeep = () => { const y = log.scrollTop, end = log.scrollHeight - y - log.clientHeight < 40; paint(); if (!end) log.scrollTop = y; };
  const paint = () => {
    log.innerHTML = list.length ? list.map((m, i) => msgHTML(m, list[i - 1])).join("") : `<div class="so-empty">Noch keine Nachrichten. Schreib die erste!</div>`;
    log.scrollTop = log.scrollHeight;
    $$("img", log).forEach(i => { if (!i.complete) i.onload = () => { log.scrollTop = log.scrollHeight; }; });
  };
  let query = sb.from("messages").select("*").order("created_at", { ascending: false }).limit(150);
  query = key === "to_user" ? query.or(`and(sender.eq.${me.id},to_user.eq.${val}),and(sender.eq.${val},to_user.eq.${me.id})`) : query.eq(key, val);
  if (key === "course") query = query.gt("created_at", new Date(Date.now() - DAY).toISOString()); /* offener Global-Chat zeigt nur die letzten 24 Stunden */
  const muted = mu => { if (!box.isConnected || $(".so-muted", box)) return; form.insertAdjacentHTML("beforebegin", `<div class="so-muted" role="status">${esc(muteTxt(mu))}</div>`); ta.disabled = true; ta.placeholder = "Stummgeschaltet"; };
  muteInfo().then(mu => { if (mu) muted(mu); }, () => {});
  try { list = (await q(query)).reverse(); await Promise.all([loadNames(list.map(m => m.sender)), sign(list.filter(m => m.file && !expired(m)).map(m => m.file.path)), loadLikes(list.map(m => m.id))]); if (!box.isConnected) return; paint(); }
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
  if (likeOk) {
    const onLike = (p, add) => { const l = p.new && p.new.message_id ? p.new : p.old; if (!l || !list.some(m => m.id === l.message_id)) return; const L = likes[l.message_id] || (likes[l.message_id] = new Set()); const had = L.has(l.user_id); if (add) L.add(l.user_id); else L.delete(l.user_id); if (had !== add) paintKeep(); };
    chanL = sb.channel("so-likes-" + Date.now())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "message_likes" }, p => onLike(p, true))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "message_likes" }, p => onLike(p, false))
      .subscribe();
  }
  App.cleanup = drop;
  const send = async () => {
    const body = ta.value.trim(); if (!body) return;
    const hit = badHits(body);
    if (hit.length && !confirm(`Deine Nachricht enthält ${hit.length > 1 ? "Wörter, die" : "ein Wort, das"} im Chat als ★★★ erscheint (${hit.join(", ")}).${key === "to_user" ? "" : " Der Admin bekommt einen Hinweis."}\n\nTrotzdem senden?`)) return;
    ta.value = ""; ta.style.height = "";
    try { add(await q(sb.from("messages").insert({ body, [key]: val }).select().single())); }
    catch (e) { ta.value = body; const mu = /row-level security|42501/i.test(String(e && (e.message || e.code))) && await muteInfo(); App.toast("Nicht gesendet", mu ? muteTxt(mu) : fail(e), "!"); if (mu) muted(mu); }
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
    const pf = e.target.closest("[data-prof]"); if (pf) return profileDialog(pf.dataset.prof);
    const lk = e.target.closest("[data-like]");
    if (lk) {
      const id = +lk.dataset.like, L = likes[id] || (likes[id] = new Set()), on = L.has(me.id);
      if (on) L.delete(me.id); else L.add(me.id); paintKeep();
      try { if (on) await q(sb.from("message_likes").delete().eq("message_id", id).eq("user_id", me.id)); else await q(sb.from("message_likes").insert({ message_id: id, user_id: me.id })); }
      catch (er) { if (!/duplicate|23505/.test(String(er && (er.message || er.code)))) { if (on) L.add(me.id); else L.delete(me.id); paintKeep(); App.toast("Fehler", fail(er), "!"); } }
      return;
    }
    const rp = e.target.closest("[data-rep]"); if (rp) return reportDialog(+rp.dataset.rep);
    const ad = e.target.closest("[data-adel]");
    if (ad) {
      if (!isAdmin || !confirm("Diese Nachricht als Admin für alle löschen?")) return;
      const id = +ad.dataset.adel, m = list.find(x => x.id === id);
      try { if (m && m.file) await settle(sb.storage.from(BUCKET).remove([m.file.path])); await q(sb.rpc("admin_delete_message", { mid: id })); list = list.filter(x => x.id !== id); paint(); App.toast("Gelöscht", "Die Nachricht ist für alle weg.", "✓"); }
      catch (er) { App.toast("Fehler", modFail(er), "!"); }
      return;
    }
    const d = e.target.closest("[data-del]"); if (!d || !confirm("Deine Nachricht für alle löschen?")) return;
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
function authView(el, cont, mode, bare) {
  const intro = !bare && mode !== "secure" && !st().on;
  const T = { signup: ["Konto erstellen", "Erstelle ein Konto mit E-Mail und Passwort. Damit bist du in der App, im Browser und auf jedem Gerät dieselbe Person.", "Konto erstellen"],
    login: ["Anmelden", "Melde dich mit deiner E-Mail und deinem Passwort an. Freunde, Gruppen und Chats sind dann auch hier da.", "Anmelden"],
    secure: ["Konto sichern", "Gemeinsam funktioniert jetzt nur noch mit Konto. Sichere dein bisheriges Gastkonto mit E-Mail und Passwort, dann bleiben Freunde, Gruppen und Chats erhalten.", "Konto sichern"] }[mode];
  el.innerHTML = `${bare ? "" : `<div class="page so">${head("Gemeinsam lernen", "Freunde, Chats, Gruppen und ein Global-Chat für alle.")}`}
    <div class="so-auth-wrap${bare ? " bare" : ""}">${intro ? `<section class="card so-intro"><div class="so-ill" aria-hidden="true"><i></i><i></i><i></i></div>
        <ul class="muted"><li>Freunde per QR-Code oder Freundescode hinzufügen und privat schreiben.</li><li>Offene oder private Gruppen gründen, zum Lernen, mit Freunden oder für Projekte.</li><li>Ein offener Global-Chat mit allen, die StudyOS nutzen.</li></ul>
        <p class="muted" style="font-size:13px">Sichtbar für andere sind nur dein Name „${esc(S().name || "Studi")}“ und dein Avatar, nicht deine E-Mail und nicht dein Lernstand. Nachrichten liegen auf einem Server in der EU. Ohne Internet funktioniert alles andere in StudyOS wie bisher.</p></section>` : ""}
    <section class="card so-auth">${mode === "secure" ? "" : `<div class="so-seg" role="tablist"><button class="chip ${mode === "signup" ? "acc" : ""}" data-mode="signup" role="tab" aria-selected="${mode === "signup"}">Konto erstellen</button><button class="chip ${mode === "login" ? "acc" : ""}" data-mode="login" role="tab" aria-selected="${mode === "login"}">Anmelden</button></div>`}
      <h3>${T[0]}</h3><p class="muted">${T[1]}</p>
      <form class="col" id="so-af"><label class="fld">E-Mail<input id="so-ae" type="email" autocomplete="email" required placeholder="name@edu.fh-joanneum.at"></label>
        <label class="fld">Passwort${mode === "login" ? "" : " (mindestens 8 Zeichen)"}<input id="so-ap" type="password" minlength="${mode === "login" ? 1 : 8}" autocomplete="${mode === "login" ? "current-password" : "new-password"}" required></label>
        <div class="row so-gate-act"><button type="submit" class="btn pri">${T[2]}</button>${mode === "secure" ? `<button type="button" class="btn ghost sm" id="so-other">Mit anderem Konto anmelden</button>` : ""}</div></form></section></div>${bare ? "" : "</div>"}`;
  $$("[data-mode]", el).forEach(b => b.onclick = () => authView(el, cont, b.dataset.mode, bare));
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
      if (moveToAccount(email)) return; /* lädt neu im Profil dieses Kontos */
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
  me = null; user = null; st().on = false; S().settings.guest = false; App.save(); (App.authHooks || []).forEach(f => { try { f("logout"); } catch (e) {} });
  if (toGuest(false)) return; /* Daten des Kontos bleiben in seinem Profil, weiter geht es im leeren Gast-Profil */
  delete st().role; delete st().fh; App.renderSide(); App.go("welcome", "");
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

/* ---------- Lerngruppen nur für FH JOANNEUM (supabase-update-11.sql) ----------
   Gruppen ohne Fach, Freunde, Direktchats und der Global-Chat sind für alle Angemeldeten offen.
   Lerngruppen (Gruppen mit Fach) nur für Konten, die ihre Adresse @edu.fh-joanneum.at per E-Mail-Code bestätigt
   und den Studiengangs-Code (Wirtschaftsinformatik) eingegeben haben; Lehrende (@fh-joanneum.at) brauchen keinen Code.
   Geprüft wird in der Datenbank (Row Level Security), die App erklärt nur und führt durch die Schritte. */
let fhOn = false, fhRow = null, fhTest = false;
const fhKind = m => /@edu\.fh-joanneum\.at$/i.test(m || "") ? "student" : /@fh-joanneum\.at$/i.test(m || "") ? "staff" : null;
async function fhLoad() {
  const r = await settle(sb.from("fh_verified").select("*").eq("user_id", me.id).maybeSingle());
  fhOn = !r.error; fhRow = (!r.error && r.data) || null;
  if (!fhOn) return;
  if (isAdmin) { const t = await settle(sb.from("fh_admin_test").select("user_id").eq("user_id", me.id).maybeSingle()); fhTest = !t.error && !!t.data; } else fhTest = false;
  const ok = fhOk(), was = st().fh;
  if (ok) { st().fh = true; if (!st().role) st().role = "fh"; } else delete st().fh;
  if (!!was !== ok) { App.save(); App.renderSide(); App.accessChanged && App.accessChanged(); }
}
/* Ohne Update 11 gibt es noch keine Sperre (fhOn = false), dann bleibt alles wie bisher */
const fhOk = () => !fhOn || (isAdmin && !fhTest) || !!(fhRow && user && fhRow.email === String(user.email || "").toLowerCase() && (fhRow.kind === "staff" || fhRow.wi));
async function fhConfirm() { await q(sb.rpc("fh_verify")); await fhLoad(); }
const fhErr = e => { const t = String((e && (e.message || e.msg)) || e || "");
  return /Falscher Studiengangs-Code/.test(t) ? "Dieser Studiengangs-Code stimmt nicht. Frag in deiner Jahrgangsgruppe nach dem aktuellen Code."
    : /Code fehlt/.test(t) ? "Bitte zuerst den Code aus der E-Mail eingeben."
    : /expired|invalid|otp/i.test(t) && !/sending|smtp/i.test(t) ? "Der Code ist falsch oder abgelaufen. Es gilt nur der Code aus der neuesten E-Mail, und nur eine Stunde lang."
    : /sending|smtp|mail.*(error|fail)/i.test(t) ? "Supabase kann gerade keine E-Mails verschicken. Der Admin muss dafür einen E-Mail-Versand (SMTP) einrichten."
    : /rate|too many|security purposes|seconds/i.test(t) ? "Kurz warten: Ein neuer Code geht erst nach etwa einer Minute."
    : /already|registered|exists/i.test(t) ? "Diese Adresse gehört schon zu einem anderen StudyOS-Konto. Melde dich mit diesem Konto an."
    : fail(e); };
const FH_INTRO = "Fächer, Prüfungstraining und Lerngruppen sind nur für Studierende der Wirtschaftsinformatik und Lehrende der FH JOANNEUM. Freunde, Gruppen ohne Fach und der Global-Chat bleiben für alle mit Konto offen.";
/* Schritte in ein Element zeichnen; done() nach erfolgreicher Freischaltung */
function fhSteps(box, done) {
  const mail = String((user && user.email) || ""), kind = fhKind(mail), verified = !!(fhRow && fhRow.email === mail.toLowerCase());
  const step = !kind ? 1 : !verified ? 2 : 3;
  const dot = n => `<li class="${n < step ? "done" : n === step ? "now" : ""}">${["FH-Adresse", "E-Mail bestätigen", "Studiengangs-Code"][n - 1]}</li>`;
  box.innerHTML = `<p class="muted">${FH_INTRO}</p><p class="so-fherr" role="alert" hidden></p><ol class="so-fhsteps">${dot(1)}${dot(2)}${kind === "staff" ? "" : dot(3)}</ol>
    ${step === 1 ? `<p>Dein Konto nutzt <b>${esc(mail)}</b>. Hinterlege deine FH-Adresse, dann schicken wir dir einen Code dorthin. Deine Freunde, Gruppen und Chats bleiben erhalten.</p>
      <form class="col so-fhf" data-s="mail"><label class="fld">FH-Adresse<input type="email" required autocomplete="email" placeholder="vorname.nachname@edu.fh-joanneum.at"></label><div class="row"><button class="btn pri sm">Adresse übernehmen</button></div></form>`
    : step === 2 ? `<p>Wir schicken einen Code an <b>${esc(mail)}</b>. Damit zeigst du, dass das Postfach dir gehört.</p>
      <div class="row"><button class="btn pri sm" data-fh="send">Code schicken</button></div>
      <form class="col so-fhf" data-s="otp" hidden><label class="fld">Code aus der E-Mail<input type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="10" required placeholder="123456" style="letter-spacing:.2em"></label>
        <div class="row"><button class="btn pri sm">Bestätigen</button><button type="button" class="btn ghost sm" data-fh="send">Neuen Code schicken</button></div>
        <p class="muted" style="font-size:13px">Die E-Mail kann ein paar Minuten brauchen, schau auch im Spam-Ordner nach. Es gilt immer nur der zuletzt geschickte Code.</p></form>`
    : `<p>✓ <b>${esc(mail)}</b> ist bestätigt. Jetzt noch den Studiengangs-Code von Wirtschaftsinformatik eingeben. Du bekommst ihn in deiner Jahrgangsgruppe.</p>
      <form class="col so-fhf" data-s="wi"><label class="fld">Studiengangs-Code<input type="text" maxlength="16" required autocomplete="off" autocapitalize="characters" spellcheck="false" style="text-transform:uppercase;letter-spacing:.12em"></label><div class="row"><button class="btn pri sm">Freischalten</button></div></form>`}`;
  const busy = (b, on) => { if (b) b.disabled = on; };
  /* Fehler direkt im Dialog zeigen (eine Meldung unten rechts liegt hinter dem abgedunkelten Hintergrund) */
  const err = (t, raw) => { const p = $(".so-fherr", box); if (!p) return App.toast("Hat nicht geklappt", t, "!"); p.innerHTML = esc(t) + (raw ? `<small>${esc(raw)}</small>` : ""); p.hidden = !t; };
  const rawOf = er => { const m = String((er && (er.message || er.msg)) || ""); return m && !/[äöüß]/.test(m) ? "Meldung von Supabase: " + m.slice(0, 160) : ""; };
  const finish = async () => { await fhLoad(); if (fhOk()) { App.toast("Freigeschaltet", "Du siehst jetzt alle Fächer und kannst Lerngruppen nutzen.", "✓"); done(); } else fhSteps(box, done); };
  box.onclick = async e => {
    const b = e.target.closest("[data-fh=send]"); if (!b) return;
    const again = !$("[data-s=otp]", box).hidden;
    if (again && !confirm("Neuen Code schicken? Der Code aus der vorigen E-Mail gilt dann nicht mehr.")) return;
    busy(b, true); err("");
    try {
      const r = await sb.auth.signInWithOtp({ email: mail, options: { shouldCreateUser: false, emailRedirectTo: LINK } }); if (r.error) throw r.error;
      const f = $("[data-s=otp]", box); f.hidden = false; $("input", f).value = ""; $("input", f).focus();
      const top = $("[data-fh=send]:not(form [data-fh])", box); if (top) top.parentElement.style.display = "none";
      App.toast("Code verschickt", "Schau in dein Postfach " + mail + ".", "✉");
    } catch (er) { err(fhErr(er), rawOf(er)); }
    busy(b, false);
  };
  box.onsubmit = async e => {
    e.preventDefault(); const f = e.target, v = $("input", f).value.trim(), b = $("button:not([type=button])", f); busy(b, true); err("");
    try {
      if (f.dataset.s === "mail") {
        const m = v.toLowerCase(); if (!fhKind(m)) throw new Error("Das ist keine Adresse der FH JOANNEUM (…@edu.fh-joanneum.at oder …@fh-joanneum.at).");
        const r = await sb.auth.updateUser({ email: m }); if (r.error) throw r.error;
        if (String(r.data.user.email || "").toLowerCase() !== m) { App.toast("Bestätigung nötig", "Supabase hat einen Link an die neue Adresse geschickt. Öffne ihn, dann geht es hier weiter.", "✉"); busy(b, false); return; }
        user = r.data.user; fhRow = null; return fhSteps(box, done);
      }
      if (f.dataset.s === "otp") {
        const r = await sb.auth.verifyOtp({ email: mail, token: v.replace(/\s/g, ""), type: "email" }); if (r.error) throw r.error;
        if (r.data && r.data.user) user = r.data.user;
        await fhConfirm(); return finish();
      }
      await q(sb.rpc("fh_join_wi", { code: v })); return finish();
    } catch (er) { busy(b, false); err(er && /keine Adresse der FH/.test(er.message) ? er.message : fhErr(er), er && /keine Adresse der FH/.test(er.message) ? "" : rawOf(er)); }
  };
}
function fhDialog(done) {
  App.modal(`<h2>Lerngruppen freischalten</h2><div class="so-fh"></div><div class="row" style="justify-content:flex-end"><button class="btn ghost sm" data-close>Schließen</button></div>`, (m, close) => {
    fhSteps($(".so-fh", m), () => { close(); done && done(); });
  });
}
const fhHint = () => fhOk() ? "" : `<div class="so-fhhint"><span>🎓 Lerngruppen zu Fächern nur mit FH-Konto (Wirtschaftsinformatik).</span><button class="btn sm" data-fhopen>Freischalten</button></div>`;
document.addEventListener("click", e => { const b = e.target.closest("[data-fhopen]"); if (!b || !sb || !me) return; e.preventDefault(); const mb = b.closest(".modal-back"); if (mb) mb.remove(); fhDialog(() => App.go(App.route().v, App.route().p)); });

/* ---------- Zugang: Gast, Konto oder FH-Konto ----------
   guest = nicht angemeldet; user = Konto ohne FH-Bestätigung (Global-Chat, Freunde, Direktchats);
   fh = bestätigte FH-Adresse mit Studiengangs-Code oder Lehrende (alle Fächer und Lerngruppen).
   st().fh merkt sich das letzte Ergebnis vom Server, damit die App auch offline weiß, was sie zeigt. */
App.tier = () => !st().on ? "guest" : st().fh ? "fh" : "user";
/* Profil und Konto: Ein Profil, in dem sich jemand angemeldet hat, gehört diesem Konto. Gäste landen im eigenen Profil „gast“. */
const SP = () => window.StudyProfiles && StudyProfiles.ensure ? StudyProfiles : null;
const SBKEY = "studyos.sb.";
function toGuest(asGuest) {
  const P = SP(); if (!P || P.isGuest() || !P.acct()) return false;
  P.ensure(P.GUEST, "Gast"); P.patchSettings(P.GUEST, s => { s.guest = !!asGuest; s.online = {}; });
  P.open(P.GUEST, true); return true;
}
function moveToAccount(email) {
  const P = SP(); if (!P) return false;
  const mine = P.acct(), mail = String(email || "").toLowerCase();
  if (!P.isGuest() && (!mine || mine === mail)) { P.bind(mail); return false; } /* eigenes Profil: an das Konto binden */
  const target = (P.byAcct(mail) || {}).id || P.ensure("a" + Date.now().toString(36), (S().name && !P.isGuest() ? S().name : mail.split("@")[0].split(/[._-]/)[0].replace(/^./, c => c.toUpperCase())).slice(0, 24));
  P.bindId(target, mail);
  P.patchSettings(target, s => { s.online = Object.assign({}, s.online, { on: true }); s.guest = false; });
  P.copyKey(SBKEY, target); /* angemeldete Sitzung mitnehmen */
  if (P.isGuest()) P.patchSettings(P.GUEST, s => { s.online = {}; });
  try { (App.authHooks || []).forEach(f => { try { f("leave"); } catch (e) {} }); } catch (e) {}
  P.open(target, true); return true;
}
const ROLES = [
  ["student", "🎓", "Student:in an der FH JOANNEUM", "Wirtschaftsinformatik: alle Fächer mit Skript, Üben und Prüfungstraining, dazu Lerngruppen. Du bestätigst deine @edu.fh-joanneum.at-Adresse und gibst den Studiengangs-Code ein."],
  ["staff", "🧑‍🏫", "Lehrende:r an der FH JOANNEUM", "Alles wie Studierende. Du bestätigst deine @fh-joanneum.at-Adresse, ein Studiengangs-Code ist nicht nötig."],
  ["user", "👤", "Normaler User", "Global-Chat, Freunde und Direktchats, dazu Kalender und Unterwegs. Die Fächer bleiben Studierenden und Lehrenden der FH vorbehalten."]];
const wlHead = (t, sub) => `<div class="wl-brand"><div class="logo">${window.STUDYOS_LOGO || "S"}</div><div><b>StudyOS</b><small>Wirtschaftsinformatik · FH JOANNEUM</small></div></div><h1>${t}</h1>${sub ? `<p class="muted">${sub}</p>` : ""}`;
function welcomeStart(el) {
  el.innerHTML = `<div class="page wl"><div class="wl-in">${wlHead(`Willkommen${S().name && !(SP() && (SP().acct() || SP().isGuest())) ? ", " + esc(S().name) : ""}`, "Wie möchtest du StudyOS nutzen? Du kannst das später jederzeit ändern.")}
    <div class="wl-grid"><section class="card wl-acc"><span class="eyebrow">Mit Konto</span><div class="wl-auth"></div></section>
      <section class="card wl-guest"><span class="eyebrow">Ohne Konto</span><h3>Als Gast weiter</h3>
        <ul class="wl-list"><li>Kalender mit Stundenplan-Import</li><li>Unterwegs: Öffis von Tür zu Tür</li><li>Neuigkeiten</li></ul>
        <p class="muted">Alles bleibt auf diesem Gerät. Chats, Fächer und Lerngruppen brauchen ein Konto.</p>
        <button class="btn" id="wl-guest">Als Gast weiter</button></section></div>
    <div class="wl-tiers" aria-label="Was du womit bekommst">
      <div><b>Gast</b><small>Kalender, Unterwegs</small></div>
      <div><b>Konto</b><small>+ Global-Chat, Freunde, Direktchats, Gruppen ohne Fach</small></div>
      <div class="fh"><b>FH-Konto</b><small>+ alle Fächer, Prüfungstraining und Lerngruppen</small></div></div></div></div>`;
  authView($(".wl-auth", el), () => App.go("welcome", "role"), "signup", true);
  $("#wl-guest", el).onclick = () => { if (toGuest(true)) return; S().settings.guest = true; App.save(); App.renderSide(); App.go("dash"); };
}
async function welcomeRole(el) {
  const R0 = App.route();
  el.innerHTML = `<div class="page wl"><div class="wl-in">${wlHead("Wer bist du?", "")}<div class="so-wait"><span class="so-spin"></span>Verbinde …</div></div></div>`;
  try { await connect(); } catch (e) {
    if (App.route() !== R0) return;
    if (e && e.auth) return App.go("welcome", "");
    $(".wl-in", el).insertAdjacentHTML("beforeend", `<div class="empty">${esc(fail(e))}<br><br><button class="btn sm" data-go="welcome" data-p="role">Nochmal</button> <button class="btn ghost sm" data-go="dash">Später</button></div>`); $(".so-wait", el).remove(); return;
  }
  if (App.route() !== R0) return;
  if (fhOk() && fhOn) { st().role = "fh"; st().fh = true; App.save(); App.renderSide(); App.toast("Willkommen zurück", "Dein FH-Konto ist bestätigt, du siehst alle Fächer.", "✓"); return App.go("dash"); }
  const kind = fhKind(user.email);
  el.innerHTML = `<div class="page wl"><div class="wl-in">${wlHead("Wer bist du?", `Angemeldet als <b>${esc(user.email)}</b>. Wähl aus, wie du StudyOS nutzt.`)}
    <div class="wl-roles">${ROLES.map(([k, i, t, d]) => `<button class="card wl-role${(kind === "student" && k === "student") || (kind === "staff" && k === "staff") ? " sug" : ""}" data-role="${k}"><span class="wl-ri" aria-hidden="true">${i}</span><b>${t}</b><small>${d}</small></button>`).join("")}</div>
    <div class="wl-fh" hidden><section class="card"><div class="so-fh"></div></section><div class="row"><button class="btn ghost sm" id="wl-back">← Andere Auswahl</button><span class="so-sp"></span><button class="btn ghost sm" id="wl-later">Später bestätigen</button></div></div></div></div>`;
  const pick = $(".wl-roles", el), fh = $(".wl-fh", el);
  pick.onclick = e => {
    const b = e.target.closest("[data-role]"); if (!b) return;
    const r = b.dataset.role; st().role = r; App.save();
    if (r === "user") { App.renderSide(); App.toast("Los geht’s", "Global-Chat und Freunde findest du links unter Gemeinsam.", "☺"); return App.go("dash"); }
    pick.hidden = true; fh.hidden = false;
    fhSteps($(".so-fh", fh), () => { st().fh = true; App.save(); App.renderSide(); App.go("dash"); });
  };
  $("#wl-back", el).onclick = () => { pick.hidden = false; fh.hidden = true; };
  $("#wl-later", el).onclick = () => { App.renderSide(); App.toast("Später bestätigen", "Auf „Heute“ kannst du dein FH-Konto jederzeit bestätigen.", "◎"); App.go("dash"); };
}
PAGES.welcome = (el, p) => { if (p === "role" && st().on) return welcomeRole(el); if (st().on) return App.go("dash"); return welcomeStart(el); };
/* Konto-Knopf unten im Menü: Anmelden oder Abmelden */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-acct]"); if (!b) return;
  if (b.dataset.acct === "out") { client().then(() => logout()).catch(() => logout()); } else App.go("welcome", "");
});
App.social_fh = { dialog: d => (sb && me ? fhDialog(d) : App.go("welcome", "role")), kind: fhKind };
/* Beim ersten Öffnen: Startbildschirm; angemeldet ohne gewählten Kontotyp: Auswahl */
App.afterBoot.push(() => {
  let inv = false; try { inv = !!sessionStorage.getItem("studyos.invite") || !!sessionStorage.getItem("studyos.pair"); } catch (e) {}
  if (FHLINK || inv || START_CHAT) return;
  if (!st().on && !S().settings.guest) setTimeout(() => App.go("welcome", ""), 30);
  else if (st().on && !st().role && navigator.onLine) setTimeout(() => App.go("welcome", "role"), 30);
});

/* ---------- Seiten ---------- */
const head = (title, sub, back) => `<header class="so-head">${back ? `<button class="btn ghost sm so-back" data-go="${back[0]}"${back[1] ? ` data-p="${esc(back[1])}"` : ""}>← ${esc(back[2])}</button>` : ""}<span class="eyebrow">Gemeinsam</span><h1>${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ""}</header>`;
function gate(el, cont) {
  if (!st().on && !(sb && me) && !(FHLINK && !FHLINK.used)) {
    el.innerHTML = `<div class="page so">${head("Gemeinsam", "")}<div class="empty">Freunde, Chats und der Global-Chat brauchen ein Konto. Als Gast nutzt du Kalender, Unterwegs und Neuigkeiten.<br><br><button class="btn pri sm" data-go="welcome">Anmelden oder Konto erstellen</button></div></div>`;
    return false;
  }
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
  if (kind === "admin") return adminPage(el);
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
        ${fhHint()}<div class="row so-gact"><button class="btn sm pri" id="so-new">Gruppe gründen</button><button class="btn sm" data-go="together" data-p="find">Gruppen entdecken</button><button class="btn ghost sm" id="so-join">Mit Code beitreten</button></div></section>
    </div>
    <section class="card so-global"><div class="spread"><h3>Global-Chat</h3><button class="btn pri sm" data-go="together" data-p="global">Öffnen ›</button></div><p class="muted">Ein Chat für alle, die StudyOS nutzen. Nachrichten bleiben 24 Stunden. Frag, was du nicht verstehst, oder hilf anderen.</p></section>
    ${isAdmin ? `<section class="card so-admcard"><div class="spread"><h3>Admin</h3><button class="btn pri sm" data-go="together" data-p="admin">Öffnen ›</button></div><p class="muted so-admn">Meldungen, Verwarnungen, Stummschalten und Wortliste.</p></section>` : ""}</div>`;
  if (isAdmin) settle(sb.from("reports").select("id").eq("status", "open").limit(100)).then(r => { const t = $(".so-admn", el); if (t && !r.error && r.data) t.textContent = r.data.length ? `${r.data.length >= 100 ? "100+" : r.data.length} offene ${r.data.length === 1 ? "Meldung" : "Meldungen"}. Dazu Verwarnungen, Stummschalten und Wortliste.` : "Keine offenen Meldungen. Dazu Verwarnungen, Stummschalten und Wortliste."; });
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
    ${fhOk() ? `<label class="fld">Fach<select id="so-gc"><option value="">Kein bestimmtes Fach</option>${COURSES.map(c => `<option value="${c.id}" ${c.id === ((g && g.course) || course) ? "selected" : ""}>${esc(c.title)}</option>`).join("")}</select></label>`
      : `<input type="hidden" id="so-gc" value="">`}
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
    <div class="so-find"><input type="search" id="so-fq" placeholder="Name, Thema oder Tag suchen …" autocomplete="off">${fhOk() ? `<select id="so-fc"><option value="">Alle Fächer</option>${COURSES.map(c => `<option value="${c.id}" ${c.id === f.fach ? "selected" : ""}>${esc(c.title)}</option>`).join("")}</select>` : ""}<button class="btn pri sm" id="so-fnew">Gruppe gründen</button></div>
    <div class="so-tagbar"><button class="chip acc" data-ft="">Alle</button>${TAGS.map(t => `<button class="chip" data-ft="${esc(t)}">#${esc(t)}</button>`).join("")}</div>
    ${fhHint()}<div class="so-found"><p class="muted">Lädt …</p></div></div>`;
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
  const fc = $("#so-fc", el); if (fc) fc.onchange = e => { f.fach = e.target.value || null; load(); };
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
  const gr = await sb.from("groups").select("*").eq("id", gid).maybeSingle();
  if (!gr.error && !gr.data && !fhOk()) {
    el.innerHTML = `<div class="page so">${head("Lerngruppe", "", back)}<section class="card so-fhcard"><h3>🎓 Nur für die FH JOANNEUM</h3><div class="so-fh"></div></section></div>`;
    return fhSteps($(".so-fh", el), () => groupPage(el, gid, back));
  }
  if (gr.error || !gr.data) throw gr.error || new Error("Diese Gruppe gibt es nicht mehr oder du bist kein Mitglied.");
  const g = gr.data;
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
/* ---------- Admin-Seite (together/admin): nur für Konten in der Tabelle admins ---------- */
let aTab = "reports", aStatus = "open", aTerm = "";
const markW = (t, ws) => { let h = esc(t || ""); const re = ws && ws.length ? new RegExp("(" + ws.map(w => esc(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")", "giu") : badRe && new RegExp(badRe.source, "giu"); return re ? h.replace(re, (...a) => ws && ws.length ? `<mark>${a[0]}</mark>` : `${a[1]}<mark>${a[0].slice(a[1].length)}</mark>`) : h; };
function warnDialog(uid, after) {
  App.modal(`<h2>Verwarnen</h2><p class="muted">${esc(nm(uid))} sieht diesen Hinweis beim nächsten Öffnen von StudyOS (oder sofort, wenn gerade online).</p>
    <textarea class="so-wtx" maxlength="500" rows="4" aria-label="Hinweis">Bitte achte auf einen respektvollen Umgangston. Beleidigungen und Schimpfwörter haben im Chat keinen Platz.</textarea>
    <div class="row" style="justify-content:flex-end;gap:8px"><button class="btn sm" data-close>Abbrechen</button><button class="btn pri sm" id="so-wsend">Hinweis senden</button></div>`, (m, close) => {
    $("#so-wsend", m).onclick = async () => {
      const text = $(".so-wtx", m).value.trim(); if (!text) return;
      try { await q(sb.from("user_notes").insert({ user_id: uid, text, by: me.id })); close(); App.toast("Verwarnt", `${nm(uid)} bekommt den Hinweis.`, "✓"); after && after("verwarnt"); }
      catch (e) { App.toast("Fehler", modFail(e), "!"); }
    };
  });
}
function muteDialog(uid, after) {
  const D = [["1 Stunde", 1], ["24 Stunden", 24], ["7 Tage", 168], ["30 Tage", 720]];
  App.modal(`<h2>Stummschalten</h2><p class="muted">${esc(nm(uid))} kann so lange keine Nachrichten senden, auch nicht in Gruppen und Direktchats. Lesen geht weiter.</p>
    <div class="so-rsns">${D.map(([t, h], i) => `<label class="so-rsn"><input type="radio" name="so-mu" value="${h}"${i === 1 ? " checked" : ""}><span>${t}</span></label>`).join("")}</div>
    <input class="so-mr" maxlength="200" placeholder="Grund (sieht die Person)" aria-label="Grund" value="Beleidigungen im Chat">
    <div class="row" style="justify-content:flex-end;gap:8px"><button class="btn sm" data-close>Abbrechen</button><button class="btn pri sm" id="so-msend">Stummschalten</button></div>`, (m, close) => {
    $("#so-msend", m).onclick = async () => {
      const h = +($("input:checked", m) || {}).value || 24, t = new Date(Date.now() + h * 3600000).toISOString();
      try { await q(sb.from("mutes").upsert({ user_id: uid, until: t, reason: $(".so-mr", m).value.trim() || null, by: me.id })); close(); App.toast("Stummgeschaltet", `${nm(uid)} bis ${until(t)}.`, "✓"); after && after("stumm bis " + until(t)); }
      catch (e) { App.toast("Fehler", modFail(e), "!"); }
    };
  });
}
async function adminPage(el) {
  if (!isAdmin) return App.go("together", "");
  el.innerHTML = `<div class="page so so-admin">${head("Admin", "Meldungen, Personen und Filter. Diese Seite und die Admin-Knöpfe im Chat siehst nur du.", ["together", "", "Gemeinsam"])}
    <div class="so-stats" aria-live="polite"></div>
    <div class="so-tools so-atabs" role="tablist">${[["reports", "Meldungen"], ["users", "Personen"], ["words", "Wortliste"], ["tools", "Werkzeuge"]].map(([k, t]) => `<button class="chip${k === aTab ? " on" : ""}" role="tab" aria-selected="${k === aTab}" data-at="${k}">${t}</button>`).join("")}</div>
    <div class="so-abody"><div class="so-wait"><span class="so-spin"></span>Lade …</div></div></div>`;
  const body = $(".so-abody", el), R = App.route();
  const alive = () => body.isConnected && App.route() === R;
  const stats = async () => {
    const s = await settle(sb.rpc("admin_stats")); if (!alive()) return;
    const box = $(".so-stats", el); if (s.error || !s.data) { box.innerHTML = ""; return; }
    const d = s.data, T = [["Personen", d.users], ["aktiv (24 h)", d.active24], ["Nachrichten (24 h)", d.messages24], ["Global-Chat (24 h)", d.global24], ["Gruppen", d.groups], ["offene Meldungen", d.open, d.open ? "warn" : ""], ["stumm", d.muted]];
    box.innerHTML = T.map(([t, n, c]) => `<div class="so-st ${c || ""}"><b>${n == null ? "–" : n}</b><small>${t}</small></div>`).join("");
  };
  let rows = [];
  const paint = async () => {
    if (!alive()) return;
    stats();
    try {
      if (aTab === "reports") {
        rows = await q(sb.from("reports").select("*").eq("status", aStatus).order("created_at", { ascending: false }).limit(100));
        await loadNames(rows.flatMap(r => [r.sender, r.reporter]).filter(Boolean)); if (!alive()) return;
        body.innerHTML = `<div class="so-tools"><button class="chip${aStatus === "open" ? " on" : ""}" data-as="open">Offen</button><button class="chip${aStatus === "done" ? " on" : ""}" data-as="done">Erledigt</button></div>
          ${rows.length ? rows.map(r => `<article class="card so-rc" data-rid="${r.id}">
            <div class="spread"><span class="so-tag k-${esc(r.kind)}">${esc(KIND[r.kind] || r.kind)}</span><small class="muted">${esc(r.place || "")} · ${time(r.created_at)}</small></div>
            <div class="so-row">${av(names[r.sender])}<b>${esc(nm(r.sender))}</b>${r.words && r.words.length ? `<span class="so-sp"></span><small class="muted">Treffer: ${esc(r.words.join(", "))}</small>` : ""}</div>
            <blockquote class="so-rq">${markW(r.body, r.words)}</blockquote>
            ${r.kind === "user" ? `<p class="muted so-rw">Gemeldet von ${esc(nm(r.reporter))}${r.reason ? ": " + esc(r.reason) : ""}</p>` : ""}
            ${r.action ? `<p class="so-ra-done">✓ ${esc(r.action)}</p>` : ""}
            <div class="row so-ract">${r.message_id && r.kind !== "name" ? `<button class="btn sm" data-ra="del">Nachricht löschen</button>` : ""}${r.kind === "name" ? `<button class="btn sm" data-ra="name">Name zurücksetzen</button>` : ""}
              <button class="btn sm" data-ra="warn">Verwarnen</button><button class="btn sm" data-ra="mute">Stummschalten</button>
              <span class="so-sp"></span>${r.status === "open" ? `<button class="btn pri sm" data-ra="done">Erledigt</button>` : `<button class="btn sm" data-ra="open">Wieder öffnen</button>`}<button class="btn ghost sm" data-ra="rm" aria-label="Meldung entfernen">Entfernen</button></div></article>`).join("")
          : `<div class="empty">${aStatus === "open" ? "Keine offenen Meldungen. Alles ruhig." : "Noch nichts erledigt."}</div>`}`;
      } else if (aTab === "users") {
        rows = await q(sb.rpc("admin_users", { term: aTerm })); if (!alive()) return;
        rows.forEach(u => { names[u.id] = names[u.id] || { id: u.id, name: u.name, avatar: u.avatar }; });
        body.innerHTML = `<form class="so-tools so-usearch"><input type="search" placeholder="Name suchen …" value="${esc(aTerm)}" aria-label="Name suchen"><button class="btn sm">Suchen</button></form>
          <section class="card">${rows.length ? rows.map(u => `<div class="so-urow" data-uid="${u.id}">${av(u)}<div class="so-utxt"><b>${esc(mask(u.name))}${adminSet.has(u.id) ? `<i class="so-adm">Admin</i>` : ""}</b>
            <small class="muted">${u.msgs} Nachrichten${u.last_at ? " · zuletzt " + time(u.last_at) : ""}${u.reports ? ` · <span class="so-warnc">${u.reports} Meldungen</span>` : ""}${u.notes ? ` · ${u.notes}× verwarnt` : ""}${u.muted_until ? ` · <span class="so-warnc">stumm bis ${until(u.muted_until)}</span>` : ""}</small></div>
            ${u.id === me.id ? "" : `<div class="row so-uact"><button class="btn sm" data-ua="warn">Verwarnen</button>${u.muted_until ? `<button class="btn sm" data-ua="unmute">Stumm aufheben</button>` : `<button class="btn sm" data-ua="mute">Stummschalten</button>`}<button class="btn ghost sm" data-ua="name">Name zurücksetzen</button><button class="btn ghost sm" data-ua="purge">Global-Nachrichten löschen</button></div>`}</div>`).join("") : `<p class="muted">Niemand gefunden.</p>`}</section>`;
        $(".so-usearch", body).onsubmit = e => { e.preventDefault(); aTerm = $("input", e.target).value.trim(); paint(); };
      } else if (aTab === "words") {
        const w = await q(sb.from("bad_words").select("word").order("word").limit(2000)); if (!alive()) return;
        setWords(w.map(x => x.word));
        body.innerHTML = `<section class="card"><h3>Gesperrte Wörter <span class="chip">${words.length}</span></h3>
          <p class="muted">Ein Wort trifft auch längere Formen am Wortanfang („fick“ trifft „ficken“), aber nicht mitten im Wort („Marsch“ bleibt). Treffer werden zu ★★★. Jede Sprache und Schrift geht (auch é, ç, ł, Kyrillisch), aber nur Buchstaben, Ziffern und Leerzeichen, mindestens 3 Zeichen.</p>
          <form class="so-tools so-wadd"><input maxlength="40" placeholder="Wort hinzufügen" aria-label="Wort hinzufügen"><button class="btn pri sm">Hinzufügen</button></form>
          <div class="so-words">${words.map(x => `<span class="so-word">${esc(x)}<button data-wrm="${esc(x)}" aria-label="${esc(x)} entfernen">×</button></span>`).join("")}</div>
          <h3>Ausprobieren</h3><input class="so-wtest" placeholder="Satz eingeben, um den Filter zu testen" aria-label="Filter testen"><p class="so-wout muted"></p></section>`;
        $(".so-wadd", body).onsubmit = async e => {
          e.preventDefault(); const v = $("input", e.target).value.toLocaleLowerCase().trim().replace(/\s+/g, " ");
          if (!okWord(v)) return App.toast("Nicht möglich", "Nur Buchstaben (jede Sprache und Schrift), Ziffern und Leerzeichen, 3 bis 40 Zeichen.", "!");
          try { await q(sb.from("bad_words").insert({ word: v })); paint(); } catch (er) { App.toast("Fehler", /duplicate|23505/.test(String(er.message || er.code)) ? "Das Wort steht schon auf der Liste." : modFail(er), "!"); }
        };
        const t = $(".so-wtest", body), out = $(".so-wout", body);
        t.oninput = () => { const h = badHits(t.value); out.innerHTML = t.value ? `${esc(mask(t.value))}<br><small>${h.length ? "Treffer: " + esc(h.join(", ")) : "Kein Treffer"}</small>` : ""; };
      } else {
        const [mu, no] = await Promise.all([q(sb.from("mutes").select("*").gt("until", new Date().toISOString()).order("until")), q(sb.from("user_notes").select("*").order("created_at", { ascending: false }).limit(30))]);
        await loadNames(mu.map(x => x.user_id).concat(no.map(x => x.user_id))); if (!alive()) return;
        const [wc, fl] = await Promise.all([settle(sb.rpc("admin_wi_code")), settle(sb.rpc("admin_fh_list"))]); if (!alive()) return;
        const fhSec = wc.error ? `<section class="card"><h3>Lerngruppen: FH-Zugang</h3><p class="muted">Noch nicht eingerichtet. Im Supabase SQL Editor einmal supabase-update-11.sql ausführen.</p></section>`
          : `<section class="card so-fhadm"><h3>Lerngruppen: FH-Zugang</h3><p class="muted">Lerngruppen zu Fächern sind nur für bestätigte FH-Adressen. Studierende (@edu.fh-joanneum.at) brauchen zusätzlich diesen Studiengangs-Code, Lehrende (@fh-joanneum.at) nicht. Teile ihn nur in der WI-Jahrgangsgruppe. Ein neuer Code sperrt niemanden aus, der schon drin ist.</p>
            <div class="so-row so-wirow"><span class="muted">Studiengangs-Code</span><span class="so-code">${esc(wc.data || "")}</span><span class="so-sp"></span><button class="btn sm" id="so-wicopy">Kopieren</button><button class="btn sm" id="so-wiset">Ändern</button></div>
            <h3>Bestätigt <span class="chip">${(fl.data || []).length}</span></h3>${(fl.data || []).length ? fl.data.map(v => `<div class="so-urow" data-fuid="${v.user_id}"><div class="so-utxt"><b>${esc(mask(v.name || "Studi"))}</b><small class="muted">${esc(v.email)} · ${v.kind === "staff" ? "Lehrende" : v.wi ? "Wirtschaftsinformatik" : "ohne Studiengangs-Code"}</small></div>${v.kind === "student" && v.wi ? `<div class="row so-uact"><button class="btn ghost sm" data-fhrev>Zugang entziehen</button></div>` : ""}</div>`).join("") : `<p class="muted">Noch niemand.</p>`}</section>`;
        const tst = await settle(sb.from("fh_admin_test").select("user_id").eq("user_id", me.id).maybeSingle()); if (!alive()) return;
        const tSec = wc.error ? "" : tst.error ? `<section class="card"><h3>Testmodus</h3><p class="muted">Für den Testmodus im Supabase SQL Editor einmal supabase-update-12.sql ausführen.</p></section>`
          : `<section class="card so-fhtest"><h3>Testmodus ${tst.data ? `<span class="chip">an</span>` : ""}</h3><p class="muted">${tst.data ? "Du bist gerade wie ein normaler User ohne FH-Freischaltung. Geh die Schritte durch (FH-Adresse, Code aus der E-Mail, Studiengangs-Code oben). Die Admin-Werkzeuge bleiben hier erreichbar." : "Spiel die FH-Freischaltung selbst durch. Dein Admin-Recht zählt dann für Fächer und Lerngruppen nicht, und deine bisherige Bestätigung wird gelöscht. Nur dein Konto ist betroffen."}</p>
            <div class="row">${tst.data ? `<button class="btn pri sm" id="so-fhtgo">Freischaltung starten</button><button class="btn sm" id="so-fhtoff">Testmodus beenden</button>` : `<button class="btn pri sm" id="so-fhton">Als Student testen</button>`}</div></section>`;
        body.innerHTML = fhSec + tSec + `<section class="card"><h3>Stummgeschaltet</h3>${mu.length ? mu.map(x => `<div class="so-urow" data-uid="${x.user_id}">${av(names[x.user_id])}<div class="so-utxt"><b>${esc(nm(x.user_id))}</b><small class="muted">bis ${until(x.until)}${x.reason ? " · " + esc(x.reason) : ""}</small></div><div class="row so-uact"><button class="btn sm" data-ua="unmute">Aufheben</button></div></div>`).join("") : `<p class="muted">Niemand ist stummgeschaltet.</p>`}</section>
          <section class="card"><h3>Letzte Verwarnungen</h3>${no.length ? no.map(n => `<div class="so-urow">${av(names[n.user_id])}<div class="so-utxt"><b>${esc(nm(n.user_id))}</b><small class="muted">${time(n.created_at)} · ${n.seen ? "gelesen" : "noch nicht gelesen"}</small><p>${esc(n.text)}</p></div></div>`).join("") : `<p class="muted">Noch keine Verwarnungen.</p>`}</section>
          <section class="card so-danger"><h3>Global-Chat leeren</h3><p class="muted">Löscht alle Nachrichten im Global-Chat für alle. Gruppen und Direktchats bleiben.</p><button class="btn sm so-dbtn" id="so-clear">Global-Chat leeren</button></section>`;
        const tog = async on => { try { await q(sb.rpc("admin_fh_test", { on_: on })); fhTest = on; await fhLoad(); App.renderSide(); App.accessChanged && App.accessChanged();
            App.toast(on ? "Testmodus an" : "Testmodus aus", on ? "Du siehst StudyOS jetzt wie ein normaler User. Starte die Freischaltung über „Freischaltung starten“." : "Du hast wieder vollen Admin-Zugang.", "✓"); paint(); } catch (er) { App.toast("Fehler", fail(er), "!"); } };
        const ton = $("#so-fhton", body); if (ton) ton.onclick = () => { if (confirm("Testmodus einschalten? Deine FH-Bestätigung wird gelöscht und du gehst den Ablauf wie ein Student neu durch.")) tog(true); };
        const toff = $("#so-fhtoff", body); if (toff) toff.onclick = () => tog(false);
        const tgo = $("#so-fhtgo", body); if (tgo) tgo.onclick = () => fhDialog(() => paint());
        const wcp = $("#so-wicopy", body); if (wcp) wcp.onclick = () => copy(wc.data, "Code in der Zwischenablage.");
        const wcs = $("#so-wiset", body); if (wcs) wcs.onclick = async () => {
          const v = prompt("Neuer Studiengangs-Code (4 bis 16 Buchstaben oder Ziffern):", ""); if (!v) return;
          try { await q(sb.rpc("admin_wi_code", { new_code: v })); App.toast("Geändert", "Der neue Code gilt ab sofort.", "✓"); paint(); } catch (er) { App.toast("Fehler", /4 bis 16/.test(String(er.message)) ? "Der Code braucht 4 bis 16 Buchstaben oder Ziffern." : fail(er), "!"); }
        };
        $$("[data-fhrev]", body).forEach(b => b.onclick = async () => {
          if (!confirm("Zugang zu Lerngruppen entziehen? Die Person muss dann den Studiengangs-Code neu eingeben.")) return;
          try { await q(sb.rpc("admin_fh_revoke", { uid: b.closest("[data-fuid]").dataset.fuid })); paint(); } catch (er) { App.toast("Fehler", fail(er), "!"); }
        });
        $("#so-clear", body).onclick = async () => {
          if (!confirm("Wirklich alle Nachrichten im Global-Chat löschen? Das lässt sich nicht rückgängig machen.")) return;
          try { const n = await q(sb.rpc("admin_clear_global")); App.toast("Geleert", `${n || 0} Nachrichten gelöscht.`, "✓"); paint(); } catch (er) { App.toast("Fehler", modFail(er), "!"); }
        };
      }
    } catch (e) { if (alive()) body.innerHTML = `<div class="empty">${esc(modFail(e))}</div>`; }
  };
  const done = async (r, txt, close) => {
    const patch = { action: (r.action ? r.action + " · " : "") + txt }; if (close !== false) patch.status = "done";
    await q(sb.from("reports").update(patch).eq("id", r.id)); paint();
  };
  el.onclick = async e => {
    const at = e.target.closest("[data-at]"); if (at) { aTab = at.dataset.at; $$(".so-atabs .chip", el).forEach(b => { const on = b === at; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); }); return paint(); }
    const as = e.target.closest("[data-as]"); if (as) { aStatus = as.dataset.as; return paint(); }
    const wr = e.target.closest("[data-wrm]"); if (wr) { try { await q(sb.from("bad_words").delete().eq("word", wr.dataset.wrm)); paint(); } catch (er) { App.toast("Fehler", modFail(er), "!"); } return; }
    const ra = e.target.closest("[data-ra]"), ua = e.target.closest("[data-ua]");
    try {
      if (ra) {
        const r = rows.find(x => x.id === +ra.closest("[data-rid]").dataset.rid); if (!r) return;
        const a = ra.dataset.ra;
        if (a === "del") { if (!confirm("Diese Nachricht für alle löschen?")) return; await q(sb.rpc("admin_delete_message", { mid: r.message_id })); paint(); App.toast("Gelöscht", "Die Nachricht ist für alle weg.", "✓"); }
        else if (a === "name") { await q(sb.rpc("admin_reset_name", { uid: r.sender })); delete names[r.sender]; await done(r, "Name zurückgesetzt"); }
        else if (a === "warn") warnDialog(r.sender, t => done(r, t));
        else if (a === "mute") muteDialog(r.sender, t => done(r, t));
        else if (a === "done") await done(r, "erledigt");
        else if (a === "open") { await q(sb.from("reports").update({ status: "open" }).eq("id", r.id)); paint(); }
        else if (a === "rm") { if (!confirm("Meldung entfernen? Die Nachricht selbst bleibt.")) return; await q(sb.from("reports").delete().eq("id", r.id)); paint(); }
      } else if (ua) {
        const uid = ua.closest("[data-uid]").dataset.uid, a = ua.dataset.ua;
        if (a === "warn") warnDialog(uid, () => paint());
        else if (a === "mute") muteDialog(uid, () => paint());
        else if (a === "unmute") { await q(sb.from("mutes").delete().eq("user_id", uid)); App.toast("Aufgehoben", `${nm(uid)} kann wieder schreiben.`, "✓"); paint(); }
        else if (a === "name") { if (!confirm(`Namen von ${nm(uid)} auf „Studi“ setzen?`)) return; await q(sb.rpc("admin_reset_name", { uid })); delete names[uid]; paint(); }
        else if (a === "purge") { if (!confirm(`Alle Global-Chat-Nachrichten von ${nm(uid)} löschen?`)) return; const n = await q(sb.rpc("admin_purge_user", { uid })); App.toast("Gelöscht", `${n || 0} Nachrichten entfernt.`, "✓"); paint(); }
      }
    } catch (er) { App.toast("Fehler", modFail(er), "!"); }
  };
  adminRedraw = () => { if (!alive()) { adminRedraw = null; return; } if (aTab === "reports" && aStatus === "open") paint(); else stats(); };
  paint();
}

function globalPage(el) {
  el.innerHTML = `<div class="page so so-full">${head("Global-Chat", "Offen für alle, die StudyOS nutzen. Nachrichten und Anhänge verschwinden nach 24 Stunden. Bleib freundlich, keine privaten Daten. Schimpfwörter werden ausgeblendet und dem Admin gemeldet, fremde Nachrichten kannst du melden.")}
    <div class="so-tools so-gtabs"><button class="chip" data-go="together">‹ Gemeinsam</button><button class="chip" data-go="together" data-p="find">Gruppen entdecken</button></div>
    <div class="card so-box"></div></div>`;
  chat($(".so-box", el), { course: "global" }, "An alle schreiben …");
}

/* Fach-App: Lerngruppen dieses Fachs (p = Fach-ID oder "FACH|g:GRUPPE") */
PAGES.coursechat = (el, p) => boot(el, async () => {
  drop();
  const [cid, sub] = String(p || (App.currentApp && App.currentApp()) || "").split("|"), c = CBY[cid];
  if (!c) return App.go("together", "");
  if (!fhOk()) {
    el.innerHTML = `<div class="page so">${head(`Lerngruppen · ${esc(c.title)}`, "")}
      <section class="card so-fhcard"><h3>🎓 Nur für die FH JOANNEUM</h3><div class="so-fh"></div></section>
      <section class="card so-global"><div class="spread"><h3>Global-Chat</h3><button class="btn pri sm" data-go="together" data-p="global">Öffnen ›</button></div><p class="muted">Ein offener Chat für alle, die StudyOS nutzen.</p></section>
      <div class="row"><button class="btn ghost sm" data-go="together">Freunde & Gruppen ›</button></div></div>`;
    return fhSteps($(".so-fh", el), () => PAGES.coursechat(el, p));
  }
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
  if (sys && pushOk() && k !== "test" && k !== "admin") return; /* Admin-Hinweise kommen nicht per Push */ /* kommt per Push vom Server, sonst doppelt */
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
if (navigator.serviceWorker) navigator.serviceWorker.addEventListener("message", e => { const d = e.data || {}; if (d.type === "open-chat" && /^((dm|g):|admin$)/.test(d.chat || "")) openChat(d.chat); });
const START_CHAT = (/^#chat=((?:dm|g):[\w-]+|admin)$/.exec(location.hash) || [])[1];
if (START_CHAT) try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
App.afterBoot.push(() => {
  if (START_CHAT) setTimeout(() => openChat(START_CHAT), 60);
  const go = () => { if (!st().on || !navigator.onLine) return; connect().then(startInbox).catch(() => {}); };
  setTimeout(go, 1200);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { const v = viewing(); if (v && unread[v]) markRead(v); if (inbox) inboxSoon(); else go(); } });
  window.addEventListener("online", go);
});

/* Einladungslink geöffnet: direkt zu „Gemeinsam“ */
App.afterBoot.push(() => { try { if (sessionStorage.getItem("studyos.invite") || FHLINK) setTimeout(() => App.go("together", ""), 50); } catch (e) {} });
App.social = { connect, me: () => me, client: () => sb, ensure: client };
})();
