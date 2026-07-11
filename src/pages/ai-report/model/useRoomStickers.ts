import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { roomStickersQuery } from "@/shared/api/sticker";

export interface SlideSticker {
  id: string;
  emoji: number;
  slide: number;
  xPct: number;
  yPct: number;
}

const buildKey = (emoji: number, slide: number) => `${emoji}:${slide}`;

// select 메모이제이션을 위해 훅 밖의 안정 참조로 둔다.
const normalizeStickers = (raw: any[]): SlideSticker[] => {
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
  return normalized;
};

/**
 * 룸의 전체 스티커(좌표 포함)를 한 번만 불러와 (emoji, slide) 별로 그룹핑한다.
 * 리포트에서 슬라이드 위에 실제 찍힌 스티커를 재현할 때 사용.
 */
const useRoomStickers = (roomId?: string | null) => {
  const { data } = useQuery({
    ...roomStickersQuery(roomId ?? ""),
    enabled: !!roomId,
    select: normalizeStickers,
  });
  const stickers = useMemo(() => data ?? [], [data]);

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
