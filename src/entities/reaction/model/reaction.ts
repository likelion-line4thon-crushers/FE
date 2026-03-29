export type EmojiId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Stamp {
  id: string;
  xPct: number;
  yPct: number;
  src: string;
}

export type StampsBySlide = Record<string, Stamp[]>;
