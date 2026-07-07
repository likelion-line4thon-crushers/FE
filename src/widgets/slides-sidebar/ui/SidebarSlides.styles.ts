/* === SidebarStyles.js === */
import styled from "styled-components";
import playIcon from "@/shared/assets/images/play.svg";

export const Sidebar = styled.div`
  width: 10.05vw;
  height: 100%;
  flex-shrink: 0;
  border: 0.05vw solid #eaeaea;
  background: #f5f5f5;
  padding: clamp(22px, 2.87vh, 31px) clamp(20px, 1.61vw, 31px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const SlideList = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 1.11vh, 12px);
`;

export const SlideThumb = styled.div<{ $active?: boolean; $waiting?: boolean; $locked?: boolean }>`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  aspect-ratio: 129 / 67;
  padding: clamp(2px, 0.28vh, 3px) clamp(4px, 0.26vw, 5px);
  box-sizing: border-box;
  border: ${(p) =>
    p.$waiting
      ? "0.05vw solid #ddd"
      : p.$locked
        ? "0.05vw solid #ddd"
        : p.$active
          ? "0.1vw solid #4a90e2"
          : "0.05vw solid #ddd"};
  border-radius: 0.2vw;
  background: ${(p) => (p.$waiting ? "#fff" : p.$locked ? "#fff" : p.$active ? "#303030" : "#fff")};
  cursor: ${(p) => (p.$locked ? "not-allowed" : p.$waiting ? "default" : "pointer")};
  transition: 0.25s ease;
  box-shadow: ${(p) =>
    p.$active && !p.$waiting && !p.$locked ? "0 0.2vh 0.5vh rgba(0,0,0,0.1)" : "none"};
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
  width: 81.4%;
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
  width: 81.4%;
  height: 100%;
  border-radius: 0.1vw;
  border: 0.05vw solid #eee;
  background: #fff;
`;
