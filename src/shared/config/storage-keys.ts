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
} as const;

// * All keys used for room data recovery (checked in order)
export const ROOM_STORAGE_KEYS = [STORAGE_KEYS.AI_REPORT_ROOM, STORAGE_KEYS.ROOM] as const;
