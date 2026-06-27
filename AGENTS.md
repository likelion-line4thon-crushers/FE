<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# line4thon-presentation-frontend (Boini)

## Purpose
Real-time interactive presentation platform where presenters share slides and audiences participate via reactions, questions, and feedback. Built with React 19 + TypeScript following Feature-Sliced Design (FSD). The presenter and audience communicate over STOMP/WebSocket in real time.

## Key Files

| File | Description |
|------|-------------|
| `package.json` | Project deps and scripts (`dev`, `build`, `test:unit`, `test:e2e`, `test:ct`, `typecheck`) |
| `vite.config.ts` | Vite build config with `@` alias pointing to `src/` |
| `tsconfig.json` | TypeScript strict mode config |
| `playwright.config.ts` | Playwright E2E test config |
| `playwright-ct.config.ts` | Playwright component test config |
| `vitest.config.ts` | Vitest unit test config |
| `eslint.config.js` | ESLint + TypeScript-ESLint rules |
| `prettier.config.mjs` | Prettier formatting rules |
| `index.html` | HTML entry point |
| `vite-env.d.ts` | Vite environment type declarations |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | Application source code in FSD layers (see `src/AGENTS.md`) |
| `tests/` | Unit, E2E, and component test suites (see `tests/AGENTS.md`) |
| `docs/` | Architecture and backend spec documentation (see `docs/AGENTS.md`) |
| `public/` | Static assets: favicon, Netlify `_redirects` |
| `playwright/` | Playwright component test HTML host and entry point |

## Routes

| Path | Page | Role |
|------|------|------|
| `/` | LandingPage | Entry — create or join session |
| `/rooms/new` | SessionCreatePage | Presenter: upload PDF, create room |
| `/rooms/:roomId/prepare` | SessionCreatePage | Presenter: re-configure existing room |
| `/rooms/:roomId/present` | PresenterRoomPage | Presenter: live presentation controls |
| `/rooms/:roomId/report` | AiReportPage | Presenter: post-session AI analysis |
| `/join/:code` | AudienceRoomPage | Audience: view slides and interact |
| `/audience/:code/rating` | RatingPage | Audience: post-session rating |

## For AI Agents

### Architecture
This project strictly follows **Feature-Sliced Design v2.1**. Layers from lowest to highest dependency:
`shared` → `entities` → `pages` → `widgets` → `app`

Cross-layer imports must only go **upward** (higher layers import lower). Never import from `pages` inside `entities`, etc.

### Working In This Directory
- Root config files only — never put application logic here
- `@/` alias resolves to `src/` — always use this for internal imports
- `public/` contains only static assets; bundle assets live in `src/shared/assets/`

### Testing Requirements
```
pnpm test:unit       # Vitest unit tests (fast, no browser)
pnpm test:ct         # Playwright component tests
pnpm test:e2e        # Playwright E2E tests (requires running dev server)
pnpm typecheck       # TypeScript check without emit
```

### Common Patterns
- Jotai atoms for global state (avoid React Context for shared state)
- `styled-components` v6 for all component styling (`.styles.ts` co-located files)
- `WebSocketService` singleton (STOMP over SockJS) in `src/shared/api/websocket.ts`
- Index files (`index.ts`) as the only public API for each FSD slice

## Dependencies

### External
- `react` 19 — UI framework
- `react-router` 7 — client-side routing
- `jotai` 2 — atomic state management
- `styled-components` 6 — CSS-in-JS styling
- `@stomp/stompjs` + `sockjs-client` — WebSocket real-time messaging
- `axios` — HTTP API client
- `recharts` — Charts for AI report page
- `qrcode.react` — QR code generation for audience join
- `uuid` — Idempotency key generation for WebSocket sends

### Dev
- `vite` 5 — build tool
- `typescript` 6 — type checking
- `playwright` — E2E and component testing
- `vitest` — unit testing
- `eslint` + `prettier` — linting and formatting

<!-- MANUAL: -->
