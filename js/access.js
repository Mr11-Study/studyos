/* StudyOS · Zugang je Kontotyp
   guest (ohne Konto): Heute, Kalender, Unterwegs, Neuigkeiten, Einstellungen.
   user (Konto ohne FH-Bestätigung): dazu Gemeinsam (Global-Chat, Freunde, Direktchats, Gruppen ohne Fach).
   fh (bestätigte FH-Adresse, Studierende mit Studiengangs-Code oder Lehrende): alles, auch Fächer und Lerngruppen.
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
    : ["Nur für die FH JOANNEUM", "Fächer mit Skript, Üben und Prüfungstraining sowie Lerngruppen gibt es für Studierende der Wirtschaftsinformatik und Lehrende der FH JOANNEUM."];
  el.innerHTML = `<div class="page"><section class="card ac-lock"><span class="ac-ic" aria-hidden="true">${v === "together" ? "◎" : "🎓"}</span><h2>${what[0]}</h2><p class="muted">${what[1]}</p>
    ${t === "guest" ? `<p class="muted">Melde dich an oder erstelle ein Konto. Mit deiner FH-Adresse schaltest du danach die Fächer frei.</p><div class="row"><button class="btn pri" data-go="welcome">Anmelden oder Konto erstellen</button><button class="btn ghost" data-go="dash">Zu Heute</button></div>`
      : `<p class="muted">Bestätige deine FH-Adresse (@edu.fh-joanneum.at oder @fh-joanneum.at), dann siehst du alles.</p><div class="row"><button class="btn pri" data-acunlock>FH-Konto bestätigen</button><button class="btn ghost" data-go="dash">Zu Heute</button></div>`}</section></div>`;
}
document.addEventListener("click", e => { if (e.target.closest("[data-acunlock]") && App.social_fh) App.social_fh.dialog(() => App.go(App.route().v, App.route().p)); });

/* Alle Seiten umhüllen: Sperre prüfen und den Startbildschirm ohne Menü zeigen */
Object.keys(PAGES).forEach(k => {
  const orig = PAGES[k];
  PAGES[k] = (el, p) => {
    document.body.classList.toggle("so-start", k === "welcome");
    if (!App.pageOk(k)) return lockPage(el, k);
    return orig(el, p);
  };
});

/* Heute ohne FH-Konto: keine Lernkarten, dafür ein Hinweis, was mit Konto dazukommt */
const dash = PAGES.dash;
PAGES.dash = (el, p) => {
  const r = dash(el, p);
  if (tier() === "fh") return r;
  $$(".dh-next", el).forEach(x => x.remove());
  [".dh-also", ".dh-courses"].forEach(sel => { const x = $(sel, el); if (x) (x.closest("section") || x).remove(); });
  $$(".dh-stats > *", el).forEach(x => { if (/Lektion/.test(x.textContent)) x.remove(); });
  const hero = $(".dh-hero p", el); if (hero && !/FH/.test(hero.textContent)) hero.textContent = "Dein Tag auf einen Blick: Termine, Stundenplan und die nächste Verbindung.";
  const grid = $(".dh-grid", el);
  if (grid) {
    const c = document.createElement("section"); c.className = "card ac-more";
    c.innerHTML = tier() === "guest"
      ? `<span class="eyebrow">Mehr mit Konto</span><h3>Chats, Freunde und Fächer</h3><p class="muted">Mit einem Konto schreibst du im Global-Chat und mit Freunden. Mit deiner FH-Adresse bekommst du alle Fächer der Wirtschaftsinformatik mit Skript, Üben und Prüfungstraining.</p><div class="row"><button class="btn pri sm" data-go="welcome">Anmelden</button></div>`
      : `<span class="eyebrow">Gemeinsam</span><h3>Global-Chat und Freunde</h3><p class="muted">Schreib mit allen im Global-Chat oder privat mit Freunden. Studierst du an der FH JOANNEUM? Dann bestätige deine FH-Adresse für alle Fächer.</p><div class="row"><button class="btn pri sm" data-go="together" data-p="global">Global-Chat</button><button class="btn sm" data-go="together">Freunde</button><button class="btn ghost sm" data-acunlock>FH-Konto bestätigen</button></div>`;
    grid.insertBefore(c, grid.firstChild);
  }
  return r;
};

/* Kontotyp hat sich geändert (Anmeldung, Bestätigung, Abmeldung): gesperrte Seite neu zeichnen */
App.accessChanged = () => { const R = App.route(); if (R.v !== "welcome" && R.v !== "together" && R.v !== "coursechat") App.go(R.v, R.p); };
})();
