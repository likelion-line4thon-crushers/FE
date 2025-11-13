import React, { useMemo } from "react";
import {
  ReplaySlideContainer,
  TotalContainer,
  LeftBoxContainer,
  RightBoxContainer,
  NumberCenter,
  NumberValue,
  NumberDescription,
} from "./ReplaySlide.styles";
import ContentBox from "../ContentBox/ContentBox";
import AITitle from "../AITitle/AITitle";
import SlideNumber from "../SlideNumber/SlideNumber";
import useSlideImage from "../../../hooks/useSlideImage";

const fallbackText = (loading, error, value) => {
  if (loading) {
    return "데이터를 불러오는 중입니다...";
  }

  if (error) {
    return "데이터를 가져오는 중 오류가 발생했습니다.";
  }

  return value;
};

const ReplaySlide = ({
  reportData,
  loading = false,
  error = null,
  roomId,
  deckId,
}) => {
  const numericSlideNumber = useMemo(() => {
    if (loading || error) {
      return null;
    }

    const raw = reportData?.slide ?? null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [reportData?.slide, loading, error]);

  const slideNumber = numericSlideNumber ?? "-";

  const { imageUrl: slideImageUrl } = useSlideImage({
    roomId,
    deckId,
    slideNumber: numericSlideNumber,
    enabled: Boolean(numericSlideNumber),
  });

  const totalRevisits = useMemo(() => {
    if (loading || error) {
      return "-";
    }

    const raw = reportData?.totalRevisits ?? 0;
    if (typeof raw === "number") {
      return raw.toLocaleString();
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed.toLocaleString() : "-";
  }, [reportData?.totalRevisits, loading, error]);

  const totalAudience = useMemo(() => {
    if (loading || error) {
      return "-";
    }

    const raw = reportData?.totalAudienceCount ?? 0;
    if (typeof raw === "number") {
      return raw.toLocaleString();
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed.toLocaleString() : "-";
  }, [reportData?.totalAudienceCount, loading, error]);

  const multiRevisitUsers = useMemo(() => {
    if (loading || error) {
      return "-";
    }

    const raw = reportData?.multiRevisitUsers ?? 0;
    if (typeof raw === "number") {
      return raw.toLocaleString();
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed.toLocaleString() : "-";
  }, [reportData?.multiRevisitUsers, loading, error]);

  const description = fallbackText(
    loading,
    error,
    `해당 슬라이드를 ${totalAudience}명 중 ${totalRevisits}명이 재방문했어요.\n특히, ${multiRevisitUsers}명은 2번 이상 다시 봤어요.`
  );

  return (
    <ReplaySlideContainer>
      <AITitle
        title="재방문수가 가장 많은 슬라이드"
        description="재방문한 청중의 수가 가장 많은 슬라이드입니다."
      />
      <TotalContainer>
        <LeftBoxContainer>
          <ContentBox
            title="재방문수가 가장 많은 슬라이드"
            variant="image"
            slideImage={slideImageUrl}
            slideNumberComponent={<SlideNumber slideNumber={slideNumber} />}
            width="auto"
            height="405px"
            slideImageWidth="80%"
            slideImageHeight="80%"
          />
        </LeftBoxContainer>
        <RightBoxContainer>
          <ContentBox
            title="총 재방문 수"
            variant="custom"
            width="auto"
            height="auto"
          >
            <NumberCenter>
              <NumberValue>
                {loading
                  ? "--"
                  : error
                  ? "N/A"
                  : `${totalRevisits}${totalRevisits !== "-" ? "번" : ""}`}
              </NumberValue>
              <NumberDescription>
                {description.split("\n").map((line, idx) => (
                  <span key={line + idx}>
                    {line}
                    <br />
                  </span>
                ))}
              </NumberDescription>
            </NumberCenter>
          </ContentBox>
        </RightBoxContainer>
      </TotalContainer>
    </ReplaySlideContainer>
  );
};

export default ReplaySlide;
