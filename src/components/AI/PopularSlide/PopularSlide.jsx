import React from "react";
import {
  PopularSlideContainer,
  EmojiPanelWrapper,
} from "./PopularSlide.styles";
import EmojiPanel from "../../Audience/EmojiPanel";
import ContentBox from "../ContentBox/ContentBox";

const PopularSlide = () => {
  return (
    <PopularSlideContainer>
      <h1>이모지별 인기 슬라이드</h1>
      <EmojiPanelWrapper>
        <EmojiPanel />
      </EmojiPanelWrapper>
      <ContentBox
        title="재미있는 반응을 가장 많이 받은 슬라이드"
        content="이모지별 인기 슬라이드 내용"
        variant="text"
        width="auto"
        height="auto"
      />
    </PopularSlideContainer>
  );
};

export default PopularSlide;
