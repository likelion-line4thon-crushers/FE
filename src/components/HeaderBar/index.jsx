import React from "react";
import styled, { css } from "styled-components";
import { useLocation } from "react-router-dom";
import BoiniLogo from "../../assets/images/Boini_logo.svg";
import LiveIcon from "../../assets/images/live.png";
import { ShareButton, ExitButton } from "../common/HeaderButtons";

const HeaderWrapper = styled.header`
  width: 100vw;
  height: 3.7vh; /* 40px -> 3.7vh */
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 0.05vw solid #e6e6e6;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  padding: 0 0.8vw;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;

  img {
    width: auto;
    height: 2.2vh; /* 24px -> 2.2vh */
  }

  ${({ $isMain }) =>
    $isMain
      ? css`
          /* ✅ 메인 페이지 중앙 정렬 */
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          margin: 0;
        `
      : css`
          margin: 0 0.83vw 0 0.63vw; /* (16px,12px) -> vw 단위 */
        `}
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6vw;
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
  margin-right: 20px;
`;

function HeaderBar({ children }) {
  const location = useLocation();
  const isMain = location.pathname === "/"; // ✅ 메인페이지 감지
  const isAudienceView = location.pathname === "/audience";

  return (
    <HeaderWrapper>
      <Logo $isMain={isMain}>
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
        </Body>
      )}

      {isAudienceView && (
        <RightActions>
          <ShareButton />
          <ExitButton />
        </RightActions>
      )}
    </HeaderWrapper>
  );
}

export default HeaderBar;
