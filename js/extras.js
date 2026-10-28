/* StudyOS · Extras: Feedback-Seite, mehr Profil-Einstellungen (Avatar, Farbe, Tagesziel), Lesefortschritt und sanftes Einblenden beim Scrollen.
   Muss vor apps.js geladen werden, damit die Feedback-Seite als Hub-Seite umhüllt wird. */
(function () {
const { $, $$, esc, PAGES, COURSES } = App;
const S = () => App.S();
const MAIL = "kevin.popovic@edu.fh-joanneum.at";
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("less-motion");

/* ---------- Akzentfarbe der App (Hub-Seiten; Fach-Apps behalten ihr eigenes Design) ---------- */
const ACCENTS = [["fh", "FH-Grün", "#76B82A"], ["petrol", "Petrol", "#0E6B6B"], ["blau", "Blau", "#2E66AE"], ["violett", "Violett", "#6E54B8"], ["beere", "Beere", "#A8336A"], ["orange", "Orange", "#B8611A"]];
const applyAccent = () => { const a = (S().settings || {}).accent; if (a && a !== "fh" && a !== "gruen" && ACCENTS.some(x => x[0] === a)) document.documentElement.dataset.acc = a; else delete document.documentElement.dataset.acc; };
App.afterBoot.unshift(applyAccent); App.applyAccent = applyAccent;

/* ---------- Feedback ---------- */
const KINDS = [["feedback", "Feedback", "Allgemeine Rückmeldung"], ["idee", "Vorschlag", "Idee für eine neue Funktion"], ["fehler", "Fehler melden", "Etwas funktioniert nicht"], ["bewertung", "Bewertung", "Sterne und ein paar Worte"]];
PAGES.feedback = el => {
  let kind = "feedback", stars = 0;
  el.innerHTML = `<div class="page fb">
    <header class="fb-head"><span class="eyebrow">Kontakt</span><h1>Feedback &amp; Vorschläge</h1><p class="muted">Was gefällt dir, was fehlt, was hakt? Deine Nachricht geht direkt an Kevin, den Entwickler von StudyOS.</p></header>
    <section class="card fb-card">
      <div class="fb-kinds" role="radiogroup" aria-label="Art der Nachricht">${KINDS.map(([k, t, s], i) => `<button class="fb-kind ${i ? "" : "on"}" data-kind="${k}" role="radio" aria-checked="${!i}"><b>${t}</b><small>${s}</small></button>`).join("")}</div>
      <div class="fb-stars" hidden><span class="muted">Deine Bewertung</span><div class="stars" role="radiogroup" aria-label="Sterne">${[1, 2, 3, 4, 5].map(n => `<button data-star="${n}" aria-label="${n} von 5 Sternen">★</button>`).join("")}</div></div>
      <label class="fld">Fach (optional)<select id="fb-c"><option value="">Allgemein</option>${COURSES.map(c => `<option value="${esc(c.title)}">${esc(c.title)}</option>`).join("")}</select></label>
      <label class="fld">Nachricht<textarea id="fb-t" rows="6" placeholder="Schreib einfach drauf los …"></textarea></label>
      <div class="fb-actions"><button class="btn pri big" id="fb-send">E-Mail öffnen</button><button class="btn ghost" id="fb-copy">Adresse kopieren</button></div>
      <small class="muted">Öffnet dein E-Mail-Programm mit fertigem Text an <b>${MAIL}</b>. Version ${esc(App.VERSION || "")} und Gerät werden angehängt, damit Fehler leichter zu finden sind.</small>
    </section></div>`;
  const setKind = k => { kind = k; $$(".fb-kind", el).forEach(b => { b.classList.toggle("on", b.dataset.kind === k); b.setAttribute("aria-checked", b.dataset.kind === k); }); $(".fb-stars", el).hidden = k !== "bewertung"; };
  el.onclick = e => {
    const k = e.target.closest("[data-kind]"); if (k) return setKind(k.dataset.kind);
    const s = e.target.closest("[data-star]"); if (s) { stars = +s.dataset.star; $$("[data-star]", el).forEach(b => b.classList.toggle("on", +b.dataset.star <= stars)); }
  };
  $("#fb-send", el).onclick = () => {
    const t = $("#fb-t", el).value.trim(), c = $("#fb-c", el).value, label = KINDS.find(x => x[0] === kind)[1];
    if (!t && !(kind === "bewertung" && stars)) { $("#fb-t", el).focus(); return App.toast("Fast fertig", "Schreib noch kurz, worum es geht.", "✎"); }
    const subj = `StudyOS ${label}${c ? " · " + c : ""}${kind === "bewertung" && stars ? " · " + "★".repeat(stars) + "☆".repeat(5 - stars) : ""}`;
    const body = `${t}\n\n---\nVon: ${S().name || ""}\nStudyOS ${App.VERSION || ""} · ${navigator.userAgent}`;
    location.href = `mailto:${MAIL}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
    App.toast("Danke!", "Dein E-Mail-Programm öffnet sich. Einfach noch auf Senden tippen.", "✉");
  };
  $("#fb-copy", el).onclick = () => { (navigator.clipboard ? navigator.clipboard.writeText(MAIL) : Promise.reject()).then(() => App.toast("Kopiert", MAIL, "✓")).catch(() => App.toast("E-Mail-Adresse", MAIL, "✉")); };
};

/* ---------- Einstellungen: Profil mit Avatar, Farbe und Tagesziel ---------- */
const settingsPage = PAGES.settings;
PAGES.settings = (el, p) => {
  settingsPage(el, p);
  const name = $("#st-name", el), card = name && name.closest(".card"); if (!card) return;
  const st = S().settings;
  const box = document.createElement("div"); box.className = "col pf-more";
  box.innerHTML = `${App.avatar.rowHTML()}
    <div class="pf-row"><span class="pf-l">Farbe der App</span><div class="pf-acc">${ACCENTS.map(([k, t, c]) => `<button data-acc="${k}" class="${(st.accent && st.accent !== "gruen" ? st.accent : "fh") === k ? "on" : ""}" style="--sw:${c}" title="${t}" aria-label="Farbe ${t}"></button>`).join("")}</div></div>
    <label class="pf-row"><span class="pf-l">Tagesziel</span><span class="pf-goal"><input type="range" id="pf-goal" min="5" max="120" step="5" value="${st.goalMin || 20}"><b id="pf-goal-v">${st.goalMin || 20} min</b></span></label>
    <small class="muted pf-note">Das Tagesziel siehst du auf der Startseite.</small>`;
  card.appendChild(box);
  box.onclick = e => {
    const c = e.target.closest("[data-acc]"); if (c) { st.accent = c.dataset.acc; App.save(); applyAccent(); $$("[data-acc]", box).forEach(b => b.classList.toggle("on", b === c)); }
  };
  $("#pf-goal", box).oninput = e => { st.goalMin = +e.target.value; $("#pf-goal-v", box).textContent = st.goalMin + " min"; App.save(); };
};

/* ---------- Lesefortschritt (Lektion, Skript) ---------- */
const bar = document.createElement("div"); bar.id = "readbar"; bar.setAttribute("aria-hidden", "true");
const onScroll = () => { const v = App.route().v; if (v !== "lesson" && v !== "skript") { bar.style.transform = "scaleX(0)"; return; } const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`; };
addEventListener("scroll", onScroll, { passive: true });

/* ---------- Sanft einblenden, was beim Scrollen ins Bild kommt ---------- */
const SEL = "#page .card, #page .calc, #page .fig, #page .example, #page .sk-l, #page .chap, #page .hintbox, #page .callout";
let io = null;
const reveal = root => {
  if (reduced() || !("IntersectionObserver" in window)) return;
  if (!io) io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("rv-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -40px 0px" });
  root.querySelectorAll(SEL).forEach(n => { if (n.classList.contains("rv") || n.closest(".rv")) return; const r = n.getBoundingClientRect(); if (r.top > innerHeight) { n.classList.add("rv"); io.observe(n); } });
};
App.afterBoot.push(() => {
  document.body.appendChild(bar);
  const page = $("#page"); if (!page) return;
  let t = null; new MutationObserver(() => { if (t) return; t = requestAnimationFrame(() => { t = null; reveal(page); onScroll(); }); }).observe(page, { childList: true, subtree: true });
  reveal(page); onScroll();
});
})();
