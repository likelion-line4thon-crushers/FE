import { useCallback, useRef, useState } from "react";
import { submitFeedback } from "@/shared/api/feedback";
import { submitFeedbackAnswers } from "@/shared/api/feedback-answers";

export type SubmitPayload = {
  rating: number;
  hasCustomQuestions: boolean;
  answers: { questionId: number; answerText: string }[];
  comment: string;
};

export function useRatingSubmission(roomId: string | null, audienceId: string | null) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const feedbackSubmitted = useRef(false);

  const submit = useCallback(
    async (payload: SubmitPayload): Promise<boolean> => {
      if (!roomId || !audienceId) {
        setError("세션 정보를 찾을 수 없습니다.");
        return false;
      }
      setSubmitting(true);
      setError(null);
      try {
        if (!feedbackSubmitted.current) {
          await submitFeedback({
            roomId,
            audienceId,
            rating: payload.rating,
            comment: payload.hasCustomQuestions ? "" : payload.comment,
          });
          feedbackSubmitted.current = true;
        }
        if (payload.hasCustomQuestions) {
          await submitFeedbackAnswers(roomId, audienceId, payload.answers);
        }
        return true;
      } catch {
        setError("제출에 실패했어요. 다시 시도해주세요.");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [roomId, audienceId]
  );

  return { submit, submitting, error };
}
