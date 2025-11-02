import React from "react";
import {
  HeaderContainer,
  IconButton,
  IconContainer,
} from "./SideHeader.styles";
import TotalReactionIcon from "../../../assets/images/AI/TotalReaction.png";
import Top3Icon from "../../../assets/images/AI/Top3.png";
import PopularSlideIcon from "../../../assets/images/AI/PopularSlide.png";
import QuestionSlideIcon from "../../../assets/images/AI/QuestionSlide.png";
import ReplaySlideIcon from "../../../assets/images/AI/ReplaySlide.png";
import ReviewIcon from "../../../assets/images/AI/Review.png";

const SideHeader = () => {
  return (
    <HeaderContainer>
      <IconContainer>
        <IconButton>
          <img src={TotalReactionIcon} alt="Total Reaction" />
        </IconButton>
        <IconButton>
          <img src={Top3Icon} alt="Top 3" />
        </IconButton>
        <IconButton>
          <img src={PopularSlideIcon} alt="Popular Slide" />
        </IconButton>
        <IconButton>
          <img src={QuestionSlideIcon} alt="Question Slide" />
        </IconButton>
        <IconButton>
          <img src={ReplaySlideIcon} alt="Replay Slide" />
        </IconButton>
        <IconButton>
          <img src={ReviewIcon} alt="Review" />
        </IconButton>
      </IconContainer>
    </HeaderContainer>
  );
};

export default SideHeader;
