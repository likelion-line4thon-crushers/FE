// PostHog 이벤트 이름 단일 정의 — 호출부마다 리터럴을 중복하면 오타 하나로
// 퍼널이 조용히 갈라지므로, 모든 capture는 여기 상수를 참조한다.
export const ANALYTICS_EVENTS = {
  // Presenter funnel
  PRESENTATION_FILE_SELECTED: "presentation_file_selected",
  PRESENTATION_FILE_REJECTED: "presentation_file_rejected",
  PRESENTATION_STARTED: "presentation_started",
  PRESENTATION_UPLOAD_COMPLETED: "presentation_upload_completed",
  PRESENTATION_UPLOAD_FAILED: "presentation_upload_failed",
  SESSION_STARTED: "session_started",
  SESSION_ENDED: "session_ended",
  SESSION_SETTING_CHANGED: "session_setting_changed",
  SHARE_MODAL_OPENED: "share_modal_opened",
  INVITE_LINK_COPIED: "invite_link_copied",
  FEEDBACK_QUESTIONS_SAVED: "feedback_questions_saved",
  QUESTIONS_CSV_DOWNLOADED: "questions_csv_downloaded",
  BROADCAST_SCREEN_OPENED: "broadcast_screen_opened",
  AI_REPORT_VIEWED: "ai_report_viewed",

  // Audience funnel
  AUDIENCE_SESSION_JOINED: "audience_session_joined",
  AUDIENCE_JOIN_FAILED: "audience_join_failed",
  EMOJI_STAMP_PLACED: "emoji_stamp_placed",
  QUESTION_SUBMITTED: "question_submitted",
  QUESTION_LIKED: "question_liked",
  AUDIENCE_BROWSED_AWAY: "audience_browsed_away",
  AUDIENCE_RETURNED_TO_LIVE: "audience_returned_to_live",
  FEEDBACK_SUBMITTED: "feedback_submitted",
  FEEDBACK_SKIPPED: "feedback_skipped",

  // Reliability telemetry
  WS_DISCONNECTED: "ws_disconnected",
  WS_RECONNECTED: "ws_reconnected",
} as const;

// posthog.group() 그룹 타입 — 세션(room) 단위 집계 키.
export const ANALYTICS_GROUP_SESSION = "session";
