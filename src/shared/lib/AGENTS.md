<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# shared/lib

## Purpose
Pure utility functions with no UI dependencies. Used freely across all FSD layers.

## Key Files

| File | Description |
|------|-------------|
| `logger.ts` | `createLogger(namespace)` — prefixed console logger used across the codebase |
| `storage.ts` | Type-safe localStorage read/write helpers keyed by `storage-keys.ts` constants |
| `url.ts` | URL construction and parsing utilities |
| `blob.ts` | Blob/File manipulation helpers (e.g., for PDF chunking) |

## For AI Agents

### Logger Pattern
```ts
const log = createLogger("myFeature");
log.log("normal message");
log.warn("warning");
log.error("error", payload);
```
Always create a logger per module with a descriptive namespace — avoids bare `console.log` calls.

### Storage Helpers
Use `storage.ts` helpers with keys from `@/shared/config/storage-keys.ts`. Never hardcode localStorage key strings.

<!-- MANUAL: -->
