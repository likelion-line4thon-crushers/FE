import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { usePostHog } from "@posthog/react";
import { ANALYTICS_EVENTS } from "@/shared/config/analytics-events";
import websocketService from "@/shared/api/websocket";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("audience-questions");
import { fetchRoomQuestions, sendQuestionLike } from "@/shared/api/question";
import {
  normalizeQuestion,
  sortQuestionsAsc,
  upsertQuestion,
  buildQuestionTopics,
  applyQuestionStatusEvent,
  applyQuestionLikeEvent,
  getQuestionLikeCount,
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

const accumulateLatestTimestamp = (
  latestTsRef: React.MutableRefObject<number>,
  question: NormalizedQuestion | null
) => {
  if (!question || question.ts === undefined || question.ts === null) return;
  const tsValue = Number(question.ts);
  if (!Number.isFinite(tsValue)) return;
  latestTsRef.current = Math.max(latestTsRef.current || 0, tsValue);
};

const createQuestionPayload = (audienceId: string, currentSlide: number, content: string) => ({
  audienceId,
  slide: currentSlide + 1,
  content,
  ts: Date.now(),
});

export const useAudienceQuestions = ({
  roomId,
  audienceId,
  currentSlide,
}: {
  roomId?: string | null;
  audienceId?: string | null;
  currentSlide?: number;
}) => {
  const posthog = usePostHog();
  const [questions, setQuestions] = useState<NormalizedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const latestQuestionTsRef = useRef(0);
  const questionsRef = useRef<NormalizedQuestion[]>([]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  const loadQuestions = useCallback(async () => {
    if (!roomId) {
      resetState({ setQuestions, setLoading, setError }, latestQuestionTsRef);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const list = await fetchRoomQuestions(roomId, { audienceId });
      const normalized = list.map(normalizeQuestion).filter(isNormalizedQuestion);
      setQuestions(sortQuestionsAsc(normalized));

      if (normalized.length > 0) {
        const latest = normalized.reduce((max, item) => Math.max(max, item.ts ?? 0), 0);
        latestQuestionTsRef.current = latest;
      } else {
        latestQuestionTsRef.current = 0;
      }
    } catch (err) {
      setError(err as any);
    } finally {
      setLoading(false);
    }
  }, [roomId, audienceId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleIncomingQuestion = useCallback(
    (payload: any) => {
      const payloadType = payload?.type ?? payload?.data?.type;

      if (payloadType === "QUESTION_COMPLETED" || payloadType === "QUESTION_DELETED") {
        setQuestions((prev) => applyQuestionStatusEvent(prev, payload));
        return;
      }

      if (
        payloadType === "QUESTION_LIKE_UPDATED" ||
        payloadType === "QUESTION_LIKED" ||
        payloadType === "QUESTION_UNLIKED"
      ) {
        const raw = payload?.data ?? payload;
        const isOwnLikeEvent = raw?.audienceId && raw.audienceId === audienceId;
        const likePayload = isOwnLikeEvent
          ? { ...raw, likedByMe: raw.liked }
          : {
              ...raw,
              liked: undefined,
              likedByMe: undefined,
            };
        setQuestions((prev) => applyQuestionLikeEvent(prev, likePayload));
        return;
      }

      const raw = payload?.data ?? payload;
      const normalized = normalizeQuestion(raw);
      if (!normalized) return;

      accumulateLatestTimestamp(latestQuestionTsRef, normalized);

      setQuestions((prev) => upsertQuestion(prev, normalized));
    },
    [audienceId]
  );

  const toggleQuestionLike = useCallback(
    (questionId: string) => {
      if (!roomId || !audienceId || !questionId) return;
      if (!websocketService.getIsConnected()) return;

      const currentQuestion = questionsRef.current.find((question) => question.id === questionId);
      if (!currentQuestion) return;

      const nextLiked = !Boolean(currentQuestion.likedByMe);
      setQuestions((prev) =>
        prev.map((question) =>
          question.id === questionId
            ? {
                ...question,
                likedByMe: nextLiked,
                likeCount: Math.max(0, getQuestionLikeCount(question) + (nextLiked ? 1 : -1)),
              }
            : question
        )
      );

      posthog?.capture(ANALYTICS_EVENTS.QUESTION_LIKED, {
        room_id: roomId,
        question_id: questionId,
        liked: nextLiked,
      });

      try {
        sendQuestionLike({ roomId, questionId, audienceId, liked: nextLiked });
      } catch (err) {
        log.error("질문 좋아요 전송 실패:", err);
      }
    },
    [roomId, audienceId, posthog]
  );

  const submitQuestion = useCallback(
    async (content: string) => {
      const trimmed = (content ?? "").trim();
      if (!trimmed) {
        throw new Error("질문 내용을 입력해 주세요.");
      }

      if (!roomId || !audienceId) {
        throw new Error("방 정보를 찾을 수 없습니다.");
      }

      if (!websocketService.getIsConnected()) {
        throw new Error("연결 상태를 확인한 후 다시 시도해 주세요.");
      }

      const destination = `/app/p/${roomId}/question.create`;
      const payload = createQuestionPayload(audienceId as string, currentSlide ?? 0, trimmed);

      try {
        websocketService.send(destination, payload);
        posthog?.capture(ANALYTICS_EVENTS.QUESTION_SUBMITTED, {
          room_id: roomId,
          slide_index: currentSlide,
        });
      } catch (err) {
        log.error("질문 전송 실패:", err);
        throw new Error("질문 전송 중 오류가 발생했습니다.");
      }
    },
    [roomId, audienceId, currentSlide, posthog]
  );

  const questionTopics = useMemo(() => buildQuestionTopics(roomId ?? ""), [roomId]);

  return {
    questions,
    questionsLoading: loading,
    questionsError: error,
    submitQuestion,
    toggleQuestionLike,
    handleIncomingQuestion,
    questionTopics,
  };
};

export default useAudienceQuestions;
