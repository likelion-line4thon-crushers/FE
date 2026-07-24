import { useState } from "react";
import ArrowRightIcon from "@/shared/assets/images/arrow-right.svg";
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
    ? "연결된 외부 화면(빔프로젝터 등)에 오직 슬라이드 화면만 띄웁니다."
    : "새 창에서 오직 슬라이드 화면만이 보여집니다.";

  return (
    <ControlWrapper data-tour="setting-broadcast">
      <ControlBox>
        <ControlText>
          <ControlLabel>깔끔한 발표 화면</ControlLabel>
          <ControlDescription>{description}</ControlDescription>
        </ControlText>
        <LaunchButton
          type="button"
          onClick={() => void handleClick()}
          disabled={disabled}
          aria-label="깔끔한 발표 화면 열기"
        >
          화면 열기
          <img src={ArrowRightIcon} alt="" aria-hidden="true" />
        </LaunchButton>
      </ControlBox>
      {error && <ControlStatus role="alert">{error}</ControlStatus>}
    </ControlWrapper>
  );
};

export default BroadcastScreenControl;
