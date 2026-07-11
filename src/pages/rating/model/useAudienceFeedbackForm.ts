import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { feedbackQuestionsQuery, type FeedbackQuestion } from "@/shared/api/feedback-questions";

const selectValidSorted = (questions: FeedbackQuestion[]): FeedbackQuestion[] =>
  questions.filter((q) => typeof q.id === "number").sort((a, b) => a.orderIndex - b.orderIndex);

export function useAudienceFeedbackForm(roomId: string | null) {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const { data, isLoading, isError } = useQuery({
    ...feedbackQuestionsQuery(roomId ?? ""),
    enabled: !!roomId,
    select: selectValidSorted,
    // 세션 종료 직후 청중 전원이 동시에 진입하는 경로 — 재시도로 요청을 배가시키지 않는다.
    retry: false,
  });

  const questions = useMemo(() => data ?? [], [data]);
  const error = isError ? "질문을 불러오지 못했어요." : null;

  const setAnswer = useCallback((questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const hasCustomQuestions = questions.length > 0;

  const allAnswered = useMemo(
    () =>
      hasCustomQuestions &&
      questions.every((q) => (answers[q.id as number] ?? "").trim().length > 0),
    [hasCustomQuestions, questions, answers]
  );

  const buildAnswerList = useCallback(
    () =>
      questions.map((q) => ({
        questionId: q.id as number,
        answerText: (answers[q.id as number] ?? "").trim(),
      })),
    [questions, answers]
  );

  return {
    questions,
    loading: isLoading,
    error,
    answers,
    setAnswer,
    hasCustomQuestions,
    allAnswered,
    buildAnswerList,
  };
}
