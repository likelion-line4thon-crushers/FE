// 청크 업로드 진행 중 (HTTP 200)
export interface ChunkUploadInProgress {
  uploadId: string;
  chunkIndex: number;
  receivedChunks: number;
  totalChunks: number;
  chunkSize: number;
  status: 'IN_PROGRESS';
}

// 청크 업로드 완료 / 조립 성공 (HTTP 201)
export interface ChunkUploadReady {
  status: 'READY';
  uploadId: string;
  pdfId: string;
  fileName: string;
  totalPages: number;
  streamUrl: string;
}

export type FontStatus = 'AVAILABLE' | 'MISSING';

export interface FontReportEntry {
  name: string;
  status: FontStatus;
  embedded: boolean;
  installed: boolean;
}

// 청크 업로드 완료, 단, 누락 폰트 존재 (HTTP 201, status=NEEDS_FONTS)
export interface ChunkUploadNeedsFonts {
  status: 'NEEDS_FONTS';
  uploadId: string;
  fontReport: FontReportEntry[];
}

export type ChunkUploadTerminal = ChunkUploadReady | ChunkUploadNeedsFonts;

export type ChunkUploadResult =
  | ChunkUploadInProgress
  | ChunkUploadReady
  | ChunkUploadNeedsFonts;

// SSE: event=page
export interface SsePageEvent {
  pdfId: string;
  pageIndex: number;
  totalPages: number;
  imageUrl: string;
  format: 'webp' | 'png' | string;
  width: number;
  height: number;
  canStartSession: boolean;
}

// SSE: event=complete
export interface SseCompleteEvent {
  pdfId: string;
  totalPages: number;
  status: 'DONE' | string;
}

// SSE: event=error
// pageIndex: -1 → PDF 자체 열기 실패(PDF_LOAD_FAILED), 스트림 종료
// 그 외 → 해당 페이지 렌더링 실패(RENDER_FAILED), 스트림 계속
export interface SseErrorEvent {
  pdfId: string;
  pageIndex: number;
  message: string;
  code: 'RENDER_FAILED' | 'PDF_LOAD_FAILED' | string;
}
