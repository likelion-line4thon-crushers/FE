---
paths:
  - "src/**/*.{ts,tsx}"
---

# Styling

- All styling uses styled-components v6. Style definitions live in a co-located `.styles.ts` file next to the component
- When implementing from Figma: do not copy fixed width/height — use padding/margin so components stay fluid
- New icons from Figma are extracted as SVG files into `src/shared/assets/`
- Emoji/sticker PNGs live in `src/shared/assets/icons/` state folders (`Emoji/`, `Emoji_hover/`, `Emoji_selected/`, `Emoji_sticker/`)
- Global CSS is a single file: `src/styles/global.css`
