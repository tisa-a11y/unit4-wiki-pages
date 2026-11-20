#!/usr/bin/env python3
"""Build index.html from src/template.html + content/.

  python3 tools/build.py          build index.html (stops with a plain error if content is broken)
  python3 tools/build.py --check  exit 1 if index.html is not what the content would build

Edit content/ (words, checklists, documents) or src/template.html (layout, code).
Never edit index.html by hand: it is overwritten on every build.
"""
import json, os, re, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = os.path.join(ROOT, "content")
errors, warnings = [], []

def read(path, base=C):
    return open(os.path.join(base, path), encoding="utf-8").read()
def load(path, base=C):
    try: return json.loads(read(path, base))
    except FileNotFoundError: errors.append(f"missing file: {path}")
    except json.JSONDecodeError as e: errors.append(f"{path}: not valid JSON (line {e.lineno}: {e.msg})")
    return None
def exists(path): return os.path.exists(os.path.join(C, path))
def js(obj):
    return json.dumps(obj, ensure_ascii=False).replace("</script", "<\\/script").replace("<!--", "<\\!--")
def ordered(preferred, available):
    seen = [k for k in preferred if k in available]
    return seen + [k for k in available if k not in seen]

def join_html(text, name):
    lines = [l.strip("\r") for l in text.split("\n")]
    lines = [l.lstrip(" \t") for l in lines if l.strip()]
    out = ""
    for l in lines:
        if out and not out.endswith(">") and not l.startswith("<"): out += " "
        out += l
    return out

site = load("site.json") or {"pages": []}
page_keys = site.get("pages", [])
all_dirs = sorted(d for d in os.listdir(os.path.join(C, "pages")) if os.path.isdir(os.path.join(C, "pages", d)))
for d in all_dirs:
    if d not in page_keys and d != "home": warnings.append(f"content/pages/{d} exists but is not listed in site.json, so it is not shown")

def page(key):
    meta = load(f"pages/{key}/page.json") or {}
    if meta.get("key") != key: errors.append(f"pages/{key}/page.json: \"key\" must be \"{key}\"")
    if not meta.get("label"): errors.append(f"pages/{key}/page.json: missing \"label\"")
    p = {k: v for k, v in meta.items() if k != "es"}
    if exists(f"pages/{key}/en.md"): p["md"] = read(f"pages/{key}/en.md")
    else: errors.append(f"missing file: pages/{key}/en.md")
    return p, meta.get("es", {})

PAGES, ES_EXTRA = [], {}
for k in page_keys:
    p, es = page(k); PAGES.append(p); ES_EXTRA[k] = es
    if p.get("parent") and p["parent"] not in page_keys: errors.append(f"pages/{k}/page.json: parent \"{p['parent']}\" is not a page")
HOME, ES_EXTRA["home"] = page("home")

keys_all = ["home"] + page_keys
PAGE_ES = {}
for k in ordered(site.get("spanishOrder", []), keys_all):
    e = dict(ES_EXTRA.get(k, {}))
    if exists(f"pages/{k}/es.md"): e = {"mdEs": read(f"pages/{k}/es.md"), **e}
    if e: PAGE_ES[k] = e

DOCS = {}
for k in ordered(site.get("documentsOrder", []), keys_all):
    if exists(f"pages/{k}/documents.json"):
        d = load(f"pages/{k}/documents.json")
        if isinstance(d, list):
            for n, x in enumerate(d):
                if not (isinstance(x, dict) and x.get("title") and x.get("id")): errors.append(f"pages/{k}/documents.json: entry {n+1} needs \"title\" and \"id\"")
            DOCS[k] = d
        elif d is not None: errors.append(f"pages/{k}/documents.json: must be a list")

CHECKLISTS = {}
for k in ordered(site.get("checklistsOrder", []), keys_all):
    if not exists(f"pages/{k}/checklist.json"): continue
    c = load(f"pages/{k}/checklist.json")
    if not c: continue
    steps = c.get("steps", [])
    for n, s in enumerate(steps):
        if not (isinstance(s, dict) and s.get("en") and s.get("es") and isinstance(s.get("done"), bool)):
            errors.append(f"pages/{k}/checklist.json: step {n+1} needs \"done\" (true/false), \"en\" and \"es\"")
    if not 4 <= len(steps) <= 7: warnings.append(f"pages/{k}/checklist.json has {len(steps)} steps (Tisa's rule: 4-7 high-level milestones)")
    out = {x: v for x, v in c.items() if x not in ("note", "steps")}
    out["noteEn"] = c.get("note", {}).get("en", ""); out["noteEs"] = c.get("note", {}).get("es", "")
    out["items"] = [[1 if s.get("done") else 0, s.get("en", ""), s.get("es", "")] for s in steps if isinstance(s, dict)]
    CHECKLISTS[k] = out

HTML = {}
for base, _, files in os.walk(C):
    for f in sorted(files):
        if f.endswith(".html"):
            rel = os.path.relpath(os.path.join(base, f), C).replace(os.sep, "/")
            HTML[rel] = join_html(read(rel), rel)
for rel in list(HTML):
    m = re.match(r"(.*)\.(en|es)\.html$", rel)
    if m:
        other = f"{m.group(1)}.{'es' if m.group(2) == 'en' else 'en'}.html"
        if other not in HTML: errors.append(f"{rel} has no matching {other} (English and Spanish must both exist)")

T = read("src/template.html", ROOT)
used_html = set(re.findall(r'"(pages/[^"]+\.html)"', T))
for u in sorted(used_html - set(HTML)): errors.append(f"template uses {u} but content/{u} is missing")

def sub(m):
    kind, arg = m.group(1), m.group(3)
    if kind == "HTML": return js(dict(sorted(HTML.items())))
    if kind == "PAGES": return js(PAGES)
    if kind == "HOME": return js(HOME)
    if kind == "PAGE_ES": return js(PAGE_ES)
    if kind == "DOCS": return js(DOCS)
    if kind == "CHECKLISTS": return js(CHECKLISTS)
    if kind == "JSON": return js(load(arg))
    if kind == "JSONFILE": return js(load(arg, ROOT))
    if kind == "BUILD": return "@@BUILDSTAMP@@"
    if kind == "RAW":
        if not exists(arg): errors.append(f"missing file: {arg}"); return ""
        return read(arg).rstrip("\n")
    errors.append(f"template: unknown placeholder {m.group(0)}"); return ""
out = re.sub(r"@@U4:([A-Z_]+)(:([^@]+))?@@", sub, T)

if not errors:
    m = re.search(r"<script>\n(.*)\n</script>", out, re.S)
    if not m: errors.append("template: main <script> block not found")
    else:
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f: f.write(m.group(1)); tmp = f.name
        try:
            r = subprocess.run(["node", "--check", tmp], capture_output=True, text=True)
            if r.returncode: errors.append("the built page has a JavaScript syntax error:\n" + r.stderr.strip()[:600])
        except FileNotFoundError: warnings.append("node not installed: JavaScript syntax check skipped")
        finally: os.unlink(tmp)

for x in warnings: print("warning:", x)
if errors:
    print("BUILD STOPPED - index.html was NOT changed. Fix these and run again:")
    for x in errors: print("  -", x)
    sys.exit(1)
import hashlib, datetime
stamp = "Build " + hashlib.sha256(out.encode("utf-8")).hexdigest()[:7]
out = out.replace("@@BUILDSTAMP@@", stamp)
target = os.path.join(ROOT, "index.html")
if "--check" in sys.argv:
    same = os.path.exists(target) and open(target, encoding="utf-8").read() == out
    print("index.html is up to date" if same else "index.html is OUT OF DATE: run python3 tools/build.py")
    sys.exit(0 if same else 1)
open(target, "w", encoding="utf-8").write(out)
print(f"built index.html, {stamp} ({len(out):,} bytes) from {len(page_keys)+1} pages, {len(HTML)} html blocks, {sum(len(v) for v in DOCS.values())} documents")
