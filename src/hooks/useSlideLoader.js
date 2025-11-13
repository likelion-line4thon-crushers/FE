import { useState, useEffect } from "react";
import { fetchAllOriginalSlideUrls } from "../services/presentationService";

/**
 * 슬라이드 로딩 관리 훅
 * - 서버에서 presigned URL을 가져와서 슬라이드 로드
 */
export const useSlideLoader = ({ roomId, deckId, totalPages }) => {
  const [slideUrls, setSlideUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId || !deckId || !totalPages) {
      setLoading(false);
      return;
    }

    const fetchSlides = async () => {
      try {
        const urls = await fetchAllOriginalSlideUrls(roomId, deckId, totalPages);
        setSlideUrls(urls);
      } catch (_error) {
        setSlideUrls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, [roomId, deckId, totalPages]);

  return { slideUrls, loading };
};

