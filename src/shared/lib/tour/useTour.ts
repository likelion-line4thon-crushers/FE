import { useCallback, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { usePostHog } from "@posthog/react";
import type { Driver } from "driver.js";
import { ANALYTICS_EVENTS, ANALYTICS_GROUP_SESSION } from "@/shared/config/analytics-events";
import { createTourDriver, toDriveSteps } from "./driver-config";
import { tourReplayRequestAtom } from "./tour-atoms";
import { tourSeen } from "./tour-seen";
import type { TourPreset, TourStepContent, TourSurface } from "./types";

const MIN_DESKTOP_WIDTH = 1024;
const AUTO_START_DELAY_MS = 400;

// 투어 대상이 접힌 CollapsibleSection 안에 있을 수 있다(수동 재생 시). 시작 직전에
// data-tour-expand 로 표시된 "접힌" 섹션 헤더만 눌러 펼친다. 이미 펼쳐져 있으면
// (aria-expanded="true") 선택되지 않으므로 자동 실행 경로에서는 no-op 이다.
function expandCollapsedTourSections() {
  if (typeof document === "undefined") return;
  document
    .querySelectorAll<HTMLElement>('[data-tour-expand][aria-expanded="false"]')
    .forEach((header) => header.click());
}

interface UseTourOptions {
  surface: TourSurface;
  steps: TourStepContent[];
  /** Readiness gate — the tour only auto-starts once this is true and anchors exist. */
  enabled: boolean;
  preset?: TourPreset;
  roomId?: string | null;
}

export function useTour({ surface, steps, enabled, preset = "default", roomId }: UseTourOptions): {
  startTour: () => void;
} {
  const posthog = usePostHog();
  const [replayRequest, setReplayRequest] = useAtom(tourReplayRequestAtom);
  const driverRef = useRef<Driver | null>(null);
  const autoStartedRef = useRef(false);
  // 최신 steps/roomId 를 콜백에서 안정적으로 참조 (start 재생성 없이).
  const stepsRef = useRef(steps);
  const roomIdRef = useRef(roomId);
  stepsRef.current = steps;
  roomIdRef.current = roomId;

  const start = useCallback(
    (trigger: "auto" | "manual") => {
      if (driverRef.current) return;
      const currentSteps = stepsRef.current;
      if (!currentSteps.length) return;

      const currentRoomId = roomIdRef.current;
      posthog?.capture(ANALYTICS_EVENTS.ONBOARDING_TOUR_STARTED, { surface, trigger });
      if (currentRoomId) posthog?.group(ANALYTICS_GROUP_SESSION, currentRoomId);

      const driverObj = createTourDriver(preset, toDriveSteps(currentSteps), {
        onStep: (index) => {
          posthog?.capture(ANALYTICS_EVENTS.ONBOARDING_TOUR_STEP_VIEWED, {
            surface,
            step_index: index,
          });
        },
        onEnd: (completed, index) => {
          posthog?.capture(
            completed
              ? ANALYTICS_EVENTS.ONBOARDING_TOUR_COMPLETED
              : ANALYTICS_EVENTS.ONBOARDING_TOUR_SKIPPED,
            { surface, step_index: index }
          );
          tourSeen.markSeen(surface);
        },
        onClosed: () => {
          driverRef.current = null;
        },
      });

      // 접힌 "세션 설정" 섹션 안의 앵커(prepare 스텝 5~9)가 숨어 있으면 시작 직전에 펼친다.
      // .click() 은 discrete 이벤트라 collapsed 상태가 동기 flush 된다. 펼침 CSS 전환(~0.28s)은
      // 사용자가 스텝 1→5 를 직접 넘겨오는 시간(사람이 4번 클릭)보다 훨씬 짧아, 그 앵커에 도달할 땐
      // 항상 최종 레이아웃이다(인포메이션 투어라 자동 진행 없음). 자동 실행/다른 서페이스에선 no-op.
      expandCollapsedTourSections();

      driverRef.current = driverObj;
      driverObj.drive();
    },
    [posthog, preset, surface]
  );

  // 첫 방문 자동 실행 — 데스크톱 & 미열람 & 준비 완료일 때 한 번만.
  // ⚠️ StrictMode 이중 마운트 대비: ref 는 타이머가 "실제로 실행될 때" 세팅한다.
  //    스케줄 전에 세팅하면, cleanup 이 타이머를 취소한 뒤 재마운트에서 ref 가드에 막혀
  //    자동 실행이 영영 일어나지 않는다.
  useEffect(() => {
    if (autoStartedRef.current || !enabled) return;
    if (tourSeen.isSeen(surface)) return;
    if (typeof window !== "undefined" && window.innerWidth < MIN_DESKTOP_WIDTH) return;
    const timer = setTimeout(() => {
      autoStartedRef.current = true;
      start("auto");
    }, AUTO_START_DELAY_MS);
    return () => clearTimeout(timer);
  }, [enabled, surface, start]);

  // 헤더 "가이드" 버튼 재생 요청 — 우리 서페이스면 시작하고 요청 플래그를 비운다.
  useEffect(() => {
    if (replayRequest !== surface) return;
    setReplayRequest(null);
    start("manual");
  }, [replayRequest, surface, setReplayRequest, start]);

  // 언마운트 시 열려 있던 투어 정리 (네비게이션 이탈 대비).
  useEffect(
    () => () => {
      driverRef.current?.destroy();
      driverRef.current = null;
    },
    []
  );

  return { startTour: useCallback(() => start("manual"), [start]) };
}
