import styled, { keyframes } from "styled-components";
import CloseIcon from "@/shared/assets/images/close.svg";

interface DownloadPopoverProps {
  onClose: () => void;
}

export function DownloadPopover({ onClose }: DownloadPopoverProps) {
  return (
    <Popover role="status">
      <PopoverText>질문 문항을 모두 답하면, 발표 자료를 다운받을 수 있습니다!</PopoverText>
      <CloseButton type="button" aria-label="닫기" onClick={onClose}>
        <img src={CloseIcon} alt="" />
      </CloseButton>
    </Popover>
  );
}

export default DownloadPopover;

const riseIn = keyframes`
  from { opacity: 0; transform: translateY(0.8vh); }
  to { opacity: 1; transform: translateY(0); }
`;

const Popover = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.8vw;
  background: #fff7f2;
  border: 0.1vw solid #f2b08d;
  color: #8a3d1f;
  border-radius: 0.6vw;
  padding: 1vh 1.2vw;
  font-size: clamp(12px, 0.85vw, 14px);
  box-shadow: 0 0.4vh 1vh rgba(0, 0, 0, 0.08);
  animation: ${riseIn} 0.28s ease-out;
`;

const PopoverText = styled.span`
  line-height: 1.4;
`;

const CloseButton = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  display: inline-flex;
  padding: 0.2vw;
  img {
    width: clamp(14px, 1vw, 18px);
    height: auto;
  }
`;
