import React, { useState, useEffect, useMemo } from "react";
import {
  PopularSlideContainer,
  EmojiPanelWrapper,
  SlideContainer,
  LargeSlide,
  SmallSlide,
  NoSlideMessage,
  SectionContainer,
  SlideWrapper,
} from "./PopularSlide.styles";
import EmojiPanel from "../../Audience/EmojiPanel";
import ContentBox from "../ContentBox/ContentBox";
import NoSlideImage from "../../../assets/images/AI/NoSlide.png";
import AITitle from "../AITitle/AITitle";
import SlideNumber from "../SlideNumber/SlideNumber";
import { fetchMostReactionSticker } from "../../../services/aiReportService";
import useSlideImage from "../../../hooks/useSlideImage";
import SlideSkeleton from "../SlideSkeleton/SlideSkeleton";

const EMOJI_NAMES = {
  1: "재미있는",
  2: "놀라운",
  3: "궁금한",
  4: "신나는",
  5: "화난",
  6: "슬픈",
  7: "좋은",
  8: "나쁜",
};

const PopularSlide = ({ roomId, deckId }) => {
  const [reactionData, setReactionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEmojiId, setSelectedEmojiId] = useState(1); // 기본값: 재미있는 이모지

  // API 호출
  useEffect(() => {
    if (!roomId) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMostReactionSticker(roomId);
        setReactionData(data || []);
      } catch (err) {
        console.error("이모지별 인기 슬라이드 데이터 로드 실패:", err);
        setError(err);
        setReactionData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [roomId]);

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
    secondSlideValue !== undefined &&
    secondSlideValue !== null &&
    Number(secondSlideValue) > 0;

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
  const handleEmojiSelect = (emoji) => {
    setSelectedEmojiId(emoji.id);
  };

  const hasData = selectedData && selectedData.topSlide > 0;

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
        <ContentBox
          title={getTitle()}
          variant="custom"
          width="auto"
          height="auto"
        >
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
                  <LargeSlide>
                    {firstSlideUrl ? (
                      <img src={firstSlideUrl} alt="Most popular slide" />
                    ) : (
                      <SlideSkeleton width="100%" height="100%" />
                    )}
                  </LargeSlide>
                  <SlideNumber
                    slideNumber={
                      selectedData?.topSlide ? selectedData.topSlide : "-"
                    }
                    emojiCount={
                      selectedData?.topCount !== undefined &&
                      selectedData?.topCount !== null
                        ? selectedData.topCount
                        : null
                    }
                  />
                </SlideWrapper>
                {hasSecondSlide && (
                  <SlideWrapper>
                    <SmallSlide>
                      {secondSlideUrl ? (
                        <img src={secondSlideUrl} alt="Second popular slide" />
                      ) : (
                        <SlideSkeleton width="100%" height="100%" />
                      )}
                    </SmallSlide>
                    <SlideNumber
                      slideNumber={
                        selectedData?.secondSlide
                          ? selectedData.secondSlide
                          : "-"
                      }
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
