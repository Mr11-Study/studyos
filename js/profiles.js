/* StudyOS profiles: several people on one device, each with own data, track (study / craft) and look.
   Runs before everything else. Sets window.STUDYOS_PID / STUDYOS_TRACK or shows the picker. */
(function () {
  const LS = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } };
  const SS = (k, v) => { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { return null; } };
  const TRACKS = {
    uni: { label: "Studium", sub: "Wirtschaftsinformatik · Kurse, Prüfungen, Git", icon: "◆", color: "#8BD126" },
    craft: { label: "Stricken & Häkeln", sub: "Techniken, 3D-Maschen, Muster, Projekte", icon: "✿", color: "#C8664B" }
  };
  const keyOf = id => id === "main" ? "studyos.v2" : "studyos.v2." + id;
  const secretOf = id => id === "main" ? "studyos.secrets" : "studyos.secrets." + id;
  let list = []; try { list = JSON.parse(LS("studyos.profiles") || "[]"); } catch (e) { list = []; }
  if (!list.length && LS("studyos.v2")) { let n = "Kevin"; try { n = JSON.parse(LS("studyos.v2")).name || n; } catch (e) {} list = [{ id: "main", name: n, track: "uni" }]; LS("studyos.profiles", JSON.stringify(list)); }
  const save = () => LS("studyos.profiles", JSON.stringify(list));
  const byId = id => list.find(p => p.id === id);
  let active = SS("studyos.session"); if (!byId(active)) active = null;
  if (!active) { const rem = LS("studyos.active"); if (byId(rem)) active = rem; }
  if (!active && list.length === 1) active = list[0].id;
  const P = byId(active);
  const applyTheme = track => {
    document.documentElement.dataset.theme = track === "craft" ? "craft" : "";
    if (track === "craft") {
      const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap"; document.head.appendChild(l);
      const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = "#FBF6F0";
      const cs = document.querySelector('meta[name="color-scheme"]'); if (cs) cs.content = "light";
    }
  };
  if (P) {
    window.STUDYOS_PID = P.id; window.STUDYOS_TRACK = P.track || "uni"; window.STUDYOS_PNAME = P.name;
    window.STUDYOS_KEY = keyOf(P.id); window.STUDYOS_SECRET = secretOf(P.id);
    SS("studyos.session", P.id); applyTheme(window.STUDYOS_TRACK);
  }
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const choose = (id, remember) => { SS("studyos.session", id); if (remember) LS("studyos.active", id); else LS("studyos.active", null); location.hash = ""; location.reload(); };

  function picker(startCreate) {
    applyTheme("");
    const root = document.createElement("div"); root.className = "pick"; document.body.appendChild(root);
    let creating = startCreate || !list.length, track = "craft", nameVal = "";
    const draw = () => {
      root.innerHTML = `<div class="pick-box">
        <div class="pick-brand"><div class="logo">S</div><b>StudyOS</b></div>
        ${creating ? `<h1>${list.length ? "Neues Profil" : "Willkommen"}</h1><p class="muted">${list.length ? "Jedes Profil hat eigene Kurse, eigenen Fortschritt und eigenes Design." : "Lege dein Profil an. Alles bleibt auf diesem Gerät."}</p>
          <label class="fld">Name<input type="text" id="pk-name" maxlength="24" placeholder="z. B. Angi" autocomplete="off" value="${esc(nameVal)}"></label>
          <div class="eyebrow">Was möchtest du lernen?</div>
          <div class="pick-tracks">${Object.entries(TRACKS).map(([k, t]) => `<button class="pick-track ${k === track ? "on" : ""}" data-track="${k}" style="--c:${t.color}"><span class="pt-ic">${t.icon}</span><b>${t.label}</b><small>${t.sub}</small></button>`).join("")}</div>
          <label class="pick-rem"><input type="checkbox" id="pk-rem" checked> Auf diesem Gerät automatisch öffnen</label>
          <div class="pick-actions">${list.length ? `<button class="btn ghost" id="pk-back">Zurück</button>` : ""}<button class="btn pri" id="pk-create">Profil erstellen</button></div>`
        : `<h1>Wer lernt heute?</h1>
          <div class="pick-grid">${list.map(p => { const t = TRACKS[p.track] || TRACKS.uni; return `<button class="pick-p" data-pid="${esc(p.id)}" style="--c:${t.color}"><span class="pp-av">${esc((p.name || "?")[0].toUpperCase())}</span><b>${esc(p.name)}</b><small>${t.label}</small></button>`; }).join("")}
            <button class="pick-p add" id="pk-add"><span class="pp-av">+</span><b>Profil hinzufügen</b><small>Stricken, Häkeln oder Studium</small></button></div>
          <label class="pick-rem"><input type="checkbox" id="pk-rem"> Auswahl auf diesem Gerät merken</label>`}
      </div>`;
      root.onclick = e => {
        const t = e.target.closest("[data-track]"); if (t) { track = t.dataset.track; draw(); const n = root.querySelector("#pk-name"); n && n.focus(); return; }
        const p = e.target.closest("[data-pid]"); if (p) { choose(p.dataset.pid, root.querySelector("#pk-rem").checked); return; }
        if (e.target.closest("#pk-add")) { creating = true; draw(); return; }
        if (e.target.closest("#pk-back")) { creating = false; draw(); return; }
        if (e.target.closest("#pk-create")) {
          const inp = root.querySelector("#pk-name"), name = inp.value.trim(); if (!name) { inp.focus(); inp.classList.add("shake"); return; }
          const id = "p" + Date.now().toString(36);
          list.push({ id, name, track }); save();
          try { localStorage.setItem(keyOf(id), JSON.stringify({ v: 2, name })); } catch (e2) {}
          choose(id, root.querySelector("#pk-rem").checked);
        }
      };
      const n = root.querySelector("#pk-name"); if (n) { n.oninput = () => { nameVal = n.value; }; n.focus(); n.onkeydown = e => { if (e.key === "Enter") root.querySelector("#pk-create").click(); }; }
    };
    draw();
  }
  window.StudyProfiles = {
    list: () => list.slice(), active: () => P || null, TRACKS, picker,
    switchTo() { SS("studyos.session", null); LS("studyos.active", null); location.hash = ""; location.reload(); },
    rename(id, name) { const p = byId(id); if (p && name) { p.name = name; save(); } },
    remove(id) { if (!byId(id) || (P && P.id === id)) return false; list = list.filter(p => p.id !== id); save(); try { localStorage.removeItem(keyOf(id)); localStorage.removeItem(secretOf(id)); } catch (e) {} return true; },
    remember(on) { if (!P) return; if (on) LS("studyos.active", P.id); else LS("studyos.active", null); },
    remembered: () => !!(P && LS("studyos.active") === P.id)
  };
})();
