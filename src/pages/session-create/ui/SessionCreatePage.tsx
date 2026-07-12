import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { KeyboardEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useSetAtom } from "jotai";
import { createLogger } from "@/shared/lib/logger";
import { SessionLoadingOverlay } from "@/shared/ui/session-loading-overlay";
import {
  PresentationLayout,
  SlideViewer,
  SettingsPanel,
  AudienceCount,
  PdfDownloadPolicyControl,
  BroadcastScreenControl,
} from "@/widgets/presentation-layout";
import { SlidesSidebar } from "@/widgets/slides-sidebar";
import { useQuickSettingsStorage, usePdfDownloadPolicy } from "@/entities/session";
import { canStartSessionAtom } from "@/entities/room";
import { SlideNotesPanel, usePresenterSlideNotes } from "@/entities/slide-note";
import { storageKeys } from "@/shared/config/storage-keys";
import { DEFAULT_AUDIENCE_CAPACITY } from "@/shared/config/audience";
import { useChunkedPdfUpload } from "../model/useChunkedPdfUpload";
import { usePdfStream } from "../model/usePdfStream";
import { resolvePresenterRoomData } from "../model/resolvePresenterRoomData";
import { createRoom } from "@/shared/api/room";
import { fetchSlidesMeta, fetchAllOriginalSlideUrls } from "@/shared/api/presentation";
import websocketService from "@/shared/api/websocket";
import { useBroadcastPublisher, useBroadcastReactionVisibility } from "@/shared/lib/broadcast";
import { uploadFonts, finalizeUpload } from "@/shared/api/pdfFonts";
import FontRequirementPrompt from "./FontRequirementPrompt";
import type { ChunkUploadReady, FontReportEntry } from "@/shared/api/model/pdf";

const log = createLogger("session-create");

const PresentationPrepPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId: roomIdParam } = useParams();
  const { presentationFile, pdfFile } = location.state || {};
  const sourceFile = presentationFile || pdfFile;
  const initialRoomData = resolvePresenterRoomData(roomIdParam, location.state);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [roomData, setRoomData] = useState<any>(initialRoomData);
  const [restoredSlides, setRestoredSlides] = useState<(string | null)[] | null>(null);
  const [fatalMessage, setFatalMessage] = useState<string | null>(null);
  const [pendingFonts, setPendingFonts] = useState<{ uploadId: string; fontReport: FontReportEntry[] } | null>(null);
  const [fontBusy, setFontBusy] = useState(false);
  const [uploadingName, setUploadingName] = useState<string | null>(null);
  const [fontWarnings, setFontWarnings] = useState<Record<string, string>>({});
  const [fontError, setFontError] = useState<string | null>(null);
  const pendingRoomRef = useRef<any>(null);

  const roomId = useMemo(() => roomIdParam || roomData?.roomId || null, [roomIdParam, roomData]);
  const quickSettingsStorageKey = roomId ? storageKeys.quickSettings(String(roomId)) : null;

  const [quickSettings, setQuickSettings] = useQuickSettingsStorage(quickSettingsStorageKey) as any;
  const [isPresenterWsReady, setIsPresenterWsReady] = useState(false);
  const {
    enabled: pdfDownloadEnabled,
    saving: pdfDownloadPolicySaving,
    error: pdfDownloadPolicyError,
    setPolicyEnabled: setPdfDownloadPolicyEnabled,
  } = usePdfDownloadPolicy({
    roomId,
    initialEnabled:
      typeof roomData?.pdfDownloadEnabled === "boolean" ? roomData.pdfDownloadEnabled : undefined,
  });

  const hasInitializedRef = useRef(false);
  const pendingQuickSettingsRef = useRef<any>({
    sticker: quickSettings.sticker,
    question: quickSettings.question,
    feedback: quickSettings.feedback,
  });
  const pendingUnlockRef = useRef<any>(quickSettings.unlock);
  const latestQuickSettingsRef = useRef(quickSettings);

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
      } catch {
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

  const { upload: uploadPdf, progress: uploadProgress } = useChunkedPdfUpload();

  // 업로드 & 스트림 상태
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(
    typeof initialRoomData?.totalPages === "number" ? initialRoomData.totalPages : 0
  );

  const {
    slides: streamedSlides,
    canStartSession,
    done: streamDone,
    fatalError,
  } = usePdfStream({
    streamUrl,
    totalPages,
    enabled: !!streamUrl && totalPages > 0,
  });

  const setCanStartSessionAtomValue = useSetAtom(canStartSessionAtom);

  const handleOptionChange = useCallback(
    (optionKey: any, value: any) => {
      setQuickSettings((prev: any) => {
        const newSettings = { ...prev, [optionKey]: value };

        if (optionKey !== "unlock") {
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
    [roomId, setQuickSettings]
  );

  const handleUnlockChange = useCallback(
    (value: any) => {
      setQuickSettings((prev: any) => ({ ...prev, unlock: value }));

      if (roomId && websocketService.getIsConnected()) {
        const unlock = value ? "true" : "false";
        websocketService.sendUnlockChange(roomId, unlock);
        pendingUnlockRef.current = null;
      } else {
        pendingUnlockRef.current = value;
      }
    },
    [roomId, setQuickSettings]
  );

  const handlePdfDownloadPolicyChange = useCallback(
    async (enabled: boolean) => {
      const savedEnabled = await setPdfDownloadPolicyEnabled(enabled);
      if (typeof savedEnabled !== "boolean") return;

      setRoomData((prev: any) => {
        if (!prev || prev.pdfDownloadEnabled === savedEnabled) return prev;
        const next = { ...prev, pdfDownloadEnabled: savedEnabled };
        try {
          sessionStorage.setItem("boini_room", JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [setPdfDownloadPolicyEnabled]
  );

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

    const onError = () => {
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

  // 새로고침 복원: sessionStorage 에 roomData 가 있고 pdfFile 이 없을 때.
  // 우선순위:
  //  1) meta 엔드포인트로 모든 페이지 URL 이 완비돼 있으면 restoredSlides 로 고정 표시.
  //  2) meta 가 부분만 돌려주거나 실패 + pdfId 가 있으면 SSE 스트림을 재구독해서 남은 페이지를 수신.
  //     (BE 는 subscribe 시점 이전 이벤트를 버퍼링 후 flush 해주므로 안전.)
  //  3) meta 도 실패·pdfId 도 없으면 레거시 per-page API 로 마지막 폴백.
  useEffect(() => {
    if (sourceFile) return;
    if (!roomData?.roomId || !roomData?.deckId) return;
    if (restoredSlides !== null) return;

    const pages = roomData.totalPages || 0;
    if (pages <= 0) return;

    const pdfIdFromStorage: string | undefined = roomData.pdfId;

    const resubscribeSse = () => {
      if (!pdfIdFromStorage) return false;
      setTotalPages(pages);
      setStreamUrl(`/api/pdf/${pdfIdFromStorage}/stream`);
      hasInitializedRef.current = true;
      return true;
    };

    const restore = async () => {
      try {
        const urls = await fetchSlidesMeta(roomData.roomId, roomData.deckId, pages);
        const allReady = urls.length === pages && urls.every((u) => !!u);
        if (allReady) {
          setRestoredSlides(urls);
          setTotalPages(pages);
          setRoomData((prev: any) => ({ ...prev, canStartSession: true }));
          hasInitializedRef.current = true;
          return;
        }
        // meta 가 부분만 반환 → BE 가 아직 렌더링 중. SSE 로 재구독해 남은 페이지 수신.
        if (resubscribeSse()) {
          log.warn("meta 부분 응답, SSE 재구독으로 전환");
          return;
        }
        throw new Error("meta 응답이 비어 있음");
      } catch (metaErr) {
        log.warn("meta 조회 실패:", metaErr);
        if (resubscribeSse()) return;
        // 최후 폴백: 레거시 per-page API
        try {
          const urls = await fetchAllOriginalSlideUrls(roomData.roomId, roomData.deckId, pages);
          setRestoredSlides(urls);
          setTotalPages(pages);
          setRoomData((prev: any) => ({ ...prev, canStartSession: true }));
          hasInitializedRef.current = true;
        } catch (err) {
          log.error("슬라이드 복원 실패:", err);
        }
      }
    };

    restore();
  }, [
    sourceFile,
    roomData?.roomId,
    roomData?.deckId,
    roomData?.totalPages,
    roomData?.pdfId,
    restoredSlides,
  ]);

  const applyReady = useCallback(
    (room: any, ready: ChunkUploadReady) => {
      const nextRoomData = {
        ...room,
        deckId: room.deckId,
        totalPages: ready.totalPages,
        pdfId: ready.pdfId,
        fileName: ready.fileName,
        canStartSession: false,
        pdfDownloadEnabled: false,
      };
      setRoomData(nextRoomData);
      setTotalPages(ready.totalPages);
      setStreamUrl(ready.streamUrl);
      sessionStorage.setItem("boini_room", JSON.stringify(nextRoomData));
      setPendingFonts(null);

      if (roomIdParam !== room.roomId) {
        navigate(`/rooms/${room.roomId}`, {
          replace: true,
          state: {
            ...(location.state || {}),
            roomData: nextRoomData,
            roomId: room.roomId,
            deckId: room.deckId,
            totalPages: ready.totalPages,
          },
        });
      }
    },
    [navigate, roomIdParam, location.state]
  );

  // 개별 폰트를 업로드해 서버에 등록하고, 갱신된 리포트로 배지를 바꾼다(변환은 하지 않음).
  const handleUploadFont = useCallback(
    async (fontName: string, file: File) => {
      if (!pendingFonts) return;
      setUploadingName(fontName);
      setFontError(null);
      try {
        const res = await uploadFonts(pendingFonts.uploadId, [file], fontName);
        // 서버는 전체 리포트를 재분석하지 않으므로, 일치하면 해당 폰트만 로컬에서 '사용 가능'으로 바꾼다.
        if (res.matched) {
          setPendingFonts((prev) =>
            prev
              ? {
                  ...prev,
                  fontReport: prev.fontReport.map((e) =>
                    e.name === fontName ? { ...e, status: "AVAILABLE" as const, installed: true } : e
                  ),
                }
              : prev
          );
          setFontWarnings((prev) => {
            const next = { ...prev };
            delete next[fontName];
            return next;
          });
        } else {
          setFontWarnings((prev) => ({ ...prev, [fontName]: res.uploadedFamilies?.[0] ?? "" }));
        }
      } catch {
        setFontError("폰트 업로드에 실패했습니다. 다시 시도해주세요.");
      } finally {
        setUploadingName(null);
      }
    },
    [pendingFonts]
  );

  const handleProceedWithout = useCallback(async () => {
    if (!pendingFonts) return;
    setFontBusy(true);
    setFontError(null);
    try {
      const ready = await finalizeUpload(pendingFonts.uploadId, true);
      applyReady(pendingRoomRef.current, ready);
    } catch {
      setFontError("변환을 시작하지 못했습니다. 다시 시도해주세요.");
    } finally {
      setFontBusy(false);
    }
  }, [pendingFonts, applyReady]);

  // 업로드한 폰트로 변환을 시작한다(finalize).
  const handleContinue = useCallback(async () => {
    if (!pendingFonts) return;
    setFontBusy(true);
    setFontError(null);
    try {
      const ready = await finalizeUpload(pendingFonts.uploadId, false);
      applyReady(pendingRoomRef.current, ready);
    } catch {
      setFontError("변환을 시작하지 못했습니다. 다시 시도해주세요.");
    } finally {
      setFontBusy(false);
    }
  }, [pendingFonts, applyReady]);

  // 신규 업로드 플로우: createRoom → 청크 업로드 → SSE 스트림 구독
  useEffect(() => {
    if (hasInitializedRef.current) return;
    // sourceFile 이 없는 경우(= 새로고침 복원)만 기존 roomData 로 skip. sourceFile 이 있으면
    // stale roomData 가 있더라도 신규 업로드가 우선.
    if (!sourceFile && roomData?.roomId) {
      hasInitializedRef.current = true;
      return;
    }
    if (!sourceFile) {
      navigate("/");
      return;
    }

    hasInitializedRef.current = true;

    // 신규 업로드 진입 — 이전 세션 잔재(atom, sessionStorage, 로컬 state)를 모두 리셋.
    setCanStartSessionAtomValue(false);
    try {
      sessionStorage.removeItem("boini_room");
    } catch {
      /* ignore */
    }
    setTotalPages(0);
    setStreamUrl(null);
    setRoomData(null);

    const run = async () => {
      try {
        // BE 는 totalPages >= 1 을 요구하므로 placeholder 로 1 을 보낸다.
        // 실제 총 페이지는 업로드 조립 완료 응답(ready.totalPages) 에서 확정된다.
        const room = await createRoom(1);
        pendingRoomRef.current = room;
        const terminal = await uploadPdf(sourceFile, room.roomId, room.deckId);
        if (terminal.status === "NEEDS_FONTS") {
          setPendingFonts({ uploadId: terminal.uploadId, fontReport: terminal.fontReport });
          return; // Phase B는 사용자 액션(폰트 업로드/그냥 진행)으로 트리거됨
        }
        applyReady(room, terminal);
      } catch (err) {
        log.error("발표 자료 업로드/스트림 준비 실패:", err);
        hasInitializedRef.current = false;
        setFatalMessage("발표 자료 업로드에 실패했습니다. 다시 시도해주세요.");
      }
    };

    run();
  }, [
    sourceFile,
    roomData?.roomId,
    roomIdParam,
    navigate,
    location.state,
    uploadPdf,
    setCanStartSessionAtomValue,
    applyReady,
  ]);

  // canStartSession 이 true 가 되면 atom + roomData + sessionStorage 를 모두 동기화.
  // AppHeader 는 atom 을 구독해 즉시 재렌더되고, 새로고침 대비로 sessionStorage 에도 저장한다.
  // 새로고침 복원 경로는 restoredSlides 채워지는 시점에 canStartSession 을 true 로 간주.
  useEffect(() => {
    const effective = canStartSession || !!restoredSlides;
    if (!effective) return;
    setCanStartSessionAtomValue(true);
    setRoomData((prev: any) => {
      if (!prev || prev.canStartSession === true) return prev;
      const next = { ...prev, canStartSession: true };
      try {
        sessionStorage.setItem("boini_room", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [canStartSession, restoredSlides, setCanStartSessionAtomValue]);

  // 페이지 이탈 시 atom 리셋 — 다음 세션 준비 때 잔여 값이 남아있지 않도록.
  useEffect(() => {
    return () => setCanStartSessionAtomValue(false);
  }, [setCanStartSessionAtomValue]);

  // 치명 에러 (PDF_LOAD_FAILED) 발생 시 오버레이 표시
  useEffect(() => {
    if (!fatalError) return;
    const message =
      fatalError instanceof Error
        ? fatalError.message
        : fatalError.message || "PDF 로드에 실패했습니다.";
    setFatalMessage(message);
  }, [fatalError]);

  // 표시용 슬라이드 배열 (SSE 진행 중엔 null → "" 플레이스홀더)
  const displaySlides = useMemo<(string | null)[]>(() => {
    if (restoredSlides) return restoredSlides;
    if (totalPages > 0 && streamedSlides.length === 0) {
      return new Array<string>(totalPages).fill("");
    }
    return streamedSlides.map((s) => s ?? "");
  }, [restoredSlides, streamedSlides, totalPages]);

  // 🔹 발표 화면 리액션 스티커 노출 여부 — 준비/발표 화면 간 sessionStorage 로 유지. 기본값은 숨김.
  const [showStampsOnBroadcast, setShowStampsOnBroadcast] = useBroadcastReactionVisibility(
    roomId ? String(roomId) : null
  );

  // 발표 화면(외부 디스플레이) 미러링 — 현재 슬라이드를 projector 창으로 브로드캐스트.
  // projector 창에서의 클릭/키 입력은 nav 로 돌아와 발표자 슬라이드를 이동시킨다.
  const { openScreen, isWindowManagementSupported, openScreenCount } = useBroadcastPublisher({
    roomId: roomId ? String(roomId) : null,
    slides: displaySlides,
    currentSlide,
    broadcastReactionsVisible: showStampsOnBroadcast,
    onNavigate: (direction) =>
      setCurrentSlide((prev) => {
        const maxIndex = Math.max(displaySlides.length - 1, 0);
        const next = direction === "next" ? prev + 1 : prev - 1;
        return Math.min(Math.max(next, 0), maxIndex);
      }),
  });

  const currentSlidePage = currentSlide + 1;
  const { notesByPage, updateSlideNote, flushSlideNote } = usePresenterSlideNotes({
    roomId,
    deckId: roomData?.deckId || null,
    presenterToken,
    editable: true,
  });
  const currentSlideNotes = notesByPage[currentSlidePage] ?? "";

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent | globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      if (
        target?.isContentEditable ||
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT"
      ) {
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        setCurrentSlide((prev) => Math.min(displaySlides.length - 1, prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [displaySlides.length]);

  if (fatalMessage) {
    return <SessionLoadingOverlay message={`⚠️ ${fatalMessage}`} />;
  }

  if (pendingFonts) {
    return (
      <>
        <SessionLoadingOverlay message="발표 자료 준비 중..." />
        <FontRequirementPrompt
          fontReport={pendingFonts.fontReport}
          busy={fontBusy}
          uploadingName={uploadingName}
          warnings={fontWarnings}
          error={fontError}
          onUploadFont={handleUploadFont}
          onContinue={handleContinue}
          onProceedWithout={handleProceedWithout}
        />
      </>
    );
  }

  // 오버레이는 "아직 대시보드를 그릴 근거가 없는 동안"에만 띄운다.
  // 업로드 완료로 totalPages 가 확정되거나 새로고침 복원이 끝나면 곧바로 대시보드를 열고,
  // 각 슬라이드는 SSE 로 도착하는 대로 비동기로 채워진다.
  if (totalPages === 0 && !restoredSlides) {
    const msg =
      uploadProgress.total > 0
        ? `발표 자료 업로드 중... (${uploadProgress.sent}/${uploadProgress.total})`
        : "세션 자료 준비 중...";
    return <SessionLoadingOverlay message={msg} />;
  }

  void streamDone;
  void totalPages;

  return (
    <PresentationLayout>
      <SlidesSidebar
        slides={displaySlides}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
      />
      <SlideViewer
        slides={displaySlides}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        mode="prepare"
        showBroadcastReactionToggle={openScreenCount > 0}
        broadcastReactionsVisible={showStampsOnBroadcast}
        onToggleBroadcastReactions={setShowStampsOnBroadcast}
        audienceCountSlot={
          <AudienceCount
            variant="chip"
            roomId={roomId}
            audienceCapacity={roomData?.count ?? DEFAULT_AUDIENCE_CAPACITY}
            isWsReady={isPresenterWsReady}
          />
        }
        afterSlideContent={
          <SlideNotesPanel
            notes={currentSlideNotes}
            onChange={(notes) => updateSlideNote(currentSlidePage, notes)}
            onBlur={() => flushSlideNote(currentSlidePage)}
          />
        }
      />
      <SettingsPanel
        quickSettings={quickSettings}
        onOptionChange={handleOptionChange}
        onUnlockChange={handleUnlockChange}
        slides={displaySlides}
        currentSlide={currentSlide}
        prepSettingsContent={
          <>
            <PdfDownloadPolicyControl
              enabled={pdfDownloadEnabled}
              saving={pdfDownloadPolicySaving}
              error={pdfDownloadPolicyError}
              onChange={(enabled) => {
                void handlePdfDownloadPolicyChange(enabled);
              }}
            />
            <BroadcastScreenControl
              onOpen={openScreen}
              windowManagementSupported={isWindowManagementSupported}
              disabled={!roomId}
            />
          </>
        }
      />
    </PresentationLayout>
  );
};

export default PresentationPrepPage;
