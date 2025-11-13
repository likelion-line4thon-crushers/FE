import { useState, useEffect, useRef } from "react";
import websocketService from "../services/websocketService";

/**
 * 발표자 WebSocket 연결 관리 훅
 * - WebSocket 연결 및 상태 관리
 * - 청중 페이지 변경 구독
 */
export const usePresenterWebSocket = ({
  roomId,
  presenterToken,
  presenterWsUrl,
  currentSlideRef,
  changeSlide,
}) => {
  const [isPresenterWsReady, setIsPresenterWsReady] = useState(false);

  // WebSocket 연결
  useEffect(() => {
    if (!roomId || !presenterToken || !presenterWsUrl) {
      return undefined;
    }

    const onConnect = () => {
      setIsPresenterWsReady(true);
      websocketService.sendPageChange(
        roomId,
        currentSlideRef.current,
        currentSlideRef.current
      );
    };

    const onError = () => {
      setIsPresenterWsReady(false);
    };

    websocketService.connect(presenterWsUrl, presenterToken, onConnect, onError);

    return () => {
      setIsPresenterWsReady(false);
      websocketService.disconnect();
    };
  }, [roomId, presenterToken, presenterWsUrl, currentSlideRef]);

  // 청중 페이지 변경 구독
  useEffect(() => {
    if (!roomId || !presenterToken || !presenterWsUrl) {
      return undefined;
    }

    if (!websocketService.getIsConnected()) {
      return undefined;
    }

    const unsubscribe = websocketService.subscribe(
      `/topic/presentation/${roomId}/pageChange/audience`,
      (data) => {
        const nextSlide = Number(data?.changedPage);
        if (Number.isFinite(nextSlide)) {
          changeSlide(nextSlide, { broadcast: false });
        }
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [roomId, presenterToken, presenterWsUrl, changeSlide]);

  return { isPresenterWsReady };
};

