import styled from "styled-components";

export const AITitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding-right: 2.8vw;
`;

export const TitleText = styled.h1`
  color: #000;
  font-family: Pretendard;
  font-size: 32px;
  font-style: normal;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
`;

export const DescriptionBox = styled.div`
  flex: 1;
  min-height: 28px;

  border: 2px dashed #eaeaea;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 12px 18px;
  box-sizing: border-box;
`;

export const DescriptionText = styled.p`
  color: #767676;
  font-family: Pretendard;
  font-size: 28px;
  font-style: normal;
  font-weight: 400;
`;
