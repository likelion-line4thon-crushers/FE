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

export const FeedbackListCardWrapper = styled.div`
  position: relative;
  width: 765px;
  height: 650px;
`;

export const RefreshControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

export const RefreshCooldownText = styled.span`
  color: #8a8a8a;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
`;

export const RefreshButton = styled.button`
  width: 34px;
  height: 34px;
  border: 1px solid #d9d9d9;
  border-radius: 50%;
  background: #ffffff;
  color: #5c5c5c;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background-color 0.2s ease;

  &:hover:not(:disabled) {
    border-color: #e74d07;
    color: #e74d07;
    background: #fff7f3;
  }

  &:disabled {
    color: #b5b5b5;
    background: #f4f4f4;
    cursor: not-allowed;
  }
`;

export const SectionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1vw;
`;

export const SectionTitleWrap = styled.div`
  flex: 1;
  min-width: 0;
`;

export const CsvDownloadButton = styled.button`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: 0.5vw;
  padding: 0.9vh 1.2vw;
  border: 0.1vw solid #e74d07;
  border-radius: 0.6vw;
  background: #fff;
  color: #e74d07;
  font-size: clamp(12px, 0.85vw, 14px);
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  img {
    width: clamp(14px, 1vw, 18px);
    height: auto;
  }

  &:hover {
    background: #fff7f3;
  }
`;

export const QuestionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4vh;
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

    font-size: 28px;

    font-weight: 600;
    margin-bottom: 0;
  }

  & > ${SmallDivider} {
    margin-top: 23px;
  }
`;
