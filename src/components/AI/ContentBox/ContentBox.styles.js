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

export const ImageContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  position: relative;
`;

export const SlideImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  opacity: 0.3;
`;

export const SlideNumber = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 400;
  color: #333;
`;
