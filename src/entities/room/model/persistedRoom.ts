import { STORAGE_KEYS } from "@/shared/config/storage-keys";
import type { RoomData } from "./room";

/**
 * 발표자 roomData 의 sessionStorage 영속화 헬퍼.
 * totalPages <= 0 인 데이터는 "방은 만들었지만 업로드가 끝나지 않은" 스켈레톤을 뜻한다
 * (SessionCreatePage 가 이 마커로 중단된 업로드를 감지한다).
 */
export function persistRoomData(data: RoomData) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.ROOM, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function readPersistedRoomData(): RoomData | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.ROOM);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !("roomId" in parsed)) return null;
    return parsed as RoomData;
  } catch {
    return null;
  }
}

export function clearPersistedRoomData() {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.ROOM);
  } catch {
    /* ignore */
  }
}
