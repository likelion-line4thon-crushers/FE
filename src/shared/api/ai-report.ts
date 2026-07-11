import { queryOptions } from "@tanstack/react-query";
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
  answerCount: number;
  // null until AI summarization is enabled (all questions have >5 answers)
  summary: string | null;
};

export type AudienceVoiceReport = {
  averageRating: number;
  hasQuestions: boolean;
  summarizationEnabled: boolean;
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

export async function downloadAudienceVoiceCsv(
  roomId: string,
  sessionName?: string
): Promise<void> {
  if (!roomId) throw new Error("roomId is required");
  const response = await api.get(`/api/report/${roomId}/audience-voice/csv`, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  // 세션 이름으로 파일명을 시작한다. (확장자 제거 + 파일명 불가 문자 치환)
  const base =
    (sessionName ?? "")
      .replace(/\.[^.]+$/, "")
      .replace(/[\\/:*?"<>|]/g, "_")
      .trim() || "청중의목소리";
  anchor.download = `${base}_청중의목소리.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => window.URL.revokeObjectURL(url), 0);
}

export const aiReportKeys = {
  stored: (roomId: string) => ["ai-report", roomId, "stored"] as const,
  mostRevisit: (roomId: string) => ["ai-report", roomId, "most-revisit"] as const,
  topSlide: (roomId: string, latestFirst?: boolean) =>
    ["ai-report", roomId, "top-slide", latestFirst ?? null] as const,
  topQuestions: (roomId: string) => ["ai-report", roomId, "top-questions"] as const,
  reactionSticker: (roomId: string) => ["ai-report", roomId, "reaction-sticker"] as const,
  feedback: (roomId: string) => ["ai-report", roomId, "feedback"] as const,
  audienceVoice: (roomId: string) => ["ai-report", roomId, "audience-voice"] as const,
};

export function storedAiReportQuery(roomId: string) {
  return queryOptions({
    queryKey: aiReportKeys.stored(roomId),
    queryFn: () => fetchStoredAiReport(roomId),
  });
}

export function mostRevisitSlideQuery(roomId: string) {
  return queryOptions({
    queryKey: aiReportKeys.mostRevisit(roomId),
    queryFn: () => fetchMostRevisitSlide(roomId),
  });
}

export function topSlideReportQuery(roomId: string, latestFirst?: boolean) {
  return queryOptions({
    queryKey: aiReportKeys.topSlide(roomId, latestFirst),
    queryFn: () => fetchTopSlideReport(roomId, { latestFirst }),
  });
}

export function topQuestionsReportQuery(roomId: string) {
  return queryOptions({
    queryKey: aiReportKeys.topQuestions(roomId),
    queryFn: () => fetchTopQuestionsReport(roomId),
  });
}

export function mostReactionStickerQuery(roomId: string) {
  return queryOptions({
    queryKey: aiReportKeys.reactionSticker(roomId),
    queryFn: () => fetchMostReactionSticker(roomId),
  });
}

export function feedbackReportQuery(roomId: string) {
  return queryOptions({
    queryKey: aiReportKeys.feedback(roomId),
    queryFn: () => fetchFeedbackReport(roomId),
  });
}

export function audienceVoiceReportQuery(roomId: string) {
  return queryOptions({
    queryKey: aiReportKeys.audienceVoice(roomId),
    queryFn: () => fetchAudienceVoiceReport(roomId),
  });
}
