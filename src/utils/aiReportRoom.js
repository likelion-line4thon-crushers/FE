const STORAGE_KEYS = [
  "ai_report_room",
  "aiReportRoom",
  "boini_room",
  "roomData",
];

const parseStoredJson = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn("[aiReportRoom] 저장된 방 정보 파싱 실패:", error);
    return null;
  }
};

export const loadStoredRoomData = () => {
  if (typeof window === "undefined") {
    return null;
  }

  for (const key of STORAGE_KEYS) {
    try {
      const raw =
        window.sessionStorage?.getItem(key) ??
        window.localStorage?.getItem(key) ??
        null;

      const parsed = parseStoredJson(raw);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch (error) {
      console.warn(`[aiReportRoom] ${key} 접근 중 오류 발생:`, error);
    }
  }

  return null;
};

const extractLocationRoomData = (locationState) => {
  if (!locationState) {
    return null;
  }

  if (
    locationState.roomData &&
    typeof locationState.roomData === "object" &&
    locationState.roomData !== null
  ) {
    return locationState.roomData;
  }

  if (locationState.roomId) {
    return locationState;
  }

  return null;
};

const deriveTotalPages = (merged) =>
  merged.totalPages ??
  merged.slideCount ??
  merged.totalPage ??
  merged.pages ??
  null;

export const computeRoomInfo = (storedRoomData, locationState) => {
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
