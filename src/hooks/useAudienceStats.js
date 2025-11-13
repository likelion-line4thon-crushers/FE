import { useState, useEffect, useRef } from "react";
import { fetchAudienceSlideStats } from "../services/presentationService";
import websocketService from "../services/websocketService";

/**
 * 청중 통계 관리 훅
 * - 현재 슬라이드 기준 청중 분포 데이터 조회
 * - 발표자 페이지 이동 시: API 호출
 * - 청중 페이지 이동 시: WebSocket으로 실시간 업데이트
 */
export const useAudienceStats = ({ roomId, currentSlide, isPresenterWsReady }) => {
  const [audienceStats, setAudienceStats] = useState({
    prev: 0,
    current: 0,
    next: 0,
  });
  const audienceStatsControllerRef = useRef(null);
  const audienceStatsUnsubscribeRef = useRef(null);
  const currentSlideRef = useRef(currentSlide);

  // currentSlide 최신 값 유지
  useEffect(() => {
    currentSlideRef.current = currentSlide;
  }, [currentSlide]);

  // 🔹 발표자 페이지 이동 시 API 호출
  useEffect(() => {
    if (!roomId) {
      return undefined;
    }

    const controller = new AbortController();

    if (audienceStatsControllerRef.current) {
      audienceStatsControllerRef.current.abort();
    }

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
          current: Number.isFinite(stats?.current)
            ? stats.current
            : prevStats.current,
          next: Number.isFinite(stats?.next) ? stats.next : prevStats.next,
        }));
      } catch (error) {
        if (
          error?.name === "CanceledError" ||
          error?.name === "AbortError" ||
          error?.code === "ERR_CANCELED"
        ) {
          return;
        }
      } finally {
        if (audienceStatsControllerRef.current === controller) {
          audienceStatsControllerRef.current = null;
        }
      }
    };

    loadAudienceStats();

    return () => {
      controller.abort();
    };
  }, [roomId, currentSlide]);

  // 🔹 WebSocket 구독: 청중 페이지 이동 시 실시간 업데이트
  useEffect(() => {
    audienceStatsUnsubscribeRef.current?.();

    if (!roomId || !isPresenterWsReady) {
      audienceStatsUnsubscribeRef.current = null;
      return undefined;
    }

    if (!websocketService.getIsConnected()) {
      audienceStatsUnsubscribeRef.current = null;
      return undefined;
    }

    const audienceStatsTopic = `/topic/presentation/${roomId}/audience-slide-stats`;
    
    audienceStatsUnsubscribeRef.current = websocketService.subscribe(
      audienceStatsTopic,
      (data) => {
        // 응답 형식: { "frontCount": 0, "currentCount": 75, "backCount": 25 }
        console.log("[useAudienceStats] WebSocket 브로드캐스트 수신 - 원본 데이터:", data);
        
        const payload = data?.data ?? data;
        console.log("[useAudienceStats] WebSocket 브로드캐스트 수신 - 파싱된 payload:", payload);
        
        const normalize = (value) => {
          const numeric = Number(value);
          return Number.isFinite(numeric) ? numeric : 0;
        };

        const frontCount = normalize(payload?.frontCount ?? payload?.front ?? 0);
        const currentCount = normalize(payload?.currentCount ?? payload?.current ?? 0);
        const backCount = normalize(payload?.backCount ?? payload?.back ?? 0);

        const stats = {
          prev: frontCount,
          current: currentCount,
          next: backCount,
        };
        
        console.log("[useAudienceStats] WebSocket 브로드캐스트 수신 - 최종 stats:", stats);

        // WebSocket으로 받은 데이터를 상태에 반영
        setAudienceStats(stats);
      }
    );

    return () => {
      audienceStatsUnsubscribeRef.current?.();
      audienceStatsUnsubscribeRef.current = null;
    };
  }, [roomId, isPresenterWsReady]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audienceStatsControllerRef.current) {
        audienceStatsControllerRef.current.abort();
      }
      audienceStatsUnsubscribeRef.current?.();
    };
  }, []);

  return { audienceStats };
};

