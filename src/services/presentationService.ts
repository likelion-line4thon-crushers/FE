import api from './api';
import type { AudienceStats } from '@/types';

export async function getOriginalSlideUrl(roomId: string, deckId: string, page: number): Promise<string> {
  const response = await api.get(`/api/presentations/${roomId}/${deckId}/pages/${page}?ext=png`);
  return response.data.data.originalUrl;
}

export async function fetchAllOriginalSlideUrls(
  roomId: string,
  deckId: string,
  totalPages: number,
): Promise<string[]> {
  const promises = Array.from({ length: totalPages }, (_, i) =>
    getOriginalSlideUrl(roomId, deckId, i + 1),
  );
  return Promise.all(promises);
}

// * Coerces backend field names (frontCount/currentCount/backCount) to our domain model
export async function fetchAudienceSlideStats({
  roomId,
  page,
  signal,
}: {
  roomId: string;
  page?: number;
  signal?: AbortSignal;
}): Promise<AudienceStats> {
  if (!roomId) throw new Error('roomId is required');

  const params =
    typeof page === 'number' && Number.isFinite(page)
      ? { page: page + 1 }
      : undefined;

  const response = await api.get(`/api/pages/${roomId}/audience-slide-stats`, { params, signal });
  const payload = response?.data?.data ?? response?.data ?? {};

  const toNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  return {
    prev: toNum(payload.frontCount ?? 0),
    current: toNum(payload.currentCount ?? 0),
    next: toNum(payload.backCount ?? 0),
  };
}

export async function fetchLiveFeedback({
  roomId,
  page,
  signal,
}: {
  roomId: string;
  page: number;
  signal?: AbortSignal;
}): Promise<string | null> {
  if (!roomId) throw new Error('roomId is required');
  if (typeof page !== 'number' || !Number.isFinite(page) || page < 1) {
    throw new Error('Valid page number is required');
  }

  try {
    const response = await api.get(`/${roomId}/slide/${page}`, { signal });

    if (typeof response?.data === 'string') {
      const trimmed = response.data.trim();
      return trimmed.length > 0 ? trimmed : null;
    }

    if (response?.data) {
      const payload = response.data?.data ?? response.data;
      const message = payload?.message ?? payload?.feedback ?? payload?.content ?? null;
      if (message && typeof message === 'string') {
        const trimmed = message.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
    }

    return null;
  } catch (error: any) {
    if (error?.name === 'CanceledError' || error?.name === 'AbortError') throw error;
    if (error?.response?.status === 404) return null;
    throw error;
  }
}
