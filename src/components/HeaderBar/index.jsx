import React from "react";
import styled, { css } from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import BoiniLogo from "../../assets/images/Boini_logo.svg";
import LiveIcon from "../../assets/images/live.png";
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

function HeaderBar() {
  const location = useLocation();
  const isMain = location.pathname === "/";
  const isRating = location.pathname === "/rating";
  const isAiReport = location.pathname === "/ai-report";
  const isAudienceView = location.pathname === "/audience";
  const isPrep = location.pathname === "/create-presentation";
  const isAiReport = location.pathname === "/ai-report";
  const fileName = location.state?.fileName;
  const navigate = useNavigate();
  const { slides, sessionId, features, maxParticipants } = location.state || {};
  const handleStartSession = () => {
    navigate("/presentation", {
      state: { slides, sessionId, features, maxParticipants },
    });
  };

  return (
    <HeaderWrapper>
      {/* ===== 로고 ===== */}
      <Logo $isMain={isMain || isRating || isAiReport}>
        <img src={BoiniLogo} alt="Boini logo" />
      </Logo>

      {/* ===== 중앙 내용 ===== */}
      {!isMain && (
        <Body>
          {isAudienceView && (
            <LiveBadge>
              <img src={LiveIcon} alt="live" />
              라이브 진행 중
            </LiveBadge>
          )}
          {isPrep && <FileName>{fileName || "파일명 없음"}</FileName>}
        </Body>
      )}

      {/* ===== 우측 버튼 ===== */}
      {(isAudienceView || isPrep || isAiReport) && (
        <RightActions>
          {(isAudienceView || isPrep) && <ShareButton />}
          {isPrep ? (
            <StartSessionButton onClick={handleStartSession} />
          ) : (
            <ExitButton />
          )}
        </RightActions>
      )}
    </HeaderWrapper>
  );
}

export default HeaderBar;
