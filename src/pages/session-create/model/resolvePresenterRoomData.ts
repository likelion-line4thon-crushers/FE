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

// roomIdParam 이 없으면(= /rooms/new 신규 업로드 진입) stale sessionStorage 값을 채택하지 않도록 false 반환.
// 이전 구현은 true 를 돌려 이전 세션의 roomData 가 신규 플로우로 흘러들어 upload effect 를 skip 시키고,
// canStartSession/totalPages 를 오염시켰다.
const roomIdsMatch = (storedRoomId: PresenterRoomData["roomId"], roomIdParam?: string) => {
  if (!roomIdParam) {
    return false;
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
