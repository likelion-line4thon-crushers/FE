import styled, { css, keyframes } from "styled-components";

/* 전체 컨테이너 */
export const Main = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 2vh 1vw;
  background: #fff;
  width: 100%;
`;

/* 다음 슬라이드 미공개 토스트 (Figma: 슬라이드 상단 중앙, 수초간 표시) */
const unlockToastFade = keyframes`
  0% { opacity: 0; transform: translate(-50%, -0.6vh); }
  12% { opacity: 1; transform: translate(-50%, 0); }
  85% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -0.6vh); }
`;

export const UnlockToast = styled.div`
  position: absolute;
  top: 2.2vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  display: inline-flex;
  align-items: center;
  gap: 0.5vw;
  padding: 1vh 1.4vw;
  background: rgba(48, 48, 48, 0.92);
  backdrop-filter: blur(3px);
  border-radius: 8px;
  white-space: nowrap;
  pointer-events: none;
  animation: ${unlockToastFade} 3s ease forwards;

  img {
    width: clamp(18px, 1.25vw, 24px);
    height: clamp(18px, 1.25vw, 24px);
    object-fit: contain;
    flex-shrink: 0;
  }
`;

export const UnlockToastText = styled.span`
  font-family: Pretendard;
  font-size: clamp(12px, 0.9vw, 14px);
  font-weight: 600;
  letter-spacing: -0.35px;
  line-height: 1.45;
  color: #eaeaea;

  strong {
    color: #ff905d;
    font-weight: 600;
  }
`;

/* 상단 FocusBar */
export const FocusBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 1.5vh;
`;

/* 왼쪽 그룹 */
export const FocusGroupLeft = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1vw;
`;

/* 집중유도 버튼 */
export const FocusLeft = styled.div`
  color: #5c5c5c;
  font-family: Pretendard;
  font-size: clamp(14px, 1vw, 18px);
  font-weight: 600;
  display: inline-flex;
  height: 2.5vh;
  padding: 1.2vh 1vw;
  justify-content: center;
  align-items: center;
  border-radius: 5vh;
  border: 0.05vw solid #eaeaea;
  background: #eaeaea;
  gap: 0.4vw;
  cursor: ${({ onClick }) => (onClick ? "pointer" : "default")};
  pointer-events: ${({ onClick }) => (onClick ? "auto" : "none")};
  opacity: ${({ onClick }) => (onClick ? 1 : 0.6)};
  transition: all 0.2s ease;

  &:hover {
    background: #ffc551;
    border-color: #ffc551;
    color: #303030;

    img {
      filter: brightness(0) saturate(100%) invert(20%) sepia(4%) saturate(167%) hue-rotate(318deg)
        brightness(99%) contrast(94%);
    }
  }

  &:active {
    transform: scale(0.98);
  }
`;

const focusHighlightAnimation = keyframes`
  0% {
    border-color: #ffc551;
    box-shadow: inset 0 0 1.2vw rgba(255, 197, 81, 0.55);
  }
  60% {
    border-color: #ffc551;
    box-shadow: inset 0 0 0.6vw rgba(255, 197, 81, 0.35);
  }
  100% {
    border-color: #ddd;
    box-shadow: inset 0 0 0 rgba(255, 197, 81, 0);
  }
`;

export const HighlightedSlideStyles = css`
  animation: ${focusHighlightAnimation} 1s ease-out forwards;
`;

/* 검정박스 (집중도바+범례) */
export const LegendContainer = styled.div`
  display: flex;
  align-items: center;
  height: 3vh;
  gap: 0.8vw;
  background: #1e1e1e;
  border-radius: 2vh;
  padding: 1vh 1vw;
  color: #fff;
  font-family: Pretendard;
  font-weight: 500;
  font-size: clamp(11px, 0.8vw, 14px);
`;

/* 집중도 막대 */
export const AudienceBar = styled.div`
  display: flex;
  width: 5vw;
  height: 2vh;
  border-radius: 0.4vh;
  overflow: hidden;
  border: 1px solid #444;
`;

export const SegmentPrev = styled.div<{ width?: number }>`
  width: ${(p) => p.width}%;
  background: #c53b2c;
  transition: width 0.3s ease;
`;

export const SegmentCurrent = styled.div<{ width?: number }>`
  width: ${(p) => p.width}%;
  background: #ffffff;
  transition: width 0.3s ease;
`;

export const SegmentNext = styled.div<{ width?: number }>`
  width: ${(p) => p.width}%;
  background: #4467ff;
  transition: width 0.3s ease;
`;

export const SegmentDefault = styled.div`
  width: 100%;
  background: #666;
`;

/* 범례 */
export const LegendItem = styled.div`
  display: flex;
  font-size: clamp(10px, 0.7vw, 12px);
  align-items: center;
  gap: 0.2vw;
`;

export const ColorDot = styled.div<{ color?: string; border?: boolean }>`
  width: 0.8vw;
  height: 0.8vw;
  border-radius: 0.2vw;
  background: ${(p) => p.color};
  ${(p) => p.border && `border: 1px solid #ccc;`}
`;

/* 오른쪽 로고/타이머 */
export const FocusRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8vw;
`;

export const IconButton = styled.button`
  background: #fafafa;
  border: 0.05vw solid #eaeaea;
  border-radius: 50%;
  width: 2.5vw;
  height: 2.5vw;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export const TimerButton = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2vw;
  height: 3.3vh;
  background: #fafafa;
  border: 0.05vw solid #eaeaea;
  border-radius: 2vw;
  padding: 0.8vh 1vw;
  font-size: clamp(14px, 1vw, 18px);
  color: #5c5c5c;
`;

/* 리액션 버튼 */
export const ReactionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5vw;
  height: 2.5vw;
  border: none;
  background: #fafafa;
  border: 0.05vw solid #eaeaea;
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    background: #f0f0f0;
  }
`;

/* 툴팁 */
export const TooltipWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export const Tooltip = styled.div`
  position: absolute;
  right: 45px;
  top: 50%;
  transform: translateY(-50%);
  padding: 6px 12px;
  border-radius: 14px;
  background: rgb(201, 201, 201);

  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;

  color: rgb(0, 0, 0);
  font-family: Pretendard;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  letter-spacing: -0.3px;

  &::before {
    content: "";
    position: absolute;
    right: -7px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;

    border-top: 9px solid transparent;
    border-bottom: 9px solid transparent;
    border-left: 9px solid rgb(201, 201, 201);
  }
`;

export const TooltipHoverArea = styled(TooltipWrapper)`
  &:hover ${Tooltip} {
    opacity: 1;
  }
`;

/* 슬라이드 컨테이너 */
export const SlideContainer = styled.div`
  position: relative;
  background-color: #ffffff;
  border-radius: 0.6vw;
  border: 0.05vw solid #ddd;
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  aspect-ratio: 16 / 9;
`;

/* 실시간 피드백 창 */
export const FeedbackContainer = styled.div<{ show?: boolean }>`
  width: 97%;
  height: 2vh;
  margin-top: 2vh;
  display: ${({ show }) => (show ? "flex" : "none")};
  align-items: center;
  justify-content: flex-start;
  padding: 1.2vh 1.2vw;
  background: #fafafa;
  border-radius: 2vw;
  border: 0.05vw solid #eaeaea;
  gap: 0.8vw;
`;

export const FeedbackIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1vw;
  height: 1vw;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const FeedbackText = styled.div`
  display: flex;
  align-items: center;
  color: #5c5c5c;
  font-family: Pretendard;
  font-size: clamp(13px, 0.9vw, 16px);
  font-weight: 500;
  white-space: nowrap;
  gap: 0.4vw;
`;
