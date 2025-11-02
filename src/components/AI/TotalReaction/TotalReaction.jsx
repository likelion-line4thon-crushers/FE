import React from "react";
import {
  TotalReactionContainer,
  TitleContainer,
  ContentContainer,
} from "./TotalReaction.styles";
import ReportTitle from "../../../assets/images/AI/ReportTitle.png";
import ContentBox from "../ContentBox/ContentBox";

const TotalReaction = () => {
  return (
    <TotalReactionContainer>
      <TitleContainer>
        <img src={ReportTitle} alt="AI 보고서" />
        <h1>AI 보고서</h1>
        <h2>파일명.pdf</h2>
      </TitleContainer>
      <ContentContainer>
        <ContentBox title="총 이모지 반응" value="00" unit="개" />
        <ContentBox title="총 실시간 질문수" value="00" unit="개" />
        <ContentBox title="주목해야 할 슬라이드" value="00" unit="개" />
      </ContentContainer>
    </TotalReactionContainer>
  );
};

export default TotalReaction;
