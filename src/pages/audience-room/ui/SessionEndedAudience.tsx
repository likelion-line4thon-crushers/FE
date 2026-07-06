import React from "react";
import delayImage from "@/shared/assets/images/delay.png";
import {
  PageContainer,
  CenterContainer,
  WaitingImage,
  WaitingMessage,
} from "./DelayAudience.styles";

// Shown when an audience opens the session URL after it has already ended.
// Mirrors the "live waiting" screen layout, only the message differs.
const SessionEndedAudience = ({ placeholderCount = 12 }) => {
  return (
    <PageContainer>
      <CenterContainer>
        <WaitingImage src={delayImage} alt="세션 종료" />
        <WaitingMessage>이미 종료된 세션입니다.</WaitingMessage>
      </CenterContainer>
    </PageContainer>
  );
};

export default SessionEndedAudience;
