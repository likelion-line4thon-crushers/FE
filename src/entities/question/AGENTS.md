<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# entities/question

## Purpose
Domain model for audience questions. Provides the canonical `NormalizedQuestion` type, normalization from raw backend payloads, upsert/sort utilities, and the `QuestionCluster` type for AI-grouped questions.

## Key Files

| File | Description |
|------|-------------|
| `model/question.ts` | Core domain: `NormalizedQuestion`, `normalizeQuestion`, `upsertQuestion`, `sortQuestionsAsc`, `applyQuestionStatusEvent`, `buildQuestionTopics`, `QuestionCluster` |
| `index.ts` | Public API — re-exports everything from `model/` |

## For AI Agents

### NormalizedQuestion Shape
```ts
interface NormalizedQuestion {
  id: string;
  roomId: string | null;
  slide: number;       // 1-based slide number
  audienceId: string | null;
  content: string;
  ts: number;          // Unix timestamp ms
}
```

### Key Functions
- `normalizeQuestion(raw)` — tolerates multiple field name variants from the backend (`questionId`/`id`, `slideIndex`/`slide`, `timestamp`/`ts`, `text`/`content`)
- `upsertQuestion(list, incoming)` — adds or replaces by `id`, returns sorted copy
- `applyQuestionStatusEvent(list, {type, questionId})` — removes question on `QUESTION_COMPLETED` or `QUESTION_DELETED` events
- `buildQuestionTopics(roomId)` — returns the two STOMP subscription destinations for questions

### Question WebSocket Topics
- `/topic/p/{roomId}/public` — audience-visible questions
- `/topic/p/{roomId}/presenter` — presenter-only questions

### QuestionCluster
Used by the presenter to display AI-grouped question clusters. Defined in `model/question.ts`; populated by the presenter-room model hooks after fetching from the AI API.

<!-- MANUAL: -->
