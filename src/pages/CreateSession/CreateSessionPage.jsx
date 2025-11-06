import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import usePdfConverter from "../../hooks/usePdfConverter";
import { createRoom } from "../../services/roomService";
import api from "../../services/api";

// 🔹 HeaderBar 포함 Layout 사용 (새로운 Layout.jsx)
import Layout from "../../components/Layout/Layout";

import SidebarSlides from "../../components/SidebarSlides";
import SlideViewer from "../../components/SlideViewer";
import SettingsPanel from "../../components/SettingsPanel";
import LandingPage from "../../components/LandingPage";
import ShareModal from "../../components/modal/ShareModal";

const PresentationPrepPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pdfFile } = location.state || {};

  const [currentSlide, setCurrentSlide] = useState(0);
  const [roomId, setRoomId] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [deckId] = useState(uuidv4());
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const { slides, setSlides, convertPdfToImages } = usePdfConverter();

  useEffect(() => {
    if (pdfFile) {
      convertPdfToImages(pdfFile);
    } else {
      navigate("/");
    }
  }, [pdfFile]);

  useEffect(() => {
    if (!slides || slides.length === 0) return;

    const initRoom = async () => {
      try {
        const room = await createRoom(slides.length);
        setRoomId(room.roomId);
        setRoomData(room);
        console.log("🏠 방 생성 완료:", room.roomId);
      } catch {
        alert("방 생성 중 오류가 발생했습니다.");
      }
    };

    initRoom();
  }, [slides.length, deckId]);

  useEffect(() => {
    const uploadSlides = async () => {
      if (!roomId || !slides || slides.length === 0) return;

      const formData = new FormData();
      slides.forEach((dataUrl, idx) => {
        const blob = dataURLtoBlob(dataUrl);
        formData.append("files", blob, `page_${idx + 1}.png`);
      });

      try {
        const res = await api.post(`/api/presentations/${roomId}/${deckId}/pages`, formData);
        console.log(" 업로드 성공:", res.data);

        const totalPages = res.data?.data?.totalPages || slides.length;
        const slideUrls = Array.from({ length: totalPages }, (_, i) => ({
          page: i + 1,
          thumbnailUrl: `/api/presentations/${roomId}/${deckId}/pages/${i + 1}?ext=png`,
        }));

        setSlides(slideUrls);
        console.log("서버 경로 기반 slides 생성 완료:", slideUrls);
      } catch (err) {
        console.error("❌ 슬라이드 업로드 실패:", err);
      }
    };

    uploadSlides();
  }, [roomId, slides, deckId]);


  useEffect(() => {
    if (!slides || slides.length === 0) return;

    const loadPromises = slides.map((slide) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = slide.thumbnailUrl || slide;
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
      });
    });

    Promise.all(loadPromises).then(() => {
      setImagesLoaded(true);
      console.log("🖼️ 모든 슬라이드 이미지 로드 완료");
    });
  }, [slides]);

  if (!slides || slides.length === 0 || !imagesLoaded)
    return <LandingPage message="세션 자료 준비 중..." />;

  return (
    <Layout
      headerProps={{
        roomId,
        deckId,
        totalPages: slides.length,
      }}
    >
      <SidebarSlides
        slides={slides}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
      />
      <SlideViewer
        slides={slides}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        mode="prepare"
      />
      <SettingsPanel />

      {isShareModalOpen && (
        <ShareModal
          roomData={roomData}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </Layout>
  );
};

export default PresentationPrepPage;

function dataURLtoBlob(dataUrl) {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}
