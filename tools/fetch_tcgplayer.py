#!/usr/bin/env python3
"""Fetch sealed Pokémon products (boxes, ETBs, blisters, tins …) with product images from TCGCSV
(a free daily mirror of the TCGplayer catalogue, https://tcgcsv.com). Singles are skipped.

Output: JSON {cats:{id:name}, groups:[[gid,cat,name,abbr,published]], items:[[productId,gid,name,imageUrl]]}
"""
import json, sys, time, urllib.request

BASE = "https://tcgcsv.com/tcgplayer"
UA = {"User-Agent": "StudyOS collector data build (github.com/Mr11-Study/studyos)"}

def get(url, tries=3):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return json.load(r)
        except Exception as e:
            if i == tries - 1: raise
            time.sleep(2 + 3 * i)

def is_single(p):
    ext = {e.get("name"): e.get("value") for e in p.get("extendedData") or []}
    return bool(ext.get("Number") or ext.get("Rarity") or ext.get("CardType") or ext.get("HP"))

def main(out):
    cats = get(BASE + "/categories")["results"]
    poke = {c["categoryId"]: c["name"] for c in cats if "pokemon" in (c.get("name") or "").lower() and "pocket" not in (c.get("name") or "").lower()}
    groups, items = [], []
    for cid in poke:
        for g in get(f"{BASE}/{cid}/groups")["results"]:
            groups.append([g["groupId"], cid, g.get("name"), g.get("abbreviation"), (g.get("publishedOn") or "")[:10]])
            try: prods = get(f"{BASE}/{cid}/{g['groupId']}/products")["results"]
            except Exception as e: print("skip group", g["groupId"], e, file=sys.stderr); continue
            for p in prods:
                if is_single(p) or not p.get("imageUrl"): continue
                items.append([p["productId"], g["groupId"], p.get("name"), p.get("imageUrl")])
            time.sleep(0.05)
    json.dump({"cats": poke, "groups": groups, "items": items}, open(out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"categories={list(poke.values())} groups={len(groups)} sealed={len(items)}")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "tcgp.json")
