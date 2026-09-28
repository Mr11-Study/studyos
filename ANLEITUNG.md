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
| **Kalender-Export (.ics)** | Kalender → „Export (.ics)“ → im Handy-/Google-Kalender importieren | **sehr zuverlässig** (7, 3, 1, 0 Tage vorher) |

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
  3. In StudyOS: **Einstellungen → Sync zwischen Handy und Laptop** → Token einfügen, Gist-ID leer lassen → „Verbinden“. Die App legt ein privates Gist an und zeigt dessen ID.
  4. Auf dem zweiten Gerät denselben Token **und** diese Gist-ID eintragen → „Verbinden“.
  5. Ab dann synchronisiert StudyOS automatisch beim Öffnen und wenn das Gerät wieder online ist; manuell über „Jetzt synchronisieren“. Bei Konflikten fragt StudyOS, welche Version gelten soll.
  - Der Token wird nur lokal gespeichert und nie mitsynchronisiert.
- **Backup ohne Konto:** Einstellungen → Backup-Datei → „Exportieren“ (.json) → per Mail/Drive aufs andere Gerät → dort „Importieren“.

## 5. KI (optional, standardmäßig AUS)

Die App funktioniert vollständig ohne KI. Wenn du willst, kannst du unter **Einstellungen → KI-Assistent (optional)** einen eigenen Anthropic-API-Key eintragen (bezahlt pro Nutzung über console.anthropic.com – das sind *nicht* deine Claude-App-Tokens). Vor jeder Anfrage fragt die App nach.

Kursregeln sind eingebaut:
- **Kommunikationstraining:** KI komplett gesperrt (Portfolio & Deep Talk laut LV ohne KI).
- **ENG3:** nur Erklären/Korrigieren/Recherche, Nutzung angeben; Trend-Beschreibungen selbst schreiben.
- StudyOS schreibt **keine** bewerteten Abgaben für dich – es plant, erklärt und lässt dich üben.

## 6. Tagesablauf mit StudyOS

1. **Heute**: zeigt Lernblöcke, Abgaben, Anmeldungen und was als Nächstes dran ist.
2. **Kalender**: fehlende Termine (gelber Kasten) eintragen, sobald du sie kennst – vor allem **Prüfungsanmeldungen**. Eigene Termine über „+ Termin“ (auch wöchentlich wiederholend für LVs).
3. **Aufgaben & Lernplan**: Moodle-Aufgaben abhaken · „Lernplan erstellen“ für jede Prüfung (verteilt die Themen nach deiner Mastery auf Lernblöcke) · „Arbeitsplan“ für jede Abgabe.
4. **Lernen / Quiz / Karteikarten / Prüfungstrainer** für die Inhalte.
5. **Git-Labor**: simuliertes Terminal + GitHub/GitLab-Weboberfläche mit 6 Missionen (config, SSH, clone/push, Branch + Pull Request, Merge-Konflikt, .gitignore/restore) und freiem Üben. Nichts verlässt dein Gerät.

## 7. Neue Kurse / neues Material

Gib Claude einfach die neuen Unterlagen und Moodle-Texte. Es entsteht eine neue Datei `courses/<kurs>.js`. Einbauen:

1. Datei in den Ordner `courses/` legen.
2. In `index.html` vor `js/core.js` eine Zeile `<script src="courses/<kurs>.js"></script>` einfügen.
3. In `sw.js` die Datei zur Liste `SHELL` hinzufügen **und** `VERSION` hochzählen (z. B. `studyos-v2.0.2`).
4. Auf GitHub hochladen (bzw. `git add . && git commit -m "Neuer Kurs" && git push`).

Die installierte App lädt das Update beim nächsten Öffnen und zeigt „Update verfügbar“. Deine Fortschritte bleiben erhalten.

## 8. Bekannte Grenzen

- **Python-Übungen** laden beim ersten Mal einen Python-Interpreter aus dem Internet (danach offline im Cache). NumPy/pandas werden im Browser nur vereinfacht simuliert – die echten Übungen machst du in VS Code mit `uv`.
- Benachrichtigungen bei komplett geschlossener App hängen von Android/Xiaomi ab → Kalender-Export nutzen.
- Daten liegen pro Browser/Gerät. Ohne Sync oder Backup gehen sie beim Löschen der Browserdaten verloren.

## 9. Mehrere Profile (z. B. Kevin & Angi)

StudyOS kann mehrere Personen auf einem Gerät: Jedes Profil hat eigene Kurse, eigenen Fortschritt und eigenes Design.

- **Eigenes Handy (z. B. Angi):** Link öffnen → „Wer lernt heute?“ → Name eingeben → **Stricken & Häkeln** wählen → Profil erstellen. Danach wie gewohnt über Chrome „App installieren“.
- **Gemeinsames Gerät:** Einstellungen → *Profile auf diesem Gerät* → **＋ Neues Profil**. Wechseln über „⇄ Profil wechseln“ unten in der Seitenleiste.
- „Automatisch öffnen“ an = kein Auswahlbildschirm beim Start.

Das Stricken-&-Häkeln-Profil enthält: Kurse Stricken und Häkeln, 3D-Studio (Maschen drehen & zoomen, Reihe für Reihe aufbauen), animierte Techniken, Musterdesigner mit Anleitungsgenerator, Maschenlexikon, Reihenzähler (Bildschirm bleibt an), Werkzeuge (Maschenprobe, Verteilen, Nadeln, US/UK) und Projekte mit Foto.
Seit Version 3.2 ist das Stricken-&-Häkeln-Profil **keine Lern-App mehr, sondern ein Nachschlagewerk**: keine XP, Level, Lektionen, Checks, Quiz oder Karteikarten. Unter **Wissen** stehen alle Inhalte als Artikel mit Suche (auch Techniken und Maschenlexikon werden gefunden). Die Startseite hat ein Suchfeld, Themen-Kacheln und „Wo finde ich was?“, und mehrere Lektionen haben neue Schaubilder (Garnstärken, Nadeln, Maschenprobe, Häkelmaschen-Höhen, Magic Ring, Granny Square …).

## 10. Profil „Sammlung“ (Pokémon-Karten)

Für Karten, Displays, ETBs, Booster, Tins usw. mit Cardmarket-Preisen.

- **Anlegen:** Link öffnen → Name → **Sammlung** wählen → Profil erstellen (auf einem gemeinsamen Gerät: Einstellungen → Profile → ＋ Neues Profil).
- **Filter:** Überall gibt es Suche, Sortierung und einen **Filter**-Knopf (Serie, Set, Seltenheit, Kategorie, Typ, Sprache, Preis von/bis, Illustrator, KP, Variante, eigene/fehlende Karten …). Aktive Filter stehen als Chips darunter und lassen sich einzeln entfernen.
- **Karten erfassen:** *Sets* oder *Karten suchen* – Name auf Deutsch/Englisch, auch mit Kürzel und Nummer („Glurak MEW 199“) → Karte antippen → Bild in 6 Sprachen, Preistabelle → **Deine Karte**: Variante, Sprache, Zustand wählen → Wert dafür + Knopf **„Angebote auf Cardmarket“** (öffnet genau diese Karte über die Cardmarket-Produktnummer, gefiltert auf Sprache und Mindestzustand) → optional **eigener Preis** → Zur Sammlung.
- **Preise nach Sprache/Zustand:** Einstellungen → *Preise anpassen*: Prozent je Sprache und Zustand (Standard 100 %). Ein eigener Preis pro Eintrag hat immer Vorrang; in der Sammlung steht bei jedem Eintrag die Preisbasis.
- **Sealed:** *Produkte* → Kategorie (Display, Elite Trainer Boxes, Booster, Tins, Blister …), Set-Filter, Preis-Sortierung.
- **Sammlung:** Gesamtwert, Einkauf, Gewinn/Verlust, Filter (Typ, Set, Sprache, Zustand), Sortierung, Gruppierung nach Set, CSV-Export (Excel).
- **Beobachtet:** Karten/Produkte mit Preisalarm (über/unter Zielpreis).
- **Sammler-Wissen:** Nachschlagewerk (Zustände, Seltenheiten, Sealed, Preise, Sprache & Preis, Grading, Set-Symbole, Cardmarket-Tipps, Fälschungen, Aufbewahrung).

**Woher kommen die Preise?** Aus dem offiziellen Cardmarket-Preisführer (Trendpreis, Ø 1/7/30 Tage, „ab“-Preis). Cardmarket veröffentlicht ihn einmal täglich; eine GitHub-Action (`.github/workflows/tcg-prices.yml`) holt ihn zweimal am Tag automatisch und legt kompakte Daten in den Branch `data`. Die App prüft beim Öffnen und alle 30 Minuten selbst, ob es neue Preise gibt – man muss nie manuell aktualisieren. Echte Sekunden-Livepreise gibt es nur über die Cardmarket-API, die eine eigene Freischaltung braucht.
Hinweis: Der Preisführer fasst alle Sprachen zusammen und bezieht sich meist auf Near Mint. Für den Preis einer bestimmten Sprache/eines Zustands führt „Auf Cardmarket ansehen“ direkt zur Suche.

Kartennamen, Bilder und Set-Daten kommen von TCGdex (freies Projekt). Die Sammlung selbst bleibt auf dem Gerät (Backup über Einstellungen).
