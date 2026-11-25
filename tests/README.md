# Usability gate

Run from the repository root with Python 3.9–3.14, Node.js, Playwright, Chromium,
and Pillow installed:

```sh
python3 tools/build.py --check
python3 -m unittest discover -s tests -v
python3 tools/usability_gate.py --json
```

The suite returns **0 only when all 13 gates pass**, otherwise **1**. The HTML
report is `tmp/usability-report.html` (gitignored). Its full Cut / Rewrite Queue
includes the page, language, DOM selector, text and reason for every editorial
finding. JSON stdout includes the same queue and the list of inspected pages
and plan steps. Progress goes to stderr.

The functional sweep uses 1440×900 and 390×844, with all four combinations of
English/Spanish and light/dark. Editorial rules inspect visible prose in every
room and plan step in both languages, including local HTML guides and render
captions. Hidden technical/print content, agent briefs, navigation and comments
are excluded. The job-site layout requirement is checked on room pages only.

Editorial findings are review candidates and fail Gate 13; a heuristic cannot
approve construction instructions. Preserve dimensions, active holds, and
separate fixture requirements when rewriting. Similar sentences describing
different fixture heights may be intentional and still need editorial review.
Static language-specific guide exports are scanned as rendered; supplying a
language query does not prove that a static document was translated.

## Visual baselines

The baseline PNGs live in `tests/usability-baselines/`. Missing baselines or a
missing Pillow dependency **fail** Gate 12; screenshots alone do not count as a
comparison. Inspect captures before updating:

```sh
python3 tools/usability_gate.py --update-baselines --json
python3 tools/usability_gate.py --json
```

An update run records `baseline_update: true` and labels each screenshot
`baseline updated`; it establishes references, not regression evidence. Run
again without that flag to compare pixels. Baselines are browser/OS/font
sensitive: investigate differences before accepting an update. Screenshot
coverage spans both viewports, both languages, and both themes for the kitchen
room, kitchen electrical plan, and bathroom tile plan.

## Test boundaries

Backend endpoints are intercepted. The pin journey proves the browser builds
and submits the expected request and handles the mocked receipt; it does not
prove delivery to the live project backend. External requests are blocked for
deterministic offline behavior. Built-in contrast and geometry checks are
heuristics, not certification of WCAG conformance. The report preserves failures
instead of silently waiving mobile AI-dock overlap or accepting a missing golden
image.
