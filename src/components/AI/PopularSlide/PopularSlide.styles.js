import styled from "styled-components";

export const PopularSlideContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 20px;
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

export const SectionContainer = styled.div`
  padding-right: 2.8vw;
`;
export const SlideContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  width: 100%;
  align-items: flex-start;
  margin-top: 20px;
`;

export const LargeSlide = styled.div`
  flex: 1;
  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  aspect-ratio: 16 / 9;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const SmallSlide = styled.div`
  width: 400px;
  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  aspect-ratio: 16 / 9;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const NoSlideMessage = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #fafafa;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  min-height: 400px;

  img {
    width: 200px;
    height: 200px;
    object-fit: contain;
    margin-bottom: 20px;
  }

  p {
    font-family: Pretendard;
    font-size: 18px;
    font-weight: 400;
    color: #666;
    margin: 0;
  }
`;
