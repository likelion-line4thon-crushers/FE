import React from "react";
import {
  Main,
  FocusBar,
  FocusGroupLeft,
  FocusLeft,
  LegendContainer,
  AudienceBar,
  SegmentPrev,
  SegmentCurrent,
  SegmentNext,
  SegmentDefault,
  LegendItem,
  ColorDot,
  FocusRight,
  TimerButton,
  ReactionButton,
  TooltipHoverArea,
  Tooltip,
  FeedbackContainer,
  FeedbackIcon,
  FeedbackText,
  UnlockToast,
  UnlockToastText,
} from "./SlideViewer.styles";

import SlideContainer from "./SlideContainer";
import FocusIcon from "@/shared/assets/images/focus.svg";
import TimerIcon from "@/shared/assets/images/timer.svg";
import openeyes from "@/shared/assets/images/openeyes.png";
import closeeyes from "@/shared/assets/images/closeeyes.png";
import FeedbackIconImage from "@/shared/assets/images/feedback.svg";
import SlideHiddenIcon from "@/shared/assets/images/slide-hidden.svg";

const SlideViewer = ({
  slides,
  currentSlide = 0,
  audienceStats = { prev: 0, current: 100, next: 0 },
  mode = "live",
  stamps = [] as any[],
  showReactions = true,
  onToggleShowReactions,
  onFocusClick,
  focusHighlight = false,
  timer = "00:00",
  showFeedback = false,
  feedbackContent = "반응 분석 중 ...",
  // Figma 개편으로 청중 분포 범례는 기본 숨김 (컴포넌트는 보존, 필요 시 prop 으로 재노출)
  showAudienceLegend = false,
  showUnlockToast = false,
  afterSlideContent = null,
}: any) => {
  const { prev, current, next } = audienceStats;
  const total = Math.max(prev + current + next, 1);
  const prevPct = (prev / total) * 100;
  const currentPct = (current / total) * 100;
  const nextPct = (next / total) * 100;
  const showAudienceDistribution = mode === "live" || mode === "present";

  const handleToggleEyesClick = () => {
    if (typeof onToggleShowReactions === "function") {
      onToggleShowReactions(!showReactions);
    }
  };

  return (
    <Main>
      {showUnlockToast && (
        <UnlockToast>
          <img src={SlideHiddenIcon} alt="" aria-hidden="true" />
          <UnlockToastText>
            다음 슬라이드 <strong>미공개</strong> 상태입니다.
          </UnlockToastText>
        </UnlockToast>
      )}
      <FocusBar>
        {/* 🔹 왼쪽 그룹 (집중유도 + 검정바) */}
        <FocusGroupLeft>
          <FocusLeft onClick={onFocusClick}>
            <img src={FocusIcon} alt="집중 유도" width={20} height={20} />
            <span>집중 유도</span>
          </FocusLeft>

          {showAudienceLegend && (
            <LegendContainer>
              <AudienceBar>
                {showAudienceDistribution ? (
                  <>
                    <SegmentPrev width={prevPct} />
                    <SegmentCurrent width={currentPct} />
                    <SegmentNext width={nextPct} />
                  </>
                ) : (
                  <SegmentDefault />
                )}
              </AudienceBar>

              <LegendItem>
                <ColorDot color="#C53B2C" />
                이전 구간 슬라이드
              </LegendItem>
              <LegendItem>
                <ColorDot color="#FFFFFF" border />
                현재 슬라이드
              </LegendItem>
              <LegendItem>
                <ColorDot color="#4467FF" />
                다음 구간 슬라이드
              </LegendItem>
            </LegendContainer>
          )}
        </FocusGroupLeft>

        {/* 🔹 오른쪽 (로고, 타이머) */}
        <FocusRight>
          <TooltipHoverArea>
            <Tooltip>리액션 스티커 보이기</Tooltip>
            <ReactionButton onClick={handleToggleEyesClick}>
              <img
                src={showReactions ? openeyes : closeeyes}
                alt={showReactions ? "openeyes" : "closeeyes"}
              />
            </ReactionButton>
          </TooltipHoverArea>
          <TimerButton>
            <img src={TimerIcon} alt="타이머" width={22} height={22} />
            <span>{timer}</span>
          </TimerButton>
        </FocusRight>
      </FocusBar>

      {/* 🔹 슬라이드 */}
      <SlideContainer
        src={slides[currentSlide]?.thumbnailUrl || slides[currentSlide]}
        alt={`슬라이드 ${currentSlide + 1}`}
        stamps={stamps}
        showStamps={showReactions}
        highlight={focusHighlight}
        testId="presenter-slide-surface"
      />

      {afterSlideContent}

      {/* 🔹 실시간 피드백 창 */}
      {showFeedback && (
        <FeedbackContainer show={showFeedback}>
          <FeedbackIcon>
            <img src={FeedbackIconImage} alt="실시간 피드백" />
          </FeedbackIcon>
          <FeedbackText>
            <span>실시간 피드백</span>
            <span>|</span>
            <span>{feedbackContent}</span>
          </FeedbackText>
        </FeedbackContainer>
      )}
    </Main>
  );
};

export default SlideViewer;
