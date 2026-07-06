// * Single source of truth for all sessionStorage/localStorage keys

export const STORAGE_KEYS = {
  ROOM: "boini_room",
  AI_REPORT_ROOM: "ai_report_room",
  QUICK_SETTINGS: "presentation_quick_settings",
} as const;

// ? Dynamic key builders — used for per-room or per-audience storage
export const storageKeys = {
  audience: (code: string) => `boini_audience_${code}` as const,
  currentSlide: (roomId: string) => `boini_current_slide_${roomId}` as const,
  timerElapsed: (roomId: string) => `boini_timer_elapsed_${roomId}` as const,
  audienceCount: (roomId: string) => `boini_audience_count_${roomId}` as const,
  quickSettings: (roomId: string) => `presentation_quick_settings_${roomId}` as const,
  pdfDownloadPolicy: (roomId: string) => `boini_pdf_download_policy_${roomId}` as const,
  // 발표자가 이 브라우저에서 세션을 시작했음을 기록하는 마커 (새로고침 시 발표 화면 복원에 사용)
  sessionStarted: (roomId: string) => `boini_session_started_${roomId}` as const,
} as const;

/** 발표 세션 시작 마커 헬퍼 — 백엔드 상태 조회가 실패해도 발표자 본인의 새로고침을 복원. */
export const sessionStartMarker = {
  set(roomId: string) {
    try {
      sessionStorage.setItem(storageKeys.sessionStarted(roomId), "true");
    } catch {
      /* ignore */
    }
  },
  isSet(roomId: string): boolean {
    try {
      return sessionStorage.getItem(storageKeys.sessionStarted(roomId)) === "true";
    } catch {
      return false;
    }
  },
  clear(roomId: string) {
    try {
      sessionStorage.removeItem(storageKeys.sessionStarted(roomId));
    } catch {
      /* ignore */
    }
  },
} as const;

// * All keys used for room data recovery (checked in order)
export const ROOM_STORAGE_KEYS = [STORAGE_KEYS.AI_REPORT_ROOM, STORAGE_KEYS.ROOM] as const;
