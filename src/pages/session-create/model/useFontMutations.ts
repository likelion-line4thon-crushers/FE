import { useMutation } from "@tanstack/react-query";
import { finalizeUpload, uploadFonts } from "@/shared/api/pdfFonts";
import type { ChunkUploadReady, FontUploadResponse } from "@/shared/api/model/pdf";

interface Params {
  onUploaded: (fontName: string, res: FontUploadResponse) => void;
  onUploadError: () => void;
  onFinalized: (ready: ChunkUploadReady) => void;
  onFinalizeError: () => void;
}

/**
 * 개별 폰트 업로드 / 변환 시작(finalize)을 React Query mutation 으로 래핑한다.
 * (청크 업로드는 병렬 전송 로직이라 raw axios 그대로 둔다.)
 */
export function useFontMutations({ onUploaded, onUploadError, onFinalized, onFinalizeError }: Params) {
  const uploadMutation = useMutation({
    mutationFn: (v: { uploadId: string; fontName: string; file: File }) =>
      uploadFonts(v.uploadId, [v.file], v.fontName),
    onSuccess: (res, v) => onUploaded(v.fontName, res),
    onError: onUploadError,
  });

  const finalizeMutation = useMutation({
    mutationFn: (v: { uploadId: string; proceedWithoutFonts: boolean }) =>
      finalizeUpload(v.uploadId, v.proceedWithoutFonts),
    onSuccess: onFinalized,
    onError: onFinalizeError,
  });

  return {
    uploadFont: (uploadId: string, fontName: string, file: File) =>
      uploadMutation.mutate({ uploadId, fontName, file }),
    finalize: (uploadId: string, proceedWithoutFonts: boolean) =>
      finalizeMutation.mutate({ uploadId, proceedWithoutFonts }),
    // 업로드 진행 중인 폰트명(진행 중일 때만), 그리고 변환(finalize) 진행 여부
    uploadingName: uploadMutation.isPending ? uploadMutation.variables?.fontName ?? null : null,
    busy: finalizeMutation.isPending,
  };
}
