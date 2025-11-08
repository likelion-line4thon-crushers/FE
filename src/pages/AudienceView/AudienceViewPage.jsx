import React, { useState, useEffect, useCallback, useRef } from "react";
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
import websocketService from "../../services/websocketService";
import { fetchAllOriginalSlideUrls } from "../../services/presentationService";
import { fetchRoomQuestions } from "../../services/questionService";
import interestSelected from "../../assets/icons/Emoji_selected/Interesting_selected.png";
import surpriseSelected from "../../assets/icons/Emoji_selected/surprising_selected.png";
import curiousSelected from "../../assets/icons/Emoji_selected/curious_selected.png";
import excitingSelected from "../../assets/icons/Emoji_selected/Exciting_selected.png";
import angrySelected from "../../assets/icons/Emoji_selected/angry_selected.png";
import sadSelected from "../../assets/icons/Emoji_selected/Sad_selected.png";

const normalizeQuestion = (rawQuestion) => {
  if (!rawQuestion || typeof rawQuestion !== "object") return null;

  const id = rawQuestion.id ?? rawQuestion.questionId;
  if (!id) return null;

  const slideRaw =
    rawQuestion.slide ??
    (typeof rawQuestion.slideIndex === "number"
      ? rawQuestion.slideIndex + 1
      : undefined);
  const slideNumber = Number(slideRaw);
  const slide =
    Number.isFinite(slideNumber) && slideNumber > 0 ? slideNumber : 1;

  const tsRaw = rawQuestion.ts ?? rawQuestion.timestamp ?? Date.now();
  const tsNumber = Number(tsRaw);
  const ts = Number.isFinite(tsNumber) ? tsNumber : Date.now();

  return {
    id,
    roomId: rawQuestion.roomId ?? null,
    slide,
    audienceId: rawQuestion.audienceId ?? rawQuestion.userId ?? null,
    content: rawQuestion.content ?? rawQuestion.text ?? "",
    ts,
  };
};

const sortQuestionsAsc = (questions) =>
  [...questions].sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));

const upsertQuestion = (questions, incoming) => {
  if (!incoming) return questions;

  const next = [...questions];
  const existingIndex = next.findIndex((item) => item.id === incoming.id);

  if (existingIndex >= 0) {
    next[existingIndex] = incoming;
  } else {
    next.push(incoming);
  }

  return sortQuestionsAsc(next);
};

const buildQuestionTopics = (roomId) => {
  if (!roomId) return [];

  const topics = [`/topic/p/${roomId}/public`, `/topic/p/${roomId}/presenter`];

  return [...new Set(topics)];
};

const AudienceViewPage = () => {
  const { code } = useParams();

  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [followPresenter, setFollowPresenter] = useState(true);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [stampsBySlide, setStampsBySlide] = useState({});
  const [showStamps, setShowStamps] = useState(true);
  const [roomId, setRoomId] = useState(null);
  const [audienceId, setAudienceId] = useState(null);
  const [wsUrl, setWsUrl] = useState(null);
  const [deckId, setDeckId] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingSlides, setLoadingSlides] = useState(false);
  const [slidesError, setSlidesError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState(null);
  const [isWebsocketReady, setIsWebsocketReady] = useState(false);
  const questionSubscriptionsRef = useRef([]);

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

  // 코드로 방 입장 처리
  useEffect(() => {
    if (code) {
      const handleJoinRoom = async () => {
        try {
          const joinData = await joinRoom(code);

          window.roomId = joinData.roomId;
          window.audienceId = joinData.audienceId;
          window.audienceToken = joinData.audienceToken;

          setRoomId(joinData.roomId);
          setAudienceId(joinData.audienceId);

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

          if (
            joinData.totalPages !== undefined &&
            joinData.totalPages !== null
          ) {
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
          }
          setWsUrl(wsUrlValue);
        } catch (err) {
          console.error("방 입장 실패:", err);
          alert("방 입장에 실패했습니다. 코드를 확인해주세요.");
        }
      };
      handleJoinRoom();
    }
  }, [code]);

  useEffect(() => {
    if (!roomId || !deckId || !totalPages) return;

    const controller = new AbortController();
    loadSlides({ signal: controller.signal });

    return () => {
      controller.abort();
    };
  }, [roomId, deckId, totalPages, loadSlides]);

  const fetchQuestionsFromApi = useCallback(
    async (options = {}) => {
      if (!roomId) return [];
      const list = await fetchRoomQuestions(roomId, options);
      return list;
    },
    [roomId]
  );

  useEffect(() => {
    if (!roomId) {
      setQuestions([]);
      setQuestionsLoading(false);
      setQuestionsError(null);
      return;
    }

    let cancelled = false;
    setQuestions([]);
    setQuestionsLoading(true);
    setQuestionsError(null);

    fetchQuestionsFromApi()
      .then((list) => {
        if (cancelled) return;
        const normalized = list.map(normalizeQuestion).filter(Boolean);
        setQuestions(sortQuestionsAsc(normalized));
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("[AudienceViewPage] 질문 목록 불러오기 실패:", error);
        setQuestionsError(error);
      })
      .finally(() => {
        if (!cancelled) {
          setQuestionsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [roomId, fetchQuestionsFromApi]);

  useEffect(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => {
      if (prev >= slides.length) {
        return slides.length - 1;
      }
      if (prev < 0) {
        return 0;
      }
      return prev;
    });
  }, [slides]);

  const handleQuestionMessage = useCallback((payload) => {
    const raw = payload?.data ?? payload;
    const normalized = normalizeQuestion(raw);
    if (!normalized) return;

    setQuestions((prev) => {
      const next = upsertQuestion(prev, normalized);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!roomId || !audienceId || !wsUrl || !window.audienceToken) return;

    setIsWebsocketReady(false);

    const connectWebSocket = () => {
      websocketService.connect(
        wsUrl,
        window.audienceToken,
        () => {
          console.log("[WebSocket] 연결 성공");
          setIsWebsocketReady(true);

          // 기존 질문 구독 제거 후 재설정
          questionSubscriptionsRef.current.forEach((unsubscribe) => {
            if (typeof unsubscribe === "function") {
              unsubscribe();
            }
          });
          questionSubscriptionsRef.current = [];

          const questionTopics = buildQuestionTopics(roomId);
          questionTopics.forEach((topic) => {
            const unsubscribe = websocketService.subscribe(
              topic,
              handleQuestionMessage
            );
            if (typeof unsubscribe === "function") {
              questionSubscriptionsRef.current.push(unsubscribe);
            }
          });

          // 다른 청중의 이모지 반응 구독
          const reactionTopic = `/topic/presentation/${roomId}/reactions`;
          websocketService.subscribe(reactionTopic, (data) => {
            // 다른 청중이 보낸 이모지 반응 처리
            if (data && data.emoji && data.slide !== undefined) {
              const slideIndex = data.slide - 1;
              const emojiId = data.emoji;

              const emojiIcons = {
                1: interestSelected,
                2: surpriseSelected,
                3: curiousSelected,
                4: excitingSelected,
                5: angrySelected,
                6: sadSelected,
              };

              const emojiSrc = emojiIcons[emojiId];
              if (emojiSrc) {
                // x, y 좌표를 퍼센트로 변환

                const xPct = data.x;
                const yPct = data.y;

                setStampsBySlide((prev) => {
                  const next = { ...prev };
                  const key = String(slideIndex);
                  const list = next[key] ? [...next[key]] : [];
                  list.push({ xPct, yPct, src: emojiSrc });
                  next[key] = list;
                  return next;
                });
              }
            }
          });
        },
        (error) => {
          console.error("[WebSocket] 연결 실패:", error);
          setIsWebsocketReady(false);
        }
      );
    };

    connectWebSocket();

    return () => {
      questionSubscriptionsRef.current.forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      });
      questionSubscriptionsRef.current = [];
      setIsWebsocketReady(false);
      websocketService.disconnect();
    };
  }, [roomId, audienceId, wsUrl, handleQuestionMessage]);

  const handleSelectEmoji = (emoji) => setSelectedEmoji(emoji);

  const handlePlaceStamp = ({ xPct, yPct }) => {
    if (!selectedEmoji) return;

    if (
      selectedEmoji.id >= 1 &&
      selectedEmoji.id <= 6 &&
      roomId &&
      audienceId
    ) {
      const now = new Date().toISOString();

      // 웹소켓으로 이모지 반응 전송
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
    }

    // 로컬 상태에도 추가
    setStampsBySlide((prev) => {
      const next = { ...prev };
      const key = String(currentSlide);
      const list = next[key] ? [...next[key]] : [];
      list.push({ xPct, yPct, src: selectedEmoji.selectedIcon });
      next[key] = list;
      return next;
    });
  };

  const handleSubmitQuestion = useCallback(
    async (content) => {
      const trimmed = (content ?? "").trim();
      if (!trimmed) {
        throw new Error("질문 내용을 입력해 주세요.");
      }

      if (!roomId || !audienceId) {
        throw new Error("방 정보를 찾을 수 없습니다.");
      }

      if (!websocketService.getIsConnected()) {
        throw new Error("연결 상태를 확인한 후 다시 시도해 주세요.");
      }

      const payload = {
        audienceId,
        slide: currentSlide + 1,
        content: trimmed,
        ts: Date.now(),
      };

      const destination = `/app/p/${roomId}/question.create`;

      try {
        websocketService.send(destination, payload);
      } catch (error) {
        console.error("[WebSocket] 질문 전송 실패:", error);
        throw new Error("질문 전송 중 오류가 발생했습니다.");
      }
    },
    [roomId, audienceId, currentSlide]
  );

  const handleToggleFollowPresenter = (checked) => {
    setFollowPresenter(checked);
  };

  const handleToggleShowStamps = (nextValue) => {
    setShowStamps(nextValue);
  };

  const handleAudienceSelectSlide = (slideIndex) => {
    setFollowPresenter(false);
    setCurrentSlide(slideIndex);
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
        setCurrentSlide={setCurrentSlide}
        isWaiting={showSlidesPlaceholder}
        placeholderCount={totalPages || 10}
      />
      <CenterContainer>
        <SlideViewer
          slides={slides}
          currentSlide={currentSlide}
          cursorImage={selectedEmoji?.selectedIcon}
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
          onSubmitQuestion={handleSubmitQuestion}
          canSubmit={isWebsocketReady}
        />
      </RightPanelContainer>
    </PageContainer>
  );
};

export default AudienceViewPage;
