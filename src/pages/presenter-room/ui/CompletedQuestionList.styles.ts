import styled from "styled-components";
import { SlideTag } from "./QuestionList.styles";

export const ReadOnlySlideTag = styled(SlideTag).attrs({ as: "div" })`
  cursor: default;
  &:hover {
    background: #5c5c5c;
    transform: none;
  }
`;

export const RevertButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: none;
  border: none;
  padding: 0.19vh 0.42vw;
  cursor: not-allowed;
  font-size: clamp(9px, 0.65vw, 12px);
  font-weight: 500;
  color: #767676;
  letter-spacing: -0.3px;
  white-space: nowrap;
  opacity: 0.7;
`;

export const RefreshIconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
`;
