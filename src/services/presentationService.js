import api from "./api";

/**
 * 특정 페이지의 원본 이미지 URL(Presigned URL)을 가져옵니다.
 * @param {string} roomId - 방 ID
 * @param {string} deckId - 덱 ID
 * @param {number} page - 페이지 번호 (1-based)
 * @returns {Promise<string>} 원본 이미지 URL
 */
export const getOriginalSlideUrl = async (roomId, deckId, page) => {
  try {
    const response = await api.get(
      `/api/presentations/${roomId}/${deckId}/pages/${page}?ext=png`
    );
    return response.data.data.originalUrl;
  } catch (error) {
    console.error(`Error fetching original slide for page ${page}:`, error);
    throw error;
  }
};

/**
 * 모든 페이지의 원본 이미지 URL을 가져옵니다.
 * @param {string} roomId - 방 ID
 * @param {string} deckId - 덱 ID
 * @param {number} totalPages - 전체 페이지 수
 * @returns {Promise<string[]>} 모든 원본 이미지 URL 배열
 */
export const fetchAllOriginalSlideUrls = async (roomId, deckId, totalPages) => {
  try {
    const urlPromises = [];
    // 페이지 번호는 1부터 시작
    for (let i = 1; i <= totalPages; i++) {
      urlPromises.push(getOriginalSlideUrl(roomId, deckId, i));
    }
    const urls = await Promise.all(urlPromises);
    return urls;
  } catch (error) {
    console.error("Error fetching all original slide URLs:", error);
    throw error;
  }
};

/**
 * 현재 발표자의 슬라이드 기준 청중 분포 데이터를 가져옵니다.
 * @param {Object} params
 * @param {string} params.roomId - 방 ID
 * @param {number} [params.page] - 현재 슬라이드 인덱스(0-based). 제공 시 1을 더해 서버에 전달합니다.
 * @param {AbortSignal} [params.signal] - 요청 취소 시 사용할 AbortSignal
 * @returns {Promise<{prev: number, current: number, next: number}>}
 */
export const fetchAudienceSlideStats = async ({ roomId, page, signal } = {}) => {
  if (!roomId) {
    throw new Error("roomId가 필요합니다.");
  }

  const params =
    typeof page === "number" && Number.isFinite(page)
      ? { page: page + 1 }
      : undefined;

  try {
    const response = await api.get(
      `/api/pages/${roomId}/audience-slide-stats`,
      {
        params,
        signal,
      }
    );

    const payload = response?.data?.data ?? response?.data ?? {};

    const normalize = (value) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : 0;
    };

    const front = normalize(
      payload.frontCount ??
        payload.front ??
        payload.prev ??
        payload.previous ??
        payload.before
    );
    const current = normalize(
      payload.currentCount ?? payload.current ?? payload.present ?? payload.now
    );
    const back = normalize(
      payload.backCount ??
        payload.back ??
        payload.next ??
        payload.after ??
        payload.upcoming
    );

    return {
      prev: front,
      current,
      next: back,
    };
  } catch (error) {
    // AbortError는 조용히 무시
    if (error?.name === "CanceledError" || error?.name === "AbortError") {
      throw error;
    }

    console.error("[presentationService] 청중 분포 데이터 조회 실패:", error);
    throw error;
  }
};

