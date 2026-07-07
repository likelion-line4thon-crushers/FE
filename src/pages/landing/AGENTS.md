<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# pages/landing

## Purpose
Entry page at `/`. Allows presenters to create a new session or enter an existing room, and audiences to join via code. Minimal state — primarily navigation.

## Key Files

| File | Description |
|------|-------------|
| `ui/LandingPage.tsx` | Landing page component |
| `index.ts` | Exports `LandingPage` |

## For AI Agents

### Navigation
- "Create presentation" → navigates to `/rooms/new`
- "Join" with code → navigates to `/join/:code`

<!-- MANUAL: -->
