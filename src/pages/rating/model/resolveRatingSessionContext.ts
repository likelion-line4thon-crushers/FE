import { createLogger } from "@/shared/lib/logger";

const log = createLogger("rating");

export type RatingSessionContext = {
  roomId: string | null;
  audienceId: string | null;
  deckId: string | null;
  hasIdentity: boolean;
  identitySource: "route" | "audience-storage" | "missing";
};

export type RatingLocationState = {
  roomId?: string;
  audienceId?: string;
  deckId?: string | null;
};

export const resolveRatingSessionContext = (
  code?: string,
  locationState?: RatingLocationState | null
): RatingSessionContext => {
  try {
    if (locationState?.roomId && locationState?.audienceId) {
      return {
        roomId: locationState.roomId,
        audienceId: locationState.audienceId,
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
    deckId: null,
    hasIdentity: false,
    identitySource: "missing",
  };
};
