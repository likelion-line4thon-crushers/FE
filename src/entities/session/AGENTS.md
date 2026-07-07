<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# entities/session

## Purpose

Session lifecycle state and settings. A session is a single live presentation run. Owns the session status atom, presenter QuickSettings (feature toggles), unlock/reveal settings, and the WebSocket message type definitions exchanged during a live session.

## Key Files

| File                               | Description                                                                                                                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model/session.ts`                 | `QuickSettings` and `UnlockSettings` interface definitions                                                                                                                   |
| `model/store.ts`                   | Jotai atoms: `sessionStatusAtom` (default `"waiting"`), `quickSettingsAtom` (all toggles default `true`), `unlockSettingsAtom`                                               |
| `model/websocket.ts`               | WebSocket message type definitions: `PageChangeMessage`, `OptionChangeMessage`, `UnlockChangeMessage`, `SessionStateMessage`, `ReactionMessage` (NOT a service — just types) |
| `model/useQuickSettingsStorage.ts` | Hook + helpers: persists QuickSettings to localStorage; also exports `DEFAULT_QUICK_SETTINGS` and `readQuickSettingsFromStorage`                                             |
| `index.ts`                         | Public API                                                                                                                                                                   |

## For AI Agents

### Atoms (verified names)

- `sessionStatusAtom: atom<string>` — `"waiting"` → `"live"`/`"ended"`/`"ENDED"`. There is **no** `sessionIdAtom`.
- `quickSettingsAtom: atom<QuickSettings>` — defaults `{ sticker: true, question: true, feedback: true, unlock: true }`
- `unlockSettingsAtom: atom<UnlockSettings>`

### QuickSettings

Presenter feature toggles, mirrored to the audience via WebSocket option messages:

```ts
interface QuickSettings {
  sticker: boolean; // audience emoji reactions enabled
  question: boolean; // audience questions enabled
  feedback: boolean; // audience feedback enabled
  unlock: boolean; // audience can freely navigate slides
}
```

### UnlockSettings

Controls which slides the audience may view:

```ts
interface UnlockSettings {
  maxRevealedPage: number | null;
  revealAllSlides: boolean;
  totalPages: number | null;
  presenterPage: number | null;
}
```

### Message Types

`model/websocket.ts` holds the wire formats only. The actual WebSocket client is the singleton in `@/shared/api/websocket`, and the per-session connection is established inside the room pages' realtime hooks — not stored in an atom here. Note backend field inconsistencies flagged in the source (e.g. `OptionChangeMessage` fields are strings `"true"`/`"false"`; `ReactionMessage` has both `x`/`xPct` and `created_at`/`createdAt`).

<!-- MANUAL: -->
