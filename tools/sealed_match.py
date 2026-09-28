"""Match Cardmarket sealed products to TCGplayer catalogue products (for product images).
Conservative: only confident matches are kept; everything else keeps the category icon in the app."""
import math, re, unicodedata
from collections import Counter

GENERIC = {"pokemon", "the", "and", "of", "tcg", "trading", "card", "game", "english", "en", "international", "edition", "set", "product", "products"}

def norm(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    s = s.replace("&", " and ").replace("é", "e")
    s = re.sub(r"\bpok[e]?mon\b", " ", s)
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return s.strip()

def ptype(name, cat=""):
    n = " " + norm(name) + " "; c = (cat or "").lower()
    if " case " in n or n.endswith(" case "): return "case"
    if "elite trainer box" in n or "elite trainer" in c: return "etb"
    if "booster bundle" in n: return "bundle"
    if "build and battle" in n or "build battle" in n: return "bb"
    if "booster box" in n or "booster display" in n or "display" in c: return "bbox"
    if "blister" in n or "checklane" in n or "blister" in c: return "blister"
    if re.search(r"\btins?\b", n) or "tin" in c: return "tin"
    if "coin" in n or "coin" in c: return "coin"
    if "deck" in n or "theme deck" in c or "starter" in n: return "deck"
    if "sleeved booster" in n or "booster pack" in n or re.search(r" booster $", n) or c.endswith("booster"): return "pack"
    return "box"

TYPE_WORDS = {"elite", "trainer", "box", "boxes", "booster", "boosters", "bundle", "display", "pack", "packs", "sleeved", "blister", "blisters", "tin", "tins", "coin", "coins",
              "deck", "decks", "theme", "collection", "build", "battle", "case", "checklane", "premium", "special"}

def toks(name):
    return [t for t in norm(name).split() if t not in GENERIC]

def match(cm_items, tp_items, tp_groups):
    """cm_items: [(idProduct, name, categoryName)], tp_items: [[pid, gid, name, img]] -> {idProduct: img}"""
    df = Counter()
    docs = []
    for pid, gid, name, img in tp_items:
        tk = set(toks(name)) | set(toks((tp_groups.get(gid) or [None, None, ""])[2].split(":")[-1]))
        docs.append((pid, name, img, ptype(name), tk)); df.update(tk)
    N = len(docs) or 1
    idf = lambda t: math.log(1 + N / (1 + df.get(t, 0)))
    by_type = {}
    for d in docs: by_type.setdefault(d[3], []).append(d)
    out = {}
    for cid, name, cat in cm_items:
        ty = ptype(name, cat)
        if ty == "coin": continue
        cand = by_type.get(ty, [])
        a = set(toks(name))
        core = {t for t in a if t not in TYPE_WORDS}
        if not core: continue
        best, second, best_key = (0, None), 0, None
        for pid, tname, img, tty, tk in cand:
            inter = core & tk
            if not inter: continue
            # every distinctive word of the Cardmarket name should appear on the TCGplayer side
            missing = sum(idf(t) for t in core - tk)
            extra = sum(idf(t) for t in (set(toks(tname)) - a) - TYPE_WORDS)
            sc = sum(idf(t) for t in inter) / (sum(idf(t) for t in inter) + missing + 0.6 * extra + 1e-9)
            sc += 0.02 * len(a & set(toks(tname)) & TYPE_WORDS)  # tie-break: same wording ("sleeved", "premium" …)
            key = " ".join(sorted(toks(tname)))
            if sc > best[0]:
                if key != best_key: second = best[0]
                best, best_key = (sc, img), key
            elif sc > second and key != best_key: second = sc
        if best[1] and best[0] >= 0.72 and best[0] - second >= 0.05:
            out[cid] = best[1]
    return out
