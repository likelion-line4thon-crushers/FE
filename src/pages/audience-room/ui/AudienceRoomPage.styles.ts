import styled from "styled-components";
import { MEDIA } from "@/shared/config/breakpoints";

export const PageContainer = styled.div`
  display: flex;
  height: 100%;
  min-height: 0;
  background-color: #fff;

  /* 모바일: 세로 스택 — 슬라이드 / 리액션 / 실시간 질문 */
  @media ${MEDIA.mobile} {
    flex-direction: column;
  }
`;

export const CenterContainer = styled.div<{ $isFullscreen?: boolean }>`
  display: flex;
  height: 100%;
  flex-direction: column;
  flex: 1;
  gap: 1vh;
  padding: 0vh 1vw;
  position: relative;
  background: #fff;

  @media ${MEDIA.mobile} {
    flex: 0 0 auto;
    height: auto;
    gap: 0;
    padding: 0;
  }

  ${({ $isFullscreen }) =>
    $isFullscreen &&
    `
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      padding: 0;
      gap: 0;
      overflow: hidden;
      background: #121212;
    `}

  &:fullscreen {
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    padding: 0;
    gap: 0;
    overflow: hidden;
    background: #121212;
  }

  &:-webkit-full-screen {
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    padding: 0;
    gap: 0;
    overflow: hidden;
    background: #121212;
  }
`;

export const RightPanelContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  height: 100%;

  /* 모바일: 남은 세로 공간 전체를 실시간 질문 영역으로 */
  @media ${MEDIA.mobile} {
    flex: 1;
    min-height: 0;
    width: 100%;
    height: auto;
    justify-content: stretch;
    align-items: stretch;
  }
`;

/* 모바일에서 이모지 선택 후 첫 스탬프 전까지 노출되는 안내 칩 */
export const MobileStampHint = styled.div`
  display: none;

  @media ${MEDIA.mobile} {
    display: block;
    position: absolute;
    left: 50%;
    bottom: 64px;
    transform: translateX(-50%);
    padding: 8px 14px;
    border-radius: 100px;
    background: rgba(48, 48, 48, 0.85);
    color: #fff;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    pointer-events: none;
    z-index: 11;
  }
`;
