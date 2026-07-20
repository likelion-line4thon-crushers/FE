import { useEffect } from "react";
import { useAtom } from "jotai";
import { sessionStatusAtom } from "@/entities/session";
import { readAudienceIdentity, writeAudienceIdentity } from "@/shared/lib/audience-identity";

const useAudienceInitialState = ({ code, roomId }: { code?: any; roomId?: any }) => {
  const [sessionStatus, setSessionStatus] = useAtom(sessionStatusAtom);

  // Initialize from storage on mount
  useEffect(() => {
    if (!code) return;
    const stored = readAudienceIdentity(code);
    if (stored?.sessionStatus) setSessionStatus(stored.sessionStatus);
  }, [code, setSessionStatus]);

  // * Persist sessionStatus changes to BOTH copies.
  // 세션 사본에만 쓰면 내구 사본의 상태가 입장 시점에 멈춰 있어, 랜딩에서 코드로 재입장할 때
  // 이미 끝난 세션을 "대기 중"으로 복원해 빈 대기 화면에 갇힌다.
  useEffect(() => {
    if (!code || !roomId) return;
    const stored = readAudienceIdentity(code);
    if (stored) writeAudienceIdentity(code, { ...stored, sessionStatus });
  }, [sessionStatus, code, roomId]);

  return { sessionStatus, setSessionStatus };
};

export default useAudienceInitialState;
