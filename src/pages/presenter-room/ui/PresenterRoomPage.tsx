// src/pages/Presentation/PresenterViewPage.jsx
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
import websocketService from "@/shared/api/websocket";
import { useEmojiReactions, useStickerLoader } from "@/entities/reaction";
import { WebSocketService } from "@/shared/api/websocket";
import { useSlideLoader } from "@/entities/slide";
import { useTimer } from "../model/useTimer";
import { usePresenterFocusHighlight } from "../model/usePresenterFocusHighlight";
import usePresenterQuestions from "../model/usePresenterQuestions";
import { useLiveFeedback } from "../model/useLiveFeedback";
import { useAudienceStats } from "../model/useAudienceStats";
import { usePresenterWebSocket } from "../model/usePresenterWebSocket";
import { useQuickSettings } from "../model/useQuickSettings";

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
} from "@/widgets/presentation-layout";
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
  const { slides: slideUrls, loading } = useSlideLoader({ roomId, deckId, totalPages });
  const { timer } = useTimer({ roomId });

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

  // 🔹 방향키로 슬라이드 이동
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                handleOptionChange("sticker", event.target.checked);
              }}
              disabled={!reactionsReady}
            />
            <QuickSettingToggle
              label="실시간 질문"
              description="청중이 실시간으로 질문을 남길 수 있습니다."
              checked={quickSettings.question}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleOptionChange("question", event.target.checked)
              }
            />
            <QuickSettingToggle
              label="실시간 피드백"
              description="수집된 청중의 반응을 실시간으로 분석합니다."
              checked={quickSettings.feedback}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleOptionChange("feedback", event.target.checked)
              }
            />
            <QuickSettingToggle
              label="다음 슬라이드 공개"
              description="청중이 다음 슬라이드 화면들을 미리 볼 수 있습니다."
              checked={quickSettings.unlock}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleUnlockChange(event.target.checked)
              }
            />
          </QuickTogglesGrid>
        </Section>

        {/* === 실시간 질문 섹션 === */}
        <QuestionSection>
          <Title>실시간 질문</Title>
          <QuestionList
            questions={presenterQuestions}
            loading={questionsLoading}
            error={questionsError}
            currentSlide={currentSlide}
            onSelectSlide={handleSelectQuestionSlide}
          />
          {!quickSettings.question && (
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

// 실시간 질문 섹션 스타일
const QuestionSection = styled(Section)`
  position: relative;
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

// 빠른 설정 토글 UI
const QuickSettingToggle = ({
  label,
  description,
  checked,
  defaultChecked,
  onChange,
  disabled,
}: {
  label?: any;
  description?: any;
  checked?: any;
  defaultChecked?: any;
  onChange?: any;
  disabled?: any;
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
