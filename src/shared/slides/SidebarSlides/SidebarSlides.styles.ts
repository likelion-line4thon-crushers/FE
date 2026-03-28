/* === SidebarStyles.js === */
import styled from "styled-components";
import playIcon from "../../../assets/images/play.svg";

export const Sidebar = styled.div`
  width: 8vw;
  height: 94vh;
  flex-shrink: 0;
  border: 0.05vw solid #eaeaea;
  background: #f5f5f5;
  padding: 1.7vh 1.7vw;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const SlideList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1vh;
`;

export const SlideThumb = styled.div<{ $active?: boolean; $waiting?: boolean; $locked?: boolean }>`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 6.7vw; /* 129px */
  height: 6.2vh; /* 67px */
  padding: 0.4vh 0.5vw;
  border: ${(p) =>
    p.$waiting
      ? "0.05vw solid #ddd"
      : p.$locked
      ? "0.05vw solid #ddd"
      : p.$active
      ? "0.1vw solid #4a90e2"
      : "0.05vw solid #ddd"};
  border-radius: 0.2vw;
  background: ${(p) =>
    p.$waiting ? "#fff" : p.$locked ? "#fff" : p.$active ? "#303030" : "#fff"};
  cursor: ${(p) => (p.$waiting || p.$locked ? "default" : "pointer")};
  transition: 0.25s ease;
  box-shadow: ${(p) =>
    p.$active && !p.$waiting && !p.$locked
      ? "0 0.2vh 0.5vh rgba(0,0,0,0.1)"
      : "none"};
  position: relative;
  opacity: ${(p) => (p.$locked ? 0.6 : 1)};

  &:hover {
    transform: ${(p) => (p.$waiting || p.$locked ? "none" : "scale(1.02)")};
  }

  ${(p) =>
    p.$active &&
    !p.$waiting &&
    `
    &::after {
      content: "";
      position: absolute;
      right: -0.8vw;
      top: 50%;
      transform: translateY(-50%);
      width: 0.6vw;
      height: 0.6vw;
      background-image: url(${playIcon});
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }
  `}
`;

export const SlideImage = styled.img`
  width: 5.5vw;
  height: 100%;
  object-fit: cover;
  border-radius: 0.1vw;
  border: 0.05vw solid #eee;
`;

export const SlideIndex = styled.div<{ $active?: boolean }>`
  font-size: clamp(8px, 0.6vw, 10px);
  font-weight: 600;
  color: ${(p) => (p.$active ? "#FFF" : "#303030")};
  display: flex;
  align-items: flex-start;
  justify-content: center;
  transition: 0.2s ease;
`;

export const SlidePlaceholder = styled.div`
  width: 5.5vw;
  height: 100%;
  border-radius: 0.1vw;
  border: 0.05vw solid #eee;
  background: #fff;
`;
