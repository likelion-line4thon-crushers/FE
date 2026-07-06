import { createLogger } from "@/shared/lib/logger";

const log = createLogger("rating");

export type RatingSessionContext = {
  roomId: string | null;
  audienceId: string | null;
  audienceToken: string | null;
  deckId: string | null;
  hasIdentity: boolean;
  identitySource: "route" | "audience-storage" | "missing";
};

export type RatingLocationState = {
  roomId?: string;
  audienceId?: string;
  deckId?: string | null;
};

// The audience JWT is required to submit feedback (the backend derives the
// audienceId from it). It only lives in sessionStorage — location.state from the
// end-of-session redirect does not carry it — so read it there regardless of
// where the roomId/audienceId identity came from.
const readAudienceToken = (code?: string): string | null => {
  if (!code) return null;
  try {
    const stored = sessionStorage.getItem(`boini_audience_${code}`);
    if (stored) {
      return JSON.parse(stored).audienceToken || null;
    }
  } catch (error) {
    log.error("audience token read failed:", error);
  }
  return null;
};

export const resolveRatingSessionContext = (
  code?: string,
  locationState?: RatingLocationState | null
): RatingSessionContext => {
  const audienceToken = readAudienceToken(code);

  try {
    if (locationState?.roomId && locationState?.audienceId) {
      return {
        roomId: locationState.roomId,
        audienceId: locationState.audienceId,
        audienceToken,
        deckId: locationState.deckId || null,
        hasIdentity: true,
        identitySource: "route",
      };
    }

    if (code) {
      const stored = sessionStorage.getItem(`boini_audience_${code}`);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.roomId && data.audienceId) {
          return {
            roomId: data.roomId,
            audienceId: data.audienceId,
            audienceToken,
            deckId: data.deckId || null,
            hasIdentity: true,
            identitySource: "audience-storage",
          };
        }
      }
    }
  } catch (error) {
    log.error("rating session context resolve failed:", error);
  }

  return {
    roomId: null,
    audienceId: null,
    audienceToken: null,
    deckId: null,
    hasIdentity: false,
    identitySource: "missing",
  };
};
