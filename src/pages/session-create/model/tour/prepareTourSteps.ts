import type { TourStepContent } from "@/shared/lib/tour";

export const prepareTourSteps: TourStepContent[] = [
  {
    title: "보이니에 오신 걸 환영해요 👋",
    body: "먼저 세션 준비부터 안내해 드릴게요.\n1분이면 끝나요!",
  },
  {
    target: '[data-tour="slide-surface"]',
    title: "슬라이드 미리보기",
    body: "업로드한 슬라이드예요.\n방향키(←→↑↓)로 넘기며 순서와 내용을 확인하세요.",
    side: "bottom",
  },
  {
    target: '[data-tour="focus-button"]',
    title: "집중 유도",
    body: "세션 도중에 이 버튼을 누르면 모든 청중을 현재 슬라이드로 불러요.\n이전 슬라이드를 보고 있는 청중들의 시선을 다시 모을 때 유용해요.",
    side: "bottom",
    align: "start",
  },
  {
    target: '[data-tour="sticker-visibility"]',
    title: "리액션 스티커 표시",
    body: "내 발표 화면에서 청중의 리액션 스티커를 보이거나 숨겨요.\n발표에 집중하고 싶을 땐 꺼두세요.",
    side: "bottom",
    align: "end",
  },
  {
    target: '[data-tour="setting-question"]',
    title: "실시간 질문",
    body: "켜면 청중이 세션 도중에 질문을 남길 수 있어요. 끄면 질문창이 잠겨요.",
    side: "left",
  },
  {
    target: '[data-tour="setting-sticker"]',
    title: "리액션 스티커",
    body: "켜면 청중이 슬라이드에 리액션 스티커로 반응할 수 있어요.",
    side: "left",
  },
  {
    target: '[data-tour="setting-unlock"]',
    title: "다음 구간 슬라이드 공개",
    body: "켜면 청중이 다음 구간 슬라이드를 미리 볼 수 있어요.\n스포일러 방지를 위해선 꺼두세요.",
    side: "left",
  },
  {
    target: '[data-tour="setting-pdf"]',
    title: "PDF 다운로드 허용",
    body: "세션 종료 후 후기를 작성한 청중에게만 발표 자료를 PDF로 다운로드할 수 있게 할 수 있어요.",
    side: "left",
  },
  {
    target: '[data-tour="setting-broadcast"]',
    title: "깔끔한 발표 화면 열기",
    body: "외부 디스플레이(빔프로젝터, 보조 모니터 등)에 슬라이드만 띄우는 발표 화면을 열 수 있어요.",
    side: "left",
  },
  {
    target: '[data-tour="live-question-panel"]',
    title: "실시간 질문",
    body: "세션이 시작되면 청중 질문이 여기에 실시간으로 쌓여요.\n답변한 질문은 완료 처리할 수 있어요.",
    side: "left",
  },
  {
    target: '[data-tour="feedback-form-button"]',
    title: "세션 후기 질문 작성",
    body: "발표를 마친 후 청중에게 물어볼 후기 질문을 미리 만들어 두세요.\n세션이 끝난 후 AI 리포트에서 볼 수 있어요.",
    side: "bottom",
    align: "end",
  },
  {
    target: '[data-tour="share-button"]',
    title: "청중 초대",
    body: "세션 링크를 복사해 청중을 초대하세요.",
    side: "bottom",
    align: "end",
  },
  {
    target: '[data-tour="start-session-button"]',
    title: "이제 시작해 볼까요?",
    body: "준비가 끝나면 '세션 시작'을 눌러 발표를 시작하세요!",
    side: "bottom",
    align: "end",
  },
];
