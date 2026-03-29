import React, { useState, useEffect } from "react";
import { HeaderContainer, IconButton, IconContainer } from "./SideHeader.styles";
import TotalReactionIcon from "@/shared/assets/images/AI/TotalReaction.png";
import TotalReactionSelectedIcon from "@/shared/assets/images/AI/TotalReaction_selected.png";
import Top3Icon from "@/shared/assets/images/AI/Top3.png";
import Top3SelectedIcon from "@/shared/assets/images/AI/Top3_selected.png";
import PopularSlideIcon from "@/shared/assets/images/AI/PopularSlide.png";
import PopularSlideSelectedIcon from "@/shared/assets/images/AI/PopularSlide_selected.png";
import QuestionSlideIcon from "@/shared/assets/images/AI/QuestionSlide.png";
import QuestionSlideSelectedIcon from "@/shared/assets/images/AI/QuestionSlide_selected.png";
import ReplaySlideIcon from "@/shared/assets/images/AI/ReplaySlide.png";
import ReplaySlideSelectedIcon from "@/shared/assets/images/AI/ReplaySlide_selected.png";
import ReviewIcon from "@/shared/assets/images/AI/Review.png";
import ReviewSelectedIcon from "@/shared/assets/images/AI/Review_selected.png";

const SideHeader = ({
  onIconClick,
  activeSection,
}: {
  onIconClick?: (name: string) => void;
  activeSection?: string;
}) => {
  const [selectedIcon, setSelectedIcon] = useState("totalReaction");

  useEffect(() => {
    if (activeSection) {
      setSelectedIcon(activeSection);
    }
  }, [activeSection]);

  const handleIconClick = (iconName: string) => {
    setSelectedIcon(iconName);
    if (onIconClick) {
      onIconClick(iconName);
    }
  };

  const icons = [
    {
      name: "totalReaction",
      normal: TotalReactionIcon,
      selected: TotalReactionSelectedIcon,
      alt: "Total Reaction",
    },
    {
      name: "top3",
      normal: Top3Icon,
      selected: Top3SelectedIcon,
      alt: "Top 3",
    },
    {
      name: "popularSlide",
      normal: PopularSlideIcon,
      selected: PopularSlideSelectedIcon,
      alt: "Popular Slide",
    },
    {
      name: "questionSlide",
      normal: QuestionSlideIcon,
      selected: QuestionSlideSelectedIcon,
      alt: "Question Slide",
    },
    {
      name: "replaySlide",
      normal: ReplaySlideIcon,
      selected: ReplaySlideSelectedIcon,
      alt: "Replay Slide",
    },
    {
      name: "review",
      normal: ReviewIcon,
      selected: ReviewSelectedIcon,
      alt: "Review",
    },
  ];

  return (
    <HeaderContainer>
      <IconContainer>
        {icons.map((icon) => (
          <IconButton
            key={icon.name}
            onClick={() => handleIconClick(icon.name)}
            $isSelected={selectedIcon === icon.name}
          >
            <img src={selectedIcon === icon.name ? icon.selected : icon.normal} alt={icon.alt} />
          </IconButton>
        ))}
      </IconContainer>
    </HeaderContainer>
  );
};

export default SideHeader;
