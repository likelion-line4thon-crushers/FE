import React, { useState } from "react";
import {
  EmojiContainer,
  EmojiWrapper,
  EmojiItem,
  EmojiIcon,
  SpacingBox,
} from "./EmojiPanel.styles";
import interestSVG from "@/shared/assets/icons/Emoji/Interesting.png";
import surpriseSVG from "@/shared/assets/icons/Emoji/surprising.png";
import curiousSVG from "@/shared/assets/icons/Emoji/curious.png";
import excitingSVG from "@/shared/assets/icons/Emoji/Exciting.png";
import angrySVG from "@/shared/assets/icons/Emoji/angry.png";
import sadSVG from "@/shared/assets/icons/Emoji/Sad.png";
import okSVG from "@/shared/assets/icons/Emoji/O.png";
import xSVG from "@/shared/assets/icons/Emoji/X.png";
import interestSVGHover from "@/shared/assets/icons/Emoji_hover/Interesting_hover.png";
import surpriseSVGHover from "@/shared/assets/icons/Emoji_hover/surprising_hover.png";
import curiousSVGHover from "@/shared/assets/icons/Emoji_hover/curious_hover.png";
import excitingSVGHover from "@/shared/assets/icons/Emoji_hover/Exciting_hover.png";
import angrySVGHover from "@/shared/assets/icons/Emoji_hover/angry_hover.png";
import sadSVGHover from "@/shared/assets/icons/Emoji_hover/Sad_hover.png";
import okSVGHover from "@/shared/assets/icons/Emoji_hover/O_hover.png";
import xSVGHover from "@/shared/assets/icons/Emoji_hover/X_hover.png";
import interestSelected from "@/shared/assets/icons/Emoji_selected/Interesting_selected.png";
import surpriseSelected from "@/shared/assets/icons/Emoji_selected/surprising_selected.png";
import curiousSelected from "@/shared/assets/icons/Emoji_selected/curious_selected.png";
import excitingSelected from "@/shared/assets/icons/Emoji_selected/Exciting_selected.png";
import angrySelected from "@/shared/assets/icons/Emoji_selected/angry_selected.png";
import sadSelected from "@/shared/assets/icons/Emoji_selected/Sad_selected.png";
import okSelected from "@/shared/assets/icons/Emoji_selected/O_selected.png";
import xSelected from "@/shared/assets/icons/Emoji_selected/X_selected.png";

const EmojiPanel = ({
  selectedId: controlledSelectedId,
  onSelect,
}: {
  selectedId?: any;
  onSelect?: (emoji: any | null) => void;
}) => {
  const isControlled = controlledSelectedId !== undefined;
  const [uncontrolledSelectedId, setUncontrolledSelectedId] = useState<number | null>(null);
  const selectedId = isControlled ? controlledSelectedId : uncontrolledSelectedId;

  const emojis = [
    {
      id: 1,
      icon: interestSVG,
      hoverIcon: interestSVGHover,
      selectedIcon: interestSelected,
    },
    {
      id: 2,
      icon: surpriseSVG,
      hoverIcon: surpriseSVGHover,
      selectedIcon: surpriseSelected,
    },
    {
      id: 3,
      icon: curiousSVG,
      hoverIcon: curiousSVGHover,
      selectedIcon: curiousSelected,
    },
    {
      id: 4,
      icon: excitingSVG,
      hoverIcon: excitingSVGHover,
      selectedIcon: excitingSelected,
    },
    {
      id: 5,
      icon: angrySVG,
      hoverIcon: angrySVGHover,
      selectedIcon: angrySelected,
    },
    { id: 6, icon: sadSVG, hoverIcon: sadSVGHover, selectedIcon: sadSelected },
    { id: 7, icon: okSVG, hoverIcon: okSVGHover, selectedIcon: okSelected },
    { id: 8, icon: xSVG, hoverIcon: xSVGHover, selectedIcon: xSelected },
  ];

  return (
    <EmojiContainer>
      <EmojiWrapper>
        {emojis.map((emoji) => (
          <EmojiItem key={emoji.id}>
            <EmojiIcon
              src={selectedId === emoji.id ? emoji.selectedIcon : emoji.icon}
              alt={`이모티콘 ${emoji.id}`}
              onMouseEnter={(e) => {
                if (selectedId !== emoji.id) (e.target as HTMLImageElement).src = emoji.hoverIcon;
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLImageElement).src =
                  selectedId === emoji.id ? emoji.selectedIcon : emoji.icon;
              }}
              onClick={() => {
                const isSelected = selectedId === emoji.id;
                if (onSelect) onSelect(isSelected ? null : emoji);
                if (!isControlled) setUncontrolledSelectedId(isSelected ? null : emoji.id);
              }} //마우스 포인터 변경
            />
          </EmojiItem>
        ))}
      </EmojiWrapper>
    </EmojiContainer>
  );
};

export default EmojiPanel;
