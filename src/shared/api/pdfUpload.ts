import { v4 as uuidv4 } from 'uuid';
import api from './api';
import type {
  ChunkUploadReady,
  ChunkUploadResult,
} from './model/pdf';

// 2MB 고정 (백엔드 스펙)
export const CHUNK_SIZE = 2 * 1024 * 1024;
const DEFAULT_CONCURRENCY = 4;

interface UploadChunkArgs {
  chunk: Blob;
  uploadId: string;
  roomId: string;
  deckId: string;
  chunkIndex: number;
  totalChunks: number;
  fileName: string;
  fileSize: number;
  signal?: AbortSignal;
}

interface UploadChunkResponse {
  status: number;
  data: ChunkUploadResult;
}

export async function uploadPdfChunk(args: UploadChunkArgs): Promise<UploadChunkResponse> {
  const form = new FormData();
  form.append('chunk', args.chunk);
  form.append('uploadId', args.uploadId);
  form.append('roomId', args.roomId);
  form.append('deckId', args.deckId);
  form.append('chunkIndex', String(args.chunkIndex));
  form.append('totalChunks', String(args.totalChunks));
  form.append('fileName', args.fileName);
  form.append('fileSize', String(args.fileSize));

  const res = await api.post('/api/upload/chunk', form, {
    signal: args.signal,
    validateStatus: (s) => s === 200 || s === 201,
  });
  return { status: res.status, data: res.data.data };
}

interface UploadOptions {
  roomId: string;
  deckId: string;
  concurrency?: number;
  onProgress?: (progress: { sent: number; total: number }) => void;
  signal?: AbortSignal;
}

// 병렬 업로드(기본 동시 4개). 서버는 totalChunks 카운트에 도달한 스레드에서 201을 반환하므로
// 어떤 청크가 201인지 미리 알 수 없음. 모든 요청 종료 후 결과 중 READY 를 찾아 반환.
export async function uploadPdfInChunks(
  file: File,
  opts: UploadOptions,
): Promise<ChunkUploadReady> {
  const uploadId = uuidv4();
  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));
  const concurrency = Math.min(opts.concurrency ?? DEFAULT_CONCURRENCY, totalChunks);

  const queue = Array.from({ length: totalChunks }, (_, i) => i);
  const results: Array<ChunkUploadResult | null> = new Array(totalChunks).fill(null);

  let sent = 0;
  let aborted = false;
  const internal = new AbortController();

  const onExternalAbort = () => internal.abort();
  opts.signal?.addEventListener('abort', onExternalAbort);

  const worker = async () => {
    while (!aborted) {
      const i = queue.shift();
      if (i === undefined) return;
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      try {
        const { data } = await uploadPdfChunk({
          chunk,
          uploadId,
          roomId: opts.roomId,
          deckId: opts.deckId,
          chunkIndex: i,
          totalChunks,
          fileName: file.name,
          fileSize: file.size,
          signal: internal.signal,
        });
        results[i] = data;
        sent += 1;
        opts.onProgress?.({ sent, total: totalChunks });
      } catch (err) {
        aborted = true;
        internal.abort();
        throw err;
      }
    }
  };

  try {
    await Promise.all(Array.from({ length: concurrency }, () => worker()));
  } finally {
    opts.signal?.removeEventListener('abort', onExternalAbort);
  }

  const ready = results.find(
    (r): r is ChunkUploadReady => !!r && r.status === 'READY',
  );
  if (!ready) {
    throw new Error('청크 업로드가 완료되었지만 READY 응답을 받지 못했습니다.');
  }
  return ready;
}
