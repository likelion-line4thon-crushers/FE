import styled from "styled-components";

export const Screen = styled.div<{ $immersive?: boolean }>`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
  cursor: ${({ $immersive }) => ($immersive ? "none" : "default")};
`;

/* 16:9 무대 — 뷰포트에 레터박스로 맞추고, 그 안에서 리액션 스티커를 %로 배치 */
export const Stage = styled.div`
  position: relative;
  width: 100vw;
  max-width: calc(100vh * 16 / 9);
  aspect-ratio: 16 / 9;
  container-type: inline-size;
`;

export const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
`;

export const BroadcastStampImage = styled.img`
  position: absolute;
  transform: translate(-50%, -50%);
  width: 3.4cqw;
  height: 3.4cqw;
  pointer-events: none;
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

/* 하단 인디케이터 영역 — 전체화면에서 마우스/터치 시 노출, 그라데이션 마스크 + 좌우 화살표 */
export const BottomControls = styled.div<{ $visible: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: clamp(96px, 15vh, 180px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0) 100%);
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  transition: opacity 0.3s ease;
`;

export const ArrowButton = styled.button`
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.7;
  }

  svg {
    display: block;
    width: 40px;
    height: 40px;
  }
`;
