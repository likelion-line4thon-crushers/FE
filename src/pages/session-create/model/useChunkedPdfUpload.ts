import { useCallback, useState } from "react";
import { usePostHog } from "@posthog/react";
import { ANALYTICS_EVENTS } from "@/shared/config/analytics-events";
import type { ChunkUploadTerminal } from "@/shared/api/model/pdf";
import { uploadPdfInChunks } from "@/shared/api/pdfUpload";

interface UploadProgress {
  sent: number;
  total: number;
}

// PDF 파일을 2MB 청크로 분할해 병렬 업로드하는 훅.
// 진행률 / 결과 / 에러 상태를 관리한다.
export function useChunkedPdfUpload() {
  const posthog = usePostHog();
  const [progress, setProgress] = useState<UploadProgress>({ sent: 0, total: 0 });
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<ChunkUploadTerminal | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(
    async (
      file: File,
      roomId: string,
      deckId: string,
      signal?: AbortSignal
    ): Promise<ChunkUploadTerminal> => {
      setError(null);
      setResult(null);
      setProgress({ sent: 0, total: 0 });
      setIsUploading(true);
      const startedAt = Date.now();
      try {
        const terminal = await uploadPdfInChunks(file, {
          roomId,
          deckId,
          signal,
          onProgress: setProgress,
        });
        setResult(terminal);
        // status: READY(즉시 변환 진행) 또는 NEEDS_FONTS(폰트 확인 대기) — 둘 다 업로드 자체는 완료.
        posthog?.capture(ANALYTICS_EVENTS.PRESENTATION_UPLOAD_COMPLETED, {
          room_id: roomId,
          file_size_bytes: file.size,
          status: terminal.status,
          total_pages: terminal.status === "READY" ? terminal.totalPages : undefined,
          duration_ms: Date.now() - startedAt,
        });
        return terminal;
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        posthog?.capture(ANALYTICS_EVENTS.PRESENTATION_UPLOAD_FAILED, {
          room_id: roomId,
          file_size_bytes: file.size,
          duration_ms: Date.now() - startedAt,
          aborted: signal?.aborted ?? false,
          error_message: err.message,
        });
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [posthog]
  );

  return { upload, progress, error, result, isUploading };
}
