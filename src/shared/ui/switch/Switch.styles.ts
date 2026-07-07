import styled from "styled-components";

export const SwitchInput = styled.input.attrs({ type: "checkbox" })`
  --switch-width: clamp(43px, 2.71vw, 52px);
  --switch-height: clamp(23px, 2.59vh, 28px);
  --switch-thumb: clamp(20px, 2.22vh, 24px);
  --switch-offset: calc((var(--switch-height) - var(--switch-thumb)) / 2);

  appearance: none;
  width: var(--switch-width);
  height: var(--switch-height);
  border-radius: 999px;
  background: #ededed;
  position: relative;
  cursor: pointer;
  transition:
    background 0.25s ease,
    opacity 0.2s ease;
  flex-shrink: 0;

  &:checked {
    background: #e74d07;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  &::after {
    content: "";
    position: absolute;
    top: var(--switch-offset);
    left: var(--switch-offset);
    width: var(--switch-thumb);
    height: var(--switch-thumb);
    background: #fff;
    border-radius: 999px;
    transition: transform 0.25s ease;
  }

  &:checked::after {
    transform: translateX(
      calc(var(--switch-width) - var(--switch-thumb) - (var(--switch-offset) * 2))
    );
  }
`;
