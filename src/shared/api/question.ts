import { queryOptions } from "@tanstack/react-query";
import api from "./api";
import type { QuestionCluster } from "@/entities/question";
import websocketService from "./websocket";
import { v4 as uuidv4 } from "uuid";

// * 청중 질문 관리 API 응답 단건 (Spring 백엔드 CreateQuestionResponse)
export interface QuestionItemResponse {
  id: string;
  roomId: string;
  slide: number;
  audienceId: string;
  content: string;
  ts: number;
}

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

// * 답변 완료 처리된 질문 목록 (ts 오름차순)
export async function fetchCompletedQuestions(roomId: string): Promise<QuestionItemResponse[]> {
  if (!roomId) throw new Error("roomId is required");
  const response = await api.get(`/api/questions/rooms/${roomId}/completed`);
  return Array.isArray(response?.data?.data) ? response.data.data : [];
}

// * 미답변(활성) 질문 목록 - 백엔드 목록 조회는 completed/deleted를 제외하므로 미답변과 동일
export async function fetchUnansweredQuestions(roomId: string): Promise<QuestionItemResponse[]> {
  if (!roomId) throw new Error("roomId is required");
  const response = await api.get(`/api/questions/rooms/${roomId}`);
  return response?.data?.data ?? [];
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

// 프레젠터 룸과 AI 리포트 페이지가 같은 캐시 엔트리를 공유하도록 키를 통일한다.
export const questionKeys = {
  completed: (roomId: string) => ["questions", roomId, "completed"] as const,
  unanswered: (roomId: string) => ["questions", roomId, "unanswered"] as const,
};

export function completedQuestionsQuery(roomId: string) {
  return queryOptions({
    queryKey: questionKeys.completed(roomId),
    queryFn: () => fetchCompletedQuestions(roomId),
  });
}

export function unansweredQuestionsQuery(roomId: string) {
  return queryOptions({
    queryKey: questionKeys.unanswered(roomId),
    queryFn: () => fetchUnansweredQuestions(roomId),
  });
}
