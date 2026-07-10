---
name: deploy-pr
description: Create the dev → main deployment PR for this project (merging to main auto-deploys the frontend via Cloudflare Pages). Use when the user wants to deploy/ship the frontend, promote dev to production, or "create a deploy PR". Generates a Korean PR body that summarizes the commits landed on dev, always reports env-var/deploy-config changes, notes local-CLI/script changes, and opens the PR (assignee=@me, label=Deploy) — it does NOT merge.
---

# deploy-pr — dev → main 배포 PR 생성

이 프로젝트는 **`dev`를 `main`에 병합하면 Cloudflare Pages가 프로덕션에 자동 배포**합니다.
이 스킬은 **PR 생성까지만** 수행합니다. 병합(=실제 프로덕션 배포)은 사람이 GitHub에서 직접 하며,
스킬이 자동 병합하지 않습니다.

## 워크플로

### 1. 프리플라이트 — 하나라도 실패하면 이유를 명확히 알리고 중단

```bash
git fetch origin
```

- 현재 브랜치가 `dev`인지 확인. 아니면 중단 ("현재 브랜치가 dev가 아닙니다").
- `dev`가 원격에 모두 푸시됐는지: `git log origin/dev..dev --oneline` 이 비어 있어야 함.
  비어 있지 않으면 중단 ("dev에 푸시되지 않은 커밋이 있습니다 — 먼저 push하세요").
- `dev`가 `origin/main`보다 앞서 있는지: `git rev-list --count origin/main..origin/dev` 가 0보다 커야 함.
  0이면 중단 ("dev가 main보다 앞서 있지 않습니다 — 배포할 변경이 없습니다").
- 이미 열린 dev→main PR 확인: `gh pr list --base main --head dev --state open`.
  이미 있으면 URL을 알리고, 새로 만들지 닫고 다시 만들지 사용자에게 물어봄.

### 2. 변경사항 분석 (`origin/main..origin/dev` 기준)

```bash
git log origin/main..origin/dev --oneline           # 커밋 요약용
git diff --stat origin/main..origin/dev             # 변경 파일 개요
git diff origin/main..origin/dev -- .env.example    # 환경 변수 변경 (핵심)
git diff origin/main..origin/dev -- package.json    # scripts = 로컬 CLI 변경
```

- **환경 변수**: `.env.example` diff. `.env`는 gitignore되므로 `.env.example`이 소스 오브 트루스.
- **로컬 CLI/스크립트**: `package.json`의 `scripts` 변화. 개발 전 실행해야 할 새 명령, `pnpm dev` 대체 등.
- **검증/부하 테스트**: `tests/k6/` 등 변경 여부. 부하 테스트처럼 임팩트 있는 것만 기록.

### 3. PR 본문 작성 (한국어) — 아래 "PR 본문 템플릿" 사용

작성 규칙:

- **주요 변경사항**: 커밋을 `기능 / 버그 수정 / UI 개선 / 성능` 카테고리로 묶어 사람이 읽기 좋게 요약.
  원본 커밋 라인을 그대로 나열하지 말 것. **내용 없는 카테고리는 생략**.
- **환경 변수 / 배포 설정 변경 섹션은 항상 표시**. 변경이 있으면 변수명과
  "Cloudflare Pages 대시보드에 반영 필요"를 명시하고, 없으면 정확히 `환경 변수 변경 없음`이라고 적음.
  (프로덕션 배포에서 가장 위험한 항목이라 생략하지 않는다.)
- **로컬 개발 환경 변경 / 검증 / 추가 참고사항 섹션은 내용이 있을 때만 렌더링**.
- 테스트 결과는 기본적으로 생략. 배포 PR에는 최소 정보만 담는다.

### 4. `Deploy` 라벨 확보 후 PR 생성

```bash
# 라벨이 없을 수도 있으니 idempotent하게 보장 (이미 있으면 무시)
gh label create Deploy --color fbca04 --description "Production deploy (dev → main)" 2>/dev/null || true

gh pr create \
  --base main --head dev \
  --assignee @me \
  --label Deploy \
  --title "배포: dev → main" \
  --body "<위에서 작성한 한국어 본문>"
```

- `--assignee @me` : 스킬을 실행한 사람이 assignee로 지정됨.
- 제목에 날짜나 핵심 하이라이트를 덧붙여도 됨 (예: `배포: dev → main (2026-07-10)`).

### 5. 보고

- 생성된 PR URL 출력.
- "이 PR을 **병합하면 Cloudflare Pages가 프로덕션에 자동 배포**됩니다. 병합은 직접 진행하세요."라고 안내.

## PR 본문 템플릿

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

## 🛠️ 로컬 개발 환경 변경   <!-- 변경 있을 때만 -->

- 예: 새 `pnpm` 스크립트, 개발 전 실행해야 할 명령, `pnpm dev` 대체 등

## 🧪 검증   <!-- 임팩트 있을 때만 (예: 부하 테스트) -->

- …

## 📝 추가 참고사항   <!-- 있을 때만 -->

- …
```
