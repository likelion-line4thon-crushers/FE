import styled, { keyframes } from "styled-components";
import BackgroundPNG from "../../../../assets/images/background.png";


export const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

/* 배경 */
export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url(${BackgroundPNG});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  font-family: "Pretendard", sans-serif;
`;


export const LoaderRing = styled.div`
  --size: 14vmin;
  --thickness: 0.6vmin;

  position: absolute;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;

  background: conic-gradient(
    from 270deg,
    #000 0deg,
    rgba(0, 0, 0, 0.85) 20deg,
    rgba(0, 0, 0, 0.55) 60deg,
    rgba(0, 0, 0, 0.25) 100deg,
    rgba(0, 0, 0, 0) 150deg 360deg
  );
  mask: radial-gradient(farthest-side, transparent calc(100% - var(--thickness)), #000 0);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - var(--thickness)), #000 0);

  animation: ${spin} 1.2s linear infinite;

  &::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: var(--thickness);
    height: var(--thickness);
    background: #000;
    border-radius: 50%;
    transform: translate(-50%, -50%)
      rotate(270deg)
      translateY(calc(-0.5 * var(--size) + 0.5 * var(--thickness)));
    transform-origin: center;
    box-shadow: 0 0 0.2vmin rgba(0, 0, 0, 0.35);
  }
`;

export const Center = styled.div`
  position: relative;
  width: 14vmin;
  height: 14vmin;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Logo = styled.img<{ active?: boolean }>`
  width: 15vmin;
  height: auto;
  position: absolute;
  transition: opacity 0.4s ease-in-out;
  opacity: ${(props) => (props.active ? 1 : 0)};
`;

export const Message = styled.p`
  margin-top: 2vh;
  font-size: clamp(14px, 1vw, 18px);
  color: #333;
  font-weight: 500;
`;
