import { useQuery } from "@tanstack/react-query";
import { feedbackQuestionsQuery, type FeedbackQuestion } from "@/shared/api/feedback-questions";

const selectHasQuestions = (questions: FeedbackQuestion[]): boolean => questions.length > 0;

/**
 * * 발표 준비 중인 방의 후기 질문 존재 여부를 미리 조회한다.
 * 세션 시작 시 질문이 하나도 없으면 경고 모달을 띄우기 위한 가드.
 * hasQuestions: null = 확인 전 또는 조회 실패(세션 시작을 막지 않도록 fail-open),
 * true·false = 확정된 결과.
 * 질문 저장(useFeedbackQuestions.save)이 캐시를 무효화하므로 별도 refresh 는 필요 없다.
 */
export const useFeedbackQuestionGuard = (roomId: string | undefined, enabled: boolean) => {
  const { data, isSuccess } = useQuery({
    ...feedbackQuestionsQuery(roomId ?? ""),
    enabled: enabled && !!roomId,
    select: selectHasQuestions,
  });

  const hasQuestions: boolean | null = isSuccess ? (data ?? null) : null;

  return { hasQuestions };
};
