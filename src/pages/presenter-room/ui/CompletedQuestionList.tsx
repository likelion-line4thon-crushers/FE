import React from "react";
import type { NormalizedQuestion } from "@/entities/question";
import {
  LiveBox,
  QuestionContainer,
  QuestionItem,
  QuestionHeader,
  Time,
  Content,
  StatusMessage,
  ErrorMessage,
  ActionGroup,
} from "./QuestionList.styles";
import { RevertButton, RefreshIconWrapper, ReadOnlySlideTag } from "./CompletedQuestionList.styles";

interface CompletedQuestionListProps {
  questions: NormalizedQuestion[];
  loading: boolean;
  error: unknown;
}

const formatTimestamp = (ts: number | null | undefined): string => {
  if (ts === null || ts === undefined) return "";
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
};

const RefreshIcon = () => (
  <RefreshIconWrapper>
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8.5 5A3.5 3.5 0 1 1 5 1.5c1.05 0 1.99.46 2.64 1.19L6.5 3.83h2.5V1.33L7.97 2.36A4.5 4.5 0 1 0 9.5 5h-1Z"
        fill="currentColor"
      />
    </svg>
  </RefreshIconWrapper>
);

const CompletedQuestionList = ({ questions, loading, error }: CompletedQuestionListProps) => {
  const hasQuestions = Array.isArray(questions) && questions.length > 0;

  return (
    <LiveBox>
      <QuestionContainer>
        {loading && !hasQuestions && (
          <StatusMessage>완료된 질문을 불러오는 중입니다.</StatusMessage>
        )}

        {Boolean(error) && !loading && (
          <ErrorMessage>
            {typeof error === "object" && error !== null && "message" in error
              ? String((error as { message?: string }).message || "질문을 불러오지 못했습니다.")
              : "질문을 불러오지 못했습니다."}
          </ErrorMessage>
        )}

        {hasQuestions &&
          questions.map((question) => {
            if (!question) return null;
            const slideNumber =
              Number.isFinite(Number(question.slide)) && Number(question.slide) > 0
                ? Number(question.slide)
                : 1;
            const timestamp = formatTimestamp(question.ts);

            return (
              <QuestionItem key={question.id} $active={false}>
                <QuestionHeader>
                  <ReadOnlySlideTag>슬라이드 {slideNumber}</ReadOnlySlideTag>
                  {timestamp && <Time>{timestamp}</Time>}
                  <ActionGroup>
                    {/* TODO: wire 되돌리기 once BE PATCH .../uncomplete endpoint exists */}
                    <RevertButton type="button" disabled aria-label="되돌리기">
                      <RefreshIcon />
                      되돌리기
                    </RevertButton>
                  </ActionGroup>
                </QuestionHeader>
                <Content>{question.content ?? ""}</Content>
              </QuestionItem>
            );
          })}

        {!loading && !error && !hasQuestions && (
          <StatusMessage>완료된 질문이 없습니다.</StatusMessage>
        )}
      </QuestionContainer>
    </LiveBox>
  );
};

export default CompletedQuestionList;
