import { driver } from "driver.js";
import type { Config, Driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import type { TourPreset, TourStepContent } from "./types";

const BASE_CONFIG: Config = {
  showProgress: true,
  progressText: "{{current}} / {{total}}",
  nextBtnText: "다음",
  prevBtnText: "이전",
  doneBtnText: "완료",
  popoverClass: "boini-tour",
  allowClose: true,
  // AI 리포트 등에서 다음 스텝으로 넘어갈 때 대상 섹션까지 부드럽게 스크롤.
  smoothScroll: true,
  // 방향키를 투어 네비게이션에서 떼어낸다 — 발표 화면의 슬라이드 이동(←→)과 충돌 방지.
  // (닫기는 X 버튼/오버레이 클릭으로 가능; ESC 는 함께 비활성화됨.)
  allowKeyboardControl: false,
  overlayColor: "#000",
  stagePadding: 6,
  stageRadius: 8,
};

const PRESET_CONFIG: Record<TourPreset, Partial<Config>> = {
  default: { overlayOpacity: 0.6 },
  // 라이브 중 방해 최소화: 화면을 거의 어둡게 하지 않고 스포트라이트만.
  quiet: { overlayOpacity: 0.15, popoverClass: "boini-tour boini-tour--quiet" },
};

export function baseTourConfig(preset: TourPreset): Config {
  return { ...BASE_CONFIG, ...PRESET_CONFIG[preset] };
}

export function toDriveSteps(steps: TourStepContent[]): DriveStep[] {
  return steps.map((step) => ({
    element: step.target,
    popover: {
      title: step.title,
      description: step.body,
      side: step.side,
      align: step.align,
    },
  }));
}

export interface TourDriverHandlers {
  onStep: (index: number) => void;
  onEnd: (completed: boolean, index: number | undefined) => void;
  onClosed: () => void;
}

export function createTourDriver(
  preset: TourPreset,
  steps: DriveStep[],
  handlers: TourDriverHandlers
): Driver {
  const driverObj: Driver = driver({
    ...baseTourConfig(preset),
    steps,
    onHighlightStarted: (_element, _step, opts) => {
      handlers.onStep(opts.state.activeIndex ?? 0);
    },
    // X/ESC/오버레이 클릭/마지막 완료 모두 여기로 온다. 마지막 스텝이면 완료로 간주.
    onDestroyStarted: () => {
      const completed = !driverObj.hasNextStep();
      handlers.onEnd(completed, driverObj.getActiveIndex());
      driverObj.destroy();
    },
    onDestroyed: () => {
      handlers.onClosed();
    },
  });
  return driverObj;
}
