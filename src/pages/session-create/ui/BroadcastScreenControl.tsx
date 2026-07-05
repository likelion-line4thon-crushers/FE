import { useState } from "react";
import {
  ControlBox,
  ControlDescription,
  ControlLabel,
  ControlStatus,
  ControlText,
  ControlWrapper,
  LaunchButton,
} from "./BroadcastScreenControl.styles";

interface BroadcastScreenControlProps {
  onOpen: () => Promise<Window | null> | Window | null;
  /** True when the browser can auto-place the window on a second display. */
  windowManagementSupported?: boolean;
  disabled?: boolean;
}

/**
 * Prep-panel control that opens the audience giant-screen view. Same box layout
 * as the other quick settings, but the switch is replaced by a launch button.
 */
const BroadcastScreenControl = ({
  onOpen,
  windowManagementSupported = false,
  disabled = false,
}: BroadcastScreenControlProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    try {
      const win = await onOpen();
      if (!win) {
        setError("팝업이 차단되었습니다. 브라우저에서 팝업을 허용해주세요.");
      }
    } catch {
      setError("발표 화면을 여는 데 실패했습니다.");
    }
  };

  const description = windowManagementSupported
    ? "연결된 외부 화면(빔프로젝터 등)에 슬라이드만 전체 화면으로 띄웁니다."
    : "슬라이드만 표시되는 발표 화면을 새 창으로 엽니다. 외부 화면으로 옮겨 사용하세요.";

  return (
    <ControlWrapper>
      <ControlBox>
        <ControlText>
          <ControlLabel>발표 화면 열기</ControlLabel>
          <ControlDescription>{description}</ControlDescription>
        </ControlText>
        <LaunchButton
          type="button"
          onClick={() => void handleClick()}
          disabled={disabled}
          aria-label="발표 화면 열기"
        >
          화면 열기
        </LaunchButton>
      </ControlBox>
      <ControlStatus role={error ? "alert" : undefined}>{error ?? ""}</ControlStatus>
    </ControlWrapper>
  );
};

export default BroadcastScreenControl;
