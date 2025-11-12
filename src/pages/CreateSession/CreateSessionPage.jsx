import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import websocketService from "../../services/websocketService";
import useQuickSettingsStorage from "../../hooks/useQuickSettingsStorage";

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

  // 🔹 빠른 설정 토글 상태 관리
  const [quickSettings, setQuickSettings] = useQuickSettingsStorage();
  const [isPresenterWsReady, setIsPresenterWsReady] = useState(false);

  const hasInitializedRef = useRef(false);
  const pendingQuickSettingsRef = useRef({
    sticker: quickSettings.sticker,
    question: quickSettings.question,
    feedback: quickSettings.feedback,
  });
  const pendingUnlockRef = useRef(quickSettings.unlock);
  const latestQuickSettingsRef = useRef(quickSettings);

  // roomData에서 roomId 추출
  const roomId = useMemo(() => {
    return roomIdParam || roomData?.roomId;
  }, [roomIdParam, roomData]);

  const presenterToken = roomData?.presenterToken || null;
  const presenterWsUrl = useMemo(() => {
    const raw = roomData?.wsUrl || null;

    const deriveFromUrl = (input) => {
      if (!input) return null;
      try {
        const url = new URL(input, window.location.origin);
        const protocol =
          url.protocol === "ws:"
            ? "http:"
            : url.protocol === "wss:"
            ? "https:"
            : url.protocol;
        return `${protocol}//${url.host}/ws/presenter`;
      } catch (error) {
        return null;
      }
    };

    const derived = deriveFromUrl(raw);
    if (derived) return derived;

    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const fallback = deriveFromUrl(apiBase);
    return fallback ?? "http://localhost:8080/ws/presenter";
  }, [roomData]);

  useEffect(() => {
    latestQuickSettingsRef.current = quickSettings;
    pendingQuickSettingsRef.current = {
      sticker: quickSettings.sticker,
      question: quickSettings.question,
      feedback: quickSettings.feedback,
    };
    pendingUnlockRef.current = quickSettings.unlock;
  }, [quickSettings]);

  const { convertPdfToImages } = usePdfConverter();

  // 🔹 옵션 변경 핸들러 (리액션 스티커, 질문, 실시간 피드백)
  const handleOptionChange = useCallback(
    (optionKey, value) => {
      setQuickSettings((prev) => {
        const newSettings = { ...prev, [optionKey]: value };

        // unlock 옵션이 아닌 경우만 sendOptionChange 호출
        if (optionKey !== "unlock") {
          // 웹소켓으로 전송 (연결되어 있을 경우에만)
          if (roomId && websocketService.getIsConnected()) {
            const options = {
              sticker: newSettings.sticker,
              question: newSettings.question,
              feedback: newSettings.feedback,
            };
            websocketService.sendOptionChange(roomId, options);
          pendingQuickSettingsRef.current = null;
          } else {
            pendingQuickSettingsRef.current = {
              sticker: newSettings.sticker,
              question: newSettings.question,
              feedback: newSettings.feedback,
            };
          }
        }

        return newSettings;
      });
    },
    [roomId]
  );

  // 🔹 다음 슬라이드 공개 옵션 변경 핸들러
  const handleUnlockChange = useCallback(
    (value) => {
      setQuickSettings((prev) => ({ ...prev, unlock: value }));

      // 웹소켓으로 전송 (연결되어 있을 경우에만)
      if (roomId && websocketService.getIsConnected()) {
        const unlock = value ? "true" : "false";
        websocketService.sendUnlockChange(roomId, unlock);
        pendingUnlockRef.current = null;
      } else {
        pendingUnlockRef.current = value;
      }
    },
    [roomId]
  );

  // 🔹 발표자 웹소켓 연결 (발표 준비 단계에서도 연결 유지)
  useEffect(() => {
    if (!roomId || !presenterToken || !presenterWsUrl) {
      return undefined;
    }

    const syncPendingFromLatest = () => {
      const latest = latestQuickSettingsRef.current;
      pendingQuickSettingsRef.current = {
        sticker: latest.sticker,
        question: latest.question,
        feedback: latest.feedback,
      };
      pendingUnlockRef.current =
        typeof latest.unlock === "boolean" ? latest.unlock : true;
    };

    if (websocketService.getIsConnected()) {
      setIsPresenterWsReady(true);
      return () => {
        setIsPresenterWsReady(false);
        syncPendingFromLatest();
        websocketService.disconnect();
      };
    }

    const onConnect = () => {
      setIsPresenterWsReady(true);
    };

    const onError = (error) => {
      setIsPresenterWsReady(false);
      syncPendingFromLatest();
    };

    websocketService.connect(
      presenterWsUrl,
      presenterToken,
      onConnect,
      onError
    );

    return () => {
      setIsPresenterWsReady(false);
      syncPendingFromLatest();
      websocketService.disconnect();
    };
  }, [roomId, presenterToken, presenterWsUrl]);

  // 🔹 웹소켓 연결 이후, 대기 중이던 옵션 변경을 한번에 전송
  useEffect(() => {
    if (
      !roomId ||
      !isPresenterWsReady ||
      !websocketService.getIsConnected()
    ) {
      return;
    }

    const pendingOptions = pendingQuickSettingsRef.current;
    if (pendingOptions) {
      websocketService.sendOptionChange(roomId, pendingOptions);
      pendingQuickSettingsRef.current = null;
    }

    if (pendingUnlockRef.current !== null) {
      const unlockValue = pendingUnlockRef.current
        ? "true"
        : "false";
      websocketService.sendUnlockChange(roomId, unlockValue);
      pendingUnlockRef.current = null;
    }
  }, [isPresenterWsReady, roomId]);

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

        // 1️⃣ 방 생성
        const room = await createRoom(slideImageFiles.length);
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

        // 3️⃣ Presigned URL로 원본 슬라이드 불러오기
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
      } catch (err) {
        hasInitializedRef.current = false;
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
      <SettingsPanel 
        quickSettings={quickSettings}
        onOptionChange={handleOptionChange}
        onUnlockChange={handleUnlockChange}
      />
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
