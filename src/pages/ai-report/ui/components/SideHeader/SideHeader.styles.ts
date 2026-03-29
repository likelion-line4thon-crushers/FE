import styled from "styled-components";

export const HeaderContainer = styled.div`
  display: flex;
  width: 20px;
  height: 100%;
  padding: 220px 30px 4260px 30px;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  border: 1px solid #eaeaea;
  background: #f5f5f5;
  position: sticky;
  left: 0;
  top: 0;
  z-index: 999;
`;

export const IconButton = styled.button<{ $isSelected?: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 23px;
    height: 23px;
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

  gap: 28px;
  flex-shrink: 0;
`;
