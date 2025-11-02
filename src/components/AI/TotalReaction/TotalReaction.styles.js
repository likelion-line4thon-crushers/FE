import styled from "styled-components";

export const TotalReactionContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;

  img {
    width: 6vw;
    height: 30px;
  }

  .h1 {
    font-family: Pretendard;
    font-size: 40px;
    font-style: normal;
    font-weight: 600;
    text-align: center;
  }
  .h2 {
    color: #5c5c5c;
    font-family: Pretendard;
    font-size: 20px;
    font-style: normal;
    font-weight: 400;
    text-align: center;
  }
`;
export const ContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
`;
export const EmojiSummaryContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;

  border-radius: 12px;
  border: 1px solid #eaeaea;

  background: #fafafa;

  .div {
    justify-content: flex-start;
  }
`;
export const QuestionSummaryContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
  border-radius: 12px;
  border: 1px solid #eaeaea;

  background: #fafafa;
`;
export const FocusSummaryContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
  border-radius: 12px;
  border: 1px solid #eaeaea;

  background: #fafafa;
`;
