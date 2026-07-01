import React from "react";
import { TabsBlock, TabsContainer, Tab } from "./QuestionTabs.styles";

type TabValue = "unanswered" | "completed";

interface QuestionTabsProps {
  value: TabValue;
  onChange: (v: TabValue) => void;
}

const QuestionTabs = ({ value, onChange }: QuestionTabsProps) => (
  <TabsBlock>
    <TabsContainer role="tablist" aria-label="질문 탭">
      <Tab
        type="button"
        $active={value === "unanswered"}
        onClick={() => onChange("unanswered")}
        role="tab"
        aria-selected={value === "unanswered"}
      >
        미답변
      </Tab>
      <Tab
        type="button"
        $active={value === "completed"}
        onClick={() => onChange("completed")}
        role="tab"
        aria-selected={value === "completed"}
      >
        답변 완료
      </Tab>
    </TabsContainer>
  </TabsBlock>
);

export default QuestionTabs;
