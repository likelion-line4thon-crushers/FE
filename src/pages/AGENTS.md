<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# pages

## Purpose
Route-level components and their page-scoped model hooks. Each page slice owns its UI and the model logic required to drive that specific route — including WebSocket subscriptions, API fetches, and derived state that belongs to only one route. Pages may import from `shared/` and `entities/`.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `landing/` | Home page — entry point for creating or joining sessions |
| `session-create/` | Presenter: upload PDF, configure room, initiate presentation session |
| `presenter-room/` | Presenter: live slide navigation, question management, audience settings |
| `audience-room/` | Audience: view synced slides, send reactions/questions, free navigation |
| `ai-report/` | Post-session AI-generated analysis: top questions, reactions, replay |
| `rating/` | Audience: post-session satisfaction rating |

## For AI Agents

### Page Slice Structure
Each page follows the same internal layout:
```
<page-name>/
  model/         ← hooks and logic (WebSocket subscriptions, derived state)
  ui/            ← page component and sub-components
  index.ts       ← public API (exports page component only)
```

### Model vs UI
- `model/` hooks are responsible for all side effects (WebSocket subscriptions, fetch calls)
- `ui/` components receive data from hooks and render — no direct API calls inside UI files

### Adding a New Page
1. Create `src/pages/<name>/ui/<Name>Page.tsx` and `index.ts`
2. Add the route in `src/app/router.tsx`
3. Do not import from other pages (same-layer imports are forbidden in FSD)

<!-- MANUAL: -->
