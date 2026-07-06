import styled from "styled-components";
import type { AudienceVoiceQuestion } from "@/shared/api/ai-report";

interface QuestionVoiceCardProps {
  index: number;
  question: AudienceVoiceQuestion;
}

export function QuestionVoiceCard({ index, question }: QuestionVoiceCardProps) {
  return (
    <Wrap>
      <QuestionHeader>
        {index}. {question.questionText}
      </QuestionHeader>
      <Body>
        <SectionLabel>답변 모음</SectionLabel>
        <AnswerList>
          {question.answers.length === 0 ? (
            <EmptyText>아직 답변이 없습니다.</EmptyText>
          ) : (
            question.answers.map((answer, i) => <AnswerItem key={i}>{answer}</AnswerItem>)
          )}
        </AnswerList>
      </Body>
      <SummaryBar>
        <SummaryTag>BOiNi 정리</SummaryTag>
        <SummaryText>{question.summary}</SummaryText>
      </SummaryBar>
    </Wrap>
  );
}

export default QuestionVoiceCard;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  border: 0.1vw solid #eaeaea;
  border-radius: 0.8vw;
  overflow: hidden;
  background: #fff;
`;

const QuestionHeader = styled.div`
  padding: 1.4vh 1.4vw;
  font-size: clamp(13px, 0.95vw, 16px);
  font-weight: 600;
  color: #303030;
  border-bottom: 0.1vw solid #f0f0f0;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8vh;
  padding: 1.4vh 1.4vw;
`;

const SectionLabel = styled.span`
  font-size: clamp(12px, 0.85vw, 14px);
  font-weight: 600;
  color: #e74d07;
`;

const AnswerList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6vh;
  max-height: 22vh;
  overflow-y: auto;
`;

const AnswerItem = styled.li`
  font-size: clamp(12px, 0.85vw, 14px);
  color: #303030;
  &::before {
    content: "· ";
    color: #767676;
  }
`;

const EmptyText = styled.li`
  font-size: clamp(12px, 0.85vw, 14px);
  color: #999;
`;

const SummaryBar = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.6vw;
  background: #303030;
  color: #fff;
  padding: 1.2vh 1.4vw;
`;

const SummaryTag = styled.span`
  flex-shrink: 0;
  font-size: clamp(11px, 0.8vw, 13px);
  font-weight: 700;
  color: #ff8a4c;
`;

const SummaryText = styled.span`
  font-size: clamp(12px, 0.85vw, 14px);
  line-height: 1.5;
`;
