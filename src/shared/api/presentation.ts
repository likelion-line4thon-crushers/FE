import { queryOptions } from "@tanstack/react-query";
import api from "./api";
import type { AudienceStats } from "@/entities/slide";

// 백엔드는 WebP 포맷만 S3 에 저장하므로 기본 ext 를 'webp' 로 고정.
export async function getOriginalSlideUrl(
  roomId: string,
  deckId: string,
  page: number,
  ext: "webp" | "png" = "webp"
): Promise<string> {
  const response = await api.get(`/api/presentations/${roomId}/${deckId}/pages/${page}?ext=${ext}`);
  return response.data.data.originalUrl;
}

export async function fetchAllOriginalSlideUrls(
  roomId: string,
  deckId: string,
  totalPages: number
): Promise<(string | null)[]> {
  const promises = Array.from({ length: totalPages }, (_, i) =>
    getOriginalSlideUrl(roomId, deckId, i + 1)
  );
  const results = await Promise.allSettled(promises);
  return results.map((r) => (r.status === "fulfilled" ? r.value : null));
}

interface SlideMetaItem {
  page: number;
  url: string;
}

export interface SlideNoteItem {
  page: number;
  notes: string;
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

export async function fetchSlideNotes({
  roomId,
  deckId,
  presenterToken,
  signal,
}: {
  roomId: string;
  deckId: string;
  presenterToken: string;
  signal?: AbortSignal;
}): Promise<SlideNoteItem[]> {
  if (!roomId || !deckId || !presenterToken) return [];

  const response = await api.get(`/api/presentations/${roomId}/${deckId}/notes`, {
    signal,
    headers: {
      Authorization: `Bearer ${presenterToken}`,
    },
  });
  const payload = response.data?.data ?? {};
  const notes = Array.isArray(payload.notes) ? payload.notes : [];
  return notes
    .map((item: any) => ({
      page: Number(item.page),
      notes: typeof item.notes === "string" ? item.notes : "",
    }))
    .filter((item: SlideNoteItem) => Number.isFinite(item.page) && item.page > 0 && item.notes);
}

export async function saveSlideNote({
  roomId,
  deckId,
  page,
  notes,
  presenterToken,
  signal,
}: {
  roomId: string;
  deckId: string;
  page: number;
  notes: string;
  presenterToken: string;
  signal?: AbortSignal;
}): Promise<SlideNoteItem> {
  if (!roomId || !deckId || !presenterToken) {
    throw new Error("Presenter note save requires room, deck, and presenter token");
  }

  const response = await api.put(
    `/api/presentations/${roomId}/${deckId}/notes/${page}`,
    { notes },
    {
      signal,
      headers: {
        Authorization: `Bearer ${presenterToken}`,
      },
    }
  );
  const payload = response.data?.data ?? {};
  return {
    page: Number(payload.page) || page,
    notes: typeof payload.notes === "string" ? payload.notes : "",
  };
}

export function saveSlideNoteKeepalive({
  roomId,
  deckId,
  page,
  notes,
  presenterToken,
}: {
  roomId: string;
  deckId: string;
  page: number;
  notes: string;
  presenterToken: string;
}): boolean {
  if (!roomId || !deckId || !presenterToken) return false;

  const path = `/api/presentations/${roomId}/${deckId}/notes/${page}`;
  const baseUrl = api.defaults.baseURL;
  const url = baseUrl ? new URL(path, baseUrl).toString() : path;

  fetch(url, {
    method: "PUT",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${presenterToken}`,
    },
    body: JSON.stringify({ notes }),
  }).catch(() => {
    // The page may be unloading; failed keepalive writes cannot be surfaced reliably.
  });

  return true;
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

export const presentationKeys = {
  slides: (roomId: string, deckId: string, totalPages: number) =>
    ["slides", roomId, deckId, totalPages] as const,
  slideImage: (roomId: string, deckId: string, page: number) =>
    ["slide-image", roomId, deckId, page] as const,
  // presenterToken 은 queryFn 의 Authorization 에 쓰이므로 키에도 포함해야
  // 토큰 재발급 시 이전 자격으로 받은 캐시가 재사용되지 않는다.
  slideNotes: (roomId: string, deckId: string, presenterToken: string) =>
    ["slide-notes", roomId, deckId, presenterToken] as const,
};

export function slideUrlsQuery(roomId: string, deckId: string, totalPages: number) {
  return queryOptions({
    queryKey: presentationKeys.slides(roomId, deckId, totalPages),
    queryFn: () => fetchAllOriginalSlideUrls(roomId, deckId, totalPages),
  });
}

export function slideImageQuery(roomId: string, deckId: string, page: number) {
  return queryOptions({
    queryKey: presentationKeys.slideImage(roomId, deckId, page),
    queryFn: () => getOriginalSlideUrl(roomId, deckId, page),
  });
}

export function slideNotesQuery({
  roomId,
  deckId,
  presenterToken,
}: {
  roomId: string;
  deckId: string;
  presenterToken: string;
}) {
  return queryOptions({
    queryKey: presentationKeys.slideNotes(roomId, deckId, presenterToken),
    queryFn: ({ signal }) => fetchSlideNotes({ roomId, deckId, presenterToken, signal }),
  });
}
