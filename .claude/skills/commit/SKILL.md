---
name: commit
description: Create a well-formed commit on the current branch following this repo's Conventional Commits style. Use when the user says "commit", "커밋", "커밋해", or wants to save the current working changes. Before committing, it conservatively syncs project docs (CLAUDE.md/AGENTS.md/README.md/src/AGENTS.md/tests/AGENTS.md) and .claude/rules/*.md — but ONLY when the change actually outdates a documented fact — folding any doc edits into the same commit. Stages only changes relevant to the current work — if unrelated changes are mixed in, it asks or excludes them rather than blindly running git add -A — and prefers a single commit. Commits on the current branch; never creates a branch and never pushes unless asked.
---

# commit — convention-following commit + doc sync

Create a clean commit on the current branch. Before committing, fix docs/rules **only when they
are actually outdated** by the change, folding those edits into the same commit. Commit directly
without asking for confirmation.

## Workflow

### 1. Inspect the changes
```bash
git status --short
git diff HEAD          # review the full staged + unstaged change set
git log -5 --oneline   # you may also glance at recent commits to match their style
```
- If there are no changes, do nothing and report "no changes to commit".

### 2. Doc / rule sync check — **be conservative**

Edit a doc minimally **only when the diff makes an explicitly documented fact outdated.**
Files to review:

- Root: `CLAUDE.md`, `AGENTS.md`, `README.md`
- Nested: `src/AGENTS.md`, `tests/AGENTS.md`
- Rules: `.claude/rules/*.md` (`fsd-architecture.md`, `realtime.md`, `styling.md`, `testing.md`, etc.)

**When to edit (examples — the docs say one thing but reality now differs):**
- Command/script changes (a replacement for `pnpm dev`, a new script, run-order changes, etc.)
- Route added/removed/changed (`src/app/router.tsx` table no longer matches the docs table)
- FSD layer boundaries / public-API rules changed; state, styling, or realtime rules changed
- Directory structure, env vars, or architecture description drifting from the actual code

**When NOT to edit (the default):**
- Ordinary code changes that don't hit the above → **leave docs untouched**
- No speculative, generic, or "nice-to-have" additions. Only minimal edits that correct an
  outdated fact.

> If you're unsure, don't edit. Only edit a doc when you can state in one sentence: "the doc says
> X, but this change made X no longer true."

If you edited a doc/rule, include that file in this same commit (do not split it into a separate one).

### 3. Staging — only the changes relevant to the current work

**Do NOT blindly run `git add -A`.** First judge whether the changed files are **related to the
current work context.**

- If every change is related to this work → stage all the relevant files.
- If **unrelated changes are mixed in** (edits to another feature, files left over by accident,
  unrelated config changes, etc.):
  - ask the user whether to include those files, or
  - **exclude** them and stage only the relevant files (explicitly, via `git add <path>`).
- Use the session context to keep related changes in **a single commit** where possible.
- Split into multiple commits only when clearly unrelated change sets are mixed in and separating
  them genuinely helps the history.

### 4. Commit message

Write an English Conventional Commit (the Angular convention) that matches the recent history you
just reviewed. When code + docs are combined, pick the type from the code change, not `docs`.
Do not add a `Co-Authored-By` trailer.

### 5. Run the commit
```bash
git commit -m "<message>"
```
- **Commit on the current branch. Do not create a new branch** (project rule).
- **Do not push.** Push only when the user explicitly asks.

### 6. Report
- Print the commit hash + a one-line summary.
- If you also edited docs/rules, state in one line which files you changed and why.
