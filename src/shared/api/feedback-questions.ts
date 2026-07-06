import api from "./api";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("feedback-questions");

export type FeedbackQuestion = {
  id?: number;
  orderIndex: number;
  questionText: string;
};

export async function getFeedbackQuestions(roomId: string): Promise<FeedbackQuestion[]> {
  if (!roomId) throw new Error("roomId is required");
  try {
    const response = await api.get(`/api/rooms/${roomId}/feedback-questions`);
    return response?.data?.data?.questions ?? [];
  } catch (error) {
    log.error("Failed to load feedback questions", error);
    throw error;
  }
}

export async function saveFeedbackQuestions(
  roomId: string,
  questions: FeedbackQuestion[]
): Promise<FeedbackQuestion[]> {
  if (!roomId) throw new Error("roomId is required");
  try {
    const response = await api.put(`/api/rooms/${roomId}/feedback-questions`, {
      questions: questions.map((q) => ({ orderIndex: q.orderIndex, questionText: q.questionText })),
    });
    return response?.data?.data?.questions ?? [];
  } catch (error) {
    log.error("Failed to save feedback questions", error);
    throw error;
  }
}
