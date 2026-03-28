import styled from "styled-components";

export const PanelWrapper = styled.div`
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 17vw;
  height: 95%;
  display: flex;
  flex-direction: column;
  border: 1px solid #eaeaea;
  overflow: hidden;
  box-sizing: border-box;
  flex-shrink: 0;
`;

export const HeaderBox = styled.div`
  display: flex;
  height: 4.52vh;
  width: 100%;
  padding: 0.74vh 1vw;
  align-items: center;
  border: 1px solid #eaeaea;
  background: #f9f9f9;
  flex-shrink: 0;
  box-sizing: border-box;
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 0.5vw;
`;

export const Title = styled.h2`
  color: #303030;
  font-family: Pretendard;
  font-size: 15px;
  font-style: normal;
  font-weight: 600;
  line-height: 22px;
  letter-spacing: -0.375px;
  margin: 0;
`;

export const QuestionList = styled.div`
  flex: 1;
  min-height: 0;
  padding: 0.5vw;
  border: 1px solid #eaeaea;
  background: #fafafa;
  border-radius: 1.04vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const QuestionScrollArea = styled.div<{ $isWaiting?: boolean }>`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: ${(props) => (props.$isWaiting ? "center" : "flex-start")};
  text-align: center;

  &::-webkit-scrollbar {
    width: 0.31vw;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 0.16vw;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

export const QuestionItem = styled.div<{ $active?: boolean }>`
  margin-bottom: 0.9vh;
  padding: 1.11vh 0.63vw;
  background: ${(props) => (props.$active ? "#f1f1f1" : "#fff")};
  border-radius: 0.51vw;
  border: 1px solid ${(props: any) => (props.$active ? "#eaeaea" : "transparent")};
  transition: background 0.2s ease, border-color 0.2s ease;
  width: 100%;
  box-sizing: border-box;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SlideLabel = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  padding: 0.19vh 0.42vw;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 0.21vw;
  background: #5c5c5c;
  min-width: 3.07vw;
  border: none;
  color: #fff;
  font-family: Pretendard;
  font-size: 10px;
  font-style: normal;
  font-weight: 600;
  line-height: 16px;
  letter-spacing: -0.25px;
  margin-right: 0.42vw;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #4a4a4a;
    transform: translateY(-1px);
  }
`;

export const Timestamp = styled.span`
  color: #767676;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
  letter-spacing: -0.3px;
  margin-left: 0.42vw;
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.74vh;
`;

export const QuestionContent = styled.div`
  color: #666666;
  font-size: 12px;
  margin: 0.74vh 0 0.37vh 0;
`;

export const QuestionText = styled.div`
  color: #111;
  font-family: Pretendard;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
  letter-spacing: -0.3px;
  margin-top: 0.37vh;
  text-align: left;
`;

export const Scrollbar = styled.div`
  width: 0.31vw;
  background: #e0e0e0;
  border-radius: 0.16vw;
  position: absolute;
  right: 0.42vw;
  top: 5.56vh;
  bottom: 1.85vh;
`;

export const WaitingMessage = styled.div`
  color: #5c5c5c;
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 22px;
  letter-spacing: -0.375px;
  white-space: pre-line;
`;

export const LockBanner = styled.div`
  border-radius: 24.014px;
  border: 2px solid #fff;
  background: rgba(247, 247, 251, 0.9);
  box-shadow: 0 8px 12px 0 rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(6px);
  display: inline-flex;
  padding: 5px 18px 5px 18px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  align-self: center;
  margin-top: auto;
  margin-bottom: 1.48vh;
  white-space: nowrap;

  color: #5c5c5c;
  font-family: Pretendard;
  font-size: 13px;
  font-weight: 600;
`;

export const QuestionInputContainer = styled.div<{ $isInputting?: boolean; $disabled?: boolean }>`
  display: flex;
  width: 100%;
  max-width: 100%;
  height: 4vh;
  min-height: 4vh;
  padding: 0;
  margin-top: 0.74vh;
  justify-content: ${(props) =>
    props.$isInputting ? "center" : "space-between"};
  align-items: center;
  gap: 0.2vw;

  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 0.42vw;
  transition: all 0.3s ease;
  flex-shrink: 0;
  box-sizing: border-box;
  opacity: ${(props: any) => (props.$disabled ? 0.6 : 1)};
`;

export const QuestionInput = styled.textarea<{ $isInputting?: boolean }>`
  flex: 1;
  margin: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  resize: none;
  min-height: 1.85vh;
  max-height: 4.7vh;
  line-height: 4vh;
  padding: 0 10px;
  height: 100%;
  text-align: left;
  box-sizing: border-box;
  overflow: hidden;
  vertical-align: middle;

  &::placeholder {
    color: #999;

    font-family: Pretendard;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 4vh;
    letter-spacing: -0.35px;
    text-align: left;

    text-indent: 6px;
  }

  &:placeholder-shown {
    text-align: left;
    line-height: 4vh;
  }

  &[disabled] {
    background: #f5f5f5;
    cursor: not-allowed;
    color: #999;
  }
`;

export const SubmitButton = styled.button`
  border: none;
  border-radius: 0.37vh;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 0vw;
  align-self: center;
  background: transparent;

  &:disabled {
    cursor: not-allowed;
  }
`;

export const StatusMessage = styled.div`
  color: #5c5c5c;
  font-family: Pretendard;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: -0.325px;
  margin: 12px 0;
  text-align: center;
`;

export const ErrorMessage = styled(StatusMessage)`
  color: #d14343;
`;

export const EmptyMessage = styled(StatusMessage)`
  color: #767676;
`;
