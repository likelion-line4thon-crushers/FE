import { useEffect, useMemo, useState } from "react";
import { getAllStickers } from "@/shared/api/sticker";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("ai-report");

export interface SlideSticker {
  id: string;
  emoji: number;
  slide: number;
  xPct: number;
  yPct: number;
}

const buildKey = (emoji: number, slide: number) => `${emoji}:${slide}`;

/**
 * 룸의 전체 스티커(좌표 포함)를 한 번만 불러와 (emoji, slide) 별로 그룹핑한다.
 * 리포트에서 슬라이드 위에 실제 찍힌 스티커를 재현할 때 사용.
 */
const useRoomStickers = (roomId?: string | null) => {
  const [stickers, setStickers] = useState<SlideSticker[]>([]);

  useEffect(() => {
    if (!roomId) {
      setStickers([]);
      return;
    }

    let cancelled = false;

    getAllStickers(roomId)
      .then((raw) => {
        if (cancelled) return;
        const normalized: SlideSticker[] = [];
        (raw ?? []).forEach((item: any, index: number) => {
          const emoji = Number(item?.emoji);
          const slide = Number(item?.slide);
          const xPct = Number(item?.x ?? item?.xPct);
          const yPct = Number(item?.y ?? item?.yPct);
          if (
            !Number.isFinite(emoji) ||
            !Number.isFinite(slide) ||
            slide < 1 ||
            !Number.isFinite(xPct) ||
            !Number.isFinite(yPct)
          ) {
            return;
          }
          normalized.push({ id: `${emoji}-${slide}-${index}`, emoji, slide, xPct, yPct });
        });
        setStickers(normalized);
      })
      .catch((error) => {
        if (!cancelled) {
          log.error("스티커 좌표 로드 실패:", error);
          setStickers([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const stickersByEmojiSlide = useMemo(() => {
    const map = new Map<string, SlideSticker[]>();
    stickers.forEach((sticker) => {
      const key = buildKey(sticker.emoji, sticker.slide);
      const list = map.get(key);
      if (list) list.push(sticker);
      else map.set(key, [sticker]);
    });
    return map;
  }, [stickers]);

  const getStickers = useMemo(
    () =>
      (emoji?: number | null, slide?: number | null): SlideSticker[] => {
        if (!emoji || !slide) return [];
        return stickersByEmojiSlide.get(buildKey(emoji, slide)) ?? [];
      },
    [stickersByEmojiSlide]
  );

  return { getStickers };
};

export default useRoomStickers;
