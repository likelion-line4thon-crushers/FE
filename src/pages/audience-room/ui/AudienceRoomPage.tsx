import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import { useParams } from "react-router";
import { useAtomValue } from "jotai";
import AudiencePanel from "./AudiencePanel";
import { SlidesSidebar } from "@/widgets/slides-sidebar";
import { PageContainer, CenterContainer, RightPanelContainer } from "./AudienceRoomPage.styles";
import SlideViewer from "./SlideViewerAudience/SlideViewer_audience";
import { EmojiPanel, useEmojiReactions, useStickerLoader } from "@/entities/reaction";
import { WebSocketService } from "@/shared/api/websocket";
import { useSlideLoader } from "@/entities/slide";
import { SessionWarningModal } from "@/shared/ui/session-warning-modal";
import {
  usePresenterPageSync,
  useAudienceQuestions,
  useAudienceJoinRoom,
  useAudienceSlideNavigation,
  useAudienceWebSocketSubscriptions,
  useAudienceEventHandlers,
  useAudienceInitialState,
  useAudienceFocusHighlight,
  audienceIdAtom,
  audienceTokenAtom,
} from "../model";
import DelayAudience from "./DelayAudience";
import { roomIdAtom, deckIdAtom, totalPagesAtom, wsUrlAtom } from "@/entities/room";
import { quickSettingsAtom, unlockSettingsAtom } from "@/entities/session";

type FullscreenElement = HTMLDivElement & {
  webkitRequestFullscreen?: () => Promise<void>;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
};

const FULLSCREEN_CONTROLS_IDLE_MS = 5000;

const AudienceRoomPage = () => {
  const { code } = useParams();

  // * Read shared state from Jotai atoms (set by useAudienceJoinRoom)
  const roomId = useAtomValue(roomIdAtom);
  const audienceId = useAtomValue(audienceIdAtom);
  const audienceToken = useAtomValue(audienceTokenAtom);
  const wsUrl = useAtomValue(wsUrlAtom);
  const deckId = useAtomValue(deckIdAtom);
  const totalPages = useAtomValue(totalPagesAtom);
  const quickSettings = useAtomValue(quickSettingsAtom);
  const unlockSettings = useAtomValue(unlockSettingsAtom);

  // Local UI state
  const [selectedEmoji, setSelectedEmoji] = useState<any>(null);
  const [showStamps, setShowStamps] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [areFullscreenControlsVisible, setAreFullscreenControlsVisible] = useState(false);
  const [isFullscreenSlideChipVisible, setIsFullscreenSlideChipVisible] = useState(false);
  const [showAudienceJoinWarning, setShowAudienceJoinWarning] = useState(false);
  const lastPresenterPageRef = useRef(0);
  const centerContainerRef = useRef<FullscreenElement | null>(null);
  const fullscreenControlsTimerRef = useRef<number | null>(null);
  const fullscreenSlideChipTimerRef = useRef<number | null>(null);
  const shouldConsumeFullscreenClickRef = useRef(false);
  const hasShownAudienceJoinWarningRef = useRef(false);

  const { sessionStatus } = useAudienceInitialState({ code, roomId });

  const {
    slides,
    showPlaceholder: showSlidesPlaceholder,
    waitingMessage,
    hasError: hasSlidesError,
    retry: handleRetryFetchSlides,
    applySlideReady,
  } = useSlideLoader({ roomId, deckId, totalPages });

  const {
    currentSlide,
    setCurrentSlide,
    followPresenter,
    setFollowPresenter,
    followPresenterRef,
    prevSlideRef,
    changeCurrentSlide,
    handleToggleFollowPresenter,
    handleAudienceSelectSlide,
  } = useAudienceSlideNavigation({
    code,
    slideCount: slides.length,
    roomId,
    audienceId,
    lastPresenterPageRef,
  });

  const { showFocusHighlight, triggerFocusHighlight } = useAudienceFocusHighlight();

  const {
    questions,
    questionsLoading,
    questionsError,
    submitQuestion,
    toggleQuestionLike,
    handleIncomingQuestion,
    questionTopics,
  } = useAudienceQuestions({ roomId, audienceId, currentSlide });

  const reactionService = useMemo(() => new WebSocketService(), []);

  const {
    stampsBySlide,
    isReady: reactionsReady,
    addLocalStamp,
  } = useEmojiReactions({
    sessionId: roomId,
    token: audienceToken,
    wsUrl,
    enabled: Boolean(roomId && audienceToken && wsUrl),
    disconnectOnUnmount: true,
    service: reactionService,
  });

  // * useAudienceJoinRoom now reads/writes atoms directly — only 3 params needed
  useAudienceJoinRoom({
    code,
    lastPresenterPageRef,
    setFollowPresenter,
    changeCurrentSlide,
  });

  usePresenterPageSync({
    slides,
    currentSlide,
    setCurrentSlide,
    lastPresenterPageRef,
    prevSlideRef,
    followPresenter,
    setFollowPresenter,
    followPresenterRef,
  });

  useStickerLoader({
    roomId,
    addLocalStamp,
    reactionsReady,
    prefix: "Audience loadStickers",
  });

  // * useAudienceWebSocketSubscriptions now reads atoms — fewer params
  const { isWebsocketReady } = useAudienceWebSocketSubscriptions({
    questionTopics,
    handleIncomingQuestion,
    changeCurrentSlide,
    currentSlide,
    followPresenterRef,
    setFollowPresenter,
    lastPresenterPageRef,
    code,
    triggerFocusHighlight,
    applySlideReady,
  });

  const { handleSelectEmoji, handlePlaceStamp, handleToggleShowStamps } = useAudienceEventHandlers({
    selectedEmoji,
    setSelectedEmoji,
    reactionsReady,
    roomId,
    audienceId,
    wsUrl,
    currentSlide,
    addLocalStamp,
    showStamps,
    setShowStamps,
  });

  const isQuestionListWaiting = questionsLoading && questions.length === 0;
  const isSessionWaiting = sessionStatus === "waiting";

  useEffect(() => {
    if (hasShownAudienceJoinWarningRef.current) return;
    if (!roomId || !audienceId || !audienceToken) return;

    hasShownAudienceJoinWarningRef.current = true;
    setShowAudienceJoinWarning(true);
  }, [audienceId, audienceToken, roomId]);

  const clearFullscreenControlsTimer = useCallback(() => {
    if (fullscreenControlsTimerRef.current == null) return;

    window.clearTimeout(fullscreenControlsTimerRef.current);
    fullscreenControlsTimerRef.current = null;
  }, []);

  const scheduleFullscreenControlsHide = useCallback(() => {
    clearFullscreenControlsTimer();
    fullscreenControlsTimerRef.current = window.setTimeout(() => {
      setAreFullscreenControlsVisible(false);
      fullscreenControlsTimerRef.current = null;
    }, FULLSCREEN_CONTROLS_IDLE_MS);
  }, [clearFullscreenControlsTimer]);

  const clearFullscreenSlideChipTimer = useCallback(() => {
    if (fullscreenSlideChipTimerRef.current == null) return;

    window.clearTimeout(fullscreenSlideChipTimerRef.current);
    fullscreenSlideChipTimerRef.current = null;
  }, []);

  const showFullscreenSlideChip = useCallback(() => {
    if (!isFullscreen) return;

    clearFullscreenSlideChipTimer();
    setIsFullscreenSlideChipVisible(true);
    fullscreenSlideChipTimerRef.current = window.setTimeout(() => {
      setIsFullscreenSlideChipVisible(false);
      fullscreenSlideChipTimerRef.current = null;
    }, FULLSCREEN_CONTROLS_IDLE_MS);
  }, [clearFullscreenSlideChipTimer, isFullscreen]);

  const revealFullscreenControls = useCallback(() => {
    if (!isFullscreen) return;

    setAreFullscreenControlsVisible(true);
    scheduleFullscreenControlsHide();
  }, [isFullscreen, scheduleFullscreenControlsHide]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenDocument = document as FullscreenDocument;
      const isCurrentContainerFullscreen =
        document.fullscreenElement === centerContainerRef.current ||
        fullscreenDocument.webkitFullscreenElement === centerContainerRef.current;

      setIsFullscreen(isCurrentContainerFullscreen);
      setAreFullscreenControlsVisible(false);
      setIsFullscreenSlideChipVisible(false);
      clearFullscreenControlsTimer();
      clearFullscreenSlideChipTimer();
      shouldConsumeFullscreenClickRef.current = false;
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, [clearFullscreenControlsTimer, clearFullscreenSlideChipTimer]);

  useEffect(() => clearFullscreenControlsTimer, [clearFullscreenControlsTimer]);
  useEffect(() => clearFullscreenSlideChipTimer, [clearFullscreenSlideChipTimer]);

  useEffect(() => {
    if (!isFullscreen) {
      setIsFullscreenSlideChipVisible(false);
      clearFullscreenSlideChipTimer();
      return;
    }

    showFullscreenSlideChip();
  }, [clearFullscreenSlideChipTimer, currentSlide, isFullscreen, showFullscreenSlideChip]);

  const handleFullscreenPointerMove = () => {
    revealFullscreenControls();
  };

  const handleFullscreenPointerDownCapture = (_event: PointerEvent<HTMLDivElement>) => {
    if (!isFullscreen) return;

    shouldConsumeFullscreenClickRef.current = !areFullscreenControlsVisible;
    revealFullscreenControls();
  };

  const handleFullscreenClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!shouldConsumeFullscreenClickRef.current) return;

    shouldConsumeFullscreenClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const handleToggleFullscreen = async () => {
    const fullscreenDocument = document as FullscreenDocument;
    const activeFullscreenElement =
      document.fullscreenElement || fullscreenDocument.webkitFullscreenElement;

    if (activeFullscreenElement) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        return;
      }

      if (fullscreenDocument.webkitExitFullscreen) {
        await fullscreenDocument.webkitExitFullscreen();
      }
      return;
    }

    const fullscreenElement = centerContainerRef.current;
    if (!fullscreenElement) return;

    if (fullscreenElement.requestFullscreen) {
      await fullscreenElement.requestFullscreen();
      return;
    }

    if (fullscreenElement.webkitRequestFullscreen) {
      await fullscreenElement.webkitRequestFullscreen();
    }
  };

  if (isSessionWaiting) {
    return (
      <>
        <DelayAudience placeholderCount={totalPages || 10} />
        {showAudienceJoinWarning && (
          <SessionWarningModal
            title="꼭 주의해 주세요!"
            description={[
              "발표 자료의 저작권은 발표자에게 있습니다.",
              "무단 캡처 및 유포 시 법적 제재를 받을 수 있어요.",
            ]}
            onClose={() => setShowAudienceJoinWarning(false)}
            onConfirm={() => setShowAudienceJoinWarning(false)}
          />
        )}
      </>
    );
  }

  return (
    <PageContainer>
      <SlidesSidebar
        slides={slides}
        currentSlide={currentSlide}
        setCurrentSlide={handleAudienceSelectSlide}
        isWaiting={showSlidesPlaceholder}
        placeholderCount={totalPages || 10}
        maxRevealedPage={unlockSettings.maxRevealedPage}
        revealAllSlides={unlockSettings.revealAllSlides}
      />
      <CenterContainer
        ref={centerContainerRef}
        $isFullscreen={isFullscreen}
        onPointerMove={handleFullscreenPointerMove}
        onPointerDownCapture={handleFullscreenPointerDownCapture}
        onClickCapture={handleFullscreenClickCapture}
        onTouchStart={revealFullscreenControls}
      >
        <SlideViewer
          slides={slides}
          currentSlide={currentSlide}
          stamps={stampsBySlide[String(currentSlide)] || []}
          onPlace={handlePlaceStamp}
          followPresenter={followPresenter}
          onToggleFollow={handleToggleFollowPresenter}
          showStamps={showStamps}
          onToggleShowStamps={handleToggleShowStamps}
          isWaiting={showSlidesPlaceholder}
          waitingMessage={showSlidesPlaceholder ? waitingMessage : undefined}
          focusHighlight={showFocusHighlight}
          isFullscreen={isFullscreen}
          fullscreenControlsVisible={!isFullscreen || areFullscreenControlsVisible}
          fullscreenSlideChipVisible={isFullscreen && isFullscreenSlideChipVisible}
          onToggleFullscreen={handleToggleFullscreen}
        />
        {hasSlidesError && (
          <div
            style={{
              marginTop: "16px",
              color: "#d14343",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>슬라이드를 불러오는 중 문제가 발생했습니다.</span>
            <button
              type="button"
              onClick={handleRetryFetchSlides}
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#4f46e5",
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              다시 시도
            </button>
          </div>
        )}
        {quickSettings.sticker && (!isFullscreen || areFullscreenControlsVisible) && (
          <EmojiPanel selectedId={selectedEmoji?.id} onSelect={handleSelectEmoji} />
        )}
      </CenterContainer>
      <RightPanelContainer>
        <AudiencePanel
          currentSlide={currentSlide}
          onSelectSlide={handleAudienceSelectSlide}
          questions={questions}
          questionsLoading={questionsLoading}
          questionsError={questionsError}
          isWaiting={isQuestionListWaiting}
          waitingMessage={isQuestionListWaiting ? "질문을 불러오는 중입니다." : undefined}
          onSubmitQuestion={submitQuestion}
          onToggleQuestionLike={toggleQuestionLike}
          canSubmit={isWebsocketReady && reactionsReady}
          isLocked={!quickSettings.question}
        />
      </RightPanelContainer>
      {showAudienceJoinWarning && (
        <SessionWarningModal
          title="꼭 주의해 주세요!"
          description={[
            "발표 자료의 저작권은 발표자에게 있습니다.",
            "무단 캡처 및 유포 시 법적 제재를 받을 수 있어요.",
          ]}
          onClose={() => setShowAudienceJoinWarning(false)}
          onConfirm={() => setShowAudienceJoinWarning(false)}
        />
      )}
    </PageContainer>
  );
};

export default AudienceRoomPage;
