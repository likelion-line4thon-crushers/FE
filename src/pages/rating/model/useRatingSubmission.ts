import { useCallback, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitFeedback } from "@/shared/api/feedback";
import { submitFeedbackAnswers } from "@/shared/api/feedback-answers";
import { pdfDownloadKeys } from "@/shared/api/pdf-download";
import { markFeedbackSubmitted } from "./feedbackSubmissionMarker";

export type SubmitPayload = {
  rating: number;
  hasCustomQuestions: boolean;
  answers: { questionId: number; answerText: string }[];
  comment: string;
};

type SubmitContext = {
  payload: SubmitPayload;
  roomId: string;
  audienceId: string;
  audienceToken: string;
};

export function useRatingSubmission(
  roomId: string | null,
  audienceId: string | null,
  audienceToken: string | null
) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  // A retry after an answers failure must not re-submit the rating.
  const feedbackSubmitted = useRef(false);

  const { mutateAsync, isPending: submitting } = useMutation({
    mutationFn: async ({ payload, roomId, audienceId, audienceToken }: SubmitContext) => {
      if (!feedbackSubmitted.current) {
        await submitFeedback({
          roomId,
          audienceId,
          audienceToken,
          rating: payload.rating,
          comment: payload.hasCustomQuestions ? "" : payload.comment,
        });
        feedbackSubmitted.current = true;
      }
      if (payload.hasCustomQuestions) {
        await submitFeedbackAnswers(roomId, audienceId, audienceToken, payload.answers);
      }
      // Remember this identity submitted, so a later revisit can warn that
      // re-submitting will overwrite the existing feedback.
      markFeedbackSubmitted(roomId, audienceId);
    },
    onSuccess: (_data, { roomId, audienceId }) => {
      queryClient.invalidateQueries({
        queryKey: pdfDownloadKeys.availability(roomId, audienceId),
      });
    },
  });

  const submit = useCallback(
    async (payload: SubmitPayload): Promise<boolean> => {
      if (!roomId || !audienceId || !audienceToken) {
        setError("세션 정보를 찾을 수 없습니다.");
        return false;
      }
      setError(null);
      try {
        await mutateAsync({ payload, roomId, audienceId, audienceToken });
        return true;
      } catch {
        setError("제출에 실패했어요. 다시 시도해주세요.");
        return false;
      }
    },
    [roomId, audienceId, audienceToken, mutateAsync]
  );

  return { submit, submitting, error };
}
