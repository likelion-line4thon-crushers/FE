<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# entities/room

## Purpose

Room metadata entity. A "room" is the persistent presentation container, identified by `roomId` and a shared join `code`. Holds Jotai atoms derived from URL params + API responses, plus the room/deck type definitions.

## Key Files

| File             | Description                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `model/room.ts`  | Type definitions: `RoomData`, `JoinRoomResponse`, `SessionStatus`, `RoomInfo`                                              |
| `model/store.ts` | Jotai atoms: `roomIdAtom`, `deckIdAtom`, `totalPagesAtom`, `wsUrlAtom`, `fileNameAtom`, `pdfIdAtom`, `canStartSessionAtom` |
| `index.ts`       | Public API                                                                                                                 |

## For AI Agents

### Atoms (verified names)

All derived from URL params and API responses:

- `roomIdAtom`, `deckIdAtom`, `totalPagesAtom`, `wsUrlAtom`, `fileNameAtom`, `pdfIdAtom`
- `canStartSessionAtom` — sticky flag; once the PDF SSE stream reports it `true`, it stays `true`

There is **no** `joinCodeAtom` — the join code is the `code` field on `RoomData`/the URL `:code` param.

### Room / Deck / Session

- **Room** (`roomId`): persistent container with a shared join `code`
- **Deck** (`deckId`): the uploaded slide deck belonging to a room
- **Session**: a single live run within a room (see `[[../session]]`)

### Backend Field Inconsistencies

`model/room.ts` documents backend quirks: `JoinRoomResponse` may return `deckId` or `deckID`, and nests deck info under `deck`/`presentation`. Boolean-ish fields (`sticker`, `question`, `feedback`, `slideUnlock`) arrive as `string | boolean`.

<!-- MANUAL: -->
