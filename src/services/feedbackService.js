import api from "./api";

/**
 * 청중 피드백 제출
 * @param {Object} params
 * @param {string} params.roomId - 방 ID
 * @param {string} params.audienceId - 청중 ID
 * @param {number} params.rating - 별점 (1-5)
 * @param {string} [params.comment] - 후기 (선택사항)
 * @returns {Promise<Object>} 피드백 응답 데이터
 */
export const submitFeedback = async ({ roomId, audienceId, rating, comment = "" }) => {
  if (!roomId) {
    throw new Error("roomId가 필요합니다.");
  }

  if (!audienceId) {
    throw new Error("audienceId가 필요합니다.");
  }

  if (!rating || rating < 1 || rating > 5) {
    throw new Error("유효한 별점(1-5)이 필요합니다.");
  }

  try {
    const response = await api.post(
      `/api/feedbacks/rooms/${roomId}/feedbacks`,
      {
        audienceId,
        rating,
        comment: comment || "",
      }
    );

    return response?.data?.data ?? response?.data ?? null;
  } catch (error) {
    console.error("[submitFeedback] 피드백 제출 실패:", error);
    throw error;
  }
};

