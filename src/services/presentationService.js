import api from "./api";

export const fetchSlidesMeta = async (roomId, deckId, totalPages) => {
    try {
        console.log("📥 [fetchSlidesMeta] 슬라이드 메타 정보 요청:", {
            roomId,
            deckId,
            totalPages,
            endpoint: `/api/presentations/${roomId}/${deckId}/meta`,
        });

        const res = await api.get(`/api/presentations/${roomId}/${deckId}/meta`, {
            params: { totalPages },
        });

        console.log("✅ [fetchSlidesMeta] 슬라이드 메타 정보 가져오기 성공:", {
            status: res.status,
            responseData: res.data,
            extractedData: res.data.data,
            thumbnailCount: res.data.data?.thumbnailUrl?.length || 0,
        });

        return res.data.data; // { roomId, deckId, totalPages, thumbnailUrl: [...] }
    } catch (err) {
        console.error("❌ [fetchSlidesMeta] 슬라이드 메타 정보 가져오기 실패:", {
            error: err,
            message: err.message,
            status: err.response?.status,
            responseData: err.response?.data,
        });
        throw err;
    }
};

