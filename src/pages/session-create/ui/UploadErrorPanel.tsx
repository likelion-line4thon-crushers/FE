import {
  Actions,
  HomeButton,
  Icon,
  Message,
  Overlay,
  RetryButton,
} from "./UploadErrorPanel.styles";

interface UploadErrorPanelProps {
  message: string;
  /** 없으면 재시도 버튼을 숨긴다 (예: 원본 파일이 이미 유실된 경우) */
  onRetry?: () => void;
  onGoHome: () => void;
  homeLabel?: string;
}

const UploadErrorPanel = ({
  message,
  onRetry,
  onGoHome,
  homeLabel = "처음으로",
}: UploadErrorPanelProps) => (
  <Overlay role="alert">
    <Icon aria-hidden="true">⚠️</Icon>
    <Message>{message}</Message>
    <Actions>
      {onRetry && (
        <RetryButton type="button" onClick={onRetry}>
          다시 시도
        </RetryButton>
      )}
      <HomeButton type="button" onClick={onGoHome}>
        {homeLabel}
      </HomeButton>
    </Actions>
  </Overlay>
);

export default UploadErrorPanel;
