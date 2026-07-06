import aiApi from "./ai-api";
import api from "./api";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("ai-report");

export async function fetchTopSlideReport(roomId: string, options: { latestFirst?: boolean } = {}) {
  if (!roomId) throw new Error("roomId is required");
  const params: Record<string, any> = {};
  if (options.latestFirst != null) params.latest_first = options.latestFirst;

  const response = await aiApi.get(`/report/${roomId}/top-slide`, { params });
  return response?.data?.data ?? null;
}

export async function fetchTopQuestionsReport(roomId: string) {
  if (!roomId) throw new Error("roomId is required");
  const response = await aiApi.get(`/report/questions/rooms/${roomId}/top3`);
  return response?.data?.data ?? null;
}

// * 청중 질문 관리 API 응답 단건 (Spring 백엔드 CreateQuestionResponse)
export interface QuestionItemResponse {
  id: string;
  roomId: string;
  slide: number;
  audienceId: string;
  content: string;
  ts: number;
}

// * 답변 완료 처리된 질문 목록 (ts 오름차순)
export async function fetchCompletedQuestions(roomId: string): Promise<QuestionItemResponse[]> {
  if (!roomId) throw new Error("roomId is required");
  const response = await api.get(`/api/questions/rooms/${roomId}/completed`);
  return response?.data?.data ?? [];
}

// * 미답변(활성) 질문 목록 - 백엔드 목록 조회는 completed/deleted를 제외하므로 미답변과 동일
export async function fetchUnansweredQuestions(roomId: string): Promise<QuestionItemResponse[]> {
  if (!roomId) throw new Error("roomId is required");
  const response = await api.get(`/api/questions/rooms/${roomId}`);
  return response?.data?.data ?? [];
}

export async function fetchMostRevisitSlide(roomId: string) {
  if (!roomId) throw new Error("roomId is required");
  const response = await api.get(`/api/aiReport/${roomId}/mostRevisit`);
  return response?.data?.data ?? null;
}

export async function fetchStoredAiReport(roomId: string) {
  if (!roomId) throw new Error("roomId is required");
  const response = await api.get(`/api/aiReport/${roomId}`);
  return response?.data?.data ?? null;
}

export async function fetchTopStoredReport(roomId: string) {
  if (!roomId) throw new Error("roomId is required");
  const response = await api.get(`/api/aiReport/${roomId}/getReport/top`);
  return response?.data?.data ?? null;
}

export async function fetchMostReactionSticker(roomId: string): Promise<any[]> {
  if (!roomId) throw new Error("roomId is required");
  try {
    const response = await api.get(`/api/aiReport/${roomId}/mostReactionSticker`);
    return response?.data?.data ?? [];
  } catch (error: any) {
    if (error?.response?.status === 400) {
      log.warn("No emoji reaction data available");
      return [];
    }
    throw error;
  }
}

export async function fetchFeedbackReport(roomId: string) {
  if (!roomId) throw new Error("roomId is required");
  try {
    const response = await api.get(`/api/report/${roomId}/feedbacks`);
    return response?.data?.data ?? null;
  } catch (error: any) {
    if (error?.response?.status === 400) {
      log.warn("No feedback data available");
      return null;
    }
    throw error;
  }
}

export type AudienceVoiceQuestion = {
  questionId: number;
  orderIndex: number;
  questionText: string;
  answers: string[];
  summary: string;
};

export type AudienceVoiceReport = {
  averageRating: number;
  hasQuestions: boolean;
  questions: AudienceVoiceQuestion[];
};

export async function fetchAudienceVoiceReport(
  roomId: string
): Promise<AudienceVoiceReport | null> {
  if (!roomId) throw new Error("roomId is required");
  try {
    const response = await api.get(`/api/report/${roomId}/audience-voice`);
    return response?.data?.data ?? null;
  } catch (error: any) {
    if (error?.response?.status === 400) {
      log.warn("No audience-voice data available");
      return null;
    }
    log.error("Failed to fetch audience-voice report", error);
    throw error;
  }
}

export async function downloadAudienceVoiceCsv(roomId: string): Promise<void> {
  if (!roomId) throw new Error("roomId is required");
  const response = await api.get(`/api/report/${roomId}/audience-voice/csv`, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `audience-voice-${roomId}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}
