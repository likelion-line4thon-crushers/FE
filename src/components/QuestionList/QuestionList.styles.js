import styled from "styled-components";

/* ===============================
   기존 LiveBox 그대로 유지
=============================== */
export const LiveBox = styled.div`
  flex-shrink: 0;
  padding: 8.5vh 0 4vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2vh 0.6vw;
  border-radius: 1vw;
  border: 0.05vw solid #eaeaea;
  background: #fafafa;
  height: 100%;
`;

/* ===============================
   헤더 및 종료 버튼
=============================== */
export const Header = styled.div`
  width: 90%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1vh;
`;

export const Title = styled.h3`
  font-size: clamp(13px, 0.9vw, 16px);
  font-weight: 600;
  color: #333;
`;

export const EndButton = styled.button`
  background-color: #ff5a5a;
  color: #fff;
  border: none;
  border-radius: 0.6vw;
  padding: 0.6vh 1vw;
  font-size: clamp(10px, 0.7vw, 12px);
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background-color: #ff3737;
  }
`;

/* ===============================
   질문 목록 스타일
=============================== */
export const QuestionContainer = styled.div`
  width: 90%;
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 0.5vw;
`;

export const QuestionItem = styled.div`
  background: #ffffff;
  border-radius: 0.6vw;
  padding: 1vh 1vw;
  margin-bottom: 1vh;
  box-shadow: 0 0.4vh 0.6vh rgba(0, 0, 0, 0.05);
`;

export const Author = styled.div`
  font-weight: 600;
  color: #444;
  font-size: clamp(11px, 0.75vw, 13px);
  margin-bottom: 0.4vh;
`;

export const Content = styled.div`
  color: #333;
  font-size: clamp(10px, 0.7vw, 12px);
  margin-bottom: 0.3vh;
  line-height: 1.3;
`;

export const Time = styled.div`
  font-size: clamp(9px, 0.65vw, 11px);
  color: #888;
  text-align: right;
`;

export const EmptyText = styled.div`
  color: #999;
  font-size: clamp(10px, 0.7vw, 12px);
  text-align: center;
  margin-top: 30%;
`;
