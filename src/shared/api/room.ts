import api from "./api";
import type { RoomData, JoinRoomResponse } from "@/entities/room";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("room");

export async function createRoom(totalPages = 10): Promise<RoomData> {
  const requestData = { count: 50, totalPages };
  log.log("Creating room", requestData);

  const res = await api.post("/api/rooms", requestData);
  return res.data.data;
}

export async function joinRoom(code: string): Promise<JoinRoomResponse> {
  const res = await api.get(`/api/rooms/join/${code}`);
  return res.data.data;
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
