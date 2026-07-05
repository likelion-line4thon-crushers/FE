import styled from "styled-components";

export const SortMenuWrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
`;

export const SortButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid #eaeaea;
  border-radius: 100px;
  background: #ffffff;
  color: #303030;
  font-size: 12px;
  font-weight: 600;
  line-height: 17px;
  white-space: nowrap;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover,
  &[aria-expanded="true"] {
    border-color: #cbccc9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &:focus-visible {
    outline: 2px solid #303030;
    outline-offset: 2px;
  }
`;

export const SortIconSlot = styled.span<{ $muted?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ $muted }) => ($muted ? "#767676" : "#5c5c5c")};
  font-size: 14px;

  svg {
    width: 1em;
    height: 1em;
  }
`;

export const SortMenu = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  z-index: 20;
`;

export const SortMenuItem = styled.button<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 8px 10px;
  border: none;
  border-radius: 7px;
  background: ${({ $selected }) => ($selected ? "#303030" : "#ffffff")};
  color: ${({ $selected }) => ($selected ? "#ffffff" : "#5c5c5c")};
  font-size: 13px;
  font-weight: ${({ $selected }) => ($selected ? 600 : 500)};
  line-height: 19px;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background: ${({ $selected }) => ($selected ? "#303030" : "#f5f5f5")};
  }
`;
