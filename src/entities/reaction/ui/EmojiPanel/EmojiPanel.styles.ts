import styled from "styled-components";

export const EmojiContainer = styled.div`
  width: 80%;
  max-width: 36.67vw;
  height: 4.5vh;
  background: #fafafa;
  border: 1px solid #eaeaea;
  border-radius: 5.21vw;
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
`;

export const EmojiWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  gap: 0.42vw;
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
`;

export const EmojiIcon = styled.img`
  width: 48px;
  height: 48px;
  object-fit: contain;
  filter: grayscale(100%);
`;

export const SpacingBox = styled.div`
  display: none;
`;
