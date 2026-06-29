import styled from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #fff;
`;

export const CenterContainer = styled.div<{ $isFullscreen?: boolean }>`
  display: flex;
  height: 100%;
  flex-direction: column;
  flex: 1;
  gap: 1vh;
  padding: 0vh 1vw;
  position: relative;
  background: #fff;

  ${({ $isFullscreen }) =>
    $isFullscreen &&
    `
      width: 100vw;
      height: 100vh;
      padding: 0;
      gap: 0;
      overflow: hidden;
      background: #121212;
    `}

  &:fullscreen {
    width: 100vw;
    height: 100vh;
    padding: 0;
    gap: 0;
    overflow: hidden;
    background: #121212;
  }

  &:-webkit-full-screen {
    width: 100vw;
    height: 100vh;
    padding: 0;
    gap: 0;
    overflow: hidden;
    background: #121212;
  }
`;

export const RightPanelContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  height: 100%;
`;
