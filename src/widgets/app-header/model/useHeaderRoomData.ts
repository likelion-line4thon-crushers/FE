import { useMemo } from "react";
import { useLocation } from "react-router";

/**
 * * Resolves roomData from props or sessionStorage.
 */
export const useHeaderRoomData = (propRoomData: any) => {
  const location = useLocation();
  const roomData = useMemo(() => {
    if (propRoomData) {
      return propRoomData;
    }

    const locationState = location.state as Record<string, unknown> | null;
    const roomDataFromState =
      locationState && typeof locationState.roomData === "object" ? locationState.roomData : null;

    if (roomDataFromState) {
      return roomDataFromState;
    }

    if (locationState?.roomId && locationState?.deckId) {
      return locationState;
    }

    try {
      const stored = sessionStorage.getItem("boini_room");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, [location.state, propRoomData]);

  const fileName = useMemo(() => {
    if (location.state?.fileName) {
      return location.state.fileName;
    }

    return roomData?.fileName || "";
  }, [location.state, roomData]);

  return { roomData, fileName };
};
