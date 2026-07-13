import api from './api';
import type { ChunkUploadReady, FontUploadResponse } from './model/pdf';

export async function uploadFonts(
  uploadId: string,
  files: File[],
  targetFont?: string,
): Promise<FontUploadResponse> {
  const form = new FormData();
  files.forEach((f) => form.append('fonts', f));
  if (targetFont) form.append('targetFont', targetFont);
  const res = await api.post(`/api/upload/${uploadId}/fonts`, form);
  return res.data.data as FontUploadResponse;
}

export async function finalizeUpload(
  uploadId: string,
  proceedWithoutFonts = false,
): Promise<ChunkUploadReady> {
  const res = await api.post(`/api/upload/${uploadId}/finalize`, { proceedWithoutFonts });
  return res.data.data as ChunkUploadReady;
}
