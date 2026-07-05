import React, { useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import type { NormalizedQuestion } from "@/entities/question";
import {
  PanelWrapper,
  HeaderBox,
  Section,
  Title,
  QuestionList,
  QuestionScrollArea,
  QuestionItem,
  HeaderRow,
  SlideLabel,
  Timestamp,
  QuestionText,
  LikeActionRow,
  LikeButton,
  LikeIcon,
  LikeCount,
  Scrollbar,
  QuestionInputContainer,
  QuestionInput,
  SubmitButton,
  LockBanner,
  WaitingMessage,
  StatusMessage,
  ErrorMessage,
  EmptyMessage,
} from "./AudiencePanel.styles";
import LockIcon from "@/shared/assets/images/lock.png";
import Arrow from "@/shared/assets/images/upArrow.png";

interface FormattedQuestion {
  id: string;
  slideIndex: number;
  slideNumber: number;
  timestampLabel: string;
  content: string;
  likeCount: number;
  likedByMe: boolean;
}

interface AudiencePanelProps {
  currentSlide: number;
  onSelectSlide?: (slideIndex: number) => void;
  questions?: NormalizedQuestion[];
  isWaiting?: boolean;
  waitingMessage?: string;
  questionsLoading?: boolean;
  questionsError?: unknown;
  onSubmitQuestion?: (content: string) => Promise<void>;
  onToggleQuestionLike?: (questionId: string) => void;
  canSubmit?: boolean;
  isLocked?: boolean;
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

const resolveErrorMessage = (error: unknown, fallback: string) => {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null) {
    const responseMessage = (error as { response?: { data?: { message?: string } } }).response?.data
      ?.message;
    if (responseMessage) return responseMessage;
    const message = (error as { message?: string }).message;
    if (message) return message;
  }
  return fallback;
};

const AudiencePanel = ({
  currentSlide,
  onSelectSlide,
  questions = [],
  isWaiting = false,
  waitingMessage = "세션 대기중입니다.",
  questionsLoading = false,
  questionsError = null,
  onSubmitQuestion,
  onToggleQuestionLike,
  canSubmit = true,
  isLocked = false,
}: AudiencePanelProps) => {
  const [questionText, setQuestionText] = useState("");
  const [isInputting, setIsInputting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formattedQuestions: FormattedQuestion[] = (Array.isArray(questions) ? questions : [])
    .map((question) => {
      if (!question) return null;
      const slideNumber = Number(question.slide);
      const normalizedSlide = Number.isFinite(slideNumber) ? Math.max(1, slideNumber) : 1;
      return {
        id: question.id ?? `${normalizedSlide}-${question.ts}`,
        slideIndex: normalizedSlide - 1,
        slideNumber: normalizedSlide,
        timestampLabel: formatTimestamp(question.ts),
        content: question.content ?? "",
        likeCount: Math.max(0, Number(question.likeCount) || 0),
        likedByMe: Boolean(question.likedByMe),
      };
    })
    .filter((question): question is FormattedQuestion => question !== null);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setQuestionText(value);
    setIsInputting(value.trim().length > 0);
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async () => {
    const trimmed = questionText.trim();
    if (!trimmed) return;
    if (typeof onSubmitQuestion !== "function") return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await onSubmitQuestion(trimmed);
      setQuestionText("");
      setIsInputting(false);
    } catch (error) {
      setSubmitError(resolveErrorMessage(error, "질문 전송에 실패했습니다."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSubmit();
    }
  };

  const handleSelectSlide = (slideIndex: number) => {
    if (typeof onSelectSlide === "function") {
      onSelectSlide(slideIndex);
    }
  };

  const handleToggleQuestionLike = (questionId: string) => {
    onToggleQuestionLike?.(questionId);
  };

  const inputDisabled = isLocked || !canSubmit || isSubmitting;
  const showSubmitButton = isInputting && !inputDisabled;
  const showLoadingMessage = questionsLoading && formattedQuestions.length === 0;
  const showEmptyMessage = !questionsLoading && !questionsError && formattedQuestions.length === 0;
  const connectionMessage = !canSubmit && !isLocked ? "발표자와의 연결을 기다리고 있습니다." : null;

  return (
    <PanelWrapper>
      <HeaderBox>
        <Title>실시간 질문</Title>
      </HeaderBox>
      <Section>
        <QuestionList>
          <QuestionScrollArea $isWaiting={isWaiting}>
            {isWaiting ? (
              <WaitingMessage>{waitingMessage}</WaitingMessage>
            ) : (
              <>
                {showLoadingMessage && <StatusMessage>질문을 불러오는 중입니다.</StatusMessage>}

                {questionsError && !showLoadingMessage && (
                  <ErrorMessage>
                    {resolveErrorMessage(
                      questionsError,
                      "질문을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
                    )}
                  </ErrorMessage>
                )}

                {formattedQuestions.map(
                  ({
                    id,
                    slideIndex,
                    slideNumber,
                    timestampLabel,
                    content,
                    likeCount,
                    likedByMe,
                  }) => (
                    <QuestionItem key={id} $active={slideIndex === currentSlide}>
                      <HeaderRow>
                        <SlideLabel
                          type="button"
                          onClick={() => handleSelectSlide(slideIndex)}
                          $active={slideIndex === currentSlide}
                        >
                          슬라이드 {slideNumber}
                        </SlideLabel>
                        {timestampLabel && <Timestamp>{timestampLabel}</Timestamp>}
                      </HeaderRow>

                      <QuestionText>{content}</QuestionText>
                      <LikeActionRow>
                        <LikeButton
                          type="button"
                          $active={likedByMe}
                          aria-label="질문 좋아요"
                          aria-pressed={likedByMe}
                          onClick={() => handleToggleQuestionLike(id)}
                        >
                          <LikeIcon aria-hidden="true">👍</LikeIcon>
                          <LikeCount>{likeCount}</LikeCount>
                        </LikeButton>
                      </LikeActionRow>
                    </QuestionItem>
                  )
                )}

                {showEmptyMessage && <EmptyMessage>아직 등록된 질문이 없습니다.</EmptyMessage>}

                {submitError && <ErrorMessage>{submitError}</ErrorMessage>}
                {connectionMessage && <StatusMessage>{connectionMessage}</StatusMessage>}
              </>
            )}
          </QuestionScrollArea>

          {!isWaiting && isLocked && (
            <LockBanner>
              <img src={LockIcon} alt="잠금" width={20} height={20} />
              <span>실시간 질문 기능이 잠겼습니다</span>
            </LockBanner>
          )}

          {!isWaiting && !isLocked && (
            <QuestionInputContainer $isInputting={isInputting} $disabled={inputDisabled}>
              <QuestionInput
                value={questionText}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="질문 내용을 작성해 주세요"
                $isInputting={isInputting}
                disabled={inputDisabled}
              />
              {showSubmitButton && (
                <SubmitButton
                  type="button"
                  onClick={handleSubmit}
                  disabled={inputDisabled}
                  aria-label="질문 제출"
                >
                  <img src={Arrow} alt="제출" width={26} height={26} />
                </SubmitButton>
              )}
            </QuestionInputContainer>
          )}
        </QuestionList>

        {!isWaiting && <Scrollbar />}
      </Section>
    </PanelWrapper>
  );
};

export default AudiencePanel;
