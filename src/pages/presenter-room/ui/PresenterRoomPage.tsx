import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { ChangeEvent } from "react";
import { useLocation, useParams } from "react-router";
import {
  PresentationLayout,
  SlideViewer,
  AudienceCount,
  LiveLockButton,
} from "@/widgets/presentation-layout";
import { SlidesSidebar } from "@/widgets/slides-sidebar";
import QuestionList from "./QuestionList";
import ClusterQuestionList from "./ClusterQuestionList";
import CompletedQuestionList from "./CompletedQuestionList";
import QuestionTabs from "./QuestionTabs";
import { QuestionScrollArea } from "./QuestionList.styles";
import websocketService from "@/shared/api/websocket";
import { SessionLoadingOverlay } from "@/shared/ui/session-loading-overlay";
import { useEmojiReactions, useStickerLoader } from "@/entities/reaction";
import { SlideNotesPanel, usePresenterSlideNotes } from "@/entities/slide-note";
import { WebSocketService } from "@/shared/api/websocket";
import { useSlideLoader } from "@/entities/slide";
import { selectUnclusteredQuestions } from "@/entities/question";
import {
  useTimer,
  usePresenterFocusHighlight,
  usePresenterQuestions,
  usePresenterClusters,
  usePresenterCompletedQuestions,
  useLiveFeedback,
  useAudienceStats,
  usePresenterWebSocket,
  useQuickSettings,
} from "../model";

// SettingsPanel 스타일 재사용
import { PanelWrapper, Section, Title } from "@/widgets/presentation-layout";
import {
  QuickTogglesList,
  ToggleRow,
  ToggleRowLabel,
  RowToggleInput,
} from "./QuickSettings.styles";
import styled from "styled-components";

const PresenterRoomPage = () => {
  const location = useLocation();
  const { roomId: roomIdParam } = useParams();

  const storedRoomData = useMemo(
    () => JSON.parse(sessionStorage.getItem("boini_room") || "{}"),
    []
  );

  const locationState = location.state || {};

  const roomId = roomIdParam || locationState.roomId || storedRoomData.roomId;
  const deckId = locationState.deckId || storedRoomData.deckId;
  const totalPages = locationState.totalPages || storedRoomData.totalPages || 0;
  const presenterToken = locationState.presenterToken || storedRoomData.presenterToken || null;

  const presenterWsUrl = useMemo(() => {
    const raw = locationState.wsUrl || storedRoomData.wsUrl || null;

    const deriveFromUrl = (input: any) => {
      if (!input) return null;
      try {
        const url = new URL(input, window.location.origin);
        const protocol =
          url.protocol === "ws:" ? "http:" : url.protocol === "wss:" ? "https:" : url.protocol;
        return `${protocol}//${url.host}/ws/presenter`;
      } catch (_error) {
        return null;
      }
    };

    const derived = deriveFromUrl(raw);
    if (derived) return derived;

    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const fallback = deriveFromUrl(apiBase);
    return fallback ?? "http://localhost:8080/ws/presenter";
  }, [locationState.wsUrl, storedRoomData.wsUrl]);

  // 🔹 세션 스토리지에서 현재 슬라이드 복원
  const getInitialSlide = useMemo(() => {
    if (!roomId) return 0;
    try {
      const stored = sessionStorage.getItem(`boini_current_slide_${roomId}`);
      if (stored !== null) {
        const parsed = Number(stored);
        if (Number.isFinite(parsed) && parsed >= 0) {
          return parsed;
        }
      }
    } catch (_error) {
      // ignore storage read errors
    }
    return 0;
  }, [roomId]);

  const [currentSlide, setCurrentSlide] = useState(getInitialSlide);
  const [showReactions, setShowReactions] = useState(true);
  const [showStampsInViewer, setShowStampsInViewer] = useState(true);

  // 서버에서 presigned URL 하나씩 가져와서 썸네일로 사용
  const currentSlideRef = useRef(0);
  useEffect(() => {
    currentSlideRef.current = currentSlide;
  }, [currentSlide]);

  // 🔹 현재 슬라이드를 세션 스토리지에 저장
  useEffect(() => {
    if (roomId && Number.isFinite(currentSlide) && currentSlide >= 0) {
      try {
        sessionStorage.setItem(`boini_current_slide_${roomId}`, String(currentSlide));
      } catch (_error) {
        // ignore storage write errors
      }
    }
  }, [currentSlide, roomId]);

  // 🔹 커스텀 훅 사용
  const {
    slides: slideUrls,
    loading,
    applySlideReady,
  } = useSlideLoader({ roomId, deckId, totalPages });
  const { timer } = useTimer({ roomId });
  const { notesByPage } = usePresenterSlideNotes({
    roomId,
    deckId,
    presenterToken,
    editable: false,
  });

  const audienceCapacity = locationState.count ?? storedRoomData.count ?? 50;

  const initialAudienceCount = useMemo(() => {
    const candidate = locationState.audienceCount ?? storedRoomData.audienceCount ?? null;
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

  const handleToggleShowReactions = (nextValue: any) => {
    setShowReactions(nextValue);
  };

  const handleToggleShowStampsInViewer = (nextValue: any) => {
    setShowStampsInViewer(nextValue);
  };

  const slideCount = slideUrls.length;

  // 🔹 슬라이드 로드 후 저장된 슬라이드 번호가 유효한지 확인
  useEffect(() => {
    if (slideCount > 0 && currentSlide >= slideCount) {
      // 저장된 슬라이드 번호가 유효하지 않으면 0으로 리셋
      setCurrentSlide(0);
      if (roomId) {
        try {
          sessionStorage.setItem(`boini_current_slide_${roomId}`, "0");
        } catch (_error) {
          // ignore storage write errors
        }
      }
    }
  }, [slideCount, currentSlide, roomId]);

  const changeSlide = useCallback(
    (nextIndex: any, { broadcast = true } = {}) => {
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

  // 🔹 WebSocket 연결 및 구독
  const { isPresenterWsReady } = usePresenterWebSocket({
    roomId,
    presenterToken,
    presenterWsUrl,
    currentSlideRef,
    changeSlide,
  });

  const { audienceStats } = useAudienceStats({
    roomId,
    currentSlide,
    isPresenterWsReady,
  });

  // 🔹 집중 유도 (isPresenterWsReady 업데이트 후 재생성)
  const { showFocusHighlight, handleFocusOn } = usePresenterFocusHighlight({
    roomId,
    isPresenterWsReady,
  });

  // 🔹 빠른 설정 (isPresenterWsReady 업데이트 후 재생성)
  const { quickSettings, handleOptionChange, handleUnlockChange } = useQuickSettings({
    roomId,
    isPresenterWsReady,
  });

  // 🔹 "다음 슬라이드 공개" 토글이 켜짐→꺼짐으로 바뀔 때만 미공개 토스트를 수초간 노출
  const [showUnlockToast, setShowUnlockToast] = useState(false);
  const prevUnlockRef = useRef(quickSettings.unlock);
  const unlockToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const prevUnlock = prevUnlockRef.current;
    const currUnlock = quickSettings.unlock;
    prevUnlockRef.current = currUnlock;
    if (prevUnlock && !currUnlock) {
      setShowUnlockToast(true);
      if (unlockToastTimerRef.current) clearTimeout(unlockToastTimerRef.current);
      unlockToastTimerRef.current = setTimeout(() => setShowUnlockToast(false), 3000);
    }
  }, [quickSettings.unlock]);

  useEffect(
    () => () => {
      if (unlockToastTimerRef.current) clearTimeout(unlockToastTimerRef.current);
    },
    []
  );

  // 🔹 실시간 피드백
  const { feedbackContent } = useLiveFeedback({
    roomId,
    currentSlide,
    isEnabled: quickSettings.feedback,
    isPresenterWsReady,
  });

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
  const currentSlidePage = currentSlide + 1;
  const currentSlideNotes = notesByPage[currentSlidePage] ?? "";

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
    completeQuestion,
    deleteQuestion,
  } = usePresenterQuestions({
    roomId,
    enabled: Boolean(roomId),
    subscribe: Boolean(roomId && isPresenterWsReady),
  });

  const { clusters, toggleExpand, isExpanded } = usePresenterClusters({
    roomId,
    isPresenterWsReady,
  });

  const unclusteredQuestions = useMemo(
    () => selectUnclusteredQuestions(presenterQuestions, clusters),
    [presenterQuestions, clusters]
  );

  // Clusters carry no timestamp; look each question's ts up by its content so
  // the cluster rows can show the same time as the flat question list.
  const questionTsByContent = useMemo(() => {
    const map = new Map<string, number>();
    presenterQuestions.forEach((question) => {
      if (question?.content != null) map.set(question.content, question.ts);
    });
    return map;
  }, [presenterQuestions]);

  const [questionTab, setQuestionTab] = useState<"unanswered" | "completed">("unanswered");

  const {
    completedQuestions,
    loading: completedLoading,
    error: completedError,
  } = usePresenterCompletedQuestions({
    roomId,
    enabled: questionTab === "completed",
  });

  // 🔹 PDF 파싱 중 slideReady 수신 (발표자도 구독)
  useEffect(() => {
    if (!isPresenterWsReady || !roomId) return;
    const unsub = websocketService.subscribe(
      `/topic/presentation/${roomId}/slideReady`,
      (data: any) => {
        const payload = data?.data ?? data;
        const idx = Number(payload?.pageIndex);
        const url = payload?.imageUrl;
        if (Number.isFinite(idx) && idx >= 0 && url && typeof applySlideReady === "function") {
          applySlideReady(idx, url);
        }
      }
    );
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [isPresenterWsReady, roomId, applySlideReady]);

  // 🔹 방향키로 슬라이드 이동
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
    (slideIndex: any) => {
      changeSlide(slideIndex, { broadcast: true });
    },
    [changeSlide]
  );

  // ✅ 로딩 중일 때 표시
  if (loading) {
    return (
      <PresentationLayout>
        <SlidesSidebar
          slides={[]}
          currentSlide={0}
          setCurrentSlide={() => undefined}
          isWaiting
          placeholderCount={totalPages || 10}
        />
        <SlideViewer
          slides={[""]}
          currentSlide={0}
          setCurrentSlide={() => undefined}
          audienceStats={{ prev: 0, current: 100, next: 0 }}
          mode="present"
          stamps={[]}
          showReactions={false}
          timer="00:00"
        />
        <PanelWrapper>
          <Section>
            <Title>빠른 설정</Title>
          </Section>
          <Section>
            <Title>실시간 질문</Title>
          </Section>
        </PanelWrapper>
        <SessionLoadingOverlay message="세션 초기화 중..." />
      </PresentationLayout>
    );
  }

  // 썸네일이 없을 때 표시
  if (!slideUrls.length) {
    // 이 부분을 slideUrls로 변경
    return (
      <PresentationLayout>
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
      </PresentationLayout>
    );
  }

  return (
    <PresentationLayout>
      {/* 🔹 좌측: 슬라이드 썸네일 리스트 */}
      <SlidesSidebar
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
        timer={timer}
        showFeedback={quickSettings.feedback}
        feedbackContent={feedbackContent}
        showUnlockToast={showUnlockToast}
        afterSlideContent={
          <SlideNotesPanel
            notes={currentSlideNotes}
            readOnly
          />
        }
      />

      {/* 🔹 우측: 빠른 설정 + 실시간 질문 */}
      <PanelWrapper>
        {/* === 빠른 설정 섹션 === */}
        <Section>
          <AudienceCount
            roomId={roomId}
            audienceCapacity={audienceCapacity}
            isWsReady={isPresenterWsReady}
            initialAudienceCount={initialAudienceCount}
          />

          <QuickTogglesList>
            <QuickSettingToggle
              label="실시간 질문"
              checked={quickSettings.question}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleOptionChange("question", event.target.checked)
              }
            />
            <QuickSettingToggle
              label="다음 슬라이드 공개"
              checked={quickSettings.unlock}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleUnlockChange(event.target.checked)
              }
            />
          </QuickTogglesList>
        </Section>

        {/* === 실시간 질문 섹션 === */}
        <QuestionSection>
          <Title>실시간 질문</Title>
          <QuestionTabs value={questionTab} onChange={setQuestionTab} />
          <QuestionScrollArea>
            {questionTab === "completed" ? (
              <CompletedQuestionList
                questions={completedQuestions}
                loading={completedLoading}
                error={completedError}
              />
            ) : (
              <>
                {clusters.length > 0 && (
                  <ClusterQuestionList
                    clusters={clusters}
                    isExpanded={isExpanded}
                    toggleExpand={toggleExpand}
                    onComplete={completeQuestion}
                    onDelete={deleteQuestion}
                    tsByContent={questionTsByContent}
                  />
                )}
                {(clusters.length === 0 || unclusteredQuestions.length > 0) && (
                  <QuestionList
                    questions={clusters.length > 0 ? unclusteredQuestions : presenterQuestions}
                    loading={questionsLoading}
                    error={questionsError}
                    currentSlide={currentSlide}
                    onSelectSlide={handleSelectQuestionSlide}
                    onComplete={completeQuestion}
                    onDelete={deleteQuestion}
                  />
                )}
              </>
            )}
          </QuestionScrollArea>
          {!quickSettings.question && questionTab === "unanswered" && (
            <LockButtonWrapper>
              <LiveLockButton />
            </LockButtonWrapper>
          )}
        </QuestionSection>
      </PanelWrapper>
    </PresentationLayout>
  );
};

export default PresenterRoomPage;

// 실시간 질문 섹션 스타일 — 패널 하단까지 차오르도록 flex:1
const QuestionSection = styled(Section)`
  position: relative;
  flex: 1;
  min-height: 40vh;
`;

const LockButtonWrapper = styled.div`
  position: absolute;
  bottom: 2vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
`;

// 빠른 설정 토글 UI (라벨 + 토글 한 줄)
const QuickSettingToggle = ({
  label,
  checked,
  onChange,
  disabled,
}: {
  label?: any;
  checked?: any;
  onChange?: any;
  disabled?: any;
}) => (
  <ToggleRow>
    <ToggleRowLabel>{label}</ToggleRowLabel>
    <RowToggleInput
      type="checkbox"
      onChange={onChange}
      disabled={disabled}
      checked={typeof checked === "boolean" ? checked : undefined}
      aria-label={label}
    />
  </ToggleRow>
);
