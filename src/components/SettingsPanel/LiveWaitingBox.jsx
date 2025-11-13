import React from "react";
import styled from "styled-components";
import LiveWaitingIcon from "../../assets/images/live.svg";
import LiveLockButton from "./LiveLockButton";

const LiveWaitingBox = ({ isQuestionEnabled = true }) => (
    <LiveBox>
        <img src={LiveWaitingIcon} alt="Live 대기 중 아이콘" />
        <LiveDesc>Live 대기 중입니다...</LiveDesc>
        {!isQuestionEnabled && <LiveLockButton />}
    </LiveBox>
);

export default LiveWaitingBox;

/* ===============================
   Styled Components
=============================== */
const LiveBox = styled.div`
  flex-shrink: 0;
  padding: 8.5vh 0 4vh;
  min-height: 28vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2vh 0.6vw;
  border-radius: 1vw;
  border: 0.05vw solid #eaeaea;
  background: #fafafa;
`;

const LiveDesc = styled.div`
  font-size: clamp(12px, 0.8vw, 14px);
  color: #555;
  margin: 1.5vh 0;
`;

