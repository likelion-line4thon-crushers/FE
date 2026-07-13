import { useState, useEffect, useRef, useCallback } from "react";
import websocketService, { WebSocketService } from "@/shared/api/websocket";
import { SELECTED_EMOJI_ICONS } from "@/entities/reaction";
import type { EmojiId, Stamp, StampsBySlide } from "./reaction";

const ensureNumber = (value: any): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const createStamp = ({ id, xPct, yPct, src }: Stamp): Stamp => ({
  id,
  xPct,
  yPct,
  src,
});

const getDefaultStampId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const buildConnectionKey = (wsUrl: string | null, token: string | null) =>
  `${wsUrl || ""}::${token || ""}`;

interface UseEmojiReactionsParams {
  sessionId?: string | null;
  token?: string | null;
  wsUrl?: string | null;
  enabled?: boolean;
  emojiMap?: Record<number, string>;
  disconnectOnUnmount?: boolean;
  service?: any;
}

const useEmojiReactions = ({
  sessionId,
  token,
  wsUrl,
  enabled = true,
  emojiMap = SELECTED_EMOJI_ICONS,
  disconnectOnUnmount = true,
  service,
}: UseEmojiReactionsParams = {}) => {
  const socketServiceRef = useRef(service instanceof WebSocketService ? service : websocketService);
  const socketService = socketServiceRef.current;

  const [stampsBySlide, setStampsBySlide] = useState<StampsBySlide>({});
  const [isReady, setIsReady] = useState(false);
  const [connectionError, setConnectionError] = useState<any>(null);

  const reactionUnsubscribeRef = useRef<(() => void) | null>(null);
  const connectionKeyRef = useRef<string | null>(null);
  const disconnectOnUnmountRef = useRef(disconnectOnUnmount);

  const resetState = useCallback(() => {
    setStampsBySlide({});
    setIsReady(false);
    setConnectionError(null);
  }, []);

  const addStampToState = useCallback((slideIndex: number, stamp: Stamp) => {
    if (slideIndex < 0 || !stamp || !stamp.src) return;

    setStampsBySlide((prev) => {
      const key = String(slideIndex);
      const existing = prev[key] ? [...prev[key]] : [];

      if (stamp.id && existing.some((item) => item.id === stamp.id)) {
        return prev;
      }

      return { ...prev, [key]: [...existing, createStamp(stamp)] };
    });
  }, []);

  const addLocalStamp = useCallback(
    (slideIndex: number, stamp: Partial<Stamp> & { src: string }) => {
      const normalizedId = stamp?.id || getDefaultStampId();
      addStampToState(slideIndex, { ...stamp, id: normalizedId } as Stamp);
    },
    [addStampToState]
  );

  const clearStamps = useCallback(() => {
    setStampsBySlide({});
  }, []);

  const handleReactionMessage = useCallback(
    (payload: any) => {
      if (!payload || typeof payload.slide === "undefined") return;

      const emojiId = ensureNumber(payload.emoji);
      const slideIndex = ensureNumber(payload.slide)! - 1;
      const xPct = ensureNumber(payload.x ?? payload.xPct);
      const yPct = ensureNumber(payload.y ?? payload.yPct);
      const createdAt = payload.created_at || payload.createdAt || payload.id;

      if (!Number.isFinite(slideIndex) || slideIndex < 0 || xPct === null || yPct === null) {
        return;
      }

      const emojiSrc = emojiMap[emojiId as EmojiId];
      if (!emojiSrc) return;

      addStampToState(slideIndex, {
        id: createdAt || getDefaultStampId(),
        xPct,
        yPct,
        src: emojiSrc,
      });
    },
    [addStampToState, emojiMap]
  );

  const disconnect = useCallback(() => {
    reactionUnsubscribeRef.current?.();
    reactionUnsubscribeRef.current = null;
    connectionKeyRef.current = null;
    socketService.disconnect();
    setIsReady(false);
  }, [socketService]);

  useEffect(() => {
    setStampsBySlide({});
  }, [sessionId]);

  useEffect(() => {
    disconnectOnUnmountRef.current = disconnectOnUnmount;
  }, [disconnectOnUnmount]);

  useEffect(() => {
    if (!enabled || !sessionId || !token || !wsUrl) {
      resetState();
      return undefined;
    }

    let isMounted = true;
    const desiredConnectionKey = buildConnectionKey(wsUrl, token);

    if (
      socketService.getIsConnected() &&
      connectionKeyRef.current &&
      connectionKeyRef.current !== desiredConnectionKey
    ) {
      socketService.disconnect();
      connectionKeyRef.current = null;
    }

    const reactionTopic = `/topic/presentation/${sessionId}/reactions`;

    const onConnect = () => {
      if (!isMounted) return;
      setIsReady(true);
      setConnectionError(null);

      reactionUnsubscribeRef.current?.();
      reactionUnsubscribeRef.current = socketService.subscribe(
        reactionTopic,
        handleReactionMessage
      );
    };

    const onError = (error: any) => {
      if (!isMounted) return;
      setIsReady(false);
      setConnectionError(error);
    };

    setConnectionError(null);
    socketService.connect(wsUrl, token, onConnect, onError, {
      // 재연결 시 onConnect가 다시 구독하므로, 끊김 동안 ready만 내려 스탬프 유실을 막는다.
      onDisconnect: () => {
        if (!isMounted) return;
        setIsReady(false);
      },
    });
    connectionKeyRef.current = desiredConnectionKey;

    return () => {
      isMounted = false;
      setIsReady(false);

      reactionUnsubscribeRef.current?.();
      reactionUnsubscribeRef.current = null;

      if (disconnectOnUnmountRef.current) {
        socketService.disconnect();
        connectionKeyRef.current = null;
      }
    };
  }, [enabled, sessionId, token, wsUrl, handleReactionMessage, resetState, socketService]);

  return {
    stampsBySlide,
    isReady,
    connectionError,
    addLocalStamp,
    clearStamps,
    disconnect,
  };
};

export default useEmojiReactions;
