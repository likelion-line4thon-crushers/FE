import styled from "styled-components";

// The #fafafa rounded box that holds the whole question list (cluster list +
// question list read as one continuous list with uniform 20px gaps).
export const QuestionScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  margin: 1vh 0.6vw 1.5vh;
  border: 1px solid #eaeaea;
  background: #fafafa;
  border-radius: 1.04vw;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 11px;
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;

  &::-webkit-scrollbar {
    width: 0.4vw;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #c8c8c8;
    border-radius: 1vw;
  }
`;

export const LiveBox = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

export const QuestionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const QuestionItem = styled.div<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  box-sizing: border-box;
`;

export const QuestionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
`;

export const SlideTag = styled.button<{ $active?: boolean }>`
  background: #5c5c5c;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
  padding: 4px 8px;
  letter-spacing: -0.3px;
  line-height: 1.45;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #4a4a4a;
  }
`;

export const Time = styled.div`
  font-size: 12px;
  color: #767676;
  font-weight: 400;
  letter-spacing: -0.3px;
  line-height: 1.45;
`;

export const Content = styled.div`
  color: #111;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.45;
  letter-spacing: -0.375px;
  text-align: left;
`;

export const StatusMessage = styled.div`
  padding: 2vh 1vw;
  color: #767676;
  font-size: clamp(11px, 0.75vw, 13px);
  text-align: center;
`;

export const ErrorMessage = styled(StatusMessage)`
  color: #d14343;
`;

export const ActionGroup = styled.div`
  margin-left: auto;
  display: flex;
  gap: 5px;
`;

export const ActionButton = styled.button<{ $variant: "delete" | "complete" }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: -0.3px;
  white-space: nowrap;
  color: ${({ $variant }) => ($variant === "delete" ? "#999" : "#43a047")};
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.7;
  }
`;
