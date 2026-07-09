# Boini — line4thon-presentation-frontend

Real-time interactive presentation platform: presenters share slides, audiences react with
emoji stamps, ask questions, and give feedback live over STOMP/WebSocket.
React 19 + TypeScript + Vite, structured by Feature-Sliced Design (FSD) v2.1.

## Commands

```bash
pnpm dev              # Vite dev server
pnpm build            # production build
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint
pnpm test:unit        # Vitest unit tests
pnpm test:ct          # Playwright component tests
pnpm test:e2e         # Playwright E2E (requires running dev server)
```

Before claiming work done, run `pnpm typecheck` (and `pnpm build` for larger changes).

## Architecture

FSD layers, lowest → highest: `shared` → `entities` → `features` → `widgets` → `pages` → `app`.
Imports flow strictly toward lower layers; each slice's public API is its `index.ts`.
Details: `src/AGENTS.md` and `.claude/rules/`.

- Global state: Jotai atoms (not React Context)
- Styling: styled-components v6, co-located `.styles.ts` files
- All backend I/O in `src/shared/api/` — axios instances plus the `WebSocketService`
  singleton (STOMP over SockJS) in `src/shared/api/websocket.ts`
- `@/` alias resolves to `src/`

## Routes (`src/app/router.tsx`)

| Path                      | Page                | Role                                                        |
| ------------------------- | ------------------- | ----------------------------------------------------------- |
| `/`                       | LandingPage         | Entry — create or join                                      |
| `/rooms/new`              | PresenterRoomGate   | Presenter: create room                                      |
| `/rooms/:roomId`          | PresenterRoomGate   | Presenter: prepare or present, decided by session state     |
| `/rooms/:roomId/report`   | AiReportPage        | Presenter: post-session AI analysis                         |
| `/rooms/:roomId/broadcast`| BroadcastScreenPage | Projector: bare fullscreen slide mirror (outside app shell) |
| `/join/:code`             | AudienceRoomPage    | Audience: view slides and interact                          |
| `/audience/:code/rating`  | RatingPage          | Audience: post-session rating                               |

## Directories

- `src/` — application code in FSD layers (see `src/AGENTS.md`)
- `tests/` — unit / component / E2E suites (see `tests/AGENTS.md`)
- `docs/` — `session-lifecycle.md` (read before touching WebSocket handling) and backend specs
- `public/` — static assets only; bundle assets live in `src/shared/assets/`
