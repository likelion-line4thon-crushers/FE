import { useState, useEffect, useRef } from "react";
import { fetchLiveFeedback } from "@/shared/api/presentation";
import websocketService from "@/shared/api/websocket";

/**
 * 실시간 피드백 관리 훅
 * - 슬라이드 전환 시 API 호출
 * - WebSocket 구독을 통한 실시간 업데이트
 */
export const useLiveFeedback = ({
  roomId,
  currentSlide,
  isEnabled,
  isPresenterWsReady,
}: {
  roomId?: any;
  currentSlide?: any;
  isEnabled?: any;
  isPresenterWsReady?: any;
}) => {
  const [feedbackContent, setFeedbackContent] = useState("");
  const liveFeedbackControllerRef = useRef<AbortController | null>(null);
  const liveFeedbackUnsubscribeRef = useRef<(() => void) | null>(null);
  const currentSlideRef = useRef(currentSlide);
  const lastWebSocketUpdateRef = useRef<{ page: any; message: string; timestamp: number } | null>(
    null
  ); // 웹소켓으로 받은 마지막 피드백 추적

  // currentSlide 최신 값 유지
  useEffect(() => {
    currentSlideRef.current = currentSlide;
  }, [currentSlide]);

  // 🔹 실시간 피드백 로드 (슬라이드 전환 시)
  useEffect(() => {
    if (!roomId || !isEnabled) {
      setFeedbackContent("");
      return;
    }

    if (liveFeedbackControllerRef.current) {
      liveFeedbackControllerRef.current.abort();
    }

    const controller = new AbortController();
    liveFeedbackControllerRef.current = controller;

    const loadLiveFeedback = async () => {
      try {
        const page = currentSlide + 1; // 1-based
        const message = await fetchLiveFeedback({
          roomId,
          page,
          signal: controller.signal,
        });

        // 웹소켓으로 최근에 받은 피드백이 있고, 같은 슬라이드라면 웹소켓 값을 우선
        const lastUpdate = lastWebSocketUpdateRef.current;
        if (lastUpdate && lastUpdate.page === page && lastUpdate.message) {
          setFeedbackContent(lastUpdate.message);
        } else {
          setFeedbackContent(message || "");
        }
      } catch (error: any) {
        if (
          error?.name === "CanceledError" ||
          error?.name === "AbortError" ||
          error?.code === "ERR_CANCELED"
        ) {
          return;
        }
        // 에러 발생 시 빈 문자열
        setFeedbackContent("");
      } finally {
        if (liveFeedbackControllerRef.current === controller) {
          liveFeedbackControllerRef.current = null;
        }
      }
    };

    loadLiveFeedback();

    return () => {
      controller.abort();
    };
  }, [roomId, currentSlide, isEnabled]);

  // 🔹 실시간 피드백 WebSocket 구독 (스티커 부착 시 자동 검증)
  // currentSlide를 dependency에서 제거하여 슬라이드 변경 시 구독이 재생성되지 않도록 함
  useEffect(() => {
    liveFeedbackUnsubscribeRef.current?.();

    if (!roomId || !isEnabled || !isPresenterWsReady) {
      liveFeedbackUnsubscribeRef.current = null;
      return undefined;
    }

    if (!websocketService.getIsConnected()) {
      liveFeedbackUnsubscribeRef.current = null;
      return undefined;
    }

    const liveFeedbackTopic = `/topic/presentation/${roomId}/liveFeedback`;

    liveFeedbackUnsubscribeRef.current = websocketService.subscribe(liveFeedbackTopic, (data) => {
      const latestCurrentSlide = currentSlideRef.current;

      // 응답이 문자열인 경우 직접 사용
      let message = null;
      let page = null;

      if (typeof data === "string") {
        message = data.trim();
      } else if (data && typeof data === "object") {
        // 객체인 경우 다양한 필드 확인
        const payload = data?.data ?? data;
        message =
          payload?.message ?? payload?.feedback ?? payload?.content ?? payload?.text ?? null;
        page =
          payload?.page ?? payload?.slide ?? payload?.slideNumber ?? payload?.slide_number ?? null;
      }

      // 메시지가 있으면 현재 슬라이드인지 확인 후 업데이트
      if (message && typeof message === "string" && message.trim()) {
        const currentPage = latestCurrentSlide + 1; // 1-based
        const trimmedMessage = message.trim();

        // page가 없거나 현재 슬라이드의 피드백이면 즉시 업데이트
        if (page === null || page === undefined || page === currentPage) {
          // 웹소켓으로 받은 피드백 저장
          lastWebSocketUpdateRef.current = {
            page: page || currentPage,
            message: trimmedMessage,
            timestamp: Date.now(),
          };

          // 즉시 상태 업데이트
          setFeedbackContent(trimmedMessage);
        }
      }
    });

    return () => {
      liveFeedbackUnsubscribeRef.current?.();
      liveFeedbackUnsubscribeRef.current = null;
    };
  }, [roomId, isEnabled, isPresenterWsReady]); // currentSlide 제거

  // Cleanup
  useEffect(() => {
    return () => {
      if (liveFeedbackControllerRef.current) {
        liveFeedbackControllerRef.current.abort();
      }
      liveFeedbackUnsubscribeRef.current?.();
    };
  }, []);

  return { feedbackContent };
};
