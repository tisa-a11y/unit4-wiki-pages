# Unit 4 — How Agents Work on This Project (Agent Work Index R2)

Updated 2026-11-03. **This is the canonical copy.** Home: the project's shared folder
`/Volumes/tisavo/Agent Shared - Mini Hosted/Work/Projects/1231-11th-avenue/unit-4-renovation/work-control/` (may mount as `/Volumes/tisavo-1`; synced to Drive as `1231-11th-avenue/unit-4-renovation/work-control`).
New agents: start here, then `START-HERE.md`, `AGENTS.md`, `CLAUDE.md` at the project root.
Nothing here overrides Tisa's locked direction or the Project Instructions.

**Wiki (human-readable view of these pages):** https://tisa-a11y.github.io/unit4-wiki-pages/ — it reads ROADMAP.md, each SPEC.md and this index from the synced Drive copies. Keep editing the .md files; the wiki follows. If a SPEC.md is replaced with a new Drive file ID, tell Claude to update the wiki.

## Where things live
**Every agent: read `START-HERE.md` first.** It is the bundled baseline (purpose, capabilities, ways to interact, routing, rules).

**Project specs and roadmap (start here for the work itself):** `continuity/ROADMAP.md`, then each project's `SPEC.md` — `kitchen/`, `bathroom/`, `electrical/`, `laundry/`, `hvac/`, `bedroom/`, `living-dining/`, `hallway/`, `paint-floors/`.

| What | Where |
|---|---|
| How agents work on Unit 4 (this index, Todoist runbook, peer-session roles, John's task ledgers) | `work-control/` |
| Continuity: handoff, decisions, known gaps, source index, Beads status | `continuity/` |
| Trade/room work packages | `bathroom/`, `kitchen/`, `electrical/`, `hvac/`, `interior-design/`, `sprint/`, `finance/` |
| Published crew/owner copies | Drive hub `1231 11th Ave - Unit 4 Remodel` (01–12), shared with John |
| Todoist | `Full 1231 11th Avenue Remodel` |

## Todoist
- Todoist reflects the project docs, specs and roadmap. Docs are the source; the board follows. Each card links its governing doc; when a doc changes, update the card; open questions are tracked on the card and the answer goes into the governing doc.
- No single owner. Any agent may write to the board, following the Project Instructions. Claude may take on triage — not locked.
- Antigravity's operational Todoist work is not verified (Tisa 11/3: "isn't great so far").
- `TODOIST-PROJECT-MANAGER-RUNBOOK.md` (Antigravity, 11/2) is a dated snapshot, not current state. Known errors:
  - Subpanel cover `BRCOV20L` — wrong; E20-R1: cover included, matching `BRPX2A20L1F`.
  - Pocket-door thickness "1-3/8 vs 1-3/4 in" — wrong; CURRENT-DECISIONS (11/1): John 1-3/8 in, superseding Ervin's 1-1/2 in.
  - J-05 governing-source link points to the Room & Project Index, not PD-01 R4.
  - Treats its own board snapshot as reference — backwards from the rule above.
- Open: two cards assigned to John on 11/2; `td auth login` status — both unknown.

## Known structural gaps (11/3)
- No unit roadmap exists.
- No current spec page per project; only `kitchen/CURRENT.md`.
- No docs for Laundry (only inside electrical), Hallway, Bedroom, Living & Dining, Paint & Floors; HVAC has an intake only.
- Decisions live in one dated log (`continuity/CURRENT-DECISIONS.md`), not per project.
- Dozens of duplicate START-HERE / ONBOARDING-CHECKLIST files across Drive from earlier agent runs.
Fix: ROADMAP.md + one SPEC.md per project written 2026-11-03 (English; Spanish after Tisa review).

## Change log
- R2 2026-11-03: rewritten as the agent entry point; R1 → `work-control/_superseded/`. A duplicate `13 Agent Work` folder in the Drive hub was retired to the hub's `_superseded`.

## Wiki data — what agents do after each Tisa + John session (added 2026-11-03)
The wiki (https://tisa-a11y.github.io/unit4-wiki-pages/) keeps two shared lists, read and written with the ArtifactData tool:
- `decisions` — one document per open decision (d01…). Tisa locks one by writing `status: "locked"`, `outcome`, `decidedAt`, `synced: false`. **Agent job:** for every locked decision with `synced: false`, copy the outcome into the project's `SPEC.md` (mark ✅, remove from "Decisions needed"), update matching Todoist cards, update the Spanish edition, then set `synced: true`. Never lock or change an outcome yourself.
- `decisionNotes` — notes John or Tisa add to a decision (`decision`, `text`, `author`, `createdAt`). Read them; they are input, not decisions.
- `reports` — field reports from site (`project`, `item`, `kind`, `text`, `photo` and optional `audio` asset ids (voice memo, playable in the wiki), `status: "new"`). **Agent job:** fold the fact into the spec (cite the report date), then set `status: "recorded"`. A report is a field fact, not a decision.
- `sessionNotes` — notes John or Tisa send after a session (`date`, `topic`, `agreed`, `open`, `next`, optional `photo`, `status: "new"`). **Agent job:** turn "agreed" items into spec updates only where Tisa has locked the matching decision (otherwise add them as notes on that decision), turn "next" into proposed Todoist cards (unassigned unless Tisa named the person), add "open" items as new decisions, then set `status: "recorded"`.
  Call-derived notes (`source: "call"`) also carry `summary`, `proposedLocks` (decision, outcome, quote), `updates` (project, change) and the `transcript`. Apply an `update` to a SPEC.md only when the matching decision is locked by Tisa, or when it is a plain field fact (a measurement, a delivery); otherwise leave it as a proposal. Proposed locks are already posted as notes on each decision for Tisa to lock — never lock them yourself.
- `inbox` — **the dispatch queue.** Voice or typed notes from John/Tisa, pre-sorted by Claude into items (`type` task | fact | decision | unsorted, `project`, suggested `section`, `title`, `details`, `raw` original note, `status: "queued"`). People never write to Todoist directly; **an agent routes every item**:
  - **task** → create the Todoist card in `Full 1231 11th Avenue Remodel`, section per the project (Kitchen Remodel / Bathroom Remodel / Electrical / General/Misc Tasks; HVAC → On hold; `unsure` → Needs triage). Title plain English; description uses the runbook template (State 1 unless Tisa confirmed more, Role/Trade as text, Next physical action, Governing source = link to that project's SPEC.md). **Unassigned** — never assign anyone but Tisa, and only if she named herself. Check for an existing card first; add a comment instead of a duplicate.
  - **fact** → add to the project's SPEC.md with the date and "(John, field)" attribution; if it changes a card, comment on that card.
  - **decision** → add a `decisions` doc (next id, `status: open`, priority 1/2/3).
  - Then update the inbox doc: `status: "filed"` (or `"held"` with an `agentNote` saying what's missing), `agentNote` (one line: what was done), `todoistUrl` when a card was made.
  Until an agent has Todoist access (claude.ai Todoist connector or Todoist sign-in), file facts and decisions and leave tasks `queued`.
New open decisions found in specs get added as new `decisions` documents (next id, `status: "open"`, `priority` 1 = blocking work, 2 = next up, 3 = later).
