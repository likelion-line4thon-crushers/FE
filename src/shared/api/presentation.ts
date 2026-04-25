import api from "./api";
import type { AudienceStats } from "@/entities/slide";

// 백엔드는 WebP 포맷만 S3 에 저장하므로 기본 ext 를 'webp' 로 고정.
export async function getOriginalSlideUrl(
  roomId: string,
  deckId: string,
  page: number,
  ext: 'webp' | 'png' = 'webp'
): Promise<string> {
  const response = await api.get(`/api/presentations/${roomId}/${deckId}/pages/${page}?ext=${ext}`);
  return response.data.data.originalUrl;
}

export async function fetchAllOriginalSlideUrls(
  roomId: string,
  deckId: string,
  totalPages: number
): Promise<string[]> {
  const promises = Array.from({ length: totalPages }, (_, i) =>
    getOriginalSlideUrl(roomId, deckId, i + 1)
  );
  return Promise.all(promises);
}

interface SlideMetaItem {
  page: number;
  url: string;
}

// 새로고침 복원용 일괄 조회. N+1 호출 없이 한 번에 presigned URL 배열을 받는다.
// BE SlidesMetaResponse 실제 형태가 `pages` 혹은 `items` 로 다를 수 있어 둘 다 시도.
export async function fetchSlidesMeta(
  roomId: string,
  deckId: string,
  totalPages: number
): Promise<string[]> {
  const response = await api.get(`/api/presentations/${roomId}/${deckId}/meta`, {
    params: { totalPages },
  });
  const payload = response.data?.data ?? {};
  const items: SlideMetaItem[] = payload.pages ?? payload.items ?? [];
  return items
    .slice()
    .sort((a, b) => a.page - b.page)
    .map((i) => i.url);
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
  if (!roomId) throw new Error("roomId is required");

  const params = typeof page === "number" && Number.isFinite(page) ? { page: page + 1 } : undefined;

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
  if (!roomId) throw new Error("roomId is required");
  if (typeof page !== "number" || !Number.isFinite(page) || page < 1) {
    throw new Error("Valid page number is required");
  }

  try {
    const response = await api.get(`/${roomId}/slide/${page}`, { signal });

    if (typeof response?.data === "string") {
      const trimmed = response.data.trim();
      return trimmed.length > 0 ? trimmed : null;
    }

    if (response?.data) {
      const payload = response.data?.data ?? response.data;
      const message = payload?.message ?? payload?.feedback ?? payload?.content ?? null;
      if (message && typeof message === "string") {
        const trimmed = message.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
    }

    return null;
  } catch (error: any) {
    if (error?.name === "CanceledError" || error?.name === "AbortError") throw error;
    if (error?.response?.status === 404) return null;
    throw error;
  }
}
