import React from "react";
import {
  ContentBoxContainer,
  TopSection,
  BottomSection,
  OrangeLine,
  TitleText,
  NumberDisplay,
  UnitText,
  SlideImage,
  SlideNumber,
  ImageContainer,
} from "./ContentBox.styles";

const ContentBox = ({
  title = "총 이모지 반응",
  value = "00",
  unit = "개",
  slideImage,
  slideNumber,
}) => {
  return (
    <ContentBoxContainer>
      <TopSection>
        <OrangeLine />
        <TitleText>{title}</TitleText>
      </TopSection>
      {slideImage ? (
        <>
          <ImageContainer>
            <SlideImage src={slideImage} alt="슬라이드" />
          </ImageContainer>
          {slideNumber !== undefined && (
            <SlideNumber>슬라이드 {slideNumber}</SlideNumber>
          )}
        </>
      ) : (
        <BottomSection>
          <NumberDisplay>{value}</NumberDisplay>
          <UnitText>{unit}</UnitText>
        </BottomSection>
      )}
    </ContentBoxContainer>
  );
};

export default ContentBox;
