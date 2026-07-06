import React from "react";
import styled from "styled-components";
import LiveWaitingIcon from "@/shared/assets/images/live.svg";
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
  flex: 1;
  min-height: clamp(120px, 16vh, 150px);
  padding: clamp(20px, 3vh, 32px) 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(8px, 1.2vh, 14px);
  margin: clamp(10px, 1.4vh, 16px) 0.6vw;
  border-radius: 1vw;
  border: 0.05vw solid #eaeaea;
  background: #fafafa;

  img {
    width: clamp(40px, 3.4vw, 60px);
    height: clamp(40px, 3.4vw, 60px);
    object-fit: contain;
  }
`;

const LiveDesc = styled.div`
  font-size: clamp(12px, 0.8vw, 14px);
  color: #555;
  margin: 0;
`;
