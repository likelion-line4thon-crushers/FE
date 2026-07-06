import React, { useRef } from "react";
import type { MouseEvent, ChangeEvent } from "react";
import {
  Main,
  SlideBox,
  SlideStack,
  ControlsRow,
  ReactionSlot,
  ControlsEnd,
  FocusBar,
  ToggleText,
  ReactionButton,
  TooltipHoverArea,
  FollowTooltipArea,
  Tooltip,
  TooltipRight,
  SingleToggleInput,
  WaitingState,
  WaitingImage,
  WaitingText,
  RightContainer,
  ToggleContainer,
  FullscreenButton,
  FullscreenExitIcon,
  SlideNumberChip,
} from "./SlideViewer_audience.styles";
import TipIcon from "@/shared/assets/images/tooltip.png";
import fullscreenIcon from "@/shared/assets/icons/fullscreen.svg";
import fullscreenExitPrimaryIcon from "@/shared/assets/icons/fullscreen-exit-primary.svg";
import fullscreenExitSecondaryIcon from "@/shared/assets/icons/fullscreen-exit-secondary.svg";
import reactionStickerIcon from "@/shared/assets/icons/reaction-sticker.svg";
import reactionStickerFullscreenIcon from "@/shared/assets/icons/reaction-sticker-fullscreen.svg";

interface StampItem {
  id?: string | number;
  src: string;
  xPct: number;
  yPct: number;
}

interface SlideViewerProps {
  slides?: (string | null)[];
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
  isFullscreen?: boolean;
  fullscreenControlsVisible?: boolean;
  fullscreenSlideChipVisible?: boolean;
  onToggleFullscreen?: () => void | Promise<void>;
  /** 슬라이드 아래 컨트롤 줄 가운데에 배치할 리액션 스티커 바 (전체화면 아닐 때만) */
  reactionBar?: React.ReactNode;
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
  isFullscreen = false,
  fullscreenControlsVisible = true,
  fullscreenSlideChipVisible = false,
  onToggleFullscreen,
  reactionBar = null,
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

  const handleFullscreenClick = () => {
    if (typeof onToggleFullscreen === "function") {
      void onToggleFullscreen();
    }
  };

  const slideBoxNode = (
    <SlideBox
      ref={boxRef}
      onClick={handleClick}
      focusHighlight={focusHighlight}
      $isFullscreen={isFullscreen}
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
  );

  const fullscreenButtonNode = !isWaiting ? (
    <FullscreenButton
      type="button"
      onClick={handleFullscreenClick}
      $isFullscreen={isFullscreen}
      $controlsVisible={fullscreenControlsVisible}
      aria-label={isFullscreen ? "전체 화면 종료" : "전체 화면 보기"}
      title={isFullscreen ? "전체 화면 종료" : "전체 화면 보기"}
    >
      {isFullscreen ? (
        <FullscreenExitIcon aria-hidden="true">
          <span>
            <img src={fullscreenExitPrimaryIcon} alt="" />
          </span>
          <span>
            <img src={fullscreenExitSecondaryIcon} alt="" />
          </span>
        </FullscreenExitIcon>
      ) : (
        <img src={fullscreenIcon} alt="" aria-hidden="true" />
      )}
    </FullscreenButton>
  ) : null;

  return (
    <Main $isFullscreen={isFullscreen}>
      <FocusBar $isFullscreen={isFullscreen} $controlsVisible={fullscreenControlsVisible}>
        <ToggleContainer $isFullscreen={isFullscreen}>
          <SingleToggleInput
            checked={followPresenter}
            onChange={handleToggleFollowChange}
            disabled={isWaiting}
            aria-label="발표자와 함께 보기"
          />
          <FollowTooltipArea>
            <TooltipRight>발표자와 함께 보기</TooltipRight>
            <RightContainer>
              <ToggleText>발표자와 함께 보기</ToggleText>
              <img src={TipIcon} alt="tip" style={{ width: 30, height: 50 }} />
            </RightContainer>
          </FollowTooltipArea>
        </ToggleContainer>

        {!isWaiting && (
          <TooltipHoverArea>
            <Tooltip>리액션 스티커 보이기</Tooltip>
            <ReactionButton
              onClick={handleToggleEyesClick}
              aria-label="리액션 스티커 보이기"
              $isFullscreen={isFullscreen}
            >
              <img
                src={isFullscreen ? reactionStickerFullscreenIcon : reactionStickerIcon}
                alt=""
                aria-hidden="true"
              />
            </ReactionButton>
          </TooltipHoverArea>
        )}
      </FocusBar>

      {isFullscreen ? (
        <>
          {slideBoxNode}
          {fullscreenButtonNode}
        </>
      ) : (
        <SlideStack>
          {slideBoxNode}
          <ControlsRow>
            <ReactionSlot>{reactionBar}</ReactionSlot>
            <ControlsEnd>{fullscreenButtonNode}</ControlsEnd>
          </ControlsRow>
        </SlideStack>
      )}

      {!isWaiting && isFullscreen && (
        <SlideNumberChip $visible={fullscreenSlideChipVisible}>
          슬라이드 {safeSlideIndex + 1}
        </SlideNumberChip>
      )}
    </Main>
  );
};

export default SlideViewer;
