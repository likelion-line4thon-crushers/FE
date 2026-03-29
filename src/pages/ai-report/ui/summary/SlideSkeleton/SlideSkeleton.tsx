import React from "react";
import { SkeletonContainer } from "./SlideSkeleton.styles";

const SlideSkeleton = ({
  width = "100%",
  height = "100%",
}: {
  width?: string;
  height?: string;
}) => {
  return <SkeletonContainer $width={width} $height={height} />;
};

export default SlideSkeleton;
