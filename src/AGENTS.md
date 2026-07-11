# src — FSD layers

Feature-Sliced Design v2.1. Layer order, lowest → highest:
`shared` → `entities` → `features` → `widgets` → `pages` → `app`.

## Import rules (strict)

- `shared/` imports from no other layer
- `entities/` → `shared/` only
- `features/` → `shared/`, `entities/`
- `widgets/` → `shared/`, `entities/`, `features/`
- `pages/` → `shared/`, `entities/`, `features/`, `widgets/` (pages compose widgets)
- `app/` → any layer

Enforced by `eslint-plugin-boundaries` (`pnpm lint`); type-only imports from
`entities` are allowed in `shared` as documented debt.
- Same-layer imports are forbidden; use the `@/` alias for cross-layer imports
- Enforced by `eslint-plugin-boundaries` via `pnpm lint` (exception: `shared` may
  import types — not values — from `entities`; existing debt in `shared/api`)

## Public API

Every slice exposes its API through `index.ts` only — never deep-import slice internals
from outside the slice.

## Slice structure

```
<slice>/
  model/    ← hooks + logic (WebSocket subscriptions, fetches, derived state)
  ui/       ← components; render only, no direct API calls
  index.ts  ← public API
```

## Layers

- `app/` — router (`router.tsx`), app shell, `PresenterRoomGate`
- `shared/` — `api/` (all HTTP + WebSocket), `lib/` (pure utils, `createLogger`),
  `config/` (storage keys), `ui/` (generic components), `assets/`
- `entities/` — question, reaction, room, session, slide, slide-note
- `features/` — feedback-questions
- `pages/` — landing, session-create, presenter-room, audience-room, broadcast-screen, ai-report, rating
- `widgets/` — app-header, presentation-layout, slides-sidebar
- `styles/` — single `global.css`

Styling: styled-components v6, co-located `.styles.ts`. Client/UI state: Jotai atoms.
Server state: TanStack Query v5 (`queryOptions` factories in `src/shared/api/`).
