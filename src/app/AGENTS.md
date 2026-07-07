<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# app

## Purpose
Application bootstrap layer. Mounts the React root, configures the router, and renders the shell `<App>` component with an `<Outlet>` for child routes. This layer may import from any FSD layer.

## Key Files

| File | Description |
|------|-------------|
| `main.tsx` | `ReactDOM.createRoot` entry point — mounts `<RouterProvider>` |
| `App.tsx` | Root component — wraps child routes with global layout (styled-components `ThemeProvider`, global styles, etc.) |
| `router.tsx` | `createBrowserRouter` config defining all application routes |

## Routes Defined Here

| Path | Component | Notes |
|------|-----------|-------|
| `/` | `LandingPage` | Index route |
| `/rooms/new` | `SessionCreatePage` | Create new presentation |
| `/rooms/:roomId/prepare` | `SessionCreatePage` | Re-configure existing room |
| `/rooms/:roomId/present` | `PresenterRoomPage` | Live presentation |
| `/rooms/:roomId/report` | `AiReportPage` | Post-session AI report |
| `/join/:code` | `AudienceRoomPage` | Audience join via code |
| `/audience/:code/rating` | `RatingPage` | Post-session audience rating |

## For AI Agents

### Working In This Directory
- Adding a new page: add the route in `router.tsx` and import the page from `@/pages/<name>`
- Never put business logic here — this layer only wires routes and provides the app shell
- Global providers (if needed) belong in `App.tsx`

<!-- MANUAL: -->
