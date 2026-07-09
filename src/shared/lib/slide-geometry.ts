// * 슬라이드 스탬프 좌표계 유틸
//   저장/전송되는 xPct·yPct 는 "레터박스를 제외한 실제 슬라이드 콘텐츠" 기준 %.
//   각 화면은 컨테이너(박스) 안에 object-fit: contain 으로 이미지를 그리므로,
//   이미지 원본 비율로 콘텐츠 영역을 계산해 박스 좌표계와 상호 변환한다.

export const SLIDE_BOX_ASPECT = 16 / 9;

// 슬라이드 콘텐츠 폭 대비 스탬프 크기(%) — broadcast 3.4cqw 에서 유래
export const STAMP_CONTENT_WIDTH_PCT = 3.4;

// 박스 내에서 콘텐츠가 차지하는 영역 (0~1 분율)
export interface SlideContentFractions {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const slideContentFractions = (
  naturalRatio: number | null | undefined,
  boxRatio: number = SLIDE_BOX_ASPECT
): SlideContentFractions => {
  if (
    !naturalRatio ||
    !Number.isFinite(naturalRatio) ||
    naturalRatio <= 0 ||
    !Number.isFinite(boxRatio) ||
    boxRatio <= 0
  ) {
    // 비율을 모르면 박스 전체를 콘텐츠로 간주 (16:9 덱과 동일한 기존 동작)
    return { left: 0, top: 0, width: 1, height: 1 };
  }

  const width = Math.min(1, naturalRatio / boxRatio);
  const height = Math.min(1, boxRatio / naturalRatio);
  return { left: (1 - width) / 2, top: (1 - height) / 2, width, height };
};

// 콘텐츠 기준 % 좌표 → 박스 기준 CSS 배치 스타일 (크기도 콘텐츠 폭에 비례)
export const stampBoxStyle = (xPct: number, yPct: number, fractions: SlideContentFractions) => ({
  left: `${(fractions.left + (xPct / 100) * fractions.width) * 100}%`,
  top: `${(fractions.top + (yPct / 100) * fractions.height) * 100}%`,
  width: `${STAMP_CONTENT_WIDTH_PCT * fractions.width}%`,
});

// 박스 내 클릭 분율(0~1) → 콘텐츠 기준 %. 레터박스 영역이면 null.
export const boxPointToContentPct = (
  boxX: number,
  boxY: number,
  fractions: SlideContentFractions
): { xPct: number; yPct: number } | null => {
  const xPct = ((boxX - fractions.left) / fractions.width) * 100;
  const yPct = ((boxY - fractions.top) / fractions.height) * 100;
  if (xPct < 0 || xPct > 100 || yPct < 0 || yPct > 100) return null;
  return { xPct, yPct };
};

// img onLoad 에서 원본 비율 추출
export const imageNaturalRatio = (img: HTMLImageElement): number | null => {
  if (!img.naturalWidth || !img.naturalHeight) return null;
  return img.naturalWidth / img.naturalHeight;
};
