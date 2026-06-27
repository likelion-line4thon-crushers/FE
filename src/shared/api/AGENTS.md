<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# shared/api

## Purpose

All network communication: HTTP API functions (via axios) and the WebSocket service (STOMP over SockJS). Every backend call in the application goes through this directory.

## Key Files

| File              | Description                                                                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api.ts`          | Default axios instance (base URL + interceptors)                                                                                                                                               |
| `ai-api.ts`       | Default axios instance pointed at the AI backend (`aiApi`)                                                                                                                                     |
| `websocket.ts`    | `WebSocketService` class + singleton `websocketService` — STOMP/SockJS client with a test-mode transport hook                                                                                  |
| `room.ts`         | Room + session lifecycle: `createRoom`, `joinRoom`, `startSession`, `closeSession`, `leaveRoom`, `getRoomInfo`                                                                                 |
| `presentation.ts` | Slide + live data: `getOriginalSlideUrl`, `fetchAllOriginalSlideUrls`, `fetchSlidesMeta`, `fetchAudienceSlideStats`, `fetchLiveFeedback`                                                       |
| `question.ts`     | `fetchRoomQuestions`, `completeQuestion`, `deleteQuestion`                                                                                                                                     |
| `feedback.ts`     | `submitFeedback`                                                                                                                                                                               |
| `sticker.ts`      | Read-only sticker fetch: `getAllStickers`, `getStickersByAudience` (live reactions go over WebSocket, not here)                                                                                |
| `pdfUpload.ts`    | Chunked PDF upload: `CHUNK_SIZE`, `uploadPdfChunk`, `uploadPdfInChunks`                                                                                                                        |
| `pdfStream.ts`    | `subscribePdfStream` — SSE subscription for per-page PDF processing progress                                                                                                                   |
| `ai-report.ts`    | AI report fetches: `fetchTopSlideReport`, `fetchTopQuestionsReport`, `fetchMostRevisitSlide`, `fetchStoredAiReport`, `fetchTopStoredReport`, `fetchMostReactionSticker`, `fetchFeedbackReport` |
| `model/api.ts`    | Shared API response type definitions                                                                                                                                                           |
| `model/pdf.ts`    | PDF upload/stream types (`SsePageEvent`, `SseErrorEvent`, etc.)                                                                                                                                |

## For AI Agents

### WebSocket Service

`websocket.ts` exports a singleton `websocketService`. Key methods:

- `connect(wsUrl, token, onConnect?, onError?)` — establish connection (converts `ws://`/`wss://` to http(s) for SockJS)
- `subscribe<T>(destination, callback)` → returns an unsubscribe function (JSON frames)
- `subscribeText(destination, callback)` → for plain-text frames (e.g. focusOn)
- `send(destination, body, headers?)`, plus typed helpers: `sendPageChange`, `sendAudiencePageChange`, `sendFocusOn`, `sendOptionChange`, `sendUnlockChange`, `sendEndSession`
- `disconnect()`

**Test mode**: when `window.__BOINI_TEST_MODE__ === true`, all transport is routed through `window.__BOINI_TEST_WS__` (a `TestWebSocketTransport`). Never use the real STOMP client in tests.

### ⚠️ `sessionId` parameter is actually the `roomId`

The `WebSocketService` send methods name their first argument `sessionId`, but callers pass the **`roomId`** (see `usePresenterWebSocket` / the audience subscriptions). All live topics are keyed by `roomId`.

### STOMP Destinations (verified)

Subscribe (client receives):

| Destination                                        | Carries                                                                      |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| `/topic/p/{roomId}/public`                         | Audience-visible questions **and** `SESSION_STATE` events (combined handler) |
| `/topic/p/{roomId}/presenter`                      | Presenter-only questions                                                     |
| `/topic/presentation/{roomId}/pageChange`          | Presenter slide changes (audience follows)                                   |
| `/topic/presentation/{roomId}/pageChange/audience` | Audience slide changes (presenter observes)                                  |
| `/topic/presentation/{roomId}/option`              | QuickSettings (sticker/question/feedback) changes                            |
| `/topic/presentation/{roomId}/option/unlock`       | Unlock/reveal settings changes                                               |
| `/topic/presentation/{roomId}/focusOn`             | Presenter focus request (plain-text page number)                             |
| `/topic/presentation/{sessionId}/reactions`        | Emoji stamp broadcasts                                                       |

Send (client publishes): `/app/presentation/{roomId}/<action>` — `pageChange/presenter`, `pageChange/audience`, `focusOn`, `option`, `option/unlock/{value}`, `end`. All sends attach an `Idempotency-Key` (uuid).

### Page Indexing

Presenter/audience page-change helpers convert 0-based UI indices to 1-based server page numbers on send, and back to 0-based on receive. `buildQuestionTopics(roomId)` (in `@/entities/question`) returns the two `/topic/p/...` question destinations.

<!-- MANUAL: -->
