import React from "react";
import { getQuestionLikeCount } from "@/entities/question";
import type { NormalizedQuestion } from "@/entities/question";
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
  ActionButton,
  ActionGroup,
  LikeAmount,
  LikeBadge,
  LikeIcon,
} from "./QuestionList.styles";

type QuestionListItem = NormalizedQuestion & {
  slideNumber?: number;
  time?: string;
};

interface QuestionListProps {
  questions?: QuestionListItem[];
  loading?: boolean;
  error?: unknown;
  currentSlide: number;
  onSelectSlide?: (slideIndex: number) => void;
  emptyMessage?: string;
  onComplete?: (questionId: string) => void;
  onDelete?: (questionId: string) => void;
}

const formatTimestamp = (ts: number | string | null | undefined) => {
  if (ts === null || ts === undefined) return "";
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const QuestionLikeBadge = ({ count }: { count: number }) => (
  <LikeBadge aria-label={`좋아요 ${count}개`} title={`좋아요 ${count}개`}>
    <LikeIcon aria-hidden="true">👍</LikeIcon>
    <LikeAmount>{count}</LikeAmount>
  </LikeBadge>
);

const QuestionList = ({
  questions = [],
  loading = false,
  error = null,
  currentSlide,
  onSelectSlide,
  emptyMessage = "아직 등록된 질문이 없습니다.",
  onComplete,
  onDelete,
}: QuestionListProps) => {
  const hasQuestions = Array.isArray(questions) && questions.length > 0;

  return (
    <LiveBox>
      <QuestionContainer>
        {loading && !hasQuestions && <StatusMessage>질문을 불러오는 중입니다.</StatusMessage>}

        {Boolean(error) && !loading && (
          <ErrorMessage>
            {typeof error === "object" && error !== null && "message" in error
              ? String((error as { message?: string }).message || "질문을 불러오지 못했습니다.")
              : "질문을 불러오지 못했습니다."}
          </ErrorMessage>
        )}

        {hasQuestions &&
          questions.map((question: QuestionListItem) => {
            if (!question) return null;
            const slideNumber =
              Number.isFinite(Number(question.slide)) && Number(question.slide) > 0
                ? Number(question.slide)
                : Number(question.slideNumber) || 1;
            const slideIndex =
              Number.isFinite(slideNumber) && slideNumber > 0 ? slideNumber - 1 : 0;
            const timestamp = question.time || formatTimestamp(question.ts ?? question.time);
            const likeCount = getQuestionLikeCount(question);

            return (
              <QuestionItem
                key={question.id ?? `${slideNumber}-${question.ts}`}
                $active={slideIndex === currentSlide}
              >
                <QuestionHeader>
                  <SlideTag
                    type="button"
                    onClick={() => onSelectSlide?.(slideIndex)}
                    $active={slideIndex === currentSlide}
                  >
                    슬라이드 {slideNumber}
                  </SlideTag>
                  {timestamp && <Time>{timestamp}</Time>}
                  <QuestionLikeBadge count={likeCount} />
                </QuestionHeader>
                <Content>{question.content ?? ""}</Content>
                <ActionGroup>
                  <ActionButton
                    type="button"
                    $variant="delete"
                    aria-label="질문 삭제"
                    onClick={() => onDelete?.(question.id)}
                  >
                    삭제
                  </ActionButton>
                  <ActionButton
                    type="button"
                    $variant="complete"
                    aria-label="질문 완료"
                    onClick={() => onComplete?.(question.id)}
                  >
                    완료
                  </ActionButton>
                </ActionGroup>
              </QuestionItem>
            );
          })}

        {!loading && !error && !hasQuestions && <StatusMessage>{emptyMessage}</StatusMessage>}
      </QuestionContainer>
    </LiveBox>
  );
};

export default QuestionList;
