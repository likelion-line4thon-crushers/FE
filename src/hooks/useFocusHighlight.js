import { useState, useCallback, useRef, useEffect } from "react";
import websocketService from "../services/websocketService";

/**
 * 집중 유도 하이라이트 관리 훅
 * - 집중 유도 버튼 클릭 시 하이라이트 표시
 * - 1초 후 자동으로 하이라이트 제거
 */
export const useFocusHighlight = ({ roomId, isPresenterWsReady }) => {
  const [showFocusHighlight, setShowFocusHighlight] = useState(false);
  const focusHighlightTimeoutRef = useRef(null);

  const handleFocusOn = useCallback(() => {
    if (!roomId) {
      return;
    }

    if (!isPresenterWsReady || !websocketService.getIsConnected()) {
      return;
    }

    websocketService.sendFocusOn(roomId);

    setShowFocusHighlight(true);
    if (focusHighlightTimeoutRef.current) {
      clearTimeout(focusHighlightTimeoutRef.current);
    }
    focusHighlightTimeoutRef.current = setTimeout(() => {
      setShowFocusHighlight(false);
      focusHighlightTimeoutRef.current = null;
    }, 1000);
  }, [roomId, isPresenterWsReady]);

  useEffect(() => {
    return () => {
      if (focusHighlightTimeoutRef.current) {
        clearTimeout(focusHighlightTimeoutRef.current);
      }
    };
  }, []);

  return {
    showFocusHighlight,
    handleFocusOn,
  };
};

