export interface QuickSettings {
  sticker: boolean;
  question: boolean;
  feedback: boolean;
  unlock: boolean;
}

export interface UnlockSettings {
  /** 공개된 최대 슬라이드의 0-based 인덱스 (백엔드의 1-based maxRevealedPage 를 변환해 저장) */
  maxRevealedPage: number | null;
  revealAllSlides: boolean;
  totalPages: number | null;
  presenterPage: number | null;
}

/**
 * 백엔드의 maxRevealedPage(maxSlide)는 발표자가 도달한 최대 "페이지 번호"(1-based)다.
 * 프론트엔드는 슬라이드를 0-based 인덱스로 다루므로 인덱스로 변환한다.
 * (변환하지 않으면 경계가 한 칸 넓어져 청중이 다음 슬라이드를 미리 보게 됨)
 * 유효하지 않은 값은 null(잠금 경계 없음)로 처리.
 */
export const revealedPageToIndex = (page: number | null | undefined): number | null => {
  if (page == null || !Number.isFinite(page)) return null;
  return page - 1;
};
