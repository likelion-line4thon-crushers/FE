import styled from "styled-components";

export const QuestionSlideContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
export const TotalContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  padding: 10px;
`;
export const SummaryBoxContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  gap: 10px;
  padding: 20px;

  .face-image {
    width: 185px;
    height: 105px;
  }
  .rectangle-image {
    width: 90px;
    height: 5px;
  }
  h3 {
    color: #5c5c5c;
    text-align: center;

    font-family: Pretendard;
    font-size: 15px;
    font-style: normal;
    font-weight: 400;
    margin: 0;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
`;
export const LeftBoxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
export const RightBoxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
