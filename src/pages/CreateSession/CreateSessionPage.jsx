import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import usePdfConverter from "../../hooks/usePdfConverter";
import { createRoom } from "../../services/roomService";
import { fetchAllOriginalSlideUrls } from "../../services/presentationService";
import api from "../../services/api";
import Layout from "../../components/Layout/Layout";
import SidebarSlides from "../../components/SidebarSlides";
import SlideViewer from "../../components/SlideViewer";
import SettingsPanel from "../../components/SettingsPanel";
import LandingPage from "../../components/LandingPage";
import ShareModal from "../../components/modal/ShareModal";

const PresentationPrepPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId: roomIdParam } = useParams();
  const { pdfFile } = location.state || {};

  const [currentSlide, setCurrentSlide] = useState(0);
  const [roomData, setRoomData] = useState(null);
  const [deckId, setDeckId] = useState(null);
  const [slideImageFiles, setSlideImageFiles] = useState([]);
  const [slideUrls, setSlideUrls] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const hasInitializedRef = useRef(false);

  const { convertPdfToImages } = usePdfConverter();

  // 1. PDF → 이미지 변환
  useEffect(() => {
    if (pdfFile) {
      convertPdfToImages(pdfFile).then(setSlideImageFiles);
    } else {
      navigate("/");
    }
  }, [pdfFile, navigate, convertPdfToImages]);

  // 2. 이미지 업로드 + 방 생성
  useEffect(() => {
    if (!slideImageFiles || slideImageFiles.length === 0) {
      return;
    }

    if (hasInitializedRef.current) {
      return;
    }

    const initRoomAndUpload = async () => {
      try {
        hasInitializedRef.current = true;
        console.log("📄 변환된 슬라이드 개수:", slideImageFiles.length);

        // 1️⃣ 방 생성
        const room = await createRoom(slideImageFiles.length);
        console.log("🏠 방 생성 완료:", room);
        const { roomId, deckId: serverDeckId } = room;
        setDeckId(serverDeckId);

        // 2️⃣ 이미지 업로드 (API 명세에 맞게 한번에 전송)
        const formData = new FormData();
        slideImageFiles.forEach((dataUrl, idx) => {
          const blob = dataURLtoBlob(dataUrl);
          // API 명세에 따라 필드명을 'files'로 지정
          formData.append("files", blob, `page_${idx + 1}.png`);
        });

        const uploadRes = await api.post(
          `/api/presentations/${roomId}/${serverDeckId}/pages`,
          formData
        );
        console.log("📤 슬라이드 업로드 완료:", uploadRes.data);

        // 3️⃣ Presigned URL로 원본 슬라이드 불러오기
        console.log("🔹 fetchAllOriginalSlideUrls 호출 인자:", {
          roomId,
          deckId: serverDeckId,
          totalPages: slideImageFiles.length,
        });
        const originalUrls = await fetchAllOriginalSlideUrls(
          roomId,
          serverDeckId,
          slideImageFiles.length
        );
        

        // 4️⃣ 상태 저장 + sessionStorage
        setSlideUrls(originalUrls);
        setRoomData(room);
        sessionStorage.setItem(
          "boini_room",
          JSON.stringify({ ...room, deckId: serverDeckId })
        );
        sessionStorage.setItem(
          "roomData",
          JSON.stringify({ ...room, deckId: serverDeckId })
        );

        if (roomIdParam !== roomId) {
          navigate(`/create-presentation/${roomId}`, {
            replace: true,
            state: location.state,
          });
        }

        console.log(" 세션 초기화 완료");
      } catch (err) {
        hasInitializedRef.current = false;
        console.error("❌ [initRoomAndUpload] 세션 초기화 실패:", {
          name: err.name,
          message: err.message,
          stack: err.stack,
          response: err.response?.data,
        });
      }
    };

    initRoomAndUpload();
  }, [slideImageFiles, navigate, roomIdParam, pdfFile]);

  // 3. 슬라이드 이미지 로딩 확인
  useEffect(() => {
    if (!slideUrls || slideUrls.length === 0) return;

    const loadPromises = slideUrls.map((slide) => {
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
  }, [slideUrls]);

  // 🔹 방향키로 슬라이드 이동
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        // 이전 슬라이드
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        // 다음 슬라이드
        setCurrentSlide((prev) => Math.min(slideUrls.length - 1, prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [slideUrls.length]);

  if (!slideUrls || slideUrls.length === 0 || !imagesLoaded)
    return <LandingPage message="세션 자료 준비 중..." />;

  return (
    <Layout
      headerProps={{
        roomId: roomData?.roomId,
        deckId: deckId || roomData?.deckId,
        totalPages: slideUrls.length,
        roomData,
      }}
    >
      <SidebarSlides
        slides={slideUrls}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
      />
      <SlideViewer
        slides={slideUrls}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        mode="prepare"
      />
      <SettingsPanel />
    </Layout>
  );
};

export default PresentationPrepPage;

// 유틸: dataURL → Blob 변환
function dataURLtoBlob(dataUrl) {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}
