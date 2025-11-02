import styled from "styled-components";

export const ContentBoxContainer = styled.div`
  width: 390px;
  height: 390px;
  border-radius: 12px;
  border: 1px solid #eaeaea;
  background: #fafafa;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
`;

export const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
`;

export const OrangeLine = styled.div`
  width: 24px;
  height: 4px;
  background: #e74d07;
  border-radius: 2px;
`;

export const TitleText = styled.h2`
  font-family: Pretendard;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
`;

export const BottomSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: flex-end;
  gap: 8px;
`;

export const NumberDisplay = styled.div`
  color: #434343;
  font-family: Pretendard;
  font-size: 80px;
  font-style: normal;
  font-weight: 400;
`;

export const UnitText = styled.span`
  font-family: Pretendard;
  font-size: 20px;
  font-weight: 400;
  color: #333;
`;
