import styled from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  background-color: #fff;
`;

export const CenterContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 2vh;
  background: #fff;
`;

export const WaitingImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: contain;
`;

export const WaitingMessage = styled.p`
  font-family: Pretendard;
  font-size: 18px;
  font-weight: 400;
  color: #666;
  margin: 0;
`;
