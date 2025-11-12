import api from "./api";

export const getAllStickers = async (sessionId) => {
  try {
    const response = await api.get(`/api/stickers/${sessionId}/all`);
    const data = response?.data?.data ?? response?.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("[getAllStickers] 스티커 조회 실패:", error);
    return [];
  }
};

export const getStickersByAudience = async (sessionId, audienceId) => {
  try {
    const response = await api.get(
      `/api/stickers/${sessionId}/audience/${audienceId}`
    );
    const data = response?.data?.data ?? response?.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("[getStickersByAudience] 스티커 조회 실패:", error);
    return [];
  }
};
