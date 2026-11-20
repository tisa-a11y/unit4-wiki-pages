#!/usr/bin/env python3
"""Open the built wiki in headless Chrome and fail if any page errors or renders empty.

  python3 tools/smoke_test.py        (needs: pip install playwright, and Chrome or `playwright install chromium`)
"""
import asyncio, functools, http.server, json, os, sys, threading
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a, **k): pass
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f"http://127.0.0.1:{srv.server_address[1]}/index.html"
keys = ["home", "decisions"] + json.load(open(os.path.join(ROOT, "content/site.json"), encoding="utf-8"))["pages"]
LOCAL = os.environ.get("U4_VENDOR_DIR")  # optional: folder holding marked.min.js / purify.min.js for offline runs
async def main():
    problems = []
    async with async_playwright() as pw:
        kw = {"args": ["--no-sandbox"]}
        for exe in ("/usr/bin/google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"):
            if os.path.exists(exe): kw["executable_path"] = exe; break
        b = await pw.chromium.launch(**kw)
        for lang in ("en", "es"):
            ctx = await b.new_context(viewport={"width": 390, "height": 844})
            await ctx.add_init_script(f"try{{localStorage.setItem('u4lang','{lang}')}}catch(e){{}}")
            page = await ctx.new_page()
            page.on("pageerror", lambda e, lang=lang: problems.append(f"[{lang}] JavaScript error: {str(e)[:200]}"))
            if LOCAL:
                async def route(r):
                    u = r.request.url
                    if "marked" in u: await r.fulfill(path=os.path.join(LOCAL, "marked.min.js"), content_type="text/javascript")
                    elif "purify" in u: await r.fulfill(path=os.path.join(LOCAL, "purify.min.js"), content_type="text/javascript")
                    elif u.startswith("http://127.0.0.1"): await r.continue_()
                    else: await r.abort()
                await page.route("**/*", route)
            await page.goto(URL + "#home"); await page.wait_for_timeout(1500)
            for k in keys:
                await page.evaluate(f"location.hash='#{k}'"); await page.wait_for_timeout(500)
                n = await page.evaluate("(document.querySelector('main')||document.body).innerText.trim().length")
                wide = await page.evaluate("document.documentElement.scrollWidth > innerWidth + 2")
                if n < 200: problems.append(f"[{lang}] #{k} renders almost empty ({n} characters)")
                if wide: problems.append(f"[{lang}] #{k} scrolls sideways on a phone")
            await ctx.close()
        await b.close()
    if problems:
        print("SMOKE TEST FAILED - do not push:"); [print("  -", p) for p in problems]; sys.exit(1)
    print(f"smoke test passed: {len(keys)} pages x 2 languages, 0 errors")
asyncio.run(main())
