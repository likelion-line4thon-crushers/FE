import { useState, useEffect, useRef } from "react";
import { fetchAudienceSlideStats } from "@/shared/api/presentation";
import websocketService from "@/shared/api/websocket";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("audience-stats");

export const useAudienceStats = ({
  roomId,
  currentSlide,
  isPresenterWsReady,
}: {
  roomId?: any;
  currentSlide?: any;
  isPresenterWsReady?: any;
}) => {
  const [audienceStats, setAudienceStats] = useState({
    prev: 0,
    current: 0,
    next: 0,
  });
  const audienceStatsControllerRef = useRef<AbortController | null>(null);
  const audienceStatsUnsubscribeRef = useRef<(() => void) | null>(null);
  const currentSlideRef = useRef(currentSlide);

  useEffect(() => {
    currentSlideRef.current = currentSlide;
  }, [currentSlide]);

  // API call on presenter page change
  useEffect(() => {
    if (!roomId) return undefined;

    const controller = new AbortController();
    if (audienceStatsControllerRef.current) audienceStatsControllerRef.current.abort();
    audienceStatsControllerRef.current = controller;

    const loadAudienceStats = async () => {
      try {
        const stats = await fetchAudienceSlideStats({
          roomId,
          page: currentSlide,
          signal: controller.signal,
        });

        setAudienceStats((prevStats) => ({
          prev: Number.isFinite(stats?.prev) ? stats.prev : prevStats.prev,
          current: Number.isFinite(stats?.current) ? stats.current : prevStats.current,
          next: Number.isFinite(stats?.next) ? stats.next : prevStats.next,
        }));
      } catch (error: any) {
        if (
          error?.name === "CanceledError" ||
          error?.name === "AbortError" ||
          error?.code === "ERR_CANCELED"
        )
          return;
        log.error("API call failed:", error);
      } finally {
        if (audienceStatsControllerRef.current === controller)
          audienceStatsControllerRef.current = null;
      }
    };

    loadAudienceStats();
    return () => controller.abort();
  }, [roomId, currentSlide]);

  // WebSocket subscription: real-time audience stats
  useEffect(() => {
    audienceStatsUnsubscribeRef.current?.();
    if (!roomId || !isPresenterWsReady || !websocketService.getIsConnected()) {
      audienceStatsUnsubscribeRef.current = null;
      return undefined;
    }

    const topic = `/topic/presentation/${roomId}/audience-slide-stats`;
    audienceStatsUnsubscribeRef.current = websocketService.subscribe(topic, (data: any) => {
      const payload = data?.data ?? data;
      const normalize = (value: any) => {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : 0;
      };

      const stats = {
        prev: normalize(payload?.frontCount ?? 0),
        current: normalize(payload?.currentCount ?? 0),
        next: normalize(payload?.backCount ?? 0),
      };
      log.log("WS stats update:", stats);
      setAudienceStats(stats);
    });

    return () => {
      audienceStatsUnsubscribeRef.current?.();
      audienceStatsUnsubscribeRef.current = null;
    };
  }, [roomId, isPresenterWsReady]);

  useEffect(() => {
    return () => {
      if (audienceStatsControllerRef.current) audienceStatsControllerRef.current.abort();
      audienceStatsUnsubscribeRef.current?.();
    };
  }, []);

  return { audienceStats };
};
