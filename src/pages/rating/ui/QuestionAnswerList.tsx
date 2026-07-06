import styled from "styled-components";
import type { FeedbackQuestion } from "@/shared/api/feedback-questions";

interface QuestionAnswerListProps {
  questions: FeedbackQuestion[];
  answers: Record<number, string>;
  onAnswerChange: (questionId: number, value: string) => void;
  hasCustomQuestions: boolean;
  comment: string;
  onCommentChange: (value: string) => void;
  disabled?: boolean;
}

export function QuestionAnswerList({
  questions,
  answers,
  onAnswerChange,
  hasCustomQuestions,
  comment,
  onCommentChange,
  disabled,
}: QuestionAnswerListProps) {
  if (!hasCustomQuestions) {
    return (
      <Field>
        <FieldLabel htmlFor="fallback-comment">세션에 대한 후기를 남겨주세요!</FieldLabel>
        <AnswerTextArea
          id="fallback-comment"
          placeholder="여러분의 한 마디가 세션 진행자에게 큰 도움이 됩니다 :)"
          value={comment}
          disabled={disabled}
          maxLength={2000}
          onChange={(e) => onCommentChange(e.target.value)}
        />
      </Field>
    );
  }

  return (
    <List>
      {questions.map((q, index) => (
        <Field key={q.id ?? index}>
          <FieldLabel htmlFor={`answer-${q.id ?? index}`}>{index + 1}번 질문 문항</FieldLabel>
          <QuestionText>{q.questionText}</QuestionText>
          <AnswerInput
            id={`answer-${q.id ?? index}`}
            placeholder="답변을 입력해 주세요."
            value={answers[q.id as number] ?? ""}
            disabled={disabled}
            maxLength={2000}
            onChange={(e) => onAnswerChange(q.id as number, e.target.value)}
          />
        </Field>
      ))}
    </List>
  );
}

export default QuestionAnswerList;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6vh;
  width: 100%;
  overflow-y: auto;
  padding-right: 0.5vw;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6vh;
  width: 100%;
`;

const FieldLabel = styled.label`
  font-size: clamp(13px, 0.95vw, 15px);
  font-weight: 600;
  color: #111;
`;

const QuestionText = styled.p`
  margin: 0;
  font-size: clamp(12px, 0.85vw, 14px);
  color: #505050;
`;

const AnswerInput = styled.input`
  border: 0.1vw solid #e5e5ec;
  border-radius: 0.4vw;
  padding: 1.2vh 1vw;
  font-size: clamp(12px, 0.85vw, 14px);
  color: #303030;
  outline: none;
  &:focus {
    border-color: #e8541e;
  }
  &::placeholder {
    color: #767676;
  }
`;

const AnswerTextArea = styled.textarea`
  min-height: 12vh;
  resize: none;
  border: 0.1vw solid #e5e5ec;
  border-radius: 0.4vw;
  padding: 1.2vh 1vw;
  font-size: clamp(12px, 0.9vw, 15px);
  color: #303030;
  outline: none;
  &:focus {
    border-color: #e8541e;
  }
  &::placeholder {
    color: #b5b5b5;
  }
`;
