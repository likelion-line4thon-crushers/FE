import { useEffect, useMemo, useState, useCallback } from "react";
import { getOriginalSlideUrl } from "@/shared/api/presentation";

interface SlideImageState {
  imageUrl: string | null;
  loading: boolean;
  error: Error | null;
}

const createInitialState = (): SlideImageState => ({
  imageUrl: null,
  loading: false,
  error: null,
});

const normalizeSlideNumber = (value: any): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

interface UseSlideImageParams {
  roomId?: string | null;
  deckId?: string | null;
  slideNumber?: number | null;
  enabled?: boolean;
}

const useSlideImage = ({
  roomId,
  deckId,
  slideNumber,
  enabled = true,
}: UseSlideImageParams = {}) => {
  const normalizedSlideNumber = useMemo(() => normalizeSlideNumber(slideNumber), [slideNumber]);

  const shouldLoad =
    Boolean(enabled) && Boolean(roomId) && Boolean(deckId) && normalizedSlideNumber !== null;

  const [state, setState] = useState<SlideImageState>(createInitialState);

  useEffect(() => {
    if (!shouldLoad) {
      setState(createInitialState());
      return () => {};
    }

    let cancelled = false;

    setState((prev) => ({
      imageUrl: prev.imageUrl,
      loading: true,
      error: null,
    }));

    getOriginalSlideUrl(roomId!, deckId!, normalizedSlideNumber!)
      .then((url) => {
        if (!cancelled) {
          setState({ imageUrl: url ?? null, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ imageUrl: null, loading: false, error });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shouldLoad, roomId, deckId, normalizedSlideNumber]);

  const reload = useCallback(async () => {
    if (!shouldLoad) {
      setState(createInitialState());
      return null;
    }

    setState((prev) => ({
      imageUrl: prev.imageUrl,
      loading: true,
      error: null,
    }));

    try {
      const url = await getOriginalSlideUrl(roomId!, deckId!, normalizedSlideNumber!);
      setState({ imageUrl: url ?? null, loading: false, error: null });
      return url ?? null;
    } catch (error: any) {
      setState({ imageUrl: null, loading: false, error });
      throw error;
    }
  }, [shouldLoad, roomId, deckId, normalizedSlideNumber]);

  return {
    imageUrl: state.imageUrl,
    loading: state.loading,
    error: state.error,
    hasImage: Boolean(state.imageUrl),
    reload,
  };
};

export default useSlideImage;
