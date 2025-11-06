import React from "react";
import styled from "styled-components";

/**
 * 공용 슬라이드 컨테이너
 * - 슬라이드 이미지를 감싸는 기본 박스
 * - 발표 준비/진행 페이지 모두에서 재사용 가능
 */
const SlideContainer = ({ src, alt = "슬라이드 이미지" }) => {
    return (
        <SlideBox>
            <img
                src={src}
                alt={alt}
                style={{
                    // maxWidth: "100%",
                    // height: "auto",
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    borderRadius: "0.6vw",
                    border: "0.05vw solid #eee",
                }}
            />
        </SlideBox>
    );
};

export default SlideContainer;

/* ===============================
   Styled Components
=============================== */
const SlideBox = styled.div`
  background-color: #ffffff;
  border-radius: 0.6vw;
  border: 0.05vw solid #ddd;
  max-width: 67.7vw; /* 1300px 기준 */
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  aspect-ratio: 16 / 9; /* 16:9 비율 유지 */
`;
