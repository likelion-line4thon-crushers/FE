<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# pages/session-create

## Purpose

Presenter: upload a PDF and configure the room before going live. PDF is uploaded in chunks; the backend processes pages and streams previews back over SSE, page-by-page, until the presenter is allowed to start the session.

## Key Files

| File                                | Description                                                                                                                                               |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ui/SessionCreatePage.tsx`          | Upload form UI and live slide preview                                                                                                                     |
| `model/useChunkedPdfUpload.ts`      | Hook: splits the PDF into chunks (`CHUNK_SIZE`) and uploads via `uploadPdfInChunks`                                                                       |
| `model/usePdfStream.ts`             | Hook: subscribes via `subscribePdfStream`; fills a local `slides` array (one slot per page), tracks `canStartSession`, `done`, `fatalError`, `pageErrors` |
| `model/resolvePresenterRoomData.ts` | Resolver: fetches existing room data for the `/rooms/:roomId/prepare` route                                                                               |
| `index.ts`                          | Exports `SessionCreatePage`                                                                                                                               |

## For AI Agents

### Upload + Stream Flow

1. User selects a PDF → `useChunkedPdfUpload` POSTs each chunk
2. Backend processes pages and emits SSE events
3. `usePdfStream` receives each `SsePageEvent` and writes `imageUrl` into the page's slot in a **local** `slides` array (component state — there is no global slide atom here)
4. `canStartSession` flips `true` at a specific page (default the 10th, or the last page if the deck has fewer than 10), and is sticky once seen
5. When allowed, the presenter starts the session and navigates to `/rooms/:roomId/present`

### Error Handling in the Stream

- `pageIndex === -1` or `code === 'PDF_LOAD_FAILED'` → fatal error, stream ends
- Per-page failures are recorded in `pageErrors` but the stream continues

### Route Reuse

`SessionCreatePage` serves both `/rooms/new` (fresh) and `/rooms/:roomId/prepare` (reconfigure). `resolvePresenterRoomData` loads existing room data for the prepare route.

<!-- MANUAL: -->
