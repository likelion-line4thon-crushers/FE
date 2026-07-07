<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# shared/ui

## Purpose
Reusable UI components that are not tied to any business entity or page. Components here must have no dependency on `entities/`, `pages/`, or `widgets/`.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `session-loading-overlay/` | Full-screen loading overlay shown during session initialization |

## For AI Agents

### Adding a New Shared Component
- Must be generic — no references to specific business concepts (rooms, questions, etc.)
- Expose via the slice's `index.ts`
- Style with co-located `.styles.ts`
- If a component needs entity data, it belongs in `entities/*/ui/` or a page, not here

<!-- MANUAL: -->
