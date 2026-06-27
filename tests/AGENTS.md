<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# tests

## Purpose
All test suites for the application, organized by test type. Uses Playwright for E2E and component tests, Vitest for unit tests.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `unit/` | Vitest unit tests for pure logic (no DOM) |
| `e2e/` | Playwright end-to-end tests against a running dev server |
| `component/` | Playwright component tests (CT) — mount components in isolation |
| `setup/` | Shared test setup: global mocks, test utilities, environment config |

## For AI Agents

### Running Tests
```bash
pnpm test:unit          # Run Vitest unit tests once
pnpm test:unit:watch    # Vitest in watch mode
pnpm test:ct            # Playwright component tests
pnpm test:e2e           # Playwright E2E (dev server must be running)
pnpm test:install-browsers  # Install Chromium for Playwright
```

### Test Isolation
- Unit tests: pure functions only, no DOM, no network
- Component tests: use `@playwright/experimental-ct-react`, mount via `playwright/index.tsx`
- E2E tests: use `window.__BOINI_TEST_MODE__` + `window.__BOINI_TEST_WS__` to stub WebSocket transport without a real server

### Common Patterns
- WebSocket stubbing: set `window.__BOINI_TEST_MODE__ = true` and provide a `TestWebSocketTransport` implementation to simulate real-time events without a backend

<!-- MANUAL: -->
