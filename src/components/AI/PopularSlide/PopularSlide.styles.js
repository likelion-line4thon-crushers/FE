import styled from "styled-components";

export const PopularSlideContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 20px;

  h1 {
    color: #000;
    font-family: Pretendard;
    font-size: 32px;
    font-style: normal;
    font-weight: 600;
    margin: 0;
  }
`;

export const EmojiPanelWrapper = styled.div`
  position: relative;
  width: 100%;

  /* EmojiPanel의 absolute 위치를 relative로 오버라이드 */
  > div {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    transform: none !important;
    width: 650px !important;
    height: 40px !important;
    min-height: 50px;
    padding: 20px 40px !important;
    margin: 0;
  }

  img {
    width: 60px !important;
    height: 60px !important;
  }
`;
