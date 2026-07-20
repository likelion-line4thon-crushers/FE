import styled from "styled-components";
import { palette } from "./common.styles";

export const CtaBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

// 오렌지 배경 위 흰 헤드라인에서 특정 단어만 검은색으로 강조
export const Emphasis = styled.span`
  color: #131313;
`;

export const CtaSub = styled.p`
  margin: 0;
  font-size: 19px;
  line-height: 30px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: #fff;
  text-align: center;
`;

export const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 12px;
`;

export const StartButton = styled.button`
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 17px 30px 17px 32px;
  background: #fff;
  border: none;
  border-radius: 999px;
  font-family: inherit;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: ${palette.ink};
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
  }

  &:active {
    transform: scale(0.98);
  }
`;
