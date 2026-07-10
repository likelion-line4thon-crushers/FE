import React from "react";
import CloseIcon from "@/shared/assets/icons/close.svg";
import SessionWarningFace from "@/shared/assets/images/session-warning-face.svg";
import {
  Body,
  ButtonRow,
  CloseBar,
  CloseButton,
  ConfirmButton,
  Content,
  Description,
  Dialog,
  Footer,
  Mascot,
  Overlay,
  SecondaryButton,
  TextGroup,
  Title,
} from "./SessionWarningModal.styles";

interface SessionWarningModalProps {
  title: string;
  description: readonly string[];
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  /** 마스코트 이미지 경로. 미지정 시 기본 경고 얼굴을 사용. */
  mascot?: string;
  /** 보조 버튼 라벨 — onSecondary 와 함께 넘기면 2버튼 레이아웃으로 전환. */
  secondaryLabel?: string;
  onSecondary?: () => void;
}

const SessionWarningModal = ({
  title,
  description,
  confirmLabel = "네, 확인했습니다.",
  onConfirm,
  onClose,
  mascot = SessionWarningFace,
  secondaryLabel,
  onSecondary,
}: SessionWarningModalProps) => {
  const hasSecondary = Boolean(secondaryLabel && onSecondary);

  return (
    <Overlay>
      <Dialog role="dialog" aria-modal="true" aria-labelledby="session-warning-title">
        <CloseBar>
          <CloseButton type="button" aria-label="닫기" onClick={onClose}>
            <img src={CloseIcon} alt="" aria-hidden="true" />
          </CloseButton>
        </CloseBar>
        <Content>
          <Body>
            <Mascot src={mascot} alt="" aria-hidden="true" />
            <TextGroup>
              <Title id="session-warning-title">{title}</Title>
              <Description>
                {description.map((line, index) => (
                  <React.Fragment key={line}>
                    {index > 0 && <br />}
                    {line}
                  </React.Fragment>
                ))}
              </Description>
            </TextGroup>
          </Body>
          <Footer $hasSecondary={hasSecondary}>
            {hasSecondary ? (
              <ButtonRow>
                <SecondaryButton type="button" onClick={onSecondary}>
                  {secondaryLabel}
                </SecondaryButton>
                <ConfirmButton type="button" onClick={onConfirm}>
                  {confirmLabel}
                </ConfirmButton>
              </ButtonRow>
            ) : (
              <ConfirmButton type="button" onClick={onConfirm}>
                {confirmLabel}
              </ConfirmButton>
            )}
          </Footer>
        </Content>
      </Dialog>
    </Overlay>
  );
};

export default SessionWarningModal;
