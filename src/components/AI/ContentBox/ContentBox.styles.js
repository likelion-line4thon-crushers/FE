import styled from "styled-components";

export const ContentBoxContainer = styled.div`
  width: ${(props) =>
    props.$width === "auto" ? "auto" : props.$width || "390px"};
  height: ${(props) =>
    props.$height === "auto" ? "auto" : props.$height || "390px"};
  border-radius: 12px;
  border: 1px solid #eaeaea;
  background: ${(props) => props.$backgroundColor || "#fafafa"};
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: ${(props) =>
    props.$justify ||
    (props.$height && props.$height !== "auto"
      ? "space-between"
      : "flex-start")};
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
`;

export const TitleText = styled.h2`
  font-family: Pretendard;
  font-size: ${(props) => props.$fontSize || "16px"};
  font-weight: ${(props) => props.$fontWeight || "500"};
  font-style: ${(props) => props.$fontStyle || "normal"};
  color: ${(props) => props.$color || "#333"};
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
  max-width: ${(props) => props.$imgWidth || "100%"};
  max-height: ${(props) => props.$imgHeight || "100%"};
  object-fit: contain;
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

export const SlideNumberSlot = styled.div`
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

export const ContentText = styled.p`
  font-family: Pretendard;
  font-size: ${(props) => props.$fontSize || "14px"};
  font-weight: ${(props) => props.$fontWeight || "400"};
  font-style: ${(props) => props.$fontStyle || "normal"};
  color: ${(props) => props.$color || "#333"};
  margin: 0;
  line-height: 1.5;
  margin-top: 12px;
  white-space: pre-line;
`;
