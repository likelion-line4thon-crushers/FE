<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# pages/rating

## Purpose
Audience post-session rating page at `/audience/:code/rating`. Displayed after the presenter ends the session. Allows the audience member to submit a satisfaction rating.

## Key Files

| File | Description |
|------|-------------|
| `ui/RatingPage.tsx` | Rating submission form |
| `model/resolveRatingSessionContext.ts` | Route resolver: extracts session context from join code for the rating submission |
| `index.ts` | Exports `RatingPage` |

## For AI Agents

### Navigation
Audience is redirected here automatically when a `SESSION_STATE` message with `status` `"ended"`/`"ENDED"` arrives on `/topic/p/{roomId}/public` in `AudienceRoomPage`. The `:code` param from the URL identifies which session to submit the rating to (see `resolveRatingSessionContext`).

<!-- MANUAL: -->
