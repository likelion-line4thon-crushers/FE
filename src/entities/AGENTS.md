<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# entities

## Purpose
Business domain models and their associated state management. Each entity slice owns its data shape, Jotai atoms, and pure domain logic. Entities may import from `shared/` but never from `pages/`, `widgets/`, or `app/`.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `question/` | Audience question data model, normalization, upsert logic, cluster types (see `question/AGENTS.md`) |
| `reaction/` | Emoji reaction state, icon registry, sticker loader, EmojiPanel UI (see `reaction/AGENTS.md`) |
| `room/` | Room metadata: roomId, join code, room-level Jotai atoms (see `room/AGENTS.md`) |
| `session/` | Session metadata, presenter QuickSettings, WebSocket connection state (see `session/AGENTS.md`) |
| `slide/` | Slide image loading, slide index atoms, slide page management (see `slide/AGENTS.md`) |

## For AI Agents

### Public API Convention
Each entity exposes its public surface through `index.ts` only. Code outside the entity must import from `@/entities/<name>`, not from internal paths.

### What Belongs Here
- Data type definitions (interfaces, types)
- Jotai atoms for the entity's state
- Pure domain functions (normalize, sort, upsert, filter)
- React hooks that manage entity state in isolation

### What Does NOT Belong Here
- Page-specific orchestration (goes in `pages/*/model/`)
- API calls (go in `shared/api/`)
- UI components beyond simple entity-specific display primitives

<!-- MANUAL: -->
