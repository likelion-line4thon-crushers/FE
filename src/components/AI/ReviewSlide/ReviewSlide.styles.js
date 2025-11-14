import styled from "styled-components";
export const ReviewSlideContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding-right: 0.4vw;
`;

export const TotalContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 5px;
  padding: 0;
  align-items: stretch;
`;

export const LeftBoxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 48%;
  margin-right: 20px;
`;

export const RightBoxContainer = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;
  align-items: stretch;
  padding-right: 70px;
`;

export const RatingWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

export const CenterHeader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 25px;

  h2 {
    margin: 0;
    color: #5c5c5c;
    font-family: Pretendard;
    font-size: 28px;
    font-weight: 600;
  }
`;

export const SmallDivider = styled.div`
  width: 90px;
  height: 4px;
  background: #d9d9d9;
  border-radius: 2px;
  margin-top: 13px;
`;

export const RatingRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

export const RatingScore = styled.div`
  font-family: Pretendard;
  font-size: 38px;
  font-weight: 600;
  color: #222;

  span {
    font-size: 16px;
    font-weight: 500;
    color: #777;
    margin-left: 6px;
  }
`;

export const SummaryBoxContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  gap: 1px;

  padding-right: 2.8vw;

  .icon-image {
    width: 64px;
    height: 64px;
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
    margin-top: 25px;
  }
  h2 {
    color: #5c5c5c;

    font-family: Pretendard;
    font-size: 28px;

    font-weight: 600;
    margin-bottom: 0;
  }

  & > ${SmallDivider} {
    margin-top: 23px;
  }
`;
