<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# entities/reaction

## Purpose

Emoji reaction ("stamp") system. Audience members place emoji stamps at a position on a slide; stamps are broadcast over WebSocket and rendered per-slide for all viewers. Provides the emoji icon map, the reaction hook, a sticker preloader, and the EmojiPanel UI.

## Key Files

| File                                 | Description                                                                                                                                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model/reaction.ts`                  | Type definitions: `EmojiId`, `Stamp` (`{ id, xPct, yPct, src }`), `StampsBySlide`                                                                                                                   |
| `model/emoji-icons.ts`               | Emoji icon maps; exports `SELECTED_EMOJI_ICONS` (emoji id → icon src)                                                                                                                               |
| `model/useEmojiReactions.ts`         | Hook: manages its own WebSocket connection, subscribes to `/topic/presentation/{sessionId}/reactions`, accumulates `stampsBySlide`; exposes `addLocalStamp`, `clearStamps`, `disconnect`, `isReady` |
| `model/useStickerLoader.ts`          | Hook: preloads sticker image assets                                                                                                                                                                 |
| `ui/EmojiPanel/index.tsx`            | Emoji picker panel for audience members                                                                                                                                                             |
| `ui/EmojiPanel/EmojiPanel.styles.ts` | Styled-components for the panel                                                                                                                                                                     |
| `index.ts`                           | Public API — `EmojiPanel`, `useEmojiReactions`, `useStickerLoader`, `SELECTED_EMOJI_ICONS`, and the reaction types                                                                                  |

## For AI Agents

### Reaction Flow

1. Audience selects an emoji in `EmojiPanel`
2. The reaction is sent over WebSocket and broadcast on `/topic/presentation/{sessionId}/reactions`
3. `useEmojiReactions.handleReactionMessage` normalizes the payload (`emoji`, `slide` 1-based → 0-based index, `x`/`xPct`, `y`/`yPct`) and appends a `Stamp` to `stampsBySlide`
4. The viewer renders stamps positioned by `xPct`/`yPct` on the matching slide

### Stickers REST vs WebSocket

`@/shared/api/sticker` is **read-only** (`getAllStickers`, `getStickersByAudience`) — used to fetch already-stored stickers for replay/report. Live reactions flow over WebSocket, not that REST module.

### Emoji Asset Folders

Sticker/icon PNGs live under `src/shared/assets/icons/` in state folders (`Emoji/`, `Emoji_hover/`, `Emoji_selected/`, `Emoji_sticker/`). `emoji-icons.ts` maps emoji ids to these assets; `SELECTED_EMOJI_ICONS` is the map used as the default in `useEmojiReactions`.

<!-- MANUAL: -->
