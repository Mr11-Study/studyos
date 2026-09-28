#!/usr/bin/env python3
"""Diagnostics for the data build: which image URL patterns exist (written to src/probe.json)."""
import json, sys, urllib.request
URLS = [
  "https://assets.tcgdex.net/ja/SV/SV2a/006/high.webp", "https://assets.tcgdex.net/ja/SV/SV2a/006/high.png", "https://assets.tcgdex.net/ja/SV/SV2a/006/low.webp",
  "https://assets.tcgdex.net/ja/SV/SV2a/logo.webp", "https://assets.tcgdex.net/ja/SV/SV2a/logo.png", "https://assets.tcgdex.net/ko/SV/SV2a/006/high.webp",
  "https://assets.tcgdex.net/ja/M/M1S/001/high.png", "https://assets.tcgdex.net/ja/M/M1S/001/high.webp",
  "https://assets.tcgdex.net/en/sv/sv03.5/199/high.webp", "https://assets.tcgdex.net/de/sv/sv03.5/199/high.webp",
  "https://assets.tcgdex.net/en/me/30th/001/high.webp", "https://assets.tcgdex.net/de/me/30th/001/high.webp",
  "https://tcgplayer-cdn.tcgplayer.com/product/517045_400w.jpg",
]
out = {}
for u in URLS:
    try:
        req = urllib.request.Request(u, method="HEAD", headers={"User-Agent": "Mozilla/5.0 StudyOS probe"})
        with urllib.request.urlopen(req, timeout=20) as r: out[u] = [r.status, r.headers.get("content-type"), r.headers.get("content-length")]
    except Exception as e: out[u] = [getattr(e, "code", None), str(e)[:120]]
json.dump(out, open(sys.argv[1], "w"), indent=1); print(json.dumps(out, indent=1))
