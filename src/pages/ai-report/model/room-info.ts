import { createLogger } from "@/shared/lib/logger";
import { STORAGE_KEYS } from "@/shared/config/storage-keys";

const log = createLogger("ai-report-room");

const ROOM_INFO_KEYS = [STORAGE_KEYS.AI_REPORT_ROOM, STORAGE_KEYS.ROOM];

const parseStoredJson = (value: any) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    log.warn("저장된 방 정보 파싱 실패:", error);
    return null;
  }
};

export const loadStoredRoomData = () => {
  if (typeof window === "undefined") {
    return null;
  }

  for (const key of ROOM_INFO_KEYS) {
    try {
      const raw = window.sessionStorage?.getItem(key) ?? window.localStorage?.getItem(key) ?? null;

      const parsed = parseStoredJson(raw);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch (error) {
      log.warn(`${key} 접근 중 오류 발생:`, error);
    }
  }

  return null;
};

const extractLocationRoomData = (locationState: any) => {
  if (!locationState) {
    return null;
  }

  if (locationState.roomId) {
    return locationState;
  }

  return null;
};

const deriveTotalPages = (merged: any) =>
  merged.totalPages ?? merged.slideCount ?? merged.totalPage ?? merged.pages ?? null;

export const computeRoomInfo = (storedRoomData: any, locationState: any) => {
  const fromLocation = extractLocationRoomData(locationState);
  const merged = {
    ...(storedRoomData || {}),
    ...(fromLocation || {}),
  };

  return {
    roomId: merged.roomId ?? null,
    deckId: merged.deckId ?? null,
    totalPages: deriveTotalPages(merged),
    fileName: merged.fileName ?? locationState?.fileName ?? null,
  };
};

export default {
  loadStoredRoomData,
  computeRoomInfo,
};
