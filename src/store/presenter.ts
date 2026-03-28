import { atom } from "jotai";
import type { AudienceStats } from "../types";

/** * Presenter-specific atoms */
export const audienceStatsAtom = atom<AudienceStats>({
  prev: 0,
  current: 0,
  next: 0,
});

export const audienceCountAtom = atom<number>(0);
