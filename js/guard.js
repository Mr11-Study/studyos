/* StudyOS Schutz & Tempo: läuft als erstes Skript.
   - Schutz vor Clickjacking: StudyOS lässt sich nicht unsichtbar in fremde Seiten einbetten.
   - Schriften laden im Hintergrund, die App wartet nicht auf Google Fonts.
   - Misst die Ladezeit und zählt blockierte Fremd-Inhalte (Content Security Policy) für Einstellungen › Sicherheit. */
(function () {
  try { if (window.top !== window.self) { document.documentElement.style.display = "none"; window.top.location = window.self.location.href; } } catch (e) { document.documentElement.style.display = "none"; }
  const f = document.getElementById("gfonts");
  if (f) { const on = () => { f.media = "all"; }; if (f.sheet) on(); else f.addEventListener("load", on); }
  const G = window.STUDYOS_GUARD = { t0: performance.now(), blocked: [] };
  document.addEventListener("securitypolicyviolation", e => { if (G.blocked.length < 20) G.blocked.push({ dir: e.effectiveDirective || e.violatedDirective, url: String(e.blockedURI || "").slice(0, 120), at: Date.now() }); });
})();
