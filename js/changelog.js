/* StudyOS · Versionsverlauf ("Neuigkeiten")
   Neueste Version zuerst. Bei jedem Update oben einen Eintrag ergänzen und sw.js VERSION gleich setzen.
   Muss vor apps.js geladen werden, damit die Seite als Hub-Seite umhüllt wird. */
(function () {
const { esc, PAGES } = App;

const LOG = App.CHANGELOG = [
  { v: "4.20.0", d: "2026-10-20", t: "Richtige Konten und QR-Scanner", items: [
    "Gemeinsam: Dein Gastkonto lässt sich mit E-Mail und Passwort sichern. Damit meldest du dich in der App, im Browser und auf jedem anderen Gerät als dieselbe Person an, Freunde und Gruppen bleiben erhalten.",
    "Neuer QR-Scanner direkt in der App (Gemeinsam → QR scannen), damit Einladungen nicht im Browser landen.",
    "Auf Android öffnen Einladungslinks von der normalen Kamera direkt die installierte App, wenn sie installiert ist, sonst den Browser.",
    "Landet ein Einladungslink doch im Browser, zeigt StudyOS den Code zum Abtippen in der App an."] },
  { v: "4.19.0", d: "2026-10-19", t: "Bilder und Dateien im Chat", items: [
    "In allen Chats lassen sich über 📎 Bilder, GIFs und Dateien bis 5 MB senden, auch per Einfügen oder Hineinziehen. Fotos werden vorher automatisch verkleinert.",
    "Anhänge sind 24 Stunden abrufbar und werden danach gelöscht.",
    "Der offene Live-Chat pro Fach zeigt nur die letzten 24 Stunden. Lerngruppen und Direktchats bleiben erhalten."] },
  { v: "4.18.1", d: "2026-10-19", t: "Leerer Kalender zum Start", items: [
    "Die vorab eingetragenen Prüfungen, Abgaben und Termine sind entfernt. Kalender und Startseite zeigen nur noch deinen Stundenplan und Termine, die du selbst anlegst.",
    "Gemeinsam: Fehlermeldungen beim Verbinden zeigen jetzt den genauen Grund von Supabase an."] },
  { v: "4.17.0", d: "2026-10-19", t: "Neues Design in FH-Grün", items: [
    "StudyOS trägt jetzt das Grün der Wirtschaftsinformatik an der FH JOANNEUM, mit Facetten-Muster auf Startseite und Willkommensbildschirm.",
    "Neues App-Symbol in Grün. Es erneuert sich auf Handy und Laptop von selbst, sobald die neue Version geladen ist.",
    "Die frühere Farbe Petrol und weitere Farben lassen sich weiterhin unter Einstellungen → Profil wählen."] },
  { v: "4.16.0", d: "2026-10-19", t: "Gemeinsam lernen: Freunde, Chats und Lerngruppen", items: [
    "Neuer Bereich „Gemeinsam“: Freunde per QR-Code oder Freundescode hinzufügen und privat schreiben.",
    "Lerngruppen pro Fach gründen, per Code oder QR-Code einladen und gemeinsam an Fragen grübeln.",
    "Jedes Fach hat einen offenen Live-Chat für alle, die StudyOS nutzen (im Fach-Menü unter „Live-Chat & Gruppen“).",
    "Der Online-Modus ist freiwillig. Sichtbar sind nur Name und Avatar, alles andere funktioniert weiter ohne Internet."] },
  { v: "4.15.0", d: "2026-10-19", t: "Rechner, Animationen und mehr Übung in allen Fächern", items: [
    "Neue Rechner mit Live-Graph: Werte eintippen oder Regler ziehen, Ergebnis und Rechenweg erscheinen sofort, beim Darüberfahren zeigt der Graph die Werte an jeder Stelle.",
    "In allen Fächern mehr durchgerechnete Beispiele, neue Animationen und zusätzliche Übungsfragen zu jedem Thema.",
    "Neues Logo, sanftes Einblenden beim Scrollen, Lesefortschritt in Lektionen und Skript, schönere Fach-Übersicht.",
    "Profil: Avatar, Farbe der App und ein Tagesziel in Minuten, das auf der Startseite angezeigt wird.",
    "Neue Seite „Feedback“: Feedback, Vorschläge, Fehler und Bewertungen direkt per E-Mail an den Entwickler.",
    "Handy: Die Seite verrutscht nicht mehr seitlich, breite Tabellen lassen sich innerhalb ihrer Box wischen."] },
  { v: "4.14.0", d: "2026-10-19", t: "Neue Startseite und Kalender mit Stundenplan", items: [
    "Neue Startseite „Heute“: Begrüßung, deine nächste Lektion, was heute an der FH ansteht und alle Fächer mit Fortschritt auf einen Blick.",
    "Neuer Kalender als Wochenansicht. Den Stundenplan holst du dir als iCal-Link oder .ics-Datei, zum Beispiel aus Studo oder dem FH-System.",
    "„Aufgaben & Lernplan“ und die Aufforderungen, Prüfungstermine einzutragen, sind entfernt.",
    "Sanfte Animationen und mehr Feinschliff in der ganzen App, auch im Willkommensbildschirm."] },
  { v: "4.13.0", d: "2026-10-19", t: "Freundlicher Start und Sprache am Handy", items: [
    "Neuer Willkommensbildschirm: erklärt in drei Schritten, wie StudyOS funktioniert, und fragt nur nach Name und Semester.",
    "Die Startseite „Heute“ zeigt zuerst einen klaren nächsten Schritt. Woche, Termine und alle Fächer sind eingeklappt.",
    "Die Spracheinstellung funktioniert jetzt auch am Handy: Ohne eingebauten Übersetzer im Browser übersetzt StudyOS online mit Google Übersetzer."] },
  { v: "4.12.0", d: "2026-10-19", t: "Sprache, besserer Sync, aufgeräumt", items: [
    "Neue Einstellung „Sprache“: Die ganze App lässt sich in über 20 Sprachen anzeigen. Übersetzt wird direkt auf dem Gerät mit dem Übersetzer des Browsers.",
    "Sync zwischen Handy und Laptop führt jetzt den Fortschritt beider Geräte zusammen, statt einen Stand zu überschreiben.",
    "Weiteres Gerät per QR-Code verbinden, ohne Token abzutippen.",
    "Die Bereiche Pokémon-Sammlung und Stricken & Häkeln sind entfernt, StudyOS konzentriert sich aufs Studium."] },
  { v: "4.11.0", d: "2026-10-19", t: "Versionsverlauf", items: [
    "Neue Seite „Neuigkeiten“: zeigt, was in welcher Version dazugekommen ist.",
    "Nach einem Update weist die App einmal auf die Neuerungen hin."] },
  { v: "4.10.0", d: "2026-10-18", t: "Mathematik 2: eigene Maple-Übungen", items: [
    "5 neue Arbeitsblätter im Maple-Labor mit 60 Aufgaben aus den eigenen Maple-Dateien: Extremwerte und Lagrange, Interpolation und Fit, Integrale, Matrizen, Markov-Ketten.",
    "5 neue Aufgaben in „Prüfung üben“ nach den eigenen Tests.",
    "Maple-Engine kann jetzt assign/unassign, solve mit Parametern, Splines mit Endpunkten und symbolische Inversen."] },
  { v: "4.9.0", d: "2026-10-18", t: "Neues Fach Mathematik 2 und Semesterwahl", items: [
    "Mathematik 2 (Semester 2) mit 5 Kapiteln: Differentialrechnung, Numerik, Integralrechnung, Computergrafik, Markov-Ketten.",
    "Maple-Labor: Maple-Befehle direkt im Browser ausführen, mit Plots und Matrizen.",
    "Prüfungssimulation mit zufällig erzeugten Aufgaben, dazu die Altklausuren mit Lösungen.",
    "Semesterwahl: Fächer sind nach Semester 1, 2 und 3 sortiert."] },
  { v: "4.8.0", d: "2026-10-14", t: "Bilder und Animationen", items: [
    "Lektionen können interaktive Grafiken und Schritt-Animationen enthalten.",
    "24 Grafiken für IT-Infrastruktur V1–V3."] },
  { v: "4.7.0", d: "2026-10-14", t: "Jedes Fach als eigene App", items: [
    "Jedes Fach öffnet sich mit eigenem Design und eigenem Menü.",
    "IT-Infrastruktur: Mehrfachauswahl-Fragen und Quick-Test-Modus."] },
  { v: "4.6.0", d: "2026-10-14", t: "IT-Infrastruktur V2 und V3", items: [
    "Kapitel V2 und V3 neu, V1 um Vorlesungsnotizen ergänzt, viele neue Übungsfragen."] },
  { v: "4.5.0", d: "2026-10-07", t: "Kotlin-Labor", items: [
    "Kotlin-Labor zum Üben direkt in der App.",
    "Neue Kapitel für Mobile App Development.",
    "Anleitung überarbeitet."] },
  { v: "4.4.0", d: "2026-10-05", t: "Vertiefung für alle Fächer", items: [
    "Zu jedem Thema Vertiefungen, Alltagsbeispiele und aufklappbare Tipps, in allen 11 Fächern."] },
  { v: "4.2.0", d: "2026-10-02", t: "Skript-Ansicht", items: [
    "Jedes Fach hat eine Skript-Ansicht zum Durchlesen.",
    "Organisatorisches aus dem Syllabus ist kein Lernstoff mehr."] },
  { v: "4.1.0", d: "2026-10-02", t: "Prüfung üben", items: [
    "Prüfungsvorbereitung aus Altprüfungen für alle Fächer.",
    "Neues Fach SUNW2."] },
  { v: "4.0.0", d: "2026-10-01", t: "Semester 3 und neues Lernsystem", items: [
    "6 neue Fächer für Semester 3.",
    "Ruhiges Lernsystem mit Wiederholung im richtigen Abstand statt Punkten.",
    "Neu gestaltete Oberfläche."] },
  { v: "3.0.0", d: "2026-09-27", t: "Profile", items: [
    "Mehrere Profile auf einem Gerät, jeweils mit eigenem Inhalt."] },
  { v: "2.2.0", d: "2026-09-27", t: "Zurücksetzen und Git-Labor", items: [
    "Fächer und Lektionen lassen sich zurücksetzen, um neu zu lernen.",
    "Git-Labor mit eigener Übungsumgebung pro Aufgabe."] },
  { v: "2.0.0", d: "2026-09-27", t: "Erste Version", items: [
    "StudyOS als installierbare App für Handy und Laptop, funktioniert offline.",
    "Lektionen, Quiz, Karteikarten, Kalender und Lernplan."] }
];
App.VERSION = LOG[0].v;

const date = d => new Date(d + "T12:00:00").toLocaleDateString("de-AT", { day: "numeric", month: "long", year: "numeric" });

PAGES.news = el => {
  el.innerHTML = `<div class="page"><div><h1>Neuigkeiten</h1><p class="muted">Was in welcher Version von StudyOS dazugekommen ist. Aktuell: Version ${esc(App.VERSION)}.</p></div>
    <div class="cl">${LOG.map((e, i) => `<div class="card cl-e${i ? "" : " cl-new"}">
      <div class="cl-h"><span class="cl-v">v${esc(e.v)}</span><b>${esc(e.t)}</b><small class="cl-d">${date(e.d)}</small></div>
      <ul>${e.items.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}</div></div>`;
  const s = App.S(); if (s.settings && s.settings.seenVer !== App.VERSION) { s.settings.seenVer = App.VERSION; App.save(); }
};

/* Nach einem Update einmal auf die Neuerungen hinweisen */
App.afterBoot.push(() => setTimeout(() => {
  const s = App.S(); if (!s.settings) return;
  if (!s.settings.seenVer) { s.settings.seenVer = App.VERSION; App.save(); return; }
  if (s.settings.seenVer === App.VERSION) return;
  const box = document.querySelector("#toasts"); if (!box) return;
  const t = document.createElement("div"); t.className = "toast ach";
  t.innerHTML = `<div class="ti">✦</div><div><div class="eyebrow">Neu in Version ${esc(App.VERSION)}</div><div>${esc(LOG[0].t)}</div></div><button class="btn sm pri">Ansehen</button>`;
  t.querySelector("button").onclick = () => { t.remove(); App.go("news"); };
  box.appendChild(t); setTimeout(() => t.remove(), 12000);
  s.settings.seenVer = App.VERSION; App.save();
}, 1800));
})();
