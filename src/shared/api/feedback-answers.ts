import api from "./api";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("feedback-answers");

export type FeedbackAnswer = {
  id?: number;
  questionId: number;
  answerText: string;
};

export async function submitFeedbackAnswers(
  roomId: string,
  audienceId: string,
  audienceToken: string,
  answers: FeedbackAnswer[]
): Promise<FeedbackAnswer[]> {
  if (!roomId) throw new Error("roomId is required");
  if (!audienceId) throw new Error("audienceId is required");
  if (!audienceToken) throw new Error("audienceToken is required");
  try {
    const response = await api.post(
      `/api/rooms/${roomId}/feedback-answers`,
      {
        audienceId,
        answers: answers.map((a) => ({ questionId: a.questionId, answerText: a.answerText })),
      },
      { headers: { Authorization: `Bearer ${audienceToken}` } }
    );
    return response?.data?.data?.answers ?? [];
  } catch (error) {
    log.error("Failed to submit feedback answers", error);
    throw error;
  }
}
