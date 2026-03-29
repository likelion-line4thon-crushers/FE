import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { KeyboardEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { createLogger } from "@/shared/lib/logger";
import { SessionLoadingOverlay } from "@/shared/ui/session-loading-overlay";
import { PresentationLayout, SlideViewer, SettingsPanel } from "@/widgets/presentation-layout";
import { SlidesSidebar } from "@/widgets/slides-sidebar";
import { useQuickSettingsStorage } from "@/entities/session";

const log = createLogger("session-create");
import { v4 as uuidv4 } from "uuid";
import usePdfConverter from "../model/usePdfConverter";
import { createRoom } from "@/shared/api/room";
import { fetchAllOriginalSlideUrls } from "@/shared/api/presentation";
import api from "@/shared/api/api";
import websocketService from "@/shared/api/websocket";

const PresentationPrepPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId: roomIdParam } = useParams();
  const { pdfFile } = location.state || {};

  const [currentSlide, setCurrentSlide] = useState(0);
  const [roomData, setRoomData] = useState<any>(null);
  const [deckId, setDeckId] = useState<any>(null);
  const [slideImageFiles, setSlideImageFiles] = useState<any[]>([]);
  const [slideUrls, setSlideUrls] = useState<any[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // 🔹 세션 스토리지에서 방 정보 복원
  useEffect(() => {
    if (roomData) return; // 이미 roomData가 있으면 스킵

    try {
      const storedRoomData = JSON.parse(sessionStorage.getItem("boini_room") || "{}");

      if (storedRoomData && storedRoomData.roomId) {
        // roomIdParam이 있으면 일치하는지 확인
        if (roomIdParam && storedRoomData.roomId !== roomIdParam) {
          return; // roomId가 다르면 스킵
        }

        // 세션 스토리지에 저장된 방 정보 복원
        setRoomData(storedRoomData);
        if (storedRoomData.deckId) {
          setDeckId(storedRoomData.deckId);
        }
      }
    } catch (error) {
      log.error("세션 스토리지에서 방 정보 복원 실패:", error);
    }
  }, [roomIdParam, roomData]);

  // 🔹 빠른 설정 토글 상태 관리
  const [quickSettings, setQuickSettings] = useQuickSettingsStorage() as any;
  const [isPresenterWsReady, setIsPresenterWsReady] = useState(false);

  const hasInitializedRef = useRef(false);
  const pendingQuickSettingsRef = useRef<any>({
    sticker: quickSettings.sticker,
    question: quickSettings.question,
    feedback: quickSettings.feedback,
  });
  const pendingUnlockRef = useRef<any>(quickSettings.unlock);
  const latestQuickSettingsRef = useRef(quickSettings);

  // roomData에서 roomId 추출
  const roomId = useMemo(() => {
    return roomIdParam || roomData?.roomId;
  }, [roomIdParam, roomData]);

  const presenterToken = roomData?.presenterToken || null;
  const presenterWsUrl = useMemo(() => {
    const raw = roomData?.wsUrl || null;

    const deriveFromUrl = (input: any) => {
      if (!input) return null;
      try {
        const url = new URL(input, window.location.origin);
        const protocol =
          url.protocol === "ws:" ? "http:" : url.protocol === "wss:" ? "https:" : url.protocol;
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
    (optionKey: any, value: any) => {
      setQuickSettings((prev: any) => {
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
    (value: any) => {
      setQuickSettings((prev: any) => ({ ...prev, unlock: value }));

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
      pendingUnlockRef.current = typeof latest.unlock === "boolean" ? latest.unlock : true;
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

    const onError = (error: any) => {
      setIsPresenterWsReady(false);
      syncPendingFromLatest();
    };

    websocketService.connect(presenterWsUrl, presenterToken, onConnect, onError);

    return () => {
      setIsPresenterWsReady(false);
      syncPendingFromLatest();
      websocketService.disconnect();
    };
  }, [roomId, presenterToken, presenterWsUrl]);

  // 🔹 웹소켓 연결 이후, 대기 중이던 옵션 변경을 한번에 전송
  useEffect(() => {
    if (!roomId || !isPresenterWsReady || !websocketService.getIsConnected()) {
      return;
    }

    const pendingOptions = pendingQuickSettingsRef.current;
    if (pendingOptions) {
      websocketService.sendOptionChange(roomId, pendingOptions);
      pendingQuickSettingsRef.current = null;
    }

    if (pendingUnlockRef.current !== null) {
      const unlockValue = pendingUnlockRef.current ? "true" : "false";
      websocketService.sendUnlockChange(roomId, unlockValue);
      pendingUnlockRef.current = null;
    }
  }, [isPresenterWsReady, roomId]);

  // 🔹 세션 스토리지에 방 정보가 있으면 슬라이드 URL 복원
  useEffect(() => {
    if (!roomData || !roomData.roomId || !roomData.deckId || slideUrls.length > 0) {
      return;
    }

    const restoreSlides = async () => {
      try {
        // 세션 스토리지에서 totalPages 확인
        const totalPages = roomData.totalPages || 0;
        if (totalPages === 0) return;

        // Presigned URL로 원본 슬라이드 불러오기
        const originalUrls = await fetchAllOriginalSlideUrls(
          roomData.roomId,
          roomData.deckId,
          totalPages
        );

        setSlideUrls(originalUrls);
        hasInitializedRef.current = true; // 방 생성 스킵을 위해 플래그 설정
      } catch (error) {
        log.error("슬라이드 복원 실패:", error);
        // 복원 실패 시 기존 로직으로 진행
        hasInitializedRef.current = false;
      }
    };

    restoreSlides();
  }, [roomData, slideUrls.length]);

  // 1. PDF → 이미지 변환
  useEffect(() => {
    // 세션 스토리지에 방 정보가 있으면 PDF 변환 스킵
    if (roomData && roomData.roomId) {
      return;
    }

    if (pdfFile) {
      convertPdfToImages(pdfFile).then(setSlideImageFiles);
    } else if (!roomData || !roomData.roomId) {
      // 방 정보도 없고 PDF 파일도 없으면 메인 페이지로 이동
      navigate("/");
    }
  }, [pdfFile, navigate, convertPdfToImages, roomData]);

  // 2. 이미지 업로드 + 방 생성
  useEffect(() => {
    if (!slideImageFiles || slideImageFiles.length === 0) {
      return;
    }

    if (hasInitializedRef.current) {
      return;
    }

    // 세션 스토리지에 방 정보가 있으면 방 생성 스킵
    if (roomData && roomData.roomId) {
      hasInitializedRef.current = true;
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
        const nextRoomData = {
          ...room,
          deckId: serverDeckId,
          totalPages: slideImageFiles.length,
        };

        setSlideUrls(originalUrls);
        setRoomData(nextRoomData);
        sessionStorage.setItem(
          "boini_room",
          JSON.stringify(nextRoomData)
        );

        if (roomIdParam !== roomId) {
          navigate(`/rooms/${roomId}/prepare`, {
            replace: true,
            state: {
              ...(location.state || {}),
              roomData: nextRoomData,
              roomId,
              deckId: serverDeckId,
              totalPages: slideImageFiles.length,
            },
          });
        }
      } catch (err) {
        hasInitializedRef.current = false;
      }
    };

    initRoomAndUpload();
  }, [slideImageFiles, navigate, roomIdParam, pdfFile, roomData]);

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
    const handleKeyDown = (event: KeyboardEvent | globalThis.KeyboardEvent) => {
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
    return <SessionLoadingOverlay message="세션 자료 준비 중..." />;

  return (
    <PresentationLayout>
      <SlidesSidebar
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
        roomId={roomId}
        audienceCapacity={roomData?.count ?? 50}
        isWsReady={isPresenterWsReady}
      />
    </PresentationLayout>
  );
};

export default PresentationPrepPage;

// 유틸: dataURL → Blob 변환
function dataURLtoBlob(dataUrl: string) {
  const arr = dataUrl.split(",");
  const mimeMatch = arr[0]?.match(/:(.*?);/);
  const mime = mimeMatch?.[1] ?? "application/octet-stream";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}
