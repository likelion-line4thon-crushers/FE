import styled, { keyframes } from "styled-components";

export const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  min-height: 100vh;
  min-height: 100dvh;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 28px;
  z-index: 9999;
  font-family: "Pretendard", sans-serif;
`;

export const LoaderRing = styled.div`
  --size: 130px;
  --thickness: 4px;

  position: absolute;
  inset: 0;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  animation: ${spin} 1.2s linear infinite;

  &::before,
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
  }

  &::before {
    border: var(--thickness) solid #d9d9d9;
  }

  &::after {
    background: conic-gradient(from 242deg, #303030 0deg 112deg, transparent 112deg 360deg);
    mask: radial-gradient(farthest-side, transparent calc(100% - var(--thickness)), #000 0);
    -webkit-mask: radial-gradient(
      farthest-side,
      transparent calc(100% - var(--thickness)),
      #000 0
    );
  }
`;

export const Center = styled.div`
  position: relative;
  width: 130px;
  height: 130px;
  aspect-ratio: 1 / 1;
  display: grid;
  place-items: center;
`;

export const MarkSurface = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 200px;
  display: grid;
  place-items: center;
`;

export const BrandMark = styled.svg`
  width: 43px;
  height: 45px;
  overflow: visible;

  path {
    fill: #303030;
  }

  .accent {
    fill: #e74d07;
  }
`;

export const Message = styled.p`
  margin: 0;
  color: #5c5c5c;
  font-size: 32px;
  font-weight: 600;
  line-height: 42px;
  letter-spacing: 0;
  text-align: center;
  word-break: keep-all;
`;
