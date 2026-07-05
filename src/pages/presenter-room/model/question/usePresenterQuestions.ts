import { useState, useEffect, useRef, useCallback } from "react";
import websocketService from "@/shared/api/websocket";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("presenter-questions");
import {
  fetchRoomQuestions,
  completeQuestion as apiComplete,
  deleteQuestion as apiDelete,
} from "@/shared/api/question";
import {
  normalizeQuestion,
  sortQuestionsAsc,
  upsertQuestion,
  buildQuestionTopics,
  applyQuestionStatusEvent,
  applyQuestionLikeEvent,
} from "@/entities/question";
import type { NormalizedQuestion } from "@/entities/question";

const isNormalizedQuestion = (
  question: NormalizedQuestion | null
): question is NormalizedQuestion => question !== null;

const resetState = (
  setters: {
    setQuestions: React.Dispatch<React.SetStateAction<NormalizedQuestion[]>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setError: React.Dispatch<React.SetStateAction<unknown>>;
  },
  latestTsRef: React.MutableRefObject<number>
) => {
  const { setQuestions, setLoading, setError } = setters;
  setQuestions([]);
  setLoading(false);
  setError(null);
  latestTsRef.current = 0;
};

const usePresenterQuestions = ({
  roomId,
  enabled = true,
  subscribe = true,
}: {
  roomId?: string;
  enabled?: boolean;
  subscribe?: boolean;
}) => {
  const [questions, setQuestions] = useState<NormalizedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const latestQuestionTsRef = useRef(0);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const loadQuestions = useCallback(async () => {
    if (!roomId || !enabled) {
      resetState({ setQuestions, setLoading, setError }, latestQuestionTsRef);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const list = await fetchRoomQuestions(roomId);
      const normalized = list.map(normalizeQuestion).filter(isNormalizedQuestion);
      setQuestions(sortQuestionsAsc(normalized));

      if (normalized.length > 0) {
        const latest = normalized.reduce((max, item) => Math.max(max, item.ts ?? 0), 0);
        latestQuestionTsRef.current = latest;
      } else {
        latestQuestionTsRef.current = 0;
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [roomId, enabled]);

  const handleIncomingQuestion = useCallback((payload: any) => {
    const payloadType = payload?.type ?? payload?.data?.type;

    // Status events (QUESTION_COMPLETED / QUESTION_DELETED) arrive on the same channel
    if (payloadType === "QUESTION_COMPLETED" || payloadType === "QUESTION_DELETED") {
      setQuestions((prev) => applyQuestionStatusEvent(prev, payload));
      return;
    }

    if (
      payloadType === "QUESTION_LIKE_UPDATED" ||
      payloadType === "QUESTION_LIKED" ||
      payloadType === "QUESTION_UNLIKED"
    ) {
      setQuestions((prev) => applyQuestionLikeEvent(prev, payload));
      return;
    }

    const raw = payload?.data ?? payload;
    const normalized = normalizeQuestion(raw);
    if (!normalized) return;

    latestQuestionTsRef.current = Math.max(latestQuestionTsRef.current || 0, normalized.ts ?? 0);
    setQuestions((prev) => upsertQuestion(prev, normalized));
  }, []);

  const completeQuestion = useCallback(
    async (questionId: string) => {
      if (!roomId) return;
      setQuestions((prev) =>
        applyQuestionStatusEvent(prev, { type: "QUESTION_COMPLETED", questionId })
      );
      try {
        await apiComplete(roomId, questionId);
      } catch {
        // optimistic remove — no rollback
      }
    },
    [roomId]
  );

  const deleteQuestion = useCallback(
    async (questionId: string) => {
      if (!roomId) return;
      setQuestions((prev) =>
        applyQuestionStatusEvent(prev, { type: "QUESTION_DELETED", questionId })
      );
      try {
        await apiDelete(roomId, questionId);
      } catch {
        // optimistic remove — no rollback
      }
    },
    [roomId]
  );

  useEffect(() => {
    if (!roomId || !enabled) {
      resetState({ setQuestions, setLoading, setError }, latestQuestionTsRef);
      return;
    }

    loadQuestions();
  }, [enabled, roomId, loadQuestions]);

  useEffect(() => {
    if (!roomId || !enabled || !subscribe) {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      return undefined;
    }

    const topics = [`/topic/presentation/${roomId}/question`, ...buildQuestionTopics(roomId)];

    const unsubscribes = topics
      .map((topic) => websocketService.subscribe(topic, handleIncomingQuestion))
      .filter((fn) => typeof fn === "function");

    unsubscribeRef.current = () => {
      unsubscribes.forEach((fn) => {
        try {
          fn();
        } catch (err) {
          log.warn("unsubscribe 실패:", err);
        }
      });
    };

    return () => {
      if (typeof unsubscribeRef.current === "function") {
        unsubscribeRef.current();
      }
      unsubscribeRef.current = null;
    };
  }, [enabled, roomId, subscribe, handleIncomingQuestion]);

  return {
    questions,
    questionsLoading: loading,
    questionsError: error,
    reloadQuestions: loadQuestions,
    completeQuestion,
    deleteQuestion,
  };
};

export default usePresenterQuestions;
