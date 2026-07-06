import styled from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding-left: 2.8vw;
  padding-bottom: 100px;
  padding-top: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  gap: 35px;
`;

export const FooterContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  margin-bottom: 60px;

  img {
    height: 24px;
    width: auto;
  }
`;
