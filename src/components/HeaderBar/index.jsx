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
  const isAudienceView = location.pathname === "/audience";
  const isPrep = location.pathname.startsWith("/create-presentation");
  const isPresenter = location.pathname.startsWith("/presentation");
  const isCodeRoute = Boolean(useMatch(":code"));

  const [showShareModal, setShowShareModal] = useState(false);
  const [roomData, setRoomData] = useState(propRoomData || null);
  const [fileName, setFileName] = useState(location.state?.fileName || "");

  /* ✅ 새로고침 또는 state 유실 시 sessionStorage 복구 */
  useEffect(() => {
    if (!roomData) {
      const stored = sessionStorage.getItem("boini_room") || sessionStorage.getItem("roomData");
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

  /* ✅ 세션 시작 / 종료 버튼 */
  const handleSessionAction = () => {
    if (isPrep) {
      if (!roomData?.roomId || !roomData?.deckId) {
        alert("⚠️ 방 정보가 아직 준비되지 않았습니다.");
        return;
      }

      navigate(`/presentation/${roomData.roomId}`, {
        state: {
          fileName,
          roomId: roomData.roomId,
          deckId: roomData.deckId,
          totalPages: totalPages || 0,
        },
      });
    } else if (isPresenter) {
      navigate("/");
    }
  };


  const handleShareClick = () => {
    if (!roomData || !roomData.joinUrl) {
      alert("⚠️ 방 정보가 없습니다. 발표 준비 완료 후 다시 시도해주세요.");
      return;
    }
    setShowShareModal(true);
  };

  return (
    <>
      <HeaderWrapper>
        <Logo $isMain={isMain || isRating || isAiReport}>
          <img src={BoiniLogo} alt="Boini logo" />
        </Logo>

        {!isMain && (
          <Body>
            {isAudienceView && (
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
            {(isAudienceView || isPrep || isPresenter) && (
              <ShareButton onClick={handleShareClick} />
            )}

            {(isPrep || isPresenter) && (
              <StartSessionButton onClick={handleSessionAction}>
                {isPrep ? "세션 시작" : "세션 종료"}
              </StartSessionButton>
            )}

            {isAudienceView && <ExitButton />}
          </RightActions>
        )}
      </HeaderWrapper>

      {showShareModal && roomData && (
        <ShareModal
          roomData={roomData}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
}

export default HeaderBar;
