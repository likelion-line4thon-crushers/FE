import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  QuestionSlideContainer,
  TotalContainer,
  SummaryBoxContainer,
  LeftBoxContainer,
  RightBoxContainer,
} from "./QuestionSlide.styles";
import faceImage from "../../../assets/images/emoji1_black.svg";
import rectangleImage from "../../../assets/images/AI/Rectangle.png";
import ContentBox from "../ContentBox/ContentBox";
import AITitle from "../AITitle/AITitle";
import SlideNumber from "../SlideNumber/SlideNumber";
import { fetchTopSlideReport } from "../../../services/aiReportService";
import {
  loadStoredRoomData,
  computeRoomInfo,
} from "../../../utils/aiReportRoom";
import useSlideImage from "../../../hooks/useSlideImage";

const QuestionSlide = () => {
  const location = useLocation();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const storedRoomData = useMemo(() => loadStoredRoomData(), []);

  const roomInfo = useMemo(
    () => computeRoomInfo(storedRoomData, location?.state),
    [storedRoomData, location?.state]
  );

  const { roomId, deckId, totalPages } = roomInfo;

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
        const result = await fetchTopSlideReport(roomId, {
          latestFirst: true,
        });

        if (cancelled) return;

        setReport(result);

        if (
          result &&
          totalPages &&
          Number.isFinite(Number(result.slide)) &&
          Number(result.slide) > Number(totalPages)
        ) {
          console.warn(
            "[QuestionSlide] 보고된 슬라이드 번호가 총 페이지 수를 초과합니다:",
            { slideNumber: result.slide, totalPages }
          );
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
  }, [roomId, totalPages]);

  const slideNumber =
    report && Number.isFinite(Number(report.slide)) && Number(report.slide) > 0
      ? Number(report.slide)
      : null;

  const summaryText = (() => {
    if (loading) {
      return "실시간 질문 요약을 불러오는 중입니다...";
    }
    if (error) {
      return "요약을 불러오는 중 오류가 발생했습니다.";
    }
    if (report?.summary) {
      return report.summary;
    }
    if (report?.questions?.length) {
      return "수집된 질문 요약이 아직 생성되지 않았습니다.";
    }
    return "아직 집계된 질문이 없습니다.";
  })();

  const questionListContent = (() => {
    if (loading) {
      return "• 질문 목록을 불러오는 중입니다...";
    }
    if (error) {
      return "• 질문 데이터를 불러오는 중 문제가 발생했습니다.";
    }
    if (report?.questions?.length) {
      return report.questions
        .map((question, index) => {
          const content =
            question?.content?.trim() ||
            `질문 ${index + 1}의 내용을 확인할 수 없습니다.`;
          return `• ${content}`;
        })
        .join("\n");
    }
    return "• 아직 수집된 질문이 없습니다.";
  })();

  const totalQuestions =
    typeof report?.totalQuestions === "number" ? report.totalQuestions : 0;
  const { imageUrl: slideImageUrl } = useSlideImage({
    roomId,
    deckId,
    slideNumber,
    enabled: Boolean(roomId && deckId && slideNumber),
  });

  return (
    <QuestionSlideContainer>
      <AITitle
        title="질문이 가장 많았던 슬라이드"
        description="청중이 가장 활발하게 질문을 남긴 구간입니다."
      />
      <TotalContainer>
        <LeftBoxContainer>
          <ContentBox
            title={`질문이 가장 많았던 슬라이드${
              totalQuestions ? ` (${totalQuestions}문)` : ""
            }`}
            slideImage={slideImageUrl}
            height="350px"
            width="570px"
            slideNumberComponent={
              <SlideNumber slideNumber={slideNumber ?? "-"} />
            }
          />
          <ContentBox
            title="실시간 질문 요약"
            variant="custom"
            height="350px"
            width="570px"
          >
            <SummaryBoxContainer>
              <img className="face-image" src={faceImage} alt="face" />
              <h2>실시간 질문 요약</h2>
              <img
                className="rectangle-image"
                src={rectangleImage}
                alt="rectangle"
              />
              <h3>{summaryText}</h3>
            </SummaryBoxContainer>
          </ContentBox>
        </LeftBoxContainer>
        <RightBoxContainer>
          <ContentBox
            title="받았던 질문들"
            titleStyle={{
              color: "#434343",
              fontSize: "20px",
              fontWeight: "600",
              fontStyle: "normal",
            }}
            content={questionListContent}
            variant="text"
            width="auto"
            height="760px"
            contentStyle={{
              color: "#5C5C5C",
              fontSize: "19px",
              fontWeight: "400",
              fontStyle: "normal",
            }}
          />
        </RightBoxContainer>
      </TotalContainer>
    </QuestionSlideContainer>
  );
};

export default QuestionSlide;
