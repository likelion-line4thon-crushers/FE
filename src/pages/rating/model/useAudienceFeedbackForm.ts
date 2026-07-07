import { useCallback, useEffect, useMemo, useState } from "react";
import { getFeedbackQuestions, type FeedbackQuestion } from "@/shared/api/feedback-questions";

export function useAudienceFeedbackForm(roomId: string | null) {
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<boolean>(Boolean(roomId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getFeedbackQuestions(roomId)
      .then((loaded) => {
        if (cancelled) return;
        const valid = loaded.filter((q) => typeof q.id === "number");
        const sorted = [...valid].sort((a, b) => a.orderIndex - b.orderIndex);
        setQuestions(sorted);
      })
      .catch(() => {
        if (cancelled) return;
        setError("질문을 불러오지 못했어요.");
        setQuestions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roomId]);

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
    loading,
    error,
    answers,
    setAnswer,
    hasCustomQuestions,
    allAnswered,
    buildAnswerList,
  };
}
