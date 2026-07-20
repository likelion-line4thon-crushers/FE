import api from "./api";
import type { RoomData, JoinRoomResponse } from "@/entities/room";
import { createLogger } from "@/shared/lib/logger";
import { writeAudienceIdentity } from "@/shared/lib/audience-identity";
import { DEFAULT_AUDIENCE_CAPACITY } from "@/shared/config/audience";

const log = createLogger("room");

export async function createRoom(totalPages = 10, signal?: AbortSignal): Promise<RoomData> {
  const requestData = { count: DEFAULT_AUDIENCE_CAPACITY, totalPages };
  log.log("Creating room", requestData);

  const res = await api.post("/api/rooms", requestData, { signal });
  return res.data.data;
}

// * Dedupe concurrent join requests for the same code.
// StrictMode double-mounts the join effect, and the sessionStorage guard only
// applies AFTER the async join resolves — so two joins could race and mint two
// audienceIds for one person (doubling the audience count). Sharing the in-flight
// promise guarantees a single backend join per code while a request is pending.
const inFlightJoins = new Map<string, Promise<JoinRoomResponse>>();

export async function joinRoom(code: string): Promise<JoinRoomResponse> {
  const pending = inFlightJoins.get(code);
  if (pending) return pending;

  const request = api
    .get(`/api/rooms/join/${code}`)
    .then((res) => res.data.data as JoinRoomResponse);
  inFlightJoins.set(code, request);

  try {
    return await request;
  } finally {
    inFlightJoins.delete(code);
  }
}

// join 응답의 wsUrl 정규화 — 콤마 목록이면 첫 항목, /ws 로 끝나면 /ws/audience 로 보정
export function normalizeWsUrl(wsUrl?: string): string {
  if (!wsUrl) {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    return `${apiBaseUrl}/ws/audience`;
  }
  let value = wsUrl;
  if (value.includes(",")) value = value.split(",")[0].trim();
  if (!value.endsWith("/audience")) value = value.replace(/\/ws\/?$/, "/ws/audience");
  return value;
}

// * join 결과를 오디언스 페이지가 재사용하는 형태로 저장한다.
// join은 호출마다 새 audienceId를 발급하고 누적 입장 수를 올리므로, 랜딩에서 코드 검증을
// 겸해 join했다면 이 저장본으로 오디언스 페이지가 재-join 없이 복원하게 해야 한다.
export function persistAudienceJoin(code: string, joinData: JoinRoomResponse) {
  writeAudienceIdentity(code, {
    roomId: joinData.roomId,
    audienceId: joinData.audienceId,
    audienceToken: joinData.audienceToken,
    deckId:
      joinData.deckId || joinData.deckID || joinData.deck?.deckId || joinData.presentation?.deckId,
    totalPages:
      joinData.totalPages || joinData.deck?.totalPages || joinData.presentation?.totalPages,
    sessionStatus: joinData.sessionStatus || "waiting",
    currentPage: joinData.currentPage,
    sticker: joinData.sticker,
    question: joinData.question,
    feedback: joinData.feedback,
    maxPage: joinData.maxPage,
    slideUnlock: joinData.slideUnlock,
    wsUrl: normalizeWsUrl(joinData.wsUrl),
  });
}

export async function startSession(roomId: string) {
  const res = await api.post(`/api/rooms/${roomId}/session/start`);
  log.log("Session started", roomId);
  return res.data.data;
}

/** 세션 상태 조회 ("waiting" | "live" | "ended"). 실패 시 null 반환. */
export async function getSessionStatus(roomId: string): Promise<string | null> {
  if (!roomId) return null;
  try {
    const res = await api.get(`/api/rooms/${roomId}/session/status`);
    return res?.data?.data?.status ?? null;
  } catch (error) {
    log.warn("Failed to fetch session status", error);
    return null;
  }
}

export async function closeSession(roomId: string) {
  if (!roomId) throw new Error("roomId is required");
  const res = await api.delete(`/api/rooms/close/${roomId}`);
  return res?.data?.data ?? null;
}

export async function leaveRoom(roomId: string, audienceId: string, audienceJWT: string) {
  if (!roomId || !audienceId || !audienceJWT) {
    throw new Error("roomId, audienceId, audienceJWT are required");
  }
  const res = await api.post(`/api/rooms/leave/${roomId}`, { audienceId, audienceJWT });
  return res?.data?.data ?? null;
}

export async function getRoomInfo(roomId: string) {
  if (!roomId) throw new Error("roomId is required");
  const res = await api.post(`/api/roomAudience/rooms/${roomId}/info`);
  log.log("Room info fetched", res.data.data);
  return res.data.data;
}
