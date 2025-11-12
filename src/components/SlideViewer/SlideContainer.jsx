import React from "react";
import styled, { css } from "styled-components";
import { HighlightedSlideStyles } from "./SlideViewer.styles";

/**
 * 공용 슬라이드 컨테이너
 * - 슬라이드 이미지를 감싸는 기본 박스
 * - 발표 준비/진행 페이지 모두에서 재사용 가능
 */
const SlideContainer = ({
  src,
  alt = "슬라이드 이미지",
  stamps = [],
  showStamps = true,
  highlight = false,
}) => {
  const imageBorderColor = highlight ? "#ffc551" : "#eee";

  return (
    <SlideBox highlight={highlight}>
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          borderRadius: "0.6vw",
          border: `0.05vw solid ${imageBorderColor}`,
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
      {showStamps &&
        Array.isArray(stamps) &&
        stamps.map((stamp, index) => (
          <StampImage
            key={stamp.id || `${stamp.xPct}-${stamp.yPct}-${index}`}
            src={stamp.src}
            style={{
              top: `${stamp.yPct}%`,
              left: `${stamp.xPct}%`,
            }}
            alt="reaction"
          />
        ))}
    </SlideBox>
  );
};

export default SlideContainer;

/* ===============================
   Styled Components
=============================== */
const SlideBox = styled.div`
  position: relative;
  background-color: #ffffff;
  border-radius: 0.6vw;
  border: 0.05vw solid #ddd;
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  aspect-ratio: 16 / 9; /* 16:9 비율 유지 */

  ${({ highlight }) => (highlight ? HighlightedSlideStyles : css``)}
`;

const StampImage = styled.img`
  position: absolute;
  transform: translate(-50%, -50%);
  width: 2.5vw;
  max-width: 48px;
  min-width: 32px;
  height: auto;
  pointer-events: none;
`;
