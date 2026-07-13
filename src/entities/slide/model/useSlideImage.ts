import { useCallback, useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { slideImageQuery } from "@/shared/api/presentation";

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

  const { data, isFetching, error, refetch } = useQuery({
    ...slideImageQuery(roomId ?? "", deckId ?? "", normalizedSlideNumber ?? 0),
    enabled: shouldLoad,
    // Keep the previous slide visible while the next one loads when params change.
    placeholderData: keepPreviousData,
  });

  const reload = useCallback(async () => {
    if (!shouldLoad) return null;
    // refetch never throws; surface a failed fetch by inspecting the result.
    const result = await refetch();
    if (result.error) throw result.error;
    return result.data ?? null;
  }, [shouldLoad, refetch]);

  return {
    imageUrl: shouldLoad ? (data ?? null) : null,
    loading: shouldLoad ? isFetching : false,
    error: shouldLoad ? error : null,
    hasImage: shouldLoad ? Boolean(data) : false,
    reload,
  };
};

export default useSlideImage;
