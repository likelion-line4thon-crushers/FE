import styled from "styled-components";

// White block that centers the tab bar (Figma: bg-white, px-10 py-16, items-center)
export const TabsBlock = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 16px 10px;
  box-sizing: border-box;
`;

// Content-width pill group, centered — not full width (Figma: f1f1f1, h-44, p-4, rounded-12)
export const TabsContainer = styled.div`
  display: inline-grid;
  grid-template-columns: 1fr 1fr;
  background: #f1f1f1;
  border-radius: 12px;
  padding: 4px;
  box-sizing: border-box;
`;

export const Tab = styled.button<{ $active: boolean }>`
  background: ${({ $active }) =>
    $active ? "linear-gradient(180deg, #303030 0%, #212121 100%)" : "transparent"};
  color: ${({ $active }) => ($active ? "#eaeaea" : "#999")};
  box-shadow: ${({ $active }) =>
    $active
      ? "0px 4px 4px rgba(0,0,0,0.12), inset -2px -2px 4px rgba(0,0,0,0.6), inset 2px 2px 4px rgba(255,255,255,0.25)"
      : "none"};
  border: none;
  border-radius: 8px;
  padding: 13px 30px;
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  letter-spacing: -0.325px;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
`;
