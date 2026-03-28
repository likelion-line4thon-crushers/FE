import React from "react";
import { SlideNumberButton } from "./SlideNumber.styles";

const SlideNumber = ({
  slideNumber = 0,
  emojiCount = null,
  variant = "primary",
}: { slideNumber?: any; emojiCount?: any; variant?: string }) => {
  const displayText =
    emojiCount !== null && emojiCount !== undefined
      ? `슬라이드 ${slideNumber} - ${emojiCount}개 `
      : `슬라이드 ${slideNumber}`;

  return (
    <SlideNumberButton $variant={variant}>{displayText}</SlideNumberButton>
  );
};

export default SlideNumber;
