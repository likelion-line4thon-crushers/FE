<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# shared

## Purpose
Framework-agnostic layer providing API clients, utility functions, configuration constants, and reusable UI primitives. No imports from `entities`, `pages`, `widgets`, or `app` — this layer is the foundation all other layers build on.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `api/` | All HTTP and WebSocket communication with the backend (see `api/AGENTS.md`) |
| `lib/` | Pure utility functions: logging, localStorage, URL helpers, blob utils (see `lib/AGENTS.md`) |
| `config/` | App-wide constants (storage key names) |
| `ui/` | Reusable UI components not tied to any feature (see `ui/AGENTS.md`) |
| `assets/` | Type declarations and icon/image assets |

## Key Files

| File | Description |
|------|-------------|
| `assets.d.ts` | TypeScript module declarations for PNG/SVG/image imports |
| `config/storage-keys.ts` | Centralised localStorage key constants |

## For AI Agents

### Import Constraint
`shared/` is the lowest layer — it must not import from `entities/`, `pages/`, `widgets/`, or `app/`. Any violation breaks the FSD dependency rule.

### Adding New Shared Utilities
- Pure functions → `lib/`
- Backend API calls → `api/`
- Constants / config values → `config/`
- Reusable components → `ui/`

<!-- MANUAL: -->
