#!/usr/bin/env python3
"""Build index.html from src/template.html + content/.

  python3 tools/build.py          build index.html (stops with a plain message if content is broken)
  python3 tools/build.py --check  exit 1 if index.html is not what the content would build

Edit content/ (words, checklists, documents) or src/template.html (layout, code).
Never edit index.html by hand: it is overwritten on every build.
"""
import json, os, re, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = os.path.join(ROOT, "content")
errors, warnings = [], []

def read(path, base=C): return open(os.path.join(base, path), encoding="utf-8").read()
def exists(path): return os.path.exists(os.path.join(C, path))
def load(path, base=C):
    try: return json.loads(read(path, base))
    except FileNotFoundError: errors.append(f"missing file: {path}")
    except json.JSONDecodeError as e: errors.append(f"{path}: not valid JSON (line {e.lineno}: {e.msg})")
    return None
def js(obj): return json.dumps(obj, ensure_ascii=False).replace("</script", "<\\/script").replace("<!--", "<\\!--")
def ordered(preferred, available):
    seen = [k for k in preferred if k in available]
    return seen + [k for k in available if k not in seen]
def join_html(text):
    out = ""
    for l in (x.strip("\r").lstrip(" \t") for x in text.split("\n")):
        if not l.strip(): continue
        if out and not out.endswith(">") and not l.startswith("<"): out += " "
        out += l
    return out

site = load("site.json") or {}
keys = site.get("pages", [])
if not keys: errors.append("site.json: \"pages\" is empty")
for d in sorted(os.listdir(os.path.join(C, "pages"))):
    if os.path.isdir(os.path.join(C, "pages", d)) and d not in keys:
        warnings.append(f"content/pages/{d} is not listed in site.json, so it is not shown")

PAGES = []
for k in keys:
    meta = load(f"pages/{k}/page.json") or {}
    if meta.get("key") != k: errors.append(f"pages/{k}/page.json: \"key\" must be \"{k}\"")
    if not meta.get("label"): errors.append(f"pages/{k}/page.json: missing \"label\"")
    if meta.get("parent") and meta["parent"] not in keys: errors.append(f"pages/{k}/page.json: parent \"{meta['parent']}\" is not a page")
    p = dict(meta)
    if exists(f"pages/{k}/en.md"): p["md"] = read(f"pages/{k}/en.md")
    else: errors.append(f"missing file: pages/{k}/en.md")
    if exists(f"pages/{k}/es.md"): p["mdEs"] = read(f"pages/{k}/es.md")
    else: warnings.append(f"pages/{k} has no Spanish text (es.md)")
    PAGES.append(p)

def per_page(var):
    spec = site.get("perPage", {}).get(var)
    if not spec: errors.append(f"site.json: perPage has no entry for {var}"); return {}
    out = {}
    for k in ordered(spec.get("order", []), keys):
        f = f"pages/{k}/{spec['file']}"
        if not exists(f): continue
        v = load(f)
        if v is None: continue
        if spec["file"] == "checklist.json":
            steps = v.get("steps", [])
            for n, s in enumerate(steps):
                if not (isinstance(s, dict) and s.get("en") and s.get("es") and isinstance(s.get("done"), bool)):
                    errors.append(f"{f}: step {n+1} needs \"done\" (true/false), \"en\" and \"es\"")
            if not 4 <= len(steps) <= 7: warnings.append(f"{f} has {len(steps)} steps (Tisa's rule: 4-7 high-level milestones)")
            v = {("items" if a == "steps" else a): ([[1 if s.get("done") else 0, s.get("en", ""), s.get("es", "")] for s in b if isinstance(s, dict)] if a == "steps" else b) for a, b in v.items()}
        if spec["file"] == "documents.json":
            if not isinstance(v, list): errors.append(f"{f}: must be a list"); continue
            for n, x in enumerate(v):
                if not (isinstance(x, dict) and x.get("title") and x.get("id")): errors.append(f"{f}: entry {n+1} needs \"title\" and \"id\"")
        out[k] = v
    return out

HTML = {}
for base, _, files in os.walk(C):
    for f in sorted(files):
        if f.endswith(".html"):
            rel = os.path.relpath(os.path.join(base, f), C).replace(os.sep, "/"); HTML[rel] = join_html(read(rel))
for rel in list(HTML):
    m = re.match(r"(.*)\.(en|es)\.html$", rel)
    if m and f"{m.group(1)}.{'es' if m.group(2) == 'en' else 'en'}.html" not in HTML:
        errors.append(f"{rel} has no matching {'Spanish' if m.group(2) == 'en' else 'English'} file (both must exist)")

T = read("src/template.html", ROOT)
for u in sorted(set(re.findall(r'"(pages/[^"]+\.html)"', T)) - set(HTML)): errors.append(f"template uses {u} but content/{u} is missing")

def sub(m):
    kind, arg = m.group(1), m.group(3)
    if kind == "HTML": return js(dict(sorted(HTML.items())))
    if kind == "PAGES": return js(PAGES)
    if kind == "PERPAGE": return js(per_page(arg))
    if kind == "JSON": return js(load(arg))
    if kind == "JSONFILE": return js(load(arg, ROOT))
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
target = os.path.join(ROOT, "index.html")
if "--check" in sys.argv:
    same = os.path.exists(target) and open(target, encoding="utf-8").read() == out
    print("index.html is up to date" if same else "index.html is OUT OF DATE: run python3 tools/build.py")
    sys.exit(0 if same else 1)
open(target, "w", encoding="utf-8").write(out)
print(f"built index.html ({len(out):,} bytes) from {len(keys)} pages and {len(HTML)} html blocks")
