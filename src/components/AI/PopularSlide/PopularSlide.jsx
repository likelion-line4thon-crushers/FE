import React from "react";
import {
  PopularSlideContainer,
  EmojiPanelWrapper,
} from "./PopularSlide.styles";
import EmojiPanel from "../../Audience/EmojiPanel";

const PopularSlide = () => {
  return (
    <PopularSlideContainer>
      <h1>이모지별 인기 슬라이드</h1>
      <EmojiPanelWrapper>
        <EmojiPanel />
      </EmojiPanelWrapper>
    </PopularSlideContainer>
  );
};

export default PopularSlide;
