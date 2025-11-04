import React from "react";
import {
  QuestionSlideContainer,
  TotalContainer,
  SummaryBoxContainer,
  LeftBoxContainer,
  RightBoxContainer,
} from "./QuestionSlide.styles";
import { ContentBoxContainer } from "../ContentBox/ContentBox.styles";
import rabbitImage from "../../../assets/images/rabbit.jpg";
import faceImage from "../../../assets/images/emoji1_black.svg";
import rectangleImage from "../../../assets/images/AI/Rectangle.png";
import ContentBox from "../ContentBox/ContentBox";
import AITitle from "../AITitle/AITitle";
import SlideNumber from "../SlideNumber/SlideNumber";
const QuestionSlide = () => {
  return (
    <QuestionSlideContainer>
      <AITitle
        title="질문이 가장 많았던 슬라이드"
        description="청중이 가장 활발하게 질문을 남긴 구간입니다."
      />
      <TotalContainer>
        <LeftBoxContainer>
          <ContentBox
            title="질문이 가장 많았던 슬라이드드"
            slideImage={rabbitImage}
            slideNumber={0}
            height="350px"
            width="680px"
            slideImageWidth="80%"
            slideImageHeight="80%"
            slideNumberComponent={<SlideNumber slideNumber={1} />}
          />
          <ContentBox
            title="실시간 질문 요약"
            variant="custom"
            height="350px"
            width="680px"
          >
            <SummaryBoxContainer>
              <img className="face-image" src={faceImage} alt="face" />
              <h2>실시간 질문 요약</h2>
              <img
                className="rectangle-image"
                src={rectangleImage}
                alt="rectangle"
              />
              <h3>Boini 질문 요약 내용내용내용내용내용이다</h3>
            </SummaryBoxContainer>
          </ContentBox>
        </LeftBoxContainer>
        <RightBoxContainer>
          <ContentBox
            title="받았던 질문들"
            titleStyle={{
              color: "#434343",
              fontSize: "20px",
              fontWeight: "600",
              fontStyle: "normal",
            }}
            content={
              "• (질문 내용)\n• (질문 내용)\n• (질문 내용)\n• (질문 내용)\n• (질문 내용)\n• (질문 내용)\n• (질문 내용)\n• (질문 내용)"
            }
            variant="text"
            width="auto"
            height="760px"
            contentStyle={{
              color: "#5C5C5C",
              fontSize: "24px",
              fontWeight: "400",
              fontStyle: "normal",
            }}
          />
        </RightBoxContainer>
      </TotalContainer>
    </QuestionSlideContainer>
  );
};

export default QuestionSlide;
