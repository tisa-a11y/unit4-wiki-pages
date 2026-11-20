#!/usr/bin/env python3
"""Convert a hand-edited single-file index.html into src/template.html + content/.

Run once at switchover (or again later if someone edited index.html by hand):
  python3 tools/extract_from_index.py [path/to/index.html]
Steps whose pattern is not found are skipped and reported; nothing is guessed.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "index.html")
L = open(src, encoding="utf-8").read().split("\n")
C = os.path.join(ROOT, "content")
notes = []

def w(path, text):
    p = os.path.join(C, path); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w", encoding="utf-8").write(text)
def wj(path, obj): w(path, json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
def find(pred, start=0):
    for i in range(start, len(L)):
        if pred(L[i]): return i
    return None
def json_line(prefix, suffix=";"):
    i = find(lambda s: s.startswith(prefix))
    if i is None: notes.append(f"not found, left in template: {prefix.strip()}"); return None, None
    body = L[i][len(prefix):].rstrip()
    if not body.endswith(suffix): notes.append(f"unexpected shape, left in template: {prefix.strip()}"); return None, None
    try: return i, json.loads(body[: -len(suffix)])
    except json.JSONDecodeError: notes.append(f"not plain JSON, left in template: {prefix.strip()}"); return None, None

site = {"_readme": "Menu order and the order of per-page data. Add a page: create content/pages/<key>/ and add the key to \"pages\"."}

# ---- pages (single store: md = English, mdEs = Spanish) ----
iP, PAGES = json_line("const PAGES = ")
if PAGES is None: raise SystemExit("extract: const PAGES not found; nothing written")
site["pages"] = [p["key"] for p in PAGES]
for p in PAGES:
    k = p["key"]
    assert list(p)[-len([x for x in ("md", "mdEs") if x in p]):] == [x for x in ("md", "mdEs") if x in p], f"{k}: md/mdEs not last"
    wj(f"pages/{k}/page.json", {a: b for a, b in p.items() if a not in ("md", "mdEs")})
    if "md" in p: w(f"pages/{k}/en.md", p["md"])
    if "mdEs" in p: w(f"pages/{k}/es.md", p["mdEs"])
L[iP] = "const U4_HTML = @@U4:HTML@@;\nconst PAGES = @@U4:PAGES@@;"

# ---- data keyed by page -> one small file in each page folder ----
PER_PAGE = [("const DOCS = ", "documents.json"), ("const CHECKLISTS = ", "checklist.json"),
            ("const ROOM_KEY_FACTS = ", "key-facts.json"), ("const UNIFIED_VISUALS = ", "visuals.json")]
site["perPage"] = {}
for prefix, fname in PER_PAGE:
    i, obj = json_line(prefix)
    if obj is None: continue
    var = prefix.split()[1]
    if not set(obj) <= set(site["pages"]): notes.append(f"{var}: has keys that are not pages, left in template"); continue
    for k, v in obj.items():
        if fname == "checklist.json":
            v = {("steps" if a == "items" else a): ([{"done": bool(it[0]), "en": it[1], "es": it[2]} for it in b] if a == "items" else b) for a, b in v.items()}
        wj(f"pages/{k}/{fname}", v)
    site["perPage"][var] = {"file": fname, "order": list(obj)}
    L[i] = f"{prefix}@@U4:PERPAGE:{var}@@;"

# ---- shared data ----
for prefix, path in [("const HOURS = ", "data/labor-hours.json"), ("const PDF_BLOBS = ", "data/pdf-files.json"), ("const DOC_DATES = ", "data/document-dates.json")]:
    i, obj = json_line(prefix)
    if obj is not None: wj(path, obj); L[i] = f"{prefix}@@U4:JSON:{path}@@;"
i, TODO = json_line("    var U4_TODOIST_MEMORY = ")
if TODO is not None:
    disk = os.path.join(ROOT, "wiki-docs/todoist-sync-index.json")
    if os.path.exists(disk) and json.load(open(disk, encoding="utf-8")) == TODO:
        L[i] = "    var U4_TODOIST_MEMORY = @@U4:JSONFILE:wiki-docs/todoist-sync-index.json@@;"
    else:
        wj("data/todoist-mirror.json", TODO); L[i] = "    var U4_TODOIST_MEMORY = @@U4:JSON:data/todoist-mirror.json@@;"
        notes.append("embedded Todoist mirror differs from wiki-docs/todoist-sync-index.json; kept the embedded copy in content/data/todoist-mirror.json")

# ---- HTML written inside code -> content/pages/<page>/*.html ----
LIT = re.compile(r"^(\s*(?:return |\+ |\? |: |if \(LANG===\"es\"\) return )?)'((?:[^'\\]|\\.)*)'(;?)\s*$")
kill = set()
def run(i):
    out = []
    while True:
        m = LIT.match(L[i])
        if not m or "\\" in m.group(2).replace("\\'", ""): return None, i
        out.append((m.group(1).strip(), m.group(2).replace("\\'", "'")))
        if m.group(3): return out, i
        i += 1
def html_out(name, rows): w(name, "\n".join(b for _, b in rows) + "\n")

def two_returns(fn, base):
    g = find(lambda s: s.startswith(f"function {fn}(){{"))
    if g is None: notes.append(f"{fn}: not found, left in template"); return
    ge = find(lambda s: s == "}", g)
    a = find(lambda s: "return '" in s, g)
    es_rows, e1 = run(a) if a is not None else (None, g)
    b = find(lambda s: "return '" in s, e1 + 1)
    en_rows, e2 = run(b) if b is not None else (None, g)
    if not es_rows or not en_rows or e2 >= ge: notes.append(f"{fn}: not plain text, left in template"); return
    html_out(f"{base}.es.html", es_rows); html_out(f"{base}.en.html", en_rows)
    L[g] = f'function {fn}(){{ return U4_HTML[LANG==="es" ? "{base}.es.html" : "{base}.en.html"]; }}'
    kill.update(range(g + 1, ge + 1))
two_returns("goalsBlock", "pages/home/this-week")
two_returns("aboutBlock", "pages/home/about")

i = 0; n_blocks = {}
while True:
    i = find(lambda s: s.strip() == "h += es", i)
    if i is None: break
    j = i - 1
    while j > 0 and not re.search(r'p\.key===\"([a-z-]+)\"\) \{', L[j]): j -= 1
    m = re.search(r'p\.key===\"([a-z-]+)\"\) \{', L[j])
    rows, end = run(i + 1)
    if not m or not rows or rows[0][0] != "?" or ":" not in [r[0] for r in rows]:
        notes.append(f"line {i+1}: 'h += es' block not plain text, left in template"); i += 1; continue
    key = m.group(1); n_blocks[key] = n_blocks.get(key, 0) + 1
    base = f"pages/{key}/block-{n_blocks[key]}"
    split = [r[0] for r in rows].index(":")
    html_out(base + ".es.html", rows[:split]); html_out(base + ".en.html", rows[split:])
    ind = L[i][: len(L[i]) - len(L[i].lstrip())]
    L[i] = f'{ind}h += U4_HTML[es ? "{base}.es.html" : "{base}.en.html"];'
    kill.update(range(i + 1, end + 1)); i = end + 1

# ---- larger hand-written lists -> content/data/*.js (kept word for word) ----
def raw_block(start, end_line, name):
    s = find(lambda x: x.startswith(start))
    e = find(lambda x: x == end_line, s) if s is not None else None
    if e is None: notes.append(f"not found, left in template: {start.strip()}"); return
    w(name, "\n".join(L[s:e + 1]) + "\n"); L[s] = f"@@U4:RAW:{name}@@"; kill.update(range(s + 1, e + 1))
raw_block("var DEFAULT_OPEN_DECISIONS = [", "];", "data/project-planning-decisions.js")
raw_block("  var U4_CONCEPT_RENDERS = {", "  };", "data/concept-renders.js")

wj("site.json", site)
T = "\n".join(x for n, x in enumerate(L) if n not in kill)
os.makedirs(os.path.join(ROOT, "src"), exist_ok=True)
open(os.path.join(ROOT, "src/template.html"), "w", encoding="utf-8").write(T)
print(f"extracted {len(PAGES)} pages -> content/ ; template {len(T):,} bytes")
for n in notes: print("  note:", n)
