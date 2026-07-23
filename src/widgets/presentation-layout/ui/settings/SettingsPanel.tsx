import React, { useEffect, useMemo, useState } from "react";
import type { ChangeEventHandler } from "react";
import type { QuickSettings } from "@/entities/session";
import websocketService from "@/shared/api/websocket";
import { DEFAULT_AUDIENCE_CAPACITY } from "@/shared/config/audience";
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
  dataTour?: string;
}

interface CollapsibleSectionProps {
  title: string;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
  // 온보딩 투어가 시작 전 자동으로 펼칠 수 있도록 헤더에 data-tour-expand 를 단다.
  expandableForTour?: boolean;
  // 온보딩 투어 앵커 — 섹션 전체를 하이라이트할 때 사용.
  dataTour?: string;
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
  expandableForTour = false,
  dataTour,
}: CollapsibleSectionProps) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <Section data-tour={dataTour}>
      <SectionHeader
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-expanded={!collapsed}
        data-tour-expand={expandableForTour ? "" : undefined}
      >
        {title}
        <SectionChevron src={ChevronIcon} alt="" aria-hidden="true" $collapsed={collapsed} />
      </SectionHeader>
      <CollapsibleBody $collapsed={collapsed} aria-hidden={collapsed}>
        {/* inert: 접힌 상태에서 내부 컨트롤을 탭 순서/접근성 트리에서 제거 */}
        <CollapsibleInner inert={collapsed}>{children}</CollapsibleInner>
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
  <CollapsibleSection title="세션 설정" expandableForTour>
    <QuickTogglesGrid>
      <QuickSettingToggle
        label="실시간 질문"
        description="청중이 실시간으로 질문을 남길 수 있습니다."
        checked={quickSettings.question}
        onChange={(event) => onOptionChange?.("question", event.target.checked)}
        dataTour="setting-question"
      />
      <QuickSettingToggle
        label="리액션 스티커"
        description="청중이 리액션 스티커로 반응을 남길 수 있습니다."
        checked={quickSettings.sticker}
        onChange={(event) => onOptionChange?.("sticker", event.target.checked)}
        dataTour="setting-sticker"
      />
      <QuickSettingToggle
        label="다음 구간 슬라이드 공개하기"
        description="청중이 다음 슬라이드 화면들을 미리 볼 수 있습니다."
        checked={quickSettings.unlock}
        onChange={(event) => onUnlockChange?.(event.target.checked)}
        dataTour="setting-unlock"
      />
      {prepSettingsContent}
    </QuickTogglesGrid>
  </CollapsibleSection>
);

const AudienceCount = ({
  roomId,
  audienceCapacity = DEFAULT_AUDIENCE_CAPACITY,
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
  dataTour,
}: QuickSettingToggleProps) => (
  <ToggleBox data-tour={dataTour}>
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
  <FillSection data-tour="live-question-panel">
    <Title>실시간 질문</Title>
    <LiveWaitingBox isQuestionEnabled={quickSettings.question} />
  </FillSection>
);

export default SettingsPanel;
export { QuickSettingToggle, AudienceCount, CollapsibleSection, NextSlidePreview };
