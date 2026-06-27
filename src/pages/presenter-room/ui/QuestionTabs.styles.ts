import styled from "styled-components";

export const TabsContainer = styled.div`
  display: inline-flex;
  width: 100%;
  background: #f1f1f1;
  border-radius: 12px;
  padding: 4px;
  box-sizing: border-box;
  margin-bottom: 0.8vh;
`;

export const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  background: ${({ $active }) =>
    $active ? "linear-gradient(180deg, #303030 0%, #212121 100%)" : "transparent"};
  color: ${({ $active }) => ($active ? "#eaeaea" : "#999")};
  box-shadow: ${({ $active }) => ($active ? "0px 4px 4px rgba(0,0,0,0.12)" : "none")};
  border: none;
  border-radius: 8px;
  padding: 10px 0;
  font-size: clamp(11px, 0.75vw, 13px);
  font-weight: 600;
  letter-spacing: -0.325px;
  text-align: center;
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
`;
