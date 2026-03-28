import api from './api';
import type { RoomData, JoinRoomResponse } from '@/types';
import { createLogger } from '@/utils/logger';

const log = createLogger('room');

export async function createRoom(totalPages = 10): Promise<RoomData> {
  const requestData = { count: 50, totalPages };
  log.log('Creating room', requestData);

  const res = await api.post('/api/rooms', requestData);
  return res.data.data;
}

export async function joinRoom(code: string): Promise<JoinRoomResponse> {
  const res = await api.get(`/api/rooms/join/${code}`);
  return res.data.data;
}

export async function startSession(roomId: string) {
  const res = await api.post(`/api/rooms/${roomId}/session/start`);
  log.log('Session started', roomId);
  return res.data.data;
}

export async function closeSession(roomId: string) {
  if (!roomId) throw new Error('roomId is required');
  const res = await api.delete(`/api/rooms/close/${roomId}`);
  return res?.data?.data ?? null;
}

export async function leaveRoom(roomId: string, audienceId: string, audienceJWT: string) {
  if (!roomId || !audienceId || !audienceJWT) {
    throw new Error('roomId, audienceId, audienceJWT are required');
  }
  const res = await api.post(`/api/rooms/leave/${roomId}`, { audienceId, audienceJWT });
  return res?.data?.data ?? null;
}

export async function getRoomInfo(roomId: string) {
  if (!roomId) throw new Error('roomId is required');
  const res = await api.post(`/api/roomAudience/rooms/${roomId}/info`);
  log.log('Room info fetched', res.data.data);
  return res.data.data;
}
