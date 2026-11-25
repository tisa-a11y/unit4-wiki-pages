#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Compile Unit 4 Crew Wiki (index.html) from src/template.html + content/*.
100% Python 3.9+ stdlib compatible (AST JoinedStr == 0, zero PEP 604 unions, raw regexes).
"""
import json
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = os.path.join(ROOT, "content")
errors, warnings = [], []


def read(path, base=C):
    with open(os.path.join(base, path), encoding="utf-8") as fh:
        return fh.read()


def exists(path):
    return os.path.exists(os.path.join(C, path))


def load(path, base=C):
    try:
        return json.loads(read(path, base))
    except FileNotFoundError:
        errors.append("missing file: " + path)
    except json.JSONDecodeError as e:
        errors.append(path + ": not valid JSON (line " + str(e.lineno) + ": " + str(e.msg) + ")")
    return None


def js(obj):
    return json.dumps(obj, ensure_ascii=False).replace("</script", "<\\/script").replace("<!--", "<\\!--")


def ordered(preferred, available):
    seen = [k for k in preferred if k in available]
    return seen + [k for k in available if k not in seen]


def join_html(text):
    out = ""
    for l in (x.strip("\r").lstrip(" \t") for x in text.split("\n")):
        if not l.strip():
            continue
        if out and not out.endswith(">") and not l.startswith("<"):
            out += " "
        out += l
    return out


site = load("site.json") or {}
keys = site.get("pages", [])
if not keys:
    errors.append('site.json: "pages" is empty')
for d in sorted(os.listdir(os.path.join(C, "pages"))):
    if os.path.isdir(os.path.join(C, "pages", d)) and d not in keys:
        warnings.append("content/pages/" + d + " is not listed in site.json, so it is not shown")

PAGES = []
for k in keys:
    meta = load("pages/" + k + "/page.json") or {}
    if meta.get("key") != k:
        errors.append("pages/" + k + '/page.json: "key" must be "' + k + '"')
    if not meta.get("label"):
        errors.append("pages/" + k + '/page.json: missing "label"')
    if meta.get("parent") and meta["parent"] not in keys:
        errors.append("pages/" + k + '/page.json: parent "' + str(meta["parent"]) + '" is not a page')
    p = dict(meta)
    if exists("pages/" + k + "/en.md"):
        p["md"] = read("pages/" + k + "/en.md")
    else:
        errors.append("missing file: pages/" + k + "/en.md")
    if exists("pages/" + k + "/es.md"):
        p["mdEs"] = read("pages/" + k + "/es.md")
    else:
        warnings.append("pages/" + k + " has no Spanish text (es.md)")
    if exists("pages/" + k + "/ru.md"):
        p["mdRu"] = read("pages/" + k + "/ru.md")
    else:
        warnings.append("pages/" + k + " has no Russian text (ru.md)")
    PAGES.append(p)


def per_page(var):
    spec = site.get("perPage", {}).get(var)
    if not spec:
        errors.append("site.json: perPage has no entry for " + var)
        return {}
    out = {}
    for k in ordered(spec.get("order", []), keys):
        f = "pages/" + k + "/" + spec["file"]
        if not exists(f):
            continue
        v = load(f)
        if v is None:
            continue
        if spec["file"] == "checklist.json":
            steps = v.get("steps", [])
            for n, s in enumerate(steps):
                if not (isinstance(s, dict) and s.get("en") and s.get("es") and s.get("ru") and isinstance(s.get("done"), bool)):
                    errors.append(f + ": step " + str(n + 1) + ' needs "done" (true/false), "en", "es" and "ru"')
                if isinstance(s, dict) and (s.get("statusEn") or s.get("statusEs")) and not s.get("statusRu"):
                    warnings.append(f + ": step " + str(n + 1) + ' has statusEn/statusEs without "statusRu"')
            if not 4 <= len(steps) <= 7:
                warnings.append(f + " has " + str(len(steps)) + " steps (Tisa's rule: 4-7 high-level milestones)")
            if "items" in v and "steps" in v:
                warnings.append(f + ' has both "steps" and legacy "items"; ignoring legacy "items"')
            compiled_items = []
            for s in steps:
                if not isinstance(s, dict):
                    continue
                row = [1 if s.get("done") else 0, s.get("en", ""), s.get("es", ""), s.get("ru", s.get("en", ""))]
                if s.get("statusEn") or s.get("statusEs") or s.get("statusRu"):
                    row.append({
                        "statusEn": s.get("statusEn", ""),
                        "statusEs": s.get("statusEs", s.get("statusEn", "")),
                        "statusRu": s.get("statusRu", s.get("statusEn", "")),
                    })
                compiled_items.append(row)
            new_v = {}
            for a, b in v.items():
                if a in ("steps", "items"):
                    continue
                new_v[a] = b
            if (new_v.get("statusEn") or new_v.get("statusEs")) and not new_v.get("statusRu"):
                warnings.append(f + ': top-level statusEn/statusEs is missing "statusRu"')
            new_v["items"] = compiled_items
            v = new_v
        if spec["file"] == "key-facts.json":
            if not isinstance(v, list):
                errors.append(f + ": must be a list")
                continue
            for n, x in enumerate(v):
                for req in ("kEn", "kEs", "kRu", "vEn", "vEs", "vRu"):
                    if not (isinstance(x, dict) and req in x):
                        errors.append(f + ": entry " + str(n + 1) + ' needs "' + req + '"')
                if isinstance(x, dict) and (x.get("statusEn") or x.get("statusEs")) and not x.get("statusRu"):
                    warnings.append(f + ": entry " + str(n + 1) + ' has statusEn/statusEs without "statusRu"')
        if spec["file"] == "documents.json":
            if not isinstance(v, list):
                errors.append(f + ": must be a list")
                continue
            for n, x in enumerate(v):
                if not (isinstance(x, dict) and x.get("title") and x.get("id")):
                    errors.append(f + ": entry " + str(n + 1) + ' needs "title" and "id"')
                if isinstance(x, dict) and not x.get("titleRu"):
                    warnings.append(f + ": entry " + str(n + 1) + ' (' + str(x.get("id", "")) + ') is missing "titleRu"')
        out[k] = v
    return out


HTML = {}
for base, _, files in os.walk(C):
    for f in sorted(files):
        if f.endswith(".html"):
            rel = os.path.relpath(os.path.join(base, f), C).replace(os.sep, "/")
            HTML[rel] = join_html(read(rel))
for rel in list(HTML):
    m = re.match(r"(.*)\.(en|es|ru)\.html$", rel)
    if m:
        stem = m.group(1)
        for req_lang in ("en", "es", "ru"):
            mate = stem + "." + req_lang + ".html"
            if mate not in HTML:
                errors.append(rel + " has no matching " + mate + " (en, es, and ru must all exist)")

if exists("packets.json"):
    seen = set()
    for n, pk in enumerate(load("packets.json") or []):
        name = pk.get("key") or ("entry " + str(n + 1))
        for fld in ("key", "room", "titleEn", "titleEs", "titleRu", "docEn", "docEs"):
            if not pk.get(fld):
                errors.append("packets.json: " + name + ' is missing "' + fld + '" (every packet needs EN, ES, and RU)')
        if pk.get("room") and pk["room"] not in keys:
            errors.append("packets.json: " + name + ': room "' + str(pk["room"]) + '" is not a page')
        if pk.get("key") in seen or pk.get("key") in keys:
            errors.append('packets.json: key "' + name + '" is used twice or is also a page name')
        seen.add(pk.get("key"))

T = read("src/template.html", ROOT)
for u in sorted(set(re.findall(r'"(pages/[^"]+\.html)"', T)) - set(HTML)):
    errors.append("template uses " + u + " but content/" + u + " is missing")


def sub(m):
    kind, arg = m.group(1), m.group(3)
    if kind == "HTML":
        return js(dict(sorted(HTML.items())))
    if kind == "PAGES":
        return js(PAGES)
    if kind == "PERPAGE":
        return js(per_page(arg))
    if kind == "JSON":
        return js(load(arg))
    if kind == "JSONFILE":
        return js(load(arg, ROOT))
    if kind == "RAW":
        if not exists(arg):
            errors.append("missing file: " + arg)
            return ""
        return read(arg).rstrip("\n")
    errors.append("template: unknown placeholder " + m.group(0))
    return ""


out = re.sub(r"@@U4:([A-Z_]+)(:([^@]+))?@@", sub, T)

if not errors:
    inline_scripts = re.findall(r"<script>\n(.*?)\n</script>", out, re.S)
    if not inline_scripts:
        errors.append("template: main <script> block not found")
    else:
        for idx_sc, sc_body in enumerate(inline_scripts, 1):
            with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
                f.write(sc_body)
                tmp = f.name
            try:
                node_bin = "/opt/homebrew/bin/node" if os.path.exists("/opt/homebrew/bin/node") else ("/usr/local/bin/node" if os.path.exists("/usr/local/bin/node") else "node")
                r = subprocess.run([node_bin, "--check", tmp], capture_output=True, text=True)
                if r.returncode:
                    errors.append("inline <script> #" + str(idx_sc) + " JavaScript syntax error:\n" + r.stderr.strip()[:600])
            except FileNotFoundError:
                warnings.append("node not installed: JavaScript syntax check skipped")
            finally:
                os.unlink(tmp)

for x in warnings:
    print("warning:", x)
if errors:
    print("BUILD STOPPED - index.html was NOT changed. Fix these and run again:")
    for x in errors:
        print("  -", x)
    sys.exit(1)
target = os.path.join(ROOT, "index.html")
if "--check" in sys.argv:
    same = os.path.exists(target) and read("index.html", ROOT) == out
    print("index.html is up to date" if same else "index.html is OUT OF DATE: run python3 tools/build.py")
    sys.exit(0 if same else 1)
with open(target, "w", encoding="utf-8") as out_fh:
    out_fh.write(out)
print("built index.html (" + format(len(out), ",") + " bytes) from " + str(len(keys)) + " pages and " + str(len(HTML)) + " html blocks")
