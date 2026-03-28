import styled from "styled-components";

export const SlideNumberButton = styled.button<{ $variant?: string }>`
  min-width: 80px;
  width: auto;

  display: flex;
  padding: 6px 10px;
  justify-content: center;
  align-items: center;
  gap: 6px;
  border-radius: 6px;
  border: none;
  font-family: Pretendard, sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;

  ${({ $variant }) =>
    $variant === "secondary"
      ? `
    background: #eaeaea;
    color: #5C5C5C;;
  `
      : `
    background: #e74d07;
    color: #fff;
  `}
`;
