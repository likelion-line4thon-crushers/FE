import styled from "styled-components";

export const Top3Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 20px;
`;

export const QuestionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-right: 2.8vw;
`;

export const QuestionContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
  margin-top: 12px;
  align-items: center;
`;

export const QuestionText = styled.p`
  font-family: Pretendard;
  font-size: 24px;
  font-weight: 400;
  color: #434343;
  margin: 0;
  line-height: 1.5;
  flex: 1;
`;

export const QuestionMeta = styled.div`
  font-family: Pretendard;
  font-size: 16px;
  font-weight: 400;
  color: #666;
  margin: 0;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
