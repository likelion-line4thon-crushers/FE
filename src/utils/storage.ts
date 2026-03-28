import { ROOM_STORAGE_KEYS } from '@/constants/storage-keys';
import type { RoomInfo } from '@/types';
import { createLogger } from './logger';

const log = createLogger('storage');

function parseJson<T = any>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    log.warn('Failed to parse stored JSON');
    return null;
  }
}

/**
 * Searches sessionStorage then localStorage across multiple legacy keys
 * to recover room data. Returns the first valid object found.
 */
export function loadStoredRoomData(): Record<string, any> | null {
  if (typeof window === 'undefined') return null;

  for (const key of ROOM_STORAGE_KEYS) {
    try {
      const raw =
        window.sessionStorage?.getItem(key) ??
        window.localStorage?.getItem(key) ??
        null;
      const parsed = parseJson(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) {
      log.warn(`Error accessing storage key "${key}"`, e);
    }
  }

  return null;
}

/**
 * Merges stored room data with location state to produce a complete RoomInfo.
 */
export function computeRoomInfo(
  storedRoomData: Record<string, any> | null,
  locationState: any,
): RoomInfo {
  const fromLocation = extractLocationRoomData(locationState);
  const merged = {
    ...(storedRoomData || {}),
    ...(fromLocation || {}),
  };

  return {
    roomId: merged.roomId ?? null,
    deckId: merged.deckId ?? null,
    totalPages: merged.totalPages ?? merged.slideCount ?? merged.totalPage ?? merged.pages ?? null,
    fileName: merged.fileName ?? locationState?.fileName ?? null,
  };
}

function extractLocationRoomData(locationState: any): Record<string, any> | null {
  if (!locationState) return null;

  if (
    locationState.roomData &&
    typeof locationState.roomData === 'object' &&
    locationState.roomData !== null
  ) {
    return locationState.roomData;
  }

  if (locationState.roomId) return locationState;

  return null;
}
