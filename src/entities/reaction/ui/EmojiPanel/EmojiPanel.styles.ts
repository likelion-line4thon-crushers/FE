import styled from "styled-components";
import { MEDIA } from "@/shared/config/breakpoints";

export const EmojiContainer = styled.div`
  width: 80%;
  max-width: 36.67vw;
  height: 4.5vh;
  background: rgba(250, 250, 250, 0.6);
  border: 1px solid #eaeaea;
  border-radius: 100px;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.11vh 1.88vw;
  margin: 0 auto;
  position: absolute;
  top: 90.5%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;

  /* 모바일 오버레이(전체화면): 우측 종료 버튼을 가리지 않도록 좌우 오프셋 배치 */
  @media ${MEDIA.mobile} {
    width: auto;
    max-width: 100%;
    height: auto;
    padding: 6px 12px;
    left: 12px;
    right: 116px;
    transform: translateY(-50%);
  }
`;

export const EmojiWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  gap: 0.42vw;

  /* 모바일: 가로 스크롤 스트립 */
  @media ${MEDIA.mobile} {
    justify-content: flex-start;
    gap: 8px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const EmojiItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.8vh;
  height: 2.8vh;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #e0e0e0;
  }

  /* 터치 타깃 44px 확보 */
  @media ${MEDIA.mobile} {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
  }
`;

export const EmojiIcon = styled.img`
  width: 48px;
  height: 48px;
  object-fit: contain;
  filter: grayscale(100%);

  @media ${MEDIA.mobile} {
    width: 38px;
    height: 38px;
  }
`;

export const SpacingBox = styled.div`
  display: none;
`;
