import { useEffect, useRef } from "react";
import { getAllStickers } from "../services/stickerService";
import SELECTED_EMOJI_ICONS from "../constants/emojiIcons";

const useStickerLoader = ({
  roomId,
  addLocalStamp,
  reactionsReady,
  prefix = "loadStickers",
}) => {
  const stickersLoadedRef = useRef(false);

  useEffect(() => {
    stickersLoadedRef.current = false;
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !addLocalStamp || !reactionsReady) return;

    const loadKey = `${roomId}`;
    if (stickersLoadedRef.current === loadKey) return;

    const loadStickers = async () => {
      try {
        const stickers = await getAllStickers(roomId);

        if (!Array.isArray(stickers) || stickers.length === 0) {
          stickersLoadedRef.current = loadKey;
          return;
        }

        stickers.forEach((sticker) => {
          const emojiId = Number(sticker.emoji);
          const slideNumber = Number(sticker.slide); // 1-based
          const xPct = Number(sticker.x);
          const yPct = Number(sticker.y);

          if (
            !Number.isFinite(emojiId) ||
            !Number.isFinite(slideNumber) ||
            slideNumber < 1 ||
            !Number.isFinite(xPct) ||
            !Number.isFinite(yPct)
          ) {
            console.warn(`[${prefix}] 유효하지 않은 스티커 데이터:`, sticker);
            return;
          }

          const slideIndex = slideNumber - 1;

          const emojiSrc = SELECTED_EMOJI_ICONS[emojiId];
          if (!emojiSrc) {
            console.warn(`[${prefix}] 이모지 아이콘을 찾을 수 없음:`, emojiId);
            return;
          }

          const stampId = `loaded-${roomId}-${slideNumber}-${xPct.toFixed(
            2
          )}-${yPct.toFixed(2)}-${emojiId}-${Date.now()}`;
          addLocalStamp(slideIndex, {
            id: stampId,
            xPct,
            yPct,
            src: emojiSrc,
          });
        });

        stickersLoadedRef.current = loadKey;
      } catch (error) {
        console.error(`[${prefix}] 스티커 로드 실패:`, error);
      }
    };

    // useEmojiReactions가 완전히 초기화된 후 스티커 로드
    const timeoutId = setTimeout(() => {
      loadStickers();
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [roomId, addLocalStamp, reactionsReady, prefix]);
};

export default useStickerLoader;
