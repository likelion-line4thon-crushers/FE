import React, { useMemo } from "react";
import {
  TotalReactionContainer,
  TitleContainer,
  ContentContainer,
} from "./TotalReaction.styles";
import ReportTitle from "../../../assets/images/AI/ReportTitle.png";
import ContentBox from "../ContentBox/ContentBox";
import RabbitImage from "../../../assets/images/rabbit.jpg";
import SlideNumber from "../SlideNumber/SlideNumber";
import useSlideImage from "../../../hooks/useSlideImage";

const formatValue = (value, { loading, error }) => {
  if (loading) {
    return "--";
  }

  if (error) {
    return "N/A";
  }

  if (typeof value === "number") {
    return value.toLocaleString();
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return "0";
};

const TotalReaction = ({
  reportData,
  loading = false,
  error = null,
  roomId,
  deckId,
  fileName = null,
}) => {
  const emojiCount = reportData?.emojiCount ?? null;
  const questionCount = reportData?.questionCount ?? null;

  const attentionSlideIndex = useMemo(() => {
    if (loading || error) {
      return null;
    }

    const raw = reportData?.attentionSlide ?? null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [reportData?.attentionSlide, loading, error]);

  const attentionSlideNumber = attentionSlideIndex ?? "-";

  const { imageUrl: attentionSlideImage } = useSlideImage({
    roomId,
    deckId,
    slideNumber: attentionSlideIndex,
    enabled: Boolean(attentionSlideIndex),
  });

  return (
    <TotalReactionContainer>
      <TitleContainer>
        <img src={ReportTitle} alt="AI 보고서" />
        <h1>AI 보고서</h1>
        <h2>{fileName || "파일명.pdf"}</h2>
      </TitleContainer>
      <ContentContainer>
        <ContentBox
          title="총 이모지 반응"
          value={formatValue(emojiCount, { loading, error })}
          unit="개"
          height="350px"
        />
        <ContentBox
          title="총 실시간 질문수"
          value={formatValue(questionCount, { loading, error })}
          unit="개"
          height="350px"
        />
        <ContentBox
          title="주목해야 할 슬라이드"
          slideImage={attentionSlideImage || RabbitImage}
          height="350px"
          width="570px"
          slideImageWidth="80%"
          slideImageHeight="80%"
          slideNumberComponent={
            <SlideNumber slideNumber={attentionSlideNumber} />
          }
        />
      </ContentContainer>
    </TotalReactionContainer>
  );
};

export default TotalReaction;
