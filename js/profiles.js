/* StudyOS profiles: several students on one device, each with own data and semester.
   Runs before everything else. Sets window.STUDYOS_PID / STUDYOS_TRACK or shows the picker. */
(function () {
  const LS = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } };
  const SS = (k, v) => { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { return null; } };
  const TRACKS = {
    uni: { label: "Studium", sub: "Wirtschaftsinformatik · Kurse, Prüfungen, Git", icon: "◆", color: "#8BD126" }
  };
  /* Semester: jedes Studium-Profil lernt ein Semester; Kurse tragen course.semester (core.js filtert danach) */
  const SEMS = [{ n: 1, term: "WS 2025/26" }, { n: 2, term: "SS 2026" }, { n: 3, term: "WS 2026/27" }];
  const keyOf = id => id === "main" ? "studyos.v2" : "studyos.v2." + id;
  const secretOf = id => id === "main" ? "studyos.secrets" : "studyos.secrets." + id;
  /* Sync-Link vom QR-Code (#pair=…) aufheben, bevor Profilwahl oder Neuladen den #-Teil verwerfen */
  if (/^#pair=/.test(location.hash)) { SS("studyos.pair", location.hash.slice(6)); try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { location.hash = ""; } }
  let list = []; try { list = JSON.parse(LS("studyos.profiles") || "[]"); } catch (e) { list = []; }
  /* Die früheren Profile „Stricken & Häkeln“ und „Sammlung“ gibt es nicht mehr */
  if (list.some(p => (p.track || "uni") !== "uni")) { list = list.filter(p => (p.track || "uni") === "uni"); LS("studyos.profiles", JSON.stringify(list)); }
  if (!list.length && LS("studyos.v2")) { let n = "Kevin"; try { n = JSON.parse(LS("studyos.v2")).name || n; } catch (e) {} list = [{ id: "main", name: n, track: "uni" }]; LS("studyos.profiles", JSON.stringify(list)); }
  const save = () => LS("studyos.profiles", JSON.stringify(list));
  const byId = id => list.find(p => p.id === id);
  let active = SS("studyos.session"); if (!byId(active)) active = null;
  if (!active) { const rem = LS("studyos.active"); if (byId(rem)) active = rem; }
  if (!active && list.length === 1) active = list[0].id;
  const P = byId(active);
  const applyTheme = track => {
    document.documentElement.dataset.theme = track === "uni" ? "study" : "";
    if (track === "uni") { const dark = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches; const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = dark ? "#121417" : "#F5F4EF"; const cs = document.querySelector('meta[name="color-scheme"]'); if (cs) cs.content = "light dark"; }
  };
  if (P) {
    window.STUDYOS_PID = P.id; window.STUDYOS_TRACK = P.track || "uni"; window.STUDYOS_PNAME = P.name; window.STUDYOS_SEM = P.sem || 3;
    window.STUDYOS_KEY = keyOf(P.id); window.STUDYOS_SECRET = secretOf(P.id);
    SS("studyos.session", P.id); applyTheme(window.STUDYOS_TRACK);
  }
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const choose = (id, remember) => { SS("studyos.session", id); if (remember) LS("studyos.active", id); else LS("studyos.active", null); location.hash = ""; location.reload(); };

  function picker(startCreate) {
    applyTheme("uni");
    const root = document.createElement("div"); root.className = "pick"; document.body.appendChild(root);
    let creating = startCreate || !list.length, track = "uni", nameVal = "", sem = 3;
    const draw = () => {
      const first = !list.length;
      root.innerHTML = `<div class="pick-box">
        <div class="pick-brand"><div class="logo">S</div><b>StudyOS</b></div>
        ${creating ? `${first ? `<div class="pick-hero"><h1>Schön, dass du da bist.</h1><p>StudyOS begleitet dich durchs Studium, in kleinen Schritten und ganz in Ruhe.</p></div>
          <ul class="pick-how"><li><i>1</i><div><b>Lesen</b><small>Kurze Lektionen zu jedem Thema deiner Fächer</small></div></li><li><i>2</i><div><b>Wiederholen</b><small>Ein paar Fragen am Tag, genau dann, wenn du sie brauchst</small></div></li><li><i>3</i><div><b>Prüfung üben</b><small>Mit echten Altfragen und Lösungen</small></div></li></ul>`
          : `<h1>Neues Profil</h1><p class="muted">Jedes Profil hat eigenen Fortschritt und ein eigenes Semester.</p>`}
          <div class="pick-form">
          <label class="fld">Wie heißt du?<input type="text" id="pk-name" maxlength="24" placeholder="Dein Vorname" autocomplete="off" value="${esc(nameVal)}"></label>
          <div class="fld">Welches Semester lernst du?<div class="pick-sems">${SEMS.map(x => `<button class="pick-sem ${x.n === sem ? "on" : ""}" data-sem="${x.n}"><b>${x.n}. Semester</b><small>${x.term}</small></button>`).join("")}</div><small class="muted">Kannst du später jederzeit wechseln.</small></div>
          </div>
          <div class="pick-actions">${list.length ? `<button class="btn ghost" id="pk-back">Zurück</button>` : ""}<button class="btn pri" id="pk-create">${first ? "Los geht’s" : "Profil erstellen"}</button></div>
          <label class="pick-rem"><input type="checkbox" id="pk-rem" checked> Auf diesem Gerät automatisch öffnen</label>
          ${first ? `<p class="pick-note">Alles bleibt auf deinem Gerät. Kein Konto nötig.</p>` : ""}`
        : `<h1>Wer lernt heute?</h1>
          <div class="pick-grid">${list.map(p => `<button class="pick-p" data-pid="${esc(p.id)}"><span class="pp-av">${esc((p.name || "?")[0].toUpperCase())}</span><b>${esc(p.name)}</b><small>${p.sem || 3}. Semester</small></button>`).join("")}
            <button class="pick-p add" id="pk-add"><span class="pp-av">+</span><b>Profil hinzufügen</b><small>Weitere Person</small></button></div>
          <label class="pick-rem"><input type="checkbox" id="pk-rem"> Auswahl auf diesem Gerät merken</label>`}
      </div>`;
      root.onclick = e => {
        const sm = e.target.closest("[data-sem]"); if (sm) { sem = +sm.dataset.sem; draw(); return; }
        const t = e.target.closest("[data-track]"); if (t) { track = t.dataset.track; draw(); const n = root.querySelector("#pk-name"); n && n.focus(); return; }
        const p = e.target.closest("[data-pid]"); if (p) { choose(p.dataset.pid, root.querySelector("#pk-rem").checked); return; }
        if (e.target.closest("#pk-add")) { creating = true; draw(); return; }
        if (e.target.closest("#pk-back")) { creating = false; draw(); return; }
        if (e.target.closest("#pk-create")) {
          const inp = root.querySelector("#pk-name"), name = inp.value.trim(); if (!name) { inp.focus(); inp.classList.add("shake"); return; }
          const id = "p" + Date.now().toString(36);
          list.push(track === "uni" ? { id, name, track, sem } : { id, name, track }); save();
          try { localStorage.setItem(keyOf(id), JSON.stringify({ v: 2, name, profile: { onboarded: true, created: Date.now() } })); } catch (e2) {}
          choose(id, root.querySelector("#pk-rem").checked);
        }
      };
      const n = root.querySelector("#pk-name"); if (n) { n.oninput = () => { nameVal = n.value; }; if (list.length) n.focus(); n.onkeydown = e => { if (e.key === "Enter") root.querySelector("#pk-create").click(); }; }
    };
    draw();
  }
  window.StudyProfiles = {
    list: () => list.slice(), active: () => P || null, TRACKS, picker, SEMS,
    sem: () => (P && P.sem) || 3,
    setSem(n) { if (!P || !SEMS.some(x => x.n === n)) return; P.sem = n; save(); location.hash = ""; location.reload(); },
    switchTo() { SS("studyos.session", null); LS("studyos.active", null); location.hash = ""; location.reload(); },
    rename(id, name) { const p = byId(id); if (p && name) { p.name = name; save(); } },
    remove(id) { if (!byId(id) || (P && P.id === id)) return false; list = list.filter(p => p.id !== id); save(); try { localStorage.removeItem(keyOf(id)); localStorage.removeItem(secretOf(id)); } catch (e) {} return true; },
    remember(on) { if (!P) return; if (on) LS("studyos.active", P.id); else LS("studyos.active", null); },
    remembered: () => !!(P && LS("studyos.active") === P.id)
  };
})();
