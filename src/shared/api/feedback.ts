import api from "./api";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("feedback");

interface SubmitFeedbackParams {
  roomId: string;
  audienceId: string;
  rating: number;
  comment?: string;
}

export async function submitFeedback({
  roomId,
  audienceId,
  rating,
  comment = "",
}: SubmitFeedbackParams) {
  if (!roomId) throw new Error("roomId is required");
  if (!audienceId) throw new Error("audienceId is required");
  if (!rating || rating < 1 || rating > 5) throw new Error("Valid rating (1-5) is required");

  try {
    const response = await api.post(`/api/feedbacks/rooms/${roomId}/feedbacks`, {
      audienceId,
      rating,
      comment: comment || "",
    });
    return response?.data?.data ?? response?.data ?? null;
  } catch (error) {
    log.error("Failed to submit feedback", error);
    throw error;
  }
}
