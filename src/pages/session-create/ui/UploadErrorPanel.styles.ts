import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  min-height: 100dvh;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
  z-index: 9999;
  padding: 0 24px;
`;

export const Icon = styled.div`
  font-size: 48px;
  line-height: 1;
`;

export const Message = styled.p`
  margin: 0;
  color: #303030;
  font-size: 24px;
  font-weight: 600;
  line-height: 34px;
  text-align: center;
  word-break: keep-all;
  max-width: 560px;
`;

export const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

export const RetryButton = styled.button`
  padding: 12px 28px;
  border: none;
  border-radius: 8px;
  background: #e8541e;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: #cc3f13;
  }
`;

export const HomeButton = styled.button`
  padding: 12px 28px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background: transparent;
  color: #5c5c5c;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    border-color: #b0b0b0;
    color: #303030;
  }
`;
