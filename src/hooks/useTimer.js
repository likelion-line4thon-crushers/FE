import { useState, useEffect, useMemo } from "react";

/**
 * 타이머 관리 훅
 * - 페이지 마운트 시 자동 시작
 * - MM:SS 형식으로 포맷팅
 * - 세션 스토리지에 진행 시간 저장 및 복원
 */
export const useTimer = ({ roomId = null } = {}) => {
  // 🔹 세션 스토리지에서 저장된 경과 시간 복원
  const getInitialElapsedSeconds = useMemo(() => {
    if (!roomId) return 0;
    try {
      const stored = sessionStorage.getItem(`boini_timer_elapsed_${roomId}`);
      if (stored !== null) {
        const parsed = Number(stored);
        if (Number.isFinite(parsed) && parsed >= 0) {
          return parsed;
        }
      }
    } catch (_error) {
      // ignore storage read errors
    }
    return 0;
  }, [roomId]);

  const [elapsedSeconds, setElapsedSeconds] = useState(getInitialElapsedSeconds);

  // 🔹 타이머 실행 및 세션 스토리지 저장
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        
        // 세션 스토리지에 경과 시간 저장
        if (roomId) {
          try {
            sessionStorage.setItem(`boini_timer_elapsed_${roomId}`, String(next));
          } catch (_error) {
            // ignore storage write errors
          }
        }
        
        return next;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [roomId]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return {
    elapsedSeconds,
    timer: formatTimer(elapsedSeconds),
  };
};

