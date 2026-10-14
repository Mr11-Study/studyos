/* ITINF-GL · Quick-Test-Fragen V3 (Governance & Identität) – Mehrfachauswahl, 5 Antworten, 1 bis 5 richtig.
   Helfer M kommt aus mc-v1.js (window.ITINF_M). */
(function () {
const M = window.ITINF_M, X = window.STUDYOS_EXT = window.STUDYOS_EXT || {}; if (!M) return;
const questions = [
/* ---------- Subscriptions & Management Groups ---------- */
M("itm3-1", "itv-mgmt", "Welche Aussagen zur Azure Subscription sind richtig?", [
  ["Sie ist eine Einheit für Verwaltung, Abrechnung und Skalierung.", true],
  ["Sie ist eine Billing boundary (getrennte Rechnungen pro Subscription).", true],
  ["Sie ist eine Access control boundary.", true],
  ["Eine Subscription ist dasselbe wie ein Entra-Tenant.", false, "Tenant = wer gehört dazu, Subscription = wer zahlt."],
  ["Sie vertraut genau einem Entra-Tenant.", true]
], "Subscriptions ordnen die Resource Groups und erleichtern die Abrechnung."),
M("itm3-2", "itv-mgmt", "Aus welchen Gründen legt man laut Folie zusätzliche Subscriptions an?", [
  ["Umgebungen trennen, z. B. Entwicklung und Test, oder Daten aus Compliance-Gründen isolieren", true],
  ["Organisationsstruktur: ein Team auf günstigere Ressourcen beschränken", true],
  ["Abrechnung: Kosten werden zuerst pro Management Group aggregiert", false, "Zuerst pro Subscription."],
  ["Weil eine Subscription nur eine Resource Group enthalten darf", false],
  ["Weil Ressourcen einer Subscription alle in derselben Region liegen müssen", false]
], "Merkhilfe U-O-A: Umgebungen, Organisation, Abrechnung."),
M("itm3-3", "itv-mgmt", "Welche Aussagen zu Management Groups sind richtig?", [
  ["Sie können mehrere Subscriptions enthalten.", true],
  ["Sie bieten einen Scope oberhalb der Subscriptions.", true],
  ["Subscriptions erben Policies und Zugriffsrechte der Management Group.", true],
  ["Pro Verzeichnis wird nur eine einzige Management Group unterstützt.", false, "10.000."],
  ["Der Baum unterstützt beliebig viele Ebenen.", false, "Bis zu sechs Ebenen (ohne Root und Subscription-Ebene)."]
], "„Zehntausend Ordner, sechs Stockwerke“."),
M("itm3-4", "itv-mgmt", "Eine Policy „VMs nur in US West“ wird auf die Management Group „Production“ gesetzt. Was gilt?", [
  ["Sie wird an alle untergeordneten Subscriptions vererbt.", true],
  ["Sie gilt für alle VMs in diesen Subscriptions.", true],
  ["Der Owner einer darunterliegenden Subscription kann sie nicht ändern.", true],
  ["Ein Resource Owner darf sie für seine Ressource deaktivieren.", false, "Kann nicht geändert werden."],
  ["Sie gilt nur für neu angelegte Subscriptions, nicht für bestehende.", false]
], "Beispiel 1 der Folie: Policy-Hierarchie."),
M("itm3-5", "itv-mgmt", "Mehrere Subscriptions liegen unter einer Management Group. Wie vergibt man einem Team Zugriff auf alle?", [
  ["Mit einer einzigen Azure-RBAC-Zuweisung auf der Management Group", true],
  ["Alle Subscriptions, Resource Groups und Ressourcen darunter erben die Rechte.", true],
  ["Es ist zwingend nötig, die Rechte per Skript in jeder Subscription einzeln zu setzen.", false],
  ["Rechte auf einer Resource Group gelten auch für die Subscription darüber.", false, "Vererbung läuft nur von oben nach unten."],
  ["Rechte einmal oben setzen statt hundertmal unten", true]
], "Beispiel 2 der Folie: Zugriff auf mehrere Subscriptions."),
M("itm3-6", "itv-mgmt", "Welche Zuordnungen von Ebene und Merksatz sind richtig?", [
  ["Management Group: „Welche Regeln gelten für alle?“", true],
  ["Resource Group: „Wer zahlt?“", false, "„Wer zahlt?“ = Subscription."],
  ["Resource Group: „Was wird gemeinsam gelöscht?“", true],
  ["Management Group: „Wer zahlt?“", false, "„Wer zahlt?“ = Subscription."],
  ["Subscription: „Was wird gemeinsam gelöscht?“", false]
], "MG → Subscription → RG → Ressource."),
M("itm3-7", "itv-mgmt", "Welche Aussagen zur Root Management Group sind richtig?", [
  ["Jeder Tenant hat eine Root Management Group.", true],
  ["Die Root Management Group muss man selbst anlegen.", false, "Sie ist automatisch vorhanden."],
  ["Regeln, die für alle gelten sollen (z. B. „Daten nur in der EU“), setzt man möglichst hoch.", true],
  ["Eine Subscription kann mehrere übergeordnete Management Groups haben.", false, "Genau eine übergeordnete MG."],
  ["Policies weiter oben können unten nicht aufgeweicht werden.", true]
], "Abteilungsspezifisches setzt man tiefer in der Hierarchie."),

/* ---------- Azure Policy ---------- */
M("itm3-10", "itv-policy", "Welche Vorteile von Azure Policy nennt die Folie?", [
  ["Durchsetzung und Compliance (Enforcement and compliance)", true],
  ["Policies im großen Maßstab anwenden (at scale)", true],
  ["Remediation nicht konformer Ressourcen", true],
  ["Benutzer authentifizieren und Passwörter zurücksetzen", false, "Das macht Entra ID."],
  ["Festlegen, wer eine Ressource bearbeiten darf", false, "Das ist RBAC."]
], "RBAC regelt, wer etwas tun darf. Policy regelt, wie das Ergebnis aussehen muss."),
M("itm3-11", "itv-policy", "Wofür nutzt man Azure Policy laut Folie?", [
  ["Regulatorische Compliance", true], ["Kostenkontrolle", true], ["Sicherheit", true], ["Design-Konsistenz", true],
  ["Rechnungen an Kunden schicken", false]
], "Wichtig bei mehreren Engineering-Teams und mehreren Subscriptions."),
M("itm3-12", "itv-policy", "In welcher Reihenfolge erstellt man Azure Policies laut Folie?", [
  ["Policy Definitions → Initiative Definitions → Scope zuweisen → Compliance ermitteln", true],
  ["Scope zuweisen → Policy Definitions → Compliance ermitteln → Initiative Definitions", false],
  ["Initiative Definitions → Policy Definitions → Compliance ermitteln → Scope zuweisen", false],
  ["Compliance ermitteln → Scope zuweisen → Initiative Definitions → Policy Definitions", false],
  ["Policy Definitions → Scope zuweisen → Initiative Definitions → Remediation löschen", false]
], "Definition → Initiative → Scope → Compliance (wie eine Disc: brennen, zusammenstellen, einlegen, abspielen)."),
M("itm3-13", "itv-policy", "Welche Aussagen zu Policy Definitions und Initiativen sind richtig?", [
  ["Viele Policy Definitions sind schon vorhanden.", true],
  ["Policy Definitions haben ein bestimmtes JSON-Format.", true],
  ["Policy Definitions werden in YAML geschrieben.", false, "JSON-Format."],
  ["Eine Initiative gruppiert eine oder mehrere Policy Definitions.", true],
  ["Man kann eigene (custom) Policy Definitions erstellen.", true]
], "Eine Policy-Definition besteht aus Bedingung (if) und Effekt (then)."),
M("itm3-14", "itv-policy", "Welche Aussagen zur Compliance-Auswertung sind richtig?", [
  ["Neu ausgewertet wird alle 24 Stunden.", true],
  ["Neue Zuweisungen werden nach ca. 5 Minuten ausgewertet.", true],
  ["Eine Auswertung kann man nie manuell anstoßen.", false, "On demand geht."],
  ["Neue Zuweisungen werden erst nach 24 Stunden das erste Mal ausgewertet.", false, "Nach ca. 5 Minuten."],
  ["Ausgewertet wird nur einmal pro Monat.", false]
], "24 h Standard · ≈ 5 min nach neuer Zuweisung · on demand."),
M("itm3-15", "itv-policy", "Was passiert, wenn eine neue Policy zugewiesen wird und bereits Ressourcen existieren, die sie verletzen?", [
  ["Die bestehenden Ressourcen werden als nicht konform markiert.", true],
  ["Geändert werden sie erst über einen Remediation Task.", true],
  ["Neue Ressourcen, die eine Deny-Policy verletzen, werden gar nicht erst erstellt.", true],
  ["Die bestehenden Ressourcen werden sofort automatisch gelöscht.", false],
  ["Die Policy kann nicht zugewiesen werden, solange es Verstöße gibt.", false]
], "Wie der Hausmeister im Studentenheim: kontrollieren, Liste schreiben, dann entfernen."),
M("itm3-16", "itv-policy", "Welche Beispiele passen zu Azure Policy (nicht zu RBAC)?", [
  ["„Ressourcen nur in EU-Regionen“", true],
  ["„Nur kleine VM-Größen in der Dev-Subscription“", true],
  ["„Jede Ressource braucht das Tag CostCenter“", true],
  ["„Anna darf in rg-shop VMs erstellen“", false, "Wer darf was = RBAC."],
  ["„Storage Accounts nur mit HTTPS“", true]
], "Auch wer die nötigen Rechte hat, muss die Regeln der Policy einhalten."),
M("itm3-17", "itv-policy", "Auf welche Scopes kann man eine Initiative laut Folie zuweisen?", [
  ["Subscription", true], ["Resource Group (optional unterhalb der Subscription)", true], ["Management Group", true],
  ["Einzelner Benutzer", false], ["Microsoft-365-Gruppe", false]
], "Der Scope erzwingt die Policy."),

/* ---------- IAM, AuthN/AuthZ, Claims, Federation ---------- */
M("itm3-20", "itv-iam", "Welche Elemente enthält die IAM-Definition (IBM) der Folie?", [
  ["Die richtigen Entitäten (Personen oder Dinge)", true],
  ["nutzen die richtigen Ressourcen (Anwendungen oder Daten),", true],
  ["wenn sie sie brauchen,", true],
  ["ohne Störungen,", true],
  ["mit den Geräten, die sie verwenden wollen.", true]
], "IAM ist eine Sicherheitsdisziplin; Entitäten sind auch Maschinen."),
M("itm3-21", "itv-iam", "Welche Aussagen zu Authentifizierung und Autorisierung sind richtig?", [
  ["Authentifizierung beantwortet „Wer bist du?“.", true],
  ["Autorisierung gewährt Zugriff, z. B. Owner, Contributor, Reader.", true],
  ["Ein Zertifikat ist „etwas, das du bist“.", false, "Besitz."],
  ["Ein Passwort ist „etwas, das du hast“.", false, "Passwort = etwas, das du weißt."],
  ["Autorisierung kommt vor der Authentifizierung.", false, "Erst Name, dann Zutritt."]
], "AuthN = Feststellen, wer du bist. AuthZ = Schlüssel bekommen."),
M("itm3-22", "itv-iam", "Welche Kombinationen sind echte Multi-Faktor-Authentifizierung?", [
  ["Passwort + Code aus der Authenticator-App", true, "Wissen + Besitz"],
  ["Smartcard + PIN", true, "Besitz + Wissen"],
  ["Passwort + Sicherheitsfrage", false, "Zweimal Wissen."],
  ["Passwort + PIN", false, "Zweimal Wissen."],
  ["FIDO2-Sicherheitsschlüssel + Fingerabdruck", true, "Besitz + Sein"]
], "Faktoren müssen aus verschiedenen Kategorien stammen: Wissen, Besitz, Sein."),
M("itm3-23", "itv-iam", "Welche Pain Points entstehen, wenn jede App eine eigene Benutzerdatenbank hat?", [
  ["Endbenutzer müssen sich viele Passwörter merken (schwache oder gleiche Passwörter).", true],
  ["Es gibt kein Single Sign-On.", true],
  ["Entwickler müssen Passwörter sicher in der Datenbank speichern.", true],
  ["Administratoren verwalten alle Benutzer zentral an einer Stelle.", false, "Ohne IdP gerade nicht."],
  ["Die Anwendungen können keine Daten mehr speichern.", false]
], "Die Lösung: Authentifizierung an einen Identity Provider auslagern."),
M("itm3-24", "itv-iam", "Welche Aussagen zu claim-based access sind richtig?", [
  ["Der Benutzer meldet sich mit Passwort direkt bei der Anwendung an, die es selbst prüft.", false, "Gerade nicht: Die Anmeldung läuft beim IdP."],
  ["Der IdP stellt einen Claim bzw. ein Access Token aus.", true],
  ["Die Anwendung vertraut dem IdP und akzeptiert das Token.", true],
  ["Jede Anwendung braucht einen eigenen Identity Provider.", false, "Viele Apps können demselben IdP vertrauen."],
  ["Die Anwendung bekommt das Passwort des Benutzers vom IdP weitergeleitet.", false, "Die App sieht das Passwort nie."]
], "Beispiel: „Mit Google anmelden“ – die App bekommt nur ein signiertes Token."),
M("itm3-25", "itv-iam", "Was bringt ein Identity Provider laut Folie?", [
  ["Endbenutzer: dank Single Sign-On nur ein Passwort", true],
  ["Entwickler: keine sichere Passwortspeicherung und keine eigene Authentifizierungsmethode mehr", true],
  ["Administrator: verwaltet Benutzer nur noch im Identity Provider", true],
  ["Entwickler: muss sich nie mehr um Berechtigungen in der App kümmern", false, "Die Autorisierung pro Person in der App bleibt evtl. seine Aufgabe."],
  ["Verlässt jemand das Unternehmen, reicht es, das Konto im IdP zu deaktivieren.", true]
], "Die Autorisierung bleibt in der Anwendung (bzw. nutzt Rollen aus dem Token)."),
M("itm3-26", "itv-iam", "Was enthält ein Claim laut Folie?", [
  ["Eine eindeutige Benutzerkennung", true],
  ["Eine Signatur des Identity Providers", true],
  ["Ob die Authentifizierung erfolgreich war", true],
  ["Die Methode der Authentifizierung (Level of Assurance)", true],
  ["Benutzerattribute wie E-Mail, Name, Gruppen, Rollen", true]
], "Merkhilfe ESEMA: Eindeutige ID, Signiert, Erfolg, Methode, Attribute."),
M("itm3-27", "itv-iam", "Wie wird Vertrauen (Trust) zwischen Anwendung und Identity Provider hergestellt?", [
  ["Abhängig vom Standard, z. B. Kerberos, SAML oder OAuth", true],
  ["Durch Austausch von Zertifikaten", true],
  ["Über Login- und Logout-URLs", true],
  ["Mit Client ID und Secret statt eines Zertifikats", true],
  ["Durch Kopieren der Benutzerdatenbank des IdP in die App", false]
], "Creating Trust laut Folie."),
M("itm3-28", "itv-iam", "Welche Aussagen zu Federation und Realm Discovery sind richtig?", [
  ["Federation ist Vertrauen zwischen Sicherheitsdomänen (Realms).", true],
  ["Die Identity Provider zweier Realms vertrauen einander.", true],
  ["Benutzer aus Realm A können dadurch Anwendungen in Realm B nutzen.", true],
  ["Realm Discovery wählt den Tenant zufällig aus.", false, "Anhand der Domain im Benutzernamen."],
  ["Jeder Realm hat einen eigenen Identity Provider und einen eigenen Circle of Trust.", true]
], "Wie Reisepässe: Ein österreichischer Pass wird auch in Spanien akzeptiert."),
M("itm3-29", "itv-iam", "Flughafen-Beispiel (Review-Frage 3): Welche Zuordnungen sind richtig?", [
  ["Identity Provider = der Staat, der den Reisepass ausstellt", true],
  ["Claim/Token = der Reisepass", true],
  ["Authentifizierung = die Passkontrolle vergleicht dich mit dem Pass", true],
  ["Autorisierung = der Staat prüft einmalig deine Identität", false, "Das ist Identity Proofing beim IdP."],
  ["Federation = der Flughafen führt eine eigene Datenbank aller Bürger", false, "Gerade nicht: Er vertraut den Pässen anderer Staaten."]
], "Trust: Der Flughafen vertraut Pässen dieses Staates."),

/* ---------- IAL, AAL, FAL ---------- */
M("itm3-30", "itv-loa", "Welche Zuordnungen der Assurance Levels nach NIST SP 800-63-4 sind richtig?", [
  ["IAL bezieht sich auf das Identity Proofing.", true],
  ["AAL bezieht sich auf die Anzahl der Administratoren.", false, "Authenticator Assurance Level."],
  ["FAL bezieht sich auf den Schutz einer Assertion in der Föderation.", true],
  ["IAL bezieht sich auf die Stärke des Passworts.", false],
  ["FAL bezieht sich auf die Verschlüsselung der Festplatte.", false]
], "IAL = Identität geprüft? · AAL = Anmeldung stark genug? · FAL = Föderations-Token gut geschützt?"),
M("itm3-31", "itv-loa", "Welche Aussagen zu IAL sind richtig?", [
  ["IAL1 verlangt validierte Kernattribute gegen autoritative oder glaubwürdige Quellen.", true],
  ["IAL2 bestätigt zusätzlich, dass der Antragsteller der rechtmäßige Inhaber der Nachweise ist.", true],
  ["IAL3 verlangt eine betreute Sitzung vor Ort mit geschultem Prüfer und ein biometrisches Merkmal.", true],
  ["Rein selbst angegebene Attribute (self-asserted) gelten in 800-63-4 als IAL1.", false, "Sie liegen außerhalb von IAL1–3 (in 800-63-3 hieß das noch IAL1)."],
  ["IAL1 und IAL2 sind remote oder vor Ort möglich.", true]
], "CSP = Credential Service Provider."),
M("itm3-32", "itv-loa", "Welche Aussagen zu AAL sind richtig?", [
  ["AAL1: Ein Faktor reicht.", true],
  ["AAL2: Besitz und Kontrolle zweier unterschiedlicher Faktoren", true],
  ["AAL1 verlangt zwingend zwei Faktoren.", false, "AAL1: ein Faktor reicht."],
  ["AAL3: phishing-resistenter Public-Key-Authenticator mit nicht exportierbarem privatem Schlüssel", true],
  ["AAL3 erreicht man mit Passwort + SMS-Code.", false, "Ein SMS-Code ist nie AAL3."]
], "Beispiele für AAL3: FIDO2-Sicherheitsschlüssel, Smartcard."),
M("itm3-33", "itv-loa", "Welche Aussagen zu FAL sind richtig?", [
  ["FAL1: Die Assertion wird vom IdP signiert und von der Relying Party validiert.", true],
  ["FAL1: Die Assertion muss nicht signiert sein.", false, "Auch bei FAL1 signiert der IdP."],
  ["FAL2: Die Assertion darf für beliebig viele Relying Parties gelten.", false, "FAL2 ist audience-restricted auf eine RP."],
  ["FAL3: Die RP prüft zusätzlich, dass der Benutzer einen Authenticator kontrolliert (Holder-of-Key).", true],
  ["FAL2 bedeutet in 800-63-4 zwingend eine verschlüsselte Assertion.", false, "Verschlüsselung ist in 800-63-4 unabhängig vom FAL."]
], "Bearer = wie ein Konzertticket ohne Namen; Holder-of-Key = personalisiertes Ticket mit Ausweiskontrolle."),
M("itm3-34", "itv-loa", "Was hat sich mit NIST SP 800-63-4 gegenüber 800-63-3 geändert?", [
  ["Statt Entscheidungsbäumen gibt es den DIRM-Prozess (Digital Identity Risk Management).", true],
  ["Einfache Zuordnung: Low → 1, Moderate → 2, High → 3 (bei FAL High → 2 oder 3)", true],
  ["IAL1 verlangt jetzt immer validierte Kernattribute.", true],
  ["AAL2 muss eine phishing-resistente Option anbieten.", true],
  ["Verschlüsselung ist unabhängig vom FAL.", true]
], "Ein Level erhöht man durch dokumentiertes Tailoring."),
M("itm3-35", "itv-loa", "Handyvertrag: Ausweis im Shop, später Login nur mit Passwort, Bankverbindung ändern mit zusätzlichem App-Code. Was gilt?", [
  ["Ausweisprüfung im Shop betrifft das Identity Proofing (IAL).", true],
  ["Login nur mit Passwort entspricht AAL1.", true],
  ["Passwort + App-Code entspricht AAL2.", true],
  ["Passwort + App-Code entspricht AAL3.", false, "AAL3 braucht einen phishing-resistenten Public-Key-Authenticator."],
  ["Wer IAL1 hat, kann höchstens AAL1 erreichen.", false, "Die Skalen sind unabhängig."]
], "Ein Konto kann z. B. IAL1 und trotzdem AAL3 haben."),
M("itm3-36", "itv-loa", "Ohne jedes Identity Proofing gibt ein Benutzer nur selbst Name und E-Mail an. Wie ist das nach NIST SP 800-63-4 einzustufen?", [
  ["Self-asserted, außerhalb von IAL1 bis IAL3", true],
  ["IAL1", false, "So hieß es noch in 800-63-3."],
  ["IAL2", false],
  ["IAL3", false],
  ["AAL1", false, "AAL betrifft die Anmeldung, nicht das Proofing."]
], "IAL1 verlangt in 800-63-4 validierte Kernattribute."),

/* ---------- Entra ID ---------- */
M("itm3-40", "itv-entra", "Welche Aussagen zu Microsoft Entra ID sind richtig?", [
  ["Entra ID hieß früher Azure Active Directory.", true],
  ["Es ist ein On-Premises-Verzeichnisdienst mit LDAP und GPOs.", false, "Das ist AD DS."],
  ["Es gibt Zugriff auf Microsoft 365, das Azure Portal und tausende SaaS-Anwendungen.", true],
  ["Es kann ein On-Premises AD DS in die Cloud erweitern (Entra Connect Sync / Cloud Sync).", true],
  ["Es funktioniert nur mit Windows-Geräten.", false, "iOS, macOS, Android, Linux und Windows."]
], "Entra ID bietet Anwendungsverwaltung, Authentifizierung, Geräteverwaltung und hybride Identität."),
M("itm3-41", "itv-entra", "Welche Unterschiede zwischen AD DS und Entra ID sind richtig?", [
  ["AD DS: Abfrage über LDAP – Entra ID: REST API (Microsoft Graph) über HTTPS", true],
  ["AD DS: SAML – Entra ID: Kerberos", false, "Umgekehrt."],
  ["AD DS: hierarchisch mit OUs und GPOs – Entra ID: flach, keine OUs, keine GPOs", true],
  ["Entra ID nutzt zur Verzeichnisabfrage LDAP.", false, "Microsoft Graph über HTTPS."],
  ["Entra ID nutzt OUs und GPOs genau wie AD DS.", false]
], "Drei Paare: LDAP → Graph · Kerberos → SAML/WS-Fed/OIDC · OUs/GPOs → flach."),
M("itm3-42", "itv-entra", "Welche Aussagen zur verpflichtenden MFA für Azure sind richtig?", [
  ["Phase 1 (seit Oktober 2024) betrifft Azure Portal, Entra Admin Center und Intune Admin Center.", true],
  ["Phase 2 (seit Oktober 2025) betrifft Azure CLI, Azure PowerShell, Mobile App, IaC-Tools und REST API.", true],
  ["Workload-Identitäten wie Managed Identities und Service Principals sind ausgenommen.", true],
  ["Phase 1 betraf bereits Azure CLI und PowerShell.", false, "Das ist Phase 2."],
  ["Phase 2 betrifft auch Managed Identities.", false]
], "Konsequenz: MFA-Methoden früh registrieren, idealerweise phishing-resistent; Break-Glass-Konten schützen."),
M("itm3-43", "itv-entra", "Welche Aussagen zu Entra-ID-Begriffen sind richtig?", [
  ["Ein Tenant ist eine dedizierte, vertrauenswürdige Instanz von Entra ID.", true],
  ["Den Global Administrator muss man nach dem Anlegen des Tenants manuell beantragen.", false, "Der Ersteller bekommt ihn automatisch."],
  ["Der Global Administrator wird automatisch dem Ersteller des Tenants zugewiesen.", true],
  ["Jedes neue Verzeichnis hat den Anfangsnamen domainname.onmicrosoft.com.", true],
  ["Ein Microsoft account (MSA) ist ein Work or school account.", false, "MSA = persönliches Konto (Outlook, OneDrive, Xbox)."]
], "Kein Account ohne Identity."),
M("itm3-44", "itv-entra", "Welche Aussagen zu Tenants sind richtig?", [
  ["Ein Tenant entsteht automatisch, wenn sich eine Organisation für einen Microsoft-Clouddienst anmeldet.", true],
  ["Jeder Tenant ist isoliert (eigene Policies, Benutzer, Gruppen, Rollen).", true],
  ["Eine eigene Domain kann man ohne Verifizierung sofort nutzen.", false, "Erst nach DNS-Verifizierung."],
  ["Ein Tenant kann eigene Administratorrollen und eine eigene Art der Synchronisation haben.", true],
  ["Ein Tenant kann viele Subscriptions haben.", true]
], "Subscription vertraut genau einem Tenant."),
M("itm3-45", "itv-entra", "Welche Funktionen gehören zu welchem Entra-Plan?", [
  ["Conditional Access und dynamische Gruppen: ab P1", true],
  ["Risikobasiertes Conditional Access: Free", false, "P2."],
  ["Privileged Identity Management (PIM): P2", true],
  ["PIM: schon in P1", false, "PIM braucht P2."],
  ["Dynamische Gruppen: schon in Free", false, "Brauchen P1."]
], "Free = SSO + MFA-Grundlagen. P1 = Conditional Access + dynamische Gruppen. P2 = + Risiko + PIM."),
M("itm3-46", "itv-entra", "Welche Schritte gehören zu Self-Service Password Reset (SSPR)?", [
  ["Festlegen, wer SSPR nutzen darf", true],
  ["Anzahl und Art der Authentifizierungsmethoden wählen", true],
  ["Benutzer registrieren sich über die kombinierte Registrierung für SSPR und MFA", true],
  ["Jeder Reset muss vom Helpdesk telefonisch freigegeben werden.", false],
  ["SSPR senkt Helpdesk-Kosten.", true]
], "Lukas setzt sein FH-Passwort am Sonntagabend selbst zurück."),
M("itm3-47", "itv-entra", "Wer nutzt Entra ID laut Folie?", [
  ["IT-Admins, z. B. um MFA für wichtige Ressourcen zu verlangen", true],
  ["App-Entwickler, um standardbasiertes SSO in die eigene App einzubauen", true],
  ["Abonnenten von Microsoft 365, Azure oder Dynamics 365 automatisch", true],
  ["Nur Unternehmen mit eigenem On-Premises AD DS", false],
  ["App-Entwickler, um über APIs personalisierte App-Erlebnisse mit Organisationsdaten zu bauen", true]
], "Wer Microsoft 365 oder Azure nutzt, nutzt Entra ID automatisch."),

/* ---------- Benutzer, Gruppen, Administrative Units ---------- */
M("itm3-50", "itv-users", "Welche Zuordnungen von Identitätsart und Quelle sind richtig?", [
  ["Cloud identity → Quelle Windows Server AD", false, "Quelle Entra ID."],
  ["Directory-synchronized identity → Quelle Windows Server AD", true],
  ["Guest user → Quelle Invited User", true],
  ["Guest user → Quelle Windows Server AD", false],
  ["Directory-synchronized identity → Quelle Invited User", false]
], "Drei Arten von Benutzeridentitäten."),
M("itm3-51", "itv-users", "Welche Aussagen zu Guest users sind richtig?", [
  ["Sie existieren außerhalb von Azure, z. B. Konten anderer Cloud-Anbieter oder ein Xbox-Konto.", true],
  ["Sie sind nützlich für externe Dienstleister (B2B Collaboration).", true],
  ["Gäste brauchen ein Konto im eigenen AD DS der Organisation.", false, "Gäste kommen von außen (Invited User)."],
  ["Beim Masseneinladen erscheint ein Zustimmungsbildschirm (Consent Screen).", true],
  ["Gäste werden über Entra Connect Sync aus dem eigenen AD DS synchronisiert.", false]
], "Externer Grafikdesigner für drei Monate → Guest user, danach entfernen."),
M("itm3-52", "itv-users", "Welche Aussagen zur Benutzerverwaltung sind richtig?", [
  ["Jeder Benutzer darf ohne besondere Rolle andere Benutzer anlegen.", false, "Mindestens User Administrator."],
  ["Das Benutzerprofil (Bild, Job, Kontaktinfo) ist Pflicht.", false, "Optional."],
  ["Gelöschte Benutzer können 30 Tage lang wiederhergestellt werden.", true],
  ["Anmelde- und Audit-Protokolle sind verfügbar.", true],
  ["Gelöschte Benutzer sind sofort endgültig weg.", false]
], "Cloud identities, die man aus dem primären Verzeichnis entfernt, sind gelöscht – aber 30 Tage wiederherstellbar."),
M("itm3-53", "itv-users", "Bulk-Anlage von Benutzern: Welche Aussagen sind richtig?", [
  ["Man erstellt eine CSV-Datei mit allen Benutzern und ihren Eigenschaften.", true],
  ["Man geht die Datei in einer Schleife durch und legt jeden mit New-MgUser an.", true],
  ["New-MgUser gehört zu Microsoft Graph PowerShell.", true],
  ["Doppelte Benutzer werden automatisch zusammengeführt, man muss nichts prüfen.", false, "Duplikate muss man selbst behandeln."],
  ["New-AzVM legt Benutzer in Entra ID an.", false, "New-AzVM erstellt VMs."]
], "Auch leere Eigenschaften und der Aktivierungszeitpunkt sind zu beachten."),
M("itm3-54", "itv-users", "Welche Aussagen zu Gruppentypen sind richtig?", [
  ["Security groups steuern den Zugriff auf gemeinsame Ressourcen.", true],
  ["Microsoft 365 groups dienen der Zusammenarbeit (Postfach, Kalender, Dateien, SharePoint).", true],
  ["Microsoft 365 groups können nur Administratoren erstellen.", false, "Auch Benutzer können sie erstellen."],
  ["Security groups zu erstellen erfordert einen Entra-ID-Administrator.", true],
  ["Microsoft 365 groups dienen vor allem dazu, Azure-RBAC-Rechte zu vergeben.", false]
], "Fußballverein: „Trainer“ = Security Group, „U12-Eltern“ = Microsoft 365 Group."),
M("itm3-55", "itv-users", "Welche Aussagen zu den Zuweisungsarten von Gruppen sind richtig?", [
  ["Assigned: Regeln fügen Mitglieder automatisch hinzu.", false, "Das ist Dynamic."],
  ["Dynamic User: Mitglieder bleiben für immer, auch wenn sich ihre Attribute ändern.", false, "Entra ID prüft die Regeln bei Änderungen neu."],
  ["Dynamic User erfordert Entra ID P1.", true],
  ["Dynamic Device gibt es nur bei Security Groups.", true],
  ["Dynamic Device gibt es auch bei Microsoft 365 Groups.", false]
], "Ändern sich Attribute, prüft Entra ID die Regeln neu."),
M("itm3-56", "itv-users", "In welcher Reihenfolge richtet man eine Administrative Unit ein?", [
  ["Erstellen → mit Benutzern/Gruppen befüllen → Rolle mit AU-Scope zuweisen → IT-Mitarbeitende zur Rolle hinzufügen", true],
  ["Rolle zuweisen → erstellen → befüllen → Lizenz kaufen", false],
  ["Befüllen → erstellen → IT-Mitarbeitende hinzufügen → Rolle zuweisen", false],
  ["Erstellen → Rolle mit Tenant-Scope zuweisen → befüllen → löschen", false],
  ["IT-Mitarbeitende hinzufügen → befüllen → erstellen → Rolle zuweisen", false]
], "„Ein Bezirk, Einwohner, ein Bezirksamt, Beamte.“"),
M("itm3-57", "itv-users", "Eine Bank legt pro Filiale (Wien, Graz, Linz) eine Administrative Unit an. Was gilt?", [
  ["Die IT-Kraft in Graz kann mit AU-beschränkter Rolle Passwörter der Grazer Mitarbeitenden zurücksetzen.", true],
  ["Sie kann Microsoft-365-Lizenzen für Graz zuweisen.", true],
  ["Sie kann niemanden in Wien oder Linz ändern.", true],
  ["Administrative Units sind ohne Zusatzlizenz für die Admins nutzbar (Free).", false, "P1 oder P2 je AU-Admin."],
  ["Administrative Units sind ein Scope für Azure-RBAC-Rollen auf VMs.", false, "Sie sind ein Scope für Entra-Rollen."]
], "Typische Aufgaben je AU: Benutzernamen verwalten, Passwörter zurücksetzen, Lizenzen zuweisen."),

/* ---------- RBAC & Rollen ---------- */
M("itm3-60", "itv-rbac", "Welche Konzepte gehören zu Azure RBAC?", [
  ["Security principal: Objekt, das Zugriff anfordert", true],
  ["Role definition: Sammlung von Berechtigungen", true],
  ["Scope: Grenze für den Zugriff", true],
  ["Assignment: Verknüpfung von Rollendefinition, Security Principal und Scope", true],
  ["Initiative: Gruppe von Policy Definitions", false, "Das gehört zu Azure Policy."]
], "Eine Rollenzuweisung ist immer Wer + Was + Wo."),
M("itm3-61", "itv-rbac", "Welche Aussagen zu Azure RBAC sind richtig?", [
  ["RBAC bietet feingranulare Zugriffsverwaltung für Azure-Ressourcen.", true],
  ["RBAC ist auf dem Azure Resource Manager aufgebaut.", true],
  ["RBAC ermöglicht Aufgabentrennung im Team (segregate duties).", true],
  ["RBAC folgt dem Prinzip der minimalen Rechte (least privilege).", true],
  ["RBAC regelt, welche Regionen und VM-Größen erlaubt sind.", false, "Das ist Azure Policy."]
], "Nur so viel Zugriff, wie für die Arbeit nötig."),
M("itm3-62", "itv-rbac", "Welche Aussagen zu den eingebauten Rollen Owner, Contributor, Reader sind richtig?", [
  ["Owner hat vollen Zugriff inklusive des Rechts, Zugriff an andere zu delegieren.", true],
  ["Contributor kann alle Arten von Azure-Ressourcen erstellen und verwalten.", true],
  ["Contributor kann anderen die Rolle Owner zuweisen.", false, "Contributor darf keine Rechte vergeben."],
  ["Reader kann bestehende Ressourcen ansehen.", true],
  ["Reader kann VMs starten und stoppen.", false]
], "Owner = Eigentümer, Contributor = Handwerker, Reader = Besucher, User Access Administrator = Schlüsseldienst."),
M("itm3-63", "itv-rbac", "Die Rollendefinition von Contributor enthält „Actions: *“ und mehrere „NotActions“. Was folgt daraus?", [
  ["Contributor darf grundsätzlich alle Aktionen ausführen.", true],
  ["Berechtigungen unter Microsoft.Authorization schreiben oder löschen darf er nicht.", true],
  ["Contributor darf elevateAccess ausführen.", false, "Steht unter NotActions."],
  ["Contributor darf neue Rollenzuweisungen schreiben.", false, "Microsoft.Authorization/*/Write ist ausgeschlossen."],
  ["NotActions sind die einzigen Aktionen, die Contributor darf.", false, "NotActions werden von Actions abgezogen."]
], "Darum kann ein Contributor keine Rollen zuweisen."),
M("itm3-64", "itv-rbac", "Welche Unterschiede zwischen Azure-RBAC-Rollen und Entra-Rollen sind richtig?", [
  ["Azure RBAC verwaltet Zugriff auf Azure-Ressourcen, Entra-Rollen auf Benutzer, Gruppen, Apps, Domains.", true],
  ["Scope bei Azure RBAC: Management Group, Subscription, Resource Group, Ressource", true],
  ["Scope bei Entra-Rollen: Tenant, Administrative Unit oder einzelnes Objekt", true],
  ["Owner ist eine Entra-Rolle für das Verzeichnis.", false, "Owner ist eine Azure-RBAC-Rolle."],
  ["Ein Global Administrator hat standardmäßig vollen Zugriff auf alle VMs.", false, "Erst nach Elevate Access (User Access Administrator am Root)."]
], "Zwei Systeme, weil das Verzeichnis und die Ressourcen getrennt zu schützen sind."),
M("itm3-65", "itv-rbac", "Welche Aussagen zu Global Administrator und Elevate Access sind richtig?", [
  ["Wer den Tenant anlegt, bekommt Global Administrator automatisch.", true],
  ["Global Administrator hat Full control über Entra ID und Microsoft 365.", true],
  ["Mit Elevate Access wird er User Access Administrator am Root-Scope (/).", true],
  ["Global Administrator ist eine Azure-RBAC-Rolle am Root-Scope.", false, "Es ist eine Entra-Rolle."],
  ["Elevate Access sollte dauerhaft aktiv bleiben.", false, "Notfallmechanismus; danach wieder entfernen."]
], "Die Chefin der Hausverwaltung kommt nicht automatisch in den Heizungsraum."),
M("itm3-66", "itv-rbac", "Welche Aussagen zu den klassischen Administratorrollen sind richtig?", [
  ["Account Administrator: 200 pro Subscription", false, "1 pro Azure-Konto."],
  ["Service Administrator: 1 pro Subscription, volle Kontrolle", true],
  ["Co-Administrator: maximal 2 pro Subscription", false, "200."],
  ["Service Administrator und Co-Administrator werden seit 31. August 2024 nicht mehr unterstützt.", true],
  ["Verbleibende Zuweisungen wurden in Reader umgewandelt.", false, "In Owner."]
], "Heute: Azure RBAC für Ressourcen, Entra-Rollen fürs Verzeichnis, Billing-Rollen für die Abrechnung."),
M("itm3-67", "itv-rbac", "Praktikantin Sophie soll in Test Fehler beheben und in Produktion nur nachsehen. Welche Lösung entspricht Least Privilege?", [
  ["Sophie in eine Gruppe „webshop-praktikum“ aufnehmen", true],
  ["Die Gruppe bekommt Contributor auf rg-webshop-test.", true],
  ["Die Gruppe bekommt Reader auf rg-webshop-prod.", true],
  ["Sophie bekommt Owner auf die ganze Subscription, damit sie nicht nachfragen muss.", false],
  ["Nach dem Praktikum wird Sophie aus der Gruppe entfernt.", true]
], "Rollen an Gruppen vergeben, kleinster passender Scope und kleinste passende Rolle."),
M("itm3-68", "itv-rbac", "Welche Rollen sind eingebaute Entra-Rollen (nicht Azure RBAC)?", [
  ["Global Administrator", true], ["User Administrator", true], ["Owner", false, "Azure-RBAC-Rolle."],
  ["Virtual Machine Contributor", false, "Azure RBAC."], ["User Access Administrator", false, "Azure RBAC."]
], "Billing-Rollen werden separat in Cost Management + Billing verwaltet und geben keinen Zugriff auf Ressourcen.")
];
(X.itinf = X.itinf || []).push({ id: "itinf-mc-v3", questions });
})();
