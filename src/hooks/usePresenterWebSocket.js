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
      const initialPageIndex = currentSlideRef.current;
      websocketService.sendPageChange(
        roomId,
        initialPageIndex,
        initialPageIndex
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
        // 청중은 페이지 번호(1부터 시작)를 보내므로 인덱스(0부터 시작)로 변환
        const changedPageNumber = Number(data?.changedPage);
        const nextSlide = Number.isFinite(changedPageNumber) ? changedPageNumber - 1 : NaN;
        if (Number.isFinite(nextSlide) && nextSlide >= 0) {
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

