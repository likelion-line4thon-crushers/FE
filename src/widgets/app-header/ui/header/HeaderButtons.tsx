import React from "react";
import styled from "styled-components";
import ShareIconDefault from "@/shared/assets/images/share.png";
import PlayIconDefault from "@/shared/assets/images/play2.svg";
import ExitIconDefault from "@/shared/assets/images/getout.png";
import FilesIconDefault from "@/shared/assets/images/files.svg";
import DownloadCsvIconDefault from "@/shared/assets/images/AI/download-csv.svg";
import HelpIconDefault from "@/shared/assets/images/help.svg";

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
  font-size: clamp(11px, 0.8vw, 13px);
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

  &:disabled {
    background: #e0e0e0;
    color: #9e9e9e;
    cursor: not-allowed;
  }
  &:disabled:hover {
    background: #e0e0e0;
  }
`;

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

const EndSessionButton = styled(BasePillButton)`
  background: #303030;
  border: 1px solid #cacaca;
  color: #fff;
  font-weight: 400;
  font-size: clamp(11px, 0.85vw, 15px);

  &:hover {
    background: #404040;
  }
  &:active {
    background: #1a1a1a;
  }
`;

const RoundedSquareIcon = styled.div`
  width: 0.6vw;
  height: 0.6vw;
  background: #e74d07;
  border-radius: 0.1vw;
  margin-right: 0.2vw;
  flex-shrink: 0;
`;

const renderContent = (iconSrc: string | undefined, alt: string, children: React.ReactNode) => (
  <>
    {iconSrc && <img src={iconSrc} alt={alt} />}
    {children}
  </>
);

// * React 19: ref is a regular prop — no forwardRef needed

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
  iconSrc?: string;
  iconAlt?: string;
}

interface StartSessionButtonProps extends ButtonProps {
  isEndSession?: boolean;
}

export const ShareButton = ({
  children = "공유하기",
  iconSrc = ShareIconDefault,
  iconAlt = typeof children === "string" ? children : "공유하기",
  ref,
  ...props
}: ButtonProps) => (
  <BasePillButton ref={ref} {...props}>
    {renderContent(iconSrc, iconAlt, children)}
  </BasePillButton>
);

export const FeedbackQuestionButton = ({
  children = "세션 후기 질문 작성",
  iconSrc = FilesIconDefault,
  iconAlt = typeof children === "string" ? children : "세션 후기 질문 작성",
  ref,
  ...props
}: ButtonProps) => (
  <BasePillButton ref={ref} {...props}>
    {renderContent(iconSrc, iconAlt, children)}
  </BasePillButton>
);

export const CsvDownloadButton = ({
  children = "CSV 파일 다운로드",
  iconSrc = DownloadCsvIconDefault,
  iconAlt = typeof children === "string" ? children : "CSV 파일 다운로드",
  ref,
  ...props
}: ButtonProps) => (
  <BasePillButton ref={ref} {...props}>
    {renderContent(iconSrc, iconAlt, children)}
  </BasePillButton>
);

export const StartSessionButton = ({
  children = "세션 시작",
  iconSrc = PlayIconDefault,
  iconAlt = typeof children === "string" ? children : "세션 시작",
  isEndSession: isEndSessionProp,
  ref,
  ...props
}: StartSessionButtonProps) => {
  const isEndSession =
    typeof isEndSessionProp === "boolean" ? isEndSessionProp : children === "세션 종료";
  const ButtonComponent = isEndSession ? EndSessionButton : OrangePillButton;

  return (
    <ButtonComponent ref={ref} {...props}>
      {isEndSession ? (
        <>
          <RoundedSquareIcon />
          {children}
        </>
      ) : (
        renderContent(iconSrc, iconAlt, children)
      )}
    </ButtonComponent>
  );
};

export const ExitButton = ({
  children = "나가기",
  iconSrc = ExitIconDefault,
  iconAlt = typeof children === "string" ? children : "나가기",
  ref,
  ...props
}: ButtonProps) => (
  <ExitPillButton ref={ref} {...props}>
    {renderContent(iconSrc, iconAlt, children)}
  </ExitPillButton>
);

export const TourHelpButton = ({
  children = "퀵 가이드",
  iconSrc = HelpIconDefault,
  iconAlt = typeof children === "string" ? children : "퀵 가이드",
  ref,
  ...props
}: ButtonProps) => (
  <BasePillButton ref={ref} {...props}>
    {renderContent(iconSrc, iconAlt, children)}
  </BasePillButton>
);

export { BasePillButton };
