import styled from "styled-components";
import type { AudienceVoiceQuestion } from "@/shared/api/ai-report";

interface QuestionVoiceCardProps {
  index: number;
  question: AudienceVoiceQuestion;
  summarizationEnabled: boolean;
}

const WAITING_TEXT = "답변이 5개를 넘게 모이면 AI 요약이 제공됩니다.";

export function QuestionVoiceCard({
  index,
  question,
  summarizationEnabled,
}: QuestionVoiceCardProps) {
  const hasSummary = summarizationEnabled && Boolean(question.summary && question.summary.trim());
  return (
    <Block>
      {/* 1) 질문 제목 박스 (분리) */}
      <TitleBox>
        {index}. {question.questionText}
      </TitleBox>

      {/* 2) 답변 모음 박스 (분리, 내부 스크롤) */}
      <AnswersBox>
        <AnswersHeader>
          <Tick />
          <AnswersLabel>답변 모음</AnswersLabel>
        </AnswersHeader>
        <ListWrap>
          <AnswerList>
            {question.answers.length === 0 ? (
              <EmptyText>아직 답변이 없습니다.</EmptyText>
            ) : (
              question.answers.map((answer, i) => (
                <AnswerItem key={i}>
                  <Dot />
                  <AnswerText>{answer}</AnswerText>
                </AnswerItem>
              ))
            )}
          </AnswerList>
          {/* 하단 그라디언트 마스크: 더 스크롤할 내용이 있음을 표시 */}
          <FadeMask aria-hidden />
        </ListWrap>
      </AnswersBox>

      {/* 3) BOiNi 정리 다크 바 (답변 박스와 분리된 별도 요소).
          요약이 활성화되고 실제 요약이 있을 때만 요약을 보여주고, 그 외(답변 없음/미달)에는 안내 문구. */}
      <SummaryBar>
        <Brand>BOiNi 정리</Brand>
        <Divider>|</Divider>
        <SummaryText $waiting={!hasSummary}>
          {hasSummary ? question.summary : WAITING_TEXT}
        </SummaryText>
      </SummaryBar>
    </Block>
  );
}

export default QuestionVoiceCard;

const Block = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2vh;
  width: 100%;
`;

const TitleBox = styled.div`
  background: #ffffff;
  border: 0.13vw solid #eaeaea;
  border-radius: 16px;
  padding: 1.8vh 1.4vw;
  font-size: clamp(14px, 1vw, 20px);
  font-weight: 600;
  color: #5c5c5c;
  letter-spacing: -0.5px;
`;

const AnswersBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6vh;
  background: #fafafa;
  border: 0.1vw solid #eaeaea;
  border-radius: 12px;
  padding: 2.2vh 1.6vw;
`;

const AnswersHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8vh;
`;

const Tick = styled.span`
  width: clamp(18px, 1.4vw, 24px);
  height: 4px;
  border-radius: 2px;
  background: #e74d07;
`;

const AnswersLabel = styled.span`
  font-size: clamp(14px, 1vw, 20px);
  font-weight: 600;
  color: #434343;
  letter-spacing: -0.5px;
`;

const ListWrap = styled.div`
  position: relative;
`;

const AnswerList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9vh;
  /* Fixed-height answer box: the list scrolls inside the card, never the section. */
  height: 30vh;
  overflow-y: auto;
`;

// 스크롤이 더 있음을 알리는 하단 페이드. 답변 박스 배경(#fafafa)으로 자연스럽게 사라진다.
const FadeMask = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 5vh;
  pointer-events: none;
  border-radius: 0 0 12px 12px;
  background: linear-gradient(to bottom, rgba(250, 250, 250, 0), #fafafa 92%);
`;

const AnswerItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.6vw;
`;

const Dot = styled.span`
  flex-shrink: 0;
  width: 4px;
  height: 4px;
  margin-top: 0.9vh;
  border-radius: 50%;
  background: #767676;
`;

const AnswerText = styled.span`
  font-size: clamp(13px, 0.95vw, 16px);
  color: #5c5c5c;
  line-height: 1.5;
  letter-spacing: -0.4px;
`;

const EmptyText = styled.li`
  font-size: clamp(13px, 0.95vw, 16px);
  color: #999;
`;

const SummaryBar = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.6vw;
  background: #303030;
  border: 0.13vw solid #eaeaea;
  border-radius: 16px;
  padding: 1.6vh 1.4vw;
`;

const Brand = styled.span`
  flex-shrink: 0;
  font-size: clamp(12px, 0.9vw, 16px);
  font-weight: 700;
  color: #ff8a4c;
  letter-spacing: -0.4px;
`;

const Divider = styled.span`
  flex-shrink: 0;
  color: #767676;
`;

const SummaryText = styled.span<{ $waiting?: boolean }>`
  font-size: clamp(12px, 0.9vw, 16px);
  color: ${({ $waiting }) => ($waiting ? "#bdbdbd" : "#ffffff")};
  line-height: 1.5;
  letter-spacing: -0.4px;
`;
