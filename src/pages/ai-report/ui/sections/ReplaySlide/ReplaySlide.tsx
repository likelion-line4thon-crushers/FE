import React, { useMemo } from "react";
import {
  ReplaySlideContainer,
  RevisitHeader,
  HeaderTitle,
  HeaderDescriptionBox,
  HeaderDescriptionText,
  CardsRow,
  PreviewCard,
  PreviewInner,
  SlidePreviewFrame,
  SlidePreviewImage,
  SlideBadge,
  ChartCard,
  ChartHeader,
  ChartTitleGroup,
  AccentLine,
  ChartTitle,
  ChartBody,
  RankingList,
  RankingRow,
  RankBadge,
  SlideLabel,
  BarTrack,
  BarFill,
  CountValue,
  InsightPanel,
  InsightValue,
  InsightLabel,
  InsightText,
  Legend,
  LegendDot,
  LegendLabel,
  EmptyInsightPanel,
  EmptyInsightTitle,
} from "./ReplaySlide.styles";
import { SlideSkeleton } from "../../summary";
import { useSlideImage } from "@/entities/slide";

interface RevisitRankItem {
  slideNumber: number | null;
  count: number | null;
}

const RANK_COLORS = ["#E74D07", "#434343", "#767676", "#9A9A9A", "#BCBCBC"];
const EMPTY_BAR_WIDTHS = [78, 62, 49, 36, 24];
const EMPTY_BAR_COLORS = ["#EAD7CA", "#D9D9D9", "#D9D9D9", "#D9D9D9", "#D9D9D9"];

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
};

const toNumber = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const getFirstNumber = (source: unknown, keys: string[]) => {
  const record = toRecord(source);
  if (!record) {
    return null;
  }

  for (const key of keys) {
    const value = toNumber(record[key]);
    if (value !== null) {
      return value;
    }
  }

  return null;
};

const getRankSource = (reportData: unknown): unknown[] => {
  if (Array.isArray(reportData)) {
    return reportData;
  }

  const record = toRecord(reportData);
  const possibleKeys = [
    "top5",
    "topSlides",
    "slides",
    "items",
    "ranking",
    "rankings",
    "mostRevisitSlides",
    "revisitSlides",
  ];

  for (const key of possibleKeys) {
    const value = record?.[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  const singleSlide = getFirstNumber(reportData, ["slide", "page", "slideNumber", "topSlide"]);
  return singleSlide !== null ? [reportData] : [];
};

const normalizeRevisitItems = (reportData: unknown): RevisitRankItem[] => {
  return getRankSource(reportData)
    .map((item) => {
      const slideNumber = getFirstNumber(item, ["slide", "page", "slideNumber", "topSlide"]);
      const count = getFirstNumber(item, [
        "uniqueUsers",
        "revisitUsers",
        "userCount",
        "audienceCount",
        "count",
        "revisitCount",
        "totalRevisits",
        "value",
      ]);

      return {
        slideNumber: slideNumber && slideNumber > 0 ? slideNumber : null,
        count: count !== null && count >= 0 ? count : null,
      };
    })
    .filter((item: RevisitRankItem) => item.slideNumber !== null)
    .slice(0, 5);
};

const formatSlideLabel = (slideNumber: number | null) => {
  if (slideNumber === null) {
    return "슬라이드 --";
  }

  return `슬라이드 ${String(slideNumber).padStart(2, "0")}`;
};

const formatCount = (count: number | null) => {
  if (count === null) {
    return "-";
  }

  return count.toLocaleString();
};

const ReplaySlide = ({
  reportData,
  loading = false,
  error = null,
  roomId,
  deckId,
}: {
  reportData?: unknown;
  loading?: boolean;
  error?: unknown;
  roomId?: string | null;
  deckId?: string | null;
}) => {
  const rankedSlides = useMemo(() => {
    if (loading || error) {
      return [];
    }

    return normalizeRevisitItems(reportData);
  }, [reportData, loading, error]);

  const chartRows = useMemo<RevisitRankItem[]>(() => {
    if (loading) {
      return Array.from({ length: 5 }, () => ({ slideNumber: null, count: null }));
    }

    return rankedSlides;
  }, [rankedSlides, loading]);

  const topSlide = rankedSlides[0] ?? { slideNumber: null, count: null };
  const numericSlideNumber = topSlide.slideNumber;
  const hasActualData = rankedSlides.some(
    (item) => item.slideNumber !== null && (item.count === null || item.count > 0)
  );
  const showNoData = !loading && !error && !hasActualData;

  const slideNumber = numericSlideNumber ?? "-";

  const { imageUrl: slideImageUrl } = useSlideImage({
    roomId,
    deckId,
    slideNumber: numericSlideNumber,
    enabled: Boolean(numericSlideNumber),
  });

  const maxCount = useMemo(() => {
    const counts = chartRows.map((item) => item.count ?? 0);
    return Math.max(...counts, 1);
  }, [chartRows]);

  const insightText = useMemo(() => {
    const reportRecord = toRecord(reportData);

    if (loading) {
      return "재방문 데이터를 불러오는 중입니다.";
    }

    if (error) {
      return "재방문 데이터를 가져오는 중 오류가 발생했습니다.";
    }

    if (typeof reportRecord?.description === "string" && reportRecord.description.trim()) {
      return reportRecord.description;
    }

    const totalCount = rankedSlides.reduce((sum, item) => sum + (item.count ?? 0), 0);
    const topThreeCount = rankedSlides
      .slice(0, 3)
      .reduce((sum, item) => sum + (item.count ?? 0), 0);

    if (rankedSlides.length >= 3 && totalCount > 0) {
      const topThreeRatio = Math.round((topThreeCount / totalCount) * 100);
      return `상위 3개 슬라이드가 전체 재방문의 ${topThreeRatio}%를 차지해요. 발표 후 follow-up 자료는 이 구간부터 보강하는 것이 좋아요.`;
    }

    if (topSlide.slideNumber && topSlide.count !== null) {
      return `슬라이드 ${topSlide.slideNumber}를 ${formatCount(topSlide.count)}명이 다시 확인했어요. 해당 구간의 설명과 보충 자료를 먼저 점검해보세요.`;
    }

    return "아직 재방문 데이터가 충분하지 않습니다.";
  }, [error, loading, rankedSlides, reportData, topSlide.count, topSlide.slideNumber]);

  return (
    <ReplaySlideContainer>
      <RevisitHeader>
        <HeaderTitle>재방문 수가 가장 많은 슬라이드</HeaderTitle>
        <HeaderDescriptionBox>
          <HeaderDescriptionText>재방문한 청중의 수가 가장 많은 슬라이드입니다.</HeaderDescriptionText>
        </HeaderDescriptionBox>
      </RevisitHeader>
      <CardsRow>
        <PreviewCard>
          <PreviewInner>
            <SlidePreviewFrame>
              {slideImageUrl ? (
                <SlidePreviewImage src={slideImageUrl} alt="재방문 수가 가장 많은 슬라이드" />
              ) : (
                <SlideSkeleton width="100%" height="100%" />
              )}
            </SlidePreviewFrame>
            <SlideBadge>슬라이드 {slideNumber}</SlideBadge>
          </PreviewInner>
        </PreviewCard>
        <ChartCard>
          <ChartHeader>
            <ChartTitleGroup>
              <AccentLine />
              <ChartTitle>TOP 5 재방문 슬라이드</ChartTitle>
            </ChartTitleGroup>
          </ChartHeader>
          <ChartBody $empty={showNoData}>
            <RankingList $empty={showNoData}>
              {showNoData ? (
                EMPTY_BAR_WIDTHS.map((width, index) => (
                  <RankingRow key={`empty-${index}`}>
                    <RankBadge $muted>{index + 1}</RankBadge>
                    <SlideLabel $muted>기록 없음</SlideLabel>
                    <BarTrack>
                      <BarFill $width={width} $color={EMPTY_BAR_COLORS[index] ?? "#D9D9D9"} />
                    </BarTrack>
                    <CountValue $muted>0명</CountValue>
                  </RankingRow>
                ))
              ) : chartRows.length > 0 ? (
                chartRows.map((item, index) => {
                  const width =
                    item.count === null || item.count === 0
                      ? 0
                      : Math.max((item.count / maxCount) * 100, 4);
                  const isTop = index === 0;

                  return (
                    <RankingRow key={`${item.slideNumber ?? "loading"}-${index}`}>
                      <RankBadge $active={isTop}>{index + 1}</RankBadge>
                      <SlideLabel>{formatSlideLabel(item.slideNumber)}</SlideLabel>
                      <BarTrack>
                        <BarFill $width={width} $color={RANK_COLORS[index] ?? "#BCBCBC"} />
                      </BarTrack>
                      <CountValue $active={isTop}>{formatCount(item.count)}명</CountValue>
                    </RankingRow>
                  );
                })
              ) : (
                <RankingRow>
                  <RankBadge $active>1</RankBadge>
                  <SlideLabel>슬라이드 --</SlideLabel>
                  <BarTrack>
                    <BarFill $width={0} $color={RANK_COLORS[0]} />
                  </BarTrack>
                  <CountValue $active>0명</CountValue>
                </RankingRow>
              )}
            </RankingList>
            {showNoData ? (
              <EmptyInsightPanel>
                <AccentLine />
                <EmptyInsightTitle>재방문 데이터가 없어요</EmptyInsightTitle>
                <InsightText>
                  세션 종료 후 집계된 활동 로그에서 다시 열린 슬라이드가 없습니다.
                </InsightText>
              </EmptyInsightPanel>
            ) : (
              <InsightPanel>
                <InsightValue>
                  {loading ? "--" : `${formatCount(topSlide.count ?? 0)}명`}
                </InsightValue>
                <InsightLabel>가장 많이 다시 본 슬라이드</InsightLabel>
                <InsightText>{insightText}</InsightText>
                <Legend>
                  <LegendDot />
                  <LegendLabel>최다 재방문</LegendLabel>
                </Legend>
              </InsightPanel>
            )}
          </ChartBody>
        </ChartCard>
      </CardsRow>
    </ReplaySlideContainer>
  );
};

export default ReplaySlide;
