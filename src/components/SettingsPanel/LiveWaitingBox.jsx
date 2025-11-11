import React from "react";
import styled from "styled-components";
import LiveWaitingIcon from "../../assets/images/live.svg";
import LockIcon from "../../assets/images/lock.svg";

const LiveWaitingBox = () => (
    <LiveBox>
        <img src={LiveWaitingIcon} alt="Live 대기 중 아이콘" />
        <LiveDesc>Live 대기 중입니다...</LiveDesc>
        <LiveButton disabled>
            <img src={LockIcon} alt="잠금 아이콘" />
            실시간 질문 기능이 잠겼습니다
        </LiveButton>
    </LiveBox>
);

export default LiveWaitingBox;

/* ===============================
   Styled Components
=============================== */
const LiveBox = styled.div`
  flex-shrink: 0;
  padding: 8.5vh 0 4vh;
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

const LiveButton = styled.button`
  margin: 0.7vh;
  gap: 0.4vw;
  white-space: nowrap;
  color: #5c5c5c;
  text-align: center;
  font-size: clamp(10px, 0.65vw, 11px);
  font-weight: 500;
  line-height: 1;
  display: inline-flex;
  padding: 0.8vh 1.8vw;
  justify-content: center;
  align-items: center;
  border-radius: 1.2vw;
  border: 0.1vw solid #fff;
  background: rgba(247, 247, 251, 0.9);
  box-shadow: 0 0.4vh 0.6vh rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(0.5vh);

  img {
    display: block;
    vertical-align: middle;
    width: 1vw;
    height: 1vw;
  }
`;
