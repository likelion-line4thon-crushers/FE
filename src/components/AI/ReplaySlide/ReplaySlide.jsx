import React from "react";
import {
  ReplaySlideContainer,
  TotalContainer,
  LeftBoxContainer,
  RightBoxContainer,
  NumberCenter,
  NumberValue,
  NumberDescription,
} from "./ReplaySlide.styles";
import rabbitImage from "../../../assets/images/rabbit.jpg";
import ContentBox from "../ContentBox/ContentBox";
import AITitle from "../AITitle/AITitle";
import SlideNumber from "../SlideNumber/SlideNumber";

const ReplaySlide = () => {
  return (
    <ReplaySlideContainer>
      <AITitle
        title="재방문수가 가장 많은 슬라이드"
        description="재방문한 청중의 수가 가장 많은 슬라이드입니다."
      />
      <TotalContainer>
        <LeftBoxContainer>
          <ContentBox
            title="재방문수가 가장 많은 슬라이드"
            variant="image"
            slideImage={rabbitImage}
            slideNumberComponent={<SlideNumber slideNumber={0} />}
            width="auto"
            height="405px"
            slideImageWidth="80%"
            slideImageHeight="80%"
          />
        </LeftBoxContainer>
        <RightBoxContainer>
          <ContentBox
            title="총 재방문 수"
            variant="custom"
            width="auto"
            height="auto"
          >
            <NumberCenter>
              <NumberValue>0번</NumberValue>
              <NumberDescription>
                해당 슬라이드를 0명중 0명이 재방문했어요.
                <br />
                특히, 0명은 2번 이상 다시 봤어요.
              </NumberDescription>
            </NumberCenter>
          </ContentBox>
        </RightBoxContainer>
      </TotalContainer>
    </ReplaySlideContainer>
  );
};

export default ReplaySlide;
