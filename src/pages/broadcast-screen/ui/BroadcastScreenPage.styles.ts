import styled from "styled-components";

export const Screen = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
  cursor: default;
`;

export const SlideImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
`;

export const Placeholder = styled.div`
  color: #8a8a8a;
  font-size: clamp(14px, 1.4vw, 20px);
  font-weight: 500;
  text-align: center;
  padding: 0 24px;
  line-height: 1.6;
`;

export const FullscreenHint = styled.button`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 18px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: opacity 0.4s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;
