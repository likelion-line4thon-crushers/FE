<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# entities/slide

## Purpose

Slide image loading and slide-related types. Slide images are fetched from the backend over REST (not stored in a global atom); the hooks here own their own local loading state. Also defines audience position statistics used by the presenter.

## Key Files

| File                      | Description                                                                                                                                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model/slide.ts`          | Type definitions only: `SlideUrl` (`{ page, url }`), `AudienceStats` (`prev`/`current`/`next` counts), `RawAudienceStats` (backend field names `frontCount`/`currentCount`/`backCount`)                   |
| `model/useSlideLoader.ts` | Hook: loads ALL slide URLs for a deck via `fetchAllOriginalSlideUrls(roomId, deckId, totalPages)`; exposes `slides`, `loading`, `error`, `retry`, `isInitialLoading`, `showPlaceholder`, `waitingMessage` |
| `model/useSlideImage.ts`  | Hook: loads a SINGLE slide image via `getOriginalSlideUrl(roomId, deckId, slideNumber)`; exposes `imageUrl`, `loading`, `error`, `hasImage`, `reload`                                                     |
| `index.ts`                | Public API — exports both hooks (default exports re-exported as named) and the `AudienceStats`/`RawAudienceStats`/`SlideUrl` types                                                                        |

## For AI Agents

### No Slide Atoms

There is **no** `slideImagesAtom` or `currentSlideIndexAtom`. Slide URLs live in the hooks' local React state. The current slide index is owned by each page's navigation model (e.g. `pages/audience-room/model/navigation/`), not by this entity.

### Slide Indexing

- Backend slide endpoints use 1-based page numbers (`SlideUrl.page`, the `slideNumber` arg)
- Page navigation in the room pages converts to 0-based indices for array access
- `useSlideImage` normalizes `slideNumber` and only loads when `roomId`, `deckId`, and a valid positive `slideNumber` are all present

### Deck vs Room

Slides belong to a **deck** (`deckId`) within a **room** (`roomId`). Both IDs plus `totalPages` are required to load slides.

<!-- MANUAL: -->
