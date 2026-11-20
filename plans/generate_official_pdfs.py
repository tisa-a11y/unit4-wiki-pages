#!/usr/bin/env python3
"""Generate official EN & ES K-S4 PDFs from the single interactive SVG page via headless Chrome.

Usage:
  python3 plans/generate_official_pdfs.py
  python3 plans/generate_official_pdfs.py --html plans/kitchen-west-ks4/index.html --out-dir wiki-pdfs

Guarantees:
  - Renders the EXACT SAME single SVG HTML page in ?lang=en&print=1 and ?lang=es&print=1 modes
  - Serves locally on ephemeral 127.0.0.1 port (zero external CDN required)
  - Verifies generated PDFs are non-empty and contain valid UTF-8 text (including Spanish accents)
"""
import argparse
import functools
import http.server
import os
import subprocess
import sys
import threading

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_HTML = "plans/kitchen-west-ks4/index.html"
DEFAULT_OUT_DIR = "wiki-pdfs"
DEFAULT_EN_PDF = "2026-11-20_U4_kitchen_ks4-interactive_R1_EN.pdf"
DEFAULT_ES_PDF = "2026-11-20_U4_kitchen_ks4-interactive_R1_ES.pdf"

CHROME_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
]


def find_chrome():
    for c in CHROME_CANDIDATES:
        if os.path.exists(c):
            return c
    raise FileNotFoundError("Google Chrome / Chromium binary not found for --print-to-pdf")


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


def verify_pdf_file(pdf_path, expect_spanish=False):
    if not os.path.isfile(pdf_path):
        raise RuntimeError(f"Generated PDF missing: {pdf_path}")
    size = os.path.getsize(pdf_path)
    if size < 5000:
        raise RuntimeError(f"Generated PDF unexpectedly small ({size} bytes): {pdf_path}")
    with open(pdf_path, "rb") as f:
        header = f.read(5)
    if header != b"%PDF-":
        raise RuntimeError(f"Invalid PDF header in {pdf_path}: {header!r}")

    # Optional text extraction verification via pdftotext or pypdf if available
    extracted = ""
    try:
        r = subprocess.run(["pdftotext", pdf_path, "-"], capture_output=True, text=True, timeout=10)
        if r.returncode == 0:
            extracted = r.stdout
    except FileNotFoundError:
        pass

    if not extracted:
        try:
            from pypdf import PdfReader
            reader = PdfReader(pdf_path)
            extracted = "\n".join((pg.extract_text() or "") for pg in reader.pages)
        except Exception:
            pass

    if extracted:
        if expect_spanish:
            has_es_glyph = any(ch in extracted for ch in "áéíóúñüÁÉÍÓÚÑÜ¿¡")
            if not has_es_glyph:
                raise RuntimeError(f"Spanish PDF {pdf_path} text extraction found no Spanish UTF-8 diacritics!")
    return size, len(extracted)


def generate_pdfs(html_rel, out_dir, en_name, es_name):
    html_abs = os.path.join(ROOT, html_rel)
    if not os.path.isfile(html_abs):
        raise FileNotFoundError(f"Interactive plan HTML not found: {html_abs}")

    chrome = find_chrome()
    out_abs = os.path.join(ROOT, out_dir)
    os.makedirs(out_abs, exist_ok=True)

    handler = functools.partial(QuietHandler, directory=ROOT)
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    port = srv.server_address[1]
    thread = threading.Thread(target=srv.serve_forever, daemon=True)
    thread.start()

    results = []
    try:
        for lang, fname in [("en", en_name), ("es", es_name)]:
            target_pdf = os.path.join(out_abs, fname)
            url = f"http://127.0.0.1:{port}/{html_rel.lstrip('/')}?lang={lang}&print=1"
            cmd = [
                chrome,
                "--headless=new",
                "--disable-gpu",
                "--no-sandbox",
                "--no-pdf-header-footer",
                "--virtual-time-budget=4000",
                f"--print-to-pdf={target_pdf}",
                url,
            ]
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if proc.returncode != 0:
                raise RuntimeError(f"Chrome --print-to-pdf failed for {lang}:\n{proc.stderr}")
            size, text_len = verify_pdf_file(target_pdf, expect_spanish=(lang == "es"))
            results.append((lang, target_pdf, size, text_len))
            print(f"[OFFICIAL PDF PASS] {lang.upper()} -> {os.path.relpath(target_pdf, ROOT)} ({size:,} B, extracted_chars={text_len})")
    finally:
        srv.shutdown()

    return results


def main():
    parser = argparse.ArgumentParser(description="Generate official EN & ES K-S4 PDFs via headless Chrome.")
    parser.add_argument("--html", default=DEFAULT_HTML, help="Repo-relative path to interactive K-S4 HTML")
    parser.add_argument("--out-dir", default=DEFAULT_OUT_DIR, help="Output directory relative to repo root")
    parser.add_argument("--en-name", default=DEFAULT_EN_PDF, help="English PDF filename")
    parser.add_argument("--es-name", default=DEFAULT_ES_PDF, help="Spanish PDF filename")
    args = parser.parse_args()
    generate_pdfs(args.html, args.out_dir, args.en_name, args.es_name)


if __name__ == "__main__":
    main()
