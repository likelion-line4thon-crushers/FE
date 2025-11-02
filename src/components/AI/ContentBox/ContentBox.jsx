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
  ContentText,
} from "./ContentBox.styles";

const ContentBox = ({
  title = "총 이모지 반응",
  value = "00",
  unit = "개",
  slideImage,
  slideNumber,
  content,
  variant,
  width,
  height,
  backgroundColor,
}) => {
  let determinedVariant = variant;
  if (!determinedVariant) {
    if (slideImage) {
      determinedVariant = "image";
    } else if (content) {
      determinedVariant = "text";
    } else {
      determinedVariant = "number";
    }
  }

  return (
    <ContentBoxContainer
      $width={width}
      $height={height}
      $backgroundColor={backgroundColor}
    >
      <TopSection>
        <OrangeLine />
        <TitleText>{title}</TitleText>
      </TopSection>
      {determinedVariant === "image" && slideImage ? (
        <>
          <ImageContainer>
            <SlideImage src={slideImage} alt="슬라이드" />
          </ImageContainer>
          {slideNumber !== undefined && (
            <SlideNumber>슬라이드 {slideNumber}</SlideNumber>
          )}
        </>
      ) : determinedVariant === "text" && content ? (
        <ContentText>{content}</ContentText>
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
