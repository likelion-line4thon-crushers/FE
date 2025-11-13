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

    // 백엔드에서 SlideAudienceCountResponse 객체를 직접 반환
    // 필드명: frontCount, currentCount, backCount (Long 타입, 퍼센트 값 0-100)
    const payload = response?.data?.data ?? response?.data ?? {};

    const normalize = (value) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : 0;
    };

    // 백엔드 필드명: frontCount, currentCount, backCount
    const front = normalize(payload.frontCount ?? 0);
    const current = normalize(payload.currentCount ?? 0);
    const back = normalize(payload.backCount ?? 0);

    return {
      prev: front,
      current,
      next: back,
    };
  } catch (error) {
    if (error?.name === "CanceledError" || error?.name === "AbortError") {
      throw error;
    }

    throw error;
  }
};

/**
 * 특정 슬라이드의 실시간 피드백 메시지를 가져옵니다.
 * @param {Object} params
 * @param {string} params.roomId - 방 ID
 * @param {number} params.page - 페이지 번호 (1-based, slideNumber)
 * @param {AbortSignal} [params.signal] - 요청 취소 시 사용할 AbortSignal
 * @returns {Promise<string|null>} 실시간 피드백 메시지 (없으면 null)
 */
export const fetchLiveFeedback = async ({ roomId, page, signal } = {}) => {
  if (!roomId) {
    throw new Error("roomId가 필요합니다.");
  }

  if (typeof page !== "number" || !Number.isFinite(page) || page < 1) {
    throw new Error("유효한 page 번호가 필요합니다.");
  }

  try {
    // API 명세: GET /{roomId}/slide/{slideNumber}
    const response = await api.get(
      `/${roomId}/slide/${page}`,
      {
        signal,
      }
    );

    // 응답이 문자열인 경우 직접 반환
    // 응답이 객체인 경우 message, feedback, content 필드 확인
    let message = null;
    
    if (typeof response?.data === "string") {
      message = response.data.trim();
    } else if (response?.data) {
      const payload = response.data?.data ?? response.data;
      message = payload?.message ?? payload?.feedback ?? payload?.content ?? null;
      if (message && typeof message === "string") {
        message = message.trim();
      }
    }
    
    return message && message.length > 0 ? message : null;
  } catch (error) {
    if (error?.name === "CanceledError" || error?.name === "AbortError") {
      throw error;
    }

    // 404 등 에러는 피드백이 없는 것으로 간주
    if (error?.response?.status === 404) {
      return null;
    }

    throw error;
  }
};

