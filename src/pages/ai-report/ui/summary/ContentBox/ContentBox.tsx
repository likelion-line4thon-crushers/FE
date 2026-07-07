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
  SlideNumberSlot,
  ImageContainer,
  ContentText,
} from "./ContentBox.styles";
import SlideSkeleton from "../SlideSkeleton/SlideSkeleton";

const ContentBox = (props: any) => {
  const {
    title = "총 이모지 반응",
    value = "00",
    unit = "개",
    slideImage,
    slideNumber,
    slideNumberComponent,
    content,
    variant,
    width,
    height,
    backgroundColor,
    slideImageWidth,
    slideImageHeight,
    children,
    contentStyle,
    titleStyle,
  } = props;
  let determinedVariant = variant;
  if (!determinedVariant) {
    if (children) {
      determinedVariant = "custom";
    } else if (slideImage) {
      determinedVariant = "image";
    } else if (content) {
      determinedVariant = "text";
    } else {
      determinedVariant = "number";
    }
  }

  const justifyForVariant =
    determinedVariant === "number" && height && height !== "auto" ? "space-between" : "flex-start";

  return (
    <ContentBoxContainer
      $width={width}
      $height={height}
      $backgroundColor={backgroundColor}
      $justify={justifyForVariant}
    >
      <TopSection>
        <OrangeLine />
        <TitleText
          $color={titleStyle?.color}
          $fontSize={titleStyle?.fontSize}
          $fontWeight={titleStyle?.fontWeight}
          $fontStyle={titleStyle?.fontStyle}
        >
          {title}
        </TitleText>
      </TopSection>
      {determinedVariant === "custom" && children ? (
        children
      ) : determinedVariant === "image" ? (
        <>
          <ImageContainer>
            {slideImage ? (
              <SlideImage
                src={slideImage}
                alt="슬라이드"
                $imgWidth={slideImageWidth}
                $imgHeight={slideImageHeight}
              />
            ) : (
              <SlideSkeleton
                width={slideImageWidth || "100%"}
                height={slideImageHeight || "100%"}
              />
            )}
          </ImageContainer>
          {slideNumberComponent ? (
            <SlideNumberSlot>{slideNumberComponent}</SlideNumberSlot>
          ) : (
            slideNumber !== undefined && <SlideNumber>슬라이드 {slideNumber}</SlideNumber>
          )}
        </>
      ) : determinedVariant === "text" && content ? (
        <ContentText
          $color={contentStyle?.color}
          $fontSize={contentStyle?.fontSize}
          $fontWeight={contentStyle?.fontWeight}
          $fontStyle={contentStyle?.fontStyle}
        >
          {content}
        </ContentText>
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
