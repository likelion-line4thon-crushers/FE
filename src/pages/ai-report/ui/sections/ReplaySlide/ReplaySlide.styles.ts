import styled from "styled-components";

export const ReplaySlideContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-right: 0.8vw;
`;
export const TotalContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  padding: 10px;
  align-items: stretch;
`;

export const LeftBoxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 48%;
`;

export const RightBoxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  padding-right: 70px;

  & > div {
    width: 100% !important;
    height: 405px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
  }
`;

export const NumberCenter = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

export const NumberValue = styled.div`
  color: #434343;
  text-align: center;
  font-size: 80px;
  font-style: normal;
  font-weight: 700;
`;

export const NumberDescription = styled.div`
  margin-top: 12px;
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
`;
