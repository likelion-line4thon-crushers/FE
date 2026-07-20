import styled, { css } from "styled-components";
import { MEDIA } from "@/shared/config/breakpoints";

// 랜딩 마케팅 팔레트 — 실제 서비스 UI 토큰과 동일 계열로 맞춘다.
// (로고: #303030 + #E74D07 대시 / 앱 악센트: #E74D07 / 라인: #EAEAEA / 서피스: #F5F5F5)
export const palette = {
  accent: "#E74D07",
  accentSoft: "#FDF0E8",
  ink: "#303030",
  dark: "#121212",
  mist: "#F5F5F5",
  line: "#EAEAEA",
  textSub: "#5C5C5C",
  textMuted: "#767676",
  darkLine: "#2E2E2E",
  darkText: "#B4B4B2",
} as const;

// 코너 반경 시스템: 패널/미디어 20px · 아이콘 칩 12px · 버튼 pill(999px)
export const RADIUS = { panel: 20, chip: 12 } as const;

export const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

// 1920px 시안 기준 크기를 뷰포트에 비례 축소 (하한은 기준의 62%)
export const fluidType = (max: number) => css`
  font-size: clamp(${Math.round(max * 0.62)}px, ${(max / 19.2).toFixed(2)}vw, ${max}px);
`;

export const Section = styled.section<{ $bg: string; $padY?: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: ${({ $padY = 150 }) =>
      css`clamp(${Math.round($padY * 0.56)}px, ${($padY / 19.2).toFixed(2)}vw, ${$padY}px)`}
    24px;
  background: ${({ $bg }) => $bg};
  overflow: hidden;
  box-sizing: border-box;
`;

export const SectionContent = styled.div<{ $maxWidth?: number; $gap?: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: ${({ $maxWidth = 1240 }) => $maxWidth}px;
  gap: ${({ $gap = 24 }) => $gap}px;
`;

// 로고와 AI 리포트 카드가 쓰는 오렌지 대시 — 섹션 헤드라인의 브랜드 마커
// 모바일은 마지막 CTA($mobileCenter)만 빼고 전부 왼쪽 정렬로 통일한다.
export const SectionMark = styled.div<{ $align?: "left" | "center"; $mobileCenter?: boolean }>`
  width: 28px;
  height: 4px;
  border-radius: 2px;
  background: ${palette.accent};
  margin: ${({ $align = "center" }) => ($align === "center" ? "0 auto 18px" : "0 0 18px")};

  @media ${MEDIA.mobile} {
    margin: ${({ $mobileCenter }) => ($mobileCenter ? "0 auto 16px" : "0 0 16px")};
  }
`;

export const SectionHeadline = styled.h2<{
  $max?: number;
  $color?: string;
  $align?: "left" | "center";
  $mobileCenter?: boolean;
}>`
  margin: 0;
  ${({ $max = 50 }) => fluidType($max)}
  line-height: 1.24;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: ${({ $color = palette.ink }) => $color};
  text-align: ${({ $align = "center" }) => $align};
  white-space: pre-line;

  @media ${MEDIA.mobile} {
    text-align: ${({ $mobileCenter }) => ($mobileCenter ? "center" : "left")};
  }
`;

export const SectionSubtext = styled.p<{
  $color?: string;
  $maxWidth?: number;
  $align?: "left" | "center";
  $mobileCenter?: boolean;
}>`
  margin: 0;
  font-size: 18px;
  line-height: 30px;
  font-weight: 500;
  letter-spacing: -0.4px;
  color: ${({ $color = palette.textSub }) => $color};
  max-width: ${({ $maxWidth = 720 }) => $maxWidth}px;
  text-align: ${({ $align = "center" }) => $align};
  /* 문구의 \n을 줄바꿈으로 렌더 (헤드라인과 동일한 규칙) */
  white-space: pre-line;

  @media ${MEDIA.mobile} {
    text-align: ${({ $mobileCenter }) => ($mobileCenter ? "center" : "left")};
  }
`;

export const Accent = styled.span`
  color: ${palette.accent};
`;

// 스크롤 리빌 래퍼 — 모션 비선호 환경에서는 전환 없이 항상 표시
export const RevealBox = styled.div<{ $shown: boolean; $delay?: number }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: inherit;

  @media (prefers-reduced-motion: no-preference) {
    opacity: ${({ $shown }) => ($shown ? 1 : 0)};
    transform: translateY(${({ $shown }) => ($shown ? 0 : 20)}px);
    transition:
      opacity 0.7s ${EASE},
      transform 0.7s ${EASE};
    transition-delay: ${({ $delay = 0 }) => $delay}ms;
  }
`;

// 스플릿 섹션 공용 그리드 — 모바일에서는 단일 컬럼 스택
export const SplitGrid = styled.div<{ $reverse?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $reverse }) => ($reverse ? "1.3fr 1fr" : "1fr 1.3fr")};
  align-items: center;
  gap: clamp(40px, 4.5vw, 84px);
  width: 100%;
  max-width: 1240px;

  @media ${MEDIA.tabletDown} {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;
