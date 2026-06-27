import { useState, useEffect, useCallback } from "react";
import { fetchCompletedQuestions } from "@/shared/api/question";
import { normalizeQuestion, sortQuestionsAsc } from "@/entities/question";
import type { NormalizedQuestion } from "@/entities/question";

const isNormalizedQuestion = (q: NormalizedQuestion | null): q is NormalizedQuestion => q !== null;

const usePresenterCompletedQuestions = ({
  roomId,
  enabled,
}: {
  roomId?: string;
  enabled: boolean;
}) => {
  const [completedQuestions, setCompletedQuestions] = useState<NormalizedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!roomId || !enabled) {
      setCompletedQuestions([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchCompletedQuestions(roomId)
      .then((list) => {
        if (cancelled) return;
        const normalized = list.map(normalizeQuestion).filter(isNormalizedQuestion);
        setCompletedQuestions(sortQuestionsAsc(normalized));
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [roomId, enabled, refreshKey]);

  const reloadCompleted = useCallback(() => setRefreshKey((k) => k + 1), []);

  return { completedQuestions, loading, error, reloadCompleted };
};

export default usePresenterCompletedQuestions;
