import styled from "styled-components";

export const PolicyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6vh;
`;

export const PolicyBox = styled.div`
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

  &:has(input:checked) {
    background: #303030;
    border-color: #303030;
  }
`;

export const PolicyText = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.3vh;
`;

export const PolicyLabel = styled.div`
  color: #5c5c5c;
  font-size: clamp(13px, 0.85vw, 16px);
  font-weight: 600;
  line-height: 24px;
  letter-spacing: -0.4px;
  transition: color 0.2s ease;

  ${PolicyBox}:has(input:checked) & {
    color: #ffffff;
  }
`;

export const PolicyDescription = styled.p`
  margin: 0;
  color: #838383;
  font-size: clamp(9px, 0.6vw, 11px);
  font-weight: 400;
  line-height: 1.35;
  letter-spacing: -0.3px;
  transition: color 0.2s ease;

  ${PolicyBox}:has(input:checked) & {
    color: #d0d0d0;
  }
`;

export const PolicyStatus = styled.div`
  color: #8a3d1f;
  font-size: clamp(9px, 0.6vw, 11px);
  line-height: 1.4;
`;
