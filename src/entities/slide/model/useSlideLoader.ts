import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { presentationKeys, slideUrlsQuery } from "@/shared/api/presentation";

interface UseSlideLoaderParams {
  roomId: string | null;
  deckId: string | null;
  totalPages: number | null;
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
 * ! Merged from useSlideLoader + useAudienceSlides
 */
export const useSlideLoader = ({
  roomId,
  deckId,
  totalPages,
}: UseSlideLoaderParams): UseSlideLoaderReturn => {
  const queryClient = useQueryClient();
  const enabled = Boolean(roomId && deckId && totalPages);

  const { data, isFetching, error, refetch } = useQuery({
    ...slideUrlsQuery(roomId ?? "", deckId ?? "", totalPages ?? 0),
    enabled,
  });

  const slides = useMemo(() => data ?? [], [data]);
  const loading = isFetching;

  const retry = useCallback(() => {
    if (!roomId || !deckId || !totalPages) return;
    refetch();
  }, [roomId, deckId, totalPages, refetch]);

  const applySlideReady = useCallback(
    (pageIndex: number, imageUrl: string) => {
      queryClient.setQueryData<(string | null)[]>(
        presentationKeys.slides(roomId ?? "", deckId ?? "", totalPages ?? 0),
        (prev) => {
          // The slideReady patch can arrive before the initial fetch resolves, so prev may be undefined.
          const base = prev ?? [];
          const len = Math.max(base.length, totalPages ?? 0, pageIndex + 1);
          const next =
            base.length === len
              ? [...base]
              : Array.from({ length: len }, (_, i) => base[i] ?? null);
          if (!next[pageIndex]) next[pageIndex] = imageUrl;
          return next;
        }
      );
    },
    [queryClient, roomId, deckId, totalPages]
  );

  const hasReadySlide = slides.some((s) => !!s);
  const isInitialLoading = loading && !hasReadySlide;
  const hasError = !loading && !!error && !hasReadySlide;
  const waitingForSlides = !loading && !error && slides.length > 0 && !hasReadySlide;
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
