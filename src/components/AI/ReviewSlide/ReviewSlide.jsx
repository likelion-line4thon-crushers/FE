import React from "react";
import {
  ReviewSlideContainer,
  TotalContainer,
  LeftBoxContainer,
  RightBoxContainer,
  RatingWrapper,
  RatingRow,
  RatingScore,
  SummaryBoxContainer,
  CenterHeader,
  SmallDivider,
} from "./ReviewSlide.styles";
import AITitle from "../AITitle/AITitle";
import ContentBox from "../ContentBox/ContentBox";
import SatisfyImage from "../../../assets/images/AI/Satisfy.png";
import StarImage from "../../../assets/images/AI/Star.png";
import RectangleImage from "../../../assets/images/AI/Rectangle.png";
import faceImage from "../../../assets/images/emoji1_black.svg";
const ReviewSlide = () => {
  return (
    <ReviewSlideContainer>
      <AITitle
        title="청중의 한마디"
        description="청중이 세션에 대해 남긴 후기와 의견입니다."
      />
      <TotalContainer>
        <LeftBoxContainer>
          <ContentBox title="" variant="custom" width="640px" height="300px">
            <CenterHeader>
              <img src={SatisfyImage} alt="satisfy" width={48} height={48} />
              <h2>세션 만족도</h2>
              <SmallDivider />
            </CenterHeader>
            <RatingWrapper>
              <RatingRow>
                <img src={StarImage} alt="star" width={28} height={28} />
                <RatingScore>
                  0.0점 <span>/ 5점</span>
                </RatingScore>
              </RatingRow>
            </RatingWrapper>
          </ContentBox>

          <ContentBox
            title="청중 후기 요약"
            variant="custom"
            height="300px"
            width="640px"
          >
            <SummaryBoxContainer>
              <img className="icon-image" src={faceImage} alt="face" />
              <h2>청중 후기 요약</h2>
              <SmallDivider />
              <h3>Boini 후기 요약</h3>
            </SummaryBoxContainer>
          </ContentBox>
        </LeftBoxContainer>
        <RightBoxContainer>
          <ContentBox
            title="청중 후기 및 의견 모음"
            variant="text"
            width="765px"
            height="650px"
            content={
              "• (질문 내용)\n• (질문 내용)\n• (질문 내용)\n• (질문 내용)\n• (질문 내용)\n• (질문 내용)\n• (질문 내용)\n• (질문 내용)"
            }
          />
        </RightBoxContainer>
      </TotalContainer>
    </ReviewSlideContainer>
  );
};

export default ReviewSlide;
