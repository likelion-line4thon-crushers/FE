import styled from "styled-components";
import { ActionButton, ActionGroup } from "./QuestionList.styles";

export { ActionButton, ActionGroup };

/* 클러스터 카드: 대표 질문 + 세부 질문 + 토글을 12px 간격으로 쌓는다 */
export const ClusterItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
`;

export const GroupTag = styled.div`
  background: #e74d07;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
  padding: 4px 8px;
  letter-spacing: -0.3px;
  line-height: 1.45;
  white-space: nowrap;
`;

/* 펼쳤을 때 들여쓰기되는 세부 질문 행 */
export const SubQuestion = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  padding-left: 16px;
  box-sizing: border-box;
`;

export const ClusterToggle = styled.button<{ $expanded?: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0;
  padding-left: ${({ $expanded }) => ($expanded ? "16px" : "0")};
  font-size: 14px;
  font-weight: 500;
  color: #303030;
  letter-spacing: -0.35px;
  line-height: 1.45;
`;

export const Chevron = styled.span<{ $up?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: rotate(${({ $up }) => ($up ? "180deg" : "0deg")});
  transition: transform 0.2s ease;
`;
