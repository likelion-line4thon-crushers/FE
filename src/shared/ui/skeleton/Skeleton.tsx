import React from "react";
import { SkeletonBox } from "./Skeleton.styles";

interface SkeletonProps {
  width?: string;
  height?: string;
  radius?: string;
  className?: string;
}

// Shimmer placeholder for content that is loading or unavailable.
const Skeleton = ({ width, height, radius, className }: SkeletonProps) => {
  return <SkeletonBox $width={width} $height={height} $radius={radius} className={className} />;
};

export default Skeleton;
