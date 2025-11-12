import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import emoji1Black from "../../assets/images/emoji1_black.svg";

const AudienceViewPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();

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
  const [showFocusHighlight, setShowFocusHighlight] = useState(false);
  const [sessionStatus, setSessionStatus] = useState("waiting"); // 기본값은 waiting

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

  const questionSubscriptionsRef = useRef([]);
  const pageChangeUnsubscribeRef = useRef(null);
  const focusOnUnsubscribeRef = useRef(null);
  const optionUnsubscribeRef = useRef(null);
  const unlockUnsubscribeRef = useRef(null);
  const sessionStateUnsubscribeRef = useRef(null);
  const endUnsubscribeRef = useRef(null);
  const followPresenterRef = useRef(followPresenter);
  const prevSlideRef = useRef(0);
  const lastPresenterPageRef = useRef(0);
  const focusHighlightTimeoutRef = useRef(null);
  const hasNavigatedToRatingRef = useRef(false);

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
    (
      nextIndex,
      {
        source = "audience",
        broadcast = true,
        preserveFollowState = false,
      } = {}
    ) => {
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

      if (!preserveFollowState && source !== "presenter") {
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
        }

        if (joinData.totalPages !== undefined && joinData.totalPages !== null) {
          setTotalPages(Number(joinData.totalPages));
        } else if (joinData.deck?.totalPages) {
          setTotalPages(Number(joinData.deck.totalPages));
        } else if (joinData.presentation?.totalPages) {
          setTotalPages(Number(joinData.presentation.totalPages));
        }

        // 세션 상태 설정 (joinRoom 응답에서 받은 값 또는 기본값 "waiting")
        if (joinData.sessionStatus) {
          setSessionStatus(joinData.sessionStatus);
        } else {
          setSessionStatus("waiting");
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
      setIsWebsocketReady(true);
    };

    const onError = () => {
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
          return;
        }

        const newSlideIndex = Number(data.changedPage);
        if (Number.isFinite(newSlideIndex)) {
          lastPresenterPageRef.current = newSlideIndex;
        }

        if (!followPresenterRef.current) {
          return;
        }

        changeCurrentSlide(newSlideIndex, {
          source: "presenter",
          broadcast: false,
          preserveFollowState: true,
        });
      }
    );

    // 🔹 옵션 변경 구독 (리액션 스티커, 질문, 실시간 피드백)
    const optionTopic = `/topic/presentation/${roomId}/option`;
    optionUnsubscribeRef.current = websocketService.subscribe(
      optionTopic,
      (data) => {
        if (data) {
          const payload = data?.data ?? data;
          const normalized = {
            sticker: String(payload?.sticker) === "true",
            question: String(payload?.question) === "true",
            feedback: String(payload?.feedback) === "true",
          };

          setQuickSettings(normalized);
        }
      }
    );

    // 🔹 다음 슬라이드 공개 옵션 구독
    const unlockTopic = `/topic/presentation/${roomId}/option/unlock`;
    unlockUnsubscribeRef.current = websocketService.subscribe(
      unlockTopic,
      (data) => {
        if (data) {
          const payload = data?.data ?? data;
          const maxPage = Number(payload?.maxRevealedPage);
          const revealAll = String(payload?.revealAllSlides) === "true";
          const presenterPage = Number(payload?.presenterPage);

          setUnlockSettings({
            maxRevealedPage: maxPage,
            revealAllSlides: revealAll,
            totalPages: Number(payload?.totalPages),
            presenterPage,
          });
        }
      }
    );

    // 🔹 세션 상태 변경 구독
    const sessionStateTopic = `/topic/p/${roomId}/public`;
    sessionStateUnsubscribeRef.current = websocketService.subscribe(
      sessionStateTopic,
      (data) => {
        if (data && data.type === "SESSION_STATE" && data.status) {
          setSessionStatus(data.status);
        }
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

      optionUnsubscribeRef.current?.();
      optionUnsubscribeRef.current = null;

      unlockUnsubscribeRef.current?.();
      unlockUnsubscribeRef.current = null;

      sessionStateUnsubscribeRef.current?.();
      sessionStateUnsubscribeRef.current = null;
    };
  }, [
    isWebsocketReady,
    roomId,
    audienceId,
    handleIncomingQuestion,
    questionTopics,
    changeCurrentSlide,
    currentSlide,
  ]);

  useEffect(() => {
    focusOnUnsubscribeRef.current?.();
    focusOnUnsubscribeRef.current = null;

    if (!isWebsocketReady || !roomId || !websocketService.getIsConnected()) {
      return undefined;
    }

    const topic = `/topic/presentation/${roomId}/focusOn`;
    const unsubscribe = websocketService.subscribeText(topic, (rawMessage) => {
      if (rawMessage == null) {
        return;
      }

      const trimmed = String(rawMessage).trim();
      if (!trimmed) {
        return;
      }

      let parsedNumber;
      try {
        parsedNumber = Number(JSON.parse(trimmed));
        if (!Number.isFinite(parsedNumber)) {
          throw new Error("NaN");
        }
      } catch (error) {
        parsedNumber = Number(trimmed.replace(/^"+|"+$/g, ""));
      }

      if (!Number.isFinite(parsedNumber) || parsedNumber < 0) {
        return;
      }

      lastPresenterPageRef.current = parsedNumber;

      if (!followPresenterRef.current) {
        setFollowPresenter(true);
        followPresenterRef.current = true;
      }

      setShowFocusHighlight(true);
      if (focusHighlightTimeoutRef.current) {
        clearTimeout(focusHighlightTimeoutRef.current);
      }
      focusHighlightTimeoutRef.current = setTimeout(() => {
        setShowFocusHighlight(false);
        focusHighlightTimeoutRef.current = null;
      }, 1000);

      changeCurrentSlide(parsedNumber, {
        source: "focusOn",
        broadcast: true,
        preserveFollowState: true,
      });
    });

    focusOnUnsubscribeRef.current = unsubscribe;

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
      focusOnUnsubscribeRef.current = null;
    };
  }, [isWebsocketReady, roomId, changeCurrentSlide]);

  useEffect(() => {
    endUnsubscribeRef.current?.();
    endUnsubscribeRef.current = null;

    if (
      !isWebsocketReady ||
      !roomId ||
      !websocketService.getIsConnected()
    ) {
      return undefined;
    }

    const topic = `/topic/presentation/${roomId}/end`;
    const unsubscribe = websocketService.subscribeText(topic, (rawMessage) => {
      if (rawMessage == null || hasNavigatedToRatingRef.current) {
        return;
      }

      const trimmed = String(rawMessage).trim().toLowerCase();
      if (!trimmed) {
        return;
      }

      if (trimmed === "end" || trimmed.includes("end")) {
        hasNavigatedToRatingRef.current = true;
        const targetUrl = code
          ? `/rating/${encodeURIComponent(code)}`
          : "/rating";
        navigate(targetUrl, { replace: false });
      }
    });

    endUnsubscribeRef.current = unsubscribe;

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
      endUnsubscribeRef.current = null;
    };
  }, [isWebsocketReady, roomId, code, navigate]);

  useEffect(() => {
    return () => {
      if (focusHighlightTimeoutRef.current) {
        clearTimeout(focusHighlightTimeoutRef.current);
        focusHighlightTimeoutRef.current = null;
      }
    };
  }, []);

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

    if (selectedEmoji.id >= 1 && selectedEmoji.id <= 8) {
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

    if (checked) {
      const target = Number.isFinite(lastPresenterPageRef.current)
        ? lastPresenterPageRef.current
        : prevSlideRef.current;

      changeCurrentSlide(target, {
        source: "presenter",
        broadcast: false,
        preserveFollowState: true,
      });
    }
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

  const isSessionWaiting = sessionStatus === "waiting";

  // 대기 화면 렌더링
  if (isSessionWaiting) {
    return (
      <PageContainer>
        <CenterContainer
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3vh",
          }}
        >
          <img
            src={emoji1Black}
            alt="대기 중"
            style={{
              width: "10vw",
              height: "10vw",
              maxWidth: "120px",
              maxHeight: "120px",
            }}
          />
          <div
            style={{
              fontSize: "clamp(14px, 1.2vw, 18px)",
              color: "#5c5c5c",
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 500,
            }}
          >
            현재 라이브 대기 중입니다.
          </div>
        </CenterContainer>
      </PageContainer>
    );
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
