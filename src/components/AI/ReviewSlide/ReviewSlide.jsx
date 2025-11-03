import React from "react";
import { ReviewSlideContainer } from "./ReviewSlide.styles";
import AITitle from "../AITitle/AITitle";
const ReviewSlide = () => {
  return (
    <ReviewSlideContainer>
      <AITitle
        title="청중의 한마디"
        description="청중이 세션에 대해 남긴 후기와 의견입니다."
      />
    </ReviewSlideContainer>
  );
};

export default ReviewSlide;
