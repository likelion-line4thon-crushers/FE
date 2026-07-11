import { useCallback, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  downloadPdfSlides,
  pdfDownloadAvailabilityQuery,
  type PdfDownloadAvailability,
} from "@/shared/api/pdf-download";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("rating-pdf-download");

interface UseRatingPdfDownloadParams {
  roomId: string | null;
  audienceId: string | null;
  enabled: boolean;
}

const saveBlob = (blob: Blob, fileName: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};

export function useRatingPdfDownload({ roomId, audienceId, enabled }: UseRatingPdfDownloadParams) {
  // Availability + download share one error field; last failure wins.
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    ...pdfDownloadAvailabilityQuery(roomId ?? "", audienceId ?? ""),
    enabled: enabled && !!roomId && !!audienceId,
    // 세션 종료 직후 청중 전원이 동시에 진입하는 경로 — 재시도로 요청을 배가시키지 않는다.
    retry: false,
  });

  const availability = data ?? null;

  const refreshAvailability = useCallback(async (): Promise<PdfDownloadAvailability | null> => {
    setError(null);
    const result = await refetch();
    if (result.isError) {
      log.warn("Failed to fetch PDF download availability", result.error);
      setError("다운로드 가능 여부를 확인하지 못했습니다.");
      return null;
    }
    return result.data ?? null;
  }, [refetch]);

  const { mutateAsync: runDownload, isPending: downloading } = useMutation({
    mutationFn: (params: { roomId: string; audienceId: string }) =>
      downloadPdfSlides(params.roomId, params.audienceId),
    onError: (downloadError) => {
      log.error("Failed to download PDF slides", downloadError);
      setError("슬라이드 다운로드에 실패했습니다.");
    },
  });

  const downloadSlides = useCallback(async () => {
    if (!roomId || !audienceId) {
      throw new Error("roomId and audienceId are required");
    }
    setError(null);
    const file = await runDownload({ roomId, audienceId });
    saveBlob(file.blob, file.fileName ?? "boini-slides.pdf");
  }, [audienceId, roomId, runDownload]);

  return {
    availability,
    loading: isLoading,
    downloading,
    error,
    refreshAvailability,
    downloadSlides,
  };
}
