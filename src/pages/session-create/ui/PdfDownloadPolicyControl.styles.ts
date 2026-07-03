import styled from "styled-components";

export const PolicyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6vh;
  padding: 0 0.6vw 1vh;
`;

export const PolicyBox = styled.div`
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
  font-size: clamp(11px, 0.75vw, 14px);
  font-weight: 600;
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
  line-height: 1.4;
  transition: color 0.2s ease;

  ${PolicyBox}:has(input:checked) & {
    color: #ffffff;
  }
`;

export const PolicyStatus = styled.div`
  min-height: 1.4em;
  color: #8a3d1f;
  font-size: clamp(9px, 0.6vw, 11px);
  line-height: 1.4;
`;
