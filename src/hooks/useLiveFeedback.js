import { useState, useEffect, useRef } from "react";
import { fetchLiveFeedback } from "../services/presentationService";
import websocketService from "../services/websocketService";

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
}) => {
  const [feedbackContent, setFeedbackContent] = useState("반응 분석 중 ...");
  const liveFeedbackControllerRef = useRef(null);
  const liveFeedbackUnsubscribeRef = useRef(null);

  // 🔹 실시간 피드백 로드 (슬라이드 전환 시)
  useEffect(() => {
    if (!roomId || !isEnabled) {
      setFeedbackContent("반응 분석 중 ...");
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
        setFeedbackContent(message || "반응 분석 중 ...");
      } catch (error) {
        if (
          error?.name === "CanceledError" ||
          error?.name === "AbortError" ||
          error?.code === "ERR_CANCELED"
        ) {
          return;
        }
        // 에러 발생 시 기본 메시지 유지
        setFeedbackContent("반응 분석 중 ...");
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
    liveFeedbackUnsubscribeRef.current = websocketService.subscribe(
      liveFeedbackTopic,
      (data) => {
        const payload = data?.data ?? data;
        const message = payload?.message ?? payload?.feedback ?? payload?.content ?? null;
        const page = payload?.page ?? payload?.slide ?? null;

        // 현재 슬라이드의 피드백만 업데이트
        if (message && typeof message === "string" && message.trim()) {
          const currentPage = currentSlide + 1; // 1-based
          if (page === null || page === currentPage) {
            setFeedbackContent(message.trim());
          }
        }
      }
    );

    return () => {
      liveFeedbackUnsubscribeRef.current?.();
      liveFeedbackUnsubscribeRef.current = null;
    };
  }, [roomId, isEnabled, isPresenterWsReady, currentSlide]);

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

