import { useState, useEffect, useMemo } from "react";
import { storageKeys } from "@/shared/config/storage-keys";

interface UseTimerParams {
  roomId?: string | null;
}

export const useTimer = ({ roomId = null }: UseTimerParams = {}) => {
  const getInitialElapsedSeconds = useMemo(() => {
    if (!roomId) return 0;
    try {
      const stored = sessionStorage.getItem(storageKeys.timerElapsed(roomId));
      if (stored !== null) {
        const parsed = Number(stored);
        if (Number.isFinite(parsed) && parsed >= 0) return parsed;
      }
    } catch {
      // ignore storage read errors
    }
    return 0;
  }, [roomId]);

  const [elapsedSeconds, setElapsedSeconds] = useState(getInitialElapsedSeconds);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (roomId) {
          try {
            sessionStorage.setItem(storageKeys.timerElapsed(roomId), String(next));
          } catch {
            // ignore storage write errors
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [roomId]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return {
    elapsedSeconds,
    timer: formatTimer(elapsedSeconds),
  };
};
