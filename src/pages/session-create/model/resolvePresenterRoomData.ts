import type { RoomData } from "@/entities/room";
import { readPersistedRoomData } from "@/entities/room";

/** 발표자 플로우에서 location.state 로 전달되는 값 (직렬화 가능한 것만). */
export type PresenterLocationState = {
  roomData?: RoomData | null;
  fileName?: string;
} | null;

// roomIdParam 이 없으면(= /rooms/new 신규 업로드 진입) stale sessionStorage 값을 채택하지
// 않도록 false 반환. 이전 세션의 roomData 가 신규 플로우로 흘러들면 업로드를 skip 시키고
// canStartSession/totalPages 를 오염시킨다.
const roomIdsMatch = (storedRoomId: RoomData["roomId"] | undefined, roomIdParam?: string) => {
  if (!roomIdParam || storedRoomId == null) return false;
  return String(storedRoomId) === String(roomIdParam);
};

export const resolvePresenterRoomData = (
  roomIdParam?: string,
  locationState?: unknown
): RoomData | null => {
  const state = (locationState ?? null) as PresenterLocationState;
  const fromState = state?.roomData ?? null;
  if (fromState && roomIdsMatch(fromState.roomId, roomIdParam)) return fromState;

  const stored = readPersistedRoomData();
  if (stored && roomIdsMatch(stored.roomId, roomIdParam)) return stored;

  return null;
};
