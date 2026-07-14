import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { KeyboardEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useAtom, useSetAtom } from "jotai";
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
import {
  canStartSessionAtom,
  pendingPresentationFileAtom,
  persistRoomData,
  clearPersistedRoomData,
} from "@/entities/room";
import type { RoomData } from "@/entities/room";
import { SlideNotesPanel, usePresenterSlideNotes } from "@/entities/slide-note";
import { storageKeys } from "@/shared/config/storage-keys";
import { DEFAULT_AUDIENCE_CAPACITY } from "@/shared/config/audience";
import websocketService from "@/shared/api/websocket";
import { useBroadcastPublisher, useBroadcastReactionVisibility } from "@/shared/lib/broadcast";
import type { ChunkUploadReady } from "@/shared/api/model/pdf";
import { usePresentationUploadFlow } from "../model/usePresentationUploadFlow";
import { usePdfStream } from "../model/usePdfStream";
import { useRestorePresenterSlides } from "../model/useRestorePresenterSlides";
import { useRollingMessage } from "../model/useRollingMessage";
import { resolvePresenterRoomData } from "../model/resolvePresenterRoomData";
import FontRequirementPrompt from "./FontRequirementPrompt";
import UploadErrorPanel from "./UploadErrorPanel";
import RenderFailureBanner from "./RenderFailureBanner";
import { UploadCancelButton } from "./SessionCreatePage.styles";

// 청크 업로드는 실제 진행률 신호가 없어(마지막 응답이 서버 변환까지 블로킹) 시간 기반으로 굴린다.
const UPLOAD_MESSAGES = [
  "발표 자료 업로드 중...",
  "슬라이드로 변환하는 중...",
  "슬라이드를 준비하는 중...",
  "거의 다 됐어요...",
] as const;

const PresentationPrepPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId: roomIdParam } = useParams();
  const [pendingFile, setPendingFile] = useAtom(pendingPresentationFileAtom);
  const initialRoomData = resolvePresenterRoomData(roomIdParam, location.state);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [roomData, setRoomData] = useState<RoomData | null>(initialRoomData);
  const [fatalMessage, setFatalMessage] = useState<string | null>(null);
  const [renderFailureDismissed, setRenderFailureDismissed] = useState(false);

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

  // 업로드 & 스트림 상태
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(
    typeof initialRoomData?.totalPages === "number" ? initialRoomData.totalPages : 0
  );

  const setCanStartSessionAtomValue = useSetAtom(canStartSessionAtom);

  // ── 신규 업로드 파이프라인 (createRoom → 청크 업로드 → 폰트 확인 → SSE) ──
  const handleFlowStart = useCallback(() => {
    // 신규 업로드 진입 — 이전 세션 잔재(atom, sessionStorage, 로컬 state)를 모두 리셋.
    setCanStartSessionAtomValue(false);
    clearPersistedRoomData();
    setTotalPages(0);
    setStreamUrl(null);
    setRoomData(null);
  }, [setCanStartSessionAtomValue]);

  const handleRoomCreated = useCallback(
    (room: RoomData) => {
      // totalPages 0 = "방은 있지만 업로드 미완료" 마커. 새로고침 시 중단 안내에 사용된다.
      const skeleton: RoomData = { ...room, totalPages: 0 };
      setRoomData(skeleton);
      persistRoomData(skeleton);
      // 방이 생기는 즉시 캐노니컬 URL 로 교체 — 업로드 중 새로고침해도 /rooms/:roomId 로 복귀.
      navigate(`/rooms/${room.roomId}`, {
        replace: true,
        state: { roomData: skeleton, fileName: pendingFile?.name },
      });
    },
    [navigate, pendingFile]
  );

  const handleReady = useCallback(
    (room: RoomData, ready: ChunkUploadReady) => {
      const next: RoomData = {
        ...room,
        totalPages: ready.totalPages,
        pdfId: ready.pdfId,
        fileName: ready.fileName,
        canStartSession: false,
        pdfDownloadEnabled: false,
      };
      setRoomData(next);
      setTotalPages(ready.totalPages);
      setStreamUrl(ready.streamUrl);
      persistRoomData(next);
      setPendingFile(null); // 성공 — 원본 File 참조 해제
      // 같은 URL 로 replace 해 history.state 의 roomData 를 완성본으로 갱신한다
      // (발표 화면 전환/새로고침 시 sessionStorage 유실에 대한 이중화).
      navigate(`/rooms/${room.roomId}`, {
        replace: true,
        state: { roomData: next, fileName: next.fileName },
      });
    },
    [setPendingFile, navigate]
  );

  const {
    phase,
    retry: retryUpload,
    cancel: cancelUpload,
    fonts,
  } = usePresentationUploadFlow({
    pendingFile,
    onStart: handleFlowStart,
    onRoomCreated: handleRoomCreated,
    onReady: handleReady,
  });

  const isUploadOverlayActive = phase.step === "creating-room" || phase.step === "uploading";
  const uploadMessage = useRollingMessage(UPLOAD_MESSAGES, isUploadOverlayActive);

  // ── 새로고침 복원 (업로드 완료 이후 재진입) ──
  const { outcome: restoreOutcome, retry: retryRestore } = useRestorePresenterSlides({
    enabled: !pendingFile && phase.step === "idle",
    roomId: roomData?.roomId,
    deckId: roomData?.deckId,
    totalPages: roomData?.totalPages,
    pdfId: roomData?.pdfId,
  });
  const restoredSlides = restoreOutcome?.kind === "slides" ? restoreOutcome.slides : null;

  useEffect(() => {
    if (!restoreOutcome || restoreOutcome.kind === "failed") return;
    setTotalPages(restoreOutcome.totalPages);
    if (restoreOutcome.kind === "resubscribe") setStreamUrl(restoreOutcome.streamUrl);
  }, [restoreOutcome]);

  // 방은 만들어졌지만 업로드가 끝나기 전에 이탈/새로고침한 경우 (원본 File 유실)
  const uploadInterrupted =
    !pendingFile && phase.step === "idle" && !!roomData?.roomId && (roomData.totalPages ?? 0) <= 0;

  // 업로드 파일도, 복원할 roomData 도 없으면 이 페이지에 올 이유가 없다 → 랜딩으로
  useEffect(() => {
    if (pendingFile || roomData?.roomId || phase.step !== "idle") return;
    navigate("/");
  }, [pendingFile, roomData?.roomId, phase.step, navigate]);

  const goHome = useCallback(() => {
    cancelUpload();
    setPendingFile(null);
    clearPersistedRoomData();
    setCanStartSessionAtomValue(false);
    navigate("/");
  }, [cancelUpload, setPendingFile, setCanStartSessionAtomValue, navigate]);

  const {
    slides: streamedSlides,
    canStartSession,
    fatalError,
    pageErrors,
  } = usePdfStream({
    streamUrl,
    totalPages,
    enabled: !!streamUrl && totalPages > 0,
  });

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

      setRoomData((prev) => {
        if (!prev || prev.pdfDownloadEnabled === savedEnabled) return prev;
        const next = { ...prev, pdfDownloadEnabled: savedEnabled };
        persistRoomData(next);
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

    websocketService.connect(presenterWsUrl, presenterToken, onConnect, onError, {
      channel: "presenter",
      onDisconnect: onError,
    });

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

  // canStartSession 이 true 가 되면 atom + roomData + sessionStorage 를 모두 동기화.
  // AppHeader 는 atom 을 구독해 즉시 재렌더되고, 새로고침 대비로 sessionStorage 에도 저장한다.
  // 새로고침 복원 경로는 restoredSlides 채워지는 시점에 canStartSession 을 true 로 간주.
  useEffect(() => {
    const effective = canStartSession || !!restoredSlides;
    if (!effective) return;
    setCanStartSessionAtomValue(true);
    setRoomData((prev) => {
      if (!prev || prev.canStartSession === true) return prev;
      const next = { ...prev, canStartSession: true };
      persistRoomData(next);
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

  // ── 상태별 화면 분기 ──
  if (phase.step === "failed") {
    return <UploadErrorPanel message={phase.message} onRetry={retryUpload} onGoHome={goHome} />;
  }

  if (fatalMessage) {
    // SSE 치명 오류(PDF_LOAD_FAILED 등) — 원본 File 이 이미 해제됐을 수 있어 처음부터 다시.
    return <UploadErrorPanel message={fatalMessage} onGoHome={goHome} />;
  }

  if (restoreOutcome?.kind === "failed") {
    return (
      <UploadErrorPanel
        message="발표 자료를 불러오지 못했습니다."
        onRetry={retryRestore}
        onGoHome={goHome}
      />
    );
  }

  if (uploadInterrupted) {
    return (
      <UploadErrorPanel
        message="업로드가 완료되지 않았습니다. 발표 자료를 다시 선택해주세요."
        onGoHome={goHome}
        homeLabel="파일 다시 선택"
      />
    );
  }

  if (phase.step === "awaiting-fonts") {
    return (
      <>
        <SessionLoadingOverlay message="발표 자료 준비 중..." />
        {/* 변환(finalize) 시작하면 모달을 닫아, 사용자가 '준비 중' 로딩 화면을 보게 한다. */}
        {!fonts.busy && (
          <FontRequirementPrompt
            fontReport={phase.fontReport}
            busy={fonts.busy}
            uploadingName={fonts.uploadingName}
            warnings={fonts.warnings}
            error={fonts.error}
            onUploadFont={fonts.uploadFont}
            onContinue={fonts.continueWithFonts}
            onProceedWithout={fonts.proceedWithoutFonts}
          />
        )}
      </>
    );
  }

  // 오버레이는 "아직 대시보드를 그릴 근거가 없는 동안"에만 띄운다.
  // 업로드 완료로 totalPages 가 확정되거나 새로고침 복원이 끝나면 곧바로 대시보드를 열고,
  // 각 슬라이드는 SSE 로 도착하는 대로 비동기로 채워진다.
  if (totalPages === 0 && !restoredSlides) {
    if (isUploadOverlayActive) {
      return (
        <SessionLoadingOverlay message={uploadMessage}>
          <UploadCancelButton type="button" onClick={goHome}>
            업로드 취소
          </UploadCancelButton>
        </SessionLoadingOverlay>
      );
    }
    return <SessionLoadingOverlay message="세션 자료 준비 중..." />;
  }

  const renderFailureCount = Object.keys(pageErrors).length;

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
      {renderFailureCount > 0 && !renderFailureDismissed && (
        <RenderFailureBanner
          failedCount={renderFailureCount}
          onDismiss={() => setRenderFailureDismissed(true)}
        />
      )}
    </PresentationLayout>
  );
};

export default PresentationPrepPage;
