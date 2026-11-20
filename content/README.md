# How to change the Unit 4 wiki

The wiki's words live in this folder, one small folder per page. `index.html` is built from them.
**Never edit `index.html` by hand.** It is overwritten on every build.

## Rules for what goes on the wiki (Tisa, Nov 19-20, 2026)

These are Tisa's directions. Follow them on every edit.

1. **Only what is clean and useful for the crew and John goes on room pages.** Brief notes like what you would say on site. No long explanations.
2. **Open or unconfirmed decisions live only on Project Planning** (`content/data/project-planning-decisions.js`). On a room page keep at most one short "wait" line where the crew could do work that is hard to undo.
3. **No codes that mean nothing to the crew.** No decision numbers, no revision labels (R2, R5, RevB), no file names, no sheet codes, no "AFF" or code citations. Wall names that are printed on the drawings (D04, L01) may stay.
4. **Documents go by a plain name** (`titleEn` / `titleEs` in `documents.json`), for example "Hood test-hang guide". Old or planning documents say so in the name ("do not use", "for review").
5. **Guides** (`content/packets.json`) are the crew's step-by-step documents. Each needs an English and a Spanish edition. Read a document before listing it as a guide; planning and working documents are not guides.
6. **The menu bar stays as built.** Do not redesign it. Sections that belong together are tied by a line down the left side.
7. **Phone and iPad first.** Check every change at phone width.
8. **English and Spanish are separate and both required.** Never mix them on one page.
9. **Never invent a measurement.** If the spec or field record lacks a number, write "measure on site".
10. **Nothing private:** no costs, bids, pay, financing or order numbers.
11. **PDFs need an HTML source** kept with them, so they can be updated as things change.
12. **The room spec in Drive (`<room>/SPEC.md`) governs.** The wiki page is a short copy for the crew. When a spec changes, update the page; when a page needs a new fact, the spec gets it first.

13. **Every page starts with a picture.** In `visuals.json`, `"lead"` is the number of the picture that goes first (counting from 0); without it the first picture is used. Use a real photo or drawing of that room. Do not use a picture of another room.

In Project Planning, give each question a `group` when it belongs to a meeting (for example `group: "hvac"` for the HVAC walkthrough). Without one, priority 1 shows under "Blocking work now" and the rest under "Next up".

## To change something

1. Edit the file for that page (table below).
2. Run `python3 tools/build.py`. It rebuilds `index.html`. If something is wrong it stops, names the file and the reason, and leaves the page untouched.
3. Run `python3 tools/smoke_test.py`. It opens every page in English and Spanish at phone size and must report 0 errors.
4. Commit and push `content/`, `src/` and `index.html` together.

Two people can edit different pages at the same time; their changes are in different files.

## Where things are

Each page has a folder: `content/pages/<page>/`

| File | What it is |
|---|---|
| `en.md` | Page text, English |
| `es.md` | Page text, Spanish (separate; never mixed) |
| `checklist.json` | The 4-7 high-level milestones: `done` true/false, `en`, `es` |
| `documents.json` | Documents listed on the page |
| `key-facts.json` | The key-facts strip |
| `visuals.json` | Visuals and mockups |
| `page.json` | Menu names (English/Spanish), parent page for subpages, Drive file ID |
| `*.en.html` / `*.es.html` | Special blocks; English and Spanish must both exist |

Special blocks:

- `home/this-week.*.html`: Home's two buckets. **This is the file to change each week.**
- `home/about.*.html`: the quick tip at the bottom of Home.
- `hvac/block-1.*.html`: the short HVAC summary.

In `.html` blocks put one element per line; line breaks between tags are ignored.

`content/site.json` is the menu order. To add a page: create its folder with `page.json` and `en.md`, then add its name to `"pages"`. For a subpage, set `"parent"` in its `page.json`.

`content/data/` holds shared lists: PDF file locations, document dates, labor hours, Project Planning decisions, concept renders, the Todoist mirror.

`src/template.html` is the layout, styles and code (menu, voice helper, field notes, interface wording). Change it only for design or behavior.

## If someone edits index.html by hand anyway

Run `python3 tools/extract_from_index.py` to pull their edits back into `content/` and `src/`, then build.

## What the build checks

- Every page has `page.json` and `en.md`; every JSON file is valid.
- English and Spanish special blocks come in pairs; a page without `es.md` gets a warning.
- A checklist outside 4-7 steps gets a warning.
- The built page has no JavaScript syntax error.

## Interactive Plans, Official PDFs & Canonical Docs Index

- **Mandatory Two-Layer Rule & Style Guide:** Read [`../docs/FRONTEND-STYLE-GUIDE.md`](../docs/FRONTEND-STYLE-GUIDE.md) ([Drive `.md`](https://drive.google.com/file/d/1aN8nzwwCG5aPqplwR0YZa9N6utYJoSe2/view) · [Native Google Doc](https://docs.google.com/document/d/1q33pExsA-nOdAtcUwA02in85_Vc4oA1ZM5Mw4G5iXaQ/edit)) before editing any interactive plan or wiki UI (`src/template.html`). Specialist engineering work stays cleanly separated inside `#blueprint-sheet-shell` / print sheets while every default screen uses the calm Human-First UI (`🔧 Equipment & Supplies`, bare subfloor toggle, zero exposed backend plumbing).
- **Backend Architecture & Runbook:** [`../docs/BACKEND-ARCHITECTURE.md`](../docs/BACKEND-ARCHITECTURE.md) ([Drive `.md`](https://drive.google.com/file/d/1JobQpG496kHmBWP0CCo_3H3Ps9kMsB4_/view) · [Native Google Doc](https://docs.google.com/document/d/1dWd8TlHsd_fg4tUqVBAKQYYcV3NnsnFjSpj_pba9Big/edit) · Companion Drive folders [`unit4-gemini-live-mini-r5`](https://drive.google.com/drive/folders/15KU_mZ8E5A6jezOf3yfWK1Eqk8njs_0E) & [`unit4-plan-edits-r1`](https://drive.google.com/drive/folders/10C_TwKp93ausTbLALD5LwsZDlH1zsiIx)) — includes `:8791` / `:8444` contracts and the Chrome 142+ tailnet `Local network access -> Allow` guide.
- **Full Repo Architecture (`6` Plans, `12` Official 2-Page PDFs + `04-hood-electrical` R2):** Read root [`../README.md`](../README.md), [`../plans/`](../plans/), `python3 plans/generate_official_pdfs.py --all`, [`../wiki-assets/unit4-backend-knowledge.json`](../wiki-assets/unit4-backend-knowledge.json), and `python3 tools/build.py --check`.
