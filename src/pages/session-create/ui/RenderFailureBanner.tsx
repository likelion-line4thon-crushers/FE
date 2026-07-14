import { Banner, DismissButton } from "./RenderFailureBanner.styles";

interface RenderFailureBannerProps {
  failedCount: number;
  onDismiss: () => void;
}

/** SSE 페이지 단위 렌더링 실패 안내 — 실패한 페이지는 빈 슬라이드로 남는다. */
const RenderFailureBanner = ({ failedCount, onDismiss }: RenderFailureBannerProps) => (
  <Banner role="status">
    슬라이드 {failedCount}장을 변환하지 못했습니다. 해당 페이지는 비어 보일 수 있어요.
    <DismissButton type="button" onClick={onDismiss} aria-label="알림 닫기">
      ✕
    </DismissButton>
  </Banner>
);

export default RenderFailureBanner;
