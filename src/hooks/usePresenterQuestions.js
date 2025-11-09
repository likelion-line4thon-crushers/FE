import { useState, useEffect, useRef, useCallback } from "react";
import websocketService from "../services/websocketService";
import { fetchRoomQuestions } from "../services/questionService";
import {
  normalizeQuestion,
  sortQuestionsAsc,
  upsertQuestion,
  buildQuestionTopics,
} from "../utils/questionHelpers";

const resetState = (setters, latestTsRef) => {
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
}) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const latestQuestionTsRef = useRef(0);
  const unsubscribeRef = useRef(null);

  const loadQuestions = useCallback(async () => {
    if (!roomId || !enabled) {
      resetState({ setQuestions, setLoading, setError }, latestQuestionTsRef);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const list = await fetchRoomQuestions(roomId);
      const normalized = list.map(normalizeQuestion).filter(Boolean);
      setQuestions(sortQuestionsAsc(normalized));

      if (normalized.length > 0) {
        const latest = normalized.reduce(
          (max, item) => Math.max(max, item.ts ?? 0),
          0
        );
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

  const handleIncomingQuestion = useCallback((payload) => {
    const raw = payload?.data ?? payload;
    const normalized = normalizeQuestion(raw);
    if (!normalized) return;

    latestQuestionTsRef.current = Math.max(
      latestQuestionTsRef.current || 0,
      normalized.ts ?? 0
    );

    setQuestions((prev) => upsertQuestion(prev, normalized));
  }, []);

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

    unsubscribeRef.current?.();
    const topics = [
      `/topic/presentation/${roomId}/question`,
      ...buildQuestionTopics(roomId),
    ];

    const unsubscribes = topics
      .map((topic) => websocketService.subscribe(topic, handleIncomingQuestion))
      .filter((fn) => typeof fn === "function");

    unsubscribeRef.current = () => {
      unsubscribes.forEach((fn) => {
        try {
          fn();
        } catch (err) {
          console.warn("[PresenterQuestions] unsubscribe 실패:", err);
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
  };
};

export default usePresenterQuestions;
