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

