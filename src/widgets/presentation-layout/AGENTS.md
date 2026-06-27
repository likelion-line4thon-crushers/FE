<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# widgets/presentation-layout

## Purpose

Full-page layout container for the live presentation views. Composes the slide viewer and the settings panel into the overall page structure shared by presenter and audience.

## Key Files

| File                                              | Description                                                                                 |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `ui/layout/PresentationLayout.tsx` / `.styles.ts` | Root layout — arranges viewer, sidebar, panels                                              |
| `ui/viewer/SlideViewer.tsx` / `.styles.ts`        | Slide image viewer                                                                          |
| `ui/viewer/SlideContainer.tsx`                    | Slide container wrapper                                                                     |
| `ui/settings/SettingsPanel.tsx` / `.styles.ts`    | QuickSettings toggles + audience count (also exports `QuickSettingToggle`, `AudienceCount`) |
| `ui/settings/LiveWaitingBox.tsx`                  | Pre-live waiting state box                                                                  |
| `ui/settings/LiveStatusText.tsx`                  | Live/waiting status label                                                                   |
| `ui/settings/LiveLockButton.tsx`                  | Slide unlock/lock control                                                                   |
| `ui/index.ts`, `index.ts`                         | Barrel exports / public API                                                                 |

## For AI Agents

### Props, Not Direct Sends

`SettingsPanel` is presentational: it takes `quickSettings: QuickSettings` and an `onOptionChange(optionKey, value)` callback. It does **not** call `websocketService` directly — the owning page wires `onOptionChange` to `sendOptionChange`. Keep WebSocket side effects in page/model hooks, not in this widget.

### Layout Composition

The layout positions `AppHeader` (`[[../app-header]]`) above, `SidebarSlides` (`[[../slides-sidebar]]`) beside, and the `viewer/` in the main area. Avoid duplicating this structure inside page components.

<!-- MANUAL: -->
