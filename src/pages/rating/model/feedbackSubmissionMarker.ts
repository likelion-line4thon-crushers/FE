import { createLogger } from "@/shared/lib/logger";

const log = createLogger("rating");

// Durable, identity-scoped marker recording that a given audience already
// submitted feedback for a room. Keyed by roomId and holding the audienceId, so
// it stays consistent with the per-browser durable identity: reusing the same
// identity → marker matches; a new identity → genuinely a first submission.
const markerKey = (roomId: string) => `boini_feedback_submitted_${roomId}`;

export const markFeedbackSubmitted = (roomId: string, audienceId: string): void => {
  try {
    localStorage.setItem(markerKey(roomId), audienceId);
  } catch (error) {
    log.warn("feedback submission marker write failed:", error);
  }
};

export const hasSubmittedFeedback = (
  roomId?: string | null,
  audienceId?: string | null
): boolean => {
  if (!roomId || !audienceId) return false;
  try {
    return localStorage.getItem(markerKey(roomId)) === audienceId;
  } catch (error) {
    log.warn("feedback submission marker read failed:", error);
    return false;
  }
};
