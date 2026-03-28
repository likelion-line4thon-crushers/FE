import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { useLocation, useNavigate } from "react-router";
import BoiniLogo from "../../assets/images/Boini_logo.svg";
import LiveIcon from "../../assets/images/live.png";
import ShareModal from "./ShareModal";
import { ShareButton, ExitButton, StartSessionButton } from "./HeaderButtons";
import { leaveRoom } from "../../services/roomService";
import LandingPage from "../../features/landing/components/LandingPage";
import { useHeaderRoomData } from "./useHeaderRoomData";
import { useHeaderSessionAction } from "./useHeaderSessionAction";

const HeaderWrapper = styled.header`
  width: 100vw;
  height: 5.2vh;
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 0.05vw solid #e6e6e6;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  padding: 0 1vw;
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
  font-family: Pretendard;
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
  gap: 0.63vw;
  margin-right: 1vw;
`;

interface HeaderBarProps {
  roomData?: any;
  totalPages?: number;
}

function HeaderBar({ roomData: propRoomData, totalPages }: HeaderBarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isMain = location.pathname === "/";
  const isRating = location.pathname.includes("/rating");
  const isAiReport = location.pathname.endsWith("/report");
  const isPrep =
    location.pathname === "/rooms/new" ||
    location.pathname.endsWith("/prepare");
  const isPresenter = location.pathname.endsWith("/present");
  const isAudienceView = location.pathname.startsWith("/join/");

  const [showShareModal, setShowShareModal] = useState(false);
  const [sessionStatus, setSessionStatus] = useState("waiting");

  const { roomData, fileName } = useHeaderRoomData(propRoomData);

  const {
    isSessionEnding,
    showLandingPage,
    landingMessage,
    handleSessionAction,
  } = useHeaderSessionAction({ roomData, fileName, totalPages });

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
    if (!roomData || !roomData.joinUrl) {
      alert("⚠️ 방 정보가 없습니다. 발표 준비 완료 후 다시 시도해주세요.");
      return;
    }
    setShowShareModal(true);
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
            {(isPrep || isPresenter) && (
              <FileName>{fileName || "파일명 없음"}</FileName>
            )}
          </Body>
        )}

        {(isAudienceView || isPrep || isPresenter || isAiReport) && (
          <RightActions>
            {(isPrep || isPresenter) && (
              <ShareButton onClick={handleShareClick} />
            )}

            {(isPrep || isPresenter) && (
              <StartSessionButton
                onClick={handleSessionAction}
                disabled={isSessionEnding}
                isEndSession={isPresenter}
              >
                {isPrep ? "세션 시작" : "세션 종료"}
              </StartSessionButton>
            )}

            {(isAudienceView || isAiReport) && (
              <ExitButton onClick={handleExitClick} />
            )}
          </RightActions>
        )}
      </HeaderWrapper>

      {showShareModal && roomData && (
        <ShareModal
          roomData={roomData}
          onClose={() => setShowShareModal(false)}
        />
      )}
      {showLandingPage && <LandingPage message={landingMessage} />}
    </>
  );
}

export default HeaderBar;
