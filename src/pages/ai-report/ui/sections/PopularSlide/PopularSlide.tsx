import React, { useState, useMemo, useRef } from "react";
import type { ComponentType, ReactNode, SyntheticEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  slideContentFractions,
  stampBoxStyle,
  imageNaturalRatio,
  SLIDE_BOX_ASPECT,
} from "@/shared/lib/slide-geometry";
import type { SlideContentFractions } from "@/shared/lib/slide-geometry";
import { useElementAspectRatio } from "@/shared/lib/use-element-aspect-ratio";
import {
  PopularSlideContainer,
  EmojiPanelWrapper,
  SlideContainer,
  LargeSlide,
  SmallSlide,
  NoSlideMessage,
  SectionContainer,
  SlideWrapper,
  StampImage,
} from "./PopularSlide.styles";
import { EmojiPanel, SELECTED_EMOJI_ICONS } from "@/entities/reaction";
import { ContentBox, AITitle, SlideNumber, SlideSkeleton } from "../../summary";
import NoSlideImage from "@/shared/assets/images/AI/NoSlide.png";
import { mostReactionStickerQuery } from "@/shared/api/ai-report";
import { useSlideImage } from "@/entities/slide";
import type { EmojiId } from "@/entities/reaction";
import useRoomStickers from "../../../model/useRoomStickers";
import type { SlideSticker } from "../../../model/useRoomStickers";

interface ReactionSlideReportItem {
  emoji: number;
  topSlide?: number | null;
  topCount?: number | null;
  secondSlide?: number | null;
  secondCount?: number | null;
}

interface EmojiOption {
  id: EmojiId;
}

/* 슬라이드 박스가 min-height 로 16:9 에서 벗어날 수 있어 실측 비율로 콘텐츠 영역을 계산,
   레터박스를 제외한 실제 슬라이드 위에 스탬프를 배치한다 */
const StampedSlideBox = ({
  Box,
  src,
  alt,
  renderStamps,
}: {
  Box: ComponentType<any>;
  src: string | null;
  alt: string;
  renderStamps: (fractions: SlideContentFractions) => ReactNode;
}) => {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const boxRatio = useElementAspectRatio(boxRef);
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);

  return (
    <Box ref={boxRef}>
      {src ? (
        <>
          <img
            key={src}
            ref={(img) => {
              // 캐시된 이미지는 onLoad 를 놓칠 수 있어 ref 시점에 complete 여부도 확인
              if (img && img.complete) setNaturalRatio(imageNaturalRatio(img));
            }}
            src={src}
            alt={alt}
            onLoad={(e: SyntheticEvent<HTMLImageElement>) =>
              setNaturalRatio(imageNaturalRatio(e.currentTarget))
            }
          />
          {renderStamps(slideContentFractions(naturalRatio, boxRatio ?? SLIDE_BOX_ASPECT))}
        </>
      ) : (
        <SlideSkeleton width="100%" height="100%" />
      )}
    </Box>
  );
};

const EMOJI_NAMES: Record<number, string> = {
  1: "재미있는",
  2: "놀라운",
  3: "궁금한",
  4: "신나는",
  5: "화난",
  6: "슬픈",
  7: "좋은",
  8: "나쁜",
};

const PopularSlide = ({ roomId, deckId }: { roomId?: any; deckId?: any }) => {
  const [selectedEmojiId, setSelectedEmojiId] = useState(1); // 기본값: 재미있는 이모지

  const reactionQuery = useQuery({ ...mostReactionStickerQuery(roomId ?? ""), enabled: !!roomId });
  const reactionData = useMemo(
    () => (reactionQuery.data ?? []) as ReactionSlideReportItem[],
    [reactionQuery.data]
  );
  const loading = reactionQuery.isLoading;
  const error = reactionQuery.error;

  // 선택된 이모지의 데이터 찾기
  const selectedData = useMemo(() => {
    return reactionData.find((item) => item.emoji === selectedEmojiId) || null;
  }, [reactionData, selectedEmojiId]);

  // 첫 번째 슬라이드 이미지 URL
  const { imageUrl: firstSlideUrl } = useSlideImage({
    roomId,
    deckId,
    slideNumber: selectedData?.topSlide,
    enabled: Boolean(selectedData?.topSlide && selectedData.topSlide > 0),
  });

  // 두 번째 슬라이드 이미지 URL
  const secondSlideValue = selectedData?.secondSlide;
  const hasSecondSlide =
    secondSlideValue !== undefined && secondSlideValue !== null && Number(secondSlideValue) > 0;

  const { imageUrl: secondSlideUrl } = useSlideImage({
    roomId,
    deckId,
    slideNumber: hasSecondSlide ? Number(secondSlideValue) : null,
    enabled: hasSecondSlide,
  });

  // 제목 동적 생성
  const getTitle = () => {
    const emojiName = EMOJI_NAMES[selectedEmojiId] || "재미있는";
    return `"${emojiName}" 반응을 가장 많이 받은 슬라이드`;
  };

  // 이모지 선택 핸들러
  const handleEmojiSelect = (emoji: EmojiOption) => {
    setSelectedEmojiId(emoji.id);
  };

  const hasData = (selectedData?.topSlide ?? 0) > 0;
  const primarySlideNumber = selectedData?.topSlide != null ? Number(selectedData.topSlide) : null;

  // 실제 찍힌 스티커 좌표 (기존 /stickers/{roomId}/all 재사용)
  const { getStickers } = useRoomStickers(roomId);
  const firstSlideStamps = getStickers(selectedEmojiId, primarySlideNumber);
  const secondSlideStamps = getStickers(
    selectedEmojiId,
    hasSecondSlide ? Number(secondSlideValue) : null
  );
  const stampSrc = SELECTED_EMOJI_ICONS[selectedEmojiId as EmojiId];

  const renderStamps = (stamps: SlideSticker[], fractions: SlideContentFractions) =>
    stampSrc
      ? stamps.map((stamp) => {
          // 위치만 콘텐츠 기준으로 보정하고, 크기는 리포트 고유 clamp 스타일 유지
          const { left, top } = stampBoxStyle(stamp.xPct, stamp.yPct, fractions);
          return <StampImage key={stamp.id} src={stampSrc} alt="sticker" style={{ left, top }} />;
        })
      : null;

  return (
    <PopularSlideContainer>
      <AITitle
        title="스티커별 인기슬라이드 "
        description="스티커별 반응 상위 슬라이드를 정리해드립니다."
      />
      <EmojiPanelWrapper>
        <EmojiPanel selectedId={selectedEmojiId} onSelect={handleEmojiSelect} />
      </EmojiPanelWrapper>
      <SectionContainer>
        <ContentBox title={getTitle()} variant="custom" width="auto" height="auto">
          <SlideContainer>
            {loading ? (
              <NoSlideMessage>
                <p>데이터를 불러오는 중...</p>
              </NoSlideMessage>
            ) : error || !hasData ? (
              <NoSlideMessage>
                <img src={NoSlideImage} alt="No slides" />
                <p>해당 스티커를 받은 슬라이드가 없습니다 :(</p>
              </NoSlideMessage>
            ) : (
              <>
                <SlideWrapper>
                  <StampedSlideBox
                    Box={LargeSlide}
                    src={firstSlideUrl}
                    alt="Most popular slide"
                    renderStamps={(fractions) => renderStamps(firstSlideStamps, fractions)}
                  />
                  <SlideNumber
                    slideNumber={
                      primarySlideNumber && primarySlideNumber > 0 ? primarySlideNumber : "-"
                    }
                    emojiCount={
                      selectedData?.topCount !== undefined && selectedData?.topCount !== null
                        ? selectedData.topCount
                        : null
                    }
                  />
                </SlideWrapper>
                {hasSecondSlide && (
                  <SlideWrapper>
                    <StampedSlideBox
                      Box={SmallSlide}
                      src={secondSlideUrl}
                      alt="Second popular slide"
                      renderStamps={(fractions) => renderStamps(secondSlideStamps, fractions)}
                    />
                    <SlideNumber
                      slideNumber={selectedData?.secondSlide ? selectedData.secondSlide : "-"}
                      emojiCount={
                        selectedData?.secondCount !== undefined &&
                        selectedData?.secondCount !== null
                          ? selectedData.secondCount
                          : null
                      }
                      variant="secondary"
                    />
                  </SlideWrapper>
                )}
              </>
            )}
          </SlideContainer>
        </ContentBox>
      </SectionContainer>
    </PopularSlideContainer>
  );
};

export default PopularSlide;
