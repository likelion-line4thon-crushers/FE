import { useCallback, useEffect, useRef, useState } from "react";
import { createLogger } from "@/shared/lib/logger";
import { fetchSlidesMeta, fetchAllOriginalSlideUrls } from "@/shared/api/presentation";

const log = createLogger("session-restore");

export type RestoreOutcome =
  | { kind: "slides"; slides: (string | null)[]; totalPages: number }
  | { kind: "resubscribe"; streamUrl: string; totalPages: number }
  | { kind: "failed" };

interface Params {
  enabled: boolean;
  roomId?: string | null;
  deckId?: string | null;
  totalPages?: number;
  pdfId?: string | null;
}

/**
 * 새로고침 복원: sessionStorage 의 roomData 로 재진입했을 때 슬라이드를 되살린다.
 * 우선순위:
 *  1) meta 엔드포인트로 모든 페이지 URL 이 완비돼 있으면 slides 로 고정 표시.
 *  2) meta 가 부분만 반환하거나 실패 + pdfId 가 있으면 SSE 스트림 재구독
 *     (BE 는 subscribe 시점 이전 이벤트를 버퍼링 후 flush 해주므로 안전).
 *  3) 둘 다 불가하면 레거시 per-page API 로 마지막 폴백, 그것도 실패하면 failed.
 */
export function useRestorePresenterSlides({ enabled, roomId, deckId, totalPages, pdfId }: Params) {
  const [outcome, setOutcome] = useState<RestoreOutcome | null>(null);
  const [attempt, setAttempt] = useState(0);
  const startedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const pages = totalPages ?? 0;
    if (!enabled || !roomId || !deckId || pages <= 0) return undefined;

    const key = `${roomId}:${deckId}:${attempt}`;
    if (startedKeyRef.current === key) return undefined;
    startedKeyRef.current = key;

    let cancelled = false;

    const resubscribe = (): boolean => {
      if (!pdfId) return false;
      setOutcome({ kind: "resubscribe", streamUrl: `/api/pdf/${pdfId}/stream`, totalPages: pages });
      return true;
    };

    const restore = async () => {
      try {
        const urls = await fetchSlidesMeta(roomId, deckId, pages);
        if (cancelled) return;
        const allReady = urls.length === pages && urls.every((u) => !!u);
        if (allReady) {
          setOutcome({ kind: "slides", slides: urls, totalPages: pages });
          return;
        }
        // meta 가 부분만 반환 → BE 가 아직 렌더링 중. SSE 로 재구독해 남은 페이지 수신.
        if (resubscribe()) {
          log.warn("meta 부분 응답, SSE 재구독으로 전환");
          return;
        }
        throw new Error("meta 응답이 비어 있음");
      } catch (metaErr) {
        if (cancelled) return;
        log.warn("meta 조회 실패:", metaErr);
        if (resubscribe()) return;
        // 최후 폴백: 레거시 per-page API
        try {
          const urls = await fetchAllOriginalSlideUrls(roomId, deckId, pages);
          if (cancelled) return;
          setOutcome({ kind: "slides", slides: urls, totalPages: pages });
        } catch (err) {
          if (cancelled) return;
          log.error("슬라이드 복원 실패:", err);
          setOutcome({ kind: "failed" });
        }
      }
    };

    restore();
    return () => {
      cancelled = true;
    };
  }, [enabled, roomId, deckId, totalPages, pdfId, attempt]);

  const retry = useCallback(() => {
    setOutcome(null);
    setAttempt((n) => n + 1);
  }, []);

  return { outcome, retry };
}
