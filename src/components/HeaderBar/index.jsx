import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { useLocation, useNavigate, useMatch } from "react-router-dom";
import BoiniLogo from "../../assets/images/Boini_logo.svg";
import LiveIcon from "../../assets/images/live.png";
import ShareModal from "../modal/ShareModal";
import {
  ShareButton,
  ExitButton,
  StartSessionButton,
} from "../common/HeaderButtons";
import {
  startSession,
  closeSession,
  leaveRoom,
} from "../../services/roomService";
import {
  fetchTopSlideReport,
  fetchTopQuestionsReport,
  fetchTopStoredReport,
} from "../../services/aiReportService";
import websocketService from "../../services/websocketService";
import LandingPage from "../LandingPage";

/* ===== 헤더 전체 래퍼 ===== */
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

/* ===== 로고 ===== */
const Logo = styled.div`
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

/* ===== 중앙 영역 ===== */
const Body = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/* ===== 파일명 표시 ===== */
const FileName = styled.div`
  font-size: clamp(12px, 0.95vw, 18px);
  color: #5c5c5c;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50vw;
`;

/* ===== 라이브 뱃지 ===== */
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

/* ===== 우측 버튼 영역 ===== */
const RightActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.63vw;
  margin-right: 1vw;
`;

function HeaderBar({ roomData: propRoomData, totalPages }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isMain = location.pathname === "/";
  const isRating = location.pathname === "/rating";
  const isAiReport = location.pathname === "/ai-report";
  const isPrep = location.pathname.startsWith("/create-presentation");
  const isPresenter = location.pathname.startsWith("/presentation");
  const isCodeRoute = Boolean(useMatch(":code"));
  const isAudienceView =
    location.pathname.startsWith("/audience") ||
    (isCodeRoute &&
      !isMain &&
      !isRating &&
      !isAiReport &&
      !isPrep &&
      !isPresenter);

  const [showShareModal, setShowShareModal] = useState(false);
  const [roomData, setRoomData] = useState(propRoomData || null);
  const [fileName, setFileName] = useState(location.state?.fileName || "");
  const [isSessionEnding, setIsSessionEnding] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(false);
  const [landingMessage, setLandingMessage] = useState("AI 리포트 생성 중 ...");
  const [sessionStatus, setSessionStatus] = useState("waiting");

  /* ✅ 새로고침 또는 state 유실 시 sessionStorage 복구 */
  useEffect(() => {
    if (!roomData) {
      const stored =
        sessionStorage.getItem("boini_room") ||
        sessionStorage.getItem("roomData");
      if (stored) {
        setRoomData(JSON.parse(stored));
      }
    }
  }, [roomData]);

  useEffect(() => {
    if (!fileName && location.state?.fileName) {
      setFileName(location.state.fileName);
    }
  }, [location.state]);

  // 청중 뷰일 때 sessionStatus 확인
  useEffect(() => {
    if (!isAudienceView) {
      return;
    }

    const getSessionStatus = () => {
      try {
        const code = location.pathname.split("/").pop();
        if (code) {
          const storageKey = `boini_audience_${code}`;
          const stored = sessionStorage.getItem(storageKey);
          if (stored) {
            const storedData = JSON.parse(stored);
            return storedData.sessionStatus || "waiting";
          }
        }
      } catch (_error) {
        // ignore
      }
      return "waiting";
    };

    // 초기 상태 설정
    setSessionStatus(getSessionStatus());

    const interval = setInterval(() => {
      setSessionStatus(getSessionStatus());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isAudienceView, location.pathname]);

  const handleSessionAction = async () => {
    if (isSessionEnding) {
      return;
    }

    if (isPrep) {
      if (!roomData?.roomId || !roomData?.deckId) {
        alert("⚠️ 방 정보가 아직 준비되지 않았습니다.");
        return;
      }

      try {
        // 세션 시작 API 호출 (status를 waiting → live로 변경 및 웹소켓 브로드캐스팅)
        await startSession(roomData.roomId);

        // 발표자 뷰로 이동
        navigate(`/presentation/${roomData.roomId}`, {
          state: {
            fileName,
            roomId: roomData.roomId,
            deckId: roomData.deckId,
            totalPages: totalPages || 0,
          },
        });
      } catch (error) {
        alert("⚠️ 세션 시작에 실패했습니다. 다시 시도해주세요.");
      }
    } else if (isPresenter) {
      const resolvedRoomId = roomData?.roomId ?? location.state?.roomId ?? null;
      const resolvedDeckId = roomData?.deckId ?? location.state?.deckId ?? null;
      const resolvedTotalPages =
        location.state?.totalPages ??
        roomData?.totalPages ??
        roomData?.slideCount ??
        totalPages ??
        null;

      if (!resolvedRoomId) {
        alert("⚠️ 방 정보를 찾을 수 없습니다. 다시 시도해주세요.");
        return;
      }

      setIsSessionEnding(true);
      setLandingMessage("AI 리포트 생성 중 ...");
      setShowLandingPage(true);
      let didNavigate = false;
      try {
        const reportCalls = [
          fetchTopStoredReport(resolvedRoomId),
          fetchTopSlideReport(resolvedRoomId, { latestFirst: true }),
          fetchTopQuestionsReport(resolvedRoomId),
        ];

        const reportResults = await Promise.allSettled(reportCalls);

        const reportErrors = reportResults.filter(
          (result) => result.status === "rejected"
        );

        if (reportErrors.length > 0) {
          console.warn(
            "[HeaderBar] 레포트 선행 호출 중 일부 실패:",
            reportErrors
          );
        }

        await closeSession(resolvedRoomId);
        console.log("[HeaderBar] 세션 종료 API(DELETE) 성공:", resolvedRoomId);

        if (websocketService.getIsConnected()) {
          websocketService.sendEndSession(resolvedRoomId);
        }

        const nextState = {
          roomId: resolvedRoomId,
          deckId: resolvedDeckId,
          totalPages: resolvedTotalPages,
          fileName,
          roomData: {
            ...(roomData || {}),
            roomId: resolvedRoomId,
            deckId: resolvedDeckId,
            totalPages: resolvedTotalPages,
            fileName,
          },
        };

        try {
          if (typeof window !== "undefined" && window.sessionStorage) {
            window.sessionStorage.setItem(
              "ai_report_room",
              JSON.stringify(nextState.roomData)
            );
          }
        } catch (_error) {
          // ignore storage write errors
        }

        navigate("/ai-report", {
          replace: false,
          state: nextState,
        });
        didNavigate = true;
      } catch (error) {
        console.error("[HeaderBar] 세션 종료 처리 실패:", error);
        alert("⚠️ 세션 종료 처리에 실패했습니다. 다시 시도해주세요.");
        setShowLandingPage(false);
      } finally {
        setIsSessionEnding(false);
        if (!didNavigate) {
          setShowLandingPage(false);
        }
      }
    }
  };

  const handleShareClick = () => {
    if (!roomData || !roomData.joinUrl) {
      alert("⚠️ 방 정보가 없습니다. 발표 준비 완료 후 다시 시도해주세요.");
      return;
    }
    setShowShareModal(true);
  };

  const handleExitClick = async () => {
    if (isAudienceView) {
      // 청중 뷰일 때는 방 퇴장 API 호출
      const roomId = window.roomId || null;
      const audienceId = window.audienceId || null;
      const audienceToken = window.audienceToken || null;

      if (roomId && audienceId && audienceToken) {
        try {
          await leaveRoom(roomId, audienceId, audienceToken);

          // 세션 스토리지에서 청중 정보 제거
          try {
            const code = location.pathname.split("/").pop();
            if (code) {
              const storageKey = `boini_audience_${code}`;
              sessionStorage.removeItem(storageKey);
            }
          } catch (_error) {
            // 세션 스토리지 제거 실패 시 무시
          }
        } catch (error) {
          // API 호출 실패해도 메인 페이지로 이동
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
