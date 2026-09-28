#!/usr/bin/env python3
"""Build the StudyOS collector data from the TCGdex card database + the official Cardmarket price guide.

Inputs:
  --db        path to a checkout of github.com/tcgdex/cards-database (folder containing data/)
  --prices    Cardmarket price_guide_6.json  (Pokémon, daily, https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_6.json)
  --sealed    Cardmarket products_nonsingles_6.json (https://downloads.s3.cardmarket.com/productCatalog/productList/products_nonsingles_6.json)
  --out       output folder (data/tcg)

Outputs (compact JSON, UTF-8):
  meta.json            {updated, built, sets, cards, sealed}
  sets.json            [{id,s,sn,n,d,c,t,e,a,v,top}]  (v = sum of trend prices, top = most valuable card localId)
  sets/<setId>.json    {id,u,cards:[{l,n,r,k,i,hp,ty,p,rv,sp}]}
  sealed.json          {u, items:[[idProduct,name,cat,idExpansion,dateAdded,trend,avg,low,avg1,avg7,avg30,tcgplayerImageId]]}
Price array p / rv = [trend, avg, low, avg1, avg7, avg30] (EUR, 2 decimals, null if missing).
"""
import argparse, json, os, re, sys, datetime, glob

LANGS = ["de", "en", "fr", "it", "es", "pt"]
KV = re.compile(r'''(["']?)([\w-]+)\1\s*:\s*(["'])((?:\\.|(?!\3).)*)\3''')

def block(text, start):
    """Return the substring of a balanced {...} or [...] starting at index `start`."""
    open_c = text[start]; close_c = "}" if open_c == "{" else "]"; depth = 0; i = start; q = None
    while i < len(text):
        ch = text[i]
        if q:
            if ch == "\\": i += 2; continue
            if ch == q: q = None
        elif ch in "\"'`": q = ch
        elif ch == open_c: depth += 1
        elif ch == close_c:
            depth -= 1
            if depth == 0: return text[start:i + 1]
        i += 1
    return text[start:]

ASIA_LANGS = ["ja", "ko", "id", "en"]
def names(text, key="name", langs=None):
    m = re.search(r'(?<![\w.])' + key + r'\s*:\s*\{', text)
    if not m: return {}
    b = block(text, m.end() - 1)
    out = {}
    for mm in KV.finditer(b):
        k, v = mm.group(2), mm.group(4)
        if k in (langs or LANGS): out[k] = v.replace("\\'", "'").replace('\\"', '"')
    return out

def no_names(text):
    """text with the name/description blocks removed (asia files use 'id' as the Indonesian language key)."""
    for key in ("name", "description"):
        m = re.search(r'(?<![\w.])' + key + r'\s*:\s*\{', text)
        if m: b = block(text, m.end() - 1); text = text[:m.start()] + text[m.end() - 1 + len(b):]
    return text

def field(text, key):
    m = re.search(r'\n\s*' + key + r'''\s*:\s*(["'])((?:\\.|(?!\1).)*)\1''', text)
    return m.group(2) if m else None

def num(text, key):
    m = re.search(r'\n\s*' + key + r'\s*:\s*(\d+)', text)
    return int(m.group(1)) if m else None

def cm_id(text):
    m = re.search(r'cardmarket\s*:\s*(\d+)', text)
    return int(m.group(1)) if m else None

def top_level_objects(arr):
    objs, depth, start, q, i = [], 0, None, None, 0
    while i < len(arr):
        ch = arr[i]
        if q:
            if ch == "\\": i += 2; continue
            if ch == q: q = None
        elif ch in "\"'": q = ch
        elif ch == "{":
            if depth == 0: start = i
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0 and start is not None: objs.append(arr[start:i + 1])
        i += 1
    return objs

def variants(text):
    """-> list of dicts {type, sub, stamp, foil, cm}"""
    m = re.search(r'\n\s*variants\s*:\s*([\[{])', text)
    root_cm = None
    if m:
        vb = block(text, m.start(1))
        rest = text[:m.start()] + text[m.start(1) + len(vb):]
        root_cm = cm_id(rest)
        if vb.startswith("["):
            out = []
            for o in top_level_objects(vb[1:-1]):
                t = re.search(r'''type\s*:\s*["']([\w-]+)''', o); st = re.search(r'''subtype\s*:\s*["']([\w-]+)''', o)
                stamp = re.findall(r'''["']([\w-]+)["']''', (re.search(r'stamp\s*:\s*\[([^\]]*)\]', o) or [None, ""])[1] if re.search(r'stamp\s*:\s*\[', o) else "")
                foil = re.search(r'''foil\s*:\s*["']([\w-]+)''', o)
                out.append({"type": t.group(1) if t else "normal", "sub": st.group(1) if st else None, "stamp": stamp, "foil": foil.group(1) if foil else None, "cm": cm_id(o) or root_cm})
            return out
        flags = dict(re.findall(r'(\w+)\s*:\s*(true|false)', vb))
        out = []
        for k in ["normal", "reverse", "holo", "firstEdition"]:
            if flags.get(k) == "true": out.append({"type": "holo" if k == "firstEdition" else k, "sub": None, "stamp": ["1st-edition"] if k == "firstEdition" else [], "foil": None, "cm": root_cm})
        return out or [{"type": "normal", "sub": None, "stamp": [], "foil": None, "cm": root_cm}]
    return [{"type": "normal", "sub": None, "stamp": [], "foil": None, "cm": cm_id(text)}]

def r2(x):
    return None if x is None else round(float(x), 2)

def price_arr(g, holo=False):
    if not g: return None
    s = "-holo" if holo else ""
    arr = [r2(g.get("trend" + s)), r2(g.get("avg" + s)), r2(g.get("low" + s)), r2(g.get("avg1" + s)), r2(g.get("avg7" + s)), r2(g.get("avg30" + s))]
    return arr if any(v is not None for v in arr) else None

STAMP_DE = {"1st-edition": "1. Edition", "shadowless": "Shadowless", "gamestop": "GameStop-Stempel", "eb-games": "EB-Games-Stempel", "pokemon-center": "Pokémon Center", "prerelease": "Prerelease", "staff": "Staff"}
def label(v):
    parts = []
    if v.get("sub"): parts.append(STAMP_DE.get(v["sub"], v["sub"].replace("-", " ").title()))
    parts += [STAMP_DE.get(s, s.replace("-", " ").title()) for s in v.get("stamp") or []]
    if v.get("foil"): parts.append(v["foil"].replace("-", " ").title() + " Foil")
    parts.append({"normal": "Normal", "reverse": "Reverse Holo", "holo": "Holo"}.get(v["type"], v["type"]))
    return " · ".join(dict.fromkeys(parts))

def natkey(s):
    return [int(t) if t.isdigit() else t for t in re.split(r'(\d+)', s)]

def nnum(x):
    """'006/165' -> '6', 'GG01/GG70' -> 'GG1', 'SWSH050' -> 'SWSH50'"""
    x = str(x or "").split("/")[0].strip().upper()
    return re.sub(r"(?<![0-9])0+(?=[0-9])", "", x)

def norm_name(x):
    return re.sub(r"[^a-z0-9]+", " ", (x or "").lower().replace("&", "and").replace("pokémon", "").replace("pokemon", "")).strip()

LANG_ORDER = ["de", "en", "fr", "it", "es", "pt"]
def index_row(set_id, c):
    """[set, nr, nameDe, nameEn, rarity, trend, reverseTrend, category, types, illustrator, hp, languageMask, cmId, specialCount, tcgplayerImageId]"""
    mask = c.get("lm") or sum(1 << i for i, l in enumerate(LANG_ORDER) if c["n"].get(l))
    return [set_id, c["l"], c["n"].get("de") or c["n"].get("en") or c["n"].get("ja") or c["n"].get("ko"), c["n"].get("en") or c["n"].get("de") or c["n"].get("ja") or c["n"].get("ko"), c.get("r"), (c.get("p") or [None])[0], (c.get("rv") or [None])[0],
            c.get("k"), "/".join(c.get("ty") or []) or None, c.get("i"), c.get("hp"), mask, c.get("cm"), len(c.get("sp") or []), c.get("tp")]

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--db", required=True); ap.add_argument("--prices"); ap.add_argument("--sealed"); ap.add_argument("--tcgp"); ap.add_argument("--out", required=True)
    a = ap.parse_args()
    guide, updated = {}, None
    if a.prices and os.path.exists(a.prices):
        pg = json.load(open(a.prices, encoding="utf-8")); updated = pg.get("createdAt")
        for g in pg.get("priceGuides", []): guide[g["idProduct"]] = g
    os.makedirs(os.path.join(a.out, "sets"), exist_ok=True)
    sets_out, index = [], []
    n_cards = 0
    # --- TCGplayer single-card images (fallback when TCGdex has no picture) ---
    tp_groups, tp_by_group = [], {}
    if a.tcgp and os.path.exists(a.tcgp):
        try:
            tpd = json.load(open(a.tcgp, encoding="utf-8")); tp_groups = tpd.get("groups", [])
            for pid, gid, number, name in tpd.get("singles", []):
                tp_by_group.setdefault(gid, {}).setdefault(nnum(number), []).append((pid, (name or "").lower()))
        except Exception as e: print("tcgplayer singles unavailable:", e)
    def tp_groups_for(set_names, abbr, real_id, asia):
        out = []
        en = norm_name(set_names.get("en") or "")
        for gid, cat, gname, gabbr, pub in tp_groups:
            if gid not in tp_by_group: continue
            if asia:
                if cat == 3: continue
                pre = (gname or "").split(":")[0].strip().lower()
                if (gabbr or "").lower() == real_id.lower() or pre == real_id.lower(): out.append(gid)
            else:
                if cat != 3: continue
                ab = (abbr or "").split(":")[0].lower()
                gn = norm_name((gname or "").split(":")[-1])
                if (ab and (gabbr or "").lower() == ab and (not en or en in gn or gn in en or len(gn) < 4)) or (en and gn == en): out.append(gid)
        return out
    def attach_tp(cards, gids, asia):
        if not gids: return 0
        n = 0
        for c in cards:
            cands = [x for g in gids for x in tp_by_group[g].get(nnum(c["l"]), [])]
            if not cands: continue
            en = (c["n"].get("en") or "").lower().split(" ")[0]
            pick = next((x for x in cands if en and en in x[1]), None) if not asia else None
            if pick is None and (asia or len(cands) == 1 or not en): pick = cands[0]
            if pick: c["tp"] = pick[0]; n += 1
        return n
    en2de = {}  # English -> German card names from the international data (to give Japanese cards German names)
    dex = {}    # national dex number -> shortest {de, en} base name seen in the international data

    def dex_of(ct):
        m = re.search(r'dexId\s*:\s*\[\s*(\d+)\s*\]', ct)
        return int(m.group(1)) if m else None

    SUFFIX = [("VMAX", " VMAX", " VMAX"), ("VSTAR", " VSTAR", " VSTAR"), ("VUNION", " VUNION", " V-UNION"), ("BREAK", " BREAK", " TURBO"), ("GX", "-GX", "-GX"), ("ex", " ex", "-ex"), ("EX", "-EX", "-EX"), ("V", " V", " V"), ("LV.X", " LV.X", " LV.X")]
    def translate(ja, d):
        base = dex.get(d)
        if not base or not ja: return None
        tail = ja.strip()
        for key, en_s, de_s in SUFFIX:
            if tail.endswith(key):
                return {"en": base["en"] + en_s, "de": base["de"] + de_s}
        return {"en": base["en"], "de": base["de"]}

    def build_card(ct, lid, nm):
        vs = variants(ct)
        base = next((v for v in vs if v["cm"] and not v["stamp"] and not v["sub"] and not v["foil"] and v["type"] != "reverse"), None) or next((v for v in vs if v["cm"] and not v["stamp"] and not v["foil"]), None) or next((v for v in vs if v["cm"]), None)
        has_rev = any(v["type"] == "reverse" and not v["stamp"] and not v["foil"] for v in vs)
        g = guide.get(base["cm"]) if base else None
        c = {"l": lid, "n": nm, "r": field(ct, "rarity"), "k": field(ct, "category"), "i": field(ct, "illustrator")}
        hp = num(ct, "hp")
        if hp: c["hp"] = hp
        ty = re.search(r'\n\s*types\s*:\s*\[([^\]]*)\]', ct)
        if ty: c["ty"] = re.findall(r'''["'](\w+)["']''', ty.group(1))
        c["vt"] = sorted({v["type"] for v in vs if not v["stamp"] and not v["foil"]})
        if base and base["cm"]: c["cm"] = base["cm"]
        p = price_arr(g)
        if p: c["p"] = p
        if has_rev:
            rv = price_arr(g, True)
            if rv: c["rv"] = rv
        sp = []
        seen = {base["cm"]} if base else set()
        for v in vs:
            if not v["cm"] or v is base: continue
            if v["type"] == "reverse" and not v["stamp"] and not v["foil"] and v["cm"] in seen: continue
            gg = guide.get(v["cm"]); pa = price_arr(gg, v["type"] == "reverse" and v["cm"] == (base or {}).get("cm"))
            key = (label(v), v["cm"])
            if key in [(x[0], x[1]) for x in sp]: continue
            sp.append([label(v), v["cm"], pa[0] if pa else None])
        if sp: c["sp"] = sp
        return c

    def release(st, asia):
        d = field(st, "releaseDate")
        if d or not asia: return d
        m = re.search(r'releaseDate\s*:\s*\{', st)
        if not m: return None
        rd = names(st, "releaseDate", ["ja", "ko", "zh-tw", "id", "th"])
        return rd.get("ja") or rd.get("ko") or next(iter(rd.values()), None)

    for region in ("intl", "asia"):
        asia = region == "asia"
        data = os.path.join(a.db, "data-asia" if asia else "data")
        if not os.path.isdir(data): continue
        series = {}
        for sf in glob.glob(os.path.join(data, "*.ts")):
            t = open(sf, encoding="utf-8").read(); sid = field(no_names(t) if asia else t, "id")
            if not sid or sid == "tcgp": continue  # skip the digital TCG Pocket
            if asia:
                sn = names(t, langs=["ja", "ko", "id", "en"])
                label_en = sn.get("en") or sn.get("id") or sid
                series[os.path.basename(sf)[:-3]] = {"id": "jp-" + sid, "rid": sid, "n": {"de": "Japan · " + label_en, "en": "Japan · " + label_en, "ja": sn.get("ja", label_en)}}
            else:
                series[os.path.basename(sf)[:-3]] = {"id": sid, "rid": sid, "n": names(t)}
        for serie_dir, ser in series.items():
            sdir = os.path.join(data, serie_dir)
            if not os.path.isdir(sdir): continue
            for setf in sorted(glob.glob(os.path.join(sdir, "*.ts"))):
                st = open(setf, encoding="utf-8").read(); real_id = field(no_names(st) if asia else st, "id")
                cdir = setf[:-3]
                if not real_id or not os.path.isdir(cdir): continue
                set_names = names(st, langs=ASIA_LANGS) if asia else names(st)
                if asia and not (set_names.get("ja") or set_names.get("ko")): continue  # only Japanese / Korean releases
                set_id = ("jp-" + real_id) if asia else real_id
                img_lang = ("ja" if set_names.get("ja") else "ko") if asia else None
                tp = re.search(r'thirdParty\s*:\s*\{([^}]*)\}', st)
                exp = int(re.search(r'cardmarket\s*:\s*(\d+)', tp.group(1)).group(1)) if tp and re.search(r'cardmarket\s*:\s*(\d+)', tp.group(1)) else None
                abbr = re.search(r'abbreviations\s*:\s*\{[^}]*official\s*:\s*["\']([^"\']+)', st)
                cards = []
                for cf in glob.glob(os.path.join(cdir, "*.ts")):
                    ct = open(cf, encoding="utf-8").read(); lid = os.path.basename(cf)[:-3]
                    if asia:
                        raw = names(ct, langs=ASIA_LANGS)
                        if not (raw.get("ja") or raw.get("ko")): continue
                        en = raw.get("en") or raw.get("id")
                        nm = {k: raw[k] for k in ("ja", "ko") if raw.get(k)}
                        if en: nm["en"] = en
                        if en and en in en2de: nm["de"] = en2de[en]
                        if "de" not in nm:
                            tr = translate(raw.get("ja") or raw.get("ko"), dex_of(ct))
                            if tr: nm["de"] = tr["de"]; nm.setdefault("en", tr["en"])
                        c = build_card(ct, lid, nm)
                        c["lm"] = (64 if raw.get("ja") else 0) | (128 if raw.get("ko") else 0)
                    else:
                        nm = names(ct)
                        if not nm: continue
                        if nm.get("en") and nm.get("de"):
                            en2de.setdefault(nm["en"], nm["de"])
                            d = dex_of(ct)
                            if d and field(ct, "category") == "Pokemon":
                                cur = dex.get(d)
                                if not cur or len(nm["de"]) < len(cur["de"]): dex[d] = {"de": nm["de"], "en": nm["en"]}
                        c = build_card(ct, lid, nm)
                    cards.append(c)
                if not cards: continue
                attach_tp(cards, tp_groups_for(set_names, abbr.group(1) if abbr else None, real_id, asia), asia)
                cards.sort(key=lambda c: natkey(c["l"]))
                n_cards += len(cards)
                val = round(sum((c.get("p") or [0])[0] or 0 for c in cards), 2)
                top = max(cards, key=lambda c: (c.get("p") or [0])[0] or 0)
                for c in cards: index.append(index_row(set_id, c))
                json.dump({"id": set_id, "u": updated, "cards": cards}, open(os.path.join(a.out, "sets", set_id + ".json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
                if asia: set_names = {"de": real_id + " · " + (set_names.get("ja") or set_names.get("ko")), "ja": set_names.get("ja"), "ko": set_names.get("ko"), "en": real_id + " · " + (set_names.get("en") or set_names.get("id") or set_names.get("ja") or set_names.get("ko"))}
                off = re.search(r'official\s*:\s*(\d+)', st)
                so = {"id": set_id, "s": ser["id"], "sn": ser["n"], "n": {k: v for k, v in set_names.items() if v}, "d": release(st, asia), "c": int(off.group(1)) if off else 0, "t": len(cards), "e": exp, "a": abbr.group(1) if abbr else (real_id if asia else None), "v": val, "top": top["l"] if (top.get("p") or [0])[0] else cards[0]["l"], "tt": (top if (top.get("p") or [0])[0] else cards[0]).get("tp")}
                if asia: so.update({"rg": "ja", "rid": real_id, "rs": ser["rid"], "il": img_lang})
                sets_out.append(so)
    sets_out.sort(key=lambda s: (s["d"] or "0000"), reverse=True)
    json.dump({"u": updated, "c": index}, open(os.path.join(a.out, "index.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    json.dump(sets_out, open(os.path.join(a.out, "sets.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    n_sealed = 0
    if a.sealed and os.path.exists(a.sealed):
        cat = json.load(open(a.sealed, encoding="utf-8")); items = []
        imgs = {}
        if a.tcgp and os.path.exists(a.tcgp):
            try:
                sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import sealed_match
                tp = json.load(open(a.tcgp, encoding="utf-8")); groups = {g[0]: g for g in tp["groups"]}
                m = sealed_match.match([(p["idProduct"], p["name"], p.get("categoryName", "")) for p in cat.get("products", [])], tp["items"], groups)
                for k, url in m.items():
                    mm = re.search(r'/product/(\d+)_', url)
                    if mm: imgs[k] = int(mm.group(1))
                print(f"sealed images matched: {len(imgs)}")
            except Exception as e: print("sealed image matching failed:", e)
        for p in cat.get("products", []):
            g = guide.get(p["idProduct"]); pr = price_arr(g) or [None] * 6
            items.append([p["idProduct"], p["name"], p.get("categoryName", "").replace("Pokémon ", ""), p.get("idExpansion"), (p.get("dateAdded") or "")[:10]] + pr + [imgs.get(p["idProduct"])])
        items.sort(key=lambda x: (x[4], x[0]), reverse=True); n_sealed = len(items)
        json.dump({"u": updated, "items": items}, open(os.path.join(a.out, "sealed.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    json.dump({"updated": updated, "built": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"), "sets": len(sets_out), "cards": n_cards, "sealed": n_sealed, "priced": len(guide)}, open(os.path.join(a.out, "meta.json"), "w"), separators=(",", ":"))
    print(f"sets={len(sets_out)} cards={n_cards} sealed={n_sealed} priceGuide={len(guide)} updated={updated}")

if __name__ == "__main__":
    main()
