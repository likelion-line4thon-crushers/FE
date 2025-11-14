import { useState, useEffect } from "react";

const useAudienceInitialState = ({ code, roomId }) => {
  const getInitialSessionStatus = () => {
    if (!code) return "waiting";
    try {
      const storageKey = `boini_audience_${code}`;
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const storedData = JSON.parse(stored);
        if (
          storedData.audienceId &&
          storedData.audienceToken &&
          storedData.sessionStatus
        ) {
          return storedData.sessionStatus;
        }
      }
    } catch (_error) {
      // 세션 스토리지 읽기 실패 시 기본값 사용
    }
    return "waiting";
  };

  const [sessionStatus, setSessionStatus] = useState(getInitialSessionStatus);

  useEffect(() => {
    if (!code || !roomId) return;

    try {
      const storageKey = `boini_audience_${code}`;
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const storedData = JSON.parse(stored);

        storedData.sessionStatus = sessionStatus;
        sessionStorage.setItem(storageKey, JSON.stringify(storedData));
      }
    } catch (_error) {}
  }, [sessionStatus, code, roomId]);

  return {
    sessionStatus,
    setSessionStatus,
  };
};

export default useAudienceInitialState;
