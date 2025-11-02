import React, { useState } from "react";
import {
  PopularSlideContainer,
  EmojiPanelWrapper,
  SlideContainer,
  LargeSlide,
  SmallSlide,
  NoSlideMessage,
  SectionContainer,
} from "./PopularSlide.styles";
import EmojiPanel from "../../Audience/EmojiPanel";
import ContentBox from "../ContentBox/ContentBox";
import RabbitImage from "../../../assets/images/rabbit.jpg";
import NoSlideImage from "../../../assets/images/AI/NoSlide.png";

const PopularSlide = () => {
  // 임시 데이터 - 나중에 실제 데이터로 교체
  const [slides] = useState([
    { id: 1, image: RabbitImage },
    { id: 2, image: RabbitImage },
  ]);

  const firstSlide = slides[0];
  const secondSlide = slides[1];

  return (
    <PopularSlideContainer>
      <h1>이모지별 인기 슬라이드</h1>
      <EmojiPanelWrapper>
        <EmojiPanel />
      </EmojiPanelWrapper>
      <SectionContainer>
        <ContentBox
          title="재미있는 반응을 가장 많이 받은 슬라이드"
          variant="custom"
          width="auto"
          height="auto"
        >
          <SlideContainer>
            {slides.length === 0 ? (
              <NoSlideMessage>
                <img src={NoSlideImage} alt="No slides" />
                <p>해당 이모지 반응을 받은 슬라이드가 없습니다 :(</p>
              </NoSlideMessage>
            ) : (
              <>
                <LargeSlide>
                  <img
                    src={firstSlide?.image || RabbitImage}
                    alt="Most popular slide"
                  />
                </LargeSlide>
                {secondSlide && (
                  <SmallSlide>
                    <img src={secondSlide.image} alt="Second popular slide" />
                  </SmallSlide>
                )}
              </>
            )}
          </SlideContainer>
        </ContentBox>
      </SectionContainer>
    </PopularSlideContainer>
  );
};

export default PopularSlide;
