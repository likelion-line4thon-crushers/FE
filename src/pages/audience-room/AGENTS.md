<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# pages/audience-room

## Purpose

Audience's live viewing room at `/join/:code`. Displays the presenter's current slide (when following), allows free navigation when unlocked, and provides emoji reactions, questions, and feedback gated by the presenter's QuickSettings.

## Key Files

| File                                                  | Description                                                                                |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `ui/AudienceRoomPage.tsx` / `.styles.ts`              | Root audience page component                                                               |
| `ui/DelayAudience.tsx` / `.styles.ts`                 | Overlay shown while waiting for the session to go live                                     |
| `ui/AudiencePanel/index.tsx`                          | Interaction panel (emoji picker, question input, feedback)                                 |
| `ui/SlideViewerAudience/SlideViewer_audience.tsx`     | Slide display with audience navigation + stamp overlay                                     |
| `model/index.ts`                                      | Re-exports `room`, `navigation`, `realtime`, `question`, `interaction` model hooks         |
| `model/realtime/useAudienceWebSocketSubscriptions.ts` | Connects the audience socket and wires all topic subscriptions                             |
| `model/realtime/useAudienceFocusHighlight.ts`         | Focus-highlight animation on focusOn                                                       |
| `model/question/useAudienceQuestions.ts`              | Audience question event handling                                                           |
| `model/navigation/`                                   | Audience slide navigation + follow-presenter state                                         |
| `model/room/`                                         | Resolves room/audience identity (`audienceIdAtom`, `audienceTokenAtom`) from the join code |
| `model/interaction/`                                  | Sending reactions, questions, feedback                                                     |

## For AI Agents

### Following vs Free Navigation

- A `followPresenter` ref/state controls whether the audience tracks the presenter
- When following, `/topic/presentation/{roomId}/pageChange` updates the slide (1-based → 0-based)
- When unlocked (`unlockSettingsAtom`), the audience may navigate freely; the sidebar enforces `maxRevealedPage`/`revealAllSlides`
- A `focusOn` text message re-enables following and highlights the slide

### Subscriptions (verified, keyed by `roomId`)

| Topic                                        | Handling                                                   |
| -------------------------------------------- | ---------------------------------------------------------- |
| `/topic/p/{roomId}/public`                   | **Combined handler**: questions AND `SESSION_STATE` events |
| `/topic/presentation/{roomId}/pageChange`    | Follow presenter slide                                     |
| `/topic/presentation/{roomId}/option`        | Update `quickSettingsAtom` (sticker/question/feedback)     |
| `/topic/presentation/{roomId}/option/unlock` | Update `unlockSettingsAtom`                                |
| `/topic/presentation/{roomId}/focusOn`       | Text frame; re-follow + highlight                          |

### Session End → Rating

`/topic/p/{roomId}/public` carries `{ type: "SESSION_STATE", status }`. When `status` is `"ended"`/`"ENDED"`, the page navigates once to `/audience/{code}/rating` (guarded by a `hasNavigatedToRating` ref). There is no separate `SESSION_END` event.

### Pre-Session Wait

Before the session is live, `DelayAudience` is shown; the main viewer mounts when the WebSocket is ready and session state allows.

<!-- MANUAL: -->
