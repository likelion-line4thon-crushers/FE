<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# widgets

## Purpose
Cross-page composite components that are too complex for `shared/ui/` but are reused across multiple routes. Widgets may import from `shared/`, `entities/`, and `pages/`. They are composed into pages by the `app/` layer.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `app-header/` | Top navigation bar: session info, share button, room details (see `app-header/AGENTS.md`) |
| `presentation-layout/` | Full-page layout container with slide viewer, settings panel (see `presentation-layout/AGENTS.md`) |
| `slides-sidebar/` | Slide thumbnail strip for navigation (see `slides-sidebar/AGENTS.md`) |

## For AI Agents

### Widget Slice Structure
```
<widget-name>/
  model/        ← widget-level state and hooks
  ui/           ← composed UI components
  index.ts      ← public API
```

### When to Create a Widget (vs. keeping logic in a page)
Create a widget when the same complex component (with its own state) appears in 2+ pages, or when the component is large enough that embedding it directly in a page file would obscure the page's intent.

<!-- MANUAL: -->
