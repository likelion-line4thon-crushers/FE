import { useCallback, useEffect, useState } from "react";
import {
  downloadPdfSlides,
  fetchPdfDownloadAvailability,
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
  const [availability, setAvailability] = useState<PdfDownloadAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAvailability = useCallback(async () => {
    if (!enabled || !roomId || !audienceId) {
      setAvailability(null);
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const nextAvailability = await fetchPdfDownloadAvailability(roomId, audienceId);
      setAvailability(nextAvailability);
      return nextAvailability;
    } catch (availabilityError) {
      log.warn("Failed to fetch PDF download availability", availabilityError);
      setAvailability(null);
      setError("다운로드 가능 여부를 확인하지 못했습니다.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [audienceId, enabled, roomId]);

  useEffect(() => {
    void refreshAvailability();
  }, [refreshAvailability]);

  const downloadSlides = useCallback(async () => {
    if (!roomId || !audienceId) {
      throw new Error("roomId and audienceId are required");
    }

    setDownloading(true);
    setError(null);
    try {
      const file = await downloadPdfSlides(roomId, audienceId);
      saveBlob(file.blob, file.fileName ?? "boini-slides.pdf");
    } catch (downloadError) {
      log.error("Failed to download PDF slides", downloadError);
      setError("슬라이드 다운로드에 실패했습니다.");
      throw downloadError;
    } finally {
      setDownloading(false);
    }
  }, [audienceId, roomId]);

  return {
    availability,
    loading,
    downloading,
    error,
    refreshAvailability,
    downloadSlides,
  };
}
