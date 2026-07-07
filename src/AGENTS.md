<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# src

## Purpose
Application source code organized strictly by Feature-Sliced Design (FSD) v2.1 layers. Each layer has a specific responsibility and import direction is enforced: lower layers never import from higher ones.

## FSD Layer Order (lowest → highest)

| Layer | Directory | Role |
|-------|-----------|------|
| shared | `shared/` | Framework-agnostic utilities, API clients, UI primitives |
| entities | `entities/` | Business domain models, atoms, and pure logic |
| pages | `pages/` | Route-level components and their page-scoped model hooks |
| widgets | `widgets/` | Cross-page composite components (header, layout, sidebar) |
| app | `app/` | Application bootstrap: router, root component |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `app/` | Root component, router, main entry (see `app/AGENTS.md`) |
| `shared/` | Shared utilities, API layer, config, UI primitives (see `shared/AGENTS.md`) |
| `entities/` | Domain entities: question, reaction, room, session, slide (see `entities/AGENTS.md`) |
| `pages/` | Route pages: landing, session-create, presenter-room, audience-room, ai-report, rating (see `pages/AGENTS.md`) |
| `widgets/` | App-wide widgets: header, presentation layout, slides sidebar (see `widgets/AGENTS.md`) |
| `styles/` | Global CSS (single `global.css` file) |

## For AI Agents

### Import Rules
- `shared/` may NOT import from any other layer
- `entities/` may import from `shared/` only
- `pages/` may import from `shared/` and `entities/`
- `widgets/` may import from `shared/`, `entities/`, and `pages/`
- `app/` may import from all layers
- Use `@/` alias for all cross-layer imports (e.g. `@/entities/question`)

### Public API Convention
Every FSD slice exposes its public API through `index.ts` only. Never import from internal paths like `@/entities/question/model/question` from outside the slice.

### Styling
All styles use `styled-components` v6. Style definitions live in co-located `.styles.ts` files next to the component file.

<!-- MANUAL: -->
