// src/components/SettingsPanel/LiveStatusText.jsx
import React from "react";
import styled from "styled-components";

const LiveStatusText = () => {
    return <LiveDesc>Live 대기 중입니다...</LiveDesc>;
};

export default LiveStatusText;

/* 스타일 */
const LiveDesc = styled.div`
  font-size: clamp(12px, 0.8vw, 14px);
  color: #555;
  margin: 1.5vh 0;
`;
