import styled from "styled-components";

export const Banner = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 10px;
  background: #303030;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  word-break: keep-all;
`;

export const DismissButton = styled.button`
  border: none;
  background: transparent;
  color: #b0b0b0;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  padding: 2px;

  &:hover {
    color: #fff;
  }
`;
