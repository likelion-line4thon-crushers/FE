import styled from "styled-components";
import { RADIUS, palette } from "./common.styles";

export const HeadBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

export const PainList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const PainRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 28px 4px;

  & + & {
    border-top: 1px solid ${palette.line};
  }
`;

export const IconBox = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #fff;
  /* 히어로 그리드 셀과 같은 얇은 라인 카드 모티프 */
  border: 1px solid ${palette.line};
  border-radius: ${RADIUS.chip}px;
`;

export const PainText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const PainTitle = styled.h3`
  margin: 0;
  font-size: 21px;
  font-weight: 700;
  letter-spacing: -0.6px;
  color: ${palette.ink};
`;

export const PainDesc = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 26px;
  font-weight: 500;
  letter-spacing: -0.3px;
  color: ${palette.textSub};
  /* 문구의 \n을 줄바꿈으로 렌더 */
  white-space: pre-line;
`;
