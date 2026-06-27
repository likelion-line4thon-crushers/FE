<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# widgets/slides-sidebar

## Purpose

Scrollable slide thumbnail strip for navigation. Renders slide thumbnails, highlights the active slide, and enforces reveal limits for locked slides.

## Key Files

| File                         | Description                                                           |
| ---------------------------- | --------------------------------------------------------------------- |
| `ui/SidebarSlides.tsx`       | Thumbnail strip — clickable thumbnails with lock/placeholder handling |
| `ui/SidebarSlides.styles.ts` | Styles for the strip                                                  |
| `index.ts`                   | Public API                                                            |

## For AI Agents

### Props, Not Atoms

`SidebarSlides` is presentational and fully prop-driven:

- `slides?: (string | { thumbnailUrl })[]` — thumbnail sources
- `currentSlide: number` — active index (0-based) to highlight
- `setCurrentSlide?(index, options?)` — selection callback; called as `setCurrentSlide(index, { source: "sidebar" })`
- `isWaiting`, `placeholderCount` — show placeholders before slides load
- `maxRevealedPage`, `revealAllSlides` — lock slides beyond the revealed range

It does **not** read entity atoms or call `websocketService`. The parent page supplies the data and decides whether a selection broadcasts.

### Lock Logic

When `revealAllSlides` is false and `maxRevealedPage` is set, slides with `index + 1 > maxRevealedPage + 1` are locked (non-clickable).

<!-- MANUAL: -->
