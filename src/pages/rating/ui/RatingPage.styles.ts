import styled from "styled-components";

export const DownloadOption = styled.label<{ $disabled?: boolean }>`
  width: min(100%, 420px);
  display: flex;
  align-items: flex-start;
  gap: 0.8vw;
  padding: 1.2vh 1.1vw;
  border: 0.1vw solid #eaeaea;
  border-radius: 0.8vw;
  background: #fafafa;
  color: ${(props) => (props.$disabled ? "#999" : "#5c5c5c")};
  box-sizing: border-box;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
`;

export const DownloadCheckbox = styled.input`
  appearance: none;
  width: clamp(16px, 1.04vw, 20px);
  height: clamp(16px, 1.04vw, 20px);
  margin: 0.2vh 0 0;
  border: 0.1vw solid #cacaca;
  border-radius: 0.25vw;
  background: #fff;
  cursor: pointer;
  flex-shrink: 0;
  position: relative;

  &:checked {
    border-color: #e8541e;
    background: #e8541e;
  }

  &:checked::after {
    content: "";
    position: absolute;
    left: 32%;
    top: 12%;
    width: 30%;
    height: 55%;
    border: solid #fff;
    border-width: 0 0.12vw 0.12vw 0;
    transform: rotate(45deg);
  }

  &:disabled {
    background: #ededed;
    cursor: not-allowed;
  }
`;

export const DownloadOptionText = styled.span`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3vh;
  text-align: left;
`;

export const DownloadOptionLabel = styled.span`
  font-size: clamp(12px, 0.85vw, 15px);
  font-weight: 600;
`;

export const DownloadOptionDescription = styled.span`
  color: #838383;
  font-size: clamp(10px, 0.7vw, 12px);
  line-height: 1.4;
`;

export const DownloadOptionError = styled.span`
  color: #8a3d1f;
  font-size: clamp(10px, 0.7vw, 12px);
  line-height: 1.4;
`;
