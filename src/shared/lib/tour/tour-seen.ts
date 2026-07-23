import { storageKeys } from "@/shared/config/storage-keys";
import type { TourSurface } from "./types";

/** localStorage 기반 "이 서페이스 투어를 봤는지" 플래그. 첫 방문 자동 실행 판정에 사용. */
export const tourSeen = {
  isSeen(surface: TourSurface): boolean {
    try {
      return localStorage.getItem(storageKeys.tourSeen(surface)) === "true";
    } catch {
      return false;
    }
  },
  markSeen(surface: TourSurface) {
    try {
      localStorage.setItem(storageKeys.tourSeen(surface), "true");
    } catch {
      /* ignore */
    }
  },
  reset(surface: TourSurface) {
    try {
      localStorage.removeItem(storageKeys.tourSeen(surface));
    } catch {
      /* ignore */
    }
  },
} as const;
