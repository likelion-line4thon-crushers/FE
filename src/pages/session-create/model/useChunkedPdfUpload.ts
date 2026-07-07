import { useCallback, useState } from 'react';
import type { ChunkUploadReady } from '@/shared/api/model/pdf';
import { uploadPdfInChunks } from '@/shared/api/pdfUpload';

interface UploadProgress {
  sent: number;
  total: number;
}

// PDF 파일을 2MB 청크로 분할해 병렬 업로드하는 훅.
// 진행률 / 결과 / 에러 상태를 관리한다.
export function useChunkedPdfUpload() {
  const [progress, setProgress] = useState<UploadProgress>({ sent: 0, total: 0 });
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<ChunkUploadReady | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(
    async (
      file: File,
      roomId: string,
      deckId: string,
      signal?: AbortSignal,
    ): Promise<ChunkUploadReady> => {
      setError(null);
      setResult(null);
      setProgress({ sent: 0, total: 0 });
      setIsUploading(true);
      try {
        const ready = await uploadPdfInChunks(file, {
          roomId,
          deckId,
          signal,
          onProgress: setProgress,
        });
        setResult(ready);
        return ready;
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  return { upload, progress, error, result, isUploading };
}
