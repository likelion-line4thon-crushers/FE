import React from "react";
import { SlideNumberButton } from "./SlideNumber.styles";

const SlideNumber = ({ slideNumber = 0 }) => {
  return <SlideNumberButton>슬라이드 {slideNumber}</SlideNumberButton>;
};

export default SlideNumber;
