import api from './api';
import type { ChunkUploadReady, FontReportEntry } from './model/pdf';

export async function uploadFonts(uploadId: string, files: File[]): Promise<FontReportEntry[]> {
  const form = new FormData();
  files.forEach((f) => form.append('fonts', f));
  const res = await api.post(`/api/upload/${uploadId}/fonts`, form);
  return res.data.data as FontReportEntry[];
}

export async function finalizeUpload(
  uploadId: string,
  proceedWithoutFonts = false,
): Promise<ChunkUploadReady> {
  const res = await api.post(`/api/upload/${uploadId}/finalize`, { proceedWithoutFonts });
  return res.data.data as ChunkUploadReady;
}
