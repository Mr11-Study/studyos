/* StudyOS · Zugang je Kontotyp
   guest (ohne Konto): Heute, Kalender, Unterwegs, Neuigkeiten, Einstellungen.
   user (Konto ohne FH-Bestätigung): dazu Gemeinsam (Global-Chat, Freunde, Direktchats, Gruppen ohne Fach).
   fh (bestätigte FH-Adresse von Studierenden oder Lehrenden): alles, auch Fächer und Lerngruppen.
   Den Kontotyp liefert App.tier() aus social.js. Die Lerngruppen sind zusätzlich in der Datenbank geschützt
   (supabase-update-11.sql); die Fächer blendet die App aus.
   Muss nach apps.js und settings-ui.js geladen werden, weil es die fertigen Seiten umhüllt. */
(function () {
const { $, $$, esc, PAGES } = App;
/* Neuigkeiten sehen alle, ohne FH-Konto aber nur die allgemeine Fassung (PUB in changelog.js) */
const OPEN = new Set(["dash", "calendar", "transit", "news", "feedback", "settings", "welcome", "profile"]);
const tier = () => (App.tier ? App.tier() : "fh");
App.pageOk = v => tier() === "fh" || OPEN.has(v) || (v === "together" && tier() === "user");

function lockPage(el, v) {
  const t = tier();
  const what = v === "together" ? ["Gemeinsam braucht ein Konto", "Freunde, Direktchats und der Global-Chat sind für alle mit Konto da. Als Gast nutzt du Kalender und Unterwegs."]
    : ["Nur für die FH JOANNEUM", "Fächer mit Skript, Üben und Prüfungstraining sowie Lerngruppen gibt es für Studierende und Lehrende der FH JOANNEUM."];
  el.innerHTML = `<div class="page"><section class="card ac-lock"><span class="ac-ic" aria-hidden="true">${v === "together" ? "◎" : "🎓"}</span><h2>${what[0]}</h2><p class="muted">${what[1]}</p>
    ${t === "guest" ? `<p class="muted">Melde dich an oder erstelle ein Konto. Mit deiner FH-Adresse schaltest du danach die Fächer frei.</p><div class="row"><button class="btn pri" data-go="welcome">Anmelden oder Konto erstellen</button><button class="btn ghost" data-go="dash">Zu Heute</button></div>`
      : `<p class="muted">Bestätige deine FH-Adresse (@edu.fh-joanneum.at oder @fh-joanneum.at), dann siehst du alles.</p><div class="row"><button class="btn pri" data-acunlock>FH-Konto bestätigen</button><button class="btn ghost" data-go="dash">Zu Heute</button></div>`}</section></div>`;
}
document.addEventListener("click", e => { if (e.target.closest("[data-acunlock]") && App.social_fh) App.social_fh.dialog(() => App.go(App.route().v, App.route().p)); });

/* Alle Seiten umhüllen: Sperre prüfen und den Startbildschirm ohne Menü zeigen */
Object.keys(PAGES).forEach(k => {
  const orig = PAGES[k];
  PAGES[k] = (el, p) => {
    /* Profil gehört einem Konto, aber niemand ist angemeldet: nur der Startbildschirm, keine Daten */
    const locked = k !== "welcome" && tier() === "guest" && window.StudyProfiles && StudyProfiles.acct && StudyProfiles.acct();
    document.body.classList.toggle("so-start", k === "welcome" || !!locked);
    if (locked) return PAGES.welcome(el, "");
    if (!App.pageOk(k)) return lockPage(el, k);
    return orig(el, p);
  };
});

/* „Heute“ für Gäste und normale User: eigene Startseite ohne Lernstoff und Lern-Statistiken.
   Die Klasse dh-grid bleibt, damit Unterwegs (transit.js) seine Karte mit der nächsten Verbindung anhängt. */
const KIND = { exam: "Prüfung", deadline: "Abgabe", register: "Anmeldung", other: "Termin", study: "Termin" };
const dk = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
App.homeLite = el => {
  const t = tier(), now = new Date(), today = dk(now), h = now.getHours(), nowHM = now.toTimeString().slice(0, 5);
  const in30 = new Date(now); in30.setDate(in30.getDate() + 30);
  const cal = App.calendarItems || (() => []), todays = cal(today, today), soon = cal(dk(new Date(now.getTime() + 864e5)), dk(in30)).filter(e => e.type !== "class" && !e.done).slice(0, 4);
  const next = todays.find(e => e.time && e.time >= nowHM);
  const named = t !== "guest" && App.S().name;
  const greet = (h < 5 ? "Noch wach" : h < 11 ? "Guten Morgen" : h < 18 ? "Hallo" : "Guten Abend") + (named ? ", " + esc(App.S().name) : "");
  const day = d => { const n = Math.round((new Date(d + "T12:00:00") - new Date(today + "T12:00:00")) / 864e5); return n === 1 ? "morgen" : "in " + n + " Tagen"; };
  el.innerHTML = `<div class="page dash2 hl">
    <section class="dh-hero hl-hero"><div class="dh-orbs" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="dh-in"><span class="eyebrow">${now.toLocaleDateString("de-AT", { weekday: "long", day: "numeric", month: "long" })}</span>
        <h1>${greet}</h1>
        <p>${todays.length ? (next ? `Als Nächstes um ${esc(next.time)}: ${esc(next.title)}.` : `Heute ${todays.length === 1 ? "ein Termin" : todays.length + " Termine"}, für heute ist alles erledigt.`) : "Heute stehen keine Termine im Kalender."}</p>
        <div class="hl-acts"><button class="btn sm" data-go="calendar">Kalender</button><button class="btn sm" data-go="transit">Unterwegs</button>${t === "user" ? `<button class="btn sm" data-go="together" data-p="global">Global-Chat</button>` : ""}</div></div></section>
    <div class="dh-grid">
      <section class="card hl-today"><div class="spread"><h3>Heute</h3><button class="btn ghost sm" data-go="calendar">Kalender →</button></div>
        ${todays.length ? `<div class="hl-list">${todays.map(e => `<div class="hl-it${e.time && e.time < nowHM ? " past" : ""}"><b class="tab">${esc(e.time || "–")}</b><div><div>${esc(e.title)}</div>${e.loc ? `<small class="muted">${esc(e.loc)}</small>` : ""}</div></div>`).join("")}</div>`
          : `<p class="muted">Nichts geplant. Trag Termine im Kalender ein oder hol dir einen Stundenplan als .ics-Datei.</p><div class="row"><button class="btn sm" data-go="calendar">Termin eintragen</button></div>`}
        ${soon.length ? `<div class="hl-soon"><span class="eyebrow">Demnächst</span>${soon.map(e => `<div class="hl-si"><span>${esc(e.title)}</span><small class="muted">${KIND[e.type] || "Termin"} · ${day(e.date)}</small></div>`).join("")}</div>` : ""}</section>
      ${t === "guest"
        ? `<section class="card ac-more"><span class="eyebrow">Mehr mit Konto</span><h3>Chatten und Freunde finden</h3><p class="muted">Mit einem kostenlosen Konto schreibst du im Global-Chat, fügst Freunde hinzu und hast deinen Kalender auf jedem Gerät.</p><div class="row"><button class="btn pri sm" data-go="welcome">Konto erstellen oder anmelden</button></div></section>`
        : `<section class="card ac-more"><span class="eyebrow">Gemeinsam</span><h3>Global-Chat und Freunde</h3><p class="muted">Schreib mit allen im Global-Chat oder privat mit Freunden. Dein Kalender ist auf jedem Gerät gleich.</p><div class="row"><button class="btn pri sm" data-go="together" data-p="global">Global-Chat</button><button class="btn sm" data-go="together">Freunde</button></div>
            <p class="muted hl-fh">Studierst oder lehrst du an der FH JOANNEUM? <a href="#" data-acunlock>FH-Konto bestätigen</a></p></section>`}
    </div></div>`;
};
document.addEventListener("click", e => { if (e.target.closest("a[data-acunlock]")) e.preventDefault(); }, true);

/* Termine aus den Kursdateien (Prüfungen, Abgaben) verraten Fächer: ohne FH-Konto nur eigene Termine und Stundenplan */
if (App.eventsBetween) { const eb = App.eventsBetween; App.eventsBetween = (...a) => { const r = eb(...a); return tier() === "fh" ? r : r.filter(e => e.src !== "course"); }; }

/* Kontotyp hat sich geändert (Anmeldung, Bestätigung, Abmeldung): gesperrte Seite neu zeichnen */
App.accessChanged = () => { const R = App.route(); if (R.v !== "welcome" && R.v !== "together" && R.v !== "coursechat") App.go(R.v, R.p); };
})();
