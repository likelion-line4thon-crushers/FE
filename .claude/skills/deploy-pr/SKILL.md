---
name: deploy-pr
description: Create the dev → main deployment PR for this project (merging to main auto-deploys the frontend via Cloudflare Pages). Use when the user wants to deploy/ship the frontend, promote dev to production, or "create a deploy PR". Generates a Korean PR body that summarizes the commits landed on dev, always reports env-var/deploy-config changes, notes local-CLI/script changes, and opens the PR (assignee=@me, label=Deploy) — it does NOT merge.
---

# deploy-pr — create the dev → main deployment PR

In this project, **merging `dev` into `main` auto-deploys the frontend to production via
Cloudflare Pages.** This skill only goes as far as **creating the PR**. Merging (the actual
production deploy) stays a deliberate human action on GitHub — the skill never auto-merges.

Note: the generated **PR body is written in Korean** (that is the desired output). These skill
instructions are in English, but the PR content you produce must follow the Korean template below.

## Workflow

### 1. Preflight — if any check fails, explain why and stop

```bash
git fetch origin
```

- Confirm the current branch is `dev`. Otherwise stop ("current branch is not dev").
- Confirm `dev` is fully pushed: `git log origin/dev..dev --oneline` must be empty.
  If not, stop ("dev has unpushed commits — push first").
- Confirm `dev` is ahead of `origin/main`: `git rev-list --count origin/main..origin/dev` must be > 0.
  If 0, stop ("dev is not ahead of main — nothing to deploy").
- Check for an already-open dev→main PR: `gh pr list --base main --head dev --state open`.
  If one exists, report its URL and ask whether to reuse it or close it and open a new one.

### 2. Analyze the changes (range `origin/main..origin/dev`)

```bash
git log origin/main..origin/dev --oneline           # for the commit summary
git diff --stat origin/main..origin/dev             # changed-file overview
git diff origin/main..origin/dev -- .env.example    # env var changes (critical)
git diff origin/main..origin/dev -- package.json    # scripts = local CLI changes
```

- **Env vars**: diff `.env.example`. `.env` is gitignored, so `.env.example` is the source of truth.
- **Local CLI / scripts**: changes to `package.json` `scripts` — new commands to run before dev,
  a replacement for `pnpm dev`, etc.
- **Verification / load testing**: whether `tests/k6/` and similar changed. Record only when impactful.

### 3. Write the PR body (Korean) — use the "PR body template" below

Rules:

- **주요 변경사항 (Key changes)**: group commits into `기능 / 버그 수정 / UI 개선 / 성능`
  (feature / bug fix / UI / performance) and summarize in human-readable terms. Do NOT dump raw
  commit lines. **Omit any category with no content.**
- **Always render the env-var / deploy-config section.** If something changed, list the variable
  names and note "Cloudflare Pages 대시보드에 반영 필요" (must be reflected in the Cloudflare Pages
  dashboard); if nothing changed, write exactly `환경 변수 변경 없음`. This is the most dangerous
  item in a production deploy, so never omit it.
- **Render the local-dev / verification / additional-notes sections only when they have content.**
- Omit test results by default. A deploy PR carries minimal information.

### 4. Ensure the `Deploy` label exists, then create the PR

```bash
# Ensure the label exists (idempotent — ignore if it already exists)
gh label create Deploy --color fbca04 --description "Production deploy (dev → main)" 2>/dev/null || true

gh pr create \
  --base main --head dev \
  --assignee @me \
  --label Deploy \
  --title "배포: dev → main" \
  --body "<the Korean body written above>"
```

- `--assignee @me` assigns whoever runs the skill.
- You may append a date or key highlight to the title (e.g. `배포: dev → main (2026-07-10)`).

### 5. Report

- Print the created PR URL.
- Remind the user: "Merging this PR auto-deploys to production via Cloudflare Pages. Do the merge
  yourself."

## PR body template

```markdown
## 🚀 배포 개요

`dev` → `main` 병합 배포입니다. 병합 시 Cloudflare Pages가 프로덕션에 자동 반영합니다.

## 📦 주요 변경사항

**✨ 기능**
- …

**🐛 버그 수정**
- …

**💅 UI 개선**
- …

**⚡ 성능**
- …

> 내용 없는 카테고리는 지웁니다.

## ⚠️ 환경 변수 / 배포 설정 변경

- (변경 시) `VITE_XXX` 추가/변경 — **Cloudflare Pages 대시보드에 반영 필요**
- (변경 없을 시) 환경 변수 변경 없음

## 🛠️ 로컬 개발 환경 변경   <!-- only when changed -->

- 예: 새 `pnpm` 스크립트, 개발 전 실행해야 할 명령, `pnpm dev` 대체 등

## 🧪 검증   <!-- only when impactful, e.g. load testing -->

- …

## 📝 추가 참고사항   <!-- only when present -->

- …
```
