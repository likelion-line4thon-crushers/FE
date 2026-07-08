import React, { useRef, useState } from "react";
import type { MouseEvent, ChangeEvent, TouchEvent, SyntheticEvent } from "react";
import {
  slideContentFractions,
  stampBoxStyle,
  boxPointToContentPct,
  imageNaturalRatio,
} from "@/shared/lib/slide-geometry";
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
  MobileSlideChip,
  MobileNavGroup,
  MobileNavButton,
  StampImage,
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
  /** 모바일 스와이프/페이저 내비게이션 — delta 는 ±1 (잠금/범위 처리는 호출부 책임) */
  onNavigate?: (delta: 1 | -1) => void;
}

const SWIPE_MIN_DISTANCE_PX = 48;

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
  onNavigate,
}: SlideViewerProps) => {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const slideImageRef = useRef<HTMLImageElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickAfterSwipeRef = useRef(false);
  const [slideNaturalRatio, setSlideNaturalRatio] = useState<number | null>(null);
  const hasSlides = Array.isArray(slides) && slides.length > 0;
  const safeSlideIndex = hasSlides ? Math.min(Math.max(currentSlide, 0), slides.length - 1) : 0;
  const currentSlideSrc = hasSlides ? slides[safeSlideIndex] : null;

  // 레터박스를 제외한 실제 슬라이드 콘텐츠 영역 — 스탬프 좌표의 기준
  const contentFractions = slideContentFractions(slideNaturalRatio);

  // 캐시된 이미지는 onLoad 를 놓칠 수 있어 ref 시점에 complete 여부도 확인
  const attachSlideImage = (img: HTMLImageElement | null) => {
    slideImageRef.current = img;
    if (img && img.complete) {
      setSlideNaturalRatio(imageNaturalRatio(img));
    }
  };

  const handleSlideImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    setSlideNaturalRatio(imageNaturalRatio(e.currentTarget));
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    // 스와이프 직후 발생하는 click 은 스탬프로 처리하지 않는다
    if (suppressClickAfterSwipeRef.current) {
      suppressClickAfterSwipeRef.current = false;
      return;
    }
    if (isWaiting || !onPlace || !boxRef.current) return;

    // 상태가 아직 갱신되지 않았어도 클릭 시점의 실제 이미지에서 비율을 직접 읽는다
    // (로딩 지연/슬라이드 전환 중 잘못된 좌표계로 전송되는 것을 방지)
    const liveRatio = slideImageRef.current ? imageNaturalRatio(slideImageRef.current) : null;
    if (!liveRatio) return;

    const rect = boxRef.current.getBoundingClientRect();
    const point = boxPointToContentPct(
      (e.clientX - rect.left) / rect.width,
      (e.clientY - rect.top) / rect.height,
      slideContentFractions(liveRatio)
    );
    // 레터박스(여백) 영역 탭은 무시
    if (!point) return;
    onPlace(point);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    // 스와이프 뒤 click 이 발생하지 않는 경우를 대비해 새 제스처 시작 시 플래그 해제
    suppressClickAfterSwipeRef.current = false;
    if (e.touches.length !== 1) {
      touchStartRef.current = null;
      return;
    }
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || isWaiting || typeof onNavigate !== "function") return;

    const touch = e.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    // 수평 이동이 충분히 크고 수직 성분보다 명확히 우세할 때만 스와이프로 판정
    if (Math.abs(deltaX) < SWIPE_MIN_DISTANCE_PX || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) {
      return;
    }

    suppressClickAfterSwipeRef.current = true;
    onNavigate(deltaX < 0 ? 1 : -1);
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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
            key={currentSlideSrc}
            ref={attachSlideImage}
            src={currentSlideSrc}
            alt={`슬라이드 ${safeSlideIndex + 1}`}
            onLoad={handleSlideImageLoad}
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
          <StampImage
            key={stamp.id || `${stamp.xPct}-${stamp.yPct}-${idx}`}
            src={stamp.src}
            alt="stamp"
            style={stampBoxStyle(stamp.xPct, stamp.yPct, contentFractions)}
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

        {!isWaiting && !isFullscreen && hasSlides && (
          <MobileNavGroup>
            <MobileNavButton
              type="button"
              aria-label="이전 슬라이드"
              disabled={safeSlideIndex === 0}
              onClick={() => onNavigate?.(-1)}
            >
              ‹
            </MobileNavButton>
            <MobileSlideChip>
              {safeSlideIndex + 1} / {slides.length}
            </MobileSlideChip>
            <MobileNavButton
              type="button"
              aria-label="다음 슬라이드"
              disabled={safeSlideIndex >= slides.length - 1}
              onClick={() => onNavigate?.(1)}
            >
              ›
            </MobileNavButton>
          </MobileNavGroup>
        )}

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
