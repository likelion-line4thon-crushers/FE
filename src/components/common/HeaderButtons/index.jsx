import React from "react";
import styled from "styled-components";
import ShareIconDefault from "../../../assets/images/share.png";
import PlayIconDefault from "../../../assets/images/play2.svg";
import ExitIconDefault from "../../../assets/images/getout.png";

/* === 공통 Pill형 버튼 베이스 === */
const BasePillButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.1vw;
  padding: 0.8vh 0.6vw;
  border-radius: 1vw;
  border: 1px solid #e6e6e6;
  background: #fff;
  color: #5c5c5c;
  font-family: Pretendard, sans-serif;
  font-size: clamp(12px, 0.9vw, 16px);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  box-sizing: border-box;

  img {
    width: 0.9vw;
    height: 0.9vw;
    margin-right: 0.2vw;
    object-fit: contain;
  }

  &:hover {
    background: #f8f8f8;
    transform: translateY(-1px);
  }

  &:active {
    background: #f0f0f0;
    transform: translateY(0);
  }
`;

/* === 어두운 버튼 (나가기 등) === */
const ExitPillButton = styled(BasePillButton)`
  background: #303030;
  border: 1px solid #303030;
  color: #fff;
  font-weight: 600;

  &:hover {
    background: #000;
  }

  &:active {
    background: #1a1a1a;
  }
`;

/* === 오렌지 버튼 (세션 시작용) === */
const OrangePillButton = styled(BasePillButton)`
  background: #e8541e;
  border: 1px solid #e8541e;
  color: #fff;
  font-weight: 600;

  &:hover {
    background: #cc3f13;
  }

  &:active {
    background: #b83710;
  }
`;

/* === 버튼 콘텐츠 렌더 공통 함수 === */
const renderContent = (iconSrc, alt, children) => (
  <>
    {iconSrc && <img src={iconSrc} alt={alt} />}
    {children}
  </>
);

/* === 공유하기 버튼 === */
export const ShareButton = React.forwardRef(
  (
    {
      children = "공유하기",
      iconSrc = ShareIconDefault,
      iconAlt = typeof children === "string" ? children : "공유하기",
      ...props
    },
    ref
  ) => (
    <BasePillButton ref={ref} {...props}>
      {renderContent(iconSrc, iconAlt, children)}
    </BasePillButton>
  )
);
ShareButton.displayName = "ShareButton";

/* === 세션 시작 버튼 === */
export const StartSessionButton = React.forwardRef(
  (
    {
      children = "세션 시작",
      iconSrc = PlayIconDefault,
      iconAlt = typeof children === "string" ? children : "세션 시작",
      ...props
    },
    ref
  ) => (
    <OrangePillButton ref={ref} {...props}>
      {renderContent(iconSrc, iconAlt, children)}
    </OrangePillButton>
  )
);

StartSessionButton.displayName = "StartSessionButton";


/* === 나가기 버튼 === */
export const ExitButton = React.forwardRef(
  (
    {
      children = "나가기",
      iconSrc = ExitIconDefault,
      iconAlt = typeof children === "string" ? children : "나가기",
      ...props
    },
    ref
  ) => (
    <ExitPillButton ref={ref} {...props}>
      {renderContent(iconSrc, iconAlt, children)}
    </ExitPillButton>
  )
);
ExitButton.displayName = "ExitButton";

export { BasePillButton };
