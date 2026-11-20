# How to change the Unit 4 wiki

The wiki's words live in this folder, one small folder per page. `index.html` is built from them.
**Never edit `index.html` by hand.** It is overwritten on every build.

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
