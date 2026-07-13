import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePostHog } from "@posthog/react";
import { ANALYTICS_EVENTS } from "@/shared/config/analytics-events";
import {
  feedbackQuestionsKeys,
  feedbackQuestionsQuery,
  saveFeedbackQuestions,
  type FeedbackQuestion,
} from "@/shared/api/feedback-questions";

const MIN_ROWS = 6;
const MAX_ROWS = 20;

const padRows = (values: string[]): string[] => {
  const next = [...values];
  while (next.length < MIN_ROWS) next.push("");
  return next;
};

const toRows = (questions: FeedbackQuestion[]): string[] => {
  const sorted = [...questions].sort((a, b) => a.orderIndex - b.orderIndex);
  return padRows(sorted.map((q) => q.questionText));
};

export function useFeedbackQuestions(roomId: string | undefined, isOpen: boolean) {
  const posthog = usePostHog();
  const queryClient = useQueryClient();
  // rows stays local + editable, seeded from the query result.
  const [rows, setRows] = useState<string[]>(padRows([]));
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    ...feedbackQuestionsQuery(roomId ?? ""),
    enabled: isOpen && !!roomId,
  });

  useEffect(() => {
    if (data === undefined) return;
    setRows(toRows(data));
    setError(null);
  }, [data]);

  useEffect(() => {
    if (!isError) return;
    setError("질문을 불러오지 못했어요. 새로 작성할 수 있습니다.");
    setRows(padRows([]));
  }, [isError]);

  const setRow = useCallback((index: number, value: string) => {
    setRows((prev) => prev.map((row, i) => (i === index ? value : row)));
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => (prev.length >= MAX_ROWS ? prev : [...prev, ""]));
  }, []);

  const { mutateAsync, isPending: saving } = useMutation({
    mutationFn: (questions: FeedbackQuestion[]) => saveFeedbackQuestions(roomId ?? "", questions),
    onSuccess: () => {
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: feedbackQuestionsKeys.all(roomId) });
      }
    },
  });

  const save = useCallback(async (): Promise<boolean> => {
    if (!roomId) return false;
    const questions: FeedbackQuestion[] = rows
      .map((text) => text.trim())
      .filter((text) => text.length > 0)
      .map((questionText, orderIndex) => ({ orderIndex, questionText }));
    setError(null);
    try {
      await mutateAsync(questions);
      posthog?.capture(ANALYTICS_EVENTS.FEEDBACK_QUESTIONS_SAVED, {
        room_id: roomId,
        question_count: questions.length,
      });
      return true;
    } catch {
      setError("저장에 실패했어요. 다시 시도해주세요.");
      return false;
    }
  }, [roomId, rows, mutateAsync, posthog]);

  return {
    rows,
    loading: isLoading,
    saving,
    error,
    canAddMore: rows.length < MAX_ROWS,
    setRow,
    addRow,
    save,
  };
}
