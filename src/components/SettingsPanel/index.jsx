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

const SettingsPanel = ({ 
  quickSettings,
  onOptionChange,
  onUnlockChange,
}) => (
  <PanelWrapper>
    <QuickSettingsSection 
      quickSettings={quickSettings}
      onOptionChange={onOptionChange}
      onUnlockChange={onUnlockChange}
    />
    <LiveQuestionSection />
  </PanelWrapper>
);

const QuickSettingsSection = ({ 
  quickSettings = { sticker: true, question: true, feedback: true, unlock: true },
  onOptionChange = () => {},
  onUnlockChange = () => {},
}) => (
    <Section>
        <Title>빠른 설정</Title>
        <AudienceCount />
        <QuickTogglesGrid>
            <QuickSettingToggle
                label="리액션 스티커"
                description="청중이 리액션 스티커로 반응을 남길 수 있습니다."
                checked={quickSettings.sticker}
                onChange={(event) => onOptionChange("sticker", event.target.checked)}
            />
            <QuickSettingToggle
                label="실시간 질문"
                description="청중이 실시간으로 질문을 남길 수 있습니다."
                checked={quickSettings.question}
                onChange={(event) => onOptionChange("question", event.target.checked)}
            />
            <QuickSettingToggle
                label="실시간 피드백"
                description="수집된 청중의 반응을 실시간으로 분석합니다."
                checked={quickSettings.feedback}
                onChange={(event) => onOptionChange("feedback", event.target.checked)}
            />
            <QuickSettingToggle
                label="다음 슬라이드 공개"
                description="청중이 다음 슬라이드 화면들을 미리 볼 수 있습니다."
                checked={quickSettings.unlock}
                onChange={(event) => onUnlockChange(event.target.checked)}
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

const QuickSettingToggle = ({ label, description, checked, onChange, disabled }) => (
  <ToggleBox>
    <ToggleLabel>{label}</ToggleLabel>
    <ToggleDescription>{description}</ToggleDescription>
    <ToggleInput 
      type="checkbox" 
      checked={checked}
      onChange={onChange}
      disabled={disabled}
    />
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
