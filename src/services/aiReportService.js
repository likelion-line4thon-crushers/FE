import axios from "axios";
import api from "./api";

const resolveBaseUrl = () => {
  if (typeof window === "undefined") {
    return "http://localhost:8000";
  }

  // VITE_AI_API_BASE_URL이 명시적으로 설정된 경우
  if (import.meta?.env?.VITE_AI_API_BASE_URL) {
    return import.meta.env.VITE_AI_API_BASE_URL;
  }

  // VITE_API_BASE_URL이 있으면 /ai 경로를 추가
  const baseApiUrl = import.meta?.env?.VITE_API_BASE_URL;
  if (baseApiUrl) {
    // 이미 /ai로 끝나지 않으면 추가
    return baseApiUrl.endsWith("/ai") ? baseApiUrl : `${baseApiUrl}/ai`;
  }

  // localStorage에 저장된 값 확인
  try {
    const storedBase = window.localStorage?.getItem("ai_api_base_url");
    if (storedBase) {
      return storedBase;
    }
  } catch (err) {
    console.warn("[aiReportService] Failed to read stored base URL:", err);
  }

  // 기본값: localhost:8000 (개발 환경)
  return "http://localhost:8000";
};

const aiApi = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchTopSlideReport = async (roomId, options = {}) => {
  if (!roomId) {
    throw new Error("roomId가 필요합니다.");
  }

  const params = {};
  if (options.latestFirst != null) {
    params.latest_first = options.latestFirst;
  }

  const response = await aiApi.get(`/report/${roomId}/top-slide`, {
    params,
  });

  return response?.data?.data ?? null;
};

export const fetchTopQuestionsReport = async (roomId) => {
  if (!roomId) {
    throw new Error("roomId가 필요합니다.");
  }

  const response = await aiApi.get(`/report/questions/rooms/${roomId}/top3`);

  return response?.data?.data ?? null;
};

export const fetchMostRevisitSlide = async (roomId) => {
  if (!roomId) {
    throw new Error("roomId가 필요합니다.");
  }

  const response = await api.get(`/api/aiReport/${roomId}/mostRevisit`);

  return response?.data?.data ?? null;
};

export const fetchStoredAiReport = async (roomId) => {
  if (!roomId) {
    throw new Error("roomId가 필요합니다.");
  }

  const response = await api.get(`/api/aiReport/${roomId}`);

  return response?.data?.data ?? null;
};

export const fetchTopStoredReport = async (roomId) => {
  if (!roomId) {
    throw new Error("roomId가 필요합니다.");
  }

  const response = await api.get(`/api/aiReport/${roomId}/getReport/top`);

  return response?.data?.data ?? null;
};

export const fetchMostReactionSticker = async (roomId) => {
  if (!roomId) {
    throw new Error("roomId가 필요합니다.");
  }

  try {
    const response = await api.get(
      `/api/aiReport/${roomId}/mostReactionSticker`
    );
    return response?.data?.data ?? [];
  } catch (error) {
    console.error("fetchMostReactionSticker API 호출 실패:", error);
    console.error("에러 응답:", error?.response?.data);
    console.error("에러 상태 코드:", error?.response?.status);

    // 400 에러인 경우 빈 배열 반환
    if (error?.response?.status === 400) {
      console.warn(
        `⚠️ 400 Bad Request: 이모지 반응 데이터가 없을 수 있습니다.`
      );
      return [];
    }

    throw error;
  }
};

export const fetchFeedbackReport = async (roomId) => {
  if (!roomId) {
    throw new Error("roomId가 필요합니다.");
  }

  try {
    const response = await api.get(`/api/report/${roomId}/feedbacks`);
    return response?.data?.data ?? null;
  } catch (error) {
    console.error("fetchFeedbackReport API 호출 실패:", error);
    console.error("에러 응답:", error?.response?.data);
    console.error("에러 상태 코드:", error?.response?.status);

    // 400 에러인 경우 null 반환
    if (error?.response?.status === 400) {
      console.warn(`⚠️ 400 Bad Request: 피드백 데이터가 없을 수 있습니다.`);
      return null;
    }

    throw error;
  }
};

export default {
  fetchTopSlideReport,
  fetchTopQuestionsReport,
  fetchMostRevisitSlide,
  fetchStoredAiReport,
  fetchTopStoredReport,
  fetchMostReactionSticker,
  fetchFeedbackReport,
};
