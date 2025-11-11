import { useEffect, useMemo, useState } from "react";
import { getOriginalSlideUrl } from "../services/presentationService";

const createInitialState = () => ({
  imageUrl: null,
  loading: false,
  error: null,
});

const normalizeSlideNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const useSlideImage = ({
  roomId,
  deckId,
  slideNumber,
  enabled = true,
} = {}) => {
  const normalizedSlideNumber = useMemo(
    () => normalizeSlideNumber(slideNumber),
    [slideNumber]
  );

  const shouldLoad =
    Boolean(enabled) &&
    Boolean(roomId) &&
    Boolean(deckId) &&
    normalizedSlideNumber !== null;

  const [state, setState] = useState(createInitialState);

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

    getOriginalSlideUrl(roomId, deckId, normalizedSlideNumber)
      .then((url) => {
        if (!cancelled) {
          setState({
            imageUrl: url ?? null,
            loading: false,
            error: null,
          });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            imageUrl: null,
            loading: false,
            error,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shouldLoad, roomId, deckId, normalizedSlideNumber]);

  const reload = async () => {
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
      const url = await getOriginalSlideUrl(
        roomId,
        deckId,
        normalizedSlideNumber
      );
      setState({
        imageUrl: url ?? null,
        loading: false,
        error: null,
      });
      return url ?? null;
    } catch (error) {
      setState({
        imageUrl: null,
        loading: false,
        error,
      });
      throw error;
    }
  };

  return {
    imageUrl: state.imageUrl,
    loading: state.loading,
    error: state.error,
    hasImage: Boolean(state.imageUrl),
    reload,
  };
};

export default useSlideImage;
