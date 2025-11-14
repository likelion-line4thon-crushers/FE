import styled from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #fff;
`;

export const CenterContainer = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  flex: 1;
  gap: 1vh;
  padding: 2vh 1vw;
  position: relative;
  background: #fff;
`;

export const RightPanelContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  height: 100%;
`;
