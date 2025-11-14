import { useState, useEffect, useCallback } from "react";
import { fetchAllOriginalSlideUrls } from "../services/presentationService";

const useAudienceSlides = ({ roomId, deckId, totalPages }) => {
  const [slides, setSlides] = useState([]);
  const [loadingSlides, setLoadingSlides] = useState(false);
  const [slidesError, setSlidesError] = useState(null);

  const loadSlides = useCallback(
    async ({ signal } = {}) => {
      if (!roomId || !deckId || !totalPages) return;
      if (signal?.aborted) return;

      setLoadingSlides(true);
      setSlidesError(null);

      try {
        const urls = await fetchAllOriginalSlideUrls(
          roomId,
          deckId,
          totalPages
        );

        if (signal?.aborted) return;
        setSlides(urls);
      } catch (error) {
        if (signal?.aborted) return;
        setSlidesError(error);
      } finally {
        if (signal?.aborted) return;
        setLoadingSlides(false);
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

  const handleRetryFetchSlides = useCallback(() => {
    if (!roomId || !deckId || !totalPages) return;
    loadSlides();
  }, [roomId, deckId, totalPages, loadSlides]);

  const isSlidesLoading = loadingSlides && slides.length === 0;
  const hasSlidesError = !loadingSlides && !!slidesError && slides.length === 0;
  const showSlidesPlaceholder = isSlidesLoading || hasSlidesError;
  const waitingMessage = hasSlidesError
    ? "슬라이드를 불러오는 중 오류가 발생했습니다."
    : "슬라이드를 불러오는 중입니다.";

  return {
    slides,
    loadingSlides,
    slidesError,
    loadSlides,
    handleRetryFetchSlides,
    isSlidesLoading,
    hasSlidesError,
    showSlidesPlaceholder,
    waitingMessage,
  };
};

export default useAudienceSlides;
