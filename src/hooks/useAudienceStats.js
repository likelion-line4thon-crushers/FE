import { useState, useEffect, useRef } from "react";
import { fetchAudienceSlideStats } from "../services/presentationService";

/**
 * 청중 통계 관리 훅
 * - 현재 슬라이드 기준 청중 분포 데이터 조회
 */
export const useAudienceStats = ({ roomId, currentSlide }) => {
  const [audienceStats, setAudienceStats] = useState({
    prev: 0,
    current: 0,
    next: 0,
  });
  const audienceStatsControllerRef = useRef(null);

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

  return { audienceStats };
};

