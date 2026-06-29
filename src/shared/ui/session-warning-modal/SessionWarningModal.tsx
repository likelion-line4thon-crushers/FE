import React from "react";
import CloseIcon from "@/shared/assets/icons/close.svg";
import SessionWarningFace from "@/shared/assets/images/session-warning-face.svg";
import {
  Body,
  CloseBar,
  CloseButton,
  ConfirmButton,
  Content,
  Description,
  Dialog,
  Footer,
  Mascot,
  Overlay,
  TextGroup,
  Title,
} from "./SessionWarningModal.styles";

interface SessionWarningModalProps {
  title: string;
  description: readonly string[];
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

const SessionWarningModal = ({
  title,
  description,
  confirmLabel = "네, 확인했습니다.",
  onConfirm,
  onClose,
}: SessionWarningModalProps) => (
  <Overlay>
    <Dialog role="dialog" aria-modal="true" aria-labelledby="session-warning-title">
      <CloseBar>
        <CloseButton type="button" aria-label="닫기" onClick={onClose}>
          <img src={CloseIcon} alt="" aria-hidden="true" />
        </CloseButton>
      </CloseBar>
      <Content>
        <Body>
          <Mascot src={SessionWarningFace} alt="" aria-hidden="true" />
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
        <Footer>
          <ConfirmButton type="button" onClick={onConfirm}>
            {confirmLabel}
          </ConfirmButton>
        </Footer>
      </Content>
    </Dialog>
  </Overlay>
);

export default SessionWarningModal;
