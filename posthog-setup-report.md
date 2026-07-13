<wizard-report>
# PostHog post-wizard report

The wizard has completed a full PostHog integration for **Boini** — a real-time interactive presentation platform. `posthog-js` and `@posthog/react` were installed, the SDK is initialised in `src/app/main.tsx` with `PostHogProvider` wrapping the router, and 13 events are now captured across every key user flow: presenter file upload, session lifecycle, audience join/react/question interactions, post-session feedback, and AI report access. Audience members are identified by their server-assigned `audienceId` on join.

| Event name | Description | File |
|---|---|---|
| `presentation_file_selected` | Presenter selects or drops a valid presentation file on the landing page | `src/pages/landing/ui/LandingPage.tsx` |
| `presentation_started` | Presenter clicks the arrow to proceed to session preparation | `src/pages/landing/ui/LandingPage.tsx` |
| `session_started` | Presenter confirms starting the live session | `src/widgets/app-header/ui/header/AppHeader.tsx` |
| `session_ended` | Presenter ends the live session | `src/widgets/app-header/ui/header/AppHeader.tsx` |
| `share_modal_opened` | Presenter opens the share/invite modal | `src/widgets/app-header/ui/header/AppHeader.tsx` |
| `session_setting_changed` | Presenter toggles a live session quick setting (questions, stickers, slide unlock) | `src/pages/presenter-room/ui/PresenterRoomPage.tsx` |
| `audience_session_joined` | Audience member successfully joins a live session | `src/pages/audience-room/ui/AudienceRoomPage.tsx` |
| `emoji_stamp_placed` | Audience member places an emoji stamp on the slide | `src/pages/audience-room/ui/AudienceRoomPage.tsx` |
| `question_submitted` | Audience member submits a question during a live session | `src/pages/audience-room/model/question/useAudienceQuestions.ts` |
| `question_liked` | Audience member likes (upvotes) a question | `src/pages/audience-room/model/question/useAudienceQuestions.ts` |
| `feedback_submitted` | Audience member submits post-session rating and feedback | `src/pages/rating/ui/RatingPage.tsx` |
| `feedback_skipped` | Audience member skips the post-session feedback form | `src/pages/rating/ui/RatingPage.tsx` |
| `ai_report_viewed` | Presenter opens the AI analytics report after a session | `src/pages/ai-report/ui/AiReportPage.tsx` |

## Next steps

We've built a dashboard and five insights in PostHog to monitor user behaviour based on the events above:

- **Dashboard**: [Analytics basics (wizard)](https://us.posthog.com/project/504505/dashboard/1836132)
- **Presenter onboarding funnel**: [ErZm1lWv](https://us.posthog.com/project/504505/insights/ErZm1lWv) — file selected → presentation started → session started
- **Audience engagement funnel**: [ZtZccTvC](https://us.posthog.com/project/504505/insights/ZtZccTvC) — session joined → question submitted
- **Sessions started per day**: [EcVD5m70](https://us.posthog.com/project/504505/insights/EcVD5m70) — daily session_started vs session_ended trend
- **Audience interactions per day**: [rcDQtRL4](https://us.posthog.com/project/504505/insights/rcDQtRL4) — emoji stamps, questions, and likes stacked
- **Feedback submitted vs skipped**: [0qbM0WM7](https://us.posthog.com/project/504505/insights/0qbM0WM7) — daily comparison of feedback_submitted vs feedback_skipped

## Verify before merging

- [x] Run a full production build (`pnpm build`) and fix any lint or type errors introduced by the generated code. — passes; fixed wizard's broken `core-js` placeholder in `pnpm-workspace.yaml`
- [x] Run the test suite (`pnpm test:unit`, `pnpm test:ct`) — 3 unit failures are pre-existing on the branch (rating-context / feedback-answers impl-test drift), unrelated to PostHog; all other tests pass.
- [x] Add `VITE_PUBLIC_POSTHOG_PROJECT_TOKEN` and `VITE_PUBLIC_POSTHOG_HOST` to `.env.example` and any CI/bootstrap scripts so collaborators know what to set. — no CI in repo; **remaining action: set both vars in Cloudflare Pages dashboard for prod**
- [ ] ~~Wire source-map upload~~ — deferred by decision (2026-07-13); revisit if prod error debugging becomes a need
- [x] Confirm the returning-visitor path also calls `identify` — verified: the join effect's guard ref resets per mount, so refresh re-identifies with the same durable `audienceId`. No change needed.

## Post-wizard additions (2026-07-13)

11 more events (upload outcome, join failure, `ws_disconnected`/`ws_reconnected`, browse-away/return-to-live,
broadcast screen, invite copy, file rejected, feedback questions saved, CSV download), `posthog.group("session", roomId)`
on presenter/audience/broadcast/report, `capture_exceptions: true`, and a WebSocket reconnect fix
(fresh SockJS per attempt + subscription retain-and-replay) in `src/shared/api/websocket.ts`.

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-react-react-router-7-data/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
