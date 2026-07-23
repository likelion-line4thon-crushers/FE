import { Switch } from "@/shared/ui/switch";
import {
  PolicyBox,
  PolicyDescription,
  PolicyLabel,
  PolicyStatus,
  PolicyText,
  PolicyWrapper,
} from "./PdfDownloadPolicyControl.styles";

interface PdfDownloadPolicyControlProps {
  enabled: boolean;
  saving?: boolean;
  error?: string | null;
  onChange: (enabled: boolean) => void;
}

const PdfDownloadPolicyControl = ({
  enabled,
  saving = false,
  error = null,
  onChange,
}: PdfDownloadPolicyControlProps) => (
  <PolicyWrapper data-tour="setting-pdf">
    <PolicyBox>
      <PolicyText>
        <PolicyLabel>슬라이드 다운로드 허용</PolicyLabel>
        <PolicyDescription>
          세션 종료 후 별점과 후기를 모두 제출한 청중에게 PDF 다운로드를 제공합니다.
        </PolicyDescription>
      </PolicyText>
      <Switch
        checked={enabled}
        disabled={saving}
        aria-label="슬라이드 다운로드 허용"
        onChange={(event) => onChange(event.target.checked)}
      />
    </PolicyBox>
    {(error || saving) && (
      <PolicyStatus role={error ? "alert" : undefined}>{error ?? "저장 중..."}</PolicyStatus>
    )}
  </PolicyWrapper>
);

export default PdfDownloadPolicyControl;
