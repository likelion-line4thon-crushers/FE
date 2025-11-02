import React from "react";
import {
  ContentBoxContainer,
  TopSection,
  BottomSection,
  OrangeLine,
  TitleText,
  NumberDisplay,
  UnitText,
} from "./ContentBox.styles";

const ContentBox = ({
  title = "총 이모지 반응",
  value = "00",
  unit = "개",
}) => {
  return (
    <ContentBoxContainer>
      <TopSection>
        <OrangeLine />
        <TitleText>{title}</TitleText>
      </TopSection>
      <BottomSection>
        <NumberDisplay>{value}</NumberDisplay>
        <UnitText>{unit}</UnitText>
      </BottomSection>
    </ContentBoxContainer>
  );
};

export default ContentBox;
