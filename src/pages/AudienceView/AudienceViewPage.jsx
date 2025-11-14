import React, { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import AudiencePanel from "../../components/Audience/AudiencePanel";
import SidebarSlides from "../../components/SidebarSlides";
import {
  PageContainer,
  CenterContainer,
  RightPanelContainer,
} from "./AudienceViewPage.styles";
import SlideViewer from "../../components/Audience/SlideViewer_audience/SlideViewer_audience";
import EmojiPanel from "../../components/Audience/EmojiPanel";
import { WebSocketService } from "../../services/websocketService";
import useAudienceQuestions from "../../hooks/useAudienceQuestions";
import useEmojiReactions from "../../hooks/useEmojiReactions";
import useStickerLoader from "../../hooks/useStickerLoader";
import useAudienceJoinRoom from "../../hooks/useAudienceJoinRoom";
import usePresenterPageSync from "../../hooks/usePresenterPageSync";
import useAudienceSlides from "../../hooks/useAudienceSlides";
import useAudienceSlideNavigation from "../../hooks/useAudienceSlideNavigation";
import useAudienceWebSocketSubscriptions from "../../hooks/useAudienceWebSocketSubscriptions";
import useAudienceEventHandlers from "../../hooks/useAudienceEventHandlers";
import useAudienceInitialState from "../../hooks/useAudienceInitialState";
import useAudienceFocusHighlight from "../../hooks/useAudienceFocusHighlight";
import DelayAudience from "./DelayAudience";

const AudienceViewPage = () => {
  const { code } = useParams();

  const [roomId, setRoomId] = useState(null);
  const [audienceId, setAudienceId] = useState(null);
  const [audienceToken, setAudienceToken] = useState(null);
  const [wsUrl, setWsUrl] = useState(null);
  const [deckId, setDeckId] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [showStamps, setShowStamps] = useState(true);

  // 🔹 빠른 설정 옵션 상태 (발표자로부터 받은 설정)
  const [quickSettings, setQuickSettings] = useState({
    sticker: true,
    question: true,
    feedback: true,
  });
  const [unlockSettings, setUnlockSettings] = useState({
    maxRevealedPage: null,
    revealAllSlides: true,
    totalPages: null,
    presenterPage: null,
  });

  const lastPresenterPageRef = useRef(0);

  // 초기 상태 관리
  const { sessionStatus, setSessionStatus } = useAudienceInitialState({
    code,
    roomId,
  });

  // 슬라이드 관리
  const {
    slides,
    showSlidesPlaceholder,
    waitingMessage,
    hasSlidesError,
    handleRetryFetchSlides,
  } = useAudienceSlides({
    roomId,
    deckId,
    totalPages,
  });

  // 슬라이드 네비게이션
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

  // Focus Highlight 관리
  const { showFocusHighlight, triggerFocusHighlight } =
    useAudienceFocusHighlight();

  const {
    questions,
    questionsLoading,
    questionsError,
    submitQuestion,
    handleIncomingQuestion,
    questionTopics,
  } = useAudienceQuestions({
    roomId,
    audienceId,
    currentSlide,
  });

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

  // 🔹 방 입장 및 초기 설정 처리
  useAudienceJoinRoom({
    code,
    setRoomId,
    setAudienceId,
    setAudienceToken,
    setWsUrl,
    setDeckId,
    setTotalPages,
    setSessionStatus,
    setQuickSettings,
    setUnlockSettings,
    lastPresenterPageRef,
  });

  // 🔹 슬라이드 로드 후 발표자 페이지로 동기화
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

  // 🔹 새로고침 시 스티커 로드 (커스텀 훅 사용)
  useStickerLoader({
    roomId,
    addLocalStamp,
    reactionsReady,
    prefix: "Audience loadStickers",
  });

  // WebSocket 구독 관리
  const { isWebsocketReady } = useAudienceWebSocketSubscriptions({
    roomId,
    audienceId,
    wsUrl,
    audienceToken,
    questionTopics,
    handleIncomingQuestion,
    changeCurrentSlide,
    currentSlide,
    followPresenterRef,
    lastPresenterPageRef,
    setSessionStatus,
    setQuickSettings,
    setUnlockSettings,
    code,
    deckId,
    triggerFocusHighlight,
  });

  // 이벤트 핸들러
  const { handleSelectEmoji, handlePlaceStamp, handleToggleShowStamps } =
    useAudienceEventHandlers({
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

  // 대기 화면 렌더링
  if (isSessionWaiting) {
    return <DelayAudience placeholderCount={totalPages || 10} />;
  }

  return (
    <PageContainer>
      {/* 왼쪽 슬라이드 바 */}
      <SidebarSlides
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
          <EmojiPanel
            selectedId={selectedEmoji?.id}
            onSelect={handleSelectEmoji}
          />
        )}
      </CenterContainer>
      {/* 오른쪽 AudiencePanel */}
      <RightPanelContainer>
        <AudiencePanel
          currentSlide={currentSlide}
          onSelectSlide={handleAudienceSelectSlide}
          questions={questions}
          questionsLoading={questionsLoading}
          questionsError={questionsError}
          isWaiting={isQuestionListWaiting}
          waitingMessage={
            isQuestionListWaiting ? "질문을 불러오는 중입니다." : undefined
          }
          onSubmitQuestion={submitQuestion}
          canSubmit={isWebsocketReady && reactionsReady}
          isLocked={!quickSettings.question}
        />
      </RightPanelContainer>
    </PageContainer>
  );
};

export default AudienceViewPage;
