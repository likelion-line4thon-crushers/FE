import React, { useEffect, useMemo, useState } from "react";
import type { ChangeEventHandler } from "react";
import type { QuickSettings } from "@/entities/session";
import websocketService from "@/shared/api/websocket";
import AudienceSVG from "@/shared/assets/images/people.svg";
import ChevronIcon from "@/shared/assets/images/chevron-down.svg";
import {
  PanelWrapper,
  Section,
  FillSection,
  Title,
  SectionHeader,
  SectionChevron,
  CollapsibleBody,
  CollapsibleInner,
  PreviewFrame,
  PreviewImage,
  PreviewEmpty,
  AudienceCountWrapper,
  AudienceChip,
  AudienceIcon,
  AudienceNum,
  AudienceCap,
  QuickTogglesGrid,
  ToggleBox,
  ToggleText,
  ToggleLabel,
  ToggleDescription,
  ToggleInput,
} from "./SettingsPanel.styles";
import LiveWaitingBox from "./LiveWaitingBox";

type SlideItem = string | null | { thumbnailUrl?: string };

interface SettingsPanelProps {
  quickSettings: QuickSettings;
  onOptionChange?: (optionKey: keyof QuickSettings, value: boolean) => void;
  onUnlockChange?: (value: boolean) => void;
  slides?: SlideItem[];
  currentSlide?: number;
  prepSettingsContent?: React.ReactNode;
}

interface AudienceCountPayload {
  audienceCount?: number;
}

interface AudienceCountProps {
  roomId?: string | null;
  audienceCapacity?: number;
  isWsReady?: boolean;
  initialAudienceCount?: number | null;
  variant?: "panel" | "chip";
}

interface QuickSettingToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
}

interface CollapsibleSectionProps {
  title: string;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}

const SettingsPanel = ({
  quickSettings,
  onOptionChange,
  onUnlockChange,
  slides = [],
  currentSlide = 0,
  prepSettingsContent = null,
}: SettingsPanelProps) => (
  <PanelWrapper>
    <NextSlidePreview slides={slides} currentSlide={currentSlide} />
    <SessionSettingsSection
      quickSettings={quickSettings}
      onOptionChange={onOptionChange}
      onUnlockChange={onUnlockChange}
      prepSettingsContent={prepSettingsContent}
    />
    <LiveQuestionSection quickSettings={quickSettings} />
  </PanelWrapper>
);

/* 접기/펼치기 가능한 섹션 셸 (prep/live 공용) */
const CollapsibleSection = ({
  title,
  defaultCollapsed = false,
  children,
}: CollapsibleSectionProps) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <Section>
      <SectionHeader
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-expanded={!collapsed}
      >
        {title}
        <SectionChevron src={ChevronIcon} alt="" aria-hidden="true" $collapsed={collapsed} />
      </SectionHeader>
      <CollapsibleBody $collapsed={collapsed} aria-hidden={collapsed}>
        <CollapsibleInner>{children}</CollapsibleInner>
      </CollapsibleBody>
    </Section>
  );
};

const resolveSlideSrc = (slide: SlideItem): string | null => {
  if (!slide) return null;
  if (typeof slide === "string") return slide || null;
  return slide.thumbnailUrl || null;
};

/* 다음 슬라이드 미리보기 (prep/live 공용) */
const NextSlidePreview = ({
  slides = [],
  currentSlide = 0,
}: {
  slides?: SlideItem[];
  currentSlide?: number;
}) => {
  const nextSrc = resolveSlideSrc(slides[currentSlide + 1]);
  const hasNext = currentSlide + 1 < slides.length;

  return (
    <CollapsibleSection title="다음 슬라이드 미리보기">
      <PreviewFrame>
        {nextSrc ? (
          <PreviewImage src={nextSrc} alt="다음 슬라이드 미리보기" />
        ) : (
          <PreviewEmpty>{hasNext ? "불러오는 중..." : "마지막 슬라이드입니다"}</PreviewEmpty>
        )}
      </PreviewFrame>
    </CollapsibleSection>
  );
};

const SessionSettingsSection = ({
  quickSettings = { sticker: true, question: true, feedback: true, unlock: true },
  onOptionChange = () => {},
  onUnlockChange = () => {},
  prepSettingsContent,
}: Pick<
  SettingsPanelProps,
  "quickSettings" | "onOptionChange" | "onUnlockChange" | "prepSettingsContent"
>) => (
  <CollapsibleSection title="세션 설정">
    <QuickTogglesGrid>
      <QuickSettingToggle
        label="실시간 질문"
        description="청중이 실시간으로 질문을 남길 수 있습니다."
        checked={quickSettings.question}
        onChange={(event) => onOptionChange?.("question", event.target.checked)}
      />
      <QuickSettingToggle
        label="리액션 스티커"
        description="청중이 리액션 스티커로 반응을 남길 수 있습니다."
        checked={quickSettings.sticker}
        onChange={(event) => onOptionChange?.("sticker", event.target.checked)}
      />
      <QuickSettingToggle
        label="다음 구간 슬라이드 공개하기"
        description="청중이 다음 슬라이드 화면들을 미리 볼 수 있습니다."
        checked={quickSettings.unlock}
        onChange={(event) => onUnlockChange?.(event.target.checked)}
      />
      {prepSettingsContent}
    </QuickTogglesGrid>
  </CollapsibleSection>
);

const AudienceCount = ({
  roomId,
  audienceCapacity = 50,
  isWsReady = false,
  initialAudienceCount = null,
  variant = "panel",
}: AudienceCountProps) => {
  const storageKey = useMemo(() => {
    if (!roomId) return null;
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
        if (Number.isFinite(parsed)) return parsed;
      } catch {
        // ignore
      }
    }

    return 0;
  });

  useEffect(() => {
    if (typeof initialAudienceCount === "number" && Number.isFinite(initialAudienceCount)) {
      setAudienceCount((prev) => (prev === initialAudienceCount ? prev : initialAudienceCount));
    }
  }, [initialAudienceCount]);

  useEffect(() => {
    if (!roomId || !isWsReady || !websocketService.getIsConnected()) return;

    const destination = `/topic/presentation/${roomId}/audienceCount`;
    const unsubscribe = websocketService.subscribe(destination, (payload) => {
      if (payload == null) return;

      if (typeof payload === "number" && Number.isFinite(payload)) {
        setAudienceCount(payload);
        if (storageKey && typeof window !== "undefined" && window.sessionStorage) {
          try {
            sessionStorage.setItem(storageKey, String(payload));
          } catch {
            // ignore
          }
        }
        return;
      }

      const payloadObject = payload as AudienceCountPayload;
      if (
        typeof payload === "object" &&
        typeof payloadObject.audienceCount === "number" &&
        Number.isFinite(payloadObject.audienceCount)
      ) {
        setAudienceCount(payloadObject.audienceCount);
        if (storageKey && typeof window !== "undefined" && window.sessionStorage) {
          try {
            sessionStorage.setItem(storageKey, String(payloadObject.audienceCount));
          } catch {
            // ignore
          }
        }
      }
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [roomId, isWsReady, storageKey]);

  const formattedAudienceCount = useMemo(() => {
    const normalized = Math.max(0, Math.min(audienceCapacity, Number(audienceCount) || 0));
    return String(normalized).padStart(2, "0");
  }, [audienceCount, audienceCapacity]);

  const Wrapper = variant === "chip" ? AudienceChip : AudienceCountWrapper;

  return (
    <Wrapper>
      <AudienceIcon src={AudienceSVG} alt="청중 아이콘" />
      <span>청중 수</span>
      <AudienceNum>
        {formattedAudienceCount}
        <AudienceCap>/{audienceCapacity}</AudienceCap>
      </AudienceNum>
    </Wrapper>
  );
};

const QuickSettingToggle = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: QuickSettingToggleProps) => (
  <ToggleBox>
    <ToggleText>
      <ToggleLabel>{label}</ToggleLabel>
      <ToggleDescription>{description}</ToggleDescription>
    </ToggleText>
    <ToggleInput
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      aria-label={label}
    />
  </ToggleBox>
);

const LiveQuestionSection = ({
  quickSettings = { question: true, sticker: true, feedback: true, unlock: true },
}: {
  quickSettings?: QuickSettings;
}) => (
  <FillSection>
    <Title>실시간 질문</Title>
    <LiveWaitingBox isQuestionEnabled={quickSettings.question} />
  </FillSection>
);

export default SettingsPanel;
export { QuickSettingToggle, AudienceCount, CollapsibleSection, NextSlidePreview };
