import axios from "axios";

const FALLBACK_BASE_URL = "http://localhost:8000";

const resolveBaseUrl = () => {
  if (typeof window === "undefined") {
    return FALLBACK_BASE_URL;
  }

  const envBase =
    import.meta?.env?.VITE_AI_API_BASE_URL ??
    import.meta?.env?.VITE_API_BASE_URL ??
    null;

  if (envBase) {
    return envBase;
  }

  try {
    const storedBase = window.localStorage?.getItem("ai_api_base_url");
    if (storedBase) {
      return storedBase;
    }
  } catch (err) {
    console.warn("[aiReportService] Failed to read stored base URL:", err);
  }

  return FALLBACK_BASE_URL;
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

export default {
  fetchTopSlideReport,
  fetchTopQuestionsReport,
};
