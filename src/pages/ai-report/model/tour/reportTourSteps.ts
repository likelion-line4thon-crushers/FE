import type { TourStepContent } from "@/shared/lib/tour";

export const reportTourSteps: TourStepContent[] = [
  {
    target: '[data-tour="report-totalReaction"]',
    title: "전체 반응 요약",
    body: "이번 세션에서 청중이 남긴 반응의 수를 한눈에 요약했어요.",
  },
  {
    target: '[data-tour="report-top3"]',
    title: "전체 질문 요약",
    body: "이번 세션에서 받은 질문들을 정리했어요.",
  },
  {
    target: '[data-tour="report-popularSlide"]',
    title: "인기 슬라이드",
    body: "스티커별로 반응이 가장 많았던 슬라이드를 나열했어요.",
  },
  {
    target: '[data-tour="report-questionSlide"]',
    title: "최다 질문 슬라이드",
    body: "가장 질문을 많이 받은 슬라이드를 뽑았어요.",
  },
  {
    target: '[data-tour="report-replaySlide"]',
    title: "여러 번 다시 본 슬라이드",
    body: "청중이 가장 많이 되돌아본 슬라이드예요.\n가장 흥미로웠거나 이해하기 어려웠던 지점일 수 있어요.",
  },
  {
    target: '[data-tour="report-review"]',
    title: "청중 후기",
    body: "이번 세션에 대한 만족도와 후기를 정리했어요.\n후기가 쌓이면 목록이 자동으로 새로고침돼요.",
  },
  {
    target: '[data-tour="csv-download-button"]',
    title: "CSV 다운로드",
    body: "청중이 남긴 후기를 CSV 파일로 다운로드받을 수도 있어요.",
    side: "bottom",
    align: "end",
  },
  {
    target: '[data-tour="exit-button"]',
    title: "나가기",
    body: "리포트 확인을 마쳤다면 여기를 눌러 나갈 수 있어요.\n수고하셨어요!",
    side: "bottom",
    align: "end",
  },
];
