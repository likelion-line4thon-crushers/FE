import { useCallback, useMemo } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { presentationKeys, slideImageQuery } from "@/shared/api/presentation";

interface UseSlideLoaderParams {
  roomId: string | null;
  deckId: string | null;
  totalPages: number | null;
  /** 청중 전용: 공개가 꺼진 동안 아직 공개되지 않은 페이지는 아예 요청하지 않도록 제한한다. 발표자는 생략. */
  revealAllSlides?: boolean;
  /** 공개된 최대 페이지의 0-based 인덱스 (maxSlide - 1). */
  maxRevealedPage?: number | null;
}

interface UseSlideLoaderReturn {
  slides: (string | null)[];
  loading: boolean;
  error: Error | null;
  retry: () => void;
  isInitialLoading: boolean;
  hasError: boolean;
  showPlaceholder: boolean;
  waitingMessage: string;
  applySlideReady: (pageIndex: number, imageUrl: string) => void;
}

/**
 * 슬라이드 이미지를 페이지 단위로 로드한다.
 * - 발표자/브로드캐스트/리포트: 경계 미지정 → 전체 페이지 로드(기존 동작).
 * - 청중 + 공개 OFF: 공개 경계(maxRevealedPage)까지만 요청 → 미공개 슬라이드는 애초에 내려받지 않는다.
 *   (경계 밖 썸네일은 <img> 를 마운트하지 않으므로 공개 ON→OFF "유령" 깜빡임도 근본적으로 사라진다)
 */
export const useSlideLoader = ({
  roomId,
  deckId,
  totalPages,
  revealAllSlides = true,
  maxRevealedPage = null,
}: UseSlideLoaderParams): UseSlideLoaderReturn => {
  const queryClient = useQueryClient();
  const pages = totalPages ?? 0;
  const baseEnabled = Boolean(roomId && deckId && pages);

  // 공개 상태가 명확히 "잠금"일 때만 요청 범위를 제한한다. 그 외(발표자/브로드캐스트/리포트,
  // 그리고 공개 ON 상태의 청중, 공개 상태 미확정)는 전체 페이지를 로드한다.
  const inLockMode = !revealAllSlides && maxRevealedPage !== null;
  const allowedCount = inLockMode
    ? Math.min(pages, Math.max(0, (maxRevealedPage ?? -1) + 1))
    : pages;

  const results = useQueries({
    queries: Array.from({ length: pages }, (_, i) => ({
      ...slideImageQuery(roomId ?? "", deckId ?? "", i + 1),
      enabled: baseEnabled && i < allowedCount,
    })),
  });

  // 경계 밖 페이지는 (slideReady 등으로 캐시가 채워졌더라도) null 로 강제해 노출을 막는다.
  // useQueries 는 매 렌더마다 새 배열을 반환하므로, 실제 URL "값" 기준으로 memo 해
  // slides 참조를 안정적으로 유지한다(그러지 않으면 usePresenterPageSync 가 매 렌더 재실행).
  const slideValuesKey = results
    .map((r, i) => (i < allowedCount ? ((r.data as string | undefined) ?? "") : ""))
    .join("|");
  const slides = useMemo(
    () =>
      results.map((r, i) => (i < allowedCount ? ((r.data as string | undefined) ?? null) : null)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slideValuesKey]
  );

  const loading = results.some((r, i) => i < allowedCount && r.isFetching);
  const error =
    (results.find((r, i) => i < allowedCount && r.error)?.error as Error | undefined) ?? null;

  const retry = useCallback(() => {
    results.forEach((r, i) => {
      if (i < allowedCount) void r.refetch();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideValuesKey, allowedCount]);

  // slideReady(라이브 파싱)로 특정 페이지 URL 을 미리 채워, 별도 요청 없이 즉시 보이게 한다.
  const applySlideReady = useCallback(
    (pageIndex: number, imageUrl: string) => {
      if (!roomId || !deckId || pageIndex < 0 || !imageUrl) return;
      queryClient.setQueryData(
        presentationKeys.slideImage(roomId, deckId, pageIndex + 1),
        imageUrl
      );
    },
    [queryClient, roomId, deckId]
  );

  const hasReadySlide = slides.some((s) => !!s);
  const isInitialLoading = loading && !hasReadySlide;
  const hasError = !loading && !!error && !hasReadySlide;
  const waitingForSlides = !loading && !error && allowedCount > 0 && !hasReadySlide;
  const showPlaceholder = isInitialLoading || hasError || waitingForSlides;
  const waitingMessage = hasError
    ? "슬라이드를 불러오는 중 오류가 발생했습니다."
    : "슬라이드를 불러오는 중입니다.";

  return {
    slides,
    loading,
    error,
    retry,
    isInitialLoading,
    hasError,
    showPlaceholder,
    waitingMessage,
    applySlideReady,
  };
};

export default useSlideLoader;
