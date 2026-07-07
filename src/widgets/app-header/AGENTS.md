<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-18 | Updated: 2026-06-18 -->

# widgets/app-header

## Purpose

Top application navigation bar. Shows room/session metadata, session actions, and a share modal with a QR code for audiences to join.

## Key Files

| File                                        | Description                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------ |
| `ui/header/AppHeader.tsx`                   | Main header component                                                                |
| `ui/header/HeaderButtons.tsx`               | Header action buttons                                                                |
| `ui/share/ShareModal.tsx`                   | Share modal — renders `QRCodeSVG` (from `qrcode.react`) for the join URL + copy-link |
| `model/room/useHeaderRoomData.ts`           | Reads room info atoms for the header                                                 |
| `model/room/resolveShareJoinUrl.ts`         | Builds the audience join URL for sharing                                             |
| `model/session/useHeaderSessionAction.ts`   | Session-level actions exposed in the header                                          |
| `ui/index.ts`, `model/index.ts`, `index.ts` | Barrel exports / public API                                                          |

## For AI Agents

### QR Code

`ShareModal` uses `QRCodeSVG` from `qrcode.react`, with the join URL from `resolveShareJoinUrl` as its `value`. (Note: `RoomData` also carries a backend-provided `qrPngBase64`, but the modal renders the SVG component.)

### Header Data

Header content is driven by the room/session model hooks (`useHeaderRoomData`, `useHeaderSessionAction`) reading entity atoms — keep data-fetching in the model, presentation in the ui.

<!-- MANUAL: -->
