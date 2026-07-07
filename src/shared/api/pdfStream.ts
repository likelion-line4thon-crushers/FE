import type {
  SseCompleteEvent,
  SseErrorEvent,
  SsePageEvent,
} from './model/pdf';

// VITE_API_BASE_URL 이 끝에 '/' 를 포함해도 streamUrl 과 합칠 때 '//' 가 되지 않도록 정규화.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');

interface SubscribeArgs {
  // 백엔드 201 응답의 streamUrl (예: "/api/pdf/pdf-xxxx/stream")
  streamUrl: string;
  onPage: (e: SsePageEvent) => void;
  onComplete: (e: SseCompleteEvent) => void;
  onError: (e: SseErrorEvent | Error) => void;
}

// EventSource 래퍼. 반환된 close 함수로 구독 해제.
// 백엔드는 complete 전송 후 emitter.complete() 를 호출하지만, 브라우저는 연결 끊김으로 간주하고
// 자동 재연결을 시도할 수 있어 명시적으로 es.close() 를 부른다.
export function subscribePdfStream({
  streamUrl,
  onPage,
  onComplete,
  onError,
}: SubscribeArgs): () => void {
  const path = streamUrl.startsWith('/') ? streamUrl : `/${streamUrl}`;
  const url = streamUrl.startsWith('http') ? streamUrl : `${API_BASE}${path}`;
  const es = new EventSource(url);

  es.addEventListener('page', (ev) => {
    try {
      onPage(JSON.parse((ev as MessageEvent).data) as SsePageEvent);
    } catch (err) {
      onError(err instanceof Error ? err : new Error('page 이벤트 파싱 실패'));
    }
  });

  es.addEventListener('complete', (ev) => {
    try {
      onComplete(JSON.parse((ev as MessageEvent).data) as SseCompleteEvent);
    } catch (err) {
      onError(err instanceof Error ? err : new Error('complete 이벤트 파싱 실패'));
    } finally {
      es.close();
    }
  });

  // 백엔드가 emit('error', ...) 로 보낸 named 이벤트는 data 필드가 있고,
  // 전송 실패 등 EventSource 자체 오류는 data 가 없다.
  //
  // 전송 오류 처리 정책:
  //  - readyState === CONNECTING: 브라우저가 자동 재연결 시도 중. 콜백 호출하지 않고 맡긴다.
  //  - readyState === CLOSED: 브라우저도 포기한 상태. 이 때만 치명 에러로 상위에 알린다.
  //  이렇게 해야 네트워크 일시 끊김이 prep 전체를 블로킹하지 않는다.
  es.addEventListener('error', (ev) => {
    const data = (ev as MessageEvent).data;
    if (typeof data === 'string' && data.length > 0) {
      try {
        onError(JSON.parse(data) as SseErrorEvent);
        return;
      } catch {
        // fallthrough → 전송 오류로 처리
      }
    }
    if (es.readyState === EventSource.CLOSED) {
      onError(new Error('SSE 연결이 종료되었습니다'));
    }
    // CONNECTING 상태면 브라우저 재연결에 맡기고 아무 것도 하지 않는다.
  });

  return () => es.close();
}
