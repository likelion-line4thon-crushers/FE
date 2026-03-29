type PresenterRoomData = {
  roomId?: string | number;
  deckId?: string | null;
  [key: string]: unknown;
};

type LocationState = {
  roomData?: PresenterRoomData | null;
  roomId?: string | number;
  deckId?: string | null;
  [key: string]: unknown;
} | null;

const toRoomData = (value: unknown): PresenterRoomData | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as PresenterRoomData;
};

const roomIdsMatch = (storedRoomId: PresenterRoomData["roomId"], roomIdParam?: string) => {
  if (!roomIdParam) {
    return true;
  }

  if (storedRoomId == null) {
    return false;
  }

  return String(storedRoomId) === String(roomIdParam);
};

export const resolvePresenterRoomData = (
  roomIdParam?: string,
  locationState?: LocationState
): PresenterRoomData | null => {
  const locationRoomData = toRoomData(locationState?.roomData);
  if (locationRoomData && roomIdsMatch(locationRoomData.roomId, roomIdParam)) {
    return locationRoomData;
  }

  if (
    locationState?.roomId &&
    locationState?.deckId &&
    roomIdsMatch(locationState.roomId, roomIdParam)
  ) {
    return {
      ...locationState,
      roomId: locationState.roomId,
      deckId: locationState.deckId,
    };
  }

  try {
    const stored = sessionStorage.getItem("boini_room");
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);
    const storedRoomData = toRoomData(parsed);
    if (!storedRoomData || !roomIdsMatch(storedRoomData.roomId, roomIdParam)) {
      return null;
    }

    return storedRoomData;
  } catch {
    return null;
  }
};
