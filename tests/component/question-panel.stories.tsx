import React from "react";
import styled from "styled-components";
import type { NormalizedQuestion } from "@/entities/question";
import { PanelWrapper, Section, Title } from "@/widgets/presentation-layout";
import { AudienceCount } from "@/widgets/presentation-layout/ui/settings/SettingsPanel";
import QuestionList from "@/pages/presenter-room/ui/QuestionList";
import QuestionTabs from "@/pages/presenter-room/ui/QuestionTabs";
import { QuestionScrollArea } from "@/pages/presenter-room/ui/QuestionList.styles";
import {
  QuickTogglesList,
  ToggleRow,
  ToggleRowLabel,
  RowToggleInput,
} from "@/pages/presenter-room/ui/QuickSettings.styles";

const questions: NormalizedQuestion[] = [
  { id: "q0", roomId: "r", slide: 1, audienceId: null, content: "ghi", ts: Date.now() },
];

const QuestionSection = styled(Section)`
  position: relative;
  flex: 1;
  min-height: 40vh;
`;

export const PresenterRealStory = () => {
  const [tab, setTab] = React.useState<"unanswered" | "completed">("unanswered");
  return (
    <PanelWrapper>
      <Section>
        <Title>빠른 설정</Title>
        <AudienceCount audienceCapacity={50} />
        <QuickTogglesList>
          <ToggleRow>
            <ToggleRowLabel>실시간 질문</ToggleRowLabel>
            <RowToggleInput checked readOnly />
          </ToggleRow>
          <ToggleRow>
            <ToggleRowLabel>다음 슬라이드 공개</ToggleRowLabel>
            <RowToggleInput readOnly />
          </ToggleRow>
        </QuickTogglesList>
      </Section>
      <QuestionSection>
        <Title>실시간 질문</Title>
        <QuestionTabs value={tab} onChange={setTab} />
        <QuestionScrollArea>
          <QuestionList questions={questions} currentSlide={0} />
        </QuestionScrollArea>
      </QuestionSection>
    </PanelWrapper>
  );
};
