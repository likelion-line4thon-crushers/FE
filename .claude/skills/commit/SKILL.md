---
name: commit
description: Create a well-formed commit on the current branch following this repo's Conventional Commits style. Use when the user says "commit", "커밋", "커밋해", or wants to save the current working changes. Before committing, it conservatively syncs project docs (CLAUDE.md/AGENTS.md/README.md/src/AGENTS.md/tests/AGENTS.md) and .claude/rules/*.md — but ONLY when the change actually outdates a documented fact — folding any doc edits into the same commit. Stages all changes and prefers a single commit. Commits on the current branch; never creates a branch and never pushes unless asked.
---

# commit — 컨벤션 준수 커밋 + 문서 싱크

현재 브랜치에 잘 정돈된 커밋을 만든다. 커밋 전에 **문서/규칙이 실제로 낡았을 때만** 고치고,
그 수정을 같은 커밋에 포함한다. 확인을 따로 묻지 않고 바로 커밋한다.

## 워크플로

### 1. 변경 파악
```bash
git status --short
git diff HEAD          # staged + unstaged 전체 실제 변경 내용 확인
```
- 변경이 없으면 아무것도 하지 않고 "커밋할 변경 없음"이라고 알린다.

### 2. 문서 / 규칙 싱크 체크 — **보수적으로**

diff가 **문서에 명시적으로 적힌 사실을 낡게 만들 때만** 해당 문서를 최소한으로 고친다.
검토 대상:

- 루트: `CLAUDE.md`, `AGENTS.md`, `README.md`
- 하위: `src/AGENTS.md`, `tests/AGENTS.md`
- 규칙: `.claude/rules/*.md` (`fsd-architecture.md`, `realtime.md`, `styling.md`, `testing.md` 등)

**수정하는 경우 (예시 — 문서에 적힌 내용과 실제가 어긋날 때):**
- 명령어/스크립트 변경 (`pnpm dev` 대체, 새 스크립트, 실행 순서 등)
- 라우트 추가/삭제/변경 (`src/app/router.tsx` 표와 문서 표 불일치)
- FSD 레이어 경계·공개 API 규칙 변화, 상태관리/스타일링/실시간 규칙 변화
- 디렉터리 구조·환경 변수·아키텍처 서술과 실제 코드의 불일치

**수정하지 않는 경우 (기본값):**
- 위에 해당하지 않는 일반 코드 변경 → 문서 **건드리지 않음**
- 추측성·일반론·"있으면 좋을" 문구 추가 금지. 낡은 사실을 바로잡는 최소 편집만.

> 확신이 없으면 고치지 않는다. 문서 편집은 "문서에 이렇게 적혀 있는데 이번 변경으로 사실과
> 달라졌다"를 한 문장으로 댈 수 있을 때만 한다.

문서/규칙을 고쳤다면 그 파일도 이번 커밋에 함께 포함한다 (별도 커밋으로 분리하지 않음).

### 3. 스테이징
```bash
git add -A            # 변경·추가·삭제 전체
```
- 세션 맥락을 활용해 **되도록 하나의 커밋**으로 전체 변경을 담는다.
- 워킹 트리에 명백히 무관한 변경 묶음이 섞여 있고 히스토리상 나누는 게 확실히 나을 때만 분리한다.

### 4. 커밋 메시지 — 영문 Conventional Commits

`type(scope): subject` 형식. 이 레포에서 쓰는 타입: `feat`, `fix`, `docs`, `test`, `chore`
(필요 시 `refactor`, `perf`, `style`, `build`, `ci`).

- **type**: 이번 커밋의 주된 변경 기준. 코드+문서가 함께면 코드 변경 기준으로 정한다
  (문서는 그 변경을 반영하는 것이므로 `docs`가 아니라 `feat`/`fix` 등).
- **scope**: 영향 범위 (기능/레이어/모듈, 예: `presenter`, `qna`, `rating`, `session`).
- **subject**: 명령형, 소문자 시작, 마침표 없음, 간결하게.
- **body** (선택): 무엇을 왜 바꿨는지 실질적 정보가 있을 때만.
- **footer**: 항상 마지막 줄에
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

예시:
```
fix(qna): ignore Enter during IME composition to prevent syllable duplication

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```

### 5. 커밋 실행
```bash
git commit -m "<message>"
```
- **현재 브랜치에 커밋한다. 브랜치를 새로 만들지 않는다** (이 프로젝트 규칙).
- **push 하지 않는다.** 사용자가 명시적으로 요청할 때만 push.

### 6. 보고
- 커밋 해시 + 한 줄 요약 출력.
- 문서/규칙을 함께 고쳤다면 어떤 파일을 왜 고쳤는지 한 줄로 밝힌다.
