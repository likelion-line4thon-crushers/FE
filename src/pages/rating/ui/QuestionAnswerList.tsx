import styled from "styled-components";
import type { FeedbackQuestion } from "@/shared/api/feedback-questions";

interface QuestionAnswerListProps {
  questions: FeedbackQuestion[];
  answers: Record<number, string>;
  onAnswerChange: (questionId: number, value: string) => void;
  disabled?: boolean;
}

export function QuestionAnswerList({
  questions,
  answers,
  onAnswerChange,
  disabled,
}: QuestionAnswerListProps) {
  return (
    <List>
      {questions.map((q, index) => (
        <Field key={q.id ?? index}>
          <FieldLabel htmlFor={`answer-${q.id ?? index}`}>{q.questionText}</FieldLabel>
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
  /* Fill the remaining FeedbackBox height and scroll internally so a long
     question list scrolls in place instead of growing the page. */
  flex: 1 1 0;
  min-height: 0;
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
