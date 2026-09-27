/* Calm mode for profiles without game elements (craft, collector): no XP, levels, streaks or "boss" wording. */
(function () {
if (!["craft", "tcg"].includes(window.STUDYOS_TRACK)) return;
App.NOGAME = true; document.documentElement.dataset.nogame = "1";
const WORDS = [[/Boss · /g, "Wissenstest · "], [/Boss besiegt/g, "Test bestanden"], [/\+ Boss/g, "+ Test"], [/Besiegt/g, "Bestanden"], [/Erst Welt abschließen/g, "Nach den Lektionen"], [/Profil & Erfolge/g, "Profil"], [/-Boss\b/g, "-Test"], [/\bBoss\b/g, "Test"], [/Mastery wächst nur durch Antworten, nicht durch Lesen\./g, ""], [/Mastery wächst weiter über Quiz und Karteikarten\./g, "Schön! Du kannst jederzeit wieder reinschauen."], [/Mastery/g, "Wissen"]];
const XP = /^\s*\+?\s*\d+\s*XP\s*$/;
function clean(root) {
  if (!root || root.nodeType !== 1) return;
  root.querySelectorAll(".chip, small, span, .xpfloat").forEach(e => { if (!e.children.length && XP.test(e.textContent)) e.remove(); });
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { let t = n.nodeValue, o = t; if (!/Boss|Besiegt|Erfolge|Erst Welt|XP|Mastery/.test(t)) continue;
    WORDS.forEach(([a, b]) => { t = t.replace(a, b); }); t = t.replace(/\s*·\s*\+\d+\s*XP/g, "").replace(/\+\d+\s*XP\s*·\s*/g, "").replace(/\(\+\d+ XP\)/g, "").replace(/\s\+\d+ XP\.?/g, "");
    if (t !== o) n.nodeValue = t; }
}
App.cleanNoGame = clean;
const obs = new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(nd => { if (nd.nodeType === 1) clean(nd); else if (nd.nodeType === 3 && nd.parentElement) clean(nd.parentElement); })));
App.afterBoot.push(() => { try { const st = App.S(); st.settings = st.settings || {}; if (!st.settings.calmInit) { st.settings.unlockAll = true; st.settings.calmInit = 1; App.save(); } } catch (e) {} clean(document.body); obs.observe(document.body, { childList: true, subtree: true }); });
})();
