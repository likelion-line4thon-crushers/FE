import React from "react";
import {
    PanelWrapper,
    Section,
    Title,
    AudienceCountWrapper,
    AudienceIcon,
    AudienceNum,
    QuickTogglesGrid,
    ToggleBox,
    ToggleLabel,
    ToggleDescription,
    ToggleInput,
} from "./SettingsPanel.styles";

import AudienceSVG from "../../assets/images/people.svg";
import LiveWaitingBox from "./LiveWaitingBox";

const SettingsPanel = () => (
  <PanelWrapper>
    <QuickSettingsSection />
    <LiveQuestionSection />
  </PanelWrapper>
);

const QuickSettingsSection = () => (
    <Section>
        <Title>빠른 설정</Title>
        <AudienceCount />
        <QuickTogglesGrid>
            <QuickSettingToggle
                label="리액션 스티커"
                description="청중이 리액션 스티커로 반응을 남길 수 있습니다."
            />
            <QuickSettingToggle
                label="실시간 질문"
                description="청중이 실시간으로 질문을 남길 수 있습니다."
            />
            <QuickSettingToggle
                label="실시간 피드백"
                description="수집된 청중의 반응을 실시간으로 분석합니다."
            />
            <QuickSettingToggle
                label="다음 슬라이드 공개"
                description="청중이 다음 슬라이드 화면들을 미리 볼 수 있습니다."
            />
        </QuickTogglesGrid>
    </Section>
);

const AudienceCount = () => (
  <AudienceCountWrapper>
    <AudienceIcon src={AudienceSVG} alt="청중 아이콘" />
    <span>청중 수</span>
    <AudienceNum>00/50</AudienceNum>
  </AudienceCountWrapper>
);

const QuickSettingToggle = ({ label, description }) => (
  <ToggleBox>
    <ToggleLabel>{label}</ToggleLabel>
    <ToggleDescription>{description}</ToggleDescription>
    <ToggleInput type="checkbox" />
  </ToggleBox>
);

const LiveQuestionSection = () => (
  <Section>
    <Title>실시간 질문</Title>
    <LiveWaitingBox />
  </Section>
);

export default SettingsPanel;
export { QuickSettingToggle };
