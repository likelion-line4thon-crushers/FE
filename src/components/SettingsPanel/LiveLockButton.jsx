// src/components/SettingsPanel/LiveLockButton.jsx
import React from "react";
import styled from "styled-components";
import LockIcon from "../../assets/images/lock.svg";

const LiveLockButton = () => {
    return (
        <LiveButton disabled>
            <img src={LockIcon} alt="잠금 아이콘" />
            실시간 질문 기능이 잠겼습니다
        </LiveButton>
    );
};

export default LiveLockButton;

/* 스타일 */
const LiveButton = styled.button`
  margin: 0.7vh;
  gap: 0.3vw;
  white-space: nowrap;
  color: #5c5c5c;
  text-align: center;
  font-size: clamp(10px, 0.65vw, 11px);
  font-weight: 400;
  line-height: 1;
  display: inline-flex;
  padding: 1vh 1.2vw;
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
