import React from "react";
import {
  LiveBox,
  QuestionContainer,
  QuestionItem,
  QuestionHeader,
  SlideTag,
  Time,
  Content,
  StatusMessage,
  ErrorMessage,
} from "./QuestionList.styles";

const formatTimestamp = (ts) => {
  if (ts === null || ts === undefined) return "";
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const QuestionList = ({
  questions = [],
  loading = false,
  error = null,
  currentSlide,
  onSelectSlide,
  emptyMessage = "아직 등록된 질문이 없습니다.",
}) => {
  const hasQuestions = Array.isArray(questions) && questions.length > 0;

  return (
    <LiveBox>
      <QuestionContainer>
        {loading && !hasQuestions && (
          <StatusMessage>질문을 불러오는 중입니다.</StatusMessage>
        )}

        {error && !loading && (
          <ErrorMessage>
            {error?.message || "질문을 불러오지 못했습니다."}
          </ErrorMessage>
        )}

        {hasQuestions &&
          questions.map((question) => {
            if (!question) return null;
            const slideNumber =
              Number.isFinite(question.slide) && question.slide > 0
                ? question.slide
                : Number(question.slideNumber) || 1;
            const slideIndex =
              Number.isFinite(slideNumber) && slideNumber > 0
                ? slideNumber - 1
                : 0;
            const timestamp =
              question.time || formatTimestamp(question.ts ?? question.time);

            return (
              <QuestionItem
                key={question.id ?? `${slideNumber}-${question.ts}`}
                $active={slideIndex === currentSlide}
              >
                <QuestionHeader>
                  <SlideTag
                    type="button"
                    onClick={() =>
                      typeof onSelectSlide === "function" &&
                      onSelectSlide(slideIndex)
                    }
                    $active={slideIndex === currentSlide}
                  >
                    슬라이드 {slideNumber}
                  </SlideTag>
                  {timestamp && <Time>{timestamp}</Time>}
                </QuestionHeader>
                <Content>{question.content ?? ""}</Content>
              </QuestionItem>
            );
          })}

        {!loading && !error && !hasQuestions && (
          <StatusMessage>{emptyMessage}</StatusMessage>
        )}
      </QuestionContainer>
    </LiveBox>
  );
};

export default QuestionList;
