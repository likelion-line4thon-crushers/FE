import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

export const SkeletonBox = styled.div<{ $width?: string; $height?: string; $radius?: string }>`
  width: ${(props) => props.$width ?? "100%"};
  height: ${(props) => props.$height ?? "100%"};
  background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%);
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite;
  border-radius: ${(props) => props.$radius ?? "8px"};
`;
