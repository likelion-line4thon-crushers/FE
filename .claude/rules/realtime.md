---
paths:
  - "src/shared/api/**"
  - "src/**/model/realtime/**"
  - "src/entities/session/**"
  - "src/entities/reaction/**"
  - "src/entities/question/**"
---

# Realtime / WebSocket (STOMP over SockJS)

The singleton `websocketService` in `src/shared/api/websocket.ts` handles all live messaging:
`connect`, `subscribe` (JSON frames), `subscribeText` (plain-text frames like focusOn), `send`,
plus typed helpers (`sendPageChange`, `sendOptionChange`, `sendUnlockChange`, `sendFocusOn`, `sendEndSession`).
All typed send helpers attach an `Idempotency-Key` (uuid); the generic `send()` only if the caller passes one.

Before changing WebSocket message handling, read `docs/session-lifecycle.md`.

## Gotchas

- **Reconnect:** stompjs auto-reconnects (5s delay, fresh SockJS per attempt). On an
  unexpected drop the service retains subscription specs — including `subscribe()` calls
  made *while disconnected* (stored as pending) — and replays them on reconnect
  (`resubscribeRetained`); intentional `disconnect()` clears everything. `connect()`
  accepts `{ onDisconnect, channel }`: `onDisconnect` fires on unexpected drops so hooks
  can flip readiness state (self-heal path), `channel` labels ws telemetry explicitly.
  Client callbacks ignore events from an orphaned (replaced) Client. Messages sent
  during the downtime gap are still lost — topics have no replay

- **`sessionId` params are actually the `roomId`.** The service methods name their first arg
  `sessionId`, but callers pass the roomId — all live topics are keyed by roomId
- **Page indexing:** UI uses 0-based indices; the server uses 1-based page numbers. The send
  helpers add +1 on send and handlers convert back to 0-based on receive
- **Test mode:** when `window.__BOINI_TEST_MODE__ === true`, all transport routes through
  `window.__BOINI_TEST_WS__` (a `TestWebSocketTransport`). Never use the real STOMP client in tests
- **Backend field inconsistencies** are tolerated at normalization boundaries:
  `deckId`/`deckID`, `x`/`xPct`, `questionId`/`id`, `slideIndex`/`slide`, `timestamp`/`ts`,
  boolean-ish fields arriving as `string | boolean` ("true"/"false"). Keep normalizers tolerant

## STOMP destinations

Subscribe (client receives):

| Destination                                        | Carries                                                                       |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| `/topic/p/{roomId}/public`                         | Audience-visible questions **and** `SESSION_STATE` events (combined handler)  |
| `/topic/p/{roomId}/presenter`                      | Presenter-only questions                                                      |
| `/topic/p/{roomId}/clusters`                       | AI-clustered question groups                                                  |
| `/topic/presentation/{roomId}/pageChange`          | Presenter slide changes (audience follows)                                    |
| `/topic/presentation/{roomId}/pageChange/audience` | Audience slide changes (presenter observes)                                   |
| `/topic/presentation/{roomId}/option`              | QuickSettings (sticker/question/feedback) changes                             |
| `/topic/presentation/{roomId}/option/unlock`       | Unlock/reveal settings changes                                                |
| `/topic/presentation/{roomId}/focusOn`             | Presenter focus request (plain-text page number)                              |
| `/topic/presentation/{roomId}/reactions`           | Emoji stamp broadcasts                                                        |
| `/topic/presentation/{roomId}/slideReady`          | Slide processing-ready notifications                                          |

Send (client publishes): `/app/presentation/{roomId}/<action>` — `pageChange/presenter`,
`pageChange/audience`, `focusOn`, `option`, `option/unlock/{value}`, `end`.

## Session end

There is no separate `SESSION_END` event. `/topic/p/{roomId}/public` carries
`{ type: "SESSION_STATE", status }`; when status is `"ended"`/`"ENDED"`, the audience page
navigates once to `/audience/{code}/rating` (guarded by a ref).

## REST vs WebSocket for stickers

`@/shared/api/sticker` is read-only (replay/report). Live reactions flow over WebSocket only.
