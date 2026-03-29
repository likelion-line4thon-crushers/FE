import styled from "styled-components";

export const LiveBox = styled.div`
  width: 90%;
  height: 40vh;
  margin: 2vh 0.6vw;
  border-radius: 1vw;
  border: 0.05vw solid #eaeaea;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const QuestionContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1vh 0.63vw;
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

export const QuestionItem = styled.div<{ $active?: boolean }>`
  margin-bottom: 0.9vh;
  padding: 1.11vh 0.63vw;
  background: ${({ $active }) => ($active ? "#f1f1f1" : "#fff")};
  border-radius: 0.51vw;
  border: 1px solid ${({ $active }) => ($active ? "#eaeaea" : "transparent")};
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
  width: 100%;
  box-sizing: border-box;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const QuestionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.74vh;
  gap: 0.6vw;
`;

export const SlideTag = styled.button<{ $active?: boolean }>`
  background: #5c5c5c;
  color: #fff;
  font-size: clamp(9px, 0.65vw, 11px);
  font-weight: 600;
  border-radius: 0.21vw;
  padding: 0.19vh 0.42vw;
  min-width: 3.07vw;
  border: none;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background: #4a4a4a;
    transform: translateY(-1px);
  }
`;

export const Time = styled.div`
  font-size: clamp(9px, 0.6vw, 11px);
  color: #767676;
  font-weight: 400;
`;

export const Content = styled.div`
  color: #111;
  font-size: clamp(10px, 0.7vw, 12px);
  font-weight: 400;
  line-height: 1.4;
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
