<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# pages/presenter-room

## Purpose

Presenter's live presentation control room at `/rooms/:roomId/present`. Manages slide navigation, the question inbox (raw list and AI-clustered view), audience settings, and the presenter WebSocket connection.

## Key Files

| File                                           | Description                                                                                                                                                                 |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ui/PresenterRoomPage.tsx`                     | Root presenter page component                                                                                                                                               |
| `ui/QuestionList.tsx` / `.styles.ts`           | Raw incoming audience questions, chronological                                                                                                                              |
| `ui/ClusterQuestionList.tsx` / `.styles.ts`    | AI-clustered question groups                                                                                                                                                |
| `model/index.ts`                               | Re-exports `realtime`, `question`, `audience`, `feedback`, `session` model hooks                                                                                            |
| `model/realtime/usePresenterWebSocket.ts`      | Connects the presenter socket; on connect sends an initial `sendPageChange`; subscribes to `/topic/presentation/{roomId}/pageChange/audience` to follow audience navigation |
| `model/realtime/usePresenterFocusHighlight.ts` | Focus-highlight animation state                                                                                                                                             |
| `model/question/usePresenterQuestions.ts`      | Real-time question list via STOMP subscriptions + `upsertQuestion`/`applyQuestionStatusEvent`                                                                               |
| `model/question/usePresenterClusters.ts`       | Fetches AI-clustered questions → `QuestionCluster[]`                                                                                                                        |
| `model/session/`                               | Session state hooks for the presenter                                                                                                                                       |
| `model/audience/`                              | Connected-audience tracking                                                                                                                                                 |
| `model/feedback/`                              | Audience feedback events                                                                                                                                                    |

## For AI Agents

### Question Display Modes

1. **Raw list** (`QuestionList`) — managed by `usePresenterQuestions`, subscribed to `/topic/p/{roomId}/public` and `/topic/p/{roomId}/presenter` (from `buildQuestionTopics`)
2. **Cluster view** (`ClusterQuestionList`) — managed by `usePresenterClusters`, mapping AI API data to `QuestionCluster` from `@/entities/question`

Question removal uses `applyQuestionStatusEvent` for `QUESTION_COMPLETED` / `QUESTION_DELETED` payloads (the only typed question status events). Completion/deletion is also available over REST (`completeQuestion`, `deleteQuestion`).

### Slide Navigation

The presenter calls `websocketService.sendPageChange(roomId, beforeIndex, changedIndex)` (0-based indices; the helper adds +1 for the server). The server rebroadcasts to audiences on `/topic/presentation/{roomId}/pageChange`.

### WebSocket Note

`usePresenterWebSocket` passes `roomId` as the service's first arg (named `sessionId` in the method signature). It connects with the presenter token + presenter ws URL and disconnects on unmount.

<!-- MANUAL: -->
