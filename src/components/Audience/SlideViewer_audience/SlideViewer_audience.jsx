import React, { useRef } from "react";
import {
  Main,
  SlideBox,
  FocusBar,
  ToggleText,
  ReactionButton,
  TooltipHoverArea,
  Tooltip,
  SingleToggleInput,
  WaitingState,
  WaitingImage,
  WaitingText,
  RightContainer,
  ToggleContainer,
} from "./SlideViewer_audience.styles";
import openeyes from "../../../assets/images/openeyes.png";
import closeeyes from "../../../assets/images/closeeyes.png";
import TipIcon from "../../../assets/images/tooltip.png";

const SlideViewer = ({
  slides = [],
  currentSlide = 0,
  cursorImage,
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
}) => {
  const boxRef = useRef(null);
  const hasSlides = Array.isArray(slides) && slides.length > 0;
  const safeSlideIndex = hasSlides
    ? Math.min(Math.max(currentSlide, 0), slides.length - 1)
    : 0;
  const currentSlideSrc = hasSlides ? slides[safeSlideIndex] : null;

  const handleClick = (e) => {
    if (isWaiting || !onPlace || !boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    onPlace({ xPct, yPct });
  };

  const handleToggleFollowChange = (event) => {
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
          />
          <RightContainer>
            <ToggleText>발표자와 함께 보기</ToggleText>
            <img src={TipIcon} alt="tip" style={{ width: 30, height: 50 }} />
          </RightContainer>
        </ToggleContainer>

        {!isWaiting && (
          <TooltipHoverArea>
            <Tooltip>리액션 스티커 보이기</Tooltip>
            <ReactionButton onClick={handleToggleEyesClick}>
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
        style={{
          cursor: isWaiting
            ? "default"
            : cursorImage
            ? `url(${cursorImage}) 16 16, auto`
            : "auto",
        }} //마우스 포인터 변경
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
                userSelect: "none",
                pointerEvents: "none",
                display: "block",
              }}
            />
          )
        )}
        {!isWaiting &&
          showStamps &&
          stamps.map((stamp, idx) => (
            <img
              key={stamp.id || `${stamp.xPct}-${stamp.yPct}-${idx}`}
              src={stamp.src}
              alt="stamp"
              style={{
                position: "absolute",
                top: `${stamp.yPct}%`,
                left: `${stamp.xPct}%`,
                transform: "translate(-50%, -50%)",
                width: 40,
                height: 40,
                pointerEvents: "none",
              }}
            />
          ))}
      </SlideBox>
    </Main>
  );
};

export default SlideViewer;
