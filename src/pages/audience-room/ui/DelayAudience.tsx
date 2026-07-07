import React from "react";
import delayImage from "@/shared/assets/images/delay.png";
import {
  PageContainer,
  CenterContainer,
  WaitingImage,
  WaitingMessage,
} from "./DelayAudience.styles";

const DelayAudience = ({ placeholderCount = 12 }) => {
  return (
    <PageContainer>
      <CenterContainer>
        <WaitingImage src={delayImage} alt="대기 중" />
        <WaitingMessage>현재 라이브 대기중입니다.</WaitingMessage>
      </CenterContainer>
    </PageContainer>
  );
};

export default DelayAudience;
