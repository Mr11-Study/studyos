/* Erzeugt css/apps.css: eigenes Design je Fach-App + Mehrfachauswahl-Stile.
   Aufruf: node dev/app-themes.js   (danach css/apps.css committen)
   Ein Thema: Akzent hell/dunkel, getönte Flächen (hue/sat), Schriften, Radius, Hintergrundmuster, optional farbige Seitenleiste. */
const fs = require("fs"), path = require("path");

const T = {
  dasc:    { name: "Labor", hue: 84, sat: 14, acc: ["#4E8A0E", "#9BE03A"], ink: ["#fff", "#132200"], disp: "'Space Grotesk'", r: 8, btn: 6,
             pat: ["linear-gradient(#0000 23px,rgba(78,138,14,.07) 24px),linear-gradient(90deg,#0000 23px,rgba(78,138,14,.07) 24px)", "linear-gradient(#0000 23px,rgba(155,224,58,.06) 24px),linear-gradient(90deg,#0000 23px,rgba(155,224,58,.06) 24px)"], patSize: "24px 24px" },
  kommu:   { name: "Gespräch", hue: 24, sat: 38, acc: ["#B4532A", "#F2A272"], ink: ["#fff", "#2A1206"], disp: "'Fraunces'", body: "'Manrope'", r: 18, btn: 999,
             pat: ["radial-gradient(60% 40% at 92% -6%,rgba(240,160,90,.22),#0000 70%),radial-gradient(40% 30% at -6% 30%,rgba(180,83,42,.10),#0000 70%)", "radial-gradient(60% 40% at 92% -6%,rgba(242,162,114,.13),#0000 70%),radial-gradient(40% 30% at -6% 30%,rgba(180,83,42,.12),#0000 70%)"] },
  eng3:    { name: "Oxford", hue: 222, sat: 22, acc: ["#B3223A", "#FF6B81"], ink: ["#fff", "#2B0710"], disp: "'DM Serif Display'", r: 4, btn: 3,
             side: ["#14213D", "#0E1628"], sideText: ["#E8ECF5", "#E8ECF5"],
             pat: ["repeating-linear-gradient(#0000 0 31px,rgba(20,33,61,.06) 31px 32px)", "repeating-linear-gradient(#0000 0 31px,rgba(255,255,255,.035) 31px 32px)"] },
  bwl2:    { name: "Bilanz", hue: 40, sat: 10, acc: ["#9A7212", "#E9BE4E"], ink: ["#fff", "#231800"], disp: "'Archivo'", body: "'Manrope'", r: 6, btn: 4,
             side: ["#23211C", "#141310"], sideText: ["#F2EBDA", "#F2EBDA"],
             pat: ["repeating-linear-gradient(135deg,#0000 0 10px,rgba(154,114,18,.05) 10px 11px)", "repeating-linear-gradient(135deg,#0000 0 10px,rgba(233,190,78,.04) 10px 11px)"] },
  mappdev: { name: "Android", hue: 140, sat: 22, acc: ["#127A3E", "#3DDC84"], ink: ["#fff", "#05230F"], disp: "'Outfit'", r: 20, btn: 999,
             pat: ["radial-gradient(rgba(18,122,62,.13) 1.2px,#0000 1.4px)", "radial-gradient(rgba(61,220,132,.10) 1.2px,#0000 1.4px)"], patSize: "18px 18px" },
  dbaent:  { name: "Schema", hue: 186, sat: 24, acc: ["#0B7480", "#3CC9D6"], ink: ["#fff", "#012126"], disp: "'JetBrains Mono'", r: 3, btn: 3,
             pat: ["repeating-linear-gradient(#0000 0 35px,rgba(11,116,128,.07) 35px 36px),linear-gradient(90deg,rgba(11,116,128,.05) 0 1px,#0000 1px)", "repeating-linear-gradient(#0000 0 35px,rgba(60,201,214,.06) 35px 36px),linear-gradient(90deg,rgba(60,201,214,.05) 0 1px,#0000 1px)"], patSize: "auto, 220px 100%" },
  itinf:   { name: "Azure", hue: 212, sat: 40, acc: ["#0A6CCB", "#4DA3FF"], ink: ["#fff", "#021A33"], disp: "'Manrope'", body: "'Manrope'", r: 14, btn: 10,
             pat: ["radial-gradient(80% 50% at 100% -10%,rgba(10,108,203,.16),#0000 70%),radial-gradient(50% 40% at -10% 0%,rgba(77,163,255,.12),#0000 70%)", "radial-gradient(80% 50% at 100% -10%,rgba(77,163,255,.16),#0000 70%),radial-gradient(50% 40% at -10% 0%,rgba(10,108,203,.18),#0000 70%)"] },
  pmgt:    { name: "Board", hue: 238, sat: 26, acc: ["#4338CA", "#8B85FF"], ink: ["#fff", "#0E0B33"], disp: "'Bricolage Grotesque'", r: 10, btn: 8,
             pat: ["linear-gradient(90deg,rgba(67,56,202,.045) 0 33.3%,#0000 33.3% 66.6%,rgba(67,56,202,.045) 66.6%)", "linear-gradient(90deg,rgba(139,133,255,.04) 0 33.3%,#0000 33.3% 66.6%,rgba(139,133,255,.04) 66.6%)"] },
  ufo:     { name: "Organigramm", hue: 272, sat: 24, acc: ["#7A36C4", "#C49BFF"], ink: ["#fff", "#1D0838"], disp: "'Sora'", r: 8, btn: 8,
             pat: ["linear-gradient(135deg,rgba(122,54,196,.06) 25%,#0000 25%) -12px 0/24px 24px,linear-gradient(225deg,rgba(122,54,196,.06) 25%,#0000 25%) -12px 0/24px 24px", "linear-gradient(135deg,rgba(196,155,255,.05) 25%,#0000 25%) -12px 0/24px 24px,linear-gradient(225deg,rgba(196,155,255,.05) 25%,#0000 25%) -12px 0/24px 24px"], patSize: null },
  mmprov:  { name: "Studio", hue: 292, sat: 20, acc: ["#C026D3", "#E879F9"], ink: ["#fff", "#2A0530"], disp: "'Unbounded'", r: 14, btn: 12, glow: true,
             pat: ["repeating-linear-gradient(#0000 0 3px,rgba(192,38,211,.035) 3px 4px)", "repeating-linear-gradient(#0000 0 3px,rgba(34,211,238,.04) 3px 4px),radial-gradient(60% 40% at 100% 0,rgba(232,121,249,.14),#0000 70%)"] },
  math2:   { name: "Maple", hue: 352, sat: 16, acc: ["#B3122E", "#FF5C74"], ink: ["#fff", "#2E0410"], disp: "'DM Serif Display'", body: "'IBM Plex Sans'", r: 6, btn: 6,
             pat: ["linear-gradient(#0000 19px,rgba(179,18,46,.05) 20px),linear-gradient(90deg,#0000 19px,rgba(179,18,46,.05) 20px)", "linear-gradient(#0000 19px,rgba(255,92,116,.045) 20px),linear-gradient(90deg,#0000 19px,rgba(255,92,116,.045) 20px)"], patSize: "20px 20px" },
  sunw2:   { name: "Terminal", hue: 18, sat: 12, acc: ["#B23A0B", "#FF7A3D"], ink: ["#fff", "#2B0C00"], disp: "'Chakra Petch'", r: 2, btn: 2,
             pat: ["repeating-linear-gradient(45deg,rgba(178,58,11,.05) 0 1px,#0000 1px 16px),repeating-linear-gradient(-45deg,rgba(178,58,11,.05) 0 1px,#0000 1px 16px)", "repeating-linear-gradient(45deg,rgba(255,122,61,.05) 0 1px,#0000 1px 16px),repeating-linear-gradient(-45deg,rgba(255,122,61,.05) 0 1px,#0000 1px 16px)"] }
};

const hsl = (h, s, l) => `hsl(${h} ${s}% ${l}%)`;
const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
function vars(t, dark) {
  const h = t.hue, s = t.sat, i = dark ? 1 : 0, acc = t.acc[i];
  const L = dark ? { bg: 8, side: 10, card: 13, card2: 15.5, card3: 19, line: 20, line2: 27, text: 92, muted: 68, faint: 48 }
                 : { bg: 96.5, side: 94, card: 100, card2: 98, card3: 92.5, line: 88, line2: 80, text: 12, muted: 38, faint: 60 };
  const ss = k => k === "text" || k === "muted" || k === "faint" ? Math.min(s, 18) : s;
  const v = Object.entries(L).map(([k, l]) => `--${k}:${hsl(h, ss(k), l)}`);
  v.push(`--acc:${acc}`, `--acc2:${acc}`, `--acc-ink:${t.ink[i]}`, `--acc-soft:${hexA(acc, dark ? .13 : .09)}`, `--acc-line:${hexA(acc, dark ? .42 : .34)}`,
    `--app-pattern:${t.pat[i]}`, `--app-glow:${t.glow ? (dark ? "0 0 0 1px rgba(232,121,249,.25),0 0 24px rgba(34,211,238,.12)" : "0 0 0 1px rgba(192,38,211,.12),0 8px 24px rgba(192,38,211,.10)") : "var(--shadow)"}`);
  if (dark) v.push("--shadow:none");
  return v.join(";");
}
const fonts = t => `--f-display:${t.disp},var(--f-fallback);--f-body:${t.body || "'IBM Plex Sans'"},var(--f-fallback);--r:${t.r}px;--r-sm:${Math.max(2, Math.round(t.r * .6))}px;--btn-r:${t.btn}px`;

let css = `/* ===== Fach-Apps: jedes Fach hat ein eigenes Design (erzeugt von dev/app-themes.js – dort ändern, nicht hier) ===== */
:root{--f-fallback:"Segoe UI",system-ui,sans-serif}
`;
for (const [id, t] of Object.entries(T)) {
  const sel = `[data-theme=study] .th-${id}`;
  css += `\n/* ${id} · ${t.name} */\n${sel}{${fonts(t)};${vars(t, false)}}\n@media (prefers-color-scheme:dark){${sel}{${vars(t, true)}}}\n`;
  css += `[data-theme=study] .hub-apps .hd-${id}{--c:${t.acc[0]}}\n@media (prefers-color-scheme:dark){[data-theme=study] .hub-apps .hd-${id}{--c:${t.acc[1]}}}\n`;
  if (t.patSize) css += `${sel}.in-app,${sel}.apptile{background-size:${t.patSize}}\n`;
  if (t.side) css += `[data-theme=study] .th-${id}.in-app .side{--side:${t.side[0]};--text:${t.sideText[0]};--muted:${hexA(t.sideText[0].length === 7 ? t.sideText[0] : "#ffffff", .66)};--faint:${hexA("#ffffff", .42)};--card:rgba(255,255,255,.08);--card3:rgba(255,255,255,.06);--line:rgba(255,255,255,.12);--shadow:none;color:var(--text)}
@media (prefers-color-scheme:dark){[data-theme=study] .th-${id}.in-app .side{--side:${t.side[1]}}}\n`;
}

css += `
/* ---------- App-Rahmen ---------- */
[data-theme=study] body.in-app{background:var(--app-pattern),var(--bg);background-attachment:fixed}
.in-app .btn,.apptile .btn{border-radius:var(--btn-r)}
.in-app .btn.pri:hover{background:var(--acc);filter:brightness(1.08)}
.in-app .card{box-shadow:var(--app-glow)}
.in-app h1{font-family:var(--f-display);letter-spacing:-.025em}
.in-app .fchips,.in-app .page>.row>.chip[data-sw],.in-app [data-sw]{display:none!important}
.side .app-back{display:flex;align-items:center;gap:8px;background:none;border:0;color:var(--muted);font:500 13px var(--f-body);padding:4px 8px;cursor:pointer;border-radius:var(--r-sm)}
.side .app-back:hover{color:var(--text);background:var(--card3)}
.side .app-brand .logo{background:var(--acc);color:var(--acc-ink);border-radius:var(--r-sm);width:38px;height:38px;font-size:17px;font-family:var(--f-display)}
.side .app-brand b{font-family:var(--f-display);font-size:18px;line-height:1.15}
.side .app-brand small{color:var(--muted)}
.side .hub-apps{display:flex;flex-direction:column;gap:2px}
.side .hub-apps button{display:flex;align-items:center;gap:10px;background:none;border:0;padding:6px 10px;border-radius:8px;color:var(--muted);cursor:pointer;font-size:13.5px;text-align:left}
.side .hub-apps button:hover{background:var(--card3);color:var(--text)}
.side .hub-apps i{width:9px;height:9px;border-radius:3px;background:var(--c);flex:none}
.topbar .tb-app{display:flex;align-items:center;gap:8px;font:650 15px var(--f-display)}
.topbar .tb-app i{width:10px;height:10px;border-radius:3px;background:var(--acc)}

/* ---------- Launcher „Deine Fächer“ ---------- */
.appgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}
.apptile{position:relative;display:flex;flex-direction:column;gap:14px;text-align:left;cursor:pointer;color:var(--text);background:var(--app-pattern),var(--card);border:1px solid var(--line);border-radius:var(--r);padding:18px;font-family:var(--f-body);box-shadow:var(--app-glow);transition:transform .15s,border-color .15s;min-height:190px}
.apptile:hover{transform:translateY(-2px);border-color:var(--acc-line)}
.apptile .at-ic{width:46px;height:46px;border-radius:var(--r-sm);background:var(--acc);color:var(--acc-ink);display:grid;place-items:center;font:700 20px var(--f-display)}
.apptile h3{font:650 21px/1.15 var(--f-display);color:var(--text)}
.apptile small{color:var(--muted)}
.apptile .at-bar{height:5px;border-radius:5px;background:var(--card3);overflow:hidden}
.apptile .at-bar i{display:block;height:100%;background:var(--acc)}
.apptile .at-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:auto}
.apptile .at-meta span{font:600 11.5px var(--f-body);padding:3px 9px;border-radius:var(--btn-r);background:var(--acc-soft);color:var(--acc)}
.apptile .at-meta span.w{background:var(--warn-soft);color:var(--warn)}

/* ---------- Mehrfachauswahl ---------- */
.mhint{display:inline-flex;align-items:center;gap:6px;font:600 12px var(--f-body);color:var(--acc);letter-spacing:.01em}
.mhint::before{content:"";width:12px;height:12px;border:2px solid currentColor;border-radius:3px}
.mopt{position:relative}
.mopt .k{display:grid;place-items:center;width:22px;height:22px;min-width:22px;border:1.5px solid var(--line2);border-radius:5px;padding:0;font-size:11px;transition:background .12s,border-color .12s}
.mopt.sel{border-color:var(--acc);background:var(--acc-soft)}
.mopt.sel .k{background:var(--acc);border-color:var(--acc);color:var(--acc-ink);font-size:0}
.mopt.sel .k::after{content:"✓";font:700 13px var(--f-body)}
.opt.dim{opacity:.6}
.opt.ok .k,.opt.no .k,.opt.reveal .k{font-size:11px}
.mopt .mmark{margin-left:auto;padding-left:10px;font:600 11.5px var(--f-body);white-space:nowrap;align-self:center}
.mopt.ok .mmark{color:var(--good)} .mopt.no .mmark{color:var(--bad)} .mopt.reveal .mmark{color:var(--warn)}
.mopt.reveal{border-style:dashed;border-color:var(--warn)}
.msub{align-items:center}
.exam-qs .msub{display:none}
.mnotes{margin:8px 0;padding-left:0;list-style:none;display:flex;flex-direction:column;gap:5px}
.mnotes li{font-size:13.5px;padding-left:10px;border-left:3px solid var(--line2)}
.mnotes li.y{border-color:var(--good)} .mnotes li.n{border-color:var(--bad)}
.qprog i.part{background:var(--warn)}

/* ---------- Quick-Test ---------- */
.qt-chips{display:flex;flex-wrap:wrap;gap:8px}
.qt-chips button{border:1px solid var(--line2);background:var(--card2);color:var(--text);padding:8px 14px;border-radius:var(--btn-r,8px);cursor:pointer;font:500 14px var(--f-body)}
.qt-chips button.on{background:var(--acc);border-color:var(--acc);color:var(--acc-ink)}
.qt-score{font:650 52px/1 var(--f-display);letter-spacing:-.03em}
.qt-rule{border-left:3px solid var(--acc);padding:10px 14px;background:var(--acc-soft);border-radius:0 var(--r-sm) var(--r-sm) 0}
/* Semester-Umschalter im Fächer-Launcher */
.semtabs{display:flex;gap:8px;flex-wrap:wrap;margin:4px 0 2px}
.semtab{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:10px 14px;border:1px solid var(--line);border-radius:var(--r);background:var(--card);color:var(--text);cursor:pointer;min-width:150px;text-align:left;font:inherit}
.semtab small{color:var(--muted);font-size:12px}
.semtab.on{border-color:var(--acc);box-shadow:inset 0 0 0 1px var(--acc);background:var(--acc-soft)}
.semtab:disabled{opacity:.5;cursor:not-allowed}
.semtab:not(:disabled):not(.on):hover{border-color:var(--line2)}
`;
fs.writeFileSync(path.join(__dirname, "..", "css", "apps.css"), css);
console.log("css/apps.css geschrieben,", css.length, "Zeichen");
