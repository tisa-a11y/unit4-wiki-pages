# How to change the Unit 4 wiki

The wiki's words live in this folder, one small folder per page. `index.html` is built from them.
**Never edit `index.html` by hand.** It is overwritten on every build.

## To change something

1. Edit the file for that page (list below).
2. Run `python3 tools/build.py`.
   It rebuilds `index.html`. If something is wrong it stops, says which file and why, and leaves the live page untouched.
3. Run `python3 tools/smoke_test.py` (opens every page in English and Spanish; must report 0 errors).
4. Commit and push `content/`, `src/` and `index.html` together.

Two people can edit different pages at the same time; their changes are in different files.

## Where things are

Each page has a folder: `content/pages/<page>/`

| File | What it is |
|---|---|
| `en.md` | The page text in English |
| `es.md` | The page text in Spanish (separate; never mixed) |
| `checklist.json` | The 4–7 high-level milestones: `done` true/false, `en`, `es` |
| `documents.json` | The documents listed on the page |
| `page.json` | Menu name, parent page (for subpages), Drive file ID |
| `*.en.html` / `*.es.html` | Special blocks. English and Spanish must both exist. |

Special blocks in use:

- `home/this-week.*.html`: Home's two buckets, "Done by Monday" and "Next Week's Focus". **This is the file to change each week.**
- `home/about.*.html`: "What this wiki is for".
- `hvac/summary.*.html`: the short HVAC summary.
- `kitchen-oven-range/instructions.*.html`: the step-by-step parts.
- `attic-access/special-notes.*.html`: attic enclosure notes.

In `.html` blocks, put one element per line. Line breaks between tags are ignored.

`content/site.json` is the menu order. To add a page: make its folder, add its name to `"pages"`. To make it a subpage, set `"parent"` in its `page.json`; the tabs between a room and its subpages appear by themselves.

`content/data/` holds shared lists: PDF file locations, document dates, pinned plans, concept renders, Project Planning decisions, labor hours.

`src/template.html` is the layout, styles and code (menu, voice helper, field notes). Change it only for design or behavior changes.

## Rules the build checks

- Every page has `page.json` and `en.md`; every JSON file is valid.
- English and Spanish special blocks come in pairs.
- A checklist outside 4–7 steps gets a warning.
- The built page has no JavaScript syntax error.
- The build stamp shown on the page is computed from the content, so two builds of the same content show the same stamp.
