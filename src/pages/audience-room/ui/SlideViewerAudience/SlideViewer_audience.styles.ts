import styled, { css } from "styled-components";
import { ToggleInput, HighlightedSlideStyles } from "@/widgets/presentation-layout";

/* 전체 컨테이너 */
export const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 2vh 2vw;
  gap: 2vh;
  background: #fff;
`;

export const RightContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.52vw;
  width: 9.38vw;
  height: 2.78vh;
`;
export const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.42vw;
  position: relative;
`;
export const FocusBar = styled.div`
  display: flex;
  align-self: flex-start;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const SingleToggleInput = styled(ToggleInput)`
  margin: 0;
`;

/* 슬라이드 본문 */
export const SlideBox = styled.div<{ focusHighlight?: boolean }>`
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
  ${({ focusHighlight }) => (focusHighlight ? HighlightedSlideStyles : css``)}
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
  font-family: Pretendard;
  font-size: 0.94vw;
  font-style: normal;
  font-weight: 600;
  line-height: 2.22vh;
  letter-spacing: -0.021vw;
`;

export const ReactionButton = styled.button`
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  width: 2vw;
  height: 2vw;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
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

  color: rgb(0, 0, 0);
  font-family: Pretendard;
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
`;

export const WaitingText = styled.p`
  margin: 0;
  color: #5c5c5c;
  font-family: Pretendard;
  font-size: 1.04vw;
  font-style: normal;
  font-weight: 600;
  line-height: 2.04vh;
  letter-spacing: -0.02vw;
  white-space: pre-line;
`;
