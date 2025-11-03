import React from "react";
import {
  TotalReactionContainer,
  TitleContainer,
  ContentContainer,
} from "./TotalReaction.styles";
import ReportTitle from "../../../assets/images/AI/ReportTitle.png";
import ContentBox from "../ContentBox/ContentBox";
import RabbitImage from "../../../assets/images/rabbit.jpg";
import SlideNumber from "../SlideNumber/SlideNumber";

const TotalReaction = () => {
  return (
    <TotalReactionContainer>
      <TitleContainer>
        <img src={ReportTitle} alt="AI 보고서" />
        <h1>AI 보고서</h1>
        <h2>파일명.pdf</h2>
      </TitleContainer>
      <ContentContainer>
        <ContentBox
          title="총 이모지 반응"
          value="00"
          unit="개"
          height="350px"
        />
        <ContentBox
          title="총 실시간 질문수"
          value="00"
          unit="개"
          height="350px"
        />
        <ContentBox
          title="주목해야 할 슬라이드"
          slideImage={RabbitImage}
          slideNumber={0}
          height="350px"
          width="570px"
          slideImageWidth="80%"
          slideImageHeight="80%"
          slideNumberComponent={<SlideNumber slideNumber={1} />}
        />
      </ContentContainer>
    </TotalReactionContainer>
  );
};

export default TotalReaction;
