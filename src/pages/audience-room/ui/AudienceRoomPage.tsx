import React, { useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import { useAtomValue } from "jotai";
import AudiencePanel from "./AudiencePanel";
import { SlidesSidebar } from "@/widgets/slides-sidebar";
import { PageContainer, CenterContainer, RightPanelContainer } from "./AudienceRoomPage.styles";
import SlideViewer from "./SlideViewerAudience/SlideViewer_audience";
import { EmojiPanel, useEmojiReactions, useStickerLoader } from "@/entities/reaction";
import { WebSocketService } from "@/shared/api/websocket";
import { useSlideLoader } from "@/entities/slide";
import {
  usePresenterPageSync,
  useAudienceQuestions,
  useAudienceJoinRoom,
  useAudienceSlideNavigation,
  useAudienceWebSocketSubscriptions,
  useAudienceEventHandlers,
  useAudienceInitialState,
  useAudienceFocusHighlight,
  useAudienceClusters,
  audienceIdAtom,
  audienceTokenAtom,
} from "../model";
import { selectUnclusteredQuestions } from "@/entities/question";
import DelayAudience from "./DelayAudience";
import { roomIdAtom, deckIdAtom, totalPagesAtom, wsUrlAtom } from "@/entities/room";
import { quickSettingsAtom, unlockSettingsAtom } from "@/entities/session";

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
  const lastPresenterPageRef = useRef(0);

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

  const { clusters, isExpanded, toggleExpand } = useAudienceClusters({
    roomId,
    isWsReady: isWebsocketReady,
  });

  const unclusteredQuestions = useMemo(
    () => selectUnclusteredQuestions(questions, clusters),
    [questions, clusters]
  );

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

  if (isSessionWaiting) {
    return <DelayAudience placeholderCount={totalPages || 10} />;
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
      <CenterContainer>
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
        {quickSettings.sticker && (
          <EmojiPanel selectedId={selectedEmoji?.id} onSelect={handleSelectEmoji} />
        )}
      </CenterContainer>
      <RightPanelContainer>
        <AudiencePanel
          currentSlide={currentSlide}
          onSelectSlide={handleAudienceSelectSlide}
          questions={unclusteredQuestions}
          questionsLoading={questionsLoading}
          questionsError={questionsError}
          isWaiting={isQuestionListWaiting}
          waitingMessage={isQuestionListWaiting ? "질문을 불러오는 중입니다." : undefined}
          onSubmitQuestion={submitQuestion}
          canSubmit={isWebsocketReady && reactionsReady}
          isLocked={!quickSettings.question}
          clusters={clusters}
          isExpanded={isExpanded}
          toggleExpand={toggleExpand}
        />
      </RightPanelContainer>
    </PageContainer>
  );
};

export default AudienceRoomPage;
