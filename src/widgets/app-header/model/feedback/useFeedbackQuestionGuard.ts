import { useCallback, useEffect, useState } from "react";
import { getFeedbackQuestions } from "@/shared/api/feedback-questions";

/**
 * * 발표 준비 중인 방의 후기 질문 존재 여부를 미리 조회한다.
 * 세션 시작 시 질문이 하나도 없으면 경고 모달을 띄우기 위한 가드.
 * hasQuestions: null = 확인 전 또는 조회 실패(세션 시작을 막지 않도록 fail-open),
 * true·false = 확정된 결과.
 */
export const useFeedbackQuestionGuard = (roomId: string | undefined, enabled: boolean) => {
  const [hasQuestions, setHasQuestions] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    if (!roomId) {
      setHasQuestions(null);
      return;
    }
    try {
      const questions = await getFeedbackQuestions(roomId);
      setHasQuestions(questions.length > 0);
    } catch {
      setHasQuestions(null);
    }
  }, [roomId]);

  useEffect(() => {
    if (!enabled || !roomId) {
      setHasQuestions(null);
      return;
    }
    refresh();
  }, [enabled, roomId, refresh]);

  return { hasQuestions, refresh };
};
