import styled from "styled-components";

export const ControlWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6vh;
  padding: 0 0.6vw 1vh;
`;

export const ControlBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8vw;
  min-height: clamp(62px, 6.67vh, 72px);
  padding: 1.3vh 0.8vw;
  border-radius: clamp(16px, 1.04vw, 20px);
  border: 0.05vw solid #eaeaea;
  background: #fafafa;
  box-sizing: border-box;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background: #f5f5f5;
  }
`;

export const ControlText = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.3vh;
`;

export const ControlLabel = styled.div`
  color: #5c5c5c;
  font-size: clamp(11px, 0.75vw, 14px);
  font-weight: 600;
`;

export const ControlDescription = styled.p`
  margin: 0;
  color: #838383;
  font-size: clamp(9px, 0.6vw, 11px);
  font-weight: 400;
  line-height: 1.4;
`;

export const LaunchButton = styled.button`
  flex-shrink: 0;
  padding: clamp(8px, 1vh, 11px) clamp(12px, 0.9vw, 18px);
  border: none;
  border-radius: 999px;
  background: #e74d07;
  color: #fff;
  font-size: clamp(11px, 0.72vw, 13px);
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background 0.2s ease,
    opacity 0.2s ease;

  &:hover {
    background: #cf4406;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const ControlStatus = styled.div`
  min-height: 1.4em;
  color: #838383;
  font-size: clamp(9px, 0.6vw, 11px);
  line-height: 1.4;
`;
