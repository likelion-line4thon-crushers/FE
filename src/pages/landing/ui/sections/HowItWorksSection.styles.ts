import styled from "styled-components";
import { MEDIA } from "@/shared/config/breakpoints";
import { RADIUS, palette } from "./common.styles";

export const HeadBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  @media ${MEDIA.mobile} {
    align-items: flex-start;
    width: 100%;
  }
`;

export const Steps = styled.div`
  display: flex;
  align-items: stretch;
  gap: 24px;
  width: 100%;
  padding-top: 40px;

  @media ${MEDIA.tabletDown} {
    flex-direction: column;
    align-items: stretch;
  }

  @media ${MEDIA.mobile} {
    gap: 14px;
    padding-top: 28px;
  }
`;

export const Step = styled.div`
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 30px 32px;
  background: #fff;
  /* 히어로 그리드 셀과 같은 얇은 라인 카드 모티프 */
  border: 1px solid ${palette.line};
  border-radius: ${RADIUS.panel}px;
`;

export const StepTitle = styled.h3`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.6px;
  color: ${palette.ink};
`;

export const StepDesc = styled.p`
  margin: 0;
  font-size: 15.5px;
  line-height: 25px;
  font-weight: 500;
  letter-spacing: -0.3px;
  color: ${palette.textSub};
  /* 문구의 \n을 줄바꿈으로 렌더 */
  white-space: pre-line;
`;

export const StepArrow = styled.img`
  flex-shrink: 0;
  align-self: center;
  width: 26px;
  height: 26px;

  @media ${MEDIA.tabletDown} {
    transform: rotate(90deg);
  }
`;
