# StudyOS – Anleitung

StudyOS ist eine eigenständige Lern-App (Progressive Web App). Sie läuft komplett auf deinem Gerät, braucht keinen Server, kein Konto und **keine Claude-Tokens**. Alles Optionale (Sync, KI) schaltest du selbst in den Einstellungen ein.

---

## 1. Einmalig online stellen (GitHub Pages, gratis, ~10 Minuten)

Damit du die App auf dem Xiaomi **installieren** kannst und Benachrichtigungen funktionieren, muss sie einmal über `https://` erreichbar sein. GitHub Pages ist dafür ideal.

1. Auf <https://github.com> einloggen → oben rechts **+** → **New repository**.
2. Name: `studyos` · **Public** (Pages ist bei privaten Repos nur mit Pro gratis) → **Create repository**.
3. Auf der leeren Repo-Seite: **uploading an existing file** anklicken.
4. Den **Inhalt** des entpackten Ordners `studyos-app` hineinziehen (also `index.html`, `sw.js`, `manifest.webmanifest`, `.nojekyll` und die Ordner `css`, `js`, `courses`, `icons` – nicht den Ordner selbst) → **Commit changes**.
   *Tipp:* `.nojekyll` ist eine versteckte Datei. Falls der Upload sie nicht mitnimmt: egal, die App funktioniert trotzdem.
5. **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → **Save**.
6. Nach 1–2 Minuten erscheint oben die Adresse, z. B. `https://DEINNAME.github.io/studyos/`.

> Deine Lernfortschritte liegen **nicht** im Repo, sondern nur im Browser deines Geräts. Das öffentliche Repo enthält nur die App selbst.

Mit Git statt Web-Upload (Übung für Data Science 😉):

```bash
cd studyos-app
git init && git add . && git commit -m "StudyOS v2"
git branch -M main
git remote add origin git@github.com:DEINNAME/studyos.git
git push -u origin main
```

## 2. Auf dem Xiaomi installieren

1. Die Pages-Adresse in **Chrome** öffnen (nicht im Mi-Browser – dort fehlt die Installation).
2. Menü **⋮ → App installieren** (oder „Zum Startbildschirm hinzufügen“).
3. StudyOS starten → Onboarding: Name, optional PIN.
4. **Einstellungen → Benachrichtigungen einschalten** → erlauben.

### Xiaomi/HyperOS: damit Erinnerungen wirklich ankommen
Xiaomi beendet Hintergrund-Apps sehr aggressiv. Einmalig einstellen:

- **Einstellungen → Apps → Apps verwalten → Chrome → Energiesparmodus → „Keine Einschränkungen“**
- Ebenda **Autostart** für Chrome aktivieren.
- **Benachrichtigungen** für Chrome und StudyOS erlauben (inkl. „Sperrbildschirm“ und „Pop-up“).
- In der App-Übersicht (Multitasking) StudyOS nach unten ziehen → **Schloss** (sperren).

**Wichtig:** Eine Web-App kann nicht garantieren, dass sie zu einer exakten Uhrzeit weckt, wenn sie komplett geschlossen ist. Darum gibt es zwei Ebenen:

| Ebene | Wann | Zuverlässigkeit |
|---|---|---|
| App-Erinnerungen | beim Öffnen und im Hintergrund (Periodic Sync) | gut, aber nicht auf die Minute |
| **Kalender-Export (.ics)** | Kalender → „Stundenplan“ → „Export (.ics)“ → im Handy-/Google-Kalender importieren | **sehr zuverlässig** (7, 3, 1, 0 Tage vorher) |

Empfehlung: Nach dem Eintragen von Prüfungen/Anmeldungen einmal exportieren und importieren. Nach Änderungen neu exportieren – doppelte Termine entstehen nicht (gleiche IDs).

## 3. Am Laptop

- **Variante A (empfohlen):** Pages-Adresse in Chrome/Edge öffnen → in der Adressleiste auf das **Installieren-Symbol** klicken. StudyOS läuft dann wie ein Programm in eigenem Fenster, auch offline.
- **Variante B (ohne Internet/Upload):** `StudyOS-offline.html` doppelklicken. Alles funktioniert, nur keine Hintergrund-Benachrichtigungen und keine App-Installation. Daten liegen dann im Browser für genau diese Datei.

## 4. „Anmeldung“ und Sync zwischen Handy und Laptop

StudyOS hat kein eigenes Konto (bewusst: keine Server, keine Kosten, keine Datenweitergabe). Stattdessen:

- **PIN-Sperre** (Einstellungen → PIN): schützt die App beim Öffnen.
- **Sync über GitHub Gist** (privat, gratis):
  1. GitHub → **Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token (classic)**.
  2. Note: `StudyOS`, Expiration nach Wunsch, **nur** das Häkchen **gist** setzen → Generate → Token kopieren.
  3. Am Laptop in StudyOS: **Einstellungen → Sync zwischen Handy und Laptop** → Token einfügen, Gist-ID leer lassen → „Verbinden“. Die App legt ein privates Gist an.
  4. Danach **„Weiteres Gerät verbinden (QR-Code)“** antippen und den Code mit der Handy-Kamera scannen. Der Link öffnet StudyOS am Handy und verbindet es automatisch. (Ohne Kamera: „Link kopieren“ und am anderen Gerät öffnen.)
  5. Ab dann synchronisiert StudyOS automatisch beim Öffnen, nach dem Lernen und wenn das Gerät wieder online ist; manuell über „Jetzt synchronisieren“. Wurde auf beiden Geräten gelernt, führt StudyOS den Fortschritt zusammen (erledigte Lektionen, Wiederholungen, Lerntage), es geht nichts verloren. Nur nach „Zurücksetzen“ oder dem Einspielen einer Sicherung gilt der Stand dieses Geräts für alle.
  - Der Token wird nur lokal gespeichert und nie mitsynchronisiert.
- **Backup ohne Konto:** Einstellungen → Backup-Datei → „Exportieren“ (.json) → per Mail/Drive aufs andere Gerät → dort „Importieren“.

## 5. KI (optional, standardmäßig AUS)

Die App funktioniert vollständig ohne KI. Wenn du willst, kannst du unter **Einstellungen → KI-Assistent (optional)** einen eigenen Anthropic-API-Key eintragen (bezahlt pro Nutzung über console.anthropic.com – das sind *nicht* deine Claude-App-Tokens). Vor jeder Anfrage fragt die App nach.

Kursregeln sind eingebaut:
- **Kommunikationstraining:** KI komplett gesperrt (Portfolio & Deep Talk laut LV ohne KI).
- **ENG3:** nur Erklären/Korrigieren/Recherche, Nutzung angeben; Trend-Beschreibungen selbst schreiben.
- StudyOS schreibt **keine** bewerteten Abgaben für dich – es plant, erklärt und lässt dich üben.

## 6. Tagesablauf mit StudyOS (ab Version 4.0)

Seit 4.0 gibt es im Lernprofil **keine XP, Level, Bosse oder Erfolge mehr**. Fortschritt zeigen nur noch zwei ehrliche Werte:

- **Verstanden x/y** – Lektionen, die du nach dem Lesen selbst als „verstanden“ markierst (kannst du auch wieder aufheben). Nichts ist gesperrt, du kannst jede Lektion öffnen.
- **Wissen %** – wie viele Fragen und Karteikarten eines Themas du in der **Wiederholung** wirklich weißt.

**Wiederholen** (Spaced Repetition): Sobald du eine Lektion öffnest, kommen ihre Fragen und Karteikarten in die Wiederholung (pro Sitzung höchstens 10–20 neue). Richtig → kommt nach 2, 4, 8, 16, 32 Tagen wieder. Falsch → morgen wieder (und am Ende der Sitzung nochmal). Tastatur: 1–4 wählt Antworten, Enter = weiter, Leertaste = Antwort zeigen, 1/2 = nicht gewusst/wusste ich. Unter „Wiederholen“ kannst du einen Kurs wählen und einzelne Themen oder den ganzen Kurs frei üben.

1. **Heute**: fällige Wiederholungen, „Weiter lernen“ (nächste Lektion je Kurs, nach nächster Abgabe/Prüfung sortiert), Lernzeit der Woche, Termine, Semesterüberblick.
2. **Kurse → Kurs**: KI-Regel der LV, Kapitel mit Lektionen (○ ungelesen, ◐ gelesen, ✓ verstanden), **Kapiteltests** (10 Fragen, ab 70 % bestanden), Notenrechner, Termine mit Datum, Zurücksetzen.
3. **Kalender**: Wochenansicht mit Stundenplan, Abgaben und eigenen Terminen. Den Stundenplan holst du über „Stundenplan holen“ als iCal-Link oder .ics-Datei (z. B. aus Studo oder dem FH-System). Ein Link wird einmal am Tag aktualisiert; lässt der Server den Abruf aus dem Browser nicht zu, die .ics-Datei speichern und auswählen.
4. **Prüfung üben**: Prüfungssimulation pro Kurs. **Übungen**: alle interaktiven Aufgaben eines Kurses an einem Ort. **Git-Labor**: simuliertes Terminal + GitLab.
6. **Lerntage in Folge** zählen Tage mit ≥ 5 Minuten Lernzeit, einer Wiederholung oder einer Lektion.

Design: hell (Papier/Petrol); stellt dein Gerät auf Dunkelmodus, wird StudyOS automatisch dunkel.

**Kurse im Semester 3 (WS 2026/27):** EF-DASC, KOMMU, ENG3, GL-BWL-2 sowie neu MAPPDEV (Kotlin/Android), DB-AENT (T-SQL), ITINF-GL (Cloud/Azure), GL-PMGT (inkl. Scrum), GL-UFO und MMPROV (Unity/C#). Bei ITINF-GL ergibt die Beurteilung im Syllabus nur 70 Punkte – bitte in Moodle prüfen.

### Prüfung üben (ab Version 4.1)

Unter **Prüfung üben** gibt es für jedes Fach einen Prüfungsfokus aus den Altprüfungen und Fragensammlungen:
- **So sieht die Prüfung aus** (Format laut Altprüfung) und Tipps für ein Sehr gut.
- **Was drankommt**: Themen nach Häufigkeit (●●● = kommt fast immer), mit Wissen-% und direktem Lesen/Üben.
- **Checkliste** zum Abhaken, **Aufgaben wie in der Prüfung** (Rechen-/Fallaufgaben, erst selbst lösen, dann Lösung aufklappen).
- **Prüfungsfragen üben**: alle Altfragen als eigene Wiederholungs-Sitzung (offene Fragen mit Musterlösung zum Selbstbewerten).
- **Prüfungsreife %** = Wissen in den Prüfungsthemen + Checkliste + gelöste Aufgaben. Auf „Heute“ stehen die nächsten Prüfungen (wenn das Datum im Kalender eingetragen ist).

Quellen: BWL-2-Moodle-Altprüfung, MAPPDEV-Quizfragen, ENG3-Altprüfung, PMGT-Altfragen + Netzplan, UFO-Fragenkatalog, ITINF-Fragenkatalog, DASC-Anki (Granigg True/False), SUNW2-Altprüfung + Katalog. Für KOMMU, DB-AENT und MMPROV gab es keine Altprüfungen – dort ist die Vorbereitung aus der Beurteilung im Syllabus gebaut. **SUNW2 (Sichere Unternehmensnetzwerke 2)** ist als eigener Kurs neu dazugekommen (ohne Syllabus – ECTS, Termin und KI-Regel laut Moodle ergänzen). Wo Antworten in den Unterlagen falsch waren, wurde die richtige Antwort verwendet und erklärt.

### Skript lesen (ab Version 4.2)

**Skript lesen** (im Menü bzw. unten „Skript“) zeigt den kompletten Lernstoff eines Kurses als durchgehendes Dokument: Kapitel für Kapitel, mit Inhaltsverzeichnis, Erklärstufe Einfach/Normal/Fachlich, aufklappbaren Selbsttests und einem Begriffe-Glossar am Ende. Was du beim Lesen durchscrollst, gilt als gelesen und kommt automatisch in die Wiederholung. „Drucken / PDF“ erzeugt eine saubere Druckversion.

Organisatorisches aus den Syllabi (Noten, Punkte, Anwesenheit, Abgaben, KI-Regeln, ECTS) ist kein Lernstoff mehr: Solche Fragen, Karten und Lektionen sind entfernt (Datei `courses/clean-uni.js`). Die Infos stehen nur noch eingeklappt unter „Kursinfo“ auf der Kursseite.

### Vertiefung, Alltagsbeispiele & Tipps (ab Version 4.4)

Jede Lektion aller 11 Fächer hat jetzt zusätzlich eine **Vertiefung** (in allen drei Erklärstufen), **1–2 Beispiele aus dem Alltag** (gelb markiert) und **2–3 aufklappbare Tipps** (💡 anklicken: Eselsbrücken, Prüfungsfallen, Lösungswege). Auch alle bisherigen Tipps sind jetzt zum Aufklappen. Insgesamt rund 167.000 Wörter zusätzlicher Lernstoff – die App ist als vollständiges Lernmaterial gedacht, die Vorlesungs-PDFs braucht man nicht. Die Inhalte stehen in `courses/deep-<fach>.js` und werden von `courses/deep-apply.js` in die Lektionen eingefügt; im Skript erscheinen sie automatisch mit.

### Jedes Fach ist eine eigene App (ab Version 4.7)

Unter **Fächer** liegt der Starter mit einer Kachel pro Fach. Ein Klick öffnet die App des Fachs: Sidebar, Unterseiten (Übersicht, Skript, Üben, Prüfung, Übungen, Material) und Wiederholung zeigen dann **nur noch dieses Fach**. Mit „← Alle Fächer“ geht es zurück. „Heute“, Kalender und Merkliste bleiben fächerübergreifend.

Jede App hat ein eigenes Design (Farben, Schriften, Formen, Hintergrundmuster), hell und dunkel. Die Designs stehen in `dev/app-themes.js`; nach einer Änderung `node dev/app-themes.js` ausführen, das schreibt `css/apps.css` neu (die CSS-Datei nicht von Hand ändern).

### IT-Infrastruktur: Mehrfachauswahl & Quick-Test (ab Version 4.7)

IT-Infrastruktur übt hauptsächlich **Mehrfachauswahl wie im Quick-Test**: eine Frage, fünf Antworten, davon sind eine bis alle fünf richtig. Wertung pro Frage: (richtige Kreuze − falsche Kreuze) ÷ Anzahl richtiger Antworten, mindestens 0. Beispiel: 3 richtig, du kreuzt 2 richtige und 1 falsche an → 0,33 Punkte. Rund 240 solcher Fragen zu V1–V3 stehen in `courses/itinf/mc-v1.js`, `mc-v2.js`, `mc-v3.js` und `mc-mix.js`.

- Die alten Fragen mit genau einer richtigen Antwort sind in IT-Infrastruktur ausgeblendet. Wer sie trotzdem will: in der App **Einstellungen → „Auch Einfachauswahl-Fragen üben“**.
- **Quick-Test** (Sidebar der App): Einheiten wählen, 5/10/20 Fragen, optional 90 Sekunden pro Frage. Ausgewertet wird erst nach der Abgabe, mit Punkten pro Einheit und den Themen, in denen du Punkte verloren hast.
- Neue Mehrfachauswahl-Fragen schreibt man mit der Hilfsfunktion `M(...)` aus `mc-v1.js` (fünf Antworten, je `[Text, richtig?, Erklärung]`). Neue Einheiten kommen in `quicktest.units` im Kurs-Patch von `mc-v1.js` dazu.

### Bilder & Animationen in Lektionen (ab Version 4.8)

Lektionen können Grafiken enthalten: Schritt-für-Schritt-Animationen (◀ / Weiter ▶ / Abspielen) und Grafiken zum Ausprobieren mit Schiebereglern (z. B. SLA-Rechner, p/a-Regel, PUE). Sie erscheinen in der Lektion und im Skript, passen sich dem Design der App an (hell/dunkel) und lassen sich am Handy seitlich wischen. Die Engine steht in `js/figs.js`, die Grafiken für IT-Infrastruktur in `courses/itinf/figs-v1.js` und `figs-v2v3.js`. Eine Grafik wird mit `{ t: "fig", id: "…" }` als Block in eine Lektion eingefügt.

## 7. Neue Kurse / neues Material

Gib Claude einfach die neuen Unterlagen und Moodle-Texte. Es entsteht eine neue Datei `courses/<kurs>.js`. Einbauen:

1. Datei in den Ordner `courses/` legen.
2. In `index.html` vor `js/core.js` eine Zeile `<script src="courses/<kurs>.js"></script>` einfügen.
3. In `sw.js` die Datei zur Liste `SHELL` hinzufügen **und** `VERSION` hochzählen (z. B. `studyos-v2.0.2`).
4. Auf GitHub hochladen (bzw. `git add . && git commit -m "Neuer Kurs" && git push`).

Die installierte App lädt das Update beim nächsten Öffnen und zeigt „Update verfügbar“. Deine Fortschritte bleiben erhalten.

## 7a. Kotlin-Labor und neue MAppDev-Kapitel

**Kotlin-Labor** (Seitenleiste → Werkzeuge): echter Kotlin-Code im Browser. Der Code wird vom offiziellen Compiler von JetBrains (api.kotlinlang.org) übersetzt und ausgeführt, das braucht Internet. Dein Code und deine Fortschritte bleiben auf dem Gerät.

- **Übungsblätter**: Aufgaben mit Tests wie die `test()`-Zellen im Notebook, Tipps Schritt für Schritt, Musterlösung erst nach einem Versuch.
- **Spielwiese**: freies Programmieren mit Vorlagen und gespeicherten Snippets.
- **Fehler-Übersetzer**: häufige Compiler- und Laufzeitfehler auf Deutsch.
- In den Lektionen: „Ausprobieren“-Blöcke, Vorhersagen („Was kommt raus?“) und Mini-Challenges mit Ziel-Ausgabe.

**Neues MAppDev-Kapitel** = eine Datei. Gib Claude die Folien/Übungen, es entsteht `courses/mappdev/kNN-thema.js` (Aufbau: `courses/mappdev/_VORLAGE.js`). Einbauen:

1. In `index.html` bei den anderen Kapiteln (vor `courses/ext-apply.js`) `<script src="courses/mappdev/kNN-thema.js"></script>` einfügen.
2. In `sw.js` die Datei zu `SHELL` hinzufügen und `VERSION` hochzählen.
3. Optional prüfen: `node dev/kt-verify.js` kompiliert alle Beispiele und Musterlösungen mit einem lokalen Kotlin-Compiler (Kopf der Datei erklärt, welche Jars nötig sind).

Ein Kapitel kann eine neue Welt anlegen oder bestehende Lektionen erweitern (neue Blöcke, Lektionen, Fragen, Karteikarten, Übungsblätter). Das macht `courses/ext-apply.js`; andere Kurse können das genauso nutzen (`courses/<kurs>/…`).

**IT-Infrastruktur (ITINF-GL)** nutzt das ebenfalls (seit v4.6): `courses/itinf/v1-cloud-concepts.js` ergänzt die V1-Kapitel um Vorlesungsnotizen und Zusatzfragen und nummeriert die Kapitel um, `v2-azure-architektur.js` und `v3-governance-identitaet.js` sind eigene Kapitel. Weitere Einheiten kommen als `vN-thema.js` dazu (V1-Datei muss zuerst geladen werden).

## 8. Bekannte Grenzen

- **Python-Übungen** laden beim ersten Mal einen Python-Interpreter aus dem Internet (danach offline im Cache). NumPy/pandas werden im Browser nur vereinfacht simuliert – die echten Übungen machst du in VS Code mit `uv`.
- Benachrichtigungen bei komplett geschlossener App hängen von Android/Xiaomi ab → Kalender-Export nutzen.
- Daten liegen pro Browser/Gerät. Ohne Sync oder Backup gehen sie beim Löschen der Browserdaten verloren.

## 9. Mehrere Profile

StudyOS kann mehrere Studierende auf einem Gerät: Jedes Profil hat eigenen Fortschritt und ein eigenes Semester.

- **Gemeinsames Gerät:** Einstellungen → *Profile auf diesem Gerät* → **＋ Neues Profil**. Wechseln über „⇄ Profil wechseln“ unten in der Seitenleiste.
- „Automatisch öffnen“ an = kein Auswahlbildschirm beim Start.

Die früheren Bereiche „Stricken & Häkeln“ und „Sammlung“ (Pokémon-Karten) gibt es seit Version 4.12 nicht mehr.

## 10. Sprache

Einstellungen → **Sprache**: Sprache wählen → „Übersetzen“. Der eingebaute Übersetzer des Browsers (Chrome/Edge am Laptop, aktuelle Version) übersetzt die ganze App direkt auf dem Gerät, beim ersten Mal wird ein Sprachpaket geladen. Code, Maple-Befehle und Formeln bleiben unverändert. Zurück: „Deutsch (Original)“. Hat der Browser keinen eingebauten Übersetzer (z. B. am Handy), übersetzt StudyOS online mit Google Übersetzer; dafür ist Internet nötig.

## 11. Semester und Mathematik 2 mit Maple-Labor

**Semester wählen.** Unter „Fächer“ gibt es oben die Umschalter Semester 1 / 2 / 3. Jedes Studium-Profil merkt sich sein Semester; beim Anlegen eines neuen Profils wählt man es gleich mit. Ein Kurs gehört über `semester: N` in seiner Kursdatei zu einem Semester. Semester ohne Kurse sind ausgegraut. Neue Semester-Bezeichnungen stehen in `js/profiles.js` (`SEMS`).

**Mathematik 2 (Semester 2).** Kursdatei `courses/math2.js`, Kapitel in `courses/math2/k1…k5.js`, interaktive Abbildungen in `courses/math2/figs.js`, Arbeitsblätter fürs Maple-Labor in `courses/math2/sheets.js`, Prüfungsvorbereitung mit allen Altprüfungsaufgaben in `courses/math2/prep.js`.

- **Maple-Labor** (`js/maple.js` + `js/maple-ui.js`): rechnet Maple-Befehle im Browser (diff, int, solve, fsolve, Matrizen/LinearAlgebra, CurveFitting, NonlinearFit, plot, plot3d, implicitplot, polygonplot …). Lektionsblock: `{ t: "maple", title, code: ["…", "…"], note }`.
- **Prüfungssimulation** (`js/mathexam.js`): 5 Aufgaben (3+3+3+3+4 = 16 Punkte) wie in den Altprüfungen, jedes Mal neue Zahlen, Bewertung mit Toleranz, danach Lösungsweg und Maple-Code. Kurse mit `exam: "maple"` bekommen diese Seite.

### Rechner, Plus-Inhalte und Feedback (4.15)
- **Rechner mit Live-Graph** (`js/calc.js`): Lektionsblock `{ t: "calc", id }`, Definition in `window.STUDYOS_CALC[id]` (Eingaben mit Schiebereglern, Ergebnisse, Rechenweg, Graph mit Werten beim Darüberfahren). Funktioniert in Lektion und Skript.
- **Plus-Inhalte pro Fach** liegen in `courses/plus/<fach>.js`: Rechner, Animationen, durchgerechnete Beispiele, zusätzliche Fragen und Karteikarten, eingebunden über `STUDYOS_EXT` (siehe `courses/ext-apply.js`).
- **Feedback**-Seite (Menü → Konto → Feedback): öffnet eine E-Mail an den Entwickler, mit Version und Gerät im Anhang.
- **Profil** (Einstellungen → Profil): Avatar, Farbe der App, Tagesziel in Minuten.

### Gemeinsam: Freunde, Chats und Lerngruppen (4.16)

- **Backend:** Supabase-Projekt `nanknvsfotrcyxjzwsyd` (EU).
  - URL und anon key stehen in `js/social.js`. Der anon key ist öffentlich gedacht.
  - Geschützt werden die Daten über Row Level Security, siehe `supabase-setup.sql`. Der service_role key gehört nie in die App.
- **Einrichtung (einmalig):**
  - Authentication → Sign In / Providers → „Allow anonymous sign-ins“ einschalten.
  - Im SQL Editor `supabase-setup.sql` ausführen.
- **Ablauf in der App:**
  - Wer den Online-Modus einschaltet, bekommt ein anonymes Konto pro Gerät und Profil.
  - Sichtbar sind für andere nur Name und Avatar.
- **Einladungen:**
  - Freunde fügen sich gegenseitig über den Freundescode hinzu (`#friend=CODE`), der andere muss bestätigen.
  - Lerngruppen gibt es pro Fach. Beitreten geht per Gruppencode (`#group=CODE`), den nur Mitglieder sehen.
- **Live-Chat pro Fach:** im Fach-Menü unter „Live-Chat & Gruppen“, lesbar für alle angemeldeten Geräte.
- **Laden:** Die Bibliothek `js/vendor/supabase.js` (supabase-js 2.45.4) wird erst geladen, wenn man den Bereich öffnet. Ohne Internet bleibt der Rest der App unverändert.
- **Anhänge und Aufräumen (4.19):**
  - Bilder und Dateien bis 5 MB liegen im privaten Supabase-Speicher `chat`, in einem Ordner pro Konto. Fotos werden in der App vorher verkleinert.
  - Abrufbar sind sie 24 Stunden lang und nur für alle, die auch die Nachricht sehen dürfen.
  - Ein stündlicher pg_cron-Job (`studyos-aufraeumen`) löscht Fach-Live-Chat-Nachrichten, die älter als 24 Stunden sind, und markiert alte Anhänge als abgelaufen. Die Dateien selbst entfernt die App des Absenders beim nächsten Öffnen.
  - Einrichtung: `supabase-update-2.sql` im SQL Editor ausführen.
