import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 4vh 2vw;
  box-sizing: border-box;
`;

export const Dialog = styled.div`
  background: #fff;
  border-radius: 16px;
  width: min(1067px, 92vw);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const CloseBar = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1.2vh 1.2vw;
`;

export const CloseButton = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  padding: 0.4vw;
  display: inline-flex;
  img {
    width: clamp(20px, 1.6vw, 32px);
    height: auto;
  }
`;

export const Body = styled.div`
  padding: 0 3vw 1vh;
  overflow-y: auto;
  flex: 1;
`;

export const Intro = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 1.4vw;
  margin-bottom: 2.4vh;
`;

export const IntroText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6vh;
`;

export const IntroTitle = styled.h2`
  margin: 0;
  font-size: clamp(16px, 1.1vw, 20px);
  font-weight: 600;
  color: #111;
`;

export const IntroSub = styled.p`
  margin: 0;
  font-size: clamp(12px, 0.8vw, 14px);
  color: #505050;
`;

export const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6vh;
`;

export const QuestionField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8vh;
`;

export const QuestionLabel = styled.label`
  font-size: clamp(13px, 0.9vw, 15px);
  font-weight: 600;
  color: #111;
`;

export const QuestionInput = styled.input`
  border: 1px solid #e5e5ec;
  border-radius: 4px;
  padding: 1.4vh 1vw;
  font-size: clamp(13px, 0.85vw, 14px);
  color: #303030;
  outline: none;
  &:focus {
    border-color: #e74d07;
  }
  &::placeholder {
    color: #767676;
  }
`;

export const AddRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6vw;
  width: 100%;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 1.6vh 0;
  margin-top: 1.6vh;
  cursor: pointer;
  font-size: clamp(13px, 0.9vw, 14px);
  font-weight: 600;
  color: #434343;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  img {
    width: clamp(14px, 1vw, 16px);
    height: auto;
  }
`;

export const ErrorText = styled.p`
  color: #e74d07;
  font-size: clamp(12px, 0.8vw, 13px);
  margin: 1vh 0 0;
`;

export const Footer = styled.div`
  display: flex;
  justify-content: center;
  padding: 2vh 2vw 3vh;
  border-top: 1px solid #f0f0f0;
`;

export const SaveButton = styled.button`
  background: #303030;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 1.6vh 0;
  width: min(300px, 60%);
  font-size: clamp(13px, 0.9vw, 14px);
  font-weight: 600;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
