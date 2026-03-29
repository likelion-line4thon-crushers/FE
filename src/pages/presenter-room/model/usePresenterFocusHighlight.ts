import { useState, useCallback, useRef, useEffect } from "react";
import websocketService from "@/shared/api/websocket";

interface UsePresenterFocusHighlightParams {
  roomId: string | null;
  isPresenterWsReady: boolean;
}

/**
 * * Presenter-side focus highlight — sends WS focusOn message.
 * Distinct from the audience-side useFocusHighlight which receives them.
 */
export const usePresenterFocusHighlight = ({
  roomId,
  isPresenterWsReady,
}: UsePresenterFocusHighlightParams) => {
  const [showFocusHighlight, setShowFocusHighlight] = useState(false);
  const focusHighlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFocusOn = useCallback(() => {
    if (!roomId) return;
    if (!isPresenterWsReady || !websocketService.getIsConnected()) return;

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

  return { showFocusHighlight, handleFocusOn };
};

export default usePresenterFocusHighlight;
