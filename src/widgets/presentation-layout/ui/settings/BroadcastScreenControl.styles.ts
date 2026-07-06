import styled from "styled-components";

export const ControlWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6vh;
`;

export const ControlBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6vw;
  min-height: clamp(50px, 5.56vh, 60px);
  padding: clamp(10px, 1vh, 14px) clamp(12px, 0.78vw, 15px);
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
  font-size: clamp(13px, 0.85vw, 16px);
  font-weight: 600;
  line-height: 24px;
  letter-spacing: -0.4px;
`;

export const ControlDescription = styled.p`
  margin: 0;
  color: #838383;
  font-size: clamp(9px, 0.6vw, 11px);
  font-weight: 400;
  line-height: 1.35;
  letter-spacing: -0.3px;
`;

export const LaunchButton = styled.button`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.2vw;
  padding: clamp(8px, 1vh, 11px) clamp(10px, 0.7vw, 13px);
  border: none;
  border-radius: 3px;
  background: #434343;
  color: #fff;
  font-size: clamp(11px, 0.72vw, 13px);
  font-weight: 600;
  letter-spacing: -0.325px;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background 0.2s ease,
    opacity 0.2s ease;

  img {
    width: clamp(14px, 0.83vw, 16px);
    height: clamp(14px, 0.83vw, 16px);
    object-fit: contain;
  }

  &:hover {
    background: #2c2c2c;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const ControlStatus = styled.div`
  color: #838383;
  font-size: clamp(9px, 0.6vw, 11px);
  line-height: 1.4;
`;
