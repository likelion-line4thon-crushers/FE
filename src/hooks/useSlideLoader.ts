import { useState, useEffect, useCallback } from "react";
import { fetchAllOriginalSlideUrls } from "../services/presentationService";

// TODO(types): slides are strings from API — SlideUrl type will be reconciled when services are fully typed
type SlideUrlString = string;

interface UseSlideLoaderParams {
  roomId: string | null;
  deckId: string | null;
  totalPages: number | null;
}

interface UseSlideLoaderReturn {
  slides: SlideUrlString[];
  loading: boolean;
  error: Error | null;
  retry: () => void;
  isInitialLoading: boolean;
  hasError: boolean;
  showPlaceholder: boolean;
  waitingMessage: string;
}

/**
 * ! Merged from useSlideLoader + useAudienceSlides
 */
export const useSlideLoader = ({
  roomId,
  deckId,
  totalPages,
}: UseSlideLoaderParams): UseSlideLoaderReturn => {
  const [slides, setSlides] = useState<SlideUrlString[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadSlides = useCallback(
    async ({ signal }: { signal?: AbortSignal } = {}) => {
      if (!roomId || !deckId || !totalPages) return;
      if (signal?.aborted) return;

      setLoading(true);
      setError(null);

      try {
        const urls = await fetchAllOriginalSlideUrls(roomId, deckId, totalPages);
        if (signal?.aborted) return;
        setSlides(urls);
      } catch (err: any) {
        if (signal?.aborted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [roomId, deckId, totalPages]
  );

  useEffect(() => {
    if (!roomId || !deckId || !totalPages) return;

    const controller = new AbortController();
    loadSlides({ signal: controller.signal });

    return () => {
      controller.abort();
    };
  }, [roomId, deckId, totalPages, loadSlides]);

  const retry = useCallback(() => {
    if (!roomId || !deckId || !totalPages) return;
    loadSlides();
  }, [roomId, deckId, totalPages, loadSlides]);

  const isInitialLoading = loading && slides.length === 0;
  const hasError = !loading && !!error && slides.length === 0;
  const showPlaceholder = isInitialLoading || hasError;
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
  };
};

export default useSlideLoader;
