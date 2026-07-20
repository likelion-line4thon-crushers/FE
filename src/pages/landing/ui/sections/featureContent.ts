import SyncIcon from "@/shared/assets/icons/landing/glass-tabs.svg";
import FaceGrinIcon from "@/shared/assets/icons/landing/glass-face-grin.svg";
import SliderIcon from "@/shared/assets/icons/landing/glass-slider.svg";
import HelpChatIcon from "@/shared/assets/icons/landing/glass-help-chat.svg";
import MagicWandIcon from "@/shared/assets/icons/landing/glass-magic-wand-sparkle.svg";
import TasksIcon from "@/shared/assets/icons/landing/glass-tasks.svg";
import BulletListIcon from "@/shared/assets/icons/landing/glass-bullet-list.svg";
import DownloadIcon from "@/shared/assets/icons/landing/glass-cloud-download.svg";
import ThumbsUpIcon from "@/shared/assets/icons/landing/glass-thumbs-up.svg";
import SquareChartIcon from "@/shared/assets/icons/landing/glass-square-chart-line.svg";
import SparkleIcon from "@/shared/assets/icons/landing/glass-sparkle.svg";
import FileIcon from "@/shared/assets/icons/landing/glass-file.svg";

// 섹션 레이아웃 패밀리 — 같은 패밀리가 연속 3회 이상 반복되지 않도록 배치한다.
export type FeatureLayout = "media-right" | "media-left" | "two-up" | "wide";
export type FeatureBg = "white" | "mist";

export interface FeatureMediaSlot {
  label: string;
  // 시안(1920px 기준) 픽셀 크기 — max-width와 aspect-ratio로만 사용
  width: number;
  height: number;
  // 미디어 아래에 노출되는 캡션 (two-up 레이아웃용)
  caption?: string;
  // videos/landing/demo-{N}.webm 또는 images/landing/demo-{N}.webp(png)가 있으면 렌더
  demo?: number;
}

export interface FeatureBullet {
  icon: string;
  title: string;
  description: string;
}

export interface FeatureContent {
  id: string;
  title: string;
  description: string;
  layout: FeatureLayout;
  bg: FeatureBg;
  mediaSlots: FeatureMediaSlot[];
  bullets: FeatureBullet[];
  // 미디어를 프레임(테두리·라운딩) 없이 원본 그대로 노출한다
  bareMedia?: boolean;
}

export const FEATURE_SECTIONS: FeatureContent[] = [
  {
    id: "sync-reaction",
    title: "슬라이드 위로\n반응이 쏟아져요",
    description: "발표자와 청중이 같은 슬라이드를 실시간으로 함께 봐요.",
    layout: "media-right",
    bg: "white",
    bareMedia: true,
    mediaSlots: [
      { label: "청중 화면, 슬라이드 동기화와 리액션", width: 1300, height: 760, demo: 1 },
    ],
    bullets: [
      {
        icon: SyncIcon,
        title: "실시간 슬라이드 동기화",
        description: "발표자가 슬라이드를 넘기면 청중도 같이 넘어가요.",
      },
      {
        icon: FaceGrinIcon,
        title: "원하는 위치에 반응 남기기",
        description: "슬라이드 위 어디에나 스티커로 반응해요.",
      },
      {
        icon: SliderIcon,
        title: "내 방식대로 보기",
        description: "발표자를 따라가지 않아도 되고, 스티커를 끌 수도 있어요.",
      },
    ],
  },
  {
    id: "live-qna",
    title: "질문은 그 자리에서,\n정리는 AI가 해요",
    description: "청중은 궁금한 순간 바로 질문하고, 발표자는 원할 때 답변해요.",
    layout: "media-left",
    bg: "white",
    bareMedia: true,
    mediaSlots: [
      { label: "발표자 화면, 실시간 질문과 AI 질문 묶음", width: 1410, height: 800, demo: 2 },
    ],
    bullets: [
      {
        icon: HelpChatIcon,
        title: "흐름을 끊지 않는 질문",
        description: "손 들 필요 없이, 기다릴 필요 없이 그 자리에서 남겨요.",
      },
      {
        icon: MagicWandIcon,
        title: "비슷한 질문은 모아서 보기",
        description: "질문이 쏟아져도 보기 쉽게 AI가 알아서 묶어줘요.",
      },
      {
        icon: TasksIcon,
        title: "손쉬운 질문 관리",
        description: "답변한 질문은 완료로 표시해 깔끔하게 숨겨요.",
      },
    ],
  },
  {
    id: "survey",
    title: "발표 후 곧바로\n후기를 받아요",
    description:
      "응답률 낮은 구글폼은 더 이상 필요 없어요.\n발표가 끝나는 즉시 피드백을 받아서 응답률을 높여요.",
    layout: "two-up",
    bg: "mist",
    bareMedia: true,
    mediaSlots: [
      {
        label: "발표자 화면, 설문 커스터마이징",
        caption: "발표자는 발표 종료 전까지 설문을 커스터마이징할 수 있어요.",
        width: 820,
        height: 692,
        demo: 3,
      },
      {
        label: "청중 화면, 설문 응답과 자료 다운로드",
        caption: "청중은 발표가 끝나면 곧바로 설문에 응답하고 발표 자료를 받을 수 있어요.",
        width: 856,
        height: 692,
        demo: 4,
      },
    ],
    bullets: [
      {
        icon: BulletListIcon,
        title: "문항 커스터마이징",
        description: "청중에게 묻고 싶은 질문으로 자유롭게 채워요.",
      },
      {
        icon: DownloadIcon,
        title: "응답 후 자료 다운로드",
        description:
          "설문에 응답한 청중에게만 자료를 공유해요.\n공유가 부담스러우면 언제든 끌 수 있어요.",
      },
      {
        icon: ThumbsUpIcon,
        title: "높아지는 응답률",
        description: "발표가 끝나면 솔직한 피드백이 차곡차곡 쌓여요.",
      },
    ],
  },
  {
    id: "ai-report",
    title: "발표가 끝나면,\nAI 리포트를 보며 회고해요",
    description:
      "슬라이드별 반응과 질문부터 몰입의 흐름까지,\nAI가 청중의 행동 데이터를 분석해 다음 발표에서 뭘 바꾸면 좋을지 짚어줘요.",
    layout: "wide",
    bg: "white",
    bareMedia: true,
    mediaSlots: [{ label: "AI 리포트 대시보드", width: 1550, height: 810, demo: 5 }],
    bullets: [
      {
        icon: SquareChartIcon,
        title: "몰입도 분석",
        description: "어느 슬라이드에서 반응이 터졌는지,\n어떤 질문이 가장 많았는지 한눈에 봐요.",
      },
      {
        icon: SparkleIcon,
        title: "맞춤 개선 제안",
        description: "다음 발표를 위한 조언까지 담겨요.",
      },
      {
        icon: FileIcon,
        title: "한 장 요약",
        description: "발표가 끝나면 한 페이지 안에 자동으로 정리돼요.",
      },
    ],
  },
];
