import React from "react";
import {
  AITitleWrapper,
  TitleText,
  DescriptionBox,
  DescriptionText,
} from "./AITitle.styles";

const AITitle = ({ title, description }: { title?: string; description?: string }) => {
  return (
    <AITitleWrapper>
      <TitleText>{title}</TitleText>
      <DescriptionBox>
        <DescriptionText>{description}</DescriptionText>
      </DescriptionBox>
    </AITitleWrapper>
  );
};

export default AITitle;
