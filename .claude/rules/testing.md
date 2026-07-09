---
paths:
  - "tests/**"
  - "playwright/**"
---

# Testing

```bash
pnpm test:unit          # Vitest unit tests (pure logic, no DOM, no network)
pnpm test:ct            # Playwright component tests (mount via playwright/index.tsx)
pnpm test:e2e           # Playwright E2E — requires a running dev server
pnpm typecheck          # TypeScript check without emit
```

## Isolation

- Unit tests: pure functions only — no DOM, no network
- Component tests: `@playwright/experimental-ct-react`
- E2E tests: stub the WebSocket transport with `window.__BOINI_TEST_MODE__ = true` +
  `window.__BOINI_TEST_WS__` (a `TestWebSocketTransport`) — never hit a real backend

## Policy

Do not add new test cases unless explicitly asked. Verify changes via `pnpm typecheck`
and `pnpm build` instead.
