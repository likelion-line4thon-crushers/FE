import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { useLocation, useNavigate } from "react-router";
import { useAtomValue } from "jotai";
import BoiniLogo from "@/shared/assets/images/Boini_logo.svg";
import LiveIcon from "@/shared/assets/images/live.png";
import { ShareModal } from "../share";
import {
  ShareButton,
  ExitButton,
  StartSessionButton,
  FeedbackQuestionButton,
} from "./HeaderButtons";
import { leaveRoom } from "@/shared/api/room";
import { canStartSessionAtom, presenterModeAtom } from "@/entities/room";
import { SessionLoadingOverlay } from "@/shared/ui/session-loading-overlay";
import { SessionWarningModal } from "@/shared/ui/session-warning-modal";
import { useHeaderRoomData, useHeaderSessionAction, resolveShareJoinUrl } from "../../model";

const HeaderWrapper = styled.header`
  width: 100%;
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 0.05vw solid #e6e6e6;
  position: relative;
  z-index: 1000;
  padding: clamp(9px, 1.11vh, 12px) clamp(20px, 1.67vw, 32px);
  box-sizing: border-box;
`;

const Logo = styled.div<{ $isMain?: boolean; $isAiReport?: boolean }>`
  display: flex;
  align-items: center;

  img {
    height: 3vh;
    width: auto;
  }

  ${({ $isMain, $isAiReport }) =>
    $isMain || $isAiReport
      ? css`
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        `
      : css`
          margin-right: 1vw;
        `}
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FileName = styled.div`
  font-size: clamp(12px, 0.95vw, 18px);
  color: #5c5c5c;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50vw;
`;

const LiveBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.42vw;
  padding: 0.4vh 1vw;
  border-radius: 999px;
  background: #fff;
  color: #5c5c5c;
  font-size: 0.83vw;
  font-weight: 500;

  img {
    width: 1.2vw;
    height: 1.2vw;
    object-fit: contain;
  }
`;

const RightActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: clamp(12px, 0.83vw, 16px);
`;

interface AppHeaderProps {
  roomData?: any;
  totalPages?: number;
}

function AppHeader({ roomData: propRoomData, totalPages }: AppHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isMain = location.pathname === "/";
  const isRating = location.pathname.includes("/rating");
  const isAiReport = location.pathname.endsWith("/report");
  const isAudienceView = location.pathname.startsWith("/join/");

  // 발표자 방은 단일 경로(/rooms/new, /rooms/:roomId). 준비/발표 구분은 presenterModeAtom 으로.
  const presenterMode = useAtomValue(presenterModeAtom);
  const isPresenterRoom = /^\/rooms\/[^/]+$/.test(location.pathname);
  const isPrep = isPresenterRoom && presenterMode === "prepare";
  const isPresenter = isPresenterRoom && presenterMode === "present";

  const [showShareModal, setShowShareModal] = useState(false);
  const [showPresenterStartWarning, setShowPresenterStartWarning] = useState(false);
  const [sessionStatus, setSessionStatus] = useState("waiting");

  const { roomData, fileName } = useHeaderRoomData(propRoomData);
  // roomData.canStartSession 은 sessionStorage 스냅샷이라 이전 세션 값이 남아있을 수 있다.
  // 단일 진실 소스로 atom 만 사용. SessionCreatePage 가 SSE 수신/복원 시 atom 을 true 로 세팅하고,
  // 진입 시점엔 항상 false 로 리셋한다.
  const resolvedCanStartSession = useAtomValue(canStartSessionAtom);

  const { isSessionEnding, showLandingPage, landingMessage, handleSessionAction } =
    useHeaderSessionAction({
      roomData,
      fileName,
      totalPages,
      canStartSession: resolvedCanStartSession,
      isPrep,
      isPresenter,
    });

  // * Audience view: poll sessionStatus from sessionStorage
  useEffect(() => {
    if (!isAudienceView) return;

    const getSessionStatus = () => {
      try {
        const code = location.pathname.split("/").pop();
        if (code) {
          const stored = sessionStorage.getItem(`boini_audience_${code}`);
          if (stored) {
            return JSON.parse(stored).sessionStatus || "waiting";
          }
        }
      } catch {
        // ignore
      }
      return "waiting";
    };

    setSessionStatus(getSessionStatus());
    const interval = setInterval(() => {
      setSessionStatus(getSessionStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, [isAudienceView, location.pathname]);

  const handleShareClick = () => {
    if (!resolveShareJoinUrl(roomData)) {
      alert("⚠️ 방 정보가 없습니다. 발표 준비 완료 후 다시 시도해주세요.");
      return;
    }
    setShowShareModal(true);
  };

  // TODO: 세션 후기 질문 작성 플로우 연결 (모달/페이지)는 추후 구현.
  const handleFeedbackQuestionClick = () => {};

  const handleStartSessionClick = () => {
    if (isPrep) {
      setShowPresenterStartWarning(true);
      return;
    }

    handleSessionAction();
  };

  const handleConfirmStartSession = () => {
    setShowPresenterStartWarning(false);
    handleSessionAction();
  };

  const handleExitClick = async () => {
    if (isAudienceView) {
      // * Read audience credentials from sessionStorage instead of window globals
      const code = location.pathname.split("/").pop();
      let exitRoomId: string | null = null;
      let exitAudienceId: string | null = null;
      let exitAudienceToken: string | null = null;

      if (code) {
        try {
          const stored = sessionStorage.getItem(`boini_audience_${code}`);
          if (stored) {
            const data = JSON.parse(stored);
            exitRoomId = data.roomId || null;
            exitAudienceId = data.audienceId || null;
            exitAudienceToken = data.audienceToken || null;
          }
        } catch {
          // ignore parse errors
        }
      }

      if (exitRoomId && exitAudienceId && exitAudienceToken) {
        try {
          await leaveRoom(exitRoomId, exitAudienceId, exitAudienceToken);
          if (code) {
            try {
              sessionStorage.removeItem(`boini_audience_${code}`);
            } catch {
              // ignore
            }
          }
        } catch {
          // API failure — still navigate home
        }
      }
    }

    navigate("/");
  };

  return (
    <>
      <HeaderWrapper>
        <Logo $isMain={isMain || isRating || isAiReport}>
          <img src={BoiniLogo} alt="Boini logo" />
        </Logo>

        {!isMain && (
          <Body>
            {isAudienceView && sessionStatus !== "waiting" && (
              <LiveBadge>
                <img src={LiveIcon} alt="live" />
                라이브 진행 중
              </LiveBadge>
            )}
            {(isPrep || isPresenter) && <FileName>{fileName || "파일명 없음"}</FileName>}
          </Body>
        )}

        {(isAudienceView || isPrep || isPresenter || isAiReport) && (
          <RightActions>
            {isPrep && <FeedbackQuestionButton onClick={handleFeedbackQuestionClick} />}

            {(isPrep || isPresenter) && <ShareButton onClick={handleShareClick} />}

            {(isPrep || isPresenter) && (
              <StartSessionButton
                onClick={handleStartSessionClick}
                disabled={isSessionEnding || (isPrep && !resolvedCanStartSession)}
                isEndSession={isPresenter}
              >
                {isPrep ? "세션 시작" : "세션 종료"}
              </StartSessionButton>
            )}

            {(isAudienceView || isAiReport) && <ExitButton onClick={handleExitClick} />}
          </RightActions>
        )}
      </HeaderWrapper>

      {showShareModal && roomData && (
        <ShareModal roomData={roomData} onClose={() => setShowShareModal(false)} />
      )}
      {showPresenterStartWarning && (
        <SessionWarningModal
          title="라이브 전, 꼭 확인해 주세요!"
          description={[
            "청중에게 공개되는 자료는 스크린샷될 수 있어요.",
            "민감한 내용은 사전에 검토 후 라이브를 진행해 주세요.",
          ]}
          onClose={() => setShowPresenterStartWarning(false)}
          onConfirm={handleConfirmStartSession}
        />
      )}
      {showLandingPage && <SessionLoadingOverlay message={landingMessage} />}
    </>
  );
}

export default AppHeader;
