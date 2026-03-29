import React, { useRef } from "react";
import type { MouseEvent, ChangeEvent } from "react";
import {
  Main,
  SlideBox,
  FocusBar,
  ToggleText,
  ReactionButton,
  TooltipHoverArea,
  Tooltip,
  TooltipRight,
  SingleToggleInput,
  WaitingState,
  WaitingImage,
  WaitingText,
  RightContainer,
  ToggleContainer,
} from "./SlideViewer_audience.styles";
import openeyes from "@/shared/assets/images/openeyes.png";
import closeeyes from "@/shared/assets/images/closeeyes.png";
import TipIcon from "@/shared/assets/images/tooltip.png";

interface StampItem {
  id?: string | number;
  src: string;
  xPct: number;
  yPct: number;
}

interface SlideViewerProps {
  slides?: string[];
  currentSlide?: number;
  stamps?: StampItem[];
  onPlace?: (coords: { xPct: number; yPct: number }) => void;
  followPresenter?: boolean;
  onToggleFollow?: (checked: boolean) => void;
  showStamps?: boolean;
  onToggleShowStamps?: (show: boolean) => void;
  isWaiting?: boolean;
  waitingImage?: string;
  waitingMessage?: string;
  focusHighlight?: boolean;
}

const SlideViewer = ({
  slides = [],
  currentSlide = 0,
  stamps = [],
  onPlace,
  followPresenter = true,
  onToggleFollow,
  showStamps = true,
  onToggleShowStamps,
  isWaiting = false,
  waitingImage,
  waitingMessage = "현재 라이브 대기중입니다.",
  focusHighlight = false,
}: SlideViewerProps) => {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const hasSlides = Array.isArray(slides) && slides.length > 0;
  const safeSlideIndex = hasSlides ? Math.min(Math.max(currentSlide, 0), slides.length - 1) : 0;
  const currentSlideSrc = hasSlides ? slides[safeSlideIndex] : null;

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (isWaiting || !onPlace || !boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    onPlace({ xPct, yPct });
  };

  const handleToggleFollowChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isWaiting) return;
    if (typeof onToggleFollow === "function") {
      onToggleFollow(event.target.checked);
    }
  };

  const handleToggleEyesClick = () => {
    if (isWaiting) return;
    if (typeof onToggleShowStamps === "function") {
      onToggleShowStamps(!showStamps);
    }
  };

  return (
    <Main>
      <FocusBar>
        <ToggleContainer>
          <SingleToggleInput
            checked={followPresenter}
            onChange={handleToggleFollowChange}
            disabled={isWaiting}
            aria-label="발표자와 함께 보기"
          />
          <TooltipHoverArea>
            <TooltipRight>발표자와 함께 보기</TooltipRight>
            <RightContainer>
              <ToggleText>발표자와 함께 보기</ToggleText>
              <img src={TipIcon} alt="tip" style={{ width: 30, height: 50 }} />
            </RightContainer>
          </TooltipHoverArea>
        </ToggleContainer>

        {!isWaiting && (
          <TooltipHoverArea>
            <Tooltip>리액션 스티커 보이기</Tooltip>
            <ReactionButton onClick={handleToggleEyesClick} aria-label="리액션 스티커 보이기">
              <img
                src={showStamps ? openeyes : closeeyes}
                alt={showStamps ? "openeyes" : "closeeyes"}
              />
            </ReactionButton>
          </TooltipHoverArea>
        )}
      </FocusBar>

      <SlideBox
        ref={boxRef}
        onClick={handleClick}
        focusHighlight={focusHighlight}
        data-testid="audience-slide-surface"
        style={{
          cursor: isWaiting ? "default" : "pointer",
        }}
      >
        {isWaiting ? (
          <WaitingState>
            {waitingImage && <WaitingImage src={waitingImage} alt="대기 중" />}
            <WaitingText>{waitingMessage}</WaitingText>
          </WaitingState>
        ) : (
          currentSlideSrc && (
            <img
              src={currentSlideSrc}
              alt={`슬라이드 ${safeSlideIndex + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "0.6vw",
                userSelect: "none",
                pointerEvents: "none",
                display: "block",
              }}
            />
          )
        )}
        {!isWaiting &&
          showStamps &&
          stamps.map((stamp: StampItem, idx: number) => (
            <img
              key={stamp.id || `${stamp.xPct}-${stamp.yPct}-${idx}`}
              src={stamp.src}
              alt="stamp"
              style={{
                position: "absolute",
                top: `${stamp.yPct}%`,
                left: `${stamp.xPct}%`,
                transform: "translate(-50%, -50%)",
                width: 25,
                height: 25,
                pointerEvents: "none",
              }}
            />
          ))}
      </SlideBox>
    </Main>
  );
};

export default SlideViewer;
