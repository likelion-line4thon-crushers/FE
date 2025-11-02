import styled from "styled-components";

export const HeaderContainer = styled.div`
  display: flex;
  width: 100px;
  height: 4996px;
  padding: 280px 32px 4260px 32px;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
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
    width: 100%;
    height: auto;
    object-fit: contain;
  }
`;
