import api from './api';

interface FetchQuestionsOptions {
  fromTs?: number;
  slide?: number;
}

export async function fetchRoomQuestions(roomId: string, options: FetchQuestionsOptions = {}) {
  if (!roomId) throw new Error('roomId is required');

  const searchParams = new URLSearchParams();
  if (options.fromTs != null && !Number.isNaN(options.fromTs)) {
    searchParams.set('fromTs', String(options.fromTs));
  }
  if (options.slide != null && !Number.isNaN(options.slide)) {
    searchParams.set('slide', String(options.slide));
  }

  const query = searchParams.toString();
  const url = `/api/questions/rooms/${roomId}${query ? `?${query}` : ''}`;

  const response = await api.get(url);
  const data = response?.data?.data;
  return Array.isArray(data) ? data : [];
}
