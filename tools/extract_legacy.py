#!/usr/bin/env python3
"""One-time converter: legacy single-file index.html -> src/template.html + content/.

Re-runnable against a newer legacy index.html (same shape) to refresh content/.
Usage: python3 tools/extract_legacy.py path/to/legacy-index.html
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "index.html")
L = open(src, encoding="utf-8").read().split("\n")
C = os.path.join(ROOT, "content")

def w(path, text):
    p = os.path.join(C, path); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w", encoding="utf-8").write(text)
def wj(path, obj):
    w(path, json.dumps(obj, ensure_ascii=False, indent=2) + "\n")

def find(pred, start=0):
    for i in range(start, len(L)):
        if pred(L[i]): return i
    raise SystemExit("extract: pattern not found")

def json_line(prefix, suffix=";"):
    i = find(lambda s: s.startswith(prefix))
    s = L[i]; body = s[len(prefix):]
    assert body.rstrip().endswith(suffix), prefix
    body = body.rstrip()[: -len(suffix)]
    return i, json.loads(body)

# ---------- JSON data lines ----------
iP, PAGES = json_line("const PAGES = ")
iH, HOME = json_line("PAGES.unshift(", ");")
iHr, HOURS = json_line("const HOURS = ")
iD, DOCS = json_line("const DOCS = ")
iB, BLOBS = json_line("const PDF_BLOBS = ")
iDd, DATES = json_line("const DOC_DATES = ")
iE, PAGE_ES = json_line("const PAGE_ES = ")
iW, WEEK = json_line("const WEEK_GOALS = ")
iC, CK = json_line("const CHECKLISTS = ")
iT, TODO = json_line("    var U4_TODOIST_MEMORY = ")

order = []
def page_out(p):
    key = p["key"]; meta = {k: v for k, v in p.items() if k not in ("md", "mdEs")}
    es = PAGE_ES.get(key, {})
    extra_es = {k: v for k, v in es.items() if k != "mdEs"}
    if extra_es: meta["es"] = extra_es
    wj(f"pages/{key}/page.json", meta)
    w(f"pages/{key}/en.md", p.get("md", ""))
    md_es = es.get("mdEs", p.get("mdEs"))
    if md_es is not None: w(f"pages/{key}/es.md", md_es)
    if key in CK:
        c = CK[key]
        out = {k: v for k, v in c.items() if k not in ("items", "noteEn", "noteEs")}
        out["note"] = {"en": c.get("noteEn", ""), "es": c.get("noteEs", "")}
        out["steps"] = [{"done": bool(it[0]), "en": it[1], "es": it[2]} for it in c["items"]]
        for it in c["items"]: assert len(it) == 3 and it[0] in (0, 1), key
        wj(f"pages/{key}/checklist.json", out)
    if key in DOCS: wj(f"pages/{key}/documents.json", DOCS[key])
for p in PAGES:
    order.append(p["key"]); page_out(p)
page_out(HOME)
known = set(order) | {"home"}
assert set(PAGE_ES) <= known and set(CK) <= known and set(DOCS) <= known, "unmapped keys"
wj("site.json", {"_readme": "Order of pages in the menu. 'home' and 'decisions' (Project Planning) are added by the page itself.",
                 "pages": order, "documentsOrder": list(DOCS), "checklistsOrder": list(CK), "spanishOrder": list(PAGE_ES)})
wj("data/labor-hours.json", HOURS)
wj("data/pdf-files.json", BLOBS)
wj("data/document-dates.json", DATES)
wj("pages/home/week-goals-fallback.json", WEEK)
disk = json.load(open(os.path.join(ROOT, "wiki-docs/todoist-sync-index.json"), encoding="utf-8"))
assert disk == TODO, "embedded Todoist mirror differs from wiki-docs/todoist-sync-index.json"

L[iP] = "const U4_HTML = @@U4:HTML@@;\nconst PAGES = @@U4:PAGES@@;"
L[iH] = "PAGES.unshift(@@U4:HOME@@);"
L[iHr] = "const HOURS = @@U4:JSON:data/labor-hours.json@@;"
L[iD] = "const DOCS = @@U4:DOCS@@;"
L[iB] = "const PDF_BLOBS = @@U4:JSON:data/pdf-files.json@@;"
L[iDd] = "const DOC_DATES = @@U4:JSON:data/document-dates.json@@;"
L[iE] = "const PAGE_ES = @@U4:PAGE_ES@@;"
L[iW] = "const WEEK_GOALS = @@U4:JSON:pages/home/week-goals-fallback.json@@;"
L[iC] = "const CHECKLISTS = @@U4:CHECKLISTS@@;"
L[iT] = "    var U4_TODOIST_MEMORY = @@U4:JSONFILE:wiki-docs/todoist-sync-index.json@@;"

# ---------- HTML written inside code -> content/*.html ----------
LIT = re.compile(r"^(\s*(?:return |\+ |\? |: |if \(LANG===\"es\"\) return )?)'((?:[^'\\]|\\.)*)'(;?)\s*$")
def lit(s):
    m = LIT.match(s); assert m, "not a plain literal: " + s[:90]
    body = m.group(2); assert "\\" not in body.replace("\\'", ""), "escape: " + s[:90]
    return m.group(1).strip(), body.replace("\\'", "'"), m.group(3)
def html_out(name, lines):
    for t in lines: assert "\n" not in t
    w(name, "\n".join(lines) + "\n")

kill = set()   # line indexes to delete
def run(i):    # consecutive literal lines starting at i until one ends with ';'
    out = []
    while True:
        pre, body, semi = lit(L[i]); out.append((i, pre, body))
        if semi: return out, i
        i += 1

# goalsBlock
g = find(lambda s: s.startswith("function goalsBlock(){"))
ge = find(lambda s: s == "}", g)
es_run, e1 = run(find(lambda s: s.strip().startswith("return '"), g))
en_run, e2 = run(find(lambda s: s.strip().startswith("return '"), e1 + 1))
assert e2 < ge
html_out("pages/home/this-week.es.html", [b for _, _, b in es_run])
html_out("pages/home/this-week.en.html", [b for _, _, b in en_run])
L[g] = 'function goalsBlock(){ return U4_HTML[LANG==="es" ? "pages/home/this-week.es.html" : "pages/home/this-week.en.html"]; }'
kill.update(range(g + 1, ge + 1))

# aboutBlock
a = find(lambda s: s.startswith("function aboutBlock(){"))
ae = find(lambda s: s == "}", a)
es_run, e1 = run(a + 1); en_run, e2 = run(e1 + 1); assert e2 == ae - 1
html_out("pages/home/about.es.html", [b for _, _, b in es_run])
html_out("pages/home/about.en.html", [b for _, _, b in en_run])
L[a] = 'function aboutBlock(){ return U4_HTML[LANG==="es" ? "pages/home/about.es.html" : "pages/home/about.en.html"]; }'
kill.update(range(a + 1, ae + 1))

# "h += es ? '...' : '...';" blocks inside crewRoom
names = {"kitchen-oven-range": "intro", "hvac": "summary", "kitchen": "subpage-cards", "attic-access": "special-notes"}
i = 0
while True:
    try: i = find(lambda s: s.strip() == "h += es", i)
    except SystemExit: break
    j = i - 1
    while not re.search(r'p\.key===\"([a-z-]+)\"\) \{', L[j]): j -= 1
    key = re.search(r'p\.key===\"([a-z-]+)\"\) \{', L[j]).group(1)
    rows, end = run(i + 1)
    split = next(n for n, (_, pre, _) in enumerate(rows) if pre == ":")
    assert rows[0][1] == "?"
    base = f"pages/{key}/{names[key]}"
    html_out(base + ".es.html", [b for _, _, b in rows[:split]])
    html_out(base + ".en.html", [b for _, _, b in rows[split:]])
    ind = L[i][: len(L[i]) - len(L[i].lstrip())]
    L[i] = f'{ind}h += U4_HTML[es ? "{base}.es.html" : "{base}.en.html"];'
    kill.update(range(i + 1, end + 1))
    i = end + 1

# ---------- raw JS data blocks -> content/data/*.js (verbatim) ----------
def raw_block(start_pred, end_line, name):
    s = find(start_pred); e = find(lambda x: x == end_line, s)
    w(name, "\n".join(L[s:e + 1]) + "\n")
    L[s] = f"@@U4:RAW:{name}@@"; kill.update(range(s + 1, e + 1))
raw_block(lambda s: s.startswith("const PINNED_DOCS = {"), "};", "data/pinned-plans.js")
raw_block(lambda s: s.startswith("const ROOM_CONCEPT = {"), "};", "data/room-concept-images.js")
raw_block(lambda s: s.startswith("const ROOM_GALLERY = {"), "};", "data/room-galleries.js")
raw_block(lambda s: s.startswith("var DEFAULT_OPEN_DECISIONS = ["), "];", "data/project-planning-decisions.js")
raw_block(lambda s: s.startswith("  var U4_CONCEPT_RENDERS = {"), "  };", "data/concept-renders.js")
s = find(lambda x: x.startswith("DOCS.laundry = (DOCS.laundry||[]).concat(["))
e = find(lambda x: x.startswith("// ---- end crew room pages ----"), s) - 1
w("data/documents-extra.js", "\n".join(L[s:e + 1]) + "\n")
L[s] = "@@U4:RAW:data/documents-extra.js@@"; kill.update(range(s + 1, e + 1))

T = "\n".join(x for n, x in enumerate(L) if n not in kill)
os.makedirs(os.path.join(ROOT, "src"), exist_ok=True)
open(os.path.join(ROOT, "src/template.html"), "w", encoding="utf-8").write(T)
print("extracted:", len(order) + 1, "pages; template lines:", T.count("\n") + 1)
