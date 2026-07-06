import api from "./api";
import type { QuestionCluster } from "@/entities/question";
import websocketService from "./websocket";
import { v4 as uuidv4 } from "uuid";

interface FetchQuestionsOptions {
  fromTs?: number;
  slide?: number;
  audienceId?: string | null;
}

export async function fetchRoomQuestions(roomId: string, options: FetchQuestionsOptions = {}) {
  if (!roomId) throw new Error("roomId is required");

  const searchParams = new URLSearchParams();
  if (options.fromTs != null && !Number.isNaN(options.fromTs)) {
    searchParams.set("fromTs", String(options.fromTs));
  }
  if (options.slide != null && !Number.isNaN(options.slide)) {
    searchParams.set("slide", String(options.slide));
  }
  if (options.audienceId) {
    searchParams.set("audienceId", options.audienceId);
  }

  const query = searchParams.toString();
  const url = `/api/questions/rooms/${roomId}${query ? `?${query}` : ""}`;

  const response = await api.get(url);
  const data = response?.data?.data;
  return Array.isArray(data) ? data : [];
}

export async function completeQuestion(roomId: string, questionId: string): Promise<void> {
  await api.patch(`/api/questions/${roomId}/${questionId}/complete`);
}

export async function deleteQuestion(roomId: string, questionId: string): Promise<void> {
  await api.patch(`/api/questions/${roomId}/${questionId}/delete`);
}

export async function fetchCompletedQuestions(roomId: string) {
  if (!roomId) throw new Error("roomId is required");
  const response = await api.get(`/api/questions/rooms/${roomId}/completed`);
  return Array.isArray(response?.data?.data) ? response.data.data : [];
}

export async function fetchCurrentClusters(roomId: string): Promise<QuestionCluster[]> {
  if (!roomId) throw new Error("roomId is required");
  try {
    const response = await api.get(`/api/questions/rooms/${roomId}/clusters`);
    const clusters = response?.data?.data?.clusters;
    return Array.isArray(clusters) ? clusters : [];
  } catch {
    return [];
  }
}

export function sendQuestionLike({
  roomId,
  questionId,
  audienceId,
  liked,
}: {
  roomId: string;
  questionId: string;
  audienceId: string;
  liked: boolean;
}) {
  websocketService.send(
    `/app/p/${roomId}/question.like`,
    {
      questionId,
      audienceId,
      liked,
    },
    { "Idempotency-Key": uuidv4() }
  );
}
