# tests

```bash
pnpm test:unit          # Vitest unit tests (pure logic — no DOM, no network)
pnpm test:ct            # Playwright component tests (mount via playwright/index.tsx)
pnpm test:e2e           # Playwright E2E — requires a running dev server
pnpm test:install-browsers  # install Chromium for Playwright
```

- `unit/` — Vitest · `component/` — Playwright CT · `e2e/` — Playwright · `setup/` — shared mocks/config
- E2E stubs the WebSocket transport: set `window.__BOINI_TEST_MODE__ = true` and provide
  `window.__BOINI_TEST_WS__` (a `TestWebSocketTransport`) — never hit a real backend
- Do not add new test cases unless explicitly asked; verify via `pnpm typecheck` / `pnpm build`
