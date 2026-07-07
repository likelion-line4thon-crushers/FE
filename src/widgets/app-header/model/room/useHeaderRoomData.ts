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
    let storedRoomData: Record<string, unknown> | null = null;

    try {
      const stored = sessionStorage.getItem("boini_room");
      storedRoomData = stored ? JSON.parse(stored) : null;
    } catch {
      storedRoomData = null;
    }

    if (roomDataFromState) {
      const stateRoomId = (roomDataFromState as Record<string, unknown>)?.roomId;
      const storedRoomId = storedRoomData?.roomId;
      if (
        stateRoomId != null &&
        storedRoomId != null &&
        String(stateRoomId) === String(storedRoomId)
      ) {
        return { ...storedRoomData, ...roomDataFromState };
      }
      return roomDataFromState;
    }

    if (locationState?.roomId && locationState?.deckId) {
      if (
        storedRoomData?.roomId != null &&
        String(locationState.roomId) === String(storedRoomData.roomId)
      ) {
        return { ...storedRoomData, ...locationState };
      }
      return locationState;
    }

    return storedRoomData;
  }, [location.state, propRoomData]);

  const fileName = useMemo(() => {
    if (location.state?.fileName) {
      return location.state.fileName;
    }

    return roomData?.fileName || "";
  }, [location.state, roomData]);

  return { roomData, fileName };
};
