import React, { useEffect, useMemo, useState } from "react";
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
import websocketService from "../../services/websocketService";

const SettingsPanel = ({ 
  quickSettings,
  onOptionChange,
  onUnlockChange,
  roomId,
  audienceCapacity = 50,
  isWsReady = false,
}) => (
  <PanelWrapper>
    <QuickSettingsSection 
      quickSettings={quickSettings}
      onOptionChange={onOptionChange}
      onUnlockChange={onUnlockChange}
      roomId={roomId}
      audienceCapacity={audienceCapacity}
      isWsReady={isWsReady}
    />
    <LiveQuestionSection />
  </PanelWrapper>
);

const QuickSettingsSection = ({ 
  quickSettings = { sticker: true, question: true, feedback: true, unlock: true },
  onOptionChange = () => {},
  onUnlockChange = () => {},
  roomId,
  audienceCapacity,
  isWsReady,
}) => (
    <Section>
        <Title>빠른 설정</Title>
        <AudienceCount 
          roomId={roomId} 
          audienceCapacity={audienceCapacity}
          isWsReady={isWsReady}
        />
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

const AudienceCount = ({
  roomId,
  audienceCapacity = 50,
  isWsReady = false,
  initialAudienceCount = null,
}) => {
  const storageKey = useMemo(() => {
    if (!roomId) {
      return null;
    }
    return `boini_audience_count_${roomId}`;
  }, [roomId]);

  const [audienceCount, setAudienceCount] = useState(() => {
    if (typeof initialAudienceCount === "number" && Number.isFinite(initialAudienceCount)) {
      return initialAudienceCount;
    }

    if (storageKey && typeof window !== "undefined" && window.sessionStorage) {
      try {
        const stored = sessionStorage.getItem(storageKey);
        const parsed = Number(stored);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      } catch (_error) {
        // ignore storage read error
      }
    }

    return 0;
  });

  useEffect(() => {
    if (
      typeof initialAudienceCount === "number" &&
      Number.isFinite(initialAudienceCount)
    ) {
      setAudienceCount((prev) => {
        if (prev === initialAudienceCount) {
          return prev;
        }
        return initialAudienceCount;
      });
    }
  }, [initialAudienceCount]);

  useEffect(() => {
    if (!roomId || !isWsReady || !websocketService.getIsConnected()) {
      return;
    }

    const destination = `/topic/presentation/${roomId}/audienceCount`;

    const unsubscribe = websocketService.subscribe(destination, (payload) => {
      if (payload == null) {
        return;
      }

      if (typeof payload === "number" && Number.isFinite(payload)) {
        setAudienceCount(payload);
        if (storageKey && typeof window !== "undefined" && window.sessionStorage) {
          try {
            sessionStorage.setItem(storageKey, String(payload));
          } catch (_error) {
            // ignore storage write error
          }
        }
        return;
      }

      if (
        typeof payload === "object" &&
        typeof payload.audienceCount === "number" &&
        Number.isFinite(payload.audienceCount)
      ) {
        setAudienceCount(payload.audienceCount);
        if (storageKey && typeof window !== "undefined" && window.sessionStorage) {
          try {
            sessionStorage.setItem(storageKey, String(payload.audienceCount));
          } catch (_error) {
            // ignore storage write error
          }
        }
      }
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [roomId, isWsReady, storageKey]);

  const formattedAudienceCount = useMemo(() => {
    const normalized = Math.max(0, Math.min(audienceCapacity, Number(audienceCount) || 0));
    return String(normalized).padStart(2, "0");
  }, [audienceCount, audienceCapacity]);

  return (
    <AudienceCountWrapper>
      <AudienceIcon src={AudienceSVG} alt="청중 아이콘" />
      <span>청중 수</span>
      <AudienceNum>
        {formattedAudienceCount}/{audienceCapacity}
      </AudienceNum>
    </AudienceCountWrapper>
  );
};

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
export { QuickSettingToggle, AudienceCount };
