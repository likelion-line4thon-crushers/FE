import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import websocketService from "../../../services/websocketService";
import { createLogger } from "../../../utils/logger";

const log = createLogger("audience-questions");
import { fetchRoomQuestions } from "../../../services/questionService";
import {
  normalizeQuestion,
  sortQuestionsAsc,
  upsertQuestion,
  buildQuestionTopics,
} from "../../../utils/question.helpers";
import type { NormalizedQuestion } from "../../../types";

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

const createQuestionPayload = (
  audienceId: string,
  currentSlide: number,
  content: string
) => ({
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
  const [questions, setQuestions] = useState<NormalizedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const latestQuestionTsRef = useRef(0);

  const loadQuestions = useCallback(async () => {
    if (!roomId) {
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
        const latest = normalized.reduce(
          (max, item) => Math.max(max, item.ts ?? 0),
          0
        );
        latestQuestionTsRef.current = latest;
      } else {
        latestQuestionTsRef.current = 0;
      }
    } catch (err) {
      setError(err as any);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleIncomingQuestion = useCallback((payload: any) => {
    const raw = payload?.data ?? payload;
    const normalized = normalizeQuestion(raw);
    if (!normalized) return;

    accumulateLatestTimestamp(latestQuestionTsRef, normalized);

    setQuestions((prev) => upsertQuestion(prev, normalized));
  }, []);

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
      } catch (err) {
        log.error("질문 전송 실패:", err);
        throw new Error("질문 전송 중 오류가 발생했습니다.");
      }
    },
    [roomId, audienceId, currentSlide]
  );

  const questionTopics = useMemo(() => buildQuestionTopics(roomId ?? ""), [roomId]);

  return {
    questions,
    questionsLoading: loading,
    questionsError: error,
    submitQuestion,
    handleIncomingQuestion,
    questionTopics,
  };
};

export default useAudienceQuestions;
