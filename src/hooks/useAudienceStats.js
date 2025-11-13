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
        console.log("[useAudienceStats] API 호출 시작 - roomId:", roomId, "currentSlide:", currentSlide);
        
        const stats = await fetchAudienceSlideStats({
          roomId,
          page: currentSlide,
          signal: controller.signal,
        });
        
        console.log("[useAudienceStats] API 호출 응답 - 원본 stats:", stats);
        
        const newStats = {
          prev: Number.isFinite(stats?.prev) ? stats.prev : 0,
          current: Number.isFinite(stats?.current) ? stats.current : 0,
          next: Number.isFinite(stats?.next) ? stats.next : 0,
        };
        
        console.log("[useAudienceStats] API 호출 응답 - 최종 stats:", newStats);
        
        setAudienceStats((prevStats) => {
          const updatedStats = {
            prev: Number.isFinite(stats?.prev) ? stats.prev : prevStats.prev,
            current: Number.isFinite(stats?.current)
              ? stats.current
              : prevStats.current,
            next: Number.isFinite(stats?.next) ? stats.next : prevStats.next,
          };
          console.log("[useAudienceStats] API 호출 - 상태 업데이트:", updatedStats);
          return updatedStats;
        });
      } catch (error) {
        if (
          error?.name === "CanceledError" ||
          error?.name === "AbortError" ||
          error?.code === "ERR_CANCELED"
        ) {
          console.log("[useAudienceStats] API 호출 취소됨");
          return;
        }
        console.error("[useAudienceStats] API 호출 에러:", error);
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
        console.log("=".repeat(50));
        console.log("[useAudienceStats] WebSocket 브로드캐스트 수신");
        console.log("토픽:", audienceStatsTopic);
        console.log("원본 데이터 타입:", typeof data);
        console.log("원본 데이터:", data);
        console.log("원본 데이터 (JSON):", JSON.stringify(data, null, 2));
        
        // 백엔드에서 SlideAudienceCountResponse 객체를 직접 전송
        // 필드명: frontCount, currentCount, backCount (Long 타입, 퍼센트 값 0-100)
        const payload = data?.data ?? data;
        console.log("파싱된 payload:", payload);
        console.log("payload 타입:", typeof payload);
        console.log("payload 키:", payload ? Object.keys(payload) : "null");
        
        const normalize = (value) => {
          const numeric = Number(value);
          return Number.isFinite(numeric) ? numeric : 0;
        };

        // 백엔드 필드명: frontCount, currentCount, backCount
        const frontCount = normalize(payload?.frontCount ?? 0);
        const currentCount = normalize(payload?.currentCount ?? 0);
        const backCount = normalize(payload?.backCount ?? 0);
        
        console.log("파싱된 값 - frontCount:", frontCount, "currentCount:", currentCount, "backCount:", backCount);

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

