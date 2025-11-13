import { useState, useEffect } from "react";

/**
 * 타이머 관리 훅
 * - 페이지 마운트 시 자동 시작
 * - MM:SS 형식으로 포맷팅
 */
export const useTimer = () => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

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

