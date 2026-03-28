import { useEffect } from "react";
import { useAtom } from "jotai";
import { sessionStatusAtom } from "../../../store";

const useAudienceInitialState = ({ code, roomId }: { code?: any; roomId?: any }) => {
  const [sessionStatus, setSessionStatus] = useAtom(sessionStatusAtom);

  // Initialize from sessionStorage on mount
  useEffect(() => {
    if (!code) return;
    try {
      const storageKey = `boini_audience_${code}`;
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const storedData = JSON.parse(stored);
        if (storedData.audienceId && storedData.audienceToken && storedData.sessionStatus) {
          setSessionStatus(storedData.sessionStatus);
        }
      }
    } catch (_error) {
      // ignore
    }
  }, [code, setSessionStatus]);

  // Persist sessionStatus changes to sessionStorage
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
    } catch (_error) {
      // ignore
    }
  }, [sessionStatus, code, roomId]);

  return { sessionStatus, setSessionStatus };
};

export default useAudienceInitialState;
