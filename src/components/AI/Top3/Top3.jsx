import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Top3Container, QuestionContainer } from "./Top3.styles";
import ContentBox from "../ContentBox/ContentBox";
import AITitle from "../AITitle/AITitle";
import {
  loadStoredRoomData,
  computeRoomInfo,
} from "../../../utils/aiReportRoom";
import { fetchTopQuestionsReport } from "../../../services/aiReportService";

const formatTopQuestionContent = (item) => {
  if (!item) {
    return "해당 순위의 질문이 없습니다.";
  }

  const mainQuestion =
    item.representative ||
    (Array.isArray(item.samples) && item.samples.length > 0
      ? item.samples[0]
      : null);

  const detailParts = [];

  if (item.count) {
    detailParts.push(`총 ${item.count}개의 유사 질문`);
  }

  if (Array.isArray(item.slides) && item.slides.length > 0) {
    detailParts.push(`관련 슬라이드: ${item.slides.join(", ")}`);
  }

  const detailText = detailParts.length ? `\n(${detailParts.join(" / ")})` : "";

  return `${mainQuestion ?? "질문 내용을 불러올 수 없습니다."}${detailText}`;
};

const Top3 = () => {
  const location = useLocation();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
          setError(err);
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

  const contentForIndex = (index) => {
    if (loading) {
      return "• 질문 데이터를 불러오는 중입니다...";
    }

    if (error) {
      return "• 질문 데이터를 불러오는 중 문제가 발생했습니다.";
    }

    return formatTopQuestionContent(topItems[index]);
  };

  const titleForIndex = (index) => `Top ${index + 1} 질문`;

  return (
    <Top3Container>
      <AITitle
        title="Top3 질문들"
        description="주요질문 TOP 3를 정리해드립니다."
      />
      <QuestionContainer>
        <ContentBox
          title={titleForIndex(0)}
          content={contentForIndex(0)}
          variant="text"
          width="auto"
          height="auto"
        />
        <ContentBox
          title={titleForIndex(1)}
          content={contentForIndex(1)}
          variant="text"
          width="auto"
          height="auto"
        />
        <ContentBox
          title={titleForIndex(2)}
          content={contentForIndex(2)}
          variant="text"
          width="auto"
          height="auto"
        />
      </QuestionContainer>
    </Top3Container>
  );
};

export default Top3;
