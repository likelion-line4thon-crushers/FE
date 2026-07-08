import styled, { css } from "styled-components";
import { ToggleInput, HighlightedSlideStyles } from "@/widgets/presentation-layout";
import { MEDIA } from "@/shared/config/breakpoints";

/* 전체 컨테이너 */
export const Main = styled.div<{ $isFullscreen?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 2vh 2vw;
  gap: 2vh;
  background: #fff;
  position: relative;

  /* 전체화면 스타일과의 병합 충돌 방지를 위해 비전체화면일 때만 적용 */
  ${({ $isFullscreen }) =>
    !$isFullscreen &&
    css`
      @media ${MEDIA.mobile} {
        padding: 8px 12px;
        gap: 8px;
      }
    `}

  ${({ $isFullscreen }) =>
    $isFullscreen &&
    `
      width: 100%;
      height: 100vh;
      height: 100dvh;
      padding: clamp(24px, 3vh, 32px) 0 clamp(72px, 8vh, 88px);
      gap: 0;
      justify-content: center;
      background: #121212;
      overflow: hidden;
    `}
`;

export const RightContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.52vw;
  width: 9.38vw;
  height: 2.78vh;

  @media ${MEDIA.mobile} {
    width: auto;
    height: auto;
    gap: 6px;

    img {
      display: none;
    }
  }
`;
export const ToggleContainer = styled.div<{ $isFullscreen?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.42vw;
  position: relative;

  ${({ $isFullscreen }) =>
    $isFullscreen &&
    `
      gap: 8px;
      padding: 20px 30px;
      border: 1px solid #eaeaea;
      border-radius: 100px;
      background: rgba(250, 250, 250, 0.9);
      backdrop-filter: blur(5px);
    `}

  ${({ $isFullscreen }) =>
    $isFullscreen &&
    css`
      img {
        display: none;
      }
    `}
`;
export const FocusBar = styled.div<{ $isFullscreen?: boolean; $controlsVisible?: boolean }>`
  display: flex;
  align-self: flex-start;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  transition: opacity 0.2s ease;

  ${({ $isFullscreen }) =>
    $isFullscreen &&
    `
      position: absolute;
      top: clamp(24px, 3vh, 32px);
      left: clamp(42px, 4.2vw, 80px);
      right: clamp(42px, 4.2vw, 80px);
      width: auto;
      z-index: 12;
    `}

  ${({ $isFullscreen, $controlsVisible }) =>
    $isFullscreen &&
    !$controlsVisible &&
    `
      opacity: 0;
      pointer-events: none;
    `}
`;

export const SingleToggleInput = styled(ToggleInput)`
  margin: 0;
  position: relative;
  z-index: 1;
`;

/* 슬라이드 + 하단 컨트롤을 묶어 16px 간격으로 붙여둔다 */
export const SlideStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
`;

/* 슬라이드 바로 아래 컨트롤 줄: 리액션 바(가운데) + 전체화면 버튼(오른쪽) */
export const ControlsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;

  @media ${MEDIA.mobile} {
    display: flex;
    gap: 8px;
  }
`;

/* 리액션 스티커 바를 흐름 배치로 전환해 가운데 칸에 정렬 */
export const ReactionSlot = styled.div`
  grid-column: 2;
  display: flex;
  justify-content: center;
  align-items: center;

  /* EmojiPanel(EmojiContainer)의 절대배치를 무력화하고, 이모지가 space-between 으로
     퍼질 수 있도록 충분한 너비를 준다 */
  > div {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    transform: none;
    margin: 0;
    width: clamp(320px, 34vw, 480px);
    max-width: 100%;
  }

  @media ${MEDIA.mobile} {
    flex: 1;
    min-width: 0;

    > div {
      width: 100%;
    }
  }
`;

/* 오른쪽 끝 칸: 전체화면 버튼 */
export const ControlsEnd = styled.div`
  grid-column: 3;
  display: flex;
  justify-content: flex-end;
  align-items: center;

  @media ${MEDIA.mobile} {
    flex: none;
  }
`;

/* 슬라이드 본문 */
export const SlideBox = styled.div<{ focusHighlight?: boolean; $isFullscreen?: boolean }>`
  background-color: white;
  padding: 0;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.6vw;
  border: 0.05vw solid #ddd;
  /* 더블탭 확대·클릭 지연 제거 — 연속 스탬프 터치 반응성 확보 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  ${({ $isFullscreen }) =>
    !$isFullscreen &&
    css`
      @media ${MEDIA.mobile} {
        border-radius: 8px;
        border: 1px solid #ddd;
      }
    `}

  ${({ focusHighlight }) => (focusHighlight ? HighlightedSlideStyles : css``)}

  ${({ $isFullscreen }) =>
    $isFullscreen &&
    `
      width: min(100%, calc((100vh - clamp(112px, 12vh, 140px)) * 16 / 9));
      width: min(100%, calc((100dvh - clamp(112px, 12vh, 140px)) * 16 / 9));
      aspect-ratio: 16 / 9;
      border: 1px solid #eaeaea;
      border-radius: 10px;
      background: #f2f9ff;
    `}
`;

export const NavButton = styled.button`
  padding: 0.8vh 0.8vw;
  border: 0.05vw solid #ddd;
  border-radius: 0.3vw;
  background: ${(p) => (p.disabled ? "#f5f5f5" : "#fff")};
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
`;

export const ToggleText = styled.span`
  color: #5c5c5c;
  font-size: 0.94vw;
  font-style: normal;
  font-weight: 600;
  line-height: 2.22vh;
  letter-spacing: -0.021vw;

  @media ${MEDIA.mobile} {
    font-size: 13px;
    line-height: 1.4;
    letter-spacing: -0.2px;
    white-space: nowrap;
  }
`;

export const ReactionButton = styled.button<{ $isFullscreen?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eaeaea;
  border-radius: 999px;
  background: #fafafa;
  padding: clamp(12px, 0.7vw, 13px);
  cursor: pointer;

  ${({ $isFullscreen }) =>
    $isFullscreen &&
    `
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(5px);
      padding: clamp(12px, 0.9vw, 16px);
    `}

  img {
    width: clamp(24px, 2vw, 32px);
    aspect-ratio: 1;
    object-fit: contain;
  }
`;

export const FullscreenButton = styled.button<{
  $isFullscreen?: boolean;
  $controlsVisible?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: clamp(12px, 0.75vw, 14px);
  color: #303030;
  border: 1px solid #eaeaea;
  border-radius: 999px;
  background: #fafafa;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.15s ease,
    opacity 0.2s ease;

  &:hover {
    background: #ffffff;
  }

  &:active {
    transform: scale(0.97);
  }

  &:focus-visible {
    outline: 2px solid #303030;
    outline-offset: 3px;
  }

  > img {
    width: clamp(1.5rem, 1.55vw, 1.75rem);
    aspect-ratio: 1;
    display: block;
  }

  ${({ $isFullscreen }) =>
    $isFullscreen &&
    `
      position: absolute;
      right: clamp(42px, 4.2vw, 80px);
      bottom: clamp(40px, 4.6vh, 50px);
      z-index: 12;
      padding: clamp(18px, 1.1vw, 20px);
      border-width: 1px;
      background: rgba(250, 250, 250, 0.8);
      backdrop-filter: blur(6.786px);
    `}

  ${({ $isFullscreen, $controlsVisible }) =>
    $isFullscreen &&
    !$controlsVisible &&
    `
      opacity: 0;
      pointer-events: none;
    `}

  ${({ $isFullscreen }) =>
    $isFullscreen &&
    css`
      > img {
        width: clamp(30px, 1.9vw, 36px);
      }
    `}
`;

export const FullscreenExitIcon = styled.span`
  position: relative;
  display: block;
  width: clamp(30px, 1.9vw, 36px);
  aspect-ratio: 1;

  span {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 57.13%;
    aspect-ratio: 1;
  }

  span:first-child {
    left: 42.9%;
    top: 42.9%;
    transform: rotate(180deg) scaleY(-1);
  }

  span:last-child {
    left: 3.86%;
    top: 3.86%;
    transform: scaleY(-1);
  }

  img {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

export const SlideNumberChip = styled.div<{ $visible?: boolean }>`
  position: absolute;
  left: clamp(42px, 4.2vw, 80px);
  bottom: clamp(40px, 4.6vh, 50px);
  z-index: 12;
  padding: 12px 20px;
  border: 1px solid #eaeaea;
  border-radius: 100px;
  background: rgba(250, 250, 250, 0.6);
  backdrop-filter: blur(10px);
  color: #303030;
  font-size: clamp(14px, 0.9vw, 16px);
  font-style: normal;
  font-weight: 600;
  line-height: 1.45;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: none;
  transition: opacity 0.2s ease;

  /* 모바일 전체화면: 하단 이모지 바와 겹치지 않게 그 위로 배치 */
  @media ${MEDIA.mobile} {
    left: 12px;
    bottom: 116px;
  }
`;

export const TooltipWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.42vw;
`;

export const Tooltip = styled.div`
  position: absolute;
  right: 2.08vw;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.56vh 0.63vw;
  border-radius: 0.73vw;
  background: rgb(201, 201, 201);

  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;

  /* 터치 기기: hover 툴팁 비활성 */
  @media ${MEDIA.touch} {
    display: none;
  }

  color: rgb(0, 0, 0);
  font-size: 0.63vw;
  font-weight: 400;
  line-height: 1.67vh;
  letter-spacing: -0.016vw;
  margin-right: 0.36vw;

  &::before {
    content: "";
    position: absolute;
    right: -0.36vw;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;

    border-top: 0.83vh solid transparent;
    border-bottom: 0.83vh solid transparent;
    border-left: 0.47vw solid rgb(201, 201, 201);
  }
`;

export const TooltipRight = styled(Tooltip)`
  right: auto;
  left: 100%;
  margin-right: 0;
  margin-left: -0.78vw;

  &::before {
    right: auto;
    left: -0.36vw;
    border-left: none;
    border-right: 0.47vw solid rgb(201, 201, 201);
  }
`;

export const TooltipHoverArea = styled(TooltipWrapper)`
  &:hover ${Tooltip} {
    opacity: 1;
  }
  &:hover ${TooltipRight} {
    opacity: 1;
  }
`;

export const FollowTooltipArea = styled(TooltipHoverArea)`
  pointer-events: none;
`;

export const WaitingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1.85vh;
  text-align: center;
  color: #5c5c5c;
`;

export const WaitingImage = styled.img`
  width: clamp(6.25vw, 12vw, 9.38vw);
  height: auto;
  object-fit: contain;

  @media ${MEDIA.mobile} {
    width: 28vw;
  }
`;

export const WaitingText = styled.p`
  margin: 0;
  color: #5c5c5c;
  font-size: 1.04vw;
  font-style: normal;
  font-weight: 600;
  line-height: 2.04vh;
  letter-spacing: -0.02vw;
  white-space: pre-line;

  @media ${MEDIA.mobile} {
    font-size: 14px;
    line-height: 1.5;
    letter-spacing: -0.3px;
  }
`;

/* 모바일 전용: 상단 바 가운데 현재 슬라이드 표시 칩 */
export const MobileSlideChip = styled.span`
  display: none;

  @media ${MEDIA.mobile} {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border: 1px solid #eaeaea;
    border-radius: 100px;
    background: #fafafa;
    color: #303030;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }
`;
