---
paths:
  - "src/**"
---

# FSD Architecture (Feature-Sliced Design v2.1)

Layer order, lowest → highest: `shared` → `entities` → `features` → `widgets` → `pages` → `app`.

## Import direction (strict)

- `shared/` imports from no other layer
- `entities/` → `shared/` only
- `features/` → `shared/`, `entities/`
- `widgets/` → `shared/`, `entities/`, `features/`
- `pages/` → `shared/`, `entities/`, `features/`, `widgets/` (pages compose widgets)
- `app/` → any layer

Enforced by `eslint-plugin-boundaries` in `eslint.config.js`. Exception (documented debt):
`shared/` may use type-only imports from `entities/`; value imports are still errors.
- Same-layer imports are forbidden (a page never imports another page)
- Always use the `@/` alias for cross-layer imports (e.g. `@/entities/question`)

Layer boundaries are enforced by `eslint-plugin-boundaries` (`pnpm lint`). One codified
exception: `shared` may import **types** from `entities` (existing debt in `shared/api`);
value imports from `entities` are still errors.

## Public API

Every slice exposes its API through `index.ts` only. Never deep-import slice internals
(e.g. `@/entities/question/model/question`) from outside the slice.

## Slice structure

```
<slice>/
  model/    ← hooks + logic: WebSocket subscriptions, fetches, derived state
  ui/       ← components; render only — no direct API calls in UI files
  index.ts  ← public API
```

## What goes where

- Pure functions → `src/shared/lib/` · API calls → `src/shared/api/` · constants → `src/shared/config/` · generic components → `src/shared/ui/`
- An entity owns its types, Jotai atoms, and pure domain logic. Page-specific orchestration stays in `pages/*/model/`
- `src/shared/ui/` components must be generic — no business concepts (rooms, questions); those belong in `entities/*/ui/` or a page
- Global client/UI state: Jotai atoms, not React Context. Server state: TanStack Query —
  `queryOptions` + key factories live beside the axios fns in `src/shared/api/`; consumers
  apply only per-use policy (`enabled`, `select`, overrides)
- `src/app/` only wires routes (`router.tsx`) and global providers (`App.tsx`) — no business logic

## Conventions

- Logging: `createLogger(namespace)` from `@/shared/lib/logger` — no bare `console.log`
- localStorage: helpers in `@/shared/lib/storage` with keys from `@/shared/config/storage-keys` — never hardcode key strings
