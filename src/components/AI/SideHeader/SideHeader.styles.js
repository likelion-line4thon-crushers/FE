import styled from "styled-components";

export const HeaderContainer = styled.div`
  display: flex;
  width: 20px;
  height: 4996px;
  padding: 280px 32px 4260px 32px;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  border: 1px solid #eaeaea;
  background: #f5f5f5;
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    aspect-ratio: 1/1;
  }
`;
export const IconContainer = styled.div`
  display: flex;
  width: 36px;
  height: 456px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 48px;
  flex-shrink: 0;
`;
