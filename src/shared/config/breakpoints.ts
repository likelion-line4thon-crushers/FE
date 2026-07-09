// * 반응형 브레이크포인트 단일 소스 (px)

export const BREAKPOINTS = {
  // 이 값 미만: 모바일 세로 스택 레이아웃
  mobile: 768,
  // mobile 이상 ~ 이 값 미만: 태블릿 (데스크톱 레이아웃 유지)
  tablet: 1024,
} as const;

// * styled-components 미디어 쿼리 헬퍼 — 사용: @media ${MEDIA.mobile} { ... }
export const MEDIA = {
  mobile: `(max-width: ${BREAKPOINTS.mobile - 1}px)`,
  tabletDown: `(max-width: ${BREAKPOINTS.tablet - 1}px)`,
  desktop: `(min-width: ${BREAKPOINTS.tablet}px)`,
  // hover 불가 터치 기기 — hover 의존 UI 분기용
  touch: "(hover: none) and (pointer: coarse)",
} as const;
