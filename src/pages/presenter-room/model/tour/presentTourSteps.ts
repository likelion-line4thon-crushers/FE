import type { TourStepContent } from "@/shared/lib/tour";

export const presentTourSteps: TourStepContent[] = [
  {
    target: '[data-tour="slide-surface"]',
    title: "발표 화면",
    body: "청중이 보는 현재 슬라이드예요.\n방향키로 넘기고, 우측 상단 타이머로 시간을 확인하세요.",
    side: "bottom",
  },
  {
    target: '[data-tour="present-settings"]',
    title: "세션 설정",
    body: "모든 설정은 발표 중에도 언제든 켜고 끌 수 있어요.",
    side: "left",
  },
  {
    target: '[data-tour="start-session-button"]',
    title: "세션 종료",
    body: "발표를 마치면 이 버튼을 눌러 세션을 종료하세요. ",
    side: "bottom",
    align: "end",
  },
];
