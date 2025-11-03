import React from "react";
import { ReplaySlideContainer, TotalContainer } from "./ReplaySlide.styles";
import { ContentBoxContainer } from "../ContentBox/ContentBox.styles";
import rabbitImage from "../../../assets/images/rabbit.jpg";
import ContentBox from "../ContentBox/ContentBox";
import AITitle from "../AITitle/AITitle";

const ReplaySlide = () => {
  return (
    <ReplaySlideContainer>
      <AITitle
        title="재방문수가 가장 많은 슬라이드"
        description="재방문한 청중의 수가 가장 많은 슬라이드입니다."
      />
      <TotalContainer>
        <ContentBoxContainer>
          <img src={rabbitImage} alt="rabbit" />
        </ContentBoxContainer>
        <ContentBox
          title="총 재방문 수 "
          content="32회"
          variant="text"
          width="300px"
          height="400px"
        />
      </TotalContainer>
    </ReplaySlideContainer>
  );
};

export default ReplaySlide;
