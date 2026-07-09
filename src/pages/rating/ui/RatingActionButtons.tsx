import styled from "styled-components";
import { MEDIA } from "@/shared/config/breakpoints";
import DownloadIcon from "@/shared/assets/images/download.svg";

interface RatingActionButtonsProps {
  showDownload: boolean;
  isComplete: boolean;
  submitting: boolean;
  onSubmit: () => void;
  onDownload: () => void;
  onSkip: () => void;
}

export function RatingActionButtons({
  showDownload,
  isComplete,
  submitting,
  onSubmit,
  onDownload,
  onSkip,
}: RatingActionButtonsProps) {
  const disabled = !isComplete || submitting;
  return (
    <Wrap>
      <Row>
        <SubmitButton type="button" disabled={disabled} onClick={onSubmit}>
          {submitting ? "제출 중..." : "제출"}
        </SubmitButton>
        {showDownload && (
          <DownloadButton type="button" disabled={disabled} onClick={onDownload}>
            <img src={DownloadIcon} alt="" />
            발표 자료 다운로드
          </DownloadButton>
        )}
      </Row>
      <SkipButton type="button" onClick={onSkip}>
        건너뛰기
      </SkipButton>
    </Wrap>
  );
}

export default RatingActionButtons;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1vh;
`;

const Row = styled.div`
  display: flex;
  gap: 1vw;
  align-items: center;

  @media ${MEDIA.mobile} {
    gap: 12px;
  }
`;

const BaseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4vw;
  border: none;
  border-radius: 0.4vw;
  padding: 1.4vh 2vw;
  font-size: clamp(12px, 0.9vw, 15px);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  img {
    width: clamp(14px, 1vw, 18px);
    height: auto;
  }
  &:disabled {
    background: #d9d9d9;
    color: #ffffff;
    cursor: not-allowed;
  }

  /* 터치 타깃 확보 */
  @media ${MEDIA.mobile} {
    gap: 6px;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 14px;
  }
`;

const SubmitButton = styled(BaseButton)`
  background: #303030;
  color: #fff;
  &:not(:disabled):hover {
    background: #1a1a1a;
  }
`;

const DownloadButton = styled(BaseButton)`
  background: #e8541e;
  color: #fff;
  &:not(:disabled):hover {
    background: #cc3f13;
  }
`;

const SkipButton = styled.button`
  border: none;
  background: none;
  color: #555;
  text-decoration: underline;
  font-size: clamp(11px, 0.85vw, 14px);
  cursor: pointer;
`;
