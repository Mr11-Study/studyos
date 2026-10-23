/* StudyOS · Versionsverlauf ("Neuigkeiten")
   Neueste Version zuerst. Bei jedem Update oben einen Eintrag ergänzen und sw.js VERSION gleich setzen.
   Muss vor apps.js geladen werden, damit die Seite als Hub-Seite umhüllt wird. */
(function () {
const { esc, PAGES } = App;

const LOG = App.CHANGELOG = [
  { v: "4.38.0", d: "2026-10-23", t: "BWL: die Altprüfung 1:1", items: [
    "Die echte BWL-Altprüfung ist jetzt als eigene Prüfung drin: alle 31 Fragen in der Originalreihenfolge, mit Originaltexten, Bilanz, Anlagenspiegel und allen Antwortmöglichkeiten.",
    "Prüfungsmodus wie am Termin: 90 Minuten, 90 Punkte, wählbare Minuspunkte, Auswertung erst nach der Abgabe und Note nach dem Schlüssel der Vorlesung.",
    "Lernmodus ohne Zeitlimit: jede Frage sofort prüfen, mit Lösungsweg. Die 10 Fragen, die beim echten Termin danebengingen, sind markiert.",
    "Ein angefangener Versuch bleibt gespeichert und lässt sich später fortsetzen. Zu finden unter BWL 2, Prüfung üben und Prüfungstrainer."
  ] },
  { v: "4.37.0", d: "2026-10-23", t: "Großes BWL-Update für die Klausur", items: [
    "Neuer Prüfungstrainer: 18 Rechenarten wie in Moodle mit neuen Zahlen bei jedem Versuch. Die falschen Antworten sind typische Fehler aus der Altprüfung, danach siehst du den ganzen Lösungsweg.",
    "16 neue Animationen und Schieberegler, z. B. Fixkostendegression aus dem VO-Excel, BAB im Stufenleiterverfahren, Deckungsgrade, Debitorenumschlag mit USt-Falle, Buchführungspflicht, Rückstellung und URG-Ampel.",
    "Neue Welt „Prüfungstraining kompakt“: die 10 Fallen aus deiner Altprüfung, Fallstudie 1 und 2 (Pix-Mania, Müller KG, Fine Print) und Übung 3 komplett durchgerechnet, dazu eine Formelsammlung.",
    "25 neue Theoriefragen aus den Vorlesungsfolien und Mitschriften, 10 neue Karteikarten und Beispiele aus der Vorlesung in den bestehenden Lektionen."
  ] },
  { v: "4.36.0", d: "2026-10-23", t: "Schneller und sicherer", items: [
    "Updates laden nur noch die Dateien, die sich geändert haben, statt jedes Mal die ganze App (rund 6 MB).",
    "Beim Start fragt StudyOS nicht mehr jede Datei einzeln beim Server nach. Die App öffnet direkt aus dem Offline-Speicher, das spart Daten und Akku am Handy.",
    "Schriften laden im Hintergrund, die App wartet beim Start nicht mehr auf sie.",
    "Schutzschild gegen fremden Code: Nur Skripte von StudyOS und wenigen geprüften Quellen dürfen laufen. StudyOS lässt sich auch nicht mehr in fremde Seiten einbetten.",
    "Der PIN wird jetzt mit Salz und 150.000 Runden gespeichert. Nach 5 Fehlversuchen kommt eine Wartezeit, die bis 15 Minuten wächst.",
    "Neu unter Einstellungen › Sicherheit: „Schutz & Tempo“ zeigt Startzeit und alle Schutzfunktionen auf einen Blick."
  ] },
  { v: "4.35.1", d: "2026-10-21", t: "Zuverlässigere KI-Antworten", items: [
    "Bricht eine KI-Antwort wegen ihrer Länge ab, schreibt die KI jetzt automatisch an derselben Stelle weiter.",
    "Ist der KI-Server kurz ausgelastet, versucht StudyOS es nach ein paar Sekunden selbst nochmal.",
    "Fotos werden kleiner verschickt und gehen zuerst an KI-Modelle, die Bilder lesen können. Das geht schneller und ist seltener überlastet.",
    "Formeln, die mittendrin enden, werden trotzdem als Formel angezeigt."] },
  { v: "4.35.0", d: "2026-10-21", t: "Fotos an den KI-Assistenten", items: [
    "Im KI-Assistenten kannst du jetzt mit 📷 ein Foto oder Bild einer Aufgabe anhängen. Am Handy geht auch direkt die Kamera, am PC Strg+V oder Hineinziehen.",
    "Die KI liest die Aufgabe aus dem Bild und löst sie Schritt für Schritt mit Lösungsweg, Formeln und Ergebnis, z. B. in Mathematik 2.",
    "Bis zu 3 Bilder pro Frage. Sie werden vor dem Senden verkleinert und nicht gespeichert."] },
  { v: "4.34.1", d: "2026-10-21", t: "Formeln und schnellere KI-Antworten", items: [
    "KI-Antworten erscheinen jetzt Wort für Wort, sobald die KI losschreibt, statt erst nach der ganzen Antwort.",
    "Mathe-Formeln in allen KI-Antworten (z. B. in Mathematik 2) werden jetzt als echte Formeln mit Brüchen und Matrizen angezeigt statt als LaTeX-Code.",
    "Ohne Internet zeigt StudyOS eine vereinfachte, lesbare Schreibweise."] },
  { v: "4.34.0", d: "2026-10-21", t: "Schönerer KI-Assistent", items: [
    "„Frag zur Lektion“ ist größer und übersichtlicher. Antworten zeigen Fettdruck, Aufzählungen und Code sauber formatiert statt Sternchen und Backticks.",
    "Mit ⤢ öffnest du den Assistenten als großes Fenster über der Lektion. Lange Antworten öffnen es am PC automatisch, Esc schließt es.",
    "Vorschläge wie „Gib mir ein Beispiel“ oder „Stell mir eine Übungsfrage“ fragen mit einem Klick, jede Antwort lässt sich kopieren."] },
  { v: "4.33.0", d: "2026-10-21", t: "KI-Hilfe für alle", items: [
    "Der KI-Assistent ist jetzt für alle mit StudyOS-Konto automatisch eingeschaltet, ohne eigenen Schlüssel und ohne Einrichtung.",
    "Die Fragen laufen über den KI-Server von StudyOS (OmniRoute). In den Einstellungen siehst du, ob er gerade online ist. Pro Tag sind 60 Fragen frei.",
    "Wer lieber ein eigenes OmniRoute oder einen Anthropic-Schlüssel nutzt, kann das weiterhin unter Einstellungen → App wählen."] },
  { v: "4.32.0", d: "2026-10-21", t: "Mitteilungen auch bei geschlossener App", items: [
    "Mit „Am Gerät“ kommen neue Nachrichten von Freunden und Gruppen jetzt auch dann als Mitteilung, wenn StudyOS geschlossen ist (Web Push über den Server).",
    "In den Einstellungen siehst du, ob dein Gerät dafür angemeldet ist. Am Xiaomi-Handy braucht Chrome dafür Autostart und Akku „Keine Einschränkungen“.",
    "Der KI-Assistent ist jetzt in allen Fächern verfügbar."] },
  { v: "4.31.0", d: "2026-10-21", t: "KI-Hilfe über OmniRoute", items: [
    "Der KI-Assistent kann jetzt über OmniRoute laufen. OmniRoute verteilt die Fragen auf freie KI-Anbieter, ein eigener Anthropic-Schlüssel ist nicht mehr nötig.",
    "Zwei Adressen: OmniRoute am PC (lokal) und optional eine Online-Adresse, etwa für das Handy. StudyOS fragt zuerst am PC und weicht sonst auf online aus.",
    "In den Einstellungen gibt es dafür „Verbindung testen“. Der Weg mit eigenem Anthropic-Schlüssel bleibt wählbar."] },
  { v: "4.30.0", d: "2026-10-21", t: "Benachrichtigungen für Chats", items: [
    "Schreibt dir ein Freund oder jemand aus deiner Gruppe, gibt StudyOS sofort Bescheid, auch wenn du gerade woanders in der App bist. Antippen öffnet den Chat.",
    "Du wählst unter Einstellungen → Profil & Konto oder mit der Glocke unter Gemeinsam: „Am Gerät“ (Mitteilung von Windows, macOS oder Handy, auch wenn StudyOS im Hintergrund ist), „Nur in der App“ oder „Aus“.",
    "Zähler zeigen, was neu ist: an „Freunde & Gruppen“, bei jedem Freund und jeder Gruppe, im Fenstertitel und am App-Symbol. Neue Freunde und Anfragen werden ebenfalls gemeldet."] },
  { v: "4.29.1", d: "2026-10-21", t: "Gruppe auf jedem Termin", items: [
    "Im Kalender zeigt ein kleines Abzeichen oben rechts, zu welcher Gruppe ein Termin gehört (1, 2, A, B …). So hältst du parallele Gruppen auseinander.",
    "Die Gruppe steht auch in den Details eines Termins. Räume werden ohne die vorangestellten Satzzeichen der FH angezeigt."] },
  { v: "4.29.0", d: "2026-10-21", t: "FH-Gruppen einfach antippen", items: [
    "StudyOS liest die Gruppen jetzt aus dem echten Stundenplan deines Studiengangs aus. Jeder Studiengang bekommt genau die Gruppen, die es dort gibt.",
    "Du tippst nur deine Gruppen an, zum Beispiel 1 und A. Alle anderen werden ausgeblendet, Vorlesungen für alle (Standardgruppe) bleiben immer drin.",
    "Eine Live-Vorschau zeigt mit echten Lehrveranstaltungen, was du sehen wirst und was ausgeblendet wird."] },
  { v: "4.28.2", d: "2026-10-21", t: "Profilbild oben aktualisiert sich", items: [
    "Wer in den Einstellungen einen Avatar wählt oder den Namen ändert, sieht das jetzt sofort auch im großen Profil oben."] },
  { v: "4.28.1", d: "2026-10-21", t: "Profil-Menü", items: [
    "Der Knopf unten im Menü öffnet jetzt ein Profil-Menü, statt die App neu zu laden. Mit nur einem Profil heißt er „Profil hinzufügen“, mit mehreren „Profil wechseln“ und wechselt direkt zum gewählten Profil."] },
  { v: "4.28.0", d: "2026-10-21", t: "Neuer Kalender", items: [
    "Der Kalender ist jetzt ein echtes Stundenplan-Raster: Wochentage nebeneinander, Uhrzeiten links, jede Lehrveranstaltung als Block in der Farbe ihres Fachs mit Zeit und Raum. Überschneidungen stehen nebeneinander, eine rote Linie zeigt die aktuelle Uhrzeit.",
    "Umschalten zwischen Woche und Tag. Am Handy startet die Tagesansicht, die Wahl wird gemerkt.",
    "Neue Stundenplan-Leiste: wann zuletzt aktualisiert wurde, „Aktualisieren“ zum sofortigen Neuladen, „Ändern“ und „Entfernen“, um einen anderen Stundenplan zu holen.",
    "In eine freie Stelle tippen legt dort einen Termin an. Ein Tipp auf eine Vorlesung zeigt Zeit, Raum und Wiederholung und führt zur Fach-App."] },
  { v: "4.27.1", d: "2026-10-21", t: "FH-Stundenplan: 6 Semester", items: [
    "Bei „FH JOANNEUM“ gibt es jetzt nur noch die Semester 1 bis 6, so viele hat das Studium."] },
  { v: "4.27.0", d: "2026-10-21", t: "FH-Stundenplan direkt auswählen", items: [
    "Unter Kalender → Stundenplan holen gibt es jetzt den Bereich „FH JOANNEUM“: Studiengang (z. B. IMA), Fachsemester und auf Wunsch deine Gruppe wählen, dann „Stundenplan abonnieren“. StudyOS baut den Abo-Link der FH-Stundenplan-Suche selbst, du musst nichts mehr kopieren.",
    "Wie in der FH-Suche gehen auch weitere Suchbegriffe wie titel:, referent: oder ein Minus zum Ausschließen. Deine Auswahl bleibt gespeichert und lässt sich jederzeit ändern."] },
  { v: "4.26.1", d: "2026-10-21", t: "Zurücksetzen ohne Sprung", items: [
    "Nach dem Zurücksetzen eines Fachs oder des Git-Labors bleiben die Einstellungen an derselben Stelle, statt nach oben zu springen."] },
  { v: "4.26.0", d: "2026-10-21", t: "Neue Einstellungen, klare Fach-Apps", items: [
    "Die Einstellungen sind neu geordnet: Bereiche mit eigener Navigation, ein Suchfeld (Taste /) und oben dein Profil mit Version, Sync, PIN und Installation auf einen Blick.",
    "Neu unter Darstellung: Farbschema Hell, Dunkel oder wie das System, Schriftgröße, weniger Bewegung und die Farbe der App. Unter Start wählst du, welche Seite beim Öffnen kommt, auch „Wo ich aufgehört habe“.",
    "Neu unter Speicher & Daten: wie viel Platz StudyOS belegt, Daten dauerhaft sichern, nach Updates suchen und die App frisch laden.",
    "Fach-Apps haben oben eine farbige Leiste mit „Alle Fächer“ und einen Farbrand, die Übersicht zeigt die Fächer als neutrale Kacheln. So verwechselt man Übersicht und Fach nicht mehr.",
    "Kein blinkender Schreibcursor mehr, wenn man normalen Text anklickt; Knöpfe und Menüs lassen sich nicht mehr versehentlich markieren."] },
  { v: "4.25.0", d: "2026-10-21", t: "PIN seltener eingeben", items: [
    "Unter Einstellungen → Sperre wählst du, nach welcher Zeit ohne Nutzung StudyOS wieder nach dem PIN fragt: sofort, nach 5 oder 15 Minuten, 1 oder 4 Stunden oder einem Tag.",
    "Das gilt jetzt auch nach einem Neustart der App: Öffnest du sie innerhalb dieser Zeit wieder, bleibt sie entsperrt. „Jetzt sperren“ sperrt sofort, egal was eingestellt ist."] },
  { v: "4.24.0", d: "2026-10-21", t: "Stundenplan-Link der FH direkt laden", items: [
    "Erlaubt ein Kalender-Server keinen Abruf aus dem Browser (wie der FH-Stundenplan), lädt StudyOS den Link jetzt über den eigenen Kalender-Dienst. Den Abo-Link einfach einfügen, ohne Datei herunterzuladen.",
    "Die Anleitung erklärt Schritt für Schritt, wo du den Abo-Link in der Stundenplan-Suche der FH JOANNEUM findest."] },
  { v: "4.23.2", d: "2026-10-21", t: "Stundenplan alle 30 Minuten aktuell", items: [
    "Ein abonnierter Kalender-Link wird jetzt alle 30 Minuten neu geladen statt einmal am Tag, auch wenn die App länger offen bleibt. Änderungen erscheinen direkt im Kalender und auf der Startseite."] },
  { v: "4.23.1", d: "2026-10-21", t: "Klarere Anleitung zum Stundenplan", items: [
    "„Stundenplan holen“ erklärt jetzt, was eine .ics-Datei ist und wo du sie bekommst: im Stundenplan-System der FH, nicht in Studo, da Studo Kalender nur importieren kann."] },
  { v: "4.23.0", d: "2026-10-21", t: "Schönere Fächer-Kacheln", items: [
    "„Deine Fächer“ auf der Startseite zeigt jedes Fach als eigene Kachel in seiner Farbe, mit Symbol, Fachkürzel und Fortschrittsring.",
    "Jede Kachel nennt die nächste Lektion und zeigt deinen Wissensstand als Balken."] },
  { v: "4.22.0", d: "2026-10-20", t: "Gemeinsam nur mit Konto, Freunde sofort", items: [
    "Für Freunde, Chats und Gruppen erstellst du jetzt ein Konto mit E-Mail und Passwort oder meldest dich an. So bist du in der App, im Browser und auf jedem Gerät dieselbe Person.",
    "Bisherige Gastkonten werden einmal mit E-Mail und Passwort gesichert, Freunde und Gruppen bleiben dabei erhalten.",
    "Wer deinen Freundescode benutzt, ist sofort mit dir befreundet und erscheint direkt in der Freundesliste.",
    "Die Freundesliste aktualisiert sich live und zeigt offene Anfragen deutlich an."] },
  { v: "4.21.0", d: "2026-10-20", t: "Offene und private Gruppen mit Tags", items: [
    "Gruppen gibt es jetzt für alles: fürs Lernen in einem Fach, mit Freunden oder für ein Projekt. Ein Fach ist optional.",
    "Beim Gründen wählst du, ob die Gruppe privat ist (nur mit Einladung) oder offen (alle können sie finden und beitreten), und vergibst Tags wie #Prüfung, #Freunde oder eigene.",
    "Neu unter Gemeinsam: „Gruppen entdecken“ mit Suche, Fach-Filter und Tags. Offenen Gruppen trittst du mit einem Tipp bei.",
    "Wer eine Gruppe gegründet hat, kann Name, Sichtbarkeit, Tags und Beschreibung später ändern."] },
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
