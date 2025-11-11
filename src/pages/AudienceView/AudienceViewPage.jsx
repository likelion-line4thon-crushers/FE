import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { joinRoom } from "../../services/roomService";
import websocketService, {
  WebSocketService,
} from "../../services/websocketService";
import { fetchAllOriginalSlideUrls } from "../../services/presentationService";
import useAudienceQuestions from "../../hooks/useAudienceQuestions";
import useEmojiReactions from "../../hooks/useEmojiReactions";
import SELECTED_EMOJI_ICONS from "../../constants/emojiIcons";

const AudienceViewPage = () => {
  const { code } = useParams();

  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [followPresenter, setFollowPresenter] = useState(true);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [showStamps, setShowStamps] = useState(true);
  const [roomId, setRoomId] = useState(null);
  const [audienceId, setAudienceId] = useState(null);
  const [audienceToken, setAudienceToken] = useState(null);
  const [wsUrl, setWsUrl] = useState(null);
  const [deckId, setDeckId] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingSlides, setLoadingSlides] = useState(false);
  const [slidesError, setSlidesError] = useState(null);
  const [isWebsocketReady, setIsWebsocketReady] = useState(false);

  const questionSubscriptionsRef = useRef([]);
  const pageChangeUnsubscribeRef = useRef(null);
  const followPresenterRef = useRef(followPresenter);
  const prevSlideRef = useRef(0);

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

  const slideCount = slides.length;

  const changeCurrentSlide = useCallback(
    (nextIndex, { source = "audience", broadcast = true } = {}) => {
      setCurrentSlide((prev) => {
        if (!Number.isFinite(nextIndex)) {
          return prev;
        }

        const maxIndex = Math.max(slideCount - 1, 0);
        const clamped = Math.min(Math.max(nextIndex, 0), maxIndex);

        if (clamped === prev) {
          return prev;
        }

        if (
          broadcast &&
          roomId &&
          audienceId &&
          websocketService.getIsConnected()
        ) {
          const beforePage = prev + 1;
          const changedPage = clamped + 1;

          websocketService.sendAudiencePageChange(
            roomId,
            audienceId,
            beforePage,
            changedPage
          );
        }

        prevSlideRef.current = clamped;
        return clamped;
      });

      if (source !== "presenter") {
        setFollowPresenter(false);
      }
    },
    [slideCount, roomId, audienceId]
  );

  const loadSlides = useCallback(
    async ({ signal } = {}) => {
      if (!roomId || !deckId || !totalPages) return;
      if (signal?.aborted) return;

      setLoadingSlides(true);
      setSlidesError(null);

      try {
        const urls = await fetchAllOriginalSlideUrls(
          roomId,
          deckId,
          totalPages
        );

        if (signal?.aborted) return;
        setSlides(urls);
      } catch (error) {
        if (signal?.aborted) return;
        console.error("[AudienceViewPage] 슬라이드 URL 불러오기 실패:", error);
        setSlidesError(error);
      } finally {
        if (signal?.aborted) return;
        setLoadingSlides(false);
      }
    },
    [roomId, deckId, totalPages]
  );

  useEffect(() => {
    followPresenterRef.current = followPresenter;
  }, [followPresenter]);

  useEffect(() => {
    if (!code) return;

    const handleJoinRoom = async () => {
      try {
        const joinData = await joinRoom(code);

        window.roomId = joinData.roomId;
        window.audienceId = joinData.audienceId;
        window.audienceToken = joinData.audienceToken;

        setRoomId(joinData.roomId);
        setAudienceId(joinData.audienceId);
        setAudienceToken(joinData.audienceToken);

        if (joinData.deckId || joinData.deckID) {
          setDeckId(joinData.deckId || joinData.deckID);
        } else if (joinData.deck?.deckId) {
          setDeckId(joinData.deck.deckId);
        } else if (joinData.presentation?.deckId) {
          setDeckId(joinData.presentation.deckId);
        } else {
          console.warn(
            "[AudienceViewPage] deckId가 응답에 없습니다:",
            joinData
          );
        }

        if (joinData.totalPages !== undefined && joinData.totalPages !== null) {
          setTotalPages(Number(joinData.totalPages));
        } else if (joinData.deck?.totalPages) {
          setTotalPages(Number(joinData.deck.totalPages));
        } else if (joinData.presentation?.totalPages) {
          setTotalPages(Number(joinData.presentation.totalPages));
        } else {
          console.warn(
            "[AudienceViewPage] totalPages가 응답에 없습니다:",
            joinData
          );
        }

        let wsUrlValue = joinData.wsUrl;

        if (!wsUrlValue) {
          const apiBaseUrl =
            import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
          wsUrlValue = `${apiBaseUrl}/ws/audience`;
        } else {
          if (wsUrlValue.includes(",")) {
            wsUrlValue = wsUrlValue.split(",")[0].trim();
          }

          if (!wsUrlValue.endsWith("/audience")) {
            wsUrlValue = wsUrlValue.replace(/\/ws\/?$/, "/ws/audience");
          }
        }

        setWsUrl(wsUrlValue);
      } catch (err) {
        console.error("방 입장 실패:", err);
        alert("방 입장에 실패했습니다. 코드를 확인해주세요.");
      }
    };

    handleJoinRoom();
  }, [code]);

  useEffect(() => {
    if (!roomId || !deckId || !totalPages) return;

    const controller = new AbortController();
    loadSlides({ signal: controller.signal });

    return () => {
      controller.abort();
    };
  }, [roomId, deckId, totalPages, loadSlides]);

  useEffect(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => {
      const next =
        prev >= slides.length ? slides.length - 1 : prev < 0 ? 0 : prev;
      prevSlideRef.current = next;
      return next;
    });
  }, [slides]);

  useEffect(() => {
    if (!roomId || !audienceId || !wsUrl || !audienceToken) {
      return undefined;
    }

    setIsWebsocketReady(false);

    const onConnect = () => {
      console.log("[AudienceViewPage] 웹소켓 연결 성공");
      setIsWebsocketReady(true);
    };

    const onError = (error) => {
      console.error("[AudienceViewPage] 웹소켓 연결 실패:", error);
      setIsWebsocketReady(false);
    };

    websocketService.connect(wsUrl, audienceToken, onConnect, onError);

    return () => {
      setIsWebsocketReady(false);
      websocketService.disconnect();
    };
  }, [roomId, audienceId, wsUrl, audienceToken]);

  useEffect(() => {
    questionSubscriptionsRef.current.forEach((unsubscribe) => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    });
    questionSubscriptionsRef.current = [];

    pageChangeUnsubscribeRef.current?.();
    pageChangeUnsubscribeRef.current = null;

    if (!isWebsocketReady || !roomId) {
      return undefined;
    }

    const topics = Array.isArray(questionTopics) ? questionTopics : [];

    topics.forEach((topic) => {
      const unsubscribe = websocketService.subscribe(
        topic,
        handleIncomingQuestion
      );
      if (typeof unsubscribe === "function") {
        questionSubscriptionsRef.current.push(unsubscribe);
      }
    });

    const pageChangeTopic = `/topic/presentation/${roomId}/pageChange`;
    pageChangeUnsubscribeRef.current = websocketService.subscribe(
      pageChangeTopic,
      (data) => {
        if (!data || data.changedPage === undefined) {
          console.warn("[Audience] 잘못된 페이지 변경 데이터:", data);
          return;
        }

        if (!followPresenterRef.current) {
          return;
        }

        const newSlideIndex = Number(data.changedPage);
        changeCurrentSlide(newSlideIndex, {
          source: "presenter",
          broadcast: false,
        });
      }
    );

    return () => {
      questionSubscriptionsRef.current.forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      });
      questionSubscriptionsRef.current = [];

      pageChangeUnsubscribeRef.current?.();
      pageChangeUnsubscribeRef.current = null;
    };
  }, [
    isWebsocketReady,
    roomId,
    audienceId,
    handleIncomingQuestion,
    questionTopics,
    changeCurrentSlide,
  ]);

  // 🔹 방향키로 슬라이드 이동
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        // 이전 슬라이드
        changeCurrentSlide(currentSlide - 1, { source: "audience" });
      } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        // 다음 슬라이드
        changeCurrentSlide(currentSlide + 1, { source: "audience" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSlide, changeCurrentSlide]);

  const handleSelectEmoji = (emoji) => setSelectedEmoji(emoji);

  const handlePlaceStamp = ({ xPct, yPct }) => {
    if (!selectedEmoji || !reactionsReady || !roomId || !audienceId || !wsUrl) {
      return;
    }

    if (selectedEmoji.id >= 1 && selectedEmoji.id <= 6) {
      const now = new Date().toISOString();

      const destination = `/app/presentation/${roomId}/reaction`;
      const message = {
        emoji: selectedEmoji.id,
        audienceID: audienceId,
        created_at: now,
        x: xPct,
        y: yPct,
        slide: currentSlide + 1,
      };

      websocketService.send(destination, message);
      console.log("[WebSocket] 이모지 반응 전송:", message);

      const stickerSrc = SELECTED_EMOJI_ICONS[selectedEmoji.id];
      if (stickerSrc) {
        addLocalStamp(currentSlide, {
          id: now,
          xPct,
          yPct,
          src: stickerSrc,
        });
      }
    }
  };

  const handleToggleFollowPresenter = (checked) => {
    setFollowPresenter(checked);
  };

  const handleToggleShowStamps = (nextValue) => {
    setShowStamps(nextValue);
  };

  const handleAudienceSelectSlide = (slideIndex, options) => {
    changeCurrentSlide(slideIndex, { source: "audience", ...options });
  };

  const handleRetryFetchSlides = () => {
    if (!roomId || !deckId || !totalPages) return;
    loadSlides();
  };

  const isSlidesLoading = loadingSlides && slides.length === 0;
  const hasSlidesError = !loadingSlides && !!slidesError && slides.length === 0;
  const showSlidesPlaceholder = isSlidesLoading || hasSlidesError;
  const waitingMessage = hasSlidesError
    ? "슬라이드를 불러오는 중 오류가 발생했습니다."
    : "슬라이드를 불러오는 중입니다.";
  const isQuestionListWaiting = questionsLoading && questions.length === 0;

  return (
    <PageContainer>
      {/* 왼쪽 슬라이드 바 */}
      <SidebarSlides
        slides={slides}
        currentSlide={currentSlide}
        setCurrentSlide={handleAudienceSelectSlide}
        isWaiting={showSlidesPlaceholder}
        placeholderCount={totalPages || 10}
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
        <EmojiPanel
          selectedId={selectedEmoji?.id}
          onSelect={handleSelectEmoji}
        />
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
        />
      </RightPanelContainer>
    </PageContainer>
  );
};

export default AudienceViewPage;
