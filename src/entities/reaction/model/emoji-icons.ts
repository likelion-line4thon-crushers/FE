import type { EmojiId } from "./reaction";

import interestSticker from "@/shared/assets/icons/Emoji_sticker/Interesting_sticker.png";
import surpriseSticker from "@/shared/assets/icons/Emoji_sticker/surprising_sticker.png";
import curiousSticker from "@/shared/assets/icons/Emoji_sticker/curious_sticker.png";
import excitingSticker from "@/shared/assets/icons/Emoji_sticker/Exciting_sticker.png";
import angrySticker from "@/shared/assets/icons/Emoji_sticker/angry_sticker.png";
import sadSticker from "@/shared/assets/icons/Emoji_sticker/Sad_sticker.png";
import okSticker from "@/shared/assets/icons/Emoji_sticker/O_sticker.png";
import xSticker from "@/shared/assets/icons/Emoji_sticker/X_sticker.png";

export const SELECTED_EMOJI_ICONS: Record<EmojiId, string> = {
  1: interestSticker,
  2: surpriseSticker,
  3: curiousSticker,
  4: excitingSticker,
  5: angrySticker,
  6: sadSticker,
  7: okSticker,
  8: xSticker,
};
