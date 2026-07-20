import { useEffect, useState } from "react";
import type { SseErrorEvent, SsePageEvent } from "@/shared/api/model/pdf";
import { subscribePdfStream } from "@/shared/api/pdfStream";

interface UsePdfStreamArgs {
  streamUrl: string | null;
  totalPages: number;
  enabled: boolean;
}

// SSE 로 도착한 페이지를 순서대로 slides 배열에 채우고,
// canStartSession / 완료 / 치명 오류 상태를 관리한다.
export function usePdfStream({ streamUrl, totalPages, enabled }: UsePdfStreamArgs) {
  const [slides, setSlides] = useState<(string | null)[]>([]);
  const [canStartSession, setCanStartSession] = useState(false);
  const [done, setDone] = useState(false);
  const [fatalError, setFatalError] = useState<SseErrorEvent | Error | null>(null);
  // 페이지 단위 렌더링 실패 — 스트림은 계속되지만 해당 페이지는 빈 슬라이드로 남는다.
  // UI 에서 "N장 변환 실패" 안내를 띄울 수 있도록 상태로 노출한다.
  const [pageErrors, setPageErrors] = useState<Record<number, SseErrorEvent>>({});

  useEffect(() => {
    if (!enabled || !streamUrl || totalPages <= 0) return;

    setSlides(new Array<string | null>(totalPages).fill(null));
    setCanStartSession(false);
    setDone(false);
    setFatalError(null);
    setPageErrors({});

    const close = subscribePdfStream({
      streamUrl,
      onPage: (e: SsePageEvent) => {
        setSlides((prev) => {
          const next =
            prev.length === e.totalPages
              ? [...prev]
              : new Array<string | null>(e.totalPages).fill(null);
          next[e.pageIndex] = e.imageUrl;
          return next;
        });
        // canStartSession 은 특정 페이지(기본 10번째, 또는 총 페이지가 10 미만이면 마지막) 이벤트에만 true.
        // 한 번 true 를 본 뒤에는 sticky 하게 유지한다.
        if (e.canStartSession) setCanStartSession(true);
      },
      onComplete: () => {
        setDone(true);
      },
      onError: (e) => {
        if (e instanceof Error) {
          setFatalError(e);
          return;
        }
        // PDF 자체 열기 실패 → 스트림 종료, 치명 오류
        if (e.pageIndex === -1 || e.code === "PDF_LOAD_FAILED") {
          setFatalError(e);
          return;
        }
        // 페이지 단위 실패 → 기록만 하고 스트림 지속
        setPageErrors((prev) => ({ ...prev, [e.pageIndex]: e }));
      },
    });

    return close;
  }, [streamUrl, totalPages, enabled]);

  return {
    slides,
    canStartSession,
    done,
    fatalError,
    pageErrors,
  };
}
