import styled from "styled-components";
import { ActionButton, ActionGroup } from "./QuestionList.styles";

export { ActionButton, ActionGroup };

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

export const ExpandToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0;
  font-size: 14px;
  font-weight: 500;
  color: #303030;
  letter-spacing: -0.35px;
  line-height: 1.45;
`;

export const SampleItem = styled.div`
  padding: 0.55vh 0.63vw;
  background: #f4f4f4;
  border-radius: 0.3vw;
  font-size: 12px;
  color: #444;
  line-height: 1.4;
`;

export const SamplesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
`;
