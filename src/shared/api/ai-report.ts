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
