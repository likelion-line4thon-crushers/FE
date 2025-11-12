// src/pages/Presentation/PresenterViewPage.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useLocation, useParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import SidebarSlides from "../../components/SidebarSlides";
import SlideViewer from "../../components/SlideViewer";
import QuestionList from "../../components/QuestionList";
import {
  fetchAllOriginalSlideUrls,
  fetchAudienceSlideStats,
} from "../../services/presentationService";
import websocketService from "../../services/websocketService";
import useEmojiReactions from "../../hooks/useEmojiReactions";
import { WebSocketService } from "../../services/websocketService";
import usePresenterQuestions from "../../hooks/usePresenterQuestions";
import useQuickSettingsStorage from "../../hooks/useQuickSettingsStorage";
import useStickerLoader from "../../hooks/useStickerLoader";

// SettingsPanel 스타일 재사용
import {
  PanelWrapper,
  Section,
  Title,
  QuickTogglesGrid,
  ToggleBox,
  ToggleLabel,
  ToggleDescription,
  ToggleInput,
} from "../../components/SettingsPanel/SettingsPanel.styles";
import { AudienceCount } from "../../components/SettingsPanel";

const PresenterViewPage = () => {
  const location = useLocation();
  const { roomId: roomIdParam } = useParams();

  const storedRoomData = useMemo(
    () =>
      JSON.parse(
        sessionStorage.getItem("boini_room") ||
          sessionStorage.getItem("roomData") ||
          "{}"
      ),
    []
  );

  const locationState = location.state || {};

  const roomId = roomIdParam || locationState.roomId || storedRoomData.roomId;
  const deckId = locationState.deckId || storedRoomData.deckId;
  const totalPages = locationState.totalPages || storedRoomData.totalPages || 0;
  const presenterToken =
    locationState.presenterToken || storedRoomData.presenterToken || null;

  const presenterWsUrl = useMemo(() => {
    const raw = locationState.wsUrl || storedRoomData.wsUrl || null;

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
      } catch (_error) {
        return null;
      }
    };

    const derived = deriveFromUrl(raw);
    if (derived) return derived;

    const apiBase =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const fallback = deriveFromUrl(apiBase);
    return fallback ?? "http://localhost:8080/ws/presenter";
  }, [locationState.wsUrl, storedRoomData.wsUrl]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideUrls, setSlideUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReactions, setShowReactions] = useState(true);
  const [showStampsInViewer, setShowStampsInViewer] = useState(true);
  const [isPresenterWsReady, setIsPresenterWsReady] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showFocusHighlight, setShowFocusHighlight] = useState(false);
  const [audienceStats, setAudienceStats] = useState({
    prev: 0,
    current: 0,
    next: 0,
  });
  const focusHighlightTimeoutRef = useRef(null);
  const audienceStatsControllerRef = useRef(null);

  // 🔹 빠른 설정 토글 상태 관리
  const [quickSettings, setQuickSettings] = useQuickSettingsStorage();
  const initialSettingsSyncedRef = useRef(false);

  const audienceCapacity = locationState.count ?? storedRoomData.count ?? 50;

  const initialAudienceCount = useMemo(() => {
    const candidate =
      locationState.audienceCount ?? storedRoomData.audienceCount ?? null;
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }

    if (!roomId) {
      return null;
    }

    try {
      const stored = sessionStorage.getItem(`boini_audience_count_${roomId}`);
      const parsed = Number(stored);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    } catch (_error) {
      // ignore storage read errors
    }

    return null;
  }, [locationState.audienceCount, roomId, storedRoomData.audienceCount]);

  const handleToggleShowReactions = (nextValue) => {
    setShowReactions(nextValue);
  };

  const handleToggleShowStampsInViewer = (nextValue) => {
    setShowStampsInViewer(nextValue);
  };

  const handleFocusOn = useCallback(() => {
    if (!roomId) {
      return;
    }

    if (!isPresenterWsReady || !websocketService.getIsConnected()) {
      return;
    }

    websocketService.sendFocusOn(roomId);

    setShowFocusHighlight(true);
    if (focusHighlightTimeoutRef.current) {
      clearTimeout(focusHighlightTimeoutRef.current);
    }
    focusHighlightTimeoutRef.current = setTimeout(() => {
      setShowFocusHighlight(false);
      focusHighlightTimeoutRef.current = null;
    }, 1000);
  }, [roomId, isPresenterWsReady]);

  // 🔹 옵션 변경 핸들러 (리액션 스티커, 질문, 실시간 피드백)
  const handleOptionChange = useCallback(
    (optionKey, value) => {
      setQuickSettings((prev) => {
        const newSettings = { ...prev, [optionKey]: value };

        // unlock 옵션이 아닌 경우만 sendOptionChange 호출
        if (optionKey !== "unlock") {
          // 웹소켓으로 전송
          if (roomId && websocketService.getIsConnected()) {
            const options = {
              sticker: newSettings.sticker,
              question: newSettings.question,
              feedback: newSettings.feedback,
            };
            websocketService.sendOptionChange(roomId, options);
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

      // 웹소켓으로 전송
      if (roomId && websocketService.getIsConnected()) {
        const unlock = value ? "true" : "false";
        websocketService.sendUnlockChange(roomId, unlock);
      }
    },
    [roomId]
  );

  // 타이머 (페이지 마운트 시 시작)
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // 타이머 포맷팅 (MM:SS)
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const presenterSocketService = useMemo(() => new WebSocketService(), []);
  const {
    stampsBySlide: reactionStamps,
    isReady: reactionsReady,
    addLocalStamp,
  } = useEmojiReactions({
    sessionId: roomId,
    token: presenterToken,
    wsUrl: presenterWsUrl,
    enabled: Boolean(roomId && presenterToken && presenterWsUrl),
    disconnectOnUnmount: true,
    service: presenterSocketService,
  });

  const currentReactionStamps = reactionStamps[String(currentSlide)] || [];

  // 🔹 새로고침 시 스티커 로드 (커스텀 훅 사용)
  useStickerLoader({
    roomId,
    addLocalStamp,
    reactionsReady,
    prefix: "Presenter loadStickers",
  });

  const {
    questions: presenterQuestions,
    questionsLoading,
    questionsError,
  } = usePresenterQuestions({
    roomId,
    enabled: Boolean(roomId),
    subscribe: Boolean(roomId && isPresenterWsReady),
  });

  // 서버에서 presigned URL 하나씩 가져와서 썸네일로 사용
  const currentSlideRef = useRef(0);

  useEffect(() => {
    currentSlideRef.current = currentSlide;
  }, [currentSlide]);

  const slideCount = slideUrls.length;

  useEffect(() => {
    if (!roomId) {
      return undefined;
    }

    const controller = new AbortController();

    if (audienceStatsControllerRef.current) {
      audienceStatsControllerRef.current.abort();
    }

    audienceStatsControllerRef.current = controller;

    const loadAudienceStats = async () => {
      try {
        const stats = await fetchAudienceSlideStats({
          roomId,
          page: currentSlide,
          signal: controller.signal,
        });
        setAudienceStats((prevStats) => ({
          prev: Number.isFinite(stats?.prev) ? stats.prev : prevStats.prev,
          current: Number.isFinite(stats?.current)
            ? stats.current
            : prevStats.current,
          next: Number.isFinite(stats?.next) ? stats.next : prevStats.next,
        }));
      } catch (error) {
        if (
          error?.name === "CanceledError" ||
          error?.name === "AbortError" ||
          error?.code === "ERR_CANCELED"
        ) {
          return;
        }
      } finally {
        if (audienceStatsControllerRef.current === controller) {
          audienceStatsControllerRef.current = null;
        }
      }
    };

    loadAudienceStats();

    return () => {
      controller.abort();
    };
  }, [roomId, currentSlide]);

  const changeSlide = useCallback(
    (nextIndex, { broadcast = true } = {}) => {
      setCurrentSlide((prev) => {
        if (!Number.isFinite(nextIndex)) {
          return prev;
        }

        const maxIndex = Math.max(slideCount - 1, 0);
        const clamped = Math.min(Math.max(nextIndex, 0), maxIndex);

        if (clamped === prev) {
          return prev;
        }

        if (broadcast && roomId && websocketService.getIsConnected()) {
          websocketService.sendPageChange(roomId, prev, clamped);
        }

        currentSlideRef.current = clamped;
        return clamped;
      });
    },
    [slideCount, roomId]
  );

  useEffect(() => {
    if (!roomId || !deckId || !totalPages) {
      setLoading(false);
      return;
    }

    const fetchSlides = async () => {
      try {
        const urls = await fetchAllOriginalSlideUrls(
          roomId,
          deckId,
          totalPages
        );

        // CreateSessionPage와 동일하게, URL 문자열 배열을 그대로 사용합니다.
        setSlideUrls(urls);
      } catch (_error) {
        setSlideUrls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, [roomId, deckId, totalPages]);

  useEffect(() => {
    if (!roomId || !presenterToken || !presenterWsUrl) {
      return undefined;
    }

    const onConnect = () => {
      setIsPresenterWsReady(true);
      websocketService.sendPageChange(
        roomId,
        currentSlideRef.current,
        currentSlideRef.current
      );
    };

    const onError = () => {
      setIsPresenterWsReady(false);
    };

    websocketService.connect(
      presenterWsUrl,
      presenterToken,
      onConnect,
      onError
    );

    return () => {
      setIsPresenterWsReady(false);
      websocketService.disconnect();
    };
  }, [roomId, presenterToken, presenterWsUrl]);

  useEffect(() => {
    if (!roomId || !presenterToken || !presenterWsUrl) {
      return undefined;
    }

    if (!websocketService.getIsConnected()) {
      return undefined;
    }

    const unsubscribe = websocketService.subscribe(
      `/topic/presentation/${roomId}/pageChange/audience`,
      (data) => {
        const nextSlide = Number(data?.changedPage);
        if (Number.isFinite(nextSlide)) {
          changeSlide(nextSlide, { broadcast: false });
        }
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [roomId, presenterToken, presenterWsUrl, changeSlide]);

  useEffect(() => {
    return () => {
      if (focusHighlightTimeoutRef.current) {
        clearTimeout(focusHighlightTimeoutRef.current);
      }
    };
  }, []);

  // 🔹 방향키로 슬라이드 이동
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        // 이전 슬라이드
        changeSlide(currentSlide - 1);
      } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        // 다음 슬라이드
        changeSlide(currentSlide + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSlide, changeSlide]);

  const handleSelectQuestionSlide = useCallback(
    (slideIndex) => {
      changeSlide(slideIndex, { broadcast: true });
    },
    [changeSlide]
  );

  // 🔹 빠른 설정을 sessionStorage에 저장
  useEffect(() => {
    try {
      sessionStorage.setItem(
        QUICK_SETTINGS_STORAGE_KEY,
        JSON.stringify(quickSettings)
      );
    } catch (_error) {
      // ignore storage write failures
    }
  }, [quickSettings]);

  // 🔹 리액션 표시 상태를 빠른 설정과 동기화
  useEffect(() => {
    setShowReactions(quickSettings.sticker);
    setShowStampsInViewer(quickSettings.sticker);
  }, [quickSettings.sticker]);

  // 🔹 웹소켓 연결 후 저장된 빠른 설정 동기화
  useEffect(() => {
    if (
      initialSettingsSyncedRef.current ||
      !roomId ||
      !isPresenterWsReady ||
      !websocketService.getIsConnected()
    ) {
      return;
    }

    const options = {
      sticker: quickSettings.sticker,
      question: quickSettings.question,
      feedback: quickSettings.feedback,
    };
    websocketService.sendOptionChange(roomId, options);
    websocketService.sendUnlockChange(
      roomId,
      quickSettings.unlock ? "true" : "false"
    );
    initialSettingsSyncedRef.current = true;
  }, [roomId, isPresenterWsReady, quickSettings]);

  // ✅ 로딩 중일 때 표시
  if (loading) {
    return (
      <Layout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <p>슬라이드 로딩 중...</p>
        </div>
      </Layout>
    );
  }

  // 썸네일이 없을 때 표시
  if (!slideUrls.length) {
    // 이 부분을 slideUrls로 변경
    return (
      <Layout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <p>슬라이드를 불러올 수 없습니다.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* 🔹 좌측: 슬라이드 썸네일 리스트 */}
      <SidebarSlides
        slides={slideUrls} // 이 부분을 slideUrls로 변경
        currentSlide={currentSlide}
        setCurrentSlide={changeSlide}
      />

      {/* 🔹 중앙: 현재 슬라이드 */}
      <SlideViewer
        slides={slideUrls} // 이 부분을 slideUrls로 변경
        currentSlide={currentSlide}
        setCurrentSlide={changeSlide}
        audienceStats={audienceStats}
        mode="present"
        stamps={showStampsInViewer ? currentReactionStamps : []}
        showReactions={showStampsInViewer}
        onToggleShowReactions={handleToggleShowStampsInViewer}
        onFocusClick={isPresenterWsReady ? handleFocusOn : undefined}
        focusHighlight={showFocusHighlight}
        timer={formatTimer(elapsedSeconds)}
      />

      {/* 🔹 우측: 빠른 설정 + 실시간 질문 */}
      <PanelWrapper>
        {/* === 빠른 설정 섹션 === */}
        <Section>
          <Title>빠른 설정</Title>
          <AudienceCount
            roomId={roomId}
            audienceCapacity={audienceCapacity}
            isWsReady={isPresenterWsReady}
            initialAudienceCount={initialAudienceCount}
          />

          <QuickTogglesGrid>
            <QuickSettingToggle
              label="리액션 스티커"
              description="청중이 리액션 스티커로 반응을 남길 수 있습니다."
              checked={quickSettings.sticker}
              onChange={(event) => {
                const newValue = event.target.checked;
                setShowReactions(newValue);
                handleOptionChange("sticker", newValue);
              }}
              disabled={!reactionsReady}
            />
            <QuickSettingToggle
              label="실시간 질문"
              description="청중이 실시간으로 질문을 남길 수 있습니다."
              checked={quickSettings.question}
              onChange={(event) =>
                handleOptionChange("question", event.target.checked)
              }
            />
            <QuickSettingToggle
              label="실시간 피드백"
              description="수집된 청중의 반응을 실시간으로 분석합니다."
              checked={quickSettings.feedback}
              onChange={(event) =>
                handleOptionChange("feedback", event.target.checked)
              }
            />
            <QuickSettingToggle
              label="다음 슬라이드 공개"
              description="청중이 다음 슬라이드 화면들을 미리 볼 수 있습니다."
              checked={quickSettings.unlock}
              onChange={(event) => handleUnlockChange(event.target.checked)}
            />
          </QuickTogglesGrid>
        </Section>

        {/* === 실시간 질문 섹션 === */}
        <Section>
          <Title>실시간 질문</Title>
          <QuestionList
            questions={presenterQuestions}
            loading={questionsLoading}
            error={questionsError}
            currentSlide={currentSlide}
            onSelectSlide={handleSelectQuestionSlide}
          />
        </Section>
      </PanelWrapper>
    </Layout>
  );
};

export default PresenterViewPage;

// 빠른 설정 토글 UI
const QuickSettingToggle = ({
  label,
  description,
  checked,
  defaultChecked,
  onChange,
  disabled,
}) => (
  <ToggleBox>
    <ToggleLabel>{label}</ToggleLabel>
    <ToggleDescription>{description}</ToggleDescription>
    <ToggleInput
      type="checkbox"
      onChange={onChange}
      disabled={disabled}
      checked={typeof checked === "boolean" ? checked : undefined}
      defaultChecked={typeof checked === "boolean" ? undefined : defaultChecked}
    />
  </ToggleBox>
);
