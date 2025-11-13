import styled from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #fff;
`;

export const CenterContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 1.48vh;
  padding: 0.93vh 0.52vw;
  position: relative;
  background: #fff;
`;

export const RightPanelContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  flex-shrink: 0;
  min-width: 0;
`;
