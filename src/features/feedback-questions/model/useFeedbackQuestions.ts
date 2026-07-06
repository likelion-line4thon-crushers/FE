import { useCallback, useEffect, useState } from "react";
import {
  getFeedbackQuestions,
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

export function useFeedbackQuestions(roomId: string | undefined, isOpen: boolean) {
  const [rows, setRows] = useState<string[]>(padRows([]));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !roomId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getFeedbackQuestions(roomId)
      .then((questions: FeedbackQuestion[]) => {
        if (cancelled) return;
        const sorted = [...questions].sort((a, b) => a.orderIndex - b.orderIndex);
        setRows(padRows(sorted.map((q) => q.questionText)));
      })
      .catch(() => {
        if (cancelled) return;
        setError("질문을 불러오지 못했어요. 새로 작성할 수 있습니다.");
        setRows(padRows([]));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, roomId]);

  const setRow = useCallback((index: number, value: string) => {
    setRows((prev) => prev.map((row, i) => (i === index ? value : row)));
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => (prev.length >= MAX_ROWS ? prev : [...prev, ""]));
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    if (!roomId) return false;
    const questions: FeedbackQuestion[] = rows
      .map((text) => text.trim())
      .filter((text) => text.length > 0)
      .map((questionText, orderIndex) => ({ orderIndex, questionText }));
    setSaving(true);
    setError(null);
    try {
      await saveFeedbackQuestions(roomId, questions);
      return true;
    } catch {
      setError("저장에 실패했어요. 다시 시도해주세요.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [roomId, rows]);

  return {
    rows,
    loading,
    saving,
    error,
    canAddMore: rows.length < MAX_ROWS,
    setRow,
    addRow,
    save,
  };
}
