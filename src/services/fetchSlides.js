import api from "./api";

export const fetchSlideUrls = async (roomId, deckId, totalPages) => {
    try {
        const slides = await Promise.all(
            Array.from({ length: totalPages }, async (_, i) => {
                const page = i + 1;
                const res = await api.get(`/api/presentations/${roomId}/${deckId}/pages/${page}?ext=png`);
                return { page, thumbnailUrl: res.data.data.originalUrl };
            })
        );
        console.log("✅ [fetchSlideUrls] 슬라이드 URL 목록 생성 완료:", slides);
        return slides;
    } catch (err) {
        console.error("❌ [fetchSlideUrls] 슬라이드 URL 생성 실패:", err);
        return [];
    }
};
