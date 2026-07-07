<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# pages/ai-report

## Purpose

Post-session AI analysis page at `/rooms/:roomId/report`. Fetches and displays AI-generated insights including top questions, reaction statistics, slide replay, and review sections.

## Key Files

| File                         | Description                                              |
| ---------------------------- | -------------------------------------------------------- |
| `ui/AiReportPage.tsx`        | Root report page component                               |
| `ui/AiReportPage.styles.ts`  | Page-level styles                                        |
| `ui/navigation/SideHeader/`  | Sidebar navigation for scrolling between report sections |
| `ui/sections/PopularSlide/`  | Most-viewed / most-reacted slide section                 |
| `ui/sections/QuestionSlide/` | Questions grouped by slide section                       |
| `ui/sections/ReplaySlide/`   | Session replay timeline section                          |
| `ui/sections/ReviewSlide/`   | Audience review scores per slide                         |
| `ui/sections/Top3/`          | Top 3 questions section                                  |
| `ui/sections/TotalReaction/` | Aggregated emoji reaction counts chart                   |
| `ui/summary/AITitle/`        | AI-generated session title display                       |
| `ui/summary/ContentBox/`     | Generic content wrapper with consistent styling          |
| `ui/summary/SlideNumber/`    | Slide number badge component                             |
| `ui/summary/SlideSkeleton/`  | Loading skeleton for slide thumbnails                    |
| `model/room-info.ts`         | Resolves room info needed to request report data         |
| `index.ts`                   | Exports `AiReportPage`                                   |

## For AI Agents

### Data Flow

1. Page resolves room info (`model/room-info.ts`)
2. Each section is backed by a dedicated fetch in `@/shared/api/ai-report` (e.g. `fetchTopQuestionsReport`, `fetchMostReactionSticker`, `fetchTopSlideReport`, `fetchMostRevisitSlide`, `fetchFeedbackReport`, `fetchStoredAiReport`) — not one monolithic payload
3. `recharts` renders the `TotalReaction` chart

### Report Sections

The report is divided into navigable sections. `SideHeader` renders a fixed sidebar nav that scrolls to each section. Sections are: Top3, QuestionSlide, TotalReaction, PopularSlide, ReviewSlide, ReplaySlide.

<!-- MANUAL: -->
