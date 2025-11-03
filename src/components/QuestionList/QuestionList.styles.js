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
  padding: 1vh 0vw;
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

export const QuestionItem = styled.div`
  padding: 0.8vh 0.6vw;
  margin-bottom: 1vh;
`;


export const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-start;
  gap: 0.6vw;
  align-items: center;
  margin-bottom: 0.8vh;
`;

export const SlideTag = styled.div`
  background: #5C5C5C;;
  color: #fff;
  font-size: clamp(9px, 0.65vw, 11px);
  font-weight: 400;
  border-radius: 0.25vw;
  padding: 0.2vh 0.4vw;
`;

export const Time = styled.div`
  font-size: clamp(9px, 0.6vw, 11px);
  color: #767676;
  font-weight: 500;
`;

export const Content = styled.div`
  font-size: clamp(10px, 0.7vw, 12px);
  color: #333;
  line-height: 1.4;
`;
