import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import {
  Top3Container,
  QuestionContainer,
  QuestionContentWrapper,
  QuestionText,
  QuestionMeta,
} from "./Top3.styles";
import ContentBox from "../ContentBox/ContentBox";
import AITitle from "../AITitle/AITitle";
import { loadStoredRoomData, computeRoomInfo } from "../../../model/room-info";
import { fetchTopQuestionsReport } from "@/shared/api/ai-report";

interface TopQuestionReportItem {
  representative?: string | null;
  samples?: string[];
  count?: number | null;
  slides?: number[] | null;
}

interface TopQuestionReport {
  top3?: TopQuestionReportItem[];
}

const getQuestionData = (item?: TopQuestionReportItem | null) => {
  if (!item) {
    return {
      question: "해당 순위의 질문이 없습니다.",
      similarCount: null,
      relatedSlides: null,
    };
  }

  const mainQuestion =
    item.representative ||
    (Array.isArray(item.samples) && item.samples.length > 0 ? item.samples[0] : null);

  return {
    question: mainQuestion ?? "질문 내용을 불러올 수 없습니다.",
    similarCount: item.count || null,
    relatedSlides: Array.isArray(item.slides) && item.slides.length > 0 ? item.slides : null,
  };
};

const Top3 = () => {
  const location = useLocation();
  const [report, setReport] = useState<TopQuestionReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const storedRoomData = useMemo(() => loadStoredRoomData(), []);

  const roomInfo = useMemo(
    () => computeRoomInfo(storedRoomData, location?.state),
    [storedRoomData, location?.state]
  );

  const { roomId } = roomInfo;

  useEffect(() => {
    let cancelled = false;

    if (!roomId) {
      setReport(null);
      setError(new Error("방 정보를 찾을 수 없습니다."));
      setLoading(false);
      return undefined;
    }

    const loadReport = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchTopQuestionsReport(roomId);
        if (!cancelled) {
          setReport(result);
        }
      } catch (err) {
        if (!cancelled) {
          setReport(null);
          setError(err as any);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const topItems = report?.top3 ?? [];

  const questionDataForIndex = (index: number) => {
    if (loading) {
      return {
        question: "• 질문 데이터를 불러오는 중입니다...",
        similarCount: null,
        relatedSlides: null,
      };
    }

    if (error) {
      return {
        question: "• 질문 데이터를 불러오는 중 문제가 발생했습니다.",
        similarCount: null,
        relatedSlides: null,
      };
    }

    return getQuestionData(topItems[index]);
  };

  const titleForIndex = (index: number) => `Top ${index + 1} 질문`;

  const renderQuestionContent = (index: number) => {
    const { question, similarCount, relatedSlides } = questionDataForIndex(index);
    const hasMeta = similarCount !== null || relatedSlides !== null;

    return (
      <QuestionContentWrapper>
        <QuestionText>{question}</QuestionText>
        {hasMeta && (
          <QuestionMeta>
            {similarCount !== null && <div>총 {similarCount}개의 유사 질문</div>}
            {relatedSlides !== null && <div>관련 슬라이드: {relatedSlides.join(", ")}</div>}
          </QuestionMeta>
        )}
      </QuestionContentWrapper>
    );
  };

  return (
    <Top3Container>
      <AITitle title="Top3 질문들" description="주요질문 TOP 3를 정리해드립니다." />
      <QuestionContainer>
        <ContentBox title={titleForIndex(0)} variant="custom" width="auto" height="auto">
          {renderQuestionContent(0)}
        </ContentBox>
        <ContentBox title={titleForIndex(1)} variant="custom" width="auto" height="auto">
          {renderQuestionContent(1)}
        </ContentBox>
        <ContentBox title={titleForIndex(2)} variant="custom" width="auto" height="auto">
          {renderQuestionContent(2)}
        </ContentBox>
      </QuestionContainer>
    </Top3Container>
  );
};

export default Top3;
